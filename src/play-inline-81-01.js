// play-inline-81 01 — range
// Lines 23-292 of readable/play-inline-81.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;

  const TINTS = [
    [0.95, 0.78, 0.66],
    [0.82, 0.6, 0.5],
    [0.72, 0.52, 0.44], // red / brown brick
    [0.95, 0.92, 0.84],
    [0.86, 0.84, 0.78], // limestone / concrete
    [0.62, 0.6, 0.58],
    [0.5, 0.48, 0.46], // soot-dark
    [0.92, 0.86, 0.72], // tan / buff
  ];
  let R = null;
  // '@far' material variant: reduced haze (00_core.js) — the skyline stays readable across the rivers
  // Draw-call budget: at 1–3 km the small trims (roofs, rust, limestone, painted metal, timber) read by colour
  // only, so they share the concrete material and keep their look through vertex-colour tints (one call each saved).
  const FAR_SHARE = {
    roof_tar: [0.42, 0.41, 0.4],
    rust: [0.66, 0.46, 0.36],
    stone_limestone: [1.12, 1.07, 0.96],
    metal_painted: [0.82, 0.84, 0.82],
    wood_rotten: [0.6, 0.5, 0.4],
    paint_red: [1.3, 0.42, 0.36],
  };
  const tinted = (buf, k) => ({
    reserve: (a, c) => buf.reserve(a, c),
    v: (x, y, z, nx, ny, nz, u, w, r, g, bb) =>
      buf.v(x, y, z, nx, ny, nz, u, w, r * k[0], g * k[1], bb * k[2]),
    tri: (a, b, c) => buf.tri(a, b, c),
    get vn() {
      return buf.vn;
    },
    get empty() {
      return buf.empty;
    },
  });
  // Round 1 (revised): far shores read as SILHOUETTES — every far surface is ~15 % darker than its near twin
  // (the haze then lifts it to a mid value instead of washing it out to the sky colour; see the '@far' fog cap).
  const FAR_DARK = 0.85;
  const fb = (key, x, z) => {
    const sh = FAR_SHARE[key];
    if (sh)
      return tinted(M.buf("concrete@far", x, z, "far"), M.mulc(sh, FAR_DARK));
    return tinted(
      M.buf(key + (key.indexOf("@") >= 0 ? ",far" : "@far"), x, z, "far"),
      [FAR_DARK, FAR_DARK, FAR_DARK],
    );
  };

  /** Façade walls of one tier with a vertical grime gradient. */
  function walls(key, x0, z0, x1, z1, y0, y1, tint, uo) {
    const tile = M.facadeTile();
    const b = fb(key, (x0 + x1) / 2, (z0 + z1) / 2);
    const sides = [
      [x0, z0, x1, z0],
      [x1, z0, x1, z1],
      [x1, z1, x0, z1],
      [x0, z1, x0, z0],
    ];
    const lo = M.mulc(tint, y0 < 4 ? 0.55 : 0.85),
      hi = tint;
    for (const s of sides) {
      const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
      M.wall(
        b,
        s[0],
        s[1],
        s[2],
        s[3],
        y0,
        y1,
        uo,
        uo + l / tile.w,
        y0 / tile.h,
        y1 / tile.h,
        lo,
        hi,
      );
    }
  }
  function cap(x0, z0, x1, z1, y, c, parapet) {
    M.box(fb("roof_tar", x0, z0), x0, y - 0.1, z0, x1, y + 0.05, z1, {
      s: 6,
      c: M.mulc(c, 0.55),
      skip: 8 + 1 + 2 + 16 + 32,
    });
    if (parapet) {
      // (1–3 km away: outer face + top only per run — 16 tris a roof instead of 40; the roof line reads the same)
      const t = 0.5,
        p = parapet,
        k = M.mulc(c, 0.9),
        bt = fb("stone_limestone", x0, z0);
      M.box(bt, x0 - 0.3, y, z0 - 0.3, x1 + 0.3, y + p, z0 + t, {
        s: 3,
        c: k,
        skip: 1 + 2 + 8 + 16,
      });
      M.box(bt, x0 - 0.3, y, z1 - t, x1 + 0.3, y + p, z1 + 0.3, {
        s: 3,
        c: k,
        skip: 1 + 2 + 8 + 32,
      });
      M.box(bt, x0 - 0.3, y, z0 + t, x0 + t, y + p, z1 - t, {
        s: 3,
        c: k,
        skip: 1 + 8 + 16 + 32,
      });
      M.box(bt, x1 - t, y, z0 + t, x1 + 0.3, y + p, z1 - t, {
        s: 3,
        c: k,
        skip: 2 + 8 + 16 + 32,
      });
    }
  }
  function waterTower(x, y, z, s) {
    const b = fb("wood_rotten", x, z),
      st = fb("rust", x, z);
    const Rr = 2.4 * s,
      LH = 3.4 * s,
      TH = 4.6 * s;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      M.beam(
        st,
        x + Math.cos(a) * Rr * 0.8,
        y,
        z + Math.sin(a) * Rr * 0.8,
        x + Math.cos(a) * Rr * 0.8,
        y + LH,
        z + Math.sin(a) * Rr * 0.8,
        0.3 * s,
        0.3 * s,
        { c: [0.4, 0.35, 0.3] },
      );
    }
    M.cyl(b, x, y + LH, z, Rr, Rr * 0.96, TH, 6, {
      cb: [0.5, 0.42, 0.34],
      ct: [0.72, 0.62, 0.5],
      s: 3,
    });
    M.cyl(
      fb("metal_painted", x, z),
      x,
      y + LH + TH,
      z,
      Rr * 1.08,
      0.1,
      1.7 * s,
      6,
      { c: [0.32, 0.3, 0.28] },
    );
  }
  /**
   * One skyline building: setback tiers, parapet, rooftop extras, optional ruin.
   * o: {style, v, lit, tint, crown, water, ruin, mast}
   */
  function tower(x0, z0, x1, z1, h, o) {
    o = o || {};
    const r = R;
    const style = o.style || "apartment";
    // few materials in the always-drawn far layer: variant 1 of each style, lit windows only on apartment & office
    const lit = o.lit && (style === "apartment" || style === "office");
    const key = "facade/" + style + "/1" + (lit ? "@lit" : "");
    const tint = o.tint || r.pick(TINTS);
    let tiers = h > 70 ? r.int(2, 3) : h > 32 && r() < 0.45 ? 2 : 1;
    if (o.flat) tiers = 1;
    const base = o.base || 0;
    let ax0 = x0,
      ax1 = x1,
      az0 = z0,
      az1 = z1,
      y = base;
    h += base; // absolute roof height from here on
    const uo = r.int(0, 3) * 0.25;
    for (let t = 0; t < tiers; t++) {
      const last = t === tiers - 1;
      const th = last ? h - y : (h - y) * r.range(0.45, 0.65);
      let top = y + th;
      if (last && o.ruin) {
        // broken top: the tier ends in two ragged steps with a missing corner
        const mx = (ax0 + ax1) / 2,
          mz = (az0 + az1) / 2;
        const cut = th * r.range(0.25, 0.5);
        walls(key, ax0, az0, mx, az1, y, top, tint, uo);
        walls(key, mx, az0, ax1, mz, y, top - cut, tint, uo);
        walls(key, mx, mz, ax1, az1, y, top - cut * 1.7, tint, uo);
        cap(ax0, az0, mx, az1, top, tint, 0);
        cap(mx, az0, ax1, mz, top - cut, tint, 0);
        cap(mx, mz, ax1, az1, top - cut * 1.7, tint, 0);
        // girders sticking out of the break
        const gb = fb("rust", mx, mz);
        for (let i = 0; i < 4; i++) {
          const gx = r.range(mx, ax1),
            gz = r.range(az0, az1);
          M.beam(
            gb,
            gx,
            top - cut * 1.2,
            gz,
            gx + r.range(-2, 2),
            top - cut * 0.4 + r.range(0, 4),
            gz + r.range(-2, 2),
            0.5,
            0.5,
            { c: [0.45, 0.38, 0.32] },
          );
        }
        return;
      }
      walls(key, ax0, az0, ax1, az1, y, top, tint, uo);
      cap(ax0, az0, ax1, az1, top, tint, last ? r.range(0.8, 1.6) : 1.2);
      y = top;
      if (!last) {
        // set back 12–22 % per side
        const sx = (ax1 - ax0) * r.range(0.1, 0.2),
          sz = (az1 - az0) * r.range(0.1, 0.2);
        ax0 += sx;
        ax1 -= sx;
        az0 += sz;
        az1 -= sz;
      }
    }
    const cx = (ax0 + ax1) / 2,
      cz = (az0 + az1) / 2;
    // rooftop bulkhead / elevator housing
    if (r() < 0.7) {
      const w = Math.min(ax1 - ax0, 8) * 0.5,
        d = Math.min(az1 - az0, 8) * 0.5;
      const bx = r.range(ax0 + w, ax1 - w) - w / 2,
        bz = r.range(az0 + d, az1 - d) - d / 2;
      M.box(
        fb("concrete", bx, bz),
        bx,
        h,
        bz,
        bx + w,
        h + r.range(2.5, 4.5),
        bz + d,
        { s: 4, c: M.mulc(tint, 0.8), skip: 8 },
      );
    }
    if (o.water || (h < 50 && r() < 0.35))
      waterTower(
        r.range(ax0 + 3, Math.max(ax0 + 3.1, ax1 - 3)),
        h,
        r.range(az0 + 3, Math.max(az0 + 3.1, az1 - 3)),
        r.range(0.9, 1.2),
      );
    if (o.crown || (style === "artdeco" && h > 70 && r() < 0.5)) {
      const w = Math.min(ax1 - ax0, az1 - az0) * 0.5;
      M.cyl(
        fb("metal_painted", cx, cz),
        cx,
        h,
        cz,
        w * 0.72,
        0.4,
        w * r.range(0.9, 1.6),
        4,
        { c: [0.45, 0.7, 0.58] },
      );
    }
    if (o.mast || (h > 100 && r() < 0.6))
      M.cyl(fb("rust", cx, cz), cx, h, cz, 0.6, 0.12, r.range(12, 26), 4, {
        c: [0.5, 0.45, 0.4],
      });
  }
  /** Finger pier from the shore at (x,z) running along +/-x (dir) — deck, pilings, a shed; or a collapsed stub. */
