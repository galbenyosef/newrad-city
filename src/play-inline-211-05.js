// play-inline-211 05 — src
// Lines 965-1279 of readable/play-inline-211.pretty.js (statement-aligned).
  const MAT_DEFS = {
    brick: { src: "brick_red", uv: 3 },
    brick_dark: { src: "brick_brown", uv: 3 },
    brick_tan: { src: "brick_tan", uv: 3 },
    limestone: { src: "stone_limestone", uv: 4 },
    granite: { src: "granite", uv: 3 },
    concrete: { src: "concrete", uv: 4 },
    concrete_dark: { src: "concrete_dark", uv: 4 },
    plaster: { custom: "plaster", uv: 3.5, rough: 0.9 },
    wallpaper: { src: "wallpaper", uv: 2 },
    tile_floor: { src: "tile_floor", uv: 2 },
    tile_white: { src: "tile_subway", uv: 1.2 },
    terrazzo: { src: "terrazzo", uv: 2 },
    marble: { src: "marble", uv: 3 },
    wood: { src: "wood_planks", uv: 2 },
    wood_dark: { src: "wood_planks", uv: 2, tint: 0x8a6a50 },
    rotten: { src: "wood_rotten", uv: 2 },
    crate: { src: "crate_wood", uv: 1 },
    metal: { src: "metal_painted", uv: 2 },
    panel: { src: "metal_panel", uv: 2 },
    diamond: { src: "metal_diamond", uv: 1 },
    scratched: { src: "metal_scratched", uv: 1 },
    rust: { src: "rust", uv: 2 },
    corrugated: { src: "corrugated", uv: 2 },
    copper: { src: "copper_patina", uv: 3 },
    bronze: { src: "bronze", uv: 2 },
    carpet: { src: "carpet", uv: 2 },
    fabric: { src: "fabric", uv: 0.8 },
    burlap: { src: "burlap", uv: 0.8 },
    canvas: { src: "burlap", uv: 1.2, tint: 0xc8bca0 },
    leather: { src: "leather", uv: 0.6 },
    cardboard: { src: "cardboard", uv: 0.8 },
    paper: { src: "paper", uv: 0.5 },
    bone: { src: "bone", uv: 0.5 },
    dirt: { src: "dirt", uv: 4 },
    rubble: { src: "rubble", uv: 4 },
    gravel: { src: "gravel", uv: 2 },
    roof: { src: "roof_tar", uv: 4 },
    sidewalk: { src: "sidewalk", uv: 3 },
    asphalt: { src: "asphalt", uv: 8 },
    glass: { src: "glass_dirty", uv: 2, rough: 0.3 },
    rubber: { src: "rubber", uv: 0.5 },
    cryotile: { src: "tile_cryo", uv: 2 },
    // painted metals (chipped paint over rust, from the textures module's paint_* family)
    navy: { src: "paint_grey", uv: 2 },
    navy_dark: { src: "paint_grey", uv: 2, tint: 0x70767c },
    hull_red: { src: "paint_red", uv: 2, tint: 0x9a5a50 },
    paint_teal: { src: "paint_teal", uv: 2 },
    paint_cream: { src: "paint_cream", uv: 2 },
    paint_green: { src: "paint_green", uv: 2 },
    paint_yellow: { src: "paint_yellow", uv: 2 },
    paint_red: { src: "paint_red", uv: 2 },
    paint_blue: { src: "paint_blue", uv: 2 },
    paint_black: { src: "paint_black", uv: 2 },
    paint_white: { src: "paint_white", uv: 2 },
    paint_olive: { src: "paint_olive", uv: 2 },
    iron: { src: "iron", uv: 2 },
    steel: { src: "steel", uv: 2 },
    chrome: { src: "chrome_dirty", uv: 1 },
    // custom canvases
    guastavino: { custom: "guastavino", uv: 3, rough: 0.8 },
    sugar: { custom: "sugar", uv: 2, rough: 0.95 },
    rawsugar: { custom: "rawsugar", uv: 2, rough: 0.95 },
    molasses: {
      custom: "molasses",
      uv: 3,
      rough: 0.22,
      metal: 0.05,
      emissive: 0x5a2a06,
      emissiveIntensity: 0.55,
      emissiveMapSelf: true,
    },
    navyplate: { custom: "navyplate", uv: 4, rough: 0.75, metal: 0.25 },
    hullgrey: { custom: "hullgrey", uv: 10, rough: 0.72, metal: 0.15 },
    hullred: { custom: "hullred", uv: 5, rough: 0.9 },
    hextile: { custom: "hextile", uv: 1.2, rough: 0.5 },
    lino: { custom: "lino", uv: 2.3, rough: 0.6 },
    ember: {
      color: 0xff8a3a,
      emissive: 0xff5a10,
      emissiveIntensity: 1.1,
      plain: true,
      noShadow: true,
    },
    redtile: { custom: "redtile", uv: 2.4, rough: 0.7 },
    daylight: {
      color: 0xc4ccb4,
      emissive: 0x9aa88e,
      emissiveIntensity: 0.85,
      rough: 0.3,
      plain: true,
      noShadow: true,
    },
    // plain / emissive (lamps are detected by atmosphere's interior fixture scan by name)
    lamp: {
      color: 0xffe0a8,
      emissive: 0xffd08a,
      emissiveIntensity: 2.2,
      plain: true,
      name: "ph_lamp_warm",
      noShadow: true,
    },
    lamp_cold: {
      color: 0xe0f0ff,
      emissive: 0xd8ecff,
      emissiveIntensity: 1.8,
      plain: true,
      name: "ph_lamp_cold_tube",
      noShadow: true,
    },
    lamp_red: {
      color: 0xff5040,
      emissive: 0xff2a1a,
      emissiveIntensity: 2.0,
      plain: true,
      name: "ph_lamp_red",
      noShadow: true,
    },
    lamp_green: {
      color: 0x80ff90,
      emissive: 0x40ff60,
      emissiveIntensity: 1.6,
      plain: true,
      name: "ph_lamp_green",
      noShadow: true,
    },
    fire: {
      color: 0xffa040,
      emissive: 0xff7a20,
      emissiveIntensity: 3.0,
      plain: true,
      noShadow: true,
    },
    screen: {
      color: 0x183a20,
      emissive: 0x3aff70,
      emissiveIntensity: 0.9,
      plain: true,
      noShadow: true,
    },
    goo: {
      color: 0x3a6a20,
      emissive: 0x6aff30,
      emissiveIntensity: 0.6,
      rough: 0.2,
      plain: true,
      noShadow: true,
    },
    syrup_hot: {
      color: 0x7a3a10,
      emissive: 0xff6a10,
      emissiveIntensity: 0.55,
      rough: 0.1,
      plain: true,
      noShadow: true,
    },
    black: { color: 0x0c0c0c, rough: 1, plain: true },
    shadow: { color: 0x050505, rough: 1, plain: true, noShadow: true },
    water: {
      color: 0x243222,
      emissive: 0x0e2008,
      emissiveIntensity: 0.4,
      rough: 0.1,
      metal: 0.3,
      plain: true,
      noShadow: true,
    },
    rope: { src: "burlap", uv: 0.3, tint: 0xa89070 },
    winlit: {
      color: 0xffc478,
      emissive: 0xffa04a,
      emissiveIntensity: 1.1,
      rough: 0.4,
      plain: true,
      glow: [0.04, 1.3],
      noShadow: true,
    },
    neon_yellow: {
      color: 0xffd24a,
      emissive: 0xffc21a,
      emissiveIntensity: 2.2,
      plain: true,
      glow: [0.35, 2.6],
      noShadow: true,
    },
    neon_dead: { color: 0x6a5a30, rough: 0.6, plain: true },
  };
  PH.MAT_DEFS = MAT_DEFS;
  const matCache = {};
  const NO_SHADOW = new Set();
  const baseKey = (k) =>
    k.length > 4 && k.slice(-4) === "@lit" ? k.slice(0, -4) : k;
  PH.baseKey = baseKey;
  const haveMats = () => {
    try {
      return !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    } catch (e) {
      return false;
    }
  };
  const texMeters = {};
  function metersFor(key) {
    if (texMeters[key] !== undefined) return texMeters[key];
    const d = MAT_DEFS[key];
    let m = d && d.uv ? d.uv : 4;
    return (texMeters[key] = m);
  }
  PH.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = makeBaked(PH.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0) return PH.mat("concrete");
    const def = MAT_DEFS[key] || { src: "concrete" };
    let m = null;
    if (def.src && haveMats()) {
      try {
        const o = { vertexColors: true };
        if (def.tint !== undefined) o.color = def.tint;
        if (def.rough !== undefined) o.roughness = def.rough;
        if (def.metal !== undefined) o.metalness = def.metal;
        const base = G.mats.get(def.src, o);
        if (base && base.isMaterial) m = base;
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const opts = {
        color: def.color !== undefined ? def.color : def.tint || 0x9a968c,
        roughness: def.rough === undefined ? 0.9 : def.rough,
        metalness: def.metal || 0,
        vertexColors: true,
      };
      if (def.custom && PH.customTex[def.custom]) {
        opts.map = PH.customTex[def.custom]();
        opts.color = 0xffffff;
      }
      if (def.emissive !== undefined) {
        opts.emissive = def.emissive;
        opts.emissiveIntensity = def.emissiveIntensity || 1;
        if (def.emissiveMapSelf && opts.map) {
          opts.emissive = 0xffffff;
          opts.emissiveMap = opts.map;
        }
      }
      m = new THREE.MeshStandardMaterial(opts);
      if (def.name) m.name = def.name;
      m.userData.shared = true;
      if (def.emissive !== undefined && haveMats() && G.mats.track) {
        try {
          G.mats.track(m, {
            glow: def.glow || [
              def.emissiveIntensity * 0.8,
              def.emissiveIntensity,
            ],
          });
        } catch (e) {
          /* optional */
        }
      }
    }
    if (def.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add albedo × per-vertex `bake` (baked lamp light) to its emission. Chains existing hooks. */
  function makeBaked(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      phBaked: true,
    });
    const prev = base.onBeforeCompile;
    const prevKey = base.customProgramCacheKey
      ? base.customProgramCacheKey.bind(base)
      : null;
    m.onBeforeCompile = function (sh, r) {
      if (
        typeof prev === "function" &&
        prev !== THREE.Material.prototype.onBeforeCompile
      ) {
        try {
          prev.call(this, sh, r);
        } catch (e) {
          /* keep ours */
        }
      }
      if (sh.vertexShader.indexOf("attribute vec3 bake;") < 0) {
        sh.vertexShader = sh.vertexShader
          .replace(
            "#include <common>",
            "#include <common>\nattribute vec3 bake;\nvarying vec3 vPhBake;",
          )
          .replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\nvPhBake = bake;",
          );
        sh.fragmentShader = sh.fragmentShader
          .replace(
            "#include <common>",
            "#include <common>\nvarying vec3 vPhBake;",
          )
          .replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vPhBake * 1.5;",
          );
      }
    };
    m.customProgramCacheKey = function () {
      return (prevKey ? prevKey() : "") + "|ph_baked1";
    };
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured quad material (signs, banners). Returns the key. */
