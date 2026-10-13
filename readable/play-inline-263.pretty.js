/* src/poi_ues/07_common.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 07 common architecture
 * Shared building blocks for the four UES POIs (all into a site batch,
 * local coordinates):
 *   A.wall2X / A.wall2Z   two-faced partition (different finish per side)
 *   A.doorway             moulded door surround through a wall
 *   A.column / A.pilaster classical orders (Ionic / Doric / Corinthian-ish)
 *   A.balustrade          lathe balusters + rail + plinth (+ collider)
 *   A.urn, A.fence, A.lampPost, A.flagpole, A.tree, A.magnolia, A.hedge
 *   A.skylight            coffered glass ceiling (emissive panes + glow)
 *   A.stairsU             U-shaped stair with a half landing
 *   A.crenels             battlement merlons along a line
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._ues) return;
  const P = G._ues;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const A = (P.arch = {});

  /**
   * Partition along X (constant z) with two finishes: keyN faces -z, keyS faces +z. Heights may differ per side
   * (hN / hS measured from y0). holes like S.wallX (shared by both sides).
   */
  A.wall2X = function (S, z, x0, x1, y0, hN, hS, keyN, keyS, holes, o) {
    o = o || {};
    const t = o.t || 0.4;
    S.wallX(keyN, z - t / 4, x0, x1, y0, y0 + hN, t / 2, holes, {
      noCol: hN < hS,
      grime: o.grime,
    });
    S.wallX(keyS, z + t / 4, x0, x1, y0, y0 + hS, t / 2, holes, {
      noCol: hS <= hN,
      grime: o.grime,
    });
    // collider for the full thickness up to the taller side
    if (o.frame)
      for (const h of holes || [])
        A.doorway(
          S,
          "x",
          z,
          (h[0] + h[1]) / 2,
          h[1] - h[0],
          y0 + (h[2] || 0),
          (h[3] || 3) - (h[2] || 0),
          t,
          o.frame,
          o.frameO,
        );
  };
  A.wall2Z = function (S, x, z0, z1, y0, hW, hE, keyW, keyE, holes, o) {
    o = o || {};
    const t = o.t || 0.4;
    S.wallZ(keyW, x - t / 4, z0, z1, y0, y0 + hW, t / 2, holes, {
      noCol: hW < hE,
      grime: o.grime,
    });
    S.wallZ(keyE, x + t / 4, z0, z1, y0, y0 + hE, t / 2, holes, {
      noCol: hE <= hW,
      grime: o.grime,
    });
    if (o.frame)
      for (const h of holes || [])
        A.doorway(
          S,
          "z",
          x,
          (h[0] + h[1]) / 2,
          h[1] - h[0],
          y0 + (h[2] || 0),
          (h[3] || 3) - (h[2] || 0),
          t,
          o.frame,
          o.frameO,
        );
  };
  /** Door surround: jambs + lintel (+ optional pediment / cornice) on both faces. axis 'x' = wall along x at c. */
  A.doorway = function (S, axis, c, u, w, y0, h, t, key, o) {
    o = o || {};
    const b = S.b,
      fw = o.fw || 0.22,
      fd = t / 2 + (o.proj || 0.07);
    const box = (u0, u1, ya, yb, d0, d1) => {
      if (axis === "x")
        b.box(key, u0, ya, c + d0, u1, yb, c + d1, { seg: false, noAO: true });
      else
        b.box(key, c + d0, ya, u0, c + d1, yb, u1, { seg: false, noAO: true });
    };
    box(u - w / 2 - fw, u - w / 2, y0, y0 + h, -fd, fd);
    box(u + w / 2, u + w / 2 + fw, y0, y0 + h, -fd, fd);
    box(
      u - w / 2 - fw - 0.05,
      u + w / 2 + fw + 0.05,
      y0 + h,
      y0 + h + fw * 1.2,
      -fd - 0.02,
      fd + 0.02,
    );
    if (o.cornice)
      box(
        u - w / 2 - fw - 0.25,
        u + w / 2 + fw + 0.25,
        y0 + h + fw * 1.2,
        y0 + h + fw * 1.2 + 0.16,
        -fd - 0.12,
        fd + 0.12,
      );
  };

  // ------------------------------------------------------------------
  // Classical orders
  // ------------------------------------------------------------------
  /** Free-standing column: base, fluted-look shaft (12 seg lathe with entasis), capital. order: 'ionic'|'doric'|'corinthian'. */
  A.column = function (b, key, x, y, z, h, r, order, o) {
    o = o || {};
    const bh = r * 0.9,
      ch = order === "doric" ? r * 0.7 : r * 1.3;
    // plinth + torus base
    b.box(
      o.base || key,
      x - r * 1.35,
      y,
      z - r * 1.35,
      x + r * 1.35,
      y + bh * 0.45,
      z + r * 1.35,
      { seg: false },
    );
    b.lathe(
      o.base || key,
      [
        [0.001, 0],
        [r * 1.25, 0],
        [r * 1.25, bh * 0.2],
        [r * 1.05, bh * 0.35],
        [r * 1.12, bh * 0.45],
        [r, bh * 0.55],
        [0.001, bh * 0.55],
      ],
      12,
      x,
      y + bh * 0.45,
      z,
      { noAO: true },
    );
    // shaft with entasis
    const sh = h - bh - ch;
    b.lathe(
      key,
      [
        [r, 0],
        [r * 1.02, sh * 0.33],
        [r * 0.93, sh * 0.8],
        [r * 0.86, sh],
      ],
      o.seg || 14,
      x,
      y + bh,
      z,
      { hSeg: 3 },
    );
    const cy = y + bh + sh;
    if (order === "doric") {
      b.cyl(key, x, cy, z, r * 1.05, r * 0.88, ch * 0.4, 12, { noAO: true });
      b.box(
        key,
        x - r * 1.2,
        cy + ch * 0.4,
        z - r * 1.2,
        x + r * 1.2,
        cy + ch,
        z + r * 1.2,
        { seg: false, noAO: true },
      );
    } else if (order === "ionic") {
      b.cyl(key, x, cy, z, r * 1.0, r * 0.88, ch * 0.3, 12, { noAO: true });
      // volutes (a scroll either side) + abacus
      for (const s of [-1, 1])
        b.torus(
          key,
          x + s * r * 0.95,
          cy + ch * 0.45,
          z,
          r * 0.28,
          r * 0.12,
          TAU,
          { ry: HP, ts: 10, rs: 5, noAO: true, sz: 1.4 },
        );
      b.box(
        key,
        x - r * 1.05,
        cy + ch * 0.3,
        z - r * 0.75,
        x + r * 1.05,
        cy + ch * 0.62,
        z + r * 0.75,
        { seg: false, noAO: true },
      );
      b.box(
        key,
        x - r * 1.15,
        cy + ch * 0.62,
        z - r * 1.15,
        x + r * 1.15,
        cy + ch,
        z + r * 1.15,
        { seg: false, noAO: true },
      );
    } else {
      // corinthian-ish: bell with leaves
      b.lathe(
        key,
        [
          [r * 0.88, 0],
          [r * 1.0, ch * 0.3],
          [r * 1.25, ch * 0.75],
          [r * 1.35, ch * 0.8],
          [0.001, ch * 0.8],
        ],
        12,
        x,
        cy,
        z,
        { noAO: true },
      );
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.box(
          key,
          x + Math.cos(a) * r * 0.95 - 0.05,
          cy + ch * 0.05,
          z + Math.sin(a) * r * 0.95 - 0.05,
          x + Math.cos(a) * r * 0.95 + 0.05,
          cy + ch * 0.5,
          z + Math.sin(a) * r * 0.95 + 0.05,
          { seg: false, noAO: true },
        );
      }
      b.box(
        key,
        x - r * 1.3,
        cy + ch * 0.8,
        z - r * 1.3,
        x + r * 1.3,
        cy + ch,
        z + r * 1.3,
        { seg: false, noAO: true },
      );
    }
    if (o.col !== false && o.S)
      o.S.col(x - r, y, z - r, x + r, y + h, z + r, { walkable: false });
  };
  /** Pilaster on a facade F at u (width w), y0..y1, projecting d. */
  A.pilaster = function (F, key, u, w, y0, y1, d, o) {
    o = o || {};
    F.box(key, u - w / 2 - 0.06, u + w / 2 + 0.06, y0, y0 + 0.5, 0, d + 0.06, {
      seg: false,
    });
    F.box(key, u - w / 2, u + w / 2, y0 + 0.5, y1 - 0.45, 0, d, { seg: false });
    // flutes (shadow grooves)
    if (o.flutes !== false)
      for (let k = -1; k <= 1; k++)
        F.box(
          o.groove || "ashlar_dark",
          u + k * w * 0.26 - 0.025,
          u + k * w * 0.26 + 0.025,
          y0 + 0.7,
          y1 - 0.7,
          d,
          d + 0.012,
          { seg: false, noAO: true },
        );
    F.box(key, u - w / 2 - 0.1, u + w / 2 + 0.1, y1 - 0.45, y1, 0, d + 0.1, {
      seg: false,
    });
    if (o.ionic)
      for (const s of [-1, 1])
        F.box(
          key,
          u + s * (w / 2) - 0.09,
          u + s * (w / 2) + 0.09,
          y1 - 0.42,
          y1 - 0.15,
          d,
          d + 0.14,
          { seg: false },
        );
  };

  // ------------------------------------------------------------------
  // Balustrades, urns, fences, lamps, flags
  // ------------------------------------------------------------------
  /** Stone balustrade along polyline pts [[x,z],...] with base at y. o: {key, h, step, col, post (post every n m)}. */
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
  A.magnolia = function (S, x, y, z, o) {
    o = o || {};
    const tips = A.tree(S, x, y, z, {
      h: o.h || 5,
      n: 5,
      depth: 2,
      r: 0.16,
      leaves: null,
    });
    const rn = P.rng(x * 3 + z * 5);
    // a few surviving blossoms: small cupped petals clustered on the twig tips
    for (const t of tips) {
      if (rn() > (o.bloom || 0.55)) continue;
      for (let k = 0; k < 3; k++) {
        const px = t[0] + (rn() - 0.5) * 0.35,
          py = t[1] + (rn() - 0.3) * 0.25,
          pz = t[2] + (rn() - 0.5) * 0.35;
        S.b.geo(
          rn() < 0.4 ? "fabric_pink" : "fabric_white",
          new THREE.ConeGeometry(0.09, 0.14, 5, 1, true).rotateX(PI),
          P.m4(px, py, pz, rn() * 3, (rn() - 0.5) * 0.8, (rn() - 0.5) * 0.8),
          { noAO: true },
        );
      }
    }
    // fallen petals on the ground
    for (let i = 0; i < 18; i++) {
      const a = rn() * TAU,
        d = rn() * 2.4;
      S.b.box(
        rn() < 0.4 ? "fabric_pink" : "fabric_white",
        x + Math.cos(a) * d - 0.05,
        y + 0.01,
        z + Math.sin(a) * d - 0.04,
        x + Math.cos(a) * d + 0.05,
        y + 0.02,
        z + Math.sin(a) * d + 0.04,
        { seg: false, noAO: true, ry: rn() * 3 },
      );
    }
  };
  /** Clipped (overgrown) hedge block. */
  A.hedge = function (S, x0, z0, x1, z1, y, h, o) {
    o = o || {};
    const rn = P.rng(x0 * 3 + z0);
    S.b.box(o.key || "foliage", x0, y, z0, x1, y + h, z1, {
      segLen: 1,
      grime: 0.4,
    });
    const n = Math.round((Math.abs(x1 - x0) + Math.abs(z1 - z0)) * 1.2);
    for (let i = 0; i < n; i++)
      S.b.sphere(
        o.key || "foliage",
        x0 + rn() * (x1 - x0),
        y + h - 0.1 + rn() * 0.2,
        z0 + rn() * (z1 - z0),
        0.3 + rn() * 0.3,
        { ws: 5, hs: 3, noAO: true, sy: 0.6 },
      );
    if (o.col !== false)
      S.col(
        Math.min(x0, x1),
        y,
        Math.min(z0, z1),
        Math.max(x0, x1),
        y + h,
        Math.max(z0, z1),
        { walkable: false },
      );
  };

  // ------------------------------------------------------------------
  // Ceilings, stairs, battlements
  // ------------------------------------------------------------------
  /** Coffered skylight: grid of glass panes (emissive) in an iron frame, with a soft baked daylight + glow sprites. */
  A.skylight = function (S, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = S.b,
      nx = Math.max(1, Math.round((x1 - x0) / (o.cell || 2))),
      nz = Math.max(1, Math.round((z1 - z0) / (o.cell || 2)));
    const cw = (x1 - x0) / nx,
      cd = (z1 - z0) / nz,
      rn = P.rng(x0 * 3 + z0 * 7 + y);
    for (let i = 0; i < nx; i++)
      for (let j = 0; j < nz; j++) {
        const px0 = x0 + i * cw,
          pz0 = z0 + j * cd;
        const miss = rn() < (o.broken || 0);
        if (!miss)
          b.box(
            o.glass || "glass_sky",
            px0 + 0.06,
            y,
            pz0 + 0.06,
            px0 + cw - 0.06,
            y + 0.04,
            pz0 + cd - 0.06,
            { seg: false, noAO: true, noBake: true },
          );
      }
    for (let i = 0; i <= nx; i++)
      b.box(
        o.frame || "iron",
        x0 + i * cw - 0.08,
        y - 0.3,
        z0,
        x0 + i * cw + 0.08,
        y + 0.08,
        z1,
        { seg: false, noAO: true },
      );
    for (let j = 0; j <= nz; j++)
      b.box(
        o.frame || "iron",
        x0,
        y - 0.22,
        z0 + j * cd - 0.06,
        x1,
        y + 0.08,
        z0 + j * cd + 0.06,
        { seg: false, noAO: true },
      );
    if (o.light !== false) {
      const col = o.color || 0xd8e4c8;
      const lx = Math.max(1, Math.round((x1 - x0) / 8)),
        lz = Math.max(1, Math.round((z1 - z0) / 8));
      for (let i = 0; i < lx; i++)
        for (let j = 0; j < lz; j++) {
          const cx = x0 + ((i + 0.5) * (x1 - x0)) / lx,
            cz = z0 + ((j + 0.5) * (z1 - z0)) / lz;
          S.light(cx, y - 1.2, cz, col, o.r || 12, o.i || 0.7);
          if (o.glow) S.glow(cx, y - 0.3, cz, col, o.glowSize || 3.2);
        }
    }
  };
  /**
   * U-stair: flight 1 from (x1a, z) climbing dir to a half landing, flight 2 back. Keeps steps ≤ 0.24 m.
   * spec: {x (centre of the stair well across), z0 (bottom edge), dir 'n'|'s', w (flight width), gap, y0, y1, key, rail, landingD}
   */
  A.stairsU = function (S, sp) {
    const key = sp.key || "marble",
      w = sp.w || 2.2,
      gap = sp.gap || 0.4,
      hm = (sp.y0 + sp.y1) / 2,
      sign = sp.dir === "n" ? -1 : 1;
    const xa = sp.x - gap / 2 - w / 2,
      xb = sp.x + gap / 2 + w / 2;
    const r1 = S.stairs(key, sp.flip ? xb : xa, sp.z0, sp.dir, w, sp.y0, hm, {
      rail: sp.rail,
      railSides: [sp.flip ? -1 : 1],
      nosing: sp.nosing,
      surface: sp.surface,
    });
    const ld = sp.landingD || 2.4;
    const lz0 = Math.min(r1.z, r1.z + sign * ld),
      lz1 = Math.max(r1.z, r1.z + sign * ld);
    S.floor(key, sp.x - gap / 2 - w, lz0, sp.x + gap / 2 + w, lz1, hm, {
      t: 0.3,
      surface: sp.surface,
    });
    const back = sp.dir === "n" ? "s" : "n";
    const r2 = S.stairs(key, sp.flip ? xa : xb, r1.z, back, w, hm, sp.y1, {
      rail: sp.rail,
      railSides: [sp.flip ? 1 : -1],
      nosing: sp.nosing,
      surface: sp.surface,
    });
    return {
      landing: { x: sp.x, z: (lz0 + lz1) / 2, y: hm },
      top: { x: sp.flip ? xa : xb, z: r2.z },
      len: r1.len,
    };
  };
  /** Battlement merlons along a straight line at y (top of parapet). */
  A.crenels = function (b, key, ax, az, bx, bz, y, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.round(L / (o.step || 1.6)));
    const ang = Math.atan2(bz - az, bx - ax),
      mw = o.mw || 0.9,
      mh = o.mh || 1.0,
      d = o.d || 0.6;
    for (let i = 0; i <= n; i += 1) {
      if (i % 2 === 1) continue;
      const t = n ? i / n : 0,
        cx = ax + (bx - ax) * t,
        cz = az + (bz - az) * t;
      b.boxC(key, cx, y, cz, mw, mh, d, { ry: -ang, seg: false });
    }
  };
  /** Chimney stack with pots. */
  A.chimney = function (b, key, x, y, z, w, d, h, pots) {
    b.box(key, x - w / 2, y, z - d / 2, x + w / 2, y + h, z + d / 2, {
      seg: false,
    });
    b.box(
      "ashlar",
      x - w / 2 - 0.1,
      y + h,
      z - d / 2 - 0.1,
      x + w / 2 + 0.1,
      y + h + 0.2,
      z + d / 2 + 0.1,
      { seg: false, noAO: true },
    );
    for (let i = 0; i < (pots || 2); i++)
      b.cyl(
        "terracotta",
        x - w / 2 + ((i + 0.5) * w) / (pots || 2),
        y + h + 0.2,
        z,
        0.14,
        0.18,
        0.5,
        8,
        { noAO: true },
      );
  };
  /** Glow-sprite-only light (for exteriors at night). */
  A.lamp = function (S, x, y, z, color, size) {
    S.glow(x, y, z, color || 0xffd8a0, size || 0.8);
  };
})();
