/* src/render_lighting/50_lights.js */
/* =====================================================================
 * RENDER_LIGHTING — VIRTUAL LIGHTS (tiled forward "pools of light")
 *
 * The night city is read through pools of warm light: a street lamp on
 * the kerb, a burning barrel, a shop pendant over a till, a flickering tube
 * in a subway. Real three.js lights cost every lit fragment a loop
 * iteration and a program recompile when their count changes, so the game
 * has only atmosphere's pool of 3 (2 of them lent to the nearest fixtures).
 *
 * Here up to 255 lights around the camera are evaluated per fragment from a
 * camera-centred TILE GRID (40 × 40 tiles of 8 m = 320 m; ≤ 8 lights per
 * tile, fewer on reduced tiers) packed with the light records into ONE float
 * texture (00_core.js). The patched light loop runs each light through the
 * material's own RE_Direct → diffuse AND specular (wet asphalt glints under
 * a lamp, NPCs and cars pick up the warm light, not only the ground).
 * Unshadowed; lamp heads have a soft downward cone. World materials only.
 *
 * Sources (no module has to do anything):
 *   • props' GlowField points (`props_glowfield`: lamp posts, fire barrels,
 *     car fires, shop pendants, campfires…) — read from its geometry;
 *   • atmosphere glow sprites (G.fx.glowSprite: fires, lamps, neon…) and
 *     fixtures (G.atmos.addFixtureLight) — tracked through thin wrappers of
 *     those public functions (passthrough, results untouched);
 *   • interior lamps found by the interior bake's emissive-geometry scan;
 *   • G.rlight.addLight(pos, color, opts) for anything else;
 *   • COMBAT FLASHES (round 2b): every G.fx.flash call (muzzle flashes of
 *     every gun in the fight, laser / plasma impacts, explosions, lightning)
 *     also becomes a short-lived virtual light with atmosphere's own
 *     intensity curve. Atmosphere's pool has only 3 real PointLights, so in a
 *     firefight most shots used to light nothing; now every one does. While
 *     the pool's real light still serves a flash, its virtual twin steps back
 *     (no double light); when the slot is stolen or was never granted, the
 *     virtual one carries it. Ambient-priority flashes (fires) are skipped —
 *     their glows are sources already.
 * Outdoors, lamps fade in with atmosphere's night factor; fires burn by day
 * too (weaker). Candidates closer than 1.2 m are merged. Where atmosphere
 * has lent one of its real PointLights to a fixture, the matching virtual
 * light steps back (no double light).
 * Budget: gather + sort every 4th frame (≤ ~5k candidates, < 0.3 ms), per
 * frame only the light colours (flicker) are rewritten; one 256×15 float
 * texture upload (61 KB). GPU: 1 tap per lit world fragment when its tile
 * is empty, + 2 taps and one RE_Direct per light in range.
 * Off: ?rlvl=0 (compiled out), RL.setLights(false) (persisted nrc_rl_vl;
 * runtime off = uniform branch, compiled out on the next load).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.rlight || !G.rlight._) return;
  const RL = G.rlight,
    R = RL._,
    U = R.uniforms,
    VL = R.vl;
  if (!VL) return;

  const RSEL = 150; // candidate radius around the camera (m)
  const PER_TIER = [8, 6, 3]; // lights per tile by quality tier
  const MERGE = 1.2; // candidates closer than this are one light
  // brightness vs atmosphere's pooled fixtures (same convention, ≈ illuminance at ⅓ range): lamp pools must read
  // clearly brighter than the moonlit street around them, interiors already carry baked pools
  let GAIN_OUT = 11,
    GAIN_IN = 2.2;
  let GAIN_T = 1; // combat flashes: same units as atmosphere's PointLights (× π with legacy lights)
  try {
    const q = new URLSearchParams(location.search);
    if (q.get("rlvlgain")) GAIN_OUT = GAIN_IN = +q.get("rlvlgain");
  } catch (e) {
    /* ignore */
  }
  const S = {
    frame: 0,
    cands: 0,
    sel: 0,
    tilesUsed: 0,
    maxTile: 0,
    gatherMs: 0,
    supp: 0,
    sources: {},
  };

  // ------------------------------------------------------------------
  // source tracking
  // ------------------------------------------------------------------
  const glows = []; // atmosphere glow proxies
  const fixtures = []; // {x,y,z,color,i,range,always,flicker,removed}
  const apiLights = [];
  let glowField = null,
    glowFieldT = 0;
  let poolLights = null; // atmosphere's PointLight pool (read-only)

  // combat flashes mirrored from G.fx.flash (transient virtual lights)
  const trans = [];
  const TRANS_MAX = 64;
  let transDirty = false;
  function addTransient(pos, color, intensity, dur, opts, h) {
    opts = opts || {};
    if (!pos || !isFinite(pos.x)) return;
    intensity = intensity === undefined ? 2 : +intensity;
    const prio =
      opts.priority !== undefined ? opts.priority : intensity >= 6 ? 2 : 1;
    if (prio < 1 || !(intensity > 0)) return; // ambient flashes (fires): their glow sprites are sources already
    dur = dur === undefined ? 0.12 : Math.max(0.02, +dur);
    const range = opts.range || 6 + 4 * Math.sqrt(Math.max(0.1, intensity));
    if (trans.length >= TRANS_MAX) trans.shift();
    const T = {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      color: new THREE.Color(color === undefined ? 0xffaa55 : color),
      i: intensity,
      range,
      dur,
      t: 0,
      curve: opts.curve || "exp",
      flicker: opts.flicker || 0,
      follow: opts.follow || null,
      h: h || null,
      seed: Math.random() * 100,
    };
    trans.push(T);
    transDirty = true;
    S.transTotal = (S.transTotal | 0) + 1;
  }
  function transK(T) {
    const u = Math.min(1, T.t / Math.max(1e-3, T.dur));
    if (u >= 1) return 0;
    let k =
      T.curve === "linear"
        ? 1 - u
        : T.curve === "hold"
          ? u < 0.7
            ? 1
            : 1 - (u - 0.7) / 0.3
          : Math.exp(-u * 4) * (1 - u);
    if (T.flicker)
      k *= 1 - T.flicker * 0.5 * (1 + Math.sin(T.t * 47) * Math.sin(T.t * 23));
    return Math.max(0, k);
  }
  function stepTransients(dt) {
    for (let j = trans.length - 1; j >= 0; j--) {
      const T = trans[j];
      T.t += dt;
      if (T.t >= T.dur) {
        trans.splice(j, 1);
        transDirty = true;
        continue;
      }
      const f = T.follow;
      if (f) {
        try {
          if (f.isVector3) {
            T.x = f.x;
            T.y = f.y;
            T.z = f.z;
          } else if (f.getWorldPosition) {
            f.getWorldPosition(_v);
            T.x = _v.x;
            T.y = _v.y;
            T.z = _v.z;
          }
        } catch (e) {
          T.follow = null;
        }
      }
    }
  }

  function trackGlow(o) {
    if (o && !o._rlTracked) {
      o._rlTracked = true;
      glows.push(o);
    }
  }
  function wrapSources() {
    const FX = G.fx,
      A = G.atmos;
    try {
      if (
        FX &&
        typeof FX.glowSprite === "function" &&
        !FX.glowSprite._rlWrap &&
        !G.isStub("atmos")
      ) {
        const orig = FX.glowSprite;
        const w = function () {
          const o = orig.apply(this, arguments);
          try {
            trackGlow(o);
          } catch (e) {
            /* never break the caller */
          }
          return o;
        };
        w._rlWrap = true;
        FX.glowSprite = w;
      }
      if (
        FX &&
        typeof FX.flash === "function" &&
        !FX.flash._rlWrap &&
        !G.isStub("atmos")
      ) {
        const origFl = FX.flash;
        const wfl = function (pos, color, intensity, dur, opts) {
          const h = origFl.apply(this, arguments);
          try {
            if (enabled) addTransient(pos, color, intensity, dur, opts, h);
          } catch (e) {
            /* never break the caller */
          }
          return h;
        };
        wfl._rlWrap = true;
        FX.flash = wfl;
      }
      if (
        A &&
        typeof A.addFixtureLight === "function" &&
        !A.addFixtureLight._rlWrap &&
        !G.isStub("atmos")
      ) {
        const origF = A.addFixtureLight;
        const wf = function (pos, color, opts) {
          const h = origF.apply(this, arguments);
          try {
            opts = opts || {};
            const p =
              pos && pos.isVector3
                ? pos
                : Array.isArray(pos)
                  ? { x: pos[0], y: pos[1], z: pos[2] }
                  : pos;
            if (p && isFinite(p.x)) {
              const f = {
                x: p.x,
                y: p.y,
                z: p.z,
                color: new THREE.Color(color === undefined ? 0xffe2b0 : color),
                i: opts.intensity || 1.2,
                range: opts.range || 8,
                always: !!opts.always,
                flicker: opts.flicker || 0,
                removed: false,
                seed: Math.random() * 100,
              };
              fixtures.push(f);
              if (h && typeof h.remove === "function") {
                const rm = h.remove;
                h.remove = function () {
                  f.removed = true;
                  return rm.apply(this, arguments);
                };
              }
            }
          } catch (e) {
            /* ignore */
          }
          return h;
        };
        wf._rlWrap = true;
        A.addFixtureLight = wf;
      }
    } catch (e) {
      G.reportError("render_lighting/lights-wrap", e);
    }
  }
  /** glows created before the wrappers existed (atmosphere's own init) */
  function scanExisting() {
    if (!G.scene) return;
    G.scene.traverse((o) => {
      if (o.glowSize !== undefined && o.material && o.material.isFakeMaterial)
        trackGlow(o);
      if (!poolLights && o.isPointLight && /^atmos_flash_/.test(o.name || "")) {
        /* collected below */
      }
    });
    poolLights = [];
    G.scene.traverse((o) => {
      if (o.isPointLight && /^atmos_flash_/.test(o.name || ""))
        poolLights.push(o);
    });
  }
  function findGlowField(rd) {
    if (glowField && glowField.parent) return glowField;
    glowFieldT -= rd;
    if (glowFieldT > 0) return null;
    glowFieldT = 8;
    glowField = G.scene ? G.scene.getObjectByName("props_glowfield") : null;
    return glowField;
  }

  /** Public: add a virtual light. opts {intensity=1.2 (≈ illuminance at ⅓ range), range=10, cone=0 (0..1 downward),
   *  flicker=0, fire=false, always=false (outdoors: also by day)} → {setPos(v), setColor(c), setIntensity(i), remove()} */
  RL.addLight = function (pos, color, opts) {
    opts = opts || {};
    const L = {
      x: pos.x,
      y: pos.y,
      z: pos.z,
      color: new THREE.Color(color === undefined ? 0xffd9a0 : color),
      i: opts.intensity || 1.2,
      range: opts.range || 10,
      cone: opts.cone || 0,
      flicker: opts.flicker || 0,
      fire: !!opts.fire,
      always: !!opts.always,
      removed: false,
      seed: Math.random() * 100,
    };
    apiLights.push(L);
    return {
      setPos(v) {
        L.x = v.x;
        L.y = v.y;
        L.z = v.z;
        return this;
      },
      setColor(c) {
        L.color.set(c);
        return this;
      },
      setIntensity(i) {
        L.i = i;
        return this;
      },
      remove() {
        L.removed = true;
        const k = apiLights.indexOf(L);
        if (k >= 0) apiLights.splice(k, 1);
      },
    };
  };

  // ------------------------------------------------------------------
  // gather → merge → select
  // ------------------------------------------------------------------
  const pool = []; // candidate records (reused)
  let nC = 0;
  const merge = new Map();
  function cand() {
    let c = pool[nC];
    if (!c)
      pool[nC] = c = {
        x: 0,
        y: 0,
        z: 0,
        r: 0,
        g: 0,
        b: 0,
        i: 0,
        range: 0,
        cone: 0,
        flicker: 0,
        fire: 0,
        seed: 0,
        score: 0,
        key: 0,
        dead: false,
        tr: null,
      };
    c.dead = false;
    c.tr = null;
    nC++;
    return c;
  }
  let camX = 0,
    camY = 0,
    camZ = 0,
    night = 1,
    inside = false,
    XMIN = 1e9;
  function isFire(r, g, b) {
    return r > 0.05 && g / r < 0.55 && b / r < 0.3;
  }
  /** add a candidate (returns false when out of range / too weak) */
  function push(
    x,
    y,
    z,
    r,
    g,
    b,
    i,
    range,
    cone,
    flicker,
    fire,
    seed,
    interior,
    always,
  ) {
    if (interior !== inside) return null;
    const dx = x - camX,
      dz = z - camZ,
      d2 = dx * dx + dz * dz;
    if (d2 > RSEL * RSEL) return null;
    let vis = 1;
    if (!interior && !always) vis = fire ? 0.4 + 0.6 * night : night;
    const e = i * vis * Math.max(r, g, b);
    if (e < 0.03) return null;
    // merge with a neighbour (same lamp seen by two sources: keep the stronger, it takes the larger range)
    const key =
      (Math.floor(x / MERGE) * 73856093) ^
      (Math.floor(y / MERGE) * 19349663) ^
      (Math.floor(z / MERGE) * 83492791);
    const prev = merge.get(key);
    if (prev) {
      if (prev.score >= e) {
        if (range > prev.range) prev.range = range;
        return null;
      }
      prev.dead = true;
    }
    const c = cand();
    c.x = x;
    c.y = y;
    c.z = z;
    c.r = r * vis;
    c.g = g * vis;
    c.b = b * vis;
    c.i = i;
    c.range = prev ? Math.max(range, prev.range) : range;
    c.cone = cone;
    c.flicker = flicker;
    c.fire = fire ? 1 : 0;
    c.seed = seed;
    c.key = key;
    c.score = e; // replaced by the view score below
    merge.set(key, c);
    return c;
  }

  const _v = new THREE.Vector3(),
    _s = new THREE.Vector3();
  let visFrame = 0;
  function effVisible(o) {
    let p = o,
      n = 0;
    while (p) {
      if (!p.visible) return false;
      if (p === G.scene) return true;
      p = p.parent;
      if (++n > 32) return false;
    }
    return false;
  }
  function gatherGlowField(rd) {
    const gf = findGlowField(rd);
    if (!gf || !gf.visible) return 0;
    const geo = gf.geometry,
      P = geo.attributes.position,
      C = geo.attributes.gcolor,
      Z = geo.attributes.size,
      F = geo.attributes.fl;
    if (!P || !C || !Z) return 0;
    const n = Math.min(
      P.count,
      geo.drawRange.count === Infinity ? P.count : geo.drawRange.count,
    );
    const pa = P.array,
      ca = C.array,
      za = Z.array,
      fa = F ? F.array : null;
    const e = gf.matrixWorld.elements,
      ident =
        e[0] === 1 &&
        e[5] === 1 &&
        e[10] === 1 &&
        e[12] === 0 &&
        e[13] === 0 &&
        e[14] === 0;
    let k = 0;
    for (let i = 0; i < n; i++) {
      const s = za[i];
      if (s < 1.6) continue; // indicator LEDs, tiny bulbs: glow only
      let x = pa[i * 3],
        y = pa[i * 3 + 1],
        z = pa[i * 3 + 2];
      if (!ident) {
        _v.set(x, y, z).applyMatrix4(gf.matrixWorld);
        x = _v.x;
        y = _v.y;
        z = _v.z;
      }
      // props' "interior" flag (fl ≥ 2) = a shop light that ignores daylight (storefront shells stand in the city)
      const fl = fa ? fa[i * 2] : 0,
        always = fl >= 1.5,
        fk = always ? fl - 2 : fl,
        interior = x >= XMIN;
      const r = ca[i * 3],
        g = ca[i * 3 + 1],
        b = ca[i * 3 + 2];
      const fire = isFire(r, g, b) && fk > 0.1;
      const range = Math.min(15, Math.max(6, 3 + s * 1.8));
      const inten = Math.min(1.5, Math.max(0.5, 0.35 + s * 0.16));
      // a lamp head well above the ground (lamp posts, pendants) throws its light down
      const cone = !fire && s >= 3 && s <= 7.5 ? (always ? 0.35 : 0.7) : 0;
      push(
        x,
        y - (cone > 0 ? 0.35 : 0),
        z,
        r,
        g,
        b,
        always ? inten * 0.8 : inten,
        range,
        cone,
        fk,
        fire,
        fa ? fa[i * 2 + 1] * 100 : i,
        interior,
        always,
      );
      k++;
    }
    return k;
  }
  function gatherGlows() {
    let k = 0;
    visFrame++;
    for (let j = glows.length - 1; j >= 0; j--) {
      const o = glows[j];
      if (o._disposed) {
        glows.splice(j, 1);
        o._rlTracked = false;
        continue;
      }
      if (!o.parent || o.noLight) continue;
      const e = o.matrixWorld.elements;
      const x = e[12],
        y = e[13],
        z = e[14];
      const dx = x - camX,
        dz = z - camZ;
      if (dx * dx + dz * dz > RSEL * RSEL) continue;
      if (o._rlVisF === undefined || (visFrame + j) % 8 === 0) {
        o._rlVis = effVisible(o);
        o._rlVisF = visFrame;
      }
      if (!o._rlVis) continue;
      _s.set(e[0], e[1], e[2]);
      const size = (o.glowSize || 1) * _s.length();
      if (size < 1.0) continue;
      const c = o.material && o.material.color;
      if (!c) continue;
      const gi =
        Math.min(
          1.5,
          Math.max(0.2, o.glowIntensity === undefined ? 1 : o.glowIntensity),
        ) * (o.material.opacity === undefined ? 1 : o.material.opacity);
      const fire = isFire(c.r, c.g, c.b) && (o.flicker || 0) > 0.05;
      const interior = x >= XMIN;
      push(
        x,
        y - 0.3,
        z,
        c.r,
        c.g,
        c.b,
        Math.min(1.4, Math.max(0.4, 0.3 + size * 0.25)) * gi,
        Math.min(15, Math.max(6, 4 + size * 2.5)),
        0,
        o.flicker || 0,
        fire,
        o._seed || j,
        interior,
        false,
      );
      k++;
    }
    return k;
  }
  function gatherFixtures() {
    let k = 0;
    for (let j = fixtures.length - 1; j >= 0; j--) {
      const f = fixtures[j];
      if (f.removed) {
        fixtures.splice(j, 1);
        continue;
      }
      const c = f.color;
      push(
        f.x,
        f.y,
        f.z,
        c.r,
        c.g,
        c.b,
        f.i,
        f.range,
        0,
        f.flicker,
        isFire(c.r, c.g, c.b) && f.flicker > 0.05,
        f.seed,
        f.x >= XMIN,
        f.always,
      );
      k++;
    }
    for (const L of apiLights) {
      if (L.removed) continue;
      const c = L.color;
      push(
        L.x,
        L.y,
        L.z,
        c.r,
        c.g,
        c.b,
        L.i,
        L.range,
        L.cone,
        L.flicker,
        L.fire,
        L.seed,
        L.x >= XMIN,
        L.always,
      );
      k++;
    }
    return k;
  }
  function gatherTransients() {
    let k = 0;
    for (const T of trans) {
      const c = T.color;
      // combat light wins its tiles (×4 score): a shot in the dark must light the alley it is fired in
      const cd = push(
        T.x,
        T.y,
        T.z,
        c.r,
        c.g,
        c.b,
        T.i * 4,
        T.range,
        0,
        0,
        false,
        T.seed,
        T.x >= XMIN,
        true,
      );
      if (cd) {
        cd.tr = T;
        cd.i = T.i;
        k++;
      }
    }
    return k;
  }
  function gatherInterior() {
    if (!inside || !R.cellLampsAt) return 0;
    const lamps = R.cellLampsAt(camX, camZ);
    if (!lamps) return 0;
    let k = 0;
    for (const L of lamps) {
      const p = L.pos,
        c = L.color;
      // bake lamps: hue-normalised colour; ceiling fixtures shine down
      push(
        p[0],
        p[1],
        p[2],
        c.r,
        c.g,
        c.b,
        (L.intensity || 1.2) * 0.75,
        L.range || 9,
        L.down ? 0.3 : 0,
        0,
        false,
        k * 7.1,
        true,
        true,
      );
      k++;
    }
    return k;
  }

  const sel = [];
  function gather(rd) {
    const t0 = performance.now();
    nC = 0;
    merge.clear();
    const cam = G.camera;
    if (!cam) return;
    camX = cam.position.x;
    camY = cam.position.y;
    camZ = cam.position.z;
    inside = R.interior();
    XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 1e9;
    night = 1;
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.nightFactor)
        night = Math.max(0, Math.min(1, G.atmos.nightFactor()));
    } catch (e) {
      night = 1;
    }
    const src = S.sources;
    src.props = gatherGlowField(rd);
    src.glows = gatherGlows();
    src.fixtures = gatherFixtures();
    src.interior = gatherInterior();
    src.combat = gatherTransients();
    // view score: how much this light matters from here (close + bright + big first)
    sel.length = 0;
    for (let i = 0; i < nC; i++) {
      const c = pool[i];
      if (c.dead) continue;
      const dx = c.x - camX,
        dy = c.y - camY,
        dz = c.z - camZ;
      c.score =
        (c.score * c.range * c.range) /
        (dx * dx + dy * dy * 0.5 + dz * dz + c.range * c.range * 0.5);
      sel.push(c);
    }
    sel.sort((a, b) => b.score - a.score);
    if (sel.length > VL.MAXL) sel.length = VL.MAXL;
    S.cands = nC;
    S.sel = sel.length;
    buildGrid();
    S.gatherMs = +(performance.now() - t0).toFixed(2);
  }

  // ------------------------------------------------------------------
  // grid + texture
  // ------------------------------------------------------------------
  const tileN = new Uint8Array(VL.GN * VL.GN);
  let gx0 = 0,
    gz0 = 0;
  function buildGrid() {
    const D = VL.data,
      TW = VL.TW,
      GN = VL.GN,
      T = VL.TILE,
      PER = VL.PER;
    gx0 = Math.floor(camX / T) * T - (GN / 2) * T;
    gz0 = Math.floor(camZ / T) * T - (GN / 2) * T;
    tileN.fill(0);
    D.fill(0, 2 * TW * 4); // grid rows only
    let used = 0,
      mx = 0;
    for (let k = 0; k < sel.length; k++) {
      const c = sel[k],
        id = k + 1;
      // light record: row 0 pos+range (colour written per frame)
      const o = k * 4;
      D[o] = c.x;
      D[o + 1] = c.y;
      D[o + 2] = c.z;
      D[o + 3] = c.range;
      const rr = c.range;
      const tx0 = Math.max(0, Math.floor((c.x - rr - gx0) / T)),
        tx1 = Math.min(GN - 1, Math.floor((c.x + rr - gx0) / T));
      const tz0 = Math.max(0, Math.floor((c.z - rr - gz0) / T)),
        tz1 = Math.min(GN - 1, Math.floor((c.z + rr - gz0) / T));
      for (let tz = tz0; tz <= tz1; tz++) {
        // circle vs tile row: skip tiles the range circle cannot reach
        const cz =
          Math.max(gz0 + tz * T, Math.min(c.z, gz0 + (tz + 1) * T)) - c.z;
        for (let tx = tx0; tx <= tx1; tx++) {
          const cx =
            Math.max(gx0 + tx * T, Math.min(c.x, gx0 + (tx + 1) * T)) - c.x;
          if (cx * cx + cz * cz > rr * rr) continue;
          const ti = tz * GN + tx,
            n = tileN[ti];
          if (n >= PER) continue;
          if (n === 0) used++;
          tileN[ti] = n + 1;
          if (n + 1 > mx) mx = n + 1;
          const idx = ti * 2 + (n >> 2); // texel index in the grid rows
          D[(2 * TW + idx) * 4 + (n & 3)] = id;
        }
      }
    }
    // clear stale records past the selection
    for (let k = sel.length; k < VL.MAXL; k++) {
      const o = k * 4;
      if (D[o + 3] === 0) break;
      D[o] = D[o + 1] = D[o + 2] = D[o + 3] = 0;
    }
    S.tilesUsed = used;
    S.maxTile = mx;
    U.nrcVL.value.y = gx0;
    U.nrcVL.value.z = gz0;
    U.nrcVL.value.w = 1 / T;
  }

  function hash(n) {
    const s = Math.sin(n) * 43758.5453;
    return s - Math.floor(s);
  }
  const supp = new Float32Array(VL.MAXL);
  function writeColours(t) {
    const D = VL.data,
      TW = VL.TW;
    // atmosphere lends real PointLights to the nearest fixtures: the matching virtual light steps back
    supp.fill(0, 0, sel.length);
    S.supp = 0;
    if (poolLights) {
      for (const pl of poolLights) {
        if (!(pl.intensity > 0) || !pl.parent) continue;
        const p = pl.position;
        let best = -1,
          bd = 2.2 * 2.2;
        for (let k = 0; k < sel.length; k++) {
          const c = sel[k],
            dx = c.x - p.x,
            dy = (c.y - p.y) * 0.6,
            dz = c.z - p.z,
            d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < bd) {
            bd = d2;
            best = k;
          }
        }
        if (best >= 0) {
          const c = sel[best],
            mine = c.i * Math.pow(c.range * 0.33, 2) * Math.max(c.r, c.g, c.b);
          supp[best] = Math.min(
            1,
            supp[best] + pl.intensity / Math.max(mine, 1e-3),
          );
          S.supp++;
        }
      }
    }
    let any = false;
    for (let k = 0; k < sel.length; k++) {
      const c = sel[k];
      if (c.tr) {
        // combat flash: atmosphere's own curve and intensity convention (physical units, like its PointLights);
        // silent while the pool's real light still serves this very flash
        const T = c.tr,
          h = T.h;
        let live = false;
        try {
          live = !!(h && h.alive && h.alive());
        } catch (e) {
          live = false;
        }
        const I = live
          ? 0
          : T.i * Math.pow(T.range * 0.33, 2) * transK(T) * GAIN_T;
        const o = (TW + k) * 4,
          p = k * 4;
        D[p] = T.x;
        D[p + 1] = T.y;
        D[p + 2] = T.z;
        D[o] = T.color.r * I;
        D[o + 1] = T.color.g * I;
        D[o + 2] = T.color.b * I;
        D[o + 3] = 0;
        if (I > 0.01) any = true;
        continue;
      }
      let f = 1;
      if (c.flicker > 0.01) {
        if (c.fire)
          f =
            1 -
            c.flicker *
              0.5 *
              (1 + Math.sin(t * 17 + c.seed) * Math.sin(t * 7.3 + c.seed * 3)) *
              0.8;
        else {
          const h = hash(Math.floor(t * 9 + c.seed * 31));
          f =
            1 -
            c.flicker *
              (h > 0.35 ? 0.25 * hash(Math.floor(t * 27.9 + c.seed)) : 1);
        }
      }
      // intensity convention shared with atmosphere's pooled fixtures: ≈ illuminance at a third of the range
      const I =
        c.i *
        Math.pow(c.range * 0.33, 2) *
        f *
        (1 - supp[k]) *
        (inside ? GAIN_IN : GAIN_OUT);
      const o = (TW + k) * 4;
      D[o] = c.r * I;
      D[o + 1] = c.g * I;
      D[o + 2] = c.b * I;
      D[o + 3] = c.cone;
      if (I > 0.01) any = true;
    }
    return any;
  }

  // ------------------------------------------------------------------
  // per frame
  // ------------------------------------------------------------------
  let enabled = true,
    ready = false;
  function init() {
    try {
      if (localStorage.getItem("nrc_rl_vl") === "0") enabled = false;
    } catch (e) {
      /* ignore */
    }
    try {
      GAIN_T = G.renderer && G.renderer._useLegacyLights === true ? Math.PI : 1;
    } catch (e) {
      GAIN_T = 1;
    }
    wrapSources();
    G.events.on("initDone", () => {
      try {
        scanExisting();
      } catch (e) {
        G.reportError("render_lighting/lights-scan", e);
      }
      ready = true;
    });
  }
  // test tools: ?rlflashtest=N fires N combat flashes in a fan ahead of the camera near the end of a SHOT
  // (atmosphere's pool lights 3 of them, the virtual lights the rest)
  let flashTest = 0;
  try {
    flashTest = G.SHOT
      ? +new URLSearchParams(location.search).get("rlflashtest") || 0
      : 0;
  } catch (e) {
    flashTest = 0;
  }
  function runFlashTest() {
    const FX = G.fx,
      cam = G.camera;
    if (!FX || !FX.flash || !cam) return;
    cam.getWorldDirection(_s);
    _s.y = 0;
    _s.normalize();
    for (let k = 0; k < flashTest; k++) {
      const a = (k / Math.max(1, flashTest - 1) - 0.5) * 1.2,
        d = 7 + (k % 3) * 6;
      const x = cam.position.x + (_s.x * Math.cos(a) - _s.z * Math.sin(a)) * d,
        z = cam.position.z + (_s.z * Math.cos(a) + _s.x * Math.sin(a)) * d;
      let y = 1.3;
      try {
        if (G.world && G.world.terrainHeight)
          y += G.world.terrainHeight(x, z) || 0;
      } catch (e) {
        /* ignore */
      }
      FX.flash(
        new THREE.Vector3(x, y, z),
        k % 4 === 3 ? 0x60ff60 : 0xffb060,
        3,
        1.5,
        { range: 10, curve: "hold" },
      );
    }
  }
  let lastGX = 1e9,
    lastGZ = 1e9;
  function late(dt, realDt) {
    if (flashTest && S.frame === 38) runFlashTest();
    stepTransients(dt === undefined ? realDt || 0.016 : dt);
    const on =
      enabled &&
      R.patched &&
      R.vlPatched &&
      ready &&
      G.state !== "title" &&
      !!G.camera;
    if (!on) {
      U.nrcVL.value.x = 0;
      return;
    }
    const rd = realDt || 0.016;
    S.frame++;
    const tier = R.quality();
    VL.PER = PER_TIER[tier] || 3;
    U.nrcVL2.value.x = VL.PER;
    U.nrcVL2.value.w = RL.debug ? 1 : 0;
    const cam = G.camera.position;
    const moved = Math.abs(cam.x - lastGX) + Math.abs(cam.z - lastGZ) > 6;
    if (moved || transDirty || S.frame % 4 === 1 || G.SHOT || G.SURVEY) {
      lastGX = cam.x;
      lastGZ = cam.z;
      transDirty = false;
      gather(rd);
    }
    const any = sel.length > 0 && writeColours(performance.now() / 1000);
    U.nrcVL.value.x = any ? 1 : 0;
    if (any) {
      // every lit material holds a CLONE of the texture object sharing its Source (three clones texture
      // uniforms): the master's upload refreshes the shared GL texture for all of them (as the probe atlas)
      VL.tex.needsUpdate = true;
      try {
        if (G.renderer && G.renderer.initTexture)
          G.renderer.initTexture(VL.tex);
      } catch (e) {
        /* uploaded on first use */
      }
    }
  }

  RL.setLights = function (on) {
    enabled = !!on;
    RL.lights = enabled;
    try {
      localStorage.setItem("nrc_rl_vl", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (!on) U.nrcVL.value.x = 0;
  };
  RL.lightsInfo = () => ({
    patched: !!R.vlPatched,
    on: enabled && U.nrcVL.value.x > 0.5,
    perTile: VL.PER,
    candidates: S.cands,
    selected: S.sel,
    tilesUsed: S.tilesUsed,
    maxPerTile: S.maxTile,
    gatherMs: S.gatherMs,
    suppressed: S.supp,
    sources: S.sources,
    tracked: {
      glows: glows.length,
      fixtures: fixtures.length,
      api: apiLights.length,
      glowField: !!glowField,
      pool: poolLights ? poolLights.length : 0,
      combat: trans.length,
      combatTotal: S.transTotal | 0,
    },
  });
  /** debug: the selected lights (nearest first) */
  RL.lightsList = (n) =>
    sel.slice(0, n || 20).map((c, k) => ({
      col: [
        VL.data[(VL.TW + k) * 4],
        VL.data[(VL.TW + k) * 4 + 1],
        VL.data[(VL.TW + k) * 4 + 2],
      ].map((v) => +v.toFixed(2)),
      night: +night.toFixed(2),
      x: +c.x.toFixed(1),
      y: +c.y.toFixed(1),
      z: +c.z.toFixed(1),
      range: +c.range.toFixed(1),
      i: +c.i.toFixed(2),
      cone: c.cone,
      fire: !!c.fire,
    }));

  R.addSystem({
    name: "lights",
    order: 50,
    init,
    late,
    dispose() {
      U.nrcVL.value.x = 0;
    },
  });
})();
