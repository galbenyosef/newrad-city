// play-inline-81 02 — range
// Lines 293-576 of readable/play-inline-81.pretty.js (statement-aligned).
  function pier(x, z, dir, len, w, broken) {
    const r = R;
    const x1 = x + dir * len;
    const a = Math.min(x, x1),
      c = Math.max(x, x1);
    const pb = fb("wood_rotten", x, z);
    const deckLen = broken ? len * r.range(0.25, 0.55) : len;
    const dx1 = x + dir * deckLen;
    M.box(
      fb("concrete", x, z),
      Math.min(x, dx1),
      0.2,
      z - w / 2,
      Math.max(x, dx1),
      1.3,
      z + w / 2,
      { s: 6, c: [0.55, 0.53, 0.5] },
    );
    for (let t = 2; t < len; t += 5)
      for (const s of [-1, 1]) {
        if (broken && t > deckLen && r() < 0.35) continue;
        const px = x + dir * t,
          pz = z + s * (w / 2 - 0.5);
        M.cyl(
          pb,
          px,
          -3,
          pz,
          0.35,
          0.35,
          t > deckLen ? r.range(2.2, 4.5) : 4.2,
          4,
          { c: [0.35, 0.3, 0.25] },
        );
      }
    if (!broken) {
      // long pier shed with a shallow gable roof
      const sw = w - 3,
        sh = r.range(7, 11);
      const s0 = Math.min(x + dir * 6, x + dir * (len - 4)),
        s1 = Math.max(x + dir * 6, x + dir * (len - 4));
      const tint = r.pick([
        [0.62, 0.55, 0.48],
        [0.5, 0.52, 0.5],
        [0.7, 0.5, 0.4],
      ]);
      const cb = fb("metal_painted", x, z);
      M.box(cb, s0, 1.3, z - sw / 2, s1, 1.3 + sh, z + sw / 2, {
        s: 3,
        c: tint,
        skip: 4 + 8,
      });
      const ry = 1.3 + sh,
        rp = ry + sw * 0.18;
      M.quad(
        cb,
        [s0, ry, z - sw / 2],
        [s1, ry, z - sw / 2],
        [s1, rp, z],
        [s0, rp, z],
        [0, 0.9, -0.4],
        [0, 0, (s1 - s0) / 3, 0, (s1 - s0) / 3, 2, 0, 2],
        M.mulc(tint, 0.8),
      );
      M.quad(
        cb,
        [s1, ry, z + sw / 2],
        [s0, ry, z + sw / 2],
        [s0, rp, z],
        [s1, rp, z],
        [0, 0.9, 0.4],
        [0, 0, (s1 - s0) / 3, 0, (s1 - s0) / 3, 2, 0, 2],
        M.mulc(tint, 0.8),
      );
      for (const xe of [s0, s1])
        M.tri(
          cb,
          [xe, ry, z - sw / 2],
          [xe, ry, z + sw / 2],
          [xe, rp, z],
          [xe === s0 ? -1 : 1, 0, 0],
          [0, 0, 2, 0, 1, 1],
          tint,
        );
      // collapsed roof section on some
      if (r() < 0.35) {
        const m = (s0 + s1) / 2;
        M.obox(
          fb("rust", m, z),
          m,
          ry - 2,
          z,
          r.range(8, 14),
          0.4,
          sw * 0.9,
          0.1,
          { roll: 0.35, c: [0.45, 0.38, 0.32] },
        );
      }
    }
    void a;
    void c;
  }
  /** Container / port gantry crane at (x,z), boom reaching toward the water (dir ±1 on x, or on z when alongZ). */
  function gantry(x, z, dir, s, alongZ) {
    s = s || 1;
    const b = fb("rust", x, z);
    const col = R.pick([
      [0.8, 0.42, 0.22],
      [0.75, 0.62, 0.25],
      [0.55, 0.5, 0.45],
    ]);
    const H = 38 * s,
      span = 16 * s,
      dep = 12 * s;
    const P = (u, y, v) =>
      alongZ ? [x + v, y, z + u * dir] : [x + u * dir, y, z + v];
    for (const u of [-span / 2, span / 2])
      for (const v of [-dep / 2, dep / 2]) {
        const A = P(u, 0, v),
          B = P(u, H, v);
        M.beam(b, A[0], A[1], A[2], B[0], B[1], B[2], 1.1 * s, 1.1 * s, {
          c: col,
        });
      }
    for (const v of [-dep / 2, dep / 2]) {
      const A = P(-span / 2, H, v),
        B = P(span / 2 + 34 * s, H, v);
      M.beam(b, A[0], A[1], A[2], B[0], B[1], B[2], 1.2 * s, 1.8 * s, {
        c: col,
      });
      const C = P(-span / 2, 12 * s, v),
        D = P(span / 2, 12 * s, v);
      M.beam(b, C[0], C[1], C[2], D[0], D[1], D[2], 0.8 * s, 0.8 * s, {
        c: col,
      });
    }
    // A-frame and stays
    const apex = P(0, H + 14 * s, 0);
    for (const v of [-dep / 2, dep / 2]) {
      const A = P(-span / 2, H, v),
        B = P(span / 2, H, v);
      M.beam(b, A[0], A[1], A[2], apex[0], apex[1], apex[2], 0.7 * s, 0.7 * s, {
        c: col,
      });
      M.beam(b, B[0], B[1], B[2], apex[0], apex[1], apex[2], 0.7 * s, 0.7 * s, {
        c: col,
      });
      const T = P(span / 2 + 34 * s, H, v);
      M.beam(b, apex[0], apex[1], apex[2], T[0], T[1], T[2], 0.3 * s, 0.3 * s, {
        c: col,
      });
    }
    // machinery house on the trolley
    const mh = P(span / 2 + 8 * s, H + 1.8 * s, 0);
    M.box(
      fb("metal_painted", x, z),
      mh[0] - 3 * s,
      H + 0.8 * s,
      mh[2] - 3 * s,
      mh[0] + 3 * s,
      H + 4.5 * s,
      mh[2] + 3 * s,
      { s: 3, c: M.mulc(col, 0.9) },
    );
  }
  /** Tank farm (Bayonne oil tanks). */
  function tanks(x0, z0, x1, z1, n) {
    const r = R;
    for (let i = 0; i < n; i++) {
      const x = r.range(x0, x1),
        z = r.range(z0, z1),
        rr = r.range(10, 18),
        h = r.range(10, 16);
      M.cyl(fb("metal_painted", x, z), x, 0, z, rr, rr, h, 14, {
        capTop: true,
        c: r.pick([
          [0.72, 0.72, 0.68],
          [0.62, 0.6, 0.55],
          [0.55, 0.45, 0.35],
        ]),
      });
      M.cyl(fb("rust", x, z), x, h * 0.3, z, rr + 0.1, rr + 0.1, h * 0.15, 14, {
        c: [0.45, 0.35, 0.28],
      });
    }
  }
  /** Striped power-station stacks. */
  function stacks(x, z, n) {
    for (let i = 0; i < n; i++) {
      const sx = x,
        sz = z + i * 22;
      const H = 95,
        rr = 4.2;
      for (let k = 0; k < 6; k++) {
        const y0 = (k * H) / 6,
          y1 = ((k + 1) * H) / 6;
        M.cyl(
          fb(k % 2 ? "concrete" : "paint_red", sx, sz),
          sx,
          y0,
          sz,
          rr - k * 0.25,
          rr - (k + 1) * 0.25,
          y1 - y0,
          10,
          { c: k % 2 ? [0.88, 0.86, 0.82] : [0.9, 0.35, 0.3] },
        );
      }
    }
    // the turbine hall at their feet
    tower(x - 30, z - 20, x + 15, z + n * 22 + 10, 34, {
      style: "warehouse",
      v: 2,
      tint: [0.72, 0.52, 0.44],
      flat: true,
    });
  }
  /** Rocky cliff face (the Palisades) along x = xf from za to zb, facing +x. */
  function palisades(xf, za, zb) {
    const r = R;
    const b = fb("my/rock", xf, (za + zb) / 2);
    let z = za;
    while (z < zb) {
      const seg = r.range(14, 30),
        h = r.range(38, 58),
        lean = r.range(4, 10);
      const z1 = Math.min(zb, z + seg);
      // face (slightly leaning back) + talus apron
      M.quad(
        b,
        [xf, 0, z],
        [xf, 0, z1],
        [xf - lean, h, z1],
        [xf - lean, h, z],
        [1, 0.15, 0],
        [z / 12, 0, z1 / 12, 0, z1 / 12, h / 12, z / 12, h / 12],
        [0.42, 0.4, 0.37],
        [0.62, 0.6, 0.55],
      );
      M.quad(
        b,
        [xf + 16, -1, z],
        [xf + 16, -1, z1],
        [xf, 6, z1],
        [xf, 6, z],
        [1, 1.6, 0],
        [z / 12, 0, z1 / 12, 0, z1 / 12, 1.4, z / 12, 1.4],
        [0.5, 0.48, 0.42],
        [0.45, 0.43, 0.4],
      );
      // wooded top (dead trees): a darker cap band
      M.quad(
        b,
        [xf - lean, h, z],
        [xf - lean, h, z1],
        [xf - lean - 60, h + 2, z1],
        [xf - lean - 60, h + 2, z],
        [0, 1, 0],
        [0, 0, 4, 0, 4, 4, 0, 4],
        [0.36, 0.33, 0.24],
      );
      if (r() < 0.55) {
        // apartment towers on the cliff top (Fort Lee / Cliffside)
        const tx1 = xf - lean - r.range(8, 40),
          tx0 = tx1 - r.range(18, 28);
        tower(tx0, z, tx1, z + r.range(16, 24), r.range(30, 80), {
          base: h,
          style: r() < 0.5 ? "office" : "apartment",
          v: r.int(1, 2),
          lit: r() < 0.15,
          tint: r.pick(TINTS),
        });
      }
      z = z1;
    }
  }

  /**
   * Waterfront edge of a far land plate: a soot-dark stone bulkhead with a rust/algae waterline band,
   * a timber fender of piles, riprap boulders tumbled at its foot and now and then a half-sunk barge —
   * so the far shores read as a real waterfront instead of a pale slab sitting on the water.
   * Runs along x = x0 (alongZ, facing ±x = dir) or z = x0 (!alongZ, facing ±z) from a to b.
   */
