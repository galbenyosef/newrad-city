// play-inline-449 02 — color
// Lines 234-558 of readable/play-inline-449.pretty.js (statement-aligned).
  D("safe", (k, r, v) => {
    const o = { color: v === 1 ? 0x344434 : 0x363634, rust: 0.22, grime: 0.3 };
    const W = v === 2 ? 0.55 : 0.8,
      H = v === 2 ? 0.55 : 1.0,
      Dp = v === 2 ? 0.45 : 0.75;
    const y0 = v === 2 ? 1.1 : 0.08;
    const cy = y0 + H / 2,
      fz = -Dp / 2;
    const chrome = { color: 0xb8b4a4, rust: 0.15 },
      blk = { color: 0x151514 };
    if (v !== 2) {
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          k.cyl(
            "metal",
            0.05,
            0.06,
            0.08,
            sx * (W / 2 - 0.08),
            0.04,
            sz * (Dp / 2 - 0.08),
            { seg: 8, color: 0x1a1a1a },
          );
      k.box("metal", W + 0.02, 0.05, Dp + 0.02, 0, y0 + 0.02, 0, o); // plinth band
      k.box("metal", W + 0.02, 0.05, Dp + 0.02, 0, y0 + H - 0.02, 0, o); // cornice band
    } else {
      k.box("metal", W + 0.12, H + 0.12, 0.04, 0, cy, fz - 0.005, {
        color: 0x4a4a46,
        rust: 0.3,
      }); // wall frame
    }
    k.cbox("metal", W, H, Dp, 0, cy, 0, Object.assign({ bevel: 0.035 }, o));
    // door: raised frame round a recessed panel
    const dw = W - 0.1,
      dh = H - 0.12;
    k.box("metal", dw, dh, 0.03, 0, cy, fz - 0.015, o);
    k.box("metal", dw - 0.1, dh - 0.1, 0.012, 0, cy, fz - 0.034, {
      color: v === 1 ? 0x2c3a2c : 0x2e2e2c,
      rust: 0.2,
    });
    for (const [x, y] of [
      [-dw / 2 + 0.03, cy],
      [dw / 2 - 0.03, cy],
    ])
      k.box("metal", 0.02, dh, 0.015, x, y, fz - 0.035, o);
    // hinge knuckles (right)
    for (const hy of [0.22, 0.78])
      k.cyl(
        "metal",
        0.028,
        0.028,
        0.14,
        dw / 2 + 0.02,
        y0 + H * hy,
        fz - 0.02,
        { seg: 8, color: 0x5a5a54 },
      );
    // combination dial: chrome ring + printed dial + centre knob
    const dy = cy + H * 0.12;
    k.torus(
      "metal",
      0.1,
      0.014,
      -0.02,
      dy,
      fz - 0.045,
      Object.assign({ rseg: 4, tseg: 16 }, chrome),
    );
    k.quad("safe_dial", 0.19, 0.19, -0.02, dy, fz - 0.043, {
      ry: PI,
      ao: [1, 1],
    });
    k.cyl(
      "metal",
      0.03,
      0.035,
      0.04,
      -0.02,
      dy,
      fz - 0.06,
      Object.assign({ rx: PI / 2, seg: 10 }, chrome),
    );
    // three-spoke handle wheel
    const hx = -0.02,
      hy2 = cy - H * 0.18;
    k.cyl(
      "metal",
      0.025,
      0.025,
      0.08,
      hx,
      hy2,
      fz - 0.07,
      Object.assign({ rx: PI / 2, seg: 8 }, chrome),
    );
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3 + 0.4,
        ex = hx + Math.cos(a) * 0.1,
        ey = hy2 + Math.sin(a) * 0.1;
      k.seg("metal", [hx, hy2, fz - 0.1], [ex, ey, fz - 0.1], 0.011, chrome);
      k.sphere(
        "metal",
        0.02,
        ex,
        ey,
        fz - 0.1,
        Object.assign({ wseg: 6, hseg: 4 }, chrome),
      );
    }
    // keyhole escutcheon + gilt maker's line
    k.box("metal", 0.04, 0.06, 0.01, dw / 2 - 0.12, cy - H * 0.05, fz - 0.042, {
      color: 0xa08a4a,
    });
    k.box(
      "metal",
      0.01,
      0.025,
      0.012,
      dw / 2 - 0.12,
      cy - H * 0.05,
      fz - 0.046,
      blk,
    );
    if (v !== 2)
      k.quad("white", 0.34, 0.035, 0, y0 + H - 0.1, fz - 0.036, {
        ry: PI,
        color: 0xc8a040,
      });
    // rivet rows on the sides
    if (v !== 2)
      for (const sx of [-1, 1])
        for (let i = 0; i < 4; i++)
          k.sphere(
            "metal",
            0.012,
            sx * (W / 2 + 0.002),
            y0 + 0.12 + (i * (H - 0.24)) / 3,
            fz + 0.06,
            { wseg: 4, hseg: 3, color: 0x2a2a28 },
          );
    k.meta.collider = { w: W, d: Dp, h: y0 + H };
    k.meta.container = { name: "Safe", loot: "safe" };
    k.meta.interactY = y0 + H * 0.6;
    k.meta.tier = "small";
  });

  // ---------------- ammo box ----------------
  D("ammo_box", (k, r, v) => {
    const o = { color: C.armyGreen, rust: 0.3 };
    const L = v === 1 ? 0.9 : 0.5;
    k.cbox(
      "metal",
      L,
      0.3,
      0.26,
      0,
      0.15,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.cbox(
      "metal",
      L + 0.02,
      0.05,
      0.28,
      0,
      0.31,
      0,
      Object.assign({ bevel: 0.015 }, o),
    );
    k.seg("metal", [-0.08, 0.34, 0], [0.08, 0.34, 0], 0.012, {
      color: 0x3a3a34,
    });
    k.quad("ammo_stencil", L * 0.8, 0.2, 0, 0.16, -0.132, { ry: PI });
    k.meta.collider = { w: L, d: 0.3, h: 0.35 };
    k.meta.container = { name: "Ammo Box", loot: "ammo_box" };
    k.meta.interactY = 0.3;
    k.meta.tier = "small";
  });

  // ---------------- first aid box (wall mounted, y ~1.4) ----------------
  D("first_aid", (k, r, v) => {
    // FO3 first aid box: enamelled white steel, a lid with a raised lip hinged along the top, two spring
    // latches, a carry handle, the red cross and a stencilled label; v1 lies on the floor
    const y = v === 1 ? 0.12 : 1.4;
    const wh = { color: 0xe6e2d4, rust: 0.18, grime: 0.3 };
    k.cbox(
      "metal",
      0.45,
      0.35,
      0.1,
      0,
      y,
      0.02,
      Object.assign({ bevel: 0.025 }, wh),
    ); // body
    k.cbox(
      "metal",
      0.47,
      0.37,
      0.05,
      0,
      y,
      -0.05,
      Object.assign({ bevel: 0.02 }, wh),
    ); // lid
    k.box("metal", 0.43, 0.012, 0.04, 0, y + 0.19, -0.05, { color: 0x8a8a80 }); // piano hinge
    k.quad("firstaid", 0.2, 0.2, 0, y + 0.03, -0.077, { ry: PI });
    k.box("metal", 0.24, 0.03, 0.005, 0, y - 0.11, -0.077, { color: 0xa81a14 }); // FIRST AID band
    for (const sx of [-1, 1]) {
      k.box("metal", 0.05, 0.035, 0.03, sx * 0.17, y - 0.19, -0.05, {
        color: C.chrome,
      }); // latches
      k.box("metal", 0.03, 0.05, 0.012, sx * 0.17, y - 0.165, -0.078, {
        color: C.chrome,
      });
    }
    k.seg("metal", [-0.07, y - 0.19, -0.02], [0.07, y - 0.19, -0.02], 0.009, {
      color: 0x3a3a34,
    }); // handle
    k.meta.container = { name: "First Aid Box", loot: "first_aid" };
    k.meta.interactY = y;
    k.meta.tier = "small";
  });

  // ---------------- rounded 1950s fridge ----------------
  D("fridge", (k, r, v) => {
    const o = {
      color: [0xe8e0d0, 0x9ac8c0, 0xe0c0b8][v % 3],
      rust: 0.35 + r() * 0.2,
    };
    k.cbox(
      "metal",
      0.8,
      1.65,
      0.72,
      0,
      0.9,
      0,
      Object.assign({ bevel: 0.1 }, o),
    );
    k.cyl(
      "metal",
      0.36,
      0.36,
      0.8,
      0,
      1.68,
      0,
      Object.assign(
        { rz: PI / 2, seg: 12, thetaLength: PI, s: [0.3, 1, 1] },
        o,
      ),
    );
    k.box("metal", 0.72, 0.02, 0.02, 0, 1.25, -0.37, { color: 0x6a6a60 }); // door seam
    k.cbox("metal", 0.06, 0.3, 0.06, 0.3, 1.1, -0.39, {
      color: C.chrome,
      bevel: 0.02,
    });
    k.quad("white", 0.3, 0.05, 0, 1.55, -0.365, { ry: PI, color: 0xa8a8a0 }); // brand plate
    k.boxB("metal", 0.76, 0.08, 0.68, 0, 0, 0, { color: 0x2a2a28 });
    k.meta.collider = { w: 0.8, d: 0.74, h: 1.85 };
    k.meta.container = { name: "Refrigerator", loot: "fridge" };
    k.meta.interactY = 1.1;
    k.meta.tier = "small";
  });

  // ---------------- steel office desk ----------------
  D("desk", (k, r, v) => {
    const o = { color: [0x6a6e66, 0x5a6a5a, 0x7a7266][v % 3], rust: 0.25 };
    k.cbox(
      "metal",
      1.5,
      0.05,
      0.78,
      0,
      0.76,
      0,
      Object.assign({ bevel: 0.015 }, o),
    );
    k.boxB("metal", 0.45, 0.72, 0.72, 0.5, 0.02, 0, o); // drawer pedestal
    k.boxB("metal", 0.04, 0.72, 0.72, -0.72, 0.02, 0, o);
    k.boxB("metal", 1.0, 0.45, 0.03, -0.2, 0.28, 0.34, o); // modesty panel
    for (let i = 0; i < 3; i++) {
      k.box("metal", 0.41, 0.2, 0.02, 0.5, 0.64 - i * 0.23, -0.37, {
        color: 0x5a5e56,
        rust: 0.2,
      });
      k.box("metal", 0.12, 0.025, 0.03, 0.5, 0.67 - i * 0.23, -0.39, {
        color: C.chrome,
      });
    }
    // desk clutter: papers, a mug, a pencil cup, maybe a phone
    for (let i = 0; i < 3; i++)
      k.quad(
        "paper",
        0.2,
        0.28,
        (r() - 0.5) * 1.0,
        0.788 + i * 0.002,
        (r() - 0.5) * 0.4,
        { rx: -PI / 2, rz: r() * 0.8, color: 0xe8e0cc },
      );
    k.cyl("plain", 0.04, 0.035, 0.1, -0.55, 0.84, -0.15, {
      seg: 8,
      color: 0xd8d0c0,
    });
    if (r() < 0.5) {
      k.cbox("plain", 0.22, 0.1, 0.18, 0.45, 0.84, 0.15, {
        color: 0x1a1a1a,
        bevel: 0.03,
      });
      k.box("plain", 0.22, 0.05, 0.05, 0.45, 0.91, 0.15, {
        color: 0x1a1a1a,
        rz: 0.1,
      });
    }
    k.meta.collider = { w: 1.5, d: 0.8, h: 0.8 };
    k.meta.container = { name: "Desk", loot: "desk" };
    k.meta.interactY = 0.7;
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ---------------- filing cabinet ----------------
