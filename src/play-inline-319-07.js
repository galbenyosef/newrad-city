// play-inline-319 07 — key
// Lines 1515-1851 of readable/play-inline-319.pretty.js (statement-aligned).
  const baseKey = (k) =>
    k.length > 4 && k.slice(-4) === "@lit" ? k.slice(0, -4) : k;
  PF.baseKey = baseKey;
  PF.MAT_DEFS = MAT_DEFS;
  const matCache = {};
  const NO_SHADOW = new Set();
  /**
   * Shared material for a key. Keys may be MAT_DEFS names, or 'tex:<cacheKey>' for
   * one-off textured quads (registered with PF.texMat).
   */
  const texInfoMeters = {};
  /** World metres per texture tile for a MAT_DEFS key (textures module's own scale when we use its surface). */
  function metersFor(key) {
    const def = MAT_DEFS[key];
    if (!def) return 4;
    if (texInfoMeters[key] !== undefined) return texInfoMeters[key];
    let m = def.uv || 4;
    const mat = PF.mat(key);
    if (mat && mat.userData.lbSrc && def.src) {
      try {
        const inf = G.tex.info(def.src);
        if (inf && inf.meters) m = inf.meters;
      } catch (e) {
        /* keep default */
      }
    }
    texInfoMeters[key] = m;
    return m;
  }
  /**
   * Material for a key. Keys: MAT_DEFS names, 'tex:<k>' (PF.texMat), 'brand:<id>' (PF.brandMat), each optionally
   * suffixed '@lit' → a clone that adds the per-vertex baked light (attribute `bake`) as emission (fake interior GI).
   */
  PF.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = makeBakedVariant(PF.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0 || key.indexOf("brand:") === 0)
      return matCache[key] || PF.mat("concrete");
    const def = MAT_DEFS[key] || { color: 0x808080, rough: 0.9, uv: 4 };
    let m = null;
    const haveMats =
      !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    const haveSrc =
      def.src &&
      haveMats &&
      !def.forceFallback &&
      (() => {
        try {
          return !G.tex.has || G.tex.has(def.src);
        } catch (e) {
          return false;
        }
      })();
    if (haveSrc && def.prefer !== "custom") {
      try {
        // Shared, cached material from the textures module (keeps its anti-tiling macro variation).
        const o = { vertexColors: true };
        if (def.tint !== undefined) o.color = def.tint;
        if (def.metal !== undefined) o.metalness = def.metal;
        const base = G.mats.get(def.src, o);
        if (base && base.isMaterial) {
          m = base;
          m.userData.lbSrc = def.src;
        }
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const opts = {
        color: def.color,
        roughness: def.rough === undefined ? 0.9 : def.rough,
        metalness: def.metal || 0,
        vertexColors: true,
      };
      const ct =
        def.custom && def.custom !== "verdigris"
          ? PF.customTex(def.custom)
          : null;
      if (def.custom === "verdigris") {
        opts.map = PF.verdigrisTex();
        opts.color = def.tint !== undefined ? def.tint : 0xffffff;
      } else if (ct) {
        opts.map = ct;
        opts.color = def.tint !== undefined ? def.tint : 0xffffff;
        if (def.bump) {
          opts.bumpMap = ct;
          opts.bumpScale = def.bump;
        }
      } else if (!def.plain)
        opts.map =
          def.src === "metal_painted" ||
          def.src === "rust" ||
          def.src === "metal_panel"
            ? PF.grimeTex()
            : PF.noiseTex();
      if (def.emissive !== undefined) {
        opts.emissive = def.emissive;
        opts.emissiveIntensity = def.emissiveIntensity || 1;
        if (def.emissiveMapCustom && ct) opts.emissiveMap = ct;
      }
      m = new THREE.MeshStandardMaterial(opts);
      m.userData.shared = true;
    }
    m.userData.lbKey = m.userData.lbKey || key;
    if (def.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add `albedo * bake` (per-vertex baked lamp light) to its emission. */
  function makeBakedVariant(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      lbKey: key,
      lbBaked: true,
    });
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bake;\nvarying vec3 vLbBake;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvLbBake = bake;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vLbBake;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vLbBake * 1.6;",
        );
    };
    m.customProgramCacheKey = () => "pch_baked_v2";
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured material (signs, flags, banners). Returns the key to use with batch/quad. */
  PF.texMat = function (key, tex, opts) {
    opts = opts || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.85 : opts.rough,
        metalness: opts.metal || 0,
        side: opts.side || THREE.FrontSide,
        vertexColors: !!opts.vc,
      });
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.4;
      }
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      m.userData.shared = true;
      m.userData.uv = 1;
      m.userData.keepUV = true;
      matCache[k] = m;
      if (opts.noShadow) NO_SHADOW.add(k);
    }
    return k;
  };
  /** Use a billboard/brand material from G.mats if available (brand billboards). */
  PF.brandMat = function (brand) {
    const k = "brand:" + brand;
    if (matCache[k]) return k;
    let m = null;
    try {
      if (!G.isStub("mats") && G.mats.billboard)
        m = G.mats.billboard(brand, 0, { lit: true });
    } catch (e) {
      m = null;
    }
    if (!m || !m.isMaterial) {
      const t = PF.signTex(
        "brand_" + brand,
        [brand.replace(/_/g, " ").toUpperCase()],
        "enamel",
        512,
        256,
        { bg: "#7a2520" },
      );
      m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 });
    }
    m.userData = m.userData || {};
    m.userData.shared = true;
    m.userData.keepUV = true;
    matCache[k] = m;
    NO_SHADOW.add(k);
    return k;
  };

  // -------------------------------------------------------------------
  // Batch: collect geometry per material, bake UV + vertex colour, merge.
  // -------------------------------------------------------------------
  const _n = new THREE.Vector3(),
    _nm = new THREE.Matrix3();
  function Batch(name) {
    this.name = name;
    this.parts = new Map();
    this.M = null; // optional frame matrix (local → world)
    this.ground = 0; // AO reference height
    this.aoH = 3.0; // AO fade height
    this.grime = 0.55; // default grime strength
    this.tris = 0;
    this.lights = null; // baked interior lights [{p:Vector3, c:Color, r, i}] → '@lit' materials
    this.ambient = null; // baked ambient (THREE.Color) added everywhere in a lit batch
  }
  Batch.prototype.frame = function (m) {
    this.M = m || null;
    return this;
  };
  /**
   * Fake interior lighting: every geometry added afterwards gets a per-vertex `bake` colour
   * (sum of point lights with smooth falloff & wrap-lambert) that its '@lit' material adds as
   * emission — interiors read as lamp-lit instead of black under the sun's shadow map.
   * lights: [{x,y,z, color hex, r (radius), i (intensity)}], ambient: hex scaled by ambI.
   */
  Batch.prototype.setLights = function (lights, ambient, ambI) {
    this.lights = (lights || []).map((l) => ({
      p: new THREE.Vector3(l.x, l.y, l.z),
      c: new THREE.Color(l.color === undefined ? 0xffd8a0 : l.color),
      r: l.r || 12,
      i: l.i === undefined ? 1 : l.i,
    }));
    this.ambient =
      ambient === undefined
        ? null
        : new THREE.Color(ambient).multiplyScalar(
            ambI === undefined ? 1 : ambI,
          );
    return this;
  };
  /** Add a baked light to an already-lit batch (e.g. a lamp placed while dressing). */
  Batch.prototype.addLight = function (x, y, z, color, r, i) {
    if (!this.lights) this.lights = [];
    this.lights.push({
      p: new THREE.Vector3(x, y, z),
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
  };
  /**
   * Add a geometry (consumed). opts: {m: Matrix4 local transform, c: tint hex, grime, ground, aoH,
   * uv: 'box' (default, world triplanar) | 'keep', us, vs (keep-mode scale), uvRect [u0,v0,u1,v1] (keep-mode
   * sub-rectangle, e.g. one painting of an atlas), noAO, uvScale}
   * Geometries may carry a float attribute `aoMul` (per-vertex cavity occlusion) which is folded into the
   * vertex colour and then removed.
   */
  Batch.prototype.add = function (key, geom, opts) {
    opts = opts || {};
    let g = geom;
    if (g.index) g = g.toNonIndexed(); // per-face attributes for crisp projection
    if (opts.m) g.applyMatrix4(opts.m);
    if (this.M) g.applyMatrix4(this.M);
    if (!g.attributes.normal) g.computeVertexNormals();
    const mat = PF.matMeta(key);
    shadeGeometry(g, opts, this, mat);
    if (this.lights || this.ambient) {
      bakeLights(g, this);
      if (!emissiveKey(key)) key = key + "@lit";
    }
    let arr = this.parts.get(key);
    if (!arr) {
      arr = [];
      this.parts.set(key, arr);
    }
    arr.push(g);
    this.tris += g.attributes.position.count / 3;
    return g;
  };
  function emissiveKey(key) {
    const d = MAT_DEFS[key];
    return !!(d && d.emissive !== undefined);
  }
  PF.matMeta = function (key) {
    key = baseKey(key);
    if (key.indexOf("tex:") === 0 || key.indexOf("brand:") === 0)
      return { uv: 1, keep: true };
    return { uv: MAT_DEFS[key] ? metersFor(key) : 4, keep: false };
  };
  const _bl = new THREE.Vector3();
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
