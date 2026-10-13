// play-inline-353 08 — opts
// Lines 1843-2179 of readable/play-inline-353.pretty.js (statement-aligned).
  function bakeLights(g, batch) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const out = new Float32Array(cnt * 3);
    const amb = batch.ambient,
      L = batch.lights || [];
    for (let i = 0; i < cnt; i++) {
      let r = amb ? amb.r : 0,
        gg = amb ? amb.g : 0,
        b = amb ? amb.b : 0;
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        nx = n.getX(i),
        ny = n.getY(i),
        nz = n.getZ(i);
      for (let k = 0; k < L.length; k++) {
        const l = L[k];
        const dx = l.p.x - x,
          dy = l.p.y - y,
          dz = l.p.z - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3;
        const f = 1 - d / l.r,
          att = f * f * l.i;
        const ndl = (nx * dx + ny * dy + nz * dz) / d;
        const w = att * (0.25 + 0.75 * Math.max(0, ndl));
        r += l.c.r * w;
        gg += l.c.g * w;
        b += l.c.b * w;
      }
      out[i * 3] = Math.min(1.6, r);
      out[i * 3 + 1] = Math.min(1.6, gg);
      out[i * 3 + 2] = Math.min(1.6, b);
    }
    g.setAttribute("bake", new THREE.BufferAttribute(out, 3));
    void _bl;
  }
  function segs(v, len, cap) {
    return Math.max(1, Math.min(cap || 8, Math.ceil(v / len)));
  }
  /** Box by bottom-centre: (cx, y0, cz) size w(x) h(y) d(z). opts.ry/rx/rz rotate about box centre. */
  Batch.prototype.box = function (key, cx, y0, cz, w, h, d, opts) {
    opts = opts || {};
    const sl = opts.segLen || 5;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      opts.seg === false ? 1 : segs(w, sl),
      opts.seg === false ? 1 : segs(h, sl),
      opts.seg === false ? 1 : segs(d, sl),
    );
    const m = PF.m4(cx, y0 + h / 2, cz, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Box from min/max corners (axis aligned). */
  Batch.prototype.boxMM = function (key, x0, y0, z0, x1, y1, z1, opts) {
    return this.box(
      key,
      (x0 + x1) / 2,
      y0,
      (z0 + z1) / 2,
      Math.abs(x1 - x0),
      y1 - y0,
      Math.abs(z1 - z0),
      opts,
    );
  };
  /** Cylinder by bottom centre. */
  Batch.prototype.cyl = function (key, x, y0, z, rTop, rBot, h, seg, opts) {
    opts = opts || {};
    const geo = new THREE.CylinderGeometry(
      rTop,
      rBot,
      h,
      seg || 12,
      opts.hSeg || segs(h, 5),
      !!opts.open,
      opts.thetaStart || 0,
      opts.thetaLen || TAU,
    );
    const m = PF.m4(
      x,
      y0 + h / 2,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx,
      1,
      opts.sz === undefined ? opts.sx : opts.sz,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Cylinder between two points. */
  Batch.prototype.rod = function (key, a, b, r, seg, opts) {
    opts = opts || {};
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = new THREE.CylinderGeometry(
      opts.r2 === undefined ? r : opts.r2,
      r,
      len,
      seg || 6,
      1,
      !!opts.open,
    );
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Thin square beam between two points (cheaper than rod: 12 tris). */
  Batch.prototype.beam = function (key, a, b, w, h, opts) {
    opts = opts || {};
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = new THREE.BoxGeometry(w, len, h === undefined ? w : h);
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    );
    if (opts.twist)
      q.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          opts.twist,
        ),
      );
    const m = new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1));
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  Batch.prototype.sphere = function (key, x, y, z, r, opts) {
    opts = opts || {};
    const geo = new THREE.SphereGeometry(
      r,
      opts.ws || 12,
      opts.hs || 8,
      0,
      TAU,
      opts.phiStart || 0,
      opts.phiLen || Math.PI,
    );
    if (opts.deform) deform(geo, opts.deform);
    const m = PF.m4(
      x,
      y,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx || 1,
      opts.sy || opts.sx || 1,
      opts.sz || opts.sx || 1,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Lathe from [[r,y],...] profile. */
  Batch.prototype.lathe = function (key, prof, seg, x, y, z, opts) {
    opts = opts || {};
    const pts = prof.map(
      (p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]),
    );
    const geo = new THREE.LatheGeometry(
      pts,
      seg || 16,
      opts.phiStart || 0,
      opts.phiLen || TAU,
    );
    if (opts.deform) deform(geo, opts.deform);
    const m = PF.m4(
      x,
      y,
      z,
      opts.ry,
      opts.rx,
      opts.rz,
      opts.sx || 1,
      opts.sy || 1,
      opts.sz || opts.sx || 1,
    );
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
  /** Extrude a THREE.Shape (in XY) by depth along +Z; opts.m places it. */
  Batch.prototype.extrude = function (key, shape, depth, opts) {
    opts = opts || {};
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: !!opts.bevel,
      bevelSize: opts.bevel || 0,
      bevelThickness: opts.bevel || 0,
      bevelSegments: 1,
      curveSegments: opts.curveSegments || 8,
    });
    return this.add(key, geo, opts);
  };
  /** Single textured quad (uv kept 0..1). (x,y,z) = centre; faces direction ry (0 → +Z). */
  Batch.prototype.quad = function (key, x, y, z, w, h, opts) {
    opts = opts || {};
    const geo = new THREE.PlaneGeometry(w, h, opts.wSeg || 1, opts.hSeg || 1);
    const m = PF.m4(x, y, z, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(
      key,
      geo,
      Object.assign({ uv: "keep", grime: 0.15 }, opts, { m }),
    );
  };
  Batch.prototype.geo = function (key, geo, m, opts) {
    return this.add(key, geo, Object.assign({}, opts || {}, { m }));
  };
  /** Irregular rock / rubble chunk (displaced icosahedron). */
  Batch.prototype.rock = function (key, x, y, z, r, opts) {
    opts = opts || {};
    const geo = new THREE.IcosahedronGeometry(
      r,
      opts.detail === undefined ? 1 : opts.detail,
    );
    const p = geo.attributes.position,
      seed = opts.seed || x * 13.1 + z * 7.7;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n =
        U.fbm2(
          ((vx * 0.6) / r) * 2 + seed,
          ((vz * 0.6) / r) * 2 + (vy * 0.5) / r,
        ) - 0.5;
      const k = 1 + n * (opts.rough === undefined ? 0.55 : opts.rough);
      p.setXYZ(i, vx * k, vy * k * (opts.flat || 1), vz * k);
    }
    geo.computeVertexNormals();
    const m = PF.m4(
      x,
      y,
      z,
      opts.ry || seed % 6,
      0,
      0,
      opts.sx || 1,
      opts.sy || 1,
      opts.sz || 1,
    );
    return this.add(key, geo, Object.assign({ grime: 0.4 }, opts, { m }));
  };
  function deform(geo, fn) {
    const p = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      fn(v, i);
      p.setXYZ(i, v.x, v.y, v.z);
    }
    PF.weldNormals(geo); // seam-safe smooth normals (lathe/sphere wrap columns are duplicated vertices)
  }
  PF.deform = deform;

  /** Turn the collected parts into merged meshes under parent. */
  Batch.prototype.build = function (parent, opts) {
    opts = opts || {};
    const group = new THREE.Group();
    group.name = "pws_" + this.name;
    for (const [key, arr] of this.parts) {
      if (!arr.length) continue;
      // split into chunks of ≤ 400k verts to keep buffers sane
      let chunk = [],
        count = 0;
      const flush = () => {
        if (!chunk.length) return;
        const geo = mergeAll(chunk);
        for (const g of chunk) g.dispose();
        const mat = PF.mat(key);
        const bk = baseKey(key);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.name = this.name + ":" + key;
        const ns = NO_SHADOW.has(bk) || opts.noShadow;
        mesh.castShadow = !ns && opts.castShadow !== false;
        mesh.receiveShadow = opts.receiveShadow !== false;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        if (SMALL_NO_SHADOW.has(bk) || bk.indexOf("tex:") === 0)
          mesh.castShadow = false; // signs, graffiti, decals: flat quads cast nothing useful
        group.add(mesh);
        // distance culling (draw-call budget):
        //  • small-detail materials (railings, bones, tyres, fabric, sandbags...) beyond ~190 m
        //  • interiors (baked-light batches) beyond ~75 m + their radius — they are enclosed anyway
        //  • any other small merged mesh (few triangles, compact) beyond ~240 m, except emissive landmarks
        //    (lamps, the gilded torch flame, lit windows) which must still read across the harbour
        if (!opts.noLOD) {
          try {
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const bs = geo.boundingSphere,
              triN = geo.attributes.position.count / 3;
            let d = 0;
            if (DETAIL_LOD.has(bk) || opts.lodAll)
              d = (opts.lodDist || 190) + bs.radius;
            else if (this.lights || this.ambient)
              d = (opts.lodDistInt || 75) + bs.radius;
            else if (triN < 1500 && bs.radius < 40 && !emissiveKey(bk))
              d = 240 + bs.radius;
            if (d > 0) G.world.addLOD(mesh, d, bs.center.clone());
          } catch (e) {
            /* core missing */
          }
        }
        chunk = [];
        count = 0;
      };
      for (const g of arr) {
        chunk.push(g);
        count += g.attributes.position.count;
        if (count > 400000) flush();
      }
      flush();
    }
    this.parts.clear();
    if (parent) parent.add(group);
    return group;
  };
  /**
   * Merge non-indexed geometries into one (non-indexed) geometry keeping EVERY attribute they all share
   * (position, normal, uv, color and our custom `bake`) — core's merger only keeps the standard four.
   */
