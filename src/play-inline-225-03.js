// play-inline-225 03 — src
// Lines 357-608 of readable/play-inline-225.pretty.js (statement-aligned).
  const MAT = {
    marble: { src: "marble", c: 0xd8d4cc, uv: 3 },
    marble_warm: { src: "marble", tint: 0xe8d8b8, c: 0xd8c8a8, uv: 3 },
    marble_dark: {
      src: "marble",
      tint: 0x5c6660,
      c: 0x3a403c,
      uv: 3,
      rough: 0.28,
    }, // (was the green-black deco marble: albedo ≈ 0.01 linear, floors read as holes under baked light)
    marble_green: { src: "marble_dark", tint: 0x8ac8a8, c: 0x3a5a4a, uv: 3 },
    marble_red: { src: "marble", tint: 0xb86a58, c: 0x8a4438, uv: 3 },
    granite_black: { src: "granite", tint: 0x524e4a, c: 0x2e2c2a, uv: 3 },
    granite: { src: "granite", c: 0x8a8680, uv: 3 },
    terrazzo: { src: "terrazzo", c: 0xb8b0a0, uv: 2 },
    limestone: { src: "stone_limestone", c: 0xc8bea8, uv: 4 },
    plaster: { canvas: "plaster", tint: 0xe4dccb, uv: 4 },
    plaster_warm: { canvas: "plaster", tint: 0xf2dcb0, uv: 4 },
    plaster_blue: { canvas: "plaster", tint: 0xa8c0cc, uv: 4 },
    plaster_stained: { src: "plaster_stained", c: 0xd8d0bc, uv: 3 },
    paint_cream: { canvas: "paint", tint: 0xe8dcc0, uv: 3 },
    paint_green: { canvas: "paint", tint: 0x8aa890, uv: 3 },
    wallpaper: { src: "wallpaper", c: 0xa89878, uv: 2 },
    wood: { src: "wood_planks", c: 0x8a6a48, uv: 2 },
    wood_dark: { src: "wood_planks", tint: 0x8a6446, c: 0x5a4030, uv: 2 }, // (was 0x6a4c34: read as black once linearised)
    wood_light: { src: "wood_planks", tint: 0xe8d0a8, c: 0xb89a70, uv: 2 },
    wood_rotten: { src: "wood_rotten", c: 0x6a5a48, uv: 2 },
    carpet: { src: "carpet", c: 0x6a3a30, uv: 2 },
    carpet_blue: { src: "carpet", tint: 0x7aa0c8, c: 0x3a5a7a, uv: 2 },
    carpet_green: { src: "carpet", tint: 0x88b090, c: 0x3a5a44, uv: 2 },
    carpet_red: { src: "carpet", tint: 0xd07a6a, c: 0x7a2a22, uv: 2 },
    tile: { src: "tile_floor", c: 0xb8b0a0, uv: 2 },
    concrete: { src: "concrete", c: 0x8a8880, uv: 4 },
    concrete_dark: { src: "concrete_dark", c: 0x5a5854, uv: 4 },
    brick: { src: "brick_red", c: 0x8a4a38, uv: 3 },
    metal: { src: "metal_panel", c: 0x6a6e70, uv: 2 },
    metal_painted: { src: "metal_painted", c: 0x5a6a5a, uv: 2 },
    metal_olive: { src: "metal_painted", tint: 0x8a9a6a, c: 0x4a5a38, uv: 2 },
    metal_dark: { src: "metal_panel", tint: 0x3a3c40, c: 0x2a2c30, uv: 2 },
    continuity_black: {
      src: "metal_panel",
      tint: 0x2a2c30,
      c: 0x1c1e22,
      uv: 2,
      metal: 0.5,
    },
    diamond: { src: "metal_diamond", c: 0x707478, uv: 1 },
    rust: { src: "rust", c: 0x6a3e24, uv: 2 },
    corrugated: { src: "corrugated", c: 0x6a6660, uv: 2 },
    steel: { src: "steel", c: 0x9aa0a4, uv: 2, plainSrc: true },
    iron: { src: "iron", c: 0x3a3a3a, uv: 2, plainSrc: true },
    chrome: { src: "chrome", c: 0xc8ccd0, uv: 2, plainSrc: true },
    gold: { src: "gold", c: 0xd8a848, uv: 1, metal: 0.7, rough: 0.35 },
    gold_leaf: {
      canvas: "goldleaf",
      tint: 0xffffff,
      uv: 2.4,
      metal: 0.55,
      rough: 0.38,
    },
    brass: { src: "bronze", tint: 0xf0c878, c: 0xb08840, uv: 2, metal: 0.6 },
    bronze: { src: "bronze", c: 0x6a5030, uv: 2 },
    copper: { src: "copper_patina", c: 0x5a8a78, uv: 3 },
    fabric: { src: "fabric", c: 0x6a6258, uv: 0.5 },
    fabric_red: { src: "fabric", tint: 0xc05040, c: 0x8a2a20, uv: 0.5 },
    fabric_blue: { src: "fabric", tint: 0x5a7aa8, c: 0x2a4a6a, uv: 0.5 },
    fabric_green: { src: "fabric", tint: 0x7a9a6a, c: 0x3a5a2a, uv: 0.5 },
    leather: { src: "leather", c: 0x4a3024, uv: 0.5 },
    paper: { src: "paper", c: 0xc8c0a8, uv: 0.5 },
    cardboard: { src: "cardboard", c: 0x8a7050, uv: 0.8 },
    bone: { src: "bone", c: 0xcfc6ae, uv: 0.5 },
    rubble: { src: "rubble", c: 0x7a7266, uv: 4 },
    dirt: { src: "dirt", c: 0x5a4a38, uv: 4 },
    glass: {
      src: "glass_dirty",
      c: 0x5a7070,
      uv: 2,
      transparent: true,
      opacity: 0.35,
      noBake: true,
      rough: 0.1,
      metal: 0.2,
    },
    glass_dark: { c: 0x1a2426, rough: 0.15, metal: 0.4, plain: true },
    black: { c: 0x141414, rough: 0.9, plain: true },
    rubber: { src: "rubber", c: 0x1a1a1a, uv: 0.5 },
    // emissive (not baked)
    lamp: { c: 0xffe0b0, emissive: 0xffd49a, ei: 2.2, plain: true, lamp: true },
    lamp_cool: {
      c: 0xe8f4ff,
      emissive: 0xd8ecff,
      ei: 2.0,
      plain: true,
      lamp: true,
    },
    lamp_red: {
      c: 0xff5040,
      emissive: 0xff3020,
      ei: 2.2,
      plain: true,
      lamp: true,
    },
    lamp_green: {
      c: 0x80ff90,
      emissive: 0x40ff70,
      ei: 1.6,
      plain: true,
      lamp: true,
    },
    lamp_blue: {
      c: 0x80c0ff,
      emissive: 0x4090ff,
      ei: 1.8,
      plain: true,
      lamp: true,
    },
    lamp_amber: {
      c: 0xffc060,
      emissive: 0xffa030,
      ei: 2.0,
      plain: true,
      lamp: true,
    },
    screen: {
      src: "screen_green",
      c: 0x3aff7a,
      emissive: 0x2aff6a,
      ei: 0.9,
      uv: 1,
      plainSrc: true,
      glowOnly: true,
    },
    // small indicator LEDs / sign lamps: glowing surfaces that must NOT become real light fixtures (userData.noFixture;
    // glowOnly also keeps atmosphere's interior lamp scan off them)
    led_red: {
      c: 0xff5040,
      emissive: 0xff3020,
      ei: 2.0,
      plain: true,
      glowOnly: true,
      noFixture: true,
    },
    led_green: {
      c: 0x80ff90,
      emissive: 0x40ff70,
      ei: 1.6,
      plain: true,
      glowOnly: true,
      noFixture: true,
    },
    led_amber: {
      c: 0xffc060,
      emissive: 0xffa030,
      ei: 1.8,
      plain: true,
      glowOnly: true,
      noFixture: true,
    },
    fire: { c: 0xffa040, emissive: 0xff7a20, ei: 3.0, plain: true, lamp: true },
    goo: {
      c: 0x5a9a20,
      emissive: 0x6aff30,
      ei: 0.7,
      plain: true,
      rough: 0.2,
      glowOnly: true,
    },
    forcefield: {
      c: 0x7ab8ff,
      emissive: 0x4a90ff,
      ei: 1.4,
      plain: true,
      transparent: true,
      opacity: 0.35,
      noBake: true,
      glowOnly: true,
      double: true,
    },
  };
  LI.MAT = MAT;
  const matCache = {};
  let fallbackNoise = null;
  function noiseTex() {
    if (fallbackNoise) return fallbackNoise;
    fallbackNoise = LI.canvasTex("li_noise", 256, 256, (x, W, H) => {
      x.fillStyle = "#b0aca4";
      x.fillRect(0, 0, W, H);
      const r = LI.rng(3);
      for (let i = 0; i < 3000; i++) {
        const v = 120 + r() * 110;
        x.fillStyle = "rgba(" + v + "," + v + "," + (v - 6) + ",0.25)";
        x.fillRect(r() * W, r() * H, 2 + r() * 8, 2 + r() * 8);
      }
    });
    return fallbackNoise;
  }
  /** Add the baked light term (albedo × vertex `bake`) to a material, chaining any existing compile hook. */
  function bakeHook(m) {
    const prev = m.onBeforeCompile,
      prevKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (sh, r) {
      if (prev) prev.call(this, sh, r);
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bake;\nvarying vec3 vLiBake;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvLiBake = bake;",
        );
      sh.fragmentShader = sh.fragmentShader.replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vLiBake;",
      );
      if (sh.fragmentShader.indexOf("#include <opaque_fragment>") >= 0)
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <opaque_fragment>",
          "outgoingLight += diffuseColor.rgb * vLiBake * 1.55;\n#include <opaque_fragment>",
        );
      else
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <output_fragment>",
          "outgoingLight += diffuseColor.rgb * vLiBake * 1.55;\n#include <output_fragment>",
        );
    };
    m.customProgramCacheKey = function () {
      return (prevKey ? prevKey.call(this) : "") + "|li_bake1";
    };
    m.needsUpdate = true;
  }
  /** Texture metres-per-tile for a key. */
  LI.metersFor = function (key) {
    const d = MAT[key];
    if (!d) return 2;
    if (d._m !== undefined) return d._m;
    let m = d.uv || 2;
    if (d.src && !d.plainSrc) {
      try {
        if (!G.isStub("tex") && G.tex.info) {
          const inf = G.tex.info(d.src);
          if (inf && inf.meters) m = inf.meters;
        }
      } catch (e) {
        /* keep */
      }
    }
    return (d._m = m);
  };
  /**
   * Material for key. baked=true → clone with the bake hook. Keys: MAT names, or 'tex:<id>' registered with LI.texMat.
   */
