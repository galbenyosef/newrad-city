/* src/landmarks_a/00_kit.js */
/* =====================================================================
 * NEW RAD CITY — landmarks_a / 00_kit.js
 * Shared construction kit for the Midtown landmarks:
 *   - material registry (uses G.tex when present, procedural fallbacks)
 *   - Builder: batches primitives per material into ONE merged mesh per
 *     material (vertex-colour grime/AO/scorch baked in), with world-scaled
 *     UVs so every texture keeps a consistent texel density
 *   - texture atlases (painted signs, neon, billboards, flags)
 *   - glow-point sets (fake lights, one draw call per size class)
 *   - collider helpers (note: core collider yaw is the NEGATIVE of three.js yaw)
 *   - site registry + anchors
 * All other files in this directory use G.LMA.kit (never a top-level global).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const U = G.util;

  const A = (G.LMA = G.LMA || {});
  const K = (A.kit = {});
  A.defs = A.defs || []; // site build definitions: {id, order, build(K)}
  A.animators = A.animators || []; // fn(dt, time, night)
  A.dynamic = A.dynamic || []; // fn() called on newGame/loaded (spawn dynamic stuff)
  K.A = A;

  /** Register a landmark build function. */
  K.defineSite = function (id, order, build) {
    A.defs.push({ id, order, build });
  };
  K.animate = function (fn) {
    A.animators.push(fn);
  };
  K.onNewGame = function (fn) {
    A.dynamic.push(fn);
  };

  // Locks: keys / codes / passcodes (G.locks). Every lock in this directory is registered at build time and opened
  // through G.locks; while the locks module is absent (stub) the lock simply opens.
  K.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  K.lockReg = function (spec) {
    try {
      if (K.locksLive() && G.locks.register) G.locks.register(spec);
    } catch (e) {
      G.reportError && G.reportError("landmarks_a:lockReg:" + spec.id, e);
    }
    return spec;
  };
  K.lockOpen = function (spec, onOpen) {
    try {
      if (K.locksLive()) {
        if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
          onOpen();
          return;
        }
        G.locks.open(spec, onOpen);
        return;
      }
    } catch (e) {
      G.reportError && G.reportError("landmarks_a:lockOpen:" + spec.id, e);
    }
    onOpen();
  };
  K.lockIsOpen = (id) =>
    !K.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  K.lockLearn = function (id) {
    try {
      if (K.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError && G.reportError("landmarks_a:lockLearn:" + id, e);
    }
  };
  /** Learn lock code(s) when the player picks up or reads the item that carries them (note / tape reel). */
  K.learnFromItem = function (itemId, lockId) {
    const m = (K._learnMap = K._learnMap || {});
    m[itemId] = (m[itemId] || []).concat([lockId]);
    if (K._learnHooked || !G.events) return;
    K._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(K.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };

  /*
   * Interior / exterior split (streams, 2026-09-27). Everything built INSIDE a building's shell (rooms, floors seen
   * from inside, ceilings, furniture, interior props / lights / NPC anchors, interior-cell geometry, street↔interior
   * doors) lives in `NN_<site>_interior.js` files, which register named hooks with K.defineInterior(). The exterior
   * build calls K.interior(name, ctx) at the exact point where that code used to run, handing over its builders /
   * glow sets / record through `ctx`, so merged meshes, atlas packing and RNG streams stay byte-identical.
   * A missing hook is a no-op (the shell still builds); a throwing hook is reported and the rest of the site builds.
   */
  A.interiors = A.interiors || {};
  K.defineInterior = function (name, fn) {
    A.interiors[name] = fn;
  };
  K.interior = function (name, ctx) {
    const fn = A.interiors[name];
    if (typeof fn !== "function") return undefined;
    try {
      return fn(ctx || {});
    } catch (e) {
      G.reportError("init:landmarks_a/" + name, e);
      return undefined;
    }
  };

  // ------------------------------------------------------------------
  // Small helpers
  // ------------------------------------------------------------------
  K.clamp = U.clamp;
  K.lerp = U.lerp;
  K.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  K.V = (x, y, z) => new THREE.Vector3(x, y, z);
  K.site = (id) => G.LAYOUT.getSite(id);
  /** 0 = full day, 1 = full night. Uses atmosphere if present, else G.time.hour. */
  K.night = function () {
    const h = G.time && typeof G.time.hour === "number" ? G.time.hour : 12;
    const eve = U.smoothstep(17.2, 20.2, h),
      morn = 1 - U.smoothstep(4.8, 7.2, h);
    return U.clamp(Math.max(eve, morn), 0, 1);
  };
  K.isInteriorPos = (x) => x >= G.LAYOUT.INTERIOR_X_MIN;

  // ------------------------------------------------------------------
  // Canvas / texture helpers
  // ------------------------------------------------------------------
  K.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  let maxAniso = 4;
  K.texFromCanvas = function (c, opts) {
    opts = opts || {};
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = opts.clamp
      ? THREE.ClampToEdgeWrapping
      : THREE.RepeatWrapping;
    t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    try {
      maxAniso = G.renderer
        ? Math.min(8, G.renderer.capabilities.getMaxAnisotropy())
        : 4;
    } catch (e) {
      /* ignore */
    }
    t.anisotropy = opts.aniso || maxAniso;
    t.needsUpdate = true;
    return t;
  };
  const hex = (c) => "#" + new THREE.Color(c).getHexString();
  K.hex = hex;
  function shadeHex(c, f) {
    const col = new THREE.Color(c);
    col.r = U.clamp(col.r * f, 0, 1);
    col.g = U.clamp(col.g * f, 0, 1);
    col.b = U.clamp(col.b * f, 0, 1);
    return "#" + col.getHexString();
  }
  K.shadeHex = shadeHex;

  /** Film-grain style noise: a cached random tile blended with 'overlay' (GPU-fast, no readback). */
  let noiseTile = null;
  function getNoiseTile() {
    if (noiseTile) return noiseTile;
    const S = 128;
    noiseTile = K.canvas(S, S);
    const x = noiseTile.getContext("2d");
    const img = x.createImageData(S, S);
    const d = img.data;
    const r = K.rng(1234);
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.floor(r() * 256);
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    return noiseTile;
  }
  K.grain = function (ctx, w, h, amt, seed) {
    const tile = getNoiseTile();
    ctx.save();
    ctx.globalCompositeOperation = "overlay";
    ctx.globalAlpha = Math.min(1, amt / 90);
    const ox = ((seed || 0) * 37) % 128,
      oy = ((seed || 0) * 53) % 128;
    for (let y = -oy; y < h; y += 128)
      for (let x = -ox; x < w; x += 128) ctx.drawImage(tile, x, y);
    ctx.restore();
  };
  /** Dark blotches / water stains. */
  K.stains = function (ctx, w, h, n, seed, alpha, color) {
    const r = K.rng(seed || 3);
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        rds = (0.05 + r() * 0.25) * Math.min(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, rds);
      g.addColorStop(
        0,
        "rgba(" + (color || "30,26,20") + "," + (alpha || 0.25) * r() + ")",
      );
      g.addColorStop(1, "rgba(" + (color || "30,26,20") + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rds, y - rds, rds * 2, rds * 2);
    }
  };
  /** Vertical rain streaks. */
  K.streaks = function (ctx, w, h, n, seed, alpha) {
    const r = K.rng(seed || 5);
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h * 0.6,
        len = h * (0.1 + r() * 0.5),
        wd = 1 + r() * 4;
      const g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, "rgba(20,18,14," + (alpha || 0.18) + ")");
      g.addColorStop(1, "rgba(20,18,14,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x, y, wd, len);
    }
  };

  // Procedural fallback surface textures (used when the textures module is absent)
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
  K.litTwin = function (base, key, emissiveColor, intensity) {
    if (!MATDEF[key])
      MATDEF[key] = Object.assign({}, MATDEF[base] || MATDEF.concrete, {
        emissiveFromMap: true,
        emissiveVC: true,
        emissiveColor,
        emissiveIntensity: intensity,
        emissive: undefined,
      });
    return key;
  };
  /** Material instance for key (cached; vertexColors on for baked grime). */
  K.mat = function (key) {
    if (ALIASES[key]) key = ALIASES[key][0];
    if (MATS[key]) return MATS[key];
    const d = MATDEF[key] || MATDEF.concrete;
    let m;
    if (d.material) m = d.material;
    else if (d.basic) {
      m = new THREE.MeshBasicMaterial({
        color: d.color,
        vertexColors: true,
        map: d.map || null,
        side: d.side || THREE.FrontSide,
        transparent: !!d.transparent,
        blending: d.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: !d.additive && !d.transparent,
        fog: d.fog !== false,
        toneMapped: d.toneMapped !== undefined ? d.toneMapped : true,
      });
      if (d.alphaTest) m.alphaTest = d.alphaTest;
    } else {
      const map = d.flat ? null : surfaceTex(d);
      m = new THREE.MeshStandardMaterial({
        color: d.color !== undefined ? d.color : 0xffffff,
        map,
        vertexColors: true,
        roughness: d.rough !== undefined ? d.rough : 0.85,
        metalness: d.metal || 0,
        side: d.side || THREE.FrontSide,
      });
      const nm = d.flat || d.custom ? null : surfaceNormal(d);
      if (nm) {
        m.normalMap = nm;
        m.normalScale = new THREE.Vector2(0.6, 0.6);
      }
      if (d.emissive) m.emissive = new THREE.Color(d.emissive);
      if (d.emissiveMap) {
        m.emissiveMap = d.emissiveMap;
        m.emissive = new THREE.Color(d.emissiveColor || 0xffffff);
        m.emissiveIntensity = d.emissiveIntensity || 1;
      }
      // "baked lamp-light" lift: emission = emissiveColor × albedo map × vertex colour (so dark aliases stay dark)
      if (d.emissiveFromMap) {
        m.emissiveMap = map;
        m.emissive = new THREE.Color(d.emissiveColor || 0xffffff);
        m.emissiveIntensity = d.emissiveIntensity || 0.3;
      }
      if (d.emissiveVC) {
        m.onBeforeCompile = (sh) => {
          sh.fragmentShader = sh.fragmentShader.replace(
            "#include <emissivemap_fragment>",
            "#include <emissivemap_fragment>\n#ifdef USE_COLOR\n totalEmissiveRadiance *= vColor.rgb;\n#endif",
          );
        };
        m.customProgramCacheKey = () => "lma_evc";
      }
      if (d.alphaTest) {
        m.alphaTest = d.alphaTest;
      }
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        m.opacity = d.opacity || 1;
      }
    }
    m.name = "lma_" + key;
    m.userData.shared = true;
    MATS[key] = m;
    return m;
  };
  K.tile = function (key) {
    if (ALIASES[key]) key = ALIASES[key][0];
    const d = MATDEF[key];
    return (d && d.tile) || [3, 3];
  };

  // ------------------------------------------------------------------
  // BUILDER — batches geometry per material
  // ------------------------------------------------------------------
  const _c = new THREE.Color();
  function Builder(name, opts) {
    opts = opts || {};
    this.name = name;
    this.bk = new Map();
    this.grime = opts.grime !== undefined ? opts.grime : 0.55;
    this.burns = []; // {x,y,z,r,amt}
    this.groundY = opts.groundY || 0;
    this.remap = opts.remap || null; // {baseMat: otherMat} applied after alias resolution (e.g. lit interior variants)
  }
  K.builder = (name, opts) => new Builder(name, opts);
  const BP = Builder.prototype;

  BP._b = function (mat) {
    const al = resolveMat(mat);
    this._mul = al;
    if (al) mat = al.base;
    if (this.remap && this.remap[mat]) mat = this.remap[mat];
    let b = this.bk.get(mat);
    if (!b) {
      b = { p: [], n: [], uv: [], c: [], i: [], vc: 0 };
      this.bk.set(mat, b);
    }
    return b;
  };
  /** Scorch / soot sphere darkening all vertex colours inside it. */
  BP.burn = function (x, y, z, r, amt) {
    this.burns.push({ x, y, z, r, amt: amt === undefined ? 0.7 : amt });
    return this;
  };

  /** Vertex colour: tint × grime (ground AO, streaks, blotches, scorch). */
  BP._color = function (x, y, z, ny, tint, grime) {
    let s = 1,
      warm = 0;
    if (grime > 0) {
      const gy = y - this.groundY;
      const ao = U.clamp(1 - gy / 4.5, 0, 1);
      const streak = U.noise2(x * 0.23 + z * 0.19, y * 0.04);
      const blotch = U.noise2(
        x * 0.047 + 11.3 + y * 0.013,
        z * 0.047 - y * 0.031,
      );
      s =
        1 -
        grime *
          (0.34 * ao * ao + 0.26 * streak * streak + 0.2 * blotch * blotch);
      if (ny > 0.6) {
        s *= 1 - grime * 0.12;
        warm = grime * 0.05;
      } else if (ny < -0.6) s *= 1 - grime * 0.25;
    }
    for (let k = 0; k < this.burns.length; k++) {
      const bn = this.burns[k];
      const dx = x - bn.x,
        dy = y - bn.y,
        dz = z - bn.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < bn.r * bn.r) {
        const f = 1 - Math.sqrt(d2) / bn.r;
        s *= 1 - bn.amt * Math.min(1, f * 1.6);
      }
    }
    const m = this._mul;
    if (m)
      return [
        tint.r * s * (1 + warm) * m.r,
        tint.g * s * m.g,
        tint.b * s * (1 - warm * 2) * m.b,
      ];
    return [tint.r * s * (1 + warm), tint.g * s, tint.b * s * (1 - warm * 2)];
  };
  function tintOf(t) {
    if (t === undefined || t === null) return { r: 1, g: 1, b: 1 };
    _c.set(t);
    return { r: _c.r, g: _c.g, b: _c.b };
  }
  K.tintOf = tintOf;

  /**
   * Planar grid face. (ox,oy,oz) origin corner; U/V unit axes (U×V = normal); ul/vl lengths in metres.
   * o: {mat, su, sv, uv:'side'|'top'|'plane'|'rect', uo, vo, rect:[u0,v0,u1,v1], tint, grime, tile}
   */
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    const b = this._b(mat);
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || (grime > 0 ? 9 : 1e9);
    const su = o.su || Math.max(1, Math.min(24, Math.ceil(ul / seg))),
      sv = o.sv || Math.max(1, Math.min(40, Math.ceil(vl / seg)));
    const tile = o.tile || K.tile(mat);
    const mode = o.uv || "side";
    const tint = o.tintObj || tintOf(o.tint);
    const base = b.vc;
    for (let j = 0; j <= sv; j++) {
      const bb = (vl * j) / sv;
      for (let i = 0; i <= su; i++) {
        const a = (ul * i) / su;
        const x = ox + ux * a + vx * bb,
          y = oy + uy * a + vy * bb,
          z = oz + uz * a + vz * bb;
        b.p.push(x, y, z);
        b.n.push(nx, ny, nz);
        let u, v;
        if (mode === "side") {
          u = ((o.uo || 0) + a) / tile[0];
          v = y / tile[1];
        } else if (mode === "top") {
          u = x / tile[0];
          v = -z / tile[1];
        } else if (mode === "rect") {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (a / ul);
          v = r[1] + (r[3] - r[1]) * (bb / vl);
        } else {
          u = ((o.uo || 0) + a) / tile[0];
          v = ((o.vo || 0) + bb) / tile[1];
        }
        b.uv.push(u, v);
        const col = this._color(x, y, z, ny, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i,
          bI = a + 1,
          c = a + row + 1,
          d = a + row;
        b.i.push(a, bI, c, a, c, d);
      }
    b.vc += (su + 1) * (sv + 1);
    return this;
  };

  /**
   * Box. (cx, y0, cz) = bottom centre, w along local x, h up, d along local z.
   * o: {yaw (three.js convention), faces:'nsewtb' subset (default 'nsewt'), tint, grime, uvTop:'top'|'side', tile, seg}
   */
  BP.box = function (mat, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const yaw = o.yaw || 0,
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const faces = o.faces || "nsewt";
    const tint = tintOf(o.tint);
    const fo = {
      tintObj: tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uv,
      rect: o.rect,
    };
    const hw = w / 2,
      hd = d / 2;
    const R = (lx, lz) => [cx + lx * c + lz * s, cz - lx * s + lz * c];
    const D = (lx, lz) => [lx * c + lz * s, -lx * s + lz * c];
    let p, u;
    if (faces.indexOf("s") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("n") >= 0) {
      p = R(hw, -hd);
      u = D(-1, 0);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, w, h, fo);
    }
    if (faces.indexOf("e") >= 0) {
      p = R(hw, hd);
      u = D(0, -1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    if (faces.indexOf("w") >= 0) {
      p = R(-hw, -hd);
      u = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], 0, 1, 0, d, h, fo);
    }
    const to = {
      tintObj: tint,
      grime: o.grime,
      tile: o.tile,
      seg: o.seg,
      uv: o.uvTop || (o.uv === "rect" ? "rect" : "top"),
      rect: o.rect,
    };
    if (faces.indexOf("t") >= 0) {
      p = R(-hw, hd);
      u = D(1, 0);
      const v = D(0, -1);
      this.face(
        mat,
        p[0],
        y0 + h,
        p[1],
        u[0],
        0,
        u[1],
        v[0],
        0,
        v[1],
        w,
        d,
        to,
      );
    }
    if (faces.indexOf("b") >= 0) {
      p = R(-hw, -hd);
      u = D(1, 0);
      const v = D(0, 1);
      this.face(mat, p[0], y0, p[1], u[0], 0, u[1], v[0], 0, v[1], w, d, to);
    }
    return this;
  };
  /** Axis-aligned box by min/max corners. */
  BP.boxMM = function (mat, x0, y0, z0, x1, y1, z1, o) {
    return this.box(
      mat,
      (x0 + x1) / 2,
      y0,
      (z0 + z1) / 2,
      x1 - x0,
      y1 - y0,
      z1 - z0,
      o,
    );
  };

  /** Vertical cylinder / cone frustum. o: {top, bottom, flat, arc0, arc, tint, grime, uvScale, yaw} */
  BP.cyl = function (mat, cx, y0, cz, rb, rt, h, seg, o) {
    o = o || {};
    const b = this._b(mat);
    seg = seg || 12;
    const tint = tintOf(o.tint);
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tile(mat);
    const a0 = (o.arc0 || 0) + (o.yaw || 0),
      arc = o.arc || Math.PI * 2;
    const rows = o.rows || Math.max(1, Math.min(20, Math.ceil(h / 10)));
    const slope = (rb - rt) / h;
    const base = b.vc;
    for (let j = 0; j <= rows; j++) {
      const t = j / rows,
        y = y0 + h * t,
        r = rb + (rt - rb) * t;
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          ca = Math.cos(ang),
          sa = Math.sin(ang);
        const x = cx + ca * r,
          z = cz - sa * r;
        let nx = ca,
          ny = slope,
          nz = -sa;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        b.p.push(x, y, z);
        b.n.push(nx, ny, nz);
        b.uv.push(
          ((((arc * i) / seg) * Math.max(rb, rt, 0.3)) / tile[0]) *
            (o.uvScale || 1),
          y / tile[1],
        );
        const col = this._color(x, y, z, ny, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
    }
    const row = seg + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < seg; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    b.vc += row * (rows + 1);
    if (o.flat) {
      /* smooth shading is default; flat unsupported here (use seg small) */
    }
    const cap = (y, r, up) => {
      if (r <= 0.0001) return;
      const cb = b.vc;
      b.p.push(cx, y, cz);
      b.n.push(0, up ? 1 : -1, 0);
      b.uv.push(cx / tile[0], -cz / tile[1]);
      let col = this._color(cx, y, cz, up ? 1 : -1, tint, grime);
      b.c.push(col[0], col[1], col[2]);
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          x = cx + Math.cos(ang) * r,
          z = cz - Math.sin(ang) * r;
        b.p.push(x, y, z);
        b.n.push(0, up ? 1 : -1, 0);
        b.uv.push(x / tile[0], -z / tile[1]);
        col = this._color(x, y, z, up ? 1 : -1, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
      for (let i = 0; i < seg; i++) {
        if (up) b.i.push(cb, cb + 1 + i, cb + 2 + i);
        else b.i.push(cb, cb + 2 + i, cb + 1 + i);
      }
      b.vc += seg + 2;
    };
    if (o.top !== false) cap(y0 + h, rt, true);
    if (o.bottom) cap(y0, rb, false);
    return this;
  };

  const _m4 = new THREE.Matrix4(),
    _n3 = new THREE.Matrix3(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _v1 = new THREE.Vector3(),
    _v2 = new THREE.Vector3(),
    _s = new THREE.Vector3();
  /**
   * Add an arbitrary BufferGeometry with a transform baked in.
   * o: {x,y,z, rx,ry,rz (Euler YXZ), s|sx,sy,sz, matrix, uv:'auto'|'keep'|'rect', rect, tile, tint, grime}
   */
  BP.geo = function (mat, geom, o) {
    o = o || {};
    const b = this._b(mat);
    let m = o.matrix;
    if (!m) {
      _e.set(o.rx || 0, o.ry || 0, o.rz || 0, "YXZ");
      _q.setFromEuler(_e);
      const sc = o.s !== undefined ? o.s : 1;
      _s.set(
        o.sx !== undefined ? o.sx : sc,
        o.sy !== undefined ? o.sy : sc,
        o.sz !== undefined ? o.sz : sc,
      );
      m = _m4.compose(_v1.set(o.x || 0, o.y || 0, o.z || 0), _q, _s);
    }
    _n3.getNormalMatrix(m);
    const pos = geom.attributes.position,
      nor = geom.attributes.normal,
      uva = geom.attributes.uv;
    const tint = tintOf(o.tint);
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const tile = o.tile || K.tile(mat);
    const mode = o.uv || (uva ? "auto" : "auto");
    const base = b.vc,
      n = pos.count;
    const e = m.elements,
      ne = _n3.elements;
    for (let i = 0; i < n; i++) {
      const px = pos.getX(i),
        py = pos.getY(i),
        pz = pos.getZ(i);
      const x = e[0] * px + e[4] * py + e[8] * pz + e[12],
        y = e[1] * px + e[5] * py + e[9] * pz + e[13],
        z = e[2] * px + e[6] * py + e[10] * pz + e[14];
      let nx = 0,
        ny = 1,
        nz = 0;
      if (nor) {
        const qx = nor.getX(i),
          qy = nor.getY(i),
          qz = nor.getZ(i);
        nx = ne[0] * qx + ne[3] * qy + ne[6] * qz;
        ny = ne[1] * qx + ne[4] * qy + ne[7] * qz;
        nz = ne[2] * qx + ne[5] * qy + ne[8] * qz;
        const l = Math.hypot(nx, ny, nz) || 1;
        nx /= l;
        ny /= l;
        nz /= l;
      }
      b.p.push(x, y, z);
      b.n.push(nx, ny, nz);
      let u, v;
      if (mode === "keep" && uva) {
        u = uva.getX(i);
        v = uva.getY(i);
      } else if (mode === "rect" && uva) {
        const r = o.rect;
        u = r[0] + (r[2] - r[0]) * uva.getX(i);
        v = r[1] + (r[3] - r[1]) * uva.getY(i);
      } else {
        const ax = Math.abs(nx),
          ay = Math.abs(ny),
          az = Math.abs(nz);
        if (ay >= ax && ay >= az) {
          u = x / tile[0];
          v = -z / tile[1];
        } else if (ax >= az) {
          u = (nx > 0 ? -z : z) / tile[0];
          v = y / tile[1];
        } else {
          u = (nz > 0 ? x : -x) / tile[0];
          v = y / tile[1];
        }
      }
      b.uv.push(u, v);
      const col = this._color(x, y, z, ny, tint, grime);
      b.c.push(col[0], col[1], col[2]);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i++) b.i.push(base + ix.getX(i));
    } else for (let i = 0; i < n; i++) b.i.push(base + i);
    b.vc += n;
    return this;
  };

  // Reusable template geometries (never disposed; only read)
  const T = (K.T = {
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(1, 10, 7),
    sphereLo: new THREE.SphereGeometry(1, 7, 5),
    cyl6: new THREE.CylinderGeometry(1, 1, 1, 6, 1),
    cyl8: new THREE.CylinderGeometry(1, 1, 1, 8, 1),
    cyl12: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
    cone8: new THREE.ConeGeometry(1, 1, 8, 1),
    cone4: new THREE.ConeGeometry(1, 1, 4, 1),
    cone6: new THREE.ConeGeometry(1, 1, 6, 1),
    torus: new THREE.TorusGeometry(1, 0.06, 4, 28),
    torusThick: new THREE.TorusGeometry(1, 0.2, 6, 20),
    ico: new THREE.IcosahedronGeometry(1, 0),
    dodeca: new THREE.DodecahedronGeometry(1, 0),
  });

  /** Beam (box) between two points. o: {w (thickness), d?, tint, grime, roll} */
  BP.beam = function (mat, ax, ay, az, bx, by, bz, w, o) {
    o = o || {};
    _v1.set(bx - ax, by - ay, bz - az);
    const len = _v1.length();
    if (len < 1e-4) return this;
    _v1.divideScalar(len);
    _q.setFromUnitVectors(_v2.set(0, 1, 0), _v1);
    if (o.roll) {
      const qr = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        o.roll,
      );
      _q.multiply(qr);
    }
    _s.set(w, len, o.d || w);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    return this.geo(mat, o.round ? (o.round === 6 ? T.cyl6 : T.cyl8) : T.box, {
      matrix: m,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
  };
  /** Sagging cable / catenary as thin beams. Returns sampled points. */
  BP.cable = function (mat, ax, ay, az, bx, by, bz, sag, w, segs) {
    segs = segs || 8;
    const pts = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs;
      pts.push([
        ax + (bx - ax) * t,
        ay + (by - ay) * t - sag * 4 * t * (1 - t),
        az + (bz - az) * t,
      ]);
    }
    for (let i = 0; i < segs; i++)
      this.beam(
        mat,
        pts[i][0],
        pts[i][1],
        pts[i][2],
        pts[i + 1][0],
        pts[i + 1][1],
        pts[i + 1][2],
        w || 0.04,
        { grime: 0 },
      );
    return pts;
  };
  /** Quad from 4 points (CCW seen from front: bl, br, tr, tl). o: {rect, uv, tint, grime, double} */
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    const b = this._b(mat);
    _v1.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    _v2.set(p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]);
    const n = new THREE.Vector3().crossVectors(_v1, _v2);
    // a quad collapsed to a triangle (p3 == p0, e.g. a parasol gore) has a zero edge: use the diagonals instead
    // (a zero normal normalised to NaN rendered black and blew the bloom pass out into a white blob)
    if (n.lengthSq() < 1e-12) {
      _v1.set(p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]);
      _v2.set(p3[0] - p1[0], p3[1] - p1[1], p3[2] - p1[2]);
      n.crossVectors(_v1, _v2);
    }
    if (n.lengthSq() < 1e-12) n.set(0, 1, 0);
    else n.normalize();
    const r = o.rect || [0, 0, 1, 1];
    const uvs = [
      [r[0], r[1]],
      [r[2], r[1]],
      [r[2], r[3]],
      [r[0], r[3]],
    ];
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : 0;
    const pts = [p0, p1, p2, p3];
    const addSide = (flip) => {
      const base = b.vc;
      for (let k = 0; k < 4; k++) {
        const p = pts[k];
        b.p.push(p[0], p[1], p[2]);
        b.n.push(flip ? -n.x : n.x, flip ? -n.y : n.y, flip ? -n.z : n.z);
        b.uv.push(uvs[k][0], uvs[k][1]);
        const col = this._color(p[0], p[1], p[2], n.y, tint, grime);
        b.c.push(col[0], col[1], col[2]);
      }
      if (flip) b.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
      else b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
      b.vc += 4;
    };
    addSide(false);
    if (o.double) addSide(true);
    return this;
  };
  /**
   * Vertical rectangle centred at (cx, cy, cz), width w, height h, facing direction `face`
   * (three.js yaw: 0 → normal +Z/south, PI/2 → +X... actually normal = (sin f, 0, cos f)).
   */
  BP.panel = function (mat, cx, cy, cz, w, h, face, o) {
    if (o && o.both) {
      const o2 = Object.assign({}, o, { both: false });
      this.panel(mat, cx, cy, cz, w, h, face + Math.PI, o2);
      o = o2;
    }
    const nx = Math.sin(face),
      nz = Math.cos(face);
    const ux = Math.cos(face),
      uz = -Math.sin(face); // right vector when looking at the front
    const hw = w / 2,
      hh = h / 2,
      off = (o && o.off) || 0;
    const X = cx + nx * off,
      Z = cz + nz * off;
    return this.quad(
      mat,
      [X - ux * hw, cy - hh, Z - uz * hw],
      [X + ux * hw, cy - hh, Z + uz * hw],
      [X + ux * hw, cy + hh, Z + uz * hw],
      [X - ux * hw, cy + hh, Z - uz * hw],
      o,
    );
  };

  /** Horizontal floor/ceiling tiled with an atlas rect every `tile` metres (faces up unless o.down). */
  BP.tiledQuad = function (mat, x0, z0, x1, z1, y, tile, rect, o) {
    o = o || {};
    for (let x = x0; x < x1 - 1e-3; x += tile)
      for (let z = z0; z < z1 - 1e-3; z += tile) {
        const xa = x,
          xb = Math.min(x1, x + tile),
          za = z,
          zb = Math.min(z1, z + tile);
        const r = [
          rect[0],
          rect[1],
          rect[0] + ((rect[2] - rect[0]) * (xb - xa)) / tile,
          rect[1] + ((rect[3] - rect[1]) * (zb - za)) / tile,
        ];
        if (o.down)
          this.quad(mat, [xa, y, za], [xb, y, za], [xb, y, zb], [xa, y, zb], {
            rect: r,
            tint: o.tint,
            grime: o.grime,
          });
        else
          this.quad(mat, [xa, y, zb], [xb, y, zb], [xb, y, za], [xa, y, za], {
            rect: r,
            tint: o.tint,
            grime: o.grime,
          });
      }
    return this;
  };
  /** Extruded polygon (prism). pts [[x,z],...]; o: {top=true, bottom=false, tint, grime, tile, uo} */
  BP.prism = function (mat, pts, y0, y1, o) {
    o = o || {};
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % pts.length];
      area += a[0] * b2[1] - b2[0] * a[1];
    }
    // We want the outward normal to be the right-hand perpendicular (dz,-dx): requires area2 > 0 in (x,z) math orientation.
    const P = area > 0 ? pts.slice() : pts.slice().reverse();
    const tint = tintOf(o.tint);
    let uo = o.uo || 0;
    const h = y1 - y0;
    if (o.sides !== false) {
      for (let i = 0; i < P.length; i++) {
        const a = P[i],
          bq = P[(i + 1) % P.length];
        const dx = bq[0] - a[0],
          dz = bq[1] - a[1],
          L = Math.hypot(dx, dz);
        if (L < 1e-4) continue;
        // origin at b, u toward a (so that u × up = outward normal)
        this.face(mat, bq[0], y0, bq[1], -dx / L, 0, -dz / L, 0, 1, 0, L, h, {
          tintObj: tint,
          grime: o.grime,
          tile: o.tile,
          uo,
          seg: o.seg,
        });
        uo += L;
      }
    }
    const tri = (y, up) => {
      const b = this._b(mat);
      const contour = P.map((p) => new THREE.Vector2(p[0], p[1]));
      const faces = THREE.ShapeUtils.triangulateShape(contour, []);
      const base = b.vc;
      const tile = o.tile || K.tile(mat);
      for (const p of P) {
        b.p.push(p[0], y, p[1]);
        b.n.push(0, up ? 1 : -1, 0);
        b.uv.push(p[0] / tile[0], -p[1] / tile[1]);
        const col = this._color(
          p[0],
          y,
          p[1],
          up ? 1 : -1,
          tint,
          o.grime !== undefined ? o.grime : this.grime,
        );
        b.c.push(col[0], col[1], col[2]);
      }
      for (const f of faces) {
        // orient each triangle explicitly: (a×b).y > 0 means it faces +Y
        const p0 = P[f[0]],
          p1 = P[f[1]],
          p2 = P[f[2]];
        const ax = p1[0] - p0[0],
          az = p1[1] - p0[1],
          bx = p2[0] - p0[0],
          bz = p2[1] - p0[1];
        const facesUp = az * bx - ax * bz > 0;
        if (facesUp === up) b.i.push(base + f[0], base + f[1], base + f[2]);
        else b.i.push(base + f[0], base + f[2], base + f[1]);
      }
      b.vc += P.length;
    };
    if (o.top !== false) tri(y1, true);
    if (o.bottom) tri(y0, false);
    return this;
  };

  /**
   * Extrude a THREE.Shape (in local x = along wall, y = up) by depth (local z, centred).
   * o: {x,y,z, ry (three yaw), curveSegments, tint, grime, tile, uv}
   */
  BP.extrude = function (mat, shape, depth, o) {
    o = o || {};
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curveSegments || 8,
    });
    g.translate(0, 0, -depth / 2);
    this.geo(mat, g, {
      x: o.x,
      y: o.y,
      z: o.z,
      ry: o.ry,
      rx: o.rx,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
      uv: o.uv,
      rect: o.rect,
    });
    g.dispose();
    return this;
  };

  /**
   * Wall with rectangular/arched openings between points A and B (xz), from y0 to y1, thickness t.
   * openings: [{at (m from A), w, h (height of opening incl. arch), y (sill, default 0), arch:bool}]
   * Wall faces its local +z to the right of A→B... we simply place it; both faces are rendered by extrusion.
   */
  BP.wall = function (mat, ax, az, bx, bz, y0, y1, t, openings, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az);
    const sh = new THREE.Shape();
    sh.moveTo(0, 0);
    sh.lineTo(L, 0);
    sh.lineTo(L, y1 - y0);
    sh.lineTo(0, y1 - y0);
    sh.lineTo(0, 0);
    for (const op of openings || []) {
      const hw = op.w / 2,
        sy = op.y || 0,
        top = op.h + sy;
      const p = new THREE.Path();
      if (op.arch) {
        const springY = top - hw;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.absarc(op.at, springY, hw, 0, Math.PI, false);
        p.lineTo(op.at - hw, sy);
      } else if (op.pointed) {
        const springY = top - op.w * 0.85;
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, springY);
        p.quadraticCurveTo(op.at + hw, top - op.w * 0.2, op.at, top);
        p.quadraticCurveTo(op.at - hw, top - op.w * 0.2, op.at - hw, springY);
        p.lineTo(op.at - hw, sy);
      } else {
        p.moveTo(op.at - hw, sy);
        p.lineTo(op.at + hw, sy);
        p.lineTo(op.at + hw, top);
        p.lineTo(op.at - hw, top);
        p.lineTo(op.at - hw, sy);
      }
      sh.holes.push(p);
    }
    const yaw = -Math.atan2(bz - az, bx - ax); // local x → direction A→B
    const mx = (ax + bx) / 2,
      mz = (az + bz) / 2;
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: t,
      bevelEnabled: false,
      curveSegments: o.curveSegments || 10,
    });
    g.translate(-L / 2, 0, -t / 2);
    this.geo(mat, g, {
      x: mx,
      y: y0,
      z: mz,
      ry: yaw,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
    g.dispose();
    if (o.collide !== false)
      K.colWall(ax, az, bx, bz, t, y0, y1, openings, o.colOpts);
    return this;
  };

  /**
   * Merge all buckets into meshes under a Group. o: {cast=true, receive=true, lod: metres, parent, name}
   */
  BP.finish = function (parent, o) {
    o = o || {};
    const grp = new THREE.Group();
    grp.name = "lma_" + this.name;
    const box = new THREE.Box3();
    const st = ((A.buildStats = A.buildStats || {})[this.name] = {
      tris: 0,
      meshes: 0,
      shadowTris: 0,
    });
    for (const [mat, b] of this.bk) {
      if (!b.vc) continue;
      st.tris += b.i.length / 3;
      st.meshes++;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
      g.setIndex(
        b.vc > 65535
          ? new THREE.Uint32BufferAttribute(b.i, 1)
          : new THREE.Uint16BufferAttribute(b.i, 1),
      );
      g.computeBoundingSphere();
      g.computeBoundingBox();
      box.union(g.boundingBox);
      const material = K.mat(mat);
      const mesh = new THREE.Mesh(g, material);
      mesh.name = this.name + ":" + mat;
      const def = MATDEF[mat] || {};
      mesh.castShadow =
        o.cast !== false && !def.basic && !def.transparent && !def.noShadow;
      mesh.receiveShadow = o.receive !== false && !def.basic;
      if (def.renderOrder) mesh.renderOrder = def.renderOrder;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      if (mesh.castShadow) st.shadowTris += b.i.length / 3;
      grp.add(mesh);
    }
    this.bk.clear();
    (parent || G.scene).add(grp);
    if (o.lod && !box.isEmpty())
      G.world.addLOD(grp, o.lod, box.getCenter(new THREE.Vector3()));
    return grp;
  };
  /** Triangle count currently batched (debug). */
  BP.tris = function () {
    let n = 0;
    for (const b of this.bk.values()) n += b.i.length / 3;
    return n;
  };

  // ------------------------------------------------------------------
  // Colliders (core yaw convention = -three.js yaw)
  // ------------------------------------------------------------------
  K.colBox = function (x0, y0, z0, x1, y1, z1, opts) {
    return G.world.addBox(
      Math.min(x0, x1),
      Math.min(y0, y1),
      Math.min(z0, z1),
      Math.max(x0, x1),
      Math.max(y0, y1),
      Math.max(z0, z1),
      opts || {},
    );
  };
  /** Rotated box collider, yaw in three.js convention (same as Builder.box). */
  K.colRot = function (cx, cz, w, d, y0, y1, yaw, opts) {
    return G.world.addCollider(cx, cz, w, d, y0, y1, -(yaw || 0), opts || {});
  };
  /** Collider for a wall segment A→B with thickness t; openings leave gaps (door holes, from their sill). */
  K.colWall = function (ax, az, bx, bz, t, y0, y1, openings, opts) {
    const L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    const dx = (bx - ax) / L,
      dz = (bz - az) / L,
      yaw = -Math.atan2(bz - az, bx - ax);
    const ops = (openings || [])
      .filter((op) => (op.y || 0) < 0.6 && op.h > 1.9)
      .sort((a, b) => a.at - b.at);
    let s = 0;
    const seg = (a, b, ya, yb) => {
      if (b - a < 0.05) return;
      const m = (a + b) / 2;
      K.colRot(ax + dx * m, az + dz * m, b - a, t, ya, yb, yaw, opts);
    };
    for (const op of ops) {
      seg(s, op.at - op.w / 2, y0, y1);
      // lintel above opening
      seg(
        op.at - op.w / 2,
        op.at + op.w / 2,
        y0 + (op.y || 0) + op.h - (op.arch ? op.w * 0.25 : 0),
        y1,
      );
      s = op.at + op.w / 2;
    }
    seg(s, L, y0, y1);
    // windows (raised openings) are left solid for collision
  };
  /**
   * Straight stair flight: from bottom (x,z) running along direction yaw (three.js: 0 → -Z north... we use explicit dx,dz)
   * K.colStairs(x0,z0, dx,dz (unit run direction), width, run, yBottom, yTop, steps)
   * Each step collider rises ≤ 0.5 m and extends to the top of the flight.
   */
  K.colStairs = function (x0, z0, dx, dz, width, run, yb, yt, steps, opts) {
    const L = Math.hypot(dx, dz);
    dx /= L;
    dz /= L;
    const yaw = -Math.atan2(dz, dx);
    steps = steps || Math.max(1, Math.ceil((yt - yb) / 0.4));
    for (let i = 0; i < steps; i++) {
      const a = (run * i) / steps,
        b = run;
      const m = (a + b) / 2,
        top = yb + ((yt - yb) * (i + 1)) / steps;
      K.colRot(
        x0 + dx * m,
        z0 + dz * m,
        b - a,
        width,
        yb - 0.2,
        top,
        yaw,
        opts || { surface: "concrete" },
      );
    }
  };
  /** Visual stair flight (same params as colStairs) + collider. */
  BP.stairs = function (mat, x0, z0, dx, dz, width, run, yb, yt, steps, o) {
    o = o || {};
    const L = Math.hypot(dx, dz);
    dx /= L;
    dz /= L;
    steps = steps || Math.max(1, Math.ceil((yt - yb) / 0.4));
    const yaw = Math.atan2(dx, dz); // three.js yaw such that local +z points along (dx,dz)
    for (let i = 0; i < steps; i++) {
      const a = (run * i) / steps,
        b = (run * (i + 1)) / steps,
        m = (a + b) / 2;
      const top = yb + ((yt - yb) * (i + 1)) / steps;
      const bot = o.solid ? yb : top - (yt - yb) / steps - 0.05;
      this.box(mat, x0 + dx * m, bot, z0 + dz * m, width, top - bot, b - a, {
        yaw,
        tint: o.tint,
        grime: o.grime,
      });
    }
    if (o.collide !== false)
      K.colStairs(x0, z0, dx, dz, width, run, yb, yt, steps, o.colOpts);
    return this;
  };

  // ------------------------------------------------------------------
  // Texture atlases (shelf packer)
  // ------------------------------------------------------------------
  function Atlas(name, size, bg, height) {
    this.name = name;
    this.size = size;
    this.W = size;
    this.H = height || size;
    this.canvas = K.canvas(this.W, this.H);
    this.ctx = this.canvas.getContext("2d");
    if (bg) {
      this.ctx.fillStyle = bg;
      this.ctx.fillRect(0, 0, this.W, this.H);
    }
    this.sky = [{ x: 0, y: 0, w: this.W }];
    this.slots = {};
    this.used = 0;
    this.tex = K.texFromCanvas(this.canvas, { clamp: true });
  }
  /** Skyline bottom-left packing. Returns {x,y,w,h,rect:[u0,v0,u1,v1]} (rect ready for 'rect' UVs). */
  Atlas.prototype.alloc = function (key, w, h, draw) {
    if (key && this.slots[key]) return this.slots[key];
    const pad = 3;
    w = Math.ceil(w);
    h = Math.ceil(h);
    const W = w + pad,
      Hh = h + pad;
    let bestY = Infinity,
      bestX = 0,
      bestI = -1;
    for (let i = 0; i < this.sky.length; i++) {
      const x = this.sky[i].x;
      if (x + W > this.W) break;
      let y = 0,
        span = 0,
        j = i;
      while (span < W && j < this.sky.length) {
        y = Math.max(y, this.sky[j].y);
        span += this.sky[j].w;
        j++;
      }
      if (span < W || y + Hh > this.H) continue;
      if (y < bestY) {
        bestY = y;
        bestX = x;
        bestI = i;
      }
    }
    if (bestI < 0) {
      if (!this.quiet)
        console.warn(
          "[landmarks_a] atlas " +
            this.name +
            " full: " +
            key +
            " " +
            w +
            "x" +
            h,
        );
      return { x: 0, y: 0, w, h, rect: [0, 0, 0.001, 0.001], full: true };
    }
    // update skyline
    const node = { x: bestX, y: bestY + Hh, w: W };
    const out = [];
    for (const n of this.sky) {
      const n0 = n.x,
        n1 = n.x + n.w,
        c0 = bestX,
        c1 = bestX + W;
      if (n1 <= c0 || n0 >= c1) {
        out.push(n);
        continue;
      }
      if (n0 < c0) out.push({ x: n0, y: n.y, w: c0 - n0 });
      if (n0 >= c0 && out.indexOf(node) < 0) out.push(node);
      else if (n0 < c0 && out.indexOf(node) < 0) out.push(node);
      if (n1 > c1) out.push({ x: c1, y: n.y, w: n1 - c1 });
    }
    out.sort((a2, b2) => a2.x - b2.x);
    const merged = [];
    for (const n of out) {
      const l = merged[merged.length - 1];
      if (l && l.y === n.y && l.x + l.w === n.x) l.w += n.w;
      else merged.push({ x: n.x, y: n.y, w: n.w });
    }
    this.sky = merged;
    const s = { x: bestX, y: bestY, w, h };
    const e = 1.5;
    s.rect = [
      (s.x + e) / this.W,
      1 - (s.y + h - e) / this.H,
      (s.x + w - e) / this.W,
      1 - (s.y + e) / this.H,
    ];
    if (draw) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(s.x, s.y, w, h);
      this.ctx.clip();
      this.ctx.translate(s.x, s.y);
      draw(this.ctx, w, h);
      this.ctx.restore();
    }
    if (key) this.slots[key] = s;
    this.used += w * h;
    this.tex.needsUpdate = true;
    return s;
  };
  K.Atlas = Atlas;
  K.atlases = {};
  K.atlas = function (name) {
    return K.atlases[name];
  };

  // ------------------------------------------------------------------
  // Glow points (fake lights) — one THREE.Points per size class
  // ------------------------------------------------------------------
  let glowTex = null;
  function getGlowTex() {
    if (glowTex) return glowTex;
    // Photographic bloom profile instead of a linear gradient (which read as a flat "bokeh disc" with a visible rim):
    // a tight hot core + a wide soft skirt, tapered smoothly to exactly 0 at the sprite edge.
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      im = x.createImageData(S, S);
    for (let j = 0; j < S; j++)
      for (let i = 0; i < S; i++) {
        const dx = ((i + 0.5) / S) * 2 - 1,
          dy = ((j + 0.5) / S) * 2 - 1,
          r = Math.min(1, Math.sqrt(dx * dx + dy * dy));
        const taper = (1 - r * r) * (1 - r * r);
        const v = Math.min(
          1,
          (0.9 * Math.exp(-(r / 0.14) * (r / 0.14)) +
            0.38 * Math.exp(-(r / 0.42) * (r / 0.42)) +
            0.05 * (1 - r)) *
            taper,
        );
        const k = (j * S + i) * 4;
        im.data[k] = im.data[k + 1] = im.data[k + 2] = 255;
        im.data[k + 3] = Math.round(v * 255);
      }
    x.putImageData(im, 0, 0);
    glowTex = K.texFromCanvas(c, { clamp: true });
    return glowTex;
  }
  K.glowTex = getGlowTex;
  const glowMats = [];
  /** Glow set: add(x,y,z,color,sizeClass 's'|'m'|'l'|'xl'); finish(parent,{nightOnly, lod}) */
  K.glowSet = function (name) {
    const sets = {
      s: { p: [], c: [], size: 0.9 },
      m: { p: [], c: [], size: 2.4 },
      l: { p: [], c: [], size: 6 },
      xl: { p: [], c: [], size: 14 },
    };
    return {
      add(x, y, z, color, cls) {
        const s = sets[cls || "m"];
        s.p.push(x, y, z);
        _c.set(color === undefined ? 0xffd9a0 : color);
        s.c.push(_c.r, _c.g, _c.b);
        return this;
      },
      finish(parent, o) {
        o = o || {};
        const grp = new THREE.Group();
        grp.name = "lma_glow_" + name;
        for (const k in sets) {
          const s = sets[k];
          if (!s.p.length) continue;
          const g = new THREE.BufferGeometry();
          g.setAttribute("position", new THREE.Float32BufferAttribute(s.p, 3));
          g.setAttribute("color", new THREE.Float32BufferAttribute(s.c, 3));
          g.computeBoundingSphere();
          const m = new THREE.PointsMaterial({
            size: s.size * (o.scale || 1),
            map: getGlowTex(),
            vertexColors: true,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            fog: false,
            toneMapped: false,
            opacity: 1,
          });
          m.userData.shared = true;
          m.userData.dayOpacity =
            o.dayOpacity !== undefined ? o.dayOpacity : 0.35;
          m.userData.nightOpacity =
            o.nightOpacity !== undefined ? o.nightOpacity : 1;
          m.userData.flicker = o.flicker || 0;
          m.userData.interior = !!o.interior;
          // Distance fade (additive points ignore fog): beacons/crown lights opt out with {beacon:true}.
          // Every set also gets:
          //  * a camera PULL — the sprite is drawn up to 1.2 m (0.3 × its size) nearer the camera than its
          //    source, so lamp housings / sign arms / poles around the source no longer slice dark bars
          //    through the halo (the size is still computed from the true depth);
          //  * a pixel CAP (≤ 26 % of the viewport height) so a big halo never becomes a hovering sphere;
          //  * a NEAR fade — a halo dissolves as the camera walks into it.
          const fade = o.beacon
            ? [1e6, 2e6]
            : o.fade || (o.interior ? [90, 260] : [320, 780]);
          const maxFrac = o.maxFrac || (o.beacon ? 0.2 : 0.26);
          m.onBeforeCompile = function (sh) {
            sh.uniforms.uGlowFade = {
              value: new THREE.Vector2(fade[0], fade[1]),
            };
            sh.uniforms.uGlowMax = { value: maxFrac };
            sh.vertexShader =
              "uniform vec2 uGlowFade;\nuniform float uGlowMax;\nvarying float vGlowFade;\n" +
              sh.vertexShader.replace(
                "#include <fog_vertex>",
                "#include <fog_vertex>\n" +
                  "  float gDist = max(length(mvPosition.xyz), 1e-3);\n" +
                  "  vGlowFade = (1.0 - smoothstep(uGlowFade.x, uGlowFade.y, -mvPosition.z)) * smoothstep(size * 0.2, size * 0.85, gDist);\n" +
                  "  float gPull = min(min(size * 0.3, 1.2), gDist * 0.5);\n" +
                  "  gl_Position = projectionMatrix * vec4(mvPosition.xyz * ((gDist - gPull) / gDist), 1.0);\n" +
                  "  gl_PointSize = min(gl_PointSize, scale * 2.0 * uGlowMax);",
              );
            sh.fragmentShader =
              "varying float vGlowFade;\n" +
              sh.fragmentShader.replace(
                "#include <premultiplied_alpha_fragment>",
                "#include <premultiplied_alpha_fragment>\n  gl_FragColor *= vGlowFade;",
              );
          };
          m.customProgramCacheKey = function () {
            return "lma_glowfade2";
          };
          glowMats.push(m);
          const pts = new THREE.Points(g, m);
          pts.name = "lma_glow_" + name + "_" + k;
          pts.frustumCulled = true;
          pts.matrixAutoUpdate = false;
          pts.updateMatrix();
          grp.add(pts);
        }
        (parent || G.scene).add(grp);
        // Default LOD: street/interior glow sets are hidden entirely once fully faded; beacons never.
        const lod =
          o.lod !== undefined ? o.lod : o.beacon ? 0 : o.interior ? 300 : 820;
        if (lod) {
          const bb = new THREE.Box3().setFromObject(grp);
          if (!bb.isEmpty())
            G.world.addLOD(grp, lod, bb.getCenter(new THREE.Vector3()));
        }
        return grp;
      },
    };
  };
  // ------------------------------------------------------------------
  // Light spill on the ground ("pools" of neon / lamp light) and view-dependent wet reflections.
  // No dynamic lights (CONTRACT: ≤ 6 in the whole game) — both are additive decals, one draw call per set.
  // ------------------------------------------------------------------
  let spillTex = null,
    puddleTex = null;
  function getSpillTex() {
    if (spillTex) return spillTex;
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.62)");
    g.addColorStop(0.55, "rgba(255,255,255,0.2)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    spillTex = K.texFromCanvas(c, { clamp: true });
    return spillTex;
  }
  /** Tileable wet/dry mask (world-space, 8 m repeat): bright = puddle, dark = dry asphalt. */
  function getPuddleTex() {
    if (puddleTex) return puddleTex;
    const S = 256,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(4711);
    x.fillStyle = "rgb(70,70,70)";
    x.fillRect(0, 0, S, S);
    for (let i = 0; i < 70; i++) {
      const px = r() * S,
        py = r() * S,
        rds = 8 + r() * 46,
        a = 0.25 + r() * 0.55;
      for (const ox of [-S, 0, S])
        for (const oy of [-S, 0, S]) {
          const g = x.createRadialGradient(
            px + ox,
            py + oy,
            0,
            px + ox,
            py + oy,
            rds,
          );
          g.addColorStop(0, "rgba(255,255,255," + a + ")");
          g.addColorStop(0.7, "rgba(255,255,255," + a * 0.6 + ")");
          g.addColorStop(1, "rgba(255,255,255,0)");
          x.fillStyle = g;
          x.fillRect(px + ox - rds, py + oy - rds, rds * 2, rds * 2);
        }
    }
    // cracks / tar seams catch the light as thin bright lines
    x.strokeStyle = "rgba(255,255,255,0.35)";
    x.lineWidth = 1.2;
    for (let i = 0; i < 26; i++) {
      x.beginPath();
      let px = r() * S,
        py = r() * S;
      x.moveTo(px, py);
      for (let k = 0; k < 6; k++) {
        px += (r() - 0.5) * 40;
        py += (r() - 0.5) * 40;
        x.lineTo(px, py);
      }
      x.stroke();
    }
    puddleTex = K.texFromCanvas(c, { linear: true });
    puddleTex.wrapS = puddleTex.wrapT = THREE.RepeatWrapping;
    return puddleTex;
  }
  const spillMats = []; // {mat, day, night, interior}
  /**
   * Ground light pools: add(x, z, color, radius, opts{y, sx, sz (ellipse radii), yaw, i (intensity)}).
   * finish(parent, {day=0.08, night=1, interior=false, lod}) → Mesh (one draw call).
   */
  K.spillSet = function (name) {
    const p = [],
      c = [],
      uv = [],
      idx = [];
    let n = 0;
    return {
      add(x, z, color, radius, o) {
        o = o || {};
        const y = o.y !== undefined ? o.y : 0.05,
          rx = o.sx || radius,
          rz = o.sz || radius,
          yaw = o.yaw || 0,
          it = o.i === undefined ? 1 : o.i;
        const cs = Math.cos(yaw),
          sn = Math.sin(yaw);
        _c.set(color === undefined ? 0xffd9a0 : color);
        const corners = [
          [-1, 1],
          [1, 1],
          [1, -1],
          [-1, -1],
        ];
        for (const k of corners) {
          const lx = k[0] * rx,
            lz = k[1] * rz;
          p.push(x + lx * cs + lz * sn, y, z - lx * sn + lz * cs);
          c.push(_c.r * it, _c.g * it, _c.b * it);
          uv.push((k[0] + 1) / 2, (k[1] + 1) / 2);
        }
        idx.push(n, n + 1, n + 2, n, n + 2, n + 3);
        n += 4;
        return this;
      },
      finish(parent, o) {
        o = o || {};
        if (!n) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
        g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
        g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
        g.setIndex(idx);
        g.computeBoundingSphere();
        const m = new THREE.MeshBasicMaterial({
          map: getSpillTex(),
          vertexColors: true,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: true,
          fog: true,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        });
        m.userData.shared = true;
        spillMats.push({
          mat: m,
          day: o.day !== undefined ? o.day : 0.08,
          night: o.night !== undefined ? o.night : 1,
          interior: !!o.interior,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.name = "lma_spill_" + name;
        mesh.renderOrder = 2;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        (parent || G.scene).add(mesh);
        const lod = o.lod !== undefined ? o.lod : o.interior ? 0 : 360;
        if (lod) G.world.addLOD(mesh, lod, g.boundingSphere.center.clone());
        return mesh;
      },
    };
  };
  /**
   * View-dependent wet reflections: add(x, z, h, color, width, opts{len, i, y}) — a light at height h above the
   * ground point (x,z) is mirrored as a streak that always runs from the light's foot TOWARD the camera (like a
   * real reflection on wet asphalt / polished stone), broken up by a world-space puddle mask.
   * finish(parent, {day, night, interior, wet (0 = polished floor, 1 = puddled street)}) → Mesh.
   */
  const reflMats = [];
  K.reflSet = function (name) {
    const ce = [],
      pa = [],
      co = [],
      idx = [];
    let n = 0;
    return {
      add(x, z, h, color, width, o) {
        o = o || {};
        const len = o.len || Math.max(2.5, Math.min(12, h * 0.85 + 1.5)),
          it = o.i === undefined ? 1 : o.i,
          y = o.y !== undefined ? o.y : 0.04;
        _c.set(color === undefined ? 0xffd9a0 : color);
        for (const k of [
          [-1, 0],
          [1, 0],
          [1, 1],
          [-1, 1],
        ]) {
          ce.push(x, y, z);
          pa.push(k[0], k[1], width, len);
          co.push(_c.r * it, _c.g * it, _c.b * it);
        }
        idx.push(
          n,
          n + 2,
          n + 1,
          n,
          n + 3,
          n + 2,
          n,
          n + 1,
          n + 2,
          n,
          n + 2,
          n + 3,
        );
        n += 4;
        return this;
      },
      finish(parent, o) {
        o = o || {};
        if (!n) return null;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(ce, 3));
        g.setAttribute("aParams", new THREE.Float32BufferAttribute(pa, 4));
        g.setAttribute("color", new THREE.Float32BufferAttribute(co, 3));
        g.setIndex(idx);
        g.computeBoundingSphere();
        g.boundingSphere.radius += 20;
        const m = new THREE.ShaderMaterial({
          uniforms: {
            uOpacity: { value: 1 },
            uMask: { value: getPuddleTex() },
            uWet: { value: o.wet === undefined ? 1 : o.wet },
            uFar: { value: o.interior ? 70 : 140 },
          },
          vertexShader: [
            "attribute vec4 aParams; attribute vec3 color;",
            "varying vec3 vCol; varying vec2 vUv; varying vec2 vW; varying float vFade;",
            "uniform float uFar;",
            "void main(){",
            "  vec2 toCam = cameraPosition.xz - position.xz; float dc = length(toCam);",
            "  vec2 dir = dc > 1e-3 ? toCam / dc : vec2(0.0, 1.0); vec2 perp = vec2(-dir.y, dir.x);",
            "  float len = min(aParams.w, dc * 0.6);",
            "  float wd = aParams.z * (1.0 - aParams.y * 0.45);", // narrows toward the viewer: a streak, not a beam
            "  vec2 o2 = perp * aParams.x * wd * 0.5 + dir * (aParams.y * len - 0.25);",
            "  vec3 p = position + vec3(o2.x, 0.0, o2.y);",
            "  vCol = color; vUv = aParams.xy; vW = p.xz;",
            "  float dn = length(cameraPosition - p);",
            "  vFade = (1.0 - smoothstep(uFar * 0.6, uFar, dc)) * smoothstep(2.5, 9.0, dn);",
            "  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);",
            "}",
          ].join("\n"),
          fragmentShader: [
            "uniform float uOpacity; uniform sampler2D uMask; uniform float uWet;",
            "varying vec3 vCol; varying vec2 vUv; varying vec2 vW; varying float vFade;",
            "void main(){",
            "  float across = 1.0 - vUv.x * vUv.x; across *= across;",
            "  float along = pow(1.0 - vUv.y, 2.2) * smoothstep(0.0, 0.08, vUv.y + 0.02);",
            "  float m = texture2D(uMask, vW / 8.0).r;",
            "  float wet = mix(0.75 + 0.25 * m, smoothstep(0.38, 0.85, m) * 1.2 + 0.03, uWet);",
            "  float ripple = 0.85 + 0.15 * sin(vW.x * 7.0 + vW.y * 5.0 + vUv.y * 20.0);",
            "  gl_FragColor = vec4(vCol * across * along * wet * ripple * uOpacity * vFade, 1.0);",
            "}",
          ].join("\n"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          polygonOffset: true,
          polygonOffsetFactor: -3,
          polygonOffsetUnits: -3,
        });
        m.userData.shared = true;
        reflMats.push({
          mat: m,
          day: o.day !== undefined ? o.day : 0.05,
          night: o.night !== undefined ? o.night : 0.9,
          interior: !!o.interior,
        });
        const mesh = new THREE.Mesh(g, m);
        mesh.name = "lma_refl_" + name;
        mesh.renderOrder = 3;
        mesh.matrixAutoUpdate = false;
        mesh.updateMatrix();
        (parent || G.scene).add(mesh);
        const lod = o.lod !== undefined ? o.lod : o.interior ? 0 : 240;
        if (lod) G.world.addLOD(mesh, lod, g.boundingSphere.center.clone());
        return mesh;
      },
    };
  };

  /** Materials whose emissiveIntensity follows day/night (lit windows etc.). */
  const nightMats = [];
  K.nightEmissive = function (key, day, night) {
    nightMats.push({ key, day, night });
  };
  K.updateNightMats = function (night) {
    for (const n of nightMats) {
      const m = K.mat(n.key);
      if (m && m.emissiveIntensity !== undefined)
        m.emissiveIntensity = U.lerp(n.day, n.night, night);
    }
  };
  K.updateGlows = function (t, night) {
    for (const m of glowMats) {
      const base = m.userData.interior
        ? m.userData.nightOpacity
        : U.lerp(m.userData.dayOpacity, m.userData.nightOpacity, night);
      const f = m.userData.flicker
        ? 1 -
          m.userData.flicker *
            (0.5 + 0.5 * Math.sin(t * 13.7 + Math.sin(t * 3.1) * 4)) *
            (Math.sin(t * 0.7) > 0.6 ? 1 : 0.2)
        : 1;
      m.opacity = base * f;
    }
    for (const s of spillMats)
      s.mat.opacity = s.interior ? s.night : U.lerp(s.day, s.night, night);
    for (const s of reflMats)
      s.mat.uniforms.uOpacity.value = s.interior
        ? s.night
        : U.lerp(s.day, s.night, night);
  };

  // ------------------------------------------------------------------
  // Anchors / site registry
  // ------------------------------------------------------------------
  /** Create the exported landmark record {id, root, anchors} and register it into G.landmarks. */
  K.record = function (id) {
    const root = new THREE.Group();
    root.name = "landmark_" + id;
    G.scene.add(root);
    const rec = {
      id,
      root,
      anchors: {},
      name: (G.LAYOUT.getSite(id) || {}).name || id,
      owner: "landmarks_a",
    };
    rec.anchor = function (name, x, y, z, yaw) {
      const v = new THREE.Vector3(x, y, z);
      v.yaw = yaw || 0;
      rec.anchors[name] = v;
      return v;
    };
    G.landmarks[id] = rec;
    return rec;
  };

  // ------------------------------------------------------------------
  // FX bridges (degrade gracefully when atmosphere/fx is a stub)
  // ------------------------------------------------------------------
  A.fires = A.fires || []; // {pos, scale, handle}
  K.fire = function (x, y, z, scale) {
    A.fires.push({
      pos: new THREE.Vector3(x, y, z),
      scale: scale || 1,
      handle: null,
    });
  };
  A.smokes = A.smokes || [];
  K.smoke = function (x, y, z, scale) {
    A.smokes.push({
      pos: new THREE.Vector3(x, y, z),
      scale: scale || 1,
      handle: null,
    });
  };
  // Each fire/smoke is started at most once per game: a handle that can't be stopped (fx returned nothing)
  // is remembered as 'unstoppable' and never restarted, so reset → newGame / load cycles can't stack fires.
  K.startFx = function () {
    if (G.isStub("fx")) return;
    const start = (f, fn) => {
      if (f.handle) return;
      try {
        f.handle = fn(f.pos.clone(), f.scale) || "unstoppable";
      } catch (e) {
        f.handle = "failed";
      }
    };
    for (const f of A.fires) start(f, (p, s) => G.fx.fire(p, s));
    for (const f of A.smokes) start(f, (p, s) => G.fx.smoke(p, s));
  };
  K.stopFx = function () {
    for (const f of A.fires.concat(A.smokes)) {
      const h = f.handle;
      if (!h || typeof h !== "object") continue;
      f.handle = null;
      try {
        if (h.stop) h.stop();
        else if (h.remove) h.remove();
        else if (h.dispose) h.dispose();
      } catch (e) {
        /* ignore */
      }
    }
  };
  /** Debug: number of live fx handles (should equal fires + smokes after newGame, never more). */
  K.fxCount = function () {
    let n = 0;
    for (const f of A.fires.concat(A.smokes))
      if (f.handle && typeof f.handle === "object") n++;
    return n;
  };
})();
