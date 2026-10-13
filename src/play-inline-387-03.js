// play-inline-387 03 — tint
// Lines 59-1255 of readable/play-inline-387.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "fa_ext", grime: 0.42 });
    const r = K.rng("fa_ext");
    const {
      X0,
      X1,
      Z0,
      Z1,
      PY,
      STEP_X,
      WALL_X,
      COL_X,
      COL_TOP,
      ROOF,
      PZ0,
      PZ1,
      DOCK_X,
    } = FA;
    const ENT0 = COL_TOP,
      ENT1 = COL_TOP + 3.0; // entablature 15..18

    // ---------------- plaza paving in front (inside the footprint) ----------------
    b.face(
      "granite_pale",
      STEP_X,
      0.02,
      Z1,
      1,
      0,
      0,
      0,
      0,
      -1,
      X1 - STEP_X,
      Z1 - Z0,
      { uv: "top", tint: [0.72, 0.7, 0.66], grime: 0.6 },
    );
    for (let k = 0; k < 9; k++)
      b.hplate(
        "decal",
        STEP_X + 1 + r() * 3.6,
        0.03 + k * 0.001,
        Z0 + r() * (Z1 - Z0),
        1.4 + r() * 2,
        1.2 + r() * 1.5,
        r() * 3,
        K.decal(k % 3 ? "grime" : "crack", k),
      );

    // ---------------- the grand flight of steps (12 × 0.25 m) ----------------
    {
      const n = 12,
        run = (X1 - STEP_X) / n;
      for (let i = 0; i < n; i++) {
        const xa = X1 - run * i,
          top = (PY * (i + 1)) / n;
        b.boxMM(
          "granite_pale",
          xa - 0.02,
          top - PY / n,
          PZ0,
          xa,
          top - 0.05,
          PZ1,
          { tint: [0.58, 0.56, 0.53], faces: "e", grime: 0.55 },
        ); // shadowed riser
        b.boxMM(
          "granite_pale",
          xa - run,
          top - 0.05,
          PZ0,
          xa + 0.05,
          top,
          PZ1,
          { tint: [0.95, 0.93, 0.89], faces: "et", grime: 0.25 },
        ); // pale tread + nosing
        b.col(xa - run, 0, PZ0, xa, top, PZ1, {
          tag: "stairs",
          surface: "concrete",
        });
      }
      // the stone cheek walls where the steps meet the pavilions
      for (const [za, zb] of [
        [PZ0 - 0.9, PZ0],
        [PZ1, PZ1 + 0.9],
      ]) {
        b.quadN(
          "granite_pale",
          [X1 - 0.3, 0, za],
          [STEP_X, PY + 0.4, za],
          [STEP_X, PY + 0.4, zb],
          [X1 - 0.3, 0.7, zb],
          [0.55, 0.83, 0],
          { tint: GRAN },
        );
        b.boxMM("granite_pale", X1 - 0.3, 0, za, STEP_X, 0.7, zb, {
          tint: GRAN.map((v) => v * 0.9),
          faces: "nse",
        });
        for (const zz of [za, zb])
          b.quadN(
            "granite_pale",
            [X1 - 0.3, 0, zz],
            [STEP_X, 0, zz],
            [STEP_X, PY + 0.4, zz],
            [X1 - 0.3, 0.7, zz],
            [0, 0, zz === za ? -1 : 1],
            { tint: GRAN.map((v) => v * 0.86) },
          );
        b.ocol(
          (X1 - 0.3 + STEP_X) / 2,
          (za + zb) / 2,
          X1 - 0.3 - STEP_X,
          zb - za,
          0,
          PY * 0.6,
          0,
          { tag: "building" },
        );
      }
    }
    // ---------------- stylobate / portico floor ----------------
    b.boxMM("granite_pale", WALL_X, 0, PZ0, STEP_X, PY, PZ1, {
      tint: [0.84, 0.82, 0.78],
      faces: "t",
    });
    b.col(WALL_X, 0, PZ0, STEP_X, PY, PZ1, {
      tag: "floor",
      surface: "concrete",
    });

    // ---------------- building body (behind the loggia) ----------------
    const body = { x0: DOCK_X, x1: WALL_X, z0: Z0, z1: Z1 };
    // north + south elevations: rusticated granite base, two-storey pilaster order with tall windows, cornice, attic
    for (const [zf, nz] of [
      [Z0, -1],
      [Z1, 1],
    ]) {
      K.fwall(b, "granite_dark", body.x0, zf, STEP_X, zf, 0, 4.2, 0, nz, {
        tint: [0.74, 0.71, 0.67],
      });
      for (let k = 0; k < 6; k++)
        b.boxMM(
          "granite_dark",
          body.x0,
          0.55 + k * 0.62,
          zf + nz * 0.0,
          STEP_X,
          0.6 + k * 0.62,
          zf + nz * 0.03,
          { tint: [0.45, 0.43, 0.4], faces: nz < 0 ? "n" : "s" },
        ); // rustication grooves
      K.fwall(b, "ashlar", body.x0, zf, STEP_X, zf, 4.2, ENT1 - 4.2, 0, nz, {
        tint: STONE,
      });
      b.boxMM("granite_pale", body.x0, 4.0, zf, STEP_X, 4.35, zf + nz * 0.25, {
        tint: STONE,
        faces: "nsewtb",
      }); // belt course
      const bays = 10,
        span = (STEP_X - body.x0) / bays;
      for (let k = 0; k < bays; k++) {
        const wx = body.x0 + span * (k + 0.5);
        // ground floor: segmental windows with iron grilles
        K.window(b, wx, 2.2, zf, 0, nz, 1.3, 2.2, {
          state: k % 3 === 1 ? "boarded" : "dark",
          surround: "granite_dark",
          surroundTint: [0.6, 0.58, 0.55],
          lintel: 0.35,
          lintelMat: "granite_dark",
          sillMat: "granite_dark",
        });
        for (let q = 0; q < 5; q++)
          b.beam(
            "black_iron",
            wx - 0.55 + q * 0.275,
            1.1,
            zf + nz * 0.2,
            wx - 0.55 + q * 0.275,
            3.3,
            zf + nz * 0.2,
            0.03,
            0.03,
            { tint: [0.25, 0.25, 0.24] },
          );
        // two-storey window between pilasters
        const st = r() < 0.18 ? "broken" : r() < 0.25 ? "boarded" : "dark";
        K.window(b, wx, 9.2, zf, 0, nz, 1.7, 7.6, {
          state: st,
          surround: "limestone",
          surroundTint: STONE,
          lintel: 0.5,
          sillMat: "limestone",
          frame: "bronze",
        });
        b.boxMM(
          "bronze",
          wx - 0.85,
          8.45,
          zf + nz * 0.02,
          wx + 0.85,
          8.9,
          zf + nz * 0.08,
          { tint: [0.35, 0.38, 0.3] },
        ); // spandrel panel
        K.window(b, wx, 20.0, zf, 0, nz, 1.1, 1.3, {
          state: "dark",
          surround: "limestone",
          surroundTint: STONE,
          sill: false,
        });
        if (k > 0)
          K.pilaster(
            b,
            body.x0 + span * k,
            4.35,
            zf,
            0,
            nz,
            0.8,
            COL_TOP - 4.35,
            { mat: "limestone", tint: STONE.map((v) => v * 0.96), depth: 0.3 },
          );
      }
    }
    // west elevation (above the loading dock): plain ashlar, grid of windows
    K.fwall(b, "granite_dark", DOCK_X, Z0, DOCK_X, Z1, 0, 4.2, -1, 0, {
      tint: [0.7, 0.68, 0.64],
    });
    K.fwall(b, "ashlar", DOCK_X, Z0, DOCK_X, Z1, 4.2, ROOF - 4.2, -1, 0, {
      tint: STONE.map((v) => v * 0.9),
    });
    for (let k = 0; k < 7; k++)
      for (let j = 0; j < 3; j++)
        K.window(
          b,
          DOCK_X,
          7.5 + j * 4.6,
          Z0 + 2.4 + k * 3.55,
          -1,
          0,
          1.3,
          2.6,
          {
            state: r() < 0.25 ? "broken" : "dark",
            surround: "limestone",
            surroundTint: STONE,
            sillMat: "limestone",
          },
        );
    b.col(DOCK_X, 0, Z0, WALL_X, ROOF, Z1, { tag: "building" });

    // ---------------- end pavilions ----------------
    for (const [pz0, pz1] of [
      [Z0, PZ0],
      [PZ1, Z1],
    ]) {
      const pc = (pz0 + pz1) / 2;
      // front (east) face: rusticated base, tall arched window, niche
      K.fwall(b, "granite_dark", STEP_X, pz0, STEP_X, pz1, 0, PY + 1.2, 1, 0, {
        tint: [0.72, 0.7, 0.66],
      });
      for (let k = 0; k < 7; k++)
        b.boxMM(
          "granite_dark",
          STEP_X,
          0.5 + k * 0.6,
          pz0,
          STEP_X + 0.03,
          0.55 + k * 0.6,
          pz1,
          { tint: [0.42, 0.4, 0.38], faces: "e" },
        );
      K.fwall(
        b,
        "ashlar",
        STEP_X,
        pz0,
        STEP_X,
        pz1,
        PY + 1.2,
        ENT0 - PY - 1.2,
        1,
        0,
        { tint: STONE },
      );
      K.archWin(b, STEP_X, 6.0, pc, 1, 0, 1.9, 7.2, {
        state: "dark",
        surround: "limestone",
        surroundTint: STONE,
        keystone: true,
      });
      for (const s of [-1, 1])
        K.pilaster(
          b,
          STEP_X,
          PY + 1.2,
          pc + s * 1.35,
          1,
          0,
          0.55,
          ENT0 - PY - 1.2,
          { mat: "limestone", tint: STONE, depth: 0.25 },
        );
      // loggia-side face of the pavilion (facing the colonnade)
      const inner = pz0 === Z0 ? pz1 : pz0,
        nzI = pz0 === Z0 ? 1 : -1;
      K.fwall(
        b,
        "ashlar",
        WALL_X,
        inner,
        STEP_X,
        inner,
        PY,
        ENT0 - PY,
        0,
        nzI,
        { tint: STONE.map((v) => v * 0.85) },
      );
      K.archWin(b, (WALL_X + STEP_X) / 2, PY + 2.2, inner, 0, nzI, 1.4, 5.0, {
        state: "dark",
        surround: "limestone",
        surroundTint: STONE,
      });
      b.col(WALL_X, 0, pz0, STEP_X, ENT1, pz1, { tag: "building" });
    }

    // ---------------- colonnade: ten Corinthian columns (one snapped off) ----------------
    const NC = 10,
      cols = [];
    for (let i = 0; i < NC; i++) {
      // a wider central bay (1.6 m) in front of the main door so the way in isn't a squeeze between two shafts
      const cz =
        PZ0 +
        0.85 +
        (i * (PZ1 - PZ0 - 1.7)) / (NC - 1) +
        (i < NC / 2
          ? (-0.38 * i) / (NC / 2 - 1)
          : (0.38 * (NC - 1 - i)) / (NC / 2 - 1));
      cols.push(cz);
      const broken = i === 2 ? 0.42 : 0;
      K.corinthian(b, COL_X, PY, cz, 0.5, COL_TOP - PY, {
        mat: "granite_pale",
        tint: STONE.map((v) => v * (0.93 + r() * 0.08)),
        broken,
      });
      b.col(
        COL_X - 0.55,
        PY,
        cz - 0.55,
        COL_X + 0.55,
        broken ? PY + 5.5 : COL_TOP,
        cz + 0.55,
        { tag: "column", walkable: false },
      );
    }
    FA.cols = cols;
    // the fallen drums of column 3 — rolled down the steps and onto the plaza
    {
      const dz = cols[2];
      const drums = [
        [-143.2, PY * 0.55, dz + 0.9, 0.3],
        [-141.6, 1.0, dz - 1.4, 1.2],
        [-139.8 - 0.4, 0.5, dz + 2.8, 0.2],
      ];
      for (const [x, y, z, rot] of drums) {
        b.geo("granite_pale", K.unitCyl(20), {
          x,
          y,
          z,
          sx: 0.47,
          sy: 1.25,
          sz: 0.47,
          rz: HP,
          ry: rot,
          tint: STONE.map((v) => v * 0.92),
        });
        b.col(x - 0.6, y - 0.47, z - 0.7, x + 0.6, y + 0.4, z + 0.7, {
          tag: "rubble",
          surface: "rubble",
        });
      }
      // the capital lies upside-down on the portico, chipped
      b.box("granite_pale", COL_X + 0.6, PY, dz - 1.6, 1.3, 0.55, 1.3, {
        yaw: 0.4,
        tint: STONE.map((v) => v * 0.88),
      });
      b.cyl(
        "granite_pale",
        COL_X + 0.6,
        PY + 0.55,
        dz - 1.6,
        0.6,
        0.45,
        0.8,
        12,
        { tint: STONE.map((v) => v * 0.85) },
      );
      b.col(COL_X, PY, dz - 2.3, COL_X + 1.3, PY + 1.3, dz - 0.9, {
        tag: "rubble",
      });
      K.rubble(b, -141.0, 0.02, dz + 1.2, 1.1, 0.45, {
        seed: 71,
        tint: [0.84, 0.8, 0.74],
      });
      // the gap in the entablature above (cracked, sagging) — soot streaks
      b.burn(COL_X, COL_TOP + 1, dz, 3.2, 0.45);
    }

    // ---------------- loggia: back wall, bronze doors, lanterns, coffered ceiling ----------------
    K.fwall(b, "ashlar", WALL_X, PZ0, WALL_X, PZ1, PY, COL_TOP - PY, 1, 0, {
      tint: STONE.map((v) => v * 0.9),
    });
    const doorsZ = [-126.8, -122.9, -119, -115.1, -111.2];
    for (const dz of doorsZ) {
      // bronze doorway: surround, leaves, lit transom grille (the lobby lights are still on)
      b.boxMM(
        "limestone",
        WALL_X,
        PY,
        dz - 1.3,
        WALL_X + 0.22,
        PY + 6.2,
        dz - 1.0,
        { tint: STONE },
      );
      b.boxMM(
        "limestone",
        WALL_X,
        PY,
        dz + 1.0,
        WALL_X + 0.22,
        PY + 6.2,
        dz + 1.3,
        { tint: STONE },
      );
      b.boxMM(
        "limestone",
        WALL_X,
        PY + 6.2,
        dz - 1.45,
        WALL_X + 0.4,
        PY + 6.6,
        dz + 1.45,
        { tint: STONE, faces: "nsewtb" },
      );
      b.boxMM(
        "bronze",
        WALL_X,
        PY,
        dz - 1.0,
        WALL_X + 0.06,
        PY + 4.3,
        dz + 1.0,
        { tint: [0.42, 0.44, 0.34] },
      );
      for (const s of [-1, 1])
        for (const [y0, y1] of [
          [0.3, 1.9],
          [2.1, 4.0],
        ])
          b.boxMM(
            "bronze",
            WALL_X + 0.06,
            PY + y0,
            dz + s * 0.5 - 0.38,
            WALL_X + 0.1,
            PY + y1,
            dz + s * 0.5 + 0.38,
            { tint: [0.36, 0.4, 0.3] },
          );
      b.boxMM(
        "bronze",
        WALL_X + 0.06,
        PY + 4.3,
        dz - 1.0,
        WALL_X + 0.14,
        PY + 4.45,
        dz + 1.0,
        { tint: [0.36, 0.4, 0.3] },
      );
      b.plate("lamp", WALL_X + 0.04, PY + 5.3, dz, 1, 0, 1.9, 1.6, null, {
        tint: [0.75, 0.55, 0.3],
        off: 0.01,
      });
      for (let q = 0; q < 7; q++)
        b.beam(
          "bronze",
          WALL_X + 0.1,
          PY + 4.5,
          dz - 0.9 + q * 0.3,
          WALL_X + 0.1,
          PY + 6.15,
          dz - 0.9 + q * 0.3,
          0.04,
          0.04,
          { tint: [0.3, 0.32, 0.26] },
        );
      b.glow(WALL_X + 0.4, PY + 5.3, dz, [0.45, 0.32, 0.16], 2.6);
      // upper windows (mezzanine) above each door
      K.window(b, WALL_X, PY + 9.3, dz, 1, 0, 1.6, 3.2, {
        state: dz === -119 ? "lit" : "dark",
        surround: "limestone",
        surroundTint: STONE,
        frame: "bronze",
      });
    }
    // the main door gets an "OPEN" neon over the transom, a mat and the brass plaque
    b.plate(
      "neon",
      WALL_X + 0.3,
      PY + 7.15,
      -119,
      1,
      0,
      2.6,
      0.5,
      K.neonCell("ppn_fa_open", "OPEN 24 HOURS", 512, 96, { color: "#ff4a2a" }),
      { off: 0.0 },
    );
    b.plate(
      "art",
      WALL_X + 0.24,
      PY + 2.0,
      -120.55,
      1,
      0,
      0.5,
      0.7,
      K.signCell(
        "ppn_fa_hours",
        "WINDOW\nSERVICE\n\nROBOT\nOPERATED",
        96,
        140,
        { bg: "#1e2a24", fg: "#d8c890", font: "Georgia, serif" },
      ),
      { off: 0.0 },
    );
    // loggia ceiling (coffered soffit) + lanterns
    b.face(
      "coffer",
      WALL_X,
      COL_TOP,
      PZ0,
      1,
      0,
      0,
      0,
      0,
      1,
      STEP_X - WALL_X,
      PZ1 - PZ0,
      { uv: "top", tint: [0.68, 0.66, 0.62] },
    );
    for (const lz of [-125, -119, -113]) {
      b.pipe(
        "black_iron",
        -146.5,
        COL_TOP,
        lz,
        -146.5,
        COL_TOP - 3.2,
        lz,
        0.02,
        4,
      );
      b.cyl("bronze", -146.5, COL_TOP - 4.3, lz, 0.28, 0.36, 1.0, 6, {
        tint: [0.3, 0.34, 0.26],
      });
      b.cyl("bronze", -146.5, COL_TOP - 3.3, lz, 0.4, 0.05, 0.25, 6, {
        tint: [0.3, 0.34, 0.26],
      });
      if (lz !== -125) {
        b.cyl("lamp", -146.5, COL_TOP - 4.15, lz, 0.2, 0.26, 0.75, 6, {
          tint: [1, 0.78, 0.45],
        });
        b.glow(-146.5, COL_TOP - 3.8, lz, [0.9, 0.62, 0.3], 2.8);
      } else
        b.cyl("glass", -146.5, COL_TOP - 4.15, lz, 0.2, 0.26, 0.75, 6, {
          tint: [0.3, 0.3, 0.28],
        });
    }

    // ---------------- entablature with the inscription ----------------
    b.boxMM(
      "limestone",
      STEP_X - 1.8,
      ENT0,
      Z0 - 0.02,
      STEP_X,
      ENT0 + 0.9,
      Z1 + 0.02,
      { tint: STONE, faces: "esntb" },
    ); // architrave
    b.boxMM(
      "limestone",
      STEP_X - 0.05,
      ENT0 + 0.3,
      Z0,
      STEP_X + 0.06,
      ENT0 + 0.38,
      Z1,
      { tint: STONE.map((v) => v * 1.05), faces: "etb" },
    );
    b.boxMM(
      "limestone",
      STEP_X - 1.8,
      ENT0 + 0.9,
      Z0 - 0.02,
      STEP_X - 0.1,
      ENT0 + 2.2,
      Z1 + 0.02,
      { tint: STONE, faces: "nstb" },
    ); // frieze block
    const IN1 = "NEITHER SNOW NOR RAIN NOR HEAT NOR GLOOM OF NIGHT",
      IN2 =
        "STAYS THESE COURIERS FROM THE SWIFT COMPLETION OF THEIR APPOINTED ROUNDS";
    const fz = (Z0 + Z1) / 2;
    // reading left → right while facing west = +z → −z
    b.plate(
      "art",
      STEP_X - 0.1,
      ENT0 + 1.55,
      fz + 6.35,
      1,
      0,
      12.6,
      1.25,
      K.friezeCell("in1", IN1, 2048, 120),
      { off: 0.005, grime: 0 },
    );
    b.plate(
      "art",
      STEP_X - 0.1,
      ENT0 + 1.55,
      fz - 6.35,
      1,
      0,
      12.6,
      1.25,
      K.friezeCell("in2", IN2, 2048, 120),
      { off: 0.005, grime: 0 },
    );
    K.cornice(
      b,
      STEP_X - 0.1,
      Z0 - 0.3,
      STEP_X - 0.1,
      Z1 + 0.3,
      ENT0 + 2.2,
      1,
      0,
      { mat: "limestone", tint: STONE, depth: 1.0, h: 0.85, brackets: 0.95 },
    );
    for (const [zf, nz] of [
      [Z0, -1],
      [Z1, 1],
    ])
      K.cornice(b, DOCK_X, zf, STEP_X, zf, ENT0 + 2.2, 0, nz, {
        mat: "limestone",
        tint: STONE,
        depth: 0.9,
        h: 0.8,
        brackets: 1.1,
      });
    // loggia side of the entablature (seen from under the colonnade)
    K.fwall(
      b,
      "limestone",
      STEP_X - 1.8,
      PZ0,
      STEP_X - 1.8,
      PZ1,
      ENT0,
      0.9,
      -1,
      0,
      { tint: STONE.map((v) => v * 0.8) },
    );

    // ---------------- attic storey + parapet + roof ----------------
    const ATX = STEP_X - 1.2;
    K.fwall(b, "ashlar", ATX, Z0, ATX, Z1, ENT1, ROOF - ENT1, 1, 0, {
      tint: STONE.map((v) => v * 0.95),
    });
    for (let k = 0; k < 11; k++) {
      const az = Z0 + 1.2 + (k * (Z1 - Z0 - 2.4)) / 10;
      K.pilaster(b, ATX, ENT1, az, 1, 0, 0.6, ROOF - ENT1, {
        mat: "limestone",
        tint: STONE,
        depth: 0.18,
      });
    }
    K.letters(
      b,
      ATX + 0.2,
      ENT1 + 2.3,
      fz,
      1,
      0,
      16,
      1.2,
      "UNITED STATES POST OFFICE",
      { fg: "#4e463a", size: 0.72, shadow: false },
    );
    for (const pz of [(Z0 + PZ0) / 2, (PZ1 + Z1) / 2])
      b.plate(
        "art",
        ATX + 0.22,
        ENT1 + 2.2,
        pz,
        1,
        0,
        2.2,
        2.2,
        K.eagleCell(),
        { off: 0.01, tint: [0.78, 0.76, 0.7] },
      );
    b.boxMM(
      "limestone",
      ATX - 0.1,
      ROOF,
      Z0 - 0.1,
      ATX + 0.35,
      ROOF + 0.5,
      Z1 + 0.1,
      { tint: STONE, faces: "nsewt" },
    );
    for (const [zf, nz] of [
      [Z0, -1],
      [Z1, 1],
    ]) {
      K.fwall(
        b,
        "ashlar",
        DOCK_X,
        zf,
        ATX,
        zf,
        ENT1,
        ROOF - ENT1 + 0.5,
        0,
        nz,
        { tint: STONE.map((v) => v * 0.9) },
      );
      for (let k = 0; k < 10; k++) {
        const ax = DOCK_X + 1.6 + (k * (ATX - DOCK_X - 3.2)) / 9;
        K.window(b, ax, ENT1 + 2.2, zf, 0, nz, 0.9, 1.1, {
          state: "dark",
          surround: "limestone",
          surroundTint: STONE,
          sill: false,
        });
      }
    }
    // roof slab (seen from the aerials) + the workroom skylight monitor (glass ridge, some panes gone)
    b.face(
      "concrete_dark",
      DOCK_X,
      ROOF,
      Z1,
      1,
      0,
      0,
      0,
      0,
      -1,
      ATX - DOCK_X,
      Z1 - Z0,
      { uv: "top", tint: [0.55, 0.53, 0.5] },
    );
    {
      const sx0 = -172,
        sx1 = -153,
        sz0 = -126,
        sz1 = -112,
        sh = 3.2,
        zm = (sz0 + sz1) / 2;
      b.boxMM("metal_dark", sx0, ROOF, sz0, sx1, ROOF + 0.6, sz1, {
        tint: [0.35, 0.36, 0.34],
      });
      const bays = 12;
      for (let k = 0; k < bays; k++) {
        const x0 = sx0 + ((sx1 - sx0) * k) / bays,
          x1 = sx0 + ((sx1 - sx0) * (k + 1)) / bays;
        for (const [za, nz] of [
          [sz0, -1],
          [sz1, 1],
        ]) {
          const broken = r() < 0.3;
          const mat = broken ? "paint_black" : "glass";
          b.quadN(
            mat,
            [x0, ROOF + 0.6, za],
            [x1, ROOF + 0.6, za],
            [x1, ROOF + 0.6 + sh, zm],
            [x0, ROOF + 0.6 + sh, zm],
            [0, 0.9, nz],
            { tint: broken ? [0.05, 0.05, 0.05] : [0.5, 0.58, 0.55] },
          );
        }
        b.beam(
          "metal_dark",
          x0,
          ROOF + 0.6,
          sz0,
          x0,
          ROOF + 0.6 + sh,
          zm,
          0.08,
          0.1,
          { tint: [0.3, 0.32, 0.3] },
        );
        b.beam(
          "metal_dark",
          x0,
          ROOF + 0.6,
          sz1,
          x0,
          ROOF + 0.6 + sh,
          zm,
          0.08,
          0.1,
          { tint: [0.3, 0.32, 0.3] },
        );
      }
      b.beam(
        "metal_dark",
        sx0,
        ROOF + 0.65 + sh,
        zm,
        sx1,
        ROOF + 0.65 + sh,
        zm,
        0.12,
        0.12,
        { tint: [0.3, 0.32, 0.3] },
      );
      for (const xx of [sx0, sx1])
        K.tri(
          b,
          "metal_dark",
          [xx, ROOF + 0.6, sz0],
          [xx, ROOF + 0.6, sz1],
          [xx, ROOF + 0.6 + sh, zm],
          [xx < -160 ? -1 : 1, 0, 0],
          { tint: [0.35, 0.36, 0.34] },
        );
    }
    // rooftop clutter: water tank on stilts, vent boxes, a bent radio mast
    {
      const tx = -170,
        tz = -128;
      for (const [u, v] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.beam(
          "rust",
          tx + u * 1.1,
          ROOF,
          tz + v * 1.1,
          tx + u * 1.0,
          ROOF + 3.0,
          tz + v * 1.0,
          0.12,
          0.12,
        );
      b.cyl("wood_rotten", tx, ROOF + 3.0, tz, 1.5, 1.5, 3.2, 14, {
        tint: [0.55, 0.45, 0.35],
      });
      b.cyl("rust", tx, ROOF + 6.2, tz, 1.6, 0.1, 1.1, 14, {
        tint: [0.5, 0.36, 0.26],
      });
      for (let k = 0; k < 4; k++)
        b.cyl("rust", tx, ROOF + 3.4 + k * 0.8, tz, 1.53, 1.53, 0.06, 14, {
          top: false,
          tint: [0.35, 0.28, 0.2],
        });
      for (let k = 0; k < 5; k++)
        b.boxMM(
          "metal",
          -165 + k * 3.3,
          ROOF,
          -109.5,
          -163.2 + k * 3.3,
          ROOF + 1.2,
          -108,
          { tint: [0.55, 0.56, 0.52] },
        );
      b.pipe("rust", -150.5, ROOF, -129.5, -150.2, ROOF + 7, -129.8, 0.06, 5);
      b.pipe(
        "rust",
        -150.2,
        ROOF + 7,
        -129.8,
        -149.2,
        ROOF + 8.5,
        -130.4,
        0.04,
        4,
      );
    }

    // ---------------- 9th Avenue side: loading dock, canopy, wrecked mail truck ----------------
    {
      const dx = DOCK_X,
        dock0 = -129,
        dock1 = -109,
        DH = 1.2;
      b.boxMM("concrete", dx - 2.2, 0, dock0, dx, DH, dock1, {
        tint: [0.62, 0.6, 0.56],
        faces: "wnst",
      });
      b.col(dx - 2.2, 0, dock0, dx, DH, dock1, {
        tag: "floor",
        surface: "concrete",
      });
      for (let k = 0; k < 6; k++)
        b.boxMM(
          "rubber",
          dx - 2.35,
          0.3,
          dock0 + 1.2 + k * 3.4,
          dx - 2.2,
          1.05,
          dock0 + 1.6 + k * 3.4,
          { tint: [0.15, 0.15, 0.14] },
        );
      // three roll-up doors (one jammed half open, the one-way exit from the mail rail ramp)
      for (let k = 0; k < 3; k++) {
        const dz = dock0 + 3.5 + k * 6.5,
          open = k === 1 ? 1.4 : 0;
        b.boxMM(
          "granite_dark",
          dx - 0.05,
          DH,
          dz - 1.9,
          dx + 0.02,
          DH + 3.8,
          dz - 1.6,
          { tint: [0.5, 0.48, 0.45] },
        );
        b.boxMM(
          "granite_dark",
          dx - 0.05,
          DH,
          dz + 1.6,
          dx + 0.02,
          DH + 3.8,
          dz + 1.9,
          { tint: [0.5, 0.48, 0.45] },
        );
        b.boxMM(
          "corrugated",
          dx - 0.06,
          DH + open,
          dz - 1.6,
          dx - 0.02,
          DH + 3.5,
          dz + 1.6,
          { tint: k === 2 ? [0.62, 0.5, 0.36] : [0.5, 0.56, 0.62] },
        );
        if (open)
          b.boxMM(
            "paint_black",
            dx - 0.01,
            DH,
            dz - 1.6,
            dx,
            DH + open,
            dz + 1.6,
            { tint: [0.02, 0.02, 0.02], faces: "w" },
          );
        b.plate(
          "art",
          dx - 0.08,
          DH + 3.7,
          dz,
          -1,
          0,
          1.2,
          0.3,
          K.signCell("ppn_bay" + k, "BAY " + (k + 4), 160, 40, {
            bg: "#24385e",
            fg: "#e8dcb8",
            font: "Arial Black, sans-serif",
          }),
          { off: 0 },
        );
        if (k === 1) FA.dockDoor = new THREE.Vector3(dx - 0.8, DH, dz);
      }
      b.plate(
        "decal",
        dx - 0.07,
        2.4,
        dock0 + 0.2 + 16.2,
        -1,
        0,
        3.6,
        0.9,
        K.tag("MAIL ONLY", "#e0d8c0", 384, 96, {}),
        { off: 0 },
      );
      // canopy on steel brackets
      b.boxMM(
        "metal_dark",
        dx - 3.2,
        DH + 4.4,
        dock0 - 0.5,
        dx,
        DH + 4.6,
        dock1 + 0.5,
        { tint: [0.35, 0.3, 0.26], faces: "nsewtb" },
      );
      for (let k = 0; k < 6; k++) {
        const bz = dock0 + k * 4;
        b.beam("rust", dx, DH + 3.2, bz, dx - 3.0, DH + 4.4, bz, 0.08, 0.14);
      }
      // steps up to the dock at its south end
      K.stairs(b, dx - 2.2, dock1, dx - 0.4, dock1 + 1.6, 0, DH, "-z", {
        mat: "concrete",
        rail: "l",
      });
      // the truck, parallel to the dock, nose south
      K.mailTruck(b, dx - 3.3, 0, -126.3, PI + 0.06, { burn: 1.2 }); // parked at bay 4 (bay 5 is the one-way exit: keep it clear)
      K.sack(b, dx - 1.2, DH, dock0 + 6, 0.3, { s: 1.2 });
      K.sack(b, dx - 1.4, DH, dock0 + 7, 1.2, { s: 1.0, stand: true });
      K.hamper(b, dx - 1.1, DH, dock0 + 14.8, 0.1, {});
    }

    // ---------------- street furniture on the plaza ----------------
    for (const [lz, bent] of [
      [-130.2, 0],
      [-107.8, 0.45],
    ])
      K.lampStandard(b, -141.8, 0.02, lz, HP, { h: 5.4, bent, dead: true });
    K.collectionBox(b, -140.7, 0.02, -131.0, -HP);
    K.collectionBox(b, -141.0, 0.02, -107.0, -HP + 0.5, {});
    b.col(-141.1, 0, -131.35, -140.3, 1.4, -130.65, { tag: "prop" });
    // flagpole on the north plaza with a tattered flag
    {
      const fx = -142.6,
        fzp = -131.3;
      b.cyl("granite_pale", fx, 0, fzp, 0.5, 0.45, 0.5, 10, { tint: GRAN });
      b.pipe("steel", fx, 0.5, fzp, fx, 12.5, fzp, 0.07, 6, {
        tint: [0.6, 0.6, 0.58],
      });
      b.geo("gold", K.sphereGeo(), {
        x: fx,
        y: 12.6,
        z: fzp,
        s: 0.14,
        tint: [0.7, 0.55, 0.3],
      });
      b.quad(
        "art",
        [fx, 11.9, fzp],
        [fx, 11.9, fzp + 2.7],
        [fx, 10.2, fzp + 2.7],
        [fx, 10.2, fzp],
        { rect: K.flagCell("us"), grime: 0 },
      );
      b.quad(
        "art",
        [fx, 11.9, fzp + 2.7],
        [fx, 11.9, fzp],
        [fx, 10.2, fzp],
        [fx, 10.2, fzp + 2.7],
        { rect: K.flagCell("us"), grime: 0 },
      );
      b.col(fx - 0.5, 0, fzp - 0.5, fx + 0.5, 12, fzp + 0.5, {
        tag: "prop",
        walkable: false,
      });
    }
    // posters and graffiti on the pavilion bases and loggia walls
    b.plate(
      "art",
      STEP_X + 0.03,
      1.8,
      -130.3,
      1,
      0,
      0.9,
      1.2,
      K.posterCell("anchorage"),
      { off: 0.01 },
    );
    b.plate(
      "art",
      STEP_X + 0.03,
      1.8,
      -107.8,
      1,
      0,
      0.9,
      1.2,
      K.posterCell("robot"),
      { off: 0.01 },
    );
    b.plate(
      "art",
      WALL_X + 0.03,
      PY + 1.6,
      -124.9,
      1,
      0,
      0.9,
      1.2,
      K.posterCell("xmas"),
      { off: 0.01 },
    );
    b.plate(
      "art",
      WALL_X + 0.03,
      PY + 1.6,
      -113.1,
      1,
      0,
      0.9,
      1.2,
      K.posterCell("rounds"),
      { off: 0.01 },
    );
    b.plate(
      "decal",
      STEP_X + 0.05,
      1.6,
      -108.4,
      1,
      0,
      2.6,
      0.9,
      K.tag("TIN MEN INSIDE", "#d8d0b8", 384, 96, {}),
      { off: 0.0 },
    );
    b.plate(
      "decal",
      WALL_X + 0.05,
      PY + 1.2,
      -109.9,
      1,
      0,
      1.8,
      0.8,
      K.tag("NO SCRIP HERE", "#c83020", 256, 96, {}),
      { off: 0.0 },
    );
    // letters blown out of the building, drifting down the steps
    for (let k = 0; k < 60; k++) {
      const x = -148 + r() * 8,
        z = PZ0 + r() * (PZ1 - PZ0),
        xx = Math.max(x, WALL_X + 0.2);
      const y =
        xx > STEP_X
          ? Math.min(PY, Math.ceil((X1 - xx) / ((X1 - STEP_X) / 12)) * 0.25)
          : PY;
      b.box("flat", xx, y + 0.005, z, 0.2, 0.004, 0.11, {
        yaw: r() * 6,
        tint: r.pick([
          [0.86, 0.84, 0.76],
          [0.8, 0.78, 0.68],
          [0.78, 0.8, 0.84],
        ]),
      });
    }
    K.litter(b, STEP_X + 0.2, Z0 + 0.3, X1 - 0.2, PZ0 - 0.4, 0.02, 10, 881);
    K.litter(b, STEP_X + 0.2, PZ1 + 0.4, X1 - 0.2, Z1 - 0.3, 0.02, 10, 882);
    K.rubble(b, -141.5, 0.02, -108.6, 0.9, 0.4, { seed: 72 });

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_farley_ext";

    K.anchor(ctx, "door", FA.door.x + 1.2, PY, FA.door.z, false);
    K.anchor(ctx, "dock", FA.dockDoor.x - 1.0, 1.2, FA.dockDoor.z, false);
    // a street-side scrip stash in the truck cab + a skeleton carrier on the steps
    K.loot(ctx, "duffle_bag", DOCK_X - 2.2, 1.2, -126.8, 0.4, {
      world: true,
      loot: "mail_sack",
      name: "Mail Sack",
    });
    K.skel(ctx, -142.4, 1.5, -117.2, 1.2, "lying", { world: true });
    K.skel(ctx, WALL_X + 0.7, PY, -126.3, -HP, "sitting", { world: true });
    K.loot(ctx, "mailbox", -140.9, 0.02, -128.9, -HP, {
      world: true,
      loot: "mailbox",
      name: "Collection Box",
    });
  }

  // ==================================================================
  // DATA: items, quest, dialogue
  // ==================================================================
