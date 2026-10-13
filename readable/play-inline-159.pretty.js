/* src/poi_uptown/50_tiffany_interior.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 50 Tiffany & Co. — interior
 *
 * INTERIOR (cell 'tiffany', origin 5000,0,1600): the column-free sales
 *   floor under its coffered ceiling (smashed jewellery cases, raider
 *   camp), stairs up to the Silver & Watch floor (the Raider Boss's
 *   throne), the stockroom & security office (time-lock terminal), stairs
 *   down to the basement: an electrified flooded corridor (breaker), the
 *   round vault door (boss's key / time-lock override) and the vault
 *   of the Great Heist of '67 — and a service tunnel out to 57th Street.
 * EXTERIOR: see 50_tiffany.js (its builder calls P.interiorBuilders.tiffany below).
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
  const FLOOR_Y = 5;
  function buildInterior() {
    const O = P.I("tiffany");
    const S = P.site("tiffany_int", {
      ox: O.x,
      oy: O.y + FLOOR_Y,
      oz: O.z,
      lit: true,
      ambient: 0x606468,
      ambI: 0.3,
      interiorKey: "tiffany",
    });
    const b = S.b;
    const H1 = 6.5,
      F2 = 6.8;
    // ---------------- vestibule ----------------
    S.room({
      x0: -3,
      z0: 26,
      x1: 3,
      z1: 30,
      y: 0,
      h: 5,
      wall: "marble_dark",
      floor: "terrazzo",
      ceil: "chrome",
      skip: "n",
    });
    b.box("chrome", -1.9, 0, 29.8, 1.9, 4.6, 29.85, { seg: false });
    D.exitDoor(S, 0, 0, 29.78, PI, {
      noLeaves: true,
      frame: "chrome",
      w: 3.8,
      h: 4.3,
      signY: 4.62,
      text: "EXIT",
      sub: "FIFTH AVENUE",
    });
    S.anchor("entrance", 0, 0, 27.6, 0);
    // ---------------- sales floor ----------------
    S.floor("terrazzo", -16, 0, 16, 26, 0);
    S.wallX("plaster_cream", 26, -16.15, 16.15, 0, H1, 0.3, [[-3, 3, 0, 4.6]]);
    S.wallX("plaster_cream", 0, -16.15, 16.15, 0, H1, 0.3, [
      [-14, -11, 0, 2.6],
    ]);
    S.wallZ("plaster_cream", -16, 0, 26, 0, H1, 0.3, []);
    S.wallZ("plaster_cream", 16, 0, 26, 0, H1, 0.3, []);
    for (const [x0, z0, x1, z1] of [
      [-15.85, 0.15, -15.75, 25.85],
      [15.75, 0.15, 15.85, 25.85],
      [-15.85, 0.15, -14, 0.25],
      [-11, 0.15, 15.85, 0.25],
      [-15.85, 25.75, -3, 25.85],
      [3, 25.75, 15.85, 25.85],
    ]) /* split at the doorways (a full-length dado walled off the entrance) */ {
      b.box("wood_dark", x0, 0, z0, x1, 2.4, z1, { segLen: 2 });
      b.box("chrome", x0, 2.4, z0, x1, 2.46, z1, { seg: false });
    }
    // coffered ceiling with cove lighting
    S.ceil("plaster_cream", -16, 0, 16, 26, H1, { t: 0.3 });
    for (let x = -12; x <= 12; x += 4)
      b.box("plaster_cream", x - 0.2, H1 - 0.6, 0.3, x + 0.2, H1, 25.7, {
        seg: false,
      });
    for (let z = 3; z <= 23; z += 4)
      b.box("plaster_cream", -15.7, H1 - 0.6, z - 0.2, 15.7, H1, z + 0.2, {
        seg: false,
      });
    for (let x = -14; x <= 14; x += 4)
      for (let z = 5; z <= 21; z += 4) {
        const dead = (x * 3 + z) % 5 === 0;
        b.box(
          dead ? "glass_dark" : "lamp_dim",
          x - 0.5,
          H1 - 0.05,
          z - 0.5,
          x + 0.5,
          H1 - 0.02,
          z + 0.5,
          { seg: false },
        );
        if (!dead) S.light(x, H1 - 0.8, z, 0xf0f4ff, 8, 0.75);
      }
    // rows of jewellery cases (most smashed)
    const cases = [];
    for (const x of [-10, -4, 4, 10])
      for (const z of [6, 12, 18]) cases.push([x, z]);
    cases.forEach(([x, z], i) => {
      const smashed = i % 5 !== 2;
      D.case(b, x, 0, z, 3.4, 0.9, 0, {
        base: "wood_dark",
        velvet: "tiffany",
        smashed,
        goods: smashed ? 0 : 6,
      });
      S.col(x - 1.7, 0, z - 0.45, x + 1.7, 1.3, z + 0.45, { walkable: false });
      if (smashed) D.shards(b, x, 0, z + 0.9, 1.2, 8);
      S.container(
        i % 5 === 2 ? "Jewellery Case (intact)" : "Smashed Display Case",
        x,
        0.95,
        z,
        {
          items:
            i % 5 === 2
              ? [
                  ["pu_tiffany_ring", 1],
                  ["scrip", 12],
                ]
              : i % 3 === 0
                ? [["pu_diamond_chip", 1]]
                : [["scrip", 3 + i]],
          locked: 0,
          owner: null,
        },
      );
    });
    // elevator bank (brass doors) on the north wall
    for (const x of [-7, 7]) {
      b.box("gold", x - 1.0, 0, 0.16, x + 1.0, 2.6, 0.2, { seg: false });
      b.box("glass_dark", x - 0.02, 0, 0.21, x + 0.02, 2.6, 0.22, {
        seg: false,
      });
      b.box("gold", x - 1.2, 2.7, 0.15, x + 1.2, 3.1, 0.25, { seg: false });
    }
    // raider camp: barricade inside the door, mattresses, fire drum, trophies
    for (let k = 0; k < 6; k++)
      b.boxC(
        k % 2 ? "rust" : "panel",
        -5 + k * 1.6 + (k > 2 ? 3.2 : 0),
        0,
        23.5,
        1.4,
        1.6 + (k % 3) * 0.3,
        0.1,
        { ry: (k - 2.5) * 0.08, seg: false, grime: 0.8 },
      );
    S.col(-5.7, 0, 23.3, -0.9, 1.6, 23.7, { walkable: false });
    S.col(1.6 + 0.4, 0, 23.3, 8.1, 1.6, 23.7, { walkable: false });
    for (const [x, z, r] of [
      [-13, 22, 0.3],
      [-13.2, 19, -0.2],
      [13, 3, 1.2],
    ])
      S.prop("mattress", x, 0, z, r, {});
    S.prop("barrel", -6, 0, 20.5, 0, { burning: true });
    S.light(-6, 1.8, 20.5, 0xff8a30, 10, 1.1);
    for (let k = 0; k < 4; k++) {
      b.cyl("iron", 14.5, 0, 8 + k * 1.4, 0.02, 0.1, 1.5, 5);
      b.sphere("paint_white", 14.5, 1.62, 8 + k * 1.4, 0.13, { sy: 1.2 });
      b.torus("gold", 14.5, 1.5, 8 + k * 1.4, 0.14, 0.015, TAU, {
        rx: HP,
        ts: 10,
        rs: 3,
      });
    }
    const gr = P.texMat(
      "tif_graf3",
      P.signTex(
        "tif_graf3",
        ["DIAMONDS ARE", "A RAIDERS BEST FRIEND"],
        "raider",
        512,
        256,
      ),
      { transparent: true },
    );
    b.quad(gr, 15.83, 3.2, 14, 4.2, 2.1, { ry: -HP });
    const gr4 = P.texMat(
      "tif_graf4",
      P.signTex(
        "tif_graf4",
        ["BOSS UPSTAIRS", "KNOCK FIRST"],
        "raider",
        512,
        256,
        { fg: "#e8d020" },
      ),
      { transparent: true },
    );
    b.quad(gr4, 15.83, 2.8, 21.5, 2.4, 1.2, { ry: -HP });
    D.papers(b, 0, 0, 12, 10, 24);
    for (let k = 0; k < 20; k++) {
      const rn = P.rng(k * 7.7);
      b.box(
        "tiffany",
        -12 + rn() * 24,
        0,
        2 + rn() * 22,
        -12 + rn() * 24 + 0.25,
        0.18,
        2 + rn() * 22 + 0.25,
        { ry: rn() * 3, seg: false },
      );
    } // scattered blue boxes
    S.prop("ammo_box", 12.6, 0, 2.5, 0, { loot: "ammo_box" });
    S.prop("footlocker", -14.8, 0, 16, HP, { loot: "raider_stash" });
    S.anchor("sales_floor", 0, 0, 14, 0);
    S.anchor("spawn1", -8, 0, 20, 0);
    S.anchor("spawn2", 8, 0, 9, 0);
    // stairs up (east side)
    S.stairs("terrazzo", 14, 20.6, "n", 3, 0, F2, {
      rail: "chrome",
      railSides: [-1],
    });
    // ---------------- Silver & Watch floor (y F2) ----------------
    S.floor("parquet", -16, 0, 16, 11.8, F2, { t: 0.3, surface: "wood" });
    S.floor("parquet", -16, 11.8, 12.4, 26, F2, { t: 0.3, surface: "wood" });
    S.floor("parquet", 12.4, 20.8, 16, 26, F2, { t: 0.3, surface: "wood" });
    S.ceil("plaster", -16, 0, 16, 26, F2 + 4.2);
    S.wallX("marble_green", 26, -16.15, 16.15, F2, F2 + 4.2, 0.3, []);
    S.wallX("marble_green", 0, -16.15, 16.15, F2, F2 + 4.2, 0.3, []);
    S.wallZ("marble_green", -16, 0, 26, F2, F2 + 4.2, 0.3, []);
    S.wallZ("marble_green", 16, 0, 26, F2, F2 + 4.2, 0.3, []);
    S.rail(
      "chrome",
      [
        [12.4, 11.8],
        [12.4, 20.8],
      ],
      F2,
      1.0,
      { r: 0.035 },
    );
    // windows over Fifth Avenue (boarded, daylight slits)
    for (let z = 3; z <= 23; z += 4) {
      b.box(
        "glass_dark",
        -15.84,
        F2 + 1.0,
        z - 0.8,
        -15.82,
        F2 + 3.2,
        z + 0.8,
        { seg: false },
      );
      for (let k = 0; k < 4; k++)
        b.box(
          "wood_rotten",
          -15.8,
          F2 + 1.1 + k * 0.55,
          z - 1,
          -15.7,
          F2 + 1.3 + k * 0.55,
          z + 1,
          { seg: false, rx: k % 2 ? 0.05 : -0.05 },
        );
      S.light(-15, F2 + 2, z, 0xc8d0d8, 5, 0.35);
    }
    // the Boss's throne: stacked display cases, a sofa, a crown of silverware, the big sign
    b.box("wood_dark", -6, F2, 1.2, 6, F2 + 0.6, 5.5, { segLen: 2 });
    S.col(-6, F2, 1.2, 6, F2 + 0.6, 5.5, { surface: "wood" });
    S.stairs("wood_dark", 0, 6.7, "n", 3, F2, F2 + 0.6, { run: 0.4 });
    D.sofa(b, 0, F2 + 0.6, 2.3, 0, { fabric: "tiffany", w: 2.4 });
    for (const s of [-1, 1]) {
      D.case(b, s * 4.2, F2 + 0.6, 3, 2.2, 0.9, HP, {
        base: "wood_dark",
        velvet: "tiffany",
        smashed: false,
        goods: 8,
      });
    }
    const tsign = P.texMat(
      "tif_throne",
      P.signTex("tif_throne", ["TIFFANY & CO."], "gilt", 1024, 160, {
        font: P.FONTS.SERIF,
      }),
      { rough: 0.4 },
    );
    b.quad(tsign, 0, F2 + 2.8, 0.18, 5.5, 0.85, { ry: 0 });
    for (let k = 0; k < 30; k++) {
      const rn = P.rng(k * 3.1);
      b.box(
        rn() < 0.5 ? "chrome" : "gold",
        -5 + rn() * 10,
        F2 + 0.6,
        1.4 + rn() * 1.2,
        -5 + rn() * 10 + 0.3,
        F2 + 0.6 + 0.05 + rn() * 0.2,
        1.4 + rn() * 1.2 + 0.08,
        { ry: rn() * 3, seg: false },
      );
    }
    S.light(0, F2 + 3.2, 4, 0xffd8a0, 10, 1.0);
    D.candles(S, -3, F2 + 0.6, 4.8, 4, { r: 5, i: 0.8 });
    D.candles(S, 3, F2 + 0.6, 4.8, 4, { r: 5, i: 0.8 });
    // bunks, a workbench, chem table
    for (let k = 0; k < 4; k++)
      S.prop("mattress", -13 + k * 2.4, F2, 23.5, 0.1 * k, {});
    S.prop("workbench", 13.5, F2, 24.8, PI, {});
    D.table(b, -10, F2, 14, { rect: [2, 1], top: "wood_rotten", leg: "rust" });
    for (let k = 0; k < 5; k++)
      b.cyl("glass_dark", -10.6 + k * 0.3, F2 + 0.75, 14, 0.035, 0.04, 0.2, 6);
    S.prop("barrel", -10, F2, 18, 0, { burning: true });
    S.light(-10, F2 + 1.8, 18, 0xff8a30, 9, 1.0);
    for (const [x, on] of [
      [-9, 1],
      [-3, 0],
      [3, 1],
      [9, 1],
    ]) {
      b.box(
        on ? "lamp" : "glass_dark",
        x - 1.0,
        F2 + 4.08,
        13.9,
        x + 1.0,
        F2 + 4.14,
        14.1,
        { seg: false },
      );
      if (on) S.light(x, F2 + 3.4, 14, 0xe8f0e0, 7, 0.5);
    } // fluorescent strips (one dead)
    S.light(0, F2 + 3.5, 14, 0xe8e8f0, 12, 0.5);
    S.prop("safe", 15.3, F2, 2, -HP, {
      locked: 0,
      lock: P.LOCKS.watch_safe,
      name: "Watch Department Safe",
      items: [
        ["scrip", 140],
        ["pu_diamond_chip", 2],
        ["rally_tonic", 1],
      ],
    });
    S.anchor("boss", 0, F2 + 0.6, 3.3, PI);
    S.anchor("spawn3", -8, F2, 20, 0);
    S.anchor("spawn4", 8, F2, 16, PI);
    S.anchor("silver_floor", 0, F2, 14, 0);
    // ---------------- stockroom & security (ground, north-west) ----------------
    S.room({
      x0: -16,
      z0: -14,
      x1: -4,
      z1: 0,
      y: 0,
      h: 4,
      wall: "plaster",
      floor: "concrete",
      ceil: "concrete",
      skip: "sf",
      holes: { e: [[-6, -4, 0, 2.4]] },
    });
    S.floor("concrete", -12.9, -14, -4, 0, 0);
    S.floor("concrete", -16, -7.4, -12.9, 0, 0);
    for (let z = -12; z <= -4; z += 4) {
      b.box("steel", -12.5, 0, z - 0.3, -6.5, 2.4, z + 0.3, { seg: false });
      for (let s = 0; s < 4; s++) {
        b.box(
          "steel",
          -12.5,
          0.2 + s * 0.6,
          z - 0.32,
          -6.5,
          0.23 + s * 0.6,
          z + 0.32,
          { seg: false },
        );
        for (let k = 0; k < 8; k++)
          if ((k + s + z) % 3)
            b.box(
              "tiffany",
              -12.3 + k * 0.72,
              0.23 + s * 0.6,
              z - 0.2,
              -11.9 + k * 0.72,
              0.5 + s * 0.6,
              z + 0.2,
              { seg: false },
            );
      }
      S.col(-12.5, 0, z - 0.32, -6.5, 2.4, z + 0.32, { walkable: false });
    }
    S.prop("desk", -5.2, 0, -12.8, 0, { loot: "desk", name: "Security Desk" });
    S.prop("terminal", -5.2, 0.78, -13.0, 0, {
      terminalId: "pu_tiffany_security",
      mount: "bare",
    });
    S.prop("locker", -4.6, 0, -9.5, -HP, {
      loot: "locker",
      name: "Guard Locker",
    });
    b.box("panel", -4.3, 1.4, -7.4, -4.2, 2.4, -5.8, { seg: false });
    for (let k = 0; k < 4; k++)
      b.box(
        "screen",
        -4.33,
        1.5 + (k >> 1) * 0.45,
        -7.3 + (k % 2) * 0.75,
        -4.31,
        1.85 + (k >> 1) * 0.45,
        -6.7 + (k % 2) * 0.75,
        { seg: false },
      );
    b.box("lamp", -11, 3.95, -8, -9, 4.0, -7.8, { seg: false });
    S.light(-10, 3.3, -8, 0xe0f0e0, 8, 0.7);
    S.prop("skeleton", -8, 0, -2, 0.5, { pose: "lying" });
    S.pickup("pu_note_guard", 1, -7.5, 0.02, -1.4);
    S.anchor("security", -5.2, 0, -11, PI);
    S.anchor("spawn5", -8, 0, -6, 0);
    // stair down to the basement (x -15.5..-13, north-bound descent)
    S.stairs("concrete", -14.25, -13.9, "s", 2.4, -5, 0, {
      rail: "iron",
      railSides: [1],
    });
    S.wallZ("concrete", -16, -20, -7.4, -5, 0, 0.3, []);
    S.wallZ("concrete", -12.9, -13.9, -7.4, -5, 0, 0.3, []);
    S.wallX("concrete", -7.4, -16, -12.9, -5, 0, 0.3, []);
    S.rail(
      "iron",
      [
        [-12.9, -7.4],
        [-12.9, -14],
      ],
      0,
      1.0,
      { r: 0.03 },
    );
    // ---------------- basement (y -5) ----------------
    const BY = -5;
    b.ground = BY;
    S.room({
      x0: -16,
      z0: -20,
      x1: -12.9,
      z1: -13.9,
      y: BY,
      h: 5,
      wall: "concrete",
      floor: "concrete",
      ceil: "concrete",
      skip: "sewc",
    });
    S.room({
      x0: -12.9,
      z0: -18,
      x1: -4,
      z1: -12,
      y: BY,
      h: 3.4,
      wall: "concrete",
      floor: "concrete",
      ceil: "concrete",
      skip: "we",
    });
    S.wallZ("concrete", -12.9, -12, -13.9, BY, BY + 3.4, 0.3, []);
    // flooded, electrified corridor
    const puddle = new THREE.Mesh(
      new THREE.PlaneGeometry(8.4, 5.6).rotateX(-HP),
      new THREE.MeshStandardMaterial({
        color: 0x0c1418,
        roughness: 0.05,
        metalness: 0.7,
        transparent: true,
        opacity: 0.85,
      }),
    );
    puddle.position.set(S.ox - 8.45, S.oy + BY + 0.04, S.oz - 15);
    S.root.add(puddle);
    b.box("rust", -12.5, BY + 2.7, -17.6, -4.5, BY + 2.9, -17.4, {
      seg: false,
    });
    b.rod("rubber", [-9.5, BY + 2.7, -17.5], [-9.2, BY + 0.05, -15.5], 0.03, 4);
    b.box("panel", -14.9, BY + 1.2, -19.84, -14.1, BY + 2.2, -19.7, {
      seg: false,
    });
    b.box("lamp_red", -14.6, BY + 2.0, -19.7, -14.4, BY + 2.1, -19.66, {
      seg: false,
    });
    b.rod(
      "rubber",
      [-14.5, BY + 2.2, -19.8],
      [-12.9, BY + 2.7, -17.5],
      0.03,
      4,
    );
    S.light(-14.5, BY + 2.4, -18.5, 0xff4030, 4, 0.5);
    S.light(-9, BY + 2.4, -15, 0x9ab8ff, 7, 0.6);
    S.anchor("breaker", -14.5, BY, -19.45, 0);
    S.anchor("puddle", -9, BY, -15, 0);
    // vault anteroom + the round door
    S.room({
      x0: -4,
      z0: -20,
      x1: 8,
      z1: -8,
      y: BY,
      h: 4.2,
      wall: "marble_dark",
      floor: "terrazzo",
      ceil: "concrete",
      holes: {
        w: [[-16, -14, 0, 2.6]],
        n: [[0, 4, 0, 4.0]],
        e: [[-12, -9.6, 0, 2.6]],
      },
    });
    {
      const fr = new THREE.Shape();
      fr.moveTo(-2.3, 0);
      fr.lineTo(2.3, 0);
      fr.lineTo(2.3, 4.2);
      fr.lineTo(-2.3, 4.2);
      fr.closePath();
      const hole = new THREE.Path();
      hole.absarc(0, 2.0, 2.0, 0, TAU, true);
      fr.holes.push(hole);
      b.extrude("steel", fr, 0.5, P.m4(2, BY, -20.3), { curve: 24 });
      b.torus("chrome", 2, BY + 2.0, -19.78, 2.02, 0.08, TAU, {
        ts: 32,
        rs: 4,
      });
    }
    b.box("lamp_green", 5.2, BY + 1.6, -19.85, 5.5, BY + 2.1, -19.8, {
      seg: false,
    });
    const tl = P.texMat(
      "tif_timelock",
      P.signTex(
        "tif_timelock",
        ["MOSLER TIME LOCK", "DO NOT TAMPER"],
        "brass",
        512,
        128,
      ),
      { rough: 0.4, metal: 0.5 },
    );
    b.quad(tl, 2, BY + 4.35 - 0.2, -19.85, 1.8, 0.45, { ry: 0 });
    S.light(2, BY + 3.4, -14, 0xffe0b0, 9, 0.8);
    D.sconce(S, -3.83, BY + 2.3, -14, HP, { r: 5, i: 0.5 });
    D.sconce(S, 7.83, BY + 2.3, -14, -HP, { r: 5, i: 0.5 });
    S.anchor("vault_door", 2, BY, -17.5, 0);
    S.anchor("spawn6", 3, BY, -11, 0);
    // the vault (behind the door): deposit boxes, gold, the Atlas Diamond, the '67 heist crew
    S.room({
      x0: -4,
      z0: -32,
      x1: 8,
      z1: -20,
      y: BY,
      h: 3.6,
      wall: "steel",
      floor: "panel",
      ceil: "steel",
      skip: "s",
      surface: "metal",
    });
    for (const x of [-3.7, 7.7])
      for (let k = 0; k < 48; k++) {
        const z = -31.5 + (k % 12) * 0.95,
          y = BY + 0.2 + Math.floor(k / 12) * 0.8;
        const open = (k * 7) % 11 === 3,
          sd = x < 0 ? 1 : -1;
        b.box(
          open ? "glass_dark" : k % 3 ? "steel" : "chrome",
          x - 0.05,
          y,
          z - 0.42,
          x + 0.05,
          y + 0.72,
          z + 0.42,
          { seg: false },
        );
        if (!open) {
          b.box(
            "gold",
            x + sd * 0.05,
            y + 0.3,
            z - 0.07,
            x + sd * 0.07,
            y + 0.42,
            z + 0.07,
            { seg: false },
          );
          b.box(
            "gold",
            x + sd * 0.05,
            y + 0.62,
            z - 0.3,
            x + sd * 0.065,
            y + 0.66,
            z + 0.3,
            { seg: false },
          );
        } else
          b.box(
            "steel",
            x + sd * 0.05,
            y,
            z + 0.4,
            x + sd * 0.65,
            y + 0.72,
            z + 0.44,
            { seg: false, ry: sd * 0.3 },
          );
      }
    for (let k = 0; k < 4; k++)
      S.container(
        "Safety Deposit Box " + (1204 + k * 17),
        k < 2 ? -3.4 : 7.4,
        BY + 0.9 + (k % 2) * 0.8,
        -28 + k * 2.2,
        {
          items: [
            [
              ["old_dollars", "scrip", "gold_bar", "pu_diamond_chip"][k],
              [8, 60, 1, 2][k],
            ],
          ],
          locked: 0,
          lock: k === 2 ? P.LOCKS.deposit_1238 : undefined,
        },
      );
    // gold bars on carts
    for (const x of [-1, 5]) {
      b.box("steel", x - 0.8, BY, -26, x + 0.8, BY + 0.7, -24.8, {
        seg: false,
      });
      for (let k = 0; k < 9; k++)
        b.box(
          "gold",
          x - 0.6 + (k % 3) * 0.4,
          BY + 0.7 + Math.floor(k / 3) * 0.1,
          -25.7,
          x - 0.3 + (k % 3) * 0.4,
          BY + 0.78 + Math.floor(k / 3) * 0.1,
          -25.1,
          { seg: false },
        );
      S.col(x - 0.8, BY, -26, x + 0.8, BY + 0.9, -24.8, { walkable: false });
    }
    S.container("Bullion Cart", -1, BY + 0.8, -25.4, {
      items: [["gold_bar", 2]],
    });
    // the Atlas Diamond under a glass dome
    b.cyl("marble_dark", 2, BY, -30, 0.5, 0.6, 1.1, 12);
    b.sphere("glass", 2, BY + 1.1, -30, 0.35, { t0: 0, tl: HP });
    S.light(2, BY + 3, -30, 0xfff0c0, 6, 1.2);
    S.glow(2, BY + 1.3, -30, 0xffe890, 0.5);
    S.col(1.4, BY, -30.6, 2.6, BY + 1.1, -29.4, { walkable: false });
    S.pickup("pu_atlas_diamond", 1, 2, BY + 1.12, -30);
    // the heist crew who never got out
    S.prop("skeleton", -2, BY, -22.5, 0.4, { pose: "sitting" });
    S.prop("skeleton", 6, BY, -28, 2.2, { pose: "lying" });
    S.prop("skeleton", 3.5, BY, -22, 1.2, { pose: "curled" });
    S.prop("duffle_bag", -1.5, BY, -23.4, 0.7, {
      loot: "duffle_bag",
      items: [
        ["old_dollars", 12],
        ["scrap_metal", 5],
        ["shade_field", 1],
      ],
    });
    S.pickup("pu_reel_heist", 1, -1.6, BY + 0.02, -22.0);
    S.light(2, BY + 3, -24, 0xd0d8ff, 9, 0.55);
    S.anchor("vault", 2, BY, -25, PI);
    // service tunnel east → 57th Street
    S.room({
      x0: 8,
      z0: -12,
      x1: 20,
      z1: -9.6,
      y: BY,
      h: 2.8,
      wall: "concrete",
      floor: "concrete",
      ceil: "concrete",
      skip: "w",
    });
    b.box("steel", 19.7, BY, -11.8, 19.85, BY + 2.4, -9.8, { seg: false });
    const svc = P.texMat(
      "tif_service",
      P.signTex(
        "tif_service",
        ["SERVICE ENTRANCE", "57th STREET"],
        "label",
        512,
        160,
      ),
      { rough: 0.8 },
    );
    b.quad(svc, 19.6, BY + 2.55, -10.7, 1.2, 0.38, { ry: -HP });
    S.light(15, BY + 2.3, -10.8, 0xff4030, 5, 0.6);
    S.anchor("service", 18.8, BY, -10.8, HP);
    S.build({ interior: true });
    P.addInterior("tiffany", S.root);
    // the vault door leaf (separate mesh so it can swing open) + its collider
    const leaf = new THREE.Group();
    leaf.position.set(S.ox + 4.25, S.oy + BY, S.oz - 20.1);
    leaf.name = "tif_vault_leaf";
    {
      const lb = new P.Batch("tif_leaf", {
        lit: true,
        ambient: 0x606468,
        ambI: 0.5,
      });
      lb.cyl("steel", -2.25, 2.0, 0, 1.95, 1.95, 0.9, 32, { rx: HP });
      lb.cyl("chrome", -2.25, 2.0, 0.46, 0.5, 0.5, 0.1, 16, { rx: HP });
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + 0.4;
        lb.rod(
          "chrome",
          [-2.25, 2.0, 0.55],
          [-2.25 + Math.cos(a) * 0.75, 2.0 + Math.sin(a) * 0.75, 0.55],
          0.05,
          5,
        );
      }
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * TAU;
        lb.cyl(
          "chrome",
          -2.25 + Math.cos(a) * 1.7,
          2.0 + Math.sin(a) * 1.7,
          -0.5,
          0.09,
          0.09,
          0.3,
          6,
          { rx: HP },
        );
      }
      lb.box("steel", -0.3, 0.6, -0.2, 0.1, 3.4, 0.2, { seg: false });
      lb.light(-2.25, 2, 2.5, 0xffe0b0, 6, 0.8);
      lb.build(leaf);
    }
    S.root.add(leaf);
    const leafCol = S.col(-0.3, BY, -20.5, 4.3, BY + 4.0, -19.6, {
      walkable: false,
    });
    // electrified water (hazard) + the breaker
    P.tiffany = {
      leaf,
      leafCol,
      open: false,
      powered: true,
      puddle,
      hazard: { x: S.ox - 8.45, y: S.oy + BY, z: S.oz - 15, hx: 4.2, hz: 2.8 },
      t: 0,
      sparkT: 0,
    };
    return S;
  }

  // ===================================================================
  // Street <-> interior doors & registration — called by 50_tiffany.js's builder right
  // after buildExterior() (E = its site context).
  // ===================================================================
  P.interiorBuilders.tiffany = function (EX) {
    const E = EX.S;
    const I = buildInterior();
    const O = P.I("tiffany");
    E.door(
      EX.X0 - 0.6,
      1.6,
      EX.DZ,
      "Tiffany & Co.",
      { x: O.x, y: O.y + FLOOR_Y, z: O.z + 27.6, yaw: 0 },
      {
        radius: 1.8,
        onEnter: () => P.safe("disc", () => G.discover("tiffany")),
      },
    );
    I.door(
      0,
      1.5,
      29.6,
      "Fifth Avenue",
      { x: EX.X0 - 3.4, y: 0, z: EX.DZ, yaw: HP },
      { verb: "Exit", radius: 1.6 },
    );
    // service entrance: barred from inside until you leave that way
    const svc = P.barDoor(
      E.door(
        149.5,
        1.4,
        -373.7,
        "Tiffany & Co. — Service Entrance",
        { x: O.x + 18.4, y: O.y + FLOOR_Y - 5, z: O.z - 10.8, yaw: HP },
        { id: "pu_tiffany_service", radius: 1.3 },
      ),
      {
        message: "The service door is bolted from the inside.",
        lockText: "Bolted from the inside",
        unbarMessage: "You slide back the bolts on the service door.",
      },
    );
    I.door(
      19.6,
      -5 + 1.4,
      -10.8,
      "57th Street",
      { x: 149.5, y: 0, z: -371.0, yaw: PI },
      { verb: "Exit", radius: 1.3, onEnter: () => svc.unbar() },
    );
    // exterior service door visual
    const b = E.b;
    void b;
    P.register("tiffany", {
      root: E.root,
      interiorRoot: I.root,
      interiorKey: "tiffany",
      anchors: Object.assign({}, E.anchors, I.anchors),
      doors: { svc },
    });
  };
})();
