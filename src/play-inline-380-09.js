// play-inline-380 09 — math
// Lines 2488-2829 of readable/play-inline-380.pretty.js (statement-aligned).
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
  K.stairs = function (b, x0, z0, x1, z1, y0, y1, dir, o) {
    o = o || {};
    const mat = o.mat || "concrete";
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (o.maxRise || 0.24)));
    const along = dir === "+x" || dir === "-x";
    const len = along ? x1 - x0 : z1 - z0;
    const run = len / n;
    for (let i = 0; i < n; i++) {
      const top = y0 + (rise * (i + 1)) / n;
      const bot = o.solid === false ? top - (o.thick || 0.35) : y0;
      let sx0, sx1, sz0, sz1;
      if (dir === "+x") {
        sx0 = x0 + run * i;
        sx1 = sx0 + run;
        sz0 = z0;
        sz1 = z1;
      } else if (dir === "-x") {
        sx1 = x1 - run * i;
        sx0 = sx1 - run;
        sz0 = z0;
        sz1 = z1;
      } else if (dir === "+z") {
        sz0 = z0 + run * i;
        sz1 = sz0 + run;
        sx0 = x0;
        sx1 = x1;
      } else {
        sz1 = z1 - run * i;
        sz0 = sz1 - run;
        sx0 = x0;
        sx1 = x1;
      }
      b.boxMM(mat, sx0, bot, sz0, sx1, top, sz1, {
        tint: o.tint,
        grime: o.grime,
        faces: "nsewtb",
      });
      if (o.nosing)
        b.boxMM(
          o.nosing,
          sx0 - (dir === "-x" ? 0.03 : 0),
          top - 0.04,
          sz0 - (dir === "-z" ? 0.03 : 0),
          sx1 + (dir === "+x" ? 0.03 : 0),
          top + 0.01,
          sz1 + (dir === "+z" ? 0.03 : 0),
          { grime: 0.2 },
        );
      b.col(sx0, bot, sz0, sx1, top, sz1, {
        tag: "stairs",
        surface: o.surface || "concrete",
      });
    }
    // rails
    const railMat = o.railMat || "black_iron";
    const rh = 0.95;
    const railLine = (side) => {
      // side: 'l' / 'r' relative to climbing direction
      let ax, az, bx, bz;
      const e = 0.06;
      if (dir === "+x") {
        const zz = side === "l" ? z0 + e : z1 - e;
        ax = x0;
        bx = x1;
        az = bz = zz;
      } else if (dir === "-x") {
        const zz = side === "l" ? z1 - e : z0 + e;
        ax = x1;
        bx = x0;
        az = bz = zz;
      } else if (dir === "+z") {
        const xx = side === "l" ? x1 - e : x0 + e;
        az = z0;
        bz = z1;
        ax = bx = xx;
      } else {
        const xx = side === "l" ? x0 + e : x1 - e;
        az = z1;
        bz = z0;
        ax = bx = xx;
      }
      b.beam(
        o.handMat || "mahogany",
        ax,
        y0 + rh,
        az,
        bx,
        y1 + rh,
        bz,
        0.07,
        0.06,
      );
      const posts = Math.max(2, Math.ceil(Math.hypot(bx - ax, bz - az) / 0.5));
      for (let k = 0; k <= posts; k++) {
        const t = k / posts,
          px = ax + (bx - ax) * t,
          pz = az + (bz - az) * t,
          py = y0 + rise * Math.min(1, (Math.floor(t * n) + 1) / n);
        b.beam(railMat, px, py, pz, px, y0 + rise * t + rh, pz, 0.025, 0.025);
      }
      if (o.lace) {
        // lace panel under the handrail (Chelsea)
        const pL = [ax, y0 + 0.1, az],
          pR = [bx, y1 + 0.1, bz],
          pRT = [bx, y1 + rh - 0.05, bz],
          pLT = [ax, y0 + rh - 0.05, az];
        b.quad("lace", pL, pR, pRT, pLT, {
          tint: [0.2, 0.19, 0.18],
          grime: 0,
          rect: [0, 0, Math.hypot(bx - ax, bz - az) / 1.8, 1],
        });
      }
      // thin collider along the rail
      const cx = (ax + bx) / 2,
        cz = (az + bz) / 2;
      if (o.railCol !== false)
        b.col(
          Math.min(ax, bx) - 0.05,
          Math.min(y0, y1),
          Math.min(az, bz) - 0.05,
          Math.max(ax, bx) + 0.05,
          Math.max(y0, y1) + rh,
          Math.max(az, bz) + 0.05,
          { tag: "rail", walkable: false },
        );
      void cx;
      void cz;
    };
    if (o.rail === "l" || o.rail === "both") railLine("l");
    if (o.rail === "r" || o.rail === "both") railLine("r");
  };
  /** Level railing (posts + handrail [+ lace]) from A to B at floor y. */
  K.railing = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.0,
      mat = o.mat || "black_iron";
    b.beam(o.handMat || "mahogany", ax, y + h, az, bx, y + h, bz, 0.08, 0.06);
    const len = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.ceil(len / (o.step || 0.5)));
    if (o.lace)
      b.quad(
        "lace",
        [ax, y + 0.05, az],
        [bx, y + 0.05, bz],
        [bx, y + h - 0.04, bz],
        [ax, y + h - 0.04, az],
        {
          tint: o.laceTint || [0.2, 0.19, 0.18],
          grime: 0,
          rect: [0, 0, len / 1.8, 1],
        },
      );
    else
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        b.beam(
          mat,
          ax + (bx - ax) * t,
          y,
          az + (bz - az) * t,
          ax + (bx - ax) * t,
          y + h,
          az + (bz - az) * t,
          0.03,
          0.03,
        );
      }
    if (!o.lace) b.beam(mat, ax, y + 0.1, az, bx, y + 0.1, bz, 0.03, 0.03);
    if (o.col !== false)
      b.col(
        Math.min(ax, bx) - 0.06,
        y,
        Math.min(az, bz) - 0.06,
        Math.max(ax, bx) + 0.06,
        y + h + 0.05,
        Math.max(az, bz) + 0.06,
        { tag: "rail", walkable: false },
      );
  };

  // ------------------------------------------------------------------
  // Furniture & dressing (local coords, interior builder)
  // ------------------------------------------------------------------
  K.table = function (b, x, y, z, w, d, o) {
    o = o || {};
    const h = o.h || 0.76,
      mat = o.mat || "wood_dark",
      yaw = o.yaw || 0;
    b.box(mat, x, y + h - 0.05, z, w, 0.05, d, {
      yaw,
      tint: o.tint,
      faces: "nsewtb",
    });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    if (o.pedestal) {
      b.cyl(o.legMat || "black_iron", x, y, z, 0.05, 0.05, h - 0.05, 6);
      b.cyl(o.legMat || "black_iron", x, y, z, 0.28, 0.2, 0.05, 8);
    } else
      for (const [lx, lz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ]) {
        const px = x + lx * (w / 2 - 0.06) * c + lz * (d / 2 - 0.06) * s,
          pz = z - lx * (w / 2 - 0.06) * s + lz * (d / 2 - 0.06) * c;
        b.box(o.legMat || mat, px, y, pz, 0.05, h - 0.05, 0.05, {
          yaw,
          tint: o.tint,
        });
      }
    if (o.col !== false)
      b.ocol(x, z, w, d, y, y + h, yaw, { tag: "furniture", surface: "wood" });
    return y + h;
  };
