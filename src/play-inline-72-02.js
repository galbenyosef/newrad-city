// play-inline-72 02 — near
// Lines 64-373 of readable/play-inline-72.pretty.js (statement-aligned).
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
