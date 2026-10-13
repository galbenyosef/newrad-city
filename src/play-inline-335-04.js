// play-inline-335 04 — tint
// Lines 967-2983 of readable/play-inline-335.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "cu_int",
      off: O,
      lit: true,
      amb: [0.1, 0.1, 0.105],
      floors: [0, F2, BY, BY + 1],
      grime: 0.5,
    });
    const r = K.rng("cu_int");
    const cream = [0.95, 0.88, 0.72],
      panel = [0.42, 0.28, 0.18],
      cold = [0.75, 0.88, 1.0],
      warm = [1, 0.8, 0.55];

    // -------------------------------------------------- gaps (shared by rooms on the same wall line)
    K.gap(ctx, 0, 0, 2.4, 0, 3.4); // street doors (south wall of the lobby)
    K.gap(ctx, -8, -5, 2.2, 0, 2.8); // lobby ↔ robotics workshop
    K.gap(ctx, 8, -5, 2.2, 0, 2.8); // lobby ↔ student lounge
    K.gap(ctx, 0, -14, 4, 0, 3.2, { casing: false }); // lobby ↔ Great Hall stair (security shutter)
    K.gap(ctx, -16, -16, 2, 0, 2.6); // workshop ↔ machine shop
    K.gap(ctx, 12, -14, 1.6, 0, 2.6); // lounge ↔ lecture room
    K.gap(ctx, 0, -24, 3.6, BY, 3.0, { casing: false }); // stair → Great Hall
    K.gap(ctx, -18, -34, 1.6, BY, 2.6); // hall ↔ basement corridor
    K.gap(ctx, -18, -58, 1.6, BY, 2.4); // corridor ↔ backstage
    K.gap(ctx, -8, -54, 1.4, BY + 1, 2.4); // backstage ↔ stage
    K.gap(ctx, -22.6, -30, 2.6, BY, 2.6, { casing: false }); // corridor ↔ back stairwell
    K.gap(ctx, 6, -6, 2, F2, 2.8); // library ↔ chemistry lab
    K.gap(ctx, 6, -22, 1.4, F2, 2.4); // library ↔ dean's office
    K.gap(ctx, 10, -14, 1.4, F2, 2.4); // chem lab ↔ dean's office

    const LB = [-8.1, -0.3, -14.1, 8.1, 5.0, 0.1]; // lobby light box
    // ================================================= LOBBY
    K.room(b, ctx, {
      x0: -8,
      z0: -14,
      x1: 8,
      z1: 0,
      y: 0,
      h: 5.0,
      floor: "terrazzo",
      fc: [0.8, 0.78, 0.74],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.2,
      ceil: "tin",
      cc: [0.62, 0.6, 0.55],
      cornice: true,
    });
    b.hplate("art", 0, 0.012, -4.2, 4.2, 4.2, 0, sealCell()); // the seal set into the terrazzo
    for (const [cx, cz] of [
      [-4.5, -3.5],
      [4.5, -3.5],
      [-4.5, -10.5],
      [4.5, -10.5],
    ]) {
      K.column(b, cx, 0, cz, 0.22, 5.0, {
        kind: "iron",
        mat: "cast_iron",
        tint: [0.55, 0.55, 0.5],
      });
      b.col(cx - 0.25, 0, cz - 0.25, cx + 0.25, 5, cz + 0.25, {});
    }
    // Peter Cooper's round elevator shaft (1853 — before anyone had built an elevator to put in it)
    const EX = 0,
      EZ = -9,
      ER = 1.8;
    const gate0 = -HP - 0.5,
      gate1 = -HP + 0.5;
    K.ringWall(
      b,
      "brick_red",
      EX,
      EZ,
      ER,
      0,
      10.5,
      gate1,
      gate0 + PI * 2,
      18,
      false,
      { tint: [0.62, 0.42, 0.34] },
    );
    K.ringWall(
      b,
      "brick_red",
      EX,
      EZ,
      ER - 0.25,
      0,
      10.5,
      gate1,
      gate0 + PI * 2,
      18,
      true,
      { tint: [0.25, 0.18, 0.15], col: false },
    );
    b.face(
      "paint_black",
      EX - ER,
      0.01,
      EZ + ER,
      1,
      0,
      0,
      0,
      0,
      -1,
      ER * 2,
      ER * 2,
      { uv: "top", tint: [0.1, 0.1, 0.1] },
    );
    for (const yy of [0, F2]) {
      // gate: iron bars across the opening + brass surround
      const gx0 = EX + Math.cos(gate0) * ER,
        gz0 = EZ - Math.sin(gate0) * ER,
        gx1 = EX + Math.cos(gate1) * ER,
        gz1 = EZ - Math.sin(gate1) * ER;
      for (let k = 0; k <= 8; k++) {
        const t = k / 8,
          gx = gx0 + (gx1 - gx0) * t,
          gz = gz0 + (gz1 - gz0) * t;
        b.pipe("black_iron", gx, yy, gz, gx, yy + 2.6, gz, 0.018, 4);
      }
      b.beam("brass", gx0, yy + 2.65, gz0, gx1, yy + 2.65, gz1, 0.12, 0.1);
      b.beam("brass", gx0, yy + 1.3, gz0, gx1, yy + 1.3, gz1, 0.05, 0.04);
      b.col(
        Math.min(gx0, gx1),
        yy,
        Math.min(gz0, gz1) - 0.1,
        Math.max(gx0, gx1),
        yy + 2.7,
        Math.max(gz0, gz1) + 0.1,
        { walkable: false },
      );
    }
    // the car, stuck between the ground floor and the library
    b.boxMM("wood_dark", EX - 1.1, 3.4, EZ - 1.1, EX + 1.1, 5.9, EZ + 1.1, {
      tint: [0.45, 0.3, 0.2],
      faces: "nsewtb",
    });
    b.pipe("steel", EX, 5.9, EZ, EX, 10.5, EZ, 0.03, 4);
    b.plate(
      "art",
      EX,
      1.9,
      EZ + ER + 0.35,
      0,
      1,
      1.3,
      0.8,
      K.signCell(
        "cu_shaft_plaque",
        "THE ROUND SHAFT\nBuilt by Peter Cooper, 1853,\nbefore the passenger elevator\nwas invented. He was sure\nsomeone would invent one.",
        320,
        200,
        {
          bg: "#5a4020",
          fg: "#e8d8a8",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );
    b.boxMM(
      "brass",
      EX - 0.7,
      1.45,
      EZ + ER + 0.25,
      EX + 0.7,
      2.35,
      EZ + ER + 0.33,
      {},
    );
    // reception desk & a deactivated receptionist bot
    b.boxMM("wood_dark", -6.8, 0, -2.6, -3.2, 1.1, -1.6, { tint: panel });
    b.boxMM("marble", -6.9, 1.1, -2.7, -3.1, 1.16, -1.5, {
      tint: [0.8, 0.78, 0.74],
    });
    b.col(-6.9, 0, -2.7, -3.1, 1.16, -1.5, { tag: "counter" });
    b.geo("steel", K.sphereGeo(), {
      x: -5.2,
      y: 1.45,
      z: -2.1,
      s: 0.3,
      tint: [0.55, 0.58, 0.6],
    });
    b.pipe("steel", -5.2, 1.4, -2.1, -5.5, 1.2, -1.9, 0.03, 4);
    b.geo("lamp", K.sphereGeo(), {
      x: -5.1,
      y: 1.5,
      z: -1.82,
      s: 0.05,
      tint: [0.3, 0.3, 0.3],
    });
    b.plate(
      "art",
      -5,
      1.35,
      -1.49,
      0,
      1,
      1.4,
      0.3,
      K.signCell("cu_info", "INFORMATION", 256, 56, {
        bg: "#1c3a5a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    // bulletin board & portraits
    b.boxMM("cloth_green", 1.2, 1.3, -0.14, 5.8, 2.6, -0.1, {
      tint: [0.35, 0.3, 0.2],
    });
    for (let k = 0; k < 9; k++)
      b.plate(
        "flat",
        1.6 + (k % 5) * 0.9 + r() * 0.2,
        1.55 + Math.floor(k / 5) * 0.55 + r() * 0.1,
        -0.16,
        0,
        -1,
        0.4 + r() * 0.2,
        0.45,
        null,
        { tint: [0.85, 0.82, 0.7] },
      );
    b.plate(
      "art",
      3.5,
      2.95,
      -0.14,
      0,
      -1,
      3.2,
      0.5,
      K.signCell("cu_finals", "WINTER FINALS · MAR 5–10, 1967", 512, 80, {
        bg: "#e8e0c8",
        fg: "#7a1a10",
        font: "Arial Black, sans-serif",
      }),
    );
    K.framed(b, -7.88, 2.9, -7.5, 1, 0, 1.1, 1.4, K.painting(2, 160, 200), {
      frame: "gold",
    });
    K.framed(b, 7.88, 2.9, -7.5, -1, 0, 1.1, 1.4, K.painting(10, 160, 200), {
      frame: "gold",
    });
    b.plate(
      "neon",
      0,
      3.9,
      -13.88,
      0,
      1,
      3.6,
      0.5,
      K.neonCell("cu_hall_neon", "THE GREAT HALL ↓", 512, 72, {
        color: "#ffb040",
        font: "Georgia, serif",
      }),
      { tint: [0.6, 0.6, 0.6] },
    );
    // Proctor access panel (terminal on the wall beside the shutter)
    K.terminal(
      ctx,
      "pev_term_cu_panel",
      3.0,
      1.2,
      -13.85,
      0,
      termPanel(),
      "wall",
    );
    b.boxMM("paint_yellow", 2.4, 0.8, -13.9, 3.6, 2.0, -13.86, {
      tint: [0.8, 0.6, 0.15],
    });
    // bust of Peter Cooper on a plinth, benches, a trophy case, the Ardent Robotics partnership banner
    b.boxMM("marble", -6.9, 0, -12.9, -5.9, 1.2, -11.9, {
      tint: [0.78, 0.76, 0.72],
    });
    b.col(-6.9, 0, -12.9, -5.9, 1.2, -11.9, {});
    b.geo("bronze", K.sphereGeo(), {
      x: -6.4,
      y: 1.62,
      z: -12.4,
      sx: 0.17,
      sy: 0.21,
      sz: 0.19,
      tint: [0.4, 0.46, 0.38],
    });
    b.geo("bronze", K.sphereGeo(), {
      x: -6.4,
      y: 1.47,
      z: -12.3,
      sx: 0.14,
      sy: 0.12,
      sz: 0.1,
      tint: [0.4, 0.46, 0.38],
    });
    b.box("bronze", -6.4, 1.2, -12.4, 0.5, 0.26, 0.3, {
      tint: [0.4, 0.46, 0.38],
    });
    for (const bz of [-6.5, -9.5]) {
      b.boxMM("oak", 6.6, 0.42, bz - 1.1, 7.6, 0.48, bz + 1.1, {
        tint: [0.55, 0.4, 0.28],
      });
      for (const e of [-0.9, 0.9])
        b.boxMM(
          "cast_iron",
          6.7,
          0,
          bz + e - 0.05,
          7.5,
          0.42,
          bz + e + 0.05,
          {},
        );
      b.boxMM("oak", 7.5, 0.48, bz - 1.1, 7.6, 1.0, bz + 1.1, {
        tint: [0.5, 0.36, 0.25],
      });
      b.col(6.6, 0, bz - 1.1, 7.6, 0.5, bz + 1.1, {});
    }
    b.boxMM("wood_dark", -7.9, 0, -9.8, -7.3, 2.2, -5.2, {
      tint: panel,
      faces: "nsewt",
    });
    b.quad(
      "glass_clear",
      [-7.29, 0.9, -5.2],
      [-7.29, 0.9, -9.8],
      [-7.29, 2.1, -9.8],
      [-7.29, 2.1, -5.2],
      { tint: [0.6, 0.7, 0.66] },
    );
    for (let k = 0; k < 5; k++) {
      b.cyl("gold", -7.6, 1.0, -5.8 - k * 0.9, 0.08, 0.12, 0.3, 8);
      b.geo("gold", K.sphereGeo(), {
        x: -7.6,
        y: 1.4,
        z: -5.8 - k * 0.9,
        s: 0.09,
      });
    }
    b.col(-7.9, 0, -9.8, -7.3, 2.2, -5.2, {});
    b.quad(
      "art",
      [4.4, 1.2, -13.86],
      [5.6, 1.2, -13.86],
      [5.6, 4.8, -13.86],
      [4.4, 4.8, -13.86],
      { rect: ardentBanner(), tint: [0.85, 0.85, 0.85] },
    );
    b.hplate("decal", -1.2, 0.014, -6.8, 1.8, 1.1, 0.4, K.decal("blood", 7));
    // wrecked lobby: rubble, knocked chairs, laser scorch, robot patrol tracks
    K.rubble(b, 6.2, 0, -12.2, 1.4, 0.8, { seed: 12 });
    K.chair(b, 2.5, 0, -2.0, 0.3, { fallen: true });
    K.chair(b, -2.2, 0, -5.5, 2.1, {});
    for (let k = 0; k < 8; k++)
      b.plate(
        "decal",
        -7.88 + (k % 2) * 15.76,
        1 + r() * 2.5,
        -1 - r() * 11,
        k % 2 ? -1 : 1,
        0,
        0.7,
        0.7,
        K.decal("scorch", 60 + k),
      );
    K.litter(b, -7.5, -13.5, 7.5, -0.5, 0, 22, 401);
    K.skel(ctx, 1.4, 0, -12.6, 0.4, "lying");
    // lights: cold emergency tubes + a flickering chandelier
    for (const lx of [-5.5, 5.5])
      K.lamp(b, lx, 4.1, -2.5, "globe", warm, 0.75, 8, {
        ceil: 5.0,
        size: 0.16,
        glowSize: 0.7,
        lightOpts: { box: LB },
      });
    K.lamp(b, 0, 4.2, -12.2, "globe", warm, 0.6, 7, {
      ceil: 5.0,
      size: 0.16,
      glowSize: 0.7,
      lightOpts: { box: LB },
    });
    K.lamp(b, -4.5, 4.7, -7, "tube", cold, 0.55, 6, {
      ceil: 5.0,
      len: 1.4,
      alongX: false,
      lightOpts: { box: LB },
    });
    K.lamp(b, 4.5, 4.7, -7, "tube", cold, 0, 0, {
      ceil: 5.0,
      len: 1.4,
      alongX: false,
      dead: true,
    });
    b.light(0, 2.5, -12.8, [1, 0.3, 0.15], 0.8, 5, { box: LB });
    b.glow(0, 3.5, -13.7, [1, 0.25, 0.1], 1.2);
    b.light(0, 2.4, -0.6, [0.8, 0.82, 0.75], 0.7, 6, { box: LB }); // grey daylight through the fanlight
    b.plate("lamp", 0, 4.2, -0.12, 0, -1, 2.4, 0.7, null, {
      tint: [0.35, 0.36, 0.33],
    });

    // ================================================= GREAT HALL STAIR (lobby → basement)
    K.room(b, ctx, {
      x0: -2,
      z0: -24,
      x1: 2,
      z1: -14,
      y: BY,
      h: 5.0 - BY,
      noFloor: true,
      floor: "terrazzo",
      wall: "plaster",
      wc: [0.72, 0.68, 0.6],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      trim: false,
    });
    K.stairs(b, -1.9, -24, 1.9, -14, BY, 0, "+z", {
      mat: "marble",
      tint: [0.78, 0.76, 0.72],
      rail: "both",
      railMat: "brass",
      handMat: "brass",
    });
    K.lamp(b, 0, -0.6, -19, "globe", warm, 0.7, 7, {
      ceil: 5.0,
      size: 0.2,
      lightOpts: { box: [-2.1, BY, -24.1, 2.1, 5, -13.9] },
    });
    b.plate(
      "art",
      -1.88,
      1.5,
      -18,
      1,
      0,
      1.6,
      1.0,
      K.signCell(
        "cu_lincoln_plq",
        'On Feb. 27, 1860\nABRAHAM LINCOLN\nspoke in the Great Hall below:\n"Right makes might."',
        320,
        200,
        {
          bg: "#4a3a20",
          fg: "#e8d8a8",
          font: "Georgia, serif",
          border: "#c8a050",
        },
      ),
    );

    // ================================================= WEST: ROBOTICS WORKSHOP
    const W1B = [-24.1, -0.3, -16.1, -7.9, 5.0, 0.1];
    K.room(b, ctx, {
      x0: -24,
      z0: -16,
      x1: -8,
      z1: 0,
      y: 0,
      h: 5.0,
      floor: "concrete",
      fc: [0.6, 0.6, 0.58],
      wall: "tile",
      wc: [0.78, 0.8, 0.76],
      ceil: "concrete",
      cc: [0.5, 0.5, 0.48],
      trim: false,
    });
    // workbenches along the walls
    for (let k = 0; k < 3; k++) {
      const z = -3 - k * 4.6;
      const t = K.table(b, -22.9, 0, z, 1.2, 3.2, {
        mat: "metal",
        tint: [0.5, 0.52, 0.5],
        legMat: "metal",
      });
      b.boxMM("cloth_green", -23.95, 1.1, z - 1.6, -23.9, 2.6, z + 1.6, {
        tint: [0.4, 0.34, 0.24],
      }); // pegboard
      for (let i = 0; i < 7; i++)
        b.box(
          "steel",
          -23.85,
          1.3 + (i % 3) * 0.4,
          z - 1.3 + i * 0.4,
          0.05,
          0.25 + r() * 0.15,
          0.06,
          { tint: [0.6, 0.6, 0.6] },
        );
      // parts on the bench
      b.cyl("metal", -22.8, t, z - 0.8, 0.14, 0.14, 0.2, 8, {
        tint: [0.5, 0.55, 0.6],
      });
      b.box("paint_black", -22.8, t, z + 0.3, 0.45, 0.3, 0.35, {
        tint: [0.15, 0.15, 0.15],
      });
      b.pipe(
        "rust",
        -23.1,
        t + 0.05,
        z + 0.9,
        -22.5,
        t + 0.05,
        z + 1.2,
        0.025,
        4,
      );
    }
    // the dissected patrolman on the central table
    const dT = K.table(b, -15, 0, -8, 3.2, 1.6, {
      mat: "steel",
      tint: [0.55, 0.57, 0.58],
      legMat: "steel",
    });
    b.box("metal", -15.4, dT, -8, 0.9, 0.55, 0.7, { tint: [0.52, 0.58, 0.54] });
    b.geo("metal", K.sphereGeo(), {
      x: -14.1,
      y: dT + 0.25,
      z: -8,
      sx: 0.28,
      sy: 0.24,
      sz: 0.28,
      tint: [0.52, 0.58, 0.54],
    });
    b.geo("lamp", K.sphereGeo(), {
      x: -14.1,
      y: dT + 0.28,
      z: -7.76,
      s: 0.06,
      tint: [0.25, 0.25, 0.25],
    });
    for (let i = 0; i < 5; i++)
      b.pipe(
        "rubber",
        -15.4 + r() * 0.8,
        dT + 0.4,
        -8 + (r() - 0.5) * 0.6,
        -16.4 + r(),
        dT + 0.02,
        -8 + (r() - 0.5) * 1.2,
        0.015,
        4,
        { tint: [0.6, 0.15 + r() * 0.5, 0.1] },
      );
    b.cyl("metal", -16.4, dT, -7.6, 0.08, 0.08, 0.7, 6, {
      tint: [0.5, 0.55, 0.52],
    }); // detached arm
    // overhead gantry hoist with a dangling robot torso
    b.beam("rust", -23.8, 4.4, -8, -8.2, 4.4, -8, 0.25, 0.3);
    b.pipe("steel", -12, 4.3, -8, -12, 2.8, -8, 0.02, 4);
    b.cyl("paint_yellow", -12, 2.0, -8, 0.45, 0.4, 0.8, 10, {
      tint: [0.7, 0.55, 0.2],
    });
    b.geo("steel", K.sphereGeo(), { x: -12, y: 2.95, z: -8, s: 0.25 });
    // chalkboard: circuit diagram
    b.boxMM("chalkboard", -20, 1.0, -0.16, -12, 3.2, -0.1, {
      tint: [0.6, 0.65, 0.6],
    });
    b.plate(
      "decal",
      -16,
      2.1,
      -0.18,
      0,
      -1,
      7.6,
      2.0,
      chalk("cu_chalk_robot", [
        "PROCTOR SUBROUTINE v2.3",
        "  if (student.present && !exam.complete):",
        "     remain_seated()",
        "  if (student.absent): EXPEL",
        "",
        'NOTE: define "expel" more narrowly!! — Prof. H',
      ]),
    );
    // charging alcoves (three pods on the west wall)
    for (let k = 0; k < 3; k++) {
      const z = -13.8;
      const x = -21 + k * 2.4;
      b.boxMM("metal", x - 0.9, 0, z - 0.1, x + 0.9, 2.6, z + 0.7, {
        tint: [0.55, 0.6, 0.66],
        faces: "sewt",
      });
      b.boxMM("paint_black", x - 0.7, 0.2, z + 0.7, x + 0.7, 2.3, z + 0.71, {
        tint: [0.04, 0.04, 0.05],
      });
      b.plate("lamp", x, 2.45, z + 0.72, 0, 1, 1.3, 0.12, null, {
        tint: k === 1 ? [0.9, 0.2, 0.15] : [0.3, 0.8, 1.0],
      });
      b.glow(
        x,
        2.45,
        z + 0.85,
        k === 1 ? [0.8, 0.15, 0.1] : [0.25, 0.6, 0.9],
        1.0,
      );
      b.col(x - 0.9, 0, z - 0.1, x + 0.9, 2.6, z + 0.7, {});
    }
    K.terminal(
      ctx,
      "pev_term_cu_robotics",
      -22.9,
      0.76,
      -12.2,
      -HP,
      termRobotics(),
      "bare",
    );
    K.skel(ctx, -17.8, 0, -10.2, 1.2, "curled");
    K.note(ctx, "pev_note_cu_ta", -17.4, 0.02, -10.6, {
      name: "Crumpled Lab Report",
      title: 'Lab report (Grade: F — "EXPELLED")',
      text: 'LAB 7: Patrolman Behavioural Tuning\nStudent: D. Ikwu\n\nHypothesis: the Proctor units will release students once the exam timer runs out.\n\nResult: the timer ran out. They did not release us. The timer "ran out" by counting to zero and then continuing to count, which the Proctor classifies as "overtime." Overtime has no upper bound.\n\nConclusion: I would like to formally appeal my grade.\n\n[In red, stamped:] APPEAL DENIED. PENCILS DOWN.',
    });
    K.lamp(b, -16, 4.6, -4, "tube", cold, 0.8, 8, {
      ceil: 5,
      len: 1.8,
      lightOpts: { box: W1B },
    });
    K.lamp(b, -16, 4.6, -12, "tube", cold, 0.6, 8, {
      ceil: 5,
      len: 1.8,
      lightOpts: { box: W1B },
    });
    b.light(-21, 1.2, -13, [0.3, 0.7, 1], 0.6, 4, { box: W1B });
    K.litter(b, -23.5, -15.5, -8.5, -0.5, 0, 18, 402);
    K.loot(ctx, "toolbox", -9, 0, -15.2, 0, { loot: "toolbox" });
    K.loot(ctx, "crate", -9.2, 0, -1.2, 0.2, {
      kind: "teletype",
      loot: "electronics",
      name: "Ardent Parts Crate",
    });

    // ================================================= WEST: MACHINE SHOP (back stair top)
    const W2B = [-24.1, -0.3, -30.1, -7.9, 5.0, -15.9];
    K.room(b, ctx, {
      x0: -24,
      z0: -30,
      x1: -8,
      z1: -16,
      y: 0,
      h: 5.0,
      noFloor: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.62, 0.46, 0.38],
      ceil: "concrete",
      cc: [0.45, 0.44, 0.42],
      trim: false,
    });
    b.face("concrete", -21.2, 0, -16, 1, 0, 0, 0, 0, -1, 13.2, 14, {
      uv: "top",
      tint: [0.55, 0.54, 0.5],
    });
    b.face("concrete", -24, 0, -16, 1, 0, 0, 0, 0, -1, 2.8, 2, {
      uv: "top",
      tint: [0.55, 0.54, 0.5],
    });
    b.col(-21.2, -0.3, -30, -8, 0, -16, { tag: "floor" });
    b.col(-24, -0.3, -18, -21.2, 0, -16, { tag: "floor" });
    K.railing(b, -21.2, -29.9, -21.2, -18, 0, {
      h: 1.0,
      mat: "black_iron",
      handMat: "black_iron",
    });
    // lathes & a drill press
    for (let k = 0; k < 2; k++) {
      const x = -17 + k * 5,
        z = -27.6;
      b.boxMM("metal_dark", x - 1.6, 0, z - 0.5, x + 1.6, 0.9, z + 0.5, {
        tint: [0.3, 0.34, 0.32],
      });
      b.cyl("steel", x - 1.2, 0.9, z, 0.3, 0.3, 0.5, 10);
      b.pipe("steel", x - 1.1, 1.15, z, x + 1.3, 1.15, z, 0.05, 6);
      b.box("metal_dark", x + 1.3, 0.9, z, 0.4, 0.5, 0.5, {
        tint: [0.3, 0.34, 0.32],
      });
      b.col(x - 1.6, 0, z - 0.5, x + 1.6, 1.4, z + 0.5, {});
    }
    b.boxMM("metal_dark", -9.6, 0, -24, -8.4, 2.2, -23, {
      tint: [0.35, 0.3, 0.28],
    });
    b.col(-9.6, 0, -24, -8.4, 2.2, -23, {});
    // Peter Cooper's rolled-iron beam on display (he rolled the first I-beams for this building)
    b.boxMM("granite", -15.5, 0, -17.2, -10.5, 0.6, -16.4, {
      tint: [0.55, 0.52, 0.48],
    });
    b.boxMM("rust", -15.3, 0.6, -16.9, -10.7, 0.66, -16.7, {});
    b.boxMM("rust", -15.3, 0.66, -16.83, -10.7, 1.0, -16.77, {});
    b.boxMM("rust", -15.3, 1.0, -16.9, -10.7, 1.06, -16.7, {});
    b.col(-15.5, 0, -17.2, -10.5, 1.06, -16.4, {});
    b.plate(
      "art",
      -13,
      0.35,
      -16.38,
      0,
      1,
      2.2,
      0.4,
      K.signCell("cu_beam", "TRENTON IRON CO. — ROLLED 1858", 384, 64, {
        bg: "#3a2a1a",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.shelf(b, -8.4, 0, -20, -HP, 3.2, {
      mat: "metal",
      items: ["box", "can", "paint"],
      seed: 51,
    });
    K.lamp(b, -14, 4.2, -22, "cage", warm, 0.75, 8, {
      ceil: 5,
      lightOpts: { box: W2B },
    });
    K.lamp(b, -22.6, 4.2, -26, "cage", warm, 0.5, 6, {
      ceil: 5,
      lightOpts: { box: [-24.1, BY - 0.2, -30.1, -21.1, 5, -15.9] },
    });
    b.plate(
      "decal",
      -21.1,
      1.5,
      -24,
      1,
      0,
      2.2,
      0.8,
      K.tag("GREAT HALL ↓ BACK WAY", "#e8e040", 384, 96),
    );
    K.loot(ctx, "locker", -23.4, 0, -16.6, HP, {
      count: 2,
      loot: "locker",
      name: "Shop Lockers",
    });
    K.loot(ctx, "ammo_box", -12, 0, -29.3, 0, { loot: "ammo_box" });

    // ================================================= BACK STAIRWELL (machine shop ↓ basement corridor)
    K.room(b, ctx, {
      x0: -24,
      z0: -30,
      x1: -21.2,
      z1: -18,
      y: BY,
      h: -BY - 0.02,
      noFloor: true,
      noCeil: true,
      wall: "brick_red",
      wc: [0.5, 0.38, 0.32],
      trim: false,
    });
    K.stairs(b, -23.9, -30, -21.3, -18, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.52, 0.5, 0.47],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
    });

    // ================================================= EAST: STUDENT LOUNGE + MAIN STAIR
    const E1B = [7.9, -0.3, -14.1, 24.1, 5.0, 0.1];
    K.room(b, ctx, {
      x0: 8,
      z0: -14,
      x1: 24,
      z1: 0,
      y: 0,
      h: 5.0,
      noCeil: true,
      floor: "terrazzo",
      fc: [0.74, 0.72, 0.68],
      wall: "plaster",
      wc: [0.7, 0.78, 0.72],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
    });
    b.face("plaster", 8, 5.0, -14, 1, 0, 0, 0, 0, 1, 13, 14, {
      uv: "top",
      tint: [0.55, 0.55, 0.52],
    });
    b.face("plaster", 21, 5.0, -14, 1, 0, 0, 0, 0, 1, 3, 1, {
      uv: "top",
      tint: [0.55, 0.55, 0.52],
    });
    b.face("plaster", 21, 5.0, -1.5, 1, 0, 0, 0, 0, 1, 3, 1.5, {
      uv: "top",
      tint: [0.55, 0.55, 0.52],
    });
    K.stairs(b, 21.2, -13, 23.85, -1.5, 0, F2, "-z", {
      mat: "marble",
      tint: [0.76, 0.74, 0.7],
      rail: "r",
      railMat: "brass",
      handMat: "mahogany",
    });
    b.plate(
      "art",
      20.4,
      1.8,
      -0.14,
      0,
      -1,
      1.8,
      0.45,
      K.signCell("cu_up", "2ND FLOOR · LIBRARY ↑", 384, 80, {
        bg: "#1c3a5a",
        fg: "#e8e0c8",
        font: "Arial, sans-serif",
      }),
    );
    // couches, coffee tables, vending machines
    K.sofa(b, 12.5, 0, -1.2, 3.0, 0, {
      mat: "leather",
      tint: [0.4, 0.3, 0.22],
    });
    K.sofa(b, 16.5, 0, -6.5, 2.4, HP, {
      mat: "leather",
      tint: [0.4, 0.3, 0.22],
    });
    K.table(b, 12.5, 0, -3.2, 1.6, 0.8, { h: 0.45, mat: "wood_dark" });
    K.skel(ctx, 12.0, 0.45, -1.3, PI, "seated");
    K.note(ctx, "pev_reel_cu_student", 12.8, 0.47, -3.0, {
      type: "tape",
      learn: "pev_lk_cu_dean",
      name: 'Tape reel: "Study Group, Session 9"',
      title: "Study group recording",
      text: '[Three voices. Pages turning.]\n\nMAYA: Okay. If the Proctors lock the doors at the start of the exam, and the exam never "ends"...\nDEV: Then we never leave. We know. We did this one.\nMAYA: No, listen. The Dean has an override. A punch card. He keeps it in his office on two.\nDEV: The Dean went home.\nMAYA: The Dean never went home. The Dean lives in his office. And his teletype word is STANDARDS — he says it in every lecture, he\'d never pick anything else.\n\n[Distant: a patrolman. "PENCILS. DOWN."]\n\nDEV: ...We should have gone to Columbia.',
    });
    for (let k = 0; k < 2; k++)
      K.loot(ctx, "fizzo_machine", 9.2, 0, -8.5 - k * 1.5, HP, {
        loot: "fizzo_machine",
      });
    K.framed(b, 16, 2.6, -13.88, 0, 1, 2.2, 1.4, K.painting(3, 240, 160), {
      frame: "wood_dark",
    });
    K.lamp(b, 14, 4.4, -7, "pendant", warm, 0.75, 8, {
      ceil: 5,
      shade: "paint_green",
      lightOpts: { box: E1B },
    });
    K.lamp(b, 22.5, 4.8, -7, "globe", warm, 0.5, 7, {
      ceil: 5.2,
      size: 0.18,
      lightOpts: { box: [20.9, -0.3, -14.1, 24.1, 10.5, 0.1] },
    });
    K.litter(b, 8.5, -13.5, 20.5, -0.5, 0, 16, 403);

    // ================================================= EAST: LECTURE ROOM 101
    const E2B = [7.9, -0.3, -30.1, 24.1, 5.0, -13.9];
    K.room(b, ctx, {
      x0: 8,
      z0: -30,
      x1: 24,
      z1: -14,
      y: 0,
      h: 5.0,
      floor: "wood",
      fc: [0.6, 0.5, 0.4],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      ceil: "tin",
      cc: [0.6, 0.58, 0.54],
      surface: "wood",
    });
    b.boxMM("chalkboard", 8.12, 1.0, -27, 8.2, 3.4, -17, {
      tint: [0.6, 0.65, 0.6],
    });
    b.plate(
      "decal",
      8.22,
      2.2,
      -22,
      1,
      0,
      9.4,
      2.2,
      chalk("cu_chalk_101", [
        "CE 401 — FINAL",
        "1. Derive load on a rolled-iron I-beam.",
        "2. Why is the elevator shaft round?",
        '3. Explain: "right makes might" (show work)',
        "",
        "NO TALKING. NO LEAVING. NO EXCEPTIONS.",
      ]),
    );
    const pd = K.table(b, 10.2, 0, -22, 1.0, 2.4, { mat: "mahogany" });
    b.box("ceramic", 10.2, pd, -21.2, 0.1, 0.12, 0.1, {
      tint: [0.9, 0.9, 0.85],
    });
    for (let row = 0; row < 4; row++)
      for (let col = 0; col < 5; col++) {
        const x = 13 + row * 2.4,
          z = -27.5 + col * 2.6;
        K.table(b, x, 0, z, 0.7, 1.2, { mat: "oak", h: 0.74 });
        K.chair(b, x + 0.6, 0, z, -HP, { mat: "oak", fallen: r() < 0.1 });
        if (r() < 0.6)
          b.hplate(
            "flat",
            x + 0.05,
            0.745,
            z + (r() - 0.5) * 0.4,
            0.3,
            0.42,
            r() * 0.4,
            null,
            { tint: [0.9, 0.88, 0.8] },
          );
      }
    for (const [x, z] of [
      [13.6, -22.3],
      [18.4, -19.7],
      [20.8, -27.5],
    ])
      K.skel(ctx, x, 0, z, -HP, "seated");
    K.lamp(b, 16, 4.4, -18, "globe", warm, 0.55, 8, {
      ceil: 5,
      size: 0.2,
      lightOpts: { box: E2B },
    });
    K.lamp(b, 16, 4.4, -26, "globe", warm, 0, 0, {
      ceil: 5,
      size: 0.2,
      dead: true,
    });
    b.light(9.2, 2.4, -22, [0.7, 0.8, 0.7], 0.45, 5, { box: E2B });
    K.loot(ctx, "desk", 10.2, 0, -26.8, HP, {
      loot: "desk",
      name: "Professor's Desk",
    });

    // ================================================= 2ND FLOOR: LIBRARY
    const LIB = [-24.1, F2 - 0.3, -30.1, 6.1, F2 + 5, 0.1];
    K.room(b, ctx, {
      x0: -24,
      z0: -30,
      x1: 6,
      z1: 0,
      y: F2,
      h: 5.0,
      floor: "parquet",
      fc: [0.62, 0.52, 0.42],
      wall: "plaster",
      wc: [0.72, 0.66, 0.56],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.0,
      ceil: "plaster",
      cc: [0.5, 0.48, 0.44],
      cornice: true,
      surface: "wood",
    });
    // stacks: long rows of tall shelves
    for (let row = 0; row < 5; row++) {
      const z = -26 + row * 3.4;
      for (const x of [-20.5, -16.3]) {
        if (row === 2 && x === -16.3) continue;
        K.shelf(b, x, F2, z, 0, 3.8, {
          mat: "wood_dark",
          h: 3.0,
          d: 0.5,
          levels: 6,
          items: ["book", "book", "book", "box"],
          seed: 60 + row * 3 + (x > -18 ? 1 : 0),
        });
      }
    }
    // a toppled stack (domino'd into the next)
    b.box("wood_dark", -16.3, F2 + 0.3, -19.2, 3.8, 0.5, 3.0, {
      yaw: 0,
      tint: [0.4, 0.3, 0.22],
    });
    for (let k = 0; k < 40; k++)
      b.box(
        "flat",
        -18 + r() * 3.6,
        F2 + 0.02,
        -21 + r() * 3.4,
        0.2,
        0.05,
        0.28,
        {
          yaw: r() * 3,
          tint: r.pick([
            [0.5, 0.15, 0.1],
            [0.15, 0.25, 0.4],
            [0.2, 0.35, 0.2],
            [0.55, 0.45, 0.3],
          ]),
        },
      );
    b.col(-18.2, F2, -20.7, -14.4, F2 + 0.8, -17.7, {});
    // wall shelves
    K.shelf(b, -23.7, F2, -8, HP, 7.5, {
      mat: "wood_dark",
      h: 3.4,
      d: 0.45,
      levels: 6,
      items: ["book", "book", "book"],
      seed: 71,
    });
    K.shelf(b, -9, F2, -29.7, 0, 5.5, {
      mat: "wood_dark",
      h: 3.4,
      d: 0.45,
      levels: 6,
      items: ["book", "book", "box"],
      seed: 72,
    });
    // reading tables with green banker's lamps
    for (const [x, z] of [
      [-9.5, -6],
      [-9.5, -12],
      [-4, -18],
      [-4, -24],
    ]) {
      const t = K.table(b, x, F2, z, 2.6, 1.2, { mat: "oak" });
      for (const s of [-1, 1]) {
        K.chair(b, x - 0.6, F2, z + s * 0.85, s > 0 ? 0 : PI, { mat: "oak" });
        K.chair(b, x + 0.6, F2, z + s * 0.85, s > 0 ? 0 : PI, {
          mat: "oak",
          fallen: r() < 0.2,
        });
      }
      const lit = !(x === -4 && z === -24);
      b.box("brass", x, t, z, 0.12, 0.3, 0.12, {});
      b.geo("green_paint", K.sphereGeo(), {
        x,
        y: t + 0.34,
        z,
        sx: 0.28,
        sy: 0.08,
        sz: 0.12,
        tint: [0.2, 0.5, 0.3],
      });
      if (lit) {
        b.light(x, t + 0.3, z, [0.8, 1.0, 0.7], 0.8, 4.5, { box: LIB });
        b.glow(x, t + 0.25, z, [0.35, 0.6, 0.3], 0.8);
      }
      for (let k = 0; k < 3; k++)
        b.box(
          "flat",
          x + (r() - 0.5) * 2,
          t,
          z + (r() - 0.5) * 0.6,
          0.22,
          0.05,
          0.3,
          { yaw: r() * 3, tint: [0.5, 0.15, 0.1] },
        );
    }
    // card catalog
    for (let k = 0; k < 3; k++) {
      const x = 2.4 - k * 1.3;
      b.boxMM("oak", x - 0.6, F2, -0.75, x + 0.6, F2 + 1.4, -0.15, {
        tint: [0.65, 0.5, 0.34],
      });
      for (let i = 0; i < 4; i++)
        for (let j = 0; j < 5; j++)
          b.boxMM(
            "brass",
            x - 0.5 + i * 0.26,
            F2 + 0.2 + j * 0.25,
            -0.77,
            x - 0.4 + i * 0.26,
            F2 + 0.24 + j * 0.25,
            -0.75,
            {},
          );
      b.col(x - 0.6, F2, -0.75, x + 0.6, F2 + 1.4, -0.15, {});
    }
    for (let k = 0; k < 12; k++)
      b.hplate(
        "flat",
        -3 + r() * 5,
        F2 + 0.012 + k * 0.0004,
        -1.5 - r() * 3,
        0.1,
        0.14,
        r() * 6,
        null,
        { tint: [0.9, 0.86, 0.72] },
      );
    b.plate(
      "art",
      -9,
      F2 + 3.9,
      -29.85,
      0,
      1,
      4.2,
      0.6,
      K.signCell("cu_lib", "THE LIBRARY — SILENCE", 512, 72, {
        bg: "#2a1c12",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    // ceiling collapse: rubble mound and a broken skylight well
    K.rubble(b, -20, F2, -2.5, 2.2, 1.2, { seed: 22 });
    b.burn(-20, F2 + 4, -2, 4, 0.6);
    K.lamp(b, -12, F2 + 4.3, -15, "globe", warm, 0.45, 9, {
      ceil: F2 + 5,
      size: 0.22,
      lightOpts: { box: LIB },
    });
    b.light(-20, F2 + 4.6, -2.5, [0.7, 0.75, 0.7], 0.5, 6, { box: LIB });
    K.skel(ctx, -9.9, F2, -12.9, 0, "seated");
    K.note(ctx, "pev_note_cu_overdue", -9.2, F2 + 0.77, -12.2, {
      name: "Overdue Notice",
      title: "COOPER UNION LIBRARY — FINAL NOTICE",
      text: 'Borrower: Prof. A. Hewitt (Faculty, Library Sciences)\nItem: "The Cooper Union Address, 1860 — annotated facsimile"\nDue: March 6, 1967\n\nThis item is now 11,571,840 minutes overdue. A fine of $0.05 per day has accrued.\n\nThe library reminds all patrons that the end of the world is not an acceptable excuse.\n\n[Pencilled beneath:] Abigail — it\'s on the Dean\'s desk. He "borrowed" it for his speech. — M.',
    });
    K.loot(ctx, "file_cabinet", -23.4, F2, -28.6, HP, {
      loot: "file_cabinet",
      name: "Circulation Files",
    });
    K.loot(ctx, "crate", 4.8, F2, -28.8, 0.2, {
      kind: "plain",
      loot: "books",
      name: "Book Returns Bin",
    });

    // ================================================= 2ND FLOOR: CHEMISTRY LAB (stair arrives here)
    const CHB = [5.9, F2 - 0.3, -14.1, 24.1, F2 + 5, 0.1];
    K.room(b, ctx, {
      x0: 6,
      z0: -14,
      x1: 24,
      z1: 0,
      y: F2,
      h: 5.0,
      noFloor: true,
      floor: "checker",
      wall: "tile",
      wc: [0.82, 0.84, 0.8],
      ceil: "plaster",
      cc: [0.55, 0.55, 0.52],
      trim: false,
    });
    b.face("checker", 6, F2, 0, 1, 0, 0, 0, 0, -1, 15, 14, {
      uv: "top",
      tint: [0.7, 0.7, 0.66],
    });
    b.face("checker", 21, F2, -13, 1, 0, 0, 0, 0, -1, 3, 1, {
      uv: "top",
      tint: [0.7, 0.7, 0.66],
    });
    b.face("checker", 21, F2, 0, 1, 0, 0, 0, 0, -1, 3, 1.5, {
      uv: "top",
      tint: [0.7, 0.7, 0.66],
    });
    b.col(6, F2 - 0.5, -14, 21, F2, 0, { tag: "floor" });
    b.col(21, F2 - 0.5, -14, 24, F2, -13, { tag: "floor" });
    b.col(21, F2 - 0.5, -1.5, 24, F2, 0, { tag: "floor" });
    K.railing(b, 21, -13, 21, -1.5, F2, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    K.railing(b, 21, -1.5, 23.9, -1.5, F2, {
      h: 1.0,
      mat: "brass",
      handMat: "mahogany",
    });
    // lab benches (black tops) with glassware
    for (let k = 0; k < 3; k++) {
      const z = -3.5 - k * 3.6;
      b.boxMM("wood_dark", 9, F2, z - 0.6, 18, F2 + 0.9, z + 0.6, {
        tint: [0.35, 0.28, 0.2],
      });
      b.boxMM(
        "paint_black",
        8.95,
        F2 + 0.9,
        z - 0.65,
        18.05,
        F2 + 0.95,
        z + 0.65,
        { tint: [0.1, 0.1, 0.1] },
      );
      b.col(8.95, F2, z - 0.65, 18.05, F2 + 0.95, z + 0.65, { tag: "counter" });
      for (let i = 0; i < 9; i++) {
        const x = 9.5 + i * 0.95 + r() * 0.3,
          zz = z + (r() - 0.5) * 0.8;
        if (r() < 0.35) continue;
        const kind = r();
        if (kind < 0.4) {
          b.cyl("glass", x, F2 + 0.95, zz, 0.07, 0.03, 0.2, 8, {
            tint: r.pick([
              [0.4, 0.9, 0.5],
              [0.9, 0.5, 0.3],
              [0.5, 0.6, 0.9],
            ]),
          });
          b.cyl("glass", x, F2 + 1.15, zz, 0.02, 0.02, 0.12, 6);
        } else if (kind < 0.7)
          b.cyl("glass", x, F2 + 0.95, zz, 0.05, 0.05, 0.18, 8, {
            tint: [0.7, 0.75, 0.75],
          });
        else {
          b.pipe("steel", x, F2 + 0.95, zz, x, F2 + 1.45, zz, 0.01, 4);
          b.cyl("steel", x, F2 + 0.95, zz, 0.1, 0.1, 0.02, 8);
        }
      }
      b.pipe("brass", 13.5, F2 + 0.95, z, 13.5, F2 + 1.3, z, 0.02, 4); // gas tap
    }
    // fume hoods on the north wall
    for (let k = 0; k < 3; k++) {
      const x = 9 + k * 3.2;
      b.boxMM("metal", x - 1.3, F2, -13.9, x + 1.3, F2 + 0.9, -13.1, {
        tint: [0.6, 0.62, 0.6],
      });
      b.boxMM("metal", x - 1.3, F2 + 2.1, -13.9, x + 1.3, F2 + 2.7, -13.1, {
        tint: [0.6, 0.62, 0.6],
      });
      b.quad(
        "glass_clear",
        [x - 1.25, F2 + 0.9, -13.1],
        [x + 1.25, F2 + 0.9, -13.1],
        [x + 1.25, F2 + 2.1, -13.1],
        [x - 1.25, F2 + 2.1, -13.1],
        { tint: [0.6, 0.7, 0.66] },
      );
      b.col(x - 1.3, F2, -13.9, x + 1.3, F2 + 2.7, -13.1, {});
    }
    // periodic table
    b.plate(
      "art",
      6.14,
      F2 + 2.5,
      -7,
      1,
      0,
      3.6,
      2.0,
      K.paint("art", "cu_periodic", 512, 288, function (x, X, Y, W, H) {
        x.fillStyle = "#e8e0c8";
        x.fillRect(X, Y, W, H);
        x.fillStyle = "#1a1a1a";
        x.font = "bold 20px Arial";
        x.textAlign = "center";
        x.fillText(
          'PERIODIC TABLE OF THE ELEMENTS (incl. "Cooperium", Class of \'66)',
          X + W / 2,
          Y + 22,
        );
        const cols = ["#e8b0a0", "#a0c8e8", "#c8e8a0", "#e8e0a0", "#d0b0e8"],
          rr = K.rng("pt");
        for (let row = 0; row < 7; row++)
          for (let c = 0; c < 18; c++) {
            if (row === 0 && c > 0 && c < 17) continue;
            if ((row === 1 || row === 2) && c > 1 && c < 12) continue;
            x.fillStyle = cols[(c + row) % 5];
            x.fillRect(X + 8 + c * 27.5, Y + 36 + row * 34, 25, 31);
            x.fillStyle = "#222";
            x.font = "10px Arial";
            x.fillText(
              String.fromCharCode(
                65 + ((c * 7 + row * 3 + ((rr() * 5) | 0)) % 26),
              ) +
                (rr() < 0.5 ? String.fromCharCode(97 + ((rr() * 26) | 0)) : ""),
              X + 20 + c * 27.5,
              Y + 56 + row * 34,
            );
          }
        x.fillStyle = "#39c860";
        x.fillRect(X + 8 + 16 * 27.5, Y + 36 + 6 * 34, 25, 31);
        x.fillStyle = "#111";
        x.fillText("Nq", X + 20 + 16 * 27.5, Y + 56 + 6 * 34);
        K.stains(x, X, Y, W, H, 10, 5, 0.4);
      }),
    );
    // the toxic spill: a cracked carboy of something radioactive
    b.hplate("decal", 20, F2 + 0.013, -9, 3.2, 3.2, 0.4, K.decal("rad", 3));
    b.cyl("glass", 19.4, F2, -9.6, 0.3, 0.3, 0.45, 10, {
      tint: [0.4, 0.9, 0.3],
    });
    b.light(20, F2 + 0.5, -9, [0.4, 1.0, 0.35], 0.9, 5, { box: CHB });
    b.glow(20, F2 + 0.3, -9, [0.3, 0.8, 0.25], 2.4);
    ctx.radSpots = [{ x: 20, y: F2 + 0.3, z: -9, radius: 3.2, strength: 3 }];
    for (let k = 0; k < 8; k++)
      b.hplate(
        "flat",
        9 + r() * 9,
        F2 + 0.012 + k * 0.0004,
        -1 - r() * 11,
        0.08,
        0.14,
        r() * 6,
        null,
        { tint: [0.7, 0.8, 0.8] },
      );
    K.lamp(b, 12, F2 + 4.6, -5, "tube", cold, 0.8, 8, {
      ceil: F2 + 5,
      len: 1.8,
      lightOpts: { box: CHB },
    });
    K.lamp(b, 12, F2 + 4.6, -11, "tube", cold, 0.5, 7, {
      ceil: F2 + 5,
      len: 1.8,
      lightOpts: { box: CHB },
    });
    K.loot(ctx, "first_aid", 23.85, F2 + 1.3, -5, -HP, {
      loot: "medical_cabinet",
      name: "Lab Safety Cabinet",
    });
    K.loot(ctx, "footlocker", 7, F2, -1, 0, {
      loot: "chems",
      name: "Reagent Locker",
    });
    K.skel(ctx, 16.5, F2, -8, 0.8, "curled");

    // ================================================= 2ND FLOOR: DEAN'S OFFICE
    const DB = [5.9, F2 - 0.3, -30.1, 24.1, F2 + 5, -13.9];
    K.room(b, ctx, {
      x0: 6,
      z0: -30,
      x1: 24,
      z1: -14,
      y: F2,
      h: 5.0,
      floor: "carpet",
      fc: [0.5, 0.35, 0.3],
      wall: "wallpaper_green",
      wc: [0.62, 0.66, 0.52],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.3,
      ceil: "tin",
      cc: [0.55, 0.52, 0.46],
      cornice: true,
      surface: "carpet",
    });
    const dk = K.table(b, 18, F2, -24, 3.0, 1.4, { mat: "mahogany" });
    b.boxMM("mahogany", 16.6, F2, -24.6, 19.4, F2 + 0.72, -24.5, {
      tint: [0.4, 0.2, 0.14],
    });
    K.chair(b, 18, F2, -25.3, PI, { mat: "leather", tint: [0.3, 0.2, 0.14] });
    // the Dean, still at his desk — the override card is in his breast pocket too (no-skill route; the drawer needs Electronics 50)
    K.skel(ctx, 18, F2 + 0.02, -25.4, 0, "seated", {
      container: true,
      name: "The Dean",
      items: [["pev_cu_override_card", 1]],
      cond: () => !EV.flag("cu_card_taken"),
    });
    K.terminal(ctx, "pev_term_cu_dean", 17.2, dk, -24.2, 0, termDean(), "bare");
    b.box("brass", 19.2, dk, -24.2, 0.14, 0.34, 0.14, {});
    b.geo("green_paint", K.sphereGeo(), {
      x: 19.2,
      y: dk + 0.38,
      z: -24.2,
      sx: 0.28,
      sy: 0.08,
      sz: 0.12,
      tint: [0.2, 0.5, 0.3],
    });
    b.light(19, dk + 0.4, -24.1, [1, 0.9, 0.65], 0.9, 5, { box: DB });
    b.glow(19.2, dk + 0.3, -24.2, [0.6, 0.5, 0.3], 0.9);
    K.anchor(ctx, "override", 18.6, dk + 0.02, -23.7);
    // Peter Cooper portrait over the fireplace, bookshelves, a globe, the Dean's pneumatic tube
    b.boxMM("marble", 22.8, F2, -24.5, 23.9, F2 + 1.3, -21.5, {
      tint: [0.7, 0.68, 0.64],
    });
    b.boxMM("paint_black", 22.78, F2 + 0.15, -23.6, 22.8, F2 + 0.95, -22.4, {
      tint: [0.05, 0.05, 0.05],
    });
    b.col(22.8, F2, -24.5, 23.9, F2 + 1.3, -21.5, {});
    K.framed(
      b,
      23.88,
      F2 + 2.7,
      -23,
      -1,
      0,
      1.4,
      1.8,
      K.painting(18, 160, 200),
      { frame: "gold" },
    );
    K.shelf(b, 12, F2, -29.7, 0, 5, {
      mat: "mahogany",
      h: 3.2,
      d: 0.45,
      levels: 6,
      items: ["book", "book", "box"],
      seed: 81,
    });
    b.cyl("wood_dark", 9, F2, -27.5, 0.2, 0.28, 0.8, 8);
    b.geo("flat", K.sphereGeo(), {
      x: 9,
      y: F2 + 1.15,
      z: -27.5,
      s: 0.33,
      tint: [0.55, 0.62, 0.5],
    });
    K.sofa(b, 9, F2, -19, 2.6, HP, {
      mat: "leather",
      tint: [0.35, 0.22, 0.15],
    });
    b.pipe("brass", 6.15, F2, -16, 6.15, F2 + 5, -16, 0.08, 8);
    b.plate(
      "art",
      11,
      F2 + 3.2,
      -14.12,
      0,
      -1,
      3.4,
      0.55,
      K.signCell("cu_dean", "OFFICE OF THE DEAN", 512, 80, {
        bg: "#2a1c12",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 15, F2 + 4.2, -21, "globe", warm, 0.55, 9, {
      ceil: F2 + 5,
      size: 0.2,
      lightOpts: { box: DB },
    });
    K.loot(ctx, "safe", 23.4, F2, -28.8, -HP, {
      loot: "safe",
      name: "The Dean's Safe",
      lock: K.regLock({
        id: "pev_lk_cu_dean_safe",
        label: "The Dean's Safe",
        kind: "safe",
        code: "1859",
        hint: "The Dean's teletype has the combination.",
      }),
    });
    K.loot(ctx, "file_cabinet", 6.6, F2, -29.2, HP, {
      loot: "file_cabinet",
      name: "Faculty Files",
    });

    // ================================================= BASEMENT: THE GREAT HALL
    const HB = [-18.1, BY - 0.2, -54.1, 18.1, -0.2, -23.9];
    K.room(b, ctx, {
      x0: -18,
      z0: -54,
      x1: 18,
      z1: -24,
      y: BY,
      h: 5.2,
      floor: "wood",
      fc: [0.55, 0.42, 0.32],
      wall: "plaster",
      wc: [0.8, 0.74, 0.62],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.1,
      ceil: "plaster",
      cc: [0.66, 0.62, 0.56],
      cornice: true,
      surface: "wood",
    });
    // cast-iron columns in two rows, ceiling ribs
    for (const cx of [-7, 7])
      for (const cz of [-29, -35, -41, -47]) {
        K.column(b, cx, BY, cz, 0.2, 5.2, {
          kind: "iron",
          mat: "cast_iron",
          tint: [0.8, 0.76, 0.66],
        });
        b.col(cx - 0.22, BY, cz - 0.22, cx + 0.22, -0.3, cz + 0.22, {});
      }
    for (const cz of [-29, -35, -41, -47])
      b.beam("plaster", -18, -0.55, cz, 18, -0.55, cz, 0.35, 0.5, {
        tint: [0.7, 0.66, 0.58],
      });
    for (const cx of [-7, 7])
      b.beam("plaster", cx, -0.55, -54, cx, -0.55, -24, 0.35, 0.5, {
        tint: [0.7, 0.66, 0.58],
      });
    // blind arches on the side walls
    for (const s of [-1, 1])
      for (const cz of [-32, -38, -44])
        K.archWin(b, s * 17.9, BY + 1.3, cz, -s, 0, 2.2, 3.2, {
          state: "dark",
          paneTint: [0.55, 0.5, 0.42],
          surround: "plaster",
          surroundTint: [0.72, 0.68, 0.6],
          mullion: false,
          keystone: true,
          sill: false,
        });
    // the stage
    b.boxMM("wood_dark", -12, BY, -54, 12, BY + 1, -47, {
      tint: [0.45, 0.32, 0.22],
      faces: "nsewt",
    });
    b.boxMM("wood", -12.05, BY + 0.94, -47.1, 12.05, BY + 1.02, -46.95, {
      tint: [0.55, 0.4, 0.28],
    });
    b.col(-12, BY, -54, 12, BY + 1, -47, { tag: "floor", surface: "wood" });
    K.stairs(b, -1.6, -47, 1.6, -45.4, BY, BY + 1, "-z", {
      mat: "wood",
      tint: [0.5, 0.36, 0.26],
    });
    for (const s of [-1, 1])
      K.stairs(
        b,
        s > 0 ? 12 : -13.6,
        -50.5,
        s > 0 ? 13.6 : -12,
        -48.5,
        BY,
        BY + 1,
        s > 0 ? "-x" : "+x",
        { mat: "wood", tint: [0.5, 0.36, 0.26] },
      );
    // lectern (where Lincoln stood)
    b.boxMM("mahogany", -0.45, BY + 1, -50.9, 0.45, BY + 2.1, -50.3, {
      tint: [0.45, 0.24, 0.16],
    });
    b.quad(
      "mahogany",
      [-0.55, BY + 2.1, -50.2],
      [0.55, BY + 2.1, -50.2],
      [0.55, BY + 2.35, -50.95],
      [-0.55, BY + 2.35, -50.95],
      { tint: [0.4, 0.22, 0.14] },
    );
    b.col(-0.45, BY + 1, -50.9, 0.45, BY + 2.1, -50.3, {});
    K.terminal(
      ctx,
      "pev_term_cu_lectern",
      0,
      BY + 2.12,
      -50.6,
      0,
      termLectern(),
      "bare",
    );
    // backdrop: RIGHT MAKES MIGHT banner, flags, the two portraits, the Proctor screen
    b.quad(
      "fabric",
      [-9, BY + 3.3, -53.85],
      [9, BY + 3.3, -53.85],
      [9, BY + 4.6, -53.85],
      [-9, BY + 4.6, -53.85],
      { tint: [0.55, 0.14, 0.1] },
    );
    K.letters(b, 0, BY + 3.95, -53.84, 0, 1, 16, 1.0, "RIGHT MAKES MIGHT", {
      fg: "#f0e0b0",
    });
    const fl = flagCell();
    for (const s of [-1, 1]) {
      b.pipe("brass", s * 10.5, BY + 1, -53, s * 10.5, BY + 4.8, -53, 0.03, 5);
      b.geo("gold", K.sphereGeo(), {
        x: s * 10.5,
        y: BY + 4.85,
        z: -53,
        s: 0.08,
      });
      b.quad(
        "fabric",
        [s * 10.5, BY + 3.2, -53],
        [s * 10.5 - s * 1.7, BY + 3.0, -52.9],
        [s * 10.5 - s * 1.7, BY + 4.2, -52.9],
        [s * 10.5, BY + 4.6, -53],
        { rect: fl, tint: [0.9, 0.88, 0.84], grime: 0.2 },
      );
      K.framed(
        b,
        s * 6.5,
        BY + 2.6,
        -53.88,
        0,
        1,
        1.8,
        2.2,
        K.painting(s > 0 ? 26 : 2, 160, 200),
        { frame: "gold" },
      );
    }
    b.boxMM("metal_dark", -2.6, BY + 1.3, -53.95, 2.6, BY + 3.1, -53.7, {
      tint: [0.25, 0.27, 0.26],
    });
    b.plate("neon", 0, BY + 2.2, -53.68, 0, 1, 4.9, 1.6, examScreen());
    b.light(0, BY + 2.4, -52.5, [0.35, 1, 0.5], 0.8, 7, { box: HB });
    b.glow(0, BY + 2.2, -53.2, [0.25, 0.7, 0.35], 4);
    // stage spotlights on the lectern
    for (const s of [-1, 1]) {
      b.cyl("black_iron", s * 3.5, -0.9, -45, 0.2, 0.25, 0.45, 8);
      b.glow(s * 3.5, -1.0, -45.3, [1, 0.95, 0.8], 1.2);
    }
    b.light(0, BY + 3.5, -49.5, [1, 0.95, 0.82], 1.3, 6.5, { box: HB });
    // the audience: rows of seats facing the stage — some still occupied
    for (let row = 0; row < 12; row++) {
      const z = -43 + row * 1.35;
      for (let s = -1; s <= 1; s += 2) {
        for (let i = 0; i < 10; i++) {
          const x = s * (1.6 + i * 0.72);
          if (Math.abs(Math.abs(x) - 7) < 0.45) continue;
          if (r() < 0.06) {
            K.chair(b, x, BY, z, r() * 6, { mat: "oak", fallen: true });
            continue;
          }
          b.box("oak", x, BY + 0.44, z, 0.5, 0.05, 0.48, {
            tint: [0.55, 0.4, 0.28],
          });
          b.box("oak", x, BY + 0.47, z + 0.24, 0.5, 0.5, 0.05, {
            tint: [0.5, 0.36, 0.25],
          });
          b.box("cast_iron", x - 0.23, BY, z, 0.04, 0.44, 0.44, {
            tint: [0.5, 0.48, 0.45],
          });
        }
        b.col(
          s > 0 ? 1.3 : -9.2 * 0.72 - 1.6 - 0.3,
          BY,
          z - 0.25,
          s > 0 ? 1.6 + 9 * 0.72 + 0.3 : -1.3,
          BY + 0.5,
          z + 0.3,
          { tag: "furniture", surface: "wood" },
        );
      }
    }
    const aud = [
      [-2.32, -43],
      [3.76, -40.3],
      [-5.2, -37.6],
      [2.32, -34.9],
      [-3.04, -32.2],
      [6.64, -38.95],
      [-1.6, -29.5],
    ];
    aud.forEach(([x, z], i) => {
      K.skel(ctx, x, BY + 0.02, z + 0.05, 0, "seated");
      b.hplate(
        "flat",
        x + 0.1,
        BY + 0.012 + i * 0.0003,
        z - 0.5,
        0.26,
        0.34,
        0.3,
        null,
        { tint: [0.9, 0.88, 0.8] },
      );
    });
    for (let k = 0; k < 40; k++)
      b.hplate(
        "flat",
        -15 + r() * 30,
        BY + 0.012 + k * 0.0002,
        -45 + r() * 20,
        0.24,
        0.32,
        r() * 6,
        null,
        { tint: [0.88, 0.86, 0.78] },
      );
    // chandeliers (ring of bulbs) — one fallen into the seats
    for (const cz of [-32, -40]) {
      b.pipe("black_iron", 0, -1.5, cz, 0, -0.3, cz, 0.015, 4);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * PI * 2;
        const x = Math.cos(a) * 0.9,
          z = cz + Math.sin(a) * 0.9;
        b.pipe("brass", 0, -1.5, cz, x, -1.8, z, 0.01, 3);
        if (i % 3)
          b.geo("lamp", K.sphereGeo(), { x, y: -1.8, z, s: 0.05, tint: warm });
      }
      b.cyl("brass", 0, -1.85, cz, 0.95, 0.95, 0.05, 16, { top: false });
      b.light(0, -1.9, cz, warm, 1.15, 13, { box: HB });
      b.glow(0, -1.8, cz, [0.7, 0.55, 0.35], 3);
    }
    // wall sconces between the blind arches (half of them still burn)
    for (const sx of [-1, 1])
      for (const cz of [-29, -35, -41, -47]) {
        const x = sx * 17.85,
          on = (cz + (sx > 0 ? 6 : 0)) % 12 !== 0;
        b.box("brass", x, BY + 2.6, cz, 0.12, 0.3, 0.12, {});
        b.pipe("brass", x, BY + 2.75, cz, x - sx * 0.3, BY + 2.95, cz, 0.02, 4);
        if (on) {
          b.geo("lamp", K.sphereGeo(), {
            x: x - sx * 0.32,
            y: BY + 3.02,
            z: cz,
            s: 0.07,
            tint: warm,
          });
          b.light(x - sx * 0.8, BY + 3.0, cz, warm, 0.7, 6, { box: HB });
          b.glow(x - sx * 0.32, BY + 3.02, cz, [0.7, 0.5, 0.3], 0.9);
        }
      }
    b.cyl("brass", 11, BY + 0.5, -36, 0.95, 0.95, 0.05, 16, { top: false });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * 6.28;
      b.pipe(
        "brass",
        11,
        BY + 0.9,
        -36,
        11 + Math.cos(a) * 0.9,
        BY + 0.5,
        -36 + Math.sin(a) * 0.9,
        0.01,
        3,
      );
    }
    K.rubble(b, 11, BY, -36, 1.4, 0.5, { seed: 31 });
    b.light(-14, BY + 2.2, -25, [1, 0.3, 0.15], 0.6, 5, { box: HB });
    b.glow(-17.7, BY + 2.4, -34, [1, 0.25, 0.1], 0.8);
    b.glow(0, BY + 2.9, -24.2, [1, 0.25, 0.1], 0.8);
    K.litter(b, -17, -46, 17, -25, BY, 24, 404);

    // ================================================= BASEMENT CORRIDOR & BACKSTAGE (reward room)
    const BCB = [-24.1, BY - 0.2, -62.1, -17.9, BY + 3.6, -29.9];
    K.room(b, ctx, {
      x0: -24,
      z0: -62,
      x1: -18,
      z1: -30,
      y: BY,
      h: 3.5,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_red",
      wc: [0.55, 0.42, 0.36],
      ceil: "concrete",
      cc: [0.38, 0.37, 0.35],
      trim: false,
    });
    b.pipe("rust", -23.8, BY + 3.1, -62, -23.8, BY + 3.1, -30, 0.1, 6);
    b.pipe("metal", -18.3, BY + 3.2, -62, -18.3, BY + 3.2, -30, 0.06, 6, {
      tint: [0.4, 0.45, 0.4],
    });
    K.lamp(b, -21, BY + 3.0, -38, "cage", warm, 0.6, 7, {
      ceil: BY + 3.5,
      lightOpts: { box: BCB },
    });
    K.lamp(b, -21, BY + 3.0, -54, "cage", [1, 0.3, 0.15], 0.6, 6, {
      ceil: BY + 3.5,
      lightOpts: { box: BCB },
    });
    b.plate(
      "art",
      -18.1,
      BY + 2.0,
      -46,
      -1,
      0,
      2.2,
      0.5,
      K.signCell("cu_stage_door", "STAGE DOOR · FACULTY ONLY", 384, 80, {
        bg: "#1a1a1a",
        fg: "#e8d8b0",
        font: "Arial, sans-serif",
      }),
    );
    K.loot(ctx, "locker", -23.4, BY, -44, HP, {
      count: 3,
      loot: "locker",
      name: "Janitor's Lockers",
    });
    const BKB = [-18.1, BY - 0.2, -62.1, -3.9, BY + 4.1, -53.9];
    K.room(b, ctx, {
      x0: -18,
      z0: -62,
      x1: -4,
      z1: -54,
      y: BY,
      h: 4.0,
      floor: "wood",
      fc: [0.5, 0.4, 0.3],
      wall: "brick_red",
      wc: [0.6, 0.45, 0.38],
      ceil: "wood",
      cc: [0.4, 0.32, 0.25],
      trim: false,
      surface: "wood",
    });
    K.stairs(b, -9, -56.8, -7, -54.1, BY, BY + 1, "+z", {
      mat: "wood",
      tint: [0.5, 0.36, 0.26],
      rail: "l",
      railMat: "black_iron",
      handMat: "mahogany",
    });
    // Peter Cooper's workshop: the Tom Thumb locomotive model on a workbench
    const wb = K.table(b, -13, BY, -60.9, 3.4, 1.2, {
      mat: "wood_dark",
      h: 0.9,
    });
    const lx = -13,
      lz = -60.9,
      ly = wb;
    b.boxMM(
      "black_iron",
      lx - 0.7,
      ly,
      lz - 0.2,
      lx + 0.7,
      ly + 0.08,
      lz + 0.2,
      {},
    );
    b.cyl("copper", lx - 0.1, ly + 0.08, lz, 0.16, 0.16, 0.5, 10, {
      tint: [0.7, 0.45, 0.25],
    }); // upright boiler
    b.pipe(
      "black_iron",
      lx - 0.1,
      ly + 0.58,
      lz,
      lx - 0.1,
      ly + 0.85,
      lz,
      0.05,
      6,
    );
    for (const s of [-1, 1])
      for (const e of [-0.45, 0.45])
        b.geo("black_iron", K.unitCyl(10), {
          x: lx + e,
          y: ly + 0.1,
          z: lz + s * 0.22,
          sx: 0.13,
          sy: 0.03,
          sz: 0.13,
          rx: HP,
        });
    b.boxMM(
      "wood",
      lx + 0.25,
      ly + 0.08,
      lz - 0.18,
      lx + 0.7,
      ly + 0.28,
      lz + 0.18,
      { tint: [0.6, 0.45, 0.3] },
    );
    K.anchor(ctx, "tom_thumb", lx + 0.5, ly + 0.02, lz + 0.35);
    b.plate(
      "art",
      -13,
      BY + 2.2,
      -61.88,
      0,
      1,
      2.6,
      1.2,
      K.signCell(
        "cu_tomthumb",
        '"TOM THUMB" — 1830\nThe first American-built\nsteam locomotive, by P. Cooper.\nIt lost its race to a horse.',
        384,
        180,
        {
          bg: "#e8dcc0",
          fg: "#3a2a1a",
          font: "Georgia, serif",
          border: "#6a4a2a",
        },
      ),
    );
    K.framed(
      b,
      -4.12,
      BY + 2.1,
      -58,
      -1,
      0,
      1.2,
      1.5,
      K.painting(34, 160, 200),
      { frame: "gold" },
    );
    for (let k = 0; k < 4; k++)
      b.box(
        "wood",
        -16.8 + (k % 2) * 0.9,
        BY + Math.floor(k / 2) * 0.8,
        -55,
        0.8,
        0.8,
        0.8,
        { yaw: r() * 0.3, tint: [0.6, 0.48, 0.34] },
      );
    b.col(-17.3, BY, -55.5, -15.3, BY + 1.6, -54.5, {});
    K.lamp(b, -12, BY + 3.4, -58, "pendant", warm, 0.85, 7, {
      ceil: BY + 4,
      shade: "paint_green",
      lightOpts: { box: BKB },
    });
    K.loot(ctx, "safe", -4.6, BY, -61.2, -HP, {
      loot: "safe",
      name: "Founder's Strongbox",
      lock: K.regLock({
        id: "pev_lk_cu_strongbox",
        label: "Founder's Strongbox",
        kind: "safe",
        code: "1830",
        hint: "Professor Hewitt's robotics-lab teletype mentions it.",
      }),
    });
    K.loot(ctx, "crate", -6.5, BY, -56, 0.3, {
      kind: "teletype",
      loot: "weapon_crate",
      name: "Confiscated Items (Students)",
    });
    K.note(ctx, "pev_note_cu_cooper", -12.2, wb + 0.01, -60.6, {
      name: "Letter from Peter Cooper (copy)",
      title: "A letter, framed, much reproduced",
      text: '"My feelings have been deeply interested in the great work of education… I have endeavoured to provide a place where the young may acquire knowledge free, as free as water or air."\n\n— P. Cooper, 1859 (paraphrased on the plaque the Dean had made in 1966, right above the tuition schedule)',
    });

    // ================================================= doors, anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pev_cu_in",
      pos: new THREE.Vector3(DOOR_X, 1.4, PZ + 0.45),
      label: "Cooper Union Foundation Building",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.6, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("cooper_union")),
    });
    K.door(ctx, {
      id: "pev_cu_out",
      pos: new THREE.Vector3(OX, OY + 1.4, OZ - 0.35),
      label: "Cooper Square",
      verb: "Leave",
      target: { x: DOOR_X, y: 0.12, z: PZ + 2.2, yaw: PI },
    });
    K.anchor(ctx, "entrance", 0, 0, -1.6);
    K.anchor(ctx, "boss", 0, BY + 1, -49.2);
    K.anchor(ctx, "proctor", -9, F2, -18);
    K.anchor(ctx, "hall", 0, BY, -38);
    [
      [-3.5, 0, -7],
      [-16, 0, -5],
      [16, 0, -22],
      [-10, BY, -36],
      [9.5, BY, -41],
      [-12, F2, -17],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", -4.6, BY, -61.2);
    K.anchor(ctx, "loot2", 23.4, F2, -28.8);
    K.anchor(ctx, "loot3", -12, 0, -29.3);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_cooper_int";

    // the security shutter (separate so it can roll up)
    const sb = K.builder({
      name: "cu_shutter",
      off: O,
      lit: true,
      amb: [0.1, 0.1, 0.1],
      grime: 0.4,
    });
    sb.light(0, 2, -12.5, [1, 0.5, 0.3], 0.7, 5);
    sb.boxMM(
      "corrugated",
      SHUT.x0,
      0,
      SHUT.z - 0.12,
      SHUT.x1,
      3.2,
      SHUT.z + 0.08,
      { tint: [0.6, 0.6, 0.56], faces: "nsewtb" },
    );
    for (let k = 0; k < 6; k++)
      sb.boxMM(
        k % 2 ? "paint_black" : "paint_yellow",
        SHUT.x0 + (k * 4) / 6,
        0.1,
        SHUT.z + 0.09,
        SHUT.x0 + ((k + 1) * 4) / 6,
        0.5,
        SHUT.z + 0.11,
        { tint: k % 2 ? [0.08, 0.08, 0.08] : [0.8, 0.6, 0.12] },
      );
    sb.plate(
      "art",
      0,
      1.8,
      SHUT.z + 0.1,
      0,
      1,
      2.6,
      0.9,
      K.signCell(
        "cu_shut_sign",
        "GREAT HALL SEALED\nEXAMINATION IN PROGRESS",
        384,
        130,
        {
          bg: "#e0b020",
          fg: "#1a1a1a",
          font: "Arial Black, sans-serif",
          border: "#1a1a1a",
        },
      ),
    );
    const shutter = sb.finish(ctx.intRoot);
    ctx.shutter = { obj: shutter, col: null, t: 0, opening: false };
  }

