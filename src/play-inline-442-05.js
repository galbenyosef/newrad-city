// play-inline-442 05 — base
// Lines 1242-1362 of readable/play-inline-442.pretty.js (statement-aligned).
  D("billboard_frame", (k, r, v) => {
    const steel = { color: 0x5a5a52, rust: 0.55 };
    const big = v === 1;
    const W = big ? 12 : 6,
      H = big ? 5 : 3,
      base = big ? 7 : 4.2;
    const lean = v === 2 ? 0.12 : 0;
    const legs = big ? [-W / 3, 0, W / 3] : [-W / 3.2, W / 3.2];
    for (const lx of legs) {
      k.boxB("concrete", 0.7, 0.4, 0.7, lx, 0, 0.2, { color: 0xa8a498 });
      k.seg(
        "metal",
        [lx, 0.4, 0.2],
        [lx, base + H * 0.5, 0.2 + lean * base],
        big ? 0.16 : 0.11,
        Object.assign({ seg: 8 }, steel),
      );
      if (big) k.seg("metal", [lx, 0.4, 1.4], [lx, base, 0.35], 0.07, steel);
    }
    // back frame + face panel backing
    k.box(
      "metal",
      W + 0.2,
      H + 0.2,
      0.12,
      0,
      base + H / 2,
      0.12 + lean * base,
      Object.assign({ rx: -lean }, steel),
    );
    for (let i = 0; i <= 4; i++)
      k.box(
        "metal",
        0.08,
        H,
        0.2,
        -W / 2 + (i * W) / 4,
        base + H / 2,
        0.25 + lean * base,
        Object.assign({ rx: -lean }, steel),
      );
    // catwalk + lamps along the bottom edge
    k.box(
      "metal",
      W,
      0.05,
      0.8,
      0,
      base - 0.2,
      -0.3 + lean * base,
      Object.assign({ rx: -lean }, steel),
    );
    const nl = big ? 4 : 2;
    for (let i = 0; i < nl; i++) {
      const lx = -W / 2 + ((i + 0.5) * W) / nl;
      k.seg(
        "metal",
        [lx, base - 0.2, -0.3 + lean * base],
        [lx, base - 0.3, -1.1 + lean * base],
        0.03,
        steel,
      );
      k.cyl(
        "metal",
        0.14,
        0.2,
        0.2,
        lx,
        base - 0.3,
        -1.1 + lean * base,
        Object.assign({ rx: -0.9, seg: 8 }, steel),
      );
    }
    k.meta.face = {
      w: W,
      h: H,
      y: base + H / 2,
      z: -0.0 + lean * base,
      rx: -lean,
    };
    k.meta.collider = { w: W * 0.7, d: 0.8, h: 3, cz: 0.2 };
    k.meta.tier = "large";
  });

  // ---------------- wall poster slab (for kiosks / walls) ----------------
  D("poster_board", (k, r, v) => {
    // a free-standing plywood hoarding panel covered in posters (construction fence)
    const W = 2.4,
      H = 2.2;
    k.boxB("wood", W, H, 0.05, 0, 0, 0, { color: 0x6a6048 });
    for (const sx of [-1, 1])
      k.boxB("wood", 0.1, H, 0.3, sx * (W / 2 - 0.1), 0, 0.15, {
        color: 0x5a4a38,
      });
    const n = 3 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const pw = 0.5,
        ph = 0.75;
      k.quad(
        X.POSTERS[(r() * X.POSTERS.length) | 0],
        pw,
        ph,
        -W / 2 + 0.4 + r() * (W - 0.8),
        0.6 + r() * (H - 1.2),
        -0.03 - i * 0.002,
        { ry: PI, rz: (r() - 0.5) * 0.15 },
      );
    }
    if (r() < 0.5)
      k.quad(
        "graffiti_" + ((r() * X.GRAFFITI) | 0),
        1.6,
        0.8,
        0,
        0.6,
        -0.04 - n * 0.002,
        { ry: PI },
      );
    k.meta.collider = { w: W, d: 0.3, h: H, cz: 0.1 };
    k.meta.tier = "medium";
  });
