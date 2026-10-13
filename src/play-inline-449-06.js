// play-inline-449 06 — color
// Lines 1548-1875 of readable/play-inline-449.pretty.js (statement-aligned).
  D("shop_counter", (k, r, v) => {
    const W = [2.0, 2.6, 3.2, 3.8][v | 0] || 2.6,
      Dp = 0.7,
      H = 1.0;
    const wood = { color: 0x92704c, grime: 0.3 };
    const top = { color: 0xb8c4b0, grime: 0.3 };
    const caseW = Math.min(1.1, W * 0.38),
      bodyW = W - caseW;
    const bx = -W / 2 + bodyW / 2,
      cx = W / 2 - caseW / 2;
    // kick plate + body
    k.boxB("metal", W, 0.12, Dp - 0.08, 0, 0, 0.04, {
      color: 0x3a3632,
      rust: 0.6,
    });
    k.boxB("wood", bodyW, H - 0.17, Dp, bx, 0.12, 0, wood);
    // raised panels on the customer face
    const np = Math.max(2, Math.round(bodyW / 0.7));
    for (let i = 0; i < np; i++) {
      const px = -W / 2 + (i + 0.5) * (bodyW / np);
      k.boxB("wood", bodyW / np - 0.12, 0.52, 0.03, px, 0.26, -Dp / 2 - 0.01, {
        color: 0xa27e58,
        grime: 0.35,
      });
      k.boxB("wood", bodyW / np - 0.2, 0.4, 0.02, px, 0.32, -Dp / 2 - 0.03, {
        color: 0x7e603e,
        grime: 0.4,
      });
    }
    // formica top with chrome edge, overhanging the customer side
    // worn formica: mint boomerang speckle, rubbed through to the brown core along the customer edge and by the till
    k.box("metal", W + 0.06, 0.05, Dp + 0.1, 0, H - 0.025, -0.03, {
      segs: [Math.round(W * 6), 1, 5],
      grime: 0.25,
      ao: [1, 1],
      colorFn: (x, y, z) => {
        const n = X.noise3(x * 9, 0, z * 9),
          wear =
            X.noise3(x * 1.7 + 3, 1, z * 2.3) +
            (z < -0.3 ? 0.35 : 0) -
            Math.abs(x + W * 0.1) * 0.05;
        if (wear > 0.95) return 0x6a5038;
        return n > 0.66 ? 0x5a7a70 : n < 0.3 ? 0xc8d8cc : 0x9ab8aa;
      },
    });
    k.box("metal", W + 0.06, 0.012, Dp + 0.1, 0, H - 0.056, -0.03, {
      color: 0x3a3228,
    }); // dark underside lip
    k.box("metal", W + 0.08, 0.04, 0.02, 0, H - 0.03, -Dp / 2 - 0.09, {
      color: C.chrome,
    });
    // glass display case at the +x end: metal frame + glass sides, goods inside
    const fr = { color: 0x8a8a80, rust: 0.3 };
    k.boxB("metal", caseW, 0.12, Dp, cx, 0.12, 0, fr);
    k.boxB("metal", caseW, 0.04, Dp, cx, 0.52, 0, fr);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "metal",
          0.035,
          H - 0.17,
          0.035,
          cx + sx * (caseW / 2 - 0.02),
          0.12,
          sz * (Dp / 2 - 0.02),
          fr,
        );
    k.box(
      "glass",
      caseW - 0.04,
      H - 0.3,
      0.01,
      cx,
      0.12 + (H - 0.17) / 2,
      -Dp / 2 + 0.01,
      { color: 0x9ab0a8 },
    );
    k.box(
      "glass",
      0.01,
      H - 0.3,
      Dp - 0.04,
      cx + caseW / 2 - 0.01,
      0.12 + (H - 0.17) / 2,
      0,
      { color: 0x9ab0a8 },
    );
    for (let i = 0; i < 5; i++) {
      const gx = cx + (r() - 0.5) * (caseW - 0.25),
        gz = (r() - 0.5) * (Dp - 0.25),
        sh = i < 3 ? 0.24 : 0.56;
      if (r() < 0.5)
        k.boxB("plain", 0.14, 0.09, 0.1, gx, sh, gz, {
          color: [0xc8a040, 0x2a60a8, 0xa83028, 0xd8d0b8][(r() * 4) | 0],
          ry: r() * 3,
        });
      else
        k.cyl("metal", 0.035, 0.035, 0.11, gx, sh + 0.055, gz, {
          seg: 8,
          color: [0xb02020, 0x8a8a80, 0x3a6a3a][(r() * 3) | 0],
          rust: 0.5,
        });
    }
    // clerk side: shelf under the top, a couple of boxes on it
    k.boxB("wood", bodyW - 0.1, 0.03, Dp - 0.25, bx, 0.55, 0.1, wood);
    for (let i = 0; i < 3; i++)
      if (r() < 0.7)
        k.boxB(
          "plain",
          0.3,
          0.18,
          0.22,
          bx + (r() - 0.5) * (bodyW - 0.5),
          0.58,
          0.12,
          { color: 0x8a7050, ry: (r() - 0.5) * 0.4 },
        );
    // countertop clutter: wire rack of magazines/cigarettes, service bell, cans
    const rx0 = -W / 2 + 0.35;
    k.boxB("metal", 0.36, 0.02, 0.2, rx0, H, 0.18, { color: 0x3a3a38 });
    for (let t = 0; t < 3; t++)
      k.boxB(
        "plain",
        0.34,
        0.12,
        0.03,
        rx0,
        H + 0.02 + t * 0.07,
        0.12 + t * 0.06,
        { color: [0xc83028, 0xe0c040, 0x2a5a9a][t], rx: -0.35, grime: 0.4 },
      );
    k.cyl("metal", 0.045, 0.05, 0.015, -W / 2 + 0.12, H + 0.008, -0.22, {
      seg: 10,
      color: 0x2a2a28,
    });
    k.sphere("metal", 0.045, -W / 2 + 0.12, H + 0.015, -0.22, {
      color: C.chrome,
      wseg: 8,
      hseg: 4,
      phiLength: PI / 2,
    });
    for (let i = 0; i < 3; i++)
      if (r() < 0.6)
        k.cyl(
          "metal",
          0.033,
          0.033,
          0.12,
          cx + (r() - 0.5) * caseW * 0.6,
          H + 0.06,
          (r() - 0.5) * 0.3,
          { seg: 8, color: 0xa02820, rust: 0.5 },
        );
    k.meta.collider = { w: W + 0.06, d: Dp + 0.1, h: H };
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- campfire ----------------
  D("campfire", (k, r, v) => {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * X.TAU;
      k.cbox(
        "concrete",
        0.22,
        0.14,
        0.18,
        Math.cos(a) * 0.5,
        0.07,
        Math.sin(a) * 0.5,
        { ry: -a, bevel: 0.04, color: 0x8a8478 },
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * X.TAU;
      k.seg(
        "wood",
        [Math.cos(a) * 0.35, 0.03, Math.sin(a) * 0.35],
        [Math.cos(a) * 0.05, 0.25, Math.sin(a) * 0.05],
        0.045,
        { color: 0x3a2a1a, grime: 0.6 },
      );
    }
    k.cyl("glow", 0.3, 0.32, 0.02, 0, 0.02, 0, { seg: 10, color: 0xff5a1a });
    if (v === 1) {
      // cooking spit with meat
      for (const sx of [-0.6, 0.6]) {
        k.seg("wood", [sx, 0, -0.1], [sx, 0.8, 0], 0.02, { color: 0x5a4a38 });
        k.seg("wood", [sx, 0, 0.1], [sx, 0.8, 0], 0.02, { color: 0x5a4a38 });
      }
      k.seg("metal", [-0.7, 0.78, 0], [0.7, 0.78, 0], 0.012, {
        color: 0x3a3a34,
      });
      k.sphere("plain", 0.12, 0, 0.78, 0, {
        s: [1.6, 0.8, 0.8],
        color: 0x6a3a1a,
        wseg: 8,
        hseg: 5,
      });
    } else if (v === 2) {
      // cooking pot on a tripod
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * X.TAU;
        k.seg(
          "metal",
          [Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55],
          [0, 1.0, 0],
          0.015,
          { color: 0x3a3a34 },
        );
      }
      k.cyl("metal", 0.18, 0.14, 0.22, 0, 0.55, 0, {
        seg: 10,
        color: 0x2a2a28,
        rust: 0.4,
      });
    }
    k.meta.fires = [{ x: 0, y: 0.1, z: 0, scale: 0.8 }];
    k.meta.glows = [
      { x: 0, y: 0.45, z: 0, color: 0xff8a3a, size: 6, flicker: 0.25 },
    ];
    k.meta.tier = "small";
  });

  // ---------------- scrap shack ----------------
  // local: door opening at -z. variants change size & materials.
  D("shack", (k, r, v) => {
    const W = 3.2 + (v % 3) * 0.6,
      Dp = 2.8 + (v % 2) * 0.6,
      H = 2.5;
    const wood = { color: 0x6a5a44 };
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "wood",
          0.12,
          H + (sz > 0 ? 0 : 0.25),
          0.12,
          (sx * W) / 2,
          0,
          (sz * Dp) / 2,
          wood,
        );
    const panel = (x0, x1, z, rotY) => {
      let x = x0;
      while (x < x1 - 0.05) {
        const w = Math.min(x1 - x, 0.6 + r() * 0.6),
          h = H * (0.85 + r() * 0.15);
        const t = r();
        const mat = t < 0.6 ? "rust" : "wood";
        const col =
          mat === "rust"
            ? [0xffffff, 0xd0c0b0, 0xb8a898][(r() * 3) | 0]
            : [0x8a7a60, 0x6a5a48][(r() * 2) | 0];
        const cx = x + w / 2;
        if (rotY)
          k.box(mat, 0.04, h, w, z, h / 2, cx, {
            color: col,
            rx: (r() - 0.5) * 0.05,
            segs: [1, 1, 3],
            uvScale: 0.7,
          });
        else
          k.box(mat, w, h, 0.04, cx, h / 2, z, {
            color: col,
            rz: (r() - 0.5) * 0.05,
            segs: [3, 1, 1],
            uvScale: 0.7,
          });
        x += w * 0.9;
      }
    };
    panel(-W / 2, W / 2, Dp / 2, false); // back wall
    panel(-Dp / 2, Dp / 2, -W / 2, true); // left wall
    panel(-Dp / 2, Dp / 2, W / 2, true); // right wall
    panel(-W / 2, -0.55, -Dp / 2, false); // front left of door
    panel(0.55, W / 2, -Dp / 2, false); // front right of door
    k.box("wood", 1.2, 0.3, 0.05, 0, H - 0.1, -Dp / 2, wood); // lintel
    // sloped corrugated roof
    k.box("rust", W + 0.6, 0.04, Dp + 0.6, 0, H + 0.12, 0, {
      rx: -0.1,
      color: 0xc8b8a8,
      segs: [6, 1, 1],
      uvScale: 0.7,
    });
    // curtain in the doorway, a sign, a lantern
    k.box("fabric", 1.0, 1.7, 0.02, 0, 1.05, -Dp / 2 - 0.05, {
      color: [0x6a5a8a, 0x8a4a3a, 0x4a6a5a][v % 3],
    });
    if (r() < 0.6)
      k.quad(
        r() < 0.5 ? "sign_scrip" : "graffiti_" + ((r() * X.GRAFFITI) | 0),
        0.9,
        0.55,
        -W / 4 - 0.2,
        1.8,
        -Dp / 2 - 0.05,
        { ry: PI },
      );
    k.sphere("glow", 0.07, W / 2 - 0.3, H - 0.3, -Dp / 2 - 0.2, {
      color: C.bulbWarm,
      wseg: 6,
      hseg: 4,
    });
    k.meta.glows = [
      {
        x: W / 2 - 0.3,
        y: H - 0.3,
        z: -Dp / 2 - 0.25,
        color: 0xffc070,
        size: 3,
        flicker: 0.3,
      },
    ];
    // colliders: walls only (door gap)
    k.meta.colliders = [
      { w: W, d: 0.2, h: H, cz: Dp / 2 },
      { w: 0.2, d: Dp, h: H, cx: -W / 2 },
      { w: 0.2, d: Dp, h: H, cx: W / 2 },
      { w: W / 2 - 0.55, d: 0.2, h: H, cx: -(W / 4 + 0.275), cz: -Dp / 2 },
      { w: W / 2 - 0.55, d: 0.2, h: H, cx: W / 4 + 0.275, cz: -Dp / 2 },
      { w: W + 0.6, d: Dp + 0.6, h: 0.1, y0: H + 0.1 },
    ];
    k.meta.tier = "medium";
  });

  // ---------------- auto-turret (tripod "Mark II" style) ----------------
  // Split in two protos: base (static) and head (rotates, see spawn logic)
