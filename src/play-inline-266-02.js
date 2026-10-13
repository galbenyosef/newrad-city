// play-inline-266 02 — key
// Lines 29-75 of readable/play-inline-266.pretty.js (statement-aligned).
  const P = G._ues,
    D = P.dress,
    A = P.arch;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;

  /** Chinese-Chippendale railing panel run along a line (X lattice between rails). */
  function chippendale(S, ax, az, bx, bz, y, h, key, o) {
    o = o || {};
    const b = S.b,
      L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(L / 0.9));
    const ang = Math.atan2(bz - az, bx - ax);
    b.rod(key, [ax, y + h, az], [bx, y + h, bz], 0.04, 4, {
      square: true,
      r2: 0.06,
    });
    b.rod(key, [ax, y + 0.1, az], [bx, y + 0.1, bz], 0.035, 4, {
      square: true,
      r2: 0.05,
    });
    for (let i = 0; i < n; i++) {
      const t0 = i / n,
        t1 = (i + 1) / n;
      const p0 = [ax + (bx - ax) * t0, az + (bz - az) * t0],
        p1 = [ax + (bx - ax) * t1, az + (bz - az) * t1];
      b.rod(key, [p0[0], y + 0.1, p0[1]], [p1[0], y + h, p1[1]], 0.02, 3, {
        square: true,
      });
      b.rod(key, [p0[0], y + h, p0[1]], [p1[0], y + 0.1, p1[1]], 0.02, 3, {
        square: true,
      });
      b.rod(key, [p0[0], y + 0.1, p0[1]], [p0[0], y + h, p0[1]], 0.025, 3, {
        square: true,
      });
    }
    if (o.col !== false)
      S.colR((ax + bx) / 2, (az + bz) / 2, L, 0.12, y, y + h, -ang, {
        walkable: false,
      });
  }
  P.chippendale = chippendale;

  // ===================================================================
  // EXTERIOR
  // ===================================================================
