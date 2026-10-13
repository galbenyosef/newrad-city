// play-inline-118 18 — the
// Lines 4488-4774 of readable/play-inline-118.pretty.js (statement-aligned).
  function speakeasy(rec, O) {
    // the street gate opens onto the top of a subway stair: a 3.8 m stair hall (landing 3 m up, 15 steps down east),
    // then through the tiled wall onto the old platform where the bar is
    const r = Room("speak", O.x - 25, O.z + 70, 16, 7, 3.6, {
      doorAt: -5.5,
      grime: 0.45,
      zExt: 3.8,
      entryY: 3.0,
      entryYaw: -PI / 2,
    });
    shell(r, {
      floor: "nx_concrete",
      floorTint: 0x6a6a60,
      wall: "nx_tile",
      wallTint: 0xe8dcc0,
      dado: "nx_tile",
      dadoTint: 0x8a3a2a,
      dadoH: 1.0,
      rail: false,
      trim: "wood_dark",
      ceil: "nx_tin",
      ceilTint: 0x4a4038,
      doorLeaf: "metal_dark",
      split: { z: r.Z(3.5), h2: 6.4 },
    });
    {
      const LY = r.entryY,
        WZ = 3.5,
        wz1 = 3.7,
        z1 = 7.3;
      // the tiled wall between the stair hall and the platform (opening at x 3.8..8 at the stair foot)
      r.bx("nx_tile", -8, 0, WZ, 3.8, 3.6, wz1, { tint: 0xe8dcc0 });
      r.col(-8, 0, WZ, 3.8, 3.6, wz1);
      r.bx("nx_tile", -8, 0, wz1, 3.8, 1.0, wz1 + 0.01, {
        tint: 0x8a3a2a,
        faces: "s",
      });
      r.bx("wood_dark", 3.8, 0, WZ - 0.05, 4.05, 3.6, wz1 + 0.05, {}); // opening jamb
      r.bx("paint_red", -8, 2.3, wz1, 3.8, 2.45, wz1 + 0.03, {
        tint: 0x6a1a18,
      });
      // the entrance landing (tiled masonry block) and the stair (bottom at x 3.8, rising west to the landing)
      r.bx("nx_tile", -8, 0, wz1, -4.2, LY, z1, { tint: 0xd8ccb0 });
      r.col(-8, 0, wz1, -4.2, LY, z1, { surface: "concrete" });
      r.bx("concrete", -8, LY - 0.02, wz1, -4.2, LY + 0.01, z1, {
        tint: 0x8a8578,
        grime: 0.6,
      });
      r.b.stairs(
        "concrete",
        r.X(3.8),
        r.Z((wz1 + z1) / 2),
        -1,
        0,
        z1 - wz1,
        8.0,
        0,
        LY,
        15,
        { tint: 0x9a9488, grime: 0.6, solid: true },
      );
      for (let k = 0; k < 15; k++) {
        const xf = 3.8 - (k * 8.0) / 15,
          top = (LY * (k + 1)) / 15;
        r.bx(
          "brass",
          xf - 0.07,
          top - 0.03,
          wz1 + 0.05,
          xf + 0.005,
          top + 0.006,
          z1 - 0.05,
          { grime: 0.7 },
        );
      } // brass nosings on each tread's front edge
      // brass handrails on both walls, following the flight
      for (const hz of [wz1 + 0.08, z1 - 0.08]) {
        r.b.beam(
          "brass",
          r.X(3.9),
          0.95,
          r.Z(hz),
          r.X(-4.2),
          LY + 0.95,
          r.Z(hz),
          0.03,
        );
        r.b.beam(
          "brass",
          r.X(-4.2),
          LY + 0.95,
          r.Z(hz),
          r.X(-7.8),
          LY + 0.95,
          r.Z(hz),
          0.03,
        );
      }
      // mosaics + the old token sign + an arrow down to the trains
      for (const lx of [-6, -1, 4])
        poster(
          r,
          "q_mosaic",
          r.X(lx),
          lx < -4 ? LY + 1.9 : 2.2 + (((3.8 - lx) * LY) / 8.0) * 0.9,
          r.Z(z1 - 0.02),
          0.55,
          0.55,
          PI,
        );
      board(r, "b_speak", r.X(-1.2), 2.3, r.Z(3.45), 2.6, 0.45, PI);
      board(r, "b_trains", r.X(-2.0), LY + 1.6, r.Z(wz1 + 0.02), 2.4, 0.42, 0);
      for (const lx of [-6.1, -1.0, 4.5])
        lamp(r, r.X(lx), r.Z(5.5), {
          kind: "cage",
          y: 5.9,
          ceil: 6.4,
          col: 0xffc080,
          pool: 3.0,
          i: 0.4,
          fy: lx < -4 ? LY : lx > 3.8 ? 0 : (LY * (3.8 - lx)) / 8.0,
        });
      // litter on the treads, a dead commuter, graffiti-marked turnstile stub at the foot
      const rr = K.rng(9707);
      for (let k = 0; k < 14; k++) {
        const x = -3.8 + rr() * 7.4,
          y = Math.max(0, (LY * (3.8 - x)) / 8.0);
        r.b.box(
          "paint_white",
          r.X(x),
          y + 0.01,
          r.Z(wz1 + 0.3 + rr() * 2.8),
          0.2,
          0.004,
          0.14,
          { yaw: rr() * 3, tint: 0xd8ccb0 },
        );
      }
      P.skeleton && P.skeleton(r.b, r.X(5.6), 0.02, r.Z(6.4), 1.9);
    }
    const A = (n, lx, lz, yaw, y) =>
      rec.anchor(n, r.X(lx), y || 0, r.Z(lz), nrm(yaw || 0));
    r.bx("paint_red", -8, 2.3, -3.49, 8, 2.45, -3.46, { tint: 0x6a1a18 });
    for (const lx of [-6, 0, 6])
      poster(r, "q_mosaic", r.X(lx), 2.85, r.Z(-3.47), 0.55, 0.55, 0);
    // the bar: the old token booth (glass windows) with a counter run out of it; bottles; the bartender
    r.bx("wood_dark", 4.0, 0, -1.9, 7.9, 1.0, -1.4, { tint: 0x5a3a20 });
    r.bx("wood", 3.9, 1.0, -1.95, 7.95, 1.06, -1.35, {});
    r.col(4.0, 0, -1.9, 7.9, 1.06, -1.4, { surface: "wood" });
    r.bx("wood_dark", 5.4, 1.06, -3.45, 7.95, 2.6, -3.35, { tint: 0x3a2a18 });
    for (let i = 0; i < 2; i++) {
      r.bx("wood", 5.5, 1.5 + i * 0.5, -3.45, 7.8, 1.53 + i * 0.5, -3.25, {});
      for (let k = 0; k < 9; k++)
        r.b.cyl(
          "lit_warm",
          r.X(5.6 + k * 0.25),
          1.53 + i * 0.5,
          r.Z(-3.35),
          0.035,
          0.03,
          0.24,
          6,
          { tint: [0x8a5a1a, 0x3a6a2a, 0xb06a1a][k % 3] },
        );
    }
    r.bx("brass", 3.9, 0, -1.95, 4.0, 2.4, -1.85, {});
    r.bx("wood_dark", 3.9, 0, -3.5, 4.0, 1.0, -1.95, { tint: 0x5a3a20 });
    r.b.panel("glass", r.X(3.88), 1.75, r.Z(-2.7), 1.4, 1.3, -PI / 2, {});
    r.col(3.9, 0, -3.5, 4.0, 2.4, -1.85);
    neonSign(r, "x_bar", r.X(6.6), 3.0, r.Z(-3.45), 1.2, 0, 0x6ac8ff);
    A("speakeasy_bar", 6.2, -2.6, PI);
    note("lma_neon_note_matchbook", r.X(4.4), 1.07, r.Z(-1.65), {
      name: "Matchbook: The 42",
      title: 'Matchbook — "The 42"',
      value: 1,
      text: "A matchbook from 'THE 42 — Downstairs, Where the Trains Don't Run'. Three matches left.\n\nInside the flap, in lipstick: 'Knock twice, wait, knock once. Tell Lou that Whisper sent you. Do NOT order the Blast Radius.'",
    });
    note("lma_neon_note_napkin", r.X(-1.3), 0.775, r.Z(0.65), {
      name: "Bar Napkin",
      title: "Bar Napkin (gin-stained)",
      value: 0,
      text: "Pencil on a gin-stained napkin, in two different hands:\n\n'Goldie says the Pawn Palace safe is 7-0-4-1. She said it OUT LOUD. After the fourth gin.'\n\n'She'll change it tomorrow.'\n\n'She said that last month.'",
    });
    K.learnFromItem("lma_neon_note_napkin", "lma_neon_pawn_safe");
    STORY.push({
      kind: "radio",
      id: "neon_speak_radio",
      x: r.X(7.4),
      y: 1.06,
      z: r.Z(-1.75),
      yaw: PI,
    });
    A("speakeasy_bartender", 6.2, -2.6, PI);
    for (let k = 0; k < 3; k++) {
      r.b.cyl(
        "chrome",
        r.X(4.8 + k * 1.0),
        0,
        r.Z(-0.9),
        0.04,
        0.04,
        0.72,
        6,
        {},
      );
      r.b.cyl(
        "fabric",
        r.X(4.8 + k * 1.0),
        0.72,
        r.Z(-0.9),
        0.19,
        0.19,
        0.07,
        10,
        { tint: 0x6a1a18 },
      );
    }
    // card tables with lanterns, a turnstile row at the dead end, the "secret door"
    for (const t of [
      [-1.5, 0.5],
      [1.8, 1.2],
      [-3.8, -1.6],
    ]) {
      P.table(r.b, r.X(t[0]), 0, r.Z(t[1]), 0.3, { w: 1.0, d: 1.0 });
      P.chair(r.b, r.X(t[0] - 0.8), 0, r.Z(t[1]), PI / 2);
      P.chair(r.b, r.X(t[0] + 0.8), 0, r.Z(t[1]), -PI / 2);
      r.b.cyl("lit_warm", r.X(t[0]), 0.77, r.Z(t[1]), 0.06, 0.05, 0.16, 6, {
        tint: 0xffa040,
      });
      r.g.add(r.X(t[0]), 0.95, r.Z(t[1]), 0xffa040, "s");
      r.sp.add(r.X(t[0]), r.Z(t[1]), 0xffa050, 1.9, { y: 0.03, i: 0.5 });
      for (let k = 0; k < 4; k++)
        r.b.box(
          "paint_white",
          r.X(t[0] - 0.2 + k * 0.12),
          0.77,
          r.Z(t[1] + 0.1),
          0.06,
          0.004,
          0.09,
          { yaw: k * 0.5 },
        );
      r.col(t[0] - 0.5, 0, t[1] - 0.5, t[0] + 0.5, 0.78, t[1] + 0.5);
    }
    A("speakeasy_patron_1", -0.7, 0.5, PI / 2);
    A("speakeasy_patron_2", 1.0, 1.2, -PI / 2);
    A("speakeasy_patron_3", 5.8, -0.9, 0);
    for (let k = 0; k < 4; k++) {
      const lz = -2.6 + k * 1.4;
      r.bx("steel", -7.9, 0, lz - 0.1, -7.1, 0.95, lz + 0.1, {});
      for (let a = 0; a < 3; a++)
        r.b.beam(
          "chrome",
          r.X(-7.1),
          0.85,
          r.Z(lz),
          r.X(-6.6),
          0.85 + Math.sin(a * 2.1) * 0.3,
          r.Z(lz + Math.cos(a * 2.1) * 0.3),
          0.03,
        );
    }
    r.col(-7.9, 0, -3.5, -6.6, 1.0, 3.5);
    r.bx("nx_tile", -3.2, 0, -3.5, -2.0, 2.4, -3.38, { tint: 0xd8ccb0 });
    r.bx("black_metal", -2.02, 0, -3.5, -1.94, 2.4, -3.4, { tint: 0x050505 });
    for (const lx of [-5, -1, 3, 6.5])
      lamp(r, r.X(lx), r.Z(0), {
        kind: "cage",
        y: 3.0,
        col: 0xffc080,
        pool: 3.0,
        i: 0.4,
      });
    r.fix.push([
      r.X(5.5),
      2.8,
      r.Z(-2.0),
      0xffc890,
      { intensity: 1.1, range: 8 },
    ]);
    finish(r);
    return r;
  }

  // ------------------------------------------------------------------
  // Build + doors + visibility
  // ------------------------------------------------------------------
