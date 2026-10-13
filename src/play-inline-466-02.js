// play-inline-466 02 — out
// Lines 26-133 of readable/play-inline-466.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim,
    PAL = L.PAL;
  const lerp = L.lerp;
  const PI = Math.PI;
  const ALL6 = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const _qa = new THREE.Quaternion(),
    _va = new THREE.Vector3(),
    _vb = new THREE.Vector3(0, -1, 0);
  function seg(R, bone, to, r0, r1, mat, o) {
    o = o || {};
    _va.set(to[0], to[1], to[2]);
    const len = _va.length();
    const g = P.limb(len, r0, r1, {
      seg: o.seg || 10,
      bulge: o.bulge || 0,
      flat: o.flat,
    });
    _qa.setFromUnitVectors(_vb, _va.normalize());
    g.applyQuaternion(_qa);
    return R.add(bone, g, mat);
  }
  /** Accordion bellows (waists, necks): stacked rounded boxes alternating two materials. */
  function bellows(R, bone, y0, y1, w, d, n, m1, m2) {
    const h = (y1 - y0) / n;
    for (let i = 0; i < n; i++) {
      const k = i % 2 ? 0.92 : 1;
      R.add(
        bone,
        P.xf(
          P.box(w * k, h * 1.05, d * k, Math.min(w, d) * 0.12),
          0,
          y0 + h * (i + 0.5),
          0,
        ),
        i % 2 ? m2 : m1,
      );
    }
  }
  const metal = (c, extra) =>
    Object.assign(
      {
        color: c,
        region: "metal",
        rough: 0.42,
        metal: 0.45,
        noise: 0.16,
        grad: [0.8, 1.1],
      },
      extra || {},
    );
  const paint = (c, extra) =>
    Object.assign(
      {
        color: c,
        region: "metal",
        rough: 0.55,
        metal: 0.35,
        noise: 0.2,
        grad: [0.78, 1.1],
        paint: rustPaint,
      },
      extra || {},
    );
  function rustPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    const n = L.noise3(wx * 11, wy * 11, wz * 11);
    if (n > 0.7) {
      const k = (n - 0.7) * 3;
      out[0] = lerp(out[0], 0.36, k);
      out[1] = lerp(out[1], 0.18, k);
      out[2] = lerp(out[2], 0.08, k);
    }
    if (ny < -0.4) {
      out[0] *= 0.85;
      out[1] *= 0.84;
      out[2] *= 0.82;
    } // grime under overhangs
  }
  const glass = (c, e) => ({
    color: c,
    rough: 0.05,
    metal: 0.3,
    emis: e || 0.2,
    noise: 0.03,
    grad: [0.9, 1.1],
  });
  const light = (c, e) => ({
    color: c,
    rough: 0.2,
    emis: e || 1.6,
    noise: 0.02,
    grad: [1, 1],
    keepLod: true,
  });
  const rubber = { color: 0x1c1c1a, region: "tire", rough: 0.9, noise: 0.1 };

  // ==================================================================
  // PATROLMAN
  // ==================================================================
  // [body, panel, lamp] per livery
  const PATROL_PAINT = {
    police: [0x1e2a44, 0xd6d4cc, 0xff3020],
    fire: [0x9a2418, 0xd8c070, 0xffb040],
    medical: [0xd8d4c8, 0x9a2a1a, 0x60c8ff],
    utility: [0xb08c3c, 0x4a4234, 0xffd070],
    military: [0x4f5536, 0x2a2a24, 0xff5a20],
  };
