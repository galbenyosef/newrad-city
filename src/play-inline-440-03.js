// play-inline-440 03 — mat
// Lines 652-984 of readable/play-inline-440.pretty.js (statement-aligned).
  class Kit {
    constructor(seed) {
      this.list = [];
      this.r = U.rng(seed || 7);
      this.meta = {};
      this.seed = seed || 7;
    }
    add(mat, geom, o) {
      o = o || {};
      const g = geom.index ? geom.toNonIndexed() : geom; // non-indexed → flat per-face UV/AO behaves
      g.applyMatrix4(xform(o));
      if (o.smooth) g.computeVertexNormals();
      else if (!g.attributes.normal) g.computeVertexNormals();
      if (o.uv !== "keep" || !g.attributes.uv) boxUV(g, o.uvScale || 1);
      if (o.uvFn) o.uvFn(g);
      bakeColors(g, Object.assign({ seed: this.seed * 0.37 }, o));
      this.list.push({ mat, tint: !!o.tint, geom: g });
      return g;
    }
    /** Keep index + smooth normals (lofted shells, spheres) */
    addSmooth(mat, geom, o) {
      o = o || {};
      const g = geom;
      g.applyMatrix4(xform(o));
      g.computeVertexNormals();
      if (o.uv !== "keep" || !g.attributes.uv) boxUV(g, o.uvScale || 1);
      if (o.uvFn) o.uvFn(g);
      bakeColors(g, Object.assign({ seed: this.seed * 0.37 }, o));
      this.list.push({ mat, tint: !!o.tint, geom: g });
      return g;
    }
    box(mat, w, h, d, x, y, z, o) {
      o = Object.assign({}, o, { x, y, z });
      const sg = o.segs || [1, 1, 1];
      return this.add(
        mat,
        new THREE.BoxGeometry(w, h, d, sg[0], sg[1], sg[2]),
        o,
      );
    }
    /** Box whose y is its bottom (handy for stacking) */
    boxB(mat, w, h, d, x, y, z, o) {
      return this.box(mat, w, h, d, x, y + h / 2, z, o);
    }
    /** Chamfered box (extruded rounded rectangle). */
    cbox(mat, w, h, d, x, y, z, o) {
      o = o || {};
      const b = Math.min(o.bevel || 0.03, w * 0.3, h * 0.3, d * 0.3);
      const sh = new THREE.Shape();
      const hw = w / 2 - b,
        hh = h / 2 - b;
      sh.moveTo(-hw, -hh);
      sh.lineTo(hw, -hh);
      sh.lineTo(hw, hh);
      sh.lineTo(-hw, hh);
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: Math.max(0.001, d - 2 * b),
        bevelEnabled: true,
        bevelThickness: b,
        bevelSize: b,
        bevelSegments: 1,
        curveSegments: 1,
      });
      g.translate(0, 0, -(d - 2 * b) / 2);
      g.deleteAttribute("uv");
      return this.add(mat, g, Object.assign({}, o, { x, y, z }));
    }
    cyl(mat, rt, rb, h, x, y, z, o) {
      o = o || {};
      const g = new THREE.CylinderGeometry(
        rt,
        rb,
        h,
        o.seg || 12,
        o.hseg || 1,
        !!o.open,
        o.thetaStart || 0,
        o.thetaLength || X.TAU,
      );
      return o.flat === false
        ? this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }))
        : this.add(mat, g, Object.assign({}, o, { x, y, z }));
    }
    /** Cylinder between two points a→b (pipes, bones, poles). */
    seg(mat, a, b, r, o) {
      o = o || {};
      const dx = b[0] - a[0],
        dy = b[1] - a[1],
        dz = b[2] - a[2];
      const len = Math.hypot(dx, dy, dz) || 0.001;
      const g = new THREE.CylinderGeometry(
        o.r2 !== undefined ? o.r2 : r,
        r,
        len,
        o.seg || 6,
        1,
        !!o.open,
      );
      // align +Y to direction
      const dir = new THREE.Vector3(dx, dy, dz).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      );
      g.applyQuaternion(q);
      g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
      return this.add(
        mat,
        g,
        Object.assign({}, o, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }),
      );
    }
    sphere(mat, r, x, y, z, o) {
      o = o || {};
      const g = new THREE.SphereGeometry(
        r,
        o.wseg || 10,
        o.hseg || 7,
        0,
        X.TAU,
        o.phiStart || 0,
        o.phiLength || Math.PI,
      );
      return this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }));
    }
    torus(mat, R, r, x, y, z, o) {
      o = o || {};
      const g = new THREE.TorusGeometry(
        R,
        r,
        o.rseg || 6,
        o.tseg || 16,
        o.arc || X.TAU,
      );
      return this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }));
    }
    lathe(mat, pts, x, y, z, o) {
      o = o || {};
      const g = new THREE.LatheGeometry(
        pts.map((p) => new THREE.Vector2(p[0], p[1])),
        o.seg || 12,
      );
      return this.addSmooth(mat, g, Object.assign({}, o, { x, y, z }));
    }
    loft(mat, stations, o) {
      o = o || {};
      const g = X.loftGeometry(stations, o.seg || 16, o);
      // loft carries smooth normals; keep them
      g.applyMatrix4(xform(o));
      boxUV(g, o.uvScale || 1);
      if (o.uvFn) o.uvFn(g);
      bakeColors(g, Object.assign({ seed: this.seed * 0.37 }, o));
      this.list.push({ mat, tint: !!o.tint, geom: g });
      return g;
    }
    extrude(mat, pts, depth, o) {
      o = o || {};
      const g = X.extrudeGeometry(pts, depth, o.bevel);
      g.deleteAttribute("uv");
      return this.add(mat, g, o);
    }
    /**
     * Atlas-mapped quad. Faces +Z by default (rotate with ry). opts.mat overrides material ('atlas'|'screen'|'trim').
     * region: name in the atlas (10_atlas.js); flipU mirrors.
     */
    quad(region, w, h, x, y, z, o) {
      o = o || {};
      const g = new THREE.PlaneGeometry(w, h);
      const R = X.atlasRegion(region);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) {
        let u = uv.getX(i),
          v = uv.getY(i);
        if (o.flipU) u = 1 - u;
        uv.setXY(i, X.lerp(R.u0, R.u1, u), X.lerp(R.v0, R.v1, v));
      }
      return this.add(
        o.mat || "atlas",
        g,
        Object.assign(
          { ao: [1, 1], grime: o.grime !== undefined ? o.grime : 0.12 },
          o,
          { x, y, z, uv: "keep" },
        ),
      );
    }
    /** Box whose faces all sample one atlas region (crates, cabinets with printed faces). */
    abox(region, w, h, d, x, y, z, o) {
      o = o || {};
      const g = new THREE.BoxGeometry(w, h, d);
      const R = X.atlasRegion(region);
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          X.lerp(R.u0, R.u1, uv.getX(i)),
          X.lerp(R.v0, R.v1, uv.getY(i)),
        );
      return this.add(
        o.mat || "atlas",
        g,
        Object.assign({}, o, { x, y, z, uv: "keep" }),
      );
    }
    /** Include another kit's geometry transformed by o (sub-assemblies). */
    include(kit, o) {
      const m = xform(o || {}).clone();
      for (const e of kit.list) {
        const g = e.geom.clone();
        g.applyMatrix4(m);
        this.list.push({ mat: e.mat, tint: e.tint, geom: g });
      }
      return this;
    }
    build(name) {
      const groups = new Map();
      for (const e of this.list) {
        const k = e.mat + (e.tint ? ":t" : "");
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k).push(e.geom);
      }
      const parts = [];
      const box = new THREE.Box3();
      let tris = 0;
      for (const [k, geoms] of groups) {
        for (const g of geoms) {
          if (!g.attributes.uv) boxUV(g, 1);
          if (!g.attributes.color) bakeColors(g, {});
        }
        const merged = U.mergeGeometries(geoms);
        merged.computeBoundingBox();
        merged.computeBoundingSphere();
        box.union(merged.boundingBox);
        tris += merged.index
          ? merged.index.count / 3
          : merged.attributes.position.count / 3;
        const colon = k.indexOf(":");
        parts.push({
          mat: colon >= 0 ? k.slice(0, colon) : k,
          tint: colon >= 0,
          geom: merged,
        });
      }
      if (box.isEmpty())
        box.set(
          new THREE.Vector3(-0.1, 0, -0.1),
          new THREE.Vector3(0.1, 0.2, 0.1),
        );
      return { name: name || "proto", parts, box, tris, meta: this.meta };
    }
  }
  X.Kit = Kit;

  /** UV fn for solid colour on atlas-based materials (trim) */
  X.whiteUV = function (g) {
    const R = X.atlasRegion("white");
    const u = (R.u0 + R.u1) / 2,
      v = (R.v0 + R.v1) / 2;
    const a = new Float32Array(g.attributes.position.count * 2);
    for (let i = 0; i < a.length; i += 2) {
      a[i] = u;
      a[i + 1] = v;
    }
    g.setAttribute("uv", new THREE.BufferAttribute(a, 2));
  };

  // ------------------------------------------------------------------
  // Prototype registry. Builders: fn(kit, rng, variant) — may set kit.meta:
  //   collider: {w, d, h, y0?, cx?, cz?} | null     (prop-local box)
  //   tier: 'small'|'medium'|'large'                (LOD tier for scatter)
  //   container: {name, loot, lock?}                (default container def; lock = G.locks spec)
  //   glows: [{x,y,z,color,size,flicker}]  fires: [{x,y,z,scale,smoke}]
  //   radiation: {y, radius, strength}   explosive: {hp, radius, damage}
  //   surface: collider surface
  // ------------------------------------------------------------------
  const PROTO_DEFS = {};
  const PROTO_CACHE = {};
  X.defineProto = function (name, builder, defaults) {
    PROTO_DEFS[name] = { builder, defaults: defaults || {} };
  };
  X.hasProto = (name) => !!PROTO_DEFS[name];
  X.protoNames = () => Object.keys(PROTO_DEFS);
  X.proto = function (name, variant) {
    variant = variant || 0;
    const key = name + "#" + variant;
    if (PROTO_CACHE[key]) return PROTO_CACHE[key];
    const def = PROTO_DEFS[name];
    if (!def) throw new Error("props: unknown prototype " + name);
    const seed = U.hashStr(key) || 1;
    const kit = new Kit(seed);
    Object.assign(kit.meta, def.defaults);
    def.builder(kit, U.rng(seed), variant);
    const pr = kit.build(key);
    pr.id = key;
    pr.type = name;
    pr.variant = variant;
    PROTO_CACHE[key] = pr;
    return pr;
  };
  X.protoStats = () =>
    Object.keys(PROTO_CACHE).map((k) => k + ":" + PROTO_CACHE[k].tris);

  /** Create a standalone Object3D (one Mesh per material part) from a proto. */
  X.instantiate = function (pr, opts) {
    opts = opts || {};
    const grp = new THREE.Group();
    grp.name = "prop_" + pr.id;
    for (const part of pr.parts) {
      const mesh = new THREE.Mesh(part.geom, X.mat(part.mat));
      mesh.castShadow = opts.castShadow !== false && pr.meta.tier !== "small";
      mesh.receiveShadow = true;
      mesh.userData.propPart = part.mat;
      grp.add(mesh);
    }
    return grp;
  };

  // ------------------------------------------------------------------
  // Static Batcher: merges transformed proto copies per chunk & material.
  // One Group per chunk (distance culled with G.world.addLOD).
  // ------------------------------------------------------------------
  // Static batches fold look-alike materials together to save draw calls per chunk.
  // 'glow' (unlit vertex colour) folds into 'screen' (unlit atlas) by pointing its UVs at the white texel.
  const STATIC_REMAP = {
    plain: "metal",
    paint: "metal",
    glass: "metal",
    chrome: "metal",
    trim: "atlas",
    glow: "screen",
  };
  const WHITE_UV_MATS = { glow: 1 };
