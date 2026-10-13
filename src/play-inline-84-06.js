// play-inline-84 06 — math
// Lines 1390-1703 of readable/play-inline-84.pretty.js (statement-aligned).
  function buildPlayground() {
    const P = PIECES.playground,
      x = P.x,
      z = P.z,
      r = M.rng("playground");
    const rs = M.buf("rust", x, z, "detail"),
      mp = M.buf("metal_painted", x, z, "detail");
    const RC = [0.55, 0.38, 0.3];
    // safety-surface patch (cracked rubber) and sand
    M.poly(
      M.buf("concrete", x, z, "main"),
      [
        [P.x0 + 1, P.z0 + 1],
        [P.x1 - 1, P.z0 + 1],
        [P.x1 - 1, P.z1 - 1],
        [P.x0 + 1, P.z1 - 1],
      ],
      0.03,
      { s: 2, c: [0.62, 0.42, 0.36], convex: true },
    ); // faded red safety surface
    const mk = M.buf("my/markings", x, z, "fine");
    for (let i = 0; i < 8; i++)
      M.decal(
        mk,
        x + r.range(-9, 9),
        0.05,
        z + r.range(-6, 6),
        r.range(2, 4),
        r.range(2, 4),
        r() * 6,
        r.pick([M.MARK.CRACKS, M.MARK.DIRT, M.MARK.LEAVES, M.MARK.PUDDLE]),
      );
    // swings: A-frame, three seats (one chain snapped, one wrapped over the bar)
    const sx = x - 5,
      sz = z - 3.5;
    for (const e of [-3, 3]) {
      M.beam(rs, sx + e, 0, sz - 1.4, sx + e, 2.6, sz, 0.09, 0.09, { c: RC });
      M.beam(rs, sx + e, 0, sz + 1.4, sx + e, 2.6, sz, 0.09, 0.09, { c: RC });
    }
    M.pipe(rs, sx - 3, 2.6, sz, sx + 3, 2.6, sz, 0.07, 6, { c: RC });
    for (let k = 0; k < 3; k++) {
      const px = sx - 2 + k * 2;
      if (k === 1) {
        M.pipe(mp, px - 0.2, 2.6, sz, px - 0.25, 0.9, sz + 0.1, 0.012, 3, {
          c: [0.3, 0.3, 0.3],
        });
        M.obox(
          M.buf("rubber", x, z, "detail"),
          px,
          0.08,
          sz + 0.5,
          0.5,
          0.05,
          0.2,
          0.4,
          { c: [0.2, 0.2, 0.2], s: 1 },
        );
        continue;
      }
      const sw = k === 2 ? 0.35 : 0;
      for (const o of [-0.22, 0.22])
        M.pipe(mp, px + o, 2.6, sz, px + o, 0.55, sz + sw, 0.012, 3, {
          c: [0.3, 0.3, 0.3],
        });
      M.obox(
        M.buf("rubber", x, z, "detail"),
        px,
        0.53,
        sz + sw,
        0.5,
        0.04,
        0.2,
        0,
        { c: [0.2, 0.2, 0.2], s: 1 },
      );
    }
    // slide: ladder + deck + chute
    const lx = x + 4,
      lz = z - 4;
    for (const e of [-0.3, 0.3])
      M.pipe(rs, lx + e, 0, lz - 1.1, lx + e, 2.0, lz - 0.4, 0.04, 5, {
        c: RC,
      });
    for (let k = 1; k < 6; k++)
      M.pipe(
        rs,
        lx - 0.3,
        k * 0.33,
        lz - 1.1 + k * 0.12,
        lx + 0.3,
        k * 0.33,
        lz - 1.1 + k * 0.12,
        0.025,
        4,
        { c: RC },
      );
    M.box(mp, lx - 0.5, 1.9, lz - 0.5, lx + 0.5, 2.0, lz + 0.5, {
      s: 1,
      c: [0.5, 0.45, 0.4],
      skip: 0,
    });
    for (const [ex, ez] of [
      [-0.45, -0.45],
      [0.45, -0.45],
      [-0.45, 0.45],
      [0.45, 0.45],
    ])
      M.pipe(rs, lx + ex, 0, lz + ez, lx + ex, 2.9, lz + ez, 0.04, 5, {
        c: RC,
      });
    M.obox(
      M.buf("metal_painted", x, z, "main"),
      lx,
      1.0,
      lz + 1.9,
      0.7,
      0.06,
      3.3,
      0,
      { c: [0.7, 0.66, 0.6], s: 1, pitch: 0.62 },
    );
    for (const e of [-0.38, 0.38])
      M.obox(mp, lx + e, 1.1, lz + 1.9, 0.05, 0.22, 3.3, 0, {
        c: [0.6, 0.3, 0.2],
        s: 1,
        pitch: 0.62,
      });
    // jungle-gym dome of bent pipe
    const jx = x + 4.5,
      jz = z + 3.5,
      JR = 2.2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      let prev = null;
      for (let k = 0; k <= 4; k++) {
        const ph = ((k / 4) * Math.PI) / 2,
          p = [
            jx + Math.cos(a) * Math.cos(ph) * JR,
            Math.sin(ph) * JR,
            jz + Math.sin(a) * Math.cos(ph) * JR,
          ];
        if (prev && !(i === 3 && k === 3))
          M.pipe(rs, prev[0], prev[1], prev[2], p[0], p[1], p[2], 0.035, 4, {
            c: RC,
          });
        prev = p;
      }
    }
    for (const h of [0.7, 1.4]) {
      const rr = Math.sqrt(JR * JR - h * h);
      for (let i = 0; i < 8; i++) {
        const a0 = (i / 8) * Math.PI * 2,
          a1 = ((i + 1) / 8) * Math.PI * 2;
        M.pipe(
          rs,
          jx + Math.cos(a0) * rr,
          h,
          jz + Math.sin(a0) * rr,
          jx + Math.cos(a1) * rr,
          h,
          jz + Math.sin(a1) * rr,
          0.03,
          4,
          { c: RC },
        );
      }
    }
    // merry-go-round (tipped on its hub) and a seesaw
    const gx = x - 3.5,
      gz = z + 3.8;
    M.pushXF(M.mtx(gx, 0.25, gz, 0.4, 0.12, 0));
    M.cyl(mp, 0, 0, 0, 1.5, 1.5, 0.1, 16, {
      c: [0.45, 0.4, 0.34],
      capTop: true,
    });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      M.pipe(
        rs,
        Math.cos(a) * 1.3,
        0.1,
        Math.sin(a) * 1.3,
        Math.cos(a) * 0.3,
        0.9,
        Math.sin(a) * 0.3,
        0.025,
        4,
        { c: RC },
      );
    }
    M.popXF();
    M.pipe(rs, x - 8.5, 0, z + 1.5, x - 8.5, 0.5, z + 1.5, 0.08, 6, { c: RC });
    M.obox(
      M.buf("wood_rotten", x, z, "detail"),
      x - 8.5,
      0.35,
      z + 1.5,
      0.25,
      0.06,
      3.6,
      0,
      { c: [0.5, 0.42, 0.34], s: 1, pitch: 0.28 },
    );
    // sandbox with a rotten timber edge, a toy bucket, a bench with a skeleton reading a paper
    const bw = M.buf("wood_rotten", x, z, "detail");
    for (const [a0, a1, b0, b1] of [
      [-1.5, 1.5, -1.5, -1.3],
      [-1.5, 1.5, 1.3, 1.5],
      [-1.5, -1.3, -1.3, 1.3],
      [1.3, 1.5, -1.3, 1.3],
    ])
      M.box(bw, x + a0, 0, z + b0, x + a1, 0.3, z + b1, {
        s: 1,
        c: [0.45, 0.38, 0.3],
      });
    M.poly(
      M.buf("dirt", x, z, "detail"),
      [
        [x - 1.3, z - 1.3],
        [x + 1.3, z - 1.3],
        [x + 1.3, z + 1.3],
        [x - 1.3, z + 1.3],
      ],
      0.2,
      { s: 2, c: [0.95, 0.85, 0.65], convex: true },
    );
    M.cyl(
      M.buf("metal_painted", x, z, "detail"),
      x + 0.5,
      0.2,
      z - 0.3,
      0.12,
      0.15,
      0.2,
      8,
      { c: [0.7, 0.2, 0.15] },
    );
    if (M.parkBench) M.parkBench(x - 9.5, z - 5, Math.PI / 2, false);
    if (M.skeleton) M.skeleton(x - 9.3, z - 5, -Math.PI / 2, r, true);
    // low painted-iron fence with two gates
    const fb = M.buf("metal_painted", x, z, "detail");
    const pts = [
      [P.x0, P.z0],
      [P.x1, P.z0],
      [P.x1, P.z1],
      [P.x0, P.z1],
    ];
    for (let i = 0; i < 4; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % 4],
        len = Math.hypot(b2[0] - a[0], b2[1] - a[1]),
        ux = (b2[0] - a[0]) / len,
        uz = (b2[1] - a[1]) / len;
      const gate = i === 1 || i === 3 ? [len / 2 - 1, len / 2 + 1] : null;
      const spans = gate
        ? [
            [0, gate[0]],
            [gate[1], len],
          ]
        : [[0, len]];
      for (const [t0, t1] of spans) {
        const p0 = [a[0] + ux * t0, a[1] + uz * t0],
          p1 = [a[0] + ux * t1, a[1] + uz * t1];
        M.beam(fb, p0[0], 0.9, p0[1], p1[0], 0.9, p1[1], 0.04, 0.04, {
          c: [0.2, 0.3, 0.24],
        });
        for (let t = t0; t <= t1; t += 0.35)
          M.vbar(
            fb,
            a[0] + ux * t,
            a[1] + uz * t,
            0,
            0.95,
            0.03,
            uz,
            -ux,
            [0.2, 0.3, 0.24],
            true,
          );
        M.ocol(
          (p0[0] + p1[0]) / 2,
          (p0[1] + p1[1]) / 2,
          t1 - t0,
          0.1,
          0,
          0.95,
          -Math.atan2(uz, ux),
          { tag: "fence" },
        );
      }
    }
    // colliders on the big pieces (the dome and swings are climb-through-able on purpose: low)
    M.box3(lx - 0.5, 0, lz - 0.5, lx + 0.5, 2.0, lz + 0.5, { tag: "slide" });
    M.ocol(jx, jz, JR * 1.6, JR * 1.6, 0, 1.2, 0, {
      tag: "jungle_gym",
      surface: "metal",
    });
  }

  M.buildParkPieces = function () {
    for (const [name, fn] of [
      ["rotorcraft", buildRotorcraft],
      ["needle", buildNeedle],
      ["bandshell", buildBandshell],
      ["carousel", buildCarousel],
      ["playground", buildPlayground],
    ]) {
      try {
        fn();
      } catch (e) {
        G.reportError("map:parkpiece:" + name, e);
      }
    }
  };
