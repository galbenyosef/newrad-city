// play-inline-192 06 — cellar
// Lines 1020-1982 of readable/play-inline-192.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "vanguard_int",
      off: O,
      lit: true,
      amb: [0.1, 0.055, 0.05],
      floors: [0, FY, STAGE_Y, CELLAR],
      grime: 0.4,
    });
    const r = K.rng("vv_int");
    const red = [0.62, 0.16, 0.13];
    const ROOM = [-9.2, FY - 0.3, -28.2, 9.2, CY + 0.2, -9.8];

    // ---------------- entry vestibule + the steep stair down ----------------
    const SX0 = -7.6,
      SX1 = -6.2;
    K.room(b, ctx, {
      x0: SX0,
      z0: -1.4,
      x1: SX1,
      z1: 0,
      y: 0,
      h: 2.6,
      floor: "wood",
      fc: [0.5, 0.35, 0.28],
      wall: "plaster",
      wc: red,
      ceil: "plaster",
      cc: [0.4, 0.2, 0.18],
      open: { n: true },
    });
    K.stairs(b, SX0, -10, SX1, -1.4, FY, 0, "+z", {
      mat: "wood",
      tint: [0.45, 0.3, 0.22],
      rail: "l",
      railMat: "black_iron",
      handMat: "black_iron",
      nosing: "brass",
    });
    // shaft walls & sloped ceiling
    for (const [x, s] of [
      [SX0, 1],
      [SX1, -1],
    ])
      K.segWall(b, x, -10, x, -1.4, FY, 2.6, s, {
        mat: "plaster",
        tint: red,
        trim: false,
      });
    b.quadN(
      "plaster",
      [SX0, 2.6, -1.4],
      [SX1, 2.6, -1.4],
      [SX1, CY, -10],
      [SX0, CY, -10],
      [0, -1, 0],
      { tint: [0.35, 0.16, 0.14] },
    );
    for (let k = 0; k < 5; k++) {
      // posters & photos on the way down
      const z = -2.4 - k * 1.6,
        y = 1.6 - (k + 0.5) * 0.8;
      K.framed(b, SX0 + 0.12, y, z, 1, 0, 0.5, 0.65, K.photo("jazz", k), {
        frame: "black_iron",
        fw: 0.03,
      });
      b.plate(
        "art",
        SX1 - 0.11,
        y + 0.1,
        z - 0.6,
        -1,
        0,
        0.55,
        0.8,
        K.signCell(
          "vv_poster" + k,
          [
            "TIN MAN TRIO",
            "BLUE MONDAYS",
            "NO GUNS\nON THE\nBANDSTAND",
            "SAX-O-MATIC\nLIVE",
            "MIND THE\nSTEPS",
          ][k],
          160,
          240,
          {
            bg: ["#2a1a14", "#16243a", "#3a1a10", "#1a2a1a", "#e8d8b0"][k],
            fg: k === 4 ? "#8a1a10" : "#e8d8b0",
            font: "Georgia, serif",
          },
        ),
      );
    }
    K.lamp(b, -6.9, 1.9, -1.8, "bulb", [1, 0.35, 0.25], 0.9, 5, {
      ceil: 2.6,
      lightOpts: { box: [SX0 - 0.1, FY - 0.3, -10.2, SX1 + 0.1, 3, 0.1] },
    });
    K.lamp(b, -6.9, -1.6, -8.2, "bulb", [1, 0.55, 0.3], 0.8, 5, {
      ceil: -0.8,
      lightOpts: { box: [SX0 - 0.1, FY - 0.3, -10.4, SX1 + 0.1, 3, 0.1] },
    });
    b.light(-6.9, 1.2, -0.4, [0.7, 0.75, 0.85], 0.5, 3.5); // street light from the door
    b.plate("wood_dark", -6.9, 1.2, -0.12, 0, -1, 1.2, 2.3, null, {
      tint: [0.4, 0.14, 0.1],
    });

    // ---------------- the club room ----------------
    // floor & ceiling (trapezoid)
    b.quadGrid(
      "carpet",
      [WL[0][0], FY, WL[0][1]],
      [WR[0][0], FY, WR[0][1]],
      [WR[1][0], FY, WR[1][1]],
      [WL[1][0], FY, WL[1][1]],
      { tint: [0.55, 0.22, 0.2], uv: "top" },
    );
    b.col(-9.2, FY - 0.3, -28.2, 9.2, FY, -10, {
      tag: "floor",
      surface: "carpet",
    });
    b.quadGrid(
      "tin",
      [WL[1][0], CY, WL[1][1]],
      [WR[1][0], CY, WR[1][1]],
      [WR[0][0], CY, WR[0][1]],
      [WL[0][0], CY, WL[0][1]],
      { tint: [0.35, 0.2, 0.18], uv: "top", grime: 0.3 },
    );
    // walls
    K.segWall(b, WL[0][0], WL[0][1], WL[1][0], WL[1][1], FY, CY, -1, {
      mat: "plaster",
      tint: red,
      wain: "wood_dark",
      wainC: [0.3, 0.16, 0.12],
      wainH: 0.9,
    });
    K.segWall(b, WR[0][0], WR[0][1], WR[1][0], WR[1][1], FY, CY, 1, {
      mat: "plaster",
      tint: red,
      wain: "wood_dark",
      wainC: [0.3, 0.16, 0.12],
      wainH: 0.9,
    });
    // back wall z=-10 (x -9..9): stair opening, staff door (x −2.5), kitchen door (x 5)
    K.segWall(b, -9, -10, 9, -10, FY, CY, 1, {
      mat: "plaster",
      tint: red,
      gaps: [
        { t: (SX0 + SX1) / 2 + 9, w: SX1 - SX0, y1: CY },
        { t: 6.5, w: 1.0 },
        { t: 14, w: 1.0 },
      ],
      wain: "wood_dark",
      wainC: [0.3, 0.16, 0.12],
      wainH: 0.9,
    });
    // stage wall z=-28 (x -2.5..2.5) with the stage door (x 1.8)
    K.segWall(b, -2.5, -28, 2.5, -28, FY, CY, -1, {
      mat: "velvet",
      tint: [0.6, 0.12, 0.1],
      gaps: [{ t: 4.3, w: 0.9, y0: STAGE_Y, y1: STAGE_Y + 2.1 }],
    });
    // curtain folds
    for (let x = -2.4; x < 2.4; x += 0.22) {
      if (x > 1.2 && x < 2.3) continue;
      b.box("velvet", x, STAGE_Y, -27.85, 0.12, CY - STAGE_Y - 0.05, 0.12, {
        tint: [0.55, 0.1, 0.08],
      });
    }
    b.beam("brass", -2.5, CY - 0.1, -27.8, 2.5, CY - 0.1, -27.8, 0.04, 0.04);
    // stage platform
    b.boxMM("wood_dark", -4.4, FY, -28, 4.4, STAGE_Y, -24.6, {
      tint: [0.4, 0.26, 0.18],
    });
    b.col(-4.4, FY, -28, 4.4, STAGE_Y, -24.6, {
      tag: "stage",
      surface: "wood",
    });
    b.beam("brass", -3.7, STAGE_Y, -24.58, 3.7, STAGE_Y, -24.58, 0.04, 0.04);
    // the neon on the stage wall (script, small)
    b.plate(
      "neon",
      0,
      CY - 0.55,
      -27.7,
      0,
      1,
      2.4,
      0.5,
      K.neonCell("vv_neon_in", "Village Vanguard", 512, 110, {
        color: "#ff4060",
        font: "Brush Script MT, cursive",
        italic: true,
        weight: "normal",
      }),
      { off: 0.02 },
    );
    b.glow(0, CY - 0.55, -27.4, [0.9, 0.2, 0.3], 2.5);
    // instruments: drum kit (left), upright piano (right), double bass (centre)
    drumKit(b, -1.9, STAGE_Y, -26.3);
    piano(b, 2.1, STAGE_Y, -26.2);
    bass(b, 0.2, STAGE_Y, -27.0);
    // stage lights (amber + blue), candle tables, bar back-light
    b.light(-1.2, CY - 0.2, -25.2, [1.0, 0.62, 0.3], 1.8, 6, { box: ROOM });
    b.light(1.4, CY - 0.2, -25.6, [0.45, 0.55, 1.0], 1.3, 5.5, { box: ROOM });
    for (const [x, c] of [
      [-1.2, [1, 0.62, 0.3]],
      [1.4, [0.45, 0.55, 1.0]],
    ]) {
      b.cyl("black_iron", x, CY - 0.35, -24.3, 0.12, 0.16, 0.3, 8, {
        bottom: true,
      });
      b.glow(x, CY - 0.4, -24.5, c, 1.2);
    }
    // warm wall-washers along both long walls (picture lights over the photo gallery)
    for (let t = 0.1; t < 0.95; t += 0.18)
      for (const W of [WL, WR]) {
        const x = W[0][0] + (W[1][0] - W[0][0]) * t,
          z = W[0][1] + (W[1][1] - W[0][1]) * t;
        b.light(x * 0.86, CY - 0.3, z, [1, 0.6, 0.4], 0.75, 4.2, { box: ROOM });
        b.glow(x * 0.9, CY - 0.25, z, [0.8, 0.45, 0.3], 0.5);
      }
    // banquettes along the slanted walls + photo walls
    for (const [W, s] of [
      [WL, 1],
      [WR, -1],
    ]) {
      const ax = W[0][0],
        az = W[0][1],
        bx = W[1][0],
        bz = W[1][1];
      const L = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / L,
        uz = (bz - az) / L;
      // robust inward normal: towards the room centre line x=0
      let ix = uz,
        iz = -ux;
      if (ix * (0 - ax) + iz * (-19 - az) < 0) {
        ix = -ix;
        iz = -iz;
      }
      const yaw = Math.atan2(-ix, -iz);
      for (let t = 1.2; t < L - 3.6; t += 2.3) {
        const px = ax + ux * t + ix * 0.42,
          pz = az + uz * t + iz * 0.42;
        K.sofa(b, px, FY, pz, 2.1, yaw, {
          mat: "leather_red",
          tint: [0.9, 0.3, 0.25],
          d: 0.62,
          backH: 0.55,
          arms: false,
        });
        // small table + candle in front
        const tx = px + ix * 1.0,
          tz = pz + iz * 1.0;
        K.roundTable(b, tx, FY, tz, 0.34, { mat: "wood_dark", h: 0.72 });
        b.cyl("glass", tx, FY + 0.72, tz, 0.035, 0.035, 0.08, 6, {
          tint: [0.9, 0.3, 0.2],
        });
        b.light(tx, FY + 0.95, tz, [1, 0.55, 0.25], 0.55, 2.4, { box: ROOM });
        b.glow(tx, FY + 0.82, tz, [1, 0.5, 0.2], 0.35);
        K.chair(b, tx + ix * 0.6, FY, tz + iz * 0.6, yaw + PI, {
          mat: "wood_dark",
        });
      }
      // photographs
      for (let t = 0.8; t < L - 0.5; t += 0.95) {
        const px = ax + ux * t + ix * 0.1,
          pz = az + uz * t + iz * 0.1;
        const hy = FY + 1.6 + (Math.floor(t / 0.95) % 2) * 0.55;
        K.framed(
          b,
          px,
          hy,
          pz,
          ix,
          iz,
          0.42,
          0.52,
          K.photo("jazz", (((t * 7) | 0) % 16) + (s > 0 ? 0 : 16)),
          { frame: "paint_black", fw: 0.03 },
        );
      }
    }
    // centre tables
    for (const [tx, tz] of [
      [-2.5, -15],
      [0.5, -17.5],
      [-1, -20.5],
      [2.2, -14],
      [1.6, -21.5],
      [-3.8, -18.2],
    ]) {
      K.roundTable(b, tx, FY, tz, 0.36, { mat: "wood_dark", h: 0.72 });
      b.cyl("glass", tx, FY + 0.72, tz, 0.035, 0.035, 0.08, 6, {
        tint: [0.9, 0.3, 0.2],
      });
      b.light(tx, FY + 0.95, tz, [1, 0.55, 0.25], 0.5, 2.3, { box: ROOM });
      b.glow(tx, FY + 0.82, tz, [1, 0.5, 0.2], 0.35);
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + tx;
        K.chair(
          b,
          tx + Math.cos(a) * 0.62,
          FY,
          tz + Math.sin(a) * 0.62,
          Math.atan2(Math.cos(a), Math.sin(a)),
          { mat: "wood_dark" },
        );
      }
    }
    // the bar (back wall, right)
    b.boxMM("mahogany", 1.4, FY, -11.7, 7.4, FY + 1.08, -11.1, {
      tint: [0.55, 0.25, 0.18],
    });
    b.boxMM("brass", 1.35, FY + 1.08, -11.75, 7.45, FY + 1.12, -11.05, {});
    b.beam("brass", 1.4, FY + 0.2, -11.78, 7.4, FY + 0.2, -11.78, 0.04, 0.04); // foot rail
    b.col(1.35, FY, -11.75, 7.45, FY + 1.12, -11.05, {
      tag: "counter",
      surface: "wood",
    });
    K.shelf(b, 4.5, FY + 0.9, -10.25, PI, 3.6, {
      mat: "wood_dark",
      items: ["bottle", "bottle", "bottle", "jar"],
      h: 1.4,
      levels: 3,
      d: 0.3,
      seed: 77,
      col: false,
    });
    b.plate("lamp", 4.5, FY + 1.65, -10.13, 0, 1, 3.6, 1.3, null, {
      tint: [0.35, 0.2, 0.08],
    }); // back-lit mirror glow
    b.light(4.5, FY + 1.5, -10.6, [1, 0.62, 0.3], 1.1, 5, { box: ROOM });
    for (let x = 1.9; x < 7.2; x += 0.9) {
      b.cyl("chrome", x, FY, -12.3, 0.2, 0.18, 0.05, 8);
      b.cyl("chrome", x, FY, -12.3, 0.04, 0.04, 0.72, 6);
      b.cyl("leather_red", x, FY + 0.72, -12.3, 0.2, 0.2, 0.08, 10);
    }
    for (let k = 0; k < 6; k++)
      b.cyl("glass", 2 + k * 0.9, FY + 1.12, -11.4, 0.04, 0.035, 0.12, 6, {
        tint: [0.8, 0.7, 0.5],
      });
    K.lamp(b, 4.5, CY - 0.4, -11.6, "pendant", [1, 0.6, 0.3], 0.6, 4, {
      ceil: CY,
      shade: "paint_red",
      lightOpts: { box: ROOM },
    });
    K.lamp(b, -4, CY - 0.3, -13, "bulb", [1, 0.3, 0.2], 0.5, 6, {
      ceil: CY,
      lightOpts: { box: ROOM },
    });
    K.lamp(b, 0, CY - 0.3, -19, "bulb", [1, 0.3, 0.2], 0.5, 6, {
      ceil: CY,
      lightOpts: { box: ROOM },
    });
    K.anchor(ctx, "bartender", 4.2, FY, -10.6);
    K.loot(ctx, "cash_register", 6.6, FY + 1.12, -11.4, PI, {
      container: false,
    });
    K.loot(ctx, "fizzo_machine", -8.1, FY, -11.2, -0.3, {
      loot: "fizzo_machine",
    });

    // ---------------- green room (x −6.2..1, z −10..−4) + stair down ----------------
    const GR = { x0: -6.2, z0: -10, x1: 1, z1: -4 };
    K.gap(ctx, -2.5, -10, 1.0, FY, 2.2);
    K.gap(ctx, 5, -10, 1.0, FY, 2.2);
    K.room(b, ctx, {
      x0: GR.x0,
      z0: GR.z0,
      x1: GR.x1,
      z1: GR.z1,
      y: FY,
      h: 3.0,
      floor: "wood",
      fc: [0.5, 0.36, 0.28],
      wall: "wallpaper_green",
      wc: [0.55, 0.5, 0.4],
      ceil: "plaster",
      cc: [0.45, 0.42, 0.38],
      noFloor: true,
      surface: "wood",
    });
    b.face("wood", GR.x0, FY, -5.3, 1, 0, 0, 0, 0, -1, GR.x1 - GR.x0, 4.7, {
      uv: "top",
      tint: [0.5, 0.36, 0.28],
    });
    b.col(GR.x0, FY - 0.3, -10, GR.x1, FY, -5.3, {
      tag: "floor",
      surface: "wood",
    });
    b.face("wood", 0.5, FY, -4, 1, 0, 0, 0, 0, -1, 0.5, 1.3, {
      uv: "top",
      tint: [0.5, 0.36, 0.28],
    });
    b.col(0.5, FY - 0.3, -5.3, 1, FY, -4, { tag: "floor" });
    K.stairs(b, -6, -5.3, 0.5, -4.1, CELLAR, FY, "-x", {
      mat: "wood",
      tint: [0.45, 0.32, 0.24],
      rail: "l",
      railMat: "black_iron",
      handMat: "wood_dark",
    });
    K.railing(b, -6, -5.3, 0.5, -5.3, FY, { h: 1.0 });
    // vanity mirror with bulbs, costume rack, couch, instrument cases
    b.plate("glass", -3.6, FY + 1.6, -9.88, 0, 1, 1.6, 0.9, null, {
      tint: [0.5, 0.52, 0.5],
    });
    for (let k = 0; k < 7; k++) {
      const bx = -4.45 + k * 0.28;
      b.geo("lamp", K.sphereGeo(), {
        x: bx,
        y: FY + 2.1,
        z: -9.85,
        s: 0.04,
        tint: [1, 0.85, 0.6],
      });
    }
    b.light(-3.6, FY + 2.0, -9.4, [1, 0.8, 0.55], 1.0, 4.5, {
      box: [
        GR.x0 - 0.1,
        FY - 0.2,
        GR.z0 - 0.1,
        GR.x1 + 0.1,
        FY + 3.2,
        GR.z1 + 0.1,
      ],
    });
    b.glow(-3.6, FY + 2.1, -9.7, [0.9, 0.7, 0.5], 1.4);
    K.table(b, -3.6, FY, -9.55, 1.8, 0.5, { mat: "wood_dark", h: 0.78 });
    K.sofa(b, -0.2, FY, -8.4, 1.9, -HP, {
      mat: "velvet",
      tint: [0.4, 0.3, 0.5],
    });
    b.pipe("chrome", -5.9, FY + 1.7, -9.6, -5.9, FY + 1.7, -7.2, 0.02, 4);
    for (let k = 0; k < 5; k++)
      b.box("fabric", -5.9, FY + 0.7, -9.3 + k * 0.45, 0.05, 0.95, 0.4, {
        tint: r.pick([
          [0.8, 0.7, 0.3],
          [0.2, 0.2, 0.25],
          [0.7, 0.2, 0.3],
          [0.3, 0.4, 0.6],
        ]),
      });
    b.box("leather", -2.2, FY, -7.4, 0.5, 1.3, 0.25, {
      yaw: 0.4,
      tint: [0.3, 0.2, 0.12],
    }); // bass case
    b.box("leather", -1.4, FY, -7.8, 0.3, 0.2, 0.9, {
      yaw: -0.3,
      tint: [0.25, 0.15, 0.1],
    }); // horn case
    K.lamp(b, -2.6, FY + 2.6, -7.2, "bulb", [1, 0.8, 0.55], 0.6, 5, {
      ceil: FY + 3.0,
      lightOpts: {
        box: [
          GR.x0 - 0.1,
          FY - 0.2,
          GR.z0 - 0.1,
          GR.x1 + 0.1,
          FY + 3.2,
          GR.z1 + 0.1,
        ],
      },
    });
    b.plate(
      "art",
      -2.5,
      FY + 2.3,
      -4.12,
      0,
      -1,
      1.1,
      0.4,
      K.signCell("vv_staff", "STAFF ONLY", 256, 80, {
        bg: "#2a1a14",
        fg: "#e8d8b0",
      }),
    );
    K.loot(ctx, "locker", 0.6, FY, -9.6, -HP, {
      loot: "locker",
      owner: "settlers",
      name: "Band Locker",
    });
    // (the room's south side: back wall line z=−4 of the club back row is the office/kitchen … close it)

    // ---------------- kitchen (x 1..9, z −10..−4) ----------------
    K.gap(ctx, 1, -7, 1.0, FY, 2.2);
    K.gap(ctx, 5, -4, 1.0, FY, 2.2);
    const KB = [0.9, FY - 0.2, -10.1, 9.1, FY + 3.2, -3.9];
    K.room(b, ctx, {
      x0: 1,
      z0: -10,
      x1: 9,
      z1: -4,
      y: FY,
      h: 3.0,
      floor: "checker",
      fc: [0.7, 0.68, 0.64],
      wall: "tile",
      wc: [0.8, 0.8, 0.74],
      ceil: "plaster",
      cc: [0.6, 0.6, 0.56],
    });
    b.boxMM("metal", 7.8, FY, -9.9, 8.9, FY + 0.9, -6.8, {
      tint: [0.5, 0.5, 0.48],
    }); // range
    for (let k = 0; k < 4; k++)
      b.cyl("black_iron", 8.35, FY + 0.9, -9.4 + k * 0.7, 0.16, 0.16, 0.02, 10);
    b.boxMM("metal", 7.9, FY + 1.9, -9.9, 8.95, FY + 2.6, -6.8, {
      tint: [0.45, 0.45, 0.42],
    }); // hood
    b.col(7.8, FY, -9.9, 8.9, FY + 0.9, -6.8, { tag: "counter" });
    b.boxMM("steel", 3.2, FY, -7.6, 6.2, FY + 0.9, -6.6, {
      tint: [0.7, 0.72, 0.72],
    }); // prep table
    b.col(3.2, FY, -7.6, 6.2, FY + 0.9, -6.6, { tag: "counter" });
    b.box("wood", 4.2, FY + 0.9, -7.1, 0.5, 0.05, 0.35, {});
    b.box("steel", 4.2, FY + 0.95, -7.1, 0.3, 0.02, 0.05, {});
    b.pipe("black_iron", 3.4, FY + 2.2, -7.1, 6.0, FY + 2.2, -7.1, 0.02, 4);
    for (let k = 0; k < 5; k++)
      b.cyl("steel", 3.7 + k * 0.55, FY + 1.7, -7.1, 0.14, 0.12, 0.14, 8, {
        tint: [0.6, 0.62, 0.6],
      });
    K.shelf(b, 1.25, FY, -8.2, HP, 3.0, {
      mat: "metal",
      items: ["can", "jar", "box", "can"],
      seed: 88,
    });
    b.boxMM("ceramic", 5.8, FY + 0.8, -9.95, 7.2, FY + 0.95, -9.3, {
      tint: [0.85, 0.85, 0.82],
    });
    // Mags's chalkboard menu (quest hook)
    b.plate(
      "art",
      3.6,
      FY + 1.8,
      -9.88,
      0,
      1,
      1.4,
      1.0,
      K.signCell(
        "vv_menu",
        "MENU\nROACH SKEWER 4 SCRIP\nPOTATO MASH 3 SCRIP\nPASTRAMI ON RYE ???",
        256,
        192,
        {
          bg: "#1c241e",
          fg: "#e8e8d8",
          font: "Comic Sans MS, cursive",
          weight: "normal",
        },
      ),
    );
    K.lamp(b, 5, FY + 2.8, -7, "tube", [0.9, 0.95, 1.0], 1.0, 7, {
      ceil: FY + 3.0,
      len: 1.4,
      lightOpts: { box: KB },
    });
    K.loot(ctx, "fridge", 1.5, FY, -5.0, HP, {
      loot: "fridge",
      owner: "settlers",
    });

    // ---------------- office (x 1..9, z −4..0) ----------------
    const OB = [0.9, FY - 0.2, -4.1, 9.1, FY + 3.2, 0.1];
    K.room(b, ctx, {
      x0: 1,
      z0: -4,
      x1: 9,
      z1: 0,
      y: FY,
      h: 3.0,
      floor: "wood",
      fc: [0.5, 0.38, 0.3],
      wall: "wallpaper",
      wc: [0.6, 0.45, 0.4],
      wain: "wood_dark",
      wainC: [0.4, 0.26, 0.2],
      ceil: "plaster",
      cc: [0.5, 0.46, 0.42],
      surface: "wood",
    });
    const dt = K.table(b, 6.5, FY, -1.3, 1.7, 0.85, { mat: "mahogany" });
    K.chair(b, 6.5, FY, -0.5, PI, { mat: "leather" });
    K.terminal(
      ctx,
      "pv_term_vanguard",
      6.9,
      dt,
      -1.45,
      0,
      termOffice(),
      "bare",
    );
    K.lamp(b, 5.9, dt + 0.35, -1.5, "pendant", [1, 0.85, 0.6], 0.8, 4.5, {
      ceil: dt + 0.45,
      shade: "paint_green",
      lightOpts: { box: OB },
    });
    b.box("brass", 5.9, dt, -1.5, 0.15, 0.4, 0.15, {});
    K.salonWall(
      b,
      1.4,
      8.6,
      FY + 1.1,
      FY + 2.8,
      -0.12,
      0,
      -1,
      "vv_office_photos",
      { density: 0.95, photos: "jazz" },
    );
    for (let k = 0; k < 4; k++) {
      b.boxMM(
        "wood",
        1.2 + k * 0.62,
        FY,
        -3.9,
        1.75 + k * 0.62,
        FY + 0.45,
        -3.4,
        { tint: [0.5, 0.4, 0.3] },
      );
      for (let j = 0; j < 8; j++)
        b.box(
          "flat",
          1.25 + k * 0.62 + j * 0.06,
          FY + 0.45,
          -3.65,
          0.01,
          0.32,
          0.32,
          {
            tint: r.pick([
              [0.1, 0.1, 0.1],
              [0.7, 0.2, 0.2],
              [0.2, 0.3, 0.6],
              [0.8, 0.7, 0.4],
            ]),
          },
        );
    }
    b.col(1.2, FY, -3.9, 3.7, FY + 0.45, -3.4, { tag: "furniture" });
    b.boxMM("wood_dark", 1.2, FY, -2.2, 1.9, FY + 0.8, -1.4, {
      tint: [0.45, 0.3, 0.2],
    });
    b.cyl("paint_black", 1.55, FY + 0.8, -1.8, 0.28, 0.28, 0.02, 16);
    b.cyl("brass", 1.55, FY + 0.8, -1.8, 0.03, 0.05, 0.35, 6, {});
    b.col(1.2, FY, -2.2, 1.9, FY + 0.8, -1.4, { tag: "furniture" });
    K.lamp(b, 5, FY + 2.7, -2, "bulb", [1, 0.8, 0.55], 0.6, 5, {
      ceil: FY + 3.0,
      lightOpts: { box: OB },
    });
    K.loot(ctx, "safe", 8.8, FY, -3.4, -HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Club Safe",
      tag: "safe",
      owner: "settlers",
    });
    K.loot(ctx, "file_cabinet", 8.6, FY, -0.5, -HP, {
      loot: "file_cabinet",
      owner: "settlers",
    });

    // ---------------- cellar (x −6.2..9, z −10..−3.9) at y −7.6 ----------------
    const CB = [-6.3, CELLAR - 0.2, -10.1, 9.1, FY, -3.8];
    K.gap(ctx, 0, -10, 1.8, CELLAR, 2.3);
    K.room(b, ctx, {
      x0: -6.2,
      z0: -10,
      x1: 9,
      z1: -3.9,
      y: CELLAR,
      h: 3.1,
      floor: "concrete",
      fc: [0.55, 0.53, 0.5],
      wall: "brick_red",
      wc: [0.6, 0.5, 0.44],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      noCeil: true,
      trim: false,
    });
    b.face("concrete", -6.2, CELLAR + 3.1, -10, 1, 0, 0, 0, 0, 1, 15.2, 4.7, {
      uv: "top",
      tint: [0.4, 0.4, 0.38],
    });
    b.face("concrete", 0.5, CELLAR + 3.1, -5.3, 1, 0, 0, 0, 0, 1, 8.5, 1.4, {
      uv: "top",
      tint: [0.4, 0.4, 0.38],
    });
    for (let x = -5; x < 9; x += 2.5)
      b.beam("rust", x, CELLAR + 2.95, -10, x, CELLAR + 2.95, -3.9, 0.2, 0.3, {
        tint: [0.5, 0.4, 0.32],
      });
    // generator + workbench + kegs + crates
    b.boxMM("paint_yellow", 5.8, CELLAR, -9.6, 8.6, CELLAR + 1.4, -8.2, {
      tint: [0.55, 0.45, 0.15],
    });
    b.cyl("metal_dark", 7.2, CELLAR + 1.4, -8.9, 0.35, 0.35, 0.5, 10);
    b.pipe("rust", 8.4, CELLAR + 1.2, -8.9, 8.4, CELLAR + 3.1, -8.9, 0.1, 6);
    b.col(5.8, CELLAR, -9.6, 8.6, CELLAR + 1.4, -8.2, {
      tag: "machine",
      surface: "metal",
    });
    b.glow(6.2, CELLAR + 1.1, -8.15, [0.3, 1, 0.3], 0.3);
    for (let k = 0; k < 5; k++) {
      b.cyl(
        "wood",
        -5.4 + (k % 3) * 0.75,
        CELLAR,
        -9.4 + Math.floor(k / 3) * 0.8,
        0.33,
        0.33,
        0.9,
        10,
        { tint: [0.55, 0.4, 0.28] },
      );
      b.cyl(
        "rust",
        -5.4 + (k % 3) * 0.75,
        CELLAR + 0.2,
        -9.4 + Math.floor(k / 3) * 0.8,
        0.34,
        0.34,
        0.06,
        10,
        { top: false },
      );
    }
    b.col(-5.8, CELLAR, -9.8, -3.6, CELLAR + 0.9, -8.2, {});
    K.shelf(b, 8.75, CELLAR, -5.5, -HP, 2.6, {
      mat: "metal",
      items: ["box", "bottle", "jar", "can"],
      seed: 99,
    });
    K.lamp(b, 2, CELLAR + 2.6, -7, "cage", [1, 0.75, 0.45], 0.9, 7, {
      ceil: CELLAR + 3.1,
      lightOpts: { box: CB },
    });
    K.lamp(b, 7, CELLAR + 2.6, -5, "cage", [1, 0.75, 0.45], 0.6, 5, {
      ceil: CELLAR + 3.1,
      lightOpts: { box: CB },
    });
    K.loot(ctx, "workbench", 3.6, CELLAR, -9.5, 0, { container: false });
    K.loot(ctx, "footlocker", -5.6, CELLAR, -4.6, HP, {
      loot: "drinks",
      lock: LK.reserve,
      name: "Mags's Reserve (1938)",
      owner: "settlers",
    });
    K.loot(ctx, "crate", 8.2, CELLAR, -4.6, 0.2, {
      loot: "crate",
      owner: "settlers",
    });
    K.skel(ctx, 1.2, CELLAR, -4.6, 0.8, "sitting");
    b.boxMM("paint_black", 0.6, CELLAR, -4.3, 1.8, CELLAR + 0.9, -3.95, {
      tint: [0.25, 0.25, 0.25],
    }); // tape machine
    for (const s of [-1, 1])
      b.cyl("metal", 1.2 + s * 0.3, CELLAR + 0.9, -4.12, 0.18, 0.18, 0.03, 12);
    K.note(ctx, "pv_reel_lastset", 1.3, CELLAR + 0.92, -4.3, {
      type: "tape",
      name: "Tape Reel: The Last Set (Mar. '67)",
      title: "Live at the Vanguard — the last set",
      text: '[Applause. Glasses. A piano vamps.]\n\nMC: "Ladies and gentlemen, it\'s getting late and the radio says the Russians are getting closer, so we\'re gonna play slower. Make it last."\n\n[A trio plays for eleven minutes. Somebody requests a song the band doesn\'t know. They play it anyway.]\n\nMC: "Tip your bartender. Tomorrow\'s a big day. Everybody says so."\n\n[Applause. The tape runs on in silence for forty minutes. Then, very faintly, the engineer, to himself: "...Worth it."]',
    });

    // ---------------- service tunnel (x −1..1, z −31..−10) ----------------
    const TB = [-1.2, CELLAR - 0.2, -31.2, 1.2, CELLAR + 2.8, -9.9];
    K.room(b, ctx, {
      x0: -1,
      z0: -31,
      x1: 1,
      z1: -10,
      y: CELLAR,
      h: 2.5,
      floor: "concrete",
      fc: [0.45, 0.44, 0.42],
      wall: "brick_brown",
      wc: [0.55, 0.45, 0.4],
      ceil: "concrete",
      cc: [0.35, 0.34, 0.32],
      trim: false,
    });
    b.pipe("rust", 0.8, CELLAR + 2.2, -10, 0.8, CELLAR + 2.2, -31, 0.08, 6, {
      tint: [0.5, 0.4, 0.32],
    });
    b.pipe("metal", -0.8, CELLAR + 2.1, -10, -0.8, CELLAR + 2.1, -31, 0.05, 5, {
      tint: [0.35, 0.4, 0.35],
    });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 1.2,
        CELLAR + 0.013 + k * 0.001,
        -12 - k * 3.2,
        1.2,
        1.6,
        r() * 3,
        K.decal(k % 2 ? "puddle" : "roach", k),
      );
    for (const z of [-14, -22, -29])
      K.lamp(b, 0, CELLAR + 2.25, z, "cage", [0.9, 0.7, 0.4], 0.55, 4.5, {
        ceil: CELLAR + 2.5,
        lightOpts: { box: TB },
      });
    b.hplate(
      "decal",
      0,
      CELLAR + 0.02,
      -26,
      1.8,
      2.4,
      0.3,
      K.decal("roach", 7),
    );
    // ladder to the backstage hatch
    for (let k = 0; k < 11; k++)
      b.beam(
        "black_iron",
        -0.45,
        CELLAR + 0.3 + k * 0.3,
        -30.85,
        0.45,
        CELLAR + 0.3 + k * 0.3,
        -30.85,
        0.03,
        0.03,
      );
    for (const s of [-1, 1])
      b.beam(
        "black_iron",
        s * 0.45,
        CELLAR,
        -30.85,
        s * 0.45,
        CELLAR + 2.5,
        -30.85,
        0.05,
        0.05,
      );
    b.plate(
      "art",
      0,
      CELLAR + 2.05,
      -30.88,
      0,
      1,
      0.8,
      0.26,
      K.signCell("vv_hatch", "STAGE ↑", 256, 80, {
        bg: "#2a2a1a",
        fg: "#e0d8a0",
      }),
    );

    // ---------------- backstage (x −2.5..2.5, z −32..−28) ----------------
    const BB = [-2.6, FY - 0.2, -32.1, 2.6, FY + 3.2, -27.9];
    K.gap(ctx, 1.8, -28, 0.9, STAGE_Y, 2.1);
    K.room(b, ctx, {
      x0: -2.5,
      z0: -32,
      x1: 2.5,
      z1: -28,
      y: STAGE_Y,
      h: 2.6,
      floor: "wood",
      fc: [0.45, 0.32, 0.24],
      wall: "brick_red",
      wc: [0.5, 0.36, 0.3],
      ceil: "plaster",
      cc: [0.35, 0.3, 0.28],
      surface: "wood",
    });
    b.col(-2.5, FY, -32, 2.5, STAGE_Y, -28, { tag: "floor", surface: "wood" });
    b.boxMM("metal", -2.3, STAGE_Y, -31.9, -0.9, STAGE_Y + 1.8, -31.3, {
      tint: [0.45, 0.5, 0.45],
    }); // robot charging dock
    b.glow(-1.6, STAGE_Y + 1.5, -31.25, [0.3, 1, 0.4], 0.4);
    b.col(-2.3, STAGE_Y, -31.9, -0.9, STAGE_Y + 1.8, -31.3, {});
    b.hplate("metal_dark", 0.8, STAGE_Y + 0.012, -30.8, 1.0, 1.0, 0, null, {
      tint: [0.4, 0.4, 0.4],
    }); // trapdoor
    for (let k = 0; k < 3; k++)
      b.box("leather", 2.0, STAGE_Y + k * 0.32, -31.2, 0.9, 0.3, 0.6, {
        tint: [0.3, 0.2, 0.14],
      });
    K.lamp(b, 0, STAGE_Y + 2.3, -30, "bulb", [1, 0.75, 0.5], 0.6, 4, {
      ceil: STAGE_Y + 2.6,
      lightOpts: { box: BB },
    });

    // ---------------- doors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_vanguard_in",
      pos: new THREE.Vector3(A[0] + 0.3, 1.3, DOOR_Z),
      label: "Village Vanguard",
      verb: "Enter",
      target: { x: OX - 6.9, y: OY, z: OZ - 1.0, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("village_vanguard")),
    });
    K.door(ctx, {
      id: "pv_vanguard_out",
      pos: new THREE.Vector3(OX - 6.9, OY + 1.3, OZ - 0.3),
      label: "Seventh Avenue South",
      verb: "Leave",
      target: { x: A[0] + 1.8, y: 0, z: DOOR_Z, yaw: -HP },
    });
    K.door(ctx, {
      id: "pv_vanguard_hatch_up",
      pos: new THREE.Vector3(OX, OY + CELLAR + 1.3, OZ - 30.6),
      label: "Ladder — Backstage",
      verb: "Climb",
      sound: "footstep_metal",
      target: { x: OX + 1.2, y: OY + STAGE_Y, z: OZ - 29.5, yaw: -2.8 },
    }); // up through the trapdoor, facing the curtain gap to the stage
    K.door(ctx, {
      id: "pv_vanguard_hatch_down",
      pos: new THREE.Vector3(OX + 0.8, OY + STAGE_Y + 0.3, OZ - 30.8),
      label: "Trapdoor — Service Tunnel",
      verb: "Climb down",
      sound: "footstep_metal",
      target: { x: OX, y: OY + CELLAR, z: OZ - 29.8, yaw: PI },
    }); // foot of the ladder, facing down the tunnel

    // ---------------- anchors ----------------
    K.anchor(ctx, "entrance", -6.9, 0, -1.0);
    K.anchor(ctx, "drums", -1.9, STAGE_Y, -25.6);
    K.anchor(ctx, "piano_bot", 2.4, STAGE_Y, -25.3);
    K.anchor(ctx, "bass_bot", 0.4, STAGE_Y, -26.3);
    K.anchor(ctx, "stage", 0, STAGE_Y, -26);
    K.anchor(ctx, "npc1", -5.2, FY, -14.5);
    K.anchor(ctx, "npc2", 3.6, FY, -16.5);
    K.anchor(ctx, "npc3", 4.6, FY, -12.6);
    K.anchor(ctx, "merchant", 4.2, FY, -10.6);
    K.anchor(ctx, "roach1", 0, CELLAR, -18);
    K.anchor(ctx, "roach2", 0.3, CELLAR, -24);
    K.anchor(ctx, "roach3", -0.3, CELLAR, -27.5);
    const sp = [
      [-5, FY, -13],
      [5, FY, -15],
      [0, FY, -20],
      [0, CELLAR, -20],
      [2, CELLAR, -7],
      [-2, FY, -7],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 8.8, FY, -3.4);
    K.anchor(ctx, "loot2", -5.2, CELLAR, -6.2);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_vanguard_int";
  }

