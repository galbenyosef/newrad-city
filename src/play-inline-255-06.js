// play-inline-255 06 — anchors
// Lines 1106-1360 of readable/play-inline-255.pretty.js (statement-aligned).
  function dress(b, anchors) {
    const d = Q.deck,
      k = Q.kiosk;
    // brick stair-head kiosk on the deck (door on its east face → Bridgemarket roof stair)
    K.room(
      b,
      "brick_dark",
      k.x0,
      k.z0,
      k.x1,
      k.z1,
      d,
      d + 3.2,
      0.3,
      [{ side: "e", c: (k.z0 + k.z1) / 2, w: 1.4, h: 2.3 }],
      {},
    );
    b.boxMM(
      "corrugated",
      k.x0 - 0.3,
      d + 3.2,
      k.z0 - 0.3,
      k.x1 + 0.3,
      d + 3.4,
      k.z1 + 0.3,
      { seg: false, grime: 0.7 },
    );
    b.boxMM(
      "paint_teal",
      k.x1 - 0.2,
      d,
      (k.z0 + k.z1) / 2 - 0.65,
      k.x1 - 0.1,
      d + 2.25,
      (k.z0 + k.z1) / 2 + 0.65,
      { seg: false, grime: 0.6 },
    );
    const ks = PF.texMat(
      "qb_kiosk",
      PF.signTex("qb_kiosk", ["BRIDGEMARKET", "STAIRS ↓"], "enamel", 512, 256, {
        bg: "#1d4a3a",
      }),
      { rough: 0.8 },
    );
    b.quad(ks, k.x1 + 0.02, d + 2.75, (k.z0 + k.z1) / 2, 1.6, 0.8, { ry: HP });
    anchors.deck_hatch = PF.anchor(k.x1 + 1.6, d, (k.z0 + k.z1) / 2, -HP);
    BK.lamp(b, k.x1 + 1, d, k.z1 + 0.6, 0, true);
    // settler barricade with a gate across the main deck at x 334
    PF.scrapWall(b, 334, -440.2, 334, -437.2, 2.2, { y: d, seed: 11 });
    PF.scrapWall(b, 334, -432.8, 334, -429.8, 2.2, { y: d, seed: 12 });
    PF.sandbags(b, 336, -437, 336, -433, 3, { y: d });
    PF.barrel(b, 331.5, d, -438.5, { fire: true });
    const tollTex = PF.texMat(
      "qb_toll",
      PF.signTex(
        "qb_toll",
        ["BRIDGEMARKET", "NO RAIDERS · NO BRUTES", "NO EXCEPTIONS"],
        "raider",
        512,
        256,
        { bg: "#4a4638", fg: "#e8d8a0" },
      ),
      { rough: 0.9 },
    );
    b.quad(tollTex, 334.1, d + 1.4, -438.7, 2.6, 1.3, { ry: HP });
    // wrecked traffic of 1967
    PF.car(b, 352, d, -433.2, HP + 0.25, { seed: 1 });
    PF.car(b, 364, d, -437.2, HP - 0.1, { seed: 2, paint: "paint_cream" });
    PF.car(b, 393, d, -432.8, HP + 0.6, { seed: 3, flipped: true });
    PF.car(b, 418, d, -437, HP, { seed: 4 });
    PF.car(b, 447, d, -433.5, HP - 0.3, { seed: 5, paint: "rust" });
    PF.car(b, 462, d, -427, HP + 0.1, { seed: 6 });
    PF.car(b, 486.5, d + 0.3, -436.5, HP, { seed: 7, tilt: -0.22 });
    PF.skeleton(b, 366.5, d + 0.02, -439, 0.4);
    PF.skeleton(b, 431, d + 0.02, -443.5, 2.1);
    // box truck
    b.boxMM("paint_cream", 432, d + 0.7, -438.4, 441, d + 3.9, -435.6, {
      grime: 0.7,
      seg: false,
    });
    b.boxMM("paint_red", 441, d + 0.7, -438.2, 443.6, d + 2.9, -435.8, {
      grime: 0.7,
      seg: false,
    });
    for (const x of [434, 439.5, 442.6])
      for (const z of [-438.5, -435.5])
        b.cyl("tire", x, d + 0.45, z, 0.45, 0.45, 0.3, 10, { rx: HP, hSeg: 1 });
    PF.colMM(432, d, -438.4, 443.6, d + 3.9, -435.6, {
      walkable: true,
      surface: "metal",
    });
    const nk = PF.texMat(
      "qb_truck",
      PF.signTex(
        "qb_truck",
        ["FIZZO COLA", "ZAP THAT THIRST!"],
        "enamel",
        512,
        192,
        { bg: "#b02a20", fg: "#f4ecd8" },
      ),
      { rough: 0.8 },
    );
    b.quad(nk, 436.5, d + 2.4, -435.55, 7.5, 2.4, { grime: 0.4 });
    b.quad(nk, 436.5, d + 2.4, -438.45, 7.5, 2.4, { ry: PI, grime: 0.4 });
    // lamp standards along the south parapet (lit near the market)
    for (let x = 306; x < Q.brk - 5; x += 22)
      BK.lamp(b, x, d, -424.9, PI, x < 360);
    for (let x = 384; x < Q.brk - 5; x += 22)
      BK.lamp(b, x, d, -445.2, 0, false);
    // highway sign over the ramp foot
    const hs = PF.texMat(
      "qb_hwy",
      PF.signTex(
        "qb_hwy",
        ["QUEENSBORO BRIDGE", "59TH ST · TO QUEENS"],
        "enamel",
        1024,
        320,
        { bg: "#1f5a3c" },
      ),
      { rough: 0.7 },
    );
    BK.gantry(b, 302.5, 0, -446, -441.6, 5.2, hs, 4.2, 1.4, -HP);
    // ramp-top checkpoint posts and a painted notice
    for (const zz of [-445.2, -442.1])
      b.box("rust", 374, d, zz, 0.3, 2.6, 0.3, { seg: false });
    const bb = PF.texMat(
      "qb_brk",
      PF.signTex(
        "qb_brk",
        ["BRIDGE OUT", "PAST THE ISLAND"],
        "raider",
        512,
        192,
        { bg: "#6a5a40", fg: "#f0e0b0" },
      ),
      { rough: 0.9 },
    );
    b.quad(bb, 374, d + 2.1, -443.65, 2.8, 1.05, { ry: -HP });
    // near the break: warning barricade
    PF.scrapWall(b, 480, -439, 480, -431, 1.4, {
      y: d,
      seed: 13,
      noSpikes: true,
    });
    b.quad(bb, 479.9, d + 1.0, -435, 2.6, 1.0, { ry: -HP });
    // settlement banner hung between the trusses near the market
    const ban = PF.texMat(
      "qb_banner",
      PF.signTex("qb_banner", ["BRIDGEMARKET"], "banner", 1024, 256, {
        bg: "#2a4a6a",
        fg: "#e8dcb8",
      }),
      { rough: 1, side: THREE.DoubleSide },
    );
    b.quad(ban, 326, 29.5, Q.zS - 0.6, 11, 2.6, { grime: 0.3 });
    b.quad(ban, 326, 29.5, Q.zN + 0.6, 11, 2.6, { ry: PI, grime: 0.3 });
    // street level: guard post at the ramp foot + market forecourt
    PF.barrel(b, 305.5, 0, -422.3, { fire: true });
    BK.lamp(b, Q.bays[1] - 4.2, 0, -423.2, PI, true);
    BK.lamp(b, Q.bays[1] + 4.2, 0, -423.2, PI, true);
    // landing + service hatch at the Manhattan pier's waterline (the Pier Works exit)
    b.boxMM("concrete", 334, 0, -446, 350, 0.3, -442.2, { grime: 0.8 });
    PF.colMM(334, -1.5, -446, 350, 0.3, -442.2, { surface: "concrete" });
    b.boxMM("rust", 344.2, 0.3, -442.95, 346.2, 2.6, -442.72, {
      grime: 0.8,
      seg: false,
    });
    const hk = PF.texMat(
      "qb_pierhatch",
      PF.signTex(
        "qb_pierhatch",
        ["PIER WORKS", "AUTHORIZED ONLY"],
        "enamel",
        512,
        192,
        { bg: "#6a2a20" },
      ),
      { rough: 0.8 },
    );
    b.quad(hk, 345.2, 3.1, -442.2, 1.8, 0.65, { ry: PI });
    anchors.pier_hatch = PF.anchor(345.2, 0.3, -443.6, 0);
    b.boxMM("iron", 338, 0.3, -446, 350, 1.3, -445.9, { seg: false });
  }

  // =================================================================
  // BUILD
  // =================================================================
  PF.buildQueensboroExterior = function (root) {
    const b = PF.batch("qb_ext");
    const bLit = PF.batch("qb_peek");
    const bGlass = PF.batch("qb_glass");
    const anchors = {};
    const gm = PF.mat("glass_tr");
    gm.transparent = true;
    gm.opacity = 0.32;
    gm.depthWrite = false;
    gm.side = THREE.DoubleSide;

    const xs = panels([312, 346, 388, 428, Q.brk]);
    for (const z0 of [Q.zN, Q.zS]) trussPlane(b, z0, xs, { collide: true });
    // lateral struts across the top chords where they clear the deck (and a few at the anchor end)
    for (const x of xs) {
      const ty = topY(x);
      if (ty > 30)
        BK.beamOriented(
          b,
          "qb_steel_dk",
          V3(x, ty - 1.2, Q.zN),
          V3(x, ty - 1.2, Q.zS),
          0.6,
          0.5,
          UP,
          0.5,
        );
    }
    for (const T of [346, 388, 428]) tower(b, T, { collide: true });
    pier(b, 346, -6, { cutwaterCol: true });
    pier(b, 388, 0, {});
    pier(b, 428, 0, {});
    market(b, bLit, bGlass, anchors);
    deck(b);
    ramp(b);
    // island stair tower ("the elevator building")
    const st = Q.stair;
    const top = BK.switchback(
      b,
      "qb_steel_dk",
      st.xA,
      st.xB,
      st.lanes,
      st.w,
      0,
      Q.deck,
      4,
      { landing: st.ld, frame: "qb_steel" },
    );
    anchors.island_stair = PF.anchor(st.xA - 2.5, 0, st.lanes[0], -HP);
    anchors.island_stair_top = PF.anchor(top.x, top.y, top.z, HP);
    brokenSpan(b);
    dress(b, anchors);

    b.build(root);
    bLit.build(root, { lodDistInt: 260 });
    bGlass.build(root, { noShadow: true, castShadow: false });
    anchors.entrance = anchors.market_door;
    anchors.ramp_foot = PF.anchor(301.5, 0, -443.8, -HP);
    anchors.ramp_top = PF.anchor(376, Q.deck, -443.6, -HP);
    anchors.deck_mid = PF.anchor(410, Q.deck, -435, -HP);
    anchors.broken_end = PF.anchor(484, Q.deck, -435, -HP);
    anchors.guard1 = PF.anchor(303.5, 1.1, -443.8, -HP * 0.6);
    anchors.guard2 = PF.anchor(337.5, Q.deck, -435.2, -HP);
    return anchors;
  };
