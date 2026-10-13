// play-inline-434 04 — yaw
// Lines 2229-2302 of readable/play-inline-434.pretty.js (statement-aligned).
  function park_bench(d, b, x, z, yaw) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    d.box("wood", x, 0.42, z, 1.8, 0.05, 0.45, {
      yaw,
      tint: [0.45, 0.36, 0.26],
    });
    d.box("wood", x + 0.22 * s, 0.5, z + 0.22 * c, 1.8, 0.45, 0.05, {
      yaw,
      tint: [0.45, 0.36, 0.26],
    });
    for (const e of [-1, 1])
      d.box(
        "black_iron",
        x + e * 0.8 * c,
        0,
        z - e * 0.8 * s,
        0.06,
        0.45,
        0.5,
        { yaw, tint: [0.18, 0.17, 0.16] },
      );
    b.ocol(x, z, 1.8, 0.5, 0, 0.48, yaw, { tag: "bench", surface: "wood" });
  }

  function palm(d, b, x, z, h, r) {
    // leaning dead palm: segmented trunk + drooping brown fronds
    let px = x,
      py = 0.05,
      pz = z;
    for (let k = 0; k < 8; k++) {
      const qx = px + 0.1 + k * 0.02,
        qy = py + h / 8,
        qz = pz - 0.05;
      d.pipe("wood_rotten", px, py, pz, qx, qy, qz, 0.2 - k * 0.012, 7, {
        tint: [0.42, 0.36, 0.28],
      });
      px = qx;
      py = qy;
      pz = qz;
    }
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * PI * 2 + r() * 0.3,
        len = 1.8 + r() * 1.0;
      const ex = px + Math.cos(a) * len,
        ez = pz - Math.sin(a) * len,
        ey = py - 0.6 - r() * 1.6;
      d.quadN(
        "wood_rotten",
        [px, py, pz],
        [px + Math.cos(a + 0.2) * 0.3, py, pz - Math.sin(a + 0.2) * 0.3],
        [ex, ey, ez],
        [ex, ey, ez],
        [0, 1, 0],
        { tint: [0.46, 0.36, 0.22] },
      );
      d.pipe("wood_rotten", px, py, pz, ex, ey, ez, 0.02, 3, {
        tint: [0.4, 0.32, 0.2],
      });
    }
    b.col(x - 0.25, 0, z - 0.25, x + 0.25, h * 0.6, z + 0.25, {
      tag: "tree",
      walkable: false,
      surface: "wood",
    });
  }

  PK.EXT.zoo = exterior;
  PK.ZOO = {
    door: { x: DOORX, y: STOOP, z: PZ },
    keeper: KEEPER,
    pool: POOL,
    clock: CLK,
  };
