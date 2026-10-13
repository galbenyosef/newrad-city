// play-inline-85 13 — drop
// Lines 2882-2990 of readable/play-inline-85.pretty.js (statement-aligned).
  function awning(P, tL, tR, y, nx, nz, r, cx, cz) {
    const depth = r.range(1.3, 1.9),
      drop = 0.7;
    const torn = r() < 0.35;
    const cols = [
      [0.55, 0.18, 0.15],
      [0.2, 0.35, 0.25],
      [0.2, 0.25, 0.4],
      [0.6, 0.5, 0.25],
      [0.35, 0.3, 0.28],
    ];
    const c1 = r.pick(cols),
      c2 = r() < 0.5 ? [0.8, 0.76, 0.66] : c1;
    const b = M.buf("fabric@ds", cx, cz, "detail");
    const n = Math.max(2, Math.round((tR - tL) / 0.6));
    for (let i = 0; i < n; i++) {
      if (torn && r() < 0.3) continue;
      const t0 = tL + ((tR - tL) * i) / n,
        t1 = tL + ((tR - tL) * (i + 1)) / n;
      const dd = torn ? depth * r.range(0.4, 1) : depth;
      const A = P(t0, 0.05),
        B = P(t1, 0.05),
        C = P(t1, dd),
        D = P(t0, dd);
      const col = i % 2 ? c1 : c2;
      M.quad(
        b,
        [A[0], y, A[1]],
        [B[0], y, B[1]],
        [C[0], y - drop, C[1]],
        [D[0], y - drop, D[1]],
        [nx * 0.5, 0.85, nz * 0.5],
        [0, 0, 1, 0, 1, 1, 0, 1],
        col,
      );
      M.quad(
        b,
        [D[0], y - drop, D[1]],
        [C[0], y - drop, C[1]],
        [C[0], y - drop - 0.35, C[1]],
        [D[0], y - drop - 0.35, D[1]],
        [nx, 0, nz],
        [0, 0, 1, 0, 1, 0.3, 0, 0.3],
        M.mulc(col, 0.85),
      );
    }
    // frame
    const fb = M.buf("rust", cx, cz, "detail");
    const A = P(tL, depth),
      B = P(tR, depth);
    M.beam(fb, A[0], y - drop, A[1], B[0], y - drop, B[1], 0.04, 0.04, {
      c: [0.4, 0.35, 0.3],
    });
  }
  function baseWindows(lot, x0, z0, x1, z1, y0, y1, r) {
    const fr = frontSides(lot);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const gl = M.buf("glass_dirty", cx, cz);
    const sides = [
      ["n", x0, z0, x1, z0, 0, -1],
      ["e", x1, z0, x1, z1, 1, 0],
      ["s", x1, z1, x0, z1, 0, 1],
      ["w", x0, z1, x0, z0, -1, 0],
    ];
    for (const [k, ax, az, bx, bz, nx, nz] of sides) {
      if (!fr[k]) continue;
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.floor(len / 3.2);
      const ux = (bx - ax) / len,
        uz = (bz - az) / len;
      for (let i = 0; i < n; i++) {
        const t = ((i + 0.5) * len) / n;
        if (Math.abs(t - len / 2) < 2) continue; // entrance
        const px = ax + ux * t + nx * 0.03,
          pz = az + uz * t + nz * 0.03;
        for (const [wy0, wy1] of [
          [y0, y0 + 2.0],
          [y0 + 3.4, y1],
        ]) {
          const c =
            r() < 0.4
              ? [0.06, 0.06, 0.06]
              : r() < 0.2
                ? [0.6, 0.5, 0.35]
                : [0.45, 0.47, 0.44];
          M.quad(
            gl,
            [px - ux * 0.7, wy0, pz - uz * 0.7],
            [px + ux * 0.7, wy0, pz + uz * 0.7],
            [px + ux * 0.7, wy1, pz + uz * 0.7],
            [px - ux * 0.7, wy1, pz - uz * 0.7],
            [nx, 0, nz],
            [0, 0, 1, 0, 1, 1, 0, 1],
            c,
          );
        }
      }
    }
  }
  const DOOR_HW = 1.3,
    DOOR_H = 3.4; // old-world entrance opening (half width, height)
  /**
   * Old-world apartment entrance behind the opening at (px,pz) in a façade with outward normal (nx,nz):
   * a 1 m stone vestibule, bronze-framed double doors at its back (one leaf swung in, panes broken)
   * with a transom, and a dim lobby — cracked hex-tile floor, dado, brass mailbox bank, the foot of the
   * stairs, a dead pendant lamp, drifted leaves and a daylight pool. Visual only (the building's
   * collider still closes the lot); own rng stream so the building's rng sequence is untouched.
   */
