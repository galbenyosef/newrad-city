// play-inline-80 07 — range
// Lines 1739-1979 of readable/play-inline-80.pretty.js (statement-aligned).
  function buildFarSkyline() {
    const r = M.rng("farskyline");
    const styles = ["apartment", "office", "warehouse", "artdeco"];
    // New Jersey waterfront (Hoboken / Jersey City) west of the Hudson
    const nj = M.buf("concrete_dark", -900, 0, "far");
    M.box(nj, -1150, -8, -1200, -790, 0.3, 1600, { s: 6, c: [0.7, 0.7, 0.66] });
    for (let z = -1150; z < 1550; z += r.range(24, 40)) {
      const w = r.range(18, 34),
        d = r.range(18, 40);
      const tall = z > 300 && z < 900 ? r.range(40, 120) : r.range(10, 45);
      const x0 = -860 - r.range(0, 60);
      const st = styles[r.int(0, 3)],
        v = r.int(1, 2);
      farBlock(
        M.buf("facade/" + st + "/" + v, -900, z, "far"),
        nj,
        x0 - w,
        z,
        x0,
        z + d,
        tall,
        st,
        v,
      );
      if (r() < 0.25)
        farBlock(
          M.buf("facade/warehouse/1", -900, z, "far"),
          nj,
          -815,
          z,
          -797,
          z + 18,
          r.range(8, 14),
          "warehouse",
          1,
        );
    }
    // cranes at Port Newark-ish
    const cr = M.buf("rust", -820, 1300, "far");
    for (const z of [1180, 1260, 1340]) {
      M.box(cr, -812, 0, z - 3, -808, 38, z + 3, { c: [0.8, 0.5, 0.3] });
      M.box(cr, -840, 36, z - 1.5, -775, 39, z + 1.5, { c: [0.8, 0.5, 0.3] });
    }
    // Harlem / Upper Manhattan north of the playable edge
    const hb = M.buf("concrete_dark", 0, -1100, "far");
    M.box(hb, -345, -8, -1400, 345, 0.02, -1000, {
      s: 6,
      c: [0.72, 0.72, 0.68],
      skip: 8 + 16,
    });
    for (let x = -330; x < 330; x += r.range(20, 34)) {
      for (let z = -1400; z < -1030; z += r.range(40, 70)) {
        if (Math.abs(x) < 115 && z > -1200) continue; // the park continues north (ridge)
        const w = r.range(14, 28),
          d = r.range(14, 30),
          h = r.range(14, 55);
        const st = styles[r.int(0, 1)],
          v = r.int(1, 3);
        farBlock(
          M.buf("facade/" + st + "/" + v, x, z, "far"),
          hb,
          x,
          z,
          x + w,
          z + d,
          h,
          st,
          v,
        );
      }
    }
    // Queens / Long Island City across the East River
    const qb = M.buf("concrete_dark", 1000, -300, "far");
    M.box(qb, 840, -8, -1200, 1300, 0.3, 380, { s: 6, c: [0.7, 0.7, 0.66] });
    for (let z = -1150; z < 360; z += r.range(26, 44)) {
      const w = r.range(20, 40),
        d = r.range(18, 36),
        h = z > -500 && z < 0 ? r.range(20, 90) : r.range(10, 35);
      const x0 = 870 + r.range(0, 60);
      farBlock(
        M.buf("facade/warehouse/" + r.int(1, 2), 1000, z, "far"),
        qb,
        x0,
        z,
        x0 + w,
        z + d,
        h,
        "warehouse",
        1,
      );
    }
    // Brooklyn beyond the playable edge
    const bb = M.buf("concrete_dark", 1000, 700, "far");
    M.box(bb, 800, -8, 380, 1300, 0.01, 1300, {
      s: 6,
      c: [0.7, 0.7, 0.66],
      skip: 8,
    });
    for (let x = 840; x < 1280; x += r.range(26, 44))
      for (let z = 400; z < 1280; z += r.range(30, 60)) {
        const w = r.range(18, 34),
          d = r.range(18, 34),
          h = r.range(8, 40);
        const st = r() < 0.6 ? "warehouse" : "apartment";
        farBlock(
          M.buf("facade/" + st + "/1", x, z, "far"),
          bb,
          x,
          z,
          x + w,
          z + d,
          h,
          st,
          1,
        );
      }
    // Staten Island / Bayonne low silhouette to the south
    const sb = M.buf("concrete_dark", -300, 1700, "far");
    M.box(sb, -1100, -8, 1650, 600, 0.5, 1900, { s: 6, c: [0.6, 0.6, 0.55] });
    for (let x = -1050; x < 580; x += r.range(40, 90))
      farBlock(
        M.buf("facade/warehouse/2", x, 1700, "far"),
        sb,
        x,
        1665,
        x + r.range(20, 40),
        1700,
        r.range(6, 22),
        "warehouse",
        2,
      );
  }

  // -------------------------------------------------------------------
  // World edges: impassable debris barricades (north edge & Brooklyn east)
  // -------------------------------------------------------------------
  function rubbleWall(ax, az, bx, bz, h, seed) {
    const r = M.rng(seed);
    const len = Math.hypot(bx - ax, bz - az),
      ux = (bx - ax) / len,
      uz = (bz - az) / len;
    for (let t = 0; t < len; t += 2.2) {
      const x = ax + ux * t + (r() - 0.5) * 3,
        z = az + uz * t + (r() - 0.5) * 3;
      const k = r();
      const key =
        k < 0.45
          ? "rubble"
          : k < 0.7
            ? "concrete"
            : k < 0.85
              ? "brick_red"
              : "rust";
      const b = M.buf(key, x, z);
      const s = r.range(1.2, 3.2);
      M.obox(
        b,
        x,
        r.range(0, h * 0.6),
        z,
        s * r.range(1, 2.2),
        s * r.range(0.6, 1.5),
        s * r.range(0.8, 1.8),
        r() * 6,
        {
          pitch: (r() - 0.5) * 0.8,
          roll: (r() - 0.5) * 0.8,
          s: 3,
          c: M.mulc([0.8, 0.78, 0.74], r.range(0.7, 1.05)),
        },
      );
      if (r() < 0.25) {
        const bg = M.buf("rust", x, z);
        M.beam(
          bg,
          x,
          0,
          z,
          x + (r() - 0.5) * 6,
          h + r() * 3,
          z + (r() - 0.5) * 4,
          0.35,
          0.5,
          { c: [0.8, 0.7, 0.6] },
        );
      }
    }
    // mound
    const bm = M.buf("rubble", (ax + bx) / 2, (az + bz) / 2);
    const nseg = Math.ceil(len / 20);
    for (let s = 0; s < nseg; s++) {
      const t0 = (s * len) / nseg,
        t1 = ((s + 1) * len) / nseg;
      const px = -uz,
        pz = ux;
      const P = (t, off, y) => [
        ax + ux * t + px * off,
        y,
        az + uz * t + pz * off,
      ];
      M.quad(
        bm,
        P(t0, -5, 0),
        P(t1, -5, 0),
        P(t1, 0, h * 0.7),
        P(t0, 0, h * 0.7),
        [-px, 0.6, -pz],
        [t0 / 3, 0, t1 / 3, 0, t1 / 3, 2, t0 / 3, 2],
        [0.7, 0.68, 0.64],
      );
      M.quad(
        bm,
        P(t0, 5, 0),
        P(t1, 5, 0),
        P(t1, 0, h * 0.7),
        P(t0, 0, h * 0.7),
        [px, 0.6, pz],
        [t0 / 3, 0, t1 / 3, 0, t1 / 3, 2, t0 / 3, 2],
        [0.7, 0.68, 0.64],
      );
    }
    M.ocol(
      (ax + bx) / 2,
      (az + bz) / 2,
      len,
      6,
      -1,
      h + 2,
      Math.atan2(-uz, ux),
      { tag: "barrier", walkable: false, surface: "rubble" },
    );
  }
  function buildWorldEdges() {
    const L = G.LAYOUT;
    // north edge across Manhattan except the park (park gets its own ridge in the park builder)
    rubbleWall(-330, -995, L.PARK.x0 - 2, -995, 5, "edgeNW");
    rubbleWall(L.PARK.x1 + 2, -995, 330, -995, 5, "edgeNE");
    // Brooklyn east edge
    rubbleWall(803, 385, 803, 978, 5, "edgeBK");
  }
  M.rubbleWall = rubbleWall;
