// play-inline-308 03 — the
// Lines 212-628 of readable/play-inline-308.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("tudor_city");
    const S = P.site("tc_story_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x4e4844,
      ambI: 0.36,
      interiorKey: "tudor_city",
    });
    const b = S.b;

    // ---------- the Court: a door to the upper floors (north wall, east of the dais) ----------
    b.box("wood_dark", 9.8, F3, -13.86, 11.2, F3 + 2.3, -13.78, { seg: false });
    b.box("wood_oak", 9.6, F3 + 2.3, -13.9, 11.4, F3 + 2.45, -13.72, {
      seg: false,
    });
    for (const xx of [9.65, 11.35])
      b.box("wood_oak", xx - 0.08, F3, -13.9, xx + 0.08, F3 + 2.3, -13.72, {
        seg: false,
      });
    b.box("brass", 11.0, F3 + 1.0, -13.74, 11.08, F3 + 1.08, -13.68, {
      seg: false,
      noAO: true,
    });
    D.label(
      b,
      "tc_upstairs",
      ["STAIR", "UPPER FLOORS · 4–11"],
      10.5,
      F3 + 2.75,
      -13.7,
      1.0,
      0.36,
      0,
      "brass",
    );

    // ---------- SOL'S DESK (mail & elevator hall) ----------
    E.desk(b, 14.8, 0, 15.3, PI, { w: 1.7, typewriter: false });
    S.col(13.95, 0, 14.92, 15.65, 0.8, 15.68, { walkable: false });
    D.chair(b, 14.8, 0, 16.3, PI, { seat: "leather", wood: "wood_dark" });
    E.deskLamp(S, 14.2, 0.765, 15.2, true);
    E.phone(b, 15.4, 0.765, 15.3, 0.4);
    b.box("wood_oak", 15.0, 0.765, 14.95, 15.5, 0.81, 15.3, {
      seg: false,
      noAO: true,
    }); // the logbook
    b.box("paper", 15.05, 0.81, 15.0, 15.45, 0.815, 15.25, {
      seg: false,
      noAO: true,
    });
    // doorman's cap on a hook + the key board with one empty hook (9C)
    b.rod("brass", [17.8, 1.9, 16.6], [17.6, 1.9, 16.6], 0.015, 4);
    b.cyl("paint_blue", 17.55, 1.8, 16.6, 0.13, 0.14, 0.09, 12, { noAO: true });
    b.box("wood_dark", 17.82, 1.2, 14.2, 17.88, 1.9, 15.6, { seg: false });
    for (let i = 0; i < 12; i++) {
      const kx = 14.35 + (i % 6) * 0.2,
        ky = 1.75 - Math.floor(i / 6) * 0.3;
      if (i === 8) continue;
      b.rod("brass", [17.8, ky, kx], [17.7, ky - 0.08, kx], 0.012, 3, {
        noAO: true,
      });
    }
    D.label(
      b,
      "tc_frontdesk",
      ["TUDOR CITY", "FRONT DESK · S. ABRAMOWITZ"],
      14.8,
      1.25,
      14.88,
      1.1,
      0.34,
      PI,
      "brass",
    );
    S.light(14.2, 1.3, 15.4, 0xffd8a0, 4.5, 0.7);

    // ---------- APARTMENT 9C ----------
    const X0 = 24,
      X1 = 36,
      Z0 = -8,
      Z1 = 4,
      H = 3.0;
    S.light(34.6, Y9 + 0.7, 1.4, 0xffc070, 6, 0.75); // Flint's battery lantern by the window
    S.light(35.2, Y9 + 1.6, 1.0, 0xff6a50, 6, 0.55); // the sign's red glow through the window
    S.light(27, Y9 + 2.4, -4, 0xcac2b4, 7, 0.35); // grey daylight, soft
    S.light(33, Y9 + 2.2, -5.5, 0xbab2a8, 4, 0.3);
    S.room({
      x0: X0,
      z0: Z0,
      x1: X1,
      z1: Z1,
      y: Y9,
      h: H,
      wall: "wallpaper_rose",
      floor: "parquet",
      ceil: "plaster",
      trim: "wood_dark",
      holes: { w: [[-2.6, -1.4, 0, 2.2]], e: [[-0.6, 2.6, 0.9, 2.3]] },
    });
    // the bedroom alcove partition (x 30..36, z -8..-3) with a doorway
    S.wallZ("wallpaper_rose", 30, Z0, -3, Y9, Y9 + H, 0.15, [
      [-6.2, -5.0, 0, 2.15],
    ]);
    S.wallX("wallpaper_rose", -3, 30, X1, Y9, Y9 + H, 0.15, [
      [30.4, 31.6, 0, 2.15],
    ]);
    // entrance door (west, from the stair): frame + chain lock hanging loose
    b.box("wood_dark", X0 - 0.08, Y9, -2.6, X0 + 0.04, Y9 + 2.2, -2.5, {
      seg: false,
    });
    b.box("wood_dark", X0 - 0.08, Y9 + 2.2, -2.7, X0 + 0.04, Y9 + 2.32, -1.3, {
      seg: false,
    });
    D.label(
      b,
      "tc_9c_door",
      ["9C"],
      X0 + 0.2,
      Y9 + 1.75,
      -2.85,
      0.24,
      0.16,
      HP,
      "brass",
    );
    // the window (east): two sashes, a sill, the painted view behind, the fire-escape platform outside
    b.quad(windowTex(), X1 + 0.6, Y9 + 1.6, 1.0, 3.6, 2.2, { ry: -HP });
    for (const zz of [-0.6, 1.0, 2.6])
      b.box(
        "wood",
        X1 - 0.08,
        Y9 + 0.9,
        zz - 0.05,
        X1 + 0.05,
        Y9 + 2.3,
        zz + 0.05,
        { seg: false },
      );
    b.box("wood", X1 - 0.08, Y9 + 1.58, -0.6, X1 + 0.05, Y9 + 1.64, 2.6, {
      seg: false,
    });
    b.box("wood_oak", X1 - 0.3, Y9 + 0.86, -0.7, X1 + 0.1, Y9 + 0.92, 2.7, {
      seg: false,
    }); // sill
    b.box("glass", X1 + 0.02, Y9 + 1.64, 1.05, X1 + 0.03, Y9 + 2.25, 2.55, {
      seg: false,
      noAO: true,
    });
    S.col(X1 - 0.05, Y9 + 0.85, -0.7, X1 + 0.1, Y9 + 2.4, 2.7, {
      walkable: false,
    }); // nobody falls out of the window: the way out is the door below   // the upper sash (the lower one is up: the way out)
    for (let i = 0; i < 6; i++)
      b.box(
        "iron",
        X1 + 0.2,
        Y9 + 0.88,
        -0.8 + i * 0.7,
        X1 + 1.2,
        Y9 + 0.92,
        -0.75 + i * 0.7,
        { seg: false },
      );
    b.rod(
      "iron",
      [X1 + 1.2, Y9 + 0.9, -0.8],
      [X1 + 1.2, Y9 + 1.9, -0.8],
      0.02,
      4,
    );
    b.rod(
      "iron",
      [X1 + 1.2, Y9 + 0.9, 2.7],
      [X1 + 1.2, Y9 + 1.9, 2.7],
      0.02,
      4,
    );
    b.rod(
      "iron",
      [X1 + 1.2, Y9 + 1.9, -0.8],
      [X1 + 1.2, Y9 + 1.9, 2.7],
      0.02,
      4,
    );
    b.rod(
      "fabric",
      [X1 + 0.9, Y9 + 0.9, 2.2],
      [X1 + 0.9, Y9 + 3.4, 2.2],
      0.03,
      4,
    ); // a knotted rope up toward the roof
    // kitchenette (north-west)
    b.box("paint_cream", X0 + 0.2, Y9, Z0 + 0.2, X0 + 4.4, Y9 + 0.9, Z0 + 0.8, {
      seg: false,
    });
    b.box(
      "marble",
      X0 + 0.15,
      Y9 + 0.9,
      Z0 + 0.15,
      X0 + 4.45,
      Y9 + 0.95,
      Z0 + 0.85,
      { seg: false, noAO: true },
    );
    b.box("paint_white", X0 + 4.6, Y9, Z0 + 0.2, X0 + 5.4, Y9 + 1.6, Z0 + 0.9, {
      seg: false,
    }); // the icebox
    b.box(
      "chrome",
      X0 + 5.3,
      Y9 + 0.9,
      Z0 + 0.88,
      X0 + 5.34,
      Y9 + 1.3,
      Z0 + 0.92,
      { seg: false, noAO: true },
    );
    b.cyl("chrome", X0 + 1.2, Y9 + 0.95, Z0 + 0.5, 0.1, 0.12, 0.18, 10, {
      noAO: true,
    }); // the kettle
    b.box(
      "paint_black",
      X0 + 2.4,
      Y9 + 0.95,
      Z0 + 0.25,
      X0 + 3.4,
      Y9 + 0.98,
      Z0 + 0.75,
      { seg: false, noAO: true },
    );
    for (let i = 0; i < 4; i++)
      b.cyl(
        "paint_white",
        X0 + 3.6 + (i % 2) * 0.18,
        Y9 + 0.95 + Math.floor(i / 2) * 0.03,
        Z0 + 0.5,
        0.09,
        0.08,
        0.03,
        10,
        { noAO: true },
      );
    // Nicole's calendar on the north wall (March 1967, the 4th circled), a UN poster beside it
    b.quad(calendarTex(), 29.2, Y9 + 1.6, Z0 + 0.17, 0.5, 0.7, { ry: 0 });
    const unp = P.texMat(
      "tc_9c_unposter",
      P.signTex(
        "tc_9c_unposter",
        ["UNITED NATIONS", "NEW YORK · 1966", "Interpreters' Benefit"],
        "poster",
        256,
        360,
        { bg: "#d8e0e4", fg: "#1e3a6a" },
      ),
      { rough: 0.9 },
    );
    b.quad(unp, 27.8, Y9 + 1.7, Z0 + 0.17, 0.55, 0.78, { ry: 0 });
    // the sitting room: sofa under a dust sheet, armchair, rug, coffee table, coat rack
    D.rug(b, 26.5, -1.5, 33.5, 3.2, Y9 + 0.012, "carpet");
    D.sofa(b, 29.6, Y9, 1.2, HP, { fabric: "fabric_white", w: 2.0 });
    D.table(b, 31.6, Y9, 1.0, {
      rect: [0.7, 1.2],
      h: 0.42,
      top: "wood_oak",
      leg: "wood_dark",
    });
    b.box("paper", 31.4, Y9 + 0.42, 0.7, 31.8, Y9 + 0.43, 1.05, {
      seg: false,
      noAO: true,
    }); // a folded World-Telegram
    D.chair(b, 32.6, Y9, -1.4, -2.4, { seat: "velvet", arms: true });
    b.rod(
      "wood_dark",
      [X0 + 0.6, Y9, 2.9],
      [X0 + 0.6, Y9 + 1.85, 2.9],
      0.03,
      6,
    );
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * TAU;
      b.rod(
        "wood_dark",
        [X0 + 0.6, Y9 + 1.75, 2.9],
        [X0 + 0.6 + Math.cos(a) * 0.22, Y9 + 1.65, 2.9 + Math.sin(a) * 0.22],
        0.012,
        3,
      );
    }
    b.geo(
      "fabric",
      new THREE.BoxGeometry(0.42, 0.9, 0.12).translate(0, -0.45, 0),
      P.m4(X0 + 0.82, Y9 + 1.7, 2.9, 0.4),
      { noAO: true, grime: 0.4 },
    ); // a man's grey scarf, left behind
    // Nell's desk (south wall, west): typewriter, press card, clippings pinned above
    E.desk(b, 25.9, Y9, 3.45, PI, { w: 1.5 });
    D.chair(b, 25.9, Y9, 2.6, PI, { seat: "wood", wood: "wood" });
    const clip = P.texMat(
      "tc_9c_clips",
      P.signTex(
        "tc_9c_clips",
        [
          "WORLD-TELEGRAM",
          "N. BRADY — STAFF",
          "\"Blackwell's, committed Feb 19.",
          'Long Winter?"',
        ],
        "label",
        384,
        256,
      ),
      { rough: 0.9 },
    );
    b.quad(clip, 25.9, Y9 + 1.55, Z1 - 0.17, 0.8, 0.53, { ry: PI });
    // the record player on the sideboard (south wall, east)
    b.box("wood_oak", 31.2, Y9, Z1 - 0.62, 33.4, Y9 + 0.82, Z1 - 0.15, {
      seg: false,
    });
    b.box("wood_dark", 31.5, Y9 + 0.82, Z1 - 0.58, 32.3, Y9 + 0.95, Z1 - 0.2, {
      seg: false,
    });
    b.cyl("paint_black", 31.9, Y9 + 0.95, Z1 - 0.39, 0.15, 0.15, 0.01, 20, {
      noAO: true,
    });
    b.cyl("paint_red", 31.9, Y9 + 0.962, Z1 - 0.39, 0.05, 0.05, 0.004, 12, {
      noAO: true,
    });
    b.rod(
      "chrome",
      [32.2, Y9 + 0.98, Z1 - 0.25],
      [31.98, Y9 + 0.98, Z1 - 0.36],
      0.008,
      4,
      { noAO: true },
    );
    for (let i = 0; i < 6; i++)
      b.box(
        i % 2 ? "paper" : "paint_cream",
        32.6 + i * 0.03,
        Y9 + 0.82,
        Z1 - 0.55,
        32.62 + i * 0.03,
        Y9 + 1.14,
        Z1 - 0.24,
        { seg: false, noAO: true },
      );
    // the bedroom alcove: the bed (made, untouched), a vanity with a cracked mirror, a dresser
    D.bed(b, 33.2, Y9, -5.4, 0, { w: 0.95, cover: "velvet" }); // Nicole's: made, untouched since 1968
    D.bed(b, 35.15, Y9, -5.4, 0, { w: 0.95, cover: "fabric" }); // Nell's: unmade (Flint sleeps on it)
    b.geo(
      "fabric",
      new THREE.BoxGeometry(0.9, 0.16, 1.1).rotateZ(0.12).rotateY(0.3),
      P.m4(35.1, Y9 + 0.62, -5.0),
      { noAO: true, grime: 0.5 },
    ); // a kicked-back blanket
    b.box("wood_oak", 30.3, Y9, -7.75, 31.6, Y9 + 0.78, -7.3, { seg: false });
    b.box("chrome", 30.5, Y9 + 0.9, -7.8, 31.4, Y9 + 1.7, -7.77, {
      seg: false,
      noAO: true,
    });
    b.box("wood_dark", 32.2, Y9, -7.8, 33.4, Y9 + 1.1, -7.3, { seg: false });
    // Rose's bolt-hole by the window: bedroll, the rifle-cleaning kit, a tin of sparks, no candles anywhere
    E.mattress(b, 34.9, Y9 + 0.01, 0.4, 0, { key: "burlap" });
    b.box("crate", 33.6, Y9, 2.4, 34.3, Y9 + 0.5, 3.1, { seg: false });
    b.box("fabric", 33.7, Y9 + 0.5, 2.5, 34.2, Y9 + 0.52, 3.0, {
      seg: false,
      noAO: true,
    });
    b.rod("steel", [33.65, Y9 + 0.54, 2.6], [34.25, Y9 + 0.54, 2.9], 0.01, 4, {
      noAO: true,
    }); // cleaning rod
    b.cyl("rust", 34.0, Y9 + 0.5, 2.55, 0.05, 0.05, 0.06, 8, { noAO: true }); // the sparks tin (flint and steel)
    b.cyl("lamp", 34.6, Y9 + 0.5, 1.6, 0.07, 0.09, 0.22, 8, { noAO: true }); // battery lantern
    S.glow(34.6, Y9 + 0.65, 1.6, 0xffc070, 0.8);
    for (let i = 0; i < 9; i++)
      b.box(
        "paint_white",
        35.8,
        Y9 + 1.0 + Math.floor(i / 5) * 0.12,
        -2.2 + (i % 5) * 0.05,
        35.84,
        Y9 + 1.09 + Math.floor(i / 5) * 0.12,
        -2.19 + (i % 5) * 0.05,
        { seg: false, noAO: true },
      ); // chalk tally
    b.quad(sunScratchTex(), X1 - 0.17, Y9 + 1.55, -2.2, 0.55, 0.55, {
      ry: -HP,
    });
    // dust, a few fallen plaster bits, the ceiling light (dead)
    D.papers(b, 28, Y9 + 0.01, -3, 3, 10);
    E.hangLamp(S, 28.5, Y9 + H, 0, {
      chain: 0.5,
      shade: "paint_cream",
      color: 0xffd8a0,
      lit: false,
    });

    // ---------- anchors (local → world, added to the tudor_city record) ----------
    S.anchor("apt_9c", 30.2, Y9, -1.4, -HP); // the room's middle (the main story's 6 m "entered 9C" check covers door and window)
    S.anchor("apt_9c_calendar", 29.2, Y9, Z0 + 1.1, 0);
    S.anchor("apt_9c_desk", 25.9, Y9, 2.2, PI);
    S.anchor("apt_9c_record", 31.9, Y9, Z1 - 1.3, PI);
    S.anchor("apt_9c_window", X1 - 1.0, Y9, 1.0, -HP);
    S.anchor("apt_9c_bed", 34.2, Y9, -5.4, -HP);
    S.anchor("apt_9c_center", 30.5, Y9, 0.0, -HP);
    S.anchor("sol_desk", 14.8, 0, 16.6, 0);
    S.anchor("court_stair", 10.5, F3, -12.6, PI);
    S.build({ interior: true });
    return S;
  }

  // ------------------------------------------------------------------
  // EXTERIOR: Rose's nook, the fire escape, the lit sign
  // ------------------------------------------------------------------
