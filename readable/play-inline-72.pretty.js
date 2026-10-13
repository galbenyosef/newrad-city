/* src/render_lighting/10_cascade.js */
/* =====================================================================
 * RENDER_LIGHTING — near shadow cascade
 *
 * Atmosphere's sun shadow (2048², ±75 m, texel-snapped, pushed ahead of the
 * view) stays as the FAR cascade. Here a second shadow map covers a tight
 * box FITTED TO THE VIEW: the camera-frustum slice 0–45 m (clipped to the
 * ground when looking down) is projected into light space and the fixed-size
 * box (±24 m on full → ~2.3 cm texels vs ~7.3 cm) is centred on it, keeping
 * the player's feet inside. The box size never changes with the view, so the
 * texel snapping stays exact (no shimmer); the light direction used for the
 * basis is quantised (0.12° steps) so shadow edges don't crawl while the sun
 * moves.
 *
 * The map is carried by `rl_near_cascade`, a black DirectionalLight that casts
 * the shadow (the patched light loop in 00_core.js adds its colour to the
 * sun, skips its own lighting evaluation, picks the near map where it covers
 * the fragment, blends into the far map at its border).
 *
 * Budget: every frame renders at most ONE shadow pass — the far map on 1 of
 * 4 frames while the view moves (1 of 6 while it is still: the far map only
 * holds the static city beyond ~20 m, texel-snapped), the near map
 * (characters, props, the player's own shadow) on all the others → near
 * shadows update at 3/4 … 5/6 of the frame rate. A map is always sampled with
 * the matrix it was drawn with, so nothing swims. HEADROOM: when the game runs
 * ≥ 50 fps for 2 s the near map renders on EVERY frame (the far frame then
 * renders both) → a running actor's shadow never lags its feet; it drops back
 * below 42 fps (15 s cool-down). Near-frame triangles are measured and kept at
 * or below the far frame's (the clutter budget below).
 *
 * INTERIORS (round 2): atmosphere parks the sun's shadow frustum indoors and
 * stops its pass. The near map is then re-aimed STRAIGHT DOWN from a "ceiling
 * cut" 2.4 m above the player's floor (everything above — ceilings, beams,
 * hanging lamps, upper floors — is clipped away by the shadow camera's near
 * plane) over a ±E box around the view. The interior cell's own meshes
 * (tables, shelves, counters, lockers, wreckage…) are made shadow casters
 * while the player is inside (nearest-first, capped), actors cast as they do
 * outdoors. The patched shader (00_core.js, nrcCsm.x = 2) turns it into soft
 * contact-hardening OVERHEAD shadows: pools of shade under furniture and at the
 * feet of every NPC / creature, applied to the interior key light, the
 * ambient/hemisphere/fill light (60 %) and virtual lights shining from above.
 * One pass per frame (tier 0) / every 2nd frame (tier 1); the parked sun map
 * is not rendered. Off: ?rlin=0, RL.setInteriorShadows(false).
 *
 * NEAR-ONLY CASTERS: props' merged small/medium clutter chunks (hydrants,
 * meters, bins, crates, debris) never cast into the far map (too many), but
 * cast into the near map on the full tier — chosen nearest-first inside the
 * box and capped by a live triangle budget (near frame ≤ far frame).
 * Other modules: RL.addNearCaster(obj).
 *
 * Weather: overcast / rain / dust / thunderstorm widen the penumbra (×1..4) and
 * weaken the sun shadow (down to ~45 %) — diffuse skies barely cast shadows.
 *
 * Quality (G.atmos.quality + live G.atmos.perfTier):
 *   tier 0: 2048², ±24 m, soft 8+12 taps     tier 1: 1536², ±20 m, soft 4+8 taps
 *   tier 2 ('low'): no near cascade (light never created on a 'low' start; turned
 *   off at runtime).   Off: RL.setCascades(false) / ?csm=0 (full effect on reload).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.rlight || !G.rlight._) return;
  const RL = G.rlight,
    R = RL._,
    U = R.uniforms;

  const TIERS = [
    { size: 2048, extent: 24, soft: 1, search: 8, pcf: 12 },
    { size: 1536, extent: 20, soft: 1, search: 4, pcf: 8 },
    null, // tier 2: off
  ];
  const DIST = 650; // light distance from the box centre (casters up to ~300 m tall at low sun)
  const BEHIND = 90; // depth range kept behind the centre (receivers below / behind)
  const SUN_SIZE = 0.016; // angular size used for the penumbra (a bit bigger than the real sun: soft)
  const SPLIT = 45; // view distance the near box is fitted to
  const QUANT = Math.cos((0.12 * Math.PI) / 180);
  const CYCLE = 4; // far map every 4th frame while the view moves …
  const CYCLE_STILL = 6; // … every 6th while it is still (near = actors/player on all other frames)
  // interior overhead shadow
  const IN_CUT = 2.4; // shadow "ceiling" above the player's floor (m)
  const IN_BELOW = 9; // depth kept below the floor (stairs down, pits, balconies)
  const IN_LSIZE = 0.24; // penumbra per metre of blocker height (big soft overhead fixtures)
  const IN_AMB = 0.6; // share of the ambient / hemisphere / fill light under the overhead shadow
  const IN_MAXC = 200,
    IN_MAXT = 300000; // interior casters in the box: meshes / triangles
  const S = {
    tier: -1,
    size: 0,
    extent: 0,
    frame: 0,
    active: false,
    orderOk: true,
    checkedKids: -1,
    over: 0,
    overT: 0,
    tFar: 0,
    tNear: 0,
    lastKind: "",
    budget: 0,
    clutterUsed: 0,
    clutterIn: 0,
    nFar: 0,
    nNear: 0,
    both: false,
    inMode: false,
  };
  let near = null;
  const _c = new THREE.Vector3(),
    _f = new THREE.Vector3(),
    _qf = new THREE.Vector3(),
    _r = new THREE.Vector3(),
    _u = new THREE.Vector3();
  const _p = new THREE.Vector3(),
    _d = new THREE.Vector3(),
    _feet = new THREE.Vector3();
  const _ndc = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
    [0, -1],
    [0, 0],
  ];
  let qfSet = false;
  try {
    if (new URLSearchParams(location.search).get("rlin") === "0")
      RL.interiorShadows = false;
  } catch (e) {
    /* ignore */
  }
  try {
    if (localStorage.getItem("nrc_rl_in") === "0") RL.interiorShadows = false;
  } catch (e) {
    /* ignore */
  }
  if (RL.interiorShadows === undefined) RL.interiorShadows = true;

  function sunLight() {
    const A = G.atmos;
    if (A && A.sun && A.sun.isDirectionalLight) return A.sun;
    return G.baseLights && G.baseLights.sun;
  }

  function init() {
    if (!R.patched) {
      RL.cascades = false;
      return;
    }
    const sun = sunLight();
    if (!sun || !sun.castShadow) {
      RL.cascades = false;
      return;
    }
    // off switches take effect here: no light → programs keep ONE directional shadow (no extra
    // sampler/varying/matrix). ?csm=0, the persisted toggle and a 'low' start all skip it.
    if (!RL.cascades || R.quality() >= 2) {
      S.skipped = true;
      return;
    }
    near = new THREE.DirectionalLight(0x000000, 0); // black: the patched shader adds its colour to the sun's (0)
    near.name = "rl_near_cascade";
    near.castShadow = true;
    near.shadow.bias = -0.00002;
    near.shadow.normalBias = 0.018;
    near.shadow.autoUpdate = false;
    // insert right after the sun so it is always directional-shadow #1 (three sorts shadow casters
    // first, stable, in scene traversal order); verified cheaply every frame by checkOrder()
    const parent = sun.parent || G.scene;
    parent.add(near);
    const ci = parent.children.indexOf(near),
      si = parent.children.indexOf(sun);
    if (si >= 0 && ci > si + 1) {
      parent.children.splice(ci, 1);
      parent.children.splice(si + 1, 0, near);
    }
    G.scene.add(near.target);
    applyTier(true);
    R.near = near;
    G.events.on("initDone", () => {
      try {
        discoverClutter();
      } catch (e) {
        G.reportError("render_lighting/nearCasters", e);
      }
    });
  }

  function applyTier(force) {
    if (!near) return;
    const tier = R.quality();
    if (tier === S.tier && !force) return;
    S.tier = tier;
    const t = TIERS[tier];
    if (!t) {
      // runtime drop to 'low': no near pass, free the map
      if (near.shadow.map) {
        near.shadow.map.dispose();
        near.shadow.map = null;
      }
      S.size = 0;
      return;
    }
    S.extent = t.extent;
    const cam = near.shadow.camera;
    cam.left = -t.extent;
    cam.right = t.extent;
    cam.top = t.extent;
    cam.bottom = -t.extent;
    cam.near = 1;
    cam.far = DIST + BEHIND;
    cam.updateProjectionMatrix();
    if (t.size !== S.size) {
      S.size = t.size;
      near.shadow.mapSize.set(t.size, t.size);
      if (near.shadow.map) {
        near.shadow.map.dispose();
        near.shadow.map = null;
      }
    }
    const texelW = (t.extent * 2) / t.size,
      range = cam.far - cam.near;
    near.shadow.normalBias = texelW * 0.9;
    U.nrcCsm3.value.x = texelW / range;
    S.texelW = texelW;
    S.range = range;
    U.nrcCsm.value.w = t.soft;
    U.nrcCsm4.value.x = t.search;
    U.nrcCsm4.value.y = t.pcf;
    U.nrcCsm3.value.y = RL.debug ? 1 : 0;
    applyWeather(S.oc || 0);
  }

  /** penumbra + shadow strength from the weather (called every frame, cheap) */
  function applyWeather(oc) {
    S.oc = oc;
    // diffuse skies: the sun disc is hidden behind cloud → wide soft penumbrae, weak shadows
    U.nrcCsm3.value.z = 1 - 0.55 * oc;
    if (!S.texelW) return;
    const t = TIERS[S.tier] || TIERS[0];
    const k = 1 + 3 * oc;
    const C2 = U.nrcCsm2.value;
    C2.y = (S.range * SUN_SIZE * k) / S.texelW;
    C2.z = 1.0 + oc * 1.5;
    C2.w = (t.soft ? 7.0 : 1.5) * (1 + 1.2 * oc);
    C2.x = (t.soft ? 6.0 : 1.5) * (1 + 0.8 * oc);
  }

  /** The shader assumes shadow-casting directional light #0 = sun, #1 = near cascade.
   *  Cheap per-frame check (sibling order + flags); a full traversal only when the scene's
   *  top-level child count changes (something added a light at the root, say). */
  function checkOrder(sun) {
    const par = sun.parent;
    let ok = !!par && near.parent === par && sun.castShadow && near.castShadow;
    if (ok) {
      const si = par.children.indexOf(sun);
      ok = si >= 0 && par.children[si + 1] === near;
    }
    const kids = G.scene.children.length;
    if (ok && kids !== S.checkedKids) {
      S.checkedKids = kids;
      let first = null,
        second = null,
        n = 0;
      G.scene.traverseVisible((o) => {
        if (o.isDirectionalLight && o.castShadow) {
          n++;
          if (n === 1) first = o;
          else if (n === 2) second = o;
        }
      });
      S.fullOk = n === 2 && first === sun && second === near;
    }
    ok = ok && S.fullOk !== false;
    if (!ok && S.orderOk && !S.warned) {
      S.warned = true;
      console.warn(
        "[render_lighting] shadow light order unexpected, near cascade disabled",
      );
    }
    S.orderOk = ok;
  }

  // ------------------------------------------------------------------
  // placement: fixed-size box fitted to the near slice of the view frustum
  // ------------------------------------------------------------------
  function place(sun) {
    if (!R.keyDir(_f)) return false;
    // quantised light direction (the basis and the carrier's direction): no crawl while the sun moves
    if (!qfSet || _f.dot(_qf) < QUANT) {
      _qf.copy(_f);
      qfSet = true;
    }
    const cam = G.camera;
    cam.updateMatrixWorld();
    const gy = G.player && G.player.pos ? G.player.pos.y : cam.position.y - 1.6;
    _feet.set(
      cam.position.x,
      Math.min(cam.position.y, gy + 0.2),
      cam.position.z,
    );
    _r.set(0, 1, 0).cross(_qf);
    if (_r.lengthSq() < 1e-6) _r.set(1, 0, 0);
    _r.normalize();
    _u.crossVectors(_qf, _r).normalize();
    // frustum-slice footprint in light space: the camera + rays through the frustum edges,
    // each clipped at SPLIT m or where it meets the ground (looking down → a smaller slice)
    let x0 = Infinity,
      x1 = -Infinity,
      y0 = Infinity,
      y1 = -Infinity,
      zc = 0;
    const addPt = (p) => {
      const a = p.dot(_r),
        b = p.dot(_u);
      if (a < x0) x0 = a;
      if (a > x1) x1 = a;
      if (b < y0) y0 = b;
      if (b > y1) y1 = b;
    };
    addPt(_feet);
    for (let k = 0; k < _ndc.length; k++) {
      _d.set(_ndc[k][0], _ndc[k][1], 0.5)
        .unproject(cam)
        .sub(cam.position)
        .normalize();
      let t = SPLIT;
      if (_d.y < -1e-3) t = Math.min(t, (cam.position.y - gy) / -_d.y + 1.5);
      _p.copy(cam.position).addScaledVector(_d, t);
      _p.y = Math.max(gy, Math.min(_p.y, gy + 14)); // tall walls project small at high sun; keep the slice low
      addPt(_p);
    }
    const E = S.extent,
      M = 3; // keep the feet ≥ 3 m inside the box
    let cx = (x0 + x1) * 0.5,
      cy = (y0 + y1) * 0.5;
    const fa = _feet.dot(_r),
      fb = _feet.dot(_u);
    cx = Math.min(fa + E - M, Math.max(fa - E + M, cx));
    cy = Math.min(fb + E - M, Math.max(fb - E + M, cy));
    zc = _feet.dot(_qf);
    // stable texel snapping in light space (no shimmer while walking / turning)
    const texel = (E * 2) / S.size;
    cx = Math.round(cx / texel) * texel;
    cy = Math.round(cy / texel) * texel;
    _c.set(0, 0, 0)
      .addScaledVector(_r, cx)
      .addScaledVector(_u, cy)
      .addScaledVector(_qf, zc);
    near.target.position.copy(_c);
    near.position.copy(_c).addScaledVector(_qf, DIST);
    near.target.updateMatrixWorld();
    near.updateMatrixWorld();
    S.cx = cx;
    S.cy = cy;
    return true;
  }

  // ------------------------------------------------------------------
  // per-frame scheduling
  // ------------------------------------------------------------------
  function measure() {
    // renderer.info accumulates over the whole frame inside atmosphere's render hook; read the
    // PREVIOUS frame's totals and attribute them to the pass that frame rendered
    const info = G.renderer && G.renderer.info && G.renderer.info.render;
    if (!info || !S.lastKind || info.calls < 40) return;
    const t = info.triangles;
    if (S.lastKind === "far") S.tFar = S.tFar ? S.tFar * 0.8 + t * 0.2 : t;
    else if (S.lastKind === "near")
      S.tNear = S.tNear ? S.tNear * 0.8 + t * 0.2 : t;
  }

  const _fd = new THREE.Vector3();
  function late(dt, realDt) {
    const sun = sunLight();
    const C = U.nrcCsm.value;
    const indoors = R.interior();
    U.nrcHzL.value.w = indoors || !R.patched || R.skylineOff ? 0 : 1;
    if (!sun) return;
    if (!near) {
      applyWeather(indoors ? 0 : R.overcast());
      C.x = 0;
      C.z = indoors || !R.patched ? 0 : 0.86;
      return;
    }
    applyTier(false);
    S.frame++;
    checkOrder(sun);
    measure();
    headroom(realDt);
    if (indoors) {
      lateInterior(sun);
      return;
    }
    if (S.inMode) leaveInterior();
    applyWeather(R.overcast());
    const want =
      RL.cascades && S.orderOk && G.renderer.shadowMap.enabled && TIERS[S.tier];
    if (!want || !place(sun)) {
      // everything back to atmosphere's single map (+ the skyline beyond it)
      C.x = 0;
      C.z = 0.86;
      near.shadow.autoUpdate = false;
      near.shadow.needsUpdate = false;
      sun.shadow.autoUpdate = true;
      S.active = false;
      S.lastKind = "";
      setNearCast(false);
      return;
    }
    const first = !S.active || !near.shadow.map;
    S.active = true;
    C.x = 1;
    C.y = 0.8;
    C.z = 0.86;
    // far map every 4th frame while the view moves / turns, every 8th while it is still; the near map
    // on all other frames (and on the far frame too when there is frame-rate headroom)
    const cam = G.camera;
    cam.getWorldDirection(_fd);
    const still =
      S.farCam &&
      cam.position.distanceToSquared(S.farCam) < 2.25 &&
      _fd.dot(S.farDir) > 0.99;
    const farMissing = !sun.shadow.map;
    S.sinceFar = (S.sinceFar === undefined ? RL._parity | 0 : S.sinceFar) + 1;
    const farNow =
      first || farMissing || S.sinceFar >= (still ? CYCLE_STILL : CYCLE);
    const nearNow = !farNow || first || S.both;
    if (farNow) {
      S.sinceFar = 0;
      if (!S.farCam) {
        S.farCam = new THREE.Vector3();
        S.farDir = new THREE.Vector3();
      }
      S.farCam.copy(cam.position);
      S.farDir.copy(_fd);
    }
    near.shadow.autoUpdate = nearNow;
    sun.shadow.autoUpdate = farNow;
    near.shadow.needsUpdate = false;
    S.lastKind = farNow && nearNow ? "both" : farNow ? "far" : "near";
    S.nFar += farNow ? 1 : 0;
    S.nNear += nearNow ? 1 : 0;
    // clutter casts only into the near map (on a 'both' frame it also lands in the far one — only with
    // headroom), only on the full tier, nearest-first under the live triangle budget
    const clutter = S.tier === 0 && nearNow && (!farNow || S.both);
    if (clutter) selectClutter();
    setNearCast(clutter);
  }

  /** frame-rate headroom → near map on every frame (no shadow lag at all); hysteresis + cool-down */
  function headroom(realDt) {
    const d = realDt > 0 && realDt < 0.5 ? realDt : 0.033;
    S.avgDt = S.avgDt ? S.avgDt * 0.95 + d * 0.05 : d;
    const now = performance.now() / 1000;
    if (G.SHOT || G.SMOKE || G.SURVEY) {
      S.both = false;
      return;
    }
    if (S.both) {
      if (S.avgDt > 1 / 42) {
        S.both = false;
        S.bothCool = now + 15;
        S.fastT = 0;
      }
    } else if (S.avgDt < 1 / 50 && now > (S.bothCool || 0)) {
      S.fastT = (S.fastT || 0) + d;
      if (S.fastT > 2) S.both = true;
    } else S.fastT = 0;
  }

  // ------------------------------------------------------------------
  // INTERIOR overhead shadow
  // ------------------------------------------------------------------
  const inCasters = []; // {o, box: Box3 (world), tris, on}
  let inKey = null,
    inActive = [];
  const _ib = new THREE.Box3();
  function cellKeyAt(x, z) {
    const I = G.LAYOUT && G.LAYOUT.INTERIORS;
    if (!I) return "x" + Math.round(x / 300) + "_" + Math.round(z / 300);
    let best = null,
      bd = 1e18;
    for (const k in I) {
      const o = I[k] && I[k].origin;
      if (!o) continue;
      const d = (o.x - x) * (o.x - x) + (o.z - z) * (o.z - z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best && bd < 230 * 230
      ? best
      : "x" + Math.round(x / 300) + "_" + Math.round(z / 300);
  }
  function isLamp(m) {
    if (!m.emissive || !m.emissive.isColor) return false;
    const e = m.emissive,
      k = m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity;
    return (
      (0.2126 * e.r + 0.7152 * e.g + 0.0722 * e.b) * k >= 0.5 && !m.emissiveMap
    );
  }
  function inEligible(o) {
    if (
      !o.isMesh ||
      o.isSkinnedMesh ||
      o.castShadow ||
      !o.geometry ||
      !o.geometry.attributes.position
    )
      return false;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) {
      if (
        !m ||
        m.transparent ||
        m.isMeshBasicMaterial ||
        m.isShaderMaterial ||
        m.isRawShaderMaterial ||
        m.isSpriteMaterial
      )
        return false;
      if (m.opacity !== undefined && m.opacity < 0.9) return false;
      if (isLamp(m)) return false;
    }
    for (let p = o; p; p = p.parent) {
      const u = p.userData;
      if (u && (u.rlNoShadow || u.rlNoNearShadow)) return false;
      if (p.name && /^(atmos|rl_)/.test(p.name)) return false;
    }
    return true;
  }
  // Interior builders skip faces nobody sees (box bottoms, the undersides of table tops…); the shadow
  // pass draws BACK faces by default, so seen from above such furniture would cast nothing. While the
  // overhead shadow is on, the materials of the cell's casters render DOUBLE-SIDED into the map (a
  // shadow-pass-only setting: no program change) and get their own value back on the way out.
  const sideSaved = new Map(); // material → original shadowSide
  function dblSide(o) {
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms)
      if (m && !sideSaved.has(m)) {
        sideSaved.set(m, m.shadowSide);
        m.shadowSide = THREE.DoubleSide;
      }
  }
  function restoreSides() {
    for (const [m, v] of sideSaved) m.shadowSide = v;
    sideSaved.clear();
  }
  /** the interior cell's meshes (one traversal per cell, again ~2 s later for late builders) */
  function collectInterior(ox, oz) {
    restoreInterior();
    inCasters.length = 0;
    const HALF = 220;
    G.scene.updateMatrixWorld();
    G.scene.traverse((o) => {
      if (
        o.isMesh &&
        o.castShadow &&
        !o.isSkinnedMesh &&
        o.geometry &&
        o.material
      ) {
        // the cell's own casters (map / POI builders): double-sided for the overhead pass
        let b = o.geometry.boundingSphere;
        if (!b) {
          o.geometry.computeBoundingSphere();
          b = o.geometry.boundingSphere;
        }
        if (b) {
          _ib.min.copy(b.center).applyMatrix4(o.matrixWorld);
          if (
            Math.abs(_ib.min.x - ox) < HALF + b.radius &&
            Math.abs(_ib.min.z - oz) < HALF + b.radius
          )
            dblSide(o);
        }
        return;
      }
      if (!inEligible(o)) return;
      let b;
      if (o.isInstancedMesh) {
        if (!o.boundingBox && o.computeBoundingBox) o.computeBoundingBox();
        if (!o.boundingBox) return;
        b = o.boundingBox;
      } else {
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        b = o.geometry.boundingBox;
      }
      _ib.copy(b).applyMatrix4(o.matrixWorld);
      if (!isFinite(_ib.min.x) || !isFinite(_ib.max.y)) return;
      const cx = (_ib.min.x + _ib.max.x) * 0.5,
        cz = (_ib.min.z + _ib.max.z) * 0.5;
      if (Math.abs(cx - ox) > HALF || Math.abs(cz - oz) > HALF) return;
      const sx = _ib.max.x - _ib.min.x,
        sy = _ib.max.y - _ib.min.y,
        sz = _ib.max.z - _ib.min.z;
      if (sy < 0.5 && sx > 10 && sz > 10) return; // floor / ceiling slab: never shades anything below the cut
      let tris = trisOf(o.geometry);
      if (o.isInstancedMesh) tris *= Math.max(1, o.count | 0);
      inCasters.push({ o, box: _ib.clone(), tris, on: false });
    });
    S.inCollected = inCasters.length;
    S.selIn = null;
  }
  function restoreInterior() {
    for (const e of inActive)
      if (e.on) {
        e.o.castShadow = false;
        e.on = false;
      }
    inActive = [];
    restoreSides();
  }
  function selectInterior(cx, cz, E, floor, cut) {
    const now = performance.now();
    const sel = S.selIn;
    if (
      sel &&
      Math.abs(cx - sel.x) + Math.abs(cz - sel.z) < 2 &&
      Math.abs(floor - sel.f) < 0.3 &&
      now - sel.t < 700
    )
      return;
    S.selIn = { x: cx, z: cz, f: floor, t: now };
    const y0 = floor - IN_BELOW,
      M = E + 0.5;
    const cand = [];
    const cam = G.camera.position;
    for (const e of inCasters) {
      const b = e.box;
      if (
        b.max.x < cx - M ||
        b.min.x > cx + M ||
        b.max.z < cz - M ||
        b.min.z > cz + M
      )
        continue;
      if (b.min.y > cut || b.max.y < y0) continue;
      if (!e.o.parent) continue;
      e.d = Math.hypot(
        Math.max(0, b.min.x - cam.x, cam.x - b.max.x),
        Math.max(0, b.min.z - cam.z, cam.z - b.max.z),
      );
      cand.push(e);
    }
    cand.sort((a, b) => a.d - b.d);
    let n = 0,
      tris = 0;
    const next = [];
    for (const e of cand) {
      if (n >= IN_MAXC || tris + e.tris > IN_MAXT) continue;
      next.push(e);
      n++;
      tris += e.tris;
    }
    for (const e of inActive) e.keep = false;
    for (const e of next) {
      e.keep = true;
      if (!e.on) {
        e.o.castShadow = true;
        e.on = true;
        dblSide(e.o);
      }
    }
    for (const e of inActive)
      if (!e.keep && e.on) {
        e.o.castShadow = false;
        e.on = false;
      }
    inActive = next;
    S.inCasters = n;
    S.inTris = tris;
    S.inCand = cand.length;
  }
  function leaveInterior() {
    restoreInterior();
    inKey = null;
    S.inMode = false;
    S.inFrames = 0;
    U.nrcCsm3.value.w = 0;
    near.shadow.camera.up.set(0, 1, 0);
    const cam = near.shadow.camera;
    cam.near = 1;
    cam.far = DIST + BEHIND;
    cam.updateProjectionMatrix();
    S.range = cam.far - cam.near;
    if (S.texelW) U.nrcCsm3.value.x = S.texelW / S.range;
    S.sinceFar = undefined;
    S.active = false; // outdoors again: both maps render on the next frame
    qfSet = false;
  }
  function lateInterior(sun) {
    const C = U.nrcCsm.value;
    setNearCast(false);
    const ok =
      RL.cascades &&
      RL.interiorShadows &&
      S.orderOk &&
      G.renderer.shadowMap.enabled &&
      TIERS[S.tier] &&
      G.camera;
    if (!ok) {
      if (S.inMode) leaveInterior();
      C.x = 0;
      C.z = 0;
      U.nrcCsm3.value.w = 0;
      near.shadow.autoUpdate = false;
      near.shadow.needsUpdate = false;
      sun.shadow.autoUpdate = true;
      S.active = false;
      S.lastKind = "";
      applyWeather(0);
      return;
    }
    const cam = G.camera;
    const P = G.player;
    const feet =
      P && P.pos && isFinite(P.pos.y) ? P.pos.y : cam.position.y - 1.6;
    const key = cellKeyAt(cam.position.x, cam.position.z);
    if (!S.inMode || key !== inKey) {
      if (S.inMode) restoreInterior();
      S.inMode = true;
      S.inFrames = 0;
      inKey = key;
      S.inT = 0;
      S.floor = feet;
      S.recollected = false;
      collectInterior(cam.position.x, cam.position.z);
    }
    S.inFrames++;
    S.inT += 1 / 60;
    if (!S.recollected && S.inFrames > 120) {
      S.recollected = true;
      collectInterior(cam.position.x, cam.position.z);
    } // late builders
    // floor tracking: follows the player down at once, up slowly (a jump doesn't lift the cut into the ceiling)
    if (feet < S.floor) S.floor = feet;
    else S.floor += Math.min(feet - S.floor, 0.04);
    const floor = Math.round(S.floor * 4) / 4,
      cut = floor + IN_CUT;
    // box: fixed size, a little ahead of the view, texel-snapped on the world XZ grid
    const E = S.extent,
      texel = (E * 2) / S.size;
    cam.getWorldDirection(_fd);
    _fd.y = 0;
    if (_fd.lengthSq() > 1e-6) _fd.normalize();
    let cx = cam.position.x + _fd.x * E * 0.35,
      cz = cam.position.z + _fd.z * E * 0.35;
    cx = Math.round(cx / texel) * texel;
    cz = Math.round(cz / texel) * texel;
    const sc = near.shadow.camera;
    sc.up.set(0, 0, -1); // looking straight down: light-space x = world x, y = −world z
    const far = cut - (floor - IN_BELOW);
    if (Math.abs(sc.near - 0.02) > 1e-4 || Math.abs(sc.far - far) > 1e-3) {
      sc.near = 0.02;
      sc.far = far;
      sc.updateProjectionMatrix();
    }
    near.position.set(cx, cut, cz);
    near.target.position.set(cx, cut - 10, cz);
    near.updateMatrixWorld();
    near.target.updateMatrixWorld();
    // soft, wide penumbrae (big overhead fixtures), receiver-plane bias for the short depth range
    const range = sc.far - sc.near;
    U.nrcCsm3.value.x = texel / range;
    U.nrcCsm3.value.z = 1;
    U.nrcCsm3.value.w = IN_AMB;
    const C2 = U.nrcCsm2.value;
    C2.y = (range * IN_LSIZE) / texel;
    C2.z = 1.5;
    C2.w = S.tier === 0 ? 9 : 6;
    C2.x = S.tier === 0 ? 8 : 5;
    selectInterior(cx, cz, E, floor, cut);
    C.x = 2;
    C.z = 0;
    // one pass: the near map (every frame on the full tier, every 2nd on reduced); the parked sun map
    // is only refreshed on the first frames (atmosphere clears it once)
    const nearNow =
      S.tier === 0 || (S.frame & 1) === 0 || !near.shadow.map || S.inFrames < 3;
    near.shadow.autoUpdate = nearNow;
    near.shadow.needsUpdate = false;
    sun.shadow.autoUpdate = S.inFrames < 3;
    if (nearNow) G.renderer.shadowMap.needsUpdate = true; // atmosphere switched the renderer's pass off indoors
    S.active = true;
    S.lastKind = "interior";
    S.inCut = +cut.toFixed(2);
  }
  /** debug (?rlinfo=1 shots): sample the near map on a 9×9 grid → {min, max, lit (texels at max depth)} */
  RL._nearProbe = function () {
    const rt = near && near.shadow.map;
    if (!rt || !G.renderer) return null;
    const px = new Uint8Array(4);
    let mn = 9,
      mx = -1,
      n = 0,
      far = 0;
    const N = rt.width;
    for (let j = 1; j < 10; j++)
      for (let i = 1; i < 10; i++) {
        G.renderer.readRenderTargetPixels(
          rt,
          Math.floor((N * i) / 10),
          Math.floor((N * j) / 10),
          1,
          1,
          px,
        );
        const d =
          px[0] / 255 / 16777216 +
          px[1] / 255 / 65536 +
          px[2] / 255 / 256 +
          px[3] / 255; // three's unpackRGBAToDepth (r158)
        if (d < mn) mn = d;
        if (d > mx) mx = d;
        n++;
        if (d > 0.999) far++;
      }
    const cam = near.shadow.camera;
    return {
      n,
      min: +mn.toFixed(3),
      max: +mx.toFixed(3),
      empty: far,
      camNear: cam.near,
      camFar: +cam.far.toFixed(2),
      up: cam.up.toArray(),
      pos: near.position.toArray().map((v) => +v.toFixed(1)),
      auto: near.shadow.autoUpdate,
      smAuto: G.renderer.shadowMap.autoUpdate,
    };
  };
  RL._nearAscii = function (W) {
    const rt = near && near.shadow.map;
    if (!rt || !G.renderer) return null;
    W = W || 48;
    const N = rt.width,
      all = new Uint8Array(N * N * 4);
    G.renderer.readRenderTargetPixels(rt, 0, 0, N, N, all);
    const cam = new THREE.Vector4(
      G.camera.position.x,
      0,
      G.camera.position.z,
      1,
    ).applyMatrix4(near.shadow.matrix);
    const ci = Math.floor(cam.x * W),
      cj = Math.floor(cam.y * W);
    const rows = [];
    for (let j = W - 1; j >= 0; j--) {
      let row = "";
      for (let i = 0; i < W; i++) {
        let mn = 9;
        for (let b = 0; b < 4; b++)
          for (let a = 0; a < 4; a++) {
            const x = Math.floor(((i + (a + 0.5) / 4) * N) / W),
              y = Math.floor(((j + (b + 0.5) / 4) * N) / W),
              o = (y * N + x) * 4;
            const d =
              all[o] / 255 / 16777216 +
              all[o + 1] / 255 / 65536 +
              all[o + 2] / 255 / 256 +
              all[o + 3] / 255;
            if (d < mn) mn = d;
          }
        row +=
          i === ci && j === cj
            ? "C"
            : mn > 0.99
              ? "."
              : String(Math.min(9, Math.floor(mn * 10)));
      }
      rows.push(row);
    }
    return rows;
  };
  R.interiorShadowOn = () => !!(S.inMode && U.nrcCsm.value.x > 1.5);
  RL.setInteriorShadows = function (on) {
    RL.interiorShadows = !!on;
    try {
      localStorage.setItem("nrc_rl_in", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // NEAR-ONLY CASTERS: small street clutter (hydrants, bins, crates, debris…) is too numerous for
  // the big far map, but inside the near box it is exactly what grounds the scene. Registered meshes
  // get castShadow = true only while the NEAR map renders — a per-object flag read by the shadow
  // pass only (no program change, no recompiles). Chunks are chosen nearest-first among those whose
  // bounds touch the box, until the triangle budget (far-frame tris − near-frame tris) is used up.
  // ------------------------------------------------------------------
  const nearCasters = []; // {o, tris, c: Vector3 (world bound centre), r}
  let active = [];
  let nearCastOn = null;
  function setNearCast(on) {
    if (on === nearCastOn && !S.dirtySel) return;
    nearCastOn = on;
    S.dirtySel = false;
    for (let i = 0; i < nearCasters.length; i++)
      nearCasters[i].o.castShadow = false;
    if (on)
      for (let i = 0; i < active.length; i++) active[i].o.castShadow = true;
  }
  function eligible(o) {
    if (
      !o.isMesh ||
      o.isSkinnedMesh ||
      o.castShadow ||
      (o.userData && o.userData.rlNoNearShadow)
    )
      return false;
    const m = o.material;
    if (
      !m ||
      Array.isArray(m) ||
      m.transparent ||
      m.isMeshBasicMaterial ||
      m.isShaderMaterial
    )
      return false;
    return true;
  }
  function trisOf(g) {
    const n = g.index
      ? g.index.count
      : g.attributes.position
        ? g.attributes.position.count
        : 0;
    return n / 3;
  }
  function register(o) {
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const bs = o.geometry.boundingSphere;
    o.updateWorldMatrix(true, false);
    const c = bs.center.clone().applyMatrix4(o.matrixWorld);
    const r = bs.radius * o.matrixWorld.getMaxScaleOnAxis();
    nearCasters.push({ o, tris: trisOf(o.geometry), c, r });
  }
  /** Register an object (all its eligible meshes) as a near-cascade-only shadow caster. */
  RL.addNearCaster = function (obj) {
    if (!obj) return 0;
    let n = 0;
    obj.traverse((o) => {
      if (eligible(o) && !nearCasters.some((e) => e.o === o)) {
        register(o);
        n++;
      }
    });
    S.selAt = null;
    return n;
  };
  RL.removeNearCaster = function (obj) {
    if (!obj) return;
    obj.traverse((o) => {
      const i = nearCasters.findIndex((e) => e.o === o);
      if (i >= 0) {
        nearCasters.splice(i, 1);
        o.castShadow = false;
      }
    });
    active = active.filter((e) => nearCasters.indexOf(e) >= 0);
    S.selAt = null;
  };
  function selectClutter() {
    // budget: what the near pass may add on top of its own static casters to stay ≤ the far frame
    const base = S.tNear ? S.tNear - S.clutterUsed : 0;
    let budget =
      S.tFar && S.tNear ? Math.max(0, (S.tFar - base) * 0.97) : 60000;
    budget = Math.min(budget, 250000);
    S.budget = budget;
    // re-select when the box moved ~6 m or the budget changed noticeably
    const moved =
      !S.selAt ||
      Math.abs(S.cx - S.selAt.x) + Math.abs(S.cy - S.selAt.y) > 6 ||
      Math.abs(budget - S.selAt.b) > 20000;
    if (!moved) return;
    S.selAt = { x: S.cx, y: S.cy, b: budget };
    const E = S.extent + 2;
    const inBox = [];
    for (const e of nearCasters) {
      if (!e.o.parent || !e.o.visible) continue;
      const a = e.c.dot(_r) - S.cx,
        b = e.c.dot(_u) - S.cy;
      if (Math.abs(a) > E + e.r || Math.abs(b) > E + e.r) continue;
      e.d = Math.hypot(
        Math.max(0, Math.abs(a) - e.r),
        Math.max(0, Math.abs(b) - e.r),
      );
      inBox.push(e);
    }
    inBox.sort((x, y) => x.d - y.d || x.tris - y.tris);
    active = [];
    let used = 0;
    for (const e of inBox) {
      if (used + e.tris > budget) continue;
      active.push(e);
      used += e.tris;
    }
    S.clutterUsed = used;
    S.clutterIn = inBox.length;
    S.dirtySel = true;
  }
  // auto-discovery of props' merged small/medium clutter chunks (props builds them without shadows
  // for the far map's sake); props can opt a mesh out with userData.rlNoNearShadow
  function discoverClutter() {
    let n = 0;
    G.scene.traverse((o) => {
      if (o.name && /^props_(small|medium)_/.test(o.name))
        n += RL.addNearCaster(o);
    });
    S.clutter = n;
    let tris = 0,
      maxT = 0;
    for (const e of nearCasters) {
      tris += e.tris;
      if (e.tris > maxT) maxT = e.tris;
    }
    S.clutterTris = tris;
    S.clutterMaxTris = maxT;
  }

  function dispose() {
    const sun = sunLight();
    if (sun) sun.shadow.autoUpdate = true;
    U.nrcCsm.value.x = 0;
    U.nrcCsm3.value.w = 0;
    setNearCast(false);
    if (near && S.inMode) {
      try {
        leaveInterior();
      } catch (e) {
        /* ignore */
      }
    }
    if (near) {
      near.shadow.autoUpdate = false;
      if (near.shadow.map) {
        near.shadow.map.dispose();
        near.shadow.map = null;
      }
    }
    S.active = false;
  }
  R.disposeCascade = dispose;

  /** Enable/disable the near cascade (persisted per viewer). Disabling frees the map at once;
   *  the carrier light (and its shader cost) only goes away on the next load. */
  RL.setCascades = function (on) {
    RL.cascades = !!on;
    try {
      localStorage.setItem("nrc_rl_cascades", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (!on) dispose();
  };
  RL.cascadeInfo = () => ({
    active: S.active,
    skipped: !!S.skipped,
    tier: S.tier,
    size: S.size,
    extent: S.extent,
    orderOk: S.orderOk,
    overcast: +(S.oc || 0).toFixed(2),
    nearCasters: nearCasters.length,
    clutterTris: S.clutterTris,
    clutterMaxTris: S.clutterMaxTris,
    clutterInBox: S.clutterIn,
    clutterActive: active.length,
    clutterUsedTris: Math.round(S.clutterUsed),
    clutterBudget: Math.round(S.budget),
    frameTrisFar: Math.round(S.tFar),
    frameTrisNear: Math.round(S.tNear),
    mapMB: S.size ? +((S.size * S.size * 8) / 1048576).toFixed(1) : 0,
    passes: {
      far: S.nFar,
      near: S.nNear,
      headroom: !!S.both,
      avgMs: +((S.avgDt || 0) * 1000).toFixed(1),
    },
    interior: {
      on: !!S.inMode,
      cell: inKey,
      cut: S.inCut,
      collected: S.inCollected,
      casters: S.inCasters,
      tris: S.inTris,
      inBox: S.inCand,
    },
    far: G.atmos && G.atmos.shadowInfo ? G.atmos.shadowInfo() : null,
  });

  R.addSystem({ name: "cascade", order: 10, init, late, dispose });
})();
