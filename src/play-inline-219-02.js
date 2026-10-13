// play-inline-219 02 — box
// Lines 15-67 of readable/play-inline-219.pretty.js (statement-aligned).
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  function container(b, x, y, z, ry, color, opts) {
    opts = opts || {};
    const L = 6.1,
      W = 2.44,
      H = 2.6;
    b.box("corrugated", x, y, z, L, H, W, {
      ry,
      seg: false,
      c: color,
      grime: 0.7,
    });
    // corner castings & frame rails
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const [cx, cz] = PH.rot(
          x,
          z,
          ry,
          sx * (L / 2 - 0.08),
          sz * (W / 2 - 0.08),
        );
        b.box("rust", cx, y, cz, 0.2, H + 0.02, 0.2, { ry, seg: false });
      }
    for (const yy of [y, y + H - 0.12])
      for (const sz of [-1, 1]) {
        const [cx, cz] = PH.rot(x, z, ry, 0, sz * (W / 2 - 0.02));
        b.box("rust", cx, yy, cz, L, 0.14, 0.08, { ry, seg: false });
      }
    // door end: two leaves with locking bars
    const [dx, dz] = PH.rot(x, z, ry, L / 2 + 0.02, 0);
    b.box("panel", dx, y + 0.05, dz, 0.05, H - 0.1, W - 0.12, {
      ry,
      seg: false,
      c: color,
    });
    for (const s of [-0.75, -0.3, 0.3, 0.75]) {
      const [bx, bz] = PH.rot(x, z, ry, L / 2 + 0.07, s);
      b.box("iron", bx, y + 0.1, bz, 0.05, H - 0.2, 0.05, { ry, seg: false });
    }
    if (opts.open) {
      const [ox, oz] = PH.rot(x, z, ry, L / 2 + 0.6, W / 2 + 0.4);
      b.box("panel", ox, y + 0.05, oz, 0.05, H - 0.1, W / 2, {
        ry: ry + 1.1,
        seg: false,
        c: color,
      });
    }
    PH.col(x, z, L, W, y, y + H, ry, { walkable: true, surface: "metal" });
  }

