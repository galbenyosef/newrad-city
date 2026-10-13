/* src/lair/00_kit.js */
/* =====================================================================
 * NEW RAD CITY — lair / 00_kit.js
 * The Glowkeepers' lair under Grand Central (Track 61, the Hall of Candles,
 * the M42 "Sun Room") and the finale. This file is the private toolkit:
 *   - G.lair (public namespace) + G.lair._ (private kit, this dir only)
 *   - interior cells (registered into LAYOUT.INTERIORS at load time, owner 'lair')
 *   - materials (G.tex surfaces when present, procedural canvases otherwise)
 *     and the module's own painted canvases (decal atlas, sun ceiling, clock)
 *   - Builder: primitives merged into ONE mesh per material, vertex-colour
 *     grime/AO, and baked per-vertex lighting computed at finish() over every
 *     light of the cell (light "zones" keep light inside its room)
 *   - colliders, stairs, flickering glow points (candles), story cards overlay
 * Everything else in src/lair uses G.lair._ (never a top-level global).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE) return;
  const U = G.util;

  const LR = (G.lair = G.lair && !G.lair.__stub ? G.lair : {});
  const K = (LR._ = LR._ || {});
  K.builds = K.builds || []; // [{order, fn}] static geometry, run in init
  K.readyFns = K.readyFns || []; // run once at initDone
  K.spawnFns = K.spawnFns || []; // run on newGame / loaded
  K.resetFns = K.resetFns || []; // run on reset
  K.updateFns = K.updateFns || []; // (dt, realDt) every frame
  K.animFns = K.animFns || []; // (dt, t) while a lair root is visible
  K.addBuild = (order, fn) => K.builds.push({ order, fn });
  K.onReady = (fn) => K.readyFns.push(fn);
  K.onSpawn = (fn) => K.spawnFns.push(fn);
  K.onReset = (fn) => K.resetFns.push(fn);
  K.onUpdate = (fn) => K.updateFns.push(fn);
  K.onAnim = (fn) => K.animFns.push(fn);
  K.PI = Math.PI;
  K.HP = Math.PI / 2;
  K.TAU = Math.PI * 2;
  K.clamp = U.clamp;
  K.lerp = U.lerp;
  K.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  K.V = (x, y, z) => new THREE.Vector3(x, y, z);
  K.safe = function (where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("lair:" + where, e);
      return undefined;
    }
  };
  K.live = (ns) => !!(G[ns] && !G.isStub(ns));

  // ------------------------------------------------------------------
  // Interior cells. Two cells on the 400 m interior grid, far east of every
  // other module's cell: Track 61 (shaft foot, platform, railcar, Hall of
  // Candles, the stair down, M42 antechamber, Tinder's workshop) and the
  // M42 substation itself (the Sun Room). Registered here at load time
  // (add-only; core layout.js is not edited). If a key / origin is already
  // taken we walk the grid east until a free spot is found.
  // ------------------------------------------------------------------
  const CELL_DEFS = [
    {
      key: "lair_track61",
      name: "Track 61 (under the Waldorf-Astoria)",
      pref: { x: 14000, y: 0, z: 0 },
    },
    {
      key: "lair_m42",
      name: "M42 Substation: the Sun Room",
      pref: { x: 14000, y: 0, z: 400 },
    },
  ];
  K.cells = {};
  function pickOrigin(pref, taken) {
    let o = { x: pref.x, y: 0, z: pref.z };
    for (let tries = 0; tries < 40; tries++) {
      const clash = taken.some(
        (t) => Math.abs(t.x - o.x) < 400 && Math.abs(t.z - o.z) < 400,
      );
      if (!clash) return o;
      o = { x: o.x + 400, y: 0, z: o.z };
    }
    return o;
  }
  (function registerCells() {
    const L = G.LAYOUT;
    if (!L || !L.INTERIORS) return;
    for (const d of CELL_DEFS) {
      const have = L.INTERIORS[d.key];
      if (have && have.owner === "lair") {
        K.cells[d.key] = have.origin;
        continue;
      }
      const taken = [];
      for (const k in L.INTERIORS)
        if (L.INTERIORS[k] && L.INTERIORS[k].origin)
          taken.push(L.INTERIORS[k].origin);
      const o = pickOrigin(d.pref, taken);
      if (o.x !== d.pref.x || o.z !== d.pref.z)
        console.warn("[lair] cell " + d.key + " moved to " + o.x + "," + o.z);
      L.INTERIORS[d.key] = {
        owner: "lair",
        origin: o,
        name: d.name,
        type: "lair",
      };
      K.cells[d.key] = o;
    }
  })();
  K.O1 = () => K.cells.lair_track61; // Track 61 cell origin
  K.O2 = () => K.cells.lair_m42; // Sun Room cell origin
  /** World position from cell-local coordinates. */
  K.w1 = (x, y, z) => new THREE.Vector3(K.O1().x + x, y, K.O1().z + z);
  K.w2 = (x, y, z) => new THREE.Vector3(K.O2().x + x, y, K.O2().z + z);
  /** Which lair cell is world position p in (null outside)? */
  K.cellAt = function (p) {
    if (!p) return null;
    for (const k in K.cells) {
      const o = K.cells[k];
      if (Math.abs(p.x - o.x) < 160 && Math.abs(p.z - o.z) < 160) return k;
    }
    return null;
  };
  K.inLair = (p) => !!K.cellAt(p || (G.player && G.player.pos));

  // ------------------------------------------------------------------
  // Canvas helpers
  // ------------------------------------------------------------------
  K.canvas = function (w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  };
  K.texFromCanvas = function (c, opts) {
    opts = opts || {};
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = opts.clamp
      ? THREE.ClampToEdgeWrapping
      : THREE.RepeatWrapping;
    t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    let an = 4;
    try {
      an = G.renderer
        ? Math.min(8, G.renderer.capabilities.getMaxAnisotropy())
        : 4;
    } catch (e) {
      /* ignore */
    }
    t.anisotropy = an;
    t.needsUpdate = true;
    return t;
  };
  const hex = (c) => "#" + new THREE.Color(c).getHexString();
  K.hex = hex;
  K.shade = function (c, f) {
    const col = new THREE.Color(c);
    col.r = K.clamp(col.r * f, 0, 1);
    col.g = K.clamp(col.g * f, 0, 1);
    col.b = K.clamp(col.b * f, 0, 1);
    return "#" + col.getHexString();
  };
  let noiseTile = null;
  K.grain = function (x, w, h, amt, seed) {
    if (!noiseTile) {
      const S = 128;
      noiseTile = K.canvas(S, S);
      const nx = noiseTile.getContext("2d");
      const img = nx.createImageData(S, S);
      const d = img.data;
      const r = K.rng(4242);
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.floor(r() * 256);
        d[i] = d[i + 1] = d[i + 2] = v;
        d[i + 3] = 255;
      }
      nx.putImageData(img, 0, 0);
    }
    x.save();
    x.globalCompositeOperation = "overlay";
    x.globalAlpha = Math.min(1, amt / 90);
    const ox = ((seed || 0) * 37) % 128,
      oy = ((seed || 0) * 53) % 128;
    for (let y = -oy; y < h; y += 128)
      for (let xx = -ox; xx < w; xx += 128) x.drawImage(noiseTile, xx, y);
    x.restore();
  };
  K.stains = function (x, w, h, n, seed, alpha, color) {
    const r = K.rng(seed || 3);
    for (let i = 0; i < n; i++) {
      const px = r() * w,
        py = r() * h,
        rad = (0.05 + r() * 0.25) * Math.min(w, h);
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(
        0,
        "rgba(" + (color || "30,26,20") + "," + (alpha || 0.25) * r() + ")",
      );
      g.addColorStop(1, "rgba(" + (color || "30,26,20") + ",0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
  };
  /** Twelve-ray sun (the Glowkeepers' sign): straight rays alternating long/short, solid disc. */
  K.drawSun = function (x, cx, cy, R, opts) {
    opts = opts || {};
    const rays = 12,
      inner = R * (opts.disc || 0.42);
    x.save();
    x.translate(cx, cy);
    if (opts.rot) x.rotate(opts.rot);
    x.fillStyle = opts.color || "#d8a640";
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2,
        len = i % 2 ? R * 0.78 : R,
        w = (opts.width || 0.13) * R * (i % 2 ? 0.85 : 1);
      x.save();
      x.rotate(a);
      x.beginPath();
      x.moveTo(-w / 2, -inner * 0.92);
      x.lineTo(0, -len);
      x.lineTo(w / 2, -inner * 0.92);
      x.closePath();
      x.fill();
      x.restore();
    }
    x.beginPath();
    x.arc(0, 0, inner, 0, Math.PI * 2);
    x.fill();
    if (opts.ring) {
      x.strokeStyle = opts.ring;
      x.lineWidth = R * 0.03;
      x.beginPath();
      x.arc(0, 0, inner * 0.82, 0, Math.PI * 2);
      x.stroke();
    }
    x.restore();
  };
  K.stencilText = function (x, text, cx, cy, size, color, opts) {
    opts = opts || {};
    x.save();
    x.font =
      (opts.weight || "700") +
      " " +
      size +
      "px " +
      (opts.font || '"Courier New", monospace');
    x.textAlign = opts.align || "center";
    x.textBaseline = "middle";
    x.fillStyle = color || "#1a1a1a";
    if (opts.spacing) {
      try {
        x.letterSpacing = opts.spacing + "px";
      } catch (e) {
        /* older canvas */
      }
    }
    if (opts.maxW) {
      const m = x.measureText(text).width;
      if (m > opts.maxW) {
        x.translate(cx, cy);
        x.scale(opts.maxW / m, 1);
        x.fillText(text, 0, 0);
        x.restore();
        return;
      }
    }
    x.fillText(text, cx, cy);
    if (opts.stencilBreaks) {
      // stencil bridges: thin vertical gaps through the letters
      x.globalCompositeOperation = "destination-out";
      const w = x.measureText(text).width;
      const r = K.rng(text);
      for (let i = 0; i < text.length; i++) {
        const px = cx - w / 2 + ((i + 0.5) * w) / text.length + (r() - 0.5) * 3;
        x.fillRect(px - 1.2, cy - size * 0.55, 2.4, size * 1.1);
      }
    }
    x.restore();
  };

  // ------------------------------------------------------------------
  // Procedural fallback surfaces (used only when the textures module is absent)
  // ------------------------------------------------------------------
  function fallbackCanvas(kind, seed) {
    const S = 256,
      c = K.canvas(S, S),
      x = c.getContext("2d"),
      r = K.rng(seed || 1);
    x.fillStyle = "#c8c8c8";
    x.fillRect(0, 0, S, S);
    if (kind === "brick") {
      x.fillStyle = "#8a8a8a";
      x.fillRect(0, 0, S, S);
      for (let row = 0; row < S / 16; row++)
        for (let col = -1; col < S / 48 + 1; col++) {
          const ox = (row % 2) * 24;
          x.fillStyle = K.shade("#c8c8c8", 0.8 + r() * 0.3);
          x.fillRect(col * 48 + ox + 2, row * 16 + 2, 44, 13);
        }
    } else if (kind === "tile") {
      for (let yy = 0; yy < S; yy += 32)
        for (let xx = 0; xx < S; xx += 64) {
          x.fillStyle = K.shade("#e8e8e8", 0.92 + r() * 0.08);
          x.fillRect(xx + 1, yy + 1, 62, 30);
        }
    } else if (kind === "planks") {
      for (let i = 0; i < 8; i++) {
        x.fillStyle = K.shade("#c8c8c8", 0.75 + r() * 0.4);
        x.fillRect(0, i * 32, S, 30);
      }
    }
    K.stains(x, S, S, 8, (seed || 1) + 2, 0.22);
    K.grain(x, S, S, 26, (seed || 1) + 3);
    return c;
  }

  // ------------------------------------------------------------------
  // Materials. key -> def. tex = G.tex surface, tile = metres per repeat [u, v]
  // ------------------------------------------------------------------
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
  function buildDecalAtlas() {
    const S = 2048,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    x.clearRect(0, 0, S, S);
    const R = K.decalRects;
    const rect = (name, px, py, w, h) => {
      R[name] = [px / S, 1 - (py + h) / S, (px + w) / S, 1 - py / S];
      return [px, py, w, h];
    };
    // painted twelve-ray suns (gold, faded) 512² each
    let [px, py, w, h] = rect("sun_gold", 0, 0, 512, 512);
    K.drawSun(x, px + 256, py + 256, 240, {
      color: "rgba(214,164,64,0.95)",
      ring: "rgba(120,80,20,0.6)",
    });
    [px, py, w, h] = rect("sun_white", 512, 0, 512, 512);
    K.drawSun(x, px + 256, py + 256, 236, { color: "rgba(236,228,206,0.9)" });
    [px, py, w, h] = rect("sun_soot", 1024, 0, 512, 512);
    K.drawSun(x, px + 256, py + 256, 236, { color: "rgba(28,22,16,0.8)" });
    // banner cloth: ochre with a sun (used on hanging banners)
    [px, py, w, h] = rect("banner", 1536, 0, 256, 512);
    x.fillStyle = "#9a7434";
    x.fillRect(px, py, w, h);
    const bg = x.createLinearGradient(px, 0, px + w, 0);
    bg.addColorStop(0, "rgba(0,0,0,0.35)");
    bg.addColorStop(0.5, "rgba(0,0,0,0)");
    bg.addColorStop(1, "rgba(0,0,0,0.35)");
    x.fillStyle = bg;
    x.fillRect(px, py, w, h);
    K.drawSun(x, px + 128, py + 190, 100, { color: "#e8d6a0" });
    x.fillStyle = "#e8d6a0";
    x.fillRect(px + 20, py + 340, w - 40, 6);
    x.fillRect(px + 20, py + 360, w - 40, 3);
    K.stencilText(x, "THE SUN", px + 128, py + 400, 30, "#e8d6a0", {
      font: "Georgia, serif",
      weight: "700",
    });
    K.stencilText(x, "DOES NOT CHOOSE", px + 128, py + 436, 22, "#e8d6a0", {
      font: "Georgia, serif",
      weight: "700",
      maxW: 220,
    });
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      x.moveTo(px + i * 30, py + h);
      x.lineTo(px + i * 30 + 15, py + h - 26);
      x.lineTo(px + i * 30 + 30, py + h);
      x.fillStyle = "rgba(0,0,0,1)";
      x.globalCompositeOperation = "destination-out";
      x.fill();
      x.globalCompositeOperation = "source-over";
    }
    // stencils
    const stencil = (name, py2, text, size, col, opts) => {
      const r = rect(name, 0, py2, 1024, 128);
      K.stencilText(
        x,
        text,
        r[0] + 512,
        r[1] + 64,
        size,
        col,
        Object.assign(
          { stencilBreaks: true, spacing: 6, maxW: 980 },
          opts || {},
        ),
      );
    };
    stencil("sirocco", 512, "SIROCCO 2", 96, "rgba(30,30,30,0.92)");
    stencil("track61", 640, "TRACK 61", 92, "rgba(230,226,214,0.9)");
    stencil("m42", 768, "M 42", 110, "rgba(230,214,170,0.92)");
    stencil(
      "nyc_sys",
      896,
      "NEW YORK CENTRAL SYSTEM",
      60,
      "rgba(225,220,205,0.85)",
    );
    stencil(
      "authorized",
      1024,
      "SUBSTATION  AUTHORIZED PERSONNEL ONLY",
      44,
      "rgba(225,200,90,0.9)",
    );
    stencil(
      "armored",
      1152,
      "ARMORED CAR U.S. No. 1",
      70,
      "rgba(225,222,205,0.85)",
    );
    stencil("t61_hatch", 1280, "T-61  BULKHEAD", 80, "rgba(238,200,80,0.9)");
    stencil("m61", 1408, "M-61  FREIGHT", 86, "rgba(238,200,80,0.9)");
    stencil("bigbuzz", 1536, "BIG BUZZ No. 2", 80, "rgba(240,240,232,0.92)");
    stencil("breaker", 1664, "M42  MAIN BREAKER", 76, "rgba(240,210,80,0.92)");
    stencil("danger", 1792, "DANGER  600 VOLTS DC", 70, "rgba(200,40,30,0.92)");
    stencil(
      "handcar",
      1920,
      "PARK AVE TUNNEL  SPUR 4",
      64,
      "rgba(230,226,214,0.85)",
    );
    // painted creed (gold brush lettering)
    [px, py, w, h] = rect("creed", 1024, 512, 1024, 128);
    K.stencilText(
      x,
      "SOMEBODY HAS TO KEEP THE LIGHT ON",
      px + 512,
      py + 64,
      54,
      "rgba(222,176,82,0.9)",
      { font: "Georgia, serif", maxW: 990 },
    );
    [px, py, w, h] = rect("creed2", 1024, 640, 1024, 128);
    K.stencilText(
      x,
      "NINETY DAYS OF WINTER, AND THEN THE SPRING",
      px + 512,
      py + 64,
      46,
      "rgba(222,176,82,0.88)",
      { font: "Georgia, serif", maxW: 990 },
    );
    [px, py, w, h] = rect("creed3", 1024, 768, 1024, 128);
    K.stencilText(
      x,
      "A DIMANCHE",
      px + 512,
      py + 64,
      80,
      "rgba(222,176,82,0.9)",
      { font: "Georgia, serif", spacing: 14 },
    );
    // chalked names (the Hall of Candles walls): 1024 x 640, several columns of names in white chalk
    [px, py, w, h] = rect("names", 1024, 896, 1024, 640);
    const FIRST = [
      "ANNA",
      "JOSEPH",
      "MARIA",
      "SAM",
      "RUTH",
      "LEO",
      "ROSA",
      "FRANK",
      "IDA",
      "TOMMY",
      "HELEN",
      "MOSES",
      "GRACE",
      "VITO",
      "ESTHER",
      "WALT",
      "MAE",
      "ABE",
      "LUCY",
      "OTTO",
      "NORA",
      "ELI",
      "BETTY",
      "GUS",
      "FAY",
      "CARMEN",
      "IRVING",
      "DOT",
      "MILO",
      "JUNE",
      "PETE",
      "HATTIE",
      "SAUL",
      "VERA",
      "NICK",
      "PEARL",
      "HUGH",
      "TESS",
      "MANNY",
      "BEA",
      "OSCAR",
      "LILA",
    ];
    const LAST = [
      "KOWALSKI",
      "O'BRIEN",
      "RUIZ",
      "GOLDBERG",
      "MORETTI",
      "JACKSON",
      "NOVAK",
      "BRENNAN",
      "CHAN",
      "SCHMIDT",
      "OKAFOR",
      "DELUCA",
      "WALSH",
      "ROSEN",
      "PEREZ",
      "KIM",
      "FINN",
      "BRADY",
      "HALLORAN",
      "VOSS",
      "TATE",
      "MENDEZ",
      "LEVY",
      "COHEN",
      "RYAN",
      "BAKER",
      "SILVA",
      "MURPHY",
      "LANG",
      "PRICE",
    ];
    const rr = K.rng(1967);
    x.save();
    x.beginPath();
    x.rect(px, py, w, h);
    x.clip();
    for (let col = 0; col < 5; col++)
      for (let row = 0; row < 26; row++) {
        const t =
          FIRST[Math.floor(rr() * FIRST.length)] +
          " " +
          LAST[Math.floor(rr() * LAST.length)];
        x.save();
        x.translate(
          px + 20 + col * 200 + rr() * 10,
          py + 18 + row * 24 + rr() * 4,
        );
        x.rotate((rr() - 0.5) * 0.06);
        x.font =
          (rr() < 0.5 ? "italic " : "") +
          (14 + Math.floor(rr() * 5)) +
          'px "Comic Sans MS", "Bradley Hand", cursive';
        x.fillStyle = "rgba(232,230,220," + (0.45 + rr() * 0.45) + ")";
        x.fillText(t, 0, 0);
        x.restore();
      }
    x.restore();
    // label cards / scraps (paper, 256x128 each) along the bottom rows
    const paper = (name, ox, oy, lines, opts) => {
      const r = rect(name, ox, oy, 256, 128);
      opts = opts || {};
      if (opts.bg !== "rgba(0,0,0,0)") {
        x.fillStyle = opts.bg || "#e6dcc0";
        x.fillRect(r[0] + 8, r[1] + 8, 240, 112);
        x.strokeStyle = "rgba(80,60,30,0.4)";
        x.lineWidth = 2;
        x.strokeRect(r[0] + 8, r[1] + 8, 240, 112);
      }
      lines.forEach((ln, i) =>
        K.stencilText(
          x,
          ln,
          r[0] + 128,
          r[1] + 40 + i * 32,
          opts.size || 26,
          opts.ink || "rgba(40,30,20,0.92)",
          {
            font: opts.font || "Georgia, serif",
            weight: opts.weight || "400",
            maxW: 228,
          },
        ),
      );
    };
    // (free slots: x 1792..2048 × y 0..512 beside the banner, and x 1024..1536 × y 1792..2048)
    paper("eleven", 1792, 0, [
      "THE ELEVEN",
      "5 MARCH 1968",
      "we keep the light on",
    ]);
    paper("pod7", 1792, 128, ["pod 7"], {
      font: '"Bradley Hand", "Comic Sans MS", cursive',
      size: 54,
      bg: "#ece2c6",
    });
    paper("r_label", 1792, 256, ["R."], {
      font: "Georgia, serif",
      size: 70,
      bg: "#e0d2b0",
    });
    paper(
      "record",
      1792,
      384,
      ["TWO BITS AND A KISS", "Ruby Castellano", "45 RPM"],
      { size: 22, bg: "#c84a3a", ink: "rgba(250,236,210,0.95)" },
    );
    paper(
      "schematic",
      1024,
      1792,
      ["KEYWAY B  BYPASS", "bore 11/16  depth 2 1/4", "Sunday by 9:47  T."],
      { size: 20, bg: "#c8d4dc", ink: "rgba(20,40,90,0.9)" },
    );
    paper(
      "ledger",
      1280,
      1792,
      ["ALTAR LEDGER", "when the list returns", "the Sun will rise"],
      { size: 20 },
    );
    paper("roses_chalk", 1024, 1920, ["F"], {
      bg: "rgba(0,0,0,0)",
      ink: "rgba(235,235,225,0.8)",
      size: 80,
      font: '"Comic Sans MS", cursive',
    });
    // Rose's chalk spark beside her 'F' (a few strokes)
    {
      const r = K.decalRects.roses_chalk;
      const bx = r[0] * S + 170,
        by = (1 - r[3]) * S + 60;
      x.strokeStyle = "rgba(235,235,225,0.8)";
      x.lineWidth = 4;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        x.beginPath();
        x.moveTo(bx + Math.cos(a) * 8, by + Math.sin(a) * 8);
        x.lineTo(bx + Math.cos(a) * 24, by + Math.sin(a) * 24);
        x.stroke();
      }
    }
    // grime blob (soot / water stain), 256²
    [px, py, w, h] = rect("soot", 1024, 1536, 256, 256);
    {
      const g = x.createRadialGradient(
        px + 128,
        py + 128,
        0,
        px + 128,
        py + 128,
        128,
      );
      g.addColorStop(0, "rgba(10,8,6,0.75)");
      g.addColorStop(0.6, "rgba(10,8,6,0.35)");
      g.addColorStop(1, "rgba(10,8,6,0)");
      x.fillStyle = g;
      x.fillRect(px, py, w, h);
    }
    [px, py, w, h] = rect("wax_pool", 1280, 1536, 256, 256);
    {
      const r2 = K.rng(77);
      for (let i = 0; i < 14; i++) {
        const gx = px + 128 + (r2() - 0.5) * 140,
          gy = py + 128 + (r2() - 0.5) * 140,
          rad = 18 + r2() * 46;
        const g = x.createRadialGradient(gx, gy, 0, gx, gy, rad);
        g.addColorStop(0, "rgba(236,224,196,0.95)");
        g.addColorStop(0.8, "rgba(226,212,180,0.85)");
        g.addColorStop(1, "rgba(226,212,180,0)");
        x.fillStyle = g;
        x.beginPath();
        x.arc(gx, gy, rad, 0, Math.PI * 2);
        x.fill();
      }
    }
    // ring marks of the pod-7 candle (wax rings), 256x512 strip
    [px, py, w, h] = rect("rings", 1536, 1536, 256, 512);
    x.fillStyle = "#efe4c8";
    x.fillRect(px + 40, py, 176, h);
    for (let i = 0; i < 22; i++) {
      const yy = py + 16 + i * 22;
      x.fillStyle = "rgba(150,110,60,0.55)";
      x.fillRect(px + 40, yy, 176, 3);
      K.stencilText(
        x,
        String(1967 + i),
        px + 128,
        yy + 11,
        12,
        "rgba(110,80,40,0.7)",
        { font: "Georgia, serif" },
      );
    }
    // gilt sun mask face (round, 256²)
    [px, py, w, h] = rect("mask", 1792, 1536, 256, 256);
    K.drawSun(x, px + 128, py + 128, 124, { color: "#d9ad4c", disc: 0.55 });
    x.fillStyle = "rgba(20,14,6,1)";
    x.globalCompositeOperation = "destination-out";
    x.beginPath();
    x.ellipse(px + 104, py + 118, 13, 7, 0, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.ellipse(px + 152, py + 118, 13, 7, 0, 0, Math.PI * 2);
    x.fill();
    x.globalCompositeOperation = "source-over";
    x.strokeStyle = "rgba(120,80,20,0.7)";
    x.lineWidth = 3;
    x.beginPath();
    x.arc(px + 128, py + 150, 18, 0.2, Math.PI - 0.2);
    x.stroke();
    return K.texFromCanvas(c, { clamp: true });
  }
  /** The Sun Room ceiling: a soot-dark plaster vault with a vast faded twelve-ray sun, gold leaf flaking. */
  function buildSunCeiling() {
    const W = 2048,
      H = 2048,
      c = K.canvas(W, H),
      x = c.getContext("2d"),
      r = K.rng(1971);
    x.fillStyle = "#4a4238";
    x.fillRect(0, 0, W, H);
    K.stains(x, W, H, 50, 11, 0.5, "20,16,12");
    // plaster seams along the vault
    x.strokeStyle = "rgba(20,16,12,0.45)";
    x.lineWidth = 3;
    for (let yy = 0; yy < H; yy += 89) {
      x.beginPath();
      x.moveTo(0, yy);
      x.lineTo(W, yy);
      x.stroke();
    }
    // the sun: world-circular on the vault (arc length ~ width, length ~ height of the canvas)
    const cx = W / 2,
      cy = H / 2;
    const glow = x.createRadialGradient(cx, cy, 0, cx, cy, 700);
    glow.addColorStop(0, "rgba(255,200,110,0.25)");
    glow.addColorStop(1, "rgba(255,200,110,0)");
    x.fillStyle = glow;
    x.fillRect(0, 0, W, H);
    K.drawSun(x, cx, cy, 760, {
      color: "rgba(206,150,58,0.92)",
      disc: 0.36,
      width: 0.11,
    });
    K.drawSun(x, cx, cy, 712, {
      color: "rgba(232,186,92,0.6)",
      disc: 0.33,
      width: 0.07,
    });
    // flaking: knock holes through the gold
    for (let i = 0; i < 900; i++) {
      const px = cx + (r() - 0.5) * 1300,
        py = cy + (r() - 0.5) * 1300,
        rad = 2 + r() * 9;
      x.fillStyle =
        "rgba(" +
        (60 + r() * 20) +
        "," +
        (52 + r() * 16) +
        ",44," +
        (0.5 + r() * 0.5) +
        ")";
      x.beginPath();
      x.arc(px, py, rad, 0, Math.PI * 2);
      x.fill();
    }
    // inner disc: concentric brush rings
    x.strokeStyle = "rgba(120,70,20,0.5)";
    x.lineWidth = 6;
    for (let k = 1; k < 5; k++) {
      x.beginPath();
      x.arc(cx, cy, k * 48, 0, Math.PI * 2);
      x.stroke();
    }
    // soot plumes from twenty years of candles
    for (let i = 0; i < 40; i++) {
      const px = r() * W,
        py = r() < 0.5 ? r() * 200 : H - r() * 200,
        rad = 60 + r() * 220;
      const g = x.createRadialGradient(px, py, 0, px, py, rad);
      g.addColorStop(0, "rgba(12,10,8,0.55)");
      g.addColorStop(1, "rgba(12,10,8,0)");
      x.fillStyle = g;
      x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
    }
    K.grain(x, W, H, 30, 7);
    const t = K.texFromCanvas(c, { clamp: true });
    return t;
  }
  /** Knitted baby blanket: rows of coloured stitches (faded rose, cream, sky). */
  function buildKnit() {
    const S = 128,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const cols = ["#c98a8a", "#e8dcc0", "#8aa8c8", "#e8dcc0", "#d8b070"];
    for (let row = 0; row < 16; row++)
      for (let i = 0; i < 16; i++) {
        x.fillStyle = cols[Math.floor(row / 3) % cols.length];
        x.beginPath();
        x.ellipse(
          i * 8 + 4,
          row * 8 + 4,
          3.6,
          4.4,
          i % 2 ? 0.4 : -0.4,
          0,
          Math.PI * 2,
        );
        x.fill();
      }
    K.grain(x, S, S, 30, 5);
    return K.texFromCanvas(c);
  }
  /** Bomb casing: pale cream enamel, weld seams, lifting-lug bands, SIROCCO 2 stencil, faded European marks. */
  function buildCasing() {
    // CylinderGeometry UVs: u = around the casing, v = along it. Stencils run along v.
    const W = 1024,
      H = 1024,
      c = K.canvas(W, H),
      x = c.getContext("2d"),
      r = K.rng(2);
    x.fillStyle = "#d6cdb2";
    x.fillRect(0, 0, W, H);
    K.stains(x, W, H, 30, 5, 0.35, "90,80,60");
    for (let i = 0; i < 300; i++) {
      x.fillStyle = "rgba(120,96,64," + r() * 0.4 + ")";
      x.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 6);
    }
    x.fillStyle = "rgba(60,54,44,0.5)";
    for (const v of [0.18, 0.5, 0.82]) x.fillRect(0, v * H, W, 6); // weld seams round the casing
    for (const u of [0.25, 0.75]) {
      x.save();
      x.translate(u * W, H * 0.5);
      x.rotate(-Math.PI / 2);
      K.stencilText(x, "SIROCCO 2", 0, 0, 110, "rgba(24,24,24,0.9)", {
        stencilBreaks: true,
        spacing: 10,
      });
      K.stencilText(
        x,
        "LOT 03/66   NE PAS MANIPULER",
        0,
        92,
        30,
        "rgba(24,24,24,0.7)",
        { spacing: 3 },
      );
      x.restore();
    }
    const g = x.createRadialGradient(
      W * 0.5,
      H * 0.92,
      0,
      W * 0.5,
      H * 0.92,
      260,
    );
    g.addColorStop(0, "rgba(120,70,30,0.45)");
    g.addColorStop(1, "rgba(120,70,30,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, W, H);
    K.grain(x, W, H, 20, 9);
    return K.texFromCanvas(c);
  }
  function customTex(name) {
    if (custom[name]) return custom[name];
    if (name === "decal") custom[name] = buildDecalAtlas();
    else if (name === "sun_ceiling") custom[name] = buildSunCeiling();
    else if (name === "knit") custom[name] = buildKnit();
    else if (name === "casing") custom[name] = buildCasing();
    return custom[name];
  }
  K.decal = function (name) {
    customTex("decal");
    return K.decalRects[name] || [0, 0, 0.01, 0.01];
  };

  const fbTex = {};
  function surfaceTex(d) {
    if (d.custom) return customTex(d.custom);
    if (!d.tex) return null;
    if (K.live("tex")) {
      try {
        const t = G.tex.get(d.tex);
        if (t && t.isTexture) return t;
      } catch (e) {
        /* fall back */
      }
    }
    const key = d.tex + ":" + (d.fb || "noise");
    if (!fbTex[key])
      fbTex[key] = K.texFromCanvas(
        fallbackCanvas(d.fb || "noise", U.hashStr(key) % 1000),
      );
    return fbTex[key];
  }
  function surfaceNormal(d) {
    if (!d.tex || !K.live("tex") || !G.tex.normal) return null;
    try {
      const t = G.tex.normal(d.tex);
      return t && t.isTexture ? t : null;
    } catch (e) {
      return null;
    }
  }
  /**
   * Baked light as an emissive term: totalEmissiveRadiance += albedo (map × vertex colour) × bakeLight.
   * The interior's scene lights (atmosphere hemisphere + key) still add a little on top, but the bake
   * decides how a room reads — including ceilings and vaults, which the hemisphere barely lights.
   */
  function bakeHook(m, k) {
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bakeLight;\nvarying vec3 vBakeL;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvBakeL = bakeLight;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vBakeL;")
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vBakeL * " +
            k.toFixed(3) +
            ";",
        );
    };
    m.customProgramCacheKey = () => "lairbake" + k.toFixed(3);
  }
  const MATS = {};
  K.mat = function (key) {
    if (ALIASES[key]) key = ALIASES[key][0];
    if (MATS[key]) return MATS[key];
    const d = MATDEF[key] || MATDEF.concrete;
    let m;
    if (d.basic) {
      m = new THREE.MeshBasicMaterial({
        color: d.color,
        vertexColors: true,
        toneMapped: d.toneMapped !== undefined ? d.toneMapped : true,
      });
    } else {
      m = new THREE.MeshStandardMaterial({
        color: d.color !== undefined ? d.color : 0xffffff,
        map: d.flat ? null : surfaceTex(d),
        vertexColors: true,
        roughness: d.rough !== undefined ? d.rough : 0.85,
        metalness: d.metal || 0,
        side: d.side || THREE.FrontSide,
      });
      const nm = d.flat || d.custom ? null : surfaceNormal(d);
      if (nm) {
        m.normalMap = nm;
        m.normalScale = new THREE.Vector2(0.7, 0.7);
      }
      if (d.emissive) m.emissive = new THREE.Color(d.emissive);
      if (d.alphaTest) m.alphaTest = d.alphaTest;
      if (d.transparent) {
        m.transparent = true;
        m.depthWrite = false;
        m.opacity = d.opacity || 1;
      }
      if (d.polyOff) {
        m.polygonOffset = true;
        m.polygonOffsetFactor = -2;
        m.polygonOffsetUnits = -2;
      }
    }
    if (!d.basic) bakeHook(m, d.bakeK || 1);
    m.name = "lair_" + key;
    m.userData.shared = true;
    MATS[key] = m;
    return m;
  };

  // ------------------------------------------------------------------
  // BUILDER: geometry batched per material, baked light at finish()
  // ------------------------------------------------------------------
  const _c = new THREE.Color();
  function setLin(c, t) {
    if (typeof t === "number") c.setHex(t, THREE.LinearSRGBColorSpace);
    else if (Array.isArray(t))
      c.setRGB(t[0], t[1], t[2], THREE.LinearSRGBColorSpace);
    else if (t) c.set(t);
    else c.setRGB(1, 1, 1);
    return c;
  }
  function tintOf(t) {
    if (t === undefined || t === null) return { r: 1, g: 1, b: 1 };
    setLin(_c, t);
    return { r: _c.r, g: _c.g, b: _c.b };
  }
  K.tintOf = tintOf;

  function Builder(name, opts) {
    opts = opts || {};
    this.name = name;
    this.bk = new Map();
    this.grime = opts.grime !== undefined ? opts.grime : 0.5;
    this.groundY = opts.groundY || 0;
    this.ambient = opts.ambient !== undefined ? opts.ambient : 0.22;
    this.maxLight = opts.maxLight || 2.6;
    this.gain = opts.gain || 1;
    this.lights = [];
    this.zone = null; // [x0,y0,z0,x1,y1,z1]: lights added while set only light vertices inside (soft margin)
    this.burns = [];
    this.seg = opts.seg || 2.0; // face segmentation (m) so baked light pools read
  }
  K.Builder = Builder;
  K.builder = (name, opts) => new Builder(name, opts);
  const BP = Builder.prototype;
  BP._b = function (mat) {
    const al = resolveAlias(mat);
    this._mul = al;
    if (al) mat = al.base;
    const md = MATDEF[mat];
    let b = this.bk.get(mat);
    if (!b) {
      b = {
        p: [],
        n: [],
        uv: [],
        c: [],
        l: null,
        i: [],
        vc: 0,
        unlit: !!(md && md.basic),
      };
      this.bk.set(mat, b);
    }
    return b;
  };
  /** Baked point light (radius r m). o: {zone:[x0,y0,z0,x1,y1,z1], wrap} — order relative to geometry does not matter. */
  BP.light = function (x, y, z, r, color, i, o) {
    setLin(_c, color === undefined ? 0xffc890 : color);
    const k = (i === undefined ? 1 : i) * this.gain;
    const zone = (o && o.zone) || this.zone;
    this.lights.push({
      x,
      y,
      z,
      r,
      r2: r * r,
      cr: _c.r * k,
      cg: _c.g * k,
      cb: _c.b * k,
      zone,
      wrap: o && o.wrap !== undefined ? o.wrap : 0.3,
    });
    return this;
  };
  BP.burn = function (x, y, z, r, amt) {
    this.burns.push({ x, y, z, r, amt: amt === undefined ? 0.6 : amt });
    return this;
  };
  BP._base = function (x, y, z, ny, tint, grime) {
    let s = 1;
    if (grime > 0) {
      const gy = y - this.groundY;
      const ao = K.clamp(1 - gy / 3.5, 0, 1);
      const streak = U.noise2(x * 0.23 + z * 0.19, y * 0.05);
      const blotch = U.noise2(
        x * 0.047 + 11.3 + y * 0.013,
        z * 0.047 - y * 0.031,
      );
      s =
        1 -
        grime *
          (0.3 * ao * ao + 0.26 * streak * streak + 0.24 * blotch * blotch);
      if (ny < -0.6) s *= 1 - grime * 0.25;
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
    if (m) return [tint.r * s * m.r, tint.g * s * m.g, tint.b * s * m.b];
    return [tint.r * s, tint.g * s, tint.b * s];
  };
  BP._push = function (b, x, y, z, nx, ny, nz, u, v, tint, grime) {
    b.p.push(x, y, z);
    b.n.push(nx, ny, nz);
    b.uv.push(u, v);
    const c = this._base(x, y, z, ny, tint, grime);
    b.c.push(c[0], c[1], c[2]);
  };
  /** Planar grid face: origin corner (ox,oy,oz), unit axes U and V (U×V = normal), lengths ul, vl. */
  BP.face = function (mat, ox, oy, oz, ux, uy, uz, vx, vy, vz, ul, vl, o) {
    o = o || {};
    const b = this._b(mat);
    let nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx;
    {
      const nl = Math.hypot(nx, ny, nz) || 1;
      nx /= nl;
      ny /= nl;
      nz /= nl;
    }
    const grime = o.grime !== undefined ? o.grime : this.grime;
    const seg = o.seg || this.seg;
    const su = Math.max(1, Math.min(48, Math.ceil(ul / seg))),
      sv = Math.max(1, Math.min(48, Math.ceil(vl / seg)));
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
        this._push(b, x, y, z, nx, ny, nz, u, v, tint, grime);
      }
    }
    const row = su + 1;
    for (let j = 0; j < sv; j++)
      for (let i = 0; i < su; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    b.vc += (su + 1) * (sv + 1);
    return this;
  };
  /** Box: bottom centre (cx, y0, cz), size w (x) h (y) d (z). o: {yaw, faces:'nsewtb' (default 'nsewt'), tint, grime, uv, rect, seg} */
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
  /** Vertical cylinder / frustum. o: {top=true, bottom, arc0, arc, tint, grime, rows} */
  BP.cyl = function (mat, cx, y0, cz, rb, rt, h, seg, o) {
    o = o || {};
    const b = this._b(mat);
    seg = seg || 12;
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const a0 = o.arc0 || 0,
      arc = o.arc || Math.PI * 2;
    const rows = o.rows || Math.max(1, Math.min(16, Math.ceil(h / 2)));
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
        let nx = ca,
          ny = slope,
          nz = -sa;
        const nl = Math.hypot(nx, ny, nz);
        nx /= nl;
        ny /= nl;
        nz /= nl;
        this._push(
          b,
          cx + ca * r,
          y,
          cz - sa * r,
          nx,
          ny,
          nz,
          (((arc * i) / seg) * Math.max(rb, rt, 0.3)) / tile[0],
          y / tile[1],
          tint,
          grime,
        );
      }
    }
    const row = seg + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < seg; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    b.vc += row * (rows + 1);
    const cap = (y, r, up) => {
      if (r <= 1e-4) return;
      const cb = b.vc;
      this._push(
        b,
        cx,
        y,
        cz,
        0,
        up ? 1 : -1,
        0,
        cx / tile[0],
        -cz / tile[1],
        tint,
        grime,
      );
      for (let i = 0; i <= seg; i++) {
        const ang = a0 + (arc * i) / seg,
          x = cx + Math.cos(ang) * r,
          z = cz - Math.sin(ang) * r;
        this._push(
          b,
          x,
          y,
          z,
          0,
          up ? 1 : -1,
          0,
          x / tile[0],
          -z / tile[1],
          tint,
          grime,
        );
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
  /** Arbitrary BufferGeometry with a transform baked in. o: {x,y,z, rx,ry,rz (Euler YXZ), s|sx,sy,sz, matrix, uv:'auto'|'keep'|'rect', rect, tint, grime} */
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
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const mode = o.uv || "auto";
    const base = b.vc,
      n = pos.count,
      e = m.elements,
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
      this._push(b, x, y, z, nx, ny, nz, u, v, tint, grime);
    }
    if (geom.index) {
      const ix = geom.index;
      for (let i = 0; i < ix.count; i++) b.i.push(base + ix.getX(i));
    } else for (let i = 0; i < n; i++) b.i.push(base + i);
    b.vc += n;
    return this;
  };
  const T = (K.T = {
    box: new THREE.BoxGeometry(1, 1, 1),
    sphere: new THREE.SphereGeometry(1, 12, 8),
    sphereLo: new THREE.SphereGeometry(1, 7, 5),
    cyl6: new THREE.CylinderGeometry(1, 1, 1, 6, 1),
    cyl8: new THREE.CylinderGeometry(1, 1, 1, 8, 1),
    cyl12: new THREE.CylinderGeometry(1, 1, 1, 12, 1),
    cyl16: new THREE.CylinderGeometry(1, 1, 1, 16, 1),
    cone8: new THREE.ConeGeometry(1, 1, 8, 1),
    torus: new THREE.TorusGeometry(1, 0.08, 6, 24),
    plane: new THREE.PlaneGeometry(1, 1),
  });
  /** Beam (box or round) between two points. o: {d, round:6|8|12, tint, grime} */
  BP.beam = function (mat, ax, ay, az, bx, by, bz, w, o) {
    o = o || {};
    _v1.set(bx - ax, by - ay, bz - az);
    const len = _v1.length();
    if (len < 1e-4) return this;
    _v1.divideScalar(len);
    _q.setFromUnitVectors(_v2.set(0, 1, 0), _v1);
    if (o.roll)
      _q.multiply(
        new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          o.roll,
        ),
      );
    _s.set(o.round ? w / 2 : w, len, o.round ? w / 2 : o.d || w);
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2),
      _q,
      _s,
    );
    const g =
      o.round === 6
        ? T.cyl6
        : o.round === 12
          ? T.cyl12
          : o.round
            ? T.cyl8
            : T.box;
    return this.geo(mat, g, {
      matrix: m,
      tint: o.tint,
      grime: o.grime,
      tile: o.tile,
    });
  };
  /** Sagging cable between two points (thin round beams). */
  BP.cable = function (mat, ax, ay, az, bx, by, bz, sag, w, segs, o) {
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
        w || 0.05,
        Object.assign({ round: 6, grime: 0 }, o || {}),
      );
    return pts;
  };
  /** Quad from 4 points (bl, br, tr, tl; CCW seen from the front). o: {rect, tint, grime, double} */
  BP.quad = function (mat, p0, p1, p2, p3, o) {
    o = o || {};
    const b = this._b(mat);
    _v1.set(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    _v2.set(p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]);
    const n = new THREE.Vector3().crossVectors(_v1, _v2).normalize();
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
    const side = (flip) => {
      const base = b.vc;
      for (let k = 0; k < 4; k++)
        this._push(
          b,
          pts[k][0],
          pts[k][1],
          pts[k][2],
          flip ? -n.x : n.x,
          flip ? -n.y : n.y,
          flip ? -n.z : n.z,
          uvs[k][0],
          uvs[k][1],
          tint,
          grime,
        );
      if (flip) b.i.push(base, base + 2, base + 1, base, base + 3, base + 2);
      else b.i.push(base, base + 1, base + 2, base, base + 2, base + 3);
      b.vc += 4;
    };
    side(false);
    if (o.double) side(true);
    return this;
  };
  /** Vertical rectangle centred at (cx,cy,cz), width w, height h, facing yaw `face` (normal = (sin f, 0, cos f)). */
  BP.panel = function (mat, cx, cy, cz, w, h, face, o) {
    o = o || {};
    const nx = Math.sin(face),
      nz = Math.cos(face),
      ux = Math.cos(face),
      uz = -Math.sin(face);
    const hw = w / 2,
      hh = h / 2,
      off = o.off || 0;
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
  /** Horizontal decal quad facing up at height y (centre cx,cz, size w×d, rotation yaw). */
  BP.floorDecal = function (name, cx, y, cz, w, d, yaw, o) {
    const c = Math.cos(yaw || 0),
      s = Math.sin(yaw || 0);
    const P = (lx, lz) => [cx + lx * c + lz * s, y, cz - lx * s + lz * c];
    return this.quad(
      "decal",
      P(-w / 2, d / 2),
      P(w / 2, d / 2),
      P(w / 2, -d / 2),
      P(-w / 2, -d / 2),
      Object.assign({ rect: K.decal(name) }, o || {}),
    );
  };
  BP.wallDecal = function (name, cx, cy, cz, w, h, face, o) {
    return this.panel(
      "decal",
      cx,
      cy,
      cz,
      w,
      h,
      face,
      Object.assign({ rect: K.decal(name), off: 0.02 }, o || {}),
    );
  };
  /** Extruded polygon prism. pts [[x,z]...]; o: {top=true, bottom, tint, grime, sides} */
  BP.prism = function (mat, pts, y0, y1, o) {
    o = o || {};
    let area = 0;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i],
        b2 = pts[(i + 1) % pts.length];
      area += a[0] * b2[1] - b2[0] * a[1];
    }
    const P = area > 0 ? pts.slice() : pts.slice().reverse();
    const tint = tintOf(o.tint);
    let uo = 0;
    const h = y1 - y0;
    if (o.sides !== false)
      for (let i = 0; i < P.length; i++) {
        const a = P[i],
          bq = P[(i + 1) % P.length];
        const dx = bq[0] - a[0],
          dz = bq[1] - a[1],
          L = Math.hypot(dx, dz);
        if (L < 1e-4) continue;
        this.face(mat, bq[0], y0, bq[1], -dx / L, 0, -dz / L, 0, 1, 0, L, h, {
          tintObj: tint,
          grime: o.grime,
          tile: o.tile,
          uo,
        });
        uo += L;
      }
    const tri = (y, up) => {
      const b = this._b(mat);
      const contour = P.map((p) => new THREE.Vector2(p[0], p[1]));
      const faces = THREE.ShapeUtils.triangulateShape(contour, []);
      const base = b.vc;
      const tile = o.tile || K.tile(mat);
      for (const p of P)
        this._push(
          b,
          p[0],
          y,
          p[1],
          0,
          up ? 1 : -1,
          0,
          p[0] / tile[0],
          -p[1] / tile[1],
          tint,
          o.grime !== undefined ? o.grime : this.grime,
        );
      for (const f of faces) {
        const p0 = P[f[0]],
          p1 = P[f[1]],
          p2 = P[f[2]];
        const facesUp =
          (p1[1] - p0[1]) * (p2[0] - p0[0]) -
            (p1[0] - p0[0]) * (p2[1] - p0[1]) >
          0;
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
   * Barrel vault along Z from z0 to z1, spanning x0..x1, springing at ys, rise r (semicircle when r = half span).
   * Inner surface faces down/inwards. o: {mat, segs, rect (uv over the whole vault), tint}
   */
  BP.vaultZ = function (mat, x0, x1, z0, z1, ys, rise, o) {
    o = o || {};
    const segs = o.segs || 16,
      cx = (x0 + x1) / 2,
      hw = (x1 - x0) / 2,
      L = z1 - z0;
    const b = this._b(mat);
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const zs = Math.max(1, Math.ceil(L / (o.seg || this.seg)));
    const base = b.vc;
    let arcLen = 0;
    const arcs = [0];
    for (let i = 1; i <= segs; i++) {
      const a0 = (Math.PI * (i - 1)) / segs,
        a1 = (Math.PI * i) / segs;
      arcLen += Math.hypot(
        hw * (Math.cos(a1) - Math.cos(a0)),
        rise * (Math.sin(a1) - Math.sin(a0)),
      );
      arcs.push(arcLen);
    }
    for (let j = 0; j <= zs; j++) {
      const z = z0 + (L * j) / zs;
      for (let i = 0; i <= segs; i++) {
        const a = (Math.PI * i) / segs,
          x = cx + hw * Math.cos(a),
          y = ys + rise * Math.sin(a);
        let nx = -Math.cos(a) / hw,
          ny = -Math.sin(a) / rise;
        const nl = Math.hypot(nx, ny);
        nx /= nl;
        ny /= nl;
        let u, v;
        if (o.rect) {
          const r = o.rect;
          u = r[0] + (r[2] - r[0]) * (arcs[i] / arcLen);
          v = r[1] + (r[3] - r[1]) * (j / zs);
        } else {
          u = arcs[i] / tile[0];
          v = z / tile[1];
        }
        this._push(b, x, y, z, nx, ny, 0, u, v, tint, grime);
      }
    }
    const row = segs + 1;
    for (let j = 0; j < zs; j++)
      for (let i = 0; i < segs; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + row, a + row + 1, a, a + row + 1, a + 1);
      }
    b.vc += row * (zs + 1);
    return this;
  };
  /** Same along X (spanning z0..z1, running x0..x1). */
  BP.vaultX = function (mat, z0, z1, x0, x1, ys, rise, o) {
    o = o || {};
    const segs = o.segs || 16,
      cz = (z0 + z1) / 2,
      hw = (z1 - z0) / 2,
      L = x1 - x0;
    const b = this._b(mat);
    const tint = tintOf(o.tint),
      grime = o.grime !== undefined ? o.grime : this.grime,
      tile = o.tile || K.tile(mat);
    const xs = Math.max(1, Math.ceil(L / (o.seg || this.seg)));
    const base = b.vc;
    for (let j = 0; j <= xs; j++) {
      const x = x0 + (L * j) / xs;
      for (let i = 0; i <= segs; i++) {
        const a = (Math.PI * i) / segs,
          z = cz + hw * Math.cos(a),
          y = ys + rise * Math.sin(a);
        let nz = -Math.cos(a) / hw,
          ny = -Math.sin(a) / rise;
        const nl = Math.hypot(nz, ny);
        nz /= nl;
        ny /= nl;
        this._push(
          b,
          x,
          y,
          z,
          0,
          ny,
          nz,
          (a * hw) / tile[0],
          x / tile[1],
          tint,
          grime,
        );
      }
    }
    const row = segs + 1;
    for (let j = 0; j < xs; j++)
      for (let i = 0; i < segs; i++) {
        const a = base + j * row + i;
        b.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    b.vc += row * (xs + 1);
    return this;
  };

  // ---- baking ----
  BP._bake = function () {
    const lights = this.lights;
    const amb = this.ambient,
      M = this.maxLight;
    // light grid (6 m cells) for small lights; big ones are tested for every vertex
    const CELL = 6,
      small = new Map(),
      big = [];
    for (const L of lights) {
      if (L.r > 9) {
        big.push(L);
        continue;
      }
      const x0 = Math.floor((L.x - L.r) / CELL),
        x1 = Math.floor((L.x + L.r) / CELL),
        z0 = Math.floor((L.z - L.r) / CELL),
        z1 = Math.floor((L.z + L.r) / CELL);
      for (let i = x0; i <= x1; i++)
        for (let j = z0; j <= z1; j++) {
          const k = i + "," + j;
          let a = small.get(k);
          if (!a) small.set(k, (a = []));
          a.push(L);
        }
    }
    const lit = [0, 0, 0];
    const one = (L, x, y, z, nx, ny, nz) => {
      if (L.zone) {
        const Z = L.zone;
        if (
          x < Z[0] - 0.3 ||
          x > Z[3] + 0.3 ||
          y < Z[1] - 0.3 ||
          y > Z[4] + 0.3 ||
          z < Z[2] - 0.3 ||
          z > Z[5] + 0.3
        )
          return;
      }
      const dx = L.x - x,
        dy = L.y - y,
        dz = L.z - z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 >= L.r2) return;
      const d = Math.sqrt(d2) || 1e-3;
      let f = 1 - d / L.r;
      f *= f;
      const lam =
        L.wrap + (1 - L.wrap) * Math.max(0, (dx * nx + dy * ny + dz * nz) / d);
      lit[0] += L.cr * f * lam;
      lit[1] += L.cg * f * lam;
      lit[2] += L.cb * f * lam;
    };
    for (const [, b] of this.bk) {
      if (b.unlit) continue;
      const P = b.p,
        N = b.n,
        Lc = (b.l = new Float32Array(b.vc * 3));
      for (let i = 0, n = b.vc; i < n; i++) {
        const x = P[i * 3],
          y = P[i * 3 + 1],
          z = P[i * 3 + 2],
          nx = N[i * 3],
          ny = N[i * 3 + 1],
          nz = N[i * 3 + 2];
        lit[0] = amb;
        lit[1] = amb;
        lit[2] = amb;
        for (let k = 0; k < big.length; k++) one(big[k], x, y, z, nx, ny, nz);
        const arr = small.get(
          Math.floor(x / CELL) + "," + Math.floor(z / CELL),
        );
        if (arr)
          for (let k = 0; k < arr.length; k++) one(arr[k], x, y, z, nx, ny, nz);
        Lc[i * 3] = Math.min(M, lit[0]);
        Lc[i * 3 + 1] = Math.min(M, lit[1]);
        Lc[i * 3 + 2] = Math.min(M, lit[2]);
      }
    }
  };
  /** Merge every bucket into meshes under a Group added to parent. o: {cast, receive} */
  BP.finish = function (parent, o) {
    o = o || {};
    this._bake();
    const grp = new THREE.Group();
    grp.name = "lair_" + this.name;
    for (const [mat, b] of this.bk) {
      if (!b.vc) continue;
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(b.p, 3));
      g.setAttribute("normal", new THREE.Float32BufferAttribute(b.n, 3));
      g.setAttribute("uv", new THREE.Float32BufferAttribute(b.uv, 2));
      g.setAttribute("color", new THREE.Float32BufferAttribute(b.c, 3));
      if (b.l) g.setAttribute("bakeLight", new THREE.BufferAttribute(b.l, 3));
      g.setIndex(
        b.vc > 65535
          ? new THREE.Uint32BufferAttribute(b.i, 1)
          : new THREE.Uint16BufferAttribute(b.i, 1),
      );
      g.computeBoundingSphere();
      g.computeBoundingBox();
      const mesh = new THREE.Mesh(g, K.mat(mat));
      mesh.name = this.name + ":" + mat;
      const def = MATDEF[mat] || {};
      mesh.castShadow =
        o.cast === true && !def.basic && !def.transparent && !def.noShadow;
      mesh.receiveShadow = o.receive !== false && !def.basic;
      if (def.transparent) mesh.renderOrder = 2;
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
      grp.add(mesh);
    }
    this.bk.clear();
    (parent || G.scene).add(grp);
    return grp;
  };
  BP.tris = function () {
    let n = 0;
    for (const b of this.bk.values()) n += b.i.length / 3;
    return n;
  };

  // ------------------------------------------------------------------
  // Colliders (core collider yaw is the NEGATIVE of the three.js yaw)
  // ------------------------------------------------------------------
  K.colliders = [];
  K.col = function (x0, y0, z0, x1, y1, z1, opts) {
    const c = G.world.addBox(
      Math.min(x0, x1),
      Math.min(y0, y1),
      Math.min(z0, z1),
      Math.max(x0, x1),
      Math.max(y0, y1),
      Math.max(z0, z1),
      Object.assign({ tag: "lair" }, opts || {}),
    );
    K.colliders.push(c);
    return c;
  };
  K.colRot = function (cx, cz, w, d, y0, y1, yaw, opts) {
    const c = G.world.addCollider(
      cx,
      cz,
      w,
      d,
      y0,
      y1,
      -(yaw || 0),
      Object.assign({ tag: "lair" }, opts || {}),
    );
    K.colliders.push(c);
    return c;
  };
  /**
   * A straight stair (visual + walkable step colliders, risers <= 0.22 m).
   * Runs from (x0,z0) along unit (dx,dz) for `run` metres, rising from yb to yt, width w (centred on the line).
   */
  K.stairs = function (b, mat, x0, z0, dx, dz, run, w, yb, yt, o) {
    o = o || {};
    const rise = yt - yb,
      n = Math.max(2, Math.ceil(Math.abs(rise) / 0.2)),
      step = run / n,
      h = rise / n;
    const px = -dz,
      pz = dx; // perpendicular
    const yaw = Math.atan2(dx, dz);
    for (let i = 0; i < n; i++) {
      const t0 = i * step,
        cx = x0 + dx * (t0 + step / 2),
        cz = z0 + dz * (t0 + step / 2);
      const top = yb + h * (i + 1);
      const bot = Math.min(yb, yt) - 0.05;
      b.box(mat, cx, bot, cz, w, top - bot, step + 0.02, {
        yaw,
        tint: o.tint,
        grime: o.grime,
        faces: "nsewt",
      });
      if (o.nosing)
        b.box(
          o.nosing,
          cx + dx * (step / 2 - 0.03),
          top - 0.04,
          cz + dz * (step / 2 - 0.03),
          w,
          0.05,
          0.06,
          { yaw, grime: 0.2 },
        );
      K.colRot(cx, cz, w, step + 0.02, bot, top, yaw, {
        surface: o.surface || "concrete",
      });
      if (o.each) o.each(i, cx, top, cz, px, pz);
    }
    return { n, step, h };
  };

  // ------------------------------------------------------------------
  // Glow points (candle flames, bulbs, embers): one Points draw call per set,
  // flicker in the vertex shader (per-point phase / speed / amount).
  // ------------------------------------------------------------------
  let glowTex = null;
  function getGlowTex() {
    if (glowTex) return glowTex;
    const S = 64,
      c = K.canvas(S, S),
      x = c.getContext("2d");
    const g = x.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.75)");
    g.addColorStop(0.45, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    x.fillStyle = g;
    x.fillRect(0, 0, S, S);
    glowTex = K.texFromCanvas(c, { clamp: true });
    return glowTex;
  }
  const glowTime = { value: 0 };
  K.glowTime = glowTime;
  K.glowSet = function () {
    const pts = [];
    return {
      /** size = world metres; flick 0..1 (0 = steady bulb, 1 = candle); */
      add(x, y, z, color, size, flick) {
        pts.push({
          x,
          y,
          z,
          c: new THREE.Color(color === undefined ? 0xffb860 : color),
          s: size || 0.25,
          f: flick === undefined ? 1 : flick,
        });
        return this;
      },
      count: () => pts.length,
      finish(parent) {
        if (!pts.length) return null;
        const n = pts.length,
          pos = new Float32Array(n * 3),
          col = new Float32Array(n * 3),
          sz = new Float32Array(n),
          ph = new Float32Array(n),
          fl = new Float32Array(n);
        const r = K.rng(n * 7 + 3);
        pts.forEach((p, i) => {
          pos.set([p.x, p.y, p.z], i * 3);
          col.set([p.c.r, p.c.g, p.c.b], i * 3);
          sz[i] = p.s;
          ph[i] = r() * 100;
          fl[i] = p.f;
        });
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("color", new THREE.BufferAttribute(col, 3));
        g.setAttribute("size", new THREE.BufferAttribute(sz, 1));
        g.setAttribute("phase", new THREE.BufferAttribute(ph, 1));
        g.setAttribute("flick", new THREE.BufferAttribute(fl, 1));
        g.computeBoundingSphere();
        const m = new THREE.ShaderMaterial({
          uniforms: {
            map: { value: getGlowTex() },
            time: glowTime,
            scale: { value: 600 },
          },
          vertexShader: [
            "attribute float size; attribute float phase; attribute float flick; attribute vec3 color; varying vec3 vC; varying float vA;",
            "uniform float time; uniform float scale;",
            "void main(){",
            "  float f = 1.0 - flick * (0.18 + 0.18*sin(time*9.0+phase) + 0.12*sin(time*23.0+phase*1.7) + 0.1*sin(time*3.1+phase*0.3));",
            "  vC = color; vA = f;",
            "  vec4 mv = modelViewMatrix * vec4(position + vec3(0.0, flick*0.012*sin(time*7.0+phase), 0.0), 1.0);",
            "  gl_PointSize = clamp(size * f * scale / max(0.2, -mv.z), 1.0, 220.0);",
            "  gl_Position = projectionMatrix * mv;",
            "}",
          ].join("\n"),
          fragmentShader: [
            "uniform sampler2D map; varying vec3 vC; varying float vA;",
            "void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb * vA * 1.6, t.a * vA); }",
          ].join("\n"),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          fog: false,
          toneMapped: false,
        });
        const P = new THREE.Points(g, m);
        P.frustumCulled = false;
        P.renderOrder = 5;
        P.name = "lair_glows";
        parent.add(P);
        return P;
      },
    };
  };

  // ------------------------------------------------------------------
  // Interactables (removed on demand); anchors
  // ------------------------------------------------------------------
  K.fires = K.fires || []; // {cell, x, y, z}: real fx fires started while the player is in that cell
  K.anchors = K.anchors || {};
  K.anchor = function (name, p, yaw) {
    const v = p.clone ? p.clone() : new THREE.Vector3(p.x, p.y, p.z);
    v.yaw = yaw || 0;
    K.anchors[name] = v;
    return v;
  };
  LR.anchor = function (name) {
    const a = K.anchors[name];
    if (!a) return null;
    const v = a.clone();
    v.yaw = a.yaw || 0;
    return v;
  };
  LR.anchors = () => Object.keys(K.anchors);
  K.interact = function (def) {
    return G.world.addInteractable(def);
  };

  // ------------------------------------------------------------------
  // Quest flags (main-story flags are prefixed ms_; outline names are read as a fallback)
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // Small reusable set pieces
  // ------------------------------------------------------------------
  /** One candle: wax column (+ drips), wick, wax pool decal, and a flickering flame glow. Returns the flame height. */
  K.candle = function (b, glows, x, y, z, h, r, o) {
    o = o || {};
    r = r || 0.03;
    h = h || 0.15;
    b.cyl(o.mat || "wax", x, y, z, r * 1.08, r, h, 7, {
      tint: o.tint || 0xf2e6c8,
      grime: 0.05,
      rows: 1,
    });
    if (h > 0.08 && !o.noDrip)
      b.cyl(
        "wax",
        x + r * 0.7,
        y + h * 0.35,
        z,
        r * 0.28,
        r * 0.18,
        h * 0.55,
        4,
        { tint: 0xece0c0, grime: 0, rows: 1 },
      );
    b.beam("iron", x, y + h, z, x, y + h + 0.018, z, 0.006, { grime: 0 });
    if (glows && !o.out)
      glows.add(
        x,
        y + h + 0.035,
        z,
        o.color || 0xffb050,
        o.size || 0.14 + r * 1.2,
        o.flick === undefined ? 1 : o.flick,
      );
    return y + h + 0.035;
  };
  /** A run of candles along a line (a shelf, a ledge, a step edge). Returns flame positions for aggregate lights. */
  K.candleRow = function (b, glows, ax, y, az, bx, bz, spacing, rng, o) {
    o = o || {};
    const L = Math.hypot(bx - ax, bz - az),
      n = Math.max(1, Math.floor(L / spacing));
    const out = [];
    for (let i = 0; i < n; i++) {
      if (rng() < (o.gaps || 0.15)) continue;
      const t = (i + 0.5) / n,
        jx = (rng() - 0.5) * (o.jitter || 0.05),
        jz = (rng() - 0.5) * (o.jitter || 0.05);
      const h =
          (o.hMin || 0.05) + rng() * ((o.hMax || 0.22) - (o.hMin || 0.05)),
        r = (o.rMin || 0.022) + rng() * ((o.rMax || 0.04) - (o.rMin || 0.022));
      const out1 = rng() < (o.outFrac || 0.08);
      const fy = K.candle(
        b,
        glows,
        ax + (bx - ax) * t + jx,
        y,
        az + (bz - az) * t + jz,
        h,
        r,
        { out: out1 },
      );
      if (!out1) out.push([ax + (bx - ax) * t, fy, az + (bz - az) * t]);
    }
    return out;
  };
  /** Half-ellipse wall fill (lunette) in a vertical plane: centre (cx, ys, cz) of the springing line, half-width a, rise h, facing yaw. */
  K.lunette = function (b, mat, cx, ys, cz, a, h, face, o) {
    const sh = new THREE.Shape();
    sh.moveTo(-a, 0);
    for (let i = 0; i <= 24; i++) {
      const t = (Math.PI * i) / 24;
      sh.lineTo(-a * Math.cos(t), h * Math.sin(t));
    }
    sh.lineTo(-a, 0);
    const g = new THREE.ShapeGeometry(sh, 1);
    // tessellate a little so the bake has vertices to light
    const pts = [];
    for (let j = 0; j <= 6; j++)
      for (let i = 0; i <= 16; i++) {
        const u = -a + (2 * a * i) / 16,
          vmax = h * Math.sqrt(Math.max(0, 1 - (u / a) * (u / a)));
        pts.push([u, (vmax * j) / 6]);
      }
    const pos = [],
      idx = [];
    pts.forEach((p) => pos.push(p[0], p[1], 0));
    for (let j = 0; j < 6; j++)
      for (let i = 0; i < 16; i++) {
        const k = j * 17 + i;
        idx.push(k, k + 1, k + 18, k, k + 18, k + 17);
      }
    const gg = new THREE.BufferGeometry();
    gg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    gg.setIndex(idx);
    gg.computeVertexNormals();
    g.dispose();
    b.geo(mat, gg, Object.assign({ x: cx, y: ys, z: cz, ry: face }, o || {}));
    gg.dispose();
    return b;
  };

  K.Q = () => (K.live("quests") ? G.quests : null);
  K.flag = function (name) {
    const Q = K.Q();
    return Q ? Q.flag(name) : undefined;
  };
  K.setFlag = function (name, v) {
    const Q = K.Q();
    if (Q) Q.setFlag(name, v === undefined ? true : v);
  };
  /** Main-story flag: ms_<name>, then the outline's bare name. */
  K.ms = function (name) {
    const a = K.flag("ms_" + name);
    if (a !== undefined && a !== null) return a;
    return K.flag(name);
  };
  K.L = () => (K.live("quests") && G.quests.lib) || null;
  K.notify = function (text, opts) {
    K.safe("notify", () => G.notify(text, opts));
  };
  K.sfx = function (name, opts) {
    if (K.live("sfx")) K.safe("sfx", () => G.sfx.play(name, opts));
  };
  K.heroName = () => (G.HERO && G.HERO.name) || "Eli Wayte";
  K.heroFirst = () => String(K.heroName()).split(" ")[0];
})();
