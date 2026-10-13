// play-inline-279 07 — key
// Lines 1705-2038 of readable/play-inline-279.pretty.js (statement-aligned).
  P.CUSTOM = CUSTOM;
  P.customTex = (name) => {
    const d = CUSTOM[name];
    return d ? P.canvasTex("pt_c_" + name, d[0], d[1], d[2]) : null;
  };

  const matCache = {};
  const metersCache = {};
  function hasMats() {
    return !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
  }
  /** Material for key (MAT key, 'tex:<k>' registered with P.texMat); optional '@lit' suffix = baked-light variant. */
  P.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = bakedVariant(P.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0) return P.mat("concrete");
    const d = MAT[key] || { color: 0x808080, uv: 3 };
    let m = null;
    if (d.src && !d.custom && hasMats()) {
      try {
        const o = { vertexColors: true };
        if (d.tint !== undefined) o.color = d.tint;
        if (d.src === "glass") {
          o.transparent = true;
          o.opacity = 0.28;
          o.color = 0xd0e0e0;
        }
        const b = G.mats.get(d.src, o);
        if (b && b.isMaterial) m = b;
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const o = {
        color: d.color,
        roughness: d.rough === undefined ? 0.9 : d.rough,
        metalness: d.metal || 0,
        vertexColors: true,
      };
      if (d.custom) {
        o.map = P.customTex(d.custom);
        o.color = d.tint !== undefined ? d.tint : 0xffffff;
        if (d.emissiveCustom) o.emissiveMap = o.map;
      }
      if (d.emissive !== undefined) {
        o.emissive = d.emissive;
        o.emissiveIntensity = d.ei || 1;
      }
      if (d.side === "back") o.side = THREE.BackSide;
      if (d.src === "glass") {
        o.transparent = true;
        o.opacity = 0.5;
      }
      if (d.opacity !== undefined) {
        o.transparent = true;
        o.opacity = d.opacity;
      }
      m = new THREE.MeshStandardMaterial(o);
      m.userData.shared = true;
      if (d.emissive !== undefined)
        try {
          if (G.mats && G.mats.track && !G.isStub("mats"))
            G.mats.track(m, { glow: [d.ei || 1, d.ei || 1] });
        } catch (e) {
          /* optional */
        }
    }
    if (d.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add albedo × (per-vertex baked lamp light) to its emission (fake interior GI). */
  function bakedVariant(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      ptBaked: true,
    });
    const prev = base.onBeforeCompile;
    m.onBeforeCompile = function (sh, r) {
      try {
        if (prev && prev !== THREE.Material.prototype.onBeforeCompile)
          prev.call(this, sh, r);
      } catch (e) {
        /* keep going */
      }
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bake;\nvarying vec3 vPtBake;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvPtBake = bake;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vPtBake;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vPtBake * 1.5;",
        );
    };
    const prevKey = base.customProgramCacheKey
      ? base.customProgramCacheKey.bind(base)
      : () => "";
    m.customProgramCacheKey = () => "pt_baked1|" + prevKey();
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured material for signs / paintings (uv kept 0..1). */
  P.texMat = function (key, tex, o) {
    o = o || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: o.rough === undefined ? 0.85 : o.rough,
        metalness: o.metal || 0,
        vertexColors: !!o.vc,
        side: o.double ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (o.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = o.emissive;
      }
      if (o.transparent) {
        m.transparent = true;
        m.alphaTest = o.alphaTest || 0.35;
        m.depthWrite = o.depthWrite !== false;
      }
      if (o.color !== undefined) m.color = new THREE.Color(o.color);
      m.userData.shared = true;
      matCache[k] = m;
      NO_SHADOW.add(k);
    }
    return k;
  };
  function metersFor(key) {
    key = baseKey(key);
    if (metersCache[key] !== undefined) return metersCache[key];
    const d = MAT[key];
    let m = d ? d.uv || 3 : 3;
    if (d && d.src && !d.custom && hasMats()) {
      try {
        const inf = G.tex.info(d.src);
        if (inf && inf.meters) m = inf.meters;
      } catch (e) {
        /* default */
      }
    }
    return (metersCache[key] = m);
  }

  // ===================================================================
  // Batch
  // ===================================================================
  const GRIME = new THREE.Color(0x2a2218);
  function Batch(name, o) {
    o = o || {};
    this.name = name;
    this.items = [];
    this.ox = o.ox || 0;
    this.oy = o.oy || 0;
    this.oz = o.oz || 0;
    this.lit = !!o.lit;
    this.lights = [];
    this.ambient =
      o.ambient !== undefined
        ? new THREE.Color(o.ambient).multiplyScalar(
            o.ambI === undefined ? 1 : o.ambI,
          )
        : null;
    this.segLen = o.segLen || (this.lit ? 1.8 : 6);
    this.ground = 0;
    this.aoH = o.aoH || 2.6;
    this.grime = o.grime === undefined ? 0.45 : o.grime;
    this.ao = o.ao === undefined ? 0.4 : o.ao;
    this.tris = 0;
  }
  P.Batch = Batch;
  const segs = (v, len) => Math.max(1, Math.min(24, Math.ceil(v / len)));
  /** Add geometry (consumed). o: {m, c (tint), grime, ground, uv:'box'|'keep', uvScale, uvRect, us, vs, noAO, noBake} */
  Batch.prototype.add = function (key, geom, o) {
    o = o || {};
    let g = geom.index ? geom.toNonIndexed() : geom;
    if (geom.index) geom.dispose();
    if (o.m) g.applyMatrix4(o.m);
    if (this.ox || this.oy || this.oz) g.translate(this.ox, this.oy, this.oz);
    if (!g.attributes.normal) g.computeVertexNormals();
    shade(g, key, o, this);
    this.items.push({ key, g, noBake: !!o.noBake });
    this.tris += g.attributes.position.count / 3;
    return g;
  };
  Batch.prototype.light = function (x, y, z, color, r, i) {
    this.lights.push({
      p: new THREE.Vector3(x + this.ox, y + this.oy, z + this.oz),
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
  };
  /** Box from min/max corners (local). o.ry rotates about the centre. */
  Batch.prototype.box = function (key, x0, y0, z0, x1, y1, z1, o) {
    o = o || {};
    const w = Math.abs(x1 - x0),
      h = Math.abs(y1 - y0),
      d = Math.abs(z1 - z0);
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return null;
    const sl = o.segLen || this.segLen,
      sg = o.seg === false;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      sg ? 1 : segs(w, sl),
      sg ? 1 : segs(h, sl),
      sg ? 1 : segs(d, sl),
    );
    const m = P.m4(
      (x0 + x1) / 2,
      (y0 + y1) / 2,
      (z0 + z1) / 2,
      o.ry,
      o.rx,
      o.rz,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Box by bottom centre + size. */
  Batch.prototype.boxC = function (key, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const sl = o.segLen || this.segLen,
      sg = o.seg === false;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      sg ? 1 : segs(w, sl),
      sg ? 1 : segs(h, sl),
      sg ? 1 : segs(d, sl),
    );
    const m = P.m4(cx, y0 + h / 2, cz, o.ry, o.rx, o.rz);
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.cyl = function (key, x, y0, z, rt, rb, h, seg, o) {
    o = o || {};
    const geo = new THREE.CylinderGeometry(
      rt,
      rb,
      h,
      seg || 12,
      o.hSeg || segs(h, this.segLen),
      !!o.open,
      o.t0 || 0,
      o.tl || TAU,
    );
    const m = P.m4(
      x,
      y0 + h / 2,
      z,
      o.ry,
      o.rx,
      o.rz,
      o.sx,
      1,
      o.sz === undefined ? o.sx : o.sz,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Cylinder between two points a,b (arrays or Vector3, local). */
  const _va = new THREE.Vector3(),
    _vb = new THREE.Vector3(),
    _up = new THREE.Vector3(0, 1, 0);
  Batch.prototype.rod = function (key, a, b, r, seg, o) {
    o = o || {};
    const A = Array.isArray(a) ? _va.set(a[0], a[1], a[2]) : _va.copy(a),
      B = Array.isArray(b) ? _vb.set(b[0], b[1], b[2]) : _vb.copy(b);
    const dir = new THREE.Vector3().subVectors(B, A);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = o.square
      ? new THREE.BoxGeometry(r * 2, len, (o.r2 || r) * 2)
      : new THREE.CylinderGeometry(
          o.rTop === undefined ? r : o.rTop,
          r,
          len,
          seg || 6,
          1,
          !!o.open,
        );
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(_up, dir.normalize());
    const m = new THREE.Matrix4().compose(
      A.clone(),
      q,
      new THREE.Vector3(1, 1, 1),
    );
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.sphere = function (key, x, y, z, r, o) {
    o = o || {};
    const geo = new THREE.SphereGeometry(
      r,
      o.ws || 12,
      o.hs || 8,
      o.p0 || 0,
      o.pl || TAU,
      o.t0 || 0,
      o.tl || PI,
    );
    const m = P.m4(
      x,
      y,
      z,
      o.ry,
      o.rx,
      o.rz,
      o.sx || 1,
      o.sy || o.sx || 1,
      o.sz || o.sx || 1,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
