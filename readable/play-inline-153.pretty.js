/* src/poi_uptown/20_dakota_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 20 The Dakota — interior
 *
 * INTERIOR (cell 'dakota', origin 5000,0,400): the north-west stair hall
 *   (a U-stair round an open well from the basement to the 3rd floor)
 *   with corridors and apartments on every level:
 *     basement  boiler room ("The Superintendent", a Maniac), super's office
 *               (terminal + the Hollis key), storage cages
 *     ground    concierge & mail room, residents' lounge, dining hall
 *     2nd floor two ransacked apartments (Maniacs, a dinner party that
 *               never ended)
 *     3rd floor Mrs. Agnes Hollister's candle-lit apartment (friendly
 *               old resident, quest giver) and the SEALED Hollis apartment:
 *               parlour, the nursery (crib, rocking chair, "Nanny").
 * EXTERIOR: see 20_dakota.js (its builder calls P.interiorBuilders.dakota below).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu,
    D = P.dress;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  // ===================================================================
  // INTERIOR
  // ===================================================================
  const FLOOR_Y = 5; // basement at local -4.5 must stay above the cell terrain (y 0)
  function buildInterior() {
    const O = P.I("dakota");
    const S = P.site("dakota_int", {
      ox: O.x,
      oy: O.y + FLOOR_Y,
      oz: O.z,
      lit: true,
      ambient: 0x6a6458,
      ambI: 0.34,
      interiorKey: "dakota",
    });
    const b = S.b;
    const LV = [-4.5, 0, 4.5, 9];
    const HX0 = -4.5,
      HX1 = 4.5,
      HZ0 = -4.7,
      HZ1 = 7; // stair hall
    const TOP = 13.5;
    // ---------------- stair hall ----------------
    S.wallZ(
      "wood_oak",
      HX0,
      HZ0,
      HZ1,
      LV[0],
      TOP,
      0.3,
      LV.map((y) => [3.6, 6.4, y - LV[0], y - LV[0] + 2.7]),
    );
    S.wallZ(
      "wood_oak",
      HX1,
      HZ0,
      HZ1,
      LV[0],
      TOP,
      0.3,
      LV.map((y) => [3.6, 6.4, y - LV[0], y - LV[0] + 2.7]),
    );
    S.wallX("wood_oak", HZ0, HX0 - 0.15, HX1 + 0.15, LV[0], TOP, 0.3, []);
    S.wallX("wood_oak", HZ1, HX0 - 0.15, HX1 + 0.15, LV[0], TOP, 0.3, [
      [-1.1, 1.1, 4.5, 4.5 + 2.8],
    ]);
    // wainscot + damask upper walls inside the hall
    for (const x of [HX0 + 0.16, HX1 - 0.16])
      for (const y of LV)
        b.box("damask", x - 0.01, y + 1.3, HZ0, x + 0.01, y + 4.1, HZ1, {
          segLen: 2,
        });
    // skylight at the top of the well
    S.ceil("plaster_cream", HX0, HZ0, HX1, HZ1, TOP, {});
    b.box("stained", -2.2, TOP - 0.02, -1.4, 2.2, TOP - 0.01, 1.6, {
      seg: false,
    });
    S.light(0, TOP - 1, 0, 0xc8d0e0, 20, 1.3);
    for (const y of LV) {
      S.light(0, y + 2.5, 4.5, 0xffd8a0, 7, 0.6);
      if (y > 0) {
        b.cyl("gold", 0, y + 3.7, 4.5, 0.02, 0.02, 0.6, 4);
        b.sphere("lamp_dim", 0, y + 3.55, 4.5, 0.22, { ws: 10, hs: 8 });
        S.glow(0, y + 3.55, 4.5, 0xffd8a0, 0.5);
      }
    }
    // floor strips per level + the stair zone
    for (const y of LV) {
      S.floor(y < 0 ? "concrete" : "parquet", HX0, 1.5, HX1, HZ1, y, {
        t: 0.3,
        surface: "wood",
      });
      S.rail(
        "iron",
        [
          [-2.0, 1.5],
          [2.0, 1.5],
        ],
        y,
        1.0,
        { r: 0.035, step: 0.14 },
      );
    }
    for (let i = 0; i < 3; i++) {
      const L = LV[i];
      // flight A (east, north-bound) L → L+2.25
      S.stairs("wood_dark", 3.15, 1.5, "n", 2.3, L, L + 2.25, {
        run: 0.3,
        nosing: "marble",
        rail: "iron",
        railSides: [-1],
      });
      // mid landing
      S.floor("parquet", HX0 + 0.15, HZ0 + 0.15, HX1 - 0.15, -1.2, L + 2.25, {
        t: 0.25,
        surface: "wood",
      });
      S.rail(
        "iron",
        [
          [-2.0, -1.2],
          [2.0, -1.2],
        ],
        L + 2.25,
        1.0,
        { r: 0.035, step: 0.14 },
      );
      // flight B (west, south-bound) L+2.25 → L+4.5
      S.stairs("wood_dark", -3.15, -1.2, "s", 2.3, L + 2.25, L + 4.5, {
        run: 0.3,
        nosing: "marble",
        rail: "iron",
        railSides: [1],
      });
      D.sconce(S, HX1 - 0.16, L + 3.6, -3, -HP, {
        r: 6,
        i: i === 2 ? 0 : 0.8,
        dark: i === 2,
      });
      D.sconce(S, HX0 + 0.16, L + 3.6, -3, HP, { r: 6, i: 0.6 });
    }
    // newel post lamp at the bottom of the ground flight
    b.cyl("gold", 2.0, 0, 1.6, 0.08, 0.1, 1.2, 8);
    b.sphere("lamp_dim", 2.0, 1.35, 1.6, 0.18, { ws: 8, hs: 6 });
    S.light(2.0, 1.5, 1.6, 0xffd090, 5, 0.6);
    S.glow(2.0, 1.35, 1.6, 0xffd090, 0.4);
    S.anchor("stair_hall", 0, 0, 4.5, 0);

    // ---------------- vestibule (ground, to the courtyard) ----------------
    S.room({
      x0: -3,
      z0: HZ1,
      x1: 3,
      z1: 12,
      y: 0,
      h: 4.2,
      wall: "marble",
      floor: "marble",
      ceil: "plaster_cream",
      skip: "n",
      trim: "wood_dark",
    });
    b.box("wood_dark", -0.9, 0, 11.8, 0.9, 2.8, 11.85, { seg: false });
    b.box("glass_dark", -0.6, 1.4, 11.78, 0.6, 2.5, 11.8, { seg: false });
    D.exitDoor(S, 0, 0, 11.78, PI, {
      noLeaves: true,
      frame: "wood_dark",
      w: 1.8,
      h: 2.8,
      text: "EXIT",
      sub: "COURTYARD",
    });
    D.sconce(S, -2.85, 2.4, 9.5, HP, { r: 4, i: 0.5 });
    D.sconce(S, 2.85, 2.4, 9.5, -HP, { r: 4, i: 0.5 });
    const dirB = P.texMat(
      "dak_dir",
      P.signTex(
        "dak_dir",
        [
          "RESIDENTS",
          "2 · Van Rensselaer · Pell",
          "3 · Hollister · Hollis",
          "B · Superintendent",
        ],
        "gilt",
        512,
        360,
      ),
      { rough: 0.5 },
    );
    b.quad(dirB, 2.84, 1.8, 8.8, 1.1, 0.77, { ry: -HP });
    S.anchor("entrance", 0, 0, 10, 0);

    // ---------------- corridors per level ----------------
    const CZA = 3.2,
      CZB = 6.8;
    for (const y of LV) {
      const top = y === LV[0] ? 3.8 : 4.2;
      for (const [x0, x1] of [
        [-26, HX0],
        [HX1, 26],
      ]) {
        S.floor(y < 0 ? "concrete" : "carpet_red", x0, CZA, x1, CZB, y, {
          t: 0.3,
          surface: y < 0 ? "concrete" : "carpet",
        });
        S.ceil(y < 0 ? "concrete" : "plaster_cream", x0, CZA, x1, CZB, y + top);
        S.wallZ(
          y < 0 ? "concrete" : "damask",
          x0 < 0 ? x0 : x1,
          CZA,
          CZB,
          y,
          y + top,
          0.3,
          [],
        );
      }
    }
    // ---------------- apartments / rooms ----------------
    const W = (y) => (y < 0 ? "concrete" : "damask");
    // BASEMENT (y -4.5)
    {
      const y = LV[0];
      b.ground = y;
      S.wallX("concrete", CZA, -26, HX0, y, y + 3.8, 0.3, [
        [-12, -10.5, 0, 2.3],
      ]);
      S.wallX("concrete", CZB, -26, HX0, y, y + 3.8, 0.3, [
        [-15, -13.5, 0, 2.3],
      ]);
      S.wallX("concrete", CZA, HX1, 26, y, y + 3.8, 0.3, [[10, 12, 0, 2.3]]);
      S.wallX("concrete", CZB, HX1, 26, y, y + 3.8, 0.3, [[16, 18, 0, 2.3]]);
      // super's office (NW)
      S.room({
        x0: -18,
        z0: -8,
        x1: HX0,
        z1: CZA,
        y,
        h: 3.8,
        wall: "plaster_green",
        floor: "tile",
        ceil: "concrete",
        skip: "se",
      });
      S.prop("desk", -13, y, -6.9, PI, {
        loot: "desk",
        name: "Superintendent's Desk",
        items: [
          ["pu_key_hollis", 1],
          ["scrip", 18],
        ],
      });
      S.anchor("super_office", -13, y, -5.4, PI); // quest marker (round 1b: the marker pointed at the boiler room, 16 m away)
      S.prop("terminal", -12.4, y + 0.78, -7.1, PI, {
        terminalId: "pu_dakota_super",
        mount: "bare",
      });
      S.prop("file_cabinet", -17.4, y, -5, HP, { loot: "file_cabinet" });
      S.prop("locker", -6, y, -7.5, PI, { loot: "locker" });
      b.box("wood", -17.9, y + 1.0, -2, -17.8, y + 2.2, 1.5, { seg: false });
      for (let k = 0; k < 12; k++)
        b.box(
          "gold",
          -17.78,
          y + 1.1 + (k % 4) * 0.28,
          -1.8 + Math.floor(k / 4) * 1.1,
          -17.74,
          y + 1.25 + (k % 4) * 0.28,
          -1.7 + Math.floor(k / 4) * 1.1,
          { seg: false },
        );
      D.label(
        b,
        "keyboard",
        ["KEY BOARD", "Sign out keys with Mr. Ruiz", "NO EXCEPTIONS"],
        -17.75,
        y + 2.5,
        -0.3,
        1.2,
        0.35,
        HP,
        "label",
      );
      b.box("lamp", -12.8, y + 3.6, -3, -11.2, y + 3.65, -2.8, { seg: false });
      S.light(-12, y + 3, -3, 0xd8f0d0, 8, 0.8);
      S.pickup("pu_note_super", 1, -12.8, y + 0.8, -6.6);
      // boiler room (SW) — the Superintendent's lair
      S.room({
        x0: -26,
        z0: CZB,
        x1: HX0,
        z1: 20,
        y,
        h: 4.4,
        wall: "brick_red",
        floor: "concrete",
        ceil: "concrete",
        skip: "ne",
      });
      for (const bx of [-20, -12]) {
        b.cyl("rust", bx, y + 0.5, 14, 1.4, 1.4, 5.5, 14, { rx: HP });
        b.box("brick_red", bx - 1.6, y, 11, bx + 1.6, y + 0.5, 17, {
          seg: false,
        });
        b.box("iron", bx - 0.5, y + 0.9, 16.7, bx + 0.5, y + 1.6, 16.9, {
          seg: false,
        });
        S.col(bx - 1.6, y, 11, bx + 1.6, y + 3.4, 17, { walkable: false });
        b.rod("rust", [bx, y + 2.9, 12], [bx, y + 4.4, 12], 0.3, 8);
      }
      for (let k = 0; k < 4; k++)
        b.rod(
          "rust",
          [-25.8, y + 3.6 - k * 0.3, 8],
          [HX0 - 0.2, y + 3.6 - k * 0.3, 8],
          0.08,
          6,
        );
      b.cyl("fire", -20, y + 0.9, 17.0, 0.25, 0.3, 0.3, 6);
      S.light(-20, y + 1.2, 17.5, 0xff7a30, 8, 1.0);
      S.glow(-20, y + 1.1, 17.2, 0xff7a30, 0.9);
      S.light(-16, y + 2, 12, 0x60ff60, 9, 0.6);
      // second firebox, a green puddle of boiler leak and a caged work lamp so the lair reads in the dark
      b.cyl("fire", -12, y + 0.9, 17.0, 0.22, 0.28, 0.25, 6);
      S.light(-12, y + 1.2, 17.6, 0xff7a30, 7, 0.9);
      S.glow(-12, y + 1.0, 17.2, 0xff7a30, 0.7);
      b.cyl("slime", -16, y + 0.01, 9.5, 2.2, 2.4, 0.03, 14, { sx: 1.3 });
      S.glow(-16, y + 0.2, 9.5, 0x60ff60, 1.4);
      b.box("iron", -25.8, y + 2.8, 11.6, -25.6, y + 3.3, 12.4, { seg: false });
      b.sphere("lamp", -25.5, y + 3.0, 12, 0.14, { ws: 8, hs: 6 });
      S.light(-24.8, y + 2.9, 12, 0xffd8a0, 9, 0.8);
      G.world.addRadSource({
        x: S.ox - 16,
        y: S.oy + y,
        z: S.oz + 13,
        radius: 6,
        strength: 2.0,
      });
      D.rubble(S, -8, y, 17, 1.6, { n: 8 });
      S.prop("skeleton", -9, y, 12, 1.2, { pose: "curled" });
      S.prop("toolbox", -25.3, y, 18, HP, { loot: "toolbox" });
      S.anchor("boss", -14, y, 9.5, HP);
      S.anchor("boiler", -16, y, 9, 0);
      // storage cages (east)
      S.room({
        x0: HX1,
        z0: -8,
        x1: 26,
        z1: CZA,
        y,
        h: 3.8,
        wall: "concrete",
        floor: "concrete",
        ceil: "concrete",
        skip: "sw",
      });
      S.room({
        x0: HX1,
        z0: CZB,
        x1: 26,
        z1: 20,
        y,
        h: 3.8,
        wall: "concrete",
        floor: "concrete",
        ceil: "concrete",
        skip: "nw",
      });
      for (let x = 7; x < 25; x += 4) {
        for (const [z0, z1] of [
          [-7.8, -1],
          [9, 19.8],
        ]) {
          const zc = z0 < 0 ? -1 : 9;
          for (let zz = z0; zz <= z1 + 0.01; zz += 0.25)
            b.rod("iron", [x, y, zz], [x, y + 2.6, zz], 0.012, 3);
          for (let xx = x; xx <= x + 4; xx += 0.25)
            if (xx < x + 1.4 || xx > x + 2.6)
              b.rod("iron", [xx, y, zc], [xx, y + 2.6, zc], 0.012, 3);
          S.col(x - 0.05, y, z0, x + 0.05, y + 2.6, z1, { walkable: false });
        }
      }
      S.prop("footlocker", 9, y, -6, 0, {
        loot: "footlocker",
        name: "Storage 2B",
      });
      S.prop("crate", 13, y, -5, 0.4, { kind: "plain", loot: "crate" });
      S.prop("duffle_bag", 17, y, 17, 1.4, { loot: "duffle_bag" });
      S.prop("crate", 21, y, 12, 0.1, { kind: "plain", loot: "crate" });
      b.box("lamp", 14, y + 3.6, 5, 16, y + 3.65, 5.2, { seg: false });
      S.light(15, y + 3, 5, 0xd8f0d0, 8, 0.6);
      S.light(12, y + 3, -4, 0xd8f0d0, 7, 0.4);
      S.light(15, y + 3, 14, 0xd8f0d0, 8, 0.4);
      S.anchor("spawn4", 15, y, 5, 0);
      S.anchor("storage", 15, y, 12, 0);
    }
    // GROUND (y 0)
    {
      const y = LV[1];
      b.ground = y;
      S.wallX("damask", CZA, -26, HX0, y, y + 4.2, 0.3, [[-12, -10, 0, 2.5]]);
      S.wallX("damask", CZB, -26, HX0, y, y + 4.2, 0.3, [[-16, -12, 0, 2.6]]);
      S.wallX("damask", CZA, HX1, 26, y, y + 4.2, 0.3, [[10, 12, 0, 2.5]]);
      S.wallX("damask", CZB, HX1, 26, y, y + 4.2, 0.3, [[12, 16, 0, 2.6]]);
      // concierge & mail room (NW)
      S.room({
        x0: -18,
        z0: -8,
        x1: HX0,
        z1: CZA,
        y,
        h: 4.2,
        wall: "wood_oak",
        floor: "marble",
        ceil: "plaster_cream",
        skip: "se",
        trim: "gold",
      });
      b.box("wood_oak", -16, y, -2, -8, y + 1.1, -1.2, { segLen: 2 });
      b.box("marble_dark", -16.1, y + 1.1, -2.1, -7.9, y + 1.17, -1.1, {
        seg: false,
      });
      S.col(-16.1, y, -2.1, -7.9, y + 1.17, -1.1, { walkable: false });
      for (let i = 0; i < 40; i++) {
        const cx = -17.4 + (i % 10) * 0.32,
          cy = y + 1.2 + Math.floor(i / 10) * 0.36;
        b.box(
          i % 7 === 3 ? "glass_dark" : "bronze",
          cx - 0.14,
          cy,
          -7.84,
          cx + 0.14,
          cy + 0.32,
          -7.8,
          { seg: false },
        );
      }
      D.label(
        b,
        "mail",
        ["MAIL", "Residents only", "Undeliverable: return to sender"],
        -15.8,
        y + 2.9,
        -7.8,
        1.3,
        0.38,
        0,
        "label",
      );
      S.prop("mailbox", -9, y, -7.3, 0, { loot: "mailbox" });
      S.prop("cash_register", -9, y + 1.17, -1.6, 0, {
        loot: "cash_register",
        name: "Concierge Till",
      });
      S.prop("skeleton", -12, y, -3.2, 0.2, { pose: "sitting" });
      D.chandelier(S, -11, y + 3.9, -2.5, 0.55, { tiers: 2, lr: 7, li: 0.6 });
      S.pickup("pu_note_concierge", 1, -13.5, y + 1.18, -1.6);
      // residents' lounge (SW)
      S.room({
        x0: -26,
        z0: CZB,
        x1: HX0,
        z1: 20,
        y,
        h: 4.2,
        wall: "damask",
        floor: "parquet",
        ceil: "plaster_cream",
        skip: "ne",
        trim: "wood_dark",
        surface: "wood",
      });
      D.rug(b, -22, 9, -9, 18, y + 0.01);
      D.fireplace(b, S, -25.85, y, 14, HP, { lit: false, key: "marble_dark" });
      D.sofa(b, -20, y, 14, -HP, {});
      D.sofa(b, -15, y, 10.5, 0, { fabric: "fabric" });
      D.chair(b, -16, y, 17, PI + 0.3, { arms: true });
      D.chair(b, -13, y, 15, -1.8, { toppled: true });
      D.table(b, -16.5, y, 14, { r: 0.6, top: "wood_dark", leg: "wood_dark" });
      D.piano(b, -9, y, 17.5, PI + 0.4, { key: "wood_dark", lidOpen: false });
      D.bookcase(b, -20, y, 19.75, PI, { w: 2.4 });
      D.bookcase(b, -16.8, y, 19.75, PI, { w: 2.4, empty: 0.5 });
      D.painting(b, -25.83, y + 2.3, 9.5, 1.4, 1.0, HP, 1);
      D.painting(b, -12, y + 2.4, 19.83, 1.8, 1.1, PI, 0);
      D.chandelier(S, -16, y + 4.0, 13.5, 0.8, {
        tiers: 2,
        lr: 9,
        li: 0.55,
        broken: true,
      });
      S.prop("radio", -16.5, y + 0.76, 14.2, 0.5, { station: "classical" });
      S.anchor("lounge", -16, y, 12, 0);
      S.anchor("spawn1", -14, y, 12, 0);
      // dining hall (east) and the pantry
      S.room({
        x0: HX1,
        z0: CZB,
        x1: 26,
        z1: 20,
        y,
        h: 4.2,
        wall: "wood_oak",
        floor: "parquet",
        ceil: "plaster_cream",
        skip: "nw",
        trim: "gold",
        surface: "wood",
      });
      D.table(b, 15, y, 14, {
        rect: [9, 1.6],
        top: "wood_dark",
        leg: "wood_dark",
        cloth: "fabric_white",
      });
      for (let i = 0; i < 6; i++)
        for (const s of [-1, 1])
          D.chair(b, 11 + i * 1.6, y, 14 + s * 1.2, s > 0 ? PI : 0, {
            toppled: (i + s) % 5 === 0,
          });
      for (let i = 0; i < 6; i++) {
        b.cyl(
          "paint_white",
          11 + i * 1.6,
          y + 0.77,
          13.4,
          0.13,
          0.13,
          0.02,
          10,
        );
        b.cyl(
          "paint_white",
          11 + i * 1.6,
          y + 0.77,
          14.6,
          0.13,
          0.13,
          0.02,
          10,
        );
      }
      D.candles(S, 15, y + 0.77, 14, 4, { r: 5, i: 0.5 });
      D.chandelier(S, 13, y + 4.0, 14, 0.9, { tiers: 3, dark: true });
      D.chandelier(S, 18, y + 4.0, 14, 0.9, { tiers: 3, lr: 8, li: 0.5 });
      D.painting(b, 25.83, y + 2.4, 14, 2.2, 1.4, -HP, 2);
      S.prop("skeleton", 20.5, y, 18, 2.8, { pose: "lying" });
      S.anchor("dining", 15, y, 10, 0);
      S.anchor("spawn5", 20, y, 10, 0);
      S.room({
        x0: HX1,
        z0: -8,
        x1: 26,
        z1: CZA,
        y,
        h: 4.2,
        wall: "tile_white",
        floor: "tile",
        ceil: "plaster",
        skip: "sw",
      });
      b.box("metal", 8, y, -7.9, 24, y + 0.95, -7.2, { segLen: 2 });
      b.box("steel", 8, y + 0.95, -7.95, 24, y + 1.0, -7.15, { seg: false });
      S.col(8, y, -7.95, 24, y + 1.0, -7.15, { walkable: false });
      S.prop("fridge", 25.2, y, -5, -HP, { loot: "fridge" });
      S.prop("shelf", 8.5, y, 1.5, PI, { variant: 1 });
      b.box("lamp", 14, y + 4.0, -3, 18, y + 4.05, -2.8, { seg: false });
      S.light(16, y + 3.2, -3, 0xe0f0d8, 9, 0.6);
    }
    // 2ND FLOOR (y 4.5): the Van Rensselaer (W) and Pell (E) apartments
    {
      const y = LV[2];
      b.ground = y;
      S.wallX("damask", CZA, -26, HX0, y, y + 4.2, 0.3, [[-12, -10.5, 0, 2.5]]);
      S.wallX("damask", CZB, -26, HX0, y, y + 4.2, 0.3, [[-15, -13.5, 0, 2.5]]);
      S.wallX("damask", CZA, HX1, 26, y, y + 4.2, 0.3, [[10, 11.5, 0, 2.5]]);
      S.wallX("damask", CZB, HX1, 26, y, y + 4.2, 0.3, [[16, 17.5, 0, 2.5]]);
      // west: ransacked — Maniac nest
      S.room({
        x0: -26,
        z0: -10,
        x1: HX0,
        z1: CZA,
        y,
        h: 4.2,
        wall: "wallpaper_green",
        floor: "parquet",
        ceil: "plaster",
        skip: "se",
        surface: "wood",
      });
      S.room({
        x0: -26,
        z0: CZB,
        x1: HX0,
        z1: 20,
        y,
        h: 4.2,
        wall: "wallpaper_green",
        floor: "parquet",
        ceil: "plaster",
        skip: "ne",
        surface: "wood",
      });
      S.wallZ("wallpaper_green", -15, -10, CZA, y, y + 4.2, 0.2, [
        [-5, -3.5, 0, 2.4],
      ]);
      D.bed(b, -21, y, -6, 0, { posts: true, w: 1.6 });
      S.prop("skeleton", -20.6, y + 0.6, -6.4, 0, { pose: "lying" });
      D.rubble(S, -9, y, -4, 1.4, { n: 7 });
      D.papers(b, -18, y, 12, 3, 16);
      D.sofa(b, -20, y, 14, HP, { fabric: "fabric" });
      D.chair(b, -12, y, 16, 2, { toppled: true });
      D.bookcase(b, -25.8 + 0.2, y, 10, HP, { w: 2.2, empty: 0.6 });
      b.box("fabric", -8, y, 10, -6, y + 0.4, 13, { seg: false, grime: 0.9 }); // nest of rags
      S.prop("dresser", -25.3, y, -8.5, HP, { loot: "dresser" });
      D.sconce(S, -15.2, y + 2.4, 0, -HP, { r: 6, i: 0.4 });
      S.light(-18, y + 3.5, 13, 0xffc880, 9, 0.35);
      for (const z of [-7, 12, 17]) {
        b.box(
          "glass_dark",
          -25.84,
          y + 1.0,
          z - 0.7,
          -25.82,
          y + 3.0,
          z + 0.7,
          { seg: false },
        );
        S.light(-24.8, y + 2, z, 0x8aa0c0, 5, 0.35);
      }
      S.anchor("spawn2", -18, y, 12, 0);
      // east: the dinner party that never ended
      S.room({
        x0: HX1,
        z0: -10,
        x1: 26,
        z1: CZA,
        y,
        h: 4.2,
        wall: "damask",
        floor: "parquet",
        ceil: "plaster_cream",
        skip: "sw",
        trim: "gold",
        surface: "wood",
      });
      S.room({
        x0: HX1,
        z0: CZB,
        x1: 26,
        z1: 20,
        y,
        h: 4.2,
        wall: "wallpaper_rose",
        floor: "parquet",
        ceil: "plaster_cream",
        skip: "nw",
        trim: "gold",
        surface: "wood",
      });
      D.table(b, 16, y, 13.5, {
        rect: [5, 1.4],
        top: "wood_dark",
        leg: "wood_dark",
        cloth: "fabric_white",
      });
      for (let i = 0; i < 3; i++)
        for (const s of [-1, 1])
          D.chair(b, 14.2 + i * 1.8, y, 13.5 + s * 1.05, s > 0 ? PI : 0, {
            arms: i === 1,
          });
      for (const [sx, sz, ry] of [
        [14.2, 14.3, PI],
        [17.8, 12.7, 0],
        [16, 14.3, PI],
      ])
        S.prop("skeleton", sx, y + 0.02, sz, ry, { pose: "sitting" });
      D.candles(S, 16, y + 0.77, 13.5, 5, { r: 6, i: 0.9 });
      for (let i = 0; i < 6; i++) {
        b.cyl(
          "paint_white",
          14.2 + (i % 3) * 1.8,
          y + 0.77,
          13.5 + (i < 3 ? -0.45 : 0.45),
          0.13,
          0.13,
          0.02,
          10,
        );
        b.cyl(
          "glass",
          14.5 + (i % 3) * 1.8,
          y + 0.77,
          13.5 + (i < 3 ? -0.3 : 0.3),
          0.03,
          0.02,
          0.16,
          6,
        );
      }
      D.chandelier(S, 16, y + 4.0, 13.5, 0.7, { tiers: 2, dark: true });
      D.painting(b, 25.83, y + 2.3, 13.5, 2.0, 1.3, -HP, 7);
      D.painting(b, 16, y + 2.4, 19.83, 1.4, 1.0, PI, 3);
      S.prop("radio", 24, y + 0.8, 18.5, -2.4, { station: "classical" });
      b.box("wood_dark", 23.5, y, 18, 25, y + 0.8, 19.6, { seg: false });
      S.pickup("pu_note_dinner", 1, 17.3, y + 0.78, 13.2);
      D.bookcase(b, 16, y, -9.75, 0, { w: 3 });
      D.bookcase(b, 19.2, y, -9.75, 0, { w: 3 });
      D.sofa(b, 12, y, -4, HP);
      D.table(b, 14.5, y, -4, { r: 0.5, top: "marble", leg: "gold" });
      D.fireplace(b, S, 25.85, y, -4, -HP, { lit: false });
      S.prop("safe", 8, y, -9.4, 0, {
        locked: 0,
        lock: P.LOCKS.pell_safe,
        name: "Pell Family Safe",
        items: [
          ["scrip", 85],
          ["old_dollars", 6],
          ["gold_bar", 1],
        ],
      });
      S.light(15, y + 3.5, -4, 0xffc880, 10, 0.4);
      S.anchor("spawn3", 12, y, 12, 0);
      S.anchor("spawn6", -12, y, 5, 0);
      S.anchor("dinner", 16, y, 11, 0);
    }
    // 3RD FLOOR (y 9): Agnes Hollister (W) and the sealed Hollis apartment (E)
    {
      const y = LV[3];
      b.ground = y;
      S.wallX("damask", CZA, -26, HX0, y, y + 4.2, 0.3, [[-12, -10.5, 0, 2.5]]);
      S.wallX("damask", CZB, -26, HX0, y, y + 4.2, 0.3, [[-15, -13.5, 0, 2.5]]);
      // Agnes: parlour (south) and bedroom (north), candles everywhere, tea for two
      S.room({
        x0: -26,
        z0: CZB,
        x1: HX0,
        z1: 20,
        y,
        h: 4.2,
        wall: "wallpaper_rose",
        floor: "parquet",
        ceil: "plaster_cream",
        skip: "ne",
        trim: "gold",
        surface: "wood",
      });
      S.room({
        x0: -26,
        z0: -10,
        x1: HX0,
        z1: CZA,
        y,
        h: 4.2,
        wall: "wallpaper_rose",
        floor: "carpet",
        ceil: "plaster_cream",
        skip: "se",
        trim: "gold",
        surface: "carpet",
      });
      D.rug(b, -21, 9, -9, 17, y + 0.01);
      D.sofa(b, -15, y, 16.5, PI, { fabric: "fabric_pink" });
      D.chair(b, -17.8, y, 12.8, 0.6, { arms: true, seat: "fabric_pink" });
      D.chair(b, -12.4, y, 12.8, -0.6, { arms: true, seat: "fabric_pink" });
      D.table(b, -15, y, 13.6, {
        r: 0.55,
        top: "wood_dark",
        leg: "wood_dark",
        cloth: "fabric_white",
        h: 0.62,
      });
      b.lathe(
        "paint_white",
        [
          [0.001, 0],
          [0.06, 0],
          [0.09, 0.08],
          [0.08, 0.16],
          [0.03, 0.2],
          [0.001, 0.21],
        ],
        10,
        -15,
        y + 0.62,
        13.6,
      );
      for (const [cx, cz] of [
        [-15.35, 13.4],
        [-14.65, 13.8],
      ])
        b.cyl("paint_white", cx, y + 0.62, cz, 0.05, 0.04, 0.06, 8);
      D.candles(S, -14.8, y + 0.62, 13.3, 3, { r: 5, i: 0.8 });
      D.candles(S, -25.4, y + 1.35, 14, 4, { r: 6, i: 0.9 });
      D.fireplace(b, S, -25.85, y, 14, HP, { lit: true, key: "marble" });
      D.painting(b, -25.83, y + 2.6, 9.5, 1.2, 1.6, HP, 7);
      D.painting(b, -9, y + 2.4, 19.83, 1.6, 1.1, PI, 0);
      D.bookcase(b, -20, y, 19.75, PI, { w: 2.2 });
      D.piano(b, -8, y, 16.5, PI - 0.4, { key: "wood_dark" });
      D.bed(b, -21, y, -6.5, 0, {
        posts: true,
        canopy: "fabric_pink",
        cover: "fabric_pink",
      });
      S.prop("dresser", -25.3, y, -2, HP, {
        loot: "dresser",
        owner: "settlers",
      });
      S.prop("bed", -12, y, -8.5, PI, {
        name: "Agnes's Guest Bed",
        owned: false,
      });
      D.candles(S, -17, y + 0.02, -8.8, 5, { r: 6, i: 0.6 });
      for (const z of [11, 17]) {
        b.box(
          "glass_dark",
          -25.84,
          y + 1.0,
          z - 0.7,
          -25.82,
          y + 3.0,
          z + 0.7,
          { seg: false },
        );
      }
      S.anchor("agnes", -15.3, y, 11.4, PI);
      S.anchor("agnes_parlour", -15, y, 12, 0);
      // east corridor up to the sealed door, then the Hollis apartment
      S.wallX("damask", CZA, HX1, 26, y, y + 4.2, 0.3, [[15, 16.5, 0, 2.5]]);
      S.wallX("damask", CZB, HX1, 26, y, y + 4.2, 0.3, [[12, 13.5, 0, 2.5]]);
      S.wallZ("damask", 9, CZA, CZB, y, y + 4.2, 0.3, [[4.2, 5.8, 0, 2.5]]);
      S.anchor("sealed_door", 8.3, y, 5, -HP);
      // parlour (south) with the piano and the score
      S.room({
        x0: 9,
        z0: CZB,
        x1: 26,
        z1: 20,
        y,
        h: 4.2,
        wall: "wallpaper_green",
        floor: "parquet",
        ceil: "plaster_cream",
        skip: "nw",
        trim: "gold",
        surface: "wood",
      });
      S.wallZ("wallpaper_green", 9, CZB, 20, y, y + 4.2, 0.3, []);
      D.piano(b, 20, y, 15, PI + 0.3, { key: "paint_black" });
      b.box("paper", 19.6, y + 1.22, 14.35, 20.3, y + 1.55, 14.4, {
        rx: -0.2,
        seg: false,
      });
      D.sofa(b, 13, y, 17.5, PI, { fabric: "velvet" });
      D.table(b, 13, y, 15.6, { r: 0.45, top: "marble", leg: "gold" });
      D.painting(b, 9.17, y + 2.4, 13, 1.4, 1.8, HP, 7);
      D.painting(b, 25.83, y + 2.4, 13, 2.0, 1.3, -HP, 6);
      D.chandelier(S, 17, y + 4.0, 13, 0.7, { tiers: 2, dark: true });
      S.light(20, y + 3, 15, 0x9ab0d0, 8, 0.45);
      S.pickup("pu_score", 1, 19.95, y + 1.25, 14.6);
      S.pickup("pu_reel_hollis1", 1, 13.1, y + 0.76, 15.6);
      S.anchor("parlour", 17, y, 12, 0);
      // nursery (north-west part) + master bedroom (north-east)
      S.room({
        x0: 9,
        z0: -10,
        x1: 18,
        z1: CZA,
        y,
        h: 4.2,
        wall: "wallpaper_rose",
        floor: "carpet",
        ceil: "plaster_cream",
        skip: "s",
        trim: "paint_white",
        surface: "carpet",
        holes: { e: [[-6, -4.5, 0, 2.5]] },
      });
      S.room({
        x0: 18,
        z0: -10,
        x1: 26,
        z1: CZA,
        y,
        h: 4.2,
        wall: "wallpaper_green",
        floor: "carpet",
        ceil: "plaster_cream",
        skip: "sw",
        trim: "gold",
        surface: "carpet",
      });
      D.crib(b, 13.5, y, -7.8, 0);
      D.rockingChair(b, 11.2, y, -5.5, 0.9);
      S.prop("skeleton", 11.2, y + 0.3, -5.4, 0.9 + PI, { pose: "sitting" });
      S.prop("teddy_bear", 14.2, y + 0.55, -7.6, 0.3, {});
      b.box("wood", 16.5, y, -9.7, 17.8, y + 0.9, -9.2, { seg: false });
      b.box("gold", 16.9, y + 0.9, -9.6, 17.3, y + 1.05, -9.3, { seg: false }); // music box
      for (let k = 0; k < 8; k++)
        b.box(
          ["paint_red", "paint_blue", "paint_cream", "paint_green"][k % 4],
          10 + ((k * 0.9) % 6),
          y,
          0 + (k % 3) * 0.5,
          10.3 + ((k * 0.9) % 6),
          y + 0.3,
          0.3 + (k % 3) * 0.5,
          { seg: false, ry: k },
        ); // blocks
      const mural = P.texMat("dak_nursery", nurseryTex(), { rough: 0.9 });
      b.quad(mural, 13.5, y + 2.6, -9.83, 7.5, 2.2, { ry: 0 });
      S.light(13.5, y + 3.4, -5, 0xffc0d0, 8, 0.55);
      S.glow(13.5, y + 3.8, -5, 0xffb0c0, 0.5);
      b.sphere("lamp_dim", 13.5, y + 3.8, -5, 0.3, { ws: 10, hs: 8 });
      S.pickup("pu_reel_hollis2", 1, 17.2, y + 0.92, -9.45);
      S.anchor("nursery", 13.5, y, -4, 0);
      S.anchor("nanny", 14.8, y, -5.5, PI);
      D.bed(b, 22, y, -7, 0, { posts: true, w: 1.8 });
      S.prop("skeleton", 22.4, y + 0.6, -7.2, 0, { pose: "lying" });
      S.prop("dresser", 25.3, y, -3, -HP, {
        loot: "dresser",
        items: [
          ["pu_hollis_locket", 1],
          ["scrip", 40],
        ],
      });
      S.light(22, y + 3, -5, 0x8aa0c0, 7, 0.4);
    }
    // ---- servants' stair doors (loop-back exits to the courtyard service door) ----
    {
      // basement: west end of the corridor, past the boiler room
      const y0 = LV[0];
      b.box("concrete", -25.85, y0, 3.9, -25.6, y0 + 2.6, 6.1, { seg: false });
      b.box("metal", -25.6, y0, 4.3, -25.52, y0 + 2.25, 5.7, { seg: false });
      b.box("rust", -25.5, y0 + 1.0, 4.35, -25.44, y0 + 1.12, 5.65, {
        seg: false,
      });
      D.label(
        b,
        "dak_svc_b",
        ["SERVICE STAIR", "Courtyard ↑"],
        -25.5,
        y0 + 2.6,
        5,
        0.9,
        0.3,
        HP,
        "label",
      );
      b.box("lamp", -25.4, y0 + 3.0, 4.8, -25.3, y0 + 3.1, 5.2, { seg: false });
      S.light(-24.8, y0 + 2.9, 5, 0xd8f0d0, 6, 0.6);
      S.anchor("service_basement", -23.2, y0, 5, -HP);
      // 3rd floor: the far (east) end of the Hollis apartment's hall, beyond the sealed door
      const y3 = LV[3];
      b.box("wood_dark", 25.6, y3, 3.9, 25.85, y3 + 2.7, 6.1, { seg: false });
      b.box("wood_oak", 25.52, y3, 4.3, 25.6, y3 + 2.35, 5.7, { seg: false });
      b.sphere("gold", 25.47, y3 + 1.1, 5.45, 0.05, { ws: 6, hs: 4 });
      D.label(
        b,
        "dak_svc_3",
        ["SERVANTS' STAIR", "Staff only"],
        25.5,
        y3 + 2.65,
        5,
        0.9,
        0.3,
        -HP,
        "label",
      );
      D.sconce(S, 25.7, y3 + 2.3, 3.6, -HP, { r: 5, i: 0.5 });
      S.anchor("service_third", 24.4, y3, 5, HP);
    }
    S.build({ interior: true });
    P.addInterior("dakota", S.root);
    // ---- the sealed door (separate mesh so it can be torn down) ----
    const sealed = new P.Batch("dak_sealed", {
      ox: S.ox,
      oy: S.oy,
      oz: S.oz,
      lit: true,
      ambient: 0x5a5448,
      ambI: 0.3,
    });
    const y3 = LV[3];
    sealed.box("wood_dark", 8.95, y3, 4.2, 9.05, y3 + 2.5, 5.8, { seg: false });
    for (let k = 0; k < 5; k++)
      sealed.box(
        "wood_rotten",
        8.75,
        y3 + 0.3 + k * 0.5,
        3.9,
        8.85,
        y3 + 0.5 + k * 0.5,
        6.1,
        { rx: k % 2 ? 0.12 : -0.1, seg: false },
      );
    const sign = P.texMat(
      "dak_sealed",
      P.signTex(
        "dak_sealed",
        ["SEALED BY ORDER", "OF THE BOARD", "DO NOT OPEN"],
        "label",
        512,
        256,
        { bg: "#e0d0b0" },
      ),
      { rough: 0.9 },
    );
    sealed.quad(sign, 8.72, y3 + 1.6, 5, 0.9, 0.45, { ry: -HP });
    sealed.light(8, y3 + 2.5, 5, 0xffc880, 5, 0.6);
    const sealedRoot = sealed.build(S.root);
    const sealedCol = S.col(8.7, y3, 3.4, 9.1, y3 + 3, 6.6, {
      walkable: false,
    });
    P.dakotaSealed = { root: sealedRoot, col: sealedCol, open: false };
    return S;
  }
  function nurseryTex() {
    return P.canvasTex("pu_dak_nursery", 1024, 300, (ctx, w, h) => {
      const r = P.rng("nurs");
      ctx.fillStyle = "#e8d0d0";
      ctx.fillRect(0, 0, w, h);
      // parade of ducks and moons
      for (let i = 0; i < 9; i++) {
        const x = 60 + i * 110,
          y = h * 0.6;
        ctx.fillStyle = "#e8c860";
        ctx.beginPath();
        ctx.ellipse(x, y, 34, 22, 0, 0, TAU);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 28, y - 22, 14, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#d8883a";
        ctx.beginPath();
        ctx.moveTo(x + 40, y - 22);
        ctx.lineTo(x + 54, y - 18);
        ctx.lineTo(x + 40, y - 14);
        ctx.fill();
        ctx.fillStyle = "#6a88b8";
        ctx.beginPath();
        ctx.arc(x, h * 0.2, 16, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#e8d0d0";
        ctx.beginPath();
        ctx.arc(x + 8, h * 0.18, 14, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = "#8a5a6a";
      ctx.font = "bold 34px " + P.FONTS.SERIF;
      ctx.textAlign = "center";
      ctx.fillText("Hush, little Ada, don't you cry", w / 2, h * 0.93);
      P.blotches(ctx, w, h, r, 40, 0.35);
      ctx.fillStyle = "rgba(80,20,20,0.6)";
      ctx.font = "bold 42px Impact, sans-serif";
      ctx.fillText("SHE IS STILL SINGING", w * 0.7, h * 0.42);
    });
  }
  // ===================================================================
  // Street <-> interior doors & registration — called by 20_dakota.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.dakota = function (E) {
    const I = buildInterior();
    const O = P.I("dakota");
    E.door(
      -171.7,
      1.4,
      -622,
      "The Dakota — Residents' Stair",
      { x: O.x, y: O.y + FLOOR_Y, z: O.z + 10, yaw: 0 },
      {
        radius: 1.3,
        onEnter: () => P.safe("disc", () => G.discover("dakota")),
      },
    );
    I.door(
      0,
      1.4,
      11.6,
      "The Dakota — Courtyard",
      { x: -170.3, y: 0, z: -622, yaw: -HP },
      { verb: "Exit", radius: 1.3 },
    );
    // servants' stair: one-way shortcut out (basement and 3rd floor → courtyard service door), barred from inside
    const svcOut = { x: -160, y: 0, z: -623.8, yaw: PI }; // on the lane between the planters, facing the courtyard
    const svc = P.barDoor(
      E.door(
        -160,
        1.4,
        -625.3,
        "The Dakota — Service Door",
        { x: O.x - 23.2, y: O.y + FLOOR_Y - 4.5, z: O.z + 5, yaw: -HP },
        { id: "pu_dakota_service", radius: 1.3 },
      ),
      {
        message: "The service door is barred from the inside.",
        unbarMessage:
          "You lift the bar from the service door. A shortcut back into the Dakota.",
      },
    );
    I.door(-25.4, -4.5 + 1.4, 5, "Service Stair — Courtyard", svcOut, {
      verb: "Exit",
      radius: 1.3,
      onEnter: () => svc.unbar(),
    });
    I.door(25.4, 9 + 1.4, 5, "Servants' Stair — Courtyard", svcOut, {
      verb: "Exit",
      radius: 1.3,
      onEnter: () => svc.unbar(),
    });
    P.register("dakota", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "dakota",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { svc },
    });
  };
})();
