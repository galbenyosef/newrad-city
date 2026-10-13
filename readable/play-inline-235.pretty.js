/* src/landmark_interiors/80_dressing.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 80_dressing.js
 * Per-cell "lived-in wreckage" + atmosphere pass (round 2), run by
 * C.finish() just before each cell's batch is merged and baked:
 *   - god-ray light shafts through the real openings (glass fronts,
 *     window walls, lancets, laylights, the broken dome, the oculus)
 *   - floating dust motes in the big volumes (one Points per cell)
 *   - floor clutter (papers, cans, bottles, plaster chunks, planks, soggy
 *     boxes) scattered only on bare floor, drifting against walls and
 *     furniture — tuned per faction: the Iron Covenant keeps its hold
 *     tidy, the raiders' dens are filthy, the robots sweep (badly).
 * Coordinates are the cells' local metres (see each builder's header).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
  const LI = G._li,
    A = LI.arch,
    F = LI.furn;
  const D = (LI.dress = LI.dress || {});
  const DAY = 0xdce6f0,
    WARM = 0xffe6c0,
    AMBER = 0xffc878;
  /** A ceiling tube whose real light pool stutters (atmosphere's fixture pool) over a dim baked base. */
  const flickerTube = (C, x, y, z, ry, len, amt) => {
    A.tube(C, x, y, z, ry, len || 1.3, { r: 6, i: 0.35 });
    C.glow(x, y - 0.08, z, 0xe0f0ff, 1.1, {
      fixture: true,
      flicker: amt || 0.55,
      intensity: 1.1,
      range: 7,
    });
  };
  /** Tripod work floodlight aimed along yaw (0 = −z), with a baked pool + a real fixture light near the player. */
  const floodlight = (C, x, y, z, yaw, o) => {
    o = o || {};
    const b = C.b,
      h = o.h || 2.3,
      sx = -Math.sin(yaw),
      sz = -Math.cos(yaw);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + yaw;
      b.rod(
        "metal_dark",
        [x, y + h - 0.35, z],
        [x + Math.cos(a) * 0.55, y, z + Math.sin(a) * 0.55],
        0.018,
      );
    }
    b.rod("metal_dark", [x, y + h - 0.4, z], [x, y + h - 0.05, z], 0.025);
    b.obox(
      o.body || "continuity_black",
      x,
      y + h + 0.1,
      z,
      0.55,
      0.42,
      0.3,
      yaw,
      { rx: -0.25 },
    );
    b.obox(
      "lamp_cool",
      x + sx * 0.16,
      y + h + 0.1 - 0.04,
      z + sz * 0.16,
      0.46,
      0.34,
      0.02,
      yaw,
      { rx: -0.25 },
    );
    b.light(
      x + sx * 2.2,
      y + h - 0.4,
      z + sz * 2.2,
      o.color || 0xe4eeff,
      o.r || 11,
      o.i || 0.9,
    );
    C.glow(
      x + sx * 0.25,
      y + h + 0.08,
      z + sz * 0.25,
      o.color || 0xe4eeff,
      1.4,
      { fixture: true, intensity: 1.2, range: 10 },
    );
    C.col(x - 0.4, y, z - 0.4, x + 0.4, y + h, z + 0.4, {
      walkable: false,
      surface: "metal",
    });
  };
  /** Cable run on the floor (sagging polyline). */
  const cable = (C, pts, y) => {
    for (let i = 0; i < pts.length - 1; i++)
      C.b.rod(
        "rubber",
        [pts[i][0], y + 0.025, pts[i][1]],
        [pts[i + 1][0], y + 0.025, pts[i + 1][1]],
        0.022,
        { seg: 5 },
      );
  };
  const TIDY = {
    paper: 4,
    crumple: 1,
    can: 0.6,
    bottle: 0.3,
    chunk: 0.6,
    plank: 0.1,
    box: 0.4,
  };
  const FILTH = {
    paper: 3,
    crumple: 2,
    can: 3,
    bottle: 2.5,
    chunk: 2,
    plank: 1.2,
    box: 1,
  };

  // ------------------------------------------------------------------ UN
  D.un_assembly = function (C) {
    const LOBY = 3.6,
      LCEIL = LOBY + 9.5;
    for (const x of [-20, 24]) flickerTube(C, x, 3.75, 19.2, 0, 1.3, 0.6); // backstage corridor
    // the Continuity's arrival kill-zone: floodlights on the doors, a field generator, ammo crates, cable runs
    floodlight(C, -5.2, LOBY, -32.4, 0.25);
    floodlight(C, 6.8, LOBY, -32.8, -0.3);
    C.b.box("metal_olive", -12.6, LOBY, -32.2, -11.2, LOBY + 0.85, -31.4, {
      c: 0x6a6e5a,
    });
    C.b.cyl("metal_dark", -12.3, LOBY + 0.85, -31.8, 0.08, 0.08, 0.35, 8);
    C.b.box(
      "lamp_green",
      -11.25,
      LOBY + 0.55,
      -32.0,
      -11.18,
      LOBY + 0.65,
      -31.9,
    );
    C.col(-12.6, LOBY, -32.2, -11.2, LOBY + 0.85, -31.4, {
      walkable: false,
      surface: "metal",
    });
    cable(
      C,
      [
        [-11.2, -31.8],
        [-8.4, -32.6],
        [-5.6, -32.3],
      ],
      LOBY,
    );
    cable(
      C,
      [
        [-11.2, -31.6],
        [-2.4, -31.2],
        [3.2, -31.6],
        [6.5, -32.6],
      ],
      LOBY,
    );
    F.crates(C, -18.5, LOBY, -32.6, 3, 0.1, { key: "metal_olive" });
    F.crates(C, 16.8, LOBY, -32.2, 4, -0.2, { key: "metal_olive" });
    C.prop("ammo_box", 16.2, LOBY, -33.6, 0.4, { loot: "ammo_box" });
    // daylight through the north glass front (z −44, x −12..12), raking south and down across the lobby
    for (const x of [-9.6, -4.8, 0, 4.8, 9.6])
      A.shaft(
        C,
        [x, LCEIL - 2.2, -43.9],
        [0.18, -0.62, 1],
        15,
        2.0,
        3.6,
        DAY,
        0.085,
      );
    A.dust(C, -28, LOBY + 0.3, -43, 28, LCEIL - 0.6, 0, 260);
    A.dust(C, -24, 1.5, -16, 24, 16, 16, 380); // the Assembly hall under the dome
    A.dust(C, 31, LOBY + 0.3, -33, 49, LOBY + 4, -15, 60); // delegates' lounge
    // lobby breakup (round 3): a bay of the lobby ceiling has come down on the east side — torn acoustic tiles, joists
    // and conduit hanging into a rubble mound — and a velvet-rope queue funnels visitors to the checkpoint gap
    {
      const b = C.b,
        cx = 19,
        cz = -13,
        cy = LCEIL;
      b.box(
        "black",
        cx - 3.2,
        cy - 0.06,
        cz - 2.4,
        cx + 3.2,
        cy - 0.02,
        cz + 2.4,
        { noBake: true },
      );
      for (let k = 0; k < 5; k++)
        b.box(
          "wood_rotten",
          cx - 3.2,
          cy - 0.4,
          cz - 2.2 + k * 1.1,
          cx + 3.2,
          cy - 0.12,
          cz - 2.0 + k * 1.1,
        );
      for (let k = 0; k < 4; k++)
        b.obox(
          "plaster",
          cx - 2 + k * 1.3,
          cy - 1.2 - k * 0.5,
          cz - 2.2 + (k % 2) * 0.4,
          1.2,
          0.05,
          1.8,
          0.2 * k,
          { rx: 0.9 + k * 0.15 },
        );
      b.rod(
        "rubber",
        [cx - 1.5, cy - 0.2, cz - 1],
        [cx - 0.8, cy - 3.4, cz - 0.4],
        0.02,
      );
      b.rod(
        "rubber",
        [cx + 1.2, cy - 0.2, cz + 0.6],
        [cx + 1.8, cy - 4.6, cz + 1.4],
        0.02,
      );
      b.rod(
        "steel",
        [cx + 2.5, cy - 0.3, cz - 2],
        [cx + 1.4, LOBY + 0.4, cz - 0.5],
        0.05,
      );
      F.rubble(C, cx, LOBY, cz, 2.4, 131, {
        h: 0.55,
        col: true,
        n: 16,
        chunk: "plaster",
      });
      A.shaft(C, [cx, cy - 0.1, cz], [0.05, -1, 0.1], 9, 2.2, 3.2, DAY, 0.05);
      const post = (x, z) => {
        b.cyl("brass", x, LOBY, z, 0.16, 0.18, 0.04, 10);
        b.cyl("brass", x, LOBY + 0.04, z, 0.03, 0.03, 0.9, 6);
        b.sphere("brass", x, LOBY + 0.97, z, 0.05);
        C.col(x - 0.1, LOBY, z - 0.1, x + 0.1, LOBY + 1, z + 0.1, {
          walkable: false,
          surface: "metal",
        });
      };
      const rope = (a, q) => {
        const m = [(a[0] + q[0]) / 2, (a[1] + q[1]) / 2];
        b.rod(
          "fabric_red",
          [a[0], LOBY + 0.9, a[1]],
          [m[0], LOBY + 0.72, m[1]],
          0.022,
        );
        b.rod(
          "fabric_red",
          [m[0], LOBY + 0.72, m[1]],
          [q[0], LOBY + 0.9, q[1]],
          0.022,
        );
      };
      for (const s of [-1, 1]) {
        const pts = [
          [s * 1.6, -34.8],
          [s * 1.6, -36.8],
        ];
        pts.forEach((p) => post(p[0], p[1]));
        if (s < 0) rope(pts[0], pts[1]);
      }
      b.rod(
        "fabric_red",
        [1.6, LOBY + 0.9, -34.8],
        [1.75, LOBY + 0.03, -35.4],
        0.022,
      );
      b.rod(
        "fabric_red",
        [1.75, LOBY + 0.03, -35.4],
        [1.9, LOBY + 0.03, -36.6],
        0.022,
      ); // one rope unhooked
      // the way out, from inside: lettered transom over the bronze doors
      b.quad(
        LI.texMat(
          "un_exit",
          LI.signTex(
            "un_exit",
            ["EXIT · SORTIE", "UNITED NATIONS PLAZA"],
            { bg: "#1c2a3a", fg: "#e8e0c8", size: 46 },
            512,
            128,
          ),
          { rough: 0.7 },
        ),
        0,
        LOBY + 3.35,
        -44.05,
        2.6,
        0.62,
        0,
        { noAO: true },
      );
      for (const s of [-1, 1])
        b.box(
          "steel",
          s * 0.72 - 0.5,
          LOBY + 1.05,
          -44.19,
          s * 0.72 + 0.5,
          LOBY + 1.11,
          -44.13,
        );
    }
    // clutter: evacuation litter in the lobby, the tiers and the well, Continuity-tidy offices
    F.clutter(C, -29.5, -43.5, 29.5, 1.8, LOBY, {
      n: 150,
      seed: 11,
      mix: {
        paper: 7,
        crumple: 2,
        can: 1,
        bottle: 1,
        chunk: 2,
        plank: 0.3,
        box: 1,
      },
    });
    F.clutter(C, -28, -18, 28, 17.2, 0, {
      yMax: 3.7,
      n: 110,
      seed: 12,
      edge: 0.6,
      mix: {
        paper: 8,
        crumple: 2,
        can: 0.6,
        bottle: 0.8,
        chunk: 3,
        plank: 0.3,
        box: 0.2,
      },
    });
    F.clutter(C, -30, 17.5, 50, 21, 0, { n: 36, seed: 13, mix: TIDY });
    F.clutter(C, 30.6, -8.8, 49.8, 17.2, 0, {
      yMax: 3.7,
      n: 30,
      seed: 14,
      mix: TIDY,
    });
    F.clutter(C, 30.6, -33.8, 49.8, -14.2, LOBY, {
      n: 30,
      seed: 15,
      mix: {
        paper: 2,
        crumple: 1,
        can: 1,
        bottle: 3,
        chunk: 0.4,
        plank: 0,
        box: 0.3,
      },
    });
    F.clutter(C, 50.5, 6.2, 63.8, 23.8, 0, { n: 16, seed: 16, mix: TIDY });
  };

  // ------------------------------------------------------------------ 30 ROCK
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
  D.flatiron_interior = function (C) {
    flickerTube(C, -12, 8.0, -6, Math.PI / 2, 1.3, 0.5); // third-floor storerooms
    const FA = 0,
      FB = 4.3;
    const PL = [
      [-16.6, -28],
      [-14.8, -27.3],
      [24, 28],
      [-19, 28],
      [-19, -25.7],
      [-18.1, -27.2],
    ];
    const xd = (z) => -14.8 + (z + 27.3) * (38.8 / 55.3);
    // morning sun through the west (Fifth Avenue) windows on both floors, a few through the diagonal Broadway side
    for (const y0 of [FA, FB]) {
      for (let t = 1.6 + 2.4 * 2; t < 52; t += 2.4 * 3)
        A.shaft(
          C,
          [-18.7, y0 + 2.6, 28 - t],
          [1, -0.62, -0.15],
          6.5,
          1.0,
          1.9,
          0xffe4b8,
          0.085,
        );
    }
    A.dust(C, -18.5, FA + 0.4, -20, 8, FA + 3.6, 27, 180);
    A.dust(C, -18.5, FB + 0.4, -20, 8, FB + 3.6, 27, 150);
    // a friendly trading post: lived-in, swept around the counters, junk in the corners
    const inside = (x, z) =>
      LI.inPoly(PL, x, z) && x < xd(z) - 0.4 && x > -18.6;
    const LIVED = {
      paper: 3,
      crumple: 2,
      can: 2,
      bottle: 1.2,
      chunk: 0.6,
      plank: 0.8,
      box: 1.2,
    };
    F.clutter(C, -19, -27.3, 24, 28, FA, {
      n: 70,
      seed: 61,
      test: inside,
      mix: LIVED,
    });
    F.clutter(C, -19, -27.3, 24, 28, FB, {
      n: 60,
      seed: 62,
      test: inside,
      mix: LIVED,
    });
  };
})();
