// play-inline-437 03 — tint
// Lines 36-1278 of readable/play-inline-437.pretty.js (statement-aligned).
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "tav_int",
      off: O,
      lit: true,
      amb: [0.07, 0.06, 0.05],
      floors: [CY, 0],
      grime: 0.4,
    });
    const r = K.rng("tav_int");
    const warm = [1, 0.76, 0.46],
      candle = [1, 0.62, 0.28],
      crystal = [1, 0.86, 0.62],
      fire = [1, 0.45, 0.15],
      tube = [0.85, 0.9, 0.82];
    const PANEL = [0.34, 0.2, 0.12],
      CREAM = [0.82, 0.78, 0.68],
      GREENC = [0.2, 0.36, 0.24];

    // ---------------------------------------------------------------- gaps
    K.gap(ctx, 0, -5, 2.4, 0, 3.0); // foyer → Crystal Room
    K.gap(ctx, 6, -9.5, 2.0, 0, 2.8); // Crystal Room → Chestnut Room
    K.gap(ctx, 6, -20, 1.3, 0, 2.4); // Crystal Room → kitchen (service)
    K.gap(ctx, 11, -14, 1.3, 0, 2.4); // bar → kitchen
    K.gap(ctx, 16, -6.2, 1.1, 0, 2.3); // behind the bar → Roz's office
    K.gap(ctx, 16, -18, 1.2, 0, 2.3); // kitchen → back stair (top)
    K.gap(ctx, 16, -23.45, 1.0, CY, 2.3); // back stair (bottom) → cellar

    // ================================================================ FOYER
    const FB = [-3.1, -0.3, -5.1, 3.1, 3.7, 0.1];
    K.room(b, ctx, {
      x0: -3,
      z0: -5,
      x1: 3,
      z1: 0,
      y: 0,
      h: 3.6,
      floor: "parquet",
      fc: [0.5, 0.38, 0.28],
      wall: "wallpaper_green",
      wc: [0.62, 0.7, 0.58],
      wain: "wood_dark",
      wainC: PANEL,
      wainH: 1.2,
      ceil: "tin",
      cc: [0.62, 0.56, 0.44],
      cornice: true,
      corniceMat: "wood_dark",
      surface: "carpet",
    });
    b.boxMM("wood_dark", -0.95, 0, -0.12, 0.95, 2.7, -0.08, {
      tint: [0.24, 0.3, 0.22],
    });
    b.hplate("flat", 0, 0.012, -2.5, 1.2, 4.6, 0, null, { tint: GREENC }); // green runner
    b.hplate("flat", 0, 0.013, -2.5, 1.0, 4.4, 0, null, {
      tint: [0.14, 0.3, 0.2],
    });
    // maître d' podium + the reservation book (open at Mar 5, 1967)
    b.boxMM("mahogany", 1.3, 0, -3.9, 2.1, 1.12, -3.3, {
      tint: [0.36, 0.18, 0.1],
    });
    b.quadN(
      "mahogany",
      [1.25, 1.12, -3.3],
      [2.15, 1.12, -3.3],
      [2.15, 1.25, -3.95],
      [1.25, 1.25, -3.95],
      [0, 1, 0.2],
      { tint: [0.4, 0.2, 0.12] },
    );
    b.box("flat", 1.7, 1.2, -3.62, 0.5, 0.03, 0.36, {
      yaw: 0.1,
      tint: [0.88, 0.85, 0.74],
    });
    b.col(1.3, 0, -3.9, 2.1, 1.2, -3.3, { tag: "podium", surface: "wood" });
    b.box("lamp", 1.95, 1.22, -3.75, 0.06, 0.18, 0.06, { tint: warm });
    b.light(1.8, 1.6, -3.4, warm, 0.5, 3.5, { box: FB });
    b.glow(1.95, 1.4, -3.75, [1, 0.62, 0.3], 0.5);
    // coat check (west)
    b.boxMM("mahogany", -3, 0, -4.2, -2.1, 1.05, -1.4, {
      tint: [0.36, 0.18, 0.1],
    });
    b.col(-3, 0, -4.2, -2.1, 1.05, -1.4, { tag: "counter", surface: "wood" });
    b.pipe("brass", -2.8, 2.1, -4.0, -2.8, 2.1, -1.6, 0.02, 5);
    for (let k = 0; k < 5; k++) {
      const z = -3.8 + k * 0.5;
      b.pipe("black_iron", -2.8, 2.1, z, -2.8, 2.0, z, 0.005, 3);
      if (k % 2 === 0)
        b.box("fabric", -2.8, 1.25, z, 0.12, 0.8, 0.45, {
          tint: r.pick([
            [0.3, 0.26, 0.2],
            [0.45, 0.2, 0.15],
            [0.22, 0.24, 0.3],
          ]),
        });
    }
    b.plate(
      "art",
      -2.08,
      1.35,
      -2.8,
      1,
      0,
      0.8,
      0.2,
      K.signCell("ppk_coatcheck", "COAT CHECK", 200, 50, {
        bg: "#1a2a1e",
        fg: "#d8c890",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    K.loot(ctx, "footlocker", -2.55, 0, -2.2, HP, {
      loot: "luggage",
      name: "Unclaimed Coats (since 1967)",
    });
    // the wall of signed photographs
    for (let k = 0; k < 10; k++)
      K.framed(
        b,
        2.9,
        1.5 + (k % 2) * 0.62,
        -0.6 - Math.floor(k / 2) * 0.5,
        -1,
        0,
        0.36,
        0.46,
        K.photo("deli", 20 + k),
        { frame: "black_iron", fw: 0.025 },
      );
    b.plate(
      "art",
      0,
      3.15,
      -4.88,
      0,
      1,
      2.6,
      0.34,
      K.signCell("ppk_crystal_room", "THE CRYSTAL ROOM", 480, 60, {
        bg: null,
        fg: "#e0c070",
        font: "Georgia, serif",
      }),
      { off: 0.03 },
    );
    K.lamp(b, 0, 2.9, -2.5, "globe", warm, 0.8, 5, {
      ceil: 3.6,
      size: 0.14,
      lightOpts: { box: FB },
    });

    // ================================================================ THE CRYSTAL ROOM
    const CR = [-14.1, -0.3, -24.1, 6.1, 6.1, -4.9];
    K.room(b, ctx, {
      x0: -14,
      z0: -24,
      x1: 6,
      z1: -5,
      y: 0,
      h: 6,
      floor: "parquet",
      fc: [0.52, 0.4, 0.3],
      wall: "plaster",
      wc: [0.8, 0.76, 0.66],
      wain: "wood_dark",
      wainC: PANEL,
      wainH: 1.0,
      ceil: "paint_black",
      cc: [0.08, 0.08, 0.1],
      cornice: true,
      corniceMat: "plaster",
      surface: "wood",
    });
    // the glass walls: night garden beyond dark glass, white steel mullions
    const glassWall = (ax, az, bx, bz, nx, nz, n) => {
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const bay = len / n;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) * bay,
          px = ax + ux * t + nx * 0.12,
          pz = az + uz * t + nz * 0.12;
        b.plate("glass", px, 3.35, pz, nx, nz, bay - 0.06, 4.9, null, {
          tint: [0.03, 0.04, 0.06],
          off: 0.0,
        });
        b.plate(
          "neon",
          px,
          3.35,
          pz,
          nx,
          nz,
          bay - 0.1,
          4.8,
          K.nightGarden(i % 5, "neon"),
          { tint: [0.85, 0.8, 0.7], off: 0.01 },
        );
      }
      for (let i = 0; i <= n; i++) {
        const t = i * bay;
        const px = ax + ux * t + nx * 0.14,
          pz = az + uz * t + nz * 0.14;
        b.box("paint_white", px, 0.9, pz, 0.14, 4.95, 0.14, {
          tint: [0.82, 0.82, 0.78],
        });
      }
      for (const y of [0.9, 2.5, 4.2, 5.85])
        b.beam(
          "paint_white",
          ax + nx * 0.14,
          y,
          az + nz * 0.14,
          bx + nx * 0.14,
          y,
          bz + nz * 0.14,
          0.12,
          0.1,
          { tint: [0.82, 0.82, 0.78] },
        );
    };
    glassWall(-14, -23.2, -14, -5.8, 1, 0, 7);
    glassWall(-13.2, -24, 0.2, -24, 0, 1, 5);
    // stained-glass ceiling panels between white steel beams
    const stained = (i) =>
      K.paint("pics", "ppk_stained_" + i, 128, 128, function (x, X, Y, W2, H2) {
        const rr = K.rng("stg" + i);
        const cols = [
          "#3a6a8a",
          "#8a2a3a",
          "#c8a040",
          "#3a7a4a",
          "#6a4a8a",
          "#d8d0b0",
        ];
        x.fillStyle = "#d8d0b0";
        x.fillRect(X, Y, W2, H2);
        for (let k = 0; k < 16; k++) {
          x.fillStyle = cols[(k + i) % cols.length];
          const cx = X + (((k % 4) + 0.5) * W2) / 4,
            cy = Y + ((Math.floor(k / 4) + 0.5) * H2) / 4;
          x.beginPath();
          x.moveTo(cx, cy - H2 / 9);
          x.lineTo(cx + W2 / 9, cy);
          x.lineTo(cx, cy + H2 / 9);
          x.lineTo(cx - W2 / 9, cy);
          x.fill();
        }
        x.strokeStyle = "#1a1a14";
        x.lineWidth = 3;
        for (let k = 0; k <= 4; k++) {
          x.beginPath();
          x.moveTo(X + (k * W2) / 4, Y);
          x.lineTo(X + (k * W2) / 4, Y + H2);
          x.stroke();
          x.beginPath();
          x.moveTo(X, Y + (k * H2) / 4);
          x.lineTo(X + W2, Y + (k * H2) / 4);
          x.stroke();
        }
        K.stains(x, X, Y, W2, H2, 5, i + 3, 0.35, [40, 30, 20]);
        void rr;
      });
    for (let ix = 0; ix < 5; ix++)
      for (let iz = 0; iz < 4; iz++) {
        const x0 = -13 + ix * 3.6,
          z0 = -23 + iz * 4.4;
        if (r() < 0.12) continue; // a few panels boarded over
        b.face("pics", x0 + 0.1, 5.96, z0 + 0.1, 1, 0, 0, 0, 0, 1, 3.4, 4.2, {
          rect: stained((ix + iz) % 4),
          uv: "rect",
          tint: [0.9, 0.86, 0.78],
          grime: 0.2,
        });
      }
    for (let x = -13; x <= 5.1; x += 3.6)
      b.beam("paint_white", x, 5.9, -23.9, x, 5.9, -5.1, 0.16, 0.18, {
        tint: [0.82, 0.82, 0.78],
      });
    for (let z = -23; z <= -5; z += 4.4)
      b.beam("paint_white", -13.9, 5.9, z, 5.9, 5.9, z, 0.16, 0.18, {
        tint: [0.82, 0.82, 0.78],
      });
    // chandeliers
    for (const [x, z] of [
      [-9, -10],
      [-9, -19],
      [-4, -14.5],
      [1, -10],
      [1, -19],
    ])
      K.chandelier(b, x, 4.2, z, 0.9, {
        ceil: 6,
        intensity: 1.05,
        radius: 9,
        color: crystal,
        lightOpts: { box: CR },
        glowSize: 3.6,
      });
    // mirrored columns
    for (const [x, z] of [
      [-9.5, -12],
      [-9.5, -17],
      [0.5, -12],
      [0.5, -17],
    ]) {
      b.box("chrome", x, 0, z, 0.7, 6, 0.7, {
        tint: [0.75, 0.78, 0.8],
        grime: 0.25,
      });
      b.box("gold", x, 0, z, 0.84, 0.3, 0.84, { tint: [0.6, 0.5, 0.3] });
      b.box("gold", x, 5.7, z, 0.84, 0.3, 0.84, { tint: [0.6, 0.5, 0.3] });
      b.col(x - 0.42, 0, z - 0.42, x + 0.42, 6, z + 0.42, {
        tag: "column",
        walkable: false,
      });
    }
    // dance floor inlay + tables in white linen
    b.face("checker", -6.6, 0.012, -11.2, 1, 0, 0, 0, 0, -1, 5.2, 6.6, {
      uv: "top",
      tint: [0.9, 0.86, 0.8],
    });
    const tables = [
      [-12, -7.5],
      [-12, -12.5],
      [-12, -17.5],
      [-11.2, -22],
      [-5.6, -8.0],
      [-2.2, -7.4],
      [3.4, -7.4],
      [3.8, -13.8],
      [-3.4, -21.6],
      [-7.6, -22],
    ];
    tables.forEach(([x, z], i) => {
      const t = K.roundTable(b, x, 0, z, 0.6, {
        mat: "wood_dark",
        cloth: [0.86, 0.84, 0.78],
      });
      for (let k = 0; k < 4; k++) {
        const a = (k / 4) * PI * 2 + i * 0.4;
        if (i === 0 && k === 1) continue;
        K.chair(
          b,
          x + Math.cos(a) * 0.95,
          0,
          z + Math.sin(a) * 0.95,
          -a - HP + PI,
          {
            mat: "paint_white",
            tint: [0.78, 0.76, 0.7],
            seatMat: "velvet",
            seatTint: [0.45, 0.12, 0.1],
            fallen: i === 7 && k === 2,
          },
        );
      }
      b.cyl("glass", x, t, z, 0.04, 0.05, 0.16, 6, { tint: [0.75, 0.6, 0.35] });
      b.glow(x, t + 0.24, z, [1, 0.6, 0.25], 0.45);
      if (i % 3 === 0) {
        b.cyl("ceramic", x - 0.25, t, z + 0.15, 0.14, 0.12, 0.02, 10);
        b.cyl("glass", x + 0.2, t, z - 0.2, 0.03, 0.035, 0.18, 6, {
          tint: [0.5, 0.2, 0.2],
        });
      }
    });
    // bandstand (NE corner): stage, upright piano, mic, backdrop, two coloured stage lamps
    b.boxMM("wood_dark", 0.4, 0, -23.9, 5.9, 0.35, -19.4, {
      tint: PANEL,
      faces: "nsewt",
    });
    b.col(0.4, 0, -23.9, 5.9, 0.35, -19.4, { tag: "stage", surface: "wood" });
    K.stairs(b, 1.2, -19.4, 2.4, -18.6, 0, 0.35, "-z", {
      mat: "wood_dark",
      tint: PANEL,
    });
    b.boxMM("wood_dark", 4.1, 0.35, -23.8, 5.8, 1.65, -23.2, {
      tint: [0.14, 0.09, 0.06],
    });
    b.boxMM("wood_dark", 4.1, 1.0, -23.2, 5.8, 1.08, -22.9, {
      tint: [0.14, 0.09, 0.06],
    });
    for (let k = 0; k < 20; k++)
      b.box(
        k % 3 === 1 ? "paint_black" : "ceramic",
        4.15 + k * 0.08,
        1.07,
        -23.05,
        0.06,
        0.03,
        0.2,
        { tint: k % 3 === 1 ? [0.05, 0.05, 0.05] : [0.86, 0.82, 0.7] },
      );
    b.col(4.1, 0.35, -23.8, 5.8, 1.65, -22.9, { tag: "piano" });
    b.pipe("steel", 2.6, 0.35, -21.2, 2.6, 1.9, -21.2, 0.012, 4);
    b.geo("steel", K.sphereGeo(), {
      x: 2.6,
      y: 1.95,
      z: -21.2,
      s: 0.05,
      tint: [0.3, 0.3, 0.3],
    });
    b.cyl("steel", 2.6, 0.35, -21.2, 0.15, 0.15, 0.02, 8);
    b.plate(
      "art",
      3.1,
      3.2,
      -23.85,
      0,
      1,
      5.0,
      2.2,
      K.signCell("ppk_bandstand", "Tavern on the Green", 512, 220, {
        bg: "#1a3a26",
        fg: "#e8d090",
        font: "Brush Script MT, Segoe Script, cursive",
        italic: true,
        weight: "normal",
        border: "#c8a850",
      }),
      { off: 0.03 },
    );
    for (const [x, c] of [
      [1.2, [1, 0.35, 0.3]],
      [5.2, [0.4, 0.55, 1]],
    ]) {
      b.cyl("metal_dark", x, 5.3, -19.6, 0.14, 0.18, 0.3, 8, {
        tint: [0.2, 0.2, 0.2],
      });
      b.pipe("black_iron", x, 5.6, -19.6, x, 6, -19.6, 0.02, 3);
      b.light(x, 2.2, -21.4, c, 0.55, 4.5, { box: CR });
      b.glow(
        x,
        5.28,
        -19.55,
        c.map((v) => v * 0.7),
        0.8,
      );
    }
    // buffet along the south wall (the settlement's supper) + a sweep of mirror panels
    const bf = K.table(b, -9.6, 0, -5.8, 5.4, 0.8, {
      mat: "wood_dark",
      tint: PANEL,
      h: 0.9,
    });
    b.boxMM("cloth_white", -12.35, 0.4, -6.25, -6.85, bf, -5.35, {
      tint: [0.86, 0.84, 0.78],
    });
    for (let k = 0; k < 6; k++) {
      const x = -11.8 + k * 0.95;
      b.cyl("steel", x, bf, -5.8, 0.26, 0.22, 0.12, 10, {
        tint: [0.7, 0.7, 0.68],
      });
      b.geo("flat", K.sphereGeo(), {
        x,
        y: bf + 0.12,
        z: -5.8,
        sx: 0.2,
        sy: 0.07,
        sz: 0.2,
        tint: r.pick([
          [0.55, 0.3, 0.15],
          [0.6, 0.5, 0.25],
          [0.35, 0.45, 0.2],
          [0.7, 0.4, 0.25],
        ]),
      });
    }
    for (let k = 0; k < 4; k++)
      b.plate("chrome", -8.5 - k * 1.3, 3.2, -5.1, 0, -1, 1.1, 3.0, null, {
        tint: [0.6, 0.65, 0.66],
        off: 0.02,
      });
    K.litter(b, -13, -23, 5, -6, 0, 8, 7201);

    // ================================================================ THE CHESTNUT ROOM (bar)
    const BB = [5.9, -0.3, -14.1, 16.1, 3.9, -4.9];
    K.room(b, ctx, {
      x0: 6,
      z0: -14,
      x1: 16,
      z1: -5,
      y: 0,
      h: 3.8,
      floor: "wood",
      fc: [0.46, 0.34, 0.24],
      wall: "wood_dark",
      wc: [0.44, 0.28, 0.16],
      ceil: "wood_dark",
      cc: [0.3, 0.2, 0.12],
      cornice: true,
      corniceMat: "wood_dark",
      surface: "wood",
    });
    for (let x = 7.2; x < 16; x += 1.8)
      b.beam("wood", x, 3.62, -13.9, x, 3.62, -5.1, 0.24, 0.3, {
        tint: [0.46, 0.3, 0.18],
      });
    // the counter (open at the south end so Roz can get out), back bar, mirror, bottles
    const cx0 = 13.5,
      cx1 = 14.2,
      cz0 = -13.2,
      cz1 = -7.6;
    b.boxMM("mahogany", cx0, 0, cz0, cx1, 1.08, cz1, {
      tint: [0.4, 0.2, 0.11],
    });
    b.boxMM(
      "mahogany",
      cx0 - 0.14,
      1.08,
      cz0 - 0.05,
      cx1 + 0.05,
      1.14,
      cz1 + 0.05,
      { tint: [0.46, 0.24, 0.13] },
    );
    for (let z = cz0 + 0.45; z < cz1; z += 0.92)
      b.boxMM("mahogany", cx0 - 0.03, 0.14, z - 0.36, cx0, 0.95, z + 0.36, {
        tint: [0.34, 0.17, 0.1],
      });
    b.pipe("brass", cx0 - 0.28, 0.18, cz0, cx0 - 0.28, 0.18, cz1, 0.03, 6);
    b.col(cx0 - 0.14, 0, cz0 - 0.05, cx1 + 0.05, 1.14, cz1 + 0.05, {
      tag: "counter",
      surface: "wood",
    });
    b.boxMM("mahogany", 15.3, 0, -13.6, 15.9, 0.95, -8.2, {
      tint: [0.34, 0.17, 0.1],
    });
    b.boxMM("mahogany", 15.6, 0.95, -13.6, 15.9, 3.2, -8.2, {
      tint: [0.32, 0.16, 0.09],
    });
    b.plate("chrome", 15.58, 1.9, -10.9, -1, 0, 4.4, 1.2, null, {
      tint: [0.6, 0.64, 0.66],
      off: 0.0,
    });
    for (const yy of [1.35, 2.55])
      b.boxMM("mahogany", 15.3, yy, -13.6, 15.9, yy + 0.05, -8.2, {
        tint: [0.42, 0.22, 0.12],
      });
    for (const yy of [0.95, 1.4, 2.6])
      for (let z = -13.4; z < -8.4; z += 0.16) {
        if (r() < 0.35) continue;
        b.cyl("glass", 15.45, yy, z, 0.04, 0.04, 0.22 + r() * 0.12, 6, {
          tint: r.pick([
            [0.3, 0.45, 0.25],
            [0.55, 0.3, 0.12],
            [0.75, 0.7, 0.5],
            [0.2, 0.2, 0.3],
            [0.6, 0.15, 0.1],
          ]),
        });
      }
    b.col(15.3, 0, -13.6, 15.9, 3.2, -8.2, {});
    for (let k = 0; k < 6; k++) {
      const z = -12.6 + k * 0.95;
      b.cyl("brass", cx0 - 0.65, 0, z, 0.04, 0.04, 0.72, 6);
      b.cyl("leather_red", cx0 - 0.65, 0.72, z, 0.2, 0.2, 0.08, 10, {
        tint: [0.3, 0.4, 0.26],
      });
    }
    b.box("brass", 14.0, 1.14, -8.6, 0.4, 0.3, 0.3, { tint: [0.7, 0.55, 0.3] }); // cash register
    for (let k = 0; k < 4; k++)
      b.cyl("glass", cx0 + 0.15, 1.14, -12.5 + k * 1.2, 0.035, 0.03, 0.12, 6, {
        tint: [0.8, 0.75, 0.6],
      });
    b.plate(
      "art",
      15.88,
      3.45,
      -10.9,
      -1,
      0,
      3.4,
      0.4,
      K.signCell(
        "ppk_roz_sign",
        "TAVISH TRADING · BUY · SELL · SWAP",
        640,
        72,
        { bg: "#1a2a1e", fg: "#e8d090", font: "Georgia, serif" },
      ),
      { off: 0.03 },
    );
    // fireplace (south wall) with the two-headed "sheep" over it
    b.boxMM("brick_red", 9.6, 0, -5.6, 12.4, 1.5, -5.0, {
      tint: [0.5, 0.3, 0.24],
    });
    b.boxMM("paint_black", 10.3, 0.12, -5.62, 11.7, 1.05, -5.6, {
      tint: [0.02, 0.02, 0.02],
    });
    b.boxMM("wood_dark", 9.4, 1.5, -5.75, 12.6, 1.62, -5.0, { tint: PANEL });
    b.plate("lamp", 11, 0.42, -5.64, 0, -1, 1.2, 0.5, null, { tint: fire });
    for (let k = 0; k < 3; k++)
      b.beam(
        "wood",
        10.5 + k * 0.4,
        0.2,
        -5.4,
        10.6 + k * 0.4,
        0.28,
        -5.8,
        0.1,
        0.1,
        { tint: [0.35, 0.22, 0.12] },
      );
    b.light(11, 0.8, -6.4, fire, 1.2, 6, { box: BB });
    b.glow(11, 0.5, -5.7, [1, 0.45, 0.12], 1.8);
    b.col(9.4, 0, -5.75, 12.6, 1.62, -5.0, { tag: "fireplace" });
    b.box("wood_dark", 11, 2.1, -5.12, 0.8, 0.9, 0.12, { tint: PANEL });
    for (const e of [-1, 1]) {
      b.geo("flat", K.sphereGeo(), {
        x: 11 + e * 0.2,
        y: 2.55,
        z: -5.4,
        sx: 0.14,
        sy: 0.16,
        sz: 0.24,
        tint: [0.45, 0.36, 0.28],
      });
      b.pipe(
        "bone",
        11 + e * 0.2,
        2.72,
        -5.35,
        11 + e * 0.38,
        2.9,
        -5.25,
        0.02,
        4,
        { tint: [0.8, 0.76, 0.64] },
      );
    }
    b.plate(
      "art",
      11,
      1.8,
      -5.1,
      0,
      -1,
      1.1,
      0.16,
      K.signCell("ppk_sheep_plaque", '"THE LAST SHEEP", 1934', 256, 40, {
        bg: "#c8a850",
        fg: "#2a1a10",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    // jukebox (glowing arch), two tables
    b.boxMM("wood_dark", 6.3, 0, -13.8, 7.3, 1.5, -13.2, {
      tint: [0.3, 0.16, 0.1],
    });
    b.geo("wood_dark", K.unitCyl(12), {
      x: 6.8,
      y: 1.5,
      z: -13.5,
      sx: 0.5,
      sy: 0.6,
      sz: 0.3,
      rx: HP,
      tint: [0.3, 0.16, 0.1],
    });
    b.plate("lamp", 6.8, 1.1, -13.19, 0, 1, 0.7, 0.6, null, {
      tint: [1, 0.55, 0.25],
    });
    b.plate("lamp", 6.8, 1.6, -13.19, 0, 1, 0.5, 0.3, null, {
      tint: [0.4, 0.8, 1],
    });
    b.light(6.8, 1.3, -12.6, [1, 0.6, 0.35], 0.5, 3.5, { box: BB });
    b.glow(6.8, 1.35, -13.1, [1, 0.5, 0.3], 1.0);
    b.col(6.3, 0, -13.8, 7.3, 1.8, -13.2, { tag: "jukebox" });
    for (const [x, z] of [
      [8.6, -8.2],
      [9.2, -11.6],
    ]) {
      K.roundTable(b, x, 0, z, 0.45, { mat: "wood_dark", tint: PANEL });
      for (let k = 0; k < 2; k++)
        K.chair(b, x + (k ? 0.7 : -0.7), 0, z, k ? HP : -HP, {
          mat: "wood_dark",
        });
      b.cyl("glass", x, 0.76, z, 0.04, 0.04, 0.12, 6, {
        tint: [0.7, 0.55, 0.3],
      });
    }
    for (const [x, z] of [
      [8, -5.12],
      [14, -5.12],
    ]) {
      b.box("brass", x, 2.0, z - 0.08, 0.1, 0.28, 0.1, {
        tint: [0.7, 0.55, 0.3],
      });
      b.cyl("glass", x, 2.2, z - 0.2, 0.08, 0.12, 0.16, 8, {
        tint: [0.9, 0.6, 0.3],
      });
      b.light(x, 2.2, z - 0.6, warm, 0.5, 4, { box: BB });
      b.glow(x, 2.25, z - 0.22, [1, 0.62, 0.3], 0.7);
    }
    K.lamp(b, 14.9, 3.1, -10.9, "pendant", warm, 0.8, 5, {
      ceil: 3.8,
      shade: "paint_green",
      lightOpts: { box: BB },
    });
    K.lamp(b, 10, 3.1, -9.5, "pendant", warm, 0.6, 5, {
      ceil: 3.8,
      shade: "paint_green",
      lightOpts: { box: BB },
    });
    // the Chestnut Room was the dim one: a small brass chandelier over the tables, warm back-bar light behind Roz,
    // and two more green-shaded pendants along the counter (so the trader reads from the doorway)
    K.chandelier(b, 9.4, 2.85, -9.4, 0.5, {
      ceil: 3.8,
      tiers: 1,
      intensity: 1.0,
      radius: 7,
      lightOpts: { box: BB, wrap: 0.5 },
    });
    b.light(15.4, 2.0, -10.2, [1, 0.72, 0.42], 0.9, 5.5, { box: BB });
    b.light(12.2, 2.4, -7.2, warm, 0.55, 6, { box: BB });
    for (const z of [-8.2, -12.8])
      K.lamp(b, 13.6, 2.9, z, "pendant", warm, 0.55, 4.5, {
        ceil: 3.8,
        shade: "paint_green",
        lightOpts: { box: BB },
      });
    b.hplate(
      "decal",
      10,
      0.012,
      -9.8,
      3.0,
      2.0,
      0,
      K.paint("art", "ppk_bar_rug", 256, 160, function (x, X, Y, W2, H2) {
        x.fillStyle = "#3a1a14";
        x.fillRect(X, Y, W2, H2);
        x.strokeStyle = "#c8a050";
        x.lineWidth = 6;
        x.strokeRect(X + 10, Y + 10, W2 - 20, H2 - 20);
        x.fillStyle = "#1e3a2a";
        x.fillRect(X + 30, Y + 30, W2 - 60, H2 - 60);
        K.stains(x, X, Y, W2, H2, 12, 5, 0.5, [30, 20, 10]);
      }),
    );

    // ================================================================ KITCHEN
    const KB = [5.9, -0.3, -24.1, 16.1, 3.7, -13.9];
    K.room(b, ctx, {
      x0: 6,
      z0: -24,
      x1: 16,
      z1: -14,
      y: 0,
      h: 3.6,
      floor: "hextile",
      fc: [0.6, 0.58, 0.52],
      wall: "tile",
      wc: [0.72, 0.72, 0.66],
      ceil: "plaster",
      cc: [0.5, 0.48, 0.42],
    });
    // the range (north wall) with lit burners, the hood, hanging pots
    b.boxMM("cast_iron", 7, 0, -23.9, 11.4, 0.92, -23.0, {
      tint: [0.22, 0.21, 0.2],
    });
    b.col(7, 0, -23.9, 11.4, 0.92, -23.0, { tag: "range", surface: "metal" });
    for (let k = 0; k < 4; k++) {
      b.cyl("black_iron", 7.6 + k * 1.1, 0.92, -23.45, 0.2, 0.2, 0.03, 10);
      if (k !== 2) {
        b.geo("lamp", new THREE.TorusGeometry(0.12, 0.02, 3, 10), {
          x: 7.6 + k * 1.1,
          y: 0.96,
          z: -23.45,
          rx: HP,
          tint: [0.3, 0.5, 1],
        });
      }
    }
    b.plate("lamp", 9.2, 0.45, -22.98, 0, 1, 2.0, 0.28, null, { tint: fire });
    b.light(9.2, 1.2, -22.2, fire, 0.9, 5, { box: KB });
    b.quadN(
      "steel",
      [6.9, 2.0, -22.7],
      [11.5, 2.0, -22.7],
      [11.5, 2.7, -23.95],
      [6.9, 2.7, -23.95],
      [0, -0.6, 1],
      { tint: [0.6, 0.6, 0.58] },
    );
    b.pipe("steel", 7, 2.3, -22.9, 11.4, 2.3, -22.9, 0.02, 4);
    for (let k = 0; k < 6; k++) {
      const x = 7.3 + k * 0.72;
      b.pipe("steel", x, 2.3, -22.9, x, 1.95, -22.9, 0.006, 3);
      b.cyl("copper", x, 1.7, -22.9, 0.14 + (k % 3) * 0.03, 0.12, 0.2, 8, {
        tint: [0.72, 0.45, 0.28],
      });
    }
    for (let k = 0; k < 3; k++)
      b.cyl("steel", 7.7 + k * 1.6, 0.95, -23.4, 0.2, 0.18, 0.25, 10, {
        tint: [0.6, 0.6, 0.58],
      });
    // prep island, meat hooks with pack oxen sides, pantry shelves, the icebox, sinks
    const pt = K.table(b, 10.5, 0, -18.8, 3.0, 1.1, {
      mat: "steel",
      tint: [0.62, 0.62, 0.6],
      h: 0.92,
    });
    for (let k = 0; k < 7; k++)
      b.geo("flat", K.sphereGeo(), {
        x: 9.4 + r() * 2.2,
        y: pt + 0.05,
        z: -19.2 + r() * 0.8,
        s: 0.06,
        tint: r.pick([
          [0.8, 0.4, 0.2],
          [0.55, 0.6, 0.3],
          [0.85, 0.75, 0.55],
        ]),
      });
    b.box("wood", 11.4, pt, -18.6, 0.6, 0.05, 0.4, { tint: [0.6, 0.5, 0.36] });
    b.box("steel", 11.4, pt + 0.06, -18.6, 0.3, 0.01, 0.05, {
      tint: [0.8, 0.8, 0.78],
    });
    b.pipe("steel", 12.3, 3.1, -21.8, 14.6, 3.1, -21.8, 0.03, 5);
    for (let k = 0; k < 3; k++) {
      const x = 12.6 + k * 0.9;
      b.pipe("steel", x, 3.1, -21.8, x, 2.6, -21.8, 0.01, 3);
      b.geo("meat", K.sphereGeo(), {
        x,
        y: 2.05,
        z: -21.8,
        sx: 0.28,
        sy: 0.55,
        sz: 0.2,
        tint: [0.62, 0.26, 0.2],
      });
      b.geo("bone", K.sphereGeo(), {
        x,
        y: 2.55,
        z: -21.8,
        s: 0.07,
        tint: [0.85, 0.8, 0.66],
      });
    }
    for (let k = 0; k < 3; k++)
      K.shelf(b, 6.3, 0, -15.2 - k * 1.3, HP, 1.2, {
        h: 2.2,
        d: 0.45,
        mat: "wood",
        tint: [0.5, 0.4, 0.28],
        items: ["can", "jar", "box", "bottle"],
        seed: 220 + k,
      });
    b.boxMM("steel", 14.6, 0, -16.9, 15.9, 0.92, -14.2, {
      tint: [0.62, 0.62, 0.6],
    });
    b.col(14.6, 0, -16.9, 15.9, 0.92, -14.2, {});
    for (const z of [-15.9, -15.0])
      b.boxMM("steel", 14.8, 0.72, z - 0.35, 15.7, 0.9, z + 0.35, {
        tint: [0.4, 0.42, 0.42],
      });
    K.lamp(b, 10.5, 3.0, -18.8, "tube", tube, 0.9, 7, {
      ceil: 3.6,
      len: 1.6,
      lightOpts: { box: KB },
    });
    K.lamp(b, 13.5, 3.0, -21.5, "tube", tube, 0.6, 5, {
      ceil: 3.6,
      len: 1.2,
      lightOpts: { box: KB },
    });
    b.plate(
      "art",
      6.12,
      2.3,
      -21.5,
      1,
      0,
      1.3,
      0.9,
      K.signCell(
        "ppk_menu",
        'TONIGHT\nRack of Pack oxen · 18 scrip\nShellback Thermidor · 22 scrip\nTato Gratin · 5 scrip\nThe "King Kong" (don\'t) · 40 scrip',
        260,
        180,
        { bg: "#1a1a1a", fg: "#e8dcb8", font: "Georgia, serif" },
      ),
    );
    K.loot(ctx, "fridge", 15.4, 0, -22.6, -HP, {
      loot: "fridge",
      owner: "settlers",
      name: "Walk-in Icebox",
    });
    b.plate(
      "art",
      15.88,
      2.6,
      -18,
      -1,
      0,
      1.0,
      0.3,
      K.signCell("ppk_cellar", "CELLAR ▼", 200, 60, {
        bg: "#1a1a18",
        fg: "#e8dcb8",
        font: "Arial, sans-serif",
      }),
      { off: 0.03 },
    );
    K.litter(b, 6.5, -23, 15.5, -14.5, 0, 6, 7202);

    // ================================================================ BACK STAIR → CELLAR
    const SB = [15.9, CY - 0.3, -24.1, 18.1, 3.7, -16.9];
    K.room(b, ctx, {
      x0: 16,
      z0: -24,
      x1: 18,
      z1: -17,
      y: CY,
      h: 7.0,
      noFloor: true,
      floor: "concrete",
      wall: "brick_red",
      wc: [0.5, 0.34, 0.28],
      ceil: "wood_dark",
      cc: PANEL,
      trim: false,
      casing: false,
    });
    b.boxMM("wood", 16, -0.3, -19, 18, 0, -17, {
      tint: [0.45, 0.34, 0.24],
      faces: "nsewtb",
    });
    b.col(16, -0.3, -19, 18, 0, -17, { tag: "landing", surface: "wood" });
    K.stairs(b, 16.1, -22.9, 17.9, -19, CY, 0, "+z", {
      mat: "wood",
      tint: [0.45, 0.34, 0.24],
      surface: "wood",
    });
    b.face("concrete", 16, CY, -19, 1, 0, 0, 0, 0, -1, 2, 5, {
      uv: "top",
      tint: [0.4, 0.38, 0.35],
    });
    b.col(16, CY - 0.3, -24, 18, CY, -19, {
      tag: "floor",
      surface: "concrete",
    });
    K.lamp(b, 17, 2.8, -18, "bulb", warm, 0.5, 4, {
      ceil: 3.6,
      lightOpts: { box: SB },
    });
    K.lamp(b, 17, -1.0, -22.5, "bulb", warm, 0.5, 4, {
      ceil: -0.3,
      lightOpts: { box: SB },
    });

    // ================================================================ THE CELLAR (sheepfold foundations)
    const CB = [5.9, CY - 0.3, -24.1, 16.1, CY + 3.1, -13.9];
    K.room(b, ctx, {
      x0: 6,
      z0: -24,
      x1: 16,
      z1: -14,
      y: CY,
      h: 3.0,
      floor: "concrete",
      fc: [0.48, 0.45, 0.4],
      wall: "granite",
      wc: [0.55, 0.52, 0.46],
      ceil: "wood_dark",
      cc: [0.28, 0.2, 0.14],
      trim: false,
      casing: false,
    });
    for (let x = 7.2; x < 16; x += 2.0)
      b.beam(
        "wood_dark",
        x,
        CY + 2.85,
        -23.9,
        x,
        CY + 2.85,
        -14.1,
        0.24,
        0.24,
        { tint: PANEL },
      );
    K.letters(b, 11, CY + 2.4, -23.9, 0, 1, 2.6, 0.4, "SHEEPFOLD · 1870", {
      fg: "#c8c0a8",
      font: "Georgia, serif",
      shadow: false,
    });
    // wine racks: a lattice of bottle ends on the west wall
    const rackCell = K.paint(
      "pics",
      "ppk_winerack",
      256,
      192,
      function (x, X, Y, W2, H2) {
        x.fillStyle = "#2a1a10";
        x.fillRect(X, Y, W2, H2);
        const n = 10,
          m = 8;
        for (let j = 0; j < m; j++)
          for (let i = 0; i < n; i++) {
            const cx = X + ((i + 0.5) * W2) / n,
              cy = Y + ((j + 0.5) * H2) / m;
            x.fillStyle = "#4a3020";
            x.fillRect(
              cx - W2 / n / 2 + 1,
              cy - H2 / m / 2 + 1,
              W2 / n - 2,
              H2 / m - 2,
            );
            if ((i * 7 + j * 3) % 5 === 0) continue;
            x.fillStyle = ["#1e3a1e", "#3a1414", "#2a2a14"][(i + j) % 3];
            x.beginPath();
            x.arc(cx, cy, (W2 / n) * 0.34, 0, PI * 2);
            x.fill();
            x.fillStyle = "rgba(255,240,200,0.35)";
            x.beginPath();
            x.arc(cx - 2, cy - 2, 2, 0, PI * 2);
            x.fill();
          }
        K.stains(x, X, Y, W2, H2, 8, 17, 0.5, [20, 15, 10]);
      },
    );
    for (const z of [-22.2, -19.4, -16.6]) {
      b.boxMM("wood_dark", 6.1, CY, z - 1.3, 6.6, CY + 2.2, z + 1.3, {
        tint: PANEL,
      });
      b.plate("pics", 6.62, CY + 1.1, z, 1, 0, 2.5, 2.1, rackCell, {
        off: 0.0,
        tint: [0.9, 0.85, 0.8],
      });
      b.col(6.1, CY, z - 1.3, 6.6, CY + 2.2, z + 1.3, { tag: "rack" });
    }
    // casks, bunks, crates, the workbench, shears and sheep bells
    for (let k = 0; k < 4; k++) {
      const x = 8.4 + k * 1.0;
      b.geo("wood", new THREE.CylinderGeometry(0.42, 0.42, 0.9, 12), {
        x,
        y: CY + 0.45,
        z: -23.3,
        rx: HP,
        tint: [0.5, 0.36, 0.24],
      });
      for (const s of [-0.3, 0.3])
        b.geo("rust", new THREE.TorusGeometry(0.43, 0.02, 4, 12), {
          x,
          y: CY + 0.45,
          z: -23.3 + s,
        });
    }
    b.col(7.9, CY, -23.8, 11.9, CY + 0.9, -22.8, { tag: "casks" });
    for (let k = 0; k < 3; k++) {
      const z = -15.2 - k * 2.1;
      K.bed(b, 14.9, CY, z, -HP, {
        w: 0.85,
        l: 1.9,
        tint: r.pick([
          [0.55, 0.5, 0.42],
          [0.45, 0.42, 0.5],
          [0.5, 0.35, 0.3],
        ]),
      });
    }
    K.loot(ctx, "footlocker", 13.6, CY, -15.2, HP, {
      loot: "footlocker",
      owner: "settlers",
      name: "Settler Footlocker",
    });
    for (let k = 0; k < 5; k++)
      b.box(
        "wood",
        12.6 + (k % 2) * 0.9,
        CY + (k >= 3 ? 0.7 : 0),
        -23.2 + Math.floor(k / 2) * 0.05,
        0.8,
        0.7,
        0.7,
        { yaw: r() * 0.2, tint: [0.5, 0.42, 0.3] },
      );
    b.col(12.1, CY, -23.7, 14.1, CY + 1.4, -22.7, { tag: "crates" });
    K.loot(ctx, "workbench", 9.6, CY, -14.6, PI, {});
    for (let k = 0; k < 3; k++) {
      const x = 12.6 + k * 0.6;
      b.pipe("black_iron", x, CY + 2.2, -14.12, x, CY + 1.8, -14.12, 0.006, 3);
      b.box("rust", x, CY + 1.45, -14.15, 0.12, 0.35, 0.04, {
        tint: [0.5, 0.42, 0.34],
      });
    }
    for (let k = 0; k < 4; k++) {
      const x = 8 + k * 0.5;
      b.pipe(
        "black_iron",
        x,
        CY + 2.75,
        -14.12,
        x,
        CY + 2.55,
        -14.12,
        0.005,
        3,
      );
      b.cyl("brass", x, CY + 2.35, -14.15, 0.07, 0.05, 0.18, 8, {
        tint: [0.6, 0.5, 0.3],
      });
    }
    for (const [x, z] of [
      [9, -18.5],
      [13, -19],
      [11, -15.4],
    ])
      K.lamp(b, x, CY + 2.4, z, "cage", warm, 0.85, 6.5, {
        ceil: CY + 2.85,
        lightOpts: { box: CB, wrap: 0.5 },
      });
    // an oil lantern on the workbench and candle-light by the bunks
    b.box("brass", 10.1, CY + 1.72, -14.16, 0.05, 0.05, 0.3, {
      tint: [0.6, 0.5, 0.3],
    });
    b.cyl("brass", 10.1, CY + 1.62, -14.32, 0.07, 0.08, 0.05, 8, {
      tint: [0.6, 0.5, 0.3],
    });
    b.cyl("glass", 10.1, CY + 1.67, -14.32, 0.06, 0.06, 0.16, 8, {
      tint: [1, 0.7, 0.35],
    });
    b.light(10.1, CY + 1.7, -14.9, [1, 0.62, 0.3], 0.55, 4, { box: CB });
    b.glow(10.1, CY + 1.75, -14.32, [1, 0.6, 0.28], 0.8);
    b.light(14.2, CY + 1.2, -17.3, candle, 0.4, 3.5, { box: CB });
    b.box("wood", 14.2, CY, -18.3, 0.4, 0.5, 0.4, { tint: [0.5, 0.42, 0.3] });
    b.cyl("ceramic", 14.2, CY + 0.5, -18.3, 0.03, 0.03, 0.12, 6, {
      tint: [0.9, 0.86, 0.7],
    });
    b.glow(14.2, CY + 0.66, -18.3, [1, 0.6, 0.25], 0.5);
    K.litter(b, 7, -23, 15, -14.5, CY, 8, 7203);

    // ================================================================ ROZ'S OFFICE
    const OB = [15.9, -0.3, -14.1, 21.1, 3.5, -4.9];
    K.room(b, ctx, {
      x0: 16,
      z0: -14,
      x1: 21,
      z1: -5,
      y: 0,
      h: 3.4,
      floor: "wood",
      fc: [0.46, 0.34, 0.24],
      wall: "wallpaper",
      wc: [0.7, 0.62, 0.52],
      wain: "wood_dark",
      wainC: PANEL,
      wainH: 1.0,
      ceil: "plaster",
      cc: [0.55, 0.52, 0.46],
      surface: "wood",
    });
    const od = K.table(b, 19.4, 0, -9.5, 1.0, 2.0, {
      mat: "wood_dark",
      tint: PANEL,
    });
    K.chair(b, 20.2, 0, -9.5, HP, { mat: "wood_dark" });
    K.terminal(ctx, "ppk_term_tavern", 19.3, od, -10.1, HP, null, "bare");
    b.box("flat", 19.3, od, -8.9, 0.35, 0.04, 0.45, {
      yaw: 0.2,
      tint: [0.3, 0.25, 0.2],
    }); // the ledger
    K.bed(b, 18.2, 0, -13.0, HP, { w: 0.85, l: 1.9, tint: [0.4, 0.5, 0.42] });
    K.loot(ctx, "safe", 20.6, 0, -6.2, -HP, {
      locked: 0,
      lock: PK.LOCKS.roz_safe,
      loot: "safe",
      owner: "settlers",
      name: "Roz's Safe",
    });
    K.framed(b, 16.12, 2.0, -9.5, 1, 0, 0.6, 0.8, K.photo("family", 11), {
      frame: "wood_dark",
    });
    K.framed(b, 20.88, 2.1, -11.8, -1, 0, 1.2, 0.8, K.parkMapCell(), {
      frame: "wood_dark",
    });
    K.lamp(b, 18.5, 2.8, -9.5, "bulb", warm, 0.7, 5, {
      ceil: 3.4,
      lightOpts: { box: OB },
    });
    b.cyl("glass", 19.8, od, -10.3, 0.05, 0.06, 0.18, 6, {
      tint: [0.9, 0.6, 0.3],
    });
    b.glow(19.8, od + 0.25, -10.3, [1, 0.6, 0.25], 0.4);

    // ================================================================ doors & anchors
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    const BYW = PK.TAV_BY || 0,
      D = PK.TAV_DOOR;
    K.door(ctx, {
      id: "ppk_tav_in",
      pos: new THREE.Vector3(D.x, BYW + 1.3, D.z + 0.25),
      label: "Tavern on the Green",
      verb: "Enter",
      target: { x: OX, y: OY, z: OZ - 1.4, yaw: 0 },
      onEnter: () => {
        PK.onEnter && PK.onEnter("tavern_on_green");
      },
    });
    K.door(ctx, {
      id: "ppk_tav_out",
      pos: new THREE.Vector3(OX, OY + 1.3, OZ - 0.3),
      label: "Central Park",
      verb: "Leave",
      target: { x: D.x, y: BYW, z: D.z + 3.0, yaw: PI },
    });

    K.anchor(ctx, "entrance", 0, 0, -1.4);
    K.anchor(ctx, "maitre_d", 1.7, 0, -2.9);
    K.anchor(ctx, "merchant", 14.9, 0, -10.6);
    K.anchor(ctx, "bartender", 14.9, 0, -10.6);
    K.anchor(ctx, "chef", 10.5, 0, -20.2);
    K.anchor(ctx, "singer", 3.0, 0.35, -21.6);
    K.anchor(ctx, "npc1", -12, 0, -8.45);
    K.anchor(ctx, "npc2", -3.4, 0, -20.6);
    K.anchor(ctx, "npc3", 12.85, 0, -10.4);
    K.anchor(ctx, "npc4", 10.4, CY, -17.6);
    K.anchor(ctx, "npc5", -6.6, 0, -14.5);
    [
      [0, 0, -12],
      [-10, 0, -20],
      [10, 0, -9],
      [10, 0, -19],
      [10, CY, -18],
      [-3, 0, -7],
    ].forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 13.6, CY, -15.2);
    K.anchor(ctx, "loot2", 20.6, 0, -6.2);
    K.anchor(ctx, "loot3", -2.55, 0, -2.2);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_tavern_int";
  }

