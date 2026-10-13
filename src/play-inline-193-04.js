// play-inline-193 04 — tint
// Lines 498-716 of readable/play-inline-193.pretty.js (statement-aligned).
  function katzRoof(b, r) {
    const Y = H2,
      brick = [0.72, 0.56, 0.47];
    // parapet + coping (front, east, back; the west end is the broken one)
    for (const [x0, z0, x1, z1] of [
      [X0 + 7, Z1 - 0.35, X1, Z1],
      [X1 - 0.35, Z0, X1, Z1],
      [X0 + 7, Z0, X1, Z0 + 0.35],
    ]) {
      b.boxMM("brick_brown", x0, Y, z0, x1, Y + 0.9, z1, { tint: brick });
      b.boxMM(
        "limestone",
        x0 - 0.05,
        Y + 0.9,
        z0 - 0.05,
        x1 + 0.05,
        Y + 1.0,
        z1 + 0.05,
        { tint: [0.6, 0.58, 0.54] },
      );
    }
    // tar patches & puddles
    for (let k = 0; k < 9; k++)
      b.hplate(
        "decal",
        X0 + 10 + r() * 46,
        Y + 0.02 + k * 0.001,
        Z0 + 3 + r() * 25,
        3 + r() * 4,
        2 + r() * 3,
        r() * 3,
        K.decal(k % 3 ? "grime" : "puddle", k % 4),
      );
    // skylights over the dining hall
    for (let k = 0; k < 4; k++) {
      const sx = X0 + 22 + k * 8,
        sz = Z1 - 9;
      b.boxMM("metal", sx - 1.6, Y, sz - 1.1, sx + 1.6, Y + 0.45, sz + 1.1, {
        tint: [0.4, 0.38, 0.35],
      });
      b.quadN(
        "glass_dark",
        [sx - 1.5, Y + 0.45, sz + 1.0],
        [sx + 1.5, Y + 0.45, sz + 1.0],
        [sx + 1.5, Y + 1.2, sz],
        [sx - 1.5, Y + 1.2, sz],
        [0, 0.8, 0.6],
        { tint: k === 2 ? [0.1, 0.1, 0.1] : [0.35, 0.4, 0.4] },
      );
      b.quadN(
        "glass_dark",
        [sx + 1.5, Y + 0.45, sz - 1.0],
        [sx - 1.5, Y + 0.45, sz - 1.0],
        [sx - 1.5, Y + 1.2, sz],
        [sx + 1.5, Y + 1.2, sz],
        [0, 0.8, -0.6],
        { tint: [0.3, 0.35, 0.35] },
      );
    }
    // kitchen extract hoods + ducts (over the back / kitchen)
    for (const [hx, hz] of [
      [X1 - 12, Z0 + 6],
      [X1 - 22, Z0 + 5],
    ]) {
      b.boxMM("metal", hx - 1.4, Y, hz - 1.4, hx + 1.4, Y + 1.6, hz + 1.4, {
        tint: [0.55, 0.55, 0.52],
      });
      b.cyl("metal", hx, Y + 1.6, hz, 0.7, 0.7, 1.4, 10, {
        tint: [0.5, 0.5, 0.48],
      });
      b.cyl("rust", hx, Y + 3.0, hz, 1.0, 0.2, 0.5, 10, {
        tint: [0.55, 0.45, 0.38],
      });
      b.col(hx - 1.4, Y, hz - 1.4, hx + 1.4, Y + 3.0, hz + 1.4, {
        tag: "roof_kit",
        walkable: false,
      });
    }
    b.pipe(
      "metal",
      X1 - 22,
      Y + 1.0,
      Z0 + 5,
      X1 - 12,
      Y + 1.0,
      Z0 + 6,
      0.35,
      8,
      { tint: [0.5, 0.5, 0.48] },
    );
    // HVAC boxes
    for (const [ax, az, w, d] of [
      [X0 + 30, Z0 + 5, 3.2, 2.2],
      [X0 + 38, Z0 + 5.5, 2.4, 2.0],
    ]) {
      b.boxMM(
        "metal_dark",
        ax - w / 2,
        Y,
        az - d / 2,
        ax + w / 2,
        Y + 1.5,
        az + d / 2,
        { tint: [0.6, 0.62, 0.6] },
      );
      b.cyl("black_iron", ax, Y + 1.5, az, 0.6, 0.6, 0.08, 12, { top: true });
      b.col(ax - w / 2, Y, az - d / 2, ax + w / 2, Y + 1.5, az + d / 2, {
        tag: "roof_kit",
        walkable: false,
      });
    }
    // stair bulkhead
    b.boxMM("brick_brown", X1 - 8, Y, Z0 + 12, X1 - 4, Y + 2.8, Z0 + 16, {
      tint: brick,
    });
    b.boxMM(
      "metal",
      X1 - 8.2,
      Y + 2.8,
      Z0 + 11.8,
      X1 - 3.8,
      Y + 3.0,
      Z0 + 16.2,
      { tint: [0.35, 0.33, 0.3] },
    );
    b.plate("wood_dark", X1 - 6, Y + 1.1, Z0 + 16.02, 0, 1, 1.0, 2.1, null, {
      tint: [0.4, 0.2, 0.15],
    });
    b.col(X1 - 8, Y, Z0 + 12, X1 - 4, Y + 3.0, Z0 + 16, { tag: "roof_kit" });
    // water tank on a steel stand (the NYC signature)
    {
      const wx = X1 - 16,
        wz = Z0 + 20,
        top = Y + 3.6;
      for (const [ox, oz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ])
        b.beam(
          "rust",
          wx + ox,
          Y,
          wz + oz,
          wx + ox * 0.85,
          top,
          wz + oz * 0.85,
          0.18,
          0.18,
        );
      for (const d of [-1, 1])
        b.beam(
          "rust",
          wx - 1.2,
          Y + 0.6,
          wz + d * 1.2,
          wx + 1.2,
          top - 0.4,
          wz + d * 1.2,
          0.06,
          0.06,
        );
      b.boxMM(
        "rust",
        wx - 1.5,
        top,
        wz - 1.5,
        wx + 1.5,
        top + 0.2,
        wz + 1.5,
        {},
      );
      b.cyl("wood_rotten", wx, top + 0.2, wz, 1.7, 1.7, 3.6, 14, {
        tint: [0.55, 0.45, 0.36],
      });
      for (let k = 0; k < 4; k++)
        b.cyl("rust", wx, top + 0.5 + k * 0.85, wz, 1.73, 1.73, 0.07, 14, {
          top: false,
        });
      b.cyl("wood_rotten", wx, top + 3.8, wz, 1.8, 0.15, 1.3, 14, {
        tint: [0.4, 0.35, 0.3],
      });
      b.col(wx - 1.7, Y, wz - 1.7, wx + 1.7, top + 3.8, wz + 1.7, {
        tag: "roof_kit",
        walkable: false,
      });
    }
    // vent stacks & an old antenna
    for (let k = 0; k < 6; k++)
      b.cyl(
        "rust",
        X0 + 12 + k * 7.5,
        Y,
        Z0 + 1.5 + (k % 2) * 1.2,
        0.12,
        0.12,
        0.9 + r() * 0.6,
        6,
        { tint: [0.5, 0.42, 0.36] },
      );
    b.pipe("black_iron", X1 - 3, Y, Z1 - 3, X1 - 3, Y + 6.5, Z1 - 3, 0.04, 4);
    for (let k = 0; k < 3; k++)
      b.pipe(
        "black_iron",
        X1 - 3.9 + k * 0.1,
        Y + 4.5 + k * 0.8,
        Z1 - 3,
        X1 - 2.1 - k * 0.1,
        Y + 4.5 + k * 0.8,
        Z1 - 3,
        0.015,
        3,
      );
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
