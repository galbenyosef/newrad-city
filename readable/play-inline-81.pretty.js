/* src/map/12_farskyline.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 12 FAR SKYLINE (outside the playable area)
 * The shores you see from Battery Park, Liberty Island, both bridges and
 * every aerial view — built as textured low-poly skyline blocks in the
 * single-mesh 'far' layer (no colliders):
 *   - New Jersey: the Palisades cliff with towers on top (north), brick
 *     Hoboken with water towers, the Jersey City "Exchange Place" towers,
 *     a waterfront of ruined warehouses, finger piers (some collapsed to
 *     their pilings), pier sheds and port gantry cranes
 *   - Queens / Long Island City: gantry cranes & piers, factories, the
 *     four striped "Big Allis" power-station stacks, a giant rooftop
 *     FIZZO COLA sign facing Manhattan, mid-rise blocks behind
 *   - Brooklyn beyond the playable edge, Harlem north of the world edge,
 *     Bayonne / Staten Island oil tanks & cranes to the south
 * Blocks get setback tiers, parapets, rooftop bulkheads, water towers,
 * masts, deco crowns, broken (ruined) tops, a vertical grime gradient and
 * strong value variation (red/brown brick, limestone, soot-dark). A share
 * of the façades use the '@lit' variants: a few survivors' lit windows at
 * night across the rivers (driven by the textures module's glow).
 * ===================================================================== */
