// play-inline-585 05 — key
// Lines 1046-1390 of readable/play-inline-585.pretty.js (statement-aligned).
  function buildSunCeiling() {
    const W = 2048,
      H = 2048,
      c = K.canvas(W, H),
      x = c.getContext("2d"),
      r = K.rng(1971);
    x.fillStyle = "#4a4238";
    x.fillRect(0, 0, W, H);
    K.stains(x, W, H, 50, 11, 0.5, "20,16,12");
    // plaster seams along the vault
    x.strokeStyle = "rgba(20,16,12,0.45)";
    x.lineWidth = 3;
    for (let yy = 0; yy < H; yy += 89) {
      x.beginPath();
      x.moveTo(0, yy);
      x.lineTo(W, yy);
      x.stroke();
    }
    // the sun: world-circular on the vault (arc length ~ width, length ~ height of the canvas)
    const cx = W / 2,
      cy = H / 2;
    const glow = x.createRadialGradient(cx, cy, 0, cx, cy, 700);
    glow.addColorStop(0, "rgba(255,200,110,0.25)");
    glow.addColorStop(1, "rgba(255,200,110,0)");
    x.fillStyle = glow;
    x.fillRect(0, 0, W, H);
    K.drawSun(x, cx, cy, 760, {
      color: "rgba(206,150,58,0.92)",
      disc: 0.36,
      width: 0.11,
    });
    K.drawSun(x, cx, cy, 712, {
      color: "rgba(232,186,92,0.6)",
      disc: 0.33,
      width: 0.07,
    });
    // flaking: knock holes through the gold
    for (let i = 0; i < 900; i++) {
      const px = cx + (r() - 0.5) * 1300,
        py = cy + (r() - 0.5) * 1300,
        rad = 2 + r() * 9;
      x.fillStyle =
        "rgba(" +
        (60 + r() * 20) +
        "," +
        (52 + r() * 16) +
        ",44," +
        (0.5 + r() * 0.5) +
        ")";
      x.beginPath();
      x.arc(px, py, rad, 0, Math.PI * 2);
      x.fill();
    }
    // inner disc: concentric brush rings
    x.strokeStyle = "rgba(120,70,20,0.5)";
    x.lineWidth = 6;
    for (let k = 1; k < 5; k++) {
      x.beginPath();
      x.arc(cx, cy, k * 48, 0, Math.PI * 2);
      x.stroke();
    }
    // soot plumes from twenty years of candles
    for (let i = 0; i < 40; i++) {
      const px = r() * W,
        py = r() < 0.5 ? r() * 200 : H - r() * 200,
        rad = 60 + r() * 220;
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, "rgba(12,10,8,0.55)");
      g.addColorStop(1, "rgba(12,10,8,0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    K.grain(x, W, H, 30, 7);
    const t = K.texFromCanvas(c, { clamp: true });
    return t;
  }
  /** Knitted baby blanket: rows of coloured stitches (faded rose, cream, sky). */
  function buildKnit() {
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const cols = ["#c98a8a", "#e8dcc0", "#8aa8c8", "#e8dcc0", "#d8b070"];
    for (let row = 0; row < 16; row++)
      for (let i = 0; i < 16; i++) {
        x.fillStyle = cols[Math.floor(row / 3) % cols.length];
        x.beginPath();
        x.ellipse(
          i * 8 + 4,
          row * 8 + 4,
          3.6,
          4.4,
          i % 2 ? 0.4 : -0.4,
          0,
          Math.PI * 2,
        );
        x.fill();
      }
    K.grain(x, S, S, 30, 5);
    return K.texFromCanvas(c);
  }
  /** Bomb casing: pale cream enamel, weld seams, lifting-lug bands, SIROCCO 2 stencil, faded European marks. */
  function buildCasing() {
    // CylinderGeometry UVs: u = around the casing, v = along it. Stencils run along v.
    const W = 1024,
      H = 1024,
      c = K.canvas(W, H),
      x = c.getContext("2d"),
      r = K.rng(2);
    x.fillStyle = "#d6cdb2";
    x.fillRect(0, 0, W, H);
    K.stains(x, W, H, 30, 5, 0.35, "90,80,60");
    for (let i = 0; i < 300; i++) {
      x.fillStyle = "rgba(120,96,64," + r() * 0.4 + ")";
      x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 6);
    }
    x.fillStyle = "rgba(60,54,44,0.5)";
    for (const v of [0.18, 0.5, 0.82]) x.fillRect(0, v * H, W, 6); // weld seams round the casing
    for (const u of [0.25, 0.75]) {
      x.save();
      x.translate(u * W, H * 0.5);
      x.rotate(-Math.PI / 2);
      K.stencilText(x, "SIROCCO 2", 0, 0, 110, "rgba(24,24,24,0.9)", {
        stencilBreaks: true,
        spacing: 10,
      });
      K.stencilText(
        x,
        "LOT 03/66   NE PAS MANIPULER",
        0,
        92,
        30,
        "rgba(24,24,24,0.7)",
        { spacing: 3 },
      );
      x.restore();
    }
    const g = x.createRadialGradient(
      W * 0.5,
      H * 0.92,
      0,
      W * 0.5,
      H * 0.92,
      260,
    );
    g.addColorStop(0, "rgba(120,70,30,0.45)");
    g.addColorStop(1, "rgba(120,70,30,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    K.grain(x, W, H, 20, 9);
    return K.texFromCanvas(c);
  }
  function customTex(name) {
    if (custom[name]) return custom[name];
    if (name === "decal") custom[name] = buildDecalAtlas();
    else if (name === "sun_ceiling") custom[name] = buildSunCeiling();
    else if (name === "knit") custom[name] = buildKnit();
    else if (name === "casing") custom[name] = buildCasing();
    return custom[name];
  }
  K.decal = function (name) {
    customTex("decal");
    return K.decalRects[name] || [0, 0, 0.01, 0.01];
  };

  const fbTex = {};
  function surfaceTex(d) {
    if (d.custom) return customTex(d.custom);
    if (!d.tex) return null;
    if (K.live("tex")) {
      try {
        const t = G.tex.get(d.tex);
        if (t && t.isTexture) return t;
      } catch (e) {
        /* fall back */
      }
    }
    const key = d.tex + ":" + (d.fb || "noise");
    if (!fbTex[key])
      fbTex[key] = K.texFromCanvas(
        fallbackCanvas(d.fb || "noise", U.hashStr(key) % 1000),
      );
    return fbTex[key];
  }
  function surfaceNormal(d) {
    if (!d.tex || !K.live("tex") || !G.tex.normal) return null;
    try {
      const t = G.tex.normal(d.tex);
      return t && t.isTexture ? t : null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Baked light as an emissive term: totalEmissiveRadiance += albedo (map × vertex colour) × bakeLight.
   * The interior's scene lights (atmosphere hemisphere + key) still add a little on top, but the bake
   * decides how a room reads — including ceilings and vaults, which the hemisphere barely lights.
   */
  function bakeHook(m, k) {
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bakeLight;\nvarying vec3 vBakeL;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvBakeL = bakeLight;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vBakeL;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vBakeL * " +
            k.toFixed(3) +
            ";",
        );
    };
    m.customProgramCacheKey = () => "lairbake" + k.toFixed(3);
  }
  const MATS = {};
  K.mat = function (key) {
    if (ALIASES[key]) key = ALIASES[key][0];
    if (MATS[key]) return MATS[key];
    const d = MATDEF[key] || MATDEF.concrete;
    let m;
    if (d.basic) {
      m = new THREE.MeshBasicMaterial({
        color: d.color,
        vertexColors: true,
        toneMapped: d.toneMapped !== undefined ? d.toneMapped : true,
      });
    } else {
      m = new THREE.MeshStandardMaterial({
        color: d.color !== undefined ? d.color : 0xffffff,
        map: d.flat ? null : surfaceTex(d),
        vertexColors: true,
        roughness: d.rough !== undefined ? d.rough : 0.85,
        metalness: d.metal || 0,
        side: d.side || THREE.FrontSide,
      });
      const nm = d.flat || d.custom ? null : surfaceNormal(d);
      if (nm) {
        m.normalMap = nm;
        m.normalScale = new THREE.Vector2(0.7, 0.7);
      }
      if (d.emissive) m.emissive = new THREE.Color(d.emissive);
      if (d.alphaTest) m.alphaTest = d.alphaTest;
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        m.opacity = d.opacity || 1;
      }
      if (d.polyOff) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -2;
      }
    }
    if (!d.basic) bakeHook(m, d.bakeK || 1);
    m.name = "lair_" + key;
    m.userData.shared = true;
    MATS[key] = m;
    return m;
  };

  // ------------------------------------------------------------------
  // BUILDER: geometry batched per material, baked light at finish()
  // ------------------------------------------------------------------
  const _c = new THREE.Color();
  function setLin(c, t) {
    if (typeof t === "number") c.setHex(t, THREE.LinearSRGBColorSpace);
    else if (Array.isArray(t))
      c.setRGB(t[0], t[1], t[2], THREE.LinearSRGBColorSpace);
    else if (t) c.set(t);
    else c.setRGB(1, 1, 1);
    return c;
  }
  function tintOf(t) {
    if (t === undefined || t === null) return { r: 1, g: 1, b: 1 };
    setLin(_c, t);
    return { r: _c.r, g: _c.g, b: _c.b };
  }
  K.tintOf = tintOf;

  function Builder(name, opts) {
    opts = opts || {};
    this.name = name;
    this.bk = new Map();
    this.grime = opts.grime !== undefined ? opts.grime : 0.5;
    this.groundY = opts.groundY || 0;
    this.ambient = opts.ambient !== undefined ? opts.ambient : 0.22;
    this.maxLight = opts.maxLight || 2.6;
    this.gain = opts.gain || 1;
    this.lights = [];
    this.zone = null; // [x0,y0,z0,x1,y1,z1]: lights added while set only light vertices inside (soft margin)
    this.burns = [];
    this.seg = opts.seg || 2.0; // face segmentation (m) so baked light pools read
  }
  K.Builder = Builder;
  K.builder = (name, opts) => new Builder(name, opts);
  const BP = Builder.prototype;
  BP._b = function (mat) {
    const al = resolveAlias(mat);
    this._mul = al;
    if (al) mat = al.base;
    const md = MATDEF[mat];
    let b = this.bk.get(mat);
    if (!b) {
      b = {
        p: [],
        n: [],
        uv: [],
        c: [],
        l: null,
        i: [],
        vc: 0,
        unlit: !!(md && md.basic),
      };
      this.bk.set(mat, b);
    }
    return b;
  };
  /** Baked point light (radius r m). o: {zone:[x0,y0,z0,x1,y1,z1], wrap} — order relative to geometry does not matter. */
  BP.light = function (x, y, z, r, color, i, o) {
    setLin(_c, color === undefined ? 0xffc890 : color);
    const k = (i === undefined ? 1 : i) * this.gain;
    const zone = (o && o.zone) || this.zone;
    this.lights.push({
      x,
      y,
      z,
      r,
      r2: r * r,
      cr: _c.r * k,
      cg: _c.g * k,
      cb: _c.b * k,
      zone,
      wrap: o && o.wrap !== undefined ? o.wrap : 0.3,
    });
    return this;
  };
  BP.burn = function (x, y, z, r, amt) {
    this.burns.push({ x, y, z, r, amt: amt === undefined ? 0.6 : amt });
    return this;
  };
