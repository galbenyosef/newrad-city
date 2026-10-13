/* src/landmark_interiors/00_kit.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 00_kit.js
 * Private toolkit (G._li) for the walk-in interiors this module adds to
 * EXISTING landmarks (UN General Assembly, 30 Rock, NYSE, Woolworth,
 * City Hall, Flatiron). Nothing here touches another module's files:
 *   - materials: G.mats surfaces (cloned + a baked-light shader hook) with
 *     procedural fallbacks, plus our own canvas art (murals, emblems…)
 *   - Batch: geometry collected per material, world-scaled box UVs,
 *     vertex-colour AO/grime and a per-vertex BAKED light term that the
 *     material adds as emission (fake interior GI, zero runtime lights)
 *   - Cell: one interior cell (root Group at the cell origin, local
 *     coordinates, colliders/anchors/doors/props/pickups in world space)
 *   - architecture helpers: walls with openings, stairs (≤0.25 m risers),
 *     railings, columns, arches, lamps, and a small furniture kit
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE) return;
  const LI = (G._li = G._li || {});
  const TAU = Math.PI * 2;
  LI.TAU = TAU;
  LI.cells = LI.cells || [];
  LI.builders = LI.builders || []; // [{key, order, build(LI)}]
  LI.readyFns = LI.readyFns || []; // run at initDone (props, terminals, pickups, items, dialogues)
  LI.spawnFns = LI.spawnFns || []; // run on newGame / loaded (actors)
  LI.resetFns = LI.resetFns || [];
  LI.animators = LI.animators || []; // (dt, t) per frame while the cell is visible
  LI.saveHooks = LI.saveHooks || {}; // key → {save(), load(d)}

  LI.addBuilder = (key, order, fn) =>
    LI.builders.push({ key, order, build: fn });
  LI.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  LI.smooth = (a, b, x) => {
    const t = LI.clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  LI.rng = function (seed) {
    let a = (typeof seed === "string" ? hashStr(seed) : seed) >>> 0 || 1;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function vnh(a, b) {
    let n = ((a * 73856093) | 0) ^ ((b * 19349663) | 0);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function vnoise(x, z) {
    const xi = Math.floor(x),
      zi = Math.floor(z),
      xf = x - xi,
      zf = z - zi,
      sx = xf * xf * (3 - 2 * xf),
      sz = zf * zf * (3 - 2 * zf);
    const a = vnh(xi, zi),
      b = vnh(xi + 1, zi),
      c = vnh(xi, zi + 1),
      d = vnh(xi + 1, zi + 1);
    const ab = a + (b - a) * sx;
    return ab + (c + (d - c) * sx - ab) * sz;
  }
  LI.noise = vnoise;

  // =====================================================================
  // Canvas textures
  // =====================================================================
  const texCache = {};
  LI.canvas = (w, h) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  /** Cached CanvasTexture drawn by fn(ctx, w, h). */
  LI.canvasTex = function (key, w, h, fn, opts) {
    if (texCache[key]) return texCache[key];
    const c = LI.canvas(w, h),
      x = c.getContext("2d");
    try {
      fn(x, w, h);
    } catch (e) {
      G.reportError("landmark_interiors:tex " + key, e);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.anisotropy = 4;
    t.needsUpdate = true;
    texCache[key] = t;
    return t;
  };
  /** Wear: grime blotches, streaks and scratches over a painted canvas. */
  LI.wear = function (x, W, H, seed, amt) {
    const r = LI.rng(seed || 7);
    amt = amt === undefined ? 1 : amt;
    for (let i = 0; i < 40 * amt; i++) {
      const g = x.createRadialGradient(
        r() * W,
        r() * H,
        0,
        r() * W,
        r() * H,
        10 + r() * W * 0.15,
      );
      g.addColorStop(0, "rgba(30,24,16," + (0.18 * amt).toFixed(2) + ")");
      g.addColorStop(1, "rgba(30,24,16,0)");
      x.fillStyle = g;
      x.fillRect(0, 0, W, H);
    }
    for (let i = 0; i < 18 * amt; i++) {
      const sx = r() * W,
        gg = x.createLinearGradient(0, 0, 0, H);
      gg.addColorStop(0, "rgba(40,30,18,0.0)");
      gg.addColorStop(
        r() * 0.5 + 0.2,
        "rgba(40,30,18," + (0.22 * amt).toFixed(2) + ")",
      );
      gg.addColorStop(1, "rgba(40,30,18,0)");
      x.fillStyle = gg;
      x.fillRect(sx, r() * H * 0.3, 1 + r() * 4, H);
    }
    for (let i = 0; i < 120 * amt; i++) {
      x.fillStyle =
        "rgba(" +
        (r() < 0.5 ? "255,250,230" : "20,16,10") +
        "," +
        (r() * 0.25).toFixed(2) +
        ")";
      x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3);
    }
  };
  /** Fit text into width. */
  LI.fitText = function (x, text, cx, cy, maxW, size, font) {
    let s = size;
    x.font = font.replace("%s", s);
    while (x.measureText(text).width > maxW && s > 8) {
      s -= 2;
      x.font = font.replace("%s", s);
    }
    x.fillText(text, cx, cy);
  };
  /** Generic sign canvas: lines of text. style: {bg, fg, border, font, size, emboss, glow}. */
  LI.signTex = function (key, lines, st, w, h) {
    st = st || {};
    w = w || 512;
    h = h || 128;
    return LI.canvasTex(
      "sign_" + key,
      w,
      h,
      (x, W, H) => {
        x.fillStyle = st.bg || "#2a2a26";
        x.fillRect(0, 0, W, H);
        if (st.border) {
          x.strokeStyle = st.border;
          x.lineWidth = Math.max(4, H * 0.05);
          x.strokeRect(H * 0.06, H * 0.06, W - H * 0.12, H - H * 0.12);
        }
        x.textAlign = "center";
        x.textBaseline = "middle";
        const n = lines.length;
        for (let i = 0; i < n; i++) {
          const sz =
            (st.size || (H * 0.55) / n) * (i === 0 ? 1 : st.subScale || 0.62);
          const yy =
            (H * (i + 0.5)) / n +
            (n > 1 ? (i === 0 ? H * 0.04 : -H * 0.02) : 0);
          if (st.glow) {
            x.shadowColor = st.glow;
            x.shadowBlur = sz * 0.5;
          }
          x.fillStyle =
            i === 0 ? st.fg || "#e8e0c8" : st.fg2 || st.fg || "#e8e0c8";
          LI.fitText(
            x,
            lines[i],
            W / 2,
            yy,
            W * 0.9,
            Math.round(sz),
            st.font || "bold %spx Georgia, serif",
          );
          x.shadowBlur = 0;
        }
        if (st.wear !== 0)
          LI.wear(x, W, H, hashStr(key), st.wear === undefined ? 0.6 : st.wear);
      },
      { clamp: true },
    );
  };

  // =====================================================================
  // Tileable surface canvases (drawn with wrap-around so they tile)
  // =====================================================================
  function wrapBlob(x, W, H, cx, cy, r, col) {
    for (const ox of [-W, 0, W])
      for (const oy of [-H, 0, H]) {
        const g = x.createRadialGradient(
          cx + ox,
          cy + oy,
          0,
          cx + ox,
          cy + oy,
          r,
        );
        g.addColorStop(0, col);
        g.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = g;
        x.fillRect(cx + ox - r, cy + oy - r, r * 2, r * 2);
      }
  }
  LI.CANVAS = {
    goldleaf(x, W, H) {
      const r = LI.rng(303),
        n = 8,
        s = W / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const v = r();
          x.fillStyle =
            "rgb(" +
            Math.round(200 + v * 40) +
            "," +
            Math.round(150 + v * 40) +
            "," +
            Math.round(60 + v * 30) +
            ")";
          x.fillRect(i * s, j * s, s, s);
          const g = x.createLinearGradient(i * s, j * s, i * s + s, j * s + s);
          g.addColorStop(0, "rgba(255,240,190,0.18)");
          g.addColorStop(1, "rgba(120,80,20,0.18)");
          x.fillStyle = g;
          x.fillRect(i * s, j * s, s, s);
          x.strokeStyle = "rgba(120,84,30,0.35)";
          x.lineWidth = 1;
          x.strokeRect(i * s + 0.5, j * s + 0.5, s - 1, s - 1);
        }
      for (let i = 0; i < 900; i++) {
        x.fillStyle =
          r() < 0.5 ? "rgba(255,245,210,0.25)" : "rgba(90,60,20,0.2)";
        x.fillRect(r() * W, r() * H, 1 + r() * 3, 1);
      }
      for (let i = 0; i < 14; i++)
        wrapBlob(
          x,
          W,
          H,
          r() * W,
          r() * H,
          20 + r() * 50,
          "rgba(70,50,20,0.14)",
        );
    },
    plaster(x, W, H) {
      x.fillStyle = "#d6d2ca";
      x.fillRect(0, 0, W, H);
      const r = LI.rng(101);
      for (let i = 0; i < 60; i++)
        wrapBlob(
          x,
          W,
          H,
          r() * W,
          r() * H,
          20 + r() * 90,
          r() < 0.5 ? "rgba(255,255,250,0.10)" : "rgba(90,80,64,0.07)",
        );
      for (let i = 0; i < 5000; i++) {
        const v = r() < 0.5 ? 255 : 60;
        x.fillStyle =
          "rgba(" +
          v +
          "," +
          v +
          "," +
          (v - 10) +
          "," +
          (0.03 + r() * 0.05).toFixed(3) +
          ")";
        x.fillRect(r() * W, r() * H, 1 + r() * 2, 1 + r() * 2);
      }
      for (let i = 0; i < 7; i++) {
        const sx = r() * W,
          w = 3 + r() * 10,
          g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "rgba(96,80,56,0)");
        g.addColorStop(0.5, "rgba(96,80,56,0.10)");
        g.addColorStop(1, "rgba(96,80,56,0)");
        x.fillStyle = g;
        x.fillRect(sx, 0, w, H);
      }
      x.strokeStyle = "rgba(70,60,48,0.18)";
      x.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        let px = r() * W,
          py = r() * H;
        x.beginPath();
        x.moveTo(px, py);
        for (let k = 0; k < 8; k++) {
          px += (r() - 0.5) * 40;
          py += r() * 30;
          x.lineTo(px, py);
        }
        x.stroke();
      }
    },
    paint(x, W, H) {
      x.fillStyle = "#dcdad4";
      x.fillRect(0, 0, W, H);
      const r = LI.rng(202);
      for (let i = 0; i < 40; i++)
        wrapBlob(
          x,
          W,
          H,
          r() * W,
          r() * H,
          30 + r() * 80,
          r() < 0.5 ? "rgba(255,255,255,0.08)" : "rgba(80,70,60,0.08)",
        );
      for (let i = 0; i < 20; i++) {
        x.fillStyle = "rgba(120,110,96," + (0.08 + r() * 0.12).toFixed(2) + ")";
        const px = r() * W,
          py = r() * H;
        x.beginPath();
        x.ellipse(px, py, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, TAU);
        x.fill();
      }
      for (let i = 0; i < 3000; i++) {
        x.fillStyle = "rgba(40,36,30," + (r() * 0.05).toFixed(3) + ")";
        x.fillRect(r() * W, r() * H, 1, 1);
      }
    },
  };

  // =====================================================================
  // Materials
  // =====================================================================
  // key → {src (G.mats surface), tint, rough, metal, uv (m per tile), emissive, ei, custom (canvas key), keep (uv as given),
  //        transparent, opacity, side, fallback colour c}
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
  LI.mat = function (key, baked) {
    const ck = key + (baked ? "@b" : "");
    if (matCache[ck]) return matCache[ck];
    let m = null;
    if (key.indexOf("tex:") === 0) {
      m = matCache[key];
      if (!m) {
        m = new THREE.MeshStandardMaterial({ color: 0x808080 });
        matCache[key] = m;
      }
      if (baked) {
        m = m.clone();
        m.userData = Object.assign({}, m.userData);
        bakeHook(m);
      }
      return (matCache[ck] = m);
    }
    const d = MAT[key] || { c: 0x888888, plain: true };
    if (d.canvas && LI.CANVAS[d.canvas]) {
      m = new THREE.MeshStandardMaterial({
        map: LI.canvasTex("li_cv_" + d.canvas, 512, 512, LI.CANVAS[d.canvas]),
        color: d.tint === undefined ? 0xffffff : d.tint,
        roughness: d.rough === undefined ? 0.92 : d.rough,
        metalness: d.metal || 0,
        vertexColors: true,
      });
      m.userData = { shared: true, liKey: key };
      if (baked) bakeHook(m);
      return (matCache[ck] = m);
    }
    const haveMats =
      !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    if (d.src && !d.plain && haveMats) {
      try {
        const o = { vertexColors: true };
        if (d.tint !== undefined) o.color = d.tint;
        if (d.rough !== undefined) o.roughness = d.rough;
        if (d.metal !== undefined) o.metalness = d.metal;
        if (d.emissive !== undefined) {
          o.emissive = d.emissive;
          o.emissiveIntensity = d.ei;
        }
        if (d.transparent) {
          o.transparent = true;
          o.opacity = d.opacity;
        }
        const base = G.mats.get(d.src, o);
        if (base && base.isMaterial) m = base.clone();
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const o = {
        color: d.c === undefined ? 0x888888 : d.c,
        roughness: d.rough === undefined ? 0.85 : d.rough,
        metalness: d.metal || 0,
        vertexColors: true,
      };
      if (!d.plain && !d.emissive) o.map = noiseTex();
      if (d.emissive !== undefined) {
        o.emissive = new THREE.Color(d.emissive);
        o.emissiveIntensity = d.ei || 1;
      }
      if (d.transparent) {
        o.transparent = true;
        o.opacity = d.opacity;
        o.depthWrite = false;
      }
      m = new THREE.MeshStandardMaterial(o);
      if (d.lamp) m.name = "li_lamp";
      if (d.lamp && !G.isStub("mats") && G.mats.track) {
        try {
          G.mats.track(m, { glow: [d.ei * 0.8, d.ei] });
        } catch (e) {
          /* optional */
        }
      }
    }
    if (d.double) m.side = THREE.DoubleSide;
    // glowOnly (screens, goo, force fields): glowing surfaces, not light fixtures — an emissiveMap keeps atmosphere's
    // fixture scan from turning every monitor ring into a saturated green pool of real light
    if (d.glowOnly && m.emissive && !m.emissiveMap) {
      if (!LI._white) {
        LI._white = new THREE.DataTexture(
          new Uint8Array([255, 255, 255, 255]),
          1,
          1,
        );
        LI._white.needsUpdate = true;
      }
      m.emissiveMap = LI._white;
      m.needsUpdate = true;
    }
    m.userData = Object.assign({}, m.userData, { shared: true, liKey: key });
    if (d.noFixture || d.glowOnly) m.userData.noFixture = true; // (request to atmosphere: skip these in the lamp scan)
    if (baked && !d.noBake && d.emissive === undefined) bakeHook(m);
    return (matCache[ck] = m);
  };
  /** Register a textured material (signs, murals). Returns its key ('tex:<id>'). opts: {emissive, transparent, rough, metal, double, color} */
  LI.texMat = function (id, tex, opts) {
    const k = "tex:" + id;
    opts = opts || {};
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.8 : opts.rough,
        metalness: opts.metal || 0,
        vertexColors: true,
      });
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.35;
      }
      if (opts.double) m.side = THREE.DoubleSide;
      m.userData = {
        shared: true,
        liKey: k,
        keepUV: true,
        emissive: !!opts.emissive,
      };
      matCache[k] = m;
    }
    return k;
  };
  const isEmissiveKey = (k) => {
    if (k.indexOf("tex:") === 0) {
      const m = matCache[k];
      return !!(m && m.userData.emissive);
    }
    const d = MAT[k];
    return !!(d && (d.emissive !== undefined || d.noBake));
  };
  const keepUV = (k) => k.indexOf("tex:") === 0;

  // =====================================================================
  // Batch
  // =====================================================================
  const _n = new THREE.Vector3(),
    _a = new THREE.Vector3(),
    _b = new THREE.Vector3(),
    _c = new THREE.Vector3();
  function Batch(name) {
    this.name = name;
    this.parts = new Map();
    this.lights = [];
    this.amb = new THREE.Color(0x303030);
    this.fy = 0;
    this.aoH = 1.4;
    this.grime = 0.5;
    this.tris = 0;
    // Round 2 lighting: big faces are tessellated (≤ seg metres) so the per-vertex bake has resolution, the bake
    // runs at build() with EVERY light of the cell (sconces/pendants added after a wall used to miss it), and
    // thick plate-like boxes (walls, floors, slabs) occlude baked lights (no more light through walls).
    this.seg = 1.5;
    this.occ = [];
    this.occlude = true;
  }
  LI.Batch = Batch;
  /** Baked point light (local coords). */
  Batch.prototype.light = function (x, y, z, color, r, i) {
    this.lights.push({
      x,
      y,
      z,
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
    return this;
  };
  Batch.prototype.ambient = function (color, i) {
    this.amb = new THREE.Color(color).multiplyScalar(i === undefined ? 1 : i);
    return this;
  };
  /**
   * Add a geometry (consumed). o: {m: Matrix4, c: tint hex|Color, grime, noAO, fy (floor ref), uvRect:[u0,v0,u1,v1], us, vs, bakeMul}
   */
  Batch.prototype.add = function (key, geom, o) {
    o = o || {};
    let g = geom.index ? geom.toNonIndexed() : geom;
    if (g !== geom) geom.dispose();
    if (o.m) g.applyMatrix4(o.m);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (o.flip) {
      // view from inside: reverse winding + negate normals
      const P = g.attributes.position,
        Nn = g.attributes.normal,
        U0 = g.attributes.uv;
      for (let t = 0; t < P.count; t += 3)
        for (const A2 of [P, Nn, U0]) {
          if (!A2) continue;
          const s = A2.itemSize;
          for (let k = 0; k < s; k++) {
            const tmp = A2.array[(t + 1) * s + k];
            A2.array[(t + 1) * s + k] = A2.array[(t + 2) * s + k];
            A2.array[(t + 2) * s + k] = tmp;
          }
        }
      for (let i = 0; i < Nn.array.length; i++) Nn.array[i] = -Nn.array[i];
    }
    if (this.seg > 0 && o.tess !== false && !isEmissiveKey(key) && !o.noBake)
      g = tessellate(g, this.seg * 1.5);
    const pos = g.attributes.position,
      nor = g.attributes.normal,
      cnt = pos.count;
    // ---- UVs
    if (keepUV(key) || o.keepUV) {
      if (!g.attributes.uv)
        g.setAttribute(
          "uv",
          new THREE.BufferAttribute(new Float32Array(cnt * 2), 2),
        );
      const uv = g.attributes.uv;
      if (o.uvRect) {
        const r = o.uvRect;
        for (let i = 0; i < cnt; i++)
          uv.setXY(
            i,
            r[0] + uv.getX(i) * (r[2] - r[0]),
            r[1] + uv.getY(i) * (r[3] - r[1]),
          );
      } else if (o.us || o.vs)
        for (let i = 0; i < cnt; i++)
          uv.setXY(i, uv.getX(i) * (o.us || 1), uv.getY(i) * (o.vs || 1));
    } else {
      const s = 1 / (LI.metersFor(key) * (o.uvScale || 1));
      const uv = new Float32Array(cnt * 2);
      for (let t = 0; t < cnt; t += 3) {
        _a.fromBufferAttribute(pos, t);
        _b.fromBufferAttribute(pos, t + 1);
        _c.fromBufferAttribute(pos, t + 2);
        _n.subVectors(_c, _b).cross(_a.clone().sub(_b));
        const ax = Math.abs(_n.x),
          ay = Math.abs(_n.y),
          az = Math.abs(_n.z);
        for (let k = 0; k < 3; k++) {
          const i = t + k,
            x = pos.getX(i),
            y = pos.getY(i),
            z = pos.getZ(i);
          let u, v;
          if (ay >= ax && ay >= az) {
            u = x;
            v = z;
          } else if (ax >= az) {
            u = z;
            v = y;
          } else {
            u = x;
            v = y;
          }
          uv[i * 2] = u * s + (o.uo || 0);
          uv[i * 2 + 1] = v * s + (o.vo || 0);
        }
      }
      g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    }
    // ---- vertex colour: tint × AO × grime
    const tint =
      o.c === undefined ? null : o.c.isColor ? o.c : new THREE.Color(o.c);
    const col = new Float32Array(cnt * 3);
    const fy = o.fy === undefined ? this.fy : o.fy,
      aoH = o.aoH || this.aoH,
      gr = o.grime === undefined ? this.grime : o.grime;
    for (let i = 0; i < cnt; i++) {
      const x = pos.getX(i),
        y = pos.getY(i),
        z = pos.getZ(i);
      let k = 1;
      if (!o.noAO) k *= 0.6 + 0.4 * LI.smooth(0, aoH, y - fy);
      if (gr > 0)
        k *=
          1 -
          gr * 0.32 * vnoise(x * 0.35 + y * 0.21, z * 0.35 - y * 0.13) -
          gr * 0.12 * vnoise(x * 1.7, z * 1.7 + y);
      col[i * 3] = (tint ? tint.r : 1) * k;
      col[i * 3 + 1] = (tint ? tint.g : 1) * k;
      col[i * 3 + 2] = (tint ? tint.b : 1) * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    // ---- baked light: deferred to build() so every light of the cell is known
    g.userData.liBake = !isEmissiveKey(key) && !o.noBake ? o.bakeMul || 1 : 0;
    if (g.userData.liBake && o.occ !== false && this.occlude)
      this._occFrom(key, g, o);
    let arr = this.parts.get(key);
    if (!arr) {
      arr = [];
      this.parts.set(key, arr);
    }
    arr.push(g);
    this.tris += cnt / 3;
    return g;
  };
  /** Register a thick, plate-like box (wall/floor/slab ≥ 1.2 m on two sides) as a light occluder. */
  Batch.prototype._occFrom = function (key, g, o) {
    const d = MAT[key];
    if (d && (d.transparent || d.noBake)) return;
    if (!o._box) return;
    const bx = o._box,
      s3 = [bx.sx, bx.sy, bx.sz].sort((p, q) => p - q);
    const pier = s3[0] >= 0.28 && bx.sy >= 2.5 && bx.sy >= s3[2] - 1e-6; // tall piers / mullions / pilasters cast too
    if (!pier && (s3[0] < 0.08 || s3[1] < 1.8 || s3[2] < 2.4)) return;
    this.occ.push({
      cx: bx.cx,
      cy: bx.cy,
      cz: bx.cz,
      hx: bx.sx / 2,
      hy: bx.sy / 2,
      hz: bx.sz / 2,
      c: Math.cos(bx.ry || 0),
      s: Math.sin(bx.ry || 0),
      r: Math.hypot(bx.sx, bx.sy, bx.sz) / 2,
    });
  };
  /** Extra occluder (local AABB), e.g. a solid mass built from non-box pieces. */
  Batch.prototype.occluder = function (x0, y0, z0, x1, y1, z1) {
    const sx = Math.abs(x1 - x0),
      sy = Math.abs(y1 - y0),
      sz = Math.abs(z1 - z0);
    this.occ.push({
      cx: (x0 + x1) / 2,
      cy: (y0 + y1) / 2,
      cz: (z0 + z1) / 2,
      hx: sx / 2,
      hy: sy / 2,
      hz: sz / 2,
      c: 1,
      s: 0,
      r: Math.hypot(sx, sy, sz) / 2,
    });
    return this;
  };
  // segment (origin o, unit dir u, length len) vs oriented box (yaw about Y): true if it enters the box in (eps, len-eps)
  function segHitsOcc(b, ox, oy, oz, ux, uy, uz, len) {
    // bounding-sphere reject: closest approach of the segment to the box centre
    const wx = b.cx - ox,
      wy = b.cy - oy,
      wz = b.cz - oz,
      tp = Math.max(0, Math.min(len, wx * ux + wy * uy + wz * uz));
    const qx = wx - ux * tp,
      qy = wy - uy * tp,
      qz = wz - uz * tp;
    if (qx * qx + qy * qy + qz * qz > b.r * b.r) return false;
    // to box frame (three.js rotation.y = ry: local = R(-ry)·(p − c))
    const px = ox - b.cx,
      pz = oz - b.cz,
      lx = b.c * px - b.s * pz,
      lz = b.s * px + b.c * pz,
      ly = oy - b.cy;
    const dx = b.c * ux - b.s * uz,
      dz = b.s * ux + b.c * uz,
      dy = uy;
    let t0 = -1e9,
      t1 = 1e9;
    for (let k = 0; k < 3; k++) {
      const p = k === 0 ? lx : k === 1 ? ly : lz,
        dd = k === 0 ? dx : k === 1 ? dy : dz,
        h = k === 0 ? b.hx : k === 1 ? b.hy : b.hz;
      if (Math.abs(dd) < 1e-9) {
        if (p < -h || p > h) return false;
        continue;
      }
      let a = (-h - p) / dd,
        c = (h - p) / dd;
      if (a > c) {
        const tt = a;
        a = c;
        c = tt;
      }
      if (a > t0) t0 = a;
      if (c < t1) t1 = c;
      if (t0 > t1) return false;
    }
    return t0 > 0.03 && t0 < len - 0.05;
  }
  /**
   * Direction bins around a light (azimuth × elevation): each occluder goes into the bins its bounding sphere can
   * cover as seen from the light, so a shadow ray only tests the handful of occluders in its direction.
   */
  const NA = 48,
    NE = 24;
  function dirBins(l, list) {
    const bins = new Array(NA * NE),
      near = [];
    for (const b of list) {
      const dx = b.cx - l.x,
        dy = b.cy - l.y,
        dz = b.cz - l.z,
        d = Math.hypot(dx, dy, dz);
      if (d <= b.r * 1.05 + 0.05) {
        near.push(b);
        continue;
      }
      const ang = Math.asin(Math.min(1, (b.r + 0.05) / d)),
        el = Math.asin(dy / d),
        az = Math.atan2(dz, dx);
      const e0 = el - ang,
        e1 = el + ang;
      const i0 = Math.max(0, Math.floor((e0 / Math.PI + 0.5) * NE)),
        i1 = Math.min(NE - 1, Math.floor((e1 / Math.PI + 0.5) * NE));
      const cmax = Math.cos(
        Math.min(Math.PI / 2, Math.max(Math.abs(e0), Math.abs(e1))),
      );
      const fullAz = cmax < 0.2 || ang > 1.2;
      const half = fullAz
        ? Math.PI
        : Math.min(
            Math.PI,
            Math.asin(Math.min(1, Math.sin(ang) / cmax)) + 0.02,
          );
      let j0 = Math.floor(((az - half) / (2 * Math.PI) + 0.5) * NA),
        j1 = Math.floor(((az + half) / (2 * Math.PI) + 0.5) * NA);
      if (fullAz) {
        j0 = 0;
        j1 = NA - 1;
      }
      for (let i = i0; i <= i1; i++)
        for (let j = j0; j <= j1; j++) {
          const jj = ((j % NA) + NA) % NA,
            k = i * NA + jj;
          (bins[k] || (bins[k] = [])).push(b);
        }
    }
    const merged = new Array(NA * NE);
    return {
      n: list.length,
      list(ux, uy, uz) {
        const i = Math.min(
          NE - 1,
          Math.max(
            0,
            Math.floor(
              (Math.asin(Math.max(-1, Math.min(1, uy))) / Math.PI + 0.5) * NE,
            ),
          ),
        );
        const j = Math.min(
            NA - 1,
            Math.max(
              0,
              Math.floor((Math.atan2(uz, ux) / (2 * Math.PI) + 0.5) * NA),
            ),
          ),
          k = i * NA + j;
        let m = merged[k];
        if (!m)
          m = merged[k] = near.length
            ? near.concat(bins[k] || [])
            : bins[k] || [];
        return m;
      },
    };
  }
  const _pinOcc = (b, x, y, z) => {
    const px = x - b.cx,
      pz = z - b.cz,
      lx = b.c * px - b.s * pz,
      lz = b.s * px + b.c * pz;
    return (
      Math.abs(lx) <= b.hx + 0.05 &&
      Math.abs(y - b.cy) <= b.hy + 0.05 &&
      Math.abs(lz) <= b.hz + 0.05
    );
  };
  /** Bake every deferred geometry of this batch (called by build). */
  /**
   * Bake jobs: after build() merged the geometry, every baked mesh keeps a list of ranges (one per source piece,
   * with its bake multiplier). bakeStep(ms) works through them resumably, so the cells can be lit in the
   * background after init (time-sliced) — a cell the player enters is finished at once (LI.bakeCell).
   */
  Batch.prototype._bakePrep = function () {
    if (this._cand) return;
    const L = this.lights,
      occ = this.occlude ? this.occ : [];
    // per light: occluders that can intersect its sphere and do not swallow the light itself
    this._cand = L.map((l) =>
      dirBins(
        l,
        occ.filter(
          (b) =>
            Math.hypot(b.cx - l.x, b.cy - l.y, b.cz - l.z) < l.r + b.r &&
            !_pinOcc(b, l.x, l.y, l.z),
        ),
      ),
    );
    this._cache = new Map();
    this.rays = 0;
    this._ji = 0;
    this._ri = 0;
  };
  Batch.prototype._bakeRange = function (job, rg) {
    const L = this.lights,
      amb = this.amb,
      cand = this._cand,
      cache = this._cache,
      pa = job.P,
      na = job.N,
      out = job.B,
      bm = rg.mul;
    const s0 = rg.o,
      s1 = rg.o + rg.n;
    let bx0 = Infinity,
      by0 = Infinity,
      bz0 = Infinity,
      bx1 = -Infinity,
      by1 = -Infinity,
      bz1 = -Infinity;
    for (let i = s0 * 3; i < s1 * 3; i += 3) {
      const x = pa[i],
        y = pa[i + 1],
        z = pa[i + 2];
      if (x < bx0) bx0 = x;
      if (x > bx1) bx1 = x;
      if (y < by0) by0 = y;
      if (y > by1) by1 = y;
      if (z < bz0) bz0 = z;
      if (z > bz1) bz1 = z;
    }
    const LK = []; // lights whose sphere reaches this piece's bounding box
    for (let k = 0; k < L.length; k++) {
      const l = L[k],
        ex = Math.max(bx0 - l.x, 0, l.x - bx1),
        ey = Math.max(by0 - l.y, 0, l.y - by1),
        ez = Math.max(bz0 - l.z, 0, l.z - bz1);
      if (ex * ex + ey * ey + ez * ez < l.r * l.r) LK.push(k);
    }
    let rays = 0;
    for (let i = s0; i < s1; i++) {
      const x = pa[i * 3],
        y = pa[i * 3 + 1],
        z = pa[i * 3 + 2],
        nx = na[i * 3],
        ny = na[i * 3 + 1],
        nz = na[i * 3 + 2];
      let r = amb.r,
        gg = amb.g,
        b = amb.b;
      for (let kk = 0; kk < LK.length; kk++) {
        const k = LK[kk],
          l = L[k],
          dx = l.x - x,
          dy = l.y - y,
          dz = l.z - z,
          d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3,
          f = 1 - d / l.r,
          ndl = (nx * dx + ny * dy + nz * dz) / d;
        const lam = 0.16 + 0.84 * ndl;
        if (lam <= 0) continue;
        const w = f * f * l.i * lam;
        if (w < 0.008) continue;
        const cb = cand[k];
        if (cb.n && w > 0.025) {
          // faint contributions skip the shadow test
          const key =
            ((Math.imul(k + 1, 73856093) ^
              Math.imul(Math.round(x * 50), 19349663) ^
              Math.imul(Math.round(y * 50), 83492791) ^
              Math.imul(Math.round(z * 50), 2654435761 | 0)) >>>
              0) *
              8 +
            (nx > 0.5
              ? 1
              : nx < -0.5
                ? 2
                : ny > 0.5
                  ? 3
                  : ny < -0.5
                    ? 4
                    : nz > 0.5
                      ? 5
                      : 6);
          let vis = cache.get(key);
          if (vis === undefined) {
            vis = 1;
            rays++;
            const ox = x + nx * 0.06,
              oy = y + ny * 0.06,
              oz = z + nz * 0.06,
              ex = l.x - ox,
              ey = l.y - oy,
              ez = l.z - oz,
              len = Math.hypot(ex, ey, ez) || 1e-3;
            const cl = cb.list(-ex / len, -ey / len, -ez / len);
            for (let q = 0; q < cl.length; q++)
              if (
                segHitsOcc(cl[q], ox, oy, oz, ex / len, ey / len, ez / len, len)
              ) {
                vis = 0;
                break;
              }
            cache.set(key, vis);
          }
          if (!vis) continue;
        }
        r += l.c.r * w;
        gg += l.c.g * w;
        b += l.c.b * w;
      }
      const rr = r * bm,
        g2 = gg * bm,
        b2 = b * bm;
      out[i * 3] = rr < 1.8 ? rr : 1.8;
      out[i * 3 + 1] = g2 < 1.8 ? g2 : 1.8;
      out[i * 3 + 2] = b2 < 1.8 ? b2 : 1.8;
    }
    this.rays += rays;
  };
  /** Bake for up to ms milliseconds (Infinity = finish). Returns true when everything is baked. */
  Batch.prototype.bakeStep = function (ms) {
    const jobs = this.jobs;
    if (!jobs || this.baked) return true;
    const t0 = performance.now();
    try {
      this._bakePrep();
      while (this._ji < jobs.length) {
        const job = jobs[this._ji];
        while (this._ri < job.ranges.length) {
          this._bakeRange(job, job.ranges[this._ri++]);
          if (performance.now() - t0 > ms) {
            this.bakeMs = (this.bakeMs || 0) + (performance.now() - t0);
            return false;
          }
        }
        job.attr.needsUpdate = true;
        this._ji++;
        this._ri = 0;
      }
    } catch (e) {
      G.reportError("landmark_interiors:bake " + this.name, e);
    }
    this.baked = true;
    this._cache = null;
    this._cand = null;
    this.jobs = null;
    this.bakeMs = Math.round((this.bakeMs || 0) + (performance.now() - t0));
    return true;
  };
  /** Segments for a dimension under the batch's tessellation length. */
  Batch.prototype._sg = function (len) {
    return this.seg > 0
      ? Math.max(1, Math.min(48, Math.ceil(len / this.seg)))
      : 1;
  };
  /**
   * Longest-edge bisection of a non-indexed geometry until every edge ≤ maxE (custom shapes: ShapeGeometry fans,
   * lathes, extrusions) so the per-vertex bake has resolution. Interpolates every attribute. Capped at ~24k tris.
   */
  function tessellate(g, maxE) {
    const pos = g.attributes.position,
      n = pos.count;
    if (n < 3) return g;
    const pa = pos.array,
      m2 = maxE * maxE;
    let need = false,
      area = 0;
    for (let t = 0; t < n; t += 3) {
      const i = t * 3;
      const e0 =
        (pa[i] - pa[i + 3]) ** 2 +
        (pa[i + 1] - pa[i + 4]) ** 2 +
        (pa[i + 2] - pa[i + 5]) ** 2;
      const e1 =
        (pa[i + 3] - pa[i + 6]) ** 2 +
        (pa[i + 4] - pa[i + 7]) ** 2 +
        (pa[i + 5] - pa[i + 8]) ** 2;
      const e2 =
        (pa[i + 6] - pa[i]) ** 2 +
        (pa[i + 7] - pa[i + 1]) ** 2 +
        (pa[i + 8] - pa[i + 2]) ** 2;
      if (e0 > m2 || e1 > m2 || e2 > m2) need = true;
      _a.set(pa[i + 3] - pa[i], pa[i + 4] - pa[i + 1], pa[i + 5] - pa[i + 2]);
      _b.set(pa[i + 6] - pa[i], pa[i + 7] - pa[i + 1], pa[i + 8] - pa[i + 2]);
      area += _a.cross(_b).length() / 2;
    }
    if (!need) return g;
    const est = area / (m2 * 0.3);
    if (est > 24000) {
      maxE *= Math.sqrt(est / 24000);
    }
    const lim = maxE * maxE;
    const names = ["position"].concat(
        Object.keys(g.attributes).filter((k) => k !== "position"),
      ),
      srcs = names.map((k) => g.attributes[k]),
      sizes = srcs.map((a) => a.itemSize);
    const outs = names.map(() => []);
    const stack = [];
    for (let t = 0; t < n; t += 3) {
      // a triangle = array of 3 vertex records (each: array of attribute tuples)
      const tri = [0, 1, 2].map((k) =>
        srcs.map((a, ai) =>
          Array.from(
            a.array.subarray((t + k) * sizes[ai], (t + k + 1) * sizes[ai]),
          ),
        ),
      );
      stack.push(tri);
      let guard = 0;
      while (stack.length) {
        const T = stack.pop(),
          P0 = T[0][0],
          P1 = T[1][0],
          P2 = T[2][0];
        const d = (A2, B2) =>
          (A2[0] - B2[0]) ** 2 + (A2[1] - B2[1]) ** 2 + (A2[2] - B2[2]) ** 2;
        const l0 = d(P0, P1),
          l1 = d(P1, P2),
          l2 = d(P2, P0),
          mx = Math.max(l0, l1, l2);
        if (mx <= lim || ++guard > 4000) {
          for (const V of T)
            for (let ai = 0; ai < names.length; ai++) {
              const arr = outs[ai];
              for (const v of V[ai]) arr.push(v);
            }
          continue;
        }
        const e = mx === l0 ? 0 : mx === l1 ? 1 : 2,
          A2 = T[e],
          B2 = T[(e + 1) % 3],
          Cv = T[(e + 2) % 3];
        const M = A2.map((attr, ai) => attr.map((v, k) => (v + B2[ai][k]) / 2));
        const ni = names.indexOf("normal");
        if (ni >= 0) {
          const q = M[ni],
            L2 = Math.hypot(q[0], q[1], q[2]) || 1;
          q[0] /= L2;
          q[1] /= L2;
          q[2] /= L2;
        }
        stack.push([A2, M, Cv], [M, B2, Cv]);
      }
    }
    const out = new THREE.BufferGeometry();
    names.forEach((k, ai) =>
      out.setAttribute(
        k,
        new THREE.BufferAttribute(new Float32Array(outs[ai]), sizes[ai]),
      ),
    );
    g.dispose();
    return out;
  }
  const M4 = (x, y, z, ry, rx, rz, sx, sy, sz) =>
    new THREE.Matrix4().compose(
      new THREE.Vector3(x || 0, y || 0, z || 0),
      new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rx || 0, ry || 0, rz || 0, "YXZ"),
      ),
      new THREE.Vector3(
        sx === undefined ? 1 : sx,
        sy === undefined ? (sx === undefined ? 1 : sx) : sy,
        sz === undefined ? (sx === undefined ? 1 : sx) : sz,
      ),
    );
  LI.M4 = M4;
  /** Axis-aligned box by min/max corners. */
  Batch.prototype.box = function (key, x0, y0, z0, x1, y1, z1, o) {
    const w = Math.abs(x1 - x0),
      h = Math.abs(y1 - y0),
      d = Math.abs(z1 - z0);
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return null;
    const cx = (x0 + x1) / 2,
      cy = (y0 + y1) / 2,
      cz = (z0 + z1) / 2;
    return this.add(
      key,
      new THREE.BoxGeometry(w, h, d, this._sg(w), this._sg(h), this._sg(d)),
      Object.assign({}, o, {
        m: M4(cx, cy, cz),
        _box: { cx, cy, cz, sx: w, sy: h, sz: d, ry: 0 },
      }),
    );
  };
  /** Oriented box: centre (cx, cy, cz), size, yaw (three.js rotation.y), o.rx/o.rz. */
  Batch.prototype.obox = function (key, cx, cy, cz, sx, sy, sz, ry, o) {
    o = o || {};
    const tilt = !!(o.rx || o.rz);
    return this.add(
      key,
      new THREE.BoxGeometry(
        sx,
        sy,
        sz,
        this._sg(sx),
        this._sg(sy),
        this._sg(sz),
      ),
      Object.assign({}, o, {
        m: M4(cx, cy, cz, ry || 0, o.rx, o.rz),
        _box: tilt ? null : { cx, cy, cz, sx, sy, sz, ry: ry || 0 },
      }),
    );
  };
  /** Cylinder with its base at y0. o: {rx, rz, ry, open, t0, tl, hs} */
  Batch.prototype.cyl = function (key, x, y0, z, rt, rb, h, seg, o) {
    o = o || {};
    const g = new THREE.CylinderGeometry(
      rt,
      rb,
      h,
      seg || 12,
      o.hs || this._sg(h),
      !!o.open,
      o.t0 || 0,
      o.tl === undefined ? TAU : o.tl,
    );
    g.translate(0, h / 2, 0);
    return this.add(
      key,
      g,
      Object.assign({}, o, { m: M4(x, y0, z, o.ry, o.rx, o.rz) }),
    );
  };
  Batch.prototype.sphere = function (key, x, y, z, r, o) {
    o = o || {};
    const g = new THREE.SphereGeometry(
      r,
      o.ws || 12,
      o.hs || 8,
      0,
      TAU,
      o.p0 || 0,
      o.pl === undefined ? Math.PI : o.pl,
    );
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        m: M4(x, y, z, o.ry, o.rx, o.rz, o.sx || 1, o.sy || 1, o.sz || 1),
      }),
    );
  };
  Batch.prototype.torus = function (key, x, y, z, R, r, o) {
    o = o || {};
    const g = new THREE.TorusGeometry(
      R,
      r,
      o.rs || 6,
      o.ts || 24,
      o.arc === undefined ? TAU : o.arc,
    );
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        m: M4(
          x,
          y,
          z,
          o.ry,
          o.rx === undefined ? Math.PI / 2 : o.rx,
          o.rz,
          o.sx || 1,
          o.sy || 1,
          o.sz || 1,
        ),
      }),
    );
  };
  Batch.prototype.lathe = function (key, pts, seg, x, y, z, o) {
    o = o || {};
    const g = new THREE.LatheGeometry(
      pts.map((p) => new THREE.Vector2(p[0], p[1])),
      seg || 16,
      o.p0 || 0,
      o.pl === undefined ? TAU : o.pl,
    );
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        m: M4(x, y, z, o.ry, o.rx, o.rz, o.sx || 1, o.sy || 1, o.sz || 1),
      }),
    );
  };
  /** Flat textured quad facing +Z before rotation (ry). Centre (cx,cy,cz). o.uvRect for atlas cells. */
  Batch.prototype.quad = function (key, cx, cy, cz, w, h, ry, o) {
    o = o || {};
    const g = new THREE.PlaneGeometry(w, h, this._sg(w), this._sg(h));
    // double: a back copy that reads the right way round, 3 mm behind (with a DoubleSide material the front copy's
    // mirrored back face used to z-fight it — banners read 'AIROTCIV DA' from behind)
    if (o.double) {
      const g2 = g.clone();
      g2.rotateY(Math.PI);
      g2.translate(0, 0, -0.003);
      this.add(
        key,
        g2,
        Object.assign({}, o, {
          keepUV: true,
          m: M4(cx, cy, cz, ry || 0, o.rx, o.rz),
        }),
      );
    }
    return this.add(
      key,
      g,
      Object.assign({}, o, {
        keepUV: true,
        m: M4(cx, cy, cz, ry || 0, o.rx, o.rz),
      }),
    );
  };
  /** Horizontal quad (floor decal / rug / map) at height y, facing up. */
  Batch.prototype.flat = function (key, cx, y, cz, w, d, ry, o) {
    o = o || {};
    const g = new THREE.PlaneGeometry(w, d, this._sg(w), this._sg(d));
    g.rotateX(-Math.PI / 2);
    return this.add(
      key,
      g,
      Object.assign({ noAO: true }, o, {
        keepUV: keepUV(key) || o.keepUV,
        m: M4(cx, y, cz, ry || 0),
      }),
    );
  };
  /** Box beam between two points (w wide, h tall cross-section). */
  Batch.prototype.beam = function (key, a, b, w, h, o) {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      dz = b[2] - a[2],
      L = Math.hypot(dx, dy, dz);
    if (L < 1e-4) return null;
    const g = new THREE.BoxGeometry(w, h === undefined ? w : h, L);
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(dx, dy, dz),
      Math.abs(dy / L) > 0.99
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0),
    );
    m.setPosition((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    return this.add(key, g, Object.assign({}, o, { m }));
  };
  /** Round rod between two points. */
  Batch.prototype.rod = function (key, a, b, r, o) {
    const dx = b[0] - a[0],
      dy = b[1] - a[1],
      dz = b[2] - a[2],
      L = Math.hypot(dx, dy, dz);
    if (L < 1e-4) return null;
    const g = new THREE.CylinderGeometry(r, r, L, (o && o.seg) || 6, 1, true);
    g.rotateX(Math.PI / 2);
    const m = new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(dx, dy, dz),
      Math.abs(dy / L) > 0.99
        ? new THREE.Vector3(1, 0, 0)
        : new THREE.Vector3(0, 1, 0),
    );
    m.setPosition((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
    return this.add(key, g, Object.assign({}, o, { m }));
  };
  /** Extruded 2D shape (pts in XY) with depth along Z, then transformed. */
  Batch.prototype.extrude = function (key, pts, depth, o) {
    o = o || {};
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
    sh.closePath();
    if (o.holes)
      for (const hp of o.holes) {
        const p = new THREE.Path();
        p.moveTo(hp[0][0], hp[0][1]);
        for (let i = 1; i < hp.length; i++) p.lineTo(hp[i][0], hp[i][1]);
        p.closePath();
        sh.holes.push(p);
      }
    const g = new THREE.ExtrudeGeometry(sh, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curve || 8,
    });
    return this.add(
      key,
      g,
      Object.assign({}, o, { m: o.m || M4(o.x, o.y, o.z, o.ry, o.rx, o.rz) }),
    );
  };
  /** Merge everything into one mesh per material under parent. */
  Batch.prototype.build = function (parent, opts) {
    opts = opts || {};
    const out = new THREE.Group();
    out.name = "li_" + this.name;
    const jobs = [];
    for (const [key, list] of this.parts) {
      const baked = list.some((g) => g.userData.liBake);
      let total = 0;
      for (const g of list) total += g.attributes.position.count;
      const P = new Float32Array(total * 3),
        N = new Float32Array(total * 3),
        U = new Float32Array(total * 2),
        C = new Float32Array(total * 3),
        B = baked ? new Float32Array(total * 3) : null;
      let o = 0;
      const ranges = [];
      for (const g of list) {
        const n = g.attributes.position.count;
        P.set(g.attributes.position.array.subarray(0, n * 3), o * 3);
        N.set(g.attributes.normal.array.subarray(0, n * 3), o * 3);
        U.set(g.attributes.uv.array.subarray(0, n * 2), o * 2);
        C.set(g.attributes.color.array.subarray(0, n * 3), o * 3);
        if (B && g.userData.liBake) {
          const last = ranges[ranges.length - 1];
          if (
            last &&
            last.mul === g.userData.liBake &&
            last.o + last.n === o &&
            last.n + n < 900
          )
            last.n += n; // merge tiny pieces
          else
            for (let k = 0; k < n; k += 1500)
              ranges.push({
                o: o + k,
                n: Math.min(1500, n - k),
                mul: g.userData.liBake,
              }); // big pieces (tessellated floors) split so a time slice never overruns
        }
        o += n;
        g.dispose();
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(P, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(N, 3));
      geo.setAttribute("uv", new THREE.BufferAttribute(U, 2));
      geo.setAttribute("color", new THREE.BufferAttribute(C, 3));
      if (B) {
        const BA = new THREE.BufferAttribute(B, 3);
        geo.setAttribute("bake", BA);
        if (ranges.length) jobs.push({ attr: BA, P, N, B, ranges });
      }
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
      const mesh = new THREE.Mesh(geo, LI.mat(key, !!B));
      mesh.castShadow = !!opts.cast;
      mesh.receiveShadow = !!opts.receive;
      mesh.name = "li:" + key;
      if (mesh.material.transparent) mesh.renderOrder = 2;
      out.add(mesh);
    }
    this.parts.clear();
    parent.add(out);
    this.jobs = jobs;
    this.baked = false;
    if (!opts.deferBake) this.bakeStep(Infinity);
    return out;
  };

  /**
   * World anchor published by the landmark that owns the facade (landmarks_a/b build first), e.g. the Woolworth's
   * Broadway portal `door`. Returns {x,y,z,yaw} or the fallback, so doors follow the exterior when a site is refitted.
   */
  LI.siteAnchor = function (siteId, name, fb) {
    try {
      const e = G.landmarks && G.landmarks[siteId];
      const a = e && e.anchors && e.anchors[name];
      if (a && isFinite(a.x) && isFinite(a.z))
        return { x: a.x, y: a.y || 0, z: a.z, yaw: a.yaw || 0, w: a.w, h: a.h };
    } catch (e) {
      /* landmark module absent */
    }
    return fb;
  };
  // =====================================================================
  // Cell: an interior (or a world-space group of additions)
  // =====================================================================
  /**
   * LI.cell(key, {world:true}) — key = LAYOUT.INTERIORS key. Local coordinates are relative to the cell origin
   * (world additions use origin 0,0,0).
   */
  LI.cell = function (key, opts) {
    opts = opts || {};
    const L = G.LAYOUT;
    const def = opts.world ? null : L.INTERIORS[key];
    const O = def ? def.origin : { x: 0, y: 0, z: 0 };
    const root = new THREE.Group();
    root.name = "li_cell_" + key;
    root.position.set(O.x, O.y || 0, O.z);
    G.scene.add(root);
    const C = {
      key,
      O,
      def,
      root,
      world: !!opts.world,
      anchors: {},
      props: [],
      pickups: [],
      doors: [],
      colliders: [],
      glows: [],
      b: new Batch(key),
      batches: [],
      /** world position of a local point */
      W: (x, y, z) => new THREE.Vector3(O.x + x, (O.y || 0) + y, O.z + z),
    };
    /** Axis-aligned collider (local coords). */
    C.col = function (x0, y0, z0, x1, y1, z1, o) {
      const c = G.world.addBox(
        O.x + Math.min(x0, x1),
        (O.y || 0) + Math.min(y0, y1),
        O.z + Math.min(z0, z1),
        O.x + Math.max(x0, x1),
        (O.y || 0) + Math.max(y0, y1),
        O.z + Math.max(z0, z1),
        Object.assign({ tag: "li", surface: "concrete" }, o || {}),
      );
      C.colliders.push(c);
      return c;
    };
    /** Rotated collider, ry = three.js rotation.y of the box. */
    C.colRot = function (cx, cz, w, d, y0, y1, ry, o) {
      const c = G.world.addCollider(
        O.x + cx,
        O.z + cz,
        w,
        d,
        (O.y || 0) + y0,
        (O.y || 0) + y1,
        -(ry || 0),
        Object.assign({ tag: "li", surface: "concrete" }, o || {}),
      );
      C.colliders.push(c);
      return c;
    };
    /** Named anchor (local coords) → stored as a world Vector3 with .yaw. */
    C.anchor = function (name, x, y, z, yaw) {
      const v = C.W(x, y, z);
      v.yaw = yaw || 0;
      C.anchors[name] = v;
      return v;
    };
    /** Prop spawned at initDone (persistent world prop). */
    C.prop = function (type, x, y, z, yaw, o) {
      C.props.push({ type, x, y, z, yaw: yaw || 0, o: o || {} });
    };
    /** Static world pickup spawned at initDone (after item defs). */
    C.pickup = function (id, n, x, y, z, yaw) {
      C.pickups.push({ id, n: n || 1, x, y, z, yaw: yaw || 0 });
    };
    /** Glow sprite (created at initDone through G.fx / atmos fixtures). */
    C.glow = function (x, y, z, color, size, o) {
      C.glows.push({ x, y, z, color, size: size || 1, o: o || {} });
    };
    /** Door (world coords are computed from local unless o.worldPos). */
    C.door = function (def) {
      C.doors.push(def);
      return def;
    };
    C.finish = function () {
      const dress = LI.dress && LI.dress[key];
      if (dress) {
        try {
          dress(C);
        } catch (e) {
          G.reportError("landmark_interiors:dress " + key, e);
        }
      }
      const defer = !!(LI.deferBake && !opts.world);
      const g = C.b.build(root, { deferBake: defer });
      for (const b of C.batches) b.build(root, { deferBake: defer });
      if (LI._buildAtmos) LI._buildAtmos(C);
      // world dressing is small but always in the scene: distance-cull it (draw calls in the busy street views)
      if (opts.world && opts.lod !== false) {
        try {
          const bb = new THREE.Box3().setFromObject(g);
          if (!bb.isEmpty())
            G.world.addLOD(
              g,
              opts.lod || 160,
              bb.getCenter(new THREE.Vector3()),
            );
        } catch (e) {
          /* core without LODs */
        }
      }
      return g;
    };
    if (opts.world) {
      C.b.seg = 0;
      C.b.occlude = false;
    }
    if (!opts.world) LI.cells.push(C);
    else LI.worldCells = (LI.worldCells || []).concat([C]);
    return C;
  };

  /** Finish (ms = Infinity) or advance the deferred bake of a cell. Returns true when the cell is fully lit. */
  LI.bakeCell = function (C, ms) {
    let done = true;
    for (const b of [C.b].concat(C.batches || [])) {
      if (!b.bakeStep(ms === undefined ? Infinity : ms)) {
        done = false;
        break;
      }
    }
    return done;
  };

  // =====================================================================
  // Architecture helpers (operate on a Cell; local coords)
  // =====================================================================
  const A = (LI.arch = {});
  /**
   * Wall along X (z fixed) or along Z (x fixed) with door/window gaps.
   * A.wall(C, key, {x0,x1,z} | {z0,z1,x}, y0, y1, t, gaps:[{a,b,top (y of lintel), sill?}], o:{col:true, trim, lining})
   */
  A.wall = function (C, key, line, y0, y1, t, gaps, o) {
    o = o || {};
    const b = o.batch || C.b;
    const alongX = line.x0 !== undefined;
    const a0 = alongX ? line.x0 : line.z0,
      a1 = alongX ? line.x1 : line.z1,
      fixed = alongX ? line.z : line.x;
    const segs = [];
    let cur = a0;
    const gs = (gaps || []).slice().sort((p, q) => p.a - q.a);
    for (const g of gs) {
      if (g.a > cur) segs.push([cur, g.a, y0, y1]);
      const top = g.top === undefined ? y0 + 2.4 : g.top;
      if (top < y1) segs.push([g.a, g.b, top, y1]);
      if (g.sill !== undefined && g.sill > y0)
        segs.push([g.a, g.b, y0, g.sill]);
      cur = g.b;
    }
    if (cur < a1) segs.push([cur, a1, y0, y1]);
    for (const s of segs) {
      if (s[1] - s[0] < 0.01 || s[3] - s[2] < 0.01) continue;
      if (alongX)
        b.box(key, s[0], s[2], fixed - t / 2, s[1], s[3], fixed + t / 2, o);
      else b.box(key, fixed - t / 2, s[2], s[0], fixed + t / 2, s[3], s[1], o);
      if (o.col !== false) {
        if (alongX)
          C.col(s[0], s[2], fixed - t / 2, s[1], s[3], fixed + t / 2, {
            walkable: false,
            surface: o.surface,
          });
        else
          C.col(fixed - t / 2, s[2], s[0], fixed + t / 2, s[3], s[1], {
            walkable: false,
            surface: o.surface,
          });
      }
    }
    // door casings
    if (o.casing)
      for (const g of gs) {
        const top = g.top === undefined ? y0 + 2.4 : g.top,
          ck = o.casing,
          cw = 0.14,
          cd = t + 0.08;
        if (alongX) {
          b.box(
            ck,
            g.a - cw,
            y0,
            fixed - cd / 2,
            g.a,
            top + cw,
            fixed + cd / 2,
          );
          b.box(
            ck,
            g.b,
            y0,
            fixed - cd / 2,
            g.b + cw,
            top + cw,
            fixed + cd / 2,
          );
          b.box(
            ck,
            g.a - cw,
            top,
            fixed - cd / 2,
            g.b + cw,
            top + cw,
            fixed + cd / 2,
          );
        } else {
          b.box(
            ck,
            fixed - cd / 2,
            y0,
            g.a - cw,
            fixed + cd / 2,
            top + cw,
            g.a,
          );
          b.box(
            ck,
            fixed - cd / 2,
            y0,
            g.b,
            fixed + cd / 2,
            top + cw,
            g.b + cw,
          );
          b.box(
            ck,
            fixed - cd / 2,
            top,
            g.a - cw,
            fixed + cd / 2,
            top + cw,
            g.b + cw,
          );
        }
      }
  };
  /**
   * Wall between two arbitrary points p→q (XZ) with gaps measured along it: [{a,b,top,sill}] (metres from p).
   * The wall is centred on the line; o.off shifts it along the left normal.
   */
  A.wallLine = function (C, key, p, q, y0, y1, t, gaps, o) {
    o = o || {};
    const b = o.batch || C.b;
    const dx = q[0] - p[0],
      dz = q[1] - p[1],
      L = Math.hypot(dx, dz),
      ux = dx / L,
      uz = dz / L,
      ry = Math.atan2(-dz, dx);
    const nx = -uz,
      nz = ux,
      off = o.off || 0; // left normal
    const segs = [];
    let cur = 0;
    for (const g of (gaps || []).slice().sort((m, n) => m.a - n.a)) {
      if (g.a > cur) segs.push([cur, g.a, y0, y1]);
      const top = g.top === undefined ? y0 + 2.4 : g.top;
      if (top < y1) segs.push([g.a, g.b, top, y1]);
      if (g.sill !== undefined && g.sill > y0)
        segs.push([g.a, g.b, y0, g.sill]);
      cur = g.b;
    }
    if (cur < L) segs.push([cur, L, y0, y1]);
    for (const s of segs) {
      const len = s[1] - s[0],
        hh = s[3] - s[2];
      if (len < 0.01 || hh < 0.01) continue;
      const m = (s[0] + s[1]) / 2,
        cx = p[0] + ux * m + nx * off,
        cz = p[1] + uz * m + nz * off;
      b.obox(key, cx, (s[2] + s[3]) / 2, cz, len, hh, t, ry, o);
      if (o.col !== false)
        C.colRot(cx, cz, len, t, s[2], s[3], ry, {
          walkable: false,
          surface: o.surface,
        });
    }
  };
  /** Local frame: origin (ox,oz), unit u (ux,uz); v = left-hand normal (−uz? no: (−uz, ux)) unless flip. */
  A.frame = function (ox, oz, ux, uz, flip) {
    const L = Math.hypot(ux, uz);
    ux /= L;
    uz /= L;
    const vx = flip ? uz : -uz,
      vz = flip ? -ux : ux;
    const ry = Math.atan2(-uz, ux);
    return {
      ry,
      ux,
      uz,
      vx,
      vz,
      p: (u, v) => [ox + ux * u + vx * v, oz + uz * u + vz * v],
      /** oriented box by frame ranges u0..u1, v0..v1, y0..y1 */
      box(C, key, u0, u1, v0, v1, y0, y1, o) {
        const c = this.p((u0 + u1) / 2, (v0 + v1) / 2);
        ((o && o.batch) || C.b).obox(
          key,
          c[0],
          (y0 + y1) / 2,
          c[1],
          Math.abs(u1 - u0),
          Math.abs(y1 - y0),
          Math.abs(v1 - v0),
          ry,
          o,
        );
      },
      col(C, u0, u1, v0, v1, y0, y1, o) {
        const c = this.p((u0 + u1) / 2, (v0 + v1) / 2);
        return C.colRot(
          c[0],
          c[1],
          Math.abs(u1 - u0),
          Math.abs(v1 - v0),
          y0,
          y1,
          ry,
          o,
        );
      },
    };
  };
  /** Floor slab with walkable collider: top at y. */
  A.floor = function (C, key, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = o.batch || C.b;
    const th = o.th || 0.3;
    b.box(key, x0, y - th, z0, x1, y, z1, Object.assign({ noAO: true }, o));
    if (o.col !== false)
      C.col(x0, o.solid ? 0 : y - th, z0, x1, y, z1, {
        surface: o.surface || "concrete",
      });
  };
  /** Ceiling slab (visual only unless o.col). Bottom at y. */
  A.ceil = function (C, key, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.box(
      key,
      x0,
      y,
      z0,
      x1,
      y + (o.th || 0.3),
      z1,
      Object.assign({ noAO: true }, o),
    );
    if (o.col) C.col(x0, y, z0, x1, y + (o.th || 0.3), z1, { walkable: false });
  };
  /**
   * Straight stair. (x,z) = centre of the bottom edge; dir: 'n' (−z) | 's' | 'e' | 'w'; w = width; from y0 to y1.
   * Rise ≤ o.rise (0.22). Colliders per step (solid). Returns {x, z, y, run} of the top edge centre.
   */
  A.stairs = function (C, key, x, z, dir, w, y0, y1, o) {
    o = o || {};
    const b = o.batch || C.b;
    const H = y1 - y0,
      n = Math.max(1, Math.ceil(Math.abs(H) / (o.rise || 0.22))),
      rise = H / n,
      tread = o.tread || 0.3;
    const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0,
      dz = dir === "s" ? 1 : dir === "n" ? -1 : 0;
    for (let i = 0; i < n; i++) {
      const top = y0 + rise * (i + 1),
        d0 = i * tread,
        d1 = (i + 1) * tread;
      const bot = o.thin ? Math.max(y0, top - 0.35) : y0;
      let x0, x1, z0, z1;
      if (dx) {
        x0 = x + dx * d0;
        x1 = x + dx * d1;
        z0 = z - w / 2;
        z1 = z + w / 2;
      } else {
        z0 = z + dz * d0;
        z1 = z + dz * d1;
        x0 = x - w / 2;
        x1 = x + w / 2;
      }
      b.box(
        key,
        Math.min(x0, x1),
        bot,
        Math.min(z0, z1),
        Math.max(x0, x1),
        top,
        Math.max(z0, z1),
        o,
      );
      if (o.nose) {
        // bullnose / tread edge
        if (dx)
          b.box(
            o.nose,
            dx > 0 ? x0 - 0.02 : x1 - 0.03,
            top - 0.04,
            z0,
            dx > 0 ? x0 + 0.03 : x1 + 0.02,
            top + 0.01,
            z1,
            { noAO: true },
          );
        else
          b.box(
            o.nose,
            x0,
            top - 0.04,
            dz > 0 ? z0 - 0.02 : z1 - 0.03,
            x1,
            top + 0.01,
            dz > 0 ? z0 + 0.03 : z1 + 0.02,
            { noAO: true },
          );
      }
      C.col(
        Math.min(x0, x1),
        y0,
        Math.min(z0, z1),
        Math.max(x0, x1),
        top,
        Math.max(z0, z1),
        { surface: o.surface || "concrete" },
      );
    }
    return {
      x: x + dx * n * tread,
      z: z + dz * n * tread,
      y: y1,
      run: n * tread,
    };
  };
  /** Railing along a polyline at base height y (h tall). Collider (not walkable). */
  A.rail = function (C, key, pts, y, h, o) {
    o = o || {};
    const b = o.batch || C.b;
    h = h || 1.0;
    for (let i = 0; i < pts.length - 1; i++) {
      const p = pts[i],
        q = pts[i + 1],
        L = Math.hypot(q[0] - p[0], q[1] - p[1]);
      b.beam(
        key,
        [p[0], y + h, p[1]],
        [q[0], y + h, q[1]],
        o.top || 0.07,
        o.top || 0.07,
      );
      if (o.mid !== false)
        b.beam(
          key,
          [p[0], y + h * 0.5, p[1]],
          [q[0], y + h * 0.5, q[1]],
          0.035,
          0.035,
        );
      const n = Math.max(1, Math.round(L / (o.step || 1.2)));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        b.box(
          key,
          p[0] + (q[0] - p[0]) * t - 0.025,
          y,
          p[1] + (q[1] - p[1]) * t - 0.025,
          p[0] + (q[0] - p[0]) * t + 0.025,
          y + h,
          p[1] + (q[1] - p[1]) * t + 0.025,
        );
      }
      if (o.col !== false)
        C.colRot(
          (p[0] + q[0]) / 2,
          (p[1] + q[1]) / 2,
          L,
          0.15,
          y,
          y + h,
          Math.atan2(-(q[1] - p[1]), q[0] - p[0]),
          { walkable: false, surface: "metal" },
        );
    }
  };
  /** Balustrade (turned balusters) along a line. */
  A.balustrade = function (C, key, p, q, y, h, o) {
    o = o || {};
    const b = o.batch || C.b;
    h = h || 1.0;
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]),
      ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]);
    const cx = (p[0] + q[0]) / 2,
      cz = (p[1] + q[1]) / 2;
    b.obox(key, cx, y + h - 0.08, cz, L, 0.16, 0.3, ry);
    b.obox(key, cx, y + 0.06, cz, L, 0.12, 0.26, ry);
    const n = Math.max(2, Math.round(L / 0.32));
    for (let k = 1; k < n; k++) {
      const t = k / n;
      b.lathe(
        key,
        [
          [0, 0],
          [0.07, 0.02],
          [0.05, 0.2],
          [0.09, 0.42],
          [0.04, 0.62],
          [0.06, h - 0.3],
          [0, h - 0.28],
        ],
        6,
        p[0] + (q[0] - p[0]) * t,
        y + 0.12,
        p[1] + (q[1] - p[1]) * t,
      );
    }
    if (o.col !== false)
      C.colRot(cx, cz, L, 0.3, y, y + h, ry, { walkable: false });
  };
  /** Classical column: base, shaft (fluted look via 16-sided), capital. */
  A.column = function (C, key, x, y0, z, h, r, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.box(
      key,
      x - r * 1.35,
      y0,
      z - r * 1.35,
      x + r * 1.35,
      y0 + 0.25,
      z + r * 1.35,
    );
    b.cyl(key, x, y0 + 0.25, z, r * 1.15, r * 1.25, 0.2, 16);
    b.cyl(o.shaft || key, x, y0 + 0.45, z, r * 0.88, r, h - 1.0, 16);
    if (o.ionic) {
      b.cyl(key, x, y0 + h - 0.55, z, r * 1.1, r * 0.9, 0.25, 16);
      b.box(
        key,
        x - r * 1.5,
        y0 + h - 0.35,
        z - r * 1.1,
        x + r * 1.5,
        y0 + h - 0.15,
        z + r * 1.1,
      );
      for (const s of [-1, 1])
        b.cyl(
          key,
          x + s * r * 1.35,
          y0 + h - 0.5,
          z - r * 1.15,
          0.16,
          0.16,
          r * 2.3,
          10,
          { rx: Math.PI / 2 },
        );
    } else
      b.lathe(
        key,
        [
          [r * 0.9, 0],
          [r * 1.35, 0.35],
          [r * 1.5, 0.45],
          [0, 0.45],
        ],
        16,
        x,
        y0 + h - 0.55,
        z,
      );
    b.box(
      key,
      x - r * 1.5,
      y0 + h - 0.12,
      z - r * 1.5,
      x + r * 1.5,
      y0 + h,
      z + r * 1.5,
    );
    if (o.col !== false)
      C.col(x - r, y0, z - r, x + r, y0 + h, z + r, { walkable: false });
    if (r >= 0.18 && h >= 2.4 && b.occlude)
      b.occluder(
        x - r * 0.8,
        y0 + 0.3,
        z - r * 0.8,
        x + r * 0.8,
        y0 + h - 0.3,
        z + r * 0.8,
      ); // columns shadow the baked light
  };
  /** Semicircular arch (extruded ring) spanning w at (cx, springY), depth d, facing axis 'x' (opening along x) or 'z'. */
  A.arch = function (C, key, cx, springY, cz, w, d, thick, axis, o) {
    o = o || {};
    const b = o.batch || C.b;
    const R = w / 2,
      n = 12,
      pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI * i) / n;
      pts.push([Math.cos(a) * (R + thick), Math.sin(a) * (R + thick)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (Math.PI * i) / n;
      pts.push([Math.cos(a) * R, Math.sin(a) * R]);
    }
    const ry = axis === "z" ? Math.PI / 2 : 0;
    const m = M4(cx, springY, cz, ry).multiply(
      new THREE.Matrix4().makeTranslation(0, 0, -d / 2),
    );
    b.extrude(key, pts, d, { m });
  };
  /** Pendant lamp: cord, shade, glowing bulb; adds a baked light. */
  A.pendant = function (C, x, y, z, ceilY, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.rod(o.cord || "iron", [x, y + 0.3, z], [x, ceilY, z], 0.012);
    b.lathe(
      o.shade || "brass",
      [
        [0.05, 0.3],
        [0.08, 0.26],
        [0.3, 0.02],
        [0.32, 0],
      ],
      10,
      x,
      y,
      z,
    );
    b.sphere(o.bulb || "lamp", x, y + 0.02, z, 0.1, { ws: 8, hs: 6 });
    if (o.light !== false)
      b.light(
        x,
        y - 0.3,
        z,
        o.color === undefined ? 0xffd8a0 : o.color,
        o.r || 9,
        o.i || 1,
      );
  };
  /** Wall sconce facing direction yaw (ry = three.js rotation of the fixture; +z faces out). */
  A.sconce = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    const s = Math.sin(ry),
      c = Math.cos(ry);
    b.obox(o.metal || "brass", x, y, z, 0.18, 0.3, 0.06, ry);
    b.lathe(
      o.metal || "brass",
      [
        [0.02, 0],
        [0.14, 0.22],
        [0.15, 0.24],
        [0, 0.24],
      ],
      8,
      x + s * 0.14,
      y,
      z + c * 0.14,
    );
    b.sphere(o.bulb || "lamp", x + s * 0.14, y + 0.2, z + c * 0.14, 0.07, {
      ws: 6,
      hs: 5,
    });
    if (o.light !== false)
      b.light(
        x + s * 0.5,
        y + 0.2,
        z + c * 0.5,
        o.color === undefined ? 0xffcf90 : o.color,
        o.r || 6,
        o.i || 0.7,
      );
  };
  /** Fluorescent tube fixture (ceiling-hung), along x (ry rotates). dead → dark tube. */
  A.tube = function (C, x, y, z, ry, len, o) {
    o = o || {};
    const b = o.batch || C.b;
    len = len || 1.3;
    b.obox("metal_painted", x, y + 0.06, z, len + 0.1, 0.08, 0.28, ry, {
      c: 0xd8d8d0,
    });
    b.obox(
      o.dead ? "glass_dark" : o.color || "lamp_cool",
      x,
      y - 0.01,
      z,
      len,
      0.05,
      0.08,
      ry,
    );
    if (!o.dead && o.light !== false)
      b.light(
        x,
        y - 0.4,
        z,
        o.lc === undefined ? 0xe0f0ff : o.lc,
        o.r || 8,
        o.i || 0.9,
      );
  };
  /** Chandelier: tiers of candle bulbs. */
  A.chandelier = function (C, x, y, z, ceilY, R, o) {
    o = o || {};
    const b = o.batch || C.b;
    R = R || 0.9;
    b.rod("brass", [x, y + 0.6, z], [x, ceilY, z], 0.02);
    b.lathe(
      "brass",
      [
        [0, 0],
        [0.12, 0.05],
        [0.18, 0.3],
        [0.08, 0.6],
        [0.03, 0.62],
      ],
      8,
      x,
      y,
      z,
    );
    for (const [rr, yy, n] of [
      [R, 0.25, 10],
      [R * 0.6, 0.5, 6],
    ]) {
      b.torus("brass", x, y + yy, z, rr, 0.02, { ts: 20 });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU;
        b.sphere(
          o.bulb || "lamp",
          x + Math.cos(a) * rr,
          y + yy + 0.08,
          z + Math.sin(a) * rr,
          0.045,
          { ws: 5, hs: 4 },
        );
      }
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU;
      b.rod(
        "glass",
        [x + Math.cos(a) * R, y + 0.2, z + Math.sin(a) * R],
        [
          x + Math.cos(a) * R * 0.95,
          y - 0.35 - (i % 3) * 0.1,
          z + Math.sin(a) * R * 0.95,
        ],
        0.012,
        { seg: 4 },
      );
    }
    if (o.light !== false)
      b.light(
        x,
        y - 0.2,
        z,
        o.color === undefined ? 0xffdca8 : o.color,
        o.r || 12,
        o.i || 1.1,
      );
  };

  // =====================================================================
  // Furniture kit (visual; colliders where it matters)
  // =====================================================================
  const F = (LI.furn = {});
  const rot = (x, z, cx, cz, ry) => {
    const s = Math.sin(ry),
      c = Math.cos(ry);
    return [cx + x * c + z * s, cz - x * s + z * c];
  };
  LI.rot = rot;
  F.chair = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark";
    if (o.toppled) {
      b.obox(k, x, y + 0.22, z, 0.46, 0.05, 0.46, ry, {
        rx: Math.PI / 2 - 0.2,
      });
      b.obox(k, x, y + 0.05, z + 0.2, 0.46, 0.5, 0.05, ry, { rx: 0.1 });
      return;
    }
    b.obox(k, x, y + 0.45, z, 0.46, 0.05, 0.46, ry);
    const back = rot(0, 0.21, x, z, ry);
    b.obox(k, back[0], y + 0.72, back[1], 0.46, 0.5, 0.05, ry);
    for (const [lx, lz] of [
      [-0.2, -0.2],
      [0.2, -0.2],
      [-0.2, 0.2],
      [0.2, 0.2],
    ]) {
      const p = rot(lx, lz, x, z, ry);
      b.box(
        k,
        p[0] - 0.025,
        y,
        p[1] - 0.025,
        p[0] + 0.025,
        y + 0.45,
        p[1] + 0.025,
      );
    }
    if (o.seat) {
      b.obox(o.seat, x, y + 0.49, z, 0.44, 0.05, 0.42, ry);
      b.obox(o.seat, back[0], y + 0.74, back[1] - 0.01, 0.42, 0.4, 0.04, ry);
    }
  };
  F.table = function (C, x, y, z, w, d, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark",
      h = o.h || 0.76;
    b.obox(k, x, y + h - 0.03, z, w, 0.06, d, ry);
    for (const [lx, lz] of [
      [-w / 2 + 0.06, -d / 2 + 0.06],
      [w / 2 - 0.06, -d / 2 + 0.06],
      [-w / 2 + 0.06, d / 2 - 0.06],
      [w / 2 - 0.06, d / 2 - 0.06],
    ]) {
      const p = rot(lx, lz, x, z, ry);
      b.box(
        k,
        p[0] - 0.03,
        y,
        p[1] - 0.03,
        p[0] + 0.03,
        y + h - 0.06,
        p[1] + 0.03,
      );
    }
    if (o.col !== false)
      C.colRot(x, z, w, d, y, y + h, ry, { walkable: false, surface: "wood" });
  };
  F.desk = function (C, x, y, z, w, d, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark";
    b.obox(k, x, y + 0.74, z, w + 0.04, 0.05, d + 0.04, ry);
    for (const s of [-1, 1]) {
      const p = rot(s * (w / 2 - 0.22), 0, x, z, ry);
      b.obox(k, p[0], y + 0.36, p[1], 0.42, 0.72, d, ry);
    }
    const mp = rot(0, d / 2 - 0.03, x, z, ry);
    b.obox(k, mp[0], y + 0.45, mp[1], w - 0.9, 0.5, 0.03, ry);
    if (o.col !== false)
      C.colRot(x, z, w, d, y, y + 0.77, ry, {
        walkable: false,
        surface: "wood",
      });
  };
  /** CRT monitor (screen glowing) on a surface at y. */
  F.monitor = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.obox(o.key || "metal_painted", x, y + 0.2, z, 0.42, 0.38, 0.4, ry, {
      c: o.c || 0xc8c0a8,
    });
    const f = rot(0, -0.205, x, z, ry);
    b.quad(
      o.dead ? "glass_dark" : "screen",
      f[0],
      y + 0.21,
      f[1],
      0.3,
      0.24,
      ry + Math.PI,
    );
  };
  /** Bookshelf with books. ry: the shelf's front faces +z rotated by ry. */
  F.bookshelf = function (C, x, y, z, w, h, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "wood_dark",
      d = 0.38;
    const r = LI.rng(o.seed || (x * 13 + z * 7) | 0);
    b.obox(k, x, y + h / 2, z, w, h, 0.04, ry); // back (centre plane)
    for (const s of [-1, 1]) {
      const p = rot((s * w) / 2, d / 2, x, z, ry);
      b.obox(k, p[0], y + h / 2, p[1], 0.04, h, d, ry);
    }
    const shelves = Math.max(2, Math.round(h / 0.4));
    const books = [
      "paper",
      "leather",
      "fabric_red",
      "fabric_blue",
      "fabric_green",
      "cardboard",
    ];
    for (let i = 0; i <= shelves; i++) {
      const yy = y + (i * (h - 0.04)) / shelves;
      const p = rot(0, d / 2, x, z, ry);
      b.obox(k, p[0], yy + 0.02, p[1], w, 0.04, d, ry);
      if (i === shelves || (o.empty && r() < 0.7)) continue;
      let t = -w / 2 + 0.05;
      while (t < w / 2 - 0.08) {
        const bw = 0.03 + r() * 0.05,
          bh = 0.2 + r() * 0.14;
        if (r() < (o.gaps || 0.18)) {
          t += bw * 2;
          continue;
        }
        const lean = r() < 0.1 ? 0.3 : 0;
        const q = rot(t + bw / 2, d / 2 + 0.02, x, z, ry);
        b.obox(
          books[(r() * books.length) | 0],
          q[0],
          yy + 0.04 + bh / 2,
          q[1],
          bw,
          bh,
          0.24,
          ry,
          { rz: lean, grime: 0.3 },
        );
        t += bw + 0.005;
      }
    }
    if (o.col !== false) {
      const p = rot(0, d / 2, x, z, ry);
      C.colRot(p[0], p[1], w, d, y, y + h, ry, {
        walkable: false,
        surface: "wood",
      });
    }
  };
  /** Low sofa / settee. */
  F.sofa = function (C, x, y, z, w, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      k = o.key || "leather";
    b.obox(k, x, y + 0.25, z, w, 0.25, 0.85, ry);
    const bk = rot(0, 0.35, x, z, ry);
    b.obox(k, bk[0], y + 0.55, bk[1], w, 0.55, 0.2, ry);
    for (const s of [-1, 1]) {
      const p = rot(s * (w / 2 - 0.1), 0, x, z, ry);
      b.obox(k, p[0], y + 0.45, p[1], 0.2, 0.4, 0.85, ry);
    }
    b.obox("wood_dark", x, y + 0.06, z, w, 0.12, 0.8, ry);
    if (o.col !== false)
      C.colRot(x, z, w, 0.85, y, y + 0.6, ry, {
        walkable: false,
        surface: "wood",
      });
  };
  /** Scattered paper sheets. */
  F.papers = function (C, x, y, z, R, n, seed, o) {
    const b = (o && o.batch) || C.b,
      r = LI.rng(seed || 5);
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * R;
      b.flat(
        "paper",
        x + Math.cos(a) * d,
        y + 0.005 + r() * 0.01,
        z + Math.sin(a) * d,
        0.21 + r() * 0.1,
        0.28 + r() * 0.08,
        r() * TAU,
        { c: 0.75 + r() * 0.25 > 0.9 ? 0xe8e0c8 : 0xc8bca0 },
      );
    }
  };
  /** Rubble mound + chunks (walkable low heap, collider optional). */
  F.rubble = function (C, x, y, z, R, seed, o) {
    o = o || {};
    const b = o.batch || C.b,
      r = LI.rng(seed || 9);
    const g = new THREE.SphereGeometry(R, 10, 6, 0, TAU, 0, Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const yy = p.getY(i);
      p.setY(
        i,
        yy *
          (o.h || 0.45) *
          (0.8 + 0.4 * vnoise(p.getX(i) * 2 + seed, p.getZ(i) * 2)),
      );
      p.setX(i, p.getX(i) * (0.9 + 0.2 * r()));
    }
    b.add(o.key || "rubble", g, { m: M4(x, y, z, r() * TAU) });
    for (let i = 0; i < (o.n || 8); i++) {
      const a = r() * TAU,
        d = r() * R * 1.1;
      b.obox(
        r() < 0.5 ? "concrete" : o.chunk || "plaster",
        x + Math.cos(a) * d,
        y + 0.1 + r() * 0.15,
        z + Math.sin(a) * d,
        0.2 + r() * 0.5,
        0.12 + r() * 0.25,
        0.2 + r() * 0.4,
        r() * TAU,
        { rx: r() * 0.6, rz: r() * 0.6 },
      );
    }
    if (o.rebar !== false)
      for (let i = 0; i < 3; i++) {
        const a = r() * TAU;
        b.rod(
          "rust",
          [x + Math.cos(a) * R * 0.3, y + 0.2, z + Math.sin(a) * R * 0.3],
          [
            x + Math.cos(a) * R * (0.6 + r() * 0.6),
            y + 0.6 + r() * 0.9,
            z + Math.sin(a) * R * (0.6 + r() * 0.6),
          ],
          0.015,
        );
      }
    if (o.col)
      C.col(
        x - R * 0.6,
        y,
        z - R * 0.6,
        x + R * 0.6,
        y + (o.h || 0.45) * R * 0.7,
        z + R * 0.6,
        { surface: "rubble" },
      );
  };
  /** Crate stack (visual + collider). */
  F.crates = function (C, x, y, z, n, ry, o) {
    o = o || {};
    const b = o.batch || C.b,
      r = LI.rng(o.seed || (x * 31 + z * 17) | 0);
    for (let i = 0; i < n; i++) {
      const lx = (i % 2) * 0.95 - 0.45,
        ly = Math.floor(i / 2) * 0.75,
        p = rot(lx, (r() - 0.5) * 0.1, x, z, ry);
      b.obox(
        o.key || "wood",
        p[0],
        y + ly + 0.36,
        p[1],
        0.9,
        0.72,
        0.8,
        ry + (r() - 0.5) * 0.2,
      );
    }
    C.colRot(x, z, 1.9, 0.9, y, y + Math.ceil(n / 2) * 0.75, ry, {
      walkable: true,
      surface: "wood",
    });
  };
  /** Sandbag wall run between two points (visual + collider). */
  F.sandbags = function (C, p, q, y, rows, o) {
    o = o || {};
    const b = o.batch || C.b;
    rows = rows || 3;
    const L = Math.hypot(q[0] - p[0], q[1] - p[1]),
      ry = Math.atan2(-(q[1] - p[1]), q[0] - p[0]),
      n = Math.max(1, Math.round(L / 0.62));
    for (let rI = 0; rI < rows; rI++)
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5 + (rI % 2) * 0.5) / n;
        if (t > 1) continue;
        b.sphere(
          o.key || "fabric",
          p[0] + (q[0] - p[0]) * t,
          y + 0.13 + rI * 0.24,
          p[1] + (q[1] - p[1]) * t,
          0.33,
          { ws: 7, hs: 4, sx: 1, sy: 0.4, sz: 0.62, ry, c: 0x9a8a6a },
        );
      }
    C.colRot(
      (p[0] + q[0]) / 2,
      (p[1] + q[1]) / 2,
      L,
      0.6,
      y,
      y + rows * 0.24 + 0.1,
      ry,
      { surface: "dirt", tag: "cover" },
    );
  };
  /** Wall-mounted framed picture using a texture key (uvRect optional). Faces +z rotated by ry. */
  F.frame = function (C, key, x, y, z, w, h, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.obox(o.frame || "gold", x, y, z, w + 0.16, h + 0.16, 0.05, ry);
    const f = rot(0, 0.03, x, z, ry);
    b.quad(key, f[0], y, f[1], w, h, ry, { uvRect: o.uvRect, rz: o.tilt || 0 });
  };
  /** Human skeleton visual (lying) when props is absent; otherwise props spawns one (see C.prop). */
  F.bones = function (C, x, y, z, ry, o) {
    o = o || {};
    const b = o.batch || C.b;
    b.sphere("bone", x, y + 0.1, z, 0.11, { ws: 8, hs: 6, sy: 1.1 });
    const p = rot(0, 0.5, x, z, ry);
    b.beam("bone", [x, y + 0.08, z], [p[0], y + 0.08, p[1]], 0.05, 0.05);
    for (let i = 0; i < 5; i++) {
      const q = rot(0, 0.2 + i * 0.07, x, z, ry);
      b.torus("bone", q[0], y + 0.1, q[1], 0.12, 0.012, {
        ts: 10,
        rs: 4,
        ry,
        rx: 0,
      });
    }
  };

  /**
   * Floor clutter (lived-in wreckage): papers, crumpled sheets, tin cans, bottles, plaster chunks,
   * splintered planks and soggy boxes, merged into the cell batch (no extra draw calls). Pieces are only placed
   * where the cell's colliders say there is bare floor at height y (never inside walls/furniture, never floating),
   * and they gather against walls and furniture like real debris. rect in local coords.
   * o: {n=60, seed, edge=0.8 (edge bias), mix:{paper,crumple,can,bottle,chunk,plank,box} weights, chunkKey}
   */
  function inPoly(pl, x, z) {
    let c = false;
    for (let i = 0, j = pl.length - 1; i < pl.length; j = i++) {
      const a = pl[i],
        b2 = pl[j];
      if (
        a[1] > z !== b2[1] > z &&
        x < ((b2[0] - a[0]) * (z - a[1])) / (b2[1] - a[1]) + a[0]
      )
        c = !c;
    }
    return c;
  }
  LI.inPoly = inPoly;
  F.clutter = function (C, x0, z0, x1, z1, y, o) {
    o = o || {};
    const b = o.batch || C.b,
      r = LI.rng(o.seed || (x0 * 13 + z1 * 7 + y * 3) | 0 || 17),
      W = G.world;
    const mix = Object.assign(
      {
        paper: 5,
        crumple: 2,
        can: 2,
        bottle: 1.2,
        chunk: 2.5,
        plank: 0.8,
        box: 0.6,
      },
      o.mix || {},
    );
    const kinds = Object.keys(mix),
      tot = kinds.reduce((a, k) => a + mix[k], 0);
    const n = o.n || 60,
      edge = o.edge === undefined ? 0.8 : o.edge;
    const wx = (lx) => C.O.x + lx,
      wz = (lz) => C.O.z + lz,
      wy = (ly) => (C.O.y || 0) + ly;
    const yLo = y,
      yTop = o.yMax === undefined ? y : o.yMax;
    const blocked = (X, Z, pad, ly) => {
      const cs = W.query(X - pad, Z - pad, X + pad, Z + pad);
      for (const c of cs)
        if (
          !c.walkable &&
          c.minY < wy(ly) + 0.35 &&
          c.maxY > wy(ly) + 0.03 &&
          W.pointInCollider(c, X, Z, pad)
        )
          return true;
      return false;
    };
    let placed = 0;
    for (let tries = 0; tries < n * 6 && placed < n; tries++) {
      const lx = x0 + r() * (x1 - x0),
        lz = z0 + r() * (z1 - z0),
        X = wx(lx),
        Z = wz(lz);
      if (!W.query || !W.groundHeight) break;
      if (o.poly && !inPoly(o.poly, lx, lz)) continue;
      if (o.test && !o.test(lx, lz)) continue;
      const gh = W.groundHeight(X, Z, wy(yTop) + 0.25, 0.05);
      if (gh < wy(yLo) - 0.06 || gh > wy(yTop) + 0.06) continue;
      const y = gh - (C.O.y || 0);
      if (blocked(X, Z, 0.18, y)) continue;
      if (edge > 0 && !blocked(X, Z, 1.3, y) && r() < edge) continue; // prefer the foot of walls & furniture
      placed++;
      let pick = r() * tot,
        kind = kinds[0];
      for (const k of kinds) {
        pick -= mix[k];
        if (pick <= 0) {
          kind = k;
          break;
        }
      }
      const a = r() * TAU;
      switch (kind) {
        case "paper":
          b.flat(
            "paper",
            lx,
            y + 0.006 + r() * 0.01,
            lz,
            0.21 + r() * 0.08,
            0.28 + r() * 0.06,
            a,
            { c: r() < 0.5 ? 0xe0d8c0 : 0xb8ac90 },
          );
          break;
        case "crumple":
          b.sphere("paper", lx, y + 0.04, lz, 0.05 + r() * 0.03, {
            ws: 5,
            hs: 4,
            sy: 0.8,
            rx: r(),
            rz: r(),
            c: 0xd8d0b8,
          });
          break;
        case "can":
          if (r() < 0.7)
            b.cyl("steel", lx, y + 0.033, lz, 0.033, 0.033, 0.12, 8, {
              rz: Math.PI / 2,
              ry: a,
              c: r() < 0.5 ? 0xb0a080 : 0x9a6a4a,
            });
          else
            b.cyl("steel", lx, y, lz, 0.033, 0.033, 0.12, 8, { c: 0xa89070 });
          break;
        case "bottle": {
          const lying = r() < 0.75,
            key = r() < 0.6 ? "glass_dark" : "chrome";
          if (lying) {
            b.cyl(key, lx, y + 0.035, lz, 0.035, 0.035, 0.2, 8, {
              rz: Math.PI / 2,
              ry: a,
            });
          } else {
            b.cyl(key, lx, y, lz, 0.035, 0.035, 0.16, 8);
            b.cyl(key, lx, y + 0.16, lz, 0.012, 0.03, 0.08, 6);
          }
          break;
        }
        case "chunk": {
          const sz = 0.08 + r() * r() * 0.3;
          b.obox(
            o.chunkKey || (r() < 0.6 ? "plaster" : "concrete"),
            lx,
            y + sz * 0.3,
            lz,
            sz * (1 + r()),
            sz * 0.6,
            sz * (0.8 + r() * 0.6),
            a,
            { rx: (r() - 0.5) * 0.5, rz: (r() - 0.5) * 0.5 },
          );
          if (r() < 0.5)
            for (let k = 0; k < 3; k++)
              b.obox(
                "plaster",
                lx + (r() - 0.5) * 0.5,
                y + 0.015,
                lz + (r() - 0.5) * 0.5,
                0.04 + r() * 0.05,
                0.03,
                0.04 + r() * 0.05,
                r() * TAU,
              );
          break;
        }
        case "plank":
          b.obox(
            "wood_rotten",
            lx,
            y + 0.03,
            lz,
            0.9 + r() * 0.8,
            0.03,
            0.09 + r() * 0.06,
            a,
            { rz: (r() - 0.5) * 0.12 },
          );
          break;
        case "box": {
          const w = 0.25 + r() * 0.2;
          b.obox("cardboard", lx, y + w * 0.35, lz, w, w * 0.7, w * 0.8, a, {
            rz: (r() - 0.5) * 0.3,
            c: 0xa89070,
          });
          break;
        }
      }
    }
    return placed;
  };

  // =====================================================================
  // Atmosphere: god-ray light shafts + floating dust (one mesh each per cell)
  // =====================================================================
  let shaftMat = null,
    dustMat = null;
  const dustUniform = { value: 0 };
  function getShaftMat() {
    if (shaftMat) return shaftMat;
    const tex = LI.canvasTex(
      "li_shaft",
      64,
      128,
      (x, W, H) => {
        const g = x.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.3, "rgba(255,255,255,0.8)");
        g.addColorStop(0.5, "rgba(255,255,255,1)");
        g.addColorStop(0.7, "rgba(255,255,255,0.8)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
        x.globalCompositeOperation = "destination-in";
        const v = x.createLinearGradient(0, 0, 0, H);
        v.addColorStop(0, "rgba(0,0,0,0.0)");
        v.addColorStop(0.08, "rgba(0,0,0,1)");
        v.addColorStop(0.55, "rgba(0,0,0,0.55)");
        v.addColorStop(1, "rgba(0,0,0,0)");
        x.fillStyle = v;
        x.fillRect(0, 0, W, H);
      },
      { clamp: true },
    );
    shaftMat = new THREE.MeshBasicMaterial({
      map: tex,
      vertexColors: true,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
      toneMapped: false,
    });
    shaftMat.userData = { shared: true, liKey: "shaft" };
    return shaftMat;
  }
  /**
   * A soft beam of light (window / oculus / hole in the roof) from p (local, at the opening) along dir, len metres,
   * widening from w0 to w1. Three crossed soft quads so it reads from any angle. color = beam tint × strength.
   */
  A.shaft = function (C, p, dir, len, w0, w1, color, strength) {
    C.shafts = C.shafts || [];
    C.shafts.push({
      p,
      dir,
      len,
      w0,
      w1,
      c: new THREE.Color(color === undefined ? 0xfff0d0 : color).multiplyScalar(
        strength === undefined ? 0.12 : strength,
      ),
    });
  };
  function buildShafts(C) {
    if (!C.shafts || !C.shafts.length) return;
    const P = [],
      U = [],
      Cc = [],
      idx = [];
    const d = new THREE.Vector3(),
      s1 = new THREE.Vector3(),
      s2 = new THREE.Vector3(),
      up = new THREE.Vector3(0, 1, 0);
    for (const sh of C.shafts) {
      d.set(sh.dir[0], sh.dir[1], sh.dir[2]).normalize();
      s1.crossVectors(
        d,
        Math.abs(d.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : up,
      ).normalize();
      s2.crossVectors(d, s1).normalize();
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI,
          side = s1
            .clone()
            .multiplyScalar(Math.cos(a))
            .addScaledVector(s2, Math.sin(a));
        const base = P.length / 3;
        for (const [t, u] of [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ]) {
          const w = ((t ? sh.w1 : sh.w0) / 2) * (u ? 1 : -1);
          P.push(
            sh.p[0] + d.x * sh.len * t + side.x * w,
            sh.p[1] + d.y * sh.len * t + side.y * w,
            sh.p[2] + d.z * sh.len * t + side.z * w,
          );
          U.push(u, 1 - t);
          Cc.push(sh.c.r, sh.c.g, sh.c.b);
        }
        idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    g.setAttribute("color", new THREE.Float32BufferAttribute(Cc, 3));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, getShaftMat());
    m.name = "li_shafts";
    m.renderOrder = 3;
    m.frustumCulled = true;
    C.root.add(m);
    C.shaftMesh = m;
  }
  function getDustMat() {
    if (dustMat) return dustMat;
    const tex = LI.canvasTex(
      "li_mote",
      32,
      32,
      (x, W, H) => {
        const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.4, "rgba(255,255,255,0.35)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g;
        x.fillRect(0, 0, W, H);
      },
      { clamp: true },
    );
    dustMat = new THREE.PointsMaterial({
      map: tex,
      color: 0xfff0d8,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: true,
    });
    dustMat.onBeforeCompile = function (sh) {
      sh.uniforms.uLiT = dustUniform;
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uLiT;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nfloat ph = position.x * 1.7 + position.z * 2.3 + position.y * 0.9;\ntransformed += vec3(sin(uLiT * 0.13 + ph) * 0.35, sin(uLiT * 0.07 + ph * 1.3) * 0.25, cos(uLiT * 0.11 + ph * 0.7) * 0.35);",
        );
    };
    dustMat.customProgramCacheKey = () => "li_dust1";
    dustMat.userData = { shared: true, liKey: "dust" };
    return dustMat;
  }
  LI.dustTick = (t) => {
    dustUniform.value = t;
  };
  /**
   * Window shafts follow the real sky: bright warm-white at midday, amber and long at dawn/dusk, a faint cold
   * moonlight at night; overcast/rain/dust thin them out and rad weather (none currently) tints them green. Dust motes follow.
   */
  const _sc = new THREE.Color(),
    _sw = new THREE.Color(0xfff2dc),
    _sa = new THREE.Color(0xffa860),
    _sm = new THREE.Color(0x7890c0);
  LI.shaftTick = function () {
    if (!shaftMat && !dustMat && !LI.skyCards.length) return;
    let sy = 0.6,
      sunMul = 1,
      storm = 0,
      tint = null;
    try {
      const A2 = G.atmos && !G.atmos.__stub ? G.atmos._ : null;
      if (A2 && A2.env) sy = A2.env.sunDir.y;
    } catch (e) {
      /* */
    }
    try {
      const wp =
        !G.isStub("atmos") && G.atmos.getWeatherParams
          ? G.atmos.getWeatherParams()
          : null;
      if (wp) {
        sunMul = wp.sunMul === undefined ? 1 : wp.sunMul;
        storm = wp.rad || 0;
        tint = wp.fogTint;
      }
    } catch (e) {
      /* */
    }
    const day = LI.smooth(-0.04, 0.22, sy),
      warm = 1 - LI.smooth(0.08, 0.45, sy);
    _sc
      .copy(_sw)
      .lerp(_sa, warm)
      .multiplyScalar(
        day * Math.pow(Math.max(0.05, sunMul), 0.85) * (1 + warm * 0.25),
      );
    _sc.r += _sm.r * 0.2 * (1 - day);
    _sc.g += _sm.g * 0.2 * (1 - day);
    _sc.b += _sm.b * 0.2 * (1 - day);
    if (storm > 0 && tint)
      _sc.lerp(tint.clone().multiplyScalar(day * 0.9 + 0.1), storm * 0.55);
    if (shaftMat) shaftMat.color.copy(_sc);
    // window panoramas: bright hazy day, orange dusk, near-dark blue night with the lit windows still reading
    for (const k of LI.skyCards) {
      const m = matCache[k];
      if (!m) continue;
      m.emissiveIntensity =
        0.1 + 0.72 * day * Math.pow(Math.max(0.1, sunMul), 0.6);
      m.color.setRGB(
        0.35 + 0.65 * day,
        0.38 + 0.6 * day - warm * 0.12 * day,
        0.5 + 0.5 * day - warm * 0.25 * day,
      );
      if (storm > 0 && tint) m.color.lerp(tint, storm * 0.35);
      if (m.emissive) m.emissive.copy(m.color);
    }
    if (dustMat) dustMat.opacity = 0.18 + 0.4 * Math.min(1, day * sunMul + 0.1);
  };
  /** Floating dust motes inside a local box (n points). */
  A.dust = function (C, x0, y0, z0, x1, y1, z1, n) {
    C.dustBoxes = C.dustBoxes || [];
    C.dustBoxes.push([x0, y0, z0, x1, y1, z1, n || 150]);
  };
  function buildDust(C) {
    if (!C.dustBoxes || !C.dustBoxes.length) return;
    const r = LI.rng("dust" + C.key),
      P = [];
    for (const [x0, y0, z0, x1, y1, z1, n] of C.dustBoxes)
      for (let i = 0; i < n; i++)
        P.push(
          x0 + r() * (x1 - x0),
          y0 + r() * (y1 - y0),
          z0 + r() * (z1 - z0),
        );
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.computeBoundingSphere();
    g.boundingSphere.radius += 1;
    const pts = new THREE.Points(g, getDustMat());
    pts.name = "li_dust";
    pts.renderOrder = 3;
    C.root.add(pts);
  }
  LI._buildAtmos = function (C) {
    try {
      buildShafts(C);
    } catch (e) {
      G.reportError("landmark_interiors:shafts " + C.key, e);
    }
    try {
      buildDust(C);
    } catch (e) {
      G.reportError("landmark_interiors:dust " + C.key, e);
    }
  };

  // =====================================================================
  // Street doorway kit (world cells): door-local frame + a readable entrance
  // =====================================================================
  /** Door-local frame from a facade point and the yaw of someone standing in FRONT of the door looking away from it
   *  (street doors: looking out into the street; room-side exits: looking into the room): p(u, v), v = metres toward that viewer. */
  LI.doorFrame = function (x, z, yawOut) {
    return A.frame(x, z, Math.cos(yawOut), -Math.sin(yawOut), true);
  };
  /** Painted glimpse of a lit room behind an open door (warm or cool), used as the "inside" of street doorways. */
  LI.voidTex = function (id, o) {
    o = o || {};
    return LI.texMat(
      id,
      LI.canvasTex(
        id,
        128,
        256,
        (x, W, H) => {
          const g = x.createLinearGradient(0, 0, 0, H);
          g.addColorStop(0, o.top || "#0c0a08");
          g.addColorStop(0.6, o.mid || "#16120c");
          g.addColorStop(1, o.floor || "#2e2416");
          x.fillStyle = g;
          x.fillRect(0, 0, W, H);
          const l = x.createRadialGradient(
            W * 0.5,
            H * 0.35,
            2,
            W * 0.5,
            H * 0.4,
            W * 0.7,
          );
          l.addColorStop(0, o.glow || "rgba(255,200,120,0.55)");
          l.addColorStop(1, "rgba(0,0,0,0)");
          x.fillStyle = l;
          x.fillRect(0, 0, W, H);
          x.fillStyle = "rgba(0,0,0,0.5)";
          x.fillRect(0, 0, W * 0.12, H);
          x.fillRect(W * 0.88, 0, W * 0.12, H); // reveals
          if (o.figure) {
            x.fillStyle = "rgba(10,10,10,0.8)";
            x.fillRect(W * 0.62, H * 0.52, W * 0.1, H * 0.36);
            x.beginPath();
            x.arc(W * 0.67, H * 0.49, W * 0.05, 0, TAU);
            x.fill();
          }
        },
        { clamp: true },
      ),
      { rough: 0.95, emissive: o.emissive === undefined ? 0.45 : o.emissive },
    );
  };
  /**
   * A street doorway on a facade: bronze/steel frame, two leaves with glass lights (one ajar showing a lit glimpse
   * of the inside), threshold, a lamp over the door (real light pool at night via the fixture pool), optional sign.
   * Wc = world cell, Fr = LI.doorFrame(...), fy = ground y. o: {w, h, frame, leaf, glass, ajar (±1 = which leaf),
   * voidK, lamp:'deco'|'cage'|false, lampColor, sign:{key, w, h}}. No colliders across the opening.
   */
  LI.doorway = function (Wc, Fr, fy, o) {
    o = o || {};
    const b = Wc.b,
      w = o.w || 2.4,
      h = o.h || 3.0,
      fk = o.frame || "bronze",
      lk = o.leaf || fk,
      nb = { noBake: true },
      ry = Fr.ry;
    const bx = (key, u0, u1, y0, y1, v0, v1, e) =>
      Fr.box(
        Wc,
        key,
        u0,
        u1,
        v0,
        v1,
        fy + y0,
        fy + y1,
        Object.assign({}, nb, e || {}),
      );
    bx(fk, -w / 2 - 0.22, -w / 2, 0, h + 0.22, -0.05, 0.16);
    bx(fk, w / 2, w / 2 + 0.22, 0, h + 0.22, -0.05, 0.16); // jambs
    bx(fk, -w / 2 - 0.22, w / 2 + 0.22, h, h + 0.22, -0.05, 0.16); // head
    bx(
      o.sill || "granite_black",
      -w / 2 - 0.3,
      w / 2 + 0.3,
      0,
      0.05,
      -0.05,
      0.55,
    ); // threshold
    if (o.voidK) {
      const c = Fr.p(0, -0.02);
      b.quad(o.voidK, c[0], fy + h / 2, c[1], w, h, ry + Math.PI, {
        noBake: true,
        noAO: true,
      });
    }
    const lw = w / 2 - 0.02,
      aj = o.ajar || 0;
    if (o.single) {
      // one leaf: panelled, wired-glass light, knob
      bx(lk, -w / 2 + 0.01, w / 2 - 0.01, 0.02, h - 0.02, -0.02, 0.04);
      if (o.glass !== false)
        bx(
          o.glass || "glass_dark",
          -w / 2 + 0.22,
          w / 2 - 0.22,
          h * 0.58,
          h - 0.3,
          0.04,
          0.05,
        );
      for (const yy of [0.25, h * 0.3])
        bx(fk, -w / 2 + 0.16, w / 2 - 0.16, yy, yy + h * 0.2, 0.04, 0.055);
      bx("brass", w / 2 - 0.2, w / 2 - 0.12, 1.0, 1.08, 0.04, 0.12);
    }
    for (const s of o.single ? [] : [-1, 1]) {
      const cu = (s * w) / 4;
      if (aj === s) {
        const hu = (s * w) / 2,
          a = 0.9,
          c = Fr.p(
            hu - (s * Math.cos(a) * lw) / 2,
            0.02 + (Math.sin(a) * lw) / 2,
          );
        b.obox(lk, c[0], fy + h / 2, c[1], lw, h - 0.04, 0.06, ry - s * a, nb);
        continue;
      }
      bx(lk, cu - lw / 2, cu + lw / 2, 0.02, h - 0.02, -0.02, 0.04);
      if (o.glass !== false)
        bx(
          o.glass || "glass_dark",
          cu - lw / 2 + 0.14,
          cu + lw / 2 - 0.14,
          h * 0.35,
          h - 0.25,
          0.04,
          0.05,
        );
      bx(
        "brass",
        cu - s * (lw / 2 - 0.12) - 0.025,
        cu - s * (lw / 2 - 0.12) + 0.025,
        0.95,
        1.4,
        0.05,
        0.11,
      );
    }
    if (o.lamp !== false) {
      const lc = o.lampColor === undefined ? 0xffd8a0 : o.lampColor,
        c = Fr.p(0, 0.35);
      if (o.lamp === "cage") {
        b.cyl("rust", c[0], fy + h + 0.28, c[1], 0.1, 0.12, 0.08, 8, nb);
        b.cyl("lamp_amber", c[0], fy + h + 0.36, c[1], 0.08, 0.09, 0.2, 8, nb);
        b.cyl("rust", c[0], fy + h + 0.56, c[1], 0.05, 0.1, 0.06, 8, nb);
      } else {
        bx(fk, -0.35, 0.35, h + 0.3, h + 0.36, 0, 0.45);
        bx("lamp", -0.28, 0.28, h + 0.27, h + 0.3, 0.08, 0.4);
      }
      Wc.glow(c[0], fy + h + 0.25, c[1], lc, 0.8, {
        fixture: true,
        intensity: 1.2,
        range: 8,
        dayFactor: 0.25,
      });
    }
    if (o.sign) {
      const c = Fr.p(0, 0.18);
      b.quad(
        o.sign.key,
        c[0],
        fy + h + (o.sign.y || 0.75),
        c[1],
        o.sign.w || w,
        o.sign.h || 0.45,
        ry + Math.PI,
        nb,
      );
    }
  };

  // =====================================================================
  // Shared skyline panorama (window cards: Rainbow Room ring, Woolworth crown lancets, …)
  // =====================================================================
  LI.skyCards = LI.skyCards || [];
  /**
   * Painted ruined-Manhattan panorama with atmospheric depth: haze-lit far towers, mid towers with broken tops,
   * near towers with window grids and a few lit windows, rivers/park bands, cloud streaks, landmark silhouettes.
   * opts: {W, H, seed, horizon (0..1), kind:'city'|'harbor'|'bridge', water:[[u0,u1],…], park:[[u0,u1],…],
   *        marks:[{u, kind:'esb'|'chrysler'|'spire'|'liberty'|'bridge'}]}. The material is registered as a sky card:
   * its glow follows the time of day and weather (LI.shaftTick).
   */
  LI.skylineMat = function (id, opts) {
    opts = opts || {};
    const Wd = opts.W || 2048,
      Hd = opts.H || 512,
      HZ = opts.horizon || 0.74,
      kind = opts.kind || "city";
    const key = LI.texMat(
      id,
      LI.canvasTex(
        id,
        Wd,
        Hd,
        (x, W, H) => {
          const r = LI.rng(opts.seed || 7),
            hy = H * HZ;
          const sky = x.createLinearGradient(0, 0, 0, hy);
          sky.addColorStop(0, "#46584a");
          sky.addColorStop(0.5, "#8e9270");
          sky.addColorStop(0.86, "#cfc08a");
          sky.addColorStop(1, "#e2cc92");
          x.fillStyle = sky;
          x.fillRect(0, 0, W, hy + 2);
          x.globalAlpha = 0.18;
          x.fillStyle = "#eee4c0"; // cloud streaks
          for (let i = 0; i < 26; i++) {
            x.beginPath();
            x.ellipse(
              r() * W,
              hy * (0.12 + r() * 0.55),
              80 + r() * 260,
              5 + r() * 14,
              0,
              0,
              TAU,
            );
            x.fill();
          }
          x.globalAlpha = 0.14;
          x.fillStyle = "#2e3a30";
          for (let i = 0; i < 12; i++) {
            x.beginPath();
            x.ellipse(
              r() * W,
              hy * (0.08 + r() * 0.3),
              120 + r() * 300,
              8 + r() * 16,
              0,
              0,
              TAU,
            );
            x.fill();
          }
          x.globalAlpha = 1;
          const ground = x.createLinearGradient(0, hy, 0, H);
          ground.addColorStop(0, "#6a6450");
          ground.addColorStop(1, "#2a2820");
          x.fillStyle = ground;
          x.fillRect(0, hy, W, H - hy);
          const inBands = (u, list) =>
            (list || []).some((b2) => u >= b2[0] && u <= b2[1]);
          for (const b2 of opts.water || []) {
            const g = x.createLinearGradient(0, hy - 4, 0, H);
            g.addColorStop(0, "#9aa08a");
            g.addColorStop(0.2, "#4c5a52");
            g.addColorStop(1, "#232a26");
            x.fillStyle = g;
            x.fillRect(b2[0] * W, hy - 3, (b2[1] - b2[0]) * W, H - hy + 3);
          }
          for (const b2 of opts.park || []) {
            x.fillStyle = "#4e5436";
            x.fillRect(b2[0] * W, hy - 6, (b2[1] - b2[0]) * W, 10);
            for (let i = 0; i < 40; i++) {
              x.fillStyle = r() < 0.5 ? "#3c4228" : "#5a5a38";
              x.beginPath();
              x.arc(
                W * (b2[0] + r() * (b2[1] - b2[0])),
                hy - 6 + r() * 4,
                3 + r() * 6,
                0,
                TAU,
              );
              x.fill();
            }
          }
          const HAZE = [226, 204, 146];
          const mix = (c, k) =>
            "rgb(" +
            c.map((v, i) => Math.round(v + (HAZE[i] - v) * k)).join(",") +
            ")";
          // one tower: box with optional broken top, setbacks, window grid, rooftop water tank / antenna
          const tower = (cx, w, h, base, col, haze, o) => {
            const y0 = base - h;
            x.fillStyle = mix(col, haze);
            if (o.broken) {
              x.beginPath();
              x.moveTo(cx - w / 2, base);
              x.lineTo(cx - w / 2, y0 + h * 0.12);
              const n = 5;
              for (let i = 1; i < n; i++)
                x.lineTo(cx - w / 2 + (w * i) / n, y0 + h * (0.02 + r() * 0.3));
              x.lineTo(cx + w / 2, y0 + h * 0.2);
              x.lineTo(cx + w / 2, base);
              x.closePath();
              x.fill();
            } else {
              x.fillRect(cx - w / 2, y0, w, h);
              if (o.setback) {
                x.fillRect(
                  cx - w * 0.33,
                  y0 - h * 0.12,
                  w * 0.66,
                  h * 0.12 + 1,
                );
                x.fillRect(cx - w * 0.18, y0 - h * 0.2, w * 0.36, h * 0.08 + 1);
              }
              if (o.tank) {
                x.fillRect(cx + w * 0.1, y0 - 9, 8, 7);
                x.fillRect(cx + w * 0.1 + 1, y0 - 2, 1, 3);
                x.fillRect(cx + w * 0.1 + 6, y0 - 2, 1, 3);
              }
              if (o.mast) x.fillRect(cx - 1, y0 - h * 0.25, 2, h * 0.25);
            }
            if (o.windows && haze < 0.5) {
              // window grid
              const cw = Math.max(3, w / 9),
                ch = Math.max(4, cw * 1.3);
              for (let yy = y0 + ch; yy < base - ch; yy += ch)
                for (
                  let xx = cx - w / 2 + cw * 0.6;
                  xx < cx + w / 2 - cw * 0.6;
                  xx += cw
                ) {
                  const q = r();
                  x.fillStyle =
                    q < 0.015
                      ? "rgba(255,200,110,0.85)"
                      : q < 0.3
                        ? "rgba(0,0,0,0.35)"
                        : "rgba(200,190,150," + (0.08 + haze * 0.1) + ")";
                  x.fillRect(xx, yy, cw * 0.5, ch * 0.45);
                }
            }
          };
          const layer = (n, hMin, hMax, wMin, wMax, col, haze, opt) => {
            for (let i = 0; i < n; i++) {
              const u = r();
              if (inBands(u, opts.water) || inBands(u, opts.park)) continue;
              if (kind === "harbor" && u < 0.5) continue;
              const w = wMin + r() * (wMax - wMin),
                h = ((hMin + r() * (hMax - hMin)) * H) / 512;
              tower(u * W, (w * W) / 2048, h, hy + 2, col, haze, {
                broken: r() < opt.broken,
                setback: r() < 0.2,
                tank: r() < 0.3,
                mast: r() < 0.08,
                windows: opt.windows,
              });
            }
          };
          layer(160, 20, 70, 12, 34, [120, 122, 104], 0.62, { broken: 0.15 });
          layer(110, 40, 130, 18, 50, [80, 82, 70], 0.38, {
            broken: 0.3,
            windows: true,
          });
          // landmarks (same depth as the mid layer so they read against the haze)
          for (const m of opts.marks || []) {
            const cx = m.u * W,
              s2 = H / 512,
              c = mix([66, 68, 58], 0.3);
            x.fillStyle = c;
            if (m.kind === "esb") {
              x.fillRect(cx - 26 * s2, hy - 200 * s2, 52 * s2, 202 * s2);
              x.fillRect(cx - 17 * s2, hy - 236 * s2, 34 * s2, 40 * s2);
              x.fillRect(cx - 10 * s2, hy - 262 * s2, 20 * s2, 30 * s2);
              x.fillRect(cx - 5 * s2, hy - 290 * s2, 10 * s2, 30 * s2);
              x.fillRect(cx - 1.5 * s2, hy - 340 * s2, 3 * s2, 52 * s2);
            } else if (m.kind === "chrysler") {
              x.fillRect(cx - 18 * s2, hy - 170 * s2, 36 * s2, 172 * s2);
              for (let k = 0; k < 5; k++) {
                x.beginPath();
                x.arc(
                  cx,
                  hy - (170 + k * 14) * s2,
                  (18 - k * 3.2) * s2,
                  Math.PI,
                  0,
                );
                x.fill();
              }
              x.beginPath();
              x.moveTo(cx - 3 * s2, hy - 236 * s2);
              x.lineTo(cx, hy - 290 * s2);
              x.lineTo(cx + 3 * s2, hy - 236 * s2);
              x.fill();
            } else if (m.kind === "spire") {
              x.fillRect(cx - 14 * s2, hy - 150 * s2, 28 * s2, 152 * s2);
              x.beginPath();
              x.moveTo(cx - 14 * s2, hy - 150 * s2);
              x.lineTo(cx, hy - 205 * s2);
              x.lineTo(cx + 14 * s2, hy - 150 * s2);
              x.fill();
            } else if (m.kind === "liberty") {
              x.fillStyle = mix([70, 100, 86], 0.35);
              x.fillRect(cx - 12 * s2, hy - 26 * s2, 24 * s2, 26 * s2);
              x.fillRect(cx - 4 * s2, hy - 64 * s2, 8 * s2, 40 * s2);
              x.fillRect(cx + 2 * s2, hy - 84 * s2, 3 * s2, 24 * s2);
              x.beginPath();
              x.arc(cx + 3.5 * s2, hy - 88 * s2, 4 * s2, 0, TAU);
              x.fill();
            } else if (m.kind === "bridge") {
              x.strokeStyle = c;
              x.lineWidth = 2;
              for (const t of [-1, 1])
                x.fillRect(
                  cx + t * 120 * s2 - 7 * s2,
                  hy - 90 * s2,
                  14 * s2,
                  92 * s2,
                );
              x.beginPath();
              x.moveTo(cx - 260 * s2, hy - 10 * s2);
              x.quadraticCurveTo(
                cx - 180 * s2,
                hy - 30 * s2,
                cx - 120 * s2,
                hy - 88 * s2,
              );
              x.quadraticCurveTo(cx, hy - 20 * s2, cx + 120 * s2, hy - 88 * s2);
              x.quadraticCurveTo(
                cx + 180 * s2,
                hy - 30 * s2,
                cx + 260 * s2,
                hy - 10 * s2,
              );
              x.stroke();
              x.fillRect(cx - 260 * s2, hy - 12 * s2, 520 * s2, 4 * s2);
            }
          }
          layer(34, 90, 230, 36, 90, [42, 44, 38], 0.14, {
            broken: 0.45,
            windows: true,
          });
          const hz2 = x.createLinearGradient(0, hy - H * 0.12, 0, hy + 6);
          hz2.addColorStop(0, "rgba(226,204,146,0)");
          hz2.addColorStop(1, "rgba(226,204,146,0.55)");
          x.fillStyle = hz2;
          x.fillRect(0, hy - H * 0.12, W, H * 0.12 + 6);
          LI.wear(x, W, H, (opts.seed || 7) + 3, 0.25);
        },
        { clamp: !opts.wrap },
      ),
      { emissive: 0.75, rough: 1 },
    );
    LI.skyCards.push(key);
    return key;
  };

  // =====================================================================
  // Painted art helpers (all original)
  // =====================================================================
  /** Stylised bust portrait in an oval (for "forgotten mayors / governors"). */
  LI.portrait = function (x, X, Y, W, H, seed) {
    const r = LI.rng(seed);
    const bg = x.createRadialGradient(
      X + W / 2,
      Y + H * 0.4,
      5,
      X + W / 2,
      Y + H / 2,
      W * 0.8,
    );
    bg.addColorStop(0, ["#6a5a40", "#4a4a3a", "#5a3a2a", "#3a4a4a"][seed % 4]);
    bg.addColorStop(1, "#1a1410");
    x.fillStyle = bg;
    x.fillRect(X, Y, W, H);
    const cx = X + W / 2,
      cy = Y + H * 0.42;
    x.fillStyle = ["#1a1a20", "#2a2018", "#101418"][seed % 3]; // coat
    x.beginPath();
    x.moveTo(X + W * 0.12, Y + H);
    x.quadraticCurveTo(cx, cy + H * 0.12, X + W * 0.88, Y + H);
    x.fill();
    x.fillStyle = "#e8e0d0";
    x.beginPath();
    x.moveTo(cx - W * 0.08, cy + H * 0.2);
    x.lineTo(cx, cy + H * 0.36);
    x.lineTo(cx + W * 0.08, cy + H * 0.2);
    x.fill();
    x.fillStyle = ["#c89a78", "#b88a68", "#d8b090", "#9a7050"][seed % 4];
    x.beginPath();
    x.ellipse(cx, cy, W * 0.15, H * 0.14, 0, 0, TAU);
    x.fill();
    x.fillStyle = ["#3a2a1a", "#8a8078", "#1a1410", "#c8c0b0"][(seed >> 1) % 4];
    x.beginPath();
    x.ellipse(cx, cy - H * 0.08, W * 0.16, H * 0.08, 0, Math.PI, TAU);
    x.fill();
    if (r() < 0.5) {
      x.fillRect(cx - W * 0.13, cy + H * 0.02, W * 0.26, H * 0.06);
    }
    x.fillStyle = "rgba(20,14,8,0.6)";
    x.fillRect(cx - W * 0.07, cy - H * 0.01, W * 0.04, H * 0.015);
    x.fillRect(cx + W * 0.03, cy - H * 0.01, W * 0.04, H * 0.015);
    const v = x.createRadialGradient(
      cx,
      Y + H / 2,
      W * 0.3,
      cx,
      Y + H / 2,
      W * 0.75,
    );
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.7)");
    x.fillStyle = v;
    x.fillRect(X, Y, W, H);
    x.strokeStyle = "#8a6a30";
    x.lineWidth = 6;
    x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
  };
  /** The Iron Covenant's mark (original): a heater shield outline with an anvil, a single upright hammer over it
   *  and three rank bars below (Acolyte · Lancer · Warden). */
  LI.covenantEmblem = function (x, cx, cy, R, col) {
    x.save();
    x.fillStyle = col;
    x.strokeStyle = col;
    x.lineWidth = R * 0.07;
    x.lineJoin = "round";
    x.beginPath();
    x.moveTo(cx - R * 0.7, cy - R * 0.8);
    x.lineTo(cx + R * 0.7, cy - R * 0.8);
    x.lineTo(cx + R * 0.7, cy - R * 0.1);
    x.quadraticCurveTo(cx + R * 0.62, cy + R * 0.62, cx, cy + R * 0.95);
    x.quadraticCurveTo(
      cx - R * 0.62,
      cy + R * 0.62,
      cx - R * 0.7,
      cy - R * 0.1,
    );
    x.closePath();
    x.stroke();
    // anvil: face, horn, waist, foot
    x.beginPath();
    x.moveTo(cx - R * 0.42, cy + R * 0.02);
    x.lineTo(cx + R * 0.3, cy + R * 0.02);
    x.lineTo(cx + R * 0.52, cy - R * 0.06);
    x.lineTo(cx + R * 0.3, cy + R * 0.14);
    x.lineTo(cx + R * 0.14, cy + R * 0.16);
    x.lineTo(cx + R * 0.1, cy + R * 0.32);
    x.lineTo(cx + R * 0.26, cy + R * 0.42);
    x.lineTo(cx - R * 0.3, cy + R * 0.42);
    x.lineTo(cx - R * 0.14, cy + R * 0.32);
    x.lineTo(cx - R * 0.18, cy + R * 0.16);
    x.lineTo(cx - R * 0.42, cy + R * 0.14);
    x.closePath();
    x.fill();
    // hammer: handle + head
    x.fillRect(cx - R * 0.035, cy - R * 0.62, R * 0.07, R * 0.56);
    x.fillRect(cx - R * 0.2, cy - R * 0.7, R * 0.4, R * 0.14);
    for (let i = 0; i < 3; i++)
      x.fillRect(
        cx - R * (0.12 + i * 0.06),
        cy + R * (0.52 + i * 0.1),
        R * (0.24 + i * 0.12),
        R * 0.05,
      );
    x.restore();
  };
  /** Five-pointed star (painted art helper). */
  LI.star = function (x, cx, cy, R, r, col) {
    x.fillStyle = col;
    x.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        rr = i % 2 ? r : R;
      x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    x.closePath();
    x.fill();
  };
  /** The Continuity's seal (original): a double ring, an unbroken column (the government that never fell)
   *  standing on a stepped base, flanked by two laurel arcs of short leaves. */
  LI.continuityEmblem = function (x, cx, cy, R, col) {
    x.strokeStyle = col;
    x.fillStyle = col;
    x.lineWidth = R * 0.06;
    x.beginPath();
    x.arc(cx, cy, R, 0, TAU);
    x.stroke();
    x.lineWidth = R * 0.025;
    x.beginPath();
    x.arc(cx, cy, R * 0.86, 0, TAU);
    x.stroke();
    const cw = R * 0.16,
      top = cy - R * 0.5,
      bot = cy + R * 0.42;
    x.fillRect(cx - cw / 2, top, cw, bot - top); // shaft
    x.fillRect(cx - cw * 0.95, top - R * 0.07, cw * 1.9, R * 0.07); // capital
    x.fillRect(cx - cw * 1.25, top - R * 0.12, cw * 2.5, R * 0.05);
    x.fillRect(cx - cw * 1.1, bot, cw * 2.2, R * 0.06); // stepped base
    x.fillRect(cx - cw * 1.6, bot + R * 0.06, cw * 3.2, R * 0.06);
    for (const s of [-1, 1])
      for (let i = 0; i < 7; i++) {
        // laurel arcs
        const a = Math.PI / 2 + s * (0.35 + i * 0.3),
          px = cx + Math.cos(a) * R * 0.62,
          py = cy + Math.sin(a) * R * 0.62;
        x.save();
        x.translate(px, py);
        x.rotate(a + s * 0.6);
        x.beginPath();
        x.ellipse(0, 0, R * 0.09, R * 0.035, 0, 0, TAU);
        x.fill();
        x.restore();
      }
  };
  /** Top-down Manhattan map drawn from the live LAYOUT (war-room tables). */
  LI.manhattanMap = function (x, W, H, opts) {
    opts = opts || {};
    const L = G.LAYOUT,
      WB = L.WORLD;
    const sx = W / (WB.maxX - WB.minX),
      sz = H / (WB.maxZ - WB.minZ),
      s = Math.min(sx, sz);
    const px = (X) => (X - WB.minX) * s + (W - (WB.maxX - WB.minX) * s) / 2,
      pz = (Z) => (Z - WB.minZ) * s + (H - (WB.maxZ - WB.minZ) * s) / 2;
    x.fillStyle = opts.sea || "#2a3a3a";
    x.fillRect(0, 0, W, H);
    const poly = (P, fill) => {
      x.fillStyle = fill;
      x.beginPath();
      P.forEach((p, i) =>
        i ? x.lineTo(px(p[0]), pz(p[1])) : x.moveTo(px(p[0]), pz(p[1])),
      );
      x.closePath();
      x.fill();
    };
    poly(L.MANHATTAN, opts.land || "#9a9070");
    poly(L.BROOKLYN, opts.land || "#9a9070");
    for (const c of [L.LIBERTY, L.ELLIS]) {
      x.beginPath();
      x.arc(px(c.x), pz(c.z), c.r * s, 0, TAU);
      x.fill();
    }
    x.fillStyle = opts.park || "#6a7a4a";
    x.fillRect(
      px(L.PARK.x0),
      pz(L.PARK.z0),
      (L.PARK.x1 - L.PARK.x0) * s,
      (L.PARK.z1 - L.PARK.z0) * s,
    );
    x.strokeStyle = opts.street || "rgba(60,50,30,0.5)";
    x.lineWidth = Math.max(1, 3 * s);
    for (const a of L.avenues) {
      x.beginPath();
      x.moveTo(px(a.x), pz(a.z0));
      x.lineTo(px(a.x), pz(a.z1));
      x.stroke();
    }
    for (const st of L.streets) {
      x.beginPath();
      x.moveTo(px(st.x0), pz(st.z));
      x.lineTo(px(st.x1), pz(st.z));
      x.stroke();
    }
    x.beginPath();
    L.BROADWAY.forEach((p, i) =>
      i ? x.lineTo(px(p[0]), pz(p[1])) : x.moveTo(px(p[0]), pz(p[1])),
    );
    x.stroke();
    x.fillStyle = opts.site || "rgba(40,30,20,0.7)";
    for (const si of L.SITES)
      x.fillRect(
        px(si.x0),
        pz(si.z0),
        (si.x1 - si.x0) * s,
        (si.z1 - si.z0) * s,
      );
    return { px, pz, s };
  };
})();
