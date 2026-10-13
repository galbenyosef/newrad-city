// play-inline-490 06 — mat
// Lines 1382-1599 of readable/play-inline-490.pretty.js (statement-aligned).
  P.roundPts = function (pts, r, seg) {
    seg = seg || 3;
    const out = [],
      n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i],
        a = pts[(i + n - 1) % n],
        c = pts[(i + 1) % n];
      const ri = Array.isArray(r) ? r[i] || 0 : r;
      if (!ri) {
        out.push([p[0], p[1]]);
        continue;
      }
      const la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1e-6,
        lc = Math.hypot(c[0] - p[0], c[1] - p[1]) || 1e-6;
      const ka = Math.min(ri, la * 0.45) / la,
        kc = Math.min(ri, lc * 0.45) / lc;
      const p0 = [p[0] + (a[0] - p[0]) * ka, p[1] + (a[1] - p[1]) * ka],
        p2 = [p[0] + (c[0] - p[0]) * kc, p[1] + (c[1] - p[1]) * kc];
      for (let s = 0; s <= seg; s++) {
        const t = s / seg,
          u = 1 - t;
        out.push([
          u * u * p0[0] + 2 * u * t * p[0] + t * t * p2[0],
          u * u * p0[1] + 2 * u * t * p[1] + t * t * p2[1],
        ]);
      }
    }
    return out;
  };
  /** Ensure a geometry has a (white or tinted) vertex colour attribute — all kit materials use vertexColors. */
  P.paintGeo = function (geo, tint) {
    if (geo.attributes.color) return geo;
    const n = geo.attributes.position.count,
      a = new Float32Array(n * 3);
    const c =
      typeof tint === "number" && tint <= 2
        ? new THREE.Color(tint, tint, tint)
        : new THREE.Color(tint === undefined ? 0xffffff : tint);
    for (let i = 0; i < n; i++) {
      a[i * 3] = c.r;
      a[i * 3 + 1] = c.g;
      a[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return geo;
  };
  /** Mesh with a kit material (adds vertex colours). */
  P.mesh = function (geo, matName, tint) {
    const m = new THREE.Mesh(
      P.paintGeo(geo, tint),
      typeof matName === "string" ? P.mat(matName) : matName,
    );
    m.frustumCulled = false;
    return m;
  };
  P.MODELS = P.MODELS || {};

  /** Create a named socket (empty Object3D) under parent. */
  P.socket = function (parent, name, p, r) {
    const o = new THREE.Object3D();
    o.name = name;
    if (p) o.position.set(p[0], p[1], p[2]);
    if (r) o.rotation.set(r[0], r[1], r[2]);
    parent.add(o);
    return o;
  };
  /** Wrap a built Group as an animatable part with a pivot. */
  P.part = function (parent, builder, pivot, name) {
    const g = new THREE.Group();
    g.name = name || "part";
    if (pivot) g.position.set(pivot[0], pivot[1], pivot[2]);
    const inner = builder.build();
    if (pivot) inner.position.set(-pivot[0], -pivot[1], -pivot[2]);
    g.add(inner);
    g.userData.rest = { p: g.position.clone(), q: g.quaternion.clone() };
    parent.add(g);
    return g;
  };

  // ------------------------------------------------------------------
  // Reusable weapon components (called by the model files)
  // ------------------------------------------------------------------
  const C = (P.COMP = {});
  /** Barrel with muzzle crown and bore. from z0 (back) to z1 (front, more negative). */
  C.barrel = function (b, mat, r, z0, z1, y, o) {
    o = o || {};
    const len = z0 - z1,
      mid = (z0 + z1) / 2;
    b.tube(mat, r, r * (o.bore || 0.55), len, [o.x || 0, y, mid], {
      seg: o.seg || 14,
    });
    if (o.crown !== false)
      b.tube(
        mat,
        r * 1.12,
        r * (o.bore || 0.55),
        Math.min(0.012, len * 0.1),
        [o.x || 0, y, z1 + 0.006],
        { seg: o.seg || 14, tint: 0.85 },
      );
    return b;
  };
  /** Classic front sight post + rear notch on top of a surface at height y */
  C.ironSights = function (b, mat, yTop, zRear, zFront, o) {
    o = o || {};
    const h = o.h || 0.012;
    b.box(mat, 0.003, h, 0.006, [0, yTop + h / 2, zFront], { bevel: 0.0008 });
    b.box(mat, 0.009, 0.005, 0.006, [0, yTop + 0.0025, zFront], {
      bevel: 0.001,
    });
    // rear notch: two ears
    b.box(mat, 0.005, h * 0.9, 0.006, [-0.0045, yTop + h * 0.45, zRear], {
      bevel: 0.0008,
    });
    b.box(mat, 0.005, h * 0.9, 0.006, [0.0045, yTop + h * 0.45, zRear], {
      bevel: 0.0008,
    });
    b.box(mat, 0.016, h * 0.35, 0.008, [0, yTop + h * 0.17, zRear], {
      bevel: 0.001,
    });
  };
  /** Telescopic scope along Z centred at (0,y,zc). Returns eye z (rear lens). */
  C.scope = function (b, y, zc, len, r, o) {
    o = o || {};
    const m = o.mat || "darksteel";
    b.cyl(m, r, len * 0.55, [0, y, zc], { seg: 18 });
    // objective bell
    b.add(
      GEO.lathe(
        [
          [r, 0],
          [r * 1.55, 0.05],
          [r * 1.6, 0.11],
          [r * 1.35, 0.115],
        ],
        20,
      ),
      m,
      { p: [0, y, zc - len * 0.27] },
    );
    // ocular bell
    b.add(
      GEO.lathe(
        [
          [r * 1.4, -0.09],
          [r * 1.45, -0.02],
          [r, 0.0],
        ],
        20,
      ),
      m,
      { p: [0, y, zc + len * 0.27] },
    );
    // turrets
    b.cyl(m, r * 0.55, r * 0.9, [0, y + r * 1.1, zc], {
      r: [Math.PI / 2, 0, 0],
      seg: 12,
    });
    b.cyl(m, r * 0.55, r * 0.9, [r * 1.1, y, zc], {
      r: [0, Math.PI / 2, 0],
      seg: 12,
    });
    b.add(GEO.cylY(r * 0.62, 0.006, 12), "steel", { p: [0, y + r * 1.58, zc] });
    // rings & mounts
    for (const dz of [-len * 0.18, len * 0.14]) {
      b.add(GEO.torus(r * 1.05, r * 0.14, 6, 18), "steel", {
        p: [0, y, zc + dz],
      });
      b.box(
        "darksteel",
        r * 1.2,
        y - (o.mountY || 0) - r,
        0.016,
        [0, (y - r + (o.mountY || 0)) / 2, zc + dz],
        { bevel: 0.002 },
      );
    }
    // lenses
    b.add(new THREE.CircleGeometry(r * 1.45, 18), "lens", {
      p: [0, y, zc - len * 0.27 - 0.112],
    });
    b.add(new THREE.CircleGeometry(r * 1.3, 18), "lens", {
      p: [0, y, zc + len * 0.27 + 0.089],
      r: [0, Math.PI, 0],
    });
    return zc + len * 0.27 + 0.09;
  };
  /** Magazine (box, optionally curved) as its own builder; top at y=0, front edge at z=0 */
  C.boxMag = function (mat, w, h, d, curve, o) {
    o = o || {};
    const b = P.builder();
    const pts = [];
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      pts.push([-t * t * curve, -t * h]);
    }
    const outline = [];
    for (const p of pts) outline.push([p[0], p[1]]);
    for (let i = pts.length - 1; i >= 0; i--)
      outline.push([pts[i][0] - d, pts[i][1]]);
    b.profile(mat, outline, w, { bevel: 0.0015 });
    // base plate
    const last = pts[pts.length - 1];
    b.box(
      o.plate || mat,
      w * 1.15,
      0.008,
      d * 1.1,
      [0, last[1] - 0.003, last[0] - d / 2],
      { bevel: 0.002, tint: 0.8 },
    );
    // top cartridge
    if (o.round)
      b.add(GEO.cyl(0.0045, d * 0.8, 8), o.round, { p: [0, 0.004, -d / 2] });
    return b;
  };
