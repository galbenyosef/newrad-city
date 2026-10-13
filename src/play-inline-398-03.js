// play-inline-398 03 — bz1
// Lines 39-692 of readable/play-inline-398.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "ch_ext", grime: 0.6 });
    const d = K.builder({ name: "ch_ext_detail", grime: 0.6 });
    const lit = K.builder({ name: "ch_ext_lit", grime: 0 });
    const r = K.rng("ch_ext");
    const H = 10.4;

    // ---------------- the house ----------------
    b.face("brick_brown", X0, 0, BZ1, 1, 0, 0, 0, 1, 0, X1 - X0, H, {
      tint: BRICK,
    }); // south (courtyard)
    b.face("brick_brown", X1, 0, BZ0, -1, 0, 0, 0, 1, 0, X1 - X0, H, {
      tint: BRICK.map((v) => v * 0.85),
    }); // north
    b.face("brick_brown", X1, 0, BZ1, 0, 0, -1, 0, 1, 0, BZ1 - BZ0, H, {
      tint: BRICK.map((v) => v * 0.92),
    }); // east (avenue)
    b.face("brick_brown", X0, 0, BZ0, 0, 0, 1, 0, 1, 0, BZ1 - BZ0, H, {
      tint: BRICK.map((v) => v * 0.9),
    }); // west
    b.face("concrete_dark", X0, H, BZ1, 1, 0, 0, 0, 0, -1, X1 - X0, BZ1 - BZ0, {
      uv: "top",
      tint: [0.36, 0.34, 0.32],
    });
    b.col(X0, 0, BZ0, X1, H, BZ1, { tag: "building" });
    // parapet + simple sheet-metal cornice
    K.cornice(b, X0, BZ1, X1, BZ1, H - 0.7, 0, 1, {
      mat: "metal",
      tint: [0.3, 0.28, 0.24],
      depth: 0.45,
      h: 0.7,
      brackets: 1.2,
    });
    b.boxMM("brick_brown", X0, H, BZ0, X1, H + 0.8, BZ0 + 0.3, { tint: BRICK });
    b.boxMM("brick_brown", X0, H, BZ1 - 0.3, X1, H + 0.8, BZ1, { tint: BRICK });
    // windows: street-shy ground floor (shuttered), upper floors lived in
    for (let f = 0; f < 3; f++) {
      for (let k = 0; k < 4; k++) {
        const x = X0 + 2.2 + k * 4.1;
        if (f === 0 && Math.abs(x - DOOR.x) < 1.6) continue;
        const st =
          f === 0
            ? "boarded"
            : r() < 0.2
              ? "broken"
              : r() < 0.5
                ? "dark"
                : "glass";
        K.sash(b, x, 1.2 + f * 3.2, BZ1, 0, 1, 1.1, f === 0 ? 1.4 : 1.8, {
          state: st,
          cols: 2,
          rows: 2,
          surround: "brownstone",
          surroundTint: [0.8, 0.64, 0.52],
          lintel: 0.2,
        });
        if (f === 2 && k === 1)
          lit.plate(
            "lamp",
            x,
            1.2 + f * 3.2 + 0.9,
            BZ1 + 0.03,
            0,
            1,
            1.0,
            1.7,
            null,
            { tint: [0.9, 0.62, 0.3] },
          );
      }
      for (const z of [378.2, 383.2])
        if (!(f === 0 && Math.abs(z - D86.z) < 1.5))
          K.sash(b, X1, 1.2 + f * 3.2, z, 1, 0, 1.0, f === 0 ? 1.2 : 1.7, {
            state: f === 0 ? "boarded" : "dark",
            cols: 2,
            rows: 2,
            surround: "brownstone",
            surroundTint: [0.8, 0.64, 0.52],
            lintel: 0.2,
          });
    }
    // the unmarked brown door (courtyard): no sign, just a brass knocker and a peephole
    b.boxMM("wood_dark", DOOR.x - 0.6, 0, BZ1, DOOR.x + 0.6, 2.4, BZ1 + 0.08, {
      tint: [0.34, 0.22, 0.14],
    });
    for (const y of [0.4, 1.3])
      b.boxMM(
        "wood_dark",
        DOOR.x - 0.45,
        y,
        BZ1 + 0.08,
        DOOR.x + 0.45,
        y + 0.75,
        BZ1 + 0.1,
        { tint: [0.3, 0.19, 0.12] },
      );
    b.geo("brass", new THREE.TorusGeometry(0.08, 0.015, 5, 10), {
      x: DOOR.x,
      y: 1.55,
      z: BZ1 + 0.13,
      tint: [0.7, 0.55, 0.3],
    });
    b.cyl("brass", DOOR.x, 1.62, BZ1 + 0.1, 0.03, 0.03, 0.02, 8);
    b.boxMM(
      "brownstone",
      DOOR.x - 0.8,
      2.4,
      BZ1,
      DOOR.x + 0.8,
      2.6,
      BZ1 + 0.18,
      { tint: [0.7, 0.55, 0.45] },
    );
    b.boxMM("brownstone", DOOR.x - 0.9, 0, BZ1, DOOR.x + 0.9, 0.18, BZ1 + 0.6, {
      tint: [0.6, 0.5, 0.42],
    });
    b.plate(
      "art",
      DOOR.x + 1.0,
      1.5,
      BZ1 + 0.02,
      0,
      1,
      0.34,
      0.22,
      K.signCell("ch_notabar", "THIS IS\nNOT A BAR", 96, 64, {
        bg: "#e8dcb8",
        fg: "#2a1a10",
        font: "Georgia, serif",
      }),
    );
    // the "86" door on the avenue side
    b.boxMM("wood_dark", X1, 0, D86.z - 0.55, X1 + 0.08, 2.3, D86.z + 0.55, {
      tint: [0.22, 0.2, 0.18],
    });
    K.letters(b, X1 + 0.115, 1.75, D86.z, 1, 0, 0.5, 0.36, "86", {
      fg: "#d8c890",
      font: "Georgia, serif",
      off: 0.01,
    });
    b.boxMM("brownstone", X1, 2.3, D86.z - 0.7, X1 + 0.16, 2.5, D86.z + 0.7, {
      tint: [0.7, 0.55, 0.45],
    });
    // door 86 has to read as a door from the avenue: panels, knob, a worn stone step and a caged bulb over it
    for (const [y0, y1] of [
      [0.3, 1.05],
      [1.25, 2.1],
    ])
      b.boxMM(
        "wood_dark",
        X1 + 0.08,
        y0,
        D86.z - 0.42,
        X1 + 0.11,
        y1,
        D86.z + 0.42,
        { tint: [0.3, 0.27, 0.24] },
      );
    b.geo("brass", K.sphereGeo(), {
      x: X1 + 0.16,
      y: 1.05,
      z: D86.z - 0.36,
      s: 0.045,
      tint: [0.75, 0.6, 0.32],
    });
    for (const s2 of [-1, 1])
      b.boxMM(
        "brownstone",
        X1,
        0,
        D86.z + s2 * 0.55 - 0.08,
        X1 + 0.14,
        2.3,
        D86.z + s2 * 0.55 + 0.08,
        { tint: [0.66, 0.52, 0.42] },
      );
    b.boxMM("granite", X1, 0, D86.z - 0.8, X1 + 0.5, 0.14, D86.z + 0.8, {
      tint: [0.55, 0.53, 0.5],
    });
    b.col(X1, 0, D86.z - 0.8, X1 + 0.5, 0.14, D86.z + 0.8, {
      tag: "steps",
      surface: "concrete",
    });
    b.beam("black_iron", X1, 2.75, D86.z, X1 + 0.3, 2.75, D86.z, 0.03, 0.03);
    b.geo("lamp", K.sphereGeo(), {
      x: X1 + 0.3,
      y: 2.62,
      z: D86.z,
      s: 0.07,
      tint: [1, 0.8, 0.5],
    });
    for (let k = 0; k < 4; k++) {
      const a = (k * PI) / 2;
      b.beam(
        "black_iron",
        X1 + 0.3 + Math.cos(a) * 0.09,
        2.52,
        D86.z + Math.sin(a) * 0.09,
        X1 + 0.3 + Math.cos(a) * 0.09,
        2.74,
        D86.z + Math.sin(a) * 0.09,
        0.012,
        0.012,
      );
    }
    b.glow(X1 + 0.35, 2.62, D86.z, [1, 0.72, 0.4], 1.3);
    b.plate(
      "decal",
      X1 + 0.03,
      1.1,
      D86.z - 1.6,
      1,
      0,
      1.2,
      0.5,
      K.tag("86'D", "#c02818", 256, 96),
    );
    // fire escape on the courtyard face
    for (const y of [4.1, 7.3]) {
      b.boxMM("black_iron", X0 + 1.5, y - 0.06, BZ1, X0 + 7.5, y, BZ1 + 1.1, {
        tint: [0.16, 0.15, 0.14],
        faces: "nsewtb",
      });
      K.railing(b, X0 + 1.5, BZ1 + 1.1, X0 + 7.5, BZ1 + 1.1, y, {
        h: 0.95,
        mat: "black_iron",
        handMat: "black_iron",
        step: 0.16,
        col: false,
      });
      for (const x of [X0 + 1.7, X0 + 7.3])
        b.beam(
          "black_iron",
          x,
          y - 0.7,
          BZ1,
          x,
          y - 0.05,
          BZ1 + 1.0,
          0.05,
          0.05,
        );
    }
    for (const s of [-0.2, 0.2])
      b.beam(
        "black_iron",
        X0 + 3 + s,
        4.1,
        BZ1 + 0.8,
        X0 + 4.6 + s,
        7.3,
        BZ1 + 0.8,
        0.04,
        0.04,
      );
    // rooftop: brick chimney stacks + water tank
    for (const x of [X0 + 2, X1 - 3]) {
      b.boxMM(
        "brick_brown",
        x - 0.5,
        H,
        BZ0 + 1.2,
        x + 0.5,
        H + 2.4,
        BZ0 + 2.2,
        { tint: BRICK.map((v) => v * 0.8) },
      );
      b.burn(x, H + 2.4, BZ0 + 1.7, 0.8, 0.8);
    }
    for (const [dx, dz] of [
      [-1, -1],
      [1, -1],
      [1, 1],
      [-1, 1],
    ])
      b.pipe(
        "rust",
        -56 + dx * 0.9,
        H,
        380 + dz * 0.9,
        -56 + dx * 0.9,
        H + 2.2,
        380 + dz * 0.9,
        0.06,
        5,
      );
    b.cyl("wood_rotten", -56, H + 2.2, 380, 1.4, 1.4, 2.4, 14, {
      tint: [0.6, 0.48, 0.36],
    });
    b.cyl("wood_rotten", -56, H + 4.6, 380, 1.5, 0.12, 0.9, 14, {
      tint: [0.48, 0.4, 0.3],
    });

    // ---------------- Pamela Court ----------------
    b.face("granite", X0, 0.03, SZ, 1, 0, 0, 0, 0, -1, X1 - X0, SZ - BZ1, {
      uv: "top",
      tint: [0.6, 0.58, 0.55],
    });
    // street wall with the arched passage (brick, 3.4 m) — the only way in from 8th Street
    const WH = 3.4;
    const segW = (xa, xb) => {
      b.boxMM("brick_brown", xa, 0, SZ - 0.2, xb, WH, SZ + 0.2, {
        tint: BRICK,
      });
      b.col(xa, 0, SZ - 0.2, xb, WH, SZ + 0.2, {
        tag: "wall",
        walkable: false,
      });
      b.boxMM(
        "brownstone",
        xa - 0.05,
        WH,
        SZ - 0.26,
        xb + 0.05,
        WH + 0.18,
        SZ + 0.26,
        { tint: [0.7, 0.56, 0.46] },
      );
    };
    segW(X0, GATE_X - 0.8);
    segW(GATE_X + 0.8, X1);
    // arch over the passage
    for (let i = 0; i < 8; i++) {
      const a0 = (PI * i) / 8,
        a1 = (PI * (i + 1)) / 8;
      b.beam(
        "brownstone",
        GATE_X + Math.cos(a0) * 0.95,
        2.4 + Math.sin(a0) * 0.95,
        SZ,
        GATE_X + Math.cos(a1) * 0.95,
        2.4 + Math.sin(a1) * 0.95,
        SZ,
        0.24,
        0.44,
        { tint: [0.7, 0.56, 0.46] },
      );
    }
    b.boxMM(
      "brick_brown",
      GATE_X - 0.8,
      3.3,
      SZ - 0.2,
      GATE_X + 0.8,
      WH + 0.6,
      SZ + 0.2,
      { tint: BRICK },
    );
    // a half-open iron gate
    for (let k = 0; k < 6; k++) {
      const t = k / 5;
      b.beam(
        "black_iron",
        GATE_X - 0.75 + t * 0.2,
        0,
        SZ - 0.1 - t * 0.7,
        GATE_X - 0.75 + t * 0.2,
        2.2,
        SZ - 0.1 - t * 0.7,
        0.025,
        0.025,
        { tint: [0.18, 0.17, 0.16] },
      );
    }
    b.beam(
      "black_iron",
      GATE_X - 0.75,
      2.1,
      SZ - 0.1,
      GATE_X - 0.55,
      2.1,
      SZ - 0.8,
      0.04,
      0.04,
    );
    b.plate(
      "art",
      GATE_X + 1.25,
      1.75,
      SZ + 0.22,
      0,
      1,
      0.52,
      0.3,
      K.signCell("ch_court", "PAMELA\nCOURT", 128, 72, {
        bg: "#2a3a2a",
        fg: "#e8dcb8",
        font: "Georgia, serif",
        border: "#c8b890",
      }),
    );
    // a bracket lamp over the arch: the only hint from 8th Street that anything is back there
    b.beam(
      "black_iron",
      GATE_X,
      3.75,
      SZ + 0.2,
      GATE_X,
      3.75,
      SZ + 0.75,
      0.035,
      0.035,
    );
    b.beam(
      "black_iron",
      GATE_X,
      3.5,
      SZ + 0.2,
      GATE_X,
      3.75,
      SZ + 0.5,
      0.02,
      0.02,
    );
    b.cyl("black_iron", GATE_X, 3.2, SZ + 0.75, 0.1, 0.12, 0.06, 6);
    b.cyl("lamp", GATE_X, 3.26, SZ + 0.75, 0.09, 0.12, 0.34, 6, {
      tint: [1, 0.78, 0.45],
    });
    b.cyl("black_iron", GATE_X, 3.6, SZ + 0.75, 0.15, 0.03, 0.16, 6);
    b.glow(GATE_X, 3.43, SZ + 0.8, [1, 0.7, 0.38], 1.4);
    // side walls closing the court
    b.boxMM("brick_brown", X0 - 0.3, 0, BZ1, X0, WH + 1.5, SZ, {
      tint: BRICK.map((v) => v * 0.8),
    });
    b.col(X0 - 0.3, 0, BZ1, X0, WH + 1.5, SZ, { tag: "wall", walkable: false });
    b.boxMM("brick_brown", X1, 0, BZ1, X1 + 0.3, WH, SZ, {
      tint: BRICK.map((v) => v * 0.8),
    });
    b.col(X1, 0, BZ1, X1 + 0.3, WH, SZ, { tag: "wall", walkable: false });
    // ailanthus ("the tree of heaven" — the only thing that grows in New York either way)
    K.deadTree(b, -65.8, 0, 388.6, 6.8, 71);
    b.cyl("granite", -65.8, 0, 388.6, 0.8, 0.8, 0.3, 10, {
      tint: [0.55, 0.53, 0.5],
    });
    // rain barrels, benches, a bicycle skeleton, the laundry line
    for (const [x, z] of [
      [-67.6, 386],
      [-67.6, 387.1],
    ]) {
      d.cyl("wood", x, 0, z, 0.42, 0.42, 1.0, 10, { tint: [0.5, 0.4, 0.3] });
      for (const y of [0.2, 0.8])
        d.cyl("rust", x, y, z, 0.44, 0.44, 0.05, 10, { top: false });
      b.col(x - 0.42, 0, z - 0.42, x + 0.42, 1.0, z + 0.42, { tag: "barrel" });
    }
    d.pipe("rust", -68.2, 3.0, 386, -67.6, 1.0, 386, 0.03, 4); // downspout into the barrel
    for (const [x, z] of [
      [-56, 390.4],
      [-60.5, 390.4],
    ]) {
      b.boxMM("wood", x - 0.9, 0.42, z - 0.25, x + 0.9, 0.48, z + 0.25, {
        tint: [0.45, 0.36, 0.26],
      });
      for (const s of [-1, 1])
        b.boxMM(
          "black_iron",
          x + s * 0.8 - 0.04,
          0,
          z - 0.25,
          x + s * 0.8 + 0.04,
          0.45,
          z + 0.25,
          {},
        );
      b.col(x - 0.9, 0, z - 0.25, x + 0.9, 0.48, z + 0.25, {
        tag: "bench",
        surface: "wood",
      });
    }
    d.geo("rust", new THREE.TorusGeometry(0.33, 0.025, 4, 14), {
      x: -53.2,
      y: 0.36,
      z: 386.5,
      ry: PI / 2.2,
    });
    d.geo("rust", new THREE.TorusGeometry(0.33, 0.025, 4, 14), {
      x: -53.2,
      y: 0.36,
      z: 387.6,
      ry: PI / 2.2,
    });
    d.pipe("rust", -53.2, 0.36, 386.5, -53.1, 0.8, 387.2, 0.02, 4);
    d.pipe("rust", -53.1, 0.8, 387.2, -53.2, 0.36, 387.6, 0.02, 4);
    b.pipe(
      "black_iron",
      X0 + 1.2,
      6.8,
      BZ1 + 0.05,
      X0 + 1.2,
      3.2,
      SZ - 0.3,
      0.008,
      3,
    );
    for (let k = 0; k < 5; k++) {
      const t = 0.15 + k * 0.17,
        z = BZ1 + (SZ - 0.3 - BZ1) * t,
        y = 6.8 - 3.6 * t - 0.05;
      d.quadN(
        "fabric",
        [X0 + 1.2, y, z - 0.3],
        [X0 + 1.2, y, z + 0.3],
        [X0 + 1.2, y - 0.7, z + 0.3],
        [X0 + 1.2, y - 0.7, z - 0.3],
        [1, 0, 0],
        {
          tint: [
            [0.7, 0.66, 0.55],
            [0.5, 0.25, 0.2],
            [0.4, 0.45, 0.55],
          ][k % 3],
        },
      );
    }
    // string lights zig-zagging over the court (dark bulbs by day; lit group when the grid is on)
    const strands = [
      [
        [-67.8, 7.0, 385.3],
        [-52.2, 3.2, 391.2],
      ],
      [
        [-52.2, 7.0, 385.3],
        [-67.8, 3.2, 391.2],
      ],
    ];
    for (const [A, B] of strands) {
      for (let k = 0; k <= 14; k++) {
        const t = k / 14,
          x = A[0] + (B[0] - A[0]) * t,
          z = A[2] + (B[2] - A[2]) * t,
          y = A[1] + (B[1] - A[1]) * t - Math.sin(t * PI) * 0.9;
        if (k < 14) {
          const t2 = (k + 1) / 14;
          d.pipe(
            "black_iron",
            x,
            y,
            z,
            A[0] + (B[0] - A[0]) * t2,
            A[1] + (B[1] - A[1]) * t2 - Math.sin(t2 * PI) * 0.9,
            A[2] + (B[2] - A[2]) * t2,
            0.006,
            3,
          );
        }
        if (k % 2 === 0) {
          d.geo("glass", K.sphereGeo(), {
            x,
            y: y - 0.08,
            z,
            s: 0.05,
            tint: [0.6, 0.55, 0.45],
          });
          lit.geo("lamp", K.sphereGeo(), {
            x,
            y: y - 0.08,
            z,
            s: 0.055,
            tint: [1, 0.78, 0.42],
          });
          lit.glow(x, y - 0.08, z, [1, 0.72, 0.35], 0.9);
        }
      }
    }
    // an oil lantern by the door that is always lit (the settlers keep it trimmed)
    b.beam(
      "black_iron",
      DOOR.x + 0.9,
      2.3,
      BZ1,
      DOOR.x + 0.9,
      2.3,
      BZ1 + 0.4,
      0.04,
      0.04,
    );
    b.cyl("glass", DOOR.x + 0.9, 1.9, BZ1 + 0.4, 0.1, 0.12, 0.3, 6, {
      tint: [0.95, 0.75, 0.4],
    });
    b.geo("lamp", K.sphereGeo(), {
      x: DOOR.x + 0.9,
      y: 2.02,
      z: BZ1 + 0.4,
      s: 0.05,
      tint: [1, 0.7, 0.35],
    });
    b.glow(DOOR.x + 0.9, 2.02, BZ1 + 0.4, [1, 0.62, 0.25], 1.8);
    // graffiti + posters on the street wall
    b.plate(
      "decal",
      -56.2,
      1.6,
      SZ + 0.21,
      0,
      1,
      3.4,
      1.1,
      K.tag("NO SIGN NO PROBLEM", "#e8e0c8", 384, 128),
    );
    b.plate(
      "art",
      -67,
      1.7,
      SZ + 0.21,
      0,
      1,
      0.8,
      1.1,
      K.signCell(
        "ch_poster",
        "POETRY\nNIGHT\nFRIDAYS\n(bring scrip)",
        160,
        220,
        {
          bg: "#d8ccb0",
          fg: "#6a1a10",
          font: "Georgia, serif",
          border: "#6a1a10",
        },
      ),
    );
    K.litter(d, X0, SZ + 0.3, X1, SZ + 1.2, 0.03, 10, 2201);
    K.litter(d, X0 + 0.3, BZ1 + 0.3, X1 - 0.3, SZ - 0.4, 0.03, 12, 2202);

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_bedfords_ext";
    const det = d.finish(ctx.extRoot);
    det.name = "poi_bedfords_detail";
    try {
      G.world.addLOD(det, 140);
    } catch (e) {
      /* optional */
    }
    ctx.litGroup = lit.finish(ctx.extRoot);
    ctx.litGroup.visible = false;

    K.anchor(ctx, "door", DOOR.x, 0, BZ1 + 1.2, false);
    K.anchor(ctx, "gate", GATE_X + 1.2, 0, SZ - 1.0, false);
    K.anchor(ctx, "bouncer", GATE_X + 1.6, 0, SZ + 0.95, false); // Ox stands on the sidewalk beside the arch, clear of the 1.6 m passage
    K.anchor(ctx, "court", -61, 0, 388.5, false);
    K.anchor(ctx, "door86", D86.x + 1.0, 0, D86.z, false);
    K.loot(ctx, "trash_can", -52.4, 0, 386.2, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "crate", -67.4, 0, 390.6, 0.2, {
      world: true,
      kind: "plain",
      loot: "junk_household",
      name: "Settler Crate",
      owner: "settlers",
    });
    K.loot(ctx, "campfire", -61.2, 0, 388.2, 0, { world: true, pot: true });
  }

