// play-inline-118 16 — the
// Lines 4065-4297 of readable/play-inline-118.pretty.js (statement-aligned).
  function barracks(rec, O) {
    const r = Room("barracks", O.x + 20, O.z + 25, 16, 10, 3.4, {
      doorAt: -4.0,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x7a7a70,
      wall: "nx_tile",
      dado: "nx_tile",
      dadoTint: 0x9a8a6a,
      dadoH: 0.9,
      rail: false,
      trim: "paint_green",
      ceil: "nx_concrete",
      ceilTint: 0x6a6a64,
      doorLeaf: "metal_dark",
    });
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    // mosaic band + "42" tablets, a row of green I-beam columns down the middle
    r.bx("paint_red", -8, 2.4, -4.99, 8, 2.55, -4.96, { tint: 0x6a1a18 });
    for (const lx of [-5.5, 0, 5.5])
      poster(r, "q_mosaic", r.X(lx), 2.9, r.Z(-4.97), 0.6, 0.6, 0);
    for (const lx of [-4, 0, 4]) {
      r.bx("paint_green", lx - 0.12, 0, -0.12, lx + 0.12, 3.4, 0.12, {
        tint: 0x3a6a4a,
      });
      r.col(lx - 0.12, 0, -0.12, lx + 0.12, 3.4, 0.12);
    }
    // bunks (double) + footlockers along the west half
    const bunkBed = (lx, lz) => {
      cot(r, r.X(lx), r.Z(lz), 0, { blanket: 0x4a5a3a });
      for (const q of [
        [-0.45, -0.95],
        [0.45, -0.95],
        [-0.45, 0.95],
        [0.45, 0.95],
      ])
        r.b.beam(
          "metal_dark",
          r.X(lx + q[0]),
          0,
          r.Z(lz + q[1]),
          r.X(lx + q[0]),
          1.9,
          r.Z(lz + q[1]),
          0.035,
        );
      r.bx(
        "metal_dark",
        lx - 0.45,
        1.4,
        lz - 0.97,
        lx + 0.45,
        1.46,
        lz + 0.97,
        {},
      );
      r.bx("fabric", lx - 0.42, 1.46, lz - 0.93, lx + 0.42, 1.56, lz + 0.93, {
        tint: 0x6a6a4a,
        grime: 0.6,
      });
      r.b.box("wood_dark", r.X(lx), 0, r.Z(lz + 1.3), 0.8, 0.45, 0.45, {
        tint: 0x4a5a3a,
      });
    };
    let n = 0;
    for (const lx of [-7.2, -5.6])
      for (const lz of [-3.6, 1.8]) {
        bunkBed(lx, lz);
        n++;
        A("barracks_bunk_" + n, lx, lz, 0);
      }
    // the armory cage (NE): chain link, weapon racks, ammo crates, a workbench
    const cx0 = 3.0,
      cx1 = 7.95,
      cz0 = -4.95,
      cz1 = -1.4;
    for (let k = 0; k <= 10; k++) {
      const lx = cx0 + ((cx1 - cx0) * k) / 10;
      r.b.beam("metal", r.X(lx), 0, r.Z(cz1), r.X(lx), 2.6, r.Z(cz1), 0.02);
    }
    for (let k = 0; k <= 6; k++) {
      const lz = cz0 + ((cz1 - cz0) * k) / 6;
      r.b.beam("metal", r.X(cx0), 0, r.Z(lz), r.X(cx0), 2.6, r.Z(lz), 0.02);
    }
    for (const y of [0.1, 1.3, 2.6]) {
      r.b.beam("metal", r.X(cx0), y, r.Z(cz1), r.X(cx1), y, r.Z(cz1), 0.03);
      r.b.beam("metal", r.X(cx0), y, r.Z(cz0), r.X(cx0), y, r.Z(cz1), 0.03);
    }
    r.col(cx0, 0, cz1 - 0.05, cx1 - 1.3, 2.6, cz1 + 0.05);
    r.col(cx0 - 0.05, 0, cz0, cx0 + 0.05, 2.6, cz1);
    for (let k = 0; k < 9; k++) {
      const lx = 3.5 + k * 0.45;
      r.b.beam(
        "wood_dark",
        r.X(lx),
        0.25,
        r.Z(-4.75),
        r.X(lx + 0.05),
        1.55,
        r.Z(-4.85),
        0.05,
      );
      r.b.beam(
        "black_metal",
        r.X(lx),
        0.9,
        r.Z(-4.7),
        r.X(lx + 0.02),
        1.5,
        r.Z(-4.72),
        0.03,
      );
    }
    r.bx("wood_dark", 3.3, 0.2, -4.95, 7.6, 0.28, -4.5, {});
    // ammo crates stacked in the NE corner (the cage gate is the 1.3 m gap at its SE corner — keep the way in clear)
    for (const c of [
      [7.3, -3.35, 0.1],
      [7.35, -3.4, 0.5, 0.7],
    ])
      P.crate(r.b, r.X(c[0]), c[3] || 0, r.Z(c[1]), 0.7, c[2], {
        tint: 0x6a7a4a,
      });
    r.col(6.9, 0, -3.9, 7.9, 1.4, -2.9);
    addContainer(rec, {
      id: "lma_neon_armory_ammo",
      name: "Armory Ammo Crate",
      kind: "ammo_box",
      loot: "ammo_box",
      lock: {
        id: "lma_neon_armory_ammo",
        label: "Neon Guard Armory Crate",
        code: "2618",
        hint: 'Barracks duty-roster terminal, "Standing Orders"',
        learnedFrom: 'Barracks duty-roster terminal, "Standing Orders"',
      },
      x: r.X(7.2),
      y: 0.75,
      z: r.Z(-2.85),
    });
    // the cage door, swung open against the front mesh, with a padlock hanging off the hasp
    r.b.box("metal", r.X(6.0), 0.05, r.Z(-1.3), 1.25, 2.5, 0.04, {
      yaw: 0.25,
      tint: 0x9a9a8a,
    });
    r.b.box("brass", r.X(6.66), 1.1, r.Z(-1.36), 0.08, 0.12, 0.06, {});
    A("armory", 4.6, -2.6, AY(0));
    // duty desk against the south wall with the roster terminal (faces the room)
    r.bx("metal_dark", 2.2, 0, 4.25, 3.8, 0.76, 4.95, { tint: 0x4a5a4a });
    r.bx("wood", 2.15, 0.76, 4.2, 3.85, 0.8, 4.98, {});
    r.col(2.15, 0, 4.2, 3.85, 0.8, 4.98);
    P.chair(r.b, r.X(3.0), 0, r.Z(3.7), 0);
    terminal("lma_neon_barracks", r.X(2.7), 0.8, r.Z(4.6), PI, {
      title: "NEON GUARD · DUTY ROSTER",
      header: "MERIDIAN TELETYPE CO. — TELELINK · NEON GUARD, 42ND ST BARRACKS",
      entries: [
        {
          title: "Standing Orders",
          text: () => {
            learn("lma_neon_armory_ammo");
            return "1. Holster check at every gate. Strangers get ONE warning. Our own get one warning and a look.\n2. Nobody fires inside the square. If somebody fires inside the square, everybody fires at them.\n3. Snipers on the roof rotate every six hours. Bring water. Bring a hat. The sun is still up there.\n4. The Ball is not a target.\n5. Armory crate combination is 2-6-1-8. Learn it. Do not shout it across the square.\n\n— Capt. Kincaid";
          },
        },
        {
          title: "Roster — This Week",
          text: 'GATE N ...... Haskins, Dray\nGATE S ...... Mags, "Two-Tone"\nGATE E ...... Petrakis, Lum\nGATE W ...... Osei, the new kid (name TBD)\nROOF ........ Vera, Sully\nNIGHT WATCH . whoever lost at cards',
        },
        {
          title: "Incident Log",
          text: "02/12 — Giant roach in the armory. Dealt with.\n02/13 — Second giant roach in the armory. Dealt with. Armory declared \"a roach situation\".\n02/15 — Somebody painted a mustache on the Mayor's poster. Suspect: everybody.\n02/17 — Sprocket's Valet, Marquee, sang outside the barracks until 0400. Nobody could find the off switch. There is no off switch.",
        },
      ],
    });
    board(r, "b_armory", r.X(5.4), 2.95, r.Z(-4.95), 2.6, 0.42, 0);
    // map table + the bounty board by the door, sandbags inside the entrance
    r.bx("wood", -1.2, 0.85, 1.6, 1.6, 0.9, 3.4, {});
    for (const q of [
      [-1.1, 1.7],
      [1.5, 1.7],
      [-1.1, 3.3],
      [1.5, 3.3],
    ])
      r.bx(
        "wood_dark",
        q[0] - 0.05,
        0,
        q[1] - 0.05,
        q[0] + 0.05,
        0.85,
        q[1] + 0.05,
        {},
      );
    r.b.quad(
      "tsxi",
      [r.X(-1.0), 0.905, r.Z(3.3)],
      [r.X(1.4), 0.905, r.Z(3.3)],
      [r.X(1.4), 0.905, r.Z(1.7)],
      [r.X(-1.0), 0.905, r.Z(1.7)],
      { rect: K.atlases.tsx_paint.slots.q_map.rect },
    );
    r.col(-1.2, 0, 1.6, 1.6, 0.9, 3.4);
    A("barracks_sergeant", 0.2, 1.1, PI);
    for (const q of [
      ["q_wanted1", -1.6],
      ["q_wanted2", -0.7],
      ["q_wanted3", 0.2],
    ])
      poster(r, q[0], r.X(q[1]), 1.9, r.Z(4.97), 0.7, 0.92, PI);
    A("bounty_board", -0.7, 4.0, 0);
    P.sandbags(r.b, r.X(-6.4), r.Z(4.2), r.X(-5.2), r.Z(3.4), 2, { seed: 991 });
    P.sandbags(r.b, r.X(-1.6), r.Z(4.2), r.X(-2.8), r.Z(3.4), 2, { seed: 992 });
    for (const q of [
      [-5, -2],
      [-5, 2.5],
      [0, -2.5],
      [4.8, -3.2],
      [4, 2.5],
    ])
      lamp(r, r.X(q[0]), r.Z(q[1]), {
        kind: q[0] > 4 ? "cage" : "fluor",
        y: 3.2,
        col: 0xeef4e8,
        len: 1.2,
        yaw: PI / 2,
        pool: 3.4,
        i: 0.45,
      });
    r.fix.push([r.X(0), 3.0, r.Z(0), 0xf0f4e8, { intensity: 1.1, range: 10 }]);
    finish(r);
    return r;
  }

