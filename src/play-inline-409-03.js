// play-inline-409 03 — tint
// Lines 73-1240 of readable/play-inline-409.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "fh_ext", grime: 0.4 });
    const r = K.rng("fh_ext");
    const { X0, X1, Z1, XC, PODIUM: PY, STEP_Z1, COL_Z, CELLA_Z, COL_TOP } = FH;
    const stone = [0.9, 0.88, 0.82],
      gran = [0.78, 0.76, 0.72];

    // ---- the steps (full width) + cheek blocks ----
    // twelve granite steps: pale treads with a nosing lip over darker, shadowed risers (reads as a broad flight)
    {
      const n = 12,
        run = (STEP_Z1 - FH.Z0) / n,
        riser = [0.6, 0.58, 0.55],
        tread = [0.98, 0.96, 0.92];
      for (let i = 0; i < n; i++) {
        const z0 = FH.Z0 + run * i,
          top = (PY * (i + 1)) / n;
        b.boxMM(
          "granite_pale",
          X0 + 1,
          top - PY / n,
          z0,
          X1 - 1,
          top - 0.05,
          z0 + 0.02,
          { tint: riser, faces: "n", grime: 0.55 },
        );
        b.boxMM(
          "granite_pale",
          X0 + 1,
          top - 0.05,
          z0 - 0.05,
          X1 - 1,
          top,
          z0 + run,
          { tint: tread, faces: "nt", grime: 0.22 },
        );
        b.col(X0 + 1, 0, z0, X1 - 1, top, z0 + run, {
          tag: "stairs",
          surface: "concrete",
        });
      }
    }
    for (const x of [X0, X1 - 1]) {
      b.boxMM("granite_pale", x, 0, FH.Z0, x + 1, PY + 0.25, STEP_Z1, {
        tint: gran.map((v) => v * 0.94),
        faces: "nsewtb",
      });
      b.col(x, 0, FH.Z0, x + 1, PY + 0.25, STEP_Z1, { tag: "building" });
    }
    // ---- podium ----
    b.boxMM("granite_pale", X0, 0, STEP_Z1, X1, PY, Z1, {
      tint: gran,
      faces: "sewt",
    });
    b.boxMM(
      "granite_pale",
      X0 - 0.12,
      PY - 0.3,
      STEP_Z1,
      X1 + 0.12,
      PY,
      Z1 + 0.12,
      { tint: gran.map((v) => v * 1.05), faces: "sewb" },
    ); // cap moulding
    b.boxMM("granite_dark", X0 - 0.15, 0, STEP_Z1, X1 + 0.15, 0.5, Z1 + 0.15, {
      tint: [0.7, 0.68, 0.64],
      faces: "sewt",
    }); // base course
    b.col(X0, 0, STEP_Z1, X1, PY, Z1, { tag: "floor", surface: "concrete" });

    // ---- the cella (marble ashlar body with antae and tall windows) ----
    const CX0 = X0 + 1.0,
      CX1 = X1 - 1.0,
      CZ1 = Z1 - 0.3;
    // front wall with the door opening (set into a moulded surround)
    const WH = COL_TOP - PY;
    K.fwall(b, "ashlar", CX0, CELLA_Z, XC - 1.7, CELLA_Z, PY, WH, 0, -1, {
      tint: stone,
    });
    K.fwall(b, "ashlar", XC + 1.7, CELLA_Z, CX1, CELLA_Z, PY, WH, 0, -1, {
      tint: stone,
    });
    K.fwall(
      b,
      "ashlar",
      XC - 1.7,
      CELLA_Z,
      XC + 1.7,
      CELLA_Z,
      PY + 7.2,
      WH - 7.2,
      0,
      -1,
      { tint: stone },
    );
    // east / west / back walls
    K.fwall(b, "ashlar", CX1, CELLA_Z, CX1, CZ1, PY, WH, 1, 0, {
      tint: stone.map((v) => v * 0.92),
    });
    K.fwall(b, "ashlar", CX0, CELLA_Z, CX0, CZ1, PY, WH, -1, 0, {
      tint: stone.map((v) => v * 0.92),
    });
    K.fwall(b, "ashlar", CX0, CZ1, CX1, CZ1, PY, WH, 0, 1, {
      tint: stone.map((v) => v * 0.86),
    });
    for (let k = 0; k <= 6; k++)
      K.pilaster(
        b,
        CX0 + 0.4 + (k * (CX1 - CX0 - 0.8)) / 6,
        PY,
        CZ1,
        0,
        1,
        0.8,
        WH,
        { mat: "limestone", tint: stone.map((v) => v * 0.9), depth: 0.22 },
      );
    for (const k of [0, 1, 2, 4, 5]) {
      const wx = CX0 + 0.4 + ((k + 0.5) * (CX1 - CX0 - 0.8)) / 6;
      K.window(b, wx, PY + 4.5, CZ1, 0, 1, 1.6, 4.0, {
        state: k % 2 ? "boarded" : k === 4 ? "broken" : "dark",
        surround: "limestone",
        surroundTint: stone,
        lintel: 0.45,
        sillMat: "limestone",
      });
    }
    {
      const dx = CX0 + 0.4 + (3.5 * (CX1 - CX0 - 0.8)) / 6;
      b.boxMM("limestone", dx - 1.3, PY, CZ1, dx + 1.3, PY + 3.6, CZ1 + 0.18, {
        tint: stone.map((v) => v * 0.95),
      });
      b.boxMM(
        "rust",
        dx - 0.9,
        PY,
        CZ1 + 0.18,
        dx + 0.9,
        PY + 3.1,
        CZ1 + 0.24,
        { tint: [0.55, 0.42, 0.32] },
      );
      for (let k = 0; k < 4; k++)
        b.beam(
          "rust",
          dx - 0.9,
          PY + 0.4 + k * 0.8,
          CZ1 + 0.27,
          dx + 0.9,
          PY + 0.4 + k * 0.8,
          CZ1 + 0.27,
          0.08,
          0.04,
        );
      b.plate(
        "decal",
        dx,
        PY + 3.9,
        CZ1 + 0.2,
        0,
        1,
        3,
        0.8,
        K.tag("MEMBERS ENTRANCE", "#e0d8c0", 384, 96, { size: 0.5 }),
        { off: 0.01 },
      );
    }
    // the Sub-Treasury loading door in the back of the podium (Beaver Street side) — the flank route into the vaults
    {
      const lx = XC + 8;
      b.boxMM("granite_dark", lx - 1.5, 0, Z1, lx + 1.5, 2.9, Z1 + 0.2, {
        tint: [0.6, 0.58, 0.55],
      });
      b.boxMM("steel", lx - 1.1, 0, Z1 + 0.2, lx + 1.1, 2.5, Z1 + 0.26, {
        tint: [0.42, 0.44, 0.44],
      });
      for (let k = 0; k < 5; k++)
        b.beam(
          "steel",
          lx - 1.1,
          0.3 + k * 0.5,
          Z1 + 0.29,
          lx + 1.1,
          0.3 + k * 0.5,
          Z1 + 0.29,
          0.05,
          0.03,
          { tint: [0.35, 0.36, 0.36] },
        );
      b.plate(
        "art",
        lx,
        2.65,
        Z1 + 0.21,
        0,
        1,
        2.0,
        0.3,
        K.signCell("fh_loading", "U.S. SUB-TREASURY · DELIVERIES", 384, 56, {
          bg: "#2a2a28",
          fg: "#d8c890",
          font: "Georgia, serif",
        }),
        { off: 0.01 },
      );
      b.plate(
        "decal",
        lx + 1.6,
        1.4,
        Z1 + 0.22,
        0,
        1,
        1.6,
        0.8,
        K.tag("TIN MAN →", "#e0d8c0", 256, 96, {}),
        { off: 0.01 },
      );
      FH.loading = new THREE.Vector3(lx, 1.2, Z1 + 0.7);
    }
    // podium flanks: granite base course, cellar vents, boarded basement windows
    for (const [px, nx] of [
      [X0, -1],
      [X1, 1],
    ]) {
      for (let k = 0; k < 4; k++) {
        const pz = STEP_Z1 + 2.5 + k * 3.8;
        b.boxMM(
          "black_iron",
          px + nx * 0.02,
          0.9,
          pz - 0.6,
          px + nx * 0.05,
          1.7,
          pz + 0.6,
          { tint: [0.2, 0.2, 0.2] },
        );
        if (k % 2)
          for (let q = 0; q < 3; q++)
            b.beam(
              "wood_rotten",
              px + nx * 0.08,
              1.0 + q * 0.28,
              pz - 0.7,
              px + nx * 0.08,
              1.05 + q * 0.28,
              pz + 0.7,
              0.2,
              0.03,
              { tint: [0.6, 0.5, 0.4] },
            );
        else
          for (let q = 0; q < 6; q++)
            b.beam(
              "black_iron",
              px + nx * 0.07,
              0.95,
              pz - 0.5 + q * 0.2,
              px + nx * 0.07,
              1.65,
              pz - 0.5 + q * 0.2,
              0.03,
              0.03,
            );
      }
    }
    b.col(CX0, PY, CELLA_Z, CX1, COL_TOP, CZ1, { tag: "building" });
    // door: moulded surround, bronze leaves with panels, transom grille, cornice on consoles
    b.boxMM(
      "limestone",
      XC - 2.1,
      PY,
      CELLA_Z,
      XC - 1.7,
      PY + 7.2,
      CELLA_Z + 0.25,
      { tint: stone.map((v) => v * 1.04) },
    );
    b.boxMM(
      "limestone",
      XC + 1.7,
      PY,
      CELLA_Z,
      XC + 2.1,
      PY + 7.2,
      CELLA_Z + 0.25,
      { tint: stone.map((v) => v * 1.04) },
    );
    b.boxMM(
      "limestone",
      XC - 2.1,
      PY + 7.2,
      CELLA_Z,
      XC + 2.1,
      PY + 7.6,
      CELLA_Z + 0.25,
      { tint: stone.map((v) => v * 1.04) },
    );
    b.boxMM(
      "limestone",
      XC - 2.5,
      PY + 7.9,
      CELLA_Z - 0.05,
      XC + 2.5,
      PY + 8.3,
      CELLA_Z + 0.55,
      { tint: stone, faces: "nsewtb" },
    );
    for (const s of [-1, 1])
      b.boxMM(
        "limestone",
        XC + s * 2.3 - 0.15,
        PY + 7.2,
        CELLA_Z,
        XC + s * 2.3 + 0.15,
        PY + 7.9,
        CELLA_Z + 0.45,
        { tint: stone },
      );
    b.boxMM(
      "bronze",
      XC - 1.7,
      PY,
      CELLA_Z - 0.35,
      XC + 1.7,
      PY + 7.2,
      CELLA_Z - 0.3,
      { tint: [0.5, 0.52, 0.42] },
    );
    for (const s of [-1, 1]) {
      for (const [y0, y1] of [
        [0.4, 2.4],
        [2.7, 4.8],
      ])
        b.boxMM(
          "bronze",
          XC + s * 0.85 - 0.6,
          PY + y0,
          CELLA_Z - 0.3,
          XC + s * 0.85 + 0.6,
          PY + y1,
          CELLA_Z - 0.24,
          { tint: [0.42, 0.46, 0.36] },
        );
      b.boxMM(
        "brass",
        XC + s * 0.12 - 0.04,
        PY + 2.4,
        CELLA_Z - 0.26,
        XC + s * 0.12 + 0.04,
        PY + 2.9,
        CELLA_Z - 0.2,
        {},
      );
    }
    for (let k = 0; k < 9; k++)
      b.beam(
        "bronze",
        XC - 1.6 + k * 0.4,
        PY + 5.2,
        CELLA_Z - 0.28,
        XC - 1.6 + k * 0.4,
        PY + 7.1,
        CELLA_Z - 0.28,
        0.05,
        0.05,
        { tint: [0.4, 0.44, 0.34] },
      );
    b.beam(
      "bronze",
      XC - 1.7,
      PY + 5.0,
      CELLA_Z - 0.26,
      XC + 1.7,
      PY + 5.0,
      CELLA_Z - 0.26,
      0.1,
      0.1,
      { tint: [0.4, 0.44, 0.34] },
    );
    // tall windows (two each side on the front wall, four on each side wall)
    for (const wx of [XC - 9.5, XC - 5.2, XC + 5.2, XC + 9.5]) {
      K.window(b, wx, PY + 5.5, CELLA_Z, 0, -1, 1.7, 4.2, {
        state: r() < 0.5 ? "boarded" : "dark",
        surround: "limestone",
        surroundTint: stone,
        lintel: 0.45,
        sillMat: "limestone",
      });
      b.boxMM(
        "limestone",
        wx - 1.3,
        PY + 7.8,
        CELLA_Z - 0.4,
        wx + 1.3,
        PY + 8.05,
        CELLA_Z,
        { tint: stone, faces: "nsewtb" },
      ); // hood
    }
    for (const side of [-1, 1]) {
      const wxl = side < 0 ? CX0 : CX1;
      for (let k = 0; k < 3; k++) {
        const wz = CELLA_Z + 2.4 + k * 3.2;
        K.window(b, wxl, PY + 5.5, wz, side, 0, 1.5, 4.0, {
          state: r() < 0.4 ? "broken" : "dark",
          surround: "limestone",
          surroundTint: stone,
          lintel: 0.45,
        });
      }
      // antae pilasters at the corners and between the windows
      for (const pz of [CELLA_Z + 0.4, CELLA_Z + 4.0, CELLA_Z + 7.2, CZ1 - 0.4])
        K.pilaster(b, wxl, PY, pz, side, 0, 0.8, COL_TOP - PY, {
          mat: "limestone",
          tint: stone,
          depth: 0.22,
        });
    }

    // ---- the colonnade: eight fluted Doric columns ----
    FH.cols = [];
    for (let i = 0; i < 8; i++) {
      const x = X0 + 2.4 + i * ((X1 - X0 - 4.8) / 7);
      FH.cols.push(x);
      K.column(b, x, PY, COL_Z, 0.8, COL_TOP - PY, {
        kind: "doric",
        mat: "marble_white",
        base: false,
        nFlutes: 20,
        tint: [0.9, 0.88, 0.83].map((v) => v * (0.95 + r() * 0.06)),
      });
      b.col(x - 0.72, PY, COL_Z - 0.72, x + 0.72, COL_TOP, COL_Z + 0.72, {
        tag: "column",
        walkable: false,
      });
    }
    // portico soffit (coffered) + side walls of the portico (antae returns)
    b.face(
      "coffer",
      X0 + 0.6,
      COL_TOP,
      COL_Z - 1.1,
      1,
      0,
      0,
      0,
      0,
      1,
      X1 - X0 - 1.2,
      CELLA_Z - COL_Z + 1.1,
      { uv: "top", tint: [0.72, 0.7, 0.64], grime: 0.4 },
    );
    for (const x of [X0 + 0.6, X1 - 0.6]) {
      b.boxMM("ashlar", x - 0.4, PY, COL_Z + 0.9, x + 0.4, COL_TOP, CELLA_Z, {
        tint: stone,
        faces: "nsewtb",
      });
      b.col(x - 0.4, PY, COL_Z + 0.9, x + 0.4, COL_TOP, CELLA_Z, {
        tag: "building",
      });
    }

    // ---- entablature: architrave, triglyph frieze, cornice with mutules ----
    const EZ0 = COL_Z - 1.05;
    b.boxMM(
      "limestone",
      X0 + 0.4,
      COL_TOP,
      EZ0,
      X1 - 0.4,
      COL_TOP + 1.1,
      Z1 - 0.1,
      { tint: stone, faces: "nsewtb" },
    );
    b.boxMM(
      "limestone",
      X0 + 0.4,
      COL_TOP + 0.95,
      EZ0 - 0.08,
      X1 - 0.4,
      COL_TOP + 1.1,
      Z1 - 0.02,
      { tint: stone.map((v) => v * 1.05) },
    ); // taenia
    b.boxMM(
      "limestone",
      X0 + 0.45,
      COL_TOP + 1.1,
      EZ0 + 0.05,
      X1 - 0.45,
      COL_TOP + 2.3,
      Z1 - 0.15,
      { tint: stone.map((v) => v * 0.95), faces: "nsewt" },
    );
    for (let x = X0 + 0.9; x < X1 - 0.5; x += 1.8) {
      b.boxMM(
        "limestone",
        x - 0.35,
        COL_TOP + 1.12,
        EZ0 - 0.06,
        x + 0.35,
        COL_TOP + 2.28,
        EZ0 + 0.06,
        { tint: stone.map((v) => v * 0.82) },
      );
      for (const g of [-0.12, 0.12])
        b.boxMM(
          "limestone",
          x + g - 0.03,
          COL_TOP + 1.2,
          EZ0 - 0.08,
          x + g + 0.03,
          COL_TOP + 2.2,
          EZ0 - 0.05,
          { tint: stone.map((v) => v * 0.62) },
        );
      for (const gx of [-0.24, -0.08, 0.08, 0.24])
        b.cyl(
          "limestone",
          x + gx,
          COL_TOP + 0.88,
          EZ0 - 0.03,
          0.035,
          0.03,
          0.07,
          5,
          { tint: stone },
        ); // guttae
    }
    for (const sx of [X0 + 0.45, X1 - 0.45])
      for (let z = EZ0 + 1.2; z < Z1 - 0.5; z += 1.8)
        b.boxMM(
          "limestone",
          sx - 0.06,
          COL_TOP + 1.12,
          z - 0.35,
          sx + 0.06,
          COL_TOP + 2.28,
          z + 0.35,
          { tint: stone.map((v) => v * 0.82) },
        );
    b.boxMM(
      "limestone",
      X0 - 0.1,
      COL_TOP + 2.3,
      EZ0 - 0.6,
      X1 + 0.1,
      COL_TOP + 2.95,
      Z1 + 0.35,
      { tint: stone.map((v) => v * 1.02), faces: "nsewtb" },
    );
    b.boxMM(
      "limestone",
      X0 - 0.25,
      COL_TOP + 2.95,
      EZ0 - 0.75,
      X1 + 0.25,
      COL_TOP + 3.2,
      Z1 + 0.5,
      { tint: stone.map((v) => v * 1.06), faces: "nsewtb" },
    );
    const EY = COL_TOP + 3.2;
    // ---- pediments (front + back) and the low-pitched roof ----
    const GH = 4.3;
    K.gable(b, X0 - 0.25, X1 + 0.25, EZ0 - 0.75, EY, GH, -1, {
      mat: "limestone",
      tint: stone,
      recess: 0.8,
    });
    K.gable(b, X0 - 0.25, X1 + 0.25, Z1 + 0.5, EY, GH, 1, {
      mat: "limestone",
      tint: stone.map((v) => v * 0.9),
      recess: 0.8,
    });
    const roofT = [0.42, 0.5, 0.44];
    b.quadN(
      "slate",
      [X0 - 0.3, EY + 0.2, EZ0 - 0.4],
      [XC, EY + GH + 0.15, EZ0 - 0.4],
      [XC, EY + GH + 0.15, Z1 + 0.2],
      [X0 - 0.3, EY + 0.2, Z1 + 0.2],
      [-0.3, 1, 0],
      { tint: roofT, grime: 0.7 },
    );
    b.quadN(
      "slate",
      [XC, EY + GH + 0.15, EZ0 - 0.4],
      [X1 + 0.3, EY + 0.2, EZ0 - 0.4],
      [X1 + 0.3, EY + 0.2, Z1 + 0.2],
      [XC, EY + GH + 0.15, Z1 + 0.2],
      [0.3, 1, 0],
      { tint: roofT, grime: 0.7 },
    );
    b.col(X0, COL_TOP, EZ0, X1, EY + 1.5, Z1, { tag: "building" });
    // a shell hole punched through the east roof slope (rafters showing)
    const roofY = (x) =>
      EY + 0.2 + ((X1 + 0.3 - x) / (X1 + 0.3 - XC)) * (GH - 0.05) + 0.03;
    b.quadN(
      "paint_black",
      [88, roofY(88), 832],
      [91, roofY(91), 832],
      [91, roofY(91), 835],
      [88, roofY(88), 835],
      [0.3, 1, 0],
      { tint: [0.03, 0.03, 0.03], grime: 0 },
    );
    for (let k = 0; k < 4; k++) {
      const x = 87.6 + k * 0.95;
      b.beam(
        "wood_rotten",
        x,
        roofY(x) + 0.05,
        831.6,
        x,
        roofY(x) + 0.05,
        835.4,
        0.14,
        0.2,
      );
    }
    b.burn(89.5, EY + 1.3, 833.5, 3.5, 0.8);

    // ---- WASHINGTON on his pedestal ----
    const SX = XC,
      SZ = 820.3;
    const stepTop = (z) =>
      Math.min(PY, Math.ceil((z - FH.Z0) / ((STEP_Z1 - FH.Z0) / 12)) * 0.25);
    const py0 = stepTop(SZ + 1.35) - 0.3; // base course top clears every step it sits on
    b.boxMM(
      "granite_dark",
      SX - 1.35,
      0,
      SZ - 1.35,
      SX + 1.35,
      py0 + 0.5,
      SZ + 1.35,
      { tint: [0.62, 0.52, 0.46], faces: "nsewt" },
    );
    b.boxMM(
      "granite",
      SX - 1.1,
      py0 + 0.5,
      SZ - 1.1,
      SX + 1.1,
      py0 + 2.9,
      SZ + 1.1,
      { tint: [0.95, 0.78, 0.66] },
    );
    b.boxMM(
      "granite",
      SX - 1.25,
      py0 + 2.9,
      SZ - 1.25,
      SX + 1.25,
      py0 + 3.2,
      SZ + 1.25,
      { tint: [1.0, 0.84, 0.72], faces: "nsewtb" },
    );
    b.boxMM(
      "marble_white",
      SX - 1.0,
      py0 + 1.3,
      SZ - 1.16,
      SX + 1.0,
      py0 + 2.32,
      SZ - 1.1,
      { tint: [0.88, 0.86, 0.8] },
    );
    b.col(SX - 1.35, 0, SZ - 1.35, SX + 1.35, py0 + 3.2, SZ + 1.35, {
      tag: "statue",
      walkable: false,
    });
    const plaque = K.paint(
      "art",
      "fh_plaque",
      512,
      256,
      function (x, X, Y, W, H) {
        x.fillStyle = "#4a4a36";
        x.fillRect(X, Y, W, H);
        x.strokeStyle = "#8a8a62";
        x.lineWidth = 6;
        x.strokeRect(X + 8, Y + 8, W - 16, H - 16);
        x.fillStyle = "#c8c498";
        x.textAlign = "center";
        x.font = "bold 30px Georgia, serif";
        [
          "ON THIS SITE IN FEDERAL HALL",
          "APRIL 30 · 1789",
          "GEORGE WASHINGTON",
          "TOOK THE OATH AS THE FIRST",
          "PRESIDENT OF THE UNITED STATES",
        ].forEach((t, i) => x.fillText(t, X + W / 2, Y + 48 + i * 42, W - 40));
        K.stains(x, X, Y, W, H, 8, 811, 0.5, [30, 40, 20]);
      },
    );
    b.plate("art", SX, py0 + 1.8, SZ - 1.16, 0, -1, 1.7, 0.85, plaque, {
      off: 0.02,
    });
    b.plate(
      "decal",
      SX,
      py0 + 1.05,
      SZ - 1.1,
      0,
      -1,
      2.1,
      0.7,
      K.tag("CONGRESS IN SESSION", "#b8261c", 512, 128, {
        size: 0.5,
        rot: 0.03,
      }),
      { off: 0.04 },
    );
    b.plate(
      "decal",
      SX + 1.1,
      py0 + 1.6,
      SZ,
      1,
      0,
      2.0,
      1.0,
      K.tag("ALL HAIL VOSS", "#e0d8c0", 384, 128, { rot: -0.08 }),
      { off: 0.03 },
    );
    K.washington(b, SX, py0 + 3.2, SZ, 0, 2.1, {
      mat: "statue_bronze",
      tint: [1, 1, 1],
    });
    // raider defacement: spiked helmet, a sign round his neck, a chain
    const HY = py0 + 3.2 + 1.72 * 2.1;
    b.cyl("rubber", SX, HY - 0.05, SZ, 0.26, 0.24, 0.2, 10, {
      tint: [0.25, 0.22, 0.2],
    });
    for (let k = 0; k < 7; k++) {
      const a = (k / 7) * PI * 2;
      b.pipe(
        "rust",
        SX + Math.cos(a) * 0.22,
        HY + 0.1,
        SZ - Math.sin(a) * 0.22,
        SX + Math.cos(a) * 0.3,
        HY + 0.42,
        SZ - Math.sin(a) * 0.3,
        0.02,
        3,
      );
    }
    const signY = py0 + 3.2 + 1.2 * 2.1;
    b.pipe(
      "rust",
      SX - 0.25,
      HY - 0.5,
      SZ - 0.28,
      SX - 0.3,
      signY + 0.25,
      SZ - 0.5,
      0.008,
      3,
    );
    b.pipe(
      "rust",
      SX + 0.25,
      HY - 0.5,
      SZ - 0.28,
      SX + 0.3,
      signY + 0.25,
      SZ - 0.5,
      0.008,
      3,
    );
    b.box("wood_rotten", SX, signY - 0.2, SZ - 0.52, 0.8, 0.5, 0.03, {
      tint: [0.7, 0.62, 0.5],
    });
    b.plate(
      "art",
      SX,
      signY + 0.05,
      SZ - 0.54,
      0,
      -1,
      0.76,
      0.46,
      K.signCell("fh_prez", "PRESIDENT\n4 LIFE", 192, 128, {
        bg: "#b8a888",
        fg: "#7a1a14",
        font: "Impact, Arial Black, sans-serif",
      }),
      { off: 0.005 },
    );

    // ---- THE CONGRESS: raider annex + fortifications ----
    // scrap annex between the two easternmost bays (portico floor)
    const AX0 = FH.cols[5] + 0.8,
      AX1 = X1 - 1.0,
      AZ0 = COL_Z - 0.6,
      AZ1 = CELLA_Z - 0.1;
    const scrap = [
      [0.6, 0.35, 0.25],
      [0.55, 0.5, 0.45],
      [0.45, 0.42, 0.36],
      [0.62, 0.55, 0.4],
    ];
    const panel = (x0, z0, x1, z1, h, yaw0) => {
      const len = Math.hypot(x1 - x0, z1 - z0),
        n = Math.max(1, Math.round(len / 1.25));
      for (let k = 0; k < n; k++) {
        const t0 = k / n,
          t1 = (k + 1) / n;
        const cx = x0 + ((x1 - x0) * (t0 + t1)) / 2,
          cz = z0 + ((z1 - z0) * (t0 + t1)) / 2;
        b.box(
          r() < 0.5 ? "corrugated" : "rust",
          cx,
          PY,
          cz,
          len / n + 0.05,
          h - 0.3 + r() * 0.5,
          0.06,
          { yaw: yaw0 + (r() - 0.5) * 0.05, tint: r.pick(scrap) },
        );
      }
    };
    panel(AX0, AZ0, AX1, AZ0, 3.3, 0); // front (north) wall between the columns
    panel(AX0, AZ0, AX0, AZ1, 3.3, HP); // west wall
    b.col(AX0 - 0.1, PY, AZ0 - 0.1, AX1, PY + 3.2, AZ0 + 0.1, {
      walkable: false,
    });
    b.col(AX0 - 0.1, PY, AZ0, AX0 + 0.1, PY + 3.2, AZ1, { walkable: false });
    // corrugated lean-to roof + a lookout crow's nest on top, a painted door
    b.quadN(
      "corrugated",
      [AX0 - 0.3, PY + 3.6, AZ0 - 0.4],
      [AX1, PY + 3.6, AZ0 - 0.4],
      [AX1, PY + 4.2, AZ1],
      [AX0 - 0.3, PY + 4.2, AZ1],
      [0, 1, 0.3],
      { tint: [0.55, 0.42, 0.3] },
    );
    b.boxMM(
      "wood_rotten",
      AX0 + 0.8,
      PY,
      AZ0 - 0.08,
      AX0 + 1.9,
      PY + 2.3,
      AZ0 - 0.02,
      { tint: [0.5, 0.25, 0.18] },
    );
    b.plate(
      "decal",
      (AX0 + AX1) / 2 + 0.7,
      PY + 2.3,
      AZ0 - 0.1,
      0,
      -1,
      3.2,
      1.0,
      K.tag("ANNEX · MEMBERS ONLY", "#e0d8c0", 512, 128, { size: 0.42 }),
      { off: 0.01 },
    );
    // sandbagged west bays (props spawn the sandbags themselves) + a scrap barricade across bay 2
    panel(FH.cols[1] + 0.8, COL_Z, FH.cols[2] - 0.8, COL_Z, 1.6, 0);
    b.col(
      FH.cols[1] + 0.7,
      PY,
      COL_Z - 0.15,
      FH.cols[2] - 0.7,
      PY + 1.5,
      COL_Z + 0.15,
      { walkable: false },
    );
    // banner of THE CONGRESS between the centre columns, upside-down flag from a pole
    const ban = K.flagCell("raider", 256, 256);
    b.quad(
      "art",
      [FH.cols[4] - 0.85, COL_TOP - 5.0, COL_Z - 0.2],
      [FH.cols[3] + 0.85, COL_TOP - 5.0, COL_Z - 0.2],
      [FH.cols[3] + 0.85, COL_TOP - 0.2, COL_Z - 0.2],
      [FH.cols[4] - 0.85, COL_TOP - 0.2, COL_Z - 0.2],
      { rect: ban, grime: 0, tint: [0.95, 0.9, 0.85] },
    );
    b.pipe(
      "rust",
      FH.cols[3] + 0.8,
      COL_TOP - 0.2,
      COL_Z - 0.25,
      FH.cols[4] - 0.8,
      COL_TOP - 0.2,
      COL_Z - 0.25,
      0.04,
      5,
    );
    const flag = K.flagCell("us_upside", 256, 160);
    const FX = X0 + 1.6,
      fz0 = EZ0 - 0.9,
      fz1 = EZ0 - 4.0,
      fy0 = COL_TOP + 2.1,
      fy1 = COL_TOP + 3.5;
    b.pipe(
      "black_iron",
      FX,
      COL_TOP + 1.9,
      EZ0 - 0.4,
      FX,
      fy1 + 0.1,
      fz1 - 0.2,
      0.05,
      5,
    );
    const fl = [
      [FX, fy0 - 1.9, fz0],
      [FX, fy0, fz0],
      [FX, fy1 - 0.05, fz1],
      [FX, fy1 - 1.95, fz1],
    ];
    b.quad("art", fl[0], fl[3], fl[2], fl[1], { rect: flipU(flag), grime: 0 }); // west side (reads mirrored, like a real flag)
    b.quad("art", fl[3], fl[0], fl[1], fl[2], { rect: flag, grime: 0 }); // east side
    // painted slogans on the podium flanks and the frieze
    b.plate(
      "decal",
      X0 - 0.02,
      1.6,
      832,
      -1,
      0,
      7,
      1.6,
      K.tag("WE THE PEOPLE (OF THE CONGRESS)", "#c8281e", 768, 128, {
        size: 0.42,
      }),
      { off: 0.01 },
    );
    b.plate(
      "decal",
      X1 + 0.02,
      1.6,
      834,
      1,
      0,
      6,
      1.6,
      K.tag("TAXATION = TRIBUTE", "#d8d0b0", 512, 128, { size: 0.5 }),
      { off: 0.01 },
    );
    // skull pikes along the bottom step, blood on the steps
    for (let k = 0; k < 7; k++) {
      const px = X0 + 2.4 + k * 4.2 + (r() - 0.5) * 0.6,
        pz = FH.Z0 + 0.25;
      if (Math.abs(px - SX) < 2) continue;
      b.pipe(
        "rust",
        px,
        0,
        pz,
        px + (r() - 0.5) * 0.2,
        2.2 + r() * 0.4,
        pz,
        0.03,
        4,
      );
      b.geo("bone", K.sphereGeo(), {
        x: px,
        y: 2.35 + r() * 0.3,
        z: pz,
        sx: 0.11,
        sy: 0.13,
        sz: 0.12,
        tint: [0.85, 0.8, 0.66],
      });
      b.geo("paint_black", K.sphereGeo(), {
        x: px,
        y: 2.38,
        z: pz - 0.09,
        sx: 0.07,
        sy: 0.03,
        sz: 0.03,
        tint: [0.05, 0.05, 0.05],
      });
    }
    for (let k = 0; k < 5; k++) {
      const z = FH.Z0 + 0.3 + (k * 2 + 1) * ((STEP_Z1 - FH.Z0) / 12);
      b.hplate(
        "decal",
        XC + (r() - 0.5) * 16,
        stepTop(z) + 0.012,
        z,
        1.2 + r(),
        0.5,
        r() * 3,
        K.decal(k % 2 ? "blood" : "grime", 20 + k),
      );
    }
    // National Park Service sign at the foot of the steps (bullet-holed, one post snapped)
    {
      const nx0 = X0 + 4.2,
        nz0 = FH.Z0 - 2.6;
      b.beam("wood_dark", nx0 - 1.3, 0, nz0, nx0 - 1.3, 2.0, nz0, 0.12, 0.12, {
        tint: [0.35, 0.25, 0.16],
      });
      b.beam(
        "wood_dark",
        nx0 + 1.3,
        0,
        nz0,
        nx0 + 1.25,
        1.2,
        nz0 + 0.1,
        0.12,
        0.12,
        { tint: [0.35, 0.25, 0.16] },
      );
      const nps = K.paint(
        "art",
        "fh_nps_board",
        384,
        176,
        function (x, X, Y, W, H) {
          x.fillStyle = "#4a3322";
          x.fillRect(X, Y, W, H);
          x.strokeStyle = "#e8dcb8";
          x.lineWidth = 5;
          x.strokeRect(X + 8, Y + 8, W - 16, H - 16);
          x.fillStyle = "#e8dcb8";
          x.textAlign = "center";
          x.font = "bold 34px Georgia, serif";
          x.fillText("FEDERAL HALL", X + W / 2, Y + 58, W - 40);
          x.font = "bold 22px Georgia, serif";
          x.fillText("NATIONAL MEMORIAL", X + W / 2, Y + 92, W - 40);
          x.font = "15px Georgia, serif";
          x.fillText(
            "National Park Service · U.S. Department of the Interior",
            X + W / 2,
            Y + 130,
            W - 40,
          );
          x.fillStyle = "#b8261c";
          x.font = "bold 30px Impact, Arial Black, sans-serif";
          x.save();
          x.translate(X + W * 0.62, Y + H * 0.62);
          x.rotate(-0.12);
          x.fillText("NOW: THE CONGRESS", 0, 0);
          x.restore();
          const r2 = K.rng("npsholes");
          for (let k = 0; k < 9; k++) {
            x.fillStyle = "#120c08";
            x.beginPath();
            x.arc(X + r2() * W, Y + r2() * H, 3 + r2() * 3, 0, 6.3);
            x.fill();
          }
          K.stains(x, X, Y, W, H, 8, 881, 0.4, [30, 20, 10]);
        },
      );
      b.box("wood_dark", nx0, 1.05, nz0 - 0.03, 3.0, 1.35, 0.1, {
        yaw: 0.06,
        tint: [0.35, 0.25, 0.16],
        faces: "nsewtb",
      });
      b.quad(
        "art",
        [nx0 + 1.45, 1.1, nz0 - 0.09 - 0.09],
        [nx0 - 1.45, 1.1, nz0 - 0.09 + 0.09],
        [nx0 - 1.45, 2.35, nz0 - 0.09 + 0.09],
        [nx0 + 1.45, 2.35, nz0 - 0.09 - 0.09],
        { rect: nps, grime: 0 },
      );
      b.col(nx0 - 1.5, 0, nz0 - 0.2, nx0 + 1.5, 2.4, nz0 + 0.2, {
        tag: "prop",
      });
    }
    b.plate(
      "decal",
      XC,
      COL_TOP + 1.7,
      EZ0 - 0.11,
      0,
      -1,
      15,
      1.25,
      K.tag("THE  CONGRESS", "#c8281e", 1024, 96, { size: 0.7, rot: 0 }),
      { off: 0.0 },
    );
    // tire barricade & junk at the foot of the steps, litter everywhere
    for (const [tx, tz] of [
      [X0 + 3, FH.Z0 - 1.2],
      [X1 - 3.5, FH.Z0 - 1.0],
    ]) {
      for (let k = 0; k < 5; k++)
        b.cyl(
          "rubber",
          tx + (k % 3) * 0.75,
          k > 2 ? 0.3 : 0,
          tz + (k > 2 ? 0.3 : 0),
          0.38,
          0.38,
          0.28,
          10,
          { tint: [0.14, 0.13, 0.12] },
        );
    }
    K.litter(b, X0 + 1, FH.Z0 - 3.5, X1 - 1, STEP_Z1 - 0.5, 0.02, 20, 4411);
    K.litter(
      b,
      X0 + 1,
      STEP_Z1 + 0.5,
      X1 - 1,
      CELLA_Z - 0.6,
      PY + 0.02,
      18,
      4412,
    );

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_federal_hall_ext";

    // world-side anchors & props
    K.anchor(ctx, "door", XC, PY, CELLA_Z - 1.4, false);
    K.anchor(ctx, "statue", SX, 0, SZ - 3, false);
    K.loot(ctx, "sandbags", FH.cols[0] + 1.8, PY, COL_Z - 0.2, 0, {
      world: true,
      low: true,
    });
    K.loot(ctx, "sandbags", FH.cols[3] - 1.4, PY, COL_Z - 1.4, 0.2, {
      world: true,
      curved: true,
    });
    K.loot(ctx, "barrel", FH.cols[2] + 1.8, PY, COL_Z + 2.2, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "barrel", X0 + 2.5, 0, FH.Z0 - 2.5, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "barrel", X1 - 2.2, 0, FH.Z0 - 2.2, 0, {
      world: true,
      burning: true,
    });
    K.loot(ctx, "mattress", AX0 + 2.6, PY, AZ1 - 1.2, HP, { world: true });
    K.loot(ctx, "footlocker", AX1 - 0.8, PY, AZ1 - 0.8, -HP, {
      world: true,
      loot: "raider_stash",
      name: "Congress Tax Box",
      lock: TAXBOX,
    });
    K.scrawlAt(
      new THREE.Vector3(AX1 - 0.3, PY + 1.3, AZ1 - 1.9),
      "Chalk on the Annex Wall",
      '"TAX BOX = 2611. SKEETER STOP FORGETTING IT."',
      TAXBOX.id,
    );
    K.loot(ctx, "crate", AX1 - 1.0, PY, AZ0 + 0.9, 0.2, {
      world: true,
      kind: "army",
      loot: "ammo_box",
      name: "Ammo Crate",
    });
    K.skel(ctx, FH.cols[6] + 1.2, PY, COL_Z - 1.8, 2.2, "curled", {
      world: true,
    });
    K.skel(ctx, X0 + 6, 0.02, FH.Z0 - 2.0, 0.6, "lying", { world: true });
  }

  // ==================================================================
  // DATA: items, quest, dialogue, terminals
  // ==================================================================
