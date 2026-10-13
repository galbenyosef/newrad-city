// play-inline-170 04 — key
// Lines 599-949 of readable/play-inline-170.pretty.js (statement-aligned).
  function makeCustomTex(name) {
    if (customTex[name]) return customTex[name];
    let c;
    if (name === "marble" || name === "marble_warm") {
      const S = 512;
      c = K.canvas(S, S);
      const x = c.getContext("2d");
      const r = K.rng(name === "marble" ? 91 : 92);
      const base = name === "marble" ? "#e9e4d6" : "#b88a62";
      x.fillStyle = base;
      x.fillRect(0, 0, S, S);
      // cloudy variation
      for (let i = 0; i < 40; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 30 + r() * 120;
        const g = x.createRadialGradient(px, py, 0, px, py, rad);
        const tint =
          name === "marble"
            ? r() < 0.5
              ? "200,195,180"
              : "245,240,230"
            : r() < 0.5
              ? "150,95,60"
              : "215,160,120";
        g.addColorStop(0, "rgba(" + tint + ",0.35)");
        g.addColorStop(1, "rgba(" + tint + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      // veins
      for (let i = 0; i < 26; i++) {
        x.strokeStyle =
          name === "marble"
            ? "rgba(110,105,95," + (0.15 + r() * 0.35) + ")"
            : "rgba(90,50,30," + (0.2 + r() * 0.4) + ")";
        x.lineWidth = 0.4 + r() * 2.2;
        x.beginPath();
        let px = r() * S,
          py = r() * S;
        x.moveTo(px, py);
        for (let k = 0; k < 10; k++) {
          px += (r() - 0.35) * 70;
          py += (r() - 0.5) * 50;
          x.lineTo(px, py);
        }
        x.stroke();
      }
      // slab joints
      x.strokeStyle = "rgba(40,35,30,0.45)";
      x.lineWidth = 2;
      x.strokeRect(1, 1, S - 2, S - 2);
      x.beginPath();
      x.moveTo(0, S / 2);
      x.lineTo(S, S / 2);
      x.stroke();
      K.stains(x, S, S, 6, 44, 0.18);
      K.grain(x, S, S, 10, 45);
    } else if (name === "verdigris") {
      const S = 256;
      c = K.canvas(S, S);
      const x = c.getContext("2d");
      const r = K.rng(61);
      x.fillStyle = "#5e9a86";
      x.fillRect(0, 0, S, S);
      for (let i = 0; i < 60; i++) {
        const px = r() * S,
          py = r() * S,
          rad = 8 + r() * 50,
          g = x.createRadialGradient(px, py, 0, px, py, rad);
        const t =
          r() < 0.4 ? "60,50,40" : r() < 0.5 ? "120,180,160" : "80,120,100";
        g.addColorStop(0, "rgba(" + t + ",0.45)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
      }
      // standing seams
      x.fillStyle = "rgba(30,50,40,0.35)";
      for (let i = 0; i < S; i += 32) x.fillRect(i, 0, 3, S);
      K.streaks(x, S, S, 30, 62, 0.25);
      K.grain(x, S, S, 20, 63);
    }
    customTex[name] = K.texFromCanvas(c);
    return customTex[name];
  }

  const fbTex = {};
  function surfaceTex(def) {
    if (def.map) return def.map;
    if (def.custom) return makeCustomTex(def.custom);
    if (!def.tex) return null;
    if (!G.isStub("tex")) {
      try {
        const t = G.tex.get(def.tex);
        if (t && t.isTexture) return t;
      } catch (e) {
        /* fall through */
      }
    }
    const key = def.tex + ":" + (def.fb || "noise");
    if (!fbTex[key]) {
      // fallback texture is grey-ish; material colour tints it
      fbTex[key] = K.texFromCanvas(
        fallbackCanvas(def.fb || "noise", 0xcfcfcf, U.hashStr(key) % 1000),
      );
    }
    return fbTex[key];
  }
  function surfaceNormal(def) {
    if (!def.tex || G.isStub("tex") || !G.tex.normal) return null;
    try {
      const t = G.tex.normal(def.tex);
      return t && t.isTexture ? t : null;
    } catch (e) {
      return null;
    }
  }

  /** Register/override a material definition (e.g. custom façade textures). */
  K.defineMat = function (key, def) {
    MATDEF[key] = def;
    delete MATS[key];
  };
  /** Material instance for key (cached; vertexColors on for baked grime). */
  K.mat = function (key) {
    if (ALIASES[key]) key = ALIASES[key][0];
    if (MATS[key]) return MATS[key];
    const d = MATDEF[key] || MATDEF.concrete;
    let m;
    if (d.material) m = d.material;
    else if (d.basic) {
      m = new THREE.MeshBasicMaterial({
        color: d.color,
        vertexColors: true,
        map: d.map || null,
        side: d.side || THREE.FrontSide,
        transparent: !!d.transparent,
        blending: d.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: !d.additive && !d.transparent,
        fog: d.fog !== false,
        toneMapped: d.toneMapped !== undefined ? d.toneMapped : true,
      });
      if (d.alphaTest) m.alphaTest = d.alphaTest;
    } else {
      const map = d.flat ? null : surfaceTex(d);
      m = new THREE.MeshStandardMaterial({
        color: d.color !== undefined ? d.color : 0xffffff,
        map,
        vertexColors: true,
        roughness: d.rough !== undefined ? d.rough : 0.85,
        metalness: d.metal || 0,
        side: d.side || THREE.FrontSide,
      });
      const nm = d.flat || d.custom ? null : surfaceNormal(d);
      if (nm) {
        m.normalMap = nm;
        m.normalScale = new THREE.Vector2(0.6, 0.6);
      }
      if (d.emissive) m.emissive = new THREE.Color(d.emissive);
      if (d.emissiveMap) {
        m.emissiveMap = d.emissiveMap;
        m.emissive = new THREE.Color(d.emissiveColor || 0xffffff);
        m.emissiveIntensity = d.emissiveIntensity || 1;
      }
      if (d.alphaTest) {
        m.alphaTest = d.alphaTest;
      }
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        m.opacity = d.opacity || 1;
      }
      if ((d.metal || 0) >= 0.25 && K.envTex && !m.envMap) {
        m.envMap = K.envTex;
        m.envMapIntensity = d.envI !== undefined ? d.envI : 0.9;
      }
    }
    m.name = "pmid_" + key;
    m.userData.shared = true;
    MATS[key] = m;
    return m;
  };
  K.tile = function (key) {
    if (ALIASES[key]) key = ALIASES[key][0];
    const d = MATDEF[key];
    return (d && d.tile) || [3, 3];
  };

  // ------------------------------------------------------------------
  // BUILDER — batches geometry per material
  // ------------------------------------------------------------------
  const _c = new THREE.Color();
  function Builder(name, opts) {
    opts = opts || {};
    this.name = name;
    this.bk = new Map();
    this.grime = opts.grime !== undefined ? opts.grime : 0.55;
    this.burns = []; // {x,y,z,r,amt}
    this.groundY = opts.groundY || 0;
    // Baked interior lighting: when `ambient` is set, every vertex colour is multiplied by
    // ambient + Σ light(colour × intensity × falloff × wrapped-Lambert). No runtime lights needed.
    this.ambient = opts.ambient !== undefined ? opts.ambient : null;
    this.lights = [];
    this.maxLight = opts.maxLight || 2.4;
    this.gain = opts.gain || 1; // multiplies every baked light's intensity
    // Vertical offset applied at finish(): interiors are authored with floors below 0 and lifted so
    // every walkable floor is >= 0 (the engine's interior terrain is a hard floor at y = 0).
    this.yOff = opts.yOff !== undefined ? opts.yOff : K.yOff || 0;
  }
  K.builders = K.builders || [];
  K.builder = (name, opts) => {
    const b = new Builder(name, opts);
    K.builders.push(b);
    return b;
  };
  const BP = Builder.prototype;

  BP._b = function (mat) {
    const al = resolveMat(mat);
    this._mul = al;
    if (al) mat = al.base;
    const md = MATDEF[mat];
    this._unlit = !!(md && (md.basic || md.unlit));
    let b = this.bk.get(mat);
    if (!b) {
      b = { p: [], n: [], uv: [], c: [], i: [], vc: 0 };
      this.bk.set(mat, b);
    }
    return b;
  };
  /** Scorch / soot sphere darkening all vertex colours inside it. */
  BP.burn = function (x, y, z, r, amt) {
    this.burns.push({ x, y, z, r, amt: amt === undefined ? 0.7 : amt });
    return this;
  };
  /** Baked point light (radius r metres, colour, intensity). Only affects geometry added AFTER the call. */
  BP.light = function (x, y, z, r, color, i) {
    setLin(_c, color === undefined ? 0xffd9a0 : color);
    const k = (i === undefined ? 1 : i) * this.gain;
    this.lights.push({
      x,
      y,
      z,
      r,
      r2: r * r,
      cr: _c.r * k,
      cg: _c.g * k,
      cb: _c.b * k,
    });
    if (this.ambient === null) this.ambient = 0.6;
    return this;
  };
  BP._lit = function (x, y, z, nx, ny, nz) {
    const a = this.ambient;
    let r = a,
      g = a,
      b = a;
    for (let k = 0; k < this.lights.length; k++) {
      const L = this.lights[k];
      const dx = L.x - x,
        dy = L.y - y,
        dz = L.z - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= L.r2) continue;
      const d = Math.sqrt(d2) || 1e-3;
      let f = 1 - d / L.r;
      f *= f;
      const lam =
        nx === undefined
          ? 1
          : 0.3 + 0.7 * Math.max(0, (dx * nx + dy * ny + dz * nz) / d);
      r += L.cr * f * lam;
      g += L.cg * f * lam;
      b += L.cb * f * lam;
    }
    const M = this.maxLight;
    return [Math.min(M, r), Math.min(M, g), Math.min(M, b)];
  };

  /** Vertex colour: tint × grime (ground AO, streaks, blotches, scorch). */
  BP._color = function (x, y, z, ny, tint, grime, nx, nz) {
    let s = 1,
      warm = 0;
    if (grime > 0) {
      const gy = y - this.groundY;
      const ao = U.clamp(1 - gy / 4.5, 0, 1);
      const streak = U.noise2(x * 0.23 + z * 0.19, y * 0.04);
      const blotch = U.noise2(
        x * 0.047 + 11.3 + y * 0.013,
        z * 0.047 - y * 0.031,
      );
      s =
        1 -
        grime *
          (0.34 * ao * ao + 0.26 * streak * streak + 0.2 * blotch * blotch);
      if (ny > 0.6) {
        s *= 1 - grime * 0.12;
        warm = grime * 0.05;
      } else if (ny < -0.6) s *= 1 - grime * 0.25;
    }
    for (let k = 0; k < this.burns.length; k++) {
      const bn = this.burns[k];
      const dx = x - bn.x,
        dy = y - bn.y,
        dz = z - bn.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bn.r * bn.r) {
        const f = 1 - Math.sqrt(d2) / bn.r;
        s *= 1 - bn.amt * Math.min(1, f * 1.6);
      }
    }
    const m = this._mul;
    let out;
    if (m)
      out = [
        tint.r * s * (1 + warm) * m.r,
        tint.g * s * m.g,
        tint.b * s * (1 - warm * 2) * m.b,
      ];
    else
      out = [tint.r * s * (1 + warm), tint.g * s, tint.b * s * (1 - warm * 2)];
    if (this.ambient !== null && !this._unlit) {
      const l = this._lit(x, y, z, nx, ny, nz);
      out[0] *= l[0];
      out[1] *= l[1];
      out[2] *= l[2];
    }
    return out;
  };
  // Tints are authored as "look" values: a hex tint is used directly as a linear multiplier (no sRGB→linear
  // conversion), so 0x808080 halves the texture instead of cutting it to ~22 %.
  function setLin(c, t) {
    if (typeof t === "number") c.setHex(t, THREE.LinearSRGBColorSpace);
    else if (Array.isArray(t))
      c.setRGB(t[0], t[1], t[2], THREE.LinearSRGBColorSpace);
    else c.set(t);
    return c;
  }
  K.setLin = setLin;
  function tintOf(t) {
    if (t === undefined || t === null) return { r: 1, g: 1, b: 1 };
    setLin(_c, t);
    return { r: _c.r, g: _c.g, b: _c.b };
  }
  K.tintOf = tintOf;

  /**
   * Planar grid face. (ox,oy,oz) origin corner; U/V unit axes (U×V = normal); ul/vl lengths in metres.
   * o: {mat, su, sv, uv:'side'|'top'|'plane'|'rect', uo, vo, rect:[u0,v0,u1,v1], tint, grime, tile}
   */
