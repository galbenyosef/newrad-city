// play-inline-225 08 — math
// Lines 1935-2284 of readable/play-inline-225.pretty.js (statement-aligned).
  A.wallLine = function (C, key, p, q, y0, y1, t, gaps, o) {
    o = o || {};
    const b = o.batch || C.b;
    const dx = q[0] - p[0],
      dz = q[1] - p[1],
      L = Math.hypot(dx, dz),
      ux = dx / L,
      uz = dz / L,
      ry = Math.atan2(-dz, dx);
    const nx = -uz,
      nz = ux,
      off = o.off || 0; // left normal
    const segs = [];
    let cur = 0;
    for (const g of (gaps || []).slice().sort((m, n) => m.a - n.a)) {
      if (g.a > cur) segs.push([cur, g.a, y0, y1]);
      const top = g.top === undefined ? y0 + 2.4 : g.top;
      if (top < y1) segs.push([g.a, g.b, top, y1]);
      if (g.sill !== undefined && g.sill > y0)
        segs.push([g.a, g.b, y0, g.sill]);
      cur = g.b;
    }
    if (cur < L) segs.push([cur, L, y0, y1]);
    for (const s of segs) {
      const len = s[1] - s[0],
        hh = s[3] - s[2];
      if (len < 0.01 || hh < 0.01) continue;
      const m = (s[0] + s[1]) / 2,
        cx = p[0] + ux * m + nx * off,
        cz = p[1] + uz * m + nz * off;
      b.obox(key, cx, (s[2] + s[3]) / 2, cz, len, hh, t, ry, o);
      if (o.col !== false)
        C.colRot(cx, cz, len, t, s[2], s[3], ry, {
          walkable: false,
          surface: o.surface,
        });
    }
  };
  /** Local frame: origin (ox,oz), unit u (ux,uz); v = left-hand normal (−uz? no: (−uz, ux)) unless flip. */
  A.frame = function (ox, oz, ux, uz, flip) {
    const L = Math.hypot(ux, uz);
    ux /= L;
    uz /= L;
    const vx = flip ? uz : -uz,
      vz = flip ? -ux : ux;
    const ry = Math.atan2(-uz, ux);
    return {
      ry,
      ux,
      uz,
      vx,
      vz,
      p: (u, v) => [ox + ux * u + vx * v, oz + uz * u + vz * v],
      /** oriented box by frame ranges u0..u1, v0..v1, y0..y1 */
      box(C, key, u0, u1, v0, v1, y0, y1, o) {
        const c = this.p((u0 + u1) / 2, (v0 + v1) / 2);
        ((o && o.batch) || C.b).obox(
          key,
          c[0],
          (y0 + y1) / 2,
          c[1],
          Math.abs(u1 - u0),
          Math.abs(y1 - y0),
          Math.abs(v1 - v0),
          ry,
          o,
        );
      },
      col(C, u0, u1, v0, v1, y0, y1, o) {
        const c = this.p((u0 + u1) / 2, (v0 + v1) / 2);
        return C.colRot(
          c[0],
          c[1],
          Math.abs(u1 - u0),
          Math.abs(v1 - v0),
          y0,
          y1,
          ry,
          o,
        );
      },
    };
  };
  /** Floor slab with walkable collider: top at y. */
  A.floor = function (C, key, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = o.batch || C.b;
    const th = o.th || 0.3;
    b.box(key, x0, y - th, z0, x1, y, z1, Object.assign({ noAO: true }, o));
    if (o.col !== false)
      C.col(x0, o.solid ? 0 : y - th, z0, x1, y, z1, {
        surface: o.surface || "concrete",
      });
  };
  /** Ceiling slab (visual only unless o.col). Bottom at y. */
  A.ceil = function (C, key, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.box(
      key,
      x0,
      y,
      z0,
      x1,
      y + (o.th || 0.3),
      z1,
      Object.assign({ noAO: true }, o),
    );
    if (o.col) C.col(x0, y, z0, x1, y + (o.th || 0.3), z1, { walkable: false });
  };
  /**
   * Straight stair. (x,z) = centre of the bottom edge; dir: 'n' (−z) | 's' | 'e' | 'w'; w = width; from y0 to y1.
   * Rise ≤ o.rise (0.22). Colliders per step (solid). Returns {x, z, y, run} of the top edge centre.
   */
  A.stairs = function (C, key, x, z, dir, w, y0, y1, o) {
    o = o || {};
    const b = o.batch || C.b;
    const H = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(H) / (o.rise || 0.22))),
      rise = H / n,
      tread = o.tread || 0.3;
    const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0,
      dz = dir === "s" ? 1 : dir === "n" ? -1 : 0;
    for (let i = 0; i < n; i++) {
      const top = y0 + rise * (i + 1),
        d0 = i * tread,
        d1 = (i + 1) * tread;
      const bot = o.thin ? Math.max(y0, top - 0.35) : y0;
      let x0, x1, z0, z1;
      if (dx) {
        x0 = x + dx * d0;
        x1 = x + dx * d1;
        z0 = z - w / 2;
        z1 = z + w / 2;
      } else {
        z0 = z + dz * d0;
        z1 = z + dz * d1;
        x0 = x - w / 2;
        x1 = x + w / 2;
      }
      b.box(
        key,
        Math.min(x0, x1),
        bot,
        Math.min(z0, z1),
        Math.max(x0, x1),
        top,
        Math.max(z0, z1),
        o,
      );
      if (o.nose) {
        // bullnose / tread edge
        if (dx)
          b.box(
            o.nose,
            dx > 0 ? x0 - 0.02 : x1 - 0.03,
            top - 0.04,
            z0,
            dx > 0 ? x0 + 0.03 : x1 + 0.02,
            top + 0.01,
            z1,
            { noAO: true },
          );
        else
          b.box(
            o.nose,
            x0,
            top - 0.04,
            dz > 0 ? z0 - 0.02 : z1 - 0.03,
            x1,
            top + 0.01,
            dz > 0 ? z0 + 0.03 : z1 + 0.02,
            { noAO: true },
          );
      }
      C.col(
        Math.min(x0, x1),
        y0,
        Math.min(z0, z1),
        Math.max(x0, x1),
        top,
        Math.max(z0, z1),
        { surface: o.surface || "concrete" },
      );
    }
    return {
      x: x + dx * n * tread,
      z: z + dz * n * tread,
      y: y1,
      run: n * tread,
    };
  };
  /** Railing along a polyline at base height y (h tall). Collider (not walkable). */
  A.rail = function (C, key, pts, y, h, o) {
    o = o || {};
    const b = o.batch || C.b;
    h = h || 1.0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i],
        q = pts[i + 1],
        L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      b.beam(
        key,
        [p[0], y + h, p[1]],
        [q[0], y + h, q[1]],
        o.top || 0.07,
        o.top || 0.07,
      );
      if (o.mid !== false)
        b.beam(
          key,
          [p[0], y + h * 0.5, p[1]],
          [q[0], y + h * 0.5, q[1]],
          0.035,
          0.035,
        );
      const n = Math.max(1, Math.round(L / (o.step || 1.2)));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        b.box(
          key,
          p[0] + (q[0] - p[0]) * t - 0.025,
          y,
          p[1] + (q[1] - p[1]) * t - 0.025,
          p[0] + (q[0] - p[0]) * t + 0.025,
          y + h,
          p[1] + (q[1] - p[1]) * t + 0.025,
        );
      }
      if (o.col !== false)
        C.colRot(
          (p[0] + q[0]) / 2,
          (p[1] + q[1]) / 2,
          L,
          0.15,
          y,
          y + h,
          Math.atan2(-(q[1] - p[1]), q[0] - p[0]),
          { walkable: false, surface: "metal" },
        );
    }
  };
  /** Balustrade (turned balusters) along a line. */
  A.balustrade = function (C, key, p, q, y, h, o) {
    o = o || {};
    const b = o.batch || C.b;
    h = h || 1.0;
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]),
      ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
    const cx = (p[0] + q[0]) / 2,
      cz = (p[1] + q[1]) / 2;
    b.obox(key, cx, y + h - 0.08, cz, L, 0.16, 0.3, ry);
    b.obox(key, cx, y + 0.06, cz, L, 0.12, 0.26, ry);
    const n = Math.max(2, Math.round(L / 0.32));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      b.lathe(
        key,
        [
          [0, 0],
          [0.07, 0.02],
          [0.05, 0.2],
          [0.09, 0.42],
          [0.04, 0.62],
          [0.06, h - 0.3],
          [0, h - 0.28],
        ],
        6,
        p[0] + (q[0] - p[0]) * t,
        y + 0.12,
        p[1] + (q[1] - p[1]) * t,
      );
    }
    if (o.col !== false)
      C.colRot(cx, cz, L, 0.3, y, y + h, ry, { walkable: false });
  };
  /** Classical column: base, shaft (fluted look via 16-sided), capital. */
  A.column = function (C, key, x, y0, z, h, r, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.box(
      key,
      x - r * 1.35,
      y0,
      z - r * 1.35,
      x + r * 1.35,
      y0 + 0.25,
      z + r * 1.35,
    );
    b.cyl(key, x, y0 + 0.25, z, r * 1.15, r * 1.25, 0.2, 16);
    b.cyl(o.shaft || key, x, y0 + 0.45, z, r * 0.88, r, h - 1.0, 16);
    if (o.ionic) {
      b.cyl(key, x, y0 + h - 0.55, z, r * 1.1, r * 0.9, 0.25, 16);
      b.box(
        key,
        x - r * 1.5,
        y0 + h - 0.35,
        z - r * 1.1,
        x + r * 1.5,
        y0 + h - 0.15,
        z + r * 1.1,
      );
      for (const s of [-1, 1])
        b.cyl(
          key,
          x + s * r * 1.35,
          y0 + h - 0.5,
          z - r * 1.15,
          0.16,
          0.16,
          r * 2.3,
          10,
          { rx: Math.PI / 2 },
        );
    } else
      b.lathe(
        key,
        [
          [r * 0.9, 0],
          [r * 1.35, 0.35],
          [r * 1.5, 0.45],
          [0, 0.45],
        ],
        16,
        x,
        y0 + h - 0.55,
        z,
      );
    b.box(
      key,
      x - r * 1.5,
      y0 + h - 0.12,
      z - r * 1.5,
      x + r * 1.5,
      y0 + h,
      z + r * 1.5,
    );
    if (o.col !== false)
      C.col(x - r, y0, z - r, x + r, y0 + h, z + r, { walkable: false });
    if (r >= 0.18 && h >= 2.4 && b.occlude)
      b.occluder(
        x - r * 0.8,
        y0 + 0.3,
        z - r * 0.8,
        x + r * 0.8,
        y0 + h - 0.3,
        z + r * 0.8,
      ); // columns shadow the baked light
  };
  /** Semicircular arch (extruded ring) spanning w at (cx, springY), depth d, facing axis 'x' (opening along x) or 'z'. */
