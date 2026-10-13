// play-inline-443 04 — color
// Lines 900-1225 of readable/play-inline-443.pretty.js (statement-aligned).
  D("shopping_cart", (k, r, v) => {
    const kk = v === 1 ? new X.Kit(51) : k;
    const m = { color: 0x8a8a84, rust: 0.4 };
    // wire basket: chain-textured panels
    kk.box("chain", 0.9, 0.45, 0.02, 0, 0.72, -0.28, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.9, 0.45, 0.02, 0, 0.72, 0.28, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.02, 0.45, 0.56, -0.45, 0.72, 0, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.02, 0.45, 0.56, 0.45, 0.72, 0, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.9, 0.02, 0.56, 0, 0.5, 0, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.seg("metal", [0.45, 0.95, -0.3], [0.62, 1.05, -0.3], 0.015, m);
    kk.seg("metal", [0.45, 0.95, 0.3], [0.62, 1.05, 0.3], 0.015, m);
    kk.seg("metal", [0.62, 1.05, -0.3], [0.62, 1.05, 0.3], 0.02, {
      color: 0xa02a1a,
    });
    for (const sx of [-0.38, 0.38])
      for (const sz of [-0.24, 0.24]) {
        kk.seg("metal", [sx, 0.5, sz], [sx, 0.08, sz], 0.012, m);
        kk.cyl("plain", 0.06, 0.06, 0.03, sx, 0.06, sz, {
          rx: PI / 2,
          seg: 8,
          color: 0x222222,
        });
      }
    // junk inside
    if (r() < 0.7) {
      kk.boxB("wood", 0.4, 0.3, 0.3, -0.1, 0.52, 0, {
        color: 0x8a7050,
        ry: r(),
      });
      kk.sphere("fabric", 0.18, 0.2, 0.7, 0.05, {
        color: 0x3a3a34,
        s: [1, 0.7, 1],
      });
    }
    if (v === 1) k.include(kk, { y: 0.3, x: 0.2, rz: PI / 2 - 0.1 });
    k.meta.tier = "small";
  });

  // ---------------- crates ----------------
  const CRATE_REG = [
    "crate_fizzo",
    "crate_teletype",
    "crate_army",
    "crate_longwinter",
    "crate_plain",
  ];
  const CRATE_SIZE = [
    [0.62, 0.45, 0.45],
    [0.8, 0.8, 0.8],
    [1.2, 0.45, 0.5],
    [0.9, 0.7, 0.7],
    [1.0, 1.0, 1.0],
  ];
  function crate(k, r, v, x, y, z, ry, s) {
    s = s || 1;
    const d = CRATE_SIZE[v % 5];
    k.abox(
      CRATE_REG[v % 5],
      d[0] * s,
      d[1] * s,
      d[2] * s,
      x,
      y + (d[1] * s) / 2,
      z,
      { ry, color: 0xffffff, grime: 0.15, ao: [0.75, 0.4] },
    );
    return d[1] * s;
  }
  X.crate = crate;
  D("crate", (k, r, v) => {
    crate(k, r, v, 0, 0, 0, 0);
    const d = CRATE_SIZE[v % 5];
    k.meta.collider = { w: d[0], d: d[2], h: d[1] };
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });
  D("crate_stack", (k, r, v) => {
    const n = 3 + v;
    let placed = 0;
    for (let i = 0; i < n; i++) {
      const cv = (r() * 5) | 0;
      const layer = i < 3 ? 0 : 1;
      const h = layer ? 0.8 : 0;
      crate(
        k,
        r,
        cv,
        -0.9 + (i % 3) * 0.95 + (r() - 0.5) * 0.1,
        layer ? h : 0,
        (r() - 0.5) * 0.2,
        (r() - 0.5) * 0.3,
        layer ? 0.8 : 1,
      );
      placed++;
    }
    k.meta.collider = { w: 2.8, d: 1.0, h: 1.4 };
    k.meta.surface = "wood";
    k.meta.tier = "medium";
  });

  // ---------------- pallets ----------------
  function pallet(k, r, x, y, z, ry) {
    const w = { color: 0x9a8260 };
    const P = new X.Kit(61);
    for (const sz of [-0.45, 0, 0.45])
      P.box("wood", 1.2, 0.09, 0.1, 0, 0.045, sz, w);
    for (let i = 0; i < 7; i++)
      if (r() > 0.1)
        P.box("wood", 0.12, 0.025, 1.0, -0.55 + i * 0.183, 0.1, 0, w);
    k.include(P, { x, y, z, ry });
  }
  D("pallet", (k, r, v) => {
    const n = v === 0 ? 1 : 3 + ((r() * 4) | 0);
    for (let i = 0; i < n; i++)
      pallet(
        k,
        r,
        (r() - 0.5) * 0.1,
        i * 0.115,
        (r() - 0.5) * 0.1,
        (r() - 0.5) * 0.12,
      );
    if (v === 2) pallet(k, r, 0.3, 0.55, 0.1, 0.3); // leaning
    k.meta.collider = n > 1 ? { w: 1.2, d: 1.0, h: n * 0.115 } : null;
    k.meta.tier = "small";
  });

  // ---------------- chain-link fence ----------------
  D("chainlink", (k, r, v) => {
    const L = 3,
      H = 2.2,
      steel = { color: 0x8a8a84, rust: 0.45 };
    for (const px of [-L / 2, L / 2])
      k.cyl(
        "metal",
        0.035,
        0.035,
        H + 0.1,
        px,
        (H + 0.1) / 2,
        0,
        Object.assign({ seg: 6 }, steel),
      );
    k.seg("metal", [-L / 2, H, 0], [L / 2, H, 0], 0.025, steel);
    const sag = v === 2 ? 0.6 : 0;
    k.box("chain", L, H - 0.1 - sag, 0.01, 0, (H - sag) / 2 + 0.05, 0, {
      color: 0xa8a8a0,
      uvScale: 2,
      rx: sag ? 0.25 : 0,
    });
    if (v === 1)
      for (let i = 0; i < 12; i++)
        k.torus(
          "metal",
          0.14,
          0.006,
          -L / 2 + ((i + 0.5) * L) / 12,
          H + 0.18,
          0,
          { ry: PI / 2 + 0.3, color: 0x6a6a62, rust: 0.5, tseg: 8, rseg: 3 },
        );
    k.meta.collider = { w: L, d: 0.12, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });

  // ---------------- A-frame sidewalk board ----------------
  D("sandwich_board", (k, r, v) => {
    const reg = "board_" + (v % 2);
    for (const s of [-1, 1]) {
      k.box("wood", 0.62, 0.95, 0.03, 0, 0.47, s * 0.13, {
        rx: s * 0.2,
        color: 0x6a5038,
      });
      k.quad(reg, 0.52, 0.82, 0, 0.5, s * 0.15, {
        rx: s * 0.2,
        ry: s > 0 ? 0 : PI,
      });
    }
    k.meta.tier = "small";
  });

  // ---------------- debris pile ----------------
  D("debris", (k, r, v) => {
    // concrete chunks, planks, pipes, a hub cap, bricks
    for (let i = 0; i < 6 + v * 3; i++) {
      const a = r() * X.TAU,
        d = r() * (0.8 + v * 0.5);
      const t = r();
      if (t < 0.4)
        k.cbox(
          "concrete",
          0.2 + r() * 0.5,
          0.12 + r() * 0.3,
          0.2 + r() * 0.4,
          Math.cos(a) * d,
          0.1,
          Math.sin(a) * d,
          {
            ry: r() * 3,
            rx: (r() - 0.5) * 0.5,
            bevel: 0.04,
            color: [0xb0aa9c, 0x9a948a, 0x8a5a44][(r() * 3) | 0],
          },
        );
      else if (t < 0.65)
        k.box(
          "wood",
          0.8 + r() * 1.2,
          0.04,
          0.14,
          Math.cos(a) * d,
          0.05 + r() * 0.2,
          Math.sin(a) * d,
          { ry: r() * 3, rz: (r() - 0.5) * 0.4, color: 0x7a6a50 },
        );
      else if (t < 0.85)
        k.seg(
          "rust",
          [Math.cos(a) * d, 0.05, Math.sin(a) * d],
          [
            Math.cos(a) * d + (r() - 0.5) * 2,
            0.05 + r() * 0.4,
            Math.sin(a) * d + (r() - 0.5) * 2,
          ],
          0.03 + r() * 0.03,
          { color: 0xffffff, seg: 6 },
        );
      else
        k.boxB(
          "concrete",
          0.2,
          0.06,
          0.1,
          Math.cos(a) * d,
          0,
          Math.sin(a) * d,
          { ry: r() * 3, color: 0x8a4a34 },
        );
    }
    k.meta.tier = "small";
  });

  // ---------------- shipping container (Brooklyn docks) ----------------
  D("shipping_container", (k, r, v) => {
    const L = 6.1,
      W = 2.44,
      H = 2.6;
    const cols = [0x2a5a7a, 0x8a3a2a, 0xa01418, 0xc86a20];
    const o = { color: cols[v % 4], rust: 0.45 + r() * 0.3 };
    k.boxB("paint", L, H, W, 0, 0, 0, o);
    // corrugation ribs on the long sides
    for (let i = 0; i < 22; i++)
      for (const s of [-1, 1])
        k.box(
          "paint",
          0.1,
          H - 0.2,
          0.04,
          -L / 2 + 0.2 + (i * (L - 0.4)) / 21,
          H / 2,
          s * (W / 2 + 0.02),
          o,
        );
    // corner castings & frame
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "metal",
          0.18,
          H,
          0.18,
          sx * (L / 2 - 0.09),
          0,
          sz * (W / 2 - 0.09),
          { color: 0x3a3a34, rust: 0.5 },
        );
    // livery on both sides
    k.quad(
      "container_" + (v % 4),
      L * 0.6,
      H * 0.6,
      0.3,
      H * 0.55,
      -(W / 2 + 0.05),
      { ry: PI },
    );
    k.quad(
      "container_" + (v % 4),
      L * 0.6,
      H * 0.6,
      -0.3,
      H * 0.55,
      W / 2 + 0.05,
      {},
    );
    // doors + locking bars at the +x end
    for (let i = 0; i < 4; i++)
      k.seg(
        "metal",
        [L / 2 + 0.03, 0.1, -0.9 + i * 0.6],
        [L / 2 + 0.03, H - 0.1, -0.9 + i * 0.6],
        0.02,
        { color: 0x5a5a52, rust: 0.6 },
      );
    k.meta.collider = { w: L, d: W, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "large";
  });

  // ---------------- dumpster ----------------
