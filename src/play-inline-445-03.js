// play-inline-445 03 — color
// Lines 557-771 of readable/play-inline-445.pretty.js (statement-aligned).
  function cartKit(r, withUmbrella) {
    const k = new X.Kit(51);
    const steel = { color: 0xc8c0aa, rust: 0.4, grime: 0.35 }; // warm, grimy stainless
    const bright = { color: 0xd8d2c0, rust: 0.3, grime: 0.3 };
    const red = { color: 0xa8261c, rust: 0.45, grime: 0.35 };
    const dark = { color: 0x2a2a28, rust: 0.4 };
    k.boxB("metal", 1.7, 0.72, 0.78, 0, 0.32, 0, steel);
    // printed livery panels fill the long sides; red end panels
    for (const s of [-1, 1])
      k.quad("cart_side", 1.66, 0.7, 0, 0.68, s * 0.396, {
        ry: s > 0 ? 0 : PI,
        grime: 0.12,
      });
    for (const s of [-1, 1])
      k.box("metal", 0.02, 0.66, 0.74, s * 0.855, 0.66, 0, red);
    k.boxB("metal", 1.78, 0.04, 0.86, 0, 1.04, 0, bright);
    k.box("metal", 1.8, 0.05, 0.03, 0, 1.06, -0.44, red);
    k.box("metal", 1.8, 0.05, 0.03, 0, 1.06, 0.44, red);
    // steam wells with lids (one lid off), condiment pumps, the glass sneeze guard, napkin dispensers
    for (let i = 0; i < 3; i++)
      k.cyl("metal", 0.14, 0.15, 0.06, -0.5 + i * 0.36, 1.1, 0.05, {
        seg: 12,
        color: 0xb8b2a0,
        rust: 0.4,
      });
    k.cyl("metal", 0.15, 0.15, 0.02, -0.14, 1.19, 0.2, {
      seg: 12,
      rx: 0.9,
      color: 0xb8b2a0,
      rust: 0.4,
    });
    k.cyl("metal", 0.03, 0.03, 0.14, -0.52, 1.25, 0.05, {
      seg: 6,
      color: 0x2a2a28,
    });
    for (let i = 0; i < 3; i++)
      k.cyl("plain", 0.045, 0.045, 0.2, 0.52 + i * 0.1, 1.16, -0.25, {
        seg: 7,
        color: [0xd8b020, 0xc02818, 0x3a7a2a][i],
      });
    for (const s of [-1, 1])
      k.seg(
        "metal",
        [0.05, 1.06, s * 0.36],
        [0.05, 1.42, s * 0.36],
        0.012,
        bright,
      );
    k.box("glass", 1.3, 0.02, 0.76, -0.2, 1.44, 0, { color: 0x6a7a78 });
    k.box("glass", 1.3, 0.34, 0.015, -0.2, 1.26, -0.38, {
      rx: -0.12,
      color: 0x5a6a68,
    });
    for (const x of [0.68, -0.8]) {
      k.boxB("metal", 0.14, 0.16, 0.1, x, 1.06, 0.3, {
        color: 0xd0ccc0,
        rust: 0.3,
      });
      k.box("fabric", 0.1, 0.03, 0.01, x, 1.2, 0.35, { color: 0xe8e4d8 });
    }
    // wheels (+x end) and fold-down leg (-x end)
    for (const s of [-1, 1]) {
      k.torus("metal", 0.26, 0.03, 0.6, 0.28, s * 0.45, {
        rseg: 4,
        tseg: 14,
        color: 0x1c1c1a,
        rust: 0.5,
      });
      for (let i = 0; i < 6; i++) {
        const a = (i * PI) / 3;
        k.seg(
          "metal",
          [0.6, 0.28, s * 0.45],
          [0.6 + Math.cos(a) * 0.25, 0.28 + Math.sin(a) * 0.25, s * 0.45],
          0.008,
          dark,
        );
      }
      k.seg("metal", [-0.72, 0.33, s * 0.3], [-0.76, 0, s * 0.33], 0.025, dark);
    }
    k.cyl("metal", 0.03, 0.03, 0.95, 0.6, 0.28, 0, {
      rx: PI / 2,
      seg: 6,
      color: 0x2a2a28,
    });
    // push bar
    for (const s of [-1, 1])
      k.seg(
        "metal",
        [-0.85, 0.9, s * 0.3],
        [-1.12, 1.02, s * 0.3],
        0.02,
        steel,
      );
    k.seg("metal", [-1.12, 1.02, -0.32], [-1.12, 1.02, 0.32], 0.022, dark);
    if (withUmbrella) umbrella(k, r, 0.05, 1.08, 0.02, 0.1);
    return k;
  }
  /** "FOREVER FRANKS 10¢" menu board on its own pole (clamped to the cart, or lying in the street). */
  function menuBoard(k, x, y, z, o) {
    const B = new X.Kit(57);
    B.seg("metal", [0, 0, 0], [0, 0.9, 0], 0.018, {
      color: 0xb8b2a0,
      rust: 0.5,
    });
    B.box("metal", 0.98, 0.34, 0.03, 0, 1.05, 0, {
      color: 0x7a1a14,
      rust: 0.5,
    });
    for (const s of [-1, 1])
      B.quad("cart_menu", 0.94, 0.31, 0, 1.05, s * 0.017, {
        mat: "trim",
        ry: s > 0 ? 0 : PI,
        grime: 0.2,
      });
    k.include(B, Object.assign({ x, y, z }, o || {}));
  }
  function umbrella(k, r, x, y, z, tilt) {
    const U = new X.Kit(53);
    U.cyl("metal", 0.018, 0.018, 1.25, 0, 0.62, 0, {
      seg: 6,
      color: 0xb8b8ae,
      rust: 0.5,
    });
    const panels = 8,
      R = 1.05,
      torn = (r() * panels) | 0;
    for (let i = 0; i < panels; i++) {
      if (i === torn) continue; // one panel ripped away
      const col = i % 2 ? 0xd8ceb4 : 0xa82a1e;
      U.cyl(
        "fabric",
        0.02,
        R * (i === (torn + 3) % panels ? 0.78 : 1),
        0.34,
        0,
        1.36,
        0,
        {
          seg: 3,
          thetaStart: (i * X.TAU) / panels,
          thetaLength: X.TAU / panels,
          open: true,
          color: col,
          grime: 0.55,
        },
      );
      U.seg(
        "metal",
        [0, 1.52, 0],
        [
          Math.sin((i * X.TAU) / panels) * R * 0.98,
          1.2,
          Math.cos((i * X.TAU) / panels) * R * 0.98,
        ],
        0.008,
        { color: 0x3a3a36 },
      );
    }
    k.include(U, { x, y, z, rz: tilt, rx: tilt * 0.4 });
  }
  D("food_cart", (k, r, v) => {
    v = v % 2;
    if (v === 0) {
      k.include(cartKit(r, true), {});
      menuBoard(k, -0.78, 1.06, -0.3, { ry: PI / 2 + 0.1, rz: 0.05 });
      k.meta.collider = { w: 2.0, d: 0.9, h: 1.1 };
    } else {
      // tipped onto its side (printed panel up), the umbrella still open and propped against it, buns & cans spilled
      k.include(cartKit(r, false), { y: 0.43, z: 0.35, rx: PI / 2 - 0.04 });
      const U = new X.Kit(55);
      umbrella(U, r, 0, 0, 0, 0);
      k.include(U, { x: 0.5, y: 0.02, z: -1.6, rx: 0.75, ry: 0.25 });
      menuBoard(k, -1.3, 0.03, -1.1, { rz: PI / 2 - 0.05, ry: 0.4 });
      for (let i = 0; i < 7; i++)
        k.cyl(
          "plain",
          0.04,
          0.04,
          0.11,
          (r() - 0.5) * 1.8,
          0.04,
          -0.4 - r() * 0.8,
          {
            rz: PI / 2,
            ry: r() * 6,
            seg: 6,
            color: pick(r, [0xc0a020, 0xb02018, 0x7a6a5a, 0x3a6a2a]),
            rust: 0.5,
          },
        );
      for (let i = 0; i < 4; i++)
        k.box(
          "fabric",
          0.16,
          0.01,
          0.12,
          (r() - 0.5) * 1.6,
          0.01,
          -0.5 - r() * 1.0,
          { ry: r() * 6, color: 0xe0dcd0, grime: 0.6 },
        ); // napkins
      k.meta.collider = { w: 1.9, d: 1.2, h: 0.85, cz: 0.85 };
    }
    k.meta.container = { name: "Forever Franks Cart", loot: "cooler" };
    k.meta.interactY = 0.8;
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });

  // ------------------------------------------------------------------
  // NYC CORNER NEWSSTAND. 3.0 × 1.6 × 2.5 m, green-painted steel. The
  // front (-Z) is the serving window: v0 shutter down + padlock, v1 open
  // with the counter, magazine racks and bundled papers.
  // ------------------------------------------------------------------
