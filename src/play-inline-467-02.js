// play-inline-467 02 — out
// Lines 23-103 of readable/play-inline-467.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim;
  const lerp = L.lerp,
    clamp = L.clamp;
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
  function rustPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    const n = L.noise3(wx * 11, wy * 11, wz * 11);
    if (n > 0.7) {
      const k = (n - 0.7) * 3;
      out[0] = lerp(out[0], 0.36, k);
      out[1] = lerp(out[1], 0.18, k);
      out[2] = lerp(out[2], 0.08, k);
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
  const light = (c, e) => ({
    color: c,
    rough: 0.2,
    emis: e || 1.6,
    noise: 0.02,
    grad: [1, 1],
    keepLod: true,
  });
  const hose = (R, bone, pts, r, mat, ribs) => {
    const n = ribs || 8;
    return R.add(
      bone,
      P.sweep(
        pts,
        (t) => r * (1 + 0.18 * Math.max(0, Math.sin(t * n * PI * 2))),
        { seg: n * 4, rs: 8 },
      ),
      mat,
    );
  };

  // ==================================================================
  // THINKER
  // ==================================================================
