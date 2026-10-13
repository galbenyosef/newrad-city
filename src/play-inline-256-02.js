// play-inline-256 02 — spring
// Lines 30-126 of readable/play-inline-256.pretty.js (statement-aligned).
  const PF = G._pbr;
  const BK = PF.bk,
    K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2;
  const KEY = "queensboro_bridge";
  const BASE = 10;
  const O = { x: 7400, y: BASE, z: 800 };
  const W = (x, y, z) => V3(O.x + x, O.y + y, O.z + z);
  const A = (x, y, z, yaw) => PF.anchor(O.x + x, O.y + y, O.z + z, yaw || 0);
  const L = (x, y, z, color, r, i) => ({
    x: O.x + x,
    y: O.y + y,
    z: O.z + z,
    color,
    r,
    i,
  });

  Object.assign(PF.flagDefaults, {
    bm_met_ruth: false,
    bm_power: false,
    bm_store_open: false,
    bm_fuse_hint: false,
    bm_heal_free: false,
    bm_dutch: false,
  });

  Object.assign(PF.MAT_DEFS, {
    window_day: {
      color: 0x5a6a70,
      emissive: 0x8a9eaa,
      emissiveIntensity: 0.42,
      rough: 0.3,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    egg: {
      color: 0xc8c49a,
      emissive: 0x6a8a20,
      emissiveIntensity: 0.45,
      rough: 0.35,
      uv: 1,
      plain: true,
    },
    jukebox: {
      color: 0xd0a040,
      emissive: 0xff9a30,
      emissiveIntensity: 0.9,
      rough: 0.4,
      metal: 0.3,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });

  // ===================================================================
  // GEOMETRY
  // ===================================================================
  function archGlass(b, key, cx, y0, z, w, spring, ry) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, spring);
    s.absarc(0, spring, w / 2, 0, PI, false);
    s.lineTo(-w / 2, 0);
    b.add(key, PF.shapeGeo(s, 12), {
      m: PF.m4(cx, y0, z, ry || 0),
      uv: "keep",
      noAO: true,
      grime: 0.05,
    });
  }
  /** Spandrel that rounds the top of a rectangular wall gap into an arch (inner face at z, facing ry). */
  function archSpandrel(b, key, cx, spring, top, z, w, depth, ry) {
    const R = w / 2,
      s = new THREE.Shape();
    s.moveTo(-R, spring);
    s.absarc(0, spring, R, PI, 0, true);
    s.lineTo(R, top);
    s.lineTo(-R, top);
    s.closePath();
    b.add(
      key,
      new THREE.ExtrudeGeometry(s, {
        depth,
        bevelEnabled: false,
        curveSegments: 12,
      }),
      { m: PF.m4(cx, 0, z, ry || 0), grime: 0.3 },
    );
  }

