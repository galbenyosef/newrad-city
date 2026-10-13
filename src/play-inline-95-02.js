// play-inline-95 02 — sitting
// Lines 323-393 of readable/play-inline-95.pretty.js (statement-aligned).
  function skeleton(x, z, yaw, r, sitting, layer, y) {
    const bb = M.buf("bone", x, z, layer || "detail");
    const c = M.mulc([0.86, 0.82, 0.72], r.range(0.8, 1));
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const yb = y || 0;
    const P = (a, b, yy) => [x + a * ca + b * sa, yy + yb, z - a * sa + b * ca];
    const y0 = sitting ? 0.45 : 0.08;
    // skull
    const sk = sitting ? P(0, 0, 0.95) : P(0, -0.85, 0.12);
    M.cyl(bb, sk[0], sk[1] - 0.1, sk[2], 0.09, 0.1, 0.2, 7, {
      capTop: true,
      c,
    });
    M.cyl(bb, sk[0], sk[1] + 0.02, sk[2], 0.1, 0.05, 0.1, 7, {
      capTop: true,
      c,
    });
    // spine & ribs
    const s0 = sitting ? P(0, 0.05, 0.25) : P(0, -0.1, y0),
      s1 = sitting ? P(0, 0.05, 0.85) : P(0, -0.75, y0);
    M.pipe(bb, s0[0], s0[1], s0[2], s1[0], s1[1], s1[2], 0.03, 4, { c });
    for (let i = 0; i < 5; i++) {
      const t = 0.3 + i * 0.12;
      const m = [
        s0[0] + (s1[0] - s0[0]) * t,
        s0[1] + (s1[1] - s0[1]) * t,
        s0[2] + (s1[2] - s0[2]) * t,
      ];
      for (const sd of [-1, 1]) {
        const q = sitting
          ? P(sd * 0.17, 0.12, m[1] - yb - 0.04)
          : [m[0] + sd * 0.17 * ca, yb + y0 + 0.08, m[2] - sd * 0.17 * sa];
        M.pipe(bb, m[0], m[1], m[2], q[0], q[1], q[2], 0.015, 3, { c });
      }
    }
    // pelvis, limbs
    const pe = s0;
    for (const sd of [-1, 1]) {
      const kn = sitting
        ? P(sd * 0.18, -0.35, 0.5)
        : P(sd * 0.15 + r.range(-0.05, 0.05), 0.45, y0);
      const ft = sitting
        ? P(sd * 0.22, -0.8, 0.06)
        : P(sd * 0.2 + r.range(-0.1, 0.1), 0.9, y0);
      M.pipe(bb, pe[0], pe[1], pe[2], kn[0], kn[1], kn[2], 0.025, 4, { c });
      M.pipe(bb, kn[0], kn[1], kn[2], ft[0], ft[1], ft[2], 0.022, 4, { c });
      const sh = sitting ? P(sd * 0.2, 0.05, 0.8) : P(sd * 0.2, -0.65, y0);
      const el = sitting
        ? P(sd * 0.3, -0.15, 0.5)
        : P(sd * 0.35 + r.range(-0.1, 0.1), -0.35 + r.range(-0.2, 0.2), y0);
      const hd = sitting
        ? P(sd * 0.3, -0.35, 0.35)
        : P(sd * 0.4 + r.range(-0.2, 0.2), -0.05 + r.range(-0.2, 0.2), y0);
      M.pipe(bb, sh[0], sh[1], sh[2], el[0], el[1], el[2], 0.02, 4, { c });
      M.pipe(bb, el[0], el[1], el[2], hd[0], hd[1], hd[2], 0.018, 4, { c });
    }
    if (!layer || layer === "detail")
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x,
        yb + 0.05,
        z,
        1.8,
        1.8,
        r() * 6,
        M.MARK.STAIN,
        [0.8, 0.8, 0.8],
      );
  }
  M.skeleton = skeleton;
