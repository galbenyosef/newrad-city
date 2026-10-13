// play-inline-21 01 — rec
// Lines 58-376 of readable/play-inline-21.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G._tx;
  const now = () => performance.now();

  // ==================================================================
  // Texture tracking, measured memory, CPU trimming with lazy re-paint
  // ==================================================================
  const tracked = []; // records, one per Source
  const recBySource = new WeakMap(); // Source -> record
  X.stats.cpuBytes = 0;
  X.stats.gpuBytes = 0;
  X.stats.uploads = 0;
  X.stats.regens = 0;
  X.stats.trimmed = 0;
  let maxAniso = 8;
  let initDone = false;

  function finishTexture(tex, srgb, repeat) {
    tex.wrapS = tex.wrapT =
      repeat === false ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
    tex.colorSpace = srgb === false ? THREE.NoColorSpace : THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }
  X.finishTexture = finishTexture;
  /** 4×4 flat (0,0,1) normal canvas — last-resort stand-in. */
  X.flatNormal = function () {
    const f = X.canvas(4, 4);
    f.ctx.fillStyle = "#8080ff";
    f.ctx.fillRect(0, 0, 4, 4);
    return f.c;
  };

  /** three.js calls this after every real GPU upload of the texture (or a clone sharing its Source). */
  function onUploaded(t) {
    const rec = recBySource.get(t.source);
    if (!rec) return;
    rec.lastUpload = now();
    if (rec.disposed) {
      // disposed while a material still used it: three re-uploaded it — count it again (and say so once)
      rec.disposed = false;
      rec.uploaded = false;
      if (!warned.has("redisp:" + rec.name)) {
        warned.add("redisp:" + rec.name);
        console.warn(
          '[textures] "' +
            rec.name +
            '" was disposed while still in use and got re-uploaded',
        );
      }
    }
    if (!rec.uploaded) {
      rec.uploaded = true;
      rec.gpuBytes = rec.bytes * (t.generateMipmaps ? 1.333 : 1);
      X.stats.gpuBytes += rec.gpuBytes;
      X.stats.uploads++;
    }
  }
  X.onUploaded = onUploaded;

  /** Make a Source's pixels lazily re-paintable so the canvas can be dropped from CPU RAM. */
  function makeLazy(rec) {
    const src = rec.tex.source;
    let data = src.data;
    Object.defineProperty(src, "data", {
      configurable: true,
      enumerable: true,
      get() {
        if (data === null && rec.trimmed) {
          try {
            data = rec.regen();
          } catch (e) {
            G.reportError("textures:regen:" + rec.name, e);
            data = X.canvas(4, 4).c;
          }
          rec.trimmed = false;
          rec.born = now();
          X.stats.regens++;
          X.stats.trimmed--;
          X.stats.cpuBytes += rec.bytes;
        }
        return data;
      },
      set(v) {
        if (rec.trimmed && v) {
          rec.trimmed = false;
          X.stats.trimmed--;
          X.stats.cpuBytes += rec.bytes;
        }
        data = v;
      },
    });
    rec.drop = function () {
      if (rec.trimmed || data === null) return;
      data = null;
      rec.trimmed = true;
      X.stats.trimmed++;
      X.stats.cpuBytes -= rec.bytes;
      if (rec.onDrop) rec.onDrop();
    };
  }

  /**
   * Wrap a canvas into a configured, tracked texture.
   * opts: {name, srgb, repeat, regen: () => canvas (same size, deterministic), pin: never trim, onDrop}
   */
  X.toTexture = function (canvas, opts) {
    opts = opts || {};
    const tex = new THREE.CanvasTexture(canvas);
    finishTexture(tex, opts.srgb, opts.repeat);
    if (opts.name) tex.name = opts.name;
    const rec = {
      tex,
      name: opts.name || "",
      bytes: canvas.width * canvas.height * 4,
      regen: opts.regen || null,
      pinned: !!opts.pin,
      uploaded: false,
      trimmed: false,
      born: now(),
      gpuBytes: 0,
      onDrop: opts.onDrop || null,
    };
    recBySource.set(tex.source, rec);
    tex.onUpdate = onUploaded;
    if (rec.regen) makeLazy(rec);
    tracked.push(rec);
    X.stats.cpuBytes += rec.bytes;
    X.stats.bytes = X.stats.cpuBytes; // legacy field
    return tex;
  };
  /** Mark a texture's canvas as handed out (e.g. to the DOM) so it is never trimmed. */
  X.pin = function (tex) {
    const rec = tex && recBySource.get(tex.source);
    if (rec) rec.pinned = true;
  };

  /**
   * Release source canvases from CPU RAM.
   * idleMs: textures never uploaded are released once older than this (they were consumed by copy).
   */
  function trim(idleMs) {
    const t = now();
    let n = 0;
    for (const rec of tracked) {
      if (!rec.drop || rec.pinned || rec.trimmed || rec.disposed) continue;
      if (rec.uploaded ? t - rec.lastUpload > 1500 : t - rec.born > idleMs) {
        rec.drop();
        n++;
      }
    }
    // height canvases kept for normal-map generation
    for (const [name, e] of texCache)
      if (e.hcv && t - e.born > idleMs) {
        e.hcv = null;
        void name;
      }
    return n;
  }

  const hasOwn = Object.prototype.hasOwnProperty;
  // Brand synonyms (permanent, not transitional): the ids core/layout.js chose for its billboard list → the brand art here.
  const BRAND_SYN = {
    civil_defense: "long_winter",
    fizzo: "fizzo_cola",
    vigil_defense: "vigil",
    liberty: "liberty_jetliner",
    journal: "first_journal",
    pizza: "pizza_galaxy",
    empire: "empire_brew",
    cigarettes: "silver_torch",
    burger: "burger_brigade",
    excalibur: "excalibur_gardens",
    rocketeer: "junior_rocketeer",
    tonic: "miracle_mane",
    taxi: "big_apple_cab",
    cab: "big_apple_cab",
    marinara: "mama_marinara",
    gas: "hi_octane",
    harrys: "hi_octane",
    cereal: "freedom_flakes",
    zeppelin: "chocolate_zeppelin",
    jerky: "golden_plain",
    cleanser: "homeguard",
    lonly: "lonly_tv",
    tv: "lonly_tv",
    eagle: "eagle_motors",
    comics: "super_sergeant",
    automaton: "american_automaton",
    robots: "american_automaton",
    franks: "forever_franks",
    hot_dogs: "forever_franks",
  };
  /** Brand id after the permanent synonyms (unchanged when it has none). */
  X.brandId = function (id) {
    return typeof id === "string" && hasOwn.call(BRAND_SYN, id)
      ? BRAND_SYN[id]
      : id;
  };

  // ==================================================================
  // Surface texture cache
  // ==================================================================
  const texCache = new Map(); // name -> {tex, def, hcv, born}
  const normCache = new Map(); // name -> texture|null
  const roughCache = new Map(); // name -> texture|null
  const warned = new Set();
  // Surfaces whose relief is fine enough to deserve a full-resolution normal map; others get half-res (¼ memory).
  const FULL_NORMAL =
    /^(brick_|cobblestone|tile_|cryo_wall|metal_panel|metal_diamond|corrugated|sidewalk)/;

  /** Paint a surface generator into fresh canvases. Deterministic (seeded). */
  function paintSurface(name, def) {
    const w = def.w || 512,
      h = def.h || w;
    const cv = X.canvas(w, h);
    // Height canvas: always supplied (generators may draw into it unconditionally).
    const hcv = X.canvas(w, h);
    hcv.ctx.fillStyle = "#808080";
    hcv.ctx.fillRect(0, 0, w, h);
    const r = X.rng(X.seedOf(name) ^ (def.seed || 0));
    try {
      def.gen(cv.ctx, w, h, r, hcv.ctx, def);
    } catch (e) {
      G.reportError("textures:gen:" + name, e);
    }
    return { c: cv.c, hcv: def.normal ? hcv.c : null }; // raw canvas (NOT the {c,ctx} wrapper)
  }
  X.paintSurface = paintSurface;

  function generate(name) {
    const def = X.GEN[name];
    if (!def) return null;
    const t0 = now();
    const p = paintSurface(name, def);
    const tex = X.toTexture(p.c, {
      srgb: def.srgb,
      repeat: def.repeat,
      name,
      regen: () => paintSurface(name, def).c,
    });
    const entry = { tex, def, hcv: p.hcv, born: now() };
    texCache.set(name, entry);
    X.stats.generated++;
    X.stats.ms += now() - t0;
    return entry;
  }

  function fallbackName(name) {
    // Try some forgiving aliases before giving up.
    const n = String(name || "").toLowerCase();
    const alias = {
      brick: "brick_red",
      metal: "metal_painted",
      wood: "wood_planks",
      grass: "grass_dead",
      stone: "stone_limestone",
      limestone: "stone_limestone",
      road: "asphalt",
      glass: "glass_dirty",
      plaster: "plaster_stained",
      tile: "tile_floor",
      marble_white: "marble",
      sand: "sand",
      cryo: "cryo_wall",
      cryo_floor: "tile_cryo",
      concrete_light: "concrete",
      skin: "skin_base",
      cloth: "fabric",
      metal_rusty: "rust",
      sheet_metal: "corrugated",
    };
    if (alias[n] && X.GEN[alias[n]]) return alias[n];
    if (/^facade_/.test(n)) {
      const m = n.match(/^facade_([a-z]+)_?(\d+)?/);
      if (m) {
        const s = normStyle(m[1]);
        const k = "facade_" + s + "_1";
        if (X.GEN[k]) return k;
      }
    }
    if (n.length >= 3) for (const k in X.GEN) if (k.startsWith(n)) return k;
    return null;
  }

  /** Normal canvas for a surface (re-paints the height field if it was released). */
  function buildNormalCanvas(name) {
    const e = texCache.get(name);
    const def = X.GEN[name];
    if (!def || !def.normal) return null;
    let hcv = e && e.hcv;
    if (!hcv) hcv = paintSurface(name, def).hcv;
    if (e) e.hcv = null; // consumed
    if (hcv && !hcv.getContext && hcv.c) hcv = hcv.c; // tolerate a wrapper
    if (!hcv || !hcv.getContext) return null;
    const w = hcv.width,
      h = hcv.height;
    const height = X.heightFromCtx(hcv.getContext("2d"), w, h);
    const step = def.normalStep || (w >= 512 ? 2 : 1);
    const nc = X.normalCanvas(height, w, h, def.normal * step * 0.45, step);
    const half = w >= 512 && !FULL_NORMAL.test(name) && !def.normalFull;
    if (!half) return nc;
    const hc = X.canvas(w >> 1, h >> 1);
    hc.ctx.imageSmoothingEnabled = true;
    hc.ctx.imageSmoothingQuality = "high";
    hc.ctx.drawImage(nc, 0, 0, w >> 1, h >> 1);
    return hc.c;
  }

  /**
   * Roughness map (three.js reads G) derived from the colour: grime/dark = rougher, clean paint & wet = smoother.
   * Only for defs with roughVar. 256² max.
   */
