// play-inline-211 07 — opts
// Lines 1628-1977 of readable/play-inline-211.pretty.js (statement-aligned).
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
    const m = PH.m4(
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
    const m = PH.m4(
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
  /** Extrude a THREE.Shape (XY) by depth along +Z; place with opts.m. */
  Batch.prototype.extrude = function (key, shape, depth, opts) {
    opts = opts || {};
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: opts.curveSegments || 10,
    });
    return this.add(key, geo, opts);
  };
  /** Textured quad (uv 0..1), centre (x,y,z), faces direction ry (0 → +Z). */
  Batch.prototype.quad = function (key, x, y, z, w, h, opts) {
    opts = opts || {};
    const geo = new THREE.PlaneGeometry(w, h, 1, 1);
    const m = PH.m4(x, y, z, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(
      key,
      geo,
      Object.assign({ uv: "keep", grime: 0.1, noAO: true }, opts, { m }),
    );
  };
  Batch.prototype.geo = function (key, geo, m, opts) {
    return this.add(key, geo, Object.assign({}, opts || {}, { m }));
  };
  /** Irregular rock / rubble / heap chunk (displaced icosahedron). */
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
        U.fbm2((vx * 1.2) / r + seed, (vz * 1.2) / r + (vy * 0.5) / r) - 0.5;
      const k = 1 + n * (opts.rough === undefined ? 0.5 : opts.rough);
      p.setXYZ(i, vx * k, vy * k * (opts.flat || 1), vz * k);
    }
    geo.computeVertexNormals();
    const m = PH.m4(
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
  /** Heap / mound (flattened hemisphere with noise): sugar piles, rubble drifts. */
  Batch.prototype.mound = function (key, x, y, z, rx, h, rz, opts) {
    opts = opts || {};
    const geo = new THREE.SphereGeometry(
      1,
      opts.ws || 18,
      opts.hs || 8,
      0,
      TAU,
      0,
      Math.PI / 2,
    );
    const p = geo.attributes.position,
      seed = opts.seed || x * 3.1 + z * 1.7;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n = U.fbm2(vx * 2 + seed, vz * 2 - seed) - 0.5;
      const sl = Math.pow(vy, opts.peak || 0.8);
      p.setXYZ(i, vx * (1 + n * 0.25), sl * (1 + n * 0.3), vz * (1 + n * 0.25));
    }
    geo.computeVertexNormals();
    return this.add(
      key,
      geo,
      Object.assign({ grime: 0.3 }, opts, {
        m: PH.m4(x, y, z, opts.ry || 0, 0, 0, rx, h, rz),
      }),
    );
  };

  const DETAIL_LOD = new Set([
    "bone",
    "rubber",
    "chrome",
    "fabric",
    "burlap",
    "paper",
    "cardboard",
    "rope",
    "leather",
    "crate",
    "screen",
    "lamp",
    "lamp_cold",
    "lamp_red",
    "lamp_green",
    "fire",
  ]);
  /** Merge the collected parts into meshes under parent. opts: {noLOD, lodDist, interior (no LOD: root visibility handles it)} */
  Batch.prototype.build = function (parent, opts) {
    opts = opts || {};
    const group = new THREE.Group();
    group.name = "ph_" + this.name;
    for (const [key, arr] of this.parts) {
      if (!arr.length) continue;
      let chunk = [],
        count = 0;
      const flush = () => {
        if (!chunk.length) return;
        const geo = mergeAll(chunk);
        for (const g of chunk) g.dispose();
        const mesh = new THREE.Mesh(geo, PH.mat(key));
        mesh.name = this.name + ":" + key;
        const bk = baseKey(key);
        mesh.castShadow =
          !opts.interior &&
          !NO_SHADOW.has(bk) &&
          !NO_SHADOW.has(key) &&
          opts.castShadow !== false &&
          !DETAIL_LOD.has(bk);
        mesh.receiveShadow = !opts.interior;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        group.add(mesh);
        if (!opts.noLOD && !opts.interior) {
          try {
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const bs = geo.boundingSphere,
              triN = geo.attributes.position.count / 3;
            let d = 0;
            if (DETAIL_LOD.has(bk) || opts.lodAll)
              d = (opts.lodDist || 170) + bs.radius;
            else if (
              triN < 1500 &&
              bs.radius < 40 &&
              !emissiveKey(bk) &&
              key.indexOf("tex:") !== 0
            )
              d = 260 + bs.radius;
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
  /** Merge non-indexed geometries keeping every shared attribute (incl. our `bake`). */
  function mergeAll(geoms) {
    geoms = geoms.filter(Boolean);
    const names = Object.keys(geoms[0].attributes).filter((n) =>
      geoms.every(
        (g) =>
          g.attributes[n] &&
          g.attributes[n].itemSize === geoms[0].attributes[n].itemSize,
      ),
    );
    let count = 0;
    for (const g of geoms) count += g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const n of names) {
      const size = geoms[0].attributes[n].itemSize,
        arr = new Float32Array(count * size);
      let o = 0;
      for (const g of geoms) {
        const src = g.attributes[n].array;
        if (src.length === g.attributes.position.count * size) arr.set(src, o);
        o += g.attributes.position.count * size;
      }
      out.setAttribute(n, new THREE.BufferAttribute(arr, size));
    }
    out.computeBoundingSphere();
    out.computeBoundingBox();
    return out;
  }
  PH.mergeAll = mergeAll;
  /** Turn a geometry inside-out (non-indexed copy, reversed winding, negated normals) — for vaults seen from below. */
  PH.flip = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    for (const name of Object.keys(g.attributes)) {
      const a = g.attributes[name],
        sz = a.itemSize,
        arr = a.array;
      for (let t = 0; t < a.count; t += 3)
        for (let k = 0; k < sz; k++) {
          const i1 = (t + 1) * sz + k,
            i2 = (t + 2) * sz + k;
          const tmp = arr[i1];
          arr[i1] = arr[i2];
          arr[i2] = tmp;
        }
    }
    const n = g.attributes.normal.array;
    for (let i = 0; i < n.length; i++) n[i] = -n[i];
    return g;
  };

  // -------------------------------------------------------------------
  // Colliders (yaw convention of core detected once)
  // -------------------------------------------------------------------
  let YAW_SIGN = null;
  function yawSign() {
    if (YAW_SIGN !== null) return YAW_SIGN;
    YAW_SIGN = -1;
    try {
      const W = G.world;
      const a = 0.5;
      const probe = {
        cx: 0,
        cz: 0,
        hx: 1,
        hz: 0.05,
        cos: Math.cos(-a),
        sin: Math.sin(-a),
      };
      const px = Math.cos(a) * 0.9,
        pz = -Math.sin(a) * 0.9;
      const inPos = W.pointInCollider(probe, px, pz, 0);
      probe.cos = Math.cos(a);
      probe.sin = Math.sin(a);
      const inNeg = W.pointInCollider(probe, px, pz, 0);
      if (inPos && !inNeg) YAW_SIGN = 1;
      else if (inNeg && !inPos) YAW_SIGN = -1;
    } catch (e) {
      /* keep default */
    }
    return YAW_SIGN;
  }
  PH.colliders = [];
  /**
   * Local build origin: while set (interior cells), colliders / wv() / anchors add this offset,
   * and batches should use b.frame(PH.originMatrix()).
   */
  PH.ofs = { x: 0, z: 0 };
  PH.setOrigin = (x, z) => {
    PH.ofs = { x: x || 0, z: z || 0 };
  };
  PH.originMatrix = () => PH.m4(PH.ofs.x, 0, PH.ofs.z);
  PH.wv = (x, y, z) => new THREE.Vector3(x + PH.ofs.x, y, z + PH.ofs.z);
  PH.A = (x, y, z, yaw) => PH.anchor(x + PH.ofs.x, y, z + PH.ofs.z, yaw);
  /** Box collider centre (cx,cz), size w (local X) × d (local Z), y0..y1, rotated like THREE rotation.y = ry. */
  PH.col = function (cx, cz, w, d, y0, y1, ry, opts) {
    opts = opts || {};
    try {
      const c = G.world.addCollider(
        cx + PH.ofs.x,
        cz + PH.ofs.z,
        w,
        d,
        y0,
        y1,
        (ry || 0) * yawSign(),
        {
          tag: opts.tag || "poi_harbor",
          walkable: opts.walkable !== false,
          surface: opts.surface || "concrete",
        },
      );
      PH.colliders.push(c);
      return c;
    } catch (e) {
      return null;
    }
  };
