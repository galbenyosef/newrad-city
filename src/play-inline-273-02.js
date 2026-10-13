// play-inline-273 02 — color
// Lines 18-133 of readable/play-inline-273.pretty.js (statement-aligned).
  const P = G._uw;
  const TAU = P.TAU,
    PI = P.PI,
    HP = P.HP;
  const X = (P.parts = {});

  // ------------------------------------------------------------------
  // Extra materials
  // ------------------------------------------------------------------
  Object.assign(P.MAT, {
    deco_black: {
      src: "granite",
      tint: 0x2a2a2e,
      color: 0x1c1c20,
      uv: 3,
      rough: 0.35,
    },
    brass: {
      src: "gold",
      tint: 0xd8b060,
      color: 0xb08a40,
      uv: 1,
      metal: 0.8,
      rough: 0.4,
    },
    tile_green: { custom: "tile_green", color: 0x5a8a70, uv: 1.6, rough: 0.35 },
    tile_bath: { custom: "tile_bath", color: 0xd8d8cc, uv: 1.2, rough: 0.35 },
    checker: { custom: "checker", color: 0x888888, uv: 2.4, rough: 0.3 },
    mosaic: {
      custom: "mosaic",
      color: 0xa89a80,
      uv: 4,
      keep: false,
      rough: 0.5,
    },
    mannequin: {
      src: "paint_white",
      tint: 0xe8dccb,
      color: 0xd8ccb8,
      uv: 1,
      rough: 0.45,
    },
    mannequin_dark: {
      src: "paint_black",
      tint: 0x3a3430,
      color: 0x2a2624,
      uv: 1,
      rough: 0.45,
    },
    awning: { custom: "canvas_black", color: 0x1a1a1a, uv: 1.5, rough: 1 },
    canvas: { custom: "canvas_tan", color: 0x8a7a5a, uv: 1.5, rough: 1 },
    crop_dead: { custom: "crop_dead", color: 0x6a5a38, uv: 1.2, rough: 1 },
    hay: { custom: "hay", color: 0xa08a50, uv: 1, rough: 1 },
    chicken_wire: { src: "iron", color: 0x4a4a44, uv: 1, metal: 0.4 },
    limestone_warm: {
      src: "stone_limestone",
      tint: 0xf0e2c8,
      color: 0xc8b898,
      uv: 4,
    },
    terracotta_cream: {
      src: "stone_limestone",
      tint: 0xfff4de,
      color: 0xd8ccb0,
      uv: 3,
    },
    brick_tan: { src: "brick_tan", tint: 0xe8d0a0, color: 0xb89a6a, uv: 3 },
    clothes: { custom: "clothes", color: 0x7a6a5a, uv: 0.8, rough: 1 },
    shoebox: { custom: "shoebox", color: 0x8a7a6a, uv: 0.6, rough: 0.9 },
    backdrop_park: {
      custom: "backdrop_park",
      color: 0x000000,
      emissive: 0xffffff,
      ei: 0.85,
      emissiveCustom: true,
      uv: 1,
      keep: true,
      noShadow: true,
    },
    lamp_warm: {
      color: 0xffe0b0,
      emissive: 0xffc070,
      ei: 1.6,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_cool: {
      color: 0xd8f0ff,
      emissive: 0xb8e0ff,
      ei: 1.4,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    neon_b: {
      color: 0xfff0f0,
      emissive: 0xff6a88,
      ei: 2.0,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    glow_green: {
      color: 0x70ff70,
      emissive: 0x50ff40,
      ei: 1.3,
      plain: true,
      noShadow: true,
      uv: 1,
    },
  });
  P.DETAILS_EXTRA = ["brass", "mannequin", "clothes", "hay", "chicken_wire"];

  const sp = P.speckle,
    bl = P.blotches;
