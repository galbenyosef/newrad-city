// play-inline-211 06 — opts
// Lines 1280-1627 of readable/play-inline-211.pretty.js (statement-aligned).
  PH.texMat = function (key, tex, opts) {
    opts = opts || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.85 : opts.rough,
        metalness: opts.metal || 0,
        side: opts.double ? THREE.DoubleSide : THREE.FrontSide,
        vertexColors: false,
      });
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
        if (opts.name) m.name = opts.name;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.4;
        m.depthWrite = true;
      }
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      m.userData.shared = true;
      m.userData.keepUV = true;
      if (opts.emissive && haveMats() && G.mats.track) {
        try {
          G.mats.track(m, {
            glow: opts.glow || [opts.emissive * 0.4, opts.emissive],
          });
        } catch (e) {
          /* optional */
        }
      }
      matCache[k] = m;
      NO_SHADOW.add(k);
    }
    return k;
  };
  /** A material from the textures module used as-is (billboards, neon, signs). */
  PH.extMat = function (key, make) {
    const k = "tex:" + key;
    if (matCache[k]) return k;
    let m = null;
    try {
      if (haveMats()) m = make();
    } catch (e) {
      m = null;
    }
    if (!m || !m.isMaterial) return null;
    matCache[k] = m;
    NO_SHADOW.add(k);
    return k;
  };
  PH.brandMat = (brand) =>
    PH.extMat("brand_" + brand, () =>
      G.mats.billboard(brand, 0, { lit: true }),
    ) ||
    PH.texMat(
      "brandfb_" + brand,
      PH.signTex(
        "brand_" + brand,
        [brand.replace(/_/g, " ").toUpperCase()],
        "enamel",
        512,
        256,
        { bg: "#7a2520" },
      ),
    );
  /** Sign material: textures-module sign if present, else our canvas. */
  PH.signMat = function (key, lines, style, w, h, extra) {
    return PH.texMat(
      "sign_" + key,
      PH.signTex(key, lines, style, w, h, extra),
      extra && extra.emissive ? { emissive: extra.emissive } : {},
    );
  };

  // -------------------------------------------------------------------
  // Batch: collect geometry per material, UV + vertex colour + bake, merge
  // -------------------------------------------------------------------
  function Batch(name) {
    this.name = name;
    this.parts = new Map();
    this.M = null;
    this.ground = 0;
    this.aoH = 3.0;
    this.grime = 0.5;
    this.tris = 0;
    this.lights = null;
    this.ambient = null;
  }
  PH.batch = (name) => new Batch(name);
  Batch.prototype.frame = function (m) {
    this.M = m || null;
    return this;
  };
  Batch.prototype.setLights = function (lights, ambient, ambI) {
    const M = this.M;
    this.lights = (lights || []).map((l) => ({
      p: M
        ? new THREE.Vector3(l.x, l.y, l.z).applyMatrix4(M)
        : new THREE.Vector3(l.x, l.y, l.z),
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
  Batch.prototype.addLight = function (x, y, z, color, r, i) {
    if (!this.lights) this.lights = [];
    this.lights.push({
      p: this.M
        ? new THREE.Vector3(x, y, z).applyMatrix4(this.M)
        : new THREE.Vector3(x, y, z),
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
  };
  const emissiveKey = (key) => {
    const d = MAT_DEFS[baseKey(key)];
    return !!(d && d.emissive !== undefined);
  };
  Batch.prototype.add = function (key, geom, opts) {
    opts = opts || {};
    let g = geom;
    if (g.index) g = g.toNonIndexed();
    if (opts.m) g.applyMatrix4(opts.m);
    if (this.M) g.applyMatrix4(this.M);
    if (!g.attributes.normal) g.computeVertexNormals();
    const keep = key.indexOf("tex:") === 0;
    shade(g, opts, this, keep ? 1 : metersFor(key), keep);
    if ((this.lights || this.ambient) && !keep && !emissiveKey(key)) {
      bake(g, this);
      key = key + "@lit";
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
  function bake(g, batch) {
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
        const w = att * (0.22 + 0.78 * Math.max(0, ndl));
        r += l.c.r * w;
        gg += l.c.g * w;
        b += l.c.b * w;
      }
      out[i * 3] = Math.min(1.5, r);
      out[i * 3 + 1] = Math.min(1.5, gg);
      out[i * 3 + 2] = Math.min(1.5, b);
    }
    g.setAttribute("bake", new THREE.BufferAttribute(out, 3));
  }
  const GRIME = new THREE.Color(0x2a2218);
  function shade(g, opts, batch, meters, keep) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    if (!keep && opts.uv !== "keep") {
      const s = 1 / (opts.uvScale || meters || 4);
      const arr = new Float32Array(cnt * 2);
      for (let i = 0; i < cnt; i++) {
        const nx = Math.abs(n.getX(i)),
          ny = Math.abs(n.getY(i)),
          nz = Math.abs(n.getZ(i));
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        let u, v;
        if (ny >= nx && ny >= nz) {
          u = x;
          v = z;
        } else if (nx >= nz) {
          u = z;
          v = y;
        } else {
          u = x;
          v = y;
        }
        arr[i * 2] = u * s;
        arr[i * 2 + 1] = v * s;
      }
      g.setAttribute("uv", new THREE.BufferAttribute(arr, 2));
    } else if (!g.attributes.uv)
      g.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(cnt * 2), 2),
      );
    else if (opts.uvRect) {
      const R = opts.uvRect,
        uv = g.attributes.uv;
      for (let i = 0; i < cnt; i++)
        uv.setXY(
          i,
          R[0] + uv.getX(i) * (R[2] - R[0]),
          R[1] + uv.getY(i) * (R[3] - R[1]),
        );
    }
    const col = new Float32Array(cnt * 3);
    const tint = new THREE.Color(opts.c === undefined ? 0xffffff : opts.c);
    const grime =
      opts.grime === undefined ? (keep ? 0.1 : batch.grime) : opts.grime;
    const ground = opts.ground === undefined ? batch.ground : opts.ground;
    const aoH = opts.aoH || batch.aoH;
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      let k = 1;
      if (!opts.noAO) k *= 0.6 + 0.4 * PH.smooth(-0.2, aoH, y - ground);
      let gr = 0;
      if (grime > 0) {
        const blot = U.fbm2(x * 0.11 + z * 0.05 + 3.1, y * 0.13 + z * 0.09, 3);
        const streak = U.noise2((x + z) * 0.9, y * 0.02 + 7.3);
        gr =
          grime *
          (Math.max(0, blot - 0.42) * 1.3 + Math.max(0, streak - 0.55) * 0.9);
        if (n.getY(i) > 0.7) gr += grime * 0.22;
        gr = Math.min(0.85, gr);
        k *=
          0.9 +
          0.2 * U.hash2(Math.floor(x * 2.3), Math.floor(z * 2.3 + y * 1.7));
      }
      col[i * 3] = tint.r * k * (1 - gr) + GRIME.r * gr * k;
      col[i * 3 + 1] = tint.g * k * (1 - gr) + GRIME.g * gr * k;
      col[i * 3 + 2] = tint.b * k * (1 - gr) + GRIME.b * gr * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  const segs = (v, len, cap) =>
    Math.max(1, Math.min(cap || 8, Math.ceil(v / len)));
  /** Box by bottom-centre (cx, y0, cz), size w h d; opts.ry/rx/rz rotate about the box centre. */
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
    const m = PH.m4(cx, y0 + h / 2, cz, opts.ry, opts.rx, opts.rz);
    if (opts.m) m.premultiply(opts.m);
    return this.add(key, geo, Object.assign({}, opts, { m }));
  };
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
    // upright: y0 = base; laid on its side (|rx| or |rz| > 0.7): y0 = axis height
    const horiz = Math.abs(opts.rx || 0) > 0.7 || Math.abs(opts.rz || 0) > 0.7;
    const m = PH.m4(
      x,
      horiz ? y0 : y0 + h / 2,
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
  /** Square beam between two points. */
