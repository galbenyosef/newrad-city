/* src/poi_penn/10_farley.js */
/* =====================================================================
 * NEW RAD CITY — poi_penn / 10_farley.js
 * THE JAMES A. FARLEY GENERAL POST OFFICE — hostile robot site where the
 * mail robots are still running their routes 22 years on.
 *
 * EXTERIOR (site x −180..−140, z −132..−106; the colonnade faces EAST onto
 *   8th Avenue, across from the original Pennsylvania Station):
 *   the broad granite flight of steps between two end pavilions, the
 *   screen of ten Corinthian columns, the entablature carrying the
 *   inscription "NEITHER SNOW NOR RAIN NOR HEAT NOR GLOOM OF NIGHT STAYS
 *   THESE COURIERS FROM THE SWIFT COMPLETION OF THEIR APPOINTED ROUNDS",
 *   the attic, bronze lanterns and doors in the loggia (the transoms still
 *   lit — the building never lost power), lamp standards, collection
 *   boxes, the skylight monitor over the workroom, and the 9th Avenue
 *   loading dock with a wrecked mail truck. One column is snapped off;
 *   its drums lie across the steps.
 * INTERIOR (cell farley_post_office) → 11_farley_interior.js.
 * Content: M.I.L.E.S. (the General Delivery clerk Patrolman), the
 *   friendly postal Patrolmen on their sorting routes (faction 'postal',
 *   neutral), the Civil Service carrier exam / temporary carrier badge
 *   (pacifies the security robots), and the quest "Neither Snow Nor Rain"
 *   (deliver the 22-year-old Special Delivery letter to the Hotel
 *   Pennsylvania's switchboard operator — see 20_hotelpenn.js).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const FA = (PV.fa = {
    X0: -180,
    X1: -140,
    Z0: -132,
    Z1: -106,
    PY: 3.0, // portico / stylobate height
    STEP_X: -144.5, // top of the steps = front of the pavilions & entablature
    WALL_X: -148.5, // loggia back wall (building front)
    COL_X: -145.4, // column centre line
    COL_TOP: 15.0,
    ROOF: 22.5,
    PZ0: -128.6,
    PZ1: -109.4, // colonnade span between the pavilions
    DOCK_X: -176, // west wall behind the loading dock
  });
  FA.door = new THREE.Vector3(FA.WALL_X + 0.35, FA.PY + 1.3, -119);

  const STONE = [0.88, 0.85, 0.8],
    GRAN = [0.8, 0.77, 0.73];

  // ==================================================================
  // EXTERIOR
  // ==================================================================
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
  const LETTER_TEXT =
    "SPECIAL DELIVERY — FIRST CLASS\n\n" +
    "TO:  Miss Mabel Kowalczyk\n      Switchboard (Night Operator)\n      HOTEL PENNSYLVANIA\n      33rd Street, New York 1, N.Y.\n\n" +
    "FROM:  Pfc. W. Nowak, 1st Inf. Div.\n        A.P.O. 81, Keflavík, Iceland\n\n" +
    'Postmark: KEFLAVIK FIELD P.O. — MAR 4 1967 — 6 PM\nStamped in red: "PRIORITY — FORWARD WITHOUT DELAY"\nPencilled on the back: "S.W.A.K."\n\n' +
    "(The envelope is still sealed. Opening someone else's mail is a federal offence. It says so on the envelope, twice.)";

  function data() {
    K.defineItem({
      id: "ppn_special_letter",
      type: "note",
      name: "Special Delivery Letter",
      title: "Special Delivery Letter (sealed)",
      text: LETTER_TEXT,
      weight: 0,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: "A sealed airmail envelope with a red SPECIAL DELIVERY stamp, postmarked Keflavík, Iceland, March 4, 1967. It has been waiting for a carrier for twenty-two years.",
    });
    K.defineItem({
      id: "ppn_carrier_badge",
      type: "misc",
      name: "Temporary Carrier Badge",
      weight: 0,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: 'A tin badge on a lanyard: U.S. POST OFFICE — TEMPORARY CARRIER — GENERAL POST OFFICE, NEW YORK 1. The Farley security Patrolmen read it as "authorised personnel."',
    });
    K.defineItem({
      id: "ppn_receipt",
      type: "misc",
      name: "Return Receipt (Signed)",
      weight: 0,
      value: 0,
      quest: true,
      tags: ["quest"],
      desc: 'A green return-receipt card, signed in a shaky operator\'s hand: "M. Kowalczyk." Proof of delivery.',
    });
    K.defineItem({
      id: "ppn_stamp_album",
      type: "misc",
      name: "Old-world Stamp Album",
      weight: 1,
      value: 260,
      tags: ["valuable", "unique"],
      desc: 'The Postmaster\'s own collection: Liberty Bells, Atomic Age commemoratives, a full sheet of the 1966 "Civil Defense Week" issue and one inverted rotorcraft. Collectors at the Neon would kill for it. Collectors in New York just might.',
    });
    K.defineItem({
      id: "ppn_postmaster_key",
      type: "key",
      name: "Postmaster's Key",
      weight: 0,
      value: 0,
      tags: ["key"],
      learn: "ppn_term_pm",
      desc: 'A brass key on a ring with a cardboard tag: "P.M. OFFICE — DO NOT DUPLICATE." On the back of the tag, in pencil: "teletype — ZIPCODE".',
    });
    K.defineItem({
      id: "ppn_mail_rail_pass",
      type: "misc",
      name: "Mail Rail Motorman's Pass",
      weight: 0,
      value: 15,
      tags: ["junk"],
      desc: "A laminated pass for the Penn Terminal mail railway. The photo has faded to a thumbprint.",
    });

    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "ppn_rounds",
        name: "Neither Snow Nor Rain",
        giver: "M.I.L.E.S.",
        location: "James A. Farley Post Office",
        desc: "A clerk Patrolman at the General Post Office has one piece of First-Class mail left undelivered — a Special Delivery letter from the Iceland garrison, held in the Dead Letter Office since March 4, 1967. Regulation 4-C requires a delivery attempt.",
        stages: [
          {
            id: "retrieve",
            text: "Retrieve the Special Delivery letter from the Dead Letter Office (Farley mezzanine).",
            markers: [
              () => {
                const a = PV.anchor("farley_post_office", "letter");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Dead Letter Office",
                      interior: "farley_post_office",
                    }
                  : null;
              },
            ],
          },
          {
            id: "deliver",
            text: "Deliver the letter to Miss Mabel Kowalczyk, switchboard operator at the Hotel Pennsylvania.",
            markers: [
              () => {
                const a = PV.anchor("hotel_pennsylvania", "dottie");
                return a
                  ? {
                      x: a.x,
                      y: a.y,
                      z: a.z,
                      label: "Switchboard",
                      interior: "hotel_pennsylvania",
                    }
                  : null;
              },
              () => {
                const a = PV.anchor("hotel_pennsylvania", "door");
                return a
                  ? { x: a.x, z: a.z, label: "Hotel Pennsylvania" }
                  : null;
              },
            ],
          },
          {
            id: "receipt",
            text: "Bring the signed return receipt to M.I.L.E.S. at the General Post Office.",
            markers: [
              { npc: "ppn_miles", label: "M.I.L.E.S." },
              () => {
                const a = PV.anchor("farley_post_office", "door");
                return a
                  ? { x: a.x, z: a.z, label: "General Post Office" }
                  : null;
              },
            ],
          },
        ],
        rewards: { xp: 350 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const pname = () =>
      String(
        (G.HERO && G.HERO.name) || (G.player && G.player.name) || "CARRIER",
      ).toUpperCase();
    const startQuest = () => {
      q.start("ppn_rounds");
      if (K.has("ppn_special_letter")) q.set("ppn_rounds", "deliver");
      if (K.has("ppn_receipt")) q.set("ppn_rounds", "receipt");
    };
    const certify = () => {
      if (!K.has("ppn_carrier_badge")) K.give("ppn_carrier_badge", 1);
      PV.setFlag("fa_carrier", true);
      if (PV.faPacify) PV.faPacify(true);
    };
    const reward = () => {
      if (!q.active("ppn_rounds")) return;
      K.take("ppn_receipt", 1);
      K.scrip(PV.flag("fa_backpay") ? 300 : 200);
      K.give("ppn_stamp_album", 1);
      K.give("rally_tonic", 2);
      K.standing(
        PV.flag("ho_dottie_cruel") ? 0 : 20,
        "Delivered the last letter",
      );
      PV.setFlag("fa_delivered", true);
      q.complete("ppn_rounds");
    };
    const examAns = (ok) => () => {
      PV.setFlag("fa_exam", (PV.flag("fa_exam") || 0) + (ok ? 1 : 0));
    };
    const MILES = "M.I.L.E.S.";
    G.dialogue.register("ppn_dlg_miles", {
      start: () => {
        if (q.done("ppn_rounds")) return "after";
        if (K.has("ppn_receipt")) return "receipt";
        if (q.active("ppn_rounds"))
          return K.has("ppn_special_letter") ? "go" : "again";
        return PV.flag("fa_met_miles") ? "hello2" : "hello";
      },
      nodes: {
        hello: {
          speaker: MILES,
          onEnter: () => PV.setFlag("fa_met_miles", true),
          text: "[Behind the brass grille of window 12, GENERAL DELIVERY, a Patrolman in faded postal blue swivels its dome toward you. A ticket dispenser on its chest spits out a slip: 4,113.] NEXT CUSTOMER, PLEASE. WELCOME TO THE JAMES A. FARLEY GENERAL POST OFFICE. CURRENT WAIT TIME: EIGHT THOUSAND AND NINETY-ONE DAYS. THANK YOU FOR YOUR PATIENCE.",
          responses: [
            { text: "Seventy-three thousand days?", next: "wait" },
            { text: "Any mail for me?", next: "mail" },
            { text: "What happened here?", next: "history" },
            { text: "I'll come back later.", end: true },
          ],
        },
        hello2: {
          speaker: MILES,
          text: "NEXT CUSTOMER, PLEASE. OH. IT IS YOU AGAIN. YOUR NUMBER HAS BEEN CALLED. [It has not.]",
          responses: [
            { text: "Tell me about the undelivered letter.", next: "dead" },
            { text: "Any mail for me?", next: "mail" },
            { text: "Goodbye.", end: true },
          ],
        },
        wait: {
          speaker: MILES,
          text: "THE GENERAL POST OFFICE HAS OPERATED AT REDUCED STAFFING SINCE 03-05-1967. HUMAN STAFF: ZERO. CUSTOMERS: ZERO. MAIL VOLUME: ZERO. SERVICE STANDARD: MAINTAINED. [Its pincer taps a brass bell. Ding.]",
          responses: [
            { text: "What happened on 03-05-1967?", next: "history" },
            { text: "Any mail for me?", next: "mail" },
          ],
        },
        mail: {
          speaker: MILES,
          text: () =>
            'PLEASE STATE NAME. [...] SEARCHING. [A long whirr from somewhere behind the wall.] NO MAIL FOR "' +
            pname() +
            '." HAVE YOU CONSIDERED HAVING AN ADDRESS? IT HELPS.',
          responses: [
            { text: "Very funny.", next: "history" },
            { text: "Goodbye.", end: true },
          ],
        },
        history: {
          speaker: MILES,
          text: 'AT 09:47 ON 03-05-1967 THE POSTMASTER GENERAL\'S CONTINGENCY DIRECTIVE 12 ENTERED EFFECT: "THE MAIL MUST GO THROUGH." SORTING HAS CONTINUED WITHOUT INTERRUPTION. ALL CITY ROUTES REPORT: ADDRESSEE UNKNOWN. ALL MAIL HAS BEEN FORWARDED TO THE DEAD LETTER OFFICE. EFFICIENCY: ONE HUNDRED PERCENT.',
          responses: [
            {
              text: "So every letter ended up in the Dead Letter Office?",
              next: "dead",
            },
          ],
        },
        dead: {
          speaker: MILES,
          text: "CORRECT. ONE ITEM REMAINS UNRESOLVED. FIRST-CLASS, SPECIAL DELIVERY, POSTMARKED KEFLAVIK, ICELAND, 03-04-1967. ADDRESSEE: MISS MABEL KOWALCZYK, HOTEL PENNSYLVANIA, 33RD STREET. DELIVERY ATTEMPTS: ZERO. REGULATION 4-C REQUIRES A DELIVERY ATTEMPT BY A CERTIFIED CARRIER. CERTIFIED CARRIERS AVAILABLE: ZERO. WOULD YOU LIKE TO APPLY?",
          responses: [
            { text: "I'll deliver it.", next: "apply", action: startQuest },
            { text: "Why not send one of your robots?", next: "why" },
            {
              text: "The Hotel Pennsylvania? That's by Penn Station. Nobody's there.",
              next: "nobody",
            },
            { text: "Not interested.", end: true },
          ],
        },
        why: {
          speaker: MILES,
          text: 'PATROLMAN UNITS ARE BOUND TO THIS FACILITY BY SECURITY PERIMETER DIRECTIVE 9. ADDITIONALLY, THE LAST CARRIER REPORT FROM THAT ADDRESS READS, QUOTE: "HOTEL CRAWLING WITH MANIACS. REFUSE TO GO BACK. TELL MY WIFE I LOVE HER." END QUOTE. THAT CARRIER IS NOW ON EXTENDED LEAVE.',
          responses: [
            {
              text: "Fine. I'll deliver it.",
              next: "apply",
              action: startQuest,
            },
            { text: "No thanks.", end: true },
          ],
        },
        nobody: {
          speaker: MILES,
          text: "THE ADDRESSEE HAS NOT FILED A CHANGE-OF-ADDRESS FORM. UNDER REGULATION 4-C, SHE THEREFORE STILL LIVES THERE. [Its dome tilts.] REGULATIONS ARE VERY COMFORTING. YOU SHOULD TRY THEM.",
          responses: [
            {
              text: "Fine. I'll deliver it.",
              next: "apply",
              action: startQuest,
            },
            { text: "No thanks.", end: true },
          ],
        },
        apply: {
          speaker: MILES,
          text: "EXCELLENT. THE LETTER IS ON THE HOLD SHELF IN THE DEAD LETTER OFFICE, MEZZANINE LEVEL. WARNING: THE WORKROOM FLOOR IS A RESTRICTED AREA. SECURITY UNITS WILL REMOVE UNCERTIFIED PERSONNEL WITH FORCE. TO BECOME CERTIFIED, PLEASE COMPLETE THE CIVIL SERVICE CARRIER EXAMINATION. IT TAKES FORTY MINUTES. [Pause.] THREE QUESTIONS. I ROUNDED UP.",
          responses: [
            {
              text: "Let's take the exam.",
              next: "exam1",
              action: () => PV.setFlag("fa_exam", 0),
              cond: () => !PV.flag("fa_carrier"),
            },
            {
              text: "[Electronics 50] Or I could just update your personnel records from here.",
              check: { skill: "electronics", value: 50 },
              next: "hack",
              failNext: "hack_fail",
              cond: () => !PV.flag("fa_carrier"),
            },
            { text: "I'll get it my own way.", end: true },
          ],
        },
        hack: {
          speaker: MILES,
          onEnter: () => {
            certify();
            K.xp(40, "Rewrote the Farley personnel file");
          },
          text:
            "[You reach through the grille and pop the service hatch on its back. Two jumpers later:] ...PERSONNEL RECORD UPDATED. WELCOME BACK, SENIOR CARRIER " +
            "[NAME FIELD CORRUPTED]" +
            ". YOUR BADGE HAS BEEN REPRINTED. [A tin badge clanks into the tray.] SECURITY UNITS HAVE BEEN NOTIFIED.",
          responses: [{ text: "Thanks. I'll get the letter.", end: true }],
        },
        hack_fail: {
          speaker: MILES,
          text: '[Sparks. The Patrolman\'s dome spins a full revolution.] TAMPERING WITH POSTAL EQUIPMENT IS A FEDERAL OFFENCE. THIS INCIDENT HAS BEEN LOGGED. [It prints a slip. The slip says "LOGGED."] YOU MAY STILL TAKE THE EXAMINATION.',
          responses: [
            {
              text: "Fine. The exam.",
              next: "exam1",
              action: () => PV.setFlag("fa_exam", 0),
            },
            { text: "Never mind.", end: true },
          ],
        },
        exam1: {
          speaker: MILES,
          text: 'QUESTION ONE. A LETTER IS ADDRESSED TO "OCCUPANT." THE OCCUPANT IS A PILE OF ASH. THE CORRECT ACTION IS:',
          responses: [
            {
              text: "Deliver it to the ash.",
              next: "exam2",
              action: examAns(true),
            },
            {
              text: "Return to sender.",
              next: "exam2",
              action: examAns(false),
            },
            {
              text: "Read it. The ash won't mind.",
              next: "exam2",
              action: examAns(false),
            },
          ],
        },
        exam2: {
          speaker: MILES,
          text: "QUESTION TWO. DURING YOUR ROUTE YOU ARE ATTACKED BY A DOG. THE DOG IS ON FIRE. THE DOG HAS TWO HEADS. YOU:",
          responses: [
            { text: "Put out the dog.", next: "exam3", action: examAns(false) },
            {
              text: "Finish the route. The mail must go through.",
              next: "exam3",
              action: examAns(true),
            },
            { text: "Run.", next: "exam3", action: examAns(false) },
          ],
        },
        exam3: {
          speaker: MILES,
          text: "QUESTION THREE. WHAT WAS THE FIRST-CLASS POSTAGE RATE FOR A ONE-OUNCE LETTER, AS OF MARCH 1967?",
          responses: [
            { text: "Four cents.", next: "grade", action: examAns(false) },
            { text: "One scrip.", next: "grade", action: examAns(false) },
            {
              text: "[Wits 6] Fourteen ninety-five. Wartime inflation.",
              check: { attr: "wits", value: 6 },
              next: "grade",
              failNext: "grade",
              action: examAns(true),
            },
            {
              text: "Fourteen dollars and ninety-five cents?",
              next: "grade",
              action: examAns(true),
            },
          ],
        },
        grade: {
          speaker: MILES,
          text: () =>
            "GRADING. [It prints a long strip of paper, reads it, and prints another one.] SCORE: " +
            (PV.flag("fa_exam") || 0) +
            " OUT OF 3. " +
            ((PV.flag("fa_exam") || 0) >= 2
              ? "PASS."
              : "FAIL. YOU MAY RE-APPLY IN NINETY DAYS."),
          responses: [
            {
              text: "Great. Now what?",
              cond: () => (PV.flag("fa_exam") || 0) >= 2,
              next: "pass",
              action: () => {
                certify();
                K.xp(30, "Passed the Civil Service carrier exam");
              },
            },
            {
              text: "[Persuasion 40] Check that again. I think you carried a one.",
              cond: () => (PV.flag("fa_exam") || 0) < 2,
              check: { skill: "persuasion", value: 40 },
              next: "pass",
              failNext: "failed",
              action: () => {
                certify();
              },
            },
            {
              text: "Ninety days? Forget it.",
              cond: () => (PV.flag("fa_exam") || 0) < 2,
              next: "failed",
            },
          ],
        },
        pass: {
          speaker: MILES,
          text: () =>
            "CONGRATULATIONS, TEMPORARY CARRIER " +
            pname() +
            ". [A tin badge clanks into the tray.] SECURITY UNITS HAVE BEEN NOTIFIED OF YOUR CLEARANCE. PLEASE COLLECT THE ITEM FROM THE HOLD SHELF, DEAD LETTER OFFICE, MEZZANINE LEVEL. AND CARRIER? DO NOT TOUCH THE CONVEYORS. THEY BITE.",
          responses: [{ text: "On my way.", end: true }],
        },
        failed: {
          speaker: MILES,
          text: "UNCERTIFIED PERSONNEL MAY NOT ENTER THE WORKROOM. [Pause.] I AM REQUIRED TO SAY THAT. I AM NOT REQUIRED TO STOP YOU. THE SECURITY UNITS, HOWEVER, ARE.",
          responses: [{ text: "Understood.", end: true }],
        },
        again: {
          speaker: MILES,
          text: () =>
            PV.flag("fa_carrier")
              ? "CARRIER. THE ITEM IS ON THE HOLD SHELF, DEAD LETTER OFFICE, MEZZANINE LEVEL. STAIRS AT THE EAST END OF THE WORKROOM."
              : "THE ITEM IS ON THE HOLD SHELF, DEAD LETTER OFFICE, MEZZANINE LEVEL. YOU ARE STILL UNCERTIFIED. THE SECURITY UNITS HAVE NOTICED.",
          responses: [
            {
              text: "About that exam...",
              cond: () => !PV.flag("fa_carrier"),
              next: "exam1",
              action: () => PV.setFlag("fa_exam", 0),
            },
            { text: "Working on it.", end: true },
          ],
        },
        go: {
          speaker: MILES,
          text: "ITEM IN CARRIER'S POSSESSION. ADDRESSEE: MISS MABEL KOWALCZYK, HOTEL PENNSYLVANIA, 33RD STREET AT HERALD SQUARE — EAST OF PENNSYLVANIA STATION, PAST SEVENTH AVENUE. OBTAIN A SIGNATURE ON THE RETURN RECEIPT. [It clips a green card to the envelope.] GODSPEED, CARRIER.",
          responses: [
            {
              text: "I'm going.",
              end: true,
              action: () => {
                if (q.active("ppn_rounds")) q.set("ppn_rounds", "deliver");
              },
            },
          ],
        },
        receipt: {
          speaker: MILES,
          text: '[The Patrolman takes the green card in both pincers and holds it very close to its lens.] PROOF OF DELIVERY RECEIVED. SIGNATURE: "D. KOWALCZYK." ITEM STATUS: DELIVERED. [Every light on the robot flickers at once, then steadies.] EIGHT THOUSAND AND NINETY-ONE DAYS. THANK YOU, CARRIER.',
          responses: [
            { text: "What happens now?", next: "now" },
            {
              text: "[Trade 40] Carriers get paid, right? Twenty-two years of back pay.",
              check: { skill: "trade", value: 40 },
              next: "backpay",
              failNext: "now",
            },
          ],
        },
        backpay: {
          speaker: MILES,
          onEnter: () => PV.setFlag("fa_backpay", true),
          text: "CORRECT. TEMPORARY CARRIER RATE, ONE DELIVERY, WITH COST-OF-LIVING ADJUSTMENT FOR 8,091 DAYS. [It thinks about this for an uncomfortably long time.] THE POSTAL SAVINGS SYSTEM WILL PAY IN RATION SCRIP, WHICH I AM TOLD IS NOW LEGAL TENDER. I HAVE BEEN COLLECTING THEM FROM THE MAIL.",
          responses: [{ text: "Good robot.", next: "now" }],
        },
        now: {
          speaker: MILES,
          onEnter: reward,
          text: "THE DEAD LETTER OFFICE IS EMPTY. THE GENERAL POST OFFICE HAS NO FURTHER MAIL. [It slides a leather album through the grille.] THE POSTMASTER'S COLLECTION. HE WOULD HAVE WANTED A CARRIER TO HAVE IT. AND YOUR PAY. [Scrip rattle down the chute.] WINDOW 12 IS NOW CLOSED. [It does not move.]",
          responses: [{ text: "Goodbye, MILES.", end: true }],
        },
        after: {
          speaker: MILES,
          text: "NEXT CUSTOMER, PLEASE. OH. CARRIER. THE ROUTES ARE QUIET. WE HAVE BEGUN SORTING THE SAME LETTERS AGAIN, FOR PRACTICE. IT IS WHAT WE ARE FOR.",
          responses: [{ text: "Keep it up.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN: M.I.L.E.S. + the postal Patrolmen running their routes
  // ==================================================================
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    if (A.miles)
      PV.spawnActor(ctx, {
        id: "ppn_miles",
        type: "patrolman",
        variant: "police",
        name: "M.I.L.E.S.",
        faction: "postal",
        level: 6,
        hostile: false,
        essential: true,
        pos: v(A.miles),
        yaw: 0,
        ai: "static",
        home: "here",
        homeR: 0.5,
        dialogue: "ppn_dlg_miles",
        noRespawn: true,
        lookYaw: 0,
        barks: [
          "NEXT CUSTOMER, PLEASE.",
          "NOW SERVING: NUMBER 77.",
          "PLEASE HAVE YOUR PARCEL READY.",
          "THANK YOU FOR USING THE UNITED STATES MAIL.",
        ],
      });
    // three sorter units walking their routes on the workroom floor (neutral unless shot)
    const routes = ctx.routes || [];
    routes.forEach((route, i) => {
      if (!route || route.length < 2) return;
      PV.spawnActor(ctx, {
        id: "ppn_sorter" + (i + 1),
        type: "patrolman",
        variant: i === 1 ? "utility" : "police",
        name: "Postal Patrolman",
        faction: "postal",
        level: 4,
        hostile: false,
        pos: { x: route[0].x, y: route[0].y, z: route[0].z },
        yaw: 0,
        ai: "patrol",
        patrol: route.map((p) => ({ x: p.x, z: p.z })),
        home: { x: route[0].x, z: route[0].z, r: 30 },
        noRespawn: true,
        loot: "patrolman",
        speed: 0.8,
        barks: [
          "SORTING. SORTING.",
          "ADDRESSEE UNKNOWN. FORWARD TO DEAD LETTER OFFICE.",
          "ROUTE 14 COMPLETE. BEGIN ROUTE 14.",
          "ZONE NUMBERS SAVE TIME.",
          "NEITHER SNOW NOR RAIN.",
        ],
      });
    });
    if (PV.flag("fa_carrier")) PV.faPacify && PV.faPacify(false);
  }

  /** Is the actor one of the location's security robots (inside our interior cell)? */
  function inCell(a) {
    const it = G.LAYOUT.INTERIORS.farley_post_office;
    if (!it || !a || !a.pos) return false;
    return (
      Math.abs(a.pos.x - it.origin.x) < 150 &&
      Math.abs(a.pos.z - it.origin.z) < 150
    );
  }
  /** Carrier badge: the location's security robots stand down (until provoked). */
  PV.faPacify = function (announce) {
    if (PV.flag("fa_provoked") || G.isStub("actors") || !G.actors.list) return;
    let n = 0;
    for (const a of G.actors.list()) {
      if (!a || a.dead || a.faction !== "robots" || !inCell(a)) continue;
      if (a.hostile && a.hostile()) {
        K.safe("pacify", () => a.setHostile(false));
        n++;
      }
    }
    if (announce && n) K.notify("Security units: carrier recognised.");
  };
  G.events.on("actorDamaged", (actor, amt, info) => {
    if (
      !actor ||
      PV.flag("fa_provoked") ||
      G.isStub("actors") ||
      !G.actors.list
    )
      return;
    const src = info && info.source;
    if (src !== "player" && !(src && src.following === "player")) return;
    if (!(
      (actor.faction === "robots" || actor.faction === "postal") &&
      inCell(actor)
    ))
      return;
    PV.setFlag("fa_provoked", true);
    for (const a of G.actors.list())
      if (
        a &&
        !a.dead &&
        inCell(a) &&
        (a.faction === "robots" ||
          (a.faction === "postal" && a.id !== "ppn_miles"))
      )
        K.safe("provoke", () => a.setHostile(true));
    K.notify("SECURITY ALERT: ASSAULT ON A POSTAL EMPLOYEE.");
  });

  let pacT = 0;
  function update(dt, realDt, ctx) {
    if (PV.faInteriorUpdate) PV.faInteriorUpdate(dt, realDt, ctx);
    if (!ctx.inside) return;
    pacT -= realDt;
    if (pacT <= 0) {
      pacT = 1.0;
      if (PV.flag("fa_carrier")) PV.faPacify(false);
    }
  }
  // the letter picked up → quest advances (also starts the quest if found before meeting MILES)
  G.events.on("itemAdded", (id) => {
    if (id !== "ppn_special_letter") return;
    if (!K.q.started("ppn_rounds")) K.q.start("ppn_rounds");
    K.q.set("ppn_rounds", "deliver");
  });

  PV.define({
    id: "farley_post_office",
    name: "James A. Farley Post Office",
    interior: "farley_post_office",
    order: 10,
    build(ctx) {
      exterior(ctx);
      if (PV.faInterior) PV.faInterior(ctx);
    },
    data,
    spawn,
    update,
    reset() {
      pacT = 0;
    },
  });
})();
