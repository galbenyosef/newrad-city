// play-inline-221 05 — main
// Lines 884-1430 of readable/play-inline-221.pretty.js (statement-aligned).
  PH.hudsonDress = function (b, D) {
    const { HOLD, SEC, MAIN, O1, BR } = D;
    const HULL = 8.84; // inner face of the shell plating
    const FR = (x0, k) => x0 + 1.2 * k; // mid-bay between hull frames

    // ---------------- deckheads ----------------
    const tubeX = (x, z, len) => [
      x - len / 2 - 0.05,
      z - 0.2,
      x + len / 2 + 0.05,
      z + 0.2,
    ];
    const COMPS = [
      { x0: -44, x1: -20, top: SEC - 0.3 }, // shaft alley
      { x0: -20, x1: 15, top: MAIN - 0.3 }, // engine room
      { x0: 15, x1: 22, top: SEC - 0.3, skip: [[15.5, 4.8, 21.7, 7.6]] }, // fire room (ladder hole)
      { x0: 22, x1: 44, top: SEC - 0.3, skip: [[37.1, 2.6, 38.9, 4.4]] }, // magazine (hoist trunk)
      { x0: -44, x1: -20, top: MAIN - 0.3, skip: [[-40.7, 3.4, -32.4, 7.0]] }, // berthing (quarterdeck stair)
      {
        x0: 15,
        x1: 36,
        top: MAIN - 0.3,
        skip: [
          [29.4, -9, 35.8, -4.7],
          tubeX(18, 0, 2.4),
          tubeX(23, 0, 2.4),
          tubeX(28, 0, 2.4),
          tubeX(33, 0, 2.4),
        ],
      }, // mess
      { x0: 36, x1: 44, top: MAIN - 0.3 }, // brig
      { x0: -44, x1: -32, top: MAIN + 4 }, // quarterdeck
      {
        x0: -32,
        x1: 20,
        top: MAIN + 3.4,
        skip: [
          [-23.3, -5.5, -22.7, -4.9],
          [11.6, -6.1, 12.4, -3.9],
        ].concat(
          [-28, -22, -16, -10, -4, 2, 8, 14].map((x) => tubeX(x, 0, 1.6)),
        ),
      }, // officers' passage
      {
        x0: 20,
        x1: 44,
        top: O1 - 0.3,
        skip: [
          [19.8, 2.8, 29, 8.4],
          [33.5, -4.6, 42.6, 5.8],
        ],
      }, // forward hall (trunk, barbette, hoist)
      {
        x0: 18,
        x1: 34,
        z0: -6.85,
        z1: 8.05,
        top: BR - 0.3,
        skip: [[21.1, 2.8, 29, 8.4], tubeX(24, 0, 2.4), tubeX(31, -4, 2.4)],
        girders: [-3.2, 1.6],
      }, // CIC
      {
        x0: 18,
        x1: 36,
        z0: -6.85,
        z1: 8.05,
        top: BR + 3.6,
        girders: [-3.2, 1.6],
      }, // bridge
    ];
    for (const c of COMPS) deckhead(b, c);

    // ---------------- hull-side services (pipes, cable trays) ----------------
    const RUNS = [
      // x0, x1, top, trays?, sides
      [-44, -20, SEC - 0.3, false],
      [-20, 15, MAIN - 0.3, true],
      [15, 22, SEC - 0.3, false],
      [22, 44, SEC - 0.3, false, [-1]],
      [-44, -20, MAIN - 0.3, true],
      [15, 36, MAIN - 0.3, true],
      [36, 44, MAIN - 0.3, false],
      [-44, -32, MAIN + 4, true],
      [-32, 20, MAIN + 3.4, false],
      [20, 44, O1 - 0.3, true],
    ];
    for (const [x0, x1, top, trays, sides] of RUNS) {
      for (const s of sides || [-1, 1]) {
        const z = s * 8.46;
        pipeX(
          b,
          x0 + 0.1,
          x1 - 0.1,
          top - 0.2,
          z,
          0.1,
          s < 0 ? "navy" : "paint_white",
          top,
          {
            band: s < 0 ? "paint_red" : "paint_blue",
            valves: true,
            valveKey: s < 0 ? "paint_red" : "paint_blue",
          },
        );
        pipeX(
          b,
          x0 + 0.1,
          x1 - 0.1,
          top - 0.36,
          s * 8.28,
          0.06,
          "iron",
          undefined,
          { band: "paint_yellow" },
        );
        if (trays) trayX(b, x0 + 0.2, x1 - 0.2, top - 0.42, s * 7.6, top);
      }
    }
    // pipe markers on the runs (one per compartment side)
    for (const [x, y, z, t] of [
      [-8, MAIN - 1.0, -8.3, "FIRE MAIN  ▶"],
      [-8, MAIN - 1.0, 8.3, "POTABLE WATER  ▶"],
      [25, MAIN - 1.0, -8.3, "FIRE MAIN  ▶"],
      [-30, MAIN - 1.0, 8.3, "STEAM  ▶"],
      [-38, MAIN + 3.2, -8.3, "FIRE MAIN  ▶"],
      [26, O1 - 1.0, 8.3, "FUEL OIL  ▶"],
    ]) {
      label(b, t, x, y, z, z < 0 ? 0 : Math.PI, 0.72);
    }
    // centreline vent ducts (berthing, mess, forward hall, engine room top)
    ductX(b, -43.6, -20.4, MAIN - 0.95, -1.6, 0.8, 0.45, MAIN - 0.3);
    ductX(b, 15.4, 29.2, MAIN - 0.95, -2.2, 0.7, 0.4, MAIN - 0.3);
    ductX(b, -19.6, 14.6, MAIN - 1.1, 4.4, 0.9, 0.5, MAIN - 0.3);
    ductX(b, 20.4, 33.2, O1 - 0.95, -2.0, 0.7, 0.4, O1 - 0.3);
    ductX(b, 18.4, 33.4, BR - 0.95, -5.0, 0.6, 0.38, BR - 0.3); // CIC (over the radar consoles)
    // risers
    for (const [x, z, y0, y1, k] of [
      [-36.8, 8.55, HOLD, SEC - 0.3, "paint_green"],
      [-30.8, 8.55, HOLD, SEC - 0.3, "iron"],
      [-15.2, 8.5, HOLD, MAIN - 0.3, "paint_white"],
      [-3.2, 8.5, HOLD, MAIN - 0.3, "paint_green"],
      [4.0, 8.5, HOLD, MAIN - 0.3, "iron"],
      [-11.6, -8.5, HOLD, SEC - 0.3, "paint_red"],
      [27.4, 8.5, SEC, MAIN - 0.3, "paint_white"],
      [-43.5, 8.5, MAIN, MAIN + 4, "paint_red"],
      [43.5, -8.5, MAIN, O1 - 0.3, "paint_white"],
    ])
      riser(b, x, z, y0, y1, 0.08, k);

    // ---------------- per-compartment fittings ----------------
    // SHAFT ALLEY
    lantern(b, -38, 2.9, -HULL, 0);
    lantern(b, -26, 2.9, -HULL, 0);
    label(b, "3-110-0-E", -43.84, 2.4, 5, HP, 0.9);
    gauges(b, -32, 2.3, -HULL, 0, 4);
    decal(b, "oil_stain", -30, HOLD + 0.32, 0.5, 2.2, 0.7);
    // ENGINE ROOM
    fireStation(b, FR(-20, 11), SEC + 0.3, HULL, Math.PI);
    gauges(b, -10.4, 2.3, -HULL, 0, 6);
    gauges(b, -1.4, 2.3, HULL, Math.PI, 6);
    phone(b, 1.6, SEC + 1.5, -HULL, 0);
    lantern(b, FR(-20, 4), SEC + 2.6, -HULL, 0);
    lantern(b, FR(-20, 23), SEC + 2.6, HULL, Math.PI);
    label(b, "4-72-0-E", -19.84, 6.5, -3, HP, 1.0);
    label(b, "CAUTION: HIGH VOLTAGE", 8.4, 2.9, -8.05, 0, 0.9);
    label(b, "DON'T NAP HERE", -19.83, 6.2, 3.5, HP, 1.6, 0.02);
    for (const [x, z, s, rt] of [
      [-2, 3.2, 2.4, 0.3],
      [6, -2.5, 1.8, 1.9],
      [-11, 5.5, 1.6, 2.6],
    ])
      decal(b, "oil_stain", x, HOLD, z, s, rt);
    litter(b, -1, -6, 12, 6, HOLD, 16, "eng");
    // FIRE ROOM
    lantern(b, FR(15, 5), 2.8, HULL, Math.PI);
    label(b, "4-58-0-E", 21.84, 2.6, 2.5, -HP, 0.9);
    label(b, "Ⓩ  ZEBRA", 21.84, 2.25, -1.7, -HP, 0.6);
    decal(b, "scorch", 18.5, HOLD, -3.5, 2.0, 0.4);
    // MAGAZINE
    label(b, "4-40-0-M", 22.16, 2.6, 3, HP, 0.9);
    label(b, "NO SMOKING", 22.16, 2.2, 3, HP, 0.9);
    lantern(b, 43.84, 3.0, 5.5, -HP);
    // BERTHING
    fireStation(b, -43.85, SEC + 0.3, 2.2, HP);
    label(b, "2-110-0-L", -43.84, 7.3, -1, HP, 0.9);
    lantern(b, FR(-44, 15), SEC + 2.95, HULL, Math.PI);
    lantern(b, FR(-44, 6), SEC + 2.95, HULL, Math.PI);
    decal(b, "graffiti_skull", -20.16, SEC + 1.7, 3.2, 1.6, 0, -HP);
    label(b, "KEGS WAS HERE", -20.17, SEC + 0.9, 5.4, -HP, 1.4, 0.02);
    for (const [x, z, s] of [
      [-29, -1.5, 1.4],
      [-34.5, 3.2, 1.0],
    ])
      decal(b, "blood_pool", x, SEC, z, s, x);
    litter(b, -43, -2.4, -21, 2.4, SEC, 34, "berth");
    // sea bags against the racks
    {
      const r = PH.rng("seabags");
      for (let i = 0; i < 6; i++)
        b.cyl(
          "canvas",
          -40 + i * 3.1 + r(),
          SEC + 0.25,
          -2.35 + (i % 2) * 4.6,
          0.24,
          0.24,
          0.8,
          8,
          { rx: HP, ry: r() * 3, hSeg: 1, c: 0x8a8468 },
        );
    }
    // MESS
    fireStation(b, FR(15, 12), SEC + 0.3, HULL, Math.PI);
    lantern(b, FR(15, 6), SEC + 2.95, HULL, Math.PI);
    label(b, "2-52-0-L", 15.16, 7.4, -3, HP, 0.9);
    phone(b, 15.16, SEC + 1.5, 3.5, HP);
    label(b, "HATCH 4 EVER", 15.17, SEC + 1.2, -6.5, HP, 1.6, 0.02);
    decal(b, "graffiti_raiders", 35.84, SEC + 3.25, -6.2, 1.5, 0, -HP);
    for (const [x, z, s] of [
      [26, -1.8, 1.6],
      [31.5, 4.2, 1.1],
    ])
      decal(b, "blood_pool", x, SEC, z, s, x);
    decal(b, "paper_litter", 24, SEC, 2.4, 2.0, 1.1);
    litter(b, 21.5, -4.4, 35, 7.5, SEC, 36, "mess");
    // BRIG
    label(b, "2-36-0-L", 36.16, 7.2, -2.6, HP, 0.9);
    decal(b, "blood_pool", 42.5, SEC, -5.5, 1.3, 2.2);
    decal(b, "blood_smear", 43.84, SEC + 1.1, -5.2, 1.4, 0.3, -HP);
    label(b, "SHARKS BELOW", 43.83, SEC + 1.8, 5.4, -HP, 1.3, 0.02);
    for (let g = 0; g < 4; g++)
      for (let i = 0; i < 5; i++) {
        // days scratched on the cell wall, in fives
        const zz = 4.6 - g * 0.42 - (i < 4 ? i * 0.06 : 0.09),
          yy = SEC + 1.35 + (g % 2) * 0.05;
        b.box("paint_white", 43.83, yy, zz, 0.004, 0.2, 0.016, {
          rx: i === 4 ? 1.1 : 0,
          seg: false,
          noAO: true,
        });
      }
    // QUARTERDECK
    fireStation(b, FR(-44, 5), MAIN + 0.3, HULL, Math.PI);
    lantern(b, FR(-44, 8), MAIN + 3.0, -HULL, 0);
    label(b, "1-120-0-L", -32.16, MAIN + 2.6, 2.2, -HP, 0.9);
    label(b, "KEEP CLOSED", -32.16, MAIN + 2.1, 0, -HP, 0.8);
    label(b, "TOLL OR ROLL", -43.83, MAIN + 2.9, 0, HP, 1.8, 0.02);
    litter(b, -41, -5, -33.5, 3.4, MAIN, 18, "qd");
    // OFFICERS' PASSAGE: cabin door frames & open leaves, fire station, phone, lanterns, labels
    for (const x of [-24, -6, 11]) {
      cabinDoor(b, x, MAIN, -1.3, -1);
      cabinDoor(b, x, MAIN, 1.3, 1);
    }
    fireStation(b, -10, MAIN + 0.3, -1.22, 0);
    phone(b, 0, MAIN + 1.5, 1.22, Math.PI);
    lantern(b, -18, MAIN + 2.7, 1.22, Math.PI);
    lantern(b, 15, MAIN + 2.7, -1.22, 0);
    label(b, "1-80-0-L", -31.84, MAIN + 2.2, 0, HP, 0.9);
    label(b, "BATTLE DRESSING STA.", 11, MAIN + 2.35, -1.22, 0, 1.0);
    label(b, "ELLIS IS SOFT", -20, MAIN + 1.3, 1.23, Math.PI, 1.7, 0.02);
    decal(b, "blood_smear", -3, MAIN + 1.0, -1.22, 1.3, 1.2, 0);
    litter(b, -31, -1.1, 19, 1.1, MAIN, 22, "pass");
    // FORWARD HALL
    dcLocker(b, FR(20, 6), -HULL, MAIN, 0, true);
    fireStation(b, FR(20, 11), MAIN + 0.3, HULL, Math.PI);
    lantern(b, FR(20, 19), MAIN + 3.0, HULL, Math.PI);
    phone(b, 20.16, MAIN + 1.5, -5.5, HP);
    label(b, "1-40-0-L", 20.16, MAIN + 2.9, -3, HP, 0.9);
    label(b, "☠ MINE ☠", 33.74, MAIN + 1.6, 0.6, -HP, 0.9, 0); // on the barbette's aft face, between the ribs
    decal(b, "blood_pool", 25, MAIN, -2.5, 1.5, 0.8);
    decal(b, "oil_stain", 31, MAIN, 1.5, 1.6, 2.1);
    litter(b, 21.5, -4.6, 32, 2.2, MAIN, 22, "fwd");
    PH.propAt("first_aid", 12.6, MAIN + 1.4, -1.22, 0, {
      loot: "first_aid",
      name: "Battle Dressing Station",
    });

    // ---------------- CIC ----------------
    {
      const y = O1;
      label(b, "01-50-0-C", 18.16, y + 3.0, -5.5, HP, 0.9);
      // DRT plotting table: steel cabinet, chart under glass lit from below, rim, parallel rulers
      b.boxMM("navy_dark", 23, y, -3.5, 29, y + 0.82, -0.5, {
        seg: false,
        grime: 0.5,
      });
      b.boxMM("black", 22.9, y + 0.82, -3.6, 29.1, y + 0.9, -0.4, {
        seg: false,
      });
      const drt = PH.texMat("hudson_drt", drtTex(), { emissive: 0.22 });
      b.quad(drt, 26, y + 0.905, -2, 5.9, 2.9, { rx: -HP });
      b.boxMM("glass", 23.05, y + 0.91, -3.45, 28.95, y + 0.925, -0.55, {
        seg: false,
        grime: 0.15,
      });
      b.boxMM("chrome", 24.6, y + 0.93, -2.6, 26.2, y + 0.945, -2.5, {
        seg: false,
      });
      b.boxMM("chrome", 24.6, y + 0.93, -2.3, 26.2, y + 0.945, -2.2, {
        seg: false,
      });
      for (let i = 0; i < 5; i++)
        b.box(
          i % 2 ? "paint_red" : "paint_yellow",
          27 + i * 0.25,
          y + 0.93,
          -1.0,
          0.02,
          0.02,
          0.14,
          { ry: 0.3 * i, seg: false, noAO: true },
        ); // grease pencils
      b.box("chrome", 28.2, y + 0.93, -3.0, 0.3, 0.02, 0.3, { seg: false });
      PH.colMM(22.9, y, -3.6, 29.1, y + 0.93, -0.4, {});
      b.addLight(26, y + 1.4, -2, 0xd8f0d0, 5.5, 0.3);
      // status boards (edge-lit plexiglass in steel frames): surface plot on the aft wall, bounty board free-standing forward
      const bK = PH.texMat("hudson_boards", boardsTex(), { emissive: 0.85 });
      b.quad(bK, 18.19, y + 2.15, -2.6, 4.2, 2.1, {
        ry: HP,
        uvRect: [0, 0, 0.5, 1],
      });
      for (const zz of [-4.75, -0.45])
        b.box("navy_dark", 18.22, y + 0.9, zz, 0.08, 2.6, 0.1, { seg: false });
      for (const yy of [y + 1.07, y + 3.22])
        b.box("navy_dark", 18.22, yy, -2.6, 0.08, 0.08, 4.4, { seg: false });
      for (let k = 0; k < 5; k++)
        b.box("lamp", 18.25, y + 3.16, -4.4 + k * 0.9, 0.03, 0.03, 0.5, {
          seg: false,
          noAO: true,
        }); // edge lights
      b.quad(bK, 31.4, y + 2.15, 3.02, 4.2, 2.1, {
        ry: Math.PI,
        uvRect: [0.5, 0, 1, 1],
      });
      b.quad(bK, 31.4, y + 2.15, 3.08, 4.2, 2.1, {
        ry: 0,
        uvRect: [0.5, 0, 1, 1],
      });
      for (const xx of [29.2, 33.6]) {
        b.box("navy_dark", xx, y, 3.05, 0.1, 3.9, 0.1, { seg: false });
        PH.col(xx, 3.05, 0.14, 0.14, y, y + 3.9, 0, { walkable: false });
      }
      for (const yy of [y + 1.07, y + 3.22])
        b.box("navy_dark", 31.4, yy, 3.05, 4.4, 0.08, 0.08, { seg: false });
      PH.col(31.4, 3.05, 4.3, 0.08, y + 1.05, y + 3.25, 0, { walkable: false });
      b.addLight(19.2, y + 2.2, -2.6, 0xffe0a0, 4.5, 0.4);
      b.addLight(31.4, y + 2.2, 2.2, 0xffe0a0, 4.5, 0.4);
      PH.readAt(
        18.6,
        y + 1.9,
        -2.6,
        "Surface Status Board",
        'Grease pencil on plexiglass, written backwards from behind by someone who was bad at it. Track A: "SKIFF (ELLIS) — TAKE IT." Track B, Liberty Island: "ROBOTS. AVOID." Track C: "SHELLBACKS?? (KEGS SAYS)." At the bottom a tally: SKIFFS TAKEN — twelve.',
      );
      PH.readAt(
        31.4,
        y + 1.9,
        2.6,
        "The Commodore's Bounty Board",
        'REGISTRAR VELL — 500 SCRIP. DOC TRAN (ALIVE!) — 300. "PUMPS" OKAFOR — 50. SWEET TOOTH — DON\'T. THE ICEBOX KID (C-9 SLEEPER) — ???. BOSUN KEGS (OWES ME) — 20. Payable in scrip, rum, or teeth.',
      );
      // cable trays & a battle lantern
      trayX(b, 18.4, 33.6, BR - 0.72, -6.2, BR - 0.3);
      lantern(b, 33.84, y + 3.0, 4.8, -HP);
      phone(b, 18.16, y + 1.5, 1.8, HP);
      litter(b, 19, -4.5, 33, 2.2, y, 14, "cic");
    }

    // ---------------- BRIDGE ----------------
    {
      const y = BR;
      label(b, "04-44-0-C", 18.16, y + 2.95, -5.2, HP, 0.9);
      // voice tubes: bronze pipes dropping from the deckhead to bell mouths at the helm & chart table
      for (const [x, z] of [
        [31.6, -0.9],
        [31.6, 0.9],
        [24.2, -4.0],
        [33.8, -5.2],
      ]) {
        b.rod("bronze", V(x, y + 3.6, z), V(x, y + 1.75, z), 0.045, 8);
        b.lathe(
          "bronze",
          [
            [0.045, 0],
            [0.07, -0.08],
            [0.12, -0.18],
            [0.125, -0.2],
          ],
          12,
          x,
          y + 1.75,
          z,
          {},
        );
        b.cyl("black", x, y + 1.55, z, 0.11, 0.11, 0.01, 12, { hSeg: 1 });
      }
      for (const z of [-0.9, 0.9])
        b.rod("bronze", V(31.6, y + 3.5, z), V(18.5, y + 3.5, z), 0.045, 8);
      // overhead gyro-compass repeater & clinometer over the helm
      b.cyl("navy_dark", 32.1, y + 2.75, 0, 0.32, 0.32, 0.14, 16, {
        rz: HP,
        hSeg: 1,
      });
      b.cyl("paint_white", 31.96, y + 2.75, 0, 0.26, 0.26, 0.02, 16, {
        rz: HP,
        hSeg: 1,
        noAO: true,
      });
      b.rod("iron", V(32.1, y + 2.9, 0), V(32.1, y + 3.6, 0), 0.03, 5);
      // engine-order telegraph dials (faces) on the existing pedestals
      for (const z of [-1.6, 1.6])
        b.cyl("paint_white", 33.05, y + 1.15, z, 0.24, 0.24, 0.01, 14, {
          rz: HP,
          hSeg: 1,
          noAO: true,
        });
      // ---- THE COMMODORE'S THRONE ----
      // dais: 16" powder cans and plate on the old deck, a salvaged captain's chair on top
      const r = PH.rng("throne");
      for (let i = 0; i < 12; i++) {
        const px = 27.25 + (i % 3) * 0.72,
          pz = -1.65 + ((i / 3) | 0) * 1.1;
        b.cyl("bronze", px, y, pz, 0.34, 0.34, 0.46, 12, {
          hSeg: 1,
          grime: 0.55,
          c: 0xb89868,
        });
      }
      b.boxMM("diamond", 26.9, y + 0.46, -2.05, 29.1, y + 0.52, 2.05, {
        seg: false,
        grime: 0.6,
      });
      PH.stairs(b, "crate", 29.55, 0, HP * -1, 1.4, 0.45, y, y + 0.5, {
        maxRise: 0.26,
      }); // two ammo-crate steps up to the dais
      const cx = 28.05;
      b.cyl("chrome", cx, y + 0.52, 0, 0.1, 0.18, 0.42, 10, { hSeg: 1 }); // pedestal
      b.box("leather", cx, y + 0.94, 0, 0.78, 0.16, 0.76, {
        seg: false,
        c: 0x8a1c18,
      }); // seat
      b.box("leather", cx - 0.4, y + 1.0, 0, 0.16, 1.55, 0.8, {
        seg: false,
        c: 0x8a1c18,
      }); // tall back
      b.box("bronze", cx - 0.48, y + 1.0, 0, 0.04, 1.62, 0.9, { seg: false }); // gilt frame
      for (const s of [-1, 1]) {
        b.box("bronze", cx - 0.05, y + 1.1, s * 0.44, 0.7, 0.06, 0.08, {
          seg: false,
        }); // armrests
        b.box("bronze", cx + 0.25, y + 0.94, s * 0.44, 0.06, 0.2, 0.06, {
          seg: false,
        });
      }
      b.cyl("bronze", cx - 0.44, y + 2.62, 0, 0.26, 0.26, 0.04, 16, {
        rz: HP,
        hSeg: 1,
      }); // crest disc
      b.sphere("bone", cx - 0.4, y + 2.66, 0, 0.12, { sx: 1.0, sy: 1.1 }); // skull on the crest
      for (const s of [-1, 1]) {
        // a 16" shell standing either side of the throne, a skull on each nose
        const sx = 28.4,
          sz = s * 1.6;
        b.cyl("navy_dark", sx, y + 0.52, sz, 0.2, 0.2, 1.0, 12, { hSeg: 1 });
        b.cyl("bronze", sx, y + 0.72, sz, 0.205, 0.205, 0.1, 12, { hSeg: 1 });
        b.lathe(
          "navy_dark",
          [
            [0.2, 0],
            [0.19, 0.25],
            [0.12, 0.5],
            [0.02, 0.64],
          ],
          12,
          sx,
          y + 1.52,
          sz,
          {},
        );
        b.sphere("bone", sx, y + 2.2, sz, 0.11, { sx: 1.0, sy: 1.12 });
        PH.col(sx, sz, 0.42, 0.42, y + 0.52, y + 2.2, 0, { walkable: false });
      }
      // scrap backdrop behind the throne (hull plate, a stop sign, pipe frame) and loot at its feet
      // patchwork of salvaged plate on a pipe frame (knee-to-shoulder high, so the bridge stays open)
      [
        [-1.2, 0.9, "navyplate", 0.05, 1.5],
        [-0.1, 1.1, "corrugated", -0.04, 1.8],
        [1.05, 1.0, "hull_red", 0.06, 1.4],
      ].forEach(([dz, w, k, rz, hh]) =>
        b.box(k, 26.88, y + 0.5, dz, 0.05, hh, w, {
          rx: rz,
          seg: false,
          grime: 0.6,
        }),
      );
      for (const s of [-1, 1])
        b.rod(
          "iron",
          V(26.95, y, s * 1.75),
          V(26.95, y + 2.6, s * 1.75),
          0.05,
          6,
        );
      b.rod("iron", V(26.95, y + 2.55, -1.8), V(26.95, y + 2.55, 1.8), 0.05, 6);
      const jolly = PH.texMat(
        "navy_jolly",
        PH.canvasTex("ph_jolly", 8, 8, () => {}),
        { double: true },
      );
      b.quad(jolly, 26.99, y + 1.85, 0, 1.6, 1.0, { ry: HP });
      b.quad(jolly, 26.77, y + 1.85, 0, 1.6, 1.0, { ry: -HP });
      PH.col(26.88, 0, 0.2, 3.5, y, y + 2.3, 0, { walkable: false });
      for (let i = 0; i < 9; i++) {
        const a = r() * TAU,
          d = 0.9 + r() * 0.5,
          px = 29.4 + Math.cos(a) * 0.4,
          pz = Math.sin(a) * d * 1.3;
        if (Math.abs(pz) < 0.8 && px > 29.1) continue;
        b.box(
          ["cardboard", "crate", "metal", "leather"][i % 4],
          px,
          y + (px < 29.05 ? 0.52 : 0),
          pz,
          0.34,
          0.26,
          0.34,
          { ry: r() * 3, seg: false },
        );
      }
      for (let i = 0; i < 30; i++)
        b.cyl(
          "chrome",
          28.3 + r() * 0.7,
          y + 0.53,
          -1.4 + r() * 2.8,
          0.03,
          0.03,
          0.006,
          8,
          { hSeg: 1 },
        ); // spilled scrip
      decal(b, "blood_pool", 30.4, y, 0.4, 1.4, 0.4);
      label(b, "HATCH 4 EVER", 18.17, y + 1.5, 1.4, HP, 1.4, 0.02);
      trayX(b, 18.4, 35.6, y + 3.1, 6.6, y + 3.6);
      litter(b, 20, -6, 26.4, 2.5, y, 14, "bridge");
    }
  };
