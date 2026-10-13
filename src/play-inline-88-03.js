// play-inline-88 03 — range
// Lines 472-769 of readable/play-inline-88.pretty.js (statement-aligned).
  M.grimeUV = (i) => M.cellUV(i, 4, 4);

  /**
   * Grime overlay on a wall line a→b (outward normal n), spanning t0..t1 (m along a→b) and y0..y1.
   * The overlay floats 3–5 cm off the wall (plus the transparent material's polygon offset).
   */
  function overlay(
    ax,
    az,
    bx,
    bz,
    nx,
    nz,
    t0,
    t1,
    y0,
    y1,
    cellI,
    off,
    c,
    flip,
  ) {
    const len = Math.hypot(bx - ax, bz - az) || 1,
      ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const o = off || 0.04;
    const P = (t, y) => [ax + ux * t + nx * o, y, az + uz * t + nz * o];
    const uv = M.grimeUV(cellI);
    // a→b runs right-to-left as seen from outside (see M.wall) → mirror u so drips read the same everywhere
    const u0 = flip ? uv[0] : uv[2],
      u1 = flip ? uv[2] : uv[0];
    const cx = ax + (ux * (t0 + t1)) / 2,
      cz = az + (uz * (t0 + t1)) / 2;
    M.quad(
      M.buf("my/grime", cx, cz, "detail"),
      P(t0, y0),
      P(t1, y0),
      P(t1, y1),
      P(t0, y1),
      [nx, 0, nz],
      [u0, uv[1], u1, uv[1], u1, uv[3], u0, uv[3]],
      c || M.WHITE,
    );
  }
  M.grimeOverlay = overlay;

  // -------------------------------------------------------------------
  // Façade weathering from the builders' wall log
  // -------------------------------------------------------------------
  function weatherWall(w, r) {
    const len = Math.hypot(w.bx - w.ax, w.bz - w.az);
    if (len < 2.5) return;
    const nx = w.nx,
      nz = w.nz;
    const H = w.y1 - w.y0;
    const lot = w.lot || {};
    const burnt = !!lot.burnt,
      ruined = !!lot.ruined;
    const dirt = lot.dirt === undefined ? 1 : lot.dirt;
    const O = (t0, t1, y0, y1, cell, off, c) =>
      overlay(
        w.ax,
        w.az,
        w.bx,
        w.bz,
        nx,
        nz,
        M.clamp(t0, 0, len),
        M.clamp(t1, 0, len),
        y0,
        y1,
        cell,
        off,
        c,
        r() < 0.5,
      );
    // --- rain streaks hanging from the top edge (cornice / parapet / tier top) ---
    if (w.top !== false && H > 3) {
      let t = r.range(0, 2);
      while (t < len - 1.5) {
        const sw = r.range(2.5, 6.5);
        if (r() < 0.9 * dirt) {
          const sh = Math.min(H - 0.2, r.range(8, 26) * (0.6 + dirt * 0.5));
          O(
            t,
            t + sw,
            w.y1 - sh,
            w.y1 - 0.05,
            r() < 0.12 ? GR.RUST : GR.STREAKS,
            0.045,
          );
        }
        t += sw + r.range(0.2, 2.5);
      }
      // tall walls: a second tier of run-off below the mid-height belt courses / window sills
      if (H > 26) {
        const ym = w.y0 + H * r.range(0.35, 0.6);
        for (let t2 = r.range(0, 3); t2 < len - 2; t2 += r.range(4, 9))
          if (r() < 0.6 * dirt) {
            const sw = r.range(2, 5);
            O(t2, t2 + sw, ym - r.range(6, 14), ym, GR.STREAKS, 0.043);
          }
      }
      if (r() < 0.12 * dirt && H > 8) {
        const t0 = r.range(0, Math.max(0.1, len - 5));
        O(
          t0,
          t0 + r.range(3, 5),
          w.y1 - Math.min(H, r.range(5, 12)),
          w.y1 - 0.1,
          GR.HANGVINES,
          0.05,
        );
      }
    }
    // --- fire soot above burnt-out windows ---
    if (H > 6.5 && w.f !== "b") {
      const floorH = M.FACADE.floorH,
        bayW = M.FACADE.bayW;
      const n = burnt
        ? r.int(3, 7)
        : ruined
          ? r.int(1, 4)
          : r() < 0.55
            ? r.int(1, 2)
            : 0;
      for (let i = 0; i < n; i++) {
        const nf = Math.max(1, Math.floor((H - 3) / floorH));
        const fy = w.y0 + (r.int(0, nf - 1) + 0.78) * floorH; // top of a window opening
        const bays = Math.max(1, Math.floor(len / bayW));
        const tc = (r.int(0, bays - 1) + 0.5) * (len / bays);
        const pw = r.range(3, 4.8),
          ph = Math.min(w.y1 - fy + 0.8, r.range(4.5, 11) * (burnt ? 1.3 : 1));
        if (ph < 2) continue;
        O(tc - pw / 2, tc + pw / 2, fy - 0.8, fy - 0.8 + ph, GR.SOOT, 0.05);
      }
      if (burnt && r() < 0.6) {
        const tc = r.range(3, Math.max(3.1, len - 3)),
          s = r.range(5, 9),
          yc = w.y0 + r.range(3, Math.max(3.1, H - 3));
        O(tc - s / 2, tc + s / 2, yc - s * 0.4, yc + s * 0.5, GR.CHAR, 0.052);
      }
    }
    // --- street level: base grime, moss, vines, dust ---
    if (w.y0 < 2.2) {
      for (let t = 0; t < len - 0.5; t += 6) {
        const t1 = Math.min(len, t + 6);
        O(
          t,
          t1,
          w.y0,
          w.y0 + r.range(1.8, 3.6) * (0.7 + dirt * 0.4),
          r() < 0.25 ? GR.MOSS : r() < 0.15 ? GR.DUST : GR.BASE,
          0.035,
        );
      }
      if (r() < 0.22 * dirt) {
        const t0 = r.range(0, Math.max(0.1, len - 5));
        O(t0, t0 + r.range(3, 6), w.y0, w.y0 + r.range(4, 9), GR.VINES, 0.055);
      }
    } else if (w.y0 < 8 && w.f !== "b" && lot.shopSoot) {
      // wall right above a burnt-out storefront: a soot band licking up the façade
      for (let t = 0; t < len - 0.5; t += 7)
        if (r() < 0.8)
          O(
            t,
            Math.min(len, t + 7),
            w.y0 - 0.05,
            w.y0 + r.range(3, 6),
            GR.SOOTBAND,
            0.05,
          );
    }
    // --- sprinkles: stains, leaks, cracks, peels, bullet sprays, scorch ---
    const nS =
      Math.floor(((len * H) / 220) * dirt) +
      (ruined ? 2 : 0) +
      (r() < 0.5 ? 1 : 0);
    for (let i = 0; i < Math.min(nS, 7); i++) {
      const k = r();
      const cell =
        k < 0.25
          ? GR.STAIN
          : k < 0.4
            ? GR.LEAK
            : k < 0.55
              ? GR.CRACKS
              : k < 0.68
                ? GR.PEEL
                : k < 0.82
                  ? GR.BULLETS
                  : GR.SCORCH;
      const s =
        cell === GR.BULLETS
          ? r.range(1.6, 3.2)
          : cell === GR.LEAK
            ? r.range(1.5, 2.5)
            : r.range(2.5, 6);
      const hh = cell === GR.LEAK ? s * r.range(3, 5) : s * r.range(0.8, 1.3);
      const yl =
        cell === GR.BULLETS
          ? w.y0 + r.range(0.6, Math.min(H, 6))
          : w.y0 + r.range(0, Math.max(0.1, H - hh));
      const t0 = r.range(0, Math.max(0.1, len - s));
      if (yl + hh > w.y1) continue;
      O(t0, t0 + s, yl, yl + hh, cell, 0.05 + i * 0.003);
    }
  }

  // -------------------------------------------------------------------
  // Debris drifts & curb clutter
  // -------------------------------------------------------------------
  let moundGeo = null;
  function driftGeo() {
    if (moundGeo) return moundGeo;
    const g = new THREE.SphereGeometry(1, 9, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    const p = g.attributes.position,
      r = M.rng("drift");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = y > 0.02 ? 0.78 + r() * 0.4 : 1;
      p.setXYZ(i, p.getX(i) * k, y * (0.6 + r() * 0.6), p.getZ(i) * k);
    }
    g.computeVertexNormals();
    moundGeo = g;
    return g;
  }
  /** Low elongated debris drift (len along yaw axis, depth across), with bricks, slabs, rebar & litter. */
  M.debrisDrift = function (x, z, len, depth, h, yaw, r, o) {
    o = o || {};
    const y0 =
      o.y !== undefined ? o.y : Math.max(0, G.world.terrainHeight(x, z));
    const tint = M.mulc([0.78, 0.75, 0.7], r.range(0.75, 1.02));
    M.geom(
      M.buf("rubble", x, z, "detail"),
      driftGeo(),
      M.mtx(x, y0 - 0.04, z, yaw, 0, 0, [depth / 2, h, len / 2]),
      { c: tint, us: Math.max(1, len / 4) },
    );
    const ca = Math.cos(yaw),
      sa = Math.sin(yaw);
    const n = Math.round(2 + len * 0.7);
    for (let i = 0; i < n; i++) {
      const a = r.range(-0.5, 0.5) * len * 0.9,
        b = r.range(-0.5, 0.5) * depth * 0.8;
      const px = x + a * sa + b * ca,
        pz = z + a * ca - b * sa;
      const k = r();
      const key =
        k < 0.45 ? "brick_red" : k < 0.8 ? "concrete" : "stone_limestone";
      const s = r.range(0.18, 0.7);
      M.obox(
        M.buf(key, px, pz, "detail"),
        px,
        y0 + h * 0.5 * r(),
        pz,
        s * r.range(1, 2.2),
        s * r.range(0.25, 0.6),
        s * r.range(0.7, 1.4),
        r() * 6,
        {
          pitch: r.range(-0.5, 0.5),
          roll: r.range(-0.5, 0.5),
          s: 1.5,
          c: M.mulc([0.85, 0.8, 0.76], r.range(0.7, 1)),
        },
      );
    }
    if (r() < 0.5) {
      const px = x + r.range(-0.3, 0.3) * len * sa,
        pz = z + r.range(-0.3, 0.3) * len * ca;
      M.beam(
        M.buf("rust", px, pz, "detail"),
        px,
        y0 + h * 0.5,
        pz,
        px + r.range(-1.2, 1.2),
        y0 + h + r.range(0.2, 0.9),
        pz + r.range(-1.2, 1.2),
        0.035,
        0.035,
        { c: [0.65, 0.48, 0.38] },
      );
    }
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x,
      y0 + 0.014,
      z,
      depth * 1.8,
      len * 1.2,
      yaw,
      r() < 0.5 ? M.MARK.DIRT : M.MARK.SAND,
      M.mulc(M.WHITE, r.range(0.7, 1)),
    );
  };

  // dead-grass / weed tufts (alpha-tested crossed quads)
