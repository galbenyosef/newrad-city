// play-inline-442 03 — depth
// Lines 643-969 of readable/play-inline-442.pretty.js (statement-aligned).
  D("bus_stop", (k, r, v) => {
    if (v === 0) {
      k.cyl("metal", 0.03, 0.035, 2.6, 0, 1.3, 0, {
        color: 0x6a6a60,
        rust: 0.4,
        seg: 6,
      });
      k.quad("bus_stop", 0.34, 0.45, 0, 2.3, -0.035, { ry: PI });
      k.quad("bus_stop", 0.34, 0.45, 0, 2.3, 0.035, {});
      k.meta.tier = "small";
      return;
    }
    // glass shelter, open toward -z (the street)
    const o = { color: 0x4a5048, rust: 0.4 };
    const W = 3.2,
      Dp = 1.3,
      H = 2.4;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB("metal", 0.08, H, 0.08, (sx * W) / 2, 0, (sz * Dp) / 2, o);
    k.cbox(
      "metal",
      W + 0.3,
      0.1,
      Dp + 0.3,
      0,
      H + 0.05,
      0.05,
      Object.assign({ bevel: 0.04 }, o),
    );
    for (let i = 0; i < 3; i++)
      if (r() > 0.3)
        k.box(
          "glass",
          W / 3 - 0.06,
          1.8,
          0.02,
          -W / 3 + (i * W) / 3,
          1.25,
          Dp / 2,
          { color: 0x6a7a78 },
        );
    if (r() > 0.3)
      k.box("glass", 0.02, 1.8, Dp - 0.1, -W / 2, 1.25, 0, { color: 0x6a7a78 });
    // ad panel on the right end
    k.boxB("metal", 0.1, 1.9, Dp - 0.1, W / 2, 0.2, 0, o);
    k.quad(
      X.POSTERS[(r() * X.POSTERS.length) | 0],
      0.9,
      1.35,
      W / 2 - 0.06,
      1.15,
      0,
      { ry: -PI / 2 },
    );
    k.quad(
      X.POSTERS[(r() * X.POSTERS.length) | 0],
      0.9,
      1.35,
      W / 2 + 0.06,
      1.15,
      0,
      { ry: PI / 2 },
    );
    // bench
    k.boxB("metal", W - 0.8, 0.05, 0.4, -0.2, 0.44, Dp / 2 - 0.3, o);
    for (const sx of [-1.2, 0.8])
      k.boxB("metal", 0.05, 0.44, 0.35, sx, 0, Dp / 2 - 0.3, o);
    k.meta.collider = { w: W, d: 0.2, h: H, cz: Dp / 2 };
    k.meta.tier = "medium";
  });

  // ---------------- sidewalk shed (NYC scaffolding over the sidewalk) ----------------
  // local: runs along X (length 3 m module), depth along Z: wall side at +z, curb side at -z
  // variant: 0 = 3 m deep, 1 = 4 m deep, 2 = collapsed 3 m, 3 = collapsed 4 m
  D("sidewalk_shed", (k, r, v) => {
    const depth = v % 2 === 0 ? 2.8 : 3.8,
      L = 3,
      H = 3.2;
    const collapsed = v >= 2;
    const pipe = { color: 0x7a7a70, rust: 0.45 };
    const green = { color: 0x2f4a36, rust: 0.2 };
    const tilt = collapsed ? 0.35 : 0;
    for (const x of [-L / 2, L / 2]) {
      k.seg(
        "metal",
        [x, 0, -depth / 2],
        [x, collapsed && x > 0 ? H - 1.1 : H, -depth / 2],
        0.045,
        pipe,
      );
      k.seg("metal", [x, 0, depth / 2], [x, H, depth / 2], 0.045, pipe);
      k.seg("metal", [x, H, -depth / 2], [x, H, depth / 2], 0.05, pipe);
      k.seg(
        "metal",
        [x, 0.02, -depth / 2 - 0.1],
        [x, 0.02, -depth / 2 + 0.1],
        0.08,
        pipe,
      ); // base plates
    }
    // longitudinal beams + plywood deck (painted NYC green)
    k.seg(
      "metal",
      [-L / 2, H, -depth / 2],
      [L / 2, collapsed ? H - 1.1 : H, -depth / 2],
      0.05,
      pipe,
    );
    k.box(
      "wood",
      L + 0.02,
      0.06,
      depth + 0.1,
      0,
      H + 0.08,
      0,
      Object.assign({ rz: tilt * 0.6, color: 0x5a6a50 }, {}),
    );
    // parapet board along the curb side, with posters & ads
    k.box(
      "wood",
      L,
      0.9,
      0.05,
      0,
      H + 0.55,
      -depth / 2 - 0.05,
      Object.assign({ rz: tilt * 0.6 }, green),
    );
    if (!collapsed) {
      k.quad(
        X.POSTERS[(r() * X.POSTERS.length) | 0],
        0.55,
        0.8,
        -0.8 + r() * 0.3,
        H + 0.55,
        -depth / 2 - 0.08,
        { ry: PI },
      );
      if (r() < 0.6)
        k.quad(
          X.POSTERS[(r() * X.POSTERS.length) | 0],
          0.55,
          0.8,
          0.7,
          H + 0.55,
          -depth / 2 - 0.08,
          { ry: PI },
        );
    }
    // diagonal braces
    k.seg(
      "metal",
      [-L / 2, 0.3, depth / 2],
      [L / 2, H - 0.3, depth / 2],
      0.03,
      pipe,
    );
    // hanging caged work light (sometimes lit)
    if (r() < 0.35 && !collapsed) {
      k.sphere("glow", 0.08, 0, H - 0.2, 0, {
        color: C.bulbWarm,
        wseg: 6,
        hseg: 4,
      });
      (k.meta.glows = k.meta.glows || []).push({
        x: 0,
        y: H - 0.25,
        z: 0,
        color: 0xffd090,
        size: 3.5,
        flicker: 0.5,
      });
    }
    if (collapsed) {
      // planks fallen on the ground
      for (let i = 0; i < 4; i++)
        k.box(
          "wood",
          2 + r(),
          0.04,
          0.3,
          (r() - 0.5) * 1.5,
          0.04 + i * 0.04,
          (r() - 0.5) * depth * 0.8,
          { ry: (r() - 0.5) * 0.8, color: 0x7a6a50 },
        );
    }
    k.meta.tier = "medium";
  });

  // ---------------- facade pipe scaffold tower ----------------
  D("scaffold_tower", (k, r, v) => {
    const bays = 2 + (v % 2),
      levels = 4 + (v % 3),
      BW = 2,
      LH = 2,
      Dp = 1.2;
    const pipe = { color: 0x8a8a80, rust: 0.5 };
    for (let b = 0; b <= bays; b++)
      for (const z of [0, Dp])
        k.seg(
          "metal",
          [b * BW, 0, z],
          [b * BW, levels * LH + 1, z],
          0.04,
          pipe,
        );
    for (let l = 1; l <= levels; l++) {
      const y = l * LH;
      k.seg("metal", [0, y, 0], [bays * BW, y, 0], 0.035, pipe);
      k.seg("metal", [0, y, Dp], [bays * BW, y, Dp], 0.035, pipe);
      k.seg("metal", [0, y + 1, 0], [bays * BW, y + 1, 0], 0.025, pipe); // guard rail
      for (let b = 0; b < bays; b++) {
        if (r() < 0.8)
          k.box(
            "wood",
            BW - 0.05,
            0.05,
            Dp - 0.1,
            b * BW + BW / 2,
            y + 0.03,
            Dp / 2,
            { color: 0x8a7458, ry: (r() - 0.5) * 0.05 },
          );
        if ((b + l) % 2 === 0)
          k.seg(
            "metal",
            [b * BW, y - LH, Dp],
            [b * BW + BW, y, Dp],
            0.025,
            pipe,
          );
      }
    }
    // tarp remnants
    if (r() < 0.6)
      k.box("fabric", BW * 0.9, LH * 1.4, 0.02, BW * 0.5, LH * 2.5, -0.05, {
        color: 0x3a5a6a,
        rz: 0.05,
      });
    k.meta.tier = "medium";
  });

  // ---------------- sidewalk clock ----------------
  D("street_clock", (k, r) => {
    const o = { color: 0x2a3a30, rust: 0.3 };
    k.cyl("metal", 0.25, 0.3, 0.4, 0, 0.2, 0, Object.assign({ seg: 10 }, o));
    k.cyl("metal", 0.1, 0.13, 3.3, 0, 2, 0, Object.assign({ seg: 10 }, o));
    k.cyl(
      "metal",
      0.42,
      0.42,
      0.18,
      0,
      4,
      0,
      Object.assign({ rx: PI / 2, seg: 16 }, o),
    );
    for (const s of [-1, 1]) {
      k.cyl("plain", 0.36, 0.36, 0.01, 0, 4, s * 0.095, {
        rx: PI / 2,
        seg: 16,
        color: 0xe8e0c8,
        ao: [1, 1],
      });
      k.box("plain", 0.02, 0.26, 0.01, 0.05, 4.05, s * 0.105, {
        rz: -0.4,
        color: 0x111111,
      });
      k.box("plain", 0.02, 0.18, 0.01, -0.04, 4.03, s * 0.105, {
        rz: 1.2,
        color: 0x111111,
      });
    }
    k.sphere("metal", 0.1, 0, 4.5, 0, Object.assign({ wseg: 8, hseg: 5 }, o));
    k.meta.collider = { w: 0.5, d: 0.5, h: 3 };
    k.meta.tier = "medium";
  });

  // ---------------- dead tree helpers ----------------
  function branch(k, p, dir, len, br, depth, r, col) {
    const e = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
    k.seg("wood", p, e, br, {
      r2: br * 0.65,
      seg: depth > 1 ? 6 : 4,
      color: col,
      grime: 0.3,
    });
    if (depth <= 0) return;
    const n = depth > 1 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU;
      const nd = [
        dir[0] * 0.55 + Math.cos(a) * 0.6,
        dir[1] * 0.6 + 0.25 + r() * 0.3,
        dir[2] * 0.55 + Math.sin(a) * 0.6,
      ];
      const l = Math.hypot(nd[0], nd[1], nd[2]);
      nd[0] /= l;
      nd[1] /= l;
      nd[2] /= l;
      branch(k, e, nd, len * (0.55 + r() * 0.2), br * 0.62, depth - 1, r, col);
    }
  }
  X.deadTree = function (k, r, x, z, h, depth) {
    const col = 0x6a5a4a;
    k.seg(
      "wood",
      [x, 0, z],
      [x + (r() - 0.5) * 0.3, h * 0.45, z + (r() - 0.5) * 0.3],
      (0.13 * h) / 5,
      { r2: (0.09 * h) / 5, seg: 7, color: col },
    );
    branch(
      k,
      [x, h * 0.42, z],
      [0.1, 1, 0.05],
      h * 0.35,
      (0.09 * h) / 5,
      depth,
      r,
      col,
    );
  };
  // ---------------- planters & sidewalk tree pits ----------------
