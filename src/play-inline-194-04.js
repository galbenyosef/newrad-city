// play-inline-194 04 — blk
// Lines 652-804 of readable/play-inline-194.pretty.js (statement-aligned).
  function rooftop(b, r, blk, side, H) {
    const w = blk.x1 - blk.x0,
      d = blk.z1 - blk.z0;
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        blk.x0 + 2 + r() * (w - 4),
        H + 0.02 + k * 0.001,
        blk.z0 + 10 + r() * (d - 13),
        2.5 + r() * 3,
        2 + r() * 2,
        r() * 3,
        K.decal(k % 2 ? "grime" : "puddle", k % 4),
      );
    // water tank (rear outer corner)
    const wx = side > 0 ? blk.x0 + 4 : blk.x1 - 4,
      wz = blk.z1 - 5,
      top = H + 3.2;
    for (const [ox, oz] of [
      [-1.2, -1.2],
      [1.2, -1.2],
      [-1.2, 1.2],
      [1.2, 1.2],
    ])
      b.beam(
        "rust",
        wx + ox,
        H,
        wz + oz,
        wx + ox * 0.85,
        top,
        wz + oz * 0.85,
        0.16,
        0.16,
      );
    b.boxMM(
      "rust",
      wx - 1.4,
      top,
      wz - 1.4,
      wx + 1.4,
      top + 0.18,
      wz + 1.4,
      {},
    );
    b.cyl("wood_rotten", wx, top + 0.18, wz, 1.55, 1.55, 3.2, 14, {
      tint: [0.55, 0.45, 0.36],
    });
    for (let k = 0; k < 3; k++)
      b.cyl("rust", wx, top + 0.5 + k * 0.95, wz, 1.58, 1.58, 0.07, 14, {
        top: false,
      });
    b.cyl("wood_rotten", wx, top + 3.38, wz, 1.65, 0.14, 1.1, 14, {
      tint: [0.4, 0.35, 0.3],
    });
    b.col(wx - 1.5, H, wz - 1.5, wx + 1.5, top + 3.4, wz + 1.5, {
      tag: "roof_kit",
      walkable: false,
    });
    // stair bulkhead
    const bx = (blk.x0 + blk.x1) / 2 + side * 2,
      bz = blk.z0 + d * 0.55;
    b.boxMM("brick_tan", bx - 1.8, H, bz - 1.5, bx + 1.8, H + 2.7, bz + 1.5, {
      tint: [0.7, 0.6, 0.5],
    });
    b.boxMM(
      "metal",
      bx - 2.0,
      H + 2.7,
      bz - 1.7,
      bx + 2.0,
      H + 2.85,
      bz + 1.7,
      { tint: [0.35, 0.33, 0.3] },
    );
    b.plate("wood_dark", bx, H + 1.05, bz - 1.52, 0, -1, 0.95, 2.05, null, {
      tint: [0.45, 0.14, 0.1],
    });
    b.col(bx - 1.8, H, bz - 1.5, bx + 1.8, H + 2.85, bz + 1.5, {
      tag: "roof_kit",
    });
    // vent stacks & laundry
    for (let k = 0; k < 4; k++)
      b.cyl(
        "rust",
        blk.x0 + 3 + r() * (w - 6),
        H,
        blk.z0 + 12 + r() * (d - 16),
        0.14,
        0.14,
        1.0 + r() * 0.8,
        6,
        { tint: [0.5, 0.42, 0.36] },
      );
    const lx0 = blk.x0 + 2,
      lx1 = blk.x1 - 2,
      lz = blk.z1 - 11;
    for (const x of [lx0, lx1])
      b.beam("wood_rotten", x, H, lz, x, H + 2.0, lz, 0.08, 0.08);
    b.pipe("black_iron", lx0, H + 1.95, lz, lx1, H + 1.95, lz, 0.008, 3);
    for (let k = 0; k < 7; k++) {
      const x = lx0 + 1 + (k * (lx1 - lx0 - 2)) / 6;
      b.box("fabric", x, H + 1.35, lz, 0.7, 0.6, 0.02, {
        tint: r.pick([
          [0.8, 0.3, 0.25],
          [0.3, 0.4, 0.6],
          [0.85, 0.82, 0.72],
          [0.55, 0.65, 0.35],
          [0.9, 0.75, 0.3],
        ]),
      });
    }
    // pigeon coop (west block) / satellite-ish antenna (east block)
    if (side > 0) {
      const cx = blk.x0 + 6,
        cz = blk.z0 + 16;
      b.boxMM("wood_rotten", cx - 1.5, H, cz - 1, cx + 1.5, H + 1.6, cz + 1, {
        tint: [0.6, 0.5, 0.4],
      });
      b.quadN(
        "corrugated",
        [cx - 1.7, H + 1.9, cz - 1.2],
        [cx + 1.7, H + 1.9, cz - 1.2],
        [cx + 1.7, H + 1.5, cz + 1.2],
        [cx - 1.7, H + 1.5, cz + 1.2],
        [0, 1, 0.2],
        { tint: [0.55, 0.5, 0.45] },
      );
      b.col(cx - 1.5, H, cz - 1, cx + 1.5, H + 1.9, cz + 1, {
        tag: "roof_kit",
      });
    } else {
      const ax = blk.x1 - 5,
        az = blk.z0 + 14;
      b.pipe("black_iron", ax, H, az, ax, H + 7, az, 0.05, 4);
      for (let k = 0; k < 4; k++)
        b.pipe(
          "black_iron",
          ax - 1.2 + k * 0.15,
          H + 4 + k * 0.9,
          az,
          ax + 1.2 - k * 0.15,
          H + 4 + k * 0.9,
          az,
          0.02,
          3,
        );
      b.cyl("metal", ax + 0.6, H + 2.5, az, 0.05, 0.6, 0.35, 10, {
        tint: [0.6, 0.6, 0.58],
      });
    }
  }

