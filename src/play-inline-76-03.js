// play-inline-76 03 — opts
// Lines 58-377 of readable/play-inline-76.pretty.js (statement-aligned).
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
