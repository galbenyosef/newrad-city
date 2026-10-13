// play-inline-118 14 — lx0
// Lines 3683-3892 of readable/play-inline-118.pretty.js (statement-aligned).
  function depot(rec, O) {
    const r = Room("depot", O.x - 70, O.z + 28, 16, 12, 6, {
      doorAt: -1.0,
      grime: 0.45,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x8a8070,
      wall: "nx_brickb",
      wallTint: 0xa08a70,
      trim: "wood_dark",
      ceil: "nx_corr",
      ceilTint: 0x7a6a5a,
      doorLeaf: "wood",
      doorTint: 0x6a4a2a,
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // pallet racks (west + north), crates on them and on the floor
    const rack = (lx0, lz0, lx1, lz1) => {
      for (const p of [
        [lx0, lz0],
        [lx1, lz0],
        [lx0, lz1],
        [lx1, lz1],
      ])
        r.bx(
          "paint_blue",
          p[0] - 0.05,
          0,
          p[1] - 0.05,
          p[0] + 0.05,
          4.2,
          p[1] + 0.05,
          { tint: 0x3a5a8a },
        );
      for (const y of [0.15, 1.5, 2.9]) {
        r.bx("paint_red", lx0, y, lz0, lx1, y + 0.1, lz0 + 0.08, {
          tint: 0xc05a20,
        });
        r.bx("paint_red", lx0, y, lz1 - 0.08, lx1, y + 0.1, lz1, {
          tint: 0xc05a20,
        });
        r.bx("wood", lx0, y + 0.1, lz0, lx1, y + 0.14, lz1, {});
      }
      const rr = K.rng(Math.round(lx0 * 7 + lz0 * 3));
      for (const y of [0.24, 1.64, 3.04])
        for (let k = 0; k < 3; k++)
          if (rr() < 0.8) {
            const s = 0.6 + rr() * 0.4;
            P.crate(
              r.b,
              r.X(lx0 + ((lx1 - lx0) * (k + 0.5)) / 3),
              y,
              r.Z((lz0 + lz1) / 2),
              s,
              rr() * 0.3,
              { tint: [0xffffff, 0x8a9a6a, 0xb8a080][k] },
            );
          }
      r.col(lx0, 0, lz0, lx1, 4.2, lz1);
    };
    rack(-7.8, -5.8, -1.0, -4.6);
    rack(-7.8, -3.0, -6.6, 3.2);
    for (const c of [
      [-3.5, -1.5, 0.3],
      [-2.6, -1.3, 1.0],
      [-3.1, -1.4, 0.6, 0.9],
      [1.8, -2.8, 0.2],
      [2.7, -3.0, 0.8],
    ])
      P.crate(r.b, r.X(c[0]), c[3] || 0, r.Z(c[1]), 0.9, c[2]);
    r.col(-4.0, 0, -2.0, -2.1, 1.8, -0.9);
    r.col(1.3, 0, -3.5, 3.2, 0.9, -2.3);
    // feed sacks, tack on pegs, lanterns, a freight scale, the chalkboard of routes
    for (let k = 0; k < 8; k++)
      r.b.geo("nx_fabric", T.sphereLo, {
        x: r.X(5.0 + (k % 4) * 0.55),
        y: 0.28 + Math.floor(k / 4) * 0.4,
        z: r.Z(-5.2),
        sx: 0.32,
        sy: 0.24,
        sz: 0.24,
        tint: 0xc8b078,
        grime: 0.5,
      });
    r.col(4.6, 0, -5.8, 7.4, 0.8, -4.7);
    for (let k = 0; k < 5; k++) {
      r.b.beam(
        "wood_dark",
        r.X(7.95),
        2.0,
        r.Z(-2 + k * 0.7),
        r.X(7.7),
        2.0,
        r.Z(-2 + k * 0.7),
        0.03,
      );
      r.b.geo("fabric", T.torusThick, {
        x: r.X(7.75),
        y: 1.75,
        z: r.Z(-2 + k * 0.7),
        ry: PI / 2,
        s: 0.25,
        tint: 0x5a3a1a,
      });
    }
    r.bx("metal", 3.0, 0, 2.0, 4.4, 0.12, 3.4, { tint: 0x6a6a60 });
    r.b.beam("metal", r.X(4.3), 0.12, r.Z(2.7), r.X(4.3), 1.4, r.Z(2.7), 0.06);
    r.b.cyl("paint_white", r.X(4.3), 1.4, r.Z(2.7), 0.22, 0.22, 0.08, 14, {});
    poster(r, "q_routes", r.X(7.96), 2.3, r.Z(2.6), 2.2, 1.4, -PI / 2);
    // the freight office: a plywood cubicle with a window and a desk (the clerk), strongbox
    r.bx("wood", 3.4, 0, -1.0, 7.95, 2.4, -0.9, { tint: 0xb89a70 });
    r.bx("wood", 3.4, 0, -1.0, 3.5, 2.4, 1.2, { tint: 0xb89a70 });
    r.b.panel("glass", r.X(5.6), 1.6, r.Z(-0.88), 1.6, 0.8, PI, {});
    r.col(3.4, 0, -1.0, 7.95, 2.4, -0.9);
    r.col(3.4, 0, -1.0, 3.5, 2.4, 0.2);
    r.bx("wood", 5.0, 0.75, 0.2, 7.2, 0.8, 1.0, {});
    r.col(5.0, 0, 0.2, 7.2, 0.8, 1.0);
    board(r, "b_depot", r.X(5.6), 2.2, r.Z(-0.86), 2.4, 0.4, PI);
    A("depot_clerk", 6.1, -0.35, PI);
    for (const q of [
      [5.1, 0.25],
      [7.1, 0.25],
      [5.1, 0.95],
      [7.1, 0.95],
    ])
      r.bx(
        "wood_dark",
        q[0] - 0.04,
        0,
        q[1] - 0.04,
        q[0] + 0.04,
        0.75,
        q[1] + 0.04,
        {},
      );
    addContainer(rec, {
      id: "lma_neon_depot_desk",
      name: "Freight Office Desk",
      kind: "desk",
      loot: "desk",
      x: r.X(5.6),
      y: 0.6,
      z: r.Z(0.6),
      anchor: ["depot_desk", 0],
    });
    r.bx("metal_dark", 7.2, 0, -0.7, 7.8, 0.5, -0.2, { tint: 0x3a3a30 });
    r.b.box("brass", r.X(7.5), 0.3, r.Z(-0.19), 0.12, 0.08, 0.02, {});
    r.col(7.2, 0, -0.7, 7.8, 0.5, -0.2);
    addContainer(rec, {
      id: "lma_neon_depot_strongbox",
      name: "Freight Strongbox",
      kind: "safe",
      loot: "trade_wagon",
      lock: {
        id: "lma_neon_depot_strongbox",
        label: "Freight Depot Strongbox",
        code: "5509",
        hint: 'Freight depot terminal, "Memo — Guard Escort Rates"',
        learnedFrom: 'Freight depot terminal, "Memo — Guard Escort Rates"',
      },
      x: r.X(7.5),
      y: 0.55,
      z: r.Z(-0.1),
      anchor: ["depot_safe", 0],
    });
    terminal("lma_neon_depot", r.X(6.5), 0.8, r.Z(0.55), PI, {
      title: "NEON FREIGHT · MANIFESTS",
      header:
        "MERIDIAN TELETYPE CO. — TELELINK · NEON FREIGHT DEPOT, TIMES SQUARE",
      entries: [
        {
          title: "Routes This Week",
          text: 'GRAND CENTRAL MARKET ..... MON / THU (Eustace)\nRADIO CITY ............... TUE / FRI\nCARNEGIE HALL ............ SAT (armed escort ONLY)\n\nNo riders past dusk. No riders past Bryant Park after the burrow rats. No riders who "know a shortcut".',
        },
        {
          title: "Manifest #0412",
          text: 'OUT: 6 jugs purified water, 2 crates iodine tabs, 1 crate "misc. screws", 1 jukebox (broken, for Radio City, do NOT ask why)\nIN: 40 lbs ox jerky, 12 dry-cell batteries (3 dead), a crate of old-world records, one (1) accordion.\n\nNote: the accordion was not ordered. Nobody will claim the accordion.',
        },
        {
          title: "Lost & Found",
          text: 'FOUND: one pack ox, one horn, answers to "Gerald" and, on Sundays, to "Mister Gerald".\nLOST: the Carnegie run\'s second wagon. Last seen on 57th. Driver Hank says "the dogs got it". The dogs say nothing.',
        },
        {
          title: "Memo — Guard Escort Rates",
          text: () => {
            learn("lma_neon_depot_strongbox");
            return "Kincaid wants 30 scrip a guard a run. We counter-offered 20 and a hot meal. He counter-countered with a look. We are paying 30.\n\nThe escort money goes in the strongbox. Combination this quarter: 5-5-0-9. Do NOT chalk it on the routes board again, Eustace.";
          },
        },
      ],
    });
    for (const q of [
      [-4, -1],
      [2, -1.5],
      [0, 3.5],
      [5.8, 0.4],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: q[0] > 5 ? "bulb" : "cage",
        y: q[0] > 5 ? 2.2 : 4.4,
        col: 0xffc880,
        pool: 3.6,
      });
    r.fix.push([r.X(0), 4.0, r.Z(0), 0xffd8a8, { intensity: 1.3, range: 12 }]);
    finish(r);
    return r;
  }

