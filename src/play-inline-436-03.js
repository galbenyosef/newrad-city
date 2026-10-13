// play-inline-436 03 — tint
// Lines 75-1192 of readable/play-inline-436.pretty.js (statement-aligned).
  function exterior(ctx) {
    const BY = groundY();
    PK.TAV_BY = BY;
    const b = K.builder({
      name: "tav_ext",
      grime: 0.45,
      off: { x: 0, y: BY, z: 0 },
    });
    const d = K.builder({
      name: "tav_ext_detail",
      grime: 0.45,
      off: { x: 0, y: BY, z: 0 },
    });
    const lit = K.builder({
      name: "tav_ext_lit",
      grime: 0,
      off: { x: 0, y: BY, z: 0 },
    });
    const r = K.rng("tav_ext");
    const W = BX1 - BX0,
      D = BZ1 - BZ0;

    // ============================================================ THE SHEEPFOLD (main building)
    b.face("brick_red", BX0, -0.4, BZ1, 1, 0, 0, 0, 1, 0, W, YE + 0.4, {
      tint: BRICK,
    });
    b.face("brick_red", BX1, -0.4, BZ0, -1, 0, 0, 0, 1, 0, W, YE + 0.4, {
      tint: BRICK.map((v) => v * 0.88),
    });
    b.face("brick_red", BX0, -0.4, BZ0, 0, 0, 1, 0, 1, 0, D, YE + 0.4, {
      tint: BRICK.map((v) => v * 0.92),
    });
    b.face("brick_red", BX1, -0.4, BZ1, 0, 0, -1, 0, 1, 0, D, YE + 0.4, {
      tint: BRICK.map((v) => v * 0.95),
    });
    b.col(BX0, -0.4, BZ0, BX1, YE, BZ1, { tag: "building" });
    // polychrome bands: buff water table, black-brick band, buff impost band, corbelled eave course
    const band = (y, h, mat, tint, dep) => {
      b.boxMM(mat, BX0 - dep, y, BZ1, BX1 + dep, y + h, BZ1 + dep, { tint });
      b.boxMM(mat, BX0 - dep, y, BZ0 - dep, BX1 + dep, y + h, BZ0, { tint });
      b.boxMM(mat, BX0 - dep, y, BZ0, BX0, y + h, BZ1, { tint });
      b.boxMM(mat, BX1, y, BZ0, BX1 + dep, y + h, BZ1, { tint });
    };
    band(
      -0.4,
      1.0,
      "limestone",
      BUFF.map((v) => v * 0.85),
      0.1,
    );
    band(1.9, 0.28, "brick_red", DARKB, 0.03);
    band(2.95, 0.22, "limestone", BUFF, 0.06);
    band(YE - 0.35, 0.35, "brick_red", DARKB, 0.12);
    // steep slate roof (ridge N–S), iron cresting, gables with buff trim
    K.pitchRoof(b, BX0, BX1, BZ0, BZ1, YE, YR, "z", {
      mat: "slate",
      tint: [0.36, 0.38, 0.42],
      over: 0.5,
      crest: true,
      gable: "brick_red",
      gableTint: BRICK,
    });
    for (const [z, nz] of [
      [BZ1, 1],
      [BZ0, -1],
    ]) {
      const xm = (BX0 + BX1) / 2,
        hw = W / 2 + 0.5;
      b.beam(
        "wood_dark",
        xm - hw,
        YE - 0.1,
        z + nz * 0.55,
        xm,
        YR + 0.05,
        z + nz * 0.55,
        0.28,
        0.18,
        { tint: [0.32, 0.22, 0.14] },
      ); // bargeboards
      b.beam(
        "wood_dark",
        xm + hw,
        YE - 0.1,
        z + nz * 0.55,
        xm,
        YR + 0.05,
        z + nz * 0.55,
        0.28,
        0.18,
        { tint: [0.32, 0.22, 0.14] },
      );
      for (let k = 1; k < 8; k++) {
        const t = k / 8;
        b.beam(
          "wood_dark",
          xm - hw * (1 - t),
          YE - 0.1 + (YR - YE) * t - 0.1,
          z + nz * 0.55,
          xm - hw * (1 - t),
          YE - 0.1 + (YR - YE) * t - 0.45,
          z + nz * 0.55,
          0.06,
          0.05,
        );
        b.beam(
          "wood_dark",
          xm + hw * (1 - t),
          YE - 0.1 + (YR - YE) * t - 0.1,
          z + nz * 0.55,
          xm + hw * (1 - t),
          YE - 0.1 + (YR - YE) * t - 0.45,
          z + nz * 0.55,
          0.06,
          0.05,
        );
      }
      b.cyl("wood_dark", xm, YR + 0.1, z + nz * 0.55, 0.08, 0.02, 1.0, 6, {
        tint: [0.32, 0.22, 0.14],
      }); // finial
    }
    // the rose window in the south gable + lancets either side of the canopy
    const xm = (BX0 + BX1) / 2;
    b.geo("limestone", new THREE.TorusGeometry(1.05, 0.16, 5, 20), {
      x: xm,
      y: 6.6,
      z: BZ1 + 0.06,
      tint: BUFF,
    });
    b.geo("glass", new THREE.CircleGeometry(1.0, 20), {
      x: xm,
      y: 6.6,
      z: BZ1 + 0.02,
      tint: [0.36, 0.42, 0.42],
    });
    lit.geo("lamp", new THREE.CircleGeometry(0.98, 20), {
      x: xm,
      y: 6.6,
      z: BZ1 + 0.035,
      tint: [0.95, 0.62, 0.3],
    });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * PI * 2;
      b.beam(
        "limestone",
        xm,
        6.6,
        BZ1 + 0.08,
        xm + Math.cos(a) * 1.0,
        6.6 + Math.sin(a) * 1.0,
        BZ1 + 0.08,
        0.06,
        0.06,
        { tint: BUFF },
      );
    }
    for (const x of [BX0 + 1.6, BX1 - 1.8]) {
      K.lancet(b, x, 1.2, BZ1, 0, 1, 1.0, 2.6, {
        state: "glass",
        surround: "limestone",
        tintA: BUFF,
        tintB: [0.62, 0.3, 0.22],
      });
      lit.plate("lamp", x, 2.25, BZ1 + 0.03, 0, 1, 0.9, 1.9, null, {
        tint: [0.95, 0.64, 0.32],
      });
    }
    for (const z of [-561.2, -564.6, -568.0, -571.4]) {
      K.lancet(b, BX0, 1.2, z, -1, 0, 1.0, 2.6, {
        state: z === -568.0 ? "boarded" : "glass",
        surround: "limestone",
        tintA: BUFF,
        tintB: [0.62, 0.3, 0.22],
      });
      if (z !== -568.0)
        lit.plate("lamp", BX0 - 0.03, 2.25, z, -1, 0, 0.9, 1.9, null, {
          tint: [0.95, 0.64, 0.32],
        });
    }
    for (const x of [-106, -101.5]) {
      K.lancet(b, x, 1.2, BZ0, 0, -1, 1.0, 2.6, {
        state: "dark",
        surround: "limestone",
        tintA: BUFF,
        tintB: [0.62, 0.3, 0.22],
      });
    }
    // west-slope dormers
    for (const z of [-561.5, -566.2, -570.9]) {
      const dx0 = BX0 + 1.1,
        dx1 = dx0 + 1.4,
        zz0 = z - 0.8,
        zz1 = z + 0.8,
        y0 = YE + 0.9;
      b.boxMM("brick_red", dx0, YE, zz0, dx1, y0 + 1.1, zz1, {
        tint: BRICK,
        faces: "nsw",
      });
      b.plate("glass", dx0 - 0.01, y0 + 0.5, z, -1, 0, 0.9, 1.0, null, {
        tint: [0.36, 0.42, 0.42],
      });
      lit.plate("lamp", dx0 - 0.03, y0 + 0.5, z, -1, 0, 0.8, 0.9, null, {
        tint: [0.95, 0.64, 0.32],
      });
      K.pitchRoof(
        b,
        dx0 - 0.05,
        dx1 + 1.2,
        zz0,
        zz1,
        y0 + 1.1,
        y0 + 1.85,
        "x",
        {
          mat: "slate",
          tint: [0.36, 0.38, 0.42],
          over: 0.15,
          gable: "brick_red",
          gableTint: BRICK,
          ends: "a",
        },
      );
    }
    // cupola + the sheep weathervane
    const cz = (BZ0 + BZ1) / 2;
    b.boxMM(
      "wood_dark",
      xm - 0.7,
      YR - 0.6,
      cz - 0.7,
      xm + 0.7,
      YR + 1.0,
      cz + 0.7,
      { tint: [0.3, 0.34, 0.28] },
    );
    for (let k = 0; k < 5; k++)
      for (const [nx, nz] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ])
        b.box(
          "wood_dark",
          xm + nx * 0.72,
          YR - 0.3 + k * 0.24,
          cz + nz * 0.72,
          nz ? 1.2 : 0.04,
          0.05,
          nx ? 1.2 : 0.04,
          { tint: [0.24, 0.26, 0.22] },
        );
    K.pyramid(b, xm, cz, 1.7, 1.7, YR + 1.0, 1.3, {
      mat: "copper",
      tint: [0.38, 0.6, 0.5],
    });
    b.pipe("black_iron", xm, YR + 2.3, cz, xm, YR + 3.4, cz, 0.02, 4);
    K.critter(b, "sheep", xm, YR + 3.15, cz, 0.4, 0.55, {
      mat: "copper",
      tint: [0.38, 0.6, 0.5],
    });
    for (const a of [0, HP, PI, -HP])
      b.pipe(
        "black_iron",
        xm,
        YR + 2.9,
        cz,
        xm + Math.cos(a) * 0.45,
        YR + 2.9,
        cz - Math.sin(a) * 0.45,
        0.012,
        3,
      );
    // chimneys
    for (const [x, z] of [
      [BX0 + 2.2, -572.2],
      [BX1 - 2.0, -560.8],
    ]) {
      b.boxMM(
        "brick_red",
        x - 0.45,
        YE + 1.6,
        z - 0.5,
        x + 0.45,
        YR + 0.6,
        z + 0.5,
        { tint: BRICK.map((v) => v * 0.9) },
      );
      b.boxMM(
        "limestone",
        x - 0.55,
        YR + 0.6,
        z - 0.6,
        x + 0.55,
        YR + 0.78,
        z + 0.6,
        { tint: BUFF },
      );
      b.burn(x, YR + 0.8, z, 0.7, 0.8);
    }

    // ============================================================ CRYSTAL ROOM (glass pavilion)
    const CW = CX1 - CX0,
      CD = CZ1 - CZ0;
    b.face("parquet", CX0, 0.05, CZ1, 1, 0, 0, 0, 0, -1, CW, CD, {
      uv: "top",
      tint: [0.5, 0.4, 0.3],
    });
    b.boxMM("limestone", CX0, -0.3, CZ0 - 0.1, CX1 + 0.1, 0.05, CZ1 + 0.1, {
      tint: BUFF.map((v) => v * 0.9),
      faces: "nsewt",
    });
    const frameT = [0.86, 0.86, 0.82];
    const postsZ = [];
    for (let z = CZ0; z <= CZ1 + 0.01; z += CD / 10) postsZ.push(z);
    for (const z of postsZ) {
      b.box("paint_white", CX1, 0.05, z, 0.12, CH, 0.12, { tint: frameT });
    }
    for (const x of [CX0 + CW / 3, CX0 + (2 * CW) / 3])
      for (const z of [CZ0, CZ1])
        b.box("paint_white", x, 0.05, z, 0.12, CH, 0.12, { tint: frameT });
    for (const y of [0.8, 2.9, CH]) {
      b.beam("paint_white", CX1, y, CZ0, CX1, y, CZ1, 0.1, 0.1, {
        tint: frameT,
      });
      b.beam("paint_white", CX0, y, CZ0, CX1, y, CZ0, 0.1, 0.1, {
        tint: frameT,
      });
      b.beam("paint_white", CX0, y, CZ1, CX1, y, CZ1, 0.1, 0.1, {
        tint: frameT,
      });
    }
    // glass: east wall bays (two panes lost), end walls, the pitched glass roof
    for (let i = 0; i < postsZ.length - 1; i++) {
      const z0 = postsZ[i],
        z1 = postsZ[i + 1],
        zm = (z0 + z1) / 2;
      if (i === 3) {
        d.quadN(
          "glass",
          [CX1, 0.8, z0 + 0.1],
          [CX1, 0.8, z0 + 0.6],
          [CX1, 1.9, z0 + 0.3],
          [CX1, 2.2, z0 + 0.1],
          [1, 0, 0],
          { tint: [0.5, 0.56, 0.55] },
        );
        continue;
      }
      b.plate("glass_clear", CX1, 2.9, zm, 1, 0, z1 - z0 - 0.1, 4.2, null, {
        off: 0.0,
        tint: [0.75, 0.82, 0.8],
      });
    }
    for (const z of [CZ0, CZ1])
      b.plate(
        "glass_clear",
        (CX0 + CX1) / 2,
        2.55,
        z,
        0,
        z === CZ1 ? 1 : -1,
        CW - 0.1,
        4.9,
        null,
        { off: 0.0, tint: [0.75, 0.82, 0.8] },
      );
    b.quadN(
      "glass_clear",
      [CX0, CH + 1.1, CZ1],
      [CX1 + 0.2, CH, CZ1],
      [CX1 + 0.2, CH, CZ0],
      [CX0, CH + 1.1, CZ0],
      [0.3, 1, 0],
      { tint: [0.7, 0.78, 0.76] },
    );
    for (let z = CZ0; z <= CZ1 + 0.01; z += CD / 10)
      b.beam("paint_white", CX0, CH + 1.1, z, CX1 + 0.2, CH, z, 0.08, 0.1, {
        tint: frameT,
      });
    b.beam("paint_white", CX0, CH + 1.1, CZ0, CX0, CH + 1.1, CZ1, 0.14, 0.14, {
      tint: frameT,
    });
    b.col(CX0, 0, CZ0 - 0.1, CX1 + 0.1, CH + 1.1, CZ1 + 0.1, {
      tag: "pavilion",
      walkable: false,
    });
    // inside: chandeliers (lit at night), round tables in white linen, dead ficus in tubs
    for (const z of [CZ0 + 2.4, (CZ0 + CZ1) / 2, CZ1 - 2.4])
      K.chandelier(d, (CX0 + CX1) / 2, 3.9, z, 0.65, {
        ceil: CH + 0.6,
        litB: lit,
        intensity: 0,
        glowSize: 3.2,
      });
    // at night the whole pavilion reads as a lantern: the brick wall behind the glass and the floor wash warm
    lit.plate(
      "lamp",
      CX0 + 0.06,
      2.5,
      (CZ0 + CZ1) / 2,
      1,
      0,
      CD - 0.2,
      4.6,
      null,
      { off: 0.0, tint: [0.5, 0.34, 0.18] },
    );
    lit.hplate(
      "lamp",
      (CX0 + CX1) / 2,
      0.07,
      (CZ0 + CZ1) / 2,
      CW - 0.3,
      CD - 0.3,
      0,
      null,
      { tint: [0.34, 0.22, 0.12] },
    );
    for (const z of [CZ0 + 2.4, (CZ0 + CZ1) / 2, CZ1 - 2.4])
      lit.glow(CX1 + 0.4, 3.2, z, [1, 0.7, 0.36], 4.2);
    for (const z of [CZ0 + 1.6, CZ0 + 4.4, CZ0 + 7.2, CZ0 + 10.0, CZ0 + 12.4]) {
      const x = (CX0 + CX1) / 2 + (r() - 0.5) * 0.8;
      K.roundTable(d, x, 0.05, z, 0.55, {
        mat: "wood_dark",
        cloth: [0.82, 0.8, 0.74],
        col: false,
      });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * PI * 2 + r();
        K.chair(
          d,
          x + Math.cos(a) * 0.85,
          0.05,
          z + Math.sin(a) * 0.85,
          -a - HP + PI,
          { mat: "paint_white", tint: [0.8, 0.78, 0.72] },
        );
      }
      d.cyl("glass", x, 0.81, z, 0.03, 0.04, 0.14, 6, {
        tint: [0.5, 0.6, 0.5],
      });
    }
    for (const z of [CZ0 + 0.5, CZ1 - 0.5]) {
      d.cyl("terrazzo", CX1 - 0.45, 0.05, z, 0.28, 0.22, 0.45, 8);
      K.deadTree(d, CX1 - 0.45, 0.5, z, 1.6, (z * 3) | 0);
    }

    // ============================================================ THE GREEN CANOPY + DOOR + NEON
    const AW = 2.8,
      AL = 4.3,
      AH = 2.95;
    // the front doors: a pair of green-painted glazed leaves in a buff-stone surround, the foyer's lamplight showing
    // through the panes day and night (the generator never stops) — unmistakably the way in
    const DG = [0.16, 0.3, 0.2],
      BRASS = [0.72, 0.58, 0.3],
      WARM = [0.95, 0.7, 0.42];
    b.boxMM(
      "wood_dark",
      DOOR.x - 1.02,
      0,
      BZ1 - 0.02,
      DOOR.x + 1.02,
      2.72,
      BZ1 + 0.02,
      { tint: [0.1, 0.08, 0.06] },
    ); // reveal
    for (const e of [-1, 1]) {
      b.boxMM(
        "limestone",
        DOOR.x + e * 1.0 - 0.14,
        0,
        BZ1,
        DOOR.x + e * 1.0 + 0.14,
        2.72,
        BZ1 + 0.14,
        { tint: BUFF },
      ); // jambs
      const x0 = e < 0 ? DOOR.x - 0.93 : DOOR.x + 0.02,
        x1 = e < 0 ? DOOR.x - 0.02 : DOOR.x + 0.93,
        cx = (x0 + x1) / 2;
      b.boxMM("lamp", x0 + 0.1, 0.95, BZ1 + 0.03, x1 - 0.1, 2.5, BZ1 + 0.05, {
        tint: WARM,
      }); // lit panes
      b.boxMM("paint_green", x0, 0, BZ1 + 0.05, x1, 0.95, BZ1 + 0.11, {
        tint: DG,
      }); // bottom panel
      b.boxMM("paint_green", x0, 2.5, BZ1 + 0.05, x1, 2.62, BZ1 + 0.11, {
        tint: DG,
      }); // top rail
      b.boxMM("paint_green", x0, 0.95, BZ1 + 0.05, x0 + 0.1, 2.5, BZ1 + 0.11, {
        tint: DG,
      }); // stiles
      b.boxMM("paint_green", x1 - 0.1, 0.95, BZ1 + 0.05, x1, 2.5, BZ1 + 0.11, {
        tint: DG,
      });
      for (const y of [1.46, 1.98])
        b.boxMM(
          "paint_green",
          x0 + 0.1,
          y - 0.025,
          BZ1 + 0.06,
          x1 - 0.1,
          y + 0.025,
          BZ1 + 0.1,
          { tint: DG },
        ); // glazing bars
      b.boxMM(
        "paint_green",
        cx - 0.02,
        0.95,
        BZ1 + 0.06,
        cx + 0.02,
        2.5,
        BZ1 + 0.1,
        { tint: DG },
      );
      b.boxMM(
        "brass",
        x0 + 0.12,
        0.2,
        BZ1 + 0.11,
        x1 - 0.12,
        0.45,
        BZ1 + 0.12,
        { tint: BRASS },
      ); // kick plate
      const hx = e < 0 ? x1 - 0.14 : x0 + 0.14;
      b.boxMM(
        "brass",
        hx - 0.03,
        0.9,
        BZ1 + 0.11,
        hx + 0.03,
        1.35,
        BZ1 + 0.17,
        { tint: BRASS },
      ); // pull handle
    }
    b.boxMM(
      "lamp",
      DOOR.x - 0.9,
      2.74,
      BZ1 + 0.02,
      DOOR.x + 0.9,
      3.0,
      BZ1 + 0.04,
      { tint: WARM.map((v) => v * 0.9) },
    ); // transom
    K.letters(
      b,
      DOOR.x,
      2.87,
      BZ1 + 0.05,
      0,
      1,
      1.5,
      0.16,
      "TAVERN ON THE GREEN",
      { fg: "#3a2a10", font: "Georgia, serif" },
    );
    b.plate(
      "art",
      DOOR.x + 0.48,
      1.72,
      BZ1 + 0.13,
      0,
      1,
      0.5,
      0.3,
      K.signCell("ppk_tav_open", "OPEN\nguns holstered", 128, 76, {
        bg: "#e8dcb8",
        fg: "#7a1810",
        font: "Georgia, serif",
        border: "#3a2a10",
      }),
      { off: 0.0 },
    );
    b.hplate("flat", DOOR.x, 0.175, BZ1 + 0.65, 1.6, 0.7, 0, null, {
      tint: [0.12, 0.28, 0.16],
    }); // doormat
    lit.glow(DOOR.x, 1.8, BZ1 + 0.25, [1, 0.66, 0.32], 2.2); // lamplight through the glass at night
    b.boxMM(
      "limestone",
      DOOR.x - 1.3,
      2.7,
      BZ1,
      DOOR.x + 1.3,
      3.05,
      BZ1 + 0.22,
      { tint: BUFF },
    );
    b.boxMM("limestone", DOOR.x - 1.4, 0, BZ1, DOOR.x + 1.4, 0.16, BZ1 + 1.0, {
      tint: BUFF.map((v) => v * 0.85),
    });
    // canopy: fabric roof on brass poles, scalloped valance
    const green = [0.12, 0.34, 0.2];
    b.quadN(
      "fabric",
      [DOOR.x - AW / 2, AH + 0.15, BZ1],
      [DOOR.x + AW / 2, AH + 0.15, BZ1],
      [DOOR.x + AW / 2, AH - 0.1, BZ1 + AL],
      [DOOR.x - AW / 2, AH - 0.1, BZ1 + AL],
      [0, 1, 0.05],
      { tint: green },
    );
    b.quadN(
      "fabric",
      [DOOR.x + AW / 2, AH + 0.12, BZ1],
      [DOOR.x - AW / 2, AH + 0.12, BZ1],
      [DOOR.x - AW / 2, AH - 0.13, BZ1 + AL],
      [DOOR.x + AW / 2, AH - 0.13, BZ1 + AL],
      [0, -1, 0],
      { tint: green.map((v) => v * 0.6) },
    );
    for (const e of [-1, 1])
      b.quadN(
        "fabric",
        [DOOR.x + (e * AW) / 2, AH - 0.5, BZ1],
        [DOOR.x + (e * AW) / 2, AH - 0.5, BZ1 + AL],
        [DOOR.x + (e * AW) / 2, AH - 0.1, BZ1 + AL],
        [DOOR.x + (e * AW) / 2, AH + 0.15, BZ1],
        [e, 0, 0],
        { tint: green.map((v) => v * 0.9) },
      );
    b.quadN(
      "fabric",
      [DOOR.x - AW / 2, AH - 0.6, BZ1 + AL],
      [DOOR.x + AW / 2, AH - 0.6, BZ1 + AL],
      [DOOR.x + AW / 2, AH - 0.1, BZ1 + AL],
      [DOOR.x - AW / 2, AH - 0.1, BZ1 + AL],
      [0, 0, 1],
      { tint: green },
    );
    for (let k = 0; k < 9; k++)
      b.geo("fabric", K.sphereGeo(), {
        x: DOOR.x - AW / 2 + 0.16 + (k * (AW - 0.32)) / 8,
        y: AH - 0.62,
        z: BZ1 + AL + 0.01,
        sx: 0.16,
        sy: 0.08,
        sz: 0.02,
        tint: green,
      });
    for (const z of [BZ1 + 1.4, BZ1 + AL - 0.1])
      for (const e of [-1, 1])
        b.pipe(
          "brass",
          DOOR.x + e * (AW / 2 - 0.05),
          0.02,
          z,
          DOOR.x + e * (AW / 2 - 0.05),
          AH,
          z,
          0.035,
          6,
          { tint: [0.7, 0.56, 0.3] },
        );
    b.col(DOOR.x - AW / 2, AH - 0.6, BZ1, DOOR.x + AW / 2, AH + 0.2, BZ1 + AL, {
      tag: "canopy",
      walkable: true,
    });
    // the neon script on the canopy (always on — the settlement's pride) + gold lettering on the valance
    const neon = K.neonCell("ppk_tav_neon", "Tavern on the Green", 768, 180, {
      color: "#3aff7a",
      font: "Brush Script MT, Segoe Script, cursive",
      italic: true,
      weight: "normal",
    });
    b.plate("neon", DOOR.x, AH + 0.55, BZ1 + AL - 0.15, 0, 1, 3.4, 0.8, neon, {
      off: 0.0,
      tint: [0.9, 1, 0.92],
    });
    b.glow(DOOR.x, AH + 0.55, BZ1 + AL, [0.2, 0.9, 0.4], 3.0);
    b.plate(
      "art",
      DOOR.x,
      AH - 0.35,
      BZ1 + AL + 0.02,
      0,
      1,
      2.5,
      0.28,
      K.signCell("ppk_tav_valance", "SINCE 1934 · TRADERS WELCOME", 480, 54, {
        bg: null,
        fg: "#e0c070",
        font: "Georgia, serif",
      }),
      { off: 0.0 },
    );
    // brass lanterns either side of the door (lit at night)
    for (const e of [-1, 1]) {
      const lx = DOOR.x + e * 1.25;
      b.beam("brass", lx, 2.2, BZ1, lx, 2.2, BZ1 + 0.35, 0.04, 0.04, {
        tint: [0.6, 0.48, 0.26],
      });
      b.cyl("glass", lx, 1.72, BZ1 + 0.35, 0.11, 0.13, 0.38, 6, {
        tint: [0.6, 0.55, 0.45],
      });
      b.cyl("brass", lx, 2.1, BZ1 + 0.35, 0.14, 0.02, 0.18, 6, {
        tint: [0.6, 0.48, 0.26],
      });
      lit.geo("lamp", K.sphereGeo(), {
        x: lx,
        y: 1.9,
        z: BZ1 + 0.35,
        s: 0.08,
        tint: [1, 0.72, 0.38],
      });
      lit.glow(lx, 1.9, BZ1 + 0.35, [1, 0.62, 0.3], 1.6);
    }

    // ============================================================ COURTYARD
    b.quadGrid(
      "granite",
      [YX0, 0.03, YZ1],
      [YX1, 0.03, YZ1],
      [YX1, 0.03, YZ0],
      [YX0, 0.03, YZ0],
      { tint: [0.58, 0.55, 0.5], uv: "top", seg: 3 },
    );
    for (let k = 0; k < 24; k++)
      d.hplate(
        "decal",
        YX0 + 1 + r() * 13,
        0.04 + k * 0.0005,
        YZ0 + 0.5 + r() * 10.5,
        0.8 + r() * 1.2,
        0.8 + r() * 1.2,
        r() * 6,
        K.decal(k % 4 ? "grime" : "crack", 200 + k),
      );
    // fences: south (gate), east (gate to the drive), west (inside the park wall)
    K.ironFence(b, YX0, YZ1, YX1, YZ1, 0, {
      h: 1.5,
      gapAt: GATE.x - YX0,
      gapW: 2.4,
    });
    K.ironFence(b, YX1, YZ1, YX1, YZ0, 0, {
      h: 1.5,
      gapAt: YZ1 - EGATE.z,
      gapW: 2.0,
    });
    K.ironFence(b, YX0, YZ0, YX0, YZ1, 0, { h: 1.5 });
    for (const [x, z] of [
      [YX0, YZ1],
      [YX1, YZ1],
      [GATE.x - 1.3, YZ1],
      [GATE.x + 1.3, YZ1],
      [YX1, EGATE.z - 1.1],
      [YX1, EGATE.z + 1.1],
      [YX1, YZ0],
      [YX0, YZ0],
    ]) {
      b.boxMM("brick_red", x - 0.3, 0, z - 0.3, x + 0.3, 1.8, z + 0.3, {
        tint: BRICK,
      });
      b.boxMM("limestone", x - 0.36, 1.8, z - 0.36, x + 0.36, 1.95, z + 0.36, {
        tint: BUFF,
      });
      b.col(x - 0.3, 0, z - 0.3, x + 0.3, 1.95, z + 0.3, { tag: "pier" });
    }
    // gate arch with the painted sign
    for (let i = 0; i < 10; i++) {
      const a0 = (PI * i) / 10,
        a1 = (PI * (i + 1)) / 10;
      b.beam(
        "black_iron",
        GATE.x + Math.cos(a0) * 1.3,
        2.6 + Math.sin(a0) * 0.6,
        YZ1,
        GATE.x + Math.cos(a1) * 1.3,
        2.6 + Math.sin(a1) * 0.6,
        YZ1,
        0.06,
        0.06,
        { tint: [0.16, 0.15, 0.14] },
      );
    }
    for (const e of [-1, 1])
      b.beam(
        "black_iron",
        GATE.x + e * 1.3,
        1.95,
        YZ1,
        GATE.x + e * 1.3,
        2.6,
        YZ1,
        0.06,
        0.06,
        { tint: [0.16, 0.15, 0.14] },
      );
    for (const nz of [1, -1])
      b.plate(
        "art",
        GATE.x,
        2.75,
        YZ1,
        0,
        nz,
        2.3,
        0.4,
        K.signCell("ppk_tav_gate", "TAVERN ON THE GREEN", 460, 80, {
          bg: "#1e3a26",
          fg: "#e8d8a0",
          font: "Georgia, serif",
          border: "#c8a850",
        }),
        { off: 0.04 },
      );
    b.plate(
      "art",
      GATE.x + 2.3,
      1.2,
      YZ1 + 0.06,
      0,
      1,
      1.0,
      0.7,
      K.signCell(
        "ppk_tav_rules",
        "ALL WELCOME\nWEAPONS HOLSTERED\nNO CREDIT",
        200,
        140,
        {
          bg: "#e8e0c8",
          fg: "#2a1a10",
          font: "Georgia, serif",
          border: "#2a1a10",
        },
      ),
      { off: 0.03 },
    );
    // dead trees wound in lights
    const trees = [
      [-107.4, -556.4, 5.2],
      [-107.4, -547.6, 5.6],
      [-95.4, -547.6, 5.4],
      [-95.9, -556.2, 5.0],
    ];
    trees.forEach(([x, z, h], i) => {
      K.deadTree(b, x, 0, z, h, 400 + i);
      b.cyl("granite", x, 0, z, 0.75, 0.75, 0.25, 10, {
        tint: [0.5, 0.48, 0.44],
      });
      // spiral of bulbs up the trunk and out along four limbs
      const pts = [];
      for (let k = 0; k <= 10; k++) {
        const t = k / 10,
          a = t * PI * 6;
        pts.push([
          x + Math.cos(a) * 0.24,
          0.5 + t * h * 0.5,
          z + Math.sin(a) * 0.24,
        ]);
      }
      for (let k = 0; k < pts.length - 1; k++)
        K.lanternRun(d, lit, pts[k], pts[k + 1], {
          n: 2,
          sag: 0.02,
          glow: 0.6,
        });
      for (let k = 0; k < 4; k++) {
        const a = k * HP + i;
        K.lanternRun(
          d,
          lit,
          [x, h * 0.55, z],
          [x + Math.cos(a) * 2.2, h * 0.85, z + Math.sin(a) * 2.2],
          { n: 5, sag: 0.1, glow: 0.7 },
        );
      }
    });
    // festoons across the courtyard: building eave → trees → gate
    const eave = [
      [BX0 + 0.5, YE - 0.2, BZ1 + 0.1],
      [DOOR.x - 1.6, YE - 0.2, BZ1 + 0.1],
      [DOOR.x + 1.6, YE - 0.2, BZ1 + 0.1],
      [BX1 - 0.3, YE - 0.2, BZ1 + 0.1],
    ];
    K.lanternRun(d, lit, eave[0], [trees[1][0], 4.2, trees[1][1]], {
      n: 14,
      sag: 0.9,
      kind: "paper",
      glow: 1.0,
    });
    K.lanternRun(d, lit, eave[1], [GATE.x - 1.3, 2.6, YZ1], {
      n: 14,
      sag: 0.8,
      kind: "paper",
      glow: 1.0,
    });
    K.lanternRun(d, lit, eave[2], [trees[2][0], 4.2, trees[2][1]], {
      n: 14,
      sag: 0.9,
      kind: "paper",
      glow: 1.0,
    });
    K.lanternRun(d, lit, eave[3], [trees[3][0], 3.6, trees[3][1]], {
      n: 6,
      sag: 0.4,
      kind: "paper",
      glow: 1.0,
    });
    K.lanternRun(
      d,
      lit,
      [trees[0][0], 3.6, trees[0][1]],
      [trees[1][0], 3.8, trees[1][1]],
      { n: 10, sag: 0.7 },
    );
    K.lanternRun(
      d,
      lit,
      [trees[1][0], 3.9, trees[1][1]],
      [trees[2][0], 3.9, trees[2][1]],
      { n: 16, sag: 1.0 },
    );
    K.lanternRun(
      d,
      lit,
      [trees[2][0], 3.7, trees[2][1]],
      [trees[3][0], 3.6, trees[3][1]],
      { n: 10, sag: 0.7 },
    );
    K.lanternRun(
      d,
      lit,
      [GATE.x + 1.3, 2.6, YZ1],
      [trees[3][0], 3.4, trees[3][1]],
      { n: 14, sag: 0.8, kind: "paper", glow: 1.0 },
    );
    // café tables under umbrellas
    const tables = [
      [-104.8, -552.4, [0.2, 0.42, 0.28]],
      [-98.6, -550.4, [0.62, 0.52, 0.34]],
      [-99.4, -555.9, [0.2, 0.42, 0.28]],
      [-105.6, -548.4, [0.55, 0.22, 0.18]],
    ];
    tables.forEach(([x, z, tint], i) => {
      K.roundTable(d, x, 0.03, z, 0.5, {
        mat: "paint_white",
        tint: [0.72, 0.72, 0.68],
        col: false,
      });
      b.col(x - 0.4, 0, z - 0.4, x + 0.4, 0.78, z + 0.4, {
        tag: "table",
        surface: "metal",
      });
      K.umbrella(d, x, 0.03, z, 1.25, { tint, tilt: i === 2 ? 0.25 : 0 });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * PI * 2 + i;
        K.chair(
          d,
          x + Math.cos(a) * 0.8,
          0.03,
          z + Math.sin(a) * 0.8,
          -a - HP + PI,
          {
            mat: "paint_white",
            tint: [0.72, 0.72, 0.68],
            fallen: i === 3 && k === 1,
          },
        );
      }
      d.cyl("glass", x + 0.1, 0.79, z, 0.05, 0.05, 0.14, 8, {
        tint: [0.7, 0.55, 0.3],
      }); // candle jar
      lit.glow(x + 0.1, 0.9, z, [1, 0.6, 0.25], 0.6);
    });
    // the topiaries: King Kong (west), an elephant (east), a rabbit by the door
    K.wireFrame(b, "kong", -107.6, 0, -552.0, HP, 1.25);
    K.wireFrame(b, "elephant", -95.8, 0, -553.3, 0, 1.0);
    K.wireFrame(b, "rabbit", DOOR.x + 2.3, 0, BZ1 + 1.2, 0.4, 0.9);
    // park lamps (lit at night), a hitching rail by the east gate, the guard's sandbag nest
    for (const [x, z] of [
      [GATE.x - 2.2, YZ1 - 0.8],
      [GATE.x + 2.2, YZ1 - 0.8],
      [YX0 + 0.7, -549.9],
      [BX1 + 0.4, -557.2],
    ])
      K.parkLamp(b, lit, x, 0, z, {});
    d.plate(
      "art",
      YX1 + 0.05,
      1.25,
      EGATE.z - 1.6,
      1,
      0,
      1.2,
      0.45,
      K.signCell("ppk_pen", "PACK OXEN PEN\n← across the drive", 240, 90, {
        bg: "#e8e0c8",
        fg: "#2a1a10",
        font: "Georgia, serif",
      }),
      { off: 0.03 },
    );
    for (let k = 0; k < 6; k++) {
      const a = PI * 0.95 + k * 0.28,
        x = -95.6 + Math.cos(a) * 1.6,
        z = -545.3 + Math.sin(a) * 1.2;
      if (z > YZ1 + 0.2)
        for (let j = 0; j < 2; j++)
          d.box("fabric", x, j * 0.3, z, 0.8, 0.3, 0.42, {
            yaw: -a + HP,
            tint: [0.5, 0.46, 0.36],
          });
    }
    // generator shed + cables (what keeps the lights on)
    const SX0 = -99.0,
      SX1 = -95.4,
      SZ0 = -575.2,
      SZ1 = -573.4;
    b.boxMM("corrugated", SX0, 0, SZ0, SX1, 2.2, SZ1, {
      tint: [0.55, 0.5, 0.42],
    });
    b.quadN(
      "corrugated",
      [SX0 - 0.2, 2.2, SZ1 + 0.3],
      [SX1 + 0.2, 2.2, SZ1 + 0.3],
      [SX1 + 0.2, 2.5, SZ0 - 0.2],
      [SX0 - 0.2, 2.5, SZ0 - 0.2],
      [0, 1, 0.3],
      { tint: [0.5, 0.42, 0.34] },
    );
    b.col(SX0, 0, SZ0, SX1, 2.4, SZ1, { tag: "shed", surface: "metal" });
    b.plate(
      "art",
      (SX0 + SX1) / 2,
      1.4,
      SZ1 + 0.02,
      0,
      1,
      1.4,
      0.4,
      K.signCell("ppk_gen_shed", "GENERATOR · KEEP OUT", 320, 80, {
        bg: "#c8b040",
        fg: "#1a1a1a",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.02 },
    );
    d.pipe(
      "metal_dark",
      SX1 - 0.3,
      2.2,
      SZ0 + 0.6,
      SX1 - 0.3,
      3.4,
      SZ0 + 0.6,
      0.08,
      6,
      { tint: [0.25, 0.25, 0.24] },
    );
    d.pipe("rubber", SX0, 1.6, SZ1 - 0.2, BX1, 3.8, -571, 0.03, 4);
    d.pipe("rubber", BX1, 3.8, -571, BX1 + 0.05, 3.7, -560, 0.03, 4);
    // litter, crates, a trash barrel fire by the gate guard
    K.litter(d, YX0 + 0.5, YZ0 + 0.5, YX1 - 0.5, YZ1 - 0.5, 0.04, 16, 8101);
    for (let k = 0; k < 4; k++)
      d.box(
        "wood",
        YX1 - 1.4 - (k % 2) * 0.9,
        k >= 2 ? 0.7 : 0,
        -555.4 + (k % 2) * 0.1,
        0.8,
        0.7,
        0.7,
        { yaw: r() * 0.3, tint: [0.5, 0.42, 0.3] },
      );
    b.col(YX1 - 2.3, 0, -555.8, YX1 - 0.9, 1.4, -555.0, {
      tag: "crates",
      surface: "wood",
    });

    // ------------------------------------------------------------ finish
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_tavern_ext";
    const det = d.finish(ctx.extRoot);
    det.name = "poi_tavern_detail";
    try {
      G.world.addLOD(det, 150, new THREE.Vector3(-101, BY, -560));
    } catch (e) {
      /* optional */
    }
    ctx.litGroup = lit.finish(ctx.extRoot);
    ctx.litGroup.visible = false;

    // ------------------------------------------------------------ anchors, props
    K.anchor(ctx, "door", DOOR.x, BY, BZ1 + 5.2, false);
    K.anchor(ctx, "gate", GATE.x, BY, YZ1 + 1.2, false);
    K.anchor(ctx, "east_gate", EGATE.x + 1.0, BY, EGATE.z, false);
    K.anchor(ctx, "courtyard", -101.8, BY, -551.6, false);
    K.anchor(ctx, "guard", GATE.x + 1.2, BY, YZ1 + 0.9, false);
    K.anchor(ctx, "guard2", YX1 - 1.4, BY, -549.4, false);
    K.anchor(ctx, "patio1", -104.2, BY, -552.9, false);
    K.anchor(ctx, "pen", -79, BY, -557, false);
    K.anchor(ctx, "raid1", -96.8, BY, -552.3, false);
    K.anchor(ctx, "raid2", -102.4, BY, -548.2, false);
    K.anchor(ctx, "raid3", -91.0, BY, -549.5, false);
    K.loot(ctx, "trash_can", GATE.x - 3.2, BY, YZ1 - 0.7, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "barrel", -95.2, BY, -545.2, 0, {
      world: true,
      burning: true,
      container: false,
    });
    K.loot(ctx, "crate", YX1 - 1.4, BY + 1.4, -555.3, 0.1, {
      world: true,
      kind: "plain",
      loot: "junk_household",
      name: "Tavern Crate",
      owner: "settlers",
    });
  }

