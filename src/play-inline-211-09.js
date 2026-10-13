// play-inline-211 09 — opts
// Lines 2313-2594 of readable/play-inline-211.pretty.js (statement-aligned).
  PH.hangLamp = function (b, x, y, z, drop, opts) {
    opts = opts || {};
    b.rod(
      opts.cord || "black",
      PH.v3(x, y, z),
      PH.v3(x, y - drop, z),
      0.012,
      4,
    );
    b.lathe(
      opts.shade || "metal",
      [
        [0.05, 0],
        [0.12, -0.05],
        [0.28, -0.22],
        [0.3, -0.25],
      ],
      12,
      x,
      y - drop,
      z,
      { grime: 0.3 },
    );
    b.sphere(opts.bulb || "lamp", x, y - drop - 0.17, z, 0.1, {
      ws: 8,
      hs: 6,
      noAO: true,
    });
    if (b.lights || opts.bake)
      b.addLight(
        x,
        y - drop - 0.4,
        z,
        opts.color === undefined ? 0xffcf8a : opts.color,
        opts.r || 9,
        opts.i || 0.9,
      );
  };
  /** Wall-mounted caged bulb. ry = direction the wall faces (THREE ry). */
  PH.cageLamp = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const [fx, fz] = PH.rot(0, 0, ry, 0, 0.14);
    b.box("metal", x, y - 0.08, z, 0.16, 0.16, 0.06, { ry, seg: false });
    b.sphere(opts.bulb || "lamp", x + fx, y, z + fz, 0.07, {
      ws: 8,
      hs: 6,
      noAO: true,
    });
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * TAU;
      b.rod(
        "iron",
        PH.v3(
          x + fx + Math.cos(a) * 0.09,
          y - 0.1,
          z + fz + Math.sin(a) * 0.09,
        ),
        PH.v3(
          x + fx + Math.cos(a) * 0.09,
          y + 0.1,
          z + fz + Math.sin(a) * 0.09,
        ),
        0.008,
        3,
      );
    }
    if (b.lights)
      b.addLight(
        x + fx * 3,
        y,
        z + fz * 3,
        opts.color === undefined ? 0xffd090 : opts.color,
        opts.r || 7,
        opts.i || 0.8,
      );
  };
  /** Fluorescent tube fixture. */
  PH.tubeLamp = function (b, x, y, z, len, ry, opts) {
    opts = opts || {};
    b.box("metal", x, y - 0.06, z, 0.24, 0.06, len, { ry, seg: false });
    if (opts.dead)
      b.box("paint_white", x, y - 0.12, z, 0.06, 0.06, len * 0.95, {
        ry,
        seg: false,
      });
    else
      b.box(opts.bulb || "lamp_cold", x, y - 0.12, z, 0.07, 0.06, len * 0.95, {
        ry,
        seg: false,
        noAO: true,
      });
    if (b.lights && !opts.dead)
      b.addLight(
        x,
        y - 0.5,
        z,
        opts.color === undefined ? 0xcfe6ff : opts.color,
        opts.r || 8,
        opts.i || 0.7,
      );
  };
  /** Skeleton (bundled bones) lying/slumped at (x,y,z). */
  PH.skeleton = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PH.m4(x, y, z, ry || 0);
    const add = (geo, m) =>
      b.add("bone", geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    if (opts.sit) {
      add(
        new THREE.SphereGeometry(0.11, 8, 6),
        PH.m4(0, 0.78, 0.05, 0, 0.5, 0),
      );
      add(
        new THREE.CylinderGeometry(0.03, 0.03, 0.5, 5),
        PH.m4(0, 0.45, 0, 0, 0.2, 0),
      );
      for (let k = 0; k < 5; k++)
        add(
          new THREE.TorusGeometry(0.1 - k * 0.008, 0.012, 4, 10, Math.PI * 1.3),
          PH.m4(0, 0.35 + k * 0.07, 0.02, 0, Math.PI / 2 + 0.2, 0),
        );
      for (const s of [-1, 1]) {
        add(
          new THREE.CylinderGeometry(0.025, 0.02, 0.42, 5),
          PH.m4(s * 0.1, 0.12, -0.22, 0, Math.PI / 2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.4, 5),
          PH.m4(s * 0.1, 0.02, -0.45, 0, 0.2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.5, 5),
          PH.m4(s * 0.2, 0.45, -0.05, 0, 0.2, s * 0.3),
        );
      }
    } else {
      add(new THREE.SphereGeometry(0.11, 8, 6), PH.m4(0, 0.1, 0.78, 0.4));
      add(
        new THREE.CylinderGeometry(0.03, 0.03, 0.55, 5),
        PH.m4(0, 0.06, 0.45, 0, Math.PI / 2, 0),
      );
      for (let k = 0; k < 5; k++)
        add(
          new THREE.TorusGeometry(0.1 - k * 0.008, 0.012, 4, 10, Math.PI * 1.3),
          PH.m4(0, 0.08, 0.3 + k * 0.07, 0, 0, 0),
        );
      for (const s of [-1, 1]) {
        add(
          new THREE.CylinderGeometry(0.025, 0.02, 0.45, 5),
          PH.m4(s * 0.1, 0.04, -0.05, s * 0.15, Math.PI / 2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.02, 0.42, 5),
          PH.m4(s * 0.14, 0.04, -0.45, s * 0.1, Math.PI / 2, 0),
        );
        add(
          new THREE.CylinderGeometry(0.02, 0.018, 0.5, 5),
          PH.m4(s * 0.24, 0.04, 0.35, s * 0.5, Math.PI / 2, 0),
        );
      }
    }
  };
  /** Sandbag wall along a segment. */
  PH.sandbags = function (b, x0, z0, x1, z1, rows, opts) {
    opts = opts || {};
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const n = Math.max(1, Math.round(len / 0.62));
    for (let r = 0; r < rows; r++)
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5 + (r % 2) * 0.5) / n;
        if (t > 1) continue;
        const x = x0 + (x1 - x0) * t,
          z = z0 + (z1 - z0) * t;
        b.box("burlap", x, (opts.y || 0) + r * 0.26, z, 0.6, 0.27, 0.36, {
          ry: ry + (U.hash2(i, r) - 0.5) * 0.15,
          seg: false,
          c: 0xb8a888,
        });
      }
    PH.colWall(
      x0,
      z0,
      x1,
      z1,
      0.5,
      opts.y || 0,
      (opts.y || 0) + rows * 0.26 + 0.05,
      { walkable: true },
    );
  };
  /** Scrap-metal wall panel run (raider fortifications). */
  PH.scrapWall = function (b, x0, z0, x1, z1, h, opts) {
    opts = opts || {};
    const len = Math.hypot(x1 - x0, z1 - z0),
      ry = Math.atan2(-(z1 - z0), x1 - x0);
    const r = PH.rng("scrap" + x0 + z0);
    const n = Math.max(1, Math.round(len / 1.3));
    const keys = ["corrugated", "rust", "metal", "panel", "rotten"];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      const hh = h * (0.8 + r() * 0.35);
      b.box(
        keys[(r() * keys.length) | 0],
        x,
        opts.y || 0,
        z,
        len / n + 0.25,
        hh,
        0.08,
        {
          ry: ry + (r() - 0.5) * 0.08,
          rz: (r() - 0.5) * 0.06,
          seg: false,
          c: [0xffffff, 0xd8c8b0, 0xb0a898][(r() * 3) | 0],
        },
      );
    }
    for (let i = 0; i <= n; i += 2) {
      const t = i / n,
        x = x0 + (x1 - x0) * t,
        z = z0 + (z1 - z0) * t;
      b.box("rust", x, opts.y || 0, z, 0.12, h + 0.3, 0.12, { seg: false });
    }
    PH.colWall(x0, z0, x1, z1, 0.3, opts.y || 0, (opts.y || 0) + h);
  };
  /** Crate stack. */
  PH.crates = function (b, x, y, z, ry, n, opts) {
    opts = opts || {};
    const r = PH.rng("crates" + x + z);
    for (let i = 0; i < n; i++) {
      const s = 0.6 + r() * 0.35;
      const lx = ((i % 3) - 1) * 0.95,
        lz = (((i / 3) | 0) % 2) * 0.9,
        ly = i >= 6 ? s : 0;
      const [wx, wz] = PH.rot(x, z, ry, lx, lz);
      b.box(opts.key || "crate", wx, y + ly, wz, s, s, s, {
        ry: ry + (r() - 0.5) * 0.3,
        seg: false,
      });
    }
    if (opts.collide !== false) PH.col(x, z + 0.45, 3, 2, y, y + 0.9, ry);
  };

  /** Rectangle with a round (semicircular or segmental) top; origin bottom-centre, in XY. */
  PH.archShape = function (w, h, rise) {
    const s = new THREE.Shape();
    const hw = w / 2;
    rise = rise === undefined ? hw : rise;
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, h - rise);
    if (rise >= hw - 1e-3) s.absarc(0, h - rise, hw, 0, Math.PI, false);
    else {
      const R = (hw * hw + rise * rise) / (2 * rise),
        cy = h - R,
        a0 = Math.asin(hw / R);
      s.absarc(0, cy, R, Math.PI / 2 - a0, Math.PI / 2 + a0, false);
    }
    s.lineTo(-hw, 0);
    return s;
  };
  /** Arched frame ring (outer w/h minus inner arch). */
  PH.archRing = function (w, h, t, rise) {
    const o = PH.archShape(
      w + 2 * t,
      h + t,
      rise === undefined ? undefined : rise + t,
    );
    const i = PH.archShape(w, h, rise);
    o.holes.push(new THREE.Path(i.getPoints(24).reverse()));
    return o;
  };
  /**
   * Window on a wall: frame (fx,fz) at the wall face, ry = outward direction; lx along the wall, y0 sill height.
   * kind: 'glass' | 'broken' | 'boarded' | 'dark'. opts: {arch:true, rise, frame:key, sill:key, key:true(keystone), mull:key}
   */
