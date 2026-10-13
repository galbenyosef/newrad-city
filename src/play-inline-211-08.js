// play-inline-211 08 — opts
// Lines 1978-2312 of readable/play-inline-211.pretty.js (statement-aligned).
  PH.colMM = (x0, y0, z0, x1, y1, z1, opts) =>
    PH.col(
      (x0 + x1) / 2,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      Math.abs(z1 - z0),
      y0,
      y1,
      0,
      opts,
    );
  /** Wall collider between two XZ points (thickness t), not walkable by default. */
  PH.colWall = function (x0, z0, x1, z1, t, y0, y1, opts) {
    const dx = x1 - x0,
      dz = z1 - z0,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return null;
    return PH.col(
      (x0 + x1) / 2,
      (z0 + z1) / 2,
      len,
      t,
      y0,
      y1,
      Math.atan2(-dz, dx),
      Object.assign({ walkable: false }, opts || {}),
    );
  };

  // -------------------------------------------------------------------
  // Architecture helpers
  // -------------------------------------------------------------------
  /**
   * Straight flight of stairs climbing along local +Z (rotated ry) from (x,z,y0) to y1 over `run`.
   * Step colliders ≤ maxRise (0.3). opts: {rails:key, cheeks:key, solid:true, base, surface, c}
   */
  PH.stairs = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (opts.maxRise || 0.3)));
    const stepRun = run / n,
      stepH = rise / n;
    for (let i = 0; i < n; i++) {
      const top = y0 + stepH * (i + 1);
      const base =
        opts.solid === false
          ? top - 0.22
          : opts.base === undefined
            ? y0 - 0.05
            : opts.base;
      const [wx, wz] = PH.rot(x, z, ry, 0, stepRun * (i + 0.5));
      b.box(key, wx, base, wz, width, top - base, stepRun + 0.02, {
        ry,
        seg: false,
        grime: opts.grime,
        c: opts.c,
      });
      PH.col(wx, wz, width, stepRun + 0.02, base, top, ry, {
        surface: opts.surface || "concrete",
      });
    }
    if (opts.solid === false) {
      // stringers under open steel stairs
      for (const s of [-1, 1]) {
        const [ax, az] = PH.rot(x, z, ry, s * (width / 2 - 0.05), 0),
          [bx, bz] = PH.rot(x, z, ry, s * (width / 2 - 0.05), run);
        b.beam(
          opts.stringer || key,
          PH.v3(ax, y0 - 0.25, az),
          PH.v3(bx, y1 - 0.25, bz),
          0.1,
          0.3,
        );
      }
    }
    if (opts.rails) {
      for (const s of opts.railSides || [-1, 1]) {
        const [ax, az] = PH.rot(x, z, ry, s * (width / 2 - 0.04), 0),
          [bx, bz] = PH.rot(x, z, ry, s * (width / 2 - 0.04), run);
        b.rod(
          opts.rails,
          PH.v3(ax, y0 + 0.95, az),
          PH.v3(bx, y1 + 0.95, bz),
          0.035,
          6,
        );
        for (let k = 0; k <= n; k += 3) {
          const t = k / n;
          const px = ax + (bx - ax) * t,
            pz = az + (bz - az) * t,
            py = y0 + rise * t;
          b.rod(
            opts.rails,
            PH.v3(px, py, pz),
            PH.v3(px, py + 0.95, pz),
            0.025,
            5,
          );
        }
      }
    }
    return n;
  };
  /**
   * Room shell: floor, optional ceiling, 4 walls with door gaps, colliders.
   * r = {x0,z0,x1,z1,y,h, wall, wall2 (inner face override), floor, ceil, t (wall thickness), doors:[{side:'n'|'s'|'e'|'w', at (0..1 or abs coord via abs:true), w, h}],
   *      noWalls:{n,s,e,w}, noFloor, noCeil, base (skirting key), trim (cornice key)}
   * Walls are built OUTSIDE-in: centred on the room edge.
   */
  PH.room = function (b, r) {
    const t = r.t || 0.3,
      y = r.y || 0,
      h = r.h || 3.2;
    if (!r.noFloor) {
      b.boxMM(r.floor || "concrete", r.x0, y - 0.3, r.z0, r.x1, y, r.z1, {
        grime: r.floorGrime === undefined ? 0.4 : r.floorGrime,
      });
      PH.colMM(r.x0, y - 0.3, r.z0, r.x1, y, r.z1, {
        surface: r.surface || "concrete",
      });
    }
    if (!r.noCeil) {
      b.boxMM(r.ceil || "plaster", r.x0, y + h, r.z0, r.x1, y + h + 0.3, r.z1, {
        grime: 0.5,
      });
      PH.colMM(r.x0, y + h, r.z0, r.x1, y + h + 0.3, r.z1, {
        walkable: r.ceilWalkable !== false,
      });
    }
    const sides = {
      n: [r.x0, r.z0, r.x1, r.z0],
      s: [r.x0, r.z1, r.x1, r.z1],
      w: [r.x0, r.z0, r.x0, r.z1],
      e: [r.x1, r.z0, r.x1, r.z1],
    };
    for (const s of ["n", "s", "w", "e"]) {
      if (r.noWalls && r.noWalls[s]) continue;
      const [ax, az, bx, bz] = sides[s];
      const horiz = az === bz;
      const len = horiz ? bx - ax : bz - az;
      const gaps = (r.doors || [])
        .filter((d) => d.side === s)
        .map((d) => {
          const c = d.abs ? (horiz ? d.at - ax : d.at - az) : d.at * len;
          return [c - d.w / 2, c + d.w / 2, d.h || 2.4];
        })
        .sort((p, q) => p[0] - q[0]);
      let cur = -t / 2;
      const seg = (u0, u1, yb, yt) => {
        if (u1 - u0 < 0.01 || yt - yb < 0.01) return;
        const cx = horiz ? ax + (u0 + u1) / 2 : ax,
          cz = horiz ? az : az + (u0 + u1) / 2;
        const w = horiz ? u1 - u0 : t,
          d = horiz ? t : u1 - u0;
        b.box(r.wall || "plaster", cx, yb, cz, w, yt - yb, d, {
          grime: r.wallGrime,
        });
        PH.col(cx, cz, w, d, yb, yt, 0, { walkable: false });
      };
      for (const gp of gaps) {
        seg(cur, gp[0], y, y + h);
        seg(gp[0], gp[1], y + gp[2], y + h); // lintel
        cur = gp[1];
      }
      seg(cur, len + t / 2, y, y + h);
      if (r.base) {
        // skirting board inside
        const inward = { n: [0, 1], s: [0, -1], w: [1, 0], e: [-1, 0] }[s];
        let c2 = 0;
        const sk = (u0, u1) => {
          if (u1 - u0 < 0.05) return;
          const cx = horiz
              ? ax + (u0 + u1) / 2
              : ax + inward[0] * (t / 2 + 0.02),
            cz = horiz ? az + inward[1] * (t / 2 + 0.02) : az + (u0 + u1) / 2;
          b.box(
            r.base,
            cx,
            y,
            cz,
            horiz ? u1 - u0 : 0.05,
            0.22,
            horiz ? 0.05 : u1 - u0,
            { seg: false, grime: 0.6 },
          );
        };
        for (const gp of gaps) {
          sk(c2, gp[0]);
          c2 = gp[1];
        }
        sk(c2, len);
      }
    }
  };
  /**
   * Straight wall centred on the line (x0,z0)→(x1,z1), thickness t, y0..y1, with openings.
   * gaps: [{c: distance along the wall from (x0,z0), w, b: bottom offset above y0 (0 = door), h}]
   * opts: {t, grime, c, wainscot:{key,h} (inner cladding both faces), noCol}
   */
  PH.wall = function (b, key, x0, z0, x1, z1, y0, y1, gaps, opts) {
    opts = opts || {};
    const t = opts.t || 0.3;
    const len = Math.hypot(x1 - x0, z1 - z0);
    if (len < 0.01) return;
    const ux = (x1 - x0) / len,
      uz = (z1 - z0) / len,
      ry = Math.atan2(-uz, ux);
    const seg = (u0, u1, ya, yb) => {
      if (u1 - u0 < 0.02 || yb - ya < 0.02) return;
      const cx = x0 + (ux * (u0 + u1)) / 2,
        cz = z0 + (uz * (u0 + u1)) / 2;
      b.box(key, cx, ya, cz, u1 - u0, yb - ya, t, {
        ry,
        grime: opts.grime,
        c: opts.c,
      });
      if (opts.wainscot && ya < y0 + opts.wainscot.h) {
        const top = Math.min(yb, y0 + opts.wainscot.h);
        b.box(opts.wainscot.key, cx, ya, cz, u1 - u0, top - ya, t + 0.06, {
          ry,
          grime: 0.35,
          seg: false,
        });
      }
      if (!opts.noCol)
        PH.col(cx, cz, u1 - u0, t, ya, yb, ry, { walkable: false });
    };
    const gs = (gaps || []).slice().sort((p, q) => p.c - q.c);
    let cur = -(opts.ext === undefined ? t / 2 : opts.ext);
    for (const g of gs) {
      const a = g.c - g.w / 2,
        e = g.c + g.w / 2,
        gb = y0 + (g.b || 0),
        gt = gb + (g.h || 2.4);
      seg(cur, a, y0, y1);
      seg(a, e, y0, gb);
      seg(a, e, gt, y1);
      cur = e;
    }
    seg(cur, len + (opts.ext === undefined ? t / 2 : opts.ext), y0, y1);
  };
  /**
   * Fill the ground-level void around an interior's rooms with solid (non-walkable) colliders so that
   * generic spawners (combat's interior fallback) can never place actors outside the rooms.
   * Local coords (current origin). rooms: [[x0,z0,x1,z1]], circles: [[x,z,r]]. Run-length boxes per row.
   */
  PH.fillVoid = function (x0, z0, x1, z1, rooms, circles, step, yTop) {
    step = step || 2;
    yTop = yTop || 3.2;
    const pad = 0.4;
    const inside = (x, z) =>
      rooms.some(
        (r) =>
          x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad,
      ) ||
      (circles || []).some((c) => Math.hypot(x - c[0], z - c[1]) < c[2] + pad);
    const cellFree = (cx, cz) => {
      const h = step / 2;
      return (
        !inside(cx - h, cz - h) &&
        !inside(cx + h, cz - h) &&
        !inside(cx - h, cz + h) &&
        !inside(cx + h, cz + h) &&
        !inside(cx, cz)
      );
    };
    let n = 0;
    for (let z = z0 + step / 2; z < z1; z += step) {
      let start = null;
      for (let x = x0 + step / 2; x <= x1 + step; x += step) {
        const free = x < x1 && cellFree(x, z);
        if (free && start === null) start = x;
        if (!free && start !== null) {
          const a = start - step / 2,
            e = x - step / 2;
          PH.colMM(a, 0, z - step / 2, e, yTop, z + step / 2, {
            walkable: false,
            tag: "poi_harbor_void",
          });
          n++;
          start = null;
        }
      }
    }
    return n;
  };
  /** Floor slab rectangle with collider (top at y). */
  PH.slab = function (b, key, x0, z0, x1, z1, y, th, opts) {
    th = th || 0.3;
    b.boxMM(key, x0, y - th, z0, x1, y, z1, opts || { grime: 0.4 });
    PH.colMM(x0, y - th, z0, x1, y, z1, {
      surface: (opts && opts.surface) || "concrete",
    });
  };
  /** Railing along a polyline (pts [[x,z],...]) at floor y. key: material. Collider 1.1 m. */
  PH.railing = function (b, pts, y, h, key, opts) {
    opts = opts || {};
    h = h || 1.0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, az] = pts[i],
        [bx, bz] = pts[i + 1];
      const len = Math.hypot(bx - ax, bz - az);
      if (len < 0.05) continue;
      b.rod(
        key,
        PH.v3(ax, y + h, az),
        PH.v3(bx, y + h, bz),
        opts.r || 0.035,
        6,
      );
      b.rod(
        key,
        PH.v3(ax, y + h * 0.5, az),
        PH.v3(bx, y + h * 0.5, bz),
        (opts.r || 0.035) * 0.7,
        5,
      );
      const n = Math.max(1, Math.round(len / (opts.postStep || 1.5)));
      for (let k = 0; k <= n; k++) {
        const t2 = k / n;
        const px = ax + (bx - ax) * t2,
          pz = az + (bz - az) * t2;
        b.rod(
          key,
          PH.v3(px, y, pz),
          PH.v3(px, y + h, pz),
          (opts.r || 0.035) * 0.9,
          5,
        );
      }
      if (opts.collide !== false)
        PH.colWall(ax, az, bx, bz, 0.2, y, y + Math.max(1.15, h + 0.1));
    }
  };
  /** Hanging lamp: cord + shade + emissive bulb (atmosphere's interior scan turns these into light pools). */
