// play-inline-229 04 — rigframe
// Lines 389-419 of readable/play-inline-229.pretty.js (statement-aligned).
  function rigFrame(C, x, y, z, ry, key, o) {
    const b = C.b,
      k = key || "metal_olive",
      s = (o && o.s) || 1;
    const P = (lx, ly, lz) => {
      const p = LI.rot(lx * s, lz * s, x, z, ry);
      return [p[0], y + ly * s, p[1]];
    };
    const bx = (lx, ly, lz, w, h, d, kk, extra) => {
      const p = P(lx, ly, lz);
      b.obox(kk || k, p[0], p[1], p[2], w * s, h * s, d * s, ry, extra);
    };
    bx(0, 1.35, 0, 0.62, 0.62, 0.44); // torso
    bx(0, 1.02, 0, 0.5, 0.2, 0.36, "metal_dark"); // waist
    bx(0, 1.5, -0.24, 0.5, 0.36, 0.08); // chest plate
    bx(0, 1.36, 0.27, 0.46, 0.5, 0.14, "metal_dark"); // backpack / rig battery housing
    const hp = P(0, 1.84, 0);
    b.sphere(k, hp[0], hp[1], hp[2], 0.2 * s, { ws: 10, hs: 8, sy: 1.1 });
    const vp = P(0, 1.84, -0.17);
    b.obox("glass_dark", vp[0], vp[1], vp[2], 0.26 * s, 0.1 * s, 0.06 * s, ry);
    for (const sd of [-1, 1]) {
      bx(sd * 0.42, 1.55, 0, 0.3, 0.26, 0.34); // pauldron
      bx(sd * 0.44, 1.2, 0, 0.18, 0.44, 0.2, "metal_dark");
      bx(sd * 0.44, 0.9, -0.05, 0.2, 0.3, 0.22); // forearm
      bx(sd * 0.16, 0.7, 0, 0.22, 0.44, 0.26); // thigh
      bx(sd * 0.16, 0.26, 0, 0.2, 0.46, 0.24, "metal_dark"); // shin
      bx(sd * 0.16, 0.05, -0.06, 0.24, 0.1, 0.34); // boot
    }
  }
  LI.rigFrame = rigFrame;

