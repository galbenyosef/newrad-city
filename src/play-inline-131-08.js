// play-inline-131 08 — ctx
// Lines 1867-2214 of readable/play-inline-131.pretty.js (statement-aligned).
  function adDraw(a) {
    return (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, a.bg[0]);
      g.addColorStop(1, a.bg[1]);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(0, h * 0.08, w, h * 0.04);
      const x0 = w * 0.3;
      if (a.bottle) {
        // tall ribbed bottle on the left
        ctx.fillStyle = a.bottle;
        const bx = w * 0.12,
          bw = w * 0.07;
        ctx.fillRect(bx - bw / 2, h * 0.32, bw, h * 0.58);
        ctx.fillRect(bx - bw * 0.22, h * 0.1, bw * 0.44, h * 0.24);
        ctx.beginPath();
        ctx.moveTo(bx - bw / 2, h * 0.32);
        ctx.lineTo(bx - bw * 0.22, h * 0.22);
        ctx.lineTo(bx + bw * 0.22, h * 0.22);
        ctx.lineTo(bx + bw / 2, h * 0.32);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.25)";
        for (let i = 0; i < 6; i++)
          ctx.fillRect(
            bx - bw / 2 + 3 + (i * (bw - 6)) / 5,
            h * 0.36,
            2,
            h * 0.5,
          );
      } else if (a.star) {
        // starburst
        ctx.fillStyle = a.star;
        const cx = w * 0.14,
          cy = h * 0.5;
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const an = (i / 24) * TAU,
            rr = i % 2 ? h * 0.16 : h * 0.38;
          ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr);
        }
        ctx.fill();
      } else if (a.disc) {
        // round trade-mark disc with the initial
        ctx.fillStyle = a.disc;
        ctx.beginPath();
        ctx.arc(w * 0.14, h * 0.5, h * 0.3, 0, TAU);
        ctx.fill();
        ctx.fillStyle = a.fg;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold " + Math.floor(h * 0.36) + "px Georgia, serif";
        ctx.fillText(a.letter || "", w * 0.14, h * 0.52);
      } else if (a.ring) {
        // a sleeper's frosted pod window
        ctx.strokeStyle = a.ring;
        ctx.lineWidth = h * 0.05;
        ctx.beginPath();
        ctx.arc(w * 0.14, h * 0.5, h * 0.3, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "rgba(160,210,230,0.7)";
        ctx.beginPath();
        ctx.arc(w * 0.14, h * 0.5, h * 0.26, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = a.fg;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      let fs = fitFont(
        ctx,
        [a.head],
        Math.floor(h * 0.3),
        w * 0.64,
        "Georgia, serif",
      );
      ctx.font = "bold italic " + fs + "px Georgia, serif";
      ctx.fillText(a.head, x0 + w * 0.34, h * 0.42);
      fs = fitFont(ctx, [a.sub], Math.floor(h * 0.1), w * 0.64, "sans-serif");
      ctx.font = "bold " + fs + "px sans-serif";
      ctx.fillText(a.sub, x0 + w * 0.34, h * 0.72);
      const r = U.rng(U.hashStr(a.head)); // sun fade, paste-up seams, peeling
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      for (let x = w / 4; x < w; x += w / 4) ctx.fillRect(x, 0, 2, h);
      for (let i = 0; i < 70; i++) {
        ctx.fillStyle =
          "rgba(" +
          ((200 + r() * 40) | 0) +
          "," +
          ((190 + r() * 40) | 0) +
          ",160," +
          (0.08 + r() * 0.2) +
          ")";
        ctx.fillRect(r() * w, r() * h, 8 + r() * 60, 4 + r() * 30);
      }
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = "rgba(40,30,20," + (0.1 + r() * 0.25) + ")";
        ctx.fillRect(r() * w, r() * h, 2 + r() * 6, 10 + r() * 50);
      }
    };
  }
  LB.brandMat = function (brand) {
    const k = "brand:" + brand;
    if (matCache[k]) return k;
    let m = null;
    if (AD_ART[brand])
      m = new THREE.MeshStandardMaterial({
        map: LB.canvasTex("lb_ad_" + brand, 768, 384, adDraw(AD_ART[brand])),
        roughness: 0.8,
      });
    try {
      if (!m && !G.isStub("mats") && G.mats.billboard)
        m = G.mats.billboard(brand, 0, { lit: true });
    } catch (e) {
      m = null;
    }
    if (!m || !m.isMaterial) {
      const t = LB.signTex(
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
    const mat = LB.matMeta(key);
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
  LB.matMeta = function (key) {
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
    const m = LB.m4(cx, y0 + h / 2, cz, opts.ry, opts.rx, opts.rz);
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
    const m = LB.m4(
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
