// play-inline-392 09 — yaw
// Lines 2436-2780 of readable/play-inline-392.pretty.js (statement-aligned).
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
  K.roundTable = function (b, x, y, z, r, o) {
    o = o || {};
    const h = o.h || 0.76;
    b.cyl(o.mat || "wood_dark", x, y + h - 0.05, z, r, r, 0.05, 14, {
      tint: o.tint,
      bottom: true,
    });
    if (o.cloth)
      b.cyl("cloth_white", x, y + h - 0.35, z, r + 0.06, r + 0.02, 0.32, 14, {
        tint: o.cloth,
        top: false,
      });
    b.cyl("black_iron", x, y, z, 0.05, 0.05, h - 0.05, 6);
    b.cyl("black_iron", x, y, z, 0.3, 0.22, 0.05, 8);
    if (o.col !== false)
      b.col(x - r * 0.75, y, z - r * 0.75, x + r * 0.75, y + h, z + r * 0.75, {
        tag: "furniture",
        surface: "wood",
      });
    return y + h;
  };
  K.chair = function (b, x, y, z, yaw, o) {
    o = o || {};
    const mat = o.mat || "wood_dark";
    if (o.fallen) {
      b.box(mat, x, y, z, 0.42, 0.42, 0.06, { yaw, tint: o.tint });
      b.box(mat, x, y + 0.02, z + 0.25, 0.42, 0.05, 0.42, {
        yaw,
        tint: o.tint,
      });
      return;
    }
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(o.seatMat || mat, x, y + 0.43, z, 0.44, 0.05, 0.44, {
      yaw,
      tint: o.seatTint || o.tint,
    });
    for (const [lx, lz] of [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ]) {
      const px = x + lx * 0.19 * c + lz * 0.19 * s,
        pz = z - lx * 0.19 * s + lz * 0.19 * c;
      b.box(mat, px, y, pz, 0.04, 0.43, 0.04, { yaw, tint: o.tint });
    }
    // back (on local +z side → facing -z when yaw 0 ... chair faces local -z)
    const bx = x + 0.2 * s,
      bz = z + 0.2 * c;
    b.box(mat, bx, y + 0.45, bz, 0.44, 0.5, 0.04, { yaw, tint: o.tint });
  };
  /** Banquette / sofa: length along local x, seat facing local -z. */
  K.sofa = function (b, x, y, z, len, yaw, o) {
    o = o || {};
    const mat = o.mat || "leather_red",
      d = o.d || 0.7;
    b.box(mat, x, y, z, len, 0.45, d, { yaw, tint: o.tint });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(
      mat,
      x + (d / 2 - 0.1) * s,
      y + 0.45,
      z + (d / 2 - 0.1) * c,
      len,
      o.backH || 0.5,
      0.2,
      { yaw, tint: o.tint },
    );
    if (o.arms !== false)
      for (const e of [-1, 1])
        b.box(
          mat,
          x + e * (len / 2 - 0.08) * c,
          y + 0.45,
          z - e * (len / 2 - 0.08) * s,
          0.16,
          0.22,
          d,
          { yaw, tint: o.tint },
        );
    if (o.col !== false)
      b.ocol(x, z, len, d, y, y + 0.5, yaw, {
        tag: "furniture",
        surface: "carpet",
      });
  };
  /** Bed: head at local +z. */
  K.bed = function (b, x, y, z, yaw, o) {
    o = o || {};
    const w = o.w || 1.4,
      L = o.l || 2.0;
    b.box(o.frame || "black_iron", x, y, z, w, 0.35, L, { yaw });
    b.box(o.sheet || "cloth_white", x, y + 0.35, z, w - 0.06, 0.18, L - 0.06, {
      yaw,
      tint: o.tint || [0.7, 0.66, 0.58],
    });
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    b.box(
      o.frame || "black_iron",
      x + (L / 2) * s,
      y,
      z + (L / 2) * c,
      w,
      1.1,
      0.06,
      { yaw },
    );
    b.box(
      "cloth_white",
      x + (L / 2 - 0.3) * s,
      y + 0.53,
      z + (L / 2 - 0.3) * c,
      w * 0.7,
      0.12,
      0.35,
      { yaw, tint: [0.8, 0.78, 0.7] },
    );
    if (o.col !== false)
      b.ocol(x, z, w, L, y, y + 0.55, yaw, {
        tag: "furniture",
        surface: "fabric",
      });
  };
  /** Shelf unit against a wall, facing (nx,nz). Items: cans/jars/bottles. */
