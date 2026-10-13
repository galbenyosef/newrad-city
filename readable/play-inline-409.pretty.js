/* src/poi_fidi3/10_federal.js */
/* =====================================================================
 * NEW RAD CITY — poi_fidi3 / 10_federal.js
 * FEDERAL HALL (26 Wall Street) — hostile raider den ("The Congress").
 *
 * EXTERIOR (site x 65..95, z 818..842; Wall Street to the north):
 *   the Greek-revival temple on its granite podium — the broad flight of
 *   steps, eight fluted Doric columns, the plain pediment, marble ashlar
 *   cella with the tall bronze doors — and J.Q.A. Ward's bronze George
 *   Washington on his pedestal, right hand out over the steps where he
 *   took the oath. The raiders who call themselves THE CONGRESS have put
 *   a spiked helmet on him and a sign round his neck, built a scrap
 *   ANNEX between the east columns, sandbagged the portico, hung an
 *   upside-down flag and their own banner from the entablature, and
 *   planted skull pikes along the bottom step.
 * INTERIOR (cell federal_hall) → 11_federal_interior.js.
 * Content: Speaker Voss (named raider boss, carries the Sub-Treasury
 *   key), Lancer Halloran (Iron Covenant, pinned down in the basement
 *   assay office) and the quest "Continuity of Government" (recover the
 *   Continuity's Archive 7 core from the Sub-Treasury strongroom — by
 *   Voss's key or the Mosler combination in Archivist Ames's notebook).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // the Congress's tax box in the scrap annex: the combination is chalked on the annex wall beside it
  const TAXBOX = K.regLock({
    id: "pf3_lk_fh_taxbox",
    label: "Congress Tax Box",
    code: "2611",
    hint: "Chalked on the annex wall beside the box.",
  });

  /** mq22: the core's last priority traffic (Deputy Director Marsh's order of Saturday 4 March 1967). */
  PV.MARSH_MEMO =
    "[A curl of yellow teleprinter paper, torn off at the cradle. Below the routing header, in capitals:]\n\n" +
    "PRIORITY — FLASH — EYES ONLY\nSAT 04 MAR 67 1810 EST\nFROM: DEP DIR OCD (MARSH)\nTO: ALL CONTINUITY NODES EASTERN SEABOARD / LIBERTY STATION\n\n" +
    "SOURCE CONFIRMS. EXECUTION 05 MAR, MORNING.\nMOVE THE ROLLS AND ENROLLED STAFF TO LIBERTY TONIGHT.\nNO PUBLIC NOTICE.\nPROTECT THE SOURCE.\nM.\n\n" +
    "[Under it, the node's automatic acknowledgement:] NODE 7 ACK 1814 EST. CUSTODIAN NOT CLEARED FOR CONTENT.\n\n" +
    "[The date is Saturday, the fourth of March. The Bombing came the next morning at 09:47. Nobody warned the city.]";

  const FH = (PV.fh = {
    X0: 65,
    X1: 95,
    Z0: 818,
    Z1: 842,
    XC: 80,
    PODIUM: 3.0, // portico floor height
    STEP_Z1: 824.5, // top of the steps
    COL_Z: 826.3, // column centre line
    CELLA_Z: 831.5, // front wall of the cella (the doors)
    COL_TOP: 13.4,
  });
  FH.door = new THREE.Vector3(FH.XC, FH.PODIUM + 1.3, FH.CELLA_Z - 0.45);

  /** Atlas rect with u flipped (the back face of a banner). */
  function flipU(rc) {
    const o = [rc[2], rc[1], rc[0], rc[3]];
    o.atlas = rc.atlas;
    return o;
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
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
  function data() {
    K.defineItem({
      id: "pf3_fh_archive_key",
      type: "key",
      name: "Sub-Treasury Vault Key",
      weight: 0,
      value: 0,
      tags: ["key", "quest"],
      desc: "A heavy brass key on a length of red ribbon, stamped U.S. SUB-TREASURY · NEW YORK · VAULT B. Speaker Voss wore it like a chain of office.",
    });
    K.defineItem({
      id: "pf3_cog_core",
      type: "misc",
      name: "COG Archive Core",
      weight: 3,
      value: 450,
      tags: ["quest", "valuable", "unique"],
      desc: "A shock-mounted data core the size of a lunchbox, stencilled CONTINUITY OF GOVERNMENT — ARCHIVE 7 — TOP SECRET. Inside: every secret the government kept on this coast from Truman to the Bombing, and whatever it thought was worth saving when it stopped existing. The Continuity would very much like it back.",
    });
    K.defineItem({
      id: "pf3_speaker_gavel",
      type: "misc",
      name: "Speaker's Gavel",
      weight: 1,
      value: 120,
      tags: ["valuable", "unique"],
      desc: "Voss's gavel: a sledgehammer head wired to a chair leg, hand-lettered ORDER. It has called a great many sessions to order.",
    });
    K.defineItem({
      id: "pf3_fh_bible_page",
      type: "misc",
      name: "Inaugural Bible Plate",
      weight: 0.5,
      value: 60,
      tags: ["valuable"],
      desc: 'An engraved brass museum plate: "The Bible upon which George Washington took the oath of office." The Bible itself is long gone. The raiders kept the plate because it was shiny.',
    });
    // The core's last priority traffic (mq22's proof: Deputy Director Marsh moved the rolls and the enrolled to Liberty the
    // night before the Bombing, and told no one) is read on the node teletype; the main story files its own carbon (NOTES).
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pf3_cog",
        name: "Continuity of Government",
        giver: "Lancer Halloran",
        location: "Federal Hall",
        desc: "An Iron Covenant Lancer is pinned down under Federal Hall by the raider gang that calls itself the Congress. He wants the old government's archive core out of the Sub-Treasury strongroom before the Continuity remembers they left it there. What the core remembers is another matter.",
        stages: [
          {
            id: "key",
            text: "Get past Speaker Voss into the Sub-Treasury archive strongroom (Voss wears the key; Archivist Ames worked out the combination).",
            markers: [
              () => {
                const a = PV.anchor("federal_hall", "vault_door");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Archive Vault",
                      interior: "federal_hall",
                    }
                  : null;
              },
            ],
          },
          {
            id: "core",
            text: "Recover the COG Archive Core and read its last priority traffic.",
            markers: [
              () => {
                const a = PV.anchor("federal_hall", "core");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Archive Core",
                      interior: "federal_hall",
                    }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Decide who gets the core: Lancer Halloran, or (with his blessing) Rocky Delgado's microphone.",
            markers: [{ npc: "pf3_halloran", label: "Halloran" }],
          },
          {
            id: "read",
            sideObjective: true,
            text: "(Optional) Read the archive teletype's files on the node's last day.",
            doneIf: () => !!PV.flag("fh_memo_read"),
            showIf: () => !!PV.flag("fh_vault_open"),
          },
        ],
        rewards: { xp: 300 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    /** contract (src/quests/NOTES.md): the quest may be started at any time; put it where the world is. */
    const wantStage = () =>
      K.has("pf3_cog_core") || PV.flag("fh_core_taken")
        ? "return"
        : PV.flag("fh_vault_open")
          ? "core"
          : "key";
    const sync = () => {
      if (q.active("pf3_cog") && q.stage("pf3_cog") !== wantStage())
        q.set("pf3_cog", wantStage());
    };
    PV.cogSync = sync;
    G.events.on("questStarted", (v) => {
      if (v && v.id === "pf3_cog") setTimeout(sync, 0);
    });
    G.events.on("loaded", () => setTimeout(sync, 0));
    const startCog = () => {
      q.start("pf3_cog");
      sync();
    };
    // Every outline branch sets the main-story flag ms_core: 'given' (Halloran keeps the core for the Covenant) or
    // 'broadcast' (the memo goes out on Rocky Delgado's band over Halloran's field set). 'kept' = stolen (quest fails,
    // as before; the main story then lets the hero take the core to Rocky or Hale).
    const settle = (mode) => {
      PV.setFlag("fh_core_to", mode);
      if (mode === "given" || mode === "broadcast") K.setQFlag("ms_core", mode);
      if (mode === "broadcast") K.setQFlag("core_broadcast", true);
      if (mode === "given") K.setQFlag("core_given", true);
      if (!q.active("pf3_cog")) q.start("pf3_cog");
      if (mode === "kept") q.fail("pf3_cog");
      else q.complete("pf3_cog");
    };
    const onAir = () => {
      K.standing(30, "Broadcast the 4 March memo");
      K.safe("cog radio", () => {
        if (!G.isStub("radio") && G.radio.addNews)
          G.radio.addNews(
            'Rocky here. Somebody patched into my band on a Covenant field set this afternoon and read me a piece of paper out of a vault on Wall Street, and I am going to read it to you again, slowly. Saturday, the fourth of March, nineteen sixty-seven. "Move the rolls and enrolled staff to Liberty tonight. No public notice. Protect the source." Signed: M. The night before, folks. They knew, and they saved their list.',
          );
      });
    };
    const reward = (extra) => () => {
      if (!K.has("pf3_cog_core")) return;
      K.take("pf3_cog_core", 1);
      K.give(
        K.itemExists("gyrojet_carbine") ? "gyrojet_carbine" : "hunting_rifle",
        1,
      );
      K.give(K.itemExists("ammo_gyrojet") ? "ammo_gyrojet" : "ammo_308", 40);
      K.give("rally_tonic", 3);
      K.scrip(100 + (extra || 0));
      K.standing(30, "Returned the COG archive to the Iron Covenant");
      PV.setFlag("fh_cog_covenant", true);
      settle("given");
    };
    G.dialogue.register("pf3_dlg_halloran", {
      start: () => {
        if (PV.flag("fh_core_to") || q.done("pf3_cog")) return "after";
        if (K.has("pf3_cog_core")) return "core";
        if (q.active("pf3_cog")) return "again";
        return PV.flag("fh_met_halloran") ? "again2" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Lancer Halloran",
          onEnter: () => PV.setFlag("fh_met_halloran", true),
          text: "[A man in a scorched Iron Covenant Exo-rig, slit visor pushed up, gyrojet carbine braced on the sandbags. His leg is splinted with a table leg.] Hold it. You're not wearing a tire on your head, so you're not Congress. Lancer Halloran, Iron Covenant, out of Rockefeller Center. What's left of my squad is in the hallway. In pieces.",
          responses: [
            { text: "What happened here?", next: "what" },
            { text: "You need help?", next: "help" },
            { text: "I'll leave you to it.", end: true },
          ],
        },
        what: {
          speaker: "Lancer Halloran",
          text: "Archivist Ames decoded an old-world government memo: Federal Hall's Sub-Treasury strongroom was a Continuity of Government node. An archive core, every program the old government ran on this coast, right up to the morning of the Bombing. Lancer-Commander Stroud wants it before the Continuity remembers they left it here. Those people still think it's 1967; they'd use it like it is. We came in quiet. The Congress was in session.",
          responses: [
            { text: "The Congress?", next: "congress" },
            { text: "What do you need?", next: "help" },
          ],
        },
        congress: {
          speaker: "Lancer Halloran",
          text: "Raiders who found the building and read the plaques. Their boss calls himself Speaker Voss: holds \"sessions\" in the rotunda, votes on who gets eaten, taxes Wall Street in bullets, whenever Bear Market Betty's crew at the Exchange hasn't taxed it first. Those two hate each other worse than they hate us. Voss has the strongroom key round his neck; they took it off the last Sub-Treasury guard. What's left of him.",
          responses: [{ text: "What do you need?", next: "help" }],
        },
        help: {
          speaker: "Lancer Halloran",
          text: "The archive strongroom is at the west end of this hall. Big round door, old-world Mosler. Voss has the key, or you can talk him out of it if you've got the tongue for it. Or: Ames worked the combination out of the memo before the Congress got her. Her notebook should still be on her, out in the hall where she fell. Get the core out and bring it to me. The Covenant pays its debts: a gyrojet carbine and the rockets to feed it.",
          responses: [
            { text: "I'll get your core.", next: "yes", action: startCog },
            {
              text: "[Persuasion 50] A carbine for a trip past a whole raider gang? Make it worth my while.",
              check: { skill: "persuasion", value: 50 },
              next: "more",
              failNext: "more_fail",
            },
            { text: "Not my war.", end: true },
          ],
        },
        more: {
          speaker: "Lancer Halloran",
          onEnter: () => PV.setFlag("fh_bonus", 150),
          text: "[He almost laughs, which hurts him.] Fine, mercenary. A hundred and fifty scrip on top, out of the squad fund. They won't be needing it.",
          responses: [{ text: "Deal.", next: "yes", action: startCog }],
        },
        more_fail: {
          speaker: "Lancer Halloran",
          text: "Worth your while is not dying in a raider's stewpot. That's the offer.",
          responses: [
            { text: "Fine. I'll get it.", next: "yes", action: startCog },
            { text: "Not my war.", end: true },
          ],
        },
        yes: {
          speaker: "Lancer Halloran",
          text: "Iron holds. And if you find Acolyte Quintero's tags out there, bring them back. His mother sells candles at the Neon.",
          responses: [{ text: "I will.", end: true }],
        },
        again: {
          speaker: "Lancer Halloran",
          text: () =>
            PV.flag("fh_vault_open")
              ? "Door's open? Then get in there and get the core. I'll hold the hallway."
              : "Voss still breathing? The key's on him. Or find Ames's notebook: the combination's in it, if the Congress didn't eat the page.",
          responses: [{ text: "Working on it.", end: true }],
        },
        again2: {
          speaker: "Lancer Halloran",
          text: "Changed your mind about the archive?",
          responses: [
            { text: "Tell me again.", next: "help" },
            { text: "No.", end: true },
          ],
        },
        core: {
          speaker: "Lancer Halloran",
          text: "[He looks at the core in your hands like a man looking at a newborn.] Archive Seven. The Archivists are going to lose their minds. You did good, survivor. Better than good: you did it alive. Hand it over.",
          responses: [
            {
              text: "[Give him the core] It's yours. Iron holds.",
              next: "paid",
              action: () => reward(PV.flag("fh_bonus") || 0)(),
            },
            {
              text: "Read the last thing on it first. The teleprinter strip.",
              next: "memo",
            },
            {
              text: "[Keep the core] Actually, I think I'll hang on to this.",
              next: "keep",
            },
          ],
        },
        memo: {
          speaker: "Lancer Halloran",
          onEnter: () => PV.setFlag("fh_halloran_read", true),
          text: '[He reads the strip twice. His mouth goes thin.] "Move the rolls and enrolled staff to Liberty tonight. No public notice. Protect the source. M." Fourth of March. They knew. The night before, they knew, and they saved their list and let the city sleep. [He hands it back.] The Archivists will file this under "history". It shouldn\'t be history. It should be on the radio.',
          responses: [
            {
              text: "Then that's where it goes. Can that field set of yours reach Rocky Delgado's band?",
              next: "broadcast",
            },
            {
              text: "It's still yours. Take the core.",
              next: "paid",
              action: () => reward(PV.flag("fh_bonus") || 0)(),
            },
          ],
        },
        broadcast: {
          speaker: "Lancer Halloran",
          text: "[A long breath through his teeth. Then he unclips the field set from his rig and starts winding the crank.] Stroud will have my rig for this. Let him. [Static, a dial, a burst of swing music, a man saying \"Rocky, go.\"] You're on. Read it slowly.\n\n[You read the strip into the handset, twice. On the second reading the music behind Rocky stops.]\n\n[Halloran takes the handset back.] The words are out. The Archivists can still have the hardware, if you'll let them.",
          responses: [
            {
              text: "[Give him the core] Take it. Iron holds.",
              next: "aired",
              action: () => {
                K.take("pf3_cog_core", 1);
                K.give("ammo_gyrojet", 20);
                K.scrip(60);
                PV.setFlag("fh_cog_covenant", true);
                onAir();
                settle("broadcast");
              },
            },
            {
              text: "I'll hang on to it. Somebody might call it a lie.",
              next: "aired",
              action: () => {
                K.give("ammo_gyrojet", 12);
                onAir();
                settle("broadcast");
              },
            },
          ],
        },
        aired: {
          speaker: "Lancer Halloran",
          text: "I'll tell the Lancer-Commander a stranger walked through the Congress and gave the city back its own paperwork. He won't believe it either. Iron holds.",
          responses: [{ text: "Iron holds.", end: true }],
        },
        keep: {
          speaker: "Lancer Halloran",
          text: "[The carbine comes up. Then, slowly, goes down.] I can't chase you on this leg, and I won't shoot a civilian in the back. But the Covenant has a long memory. Think hard about who buys that thing from you.",
          responses: [
            {
              text: "Fine. Take it.",
              next: "paid",
              action: () => reward(PV.flag("fh_bonus") || 0)(),
            },
            {
              text: "The city should hear what's on it. Read it first.",
              next: "memo",
            },
            {
              text: "Nothing personal.",
              end: true,
              action: () => {
                PV.setFlag("fh_cog_kept", true);
                K.standing(-25, "Stole the COG archive");
                settle("kept");
              },
            },
          ],
        },
        paid: {
          speaker: "Lancer Halloran",
          text: "Your carbine, your packs, and the Covenant's thanks. When my relief gets here, I'll tell the Lancer-Commander a stranger walked through the Congress to do our job. He won't believe it either.",
          responses: [{ text: "Iron holds.", end: true }],
        },
        after: {
          speaker: "Lancer Halloran",
          text: () =>
            PV.flag("fh_core_to") === "broadcast"
              ? "Heard it again last night on Rocky's band. \"Protect the source.\" I've been saying it in my head all week. Go on, the Congress isn't going to un-elect itself."
              : PV.flag("fh_core_to") === "kept"
                ? "You. The thief. Keep walking."
                : PV.flag("fh_cog_covenant")
                  ? "Relief's coming at dawn. I'll be fine. Go on, the Congress isn't going to un-elect itself."
                  : "You. The thief. Keep walking.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pf3_dlg_fh_sgt", {
      start: () =>
        PV.flag("fh_congress_hostile")
          ? "war"
          : PV.flag("fh_tax_paid")
            ? "paid"
            : "hello",
      nodes: {
        hello: {
          speaker: "Sergeant-at-Arms",
          text: "[A slab of a raider in a riot helmet with a tricorn wired to it. He levels a shotgun at your belt buckle.] HALT. You are standing in the chamber of the Congress of Wall Street. Visitors pay the entry tax. Ten scrip. Weapons stay holstered. The Speaker is on the throne, if you got business with the Congress.",
          responses: [
            {
              text: "[Pay 10 scrip] Here.",
              cond: () => K.scripCount() >= 10,
              next: "paid_now",
              action: () => {
                K.scrip(-10);
                PV.setFlag("fh_tax_paid", true);
              },
            },
            {
              text: "[Persuasion 40] I'm a visiting delegate. Delegates are exempt.",
              check: { skill: "persuasion", value: 40 },
              next: "exempt",
              failNext: "noexempt",
            },
            { text: "What is this, a toll booth?", next: "what" },
            { text: "I don't pay taxes.", next: "refuse" },
          ],
        },
        what: {
          speaker: "Sergeant-at-Arms",
          text: "This is DEMOCRACY, tourist. We found the building, we read the plaques. Congress makes the laws, Congress collects the taxes, Congress eats whoever votes nay. Ten scrip.",
          responses: [
            {
              text: "[Pay 10 scrip] Fine.",
              cond: () => K.scripCount() >= 10,
              next: "paid_now",
              action: () => {
                K.scrip(-10);
                PV.setFlag("fh_tax_paid", true);
              },
            },
            { text: "Not a chance.", next: "refuse" },
          ],
        },
        exempt: {
          speaker: "Sergeant-at-Arms",
          onEnter: () => {
            PV.setFlag("fh_tax_paid", true);
            K.xp(15, "Talked past the Sergeant-at-Arms");
          },
          text: "[He squints. Checks a clipboard he clearly cannot read.] ...Delegate. Right. Go on through. Don't touch the Speaker's hat.",
          responses: [{ text: "Wouldn't dream of it.", end: true }],
        },
        noexempt: {
          speaker: "Sergeant-at-Arms",
          text: "Nice try. Everybody's a delegate till they're lunch. Ten scrip.",
          responses: [
            {
              text: "[Pay 10 scrip] Fine.",
              cond: () => K.scripCount() >= 10,
              next: "paid_now",
              action: () => {
                K.scrip(-10);
                PV.setFlag("fh_tax_paid", true);
              },
            },
            { text: "No.", next: "refuse" },
          ],
        },
        refuse: {
          speaker: "Sergeant-at-Arms",
          text: "[He considers this.] Then you're a tax dodger, and tax dodgers get tabled. I'm gonna let the Speaker decide. Go on in. Slow.",
          responses: [{ text: "[Go in]", end: true }],
        },
        paid_now: {
          speaker: "Sergeant-at-Arms",
          text: "Pleasure doing business with the Treasury. Speaker's on the throne, north end. Bow a little. He likes that.",
          responses: [{ text: "Sure.", end: true }],
        },
        paid: {
          speaker: "Sergeant-at-Arms",
          text: "You paid. You're fine. For now.",
          responses: [{ text: "Right.", end: true }],
        },
        war: {
          speaker: "Sergeant-at-Arms",
          text: "The Congress has voted!",
          onEnter: () => PV.vossHostile && PV.vossHostile(),
          responses: [{ text: "[Fight]", end: true }],
        },
      },
    });
    G.dialogue.register("pf3_dlg_voss", {
      start: () => "hello",
      nodes: {
        hello: {
          speaker: "Speaker Voss",
          text: "ORDER! The chair recognises the... whatever you are. State your business before the Congress, and be brief — we're voting on lunch.",
          responses: [
            { text: "I want the Sub-Treasury key.", next: "key" },
            {
              text: "[Persuasion 70] Point of order: the Speaker must yield the floor to a visiting delegate.",
              check: { skill: "persuasion", value: 70 },
              next: "yield",
              failNext: "yield_fail",
            },
            { text: "I move we adjourn. Permanently.", next: "fight" },
          ],
        },
        key: {
          speaker: "Speaker Voss",
          text: "The key to the Treasury? That's a matter for the Appropriations Committee. [He pats the shotgun.] I AM the Appropriations Committee.",
          responses: [{ text: "Then I'll appropriate it.", next: "fight" }],
        },
        yield: {
          speaker: "Speaker Voss",
          text: "[He blinks. Checks a mildewed copy of Robert's Rules of Order duct-taped to his armrest. Checks it again.] ...The chair... yields. Motion carries. [He tosses you the key like it burns.] Session's over, everybody go loot something.",
          onEnter: () => {
            K.give("pf3_fh_archive_key", 1);
            PV.setFlag("fh_voss_yielded", true);
            K.xp(100, "Out-parliamented Speaker Voss");
            if (K.q.active("pf3_cog")) K.q.set("pf3_cog", "key");
          },
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        yield_fail: {
          speaker: "Speaker Voss",
          text: "Point of order DENIED. The Congress votes you... [He looks around. Every hand goes up.] ...lunch.",
          responses: [{ text: "So be it.", next: "fight" }],
        },
        fight: {
          speaker: "Speaker Voss",
          text: "All in favour of killing the delegate? The ayes have it!",
          onEnter: () => PV.vossHostile && PV.vossHostile(),
          responses: [{ text: "[Fight]", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // Speaker Voss: holds the gavel on his throne, talks first (Persuasion check), fights after
    const voss = PV.spawnActor(ctx, {
      id: "pf3_voss",
      type: "human",
      gender: "m",
      outfit: "raider_heavy",
      name: "Speaker Voss",
      faction: "raiders",
      level: 12,
      hostile: false,
      pos: v(A.throne),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 2.5,
      dialogue: "pf3_dlg_voss",
      voice: "raider",
      hp: 260,
      dr: 12,
      weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
      inventory: [
        ["pf3_fh_archive_key", 1],
        ["pf3_speaker_gavel", 1],
      ],
      loot: "raider_boss",
      noRespawn: true,
      barks: [
        "ORDER! ORDER!",
        "The chair recognises the gentleman from the sewer.",
        "All in favour? Motion carries.",
        "Filibuster THIS!",
      ],
      onDeath: () => {
        PV.setFlag("fh_voss_dead", true);
      },
    });
    void voss;
    // THE CONGRESS IN SESSION: members on the benches and in the annex are neutral (a parley, a raider
    // truce) until the Speaker calls the vote — or anyone in the chamber gets shot.
    const reps = [
      ["pf3_fh_rep1", "Rep. Skeeter", "sit", "raider", "m"],
      ["pf3_fh_rep2", "The Gentlewoman from Jersey", "sit", "raider", "f"],
      ["pf3_fh_rep3", "Senator Knuckles", "guard", "raider_heavy", "m"],
      ["pf3_fh_rep4", "Rep. Mags", "sit", "raider", "f"],
      ["pf3_fh_rep5", "Pill Committee Chair", "guard", "raider", "m"],
      ["pf3_fh_rep6", "Backbencher", "sit", "raider", "m"],
    ];
    const barks = [
      "Point of order!",
      "I yield my time to my knife.",
      "Aye! Wait, what are we voting on?",
      "The Speaker will see you now. Maybe.",
      "Filibuster! Filibuster!",
      "Lunch recess soon.",
    ];
    reps.forEach(([id, name, ai, outfit, g], i) => {
      const a = A["rep" + (i + 1)];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit,
        name,
        faction: "raiders",
        level: 6 + (i % 3),
        hostile: false,
        pos: v(a),
        yaw: i < 4 ? Math.atan2(-(a.x - A.throne.x), -(a.z - A.throne.z)) : PI,
        ai,
        home: "here",
        homeR: 1.5,
        loot: "raider",
        noRespawn: true,
        weapon: K.itemExists(i % 2 ? "pipe_pistol" : "pistol_10mm")
          ? i % 2
            ? "pipe_pistol"
            : "pistol_10mm"
          : undefined,
        voice: "raider",
        barks: [barks[i], barks[(i + 3) % barks.length]],
      });
    });
    PV.spawnActor(ctx, {
      id: "pf3_fh_sgt",
      type: "human",
      gender: "m",
      outfit: "raider_heavy",
      name: "Sergeant-at-Arms",
      faction: "raiders",
      level: 9,
      hostile: false,
      pos: v(A.sgt),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_fh_sgt",
      voice: "raider",
      loot: "raider",
      noRespawn: true,
      weapon: K.itemExists("hunting_shotgun")
        ? "hunting_shotgun"
        : K.itemExists("combat_shotgun")
          ? "combat_shotgun"
          : undefined,
      barks: [
        "Entry tax is ten scrip. Or a finger.",
        "Hands where I can see 'em.",
        "Chamber's in session. Keep it down.",
      ],
    });
    // turn the Speaker (and the whole Congress) hostile when the vote goes against you or anyone opens fire in the chamber
    PV.vossHostile = () => {
      if (G.isStub("actors") || !G.actors.get) return;
      for (const id of PV.FH_CONGRESS) {
        const a = G.actors.get(id);
        if (a && !a.dead && a.setHostile) a.setHostile(true);
      }
      PV.setFlag("fh_congress_hostile", true);
    };
    if (PV.flag("fh_congress_hostile")) PV.vossHostile();
    // Lancer Halloran in the assay office (friendly, essential)
    PV.spawnActor(ctx, {
      id: "pf3_halloran",
      type: "human",
      gender: "m",
      outfit: "covenant_exo_rig",
      name: "Lancer Halloran",
      faction: "covenant",
      level: 12,
      essential: true,
      pos: v(A.halloran),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_halloran",
      weapon: K.itemExists("gyrojet_carbine") ? "gyrojet_carbine" : undefined,
      barks: [
        "Iron holds.",
        "Leg's fine. Leg's fine.",
        "Come on, relief. Any day now.",
        "I count four of them. Maybe five.",
      ],
    });
    // two Congress pages guarding the vault hall (in addition to the location's raiders)
    if (!PV.flag("fh_pages_dead")) {
      const ids = ["pf3_fh_page1", "pf3_fh_page2"];
      ids.forEach((id, i) =>
        PV.spawnActor(ctx, {
          id,
          type: "human",
          outfit: i ? "raider" : "raider_heavy",
          name: "Congress Page",
          faction: "raiders",
          level: 7,
          hostile: true,
          pos: v(A["page" + (i + 1)]),
          yaw: 0,
          ai: "guard",
          home: "here",
          homeR: 4,
          loot: "raider",
          noRespawn: true,
          weapon: K.itemExists(i ? "hunting_rifle" : "pistol_10mm")
            ? i
              ? "hunting_rifle"
              : "pistol_10mm"
            : undefined,
          barks: [
            "The vault is closed to the public!",
            "Congress is in recess, tourist!",
          ],
          onDeath: () => {
            if (
              ids.every((m) => {
                const a = G.actors.get && G.actors.get(m);
                return !a || a.dead;
              })
            )
              PV.setFlag("fh_pages_dead", true);
          },
        }),
      );
    }
  }

  PV.FH_CONGRESS = [
    "pf3_voss",
    "pf3_fh_sgt",
    "pf3_fh_rep1",
    "pf3_fh_rep2",
    "pf3_fh_rep3",
    "pf3_fh_rep4",
    "pf3_fh_rep5",
    "pf3_fh_rep6",
  ];
  // any shot at a member of the Congress (or the Speaker) ends the parley
  G.events.on("actorDamaged", (actor, amt, info) => {
    if (
      !actor ||
      !actor.id ||
      PV.FH_CONGRESS.indexOf(actor.id) < 0 ||
      PV.flag("fh_congress_hostile")
    )
      return;
    if (
      info &&
      info.source &&
      info.source !== "player" &&
      !(info.source.following === "player")
    )
      return;
    if (PV.vossHostile) PV.vossHostile();
  });
  function update(dt, realDt, ctx) {
    if (PV.fhCoreUpdate) PV.fhCoreUpdate(ctx);
    if (PV.fhDoorUpdate) PV.fhDoorUpdate(ctx, realDt);
    // Voss turns on you when combat starts anywhere in the rotunda
    if (!ctx.inside || !dt) return;
    const a = G.actors.get && G.actors.get("pf3_voss");
    if (!a || a.dead || (a.hostile && a.hostile())) return;
    const P = G.player;
    // same floor only: the delegation's firefight with Halloran downstairs is none of the Speaker's business
    if (
      P &&
      P.pos &&
      a.pos &&
      Math.abs(P.pos.y - a.pos.y) < 2.5 &&
      Math.hypot(P.pos.x - a.pos.x, P.pos.z - a.pos.z) < 30
    ) {
      const fight =
        !G.isStub("combat") && G.combat.isInCombat && G.combat.isInCombat();
      if (fight || a.hp < a.maxHp) PV.vossHostile();
    }
  }

  PV.define({
    id: "federal_hall",
    name: "Federal Hall",
    interior: "federal_hall",
    order: 10,
    build(ctx) {
      exterior(ctx);
      if (PV.fhInterior) PV.fhInterior(ctx);
    },
    data,
    spawn,
    update,
    reset() {
      PV.vossHostile = null;
    },
  });
})();
