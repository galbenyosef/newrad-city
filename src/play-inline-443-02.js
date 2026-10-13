// play-inline-443 02 — color
// Lines 290-597 of readable/play-inline-443.pretty.js (statement-aligned).
  D("rubble", (k, r, v) => {
    const R = [0.7, 1.1, 1.6, 1.0][v % 4],
      H = [0.28, 0.45, 0.62, 0.38][v % 4];
    const brick = v === 3;
    mound(
      k,
      r,
      R,
      H,
      brick ? 0x6a5a4c : RUBBLE_C[(r() * RUBBLE_C.length) | 0],
      r() * 9,
      r() * 9,
    );
    // chunks on and around the mound
    const n = [7, 11, 16, 8][v % 4];
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * R * 1.05,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d * 0.8;
      const hy = Math.max(0, H * (1 - (d / R) * (d / R))) * 0.85;
      const sz = 0.12 + r() * (v >= 2 ? 0.45 : 0.3);
      const co = {
        ry: r() * 3,
        rx: (r() - 0.5) * 0.8,
        rz: (r() - 0.5) * 0.8,
        bevel: 0.03,
        color: RUBBLE_C[(r() * RUBBLE_C.length) | 0],
        grime: 0.35,
      };
      // only the big lumps get chamfered edges; small ones are plain boxes (12 tris)
      if (sz > 0.3)
        k.cbox(
          "concrete",
          sz * (1 + r()),
          sz * (0.4 + r() * 0.5),
          sz * (0.8 + r() * 0.6),
          x,
          hy + sz * 0.2,
          z,
          co,
        );
      else
        k.box(
          "concrete",
          sz * (1 + r()),
          sz * (0.4 + r() * 0.5),
          sz * (0.8 + r() * 0.6),
          x,
          hy + sz * 0.2,
          z,
          co,
        );
    }
    // bricks (loose and still-mortared clumps)
    for (let i = 0, nb = brick ? 14 : 4 + v; i < nb; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * R * 1.15,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d * 0.8;
      const hy = Math.max(0, H * (1 - (d / R) * (d / R))) * 0.9;
      k.box("concrete", 0.2, 0.06, 0.1, x, hy + 0.03, z, {
        ry: r() * 3,
        rx: (r() - 0.5) * 0.6,
        rz: (r() - 0.5) * 0.6,
        color: BRICK_C[(r() * BRICK_C.length) | 0],
        grime: 0.3,
      });
    }
    // a broken floor slab tilted into the heap, rebar sticking out
    if (v >= 1) {
      const sw = 0.9 + r() * 0.8,
        sa = r() * X.TAU;
      k.box(
        "concrete",
        sw,
        0.12,
        0.7 + r() * 0.5,
        Math.cos(sa) * R * 0.35,
        H * 0.6,
        Math.sin(sa) * R * 0.3,
        {
          ry: sa,
          rz: 0.35 + r() * 0.3,
          color: 0x9a9486,
          grime: 0.4,
          segs: [2, 1, 1],
        },
      );
    }
    for (let i = 0, nr = 2 + v; i < nr; i++) {
      const a = r() * X.TAU,
        d = r() * R * 0.6,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d * 0.8;
      const y0 = H * 0.6,
        len = 0.5 + r() * 0.9;
      k.seg(
        "rust",
        [x, y0, z],
        [
          x + (r() - 0.5) * len,
          y0 + 0.25 + r() * len * 0.6,
          z + (r() - 0.5) * len,
        ],
        0.011,
        { color: 0xb09080, seg: 4 },
      );
      if (r() < 0.5)
        k.seg(
          "rust",
          [x, y0 + 0.2, z],
          [x + (r() - 0.5) * 0.5, y0 + 0.5 + r() * 0.3, z + (r() - 0.5) * 0.5],
          0.009,
          { color: 0xb09080, seg: 4 },
        );
    }
    // snapped timber / a bit of window frame
    if (r() < 0.6)
      k.box(
        "wood",
        1.0 + r() * 0.8,
        0.1,
        0.12,
        (r() - 0.5) * R,
        H * 0.5,
        (r() - 0.5) * R * 0.6,
        { ry: r() * 3, rz: (r() - 0.5) * 0.5, color: 0x5a4a38, grime: 0.5 },
      );
    // dust fan on the ground
    k.cyl("concrete", R * 1.35, R * 1.45, 0.02, 0, 0.01, 0, {
      seg: 12,
      color: brick ? 0x6a584a : 0x8a8476,
      grime: 0.5,
      s: [1, 1, 0.8],
      ao: [1, 1],
    });
    if (v === 2) k.meta.collider = { w: R * 1.3, d: R * 1.0, h: 0.42 };
    k.meta.surface = "concrete";
    k.meta.tier = v === 2 ? "medium" : "small";
  });

  // ---------------- tires ----------------
  D("tire", (k, r, v) => {
    const t = { color: C.rubber, grime: 0.25, rseg: 7, tseg: 14 };
    if (v === 0) {
      k.torus("plain", 0.3, 0.12, 0, 0.12, 0, Object.assign({ rx: PI / 2 }, t));
      k.cyl("metal", 0.2, 0.2, 0.1, 0, 0.12, 0, {
        seg: 10,
        color: 0x5a5a52,
        rust: 0.7,
      });
    } else if (v === 1) {
      // stack
      const n = 3 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++)
        k.torus(
          "plain",
          0.3,
          0.12,
          (r() - 0.5) * 0.08,
          0.12 + i * 0.22,
          (r() - 0.5) * 0.08,
          Object.assign({ rx: PI / 2 }, t),
        );
      k.meta.collider = { w: 0.8, d: 0.8, h: n * 0.22 };
    } else {
      // leaning tire
      k.torus(
        "plain",
        0.33,
        0.12,
        0,
        0.4,
        0,
        Object.assign({ rx: 0.25, ry: r() * 3 }, t),
      );
    }
    k.meta.tier = "small";
  });

  // ---------------- oil drums ----------------
  // variants: 0 rusty, 1 radioactive (glowing leak), 2 red flammable, 3 burning (hobo barrel), 4 blue chem, 5 tipped rusty
  D("barrel", (k, r, v) => {
    const cols = [0x6a5a48, 0xc8a020, 0xa81a14, 0x4a4238, 0x2a4a7a, 0x6a5a48];
    const tipped = v === 5 || (v === 1 && r() < 0.3);
    const kk = tipped ? new X.Kit(33) : k;
    const o = {
      color: cols[v],
      rust: v === 3 ? 0.85 : 0.45 + r() * 0.3,
      flat: false,
    };
    kk.cyl(
      "metal",
      0.29,
      0.29,
      0.88,
      0,
      0.44,
      0,
      Object.assign({ seg: 14, open: v === 3 }, o),
    );
    for (const y of [0.3, 0.6])
      kk.torus(
        "metal",
        0.295,
        0.018,
        0,
        y,
        0,
        Object.assign({ rx: PI / 2, tseg: 14, rseg: 3 }, o),
      );
    kk.torus(
      "metal",
      0.285,
      0.02,
      0,
      0.875,
      0,
      Object.assign({ rx: PI / 2, tseg: 14, rseg: 3 }, o),
    );
    if (v !== 3)
      kk.cyl(
        "metal",
        0.27,
        0.27,
        0.02,
        0,
        0.87,
        0,
        Object.assign({ seg: 14 }, o),
      );
    else {
      kk.cyl(
        "metal",
        0.27,
        0.27,
        0.02,
        0,
        0.1,
        0,
        Object.assign({ seg: 14 }, o),
      );
      kk.box("wood", 0.4, 0.06, 0.06, 0.05, 0.84, 0.03, {
        rz: 0.4,
        color: 0x2a1a10,
      });
    }
    if (v === 1) kk.quad("rad_label", 0.32, 0.32, 0, 0.45, -0.292, { ry: PI });
    if (v === 2) kk.quad("flam_label", 0.32, 0.32, 0, 0.45, -0.292, { ry: PI });
    if (v === 3)
      for (let i = 0; i < 5; i++) {
        const a = r() * X.TAU;
        kk.cyl(
          "glow",
          0.03,
          0.03,
          0.02,
          Math.cos(a) * 0.29,
          0.2 + r() * 0.4,
          Math.sin(a) * 0.29,
          { rz: PI / 2, ry: -a, seg: 5, color: 0xff7a2a },
        );
      }
    if (tipped) k.include(kk, { y: 0.29, rx: PI / 2, ry: r() * 6 });
    if (v === 1) {
      // glowing green sludge puddle
      k.cyl(
        "glow",
        0.35 + r() * 0.3,
        0.4 + r() * 0.3,
        0.015,
        tipped ? 0.6 : 0.3,
        0.008,
        tipped ? 0.2 : -0.35,
        { seg: 12, color: 0x46c81e, s: [1, 1, 0.7], grime: 0.5, noiseScale: 6 },
      );
      k.meta.glows = [
        { x: 0.3, y: 0.25, z: -0.3, color: 0x50e028, size: 2.4, flicker: 0 },
      ];
      k.meta.radiation = { y: 0.5, radius: 5, strength: 3.5 };
    }
    if (v === 3) {
      k.meta.fires = [{ x: 0, y: 0.8, z: 0, scale: 0.75 }];
      k.meta.glows = [
        { x: 0, y: 1.1, z: 0, color: 0xff8a3a, size: 5, flicker: 0.25 },
      ];
    }
    if (v === 2) k.meta.explosive = { hp: 18, radius: 4.5, damage: 70 };
    k.meta.collider = tipped
      ? { w: 0.9, d: 0.6, h: 0.58 }
      : { w: 0.6, d: 0.6, h: 0.9 };
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ---------------- sandbags ----------------
  function sandbag(k, r, x, y, z, ry) {
    k.sphere("fabric", 0.32, x, y + 0.1, z, {
      s: [1, 0.34, 0.58],
      ry: ry + (r() - 0.5) * 0.15,
      color: [0xa89870, 0x9a8a62, 0x8a7c58][(r() * 3) | 0],
      wseg: 8,
      hseg: 5,
      grime: 0.25,
    });
  }
  // variant 0: straight 2 m x 3 rows, 1: curved quarter-circle, 2: low 2 rows, 3: tall 4 rows (bunker)
