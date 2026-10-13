// play-inline-339 04 — rough
// Lines 915-1241 of readable/play-inline-339.pretty.js (statement-aligned).
  function customTex(name) {
    if (CUSTOM[name]) return CUSTOM[name];
    const S =
      name === "lace" ? 256 : (MATDEF[name] && MATDEF[name].size) || 512;
    const c = K.canvas(S, S),
      x = c.getContext("2d");
    try {
      customPaint[name](x, S, K.rng(name));
    } catch (e) {
      G.reportError("poi_civic:tex " + name, e);
    }
    return (CUSTOM[name] = K.texFromCanvas(c));
  }
  // Fallback for G.tex surfaces when textures module is absent
  const FB = {};
  function fallbackTex(key, base) {
    if (FB[key]) return FB[key];
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    x.fillStyle = "#" + new THREE.Color(base).getHexString();
    x.fillRect(0, 0, S, S);
    K.grain(x, 0, 0, S, S, 50, U.hashStr(key) % 1000);
    K.stains(x, 0, 0, S, S, 6, 3, 0.3);
    return (FB[key] = K.texFromCanvas(c));
  }

  // ------------------------------------------------------------------
  // Materials. key → {tex (G.tex name) | custom, fb colour, tile [m per repeat u,v], rough, metal, ...}
  // ------------------------------------------------------------------
  const MATDEF = {
    brick_red: {
      tex: "brick_red",
      fb: 0xa0604a,
      tile: [2.5, 2.5],
      rough: 0.95,
    },
    brick_brown: {
      tex: "brick_brown",
      fb: 0x7a5a48,
      tile: [2.5, 2.5],
      rough: 0.95,
    },
    brick_tan: {
      tex: "brick_tan",
      fb: 0xb09a7a,
      tile: [2.5, 2.5],
      rough: 0.95,
    },
    limestone: {
      tex: "stone_limestone",
      fb: 0xd8d0bc,
      tile: [3, 3],
      rough: 0.9,
    },
    granite: { tex: "granite", fb: 0x8a8680, tile: [3, 3], rough: 0.8 },
    concrete: { tex: "concrete", fb: 0xa8a49a, tile: [3.5, 3.5], rough: 0.95 },
    concrete_dark: {
      tex: "concrete_dark",
      fb: 0x6a6660,
      tile: [3.5, 3.5],
      rough: 0.95,
    },
    sidewalk: { tex: "sidewalk", fb: 0x9a968c, tile: [3, 3], rough: 0.95 },
    metal: {
      tex: "metal_painted",
      fb: 0x8a8d86,
      tile: [2, 2],
      rough: 0.65,
      metal: 0.3,
    },
    metal_dark: {
      tex: "metal_panel",
      fb: 0x4a4d4c,
      tile: [2, 2],
      rough: 0.6,
      metal: 0.4,
    },
    rust: { tex: "rust", fb: 0x7a4a2a, tile: [2, 2], rough: 0.9, metal: 0.2 },
    corrugated: {
      tex: "corrugated",
      fb: 0x8a7a62,
      tile: [2, 2],
      rough: 0.85,
      metal: 0.25,
      side: THREE.DoubleSide,
    },
    wood: { tex: "wood_planks", fb: 0x7a5a3a, tile: [2, 2], rough: 0.85 },
    wood_rotten: {
      tex: "wood_rotten",
      fb: 0x5a4a38,
      tile: [2, 2],
      rough: 0.95,
    },
    plaster: { custom: "plaster", tile: [3.2, 3.2], rough: 0.92 },
    plaster_stained: {
      tex: "plaster_stained",
      fb: 0xc0b8a4,
      tile: [3, 3],
      rough: 0.92,
    },
    tile: { tex: "tile_cryo", fb: 0xc8c8c0, tile: [2, 2], rough: 0.5 },
    fabric: {
      tex: "fabric",
      fb: 0xb0a488,
      tile: [1.2, 1.2],
      rough: 1,
      side: THREE.DoubleSide,
    },
    dirt: { tex: "dirt", fb: 0x6a5a44, tile: [3, 3], rough: 1 },
    rubble: { tex: "rubble", fb: 0x847e72, tile: [3, 3], rough: 1 },
    asphalt: { tex: "asphalt", fb: 0x3a3a38, tile: [4, 4], rough: 0.95 },
    glass: {
      tex: "glass_dirty",
      fb: 0x2a3434,
      tile: [2, 2],
      rough: 0.15,
      metal: 0.6,
    },
    // own canvases
    wallpaper: { custom: "wallpaper", tile: [1.6, 1.6], rough: 0.9 },
    wallpaper_green: {
      custom: "wallpaper_green",
      tile: [1.6, 1.6],
      rough: 0.9,
    },
    hextile: { custom: "hextile", tile: [1.4, 1.4], rough: 0.5 },
    checker: { custom: "checker", tile: [2.4, 2.4], rough: 0.45 },
    mosaic: { custom: "mosaic", tile: [6, 6], rough: 0.5 },
    tin: { custom: "tin", tile: [2.4, 2.4], rough: 0.5, metal: 0.4 },
    lace: {
      custom: "lace",
      tile: [1.8, 1.0],
      rough: 0.6,
      metal: 0.4,
      alphaTest: 0.5,
      side: THREE.DoubleSide,
      noGrimeUV: true,
    },
    rooftile: { custom: "rooftile", tile: [1.6, 1.6], rough: 0.35, metal: 0.1 },
    lacquer: { custom: "lacquer", tile: [2, 2], rough: 0.4 },
    marble: { custom: "marble", tile: [2.5, 2.5], rough: 0.3 },
    terrazzo: { custom: "terrazzo", tile: [3, 3], rough: 0.45 },
    padded: { custom: "padded", tile: [2, 2], rough: 0.9 },
    celltile: { custom: "celltile", tile: [1.6, 1.6], rough: 0.45 },
    carpet: { custom: "carpet", tile: [3, 3], rough: 1 },
    velvet: {
      custom: "velvet",
      tile: [1.5, 1.5],
      rough: 0.9,
      side: THREE.DoubleSide,
    },
    // poi_civic additions
    rustic: { custom: "rustic", tile: [2.4, 2.4], rough: 0.88 },
    ashlar: { custom: "ashlar", tile: [3.6, 3.6], rough: 0.85 },
    fieldstone: { custom: "fieldstone", tile: [3.2, 3.2], rough: 0.95 },
    patina: { custom: "patina", tile: [3, 3], rough: 0.55, metal: 0.35 },
    coffer: { custom: "coffer", tile: [2.4, 2.4], rough: 0.8 },
    crypt_brick: { custom: "crypt_brick", tile: [1.8, 1.8], rough: 0.95 },
    slate: { custom: "slate", tile: [2.2, 2.2], rough: 0.7 },
    lino: { custom: "lino", tile: [2.4, 2.4], rough: 0.55 },
    oak_panel: { custom: "oak_panel", tile: [1.6, 1.6], rough: 0.6 },
    flat: { flat: true, rough: 0.7 }, // untextured painted surfaces (colour from tint)
    shiny: { flat: true, rough: 0.28, metal: 0.75 }, // brass, chrome, gold
    // atlases (filled at init)
    art: { atlas: "art", rough: 0.75, alphaTest: 0.4 },
    decal: { atlas: "art", rough: 0.9, transparent: true },
    pics: { atlas: "pics", rough: 0.75 },
    glass_clear: {
      tex: "glass_dirty",
      fb: 0x8a9a9a,
      tile: [2, 2],
      rough: 0.1,
      metal: 0.3,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    },
    neon: { atlas: "neon", neon: true },
    lamp: { lamp: true }, // emissive bulbs / tubes (colour from tint)
  };
  K.MATDEF = MATDEF;
  /** Register an extra custom canvas material from another file (painted lazily on first use). */
  K.addCustom = function (name, paint, def) {
    customPaint[name] = paint;
    MATDEF[name] = Object.assign(
      { custom: name, tile: [3, 3], rough: 0.85 },
      def || {},
    );
  };
  // Colour aliases share a base material (tint baked into vertex colours → one draw call)
  const ALIAS = {
    black_iron: ["metal_dark", 0x2a2826],
    paint_red: ["flat", 0x9a2a22],
    paint_green: ["flat", 0x3e5a3e],
    paint_cream: ["flat", 0xd8ceb4],
    paint_black: ["flat", 0x1e1c1a],
    paint_white: ["flat", 0xe0dccc],
    paint_blue: ["flat", 0x2c4a6a],
    paint_yellow: ["flat", 0xd0a030],
    brass: ["shiny", 0xb08a42],
    chrome: ["shiny", 0xc8ccd0],
    gold: ["shiny", 0xd8a840],
    steel: ["shiny", 0x8a9096],
    wood_dark: ["wood", 0x5a3c26],
    mahogany: ["wood", 0x6a2c1c],
    leather: ["flat", 0x4a2a1a],
    leather_red: ["flat", 0x7a1e18],
    bone: ["plaster", 0xd8ccb0],
    meat: ["flat", 0x8a3a2a],
    salami: ["flat", 0x6a2a1e],
    glass_dark: ["glass", 0x1a2222],
    cloth_red: ["fabric", 0xa02a20],
    cloth_white: ["fabric", 0xe0dcd0],
    cloth_green: ["fabric", 0x4a6a44],
    rubber: ["metal_dark", 0x1a1a1a],
    jade: ["shiny", 0x3a8a6a],
    ceramic: ["flat", 0xe8e4da],
    copper: ["shiny", 0xb8683a],
    bronze: ["shiny", 0x8a6232],
    enamel_red: ["flat", 0xb02a22],
    enamel_blue: ["flat", 0x1e4a8a],
    enamel_cream: ["flat", 0xe8dcb8],
    vinyl_red: ["flat", 0xa01e1e],
    vinyl_teal: ["flat", 0x2e8a86],
    bakelite: ["flat", 0x3a2418],
    stainless: ["shiny", 0xb8bec2],
    formica_red: ["flat", 0xc06050],
    // civic
    police_blue: ["flat", 0x22324a],
    lead: ["metal_dark", 0x55585a],
    verdigris: ["patina", 0xffffff],
    candle: ["flat", 0xe8e0c8],
    wax: ["flat", 0xd8ccb0],
  };
  K.ALIAS = ALIAS;
  const aliasMul = {};
  function resolve(key) {
    const al = ALIAS[key];
    if (!al) return { base: key, mul: null };
    if (!aliasMul[key]) {
      const bd = MATDEF[al[0]] || {};
      const bc = new THREE.Color(bd.flat || bd.lamp ? 0xffffff : 0xffffff),
        ac = new THREE.Color(al[1]);
      aliasMul[key] = {
        base: al[0],
        mul: [ac.r / bc.r, ac.g / bc.g, ac.b / bc.b],
      };
    }
    return aliasMul[key];
  }
  K.resolve = resolve;
  K.tileOf = (key) => {
    const d = MATDEF[resolve(key).base];
    return (d && d.tile) || [3, 3];
  };

  // Atlases (painted during init)
  const ATLAS = {};
  function atlasInit(name, size) {
    if (ATLAS[name]) return ATLAS[name];
    const c = K.canvas(size, size),
      x = c.getContext("2d");
    if (name === "neon") {
      x.fillStyle = "#000";
      x.fillRect(0, 0, size, size);
    }
    const A = {
      name,
      c,
      x,
      size,
      shelfY: 0,
      shelfH: 0,
      curX: 0,
      cells: {},
      tex: null,
    };
    ATLAS[name] = A;
    return A;
  }
  /**
   * Paint a cell into an atlas; returns uv rect [u0,v0,u1,v1] (v up).
   * draw(ctx, x, y, w, h) — cache by key.
   */
  const CELLKEY = {};
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
