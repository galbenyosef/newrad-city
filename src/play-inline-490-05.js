// play-inline-490 05 — mat
// Lines 1028-1381 of readable/play-inline-490.pretty.js (statement-aligned).
  GEO.loft = function (section, stations, o) {
    o = o || {};
    let sec = section.map((p) => [p[0], p[1]]);
    let area = 0;
    for (let i = 0; i < sec.length; i++) {
      const a = sec[i],
        b = sec[(i + 1) % sec.length];
      area += a[0] * b[1] - b[0] * a[1];
    }
    if (area < 0) sec.reverse();
    const n = sec.length,
      cos = Math.cos(
        ((o.crease === undefined ? 38 : o.crease) * Math.PI) / 180,
      );
    const anchorY =
      o.anchorY === undefined ? Math.min(...sec.map((p) => p[1])) : o.anchorY;
    // per-vertex: sharp corner?
    const sharpV = [];
    for (let i = 0; i < n; i++) {
      const a = sec[(i + n - 1) % n],
        p = sec[i],
        c = sec[(i + 1) % n];
      const e1x = p[0] - a[0],
        e1y = p[1] - a[1],
        e2x = c[0] - p[0],
        e2y = c[1] - p[1];
      const l1 = Math.hypot(e1x, e1y) || 1,
        l2 = Math.hypot(e2x, e2y) || 1;
      sharpV.push((e1x * e2x + e1y * e2y) / (l1 * l2) < cos);
    }
    // columns: side i runs from colStart[i] to colEnd[i] (= a column at vertex i+1)
    const colV = [],
      colStart = [],
      colEndAt = [];
    for (let i = 0; i < n; i++) {
      if (sharpV[i]) {
        colEndAt[i] = colV.length;
        colV.push(i);
        colStart[i] = colV.length;
        colV.push(i);
      } else {
        colEndAt[i] = colStart[i] = colV.length;
        colV.push(i);
      }
    }
    // rows
    const rows = []; // {st, k}
    const rowIn = [],
      rowOut = [];
    stations.forEach((st, k) => {
      rowIn[k] = rows.length;
      rows.push(st);
      if (st.sharp && k > 0 && k < stations.length - 1) rows.push(st);
      rowOut[k] = rows.length - 1;
    });
    const tf = (p, st) => [
      p[0] * (st.sx === undefined ? 1 : st.sx) + (st.dx || 0),
      (p[1] - anchorY) * (st.sy === undefined ? 1 : st.sy) +
        anchorY +
        (st.dy || 0),
      st.z,
    ];
    const pos = [],
      idx = [];
    const nc = colV.length;
    for (const st of rows)
      for (let c = 0; c < nc; c++) pos.push(...tf(sec[colV[c]], st));
    for (let k = 0; k < stations.length - 1; k++) {
      const r0 = rowOut[k],
        r1 = rowIn[k + 1];
      for (let i = 0; i < n; i++) {
        const a = r0 * nc + colStart[i],
          b = r0 * nc + colEndAt[(i + 1) % n];
        const c = r1 * nc + colStart[i],
          d = r1 * nc + colEndAt[(i + 1) % n];
        idx.push(a, c, b, b, c, d);
      }
    }
    // end plates (flat)
    const tri = THREE.ShapeUtils.triangulateShape(
      sec.map((p) => new THREE.Vector2(p[0], p[1])),
      [],
    );
    for (const [k, front] of [
      [0, false],
      [stations.length - 1, true],
    ]) {
      const base = pos.length / 3;
      for (const p of sec) pos.push(...tf(p, stations[k]));
      for (const t of tri) {
        if (front) idx.push(base + t[0], base + t[2], base + t[1]);
        else idx.push(base + t[0], base + t[1], base + t[2]);
      }
    }
    // everything above assumes the stations run rear → front (z decreasing); flip for the other order
    if (stations[0].z < stations[stations.length - 1].z)
      for (let i = 0; i < idx.length; i += 3) {
        const t = idx[i + 1];
        idx[i + 1] = idx[i + 2];
        idx[i + 2] = t;
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  // ------------------------------------------------------------------
  // Builder: collects geometry + material + transform + tint, then merges
  // per material. Box-projected UVs for uniform texel density.
  // ------------------------------------------------------------------
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _v = new THREE.Vector3(),
    _s = new THREE.Vector3();
  const UV_SCALE = {
    wood: 3,
    woodLight: 2.2,
    grip: 14,
    fabric: 6,
    sleeve: 6,
    sleeveTrim: 6,
    skin: 14,
    blued: 5,
    leather: 10,
    tape: 12,
    cloth: 8,
  };

  function Builder() {
    this.items = {};
  }
  /**
   * add(geom, matName, opts) — opts: {p:[x,y,z], r:[rx,ry,rz] (XYZ euler), s:number|[x,y,z], tint:hex|[r,g,b]}
   * returns this (chainable)
   */
  Builder.prototype.add = function (geom, mat, o) {
    o = o || {};
    const g = geom.index ? geom.toNonIndexed() : geom;
    if (g !== geom) geom.dispose();
    _e.set(
      o.r ? o.r[0] : 0,
      o.r ? o.r[1] : 0,
      o.r ? o.r[2] : 0,
      o.order || "XYZ",
    );
    _q.setFromEuler(_e);
    if (o.s === undefined) _s.set(1, 1, 1);
    else if (typeof o.s === "number") _s.setScalar(o.s);
    else _s.set(o.s[0], o.s[1], o.s[2]);
    _v.set(o.p ? o.p[0] : 0, o.p ? o.p[1] : 0, o.p ? o.p[2] : 0);
    _m4.compose(_v, _q, _s);
    g.applyMatrix4(_m4);
    if (o.m) g.applyMatrix4(o.m);
    if (!g.attributes.normal) g.computeVertexNormals();
    // box-projected UVs
    const pos = g.attributes.position,
      nor = g.attributes.normal,
      n = pos.count;
    const uv = new Float32Array(n * 2);
    const k = UV_SCALE[mat] || 5;
    const ou = o.uvOff || 0;
    for (let i = 0; i < n; i++) {
      const ax = Math.abs(nor.getX(i)),
        ay = Math.abs(nor.getY(i)),
        az = Math.abs(nor.getZ(i));
      let u, v;
      if (ax >= ay && ax >= az) {
        u = pos.getZ(i);
        v = pos.getY(i);
      } else if (ay >= az) {
        u = pos.getZ(i);
        v = pos.getX(i);
      } else {
        u = pos.getX(i);
        v = pos.getY(i);
      }
      uv[i * 2] = u * k + ou;
      uv[i * 2 + 1] = v * k + ou * 0.7;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    // tint as vertex colour (with optional vertical AO gradient)
    const col = new Float32Array(n * 3);
    let tr = 1,
      tg = 1,
      tb = 1;
    // tint: [r,g,b] multipliers, a scalar brightness (<= 2), or a hex colour
    if (o.tint !== undefined) {
      if (Array.isArray(o.tint)) {
        tr = o.tint[0];
        tg = o.tint[1];
        tb = o.tint[2];
      } else if (typeof o.tint === "number" && o.tint <= 2) {
        tr = tg = tb = o.tint;
      } else {
        const c = new THREE.Color(o.tint);
        tr = c.r;
        tg = c.g;
        tb = c.b;
      }
    }
    for (let i = 0; i < n; i++) {
      col[i * 3] = tr;
      col[i * 3 + 1] = tg;
      col[i * 3 + 2] = tb;
    }
    // edge wear: bevel faces (normals between the principal axes) get brighter — bluing / paint
    // rubbed off the corners first, like a real carried gun. o.wear = strength, o.wearGain = brightening.
    if (o.wear) {
      const gain = o.wearGain || 2.2;
      for (let i = 0; i < n; i++) {
        const w =
          1 -
          Math.max(
            Math.abs(nor.getX(i)),
            Math.abs(nor.getY(i)),
            Math.abs(nor.getZ(i)),
          );
        let k = Math.min(1, Math.max(0, (w - 0.05) / 0.2));
        k = k * k * (3 - 2 * k) * o.wear;
        const f = 1 + k * gain;
        col[i * 3] *= f;
        col[i * 3 + 1] *= f;
        col[i * 3 + 2] *= f * 1.04;
      }
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    for (const key of Object.keys(g.attributes))
      if (!["position", "normal", "uv", "color"].includes(key))
        g.deleteAttribute(key);
    (this.items[mat] = this.items[mat] || []).push(g);
    return this;
  };
  // shorthand helpers
  Builder.prototype.box = function (mat, w, h, d, p, o) {
    return this.add(
      GEO.box(w, h, d, o && o.bevel),
      mat,
      Object.assign({ p }, o),
    );
  };
  Builder.prototype.cyl = function (mat, r, len, p, o) {
    return this.add(
      GEO.cyl(r, len, (o && o.seg) || 14, o && o.r2),
      mat,
      Object.assign({ p }, o),
    );
  };
  Builder.prototype.tube = function (mat, rO, rI, len, p, o) {
    return this.add(
      GEO.tube(rO, rI, len, (o && o.seg) || 14),
      mat,
      Object.assign({ p }, o),
    );
  };
  Builder.prototype.profile = function (mat, pts, thick, o) {
    return this.add(
      GEO.profile(pts, thick, o && o.bevel, o && o.curveSeg, o && o.bseg),
      mat,
      o,
    );
  };
  Builder.prototype.sphere = function (mat, r, p, o) {
    return this.add(
      GEO.sphere(r, (o && o.ws) || 12, (o && o.hs) || 8),
      mat,
      Object.assign({ p }, o),
    );
  };
  /** Screw/rivet heads: small flattened cylinders facing +X/-X at given points */
  Builder.prototype.rivets = function (mat, pts, r, side) {
    for (const p of pts)
      this.add(GEO.cylX(r || 0.0022, 0.0016, 6), mat, {
        p: [p[0] + (side || 0), p[1], p[2]],
      });
    return this;
  };
  Builder.prototype.isEmpty = function () {
    return Object.keys(this.items).length === 0;
  };
  /**
   * Merge into a Group. World builds: one Mesh per kit material. View builds: kit materials that
   * share a texture are folded into one "family" material (colour baked into vertex colours,
   * roughness/metalness carried per vertex — see famMat), so a part with steel + gunmetal +
   * brass + a glowing dot costs 2 draw calls instead of 4.
   */
  Builder.prototype.build = function (world) {
    world = world || !!P.buildingWorld;
    const grp = new THREE.Group();
    const fams = {};
    for (const mat of Object.keys(this.items)) {
      const fam = world ? null : FAMILY[mat];
      if (fam) {
        (fams[fam] = fams[fam] || []).push(mat);
        continue;
      }
      const geo = G.util.mergeGeometries(this.items[mat]);
      this.items[mat].forEach((g) => g.dispose());
      const mesh = new THREE.Mesh(geo, P.mat(mat, world));
      mesh.userData.wpnMat = mat;
      mesh.frustumCulled = false;
      grp.add(mesh);
    }
    for (const fam of Object.keys(fams)) {
      const list = [],
        rm = [];
      for (const mat of fams[fam]) {
        const d = MAT_DEFS[mat],
          col = new THREE.Color(d.color);
        for (const g of this.items[mat]) {
          const c = g.attributes.color,
            n = c.count;
          for (let i = 0; i < n; i++)
            c.setXYZ(
              i,
              c.getX(i) * col.r,
              c.getY(i) * col.g,
              c.getZ(i) * col.b,
            );
          list.push(g);
          rm.push([n, d.roughness || 0.5, d.metalness || 0]);
        }
      }
      const geo = G.util.mergeGeometries(list);
      list.forEach((g) => g.dispose());
      if (fam !== "glowFam") {
        const a = new Float32Array(geo.attributes.position.count * 2);
        let o = 0;
        for (const [n, r, m] of rm) {
          for (let i = 0; i < n; i++) {
            a[(o + i) * 2] = r;
            a[(o + i) * 2 + 1] = m;
          }
          o += n;
        }
        geo.setAttribute("wrm", new THREE.BufferAttribute(a, 2));
      }
      const mesh = new THREE.Mesh(geo, famMat(fam));
      mesh.userData.wpnMat = fam;
      mesh.userData.wpnMats = fams[fam];
      mesh.frustumCulled = false;
      grp.add(mesh);
    }
    this.items = {};
    return grp;
  };
  P.builder = () => new Builder();
  /**
   * Round the corners of a closed 2D polygon ([[x,y],...]) — each corner becomes a quadratic arc
   * of `seg` segments with radius r (number, or per-vertex array; 0 keeps a sharp corner).
   * Used to turn slab profiles into cast / moulded shapes instead of "boxes".
   */
