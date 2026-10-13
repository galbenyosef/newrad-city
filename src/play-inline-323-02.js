// play-inline-323 02 — rough
// Lines 13-361 of readable/play-inline-323.pretty.js (statement-aligned).
  const PF = G._pch;
  const U = G.util;
  const TAU = Math.PI * 2;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

  // -------------------------------------------------------------------
  // Materials
  // -------------------------------------------------------------------
  Object.assign(PF.MAT_DEFS, {
    // High Line: riveted steel painted the West Side Improvement's dark grey-green, flaking to rust
    hl_steel: {
      src: "metal_painted",
      color: 0x3c4038,
      tint: 0x5a6252,
      rough: 0.72,
      metal: 0.4,
      uv: 3,
    },
    hl_steel_dk: {
      src: "metal_painted",
      color: 0x2a2d28,
      tint: 0x3e443a,
      rough: 0.7,
      metal: 0.45,
      uv: 3,
    },
    ballast: {
      src: "gravel",
      color: 0x6a645a,
      tint: 0xa89e90,
      rough: 1,
      uv: 3,
    },
    tie_wood: {
      src: "wood_rotten",
      color: 0x3e3226,
      tint: 0x6a5846,
      rough: 1,
      uv: 2,
    },
    rail: {
      src: "metal_scratched",
      color: 0x5a4a3c,
      tint: 0x9a8272,
      rough: 0.5,
      metal: 0.7,
      uv: 2,
    },
    leaf: {
      src: "grass_dead",
      color: 0x5c5a34,
      tint: 0x8a8a52,
      rough: 1,
      uv: 2,
    },
    leaf_red: {
      src: "grass_dead",
      color: 0x6a3a24,
      tint: 0xb07048,
      rough: 1,
      uv: 2,
    },
    weeds: {
      src: "grass_dead",
      color: 0x6b6a45,
      tint: 0xa8a070,
      rough: 1,
      uv: 3,
      noShadow: true,
    },
    boxcar: {
      src: "metal_painted",
      color: 0x6a3222,
      tint: 0x9a4a34,
      rough: 0.8,
      metal: 0.3,
      uv: 3,
    },
    boxcar_yel: {
      src: "metal_painted",
      color: 0x9a7a2a,
      tint: 0xc8a048,
      rough: 0.8,
      metal: 0.25,
      uv: 3,
    },
    // Nabisco: deep red-brown factory brick
    brick_nab: {
      src: "brick_red",
      color: 0x7a3a2a,
      tint: 0xc07a62,
      rough: 0.95,
      uv: 2.6,
    },
    brick_nab_dk: {
      src: "brick_brown",
      color: 0x5a3024,
      tint: 0x9a6250,
      rough: 0.95,
      uv: 2.6,
    },
    steel_win: {
      src: "metal_painted",
      color: 0x2a2c2a,
      tint: 0x484c48,
      rough: 0.6,
      metal: 0.5,
      uv: 2,
    },
    tile_white: {
      src: "tile_subway",
      color: 0xd8d4c8,
      tint: 0xf0ece0,
      rough: 0.5,
      uv: 2,
    },
    belt: { src: "rubber", color: 0x222220, tint: 0x3a3a36, rough: 0.8, uv: 2 },
    cake: { color: 0xc89048, rough: 0.8, uv: 1, plain: true },
    cake_pink: { color: 0xe8a0b0, rough: 0.6, uv: 1, plain: true },
    cake_cream: { color: 0xf0e4c8, rough: 0.6, uv: 1, plain: true },
    carton: {
      src: "cardboard",
      color: 0xb89a6a,
      tint: 0xd8c0a0,
      rough: 0.95,
      uv: 1.5,
    },
    flour: { src: "burlap", color: 0xd8d0b8, tint: 0xf0e8d8, rough: 1, uv: 1 },
    nest: { src: "dirt", color: 0x5a4632, tint: 0x9a8064, rough: 1, uv: 4 },
    nest_dk: { src: "dirt", color: 0x3a2c20, tint: 0x6a5440, rough: 1, uv: 4 },
    resin: {
      color: 0x8a5a1a,
      emissive: 0x4a2a04,
      emissiveIntensity: 0.35,
      rough: 0.25,
      metal: 0.1,
      uv: 2,
      plain: true,
    },
    ant_egg: {
      color: 0xe8e0b0,
      emissive: 0x9ab040,
      emissiveIntensity: 0.55,
      rough: 0.35,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    oven_door: {
      src: "metal_scratched",
      color: 0x5a5a56,
      tint: 0x8a8a84,
      rough: 0.45,
      metal: 0.7,
      uv: 2,
    },
    oven_glow: {
      color: 0xff8030,
      emissive: 0xff5a10,
      emissiveIntensity: 1.6,
      rough: 1,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    enamel_blue: {
      src: "metal_painted",
      color: 0x3a5a7a,
      tint: 0x5a80a8,
      rough: 0.5,
      metal: 0.3,
      uv: 2,
    },
    // Webster Hall: warm red brick with pale terracotta trim, a gilded ballroom
    brick_web: {
      src: "brick_red",
      color: 0x8a3e2e,
      tint: 0xd08870,
      rough: 0.95,
      uv: 2.4,
    },
    terra: {
      custom: "terracotta",
      prefer: "custom",
      color: 0xd8cfb8,
      tint: 0xe8d8bc,
      rough: 0.7,
      uv: 3,
      bump: 0.6,
    },
    parquet: {
      src: "wood_planks",
      color: 0x6a4a2c,
      tint: 0xa87a50,
      rough: 0.55,
      uv: 1.6,
    },
    ball_wall: {
      src: "plaster_stained",
      color: 0x9a8a6a,
      tint: 0xd8c8a0,
      rough: 0.9,
      uv: 4,
    },
    ball_red: {
      src: "wallpaper",
      color: 0x6a2224,
      tint: 0xa84444,
      rough: 0.9,
      uv: 2.5,
    },
    gold_trim: {
      color: 0xb08a3a,
      rough: 0.38,
      metal: 0.75,
      uv: 2,
      plain: true,
    },
    mirror: { color: 0xd8dce0, rough: 0.12, metal: 0.95, uv: 1, plain: true },
    neon_pink: {
      color: 0xff70c0,
      emissive: 0xff2a9a,
      emissiveIntensity: 2.6,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    neon_blue: {
      color: 0x80c8ff,
      emissive: 0x2a8aff,
      emissiveIntensity: 2.4,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    neon_red: {
      color: 0xff6048,
      emissive: 0xff2a10,
      emissiveIntensity: 2.6,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    bulb: {
      color: 0xfff4d8,
      emissive: 0xffe0a0,
      emissiveIntensity: 2.4,
      rough: 0.4,
      uv: 1,
      plain: true,
      noShadow: true,
    },
    stage_black: {
      src: "wood_planks",
      color: 0x1e1a18,
      tint: 0x3a3430,
      rough: 0.8,
      uv: 2,
    },
    curtain: {
      src: "fabric",
      color: 0x6a1418,
      tint: 0xa02a2a,
      rough: 1,
      uv: 1.2,
    },
    marble_bar: {
      src: "marble_dark",
      color: 0x2a3430,
      tint: 0x5a6a62,
      rough: 0.25,
      uv: 2,
    },
    felt: { src: "fabric", color: 0x1e4a2a, tint: 0x3a7a48, rough: 1, uv: 1 },
    meat: { color: 0x7a2a22, rough: 0.6, uv: 1, plain: true },
    ice: { color: 0xc8dce8, rough: 0.2, metal: 0.1, uv: 1, plain: true },
  });

  // -------------------------------------------------------------------
  // Custom canvas textures
  // -------------------------------------------------------------------
  /** Faded painted "ghost sign" on brick (transparent background, paint only). */
  PF.ghostSignTex = function (key, lines, opts) {
    opts = opts || {};
    return PF.canvasTex(
      "pch_ghost_" + key,
      opts.w || 1024,
      opts.h || 256,
      (ctx, w, h) => {
        const r = PF.rng("ghost" + key);
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = opts.bg || "rgba(40,30,22,0.55)";
        ctx.fillRect(w * 0.02, h * 0.04, w * 0.96, h * 0.92);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const fs0 = Math.floor((h * 0.78) / lines.length);
        lines.forEach((t, i) => {
          let fs = fs0 * (i === 0 ? 1 : 0.8);
          ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
          const mw = ctx.measureText(t).width;
          if (mw > w * 0.9) {
            fs = Math.floor((fs * w * 0.9) / mw);
            ctx.font = "bold " + fs + 'px "Arial Black", Impact, sans-serif';
          }
          const y = h / 2 + (i - (lines.length - 1) / 2) * fs0 * 1.02;
          ctx.fillStyle =
            (opts.colors && opts.colors[i]) ||
            opts.fg ||
            "rgba(236,226,200,0.9)";
          ctx.fillText(t, w / 2, y);
        });
        // flaking: punch holes through the paint so brick shows through
        ctx.globalCompositeOperation = "destination-out";
        for (let i = 0; i < 900; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.3 + r() * 0.7) + ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            1 + r() * 9,
            1 + r() * 5,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = "rgba(0,0,0," + (0.2 + r() * 0.4) + ")";
          ctx.fillRect(r() * w, 0, 2 + r() * 7, h);
        }
        ctx.globalCompositeOperation = "source-over";
      },
      { clamp: true },
    );
  };
  /** Ghost-sign material key (alpha-tested decal quad). */
  PF.ghostKey = function (key, lines, opts) {
    return PF.texMat("ghost_" + key, PF.ghostSignTex(key, lines, opts), {
      transparent: true,
      rough: 0.95,
      noShadow: true,
    });
  };

  /** Rail herald for the boxcars: "NEW YORK CENTRAL SYSTEM" oval + reporting marks. */
