// play-inline-273 08 — ang
// Lines 1759-1841 of readable/play-inline-273.pretty.js (statement-aligned).
  X.urn = function (b, x, y, z, s, k) {
    s = s || 1;
    k = k || "limestone_warm";
    b.box(
      k,
      x - 0.3 * s,
      y,
      z - 0.3 * s,
      x + 0.3 * s,
      y + 0.5 * s,
      z + 0.3 * s,
      { seg: false },
    );
    b.lathe(
      k,
      [
        [0.001, 0],
        [0.18, 0],
        [0.12, 0.12],
        [0.3, 0.45],
        [0.26, 0.7],
        [0.16, 0.78],
        [0.22, 0.86],
        [0.001, 0.9],
      ].map((p) => [p[0] * s, p[1] * s]),
      10,
      x,
      y + 0.5 * s,
      z,
    );
  };

  /** Stone balustrade along a straight segment (plinth, balusters, rail) with collider. */
  X.balustrade = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = S.b,
      k = o.key || "limestone_warm",
      h = o.h || 1.0;
    const L = Math.hypot(x1 - x0, z1 - z0),
      ang = Math.atan2(z1 - z0, x1 - x0),
      cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    b.box(k, cx - L / 2, y, cz - 0.2, cx + L / 2, y + 0.2, cz + 0.2, {
      ry: -ang,
      seg: false,
    });
    b.box(
      k,
      cx - L / 2,
      y + h - 0.16,
      cz - 0.22,
      cx + L / 2,
      y + h,
      cz + 0.22,
      { ry: -ang, seg: false },
    );
    const n = Math.floor(L / 0.32);
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        px = x0 + (x1 - x0) * t,
        pz = z0 + (z1 - z0) * t;
      if (o.broken && P.rng(px * 7 + pz)() < o.broken) continue;
      b.lathe(
        k,
        [
          [0.001, 0],
          [0.08, 0],
          [0.05, 0.12],
          [0.09, (h - 0.36) * 0.45],
          [0.05, h - 0.4],
          [0.07, h - 0.36],
          [0.001, h - 0.36],
        ],
        6,
        px,
        y + 0.2,
        pz,
        { noAO: true },
      );
    }
    if (o.col !== false)
      S.colR(cx, cz, L, 0.4, y, y + h, -ang, { walkable: false });
  };
