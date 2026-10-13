// play-inline-305 06 — box
// Lines 886-2145 of readable/play-inline-305.pretty.js (statement-aligned).
  function buildInterior() {
    const O = P.I("journal_bldg");
    const S = P.site("dn_int", {
      ox: O.x,
      oy: O.y,
      oz: O.z,
      lit: true,
      ambient: 0x6a6458,
      ambI: 0.46,
      interiorKey: "journal_bldg",
    });
    const b = S.b;
    const rn = P.rng("dn_int");
    DN.S = S;
    // =============== vestibule ===============
    S.floor("terrazzo", -4.4, 18.2, 4.4, 27.2, 0);
    S.ceil("plaster_cream", -4.4, 18.6, 4.4, 27.2, 5.2);
    S.wallZ("black_marble", -4.4, 18.3, 27.2, 0, 5.2, 0.4);
    S.wallZ("black_marble", 4.4, 18.3, 27.2, 0, 5.2, 0.4);
    S.wallX("black_marble", 27.2, -4.6, 4.6, 0, 5.2, 0.4);
    for (let k = -1; k <= 1; k++) {
      b.box("brass", k * 2 - 0.8, 0, 26.9, k * 2 + 0.8, 3.0, 27.0, {
        seg: false,
      });
      b.box("glass_dark", k * 2 - 0.65, 0.3, 26.95, k * 2 + 0.65, 2.85, 27.0, {
        seg: false,
      });
    }
    b.box("glass", -3.2, 3.2, 26.95, 3.2, 4.8, 27.0, { seg: false });
    S.light(0, 4.4, 25, 0xffe0b0, 7, 0.7);
    b.cyl("lamp", 0, 5.0, 25, 0.5, 0.5, 0.12, 16);
    // settlers' checkpoint
    E.sandbags(S, -4.1, 21.2, -1.1, 21.2, 0, 3);
    E.sandbags(S, 1.1, 21.2, 4.1, 21.2, 0, 3);
    D.label(
      b,
      "dn_rules",
      [
        "THE DAILY RUIN — HOUSE RULES",
        "No shooting in the lobby.",
        "No shooting the globe. Ever.",
        "Tips go to the newsies.",
        "Deadline is sunset. — M.K.",
      ],
      4.17,
      2.2,
      23.5,
      1.2,
      1.0,
      -HP,
    );
    // =============== the rotunda ===============
    rotunda(S);
    // headline board (chalkboard on an easel) — drawn live by 80_content
    DN.boardPos = S.W(-6.6, 0, 15.2);
    b.box("wood_dark", -8.2, 0, 15.0, -8.1, 3.0, 15.1, { seg: false });
    b.box("wood_dark", -5.1, 0, 15.0, -5.0, 3.0, 15.1, { seg: false });
    b.box("wood_dark", -8.2, 1.0, 14.95, -5.0, 1.05, 15.3, { seg: false });
    DN.boardQuad = { x: -6.6, y: 2.05, z: 15.12, w: 3.0, h: 1.9, ry: 0 };
    // news ticker over the north arch (drawn live)
    DN.tickerQuad = { x: 0, y: 5.62, z: -2.55, w: 6.6, h: 0.42, ry: 0 };
    b.box("press_dark", -3.5, 5.35, -2.72, 3.5, 5.95, -2.6, { seg: false });
    // Nickel's newsstand inside the rotunda (south-east)
    E.booth(S, 5.9, 0, 14.1, -PI * 0.76, {
      w: 2.4,
      d: 1.4,
      key: "wood_dark",
      counter: "wood_dark",
    });
    for (let i = 0; i < 4; i++) {
      const t = (i - 1.5) * 0.4;
      b.box(
        "newsprint",
        5.4 + t * 0.8 - 0.17,
        1.0,
        13.7 - t * 0.6 - 0.2,
        5.4 + t * 0.8 + 0.17,
        1.08 + (i % 2) * 0.05,
        13.7 - t * 0.6 + 0.2,
        { ry: -PI * 0.76, seg: false },
      );
    }
    E.hangLamp(S, 5.6, RH, 13.8, { chain: 5.2, color: 0xffc880 });
    // benches around the well
    for (const a of [PI / 4 + PI / 2, -PI / 4 - PI / 2]) {
      const [px, pz] = atR(a, 6.6);
      b.boxC("wood_oak", px, 0.42, pz, 2.4, 0.08, 0.5, {
        ry: a + HP,
        seg: false,
      });
      b.boxC("brass", px, 0, pz, 2.2, 0.42, 0.3, { ry: a + HP, seg: false });
      S.colR(px, pz, 2.4, 0.5, 0, 0.5, a + HP, { walkable: true });
    }
    D.papers(b, 3, 0.012, 3, 3, 10);
    D.papers(b, -5, 0.012, 12, 2.5, 8);
    // =============== west corridor → newsroom ===============
    S.floor("terrazzo", -16.2, 5.4, -10.4, 10.6, 0);
    S.ceil("plaster_cream", -16.2, 5.4, -10.9, 10.6, 4.0);
    S.wallX("black_marble", 5.4, -16.2, -10.8, 0, 4.0, 0.3);
    S.wallX("black_marble", 10.6, -16.2, -10.8, 0, 4.0, 0.3);
    S.light(-13, 3.4, 8, 0xffe0b0, 5, 0.6);
    b.cyl("lamp", -13, 3.85, 8, 0.3, 0.3, 0.1, 12);
    D.label(
      b,
      "dn_to_news",
      ["CITY ROOM →"],
      -13,
      3.2,
      5.58,
      1.6,
      0.35,
      0,
      "brass",
    );
    // =============== the NEWSROOM ===============
    const NX0 = -40,
      NX1 = -16,
      NZ0 = -10,
      NZ1 = 22,
      NH = 4.8;
    S.room({
      x0: NX0,
      z0: NZ0,
      x1: NX1,
      z1: NZ1,
      y: 0,
      h: NH,
      wall: "plaster_green",
      floor: "lino",
      ceil: "plaster",
      trim: "wood_dark",
      holes: { e: [[5.4, 10.6, 0, 4.0]] },
    });
    // tall windows (boarded) on the west wall with daylight slits
    for (let z = NZ0 + 3; z < NZ1 - 2; z += 4) {
      b.box("glass_dark", NX0 + 0.16, 1.2, z - 0.9, NX0 + 0.2, 4.0, z + 0.9, {
        seg: false,
      });
      for (let k = 0; k < 4; k++)
        b.box(
          "wood_rotten",
          NX0 + 0.2,
          1.4 + k * 0.72,
          z - 1.05,
          NX0 + 0.28,
          1.72 + k * 0.72,
          z + 1.05,
          { seg: false, rz: 0.02 },
        );
      for (let k = 0; k < 3; k++)
        b.box(
          "lamp_dim",
          NX0 + 0.19,
          1.74 + k * 0.72,
          z - 0.9,
          NX0 + 0.21,
          1.8 + k * 0.72,
          z + 0.9,
          { seg: false, noAO: true },
        );
      S.light(NX0 + 1.2, 2.6, z, 0xd8e0c8, 4.5, 0.45);
    }
    // desk rows (4 × 4), hanging lamps over each pair
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = -34 + col * 4.4,
          z = 2 + row * 4.4;
        if (row === 0 && col === 3) continue; // Scoop's desk is special (below)
        E.desk(b, x, 0, z, PI, { phone: (row + col) % 2 === 0, clutter: true });
        D.chair(b, x, 0, z - 0.8, 0, {
          seat: "leather",
          wood: "metal",
          toppled: rn() < 0.2,
        });
        if (col % 2 === 0)
          E.hangLamp(S, x + 2.2, NH, z, {
            chain: 2.3,
            lit: rn() < 0.75,
            shade: "paint_green",
          });
      }
    }
    // Scoop Delaney's desk — photos pinned, empty chair
    E.desk(b, -20.8, 0, 2, PI, { phone: true });
    D.chair(b, -20.8, 0, 1.2, 0.4, { seat: "leather", wood: "metal" });
    E.deskLamp(S, -21.4, 0.765, 2.1, true);
    const pin = P.texMat(
      "dn_scoopboard",
      P.signTex(
        "dn_scoopboard",
        [
          "LEADS:",
          'TUDOR "COURT" — who is the king?',
          "bear @ Madison Sq (!!)",
          "Continuity @ UN?? ask Rocky",
        ],
        "label",
        512,
        384,
      ),
      { rough: 0.9 },
    );
    b.box("wood", -19.5, 1.0, -9.84, -16.5, 3.0, -9.8, { seg: false });
    b.quad(pin, -18, 2.0, -9.78, 2.8, 1.8, { ry: 0 });
    // the copy desk (horseshoe)
    for (let i = 0; i < 7; i++) {
      const a = -HP + (i / 6) * PI,
        x = -26 + Math.sin(a) * 2.0,
        z = 19.3 + Math.cos(a) * 2.0;
      E.desk(b, x, 0, z, a + PI, {
        w: 1.2,
        typewriter: i % 2 === 0,
        clutter: true,
      });
    }
    E.hangLamp(S, -26, NH, 19.3, { chain: 2.0, color: 0xffd8a0, r: 7 });
    // editor's glass office (north-west)
    const ex0 = NX0,
      ex1 = -31,
      ez0 = NZ0,
      ez1 = -1;
    const glassWall = (axis, c, a0, a1, door) => {
      const pieces = door
        ? [
            [a0, door[0]],
            [door[1], a1],
          ]
        : [[a0, a1]];
      for (const pc of pieces) {
        if (axis === "x") {
          b.box("wood_dark", pc[0], 0, c - 0.08, pc[1], 1.1, c + 0.08, {
            seg: false,
          });
          b.box("glass", pc[0], 1.1, c - 0.03, pc[1], 4.3, c + 0.03, {
            seg: false,
            noAO: true,
          });
          b.box("wood_dark", pc[0], 4.3, c - 0.08, pc[1], NH, c + 0.08, {
            seg: false,
          });
          b.box("wood_dark", pc[0], 2.95, c - 0.06, pc[1], 3.05, c + 0.06, {
            seg: false,
          });
          S.col(pc[0], 0, c - 0.1, pc[1], NH, c + 0.1, { walkable: false });
          for (let u = pc[0]; u <= pc[1] + 0.01; u += 1.5)
            b.box(
              "wood_dark",
              u - 0.05,
              1.1,
              c - 0.06,
              u + 0.05,
              4.3,
              c + 0.06,
              { seg: false },
            );
        } else {
          b.box("wood_dark", c - 0.08, 0, pc[0], c + 0.08, 1.1, pc[1], {
            seg: false,
          });
          b.box("glass", c - 0.03, 1.1, pc[0], c + 0.03, 4.3, pc[1], {
            seg: false,
            noAO: true,
          });
          b.box("wood_dark", c - 0.08, 4.3, pc[0], c + 0.08, NH, pc[1], {
            seg: false,
          });
          b.box("wood_dark", c - 0.06, 2.95, pc[0], c + 0.06, 3.05, pc[1], {
            seg: false,
          });
          S.col(c - 0.1, 0, pc[0], c + 0.1, NH, pc[1], { walkable: false });
          for (let u = pc[0]; u <= pc[1] + 0.01; u += 1.5)
            b.box(
              "wood_dark",
              c - 0.06,
              1.1,
              u - 0.05,
              c + 0.06,
              4.3,
              u + 0.05,
              { seg: false },
            );
        }
      }
      if (door) {
        if (axis === "x") {
          b.box("wood_dark", door[0], 2.3, c - 0.08, door[1], 2.45, c + 0.08, {
            seg: false,
          });
          b.box("glass", door[0], 2.45, c - 0.03, door[1], 4.3, c + 0.03, {
            seg: false,
          });
          b.box("wood_dark", door[0], 4.3, c - 0.08, door[1], NH, c + 0.08, {
            seg: false,
          });
        } else {
          b.box("wood_dark", c - 0.08, 2.3, door[0], c + 0.08, 2.45, door[1], {
            seg: false,
          });
          b.box("glass", c - 0.03, 2.45, door[0], c + 0.03, 4.3, door[1], {
            seg: false,
          });
          b.box("wood_dark", c - 0.08, 4.3, door[0], c + 0.08, NH, door[1], {
            seg: false,
          });
        }
      }
    };
    glassWall("x", ez1, ex0 + 0.15, ex1, null);
    glassWall("z", ex1, ez0 + 0.15, ez1, [-6.2, -4.8]);
    D.label(
      b,
      "dn_editor_door",
      ["M. KOWALCZYK", "EDITOR-IN-CHIEF"],
      ex1 + 0.1,
      2.6,
      -6.9,
      0.9,
      0.36,
      HP,
      "brass",
    );
    D.rug(b, -39, -9, -32, -2, 0.012, "carpet_red");
    E.desk(b, -36, 0, -6.5, PI, {
      w: 2.0,
      d: 0.9,
      phone: true,
      typewriter: true,
    });
    E.deskLamp(S, -36.8, 0.765, -6.8, true);
    D.chair(b, -36, 0, -7.4, 0, { seat: "leather", arms: true });
    D.bookcase(b, -39.6, 0, -4.5, HP, { w: 2.2 });
    for (let i = 0; i < 3; i++)
      E.cabinet(b, -39.5, 0, -8.8 + i * 0.6 + 0.1, HP);
    const pagesK = P.texMat("dn_pages", P.pagesTex(), { rough: 0.9 });
    b.box("wood_dark", -35.2, 1.4, -9.85, -32.8, 3.1, -9.8, { seg: false });
    b.quad(pagesK, -34, 2.25, -9.78, 1.5, 1.5, {
      ry: 0,
      uvRect: P.pageRect(0),
    });
    // wall clocks & framed front pages along the newsroom
    for (let i = 0; i < 4; i++) {
      b.box(
        "wood_dark",
        -30 + i * 3.6 - 0.72,
        2.0,
        NZ1 - 0.2,
        -30 + i * 3.6 + 0.72,
        3.5,
        NZ1 - 0.16,
        { seg: false },
      );
      b.quad(pagesK, -30 + i * 3.6, 2.75, NZ1 - 0.15, 1.3, 1.3, {
        ry: PI,
        uvRect: P.pageRect(i),
      });
    }
    b.quad(
      P.texMat("dn_dials", P.dialTex(), { rough: 0.5, vc: true }),
      NX1 + 0.18,
      3.6,
      16,
      1.0,
      1.0,
      { ry: -HP, uvRect: P.dialRect(0) },
    );
    // pneumatic tube + filing wall along the north
    for (let i = 0; i < 10; i++)
      E.cabinet(b, -28.5 + i * 0.62, 0, NZ0 + 0.45, 0, { open: rn() < 0.2 });
    b.rod("brass", [-29, 4.2, NZ0 + 0.3], [-17, 4.2, NZ0 + 0.3], 0.08, 8);
    b.rod("brass", [-17, 4.2, NZ0 + 0.3], [-17, 1.2, NZ0 + 0.3], 0.08, 8);
    D.papers(b, -28, 0.012, 8, 6, 30);
    D.papers(b, -22, 0.012, 16, 4, 14);
    S.prop("skeleton", -31.2, 0, 13.4, 1.2, { pose: "seated" });
    // ceiling fans
    for (const [fx, fz] of [
      [-30, 6],
      [-22, 14],
    ]) {
      b.cyl("brass", fx, NH - 0.6, fz, 0.12, 0.12, 0.2, 8);
      b.rod("iron", [fx, NH - 0.4, fz], [fx, NH, fz], 0.02, 3);
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * TAU + 0.3;
        b.box(
          "wood_dark",
          fx - 0.08,
          NH - 0.58,
          fz,
          fx + 0.08,
          NH - 0.55,
          fz + 0.75,
          { ry: a, seg: false },
        );
      }
    }
    // =============== north hall + stair down to the pressroom ===============
    S.floor("terrazzo", -3, -14, 3, -2.6, 0);
    S.ceil("plaster_cream", -3.2, -21.6, 3.2, -2.6, 5.0);
    S.wallZ("black_marble", -3, -14, -2.9, 0, 5.0, 0.3);
    S.wallZ("black_marble", 3, -14, -2.9, 0, 5.0, 0.3);
    S.wallZ("brick_buff", -2.6, -21.6, -14, -6, 5.0, 0.3);
    S.wallZ("brick_buff", 2.6, -21.6, -14, -6, 5.0, 0.3);
    S.wallX("black_marble", -14.1, -3.1, -2.45, 0, 5.0, 0.2);
    S.wallX("black_marble", -14.1, 2.45, 3.1, 0, 5.0, 0.2);
    S.stairs("concrete", 0, -21.5, "s", 4.9, -6, 0, {
      rail: "iron",
      railCol: false,
      nosing: "brass",
    });
    D.label(
      b,
      "dn_to_press",
      ["PRESSROOM ↓", "EAR PROTECTION REQUIRED"],
      0,
      3.6,
      -13.95,
      2.0,
      0.6,
      0,
      "poster",
    );
    S.light(0, 3.8, -8, 0xffe0b0, 6, 0.6);
    b.cyl("lamp", 0, 4.9, -8, 0.3, 0.3, 0.1, 12);
    E.tube(S, 0, 4.9, -18, HP, { len: 2.0, drop: 0.3, r: 7, i: 0.7 });
    // =============== the PRESSROOM ===============
    const PX0 = -24,
      PX1 = 24,
      PZ0 = -50,
      PZ1 = -21.5,
      PY = -6,
      PH = 9;
    S.room({
      x0: PX0,
      z0: PZ0,
      x1: PX1,
      z1: PZ1,
      y: PY,
      h: PH,
      wall: "brick_buff",
      floor: "concrete",
      ceil: "concrete_dark",
      trim: null,
      holes: { s: [[-2.5, 2.5, 0, 3.0]], e: [[-33.6, -28.4, 0, 4.6]] },
    });
    // painted safety stripe along the walls + steel columns
    for (const [x, z] of [
      [-18, -25],
      [-6, -25],
      [6, -25],
      [18, -25],
      [-18, -47],
      [-6, -47],
      [6, -47],
    ]) {
      b.boxC("iron", x, PY, z, 0.4, PH, 0.4, { seg: false });
      b.boxC("iron", x, PY + PH - 0.5, z, 1.0, 0.5, 0.3, { seg: false });
      S.col(x - 0.2, PY, z - 0.2, x + 0.2, PY + PH, z + 0.2, {
        walkable: false,
      });
    }
    b.box(
      "paint_cream",
      PX0 + 0.16,
      PY + 1.0,
      PZ0 + 0.16,
      PX0 + 0.2,
      PY + 1.25,
      PZ1 - 0.2,
      { seg: false, noAO: true },
    );
    for (let x = PX0 + 1; x < PX1 - 1; x += 1.2)
      b.box(
        Math.round(x / 1.2) % 2 ? "paint_black" : "paint_cream",
        x,
        PY + 0.005,
        -36.9,
        x + 1.2,
        PY + 0.012,
        -36.75,
        { seg: false, noAO: true },
      );
    // two rotary press lines
    DN.rollers = [];
    const pressLine = (lz, tag) => {
      // units
      for (let u = 0; u < 6; u++) {
        const ux = -14 + u * 3.6;
        for (const s of [-1, 1]) {
          const fz0 = lz + s * 1.35 - 0.16,
            fz1 = lz + s * 1.35 + 0.16;
          b.box("press_green", ux - 1.5, PY, fz0, ux - 1.12, PY + 4.6, fz1, {
            segLen: 2,
          });
          b.box("press_green", ux + 1.12, PY, fz0, ux + 1.5, PY + 4.6, fz1, {
            segLen: 2,
          });
          b.box(
            "press_green",
            ux - 1.12,
            PY + 4.15,
            fz0,
            ux + 1.12,
            PY + 4.6,
            fz1,
            { seg: false },
          );
          b.box("press_green", ux - 1.12, PY, fz0, ux + 1.12, PY + 0.9, fz1, {
            seg: false,
          });
          b.box(
            "press_green",
            ux - 1.12,
            PY + 2.02,
            fz0 + 0.05,
            ux + 1.12,
            PY + 2.12,
            fz1 - 0.05,
            { seg: false },
          );
          for (const yy of [1.6, 2.55])
            for (const xx of [-0.6, 0.6]) {
              b.cyl(
                "brass",
                ux + xx,
                PY + yy - 0.02,
                lz + s * 1.52,
                0.2,
                0.2,
                0.04,
                12,
                { rx: HP, noAO: true },
              );
              b.cyl(
                "press_dark",
                ux + xx,
                PY + yy - 0.25,
                lz + s * 1.35,
                0.12,
                0.12,
                0.5,
                8,
                { rx: HP, noAO: true },
              );
            }
          b.box(
            "press_dark",
            ux - 1.2,
            PY + 0.2,
            lz + s * 1.55 - 0.03,
            ux + 1.2,
            PY + 0.8,
            lz + s * 1.55 + 0.03,
            { seg: false },
          );
          b.cyl(
            "press_dark",
            ux + 0.8,
            PY + 3.2 - 0.03,
            lz + s * 1.56,
            0.62,
            0.62,
            0.06,
            20,
            { rx: HP, noAO: true },
          );
          b.torus(
            "brass",
            ux + 0.8,
            PY + 3.2,
            lz + s * 1.56 + s * 0.02,
            0.62,
            0.05,
            TAU,
            { ts: 24, rs: 4 },
          );
          for (let k = 0; k < 6; k++)
            b.sphere(
              "brass",
              ux - 1.35 + k * 0.54,
              PY + 4.45,
              lz + s * 1.52,
              0.05,
              { ws: 4, hs: 3 },
            );
        }
        S.col(ux - 1.55, PY, lz - 1.55, ux + 1.55, PY + 4.6, lz + 1.55, {
          walkable: false,
        });
        b.box(
          "press_green",
          ux - 1.5,
          PY + 4.6,
          lz - 1.5,
          ux + 1.5,
          PY + 4.8,
          lz + 1.5,
          { seg: false },
        );
        // cylinders (their texture scrolls when the press runs)
        const cyl = (x, y, r) =>
          b.cyl("roller", x, PY + y - 1.2, lz, r, r, 2.4, 20, {
            rx: HP,
            uv: "keep",
            us: 3,
            noAO: true,
            grime: 0.2,
          });
        cyl(ux - 0.6, 1.6, 0.44);
        cyl(ux + 0.6, 1.6, 0.44);
        cyl(ux - 0.6, 2.55, 0.44);
        cyl(ux + 0.6, 2.55, 0.44);
        for (let k = 0; k < 5; k++)
          cyl(ux - 1.0 + k * 0.5, 3.5 + (k % 2) * 0.28, 0.15);
        b.box(
          "ink",
          ux - 1.1,
          PY + 3.9,
          lz - 1.15,
          ux + 1.1,
          PY + 4.3,
          lz + 1.15,
          { seg: false },
        );
        b.box(
          "press_dark",
          ux - 1.4,
          PY,
          lz - 1.2,
          ux + 1.4,
          PY + 0.4,
          lz + 1.2,
          { seg: false },
        );
      }
      // paper web running the length of the line
      b.box("web", -19, PY + 2.06, lz - 1.1, 7.8, PY + 2.09, lz + 1.1, {
        uv: "keep",
        us: 12,
        seg: false,
        noAO: true,
        grime: 0.05,
      });
      // reel stand + paper roll at the west end
      for (const s of [-1, 1])
        b.box(
          "press_green",
          -19.2,
          PY,
          lz + s * 1.35 - 0.15,
          -17.2,
          PY + 2.6,
          lz + s * 1.35 + 0.15,
          { seg: false },
        );
      b.cyl("paper", -18.2, PY + 1.6 - 1.15, lz, 0.95, 0.95, 2.3, 24, {
        rx: HP,
        noAO: true,
      });
      b.cyl("press_dark", -18.2, PY + 1.6 - 1.3, lz, 0.12, 0.12, 2.6, 8, {
        rx: HP,
        noAO: true,
      });
      S.col(-19.3, PY, lz - 1.5, -17.1, PY + 2.6, lz + 1.5, {
        walkable: false,
      });
      // folder + delivery conveyor at the east end
      b.box("press_green", 8.6, PY, lz - 1.4, 12.4, PY + 5.6, lz + 1.4, {
        segLen: 2,
      });
      b.box("press_dark", 8.5, PY + 1.2, lz - 1.45, 12.5, PY + 2.2, lz + 1.45, {
        seg: false,
      });
      b.box("web", 8.52, PY + 2.06, lz - 1.0, 8.58, PY + 5.2, lz + 1.0, {
        uv: "keep",
        seg: false,
        noAO: true,
      });
      S.col(8.5, PY, lz - 1.45, 12.5, PY + 5.6, lz + 1.45, { walkable: false });
      b.box("iron", 12.4, PY + 0.9, lz - 0.6, 21.5, PY + 1.05, lz + 0.6, {
        seg: false,
      });
      b.box("web", 12.4, PY + 1.05, lz - 0.55, 21.5, PY + 1.07, lz + 0.55, {
        uv: "keep",
        us: 10,
        seg: false,
        noAO: true,
      });
      for (let x = 12.8; x < 21.5; x += 1.4) {
        b.box("iron", x - 0.05, PY, lz - 0.55, x + 0.05, PY + 0.9, lz - 0.45, {
          seg: false,
        });
        b.box("iron", x - 0.05, PY, lz + 0.45, x + 0.05, PY + 0.9, lz + 0.55, {
          seg: false,
        });
        b.box(
          "newsprint",
          x + 0.3,
          PY + 1.07,
          lz - 0.35,
          x + 0.9,
          PY + 1.25,
          lz + 0.35,
          { seg: false },
        );
      }
      S.col(12.4, PY, lz - 0.62, 21.5, PY + 1.1, lz + 0.62, {
        walkable: true,
        surface: "metal",
      });
      void tag;
    };
    pressLine(-30.5, "A");
    pressLine(-41.5, "B");
    // catwalk between the lines with stairs at the east end, control desk
    E.catwalk(S, -14.5, -36.8, 12.6, -35.2, PY + 3.0, {
      rails: ["n", "s"],
      posts: PY,
    });
    S.stairs("panel", 16.4, -36, "w", 1.5, PY, PY + 3.0, {
      rail: "iron",
      railCol: true,
      solid: false,
    });
    b.box("panel", 12.6, PY + 2.92, -36.8, 12.9, PY + 3.0, -35.2, {
      seg: false,
    });
    S.col(12.5, PY + 2.75, -36.8, 12.9, PY + 3.0, -35.2, { surface: "metal" });
    DN.pressCtl = S.W(-13.4, PY + 3.0, -36);
    b.box("press_dark", -14.4, PY + 3.0, -36.6, -13.2, PY + 4.1, -35.4, {
      seg: false,
    });
    b.box("lamp_green", -14.35, PY + 3.9, -36.3, -13.25, PY + 4.02, -35.7, {
      seg: false,
      noAO: true,
    });
    for (let k = 0; k < 6; k++)
      b.sphere(
        k % 2 ? "lamp_red" : "lamp_green",
        -14.2 + k * 0.17,
        PY + 4.12,
        -35.5,
        0.03,
        { ws: 4, hs: 3 },
      );
    // main drive motor + the big lever (west end, between the lines)
    b.box("press_dark", -23.4, PY, -38.6, -19.8, PY + 2.2, -33.4, {
      segLen: 2,
    });
    b.cyl("press_green", -21.6, PY + 2.2, -36, 1.2, 1.2, 1.3, 20, {
      rz: HP,
      noAO: true,
    });
    b.cyl("roller", -20.2 - 0.3, PY + 1.3 - 0.05, -36, 1.45, 1.45, 0.3, 24, {
      rz: HP,
      uv: "keep",
      us: 4,
      noAO: true,
    });
    for (let k = 0; k < 3; k++)
      b.box(
        "rubber",
        -20.3,
        PY + 0.2 + k * 0.08,
        -37.2,
        -18.6,
        PY + 0.26 + k * 0.08,
        -34.8,
        { seg: false, noAO: true },
      );
    S.col(-23.5, PY, -38.7, -19.2, PY + 3.4, -33.3, { walkable: false });
    const motorPlate = P.texMat(
      "dn_motor",
      P.signTex(
        "dn_motor",
        ["GOSS HEADLINER", "MAIN DRIVE No.1", "600 V — KEEP CLEAR"],
        "brass",
        512,
        256,
      ),
      { rough: 0.5 },
    );
    b.quad(motorPlate, -19.78, PY + 1.3, -36, 1.2, 0.6, { ry: HP });
    DN.motorPos = S.W(-19.3, PY + 1.2, -36);
    DN.leverPos = S.W(-18.4, PY + 1.1, -32.9);
    b.box("press_dark", -18.8, PY, -33.2, -18.0, PY + 1.0, -32.6, {
      seg: false,
    });
    DN.leverLocal = { x: -18.4, y: PY + 1.0, z: -32.9 };
    // paper roll storage + bundled papers + ink drums
    for (let i = 0; i < 6; i++)
      b.cyl(
        "paper",
        16.5 + (i % 3) * 2.1,
        PY + (i < 3 ? 0 : 1.9),
        -47.5 + (i < 3 ? 0 : 0),
        0.95,
        0.95,
        1.9,
        20,
        { noAO: true },
      );
    S.col(15.4, PY, -48.5, 22.2, PY + 3.8, -46.5, { walkable: false });
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++)
        b.box(
          "newsprint",
          17 + i * 1.2,
          PY + 0.15 + j * 0.3,
          -43 + (i % 2) * 0.1,
          18 + i * 1.2,
          PY + 0.43 + j * 0.3,
          -42.2,
          { seg: false },
        );
    b.box("wood", 16.8, PY, -43.2, 21.9, PY + 0.15, -42, { seg: false });
    for (let i = 0; i < 6; i++)
      S.prop("barrel", -22.8 + i * 1.0, PY, -49.1, 0, { chem: i % 3 === 0 });
    S.prop("workbench", -8, PY, -49.0, 0);
    S.prop("toolbox", -6.4, PY + 0.95, -49.1, 0.2, { loot: "toolbox" });
    // dock: raised platform, roll-up door, pallets
    b.box("concrete", 19.5, PY, -34.5, 24, PY + 1.0, -27.5, { seg: false });
    S.col(19.5, PY, -34.5, 24, PY + 1.0, -27.5, { surface: "concrete" });
    S.stairs("concrete", 18.3, -33.3, "e", 2.4, PY, PY + 1.0, { solid: true });
    b.box(
      "corrugated",
      PX1 - 0.12,
      PY + 1.0,
      -33.4,
      PX1 - 0.04,
      PY + 4.6,
      -28.6,
      { seg: false, grime: 0.6 },
    );
    b.box("rust", PX1 - 0.3, PY + 4.6, -33.8, PX1, PY + 5.0, -28.2, {
      seg: false,
    });
    S.prop("crate", 21.2, PY + 1.0, -33.4, 0.1, { kind: "plain" });
    S.prop("crate", 22.4, PY + 1.0, -28.6, 0.5, { kind: "plain" });
    DN.dockDoor = S.W(PX1 - 0.3, PY + 2.4, -31);
    // fluorescent fixtures
    for (let x = -18; x <= 18; x += 7.2)
      for (const z of [-26, -36, -46])
        E.tube(S, x, PY + PH, z, 0, {
          len: 2.6,
          drop: 1.0,
          lit: rn() > 0.15,
          r: 13,
          i: 1.25,
          size: 1.0,
        });
    for (const [lx, lz] of [
      [-10, -30.5],
      [2, -30.5],
      [-10, -41.5],
      [2, -41.5],
    ])
      S.light(lx, PY + 5.4, lz, 0xc8d8e8, 8, 0.6);
    // press-hall dressing: skeleton of the night foreman, spilled bundles
    S.prop("skeleton", -2.2, PY, -47.8, 0.5, { pose: "lying" });
    D.papers(b, 4, PY + 0.01, -36, 8, 40);
    const sfty = P.texMat(
      "dn_safety",
      P.signTex(
        "dn_safety",
        ["1,873 DAYS WITHOUT", "AN ACCIDENT"],
        "poster",
        512,
        192,
        { bg: "#e8d8a8", fg: "#1a3a1a" },
      ),
      { rough: 0.9 },
    );
    b.quad(sfty, 0, PY + 5.2, PZ0 + 0.18, 3.0, 1.1, { ry: 0 });
    b.quad(
      P.texMat(
        "dn_safety2",
        P.signTex(
          "dn_safety2",
          ["2,871 DAYS SINCE", "THE LAST EDITION"],
          "raider",
          512,
          192,
          { fg: "#e8e0c0" },
        ),
        { transparent: true },
      ),
      0,
      PY + 4.1,
      PZ0 + 0.2,
      3.0,
      1.0,
      { ry: 0 },
    );
    // =============== east hall: brass elevators + stair up ===============
    const HX0 = 11,
      HX1 = 19,
      HZ0 = -10,
      HZ1 = 16;
    S.floor("terrazzo", HX0 - 0.6, HZ0, HX1, HZ1, 0);
    S.wallX("black_marble", HZ0, HX0, HX1, 0, 5.0, 0.3);
    S.wallX("black_marble", HZ1, HX0, HX1, 0, 5.0, 0.3);
    S.wallZ("black_marble", HX0, HZ0, 5.4, 0, 5.0, 0.3);
    S.wallZ("black_marble", HX0, 10.6, HZ1, 0, 5.0, 0.3);
    S.wallZ("plaster_ruin", HX1, HZ1, 22, 0, 5.0, 0.3);
    S.wallZ("black_marble", HX1, HZ0, HZ1, 0, 5.0, 0.3, [[1.0, 4.0, 0, 2.6]]);
    // floor-2 slab with the stair opening (x 13..17, z -7..-0.4)
    S.floor("parquet", HX0, HZ0, 34, -6.7, 5.0, { under: "plaster" });
    S.floor("parquet", HX0, -6.7, 13, -0.4, 5.0, { under: "plaster" });
    S.floor("parquet", 17, -6.7, 34, -0.4, 5.0, { under: "plaster" });
    S.floor("parquet", HX0, -0.4, 34, 22, 5.0, { under: "plaster" });
    S.stairs("marble_cream", 15, -0.4, "n", 3.2, 0, 5.0, {
      rail: "brass",
      nosing: "brass",
      railCol: true,
    });
    S.rail(
      "brass",
      [
        [13, -6.7],
        [13, -0.4],
      ],
      5.0,
      1.0,
      { r: 0.04 },
    );
    S.rail(
      "brass",
      [
        [17, -6.7],
        [17, -0.4],
      ],
      5.0,
      1.0,
      { r: 0.04 },
    );
    S.rail(
      "brass",
      [
        [13, -0.4],
        [17, -0.4],
      ],
      5.0,
      1.0,
      { r: 0.04 },
    );
    // elevator doors (the middle one pried open onto a black shaft)
    for (let i = 0; i < 3; i++) {
      const z = 7.5 + i * 2.8;
      b.box("brass", HX1 - 0.2, 0, z - 0.95, HX1 - 0.14, 3.2, z + 0.95, {
        seg: false,
      });
      if (i === 1) {
        b.box(
          "paint_black",
          HX1 - 0.16,
          0.02,
          z - 0.7,
          HX1 - 0.1,
          2.6,
          z + 0.7,
          { seg: false, noAO: true },
        );
        b.box("brass", HX1 - 0.3, 0, z - 0.95, HX1 - 0.15, 2.6, z - 0.7, {
          seg: false,
        });
        b.rod(
          "iron",
          [HX1 - 0.12, 2.6, z],
          [HX1 - 0.12, 0.1, z + 0.2],
          0.02,
          3,
        );
      } else {
        b.box("chrome", HX1 - 0.22, 0.02, z - 0.72, HX1 - 0.16, 2.6, z - 0.02, {
          seg: false,
        });
        b.box("chrome", HX1 - 0.22, 0.02, z + 0.02, HX1 - 0.16, 2.6, z + 0.72, {
          seg: false,
        });
      }
      b.box("brass", HX1 - 0.24, 2.7, z - 0.4, HX1 - 0.18, 3.05, z + 0.4, {
        seg: false,
      });
      for (let k = 0; k < 7; k++)
        b.sphere(
          k === 3 ? "lamp_dim" : "glass_dark",
          HX1 - 0.25,
          2.88,
          z - 0.3 + k * 0.1,
          0.025,
          { ws: 4, hs: 3 },
        );
    }
    S.prop("skeleton", HX1 - 0.9, 0, 10.8, -HP, { pose: "reaching" });
    E.tube(S, 15, 5.0, 4, HP, { len: 2.2, drop: 0.3, r: 8, i: 0.7 });
    E.tube(S, 15, 5.0, 12, HP, {
      len: 2.2,
      drop: 0.3,
      r: 8,
      i: 0.7,
      lit: false,
    });
    D.label(
      b,
      "dn_to_morgue",
      ["↑ THE MORGUE (ARCHIVES)", "→ QUARTERS · CLINIC"],
      14.2,
      3.4,
      -9.8,
      2.2,
      0.6,
      0,
      "brass",
    );
    // =============== quarters & clinic (ground, east) ===============
    S.room({
      x0: 19,
      z0: -10,
      x1: 34,
      z1: 22,
      y: 0,
      h: 4.7,
      wall: "wallpaper",
      floor: "wood",
      ceil: false,
      skip: "w",
    });
    for (let i = 0; i < 5; i++) {
      S.prop("bed", 32.8, 0, 12 + i * 2.1 - 8, -HP);
    }
    for (let i = 0; i < 3; i++) S.prop("mattress", 21.2 + i * 1.5, 0, 20.4, 0);
    S.prop("locker", 33.5, 0, 16.4, -HP, {
      count: 3,
      loot: "locker",
      owner: "settlers",
      name: "Settler Lockers",
    });
    S.prop("footlocker", 31.0, 0, 7.2, -HP, {
      loot: "footlocker",
      owner: "settlers",
    });
    S.prop("barrel", 25.5, 0, 12.5, 0, { burning: true });
    S.light(25.5, 1.4, 12.5, 0xff9a40, 9, 1.1);
    D.table(b, 25.5, 0, 16.5, {
      rect: [2.2, 1.0],
      top: "wood",
      leg: "wood_dark",
    });
    for (const s of [-1, 1])
      for (const t of [-0.6, 0.6])
        D.chair(b, 25.5 + t, 0, 16.5 + s * 0.8, s > 0 ? PI : 0, {
          seat: "wood",
          wood: "wood",
        });
    b.rod("iron", [20, 3.2, 19], [33.5, 3.2, 21], 0.01, 3);
    for (let i = 0; i < 6; i++)
      b.box(
        i % 2 ? "fabric_white" : "fabric",
        21 + i * 2 - 0.3,
        2.4,
        19.1 + i * 0.3,
        21 + i * 2 + 0.3,
        3.2,
        19.14 + i * 0.3,
        { seg: false, noAO: true },
      );
    // clinic corner
    D.bed(b, 22, 0, -6.5, HP, { w: 0.95, cover: "fabric_white" });
    D.bed(b, 22, 0, -3.5, HP, { w: 0.95, cover: "fabric_white" });
    S.prop("first_aid", 19.25, 1.3, -8, HP, {
      loot: "first_aid",
      owner: "settlers",
    });
    E.hangLamp(S, 24, 4.7, -5, {
      chain: 1.4,
      shade: "paint_white",
      color: 0xf0f0e0,
      r: 7,
    });
    b.box("fabric_white", 26.4, 0, -9.8, 26.45, 2.2, -1.5, { seg: false });
    E.hangLamp(S, 26, 4.7, 4, { chain: 1.6, color: 0xffc880 });
    // =============== THE MORGUE (archive, floor 2) ===============
    const MY = 5.0;
    S.wallX("plaster", -10, HX0, 34, MY, MY + 4.4, 0.3);
    S.wallX("plaster", 22, HX0, 34, MY, MY + 4.4, 0.3);
    S.wallZ("plaster", HX0, -10, 22, MY, MY + 4.4, 0.3);
    S.wallZ("plaster", 34, -10, 22, MY, MY + 4.4, 0.3);
    S.ceil("plaster", HX0, -10, 34, 22, MY + 4.4);
    for (let row = 0; row < 5; row++) {
      const z = 1.5 + row * 3.2;
      for (let k = 0; k < 4; k++)
        D.bookcase(b, 20 + k * 1.7, MY, z, 0, {
          w: 1.7,
          h: 2.6,
          shelves: 6,
          empty: 0.25,
          wood: "wood_dark",
        });
      for (let k = 0; k < 4; k++)
        D.bookcase(b, 20 + k * 1.7, MY, z + 0.45, PI, {
          w: 1.7,
          h: 2.6,
          shelves: 6,
          empty: 0.25,
          wood: "wood_dark",
        });
      S.col(19.1, MY, z - 0.25, 26.9, MY + 2.6, z + 0.7, { walkable: false });
    }
    for (let i = 0; i < 8; i++)
      E.cabinet(b, 33.4, MY, -8.5 + i * 0.62, -HP, { open: i === 3 });
    // reading table + microfilm reader + terminal
    D.table(b, 15, MY, 8, {
      rect: [2.6, 1.2],
      top: "wood_dark",
      leg: "wood_dark",
    });
    E.deskLamp(S, 14.2, MY + 0.75, 7.8, true);
    E.deskLamp(S, 15.8, MY + 0.75, 8.2, false);
    for (let k = 0; k < 3; k++)
      b.box(
        "newsprint",
        14.8 + k * 0.1,
        MY + 0.75 + k * 0.08,
        7.8,
        15.4 + k * 0.1,
        MY + 0.83 + k * 0.08,
        8.4,
        { seg: false },
      );
    E.desk(b, 13.2, MY, 18, 0, { w: 1.4, typewriter: false });
    b.box("press_dark", 12.8, MY + 0.77, 17.9, 13.6, MY + 1.35, 18.3, {
      seg: false,
    });
    b.box("screen", 12.9, MY + 0.95, 18.31, 13.5, MY + 1.3, 18.32, {
      seg: false,
      noAO: true,
    });
    S.light(13.2, MY + 1.2, 18.6, 0x80ff90, 3, 0.4);
    // wire room (south-east corner) with teletypes and the settlement transmitter
    for (let i = 0; i < 4; i++) E.teletype(b, 28 + i * 1.3, MY, 20.6, PI);
    b.box("press_dark", 32.2, MY, 12.5, 33.8, MY + 3.2, 16.5, { segLen: 1 });
    for (let k = 0; k < 8; k++)
      b.cyl(
        k % 3 === 0 ? "lamp_dim" : "glass",
        32.15,
        MY + 1.0 + (k % 4) * 0.5,
        13 + Math.floor(k / 4) * 2.6,
        0.06,
        0.06,
        0.2,
        6,
        { rz: HP, noAO: true },
      );
    S.col(32.2, MY, 12.5, 34, MY + 3.2, 16.5, { walkable: false });
    b.rod("rust", [33, MY + 3.2, 14.5], [33, MY + 4.4, 14.5], 0.08, 6);
    S.light(31, MY + 2, 14.5, 0xffb060, 4.5, 0.6);
    S.glow(32.1, MY + 1.8, 14.5, 0xffa040, 0.6);
    E.hangLamp(S, 15, MY + 4.4, 8, { chain: 1.6, color: 0xffd8a0 });
    for (let row = 0; row < 5; row++)
      E.hangLamp(S, 23, MY + 4.4, 3.1 + row * 3.2, {
        chain: 1.2,
        color: 0xffd8a0,
        r: 6,
        i: row === 2 ? 0 : 0.75,
        lit: row !== 2,
      });
    for (let x = 12; x < 34; x += 4)
      b.box("wood_dark", x, MY + 4.1, -10, x + 0.3, MY + 4.4, 22, {
        seg: false,
      });
    E.hangLamp(S, 30, MY + 4.4, 18, { chain: 1.4, color: 0xffd0a0 });
    E.hangLamp(S, 28, MY + 4.4, -5, { chain: 1.4, color: 0xffd0a0, i: 0.6 });
    S.prop("skeleton", 30.5, MY, -2.4, 2.2, { pose: "seated" });
    D.papers(b, 22, MY + 0.01, 10, 5, 22);
    // =============== props (containers / terminals / pickups) ===============
    S.prop("terminal", -36.0, 0.765, -6.1, 0, {
      terminalId: "pe_dn_editor",
      mount: "bare",
    });
    S.prop("terminal", 13.0, MY, 12.0, HP, {
      terminalId: "pe_dn_morgue",
      mount: "own_desk",
    });
    S.prop("terminal", -13.8, PY + 3.0, -35.6, HP, {
      terminalId: "pe_dn_press",
      mount: "own_desk",
    });
    S.prop("terminal", -7.6, 0, 3.0, 0.99, {
      terminalId: "pe_dn_globe",
      mount: "own_desk",
    });
    S.prop("safe", 31.5, MY, -9.4, 0, {
      locked: 0,
      lock: P.LOCKS.dn_morgue_safe,
      name: "Morgue Safe",
      items: [
        ["scrip", 120],
        ["rally_tonic", 2],
        ["pe_dn_press_photo", 1],
      ],
    });
    S.prop("desk", -39.2, 0, -1.8, HP, {
      loot: "desk",
      owner: "settlers",
      name: "Editor's Desk",
    });
    S.prop("file_cabinet", -29.2, 0, -9.4, 0, {
      loot: "file_cabinet",
      owner: "settlers",
    });
    S.prop("file_cabinet", 33.5, MY, 6.2, -HP, { loot: "file_cabinet" });
    S.prop("ammo_box", 22.4, PY + 1.0, -30.5, 0.2, {
      loot: "ammo_box",
      owner: "settlers",
    });
    S.prop("radio", 15.8, MY + 0.76, 8.4, 0.4);
    S.prop("fizzo_machine", -8.7, 0, 12.7, 2.07);
    S.pickup("pe_reel_lastedition", 1, 14.6, MY + 0.8, 8.1);
    S.pickup("pe_note_foreman", 1, -2.0, PY + 0.05, -47.3);
    S.pickup("pe_note_style", 1, -24.3, 0.8, 5.9);
    S.pickup("rally_tonic", 1, 22.3, 0.8, -6.3);
    // =============== anchors ===============
    S.anchor("entrance", 0, 0, 24.5, 0);
    S.anchor("editor", -36, 0, -7.4, PI);
    S.anchor("scoop", -20.8, 0, 1.1, PI);
    S.anchor("lou", -17.6, PY, -36.0, -HP);
    S.anchor("merchant", 6.3, 0, 14.6, -PI * 0.76 + PI);
    S.anchor("doc", 24.2, 0, -5.2, -HP);
    S.anchor("guard1", -1.8, 0, 20.2, PI);
    S.anchor("guard2", 20.5, PY + 1.0, -31, -HP);
    S.anchor("npc1", -30, 0, 7, 0);
    S.anchor("npc2", -25.6, 0, 16.2, PI);
    S.anchor("npc3", 25.5, 0, 15.2, 0);
    S.anchor("npc4", 16.5, MY, 12, -HP);
    S.anchor("npc5", 4.5, PY, -36, HP);
    S.anchor("globe", 0, 0, 8 + WELL + 0.8, PI);
    S.anchor("press_motor", -19.0, PY, -36, -HP);
    S.anchor("press_lever", -18.4, PY, -32.4, 0);
    S.anchor("press_ctl", -12.8, PY + 3.0, -36, HP);
    S.anchor("dock", 22.6, PY + 1.0, -32.8, HP);
    S.anchor("morgue", 22, MY, 8, 0);
    S.anchor("loot1", 31.5, MY, -8.6, 0);
    S.anchor("loot2", -39, 0, -1.8, 0);
    S.anchor("loot3", 22.4, PY + 1.0, -30.5, 0);
    for (const [i, p] of [
      [1, [-8, 0, 0]],
      [2, [8, 0, 1]],
      [3, [-28, 0, 10]],
      [4, [0, PY, -26]],
      [5, [-4, PY, -46]],
      [6, [26, 0, 6]],
    ])
      S.anchor("spawn" + i, p[0], p[1], p[2], 0);
    S.build({ interior: true });
    for (const o of S._extra || []) S.root.add(o);
    // the live board & ticker quads (their canvases are redrawn by 80_content)
    DN.boardTexKey = null;
    return S;
  }

  // roller / web scroll materials (own textures so the scroll never leaks)
