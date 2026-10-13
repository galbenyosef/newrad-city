// play-inline-449 07 — color
// Lines 1876-2159 of readable/play-inline-449.pretty.js (statement-aligned).
  D("turret_base", (k, r, v) => {
    const o = { color: 0x5a5e56, rust: 0.3 };
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * X.TAU;
      k.seg(
        "metal",
        [Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6],
        [0, 0.9, 0],
        0.04,
        o,
      );
      k.box(
        "metal",
        0.14,
        0.03,
        0.14,
        Math.cos(a) * 0.6,
        0.015,
        Math.sin(a) * 0.6,
        o,
      );
    }
    k.cyl("metal", 0.14, 0.18, 0.3, 0, 0.95, 0, Object.assign({ seg: 10 }, o));
    k.cyl("metal", 0.2, 0.2, 0.06, 0, 1.12, 0, Object.assign({ seg: 12 }, o));
    k.meta.collider = { w: 0.8, d: 0.8, h: 1.2 };
    k.meta.tier = "small";
  });
  D("turret_head", (k, r, v) => {
    const o = { color: v === 1 ? 0x3a3a38 : 0x6a6e5a, rust: 0.25 };
    k.sphere(
      "metal",
      0.32,
      0,
      0.15,
      0,
      Object.assign({ s: [1, 0.72, 1.1], wseg: 12, hseg: 8 }, o),
    );
    k.cbox(
      "metal",
      0.5,
      0.18,
      0.34,
      0,
      0.0,
      0.1,
      Object.assign({ bevel: 0.04 }, o),
    );
    for (const sx of [-0.12, 0.12]) {
      k.cyl("metal", 0.045, 0.045, 0.7, sx, 0.12, -0.52, {
        rx: PI / 2,
        seg: 8,
        color: 0x2a2a28,
      });
      k.cyl("metal", 0.06, 0.06, 0.16, sx, 0.12, -0.84, {
        rx: PI / 2,
        seg: 8,
        color: 0x1a1a1a,
        open: true,
      });
    }
    k.cyl("glow", 0.06, 0.06, 0.02, 0, 0.3, -0.28, {
      rx: PI / 2 - 0.5,
      seg: 10,
      color: 0xff3020,
    }); // sensor eye
    k.box("metal", 0.2, 0.14, 0.2, 0.28, 0.02, 0.12, { color: C.armyGreen }); // ammo drum
    k.meta.tier = "small";
  });

  // ---------------- lamps (interior / settlement) ----------------
  // 0 floor lamp (lit), 1 desk lamp (lit), 2 hanging bulb (lit), 3 string lights post (lit), 4 lantern (lit), 5 street lamp (lit)
  D("lamp", (k, r, v) => {
    const glow = (x, y, z, s, col) => {
      (k.meta.glows = k.meta.glows || []).push({
        x,
        y,
        z,
        color: col || 0xffcf80,
        size: s,
        flicker: 0.1,
      });
    };
    if (v === 0) {
      k.cyl("metal", 0.18, 0.2, 0.04, 0, 0.02, 0, { seg: 10, color: 0x3a3a34 });
      k.cyl("metal", 0.015, 0.015, 1.5, 0, 0.77, 0, {
        seg: 6,
        color: C.chrome,
      });
      k.cyl("fabric", 0.14, 0.25, 0.32, 0, 1.55, 0, {
        seg: 12,
        open: true,
        color: 0xe8d8b0,
      });
      k.sphere("glow", 0.05, 0, 1.45, 0, {
        color: C.bulbWarm,
        wseg: 6,
        hseg: 4,
      });
      glow(0, 1.5, 0, 3.5);
    } else if (v === 1) {
      k.cyl("metal", 0.1, 0.12, 0.03, 0, 0.015, 0, {
        seg: 10,
        color: 0x2a4a3a,
      });
      k.seg("metal", [0, 0.02, 0], [0.05, 0.3, 0], 0.012, { color: 0x2a4a3a });
      k.seg("metal", [0.05, 0.3, 0], [0.0, 0.42, -0.15], 0.012, {
        color: 0x2a4a3a,
      });
      k.cyl("metal", 0.03, 0.1, 0.12, 0, 0.4, -0.18, {
        seg: 10,
        color: 0x2a4a3a,
        open: true,
        rx: 0.5,
      });
      k.sphere("glow", 0.03, 0, 0.37, -0.2, {
        color: C.bulbWarm,
        wseg: 5,
        hseg: 3,
      });
      glow(0, 0.35, -0.2, 1.5);
    } else if (v === 2) {
      k.seg("plain", [0, 3, 0], [0, 2.4, 0], 0.005, { color: 0x1a1a1a });
      k.sphere("glow", 0.05, 0, 2.35, 0, {
        color: C.bulbWarm,
        s: [1, 1.3, 1],
        wseg: 6,
        hseg: 4,
      });
      k.cyl("metal", 0.02, 0.2, 0.1, 0, 2.43, 0, {
        seg: 10,
        color: 0x5a5a52,
        open: true,
      });
      glow(0, 2.33, 0, 4);
    } else if (v === 3) {
      k.seg("wood", [0, 0, 0], [0, 3.2, 0], 0.05, { color: 0x5a4a38 });
      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        const x = -2.5 * t,
          y = 3.1 - Math.sin(t * PI) * 0.4,
          z = 0;
        k.sphere("glow", 0.04, x, y, z, {
          color: [0xffd080, 0xff8060, 0x80ff90, 0x80c0ff][i % 4],
          wseg: 5,
          hseg: 3,
        });
        glow(x, y, z, 1.2, [0xffd080, 0xff8060, 0x80ff90, 0x80c0ff][i % 4]);
      }
    } else if (v === 4) {
      k.cyl("metal", 0.08, 0.09, 0.03, 0, 0.015, 0, {
        seg: 8,
        color: 0x5a3a2a,
        rust: 0.4,
      });
      k.cyl("glass", 0.07, 0.07, 0.18, 0, 0.12, 0, { seg: 8, color: 0xd8c8a0 });
      k.cyl("metal", 0.04, 0.08, 0.05, 0, 0.23, 0, {
        seg: 8,
        color: 0x5a3a2a,
        rust: 0.4,
      });
      k.torus("metal", 0.05, 0.006, 0, 0.29, 0, {
        color: 0x3a3a34,
        tseg: 8,
        rseg: 3,
      });
      k.sphere("glow", 0.035, 0, 0.12, 0, {
        color: 0xffb050,
        wseg: 5,
        hseg: 3,
      });
      glow(0, 0.14, 0, 2.2, 0xffb060);
    }
    k.meta.tier = "small";
  });

  // ---------------- tables & chairs ----------------
  // table: 0 diner (formica, chrome), 1 wooden kitchen, 2 overturned wooden, 3 small round cafe
  D("table", (k, r, v) => {
    if (v === 0) {
      k.cbox("plain", 1.2, 0.05, 0.8, 0, 0.75, 0, {
        bevel: 0.02,
        color: 0xc8d8c8,
      });
      for (const sz of [-0.41, 0.41])
        k.box("metal", 1.22, 0.05, 0.02, 0, 0.75, sz, { color: C.chrome });
      k.cyl("metal", 0.04, 0.04, 0.73, 0, 0.37, 0, { seg: 8, color: C.chrome });
      k.cyl("metal", 0.25, 0.28, 0.03, 0, 0.015, 0, {
        seg: 12,
        color: C.chrome,
      });
      k.meta.collider = { w: 1.2, d: 0.8, h: 0.78 };
    } else if (v === 3) {
      k.cyl("wood", 0.4, 0.4, 0.04, 0, 0.72, 0, { seg: 14, color: 0x9a7a58 });
      k.cyl("metal", 0.03, 0.03, 0.7, 0, 0.36, 0, { seg: 6, color: 0x3a3a34 });
      k.cyl("metal", 0.22, 0.25, 0.03, 0, 0.015, 0, {
        seg: 10,
        color: 0x3a3a34,
      });
      k.meta.collider = { w: 0.8, d: 0.8, h: 0.75 };
    } else {
      const kk = v === 2 ? new X.Kit(101) : k;
      kk.boxB("wood", 1.4, 0.05, 0.85, 0, 0.72, 0, { color: 0x9a7a58 });
      for (const sx of [-0.62, 0.62])
        for (const sz of [-0.36, 0.36])
          kk.boxB("wood", 0.07, 0.72, 0.07, sx, 0, sz, { color: 0x7a5a40 });
      if (v === 2) {
        k.include(kk, { y: 0.45, z: 0.35, rx: PI / 2 + 0.05 });
        k.meta.collider = { w: 1.4, d: 0.8, h: 0.9 };
      } else k.meta.collider = { w: 1.4, d: 0.85, h: 0.77 };
    }
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });
  // chair: 0 diner chrome/vinyl, 1 wooden, 2 office swivel, 3 knocked-over wooden
  D("chair", (k, r, v) => {
    if (v === 0) {
      const vin = { color: [0xa02a2a, 0x2a6a6a, 0xd8c8a0][(r() * 3) | 0] };
      k.cbox(
        "fabric",
        0.45,
        0.08,
        0.45,
        0,
        0.46,
        0,
        Object.assign({ bevel: 0.03 }, vin),
      );
      k.cbox(
        "fabric",
        0.42,
        0.35,
        0.06,
        0,
        0.72,
        0.2,
        Object.assign({ bevel: 0.03, rx: -0.1 }, vin),
      );
      for (const sx of [-0.19, 0.19]) {
        k.seg("metal", [sx, 0, -0.2], [sx, 0.44, -0.18], 0.012, {
          color: C.chrome,
        });
        k.seg("metal", [sx, 0, 0.2], [sx, 0.9, 0.24], 0.012, {
          color: C.chrome,
        });
      }
    } else if (v === 2) {
      k.cbox("fabric", 0.5, 0.1, 0.48, 0, 0.5, 0, {
        bevel: 0.04,
        color: 0x3a3a34,
      });
      k.cbox("fabric", 0.46, 0.5, 0.08, 0, 0.85, 0.22, {
        bevel: 0.04,
        color: 0x3a3a34,
        rx: -0.12,
      });
      k.cyl("metal", 0.03, 0.03, 0.4, 0, 0.25, 0, { seg: 6, color: 0x5a5a52 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * X.TAU;
        k.seg(
          "metal",
          [0, 0.05, 0],
          [Math.cos(a) * 0.3, 0.04, Math.sin(a) * 0.3],
          0.015,
          { color: 0x3a3a34 },
        );
      }
    } else {
      const kk = v === 3 ? new X.Kit(111) : k;
      const w = { color: 0x8a6a48 };
      kk.boxB("wood", 0.44, 0.04, 0.42, 0, 0.44, 0, w);
      for (const sx of [-0.19, 0.19])
        for (const sz of [-0.18, 0.18])
          kk.boxB("wood", 0.04, 0.44, 0.04, sx, 0, sz, w);
      for (const sx of [-0.19, 0.19])
        kk.boxB("wood", 0.04, 0.5, 0.04, sx, 0.48, 0.18, w);
      for (let i = 0; i < 3; i++)
        kk.box("wood", 0.38, 0.05, 0.02, 0, 0.6 + i * 0.13, 0.18, w);
      if (v === 3) k.include(kk, { y: 0.21, rz: PI / 2 - 0.1, ry: r() });
    }
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- market stall ----------------
