// play-inline-449 08 — color
// Lines 2160-2499 of readable/play-inline-449.pretty.js (statement-aligned).
  D("market_stall", (k, r, v) => {
    const W = 2.6,
      Dp = 1.4,
      H = 2.4;
    const wood = { color: 0x7a6040 };
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "wood",
          0.1,
          H + (sz > 0 ? 0.2 : 0),
          0.1,
          (sx * W) / 2,
          0,
          (sz * Dp) / 2,
          wood,
        );
    // counter
    k.boxB("wood", W, 0.9, 0.5, 0, 0, -Dp / 2 + 0.25, { color: 0x8a6a48 });
    k.boxB("wood", W + 0.1, 0.05, 0.6, 0, 0.9, -Dp / 2 + 0.25, {
      color: 0x9a7a58,
    });
    // striped awning (alternating colours via colorFn)
    const cols = [
      [0xc84a3a, 0xe8e0d0],
      [0x3a6a8a, 0xe8e0d0],
      [0x5a7a3a, 0xd8c8a0],
      [0xb88a2a, 0x3a3a3a],
    ][v % 4];
    k.box("fabric", W + 0.4, 0.04, Dp + 0.5, 0, H + 0.1, -0.1, {
      rx: 0.18,
      segs: [12, 1, 1],
      colorFn: (x) => (Math.floor((x + 5) * 2.2) % 2 ? cols[0] : cols[1]),
    });
    for (let i = 0; i < 9; i++)
      k.box(
        "fabric",
        (W + 0.4) / 9 - 0.02,
        0.18,
        0.02,
        -W / 2 - 0.2 + ((i + 0.5) * (W + 0.4)) / 9,
        H - 0.09,
        -Dp / 2 - 0.34,
        { color: i % 2 ? cols[0] : cols[1] },
      );
    // shop sign
    k.quad(
      "stall_" + (v % X.STALL_SIGNS),
      1.8,
      0.45,
      0,
      H - 0.45,
      -Dp / 2 - 0.3,
      { ry: PI },
    );
    // goods on the counter
    for (let i = 0; i < 8; i++) {
      const x = -W / 2 + 0.25 + i * 0.3,
        t = r();
      if (t < 0.35)
        k.cyl("metal", 0.04, 0.04, 0.12, x, 1.0, -Dp / 2 + 0.2, {
          seg: 8,
          color: [0xb02020, 0x8a8a80, 0xc8a030][(r() * 3) | 0],
          rust: 0.4,
        });
      else if (t < 0.6)
        k.lathe(
          "glass",
          [
            [0, 0],
            [0.035, 0],
            [0.04, 0.12],
            [0.015, 0.2],
            [0, 0.2],
          ],
          x,
          0.95,
          -Dp / 2 + 0.25,
          { seg: 6, color: v === 1 ? 0x6a9ab0 : 0x5a1a10 },
        );
      else if (t < 0.8)
        k.boxB("plain", 0.2, 0.14, 0.14, x, 0.95, -Dp / 2 + 0.25, {
          color: [0xd8c040, 0x2a70c0, 0xc05030][(r() * 3) | 0],
        });
      else
        k.box("rust", 0.25, 0.05, 0.15, x, 0.97, -Dp / 2 + 0.25, {
          ry: r(),
          color: 0xffffff,
        });
    }
    // back shelf with crates & hanging goods
    X.crate(k, r, (r() * 5) | 0, -0.7, 0, Dp / 2 - 0.3, 0.1, 0.8);
    X.crate(k, r, (r() * 5) | 0, 0.4, 0, Dp / 2 - 0.3, -0.1, 0.8);
    k.seg(
      "wood",
      [-W / 2, H - 0.3, Dp / 2 - 0.05],
      [W / 2, H - 0.3, Dp / 2 - 0.05],
      0.02,
      wood,
    );
    for (let i = 0; i < 4; i++)
      k.sphere("plain", 0.08, -0.9 + i * 0.6, H - 0.55, Dp / 2 - 0.05, {
        s: [0.7, 1.6, 0.7],
        color: 0x6a3a1a,
        wseg: 6,
        hseg: 4,
      });
    k.meta.glows = [
      { x: 0, y: H - 0.2, z: -0.2, color: 0xffc070, size: 3.5, flicker: 0.15 },
    ];
    k.sphere("glow", 0.05, 0, H - 0.2, -0.2, {
      color: C.bulbWarm,
      wseg: 6,
      hseg: 4,
    });
    k.meta.colliders = [
      { w: W, d: 0.55, h: 0.95, cz: -Dp / 2 + 0.25 },
      { w: 0.15, d: 0.15, h: H, cx: -W / 2, cz: Dp / 2 },
      { w: 0.15, d: 0.15, h: H, cx: W / 2, cz: Dp / 2 },
    ];
    k.meta.interactY = 1.0;
    k.meta.tier = "medium";
  });

  // ---------------- teddy bear ----------------
  D("teddy_bear", (k, r, v) => {
    const fur = {
      color: [0x8a6a4a, 0xa88a5a, 0x6a5a4a][v % 3],
      grime: 0.35,
      wseg: 8,
      hseg: 6,
    };
    k.sphere(
      "fabric",
      0.12,
      0,
      0.14,
      0,
      Object.assign({ s: [1, 1.15, 0.85] }, fur),
    );
    k.sphere("fabric", 0.09, 0, 0.33, -0.01, fur);
    for (const s of [-1, 1]) {
      k.sphere("fabric", 0.035, s * 0.07, 0.41, 0, fur);
      k.sphere(
        "fabric",
        0.045,
        s * 0.12,
        0.2,
        -0.04,
        Object.assign({ s: [1, 1.5, 1] }, fur),
      );
      k.sphere(
        "fabric",
        0.05,
        s * 0.07,
        0.05,
        -0.07,
        Object.assign({ s: [1, 0.8, 1.4] }, fur),
      );
      k.sphere("plain", 0.012, s * 0.03, 0.35, -0.085, {
        color: 0x111111,
        wseg: 4,
        hseg: 3,
      });
    }
    k.sphere("fabric", 0.035, 0, 0.31, -0.085, {
      color: 0xc8b090,
      wseg: 6,
      hseg: 4,
    });
    k.meta.interactY = 0.2;
    k.meta.tier = "small";
  });

  // ---------------- World's Fair medallion ----------------
  // One of the twenty bronze medallions struck for the 1964 New York World's Fair, standing in a little
  // walnut easel stand. The relief changes with the variant: 0 the globe with its meridian ring,
  // 1 the observation towers, 2 the monorail, 3 the fountain sunburst (v = medallion index 0-19).
  D("medallion", (k, r, v) => {
    const bronze = { color: 0xb07a3a, rust: 0.15, grime: 0.2 };
    const relief = { color: 0xd8a860, rust: 0.1, grime: 0.1 };
    k.cbox("wood", 0.14, 0.025, 0.09, 0, 0.0125, 0.01, {
      bevel: 0.006,
      color: 0x5a3a24,
    });
    k.box("wood", 0.03, 0.12, 0.012, 0, 0.07, 0.035, {
      rx: 0.25,
      color: 0x4a3020,
    });
    k.box("metal", 0.1, 0.01, 0.012, 0, 0.03, -0.015, { color: 0x8a6a3a });
    const M = new X.Kit(91);
    M.cyl(
      "metal",
      0.055,
      0.055,
      0.008,
      0,
      0,
      0,
      Object.assign({ rx: PI / 2, seg: 20 }, bronze),
    );
    M.torus(
      "metal",
      0.051,
      0.004,
      0,
      0,
      -0.004,
      Object.assign({ rseg: 4, tseg: 20 }, relief),
    );
    const m = v % 4;
    if (m === 0) {
      M.sphere(
        "metal",
        0.025,
        0,
        0.004,
        -0.004,
        Object.assign({ wseg: 10, hseg: 6, s: [1, 1, 0.3] }, relief),
      );
      M.torus(
        "metal",
        0.033,
        0.002,
        0,
        0.004,
        -0.006,
        Object.assign({ s: [0.45, 1, 1], rseg: 3, tseg: 16 }, relief),
      );
      M.box("metal", 0.07, 0.003, 0.003, 0, 0.004, -0.007, relief);
      M.box("metal", 0.006, 0.02, 0.004, 0, -0.03, -0.005, relief);
    } else if (m === 1) {
      for (const s of [-1, 1])
        M.box("metal", 0.006, 0.07, 0.004, s * 0.012, -0.005, -0.006, relief);
      M.cyl(
        "metal",
        0.022,
        0.022,
        0.004,
        0,
        0.022,
        -0.007,
        Object.assign({ rx: PI / 2, seg: 12, s: [1, 0.4, 1] }, relief),
      );
      M.cyl(
        "metal",
        0.014,
        0.014,
        0.004,
        0.02,
        0.004,
        -0.007,
        Object.assign({ rx: PI / 2, seg: 10, s: [1, 0.4, 1] }, relief),
      );
    } else if (m === 2) {
      M.box("metal", 0.08, 0.005, 0.004, 0, 0.012, -0.006, relief);
      M.cbox(
        "metal",
        0.05,
        0.016,
        0.004,
        0.005,
        0.0,
        -0.007,
        Object.assign({ bevel: 0.006 }, relief),
      );
      for (const x of [-0.025, 0.025])
        M.box("metal", 0.004, 0.035, 0.004, x, -0.025, -0.006, relief);
    } else {
      for (let i = 0; i < 12; i++) {
        const a = (i * X.TAU) / 12;
        M.box(
          "metal",
          0.003,
          0.018,
          0.004,
          Math.cos(a) * 0.026,
          Math.sin(a) * 0.026,
          -0.006,
          Object.assign({ rz: a - PI / 2 }, relief),
        );
      }
      M.cyl(
        "metal",
        0.012,
        0.012,
        0.004,
        0,
        0,
        -0.007,
        Object.assign({ rx: PI / 2, seg: 10 }, relief),
      );
    }
    k.include(M, { y: 0.085, z: 0.0, rx: 0.25 });
    k.meta.glows = [
      { x: 0, y: 0.09, z: -0.03, color: 0xffd090, size: 0.5, flicker: 0 },
    ];
    k.meta.interactY = 0.08;
    k.meta.tier = "small";
  });

  // ---------------- Fizzo bottles ----------------
  // Tall, straight-sided ribbed bottle with a long neck, a paper label band and a crown cap.
  function fizzoProfile() {
    const pts = [
      [0, 0],
      [0.03, 0],
      [0.033, 0.006],
    ];
    for (let i = 0; i < 11; i++)
      pts.push([i % 2 ? 0.0315 : 0.034, 0.012 + i * 0.012]);
    pts.push(
      [0.033, 0.16],
      [0.026, 0.18],
      [0.013, 0.205],
      [0.011, 0.255],
      [0.0135, 0.258],
      [0, 0.26],
    );
    return pts;
  }
  // Fizzo Blue: the electric-blue bottle that glows
  D("fizzo_blue", (k, r, v) => {
    k.lathe("glow", fizzoProfile(), 0, 0, 0, { seg: 10, color: 0x40c8ff });
    k.cyl("plain", 0.0345, 0.0345, 0.035, 0, 0.17, 0, {
      seg: 10,
      color: 0xe8f0ff,
      open: true,
    });
    k.cyl("metal", 0.014, 0.014, 0.01, 0, 0.264, 0, {
      seg: 8,
      color: 0xc8c8c0,
    });
    k.meta.glows = [
      { x: 0, y: 0.12, z: 0, color: 0x40d0ff, size: 1.1, flicker: 0 },
    ];
    k.meta.interactY = 0.12;
    k.meta.tier = "small";
  });
  // a plain Fizzo Cola bottle (decor / pickups)
