// play-inline-449 04 — color
// Lines 897-1244 of readable/play-inline-449.pretty.js (statement-aligned).
  D("toolbox", (k, r, v) => {
    if (v === 1) {
      // rolling tool chest
      const o = { color: 0xa01a14, rust: 0.3 };
      k.cbox(
        "metal",
        0.75,
        0.9,
        0.48,
        0,
        0.55,
        0,
        Object.assign({ bevel: 0.03 }, o),
      );
      for (let i = 0; i < 5; i++) {
        k.box("metal", 0.7, 0.14, 0.02, 0, 0.9 - i * 0.16, -0.245, {
          color: 0x8a1410,
        });
        k.box("metal", 0.4, 0.02, 0.03, 0, 0.94 - i * 0.16, -0.26, {
          color: C.chrome,
        });
      }
      for (const sx of [-0.3, 0.3])
        for (const sz of [-0.18, 0.18])
          k.cyl("plain", 0.05, 0.05, 0.04, sx, 0.05, sz, {
            rx: PI / 2,
            seg: 8,
            color: 0x1a1a1a,
          });
      k.meta.collider = { w: 0.75, d: 0.5, h: 1.0 };
      k.meta.interactY = 0.9;
    } else {
      const o = { color: 0xa81a14, rust: 0.4 };
      k.cbox(
        "metal",
        0.55,
        0.22,
        0.24,
        0,
        0.11,
        0,
        Object.assign({ bevel: 0.02 }, o),
      );
      k.cbox(
        "metal",
        0.56,
        0.06,
        0.25,
        0,
        0.25,
        0,
        Object.assign({ bevel: 0.015 }, o),
      );
      k.seg("metal", [-0.12, 0.28, 0], [-0.12, 0.34, 0], 0.01, {
        color: 0x3a3a34,
      });
      k.seg("metal", [0.12, 0.28, 0], [0.12, 0.34, 0], 0.01, {
        color: 0x3a3a34,
      });
      k.seg("metal", [-0.12, 0.34, 0], [0.12, 0.34, 0], 0.012, {
        color: 0x3a3a34,
      });
      k.meta.interactY = 0.25;
    }
    k.meta.container = { name: "Toolbox", loot: "toolbox" };
    k.meta.tier = "small";
  });

  // ---------------- beds ----------------
  D("bed", (k, r, v) => {
    const iron = { color: 0x5a5a52, rust: 0.45 };
    const W = v === 1 ? 1.4 : 0.95,
      L = 2.0;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.seg(
          "metal",
          [(sx * W) / 2, 0, (sz * L) / 2],
          [(sx * W) / 2, sz < 0 ? 0.95 : 0.65, (sz * L) / 2],
          0.022,
          iron,
        );
    for (const sz of [-1, 1]) {
      k.seg(
        "metal",
        [-W / 2, 0.35, (sz * L) / 2],
        [W / 2, 0.35, (sz * L) / 2],
        0.02,
        iron,
      );
      k.seg(
        "metal",
        [-W / 2, sz < 0 ? 0.92 : 0.62, (sz * L) / 2],
        [W / 2, sz < 0 ? 0.92 : 0.62, (sz * L) / 2],
        0.02,
        iron,
      );
    }
    for (let i = 0; i < 5; i++) {
      const x = -W / 2 + ((i + 0.5) * W) / 5;
      k.seg("metal", [x, 0.35, -L / 2], [x, 0.9, -L / 2], 0.012, iron);
    }
    for (const sx of [-1, 1])
      k.seg(
        "metal",
        [(sx * W) / 2, 0.35, -L / 2],
        [(sx * W) / 2, 0.35, L / 2],
        0.02,
        iron,
      );
    k.cbox("fabric", W - 0.05, 0.16, L - 0.08, 0, 0.45, 0, {
      bevel: 0.05,
      color: 0xb8ac90,
      grime: 0.45,
      colorFn: (x, y, z) =>
        X.noise3(x * 3 + 1, 0, z * 2) > 0.66 ? 0x8a7050 : 0xb8ac90,
    });
    k.cbox("fabric", W * 0.6, 0.1, 0.35, 0, 0.58, -L / 2 + 0.3, {
      bevel: 0.04,
      color: 0xd8d0c0,
    });
    if (r() < 0.7)
      k.cbox("fabric", W - 0.02, 0.05, L * 0.55, 0, 0.55, L * 0.15, {
        bevel: 0.02,
        color: [0x5a6a8a, 0x8a5a4a, 0x6a7a5a][(r() * 3) | 0],
        rx: 0.02,
      });
    k.meta.collider = { w: W, d: L, h: 0.55 };
    k.meta.interactY = 0.6;
    k.meta.surface = "fabric";
    k.meta.tier = "small";
  });

  // ---------------- workbench ----------------
  D("workbench", (k, r, v) => {
    const wood = { color: 0x9a7a58 };
    k.boxB("wood", 2.0, 0.08, 0.8, 0, 0.86, 0, wood);
    for (const sx of [-0.92, 0.92])
      for (const sz of [-0.34, 0.34])
        k.boxB("wood", 0.09, 0.86, 0.09, sx, 0, sz, { color: 0x7a6040 });
    k.boxB("wood", 1.9, 0.04, 0.7, 0, 0.25, 0, { color: 0x7a6040 });
    // pegboard with tools
    k.boxB("wood", 2.0, 1.1, 0.04, 0, 0.94, 0.38, { color: 0xb09870 });
    for (let i = 0; i < 6; i++) {
      const x = -0.8 + i * 0.32;
      k.box("metal", 0.04, 0.25 + r() * 0.15, 0.02, x, 1.5, 0.35, {
        color: [0x8a8a84, 0xa01a14, 0x5a5a52][i % 3],
        rz: (r() - 0.5) * 0.3,
      });
    }
    // vise, scrap, can of parts
    k.cbox("metal", 0.2, 0.14, 0.18, 0.8, 0.97, -0.2, {
      color: 0x3a4a6a,
      bevel: 0.02,
    });
    k.cyl("metal", 0.08, 0.08, 0.14, -0.6, 0.97, -0.1, {
      seg: 8,
      color: 0x8a8a80,
      rust: 0.6,
    });
    for (let i = 0; i < 4; i++)
      k.box(
        "rust",
        0.15 + r() * 0.2,
        0.02,
        0.1 + r() * 0.1,
        -0.1 + r() * 0.5,
        0.91,
        -0.15 + r() * 0.2,
        { ry: r() * 3, color: 0xffffff },
      );
    k.meta.collider = { w: 2.0, d: 0.85, h: 0.92 };
    k.meta.interactY = 1.0;
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- tabletop radio ----------------
  D("radio", (k, r, v) => {
    const y0 = v === 1 ? 0 : 0;
    k.cbox("wood", 0.5, 0.3, 0.24, 0, y0 + 0.15, 0, {
      bevel: 0.08,
      color: 0x7a4a2a,
    });
    k.quad("radio_dial", 0.3, 0.11, 0, y0 + 0.2, -0.122, {
      ry: PI,
      ao: [1, 1],
    });
    k.box("fabric", 0.36, 0.08, 0.01, 0, y0 + 0.08, -0.121, {
      color: 0xc8b890,
    });
    for (const sx of [-0.19, 0.19])
      k.cyl("plain", 0.03, 0.03, 0.03, sx, y0 + 0.2, -0.13, {
        rx: PI / 2,
        seg: 8,
        color: 0xd8c8a0,
      });
    k.meta.glows = [
      { x: 0, y: y0 + 0.2, z: -0.18, color: 0xffb060, size: 0.6, flicker: 0 },
    ];
    k.meta.interactY = y0 + 0.2;
    k.meta.tier = "small";
  });

  // ---------------- tape reel ----------------
  // a 5-inch audio tape reel lying on its cardboard sleeve: two grey flanges with window cut-outs,
  // brown tape wound on the hub. v % 4 picks the sleeve colour.
  D("tape_reel", (k, r, v) => {
    const col = [0x2a4a8a, 0xa01a14, 0x3a6a3a, 0x8a6a2a][v % 4];
    k.box("plain", 0.14, 0.012, 0.14, 0.015, 0.006, 0.01, {
      ry: 0.2,
      color: col,
    });
    k.box("plain", 0.1, 0.002, 0.05, 0.015, 0.013, -0.02, {
      ry: 0.2,
      color: 0xe8e0c8,
    });
    const y = 0.014;
    k.cyl("plain", 0.06, 0.06, 0.003, 0, y + 0.0015, 0, {
      seg: 18,
      color: 0x9aa0a4,
    });
    k.cyl("plain", 0.045, 0.045, 0.008, 0, y + 0.0055, 0, {
      seg: 16,
      color: 0x4a3020,
    });
    k.cyl("plain", 0.06, 0.06, 0.003, 0, y + 0.011, 0, {
      seg: 18,
      color: 0xb0b6ba,
    });
    k.cyl("plain", 0.012, 0.012, 0.004, 0, y + 0.0135, 0, {
      seg: 8,
      color: 0x1a1a18,
    });
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3;
      k.box(
        "plain",
        0.018,
        0.0015,
        0.03,
        Math.cos(a) * 0.032,
        y + 0.0128,
        Math.sin(a) * 0.032,
        { ry: -a, color: 0x2a2620 },
      );
    }
    k.meta.glows = [
      { x: 0, y: 0.05, z: 0, color: 0xffb347, size: 0.35, flicker: 0 },
    ];
    k.meta.interactY = 0.03;
    k.meta.tier = "small";
  });

  // ---------------- scrip stash ----------------
  // v0: a dented cash tin with its lid sprung open on bundles of folded ration-scrip notes tied with string;
  // v1: a Fizzo Cola picnic cooler with the bundles inside. A few loose notes always end up on the floor.
  function scripBundle(k, x, y, z, ry) {
    k.box("plain", 0.1, 0.022, 0.055, x, y + 0.011, z, {
      ry,
      color: 0xd4ccb0,
      grime: 0.3,
    });
    k.box("plain", 0.012, 0.024, 0.057, x, y + 0.012, z, {
      ry,
      color: 0x5a3a24,
    });
  }
  D("scrip_stash", (k, r, v) => {
    if (v === 1) {
      k.cbox("metal", 0.6, 0.38, 0.4, 0, 0.19, 0, {
        bevel: 0.04,
        color: C.fizzoRed,
        rust: 0.3,
      });
      k.cbox("metal", 0.62, 0.06, 0.42, 0, 0.4, 0, {
        bevel: 0.02,
        color: 0xe8e0d0,
      });
      k.quad("fizzo_truck", 0.5, 0.16, 0, 0.2, -0.203, { ry: PI });
      k.seg("metal", [-0.2, 0.46, 0], [0.2, 0.46, 0], 0.012, {
        color: C.chrome,
      });
      k.meta.interactY = 0.4;
    } else {
      k.cbox("metal", 0.28, 0.07, 0.17, 0, 0.035, 0, {
        bevel: 0.01,
        color: 0x5a6a5a,
        rust: 0.4,
      });
      k.box("metal", 0.28, 0.008, 0.17, 0, 0.14, 0.12, {
        rx: -1.9,
        color: 0x5a6a5a,
        rust: 0.4,
      }); // sprung lid
      for (let i = 0; i < 3; i++)
        scripBundle(
          k,
          -0.08 + i * 0.08,
          0.05,
          (r() - 0.5) * 0.04,
          (r() - 0.5) * 0.3,
        );
      k.meta.interactY = 0.15;
    }
    for (let i = 0; i < 5; i++)
      k.box(
        "plain",
        0.06,
        0.003,
        0.03,
        (r() - 0.5) * 0.5,
        0.003,
        -0.15 - r() * 0.2,
        { ry: r() * 6, rx: (r() - 0.5) * 0.3, color: 0xd8d0b4, grime: 0.35 },
      );
    k.meta.container = { name: "Scrip Stash", loot: "scrip_stash" };
    k.meta.tier = "small";
  });

  // ---------------- duffle bag ----------------
  D("duffle_bag", (k, r, v) => {
    k.cyl("fabric", 0.2, 0.2, 0.75, 0, 0.18, 0, {
      rz: PI / 2,
      seg: 10,
      color: [0x4a5236, 0x3a3a3a, 0x6a5a3a][v % 3],
      flat: false,
      s: [0.9, 1, 1],
    });
    for (const sx of [-1, 1])
      k.sphere("fabric", 0.2, sx * 0.375, 0.18, 0, {
        s: [0.3, 0.9, 1],
        color: [0x4a5236, 0x3a3a3a, 0x6a5a3a][v % 3],
        wseg: 8,
        hseg: 5,
      });
    k.torus("fabric", 0.12, 0.015, 0, 0.36, 0, {
      color: 0x2a2a22,
      arc: PI,
      tseg: 8,
      rseg: 3,
    });
    k.meta.container = { name: "Duffle Bag", loot: "duffle_bag" };
    k.meta.interactY = 0.3;
    k.meta.tier = "small";
  });

  // ---------------- cash register ----------------
