// play-inline-170 03 — color
// Lines 288-598 of readable/play-inline-170.pretty.js (statement-aligned).
  function fallbackCanvas(kind, base, seed) {
    const S = 256,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(seed);
    x.fillStyle = hex(base);
    x.fillRect(0, 0, S, S);
    if (kind === "brick") {
      const bh = 16,
        bw = 48;
      x.fillStyle = shadeHex(base, 0.55);
      x.fillRect(0, 0, S, S);
      for (let row = 0; row < S / bh; row++)
        for (let col = -1; col < S / bw + 1; col++) {
          const ox = ((row % 2) * bw) / 2;
          x.fillStyle = shadeHex(base, 0.8 + r() * 0.35);
          x.fillRect(col * bw + ox + 2, row * bh + 2, bw - 4, bh - 3);
        }
    } else if (kind === "blocks" || kind === "marble") {
      const bh = 64,
        bw = 128;
      for (let row = 0; row < S / bh; row++)
        for (let col = -1; col < S / bw + 1; col++) {
          const ox = ((row % 2) * bw) / 2;
          x.fillStyle = shadeHex(base, 0.9 + r() * 0.16);
          x.fillRect(col * bw + ox, row * bh, bw, bh);
          x.strokeStyle = shadeHex(base, 0.62);
          x.lineWidth = 2;
          x.strokeRect(col * bw + ox, row * bh, bw, bh);
        }
      if (kind === "marble") {
        x.globalAlpha = 0.35;
        for (let i = 0; i < 14; i++) {
          x.strokeStyle = shadeHex(base, 0.55 + r() * 0.3);
          x.lineWidth = 0.5 + r() * 2;
          x.beginPath();
          let px = r() * S,
            py = r() * S;
          x.moveTo(px, py);
          for (let k = 0; k < 6; k++) {
            px += (r() - 0.3) * 60;
            py += (r() - 0.5) * 60;
            x.lineTo(px, py);
          }
          x.stroke();
        }
        x.globalAlpha = 1;
      }
    } else if (kind === "planks") {
      for (let i = 0; i < 8; i++) {
        x.fillStyle = shadeHex(base, 0.75 + r() * 0.4);
        x.fillRect(0, i * 32, S, 30);
      }
      x.globalAlpha = 0.25;
      x.strokeStyle = shadeHex(base, 0.5);
      for (let i = 0; i < 40; i++) {
        const y = r() * S;
        x.beginPath();
        x.moveTo(0, y);
        x.bezierCurveTo(80, y + r() * 6, 160, y - r() * 6, S, y);
        x.stroke();
      }
      x.globalAlpha = 1;
    } else if (kind === "corrugated") {
      for (let i = 0; i < S; i += 4) {
        const t = 0.75 + 0.3 * Math.sin((i / 16) * Math.PI * 2);
        x.fillStyle = shadeHex(base, t);
        x.fillRect(i, 0, 4, S);
      }
      K.stains(x, S, S, 10, seed + 1, 0.5, "90,50,20");
    } else if (kind === "fabric") {
      x.globalAlpha = 0.15;
      x.fillStyle = "#000";
      for (let i = 0; i < S; i += 3) {
        x.fillRect(i, 0, 1, S);
        x.fillRect(0, i, S, 1);
      }
      x.globalAlpha = 1;
    }
    K.stains(x, S, S, 8, seed + 2, 0.22);
    K.grain(x, S, S, kind === "metal" ? 14 : 26, seed + 3);
    return c;
  }

  // ------------------------------------------------------------------
  // Materials
  // ------------------------------------------------------------------
  // key -> def. tex = G.tex name, fb = fallback kind, tile = [metres per texture repeat u, v]
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
    sandbag: ["burlap", 0xffffff],
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
      const bc = new THREE.Color().setHex(
          base.color !== undefined ? base.color : 0xffffff,
          THREE.LinearSRGBColorSpace,
        ),
        ac = new THREE.Color().setHex(al[1], THREE.LinearSRGBColorSpace);
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

