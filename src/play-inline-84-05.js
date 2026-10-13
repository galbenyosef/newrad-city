// play-inline-84 05 — buf
// Lines 1093-1389 of readable/play-inline-84.pretty.js (statement-aligned).
  function buildCarousel() {
    const P = PIECES.carousel,
      x = P.x,
      z = P.z,
      r = M.rng("carousel");
    const bk = M.buf("brick_red", x, z, "main"),
      st = M.buf("stone_limestone", x, z, "main");
    const R = 9.2,
      WH = 4.6,
      n = 8;
    const corner = (i) => {
      const a = ((i + 0.5) / n) * Math.PI * 2;
      return [x + Math.cos(a) * R, z + Math.sin(a) * R];
    };
    // octagon: each side = two brick piers + an arched opening (lintel band above) — one side walled
    for (let i = 0; i < n; i++) {
      const a = corner(i),
        b2 = corner(i + 1);
      const len = Math.hypot(b2[0] - a[0], b2[1] - a[1]),
        ux = (b2[0] - a[0]) / len,
        uz = (b2[1] - a[1]) / len;
      const nx = uz,
        nz = -ux; // outward (a→b runs CCW seen from above with +z south → right-hand side is out)
      const Pp = (t) => [a[0] + ux * t, a[1] + uz * t];
      const pier = 1.1;
      const walled = i === 5;
      const segs = walled
        ? [[0, len]]
        : [
            [0, pier],
            [len - pier, len],
          ];
      for (const [t0, t1] of segs) {
        const p0 = Pp(t0),
          p1 = Pp(t1);
        M.wall(
          bk,
          p0[0],
          p0[1],
          p1[0],
          p1[1],
          0,
          WH,
          t0 / 2.7,
          t1 / 2.7,
          0,
          WH / 2.7,
          [0.62, 0.52, 0.46],
          [0.8, 0.7, 0.62],
        );
        M.wall(
          bk,
          p1[0] - nx * 0.45,
          p1[1] - nz * 0.45,
          p0[0] - nx * 0.45,
          p0[1] - nz * 0.45,
          0,
          WH,
          t1 / 2.7,
          t0 / 2.7,
          0,
          WH / 2.7,
          [0.5, 0.42, 0.38],
          [0.66, 0.58, 0.52],
        );
        M.ocol(
          (p0[0] + p1[0]) / 2 - nx * 0.22,
          (p0[1] + p1[1]) / 2 - nz * 0.22,
          t1 - t0,
          0.45,
          0,
          WH,
          -Math.atan2(uz, ux),
          { tag: "building_wall" },
        );
      }
      if (!walled) {
        // jambs of the opening + the arch spandrel above it (segmental arch approximated by a stepped band)
        const o0 = Pp(pier),
          o1 = Pp(len - pier);
        for (const [q, s2] of [
          [o0, 1],
          [o1, -1],
        ])
          M.quad(
            bk,
            [q[0], 0, q[1]],
            [q[0] - nx * 0.45, 0, q[1] - nz * 0.45],
            [q[0] - nx * 0.45, WH, q[1] - nz * 0.45],
            [q[0], WH, q[1]],
            [ux * s2, 0, uz * s2],
            [0, 0, 0.2, 0, 0.2, 1.7, 0, 1.7],
            [0.6, 0.5, 0.44],
          );
        const open = len - 2 * pier,
          steps = 6;
        for (let k = 0; k < steps; k++) {
          const t0 = pier + (open * k) / steps,
            t1 = pier + (open * (k + 1)) / steps,
            tm = (k + 0.5) / steps;
          const yb = 3.2 + 0.7 * Math.sin(Math.PI * tm);
          const p0 = Pp(t0),
            p1 = Pp(t1);
          M.wall(
            bk,
            p0[0],
            p0[1],
            p1[0],
            p1[1],
            yb,
            WH,
            t0 / 2.7,
            t1 / 2.7,
            yb / 2.7,
            WH / 2.7,
            [0.66, 0.56, 0.5],
            [0.8, 0.7, 0.62],
          );
          M.quad(
            st,
            [p0[0], yb, p0[1]],
            [p1[0], yb, p1[1]],
            [p1[0] - nx * 0.45, yb, p1[1] - nz * 0.45],
            [p0[0] - nx * 0.45, yb, p0[1] - nz * 0.45],
            [0, -1, 0],
            [0, 0, 1, 0, 1, 0.2, 0, 0.2],
            [0.7, 0.68, 0.62],
          );
        }
      }
      // limestone cornice band
      const c0 = corner(i),
        c1 = corner(i + 1);
      M.beam(
        st,
        c0[0] + (c0[0] - x) * 0.02,
        WH + 0.2,
        c0[1] + (c0[1] - z) * 0.02,
        c1[0] + (c1[0] - x) * 0.02,
        WH + 0.2,
        c1[1] + (c1[1] - z) * 0.02,
        0.6,
        0.4,
        { c: [0.8, 0.78, 0.72] },
      );
    }
    // roof: shallow octagonal pyramid with a lantern; two facets caved in (rafters showing)
    const rb = M.buf("roof_tar", x, z, "main"),
      rf = M.buf("wood_rotten", x, z, "detail");
    const RH = 3.2;
    for (let i = 0; i < n; i++) {
      const a = corner(i),
        b2 = corner(i + 1);
      const A = [a[0] + (a[0] - x) * 0.07, WH + 0.4, a[1] + (a[1] - z) * 0.07],
        B = [b2[0] + (b2[0] - x) * 0.07, WH + 0.4, b2[1] + (b2[1] - z) * 0.07];
      const top = [x, WH + 0.4 + RH, z];
      const mx = (A[0] + B[0]) / 2 - x,
        mz = (A[2] + B[2]) / 2 - z;
      const nn = v3n([mx, R * 1.1, mz]);
      if (i === 1 || i === 2) {
        // collapsed: only the rafters remain, the sheathing hangs into the hall
        for (let k = 1; k < 5; k++) {
          const t = k / 5;
          M.beam(
            rf,
            A[0] + (B[0] - A[0]) * t,
            A[1],
            A[2] + (B[2] - A[2]) * t,
            x + (A[0] + (B[0] - A[0]) * t - x) * 0.25,
            top[1] - 0.8 + (i === 2 && k === 3 ? -1.8 : 0),
            z + (A[2] + (B[2] - A[2]) * t - z) * 0.25,
            0.12,
            0.18,
            { c: [0.45, 0.38, 0.3] },
          );
        }
        M.quad(
          rb,
          A,
          [A[0] + (x - A[0]) * 0.35, A[1] - 1.6, A[2] + (z - A[2]) * 0.35],
          [B[0] + (x - B[0]) * 0.35, B[1] - 2.1, B[2] + (z - B[2]) * 0.35],
          B,
          [0, 1, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.45, 0.43, 0.4],
        );
        continue;
      }
      M.tri(rb, A, B, top, nn, [0, 0, 2, 0, 1, 1.5], [0.5, 0.48, 0.45]);
      M.tri(
        rb,
        B,
        A,
        top,
        [-nn[0], -nn[1], -nn[2]],
        [0, 0, 2, 0, 1, 1.5],
        [0.3, 0.28, 0.26],
      ); // underside (seen from inside)
    }
    M.cyl(
      M.buf("metal_painted", x, z, "main"),
      x,
      WH + 0.4 + RH - 0.4,
      z,
      1.1,
      0.9,
      1.2,
      8,
      { c: [0.35, 0.45, 0.4], capTop: true },
    );
    M.cyl(
      M.buf("metal_painted", x, z, "main"),
      x,
      WH + 0.4 + RH + 0.8,
      z,
      0.9,
      0.05,
      1.1,
      8,
      { c: [0.33, 0.43, 0.38] },
    );
    // floor + the carousel: tilted platform (a bearing gave way), centre column, canopy stub, horses on bent poles
    M.poly(
      M.buf("concrete", x, z, "main"),
      Array.from({ length: n }, (_, i) => corner(i)),
      0.04,
      { s: 3, c: [0.55, 0.53, 0.5], convex: true },
    );
    const tilt = 0.06,
      pr = 6.2;
    const cm = M.buf("metal_painted", x, z, "main"),
      hb = M.buf("metal_painted", x, z, "detail");
    M.pushXF(M.mtx(x, 0.35, z, 0.3, tilt, 0));
    M.cyl(M.buf("wood_rotten", x, z, "main"), 0, 0, 0, pr, pr, 0.3, 24, {
      c: [0.55, 0.45, 0.36],
      capTop: true,
    });
    M.cyl(cm, 0, 0.3, 0, 0.9, 0.9, 3.9, 12, { c: [0.6, 0.3, 0.25] }); // centre column (mirror panels long gone)
    M.cyl(cm, 0, 4.2, 0, pr + 0.3, 1.0, 1.1, 24, {
      c: [0.55, 0.48, 0.3],
      capBot: true,
    }); // canopy cone
    const cols = [
      [0.82, 0.78, 0.7],
      [0.55, 0.36, 0.28],
      [0.3, 0.3, 0.32],
      [0.78, 0.66, 0.4],
      [0.6, 0.62, 0.58],
    ];
    for (let ring = 0; ring < 2; ring++) {
      const rr = ring === 0 ? pr - 0.9 : pr - 2.4,
        cnt = ring === 0 ? 12 : 8;
      for (let i = 0; i < cnt; i++) {
        const a = (i / cnt) * Math.PI * 2 + ring * 0.2;
        const hx = Math.cos(a) * rr,
          hz = Math.sin(a) * rr;
        const k = r();
        if (k < 0.12) continue; // missing
        if (k < 0.24) {
          horse(hb, hx * 0.95, 0.55, hz * 0.95, -a, r.pick(cols), 1.45);
          continue;
        } // fallen off its pole
        const hy = 1.25 + Math.sin(i * 1.7) * 0.35;
        M.pipe(hb, hx, 0.3, hz, hx + (k < 0.35 ? 0.3 : 0), 4.2, hz, 0.035, 5, {
          c: [0.75, 0.66, 0.4],
        });
        horse(hb, hx, hy, hz, -a, r.pick(cols), (r() - 0.5) * 0.2);
      }
    }
    M.popXF();
    // colliders: platform (walkable), centre column
    M.ocol(x, z, pr * 1.4, pr * 1.4, 0, 0.7, 0.3, {
      tag: "platform",
      surface: "wood",
    });
    M.box3(x - 0.9, 0.5, z - 0.9, x + 0.9, 4.5, z + 0.9, {
      tag: "column",
      walkable: false,
    });
    // leaves blown in, a skeleton slumped against the column
    const mk = M.buf("my/markings", x, z, "fine");
    for (let i = 0; i < 6; i++)
      M.decal(
        mk,
        x + r.range(-7, 7),
        0.06,
        z + r.range(-7, 7),
        r.range(2, 4),
        r.range(2, 4),
        r() * 6,
        r() < 0.6 ? M.MARK.LEAVES : M.MARK.DIRT,
      );
  }

  // -------------------------------------------------------------------
  // 5. Playground (south-west corner)
  // -------------------------------------------------------------------
