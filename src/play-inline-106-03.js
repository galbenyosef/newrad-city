// play-inline-106 03 — color
// Lines 320-667 of readable/play-inline-106.pretty.js (statement-aligned).
  const MATDEF = {
    limestone: {
      tex: "stone_limestone",
      fb: "blocks",
      color: 0xe4dccb,
      tile: [4, 4],
      rough: 0.92,
    },
    granite: {
      tex: "granite",
      fb: "blocks",
      color: 0x9a948c,
      tile: [3, 3],
      rough: 0.8,
    },
    concrete: {
      tex: "concrete",
      fb: "noise",
      color: 0xb0aca2,
      tile: [4, 4],
      rough: 0.95,
    },
    brick_red: {
      tex: "brick_red",
      fb: "brick",
      color: 0xc07a60,
      tile: [3, 3],
      rough: 0.95,
    },
    brick_brown: {
      tex: "brick_brown",
      fb: "brick",
      color: 0x8e6a52,
      tile: [3, 3],
      rough: 0.95,
    },
    brick_tan: {
      tex: "brick_tan",
      fb: "brick",
      color: 0xc9b08a,
      tile: [3, 3],
      rough: 0.95,
    },
    metal: {
      tex: "metal_painted",
      fb: "metal",
      color: 0x8a8d86,
      tile: [2, 2],
      rough: 0.7,
      metal: 0.3,
    },
    metal_dark: {
      tex: "metal_panel",
      fb: "metal",
      color: 0x4a4d4c,
      tile: [2, 2],
      rough: 0.6,
      metal: 0.4,
    },
    rust: {
      tex: "rust",
      fb: "metal",
      color: 0x8a5a3a,
      tile: [2.5, 2.5],
      rough: 0.9,
      metal: 0.2,
    },
    corrugated: {
      tex: "corrugated",
      fb: "corrugated",
      color: 0x9a8a72,
      tile: [2, 2],
      rough: 0.85,
      metal: 0.25,
      side: THREE.DoubleSide,
    },
    wood: {
      tex: "wood_planks",
      fb: "planks",
      color: 0x8a6a4a,
      tile: [2, 2],
      rough: 0.9,
    },
    wood_rotten: {
      tex: "wood_rotten",
      fb: "planks",
      color: 0x6a5642,
      tile: [2, 2],
      rough: 0.95,
    },
    fabric: {
      tex: "fabric",
      fb: "fabric",
      color: 0xb8ab8a,
      tile: [1.5, 1.5],
      rough: 1,
      side: THREE.DoubleSide,
    },
    dirt: { tex: "dirt", fb: "noise", color: 0x7a6a52, tile: [4, 4], rough: 1 },
    rubble: {
      tex: "rubble",
      fb: "noise",
      color: 0x8a8378,
      tile: [3, 3],
      rough: 1,
    },
    grass: {
      tex: "grass_dead",
      fb: "noise",
      color: 0x7c7a4e,
      tile: [4, 4],
      rough: 1,
    },
    plaster_base: {
      tex: "plaster_stained",
      fb: "noise",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.9,
    },
    paving: {
      tex: "sidewalk",
      fb: "blocks",
      color: 0xa8a399,
      tile: [3, 3],
      rough: 0.95,
    },
    marble: { custom: "marble", color: 0xe8e2d4, tile: [3, 3], rough: 0.35 },
    marble_warm: {
      custom: "marble_warm",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.3,
    },
    verdigris: {
      custom: "verdigris",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.75,
      metal: 0.25,
    },
    brass_base: {
      color: 0xffffff,
      rough: 0.38,
      metal: 0.7,
      emissive: 0x181006,
      flat: true,
    },
    neon_tube: {
      basic: true,
      color: 0xffffff,
      toneMapped: false,
      noShadow: true,
    },
    steel: {
      tex: "metal_panel",
      fb: "metal",
      color: 0xd8dde0,
      tile: [2, 2],
      rough: 0.32,
      metal: 0.55,
      emissive: 0x101214,
    },
    glass_base: { color: 0xffffff, rough: 0.12, metal: 0.7, flat: true },
  };
  K.MATDEF = MATDEF;
  // Colour-only variants are ALIASES of a base material: the colour is baked into vertex colours,
  // so e.g. paint_red / paint_green / metal share one draw call per builder.
  const ALIASES = {
    limestone_dark: ["limestone", 0xa9a291],
    marble_dark: ["marble", 0x5a524a],
    wood_dark: ["wood", 0x4a3322],
    concrete_dark: ["concrete", 0x77736b],
    sandbag: ["fabric", 0xffffff],
    carpet: ["fabric", 0x6a1e1e],
    paint_red: ["metal", 0xb02a22],
    paint_green: ["metal", 0x3f5a3c],
    paint_blue: ["metal", 0x2c4a7a],
    paint_yellow: ["metal", 0xd0a830],
    paint_white: ["metal", 0xd8d4c8],
    brass: ["brass_base", 0xa88a4a],
    gold: ["brass_base", 0xc8a048],
    gold_bright: ["brass_base", 0xe6b84e],
    bronze: ["brass_base", 0x6e5236],
    black_metal: ["metal_dark", 0x26282a],
    rubber: ["metal_dark", 0x1d1d1d],
    slate: ["metal_dark", 0x4f5557],
    chrome: ["steel", 0xc8ccd0],
    glass: ["glass_base", 0x2c3b3c],
    glass_broken: ["glass_base", 0x1a2020],
    plaster: ["plaster_base", 0xc8bea8],
    bone: ["plaster_base", 0xd6cbb0],
    flesh: ["plaster_base", 0x6a2a22],
    lit_warm: ["neon_tube", 0xffd9a0],
    lit_red: ["neon_tube", 0xff3a2a],
    lit_green: ["neon_tube", 0x6aff7a],
    lit_white: ["neon_tube", 0xf4f0e0],
  };
  K.ALIASES = ALIASES;
  const aliasMul = {};
  function resolveMat(key) {
    const al = ALIASES[key];
    if (!al) return null;
    if (!aliasMul[key]) {
      const base = MATDEF[al[0]] || {};
      const bc = new THREE.Color(
          base.color !== undefined ? base.color : 0xffffff,
        ),
        ac = new THREE.Color(al[1]);
      aliasMul[key] = {
        base: al[0],
        r: ac.r / Math.max(0.02, bc.r),
        g: ac.g / Math.max(0.02, bc.g),
        b: ac.b / Math.max(0.02, bc.b),
      };
    }
    return aliasMul[key];
  }
  K.resolveMat = resolveMat;
  const MATS = {};
  const customTex = {};

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
          rds = 30 + r() * 120;
        const g = x.createRadialGradient(px, py, 0, px, py, rds);
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
        x.fillRect(px - rds, py - rds, rds * 2, rds * 2);
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
          rds = 8 + r() * 50,
          g = x.createRadialGradient(px, py, 0, px, py, rds);
        const t =
          r() < 0.4 ? "60,50,40" : r() < 0.5 ? "120,180,160" : "80,120,100";
        g.addColorStop(0, "rgba(" + t + ",0.45)");
        g.addColorStop(1, "rgba(" + t + ",0)");
        x.fillStyle = g;
        x.fillRect(px - rds, py - rds, rds * 2, rds * 2);
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
  /** Interior "lamp-lit" twin of a base material: same colour/texture (so alias tints stay right) plus an emissive lift
   *  of albedo × vertex colour. Returns the new key. Use with K.builder(name, {remap: {base: twinKey}}). */
