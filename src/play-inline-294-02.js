// play-inline-294 02 — math
// Lines 13-281 of readable/play-inline-294.pretty.js (statement-aligned).
  const PM = G._pm2;
  const TAU = Math.PI * 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  /**
   * Local frame for an interior: returns {X, Z, P, A, W, slab, ceil, rail, box}
   * (local x east, z south, y up relative to oy).
   */
  PM.frame = function (ox, oy, oz, b) {
    const F = {};
    F.X = (x) => ox + x;
    F.Z = (z) => oz + z;
    F.Y = (y) => oy + y;
    F.P = (x, y, z) => V3(ox + x, oy + y, oz + z);
    F.A = (x, y, z, yaw) => PM.anchor(ox + x, oy + y, oz + z, yaw || 0);
    /** wall along axis 'x' (runs x a0..a1 at z f0..f1) or 'z'; gaps [{c,w,y0,h}] in local units. */
    F.W = (key, ax, a0, a1, f0, f1, y0, y1, gaps, o) =>
      PM.wall(
        b,
        key,
        ax,
        ax === "x" ? F.X(a0) : F.Z(a0),
        ax === "x" ? F.X(a1) : F.Z(a1),
        ax === "x" ? F.Z(f0) : F.X(f0),
        ax === "x" ? F.Z(f1) : F.X(f1),
        oy + y0,
        oy + y1,
        (gaps || []).map((g) => ({
          c: ax === "x" ? F.X(g.c) : F.Z(g.c),
          w: g.w,
          y0: oy + g.y0,
          h: g.h,
        })),
        o,
      );
    /** box by local min/max */
    F.box = (key, x0, y0, z0, x1, y1, z1, o) =>
      b.boxMM(key, F.X(x0), oy + y0, F.Z(z0), F.X(x1), oy + y1, F.Z(z1), o);
    F.col = (x0, y0, z0, x1, y1, z1, o) =>
      PM.colMM(F.X(x0), oy + y0, F.Z(z0), F.X(x1), oy + y1, F.Z(z1), o);
    F.solid = (key, x0, y0, z0, x1, y1, z1, o) => {
      F.box(key, x0, y0, z0, x1, y1, z1, o);
      F.col(x0, y0, z0, x1, y1, z1, { walkable: false });
    };
    /** floor slab (top at y, thickness th) with rectangular holes [[x0,z0,x1,z1]], walkable colliders. */
    F.slab = (key, x0, z0, x1, z1, y, holes, o) => {
      o = o || {};
      const th = o.th || 0.4;
      const hs = (holes || []).slice();
      const xs = [x0, x1];
      for (const h of hs)
        xs.push(
          Math.max(x0, Math.min(x1, h[0])),
          Math.max(x0, Math.min(x1, h[2])),
        );
      xs.sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) {
        const a = xs[i],
          c = xs[i + 1];
        if (c - a < 0.01) continue;
        const mid = (a + c) / 2;
        const cut = hs
          .filter((h) => mid > h[0] && mid < h[2])
          .map((h) => [h[1], h[3]])
          .sort((p, q) => p[0] - q[0]);
        let z = z0;
        const segs = [];
        for (const k of cut) {
          if (k[0] > z) segs.push([z, Math.min(k[0], z1)]);
          z = Math.max(z, k[1]);
        }
        if (z < z1) segs.push([z, z1]);
        for (const [za, zb] of segs) {
          if (zb - za < 0.01) continue;
          b.boxMM(key, F.X(a), oy + y - th, F.Z(za), F.X(c), oy + y, F.Z(zb), {
            grime: o.grime === undefined ? 0.45 : o.grime,
            segLen: 6,
          });
          if (o.under)
            b.boxMM(
              o.under,
              F.X(a),
              oy + y - th - 0.02,
              F.Z(za),
              F.X(c),
              oy + y - th,
              F.Z(zb),
              { grime: 0.3, seg: false, segLen: 8 },
            );
          if (!o.noCol)
            PM.colMM(F.X(a), oy + y - th, F.Z(za), F.X(c), oy + y, F.Z(zb), {
              surface: o.surface || "concrete",
            });
        }
      }
    };
    /** railing along local points at local height y */
    F.rail = (pts, y, h, key, o) =>
      PM.railing(
        b,
        pts.map((p) =>
          p.length > 2
            ? [F.X(p[0]), F.Z(p[1]), oy + p[2]]
            : [F.X(p[0]), F.Z(p[1])],
        ),
        oy + y,
        h || 1.0,
        key || "iron",
        Object.assign({ collide: true }, o || {}),
      );
    /** glass balustrade: steel posts, a glass panel and a top rail + collider */
    F.glassRail = (x0, z0, x1, z1, y, o) => {
      o = o || {};
      const len = Math.hypot(x1 - x0, z1 - z0),
        ry = Math.atan2(-(z1 - z0), x1 - x0);
      const mx = F.X((x0 + x1) / 2),
        mz = F.Z((z0 + z1) / 2);
      b.box(o.glass || "glass_dark", mx, oy + y + 0.08, mz, len, 0.9, 0.03, {
        ry,
        seg: false,
        noAO: true,
        grime: 0.15,
      });
      b.box(o.rail || "white_steel", mx, oy + y + 1.0, mz, len, 0.06, 0.08, {
        ry,
        seg: false,
      });
      const n = Math.max(1, Math.round(len / 1.6));
      for (let i = 0; i <= n; i++) {
        const t = i / n;
        b.box(
          o.rail || "white_steel",
          F.X(x0 + (x1 - x0) * t),
          oy + y,
          F.Z(z0 + (z1 - z0) * t),
          0.06,
          1.05,
          0.06,
          { seg: false },
        );
      }
      PM.colWall(
        F.X(x0),
        F.Z(z0),
        F.X(x1),
        F.Z(z1),
        0.2,
        oy + y - 0.2,
        oy + y + 1.1,
        { walkable: false },
      );
    };
    return F;
  };

  // -------------------------------------------------------------------
  // Lair dressing
  // -------------------------------------------------------------------
  /** Meat-hook rack: a beam on two posts with hanging carcasses (dark humour, a ruins staple). */
  PM.meatRack = function (b, x, y, z, ry, w, n, seed) {
    const r = PM.rng(seed || x * 7 + z);
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (const sg of [-1, 1])
      b.box(
        "rust",
        x + (c * sg * w) / 2,
        y,
        z - (s * sg * w) / 2,
        0.12,
        2.5,
        0.12,
        { ry, seg: false },
      );
    b.box("rust", x, y + 2.45, z, w + 0.2, 0.1, 0.1, { ry, seg: false });
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n - 0.5,
        px = x + c * t * w,
        pz = z - s * t * w;
      b.beam("iron", V3(px, y + 2.45, pz), V3(px, y + 2.0, pz), 0.02, 0.02, {});
      const len = 0.8 + r() * 0.5;
      b.add("meat", new THREE.CapsuleGeometry(0.16 + r() * 0.06, len, 3, 6), {
        m: PM.m4(
          px,
          y + 2.0 - len / 2 - 0.15,
          pz,
          r() * TAU,
          (r() - 0.5) * 0.2,
          (r() - 0.5) * 0.2,
        ),
        grime: 0.6,
      });
    }
    PM.col(x, z, w, 0.4, y, y + 2.5, ry, { walkable: false });
  };
  /** Pile of bones and skulls. */
  PM.bonePile = function (b, x, y, z, rad, n, seed) {
    const r = PM.rng(seed || x * 3 + z * 11);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * rad;
      if (r() < 0.2)
        b.sphere(
          "bone",
          x + Math.cos(a) * d,
          y + 0.1,
          z + Math.sin(a) * d,
          0.11,
          { ws: 7, hs: 5, sy: 1.1 },
        );
      else
        b.add(
          "bone",
          new THREE.CylinderGeometry(0.025, 0.03, 0.35 + r() * 0.2, 5),
          {
            m: PM.m4(
              x + Math.cos(a) * d,
              y + 0.04,
              z + Math.sin(a) * d,
              r() * TAU,
              Math.PI / 2 + (r() - 0.5) * 0.3,
              0,
            ),
            grime: 0.5,
          },
        );
    }
  };
  /** Dirty Brute bedding: mattress + scraps + a tire pillow. */
  PM.nest = function (b, x, y, z, ry) {
    PM.dress.mattress(b, x, y, z, ry, 0x8a7a60);
    b.add("tire", new THREE.TorusGeometry(0.28, 0.1, 6, 10), {
      m: PM.m4(
        x - Math.sin(ry) * 0.9,
        y + 0.12,
        z - Math.cos(ry) * 0.9,
        0,
        Math.PI / 2,
      ),
    });
  };
  /** Fire barrel with baked light & flickering glow. */
  PM.fireBarrel = function (b, x, y, z, parent) {
    PM.barrel(b, x, y, z, { fire: true });
    PM.glow(V3(x, y + 1.3, z), 0xff8030, 2.2, parent, {
      intensity: 1.6,
      flicker: 0.5,
    });
  };
  /** Hanging museum spotlight track with 3 cans (visual). */
  PM.spotTrack = function (b, x0, z0, x1, z1, y, lit) {
    b.beam("black_steel", V3(x0, y, z0), V3(x1, y, z1), 0.08, 0.05, {});
    for (let i = 1; i <= 3; i++) {
      const t = i / 4,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      b.cyl("black_steel", x, y - 0.32, z, 0.09, 0.07, 0.28, 8, {
        hSeg: 1,
        rx: 0.5,
      });
      if (lit && i === 2)
        b.sphere("lamp", x, y - 0.36, z + 0.1, 0.06, {
          ws: 6,
          hs: 4,
          noAO: true,
          grime: 0,
        });
    }
  };
