// play-inline-348 04 — czf
// Lines 1237-1423 of readable/play-inline-348.pretty.js (statement-aligned).
  function farProxy(ctx) {
    const b = K.builder({
      name: "sp_far",
      grime: 0.45,
      seg: 60,
      shadows: false,
    });
    const wall = (ax, az, ux, uz, len, y0, y1, mat, tint) =>
      b.face(mat, ax, y0, az, ux, 0, uz, 0, 1, 0, len, y1 - y0, {
        tint,
        seg: 60,
      });
    wall(CX0, CZ0, 0, 1, CZF - CZ0, 0, EAVE, "fieldstone", STONE);
    wall(CX1, CZF, 0, -1, CZF - CZ0, 0, EAVE, "fieldstone", STONE);
    wall(
      CX0 - 0.6,
      CZF + 0.9,
      1,
      0,
      CX1 - CX0 + 1.2,
      0,
      EAVE,
      "fieldstone",
      [0.8, 0.72, 0.62],
    );
    b.quadN(
      "fieldstone",
      [CX0 - 0.6, EAVE, CZF + 0.9],
      [CX1 + 0.6, EAVE, CZF + 0.9],
      [MID, RIDGE + 0.8, CZF + 0.9],
      [MID, RIDGE + 0.8, CZF + 0.9],
      [0, 0, 1],
      { tint: [0.8, 0.72, 0.62] },
    );
    b.quadN(
      "fieldstone",
      [CX0, EAVE, CZ0],
      [CX1, EAVE, CZ0],
      [MID, RIDGE, CZ0],
      [MID, RIDGE, CZ0],
      [0, 0, -1],
      { tint: STONE_D },
    );
    for (const x0 of [CX0 - 0.7, CX1 + 0.7])
      b.quadN(
        "slate",
        [x0, EAVE - 0.4, CZ0 - 0.3],
        [x0, EAVE - 0.4, CZF + 0.9],
        [MID, RIDGE, CZF + 0.9],
        [MID, RIDGE, CZ0 - 0.3],
        [x0 < MID ? -1 : 1, 1, 0],
        { tint: [0.8, 0.82, 0.85] },
      );
    b.quadN(
      "paint_black",
      [CX1 - 3.2, 16.45, 467],
      [CX1 - 3.2, 16.45, 471.5],
      [MID + 2.4, 19.25, 471.5],
      [MID + 2.4, 19.25, 467],
      [1, 1, 0],
      { tint: [0.03, 0.03, 0.03], grime: 0 },
    );
    const AR = 5.6;
    b.cyl("fieldstone", MID, 0, CZ0, AR, AR, EAVE - 1.5, 4, {
      arc0: PI,
      arc: PI,
      tint: STONE,
      rows: 1,
      top: false,
    });
    b.cyl(
      "slate",
      MID,
      EAVE - 1.8,
      CZ0,
      AR + 0.5,
      0.05,
      RIDGE - 2.5 - (EAVE - 1.8),
      4,
      { arc0: PI, arc: PI, tint: [0.8, 0.82, 0.85], rows: 1, top: false },
    );
    // lancets (dark slots) + buttresses
    const BAYS = 5,
      bayL = (CZF - 1.2 - CZ0) / BAYS;
    for (const [x, n] of [
      [CX0, -1],
      [CX1, 1],
    ]) {
      for (let i = 0; i < BAYS; i++) {
        const z = CZ0 + (i + 0.5) * bayL;
        b.face(
          "paint_black",
          x + n * 0.03,
          3.2,
          z + n * 0.9,
          0,
          0,
          -n,
          0,
          1,
          0,
          1.8,
          7.6,
          { tint: [0.12, 0.1, 0.1] },
        );
      }
      for (let i = 0; i <= BAYS; i++) {
        const z = CZ0 + i * bayL;
        b.boxMM(
          "fieldstone",
          n < 0 ? x - 1.2 : x,
          0,
          z - 0.45,
          n < 0 ? x : x + 1.2,
          EAVE - 2.4,
          z + 0.45,
          { tint: STONE_D, faces: "nsewt" },
        );
      }
    }
    b.face(
      "paint_black",
      MID - 2.1,
      0,
      CZF + 0.93,
      1,
      0,
      0,
      0,
      1,
      0,
      4.2,
      8.4,
      { tint: [0.08, 0.07, 0.06] },
    );
    b.face(
      "paint_black",
      MID - 1.4,
      9.4,
      CZF + 0.93,
      1,
      0,
      0,
      0,
      1,
      0,
      2.8,
      5.6,
      { tint: [0.14, 0.1, 0.1] },
    );
    b.boxMM(
      "fieldstone",
      MID - 1.3,
      RIDGE - 1.6,
      CZF - 1.5,
      MID + 1.3,
      RIDGE + 2.3,
      CZF - 0.5,
      { tint: STONE_D, faces: "nsewt" },
    );
    // churchyard wall
    const WH = 3.8,
      BRICK = [0.72, 0.58, 0.5];
    for (const [x0, z0, x1, z1] of [
      [SX0 - 0.25, SZ0 - 0.25, SX1 + 0.25, SZ0 + 0.25],
      [SX0 - 0.25, SZ0, SX0 + 0.25, SZ1],
      [SX1 - 0.25, SZ0, SX1 + 0.25, SZ1],
      [SX0 - 0.25, SZ1 - 0.25, CX0 - 1.4, SZ1 + 0.25],
      [CX1 + 1.4, SZ1 - 0.25, SX1 + 0.25, SZ1 + 0.25],
    ])
      b.boxMM("brick_red", x0, 0, z0, x1, WH, z1, {
        tint: BRICK,
        faces: "nsewt",
      });
    return b.finish(null);
  }

  PC.define({
    id: "old_st_patricks",
    name: "Old St. Patrick's Cathedral",
    interior: "old_st_patricks",
    order: 30,
    lod: 900,
    detail: 220,
    lift: 5,
  }); // lift: catacombs (y −5) must stay ≥ 0
  PC.part("old_st_patricks", { ext: exterior, far: farProxy });
