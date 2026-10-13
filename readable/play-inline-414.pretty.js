/* src/poi_fidi3/31_delmonicos_interior.js */
/* =====================================================================
 * NEW RAD CITY — poi_fidi3 / 31_delmonicos_interior.js
 * DELMONICO'S — interior cell `delmonicos`.
 *
 * Plan (local metres; player enters at (0,0,-1.6) looking north):
 *   Foyer (black & white marble, the maître d's podium, the coat check
 *     with far too many coats) → MAIN DINING ROOM: oxblood damask,
 *     mahogany, gilt, three crystal chandeliers, candle-lit tables of the
 *     Gilded Fork Society, the long bar, a grand piano → the MORGAN ROOM
 *     (the members' private table, silver cloches, portraits, fireplace)
 *     → KITCHEN (spotless steel, subway tile, Walt's empty dish station)
 *     → locked COLD STORAGE door → the CELLAR (y −5): the butchery, the
 *     freezer, and the LARDER where Walt Tully waits in a cage.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const CY = -5;

  // ---- locks: keys, codes and passcodes (every unlock is placed in this POI) ----
  const DM_LOCKS = {
    cold: K.regLock({
      id: "pf3_lk_dm_cold",
      label: "Delmonico's Cold Storage",
      key: "pf3_dm_key",
      code: "1876",
      kind: "door",
      hint: "Chef Bastien and Hock carry the key; Chef Bastien says the code on Walt's kitchen tape reel.",
    }),
    cage: K.regLock({
      id: "pf3_lk_dm_cage",
      label: "Larder Cage Padlock",
      key: "pf3_dm_key",
      code: "4219",
      kind: "cage",
      hint: "The cold-storage key fits; Walt has watched Hock dial the combination every morning.",
    }),
    strongbox: K.regLock({
      id: "pf3_lk_dm_strongbox",
      label: "Society Strongbox",
      code: "7419",
      kind: "safe",
      hint: "The Society's recent minutes, on the Morgan Room teletype.",
    }),
    rolls: K.regLock({
      id: "pf3_lk_dm_rolls",
      label: "Gilded Fork Society Teletype",
      passcode: "PORTERHOUSE",
      kind: "terminal",
      hint: "Pencilled at the foot of the Book of Receipts, on the Morgan Room table.",
    }),
  };
  PV.DM_LOCKS = DM_LOCKS;
  K.keyFrom(
    "pf3_dm_key",
    'Chef Bastien (Persuasion: "inventory") or from his / Hock\'s body',
  );

  PV.dmInterior = function (ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "dm_int",
      off: O,
      lit: true,
      amb: [0.13, 0.1, 0.08],
      floors: [0, CY],
      grime: 0.2,
    });
    const r = K.rng("dm_int");
    const candle = [1, 0.7, 0.38],
      warm = [1, 0.78, 0.5],
      wood = [0.55, 0.28, 0.17],
      dam = [1.35, 1.12, 1.0];

    // ------------------------------------------------ gaps
    K.gap(ctx, 0, 0, 2.4, 0, 3.2, { casing: false });
    K.gap(ctx, 0, -6, 2.4, 0, 3.0);
    K.gap(ctx, -12, -17, 2.2, 0, 3.0);
    K.gap(ctx, 7, -28, 1.6, 0, 2.6);
    K.gap(ctx, 9, -46, 1.8, CY, 2.4);
    K.gap(ctx, -1.5, -52, 1.4, CY, 2.3);
    K.gap(ctx, 6, -52, 1.6, CY, 2.3);

    // ================================================= FOYER
    const FB = [-4.2, -1, -6.2, 4.2, 5, 0.2];
    K.room(b, ctx, {
      x0: -4,
      z0: -6,
      x1: 4,
      z1: 0,
      y: 0,
      h: 4.5,
      floor: "checker",
      fc: [0.85, 0.83, 0.8],
      wall: "damask_red",
      wc: dam,
      wain: "mahogany",
      wainC: wood,
      wainH: 1.2,
      ceil: "coffer",
      cc: [0.75, 0.62, 0.45],
      cornice: true,
      corniceMat: "gold",
      surface: "concrete",
    });
    b.boxMM("mahogany", -1.2, 0, -0.1, 1.2, 3.2, 0, {
      tint: [0.45, 0.18, 0.1],
    });
    b.plate("lamp", 0, 2.2, -0.11, 0, -1, 1.6, 1.4, null, {
      tint: [0.35, 0.3, 0.25],
    });
    b.hplate("velvet", 0, 0.012, -3, 1.4, 6, 0, null, {
      tint: [0.55, 0.08, 0.08],
    });
    // the podium with the reservation book and a brass lamp
    b.box("mahogany", -2.2, 0, -4.2, 0.7, 1.15, 0.55, { tint: wood });
    b.box("flat", -2.2, 1.15, -4.2, 0.42, 0.04, 0.32, {
      yaw: 0.2,
      tint: [0.3, 0.12, 0.08],
    });
    b.cyl("paint_green", -2.0, 1.15, -4.4, 0.1, 0.06, 0.06, 8);
    b.geo("lamp", K.sphereGeo(), {
      x: -2.0,
      y: 1.24,
      z: -4.4,
      s: 0.035,
      tint: warm,
    });
    b.col(-2.55, 0, -4.5, -1.85, 1.2, -3.9, { tag: "furniture" });
    b.light(-2.0, 1.4, -4.3, warm, 0.5, 3, { box: FB });
    // coat check (east alcove): the rail of coats that nobody came back for
    b.boxMM("mahogany", 2.6, 0, -5.8, 3.95, 1.1, -1.2, {
      tint: wood,
      faces: "nswt",
    });
    b.pipe("brass", 3.4, 2.1, -5.7, 3.4, 2.1, -1.3, 0.025, 5);
    for (let k = 0; k < 18; k++) {
      const z = -5.5 + k * 0.23;
      b.box("fabric", 3.4, 1.05, z, 0.5, 1.0, 0.12, {
        yaw: (r() - 0.5) * 0.3,
        tint: r.pick([
          [0.2, 0.2, 0.22],
          [0.35, 0.28, 0.2],
          [0.5, 0.45, 0.4],
          [0.25, 0.15, 0.12],
          [0.6, 0.55, 0.45],
        ]),
      });
    }
    b.col(2.6, 0, -5.8, 4, 2.2, -1.2, { tag: "furniture" });
    b.plate(
      "art",
      3.86,
      2.8,
      -3.5,
      -1,
      0,
      1.3,
      0.35,
      K.signCell("dm_coat", "COAT CHECK · 1 – 212", 256, 64, {
        bg: "#1a1410",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 0, 3.9, -3, "globe", warm, 0.8, 7, {
      ceil: 4.5,
      size: 0.22,
      lightOpts: { box: FB },
    });

    // ================================================= MAIN DINING ROOM
    const DX0 = -12,
      DX1 = 12,
      DZ0 = -28,
      DZ1 = -6,
      DH = 5.5;
    const DB = [DX0 - 0.2, -1, DZ0 - 0.2, DX1 + 0.2, DH + 1, DZ1 + 0.2];
    K.room(b, ctx, {
      x0: DX0,
      z0: DZ0,
      x1: DX1,
      z1: DZ1,
      y: 0,
      h: DH,
      floor: "parquet",
      fc: [0.62, 0.42, 0.3],
      wall: "damask_red",
      wc: dam,
      wain: "mahogany",
      wainC: wood,
      wainH: 1.4,
      ceil: "coffer",
      cc: [0.8, 0.62, 0.42],
      cornice: true,
      corniceMat: "gold",
      surface: "wood",
    });
    b.hplate("carpet", -3.2, 0.012, -16.8, 17, 18, 0, null, {
      tint: [0.5, 0.12, 0.1],
    });
    // gilt pilasters with mirrors between them on the west wall + salon paintings on the south
    for (const z of [-7.5, -12.2, -21.8, -26.5])
      b.boxMM("gold", DX0, 1.4, z - 0.2, DX0 + 0.22, DH - 0.4, z + 0.2, {
        tint: [0.8, 0.62, 0.3],
      });
    for (const z of [-9.85, -24.15]) {
      b.plate("glass", DX0 + 0.12, 3.2, z, 1, 0, 3.6, 2.6, null, {
        tint: [0.45, 0.4, 0.38],
        off: 0.02,
      });
      b.light(DX0 + 1, 3, z, candle, 0.15, 3, { box: DB });
    }
    K.salonWall(b, -11.5, -1.8, 1.6, DH - 0.5, DZ1 - 0.12, 0, -1, 331, {
      photos: "family",
      density: 0.75,
    });
    K.salonWall(b, 2, 8.5, 1.6, DH - 0.5, DZ1 - 0.12, 0, -1, 332, {
      density: 0.8,
    });
    // the tables
    const TABLES = [
      [-8, -10],
      [-3.2, -10],
      [1.6, -10],
      [-8, -16.6],
      [1.6, -16.6],
      [-8, -23],
      [-3.2, -23],
      [1.6, -23],
    ];
    TABLES.forEach(([x, z], i) => {
      K.roundTable(b, x, 0, z, 0.8, {
        cloth: [0.95, 0.93, 0.88],
        mat: "wood_dark",
      });
      // place settings: plates, silver, glasses, a candle
      for (let s = 0; s < 3; s++) {
        const a = (s / 3) * PI * 2 + i,
          px = x + Math.cos(a) * 0.52,
          pz = z - Math.sin(a) * 0.52;
        b.cyl("ceramic", px, 0.76, pz, 0.14, 0.12, 0.02, 12);
        b.box(
          "silver",
          px + Math.sin(a) * 0.19,
          0.765,
          pz + Math.cos(a) * 0.19,
          0.02,
          0.006,
          0.18,
          { yaw: a },
        );
        b.cyl(
          "glass",
          px + Math.cos(a + 0.6) * 0.15,
          0.76,
          pz - Math.sin(a + 0.6) * 0.15,
          0.03,
          0.035,
          0.16,
          6,
          { tint: i % 3 ? [0.55, 0.12, 0.12] : [0.8, 0.82, 0.8] },
        );
      }
      b.cyl("silver", x, 0.76, z, 0.05, 0.07, 0.12, 8);
      b.cyl("ivory", x, 0.88, z, 0.018, 0.018, 0.14, 6);
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: 1.05,
        z,
        sx: 0.02,
        sy: 0.035,
        sz: 0.02,
        tint: candle,
      });
      b.glow(x, 1.05, z, [0.9, 0.55, 0.25], 0.6);
      b.light(x, 1.3, z, candle, 0.55, 3.2, { box: DB });
      // chairs: south (facing north) and around
      K.chair(b, x, 0, z + 1.05, 0, {
        mat: "mahogany",
        seatMat: "velvet",
        seatTint: [0.5, 0.08, 0.08],
      });
      K.chair(b, x - 1.05, 0, z, -HP, {
        mat: "mahogany",
        seatMat: "velvet",
        seatTint: [0.5, 0.08, 0.08],
      });
      K.chair(b, x + 1.05, 0, z, HP, {
        mat: "mahogany",
        seatMat: "velvet",
        seatTint: [0.5, 0.08, 0.08],
      });
      if (i % 2) K.cloche(b, x - 0.3, 0.765, z + 0.25, 0.9);
    });
    // the grand piano (centre), lid up
    {
      const px = -3.2,
        pz = -16.6;
      b.box("paint_black", px, 0.7, pz, 1.5, 0.35, 2.0, {
        tint: [0.08, 0.07, 0.07],
        faces: "nsewtb",
        grime: 0.05,
      });
      b.box("paint_black", px + 0.35, 0.7, pz + 0.95, 0.8, 0.35, 0.5, {
        tint: [0.08, 0.07, 0.07],
        grime: 0.05,
      });
      b.quadN(
        "paint_black",
        [px - 0.72, 1.06, pz - 0.95],
        [px - 0.72, 1.06, pz + 0.95],
        [px + 0.2, 1.9, pz + 0.95],
        [px + 0.2, 1.9, pz - 0.95],
        [-0.7, 0.7, 0],
        { tint: [0.1, 0.09, 0.09], grime: 0.05 },
      );
      b.beam("brass", px + 0.1, 1.05, pz, px - 0.3, 1.8, pz, 0.02, 0.02);
      b.box("ivory", px, 0.98, pz - 1.08, 1.3, 0.04, 0.18, {
        tint: [0.92, 0.9, 0.84],
      });
      for (let k = 0; k < 18; k++)
        b.box(
          "paint_black",
          px - 0.6 + k * 0.072,
          1.0,
          pz - 1.1,
          0.03,
          0.03,
          0.1,
          { tint: [0.05, 0.05, 0.05] },
        );
      for (const [lx, lz] of [
        [-0.6, -0.8],
        [0.6, -0.8],
        [0, 0.85],
      ])
        b.cyl("paint_black", px + lx, 0, pz + lz, 0.06, 0.05, 0.7, 6, {
          tint: [0.08, 0.07, 0.07],
        });
      b.box("paint_black", px, 0, pz - 1.7, 0.9, 0.5, 0.36, {
        tint: [0.1, 0.09, 0.09],
      });
      b.col(px - 0.75, 0, pz - 1.1, px + 0.75, 1.1, pz + 1.2, {
        tag: "furniture",
        surface: "wood",
      });
    }
    // the long bar (east)
    const BX = 9.2;
    b.boxMM("mahogany", BX - 0.35, 0, -25, BX + 0.35, 1.1, -9, {
      tint: wood,
      faces: "nsewt",
    });
    b.boxMM("marble_black", BX - 0.45, 1.1, -25.1, BX + 0.45, 1.16, -8.9, {
      tint: [0.3, 0.3, 0.3],
    });
    b.pipe("brass", BX - 0.5, 0.2, -25, BX - 0.5, 0.2, -9, 0.03, 6);
    b.col(BX - 0.45, 0, -25.1, BX + 0.45, 1.16, -8.9, {
      tag: "counter",
      walkable: false,
    });
    for (let k = 0; k < 7; k++) {
      const z = -23.5 + k * 2.2;
      b.cyl("brass", BX - 0.9, 0, z, 0.04, 0.04, 0.75, 6);
      b.cyl("velvet", BX - 0.9, 0.75, z, 0.2, 0.2, 0.1, 10, {
        tint: [0.5, 0.08, 0.08],
      });
    }
    // back bar: mirror, shelves of bottles, a cash register
    b.boxMM("mahogany", DX1 - 0.6, 0, -25, DX1 - 0.05, 1.0, -9, {
      tint: wood,
      faces: "nswt",
    });
    b.plate("glass", DX1 - 0.12, 2.6, -17, -1, 0, 14, 2.0, null, {
      tint: [0.5, 0.45, 0.42],
    });
    for (const y of [1.6, 2.3, 3.0]) {
      b.boxMM("mahogany", DX1 - 0.45, y, -24.6, DX1 - 0.1, y + 0.04, -9.4, {
        tint: wood,
      });
      for (let z = -24.4; z < -9.6; z += 0.16 + r() * 0.1) {
        const h = 0.22 + r() * 0.12;
        b.cyl("glass", DX1 - 0.28, y + 0.04, z, 0.04, 0.04, h, 6, {
          tint: r.pick([
            [0.4, 0.25, 0.1],
            [0.25, 0.4, 0.25],
            [0.6, 0.55, 0.4],
            [0.5, 0.15, 0.1],
          ]),
        });
      }
    }
    b.col(DX1 - 0.6, 0, -25, DX1, 3.2, -9, { tag: "furniture" });
    b.light(DX1 - 1.4, 2.6, -17, warm, 0.6, 7, { box: DB });
    // chandeliers + wall sconces
    for (const [x, z] of [
      [-3.2, -11.5],
      [-3.2, -22],
      [5.2, -16.6],
    ])
      K.chandelier(b, x, 4.2, z, DH, {
        r: 0.9,
        arms: 8,
        intensity: 1.7,
        radius: 14,
        lightOpts: { box: DB },
      });
    for (let k = 0; k < 4; k++) {
      const z = -9.5 - k * 5.5;
      b.light(DX0 + 0.6, 2.6, z, candle, 0.6, 5, { box: DB });
      b.light(DX1 - 0.9, 3.2, z, candle, 0.45, 5, { box: DB });
      b.glow(DX0 + 0.3, 2.6, z, [0.8, 0.5, 0.25], 0.8);
      b.geo("lamp", K.sphereGeo(), {
        x: DX0 + 0.25,
        y: 2.6,
        z,
        s: 0.06,
        tint: candle,
      });
      b.pipe("brass", DX0 + 0.05, 2.45, z, DX0 + 0.25, 2.55, z, 0.015, 4);
    }
    b.plate(
      "art",
      0,
      DH - 0.7,
      DZ0 + 0.12,
      0,
      1,
      6,
      0.8,
      K.signCell("dm_motto", "OMNES EDUNT", 512, 72, {
        bg: null,
        fg: "#d8b060",
        font: "Georgia, serif",
        weather: false,
      }),
    );

    // ================================================= THE MORGAN ROOM (private dining)
    const MX0 = -22,
      MX1 = -12,
      MZ0 = -25,
      MZ1 = -9;
    const MB = [MX0 - 0.2, -1, MZ0 - 0.2, MX1 + 0.2, 5, MZ1 + 0.2];
    K.room(b, ctx, {
      x0: MX0,
      z0: MZ0,
      x1: MX1,
      z1: MZ1,
      y: 0,
      h: 4.5,
      floor: "parquet",
      fc: [0.5, 0.34, 0.24],
      wall: "wood",
      wc: [0.5, 0.3, 0.2],
      wain: "mahogany",
      wainC: wood,
      wainH: 1.0,
      ceil: "coffer",
      cc: [0.6, 0.45, 0.3],
      cornice: true,
      corniceMat: "gold",
      surface: "wood",
    });
    b.boxMM("mahogany", -18, 0.72, -22, -16, 0.8, -12, {
      tint: [0.4, 0.16, 0.1],
      faces: "nsewtb",
    });
    b.boxMM("cloth_white", -18.05, 0.8, -22.05, -15.95, 0.81, -11.95, {
      tint: [0.95, 0.93, 0.88],
    });
    for (const z of [-21, -13])
      b.boxMM("mahogany", -17.5, 0, z - 0.4, -16.5, 0.72, z + 0.4, {
        tint: wood,
      });
    b.col(-18, 0, -22, -16, 0.81, -12, { tag: "furniture", surface: "wood" });
    for (let k = 0; k < 5; k++) {
      const z = -21 + k * 2;
      K.chair(b, -18.7, 0, z, -HP, {
        mat: "mahogany",
        seatMat: "velvet",
        seatTint: [0.45, 0.06, 0.06],
      });
      K.chair(b, -15.3, 0, z, HP, {
        mat: "mahogany",
        seatMat: "velvet",
        seatTint: [0.45, 0.06, 0.06],
      });
      K.cloche(b, -17.45, 0.81, z, 1);
      K.cloche(b, -16.55, 0.81, z + 0.5, 0.9);
    }
    K.chair(b, -17, 0, -22.8, PI, {
      mat: "mahogany",
      seatMat: "velvet",
      seatTint: [0.45, 0.06, 0.06],
    });
    for (const z of [-19, -15]) {
      b.cyl("silver", -17, 0.81, z, 0.08, 0.1, 0.35, 8);
      for (let a = 0; a < 3; a++) {
        const px = -17 + (a - 1) * 0.18;
        b.cyl("ivory", px, 1.16, z, 0.02, 0.02, 0.18, 6);
        b.geo("lamp", K.sphereGeo(), {
          x: px,
          y: 1.38,
          z,
          sx: 0.02,
          sy: 0.035,
          sz: 0.02,
          tint: candle,
        });
        b.glow(px, 1.38, z, [0.9, 0.55, 0.25], 0.5);
      }
      b.light(-17, 1.6, z, candle, 0.7, 5, { box: MB });
    }
    // fireplace on the west wall
    b.boxMM("marble_black", MX0 + 0.1, 0, -18.4, MX0 + 0.7, 1.5, -15.6, {
      tint: [0.3, 0.3, 0.3],
    });
    b.boxMM("paint_black", MX0 + 0.11, 0.1, -17.7, MX0 + 0.72, 1.1, -16.3, {
      tint: [0.03, 0.03, 0.03],
    });
    b.boxMM("marble_black", MX0 + 0.1, 1.5, -18.7, MX0 + 0.9, 1.62, -15.3, {
      tint: [0.35, 0.35, 0.35],
    });
    for (let k = 0; k < 4; k++)
      b.geo("lamp", K.sphereGeo(), {
        x: MX0 + 0.4,
        y: 0.25 + r() * 0.2,
        z: -17.4 + k * 0.28,
        sx: 0.12,
        sy: 0.08 + r() * 0.1,
        sz: 0.1,
        tint: [1, 0.45, 0.15],
      });
    b.glow(MX0 + 0.8, 0.5, -17, [1, 0.45, 0.15], 2.0);
    b.light(MX0 + 1.4, 0.8, -17, [1, 0.5, 0.2], 1.1, 6, { box: MB });
    b.col(MX0, 0, -18.7, MX0 + 0.9, 1.62, -15.3, { tag: "furniture" });
    // the founders' portraits and the Society crest
    for (let k = 0; k < 4; k++)
      K.framed(
        b,
        -20.5 + k * 2.6,
        2.7,
        MZ0 + 0.12,
        0,
        1,
        1.1,
        1.4,
        K.photo("family", 200 + k, 128, 160),
        { frame: "gold" },
      );
    for (let k = 0; k < 4; k++)
      K.framed(
        b,
        -20.5 + k * 2.6,
        2.7,
        MZ1 - 0.12,
        0,
        -1,
        1.1,
        1.4,
        K.photo("family", 210 + k, 128, 160),
        { frame: "gold" },
      );
    const crest = K.paint(
      "art",
      "dm_crest",
      256,
      256,
      function (x, X, Y, W, H) {
        x.clearRect(X, Y, W, H);
        const cx = X + W / 2,
          cy = Y + H / 2;
        x.fillStyle = "#5a1a14";
        x.beginPath();
        x.moveTo(cx, Y + 10);
        x.lineTo(X + W - 20, Y + 40);
        x.lineTo(X + W - 30, Y + H * 0.6);
        x.lineTo(cx, Y + H - 10);
        x.lineTo(X + 30, Y + H * 0.6);
        x.lineTo(X + 20, Y + 40);
        x.closePath();
        x.fill();
        x.strokeStyle = "#d8b060";
        x.lineWidth = 6;
        x.stroke();
        x.save();
        x.translate(cx, cy);
        x.rotate(-0.6);
        x.fillStyle = "#e8d090";
        x.fillRect(-6, -70, 12, 140);
        for (let k = -1; k <= 1; k++) x.fillRect(k * 12 - 3, -95, 6, 30);
        x.restore();
        x.save();
        x.translate(cx, cy);
        x.rotate(0.6);
        x.fillStyle = "#d8d8d8";
        x.fillRect(-6, -70, 12, 140);
        x.beginPath();
        x.moveTo(-6, -70);
        x.lineTo(6, -70);
        x.lineTo(8, -110);
        x.closePath();
        x.fill();
        x.restore();
        x.fillStyle = "#d8b060";
        x.font = "bold 18px Georgia, serif";
        x.textAlign = "center";
        x.fillText("OMNES EDUNT", cx, Y + H * 0.88);
      },
    );
    b.plate("art", MX0 + 0.12, 3.1, -17, 1, 0, 1.3, 1.3, crest, { off: 0.03 });
    K.lamp(b, -17, 3.7, -17, "globe", warm, 0.4, 7, {
      ceil: 4.5,
      size: 0.2,
      lightOpts: { box: MB },
    });

    // ================================================= KITCHEN
    const KX0 = 0,
      KX1 = 14,
      KZ0 = -40,
      KZ1 = -28;
    const KB = [KX0 - 0.2, -1, KZ0 - 0.2, KX1 + 0.2, 5, KZ1 + 0.2];
    K.room(b, ctx, {
      x0: KX0,
      z0: KZ0,
      x1: KX1,
      z1: KZ1,
      y: 0,
      h: 4.2,
      floor: "checker",
      fc: [0.7, 0.7, 0.68],
      wall: "subway",
      wc: [0.95, 0.95, 0.92],
      ceil: "plaster",
      cc: [0.75, 0.75, 0.72],
      surface: "concrete",
      trim: false,
    });
    // stoves along the north wall with a hood, burners glowing
    b.boxMM("steel", 1, 0, -39.9, 9, 0.92, -38.9, { tint: [0.6, 0.62, 0.62] });
    b.col(1, 0, -39.9, 9, 0.92, -38.9, { tag: "furniture", surface: "metal" });
    for (let k = 0; k < 8; k++) {
      const x = 1.6 + k * 1.0;
      b.cyl("black_iron", x, 0.92, -39.4, 0.16, 0.16, 0.03, 10);
      if (k % 3 !== 1) {
        b.geo("lamp", new THREE.TorusGeometry(0.1, 0.012, 4, 14), {
          x,
          y: 0.96,
          z: -39.4,
          rx: HP,
          tint: [0.3, 0.45, 1],
        });
      }
    }
    b.cyl("steel", 2.6, 0.95, -39.4, 0.22, 0.2, 0.3, 10, {
      tint: [0.7, 0.7, 0.72],
    });
    b.cyl("copper", 5.6, 0.95, -39.4, 0.16, 0.16, 0.12, 10);
    b.quadN(
      "steel",
      [0.8, 2.3, -39.95],
      [9.2, 2.3, -39.95],
      [9.2, 2.0, -38.6],
      [0.8, 2.0, -38.6],
      [0, -0.9, 0.3],
      { tint: [0.55, 0.57, 0.57] },
    );
    b.light(5, 1.5, -38.5, [0.5, 0.6, 1], 0.4, 4, { box: KB });
    // prep island with hanging pot rack; the pass window to the dining room
    b.boxMM("steel", 4, 0, -35, 10, 0.92, -33, { tint: [0.65, 0.67, 0.67] });
    b.col(4, 0, -35, 10, 0.92, -33, { tag: "furniture", surface: "metal" });
    b.box("wood", 5.2, 0.92, -34, 0.9, 0.08, 0.6, { tint: [0.55, 0.4, 0.28] });
    b.box("steel", 5.3, 1.0, -34, 0.35, 0.01, 0.06, { yaw: 0.4 });
    b.pipe("steel", 4.2, 2.6, -34, 9.8, 2.6, -34, 0.025, 5);
    for (const x of [4.4, 9.6])
      b.pipe("black_iron", x, 2.6, -34, x, 4.2, -34, 0.01, 3);
    for (let k = 0; k < 9; k++) {
      const x = 4.6 + k * 0.6;
      b.pipe("black_iron", x, 2.6, -34, x, 2.4, -34, 0.006, 3);
      b.cyl(
        k % 3 ? "copper" : "steel",
        x,
        2.05,
        -34,
        0.16 + (k % 3) * 0.03,
        0.14,
        0.3,
        10,
        { tint: [0.9, 0.9, 0.9] },
      );
    }
    // Walt's dish station (east wall): sink, racks, an apron on a hook, his song sheet
    b.boxMM("steel", 13.1, 0, -37, 13.95, 0.95, -31, {
      tint: [0.6, 0.62, 0.62],
    });
    b.boxMM("paint_black", 13.2, 0.8, -36.6, 13.8, 0.94, -34.4, {
      tint: [0.1, 0.12, 0.12],
    });
    b.col(13.1, 0, -37, 14, 0.95, -31, { tag: "furniture", surface: "metal" });
    for (let k = 0; k < 10; k++)
      b.cyl("ceramic", 13.5, 0.95 + k * 0.025, -32.8, 0.14, 0.12, 0.02, 12);
    b.box("cloth_white", 13.9, 1.2, -30.2, 0.05, 0.9, 0.5, {
      tint: [0.8, 0.78, 0.7],
    });
    b.plate(
      "art",
      13.88,
      1.9,
      -33.6,
      -1,
      0,
      0.5,
      0.65,
      K.signCell("dm_walt_song", "WALT'S\nWASHING\nSONG\n(v.14)", 128, 160, {
        bg: "#e8e0c8",
        fg: "#2a2218",
        font: '"Comic Sans MS", Arial, sans-serif',
      }),
    );
    // the cold storage door (north-east)
    b.boxMM("steel", 10.6, 0, -39.95, 12.6, 2.4, -39.8, {
      tint: [0.72, 0.74, 0.76],
    });
    b.boxMM("steel", 12.2, 1.0, -39.8, 12.35, 1.4, -39.6, {
      tint: [0.5, 0.5, 0.52],
    });
    b.plate(
      "art",
      11.6,
      2.75,
      -39.8,
      0,
      1,
      1.6,
      0.4,
      K.signCell("dm_cold", "COLD STORAGE — STAFF ONLY", 384, 80, {
        bg: "#1e2a22",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
      { off: 0.01 },
    );
    for (const x of [3.5, 10.5])
      K.lamp(b, x, 3.9, -31, "tube", [0.95, 0.98, 1], 0.9, 8, {
        ceil: 4.2,
        len: 1.4,
        lightOpts: { box: KB },
      });

    // ================================================= CELLAR (y −5)
    // butchery
    const UX0 = -6,
      UX1 = 9,
      UZ0 = -52,
      UZ1 = -42,
      UH = 3.4;
    const UB = [
      UX0 - 0.2,
      CY - 0.2,
      UZ0 - 0.2,
      UX1 + 0.2,
      CY + UH + 0.2,
      UZ1 + 0.2,
    ];
    K.room(b, ctx, {
      x0: UX0,
      z0: UZ0,
      x1: UX1,
      z1: UZ1,
      y: CY,
      h: UH,
      floor: "tile",
      fc: [0.6, 0.6, 0.58],
      wall: "subway",
      wc: [0.75, 0.74, 0.68],
      ceil: "concrete_dark",
      cc: [0.35, 0.35, 0.34],
      surface: "concrete",
      trim: false,
    });
    b.hplate(
      "decal",
      1.5,
      CY + 0.012,
      -47,
      4.5,
      3.5,
      0.3,
      K.decal("blood", 90),
    );
    b.hplate("decal", -2.5, CY + 0.013, -45, 3, 2.5, 1.1, K.decal("blood", 91));
    b.cyl("black_iron", 1.5, CY + 0.005, -47, 0.25, 0.25, 0.02, 10);
    for (const [x, z] of [
      [-2.5, -47],
      [3.5, -45.5],
    ]) {
      b.box("wood", x, CY, z, 1.6, 0.9, 1.0, { tint: [0.5, 0.3, 0.22] });
      b.hplate(
        "decal",
        x,
        CY + 0.905,
        z,
        1.4,
        0.9,
        0.2,
        K.decal("blood", (92 + x) | 0),
      );
      b.col(x - 0.8, CY, z - 0.5, x + 0.8, CY + 0.9, z + 0.5, {
        tag: "furniture",
        surface: "wood",
      });
    }
    b.box("steel", -2.1, CY + 0.9, -47.1, 0.5, 0.02, 0.08, { yaw: 0.7 });
    b.box("wood_dark", -2.35, CY + 0.9, -46.85, 0.14, 0.04, 0.05, { yaw: 0.7 });
    // the hook rail with its burdens (shrouded shapes — the camera never lingers)
    b.pipe("steel", -5, CY + 3.0, -44, 8, CY + 3.0, -44, 0.04, 6);
    for (let k = 0; k < 7; k++) {
      const x = -4.2 + k * 1.8;
      b.pipe("steel", x, CY + 3.0, -44, x, CY + 2.5, -44, 0.01, 3);
      b.pipe("steel", x, CY + 2.5, -44, x + 0.08, CY + 2.3, -44, 0.012, 3);
      if (k % 3 === 2) continue;
      b.box("fabric", x, CY + 0.7, -44, 0.45, 1.6, 0.3, {
        yaw: r() * 0.4,
        tint: r.pick([
          [0.55, 0.45, 0.35],
          [0.5, 0.38, 0.3],
          [0.6, 0.5, 0.4],
        ]),
      });
      b.geo("fabric", K.sphereGeo(), {
        x,
        y: CY + 2.35,
        z: -44,
        sx: 0.2,
        sy: 0.18,
        sz: 0.18,
        tint: [0.5, 0.35, 0.28],
      });
      b.hplate(
        "decal",
        x,
        CY + 0.011 + k * 0.0003,
        -44,
        0.8,
        0.8,
        r() * 3,
        K.decal("blood", 100 + k),
      );
    }
    // bench with the tools, crates of shoes and spectacles, the specials board
    b.boxMM("wood", 7.7, CY, -51.8, 8.85, CY + 0.9, -48.6, {
      tint: [0.45, 0.32, 0.22],
    });
    b.col(7.7, CY, -51.8, 8.85, CY + 0.9, -48.6, {
      tag: "furniture",
      surface: "wood",
    });
    b.box("steel", 8.2, CY + 0.9, -50.9, 0.12, 0.02, 0.6, { yaw: 0.2 });
    b.box("rust", 8.3, CY + 0.9, -49.7, 0.04, 0.18, 0.5, { yaw: -0.3 });
    for (const [x, z] of [
      [-5.3, -50.8],
      [-5.3, -49.7],
    ]) {
      b.box("wood", x, CY, z, 0.9, 0.6, 0.9, { tint: [0.5, 0.4, 0.3] });
      for (let k = 0; k < 7; k++)
        b.box(
          "leather",
          x + (r() - 0.5) * 0.6,
          CY + 0.6,
          z + (r() - 0.5) * 0.6,
          0.12,
          0.1,
          0.28,
          {
            yaw: r() * 3,
            tint: r.pick([
              [0.3, 0.2, 0.12],
              [0.15, 0.12, 0.1],
              [0.45, 0.3, 0.18],
            ]),
          },
        );
      b.col(x - 0.45, CY, z - 0.45, x + 0.45, CY + 0.6, z + 0.45, {
        tag: "furniture",
      });
    }
    const specials = K.paint(
      "art",
      "dm_specials",
      256,
      192,
      function (x, X, Y, W, H) {
        x.fillStyle = "#23302a";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#6a4a2a";
        x.lineWidth = 8;
        x.strokeRect(X + 4, Y + 4, W - 8, H - 8);
        x.fillStyle = "rgba(235,235,225,0.9)";
        x.font = "bold 17px Georgia, serif";
        x.textAlign = "left";
        [
          "TONIGHT",
          "Colonel W. ..... rib",
          "The Judge ....... liver",
          "Mrs. V.D. ..... cheek",
          'Miss F. .......... "surprise me"',
          "NEXT: the dishwasher (Fri)",
        ].forEach((t, i) => x.fillText(t, X + 16, Y + 30 + i * 27, W - 30));
      },
    );
    b.plate("art", UX0 + 0.12, CY + 1.9, -46, 1, 0, 1.4, 1.05, specials, {
      off: 0.02,
    });
    b.plate(
      "art",
      3,
      CY + 1.9,
      UZ1 - 0.12,
      0,
      -1,
      1.6,
      0.5,
      K.signCell("dm_wash", "WASH YOUR HANDS", 256, 64, {
        bg: "#e8e0c8",
        fg: "#7a1a14",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    K.lamp(b, 0, CY + 2.9, -47, "bulb", [1, 0.9, 0.75], 0.9, 7, {
      ceil: CY + UH,
      lightOpts: { box: UB },
    });
    K.lamp(b, 6, CY + 2.9, -45, "tube", [0.85, 1, 0.9], 0.5, 6, {
      ceil: CY + UH,
      len: 1.2,
      lightOpts: { box: UB },
    });
    b.light(-4, CY + 1, -50, [0.9, 0.2, 0.15], 0.25, 4, { box: UB });
    // stair nook (arrival from the kitchen) — the stairs rise to a hatch in the kitchen floor
    K.room(b, ctx, {
      x0: 9,
      z0: -49,
      x1: 14,
      z1: -42,
      y: CY,
      h: 4.6,
      floor: "concrete",
      fc: [0.45, 0.44, 0.42],
      wall: "brick_red",
      wc: [0.55, 0.42, 0.36],
      ceil: "concrete_dark",
      cc: [0.3, 0.3, 0.3],
      surface: "concrete",
      trim: false,
      ceilCol: true,
    });
    K.stairs(b, 10.5, -47, 13, -43.6, CY, CY + 2.7, "+z", {
      mat: "wood",
      tint: [0.5, 0.38, 0.28],
      rail: "l",
      railMat: "black_iron",
      handMat: "wood_dark",
    });
    b.boxMM("wood", 10.5, CY, -43.6, 13, CY + 2.7, -42.1, {
      tint: [0.46, 0.35, 0.26],
      faces: "nsewt",
    }); // top landing
    b.col(10.5, CY, -43.6, 13, CY + 2.7, -42.1, {
      tag: "floor",
      surface: "wood",
    });
    // the trapdoor into the kitchen: closed, iron-banded, a short ladder up to it
    b.boxMM("wood", 10.8, CY + 4.5, -43.4, 12.7, CY + 4.6, -42.3, {
      tint: [0.4, 0.3, 0.22],
      faces: "b",
    });
    for (const zz of [-43.1, -42.6])
      b.beam(
        "black_iron",
        10.8,
        CY + 4.49,
        zz,
        12.7,
        CY + 4.49,
        zz,
        0.06,
        0.02,
      );
    for (let k = 0; k < 5; k++)
      b.beam(
        "wood_dark",
        11.3,
        CY + 2.95 + k * 0.33,
        -42.2,
        12.2,
        CY + 2.95 + k * 0.33,
        -42.2,
        0.05,
        0.05,
      );
    for (const lx of [11.3, 12.2])
      b.beam("wood_dark", lx, CY + 2.7, -42.2, lx, CY + 4.5, -42.2, 0.06, 0.06);
    K.lamp(b, 11.5, CY + 3.8, -47.5, "cage", [1, 0.85, 0.6], 0.6, 5, {
      ceil: CY + 5,
    });
    // freezer
    const FX0 = -6,
      FX1 = 3,
      FZ0 = -60,
      FZ1 = -52;
    const FRB = [
      FX0 - 0.2,
      CY - 0.2,
      FZ0 - 0.2,
      FX1 + 0.2,
      CY + 3.2,
      FZ1 + 0.2,
    ];
    K.room(b, ctx, {
      x0: FX0,
      z0: FZ0,
      x1: FX1,
      z1: FZ1,
      y: CY,
      h: 3.0,
      floor: "tile",
      fc: [0.62, 0.7, 0.78],
      wall: "steel",
      wc: [0.82, 0.92, 1.02],
      ceil: "steel",
      cc: [0.7, 0.8, 0.9],
      surface: "metal",
      trim: false,
    });
    // hanging sides (ox, officially): split halves on gambrel hooks — flat cut face, rib bones, fat cap, frost
    b.pipe("steel", -5.6, CY + 2.9, -55.5, 2.6, CY + 2.9, -55.5, 0.03, 5);
    b.pipe("steel", -5.6, CY + 2.9, -57.5, 2.6, CY + 2.9, -57.5, 0.03, 5);
    for (let k = 0; k < 6; k++) {
      const x = -5 + k * 1.4,
        z = k % 2 ? -57.5 : -55.5,
        yaw = (r() - 0.5) * 0.5,
        c = Math.cos(yaw),
        sn = Math.sin(yaw);
      b.pipe("steel", x, CY + 2.9, z, x, CY + 2.45, z, 0.012, 3);
      b.pipe("steel", x - 0.12, CY + 2.45, z, x + 0.12, CY + 2.45, z, 0.015, 3);
      // the half: a flattened, tapering mass (cut face toward local +z), a cream fat back, ribs across the cut face
      b.geo("meat", K.sphereGeo(), {
        x,
        y: CY + 1.62,
        z,
        sx: 0.3,
        sy: 0.78,
        sz: 0.1,
        ry: yaw,
        tint: [0.66, 0.24, 0.2],
      });
      b.geo("meat", K.sphereGeo(), {
        x,
        y: CY + 2.12,
        z,
        sx: 0.2,
        sy: 0.3,
        sz: 0.09,
        ry: yaw,
        tint: [0.6, 0.22, 0.19],
      });
      b.geo("cloth_white", K.sphereGeo(), {
        x: x - sn * 0.035,
        y: CY + 1.6,
        z: z - c * 0.035,
        sx: 0.31,
        sy: 0.76,
        sz: 0.085,
        ry: yaw,
        tint: [0.84, 0.76, 0.62],
      });
      for (let q = 0; q < 6; q++) {
        const yy = CY + 1.25 + q * 0.14;
        b.beam(
          "bone",
          x - 0.2 * c,
          yy,
          z + 0.2 * sn + 0.09 * c,
          x + 0.2 * c,
          yy - 0.05,
          z - 0.2 * sn + 0.09 * c,
          0.028,
          0.02,
          { tint: [0.92, 0.88, 0.8] },
        );
      }
      b.pipe("bone", x, CY + 2.35, z, x, CY + 2.62, z, 0.035, 5, {
        tint: [0.92, 0.88, 0.8],
      });
    }
    for (const [fx, fz] of [
      [-5.9, -56],
      [2.9, -57.5],
      [-2, -59.9],
    ])
      b.plate(
        "decal",
        fx,
        CY + 1.6,
        fz,
        fx < 0 ? 1 : fx > 2 ? -1 : 0,
        fz < -59 ? 1 : 0,
        1.8,
        1.6,
        K.decal("puddle", 130),
        { tint: [0.85, 0.95, 1.05], off: 0.02 },
      );
    for (let k = 0; k < 4; k++)
      b.glow(-4.5 + k * 2.2, CY + 0.35, -56.5, [0.2, 0.26, 0.3], 1.6); // cold fog pooling on the floor
    for (let k = 0; k < 4; k++)
      b.box("fabric", -4.5 + k * 1.6, CY, -59.3, 0.6, 0.3, 1.6, {
        yaw: 0.1 * k,
        tint: [0.2, 0.22, 0.25],
      }); // bags on the floor, don't look
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -5 + r() * 7,
        CY + 0.012 + k * 0.0003,
        -58 + r() * 5,
        1.2,
        1.2,
        r() * 3,
        K.decal("puddle", 110 + k),
        { tint: [0.8, 0.9, 1] },
      );
    b.light(-1.5, CY + 2.6, -56, [0.5, 0.72, 1.0], 1.2, 8, { box: FRB });
    b.light(-4.8, CY + 1.2, -58.8, [0.45, 0.65, 1.0], 0.5, 4, { box: FRB });
    b.plate("lamp", -1.5, CY + 2.98, -56, 0, 1, 1.2, 0.3, null, {
      tint: [0.6, 0.82, 1],
    });
    // the larder: three barred cells
    const LX0 = 3,
      LX1 = 14,
      LZ0 = -60,
      LZ1 = -52,
      CZ = -57;
    const LB = [LX0 - 0.2, CY - 0.2, LZ0 - 0.2, LX1 + 0.2, CY + 3.2, LZ1 + 0.2];
    K.room(b, ctx, {
      x0: LX0,
      z0: LZ0,
      x1: LX1,
      z1: LZ1,
      y: CY,
      h: 3.0,
      floor: "concrete",
      fc: [0.45, 0.43, 0.4],
      wall: "brick_red",
      wc: [0.5, 0.38, 0.32],
      ceil: "concrete_dark",
      cc: [0.3, 0.3, 0.3],
      surface: "concrete",
      trim: false,
    });
    for (const x of [7, 10.5]) {
      b.boxMM("brick_red", x - 0.1, CY, LZ0, x + 0.1, CY + 3, CZ, {
        tint: [0.5, 0.38, 0.32],
      });
      b.col(x - 0.1, CY, LZ0, x + 0.1, CY + 3, CZ, { tag: "wall" });
    }
    const cellBars = (x0, x1, skip0, skip1) => {
      for (let x = x0 + 0.1; x < x1; x += 0.14)
        if (!(x > skip0 && x < skip1))
          b.pipe("black_iron", x, CY, CZ, x, CY + 3, CZ, 0.018, 4);
      b.beam("black_iron", x0, CY + 1.2, CZ, x1, CY + 1.2, CZ, 0.04, 0.06);
    };
    cellBars(LX0, 7);
    b.col(LX0, CY, CZ - 0.06, 7, CY + 3, CZ + 0.06, { walkable: false });
    cellBars(7, 10.5, 8.1, 9.4);
    b.col(7, CY, CZ - 0.06, 8.1, CY + 3, CZ + 0.06, { walkable: false });
    b.col(9.4, CY, CZ - 0.06, 10.5, CY + 3, CZ + 0.06, { walkable: false });
    cellBars(10.5, LX1);
    b.col(10.5, CY, CZ - 0.06, LX1, CY + 3, CZ + 0.06, { walkable: false });
    // cell contents: bones (left), Walt's blanket & tally marks (middle), a skeleton (right)
    for (let k = 0; k < 9; k++)
      b.pipe(
        "bone",
        3.6 + r() * 2.8,
        CY + 0.03,
        -59.5 + r() * 2,
        3.6 + r() * 2.8,
        CY + 0.03,
        -59.5 + r() * 2,
        0.025,
        4,
        { tint: [0.85, 0.8, 0.66] },
      );
    b.box("fabric", 8.8, CY, -59.2, 1.2, 0.08, 1.8, {
      tint: [0.4, 0.35, 0.28],
    });
    b.plate(
      "decal",
      8.8,
      CY + 1.5,
      LZ0 + 0.12,
      0,
      1,
      1.0,
      0.5,
      K.tag("IIII IIII IIII", "#e8e0c8", 256, 96, { size: 0.5, rot: 0 }),
      { off: 0.02 },
    );
    // the scale they weigh him on
    b.boxMM("steel", 8.1, CY, -55.8, 9.3, CY + 0.12, -54.8, {
      tint: [0.55, 0.55, 0.55],
    });
    b.pipe("steel", 9.2, CY + 0.12, -54.9, 9.2, CY + 1.3, -54.9, 0.03, 5);
    b.cyl("ivory", 9.2, CY + 1.3, -54.9, 0.2, 0.2, 0.06, 14);
    b.plate(
      "art",
      9.2,
      CY + 1.9,
      LZ1 - 0.12,
      0,
      -1,
      1.4,
      0.45,
      K.signCell("dm_larder", "LARDER", 256, 64, {
        bg: "#1e2a22",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    b.boxMM(
      "black_iron",
      LX1 - 0.15,
      CY + 0.5,
      -54.1,
      LX1 - 0.1,
      CY + 1.7,
      -52.7,
      { tint: [0.2, 0.2, 0.2] },
    );
    b.quadN(
      "wood_rotten",
      [LX1 - 0.12, CY, -54.2],
      [LX1 - 0.12, CY, -52.6],
      [LX1 - 0.9, CY + 0.5, -52.6],
      [LX1 - 0.9, CY + 0.5, -54.2],
      [-0.5, 1, 0],
      { tint: [0.3, 0.26, 0.22] },
    );
    for (let k = 0; k < 9; k++)
      b.geo("paint_black", K.sphereGeo(), {
        x: LX1 - 0.4 - r() * 0.9,
        y: CY + 0.05,
        z: -54 + r() * 1.3,
        sx: 0.08 + r() * 0.06,
        sy: 0.05,
        sz: 0.07,
        tint: [0.08, 0.08, 0.08],
      });
    b.plate(
      "art",
      LX1 - 0.12,
      CY + 2.1,
      -53.4,
      -1,
      0,
      0.9,
      0.3,
      K.signCell("dm_coal", "COAL", 128, 44, {
        bg: "#2a2622",
        fg: "#d8c8a0",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    K.lamp(b, 8.5, CY + 2.6, -54.5, "bulb", [1, 0.85, 0.6], 0.7, 7, {
      ceil: CY + 3,
      lightOpts: { box: LB },
    });
    b.light(8.8, CY + 1.5, -58.5, [0.9, 0.7, 0.45], 0.3, 4, { box: LB });

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_delmonicos_int";

    // ---- Walt's cell door: separate mesh + collider, opened by lock / key ----
    const cb = K.builder({
      name: "dm_cell",
      off: O,
      lit: true,
      amb: [0.3, 0.25, 0.2],
      floors: [CY],
    });
    for (let x = 8.18; x < 9.4; x += 0.14)
      cb.pipe(
        "black_iron",
        x,
        CY + 0.02,
        CZ + 0.05,
        x,
        CY + 2.9,
        CZ + 0.05,
        0.018,
        4,
      );
    cb.beam(
      "black_iron",
      8.1,
      CY + 1.2,
      CZ + 0.05,
      9.4,
      CY + 1.2,
      CZ + 0.05,
      0.04,
      0.06,
    );
    cb.beam(
      "black_iron",
      8.1,
      CY + 2.9,
      CZ + 0.05,
      9.4,
      CY + 2.9,
      CZ + 0.05,
      0.04,
      0.06,
    );
    cb.box("steel", 9.25, CY + 1.05, CZ + 0.12, 0.14, 0.26, 0.1, {
      tint: [0.4, 0.4, 0.4],
    });
    ctx.cellDoor = cb.finish(null);
    ctx.intRoot.add(ctx.cellDoor);
    ctx.cellCol = null;
    const setCell = (closed) => {
      if (closed && !ctx.cellCol)
        ctx.cellCol = G.world.addBox(
          O.x + 8.1,
          O.y + CY,
          O.z + CZ - 0.06,
          O.x + 9.4,
          O.y + CY + 3,
          O.z + CZ + 0.08,
          { tag: "poi_fidi3", surface: "metal", walkable: false },
        );
      if (!closed && ctx.cellCol) {
        K.safe("cellcol", () => G.world.removeCollider(ctx.cellCol));
        ctx.cellCol = null;
      }
      ctx.cellDoor.visible = closed;
    };
    ctx.setCell = setCell;
    setCell(true);

    // ================================================= doors, interactables, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const DM = PV.dm;
    K.door(ctx, {
      id: "pf3_dm_in",
      pos: DM.door.clone(),
      label: "Delmonico's",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("delmonicos")),
    });
    {
      const p = DM.arcP(DM.DA, DM.AC.r + 2.4);
      K.door(ctx, {
        id: "pf3_dm_out",
        pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.35),
        label: "Beaver Street",
        verb: "Leave",
        target: { x: p[0], y: 0.51, z: p[1], yaw: PI / 4 },
      });
    }
    K.door(ctx, {
      id: "pf3_dm_cold",
      pos: new THREE.Vector3(OX + 11.6, OY + 1.3, OZ - 39.5),
      label: "Cold Storage",
      verb: "Open",
      lock: DM_LOCKS.cold,
      sound: "door_open",
      target: { x: OX + 11.75, y: OY + CY + 2.7, z: OZ - 42.9, yaw: 0 },
      onEnter: () => {
        PV.setFlag("dm_seen_larder", true);
        const q = K.q;
        if (
          q.active("pf3_taste") &&
          (q.stage("pf3_taste") === "find" || q.stage("pf3_taste") === "cellar")
        )
          q.set("pf3_taste", "free");
      },
    });
    K.door(ctx, {
      id: "pf3_dm_cold_up",
      pos: new THREE.Vector3(OX + 11.75, OY + CY + 2.7 + 1.3, OZ - 42.5),
      radius: 1.1,
      label: "Trapdoor — Kitchen",
      verb: "Climb",
      sound: "door_open",
      target: { x: OX + 11.6, y: OY, z: OZ - 38.6, yaw: PI },
    });
    // one-way coal chute: larder → the staff entrance on the east side (bolted on the street side until opened)
    {
      const X1 = PV.dm.X1;
      K.oneWay(ctx, {
        flag: "dm_chute",
        open: {
          pos: new THREE.Vector3(OX + 13.6, OY + CY + 1.1, OZ - 53.4),
          label: "Coal Chute — Staff Entrance",
          verb: "Climb",
          target: { x: X1 + 1.4, y: 0, z: 876.7, yaw: -HP },
          msg: "You kick the chute hatch open onto the street by the staff entrance.",
        },
        barred: {
          pos: new THREE.Vector3(X1 + 0.3, 1.2, 876.7),
          label: "Staff Entrance",
          verb: "Open",
          target: { x: OX + 12.8, y: OY + CY, z: OZ - 53.4, yaw: HP },
          msg: "The staff door is bolted from the inside. Nobody answers the bell.",
        },
      });
    }
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX + 8.75, OY + CY + 1.2, OZ + CZ + 0.15),
        radius: 0.7,
        label: "Larder Cage",
        verb: "Unlock",
        priority: 1,
        enabled: () => !PV.flag("dm_cage_open"),
        onInteract: () => {
          const at = new THREE.Vector3(OX + 8.75, OY + CY + 1.2, OZ + CZ);
          const open = (withKey) => {
            PV.setFlag("dm_cage_open", true);
            setCell(false);
            K.sfx(withKey ? "door_open" : "keypad_accept", at);
            K.notify(
              withKey
                ? "The cold-storage key fits the cage lock."
                : "The dial clicks round to the last number. The padlock drops open.",
            );
            if (K.q.active("pf3_taste") && K.q.stage("pf3_taste") !== "return")
              K.q.set("pf3_taste", "free");
          };
          // the cold-storage key fits; otherwise the padlock's dial takes the combination Walt watched Hock use
          K.lockOpen(DM_LOCKS.cage, () => open(K.has("pf3_dm_key")));
        },
      }),
    );
    const A = (n, x, y, z, yaw) => {
      const a = K.anchor(ctx, n, x, y, z);
      a.yaw = yaw;
      return a;
    };
    A("entrance", 0, 0, -1.6, 0);
    A("maitre", -2.9, 0, -4.2, -HP);
    A("merchant", -2.9, 0, -4.2, -HP);
    A("chef", 6, 0, -31.8, 0);
    A("hock", 0.5, CY, -48.5, 0);
    A("walt", 8.8, CY, -58.4, PI);
    A("waiter", -3.2, 0, -13.5, 0);
    A("coldstore", 11.6, 0, -39, 0);
    A("diner1", -8, 0, -8.95, 0);
    A("diner2", 1.6, 0, -15.55, 0);
    A("diner3", -8, 0, -21.95, 0);
    A("diner4", -3.2, 0, -21.95, 0);
    A("diner5", 1.6, 0, -8.95, 0);
    for (let i = 1; i <= 5; i++)
      A(
        "npc" + i,
        ctx.anchors["diner" + i].x - OX,
        0,
        ctx.anchors["diner" + i].z - OZ,
        0,
      );
    [
      [-5.5, 0, -13.5],
      [4, 0, -20],
      [-6, 0, -26],
      [6.5, 0, -12],
      [7, 0, -36.5],
      [-17, 0, -10.2],
    ].forEach((p, i) => A("spawn" + (i + 1), p[0], p[1], p[2], 0));
    A("loot1", -20.5, 0, -24.3, 0);
    A("loot2", 8.25, CY, -50.2, 0);

    // ---- containers, terminals, notes ----
    K.loot(ctx, "cash_register", 9.2, 1.16, -13, HP, {
      loot: "cash_register",
      name: "Bar Till",
      owner: "settlers",
    });
    K.loot(ctx, "fridge", 1.2, 0, -28.6, PI, {
      loot: "fridge",
      name: "Kitchen Icebox",
      owner: "settlers",
    });
    K.loot(ctx, "safe", -21.8, 1.3, -11, HP, {
      wall: true,
      loot: "wall_safe",
      lock: DM_LOCKS.strongbox,
      name: "Society Strongbox",
      owner: "settlers",
      items: [["pf3_dm_ring", 1]],
    });
    K.loot(ctx, "footlocker", 11.4, CY, -52.5, PI, {
      loot: "footlocker",
      name: "Personal Effects (Staff)",
    });
    K.loot(ctx, "crate", 1.5, CY, -59.4, 0, {
      kind: "plain",
      loot: "food_oldworld",
      name: "Freezer Crate",
    });
    K.loot(ctx, "toolbox", 8.25, CY + 0.9, -49.2, HP, {
      loot: "toolbox",
      name: "Butcher's Tools",
    });
    K.skel(ctx, 12.6, CY, -59, 2.2, "curled");
    K.terminal(
      ctx,
      "pf3_term_dm_rolls",
      -20.8,
      0,
      -23.6,
      HP,
      termRolls(),
      "own_desk",
    );
    K.note(ctx, "pf3_note_receipts", -17.9, 0.82, -12.4, {
      name: "The Book of Receipts (Delmonico's, private)",
      title: "The Book of Receipts — Gilded Fork Society",
      text: 'LONG PIG WELLINGTON (serves 12)\nOne dishwasher, well rested. Rest him longer.\nDuxelles of glowing fungus, reduced with the last of the Madeira. Pastry as for the Beef.\n\nNOTE (in a different hand): Bastien — the Colonel says the portions have grown "stringy" since we began recruiting from the docks. Advertise for porters. Porters are better marbled.\n\nNOTE (Lorenzo): We do not "recruit." We HIRE. We are not animals.\n\n(Pencilled at the foot of the page: Rolls teletype — PORTERHOUSE. Bastien\'s idea. Bastien thinks he is funny.)',
      learn: DM_LOCKS.rolls.id,
    });
    K.note(ctx, "pf3_note_menu", -8.3, 0.77, -9.8, {
      name: "Menu Card — Delmonico's",
      title: "DELMONICO'S · Established 1837",
      text: 'TO BEGIN\n  Oysters Rockefeller (shellback)\n  Eggs Benedict\n\nFROM THE GRILL\n  The Delmonico Steak\n  Lobster Newberg (as invented here, 1876)\n\nTO FINISH\n  Baked Alaska, flambéed tableside\n\nCHEF\'S RESERVE — MEMBERS ONLY\n  "The Stranger" · market price\n\nOMNES EDUNT',
    });
    K.note(ctx, "pf3_reel_walt", 13.6, 0.97, -36.2, {
      type: "tape",
      name: "Tape reel: Walt's Washing Song",
      title: "Recorded on a kitchen radio",
      learn: DM_LOCKS.cold.id,
      text: "[Running water. A big, cheerful, very bad baritone.]\n\nOh the plates come in and the plates go out,\nand the gravy's thick and the Colonel's stout,\nand I wash and I wash till my hands are raw,\nfor the finest folk that Manhattan saw —\n\n[The singing stops.]\n\nWALT: Hey, Chef? What's the cold-room combination again?\n\nCHEF ANTON (distant): One-eight-seven-six. The year this house invented the Newberg. If you cannot remember that, you should not be in my kitchen.\n\nWALT: Right. Like the menu. — Hey, Chef? Where'd Hector go? He left his hat.\n\n[A long pause.]\n\nCHEF ANTON (distant): Resigned.\n\nWALT: ...Huh.\n\n[The water keeps running. The singing doesn't start again.]",
    });
  };

  function termRolls() {
    return {
      title: "THE GILDED FORK SOCIETY",
      header:
        "KESTREL TELETYPE — PRIVATE\nMEMBERSHIP ROLLS & MINUTES · DELMONICO'S, 56 BEAVER STREET",
      lock: DM_LOCKS.rolls,
      entries: [
        {
          title: "Membership Rolls",
          text: 'ACTIVE: Mrs. C. Van Duyn · The Hon. Judge R. Halvorsen · Col. A. Whitcombe (ret.) · Miss P. Fenwick · Mr. T. Astor-Pryce · L. Delmonico VII (Host) · A. Mercier (Chef)\n\nLAPSED (DECEASED): 19\nLAPSED (CONSUMED): 4\n\nTo be "lapsed (consumed)" is the highest honour the Society can bestow. It has not, historically, been sought.',
        },
        {
          title: "Minutes — The Resolution of '68",
          text: 'With the collapse of the beef supply and the Society\'s refusal to eat "giant roach, rat, or anything that crawls," the Chair moved that the Society adopt the old sailors\' custom, strictly among ourselves.\n\nAMENDMENT (Col. Whitcombe): "Among ourselves" to be read as "among whomever answers the advertisement."\n\nCARRIED, 6 to 1. Mr. Delmonico abstained. Mr. Delmonico always abstains, and always eats.',
        },
        {
          title: "Minutes — Recent",
          text: 'The Chef reports the dishwasher (T.) is "coming along nicely." The Colonel requests the rib. Miss Fenwick requests that the dishwasher stop singing; it upsets her digestion.\n\nThe Host reports a woman at the door asking after her husband. She was not admitted. She was, the Host notes, "rather lean."\n\nThe Treasurer reports that the Society strongbox has been reset to 7-4-1-9 following the incident with Miss Fenwick\'s nephew. Members are asked to commit it to memory and to stop writing it on napkins.',
          learn: DM_LOCKS.strongbox.id,
        },
      ],
    };
  }

  PV.dmUpdate = function (dt, realDt, ctx) {
    // keep the cage state in sync after loads / resets
    if (ctx.setCell) {
      const open = !!PV.flag("dm_cage_open");
      if (ctx.cellDoor && ctx.cellDoor.visible === open) ctx.setCell(!open);
    }
  };
})();
