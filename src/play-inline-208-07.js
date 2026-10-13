// play-inline-208 07 — seg
// Lines 2326-3484 of readable/play-inline-208.pretty.js (statement-aligned).
  function buildInterior(cell, ext) {
    const O = cell.origin,
      ox = O.x,
      oy = O.y + BASE,
      oz = O.z;
    const X = (x) => ox + x,
      Z = (z) => oz + z;
    const P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    const A = (x, y, z, yaw) => PF.anchor(ox + x, oy + y, oz + z, yaw || 0);
    const anchors = {};
    const subShip = PF.subRoot(cell, "ship", (p) => p.x < ox + 2);
    const subMarket = PF.subRoot(cell, "market", (p) => p.x > ox - 2);
    const r = PF.rng("sp_int");

    // ===================== SHIP =====================
    const HD = -6.2; // hold floor
    const SX0 = -100,
      SX1 = -36; // stern .. bow (local)
    const hw = (x) => {
      const v = (x - SX0) / (SX1 - SX0);
      return 4.4 * wf(v, 0.7);
    };
    const L1 = [];
    for (let x = -96; x <= -40; x += 7)
      L1.push({
        x: X(x),
        y: oy + 1.9,
        z: Z(0),
        color: 0xffc070,
        r: 8,
        i: 0.55,
      });
    L1.push({
      x: X(-95),
      y: oy + 2.4,
      z: Z(-2.6),
      color: 0xffd090,
      r: 9,
      i: 0.85,
    }); // saloon (brass lamp by the settee)
    L1.push({
      x: X(-91),
      y: oy + 2.2,
      z: Z(2.4),
      color: 0xffc880,
      r: 7,
      i: 0.55,
    }); // saloon: the salvagers' hurricane lamp on the chart table
    L1.push({
      x: X(-96),
      y: oy + 3.4,
      z: Z(0),
      color: 0xc8d8ff,
      r: 6,
      i: 0.28,
    }); // skylight
    for (let x = -90; x <= -42; x += 8)
      L1.push({
        x: X(x),
        y: oy + HD + 3,
        z: Z(0),
        color: 0x8090a8,
        r: 9,
        i: 0.42,
      });
    L1.push({
      x: X(-66),
      y: oy + HD + 1,
      z: Z(0),
      color: 0x9aff60,
      r: 11,
      i: 0.9,
    }); // the hatchery glow
    L1.push({ x: X(-66), y: oy + 1, z: Z(0), color: 0xc8e0ff, r: 6, i: 0.4 }); // light through the collapsed deck
    L1.push({
      x: X(-50),
      y: oy + HD + 3,
      z: Z(0),
      color: 0xd8e0ff,
      r: 7,
      i: 0.45,
    }); // fore hatch shaft
    L1.push({
      x: X(-80),
      y: oy + HD + 3,
      z: Z(0),
      color: 0xd8e0ff,
      r: 7,
      i: 0.45,
    }); // aft hatch shaft
    for (const [x, z] of [
      [-90, 2.6],
      [-80, -2.8],
      [-50, 2.8],
      [-42, -2.6],
      [-58, -3],
    ])
      L1.push({
        x: X(x),
        y: oy + HD + 1.8,
        z: Z(z),
        color: 0xffb060,
        r: 8,
        i: 0.75,
      }); // salvagers' work lamps
    const b = PF.batch("seaport_ship");
    b.ground = oy + HD;
    b.aoH = 2.5;
    b.setLights(L1, 0x708090, 0.24);
    // hull shell (inside view): side planking following the hull plan, ribs, deck beams
    for (let x = SX0; x < SX1; x += 2) {
      const w0 = hw(x),
        w1 = hw(x + 2),
        wm = Math.min(w0, w1);
      for (const s of [-1, 1]) {
        const len = Math.hypot(2, w1 - w0),
          ry = Math.atan2(-s * (w1 - w0), 2);
        b.box(
          "mahogany",
          X(x + 1),
          oy + HD - 0.2,
          Z((s * (w0 + w1)) / 2 + s * 0.15),
          len + 0.05,
          8.9,
          0.3,
          { ry, seg: true, segLen: 3, grime: 0.6, c: 0x8a7a6a },
        );
        PF.colWall(
          X(x),
          Z(s * (w0 + 0.15)),
          X(x + 2),
          Z(s * (w1 + 0.15)),
          0.3,
          oy + HD - 0.5,
          oy + 2.8,
          { walkable: false },
        );
      }
      // ribs (curved frames) every 2 m
      for (const s of [-1, 1]) {
        const w = w0;
        b.beam(
          "oak",
          P(x, HD, s * (w - 0.2)),
          P(x, HD + 3.5, s * (w - 0.05)),
          0.25,
          0.3,
          { grime: 0.5 },
        );
        b.beam(
          "oak",
          P(x, HD + 3.5, s * (w - 0.05)),
          P(x, 2.5, s * (w - 0.1)),
          0.25,
          0.3,
          { grime: 0.5 },
        );
        b.beam(
          "oak",
          P(x, HD, s * (w - 0.2)),
          P(x, HD + 0.2, s * (w * 0.4)),
          0.25,
          0.3,
          { grime: 0.5 },
        );
      }
      b.box("oak", X(x), oy - 0.7, Z(0), 0.3, 0.3, wm * 2, {
        seg: false,
        grime: 0.5,
      }); // 'tween deck beams (under)
      b.box("oak", X(x), oy + 2.3, Z(0), 0.25, 0.3, wm * 2, {
        seg: false,
        grime: 0.5,
      }); // main deck beams (over)
    }
    // stern & bow end walls
    b.boxMM(
      "mahogany",
      X(SX0 - 0.4),
      oy + HD,
      Z(-4.4),
      X(SX0),
      oy + 2.8,
      Z(4.4),
      { grime: 0.5 },
    );
    PF.colMM(X(SX0 - 0.4), oy + HD, Z(-4.4), X(SX0), oy + 2.8, Z(4.4), {
      walkable: false,
    });
    b.boxMM(
      "mahogany",
      X(SX1 - 0.2),
      oy + HD,
      Z(-1.5),
      X(SX1 + 0.2),
      oy + 2.8,
      Z(1.5),
      { grime: 0.5 },
    );
    PF.colMM(X(SX1 - 0.4), oy + HD, Z(-1.5), X(SX1 + 0.2), oy + 2.8, Z(1.5), {
      walkable: false,
    });
    // main deck overhead (ceiling of the 'tween deck)
    b.boxMM("deck_wood", X(SX0), oy + 2.6, Z(-4.4), X(SX1), oy + 2.8, Z(4.4), {
      seg: false,
      grime: 0.6,
    });
    // hold floor (with the flooded trough amidships) + 'tween deck floor with its openings
    const holdF = (x0, x1, y) => {
      b.boxMM(
        "deck_wood",
        X(x0),
        oy + y - 0.4,
        Z(-4.3),
        X(x1),
        oy + y,
        Z(4.3),
        { grime: 0.7 },
      );
      PF.colMM(X(x0), oy + y - 0.4, Z(-4.3), X(x1), oy + y, Z(4.3), {
        surface: "wood",
      });
    };
    holdF(-97, -76, HD);
    holdF(-56, -38, HD);
    holdF(-76, -56, HD - 0.7);
    b.boxMM(
      "goo",
      X(-76),
      oy + HD - 0.35,
      Z(-4.2),
      X(-56),
      oy + HD - 0.3,
      Z(4.2),
      { seg: false, noAO: true, grime: 0 },
    );
    for (const [x0, x1] of [
      [-76.4, -76],
      [-56, -55.6],
    ])
      b.boxMM("oak", X(x0), oy + HD - 0.7, Z(-4.2), X(x1), oy + HD, Z(4.2), {
        seg: false,
      });
    PF.stairs(b, "oak", X(-75), Z(0), -HP, 3.0, 1.0, oy + HD - 0.7, oy + HD, {
      base: oy + HD - 0.8,
    });
    PF.stairs(b, "oak", X(-57), Z(0), HP, 3.0, 1.0, oy + HD - 0.7, oy + HD, {
      base: oy + HD - 0.8,
    });
    PF.safe("rad", () =>
      G.world.addRadSource({
        x: X(-66),
        y: oy + HD - 0.3,
        z: Z(0),
        radius: 7,
        strength: 2.2,
      }),
    );
    // 'tween deck floor: holes at the fore hatch (x -52..-48), aft hatch (x -82..-78) and the collapse (x -70..-62)
    const tween = (x0, x1) => {
      b.boxMM("deck_wood", X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(4.3), {
        grime: 0.6,
      });
      PF.colMM(X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(4.3), {
        surface: "wood",
      });
    };
    tween(-100, -84);
    tween(-78, -70);
    tween(-62, -54);
    tween(-48, -36);
    for (const [x0, x1] of [
      [-84, -78],
      [-54, -48],
    ]) {
      b.boxMM("deck_wood", X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(-1.6), {
        seg: false,
      });
      b.boxMM("deck_wood", X(x0), oy - 0.4, Z(1.6), X(x1), oy, Z(4.3), {
        seg: false,
      });
      PF.colMM(X(x0), oy - 0.4, Z(-4.3), X(x1), oy, Z(-1.6), {
        surface: "wood",
      });
      PF.colMM(X(x0), oy - 0.4, Z(1.6), X(x1), oy, Z(4.3), { surface: "wood" });
    }
    // hatch coamings + railings around the openings
    for (const [x0, x1] of [
      [-84, -78],
      [-54, -48],
    ]) {
      PF.railing(
        b,
        [
          [X(x0), Z(-1.6)],
          [X(x1), Z(-1.6)],
        ],
        oy,
        0.9,
        "oak",
        { collide: true },
      );
      PF.railing(
        b,
        [
          [X(x0), Z(1.6)],
          [X(x1), Z(1.6)],
        ],
        oy,
        0.9,
        "oak",
        { collide: true },
      );
    }
    // steep companion stairs through the hatches: fore (hold x -54 → 'tween x -48), aft (hold x -78 → 'tween x -84)
    PF.stairs(b, "oak", X(-54), Z(0), HP, 3.0, 6.0, oy + HD, oy, {
      base: oy + HD - 0.2,
    });
    PF.stairs(b, "oak", X(-78), Z(0), -HP, 3.0, 6.0, oy + HD, oy, {
      base: oy + HD - 0.2,
    });
    // collapsed midships deck: broken planks hanging down, railing of salvage timber
    for (let i = 0; i < 9; i++)
      b.box(
        "deck_wood",
        X(-69.5 + i * 0.9),
        oy - 1.8 - r() * 1.2,
        Z((r() - 0.5) * 5),
        0.8,
        0.1,
        3 + r() * 2,
        { rx: (r() - 0.5) * 0.8, rz: 0.6 + r() * 0.5, seg: false, grime: 0.7 },
      );
    for (const x of [-70.1, -61.9])
      PF.railing(
        b,
        [
          [X(x), Z(-4.2)],
          [X(x), Z(4.2)],
        ],
        oy,
        1.0,
        "rotten",
        { collide: true },
      );
    anchors.collapse = A(-72, 0, 0, -HP);
    // ----- 'tween deck compartments -----
    // FO'C'SLE (x -48..-36): arrival from the fore hatch, bunks, sea chests, the galley stove
    for (let i = 0; i < 4; i++)
      for (const s of [-1, 1]) {
        const x = -46.5 + i * 2.2;
        const w = hw(x) - 0.6;
        for (const y of [0.3, 1.4]) {
          b.box("oak", X(x), oy + y, Z(s * (w - 0.5)), 2.0, 0.1, 0.9, {
            seg: false,
          });
          b.box(
            "linen",
            X(x),
            oy + y + 0.1,
            Z(s * (w - 0.5)),
            1.9,
            0.12,
            0.85,
            { seg: false, c: 0x9a9080, grime: 0.7 },
          );
        }
        PF.col(X(x), Z(s * (w - 0.5)), 2.0, 0.9, oy, oy + 1.6, 0, {
          walkable: false,
        });
      }
    b.box("iron", X(-41.5), oy, Z(2.2), 1.4, 1.0, 1.0, {
      seg: false,
      grime: 0.6,
    });
    b.cyl("iron", X(-41.5), oy + 1.0, Z(2.2), 0.12, 0.12, 1.6, 6, { hSeg: 1 });
    PF.col(X(-41.5), Z(2.2), 1.4, 1.0, oy, oy + 1.0, 0, { walkable: false });
    for (let i = 0; i < 3; i++)
      b.cyl("iron", X(-41.8 + i * 0.4), oy + 1.0, Z(2.4), 0.15, 0.12, 0.2, 8, {
        hSeg: 1,
      });
    ladder(b, X(-38.6), oy, Z(0), 2.6, HP);
    anchors.fore = A(-44, 0, 0, HP);
    // CREW BERTHS (x -60..-52): hammocks, lockers, the bosun's skeleton
    for (let i = 0; i < 5; i++)
      for (const s of [-1, 1]) {
        const x = -60 + i * 1.8;
        b.beam("linen", P(x, 1.7, s * 0.7), P(x, 1.3, s * 3.2), 0.6, 0.08, {
          grime: 0.7,
        });
      }
    PF.skeleton(b, X(-57), oy + 0.02, Z(1.5), 2.1);
    anchors.berths = A(-56, 0, -2, 0);
    // SAIL LOCKER (x -78..-70): rolled canvas, coils of rope, a carpenter's bench
    for (let i = 0; i < 6; i++) {
      const g = new THREE.CylinderGeometry(0.35, 0.35, 3.5, 10);
      g.rotateX(HP);
      b.add("linen", g, {
        m: PF.m4(
          X(-77 + (i % 3) * 0.75),
          oy + 0.35 + Math.floor(i / 3) * 0.65,
          Z(-2.2),
        ),
        grime: 0.7,
      });
    }
    PF.colMM(X(-77.5), oy, Z(-4), X(-75.2), oy + 1.2, Z(-0.4), {
      walkable: false,
    });
    for (let i = 0; i < 4; i++)
      b.cyl("rope", X(-73 + i * 0.9), oy, Z(2.8), 0.4, 0.4, 0.3, 12, {
        hSeg: 1,
      });
    b.box("oak", X(-72), oy, Z(-3.4), 2.6, 0.9, 0.8, { seg: false });
    PF.col(X(-72), Z(-3.4), 2.6, 0.8, oy, oy + 0.9, 0, { walkable: false });
    anchors.sail_locker = A(-74, 0, 0, 0);
    // AFT: officers' passage (x -92..-82) + CAPTAIN'S SALOON (x -100..-92)
    PF.wall(
      b,
      "mahogany",
      "z",
      Z(-4.4),
      Z(4.4),
      X(-92.2),
      X(-91.9),
      oy,
      oy + 2.6,
      [{ c: Z(0), w: 1.4, y0: oy, h: 2.2 }],
    );
    b.boxMM("mahogany", X(-99.9), oy, Z(-4.3), X(-92.2), oy + 1.0, Z(-4.1), {
      seg: false,
    }); // wainscot
    b.boxMM("mahogany", X(-99.9), oy, Z(4.1), X(-92.2), oy + 1.0, Z(4.3), {
      seg: false,
    });
    b.boxMM(
      "carpet",
      X(-99.9),
      oy + 0.01,
      Z(-3.8),
      X(-92.3),
      oy + 0.03,
      Z(3.8),
      { seg: false },
    );
    b.box("mahogany", X(-96), oy, Z(0), 3.2, 0.8, 1.6, {
      seg: false,
      grime: 0.4,
    }); // chart table
    PF.col(X(-96), Z(0), 3.2, 1.6, oy, oy + 0.8, 0, { walkable: false });
    const chartK = PF.texMat(
      "sp_chart",
      PF.canvasTex(
        "pf_sp_chart",
        512,
        256,
        (ctx, w, h) => {
          ctx.fillStyle = "#d8ccaa";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#5a6a8a";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(40, 200);
          ctx.bezierCurveTo(120, 60, 300, 240, 470, 50);
          ctx.stroke();
          ctx.fillStyle = "#6a7a5a";
          ctx.beginPath();
          ctx.ellipse(120, 120, 60, 40, 0.3, 0, TAU);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(380, 180, 80, 50, -0.2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#3a2a1a";
          ctx.font = "italic 20px Georgia";
          ctx.fillText("Cape Horn — 1929", 300, 30);
          for (let i = 0; i < 20; i++) {
            ctx.fillStyle = "rgba(80,60,30," + Math.random() * 0.3 + ")";
            ctx.beginPath();
            ctx.arc(
              Math.random() * w,
              Math.random() * h,
              4 + Math.random() * 20,
              0,
              TAU,
            );
            ctx.fill();
          }
        },
        { clamp: true },
      ),
      { rough: 0.9 },
    );
    b.quad(chartK, X(-96), oy + 0.81, Z(0), 3.0, 1.4, { rx: -HP, grime: 0.2 });
    PF.codeReadable(
      V3(X(-95.4), oy + 1.0, Z(-0.3)),
      "Chart of Cape Horn",
      "Under a coffee ring, pencilled beside the Horn in the captain's hand: \"55°58' S — SAFE 5558. A sailor never forgets the Horn.\"",
      "pf_lk_sp_captain_safe",
    );
    for (let i = 0; i < 4; i++)
      b.quad("lamp_blue", X(-99.85), oy + 1.6, Z(-3 + i * 2), 0.9, 0.9, {
        ry: HP,
        noAO: true,
      }); // stern windows
    b.boxMM(
      "glass_dark",
      X(-97.5),
      oy + 2.62,
      Z(-1),
      X(-94.5),
      oy + 2.7,
      Z(1),
      { seg: false },
    );
    b.quad("lamp_blue", X(-96), oy + 2.58, Z(0), 2.8, 1.8, {
      rx: HP,
      noAO: true,
    }); // skylight
    for (const s of [-1, 1]) {
      b.box("velvet", X(-96), oy, Z(s * 3.4), 4.0, 0.5, 0.9, { seg: false });
      b.box("velvet", X(-96), oy + 0.5, Z(s * 3.8), 4.0, 0.6, 0.2, {
        seg: false,
      });
      PF.col(X(-96), Z(s * 3.4), 4.0, 0.9, oy, oy + 0.5, 0, {
        surface: "carpet",
      });
    }
    D.painting(b, 0, X(-92.35), oy + 1.6, Z(-2.5), 1.2, 0.8, -HP, {
      frame: "gilt",
    });
    b.cyl("brass", X(-99.7), oy + 1.7, Z(3), 0.25, 0.25, 0.08, 16, {
      hSeg: 1,
      rz: HP,
    }); // barometer
    b.cyl("iron", X(-96), oy + 2.1, Z(0), 0.01, 0.01, 0.5, 3, { hSeg: 1 });
    b.cyl("lamp_warm", X(-96), oy + 1.95, Z(0), 0.12, 0.14, 0.2, 8, {
      hSeg: 1,
      noAO: true,
    });
    PF.glow(P(-96, 1.95, 0), 0xffc070, 1.2, subShip, {
      intensity: 1.1,
      flicker: 0.15,
    });
    PF.skeleton(b, X(-94.5), oy + 0.52, Z(3.3), PI); // the last captain, at rest on his settee
    anchors.saloon = A(-95, 0, -2, 0);
    anchors.captain_safe = A(-99.5, 0.4, -3.2, HP);
    anchors.captain_log = A(-96.4, 0.82, 0.3, 0);
    // officers' passage (x -92..-82): cabins as partitions with curtains, the aft companionway up
    for (const s of [-1, 1])
      b.boxMM(
        "mahogany",
        X(-89.05),
        oy,
        Z(s * 1.4),
        X(-88.95),
        oy + 2.6,
        Z(s * 4.3),
        { seg: false },
      );
    PF.colMM(X(-89.1), oy, Z(1.4), X(-88.9), oy + 2.6, Z(4.3), {
      walkable: false,
    });
    PF.colMM(X(-89.1), oy, Z(-4.3), X(-88.9), oy + 2.6, Z(-1.4), {
      walkable: false,
    });
    for (const [x, s] of [
      [-90.5, 1],
      [-90.5, -1],
    ]) {
      b.box("oak", X(x), oy + 0.35, Z(s * 3.2), 2.0, 0.08, 0.8, { seg: false });
      b.box("linen", X(x), oy + 0.43, Z(s * 3.2), 1.9, 0.12, 0.75, {
        seg: false,
      });
      PF.col(X(x), Z(s * 3.2), 2.0, 0.8, oy, oy + 0.55, 0, { surface: "wood" });
    }
    // aft companionway: a ladder up to the poop-deck hatch
    ladder(b, X(-86.8), oy, Z(-3.4), 2.6, -HP);
    anchors.companion = A(-86.8, 0, -3.4, -HP);
    anchors.aft_arrive = A(-87.2, 0, -0.3, HP + 0.3); // between the cabin partitions, looking aft into the saloon
    // ----- THE HOLD: cargo, ballast, the hatchery -----
    for (let i = 0; i < 26; i++) {
      const x = -95 + r() * 55,
        s = r() < 0.5 ? -1 : 1,
        z = s * (1.8 + r() * 1.6);
      if (x > -77 && x < -55) continue;
      if (r() < 0.5) {
        b.box("sandbag", X(x), oy + HD, Z(z), 1.2, 0.5, 0.7, {
          ry: r() * 0.4,
          seg: false,
          grime: 0.7,
        });
        b.box("sandbag", X(x + 0.1), oy + HD + 0.5, Z(z), 1.1, 0.45, 0.65, {
          ry: r() * 0.4,
          seg: false,
        });
        PF.col(X(x), Z(z), 1.2, 0.8, oy + HD, oy + HD + 0.95, 0, {
          walkable: false,
        });
      } else
        D.crates(b, X(x), oy + HD, Z(z), 1 + ((r() * 3) | 0), 900 + i, true);
    }
    for (let i = 0; i < 12; i++)
      b.rock(
        "rubble",
        X(-94 + i * 1.3),
        oy + HD,
        Z((r() - 0.5) * 3),
        0.35 + r() * 0.3,
        { flat: 0.6 },
      ); // ballast
    // the salvage crew's work lamps: caged bulbs on crates, cables snaking to a dead generator
    for (const [x, z] of [
      [-90, 2.6],
      [-80, -2.8],
      [-50, 2.8],
      [-42, -2.6],
      [-58, -3],
    ]) {
      b.box("crate", X(x), oy + HD, Z(z), 0.6, 0.5, 0.6, { seg: false });
      b.cyl("iron", X(x), oy + HD + 0.5, Z(z), 0.03, 0.03, 1.1, 4, { hSeg: 1 });
      b.sphere("lamp_warm", X(x), oy + HD + 1.7, Z(z), 0.12, { ws: 6, hs: 5 });
      b.add("iron", new THREE.TorusGeometry(0.15, 0.015, 3, 8), {
        m: PF.m4(X(x), oy + HD + 1.7, Z(z), 0, HP),
      });
      PF.glow(P(x, HD + 1.7, z), 0xffb060, 1.6, subShip, {
        intensity: 1.1,
        flicker: x === -58 ? 0.6 : 0.1,
      });
    }
    b.box("paint_orange", X(-86), oy + HD, Z(-3.0), 1.4, 0.9, 0.8, {
      seg: false,
      grime: 0.7,
    });
    D.cable(
      b,
      [
        P(-86, HD + 0.1, -2.6),
        P(-80, HD + 0.05, -2.8),
        P(-66, HD + 0.2, -3.6),
        P(-58, HD + 0.1, -3),
        P(-50, HD + 0.1, 2.8),
      ],
      0.05,
    );
    // the hatchery: mud mounds, dozens of glowing eggs, a skeleton — Cal's body with his tape reel
    const hatch = [];
    hatch.push(nest(b, X(-70), oy + HD - 0.7, Z(-1.6), 2.2, 22, subShip, 81));
    hatch.push(nest(b, X(-64), oy + HD - 0.7, Z(1.8), 1.9, 18, subShip, 82));
    hatch.push(nest(b, X(-60), oy + HD - 0.7, Z(-2.0), 1.5, 14, subShip, 83));
    PF.skeleton(b, X(-73.5), oy + HD + 0.02, Z(2.8), 0.6);
    anchors.cal = A(-73.2, HD + 0.05, 2.4, 0);
    anchors.nest = A(-66, HD - 0.7, 0, 0);
    anchors.boss = A(-64, HD - 0.7, 0, HP);
    anchors.spawn1 = A(-86, HD, 0, 0);
    anchors.spawn2 = A(-58, HD - 0.7, 1, 0);
    anchors.spawn3 = A(-45, HD, -1, 0);
    anchors.hold_fore = A(-46, HD, 0, -HP);
    anchors.hold_aft = A(-86, HD, 0, HP);
    const gShip = b.build(subShip, { lodDistInt: 300 });
    gShip.name = "seaport_ship";

    // ===================== MARKET =====================
    const MH = 7.2;
    const L2 = [];
    for (let x = 24; x <= 56; x += 8)
      for (const z of [-5, 4])
        L2.push({
          x: X(x),
          y: oy + 5,
          z: Z(z),
          color: 0xc8d4e0,
          r: 10,
          i: 0.4,
        });
    L2.push({
      x: X(40),
      y: oy + 5.4,
      z: Z(-8),
      color: 0xffd090,
      r: 8,
      i: 0.55,
    }); // counting-house
    L2.push({ x: X(23), y: oy + 2.2, z: Z(1), color: 0x90b8ff, r: 6, i: 0.5 }); // cold store
    L2.push({ x: X(58), y: oy + 2.4, z: Z(2), color: 0xffd8a0, r: 6, i: 0.4 }); // dock
    const bm = PF.batch("seaport_market");
    bm.ground = oy;
    bm.aoH = 3;
    bm.setLights(L2, 0x8a94a0, 0.1);
    const Wm = (key, ax, a0, a1, f0, f1, y0, y1, gaps) =>
      PF.wall(
        bm,
        key,
        ax,
        ax === "x" ? X(a0) : Z(a0),
        ax === "x" ? X(a1) : Z(a1),
        ax === "x" ? Z(f0) : X(f0),
        ax === "x" ? Z(f1) : X(f1),
        oy + y0,
        oy + y1,
        (gaps || []).map((g) => ({
          c: ax === "x" ? X(g.c) : Z(g.c),
          w: g.w,
          y0: oy + g.y0,
          h: g.h,
        })),
        { grime: 0.55 },
      );
    bm.boxMM("concrete", X(20), oy - 0.4, Z(-10), X(60), oy, Z(10), {
      grime: 0.7,
    });
    PF.colMM(X(20), oy - 0.4, Z(-10), X(60), oy, Z(10));
    Wm("brick", "x", 19.4, 60.6, 10, 10.6, 0, MH, [
      { c: 40, w: 3.6, y0: 0, h: 3.8 },
    ]);
    Wm("brick", "x", 19.4, 60.6, -10.6, -10, 0, MH);
    Wm("brick", "z", -10.6, 10.6, 19.4, 20, 0, MH);
    Wm("brick", "z", -10.6, 10.6, 60, 60.6, 0, MH, [
      { c: 2, w: 3.0, y0: 0, h: 3.4 },
    ]);
    // roof: trusses, corrugated sheets with holes, clerestory light shafts
    for (let x = 22; x <= 58; x += 4) {
      bm.beam("iron", P(x, MH, -10), P(x, MH + 3.2, 0), 0.2, 0.2);
      bm.beam("iron", P(x, MH, 10), P(x, MH + 3.2, 0), 0.2, 0.2);
      bm.beam("iron", P(x, MH, -10), P(x, MH, 10), 0.18, 0.18);
      for (const z of [-5, 5])
        bm.beam("iron", P(x, MH, z), P(x, MH + 1.6, z * 0.5 * 1.0), 0.08, 0.08);
    }
    for (const s of [-1, 1]) {
      for (let x = 20; x < 60; x += 4) {
        if (r() < 0.18) continue; // holes in the roof
        bm.box(
          "corrugated",
          X(x + 2),
          oy + MH + 1.6 - 0.02,
          Z(s * 5),
          4.1,
          0.06,
          10.6,
          { rx: s * -0.31, seg: false, grime: 0.7 },
        );
      }
    }
    for (let x = 24; x < 58; x += 8) {
      bm.quad("lamp_blue", X(x), oy + MH + 1.4, Z(0), 3, 2.2, {
        rx: HP,
        noAO: true,
      });
    }
    // fish stalls: three rows of counters with ice troughs, scales, hooks, signs
    const stallRow = (z, dir) => {
      for (let i = 0; i < 4; i++) {
        const x = 32 + i * 6.5;
        bm.box("tile_sub", X(x), oy, Z(z), 5.0, 0.95, 1.4, {
          seg: false,
          grime: 0.6,
        });
        bm.box("vault_steel", X(x), oy + 0.95, Z(z), 5.1, 0.1, 1.5, {
          seg: false,
        });
        // a bed of grey slush (the ice melted in 1967) with rows of old fish laid head-to-tail, some just bones
        bm.box("slush", X(x), oy + 1.0, Z(z), 4.8, 0.06, 1.2, {
          seg: false,
          grime: 0.8,
        });
        for (let k = 0; k < 12; k++) {
          const fx = x - 2.1 + (k % 6) * 0.8 + r() * 0.2,
            fz = z + (k < 6 ? -0.3 : 0.3) + (r() - 0.5) * 0.12,
            fr = 0.075 + r() * 0.03;
          if (r() < 0.25) {
            bm.beam(
              "bone",
              P(fx - 0.25, 1.08, fz),
              P(fx + 0.25, 1.08, fz),
              0.012,
              0.012,
            );
            continue;
          }
          bm.sphere(
            r() < 0.6 ? "fish" : "fish_dark",
            X(fx),
            oy + 1.07,
            Z(fz),
            fr,
            { ws: 10, hs: 6, sx: 3.4, sy: 0.5, sz: 0.85 },
          );
          bm.box(
            "fish_dark",
            X(fx + fr * 3.6),
            oy + 1.07,
            Z(fz),
            0.02,
            0.1,
            0.14,
            { seg: false },
          ); // tail
        }
        bm.box("iron", X(x), oy + 2.6, Z(z - dir * 0.7), 5.0, 0.08, 0.08, {
          seg: false,
        });
        for (let k = 0; k < 5; k++)
          bm.beam(
            "iron",
            P(x - 2 + k, 2.6, z - dir * 0.7),
            P(x - 2 + k, 2.2, z - dir * 0.7),
            0.02,
            0.02,
          );
        PF.col(X(x), Z(z), 5.0, 1.4, oy, oy + 1.05, 0, { walkable: false });
        if (r() < 0.5) {
          bm.cyl("brass", X(x + 1.5), oy + 1.05, Z(z), 0.2, 0.2, 0.05, 10, {
            hSeg: 1,
          });
          bm.box("brass", X(x + 1.5), oy + 1.1, Z(z), 0.05, 0.4, 0.05, {
            seg: false,
          });
        }
      }
    };
    stallRow(-2.2, 1);
    stallRow(3.5, -1);
    const stallNames = [
      "BIG ANDY'S — FLUKE",
      "CODFATHER",
      "THE CLAM SHACK",
      "MURPHY & SONS",
      "FRESH EELS",
    ];
    stallNames.slice(0, 4).forEach((t, i) => {
      const k = PF.texMat(
        "sp_stall" + i,
        PF.signTex("sp_stall" + i, [t], "enamel", 512, 96, {
          bg: ["#1c3a5a", "#5a1c14", "#1c4a2a", "#4a3a1c", "#2a2a4a"][i],
          fg: "#f0e8c8",
        }),
      );
      bm.quad(k, X(32 + i * 6.5), oy + 3.0, Z(-1.5), 3.2, 0.6, {});
    });
    // overturned crates, puddles, shellback shells, a dead fishmonger, nets
    for (let i = 0; i < 10; i++) {
      const cx = 28 + r() * 26;
      if (Math.abs(cx - 40) < 3.5) continue;
      D.crates(
        bm,
        X(cx),
        oy,
        Z(7.2 + r() * 1.8),
        1 + ((r() * 2) | 0),
        700 + i,
        true,
      );
    }
    for (let i = 0; i < 5; i++)
      bm.quad(
        "goo",
        X(24 + r() * 32),
        oy + 0.01,
        Z(-8 + r() * 16),
        2 + r() * 2,
        1 + r() * 2,
        { rx: -HP, uv: "box", noAO: true, grime: 0 },
      );
    for (const [x, z] of [
      [33, 6.5],
      [51, -6.5],
    ])
      bm.rock("hull_red", X(x), oy + 0.3, Z(z), 0.7, { flat: 0.45, detail: 1 });
    PF.skeleton(bm, X(46), oy + 0.02, Z(0.8), 1.2);
    nest(bm, X(52), oy, Z(7), 1.2, 9, subMarket, 91);
    // cold store (x 20..26, z -4..6)
    Wm("tile_sub", "z", -4, 6, 26, 26.3, 0, 3.2, [
      { c: 1, w: 1.4, y0: 0, h: 2.4 },
    ]);
    Wm("tile_sub", "x", 20, 26.3, -4.3, -4, 0, 3.2);
    Wm("tile_sub", "x", 20, 26.3, 6, 6.3, 0, 3.2);
    bm.boxMM("tile_sub", X(20), oy + 3.2, Z(-4.3), X(26.3), oy + 3.4, Z(6.3), {
      seg: false,
    });
    bm.box("vault_steel", X(26.5), oy, Z(2.1), 0.15, 2.4, 1.3, {
      ry: -0.9,
      seg: false,
    });
    for (let i = 0; i < 6; i++)
      bm.beam(
        "iron",
        P(21 + (i % 3) * 1.6, 3.1, -2 + Math.floor(i / 3) * 5),
        P(21 + (i % 3) * 1.6, 1.4, -2 + Math.floor(i / 3) * 5),
        0.03,
        0.03,
      );
    for (let i = 0; i < 4; i++)
      bm.box("linen", X(21 + i * 1.3), oy + 0.8, Z(-2), 0.5, 1.3, 0.3, {
        seg: false,
        c: 0xa89080,
      }); // hanging carcass sacks
    PF.skeleton(bm, X(23.5), oy + 0.02, Z(4), 0.3);
    anchors.cold_store = A(23, 0, 1, 0);
    // counting-house mezzanine (y 3.8) along the north wall: iron stair at the west end, offices behind glass
    const MZ = 3.8;
    bm.boxMM(
      "diamond",
      X(28),
      oy + MZ - 0.25,
      Z(-10),
      X(60),
      oy + MZ,
      Z(-6.8),
      { grime: 0.5 },
    );
    PF.colMM(X(28), oy + MZ - 0.25, Z(-10), X(60), oy + MZ, Z(-6.8), {
      surface: "metal",
    });
    for (let x = 30; x <= 58; x += 4) {
      bm.box("iron", X(x), oy, Z(-6.9), 0.2, MZ - 0.25, 0.2, { seg: false });
      PF.col(X(x), Z(-6.9), 0.25, 0.25, oy, oy + MZ, 0, { walkable: false });
    }
    PF.railing(
      bm,
      [
        [X(28.2), Z(-6.8)],
        [X(59.8), Z(-6.8)],
      ],
      oy + MZ,
      1.0,
      "iron",
      { collide: true },
    );
    PF.stairs(bm, "diamond", X(27), Z(-1.2), PI, 1.4, 5.4, oy, oy + MZ, {
      base: oy - 0.1,
    });
    bm.boxMM(
      "diamond",
      X(26.3),
      oy + MZ - 0.25,
      Z(-10),
      X(28),
      oy + MZ,
      Z(-6.6),
      { seg: false },
    );
    PF.colMM(X(26.3), oy + MZ - 0.25, Z(-10), X(28), oy + MZ, Z(-6.6), {
      surface: "metal",
    });
    // office partitions with glass
    for (const x of [36, 44, 52]) {
      bm.boxMM(
        "mahogany",
        X(x - 0.05),
        oy + MZ,
        Z(-10),
        X(x + 0.05),
        oy + MZ + 2.8,
        Z(-8.2),
        { seg: false },
      );
      PF.colMM(
        X(x - 0.05),
        oy + MZ,
        Z(-10),
        X(x + 0.05),
        oy + MZ + 2.8,
        Z(-8.2),
        { walkable: false },
      );
    }
    for (let x = 28.5; x < 60; x += 2) {
      if (Math.abs(x - 48.5) < 1.2) continue;
      bm.quad(
        x > 44 && x < 52 ? "planks" : "glass_dark",
        X(x),
        oy + MZ + 1.6,
        Z(-8.2),
        1.9,
        2.0,
        { noAO: true },
      );
    }
    bm.boxMM(
      "mahogany",
      X(28),
      oy + MZ + 2.8,
      Z(-10),
      X(60),
      oy + MZ + 2.95,
      Z(-8.1),
      { seg: false },
    );
    for (let x = 28; x < 60; x += 2)
      bm.box("mahogany", X(x), oy + MZ, Z(-8.2), 0.1, 2.8, 0.1, { seg: false });
    PF.colMM(X(28), oy + MZ, Z(-8.3), X(47.8), oy + MZ + 2.8, Z(-8.1), {
      walkable: false,
    });
    PF.colMM(X(49.2), oy + MZ, Z(-8.3), X(60), oy + MZ + 2.8, Z(-8.1), {
      walkable: false,
    });
    // Lottie's barricaded office door (x 48.5) — scripted
    const barricade = new THREE.Group();
    {
      const gb = PF.batch("sp_barricade");
      for (let i = 0; i < 4; i++)
        gb.box("planks", 0, 0.3 + i * 0.6, 0, 1.6, 0.3, 0.08, {
          rz: i % 2 ? 0.2 : -0.2,
          seg: false,
        });
      gb.box("rotten", 0, 0, 0.1, 1.4, 2.3, 0.08, { seg: false });
      gb.build(barricade);
    }
    barricade.position.set(X(48.5), oy + MZ, Z(-8.15));
    subMarket.add(barricade);
    const bcol = { c: null };
    const applyBar = () => {
      const open = !!PF.flag("sp_lottie_door");
      barricade.visible = !open;
      if (!open && !bcol.c)
        bcol.c = PF.col(X(48.5), Z(-8.2), 1.4, 0.3, oy + MZ, oy + MZ + 2.8, 0, {
          walkable: false,
        });
      if (open && bcol.c) {
        G.world.removeCollider(bcol.c);
        bcol.c = null;
      }
    };
    applyBar();
    PF.flagWatch.push((k) => {
      if (k === "*" || k === "sp_lottie_door") applyBar();
    });
    PF.onReset.push(() => {
      if (bcol.c) {
        G.world.removeCollider(bcol.c);
        bcol.c = null;
      }
      applyBar();
    });
    PF.use({
      pos: P(48.5, MZ + 1.3, -8.0),
      radius: 0.9,
      range: 2.6,
      label: "Barricaded Office",
      verb: () => (PF.flag("sp_lottie_door") ? "Examine" : "Knock"),
      onInteract() {
        if (PF.flag("sp_lottie_door")) {
          G.notify("Lottie's office. The barricade is down.");
          return;
        }
        PF.sfx("melee_hit", P(48.5, MZ + 1, -8.2), { volume: 0.5 });
        PF.say(
          "pf_sp_lottie",
          "Who's there? You're not a crab. Crabs don't knock. ...Hang on.",
          4,
        );
        PF.setFlag("sp_lottie_door", true);
        PF.q.advance("pf_deep", "find", "talk");
      },
    });
    // Lottie's office interior: cot, map of the Peking on the wall, rifle rack, canned food
    bm.box("iron", X(50.5), oy + MZ + 0.35, Z(-9.3), 2.0, 0.06, 0.8, {
      seg: false,
    });
    bm.box("linen", X(50.5), oy + MZ + 0.41, Z(-9.3), 1.9, 0.12, 0.75, {
      seg: false,
    });
    const plan = PF.texMat(
      "sp_plan",
      PF.signTex(
        "sp_plan",
        [
          "PEKING — HOLD PLAN",
          "FORE HATCH → DOWN",
          "NEST AMIDSHIPS!!",
          "CAPTAIN'S SAFE AFT",
        ],
        "engraved",
        512,
        320,
        { bg: "#d8d0b8", fg: "#1a2a4a" },
      ),
    );
    bm.quad(plan, X(46), oy + MZ + 1.7, Z(-9.96), 1.4, 0.9, {});
    anchors.lottie = A(47, MZ, -9.2, 0);
    anchors.lottie_stall = A(45, 0, 5.4, PI);
    bm.box("rust", X(40), oy, Z(10.25), 3.7, 3.9, 0.12, {
      seg: false,
      grime: 0.6,
    });
    bm.box("rust", X(60.2), oy, Z(2), 0.12, 3.5, 3.1, {
      seg: false,
      grime: 0.6,
    });
    anchors.mezz = A(40, MZ, -7.6, PI);
    // loading dock (east): pallets, a forklift wreck, the back door to South Street
    bm.boxMM("concrete_dark", X(56), oy, Z(-1), X(60), oy + 0.9, Z(5), {
      seg: false,
    });
    PF.colMM(X(56), oy, Z(-1), X(60), oy + 0.9, Z(5), { surface: "concrete" });
    PF.stairs(bm, "concrete_dark", X(54.2), Z(2), HP, 3, 1.8, oy, oy + 0.9, {
      base: oy - 0.1,
    }); // rises EAST onto the platform (was built facing away from it)
    bm.box("paint_orange", X(57.5), oy + 0.9, Z(-0.2), 1.2, 1.5, 2.0, {
      seg: false,
      grime: 0.7,
    });
    bm.box("iron", X(57.5), oy + 0.9, Z(1.2), 1.0, 2.6, 0.1, { seg: false });
    PF.col(X(57.5), Z(0.3), 1.3, 2.4, oy + 0.9, oy + 2.4, 0, {
      walkable: false,
    });
    anchors.dock = A(58.4, 0.9, 2.8, -HP);
    anchors.market = A(40, 0, 8, 0);
    anchors.spawn4 = A(30, 0, 0.6, 0);
    anchors.spawn5 = A(50, 0, 0.6, 0);
    anchors.spawn6 = A(44, 0, 7, 0);
    anchors.loot1 = A(23, 0, -2.5, 0);
    anchors.loot2 = A(-96, 0, 2, 0);
    anchors.loot3 = A(-44, 0, 2.6, 0);
    const gM = bm.build(subMarket, { lodDistInt: 300 });
    gM.name = "seaport_market";

    anchors.entrance = A(40, 0, 8.6, 0);
    anchors.ship_entrance = A(-44, 0, 0.8, -HP);
    // triggers
    PF.trigger(
      {
        x0: X(-77),
        x1: X(-55),
        y0: oy + HD - 2,
        y1: oy + HD + 2,
        z0: Z(-4.5),
        z1: Z(4.5),
      },
      () => {
        G.notify(
          "The hold stinks of brine and rot. The eggs pulse with a sickly green light.",
        );
        PF.q.advance("pf_deep", ["find", "talk", "ship"], "nest");
      },
      { cond: () => !PF.flag("sp_nest") },
    );
    PF.trigger(
      {
        x0: X(-48),
        x1: X(-36),
        y0: oy - 1,
        y1: oy + 2.5,
        z0: Z(-4.5),
        z1: Z(4.5),
      },
      () => {
        PF.q.advance("pf_deep", ["talk"], "ship");
      },
      {
        cond: () => PF.q.active("pf_deep") && PF.q.stage("pf_deep") === "talk",
      },
    );
    return anchors;
  }

  // ===================================================================
  // CONTENT
  // ===================================================================
  // ---- locks: the captain's safe (combination pencilled on the chart in the saloon) ----
