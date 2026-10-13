// play-inline-172 06 — tint
// Lines 1285-1632 of readable/play-inline-172.pretty.js (statement-aligned).
  F.fireEscape = function (b, x, z, nx, nz, w, ys, o) {
    o = o || {};
    const m = o.mat || "black_metal",
      D = o.depth || 1.25,
      tint = o.tint || 0x2a2622;
    const ux = -nz,
      uz = nx; // along the wall
    const yaw = Math.atan2(nx, nz);
    const P = (u, d) => [x + ux * u + nx * d, z + uz * u + nz * d];
    for (let i = 0; i < ys.length; i++) {
      const y = ys[i],
        c = P(0, D / 2 + 0.05);
      // deck: slats
      for (let k = 0; k < 6; k++) {
        const q = P(0, 0.12 + (k * (D - 0.1)) / 6);
        b.box(m, q[0], y - 0.04, q[1], w, 0.04, 0.12, { yaw, tint });
      }
      b.box(m, c[0], y - 0.12, c[1], w, 0.08, D, { yaw, tint, faces: "nsew" }); // edge frame
      // rails: outer + two ends, balusters
      const a = P(-w / 2, D),
        bb = P(w / 2, D),
        a0 = P(-w / 2, 0.05),
        b0 = P(w / 2, 0.05);
      for (const r of [
        [a, bb],
        [a0, a],
        [b0, bb],
      ]) {
        b.beam(
          m,
          r[0][0],
          y + 0.95,
          r[0][1],
          r[1][0],
          y + 0.95,
          r[1][1],
          0.04,
          { tint },
        );
        b.beam(
          m,
          r[0][0],
          y + 0.45,
          r[0][1],
          r[1][0],
          y + 0.45,
          r[1][1],
          0.025,
          { tint },
        );
        const L = Math.hypot(r[1][0] - r[0][0], r[1][1] - r[0][1]),
          n = Math.max(2, Math.round(L / 0.35));
        for (let k = 0; k <= n; k++) {
          const t = k / n;
          b.beam(
            m,
            r[0][0] + (r[1][0] - r[0][0]) * t,
            y,
            r[0][1] + (r[1][1] - r[0][1]) * t,
            r[0][0] + (r[1][0] - r[0][0]) * t,
            y + 0.95,
            r[0][1] + (r[1][1] - r[0][1]) * t,
            0.018,
            { tint },
          );
        }
      }
      // diagonal brackets under the deck
      for (const u of [-w / 2 + 0.2, w / 2 - 0.2]) {
        const p0 = P(u, 0.02),
          p1 = P(u, D - 0.1);
        b.beam(m, p0[0], y - 0.9, p0[1], p1[0], y - 0.12, p1[1], 0.05, {
          tint,
        });
      }
      // switch-back stair up to the next landing (alternating direction)
      if (i < ys.length - 1) {
        const y1 = ys[i + 1],
          dir = i % 2 ? -1 : 1,
          s0 = P(-dir * (w / 2 - 0.3), D * 0.55),
          s1 = P(dir * (w / 2 - 0.5), D * 0.55);
        const n = Math.max(6, Math.round((y1 - y) / 0.22));
        for (const side of [-0.33, 0.33])
          b.beam(
            m,
            s0[0] + nx * side,
            y,
            s0[1] + nz * side,
            s1[0] + nx * side,
            y1,
            s1[1] + nz * side,
            0.05,
            { tint },
          );
        for (let k = 1; k < n; k++) {
          const t = k / n;
          const q = [s0[0] + (s1[0] - s0[0]) * t, s0[1] + (s1[1] - s0[1]) * t];
          b.box(m, q[0], y + (y1 - y) * t - 0.03, q[1], 0.22, 0.03, 0.66, {
            yaw,
            tint,
          });
        }
        b.beam(
          m,
          s0[0] + nx * 0.36,
          y + 0.95,
          s0[1] + nz * 0.36,
          s1[0] + nx * 0.36,
          y1 + 0.95,
          s1[1] + nz * 0.36,
          0.03,
          { tint },
        );
      }
    }
    // drop ladder (retracted) below the first landing
    const l = P(w / 2 - 0.5, D - 0.2),
      y0 = ys[0];
    for (const e of [-0.22, 0.22])
      b.beam(
        m,
        l[0] + ux * e,
        y0 - 2.4,
        l[1] + uz * e,
        l[0] + ux * e,
        y0 + 0.9,
        l[1] + uz * e,
        0.035,
        { tint },
      );
    for (let k = 0; k < 11; k++)
      b.beam(
        m,
        l[0] - ux * 0.22,
        y0 - 2.3 + k * 0.3,
        l[1] - uz * 0.22,
        l[0] + ux * 0.22,
        y0 - 2.3 + k * 0.3,
        l[1] + uz * 0.22,
        0.02,
        { tint },
      );
    // a few window-sill clutter bits on the landings (plant pot, crate) for life
    if (o.clutter !== false)
      for (let i = 1; i < ys.length; i += 2) {
        const q = P(-w / 2 + 0.4, 0.4);
        b.box(
          i % 4 === 1 ? "brick_red" : "wood_rotten",
          q[0],
          ys[i],
          q[1],
          0.35,
          0.3,
          0.35,
          { yaw, tint: 0x8a5a3a },
        );
      }
  };
  /** Rubble / plaster debris pile around (x,z) radius r. */
  F.debris = function (b, x, y, z, r, n, o) {
    o = o || {};
    const rr = K.rng(Math.round(x * 7 + z * 3 + n));
    const mats = o.mats || ["rubble", "concrete_dark", "plaster"];
    for (let i = 0; i < n; i++) {
      const a = rr() * PI * 2,
        d = Math.sqrt(rr()) * r,
        s = (0.15 + rr() * 0.45) * (o.scale || 1) * (1 - (d / r) * 0.5);
      b.geo(mats[i % mats.length], rr() < 0.5 ? T.dodeca : T.ico, {
        x: x + Math.cos(a) * d,
        y: y + s * 0.25,
        z: z + Math.sin(a) * d,
        sx: s * (0.8 + rr() * 0.8),
        sy: s * (0.4 + rr() * 0.4),
        sz: s,
        ry: rr() * 6,
        rx: rr() * 0.6,
        tint: o.tint,
        grime: 0.6,
      });
    }
    if (o.mound)
      b.geo(mats[0], T.sphereLo, {
        x,
        y: y - r * 0.25,
        z,
        sx: r * 0.9,
        sy: r * 0.45,
        sz: r * 0.8,
        tint: o.tint,
        grime: 0.7,
      });
    if (o.col)
      K.colBox(
        x - r * 0.6,
        y,
        z - r * 0.6,
        x + r * 0.6,
        y + (o.colH || r * 0.3),
        z + r * 0.6,
        { surface: "rubble" },
      );
  };
  /** Scattered paper sheets on a floor area. */
  F.papers = function (b, x0, z0, x1, z1, y, n, o) {
    o = o || {};
    const r = K.rng(Math.round(x0 * 3 + z0 * 5 + n));
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0),
        z = z0 + r() * (z1 - z0);
      b.box(
        "paper",
        x,
        y + 0.005 + i * 0.0004,
        z,
        0.21 + r() * 0.1,
        0.003,
        0.28,
        {
          yaw: r() * 6,
          tint: o.tint || [0xd8d0b8, 0xc8bc98, 0xe0d8c8][i % 3],
          grime: 0.5,
          faces: "t",
        },
      );
    }
  };
  /** Sandbag wall along yaw. */
  F.sandbags = function (b, x, y, z, yaw, len, rows, o) {
    o = o || {};
    rows = rows || 3;
    const r = K.rng(Math.round(x * 11 + z * 13));
    for (let j = 0; j < rows; j++) {
      const n = Math.round(len / 0.62);
      for (let i = 0; i < n; i++) {
        const u = -len / 2 + ((i + (j % 2) * 0.5 + 0.5) * len) / n;
        if (u > len / 2) continue;
        const p = rot(x, z, yaw, u, (r() - 0.5) * 0.06);
        b.geo("sandbag", T.sphereLo, {
          x: p[0],
          y: y + 0.13 + j * 0.24,
          z: p[1],
          sx: 0.33,
          sy: 0.14,
          sz: 0.24,
          ry: yaw + (r() - 0.5) * 0.2,
          tint: o.tint || 0x9a8a62,
          grime: 0.6,
        });
      }
    }
    K.colRot(x, z, len, 0.55, y, y + rows * 0.24 + 0.05, yaw, {
      surface: "dirt",
      tag: "sandbags",
    });
  };
  /** Wooden / military crate (visual; use props for lootable ones). */
  F.crate = function (b, x, y, z, yaw, s, o) {
    o = o || {};
    s = s || 0.8;
    b.box(o.mat || "wood", x, y, z, s, s * 0.8, s * 0.9, { yaw, tint: o.tint });
    for (const sy of [0.05, s * 0.8 - 0.1])
      b.box(o.mat || "wood", x, y + sy, z, s + 0.03, 0.07, s * 0.9 + 0.03, {
        yaw,
        tint: o.bandTint || 0x6a5238,
      });
    if (o.col !== false)
      K.colRot(x, z, s, s * 0.9, y, y + s * 0.8, yaw, {
        surface: "wood",
        tag: "crate",
      });
  };
  /** Pipe run between points (round). */
  F.pipe = function (b, ax, ay, az, bx, by, bz, r, o) {
    o = o || {};
    b.beam(o.mat || "rust", ax, ay, az, bx, by, bz, r * 2, {
      round: 8,
      tint: o.tint,
      grime: 0.4,
    });
  };
  /** Scattered bones & a skull (merged; cheap alternative to prop skeletons). */
  F.bones = function (b, x, y, z, n, o) {
    o = o || {};
    const r = K.rng(Math.round(x * 5 + z * 9));
    for (let i = 0; i < n; i++)
      b.beam(
        "bone",
        x + (r() - 0.5) * 0.8,
        y + 0.03,
        z + (r() - 0.5) * 0.8,
        x + (r() - 0.5) * 0.8,
        y + 0.03,
        z + (r() - 0.5) * 0.8,
        0.035,
        { round: 6, grime: 0.4 },
      );
    if (o.skull !== false)
      b.geo("bone", T.sphereLo, {
        x: x + 0.2,
        y: y + 0.09,
        z: z - 0.1,
        sx: 0.1,
        sy: 0.12,
        sz: 0.13,
        ry: r() * 6,
        grime: 0.5,
      });
  };
  /** Stretch of torn wallpaper / plaster damage: dark patches on a wall plane (quad). */
  F.stain = function (b, x, y, z, yaw, w, h, o) {
    o = o || {};
    b.panel(o.mat || "concrete_dark", x, y, z, w, h, yaw, {
      off: o.off || 0.02,
      tint: o.tint || 0x3a3228,
      grime: 0.8,
    });
  };
  /** Light shaft (additive quad) from (x,y,z) downward/along dir, width w, length len, facing yaw. */
  /**
   * Volumetric spotlight cone (additive 'shaft' material) from a lamp at (x,y,z) down to a pool centred at
   * (tx,ty,tz) with radius rb. rt = radius at the lamp. Bright at the lamp, fading toward the floor.
   */
  F.cone = function (b, x, y, z, tx, ty, tz, rt, rb, o) {
    o = o || {};
    const dx = tx - x,
      dy = ty - y,
      dz = tz - z,
      len = Math.hypot(dx, dy, dz);
    const g = new THREE.CylinderGeometry(rt, rb, len, o.seg || 14, 1, true);
    g.translate(0, -len / 2, 0); // top (lamp end, uv.y = 1) at the origin, pointing down −Y
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(dx / len, dy / len, dz / len),
    );
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      q,
      new THREE.Vector3(1, 1, 1),
    );
    b.geo("shaft", g, {
      matrix: m,
      uv: "rect",
      rect: [0.28, 0, 0.72, 1],
      tint: o.tint || 0xffffff,
      grime: 0,
    });
    g.dispose();
  };
