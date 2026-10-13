// play-inline-172 04 — yaw
// Lines 650-980 of readable/play-inline-172.pretty.js (statement-aligned).
  K.roofKit = function (b, x0, z0, x1, z1, y, seed, o) {
    o = o || {};
    const r = K.rng(seed || 7),
      m = o.margin || 1.6;
    const W = x1 - x0 - 2 * m,
      D = z1 - z0 - 2 * m;
    if (W < 4 || D < 4) return;
    const at = (fx, fz) => [x0 + m + W * fx, z0 + m + D * fz];
    // tar patches (dark, slightly raised so they never z-fight the roof)
    for (let i = 0; i < 5; i++) {
      const p = at(r(), r());
      b.box(
        "slate",
        p[0],
        y + 0.015,
        p[1],
        1.5 + r() * 3,
        0.01,
        1 + r() * 2.5,
        { faces: "t", yaw: r() * PI, tint: 0x2a2a28, grime: 0.2 },
      );
    }
    if (o.tower !== false) {
      const p = at(0.25 + r() * 0.5, 0.2 + r() * 0.2);
      K.waterTower(b, p[0], y, p[1], {
        r: 1.8 + r() * 0.5,
        lean: r() < 0.3 ? 0.35 : 0,
        broken: r() < 0.5,
      });
    }
    if (o.bulkhead !== false) {
      // stair bulkhead with a door
      const p = at(0.1 + r() * 0.2, 0.65 + r() * 0.25);
      b.box("brick_brown", p[0], y, p[1], 3.2, 3.0, 2.6, { tint: 0x8a6a54 });
      b.box("slate", p[0], y + 3.0, p[1], 3.5, 0.2, 2.9, {
        faces: "nsewtb",
        tint: 0x3a3a38,
      });
      b.box("rust", p[0] + 0.5, y, p[1] + 1.31, 1.0, 2.1, 0.05, {
        tint: 0x5a4a3a,
      });
    }
    const n = o.n || 4;
    for (let i = 0; i < n; i++) {
      // HVAC housings with fan grilles
      const p = at(0.5 + r() * 0.45, r()),
        w = 1.4 + r() * 1.4,
        d = 1.2 + r(),
        h = 1.0 + r() * 0.8,
        yaw = Math.round(r() * 2) * HP;
      b.box("metal", p[0], y, p[1], w, h, d, { yaw, tint: 0x8a8a80 });
      b.cyl(
        "black_metal",
        p[0],
        y + h,
        p[1],
        Math.min(w, d) * 0.32,
        Math.min(w, d) * 0.32,
        0.12,
        10,
        { top: true },
      );
      for (let k = 0; k < 2; k++) {
        const q = F.rot(p[0], p[1], yaw, (k ? 1 : -1) * w * 0.3, d / 2 + 0.4);
        b.beam("rust", p[0], y + h * 0.5, p[1], q[0], y + 0.25, q[1], 0.18);
      }
    }
    for (let i = 0; i < 5; i++) {
      // vent stacks
      const p = at(r(), r()),
        hh = 0.8 + r() * 1.6;
      b.cyl("metal", p[0], y, p[1], 0.14, 0.14, hh, 8, { tint: 0x7a7a72 });
      b.cyl("metal", p[0], y + hh + 0.12, p[1], 0.32, 0.05, 0.22, 8, {
        tint: 0x6a6a62,
        bottom: true,
      });
    }
    // skylight frame with a few panes gone
    const sp = at(0.3 + r() * 0.4, 0.45 + r() * 0.1);
    b.box("black_metal", sp[0], y, sp[1], 3.2, 0.5, 2.2, { tint: 0x3a3a38 });
    for (let k = 0; k < 4; k++)
      b.box(
        r() < 0.4 ? "black" : "glass_dirty",
        sp[0] - 1.2 + k * 0.8,
        y + 0.5,
        sp[1],
        0.7,
        0.02,
        2.0,
        { faces: "t", tint: 0x6a7a70, grime: 0.3 },
      );
    F.debris(b, at(r(), r())[0], y, at(r(), r())[1], 1.2, 6);
  };
  /** Horizontal band/cornice around a rectangle. */
  K.band = function (b, mat, x0, z0, x1, z1, y, h, d, o) {
    o = o || {};
    b.box(
      mat,
      (x0 + x1) / 2,
      y,
      (z0 + z1) / 2,
      x1 - x0 + d * 2,
      h,
      z1 - z0 + d * 2,
      { faces: o.faces || "nsewtb", tint: o.tint, grime: o.grime },
    );
  };

  // ------------------------------------------------------------------
  // Furniture & clutter (merged)
  // ------------------------------------------------------------------
  const col = (x, z, w, d, y0, y1, yaw, surface) =>
    K.colRot(x, z, w, d, y0, y1, yaw || 0, {
      surface: surface || "wood",
      tag: "furniture",
    });
  F.col = col;
  const rot = (x, z, yaw, lx, lz) => [
    x + lx * Math.cos(yaw) + lz * Math.sin(yaw),
    z - lx * Math.sin(yaw) + lz * Math.cos(yaw),
  ];
  F.rot = rot;

  /** Office / hotel writing desk. o: {mat, w, d, h, tint, papers, lamp:glowSet} */
  F.desk = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.5,
      d = o.d || 0.75,
      h = o.h || 0.76,
      m = o.mat || "walnut";
    b.box(m, x, y + h - 0.05, z, w, 0.05, d, {
      yaw,
      tint: o.tint,
      faces: "nsewtb",
    });
    for (const s of [-1, 1]) {
      const p = rot(x, z, yaw, s * (w / 2 - 0.22), 0);
      b.box(m, p[0], y, p[1], 0.42, h - 0.05, d - 0.06, { yaw, tint: o.tint });
    }
    const bp = rot(x, z, yaw, 0, d / 2 - 0.04);
    b.box(m, bp[0], y + 0.25, bp[1], w - 0.9, h - 0.3, 0.03, {
      yaw,
      tint: o.tint,
    });
    if (o.papers !== false) {
      const r = K.rng(Math.round(x * 13 + z * 7));
      for (let i = 0; i < 3; i++) {
        const p = rot(x, z, yaw, (r() - 0.5) * w * 0.7, (r() - 0.5) * d * 0.5);
        b.box("paper", p[0], y + h, p[1], 0.22, 0.004, 0.3, {
          yaw: yaw + (r() - 0.5),
          tint: 0xd8d0b8,
          grime: 0.3,
        });
      }
    }
    if (o.phone) {
      const p = rot(x, z, yaw, w * 0.32, -0.1);
      b.box("black_metal", p[0], y + h, p[1], 0.2, 0.08, 0.22, { yaw });
    }
    if (o.typewriter) {
      const p = rot(x, z, yaw, -0.1, 0);
      b.box("black_metal", p[0], y + h, p[1], 0.45, 0.14, 0.35, { yaw });
      b.box("paper", p[0], y + h + 0.14, p[1] + 0.05, 0.3, 0.2, 0.01, {
        yaw: yaw - 0.2,
        grime: 0.2,
      });
    }
    col(x, z, w, d, y, y + h, yaw);
  };
  /** Chair (wood or upholstered). o: {mat, seat, knocked} */
  F.chair = function (b, x, y, z, yaw, o) {
    o = o || {};
    const m = o.mat || "walnut";
    if (o.knocked) {
      b.box(m, x, y, z, 0.45, 0.45, 0.06, { yaw, tint: o.tint });
      b.box(o.seat || m, x, y + 0.02, z + 0.25, 0.45, 0.06, 0.45, {
        yaw: yaw + 0.3,
        tint: o.seatTint,
      });
      return;
    }
    b.box(o.seat || m, x, y + 0.42, z, 0.46, 0.06, 0.44, {
      yaw,
      tint: o.seatTint,
    });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = rot(x, z, yaw, sx * 0.19, sz * 0.18);
        b.box(m, p[0], y, p[1], 0.04, 0.42, 0.04, { yaw, tint: o.tint });
      }
    const bp = rot(x, z, yaw, 0, 0.2);
    b.box(o.seat || m, bp[0], y + 0.48, bp[1], 0.44, 0.5, 0.05, {
      yaw,
      tint: o.seatTint,
    });
  };
  /** Table (rect or round). o: {round, w, d, h, cloth: mat, mat} */
  F.table = function (b, x, y, z, yaw, o) {
    o = o || {};
    const h = o.h || 0.75,
      m = o.mat || "walnut";
    if (o.round) {
      const r = o.r || 0.7;
      b.cyl(o.cloth || m, x, y + h - 0.04, z, r, r, 0.04, 14, {
        tint: o.clothTint,
        grime: 0.2,
        bottom: true,
      });
      if (o.cloth)
        b.cyl(o.cloth, x, y + h - 0.35, z, r + 0.02, r, 0.33, 14, {
          tint: o.clothTint,
          top: false,
          grime: 0.3,
        });
      b.cyl(m, x, y, z, 0.06, 0.06, h - 0.04, 6, { tint: o.tint });
      b.cyl(m, x, y, z, 0.3, 0.2, 0.05, 8, { tint: o.tint });
      col(x, z, r * 1.5, r * 1.5, y, y + h, 0);
    } else {
      const w = o.w || 1.4,
        d = o.d || 0.8;
      b.box(o.cloth || m, x, y + h - 0.04, z, w, 0.04, d, {
        yaw,
        tint: o.clothTint,
        faces: "nsewtb",
      });
      for (const sx of [-1, 1])
        for (const sz of [-1, 1]) {
          const p = rot(x, z, yaw, sx * (w / 2 - 0.06), sz * (d / 2 - 0.06));
          b.box(m, p[0], y, p[1], 0.06, h - 0.04, 0.06, { yaw, tint: o.tint });
        }
      col(x, z, w, d, y, y + h, yaw);
    }
  };
  /** Slatted wooden bench (waiting room / locker room). */
  F.bench = function (b, x, y, z, yaw, len, o) {
    o = o || {};
    const m = o.mat || "oak";
    for (let i = 0; i < 4; i++) {
      const p = rot(x, z, yaw, 0, -0.18 + i * 0.12);
      b.box(m, p[0], y + 0.42, p[1], len, 0.03, 0.09, { yaw, tint: o.tint });
    }
    if (o.back !== false)
      for (let i = 0; i < 3; i++) {
        const p = rot(x, z, yaw, 0, 0.26);
        b.box(m, p[0], y + 0.55 + i * 0.14, p[1], len, 0.09, 0.03, {
          yaw,
          tint: o.tint,
        });
      }
    const n = Math.max(2, Math.round(len / 1.6) + 1);
    for (let i = 0; i < n; i++) {
      const p = rot(x, z, yaw, -len / 2 + 0.1 + (i * (len - 0.2)) / (n - 1), 0);
      b.box(o.frame || "black_metal", p[0], y, p[1], 0.06, 0.42, 0.5, { yaw });
      if (o.back !== false)
        b.box(
          o.frame || "black_metal",
          rot(x, z, yaw, -len / 2 + 0.1 + (i * (len - 0.2)) / (n - 1), 0.28)[0],
          y + 0.42,
          rot(x, z, yaw, -len / 2 + 0.1 + (i * (len - 0.2)) / (n - 1), 0.28)[1],
          0.05,
          0.5,
          0.04,
          { yaw },
        );
    }
    col(x, z, len, 0.6, y, y + 0.5, yaw);
  };
  /** Hospital / hotel bed. o: {hospital, sheet, mat, restraints, blood} */
  F.bed = function (b, x, y, z, yaw, o) {
    o = o || {};
    const L = 2.0,
      W = o.double ? 1.5 : 0.95;
    const fm = o.mat || (o.hospital ? "hosp_white" : "walnut");
    b.box(o.sheet || "cloth_white", x, y + 0.45, z, W, 0.18, L - 0.1, {
      yaw,
      tint: o.sheetTint,
      grime: 0.6,
    });
    b.box(fm, x, y + 0.3, z, W + 0.04, 0.15, L, { yaw });
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const p = rot(x, z, yaw, (sx * W) / 2, (sz * L) / 2);
        b.box(fm, p[0], y, p[1], 0.05, sz < 0 ? 1.05 : 0.7, 0.05, { yaw });
      }
    const hp = rot(x, z, yaw, 0, -L / 2);
    b.box(fm, hp[0], y + 0.5, hp[1], W, o.hospital ? 0.45 : 0.6, 0.04, { yaw });
    const pp = rot(x, z, yaw, 0, -L / 2 + 0.3);
    b.box(
      o.sheet || "cloth_white",
      pp[0],
      y + 0.63,
      pp[1],
      W * 0.6,
      0.1,
      0.35,
      { yaw, tint: o.sheetTint, grime: 0.5 },
    );
    if (o.restraints)
      for (const sz of [-0.5, 0.1, 0.6]) {
        const p = rot(x, z, yaw, 0, sz);
        b.box("leather_brown", p[0], y + 0.6, p[1], W + 0.08, 0.04, 0.09, {
          yaw,
        });
      }
    if (o.blood) {
      const p = rot(x, z, yaw, 0.1, 0.2);
      b.box("flesh", p[0], y + 0.635, p[1], 0.5, 0.005, 0.7, {
        yaw: yaw + 0.4,
        tint: 0x5a1a14,
        grime: 0,
      });
    }
    col(x, z, W, L, y, y + 0.6, yaw, "metal");
  };
  /** Restaurant booth / banquette: seat + high back, facing +z local. */
  F.booth = function (b, x, y, z, yaw, len, o) {
    o = o || {};
    const m = o.mat || "leather_red",
      fr = o.frame || "mahogany";
    b.box(fr, x, y, z, len, 0.42, 0.55, { yaw });
    b.box(m, x, y + 0.42, z, len, 0.1, 0.55, { yaw, tint: o.tint, grime: 0.5 });
    const bp = rot(x, z, yaw, 0, -0.3);
    b.box(m, bp[0], y + 0.5, bp[1], len, 0.75, 0.14, {
      yaw,
      tint: o.tint,
      grime: 0.5,
    });
    b.box(fr, bp[0], y + 1.25, bp[1], len + 0.04, 0.08, 0.2, { yaw });
    col(x, z - 0.05, len, 0.7, y, y + 1.2, yaw);
  };
  /** Wall shelf unit / bookcase. o: {mat, h, w, d, fill: 'books'|'boxes'|'files'|'jars'|null, sparse} */
