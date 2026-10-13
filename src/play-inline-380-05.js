// play-inline-380 05 — atlas
// Lines 1194-1538 of readable/play-inline-380.pretty.js (statement-aligned).
  K.paint = function (atlas0, key, w, h, draw) {
    if (CELLKEY[atlas0 + "|" + key]) return CELLKEY[atlas0 + "|" + key];
    // overflow chain: art → art2 → art3 …
    let atlas = atlas0,
      A = atlasInit(atlas, 2048),
      n = 1;
    const fits = (B) =>
      B.curX + w <= B.size
        ? B.shelfY + Math.max(B.shelfH, h) <= B.size
        : B.shelfY + B.shelfH + 2 + h <= B.size;
    while (!fits(A) && n < 6) {
      n++;
      atlas = atlas0 + n;
      A = atlasInit(atlas, 2048);
      ensureAtlasMats(atlas0, atlas);
    }
    const rect = paintInto(A, key, w, h, draw);
    rect.atlas = atlas;
    return (CELLKEY[atlas0 + "|" + key] = rect);
  };
  function ensureAtlasMats(base, name) {
    if (MATDEF[name]) return;
    if (base === "neon") MATDEF[name] = { atlas: name, neon: true };
    else {
      MATDEF[name] = { atlas: name, rough: 0.75, alphaTest: 0.4 };
      MATDEF[name + "_decal"] = { atlas: name, rough: 0.9, transparent: true };
    }
  }
  /** Map a generic atlas material key to the atlas that actually holds the rect. */
  K.atlasMat = function (mat, rect) {
    if (!rect || !rect.atlas) return mat;
    if (mat === "art" || mat === "pics") return rect.atlas;
    if (mat === "decal")
      return rect.atlas === "art"
        ? "decal"
        : MATDEF[rect.atlas + "_decal"]
          ? rect.atlas + "_decal"
          : rect.atlas;
    if (mat === "neon") return rect.atlas;
    return mat;
  };
  function paintInto(A, key, w, h, draw) {
    if (A.cells[key]) return A.cells[key];
    if (A.curX + w > A.size) {
      A.shelfY += A.shelfH + 2;
      A.curX = 0;
      A.shelfH = 0;
    }
    if (A.shelfY + h > A.size) {
      console.warn("[poi_penn] atlas full: " + A.name);
      return (A.cells[key] = [0, 0, 0.01, 0.01]);
    }
    const X = A.curX,
      Y = A.shelfY;
    A.x.save();
    A.x.beginPath();
    A.x.rect(X, Y, w, h);
    A.x.clip();
    try {
      draw(A.x, X, Y, w, h);
    } catch (e) {
      G.reportError("poi_penn:paint " + key, e);
    }
    A.x.restore();
    A.curX += w + 2;
    A.shelfH = Math.max(A.shelfH, h);
    if (A.tex) A.tex.needsUpdate = true;
    const S = A.size;
    return (A.cells[key] = [
      (X + 0.5) / S,
      1 - (Y + h - 0.5) / S,
      (X + w - 0.5) / S,
      1 - (Y + 0.5) / S,
    ]);
  }
  function atlasTex(name) {
    const A = atlasInit(name, 2048);
    if (!A.tex) {
      A.tex = K.texFromCanvas(A.c, { clamp: true });
    }
    return A.tex;
  }
  K.refreshAtlases = function () {
    for (const k in ATLAS) if (ATLAS[k].tex) ATLAS[k].tex.needsUpdate = true;
  };

  const MATS = {};
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
          return "ppn_selflit";
        };
      }
    }
    m.name = "ppn_" + ck;
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
    this.name = o.name || "ppn";
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
    this._al = r.aS ? r : null;
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
    if (this._al && (tint[0] !== 1 || tint[1] !== 1 || tint[2] !== 1))
      tint = this._aliasTint(tint);
    return m
      ? [tint[0] * s * m[0], tint[1] * s * m[1], tint[2] * s * m[2]]
      : [tint[0] * s, tint[1] * s, tint[2] * s];
  };
  /**
   * Round 2 colour fix: a tint on an ALIASED material (mahogany, gilt, hotel_red, bronze…) was multiplied on top of the
   * alias colour in LINEAR space — a mahogany tint on mahogany came out near-black (the Café Rouge, sofas, doors).
   * The tint is now read as the intended sRGB colour: its brightness is kept, its hue pulls the alias hue halfway
   * toward it, and the result is converted to a linear multiplier on top of the alias colour.
   */
  BP._aliasTint = function (t) {
    const al = this._al;
    if (this._atT === t && this._atA === al) return this._atR;
    const tl = 0.2126 * t[0] + 0.7152 * t[1] + 0.0722 * t[2];
    const mx = Math.max(t[0], t[1], t[2]),
      sat = mx > 1e-4 ? (mx - Math.min(t[0], t[1], t[2])) / mx : 0;
    const kBlend = U.clamp((sat - 0.14) / 0.24, 0, 1); // grey tints stay plain multipliers (darken / weather)
    let out = t;
    if (tl > 1e-4 && kBlend > 0) {
      const ratio = Math.min(1.6, tl / al.alum);
      out = [0, 0, 0];
      for (let k = 0; k < 3; k++) {
        const hueT = t[k] / tl,
          hueA = Math.max(0.02, al.aS[k]) / al.alum;
        const want = ratio * Math.sqrt(Math.max(0.01, hueT / hueA)); // desired sRGB / alias sRGB
        out[k] = U.clamp(Math.pow(want, 2.2), 0.03, 3.0); // → linear multiplier
        out[k] = t[k] + (out[k] - t[k]) * kBlend;
      }
    }
    this._atT = t;
    this._atA = al;
    this._atR = out;
    return out;
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
