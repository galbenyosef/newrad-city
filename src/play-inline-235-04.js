// play-inline-235 04 — the
// Lines 382-701 of readable/play-inline-235.pretty.js (statement-aligned).
  D.rockefeller_30rock = function (C) {
    flickerTube(C, 13, 4.3, -16, 0, 1.3, 0.35); // armory
    const RX = 85,
      RZ = 0,
      RY = 20,
      RR = 15,
      SY = 6;
    // plaza transom over the lobby doors (east wall x 30) + the Rainbow Room's west/south windows (low afternoon sun)
    A.shaft(C, [29.7, 8.2, 0], [-1, -0.42, 0], 13, 3.0, 5.0, WARM, 0.07);
    for (let i = 0; i < 7; i++) {
      const a = Math.PI * 0.55 + (i / 6) * Math.PI * 0.5 + Math.PI / 24,
        wx = RX + Math.cos(a) * (RR + 0.2),
        wz = RZ + Math.sin(a) * (RR + 0.2);
      A.shaft(
        C,
        [wx, RY + 6.2, wz],
        [-Math.cos(a), -0.5, -Math.sin(a)],
        15,
        2.0,
        3.2,
        0xffdcb0,
        0.075,
      );
    }
    // the Rainbow Room lives on its windows: cool daylight fill around the ring (baked)
    for (let i = 0; i < 12; i++) {
      const a = ((i + 0.5) / 12) * Math.PI * 2;
      C.b.light(
        RX + Math.cos(a) * 13.4,
        RY + 3.6,
        RZ + Math.sin(a) * 13.4,
        0xdde6f0,
        12,
        1.15,
      );
    }
    A.dust(C, -13, 0.5, -7.5, 29, 9.5, 7.5, 200);
    A.dust(C, RX - 13, RY + 0.4, RZ - 13, RX + 13, RY + 8, RZ + 13, 240);
    A.dust(C, -15.5, SY + 0.5, -39.5, 3.5, SY + 7.5, -17, 140); // Studio 8H library
    // the Covenant keeps a clean house — scraps, spent casings' boxes, a few cans; the rig bays are greasier
    F.clutter(C, -14, -8, 30, 8, 0, { n: 26, seed: 21, mix: TIDY });
    F.clutter(C, 4.3, -24, 22, -8.3, 0, {
      n: 22,
      seed: 22,
      mix: {
        paper: 1,
        crumple: 0.5,
        can: 2,
        bottle: 0.3,
        chunk: 0.2,
        plank: 0.6,
        box: 2.5,
      },
    });
    F.clutter(C, 4.3, 8.3, 24, 26, 0, {
      n: 34,
      seed: 23,
      mix: {
        paper: 1,
        crumple: 1,
        can: 3,
        bottle: 1,
        chunk: 0.5,
        plank: 1.5,
        box: 2,
      },
    });
    F.clutter(C, -16, -40, 4, -16.7, SY, {
      n: 30,
      seed: 24,
      mix: {
        paper: 8,
        crumple: 3,
        can: 0.3,
        bottle: 0.2,
        chunk: 0.2,
        plank: 0,
        box: 0.8,
      },
    });
    F.clutter(C, 4.3, -40, 20, -26, SY, { n: 14, seed: 25, mix: TIDY });
    F.clutter(C, RX - RR, RZ - RR, RX + RR, RZ + RR, RY, {
      yMax: RY + 0.4,
      n: 40,
      seed: 26,
      test: (x, z) => Math.hypot(x - RX, z - RZ) < RR - 0.3,
      mix: {
        paper: 1.5,
        crumple: 2,
        can: 3,
        bottle: 2,
        chunk: 0.2,
        plank: 0,
        box: 0.6,
      },
    });
  };

  // ------------------------------------------------------------------ NYSE
  D.nyse_floor = function (C) {
    flickerTube(C, 0, 3.35, 22.5, Math.PI / 2, 1.3, 0.7); // members' corridor
    // the great west window wall (x −28): three tall bays, light raking east across the trading floor
    for (const [z0, z1] of [
      [-18, -7],
      [-5, 5],
      [7, 16],
    ])
      for (let k = 0; k < 3; k++) {
        const z = z0 + ((z1 - z0) * (k + 0.5)) / 3;
        A.shaft(
          C,
          [-27.8, 13.5 - k * 2.2, z],
          [1, -0.58, 0.12],
          26,
          2.6,
          4.6,
          DAY,
          0.06,
        );
      }
    A.dust(C, -27, 1, -21, 27, 18, 17, 520);
    // raider squalor: the trading floor, the pit bleachers, the corridor, the board room, the strongroom
    F.clutter(C, -28, -22, 28, 18, 0, {
      yMax: 1.2,
      n: 170,
      seed: 31,
      edge: 0.55,
      mix: FILTH,
    });
    F.clutter(C, -3, 18.4, 3, 30, 0, { n: 20, seed: 32, mix: FILTH });
    F.clutter(C, 4.3, -38, 24, -22.6, 5.5, {
      n: 26,
      seed: 33,
      mix: {
        paper: 5,
        crumple: 2,
        can: 2,
        bottle: 3,
        chunk: 0.5,
        plank: 0.3,
        box: 0.4,
      },
    });
    F.clutter(C, -24, -38, -1, -24, 0, {
      n: 16,
      seed: 34,
      mix: {
        paper: 6,
        crumple: 1,
        can: 0.5,
        bottle: 0.5,
        chunk: 1,
        plank: 0,
        box: 1,
      },
    });
  };

  // ------------------------------------------------------------------ WOOLWORTH
  D.woolworth_lobby = function (C) {
    flickerTube(C, -12, 8.7, -18, 0, 1.3, 0.6); // typing pool
    const MY = 5.4,
      HY = MY + 7.2,
      CX = 68,
      CY = 40;
    // amber light falling through the stained-glass laylight over the grand stair
    A.shaft(
      C,
      [-22.2, HY - 0.4, -2.2],
      [0.05, -1, 0.12],
      HY - 0.6,
      3.4,
      4.6,
      AMBER,
      0.09,
    );
    A.shaft(
      C,
      [-22.2, HY - 0.4, 2.2],
      [0.05, -1, -0.1],
      HY - 0.6,
      3.4,
      4.6,
      AMBER,
      0.08,
    );
    // Broadway daylight through the pried-open portal transom (east end of the arcade)
    A.shaft(C, [22.3, 6.4, 0], [-1, -0.38, 0], 16, 2.4, 4.2, DAY, 0.075);
    // the Crown: sun through the south lancets
    for (let k = 0; k < 4; k++)
      A.shaft(
        C,
        [CX + 7 - (k + 0.5) * 3.5, CY + 3.8, 7],
        [0.1, -0.55, -1],
        11,
        1.7,
        2.8,
        0xffe8c8,
        0.08,
      );
    A.dust(C, -15, 0.5, -4.2, 21.5, 9, 4.2, 240);
    A.dust(C, -28, 0.5, -5.5, -17, HY - 0.5, 5.5, 140);
    A.dust(C, CX - 6.5, CY + 0.4, -6.5, CX + 6.5, CY + 6, 6.5, 150);
    // Five & Dime raiders: nickel-hoarding, bottle-dropping, plank-hoarding
    F.clutter(C, -16, -12, 22, 12, 0, { n: 110, seed: 41, mix: FILTH });
    F.clutter(C, -29, -6, -16, 6, MY, { n: 24, seed: 42, mix: FILTH });
    F.clutter(C, -29, -26, -10, -10.4, MY, {
      n: 44,
      seed: 43,
      mix: {
        paper: 9,
        crumple: 3,
        can: 1,
        bottle: 1,
        chunk: 2,
        plank: 0.6,
        box: 1.5,
      },
    });
    F.clutter(C, CX - 7, -7, CX + 7, 7, CY, {
      n: 36,
      seed: 44,
      mix: {
        paper: 1,
        crumple: 1,
        can: 3,
        bottle: 3,
        chunk: 1,
        plank: 1,
        box: 0.8,
      },
    });
  };

  // ------------------------------------------------------------------ CITY HALL
  D.city_hall_rotunda = function (C) {
    flickerTube(C, 22, 5.4, -4, 0, 1.3, 0.7);
    flickerTube(C, 27, 5.4, 6, 0, 1.3, 0.45); // records basement
    const GY = 6,
      GH = GY + 5.6,
      CH = GY + 7;
    // grey daylight: Governor's Room windows (south wall z 4) and the Council Chamber's tall windows (z ±10)
    for (const [a0, a1] of [
      [-25, -22.6],
      [-17.8, -15.4],
    ])
      A.shaft(
        C,
        [(a0 + a1) / 2, GH - 1.4, 3.9],
        [0.15, -0.55, -1],
        9,
        2.0,
        3.0,
        DAY,
        0.08,
      );
    for (const [a0, a1] of [
      [19.3, 23.3],
      [25.3, 29.3],
    ])
      A.shaft(
        C,
        [(a0 + a1) / 2, CH - 1.6, 9.9],
        [-0.1, -0.6, -1],
        12,
        3.4,
        5.0,
        DAY,
        0.07,
      );
    A.dust(C, -9, 0.5, -9, 9, 12.5, 9, 260); // rotunda under the oculus
    A.dust(C, 12.5, GY + 0.4, -9.5, 31.5, CH - 0.5, 9.5, 160);
    // the robots sweep — badly: records paper everywhere, little else
    const OFFICE = {
      paper: 9,
      crumple: 2,
      can: 0.3,
      bottle: 0.3,
      chunk: 1.2,
      plank: 0.2,
      box: 1,
    };
    F.clutter(C, -9.3, -9.3, 9.3, 9.3, 0, {
      n: 30,
      seed: 51,
      test: (x, z) => Math.hypot(x, z) < 8.9,
      mix: OFFICE,
    });
    F.clutter(C, -12, -12, 12, 12, GY, { n: 26, seed: 52, mix: OFFICE });
    F.clutter(C, -28, -8, -12, 4, GY, { n: 22, seed: 53, mix: OFFICE });
    F.clutter(C, -8, -26, 8, -12, GY, { n: 22, seed: 54, mix: OFFICE });
    F.clutter(C, 12, -10, 32, 10, GY, {
      n: 40,
      seed: 55,
      mix: {
        paper: 7,
        crumple: 2,
        can: 0.3,
        bottle: 0.3,
        chunk: 3,
        plank: 1.5,
        box: 0.5,
      },
    });
    F.clutter(C, 12, -10, 32, 10, 0, {
      n: 40,
      seed: 56,
      mix: {
        paper: 12,
        crumple: 3,
        can: 0.2,
        bottle: 0.2,
        chunk: 2,
        plank: 0.5,
        box: 3,
      },
    });
  };

  // ------------------------------------------------------------------ FLATIRON
