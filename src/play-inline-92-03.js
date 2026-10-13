// play-inline-92 03 — the
// Lines 593-896 of readable/play-inline-92.pretty.js (statement-aligned).
  function columbusCircle() {
    const L = G.LAYOUT;
    const C = (L.CIRCLES || []).find((c) => c.id === "columbus_circle") || {
      x: -121.5,
      z: -408.5,
      rIsland: 7,
      rOuter: 16,
    };
    const x = C.x,
      z = C.z,
      y0 = SY;
    const b = M.buf("granite", x, z);
    // stepped granite plinth ring + dead lawn on the island
    M.cyl(b, x, y0, z, C.rIsland - 1.2, C.rIsland - 1.2, 0.25, 32, {
      capTop: true,
      c: [0.72, 0.7, 0.66],
    });
    M.cyl(
      M.buf("grass_dead", x, z),
      x,
      y0 + 0.25,
      z,
      C.rIsland - 1.5,
      C.rIsland - 1.5,
      0.04,
      32,
      { capTop: true, c: [0.62, 0.58, 0.44] },
    );
    M.cyl(b, x, y0 + 0.25, z, 3.4, 3.4, 0.35, 24, {
      capTop: true,
      c: [0.74, 0.72, 0.67],
    });
    M.box(b, x - 2.6, y0 + 0.6, z - 2.6, x + 2.6, y0 + 1.5, z + 2.6, {
      s: 2,
      c: [0.75, 0.73, 0.68],
    });
    M.box(b, x - 1.9, y0 + 1.5, z - 1.9, x + 1.9, y0 + 5.4, z + 1.9, {
      s: 2,
      c: [0.78, 0.76, 0.7],
    });
    M.box(b, x - 2.1, y0 + 5.4, z - 2.1, x + 2.1, y0 + 5.9, z + 2.1, {
      s: 2,
      c: [0.8, 0.78, 0.72],
    });
    M.cyl(b, x, y0 + 5.9, z, 0.95, 0.8, 17, 14, { c: [0.8, 0.78, 0.72], s: 2 });
    // rostral ship prows on the column (verdigris bronze)
    const bb = M.buf("metal_painted", x, z);
    for (const h of [9, 12.5])
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2 + h;
        M.obox(
          bb,
          x + Math.cos(a) * 1.1,
          y0 + 5.9 + h,
          z + Math.sin(a) * 1.1,
          0.5,
          0.35,
          1.3,
          -a + Math.PI / 2,
          { c: [0.45, 0.6, 0.52] },
        );
      }
    // the fountain-side prow & angel group at the base (south face, towards Broadway)
    M.obox(bb, x + 0.8, y0 + 1.9, z + 2.9, 1.6, 1.1, 1.2, 0.4, {
      c: [0.4, 0.55, 0.48],
    });
    M.box(b, x - 1.2, y0 + 22.9, z - 1.2, x + 1.2, y0 + 23.6, z + 1.2, {
      s: 1,
      c: [0.8, 0.78, 0.72],
    });
    // the statue (simplified cloaked figure)
    const sb = M.buf("stone_limestone", x, z);
    M.cyl(sb, x, y0 + 23.6, z, 0.55, 0.4, 2.1, 10, { c: [0.85, 0.83, 0.78] });
    M.cyl(sb, x, y0 + 25.7, z, 0.22, 0.2, 0.45, 8, {
      c: [0.85, 0.83, 0.78],
      capTop: true,
    });
    M.beam(sb, x + 0.3, y0 + 25.0, z, x + 0.7, y0 + 25.9, z - 0.2, 0.14, 0.14, {
      c: [0.85, 0.83, 0.78],
    });
    // four cast-iron lamp standards on the island, benches facing out, a burnt-out car nosed into the kerb
    for (let k = 0; k < 4; k++) {
      const a = Math.PI / 4 + (k * Math.PI) / 2;
      M.parkLamp(
        x + Math.cos(a) * (C.rIsland - 2.2),
        z + Math.sin(a) * (C.rIsland - 2.2),
        k === 2,
      );
    }
    for (let k = 0; k < 3; k++) {
      const a = 0.4 + k * 2.1;
      M.parkBench(
        x + Math.cos(a) * 4.8,
        z + Math.sin(a) * 4.8,
        -a - Math.PI / 2,
        k === 1,
      );
    }
    M.ocol(x, z, 5.2, 5.2, 0, y0 + 24, 0, {
      tag: "monument",
      surface: "concrete",
    });
    M.ocol(x, z, 7.6, 7.6, 0, y0 + 1.5, 0, {
      tag: "monument",
      surface: "concrete",
    });
    M.columbusCircle = { x, z, rIsland: C.rIsland, rOuter: C.rOuter };
  }

  /** Worth Square: the triangle in the V north of the Broadway × 5th Ave crossing, with the Worth Monument obelisk. */
  function worthSquare(o) {
    const r = M.rng("worth");
    const P = o.poly;
    // incentre of the island (the obelisk stands on it)
    const side = (i) => {
      const a = P[(i + 1) % 3],
        b = P[(i + 2) % 3];
      return Math.hypot(b[0] - a[0], b[1] - a[1]);
    };
    const la = side(0),
      lb = side(1),
      lc = side(2),
      per = la + lb + lc;
    const cx = (la * P[0][0] + lb * P[1][0] + lc * P[2][0]) / per,
      cz = (la * P[0][1] + lb * P[1][1] + lc * P[2][1]) / per;
    // granite setts over the island's sidewalk (kerbs are the raised piece's own)
    M.poly(
      M.buf("granite", cx, cz),
      M.insetPoly(M.polyArea(P) > 0 ? P : P.slice().reverse(), 0.45),
      SY + 0.02,
      { s: 1.2, c: [0.62, 0.6, 0.56], convex: true },
    );
    // the obelisk on a stepped base, ringed by a low iron fence
    const bs = M.buf("granite", cx, cz);
    M.box(bs, cx - 2.3, SY, cz - 2.3, cx + 2.3, SY + 0.35, cz + 2.3, {
      s: 2,
      c: [0.7, 0.68, 0.64],
    });
    M.box(bs, cx - 1.9, SY + 0.35, cz - 1.9, cx + 1.9, SY + 0.95, cz + 1.9, {
      s: 2,
      c: [0.72, 0.7, 0.66],
    });
    M.box(bs, cx - 1.3, SY + 0.95, cz - 1.3, cx + 1.3, SY + 2.75, cz + 1.3, {
      s: 2,
      c: [0.75, 0.73, 0.68],
    });
    M.cyl(bs, cx, SY + 2.75, cz, 0.9, 0.5, 11, 4, {
      c: [0.78, 0.76, 0.7],
      a0: Math.PI / 4,
      a1: Math.PI / 4 + Math.PI * 2,
    });
    M.cyl(bs, cx, SY + 13.75, cz, 0.5, 0.0, 1.2, 4, {
      c: [0.78, 0.76, 0.7],
      a0: Math.PI / 4,
      a1: Math.PI / 4 + Math.PI * 2,
    });
    const pb = M.buf("metal_painted", cx, cz, "detail");
    for (const [dx, dz, w, d] of [
      [0, -1.32, 1.4, 0.05],
      [0, 1.32, 1.4, 0.05],
      [-1.32, 0, 0.05, 1.4],
      [1.32, 0, 0.05, 1.4],
    ])
      M.box(
        pb,
        cx + dx - w / 2,
        SY + 1.4,
        cz + dz - d / 2,
        cx + dx + w / 2,
        SY + 2.3,
        cz + dz + d / 2,
        { s: 1, c: [0.36, 0.5, 0.44] },
      );
    M.box3(cx - 2.3, 0, cz - 2.3, cx + 2.3, SY + 15, cz + 2.3, {
      tag: "monument",
      surface: "concrete",
    });
    polyFence(
      [
        [cx - 3.5, cz - 3.5],
        [cx + 3.5, cz - 3.5],
        [cx + 3.5, cz + 3.5],
        [cx - 3.5, cz + 3.5],
      ],
      SY,
      "worth",
      false,
      1.6,
    );
    // lamp standards at the two northern tips, a bench, litter
    const tip = (i, k) => [
      P[i][0] + (cx - P[i][0]) * k,
      P[i][1] + (cz - P[i][1]) * k,
    ];
    for (const i of [0, 1]) {
      const q = tip(i, 0.35);
      M.parkLamp(q[0], q[1], r() < 0.3);
    }
    {
      const q = tip(2, 0.45);
      M.parkBench(q[0], q[1], Math.PI * 0.8, true);
    }
    for (let i = 0; i < 6; i++) {
      const k = r.range(0.2, 0.8),
        j = r.int(0, 2),
        q = tip(j, k);
      M.decal(
        M.buf("my/markings", cx, cz, "fine"),
        q[0],
        SY + 0.035,
        q[1],
        r.range(1.2, 2.5),
        r.range(1.2, 2.5),
        r() * 6,
        r.pick([M.MARK.LEAVES, M.MARK.DIRT, M.MARK.LITTER, M.MARK.CRACKS]),
      );
    }
  }

  /** Low iron fence along a closed polygon (gap of `gap` m in the middle of the longest edge unless closed). */
  function polyFence(pts, y, seed, closed, gap) {
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length,
      cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const b = M.buf("metal_painted", cx, cz, "detail");
    const c = [0.22, 0.25, 0.22];
    let longest = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        d = pts[(i + 1) % pts.length];
      if (
        Math.hypot(d[0] - a[0], d[1] - a[1]) >
        Math.hypot(
          pts[(longest + 1) % pts.length][0] - pts[longest][0],
          pts[(longest + 1) % pts.length][1] - pts[longest][1],
        )
      )
        longest = i;
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        d = pts[(i + 1) % pts.length];
      const len = Math.hypot(d[0] - a[0], d[1] - a[1]);
      if (len < 0.8) continue;
      const ux = (d[0] - a[0]) / len,
        uz = (d[1] - a[1]) / len,
        nx = uz,
        nz = -ux;
      const g = gap || 2.4;
      const segs =
        !closed && i === longest && len > g + 2
          ? [
              [0, len / 2 - g / 2],
              [len / 2 + g / 2, len],
            ]
          : [[0, len]];
      for (const [t0, t1] of segs) {
        M.beam(
          b,
          a[0] + ux * t0,
          y + 0.85,
          a[1] + uz * t0,
          a[0] + ux * t1,
          y + 0.85,
          a[1] + uz * t1,
          0.04,
          0.04,
          { c },
        );
        for (let t = t0; t <= t1; t += 0.3)
          M.vbar(
            b,
            a[0] + ux * t,
            a[1] + uz * t,
            y,
            y + 0.95,
            0.03,
            nx,
            nz,
            c,
            true,
          );
        M.ocol(
          a[0] + (ux * (t0 + t1)) / 2,
          a[1] + (uz * (t0 + t1)) / 2,
          t1 - t0,
          0.12,
          y,
          y + 0.95,
          Math.atan2(-uz, ux),
          { tag: "fence", surface: "metal" },
        );
      }
    }
    void seed;
  }

  /**
   * Union Square (map-owned LAYOUT site, east of Broadway between 17th and 15th St).
   * Ruined set piece: diagonal path grid radiating to the Independence Flagpole, six fenced dead lawns,
   * the Lincoln statue, the 1932 pavilion (colonnade, canopy half collapsed) with a raider lookout on its roof,
   * the Greenmarket on the north plaza (collapsed stalls, torn awnings, crates), a raider barricade camp
   * in the east lawn (scrap walls, car hulks, tents, burn barrels, a cage), the south plaza with seat-steps and
   * the equestrian George Washington, subway kiosks.
   */
