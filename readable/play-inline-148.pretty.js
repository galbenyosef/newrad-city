/* src/poi_uptown/00_kit.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN (order 26)
 * 00_kit.js — shared toolkit for the five uptown points of interest
 * (AMNH, The Dakota, The Plaza, Carnegie Hall, Tiffany & Co.).
 *
 *  P.mat(key)        shared materials (G.mats surfaces when present, own
 *                    fallbacks otherwise) + '@lit' baked-light variants
 *  P.Batch           geometry collector: world-projected UVs, vertex AO /
 *                    grime, optional baked interior light (per-vertex lamp
 *                    light stored in a `bake` attribute and added as
 *                    emission), merged into ONE mesh per material
 *  P.site(...)       a builder context: batch + colliders + rooms/walls/
 *                    stairs + anchors + queued props/pickups/containers
 *  P.face(...)       facade helper (u along the wall, d out of it)
 *
 * Private namespace G._pu (this directory only). Techniques adapted from
 * landmarks_b/00_lib.js (baked light, merged batches) — own code.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const U = G.util;

  const P = (G._pu = G._pu || {});

  // ---- Locks: every locked door, container, safe and terminal is declared to G.locks and opened through it
  // (a key item, a keypad code or a terminal passcode, always placed somewhere in this module's content).
  P.locksLive = () =>
    !!(G.locks && !G.isStub("locks") && typeof G.locks.open === "function");
  /** Declare a lock spec {id, label, key?|code?|passcode?, hint?} for the audit (queued until the locks module is up); returns the spec. */
  P._lockQueue = P._lockQueue || [];
  P.lockReg = function (spec) {
    if (!P.locksLive() || !G.locks.register) {
      P._lockQueue.push(spec);
      if (!P._lockQueueHooked) {
        P._lockQueueHooked = true;
        G.events.on("initDone", () => {
          const q = P._lockQueue.splice(0);
          for (const s of q) P.lockReg(s);
        });
      }
      return spec;
    }
    try {
      G.locks.register(spec);
    } catch (e) {
      G.reportError("poi_uptown:lockReg:" + spec.id, e);
    }
    return spec;
  };
  /** Open through G.locks: onOpen runs once it is open (key held, code typed, or already open). */
  P.lockOpen = function (spec, onOpen) {
    if (!P.locksLive()) {
      onOpen();
      return;
    } // the locks module is not loaded in this build
    if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
      onOpen();
      return;
    }
    G.locks.open(spec, onOpen);
  };
  P.lockIsOpen = (id) =>
    !P.locksLive() || !G.locks.isOpen || !!G.locks.isOpen(id);
  /** The player has read / heard the code or passcode of lock id (logged in Goggles → NOTES → CODES). */
  P.lockLearn = function (id) {
    try {
      if (P.locksLive() && G.locks.learn) G.locks.learn(id);
    } catch (e) {
      G.reportError("poi_uptown:lockLearn:" + id, e);
    }
  };
  /** Learn lock(s) when the player picks up or reads the note / tape reel item that carries the code. */
  P.learnFromItem = function (itemId, lockId) {
    const m = (P._learnMap = P._learnMap || {});
    (m[itemId] = m[itemId] || []).push(lockId);
    if (P._learnHooked) return;
    P._learnHooked = true;
    const fire = (id) => {
      const l = m[id];
      if (l) l.forEach(P.lockLearn);
    };
    G.events.on("itemAdded", fire);
    G.events.on("noteRead", fire);
  };
  /** Attach the lock spec to a spawned container handle (props / containers) when the owner did not copy it. */
  P.lockContainer = function (handle, spec) {
    if (!spec) return;
    P.lockReg(spec);
    const c =
      handle &&
      (handle.container || (handle.items !== undefined ? handle : null));
    if (c && !c.lock) c.lock = spec;
  };
  P.builders = []; // {id, fn, order}
  P.onReady = []; // initDone (props / items / terminals live)
  P.onNewGame = []; // newGame (dynamic: NPCs, quest state)
  P.onReset = []; // reset (before newGame and before a save load)
  P.onLoaded = []; // loaded (after every module applied its save)
  P.animators = []; // {c:{x,z}, r2, fn(t, dt)}
  P.interiors = []; // {key, root, ox, oz}
  P.saveHooks = {}; // key → {save(), load(d)}
  P.sites = []; // every site built (queued props / pickups / containers spawn at initDone)
  P.addBuilder = (id, fn, order) =>
    P.builders.push({ id, fn, order: order || 50 });
  // Exterior/interior file split: an exterior file (NN_site.js) builds the street site and calls
  // P.finishSite(id, EX); the matching NN_site_interior.js registers P.interiorBuilders[id](EX), which builds
  // the interior cell, the street<->interior doors and the G.pois entry.
  P.interiorBuilders = {};
  // -------------------------------------------------------------------
  // Dynamic interior light (the shared PointLight pool). Static geometry keeps its baked vertex light;
  // every real light source of an interior cell (lamps, chandeliers, sconces, candles, fires, boiler
  // glow, fill lamps) is registered as a fixture with atmosphere's pool (G.atmos.addFixtureLight →
  // the flash PointLight pool, CONTRACT ≤ 6 dynamic lights): the 2 nearest/brightest get a real
  // PointLight while the player is in the cell, so NPCs, creatures, the viewmodel and loose props are
  // lit by the room's lamps (and flicker by its fires). No PointLight is ever created here.
  // -------------------------------------------------------------------
  P.fixtureStats = { sites: 0, lights: 0 };
  P.registerFixtureLights = function (S, lights) {
    const A = G.atmos;
    if (
      !A ||
      typeof A.addFixtureLight !== "function" ||
      !lights ||
      !lights.length
    )
      return 0;
    const kept = [];
    // strongest first; lights within 1.8 m of a stronger one merge into it (candle clusters, chandelier arms)
    const list = lights
      .filter((l) => l.i >= 0.25 && l.r >= 3)
      .sort((a, b) => b.i * b.r - a.i * a.r);
    for (const l of list) {
      if (kept.length >= 160) break;
      if (kept.some((k) => k.p.distanceToSquared(l.p) < 1.8 * 1.8)) continue;
      kept.push(l);
    }
    const hsl = {};
    for (const l of kept) {
      l.c.getHSL(hsl);
      // fire / candle / furnace colours (warm, saturated) flicker; green rad glow and cold fluorescents stay steady
      const warm = hsl.h < 0.12 && hsl.s > 0.6 && l.c.b < 0.55;
      const big = l.r >= 16; // skylights, big fills: broad and soft
      A.addFixtureLight(l.p.clone(), l.c.clone(), {
        intensity: P.clamp(0.35 + l.i * 0.55, 0.4, 1.05) * (big ? 0.7 : 1),
        range: P.clamp(l.r * (big ? 0.6 : 0.85), 4, 12),
        flicker: warm ? 0.22 : 0,
        glow: false, // the site already draws its own glow sprites
      });
    }
    P.fixtureStats.sites++;
    P.fixtureStats.lights += kept.length;
    return kept.length;
  };
  /**
   * One-way door, barred from the far side: shows "Barred", opens for good once the player comes through
   * from the other side (door.unbar()). It is not a lock (there is no key or code); the unbarred state is
   * saved per door id under 'poi_uptown:bars' and reset on a new game.
   */
  P.bars = P.bars || {};
  P.barDoor = function (door, o) {
    if (!door) return door;
    o = o || {};
    const id = String(
      o.id || (door.def && door.def.id) || "bar" + Object.keys(P.bars).length,
    );
    const inner = door.onInteract;
    door._barred = !P.bars[id];
    door.locked = () =>
      door._barred ? o.lockText || "Barred from the other side" : null;
    door.onInteract = function () {
      if (door._barred) {
        if (G.sfx && G.sfx.play) G.sfx.play("door_locked");
        G.notify(o.message || "This door is barred from the other side.");
        return;
      }
      return inner.apply(door, arguments);
    };
    door.unbar = function (silent) {
      if (!door._barred) return false;
      door._barred = false;
      P.bars[id] = true;
      if (o.unbarMessage && !silent) G.notify(o.unbarMessage);
      return true;
    };
    door.rebar = function () {
      door._barred = true;
      delete P.bars[id];
    };
    (P._barDoors = P._barDoors || []).push({ id, door });
    if (!P._barHooked) {
      P._barHooked = true;
      const rebarAll = () => {
        for (const b of P._barDoors) b.door.rebar();
      };
      G.events.on("newGame", rebarAll);
      G.events.on("reset", rebarAll);
      if (G.save && G.save.register)
        G.save.register("poi_uptown:bars", {
          save: () => Object.keys(P.bars),
          load: (d) => {
            for (const b of P._barDoors)
              if ((d || []).indexOf(b.id) >= 0) b.door.unbar(true);
          },
        });
    }
    return door;
  };
  P.finishSite = function (id, EX) {
    const fn = P.interiorBuilders[id];
    if (fn) return fn(EX);
    const E = EX && EX.S ? EX.S : EX;
    return P.register(id, {
      root: E.root,
      anchors: Object.assign({}, E.anchors),
    });
  };
  const TAU = Math.PI * 2,
    PI = Math.PI,
    HP = Math.PI / 2;
  P.TAU = TAU;
  P.PI = PI;
  P.HP = HP;
  P.rng = (seed) => U.rng(typeof seed === "string" ? U.hashStr(seed) : seed);
  P.v3 = (x, y, z) => new THREE.Vector3(x, y, z);
  P.clamp = U.clamp;
  P.lerp = U.lerp;
  P.safe = function (where, fn) {
    try {
      return fn();
    } catch (e) {
      G.reportError("poi_uptown:" + where, e);
      return undefined;
    }
  };
  P.m4 = function (x, y, z, ry, rx, rz, sx, sy, sz) {
    const e = new THREE.Euler(rx || 0, ry || 0, rz || 0, "YXZ");
    const s = new THREE.Vector3(
      sx === undefined ? 1 : sx,
      sy === undefined ? (sx === undefined ? 1 : sx) : sy,
      sz === undefined ? (sx === undefined ? 1 : sx) : sz,
    );
    return new THREE.Matrix4().compose(
      new THREE.Vector3(x || 0, y || 0, z || 0),
      new THREE.Quaternion().setFromEuler(e),
      s,
    );
  };

  // ===================================================================
  // Canvas textures (own)
  // ===================================================================
  const texCache = {};
  P.canvasTex = function (key, w, h, draw, opts) {
    if (texCache[key]) return texCache[key];
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    try {
      draw(ctx, w, h);
    } catch (e) {
      G.reportError("poi_uptown:tex " + key, e);
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT =
      opts && opts.clamp ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    t.needsUpdate = true;
    return (texCache[key] = t);
  };
  function fitFont(ctx, lines, fs, maxW, fam, weight) {
    ctx.font = (weight || "bold") + " " + fs + "px " + fam;
    let mw = 0;
    for (const t of lines) mw = Math.max(mw, ctx.measureText(t).width);
    return mw > maxW ? Math.floor((fs * maxW) / mw) : fs;
  }
  function speckle(ctx, w, h, r, n, dark, light) {
    for (let i = 0; i < n; i++) {
      ctx.fillStyle =
        r() < 0.5
          ? "rgba(20,14,8," + r() * (dark || 0.3) + ")"
          : "rgba(255,250,235," + r() * (light || 0.15) + ")";
      const s = 0.6 + r() * 1.8;
      ctx.fillRect(r() * w, r() * h, s, s);
    }
  }
  function blotches(ctx, w, h, r, n, a) {
    for (let i = 0; i < n; i++) {
      const x = r() * w,
        y = r() * h,
        rr = 10 + r() * 70;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
      g.addColorStop(0, "rgba(40,30,18," + (0.05 + r() * (a || 0.15)) + ")");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
  }
  P.speckle = speckle;
  P.blotches = blotches;
  const SERIF = '"Times New Roman", Georgia, serif',
    SANS = '"Futura", "Century Gothic", "Trebuchet MS", sans-serif',
    DECO = '"Oswald", "Futura", "Arial Narrow", sans-serif';
  P.FONTS = { SERIF, SANS, DECO };

  /**
   * Lettering texture. style: 'engraved' (carved in stone), 'gilt' (gold letters on dark), 'bronze' (bronze letters, transparent bg),
   * 'banner' (museum / theatre banner), 'label' (exhibit label card), 'poster', 'raider' (spray on scrap), 'marquee', 'brass' (plate)
   */
  P.signTex = function (key, lines, style, w, h, o) {
    o = o || {};
    w = w || 512;
    h = h || 128;
    return P.canvasTex(
      "pu_sign_" + key,
      w,
      h,
      (ctx) => {
        const r = P.rng(key);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const L = lines.length;
        const draw = (fam, weight, col, shadow, lh) => {
          let fs =
            o.size || Math.floor((h * (o.fill || 0.7)) / (L * (lh || 1.1)));
          fs = fitFont(ctx, lines, fs, w * (o.maxW || 0.9), fam, weight);
          ctx.font = (weight || "bold") + " " + fs + "px " + fam;
          if (o.spacing)
            try {
              ctx.letterSpacing = o.spacing + "px";
            } catch (e) {
              /* old canvas */
            }
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (L - 1) / 2) * fs * (lh || 1.1);
            if (shadow) {
              ctx.fillStyle = shadow;
              ctx.fillText(t, w / 2 + 1.5, y + 2);
            }
            ctx.fillStyle = col;
            ctx.fillText(t, w / 2, y);
          });
          return fs;
        };
        if (style === "engraved") {
          ctx.fillStyle = o.bg || "#bdb49e";
          ctx.fillRect(0, 0, w, h);
          blotches(ctx, w, h, r, 30, 0.12);
          speckle(ctx, w, h, r, 900);
          draw(
            SERIF,
            "bold",
            o.fg || "rgba(52,44,34,0.9)",
            "rgba(255,250,235,0.35)",
            1.15,
          );
        } else if (style === "gilt") {
          ctx.fillStyle = o.bg || "#1b1712";
          ctx.fillRect(0, 0, w, h);
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "#f6dc8a");
          g.addColorStop(0.5, "#c8952e");
          g.addColorStop(1, "#7a5518");
          draw(o.font || SERIF, "bold", g, "rgba(0,0,0,0.7)", 1.1);
          speckle(ctx, w, h, r, 300, 0.4, 0.05);
        } else if (style === "bronze") {
          ctx.clearRect(0, 0, w, h);
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, o.c0 || "#a8905a");
          g.addColorStop(1, o.c1 || "#4e3f24");
          draw(o.font || SANS, "bold", g, "rgba(0,0,0,0.55)", 1.1);
        } else if (style === "banner") {
          ctx.fillStyle = o.bg || "#8e2b25";
          ctx.fillRect(0, 0, w, h);
          if (o.emblem) {
            try {
              o.emblem(ctx, w, h, r);
            } catch (e) {
              /* ignore */
            }
          }
          ctx.fillStyle = o.fg || "#eadcbc";
          let fs = o.size || Math.floor(w * 0.15);
          fs = fitFont(ctx, lines, fs, w * 0.86, o.font || SANS, "bold");
          ctx.font = "bold " + fs + "px " + (o.font || SANS);
          lines.forEach((t, i) =>
            ctx.fillText(
              t,
              w / 2,
              h * (o.top || 0.12) + fs * 0.6 + i * fs * 1.2,
            ),
          );
          const gr = ctx.createLinearGradient(0, 0, 0, h);
          gr.addColorStop(0, "rgba(255,240,200,0.2)");
          gr.addColorStop(1, "rgba(30,20,10,0.4)");
          ctx.fillStyle = gr;
          ctx.fillRect(0, 0, w, h);
          blotches(ctx, w, h, r, 26, 0.25);
        } else if (style === "label") {
          ctx.fillStyle = o.bg || "#d9cfb4";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(40,30,20,0.6)";
          ctx.lineWidth = 3;
          ctx.strokeRect(6, 6, w - 12, h - 12);
          ctx.fillStyle = "#2a2218";
          ctx.textAlign = "left";
          let fs = Math.floor(h * 0.22);
          ctx.font = "bold " + fs + "px " + SERIF;
          ctx.fillText(lines[0] || "", 18, h * 0.24);
          ctx.font = "italic " + Math.floor(fs * 0.7) + "px " + SERIF;
          ctx.fillText(lines[1] || "", 18, h * 0.46);
          ctx.font = Math.floor(fs * 0.55) + "px " + SERIF;
          for (let i = 2; i < lines.length; i++)
            ctx.fillText(lines[i], 18, h * 0.62 + (i - 2) * fs * 0.62);
          blotches(ctx, w, h, r, 18, 0.25);
          speckle(ctx, w, h, r, 400);
        } else if (style === "poster") {
          ctx.fillStyle = o.bg || "#e2d3a8";
          ctx.fillRect(0, 0, w, h);
          if (o.art) {
            try {
              o.art(ctx, w, h, r);
            } catch (e) {
              /* ignore */
            }
          }
          ctx.fillStyle = o.fg || "#7a1f18";
          let fs = Math.floor(h * 0.1);
          fs = fitFont(ctx, lines, fs, w * 0.86, o.font || DECO, "bold");
          ctx.font = "bold " + fs + "px " + (o.font || DECO);
          lines.forEach((t, i) =>
            ctx.fillText(t, w / 2, h * (o.top || 0.14) + i * fs * 1.25),
          );
          blotches(ctx, w, h, r, 30, 0.3);
          speckle(ctx, w, h, r, 600);
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(0, h - 6, w, 6);
        } else if (style === "raider") {
          ctx.clearRect(0, 0, w, h);
          ctx.lineJoin = "round";
          let fs = Math.floor((h * 0.8) / L);
          fs = fitFont(
            ctx,
            lines,
            fs,
            w * 0.92,
            'Impact, "Arial Black", sans-serif',
            "bold",
          );
          ctx.font = "bold " + fs + 'px Impact, "Arial Black", sans-serif';
          lines.forEach((t, i) => {
            const y = h / 2 + (i - (L - 1) / 2) * fs;
            ctx.save();
            ctx.translate(w / 2, y);
            ctx.rotate((r() - 0.5) * 0.1);
            ctx.strokeStyle = "rgba(10,8,6,0.8)";
            ctx.lineWidth = fs * 0.12;
            ctx.strokeText(t, 0, 0);
            ctx.fillStyle = o.fg || "#c42a1e";
            ctx.fillText(t, 0, 0);
            for (let k = 0; k < 10; k++)
              ctx.fillRect(
                (r() - 0.5) * w * 0.8,
                fs * 0.2,
                2 + r() * 2,
                5 + r() * fs * 0.6,
              );
            ctx.restore();
          });
        } else if (style === "marquee") {
          ctx.fillStyle = o.bg || "#1a1410";
          ctx.fillRect(0, 0, w, h);
          for (let x = 10; x < w; x += 22)
            for (const y of [8, h - 8]) {
              ctx.fillStyle = r() < 0.3 ? "#3a2c1a" : "#ffe2a0";
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, TAU);
              ctx.fill();
            }
          draw(
            o.font || DECO,
            "bold",
            o.fg || "#f4e4b8",
            "rgba(0,0,0,0.6)",
            1.15,
          );
        } else if (style === "brass") {
          const g = ctx.createLinearGradient(0, 0, w, h);
          g.addColorStop(0, "#b89a58");
          g.addColorStop(0.5, "#e0c47c");
          g.addColorStop(1, "#8a6c34");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "rgba(60,40,10,0.8)";
          ctx.lineWidth = 6;
          ctx.strokeRect(5, 5, w - 10, h - 10);
          draw(
            o.font || SERIF,
            "bold",
            "#3a2a10",
            "rgba(255,240,200,0.4)",
            1.1,
          );
          blotches(ctx, w, h, r, 20, 0.3);
        } else if (style === "neon") {
          ctx.fillStyle = "#060504";
          ctx.fillRect(0, 0, w, h);
          ctx.shadowColor = o.fg || "#ff7a3a";
          ctx.shadowBlur = 16;
          draw(o.font || DECO, "bold", o.fg || "#ffb070", null, 1.1);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = o.bg || "#222";
          ctx.fillRect(0, 0, w, h);
          draw(o.font || SANS, "bold", o.fg || "#ddd", null, 1.1);
        }
      },
      { clamp: true },
    );
  };

  // ===================================================================
  // Materials
  // ===================================================================
  // key → {src: G.mats/G.tex name, tint, color (fallback), rough, metal, uv (m/tile fallback), emissive, ei, custom, opts}
  const MAT = {
    limestone: {
      src: "stone_limestone",
      tint: 0xf4ece0,
      color: 0xbdb39c,
      uv: 4,
    },
    limestone_dark: {
      src: "stone_limestone",
      tint: 0x9a917c,
      color: 0x958c78,
      uv: 4,
    },
    granite: { src: "granite", color: 0x8d8880, uv: 3 },
    granite_pink: { src: "granite", tint: 0xd8aa98, color: 0xa87a6a, uv: 3 },
    granite_dark: { src: "granite", tint: 0x7c7870, color: 0x6c6862, uv: 3 },
    brownstone: { src: "stone_brownstone", color: 0x7a5646, uv: 3 },
    brick_buff: { src: "brick_tan", tint: 0xf0dca8, color: 0xc8a870, uv: 3 },
    brick_roman: { src: "brick_brown", tint: 0xd89478, color: 0x8a5040, uv: 3 },
    brick_red: { src: "brick_red", color: 0x7f4a3a, uv: 3 },
    brick_white: { src: "brick_white", tint: 0xf2eee4, color: 0xd8d4c8, uv: 3 },
    terracotta: {
      src: "stone_limestone",
      tint: 0xd49a78,
      color: 0xb87858,
      uv: 3,
    },
    marble: { src: "marble", color: 0xd9d4c8, uv: 3 },
    marble_dark: { src: "marble_dark", tint: 0x8c8478, color: 0x3a3e38, uv: 3 }, // tinted: the raw texture's bright green veins read as maps on big walls
    marble_green: {
      src: "marble_dark",
      tint: 0x6a9a80,
      color: 0x3a5a48,
      uv: 3,
    },
    terrazzo: { src: "terrazzo", color: 0xb8b0a0, uv: 2 },
    tile: { src: "tile_floor", color: 0x9a9890, uv: 2 },
    tile_white: { src: "tile_subway", color: 0xd0d0c8, uv: 1.2 },
    concrete: { src: "concrete", color: 0x8f8b82, uv: 4 },
    concrete_dark: { src: "concrete_dark", color: 0x5e5b55, uv: 4 },
    plaster: { custom: "plaster_fine", tint: 0xc8c0ac, color: 0xa39c88, uv: 4 },
    plaster_cream: {
      custom: "plaster_fine",
      tint: 0xf0e6cc,
      color: 0xd0c4a4,
      uv: 4,
    },
    plaster_green: {
      custom: "plaster_fine",
      tint: 0x98b096,
      color: 0x7c9478,
      uv: 4,
    },
    plaster_red: {
      custom: "plaster_fine",
      tint: 0xb8705e,
      color: 0x9a5a4a,
      uv: 4,
    },
    plaster_blue: {
      custom: "plaster_fine",
      tint: 0x8aa0b8,
      color: 0x6a8098,
      uv: 4,
    },
    plaster_ruin: { src: "plaster_stained", color: 0xa39c88, uv: 3 },
    wallpaper: { custom: "stripes", tint: 0xd8ccb0, color: 0x8a8a70, uv: 1.6 },
    wallpaper_rose: {
      custom: "stripes",
      tint: 0xf0b8b0,
      color: 0xb88880,
      uv: 1.6,
    },
    wallpaper_green: {
      custom: "damask",
      tint: 0xa8c8a0,
      color: 0x80a078,
      uv: 1.6,
    },
    wood: { src: "wood_planks", color: 0x6d5a44, uv: 2 },
    wood_dark: { src: "wood_planks", tint: 0x6a4c34, color: 0x4a3424, uv: 2 },
    wood_oak: { custom: "oak_panel", color: 0x6a4a2a, uv: 2.4 },
    wood_rotten: { src: "wood_rotten", color: 0x54473a, uv: 2 },
    parquet: { custom: "parquet", color: 0x8a6440, uv: 2.4, rough: 0.55 },
    carpet_red: { custom: "carpet_red", color: 0x7a2a24, uv: 3, rough: 1 },
    carpet: { src: "carpet", color: 0x6a2a24, uv: 2 },
    velvet: {
      src: "fabric",
      tint: 0xb03a30,
      color: 0x7a2420,
      uv: 0.8,
      rough: 1,
    },
    fabric: { src: "fabric", color: 0x7a7060, uv: 0.8 },
    fabric_white: { src: "fabric", tint: 0xe8e0d0, color: 0xb8b0a0, uv: 0.8 },
    fabric_pink: { src: "fabric", tint: 0xe8a8b8, color: 0xb87888, uv: 0.8 },
    damask: { custom: "damask", color: 0x6a5a40, uv: 1.6 },
    iron: { src: "iron", color: 0x2f322f, uv: 2, metal: 0.55, rough: 0.6 },
    steel: { src: "steel", color: 0x6a6e64, uv: 2, metal: 0.5 },
    chrome: { src: "chrome", color: 0x9a9a98, uv: 2, metal: 0.9, rough: 0.3 },
    rust: { src: "rust", color: 0x6e4a32, uv: 2 },
    metal: { src: "metal_painted", color: 0x5a5e58, uv: 2 },
    panel: { src: "metal_panel", color: 0x6a6a62, uv: 2 },
    bronze: { src: "bronze", color: 0x5a4a30, uv: 2, metal: 0.6 },
    verdigris: { src: "copper_patina", color: 0x6aa892, uv: 3 },
    copper: { src: "copper_patina", color: 0x5f9884, uv: 3 },
    gold: { src: "gold", color: 0xc89a3a, uv: 1, metal: 0.8, rough: 0.35 },
    slate: { custom: "slate", color: 0x4a4c50, uv: 3 },
    roof_tar: { src: "roof_tar", color: 0x3a3836, uv: 4 },
    glass: { src: "glass", color: 0x6a7a78, uv: 2, noShadow: true },
    glass_night: {
      color: 0x1c2836,
      emissive: 0x30466a,
      ei: 0.55,
      rough: 0.1,
      metal: 0.2,
      uv: 4,
      noShadow: true,
    }, // curtain wall seen from inside at night (sky glow)
    glass_tint: {
      color: 0x40504f,
      rough: 0.12,
      metal: 0.25,
      opacity: 0.66,
      uv: 2,
      noShadow: true,
    }, // curtain-wall glass that still reads from the street
    glass_dark: { src: "window_dark", color: 0x151a18, uv: 2, noShadow: true },
    glass_broken: {
      src: "glass_broken",
      color: 0x07090a,
      uv: 2,
      noShadow: true,
    },
    window_lit: {
      src: "emissive_window",
      color: 0x3a3524,
      emissive: 0xffc870,
      ei: 1.0,
      uv: 2,
      noShadow: true,
    },
    rubble: { src: "rubble", color: 0x77716a, uv: 3 },
    dirt: { src: "dirt", color: 0x5d4f3c, uv: 4 },
    grass: { src: "grass_dead", color: 0x6b6a45, uv: 4 },
    asphalt: { src: "asphalt", color: 0x3c3b39, uv: 8 },
    sidewalk: { src: "sidewalk", color: 0x8a8680, uv: 3 },
    bone: { src: "bone", color: 0xc8bc9c, uv: 0.6, tint: 0xe0d6bc },
    bone_dark: { src: "bone", tint: 0x9a8c6c, color: 0x8a7c5c, uv: 0.6 },
    paper: { src: "paper", color: 0xd8d0b8, uv: 0.5, noShadow: true },
    crate: { src: "crate_wood", color: 0x8a7050, uv: 1 },
    leather: { src: "leather", color: 0x5a3a24, uv: 0.6 },
    rubber: { src: "rubber", color: 0x1c1c1c, uv: 0.5 },
    corrugated: { src: "corrugated", color: 0x74705f, uv: 2 },
    tiffany: { custom: "tiffany_blue", color: 0x81d8d0, uv: 2 },
    paint_black: { src: "paint_black", color: 0x1a1a1a, uv: 2 },
    paint_white: { src: "paint_white", color: 0xd8d4c8, uv: 2 },
    paint_red: { src: "paint_red", color: 0x7e2a22, uv: 2 },
    paint_cream: { src: "paint_cream", color: 0xd8ceb0, uv: 2 },
    paint_green: { src: "paint_green", color: 0x3a5a3a, uv: 2 },
    paint_blue: { src: "paint_blue", color: 0x2a4a7a, uv: 2 },
    skin: { src: "skin_base", color: 0xb08868, uv: 0.4 },
    hide_grey: { src: "leather", tint: 0x8a8680, color: 0x6a6660, uv: 1.2 },
    hide_tan: { src: "leather", tint: 0xd8b078, color: 0xa88048, uv: 1.2 },
    hide_dark: { src: "leather", tint: 0x4a4038, color: 0x3a3028, uv: 1.2 },
    hide_zebra: { custom: "zebra", color: 0xd8d0c0, uv: 0.9 },
    hide_spots: { custom: "spots", color: 0xc89858, uv: 0.7 },
    foliage: { custom: "foliage", color: 0x3a5a2a, uv: 1.5 },
    whale: { src: "metal_painted", tint: 0x8aa0c0, color: 0x5a6a80, uv: 3 },
    water_toxic: {
      color: 0x10180e,
      emissive: 0x2aa030,
      ei: 0.22,
      rough: 0.06,
      metal: 0.55,
      uv: 6,
      plain: true,
      noShadow: true,
      opacity: 0.88,
    },
    // emissive (never baked)
    lamp: {
      color: 0xfff0c8,
      emissive: 0xffe0a0,
      ei: 2.2,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_dim: {
      color: 0xd8c898,
      emissive: 0xffc870,
      ei: 0.9,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_green: {
      color: 0x70ff90,
      emissive: 0x30ff60,
      ei: 1.8,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    lamp_red: {
      color: 0xff5040,
      emissive: 0xff2a1a,
      ei: 2.0,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    fire: {
      color: 0xffa040,
      emissive: 0xff7a20,
      ei: 3.0,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    candle: {
      color: 0xffd890,
      emissive: 0xffb050,
      ei: 2.4,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    slime: {
      color: 0x1a3a14,
      emissive: 0x3aff50,
      ei: 0.45,
      rough: 0.1,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    screen: {
      color: 0x2a6a3a,
      emissive: 0x40ff70,
      ei: 0.9,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    crystal: {
      color: 0xeaf4ff,
      emissive: 0xfff4d8,
      ei: 0.9,
      rough: 0.1,
      metal: 0.2,
      plain: true,
      noShadow: true,
      uv: 1,
    },
    stained: {
      custom: "stained_glass",
      color: 0xd8b070,
      emissive: 0xffffff,
      ei: 1.15,
      emissiveCustom: true,
      uv: 1,
      keep: true,
      noShadow: true,
    },
    stars: {
      custom: "stars",
      color: 0x000000,
      emissive: 0xffffff,
      ei: 1.3,
      emissiveCustom: true,
      uv: 1,
      keep: true,
      noShadow: true,
    },
    sphere_white: {
      src: "metal_panel",
      tint: 0xf4f6f6,
      color: 0xd8dcdc,
      uv: 3,
    },
    whale_skin: { custom: "whale_skin", color: 0x5a6a80, uv: 1, keep: true },
    whale_belly: {
      src: "metal_painted",
      tint: 0xb8c0c8,
      color: 0x9aa0a8,
      uv: 3,
    },
  };
  P.MAT = MAT;
  // Materials not given distance LOD / shadows (tiny parts)
  const DETAIL = new Set([
    "iron",
    "bronze",
    "chrome",
    "gold",
    "bone",
    "bone_dark",
    "paper",
    "fabric",
    "fabric_white",
    "fabric_pink",
    "velvet",
    "crystal",
    "candle",
    "leather",
    "rubber",
    "crate",
    "screen",
  ]);
  const NO_SHADOW = new Set();
  const baseKey = (k) => (k.slice(-4) === "@lit" ? k.slice(0, -4) : k);
  P.baseKey = baseKey;
  const isEmissive = (k) => {
    const d = MAT[baseKey(k)];
    return !!(d && d.emissive !== undefined);
  };
  P.isEmissive = isEmissive;

  // ---- custom surfaces ------------------------------------------------
  const CUSTOM = {
    oak_panel: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("oak");
        ctx.fillStyle = "#5a3c22";
        ctx.fillRect(0, 0, w, h);
        for (let y = 0; y < h; y += 2) {
          ctx.fillStyle =
            "rgba(" +
            ((90 + r() * 40) | 0) +
            "," +
            ((58 + r() * 24) | 0) +
            ",30," +
            (0.12 + r() * 0.2) +
            ")";
          ctx.fillRect(0, y, w, 1 + r() * 2);
        }
        // raised panels
        for (let i = 0; i < 2; i++)
          for (let j = 0; j < 2; j++) {
            const x0 = (i * w) / 2 + 18,
              y0 = (j * h) / 2 + 18,
              pw = w / 2 - 36,
              ph = h / 2 - 36;
            ctx.strokeStyle = "rgba(20,10,4,0.7)";
            ctx.lineWidth = 5;
            ctx.strokeRect(x0, y0, pw, ph);
            ctx.strokeStyle = "rgba(200,150,90,0.25)";
            ctx.lineWidth = 2;
            ctx.strokeRect(x0 + 4, y0 + 4, pw - 8, ph - 8);
          }
        blotches(ctx, w, h, r, 20, 0.2);
      },
    ],
    parquet: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("parq"),
          n = 8,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const hor = (i + j) % 2 === 0;
            for (let k = 0; k < 4; k++) {
              const c = 110 + r() * 40;
              ctx.fillStyle =
                "rgb(" +
                (c | 0) +
                "," +
                ((c * 0.72) | 0) +
                "," +
                ((c * 0.45) | 0) +
                ")";
              if (hor) ctx.fillRect(i * s, j * s + (k * s) / 4, s, s / 4 - 1);
              else ctx.fillRect(i * s + (k * s) / 4, j * s, s / 4 - 1, s);
            }
          }
        blotches(ctx, w, h, r, 40, 0.3);
        speckle(ctx, w, h, r, 1500);
      },
    ],
    carpet_red: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("carp");
        ctx.fillStyle = "#6e1e1a";
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = "rgba(210,160,70,0.55)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 4; i++)
          for (let j = 0; j < 4; j++) {
            const cx = ((i + 0.5) * w) / 4,
              cy = ((j + 0.5) * h) / 4;
            ctx.beginPath();
            ctx.ellipse(cx, cy, 34, 20, 0, 0, TAU);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - 50, cy);
            ctx.lineTo(cx, cy - 40);
            ctx.lineTo(cx + 50, cy);
            ctx.lineTo(cx, cy + 40);
            ctx.closePath();
            ctx.stroke();
            ctx.fillStyle = "rgba(30,50,60,0.5)";
            ctx.beginPath();
            ctx.arc(cx, cy, 8, 0, TAU);
            ctx.fill();
          }
        blotches(ctx, w, h, r, 50, 0.3);
        speckle(ctx, w, h, r, 2500, 0.35, 0.08);
      },
    ],
    damask: [
      512,
      512,
      (ctx, w, h) => {
        // round 2: finer tone-on-tone damask (the old 2×2 cartoon ovals with dark dots read as polka dots at 1.1 m):
        // 4 × 4 half-drop repeats of a symmetric fleuron — central flame, two acanthus scrolls, a bud and a stem —
        // in a slightly lighter/sheen tone with a thin darker outline, over a faint moiré stripe, then age.
        const r = P.rng("dam");
        ctx.fillStyle = "#6a5a3c";
        ctx.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 4) {
          ctx.fillStyle =
            (x / 4) % 2 ? "rgba(255,240,200,0.025)" : "rgba(0,0,0,0.025)";
          ctx.fillRect(x, 0, 2, h);
        }
        const N = 4,
          cw = w / N,
          ch = h / N;
        const fleur = (cx, cy, s) => {
          ctx.beginPath();
          ctx.moveTo(cx, cy - 0.46 * s);
          ctx.bezierCurveTo(
            cx + 0.16 * s,
            cy - 0.3 * s,
            cx + 0.2 * s,
            cy - 0.08 * s,
            cx + 0.06 * s,
            cy + 0.08 * s,
          );
          ctx.bezierCurveTo(
            cx + 0.3 * s,
            cy - 0.06 * s,
            cx + 0.42 * s,
            cy + 0.1 * s,
            cx + 0.34 * s,
            cy + 0.24 * s,
          );
          ctx.bezierCurveTo(
            cx + 0.28 * s,
            cy + 0.14 * s,
            cx + 0.16 * s,
            cy + 0.14 * s,
            cx + 0.1 * s,
            cy + 0.26 * s,
          );
          ctx.bezierCurveTo(
            cx + 0.06 * s,
            cy + 0.34 * s,
            cx + 0.03 * s,
            cy + 0.42 * s,
            cx,
            cy + 0.46 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.03 * s,
            cy + 0.42 * s,
            cx - 0.06 * s,
            cy + 0.34 * s,
            cx - 0.1 * s,
            cy + 0.26 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.16 * s,
            cy + 0.14 * s,
            cx - 0.28 * s,
            cy + 0.14 * s,
            cx - 0.34 * s,
            cy + 0.24 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.42 * s,
            cy + 0.1 * s,
            cx - 0.3 * s,
            cy - 0.06 * s,
            cx - 0.06 * s,
            cy + 0.08 * s,
          );
          ctx.bezierCurveTo(
            cx - 0.2 * s,
            cy - 0.08 * s,
            cx - 0.16 * s,
            cy - 0.3 * s,
            cx,
            cy - 0.46 * s,
          );
          ctx.closePath();
        };
        for (let i = 0; i < N; i++)
          for (let j = 0; j < N + 1; j++) {
            const cx = (i + 0.5) * cw,
              cy = (j + (i % 2 ? 0 : 0.5)) * ch;
            fleur(cx, cy, ch * 0.92);
            ctx.fillStyle = "rgba(196,168,112,0.30)";
            ctx.fill();
            ctx.strokeStyle = "rgba(48,36,18,0.35)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // vein + small diamond bud between repeats
            ctx.strokeStyle = "rgba(60,46,24,0.3)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 0.3 * ch);
            ctx.lineTo(cx, cy + 0.3 * ch);
            ctx.stroke();
            const bx = cx + cw / 2,
              by = cy + ch / 2;
            ctx.fillStyle = "rgba(190,160,100,0.22)";
            ctx.beginPath();
            ctx.moveTo(bx, by - 9);
            ctx.lineTo(bx + 6, by);
            ctx.lineTo(bx, by + 9);
            ctx.lineTo(bx - 6, by);
            ctx.closePath();
            ctx.fill();
          }
        // sun fade toward the top, water stains running down, peeling seams
        const fade = ctx.createLinearGradient(0, 0, 0, h);
        fade.addColorStop(0, "rgba(230,210,170,0.10)");
        fade.addColorStop(1, "rgba(0,0,0,0.06)");
        ctx.fillStyle = fade;
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 7; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(40,30,15,0.32)");
          g.addColorStop(1, "rgba(40,30,15,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 8 + r() * 26, h * (0.3 + r() * 0.6));
        }
        for (let i = 0; i < 2; i++) {
          const x = ((i + 0.5) * w) / 2 + (r() - 0.5) * 20;
          ctx.fillStyle = "rgba(20,14,6,0.35)";
          ctx.fillRect(x, 0, 1.5, h);
          ctx.fillStyle = "rgba(210,196,160,0.35)";
          ctx.fillRect(x + 1.5, h * r() * 0.3, 5, 30 + r() * 60);
        }
        speckle(ctx, w, h, r, 1600);
      },
    ],
    slate: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("slate");
        ctx.fillStyle = "#2e3034";
        ctx.fillRect(0, 0, w, h);
        const rowH = 16,
          sw = 22;
        for (let y = 0; y < h; y += rowH)
          for (let x = -sw; x < w + sw; x += sw) {
            const ox = (((y / rowH) % 2) * sw) / 2,
              c = 60 + r() * 30;
            ctx.fillStyle =
              "rgb(" +
              ((c * 0.95) | 0) +
              "," +
              (c | 0) +
              "," +
              ((c * 1.08) | 0) +
              ")";
            ctx.beginPath();
            ctx.moveTo(x + ox, y);
            ctx.lineTo(x + ox + sw - 2, y);
            ctx.lineTo(x + ox + sw - 2, y + rowH - 5);
            ctx.arc(x + ox + sw / 2 - 1, y + rowH - 5, sw / 2 - 1, 0, PI);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(x + ox, y + rowH - 2, sw, 2);
          }
        blotches(ctx, w, h, r, 20, 0.25);
      },
    ],
    tiffany_blue: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("tb");
        ctx.fillStyle = "#7fcfc4";
        ctx.fillRect(0, 0, w, h);
        blotches(ctx, w, h, r, 30, 0.3);
        speckle(ctx, w, h, r, 900, 0.4, 0.1);
      },
    ],
    plaster_fine: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("plf");
        ctx.fillStyle = "#d8d2c4";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 90; i++) {
          const x = r() * w,
            y = r() * h,
            rr = 40 + r() * 120;
          const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
          const d = r() < 0.55;
          g.addColorStop(
            0,
            d
              ? "rgba(90,80,60," + (0.02 + r() * 0.04) + ")"
              : "rgba(255,252,240," + (0.02 + r() * 0.04) + ")",
          );
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
        }
        // water runs
        for (let i = 0; i < 6; i++) {
          const x = r() * w,
            ww = 4 + r() * 18;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(70,56,30," + (0.03 + r() * 0.06) + ")");
          g.addColorStop(r() * 0.6 + 0.3, "rgba(70,56,30,0)");
          g.addColorStop(1, "rgba(70,56,30,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, ww, h);
        }
        // hairline cracks
        ctx.strokeStyle = "rgba(50,44,34,0.35)";
        ctx.lineWidth = 0.8;
        for (let i = 0; i < 7; i++) {
          let x = r() * w,
            y = r() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 10; k++) {
            x += (r() - 0.5) * 40;
            y += (r() - 0.3) * 30;
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        speckle(ctx, w, h, r, 1800, 0.12, 0.08);
      },
    ],
    stripes: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("stripes");
        ctx.fillStyle = "#d8ccb4";
        ctx.fillRect(0, 0, w, h);
        for (let x = 0; x < w; x += 32) {
          ctx.fillStyle = "rgba(150,120,90,0.35)";
          ctx.fillRect(x, 0, 12, h);
          ctx.fillStyle = "rgba(120,90,60,0.25)";
          ctx.fillRect(x + 14, 0, 2, h);
        }
        for (let y = 16; y < h; y += 42)
          for (let x = 22; x < w; x += 32) {
            ctx.fillStyle = "rgba(140,70,60,0.45)";
            ctx.beginPath();
            ctx.arc(x + ((y / 42) % 2) * 0, y, 4, 0, TAU);
            ctx.fill();
            ctx.fillStyle = "rgba(80,110,60,0.45)";
            ctx.beginPath();
            ctx.ellipse(x - 4, y + 5, 4, 2, 0.6, 0, TAU);
            ctx.fill();
          }
        for (let i = 0; i < 5; i++) {
          const x = r() * w;
          const g = ctx.createLinearGradient(0, 0, 0, h);
          g.addColorStop(0, "rgba(60,45,25,0.3)");
          g.addColorStop(1, "rgba(60,45,25,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x, 0, 8 + r() * 24, h * (0.3 + r() * 0.6));
        }
        speckle(ctx, w, h, r, 600, 0.2, 0.08);
      },
    ],
    zebra: [
      256,
      256,
      (ctx, w, h) => {
        ctx.fillStyle = "#e4dccb";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#1c1a18";
        for (let x = -20; x < w + 20; x += 26) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          for (let y = 0; y <= h; y += 16)
            ctx.lineTo(x + Math.sin(y / 30 + x) * 6, y);
          for (let y = h; y >= 0; y -= 16)
            ctx.lineTo(x + 11 + Math.sin(y / 30 + x) * 6, y);
          ctx.fill();
        }
      },
    ],
    spots: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("spots");
        ctx.fillStyle = "#c8985a";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 90; i++) {
          const x = r() * w,
            y = r() * h,
            s = 5 + r() * 7;
          ctx.strokeStyle = "#2a1c10";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, s, 0, TAU * 0.8);
          ctx.stroke();
        }
      },
    ],
    foliage: [
      256,
      256,
      (ctx, w, h) => {
        const r = P.rng("fol");
        ctx.fillStyle = "#26361c";
        ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 500; i++) {
          ctx.fillStyle =
            "rgb(" +
            ((40 + r() * 50) | 0) +
            "," +
            ((60 + r() * 60) | 0) +
            "," +
            ((20 + r() * 30) | 0) +
            ")";
          ctx.beginPath();
          ctx.ellipse(
            r() * w,
            r() * h,
            3 + r() * 8,
            2 + r() * 4,
            r() * 3,
            0,
            TAU,
          );
          ctx.fill();
        }
      },
    ],
    stained_glass: [
      512,
      512,
      (ctx, w, h) => {
        const r = P.rng("sg");
        ctx.fillStyle = "#1a1208";
        ctx.fillRect(0, 0, w, h);
        const pal = [
          "#e8b858",
          "#d89a38",
          "#f0d890",
          "#8ab870",
          "#6a9ac8",
          "#c8a060",
          "#f4e4b0",
          "#b8d8a0",
        ];
        const n = 12,
          s = w / n;
        for (let i = 0; i < n; i++)
          for (let j = 0; j < n; j++) {
            const dx = i - n / 2 + 0.5,
              dy = j - n / 2 + 0.5,
              d = Math.hypot(dx, dy);
            const ring = Math.floor(d * 1.2);
            let c =
              pal[
                (ring + (Math.abs(dx) === Math.abs(dy) ? 2 : 0)) % pal.length
              ];
            if (r() < 0.06) c = "#2a2014"; // missing / painted-over panes
            ctx.fillStyle = c;
            ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
            ctx.fillStyle = "rgba(255,255,255," + r() * 0.15 + ")";
            ctx.fillRect(i * s + 4, j * s + 4, s * 0.4, s * 0.3);
          }
        // central medallion + leading
        ctx.strokeStyle = "#1a1208";
        ctx.lineWidth = 8;
        for (const rr of [60, 110, 170, 230]) {
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, rr, 0, TAU);
          ctx.stroke();
        }
        ctx.fillStyle = "#f8e8b0";
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 52, 0, TAU);
        ctx.fill();
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * TAU;
          ctx.beginPath();
          ctx.moveTo(w / 2 + Math.cos(a) * 60, h / 2 + Math.sin(a) * 60);
          ctx.lineTo(w / 2 + Math.cos(a) * 240, h / 2 + Math.sin(a) * 240);
          ctx.stroke();
        }
        ctx.lineWidth = 3;
        for (let i = 0; i <= n; i++) {
          ctx.beginPath();
          ctx.moveTo(i * s, 0);
          ctx.lineTo(i * s, h);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i * s);
          ctx.lineTo(w, i * s);
          ctx.stroke();
        }
        blotches(ctx, w, h, r, 40, 0.35);
      },
    ],
    stars: [
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("stars");
        ctx.fillStyle = "#01030a";
        ctx.fillRect(0, 0, w, h);
        // milky way band
        for (let i = 0; i < 900; i++) {
          const x = r() * w,
            y =
              h * 0.45 +
              Math.sin((x / w) * TAU) * h * 0.18 +
              (r() - 0.5) * h * 0.16;
          const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
          g.addColorStop(0, "rgba(120,130,170,0.05)");
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - 14, y - 14, 28, 28);
        }
        for (let i = 0; i < 2600; i++) {
          const x = r() * w,
            y = r() * h,
            b = r();
          ctx.fillStyle =
            "rgba(" +
            ((200 + r() * 55) | 0) +
            "," +
            ((210 + r() * 45) | 0) +
            ",255," +
            (0.3 + b * 0.7) +
            ")";
          const s = b > 0.97 ? 2.6 : b > 0.85 ? 1.6 : 1;
          ctx.fillRect(x, y, s, s);
        }
        // constellation stick figures (projector overlay)
        ctx.strokeStyle = "rgba(120,200,255,0.35)";
        ctx.lineWidth = 1.2;
        for (let c = 0; c < 9; c++) {
          let x = r() * w,
            y = h * 0.15 + r() * h * 0.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          for (let k = 0; k < 5; k++) {
            x += (r() - 0.5) * 90;
            y += (r() - 0.5) * 60;
            ctx.lineTo(x, y);
            ctx.fillStyle = "#fff";
            ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
          }
          ctx.stroke();
        }
      },
    ],
    // blue whale hide: u = around the body (0.25 top, 0.75 belly), v = tail(0) → snout(1)
    whale_skin: [
      1024,
      512,
      (ctx, w, h) => {
        const r = P.rng("whale");
        for (let x = 0; x < w; x++) {
          const u = x / w,
            top = Math.cos((u - 0.25) * TAU) * 0.5 + 0.5; // 1 = spine, 0 = belly
          const c0 = [58, 72, 92],
            c1 = [150, 162, 176];
          const k = Math.pow(top, 0.7);
          ctx.fillStyle =
            "rgb(" +
            ((c1[0] + (c0[0] - c1[0]) * k) | 0) +
            "," +
            ((c1[1] + (c0[1] - c1[1]) * k) | 0) +
            "," +
            ((c1[2] + (c0[2] - c1[2]) * k) | 0) +
            ")";
          ctx.fillRect(x, 0, 1, h);
        }
        // mottling (the model's painted spots) + 1970s repaint streaks
        for (let i = 0; i < 1400; i++) {
          const x = r() * w,
            y = r() * h,
            s = 1 + r() * 4;
          ctx.fillStyle =
            "rgba(" +
            ((170 + r() * 50) | 0) +
            "," +
            ((185 + r() * 40) | 0) +
            ",205," +
            (0.08 + r() * 0.18) +
            ")";
          ctx.beginPath();
          ctx.ellipse(x, y, s * 1.6, s, 0, 0, TAU);
          ctx.fill();
        }
        // throat pleats on the belly, front half (canvas y 0 = snout)
        ctx.strokeStyle = "rgba(40,46,56,0.55)";
        ctx.lineWidth = 2;
        for (let x = w * 0.6; x < w * 0.9; x += 9) {
          ctx.beginPath();
          ctx.moveTo(x, h * 0.02);
          ctx.lineTo(x + (r() - 0.5) * 4, h * 0.42 + r() * 20);
          ctx.stroke();
        }
        // mouth line
        ctx.strokeStyle = "rgba(18,20,26,0.8)";
        ctx.lineWidth = 4;
        for (const x of [w * 0.02, w * 0.48]) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h * 0.16);
          ctx.stroke();
        }
        // grime, flaking paint, a raider's tag
        blotches(ctx, w, h, r, 30, 0.25);
        ctx.fillStyle = "rgba(160,30,20,0.7)";
        ctx.font = "bold 40px sans-serif";
        ctx.save();
        ctx.translate(w * 0.12, h * 0.5);
        ctx.rotate(HP);
        ctx.fillText("MOBY WAS HERE", 0, 0);
        ctx.restore();
      },
    ],
  };
  P.CUSTOM = CUSTOM;
  P.customTex = (name) => {
    const d = CUSTOM[name];
    return d ? P.canvasTex("pu_c_" + name, d[0], d[1], d[2]) : null;
  };

  const matCache = {};
  const metersCache = {};
  function hasMats() {
    return !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
  }
  /** Material for key (MAT key, 'tex:<k>' registered with P.texMat); optional '@lit' suffix = baked-light variant. */
  P.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = bakedVariant(P.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0) return P.mat("concrete");
    const d = MAT[key] || { color: 0x808080, uv: 3 };
    let m = null;
    if (d.src && !d.custom && hasMats()) {
      try {
        const o = { vertexColors: true };
        if (d.tint !== undefined) o.color = d.tint;
        if (d.src === "glass") {
          o.transparent = true;
          o.opacity = 0.28;
          o.color = 0xd0e0e0;
        }
        const b = G.mats.get(d.src, o);
        if (b && b.isMaterial) m = b;
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const o = {
        color: d.color,
        roughness: d.rough === undefined ? 0.9 : d.rough,
        metalness: d.metal || 0,
        vertexColors: true,
      };
      if (d.custom) {
        o.map = P.customTex(d.custom);
        o.color = 0xffffff;
        if (d.emissiveCustom) o.emissiveMap = o.map;
      }
      if (d.emissive !== undefined) {
        o.emissive = d.emissive;
        o.emissiveIntensity = d.ei || 1;
      }
      if (d.side === "back") o.side = THREE.BackSide;
      if (d.src === "glass") {
        o.transparent = true;
        o.opacity = 0.5;
      }
      if (d.opacity !== undefined) {
        o.transparent = true;
        o.opacity = d.opacity;
      }
      m = new THREE.MeshStandardMaterial(o);
      m.userData.shared = true;
      if (d.emissive !== undefined)
        try {
          if (G.mats && G.mats.track && !G.isStub("mats"))
            G.mats.track(m, { glow: [d.ei || 1, d.ei || 1] });
        } catch (e) {
          /* optional */
        }
    }
    if (d.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add albedo × (per-vertex baked lamp light) to its emission (fake interior GI). */
  function bakedVariant(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      puBaked: true,
    });
    const prev = base.onBeforeCompile;
    m.onBeforeCompile = function (sh, r) {
      try {
        if (prev && prev !== THREE.Material.prototype.onBeforeCompile)
          prev.call(this, sh, r);
      } catch (e) {
        /* keep going */
      }
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bake;\nvarying vec3 vPuBake;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvPuBake = bake;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vPuBake;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vPuBake * 1.5;",
        );
    };
    const prevKey = base.customProgramCacheKey
      ? base.customProgramCacheKey.bind(base)
      : () => "";
    m.customProgramCacheKey = () => "pu_baked1|" + prevKey();
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured material for signs / paintings (uv kept 0..1). */
  P.texMat = function (key, tex, o) {
    o = o || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: o.rough === undefined ? 0.85 : o.rough,
        metalness: Math.min(0.3, o.metal || 0),
        vertexColors /* no env map: metallic signs render black */: !!o.vc,
        side: o.double ? THREE.DoubleSide : THREE.FrontSide,
      });
      if (o.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = o.emissive;
      }
      if (o.transparent) {
        m.transparent = true;
        m.alphaTest = o.alphaTest || 0.35;
        m.depthWrite = o.depthWrite !== false;
      }
      if (o.color !== undefined) m.color = new THREE.Color(o.color);
      m.userData.shared = true;
      matCache[k] = m;
      NO_SHADOW.add(k);
    }
    return k;
  };
  function metersFor(key) {
    key = baseKey(key);
    if (metersCache[key] !== undefined) return metersCache[key];
    const d = MAT[key];
    let m = d ? d.uv || 3 : 3;
    if (d && d.src && !d.custom && hasMats()) {
      try {
        const inf = G.tex.info(d.src);
        if (inf && inf.meters) m = inf.meters;
      } catch (e) {
        /* default */
      }
    }
    return (metersCache[key] = m);
  }

  // ===================================================================
  // Batch
  // ===================================================================
  const GRIME = new THREE.Color(0x2a2218);
  function Batch(name, o) {
    o = o || {};
    this.name = name;
    this.items = [];
    this.ox = o.ox || 0;
    this.oy = o.oy || 0;
    this.oz = o.oz || 0;
    this.lit = !!o.lit;
    this.lights = [];
    this.ambient =
      o.ambient !== undefined
        ? new THREE.Color(o.ambient).multiplyScalar(
            o.ambI === undefined ? 1 : o.ambI,
          )
        : null;
    this.segLen = o.segLen || (this.lit ? 1.8 : 6);
    this.ground = 0;
    this.aoH = o.aoH || 2.6;
    this.grime = o.grime === undefined ? 0.45 : o.grime;
    this.ao = o.ao === undefined ? 0.4 : o.ao;
    this.tris = 0;
  }
  P.Batch = Batch;
  const segs = (v, len) => Math.max(1, Math.min(24, Math.ceil(v / len)));
  /** Add geometry (consumed). o: {m, c (tint), grime, ground, uv:'box'|'keep', uvScale, uvRect, us, vs, noAO, noBake} */
  Batch.prototype.add = function (key, geom, o) {
    o = o || {};
    let g = geom.index ? geom.toNonIndexed() : geom;
    if (geom.index) geom.dispose();
    if (o.m) g.applyMatrix4(o.m);
    if (this.ox || this.oy || this.oz) g.translate(this.ox, this.oy, this.oz);
    if (!g.attributes.normal) g.computeVertexNormals();
    shade(g, key, o, this);
    this.items.push({ key, g, noBake: !!o.noBake });
    this.tris += g.attributes.position.count / 3;
    return g;
  };
  Batch.prototype.light = function (x, y, z, color, r, i) {
    this.lights.push({
      p: new THREE.Vector3(x + this.ox, y + this.oy, z + this.oz),
      c: new THREE.Color(color === undefined ? 0xffd8a0 : color),
      r: r || 10,
      i: i === undefined ? 1 : i,
    });
  };
  /** Box from min/max corners (local). o.ry rotates about the centre. */
  Batch.prototype.box = function (key, x0, y0, z0, x1, y1, z1, o) {
    o = o || {};
    const w = Math.abs(x1 - x0),
      h = Math.abs(y1 - y0),
      d = Math.abs(z1 - z0);
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return null;
    const sl = o.segLen || this.segLen,
      sg = o.seg === false;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      sg ? 1 : segs(w, sl),
      sg ? 1 : segs(h, sl),
      sg ? 1 : segs(d, sl),
    );
    const m = P.m4(
      (x0 + x1) / 2,
      (y0 + y1) / 2,
      (z0 + z1) / 2,
      o.ry,
      o.rx,
      o.rz,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Box by bottom centre + size. */
  Batch.prototype.boxC = function (key, cx, y0, cz, w, h, d, o) {
    o = o || {};
    const sl = o.segLen || this.segLen,
      sg = o.seg === false;
    const geo = new THREE.BoxGeometry(
      w,
      h,
      d,
      sg ? 1 : segs(w, sl),
      sg ? 1 : segs(h, sl),
      sg ? 1 : segs(d, sl),
    );
    const m = P.m4(cx, y0 + h / 2, cz, o.ry, o.rx, o.rz);
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.cyl = function (key, x, y0, z, rt, rb, h, seg, o) {
    o = o || {};
    const geo = new THREE.CylinderGeometry(
      rt,
      rb,
      h,
      seg || 12,
      o.hSeg || segs(h, this.segLen),
      !!o.open,
      o.t0 || 0,
      o.tl || TAU,
    );
    const m = P.m4(
      x,
      y0 + h / 2,
      z,
      o.ry,
      o.rx,
      o.rz,
      o.sx,
      1,
      o.sz === undefined ? o.sx : o.sz,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Cylinder between two points a,b (arrays or Vector3, local). */
  const _va = new THREE.Vector3(),
    _vb = new THREE.Vector3(),
    _up = new THREE.Vector3(0, 1, 0);
  Batch.prototype.rod = function (key, a, b, r, seg, o) {
    o = o || {};
    const A = Array.isArray(a) ? _va.set(a[0], a[1], a[2]) : _va.copy(a),
      B = Array.isArray(b) ? _vb.set(b[0], b[1], b[2]) : _vb.copy(b);
    const dir = new THREE.Vector3().subVectors(B, A);
    const len = dir.length();
    if (len < 1e-4) return null;
    const geo = o.square
      ? new THREE.BoxGeometry(r * 2, len, (o.r2 || r) * 2)
      : new THREE.CylinderGeometry(
          o.rTop === undefined ? r : o.rTop,
          r,
          len,
          seg || 6,
          1,
          !!o.open,
        );
    geo.translate(0, len / 2, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(_up, dir.normalize());
    const m = new THREE.Matrix4().compose(
      A.clone(),
      q,
      new THREE.Vector3(1, 1, 1),
    );
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.sphere = function (key, x, y, z, r, o) {
    o = o || {};
    const geo = new THREE.SphereGeometry(
      r,
      o.ws || 12,
      o.hs || 8,
      o.p0 || 0,
      o.pl || TAU,
      o.t0 || 0,
      o.tl || PI,
    );
    const m = P.m4(
      x,
      y,
      z,
      o.ry,
      o.rx,
      o.rz,
      o.sx || 1,
      o.sy || o.sx || 1,
      o.sz || o.sx || 1,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.lathe = function (key, prof, seg, x, y, z, o) {
    o = o || {};
    const pts = prof.map(
      (p) => new THREE.Vector2(Math.max(0.0001, p[0]), p[1]),
    );
    const geo = new THREE.LatheGeometry(pts, seg || 16, o.p0 || 0, o.pl || TAU);
    const m = P.m4(
      x,
      y,
      z,
      o.ry,
      o.rx,
      o.rz,
      o.sx || 1,
      o.sy || 1,
      o.sz || o.sx || 1,
    );
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  Batch.prototype.torus = function (key, x, y, z, R, r, arc, o) {
    o = o || {};
    const geo = new THREE.TorusGeometry(
      R,
      r,
      o.rs || 6,
      o.ts || 24,
      arc || TAU,
    );
    const m = P.m4(x, y, z, o.ry, o.rx, o.rz, o.sx || 1, o.sy || 1, o.sz || 1);
    if (o.m) m.premultiply(o.m);
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Quad centred at (x,y,z), size w×h; faces +Z when ry=0. uv kept 0..1 by default. */
  Batch.prototype.quad = function (key, x, y, z, w, h, o) {
    o = o || {};
    const geo = new THREE.PlaneGeometry(w, h, o.ws || 1, o.hs || 1);
    const m = P.m4(x, y, z, o.ry, o.rx, o.rz);
    if (o.m) m.premultiply(o.m);
    return this.add(
      key,
      geo,
      Object.assign({ uv: "keep", grime: 0.1, noAO: true }, o, { m }),
    );
  };
  Batch.prototype.geo = function (key, geo, m, o) {
    return this.add(key, geo, Object.assign({}, o || {}, { m }));
  };
  /** Extrude a THREE.Shape (XY) by depth along +Z, then transform by m. */
  Batch.prototype.extrude = function (key, shape, depth, m, o) {
    o = o || {};
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: o.curve || 10,
    });
    return this.add(key, geo, Object.assign({}, o, { m }));
  };
  /** Add a geometry seen from INSIDE (winding + normals flipped): vaults, domes, drums. */
  Batch.prototype.inside = function (key, geo, m, o) {
    return this.add(key, P.flipGeo(geo), Object.assign({}, o || {}, { m }));
  };
  /** Irregular rock / rubble lump. */
  Batch.prototype.rock = function (key, x, y, z, r, o) {
    o = o || {};
    const geo = new THREE.IcosahedronGeometry(
      r,
      o.detail === undefined ? 1 : o.detail,
    );
    const p = geo.attributes.position,
      seed = o.seed || x * 13.1 + z * 7.7 + y * 3.3;
    for (let i = 0; i < p.count; i++) {
      const vx = p.getX(i),
        vy = p.getY(i),
        vz = p.getZ(i);
      const n =
        U.fbm2((vx / r) * 1.2 + seed, (vz / r) * 1.2 + (vy / r) * 0.6) - 0.5;
      const k = 1 + n * (o.rough === undefined ? 0.6 : o.rough);
      p.setXYZ(i, vx * k, vy * k * (o.flat || 1), vz * k);
    }
    geo.computeVertexNormals();
    const m = P.m4(
      x,
      y,
      z,
      o.ry || seed % 6,
      o.rx || 0,
      o.rz || 0,
      o.sx || 1,
      o.sy || 1,
      o.sz || 1,
    );
    return this.add(key, geo, Object.assign({ grime: 0.5 }, o, { m }));
  };
  // ---- UV projection + vertex colour AO / grime -------------------------
  function shade(g, key, o, b) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    const bk = baseKey(key),
      def = MAT[bk];
    const keep =
      o.uv === "keep" || bk.indexOf("tex:") === 0 || (def && def.keep);
    if (!keep) {
      const s = 1 / (o.uvScale || metersFor(bk));
      const arr = new Float32Array(cnt * 2);
      for (let i = 0; i < cnt; i++) {
        const nx = Math.abs(n.getX(i)),
          ny = Math.abs(n.getY(i)),
          nz = Math.abs(n.getZ(i));
        const x = p.getX(i),
          y = p.getY(i),
          z = p.getZ(i);
        let u, v;
        if (ny >= nx && ny >= nz) {
          u = x;
          v = z;
        } else if (nx >= nz) {
          u = z;
          v = y;
        } else {
          u = x;
          v = y;
        }
        arr[i * 2] = u * s;
        arr[i * 2 + 1] = v * s;
      }
      g.setAttribute("uv", new THREE.BufferAttribute(arr, 2));
    } else {
      let uv = g.attributes.uv;
      if (!uv) {
        uv = new THREE.BufferAttribute(new Float32Array(cnt * 2), 2);
        g.setAttribute("uv", uv);
      } else if (o.uvRect) {
        const R = o.uvRect;
        for (let i = 0; i < cnt; i++)
          uv.setXY(
            i,
            R[0] + uv.getX(i) * (R[2] - R[0]),
            R[1] + uv.getY(i) * (R[3] - R[1]),
          );
      } else if (o.us || o.vs) {
        for (let i = 0; i < cnt; i++)
          uv.setXY(i, uv.getX(i) * (o.us || 1), uv.getY(i) * (o.vs || 1));
      }
    }
    const col = new Float32Array(cnt * 3);
    const tint = new THREE.Color(o.c === undefined ? 0xffffff : o.c);
    const grime = o.grime === undefined ? b.grime : o.grime;
    const ground = (o.ground === undefined ? b.ground : o.ground) + b.oy;
    const aoH = o.aoH || b.aoH,
      noAO = !!o.noAO,
      aoK = b.ao;
    for (let i = 0; i < cnt; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      let k = 1;
      if (!noAO) {
        const t = U.clamp((y - ground + 0.2) / aoH, 0, 1);
        k *= 1 - aoK + aoK * t * t * (3 - 2 * t);
      }
      let gr = 0;
      if (grime > 0) {
        const blot = U.fbm2(x * 0.11 + z * 0.05 + 3.1, y * 0.13 + z * 0.09, 3);
        const streak = U.noise2((x + z) * 0.9, y * 0.02 + 7.3);
        gr =
          grime *
          (Math.max(0, blot - 0.42) * 1.3 + Math.max(0, streak - 0.58) * 0.8);
        if (n.getY(i) > 0.7) gr += grime * 0.2;
        gr = Math.min(0.8, gr);
        k *=
          0.92 +
          0.16 * U.hash2(Math.floor(x * 2.3), Math.floor(z * 2.3 + y * 1.7));
      }
      col[i * 3] = (tint.r * (1 - gr) + GRIME.r * gr) * k;
      col[i * 3 + 1] = (tint.g * (1 - gr) + GRIME.g * gr) * k;
      col[i * 3 + 2] = (tint.b * (1 - gr) + GRIME.b * gr) * k;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  }
  // ---- baked light --------------------------------------------------
  function bake(g, lights, amb) {
    const p = g.attributes.position,
      n = g.attributes.normal,
      cnt = p.count;
    if (!g.boundingSphere) g.computeBoundingSphere();
    const bs = g.boundingSphere;
    const L = lights.filter((l) => l.p.distanceTo(bs.center) < l.r + bs.radius);
    const out = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      let r = amb ? amb.r : 0,
        gg = amb ? amb.g : 0,
        bb = amb ? amb.b : 0;
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i),
        nx = n.getX(i),
        ny = n.getY(i),
        nz = n.getZ(i);
      for (let k = 0; k < L.length; k++) {
        const l = L[k];
        const dx = l.p.x - x,
          dy = l.p.y - y,
          dz = l.p.z - z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > l.r * l.r) continue;
        const d = Math.sqrt(d2) || 1e-3;
        const f = 1 - d / l.r,
          att = f * f * l.i;
        const ndl = (nx * dx + ny * dy + nz * dz) / d;
        const w = att * (0.22 + 0.78 * Math.max(0, ndl));
        r += l.c.r * w;
        gg += l.c.g * w;
        bb += l.c.b * w;
      }
      out[i * 3] = Math.min(1.8, r);
      out[i * 3 + 1] = Math.min(1.8, gg);
      out[i * 3 + 2] = Math.min(1.8, bb);
    }
    g.setAttribute("bake", new THREE.BufferAttribute(out, 3));
  }
  function mergeAll(geoms) {
    const names = Object.keys(geoms[0].attributes).filter((nm) =>
      geoms.every(
        (g) =>
          g.attributes[nm] &&
          g.attributes[nm].itemSize === geoms[0].attributes[nm].itemSize,
      ),
    );
    let count = 0;
    for (const g of geoms) count += g.attributes.position.count;
    const out = new THREE.BufferGeometry();
    for (const nm of names) {
      const size = geoms[0].attributes[nm].itemSize,
        arr = new Float32Array(count * size);
      let off = 0;
      for (const g of geoms) {
        arr.set(
          g.attributes[nm].array.subarray(
            0,
            g.attributes.position.count * size,
          ),
          off,
        );
        off += g.attributes.position.count * size;
      }
      out.setAttribute(nm, new THREE.BufferAttribute(arr, size));
    }
    out.computeBoundingSphere();
    out.computeBoundingBox();
    return out;
  }
  P.mergeAll = mergeAll;
  /** Merge everything into one mesh per material under parent. o: {shadow (cast), lod (dist for detail mats), receive} */
  Batch.prototype.build = function (parent, o) {
    o = o || {};
    const group = new THREE.Group();
    group.name = "pu_" + this.name;
    const byKey = new Map();
    for (const it of this.items) {
      let key = it.key;
      if (
        this.lit &&
        !isEmissive(key) &&
        key.indexOf("tex:") !== 0 &&
        !it.noBake
      ) {
        bake(it.g, this.lights, this.ambient);
        key = key + "@lit";
      } else if (this.lit && key.indexOf("tex:") === 0 && !it.noBake) {
        bake(it.g, this.lights, this.ambient);
        key = key + "@lit";
      }
      let arr = byKey.get(key);
      if (!arr) {
        arr = [];
        byKey.set(key, arr);
      }
      arr.push(it.g);
    }
    for (const [key, arr] of byKey) {
      // bakes/no-bakes of one material must share attribute sets → split by attribute signature
      const sigs = new Map();
      for (const g of arr) {
        const s = Object.keys(g.attributes).sort().join(",");
        let a = sigs.get(s);
        if (!a) {
          a = [];
          sigs.set(s, a);
        }
        a.push(g);
      }
      for (const list of sigs.values()) {
        let chunk = [],
          cnt = 0;
        const flush = () => {
          if (!chunk.length) return;
          let geo = mergeAll(chunk);
          for (const g of chunk) g.dispose();
          let mat =
            key.indexOf("tex:") === 0
              ? P.mat(key.replace("@lit", ""))
              : P.mat(key);
          if (key.indexOf("tex:") === 0 && key.slice(-4) === "@lit")
            mat = texBaked(key);
          // o.mergeInto (a group built earlier, e.g. the site's main batch): append to its mesh of the same
          // material + attribute set instead of adding a new draw call (clutter/decay passes after the build)
          if (o.mergeInto) {
            const sig = Object.keys(geo.attributes).sort().join(",");
            const host = o.mergeInto.children.find(
              (m) =>
                m.isMesh &&
                m.material === mat &&
                !m.userData.puNoMerge &&
                Object.keys(m.geometry.attributes).sort().join(",") === sig &&
                m.geometry.attributes.position.count +
                  geo.attributes.position.count <
                  600000,
            );
            if (host) {
              const old = host.geometry;
              host.geometry = mergeAll([old, geo]);
              old.dispose();
              geo.dispose();
              P.mergedDecay = (P.mergedDecay || 0) + 1;
              chunk = [];
              cnt = 0;
              return;
            }
          }
          const mesh = new THREE.Mesh(geo, mat);
          mesh.name = this.name + ":" + key;
          const bk = baseKey(key);
          mesh.castShadow = !!o.shadow && !NO_SHADOW.has(bk) && !DETAIL.has(bk);
          mesh.receiveShadow = o.receive !== false;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          group.add(mesh);
          if (
            o.lod &&
            (DETAIL.has(bk) || geo.attributes.position.count < 3000)
          ) {
            try {
              G.world.addLOD(
                mesh,
                o.lod + geo.boundingSphere.radius,
                geo.boundingSphere.center.clone(),
              );
            } catch (e) {
              /* core */
            }
          }
          chunk = [];
          cnt = 0;
        };
        for (const g of list) {
          chunk.push(g);
          cnt += g.attributes.position.count;
          if (cnt > 500000) flush();
        }
        flush();
      }
    }
    this.items = [];
    if (parent) parent.add(group);
    return group;
  };
  function texBaked(key) {
    if (matCache[key]) return matCache[key];
    return (matCache[key] = bakedVariant(P.mat(key.slice(0, -4)), key));
  }

  /** Flip a geometry inside-out (non-indexed result). */
  P.flipGeo = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = g.attributes.position,
      n = g.attributes.normal,
      uv = g.attributes.uv;
    for (let i = 0; i < p.count; i += 3) {
      for (const a of [p, n, uv]) {
        if (!a) continue;
        const s = a.itemSize;
        for (let k = 0; k < s; k++) {
          const t = a.array[(i + 1) * s + k];
          a.array[(i + 1) * s + k] = a.array[(i + 2) * s + k];
          a.array[(i + 2) * s + k] = t;
        }
      }
    }
    if (n) for (let i = 0; i < n.array.length; i++) n.array[i] = -n.array[i];
    return g;
  };

  // ===================================================================
  // Site builder context
  // ===================================================================
  /**
   * S = P.site(id, {ox,oy,oz, lit, ambient, ambI, interiorKey})
   * All coordinates passed to S.* are LOCAL (origin = ox,oy,oz).
   */
  P.site = function (id, o) {
    o = o || {};
    const S = {
      id,
      ox: o.ox || 0,
      oy: o.oy || 0,
      oz: o.oz || 0,
      anchors: {},
      colliders: [],
      interiorKey: o.interiorKey || null,
    };
    S.root = new THREE.Group();
    S.root.name = "pu_site_" + id;
    P.sites.push(S);
    S.b = new Batch(id, {
      ox: S.ox,
      oy: S.oy,
      oz: S.oz,
      lit: o.lit,
      ambient: o.ambient,
      ambI: o.ambI,
      segLen: o.segLen,
      grime: o.grime,
      ao: o.ao,
    });
    S.W = (x, y, z) => new THREE.Vector3(x + S.ox, y + S.oy, z + S.oz);
    // ---- colliders ----
    S.col = function (x0, y0, z0, x1, y1, z1, co) {
      co = co || {};
      const c = G.world.addBox(
        Math.min(x0, x1) + S.ox,
        Math.min(y0, y1) + S.oy,
        Math.min(z0, z1) + S.oz,
        Math.max(x0, x1) + S.ox,
        Math.max(y0, y1) + S.oy,
        Math.max(z0, z1) + S.oz,
        {
          tag: co.tag || "poi",
          surface: co.surface || "concrete",
          walkable: co.walkable !== false,
        },
      );
      S.colliders.push(c);
      return c;
    };
    /** Rotated collider: centre, size, ry = THREE rotation.y of the visual (engine yaw = -ry). */
    S.colR = function (cx, cz, w, d, y0, y1, ry, co) {
      co = co || {};
      const c = G.world.addCollider(
        cx + S.ox,
        cz + S.oz,
        w,
        d,
        y0 + S.oy,
        y1 + S.oy,
        -(ry || 0),
        {
          tag: co.tag || "poi",
          surface: co.surface || "concrete",
          walkable: co.walkable !== false,
        },
      );
      S.colliders.push(c);
      return c;
    };
    // ---- slabs ----
    /** Floor slab: top at y, thickness t (default .3), collider walkable. */
    S.floor = function (key, x0, z0, x1, z1, y, fo) {
      fo = fo || {};
      const t = fo.t || 0.3;
      const under =
        fo.under !== undefined ? fo.under : o.lit && y > 0.5 ? "plaster" : null;
      if (!fo.noVis) {
        if (under) {
          S.b.box(
            key,
            x0,
            y - 0.06,
            z0,
            x1,
            y,
            z1,
            Object.assign({ grime: 0.25, ground: y }, fo),
          );
          S.b.box(under, x0, y - t, z0, x1, y - 0.06, z1, {
            grime: 0.2,
            noAO: true,
          });
        } else
          S.b.box(
            key,
            x0,
            y - t,
            z0,
            x1,
            y,
            z1,
            Object.assign({ grime: 0.25, ground: y }, fo),
          );
      }
      if (!fo.noCol)
        S.col(x0, y - (fo.colT || t), z0, x1, y, z1, {
          surface: fo.surface || "concrete",
        });
    };
    S.ceil = function (key, x0, z0, x1, z1, y, fo) {
      fo = fo || {};
      // drawn a hair below y so it never shares a plane with the next level's floor slab
      S.b.box(
        key,
        x0,
        y - 0.09,
        z0,
        x1,
        y - 0.02,
        z1,
        Object.assign({ grime: 0.2, noAO: true, seg: undefined }, fo),
      );
      if (fo.col) S.col(x0, y - 0.02, z0, x1, y + (fo.t || 0.3), z1);
    };
    /**
     * Straight wall along X (constant z) or Z (constant x). holes: [[a0,a1,h0,h1], ...] in the wall's own
     * coordinates (x for wallX, z for wallZ; heights relative to y0). Visual + colliders.
     */
    function wallAlong(axis, key, c, a0, a1, y0, y1, t, holes, wo) {
      wo = wo || {};
      holes = (holes || [])
        .map((h) => [
          Math.max(a0, Math.min(h[0], h[1])),
          Math.min(a1, Math.max(h[0], h[1])),
          h[2] || 0,
          h[3] === undefined ? y1 - y0 : h[3],
        ])
        .filter((h) => h[1] > h[0])
        .sort((p, q) => p[0] - q[0]);
      const H = y1 - y0;
      if (holes.length)
        (S.holes = S.holes || []).push({
          axis,
          c: c + (wo.off || 0),
          y0,
          t,
          holes: holes.map((h) => h.slice()),
        }); // for G.poiHoleAudit (98_dooraudit.js)
      // Split the wall at every hole edge; each span keeps the vertical intervals NOT covered by any hole over it.
      // (The old sequential version let the lintel piece of one hole fill the openings of other holes stacked on the
      // same span — e.g. the Dakota stair-hall doors on every floor above the basement were walled up.)
      const pieces = [];
      const cuts = [a0, a1];
      for (const h of holes) cuts.push(h[0], h[1]);
      const xs = Array.from(new Set(cuts.map((v) => Math.round(v * 1e4) / 1e4)))
        .filter((v) => v >= a0 - 1e-6 && v <= a1 + 1e-6)
        .sort((p, q) => p - q);
      for (let i = 0; i < xs.length - 1; i++) {
        const u0 = xs[i],
          u1 = xs[i + 1];
        if (u1 - u0 < 1e-4) continue;
        const um = (u0 + u1) / 2;
        const gaps = holes
          .filter((h) => h[0] < um && h[1] > um)
          .map((h) => [Math.max(0, h[2]), Math.min(H, h[3])])
          .sort((p, q) => p[0] - q[0]);
        let v = 0;
        for (const g of gaps) {
          if (g[0] > v) pieces.push([u0, u1, v, g[0]]);
          v = Math.max(v, g[1]);
        }
        if (v < H) pieces.push([u0, u1, v, H]);
      }
      // merge horizontally adjacent pieces with identical vertical extents (keeps the mesh/collider count down)
      pieces.sort((p, q) => p[2] - q[2] || p[3] - q[3] || p[0] - q[0]);
      for (let i = pieces.length - 1; i > 0; i--) {
        const a = pieces[i - 1],
          c2 = pieces[i];
        if (a[2] === c2[2] && a[3] === c2[3] && Math.abs(a[1] - c2[0]) < 1e-6) {
          a[1] = c2[1];
          pieces.splice(i, 1);
        }
      }
      const ht = t / 2,
        off = wo.off || 0;
      for (const pc of pieces) {
        const ya = y0 + pc[2],
          yb = y0 + pc[3];
        if (axis === "x") {
          if (!wo.noVis)
            S.b.box(
              key,
              pc[0],
              ya,
              c - ht + off,
              pc[1],
              yb,
              c + ht + off,
              Object.assign(
                { ground: wo.ground === undefined ? y0 : wo.ground },
                wo,
              ),
            );
          if (!wo.noCol)
            S.col(pc[0], ya, c - ht + off, pc[1], yb, c + ht + off, {
              walkable: false,
            });
        } else {
          if (!wo.noVis)
            S.b.box(
              key,
              c - ht + off,
              ya,
              pc[0],
              c + ht + off,
              yb,
              pc[1],
              Object.assign(
                { ground: wo.ground === undefined ? y0 : wo.ground },
                wo,
              ),
            );
          if (!wo.noCol)
            S.col(c - ht + off, ya, pc[0], c + ht + off, yb, pc[1], {
              walkable: false,
            });
        }
      }
      // door frames / lintels on holes
      if (wo.frame)
        for (const h of holes) {
          const fk = wo.frame,
            fw = wo.frameW || 0.18,
            fd = t / 2 + 0.06;
          if (axis === "x") {
            for (const s of [-1, 1]) {
              S.b.box(
                fk,
                h[0] - fw,
                y0 + h[2],
                c - fd + off,
                h[0],
                y0 + h[3],
                c + fd + off,
                { ground: y0 },
              );
              S.b.box(
                fk,
                h[1],
                y0 + h[2],
                c - fd + off,
                h[1] + fw,
                y0 + h[3],
                c + fd + off,
                { ground: y0 },
              );
              if (h[3] < H)
                S.b.box(
                  fk,
                  h[0] - fw,
                  y0 + h[3],
                  c - fd + off,
                  h[1] + fw,
                  y0 + h[3] + fw,
                  c + fd + off,
                  { ground: y0 },
                );
              void s;
              break;
            }
          } else {
            S.b.box(
              fk,
              c - fd + off,
              y0 + h[2],
              h[0] - fw,
              c + fd + off,
              y0 + h[3],
              h[0],
              { ground: y0 },
            );
            S.b.box(
              fk,
              c - fd + off,
              y0 + h[2],
              h[1],
              c + fd + off,
              y0 + h[3],
              h[1] + fw,
              { ground: y0 },
            );
            if (h[3] < H)
              S.b.box(
                fk,
                c - fd + off,
                y0 + h[3],
                h[0] - fw,
                c + fd + off,
                y0 + h[3] + fw,
                h[1] + fw,
                { ground: y0 },
              );
          }
        }
    }
    /** Wall trim (dado, skirting, picture rail…): a thin box along a wall that is split around every opening already
     *  cut into a wall on that plane (S.wallX/wallZ holes within 0.45 m whose height range overlaps y0..y1). */
    S.trim = function (key, x0, y0, z0, x1, y1, z1, o) {
      const alongX = Math.abs(x1 - x0) >= Math.abs(z1 - z0);
      const a0 = alongX ? Math.min(x0, x1) : Math.min(z0, z1),
        a1 = alongX ? Math.max(x0, x1) : Math.max(z0, z1);
      const cm = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2;
      const cuts = [];
      for (const w of S.holes || []) {
        if ((w.axis === "x") !== alongX || Math.abs(w.c - cm) > 0.45) continue;
        for (const h of w.holes)
          if (
            w.y0 + h[2] < Math.max(y0, y1) - 0.01 &&
            w.y0 + h[3] > Math.min(y0, y1) + 0.01
          )
            cuts.push([h[0], h[1]]);
      }
      cuts.sort((p, q) => p[0] - q[0]);
      let u = a0;
      const emit = (u0, u1) => {
        if (u1 - u0 < 0.02) return;
        if (alongX) S.b.box(key, u0, y0, z0, u1, y1, z1, o);
        else S.b.box(key, x0, y0, u0, x1, y1, u1, o);
      };
      for (const c of cuts) {
        if (c[1] <= u) continue;
        if (c[0] > u) emit(u, Math.min(c[0], a1));
        u = Math.max(u, c[1]);
        if (u >= a1) break;
      }
      if (u < a1) emit(u, a1);
    };
    S.wallX = (key, z, x0, x1, y0, y1, t, holes, wo) =>
      wallAlong(
        "x",
        key,
        z,
        Math.min(x0, x1),
        Math.max(x0, x1),
        y0,
        y1,
        t || 0.3,
        holes,
        wo,
      );
    S.wallZ = (key, x, z0, z1, y0, y1, t, holes, wo) =>
      wallAlong(
        "z",
        key,
        x,
        Math.min(z0, z1),
        Math.max(z0, z1),
        y0,
        y1,
        t || 0.3,
        holes,
        wo,
      );
    /**
     * Room shell. r: {x0,z0,x1,z1, y, h, t, wall, floor, ceil, holes:{n,s,e,w: [[a0,a1,h0,h1]]}, skip:'nsewfc', frame, wallOpts, floorOpts, ceilOpts}
     * Walls sit ON the rectangle edges (half thickness inside). n = z0 edge, s = z1, w = x0, e = x1.
     */
    S.room = function (r) {
      const y = r.y || 0,
        h = r.h || 3.2,
        t = r.t || 0.3,
        sk = r.skip || "",
        ho = r.holes || {};
      const wk = r.wall || "plaster",
        wo = Object.assign({ frame: r.frame }, r.wallOpts || {});
      if (sk.indexOf("f") < 0)
        S.floor(
          r.floor || "concrete",
          r.x0,
          r.z0,
          r.x1,
          r.z1,
          y,
          Object.assign({ surface: r.surface }, r.floorOpts || {}),
        );
      if (sk.indexOf("c") < 0 && r.ceil !== false)
        S.ceil(r.ceil || "plaster", r.x0, r.z0, r.x1, r.z1, y + h, r.ceilOpts);
      if (sk.indexOf("n") < 0)
        S.wallX(
          r.wallN || wk,
          r.z0,
          r.x0 - t / 2,
          r.x1 + t / 2,
          y,
          y + h,
          t,
          ho.n,
          wo,
        );
      if (sk.indexOf("s") < 0)
        S.wallX(
          r.wallS || wk,
          r.z1,
          r.x0 - t / 2,
          r.x1 + t / 2,
          y,
          y + h,
          t,
          ho.s,
          wo,
        );
      if (sk.indexOf("w") < 0)
        S.wallZ(
          r.wallW || wk,
          r.x0,
          r.z0 + t / 2,
          r.z1 - t / 2,
          y,
          y + h,
          t,
          ho.w,
          wo,
        );
      if (sk.indexOf("e") < 0)
        S.wallZ(
          r.wallE || wk,
          r.x1,
          r.z0 + t / 2,
          r.z1 - t / 2,
          y,
          y + h,
          t,
          ho.e,
          wo,
        );
      // skirting & cornice trims (S.trim: split at the doorways cut into the walls, never drawn across an opening)
      if (r.trim) {
        const tk = r.trim,
          e = 0.04 + t / 2;
        const bands = [
          [y, y + 0.18, 0.05],
          [y + h - 0.25, y + h, 0.09],
        ];
        for (const bd of bands) {
          if (sk.indexOf("n") < 0)
            S.trim(
              tk,
              r.x0,
              bd[0],
              r.z0 + e - 0.01,
              r.x1,
              bd[1],
              r.z0 + e + bd[2],
              { ground: y, seg: false },
            );
          if (sk.indexOf("s") < 0)
            S.trim(
              tk,
              r.x0,
              bd[0],
              r.z1 - e - bd[2],
              r.x1,
              bd[1],
              r.z1 - e + 0.01,
              { ground: y, seg: false },
            );
          if (sk.indexOf("w") < 0)
            S.trim(
              tk,
              r.x0 + e - 0.01,
              bd[0],
              r.z0,
              r.x0 + e + bd[2],
              bd[1],
              r.z1,
              { ground: y, seg: false },
            );
          if (sk.indexOf("e") < 0)
            S.trim(
              tk,
              r.x1 - e - bd[2],
              bd[0],
              r.z0,
              r.x1 - e + 0.01,
              bd[1],
              r.z1,
              { ground: y, seg: false },
            );
        }
      }
      return r;
    };
    /**
     * Straight stair: bottom front edge at (x,z) centred across width, climbing toward dir ('n' = -z, 's' = +z, 'e' = +x, 'w' = -x)
     * from y0 to y1. Returns {x, z} of the top edge (centre). o: {rise=.25 max, run=.3, key, side (stringer key), solid}
     */
    S.stairs = function (key, x, z, dir, width, y0, y1, so) {
      so = so || {};
      const H = y1 - y0,
        n = Math.max(1, Math.ceil(H / (so.rise || 0.24))),
        rise = H / n,
        run = so.run || 0.3;
      const dx = dir === "e" ? 1 : dir === "w" ? -1 : 0,
        dz = dir === "s" ? 1 : dir === "n" ? -1 : 0;
      const hw = width / 2;
      for (let i = 0; i < n; i++) {
        const a = i * run,
          b2 = (i + 1) * run,
          top = y0 + (i + 1) * rise;
        const bot = so.solid === false ? top - Math.max(0.18, rise) : y0 - 0.05;
        let x0, x1, z0, z1;
        if (dx) {
          x0 = x + dx * a;
          x1 = x + dx * b2;
          z0 = z - hw;
          z1 = z + hw;
        } else {
          z0 = z + dz * a;
          z1 = z + dz * b2;
          x0 = x - hw;
          x1 = x + hw;
        }
        S.b.box(
          key,
          Math.min(x0, x1),
          bot,
          Math.min(z0, z1),
          Math.max(x0, x1),
          top,
          Math.max(z0, z1),
          { ground: y0, seg: false, grime: 0.3 },
        );
        if (so.nosing)
          S.b.box(
            so.nosing,
            Math.min(x0, x1) - (dx < 0 ? 0.03 : 0),
            top - 0.04,
            Math.min(z0, z1) - (dz < 0 ? 0.03 : 0),
            Math.max(x0, x1) + (dx > 0 ? 0.03 : 0),
            top + 0.005,
            Math.max(z0, z1) + (dz > 0 ? 0.03 : 0),
            { seg: false, noAO: true },
          );
        S.col(
          Math.min(x0, x1),
          Math.min(bot, top - 0.3),
          Math.min(z0, z1),
          Math.max(x0, x1),
          top,
          Math.max(z0, z1),
          { surface: so.surface || "concrete" },
        );
      }
      const L = n * run;
      // balustrades
      if (so.rail) {
        for (const s of so.railSides || [-1, 1]) {
          const px = dx ? 0 : s * (hw - 0.05),
            pz = dz ? 0 : s * (hw - 0.05);
          const ax = x + (dz ? px : 0),
            az = z + (dx ? pz : 0);
          const A = [ax, y0 + 0.95, az],
            B = [ax + dx * L, y1 + 0.95, az + dz * L];
          S.b.rod(so.rail, A, B, 0.045, 6);
          for (let k = 0; k <= n; k += 2) {
            const t2 = k / n;
            S.b.rod(
              so.rail,
              [ax + dx * L * t2, y0 + H * t2, az + dz * L * t2],
              [ax + dx * L * t2, y0 + H * t2 + 0.95, az + dz * L * t2],
              0.018,
              4,
            );
          }
          if (so.railCol !== false) {
            if (dx)
              S.col(
                Math.min(x, x + dx * L),
                y0,
                az - 0.06,
                Math.max(x, x + dx * L),
                y1 + 1.0,
                az + 0.06,
                { walkable: false },
              );
            else
              S.col(
                ax - 0.06,
                y0,
                Math.min(z, z + dz * L),
                ax + 0.06,
                y1 + 1.0,
                Math.max(z, z + dz * L),
                { walkable: false },
              );
          }
        }
      }
      return { x: x + dx * L, z: z + dz * L, len: L };
    };
    /** Railing (balustrade) along a polyline at height y. pts [[x,z],...]. */
    S.rail = function (key, pts, y, h, ro) {
      ro = ro || {};
      h = h || 1.0;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i],
          b2 = pts[i + 1];
        S.b.rod(
          key,
          [a[0], y + h, a[1]],
          [b2[0], y + h, b2[1]],
          ro.r || 0.05,
          6,
        );
        if (ro.mid !== false)
          S.b.rod(
            key,
            [a[0], y + h * 0.5, a[1]],
            [b2[0], y + h * 0.5, b2[1]],
            (ro.r || 0.05) * 0.6,
            4,
          );
        const L = Math.hypot(b2[0] - a[0], b2[1] - a[1]),
          n = Math.max(1, Math.round(L / (ro.step || 0.3)));
        for (let k = 0; k <= n; k++) {
          const t = k / n,
            px = a[0] + (b2[0] - a[0]) * t,
            pz = a[1] + (b2[1] - a[1]) * t;
          if (ro.baluster)
            S.b.lathe(
              key,
              [
                [0.001, 0],
                [0.06, 0.02],
                [0.035, 0.15],
                [0.07, h * 0.5],
                [0.035, h * 0.8],
                [0.05, h - 0.02],
                [0.001, h],
              ],
              6,
              px,
              y,
              pz,
            );
          else S.b.rod(key, [px, y, pz], [px, y + h, pz], ro.pr || 0.016, 4);
        }
        if (ro.col !== false) {
          const cx = (a[0] + b2[0]) / 2,
            cz = (a[1] + b2[1]) / 2,
            ang = Math.atan2(b2[1] - a[1], b2[0] - a[0]);
          S.colR(cx, cz, L, 0.12, y, y + h, -ang, { walkable: false });
        }
      }
    };
    // ---- anchors, lights, props, pickups, containers, doors ----
    S.anchor = function (name, x, y, z, yaw) {
      const v = S.W(x, y, z);
      v.yaw = yaw || 0;
      S.anchors[name] = v;
      return v;
    };
    S.light = function (x, y, z, color, r, i, glow) {
      S.b.light(x, y, z, color, r, i);
      if (glow) S.glow(x, y, z, color, glow.size || glow, glow.opts);
    };
    S.glows = [];
    S.glow = function (x, y, z, color, size, go) {
      const pos = S.W(x, y, z);
      S.glows.push({ pos, color, size, opts: go });
    };
    S.props = [];
    let propN = 0;
    S.prop = function (type, x, y, z, yaw, po) {
      const w = S.W(x, y, z);
      // props has no 'dresser' prototype; rpg's containers module has a dresser model → build it there
      if (type === "dresser") {
        const c = Object.assign(
          {
            name: "Dresser",
            pos: w,
            yaw: yaw || 0,
            kind: "dresser",
            loot: "dresser",
            model: true,
            id: "pu_" + id + "_dresser_" + ++propN,
          },
          po || {},
        );
        if (!c.items) delete c.items;
        else if (c.loot === "dresser" && c.items) delete c.loot;
        S.containers.push(c);
        return c;
      }
      const opts = Object.assign(
        {
          x: w.x,
          y: w.y,
          z: w.z,
          yaw: yaw || 0,
          persistent: true,
          id: "pu:" + id + ":" + type + ":" + ++propN,
        },
        po || {},
      );
      S.props.push({ type, opts });
      return opts;
    };
    S.pickups = [];
    S.pickup = function (itemId, n, x, y, z, po) {
      S.pickups.push({
        id: itemId,
        n: n || 1,
        pos: S.W(x, y, z),
        opts: po || {},
      });
    };
    S.containers = [];
    S.container = function (name, x, y, z, co) {
      S.containers.push(
        Object.assign(
          {
            name,
            pos: S.W(x, y, z),
            model: false,
            id:
              "pu_" +
              id +
              "_" +
              name.replace(/\W+/g, "_").toLowerCase() +
              "_" +
              S.containers.length,
          },
          co || {},
        ),
      );
    };
    S.doors = [];
    /** Teleport door: pos local, target WORLD {x,y,z,yaw}. Returns the core door (after build: S.doors[i].door). */
    S.door = function (x, y, z, label, target, dopts) {
      const d = Object.assign(
        {
          pos: S.W(x, y, z),
          label,
          target,
          verb: "Enter",
          radius: 1.4,
          sound: "door_open",
        },
        dopts || {},
      );
      const door = G.world.addDoor(d);
      S.doors.push(door);
      return door;
    };
    S.interact = function (x, y, z, def) {
      const it = G.world.addInteractable(
        Object.assign({ pos: S.W(x, y, z), radius: 0.8 }, def),
      );
      return it;
    };
    S.build = function (bo) {
      bo = bo || {};
      if (S.interiorKey && S.b.lit && P.fillCell)
        P.safe("fill:" + S.id, () => P.fillCell(S));
      const lightList = S.b.lights.slice();
      S.b.build(S.root, bo);
      if (bo.interior)
        P.safe("fixtures:" + S.id, () => P.registerFixtureLights(S, lightList));
      for (const g of S.glows) {
        P.safe("glow", () => {
          if (!G.isStub("fx") && G.fx.glowSprite)
            G.fx.glowSprite(
              g.pos,
              g.color,
              g.size,
              Object.assign(
                {
                  parent: S.root,
                  intensity: 1.2,
                  dayFactor: bo.interior ? 1 : 0.35,
                },
                g.opts || {},
              ),
            );
        });
      }
      G.scene.add(S.root);
      return S.root;
    };
    return S;
  };

  // ===================================================================
  // Facade helper — u along the wall (viewer's left → right when looking at
  // the wall from outside), d outward from the wall plane, y up.
  // ===================================================================
  /**
   * P.face(S, side, a0, a1, c): side 'n'|'s'|'e'|'w' = which way the facade faces; the wall plane is at
   * z=c (n/s) or x=c (e/w), spanning a0..a1 (x for n/s, z for e/w). Local coords of the site.
   */
  P.face = function (S, side, a0, a1, c) {
    // side may also be a wall LINE [ax, az, bx, bz] at any angle (e.g. a wedge face along Broadway): u runs
    // from A to B, the facade faces to the viewer's side, i.e. outward normal = (-dz, dx) of A→B.
    const line = Array.isArray(side) ? side : null;
    if (line) {
      c = 0;
      a0 = 0;
      a1 = Math.hypot(line[2] - line[0], line[3] - line[1]);
    }
    const F = { S, side: line ? "line" : side, c, len: Math.abs(a1 - a0) };
    // viewer looking at the facade: facing south (n side) → viewer's right is west
    let ox, oz, dx, dz, nx, nz;
    if (line) {
      ox = line[0];
      oz = line[1];
      dx = (line[2] - line[0]) / F.len;
      dz = (line[3] - line[1]) / F.len;
      nx = -dz;
      nz = dx;
    } else if (side === "s") {
      ox = Math.min(a0, a1);
      oz = c;
      dx = 1;
      dz = 0;
      nx = 0;
      nz = 1;
    } else if (side === "n") {
      ox = Math.max(a0, a1);
      oz = c;
      dx = -1;
      dz = 0;
      nx = 0;
      nz = -1;
    } else if (side === "e") {
      ox = c;
      oz = Math.max(a0, a1);
      dx = 0;
      dz = -1;
      nx = 1;
      nz = 0;
    } else {
      ox = c;
      oz = Math.min(a0, a1);
      dx = 0;
      dz = 1;
      nx = -1;
      nz = 0;
    }
    Object.assign(F, { ox, oz, dx, dz, nx, nz });
    F.pt = (u, d) => [ox + dx * u + nx * (d || 0), oz + dz * u + nz * (d || 0)];
    F.ry = line
      ? Math.atan2(nx, nz)
      : side === "s"
        ? 0
        : side === "n"
          ? PI
          : side === "e"
            ? HP
            : -HP; // quad facing outward
    // oblique facade: boxes are built in facade space (x = u, z = d) and placed by the facade basis
    const basis = line
      ? new THREE.Matrix4()
          .makeBasis(
            new THREE.Vector3(dx, 0, dz),
            new THREE.Vector3(0, 1, 0),
            new THREE.Vector3(nx, 0, nz),
          )
          .setPosition(ox, 0, oz)
      : null;
    /** Box in facade coords (axis aligned on n/s/e/w facades, aligned with the wall on a line facade). */
    F.box = function (key, u0, u1, y0, y1, d0, d1, o) {
      if (basis)
        return S.b.box(
          key,
          Math.min(u0, u1),
          y0,
          Math.min(d0, d1),
          Math.max(u0, u1),
          y1,
          Math.max(d0, d1),
          Object.assign({}, o || {}, {
            m: o && o.m ? basis.clone().multiply(o.m) : basis,
          }),
        );
      const p0 = F.pt(u0, d0),
        p1 = F.pt(u1, d1);
      return S.b.box(
        key,
        Math.min(p0[0], p1[0]),
        y0,
        Math.min(p0[1], p1[1]),
        Math.max(p0[0], p1[0]),
        y1,
        Math.max(p0[1], p1[1]),
        o,
      );
    };
    F.quad = function (key, u, y, w, h, d, o) {
      const p = F.pt(u, d || 0.02);
      return S.b.quad(
        key,
        p[0],
        y,
        p[1],
        w,
        h,
        Object.assign({ ry: F.ry }, o || {}),
      );
    };
    /** Matrix placing a local XY shape (x → u, y → up, z → outward) at (u, y, d). */
    F.mat = function (u, y, d) {
      const p = F.pt(u, d);
      return new THREE.Matrix4()
        .makeBasis(
          new THREE.Vector3(dx, 0, dz),
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(nx, 0, nz),
        )
        .setPosition(p[0], y, p[1]);
    };
    /** Arch ring (voussoirs) centred at u, springing at y, inner radius r, thickness th, depth d0..d1. */
    F.arch = function (key, u, y, r, th, d0, d1, o) {
      const sh = new THREE.Shape();
      sh.absarc(0, 0, r + th, 0, PI, false);
      sh.lineTo(-r, 0);
      sh.absarc(0, 0, r, PI, 0, true);
      sh.lineTo(r + th, 0);
      return S.b.extrude(
        key,
        sh,
        d1 - d0,
        F.mat(u, y, d0),
        Object.assign({ curve: 12 }, o || {}),
      );
    };
    /** Filled half-disc (arched glass / tympanum). */
    F.halfDisc = function (key, u, y, r, d, o) {
      const g = new THREE.CircleGeometry(r, 14, 0, PI);
      return S.b.geo(
        key,
        g,
        F.mat(u, y, d),
        Object.assign({ uv: "box" }, o || {}),
      );
    };
    /**
     * Window: glass pane on the wall + frame + sill + head. o: {style:'dark'|'broken'|'lit'|'boarded'|'glass', frame key, arch (bool),
     * sill key, hood key ('pediment'|'cornice'|'flat'), mull (glazing bars), depth, keystone}
     */
    F.window = function (u, y, w, h, o) {
      o = o || {};
      const fk = o.frame || "paint_white",
        gk =
          o.style === "broken"
            ? "glass_broken"
            : o.style === "lit"
              ? "window_lit"
              : o.style === "glass"
                ? "glass"
                : "glass_dark";
      const d = o.d || 0.02;
      const archR = o.arch ? w / 2 : 0;
      const hr = h - archR;
      // glass
      F.box(gk, u - w / 2, u + w / 2, y, y + hr, d - 0.05, d, {
        seg: false,
        grime: 0.1,
        noAO: true,
      });
      if (o.arch)
        F.halfDisc(gk, u, y + hr, w / 2, d + 0.005, { grime: 0.1, noAO: true });
      if (o.style === "boarded") {
        const r = P.rng(u * 7.3 + y * 1.3 + c);
        for (let i = 0; i < 4; i++) {
          const yy = y + 0.3 + (i * (hr - 0.4)) / 3;
          F.box(
            "wood_rotten",
            u - w / 2 - 0.05,
            u + w / 2 + 0.05,
            yy - 0.1,
            yy + 0.1,
            d,
            d + 0.05,
            { seg: false, rz: 0 },
          );
          void r;
        }
      }
      // frame
      const ft = o.ft || 0.1,
        fd = o.fd || 0.12;
      F.box(fk, u - w / 2 - ft, u - w / 2, y, y + hr, d - 0.02, d + fd, {
        seg: false,
      });
      F.box(fk, u + w / 2, u + w / 2 + ft, y, y + hr, d - 0.02, d + fd, {
        seg: false,
      });
      if (!o.arch)
        F.box(
          fk,
          u - w / 2 - ft,
          u + w / 2 + ft,
          y + hr,
          y + hr + ft,
          d - 0.02,
          d + fd,
          { seg: false },
        );
      else F.arch(fk, u, y + hr, w / 2, ft, d - 0.02, d + fd);
      if (o.mull !== false) {
        F.box(fk, u - 0.025, u + 0.025, y, y + hr, d, d + 0.04, { seg: false });
        F.box(
          fk,
          u - w / 2,
          u + w / 2,
          y + hr * 0.55,
          y + hr * 0.55 + 0.05,
          d,
          d + 0.04,
          { seg: false },
        );
      }
      // sill
      if (o.sill !== false)
        F.box(
          o.sill || fk,
          u - w / 2 - ft - 0.08,
          u + w / 2 + ft + 0.08,
          y - 0.12,
          y,
          d - 0.02,
          d + fd + 0.12,
          { seg: false },
        );
      // head
      const hk = o.hoodKey || o.sill || fk;
      if (o.hood === "cornice")
        F.box(
          hk,
          u - w / 2 - 0.3,
          u + w / 2 + 0.3,
          y + h + ft,
          y + h + ft + 0.18,
          d,
          d + 0.3,
          { seg: false },
        );
      else if (o.hood === "pediment") {
        const sh = new THREE.Shape();
        const hw = w / 2 + 0.35;
        sh.moveTo(-hw, 0);
        sh.lineTo(hw, 0);
        sh.lineTo(0, 0.55);
        sh.closePath();
        S.b.extrude(hk, sh, 0.25, F.mat(u, y + h + ft + 0.05, d), {
          seg: false,
        });
        F.box(
          hk,
          u - hw,
          u + hw,
          y + h + ft - 0.05,
          y + h + ft + 0.08,
          d,
          d + 0.3,
          { seg: false },
        );
      } else if (o.hood === "flat")
        F.box(
          hk,
          u - w / 2 - 0.15,
          u + w / 2 + 0.15,
          y + h + ft,
          y + h + ft + 0.3,
          d,
          d + 0.14,
          { seg: false },
        );
      if (o.arch && o.keystone)
        F.box(
          o.keystone,
          u - 0.18,
          u + 0.18,
          y + h - 0.05,
          y + h + ft + 0.35,
          d,
          d + fd + 0.06,
          { seg: false },
        );
    };
    /** Horizontal band (string course / cornice) across the whole facade. */
    F.band = function (key, y0, y1, d0, d1, o) {
      return F.box(
        key,
        -(o && o.ext !== undefined ? o.ext : 0),
        F.len + (o && o.ext !== undefined ? o.ext : 0),
        y0,
        y1,
        d0,
        d1,
        o,
      );
    };
    /** Classical cornice: stepped profile + modillion blocks. */
    F.cornice = function (key, y, proj, o) {
      o = o || {};
      const e = o.ext === undefined ? proj : o.ext;
      F.box(key, -e * 0.4, F.len + e * 0.4, y, y + 0.25, 0, proj * 0.4, {
        seg: false,
      });
      F.box(key, -e * 0.7, F.len + e * 0.7, y + 0.25, y + 0.55, 0, proj * 0.7, {
        seg: false,
      });
      F.box(key, -e, F.len + e, y + 0.55, y + 0.85, 0, proj, { seg: false });
      if (o.mods !== false) {
        const n = Math.floor(F.len / (o.step || 0.9));
        for (let i = 0; i <= n; i++) {
          const u = (i * F.len) / n;
          F.box(
            key,
            u - 0.09,
            u + 0.09,
            y + 0.12,
            y + 0.55,
            proj * 0.3,
            proj * 0.85,
            { seg: false },
          );
        }
      }
    };
    return F;
  };

  // ===================================================================
  // Registry (G.pois) + anchors
  // ===================================================================
  P.register = function (id, rec) {
    if (!G.pois || G.pois.__stub) G.pois = {};
    G.pois[id] = Object.assign({ id, owner: "poi_uptown" }, rec);
    if (typeof G.pois.getAnchor !== "function") {
      G.pois.getAnchor = function (idOrKey, name) {
        const scan = (p) => {
          if (!p || typeof p !== "object" || !p.anchors) return null;
          const v = p.anchors[name];
          if (!v) return null;
          const c = v.clone();
          c.yaw = v.yaw || 0;
          return c;
        };
        const direct = G.pois[idOrKey];
        const a = scan(direct);
        if (a) return a;
        for (const k in G.pois) {
          const p = G.pois[k];
          if (
            p &&
            typeof p === "object" &&
            (p.interiorKey === idOrKey || p.id === idOrKey)
          ) {
            const r = scan(p);
            if (r) return r;
          }
        }
        return null;
      };
    }
    return G.pois[id];
  };
  P.anchor = (poiId, name) => {
    const p = G.pois && G.pois[poiId];
    const v = p && p.anchors ? p.anchors[name] : null;
    if (!v) return null;
    const c = v.clone();
    c.yaw = v.yaw || 0;
    return c;
  };
  /** Interior root visibility registry. */
  P.addInterior = function (key, root) {
    const o = G.LAYOUT.INTERIORS[key].origin;
    P.interiors.push({ key, root, ox: o.x, oz: o.z });
  };
  P.animate = function (x, z, r, fn) {
    P.animators.push({ c: { x, z }, r2: r * r, fn });
  };
  P.inCell = function (key, pos) {
    const I = G.LAYOUT.INTERIORS[key];
    if (!I) return false;
    pos = pos || (G.player && G.player.pos);
    if (!pos) return false;
    return (
      Math.abs(pos.x - I.origin.x) < 170 && Math.abs(pos.z - I.origin.z) < 170
    );
  };
  P.I = (key) => G.LAYOUT.INTERIORS[key].origin;
  P.site_ = (id) => G.LAYOUT.getSite(id);
})();
