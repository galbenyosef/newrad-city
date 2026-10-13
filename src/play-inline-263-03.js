// play-inline-263 03 — key
// Lines 300-613 of readable/play-inline-263.pretty.js (statement-aligned).
  A.balustrade = function (S, pts, y, o) {
    o = o || {};
    const b = S.b,
      key = o.key || "ashlar",
      h = o.h || 0.95,
      step = o.step || 0.34;
    const prof = [
      [0.001, 0],
      [0.075, 0.0],
      [0.075, 0.08],
      [0.05, 0.12],
      [0.085, h * 0.34],
      [0.045, h * 0.62],
      [0.06, h * 0.66],
      [0.04, h * 0.7],
      [0.06, h - 0.12],
      [0.001, h - 0.12],
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1],
        L = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (L < 0.2) continue;
      const ang = Math.atan2(c[1] - a[1], c[0] - a[0]),
        cx = (a[0] + c[0]) / 2,
        cz = (a[1] + c[1]) / 2;
      b.boxC(key, cx, y, cz, L + 0.1, 0.16, 0.36, { ry: -ang, seg: false });
      b.boxC(key, cx, y + h - 0.14, cz, L + 0.14, 0.16, 0.4, {
        ry: -ang,
        seg: false,
      });
      const n = Math.max(1, Math.floor(L / step));
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        if (o.broken && P.rng(i * 31 + k * 7 + y)() < o.broken) continue;
        b.lathe(
          key,
          prof,
          6,
          a[0] + (c[0] - a[0]) * t,
          y + 0.16,
          a[1] + (c[1] - a[1]) * t,
          { noAO: true },
        );
      }
      if (o.col !== false)
        S.colR(cx, cz, L, 0.36, y, y + h, -ang, { walkable: false });
    }
    // posts at the vertices
    if (o.posts !== false)
      for (const p of pts) {
        b.box(
          key,
          p[0] - 0.28,
          y,
          p[1] - 0.28,
          p[0] + 0.28,
          y + h + 0.05,
          p[1] + 0.28,
          { seg: false },
        );
        b.box(
          key,
          p[0] - 0.33,
          y + h + 0.05,
          p[1] - 0.33,
          p[0] + 0.33,
          y + h + 0.17,
          p[1] + 0.33,
          { seg: false, noAO: true },
        );
        if (o.urns) A.urn(b, key, p[0], y + h + 0.17, p[1], o.urnS || 0.8);
      }
  };
  /** Classical urn / finial. */
  A.urn = function (b, key, x, y, z, s, o) {
    s = s || 1;
    b.lathe(
      key,
      [
        [0.001, 0],
        [0.18 * s, 0],
        [0.18 * s, 0.06 * s],
        [0.08 * s, 0.12 * s],
        [0.1 * s, 0.2 * s],
        [0.26 * s, 0.38 * s],
        [0.24 * s, 0.56 * s],
        [0.14 * s, 0.66 * s],
        [0.18 * s, 0.72 * s],
        [0.06 * s, 0.8 * s],
        [0.03 * s, 0.95 * s],
        [0.001, 0.97 * s],
      ],
      10,
      x,
      y,
      z,
      Object.assign({ noAO: true }, o || {}),
    );
  };
  /** Wrought-iron fence of spear pickets along polyline. o: {h, step, key, finial, col}. */
  A.fence = function (S, pts, y, o) {
    o = o || {};
    const b = S.b,
      key = o.key || "iron",
      h = o.h || 1.9,
      step = o.step || 0.16;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1],
        L = Math.hypot(c[0] - a[0], c[1] - a[1]);
      if (L < 0.1) continue;
      for (const yy of [y + 0.15, y + h - 0.25])
        b.rod(key, [a[0], yy, a[1]], [c[0], yy, c[1]], 0.025, 4, {
          square: true,
          noAO: true,
        });
      const n = Math.max(1, Math.floor(L / step)),
        rn = P.rng(a[0] * 3.3 + a[1]);
      for (let k = 0; k <= n; k++) {
        const t = k / n,
          px = a[0] + (c[0] - a[0]) * t,
          pz = a[1] + (c[1] - a[1]) * t;
        if (o.gaps && rn() < o.gaps) continue;
        const bent = o.bent && rn() < o.bent ? (rn() - 0.5) * 0.5 : 0;
        b.rod(key, [px, y, pz], [px + bent, y + h, pz], 0.012, 3, {
          noAO: true,
        });
        if (o.finial !== false)
          b.box(
            key,
            px + bent - 0.02,
            y + h,
            pz - 0.02,
            px + bent + 0.02,
            y + h + 0.1,
            pz + 0.02,
            { seg: false, noAO: true, ry: 0.785 },
          );
      }
      if (o.col !== false) {
        const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
        S.colR((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, L, 0.12, y, y + h, -ang, {
          walkable: false,
        });
      }
    }
  };
  /** Victorian cast-iron lamp post (1 or 2 globes). lit → baked light + glow. */
  A.lampPost = function (S, x, y, z, o) {
    o = o || {};
    const b = S.b,
      h = o.h || 4.2;
    b.lathe(
      "iron",
      [
        [0.001, 0],
        [0.2, 0],
        [0.2, 0.25],
        [0.12, 0.35],
        [0.08, 0.9],
        [0.06, h - 0.3],
        [0.1, h - 0.2],
        [0.001, h - 0.2],
      ],
      8,
      x,
      y,
      z,
      { noAO: true },
    );
    const heads = o.double
      ? [
          [-0.45, 0],
          [0.45, 0],
        ]
      : [[0, 0]];
    if (o.double)
      b.rod(
        "iron",
        [x - 0.5, y + h - 0.25, z],
        [x + 0.5, y + h - 0.25, z],
        0.03,
        4,
        { noAO: true },
      );
    for (const [dx, dz] of heads) {
      const lit = !!o.lit;
      b.sphere(
        lit ? "lamp_dim" : o.broken ? "glass_broken" : "glass_dark",
        x + dx,
        y + h + 0.1,
        z + dz,
        0.22,
        { ws: 8, hs: 6, noAO: true },
      );
      b.cyl("iron", x + dx, y + h + 0.3, z + dz, 0.05, 0.12, 0.1, 6, {
        noAO: true,
      });
      if (lit)
        S.light(
          x + dx,
          y + h,
          z + dz,
          o.color || 0xffd8a0,
          o.r || 9,
          o.i || 0.8,
          { size: 0.8 },
        );
    }
    S.col(x - 0.15, y, z - 0.15, x + 0.15, y + h, z + 0.15, {
      walkable: false,
    });
  };
  /** Flagpole with a (tattered) flag. flagKey = texMat key or material key. */
  A.flagpole = function (S, x, y, z, h, flagKey, o) {
    o = o || {};
    const b = S.b;
    b.cyl("chrome", x, y, z, 0.05, 0.08, h, 8, { noAO: true });
    b.sphere("gold", x, y + h + 0.08, z, 0.1, { noAO: true });
    if (flagKey) {
      const fw = o.w || 2.2,
        fh = o.fh || 1.4;
      const g = new THREE.PlaneGeometry(fw, fh, 8, 3);
      const p = g.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const u = (p.getX(i) + fw / 2) / fw;
        p.setZ(i, Math.sin(u * 5 + (o.phase || 0)) * 0.14 * u);
        p.setY(i, p.getY(i) - u * u * 0.25);
      }
      g.computeVertexNormals();
      b.geo(
        flagKey,
        g,
        P.m4(x + fw / 2 + 0.06, y + h - fh / 2 - 0.1, z, o.ry || 0),
        { uv: "keep", noAO: true, grime: 0.2 },
      );
      const g2 = g.clone();
      b.geo(
        flagKey,
        g2,
        P.m4(
          x + fw / 2 + 0.06,
          y + h - fh / 2 - 0.1,
          z,
          (o.ry || 0) + PI,
        ).multiply(P.m4(0, 0, 0, 0, 0, 0, -1, 1, 1)),
        { uv: "keep", noAO: true, grime: 0.2 },
      );
    }
    S.col(x - 0.1, y, z - 0.1, x + 0.1, y + h, z + 0.1, { walkable: false });
  };
  /** Dead / leafless tree (branching rods). o: {h, key, leaves:key|null, n} */
  A.tree = function (S, x, y, z, o) {
    o = o || {};
    const b = S.b,
      rn = P.rng(x * 7.1 + z * 3.3),
      h = o.h || 6 + rn() * 3,
      key = o.key || "wood_rotten";
    const lean = (rn() - 0.5) * 0.4,
      la = rn() * TAU;
    const top = [
      x + Math.cos(la) * lean * h * 0.3,
      y + h * 0.55,
      z + Math.sin(la) * lean * h * 0.3,
    ];
    b.rod(key, [x, y, z], top, o.r || 0.2, 7, { rTop: (o.r || 0.2) * 0.7 });
    const tips = [];
    const grow = (p, dir, len, r, depth) => {
      const e = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
      b.rod(key, p, e, r, 5, { rTop: r * 0.65, noAO: true });
      if (depth <= 0) {
        tips.push(e);
        if (o.leaves)
          b.sphere(o.leaves, e[0], e[1], e[2], 0.5 + rn() * 0.5, {
            ws: 6,
            hs: 4,
            noAO: true,
            sy: 0.7,
          });
        return;
      }
      const n = 2 + (rn() < 0.4 ? 1 : 0);
      for (let i = 0; i < n; i++) {
        const a = rn() * TAU,
          up = 0.45 + rn() * 0.5;
        const d = [
          dir[0] * 0.5 + Math.cos(a) * (1 - up),
          dir[1] * 0.5 + up,
          dir[2] * 0.5 + Math.sin(a) * (1 - up),
        ];
        const l = Math.hypot(d[0], d[1], d[2]);
        d[0] /= l;
        d[1] /= l;
        d[2] /= l;
        grow(e, d, len * (0.6 + rn() * 0.2), r * 0.62, depth - 1);
      }
    };
    for (let i = 0; i < (o.n || 4); i++) {
      const a = (i / (o.n || 4)) * TAU + rn();
      grow(
        top,
        [Math.cos(a) * 0.7, 0.7, Math.sin(a) * 0.7],
        h * 0.25,
        (o.r || 0.2) * 0.6,
        o.depth === undefined ? 2 : o.depth,
      );
    }
    S.col(x - 0.25, y, z - 0.25, x + 0.25, y + h * 0.5, z + 0.25, {
      walkable: false,
    });
    return tips;
  };
  /** Magnolia: low spreading tree with pale blossom clumps (a few survive, irradiated pink). */
