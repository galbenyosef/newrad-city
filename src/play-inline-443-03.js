// play-inline-443 03 — color
// Lines 598-899 of readable/play-inline-443.pretty.js (statement-aligned).
  D("sandbags", (k, r, v) => {
    const rows = v === 2 ? 3 : v === 3 ? 6 : 4;
    if (v === 1) {
      const R = 1.6;
      for (let row = 0; row < rows; row++)
        for (let i = 0; i < 6; i++) {
          const a = ((i + (row % 2) * 0.5) / 6) * (PI / 2);
          sandbag(
            k,
            r,
            Math.cos(a) * R - R / 2,
            row * 0.17,
            -Math.sin(a) * R + R / 2,
            -a + PI / 2,
          );
        }
      k.meta.collider = { w: 1.8, d: 1.8, h: rows * 0.17 + 0.1 };
    } else {
      for (let row = 0; row < rows; row++)
        for (let i = 0; i < 4; i++)
          sandbag(
            k,
            r,
            -0.75 + i * 0.52 - (row % 2) * 0.26 + 0.13,
            row * 0.19,
            (r() - 0.5) * 0.04,
            0,
          );
      for (let row = 0; row < Math.min(2, rows - 1); row++)
        for (let i = 0; i < 4; i++)
          sandbag(
            k,
            r,
            -0.75 + i * 0.52 - (row % 2) * 0.26 + 0.13,
            row * 0.19,
            0.32,
            0,
          );
      k.meta.collider = { w: 2.1, d: 0.75, h: rows * 0.19 + 0.1, cz: 0.12 };
    }
    k.meta.surface = "dirt";
    k.meta.tier = "medium";
  });

  // ---------------- jersey barrier ----------------
  const JERSEY = [
    [-0.3, 0],
    [0.3, 0],
    [0.3, 0.08],
    [0.2, 0.33],
    [0.1, 0.81],
    [-0.1, 0.81],
    [-0.2, 0.33],
    [-0.3, 0.08],
  ];
  D("jersey_barrier", (k, r, v) => {
    const L = 3;
    k.extrude("concrete", JERSEY, L, {
      ry: PI / 2,
      color: v === 1 ? 0xd8c8a0 : 0xbab4a6,
      grime: 0.3,
      uvScale: 0.8,
    });
    // chipped corners, rebar
    if (r() < 0.6)
      k.seg("rust", [L / 2 - 0.05, 0.4, 0], [L / 2 + 0.15, 0.55, 0.05], 0.012, {
        color: 0xffffff,
      });
    if (v === 1) {
      // orange-striped construction barrier
      for (let i = 0; i < 3; i++)
        k.box("plain", 0.3, 0.12, 0.62, -L / 2 + 0.5 + i * 1, 0.55, 0, {
          rz: 0.6,
          color: 0xc86a1a,
          s: [1, 1, 0.6],
          ao: [1, 1],
        });
    }
    if (v === 2)
      k.quad(
        "graffiti_" + ((r() * X.GRAFFITI) | 0),
        2.6,
        0.55,
        0,
        0.42,
        -0.24,
        { ry: PI, rx: 0.12, color: 0xffffff },
      );
    k.meta.collider = { w: L, d: 0.6, h: 0.82 };
    k.meta.tier = "medium";
  });

  // ---------------- police sawhorse / wooden barricade ----------------
  D("sawhorse", (k, r, v) => {
    const L = 2.2;
    for (const sx of [-1, 1]) {
      k.seg("wood", [sx * L * 0.42, 0, -0.35], [sx * L * 0.42, 1.0, 0], 0.04, {
        color: 0x8a8070,
      });
      k.seg("wood", [sx * L * 0.42, 0, 0.35], [sx * L * 0.42, 1.0, 0], 0.04, {
        color: 0x8a8070,
      });
    }
    // striped boards (orange/white or blue "POLICE LINE")
    const n = v === 1 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      k.box("wood", L, 0.22, 0.04, 0, 0.9 - i * 0.35, -0.02, {
        color: 0xffffff,
        colorFn:
          v === 2
            ? () => 0x2a3a7a
            : (x) => (Math.floor((x + 5) * 2.5) % 2 ? 0xd8d0c0 : 0xc85a1a),
        rz: v === 2 ? 0 : (r() - 0.5) * 0.1,
      });
    }
    if (v === 2) k.quad("police_door", 1.2, 0.22, 0, 0.9, -0.05, { ry: PI });
    k.meta.collider = { w: L, d: 0.6, h: 1.0 };
    k.meta.tier = "small";
  });
  D("traffic_cone", (k, r, v) => {
    const tipped = v === 1;
    const kk = tipped ? new X.Kit(41) : k;
    kk.box("plain", 0.38, 0.03, 0.38, 0, 0.015, 0, { color: 0x2a2a2a });
    kk.cyl("plain", 0.03, 0.15, 0.68, 0, 0.36, 0, {
      seg: 10,
      color: 0xd8601a,
      colorFn: (x, y) => (y > 0.38 && y < 0.5 ? 0xe8e0d0 : 0xc8581a),
    });
    if (tipped) k.include(kk, { y: 0.15, rx: PI / 2 - 0.2, ry: r() * 6 });
    k.meta.tier = "small";
  });

  // ---------------- raider scrap wall & skull pikes ----------------
  D("raider_wall", (k, r, v) => {
    const W = 3.6,
      H = 2.4 + r() * 0.6;
    // posts
    for (const px of [-W / 2, 0, W / 2])
      k.seg(
        "wood",
        [px, 0, 0.1],
        [px + (r() - 0.5) * 0.2, H + 0.3, 0.1],
        0.08,
        { color: 0x5a4a38 },
      );
    // corrugated sheets + car doors + plywood
    let x = -W / 2;
    while (x < W / 2 - 0.1) {
      const w = 0.7 + r() * 0.7,
        h = H * (0.7 + r() * 0.35);
      const pick = r();
      const cx = Math.min(W / 2, x + w / 2);
      if (pick < 0.55)
        k.box("rust", w, h, 0.04, cx, h / 2 + 0.05, 0, {
          rz: (r() - 0.5) * 0.08,
          segs: [4, 1, 1],
          color: [0xffffff, 0xd8c8b8, 0xc0b0a0][(r() * 3) | 0],
          uvScale: 0.7,
        });
      else if (pick < 0.8)
        k.box("wood", w, h, 0.05, cx, h / 2 + 0.05, -0.03, {
          rz: (r() - 0.5) * 0.1,
          color: 0x8a7a60,
        });
      else
        k.cbox("paint", w, h * 0.5, 0.08, cx, h * 0.3, -0.04, {
          bevel: 0.05,
          color: [0x6a8a8a, 0xb08a6a, 0x8a4a3a][(r() * 3) | 0],
          rust: 0.6,
        }); // car door / hood
      x += w * 0.85;
    }
    // top spikes & barbed wire
    for (let i = 0; i < 7; i++) {
      const sx = -W / 2 + ((i + 0.5) * W) / 7;
      k.seg(
        "metal",
        [sx, H * 0.9, -0.02],
        [sx + (r() - 0.5) * 0.3, H + 0.35 + r() * 0.3, -0.05],
        0.02,
        { r2: 0.002, color: 0x5a5048, rust: 0.8 },
      );
    }
    for (let i = 0; i < 10; i++)
      k.torus("metal", 0.18, 0.006, -W / 2 + ((i + 0.5) * W) / 10, H + 0.1, 0, {
        ry: PI / 2 + 0.3,
        color: 0x5a5a52,
        rust: 0.6,
        tseg: 8,
        rseg: 3,
      });
    // painted warning / graffiti
    if (r() < 0.5)
      k.quad("sign_keepout", 0.8, 0.6, (r() - 0.5) * 1.5, 1.5, -0.08, {
        ry: PI,
        rz: (r() - 0.5) * 0.2,
      });
    else
      k.quad("graffiti_" + ((r() * X.GRAFFITI) | 0), 2.2, 1.1, 0, 1.2, -0.07, {
        ry: PI,
      });
    // tire at the base
    if (r() < 0.6)
      k.torus("plain", 0.3, 0.12, (r() - 0.5) * 2, 0.35, -0.3, {
        rx: 0.2,
        color: C.rubber,
        rseg: 6,
        tseg: 12,
      });
    k.meta.collider = { w: W + 0.2, d: 0.35, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });
  function skull(k, x, y, z, s, o) {
    o = o || {};
    const bone = { color: C.bone, grime: 0.35, wseg: 8, hseg: 6 };
    k.sphere(
      "plain",
      0.1 * s,
      x,
      y + 0.02 * s,
      z,
      Object.assign({ s: [0.9, 1, 1.12], ry: o.ry || 0, rx: o.rx || 0 }, bone),
    );
    k.box(
      "plain",
      0.12 * s,
      0.05 * s,
      0.1 * s,
      x,
      y - 0.07 * s,
      z - 0.04 * s,
      Object.assign({ ry: o.ry || 0 }, bone),
    );
    // eye sockets (dark)
    const fy = Math.cos(o.ry || 0),
      fx = Math.sin(o.ry || 0);
    for (const s2 of [-1, 1])
      k.sphere(
        "plain",
        0.025 * s,
        x - fx * 0.09 * s + fy * s2 * 0.035 * s,
        y + 0.01 * s,
        z - fy * 0.09 * s - fx * s2 * 0.035 * s,
        { color: 0x1a1410, wseg: 5, hseg: 4 },
      );
  }
  X.skull = skull;
  D("skull_pike", (k, r, v) => {
    k.seg(
      "wood",
      [0, 0, 0],
      [(r() - 0.5) * 0.2, 2.1, (r() - 0.5) * 0.2],
      0.035,
      { color: 0x5a4a38 },
    );
    skull(k, 0, 2.15, 0, 1.1, { ry: PI + (r() - 0.5) });
    if (r() < 0.6)
      k.box("fabric", 0.3, 0.6, 0.01, 0.05, 1.6, 0.05, {
        rz: 0.1,
        color: 0x6a5a48,
      }); // tattered rag
    k.meta.tier = "small";
  });
  // Brute "meat bag" hanging from a chain on a pole
  D("gore_bag", (k, r) => {
    k.seg("metal", [0, 0, 0], [0, 3.2, 0], 0.06, {
      color: 0x4a4038,
      rust: 0.8,
    });
    k.seg("metal", [0, 3.1, 0], [0, 3.1, -1.1], 0.04, {
      color: 0x4a4038,
      rust: 0.8,
    });
    for (let i = 0; i < 6; i++)
      k.torus("metal", 0.04, 0.008, 0, 3.05 - i * 0.07, -1.05, {
        ry: i % 2 ? PI / 2 : 0,
        color: 0x3a3430,
        rust: 0.8,
        tseg: 6,
        rseg: 3,
      });
    k.sphere("fabric", 0.35, 0, 2.2, -1.05, {
      s: [0.85, 1.4, 0.85],
      color: 0x6a3a28,
      wseg: 8,
      hseg: 7,
      grime: 0.5,
    });
    k.sphere("plain", 0.2, 0.08, 1.8, -1.05, {
      color: 0x5a1a14,
      wseg: 6,
      hseg: 5,
    });
    k.cyl("glow", 0.35, 0.35, 0.005, 0, 0.005, -1.05, {
      seg: 10,
      color: 0x3a0a08,
    }); // dark stain on ground
    k.meta.tier = "small";
  });

  // ---------------- shopping cart ----------------
