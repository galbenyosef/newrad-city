// play-inline-336 04 — tint
// Lines 881-2182 of readable/play-inline-336.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "mcs_int",
      off: O,
      lit: true,
      amb: [0.1, 0.085, 0.07],
      floors: [0, UP, CY],
      grime: 0.55,
    });
    const r = K.rng("mcs_int");
    const gas = [1, 0.72, 0.4],
      wallC = [0.78, 0.66, 0.48],
      panel = [0.36, 0.22, 0.13],
      smoke = [0.42, 0.36, 0.28];
    const H = 3.7;

    // gaps
    K.gap(ctx, 0, 0, 1.3, 0, 2.6); // street door
    K.gap(ctx, 1.4, -13, 3.0, 0, 2.7); // bar room ↔ back room (wide opening)
    K.gap(ctx, -2.4, -21, 1.2, 0, 2.3); // back room ↔ kitchen
    K.gap(ctx, 2.3, -21, 4.2, 0, 2.5, { casing: false }); // back room ↔ stair hall (ground)
    K.gap(ctx, 3.45, -21, 1.8, CY, 2.5, { casing: false }); // stair hall (cellar level) ↔ cellar
    K.gap(ctx, 3.4, -21, 1.4, UP, 2.3); // stair hall (apartment level) ↔ apartment hall
    K.gap(ctx, 0, -30, 1.1, UP, 2.3); // landing ↔ bedroom
    K.gap(ctx, 2.3, -18, 1.4, UP, 2.3); // apartment hall ↔ parlour

    const BR = [-4.6, -0.3, -13.1, 4.6, H, 0.1];
    // ================================================= FRONT BAR ROOM
    K.room(b, ctx, {
      x0: -4.5,
      z0: -13,
      x1: 4.5,
      z1: 0,
      y: 0,
      h: H,
      floor: "sawdust",
      fc: [0.9, 0.84, 0.74],
      wall: "plaster_stained",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.25,
      ceil: "tin",
      cc: smoke,
      cornice: true,
      surface: "wood",
    });
    // front windows (daylight through the small panes)
    for (const wx of [-2.6, 2.6]) {
      b.plate("lamp", wx, 2.1, -0.12, 0, -1, 2.6, 2.3, null, {
        tint: [0.4, 0.4, 0.34],
      });
      for (let i = 1; i < 4; i++)
        b.beam(
          "green_paint",
          wx - 1.3 + (2.6 * i) / 4,
          0.95,
          -0.15,
          wx - 1.3 + (2.6 * i) / 4,
          3.25,
          -0.15,
          0.04,
          0.04,
          { tint: [0.16, 0.3, 0.2] },
        );
      for (let j = 1; j < 4; j++)
        b.beam(
          "green_paint",
          wx - 1.3,
          0.95 + (2.3 * j) / 4,
          -0.15,
          wx + 1.3,
          0.95 + (2.3 * j) / 4,
          -0.15,
          0.04,
          0.04,
          { tint: [0.16, 0.3, 0.2] },
        );
      b.light(wx, 2.2, -0.9, [0.75, 0.72, 0.6], 0.55, 5, { box: BR });
    }
    // THE BAR along the west wall: counter, brass foot rail, back bar with mirror and taps
    const bx0 = -3.2,
      bx1 = -2.55,
      bz0 = -11.2,
      bz1 = -1.6;
    b.boxMM("mahogany", bx0, 0, bz0, bx1, 1.08, bz1, {
      tint: [0.4, 0.2, 0.12],
    });
    b.boxMM(
      "mahogany",
      bx0 - 0.1,
      1.08,
      bz0 - 0.05,
      bx1 + 0.12,
      1.14,
      bz1 + 0.05,
      { tint: [0.46, 0.24, 0.14] },
    );
    for (let z = bz0 + 0.5; z < bz1; z += 0.9)
      b.boxMM("mahogany", bx1, 0.15, z - 0.35, bx1 + 0.03, 0.95, z + 0.35, {
        tint: [0.34, 0.17, 0.1],
      });
    b.pipe("brass", bx1 + 0.28, 0.18, bz0, bx1 + 0.28, 0.18, bz1, 0.03, 6);
    for (let z = bz0 + 0.3; z < bz1; z += 1.5)
      b.pipe("brass", bx1 + 0.02, 0.18, z, bx1 + 0.28, 0.18, z, 0.015, 4);
    b.col(bx0 - 0.1, 0, bz0 - 0.05, bx1 + 0.12, 1.14, bz1 + 0.05, {
      tag: "counter",
      surface: "wood",
    });
    // Houdini's handcuffs, locked to the foot rail
    for (const dz of [0, 0.12])
      b.geo("steel", new THREE.TorusGeometry(0.045, 0.008, 5, 10), {
        x: bx1 + 0.28,
        y: 0.14 - dz * 0.4,
        z: bz1 - 0.6 + dz,
        ry: HP,
        tint: [0.6, 0.6, 0.6],
      });
    b.plate(
      "art",
      bx1 + 0.04,
      0.6,
      bz1 - 0.6,
      1,
      0,
      0.35,
      0.18,
      K.signCell("mcs_houdini", "H.H. 1908", 128, 64, {
        bg: "#c8a050",
        fg: "#2a1a0a",
        font: "Georgia, serif",
      }),
    );
    // back bar
    b.boxMM("mahogany", -4.45, 0, bz0, -3.95, 1.0, bz1, {
      tint: [0.36, 0.18, 0.11],
    });
    b.boxMM("mahogany", -4.45, 1.0, bz0, -4.1, 3.1, bz1, {
      tint: [0.34, 0.17, 0.1],
    });
    b.boxMM("glass", -4.1, 1.35, bz0 + 0.6, -4.09, 2.5, bz1 - 0.6, {
      tint: [0.5, 0.55, 0.55],
    }); // the mirror
    for (const yy of [1.3, 2.55])
      b.boxMM("mahogany", -4.45, yy, bz0, -3.85, yy + 0.05, bz1, {
        tint: [0.4, 0.2, 0.12],
      });
    for (let z = bz0 + 0.2; z < bz1 - 0.2; z += 0.16) {
      if (r() < 0.25) continue;
      b.cyl("glass", -4.0, 2.6, z, 0.04, 0.04, 0.22 + r() * 0.12, 6, {
        tint: r.pick([
          [0.3, 0.45, 0.25],
          [0.5, 0.3, 0.12],
          [0.75, 0.7, 0.5],
        ]),
      });
    }
    b.col(-4.5, 0, bz0, -3.95, 3.1, bz1, {});
    // the two taps: LIGHT and DARK
    for (const [tz, lbl, col] of [
      [-5.6, "LIGHT", "#f0d890"],
      [-4.6, "DARK", "#e0b080"],
    ]) {
      b.pipe("brass", -3.0, 1.14, tz, -3.0, 1.6, tz, 0.035, 8);
      b.pipe("brass", -3.0, 1.55, tz, -2.75, 1.55, tz, 0.025, 6);
      b.box("mahogany", -3.0, 1.6, tz, 0.08, 0.28, 0.08, {
        tint: [0.2, 0.1, 0.05],
      });
      b.plate(
        "art",
        -2.9,
        1.3,
        tz,
        1,
        0,
        0.36,
        0.12,
        K.signCell("mcs_tap_" + lbl, lbl, 128, 42, {
          bg: "#1c3a26",
          fg: col,
          font: "Georgia, serif",
        }),
      );
    }
    // mugs, lined up in pairs (they only come in pairs)
    for (let k = 0; k < 7; k++) {
      const z = -10.6 + k * 1.2 + r() * 0.3;
      for (const dz of [0, 0.14]) {
        b.cyl("glass", -2.85, 1.14, z + dz, 0.05, 0.05, 0.14, 8, {
          tint: k % 2 ? [0.95, 0.75, 0.35] : [0.35, 0.2, 0.08],
        });
        b.geo("glass", new THREE.TorusGeometry(0.03, 0.008, 4, 8), {
          x: -2.8,
          y: 1.21,
          z: z + dz,
          tint: [0.8, 0.85, 0.8],
        });
      }
    }
    b.boxMM("brass", -3.15, 1.14, -8.6, -2.65, 1.5, -8.0, {
      tint: [0.7, 0.55, 0.3],
    }); // cash register
    b.boxMM("brass", -3.1, 1.5, -8.5, -2.75, 1.62, -8.1, {
      tint: [0.8, 0.62, 0.32],
    });
    // the gas lamp over the bar, hung with the wishbones of the boys who shipped out in 1965
    const LX = -2.2,
      LZ = -6.2;
    b.pipe("brass", LX, 2.6, LZ, LX, H, LZ, 0.02, 5);
    b.pipe("brass", LX, 2.6, LZ - 1.2, LX, 2.6, LZ + 1.2, 0.03, 6);
    b.pipe("brass", LX - 0.6, 2.6, LZ, LX + 0.6, 2.6, LZ, 0.03, 6);
    for (const [gx, gz] of [
      [LX, LZ - 1.2],
      [LX, LZ + 1.2],
      [LX - 0.6, LZ],
      [LX + 0.6, LZ],
    ]) {
      b.pipe("brass", gx, 2.6, gz, gx, 2.45, gz, 0.012, 4);
      b.cyl("glass", gx, 2.28, gz, 0.1, 0.07, 0.18, 8, {
        tint: [0.95, 0.85, 0.65],
      });
      b.geo("lamp", K.sphereGeo(), {
        x: gx,
        y: 2.36,
        z: gz,
        s: 0.04,
        tint: gas,
      });
      b.glow(gx, 2.36, gz, [0.9, 0.6, 0.3], 0.7);
    }
    b.light(LX, 2.3, LZ, gas, 1.1, 6.5, { box: BR });
    for (let k = 0; k < 34; k++) {
      const t = r(),
        onZ = k % 2 === 0;
      const x = onZ ? LX + (r() - 0.5) * 0.06 : LX - 0.6 + t * 1.2,
        z = onZ ? LZ - 1.2 + t * 2.4 : LZ + (r() - 0.5) * 0.06;
      b.geo("flat", K.sphereGeo(), {
        x,
        y: 2.62,
        z,
        s: 0.012,
        tint: [0.15, 0.12, 0.1],
      });
      K.wishbone(b, x, 2.58, z, r() * 3, 0.06 + r() * 0.03);
    }
    // dust: 70 years of it, on the wishbones
    b.plate(
      "art",
      -4.08,
      3.25,
      -6.2,
      1,
      0,
      3.4,
      0.4,
      K.signCell("mcs_wish_sign", "DON'T TOUCH THE WISHBONES", 512, 60, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    // the pot-belly stove
    const SX = 1.4,
      SZ = -6.8;
    b.cyl("cast_iron", SX, 0, SZ, 0.36, 0.3, 0.12, 12, {
      tint: [0.2, 0.19, 0.18],
    });
    b.cyl("cast_iron", SX, 0.12, SZ, 0.32, 0.44, 0.45, 12, {
      tint: [0.2, 0.19, 0.18],
      top: false,
    });
    b.cyl("cast_iron", SX, 0.57, SZ, 0.44, 0.32, 0.4, 12, {
      tint: [0.2, 0.19, 0.18],
    });
    b.cyl("cast_iron", SX, 0.97, SZ, 0.26, 0.22, 0.12, 12, {
      tint: [0.22, 0.2, 0.19],
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * PI * 2 + 0.4;
      b.pipe(
        "cast_iron",
        SX + Math.cos(a) * 0.3,
        0.12,
        SZ + Math.sin(a) * 0.3,
        SX + Math.cos(a) * 0.38,
        0,
        SZ + Math.sin(a) * 0.38,
        0.03,
        4,
        { tint: [0.2, 0.19, 0.18] },
      );
    }
    b.plate("lamp", SX, 0.42, SZ + 0.43, 0, 1, 0.26, 0.16, null, {
      tint: [1, 0.42, 0.12],
    });
    b.pipe("cast_iron", SX, 1.09, SZ, SX, 2.9, SZ, 0.09, 8, {
      tint: [0.24, 0.22, 0.2],
    });
    b.pipe("cast_iron", SX, 2.9, SZ, 4.45, 3.3, SZ, 0.09, 8, {
      tint: [0.24, 0.22, 0.2],
    });
    b.light(SX, 0.5, SZ + 0.3, [1, 0.45, 0.15], 0.9, 4.5, { box: BR });
    b.glow(SX, 0.45, SZ + 0.5, [1, 0.4, 0.1], 1.1);
    b.col(SX - 0.45, 0, SZ - 0.45, SX + 0.45, 1.1, SZ + 0.45, {
      tag: "furniture",
      surface: "metal",
    });
    b.cyl("rust", SX + 0.8, 0, SZ + 0.3, 0.2, 0.24, 0.3, 8, {
      tint: [0.3, 0.28, 0.26],
    }); // coal scuttle
    // tables & chairs (east side + centre); plates of cheese & onions
    for (const [tx, tz] of [
      [3.3, -2.3],
      [3.3, -5.0],
      [3.3, -9.6],
      [3.3, -11.8],
      [0.1, -2.6],
      [0.4, -10.8],
    ]) {
      const tt = K.table(b, tx, 0, tz, 1.3, 0.9, {
        mat: "oak",
        tint: [0.6, 0.44, 0.3],
      });
      for (const [dx, dz, yaw] of [
        [-0.9, 0, -HP],
        [0.9, 0, HP],
        [0, -0.7, PI],
        [0, 0.7, 0],
      ]) {
        if (tx > 3 && dx > 0) continue;
        K.chair(b, tx + dx, 0, tz + dz, yaw + (r() - 0.5) * 0.3, {
          mat: "oak",
          tint: [0.55, 0.4, 0.28],
        });
      }
      for (let k = 0; k < 2 + ((r() * 3) | 0); k++) {
        const px = tx + (r() - 0.5) * 0.9,
          pz = tz + (r() - 0.5) * 0.6;
        b.cyl("glass", px, tt, pz, 0.05, 0.05, 0.14, 8, {
          tint: r() < 0.5 ? [0.95, 0.75, 0.35] : [0.35, 0.2, 0.08],
        });
      }
      if (r() < 0.7) {
        b.cyl("ceramic", tx + 0.15, tt, tz - 0.1, 0.16, 0.14, 0.02, 10);
        b.box("flat", tx + 0.1, tt + 0.02, tz - 0.12, 0.12, 0.05, 0.08, {
          tint: [0.95, 0.8, 0.35],
        });
        b.cyl("flat", tx + 0.22, tt + 0.02, tz - 0.05, 0.035, 0.035, 0.03, 8, {
          tint: [0.9, 0.85, 0.8],
        });
      }
    }
    // memorabilia: every inch of wall (photos, clippings, a fireman's helmet, a portrait of the founder)
    K.salonWall(b, -12.8, -1.2, 1.35, 3.55, 4.38, -1, 0, "mcs_east", {
      density: 1,
      photos: "saloon",
    });
    K.salonWall(b, 3.0, 4.4, 1.35, 3.0, -12.88, 0, 1, "mcs_north", {
      density: 1,
      photos: "saloon",
    });
    for (let k = 0; k < 26; k++) {
      const x = -4.2 + (k % 13) * 0.66,
        y = 3.1 + Math.floor(k / 13) * 0.35;
      if (Math.abs(x) < 0.9 && y < 3.2) continue;
      b.plate("art", x, y, -0.13, 0, -1, 0.34, 0.26, clipping(k));
    }
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        4.38,
        1.6 + (k % 2) * 0.35,
        -2 - k * 1.05,
        -1,
        0,
        0.28,
        0.34,
        K.photo("saloon", k + 20),
        { frame: "paint_black", fw: 0.025 },
      );
    K.framed(b, -4.07, 3.35, -2.5, 1, 0, 0.6, 0.75, K.painting(2, 128, 160), {
      frame: "gold",
    });
    b.plate(
      "art",
      0,
      3.25,
      -12.86,
      0,
      1,
      2.8,
      0.42,
      K.signCell("mcs_before", "WE WERE HERE BEFORE YOU WERE BORN", 512, 72, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      4.37,
      3.0,
      -6.8,
      -1,
      0,
      0.9,
      0.65,
      K.signCell("mcs_ladies", "LADIES\nWELCOME\n(since 1970)", 192, 140, {
        bg: "#e8dcb8",
        fg: "#1c3a26",
        font: "Georgia, serif",
        border: "#1c3a26",
      }),
    );
    b.cyl("flat", 4.2, 2.62, -8.5, 0.16, 0.14, 0.14, 10, {
      tint: [0.1, 0.1, 0.1],
    });
    b.cyl("flat", 4.2, 2.6, -8.5, 0.24, 0.24, 0.02, 12, {
      tint: [0.1, 0.1, 0.1],
    }); // fireman's helmet on a shelf
    b.boxMM("wood_dark", 4.1, 2.5, -9.2, 4.45, 2.56, -7.8, { tint: panel });
    b.boxMM("wood_dark", 4.1, 2.9, -12.4, 4.45, 2.95, -10.2, { tint: panel });
    for (let k = 0; k < 6; k++)
      b.cyl("ceramic", 4.25, 2.95, -12.2 + k * 0.36, 0.07, 0.06, 0.16, 8, {
        tint: [0.8, 0.76, 0.66],
      }); // old steins
    // the Tammany wanted poster (quest breadcrumb)
    b.plate(
      "art",
      4.37,
      1.9,
      -12.1,
      -1,
      0,
      0.6,
      0.8,
      K.signCell(
        "mcs_wanted",
        "NOT WELCOME\nBOSS CROKE\n& HIS BRAVES",
        160,
        210,
        {
          bg: "#e8dcb8",
          fg: "#8a1a10",
          font: "Georgia, serif",
          border: "#8a1a10",
        },
      ),
    );
    // tin ceiling fixtures: two more gaslights over the tables
    for (const z of [-3.5, -10.2]) {
      b.pipe("brass", 2.2, 3.0, z, 2.2, H, z, 0.015, 4);
      b.cyl("glass", 2.2, 2.82, z, 0.13, 0.08, 0.2, 8, {
        tint: [0.95, 0.85, 0.65],
      });
      b.geo("lamp", K.sphereGeo(), { x: 2.2, y: 2.9, z, s: 0.045, tint: gas });
      b.light(2.2, 2.8, z, gas, 0.8, 5.5, { box: BR });
      b.glow(2.2, 2.9, z, [0.9, 0.6, 0.3], 0.9);
    }
    b.hplate("decal", 1.4, 0.013, -6.8, 1.6, 1.6, 0, K.decal("scorch", 3));
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        -2 + r() * 6,
        0.012 + k * 0.0004,
        -1 - r() * 11,
        0.8,
        0.8,
        r() * 6,
        K.decal(k % 2 ? "puddle" : "grime", 70 + k),
      );

    // ================================================= BACK ROOM
    const BK = [-4.6, -0.3, -21.1, 4.6, H, -12.9];
    K.room(b, ctx, {
      x0: -4.5,
      z0: -21,
      x1: 4.5,
      z1: -13,
      y: 0,
      h: H,
      floor: "sawdust",
      fc: [0.85, 0.8, 0.7],
      wall: "plaster_stained",
      wc: wallC,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.25,
      ceil: "tin",
      cc: smoke,
      cornice: true,
      surface: "wood",
    });
    // Peter Cooper's chair (on its little dais, roped off)
    b.boxMM("wood_dark", -4.3, 0, -20.8, -3.0, 0.15, -19.5, { tint: panel });
    b.col(-4.3, 0, -20.8, -3.0, 0.15, -19.5, {});
    const cx = -3.65,
      cz = -20.15;
    b.box("oak", cx, 0.15 + 0.45, cz, 0.62, 0.07, 0.58, {
      tint: [0.5, 0.34, 0.2],
    });
    for (const [lx, lz] of [
      [-0.26, -0.24],
      [0.26, -0.24],
      [-0.26, 0.24],
      [0.26, 0.24],
    ])
      b.box("oak", cx + lx, 0.15, cz + lz, 0.05, 0.45, 0.05, {
        tint: [0.45, 0.3, 0.18],
      });
    b.box("oak", cx, 0.67, cz - 0.27, 0.62, 0.8, 0.06, {
      tint: [0.5, 0.34, 0.2],
    });
    for (const s of [-1, 1]) {
      b.box("oak", cx + s * 0.3, 0.67, cz, 0.06, 0.28, 0.56, {
        tint: [0.45, 0.3, 0.18],
      });
    }
    for (const px of [-2.8, -2.8])
      b.cyl("brass", px, 0, -19.3, 0.04, 0.04, 0.9, 6);
    b.pipe("cloth_red", -2.8, 0.85, -19.3, -4.4, 0.8, -19.3, 0.02, 4);
    b.plate(
      "art",
      -4.38,
      1.8,
      -20.1,
      1,
      0,
      0.8,
      0.45,
      K.signCell(
        "mcs_cooper_chair",
        "PETER COOPER'S CHAIR\nregular, 1854–1883",
        256,
        140,
        { bg: "#c8a050", fg: "#2a1a0a", font: "Georgia, serif" },
      ),
    );
    K.framed(b, -4.38, 2.75, -20.1, 1, 0, 0.7, 0.9, K.painting(18, 128, 160), {
      frame: "gold",
    });
    // the long table
    const lt = K.table(b, 0.6, 0, -17, 1.2, 4.4, {
      mat: "oak",
      tint: [0.55, 0.4, 0.27],
    });
    for (const s of [-1, 1])
      for (const dz of [-1.6, -0.5, 0.6, 1.7])
        K.chair(b, 0.6 + s * 0.85, 0, -17 + dz, s > 0 ? HP : -HP, {
          mat: "oak",
          tint: [0.5, 0.36, 0.25],
        });
    for (let k = 0; k < 7; k++)
      b.cyl(
        "glass",
        0.4 + r() * 0.4,
        lt,
        -18.8 + k * 0.6,
        0.05,
        0.05,
        0.14,
        8,
        { tint: k % 2 ? [0.95, 0.75, 0.35] : [0.35, 0.2, 0.08] },
      );
    b.cyl("ceramic", 0.6, lt, -17.2, 0.2, 0.18, 0.02, 10);
    b.box("flat", 0.6, lt + 0.02, -17.2, 0.25, 0.08, 0.14, {
      tint: [0.95, 0.8, 0.35],
    });
    // the fireplace on the east wall
    b.boxMM("brick_red", 3.9, 0, -18.3, 4.45, 1.5, -15.7, {
      tint: [0.55, 0.36, 0.3],
    });
    b.boxMM("paint_black", 3.88, 0.1, -17.6, 3.9, 1.05, -16.4, {
      tint: [0.03, 0.03, 0.03],
    });
    b.boxMM("wood_dark", 3.75, 1.5, -18.5, 4.45, 1.6, -15.5, { tint: panel });
    b.plate("lamp", 3.87, 0.35, -17, -1, 0, 1.0, 0.3, null, {
      tint: [1, 0.4, 0.1],
    });
    b.light(3.3, 0.6, -17, [1, 0.45, 0.15], 1.0, 5, { box: BK });
    b.glow(3.7, 0.4, -17, [1, 0.4, 0.1], 1.6);
    b.col(3.75, 0, -18.5, 4.45, 1.6, -15.5, {});
    K.framed(b, 4.38, 2.5, -17, -1, 0, 1.4, 0.9, K.painting(11, 192, 128), {
      frame: "wood_dark",
    });
    // more walls of stuff; a dartboard; the cat's basket
    K.salonWall(b, -18.8, -13.3, 1.35, 3.55, -4.38, 1, 0, "mcs_bk_w", {
      density: 1,
      photos: "saloon",
    });
    K.salonWall(b, -1.75, 0.15, 1.35, 3.55, -20.88, 0, 1, "mcs_bk_n", {
      density: 1,
      photos: "saloon",
    });
    b.cyl("wood_rotten", -3.6, 0, -14, 0.35, 0.4, 0.2, 10, {
      tint: [0.6, 0.5, 0.35],
    });
    for (const z of [-15, -19]) {
      b.pipe("brass", 0.6, 3.0, z, 0.6, H, z, 0.015, 4);
      b.cyl("glass", 0.6, 2.82, z, 0.13, 0.08, 0.2, 8, {
        tint: [0.95, 0.85, 0.65],
      });
      b.geo("lamp", K.sphereGeo(), { x: 0.6, y: 2.9, z, s: 0.045, tint: gas });
      b.light(0.6, 2.8, z, gas, 0.85, 5.5, { box: BK });
      b.glow(0.6, 2.9, z, [0.9, 0.6, 0.3], 0.9);
    }
    K.note(ctx, "pev_note_mcs_regulars", -3.4, 0.62, -20.3, {
      name: "Card on Peter Cooper's Chair",
      title: "Handwritten card",
      text: "PLEASE DO NOT SIT IN MR. COOPER'S CHAIR.\n\nHe is not coming back. He died in 1883. We are aware.\n\nIt is still his chair.\n\n— Management (Deck)",
    });

    // ================================================= KITCHEN
    const KB = [-4.6, -0.3, -31.1, 0.1, H, -20.9];
    K.room(b, ctx, {
      x0: -4.5,
      z0: -31,
      x1: 0,
      z1: -21,
      y: 0,
      h: H,
      floor: "hextile",
      fc: [0.7, 0.66, 0.6],
      wall: "tile",
      wc: [0.8, 0.8, 0.72],
      ceil: "plaster",
      cc: [0.45, 0.42, 0.36],
    });
    b.boxMM("steel", -4.4, 0, -29.9, -3.6, 0.92, -23, {
      tint: [0.6, 0.6, 0.58],
    });
    b.col(-4.4, 0, -29.9, -3.6, 0.92, -23, {});
    for (let k = 0; k < 6; k++) {
      b.cyl("flat", -4.0, 0.92, -29.4 + k * 0.9, 0.22, 0.22, 0.14, 12, {
        tint: [0.95, 0.72, 0.28],
      });
    } // cheese wheels
    for (let k = 0; k < 3; k++) {
      b.box("wood", -1.2 + (k % 2) * 0.6, 0, -29.2 + k * 0.1, 0.55, 0.4, 0.4, {
        yaw: r() * 0.3,
        tint: [0.6, 0.48, 0.34],
      });
      for (let i = 0; i < 6; i++)
        b.geo("flat", K.sphereGeo(), {
          x: -1.2 + (k % 2) * 0.6 + (r() - 0.5) * 0.3,
          y: 0.44,
          z: -29.2 + k * 0.1 + (r() - 0.5) * 0.2,
          s: 0.06,
          tint: [0.85, 0.72, 0.6],
        });
    } // onions
    b.col(-1.6, 0, -29.6, -0.3, 0.44, -28.7, {});
    const kt = K.table(b, -2, 0, -25.5, 1.2, 2.0, {
      mat: "wood",
      tint: [0.7, 0.6, 0.45],
    });
    b.boxMM("wood", -2.3, kt, -25.9, -1.7, kt + 0.04, -25.2, {
      tint: [0.75, 0.62, 0.45],
    });
    b.pipe("steel", -1.9, kt + 0.05, -25.1, -1.6, kt + 0.05, -24.9, 0.01, 3);
    for (let k = 0; k < 8; k++) {
      b.cyl(
        "ceramic",
        -2.2 + (k % 2) * 0.35,
        kt,
        -26.3 + Math.floor(k / 2) * 0.35,
        0.14,
        0.12,
        0.02,
        10,
      );
    }
    b.boxMM("cast_iron", -1.6, 0, -21.3, -0.1, 0.95, -22.3, {
      tint: [0.22, 0.2, 0.19],
    }); // stove
    b.col(-1.6, 0, -22.3, -0.1, 0.95, -21.3, {});
    b.plate(
      "art",
      -4.38,
      2.0,
      -26,
      1,
      0,
      1.4,
      0.9,
      K.signCell(
        "mcs_menu",
        "MENU\nCheese & Onions ... 3c\nLiverwurst ... 4c\nLight or Dark ... 2c",
        320,
        200,
        { bg: "#1a1a1a", fg: "#e8dcb8", font: "Georgia, serif" },
      ),
    );
    K.lamp(b, -2.2, 3.2, -25.5, "bulb", gas, 0.9, 6, {
      ceil: H,
      lightOpts: { box: KB },
    });
    K.loot(ctx, "fridge", -0.5, 0, -29.4, 0, {
      loot: "food_oldworld",
      owner: "settlers",
      name: "Ice Box",
    });

    // ================================================= STAIR HALL (three stacked rooms: cellar level, ground, apartment)
    // flights: UP x 2.6..4.4 rising north (z −22.2 → −28.2), DOWN x 0.4..2.2 descending north; landings at z −28.2..−31
    const SZ0 = -31,
      SF0 = -22.2,
      SF1 = -28.2;
    const SB = [-0.1, CY - 0.2, SZ0 - 0.1, 4.6, UP + 3.2, -20.9];
    K.room(b, ctx, {
      x0: 0,
      z0: SZ0,
      x1: 4.5,
      z1: -21,
      y: CY,
      h: -CY,
      noFloor: true,
      noCeil: true,
      wall: "brick_red",
      wc: [0.5, 0.38, 0.32],
      trim: false,
    });
    K.room(b, ctx, {
      x0: 0,
      z0: SZ0,
      x1: 4.5,
      z1: -21,
      y: 0,
      h: UP,
      noFloor: true,
      noCeil: true,
      wall: "plaster_stained",
      wc: [0.65, 0.55, 0.42],
      trim: false,
    });
    K.room(b, ctx, {
      x0: 0,
      z0: SZ0,
      x1: 4.5,
      z1: -21,
      y: UP,
      h: 3.1,
      noFloor: true,
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.5],
      ceil: "plaster",
      cc: [0.45, 0.4, 0.34],
    });
    K.stairs(b, 2.6, SF1, 4.4, SF0, 0, UP, "-z", {
      mat: "wood",
      tint: [0.5, 0.36, 0.24],
      rail: "l",
      railMat: "wood_dark",
      handMat: "mahogany",
    });
    K.stairs(b, 0.4, SF1, 2.2, SF0, CY, 0, "+z", {
      mat: "wood",
      tint: [0.45, 0.32, 0.22],
      rail: "l",
      railMat: "wood_dark",
      handMat: "mahogany",
      solid: false,
      thick: 0.35,
    });
    K.segWall(b, 2.4, SF1, 2.4, SF0, CY, 0, 1, {
      mat: "plaster_stained",
      tint: [0.6, 0.5, 0.4],
      trim: false,
      both: true,
    });
    // ground entry strip (from the back room)
    b.face("wood", 0, 0, -21, 1, 0, 0, 0, 0, -1, 4.5, 1.2, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.col(0, -0.3, SF0, 4.5, 0, -21, { tag: "floor", surface: "wood" });
    b.face("wood", 0, -0.3, SF0, 1, 0, 0, 0, 0, 1, 4.5, 1.2, {
      uv: "top",
      tint: [0.35, 0.3, 0.25],
    }); // its underside (seen from the cellar corridor)
    // cellar level: landing + corridor under the up flight
    b.face("wood", 0, CY, SF1, 1, 0, 0, 0, 0, -1, 4.5, SF1 - SZ0, {
      uv: "top",
      tint: [0.45, 0.35, 0.26],
    });
    b.col(0, CY - 0.3, SZ0, 4.5, CY, SF1, { tag: "floor", surface: "wood" });
    b.face("concrete", 2.4, CY, -21, 1, 0, 0, 0, 0, -1, 2.1, -21 - SF1, {
      uv: "top",
      tint: [0.45, 0.42, 0.38],
    });
    b.col(2.4, CY - 0.3, SF1, 4.5, CY, -21, { tag: "floor" });
    // apartment level: landing (north), floor over the down flight, hole over the up flight
    b.face("wood", 0, UP, SF1, 1, 0, 0, 0, 0, -1, 4.5, SF1 - SZ0, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.face("wood", 0, UP, SF0, 1, 0, 0, 0, 0, -1, 2.4, SF0 - SF1, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.face("wood", 0, UP, -21, 1, 0, 0, 0, 0, -1, 4.5, 1.2, {
      uv: "top",
      tint: [0.5, 0.38, 0.28],
    });
    b.col(0, UP - 0.3, SZ0, 4.5, UP, SF1, { tag: "floor", surface: "wood" });
    b.col(0, UP - 0.3, SF1, 2.4, UP, SF0, { tag: "floor", surface: "wood" });
    b.col(0, UP - 0.3, SF0, 4.5, UP, -21, { tag: "floor", surface: "wood" });
    K.railing(b, 2.4, SF0, 2.4, SF1, UP, {
      h: 1.0,
      mat: "wood_dark",
      handMat: "mahogany",
    });
    K.railing(b, 2.4, SF0, 4.5, SF0, UP, {
      h: 1.0,
      mat: "wood_dark",
      handMat: "mahogany",
    });
    K.lamp(b, 1.2, 3.2, -24.5, "bulb", gas, 0.8, 7, {
      ceil: UP - 0.3,
      lightOpts: { box: SB },
    });
    K.lamp(b, 2.2, CY + 2.4, -29.6, "cage", gas, 0.6, 5, {
      ceil: CY + 3.2,
      lightOpts: { box: SB },
    });
    K.lamp(b, 3.4, UP + 2.6, -29.6, "bulb", gas, 0.6, 5, {
      ceil: UP + 3.1,
      lightOpts: { box: SB },
    });
    b.plate(
      "art",
      4.38,
      1.6,
      -21.7,
      -1,
      0,
      0.8,
      0.3,
      K.signCell("mcs_private", "PRIVATE ↑", 192, 60, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    b.plate(
      "art",
      0.02,
      1.4,
      -21.7,
      1,
      0,
      0.9,
      0.3,
      K.signCell("mcs_cellar", "CELLAR ↓", 192, 60, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );

    // ================================================= APARTMENT (upstairs)
    const AP = [-4.6, UP - 0.3, SZ0 - 0.1, 4.6, UP + 3.2, 0.1];
    K.room(b, ctx, {
      x0: -4.5,
      z0: SZ0,
      x1: 0,
      z1: -18,
      y: UP,
      h: 3.1,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper",
      wc: [0.8, 0.72, 0.6],
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "wood",
    });
    K.room(b, ctx, {
      x0: 0,
      z0: -21,
      x1: 4.5,
      z1: -18,
      y: UP,
      h: 3.1,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper",
      wc: [0.8, 0.72, 0.6],
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "wood",
    });
    K.room(b, ctx, {
      x0: -4.5,
      z0: -18,
      x1: 4.5,
      z1: 0,
      y: UP,
      h: 3.1,
      floor: "wood",
      fc: [0.55, 0.42, 0.3],
      wall: "wallpaper_green",
      wc: [0.72, 0.74, 0.6],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.55, 0.5, 0.44],
      surface: "wood",
    });
    K.bed(b, -2.5, UP, -29.6, 0, { w: 1.5, tint: [0.62, 0.55, 0.45] });
    b.boxMM("wood_dark", -4.4, UP, -21, -3.4, UP + 1.6, -19.6, { tint: panel });
    b.col(-4.4, UP, -21, -3.4, UP + 1.6, -19.6, {});
    K.framed(b, -4.38, UP + 1.9, -26, 1, 0, 0.8, 0.6, K.photo("saloon", 40), {
      frame: "wood_dark",
    });
    K.lamp(b, -2.2, UP + 2.6, -24, "bulb", gas, 0.7, 6, {
      ceil: UP + 3.1,
      lightOpts: { box: AP },
    });
    K.lamp(b, 2.2, UP + 2.6, -19.5, "bulb", gas, 0.5, 4, {
      ceil: UP + 3.1,
      lightOpts: { box: AP },
    });
    // parlour: front windows onto 7th Street (with the fire escape outside), desk, gramophone, the family license
    for (const wx of [-2.2, 2.2]) {
      b.plate("lamp", wx, UP + 1.6, -0.12, 0, -1, 1.1, 1.8, null, {
        tint: [0.4, 0.4, 0.36],
      });
      b.light(wx, UP + 1.6, -0.8, [0.75, 0.72, 0.62], 0.55, 5, { box: AP });
      for (let k = 0; k < 4; k++)
        b.beam(
          "black_iron",
          wx - 0.55 + k * 0.37,
          UP + 0.7,
          -0.08,
          wx - 0.55 + k * 0.37,
          UP + 2.5,
          -0.08,
          0.02,
          0.02,
        );
    }
    const dsk = K.table(b, -3.2, UP, -8, 1.0, 1.8, { mat: "mahogany" });
    K.chair(b, -2.5, UP, -8, HP, { mat: "leather", tint: [0.3, 0.18, 0.12] });
    K.terminal(ctx, "pev_term_mcs", -3.3, dsk, -8.4, HP, termDeck(), "bare");
    K.anchor(ctx, "ledger", -3.2, dsk + 0.02, -7.4);
    b.box("wood_dark", 3.6, UP, -16.6, 0.6, 0.9, 0.6, { tint: panel });
    b.cyl("brass", 3.6, UP + 0.95, -16.6, 0.04, 0.35, 0.45, 10, {
      tint: [0.8, 0.62, 0.3],
    }); // gramophone
    b.col(3.3, UP, -16.9, 3.9, UP + 0.9, -16.3, {});
    K.sofa(b, 2.5, UP, -4, 2.4, PI, { mat: "velvet", tint: [0.45, 0.2, 0.18] });
    K.framed(
      b,
      -2.2,
      UP + 1.9,
      -17.88,
      0,
      1,
      1.2,
      0.8,
      K.signCell(
        "mcs_license",
        "LICENSE No. 1\nJOHN O'ROURKE\nALE HOUSE · 1854",
        256,
        170,
        { bg: "#e8dcc0", fg: "#2a1a0a", font: "Georgia, serif" },
      ),
      { frame: "gold" },
    );
    K.salonWall(b, -16.5, -1.2, UP + 1.2, UP + 2.8, 4.38, -1, 0, "mcs_apt", {
      density: 0.7,
      photos: "saloon",
    });
    K.lamp(b, 0, UP + 2.6, -9, "pendant", gas, 0.75, 7, {
      ceil: UP + 3.1,
      shade: "paint_green",
      lightOpts: { box: AP },
    });
    K.loot(ctx, "safe", -4.1, UP, -16.8, HP, {
      loot: "safe",
      owner: "settlers",
      name: "O'Rourke Family Safe",
      tag: "safe",
      lock: K.regLock({
        id: "pev_lk_mcs_safe",
        label: "O'Rourke Family Safe",
        kind: "safe",
        code: "1854",
        hint: "Deck's back-office teletype.",
      }),
    });
    K.loot(ctx, "scrip_stash", -4.1, UP, -30.3, HP, {
      owner: "settlers",
      name: "Deck's Tip Jar",
    });
    K.loot(ctx, "bed", 1.8, UP, -12, 0, {
      name: "Spare Cot (Deck says it's fine)",
    });

    // ================================================= CELLAR
    const CB = [-4.6, CY - 0.2, -21.1, 4.6, -0.2, -1.9];
    K.room(b, ctx, {
      x0: -4.5,
      z0: -21,
      x1: 4.5,
      z1: -2,
      y: CY,
      h: 2.9,
      floor: "concrete",
      fc: [0.45, 0.42, 0.38],
      wall: "brick_red",
      wc: [0.55, 0.4, 0.34],
      ceil: "wood",
      cc: [0.32, 0.26, 0.2],
      trim: false,
    });
    // cask racks (horizontal barrels on cradles) along both walls
    for (const sx of [-1, 1])
      for (let k = 0; k < 8; k++) {
        const z = -19.2 + k * 1.5,
          x = sx * 3.7;
        if (sx > 0 && z > -8) continue;
        if (sx < 0 && z < -17) continue; // the breach
        b.beam(
          "wood_dark",
          x - 0.6,
          CY + 0.2,
          z,
          x + 0.6,
          CY + 0.2,
          z,
          0.15,
          0.15,
          { tint: panel },
        );
        b.geo("wood", K.unitCyl(12), {
          x,
          y: CY + 0.7,
          z,
          sx: 0.5,
          sy: 1.1,
          sz: 0.5,
          rz: HP,
          tint: [0.55, 0.4, 0.26],
        });
        for (const e of [-0.35, 0.35])
          b.geo("rust", K.unitCyl(12), {
            x: x + e,
            y: CY + 0.7,
            z,
            sx: 0.52,
            sy: 0.06,
            sz: 0.52,
            rz: HP,
          });
        if (k % 2 === 0) {
          b.geo("wood", K.unitCyl(12), {
            x,
            y: CY + 1.65,
            z,
            sx: 0.45,
            sy: 1.0,
            sz: 0.45,
            rz: HP,
            tint: [0.5, 0.36, 0.24],
          });
        }
        b.col(x - 0.6, CY, z - 0.55, x + 0.6, CY + 2.1, z + 0.55, {});
      }
    // the brew kettle & mash tun (Deck brews light AND dark down here)
    b.cyl("copper", 2.8, CY, -5, 0.9, 0.9, 1.4, 16, {
      tint: [0.75, 0.46, 0.26],
    });
    b.geo("copper", K.sphereGeo(), {
      x: 2.8,
      y: CY + 1.4,
      z: -5,
      sx: 0.9,
      sy: 0.5,
      sz: 0.9,
      tint: [0.75, 0.46, 0.26],
    });
    b.pipe("copper", 2.8, CY + 1.85, -5, 2.8, -0.3, -5, 0.08, 6, {
      tint: [0.75, 0.46, 0.26],
    });
    b.cyl("wood", 0.6, CY, -4.4, 0.7, 0.7, 1.1, 14, {
      tint: [0.55, 0.4, 0.26],
    });
    b.pipe("copper", 1.9, CY + 0.9, -4.8, 1.2, CY + 1.0, -4.5, 0.05, 6, {
      tint: [0.75, 0.46, 0.26],
    });
    b.plate("lamp", 2.8, CY + 0.25, -4.08, 0, 1, 0.5, 0.2, null, {
      tint: [1, 0.4, 0.1],
    });
    b.light(2.4, CY + 0.6, -4, [1, 0.45, 0.15], 0.9, 4.5, { box: CB });
    b.glow(2.8, CY + 0.3, -3.9, [1, 0.4, 0.1], 1.3);
    b.col(1.9, CY, -5.9, 3.7, CY + 1.9, -4.1, {});
    b.col(-0.1, CY, -5.1, 1.3, CY + 1.1, -3.7, {});
    b.plate(
      "art",
      4.38,
      CY + 1.8,
      -6.5,
      -1,
      0,
      1.4,
      0.45,
      K.signCell("mcs_brew", "LIGHT · DARK · NOTHING ELSE", 384, 80, {
        bg: "#1c3a26",
        fg: "#e8dcb8",
        font: "Georgia, serif",
      }),
    );
    // crates, the coal bin and the hatch ladder at the street end
    for (let k = 0; k < 5; k++)
      b.box(
        "wood",
        -2.8 + (k % 3) * 0.7,
        CY + Math.floor(k / 3) * 0.6,
        -3.2,
        0.6,
        0.6,
        0.6,
        { yaw: r() * 0.2, tint: [0.6, 0.48, 0.34] },
      );
    b.col(-3.2, CY, -3.6, -0.8, CY + 1.2, -2.8, {});
    b.boxMM("concrete", -4.4, CY, -8.6, -2.6, CY + 0.8, -6.2, {
      tint: [0.4, 0.38, 0.35],
      faces: "nsewt",
    });
    for (let k = 0; k < 20; k++)
      b.geo("paint_black", K.sphereGeo(), {
        x: -3.5 + (r() - 0.5) * 1.6,
        y: CY + 0.8 + r() * 0.2,
        z: -7.4 + (r() - 0.5) * 2.2,
        s: 0.08 + r() * 0.08,
        tint: [0.08, 0.08, 0.08],
      });
    b.col(-4.4, CY, -8.6, -2.6, CY + 0.9, -6.2, {});
    const lx = 3.4,
      lz = -2.3;
    for (const s of [-0.22, 0.22])
      b.beam("rust", lx + s, CY, lz, lx + s, -0.1, lz, 0.05, 0.05);
    for (let yy = CY + 0.3; yy < -0.2; yy += 0.3)
      b.beam("rust", lx - 0.22, yy, lz, lx + 0.22, yy, lz, 0.03, 0.03);
    b.boxMM(
      "metal_dark",
      lx - 0.8,
      -0.35,
      lz - 0.6,
      lx + 0.8,
      -0.28,
      lz + 0.3,
      { tint: [0.3, 0.3, 0.28], faces: "b" },
    );
    b.light(lx, -0.6, lz, [0.6, 0.62, 0.55], 0.5, 3, { box: CB });
    // the giant roach breach (Cellar Dwellers) in the north-west corner
    b.boxMM("paint_black", -4.52, CY, -20.6, -4.48, CY + 1.5, -19.0, {
      tint: [0.02, 0.02, 0.02],
      faces: "e",
    });
    K.rubble(b, -3.6, CY, -19.8, 1.2, 0.6, { seed: 77 });
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -4 + r() * 3.5,
        CY + 0.012 + k * 0.0004,
        -20.5 + r() * 6,
        1,
        1,
        r() * 6,
        K.decal(k % 3 ? "roach" : "grime", 80 + k),
      );
    K.lamp(b, 0, CY + 2.5, -12, "bulb", gas, 0.7, 7, {
      ceil: CY + 2.9,
      lightOpts: { box: CB },
    });
    K.lamp(b, 0, CY + 2.5, -18.5, "bulb", gas, 0.3, 5, {
      ceil: CY + 2.9,
      lightOpts: { box: CB },
    });
    K.lamp(b, 0, CY + 2.5, -6, "bulb", gas, 0.6, 6, {
      ceil: CY + 2.9,
      lightOpts: { box: CB },
    });
    K.skel(ctx, -2.6, CY, -18.6, 1.1, "lying");
    K.loot(ctx, "crate", 3.6, CY, -7.0, 0, {
      kind: "plain",
      loot: "drinks",
      owner: "settlers",
      name: "Ale Crate",
    });
    K.loot(ctx, "footlocker", 0, CY, -15, 0, {
      loot: "footlocker",
      name: "Old Army Footlocker",
    });
    K.note(ctx, "pev_reel_mcs_2066", -2.3, CY + 0.03, -18.2, {
      type: "tape",
      name: 'Tape reel: "Wishbones, 1965"',
      title: "Recorded at the bar, Nov 1965",
      text: "[Bar noise. Glasses. Somebody singing badly.]\n\nDECK (twenty-odd years younger, hair still red): Alright, alright! Tradition! You eat the turkey, you hang the bone. When you come home from Vietnam, you take it down. Not before.\n\nFINNEGAN: And if we don't come home?\n\nDECK: Then it stays up there forever and I dust around it. Two lights, Finn?\n\nFINNEGAN: Two lights.\n\n[Twenty-three voices, counting wishbones onto the lamp. The tape runs out at nineteen.]",
    });
    // ================================================= doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pev_mcs_in",
      pos: new THREE.Vector3(wx(DOOR_X), 1.3, wz(FZ + 0.45)),
      label: "O'Rourke's Old Ale House",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("orourkes")),
    });
    K.door(ctx, {
      id: "pev_mcs_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "East 7th Street",
      verb: "Leave",
      target: { x: wx(DOOR_X), y: 0, z: wz(FZ + 1.9), yaw: PI },
    });
    K.door(ctx, {
      id: "pev_mcs_hatch_out",
      pos: new THREE.Vector3(OX + lx, OY + CY + 1.4, OZ + lz),
      label: "Cellar Hatch",
      verb: "Climb",
      target: { x: wx(HATCH.x), y: 0, z: wz(HATCH.z + 1.2), yaw: PI },
      onEnter: () =>
        K.safe("hatch unlock", () => {
          if (!G.isStub("locks") && G.locks.unlock)
            G.locks.unlock("pev_lk_mcs_hatch");
        }),
    });
    K.door(ctx, {
      id: "pev_mcs_hatch_in",
      pos: new THREE.Vector3(wx(HATCH.x), 0.4, wz(HATCH.z)),
      label: "O'Rourke's Cellar Hatch",
      verb: "Open",
      lock: K.regLock({
        id: "pev_lk_mcs_hatch",
        label: "O'Rourke's Cellar Hatch",
        kind: "door",
        key: "pev_mcs_cellar_key",
        hint: "Deck gives you the hatch key with the cellar job; leaving by the hatch from inside unlocks it.",
      }),
      target: { x: OX + lx, y: OY + CY, z: OZ + lz - 0.9, yaw: HP },
    }); // at the ladder foot, facing west down the cellar (the brew kettle is due north)
    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "bartender", -3.625, 0, -6.2); // centred in the 0.65 m aisle between counter (x −3.3) and back bar (x −3.95)
    K.anchor(ctx, "merchant", -3.625, 0, -6.2);
    K.anchor(ctx, "npc1", -2.0, 0, -7.4); // Finnegan, at the bar
    K.anchor(ctx, "npc2", -0.3, 0, -17.8); // Abigail, back room long table
    K.anchor(ctx, "npc3", 3.3, 0, -9.0); // a regular
    K.anchor(ctx, "npc4", 0.1, 0, -3.3); // a dock worker
    K.anchor(ctx, "cook", -2.2, 0, -24.4);
    K.anchor(ctx, "stove", SX, 0, SZ);
    [
      [-1, CY, -19],
      [1.5, CY, -16],
      [-2, CY, -13],
      [2, CY, -10],
    ].forEach((p, i) => K.anchor(ctx, "roach" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "npc5", 1.45, 0, -15.3); // Harriet Vance once freed: far end of the long table, across from Abigail
    // hostile spawn spots (CONTRACT spawn1..6): ALL below stairs — cellar & cellar stair hall, where the
    // giant roach breach is. Never the bar room / back room: O'Rourke's is a friendly settlement.
    [
      [-2, CY, -18],
      [2, CY, -14],
      [-1, CY, -10],
      [3.4, CY, -25],
      [0.6, CY, -7.6],
      [-1.6, CY, -15.8],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    // friendly bar-room set: free patron seats (ambient/quest settlers) and the SAFE room box (no hostile spawns)
    [
      [2.4, -2.3],
      [2.4, -5.0],
      [-0.5, -10.8],
      [2.4, -11.8],
      [-0.25, -15.3],
      [1.45, -18.6],
    ].forEach((p, i) => K.anchor(ctx, "patron" + (i + 1), p[0], 0, p[1]));
    K.anchor(ctx, "safe", 0, 0, -6.5); // bar-room centre
    ctx.safeRooms = [
      {
        x0: O.x - 4.5,
        x1: O.x + 4.5,
        z0: O.z - 31,
        z1: O.z,
        y0: O.y - 0.5,
        y1: O.y + UP + 3.2,
      },
    ]; // bar, back room, kitchen, apartment
    K.anchor(ctx, "loot1", -4.1, UP, -16.8);
    K.anchor(ctx, "loot2", 3.6, CY, -7);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_orourkes_int";
  }

  /** Newspaper clipping cells (original headlines). */
