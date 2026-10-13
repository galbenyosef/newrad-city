// play-inline-307 05 — box
// Lines 863-1811 of readable/play-inline-307.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("tudor_city");
    const S = P.site("tc_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x5e564a,
      ambI: 0.42,
      interiorKey: "tudor_city",
    });
    const b = S.b;
    const rn = P.rng("tc_int");
    TC.S = S;
    // ================= F1: THE GREAT HALL =================
    const GX0 = -10,
      GX1 = 10,
      GZ0 = 0,
      GZ1 = 18;
    S.floor("slate", GX0, GZ0, GX1, GZ1, 0, { surface: "concrete" });
    // walls: oak panelling to 3.2 m, plaster above with timber studs
    S.wallX("wood_oak", GZ1, GX0 - 0.15, GX1 + 0.15, 0, 3.2, 0.3, [
      [-1.3, 1.3, 0, 3.2],
    ]);
    S.wallX("plaster_cream", GZ1, GX0 - 0.15, GX1 + 0.15, 3.2, F3, 0.3);
    S.wallX("wood_oak", 0, GX0, GX1, 0, F2, 0.3, [[-7.8, -4.2, 0, 3.0]]);
    S.wallZ("wood_oak", GX0, GZ0, GZ1, 0, 3.2, 0.3, [[6, 10, 0, 3.0]]);
    S.wallZ("plaster_cream", GX0, GZ0, GZ1, 3.2, F2, 0.3);
    S.wallZ("plaster_cream", GX0, GZ0, GZ1, F2, F3, 0.3, [[0.2, 2.8, 0, 2.6]]);
    S.wallZ("wood_oak", GX1, GZ0, GZ1, 0, 3.2, 0.3, [[6, 10, 0, 3.0]]);
    S.wallZ("plaster_cream", GX1, GZ0, GZ1, 3.2, F2, 0.3);
    S.wallZ("plaster_cream", GX1, GZ0, GZ1, F2, F3, 0.3, [[0.2, 2.8, 0, 2.6]]);
    for (const x of [GX0 + 0.16, GX1 - 0.16])
      for (let z = GZ0 + 1; z < GZ1; z += 2.2)
        b.box("wood_dark", x - 0.05, 3.2, z - 0.1, x + 0.05, F3, z + 0.1, {
          seg: false,
        });
    // ceiling beams + hammer-beam trusses (the F3 slab sits on them)
    S.ceil("wood_dark", GX0, GZ0, GX1, GZ1, F3 - 0.3);
    for (let z = 3.5; z < GZ1; z += 3.6) {
      b.box("wood_dark", GX0, F3 - 1.0, z - 0.2, GX1, F3 - 0.3, z + 0.2, {
        seg: false,
      });
      for (const s of [-1, 1]) {
        b.box(
          "wood_dark",
          s * 9.9 - 0.2,
          F3 - 2.6,
          z - 0.18,
          s * 9.9 + 0.2,
          F3 - 1.0,
          z + 0.18,
          { seg: false },
        );
        b.rod(
          "wood_dark",
          [s * 9.8, F3 - 2.6, z],
          [s * 7.2, F3 - 1.0, z],
          0.14,
          4,
          { square: true },
        );
        b.box(
          "wood_dark",
          Math.min(s * 9.9, s * 8.0),
          F3 - 2.75,
          z - 0.2,
          Math.max(s * 9.9, s * 8.0),
          F3 - 2.5,
          z + 0.2,
          { seg: false },
        );
        b.box(
          "wood_dark",
          s * 8.0 - 0.15,
          F3 - 3.1,
          z - 0.15,
          s * 8.0 + 0.15,
          F3 - 2.5,
          z + 0.15,
          { seg: false },
        );
      }
    }
    // the minstrels' gallery (F2 level along the north wall) with balustrade
    S.floor("wood", GX0, GZ0 - 0.2, GX1, 3.0, F2, { under: "wood_dark" });
    S.rail(
      "wood_dark",
      [
        [GX0 + 0.2, 3.0],
        [GX1 - 0.2, 3.0],
      ],
      F2,
      1.0,
      { baluster: true, r: 0.07, step: 0.28 },
    );
    for (const x of [-6, 0, 6]) {
      b.box("wood_dark", x - 0.2, 0, 2.8, x + 0.2, F2, 3.2, { seg: false });
      S.col(x - 0.2, 0, 2.8, x + 0.2, F2, 3.2, { walkable: false });
    }
    const tap = P.texMat(
      "tc_tap_lord",
      P.signTex(
        "tc_tap_lord",
        ["LONG LIVE", "THE LORD PROTECTOR"],
        "banner",
        512,
        768,
        { bg: "#5a1a18", fg: "#e0c070", top: 0.35 },
      ),
      { rough: 1 },
    );
    for (const x of [-8, 8]) {
      b.geo(
        "tapestry",
        new THREE.PlaneGeometry(1.6, 3.2),
        P.m4(x, F2 + 2.3, 0.2, 0),
        { uv: "keep", noAO: true },
      );
    }
    b.quad(tap, 0, F2 + 2.3, 0.2, 2.4, 3.6, { ry: 0 });
    // the great stone fireplace under the gallery
    b.box("limestone", -2.6, 0, 0.1, 2.6, 3.4, 1.1, { segLen: 1 });
    b.box("paint_black", -1.5, 0.05, 1.05, 1.5, 1.9, 1.12, {
      seg: false,
      noAO: true,
    });
    const fpa = archShape(3.0, 2.2, 0.6);
    fpa.holes.push(archShape(2.4, 1.9, 0.5));
    b.extrude("limestone", fpa, 0.2, P.m4(0, 0, 1.1, 0));
    b.box("limestone", -2.9, 3.4, 0.1, 2.9, 3.7, 1.4, { seg: false });
    S.col(-2.6, 0, 0, 2.6, 3.4, 1.1, { walkable: false });
    b.box("iron", -1.0, 0.1, 1.2, 1.0, 0.18, 1.8, { seg: false });
    for (let i = 0; i < 5; i++)
      b.rod(
        "wood_rotten",
        [-0.8 + i * 0.35, 0.2, 1.3],
        [-0.6 + i * 0.3, 0.3, 1.85],
        0.07,
        5,
      );
    b.geo(
      "fire",
      new THREE.ConeGeometry(0.5, 1.0, 6).translate(0, 0.7, 1.5),
      P.m4(0, 0, 0),
      { noAO: true },
    );
    S.light(0, 1.3, 2.4, 0xff9a40, 11, 1.5);
    S.glow(0, 0.8, 1.7, 0xff8a30, 1.8, { flicker: 0.5 });
    TC.firePos = S.W(0, 0.6, 1.6);
    // stained glass (south wall): two tall pointed windows lit from outside
    const FSg = P.face(S, "n", GX0, GX1, GZ1); // the south wall seen from inside faces north
    for (const u of [4, 16]) {
      const w = 2.2,
        h = 4.4;
      FSg.S.b.extrude(
        "stained",
        archShape(w, h, 1.1),
        0.04,
        FSg.mat(u, 1.0, 0.18),
        { uv: "keep", noAO: true, noBake: true },
      );
      const fr = archShape(w + 0.4, h + 0.2, 1.3);
      fr.holes.push(archShape(w, h, 1.1));
      FSg.S.b.extrude("limestone", fr, 0.2, FSg.mat(u, 1.0, 0.1));
      const [lx, lz] = FSg.pt(u, 1.2);
      S.light(lx, 3.5, lz, 0xffc890, 8, 0.8);
      S.glow(lx, 3.2, lz, 0xffb070, 2.6);
    }
    // entrance doors (oak, iron strap hinges)
    b.box("wood_dark", -1.3, 0, GZ1 - 0.06, 1.3, 3.2, GZ1 + 0.05, {
      seg: false,
    });
    for (const y of [0.6, 2.4])
      b.box("iron", -1.2, y, GZ1 - 0.1, 1.2, y + 0.1, GZ1 - 0.05, {
        seg: false,
      });
    // iron ring chandeliers (one lit, one fallen)
    b.rod("iron", [0, F3 - 1, 9], [0, F3 - 3.5, 9], 0.02, 3);
    b.torus("iron", 0, F3 - 3.5, 9, 1.4, 0.05, TAU, { rx: HP, ts: 24, rs: 4 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      D.candles(S, Math.cos(a) * 1.4, F3 - 3.45, 9 + Math.sin(a) * 1.4, 1, {
        r: i % 2 ? 0.1 : 3,
        i: i % 2 ? 0.01 : 0.5,
        size: 0.25,
      });
    }
    S.light(0, F3 - 4.2, 9, 0xffb868, 12, 0.9);
    b.torus("iron", 3.2, 0.1, 14.6, 1.4, 0.05, TAU, {
      rx: HP + 0.25,
      ts: 24,
      rs: 4,
    });
    b.rod("iron", [3.2, 0.3, 14.6], [4.4, 1.2, 13.4], 0.02, 3);
    // raider occupation: long table, mattresses, trophy wall, cage, chem junk
    D.table(b, -3.5, 0, 10, {
      rect: [1.2, 5.4],
      top: "wood_dark",
      leg: "wood_dark",
    });
    for (let i = 0; i < 4; i++) {
      D.chair(b, -4.5, 0, 8 + i * 1.3, HP, {
        seat: "velvet",
        toppled: i === 2,
      });
      D.chair(b, -2.5, 0, 8.5 + i * 1.3, -HP, { seat: "velvet" });
    }
    for (let i = 0; i < 6; i++)
      b.cyl(
        i % 2 ? "glass_dark" : "glass",
        -3.7 + (i % 2) * 0.4,
        0.75,
        8.2 + i * 0.8,
        0.04,
        0.045,
        0.26,
        6,
        { noAO: true },
      );
    D.candles(S, -3.5, 0.75, 10.2, 4, { r: 5 });
    for (let i = 0; i < 4; i++)
      E.mattress(b, 6.5 + (i % 2) * 1.4, 0, 8 + i * 2.2, 0.1 * i);
    for (let i = 0; i < 9; i++)
      E.pike(b, GX1 - 0.4, 0, 12.2 + i * 0.5, 1.6 + (i % 3) * 0.3);
    E.cage(b, -7.6, F2 - 0.2, 14.8, { bones: true, chain: 0.4 });
    D.rubble(S, -7.2, 0, 4.8, 1.2, { n: 6, key: "rubble" });
    D.papers(b, 2, 0.01, 12, 5, 16);
    const kneel = P.texMat(
      "tc_kneel",
      P.signTex("tc_kneel", ["KNEEL"], "raider", 512, 192, { fg: "#c42a1e" }),
      { transparent: true },
    );
    b.quad(kneel, 0, 2.2, GZ1 - 0.2, 3.0, 1.1, { ry: PI });
    // ================= F1 west: the Tudor Room (raider bar + chem lab) =================
    S.room({
      x0: -22,
      z0: 0,
      x1: -10,
      z1: 18,
      y: 0,
      h: 4.7,
      wall: "wood_oak",
      floor: "wood",
      ceil: false,
      skip: "e",
      trim: "wood_dark",
      holes: { n: [[-18, -16.6, 0, 2.4]] },
    });
    D.bar(b, -21, -14, 0, 4.2, 1.2, { wood: "wood_oak", top: "marble_dark" });
    S.col(-21, 0, 3.6, -14, 1.1, 4.25, { walkable: false });
    for (let i = 0; i < 5; i++) {
      b.cyl("iron", -20.2 + i * 1.3, 0, 5.0, 0.03, 0.2, 0.7, 6);
      b.cyl("leather", -20.2 + i * 1.3, 0.7, 5.0, 0.2, 0.2, 0.08, 10);
    }
    // pool table
    b.box("wood_dark", -18.4, 0, 10, -15.6, 0.8, 11.6, { seg: false });
    b.box("velvet", -18.25, 0.8, 10.15, -15.75, 0.82, 11.45, {
      seg: false,
      noAO: true,
    });
    S.col(-18.4, 0, 10, -15.6, 0.85, 11.6, { walkable: false });
    const dart = P.texMat(
      "tc_dart",
      P.signTex("tc_dart", ["THE LORD", "PROTECTOR"], "raider", 256, 256, {
        fg: "#ffffff",
      }),
      { transparent: true },
    );
    b.cyl("wood_dark", -21.85, 1.7, 14, 0.4, 0.4, 0.05, 16, { rz: HP });
    b.quad(dart, -21.8, 1.75, 14, 0.7, 0.7, { ry: HP });
    // chem lab corner
    D.table(b, -19.5, 0, 16.4, { rect: [2.6, 1.0], top: "metal", leg: "iron" });
    for (let i = 0; i < 7; i++)
      b.cyl(
        i % 3 ? "glass" : "lamp_green",
        -20.6 + i * 0.35,
        0.75,
        16.3 + (i % 2) * 0.2,
        0.05,
        0.07,
        0.18 + (i % 3) * 0.08,
        6,
        { noAO: true },
      );
    S.light(-19.5, 1.4, 16.4, 0x8aff7a, 4, 0.6);
    E.hangLamp(S, -17, 4.7, 7, {
      chain: 1.2,
      shade: "paint_red",
      color: 0xffa060,
    });
    E.hangLamp(S, -17, 4.7, 13, {
      chain: 1.2,
      shade: "paint_red",
      color: 0xffa060,
      lit: false,
    });
    for (let k = 0; k < 3; k++) {
      b.box("glass_dark", -21.85, 1.2, 3 + k * 5, -21.8, 3.4, 4.4 + k * 5, {
        seg: false,
      });
      for (let j = 0; j < 3; j++)
        b.box(
          "wood_rotten",
          -21.8,
          1.4 + j * 0.8,
          2.8 + k * 5,
          -21.7,
          1.7 + j * 0.8,
          4.6 + k * 5,
          { seg: false },
        );
    }
    // ================= F1 east: mail & elevator hall =================
    S.room({
      x0: 10,
      z0: 0,
      x1: 18,
      z1: 18,
      y: 0,
      h: 4.7,
      wall: "marble_cream",
      floor: "slate",
      ceil: false,
      skip: "w",
      trim: "wood_dark",
      holes: { n: [[11, 13, 0, 2.6]] },
    });
    for (let i = 0; i < 6; i++)
      for (let j = 0; j < 8; j++)
        b.box(
          (i + j) % 5 === 0 ? "paint_black" : "brass",
          17.82,
          0.9 + j * 0.28,
          10.4 + i * 0.36,
          17.86,
          1.14 + j * 0.28,
          10.72 + i * 0.36,
          { seg: false, noAO: true },
        );
    for (const z of [4.0, 7.0]) {
      b.box("brass", 17.7, 0, z - 1.0, 17.85, 3.1, z + 1.0, { seg: false });
      b.box(
        z === 4.0 ? "chrome" : "paint_black",
        17.66,
        0.02,
        z - 0.75,
        17.72,
        2.6,
        z + 0.75,
        { seg: false },
      );
    }
    D.label(
      b,
      "tc_svc",
      ["SERVICE", "ELEVATOR"],
      17.64,
      2.85,
      4.0,
      0.9,
      0.3,
      -HP,
      "brass",
    );
    TC.svcDoorLocal = { x: 17.2, y: 1.5, z: 4.0 };
    E.tube(S, 14, 4.7, 5, 0, { len: 2, drop: 0.2, r: 7, i: 0.6 });
    E.tube(S, 14, 4.7, 13, 0, { len: 2, drop: 0.2, lit: false });
    S.prop("skeleton", 12.4, 0, 15.5, 0.4, { pose: "curled" });
    // ================= F2 slab (everywhere except over the great hall) =================
    S.floor("wood", -22, -14, -10, 18, F2, { under: "plaster" }); // over the bar / 2A 2B / kitchen
    S.floor("wood", 10, -14, 18, 18, F2, { under: "plaster" }); // over the mail hall / 2C / stair 2 area
    S.floor("wood", -10, -14, 10, -6.6, F2, { under: "plaster" }); // 2D / landing / 2E
    S.floor("wood", -10, -6.6, -7.8, 0, F2, { under: "plaster" }); // corridor west of stair 1
    S.floor("wood", -4.2, -6.6, 10, 0, F2, { under: "plaster" }); // corridor east of stair 1
    S.rail(
      "wood_dark",
      [
        [-7.8, -6.4],
        [-7.8, -0.2],
        [-4.2, -0.2],
        [-4.2, -6.4],
      ],
      F2,
      1.0,
      { baluster: true, r: 0.06, step: 0.3 },
    );
    // ================= F1 north strip + stair 1 =================
    S.floor("slate", -22, -14, 18, 0, 0);
    S.wallX("plaster_cream", -14, -22, 18, 0, F3, 0.3);
    S.wallX("wood_oak", 0, -22, -10, F2, F2 + 4.6, 0.3, [
      [-17.2, -15.8, 0, 2.3],
    ]);
    S.wallZ("plaster_cream", -22, -14, 0, 0, F3, 0.3);
    S.wallZ("plaster_cream", 18, -14, 0, 0, F3, 0.3);
    S.wallZ("plaster_cream", -22, 0, 18, F2, F3, 0.3);
    S.wallZ("plaster_cream", 18, 0, 18, F2, F3, 0.3);
    S.wallX("plaster_cream", 18, -22, -10, F2, F3, 0.3);
    S.wallX("plaster_cream", 18, 10, 18, F2, F3, 0.3);
    // F1 north strip rooms: kitchen (w), stair 1 hall, boiler (e)
    S.wallZ("plaster_ruin", -9, -14, 0, 0, F2, 0.25, [[-3, -1, 0, 2.4]]);
    S.wallZ("plaster_ruin", 0, -14, 0, 0, F2, 0.25, [[-3, -1, 0, 2.4]]);
    S.stairs("wood_dark", -6, -0.3, "n", 3.5, 0, F2, {
      rail: "wood_dark",
      nosing: "brass",
    });
    E.hangLamp(S, -2, F2, -8, { chain: 0.6, color: 0xffc070, r: 6 });
    // boiler room (x 0..18 z -14..0): the building's dead boiler + generator
    b.cyl("rust", 8, 0, -8, 1.8, 1.8, 4.2, 16, { rz: 0 });
    b.cyl("rust", 8, 4.2, -8, 1.4, 1.8, 0.6, 16);
    for (let i = 0; i < 3; i++)
      b.rod(
        "rust",
        [8 + (i - 1) * 0.8, 4.4, -8],
        [8 + (i - 1) * 0.8, F2, -8 + i],
        0.18,
        8,
      );
    S.col(6.2, 0, -9.8, 9.8, 4.8, -6.2, { walkable: false });
    S.prop("workbench", 14.5, 0, -13.2, 0);
    S.prop("toolbox", 16.2, 0.95, -13.3, 0, { loot: "toolbox" });
    E.hangLamp(S, 12, F2, -6, {
      chain: 0.8,
      shade: "metal",
      color: 0xffb060,
      i: 0.7,
    });
    // kitchen (x -22..-6 z -14..0): raider meat locker
    b.box("metal", -21.6, 0, -13.6, -14, 0.9, -12.6, { seg: false });
    b.box("marble", -21.6, 0.9, -13.6, -14, 0.96, -12.6, {
      seg: false,
      noAO: true,
    });
    S.col(-21.6, 0, -13.6, -14, 0.96, -12.6, { walkable: false });
    for (let i = 0; i < 5; i++) {
      const x = -20.5 + i * 1.4;
      b.rod("iron", [x, F2 - 0.2, -11], [x, F2 - 1.2, -11], 0.01, 3);
      b.box("gore", x - 0.2, F2 - 2.4, -11.15, x + 0.2, F2 - 1.2, -10.85, {
        seg: false,
        noAO: true,
      });
    }
    S.prop("fridge", -12.5, 0, -13.4, 0, { loot: "fridge" });
    E.hangLamp(S, -17, F2, -7, {
      chain: 0.8,
      shade: "paint_white",
      color: 0xe8e0c8,
      i: 0.8,
    });
    TC.door2D = { x: -13.9, y: F2, z: -6.6 };
    // ================= F2: corridor, apartments =================
    S.ceil("plaster", -22, -14, -10, 18, F3 - 0.3);
    S.ceil("plaster", 10, -14, 18, 18, F3 - 0.3);
    S.ceil("plaster", -10, -14, 10, 0, F3 - 0.3);
    // corridor strip z -6..0 : walls between corridor and north apartments
    S.wallX("wallpaper_green", -6.6, -22, -9, F2, F3 - 0.3, 0.25, [
      [-14.6, -13.2, 0, 2.3],
    ]);
    S.wallX("wallpaper_green", -6.6, 0, 12, F2, F3 - 0.3, 0.25, [
      [4.2, 5.6, 0, 2.3],
    ]);
    S.wallZ("wallpaper_green", -9, -14, -6.6, F2, F3 - 0.3, 0.25);
    S.wallZ("wallpaper_green", 0, -14, -6.6, F2, F3 - 0.3, 0.25);
    S.wallZ("wallpaper_green", 12, -14, -6.6, F2, F3 - 0.3, 0.25);
    E.hangLamp(S, -16, F3 - 0.3, -3, {
      chain: 0.5,
      color: 0xffc880,
      r: 7,
      i: 0.7,
    });
    E.hangLamp(S, 6, F3 - 0.3, -3, {
      chain: 0.5,
      color: 0xffc880,
      r: 7,
      i: 0.7,
      lit: false,
    });
    D.rug(b, -20, -5, 16, -1, F2 + 0.012, "carpet_red");
    // 2A (x -22..-10, z 0..9) and 2B (z 9..18): door 2A→2B locked (Scoop)
    S.wallX("wallpaper_rose", 9, -22, -10, F2, F3 - 0.3, 0.25, [
      [-13.4, -12.2, 0, 2.3],
    ]);
    D.bed(b, -20.4, F2, 4, HP, { w: 1.5, cover: "velvet" });
    D.sofa(b, -14, F2, 7.6, PI, { fabric: "fabric" });
    D.table(b, -15.5, F2, 4.4, { r: 0.5, top: "wood", leg: "wood_dark" });
    E.mattress(b, -12, F2 + 0.01, 2.5, 0.5);
    S.prop("footlocker", -21.4, F2, 7.8, HP, { loot: "footlocker" });
    E.hangLamp(S, -16, F3 - 0.3, 4.5, { chain: 0.5, color: 0xffb070, i: 0.7 });
    // 2B — Scoop's cell: a chair, a bucket, a typewriter the raiders gave him "to write the decree"
    D.chair(b, -17, F2, 13, 0, { seat: "wood", wood: "wood" });
    E.typewriter(b, -17, F2 + 0.77, 14.0, PI);
    D.table(b, -17, F2, 14.0, { rect: [1.2, 0.7], top: "wood", leg: "wood" });
    D.papers(b, -16, F2 + 0.01, 13, 2.5, 18);
    E.hangLamp(S, -16, F3 - 0.3, 13, { chain: 0.8, color: 0xffd0a0, i: 0.6 });
    b.box("glass_dark", -21.85, F2 + 1.2, 11, -21.8, F2 + 3.2, 16, {
      seg: false,
    });
    // the locked door (visual + collider; 80_content removes it on unlock)
    TC.cellDoor = { local: { x: -12.8, y: F2, z: 9 } };
    // 2C raider dorm (x 10..18, z 0..18) — reached from the gallery/corridor through a door at z=0
    S.wallX("wallpaper_green", 0, 10, 18, F2, F3 - 0.3, 0.25, [
      [13.4, 14.8, 0, 2.3],
    ]);
    for (let i = 0; i < 4; i++)
      E.mattress(
        b,
        12.2 + (i % 2) * 3.6,
        F2 + 0.01,
        4 + Math.floor(i / 2) * 5,
        0.2 * i,
      );
    S.prop("locker", 17.5, F2, 9, -HP, { count: 2, loot: "raider" });
    S.prop("barrel", 14, F2, 16.2, 0, { burning: true });
    S.light(14, F2 + 1.5, 16.2, 0xff9a40, 8, 1.0);
    b.box("glass_dark", 17.85, F2 + 1.2, 3, 17.9, F2 + 3.2, 7, { seg: false });
    // 2D the sealed Hollingsworth apartment (x -22..-6, z -14..-6.6): skeleton dinner, locked door
    D.table(b, -15, F2, -10.4, {
      rect: [2.6, 1.2],
      top: "wood_oak",
      leg: "wood_dark",
      cloth: "fabric_white",
    });
    for (const [x, z, r] of [
      [-16.2, -11.4, 0],
      [-13.8, -11.4, 0],
      [-16.2, -9.4, PI],
      [-13.8, -9.4, PI],
    ])
      D.chair(b, x, F2, z, r, { seat: "velvet" });
    for (let i = 0; i < 4; i++)
      b.cyl(
        "paint_white",
        -16 + i * 0.7,
        F2 + 0.76,
        -10.4 + (i % 2 ? 0.3 : -0.3),
        0.14,
        0.12,
        0.03,
        10,
        { noAO: true },
      );
    D.candles(S, -15, F2 + 0.76, -10.4, 3, { r: 4, i: 0.5 });
    D.bookcase(b, -21.6, F2, -10, HP, { w: 1.8 });
    D.fireplace(b, S, -9.4, F2, -10, -HP, { key: "marble" });
    const fam = P.texMat(
      "tc_family",
      P.signTex(
        "tc_family",
        ["THE HOLLINGSWORTHS", "CHRISTMAS 1966"],
        "label",
        512,
        384,
      ),
      { rough: 0.8 },
    );
    b.quad(fam, -18, F2 + 2.2, -13.8, 1.1, 0.8, { ry: 0 });
    // 2E armoury (x 0..12, z -14..-6.2)
    for (let i = 0; i < 3; i++)
      S.prop("ammo_box", 2 + i * 1.3, F2, -13.3, 0, {
        loot: "ammo_box",
        large: i === 1,
      });
    b.box("wood_rotten", 7, F2, -13.8, 11.6, F2 + 2.2, -13.4, { seg: false });
    for (let i = 0; i < 6; i++)
      b.rod(
        "rust",
        [7.4 + i * 0.7, F2 + 0.3, -13.3],
        [7.5 + i * 0.7, F2 + 1.8, -13.5],
        0.04,
        4,
      );
    S.prop("workbench", 3.5, F2, -7.2, PI);
    E.hangLamp(S, 6, F3 - 0.3, -10, {
      chain: 0.6,
      shade: "metal",
      color: 0xffc070,
      i: 0.8,
    });
    // stair 2 (east): F2 → F3, climbing north from z -6.4
    S.stairs("wood_dark", 15, -6.4, "n", 3.6, F2, F3, {
      rail: "wood_dark",
      nosing: "brass",
    });
    S.wallX("plaster_cream", -6.6, 12, 18, F2, F3 - 0.3, 0.25, [
      [13.2, 16.8, 0, 3.4],
    ]);
    // ================= F3: THE COURT (under the timber roof) =================
    S.floor("parquet", -22, -14, 18, -12.9, F3, { under: "wood_dark" });
    S.floor("parquet", -22, -12.9, 13.2, 18, F3, { under: "wood_dark" });
    S.floor("parquet", 16.8, -12.9, 18, 18, F3, { under: "wood_dark" });
    S.floor("parquet", 13.2, -6.5, 16.8, 18, F3, { under: "wood_dark" });
    S.rail(
      "wood_dark",
      [
        [13.2, -12.9],
        [13.2, -6.5],
        [16.8, -6.5],
        [16.8, -12.9],
      ],
      F3,
      1.0,
      { baluster: true, r: 0.06, step: 0.3 },
    );
    // pitched timber roof: purlins + trusses, slate underside
    const RY = F3 + 4.4,
      RH = 3.6;
    for (let x = -21; x <= 17; x += 3.8) {
      for (const s of [-1, 1])
        b.rod("wood_dark", [x, RY, s * 16 + 2], [x, RY + RH, 2], 0.16, 4, {
          square: true,
        });
      b.box("wood_dark", x - 0.18, RY - 0.3, -14, x + 0.18, RY, 18, {
        seg: false,
      });
      b.rod("wood_dark", [x, RY, 2], [x, RY + RH, 2], 0.1, 4, { square: true });
      for (const s of [-1, 1]) {
        b.box(
          "wood_dark",
          x - 0.15,
          F3,
          s * 15.6 + 2 - 0.15,
          x + 0.15,
          RY,
          s * 15.6 + 2 + 0.15,
          { seg: false },
        );
      }
    }
    for (const s of [-1, 1]) {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0);
      sh.lineTo(16.4, 0);
      sh.lineTo(16.4, 0.12);
      sh.lineTo(0, 0.12);
      const L = Math.hypot(16, RH),
        ang = Math.atan2(RH, 16);
      const g = new THREE.BoxGeometry(40, 0.14, L);
      b.geo(
        "slate",
        g,
        new THREE.Matrix4().compose(
          new THREE.Vector3(-2, RY + RH / 2, 2 + s * 8),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(s * ang, 0, 0)),
          new THREE.Vector3(1, 1, 1),
        ),
        { noAO: true, grime: 0.3 },
      );
      void sh;
    }
    S.wallX("plaster_cream", -14, -22, 18, F3, RY, 0.3);
    S.wallX("plaster_cream", 18, -22, 18, F3, RY, 0.3);
    S.wallZ("plaster_cream", -22, -14, 18, F3, RY, 0.3);
    S.wallZ("plaster_cream", 18, -14, 18, F3, RY, 0.3);
    // gable infill triangles (east + west)
    for (const x of [-22, 18]) {
      const gs = new THREE.Shape();
      gs.moveTo(-16, 0);
      gs.lineTo(16, 0);
      gs.lineTo(0, RH);
      gs.closePath();
      b.extrude("plaster_cream", gs, 0.3, P.m4(x - 0.15, RY, 2, HP));
    }
    // the rose window (south wall) — stained glass, lit from outside
    const RWY = F3 + 2.3;
    b.cyl("stained", -2, RWY - 0.03, 17.8, 1.9, 1.9, 0.06, 32, {
      rx: HP,
      uv: "keep",
      noAO: true,
      noBake: true,
    });
    b.torus("limestone", -2, RWY, 17.75, 2.0, 0.16, TAU, { ts: 32, rs: 6 });
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      b.rod(
        "limestone",
        [-2, RWY, 17.72],
        [-2 + Math.cos(a) * 1.9, RWY + Math.sin(a) * 1.9, 17.72],
        0.045,
        4,
      );
    }
    b.cyl("limestone", -2, RWY - 0.03, 17.7, 0.35, 0.35, 0.1, 12, { rx: HP });
    S.light(-2, RWY, 16.2, 0xffb890, 12, 1.0);
    S.glow(-2, RWY, 17.4, 0xffa070, 3.4);
    // the throne dais (north, centre) + banners + trophy heap
    b.box("marble_dark", -4, F3, -13.9, 4, F3 + 0.3, -10.6, { seg: false });
    b.box("marble_dark", -3, F3 + 0.3, -13.9, 3, F3 + 0.6, -11.6, {
      seg: false,
    });
    S.col(-4, F3, -13.9, 4, F3 + 0.3, -10.6);
    S.col(-3, F3 + 0.3, -13.9, 3, F3 + 0.6, -11.6);
    {
      const M = P.m4(0, F3 + 0.6, -13.0, 0);
      b.geo(
        "velvet",
        new THREE.BoxGeometry(1.2, 0.2, 0.9).translate(0, 0.55, 0),
        M,
        { noAO: true },
      );
      b.geo(
        "gold",
        new THREE.BoxGeometry(1.4, 0.5, 1.0).translate(0, 0.22, 0),
        M,
        { noAO: true },
      );
      b.geo(
        "gold",
        new THREE.BoxGeometry(1.4, 2.4, 0.2).translate(0, 1.4, -0.45),
        M,
        { noAO: true },
      );
      b.geo(
        "velvet",
        new THREE.BoxGeometry(1.1, 1.8, 0.05).translate(0, 1.4, -0.33),
        M,
        { noAO: true },
      );
      for (const s of [-1, 1]) {
        b.geo(
          "gold",
          new THREE.BoxGeometry(0.15, 0.6, 0.9).translate(s * 0.68, 0.8, 0),
          M,
          { noAO: true },
        );
        b.geo(
          "gold",
          new THREE.SphereGeometry(0.14, 6, 5).translate(s * 0.68, 2.7, -0.45),
          M,
          { noAO: true },
        );
      }
      b.geo(
        "gold",
        new THREE.ConeGeometry(0.25, 0.6, 5).translate(0, 2.9, -0.45),
        M,
        { noAO: true },
      );
      E.bones(b, 1.8, F3 + 0.6, -12.6, 1.0, 10);
    }
    for (const x of [-6, 6])
      b.geo(
        "tapestry",
        new THREE.PlaneGeometry(2.2, 4.2),
        P.m4(x, F3 + 3.0, -13.82, 0),
        { uv: "keep", noAO: true },
      );
    b.quad(tap, 0, F3 + 4.4, -13.82, 2.6, 3.6, { ry: 0 });
    for (const x of [-3.5, 3.5]) {
      b.cyl("iron", x, F3 + 0.3, -11, 0.04, 0.2, 1.6, 6);
      b.cyl("fire", x, F3 + 1.9, -11, 0.18, 0.08, 0.4, 6);
      S.light(x, F3 + 2.4, -11, 0xff9a40, 8, 1.1);
      S.glow(x, F3 + 2.1, -11, 0xff8a30, 1.0, { flicker: 0.5 });
    }
    // loot hoard + feast table
    D.table(b, 0, F3, 4, {
      rect: [1.6, 8],
      top: "wood_oak",
      leg: "wood_dark",
      cloth: "velvet",
    });
    for (let i = 0; i < 8; i++)
      D.chair(
        b,
        i % 2 ? 1.2 : -1.2,
        F3,
        0.8 + Math.floor(i / 2) * 2.1,
        i % 2 ? -HP : HP,
        { seat: "velvet", arms: true, toppled: i === 5 },
      );
    D.candles(S, 0, F3 + 0.76, 2, 4, { r: 6 });
    D.candles(S, 0, F3 + 0.76, 6, 3, { r: 6 });
    for (let i = 0; i < 6; i++)
      b.cyl(
        i % 2 ? "gold" : "chrome",
        -0.4 + (i % 3) * 0.4,
        F3 + 0.76,
        3 + i * 0.5,
        0.08,
        0.06,
        0.16,
        8,
        { noAO: true },
      );
    D.chandelier(S, 0, RY + 1.0, 4, 1.1, {
      tiers: 2,
      chain: 1.2,
      broken: true,
      color: 0xffc880,
      lr: 12,
      li: 0.9,
    });
    // the Lord Protector's chamber (west end, x -22..-14) behind an oak screen
    S.wallZ("wood_oak", -14, -14, 18, F3, F3 + 3.4, 0.25, [[1, 3, 0, 2.5]]);
    D.bed(b, -19.5, F3, 12, 0, {
      w: 1.9,
      posts: true,
      canopy: "velvet",
      cover: "velvet",
    });
    D.rug(b, -21.5, -4, -15, 8, F3 + 0.013, "carpet_red");
    E.desk(b, -18, F3, -8.5, PI, { w: 1.6, typewriter: false });
    D.chair(b, -18, F3, -9.4, 0, { seat: "velvet", arms: true });
    D.bookcase(b, -21.6, F3, -3, HP, { w: 2 });
    D.fireplace(b, S, -21.8, F3, 4, HP, { key: "limestone", lit: true });
    for (let i = 0; i < 3; i++)
      b.box(
        "newsprint",
        -20.8 + i * 0.1,
        F3 + i * 0.35,
        1.2,
        -20.2 + i * 0.1,
        F3 + 0.33 + i * 0.35,
        1.9,
        { seg: false },
      );
    E.hangLamp(S, -18, RY, -2, {
      chain: 2.2,
      shade: "paint_red",
      color: 0xffa060,
      r: 8,
    });
    // roof stair (ladder-stair up to the roof hatch, NW)
    b.box("wood_dark", -21.4, F3, -13.86, -20.0, F3 + 2.4, -13.8, {
      seg: false,
    });
    b.box("wood_oak", -21.6, F3 + 2.4, -13.9, -19.8, F3 + 2.6, -13.7, {
      seg: false,
    });
    for (const x of [-21.55, -19.85])
      b.box("wood_oak", x - 0.1, F3, -13.9, x + 0.1, F3 + 2.4, -13.7, {
        seg: false,
      });
    for (const y of [0.5, 1.9])
      b.box("iron", -21.3, F3 + y, -13.8, -20.1, F3 + y + 0.08, -13.76, {
        seg: false,
      });
    D.label(
      b,
      "tc_roof",
      ["ROOF"],
      -20.7,
      F3 + 2.85,
      -13.84,
      0.8,
      0.25,
      0,
      "raider",
    );
    TC.roofHatchLocal = { x: -20.7, y: F3 + 1.4, z: -13.4 };
    // service elevator (east) — the shortcut back to the hall
    b.box("brass", 17.7, F3, 3, 17.85, F3 + 3.1, 5, { seg: false });
    b.box("chrome", 17.66, F3 + 0.02, 3.25, 17.72, F3 + 2.6, 4.75, {
      seg: false,
    });
    D.label(
      b,
      "tc_svc3",
      ["SERVICE", "ELEVATOR"],
      17.64,
      F3 + 2.85,
      4.0,
      0.9,
      0.3,
      -HP,
      "brass",
    );
    TC.svcDoorTopLocal = { x: 17.2, y: F3 + 1.5, z: 4.0 };
    // court lights
    for (const [x, z] of [
      [8, -8],
      [8, 10],
      [-10, 10],
      [-10, -8],
    ])
      E.hangLamp(S, x, RY, z, {
        chain: 2.6,
        shade: "iron",
        color: 0xffb060,
        r: 9,
        i: 0.75,
      });
    // ================= props, pickups, terminals =================
    S.prop("terminal", -18, F3 + 0.765, -8.2, 0, {
      terminalId: "pe_tc_lord",
      mount: "bare",
    });
    S.prop("terminal", 16.8, 0, 12.5, -HP, {
      terminalId: "pe_tc_super",
      mount: "own_desk",
    });
    S.prop("safe", -21.4, F2, -7.4, HP, {
      locked: 0,
      lock: P.LOCKS.tc_wall_safe,
      name: "Hollingsworth Wall Safe",
      items: [
        ["scrip", 85],
        ["pe_tc_ring", 1],
        ["old_dollars", 6],
      ],
      wall: true,
    });
    S.prop("cash_register", -17.5, 1.12, 3.9, PI, { loot: "cash_register" });
    S.prop("scrip_stash", -20, F3, 15.8, 0, {
      loot: "raider_boss",
      name: "The Royal Treasury",
    });
    S.prop("footlocker", -15, F3, 15.6, PI, {
      loot: "raider",
      name: "Lord Protector's Chest",
      items: [["pe_tc_key_cell", 1]],
    });
    S.prop("first_aid", 17.85, F2 + 1.3, 12, -HP, { loot: "first_aid" });
    S.prop("ammo_box", 9.4, 0, 16.8, 0.2, { loot: "ammo_box" });
    S.prop("skeleton", -16.2, F2 + 0.45, -11.3, 0, { pose: "seated" });
    S.prop("skeleton", -13.8, F2 + 0.45, -9.5, PI, { pose: "seated" });
    S.prop("skeleton", -16.1, F2 + 0.45, -9.5, PI, { pose: "seated" });
    S.prop("skeleton", -20.2, F2 + 0.55, 4, 0, { pose: "lying" });
    S.prop("teddy_bear", -13.8, F2 + 0.5, -11.4, 0);
    S.pickup("pe_note_decree", 1, -3.4, 0.78, 11.2);
    S.pickup("pe_reel_hollingsworth", 1, -14.6, F2 + 0.78, -10.0);
    S.pickup("pe_note_scoop_notes", 1, -16.6, F2 + 0.78, 14.1);
    S.pickup("rush", 1, -20.1, 0.78, 16.5);
    S.pickup("rage", 1, -19.0, 0.78, 16.3);
    // ================= anchors =================
    S.anchor("entrance", 0, 0, 16.2, 0);
    S.anchor("boss", 0, F3 + 0.6, -11.8, PI);
    S.anchor("throne", 0, F3 + 0.6, -12.6, PI);
    S.anchor("scoop", -17.4, F2, 12.2, PI * 0.6);
    S.anchor("cell_door", -12.8, F2, 8.6, PI);
    S.anchor("spawn1", -4, 0, 12, 0);
    S.anchor("spawn2", 5, 0, 6, 0);
    S.anchor("spawn3", -16, 0, 8, 0);
    S.anchor("spawn4", 4, F2, -3, 0);
    S.anchor("spawn5", 14, F2, 10, 0);
    S.anchor("spawn6", 6, F3, 10, 0);
    S.anchor("loot1", -20, F3, 15.8, 0);
    S.anchor("loot2", -21.4, F2, -7.4, 0);
    S.anchor("loot3", 2, F2, -13.3, 0);
    S.anchor("roof_hatch", -20.7, F3, -11.5, PI);
    S.anchor("svc_top", 16.4, F3, 4.0, -HP);
    S.anchor("svc_bottom", 16.4, 0, 4.0, -HP);
    S.anchor("lord_desk", -18, F3, -9.4, PI);
    S.build({ interior: true });
    return S;
  }

  // ===================================================================
  // builder
  // ===================================================================
