// play-inline-275 05 — box
// Lines 635-1482 of readable/play-inline-275.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("san_remo");
    const S = P.site("sanremo_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x625a4c,
      ambI: 0.34,
      interiorKey: "san_remo",
    });
    const b = S.b;
    // ------------------------------------------------------------------
    // LOBBY (y 0): x -10..10, z -6..16
    // ------------------------------------------------------------------
    const H = 5.2;
    S.room({
      x0: -10,
      z0: -6,
      x1: 10,
      z1: 16,
      y: 0,
      h: H,
      wall: "wood_oak",
      floor: "marble",
      ceil: "plaster_cream",
      trim: "bronze",
      holes: {
        s: [[-1.3, 1.3, 0, 3.4]],
        e: [[-3.5, 1.5, 0, 3]],
        w: [[4, 7, 0, 3]],
      },
      frame: "limestone_warm",
      surface: "concrete",
    });
    b.box("marble_green", -9.8, 0.005, -5.8, 9.8, 0.012, -5.2, {
      seg: false,
      noAO: true,
    });
    D.rug(b, -1.6, -3, 1.6, 15, 0.01, "carpet_red");
    // coffered ceiling beams + arcade pilasters
    for (let z = -4; z < 16; z += 3)
      b.box("wood_dark", -10, H - 0.5, z - 0.15, 10, H - 0.08, z + 0.15, {
        seg: false,
      });
    for (const x of [-9.8, 9.8])
      for (let z = -3; z < 16; z += 4) {
        b.box(
          "limestone_warm",
          x - 0.2,
          0,
          z - 0.3,
          x + 0.2,
          H - 0.5,
          z + 0.3,
          { seg: false },
        );
      }
    // chandeliers
    D.chandelier(S, 0, H - 1.1, 2, 0.8, {
      tiers: 2,
      chain: 0.9,
      li: 0.95,
      lr: 10,
    });
    D.chandelier(S, 0, H - 1.1, 11, 0.8, {
      tiers: 2,
      chain: 0.9,
      li: 0.95,
      lr: 10,
    });
    // elevator bank (north wall z=-6): the working car (lit) + a boarded one
    for (const [ex, live] of [
      [-2.2, true],
      [2.2, false],
    ]) {
      b.box("brass", ex - 1.0, 0, -5.82, ex + 1.0, 3.3, -5.76, { seg: false });
      b.box("brass", ex - 0.75, 0, -5.78, ex - 0.02, 2.7, -5.7, { seg: false });
      b.box("brass", ex + 0.02, 0, -5.78, ex + 0.75, 2.7, -5.7, { seg: false });
      b.cyl("brass", ex, 3.45, -5.78, 0.3, 0.3, 0.04, 14, {
        rx: HP,
        noAO: true,
      });
      if (live) {
        b.sphere("lamp_warm", ex, 3.45, -5.72, 0.06, { ws: 6, hs: 4 });
        S.glow(ex, 3.45, -5.6, 0xffc070, 0.35);
        b.box("lamp_warm", ex + 1.1, 1.3, -5.78, ex + 1.2, 1.45, -5.7, {
          seg: false,
        });
      } else
        for (let i = 0; i < 3; i++)
          b.box(
            "wood_rotten",
            ex - 0.9,
            0.5 + i * 0.9,
            -5.72,
            ex + 0.9,
            0.72 + i * 0.9,
            -5.65,
            { seg: false, rz: (i - 1) * 0.08 },
          );
    }
    const el = P.texMat(
      "sr_elev",
      P.signTex(
        "sr_elev",
        ["ELEVATOR → PENTHOUSE", "COMMUNE MEMBERS & GUESTS"],
        "plain",
        512,
        96,
        { bg: "#2a4a3a", fg: "#e8dcb8" },
      ),
      {},
    );
    b.quad(el, -2.2, 3.95, -5.74, 2.2, 0.42, {});
    S.anchor("elevator_lobby", -2.2, 0, -3.6, PI);
    // doorman's desk + checkpoint
    b.box("wood_dark", 3.5, 0, 9.5, 7.5, 1.1, 10.3, { seg: false });
    b.box("marble", 3.45, 1.1, 9.45, 7.55, 1.16, 10.35, { seg: false });
    S.col(3.5, 0, 9.5, 7.5, 1.16, 10.3, { walkable: false });
    S.prop("terminal", 6.4, 1.16, 9.9, PI, {
      terminalId: "uw_sr_lobby",
      mount: "bare",
    });
    S.prop("radio", 4.4, 1.16, 9.8, PI, {});
    D.chair(b, 5.5, 0, 8.8, PI, { seat: "leather" });
    S.anchor("gus", 5.5, 0, 8.6, PI);
    for (const [x, z, ry] of [
      [-4.5, 7.5, 0],
      [-6, 7.5, 0],
      [4, 5.2, 0.3],
    ])
      S.prop("sandbags", x, 0, z, ry, {});
    S.prop("lamp", -3.2, 0, 7.9, 0, { kind: "floor" });
    S.light(-3.2, 1.8, 7.9, 0xffd8a0, 6, 0.7);
    // mailboxes + notice board
    for (let i = 0; i < 10; i++)
      for (let j = 0; j < 4; j++)
        b.box(
          "brass",
          -9.8,
          0.6 + j * 0.38,
          9 + i * 0.52,
          -9.72,
          0.92 + j * 0.38,
          9.45 + i * 0.52,
          { seg: false, noAO: true },
        );
    const nb = P.texMat(
      "sr_notice",
      P.signTex(
        "sr_notice",
        [
          "COMMUNE NOTICES",
          "Water ration: 2 cups",
          "Night watch: Birdie + ?",
          "SEEDS WANTED — ask Adeline",
          "Toby, come home. — B.",
        ],
        "label",
        512,
        400,
      ),
      {},
    );
    b.quad(nb, 9.78, 1.8, 3.5, 1.5, 1.2, { ry: -HP });
    S.pickup("uw_note_sr_notice", 1, 9.6, 1.1, 5.2);
    // lounge (west): couches, card table, radio
    D.sofa(b, -7, 0, 2, HP, { fabric: "velvet" });
    D.table(b, -5.4, 0, 0, { r: 0.5, top: "wood_dark", leg: "wood_dark" });
    D.chair(b, -4.6, 0, -0.8, 0.8);
    D.chair(b, -6.1, 0, -0.9, -0.6);
    for (let i = 0; i < 5; i++)
      b.box(
        "paper",
        -5.6 + i * 0.1,
        0.76,
        -0.1 + (i % 2) * 0.1,
        -5.5 + i * 0.1,
        0.765,
        0.05 + (i % 2) * 0.1,
        { seg: false, noAO: true },
      );
    // west door → stair (closed)
    b.box("wood_dark", -10.2, 0, 4.2, -10.1, 2.9, 6.8, { seg: false });
    const cl = P.texMat(
      "sr_stairs",
      P.signTex(
        "sr_stairs",
        ["STAIRS", "COLLAPSED AT 4", "USE THE ELEVATOR"],
        "raider",
        256,
        192,
        { fg: "#e8d8a8" },
      ),
      { transparent: true },
    );
    b.quad(cl, -10.02, 1.7, 5.5, 1.5, 1.1, { ry: HP });
    S.col(-10.3, 0, 4, -10, 3, 7, { walkable: false });
    // generator room (east) x 10..18, z -6..4
    S.room({
      x0: 10,
      z0: -6,
      x1: 18,
      z1: 4,
      y: 0,
      h: 4.2,
      wall: "brick_red",
      floor: "concrete",
      ceil: "concrete",
      skip: "w",
      surface: "concrete",
    });
    {
      const gx = 14.5,
        gz = -2.5;
      b.box("metal", gx - 1.6, 0, gz - 1, gx + 1.6, 1.6, gz + 1, {
        seg: false,
      });
      b.cyl("paint_green", gx - 0.7, 1.6, gz, 0.55, 0.55, 1.1, 12);
      b.cyl("paint_green", gx + 0.7, 1.6, gz, 0.55, 0.55, 1.1, 12);
      for (let i = 0; i < 6; i++)
        b.torus(
          "iron",
          gx + (i < 3 ? -0.7 : 0.7),
          1.8 + (i % 3) * 0.35,
          gz,
          0.57,
          0.03,
          TAU,
          { rx: HP, ts: 16, rs: 3 },
        );
      b.box("glow_green", gx - 0.3, 1.1, gz + 1.0, gx + 0.3, 1.4, gz + 1.03, {
        seg: false,
      });
      for (let i = 0; i < 4; i++)
        b.rod(
          "rubber",
          [gx + 1.5, 1.2, gz + (i - 1.5) * 0.25],
          [17.8, 3.8, gz + (i - 1.5) * 0.25],
          0.03,
          4,
        );
      b.rod("rubber", [17.8, 3.8, -2.5], [17.8, 3.8, 3.5], 0.08, 4);
      S.col(gx - 1.6, 0, gz - 1, gx + 1.6, 2.7, gz + 1, { walkable: false });
      S.light(gx, 2.8, gz + 1.5, 0x80ffa0, 7, 0.8);
      S.glow(gx, 1.25, gz + 1.1, 0x60ff80, 0.6);
      S.anchor("generator", gx, 0, gz + 2.2, PI);
    }
    S.prop("workbench", 16.8, 0, 2.6, PI, {});
    S.prop("toolbox", 11, 0, 3.2, PI, { loot: "toolbox" });
    b.box("lamp_cool", 13, 4.1, 0.5, 15, 4.15, 0.8, { seg: false });
    S.light(14, 3.6, 0.6, 0xd0e8ff, 7, 0.6);
    S.light(0, 3.5, 14, 0xffd8a0, 7, 0.6);
    S.anchor("entrance", 0, 0, 13.5, 0);
    S.anchor("npc3", -6.2, 0, 1.5, HP);

    // ------------------------------------------------------------------
    // PENTHOUSE COMMUNE (y 40)
    // ------------------------------------------------------------------
    const Y = PY,
      HH = 4.2;
    // vestibule (arrival) x -3..3, z 16..22
    S.room({
      x0: -3,
      z0: 16,
      x1: 3,
      z1: 22,
      y: Y,
      h: 3.4,
      wall: "marble",
      floor: "marble",
      ceil: "plaster_cream",
      skip: "n",
      trim: "bronze",
      surface: "concrete",
    });
    b.box("brass", -1.0, Y, 21.78, 1.0, Y + 3.0, 21.84, { seg: false });
    b.box("brass", -0.75, Y, 21.7, -0.02, Y + 2.7, 21.8, { seg: false });
    b.box("brass", 0.02, Y, 21.7, 0.75, Y + 2.7, 21.8, { seg: false });
    D.sconce(S, -2.85, Y + 2.3, 19, HP, { r: 4, i: 0.6 });
    D.sconce(S, 2.85, Y + 2.3, 19, -HP, { r: 4, i: 0.6 });
    S.anchor("penthouse_arrive", 0, Y, 19.2, 0);
    // GREAT ROOM x -20..20, z -4..16
    S.room({
      x0: -20,
      z0: -4,
      x1: 20,
      z1: 16,
      y: Y,
      h: HH,
      wall: "plaster_cream",
      floor: "parquet",
      ceil: "plaster_cream",
      trim: "wood_dark",
      surface: "wood",
      holes: {
        s: [
          [-3, 3, 0, 3.4],
          [-15, -13, 0, 2.7],
          [10, 12, 0, 2.7],
        ],
        n: [
          [-13, -11, 0, 2.7],
          [1, 3, 0, 2.7],
          [13, 15, 0, 2.7],
        ],
        e: [
          [-2.5, 1.5, 0.5, 3.6],
          [1.5, 3.5, 0, 3.0],
          [3.5, 13.5, 0.5, 3.6],
        ],
      },
      frame: "wood_dark",
    });
    // east glazing into the conservatory (French doors + mullions)
    for (let z = -2.5; z <= 13.5; z += 2)
      b.box("wood_dark", 19.85, Y + 0.5, z - 0.06, 20.15, Y + 3.6, z + 0.06, {
        seg: false,
      });
    b.box("wood_dark", 19.85, Y + 3.5, -2.5, 20.15, Y + 3.62, 13.5, {
      seg: false,
    });
    // big fireplace (west wall)
    D.fireplace(b, S, -19.8, Y, 6, HP, { key: "marble", lit: true });
    D.rug(b, -17, 1, -9, 11, Y + 0.01, "carpet_red");
    D.sofa(b, -13.5, Y, 6, -HP, { fabric: "velvet", w: 2.4 });
    D.sofa(b, -16, Y, 2.4, 0, { fabric: "fabric" });
    D.sofa(b, -16, Y, 9.6, PI, { fabric: "fabric" });
    D.piano(b, -16.5, Y, -1.8, PI * 0.2);
    // refectory table (salvaged doors on sawhorses) + benches
    {
      const x0 = -6,
        x1 = 10,
        z = 5;
      b.box("wood_dark", x0, Y + 0.72, z - 0.6, x1, Y + 0.8, z + 0.6, {
        segLen: 2,
      });
      for (let x = x0 + 0.6; x < x1; x += 3.6)
        for (const s of [-1, 1])
          b.rod("wood", [x, Y, z + s * 0.45], [x + 0.2, Y + 0.72, z], 0.04, 4, {
            square: true,
          });
      for (const s of [-1, 1]) {
        b.box(
          "wood",
          x0 + 0.3,
          Y + 0.42,
          z + s * 1.05 - 0.18,
          x1 - 0.3,
          Y + 0.48,
          z + s * 1.05 + 0.18,
          { seg: false },
        );
        for (let x = x0 + 1; x < x1; x += 3)
          b.box(
            "wood",
            x - 0.05,
            Y,
            z + s * 1.05 - 0.12,
            x + 0.05,
            Y + 0.42,
            z + s * 1.05 + 0.12,
            { seg: false },
          );
      }
      S.col(x0, Y, z - 0.6, x1, Y + 0.8, z + 0.6, { walkable: false });
      const r = P.rng("table");
      for (let i = 0; i < 14; i++) {
        const px = x0 + 0.5 + r() * (x1 - x0 - 1),
          pz = z + (r() - 0.5) * 0.9;
        b.cyl(
          r() < 0.5 ? "steel" : "paint_cream",
          px,
          Y + 0.8,
          pz,
          0.12,
          0.1,
          0.05,
          8,
          { noAO: true },
        );
      }
      for (let i = 0; i < 6; i++)
        b.cyl(
          "glass",
          x0 + 1 + i * 2.5,
          Y + 0.8,
          z + 0.3,
          0.035,
          0.04,
          0.22,
          6,
          { noAO: true },
        );
      D.candles(S, 2, Y + 0.8, 5, 3, { r: 5, i: 0.6 });
    }
    // cook drum + pot
    S.prop("campfire", 6, Y, 12.5, 0, { pot: true });
    S.light(6, Y + 1.0, 12.5, 0xff9a40, 7, 0.9);
    S.glow(6, Y + 0.6, 12.5, 0xff8a30, 1.0);
    S.prop("fridge", 11.5, Y, 15.3, PI, { loot: "fridge" });
    // string lights across the room
    for (const [a, c] of [
      [
        [-18, -3],
        [18, 15],
      ],
      [
        [-18, 15],
        [18, -3],
      ],
      [
        [-18, 6],
        [18, 6],
      ],
    ]) {
      const n = 14;
      for (let i = 0; i <= n; i++) {
        const t = i / n,
          x = a[0] + (c[0] - a[0]) * t,
          z = a[1] + (c[1] - a[1]) * t,
          y = Y + HH - 0.35 - Math.sin(t * PI) * 0.5;
        if (i < n) {
          const t2 = (i + 1) / n;
          b.rod(
            "rubber",
            [x, y, z],
            [
              a[0] + (c[0] - a[0]) * t2,
              Y + HH - 0.35 - Math.sin(t2 * PI) * 0.5,
              a[1] + (c[1] - a[1]) * t2,
            ],
            0.008,
            3,
            { noAO: true },
          );
        }
        b.sphere(
          i % 4 === 1 ? "glass_dark" : "lamp_warm",
          x,
          y - 0.06,
          z,
          0.05,
          { ws: 5, hs: 4, noAO: true },
        );
        if (i % 3 === 0) S.glow(x, y - 0.06, z, 0xffc070, 0.35);
      }
    }
    S.light(-8, Y + 3.2, 6, 0xffc890, 12, 0.8);
    S.light(8, Y + 3.2, 6, 0xffc890, 12, 0.8);
    S.light(0, Y + 3.2, 13, 0xffc890, 8, 0.5);
    S.light(0, Y + 3.2, -1, 0xffc890, 8, 0.5);
    D.papers(b, -4, Y, 12, 2, 6);
    S.anchor("great_room", 0, Y, 9, 0);
    S.anchor("npc1", -6, Y, 7.2, PI);
    S.anchor("npc2", 8.2, Y, 12.2, -HP);
    // CONSERVATORY (garden) x 20..28, z -4..16 — glass east wall + roof, painted view beyond
    {
      const cx0 = 20,
        cx1 = 28,
        cz0 = -4,
        cz1 = 16;
      S.floor("tile", cx0, cz0, cx1, cz1, Y, { t: 0.3, surface: "concrete" });
      S.wallX("brick_tan", cz0, cx0, cx1, Y, Y + 5.5, 0.3, [[23, 25, 0, 2.7]], {
        frame: "limestone_warm",
      });
      S.wallX("brick_tan", cz1, cx0, cx1, Y, Y + 5.5, 0.3, []);
      // glass wall (east): steel mullions, some panes broken, colliders
      for (let z = cz0; z <= cz1 + 0.01; z += 2)
        b.box("steel", cx1 - 0.08, Y, z - 0.06, cx1 + 0.08, Y + 5.5, z + 0.06, {
          seg: false,
        });
      for (let z = cz0; z < cz1; z += 2)
        for (let k = 0; k < 3; k++) {
          const br = P.rng(z * 5 + k)() < 0.2;
          b.box(
            br ? "glass_broken" : "glass",
            cx1 - 0.02,
            Y + 0.4 + k * 1.7,
            z + 0.06,
            cx1 + 0.02,
            Y + 2.0 + k * 1.7,
            z + 1.94,
            { seg: false, noAO: true, noBake: true },
          );
        }
      b.box("steel", cx1 - 0.1, Y, cz0, cx1 + 0.1, Y + 0.4, cz1, {
        seg: false,
      });
      S.col(cx1 - 0.1, Y, cz0, cx1 + 0.1, Y + 5.5, cz1, { walkable: false });
      // glass roof (pitched) + sky plane
      for (let z = cz0; z <= cz1 + 0.01; z += 2)
        b.rod("steel", [cx0, Y + 5.5, z], [cx1, Y + 4.4, z], 0.05, 4, {
          square: true,
        });
      b.box("glass", cx0, Y + 4.9, cz0, cx1, Y + 4.95, cz1, {
        rz: -0.14,
        seg: false,
        noAO: true,
        noBake: true,
      });
      b.box("wood_dark", cx0 - 0.2, Y + HH, cz0, cx0 + 0.2, Y + 5.6, cz1, {
        seg: false,
      });
      // planters (dead until the seeds come) + tools
      for (const [x0, z0, x1, z1] of [
        [21, -2.5, 27, -1],
        [21, 1, 27, 2.5],
        [21, 4.5, 27, 6],
        [21, 8, 27, 9.5],
        [21, 11.5, 27, 13],
      ])
        X.farmBed(S, x0, z0, x1, z1, Y, { density: 1.2 });
      b.cyl("steel", 20.8, Y, 14.8, 0.3, 0.25, 0.7, 10);
      b.cyl("steel", 20.8, Y + 0.7, 14.8, 0.02, 0.02, 1.2, 4);
      for (let i = 0; i < 3; i++)
        b.cyl("paint_green", 22 + i * 0.6, Y, 15.2, 0.15, 0.13, 0.3, 8, {
          noAO: true,
        });
      S.light(24, Y + 4, 6, 0xd8e0c0, 14, 0.9);
      S.anchor("nia", 22.6, Y, 3.5, -HP);
      S.anchor("garden", 24, Y, 6, 0);
      P.srGarden = { x0: cx0 + O.x, z0: cz0 + O.z, y: Y + O.y };
    }
    // the painted view: Central Park at dusk, the ruined skyline beyond
    b.quad("backdrop_park", 44, Y + 7, 6, 80, 22, {
      ry: -HP,
      noBake: true,
      grime: 0,
    });
    b.quad("backdrop_park", 30, Y + 16, 6, 60, 60, {
      rx: HP,
      noBake: true,
      grime: 0,
      uvRect: [0.35, 0.86, 0.65, 0.99],
    });
    // TOWER STAIR (north of the conservatory) x 20..28, z -12..-4
    {
      S.floor("concrete", 20, -12, 28, -4, Y, { t: 0.3 });
      S.wallX("brick_tan", -12, 20, 28, Y, Y + 8.5, 0.3, []);
      S.wallZ("brick_tan", 20, -12, -4, Y + HH, Y + 8.5, 0.3, []);
      S.wallZ("brick_tan", 28, -12, -4, Y, Y + 8.5, 0.3, []);
      S.ceil("concrete", 20, -12, 28, -4, Y + 8.5);
      S.stairs("concrete", 26, -5, "n", 2.4, Y, Y + 4.0, {
        run: 0.32,
        nosing: "steel",
        rail: "iron",
        railSides: [-1],
      });
      S.floor("concrete", 24.6, -12, 27.8, -10.7, Y + 4.0, { t: 0.3 });
      S.floor("concrete", 20.2, -12, 24.6, -9, Y + 4.0, { t: 0.3 });
      S.rail(
        "iron",
        [
          [20.2, -9],
          [24.6, -9],
          [24.6, -10.7],
        ],
        Y + 4.0,
        1.0,
        { r: 0.03 },
      );
      b.box("metal", 20.16, Y + 4, -11.2, 20.22, Y + 6.3, -9.8, { seg: false });
      b.box("lamp_red", 20.2, Y + 6.5, -10.65, 20.3, Y + 6.65, -10.35, {
        seg: false,
      });
      S.glow(20.3, Y + 6.58, -10.5, 0xff6040, 0.4);
      const ts = P.texMat(
        "sr_tower",
        P.signTex(
          "sr_tower",
          ["NORTH TOWER", "LOOKOUT — KNOCK FIRST"],
          "plain",
          256,
          96,
          { bg: "#2a4a3a", fg: "#e8dcb8" },
        ),
        {},
      );
      b.quad(ts, 20.2, Y + 6.9, -10.5, 1.0, 0.38, { ry: HP });
      S.light(23, Y + 7, -8, 0xffd8a0, 8, 0.5);
      S.anchor("tower_stair_top", 21.4, Y + 4, -10.5, -HP); // arrive facing away from the hatch door (x 20.2), onto the landing
    }
    // NORTH WING: trading post (library) x -20..-4, clinic x -4..8, office x 8..20; z -24..-4
    S.room({
      x0: -20,
      z0: -24,
      x1: -4,
      z1: -4,
      y: Y,
      h: HH,
      wall: "wood_oak",
      floor: "parquet",
      ceil: "plaster_cream",
      skip: "s",
      trim: "wood_dark",
      surface: "wood",
      holes: { e: [[-16, -14, 0, 2.7]] },
      frame: "wood_dark",
    });
    S.room({
      x0: -4,
      z0: -24,
      x1: 8,
      z1: -4,
      y: Y,
      h: HH,
      wall: "tile_white",
      floor: "tile",
      ceil: "plaster_cream",
      skip: "sw",
      surface: "concrete",
      holes: { e: [[-16, -14, 0, 2.7]] },
      frame: "paint_white",
    });
    S.room({
      x0: 8,
      z0: -24,
      x1: 20,
      z1: -4,
      y: Y,
      h: HH,
      wall: "wallpaper_green",
      floor: "carpet_red",
      ceil: "plaster_cream",
      skip: "sw",
      trim: "wood_dark",
      surface: "carpet",
    });
    // trading post
    for (let i = 0; i < 4; i++)
      D.bookcase(b, -19.6, Y, -21.5 + i * 2.2, HP, {
        w: 1.9,
        h: 2.8,
        empty: 0.35,
      });
    for (let i = 0; i < 4; i++)
      D.bookcase(b, -17 + i * 2.2, Y, -23.6, 0, { w: 1.9, h: 2.8, empty: 0.4 });
    S.prop("market_stall", -12, Y, -11, 0, { sign: 1 });
    b.box("wood_dark", -15, Y, -9.4, -9, Y + 1.05, -8.6, { seg: false });
    b.box("wood_oak", -15.1, Y + 1.05, -9.5, -8.9, Y + 1.1, -8.5, {
      seg: false,
    });
    S.col(-15, Y, -9.4, -9, Y + 1.1, -8.6, { walkable: false });
    S.prop("cash_register", -10, Y + 1.1, -9, PI, {});
    for (let i = 0; i < 5; i++)
      S.prop(
        "crate",
        -7 + (i % 2) * 1.1,
        Y + Math.floor(i / 2) * 0.8,
        -22.5 + (i % 3) * 1.2,
        i * 0.3,
        { kind: i % 2 ? "fizzo" : "army" },
      );
    S.prop("fizzo_machine", -5, Y, -14, -HP, {});
    S.light(-12, Y + 3.5, -14, 0xffd8a0, 10, 0.8);
    S.glow(-12, Y + 3.8, -14, 0xffd8a0, 0.6);
    b.box(
      "lamp_warm",
      -12.5,
      Y + HH - 0.1,
      -14.5,
      -11.5,
      Y + HH - 0.05,
      -13.5,
      { seg: false },
    );
    S.anchor("mercer", -12, Y, -10.2, 0);
    // clinic
    for (let i = 0; i < 3; i++) {
      D.bed(b, -2.6 + i * 3.4, Y, -21.5, 0, {
        w: 1.0,
        cover: "fabric_white",
        wood: "steel",
      });
      b.rod(
        "steel",
        [-1.6 + i * 3.4, Y, -20.3],
        [-1.6 + i * 3.4, Y + 1.9, -20.3],
        0.02,
        4,
      );
      b.box(
        "glass",
        -1.72 + i * 3.4,
        Y + 1.5,
        -20.36,
        -1.48 + i * 3.4,
        Y + 1.85,
        -20.24,
        { seg: false },
      );
    }
    S.prop("first_aid", 7.6, Y + 1.3, -15, -HP, {
      loot: "medical_cabinet",
      owner: "settlers",
    });
    S.prop("file_cabinet", -3.5, Y, -8, HP, {
      loot: "field_surgery_kit",
      owner: "settlers",
      name: "Medical Supplies",
    });
    D.table(b, 2, Y, -10, { rect: [1.6, 0.8], top: "steel", leg: "steel" });
    b.box("lamp_cool", 0, Y + HH - 0.1, -15, 4, Y + HH - 0.05, -14.6, {
      seg: false,
    });
    S.light(2, Y + 3.4, -14, 0xe0f0ff, 10, 0.9);
    const rc = P.texMat(
      "sr_clinic",
      P.signTex(
        "sr_clinic",
        ["+ CLINIC", "Doc Halloway · Mon–Sun"],
        "plain",
        256,
        96,
        { bg: "#e8e4d8", fg: "#8a1a1a" },
      ),
      {},
    );
    b.quad(rc, 2, Y + 2.9, -4.17, 1.2, 0.45, { ry: PI });
    S.anchor("doc", 2, Y, -11.5, 0);
    // office
    S.prop("desk", 14, Y, -21.5, 0, {
      loot: "desk",
      owner: "settlers",
      name: "Adeline's Desk",
    });
    S.prop("terminal", 13.4, Y + 0.78, -21.7, 0, {
      terminalId: "uw_sr_office",
      mount: "bare",
    });
    D.chair(b, 14, Y, -22.6, 0, { seat: "leather" });
    const map = P.texMat(
      "sr_map",
      P.signTex(
        "sr_map",
        [
          "MANHATTAN",
          "— safe",
          "— raiders (Bellamy's)",
          "— Maniacs (Ansonia)",
          "— ??? (Dakota)",
        ],
        "label",
        512,
        512,
        { bg: "#c8b890" },
      ),
      {},
    );
    b.quad(map, 19.82, Y + 2.1, -14, 2.4, 2.4, { ry: -HP });
    D.bookcase(b, 8.4, Y, -12, HP, { w: 2.2 });
    D.sofa(b, 16, Y, -8, PI, { fabric: "leather" });
    S.prop("radio", 18.8, Y + 0.8, -21.8, 0, {});
    b.box("wood_dark", 18.2, Y, -22.3, 19.6, Y + 0.8, -21.3, { seg: false });
    D.sconce(S, 8.25, Y + 2.3, -18, HP, { r: 6, i: 0.7 });
    S.light(14, Y + 3.3, -14, 0xffd8a0, 9, 0.6);
    S.anchor("adeline", 14, Y, -19.8, PI);
    // SOUTH WING: dormitory x -20..-3, pantry x 3..20; z 16..24
    S.room({
      x0: -20,
      z0: 16,
      x1: -3,
      z1: 24,
      y: Y,
      h: HH,
      wall: "wallpaper",
      floor: "parquet",
      ceil: "plaster_cream",
      skip: "ne",
      surface: "wood",
    });
    S.room({
      x0: 3,
      z0: 16,
      x1: 20,
      z1: 24,
      y: Y,
      h: HH,
      wall: "tile_white",
      floor: "tile",
      ceil: "plaster_cream",
      skip: "nw",
      surface: "concrete",
    });
    S.wallZ("wallpaper", -3, 22, 24, Y, Y + HH, 0.3, []);
    S.wallZ("tile_white", 3, 22, 24, Y, Y + HH, 0.3, []);
    S.wallX("marble", 24, -3, 3, Y, Y + HH, 0.3, []);
    for (let i = 0; i < 5; i++) {
      S.prop(i % 2 ? "mattress" : "bed", -18.5 + i * 3.2, Y, 22.3, 0, {});
      S.prop("footlocker", -18.5 + i * 3.2, Y, 20.2, PI, {
        loot: "footlocker",
        owner: "settlers",
      });
    }
    b.box("lamp_warm", -12, Y + HH - 0.1, 19.8, -10, Y + HH - 0.05, 20.2, {
      seg: false,
    });
    S.light(-11, Y + 3.2, 20, 0xffd8a0, 9, 0.5);
    S.anchor("toby_home", -8, Y, 19, PI);
    S.anchor("dorm", -11, Y, 19, PI);
    for (let i = 0; i < 4; i++) S.prop("shelf", 5 + i * 3, Y, 23.4, PI, {});
    S.container("Commune Pantry", 12, Y + 0.8, 22.8, {
      loot: "grocery_shelf",
      owner: "settlers",
      radius: 1.4,
    });
    S.prop("barrel", 18.5, Y, 17.5, 0, {});
    b.cyl("steel", 18.5, Y + 1.0, 17.5, 0.35, 0.35, 0.6, 10);
    b.rod("steel", [18.5, Y + 1.6, 17.5], [18.5, Y + 2.4, 18.3], 0.03, 4);
    S.light(11, Y + 3.2, 20, 0xe8f0ff, 9, 0.5);
    S.anchor("pantry", 11, Y, 19, 0);
    S.anchor("merchant", -12, Y, -10.2, 0);

    S.build({ interior: true });
    // the garden once the Stokes seeds are planted (hidden until then)
    {
      const gb = new P.Batch("sr_garden_alive", {
        ox: O.x,
        oy: O.y,
        oz: O.z,
        lit: true,
        ambient: 0x625a4c,
        ambI: 0.34,
      });
      gb.light(24, Y + 4, 6, 0xd8e0c0, 14, 0.9);
      const fake = { b: gb, col: () => null };
      for (const [x0, z0, x1, z1] of [
        [21, -2.5, 27, -1],
        [21, 1, 27, 2.5],
        [21, 4.5, 27, 6],
        [21, 8, 27, 9.5],
        [21, 11.5, 27, 13],
      ])
        X.farmBed(fake, x0, z0, x1, z1, Y + 0.02, {
          alive: true,
          density: 5,
          cropsOnly: true,
        });
      const grp = gb.build(S.root);
      grp.visible = false;
      P.srGardenAlive = grp;
    }
    P.addInterior("san_remo", S.root);
    return S;
  }

