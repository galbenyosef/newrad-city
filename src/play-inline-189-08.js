// play-inline-189 08 — off
// Lines 1970-2315 of readable/play-inline-189.pretty.js (statement-aligned).
  function wallFace(b, mat, sd, t0, t1, y0, y1, off, tint, grime) {
    if (t1 - t0 < 0.005 || y1 - y0 < 0.005) return;
    // U axis along the wall such that U × V(up) = inner normal
    const A = PT(sd, t0, off),
      B = PT(sd, t1, off);
    // inner normal n; U must satisfy U×Y = n → U = (−nz, 0, nx)?  check: (ux,0,uz)×(0,1,0) = (−uz, 0, ux) = n → uz = −nx, ux = nz
    const ux = sd.nz,
      uz = -sd.nx;
    // choose origin so that the face spans t0..t1 in +U direction
    const dirT = sd.alongX ? ux : uz; // how U moves t
    const O = dirT > 0 ? A : B;
    b.face(mat, O[0], y0, O[1], ux, 0, uz, 0, 1, 0, t1 - t0, y1 - y0, {
      tint,
      grime,
      uo: dirT > 0 ? t0 : -t1,
    });
  }
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
    // span-split (gaps stacked at the same place on several tiers of a tall room used to wall each other up)
    const segs = [];
    {
      const cuts = [sd.a, sd.e];
      for (const g of gaps) cuts.push(g.t0, g.t1);
      const xs = Array.from(
        new Set(cuts.map((v) => Math.round(v * 1e4) / 1e4)),
      ).sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) {
        const u0 = xs[i],
          u1 = xs[i + 1];
        if (u1 - u0 < 0.01) continue;
        const um = (u0 + u1) / 2;
        const over = gaps
          .filter((g) => g.t0 < um && g.t1 > um)
          .map((g) => [Math.max(Y0, g.y0), Math.min(Y1, g.y1)])
          .sort((p, q) => p[0] - q[0]);
        let v = Y0;
        for (const o2 of over) {
          if (o2[0] > v + 0.02) segs.push([u0, u1, v, o2[0]]);
          v = Math.max(v, o2[1]);
        }
        if (v < Y1 - 0.01) segs.push([u0, u1, v, Y1]);
      }
      segs.sort((p, q) => p[2] - q[2] || p[3] - q[3] || p[0] - q[0]);
      for (let i = segs.length - 1; i > 0; i--) {
        const a = segs[i - 1],
          c2 = segs[i];
        if (a[2] === c2[2] && a[3] === c2[3] && Math.abs(a[1] - c2[0]) < 1e-6) {
          a[1] = c2[1];
          segs.splice(i, 1);
        }
      }
    }
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
    // Span-split: every gap edge cuts the wall; each span keeps the heights not covered by any gap over it
    // (gaps stacked at the same t on several floors used to wall each other up; an elevated gap without y1
    // defaulted its head to the WALL base + 2.3 and was closed).
    const segs = [];
    const gaps = (o.gaps || [])
      .map((g) => {
        const gy0 = g.y0 !== undefined ? g.y0 : y0,
          gy1 = g.y1 !== undefined ? g.y1 : gy0 + 2.3;
        return [
          Math.max(0, g.t - g.w / 2),
          Math.min(len, g.t + g.w / 2),
          Math.max(y0, gy0),
          Math.min(y1, gy1),
        ];
      })
      .filter((g) => g[1] - g[0] > 0.02 && g[3] - g[2] > 0.02);
    const cuts = [0, len];
    for (const g of gaps) cuts.push(g[0], g[1]);
    const xs = Array.from(
      new Set(cuts.map((v) => Math.round(v * 1e4) / 1e4)),
    ).sort((p, q) => p - q);
    for (let i = 0; i < xs.length - 1; i++) {
      const u0 = xs[i],
        u1 = xs[i + 1];
      if (u1 - u0 < 0.01) continue;
      const um = (u0 + u1) / 2;
      const over = gaps
        .filter((g) => g[0] < um && g[1] > um)
        .map((g) => [g[2], g[3]])
        .sort((p, q) => p[0] - q[0]);
      let v = y0;
      for (const g of over) {
        if (g[0] > v + 0.01) segs.push([u0, u1, v, g[0]]);
        v = Math.max(v, g[1]);
      }
      if (v < y1 - 0.01) segs.push([u0, u1, v, y1]);
    }
    segs.sort((p, q) => p[2] - q[2] || p[3] - q[3] || p[0] - q[0]);
    for (let i = segs.length - 1; i > 0; i--) {
      const a = segs[i - 1],
        c2 = segs[i];
      if (a[2] === c2[2] && a[3] === c2[3] && Math.abs(a[1] - c2[0]) < 1e-6) {
        a[1] = c2[1];
        segs.splice(i, 1);
      }
    }
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
