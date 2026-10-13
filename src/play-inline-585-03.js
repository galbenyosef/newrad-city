// play-inline-585 03 — color
// Lines 322-648 of readable/play-inline-585.pretty.js (statement-aligned).
  const MATDEF = {
    brick: {
      tex: "brick_red",
      fb: "brick",
      color: 0xffffff,
      tile: [2.6, 2.6],
      rough: 0.95,
    },
    brick_brown: {
      tex: "brick_brown",
      fb: "brick",
      color: 0xffffff,
      tile: [2.6, 2.6],
      rough: 0.95,
    },
    concrete: {
      tex: "concrete",
      fb: "noise",
      color: 0xffffff,
      tile: [4, 4],
      rough: 0.95,
    },
    concrete_dark: {
      tex: "concrete_dark",
      fb: "noise",
      color: 0xffffff,
      tile: [4, 4],
      rough: 0.95,
    },
    concrete_panel: {
      tex: "concrete_panel",
      fb: "noise",
      color: 0xffffff,
      tile: [6, 6],
      rough: 0.92,
    },
    limestone: {
      tex: "stone_limestone",
      fb: "noise",
      color: 0xffffff,
      tile: [4, 4],
      rough: 0.9,
    },
    granite: {
      tex: "granite",
      fb: "noise",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.85,
    },
    tile: {
      tex: "tile_subway",
      fb: "tile",
      color: 0xffffff,
      tile: [2.4, 2.4],
      rough: 0.35,
    },
    terrazzo: {
      tex: "terrazzo",
      fb: "noise",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.5,
    },
    rust: {
      tex: "rust",
      fb: "noise",
      color: 0xffffff,
      tile: [2.5, 2.5],
      rough: 0.9,
      metal: 0.2,
    },
    metal: {
      tex: "metal_painted",
      fb: "noise",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.7,
      metal: 0.3,
    },
    metal_panel: {
      tex: "metal_panel",
      fb: "noise",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.6,
      metal: 0.4,
    },
    metal_scratched: {
      tex: "metal_scratched",
      fb: "noise",
      color: 0xffffff,
      tile: [1.5, 1.5],
      rough: 0.45,
      metal: 0.6,
    },
    plate: {
      tex: "metal_diamond",
      fb: "noise",
      color: 0xffffff,
      tile: [1.5, 1.5],
      rough: 0.55,
      metal: 0.5,
    },
    army: {
      tex: "military",
      fb: "noise",
      color: 0xffffff,
      tile: [2.5, 2.5],
      rough: 0.75,
      metal: 0.25,
    },
    gravel: {
      tex: "gravel",
      fb: "noise",
      color: 0xffffff,
      tile: [2, 2],
      rough: 1,
    },
    wood: {
      tex: "wood_planks",
      fb: "planks",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.9,
    },
    wood_old: {
      tex: "wood_rotten",
      fb: "planks",
      color: 0xffffff,
      tile: [2, 2],
      rough: 0.95,
    },
    crate: {
      tex: "crate_wood",
      fb: "planks",
      color: 0xffffff,
      tile: [1.2, 1.2],
      rough: 0.9,
    },
    fabric: {
      tex: "fabric",
      fb: "noise",
      color: 0xffffff,
      tile: [1.5, 1.5],
      rough: 1,
      side: THREE.DoubleSide,
    },
    burlap: {
      tex: "burlap",
      fb: "noise",
      color: 0xffffff,
      tile: [1.2, 1.2],
      rough: 1,
      side: THREE.DoubleSide,
    },
    leather: {
      tex: "leather",
      fb: "noise",
      color: 0xffffff,
      tile: [1, 1],
      rough: 0.7,
    },
    rubber: {
      tex: "rubber",
      fb: "noise",
      color: 0xffffff,
      tile: [1, 1],
      rough: 0.8,
    },
    paper: {
      tex: "paper",
      fb: "noise",
      color: 0xffffff,
      tile: [0.6, 0.6],
      rough: 0.95,
      side: THREE.DoubleSide,
    },
    rubble: {
      tex: "rubble",
      fb: "noise",
      color: 0xffffff,
      tile: [3, 3],
      rough: 1,
    },
    dirt: { tex: "dirt", fb: "noise", color: 0xffffff, tile: [4, 4], rough: 1 },
    plaster: {
      tex: "plaster_stained",
      fb: "noise",
      color: 0xffffff,
      tile: [3, 3],
      rough: 0.9,
    },
    bronze: {
      tex: "bronze",
      fb: "noise",
      color: 0xffffff,
      tile: [1.5, 1.5],
      rough: 0.4,
      metal: 0.75,
    },
    gold: {
      color: 0xd8a640,
      rough: 0.32,
      metal: 0.85,
      emissive: 0x2a1a04,
      flat: true,
    },
    brass: {
      color: 0xb08a48,
      rough: 0.38,
      metal: 0.8,
      emissive: 0x140c02,
      flat: true,
    },
    steel: { color: 0x9aa0a4, rough: 0.35, metal: 0.75, flat: true },
    iron: { color: 0x2a2b2c, rough: 0.6, metal: 0.55, flat: true },
    glass: {
      color: 0x2a3434,
      rough: 0.08,
      metal: 0.6,
      flat: true,
      transparent: true,
      opacity: 0.55,
    },
    wax: {
      color: 0xf2e6c8,
      rough: 0.55,
      metal: 0,
      emissive: 0x2a1c08,
      flat: true,
    },
    knit: {
      custom: "knit",
      color: 0xffffff,
      tile: [0.5, 0.5],
      rough: 1,
      side: THREE.DoubleSide,
    },
    casing: {
      custom: "casing",
      color: 0xffffff,
      tile: [1, 1],
      rough: 0.55,
      metal: 0.25,
    },
    sun_ceiling: {
      custom: "sun_ceiling",
      color: 0xffffff,
      tile: [1, 1],
      rough: 0.9,
    },
    decal: {
      custom: "decal",
      color: 0xffffff,
      tile: [1, 1],
      rough: 0.85,
      transparent: true,
      alphaTest: 0.04,
      noShadow: true,
      polyOff: true,
      side: THREE.DoubleSide,
    },
    lit: { basic: true, color: 0xffffff, toneMapped: false, noShadow: true }, // self-lit (bulbs, dials, flames base)
    shade: { basic: true, color: 0x000000, noShadow: true }, // pure black (voids, tunnel depth)
  };
  K.MATDEF = MATDEF;
  // Colour variants share the base material (colour baked into vertex colours).
  const ALIASES = {
    brick_dark: ["brick", 0xa88a7c],
    brick_soot: ["brick", 0x8a766c],
    concrete_grey: ["concrete", 0xa8a49c],
    concrete_soot: ["concrete_dark", 0xa09a90],
    tile_cream: ["tile", 0xb8ac90],
    tile_green: ["tile", 0x8aa08a],
    tile_dirty: ["tile", 0xb8ae98],
    paint_green: ["metal", 0x4a5a48],
    paint_grey: ["metal", 0x6a6e6a],
    paint_red: ["metal", 0x8e2a22],
    paint_cream: ["metal", 0xd8d0b8],
    paint_black: ["metal", 0x232425],
    paint_yellow: ["metal", 0xc8a030],
    paint_olive: ["army", 0x8a8e6a],
    rust_dark: ["rust", 0x6a5444],
    wood_dark: ["wood", 0x5a4232],
    wood_light: ["wood", 0xd8c09a],
    robe_grey: ["fabric", 0x8a8a84],
    robe_ochre: ["fabric", 0xb08a4a],
    cloth_red: ["fabric", 0x8a2a22],
    cloth_ivory: ["fabric", 0xe0d6c0],
    mattress: ["fabric", 0x9a8e74],
    tarp: ["burlap", 0x6a6a52],
    brass_dark: ["brass", 0x7a5e30],
    gold_dull: ["gold", 0xb08838],
  };
  K.ALIASES = ALIASES;
  const aliasMul = {};
  function resolveAlias(key) {
    const al = ALIASES[key];
    if (!al) return null;
    if (!aliasMul[key]) {
      const base = MATDEF[al[0]] || {};
      const bc = new THREE.Color().setHex(
        base.flat ? base.color || 0xffffff : 0xffffff,
        THREE.LinearSRGBColorSpace,
      );
      const ac = new THREE.Color().setHex(al[1], THREE.LinearSRGBColorSpace);
      aliasMul[key] = {
        base: al[0],
        r: ac.r / Math.max(0.02, bc.r),
        g: ac.g / Math.max(0.02, bc.g),
        b: ac.b / Math.max(0.02, bc.b),
      };
    }
    return aliasMul[key];
  }
  K.tile = function (key) {
    const al = ALIASES[key];
    if (al) key = al[0];
    const d = MATDEF[key];
    return (d && d.tile) || [2, 2];
  };

  // ---- the module's own canvases ----
  const custom = {};
  K.decalRects = {};
  /** The decal atlas: every stencil, painted sun, name wall, label and paper scrap of the lair on one 2048² canvas. */
