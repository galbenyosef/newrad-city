// play-inline-399 03 — tint
// Lines 84-1474 of readable/play-inline-399.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "ch_int",
      off: O,
      lit: true,
      amb: [0.07, 0.055, 0.045],
      floors: [0, CY],
      grime: 0.5,
    });
    const r = K.rng("ch_int");
    const warm = [1, 0.7, 0.4],
      fire = [1, 0.45, 0.15],
      wallC = [0.62, 0.48, 0.36],
      panel = [0.28, 0.17, 0.1],
      smoke = [0.32, 0.26, 0.2];

    // ---------------------------------------------------------------- gaps
    K.gap(ctx, 0, 0, 1.2, 0, 2.4); // courtyard door
    K.gap(ctx, 0, -3, 1.4, 0, 2.3, { casing: false }); // entry → barroom (curtain)
    K.gap(ctx, -3, -13, 1.6, 0, 2.4); // barroom → back room
    K.gap(ctx, 4.5, -13, 1.1, 0, 2.3); // barroom → kitchen
    K.gap(ctx, 7, -17, 1.1, 0, 2.3); // kitchen → 86 passage
    K.gap(ctx, -7, -15, 1.1, 0, 2.3, { casing: false }); // back room → Prohibition stair (behind the bookcase)
    K.gap(ctx, -7, -21.1, 1.4, CY, 2.3); // stair foot → cellar
    K.gap(ctx, 0, -22, 1.4, CY, 2.2); // cellar → bootleggers' tunnel

    // ================================================================ ENTRY
    K.room(b, ctx, {
      x0: -1.2,
      z0: -3,
      x1: 1.2,
      z1: 0,
      y: 0,
      h: 2.8,
      floor: "wood",
      fc: [0.5, 0.38, 0.28],
      wall: "brick_brown",
      wc: [0.5, 0.36, 0.3],
      ceil: "wood_dark",
      cc: panel,
      trim: false,
      surface: "wood",
    });
    for (const s of [-1, 1])
      b.quadN(
        "velvet",
        [s * 0.2, 0.05, -2.95],
        [s * 0.72, 0.05, -2.95],
        [s * 0.72, 2.35, -2.95],
        [s * 0.2, 2.35, -2.95],
        [0, 0, 1],
        { tint: [0.35, 0.08, 0.06] },
      );
    b.pipe("brass", -0.75, 2.38, -2.9, 0.75, 2.38, -2.9, 0.015, 4);
    b.plate(
      "art",
      1.18,
      1.6,
      -1.5,
      -1,
      0,
      0.5,
      0.36,
      K.signCell("ch_knock", "KNOCK\nTWICE", 96, 72, {
        bg: "#1a1410",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, 0, 2.5, -1.5, "bulb", warm, 0.5, 4, {
      ceil: 2.8,
      lightOpts: { box: [-1.3, -0.3, -3.1, 1.3, 2.9, 0.1] },
    });

    // ================================================================ BARROOM
    const BR = [-7.1, -0.3, -13.1, 7.1, H + 0.1, -2.9];
    K.room(b, ctx, {
      x0: -7,
      z0: -13,
      x1: 7,
      z1: -3,
      y: 0,
      h: H,
      floor: "wood",
      fc: [0.5, 0.38, 0.27],
      wall: "plaster_stained",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.2,
      ceil: "tin",
      cc: smoke,
      cornice: true,
      corniceMat: "wood_dark",
      surface: "wood",
    });
    // exposed ceiling beams
    for (let x = -5.5; x <= 5.5; x += 2.2)
      b.beam("wood_dark", x, H - 0.12, -12.9, x, H - 0.12, -3.1, 0.22, 0.24, {
        tint: panel,
      });
    // two brick fireplaces on the west wall (both lit — the settlement's heating)
    for (const z of [-5.6, -10.4]) {
      b.boxMM("brick_red", -7, 0, z - 1.1, -6.35, 1.6, z + 1.1, {
        tint: [0.52, 0.32, 0.26],
      });
      b.boxMM("paint_black", -6.36, 0.12, z - 0.55, -6.34, 1.05, z + 0.55, {
        tint: [0.02, 0.02, 0.02],
      });
      b.boxMM("wood_dark", -7, 1.6, z - 1.3, -6.2, 1.72, z + 1.3, {
        tint: panel,
      });
      b.boxMM("brick_red", -7, 1.72, z - 0.7, -6.6, H, z + 0.7, {
        tint: [0.5, 0.3, 0.24],
      });
      for (let k = 0; k < 3; k++)
        b.beam(
          "wood",
          -6.7,
          0.18,
          z - 0.4 + k * 0.4,
          -6.45,
          0.26,
          z - 0.3 + k * 0.35,
          0.1,
          0.1,
          { tint: [0.35, 0.22, 0.12] },
        );
      b.plate("lamp", -6.33, 0.4, z, 1, 0, 0.9, 0.45, null, { tint: fire });
      b.light(-5.6, 0.7, z, fire, 1.3, 6, { box: BR });
      b.glow(-6.2, 0.45, z, [1, 0.45, 0.12], 1.8);
      b.col(-7, 0, z - 1.3, -6.2, 1.72, z + 1.3, { tag: "fireplace" });
      for (let k = 0; k < 4; k++)
        b.cyl(
          "glass",
          -6.5,
          1.72,
          z - 0.9 + k * 0.6,
          0.04,
          0.04,
          0.2 + r() * 0.1,
          6,
          { tint: [0.3, 0.45, 0.25] },
        );
      b.cyl("flat", -6.5, 1.72, z + 1.05, 0.03, 0.03, 0.14, 6, {
        tint: [0.9, 0.86, 0.72],
      }); // a candle
      b.glow(-6.5, 1.92, z + 1.05, [1, 0.7, 0.35], 0.5);
    }
    // THE BAR along the east side
    const bx0 = 4.6,
      bx1 = 5.3,
      bz0 = -11.8,
      bz1 = -4.2;
    b.boxMM("mahogany", bx0, 0, bz0, bx1, 1.08, bz1, {
      tint: [0.38, 0.19, 0.11],
    });
    b.boxMM(
      "mahogany",
      bx0 - 0.12,
      1.08,
      bz0 - 0.05,
      bx1 + 0.05,
      1.14,
      bz1 + 0.05,
      { tint: [0.45, 0.23, 0.13] },
    );
    for (let z = bz0 + 0.5; z < bz1; z += 0.95)
      b.boxMM("mahogany", bx0 - 0.03, 0.15, z - 0.36, bx0, 0.95, z + 0.36, {
        tint: [0.32, 0.16, 0.09],
      });
    b.pipe("brass", bx0 - 0.28, 0.18, bz0, bx0 - 0.28, 0.18, bz1, 0.03, 6);
    b.col(bx0 - 0.12, 0, bz0 - 0.05, bx1 + 0.05, 1.14, bz1 + 0.05, {
      tag: "counter",
      surface: "wood",
    });
    b.boxMM("mahogany", 6.35, 0, bz0, 6.95, 0.95, bz1, {
      tint: [0.34, 0.17, 0.1],
    });
    b.boxMM("mahogany", 6.65, 0.95, bz0, 6.95, 2.8, bz1, {
      tint: [0.32, 0.16, 0.09],
    });
    b.boxMM("glass", 6.64, 1.3, bz0 + 0.8, 6.65, 2.3, bz1 - 0.8, {
      tint: [0.45, 0.48, 0.46],
    });
    for (const yy of [1.25, 2.35])
      b.boxMM("mahogany", 6.35, yy, bz0, 6.95, yy + 0.05, bz1, {
        tint: [0.4, 0.2, 0.12],
      });
    for (let z = bz0 + 0.2; z < bz1 - 0.2; z += 0.15) {
      if (r() < 0.3) continue;
      b.cyl("glass", 6.5, 2.4, z, 0.04, 0.04, 0.22 + r() * 0.12, 6, {
        tint: r.pick([
          [0.3, 0.45, 0.25],
          [0.55, 0.3, 0.12],
          [0.75, 0.7, 0.5],
          [0.2, 0.2, 0.3],
        ]),
      });
    }
    b.col(6.35, 0, bz0, 6.95, 2.8, bz1, {});
    for (let k = 0; k < 6; k++) {
      const z = -11 + k * 1.3;
      b.cyl("mahogany", bx0 - 0.6, 0, z, 0.04, 0.04, 0.72, 6);
      b.cyl("leather_red", bx0 - 0.6, 0.72, z, 0.2, 0.2, 0.08, 10);
    }
    for (let k = 0; k < 5; k++)
      b.cyl(
        "glass",
        bx0 + 0.1,
        1.14,
        -10.5 + k * 1.4 + r() * 0.3,
        0.035,
        0.03,
        0.12,
        6,
        { tint: [0.8, 0.75, 0.6] },
      );
    b.boxMM("brass", 5.0, 1.14, -6.1, 5.3, 1.44, -5.5, {
      tint: [0.7, 0.55, 0.3],
    }); // register
    b.plate(
      "art",
      6.93,
      3.0,
      -8,
      -1,
      0,
      3.2,
      0.36,
      K.signCell("ch_barsign", "NO SIGN · NO NAMES · NO TROUBLE", 640, 72, {
        bg: "#1a1410",
        fg: "#d8b060",
        font: "Georgia, serif",
      }),
    );
    // booths along the south wall + tables
    for (let k = 0; k < 3; k++) {
      const x = -5.6 + k * 1.9;
      K.sofa(b, x, 0, -3.6, 1.6, 0, {
        mat: "leather_red",
        d: 0.55,
        arms: false,
        backH: 0.7,
      });
      const t = K.table(b, x, 0, -4.6, 1.2, 0.7, {
        mat: "wood_dark",
        tint: panel,
      });
      b.cyl("glass", x + 0.2, t, -4.6, 0.04, 0.05, 0.16, 6, {
        tint: [0.35, 0.5, 0.3],
      });
      b.cyl("flat", x + 0.2, t + 0.16, -4.6, 0.012, 0.012, 0.08, 4, {
        tint: [0.9, 0.86, 0.72],
      });
      b.glow(x + 0.2, t + 0.26, -4.6, [1, 0.7, 0.35], 0.4);
      b.light(x + 0.2, t + 0.3, -4.6, warm, 0.25, 2.2, { box: BR });
      if (k < 2)
        b.boxMM("wood_dark", x + 0.9, 0, -4.2, x + 1.0, 1.5, -3.1, {
          tint: panel,
        });
    }
    for (const [tx, tz] of [
      [-1.4, -8.4],
      [1.6, -7.2],
      [-3.4, -11.3],
      [1.4, -11.2],
    ]) {
      const t = K.roundTable(b, tx, 0, tz, 0.5, {
        mat: "wood_dark",
        tint: panel,
      });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * PI * 2 + r();
        K.chair(
          b,
          tx + Math.cos(a) * 0.8,
          0,
          tz + Math.sin(a) * 0.8,
          -a - HP + PI,
          { mat: "wood_dark", tint: [0.35, 0.22, 0.14] },
        );
      }
      b.cyl("glass", tx, t, tz, 0.04, 0.05, 0.16, 6, {
        tint: [0.35, 0.5, 0.3],
      });
      b.glow(tx, t + 0.26, tz, [1, 0.7, 0.35], 0.4);
      b.light(tx, t + 0.3, tz, warm, 0.3, 2.5, { box: BR });
    }
    b.hplate(
      "decal",
      0,
      0.012,
      -8,
      3.4,
      2.2,
      0,
      K.paint("art", "ch_rug", 256, 160, function (x, X, Y, W, Hh) {
        x.fillStyle = "#5a1a14";
        x.fillRect(X, Y, W, Hh);
        x.strokeStyle = "#c8a050";
        x.lineWidth = 6;
        x.strokeRect(X + 10, Y + 10, W - 20, Hh - 20);
        x.fillStyle = "#2a3a4a";
        x.fillRect(X + 30, Y + 30, W - 60, Hh - 60);
        K.stains(x, X, Y, W, Hh, 12, 3, 0.5, [30, 20, 10]);
      }),
    );
    // the walls of book jackets
    jackets(b, -6.2, -1.0, 1.35, H - 0.2, -3.13, 0, -1, 1);
    jackets(b, 1.0, 4.2, 1.35, H - 0.2, -3.13, 0, -1, 2);
    jackets(b, -6.2, -4.1, 1.35, H - 0.2, -12.87, 0, 1, 3);
    jackets(b, -1.9, 3.8, 1.35, H - 0.2, -12.87, 0, 1, 4);
    jackets(b, -8.9, -7.2, 1.85, H - 0.2, -6.87, 1, 0, 5);
    b.plate(
      "art",
      -6.86,
      2.4,
      -8,
      1,
      0,
      1.3,
      0.34,
      K.signCell("ch_writers", "WRITTEN HERE", 320, 80, {
        bg: "#1a1410",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    // lighting: brass sconces with amber shades
    for (const [x, z, nx, nz] of [
      [-3, -3.1, 0, -1],
      [3, -3.1, 0, -1],
      [-1, -12.9, 0, 1],
      [2.6, -12.9, 0, 1],
    ]) {
      b.box("brass", x, 1.9, z + nz * 0.08, 0.1, 0.3, 0.1, {
        tint: [0.7, 0.55, 0.3],
      });
      b.cyl("glass", x, 2.1, z + nz * 0.2, 0.08, 0.12, 0.18, 8, {
        tint: [0.9, 0.6, 0.3],
      });
      b.light(x, 2.2, z + nz * 0.5, warm, 0.55, 4, { box: BR });
      b.glow(x, 2.15, z + nz * 0.22, [1, 0.62, 0.3], 0.8);
    }
    K.lamp(b, 5.8, 2.7, -8, "pendant", warm, 0.9, 5.5, {
      ceil: H,
      shade: "paint_green",
      lightOpts: { box: BR },
    });
    K.lamp(b, 0, 2.8, -7, "globe", warm, 0.6, 6, {
      ceil: H,
      size: 0.14,
      lightOpts: { box: BR },
    });
    b.light(0, 2.5, -8, warm, 0.22, 10, { box: BR }); // soft fill so the panelling and jackets read
    K.litter(b, -6, -12, 3.5, -5.5, 0, 8, 5121);
    b.hplate("decal", 3.2, 0.013, -9.6, 1, 1, 0.4, K.decal("puddle", 12));

    // ================================================================ BACK ROOM (poets' corner)
    const BK = [-7.1, -0.3, -21.1, 1.1, H + 0.1, -12.9];
    K.room(b, ctx, {
      x0: -7,
      z0: -21,
      x1: 1,
      z1: -13,
      y: 0,
      h: H,
      floor: "parquet",
      fc: [0.52, 0.4, 0.3],
      wall: "wallpaper",
      wc: [0.7, 0.6, 0.5],
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.0,
      ceil: "tin",
      cc: smoke,
      cornice: true,
      corniceMat: "wood_dark",
      surface: "wood",
    });
    // stage + upright piano + lectern
    b.boxMM("wood_dark", -6.9, 0, -20.9, -3.4, 0.3, -18.4, { tint: panel });
    b.col(-6.9, 0, -20.9, -3.4, 0.3, -18.4, { tag: "stage", surface: "wood" });
    b.boxMM("wood_dark", -6.8, 0.3, -20.85, -5.2, 1.6, -20.2, {
      tint: [0.16, 0.1, 0.07],
    });
    b.boxMM("wood_dark", -6.8, 0.95, -20.2, -5.2, 1.05, -19.9, {
      tint: [0.16, 0.1, 0.07],
    });
    for (let k = 0; k < 20; k++)
      b.box(
        k % 3 === 1 ? "paint_black" : "ceramic",
        -6.75 + k * 0.078,
        1.02,
        -20.05,
        0.06,
        0.03,
        0.22,
        { tint: k % 3 === 1 ? [0.05, 0.05, 0.05] : [0.85, 0.8, 0.68] },
      );
    b.col(-6.8, 0.3, -20.85, -5.2, 1.6, -19.9, { tag: "piano" });
    b.box("wood_dark", -4.1, 0.3, -19.3, 0.5, 1.2, 0.4, { tint: panel });
    b.box("wood_dark", -4.1, 1.5, -19.25, 0.6, 0.05, 0.5, {
      yaw: 0,
      tint: panel,
    });
    b.plate(
      "art",
      -5.2,
      2.5,
      -20.88,
      0,
      1,
      2.6,
      0.5,
      K.signCell("ch_poets", "POETS' CORNER — HECKLING IS A CRAFT", 640, 96, {
        bg: "#2a1a24",
        fg: "#e0c890",
        font: "Georgia, serif",
      }),
    );
    K.lamp(b, -5, 2.8, -19.4, "globe", [1, 0.6, 0.35], 0.9, 5, {
      ceil: H,
      size: 0.12,
      lightOpts: { box: BK },
    });
    // round tables & the long communal table
    const lt = K.table(b, -2.2, 0, -16.4, 1.1, 3.2, {
      mat: "oak",
      tint: [0.5, 0.36, 0.24],
    });
    for (const s of [-1, 1])
      for (const dz of [-1.0, 0, 1.0])
        K.chair(b, -2.2 + s * 0.8, 0, -16.4 + dz, s > 0 ? HP : -HP, {
          mat: "oak",
          tint: [0.46, 0.33, 0.22],
        });
    for (let k = 0; k < 5; k++)
      b.box("flat", -2.4 + r() * 0.4, lt, -17.6 + k * 0.6, 0.22, 0.02, 0.3, {
        yaw: r(),
        tint: [0.85, 0.82, 0.72],
      }); // manuscripts
    b.cyl("glass", -2.1, lt, -15.2, 0.04, 0.05, 0.16, 6, {
      tint: [0.35, 0.5, 0.3],
    });
    b.glow(-2.1, lt + 0.26, -15.2, [1, 0.7, 0.35], 0.4);
    K.lamp(b, -2.2, 2.7, -16.4, "pendant", warm, 0.9, 5.5, {
      ceil: H,
      lightOpts: { box: BK },
    });
    // the bookcase that swings: open on its hinge, revealing the Prohibition stair
    b.boxMM("wood_dark", -6.95, 0, -16.5, -6.55, 2.4, -15.85, { tint: panel });
    K.shelf(b, -6.2, 0, -14.6, 0.9, 1.1, {
      h: 2.4,
      d: 0.35,
      mat: "wood_dark",
      tint: panel,
      items: ["book"],
      seed: 61,
      col: true,
    });
    K.shelf(b, -6.75, 0, -18.0, -HP, 1.6, {
      h: 2.4,
      d: 0.35,
      mat: "wood_dark",
      tint: panel,
      items: ["book"],
      seed: 62,
    });
    jackets(b, -2.4, 0.8, 1.2, H - 0.2, -20.87, 0, 1, 6);
    jackets(b, -20.6, -13.4, 1.2, H - 0.2, 0.87, -1, 0, 7);

    // ================================================================ PROHIBITION STAIR (hidden) → cellar
    const PS = [-9.6, CY - 0.3, -22.1, -6.9, H + 0.1, -13.9];
    K.room(b, ctx, {
      x0: -9.5,
      z0: -22,
      x1: -7,
      z1: -14,
      y: CY,
      h: H - CY,
      floor: "concrete",
      wall: "brick_brown",
      wc: [0.42, 0.3, 0.24],
      ceil: "wood_dark",
      cc: panel,
      trim: false,
      casing: false,
    });
    b.boxMM("concrete", -9.5, CY, -16, -7, 0, -14, {
      tint: [0.5, 0.46, 0.42],
      faces: "nsewt",
    });
    b.col(-9.5, CY, -16, -7, 0, -14, { tag: "landing" });
    K.stairs(b, -9.4, -20.2, -7.1, -16, CY, 0, "+z", {
      mat: "wood",
      tint: [0.45, 0.34, 0.24],
      rail: "l",
      surface: "wood",
    });
    b.plate(
      "decal",
      -9.48,
      CY + 1.6,
      -18,
      1,
      0,
      1.8,
      0.7,
      K.tag("1928 — RAID!", "#e0d8c0", 256, 96),
    );
    K.lamp(b, -8.2, 1.9, -15, "bulb", warm, 0.5, 4, {
      ceil: H,
      lightOpts: { box: PS },
    });
    K.lamp(b, -8.2, CY + 2.5, -21, "bulb", warm, 0.5, 4, {
      ceil: CY + 3,
      lightOpts: { box: PS },
    });

    // ================================================================ KITCHEN + 86 PASSAGE
    const KB = [0.9, -0.3, -21.1, 7.1, H + 0.1, -12.9];
    K.room(b, ctx, {
      x0: 1,
      z0: -21,
      x1: 7,
      z1: -13,
      y: 0,
      h: H,
      floor: "hextile",
      fc: [0.62, 0.58, 0.52],
      wall: "tile",
      wc: [0.72, 0.7, 0.62],
      ceil: "plaster",
      cc: [0.42, 0.38, 0.32],
    });
    b.boxMM("cast_iron", 1.2, 0, -20.8, 3.2, 0.92, -19.9, {
      tint: [0.2, 0.19, 0.18],
    });
    b.col(1.2, 0, -20.8, 3.2, 0.92, -19.9, {});
    b.plate("lamp", 2.2, 0.4, -19.88, 0, 1, 0.4, 0.2, null, { tint: fire });
    b.light(2.2, 0.8, -19.4, fire, 0.7, 4, { box: KB });
    for (let k = 0; k < 3; k++)
      b.cyl("steel", 1.6 + k * 0.7, 0.92, -20.35, 0.2, 0.18, 0.25, 10, {
        tint: [0.55, 0.55, 0.52],
      });
    // B2 (2026-09-28): the counter used to run unbroken across the 86-passage doorway (z −17.55..−16.45) and sealed the
    // passage off from the kitchen — split it so the door-86 route walks straight through
    for (const [za, zb] of [
      [-20.8, -17.75],
      [-16.25, -14],
    ]) {
      b.boxMM("steel", 6.2, 0, za, 6.9, 0.92, zb, { tint: [0.6, 0.6, 0.58] });
      b.col(6.2, 0, za, 6.9, 0.92, zb, {});
    }
    for (let k = 0; k < 8; k++)
      b.cyl(
        "ceramic",
        6.55,
        0.92 + Math.floor(k / 4) * 0.02,
        -20.3 + (k % 4) * 0.5,
        0.13,
        0.11,
        0.02,
        10,
      );
    const kt = K.table(b, 3.8, 0, -16.8, 1.1, 1.8, {
      mat: "wood",
      tint: [0.62, 0.52, 0.4],
    });
    for (let k = 0; k < 6; k++)
      b.geo("flat", K.sphereGeo(), {
        x: 3.6 + r() * 0.4,
        y: kt + 0.05,
        z: -17.4 + r() * 1.2,
        s: 0.06,
        tint: r.pick([
          [0.8, 0.4, 0.2],
          [0.55, 0.6, 0.3],
          [0.85, 0.75, 0.55],
        ]),
      }); // gnarlberries & potatoes
    K.lamp(b, 3.8, 2.6, -16.8, "bulb", warm, 0.9, 6, {
      ceil: H,
      lightOpts: { box: KB },
    });
    b.plate(
      "art",
      1.12,
      1.9,
      -16,
      1,
      0,
      1.2,
      0.8,
      K.signCell(
        "ch_menu",
        "TONIGHT\nPigeon stew · 6 scrip\nPotato hash · 3 scrip\nGin (bathtub) · 3 scrip",
        256,
        170,
        { bg: "#1a1a1a", fg: "#e8dcb8", font: "Georgia, serif" },
      ),
    );
    K.loot(ctx, "fridge", 1.5, 0, -14, PI, {
      loot: "fridge",
      owner: "settlers",
      name: "Icebox",
    });
    const PB = [6.9, -0.3, -18.1, 10.1, 2.9, -15.9];
    K.room(b, ctx, {
      x0: 7,
      z0: -18,
      x1: 10,
      z1: -16,
      y: 0,
      h: 2.7,
      floor: "concrete",
      wall: "brick_brown",
      wc: [0.45, 0.32, 0.26],
      ceil: "wood_dark",
      cc: panel,
      trim: false,
    });
    b.boxMM("wood_dark", 9.93, 0, -17.55, 10, 2.25, -16.45, {
      tint: [0.22, 0.2, 0.18],
    });
    b.plate(
      "art",
      9.885,
      1.75,
      -17,
      -1,
      0,
      0.3,
      0.22,
      K.signCell("ch_86_in", "86", 96, 72, {
        bg: "#1a1410",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "decal",
      8.5,
      1.6,
      -17.9,
      0,
      1,
      2.0,
      0.8,
      K.tag("OUT THIS WAY, PAL", "#e0d8c0", 320, 110),
    );
    K.lamp(b, 8.5, 2.3, -17, "bulb", warm, 0.5, 3.5, {
      ceil: 2.7,
      lightOpts: { box: PB },
    });

    // ================================================================ CELLAR (the settlement)
    const CL = [-7.1, CY - 0.3, -22.1, 7.1, CY + 3.1, -2.9];
    K.room(b, ctx, {
      x0: -7,
      z0: -22,
      x1: 7,
      z1: -3,
      y: CY,
      h: 3.0,
      floor: "concrete",
      fc: [0.5, 0.47, 0.42],
      wall: "brick_brown",
      wc: [0.5, 0.38, 0.3],
      ceil: "wood_dark",
      cc: [0.26, 0.2, 0.15],
      trim: false,
    });
    for (let x = -5.5; x <= 5.5; x += 2.2)
      b.beam("wood_dark", x, CY + 2.85, -21.9, x, CY + 2.85, -3.1, 0.24, 0.24, {
        tint: panel,
      });
    for (const x of [-3.3, 1.1])
      for (const z of [-8, -15]) {
        b.box("wood_dark", x, CY, z, 0.24, 3.0, 0.24, { tint: panel });
        b.col(x - 0.12, CY, z - 0.12, x + 0.12, CY + 3, z + 0.12, {
          tag: "post",
          walkable: false,
        });
      }
    // bunks along the east wall, footlockers, curtains between them
    for (let k = 0; k < 4; k++) {
      const z = -20.5 + k * 2.4;
      for (const y of [CY, CY + 1.1])
        K.bed(b, 5.9, y, z, HP, {
          w: 0.85,
          l: 1.9,
          tint: r.pick([
            [0.55, 0.5, 0.42],
            [0.45, 0.42, 0.5],
            [0.5, 0.35, 0.3],
          ]),
          col: y === CY,
        });
      for (const [px, pz] of [
        [5.0, z - 0.4],
        [5.0, z + 0.4],
        [6.9, z - 0.4],
        [6.9, z + 0.4],
      ])
        b.pipe("black_iron", px, CY, pz, px, CY + 2.0, pz, 0.025, 4);
      if (k < 3)
        b.quadN(
          "fabric",
          [4.9, CY + 0.1, z + 1.2],
          [7, CY + 0.1, z + 1.2],
          [7, CY + 2.3, z + 1.2],
          [4.9, CY + 2.3, z + 1.2],
          [0, 0, 1],
          {
            tint: r.pick([
              [0.6, 0.5, 0.4],
              [0.4, 0.45, 0.55],
              [0.55, 0.3, 0.25],
            ]),
          },
        );
    }
    K.loot(ctx, "footlocker", 4.4, CY, -20.5, -HP, {
      loot: "footlocker",
      owner: "settlers",
      name: "Settler Footlocker",
    });
    K.loot(ctx, "footlocker", 4.4, CY, -13.3, -HP, {
      loot: "footlocker",
      owner: "settlers",
      name: "Settler Footlocker",
    });
    // the still, casks and bathtub gin
    b.cyl("copper", -5.6, CY, -19.8, 0.7, 0.6, 1.3, 12, {
      tint: [0.75, 0.48, 0.28],
    });
    b.geo("copper", K.sphereGeo(), {
      x: -5.6,
      y: CY + 1.3,
      z: -19.8,
      sx: 0.6,
      sy: 0.35,
      sz: 0.6,
      tint: [0.75, 0.48, 0.28],
    });
    b.pipe("copper", -5.6, CY + 1.6, -19.8, -4.4, CY + 1.2, -19.2, 0.05, 6, {
      tint: [0.75, 0.48, 0.28],
    });
    b.geo("copper", new THREE.TorusGeometry(0.25, 0.04, 5, 10), {
      x: -4.3,
      y: CY + 0.9,
      z: -19.2,
      rx: HP,
      tint: [0.75, 0.48, 0.28],
    });
    b.col(-6.3, CY, -20.5, -4.9, CY + 1.6, -19.1, {});
    b.boxMM("ceramic", -6.8, CY, -17.8, -5.2, CY + 0.6, -16.9, {
      tint: [0.62, 0.6, 0.54],
    });
    b.boxMM("flat", -6.7, CY + 0.45, -17.7, -5.3, CY + 0.55, -17.0, {
      tint: [0.6, 0.7, 0.72],
    }); // the bathtub
    b.col(-6.8, CY, -17.8, -5.2, CY + 0.6, -16.9, {});
    for (let k = 0; k < 6; k++) {
      const z = -14.8 + (k % 3) * 1.0,
        y = CY + Math.floor(k / 3) * 0.9;
      b.geo("wood", new THREE.CylinderGeometry(0.42, 0.42, 0.9, 12), {
        x: -6.3,
        y: y + 0.45,
        z,
        rz: HP,
        tint: [0.5, 0.36, 0.24],
      });
      for (const s of [-0.3, 0.3])
        b.geo("rust", new THREE.TorusGeometry(0.43, 0.02, 4, 12), {
          x: -6.3 + s,
          y: y + 0.45,
          z,
          ry: HP,
        });
    }
    b.col(-6.8, CY, -15.3, -5.8, CY + 1.8, -12.3, { tag: "casks" });
    // clinic corner: cot, cabinet, a hanging IV bottle
    K.bed(b, -5.8, CY, -6.2, -HP, { w: 0.85, l: 1.9, tint: [0.75, 0.74, 0.7] });
    b.pipe("steel", -6.7, CY, -5.2, -6.7, CY + 1.9, -5.2, 0.02, 4);
    b.cyl("glass", -6.7, CY + 1.6, -5.2, 0.07, 0.07, 0.2, 6, {
      tint: [0.8, 0.3, 0.25],
    });
    b.plate(
      "art",
      -6.88,
      CY + 1.8,
      -7.8,
      1,
      0,
      0.6,
      0.6,
      K.signCell("ch_clinic", "+", 96, 96, {
        bg: "#e8e0d0",
        fg: "#b01810",
        font: "Arial Black, sans-serif",
      }),
    );
    K.loot(ctx, "first_aid", -6.9, CY + 1.2, -4.2, HP, {
      loot: "first_aid",
      owner: "settlers",
      name: "First Aid Box",
    });
    // Fran's trade table (only dressed; she arrives after Contempt of Court)
    const dtT = K.table(b, 2.4, CY, -5.2, 2.0, 0.8, {
      mat: "wood_rotten",
      tint: [0.55, 0.45, 0.35],
    });
    for (let k = 0; k < 7; k++)
      b.box(
        r() < 0.5 ? "rust" : "metal",
        1.7 + k * 0.22,
        dtT,
        -5.2 + (r() - 0.5) * 0.4,
        0.14,
        0.08 + r() * 0.12,
        0.14,
        {
          yaw: r(),
          tint: r.pick([
            [0.6, 0.5, 0.4],
            [0.5, 0.55, 0.6],
            [0.7, 0.6, 0.35],
          ]),
        },
      );
    b.plate(
      "art",
      2.4,
      CY + 1.9,
      -3.12,
      0,
      -1,
      1.4,
      0.45,
      K.signCell("ch_dot", "FRAN'S · BUY / SELL / NO QUESTIONS", 384, 96, {
        bg: "#e0d0a8",
        fg: "#2a1a10",
        font: "Georgia, serif",
      }),
    );
    // the generator waiting for power (Tower of Light, grid mode)
    b.boxMM("metal_dark", 4.2, CY, -10.4, 6.2, CY + 1.3, -9.2, {
      tint: [0.3, 0.34, 0.3],
    });
    b.col(4.2, CY, -10.4, 6.2, CY + 1.3, -9.2, {
      tag: "machine",
      surface: "metal",
    });
    b.cyl("metal", 5.2, CY + 1.3, -9.8, 0.3, 0.3, 0.3, 10, {
      tint: [0.5, 0.4, 0.2],
    });
    b.pipe("rubber", 6.2, CY + 0.6, -9.8, 6.9, CY + 2.8, -9.8, 0.03, 5);
    b.plate(
      "art",
      5.2,
      CY + 0.8,
      -9.18,
      0,
      1,
      1.2,
      0.4,
      K.signCell("ch_gen", "FIVE BOROUGHS FEED — DEAD SINCE '67", 320, 96, {
        bg: "#d8c060",
        fg: "#1a1a1a",
        font: "Arial, sans-serif",
      }),
    );
    // communal table under the stairs, radio, lanterns
    const ct = K.table(b, -1.2, CY, -11.5, 1.2, 2.6, {
      mat: "wood",
      tint: [0.55, 0.44, 0.32],
    });
    for (const s of [-1, 1])
      for (const dz of [-0.8, 0.8])
        K.chair(b, -1.2 + s * 0.85, CY, -11.5 + dz, s > 0 ? HP : -HP, {
          mat: "wood",
        });
    K.loot(ctx, "radio", -1.3, ct, -12.3, 0, { container: false });
    for (const [x, z] of [
      [-1.2, -11.5],
      [2.4, -16],
      [-3.5, -5],
      [4.2, -18],
    ]) {
      K.lamp(b, x, CY + 2.35, z, "cage", warm, 0.75, 5.5, {
        ceil: CY + 2.85,
        lightOpts: { box: CL },
      });
    }
    // ---- the settlement's life: warm light, a fire barrel, a grow bed, bulbs strung along the beams, rugs, laundry
    b.light(0, CY + 2.6, -12.5, warm, 0.6, 14, { box: CL }); // general warm fill
    b.light(-5.5, CY + 2.2, -12, warm, 0.45, 7, { box: CL });
    b.light(5.0, CY + 2.2, -15, warm, 0.4, 6.5, { box: CL });
    b.light(0, CY + 2.0, -5, warm, 0.4, 6, { box: CL });
    b.cyl("rust", -2.3, CY, -19.2, 0.34, 0.34, 0.95, 10, {
      tint: [0.45, 0.3, 0.2],
    }); // fire barrel
    for (let k = 0; k < 5; k++)
      b.beam(
        "wood",
        -2.45 + k * 0.08,
        CY + 0.9,
        -19.35 + (k % 2) * 0.2,
        -2.15 - k * 0.05,
        CY + 1.05,
        -19.05 - (k % 2) * 0.15,
        0.07,
        0.07,
        { tint: [0.3, 0.2, 0.12] },
      );
    b.geo("lamp", new THREE.ConeGeometry(0.22, 0.45, 7), {
      x: -2.3,
      y: CY + 1.15,
      z: -19.2,
      tint: [1, 0.55, 0.18],
    });
    b.glow(-2.3, CY + 1.2, -19.2, [1, 0.5, 0.15], 2.4);
    b.light(-2.3, CY + 1.4, -19.2, fire, 1.2, 6.5, { box: CL });
    b.col(-2.65, CY, -19.55, -1.95, CY + 0.95, -18.85, { tag: "barrel" });
    for (const [x, z, a] of [
      [-3.2, -18.4, 0.6],
      [-1.4, -18.3, -0.5],
    ])
      b.box("wood", x, CY, z, 0.5, 0.42, 0.5, {
        yaw: a,
        tint: [0.45, 0.34, 0.24],
      }); // crate seats
    // grow bed: potatoes and gnarlberries under a jury-rigged violet grow lamp
    b.boxMM("wood", 1.5, CY, -19.4, 3.9, CY + 0.45, -18.2, {
      tint: [0.45, 0.34, 0.24],
    });
    b.col(1.5, CY, -19.4, 3.9, CY + 0.45, -18.2, {
      tag: "planter",
      surface: "wood",
    });
    b.face("dirt", 1.55, CY + 0.44, -18.25, 1, 0, 0, 0, 0, -1, 2.3, 1.1, {
      uv: "top",
      tint: [0.4, 0.32, 0.24],
    });
    for (let k = 0; k < 8; k++) {
      const x = 1.75 + (k % 4) * 0.6,
        z = -19.1 + Math.floor(k / 4) * 0.55;
      b.cyl("flat", x, CY + 0.45, z, 0.02, 0.015, 0.35, 4, {
        tint: [0.3, 0.45, 0.2],
      });
      for (let j = 0; j < 3; j++)
        b.geo("flat", K.sphereGeo(), {
          x: x + (j - 1) * 0.07,
          y: CY + 0.8 + (j % 2) * 0.05,
          z,
          sx: 0.12,
          sy: 0.05,
          sz: 0.07,
          ry: j * 1.1,
          tint: [0.28, 0.5, 0.22],
        });
      if (k % 3 === 0)
        b.geo("flat", K.sphereGeo(), {
          x: x + 0.05,
          y: CY + 0.62,
          z: z + 0.05,
          s: 0.05,
          tint: [0.8, 0.45, 0.2],
        });
    }
    for (const x of [1.7, 3.7])
      b.pipe("black_iron", x, CY + 0.45, -18.8, x, CY + 1.9, -18.8, 0.015, 4);
    b.beam(
      "black_iron",
      1.7,
      CY + 1.9,
      -18.8,
      3.7,
      CY + 1.9,
      -18.8,
      0.04,
      0.04,
    );
    b.plate("lamp", 2.7, CY + 1.86, -18.8, 0, 0, 1.8, 0.14, null, {
      tint: [0.8, 0.45, 1.0],
    });
    b.boxMM("lamp", 1.8, CY + 1.82, -18.86, 3.6, CY + 1.86, -18.74, {
      tint: [0.75, 0.42, 0.95],
    });
    b.glow(2.7, CY + 1.75, -18.8, [0.7, 0.35, 0.95], 1.6);
    b.light(2.7, CY + 1.5, -18.8, [0.7, 0.4, 0.95], 0.8, 3.5, { box: CL });
    // bare bulbs strung along two beams (a settler rigged them off the still's old dynamo)
    for (const x of [-1.1, 3.3])
      for (let z = -20; z <= -5; z += 2.5) {
        b.pipe("black_iron", x, CY + 2.72, z, x, CY + 2.45, z, 0.006, 3);
        b.geo("lamp", K.sphereGeo(), {
          x,
          y: CY + 2.4,
          z,
          s: 0.05,
          tint: [1, 0.8, 0.5],
        });
        b.glow(x, CY + 2.4, z, [1, 0.72, 0.4], 0.7);
        if (Math.round(z) % 5 === 0)
          b.light(x, CY + 2.2, z, warm, 0.55, 5, { box: CL });
      }
    for (const x of [-1.1, 3.3])
      b.pipe("black_iron", x, CY + 2.73, -20, x, CY + 2.73, -5, 0.008, 3);
    // rag rugs on the concrete, a laundry line between the posts
    const rugs = ["#5a3a24", "#2a3a4a", "#4a2a2a"];
    [
      [-1.2, -11.5, 2.4, 3.6, 0],
      [2.4, -6.6, 2.6, 1.6, 0.05],
      [-4.6, -6.2, 1.8, 2.4, 0.1],
    ].forEach(([x, z, w, d, a], i) =>
      b.hplate(
        "decal",
        x,
        CY + 0.012 + i * 0.001,
        z,
        w,
        d,
        a,
        K.paint("art", "ch_ragrug" + i, 128, 128, function (c, X, Y, W, H) {
          const rr = K.rng("rug" + i);
          for (let j = 0; j < H; j += 6) {
            c.fillStyle = rugs[(j / 6 + i) % 3];
            c.fillRect(X, Y + j, W, 6);
            c.fillStyle = "rgba(200,180,140," + rr() * 0.3 + ")";
            c.fillRect(X, Y + j + 2, W, 1);
          }
          K.stains(c, X, Y, W, H, 8, 30 + i, 0.5, [20, 15, 10]);
        }),
      ),
    );
    b.pipe("black_iron", -3.3, CY + 2.1, -8, 1.1, CY + 2.1, -8, 0.006, 3);
    for (let k = 0; k < 5; k++) {
      const x = -2.9 + k * 0.85;
      b.quadN(
        "fabric",
        [x - 0.22, CY + 2.08, -8],
        [x + 0.22, CY + 2.08, -8],
        [x + 0.2 + (k % 2) * 0.04, CY + 1.55 - (k % 2) * 0.15, -8],
        [x - 0.2, CY + 1.55 - (k % 2) * 0.15, -8],
        [0, 0, 1],
        {
          tint: [
            [0.5, 0.47, 0.4],
            [0.42, 0.22, 0.18],
            [0.3, 0.34, 0.42],
          ][k % 3],
        },
      );
    }
    // settlement rules chalkboard + dartboard on the south wall
    b.plate(
      "art",
      -1.4,
      CY + 1.65,
      -3.12,
      0,
      -1,
      1.5,
      1.0,
      K.paint("art", "ch_rules", 240, 160, function (c, X, Y, W, H) {
        c.fillStyle = "#1e2a22";
        c.fillRect(X, Y, W, H);
        c.strokeStyle = "#6a4a2a";
        c.lineWidth = 8;
        c.strokeRect(X + 4, Y + 4, W - 8, H - 8);
        c.fillStyle = "#d8d8c8";
        c.font = 'bold 18px "Special Elite", Georgia, serif';
        c.textAlign = "left";
        [
          "HOUSE RULES",
          "1. No names.",
          "2. No guns at the bar.",
          "3. Poets drink half price.",
          "4. Nobody touches Lee's piano.",
          "5. 86 means GO.",
        ].forEach((t, i) => c.fillText(t, X + 16, Y + 28 + i * 23));
      }),
      { tint: [1, 1, 1] },
    );
    b.geo("wood_dark", new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), {
      x: -4.4,
      y: CY + 1.7,
      z: -3.12,
      rx: HP,
      tint: [0.25, 0.2, 0.16],
    });
    {
      const dart = K.paint("art", "ch_dart", 64, 64, function (c, X, Y, W, H) {
        for (let k = 0; k < 20; k++) {
          c.fillStyle = k % 2 ? "#1a1a14" : "#d8ceb0";
          c.beginPath();
          c.moveTo(X + W / 2, Y + H / 2);
          c.arc(
            X + W / 2,
            Y + H / 2,
            W / 2,
            (k / 20) * PI * 2,
            ((k + 1) / 20) * PI * 2,
          );
          c.fill();
        }
        c.strokeStyle = "#a02018";
        c.lineWidth = 4;
        for (const rr of [W * 0.46, W * 0.28]) {
          c.beginPath();
          c.arc(X + W / 2, Y + H / 2, rr, 0, PI * 2);
          c.stroke();
        }
        c.fillStyle = "#a02018";
        c.beginPath();
        c.arc(X + W / 2, Y + H / 2, 3, 0, PI * 2);
        c.fill();
      });
      b.geo(K.atlasMat("art", dart), new THREE.CircleGeometry(0.26, 16), {
        x: -4.4,
        y: CY + 1.7,
        z: -3.15,
        ry: PI,
        uv: "rect",
        rect: dart,
      });
    }
    for (let k = 0; k < 3; k++)
      b.pipe(
        "steel",
        -4.35 + k * 0.06,
        CY + 1.66 + k * 0.05,
        -3.16,
        -4.35 + k * 0.06,
        CY + 1.66 + k * 0.05,
        -3.3,
        0.006,
        3,
      );
    // stacked supply crates by the tunnel mouth
    for (const [x, z, n] of [
      [-2.8, -21.3, 3],
      [2.8, -21.3, 2],
    ])
      for (let k = 0; k < n; k++)
        b.box(
          "wood",
          x + (k === 2 ? 0.2 : 0),
          CY + (k === 2 ? 0.6 : 0),
          z + (k === 1 ? 0 : 0),
          k === 1 ? 0.7 : 0.8,
          0.6,
          0.6,
          { yaw: k * 0.2, tint: [0.5, 0.4, 0.28] },
        );
    b.col(-3.3, CY, -21.7, -2.2, CY + 1.2, -20.9, { tag: "crate" });
    b.col(2.3, CY, -21.7, 3.3, CY + 0.6, -20.9, { tag: "crate" });
    K.anchor(ctx, "grate_key", 2.8, CY + 0.62, -21.3); // the grate key lies on the low crate stack (spawned in 80_content)
    b.plate(
      "decal",
      0,
      CY + 1.5,
      -21.88,
      0,
      1,
      3.2,
      1.0,
      K.tag("PROHIBITION ENDED. WE DIDN'T.", "#d8d0c0", 420, 110),
    );
    K.litter(b, -6, -21, 3, -4, CY, 10, 5301);

    // ================================================================ BOOTLEGGERS' TUNNEL + CACHE
    const TN = [-1.3, CY - 0.3, -36.1, 2.2, CY + 2.5, -21.9];
    K.room(b, ctx, {
      x0: -1.1,
      z0: -32,
      x1: 1.1,
      z1: -22,
      y: CY,
      h: 2.3,
      floor: "dirt",
      fc: [0.45, 0.4, 0.32],
      wall: "brick_brown",
      wc: [0.4, 0.3, 0.24],
      ceil: "wood_rotten",
      cc: [0.3, 0.25, 0.2],
      trim: false,
      surface: "dirt",
    });
    for (let z = -23; z > -32; z -= 1.6) {
      for (const s of [-1, 1])
        b.box("wood_rotten", s * 0.95, CY, z, 0.16, 2.3, 0.16, {
          tint: [0.38, 0.3, 0.22],
        });
      b.beam("wood_rotten", -1, CY + 2.2, z, 1, CY + 2.2, z, 0.16, 0.16, {
        tint: [0.38, 0.3, 0.22],
      });
    }
    for (let k = 0; k < 6; k++)
      b.pipe(
        "rust",
        -0.8,
        CY + 0.05,
        -22.5 - k * 1.6,
        0.8,
        CY + 0.05,
        -22.5 - k * 1.6,
        0.03,
        4,
      ); // old cart rail ties
    for (const s of [-0.4, 0.4])
      b.beam("rust", s, CY + 0.08, -22, s, CY + 0.08, -30.5, 0.05, 0.04);
    K.rubble(b, 0.3, CY, -30.9, 1.1, 1.3, { seed: 91, col: true });
    b.boxMM("black_iron", -1.05, CY, -31.9, 1.05, CY + 2.2, -31.8, {
      tint: [0.2, 0.18, 0.16],
      faces: "s",
    });
    for (let x = -0.9; x <= 0.9; x += 0.15)
      b.cyl("rust", x, CY, -31.75, 0.02, 0.02, 2.2, 4);
    b.col(-1.1, CY, -31.95, 1.1, CY + 2.3, -31.7, {
      tag: "grate",
      walkable: false,
      surface: "metal",
    });
    K.lamp(b, 0, CY + 1.9, -25, "bulb", warm, 0.45, 4, {
      ceil: CY + 2.3,
      lightOpts: { box: TN },
    });
    K.lamp(b, 0, CY + 1.9, -29.5, "bulb", warm, 0, 3, {
      ceil: CY + 2.3,
      dead: true,
    });
    // the cache beyond the grate
    const CC = [-2.1, CY - 0.3, -36.1, 2.1, CY + 2.5, -31.9];
    K.room(b, ctx, {
      x0: -2,
      z0: -36,
      x1: 2,
      z1: -32,
      y: CY,
      h: 2.3,
      floor: "dirt",
      wall: "brick_brown",
      wc: [0.4, 0.3, 0.24],
      ceil: "wood_rotten",
      cc: [0.3, 0.25, 0.2],
      trim: false,
      surface: "dirt",
    });
    for (let k = 0; k < 5; k++)
      b.box(
        "wood",
        -1.5 + (k % 3) * 0.7,
        CY + Math.floor(k / 3) * 0.5,
        -35.4,
        0.6,
        0.5,
        0.5,
        { yaw: r() * 0.2, tint: [0.5, 0.4, 0.28] },
      );
    b.col(-1.9, CY, -35.9, 0.4, CY + 1.0, -35.1, {});
    K.skel(ctx, 1.2, CY, -34, 2.4, "lying");
    K.loot(ctx, "crate", 1.3, CY, -35.3, 0.2, {
      kind: "plain",
      items: [
        ["whiskey", 3],
        ["scotch", 2],
        ["pv3_bootleg_ledger", 1],
        ["scrip", 60],
      ],
      name: "Bootlegger's Cache",
    });
    K.lamp(b, 0, CY + 1.9, -34, "bulb", [0.6, 0.62, 0.55], 0.25, 3.5, {
      ceil: CY + 2.3,
      lightOpts: { box: CC },
    });

    // ================================================================ doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const D = PV.CH_DOOR,
      D86 = PV.CH_86;
    // no EXIT signs in a speakeasy: the brown door with a lit crack under it and a brass plate
    K.exitDoor(b, 0, 0, 0, 0, -1, 1.2, 2.4, {
      leaves: 1,
      sign: false,
      tint: [0.34, 0.22, 0.14],
      day: [0.85, 0.78, 0.6],
      lightI: 0.35,
      lightR: 3,
      lightBox: [-1.3, -0.3, -3.1, 1.3, 2.9, 0.1],
    });
    K.letters(b, 0, 2.58, -0.03, 0, -1, 1.1, 0.2, "PAMELA COURT", {
      fg: "#c8a860",
      font: "Georgia, serif",
      off: 0.005,
    });
    K.exitDoor(b, 10, 0, -17, -1, 0, 1.0, 2.2, {
      leaves: 1,
      sign: false,
      tint: [0.22, 0.2, 0.18],
      day: [0.8, 0.78, 0.7],
      lightI: 0.3,
      lightR: 3,
      lightBox: [6.9, -0.3, -18.1, 10.1, 2.8, -15.9],
    });
    K.door(ctx, {
      id: "pv3_ch_in",
      pos: new THREE.Vector3(D.x, 1.3, D.z + 0.35),
      label: "Unmarked Door",
      verb: "Knock",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => {
        K.safe("disc", () => G.discover("bedfords"));
        PV.onEnter && PV.onEnter("bedfords");
      },
    });
    K.door(ctx, {
      id: "pv3_ch_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "Pamela Court",
      verb: "Leave",
      target: { x: D.x, y: 0, z: D.z + 1.3, yaw: PI },
    });
    K.door(ctx, {
      id: "pv3_ch_86_out",
      pos: new THREE.Vector3(OX + 9.7, OY + 1.2, OZ - 17),
      label: "7th Avenue (door 86)",
      verb: "Leave",
      target: { x: D86.x + 1.3, y: 0, z: D86.z, yaw: -HP },
      onEnter: () => {
        PV.setFlag("ch_86_open", true);
        K.lockUnlock(LK.door86.id);
      },
    });
    K.door(ctx, {
      id: "pv3_ch_86_in",
      pos: new THREE.Vector3(D86.x + 0.35, 1.2, D86.z),
      label: "Door 86",
      verb: "Enter",
      lock: LK.door86,
      target: { x: OX + 8.6, y: OY, z: OZ - 17, yaw: HP },
    });
    K.door(ctx, {
      id: "pv3_ch_grate",
      pos: new THREE.Vector3(OX, OY + CY + 1.1, OZ - 31.4),
      label: "Rusted Grate",
      verb: "Squeeze through",
      lock: LK.grate,
      target: { x: OX - 0.6, y: OY + CY, z: OZ - 33, yaw: 0 },
    });
    K.door(ctx, {
      id: "pv3_ch_grate_back",
      pos: new THREE.Vector3(OX + 0.6, OY + CY + 1.1, OZ - 32.3),
      label: "Rusted Grate",
      verb: "Squeeze through",
      target: { x: OX - 0.5, y: OY + CY, z: OZ - 29.6, yaw: PI },
    });

    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "bartender", 5.85, 0, -8.2);
    K.anchor(ctx, "merchant", 5.85, 0, -8.2);
    K.anchor(ctx, "npc1", -2.8, 0, -16.0); // Hazel — communal table, back room
    K.anchor(ctx, "npc2", -3.7, 0.0, -4.0); // Vernon — booth
    K.anchor(ctx, "npc3", -5.9, 0.3, -19.4); // Keys — piano
    K.anchor(ctx, "npc4", 1.6, 0, -6.4); // patron
    K.anchor(ctx, "npc5", -1.4, CY, -10.6); // cellar settler
    K.anchor(ctx, "npc6", 3.4, 0, -17.5); // cook
    K.anchor(ctx, "dot", 2.4, CY, -4.4); // Fran's trade table
    K.anchor(ctx, "bar_stool", 3.9, 0, -9.7);
    [
      [0, 0, -8],
      [-3, 0, -17],
      [3, 0, -17],
      [0, CY, -12],
      [-3, CY, -6],
      [0, CY, -26],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 4.4, CY, -20.5);
    K.anchor(ctx, "loot2", 1.3, CY, -35.3);
    K.anchor(ctx, "loot3", -6.9, CY + 1.2, -4.2);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_bedfords_int";
  }

