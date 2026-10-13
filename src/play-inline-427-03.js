// play-inline-427 03 — tint
// Lines 31-1421 of readable/play-inline-427.pretty.js (statement-aligned).
  PV.esInterior = function (ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "es_int",
      off: O,
      lit: true,
      amb: [0.2, 0.175, 0.155],
      floors: [0, 4.6, -3.6, -4.2],
      grime: 0.55,
    });
    const r = K.rng("es_int");
    const A = (name, x, y, z, yaw) => {
      const v = K.anchor(ctx, name, x, y, z);
      v.yaw = yaw || 0;
      return v;
    };
    const brick = [0.74, 0.58, 0.5],
      wood = [0.56, 0.42, 0.3];
    const X0 = -28,
      X1 = 5.6,
      Z0 = -14,
      Z1 = 14,
      H = 4.4,
      P1 = -16.8,
      P2 = -5.6;
    const HALL = [X0 - 0.5, -0.5, Z0 - 0.5, X1 + 0.5, H + 0.2, Z1 + 0.5];

    // ================================================= MARKET HALL shell
    K.gap(ctx, -11.2, Z1, 3.2, 0, 3.4, { casing: false }); // street doors
    for (const x of [P1, P2])
      for (const z of [-6.5, 6.5])
        K.gap(ctx, x, z, 4.6, 0, 3.5, { casing: false });
    // outer walls (brick, brownstone dado) — no floor (built with the stairwell hole) and a plank ceiling
    K.room(b, ctx, {
      x0: X0,
      z0: Z0,
      x1: X1,
      z1: Z1,
      y: 0,
      h: H,
      noFloor: true,
      floor: "planks_iron",
      wall: "brick_brown",
      wc: brick,
      wain: "brownstone",
      wainC: [0.62, 0.5, 0.42],
      wainH: 0.7,
      ceil: "wood",
      cc: [0.5, 0.4, 0.3],
      trimMat: "wood_dark",
      casing: false,
    });
    const floorAt = (x0, z0, x1, z1, y, mat, tint) => {
      b.face(mat, x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint,
      });
      b.col(x0, y - 0.3, z0, x1, y, z1, { tag: "floor", surface: "wood" });
    };
    // floor with the cellar stairwell hole (x −27.4..−25.6, z 2.6..11)
    floorAt(X0, Z0, X1, 2.6, 0, "planks_iron", [0.66, 0.58, 0.5]);
    floorAt(X0, 11, X1, Z1, 0, "planks_iron", [0.66, 0.58, 0.5]);
    floorAt(-25.6, 2.6, X1, 11, 0, "planks_iron", [0.66, 0.58, 0.5]);
    floorAt(X0, 2.6, -27.4, 11, 0, "planks_iron", [0.66, 0.58, 0.5]);
    // party walls with their big arched openings
    for (const x of [P1, P2]) {
      K.segWall(b, x, Z0, x, Z1, 0, H, 1, {
        mat: "brick_brown",
        tint: brick.map((v) => v * 0.95),
        both: true,
        gaps: [
          { t: 7.5, w: 4.6, y1: 3.5 },
          { t: 20.5, w: 4.6, y1: 3.5 },
        ],
        wain: "brownstone",
        wainC: [0.6, 0.48, 0.4],
        wainH: 0.7,
      });
      for (const zc of [-6.5, 6.5])
        for (let k = 0; k < 8; k++) {
          const t0 = -1 + (2 * k) / 8,
            t1 = -1 + (2 * (k + 1)) / 8;
          b.beam(
            "brick_dark",
            x,
            3.5 + 0.55 * (1 - t0 * t0) - 0.3,
            zc + t0 * 2.4,
            x,
            3.5 + 0.55 * (1 - t1 * t1) - 0.3,
            zc + t1 * 2.4,
            0.3,
            0.3,
            { tint: brick.map((v) => v * 0.8) },
          );
        }
    }
    // timber posts + girders + joists (each bay: 2 rows of posts)
    for (const [bx0, bx1] of [
      [X0, P1],
      [P1, P2],
      [P2, X1],
    ]) {
      for (let x = bx0 + 3.7; x < bx1 - 1; x += 3.7) {
        for (const z of [-4.5, 4.5]) {
          b.box("wood_dark", x, 0, z, 0.32, H - 0.35, 0.32, {
            tint: [0.42, 0.32, 0.22],
          });
          b.box("black_iron", x, H - 0.65, z, 0.5, 0.3, 0.5);
          b.col(x - 0.18, 0, z - 0.18, x + 0.18, H, z + 0.18, {
            tag: "post",
            walkable: false,
          });
        }
        b.beam("wood_dark", x, H - 0.25, Z0, x, H - 0.25, Z1, 0.34, 0.4, {
          tint: [0.42, 0.32, 0.22],
        });
      }
      for (let z = Z0 + 0.7; z < Z1; z += 1.1)
        b.beam(
          "wood_dark",
          bx0 + 0.1,
          H - 0.08,
          z,
          bx1 - 0.1,
          H - 0.08,
          z,
          0.1,
          0.14,
          { tint: [0.4, 0.3, 0.22] },
        );
    }
    // small shuttered windows (daylight slits) on the long walls
    for (let x = X0 + 2.2; x < X1; x += 3.7)
      for (const [z, nz] of [
        [Z0, 1],
        [Z1, -1],
      ]) {
        if (nz < 0 && Math.abs(x - -11.2) < 2.6) continue;
        // every opening is a real window now (frame, 2×3 lights, segmental brick head, bars on the river side); a third
        // still have one iron shutter leaf swung half across
        const shut = (Math.round(x) + (nz > 0 ? 1 : 0)) % 3 === 1;
        K.intWindow(b, x, 1.35, z + nz * 0.005, 0, nz, 1.05, 1.65, {
          cols: 2,
          rows: 3,
          frame: "wood_dark",
          frameTint: [0.3, 0.24, 0.18],
          sky: shut ? [0.42, 0.45, 0.44] : [0.62, 0.66, 0.64],
          arch: "brick_dark",
          archTint: brick.map((v) => v * 0.7),
          revealMat: "brick_brown",
          revealTint: brick.map((v) => v * 0.6),
          bars: nz > 0,
          light: shut ? 0.35 : 0.75,
          lightR: 6.5,
          box: HALL,
        });
        if (shut)
          b.quadN(
            "shutter",
            [x - 0.52, 1.35, z + nz * 0.24],
            [x + 0.02, 1.35, z + nz * 0.62],
            [x + 0.02, 3.0, z + nz * 0.62],
            [x - 0.52, 3.0, z + nz * 0.24],
            [0.6, 0, nz * 0.8],
            { tint: [0.7, 0.8, 0.72] },
          );
      }
    // the street doors (inside): folded iron doors, daylight spill
    b.quadN(
      "lamp",
      [-12.8, 0, Z1 - 0.12],
      [-9.6, 0, Z1 - 0.12],
      [-9.6, 3.4, Z1 - 0.12],
      [-12.8, 3.4, Z1 - 0.12],
      [0, 0, -1],
      { tint: [0.62, 0.64, 0.6] },
    );
    b.light(-11.2, 2.2, Z1 - 2, [0.78, 0.8, 0.78], 1.0, 9, { box: HALL });
    for (const e of [-1, 1])
      b.quadN(
        "shutter",
        [-11.2 + e * 1.65, 0, Z1 - 0.14],
        [-11.2 + e * 3.3, 0, Z1 - 0.14],
        [-11.2 + e * 3.3, 3.3, Z1 - 0.14],
        [-11.2 + e * 1.65, 3.3, Z1 - 0.14],
        [0, 0, -1],
        { tint: [0.8, 0.9, 0.82] },
      );
    // hanging lanterns along the girders + market string lights
    for (const [x, z] of [
      [-24.5, 0],
      [-20.5, -9],
      [-13.1, 0],
      [-9.4, -9],
      [-1.9, 0],
      [2, 9],
      [-20.5, 9],
      [-9.4, 9],
      [-1.9, -9.5],
      [-24.5, -9.5],
    ])
      K.lamp(b, x, H - 1.1, z, "cage", [1, 0.76, 0.48], 1.05, 8.5, {
        ceil: H - 0.45,
        lightOpts: { box: HALL },
      });
    K.stringLights(
      b,
      [
        [X0 + 0.3, 3.6, -1],
        [P1, 3.3, 1],
        [P2, 3.3, -1],
        [X1 - 0.3, 3.6, 1],
      ],
      { sag: 0.4, light: 0.35, radius: 5, deadEvery: 9 },
    );

    // ================================================= centre bay: THE SCALE HOUSE
    const SX = -11.2,
      SZ = -8.6;
    // platform scale: iron deck on a pit, the column and the steelyard beam with poises
    b.boxMM("black_iron", SX - 1.5, 0, SZ - 1.5, SX + 1.5, 0.14, SZ + 1.5, {
      tint: [0.3, 0.3, 0.3],
      faces: "nsewt",
    });
    b.boxMM(
      "planks_iron",
      SX - 1.35,
      0.14,
      SZ - 1.35,
      SX + 1.35,
      0.16,
      SZ + 1.35,
      { tint: [0.6, 0.54, 0.46] },
    );
    b.col(SX - 1.5, 0, SZ - 1.5, SX + 1.5, 0.16, SZ + 1.5, {
      tag: "scale",
      surface: "metal",
    });
    b.box("ferry_green", SX + 1.9, 0, SZ - 1.2, 0.5, 2.3, 0.5, {
      tint: [0.5, 0.64, 0.54],
    });
    b.col(SX + 1.65, 0, SZ - 1.45, SX + 2.15, 2.3, SZ - 0.95, {
      tag: "scale",
      walkable: false,
    });
    b.beam(
      "brass",
      SX + 1.9,
      2.1,
      SZ - 1.2,
      SX + 1.9,
      2.0,
      SZ + 1.6,
      0.08,
      0.14,
    );
    b.box("brass", SX + 1.9, 1.85, SZ + 0.6, 0.18, 0.3, 0.14); // poise
    for (let k = 0; k < 4; k++)
      b.cyl(
        "brass",
        SX + 1.9,
        1.3 - k * 0.14,
        SZ + 1.55,
        0.12 - k * 0.015,
        0.12 - k * 0.015,
        0.12,
        10,
      ); // hanging weights
    b.pipe(
      "brass",
      SX + 1.9,
      1.9,
      SZ + 1.55,
      SX + 1.9,
      1.42,
      SZ + 1.55,
      0.01,
      3,
    );
    const dialS = K.paint("art", "ph2_es_dial", 256, 256, (x, X, Y, W, Hh) => {
      const cx = X + W / 2,
        cy = Y + Hh * 0.62;
      x.fillStyle = "#e8e0c8";
      x.fillRect(X, Y, W, Hh);
      x.strokeStyle = "#2a2a24";
      x.lineWidth = 4;
      x.beginPath();
      x.arc(cx, cy, W * 0.42, Math.PI, 2 * Math.PI);
      x.stroke();
      for (let k = 0; k <= 20; k++) {
        const a = Math.PI + (k / 20) * Math.PI;
        x.beginPath();
        x.moveTo(cx + Math.cos(a) * W * 0.42, cy + Math.sin(a) * W * 0.42);
        x.lineTo(
          cx + Math.cos(a) * W * (k % 5 ? 0.38 : 0.34),
          cy + Math.sin(a) * W * (k % 5 ? 0.38 : 0.34),
        );
        x.stroke();
      }
      x.fillStyle = "#8a1a14";
      x.font = "bold 20px Georgia, serif";
      x.textAlign = "center";
      x.fillText("CERTIFIED · N.Y.C. 1961", cx, Y + Hh * 0.86);
      x.strokeStyle = "#a01a14";
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(cx, cy);
      x.lineTo(cx + W * 0.24, cy - W * 0.3);
      x.stroke();
      K.stains(x, X, Y, W, Hh, 6, 7101, 0.35, [60, 45, 25]);
    });
    b.plate("art", SX + 1.9, 2.55, SZ - 0.94, 0, 1, 0.9, 0.9, dialS, {
      off: 0.0,
    });
    b.plate(
      "art",
      SX,
      3.6,
      Z0 + 0.12,
      0,
      1,
      4.2,
      0.6,
      K.signCell("es_scalehouse", "THE SCALE HOUSE", 768, 96, {
        bg: "#1e2a22",
        fg: "#f0d8a0",
        font: "Georgia, serif",
        border: "#c8a050",
      }),
      { off: 0.02 },
    );
    // Hattie's desk (behind the scale, against the north wall)
    K.table(b, SX - 2.6, 0, Z0 + 1.0, 2.2, 0.9, {
      mat: "mahogany",
      tint: [0.5, 0.32, 0.2],
    });
    K.chair(b, SX - 2.6, 0, Z0 + 1.9, PI, { mat: "wood_dark" });
    b.box("fabric", SX - 2.8, 0.76, Z0 + 1.0, 0.45, 0.07, 0.32, {
      tint: [0.4, 0.2, 0.14],
    });
    for (let k = 0; k < 6; k++)
      b.cyl(
        "brass",
        SX - 1.8 + k * 0.12,
        0.76,
        Z0 + 0.8,
        0.04 + k * 0.006,
        0.04 + k * 0.006,
        0.05 + k * 0.02,
        8,
      ); // weight set
    K.shelf(b, SX - 4.6, 0, Z0 + 0.3, 0, 2.4, {
      h: 2.4,
      d: 0.4,
      levels: 5,
      items: ["box", "book", "box", "jar"],
      col: true,
      mat: "wood_dark",
      seed: 711,
    });
    K.lamp(b, SX - 2.6, 2.2, Z0 + 1.0, "pendant", [1, 0.82, 0.58], 0.9, 5, {
      ceil: H,
      lightOpts: { box: HALL },
    });
    // the market board by the doors (prices chalked daily)
    const board = K.paint("art", "ph2_es_board", 512, 384, (x, X, Y, W, Hh) => {
      x.fillStyle = "#23302a";
      x.fillRect(X, Y, W, Hh);
      x.strokeStyle = "#6a4a2e";
      x.lineWidth = 14;
      x.strokeRect(X + 7, Y + 7, W - 14, Hh - 14);
      x.fillStyle = "rgba(235,235,220,0.9)";
      x.font = 'bold 26px "Comic Sans MS", cursive, sans-serif';
      [
        "TODAY'S WEIGHTS",
        "Ox meat ....... 3c / lb",
        "Scrap metal ..... 1c / lb",
        "Potatoes ............. 2c / lb",
        "Purified water .. 12c / qt",
        "Coffee (Bean's) .. ASK",
        "NO CREDIT · NO RAIDER SCRIP",
      ].forEach((l, i) => x.fillText(l, X + 28, Y + 50 + i * 46, W - 50));
      K.grain(x, X, Y, W, Hh, 20, 7111);
    });
    b.plate("art", -7.4, 1.9, Z1 - 0.12, 0, -1, 1.9, 1.4, board, { off: 0.0 });
    A("hattie", SX - 0.2, 0, SZ + 2.2, PI);
    A("merchant", SX - 0.2, 0, SZ + 2.2, PI);
    for (let k = 0; k < 2; k++) {
      b.box("oak", SX - 2 + k * 4, 0.42, 4.5, 2.6, 0.06, 0.45, { tint: wood });
      b.box("oak", SX - 2 + k * 4, 0, 4.5, 2.4, 0.42, 0.1, {
        tint: wood.map((v) => v * 0.8),
      });
      b.col(SX - 3.3 + k * 4, 0, 4.25, SX - 0.7 + k * 4, 0.48, 4.75, {
        tag: "bench",
        surface: "wood",
      });
    }

    // ================================================= west bay: guns, leathers, junk, workbench, cellar stair
    // Boomer's gun counter
    b.boxMM("wood", -24.5, 0, -12.6, -19, 1.0, -11.9, { tint: wood });
    b.boxMM("black_iron", -24.6, 1.0, -12.7, -18.9, 1.05, -11.8, {
      tint: [0.3, 0.3, 0.3],
    });
    b.col(-24.5, 0, -12.6, -19, 1.05, -11.9, {
      tag: "counter",
      surface: "wood",
    });
    for (let k = 0; k < 7; k++) {
      const x = -24.2 + k * 0.8;
      b.beam(
        "wood_dark",
        x,
        1.3,
        Z0 + 0.14,
        x + 0.1,
        2.4,
        Z0 + 0.14,
        0.08,
        0.05,
        { tint: [0.45, 0.3, 0.2] },
      );
      b.beam(
        "metal_dark",
        x + 0.1,
        2.3,
        Z0 + 0.12,
        x + 0.12,
        3.2,
        Z0 + 0.12,
        0.04,
        0.04,
      );
    } // rifles on the wall
    b.boxMM("wood_dark", -24.6, 1.25, Z0 + 0.08, -18.8, 1.3, Z0 + 0.3, {
      tint: [0.4, 0.3, 0.2],
    });
    for (let k = 0; k < 5; k++)
      b.box("paint_olive", -24 + k * 1.1, 1.05, -12.3, 0.35, 0.22, 0.25, {
        tint: [0.4, 0.46, 0.3],
      });
    b.plate(
      "art",
      -21.8,
      3.6,
      Z0 + 0.12,
      0,
      1,
      3.6,
      0.55,
      K.signCell("es_guns", "BOOMER'S — GUNS · AMMO · REPAIRS", 512, 80, {
        bg: "#2a1a12",
        fg: "#f0c860",
        font: "Impact, sans-serif",
      }),
      { off: 0.02 },
    );
    A("boomer", -21.8, 0, Z0 + 0.9, PI);
    // Dolores' leathers: racks of coats + two dress forms
    for (let k = 0; k < 2; k++) {
      const z = -3 + k * 3.4;
      b.pipe("black_iron", -27.2, 1.8, z - 1.2, -27.2, 1.8, z + 1.2, 0.03, 5);
      for (const e of [-1.2, 1.2])
        b.pipe("black_iron", -27.2, 0, z + e, -27.2, 1.8, z + e, 0.025, 4);
      for (let q = 0; q < 6; q++)
        b.box("leather", -27.2, 0.75, z - 1.0 + q * 0.4, 0.14, 1.0, 0.36, {
          tint: r.pick([
            [0.45, 0.3, 0.2],
            [0.35, 0.26, 0.18],
            [0.3, 0.3, 0.26],
            [0.5, 0.36, 0.22],
          ]),
        });
    }
    for (const z of [-5.2, 3.6]) {
      b.cyl("wood_dark", -25.6, 0, z, 0.03, 0.03, 1.1, 5);
      b.geo("leather", K.sphereGeo(), {
        x: -25.6,
        y: 1.35,
        z,
        sx: 0.24,
        sy: 0.35,
        sz: 0.16,
        tint: [0.4, 0.28, 0.18],
      });
      b.geo("flat", K.sphereGeo(), {
        x: -25.6,
        y: 1.8,
        z,
        s: 0.1,
        tint: [0.7, 0.66, 0.6],
      });
    }
    b.boxMM("wood", -25.6, 0, -1.4, -24.6, 0.9, 1.6, { tint: wood });
    b.col(-25.6, 0, -1.4, -24.6, 0.95, 1.6, {
      tag: "counter",
      surface: "wood",
    });
    b.plate(
      "art",
      X0 + 0.12,
      3.2,
      0.2,
      1,
      0,
      3.0,
      0.5,
      K.signCell("es_leather", "DOLORES — LEATHERS & COATS", 512, 80, {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    A("dolores", -26.4, 0, 0.1, -HP);
    // Moth's junk mountain + his counter of oddities
    for (let k = 0; k < 16; k++) {
      const x = -22.8 + r() * 4.6,
        z = 8.8 + r() * 4.2;
      b.box(
        r.pick(["rust", "metal", "wood_rotten", "metal_dark"]),
        x,
        r() * 0.8,
        z,
        0.3 + r() * 0.7,
        0.2 + r() * 0.5,
        0.3 + r() * 0.6,
        { yaw: r() * 3, tint: [0.6 + r() * 0.3, 0.55, 0.45] },
      );
    }
    b.geo("flat", K.sphereGeo(), {
      x: -20.6,
      y: 1.2,
      z: 12.4,
      s: 0.4,
      tint: [0.8, 0.6, 0.3],
    }); // globe
    b.box("chrome", -22.3, 1.3, 12.0, 0.5, 0.3, 0.3, {
      tint: [0.7, 0.7, 0.72],
    }); // the toaster
    b.col(-23, 0, 8.8, -18, 1.2, 13.4, { tag: "junk", surface: "metal" });
    b.boxMM("wood", -21.6, 0, 7.2, -18.6, 0.95, 7.9, { tint: wood });
    b.col(-21.6, 0, 7.2, -18.6, 1.0, 7.9, { tag: "counter", surface: "wood" });
    b.plate(
      "art",
      -20.3,
      3.5,
      Z1 - 0.12,
      0,
      -1,
      2.4,
      0.5,
      K.signCell("es_moth", "MOTH'S — EVERYTHING", 384, 80, {
        bg: "#2a2a24",
        fg: "#e8e0b0",
        font: "Impact, sans-serif",
      }),
      { off: 0.02 },
    );
    A("moth", -20.1, 0, 8.5, PI);
    // the stairwell down to the cellar (x −27.4..−25.6, z 2.6..11)
    K.stairs(b, -27.4, 2.6, -25.6, 11, -3.6, 0, "+z", {
      mat: "brownstone",
      tint: [0.6, 0.5, 0.42],
      solid: false,
    });
    K.railing(b, -25.55, 2.6, -25.55, 11, 0, {
      mat: "rust",
      handMat: "rust",
      h: 1.0,
    });
    K.railing(b, -27.4, 2.55, -25.55, 2.55, 0, {
      mat: "rust",
      handMat: "rust",
      h: 1.0,
    });
    b.plate(
      "art",
      -26.5,
      2.2,
      11.1,
      0,
      1,
      1.4,
      0.45,
      K.signCell("es_vaultsign", "CELLAR — KEY HOLDERS ONLY", 384, 96, {
        bg: "#c8a030",
        fg: "#1a1a1a",
        font: "Impact, sans-serif",
      }),
      { off: 0.0 },
    );
    // stair shaft walls below the hall floor + the cellar door landing
    K.segWall(b, -25.6, 2.6, -25.6, 11, -3.6, 0, 1, {
      mat: "brick_brown",
      tint: brick.map((v) => v * 0.8),
      trim: false,
    });
    b.boxMM("brownstone", -27.4, -3.9, 1.2, -25.6, -3.6, 2.6, {
      tint: [0.55, 0.45, 0.38],
    });
    b.col(-27.4, -3.9, 1.2, -25.6, -3.6, 2.6, { tag: "floor" });
    b.boxMM("black_iron", -27.3, -3.6, 1.15, -25.7, -1.2, 1.25, {
      tint: [0.28, 0.28, 0.28],
    });
    for (let k = 0; k < 6; k++)
      b.box("rust", -27.1 + k * 0.28, -2.5, 1.26, 0.05, 0.05, 0.05); // rivets
    b.cyl("brass", -26.0, -2.4, 1.27, 0.07, 0.07, 0.04, 8);
    b.col(-27.4, -3.6, 1.1, -25.6, 0, 1.3, { tag: "door", walkable: false });
    K.lamp(b, -26.5, -1.0, 2.0, "bulb", [1, 0.8, 0.55], 0.5, 3.5, {
      ceil: -0.3,
      lightOpts: { box: [-27.6, -4, 1, -25.4, 0.2, 11.2] },
    });
    // workbench spot (the prop), junk at hand
    K.crates(b, -17.8, 0, 4.2, 0.3, 2, { col: true });

    // ================================================= east bay: THE EMPIRE ROASTERY
    // the drum roaster: firebox, rotating drum, hopper, cooling tray, chimney through the ceiling
    const RX = 2.6,
      RZ = -11.2;
    b.boxMM("brick_dark", RX - 1.1, 0, RZ - 0.9, RX + 1.1, 1.0, RZ + 0.9, {
      tint: [0.5, 0.36, 0.3],
    });
    b.boxMM(
      "paint_black",
      RX - 0.45,
      0.2,
      RZ + 0.9,
      RX + 0.45,
      0.7,
      RZ + 0.92,
      { tint: [0.04, 0.03, 0.03] },
    );
    for (let k = 0; k < 5; k++)
      b.geo("lamp", K.sphereGeo(), {
        x: RX - 0.3 + k * 0.15,
        y: 0.3,
        z: RZ + 0.7,
        s: 0.08,
        tint: [1, 0.42, 0.12],
      });
    b.light(RX, 0.8, RZ + 1.6, [1, 0.45, 0.18], 1.1, 5, { box: HALL });
    b.glow(RX, 0.45, RZ + 0.95, [0.9, 0.35, 0.1], 1.2);
    b.geo("metal_dark", K.unitCyl(16), {
      x: RX,
      y: 1.55,
      z: RZ,
      sx: 0.62,
      sy: 1.8,
      sz: 0.62,
      rz: HP,
      tint: [0.36, 0.34, 0.32],
    });
    for (const e of [-1, 1])
      b.geo("brass_old", K.unitCyl(16), {
        x: RX + e * 0.92,
        y: 1.55,
        z: RZ,
        sx: 0.66,
        sy: 0.06,
        sz: 0.66,
        rz: HP,
        tint: [0.7, 0.56, 0.36],
      });
    b.cyl("brass_old", RX - 0.5, 2.15, RZ, 0.35, 0.12, 0.6, 10, {
      tint: [0.7, 0.56, 0.36],
    }); // hopper
    b.pipe("metal_dark", RX + 0.6, 2.0, RZ, RX + 0.6, H, RZ - 0.4, 0.16, 8);
    b.cyl("metal", RX + 1.6, 0, RZ + 1.6, 0.75, 0.75, 0.75, 16, {
      tint: [0.5, 0.5, 0.48],
    }); // cooling tray
    b.cyl("shell", RX + 1.6, 0.75, RZ + 1.6, 0.68, 0.68, 0.02, 16, {
      tint: [0.34, 0.22, 0.14],
    }); // beans
    b.col(RX - 1.1, 0, RZ - 0.9, RX + 1.1, 2.4, RZ + 0.9, {
      tag: "machine",
      walkable: false,
    });
    b.col(RX + 0.85, 0, RZ + 0.85, RX + 2.35, 0.8, RZ + 2.35, {
      tag: "machine",
    });
    // burlap sacks stacked along the north wall
    for (let k = 0; k < 14; k++) {
      const x = -4.8 + (k % 5) * 0.75,
        z = Z0 + 0.5 + Math.floor(k / 5) * 0.2,
        y = Math.floor(k / 5) * 0.34;
      b.geo("canvas_tarp", K.sphereGeo(), {
        x,
        y: y + 0.18,
        z: z + (k % 2) * 0.1,
        sx: 0.36,
        sy: 0.18,
        sz: 0.28,
        ry: r() * 0.5,
        tint: [0.72, 0.62, 0.44],
      });
    }
    b.col(-5.2, 0, Z0, -1.3, 1.0, Z0 + 1.1, { tag: "sacks", surface: "dirt" });
    b.plate(
      "art",
      -3.0,
      1.35,
      Z0 + 0.14,
      0,
      1,
      1.2,
      0.35,
      K.signCell(
        "es_sack",
        "CAFÉ DO BRASIL — 1967 — NITROGEN PACKED",
        384,
        64,
        { bg: "#c8b890", fg: "#3a2a14", font: "Georgia, serif" },
      ),
      { off: 0.02 },
    );
    // the bar (L-shaped) + stools + tables
    b.boxMM("mahogany", -1.2, 0, -5.4, 4.2, 1.05, -4.8, {
      tint: [0.5, 0.3, 0.18],
    });
    b.boxMM("mahogany", -1.2, 0, -4.8, -0.6, 1.05, -1.6, {
      tint: [0.5, 0.3, 0.18],
    });
    b.boxMM("brass_old", -1.25, 1.05, -5.45, 4.25, 1.1, -4.75, {
      tint: [0.7, 0.56, 0.36],
    });
    b.boxMM("brass_old", -1.25, 1.05, -4.75, -0.55, 1.1, -1.55, {
      tint: [0.7, 0.56, 0.36],
    });
    b.col(-1.2, 0, -5.4, 4.2, 1.1, -4.8, { tag: "counter", surface: "wood" });
    b.col(-1.2, 0, -4.8, -0.6, 1.1, -1.6, { tag: "counter", surface: "wood" });
    for (let k = 0; k < 5; k++) {
      const x = -0.2 + k * 0.9;
      b.cyl("chrome", x, 0, -4.1, 0.03, 0.03, 0.72, 6);
      b.cyl("leather_red", x, 0.72, -4.1, 0.2, 0.2, 0.08, 10);
    }
    for (let k = 0; k < 8; k++)
      b.cyl("ceramic", 0.2 + k * 0.45, 1.1, -5.15, 0.05, 0.04, 0.09, 8, {
        tint: [0.9, 0.88, 0.82],
      }); // cups
    const neon = K.neonCell("es_roast", "EMPIRE ROAST", 512, 128, {
      color: "#40e8d0",
      font: "Georgia, serif",
      italic: true,
    });
    b.plate("neon", 1.5, 3.4, Z0 + 0.13, 0, 1, 2.8, 0.7, neon, { off: 0.0 });
    b.light(1.5, 3.0, Z0 + 1.2, [0.3, 0.9, 0.8], 0.6, 5, { box: HALL });
    for (const [x, z] of [
      [-3.4, -0.5],
      [0.6, 1.2],
      [-3.2, 3.6],
      [1.2, 5.2],
    ]) {
      K.roundTable(b, x, 0, z, 0.55, {
        mat: "wood_dark",
        tint: [0.45, 0.32, 0.22],
      });
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + r();
        K.chair(b, x + Math.cos(a) * 0.95, 0, z + Math.sin(a) * 0.95, -a - HP, {
          mat: "wood_dark",
        });
      }
      b.cyl("lamp", x, 0.76, z, 0.03, 0.03, 0.1, 6, { tint: [1, 0.72, 0.4] });
      b.light(x, 1.3, z, [1, 0.72, 0.42], 0.45, 3.2, { box: HALL });
    }
    A("bean", 1.6, 0, -6.2, 0);
    A("shop3", 0.6 + 0.95, 0.05, 1.2, -HP);
    K.loot(ctx, "radio", 4.8, 1.1, -5.1, PI, {});
    // barred windows onto the ox yard (east wall): painted yard view behind the bars
    const yardView = K.paint(
      "pics",
      "ph2_es_yardview",
      256,
      192,
      (x, X, Y, W, Hh) => {
        const g = x.createLinearGradient(0, Y, 0, Y + Hh);
        g.addColorStop(0, "#9aa292");
        g.addColorStop(0.5, "#7a6a58");
        g.addColorStop(1, "#5a4a38");
        x.fillStyle = g;
        x.fillRect(X, Y, W, Hh);
        x.fillStyle = "#6a4a3a";
        x.fillRect(X, Y + Hh * 0.1, W * 0.15, Hh * 0.8);
        x.fillRect(X + W * 0.85, Y + Hh * 0.1, W * 0.15, Hh * 0.8);
        x.fillStyle = "#4a3a2c";
        x.beginPath();
        x.ellipse(X + W * 0.5, Y + Hh * 0.72, W * 0.2, Hh * 0.1, 0, 0, 6.3);
        x.fill(); // an ox, roughly
        x.beginPath();
        x.arc(X + W * 0.33, Y + Hh * 0.62, 12, 0, 6.3);
        x.arc(X + W * 0.28, Y + Hh * 0.6, 11, 0, 6.3);
        x.fill();
        x.fillStyle = "#b8a060";
        x.fillRect(X, Y + Hh * 0.88, W, Hh * 0.12);
        K.grain(x, X, Y, W, Hh, 25, 7121);
      },
    );
    for (const z of [-2, 8]) {
      b.plate("pics", X1 + 0.25, 2.1, z, -1, 0, 2.2, 1.6, yardView, { off: 0 });
      b.quadN(
        "paint_black",
        [X1 - 0.1, 1.3, z - 0.8],
        [X1 - 0.1, 1.3, z + 0.8],
        [X1 - 0.1, 2.9, z + 0.8],
        [X1 - 0.1, 2.9, z - 0.8],
        [-1, 0, 0],
        { tint: [0.02, 0.02, 0.02] },
      );
      for (let k = 0; k < 7; k++)
        b.pipe(
          "black_iron",
          X1 - 0.14,
          1.3,
          z - 0.75 + k * 0.25,
          X1 - 0.14,
          2.9,
          z - 0.75 + k * 0.25,
          0.018,
          4,
        );
      b.light(X1 - 1, 2.2, z, [0.72, 0.72, 0.66], 0.6, 5, { box: HALL });
    }
    b.plate(
      "art",
      X1 - 0.12,
      3.4,
      3,
      -1,
      0,
      2.2,
      0.4,
      K.signCell("es_yardsign", "THE YARD →  (via the street)", 384, 64, {
        bg: "#e0d6bc",
        fg: "#3a1e14",
        font: "Georgia, serif",
      }),
      { off: 0.02 },
    );
    // the stair up to the lofts (east wall, z 12 → 2.4)
    K.stairs(b, 4.0, 2.4, 5.4, 12, 0, 4.6, "-z", {
      mat: "wood",
      tint: [0.55, 0.44, 0.32],
      rail: "l",
      railMat: "rust",
    });

    // ================================================= LOFTS (y 4.6) over the centre + east bays
    const LY = 4.6,
      LX0 = P1,
      LH = 3.0;
    const loftFloor = (x0, z0, x1, z1) => {
      b.face("planks_iron", x0, LY, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.6, 0.52, 0.44],
      });
      b.col(x0, LY - 0.2, z0, x1, LY, z1, { tag: "floor", surface: "wood" });
    };
    loftFloor(LX0, Z0, X1, 2.4);
    loftFloor(LX0, 2.4, 3.9, Z1);
    K.room(b, ctx, {
      x0: LX0,
      z0: Z0,
      x1: X1,
      z1: Z1,
      y: LY,
      h: LH,
      noFloor: true,
      wall: "brick_brown",
      wc: brick.map((v) => v * 0.9),
      ceil: "wood_rotten",
      cc: [0.42, 0.34, 0.28],
      trimMat: "wood_dark",
    });
    K.railing(b, 3.95, 2.4, 3.95, 12, LY, {
      mat: "rust",
      handMat: "rust",
      h: 1.0,
    });
    K.railing(b, 3.95, 2.35, X1 - 0.1, 2.35, LY, {
      mat: "rust",
      handMat: "rust",
      h: 1.0,
      col: false,
    });
    for (let x = LX0 + 1.9; x < X1; x += 3.7)
      for (const [z, nz] of [
        [Z0, 1],
        [Z1, -1],
      ]) {
        const open = (Math.round(x) + (nz > 0 ? 0 : 1)) % 2 === 0;
        b.quadN(
          open ? "lamp" : "shutter",
          [x - 0.5, LY + 0.8, z + nz * 0.11],
          [x + 0.5, LY + 0.8, z + nz * 0.11],
          [x + 0.5, LY + 2.3, z + nz * 0.11],
          [x - 0.5, LY + 2.3, z + nz * 0.11],
          [0, 0, nz],
          { tint: open ? [0.55, 0.58, 0.56] : [0.7, 0.8, 0.72] },
        );
        if (open)
          b.light(x, LY + 1.6, z + nz * 1.2, [0.7, 0.74, 0.74], 0.5, 5, {
            box: [LX0, LY - 0.1, Z0, X1, LY + LH, Z1],
          });
      }
    for (let k = 0; k < 8; k++) {
      const x = -15 + (k % 4) * 3.6,
        z = k < 4 ? -11.8 : 11.6;
      K.bed(b, x, LY, z, k < 4 ? 0 : PI, {
        w: 0.9,
        l: 1.9,
        tint: r.pick([
          [0.6, 0.56, 0.48],
          [0.5, 0.48, 0.4],
          [0.62, 0.5, 0.42],
        ]),
      });
    }
    // Gaffney's corner (NE, away from the bunks): bunk, lantern, his footlocker, a photo of his girl
    K.bed(b, 2.6, LY, -12.2, 0, { w: 0.9, l: 1.9, tint: [0.5, 0.46, 0.4] });
    b.cyl("rust", 1.4, LY, -13.2, 0.14, 0.14, 0.3, 8);
    b.geo("lamp", K.sphereGeo(), {
      x: 1.4,
      y: LY + 0.4,
      z: -13.2,
      s: 0.08,
      tint: [1, 0.78, 0.45],
    });
    b.light(1.6, LY + 1.0, -12.4, [1, 0.76, 0.46], 0.8, 4.5, {
      box: [LX0, LY - 0.1, Z0, X1, LY + LH, Z1],
    });
    b.glow(1.4, LY + 0.4, -13.2, [0.8, 0.5, 0.2], 0.8);
    K.framed(
      b,
      4.2,
      LY + 1.4,
      Z0 + 0.12,
      0,
      1,
      0.3,
      0.4,
      K.photo("family", 7, 96, 128),
      { frame: "wood_dark" },
    );
    A("pike", 2.4, LY + 0.05, -11.4, PI);
    for (let k = 0; k < 5; k++) {
      const x = -10 + k * 0.7;
      b.quadN(
        "fabric",
        [x, LY + 2.4, 0],
        [x + 0.55, LY + 2.4, 0],
        [x + 0.55, LY + 1.7, 0],
        [x, LY + 1.7, 0],
        [0, 0, 1],
        {
          tint: r.pick([
            [0.8, 0.76, 0.66],
            [0.5, 0.56, 0.62],
            [0.7, 0.4, 0.3],
          ]),
        },
      );
    }
    b.pipe("black_iron", -10.2, LY + 2.4, 0, -6.2, LY + 2.4, 0, 0.006, 3);
    K.lamp(b, -8, LY + 2.2, 6, "bulb", [1, 0.8, 0.55], 0.7, 7, {
      ceil: LY + LH,
      lightOpts: { box: [LX0, LY - 0.1, Z0, X1, LY + LH, Z1] },
    });
    K.lamp(b, -8, LY + 2.2, -6, "bulb", [1, 0.8, 0.55], 0.6, 7, {
      ceil: LY + LH,
      lightOpts: { box: [LX0, LY - 0.1, Z0, X1, LY + LH, Z1] },
    });
    K.clutter(b, LX0 + 0.5, -9, 0, 9, LY, {
      n: 10,
      seed: 721,
      kinds: ["box", "paper", "can", "books"],
    });

    // ================================================= CELLAR (y −3.6) under the west bay
    const VY = -3.6,
      VX0 = X0,
      VX1 = P1,
      VZ0 = Z0,
      VZ1 = 1.2;
    const VB = [VX0 - 0.5, VY - 1, VZ0 - 0.5, VX1 + 0.5, VY + 3.6, VZ1 + 0.5];
    K.room(b, ctx, {
      x0: VX0,
      z0: VZ0,
      x1: VX1,
      z1: VZ1,
      y: VY,
      h: 3.3,
      floor: "brownstone",
      fc: [0.55, 0.46, 0.38],
      wall: "brick_brown",
      wc: brick.map((v) => v * 0.7),
      ceil: "brick_brown",
      cc: brick.map((v) => v * 0.55),
      trimMat: "brownstone",
    });
    // brick arch ribs across the cellar
    for (let x = VX0 + 1.4; x < VX1; x += 2.2)
      for (let k = 0; k < 8; k++) {
        const t0 = -1 + (2 * k) / 8,
          t1 = -1 + (2 * (k + 1)) / 8;
        b.beam(
          "brick_dark",
          x,
          VY + 2.6 + 0.6 * (1 - t0 * t0),
          (VZ0 + VZ1) / 2 + t0 * 7.5,
          x,
          VY + 2.6 + 0.6 * (1 - t1 * t1),
          (VZ0 + VZ1) / 2 + t1 * 7.5,
          0.4,
          0.3,
          { tint: brick.map((v) => v * 0.6) },
        );
      }
    // consignments: tagged crates & sacks in bays, shelving, the big safe
    for (let k = 0; k < 5; k++) {
      const x = VX0 + 1.6 + k * 2.2;
      K.shelf(b, x, VY, VZ0 + 0.4, 0, 1.8, {
        h: 2.2,
        d: 0.5,
        levels: 4,
        items: ["box", "box", "can", "jar"],
        col: true,
        mat: "wood_rotten",
        seed: 731 + k,
      });
    }
    for (let k = 0; k < 7; k++) {
      const x = VX0 + 1.5 + r() * 8,
        z = -6 + r() * 5;
      K.crates(b, x, VY, z, r() * 3, 2, { col: true, seed: 741 + k });
      b.box("brass", x, VY + 0.5, z - 0.4, 0.08, 0.1, 0.02);
    }
    for (let k = 0; k < 4; k++)
      b.plate(
        "art",
        VX0 + 2.2 + k * 2.4,
        VY + 2.6,
        VZ0 + 0.14,
        0,
        1,
        1.2,
        0.3,
        K.signCell(
          "es_bay" + k,
          "CONSIGNMENT " +
            ["A · WHITEHALL", "B · CROW'S HAT", "C · TWO-HORN", "D · MARKET"][
              k
            ],
          320,
          64,
          { bg: "#e0d6bc", fg: "#3a1e14", font: "Georgia, serif" },
        ),
        { off: 0.01 },
      );
    for (let k = 0; k < 3; k++) {
      const x = VX1 - 1.5,
        z = -12 + k * 2.4;
      K.lamp(
        b,
        x - 3 - k * 2,
        VY + 2.6,
        z + 3,
        "bulb",
        [1, 0.8, 0.55],
        k === 1 ? 0 : 0.7,
        6,
        { ceil: VY + 3.3, dead: k === 1, lightOpts: { box: VB } },
      );
    }
    // the loose drain grate (x −20, z −11)
    b.boxMM("black_iron", -20.6, VY + 0.005, -11.6, -19.4, VY + 0.03, -10.4, {
      tint: [0.25, 0.25, 0.25],
    });
    for (let k = 0; k < 6; k++)
      b.beam(
        "black_iron",
        -20.55 + k * 0.22,
        VY + 0.035,
        -11.55,
        -20.55 + k * 0.22,
        VY + 0.035,
        -10.45,
        0.04,
        0.02,
      );
    b.boxMM("paint_black", -20.5, VY + 0.001, -11.5, -19.5, VY + 0.004, -10.5, {
      tint: [0.02, 0.02, 0.02],
    });
    b.hplate(
      "decal",
      -19.6,
      VY + 0.013,
      -10,
      1.6,
      2.2,
      0.4,
      K.decal("grime", 60),
    ); // drag marks toward the grate
    for (let k = 0; k < 5; k++)
      b.box(
        "flat",
        -21 + r() * 2,
        VY + 0.012,
        -10 + r() * 3,
        0.1,
        0.004,
        0.05,
        { yaw: r() * 3, tint: [0.72, 0.6, 0.3] },
      ); // brass tag threads
    A("cellar", -22, VY, -5, 0);

    // THE COAL TUNNEL (x −44..−28, z −12..−10, y −4.2) → PIKE'S CACHE (x −48..−44)
    const TY = -4.2;
    K.room(b, ctx, {
      x0: -44,
      z0: -12,
      x1: -30,
      z1: -10,
      y: TY,
      h: 1.9,
      floor: "dirt",
      fc: [0.5, 0.42, 0.34],
      wall: "brick_brown",
      wc: brick.map((v) => v * 0.55),
      ceil: "brick_brown",
      cc: brick.map((v) => v * 0.45),
      trim: false,
      open: { w: true },
    });
    K.room(b, ctx, {
      x0: -48,
      z0: -14,
      x1: -44,
      z1: -8,
      y: TY,
      h: 2.4,
      floor: "dirt",
      fc: [0.5, 0.42, 0.34],
      wall: "brick_brown",
      wc: brick.map((v) => v * 0.55),
      ceil: "brick_brown",
      cc: brick.map((v) => v * 0.45),
      trim: false,
      open: { e: true },
    });
    K.segWall(b, -44, -14, -44, -12, TY, TY + 2.4, 1, {
      mat: "brick_brown",
      tint: brick.map((v) => v * 0.55),
      trim: false,
      both: true,
    });
    K.segWall(b, -44, -10, -44, -8, TY, TY + 2.4, 1, {
      mat: "brick_brown",
      tint: brick.map((v) => v * 0.55),
      trim: false,
      both: true,
    });
    b.face("brick_brown", -44, TY + 1.9, -12, 0, 0, 1, 0, 1, 0, 2, 0.5, {
      tint: brick.map((v) => v * 0.5),
    });
    for (let k = 0; k < 6; k++)
      b.beam(
        "wood_rotten",
        -42 + k * 2.2,
        TY + 1.9,
        -12,
        -42 + k * 2.2,
        TY + 1.9,
        -10,
        0.14,
        0.18,
        { tint: [0.4, 0.34, 0.28] },
      );
    K.rubble(b, -36, TY, -10.6, 0.6, 0.35, {
      seed: 751,
      col: false,
      tint: [0.5, 0.42, 0.36],
    });
    // Gaffney's cache: tagged sacks, a lantern, a crate, a stool, the tally
    b.cyl("rust", -46.8, TY, -9, 0.14, 0.14, 0.3, 8);
    b.geo("lamp", K.sphereGeo(), {
      x: -46.8,
      y: TY + 0.4,
      z: -9,
      s: 0.08,
      tint: [1, 0.76, 0.42],
    });
    b.light(-46.4, TY + 1.2, -10.5, [1, 0.74, 0.44], 1.0, 5, {
      box: [-48.5, TY - 0.5, -14.5, -29.5, TY + 3, -7.5],
    });
    b.glow(-46.8, TY + 0.4, -9, [0.8, 0.5, 0.2], 0.9);
    b.light(-36, TY + 1.4, -11, [0.5, 0.45, 0.38], 0.3, 7, {
      box: [-48.5, TY - 0.5, -14.5, -29.5, TY + 3, -7.5],
    });
    for (let k = 0; k < 5; k++)
      b.geo("canvas_tarp", K.sphereGeo(), {
        x: -47.2 + (k % 3) * 0.6,
        y: TY + 0.25 + (k > 2 ? 0.35 : 0),
        z: -13 + (k % 2) * 0.4,
        sx: 0.36,
        sy: 0.22,
        sz: 0.3,
        tint: [0.62, 0.54, 0.4],
      });
    b.box("wood", -45.2, TY, -13.3, 0.45, 0.45, 0.45, {
      tint: [0.5, 0.4, 0.3],
    });
    A("cache", -46.6, TY, -12, 0);
    K.note(ctx, "ph2_note_es_tally", -45.2, TY + 0.47, -13.2, {
      type: "note",
      name: "Gaffney's Tally",
      title: "A tally in pencil",
      text: "MEDICINE — 1,200 scrip (Doc Ferris, Whitehall)\n\nwk 1 — Rally Tonic x3 — 90\nwk 2 — jerky 40lb — 60\nwk 3 — the goggles (Crow's Hat consignment) — 400\nwk 4 — nothing. Hattie was up late.\nwk 5 — brass, powder — 110\n\n660. Halfway.\n\nSorry, Hattie. Sorry sorry sorry.",
    });

    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_empire_int";

    // ================================================= doors & interactables
    const OX = O.x,
      OY = O.y,
      OZ = O.z,
      ES = PV.es;
    K.door(ctx, {
      id: "ph2_es_in",
      pos: ctx.anchors.door.clone(),
      label: "Empire Stores Market",
      verb: "Enter",
      target: { x: OX - 11.2, y: OY, z: OZ + 12.3, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("empire_stores")),
    });
    K.door(ctx, {
      id: "ph2_es_out",
      pos: new THREE.Vector3(OX - 11.2, OY + 1.3, OZ + Z1 - 0.2),
      label: "Water Street",
      verb: "Leave",
      target: { x: ES.ux(1) + ES.UW / 2, y: 0, z: ES.Z1 + 2.2, yaw: PI },
    });
    K.door(ctx, {
      id: "ph2_es_vault",
      pos: new THREE.Vector3(OX - 26.5, OY + VY + 1.2, OZ + 1.35),
      label: "Market Cellar",
      verb: "Open",
      sound: "door_open",
      lock: K.regLock({
        id: "ph2_lk_es_cellar",
        label: "Market Cellar",
        kind: "door",
        key: "ph2_es_vault_key",
        hint: 'Hattie Szabo wears the only key round her neck; she hands it over for "An Honest Weight".',
      }),
      target: { x: OX - 26.5, y: OY + VY, z: OZ - 0.6, yaw: 0 }, // into the cellar, facing the consignments
      onEnter: () => {
        PV.setFlag("es_vault_seen", true);
      },
    });
    K.door(ctx, {
      id: "ph2_es_vault_out",
      pos: new THREE.Vector3(OX - 26.5, OY + VY + 1.2, OZ + VZ1 - 0.15),
      label: "Cellar Stair",
      verb: "Go",
      target: { x: OX - 26.5, y: OY + VY, z: OZ + 2.2, yaw: PI },
    }); // back on the landing, facing up the stair
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX - 20, OY + VY + 0.2, OZ - 11),
        radius: 0.8,
        label: "Loose Drain Grate",
        verb: "Climb down",
        priority: 1,
        onInteract: () => {
          if (!PV.flag("es_grate")) {
            PV.setFlag("es_grate", true);
            K.notify(
              "The grate lifts right out — the bolts were cut long ago. A coal tunnel runs west.",
            );
            K.xp(25, "Found the drain");
          }
          K.sfx("door_open", null);
          G.fadeTransition(() =>
            G.player.teleport(OX - 31, OY + TY, OZ - 11, HP),
          );
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: new THREE.Vector3(OX - 30.2, OY + TY + 1.2, OZ - 11),
        radius: 0.8,
        label: "Drain — Market Cellar",
        verb: "Climb up",
        priority: 1,
        onInteract: () => {
          K.sfx("door_open", null);
          G.fadeTransition(() =>
            G.player.teleport(OX - 20, OY + VY, OZ - 9.6, 0),
          );
        },
      }),
    );
    ctx.interactables.push(
      G.world.addInteractable({
        pos: K.world(ctx, -47.1, TY + 0.4, -12.9),
        radius: 1.0,
        label: "Tagged Sacks",
        verb: "Take",
        priority: 1,
        enabled: () => !PV.flag("es_cache"),
        onInteract: () => {
          PV.setFlag("es_cache", true);
          K.give("ph2_es_goods", 1);
          K.notify(
            "Stolen market goods — every bundle still wears Hattie's brass weight tag.",
          );
          if (PV.esSync) PV.esSync();
        },
      }),
    );
    // anchors, loot
    A("entrance", -11.2, 0, 12.3, 0);
    A("npc1", -11.4, 0, -6.4, PI);
    A("npc2", -21.8, 0, -12, PI);
    A("npc3", 1.6, 0, -6.2, 0);
    A("npc4", -26.4, 0, 0.1, -HP);
    A("npc5", -20.1, 0, 8.5, PI);
    ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"].forEach(
      (n, i) => A(n, -24 + i * 5, 0, i % 2 ? -1 : 1.5, 0),
    );
    A("loot1", VX0 + 1.2, VY, -3, HP);
    A("loot2", 3.2, LY, -13.2, 0);
    A("loot3", -45.4, TY, -9, 0);
    K.loot(ctx, "workbench", -17.6, 0, 1.8, -HP, {});
    K.loot(ctx, "safe", VX0 + 0.6, VY, -3, HP, {
      loot: "safe",
      name: "Market Strongbox",
      lock: K.regLock({
        id: "ph2_lk_es_strongbox",
        label: "Market Strongbox",
        kind: "safe",
        code: "2051",
        hint: 'Hattie\'s scale-house ledger lists the strongbox combination under "Calibration".',
      }),
    });
    K.loot(ctx, "footlocker", 3.4, LY, -13.3, 0, {
      loot: "footlocker",
      name: "Gaffney's Footlocker",
      items: [["rally_tonic", 2]],
      lock: K.regLock({
        id: "ph2_lk_es_pike",
        label: "Gaffney's Footlocker",
        kind: "container",
        code: "1104",
        hint: "The back of the photo over Gaffney's bunk.",
      }),
    });
    K.scrawlAt(
      K.world(ctx, 4.2, LY + 1.4, -13.6),
      "Photo over Gaffney's Bunk",
      'A girl in a summer dress, laughing. On the back, in pencil: "Margie — 11/04 — don\'t forget it this year, you lunk." The footlocker padlock is turned to 1-1-0-4.',
      "ph2_lk_es_pike",
    );
    K.loot(ctx, "crate", -45.6, TY, -9, 0.3, {
      kind: "plain",
      loot: "crate",
      name: "Gaffney's Crate",
      items: [
        ["rally_tonic", 3],
        ["ammo_10mm", 24],
      ],
    });
    K.loot(ctx, "cash_register", SX - 2.0, 0.76, Z0 + 1.0, PI, {});
    K.loot(ctx, "cash_register", 3.4, 1.1, -5.1, PI, {});
    K.loot(ctx, "footlocker", -15, LY, -10.6, 0, { loot: "footlocker" });
    K.loot(ctx, "footlocker", -7.8, LY, 10.4, PI, { loot: "footlocker" });
    K.terminal(
      ctx,
      "ph2_term_es_ledger",
      SX - 3.4,
      0.76,
      Z0 + 1.0,
      PI,
      termLedger(),
      "bare",
    );
  };

