// play-inline-81 04 — range
// Lines 853-1115 of readable/play-inline-81.pretty.js (statement-aligned).
  M.buildFarSkyline = function () {
    R = M.rng("farskyline2");
    const r = R;
    const styles = ["apartment", "office", "warehouse", "artdeco"];

    // ---------------- New Jersey ----------------
    M.box(fb("concrete_dark", -900, 0), -1150, -8, -1200, -790, 0.3, 1600, {
      s: 6,
      c: [0.62, 0.61, 0.57],
    });
    palisades(-805, -1200, -520);
    // Hoboken / Weehawken (brick, water towers)
    for (let z = -500; z < 280; z += r.range(22, 34)) {
      for (let x = -840; x > -1080; x -= r.range(26, 44)) {
        const w = r.range(16, 30),
          d = r.range(16, 26);
        // mostly 3–8 storey brick, now and then a 15–20 storey tower block so the roofline isn't a flat band
        const h =
          r() < 0.07 ? r.range(48, 74) : r.range(12, 34) * (x > -900 ? 1 : 1.3);
        tower(x - w, z, x, z + d, h, {
          style: h > 45 ? "office" : r() < 0.7 ? "apartment" : "warehouse",
          v: r.int(1, 2),
          lit: r() < 0.12,
          water: h < 45 && r() < 0.3,
          ruin: h > 45 && r() < 0.3,
        });
      }
    }
    // Jersey City: Exchange Place towers on the waterfront + mid-rise behind
    for (let z = 300; z < 960; z += r.range(26, 40)) {
      const tall = z > 380 && z < 860;
      for (let x = -842; x > -1100; x -= r.range(30, 50)) {
        const near = x > -900;
        const w = r.range(20, 36),
          d = r.range(18, 30);
        const h =
          tall && near
            ? r.range(70, 150)
            : tall
              ? r.range(30, 90)
              : r.range(14, 40);
        tower(x - w, z, x, z + d, h, {
          style:
            h > 60 ? r.pick(["office", "artdeco", "office"]) : r.pick(styles),
          v: r.int(1, 2),
          lit: r() < 0.14,
          ruin: h > 50 && r() < 0.22,
        });
      }
    }
    // Bayonne / port south of Jersey City
    for (let z = 980; z < 1550; z += r.range(40, 70))
      tower(
        -900 - r.range(0, 80),
        z,
        -860 - r.range(0, 40),
        z + r.range(20, 40),
        r.range(8, 22),
        { style: "warehouse", v: r.int(1, 2), flat: true },
      );
    tanks(-1100, 1150, -920, 1500, 9);
    // waterfront: warehouses on the bulkhead, finger piers (some collapsed), gantry cranes
    for (let z = -480; z < 1500; z += r.range(28, 46)) {
      if (r() < 0.55)
        tower(-832, z, -800, z + r.range(16, 26), r.range(8, 16), {
          style: "warehouse",
          v: r.int(1, 2),
          flat: true,
          tint: r.pick([TINTS[0], TINTS[1], TINTS[2], TINTS[6]]),
          ruin: r() < 0.2,
        });
    }
    bulkhead(-790, -520, 1600, 1, true);
    for (let z = -420; z < 1480; z += r.range(55, 95))
      pier(-790, z, 1, r.range(40, 75), r.range(12, 20), r() < 0.35);
    for (const z of [1180, 1265, 1350, 1430]) gantry(-800, z, 1, 1, false);
    gantry(-800, 1000, 1, 0.8, false);
    // silhouettes that read from the Manhattan esplanade: Hoboken Terminal's clock tower, the Colgate Clock on the
    // Jersey City waterfront, church spires, smokestacks, a radio mast, two more port cranes off Hoboken
    hobokenTerminal(-800, 130);
    colgateClock(-806, 610);
    for (const [x, z, h] of [
      [-905, -300, 62],
      [-960, -40, 56],
      [-890, 240, 66],
      [-990, 420, 58],
      [-930, 760, 60],
    ])
      spire(x, z, h);
    for (const [x, z, h] of [
      [-870, -420, 58],
      [-1010, 60, 64],
      [-880, 900, 52],
      [-1040, 1080, 70],
    ])
      smokestack(x, z, h);
    mast(-1060, -160, 120);
    gantry(-800, -250, 1, 0.9, false);
    gantry(-800, 20, 1, 0.85, false);

    // ---------------- Harlem (north of the world edge) ----------------
    M.box(fb("concrete_dark", 0, -1100), -345, -8, -1400, 345, 0.02, -1000, {
      s: 6,
      c: [0.66, 0.65, 0.61],
      skip: 8 + 16,
    });
    for (let x = -330; x < 330; x += r.range(22, 34)) {
      for (let z = -1400; z < -1030; z += r.range(38, 62)) {
        if (Math.abs(x) < 115 && z > -1200) continue; // the park continues north (ridge)
        const w = r.range(14, 28),
          d = r.range(16, 30),
          h = r.range(16, 48);
        tower(x, z, x + w, z + d, h, {
          style: r() < 0.75 ? "apartment" : "office",
          v: r.int(1, 3),
          lit: r() < 0.08,
          ruin: r() < 0.12,
        });
      }
    }

    // ---------------- Queens / Long Island City ----------------
    M.box(fb("concrete_dark", 1000, -300), 840, -8, -1200, 1300, 0.3, 380, {
      s: 6,
      c: [0.64, 0.63, 0.59],
    });
    for (let z = -1150; z < 360; z += r.range(28, 46)) {
      for (let x = 880; x < 1280; x += r.range(34, 60)) {
        const w = r.range(20, 40),
          d = r.range(18, 34);
        const core = z > -520 && z < 20 && x < 1050;
        const h = core ? r.range(22, 95) : r.range(10, 36);
        tower(x, z, x + w, z + d, h, {
          style:
            h > 40
              ? r.pick(["office", "apartment", "artdeco"])
              : r.pick(["warehouse", "warehouse", "apartment"]),
          v: r.int(1, 2),
          lit: r() < 0.1,
          ruin: h > 45 && r() < 0.2,
          water: h < 40 && r() < 0.3,
        });
      }
    }
    for (let z = -1100; z < 340; z += r.range(34, 52))
      if (r() < 0.6)
        tower(842, z, 872, z + r.range(16, 28), r.range(8, 16), {
          style: "warehouse",
          v: r.int(1, 2),
          flat: true,
          ruin: r() < 0.25,
        });
    bulkhead(840, -1200, 380, -1, true);
    for (let z = -1050; z < 320; z += r.range(70, 120))
      pier(840, z, -1, r.range(30, 55), r.range(12, 18), r() < 0.4);
    gantry(846, -120, -1, 0.9, false);
    gantry(846, -90, -1, 0.9, false);
    stacks(900, -330, 4);
    for (const [x, z, h] of [
      [960, -760, 60],
      [1100, -560, 66],
      [930, 180, 54],
    ])
      smokestack(x, z, h);
    for (const [x, z, h] of [
      [1000, -900, 58],
      [1150, -250, 62],
    ])
      spire(x, z, h);
    mast(1180, -700, 110);
    // the old Fizzo Cola bottling plant's rooftop sign (a flat lettered panel), facing Manhattan across the river
    if (M.adPanel) {
      const sx = 876,
        sz = -60,
        sy = 22;
      tower(868, sz - 22, 900, sz + 22, 14, {
        style: "warehouse",
        v: 1,
        flat: true,
        tint: [0.75, 0.55, 0.45],
      });
      M.adPanel("fizzo_cola", sx - 7, sy + 7, sz, -1, 0, 40, 13, {
        layer: "far",
        c: [0.9, 0.9, 0.9],
      });
      const fr = fb("rust", sx, sz);
      for (let t = -20; t <= 20; t += 5)
        M.beam(fr, sx - 6, 14, sz + t, sx - 6, sy + 14, sz + t, 0.5, 0.5, {
          c: [0.45, 0.38, 0.32],
        });
      M.beam(
        fr,
        sx - 6,
        sy + 14.2,
        sz - 21,
        sx - 6,
        sy + 14.2,
        sz + 21,
        0.6,
        0.6,
        { c: [0.45, 0.38, 0.32] },
      );
    }

    // ---------------- Brooklyn beyond the playable edge ----------------
    M.box(fb("concrete_dark", 1000, 700), 800, -8, 380, 1300, 0.01, 1300, {
      s: 6,
      c: [0.64, 0.63, 0.59],
      skip: 8,
    });
    for (let x = 840; x < 1280; x += r.range(28, 46))
      for (let z = 400; z < 1280; z += r.range(30, 56)) {
        const w = r.range(18, 34),
          d = r.range(18, 34),
          h = r.range(8, 42) * (x < 1000 && z > 600 && z < 950 ? 1.4 : 1);
        tower(x, z, x + w, z + d, h, {
          style: r() < 0.55 ? "warehouse" : "apartment",
          v: r.int(1, 2),
          lit: r() < 0.08,
          water: r() < 0.25,
          ruin: r() < 0.12,
        });
      }
    // Red Hook / Brooklyn port south of the playable waterfront
    M.box(fb("concrete_dark", 700, 1100), 480, -8, 1000, 1300, 0.3, 1300, {
      s: 6,
      c: [0.62, 0.61, 0.57],
      skip: 8,
    });
    for (let x = 500; x < 820; x += r.range(40, 70))
      tower(
        x,
        1040 + r.range(0, 30),
        x + r.range(24, 40),
        1100 + r.range(0, 40),
        r.range(10, 22),
        { style: "warehouse", v: r.int(1, 2), flat: true, ruin: r() < 0.25 },
      );
    for (const x of [560, 640, 720]) gantry(x, 1010, -1, 0.9, true);
    bulkhead(480, 1000, 1300, -1, true);

    // ---------------- Staten Island / Bayonne low silhouette to the south ----------------
    M.box(fb("concrete_dark", -300, 1700), -1100, -8, 1650, 600, 0.5, 1900, {
      s: 6,
      c: [0.58, 0.58, 0.54],
    });
    for (let x = -1050; x < 580; x += r.range(34, 70))
      tower(
        x,
        1665,
        x + r.range(20, 40),
        1700 + r.range(0, 30),
        r.range(6, 24),
        {
          style: r() < 0.7 ? "warehouse" : "apartment",
          v: r.int(1, 2),
          flat: r() < 0.6,
        },
      );
    tanks(-700, 1720, -300, 1860, 7);
    bulkhead(1650, -1100, 600, -1, false);
    for (const x of [-200, -120, -40]) gantry(x, 1660, -1, 1, true);
  };
