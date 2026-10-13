// play-inline-332 05 — grime
// Lines 1137-1469 of readable/play-inline-332.pretty.js (statement-aligned).
  const SELF_LIT = 1.0;
  /** Material for key. lit=true → interior self-lit variant (vertex colour = baked light). */
  K.mat = function (key, lit) {
    const base = resolve(key).base;
    const d = MATDEF[base] || MATDEF.concrete;
    const ck = base + (lit ? ":lit" : "");
    if (MATS[ck]) return MATS[ck];
    let m;
    if (d.neon) {
      m = new THREE.MeshBasicMaterial({
        map: atlasTex(d.atlas),
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: !lit,
        side: THREE.DoubleSide,
      });
    } else if (d.lamp) {
      m = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        vertexColors: true,
        toneMapped: false,
        fog: !lit,
      });
    } else {
      let map = null;
      if (d.atlas) map = atlasTex(d.atlas);
      else if (d.custom) map = customTex(d.custom);
      else if (d.tex) {
        if (!G.isStub("tex")) {
          try {
            const t = G.tex.get(d.tex);
            if (t && t.isTexture) map = t;
          } catch (e) {
            map = null;
          }
        }
        if (!map) map = fallbackTex(d.tex, d.fb || 0x999999);
      }
      m = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map,
        vertexColors: true,
        roughness: d.rough !== undefined ? d.rough : 0.85,
        metalness: d.metal || 0,
        side: d.side || THREE.FrontSide,
      });
      if (d.alphaTest) m.alphaTest = d.alphaTest;
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        if (d.opacity) m.opacity = d.opacity;
        else {
          m.polygonOffset = true;
          m.polygonOffsetFactor = -2;
          m.polygonOffsetUnits = -2;
        }
      }
      if (!lit && d.tex && !d.custom && !G.isStub("tex") && G.tex.normal) {
        try {
          const n = G.tex.normal(d.tex);
          if (n && n.isTexture) {
            m.normalMap = n;
            m.normalScale = new THREE.Vector2(0.5, 0.5);
          }
        } catch (e) {
          /* */
        }
      }
      if (lit) {
        m.onBeforeCompile = function (sh) {
          sh.fragmentShader = sh.fragmentShader.replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += diffuseColor.rgb * " +
              SELF_LIT.toFixed(2) +
              ";",
          );
        };
        m.customProgramCacheKey = function () {
          return "pev_selflit";
        };
      }
    }
    m.name = "pev_" + ck;
    m.userData.shared = true;
    return (MATS[ck] = m);
  };

  // ------------------------------------------------------------------
  // BUILDER
  // ------------------------------------------------------------------
  /**
   * K.builder({name, off:{x,y,z} (local→world), lit (interior baked light), amb [r,g,b], grime, floors:[y...] (local floor levels for AO)})
   */
  function Builder(o) {
    o = o || {};
    this.name = o.name || "pev";
    this.off = o.off || { x: 0, y: 0, z: 0 };
    this.lit = !!o.lit;
    this.amb = o.amb || [0.12, 0.12, 0.13];
    this.grime = o.grime !== undefined ? o.grime : 0.5;
    this.floors = (o.floors || [0]).slice().sort((a, b) => a - b);
    this.bk = new Map();
    this.lights = [];
    this.glows = [];
    this.burns = [];
    this.colliders = [];
    this.shadows = o.shadows !== undefined ? o.shadows : !o.lit;
    this.seg = o.seg || (this.lit ? 1.4 : 5);
  }
  K.builder = (o) => new Builder(o);
  const BP = Builder.prototype;
  BP._b = function (mat) {
    const r = resolve(mat);
    this._mul = r.mul;
    let b = this.bk.get(r.base);
    if (!b) {
      b = { p: [], n: [], uv: [], c: [], i: [], vc: 0 };
      this.bk.set(r.base, b);
    }
    return b;
  };
  /** Floor level below local y (for ground AO). */
  BP._floorBelow = function (ly) {
    let f = this.floors[0];
    for (const v of this.floors) if (v <= ly + 0.05) f = v;
    return f;
  };
  /** Base colour for a vertex (local coords): tint × grime/AO. */
  BP._col = function (lx, ly, lz, ny, tint, grime) {
    let s = 1;
    if (grime > 0) {
      const gy = ly - this._floorBelow(ly);
      const ao = U.clamp(1 - gy / (this.lit ? 1.6 : 4.5), 0, 1);
      const streak = U.noise2(lx * 0.31 + lz * 0.27, ly * 0.07);
      const blotch = U.noise2(
        lx * 0.09 + 11.3 + ly * 0.02,
        lz * 0.09 - ly * 0.04,
      );
      s =
        1 -
        grime *
          (0.4 * ao * ao + 0.22 * streak * streak + 0.24 * blotch * blotch);
      if (ny < -0.6) s *= 1 - grime * 0.15;
    }
    for (const bn of this.burns) {
      const dx = lx - bn.x,
        dy = ly - bn.y,
        dz = lz - bn.z,
        d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bn.r * bn.r)
        s *= 1 - bn.amt * Math.min(1, (1 - Math.sqrt(d2) / bn.r) * 1.6);
    }
    const m = this._mul;
    return m
      ? [tint[0] * s * m[0], tint[1] * s * m[1], tint[2] * s * m[2]]
      : [tint[0] * s, tint[1] * s, tint[2] * s];
  };
  function tintArr(t) {
    if (t === undefined || t === null) return [1, 1, 1];
    if (Array.isArray(t)) return t;
    const c = new THREE.Color(t);
    return [c.r, c.g, c.b];
  }
  K.tint = tintArr;
  /** Scorch / soot darkening sphere (local coords). */
  BP.burn = function (x, y, z, r, amt) {
    this.burns.push({ x, y, z, r, amt: amt === undefined ? 0.7 : amt });
    return this;
  };
  /** Baked point light (local coords). o: {box:[x0,y0,z0,x1,y1,z1] local limits, wrap} */
  BP.light = function (x, y, z, color, intensity, radius, o) {
    o = o || {};
    const c = tintArr(color);
    const off = this.off;
    const L = {
      x: x + off.x,
      y: y + off.y,
      z: z + off.z,
      c,
      i: intensity,
      r: radius,
      r2: radius * radius,
      wrap: o.wrap !== undefined ? o.wrap : 0.35,
    };
    if (o.box)
      L.box = [
        o.box[0] + off.x,
        o.box[1] + off.y,
        o.box[2] + off.z,
        o.box[3] + off.x,
        o.box[4] + off.y,
        o.box[5] + off.z,
      ];
    this.lights.push(L);
    return this;
  };
  /** Glow sprite (fake light halo). size in metres. */
  BP.glow = function (x, y, z, color, size) {
    this.glows.push({
      x: x + this.off.x,
      y: y + this.off.y,
      z: z + this.off.z,
      c: tintArr(color),
      s: size || 1,
    });
    return this;
  };

  /** push one vertex (local coords in; stored in world coords) */
  BP._v = function (b, x, y, z, nx, ny, nz, u, v, tint, grime) {
    const o = this.off;
    b.p.push(x + o.x, y + o.y, z + o.z);
    b.n.push(nx, ny, nz);
    b.uv.push(u, v);
    const c = this._col(x, y, z, ny, tint, grime);
    b.c.push(c[0], c[1], c[2]);
    b.vc++;
  };
  /**
   * Planar grid face. origin (ox,oy,oz), U axis (ux,uy,uz) length ul, V axis (vx,vy,vz) length vl. Normal = U×V.
   * o: {uv:'side'|'top'|'plane'|'rect', rect, tint, grime, uo, vo, seg, tile}
   */
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    if (o.rect) mat = K.atlasMat(mat, o.rect);
    if (ul <= 1e-4 || vl <= 1e-4) return this;
    const b = this._b(mat);
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || this.seg;
    const su = Math.max(1, Math.min(32, Math.ceil(ul / seg))),
      sv = Math.max(1, Math.min(32, Math.ceil(vl / seg)));
    const tile = o.tile || K.tileOf(mat);
    const mode = o.uv || "side";
    const tint = tintArr(o.tint);
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const bb = (vl * j) / sv;
      for (let i = 0; i <= su; i++) {
        const a = (ul * i) / su;
        const x = ox + ux * a + vx * bb,
          y = oy + uy * a + vy * bb,
          z = oz + uz * a + vz * bb;
        let u, v;
        if (mode === "rect") {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (a / ul);
          v = r[1] + (r[3] - r[1]) * (bb / vl);
        } else if (mode === "top") {
          u = (x + this.off.x) / tile[0];
          v = -(z + this.off.z) / tile[1];
        } else if (mode === "plane") {
          u = ((o.uo || 0) + a) / tile[0];
          v = ((o.vo || 0) + bb) / tile[1];
        } else {
          u = ((o.uo || 0) + a) / tile[0];
          v = y / tile[1];
        }
        this._v(b, x, y, z, nx, ny, nz, u, v, tint, grime);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    return this;
  };
  /** Quad from 4 corner points (counter-clockwise seen from the front). o: {rect, tint, grime, uv} */
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    if (o.rect) mat = K.atlasMat(mat, o.rect);
    const b = this._b(mat);
    const ax = p1[0] - p0[0],
      ay = p1[1] - p0[1],
      az = p1[2] - p0[2];
    const bx = p3[0] - p0[0],
      by = p3[1] - p0[1],
      bz = p3[2] - p0[2];
    let nx = ay * bz - az * by,
      ny = az * bx - ax * bz,
      nz = ax * by - ay * bx;
    const nl = Math.hypot(nx, ny, nz) || 1;
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const tint = tintArr(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tileOf(mat);
    const base = b.vc;
    const pts = [p0, p1, p2, p3];
    const R = o.rect;
    const ruv = R
      ? [
          [R[0], R[1]],
          [R[2], R[1]],
          [R[2], R[3]],
          [R[0], R[3]],
        ]
      : null;
    for (let k = 0; k < 4; k++) {
      const p = pts[k];
      let u, v;
      if (ruv) {
        u = ruv[k][0];
        v = ruv[k][1];
      } else {
        const aX = Math.abs(nx),
          aY = Math.abs(ny),
          aZ = Math.abs(nz);
        if (aY >= aX && aY >= aZ) {
          u = p[0] / tile[0];
          v = -p[2] / tile[1];
        } else if (aX >= aZ) {
          u = p[2] / tile[0];
          v = p[1] / tile[1];
        } else {
          u = p[0] / tile[0];
          v = p[1] / tile[1];
        }
      }
      this._v(b, p[0], p[1], p[2], nx, ny, nz, u, v, tint, grime);
    }
    b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
    return this;
  };
  /** Subdivided (bilinear) quad p0→p1 = U, p0→p3 = V; normal (p1−p0)×(p3−p0). o: {tint, grime, seg, uv:'top'|'side'} */
