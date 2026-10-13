// play-inline-392 08 — wainh
// Lines 2142-2435 of readable/play-inline-392.pretty.js (statement-aligned).
  K.wallRun = function (b, ctx, R, sd) {
    const gaps = (ctx.gaps || [])
      .filter((g) => {
        const on = sd.alongX
          ? Math.abs(g.z - sd.line) < 0.12
          : Math.abs(g.x - sd.line) < 0.12;
        if (!on) return false;
        const t = sd.alongX ? g.x : g.z;
        if (t + g.w / 2 < sd.a + 0.01 || t - g.w / 2 > sd.e - 0.01)
          return false;
        return g.y >= R.y - 0.3 && g.y <= R.y + R.h - 0.5;
      })
      .map((g) => {
        const t = sd.alongX ? g.x : g.z;
        return {
          t0: Math.max(sd.a, t - g.w / 2),
          t1: Math.min(sd.e, t + g.w / 2),
          y0: g.y,
          y1: g.y + g.h,
          g,
        };
      })
      .sort((p, q) => p.t0 - q.t0);
    const Y0 = R.y,
      Y1 = R.y + R.h,
      off = T / 2;
    const segs = [];
    let t = sd.a;
    for (const g of gaps) {
      if (g.t0 > t) segs.push([t, g.t0, Y0, Y1]);
      if (g.y1 < Y1) segs.push([g.t0, g.t1, g.y1, Y1]);
      if (g.y0 > Y0 + 0.02) segs.push([g.t0, g.t1, Y0, g.y0]);
      t = Math.max(t, g.t1);
    }
    if (t < sd.e) segs.push([t, sd.e, Y0, Y1]);
    const wainH = R.wain ? R.wainH || 1.0 : 0;
    for (const [a, c, ya, yb] of segs) {
      if (wainH && ya < Y0 + wainH) {
        wallFace(
          b,
          R.wain,
          sd,
          a,
          c,
          ya,
          Math.min(yb, Y0 + wainH),
          off,
          R.wainC || R.wc,
        );
        if (yb > Y0 + wainH)
          wallFace(b, R.wall, sd, a, c, Y0 + wainH, yb, off, R.wc);
        const P0 = PT(sd, a, off + 0.025),
          P1 = PT(sd, c, off + 0.025);
        if (yb > Y0 + wainH)
          b.beam(
            "wood_dark",
            P0[0],
            Y0 + wainH,
            P0[1],
            P1[0],
            Y0 + wainH,
            P1[1],
            0.05,
            0.06,
          );
      } else wallFace(b, R.wall, sd, a, c, ya, yb, off, R.wc);
      if (ya <= Y0 + 0.01 && R.trim !== false) {
        const P0 = PT(sd, a, off + 0.02),
          P1 = PT(sd, c, off + 0.02);
        b.beam(
          R.trimMat || "wood_dark",
          P0[0],
          Y0 + 0.08,
          P0[1],
          P1[0],
          Y0 + 0.08,
          P1[1],
          0.04,
          0.16,
        );
      }
      if (R.cornice && yb >= Y1 - 0.01) {
        const P0 = PT(sd, a, off + 0.05),
          P1 = PT(sd, c, off + 0.05);
        b.beam(
          R.corniceMat || "plaster",
          P0[0],
          Y1 - 0.1,
          P0[1],
          P1[0],
          Y1 - 0.1,
          P1[1],
          0.12,
          0.2,
          { tint: R.cc },
        );
      }
      const L0 = PT(sd, a, 0),
        L1 = PT(sd, c, 0);
      if (R.noWallCol) continue;
      if (sd.alongX)
        b.col(L0[0], ya, L0[1] - T / 2, L1[0], yb, L1[1] + T / 2, {
          tag: "wall",
        });
      else
        b.col(L0[0] - T / 2, ya, L0[1], L1[0] + T / 2, yb, L1[1], {
          tag: "wall",
        });
    }
    // jambs & lintel soffit + casing
    for (const g of gaps) {
      const top = Math.min(g.y1, Y1);
      for (const [tt, dir] of [
        [g.t0, 1],
        [g.t1, -1],
      ]) {
        const A = PT(sd, tt, 0),
          B = PT(sd, tt, off);
        const n = sd.alongX ? [dir, 0, 0] : [0, 0, dir];
        // jamb face: quad from wall line to inner face
        const pA = [A[0], g.y0, A[1]],
          pB = [B[0], g.y0, B[1]],
          pC = [B[0], top, B[1]],
          pD = [A[0], top, A[1]];
        b.quadN(R.wall, pA, pB, pC, pD, n, { tint: R.wc });
      }
      if (g.y1 < Y1) {
        const A = PT(sd, g.t0, 0),
          B = PT(sd, g.t1, 0),
          C = PT(sd, g.t1, off),
          D = PT(sd, g.t0, off);
        b.quadN(
          R.wall,
          [A[0], g.y1, A[1]],
          [D[0], g.y1, D[1]],
          [C[0], g.y1, C[1]],
          [B[0], g.y1, B[1]],
          [0, -1, 0],
          { tint: R.wc },
        );
      }
      if (g.g.casing !== false && R.casing !== false) {
        const cm = R.casingMat || "wood_dark";
        const cL = PT(sd, g.t0 - 0.04, off + 0.03),
          cR = PT(sd, g.t1 + 0.04, off + 0.03);
        b.beam(cm, cL[0], g.y0, cL[1], cL[0], top, cL[1], 0.08, 0.05);
        b.beam(cm, cR[0], g.y0, cR[1], cR[0], top, cR[1], 0.08, 0.05);
        if (g.y1 < Y1 - 0.05) {
          const c0 = PT(sd, g.t0 - 0.08, off + 0.03),
            c1 = PT(sd, g.t1 + 0.08, off + 0.03);
          b.beam(
            cm,
            c0[0],
            top + 0.05,
            c0[1],
            c1[0],
            top + 0.05,
            c1[1],
            0.1,
            0.05,
          );
        }
      }
    }
  };
  /**
   * Free wall segment A→B (any angle) from y0 to y1, face on side s (+1: normal = (dz,−dx), −1: opposite).
   * o: {mat, tint, gaps:[{t (centre, metres from A), w, y0, y1}], col (default true), both (draw both faces), wain, wainC, wainH, trim}
   */
  K.segWall = function (b, ax, az, bx, bz, y0, y1, s, o) {
    o = o || {};
    const dx = bx - ax,
      dz = bz - az,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return;
    const ux = dx / len,
      uz = dz / len;
    const nx = uz * s,
      nz = -ux * s;
    const off = o.off !== undefined ? o.off : T / 2;
    const mat = o.mat || "plaster";
    const segs = [];
    let t = 0;
    const gaps = (o.gaps || []).slice().sort((p, q) => p.t - q.t);
    for (const g of gaps) {
      const g0 = g.t - g.w / 2,
        g1 = g.t + g.w / 2;
      if (g0 > t) segs.push([t, g0, y0, y1]);
      if ((g.y1 || y0 + 2.3) < y1) segs.push([g0, g1, g.y1 || y0 + 2.3, y1]);
      if ((g.y0 || y0) > y0) segs.push([g0, g1, y0, g.y0]);
      t = g1;
    }
    if (t < len) segs.push([t, len, y0, y1]);
    const faceOf = (side) => {
      const fx = uz * side,
        fz = -ux * side,
        oo = off;
      for (const [a, c, ya, yb] of segs) {
        const P = (tt, yy) => [
          ax + ux * tt + fx * oo,
          yy,
          az + uz * tt + fz * oo,
        ];
        const wainH = o.wain ? o.wainH || 1.0 : 0;
        if (wainH && ya < y0 + wainH) {
          b.quadN(
            o.wain,
            P(a, ya),
            P(c, ya),
            P(c, Math.min(yb, y0 + wainH)),
            P(a, Math.min(yb, y0 + wainH)),
            [fx, 0, fz],
            { tint: o.wainC },
          );
          if (yb > y0 + wainH)
            b.quadGrid(
              mat,
              ...orient(
                P(a, y0 + wainH),
                P(c, y0 + wainH),
                P(c, yb),
                P(a, yb),
                fx,
                fz,
              ),
              { tint: o.tint, uv: "side" },
            );
          b.beam(
            "wood_dark",
            P(a, 0)[0] + fx * 0.02,
            y0 + wainH,
            P(a, 0)[2] + fz * 0.02,
            P(c, 0)[0] + fx * 0.02,
            y0 + wainH,
            P(c, 0)[2] + fz * 0.02,
            0.05,
            0.06,
          );
        } else
          b.quadGrid(
            mat,
            ...orient(P(a, ya), P(c, ya), P(c, yb), P(a, yb), fx, fz),
            { tint: o.tint, uv: "side" },
          );
        if (ya <= y0 + 0.01 && o.trim !== false)
          b.beam(
            o.trimMat || "wood_dark",
            P(a, 0)[0] + fx * 0.02,
            y0 + 0.08,
            P(a, 0)[2] + fz * 0.02,
            P(c, 0)[0] + fx * 0.02,
            y0 + 0.08,
            P(c, 0)[2] + fz * 0.02,
            0.04,
            0.16,
          );
      }
    };
    faceOf(s);
    if (o.both) faceOf(-s);
    if (o.col !== false)
      for (const [a, c, ya, yb] of segs) {
        const mx = ax + (ux * (a + c)) / 2,
          mz = az + (uz * (a + c)) / 2;
        b.ocol(mx, mz, c - a, T, ya, yb, Math.atan2(-uz, ux), { tag: "wall" });
      }
    void nx;
    void nz;
  };
  /** Return quad corners in an order whose normal matches (fx,0,fz). */
  function orient(p0, p1, p2, p3, fx, fz) {
    const ax = p1[0] - p0[0],
      az = p1[2] - p0[2],
      by = p3[1] - p0[1];
    const nx = -az * by,
      nz = ax * by; // (p1−p0)×(p3−p0) for vertical quads
    return nx * fx + nz * fz >= 0 ? [p0, p1, p2, p3] : [p1, p0, p3, p2];
  }
  K.orient = orient;
  /** Door gap on a wall line (x,z = centre on the line, w wide, from y up h). */
  K.gap = function (ctx, x, z, w, y, h, o) {
    ctx.gaps = ctx.gaps || [];
    const g = Object.assign(
      { x, z, w: w || 1.2, y: y || 0, h: h || 2.3 },
      o || {},
    );
    ctx.gaps.push(g);
    return g;
  };

  /**
   * Straight stair flight. Footprint x0..x1 / z0..z1, rising from y0 to y1 in direction dir ('+x','-x','+z','-z').
   * o: {mat, riserMat, tint, solid (collider down to y0; default true), rail:'l'|'r'|'both', railMat, thick, nosing}
   */
