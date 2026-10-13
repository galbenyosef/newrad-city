// play-inline-263 04 — math
// Lines 614-835 of readable/play-inline-263.pretty.js (statement-aligned).
  A.magnolia = function (S, x, y, z, o) {
    o = o || {};
    const tips = A.tree(S, x, y, z, {
      h: o.h || 5,
      n: 5,
      depth: 2,
      r: 0.16,
      leaves: null,
    });
    const rn = P.rng(x * 3 + z * 5);
    // a few surviving blossoms: small cupped petals clustered on the twig tips
    for (const t of tips) {
      if (rn() > (o.bloom || 0.55)) continue;
      for (let k = 0; k < 3; k++) {
        const px = t[0] + (rn() - 0.5) * 0.35,
          py = t[1] + (rn() - 0.3) * 0.25,
          pz = t[2] + (rn() - 0.5) * 0.35;
        S.b.geo(
          rn() < 0.4 ? "fabric_pink" : "fabric_white",
          new THREE.ConeGeometry(0.09, 0.14, 5, 1, true).rotateX(PI),
          P.m4(px, py, pz, rn() * 3, (rn() - 0.5) * 0.8, (rn() - 0.5) * 0.8),
          { noAO: true },
        );
      }
    }
    // fallen petals on the ground
    for (let i = 0; i < 18; i++) {
      const a = rn() * TAU,
        d = rn() * 2.4;
      S.b.box(
        rn() < 0.4 ? "fabric_pink" : "fabric_white",
        x + Math.cos(a) * d - 0.05,
        y + 0.01,
        z + Math.sin(a) * d - 0.04,
        x + Math.cos(a) * d + 0.05,
        y + 0.02,
        z + Math.sin(a) * d + 0.04,
        { seg: false, noAO: true, ry: rn() * 3 },
      );
    }
  };
  /** Clipped (overgrown) hedge block. */
  A.hedge = function (S, x0, z0, x1, z1, y, h, o) {
    o = o || {};
    const rn = P.rng(x0 * 3 + z0);
    S.b.box(o.key || "foliage", x0, y, z0, x1, y + h, z1, {
      segLen: 1,
      grime: 0.4,
    });
    const n = Math.round((Math.abs(x1 - x0) + Math.abs(z1 - z0)) * 1.2);
    for (let i = 0; i < n; i++)
      S.b.sphere(
        o.key || "foliage",
        x0 + rn() * (x1 - x0),
        y + h - 0.1 + rn() * 0.2,
        z0 + rn() * (z1 - z0),
        0.3 + rn() * 0.3,
        { ws: 5, hs: 3, noAO: true, sy: 0.6 },
      );
    if (o.col !== false)
      S.col(
        Math.min(x0, x1),
        y,
        Math.min(z0, z1),
        Math.max(x0, x1),
        y + h,
        Math.max(z0, z1),
        { walkable: false },
      );
  };

  // ------------------------------------------------------------------
  // Ceilings, stairs, battlements
  // ------------------------------------------------------------------
  /** Coffered skylight: grid of glass panes (emissive) in an iron frame, with a soft baked daylight + glow sprites. */
  A.skylight = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = S.b,
      nx = Math.max(1, Math.round((x1 - x0) / (o.cell || 2))),
      nz = Math.max(1, Math.round((z1 - z0) / (o.cell || 2)));
    const cw = (x1 - x0) / nx,
      cd = (z1 - z0) / nz,
      rn = P.rng(x0 * 3 + z0 * 7 + y);
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        const px0 = x0 + i * cw,
          pz0 = z0 + j * cd;
        const miss = rn() < (o.broken || 0);
        if (!miss)
          b.box(
            o.glass || "glass_sky",
            px0 + 0.06,
            y,
            pz0 + 0.06,
            px0 + cw - 0.06,
            y + 0.04,
            pz0 + cd - 0.06,
            { seg: false, noAO: true, noBake: true },
          );
      }
    for (let i = 0; i <= nx; i++)
      b.box(
        o.frame || "iron",
        x0 + i * cw - 0.08,
        y - 0.3,
        z0,
        x0 + i * cw + 0.08,
        y + 0.08,
        z1,
        { seg: false, noAO: true },
      );
    for (let j = 0; j <= nz; j++)
      b.box(
        o.frame || "iron",
        x0,
        y - 0.22,
        z0 + j * cd - 0.06,
        x1,
        y + 0.08,
        z0 + j * cd + 0.06,
        { seg: false, noAO: true },
      );
    if (o.light !== false) {
      const col = o.color || 0xd8e4c8;
      const lx = Math.max(1, Math.round((x1 - x0) / 8)),
        lz = Math.max(1, Math.round((z1 - z0) / 8));
      for (let i = 0; i < lx; i++)
        for (let j = 0; j < lz; j++) {
          const cx = x0 + ((i + 0.5) * (x1 - x0)) / lx,
            cz = z0 + ((j + 0.5) * (z1 - z0)) / lz;
          S.light(cx, y - 1.2, cz, col, o.r || 12, o.i || 0.7);
          if (o.glow) S.glow(cx, y - 0.3, cz, col, o.glowSize || 3.2);
        }
    }
  };
  /**
   * U-stair: flight 1 from (x1a, z) climbing dir to a half landing, flight 2 back. Keeps steps ≤ 0.24 m.
   * spec: {x (centre of the stair well across), z0 (bottom edge), dir 'n'|'s', w (flight width), gap, y0, y1, key, rail, landingD}
   */
  A.stairsU = function (S, sp) {
    const key = sp.key || "marble",
      w = sp.w || 2.2,
      gap = sp.gap || 0.4,
      hm = (sp.y0 + sp.y1) / 2,
      sign = sp.dir === "n" ? -1 : 1;
    const xa = sp.x - gap / 2 - w / 2,
      xb = sp.x + gap / 2 + w / 2;
    const r1 = S.stairs(key, sp.flip ? xb : xa, sp.z0, sp.dir, w, sp.y0, hm, {
      rail: sp.rail,
      railSides: [sp.flip ? -1 : 1],
      nosing: sp.nosing,
      surface: sp.surface,
    });
    const ld = sp.landingD || 2.4;
    const lz0 = Math.min(r1.z, r1.z + sign * ld),
      lz1 = Math.max(r1.z, r1.z + sign * ld);
    S.floor(key, sp.x - gap / 2 - w, lz0, sp.x + gap / 2 + w, lz1, hm, {
      t: 0.3,
      surface: sp.surface,
    });
    const back = sp.dir === "n" ? "s" : "n";
    const r2 = S.stairs(key, sp.flip ? xa : xb, r1.z, back, w, hm, sp.y1, {
      rail: sp.rail,
      railSides: [sp.flip ? 1 : -1],
      nosing: sp.nosing,
      surface: sp.surface,
    });
    return {
      landing: { x: sp.x, z: (lz0 + lz1) / 2, y: hm },
      top: { x: sp.flip ? xa : xb, z: r2.z },
      len: r1.len,
    };
  };
  /** Battlement merlons along a straight line at y (top of parapet). */
  A.crenels = function (b, key, ax, az, bx, bz, y, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(L / (o.step || 1.6)));
    const ang = Math.atan2(bz - az, bx - ax),
      mw = o.mw || 0.9,
      mh = o.mh || 1.0,
      d = o.d || 0.6;
    for (let i = 0; i <= n; i += 1) {
      if (i % 2 === 1) continue;
      const t = n ? i / n : 0,
        cx = ax + (bx - ax) * t,
        cz = az + (bz - az) * t;
      b.boxC(key, cx, y, cz, mw, mh, d, { ry: -ang, seg: false });
    }
  };
  /** Chimney stack with pots. */
  A.chimney = function (b, key, x, y, z, w, d, h, pots) {
    b.box(key, x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, {
      seg: false,
    });
    b.box(
      "ashlar",
      x - w / 2 - 0.1,
      y + h,
      z - d / 2 - 0.1,
      x + w / 2 + 0.1,
      y + h + 0.2,
      z + d / 2 + 0.1,
      { seg: false, noAO: true },
    );
    for (let i = 0; i < (pots || 2); i++)
      b.cyl(
        "terracotta",
        x - w / 2 + ((i + 0.5) * w) / (pots || 2),
        y + h + 0.2,
        z,
        0.14,
        0.18,
        0.5,
        8,
        { noAO: true },
      );
  };
  /** Glow-sprite-only light (for exteriors at night). */
  A.lamp = function (S, x, y, z, color, size) {
    S.glow(x, y, z, color || 0xffd8a0, size || 0.8);
  };
