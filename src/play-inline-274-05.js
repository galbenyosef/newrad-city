// play-inline-274 05 — box
// Lines 1017-2524 of readable/play-inline-274.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("ansonia");
    const S = P.site("ansonia_int", {
      ox: O.x,
      oy: O.y + FY,
      oz: O.z,
      lit: true,
      ambient: 0x5e584c,
      ambI: 0.3,
      interiorKey: "ansonia",
    });
    const b = S.b;
    const L0 = 0,
      L1 = 4.5,
      L2 = 9,
      L3 = 13.5,
      LB = -4.5;
    const RW = 5.3; // spiral hall wall radius
    const LX0 = 5.6,
      LX1 = 30,
      LZ0 = -9,
      LZ1 = 9,
      AX0 = 12,
      AX1 = 24,
      AZ0 = -5,
      AZ1 = 5;

    // ------------------------------------------------------------------
    // The grand spiral stair (hall centred on 0,0; landings face east)
    // ------------------------------------------------------------------
    S.floor("mosaic", -5.6, -5.6, 5.6, 5.6, L0, {
      t: 0.4,
      surface: "concrete",
    });
    X.roundWall(S, 0, 0, RW, L0, 17, {
      key: "plaster_cream",
      n: 12,
      a0: 0,
      pilasters: "limestone_warm",
      doors: [
        { a: 0, w: 2.4, y: L0, h: 3.4 },
        { a: 0, w: 2.0, y: L1, h: 2.9 },
        { a: 0, w: 2.0, y: L2, h: 2.9 },
        { a: 0, w: 1.8, y: L3, h: 2.6 },
      ],
    });
    X.spiralStair(S, 0, 0, [L0, L1, L2, L3], {
      rIn: 1.8,
      rOut: 5.0,
      a0: 0,
      land: PI / 3,
      steps: 15,
      key: "marble",
      rail: "iron",
      cap: "brass",
    });
    // skylight + ring cornice at the top of the well
    S.ceil("plaster_cream", -5.6, -5.6, 5.6, 5.6, 17.1);
    b.cyl("stained", 0, 16.95, 0, 3.4, 3.4, 0.05, 24);
    b.torus("gold", 0, 16.9, 0, 3.5, 0.1, TAU, { rx: HP, ts: 32, rs: 4 });
    S.light(0, 15.5, 0, 0xd8e0c8, 22, 1.2);
    S.glow(0, 16.6, 0, 0xe0e8d0, 4.5);
    for (const y of [L0, L1, L2, L3]) {
      b.torus("limestone_warm", 0, y + 3.6, 0, RW - 0.2, 0.08, TAU, {
        rx: HP,
        ts: 12,
        rs: 3,
      });
    }
    // sconces up the well
    for (const [y, a] of [
      [2.6, 2.2],
      [5.8, 3.6],
      [8.2, 4.8],
      [11.2, 2.0],
      [14.6, 3.4],
    ]) {
      const px = Math.cos(a) * (RW - 0.2),
        pz = Math.sin(a) * (RW - 0.2);
      D.sconce(S, px, y, pz, -a - HP + PI, {
        r: 6,
        i: y > 12 ? 0 : 0.7,
        dark: y > 12,
      });
    }
    // medallion under the well + a body that fell
    b.cyl("brass", 0, L0 + 0.005, 0, 1.2, 1.2, 0.012, 24, { noAO: true });
    const med = P.texMat(
      "ans_medal",
      P.signTex("ans_medal", ["A"], "gilt", 256, 256, { bg: "#2a3a38" }),
      { rough: 0.4 },
    );
    b.quad(med, 0, L0 + 0.02, 0, 1.6, 1.6, { rx: -HP });
    S.prop("skeleton", -0.9, L0, 0.9, 2.2, { pose: "lying" });
    S.pickup("uw_note_ans_fall", 1, -0.4, L0 + 0.02, 1.4);
    for (const y of [L1, L2, L3])
      S.floor("marble", 4.4, -1.2, LX0 + 0.3, 1.2, y, { t: 0.3 });
    S.anchor("stair_hall", 3.2, L0, 0, HP);

    // ------------------------------------------------------------------
    // GROUND: the grand lobby (x 5.4..30, z -9..9), atrium x 12..24 z -5..5
    // ------------------------------------------------------------------
    S.floor("marble", LX0, LZ0, LX1, LZ1, L0, { t: 0.4, surface: "concrete" });
    b.box(
      "marble_green",
      AX0 - 0.6,
      L0 + 0.001,
      AZ0 - 0.6,
      AX1 + 0.6,
      L0 + 0.01,
      AZ0 - 0.3,
      { seg: false, noAO: true },
    );
    b.box(
      "marble_green",
      AX0 - 0.6,
      L0 + 0.001,
      AZ1 + 0.3,
      AX1 + 0.6,
      L0 + 0.01,
      AZ1 + 0.6,
      { seg: false, noAO: true },
    );
    D.rug(b, LX1 - 6, -1.6, LX1 - 0.6, 1.6, L0 + 0.01, "carpet_red");
    // walls
    S.wallZ(
      "plaster_cream",
      LX0,
      LZ0,
      LZ1,
      L0,
      L1,
      0.3,
      [[-1.3, 1.3, 0, 3.4]],
      { frame: "limestone_warm" },
    );
    S.wallZ("marble", LX1, LZ0, LZ1, L0, L1, 0.4, [[-1.3, 1.3, 0, 3.4]], {
      frame: "bronze",
    });
    S.wallX(
      "plaster_cream",
      LZ0,
      LX0,
      LX1,
      L0,
      L1,
      0.3,
      [
        [8.5, 10.5, 0, 2.8],
        [21, 23, 0, 2.8],
      ],
      { frame: "wood_dark" },
    );
    S.wallX(
      "plaster_cream",
      LZ1,
      LX0,
      LX1,
      L0,
      L1,
      0.3,
      [
        [8, 10, 0, 2.8],
        [20.2, 21.6, 0, 2.7],
        [23.3, 24.7, 0, 2.7],
        [26.4, 27.8, 0, 2.7],
      ],
      { frame: "bronze" },
    );
    // wainscot
    for (const z of [LZ0 + 0.16, LZ1 - 0.16])
      b.box("marble_green", LX0, L0, z - 0.02, LX1, L0 + 1.1, z + 0.02, {
        seg: false,
      });
    // ceilings: coffered, with the atrium hole
    for (let x = LX0 + 2; x < LX1; x += 3) {
      b.box(
        "limestone_warm",
        x - 0.12,
        L1 - 0.62,
        LZ0,
        x + 0.12,
        L1 - 0.3,
        AZ0,
        { seg: false },
      );
      b.box(
        "limestone_warm",
        x - 0.12,
        L1 - 0.62,
        AZ1,
        x + 0.12,
        L1 - 0.3,
        LZ1,
        { seg: false },
      );
    }
    // atrium: columns + upper gallery balustrade + laylight
    for (const [x, z] of [
      [AX0, AZ0],
      [AX0, AZ1],
      [AX1, AZ0],
      [AX1, AZ1],
      [(AX0 + AX1) / 2, AZ0],
      [(AX0 + AX1) / 2, AZ1],
    ]) {
      b.lathe(
        "marble_green",
        [
          [0.001, 0],
          [0.48, 0],
          [0.46, 0.35],
          [0.32, 0.5],
          [0.3, L1 - 0.8],
          [0.44, L1 - 0.45],
          [0.52, L1 - 0.1],
          [0.001, L1 - 0.1],
        ],
        14,
        x,
        L0,
        z,
      );
      b.box(
        "gold",
        x - 0.55,
        L1 - 0.45,
        z - 0.55,
        x + 0.55,
        L1 - 0.3,
        z + 0.55,
        { seg: false },
      );
      S.col(x - 0.4, L0, z - 0.4, x + 0.4, L1, z + 0.4, { walkable: false });
    }
    b.box(
      "limestone_warm",
      AX0 - 0.3,
      L1 - 0.5,
      AZ0 - 0.3,
      AX1 + 0.3,
      L1 + 0.05,
      AZ0 + 0.1,
      { seg: false },
    );
    b.box(
      "limestone_warm",
      AX0 - 0.3,
      L1 - 0.5,
      AZ1 - 0.1,
      AX1 + 0.3,
      L1 + 0.05,
      AZ1 + 0.3,
      { seg: false },
    );
    b.box(
      "limestone_warm",
      AX0 - 0.3,
      L1 - 0.5,
      AZ0,
      AX0 + 0.1,
      L1 + 0.05,
      AZ1,
      { seg: false },
    );
    b.box(
      "limestone_warm",
      AX1 - 0.1,
      L1 - 0.5,
      AZ0,
      AX1 + 0.3,
      L1 + 0.05,
      AZ1,
      { seg: false },
    );
    // laylight (stained glass) at the top of the atrium
    b.box("stained", AX0, L2 - 0.44, AZ0, AX1, L2 - 0.4, AZ1, { seg: false });
    b.box(
      "plaster_cream",
      AX0 - 0.3,
      L2 - 0.4,
      AZ0 - 0.3,
      AX1 + 0.3,
      L2 - 0.3,
      AZ1 + 0.3,
      { seg: false },
    );
    for (let x = AX0; x <= AX1; x += 2)
      b.box("iron", x - 0.05, L2 - 0.5, AZ0, x + 0.05, L2 - 0.4, AZ1, {
        seg: false,
      });
    for (let z = AZ0; z <= AZ1; z += 2.5)
      b.box("iron", AX0, L2 - 0.5, z - 0.05, AX1, L2 - 0.4, z + 0.05, {
        seg: false,
      });
    S.light(18, L2 - 1, 0, 0xe8e0c0, 16, 1.1);
    S.glow(18, L2 - 0.4, 0, 0xf0e6c8, 5);
    // ----- THE SEAL FOUNTAIN (dry) -----
    {
      const fx = 18,
        fz = 0;
      b.cyl("marble", fx, L0, fz, 3.3, 3.4, 0.75, 32);
      b.cyl("marble_green", fx, L0 + 0.75, fz, 3.45, 3.45, 0.12, 32);
      b.cyl("tile_green", fx, L0 + 0.05, fz, 3.0, 3.0, 0.3, 32, { noAO: true }); // basin floor (dry, cracked)
      b.cyl("dirt", fx - 1.2, L0 + 0.35, fz + 1.1, 1.1, 1.3, 0.05, 12, {
        noAO: true,
      });
      // rockwork island + the seals
      for (let i = 0; i < 7; i++) {
        const r = P.rng(i + 11);
        b.rock(
          "granite_dark",
          fx + (r() - 0.5) * 1.6,
          L0 + 0.5 + r() * 0.4,
          fz + (r() - 0.5) * 1.6,
          0.6 + r() * 0.4,
          { flat: 0.8, seed: i * 5.1 },
        );
      }
      b.rock("granite_dark", fx, L0 + 1.3, fz, 0.7, { flat: 0.9, seed: 3 });
      X.seal(b, "bronze", fx, L0 + 1.7, fz, 0.4, 1.0, "up");
      X.seal(b, "bronze", fx + 1.0, L0 + 0.9, fz - 0.6, -2.2, 0.85, "up");
      X.seal(b, "bronze", fx - 0.9, L0 + 0.95, fz + 0.2, 2.4, 0.9, "lie");
      b.sphere("verdigris", fx + 0.35, L0 + 3.2, fz + 0.3, 0.17, {
        ws: 8,
        hs: 6,
      }); // ball on the nose
      // spout pipes
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * TAU;
        b.rod(
          "bronze",
          [fx + Math.cos(a) * 3.1, L0 + 0.85, fz + Math.sin(a) * 3.1],
          [fx + Math.cos(a) * 2.8, L0 + 0.95, fz + Math.sin(a) * 2.8],
          0.05,
          5,
          { noAO: true },
        );
      }
      // a real seal's skeleton in the dry basin (they lived here once)
      D.skeleton(b, {
        pts: [
          [fx - 2.4, L0 + 0.45, fz - 1.1],
          [fx - 1.8, L0 + 0.5, fz - 1.8],
          [fx - 1.0, L0 + 0.5, fz - 2.2],
        ],
        n: 14,
        v: 0.09,
        ribs: [0.3, 0.75],
        ribLen: 0.6,
        mount: false,
        skull: { len: 0.32, h: 0.16, w: 0.2, teeth: 6 },
        floor: L0 + 0.35,
      });
      S.col(fx - 3.1, L0, fz - 3.1, fx + 3.1, L0 + 0.87, fz + 3.1, {
        surface: "concrete",
      });
      S.col(fx - 1.0, L0, fz - 1.0, fx + 1.0, L0 + 2.8, fz + 1.0, {
        walkable: false,
      });
      D.label(
        b,
        "ans_seals",
        [
          "THE ANSONIA SEALS",
          "In residence since 1904",
          "Residents are asked to feed ONLY",
          "the fish provided by the front desk.",
        ],
        fx,
        L0 + 0.55,
        fz + 3.42,
        1.1,
        0.45,
        0,
        "brass",
      );
      S.pickup("uw_note_seals", 1, fx + 2.9, L0 + 0.88, fz + 1.2);
      S.anchor("fountain", fx, L0, fz + 4, PI);
    }
    // chandeliers (west one broken/dark, east one dim)
    D.chandelier(S, 8.7, L1 - 1.3, 0, 0.9, {
      tiers: 2,
      chain: 1.1,
      broken: true,
      dark: true,
    });
    D.chandelier(S, 27.3, L1 - 1.3, 0, 0.9, {
      tiers: 2,
      chain: 1.1,
      li: 0.9,
      lr: 9,
    });
    // front desk (north side) + mail/key cubbies
    {
      const z = LZ0 + 2.2;
      b.box("wood_dark", 13, L0, z - 0.6, 23, L0 + 1.1, z, { segLen: 2 });
      b.box("marble", 12.9, L0 + 1.1, z - 0.65, 23.1, L0 + 1.16, z + 0.05, {
        seg: false,
        noAO: true,
      });
      b.box("gold", 13, L0 + 0.12, z + 0.01, 23, L0 + 0.16, z + 0.05, {
        seg: false,
        noAO: true,
      });
      S.col(13, L0, z - 0.6, 23, L0 + 1.16, z, { walkable: false });
      for (let i = 0; i < 16; i++)
        for (let j = 0; j < 5; j++) {
          b.box(
            "wood_dark",
            13.4 + i * 0.58,
            L0 + 1.3 + j * 0.42,
            LZ0 + 0.16,
            13.93 + i * 0.58,
            L0 + 1.34 + j * 0.42,
            LZ0 + 0.5,
            { seg: false, noAO: true },
          );
          if ((i * 5 + j) % 3 === 0)
            b.box(
              "paper",
              13.5 + i * 0.58,
              L0 + 1.35 + j * 0.42,
              LZ0 + 0.25,
              13.8 + i * 0.58,
              L0 + 1.55 + j * 0.42,
              LZ0 + 0.45,
              { seg: false, noAO: true },
            );
        }
      b.cyl("brass", 17.8, L0 + 1.16, z - 0.3, 0.06, 0.07, 0.06, 8, {
        noAO: true,
      });
      b.sphere("brass", 17.8, L0 + 1.23, z - 0.3, 0.05, {
        ws: 6,
        hs: 4,
        pl: TAU,
        tl: PI / 2,
      });
      S.prop("skeleton", 16.5, L0, z - 1.4, 0, { pose: "sitting" });
      S.prop("terminal", 19.8, L0 + 1.16, z - 0.35, PI, {
        terminalId: "uw_ans_desk",
        mount: "bare",
      });
      S.prop("desk", 21.8, L0, z - 1.6, PI, {
        loot: "desk",
        name: "Concierge's Drawer",
        items: [
          ["scrip", 25],
          ["scrap_metal", 3],
        ],
      });
      D.label(
        b,
        "ans_desk",
        ["RECEPTION", "Rooms · Messages · Seal Feeding 4 PM"],
        18,
        L0 + 3.3,
        LZ0 + 0.18,
        2.6,
        0.5,
        0,
        "gilt",
      );
      S.anchor("desk", 18, L0, z - 1.2, PI);
    }
    // luggage cart + palms + benches
    {
      const x = 26.5,
        z = 5.8;
      b.box("brass", x - 0.9, L0 + 0.35, z - 0.5, x + 0.9, L0 + 0.4, z + 0.5, {
        seg: false,
      });
      for (const s of [-1, 1]) {
        b.rod(
          "brass",
          [x + s * 0.85, L0 + 0.4, z],
          [x + s * 0.85, L0 + 1.9, z],
          0.03,
          5,
        );
      }
      b.rod("brass", [x - 0.85, L0 + 1.9, z], [x + 0.85, L0 + 1.9, z], 0.03, 5);
      for (const [sx, sz] of [
        [-0.8, -0.4],
        [0.8, -0.4],
        [-0.8, 0.4],
        [0.8, 0.4],
      ])
        b.cyl("rubber", x + sx, L0 + 0.12, z + sz, 0.12, 0.12, 0.06, 8, {
          rx: HP,
          noAO: true,
        });
      b.box("leather", x - 0.7, L0 + 0.4, z - 0.35, x, L0 + 0.85, z + 0.35, {
        seg: false,
      });
      b.box(
        "fabric",
        x + 0.05,
        L0 + 0.4,
        z - 0.3,
        x + 0.75,
        L0 + 0.75,
        z + 0.3,
        { seg: false },
      );
      b.box(
        "leather",
        x - 0.5,
        L0 + 0.85,
        z - 0.25,
        x + 0.3,
        L0 + 1.2,
        z + 0.25,
        { seg: false, ry: 0.2 },
      );
      S.container("Luggage Cart", x, L0 + 0.6, z, {
        loot: "luggage",
        radius: 1.0,
      });
      S.col(x - 0.9, L0, z - 0.5, x + 0.9, L0 + 1.2, z + 0.5, {
        walkable: false,
      });
    }
    D.palm(b, 7.2, L0, -7.3, 2.4);
    D.palm(b, 7.2, L0, 7.3, 2.2);
    D.palm(b, 28.5, L0, -7.3, 2.6);
    D.sofa(b, 10, L0, -6.8, 0, { fabric: "velvet" });
    D.sofa(b, 26, L0, -7.2, 0, { fabric: "velvet", w: 1.6 });
    D.chair(b, 11.3, L0, 6.8, PI, { arms: true, toppled: true });
    D.papers(b, 22, L0, 3, 3.5, 14);
    D.rubble(S, 9.5, L0, 4.8, 1.0, { n: 5 });
    // elevator bank (south wall, z=9): three brass doors; the middle one pried open
    for (const [ex, open] of [
      [20.9, false],
      [24.0, true],
      [27.1, false],
    ]) {
      b.box("brass", ex - 0.9, L0, LZ1 - 0.2, ex + 0.9, L0 + 3.2, LZ1 - 0.15, {
        seg: false,
        grime: 0.4,
      });
      if (!open) {
        b.box(
          "brass",
          ex - 0.7,
          L0,
          LZ1 - 0.22,
          ex - 0.01,
          L0 + 2.7,
          LZ1 - 0.12,
          { seg: false },
        );
        b.box(
          "brass",
          ex + 0.01,
          L0,
          LZ1 - 0.22,
          ex + 0.7,
          L0 + 2.7,
          LZ1 - 0.12,
          { seg: false },
        );
        S.col(ex - 0.7, L0, LZ1 - 0.25, ex + 0.7, L0 + 2.7, LZ1, {
          walkable: false,
        });
      } else {
        b.box(
          "brass",
          ex - 0.72,
          L0,
          LZ1 - 0.35,
          ex - 0.55,
          L0 + 2.7,
          LZ1 - 0.1,
          { seg: false, ry: 0.2 },
        );
        b.box(
          "brass",
          ex + 0.55,
          L0,
          LZ1 - 0.35,
          ex + 0.72,
          L0 + 2.7,
          LZ1 - 0.1,
          { seg: false, ry: -0.2 },
        );
      }
      // floor indicator dial
      b.cyl("brass", ex, L0 + 3.35, LZ1 - 0.18, 0.28, 0.28, 0.04, 14, {
        rx: HP,
        noAO: true,
        t0: 0,
        tl: PI,
      });
      b.box(
        "iron",
        ex - 0.01,
        L0 + 3.35,
        LZ1 - 0.24,
        ex + 0.01,
        L0 + 3.6,
        LZ1 - 0.2,
        { seg: false, rz: open ? 1.1 : -0.4 },
      );
    }
    // open shaft behind the pried door: a car stuck below, cables
    b.box("concrete_dark", 23.1, LB + 0.5, LZ1, 24.9, L1 + 4, LZ1 + 0.1, {
      seg: false,
    });
    b.box("concrete_dark", 23.1, LB + 0.5, LZ1 + 2.2, 24.9, L1 + 4, LZ1 + 2.3, {
      seg: false,
    });
    for (const x of [23.1, 24.9])
      b.box(
        "concrete_dark",
        x - 0.05,
        LB + 0.5,
        LZ1,
        x + 0.05,
        L1 + 4,
        LZ1 + 2.3,
        { seg: false },
      );
    b.box("brass", 23.2, LB + 0.6, LZ1 + 0.1, 24.8, LB + 1.2, LZ1 + 2.2, {
      seg: false,
    });
    for (const x of [23.6, 24.4])
      b.rod("iron", [x, LB + 1.2, LZ1 + 1.1], [x, L1 + 4, LZ1 + 1.1], 0.02, 3);
    S.col(23.1, L0 - 0.3, LZ1, 24.9, L0 + 3.2, LZ1 + 0.3, { walkable: false });
    // exit door (east) + anchors
    b.box("bronze", LX1 - 0.25, L0, -1.3, LX1 - 0.15, L0 + 3.4, 1.3, {
      seg: false,
    });
    b.box("glass_dark", LX1 - 0.27, L0 + 0.9, -1.0, LX1 - 0.24, L0 + 3.0, 1.0, {
      seg: false,
    });
    D.sconce(S, LX1 - 0.25, L0 + 2.6, -2.2, -HP, { r: 5, i: 0.6 });
    D.sconce(S, LX1 - 0.25, L0 + 2.6, 2.2, -HP, { r: 5, i: 0.6 });
    S.anchor("entrance", LX1 - 2.5, L0, 0, HP);
    S.anchor("spawn1", 15.5, L0, -6.5, 0);
    S.light(LX1 - 3, L0 + 3.5, 0, 0xffd8a0, 8, 0.5);
    // ----- residents' lounge (north-west) -----
    S.room({
      x0: LX0,
      z0: -18,
      x1: 18,
      z1: LZ0,
      y: L0,
      h: 4.5,
      wall: "wallpaper_green",
      floor: "parquet",
      ceil: false,
      skip: "se",
      trim: "wood_dark",
      surface: "wood",
    });
    D.fireplace(b, S, 11.5, L0, -17.85, 0, { key: "marble" });
    D.bookcase(b, LX0 + 0.35, L0, -14, HP, { w: 2.4 });
    D.sofa(b, 10.5, L0, -14.5, 0);
    D.chair(b, 13, L0, -13.2, -0.8, { arms: true });
    D.table(b, 11.6, L0, -12.8, { r: 0.5 });
    D.piano(b, 15.5, L0, -15.6, PI * 0.9);
    D.rug(b, 8.5, -16.5, 14.5, -11, L0 + 0.01, "carpet_red");
    S.prop("skeleton", 10.5, L0 + 0.45, -14.4, 0, { pose: "seated" });
    D.sconce(S, LX0 + 0.2, L0 + 2.6, -11, HP, { r: 5, i: 0.55 });
    D.sconce(S, 17.8, L0 + 2.6, -15, -HP, { r: 5, i: 0, dark: true });
    D.papers(b, 13, L0, -11, 2, 10);
    // ----- manager's office (north-east) -----
    S.room({
      x0: 18,
      z0: -18,
      x1: LX1,
      z1: LZ0,
      y: L0,
      h: 4.5,
      wall: "wood_oak",
      floor: "carpet_red",
      ceil: false,
      skip: "s",
      holes: { w: [[-14, -12.2, 0, 2.8]] },
      frame: "wood_dark",
      surface: "carpet",
    });
    S.prop("desk", 26, L0, -15.2, 0, { loot: "desk", name: "Manager's Desk" });
    S.prop("terminal", 25.4, L0 + 0.78, -15.4, 0, {
      terminalId: "uw_ans_manager",
      mount: "bare",
    });
    S.prop("file_cabinet", 29.4, L0, -12, -HP, { loot: "file_cabinet" });
    S.prop("safe", 29.5, L0 + 1.2, -16.5, -HP, {
      wall: true,
      locked: 0,
      lock: P.LOCKS.ans_safe,
      name: "Ansonia Office Safe",
      loot: "wall_safe",
      items: [
        ["scrip", 120],
        ["old_dollars", 3],
      ],
    });
    D.chair(b, 26, L0, -16.2, 0, { wood: "wood_dark", seat: "leather" });
    b.box("lamp_warm", 24, L0 + 4.3, -14, 28, L0 + 4.35, -13.6, { seg: false });
    S.light(26, L0 + 3.6, -13.5, 0xffe0b0, 7, 0.7);
    S.pickup("uw_reel_stokes", 1, 27.2, L0 + 0.8, -15.1);
    S.anchor("office", 25, L0, -12, 0);
    // ----- mail room (south-west) — the collapsed slab from 1B lands here -----
    for (const [x0, z0, x1, z1] of [
      [LX0, LZ1, 20, 11],
      [7.85, 11, 20, 20],
      [LX0, 16.4, 7.85, 20],
    ])
      S.floor("tile", x0, z0, x1, z1, L0, { t: 0.4, surface: "concrete" });
    S.wallZ("plaster_ruin", LX0, LZ1, 20, L0, L1, 0.3, []);
    S.wallZ("plaster_ruin", 20, LZ1, 20, L0, L1, 0.3, []);
    S.rail(
      "brass",
      [
        [7.85, 11],
        [7.85, 16.4],
        [LX0, 16.4],
      ],
      L0,
      1.0,
      { r: 0.03, step: 0.3 },
    );
    for (let i = 0; i < 18; i++)
      b.box(
        "brass",
        LX0 + 0.2,
        L0 + 0.4 + (i % 6) * 0.35,
        12 + Math.floor(i / 6) * 0.9,
        LX0 + 0.45,
        L0 + 0.7 + (i % 6) * 0.35,
        12.8 + Math.floor(i / 6) * 0.9,
        { seg: false, noAO: true },
      );
    S.prop("mailbox", 16.5, L0, 10.2, PI, { loot: "mail_sack" });
    b.box("wood_dark", 9, L0, 17.5, 13, L0 + 1.0, 18.4, { seg: false });
    S.col(9, L0, 17.5, 13, L0 + 1.0, 18.4, { walkable: false });
    for (let i = 0; i < 6; i++) {
      const r = P.rng(i * 9)();
      b.box(
        "canvas",
        9.2 + i * 0.6,
        L0,
        16.3,
        9.7 + i * 0.6,
        L0 + 0.5 + r * 0.3,
        17.2,
        { seg: false, ry: r },
      );
    }
    S.container("Mail Sacks", 11, L0 + 0.4, 16.8, {
      loot: "mail_sack",
      radius: 1,
    });
    D.papers(b, 13, L0, 14, 4, 30);
    S.light(12, L0 + 3.8, 14, 0xc8d8c0, 9, 0.55);
    b.box("lamp_cool", 11.4, L0 + 4.36, 13.8, 12.6, L0 + 4.4, 14.2, {
      seg: false,
    });

    // ------------------------------------------------------------------
    // BASEMENT STAIR (from the mail room) + THE CONTINENTAL BATHS
    // ------------------------------------------------------------------
    // stairwell x 5.6..7.8, descending south z 11 → 16.4
    S.stairs("marble", 6.7, 16.4, "n", 2.1, LB, L0, {
      run: 0.3,
      rise: 0.25,
      nosing: "brass",
      rail: "brass",
      railSides: [1],
    });
    S.wallZ("tile_white", 7.85, 11, 20, LB, L0 - 0.3, 0.3, []);
    b.box("tile_white", LX0 + 0.05, L0 - 0.45, 11, 7.8, L0 - 0.1, 16.4, {
      seg: false,
    }); // stair soffit visual
    D.label(
      b,
      "ans_baths",
      ["↓ THE BATHS", "Steam · Pool · Massage"],
      8.05,
      L0 + 2.2,
      11.5,
      1.2,
      0.5,
      HP,
      "gilt",
    );
    // basement landing / corridor x 5.4..8 z 16.4..20
    const BX0 = -6,
      BX1 = 30,
      BZ0 = 20,
      BZ1 = 46;
    S.floor("tile_bath", LX0, 16.4, 8, BZ0, LB, { t: 0.3 });
    S.wallZ("tile_white", LX0, 11, 20, LB, L0 - 0.3, 0.3, []);
    S.wallX("tile_white", 11, LX0, 7.85, LB, L0 - 0.4, 0.3, []);
    S.ceil("plaster", LX0, 16.4, 8, BZ0, L0 - 0.4);
    // bath hall
    S.floor("tile_bath", BX0, BZ0, BX1, 26, LB, { t: 0.3 });
    S.floor("tile_bath", BX0, 40, BX1, BZ1, LB, { t: 0.3 });
    S.floor("tile_bath", BX0, 26, 4, 40, LB, { t: 0.3 });
    S.floor("tile_bath", 24, 26, BX1, 40, LB, { t: 0.3 });
    S.ceil("plaster_ruin", BX0, BZ0, BX1, BZ1, LB + 5.2);
    S.wallX("tile_green", BZ0, BX0, BX1, LB, LB + 5.2, 0.3, [
      [LX0 + 0.1, 7.9, 0, 3],
    ]);
    S.wallX("tile_green", BZ1, BX0, BX1, LB, LB + 5.2, 0.3, []);
    S.wallZ("tile_green", BX0, BZ0, BZ1, LB, LB + 5.2, 0.3, []);
    S.wallZ("tile_green", BX1, BZ0, BZ1, LB, LB + 5.2, 0.3, []);
    // pool x 4..24, z 26..40 (floor at LB-1.9) with steps at the shallow end
    const PB = LB - 1.9;
    S.floor("tile_bath", 4, 26, 24, 40, PB, { t: 0.3 });
    for (const [x0, z0, x1, z1] of [
      [4, 26, 24, 26.3],
      [4, 39.7, 24, 40],
      [4, 26, 4.3, 40],
      [23.7, 26, 24, 40],
    ]) {
      b.box("tile_bath", x0, PB, z0, x1, LB, z1, { seg: false });
      S.col(x0, PB, z0, x1, LB, z1, { walkable: false });
    }
    for (let i = 0; i < 7; i++) {
      const y = LB - 0.27 * (i + 1);
      b.box("tile_bath", 4.3, PB, 26.3 + i * 0.35, 8.5, y, 26.65 + i * 0.35, {
        seg: false,
      });
      S.col(4.3, PB, 26.3 + i * 0.35, 8.5, y, 26.65 + i * 0.35);
    }
    b.box("marble_green", 3.7, LB, 25.7, 24.3, LB + 0.08, 26.1, { seg: false });
    b.box("marble_green", 3.7, LB, 39.9, 24.3, LB + 0.08, 40.3, { seg: false });
    // toxic water in the deep end
    b.box("water_toxic", 12, PB + 0.05, 26.3, 23.7, PB + 0.75, 39.7, {
      seg: false,
      noAO: true,
      noBake: true,
    });
    S.light(18, PB + 1.2, 33, 0x40ff60, 14, 1.1);
    S.glow(18, PB + 1.0, 33, 0x50ff60, 5);
    S.glow(14, PB + 0.9, 29, 0x50ff60, 3);
    // columns round the pool
    for (let x = 4; x <= 24; x += 5)
      for (const z of [24.5, 41.5]) {
        b.lathe(
          "tile_green",
          [
            [0.001, 0],
            [0.42, 0],
            [0.36, 0.25],
            [0.32, 4.6],
            [0.44, 5.0],
            [0.001, 5.0],
          ],
          12,
          x,
          LB,
          z,
        );
        S.col(x - 0.35, LB, z - 0.35, x + 0.35, LB + 5.2, z + 0.35, {
          walkable: false,
        });
      }
    // loungers, lockers, towels, skeleton couple, attendant booth
    for (let i = 0; i < 5; i++) {
      const x = 5 + i * 3.8,
        z = 22;
      b.box(
        "wood_rotten",
        x - 0.35,
        LB + 0.3,
        z - 1,
        x + 0.35,
        LB + 0.38,
        z + 1,
        { seg: false, rx: -0.05 },
      );
      b.box(
        "wood_rotten",
        x - 0.35,
        LB + 0.38,
        z + 0.8,
        x + 0.35,
        LB + 0.95,
        z + 1.0,
        { seg: false, rx: -0.5 },
      );
      for (const s of [-1, 1])
        b.box(
          "iron",
          x + s * 0.3,
          LB,
          z - 0.9,
          x + s * 0.3 + 0.03,
          LB + 0.3,
          z + 0.9,
          { seg: false },
        );
      if (i % 2 === 0)
        b.box(
          "fabric_white",
          x - 0.3,
          LB + 0.4,
          z - 0.6,
          x + 0.3,
          LB + 0.45,
          z + 0.3,
          { seg: false },
        );
    }
    for (let i = 0; i < 8; i++)
      S.prop("locker", BX0 + 0.5, LB, 28 + i * 1.3, HP, {
        count: 1,
        loot: i % 3 === 0 ? "locker" : undefined,
        items: i % 3 === 0 ? undefined : [],
      });
    S.prop("skeleton", 25.5, LB, 33, -HP, { pose: "lying" });
    S.prop("skeleton", 25.6, LB, 34.1, -HP, { pose: "lying" });
    b.box("fabric_white", 25, LB + 0.01, 32.3, 26.8, LB + 0.04, 34.8, {
      seg: false,
      noAO: true,
    });
    S.pickup("uw_note_baths", 1, 26.4, LB + 0.05, 32.2);
    // attendant booth
    b.box("wood_dark", 8.6, LB, 20.8, 12, LB + 1.1, 21.6, { seg: false });
    S.col(8.6, LB, 20.8, 12, LB + 1.1, 21.6, { walkable: false });
    b.box("marble", 8.5, LB + 1.1, 20.7, 12.1, LB + 1.16, 21.7, { seg: false });
    for (let i = 0; i < 4; i++)
      b.box(
        "fabric_white",
        9 + i * 0.7,
        LB + 1.16,
        21,
        9.5 + i * 0.7,
        LB + 1.3,
        21.4,
        { seg: false },
      );
    S.prop("first_aid", 12.6, LB + 1.3, 20.35, PI, { loot: "first_aid" });
    const bs = P.texMat(
      "ans_baths_sign",
      P.signTex(
        "ans_baths_sign",
        ["THE CONTINENTAL BATHS", "GENTLEMEN · LADIES · ALL WELCOME"],
        "neon",
        1024,
        192,
        { fg: "#ff9aa8" },
      ),
      { emissive: 1.2 },
    );
    b.quad(bs, 15, LB + 3.6, BZ0 + 0.17, 5.2, 0.98, { noBake: true });
    S.glow(15, LB + 3.6, BZ0 + 0.5, 0xff8aa0, 2.2);
    // steam room (south-west)
    S.room({
      x0: -6,
      z0: 40,
      x1: 2,
      z1: BZ1,
      y: LB,
      h: 5.2,
      wall: "tile_white",
      floor: "tile_bath",
      ceil: false,
      skip: "fsw",
      holes: { n: [[-3, 0, 0, 2.6]] },
      surface: "concrete",
    });
    b.box("marble", -5.7, LB, 43.5, 1.7, LB + 0.5, 45.6, { seg: false });
    b.box("marble", -5.7, LB, 41.5, -4.5, LB + 0.5, 45.6, { seg: false });
    S.col(-5.7, LB, 43.5, 1.7, LB + 0.5, 45.6, { surface: "concrete" });
    S.prop("skeleton", -3, LB + 0.5, 44.5, 0, { pose: "seated" });
    S.prop("footlocker", 1.2, LB, 41.2, PI, {
      loot: "footlocker",
      name: "Towel Chest",
    });
    // emergency lamps (red) + glowing fungus
    for (const [x, z] of [
      [-4, 22],
      [28, 22],
      [28, 44],
      [-4, 36],
    ]) {
      b.box(
        "lamp_red",
        x - 0.12,
        LB + 4.6,
        z - 0.08,
        x + 0.12,
        LB + 4.8,
        z + 0.08,
        { seg: false },
      );
      S.light(x, LB + 4.2, z, 0xff4a30, 6, 0.6);
      S.glow(x, LB + 4.7, z, 0xff4a30, 0.6);
    }
    for (const [x, z] of [
      [-5, 30],
      [29, 38],
      [3, 44],
    ])
      for (let k = 0; k < 5; k++) {
        const r = P.rng(x + k * 3 + z);
        b.sphere(
          "glow_green",
          x + (r() - 0.5) * 0.8,
          LB + 0.05,
          z + (r() - 0.5) * 0.8,
          0.08 + r() * 0.08,
          { sy: 0.6, ws: 6, hs: 4, noAO: true },
        );
      }
    S.anchor("spawn2", 16, LB, 43, PI);
    S.anchor("spawn3", -3, LB, 30, HP);
    S.anchor("baths", 10, LB, 23, PI);
    S.anchor("pool", 18, PB, 33, 0);
    S.anchor("loot1", 25.8, LB, 33.5, 0);

    // ------------------------------------------------------------------
    // LEVEL 1 (4.5): gallery over the lobby, 1A (Castellano), 1B (Maniac nest)
    // ------------------------------------------------------------------
    for (const [x0, z0, x1, z1] of [
      [LX0, LZ0, LX1, AZ0],
      [LX0, AZ1, LX1, LZ1],
      [LX0, AZ0, AX0, AZ1],
      [AX1, AZ0, LX1, AZ1],
    ])
      S.floor("carpet_red", x0, z0, x1, z1, L1, { t: 0.3, surface: "carpet" });
    // gallery balustrade round the atrium void
    X.balustrade(S, AX0, AZ0 - 0.1, AX1, AZ0 - 0.1, L1, { key: "marble" });
    X.balustrade(S, AX0, AZ1 + 0.1, AX1, AZ1 + 0.1, L1, { key: "marble" });
    X.balustrade(S, AX0 - 0.1, AZ0, AX0 - 0.1, AZ1, L1, { key: "marble" });
    X.balustrade(S, AX1 + 0.1, AZ0, AX1 + 0.1, AZ1, L1, {
      key: "marble",
      broken: 0.25,
    });
    S.wallZ(
      "plaster_cream",
      LX0,
      LZ0,
      LZ1,
      L1,
      L2,
      0.3,
      [[-1.1, 1.1, 0, 2.9]],
      { frame: "limestone_warm" },
    );
    S.wallZ("plaster_cream", LX1, LZ0, LZ1, L1, L2, 0.3, []);
    S.wallX("wallpaper", LZ0, LX0, LX1, L1, L2, 0.3, [[17, 19, 0, 2.8]], {
      frame: "wood_dark",
    });
    S.wallX("wallpaper", LZ1, LX0, LX1, L1, L2, 0.3, [[17, 19, 0, 2.8]], {
      frame: "wood_dark",
    });
    for (const [x, z, ry] of [
      [9, LZ0 + 0.18, 0],
      [27, LZ0 + 0.18, 0],
      [9, LZ1 - 0.18, PI],
      [27, LZ1 - 0.18, PI],
    ])
      D.sconce(S, x, L1 + 2.6, z, ry, { r: 5, i: 0.5 });
    D.painting(b, 12, L1 + 2.1, LZ0 + 0.17, 1.4, 1.0, 0, 1);
    D.painting(b, 24, L1 + 2.1, LZ0 + 0.17, 1.2, 0.9, 0, 4);
    S.anchor("gallery", 9, L1, 0, -HP);
    S.anchor("spawn4", 27, L1, 7, PI);
    // ----- 1A: Signor Castellano's music salon (x 12..30) + bedroom (x 5.4..12) -----
    const A1Z0 = -20;
    S.room({
      x0: 12,
      z0: A1Z0,
      x1: LX1,
      z1: LZ0,
      y: L1,
      h: 4.5,
      wall: "damask",
      floor: "parquet",
      ceil: false,
      skip: "s",
      trim: "gold",
      holes: { w: [[-15.5, -13.7, 0, 2.8]] },
      frame: "wood_dark",
      surface: "wood",
    });
    S.room({
      x0: LX0,
      z0: A1Z0,
      x1: 12,
      z1: LZ0,
      y: L1,
      h: 4.5,
      wall: "wallpaper_rose",
      floor: "parquet",
      ceil: false,
      skip: "se",
      trim: "wood_dark",
      surface: "wood",
    });
    D.piano(b, 21, L1, -15.5, PI * 1.1, {});
    S.prop("skeleton", 21.4, L1, -14.1, PI * 0.1 + PI, { pose: "seated" });
    S.pickup("uw_reel_castellano", 1, 20.5, L1 + 0.76, -14.7);
    D.chandelier(S, 21, L2 - 1.2, -14.5, 0.8, {
      tiers: 2,
      chain: 1.0,
      li: 0.7,
      lr: 8,
      color: 0xffd090,
    });
    // gramophone
    {
      const x = 27.5,
        z = -18.6;
      b.box("wood_dark", x - 0.4, L1, z - 0.4, x + 0.4, L1 + 0.8, z + 0.4, {
        seg: false,
      });
      b.cyl("brass", x, L1 + 0.8, z, 0.2, 0.2, 0.04, 12);
      b.geo(
        "brass",
        new THREE.ConeGeometry(0.35, 0.7, 12, 1, true).rotateZ(-1.1),
        P.m4(x - 0.2, L1 + 1.25, z),
        { noAO: true },
      );
    }
    for (let i = 0; i < 3; i++)
      (D.figure(
        b,
        "marble",
        13.6 + i * 1.6,
        L1 + 1.1,
        A1Z0 + 0.8,
        0,
        0.45,
        "stand",
        {},
      ),
        b.box(
          "marble",
          13.3 + i * 1.6,
          L1,
          A1Z0 + 0.5,
          13.9 + i * 1.6,
          L1 + 1.1,
          A1Z0 + 1.1,
          { seg: false },
        ));
    const op = P.texMat(
      "ans_opera",
      P.signTex(
        "ans_opera",
        ["METROPOLITAN OPERA", "CASTELLANO", "as CANIO", "PAGLIACCI · 1963"],
        "poster",
        256,
        384,
        { bg: "#d8c89a", fg: "#6a1a18" },
      ),
      {},
    );
    b.quad(op, LX1 - 0.17, L1 + 2.2, -14, 1.1, 1.65, { ry: -HP });
    for (let i = 0; i < 8; i++) {
      const r = P.rng(i * 5);
      b.box(
        "paper",
        17 + r() * 8,
        L1 + 0.012,
        -18 + r() * 5,
        17.3 + r() * 8,
        L1 + 0.02,
        -17.6 + r() * 5,
        { seg: false, ry: r() * 3, noAO: true },
      );
    }
    S.prop("radio", 28.6, L1 + 0.8, -10.2, -HP, {});
    b.box("wood_dark", 28.1, L1, -10.8, 29.6, L1 + 0.8, -9.6, { seg: false });
    S.light(18, L1 + 3.2, -10.5, 0xffd8a0, 6, 0.5);
    // bedroom
    D.bed(b, 8.2, L1, -17.4, 0, {
      posts: true,
      canopy: "velvet",
      cover: "velvet",
    });
    S.prop("file_cabinet", LX0 + 0.5, L1, -12, HP, {
      loot: "dresser",
      name: "Vanity Dresser",
    });
    D.sconce(S, 11.8, L1 + 2.4, -15, -HP, { r: 4, i: 0.45 });
    D.rug(b, 6.5, -16.5, 10.8, -11, L1 + 0.01, "carpet_red");
    S.anchor("castellano", 20, L1, -12, PI);
    S.anchor("loot2", 8, L1, -12.5, 0);
    // ----- 1B: the Maniac nest (x 5.4..30, z 9..20) -----
    const B1Z1 = 20;
    S.floor("parquet", LX0, LZ1, LX1, 13, L1, { t: 0.3, surface: "wood" });
    S.floor("parquet", LX0, 13, 14, B1Z1, L1, { t: 0.3, surface: "wood" });
    S.floor("parquet", 18, 13, LX1, B1Z1, L1, { t: 0.3, surface: "wood" });
    // the collapsed slab: a ramp from 1B's floor hole (x 14..18, z 13..20) down to the mail room
    for (let i = 0; i < 18; i++) {
      const z = 19.8 - (i + 1) * 0.37,
        top = L1 - 0.25 * (i + 1);
      b.box("concrete", 14.1, top - 0.3, z, 17.9, top, z + 0.37, {
        seg: false,
        grime: 0.6,
        rx: 0.02,
      });
      S.col(14.1, top - 0.3, z, 17.9, top, z + 0.37, { surface: "rubble" });
    }
    for (let i = 0; i < 10; i++) {
      const r = P.rng(i * 7 + 3);
      b.rod(
        "rust",
        [14.2 + r() * 3.6, L1 - r() * 3, 13 + r() * 7],
        [14 + r() * 4, L1 - r() * 2.5 + 0.8, 13 + r() * 7],
        0.018,
        3,
      );
    }
    D.rubble(S, 16, L0, 12.2, 1.2, { n: 6 });
    S.wallX("plaster_ruin", B1Z1, LX0, LX1, L0, L2, 0.3, []);
    S.wallZ("plaster_ruin", LX0, LZ1, B1Z1, L1, L2, 0.3, []);
    S.wallZ("plaster_ruin", LX1, LZ1, B1Z1, L1, L2, 0.3, []);
    // partitions in 1B (broken), mattress pile under the drop from 2B
    S.wallZ("plaster_ruin", 12, LZ1, B1Z1, L1, L2, 0.25, [[2, 5.5, 0, 4.5]]);
    S.wallZ("plaster_ruin", 24, LZ1, B1Z1, L1, L2, 0.25, [[3, 5, 0, 2.7]]);
    for (let i = 0; i < 4; i++)
      S.prop(
        "mattress",
        8.2 + (i % 2) * 1.6,
        L1,
        15 + Math.floor(i / 2) * 2.1,
        i * 0.7,
        {},
      );
    for (let i = 0; i < 6; i++) {
      const r = P.rng(i * 13 + 1);
      b.rock("bone", 22 + r() * 6, L1 + 0.05, 14 + r() * 5, 0.12 + r() * 0.1, {
        flat: 0.5,
        seed: i,
      });
    }
    b.box("blood", 25, L1 + 0.012, 15, 27.5, L1 + 0.02, 17.5, {
      seg: false,
      noAO: true,
      grime: 0.9,
    });
    D.papers(b, 27, L1, 11, 2, 10);
    S.prop("skeleton", 28.5, L1, 18.5, 2.5, { pose: "curled" });
    S.prop("footlocker", 29.3, L1, 12.2, -HP, { loot: "footlocker" });
    S.light(20, L1 + 3.6, 16, 0xb8c0a0, 7, 0.4);
    S.light(16, L0 + 3.0, 17, 0xb0b8a0, 7, 0.45);
    S.anchor("spawn5", 27, L1, 16, -HP);
    S.anchor("nest", 9, L1, 16, 0);

    // ------------------------------------------------------------------
    // LEVEL 2 (9): corridor, 2A (G. Herman), 2B (collapsed)
    // ------------------------------------------------------------------
    S.floor("carpet_red", LX0, -2, LX1, 2, L2, { t: 0.3, surface: "carpet" });
    S.ceil("plaster_cream", LX0, -2, LX1, 2, L2 + 3.6);
    S.wallZ("plaster_cream", LX0, -2, 20, L2, L3, 0.3, [[-1.1, 1.1, 0, 2.9]], {
      frame: "limestone_warm",
    });
    S.wallZ("plaster_cream", LX1, -2, 20, L2, L3, 0.3, []);
    S.wallX("damask", -2, LX0, LX1, L2, L2 + 3.6, 0.25, [[20, 21.6, 0, 2.7]], {
      frame: "wood_dark",
    });
    S.wallX("damask", 2, LX0, LX1, L2, L2 + 3.6, 0.25, [[20, 21.6, 0, 2.7]], {
      frame: "wood_dark",
    });
    for (const x of [10, 26])
      D.sconce(S, x, L2 + 2.4, -1.85, 0, {
        r: 5,
        i: x === 26 ? 0 : 0.55,
        dark: x === 26,
      });
    D.papers(b, 14, L2, 0, 1.5, 8);
    const numA = P.texMat(
      "ans_2a",
      P.signTex("ans_2a", ["2A"], "brass", 128, 96),
      {},
    );
    b.quad(numA, 22.2, L2 + 1.8, -1.86, 0.3, 0.22, {});
    const numB = P.texMat(
      "ans_2b",
      P.signTex("ans_2b", ["2B"], "brass", 128, 96),
      {},
    );
    b.quad(numB, 22.2, L2 + 1.8, 1.86, 0.3, 0.22, { ry: PI });
    S.anchor("corridor2", 12, L2, 0, -HP);
    // ----- 2A: Mr. G. Herman's trophy den -----
    S.room({
      x0: LX0,
      z0: -20,
      x1: LX1,
      z1: -2,
      y: L2,
      h: 4.5,
      wall: "wood_oak",
      floor: "parquet",
      ceil: "plaster_cream",
      skip: "s",
      trim: "wood_dark",
      surface: "wood",
      ceilOpts: {},
    });
    S.wallZ("wallpaper_green", 14, -20, -2, L2, L3, 0.25, [[-8, -6, 0, 2.8]], {
      frame: "wood_dark",
    });
    D.rug(b, 17, -16, 27, -6, L2 + 0.01, "carpet_red");
    D.sofa(b, 21, L2, -8.3, PI, { fabric: "leather", w: 2.2 });
    D.chair(b, 18.5, L2, -12, HP * 0.6, { arms: true, seat: "leather" });
    S.prop("skeleton", 18.5, L2 + 0.45, -12, HP * 0.6, { pose: "seated" });
    S.prop("radio", 19.4, L2 + 0.75, -12.8, 0, {});
    D.table(b, 19.4, L2, -12.8, { r: 0.35 });
    S.pickup("uw_note_herman", 1, 19.2, L2 + 0.76, -12.6);
    // trophy wall: pennants, framed jerseys, bat rack, the display case
    const pen = P.texMat(
      "ans_pennant",
      P.signTex("ans_pennant", ["NEW YORK"], "banner", 512, 160, {
        bg: "#1a2a5a",
        fg: "#e8e0d0",
      }),
      { double: true },
    );
    for (let i = 0; i < 4; i++)
      b.quad(pen, 16 + i * 3.2, L2 + 3.2, -19.82, 1.8, 0.5, { rz: -0.08 });
    const jer = P.texMat(
      "ans_jersey",
      P.signTex("ans_jersey", ["3"], "plain", 256, 320, {
        bg: "#e8e4d8",
        fg: "#1a2a5a",
        font: P.FONTS.SERIF,
      }),
      {},
    );
    for (let i = 0; i < 2; i++) {
      b.box(
        "gold",
        17.6 + i * 6 - 0.8,
        L2 + 1.2,
        -19.9,
        17.6 + i * 6 + 0.8,
        L2 + 2.8,
        -19.82,
        { seg: false },
      );
      b.quad(jer, 17.6 + i * 6, L2 + 2.0, -19.8, 1.4, 1.4, {});
    }
    for (let i = 0; i < 6; i++)
      b.rod(
        "wood",
        [LX1 - 0.3, L2 + 0.1, -16 + i * 0.35],
        [LX1 - 0.2, L2 + 1.3, -16 + i * 0.35],
        0.035,
        6,
        { rTop: 0.02 },
      );
    D.case(b, 22, L2, -18.4, 2.2, 0.9, 0, {
      base: "wood_dark",
      velvet: "velvet",
    });
    S.col(20.9, L2, -18.85, 23.1, L2 + 1.3, -17.95, { walkable: false });
    S.pickup("uw_sultan_bat", 1, 22, L2 + 0.95, -18.4, { rotY: HP });
    D.label(
      b,
      "ans_bat",
      [
        "THE SULTAN'S BAT",
        "Swung by Mr. G. Herman",
        "World Series, 1927 (reproduction)",
        '"Not a reproduction." — G.H.',
      ],
      22,
      L2 + 1.6,
      -18.83,
      1.0,
      0.45,
      0,
      "label",
    );
    D.chandelier(S, 21, L2 + 3.5, -11, 0.7, {
      tiers: 1,
      chain: 0.8,
      li: 0.8,
      lr: 9,
    });
    S.prop("locker", 15.2, L2, -19.2, 0, {
      loot: "locker",
      name: "Sporting Goods Locker",
    });
    // kitchen / dining (x 5.4..14)
    S.prop("fridge", 6, L2, -18.8, 0, { loot: "fridge" });
    b.box("wood_dark", 7, L2, -19.6, 13, L2 + 0.9, -18.9, { seg: false });
    b.box("marble", 7, L2 + 0.9, -19.7, 13, L2 + 0.95, -18.85, { seg: false });
    D.table(b, 9.5, L2, -12, {
      rect: [2.4, 1.1],
      top: "wood_dark",
      leg: "wood_dark",
    });
    for (const [x, z, ry] of [
      [8.8, -12.9, 0],
      [10.2, -12.9, 0],
      [8.8, -11.1, PI],
      [10.2, -11.1, PI],
    ])
      D.chair(b, x, L2, z, ry, {
        wood: "wood_dark",
        seat: "fabric",
        toppled: x > 10 && z > -12,
      });
    S.prop("first_aid", 13.7, L2 + 1.4, -15, -HP, { loot: "first_aid" });
    D.sconce(S, LX0 + 0.2, L2 + 2.4, -8, HP, { r: 5, i: 0.5 });
    S.anchor("spawn6", 24, L2, -9, 0);
    S.anchor("herman", 20, L2, -14, 0);
    S.anchor("loot3", 22, L2, -17.4, PI);
    // ----- 2B: collapsed apartment (floor hole drops into 1B's nest) -----
    S.floor("parquet", LX0, 2, LX1, 13, L2, { t: 0.3, surface: "wood" });
    S.floor("parquet", LX0, 17, LX1, 20, L2, { t: 0.3, surface: "wood" });
    S.floor("parquet", LX0, 13, 7, 17, L2, { t: 0.3, surface: "wood" });
    S.floor("parquet", 11, 13, LX1, 17, L2, { t: 0.3, surface: "wood" });
    // splintered joists round the hole (x 7..11, z 13..17)
    for (let i = 0; i < 5; i++) {
      const r = P.rng(i * 3 + 44);
      b.box(
        "wood_rotten",
        7 + i * 0.9,
        L2 - 0.6,
        12.6,
        7.15 + i * 0.9,
        L2 - 0.25,
        12.6 + 1 + r() * 2,
        { seg: false, rx: 0.3 * r() },
      );
    }
    b.box("concrete", 7, L2 - 0.35, 13, 11, L2 - 0.05, 13.3, { seg: false }); // broken edge
    S.ceil("plaster_ruin", LX0, 2, LX1, 20, L3);
    S.wallX("plaster_ruin", 20, LX0, LX1, L2, L3, 0.3, []);
    S.wallZ("plaster_ruin", 16, 2, 20, L2, L3, 0.25, [[6, 9, 0, 3.2]]);
    S.prop("barrel", 22, L2, 17.5, 0, { radioactive: true });
    S.prop("barrel", 23, L2, 18.4, 1.2, { radioactive: true, tipped: true });
    b.box("glow_green", 21.5, L2 + 0.012, 15.2, 25, L2 + 0.02, 18.6, {
      seg: false,
      noAO: true,
      noBake: true,
    });
    S.glow(23, L2 + 0.3, 17, 0x60ff50, 2.2);
    S.light(23, L2 + 0.8, 17, 0x60ff50, 7, 0.7);
    S.prop("footlocker", 28.8, L2, 18.8, -HP, {
      loot: "footlocker",
      items: [
        ["iodine_tabs", 1],
        ["prussian_blue", 1],
      ],
    });
    S.prop("skeleton", 27, L2, 5, 0.5, { pose: "reaching" });
    D.rubble(S, 26.5, L2, 5.5, 1.6, { n: 8, slab: true });
    D.bed(b, 12.8, L2, 18.7, PI, { cover: "fabric" });
    D.papers(b, 10, L2, 6, 3, 14);
    S.light(13, L2 + 3.4, 8, 0xb0b8a0, 8, 0.4);
    S.anchor("hole", 9, L2, 11.8, PI);
    S.anchor("rad_drums", 22.5, L2, 16, 0);
    // ------------------------------------------------------------------
    // L3 roof-access vestibule
    // ------------------------------------------------------------------
    S.room({
      x0: LX0,
      z0: -1.5,
      x1: 9,
      z1: 1.5,
      y: L3,
      h: 3.2,
      wall: "plaster_ruin",
      floor: "concrete",
      ceil: "concrete",
      skip: "w",
      surface: "concrete",
    });
    b.box("metal", 8.8, L3, -0.8, 8.85, L3 + 2.3, 0.8, { seg: false });
    b.box("lamp_red", 8.7, L3 + 2.5, -0.15, 8.84, L3 + 2.65, 0.15, {
      seg: false,
    });
    S.light(7.8, L3 + 2.4, 0, 0xffb080, 5, 0.6);
    S.glow(8.7, L3 + 2.58, 0, 0xff6040, 0.4);
    const ra = P.texMat(
      "ans_roofacc",
      P.signTex("ans_roofacc", ["ROOF · FARM"], "plain", 256, 64, {
        bg: "#b8a878",
        fg: "#2a2010",
      }),
      {},
    );
    b.quad(ra, 8.78, L3 + 2.0, -1.2, 0.8, 0.2, { ry: -HP });
    S.anchor("roof_access", 7.4, L3, 0, -HP);

    S.build({ interior: true });
    P.addInterior("ansonia", S.root);
    // rad hazards: the pool and the leaking drums
    const W = (x, y, z) => S.W(x, y, z);
    P.safe("rads", () => {
      const a = W(18, PB, 33);
      G.world.addRadSource({ x: a.x, y: a.y, z: a.z, radius: 8, strength: 3 });
      const c = W(22.5, L2, 17);
      G.world.addRadSource({
        x: c.x,
        y: c.y,
        z: c.z,
        radius: 3.5,
        strength: 4,
      });
    });
    return S;
  }

