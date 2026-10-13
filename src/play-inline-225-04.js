// play-inline-225 04 — color
// Lines 609-948 of readable/play-inline-225.pretty.js (statement-aligned).
  LI.mat = function (key, baked) {
    const ck = key + (baked ? "@b" : "");
    if (matCache[ck]) return matCache[ck];
    let m = null;
    if (key.indexOf("tex:") === 0) {
      m = matCache[key];
      if (!m) {
        m = new THREE.MeshStandardMaterial({ color: 0x808080 });
        matCache[key] = m;
      }
      if (baked) {
        m = m.clone();
        m.userData = Object.assign({}, m.userData);
        bakeHook(m);
      }
      return (matCache[ck] = m);
    }
    const d = MAT[key] || { c: 0x888888, plain: true };
    if (d.canvas && LI.CANVAS[d.canvas]) {
      m = new THREE.MeshStandardMaterial({
        map: LI.canvasTex("li_cv_" + d.canvas, 512, 512, LI.CANVAS[d.canvas]),
        color: d.tint === undefined ? 0xffffff : d.tint,
        roughness: d.rough === undefined ? 0.92 : d.rough,
        metalness: d.metal || 0,
        vertexColors: true,
      });
      m.userData = { shared: true, liKey: key };
      if (baked) bakeHook(m);
      return (matCache[ck] = m);
    }
    const haveMats =
      !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    if (d.src && !d.plain && haveMats) {
      try {
        const o = { vertexColors: true };
        if (d.tint !== undefined) o.color = d.tint;
        if (d.rough !== undefined) o.roughness = d.rough;
        if (d.metal !== undefined) o.metalness = d.metal;
        if (d.emissive !== undefined) {
          o.emissive = d.emissive;
          o.emissiveIntensity = d.ei;
        }
        if (d.transparent) {
          o.transparent = true;
          o.opacity = d.opacity;
        }
        const base = G.mats.get(d.src, o);
        if (base && base.isMaterial) m = base.clone();
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const o = {
        color: d.c === undefined ? 0x888888 : d.c,
        roughness: d.rough === undefined ? 0.85 : d.rough,
        metalness: d.metal || 0,
        vertexColors: true,
      };
      if (!d.plain && !d.emissive) o.map = noiseTex();
      if (d.emissive !== undefined) {
        o.emissive = new THREE.Color(d.emissive);
        o.emissiveIntensity = d.ei || 1;
      }
      if (d.transparent) {
        o.transparent = true;
        o.opacity = d.opacity;
        o.depthWrite = false;
      }
      m = new THREE.MeshStandardMaterial(o);
      if (d.lamp) m.name = "li_lamp";
      if (d.lamp && !G.isStub("mats") && G.mats.track) {
        try {
          G.mats.track(m, { glow: [d.ei * 0.8, d.ei] });
        } catch (e) {
          /* optional */
        }
      }
    }
    if (d.double) m.side = THREE.DoubleSide;
    // glowOnly (screens, goo, force fields): glowing surfaces, not light fixtures — an emissiveMap keeps atmosphere's
    // fixture scan from turning every monitor ring into a saturated green pool of real light
    if (d.glowOnly && m.emissive && !m.emissiveMap) {
      if (!LI._white) {
        LI._white = new THREE.DataTexture(
          new Uint8Array([255, 255, 255, 255]),
          1,
          1,
        );
        LI._white.needsUpdate = true;
      }
      m.emissiveMap = LI._white;
      m.needsUpdate = true;
    }
    m.userData = Object.assign({}, m.userData, { shared: true, liKey: key });
    if (d.noFixture || d.glowOnly) m.userData.noFixture = true; // (request to atmosphere: skip these in the lamp scan)
    if (baked && !d.noBake && d.emissive === undefined) bakeHook(m);
    return (matCache[ck] = m);
  };
  /** Register a textured material (signs, murals). Returns its key ('tex:<id>'). opts: {emissive, transparent, rough, metal, double, color} */
  LI.texMat = function (id, tex, opts) {
    const k = "tex:" + id;
    opts = opts || {};
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.8 : opts.rough,
        metalness: opts.metal || 0,
        vertexColors: true,
      });
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.35;
      }
      if (opts.double) m.side = THREE.DoubleSide;
      m.userData = {
        shared: true,
        liKey: k,
        keepUV: true,
        emissive: !!opts.emissive,
      };
      matCache[k] = m;
    }
    return k;
  };
  const isEmissiveKey = (k) => {
    if (k.indexOf("tex:") === 0) {
      const m = matCache[k];
      return !!(m && m.userData.emissive);
    }
    const d = MAT[k];
    return !!(d && (d.emissive !== undefined || d.noBake));
  };
  const keepUV = (k) => k.indexOf("tex:") === 0;

  // =====================================================================
  // Batch
  // =====================================================================
  const _n = new THREE.Vector3(),
    _a = new THREE.Vector3(),
    _b = new THREE.Vector3(),
    _c = new THREE.Vector3();
  function Batch(name) {
    this.name = name;
    this.parts = new Map();
    this.lights = [];
    this.amb = new THREE.Color(0x303030);
    this.fy = 0;
    this.aoH = 1.4;
    this.grime = 0.5;
    this.tris = 0;
    // Round 2 lighting: big faces are tessellated (≤ seg metres) so the per-vertex bake has resolution, the bake
    // runs at build() with EVERY light of the cell (sconces/pendants added after a wall used to miss it), and
    // thick plate-like boxes (walls, floors, slabs) occlude baked lights (no more light through walls).
    this.seg = 1.5;
    this.occ = [];
    this.occlude = true;
  }
  LI.Batch = Batch;
  /** Baked point light (local coords). */
  Batch.prototype.light = function (x, y, z, color, r, i) {
    this.lights.push({
      x,
      y,
      z,
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
    return this;
  };
  Batch.prototype.ambient = function (color, i) {
    this.amb = new THREE.Color(color).multiplyScalar(i === undefined ? 1 : i);
    return this;
  };
  /**
   * Add a geometry (consumed). o: {m: Matrix4, c: tint hex|Color, grime, noAO, fy (floor ref), uvRect:[u0,v0,u1,v1], us, vs, bakeMul}
   */
  Batch.prototype.add = function (key, geom, o) {
    o = o || {};
    let g = geom.index ? geom.toNonIndexed() : geom;
    if (g !== geom) geom.dispose();
    if (o.m) g.applyMatrix4(o.m);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (o.flip) {
      // view from inside: reverse winding + negate normals
      const P = g.attributes.position,
        Nn = g.attributes.normal,
        U0 = g.attributes.uv;
      for (let t = 0; t < P.count; t += 3)
        for (const A2 of [P, Nn, U0]) {
          if (!A2) continue;
          const s = A2.itemSize;
          for (let k = 0; k < s; k++) {
            const tmp = A2.array[(t + 1) * s + k];
            A2.array[(t + 1) * s + k] = A2.array[(t + 2) * s + k];
            A2.array[(t + 2) * s + k] = tmp;
          }
        }
      for (let i = 0; i < Nn.array.length; i++) Nn.array[i] = -Nn.array[i];
    }
    if (this.seg > 0 && o.tess !== false && !isEmissiveKey(key) && !o.noBake)
      g = tessellate(g, this.seg * 1.5);
    const pos = g.attributes.position,
      nor = g.attributes.normal,
      cnt = pos.count;
    // ---- UVs
    if (keepUV(key) || o.keepUV) {
      if (!g.attributes.uv)
        g.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(cnt * 2), 2),
        );
      const uv = g.attributes.uv;
      if (o.uvRect) {
        const r = o.uvRect;
        for (let i = 0; i < cnt; i++)
          uv.setXY(
            i,
            r[0] + uv.getX(i) * (r[2] - r[0]),
            r[1] + uv.getY(i) * (r[3] - r[1]),
          );
      } else if (o.us || o.vs)
        for (let i = 0; i < cnt; i++)
          uv.setXY(i, uv.getX(i) * (o.us || 1), uv.getY(i) * (o.vs || 1));
    } else {
      const s = 1 / (LI.metersFor(key) * (o.uvScale || 1));
      const uv = new Float32Array(cnt * 2);
      for (let t = 0; t < cnt; t += 3) {
        _a.fromBufferAttribute(pos, t);
        _b.fromBufferAttribute(pos, t + 1);
        _c.fromBufferAttribute(pos, t + 2);
        _n.subVectors(_c, _b).cross(_a.clone().sub(_b));
        const ax = Math.abs(_n.x),
          ay = Math.abs(_n.y),
          az = Math.abs(_n.z);
        for (let k = 0; k < 3; k++) {
          const i = t + k,
            x = pos.getX(i),
            y = pos.getY(i),
            z = pos.getZ(i);
          let u, v;
          if (ay >= ax && ay >= az) {
            u = x;
            v = z;
          } else if (ax >= az) {
            u = z;
            v = y;
          } else {
            u = x;
            v = y;
          }
          uv[i * 2] = u * s + (o.uo || 0);
          uv[i * 2 + 1] = v * s + (o.vo || 0);
        }
      }
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    }
    // ---- vertex colour: tint × AO × grime
    const tint =
      o.c === undefined ? null : o.c.isColor ? o.c : new THREE.Color(o.c);
    const col = new Float32Array(cnt * 3);
    const fy = o.fy === undefined ? this.fy : o.fy,
      aoH = o.aoH || this.aoH,
      gr = o.grime === undefined ? this.grime : o.grime;
    for (let i = 0; i < cnt; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      let k = 1;
      if (!o.noAO) k *= 0.6 + 0.4 * LI.smooth(0, aoH, y - fy);
      if (gr > 0)
        k *=
          1 -
          gr * 0.32 * vnoise(x * 0.35 + y * 0.21, z * 0.35 - y * 0.13) -
          gr * 0.12 * vnoise(x * 1.7, z * 1.7 + y);
      col[i * 3] = (tint ? tint.r : 1) * k;
      col[i * 3 + 1] = (tint ? tint.g : 1) * k;
      col[i * 3 + 2] = (tint ? tint.b : 1) * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    // ---- baked light: deferred to build() so every light of the cell is known
    g.userData.liBake = !isEmissiveKey(key) && !o.noBake ? o.bakeMul || 1 : 0;
    if (g.userData.liBake && o.occ !== false && this.occlude)
      this._occFrom(key, g, o);
    let arr = this.parts.get(key);
    if (!arr) {
      arr = [];
      this.parts.set(key, arr);
    }
    arr.push(g);
    this.tris += cnt / 3;
    return g;
  };
  /** Register a thick, plate-like box (wall/floor/slab ≥ 1.2 m on two sides) as a light occluder. */
  Batch.prototype._occFrom = function (key, g, o) {
    const d = MAT[key];
    if (d && (d.transparent || d.noBake)) return;
    if (!o._box) return;
    const bx = o._box,
      s3 = [bx.sx, bx.sy, bx.sz].sort((p, q) => p - q);
    const pier = s3[0] >= 0.28 && bx.sy >= 2.5 && bx.sy >= s3[2] - 1e-6; // tall piers / mullions / pilasters cast too
    if (!pier && (s3[0] < 0.08 || s3[1] < 1.8 || s3[2] < 2.4)) return;
    this.occ.push({
      cx: bx.cx,
      cy: bx.cy,
      cz: bx.cz,
      hx: bx.sx / 2,
      hy: bx.sy / 2,
      hz: bx.sz / 2,
      c: Math.cos(bx.ry || 0),
      s: Math.sin(bx.ry || 0),
      r: Math.hypot(bx.sx, bx.sy, bx.sz) / 2,
    });
  };
  /** Extra occluder (local AABB), e.g. a solid mass built from non-box pieces. */
  Batch.prototype.occluder = function (x0, y0, z0, x1, y1, z1) {
    const sx = Math.abs(x1 - x0),
      sy = Math.abs(y1 - y0),
      sz = Math.abs(z1 - z0);
    this.occ.push({
      cx: (x0 + x1) / 2,
      cy: (y0 + y1) / 2,
      cz: (z0 + z1) / 2,
      hx: sx / 2,
      hy: sy / 2,
      hz: sz / 2,
      c: 1,
      s: 0,
      r: Math.hypot(sx, sy, sz) / 2,
    });
    return this;
  };
  // segment (origin o, unit dir u, length len) vs oriented box (yaw about Y): true if it enters the box in (eps, len-eps)