(function () {
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
  function pier(x, z, dir, len, w, broken) {
    const r = R;
    const x1 = x + dir * len;
    const a = Math.min(x, x1),
      c = Math.max(x, x1);
    const pb = fb("wood_rotten", x, z);
    const deckLen = broken ? len * r.range(0.25, 0.55) : len;
    const dx1 = x + dir * deckLen;
    M.box(
      fb("concrete", x, z),
      Math.min(x, dx1),
      0.2,
      z - w / 2,
      Math.max(x, dx1),
      1.3,
      z + w / 2,
      { s: 6, c: [0.55, 0.53, 0.5] },
    );
    for (let t = 2; t < len; t += 5)
      for (const s of [-1, 1]) {
        if (broken && t > deckLen && r() < 0.35) continue;
        const px = x + dir * t,
          pz = z + s * (w / 2 - 0.5);
        M.cyl(
          pb,
          px,
          -3,
          pz,
          0.35,
          0.35,
          t > deckLen ? r.range(2.2, 4.5) : 4.2,
          4,
          { c: [0.35, 0.3, 0.25] },
        );
      }
    if (!broken) {
      // long pier shed with a shallow gable roof
      const sw = w - 3,
        sh = r.range(7, 11);
      const s0 = Math.min(x + dir * 6, x + dir * (len - 4)),
        s1 = Math.max(x + dir * 6, x + dir * (len - 4));
      const tint = r.pick([
        [0.62, 0.55, 0.48],
        [0.5, 0.52, 0.5],
        [0.7, 0.5, 0.4],
      ]);
      const cb = fb("metal_painted", x, z);
      M.box(cb, s0, 1.3, z - sw / 2, s1, 1.3 + sh, z + sw / 2, {
        s: 3,
        c: tint,
        skip: 4 + 8,
      });
      const ry = 1.3 + sh,
        rp = ry + sw * 0.18;
      M.quad(
        cb,
        [s0, ry, z - sw / 2],
        [s1, ry, z - sw / 2],
        [s1, rp, z],
        [s0, rp, z],
        [0, 0.9, -0.4],
        [0, 0, (s1 - s0) / 3, 0, (s1 - s0) / 3, 2, 0, 2],
        M.mulc(tint, 0.8),
      );
      M.quad(
        cb,
        [s1, ry, z + sw / 2],
        [s0, ry, z + sw / 2],
        [s0, rp, z],
        [s1, rp, z],
        [0, 0.9, 0.4],
        [0, 0, (s1 - s0) / 3, 0, (s1 - s0) / 3, 2, 0, 2],
        M.mulc(tint, 0.8),
      );
      for (const xe of [s0, s1])
        M.tri(
          cb,
          [xe, ry, z - sw / 2],
          [xe, ry, z + sw / 2],
          [xe, rp, z],
          [xe === s0 ? -1 : 1, 0, 0],
          [0, 0, 2, 0, 1, 1],
          tint,
        );
      // collapsed roof section on some
      if (r() < 0.35) {
        const m = (s0 + s1) / 2;
        M.obox(
          fb("rust", m, z),
          m,
          ry - 2,
          z,
          r.range(8, 14),
          0.4,
          sw * 0.9,
          0.1,
          { roll: 0.35, c: [0.45, 0.38, 0.32] },
        );
      }
    }
    void a;
    void c;
  }
  /** Container / port gantry crane at (x,z), boom reaching toward the water (dir ±1 on x, or on z when alongZ). */
  function gantry(x, z, dir, s, alongZ) {
    s = s || 1;
    const b = fb("rust", x, z);
    const col = R.pick([
      [0.8, 0.42, 0.22],
      [0.75, 0.62, 0.25],
      [0.55, 0.5, 0.45],
    ]);
    const H = 38 * s,
      span = 16 * s,
      dep = 12 * s;
    const P = (u, y, v) =>
      alongZ ? [x + v, y, z + u * dir] : [x + u * dir, y, z + v];
    for (const u of [-span / 2, span / 2])
      for (const v of [-dep / 2, dep / 2]) {
        const A = P(u, 0, v),
          B = P(u, H, v);
        M.beam(b, A[0], A[1], A[2], B[0], B[1], B[2], 1.1 * s, 1.1 * s, {
          c: col,
        });
      }
    for (const v of [-dep / 2, dep / 2]) {
      const A = P(-span / 2, H, v),
        B = P(span / 2 + 34 * s, H, v);
      M.beam(b, A[0], A[1], A[2], B[0], B[1], B[2], 1.2 * s, 1.8 * s, {
        c: col,
      });
      const C = P(-span / 2, 12 * s, v),
        D = P(span / 2, 12 * s, v);
      M.beam(b, C[0], C[1], C[2], D[0], D[1], D[2], 0.8 * s, 0.8 * s, {
        c: col,
      });
    }
    // A-frame and stays
    const apex = P(0, H + 14 * s, 0);
    for (const v of [-dep / 2, dep / 2]) {
      const A = P(-span / 2, H, v),
        B = P(span / 2, H, v);
      M.beam(b, A[0], A[1], A[2], apex[0], apex[1], apex[2], 0.7 * s, 0.7 * s, {
        c: col,
      });
      M.beam(b, B[0], B[1], B[2], apex[0], apex[1], apex[2], 0.7 * s, 0.7 * s, {
        c: col,
      });
      const T = P(span / 2 + 34 * s, H, v);
      M.beam(b, apex[0], apex[1], apex[2], T[0], T[1], T[2], 0.3 * s, 0.3 * s, {
        c: col,
      });
    }
    // machinery house on the trolley
    const mh = P(span / 2 + 8 * s, H + 1.8 * s, 0);
    M.box(
      fb("metal_painted", x, z),
      mh[0] - 3 * s,
      H + 0.8 * s,
      mh[2] - 3 * s,
      mh[0] + 3 * s,
      H + 4.5 * s,
      mh[2] + 3 * s,
      { s: 3, c: M.mulc(col, 0.9) },
    );
  }
  /** Tank farm (Bayonne oil tanks). */
  function tanks(x0, z0, x1, z1, n) {
    const r = R;
    for (let i = 0; i < n; i++) {
      const x = r.range(x0, x1),
        z = r.range(z0, z1),
        rr = r.range(10, 18),
        h = r.range(10, 16);
      M.cyl(fb("metal_painted", x, z), x, 0, z, rr, rr, h, 14, {
        capTop: true,
        c: r.pick([
          [0.72, 0.72, 0.68],
          [0.62, 0.6, 0.55],
          [0.55, 0.45, 0.35],
        ]),
      });
      M.cyl(fb("rust", x, z), x, h * 0.3, z, rr + 0.1, rr + 0.1, h * 0.15, 14, {
        c: [0.45, 0.35, 0.28],
      });
    }
  }
  /** Striped power-station stacks. */
  function stacks(x, z, n) {
    for (let i = 0; i < n; i++) {
      const sx = x,
        sz = z + i * 22;
      const H = 95,
        rr = 4.2;
      for (let k = 0; k < 6; k++) {
        const y0 = (k * H) / 6,
          y1 = ((k + 1) * H) / 6;
        M.cyl(
          fb(k % 2 ? "concrete" : "paint_red", sx, sz),
          sx,
          y0,
          sz,
          rr - k * 0.25,
          rr - (k + 1) * 0.25,
          y1 - y0,
          10,
          { c: k % 2 ? [0.88, 0.86, 0.82] : [0.9, 0.35, 0.3] },
        );
      }
    }
    // the turbine hall at their feet
    tower(x - 30, z - 20, x + 15, z + n * 22 + 10, 34, {
      style: "warehouse",
      v: 2,
      tint: [0.72, 0.52, 0.44],
      flat: true,
    });
  }
  /** Rocky cliff face (the Palisades) along x = xf from za to zb, facing +x. */
  function palisades(xf, za, zb) {
    const r = R;
    const b = fb("my/rock", xf, (za + zb) / 2);
    let z = za;
    while (z < zb) {
      const seg = r.range(14, 30),
        h = r.range(38, 58),
        lean = r.range(4, 10);
      const z1 = Math.min(zb, z + seg);
      // face (slightly leaning back) + talus apron
      M.quad(
        b,
        [xf, 0, z],
        [xf, 0, z1],
        [xf - lean, h, z1],
        [xf - lean, h, z],
        [1, 0.15, 0],
        [z / 12, 0, z1 / 12, 0, z1 / 12, h / 12, z / 12, h / 12],
        [0.42, 0.4, 0.37],
        [0.62, 0.6, 0.55],
      );
      M.quad(
        b,
        [xf + 16, -1, z],
        [xf + 16, -1, z1],
        [xf, 6, z1],
        [xf, 6, z],
        [1, 1.6, 0],
        [z / 12, 0, z1 / 12, 0, z1 / 12, 1.4, z / 12, 1.4],
        [0.5, 0.48, 0.42],
        [0.45, 0.43, 0.4],
      );
      // wooded top (dead trees): a darker cap band
      M.quad(
        b,
        [xf - lean, h, z],
        [xf - lean, h, z1],
        [xf - lean - 60, h + 2, z1],
        [xf - lean - 60, h + 2, z],
        [0, 1, 0],
        [0, 0, 4, 0, 4, 4, 0, 4],
        [0.36, 0.33, 0.24],
      );
      if (r() < 0.55) {
        // apartment towers on the cliff top (Fort Lee / Cliffside)
        const tx1 = xf - lean - r.range(8, 40),
          tx0 = tx1 - r.range(18, 28);
        tower(tx0, z, tx1, z + r.range(16, 24), r.range(30, 80), {
          base: h,
          style: r() < 0.5 ? "office" : "apartment",
          v: r.int(1, 2),
          lit: r() < 0.15,
          tint: r.pick(TINTS),
        });
      }
      z = z1;
    }
  }

  /**
   * Waterfront edge of a far land plate: a soot-dark stone bulkhead with a rust/algae waterline band,
   * a timber fender of piles, riprap boulders tumbled at its foot and now and then a half-sunk barge —
   * so the far shores read as a real waterfront instead of a pale slab sitting on the water.
   * Runs along x = x0 (alongZ, facing ±x = dir) or z = x0 (!alongZ, facing ±z) from a to b.
   */
  function bulkhead(x0, a, b, dir, alongZ) {
    const r = R;
    const P = (t, off, y) =>
      alongZ ? [x0 + dir * off, y, t] : [t, y, x0 + dir * off];
    const n = alongZ ? [dir, 0, 0] : [0, 0, dir];
    const st = fb(
      "stone_limestone",
      alongZ ? x0 : (a + b) / 2,
      alongZ ? (a + b) / 2 : x0,
    );
    for (let t = a; t < b; t += 40) {
      const t1 = Math.min(b, t + 40);
      const q = (y0, y1, c0, c1) => {
        const p0 = P(t, 0.05, y0),
          p1 = P(t1, 0.05, y0),
          p2 = P(t1, 0.05, y1),
          p3 = P(t, 0.05, y1);
        if (dir < 0 === alongZ)
          M.quad(st, p1, p0, p3, p2, n, [0, 0, 8, 0, 8, 1, 0, 1], c0, c1);
        else M.quad(st, p0, p1, p2, p3, n, [0, 0, 8, 0, 8, 1, 0, 1], c0, c1);
      };
      q(-2.5, -0.7, [0.18, 0.22, 0.16], [0.26, 0.27, 0.2]); // algae / waterline band
      q(-0.7, 1.4, [0.3, 0.27, 0.23], [0.42, 0.4, 0.36]); // soot-dark ashlar
      // coping
      const c0 = P(t, 0.35, 1.4),
        c1 = P(t1, 0.35, 1.4);
      M.box(
        st,
        Math.min(c0[0], c1[0]) - (alongZ ? 0.4 : 0),
        1.4,
        Math.min(c0[2], c1[2]) - (alongZ ? 0 : 0.4),
        Math.max(c0[0], c1[0]) + (alongZ ? 0.4 : 0),
        1.75,
        Math.max(c0[2], c1[2]) + (alongZ ? 0 : 0.4),
        { s: 3, c: [0.5, 0.48, 0.44], skip: 8 },
      );
    }
    // timber fender piles + riprap
    const wb = fb("wood_rotten", x0, a),
      rb = fb("my/rock", x0, a);
    // (always-drawn far layer: square piles, sparse — they only have to read as a fender line from 500 m)
    for (let t = a + 2; t < b; t += r.range(4.5, 7)) {
      if (r() < 0.25) continue;
      const p = P(t, 0.9, -2.5),
        h = r.range(3.4, 4.6);
      M.obox(wb, p[0], -2.5 + h / 2, p[2], 0.55, h, 0.55, 0, {
        c: [0.26, 0.22, 0.18],
        skip: 8,
      });
    }
    for (let t = a + 4; t < b; t += r.range(9, 16)) {
      const p = P(t, r.range(1.5, 4), -1.6),
        s = r.range(1.2, 2.6);
      M.obox(
        rb,
        p[0],
        -1.3 + s * 0.2,
        p[2],
        s * r.range(1, 1.8),
        s * 0.8,
        s,
        r() * 3,
        { c: [0.36, 0.34, 0.3], pitch: r.range(-0.3, 0.3) },
      );
    }
    // half-sunk barges / tugs along the wall
    for (let t = a + r.range(40, 120); t < b - 40; t += r.range(180, 340)) {
      const p = P(t, 9, 0),
        len = r.range(22, 36),
        w = r.range(7, 10),
        tilt = r.range(0.05, 0.16);
      const hb = fb("rust", p[0], p[2]);
      M.obox(hb, p[0], -0.4, p[2], alongZ ? w : len, 2.4, alongZ ? len : w, 0, {
        c: [0.36, 0.28, 0.22],
        roll: alongZ ? tilt : 0,
        pitch: alongZ ? 0 : tilt,
      });
      if (r() < 0.5)
        M.obox(
          hb,
          p[0],
          1.8,
          p[2] + (alongZ ? len * 0.3 : 0),
          alongZ ? w * 0.5 : 5,
          3,
          alongZ ? 5 : w * 0.5,
          0,
          { c: [0.42, 0.34, 0.28] },
        );
    }
  }

  // ---------------------------------------------------------------- far-shore landmark silhouettes
  /** Vertical polygon fan in the plane x = const (facing dir ±1 on x): n-gon of radius rr centred (x,y,z). */
  function vDisc(b, x, y, z, rr, n, dir, c, a0) {
    for (let i = 0; i < n; i++) {
      const a = (a0 || 0) + (i / n) * Math.PI * 2,
        e = (a0 || 0) + ((i + 1) / n) * Math.PI * 2;
      const p1 = [x, y + Math.sin(a) * rr, z + Math.cos(a) * rr],
        p2 = [x, y + Math.sin(e) * rr, z + Math.cos(e) * rr];
      if (dir > 0)
        M.tri(b, [x, y, z], p2, p1, [1, 0, 0], [0, 0, 1, 0, 0, 1], c);
      else M.tri(b, [x, y, z], p1, p2, [-1, 0, 0], [0, 0, 1, 0, 0, 1], c);
    }
  }
  /** The Colgate Clock: a 15 m octagonal clock face on a steel lattice, facing Manhattan across the Hudson. */
  function colgateClock(x, z) {
    const st = fb("rust", x, z),
      fc = fb("stone_limestone", x, z);
    const H = 20,
      R0 = 7.6,
      cy = H + R0;
    for (const s of [-1, 1])
      for (const dx of [-3, 3])
        M.beam(
          st,
          x + dx,
          0,
          z + s * 4,
          x + dx * 0.5,
          H + 2,
          z + s * 3,
          0.6,
          0.6,
          { c: [0.3, 0.26, 0.22] },
        );
    for (let k = 0; k < 5; k++)
      M.beam(
        st,
        x - 2,
        3 + k * 4,
        z - 4 + k * 0.2,
        x - 2,
        3 + k * 4,
        z + 4 - k * 0.2,
        0.35,
        0.35,
        { c: [0.3, 0.26, 0.22] },
      );
    vDisc(st, x + 0.8, cy, z, R0 + 0.7, 8, 1, [0.22, 0.2, 0.18], Math.PI / 8); // dark rim
    vDisc(fc, x + 1.0, cy, z, R0, 8, 1, [0.95, 0.93, 0.86], Math.PI / 8); // pale face
    M.beam(st, x + 1.3, cy, z, x + 1.3, cy + R0 * 0.8, z + 1.2, 0.5, 0.25, {
      c: [0.12, 0.1, 0.1],
    }); // minute hand (stopped)
    M.beam(
      st,
      x + 1.3,
      cy,
      z,
      x + 1.3,
      cy - R0 * 0.25,
      z + R0 * 0.45,
      0.6,
      0.3,
      { c: [0.12, 0.1, 0.1] },
    ); // hour hand
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      M.box(
        st,
        x + 1.05,
        cy + Math.sin(a) * R0 * 0.85 - 0.35,
        z + Math.cos(a) * R0 * 0.85 - 0.35,
        x + 1.2,
        cy + Math.sin(a) * R0 * 0.85 + 0.35,
        z + Math.cos(a) * R0 * 0.85 + 0.35,
        { c: [0.15, 0.13, 0.12], skip: 2 + 8 + 4 + 16 + 32 },
      );
    }
  }
  /** Hoboken Terminal: long ferry sheds on the water + the copper-roofed clock tower. */
  function hobokenTerminal(x, z) {
    const r = R;
    tower(x - 34, z - 40, x, z + 40, 16, {
      style: "warehouse",
      v: 1,
      flat: true,
      tint: [0.62, 0.66, 0.6],
    });
    const cb = fb("metal_painted", x, z);
    for (let k = -1; k <= 1; k++)
      M.box(cb, x, 1, z + k * 24 - 9, x + 30, 12, z + k * 24 + 9, {
        s: 3,
        c: [0.42, 0.55, 0.5],
        skip: 8 + 2,
      });
    const tx = x - 12,
      tz = z - 30;
    tower(tx - 5, tz - 5, tx + 5, tz + 5, 52, {
      style: "office",
      v: 1,
      flat: true,
      tint: [0.78, 0.74, 0.66],
    });
    M.cyl(fb("metal_painted", tx, tz), tx, 68, tz, 4.5, 0.4, 9, 4, {
      c: [0.36, 0.58, 0.5],
      a0: Math.PI / 4,
      a1: Math.PI / 4 + Math.PI * 2,
    });
    vDisc(
      fb("stone_limestone", tx, tz),
      tx + 5.2,
      60,
      tz,
      2.4,
      8,
      1,
      [0.95, 0.93, 0.86],
    );
    void r;
  }
  /** Church spire (brownstone base + tall needle). */
  function spire(x, z, h) {
    const w = R.range(5, 8);
    tower(x - w, z - w * 1.6, x + w, z + w * 1.6, h * 0.35, {
      style: "apartment",
      v: 1,
      flat: true,
      tint: [0.55, 0.42, 0.36],
    });
    M.box(
      fb("stone_limestone", x, z),
      x - 2.4,
      h * 0.35,
      z - w * 1.6 - 0.5,
      x + 2.4,
      h * 0.62,
      z - w * 1.6 + 4.3,
      { s: 3, c: [0.6, 0.5, 0.44], skip: 8 },
    );
    M.cyl(
      fb("metal_painted", x, z),
      x,
      h * 0.62,
      z - w * 1.6 + 1.9,
      2.6,
      0.1,
      h * 0.38,
      4,
      { c: [0.3, 0.42, 0.38], a0: Math.PI / 4, a1: Math.PI / 4 + Math.PI * 2 },
    );
  }
  /** Brick smokestack. */
  function smokestack(x, z, h) {
    M.cyl(fb("paint_red", x, z), x, 0, z, 3.2, 2.1, h, 6, {
      c: [0.62, 0.36, 0.3],
    });
    M.cyl(fb("rust", x, z), x, h - 2, z, 2.4, 2.4, 2, 6, {
      c: [0.25, 0.22, 0.2],
    });
  }
  /** Lattice radio / transmission mast with guy lines (a thin vertical accent). */
  function mast(x, z, h) {
    const st = fb("rust", x, z);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      M.beam(
        st,
        x + Math.cos(a) * 1.2,
        0,
        z + Math.sin(a) * 1.2,
        x + Math.cos(a) * 0.4,
        h,
        z + Math.sin(a) * 0.4,
        0.3,
        0.3,
        { c: [0.55, 0.3, 0.24] },
      );
    }
    for (let y = 12; y < h; y += 14)
      M.box(st, x - 1, y, z - 1, x + 1, y + 0.6, z + 1, {
        c: [0.8, 0.8, 0.78],
        skip: 8,
      });
  }

  M.buildFarSkyline = function () {
    R = M.rng("farskyline2");
    const r = R;
    const styles = ["apartment", "office", "warehouse", "artdeco"];

    // ---------------- New Jersey ----------------
    M.box(fb("concrete_dark", -900, 0), -1150, -8, -1200, -790, 0.3, 1600, {
      s: 6,
      c: [0.62, 0.61, 0.57],
    });
    palisades(-805, -1200, -520);
    // Hoboken / Weehawken (brick, water towers)
    for (let z = -500; z < 280; z += r.range(22, 34)) {
      for (let x = -840; x > -1080; x -= r.range(26, 44)) {
        const w = r.range(16, 30),
          d = r.range(16, 26);
        // mostly 3–8 storey brick, now and then a 15–20 storey tower block so the roofline isn't a flat band
        const h =
          r() < 0.07 ? r.range(48, 74) : r.range(12, 34) * (x > -900 ? 1 : 1.3);
        tower(x - w, z, x, z + d, h, {
          style: h > 45 ? "office" : r() < 0.7 ? "apartment" : "warehouse",
          v: r.int(1, 2),
          lit: r() < 0.12,
          water: h < 45 && r() < 0.3,
          ruin: h > 45 && r() < 0.3,
        });
      }
    }
    // Jersey City: Exchange Place towers on the waterfront + mid-rise behind
    for (let z = 300; z < 960; z += r.range(26, 40)) {
      const tall = z > 380 && z < 860;
      for (let x = -842; x > -1100; x -= r.range(30, 50)) {
        const near = x > -900;
        const w = r.range(20, 36),
          d = r.range(18, 30);
        const h =
          tall && near
            ? r.range(70, 150)
            : tall
              ? r.range(30, 90)
              : r.range(14, 40);
        tower(x - w, z, x, z + d, h, {
          style:
            h > 60 ? r.pick(["office", "artdeco", "office"]) : r.pick(styles),
          v: r.int(1, 2),
          lit: r() < 0.14,
          ruin: h > 50 && r() < 0.22,
        });
      }
    }
    // Bayonne / port south of Jersey City
    for (let z = 980; z < 1550; z += r.range(40, 70))
      tower(
        -900 - r.range(0, 80),
        z,
        -860 - r.range(0, 40),
        z + r.range(20, 40),
        r.range(8, 22),
        { style: "warehouse", v: r.int(1, 2), flat: true },
      );
    tanks(-1100, 1150, -920, 1500, 9);
    // waterfront: warehouses on the bulkhead, finger piers (some collapsed), gantry cranes
    for (let z = -480; z < 1500; z += r.range(28, 46)) {
      if (r() < 0.55)
        tower(-832, z, -800, z + r.range(16, 26), r.range(8, 16), {
          style: "warehouse",
          v: r.int(1, 2),
          flat: true,
          tint: r.pick([TINTS[0], TINTS[1], TINTS[2], TINTS[6]]),
          ruin: r() < 0.2,
        });
    }
    bulkhead(-790, -520, 1600, 1, true);
    for (let z = -420; z < 1480; z += r.range(55, 95))
      pier(-790, z, 1, r.range(40, 75), r.range(12, 20), r() < 0.35);
    for (const z of [1180, 1265, 1350, 1430]) gantry(-800, z, 1, 1, false);
    gantry(-800, 1000, 1, 0.8, false);
    // silhouettes that read from the Manhattan esplanade: Hoboken Terminal's clock tower, the Colgate Clock on the
    // Jersey City waterfront, church spires, smokestacks, a radio mast, two more port cranes off Hoboken
    hobokenTerminal(-800, 130);
    colgateClock(-806, 610);
    for (const [x, z, h] of [
      [-905, -300, 62],
      [-960, -40, 56],
      [-890, 240, 66],
      [-990, 420, 58],
      [-930, 760, 60],
    ])
      spire(x, z, h);
    for (const [x, z, h] of [
      [-870, -420, 58],
      [-1010, 60, 64],
      [-880, 900, 52],
      [-1040, 1080, 70],
    ])
      smokestack(x, z, h);
    mast(-1060, -160, 120);
    gantry(-800, -250, 1, 0.9, false);
    gantry(-800, 20, 1, 0.85, false);

    // ---------------- Harlem (north of the world edge) ----------------
    M.box(fb("concrete_dark", 0, -1100), -345, -8, -1400, 345, 0.02, -1000, {
      s: 6,
      c: [0.66, 0.65, 0.61],
      skip: 8 + 16,
    });
    for (let x = -330; x < 330; x += r.range(22, 34)) {
      for (let z = -1400; z < -1030; z += r.range(38, 62)) {
        if (Math.abs(x) < 115 && z > -1200) continue; // the park continues north (ridge)
        const w = r.range(14, 28),
          d = r.range(16, 30),
          h = r.range(16, 48);
        tower(x, z, x + w, z + d, h, {
          style: r() < 0.75 ? "apartment" : "office",
          v: r.int(1, 3),
          lit: r() < 0.08,
          ruin: r() < 0.12,
        });
      }
    }

    // ---------------- Queens / Long Island City ----------------
    M.box(fb("concrete_dark", 1000, -300), 840, -8, -1200, 1300, 0.3, 380, {
      s: 6,
      c: [0.64, 0.63, 0.59],
    });
    for (let z = -1150; z < 360; z += r.range(28, 46)) {
      for (let x = 880; x < 1280; x += r.range(34, 60)) {
        const w = r.range(20, 40),
          d = r.range(18, 34);
        const core = z > -520 && z < 20 && x < 1050;
        const h = core ? r.range(22, 95) : r.range(10, 36);
        tower(x, z, x + w, z + d, h, {
          style:
            h > 40
              ? r.pick(["office", "apartment", "artdeco"])
              : r.pick(["warehouse", "warehouse", "apartment"]),
          v: r.int(1, 2),
          lit: r() < 0.1,
          ruin: h > 45 && r() < 0.2,
          water: h < 40 && r() < 0.3,
        });
      }
    }
    for (let z = -1100; z < 340; z += r.range(34, 52))
      if (r() < 0.6)
        tower(842, z, 872, z + r.range(16, 28), r.range(8, 16), {
          style: "warehouse",
          v: r.int(1, 2),
          flat: true,
          ruin: r() < 0.25,
        });
    bulkhead(840, -1200, 380, -1, true);
    for (let z = -1050; z < 320; z += r.range(70, 120))
      pier(840, z, -1, r.range(30, 55), r.range(12, 18), r() < 0.4);
    gantry(846, -120, -1, 0.9, false);
    gantry(846, -90, -1, 0.9, false);
    stacks(900, -330, 4);
    for (const [x, z, h] of [
      [960, -760, 60],
      [1100, -560, 66],
      [930, 180, 54],
    ])
      smokestack(x, z, h);
    for (const [x, z, h] of [
      [1000, -900, 58],
      [1150, -250, 62],
    ])
      spire(x, z, h);
    mast(1180, -700, 110);
    // the old Fizzo Cola bottling plant's rooftop sign (a flat lettered panel), facing Manhattan across the river
    if (M.adPanel) {
      const sx = 876,
        sz = -60,
        sy = 22;
      tower(868, sz - 22, 900, sz + 22, 14, {
        style: "warehouse",
        v: 1,
        flat: true,
        tint: [0.75, 0.55, 0.45],
      });
      M.adPanel("fizzo_cola", sx - 7, sy + 7, sz, -1, 0, 40, 13, {
        layer: "far",
        c: [0.9, 0.9, 0.9],
      });
      const fr = fb("rust", sx, sz);
      for (let t = -20; t <= 20; t += 5)
        M.beam(fr, sx - 6, 14, sz + t, sx - 6, sy + 14, sz + t, 0.5, 0.5, {
          c: [0.45, 0.38, 0.32],
        });
      M.beam(
        fr,
        sx - 6,
        sy + 14.2,
        sz - 21,
        sx - 6,
        sy + 14.2,
        sz + 21,
        0.6,
        0.6,
        { c: [0.45, 0.38, 0.32] },
      );
    }

    // ---------------- Brooklyn beyond the playable edge ----------------
    M.box(fb("concrete_dark", 1000, 700), 800, -8, 380, 1300, 0.01, 1300, {
      s: 6,
      c: [0.64, 0.63, 0.59],
      skip: 8,
    });
    for (let x = 840; x < 1280; x += r.range(28, 46))
      for (let z = 400; z < 1280; z += r.range(30, 56)) {
        const w = r.range(18, 34),
          d = r.range(18, 34),
          h = r.range(8, 42) * (x < 1000 && z > 600 && z < 950 ? 1.4 : 1);
        tower(x, z, x + w, z + d, h, {
          style: r() < 0.55 ? "warehouse" : "apartment",
          v: r.int(1, 2),
          lit: r() < 0.08,
          water: r() < 0.25,
          ruin: r() < 0.12,
        });
      }
    // Red Hook / Brooklyn port south of the playable waterfront
    M.box(fb("concrete_dark", 700, 1100), 480, -8, 1000, 1300, 0.3, 1300, {
      s: 6,
      c: [0.62, 0.61, 0.57],
      skip: 8,
    });
    for (let x = 500; x < 820; x += r.range(40, 70))
      tower(
        x,
        1040 + r.range(0, 30),
        x + r.range(24, 40),
        1100 + r.range(0, 40),
        r.range(10, 22),
        { style: "warehouse", v: r.int(1, 2), flat: true, ruin: r() < 0.25 },
      );
    for (const x of [560, 640, 720]) gantry(x, 1010, -1, 0.9, true);
    bulkhead(480, 1000, 1300, -1, true);

    // ---------------- Staten Island / Bayonne low silhouette to the south ----------------
    M.box(fb("concrete_dark", -300, 1700), -1100, -8, 1650, 600, 0.5, 1900, {
      s: 6,
      c: [0.58, 0.58, 0.54],
    });
    for (let x = -1050; x < 580; x += r.range(34, 70))
      tower(
        x,
        1665,
        x + r.range(20, 40),
        1700 + r.range(0, 30),
        r.range(6, 24),
        {
          style: r() < 0.7 ? "warehouse" : "apartment",
          v: r.int(1, 2),
          flat: r() < 0.6,
        },
      );
    tanks(-700, 1720, -300, 1860, 7);
    bulkhead(1650, -1100, 600, -1, false);
    for (const x of [-200, -120, -40]) gantry(x, 1660, -1, 1, true);
  };
})();
