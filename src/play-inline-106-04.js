// play-inline-106 04 — grime
// Lines 668-991 of readable/play-inline-106.pretty.js (statement-aligned).
  K.litTwin = function (base, key, emissiveColor, intensity) {
    if (!MATDEF[key])
      MATDEF[key] = Object.assign({}, MATDEF[base] || MATDEF.concrete, {
        emissiveFromMap: true,
        emissiveVC: true,
        emissiveColor,
        emissiveIntensity: intensity,
        emissive: undefined,
      });
    return key;
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
      // "baked lamp-light" lift: emission = emissiveColor × albedo map × vertex colour (so dark aliases stay dark)
      if (d.emissiveFromMap) {
        m.emissiveMap = map;
        m.emissive = new THREE.Color(d.emissiveColor || 0xffffff);
        m.emissiveIntensity = d.emissiveIntensity || 0.3;
      }
      if (d.emissiveVC) {
        m.onBeforeCompile = (sh) => {
          sh.fragmentShader = sh.fragmentShader.replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance *= vColor.rgb;\n#endif",
          );
        };
        m.customProgramCacheKey = () => "lma_evc";
      }
      if (d.alphaTest) {
        m.alphaTest = d.alphaTest;
      }
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        m.opacity = d.opacity || 1;
      }
    }
    m.name = "lma_" + key;
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
    this.remap = opts.remap || null; // {baseMat: otherMat} applied after alias resolution (e.g. lit interior variants)
  }
  K.builder = (name, opts) => new Builder(name, opts);
  const BP = Builder.prototype;

  BP._b = function (mat) {
    const al = resolveMat(mat);
    this._mul = al;
    if (al) mat = al.base;
    if (this.remap && this.remap[mat]) mat = this.remap[mat];
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

  /** Vertex colour: tint × grime (ground AO, streaks, blotches, scorch). */
  BP._color = function (x, y, z, ny, tint, grime) {
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
    if (m)
      return [
        tint.r * s * (1 + warm) * m.r,
        tint.g * s * m.g,
        tint.b * s * (1 - warm * 2) * m.b,
      ];
    return [tint.r * s * (1 + warm), tint.g * s, tint.b * s * (1 - warm * 2)];
  };
  function tintOf(t) {
    if (t === undefined || t === null) return { r: 1, g: 1, b: 1 };
    _c.set(t);
    return { r: _c.r, g: _c.g, b: _c.b };
  }
  K.tintOf = tintOf;

  /**
   * Planar grid face. (ox,oy,oz) origin corner; U/V unit axes (U×V = normal); ul/vl lengths in metres.
   * o: {mat, su, sv, uv:'side'|'top'|'plane'|'rect', uo, vo, rect:[u0,v0,u1,v1], tint, grime, tile}
   */
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    const b = this._b(mat);
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || (grime > 0 ? 9 : 1e9);
    const su = o.su || Math.max(1, Math.min(24, Math.ceil(ul / seg))),
      sv = o.sv || Math.max(1, Math.min(40, Math.ceil(vl / seg)));
    const tile = o.tile || K.tile(mat);
    const mode = o.uv || "side";
    const tint = o.tintObj || tintOf(o.tint);
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const bb = (vl * j) / sv;
      for (let i = 0; i <= su; i++) {
        const a = (ul * i) / su;
        const x = ox + ux * a + vx * bb,
          y = oy + uy * a + vy * bb,
          z = oz + uz * a + vz * bb;
        b.p.push(x, y, z);
        b.n.push(nx, ny, nz);
        let u, v;
        if (mode === "side") {
          u = ((o.uo || 0) + a) / tile[0];
          v = y / tile[1];
        } else if (mode === "top") {
          u = x / tile[0];
          v = -z / tile[1];
        } else if (mode === "rect") {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (a / ul);
          v = r[1] + (r[3] - r[1]) * (bb / vl);
        } else {
          u = ((o.uo || 0) + a) / tile[0];
          v = ((o.vo || 0) + bb) / tile[1];
        }
        b.uv.push(u, v);
        const col = this._color(x, y, z, ny, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i,
          bI = a + 1,
          c = a + row + 1,
          d = a + row;
        b.i.push(a, bI, c, a, c, d);
      }
    b.vc += (su + 1) * (sv + 1);
    return this;
  };

  /**
   * Box. (cx, y0, cz) = bottom centre, w along local x, h up, d along local z.
   * o: {yaw (three.js convention), faces:'nsewtb' subset (default 'nsewt'), tint, grime, uvTop:'top'|'side', tile, seg}
   */
  BP.box = function (mat, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const yaw = o.yaw || 0,
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const faces = o.faces || "nsewt";
    const tint = tintOf(o.tint);
    const fo = {
      tintObj: tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uv,
      rect: o.rect,
    };
    const hw = w / 2,
      hd = d / 2;
    const R = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
    const D = (lx, lz) => [lx * c + lz * s, -lx * s + lz * c];
    let p, u;
    if (faces.indexOf("s") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("n") >= 0) {
      p = R(hw, -hd);
      u = D(-1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("e") >= 0) {
      p = R(hw, hd);
      u = D(0, -1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    if (faces.indexOf("w") >= 0) {
      p = R(-hw, -hd);
      u = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    const to = {
      tintObj: tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uvTop || (o.uv === "rect" ? "rect" : "top"),
      rect: o.rect,
    };
    if (faces.indexOf("t") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      const v = D(0, -1);
      this.face(
        mat,
        p[0],
        y0 + h,
        p[1],
        u[0],
        0,
        u[1],
        v[0],
        0,
        v[1],
        w,
        d,
        to,
      );
    }
    if (faces.indexOf("b") >= 0) {
      p = R(-hw, -hd);
      u = D(1, 0);
      const v = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], v[0], 0, v[1], w, d, to);
    }
    return this;
  };
  /** Axis-aligned box by min/max corners. */
  BP.boxMM = function (mat, x0, y0, z0, x1, y1, z1, o) {
    return this.box(
      mat,
      (x0 + x1) / 2,
      y0,
      (z0 + z1) / 2,
      x1 - x0,
      y1 - y0,
      z1 - z0,
      o,
    );
  };

  /** Vertical cylinder / cone frustum. o: {top, bottom, flat, arc0, arc, tint, grime, uvScale, yaw} */
