/* src/poi_uptown/30_plaza_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 30 The Plaza Hotel — interior
 *
 * INTERIOR (cell 'plaza_hotel', origin 5000,0,800) — friendly settlement:
 *   Fifth Avenue lobby (front desk: rooms to let), the Palm Court under
 *   its stained-glass laylight, the Oak Bar, the kitchens, the Grand
 *   Ballroom ("the Last Cotillion") and the suites upstairs (Suite 610 to
 *   rent, the locked Presidential Suite).
 * EXTERIOR: see 30_plaza.js (its builder calls P.interiorBuilders.plaza_hotel below).
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
  function buildInterior() {
    const O = P.I("plaza_hotel");
    const S = P.site("plaza_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x746858,
      ambI: 0.34,
      interiorKey: "plaza_hotel",
    });
    const b = S.b;
    // ---------------- Fifth Avenue lobby ----------------
    const LH = 6.5;
    S.room({
      x0: -12,
      z0: 18,
      x1: 12,
      z1: 34,
      y: 0,
      h: 10,
      wall: "plaster_cream",
      floor: "marble",
      ceil: "plaster_cream",
      skip: "n",
      holes: { e: [[20, 24, LH, LH + 2.6]], s: [[-1.5, 1.5, 0, 2.9]] },
      trim: "gold",
    });
    D.rug(b, -2, 20, 2, 33, 0.01, "carpet_red");
    for (const x of [-7, 7])
      for (const z of [21, 29]) {
        b.cyl("marble_dark", x, 0, z, 0.45, 0.5, 10, 16);
        b.cyl("gold", x, 9.4, z, 0.55, 0.45, 0.6, 16);
        S.col(x - 0.5, 0, z - 0.5, x + 0.5, 10, z + 0.5, { walkable: false });
      }
    D.chandelier(S, 0, 8.6, 26, 1.2, { tiers: 3, lr: 13, li: 1.3, chain: 1.4 });
    D.chandelier(S, -3, 8.6, 20.5, 0.8, {
      tiers: 2,
      lr: 9,
      li: 0.8,
      chain: 1.4,
    });
    // front desk (west side)
    b.box("wood_oak", -10.6, 0, 22, -8.8, 1.1, 30, { segLen: 2 });
    b.box("marble_dark", -10.7, 1.1, 21.9, -8.7, 1.18, 30.1, { seg: false });
    S.col(-10.7, 0, 21.9, -8.7, 1.18, 30.1, { walkable: false });
    for (let i = 0; i < 30; i++)
      b.box(
        i % 5 === 2 ? "paper" : "wood_dark",
        -11.84,
        1.4 + Math.floor(i / 10) * 0.42,
        22.5 + (i % 10) * 0.7,
        -11.8,
        1.75 + Math.floor(i / 10) * 0.42,
        23.1 + (i % 10) * 0.7,
        { seg: false },
      );
    for (let i = 0; i < 10; i++)
      b.box("gold", -11.82, 2.8, 22.7 + i * 0.7, -11.78, 2.95, 22.9 + i * 0.7, {
        seg: false,
      }); // keys
    const fd = P.texMat(
      "plaza_frontdesk",
      P.signTex("plaza_frontdesk", ["FRONT DESK"], "gilt", 512, 96),
      { rough: 0.5 },
    );
    b.quad(fd, -11.83, 3.6, 26, 2.6, 0.5, { ry: HP });
    b.cyl("gold", -9.6, 1.18, 23, 0.07, 0.07, 0.07, 8); // service bell
    S.prop("terminal", -9.7, 1.18, 28.8, -HP, {
      terminalId: "pu_plaza_front",
      mount: "bare",
    });
    S.anchor("concierge", -11.0, 0, 26, -HP);
    S.anchor("desk_front", -7.5, 0, 26, HP);
    // luggage trolley, sofas, palms, boutique corner
    b.box("gold", 5, 0.25, 32, 6.2, 0.3, 33, { seg: false });
    for (const [lx, lz] of [
      [5, 32],
      [6.2, 32],
      [5, 33],
      [6.2, 33],
    ])
      b.rod("gold", [lx, 0, lz], [lx, 1.8, lz], 0.025, 4);
    b.rod("gold", [5, 1.8, 32.5], [6.2, 1.8, 32.5], 0.03, 4);
    b.box("leather", 5.1, 0.3, 32.1, 5.9, 0.8, 32.9, { seg: false });
    b.box("fabric", 5.3, 0.8, 32.2, 6.1, 1.2, 32.8, { seg: false });
    D.sofa(b, -4.5, 0, 32.8, PI, { fabric: "velvet" });
    D.sofa(b, 4, 0, 23.5, -HP * 0.2, { fabric: "velvet" });
    D.palm(b, -11, 0, 32.8, 2.6);
    D.palm(b, 11, 0, 19.5, 2.8);
    D.palm(b, -11, 0, 19.5, 2.4);
    // Hortense's boutique rack (east-south corner)
    for (let k = 0; k < 6; k++) {
      b.rod(
        "chrome",
        [9.2 + k * 0.4, 1.7, 32.6],
        [9.2 + k * 0.4, 1.7, 33.4],
        0.01,
        3,
      );
      b.box(
        ["paint_black", "velvet", "fabric_white", "paint_blue"][k % 4],
        9.05 + k * 0.4,
        0.7,
        32.7,
        9.35 + k * 0.4,
        1.65,
        33.3,
        { seg: false },
      );
    }
    b.rod("chrome", [9, 1.75, 33], [11.6, 1.75, 33], 0.02, 4);
    S.anchor("hortense", 10.2, 0, 31.2, PI);
    S.anchor("entrance", 0, 0, 31.5, 0);
    // grand staircase up to the suites (east side)
    S.stairs("marble", 10, 32.4, "n", 3, 0, LH, {
      rail: "gold",
      railSides: [-1],
      nosing: "carpet_red",
    });
    S.floor("marble", 6.5, 20, 12, 24.2, LH, { t: 0.35 });
    S.rail(
      "gold",
      [
        [6.5, 24.2],
        [6.5, 20],
        [8.5, 20],
      ],
      LH,
      1.0,
      { baluster: true, step: 0.3 },
    );
    S.rail(
      "gold",
      [
        [6.5, 24.2],
        [8.5, 24.2],
      ],
      LH,
      1.0,
      { baluster: true, step: 0.3 },
    );
    // revolving door in a marble niche cut into the lobby's south wall (it used to be drawn 0.7 m BEHIND the solid
    // wall — the way out of the Plaza was invisible from inside), gilt frame + EXIT sign on the wall face
    S.room({
      x0: -1.6,
      z0: 34,
      x1: 1.6,
      z1: 36.3,
      y: 0,
      h: 3.0,
      wall: "marble",
      floor: "marble",
      ceil: "gold",
      skip: "n",
    });
    b.cyl("glass", 0, 0, 35.1, 1.1, 1.1, 2.6, 16, {
      t0: HP * 0.1 + PI,
      tl: PI * 0.8,
    });
    b.cyl("gold", 0, 2.6, 35.1, 1.15, 1.15, 0.12, 16);
    b.cyl("gold", 0, 0, 35.1, 1.15, 1.15, 0.05, 16);
    for (let k = 0; k < 4; k++) {
      const a = k * HP + 0.4;
      b.geo(
        "glass",
        new THREE.BoxGeometry(0.04, 2.47, 1.05).translate(0, 1.315, 0.525),
        P.m4(0, 0, 35.1, a),
        { noAO: true },
      );
      b.rod(
        "gold",
        [Math.sin(a) * 1.05, 0.1, 35.1 + Math.cos(a) * 1.05],
        [Math.sin(a) * 1.05, 2.55, 35.1 + Math.cos(a) * 1.05],
        0.025,
        4,
      );
    }
    b.cyl("gold", 0, 0, 35.1, 0.06, 0.06, 2.6, 8);
    S.col(-1.3, 0, 34.5, 1.3, 2.6, 36.2, { walkable: false });
    S.light(0, 2.4, 34.6, 0xffe8c0, 4, 0.5);
    D.exitDoor(S, 0, 0, 33.84, PI, {
      noLeaves: true,
      frame: "gold",
      w: 3.0,
      h: 2.9,
      text: "EXIT",
      sub: "FIFTH AVENUE",
    });
    // ---------------- Palm Court ----------------
    const PH = 9;
    S.floor("marble", -14, -8, 14, 18, 0);
    S.ceil("plaster_cream", -14, -8, 14, 18, PH);
    S.wallX("plaster_cream", 18, -14.15, 14.15, 0, 10, 0.3, [[-6, 6, 0, 5.2]]);
    S.wallX("plaster_cream", -8, -14.15, 14.15, 0, PH, 0.3, [[-4, 4, 0, 4.2]]);
    S.wallZ("plaster_cream", -14, -8, 18, 0, PH, 0.3, [[0, 6, 0, 4.2]]);
    S.wallZ("plaster_cream", 14, -8, 18, 0, PH, 0.3, [[0, 6, 0, 4.2]]);
    // marble dado + gilt band (Palm Court & lobby)
    for (const [x0, z0, x1, z1] of [
      [-13.85, -7.85, -13.75, 17.85],
      [13.75, -7.85, 13.85, 17.85],
      [-13.85, -7.85, 13.85, -7.75],
      [-13.85, 17.75, 13.85, 17.85],
      [-11.85, 18.15, -11.75, 33.85],
      [11.75, 18.15, 11.85, 33.85],
      [-11.85, 33.75, 11.85, 33.85],
    ]) {
      S.trim("marble_green", x0, 0, z0, x1, 1.4, z1, { segLen: 3 });
      S.trim("gold", x0, 1.4, z0, x1, 1.48, z1, { seg: false });
    }
    // laylight: stained glass in a coffered frame
    b.geo(
      "stained",
      new THREE.PlaneGeometry(16, 16).rotateX(HP),
      P.m4(0, PH - 0.14, 5),
      { uv: "keep", noAO: true },
    ); // below the ceiling slab (which is drawn at PH-0.09)
    for (let k = 0; k <= 4; k++) {
      b.box(
        "gold",
        -8 + k * 4 - 0.08,
        PH - 0.3,
        -3,
        -8 + k * 4 + 0.08,
        PH - 0.05,
        13,
        { seg: false },
      );
      b.box(
        "gold",
        -8,
        PH - 0.3,
        -3 + k * 4 - 0.08,
        8,
        PH - 0.05,
        -3 + k * 4 + 0.08,
        { seg: false },
      );
    }
    b.box("plaster_cream", -8.6, PH - 0.9, -3.6, 8.6, PH - 0.3, -3, {
      seg: false,
    });
    b.box("plaster_cream", -8.6, PH - 0.9, 13, 8.6, PH - 0.3, 13.6, {
      seg: false,
    });
    b.box("plaster_cream", -8.6, PH - 0.9, -3, -8, PH - 0.3, 13, {
      seg: false,
    });
    b.box("plaster_cream", 8, PH - 0.9, -3, 8.6, PH - 0.3, 13, { seg: false });
    for (const [x, z] of [
      [-4, 1],
      [4, 1],
      [-4, 9],
      [4, 9],
      [0, 5],
    ])
      S.light(x, PH - 1.2, z, 0xffe8b8, 11, 0.9);
    // ring of Corinthian columns with arches
    for (const x of [-9, 9])
      for (let z = -4; z <= 14; z += 4.5) colCorinth(S, x, 0, z, PH - 0.4);
    for (const z of [-4, 14])
      for (const x of [-4.5, 4.5]) colCorinth(S, x, 0, z, PH - 0.4);
    // mirrored arch panels on the walls
    for (const x of [-13.8, 13.8])
      for (const z of [-4, 12]) {
        b.box("glass", x - 0.02, 1.2, z - 1.4, x + 0.02, 5.4, z + 1.4, {
          seg: false,
        });
        b.box("gold", x - 0.05, 5.4, z - 1.5, x + 0.05, 5.6, z + 1.5, {
          seg: false,
        });
      }
    // palms, café tables, the trio platform
    for (const [x, z] of [
      [-11.5, -5.5],
      [11.5, -5.5],
      [-11.5, 15.5],
      [11.5, 15.5],
      [-11.5, 5],
      [11.5, 9],
    ])
      D.palm(b, x, 0, z, 3.2 + (x > 0 ? 0.4 : 0));
    const tables = [
      [-5, 1.5],
      [5, 1.5],
      [-5.5, 9],
      [5.5, 9.5],
      [-2, 13],
      [2.5, -1],
      [0, 6],
    ];
    tables.forEach(([x, z], i) => {
      D.table(b, x, 0, z, {
        r: 0.55,
        top: "marble",
        leg: "gold",
        cloth: i === 6 ? "fabric_white" : undefined,
      });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * TAU + i;
        D.chair(b, x + Math.cos(a) * 0.95, 0, z + Math.sin(a) * 0.95, -a - HP, {
          wood: "gold",
          seat: "velvet",
          toppled: i === 3 && k === 1,
        });
      }
      b.lathe(
        "paint_white",
        [
          [0.001, 0],
          [0.05, 0],
          [0.08, 0.07],
          [0.07, 0.14],
          [0.001, 0.15],
        ],
        8,
        x + 0.15,
        0.76,
        z,
      );
      if (i % 2 === 0)
        D.candles(S, x - 0.15, 0.76, z + 0.1, 2, {
          r: 3.5,
          i: 0.45,
          size: 0.3,
        });
    });
    b.box("wood_dark", 8, 0, 12.8, 13.6, 0.35, 16.8, { seg: false });
    S.col(8, 0, 12.8, 13.6, 0.35, 16.8);
    b.box("wood_dark", 11, 0.35, 15.2, 11.6, 1.2, 15.8, { seg: false });
    b.cyl("gold", 11.3, 1.2, 15.5, 0.02, 0.35, 0.5, 10, {
      rz: 0.6,
      open: true,
    }); // gramophone horn
    for (let k = 0; k < 3; k++) {
      b.rod("iron", [9 + k * 1.2, 0.35, 14], [9 + k * 1.2, 1.4, 14], 0.01, 3);
      b.box("paper", 8.8 + k * 1.2, 1.3, 13.95, 9.3 + k * 1.2, 1.6, 14, {
        rx: -0.2,
        seg: false,
      });
    }
    S.anchor("constance", 0.3, 0, 6.9, PI);
    S.anchor("palm_court", 0, 0, 12, 0);
    S.anchor("npc1", -5.6, 0, 2.3, 2.6);
    S.anchor("npc2", 5.9, 0, 10.4, -2.2);
    S.anchor("npc3", 10.2, 0.35, 15.2, PI);
    // ---------------- Oak Bar ----------------
    S.room({
      x0: 14,
      z0: -8,
      x1: 32,
      z1: 10,
      y: 0,
      h: 5,
      wall: "wood_oak",
      floor: "wood_dark",
      ceil: "wood_dark",
      skip: "w",
      trim: "gold",
      surface: "wood",
    });
    D.bar(b, 16, 28, 0, -5.2, -7.6, { wood: "wood_oak", top: "marble_dark" });
    S.col(16, 0, -5.85, 28, 1.12, -5.15, { walkable: false });
    for (let x = 17; x < 28; x += 1.3) {
      b.cyl("gold", x, 0, -4.5, 0.03, 0.18, 0.75, 8);
      b.cyl("leather", x, 0.75, -4.5, 0.2, 0.2, 0.1, 10);
    }
    // leather booths along the east wall + murals of the park
    for (let z = -3; z <= 7; z += 3.3) {
      b.box("leather", 29.6, 0, z - 1.2, 31.8, 0.45, z + 1.2, { seg: false });
      b.box("leather", 31.3, 0.45, z - 1.2, 31.8, 1.4, z + 1.2, { seg: false });
      D.table(b, 29.2, 0, z, { r: 0.4, top: "wood_dark", leg: "gold" });
      S.col(29.6, 0, z - 1.2, 31.8, 0.45, z + 1.2);
      D.sconce(S, 31.82, 1.9, z, -HP, { r: 4, i: 0.55, size: 0.35 });
    }
    D.painting(b, 23, 3.4, 9.8, 7.5, 2.4, PI, 0, { frame: "wood_dark" });
    D.painting(b, 31.8, 3.4, -4.8, 3.6, 1.6, -HP, 6, { frame: "wood_dark" });
    for (const [x, z] of [
      [18, 1],
      [24, 1],
      [18, 6.5],
      [24, 6.5],
      [21, -3],
    ]) {
      b.rod("gold", [x, 4.2, z], [x, 5, z], 0.015, 3);
      b.sphere("lamp_dim", x, 4.1, z, 0.25, { ws: 10, hs: 8 });
      S.light(x, 3.6, z, 0xffc070, 10, 0.9);
      S.glow(x, 4.1, z, 0xffc070, 0.7);
    }
    // back-bar mirror glow + bottles catching the light
    b.box("glass", 16.4, 1.6, -7.86, 27.6, 3.4, -7.8, { seg: false });
    S.light(22, 1.8, -6.8, 0xffb060, 12, 0.8);
    S.light(22, 2.2, -7, 0xffb060, 8, 0.7);
    const ob = P.texMat(
      "plaza_oakbar",
      P.signTex("plaza_oakbar", ["THE OAK BAR"], "gilt", 512, 96),
      { rough: 0.5, emissive: 0.2 },
    );
    b.quad(ob, 22, 4.4, -7.9, 3, 0.55, { ry: 0 });
    S.anchor("bartender", 22, 0, -6.5, 0);
    S.anchor("oak_bar", 22, 0, -2, PI);
    S.anchor("npc4", 29.2, 0, 3.1, HP);
    // ---------------- Kitchens (west) ----------------
    S.room({
      x0: -32,
      z0: -8,
      x1: -14,
      z1: 10,
      y: 0,
      h: 4.4,
      wall: "tile_white",
      floor: "tile",
      ceil: "plaster",
      skip: "e",
      surface: "concrete",
    });
    for (const z of [-2, 4]) {
      b.box("steel", -28, 0, z - 0.6, -18, 0.95, z + 0.6, { segLen: 2 });
      S.col(-28, 0, z - 0.6, -18, 0.95, z + 0.6, { walkable: false });
      for (let k = 0; k < 5; k++)
        b.cyl(
          k % 2 ? "chrome" : "rust",
          -27 + k * 2,
          0.95,
          z,
          0.22,
          0.2,
          0.3,
          10,
        );
    }
    b.box("metal", -31.6, 0, -7.6, -24, 1.0, -6.4, { segLen: 2 });
    b.box("iron", -31.5, 1.0, -7.5, -24.1, 1.05, -6.5, { seg: false });
    S.col(-31.6, 0, -7.6, -24, 1.05, -6.4, { walkable: false });
    for (let k = 0; k < 6; k++)
      b.cyl("iron", -31 + k * 1.2, 1.05, -7, 0.18, 0.18, 0.03, 10);
    b.cyl("fire", -26.6, 1.05, -7, 0.1, 0.15, 0.2, 6);
    S.light(-26.6, 1.6, -6.5, 0xff8a30, 6, 0.9);
    S.glow(-26.6, 1.3, -6.8, 0xff8a30, 0.5);
    b.box("steel", -31.9, 0, 2, -31.2, 2.2, 9, { seg: false });
    for (let k = 0; k < 4; k++)
      b.box("steel", -31.9, 0.4 + k * 0.5, 2, -31.2, 0.43 + k * 0.5, 9, {
        seg: false,
      });
    S.prop("fridge", -31.2, 0, 0.5, HP, { loot: "fridge", owner: "settlers" });
    S.prop("crate", -16, 0, 8.5, 0.2, {
      kind: "fizzo",
      loot: "crate",
      owner: "settlers",
    });
    S.prop("crate", -17.2, 0, 8.7, 0.9, {
      kind: "plain",
      loot: "crate",
      owner: "settlers",
    });
    for (let x = -28; x <= -20; x += 4) {
      b.box("lamp", x - 0.8, 4.3, 1, x + 0.8, 4.35, 1.2, { seg: false });
      S.light(x, 3.6, 1, 0xe8f0e0, 8, 0.8);
    }
    S.anchor("chef", -23, 0, -5.8, PI);
    S.anchor("kitchen", -23, 0, 1, 0);
    // ---------------- Grand Ballroom ----------------
    const BH = 12;
    S.floor("parquet", -18, -44, 18, -8, 0, { surface: "wood" });
    S.ceil("plaster_cream", -18, -44, 18, -8, BH);
    S.wallX("plaster_cream", -8, -18.15, 18.15, PH, BH, 0.3, []);
    S.wallX("plaster_cream", -8.3, -18.15, -14.15, 0, PH, 0.3, []);
    S.wallX("plaster_cream", -8.3, 14.15, 18.15, 0, PH, 0.3, []);
    S.wallX("plaster_cream", -44, -18.15, 18.15, 0, BH, 0.3, []);
    S.wallZ("plaster_cream", -18, -44, -8, 0, BH, 0.3, []);
    S.wallZ("plaster_cream", 18, -44, -8, 0, BH, 0.3, []);
    // gilded pilasters, mirrors, box galleries (decorative)
    for (const x of [-17.8, 17.8])
      for (let z = -41; z <= -11; z += 5) {
        b.box("gold", x - 0.2, 0, z - 0.35, x + 0.2, BH - 1.2, z + 0.35, {
          segLen: 3,
        });
      }
    for (const x of [-17.7, 17.7])
      for (let z = -38.5; z <= -13.5; z += 5) {
        b.box("glass", x - 0.02, 1.0, z - 1.6, x + 0.02, 5.6, z + 1.6, {
          seg: false,
        });
        b.torus("gold", x, 5.6, z, 1.6, 0.08, PI, { ry: HP, ts: 12, rs: 4 });
      }
    b.box("plaster_cream", -18, 5.2, -12, 18, 5.6, -8.2, { segLen: 3 }); // musicians' gallery
    for (let x = -17; x <= 17; x += 0.5)
      b.lathe(
        "gold",
        [
          [0.001, 0],
          [0.05, 0],
          [0.03, 0.2],
          [0.06, 0.5],
          [0.03, 0.8],
          [0.05, 0.95],
          [0.001, 1.0],
        ],
        6,
        x,
        5.6,
        -12.05,
      );
    b.box("gold", -18, 6.6, -12.15, 18, 6.72, -11.95, { seg: false });
    for (let z = -42; z <= -10; z += 8)
      for (let x = -14; x <= 14; x += 7)
        b.box("gold", x - 3, BH - 0.25, z - 0.1, x + 3, BH - 0.05, z + 0.1, {
          seg: false,
        });
    for (const [x, z] of [
      [-8, -26],
      [8, -26],
      [0, -34],
      [0, -18],
    ])
      D.chandelier(S, x, BH - 1.0, z, 1.3, {
        tiers: 3,
        lr: 14,
        li: 0.95,
        broken: x === 8,
      });
    // stage + skeleton orchestra
    b.box("wood_dark", -12, 0, -44, 12, 0.9, -38);
    S.col(-12, 0, -44, 12, 0.9, -38);
    S.stairs("wood_dark", 0, -37.3, "n", 3, 0, 0.9, { run: 0.24 });
    b.box("velvet", -12, 0.9, -43.9, 12, 8.5, -43.7, { segLen: 2 });
    for (let x = -11; x <= 11; x += 1.1)
      b.box("velvet", x - 0.25, 0.9, -43.6, x + 0.25, 8.5, -43.4, {
        seg: false,
        rz: 0.02,
      });
    for (const x of [-9, -5, 5, 9]) {
      D.chair(b, x, 0.9, -41, 0, { wood: "gold", seat: "velvet" });
      b.rod("iron", [x, 0.9, -40.3], [x, 2.0, -40.3], 0.012, 3);
      b.box("paper", x - 0.25, 1.85, -40.32, x + 0.25, 2.2, -40.28, {
        rx: -0.3,
        seg: false,
      });
    }
    D.piano(b, 1, 0.9, -41.5, 0.2, { key: "paint_black" });
    const cot = P.texMat(
      "plaza_cotillion",
      P.signTex(
        "plaza_cotillion",
        [
          "THE LAST COTILLION",
          "Sunday Brunch Dance · March 5th, 1967 · 10 A.M.",
        ],
        "banner",
        1024,
        256,
        { bg: "#2a3a2a", fg: "#e8d8a8", top: 0.25 },
      ),
      { rough: 1 },
    );
    b.quad(cot, 0, 9.4, -43.35, 9, 2.2, { ry: 0 });
    S.light(0, 6, -40, 0xffd8a0, 12, 1.0);
    // banquet tables + "dancing" mannequins
    for (const [x, z] of [
      [-12, -30],
      [-12, -20],
      [12, -30],
      [12, -20],
      [-12, -14],
      [12, -14],
    ]) {
      D.table(b, x, 0, z, {
        r: 0.9,
        top: "wood_dark",
        leg: "wood_dark",
        cloth: "fabric_white",
      });
      for (let k = 0; k < 5; k++) {
        const a = (k / 5) * TAU;
        D.chair(b, x + Math.cos(a) * 1.35, 0, z + Math.sin(a) * 1.35, -a - HP, {
          wood: "gold",
          seat: "velvet",
          toppled: (k + x) % 4 === 0,
        });
      }
      D.candles(S, x, 0.76, z, 3, { r: 4, i: 0.5, size: 0.35 });
    }
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * TAU,
        x = Math.cos(a) * 4.5,
        z = -24 + Math.sin(a) * 4.5;
      D.figure(b, "paint_white", x - 0.25, 0, z, a, 1.05, "dance", {
        grime: 0.5,
      });
      D.figure(b, "paint_black", x + 0.25, 0, z, a + PI, 1.1, "dance", {
        robe: "velvet",
        grime: 0.5,
      });
    }
    S.anchor("ballroom", 0, 0, -14, PI);
    S.anchor("npc5", -12, 0, -18.6, 0);
    S.anchor("stage", 0, 0.9, -40, PI);
    // ---------------- Suites (y 6.5) ----------------
    const SY = LH;
    S.room({
      x0: 12,
      z0: 20,
      x1: 40,
      z1: 24,
      y: SY,
      h: 3.6,
      wall: "damask",
      floor: "carpet_red",
      ceil: "plaster_cream",
      holes: {
        w: [[20, 24, 0, 2.6]],
        s: [
          [18, 19.4, 0, 2.4],
          [32, 33.4, 0, 2.4],
        ],
        n: [[26, 27.4, 0, 2.4]],
      },
      surface: "carpet",
      trim: "gold",
    });
    for (const x of [16, 24, 32, 38])
      D.sconce(S, x, SY + 2.2, 20.2, 0, {
        r: 5,
        i: x === 32 ? 0 : 0.6,
        dark: x === 32,
      });
    const n610 = P.texMat(
      "plaza_610",
      P.signTex("plaza_610", ["610"], "brass", 256, 128),
      { rough: 0.4, metal: 0.5 },
    );
    b.quad(n610, 20.1, SY + 2.1, 23.83, 0.4, 0.2, { ry: PI });
    // Suite 610 (to rent)
    S.room({
      x0: 14,
      z0: 24,
      x1: 26,
      z1: 34,
      y: SY,
      h: 3.6,
      wall: "wallpaper_green",
      floor: "carpet",
      ceil: "plaster_cream",
      skip: "n",
      surface: "carpet",
      trim: "gold",
    });
    D.bed(b, 22.5, SY, 31.5, PI, { posts: true, canopy: "velvet", w: 1.8 });
    D.sofa(b, 16.5, SY, 28, HP, { fabric: "velvet" });
    D.table(b, 18, SY, 28, { r: 0.45, top: "marble", leg: "gold" });
    D.painting(b, 25.8, SY + 1.9, 29, 1.4, 1.0, -HP, 3);
    D.candles(S, 25, SY + 0.02, 33.2, 3, { r: 5, i: 0.7 });
    b.box("wood_dark", 24.8, SY, 25, 25.8, SY + 1.9, 26.4, { seg: false }); // wardrobe
    S.prop("bed", 22.5, SY, 31.5, PI, {
      name: "Suite 610 Bed",
      owned: true,
      onInteract: () => P.plazaSleep && P.plazaSleep(),
      verb: "Sleep",
      label: "Suite 610 — Four-Poster Bed",
    });
    S.prop("footlocker", 15, SY, 33.3, 0, {
      loot: "footlocker",
      name: "Suite 610 Trunk",
    });
    S.anchor("suite610", 20, SY, 28, 0);
    // Suite 614 (a dead guest's room)
    S.room({
      x0: 26,
      z0: 24,
      x1: 40,
      z1: 34,
      y: SY,
      h: 3.6,
      wall: "wallpaper",
      floor: "carpet",
      ceil: "plaster",
      skip: "nw",
      surface: "carpet",
    });
    D.bed(b, 36, SY, 31.5, PI, { w: 1.6 });
    S.prop("skeleton", 36.2, SY + 0.6, 31.2, PI, { pose: "lying" });
    D.tub(b, 29, SY, 32.5, HP);
    S.prop("dresser", 39.4, SY, 26, -HP, { loot: "dresser" });
    S.pickup("pu_note_guest", 1, 34.8, SY + 0.02, 30.2);
    S.light(33, SY + 3, 29, 0x8aa0c0, 8, 0.45);
    // Presidential Suite (locked: lock 50)
    S.room({
      x0: 14,
      z0: 10,
      x1: 40,
      z1: 20,
      y: SY,
      h: 3.6,
      wall: "damask",
      floor: "parquet",
      ceil: "plaster_cream",
      skip: "s",
      surface: "wood",
      trim: "gold",
    });
    D.piano(b, 20, SY, 14, PI + 0.5, { key: "paint_white" });
    D.sofa(b, 27, SY, 17.8, PI, { fabric: "velvet" });
    D.sofa(b, 27, SY, 13, 0, { fabric: "velvet" });
    D.table(b, 27, SY, 15.4, {
      rect: [1.8, 0.8],
      top: "marble",
      leg: "gold",
      h: 0.45,
    });
    D.bed(b, 36.5, SY, 15, -HP, {
      posts: true,
      canopy: "fabric_white",
      w: 2.0,
    });
    D.chandelier(S, 27, SY + 3.5, 15.4, 0.7, { tiers: 2, lr: 8, li: 0.8 });
    D.painting(b, 30, SY + 2.0, 10.2, 2.2, 1.4, 0, 1);
    D.bar(b, 15, 17.5, SY, 11.4, 10.2, { wood: "wood_dark" });
    S.prop("safe", 39.4, SY, 11, -HP, {
      locked: 0,
      lock: P.LOCKS.pres_safe,
      name: "Presidential Suite Safe",
      owner: "settlers",
      items: [
        ["scrip", 260],
        ["gold_bar", 1],
        ["pu_society_charter", 1],
        ["rally_tonic_extra", 1],
      ],
    });
    S.prop("dresser", 33, SY, 10.5, 0, { loot: "dresser", owner: "settlers" });
    S.pickup("old_world_formalwear", 1, 38.4, SY + 0.62, 18.6);
    S.anchor("presidential", 27, SY, 15, 0);
    // hostile spawn spots (contract: every interior; used if the settlement is ever overrun / by raid scripts)
    [
      [0, 0, 24],
      [-4, 0, 12],
      [22, 0, 2],
      [-20, 0, 1],
      [8, 0, -14],
      [-8, 0, -24],
    ].forEach((p, i) => S.anchor("spawn" + (i + 1), p[0], p[1], p[2], PI));
    // (the Presidential Suite door is a locked teleport-free gate: see 80_content / P.plazaGate)
    b.ground = 0;
    S.build({ interior: true });
    P.addInterior("plaza_hotel", S.root);
    // locked Presidential double doors (separate mesh + collider, opened from the brass keypad: P.LOCKS.pres_door)
    const gate = new P.Batch("plaza_gate", {
      ox: S.ox,
      oy: S.oy,
      oz: S.oz,
      lit: true,
      ambient: 0x746858,
      ambI: 0.4,
    });
    gate.box("wood_oak", 25.95, SY, 19.85, 27.45, SY + 2.4, 20.05, {
      seg: false,
    });
    gate.box("gold", 26.6, SY + 1.0, 20.06, 26.8, SY + 1.1, 20.1, {
      seg: false,
    });
    const pres = P.texMat(
      "plaza_pres",
      P.signTex("plaza_pres", ["PRESIDENTIAL", "SUITE"], "brass", 256, 128),
      { rough: 0.4, metal: 0.5 },
    );
    gate.quad(pres, 26.7, SY + 2.7, 20.12, 0.7, 0.35, { ry: 0 });
    gate.light(26.7, SY + 2.5, 21, 0xffd8a0, 4, 0.5);
    const gateRoot = gate.build(S.root);
    const gateCol = S.col(25.9, SY, 19.8, 27.5, SY + 2.5, 20.2, {
      walkable: false,
    });
    P.plazaGate = {
      root: gateRoot,
      col: gateCol,
      pos: S.W(26.7, SY + 1.2, 20.3),
      open: false,
    };
    return S;
  }
  /** Corinthian column: base, fluted shaft, acanthus-ish capital (gold). */
  function colCorinth(S, x, y, z, h) {
    const b = S.b;
    b.box("marble_dark", x - 0.55, y, z - 0.55, x + 0.55, y + 0.5, z + 0.55, {
      seg: false,
    });
    b.cyl("marble", x, y + 0.5, z, 0.36, 0.42, h - 1.4, 16, { hSeg: 3 });
    b.cyl("gold", x, y + h - 0.9, z, 0.55, 0.38, 0.6, 12);
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * TAU;
      b.box(
        "gold",
        x + Math.cos(a) * 0.45 - 0.06,
        y + h - 0.95,
        z + Math.sin(a) * 0.45 - 0.06,
        x + Math.cos(a) * 0.45 + 0.06,
        y + h - 0.45,
        z + Math.sin(a) * 0.45 + 0.06,
        { seg: false, ry: a },
      );
    }
    b.box(
      "marble",
      x - 0.65,
      y + h - 0.3,
      z - 0.65,
      x + 0.65,
      y + h,
      z + 0.65,
      { seg: false },
    );
    S.col(x - 0.45, y, z - 0.45, x + 0.45, y + h, z + 0.45, {
      walkable: false,
    });
  }
  P.colCorinth = colCorinth;

  // ===================================================================
  // Street <-> interior doors & registration — called by 30_plaza.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.plaza_hotel = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("plaza_hotel");
    E.door(
      97.1,
      2.6,
      EX.DOOR_Z,
      "The Plaza Hotel",
      { x: O.x, y: O.y, z: O.z + 31.5, yaw: 0 },
      {
        radius: 1.6,
        onEnter: () => P.safe("disc", () => G.discover("plaza_hotel")),
      },
    );
    I.door(
      0,
      1.5,
      34.2,
      "Fifth Avenue",
      { x: 100.5, y: 0, z: EX.DOOR_Z, yaw: -HP },
      { verb: "Exit", radius: 1.6 },
    );
    P.register("plaza_hotel", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "plaza_hotel",
      anchors: Object.assign({}, E.anchors, I.anchors),
    });
  };
})();
