// play-inline-433 03 — kind
// Lines 325-562 of readable/play-inline-433.pretty.js (statement-aligned).
  K.bars = function (b, ax, az, bx, bz, y0, h, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const step = o.step || 0.13,
      rr = o.r || 0.018,
      mat = o.mat || "black_iron",
      tint = o.tint || [0.2, 0.19, 0.18];
    const n = Math.max(1, Math.round(len / step));
    for (const yy of [y0 + 0.08, y0 + h - 0.08])
      b.beam(mat, ax, yy, az, bx, yy, bz, 0.06, 0.06, { tint });
    if (h > 2.4)
      b.beam(mat, ax, y0 + h * 0.55, az, bx, y0 + h * 0.55, bz, 0.04, 0.05, {
        tint,
      });
    for (let i = 0; i <= n; i++) {
      const t = (len * i) / n,
        px = ax + ux * t,
        pz = az + uz * t;
      if (o.gap && Math.abs(t - o.gap.t) < o.gap.w / 2) continue;
      const bent = (o.bent || []).some((q) => Math.abs(q - t) < step * 0.6);
      if (bent) {
        const side = ((i * 7) % 2 ? 1 : -1) * 0.22;
        b.pipe(
          mat,
          px,
          y0,
          pz,
          px + uz * side,
          y0 + h * 0.5,
          pz - ux * side,
          rr,
          5,
          { tint },
        );
        b.pipe(
          mat,
          px + uz * side,
          y0 + h * 0.5,
          pz - ux * side,
          px,
          y0 + h,
          pz,
          rr,
          5,
          { tint },
        );
      } else b.pipe(mat, px, y0, pz, px, y0 + h, pz, rr, 5, { tint });
    }
    if (o.col !== false) {
      const seg = (t0, t1) => {
        K.lineCol(
          b,
          ax + ux * t0,
          az + uz * t0,
          ax + ux * t1,
          az + uz * t1,
          y0,
          y0 + h,
          0.1,
          { tag: "bars", walkable: false, surface: "metal" },
        );
      };
      if (o.gap) {
        const g0 = o.gap.t - o.gap.w / 2,
          g1 = o.gap.t + o.gap.w / 2;
        if (g0 > 0.05) seg(0, g0);
        if (g1 < len - 0.05) seg(g1, len);
      } else seg(0, len);
    }
  };

  // ------------------------------------------------------------------
  // Little bronze animals (Delacorte Clock band, reliefs, finials)
  // ------------------------------------------------------------------
  /** kind: bear|elephant|hippo|goat|kangaroo|penguin|monkey|lion|sheep. Stands at (x,y,z), faces local −z rotated by yaw. s = scale (≈ height m). */
  K.critter = function (b, kind, x, y, z, yaw, s, o) {
    o = o || {};
    const mat = o.mat || "bronze",
      t = o.tint || [0.42, 0.52, 0.42];
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    const L = (lx, ly, lz) => [
      x + (lx * c + lz * sn) * s,
      y + ly * s,
      z + (-lx * sn + lz * c) * s,
    ];
    const ell = (lx, ly, lz, rx, ry, rz, tt) => {
      const p = L(lx, ly, lz);
      b.geo(mat, K.sphereGeo(), {
        x: p[0],
        y: p[1],
        z: p[2],
        sx: rx * s,
        sy: ry * s,
        sz: rz * s,
        ry: yaw,
        tint: tt || t,
        grime: 0.3,
      });
    };
    const limb = (lx, ly, lz, ex, ey, ez, r) => {
      const p = L(lx, ly, lz),
        q = L(ex, ey, ez);
      b.pipe(mat, p[0], p[1], p[2], q[0], q[1], q[2], r * s, 5, {
        tint: t,
        grime: 0.3,
      });
    };
    const legs4 = (hx, hz, top, r) => {
      for (const [lx, lz] of [
        [-hx, -hz],
        [hx, -hz],
        [-hx, hz],
        [hx, hz],
      ])
        limb(lx, top, lz, lx, 0, lz, r);
    };
    const upright =
      kind === "bear" ||
      kind === "kangaroo" ||
      kind === "penguin" ||
      kind === "monkey";
    if (kind === "penguin") {
      ell(0, 0.42, 0, 0.2, 0.36, 0.18);
      ell(0, 0.86, -0.02, 0.13, 0.13, 0.13);
      const bk = L(0, 0.84, -0.16);
      b.cyl(mat, bk[0], bk[1], bk[2], 0.04 * s, 0.0, 0.1 * s, 5, {
        tint: [0.6, 0.5, 0.3],
      });
      for (const e of [-1, 1])
        limb(e * 0.2, 0.62, 0, e * 0.3, 0.3, 0.02, 0.035);
      if (o.drum !== false) {
        const d = L(0, 0.35, -0.24);
        b.cyl(mat, d[0], d[1], d[2], 0.13 * s, 0.13 * s, 0.14 * s, 10, {
          tint: [0.55, 0.45, 0.3],
        });
      }
      return;
    }
    if (upright) {
      const tall = kind === "kangaroo" ? 1.0 : kind === "monkey" ? 0.7 : 0.95;
      ell(0, 0.48 * tall, 0, 0.22, 0.34 * tall, 0.18);
      ell(0, 0.92 * tall, -0.03, 0.14, 0.14, 0.14);
      for (const e of [-1, 1]) {
        limb(e * 0.1, 0.25, 0, e * 0.12, 0, -0.04, 0.06);
        limb(e * 0.19, 0.72 * tall, -0.02, e * 0.26, 0.55 * tall, -0.22, 0.045);
      }
      if (kind === "bear") {
        for (const e of [-1, 1]) ell(e * 0.1, 1.03, -0.02, 0.05, 0.05, 0.03);
        const tb = L(0.28, 0.58, -0.26);
        b.geo(mat, new THREE.TorusGeometry(0.12 * s, 0.025 * s, 4, 10), {
          x: tb[0],
          y: tb[1],
          z: tb[2],
          ry: yaw,
          tint: [0.6, 0.5, 0.3],
        });
      }
      if (kind === "kangaroo") {
        for (const e of [-1, 1]) ell(e * 0.06, 1.1, 0, 0.03, 0.09, 0.03);
        limb(0, 0.3, 0.12, 0, 0.02, 0.6, 0.06);
        ell(0, 0.86, -0.14, 0.06, 0.05, 0.08);
        const h2 = L(0.1, 0.9, -0.25);
        b.cyl(mat, h2[0], h2[1], h2[2], 0.02 * s, 0.07 * s, 0.22 * s, 6, {
          tint: [0.6, 0.5, 0.3],
        });
      }
      if (kind === "monkey") {
        limb(0, 0.3, 0.12, 0.05, 0.7, 0.3, 0.025);
        for (const e of [-1, 1]) ell(e * 0.13, 0.66, -0.03, 0.04, 0.05, 0.02);
        const hm = L(0.3, 0.9, -0.1);
        b.box(mat, hm[0], hm[1], hm[2], 0.06 * s, 0.24 * s, 0.06 * s, {
          yaw,
          tint: [0.4, 0.3, 0.2],
        });
      }
      return;
    }
    // quadrupeds
    const big = kind === "elephant" ? 1.25 : kind === "hippo" ? 1.1 : 1;
    const bodyY =
      kind === "hippo"
        ? 0.42
        : kind === "goat" || kind === "sheep"
          ? 0.55
          : 0.62;
    ell(0, bodyY, 0.05, 0.26 * big, 0.22 * big, 0.42 * big);
    legs4(
      0.16 * big,
      0.26 * big,
      bodyY - 0.05,
      kind === "elephant" || kind === "hippo" ? 0.07 : 0.04,
    );
    const hz = -0.46 * big,
      hy = bodyY + (kind === "hippo" ? 0.05 : 0.18);
    ell(0, hy, hz, 0.15 * big, 0.14 * big, kind === "hippo" ? 0.22 : 0.16);
    if (kind === "elephant") {
      limb(0, hy - 0.05, hz - 0.12, 0, hy - 0.45, hz - 0.2, 0.05);
      for (const e of [-1, 1])
        ell(e * 0.17, hy + 0.02, hz + 0.05, 0.02, 0.17, 0.13);
    }
    if (kind === "goat" || kind === "sheep") {
      for (const e of [-1, 1])
        limb(
          e * 0.06,
          hy + 0.1,
          hz + 0.03,
          e * 0.14,
          hy + 0.22,
          hz + 0.14,
          0.02,
        );
      if (kind === "sheep")
        ell(0, bodyY + 0.05, 0.05, 0.3, 0.26, 0.46, [0.6, 0.62, 0.52]);
    }
    if (kind === "lion") {
      ell(0, hy + 0.02, hz + 0.04, 0.22, 0.22, 0.14);
      limb(0, bodyY, 0.44, 0.05, bodyY + 0.2, 0.66, 0.025);
    }
    if (kind === "hippo") {
      const v = L(0.25, 0.5, -0.25);
      b.box(mat, v[0], v[1], v[2], 0.05 * s, 0.35 * s, 0.1 * s, {
        yaw: yaw + 0.4,
        tint: [0.4, 0.3, 0.2],
      });
    }
  };

  // ------------------------------------------------------------------
  // Crystal chandelier
  // ------------------------------------------------------------------
  /**
   * Hangs from ceiling y `ceil` down to y (bottom ring). o: {lit (default true), color, intensity, radius, lightOpts, tiers, dead}
   * Lit bulbs go to `o.litB` builder if given (night-only group), otherwise into b.
   */
