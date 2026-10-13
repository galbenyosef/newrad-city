/* src/textures/90_api.js */
/* =====================================================================
 * NEW RAD CITY — TEXTURES: public API (G.tex, G.mats) + module
 * Owned by: textures.  Order 10.
 *
 * Everything is generated LAZILY on first request and cached (one
 * CanvasTexture per name, one shared material per name+opts), so only
 * textures the world actually uses cost memory.
 *
 *   G.tex.get(name)            -> THREE.CanvasTexture (sRGB, repeat, mips, aniso)
 *   G.tex.normal(name)         -> normal map texture or null
 *   G.tex.roughness(name)      -> roughness map (G channel) or null (surfaces with def.roughVar)
 *   G.tex.info(name)           -> {w, h, meters, normal, ...} (meters = world size of one tile)
 *   G.tex.names()              -> all generator names
 *   G.tex.billboard(brand, v)  -> billboard (2:1) texture       (32_ads.js)
 *   G.tex.poster(brand, v)     -> poster (2:3) texture          (32_ads.js)
 *   G.tex.sign(text, style)    -> sign texture                  (40_signs.js)
 *   G.tex.neon(text, color)    -> emissive neon texture         (40_signs.js)
 *   G.tex.decal(name)          -> RGBA decal texture            (40_signs.js)
 *   G.tex.icon(name)           -> UI icon texture; iconURL(name) data URL
 *   G.tex.signAtlas(list)      -> {texture, rects, byText}: many signs packed into ONE texture (40_signs.js)
 *   G.tex.facadeInfo(style)    -> {tileW, tileH, bays, floors, floorH, bayW}
 *   G.tex.applyBoxUV(geom, metersPerTile, opts) -> geometry with box-projected UVs
 *   G.tex.stats()              -> measured memory: {cpuMB, gpuMB, uploaded, trimmed, ...}
 *   G.tex.trim(), G.tex.dispose(name)
 *
 *   G.mats.get(name, opts)     -> shared MeshStandardMaterial (userData.shared = true)
 *   G.mats.billboard(brand, variant, {lit})
 *   G.mats.facade(style, variant), G.mats.facadeTrim(style, 'top'|'base')
 *   G.mats.sign(text, style), G.mats.neon(text, color), G.mats.decal(name), G.mats.poster(brand, v)
 *   G.mats.track(mat)          -> register a foreign/cloned material for night glow + macro variation
 *   G.mats.setNight(f) (optional override; normally driven by atmosphere / G.time.hour)
 *
 * ---------------------------------------------------------------------
 * CLONE-SAFE NIGHT GLOW & MACRO VARIATION
 * Other modules clone our shared materials (vertex colours, polygon
 * offsets...). Every material built here is a TxStandardMaterial (a thin
 * MeshStandardMaterial subclass) whose constructor installs one
 * onBeforeCompile hook; `mat.clone()` runs that constructor, so clones
 * inherit the hook with no scan and no later recompile. Parameters live in
 * userData tags (copied by clone):
 *   userData.txGlow  = {d, n, f}  day/night emissiveIntensity, flicker flag
 *   userData.txMacro = k          strength of the world-space anti-tiling tint
 *   userData.txBand  = k          street-level grime band (walls/facades)
 * The hook (a) injects the macro-variation shader (uniforms are live getters
 * on userData) and (b) registers the material with the night-glow driver the
 * first time it is rendered. A slow sweep (12 s) only catches foreign copies.
 * ---------------------------------------------------------------------
 * MEMORY
 * Every texture is tracked by its THREE.Source. GPU bytes are measured
 * from real uploads (texture.onUpdate). Source canvases are released
 * from CPU RAM once uploaded (or once idle and never uploaded, e.g.
 * billboards copied into another module's atlas): the Source's `data`
 * becomes a lazy getter that re-paints the (seeded, deterministic)
 * canvas if three.js or a caller ever needs the pixels again.
 * ===================================================================== */
(function () {
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
  function buildRoughCanvas(name) {
    const def = X.GEN[name];
    const src = TEX.get(name).image;
    const s = Math.min(256, src.width),
      sh = Math.round((s * src.height) / src.width);
    const cv = X.canvas(s, sh);
    cv.ctx.drawImage(src, 0, 0, s, sh);
    const img = cv.ctx.getImageData(0, 0, s, sh),
      d = img.data;
    let mean = 0;
    for (let i = 0; i < d.length; i += 4)
      mean += d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
    mean /= d.length / 4;
    const base = def.rough === undefined ? 0.8 : def.rough,
      k = def.roughVar;
    // generator-painted gloss (tar seals, polished wheel paths, oil): smoother than the colour alone would say
    let gl = null;
    if (X.gloss && X.gloss[name]) {
      const gcv = X.canvas(s, sh);
      gcv.ctx.drawImage(X.gloss[name], 0, 0, s, sh);
      gl = gcv.ctx.getImageData(0, 0, s, sh).data;
    }
    for (let i = 0; i < d.length; i += 4) {
      const l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      let v = base + ((mean - l) / 255) * k * (def.roughInvert ? -1 : 1);
      if (gl) v -= (gl[i] / 255) * 0.55;
      v = Math.max(0.04, Math.min(1, v)) * 255;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    cv.ctx.putImageData(img, 0, 0);
    return cv.c;
  }

  const TEX = {
    __textures: true,
    /** Cached texture by name. Unknown names fall back (warn once). */
    get(name) {
      if (name === undefined || name === null || name === "") {
        if (!warned.has("<empty>")) {
          warned.add("<empty>");
          console.warn(
            "[textures] G.tex.get() called without a name -> concrete",
          );
        }
        return (texCache.get("concrete") || generate("concrete")).tex;
      }
      name = String(name);
      let e = texCache.get(name);
      if (e) return e.tex;
      if (X.GEN[name]) return generate(name).tex;
      // dynamic families
      const pm = /^paint_(.+)$/.exec(name);
      if (pm && X.definePaint) {
        X.definePaint(pm[1]);
        if (X.GEN[name]) return generate(name).tex;
      }
      const alt = fallbackName(name);
      if (!warned.has(name)) {
        warned.add(name);
        console.warn(
          '[textures] unknown texture "' +
            name +
            '"' +
            (alt ? " -> " + alt : " -> concrete"),
        );
      }
      e = texCache.get(alt || "concrete") || generate(alt || "concrete");
      texCache.set(name, e);
      return e.tex;
    },
    /** Normal map for textures that define a height field (brick, concrete, metal, asphalt, ...). null otherwise. */
    normal(name) {
      if (normCache.has(name)) return normCache.get(name);
      TEX.get(name);
      const e = texCache.get(name);
      const real = e && e.def ? e.def.name : name;
      let tex = null;
      if (real !== name && normCache.has(real)) tex = normCache.get(real);
      else if (e && e.def && e.def.normal) {
        // A normal-map failure must never take down G.mats.get / facade: degrade to "no normal map".
        try {
          const nc = buildNormalCanvas(real);
          if (nc)
            tex = X.toTexture(nc, {
              srgb: false,
              repeat: e.def.repeat,
              name: real + "_n",
              regen: () => {
                try {
                  return buildNormalCanvas(real) || X.flatNormal();
                } catch (err) {
                  return X.flatNormal();
                }
              },
            });
        } catch (err) {
          tex = null;
          if (!warned.has("n:" + real)) {
            warned.add("n:" + real);
            G.reportError("textures:normal:" + real, err);
          }
        }
        normCache.set(real, tex);
      }
      normCache.set(name, tex);
      return tex;
    },
    /** Roughness map (G channel) for surfaces with def.roughVar; null otherwise. */
    roughness(name) {
      if (roughCache.has(name)) return roughCache.get(name);
      const def = X.GEN[name];
      let tex = null;
      if (def && def.roughVar)
        tex = X.toTexture(buildRoughCanvas(name), {
          srgb: false,
          repeat: def.repeat,
          name: name + "_r",
          regen: () => buildRoughCanvas(name),
        });
      roughCache.set(name, tex);
      return tex;
    },
    has(name) {
      return !!X.GEN[name];
    },
    info(name) {
      const d = X.GEN[name];
      if (!d) return null;
      return {
        name,
        w: d.w || 512,
        h: d.h || d.w || 512,
        meters: d.meters || 4,
        metersV: d.metersV || d.meters || 4,
        normal: !!d.normal,
        rough: d.rough,
        metal: d.metal,
        desc: d.desc || "",
        facade: d.facade || null,
      };
    },
    names(filter) {
      return Object.keys(X.GEN).filter(
        (n) => !filter || n.indexOf(filter) >= 0,
      );
    },
    /** The source canvas (e.g. for DOM/UI use). The texture is pinned (never trimmed from RAM). */
    canvas(name) {
      const t = TEX.get(name);
      X.pin(t);
      return t ? t.image : null;
    },
    /**
     * Measured memory. cpuMB = live source canvases; gpuMB = textures actually uploaded (incl. mips);
     * textures = tracked sources; uploaded/trimmed counts; glTextures = renderer.info.memory.textures (all modules).
     */
    stats() {
      let gl = null;
      try {
        gl = G.renderer.info.memory.textures;
      } catch (e) {
        gl = null;
      }
      let prg = null;
      try {
        prg = G.renderer.info.programs.length;
      } catch (e) {
        prg = null;
      }
      const up = tracked.filter((r) => r.uploaded && !r.disposed).length;
      return {
        generated: X.stats.generated,
        ms: Math.round(X.stats.ms),
        textures: tracked.length,
        uploaded: up,
        trimmed: X.stats.trimmed,
        regens: X.stats.regens,
        cpuMB: +(X.stats.cpuBytes / 1048576).toFixed(1),
        gpuMB: +(X.stats.gpuBytes / 1048576).toFixed(1),
        approxMB: Math.round((X.stats.cpuBytes + X.stats.gpuBytes) / 1048576),
        glTextures: gl,
        materials: matCache.size,
        glowMats: glowList.length,
        macroMats: X.macroCount || 0,
        winMats: X.winCount || 0,
        programs: prg,
        quality: Q.quality,
        tier: Q.tier,
        fallback: Object.keys(fail).filter((k) => fail[k]),
        sweepMaxMs: X.sweepStats ? X.sweepStats.maxMs : 0,
        detectMaxMs: X.sweepStats ? X.sweepStats.detectMaxMs : 0,
        detectIdle: X.sweepStats ? X.sweepStats.idleRuns : 0,
      };
    },
    /** Per-texture memory listing (debug): [{name, kb, uploaded, trimmed}] sorted by size. */
    memoryReport() {
      return tracked
        .filter((r) => !r.disposed)
        .map((r) => ({
          name: r.name,
          kb: Math.round(r.bytes / 1024),
          uploaded: r.uploaded,
          trimmed: r.trimmed,
        }))
        .sort((a, b) => b.kb - a.kb);
    },
    /** Release source canvases now (uploaded ones and ones idle > idleMs, default 10 s). Returns count. */
    trim(idleMs) {
      return trim(idleMs === undefined ? 10000 : idleMs);
    },
    /**
     * Dispose a named surface texture (and its normal/roughness maps) from GPU + cache. Refused (returns false, warns
     * once) while a material in the scene still samples it — pass {force:true} to dispose anyway; a forced texture
     * that is drawn again is re-uploaded by three and counted again in stats().gpuMB.
     */
    dispose(name, opts) {
      const ts = [
        texCache.get(name) && texCache.get(name).tex,
        normCache.get(name),
        roughCache.get(name),
      ].filter(Boolean);
      if (!ts.length) return false;
      if (!(opts && opts.force) && G.scene) {
        const srcs = new Set(ts.map((t) => t.source));
        let used = null;
        const SLOTS = [
          "map",
          "normalMap",
          "roughnessMap",
          "emissiveMap",
          "alphaMap",
          "bumpMap",
          "aoMap",
          "metalnessMap",
        ];
        const chk = (m) => {
          if (used || !m) return;
          for (const k of SLOTS) {
            const t = m[k];
            if (t && srcs.has(t.source)) {
              used = m.name || m.type;
              return;
            }
          }
        };
        try {
          G.scene.traverse((o) => {
            if (used || !o.material) return;
            if (Array.isArray(o.material)) o.material.forEach(chk);
            else chk(o.material);
          });
        } catch (e) {
          used = null;
        }
        if (used) {
          if (!warned.has("disp:" + name)) {
            warned.add("disp:" + name);
            console.warn(
              '[textures] dispose("' +
                name +
                '") refused: still used by material "' +
                used +
                '" ({force:true} to override)',
            );
          }
          return false;
        }
      }
      const kill = (t) => {
        if (!t) return;
        const rec = recBySource.get(t.source);
        if (rec && !rec.disposed) {
          rec.disposed = true;
          if (rec.uploaded) X.stats.gpuBytes -= rec.gpuBytes;
          rec.uploaded = false;
          if (!rec.trimmed) X.stats.cpuBytes -= rec.bytes;
        }
        t.dispose();
      };
      const e = texCache.get(name);
      if (e) {
        kill(e.tex);
        texCache.delete(name);
      }
      if (normCache.has(name)) {
        kill(normCache.get(name));
        normCache.delete(name);
      }
      if (roughCache.has(name)) {
        kill(roughCache.get(name));
        roughCache.delete(name);
      }
      return true;
    },
    /** Generate a list of textures now (e.g. during a loading screen). */
    prewarm(list) {
      (list || []).forEach((n) => TEX.get(n));
    },
    facadeInfo(style) {
      const s = normStyle(style);
      const d = X.GEN["facade_" + s + "_1"];
      return d && d.facade
        ? Object.assign({}, d.facade)
        : {
            tileW: 14,
            tileH: 21,
            bays: 4,
            floors: 6,
            floorH: 3.5,
            bayW: 3.5,
            top: "facade_" + s + "_top",
            base: "facade_" + s + "_base",
            trimH: 3.5,
          };
    },
    facadeStyles() {
      return ["tenement", "artdeco", "brownstone", "warehouse", "office"];
    },
    facadeCount(style) {
      const s = normStyle(style);
      let n = 0;
      while (X.GEN["facade_" + s + "_" + (n + 1)]) n++;
      return n;
    },
    /**
     * Rewrite a geometry's UVs by box projection (object space) so a texture tiles every `meters` metres.
     * Prefer this over material `repeat` clones: one shared material then serves every scale.
     * opts: {offsetU, offsetV, metersV}. Works on indexed or non-indexed geometry with normals.
     */
    applyBoxUV(geom, meters, opts) {
      opts = opts || {};
      const mu = meters || 4,
        mv = opts.metersV || mu;
      if (geom.index) geom = geom.toNonIndexed();
      if (!geom.attributes.normal) geom.computeVertexNormals();
      const p = geom.attributes.position,
        n = geom.attributes.normal;
      const uv = new Float32Array(p.count * 2);
      const ou = opts.offsetU || 0,
        ov = opts.offsetV || 0;
      for (let i = 0; i < p.count; i++) {
        const ax = Math.abs(n.getX(i)),
          ay = Math.abs(n.getY(i)),
          az = Math.abs(n.getZ(i));
        let u, v;
        if (ay >= ax && ay >= az) {
          u = p.getX(i) / mu;
          v = p.getZ(i) / mv;
        } else if (ax >= az) {
          u = (p.getZ(i) / mu) * (n.getX(i) > 0 ? -1 : 1);
          v = p.getY(i) / mv;
        } else {
          u = (p.getX(i) / mu) * (n.getZ(i) > 0 ? 1 : -1);
          v = p.getY(i) / mv;
        }
        uv[i * 2] = u + ou;
        uv[i * 2 + 1] = v + ov;
      }
      geom.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      return geom;
    },
    // Filled in by 32_ads.js / 40_signs.js when present (safe fallbacks here):
    billboard(brand, variant) {
      return X.billboardTex
        ? X.billboardTex(brand, variant || 0)
        : TEX.get("concrete");
    },
    poster(brand, variant) {
      return X.posterTex
        ? X.posterTex(brand, variant || 0)
        : TEX.get("plaster_stained");
    },
    sign(text, style, opts) {
      return X.signTex
        ? X.signTex(String(text || ""), style || "shop", opts)
        : TEX.get("metal_painted");
    },
    neon(text, color, opts) {
      return X.neonTex
        ? X.neonTex(
            String(text || ""),
            color === undefined ? 0xff3366 : color,
            opts,
          )
        : TEX.get("metal_painted");
    },
    /** Pack many signs into one texture: list of strings or {text, style, opts} → {texture, rects, byText}. */
    signAtlas(list, opts) {
      return X.signAtlas ? X.signAtlas(list, opts) : null;
    },
    /**
     * Every shop sign of the city in ONE texture, lettering always inside the board (X.text maxW / textSafe fit, board width
     * grows with the name): list = strings or {text, sub, font, bg, fg}. Fonts vary per name (didone, script, slab, deco…).
     * Returns {texture, rects:[{u0,v0,u1,v1,aspect}], byText, width, height} — map only swaps its SHOPS atlas texture + UVs.
     */
    shopSignAtlas(list, opts) {
      if (!X.signAtlas) return null;
      const FONTS = [
        "didone",
        "script",
        "slab",
        "impact",
        "deco",
        "rounded",
        "serif",
        "copper",
        "condensed",
      ];
      const items = (list || []).map((it) => {
        const o = typeof it === "string" ? { text: it } : it;
        const text = String(o.text || "");
        return {
          text,
          style: "shop",
          opts: {
            font: o.font || FONTS[X.seedOf(text) % FONTS.length],
            sub: o.sub,
            bg: o.bg,
            fg: o.fg,
          },
        };
      });
      return X.signAtlas(
        items,
        Object.assign({ cellH: 96, width: 2048 }, opts || {}),
      );
    },
    /** Uncached sign canvas (for your own atlas). */
    signCanvas(text, style, opts) {
      return X.signCanvas
        ? X.signCanvas(String(text || ""), style || "shop", opts)
        : null;
    },
    decal(name) {
      return X.decalTex ? X.decalTex(name) : null;
    },
    icon(name) {
      return X.iconTex ? X.iconTex(name) : null;
    },
    iconURL(name, color) {
      return X.iconURL ? X.iconURL(name, color) : null;
    },
    /** Canonical billboard brand ids (28, in the city's billboard order) — G.LAYOUT.BRANDS maps onto this 1:1. */
    BRANDS: (X.BRAND_ORDER || []).slice(),
    /** Extra original brands (posters, props, shop windows). */
    EXTRA_BRANDS: (X.EXTRA_BRANDS || []).slice(),
    /** Every drawable brand id, canonical billboard order first. */
    brands() {
      if (!X.BRANDS) return [];
      const o = (X.BRAND_ORDER || []).filter((id) => X.BRANDS[id]);
      return o.concat(Object.keys(X.BRANDS).filter((id) => o.indexOf(id) < 0));
    },
    brandInfo(id) {
      id = X.brandId(id);
      const b = X.BRANDS && X.BRANDS[id];
      return b
        ? {
            id,
            name: b.name,
            slogans: b.slogans.slice(),
            colors: b.colors.slice(),
          }
        : null;
    },
  };

  function normStyle(s) {
    s = String(s || "tenement").toLowerCase();
    if (s.indexOf("deco") >= 0 || s.indexOf("skyscraper") >= 0)
      return "artdeco";
    if (s.indexOf("brown") >= 0) return "brownstone";
    if (s.indexOf("ware") >= 0 || s.indexOf("indust") >= 0) return "warehouse";
    if (
      s.indexOf("office") >= 0 ||
      s.indexOf("commercial") >= 0 ||
      s.indexOf("modern") >= 0
    )
      return "office";
    return "tenement";
  }
  X.normStyle = normStyle;

  // ------------------------------------------------------------------
  // Procedural environment map (for chrome/glass/metal reflections)
  // ------------------------------------------------------------------
  let envTex = null;
  X.envMap = function () {
    if (envTex) return envTex;
    const w = 512,
      h = 256,
      cv = X.canvas(w, h),
      ctx = cv.ctx,
      r = X.rng(99);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#5d6a5c");
    g.addColorStop(0.3, "#9aa383");
    g.addColorStop(0.48, "#d8d2ae");
    g.addColorStop(0.5, "#8a8270");
    g.addColorStop(0.62, "#6a6252");
    g.addColorStop(1, "#4a4438");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // skyline silhouettes at the horizon so reflections read as "city"
    ctx.fillStyle = "rgba(40,40,36,0.85)";
    for (let x = 0; x < w;) {
      const bw = 6 + r() * 18,
        bh = 8 + r() * 42;
      ctx.fillRect(x, h * 0.5 - bh, bw, bh);
      x += bw + r() * 3;
    }
    // soft sun hotspot
    const sg = ctx.createRadialGradient(
      w * 0.3,
      h * 0.22,
      0,
      w * 0.3,
      h * 0.22,
      60,
    );
    sg.addColorStop(0, "rgba(255,248,220,0.9)");
    sg.addColorStop(1, "rgba(255,248,220,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    envTex = new THREE.CanvasTexture(cv.c);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    envTex.needsUpdate = true;
    X.stats.cpuBytes += w * h * 4;
    return envTex;
  };

  // ==================================================================
  // Night glow + flicker (clone-safe via userData.txGlow)
  // ==================================================================
  const glowList = []; // {mat, d, n, f, rate, ph}
  const seenMats = new WeakSet();
  const protoOBC = THREE.Material.prototype.onBeforeCompile;

  function hashId(s) {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;
  }

  function addGlow(mat) {
    const g = mat.userData && mat.userData.txGlow;
    if (!g) return;
    const prev = glowList.find((e) => e.mat === mat);
    if (prev) {
      prev.d = g.d;
      prev.n = g.n;
      prev.f = !!g.f;
      return;
    } // re-tracked with new values
    const u = hashId(mat.uuid);
    const e = { mat, d: g.d, n: g.n, f: !!g.f, rate: 0.55 + u, ph: u * 100 };
    glowList.push(e);
    mat.emissiveIntensity = e.d + (e.n - e.d) * curNight;
    mat.addEventListener("dispose", function onD() {
      mat.removeEventListener("dispose", onD);
      const i = glowList.indexOf(e);
      if (i >= 0) glowList.splice(i, 1);
    });
  }
  function tagGlow(mat, day, night, flicker) {
    mat.userData.txGlow = { d: day, n: night, f: flicker ? 1 : 0 };
  }

  // ==================================================================
  // World-space macro variation (anti-tiling), clone-safe via userData.txMacro
  // ==================================================================
  const MACRO_VERT = [
    "#include <project_vertex>",
    "{ vec4 txP = vec4( transformed, 1.0 );",
    "#ifdef USE_INSTANCING",
    "  txP = instanceMatrix * txP;",
    "#endif",
    "  vTxW = ( modelMatrix * txP ).xyz; }",
  ].join("\n");
  const MACRO_FRAG_PARS = [
    "varying vec3 vTxW;",
    "uniform float uTxMacro;",
    "uniform float uTxBand;",
    "uniform vec4 uTxQ;", // quality: x window-detail footprint scale, y minimum window level, z dust on/off, w relief (bump) layers on/off
    "uniform vec4 uTxWet;", // x: rain wetness 0..1 (atmosphere), y: time (s) for running water, z: falling rain (ripples)
    // (lattice wrapped at 1024 cells: fract( p * 456.21 ) loses every bit of precision once p is ~1e4, which turned the
    // fine grain of far-from-origin streets into streaks — the wrap keeps it exact and is seamless for the lattice noise)
    "float txHash( vec2 p ) { p = mod( p, 1024.0 ); p = fract( p * vec2( 123.34, 456.21 ) ); p += dot( p, p + 45.32 ); return fract( p.x * p.y ); }",
    "float txNoise( vec2 p ) { vec2 i = floor( p ); vec2 f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );",
    "  return mix( mix( txHash( i ), txHash( i + vec2( 1.0, 0.0 ) ), f.x ), mix( txHash( i + vec2( 0.0, 1.0 ) ), txHash( i + vec2( 1.0, 1.0 ) ), f.x ), f.y ); }",
    "uniform float uTxGround;", // world-anchored street damage: 1 roads (cracks, tar snakes, patches, alligator), ~0.35 pavements (cracks)
    "uniform float uTxBrick;", // world-anchored per-brick tone / zones / repointing on brick_* surfaces (breaks the 3 m repeat)
    "vec2 txH2( vec2 p ) { p = vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) ); return fract( sin( p ) * 43758.5453 ); }",
    // Voronoi border distance (cell units) + hash of the nearest cell (two-pass border distance, 3×3 neighbourhoods)
    "vec3 txVor( vec2 x ) {",
    "  vec2 n = floor( x ), f = fract( x ), mg = vec2( 0.0 ), mr = vec2( 0.0 ); float md = 8.0;",
    "  for ( int j = -1; j <= 1; j++ ) for ( int i = -1; i <= 1; i++ ) {",
    "    vec2 g = vec2( float( i ), float( j ) ); vec2 r = g + 0.05 + 0.9 * txH2( n + g ) - f; float d = dot( r, r );",
    "    if ( d < md ) { md = d; mr = r; mg = g; } }",
    "  md = 8.0;",
    "  for ( int j = -1; j <= 1; j++ ) for ( int i = -1; i <= 1; i++ ) {",
    "    vec2 g = mg + vec2( float( i ), float( j ) ); vec2 r = g + 0.05 + 0.9 * txH2( n + g ) - f;",
    "    if ( dot( mr - r, mr - r ) > 1e-5 ) md = min( md, dot( 0.5 * ( mr + r ), normalize( r - mr ) ) ); }",
    "  return vec3( md, txH2( n + mg ) ); }",
    /*
     * Street damage in world space (p = world xz in metres, fp = pixel footprint in metres, amt = uTxGround).
     * Rolled-in repair patches and utility-trench cuts (soft irregular edges, dark seam, feathered crown), ~4 m block
     * cracking in some areas only (meandering, broken runs, dust along the lips), long tar-sealed "snakes", and alligator
     * fatigue cracking in wheel-path blotches. Line widths are box-filtered against the pixel footprint (sub-pixel cracks
     * fade by coverage instead of shimmering) and the fine layers are skipped when they would be < 1 px.
     */
    "vec3 txGround( vec3 col, vec2 p, float fp, float amt, out vec4 pho ) {",
    "  pho = vec4( 0.0 );",
    "  float pat = step( 0.9, amt );",
    "  vec2 wp = p + ( vec2( txNoise( p * 0.31 ), txNoise( p * 0.31 + 7.3 ) ) - 0.5 ) * 1.8 + ( vec2( txNoise( p * 1.9 + 3.1 ), txNoise( p * 1.9 + 9.7 ) ) - 0.5 ) * 0.25;",
    "  float inP = 0.0;",
    "  if ( pat > 0.5 ) {",
    // broad stains: oil / soot / water marks (dark) and wind-blown dust drifts (light), 3–10 m, world-anchored
    "    col *= 1.0 - 0.2 * smoothstep( 0.62, 0.85, txNoise( p * 0.21 + 31.0 ) * 0.7 + txNoise( p * 0.9 ) * 0.3 );",
    "    col = mix( col, vec3( 0.2, 0.18, 0.15 ), 0.35 * smoothstep( 0.6, 0.85, txNoise( p * 0.11 + 5.0 ) * 0.75 + txNoise( p * 0.7 + 2.0 ) * 0.25 ) );",
    "    vec2 pc = floor( p / 7.5 ); vec2 ph = txH2( pc + 17.0 ), ph2 = txH2( pc + 41.0 );",
    "    if ( ph.x > 0.86 ) {", // pothole: broken-out depression, dark wet grit inside, crumbled light rim
    "      vec2 c = ( pc + 0.25 + 0.5 * ph2 ) * 7.5; float rr = 0.3 + 0.45 * ph.y;",
    "      float sd = length( ( p - c ) * vec2( 1.0, 0.8 + 0.4 * ph2.x ) ) - rr + ( txNoise( p * 4.0 + ph * 7.0 ) - 0.5 ) * 0.35 * rr + ( txNoise( p * 17.0 ) - 0.5 ) * 0.06;",
    "      float ins = 1.0 - smoothstep( -0.01 - fp, 0.01 + fp, sd );",
    "      vec3 pin = mix( vec3( 0.075, 0.07, 0.062 ) * ( 0.6 + 0.8 * txNoise( p * 31.0 ) ), vec3( 0.02, 0.019, 0.017 ), smoothstep( -0.04, -0.25 * rr, sd ) );", // broken aggregate at the rim, dark wet grit in the bowl
    "      col = mix( col, pin * ( 0.75 + 0.5 * txNoise( p * 13.0 + 3.0 ) ), ins * 0.92 );",
    "      col *= 1.0 + 0.35 * smoothstep( 0.0, 0.02, sd ) * ( 1.0 - smoothstep( 0.02, 0.12, sd ) ) * step( 0.45, txNoise( p * 13.0 ) );",
    "      inP = ins;",
    "      pho = vec4( ins, clamp( -sd / rr, 0.0, 1.0 ), fract( ph.y * 13.7 + ph2.x * 3.1 ), 1.0 );",
    "    }",
    "    if ( ph.x < 0.4 ) {",
    "      vec2 c = ( pc + 0.3 + 0.4 * ph2 ) * 7.5;",
    "      vec2 hs = ph.y < 0.35 ? vec2( 0.35 + 0.3 * ph2.x, 2.2 + 2.0 * ph2.y ) : vec2( 0.7 + 1.5 * ph2.y, 0.55 + 1.2 * ph2.x );", // trench cut / pothole patch (half sizes)
    "      if ( fract( ph2.x * 7.1 ) > 0.5 ) hs = hs.yx;",
    "      vec2 q = abs( p - c ) - hs + 0.3;",
    "      float sd = length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 ) - 0.3;",
    "      sd += ( txNoise( p * 2.3 + ph * 9.0 ) - 0.5 ) * 0.2 + ( txNoise( p * 11.0 ) - 0.5 ) * 0.05;",
    "      inP = 1.0 - smoothstep( -0.015 - fp, 0.015 + fp, sd );",
    "      float fresh = ph.x < 0.17 ? 0.68 : 1.13;", // newer black tar vs. older, dusty grey patch
    "      col *= mix( 1.0, fresh * ( 0.92 + 0.16 * txNoise( p * 3.7 ) ), inP );",
    "      col *= 1.0 - 0.45 * ( 1.0 - smoothstep( 0.0, 0.03 + fp, abs( sd ) ) ) * ( 1.0 - smoothstep( 0.06, 0.25, fp ) );", // rolled seam
    "      col *= 1.0 + 0.07 * smoothstep( 0.0, 0.06, sd ) * ( 1.0 - smoothstep( 0.1, 0.35, sd ) );", // feathered crown outside
    "    }",
    "  } else {",
    // pavements / concrete: decades of city dirt — a patchy grime coat (2–10 m), dark water / oil blooms with a faint
    // tide line, pale wind-blown dust drifts, soot-grey zones; world-anchored so the 1.5 m slab grid never repeats
    "    float gz = txNoise( p * 0.16 + 51.0 ) * 0.6 + txNoise( p * 0.62 + 9.0 ) * 0.3 + txNoise( p * 2.3 ) * 0.1;",
    "    col = mix( col, col * vec3( 0.6, 0.56, 0.5 ), smoothstep( 0.38, 0.78, gz ) * 0.85 );",
    "    float sb = txNoise( p * 0.42 + 77.0 ) * 0.7 + txNoise( p * 1.9 + 4.0 ) * 0.3;",
    "    col *= 1.0 - 0.32 * smoothstep( 0.68, 0.8, sb ) - 0.1 * ( 1.0 - smoothstep( 0.0, 0.012, abs( sb - 0.665 ) ) ) * ( 1.0 - smoothstep( 0.02, 0.05, fp ) );", // dried-puddle tide line
    "    col = mix( col, vec3( 0.34, 0.31, 0.27 ) * ( 0.9 + 0.2 * txNoise( p * 7.0 ) ), 0.32 * smoothstep( 0.62, 0.86, txNoise( p * 0.3 + 19.0 ) * 0.8 + txNoise( p * 3.1 ) * 0.2 ) );",
    "  }",
    // dead leaves & scraps of paper blown into drifts (roads' gutters and pavements alike): a brown tint zone at any
    // distance, individual leaves (rotated, veined ellipses) only where they are a few pixels big
    "  float lz = smoothstep( 0.56, 0.82, txNoise( p * 0.21 + 61.0 ) * 0.75 + txNoise( p * 0.9 + 3.0 ) * 0.25 );",
    "  if ( lz > 0.01 ) {",
    "    col = mix( col, vec3( 0.19, 0.13, 0.07 ), lz * 0.22 );",
    "    if ( fp < 0.025 ) {",
    "      vec2 lc = p * 4.5; vec2 li = floor( lc ); vec2 lh = txH2( li + 3.7 ); vec2 lf = fract( lc ) - 0.3 - 0.4 * lh;",
    "      float la = lh.x * 6.2832; vec2 lq = mat2( cos( la ), -sin( la ), sin( la ), cos( la ) ) * lf;",
    "      float ld = length( lq * vec2( 1.0, 2.1 ) ) - 0.1 - 0.07 * lh.y;",
    "      float lv = ( 1.0 - smoothstep( -0.012, 0.012 + fp * 4.5, ld ) ) * step( 1.0 - lz * 0.85, txHash( li * 0.371 + 1.3 ) ) * ( 1.0 - smoothstep( 0.012, 0.025, fp ) );",
    "      float pap = step( 0.93, fract( lh.y * 17.0 ) );", // a few paper scraps among the leaves
    "      vec3 lcol = pap > 0.5 ? vec3( 0.5, 0.47, 0.4 ) : mix( vec3( 0.2, 0.11, 0.045 ), vec3( 0.38, 0.26, 0.1 ), fract( lh.y * 5.3 ) );",
    "      lcol *= ( 0.72 + 0.28 * smoothstep( 0.0, 0.05, -ld ) ) * ( 0.88 + 0.16 * step( 0.012, abs( lq.y ) ) * ( 1.0 - pap ) );", // curled darker edges, mid-rib
    "      col = mix( col, lcol, lv );",
    "    }",
    "  }",
    "  if ( fp > 0.3 ) return col;",
    "  float nf = 1.0 - smoothstep( 0.08, 0.3, fp );",
    "  float act = smoothstep( 0.36, 0.55, txNoise( p * 0.043 + 3.0 ) * 0.7 + txNoise( p * 0.17 ) * 0.3 ) * min( amt * 1.4, 1.0 );",
    "  float seal = smoothstep( 0.56, 0.7, txNoise( p * 0.023 + 11.0 ) ) * pat;",
    "  if ( act + seal > 0.01 ) {",
    "    vec3 v = txVor( wp * 0.24 ); float e = v.x / 0.24;", // metres to the nearest crack line
    "    float seg = smoothstep( 0.32, 0.5, txNoise( wp * 0.6 + v.yz * 37.0 ) );", // broken runs, not a closed lattice
    "    float wdt = mix( 0.004, 0.022, v.y * v.y ) * ( 0.5 + 0.5 * seg );",
    "    float ww = max( wdt, fp * 0.7 );",
    "    float cov = ( 1.0 - smoothstep( ww * 0.5, ww * 0.5 + fp * 0.7, e ) ) * ( wdt / ww ) * seg * act * ( 1.0 - inP );",
    "    float sbw = 0.035 + 0.035 * v.z;",
    "    float sb = ( 1.0 - smoothstep( sbw - fp * 0.7, sbw + fp * 0.7, e + ( txNoise( wp * 6.0 ) - 0.5 ) * 0.025 ) ) * seal * ( 1.0 - inP ) * step( 0.25, v.z );",
    "    col = mix( col, vec3( 0.026, 0.025, 0.024 ), sb * 0.7 );",
    "    col *= 1.0 - 0.22 * ( 1.0 - smoothstep( 0.0, 0.1 + fp, e ) ) * act * seg * ( 1.0 - sb );", // grime collects along the lips
    "    col = mix( col, vec3( 0.018, 0.017, 0.015 ), cov * 0.9 * nf * ( 1.0 - sb ) );",
    "    col = mix( col, vec3( 0.085, 0.09, 0.04 ) * ( 0.7 + 0.6 * txNoise( wp * 40.0 ) ), ( 1.0 - pat ) * 0.6 * ( 1.0 - smoothstep( 0.0, 0.035 + fp, e ) ) * act * seg * smoothstep( 0.5, 0.68, txNoise( wp * 2.5 + 8.0 ) ) );", // moss / dead weeds in pavement cracks
    "  }",
    "  float fat = smoothstep( 0.66, 0.8, txNoise( p * 0.09 + 23.0 ) ) * pat * ( 1.0 - inP );",
    "  if ( fat > 0.01 && fp < 0.08 ) {",
    "    vec3 v2 = txVor( wp * 3.0 ); float e2 = v2.x / 3.0;",
    "    float wd2 = 0.003 + 0.003 * fat, ww2 = max( wd2, fp * 0.7 );",
    "    float c2 = ( 1.0 - smoothstep( ww2 * 0.5, ww2 * 0.5 + fp * 0.7, e2 ) ) * ( wd2 / ww2 ) * fat * ( 1.0 - smoothstep( 0.03, 0.08, fp ) );",
    "    col *= 1.0 + ( v2.y - 0.5 ) * 0.14 * fat;", // loose, slightly tilted chunks
    "    col = mix( col, vec3( 0.018 ), c2 * 0.85 );",
    "  }",
    "  return col; }",
    "float txWR( vec2 p, vec2 c, vec2 h, float aa ) { vec2 d = abs( p - c ) - h; return 1.0 - smoothstep( -aa, aa, max( d.x, d.y ) ); }",
    /*
     * Reflected environment seen in façade glass (world direction r, window position p, edge softness soft):
     * the atmosphere's live sky (horizon→zenith gradient, sun-side glow, sun halo + glint) above the skyline,
     * a far city skyline (~320 m, hazy) and the near street canyon (the opposite façades ~25–45 m away, with
     * their window rows and, at night, a few lit rooms) below it, the dark street under the horizon.
     * Skylines are keyed on the reflection azimuth and the ~90 m block the window sits in, so they stay put in
     * the world while the camera moves; low windows reflect the opposite buildings, high ones the open sky.
     */
    "uniform vec3 uTxSkyZ, uTxSkyH, uTxSunC;",
    "uniform float uTxSkyK;",
    "uniform vec4 uTxSkyG, uTxSunD;", // G: sun-side glow rgb + night factor; SunD: sun direction + visible size
    "vec3 txSkyRefl( vec3 r, vec3 p, float soft, float det ) {",
    "  float hz = max( length( r.xz ), 1e-3 ); float el = r.y / hz;",
    "  float az = atan( r.z, r.x ) * 0.15915 + 0.5;",
    "  vec2 bq = floor( p.xz / 90.0 );",
    "  float hp = max( r.y, 0.0 );",
    "  vec3 sky = mix( uTxSkyH, uTxSkyZ, pow( smoothstep( 0.0, 1.0, hp ), 0.5 ) );",
    "  vec2 sh = normalize( uTxSunD.xz + 1e-5 );",
    "  sky = mix( sky, uTxSkyG.rgb, pow( max( dot( r.xz / hz, sh ), 0.0 ), 3.0 ) * exp( -hp * 4.0 ) * 0.5 * min( uTxSunD.w, 1.0 ) );",
    "  float sd = max( dot( r, uTxSunD.xyz ), 0.0 );",
    "  sky += uTxSunC * ( pow( sd, 5.0 ) * 0.07 + pow( sd, 40.0 ) * 0.25 + pow( sd, 350.0 ) * 2.5 * det ) * uTxSunD.w;",
    // far skyline: ~24 towers per turn at ~320 m, 30–200 m tall, washed out by the haze
    "  float fa = az * 24.0 + txHash( bq * 0.37 + 0.5 ) * 24.0; float fi = floor( fa );",
    "  float fh = 30.0 + 170.0 * pow( txHash( vec2( fi * 0.173, bq.x * 0.31 + bq.y * 0.77 ) ), 2.0 );",
    "  float fB = 1.0 - smoothstep( -soft, soft, el - ( fh - p.y ) / 320.0 );",
    "  vec3 c = mix( sky, uTxSkyH * ( 0.58 + 0.08 * txHash( vec2( fi, 5.0 ) ) ), fB );",
    // the street far below (high windows looking down)
    "  c = mix( c, uTxSkyH * 0.2, smoothstep( -0.25, -0.6, el ) );",
    // near street canyon: ~10 frontages per turn, 25–45 m across the street, 12–72 m tall
    "  float na = az * 10.0 + txHash( bq * 0.71 + 3.0 ) * 10.0; float ni = floor( na );",
    "  float nh = 12.0 + 60.0 * pow( txHash( vec2( ni * 0.37, bq.y * 0.53 + bq.x * 0.19 + 1.0 ) ), 1.5 );",
    "  float nd = 25.0 + 20.0 * txHash( vec2( ni * 0.61, 7.0 ) );",
    "  float nB = 1.0 - smoothstep( -soft, soft, el - ( nh - p.y ) / nd );",
    "  vec2 wu = vec2( fract( na ) * 7.0, ( p.y + el * nd ) / 3.5 ); vec2 wi = floor( wu ); vec2 wf = fract( wu );",
    "  float wm = txWR( wf, vec2( 0.5, 0.55 ), vec2( 0.26, 0.24 ), 0.08 ) * det;",
    "  vec3 nc = uTxSkyH * ( 0.26 + 0.12 * txHash( vec2( ni, 3.0 ) ) ) * ( 1.0 - 0.45 * wm );",
    "  nc += vec3( 1.0, 0.6, 0.28 ) * 0.35 * uTxSkyG.w * wm * step( 0.9, txHash( wi * 0.37 + ni * 1.31 + bq ) );",
    "  return mix( c, nc, nB * step( -0.9, el ) ); }",
    // ---- value noise with analytic gradient (no derivative taps → safe inside non-uniform branches). The lattice is
    // periodic (509 cells), so high frequencies far from the origin keep their precision and never seam.
    "float txHq( vec2 i ) { i = mod( i, 509.0 ); return txHash( i * 0.0731 + 0.37 ); }",
    "vec3 txNoiseD( vec2 p ) { vec2 i = floor( p ); vec2 f = p - i;",
    "  vec2 u = f * f * ( 3.0 - 2.0 * f ); vec2 du = 6.0 * f * ( 1.0 - f );",
    "  float a = txHq( i ), b = txHq( i + vec2( 1.0, 0.0 ) ), c = txHq( i + vec2( 0.0, 1.0 ) ), d = txHq( i + vec2( 1.0, 1.0 ) );",
    "  float k = a - b - c + d;",
    "  return vec3( a + ( b - a ) * u.x + ( c - a ) * u.y + k * u.x * u.y, du * ( vec2( b - a, c - a ) + k * u.yx ) ); }",
    /*
     * Close-range surface detail (uTxDetail: 1 mineral — concrete, stone, plaster, kerbs; 2 metal — painted, bare, rusty,
     * corrugated). q: planar world coordinates (m, projected on the dominant axis), fp: pixel footprint (m), wet 0..1.
     * Returns xy = height gradient per metre (for the normal), z = albedo multiplier, w = roughness offset.
     * Mineral: 10 cm undulation, 2–3 cm aggregate, pinhole pores (dark, rough). Metal: oil-canning dents, grease / wear
     * smudges (roughness breakup — the specular highlight no longer slides over a perfect plane), fine directional
     * scratches that catch the light (bare metal: brighter, glossier) and corrosion pits. Every layer fades out before
     * it would be smaller than ~3 px, so nothing shimmers.
     */
    "uniform float uTxDetail;",
    "vec4 txDetailF( vec2 q, float fp, float kind ) {",
    "  vec2 g = vec2( 0.0 ); float al = 1.0, ro = 0.0;",
    "  if ( kind < 1.5 ) {",
    "    float f0 = 1.0 - smoothstep( 0.02, 0.06, fp ), f1 = 1.0 - smoothstep( 0.005, 0.016, fp ), f2 = 1.0 - smoothstep( 0.0018, 0.005, fp );",
    "    vec3 a = txNoiseD( q * 2.3 + 11.0 ); ro += ( a.x - 0.5 ) * 0.14 * f0; al *= 1.0 + ( a.x - 0.5 ) * 0.07 * f0;",
    "    if ( f1 > 0.0 ) { vec3 b = txNoiseD( q * 9.0 ); g += b.yz * 9.0 * 0.0075 * f1; ro += ( b.x - 0.5 ) * 0.08 * f1; }",
    "    if ( f2 > 0.0 ) {",
    "      vec3 c = txNoiseD( q * 34.0 + 3.7 ); g += c.yz * 34.0 * 0.0016 * f2; al *= 1.0 + ( c.x - 0.5 ) * 0.1 * f2;",
    "      vec3 e = txNoiseD( q * 71.0 + 9.1 ); float t = clamp( ( e.x - 0.8 ) / 0.1, 0.0, 1.0 );",
    "      float pit = t * t * ( 3.0 - 2.0 * t ); g -= e.yz * 71.0 * 6.0 * t * ( 1.0 - t ) / 0.1 * 0.0005 * f2;",
    "      al *= 1.0 - 0.45 * pit * f2; ro += 0.12 * pit * f2;",
    "    }",
    "  } else {",
    "    float f0 = 1.0 - smoothstep( 0.03, 0.1, fp ), f1 = 1.0 - smoothstep( 0.006, 0.02, fp ), f2 = 1.0 - smoothstep( 0.0015, 0.0045, fp );",
    "    vec3 dn = txNoiseD( q * 1.1 + 5.0 ); vec3 dn2 = txNoiseD( q * 3.7 + 1.0 );",
    "    g += ( dn.yz * 1.1 * 0.02 + dn2.yz * 3.7 * 0.0035 ) * f0;", // oil-canning dents
    "    float sm = txNoise( q * 2.6 + 17.0 ) * 0.65 + txNoise( q * 9.0 + 3.0 ) * 0.35;",
    "    ro += ( sm - 0.5 ) * 0.34 * f0; al *= 1.0 - 0.1 * smoothstep( 0.62, 0.85, sm ) * f0;", // grease / hand wear
    "    if ( f2 > 0.0 ) {",
    "      vec2 cq = floor( q * 1.4 ); float an = txHash( cq * 0.37 + 0.11 ) * 3.1416;", // scratch direction per ~70 cm patch
    "      vec2 dr = vec2( cos( an ), sin( an ) ); vec2 sq = vec2( dot( q, dr ), dot( q, vec2( -dr.y, dr.x ) ) );",
    "      float sc = txNoise( vec2( sq.x * 1.7, sq.y * 160.0 ) ) * txNoise( vec2( sq.x * 0.6 + 7.0, sq.y * 3.0 ) );",
    "      float scr = smoothstep( 0.42, 0.62, sc ) * f2;",
    "      al *= 1.0 + 0.35 * scr; ro -= 0.3 * scr;",
    "    }",
    "    if ( f1 > 0.0 ) {",
    "      vec3 e = txNoiseD( q * 45.0 + 2.2 ); float t = clamp( ( e.x - 0.84 ) / 0.1, 0.0, 1.0 );",
    "      g -= e.yz * 45.0 * 6.0 * t * ( 1.0 - t ) / 0.1 * 0.0003 * f1;",
    "      float pit = t * t * ( 3.0 - 2.0 * t ) * f1 * smoothstep( 0.45, 0.7, sm ); al *= 1.0 - 0.16 * pit; ro += 0.15 * pit;",
    "    }",
    "  }",
    "  return vec4( g, al, ro ); }",
    /*
     * Standing water (roads and pavements, world-anchored): about half of the potholes hold murky water in dry weather,
     * all of them brim-full in the rain; shallow sags in the carriageway keep stagnant puddles (~2 % of the road dry,
     * ~10 % soaked). ph = pothole info from txGround (inside, depth 0 rim..1 bowl, hash). Returns the water coverage;
     * ring = the silt tide line left by evaporation (dry) / the dark soaked margin (wet).
     */
    "float txPuddle( vec2 p, float fp, float amt, vec4 ph, float wet, out float ring ) {",
    "  float w = 0.0;",
    "  if ( ph.x > 0.001 ) {",
    "    float lvl = mix( 0.42, -0.02, wet );",
    "    w = ph.x * smoothstep( lvl, lvl + 0.05 + fp * 3.0, ph.y ) * step( ph.z, 0.55 + 0.45 * wet );",
    "  }",
    "  float n = txNoise( p * 0.23 + 91.0 ) * 0.6 + txNoise( p * 0.83 + 5.0 ) * 0.28 + txNoise( p * 3.1 + 2.0 ) * 0.09 + txNoise( p * 11.0 ) * 0.03;",
    "  float th = mix( 0.76, 0.68, wet ) + ( 1.0 - min( amt, 1.0 ) ) * 0.06;",
    "  float aa = 0.003 + fp * 0.5;",
    "  w = max( w, smoothstep( th - aa, th + aa, n ) );",
    "  ring = ( 1.0 - smoothstep( 0.0, 0.035 + aa, th - n ) ) * step( n, th ) * ( 1.0 - w );",
    "  return w; }",
  ].join("\n");
  // Applied right after the albedo map: broad blotchy value variation (8–30 m), vertical rain-wash
  // bands, warm sun-bleach vs. cool soot tint, and (walls only) a dark street-level grime band.
  const MACRO_FRAG = [
    "#include <map_fragment>",
    "{ vec2 txQ = vec2( vTxW.x + vTxW.y * 0.61, vTxW.z - vTxW.y * 0.37 );",
    "  float txA = txNoise( txQ * 0.041 ) * 0.62 + txNoise( txQ * 0.13 + 17.0 ) * 0.38;",
    "  float txB = txNoise( vec2( ( vTxW.x + vTxW.z ) * 0.085, vTxW.y * 0.021 ) );",
    "  float txK = mix( 1.0, ( 0.8 + 0.38 * txA ) * ( 0.9 + 0.13 * txB ), uTxMacro );",
    "  vec3 txTint = mix( vec3( 1.0 ), mix( vec3( 0.95, 0.98, 1.03 ), vec3( 1.05, 0.99, 0.9 ), smoothstep( 0.3, 0.8, txA ) ), uTxMacro );",
    "  float txG = mix( 1.0, mix( 0.84, 1.0, smoothstep( 0.3, 5.0, vTxW.y ) ), uTxBand );",
    // walls only (geometric normal from world-position derivatives): long vertical rain-wash / soot runs, 0.5–2 m wide,
    // world-anchored so they never repeat with the texture tile — breaks up big blank party walls and tiled façades
    "  vec3 txNw = cross( dFdx( vTxW ), dFdy( vTxW ) ); txNw *= inversesqrt( max( dot( txNw, txNw ), 1e-12 ) );",
    "  float txVert = 1.0 - smoothstep( 0.2, 0.5, abs( txNw.y ) );",
    "  float txAl = abs( txNw.x ) > abs( txNw.z ) ? vTxW.z : vTxW.x;",
    "  float txRun = smoothstep( 0.5, 0.92, txNoise( vec2( txAl * 0.55, vTxW.y * 0.04 ) ) * 0.6 + txNoise( vec2( txAl * 1.9 + 3.1, vTxW.y * 0.09 ) ) * 0.4 );",
    "  float txWash = smoothstep( 0.62, 0.95, txNoise( vec2( txAl * 0.8 + 11.0, vTxW.y * 0.03 ) ) );",
    "  float txWall = txVert * uTxMacro;",
    "  vec2 txGp = vTxW.xz; float txFp = max( max( length( dFdx( txGp ) ), length( dFdy( txGp ) ) ), 1e-4 );",
    "  float txFp3 = max( max( length( dFdx( vTxW ) ), length( dFdy( vTxW ) ) ), 1e-4 );", // pixel footprint (m) on any face
    "  if ( uTxGround > 0.0 ) { float txFlat = smoothstep( 0.8, 0.95, abs( txNw.y ) ); vec4 txPh = vec4( 0.0 );",
    "    if ( txFlat > 0.0 ) {",
    "      diffuseColor.rgb = mix( diffuseColor.rgb, txGround( diffuseColor.rgb, txGp, txFp, uTxGround, txPh ), txFlat );",
    // standing water (see txPuddle): murky water over the silt, a live sky / street-canyon reflection with Fresnel, a flat
    // mirror normal with a breeze on it (and rain rings while it rains), a silt tide line round the dry-weather puddles
    "      if ( vTxW.x < 2400.0 && txNw.y > 0.0 ) {",
    "        float txRing = 0.0, txWt = uTxWet.x;",
    "        txPudW = txPuddle( txGp, txFp, uTxGround, txPh, txWt, txRing ) * txFlat;",
    "        diffuseColor.rgb = mix( diffuseColor.rgb, mix( diffuseColor.rgb * 1.1 + vec3( 0.03, 0.028, 0.022 ), diffuseColor.rgb * 0.6, txWt ), txRing * txFlat * 0.75 );",
    "        if ( txPudW > 0.001 ) {",
    "          vec3 txV = normalize( vTxW - cameraPosition );",
    "          vec2 txRip = vec2( 0.0 );",
    "          if ( txFp < 0.06 ) {",
    "            vec3 txWa = txNoiseD( txGp * 3.0 + vec2( uTxWet.y * 0.23, uTxWet.y * 0.17 ) ), txWb = txNoiseD( txGp * 7.0 - vec2( uTxWet.y * 0.31, -uTxWet.y * 0.2 ) );",
    "            txRip = ( txWa.yz * 3.0 * 0.0035 + txWb.yz * 7.0 * 0.0012 ) * ( 1.0 - smoothstep( 0.02, 0.06, txFp ) );",
    "            if ( uTxWet.z > 0.01 && txFp < 0.03 ) {",
    "              vec2 txRq = txGp * 2.6; vec2 txRi = floor( txRq ); vec2 txRf = fract( txRq ) - 0.5; float txRh = txHash( txRi * 0.713 + 0.2 );",
    "              vec2 txDv = txRf - ( vec2( txHash( txRi + 3.1 ), txHash( txRi + 5.7 ) ) - 0.5 ) * 0.36;",
    "              float txRph = fract( uTxWet.y * ( 0.9 + 0.5 * txRh ) + txRh * 7.0 ); float txRd = length( txDv ), txRx = ( txRd - txRph * 0.42 ) * 30.0;",
    "              txRip += txDv / max( txRd, 1e-3 ) * sin( txRx * 3.0 ) * exp( -txRx * txRx * 0.5 ) * ( 1.0 - txRph ) * step( txRh, 0.3 + 0.7 * uTxWet.z ) * 0.3 * ( 1.0 - smoothstep( 0.012, 0.03, txFp ) );",
    "            }",
    "          }",
    "          txPudN = normalize( vec3( -txRip.x, 1.0, -txRip.y ) );",
    "          float txCo = clamp( -dot( txV, txPudN ), 0.0, 1.0 );",
    "          float txFr = 0.02 + 0.98 * pow( 1.0 - txCo, 5.0 );",
    "          vec3 txRr = reflect( txV, txPudN ); txRr.y = abs( txRr.y );",
    "          vec3 txBot = diffuseColor.rgb * mix( 0.62, 0.3, txPudW ) * vec3( 0.86, 0.9, 0.78 );",
    "          diffuseColor.rgb = mix( diffuseColor.rgb, txBot * ( 1.0 - txFr ), txPudW );",
    "          txPudRad = txSkyRefl( txRr, vTxW, 0.006 + txFp * 0.4, 1.0 - smoothstep( 0.02, 0.1, txFp ) ) * txFr * uTxSkyK * txPudW;",
    "        }",
    "      }",
    "    }",
    "  }",
    // brick_* surfaces: the texture's 12 × 36 brick grid per tile, indexed with the continuous UV so every brick on a wall
    // has its own id: per-brick tone, soft 5–20-brick zones, rare replacement bricks and repointed patches (lighter mortar)
    "  if ( uTxBrick > 0.0 ) {",
    "    float txRq = -vMapUv.y * 36.0; float txRw = floor( txRq ); float txHd = step( 4.5, mod( txRw, 6.0 ) );",
    "    float txQx = vMapUv.x * mix( 12.0, 24.0, txHd ) + 0.5 * mod( txRw, 2.0 ) * ( 1.0 - txHd );",
    "    vec2 txBid = vec2( floor( txQx ), txRw ); vec2 txBf = vec2( fract( txQx ), fract( txRq ) );",
    "    vec2 txBm = min( txBf, 1.0 - txBf ) * vec2( mix( 3.0, 1.5, txHd ), 1.0 );", // distance to the joints in course heights
    "    float txBfw = max( fwidth( txRq ), 1e-4 );", // courses per pixel
    "    float txFace = smoothstep( 0.08, 0.08 + txBfw, min( txBm.x, txBm.y ) );",
    "    float txBf2 = uTxBrick * ( 1.0 - smoothstep( 0.35, 0.8, txBfw ) );",
    "    float txBh = txHash( txBid * 0.1371 + 0.53 );",
    "    float txBz = txNoise( txBid * vec2( 0.2, 0.09 ) + 5.1 ) * 0.6 + txNoise( txBid * vec2( 0.06, 0.025 ) + 1.7 ) * 0.4;",
    "    float txRp = smoothstep( 0.7, 0.78, txNoise( txBid * vec2( 0.08, 0.035 ) + 13.0 ) );",
    "    float txBk = mix( 1.0 + 0.3 * txRp, 1.0 + ( txBh - 0.5 ) * 0.06 + ( txBz - 0.5 ) * 0.3 - 0.14 * step( 0.992, txBh ), txFace );",
    "    diffuseColor.rgb *= mix( 1.0, txBk, txBf2 );",
    // damage clusters: 10–25 % of the units missing (dark backing wythe, occluded towards the edges, real bump), ~30 % spalled
    "    float txDz = smoothstep( 0.77, 0.83, txNoise( txBid * vec2( 0.11, 0.045 ) + 71.0 ) ) * txVert * txBf2;",
    "    float txMs = txDz * step( txBh, 0.1 + 0.15 * txDz * txDz ), txSp = txDz * step( 0.3, txBh ) * step( txBh, 0.6 );",
    "    float txIn = smoothstep( 0.0, 0.3, min( txBm.x, txBm.y ) );",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 1.2, 1.08, 0.98 ) + 0.012, txSp * txFace * 0.75 );",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * ( 0.16 + 0.22 * txIn ), txMs );",
    "    float txHt = -( txMs * ( 0.06 + 0.04 * txIn ) + txSp * txFace * 0.012 );",
    "    txBDH = vec2( dFdx( txHt ), dFdy( txHt ) );",
    // rising damp at the foot of the wall: darker below a wavy tide line with a white salt fringe (world height; streets ≈ y 0)
    "    float txDh = 0.8 + 0.8 * txNoise( vec2( txAl * 0.3, 3.1 ) ) + 0.15 * txNoise( vec2( txAl * 2.7, 8.3 ) );",
    "    float txDmp = ( 1.0 - smoothstep( txDh - 0.35, txDh, vTxW.y ) ) * txVert * uTxBrick;",
    "    float txSl = ( 1.0 - smoothstep( 0.0, 0.1, abs( vTxW.y - txDh + 0.03 ) ) ) * smoothstep( 0.35, 0.7, txNoise( vec2( txAl * 5.0, vTxW.y * 11.0 ) ) ) * txVert * uTxBrick;",
    "    diffuseColor.rgb *= 1.0 - 0.25 * txDmp;",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.6, 0.58, 0.54 ), 0.4 * txSl );",
    // efflorescence blooms where water runs down the wall (world-anchored, patchy), strongest in the joints
    "    float txEf = smoothstep( 0.72, 0.9, txNoise( vec2( txAl * 0.7 + 41.0, vTxW.y * 0.18 ) ) * 0.75 + txNoise( vec2( txAl * 3.0, vTxW.y * 1.1 ) ) * 0.25 ) * txVert * uTxBrick;",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.62, 0.6, 0.56 ), txEf * mix( 0.45, 0.15, txFace ) );",
    "  }",
    // close-range relief / roughness detail on concrete, stone and metal (see txDetailF), projected on the dominant axis
    "  if ( uTxDetail > 0.0 && txFp3 < 0.1 ) {",
    "    vec3 txAn = abs( txNw ); bool txTop = txAn.y > max( txAn.x, txAn.z ); bool txXf = txAn.x > txAn.z;",
    "    vec2 txDq = txTop ? vTxW.xz : txXf ? vTxW.zy : vTxW.xy;",
    "    vec4 txDt = txDetailF( txDq, txFp3, uTxDetail );",
    "    float txDk = 1.0 - txPudW;",
    "    diffuseColor.rgb *= mix( 1.0, txDt.z, txDk ); txDetR = txDt.w * txDk;",
    "    vec3 txE1 = txTop || !txXf ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 0.0, 1.0 ), txE2 = txTop ? vec3( 0.0, 0.0, 1.0 ) : vec3( 0.0, 1.0, 0.0 );",
    "    txDetG = ( txDt.x * txE1 + txDt.y * txE2 ) * uTxQ.w * txDk;",
    "  }",
    // splash-back at the foot of every outdoor wall: a muddy, darker zone under a wavy tide line (0.25–1 m, where rain
    // splashes street dirt up the wall), fine splatter above it and a dark soil line where wall meets pavement
    "  float txSfw = fwidth( vTxW.y );",
    "  if ( txWall > 0.0 && vTxW.y < 1.5 && vTxW.x < 2400.0 ) {",
    "    float txSh = 0.3 + 0.5 * txNoise( vec2( txAl * 0.45, 5.3 ) ) + 0.15 * txNoise( vec2( txAl * 3.1, 1.7 ) );",
    "    float txSz = ( 1.0 - smoothstep( txSh - 0.25, txSh + 0.04, vTxW.y ) ) * txWall;",
    "    float txSk = step( 0.78, txNoise( vec2( txAl, vTxW.y ) * 31.0 ) ) * ( 1.0 - smoothstep( 0.0, 0.45, vTxW.y - txSh ) ) * step( 0.0, vTxW.y - txSh ) * ( 1.0 - smoothstep( 0.01, 0.03, txSfw ) ) * txWall;",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 0.7, 0.64, 0.56 ), txSz * 0.75 + txSk * 0.4 );",
    "    diffuseColor.rgb *= 1.0 - 0.4 * ( 1.0 - smoothstep( 0.0, 0.14, vTxW.y ) ) * txWall;",
    "  }",
    // dust & ash settle on everything outdoors that faces up (ledges, cornices, sills, steps, roofs, tops of walls and
    // crates): pale, matte, world-anchored drifts, thicker in patches, thinner where the rain-wash runs; streets keep
    // their own ground layer, interiors (cryo halls, bunkers) stay clean. txNw is the view-facing geometric normal, so ceilings are skipped.
    "  float txUpF = smoothstep( 0.55, 0.9, txNw.y ) * ( 1.0 - step( 0.001, uTxGround ) ) * step( vTxW.x, 2400.0 ) * uTxMacro;",
    "  if ( txUpF > 0.0 && uTxQ.z > 0.5 ) {",
    "    float txDu = smoothstep( 0.3, 0.75, txNoise( txGp * 0.55 + 21.0 ) * 0.65 + txNoise( txGp * 2.9 + 4.0 ) * 0.35 );",
    "    float txDg = 1.0 - smoothstep( 0.02, 0.06, txFp );", // fine grain only where it can show
    "    vec3 txDc = vec3( 0.25, 0.215, 0.165 ) * ( 0.85 + 0.3 * mix( 0.5, txNoise( txGp * 23.0 ), txDg ) );",
    "    txDustK = txUpF * ( 0.16 + 0.4 * txDu ) * ( 1.0 - 0.5 * txWash );",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, txDc, txDustK );",
    "  }",
    // rain: water sheets down the walls along the world-anchored wash / soot runs (darker, glossy), thin rivulets that
    // run down in front of the camera (near only), and settled dust turns to dark mud. The atmosphere's wet patch
    // darkens / glosses everything uniformly; this gives the soaked façades their streaky structure.
    "  if ( uTxWet.x > 0.01 && vTxW.x < 2400.0 ) {",
    "    float txSheet = max( smoothstep( 0.1, 0.5, txWash * 0.6 + txRun * 0.6 ), smoothstep( 0.48, 0.78, txNoise( vec2( txAl * 1.3 + 7.0, vTxW.y * 0.06 ) ) * 0.7 + txNoise( vec2( txAl * 4.0, vTxW.y * 0.2 ) ) * 0.3 ) ) * txWall;",
    "    float txRiv = 0.0;",
    "    if ( txWall > 0.0 && txSfw < 0.04 ) {",
    "      float txTc = txAl * 6.0; float txTi = floor( txTc ); float txTh = txHash( vec2( txTi * 0.37, 7.7 ) );",
    "      float txTw = abs( fract( txTc ) - 0.5 - 0.3 * ( txNoise( vec2( txTi, vTxW.y * 0.8 ) ) - 0.5 ) );",
    "      float txTs = fract( vTxW.y * 0.3 + uTxWet.y * ( 0.35 + 0.6 * txTh ) + txTh * 9.0 );",
    "      txRiv = step( 0.6, txTh ) * ( 1.0 - smoothstep( 0.012, 0.035, txTw ) ) * ( 0.35 + 0.65 * smoothstep( 0.2, 0.9, txTs ) ) * ( 1.0 - smoothstep( 0.015, 0.04, txSfw ) ) * txWall;",
    "    }",
    "    txWetK = uTxWet.x * clamp( txSheet * 0.8 + txRiv + txDustK * 0.8, 0.0, 1.0 );",
    "    diffuseColor.rgb *= 1.0 - uTxWet.x * ( 0.4 * txSheet + 0.3 * txRiv );",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 0.55, 0.5, 0.45 ), uTxWet.x * txDustK * 1.4 );", // mud
    "  }",
    "  diffuseColor.rgb *= txK * txTint * txG * ( 1.0 - txWall * ( 0.3 * txRun - 0.1 * txWash ) ); }",
  ].join("\n");
  // dust is matte
  const MACRO_ROUGH = [
    "#include <roughnessmap_fragment>",
    "roughnessFactor = clamp( roughnessFactor + txDetR, 0.04, 1.0 );",
    "roughnessFactor = mix( roughnessFactor, 1.0, clamp( txDustK * 1.6, 0.0, 1.0 ) * ( 1.0 - 0.7 * uTxWet.x ) );",
    "roughnessFactor = mix( roughnessFactor, 0.22, txWetK );",
    "roughnessFactor = mix( roughnessFactor, 0.035, txPudW );", // standing water is a mirror
  ].join("\n");
  // sky / street reflection of the standing water
  const MACRO_EMIS = [
    "#include <emissivemap_fragment>",
    "totalEmissiveRadiance += txPudRad;",
  ].join("\n");
  // while it rains, the standing water also joins the atmosphere's screen-space puddle reflections (its tag, when present)
  const MACRO_OPQ = [
    "#ifdef NRC_PUDTAG",
    "if ( nrcWet.x > 0.05 ) nrcPudTag = max( nrcPudTag, txPudW * nrcWet.w );",
    "#endif",
    "#include <opaque_fragment>",
  ].join("\n");
  // Bump of the world-space brick damage (missing / spalled units), same maths as three's bump map.
  const MACRO_NORMAL = [
    "#include <normal_fragment_maps>",
    "if ( uTxBrick > 0.0 && uTxQ.w > 0.5 ) { vec3 txSx = dFdx( -vViewPosition ), txSy = dFdy( -vViewPosition );",
    "  vec3 txR1 = cross( txSy, normal ), txR2 = cross( normal, txSx ); float txFD = dot( txSx, txR1 ) * faceDirection;",
    "  if ( abs( txBDH.x ) + abs( txBDH.y ) > 1e-6 ) normal = normalize( abs( txFD ) * normal - sign( txFD ) * ( txBDH.x * txR1 + txBDH.y * txR2 ) ); }",
    // close-range detail relief (world-space height gradient → tangential tilt of the shading normal)
    "if ( dot( txDetG, txDetG ) > 1e-10 ) { vec3 txVg = mat3( viewMatrix ) * txDetG; txVg -= dot( txVg, normal ) * normal; normal = normalize( normal - txVg ); }",
    // standing water: a flat mirror (with its breeze / rain ripples) replaces the asphalt relief
    "if ( txPudW > 0.001 ) normal = normalize( mix( normal, normalize( mat3( viewMatrix ) * txPudN ), txPudW ) );",
  ].join("\n");
  // ==================================================================
  // Façade interior mapping ("fake rooms" behind every window), clone-safe via userData.txWin
  // ------------------------------------------------------------------
  // Each bay × storey cell of a façade atlas (4 × 6 per tile) is treated as a room box behind the wall.
  // The view ray is intersected with that box in the fragment shader (no geometry): back wall with faded
  // 1950s wallpaper, doorway / picture / torn plaster, plank floor with rug & debris, stained ceiling (sometimes
  // collapsed), side walls, plus two parallax furniture silhouette cards (sofa, bookcase, table + lamp, wardrobe,
  // bed, rubble, chair…). A per-window seed from the window's world position gives every window its own room
  // tint, depth, furniture and window-plane dressing (curtains, roller blinds, plywood behind the glass, rags in
  // broken frames), so repeated atlas tiles no longer repeat their interiors. The half-res window mask
  // (X.facadeMask: R see-through, G no-glass hole, B charred) decides where the room shows: clear/grimy glass keeps a
  // Fresnel share of the painted reflection and turns glossy, holes and gaps between boards are pure room.
  // Daylight: rooms are lit from the window (brighter near the glass, sun patch on the floor, corner AO) and fade to
  // black at night. Lit windows (materials that keep the emissive map, e.g. map '@lit' blocks) turn the static glow
  // into a lamp-lit room — lamp falloff, glowing shade, backlit furniture — still driven by the txGlow night driver.
  // Everything is derived from view-space derivatives (precise near the camera); cells smaller than ~6 px fade to
  // a flat dim interior so distant façades never shimmer.
  const WIN_FRAG_PARS = [
    "uniform sampler2D uTxWinMask;",
    "uniform vec4 uTxWinRect;",
    "uniform float uTxWinLvl;",
    "uniform vec2 uTxWinEnv;", // x: daylight 0..1, y: office interiors
    "uniform vec3 uTxWinK;", // x: room brightness gain (× the scene's sky + bounced sun irradiance), y: share of lantern-lit rooms at night, z: lantern level
    "float txWH( float s, float k ) { return fract( sin( s * 91.3458 + k * 47.1231 ) * 43758.5453 ); }",
    "vec3 txWPal( float h ) {",
    "  vec3 c = h < 0.125 ? vec3( 0.46, 0.58, 0.47 ) : h < 0.25 ? vec3( 0.68, 0.56, 0.31 ) : h < 0.375 ? vec3( 0.66, 0.47, 0.44 ) : h < 0.5 ? vec3( 0.43, 0.53, 0.62 )",
    "    : h < 0.625 ? vec3( 0.70, 0.64, 0.51 ) : h < 0.75 ? vec3( 0.45, 0.46, 0.31 ) : h < 0.875 ? vec3( 0.40, 0.27, 0.17 ) : vec3( 0.55, 0.55, 0.52 );",
    "  return c * c; }",
    // wallpaper / paint (room units): plain paint, fine pinstripes or a small diamond print — low contrast, so the
    // pattern never reads as curtains or blinds
    "float txWPat( vec2 p, float h ) {",
    "  if ( h < 0.4 ) return 1.0;",
    "  if ( h < 0.7 ) return 0.93 + 0.07 * step( 0.5, fract( p.x * ( 14.0 + 10.0 * h ) ) );",
    "  vec2 g = fract( vec2( p.x + p.y, p.x - p.y ) * 7.0 ) - 0.5; return 0.94 + 0.06 * step( max( abs( g.x ), abs( g.y ) ), 0.18 ); }",
    // furniture silhouette (front view) in room units; lamp = glowing lamp-shade coverage
    "float txWFurn( vec2 p, float kind, float ox, float aa, inout float lamp ) {",
    "  vec2 q = p - vec2( ox, 0.0 ); vec2 qa = vec2( abs( q.x ), q.y ); float c = 0.0;",
    "  if ( kind < 1.0 ) { c = max( txWR( q, vec2( 0.0, -0.8 ), vec2( 0.46, 0.2 ), aa ), txWR( q, vec2( 0.0, -0.5 ), vec2( 0.4, 0.14 ), aa ) );",
    "    c = max( c, txWR( qa, vec2( 0.44, -0.64 ), vec2( 0.07, 0.12 ), aa ) ); }",
    "  else if ( kind < 2.0 ) { c = txWR( q, vec2( 0.0, -0.2 ), vec2( 0.27, 0.8 ), aa ) * ( 1.0 - 0.6 * txWR( vec2( q.x, fract( q.y * 2.6 ) ), vec2( 0.0, 0.55 ), vec2( 0.22, 0.3 ), aa * 2.6 ) * step( q.y, 0.5 ) ); }",
    "  else if ( kind < 3.0 ) { c = max( txWR( q, vec2( 0.0, -0.44 ), vec2( 0.42, 0.035 ), aa ), txWR( qa, vec2( 0.36, -0.73 ), vec2( 0.03, 0.27 ), aa ) );",
    "    c = max( c, txWR( q, vec2( 0.2, -0.35 ), vec2( 0.02, 0.07 ), aa ) );",
    "    float sh = txWR( vec2( ( q.x - 0.2 ) * ( 1.0 + ( q.y + 0.17 ) * 3.5 ), q.y ), vec2( 0.0, -0.17 ), vec2( 0.11, 0.08 ), aa );",
    "    lamp = max( lamp, sh ); c = max( c, sh ); }",
    "  else if ( kind < 4.0 ) { c = txWR( q, vec2( 0.0, -0.3 ), vec2( 0.25, 0.7 ), aa ) * ( 1.0 - 0.5 * txWR( q, vec2( 0.0, -0.3 ), vec2( 0.006, 0.66 ), aa ) ); }",
    "  else if ( kind < 5.0 ) { c = max( txWR( q, vec2( 0.0, -0.83 ), vec2( 0.62, 0.13 ), aa ), txWR( q, vec2( -0.58, -0.62 ), vec2( 0.05, 0.34 ), aa ) ); }",
    "  else if ( kind < 6.0 ) { float m = -1.0 + 0.62 * max( 0.0, 1.0 - q.x * q.x * 2.2 ) + 0.05 * sin( q.x * 37.0 + ox * 11.0 ) + 0.03 * sin( q.x * 83.0 );",
    "    c = 1.0 - smoothstep( -aa, aa, q.y - m ); }",
    "  else if ( kind < 7.0 ) { c = max( txWR( q, vec2( 0.0, -0.56 ), vec2( 0.18, 0.03 ), aa ), txWR( q, vec2( -0.16, -0.32 ), vec2( 0.028, 0.26 ), aa ) );",
    "    c = max( c, txWR( qa, vec2( 0.15, -0.8 ), vec2( 0.022, 0.22 ), aa ) ); }",
    "  return c; }",
    /*
     * One room. cu: position in the cell (0..1), rd: view ray in room units (x along U, y up, z out of the wall,
     * rd.z < 0), sd: window seed, wr: window rect, hole: no glass, chr: charred, aa: antialias width.
     * Returns daylight radiance (before glass); litK = colour multiplier for the lamp-lit night look.
     */
    "vec3 txWRoom( vec2 cu, vec3 rd, float sd, vec4 wr, float hole, float chr, float aa, float day, float office, out vec3 litK ) {",
    "  vec3 p0 = vec3( cu * 2.0 - 1.0, 1.0 );",
    "  float h0 = txWH( sd, 1.0 ), h1 = txWH( sd, 2.0 ), h2 = txWH( sd, 3.0 ), h3 = txWH( sd, 4.0 ), h4 = txWH( sd, 5.0 ), h5 = txWH( sd, 6.0 ), h6 = txWH( sd, 7.0 ), h7 = txWH( sd, 13.0 );",
    // room box (cell units, window plane z = 1, back wall z = -1): the side walls stand 0.45–1 m beyond the jambs, the floor
    // ~0.8 m below the sill and the ceiling 0.3–0.6 m above the head, so floor, ceiling and both side walls show through
    // the window and slide against each other as the camera moves (random size per window). hp = normalised room coords.
    "  float bw = office > 0.5 || wr.w > 1.5 ? 1.0 : min( wr.x + 0.14 + 0.3 * txWH( sd, 14.0 ), 1.0 );",
    "  float ylo = wr.y - 0.36 - 0.12 * txWH( sd, 15.0 ), yhi = wr.z + 0.1 + 0.16 * txWH( sd, 16.0 );",
    "  vec3 bc = vec3( 0.0, ( ylo + yhi ) * 0.5, 0.0 ), bh = vec3( bw, ( yhi - ylo ) * 0.5, 1.0 );",
    "  vec3 id = 1.0 / rd; vec3 kk = ( bc + sign( rd ) * bh - p0 ) * id;",
    "  float t = min( min( kk.x, kk.y ), kk.z ); vec3 hq = p0 + rd * t; vec3 hp = clamp( ( hq - bc ) / bh, -1.0, 1.0 ); vec3 e3 = 1.0 - abs( hp );",
    "  vec3 wall = txWPal( h0 ); wall = max( mix( vec3( dot( wall, vec3( 0.3, 0.5, 0.2 ) ) ), wall, 1.3 ), 0.004 ); if ( office > 0.5 ) wall = mix( vec3( 0.42, 0.41, 0.36 ), wall, 0.3 );",
    "  vec3 alb; float edge; float lf = 1.0;",
    "  float nz = txNoise( hp.xy * vec2( 3.1, 1.3 ) + hp.z * 2.3 + sd * 57.0 );",
    "  if ( t == kk.z ) {", // back wall: wallpaper (stripes), water runs, baseboard; doorway / picture / torn plaster
    "    edge = min( e3.x, e3.y ); lf = 1.0;",
    "    alb = wall * txWPat( hp.xy, h1 ) * ( 0.75 + 0.35 * nz ) * ( 1.0 - 0.45 * smoothstep( 0.62, 0.82, txNoise( hp.xy * 1.7 + sd * 23.0 ) ) );",
    "    alb *= 1.0 - 0.4 * smoothstep( 0.35, 0.95, hp.y ) * smoothstep( 0.5, 0.8, txNoise( vec2( hp.x * 9.0, hp.y * 1.5 ) + sd * 13.0 ) );", // water runs from the ceiling
    "    alb = mix( alb, wall * 0.3, step( hp.y, -0.9 ) );", // baseboard
    "    float dx = ( h1 - 0.5 ) * 1.1;",
    "    if ( h2 < 0.45 ) { float fr = txWR( hp.xy, vec2( dx, -0.28 ), vec2( 0.25, 0.74 ), aa ), dr = txWR( hp.xy, vec2( dx, -0.3 ), vec2( 0.2, 0.7 ), aa );",
    "      alb = mix( alb, wall * 0.5, fr ); alb = mix( alb, vec3( 0.012 ), dr * ( 1.0 - 0.7 * step( hp.x, dx - 0.2 + 0.22 * h3 ) ) ); }", // doorway to a dark hall, door leaf ajar
    "    else if ( h2 < 0.8 ) { float pf = txWR( hp.xy, vec2( dx, 0.12 ), vec2( 0.2, 0.15 ), aa ), pi = txWR( hp.xy, vec2( dx, 0.12 ), vec2( 0.16, 0.11 ), aa );",
    "      alb = mix( alb, vec3( 0.04, 0.03, 0.015 ), pf ); alb = mix( alb, txWPal( h4 ) * 0.8, pi ); }", // framed picture
    "    else { float hl = smoothstep( 0.55, 0.6, txNoise( hp.xy * 2.2 + sd * 31.0 ) );",
    "      alb = mix( alb, vec3( 0.09, 0.06, 0.035 ) * ( 0.6 + 0.4 * step( 0.5, fract( hp.y * 22.0 ) ) ), hl ); }", // torn plaster exposing lath
    "  } else if ( t == kk.y ) {",
    "    edge = min( e3.x, e3.z );",
    "    if ( rd.y < 0.0 ) {", // floor: warm planks running into the room, rug, debris, the sun patch under the window
    "      alb = vec3( 0.2, 0.12, 0.065 ) * ( 0.78 + 0.22 * step( 0.5, fract( hp.x * 4.0 + floor( hp.z * 1.7 + hp.x * 4.0 ) * 0.37 ) ) ) * ( 0.8 + 0.4 * nz );",
    "      float rug = txWR( hp.xz, vec2( h3 - 0.5, -0.35 ), vec2( 0.45, 0.4 ), aa ) * step( 0.45, h4 );",
    "      alb = mix( alb, txWPal( fract( h4 * 7.0 ) ) * 0.6 * ( 0.8 + 0.2 * sin( hp.x * 60.0 ) ), rug );",
    "      alb *= 0.8 + 0.35 * step( 0.85, txWH( dot( floor( hp.xz * vec2( 31.0, 23.0 ) ), vec2( 1.0, 57.0 ) ), sd ) ) - 0.3 * smoothstep( 0.55, 0.7, txNoise( hp.xz * 5.0 + sd * 21.0 ) );",
    "      lf = 0.6 + 0.9 * step( abs( hq.x ), wr.x ) * smoothstep( 0.1, 0.6, hp.z ) * ( 1.0 - hole * 0.2 );",
    "    } else {", // ceiling: off-white stained plaster, fixture, sometimes collapsed; brighter where the floor bounces the daylight up
    // (seen from the street the ceiling fills half the window: darker than the walls, lit by the floor bounce near the
    // window, brown water stains and a crown moulding line so it never reads as a frosted pane)
    "      alb = vec3( 0.34, 0.32, 0.28 ) * ( 0.85 + 0.15 * nz );",
    "      alb = mix( alb, alb * vec3( 0.82, 0.7, 0.52 ), 0.8 * smoothstep( 0.72, 0.8, txNoise( hp.xz * 3.0 + sd * 17.0 ) ) );",
    "      alb *= 1.0 - 0.45 * ( 1.0 - smoothstep( 0.03, 0.07, min( e3.x, e3.z ) ) );",
    "      lf = 0.35 + 0.5 * smoothstep( -0.8, 1.0, hp.z );",
    "      alb = mix( alb, vec3( 0.03 ), txWR( hp.xz, vec2( 0.0, -0.1 ), vec2( 0.07, 0.07 ), aa ) );",
    "      if ( h5 < 0.22 ) alb = mix( alb, vec3( 0.01 ), smoothstep( 0.5, 0.56, txNoise( hp.xz * 2.4 + sd * 19.0 ) ) );",
    "    }",
    "  } else {", // side walls: same paper a shade darker, baseboard, picture rail, a doorway on one side and a picture on the other
    "    edge = min( e3.y, e3.z ); lf = 0.55; vec2 sp = hp.zy; float sx = sign( hp.x );",
    "    float ns = txNoise( sp * vec2( 3.1, 1.3 ) + sx * 7.3 + sd * 41.0 );",
    "    alb = wall * 0.85 * txWPat( sp.xy, h1 ) * ( 0.75 + 0.35 * ns ) * ( 1.0 - 0.45 * smoothstep( 0.62, 0.82, txNoise( sp * 1.7 + sx * 3.1 + sd * 29.0 ) ) );",
    "    alb = mix( alb, wall * 0.3, step( hp.y, -0.9 ) );",
    "    alb = mix( alb, wall * 0.45, txWR( sp, vec2( 0.0, 0.42 ), vec2( 1.0, 0.015 ), aa ) );",
    "    float sz = ( h3 - 0.5 ) * 1.1;",
    "    if ( sx * ( h1 - 0.5 ) > 0.0 ) { float fr = txWR( sp, vec2( sz, -0.3 ), vec2( 0.27, 0.74 ), aa ), dr = txWR( sp, vec2( sz, -0.32 ), vec2( 0.22, 0.7 ), aa );",
    "      alb = mix( alb, wall * 0.5, fr ); alb = mix( alb, vec3( 0.01 ), dr ); }",
    "    else { float pf = txWR( sp, vec2( sz, 0.1 ), vec2( 0.22, 0.17 ), aa ), pi = txWR( sp, vec2( sz, 0.1 ), vec2( 0.18, 0.13 ), aa );",
    "      alb = mix( alb, vec3( 0.04, 0.03, 0.015 ), pf ); alb = mix( alb, txWPal( fract( h4 * 3.7 ) ) * 0.7 * ( 0.7 + 0.3 * ns ), pi ); }",
    "  }",
    // daylight from the window: every surface keeps a solid ambient share (rooms read by day), brighter towards the glass,
    // corner occlusion draws the box edges (the perspective cue); the faces differ in tone (paper / plaster / wood)
    "  float zz = clamp( ( hp.z + 1.0 ) * 0.5, 0.0, 1.0 );",
    "  float ao = 0.22 + 0.78 * smoothstep( 0.0, 0.4, edge );",
    "  float light = ( 0.4 + 0.6 * zz * zz ) * lf * ao;",
    // lamp for lit rooms: ceiling fixture or the table lamp
    "  vec3 lp = vec3( ( h3 - 0.5 ) * 0.8, 0.7, -0.25 );",
    "  vec3 dl = hp - lp; float lit = ( 0.35 + 1.6 / ( 1.0 + 3.0 * dot( dl, dl ) ) ) * ( 0.4 + 0.6 * ao ) * mix( 1.0, 0.75, step( rd.y, 0.0 ) * step( kk.y, t ) );",
    "  lit *= clamp( dot( alb, vec3( 0.3, 0.5, 0.2 ) ) / max( dot( wall, vec3( 0.3, 0.5, 0.2 ) ), 0.02 ), 0.12, 1.4 );", // wallpaper, doorways, pictures, rugs read in lamplight
    // furniture cards: a large piece in the back half of the room, sometimes a small one near the window
    "  float lamp = 0.0;",
    "  float kind = floor( h6 * 8.0 ); if ( office > 0.5 ) kind = h6 < 0.4 ? 2.0 : h6 < 0.65 ? 3.0 : h6 < 0.85 ? 1.0 : 7.0;",
    "  float zf = -0.25 - 0.55 * h2; float tf = ( zf - 1.0 ) / rd.z;",
    "  vec3 furn = wall * 0.22 + vec3( 0.02, 0.014, 0.008 );",
    "  if ( tf < t && kind < 7.0 ) { vec2 pf = ( p0.xy + rd.xy * tf - bc.xy ) / bh.xy; float cv = txWFurn( pf, kind, ( h4 - 0.5 ) * 0.9, aa * 2.0, lamp );",
    "    float fl = ( 0.5 + 0.5 * ( zf + 1.0 ) * 0.5 ) * 0.8;",
    "    alb = mix( alb, furn, cv ); light = mix( light, fl, cv ); lit = mix( lit, 0.05, cv * ( 1.0 - lamp ) ); }",
    "  float zn = 0.35; float tn = ( zn - 1.0 ) / rd.z;",
    "  if ( h5 > 0.62 && tn < t ) { vec2 pn = ( p0.xy + rd.xy * tn - bc.xy ) / bh.xy; float cv = txWFurn( pn, h5 > 0.82 ? 6.0 : 2.0, ( h1 - 0.5 ) * 1.2, aa * 2.0, lamp );",
    "    alb = mix( alb, furn * 0.8, cv ); light = mix( light, 0.7, cv ); lit = mix( lit, 0.03, cv * ( 1.0 - lamp ) ); }",
    // a pendant light hanging from the ceiling in about half the rooms (a strong mid-air parallax cue from the street)
    "  if ( h3 > 0.45 ) { float zp = -0.05 - 0.5 * fract( h3 * 13.0 ); float tp = ( zp - 1.0 ) / rd.z;",
    "    if ( tp < t ) { vec2 pp = ( p0.xy + rd.xy * tp - bc.xy ) / bh.xy; float px = ( fract( h3 * 7.0 ) - 0.5 ) * 0.5, sy = 0.55 + 0.15 * fract( h3 * 3.0 );",
    "      float cv = txWR( pp, vec2( px, ( 1.0 + sy ) * 0.5 ), vec2( 0.012, ( 1.0 - sy ) * 0.5 ), aa );",
    "      float sw = 0.05 + max( sy - pp.y, 0.0 ) * 0.9; cv = max( cv, txWR( pp, vec2( px, sy - 0.07 ), vec2( sw, 0.07 ), aa ) * step( abs( pp.x - px ), sw ) );",
    "      alb = mix( alb, vec3( 0.03, 0.027, 0.022 ), cv ); light = mix( light, 0.6, cv ); lit = mix( lit, 0.05, cv ); } }",
    // an occasional figure standing in the room: a propped-up skeleton (bone) or a dark silhouette (1.75 m = 1 room unit)
    "  if ( office < 0.5 && h7 < 0.08 ) { float zg = 0.1 - 0.5 * fract( h7 * 17.0 ); float tg = ( zg - 1.0 ) / rd.z;",
    "    if ( tg < t ) { vec2 q = p0.xy + rd.xy * tg - vec2( ( fract( h7 * 29.0 ) - 0.5 ) * bw, ylo + 1.0 ); vec2 qa = vec2( abs( q.x ), q.y ); float bone = step( 0.45, fract( h7 * 41.0 ) );",
    "      float cv = 1.0 - smoothstep( 0.075 - aa, 0.075 + aa, length( ( q - vec2( 0.0, -0.1 ) ) * vec2( 1.0, 0.8 ) ) );", // head
    "      cv = max( cv, txWR( q, vec2( 0.0, -0.36 ), vec2( 0.13 - 0.04 * bone, 0.17 ), aa ) * ( 1.0 - bone * 0.7 * step( 0.5, fract( q.y * 16.0 ) ) * step( 0.02, qa.x ) ) );", // torso / ribs
    "      cv = max( cv, txWR( qa, vec2( 0.16 - 0.03 * bone, -0.42 ), vec2( 0.03 - 0.01 * bone, 0.19 ), aa ) );", // arms
    "      cv = max( cv, txWR( qa, vec2( 0.06, -0.78 ), vec2( 0.04 - 0.015 * bone, 0.24 ), aa ) );", // legs
    "      vec3 fc = bone > 0.5 ? vec3( 0.42, 0.39, 0.31 ) : furn * 0.6;",
    "      alb = mix( alb, fc, cv ); light = mix( light, bone > 0.5 ? 0.75 : 0.55, cv ); lit = mix( lit, bone > 0.5 ? 0.5 : 0.04, cv ); } }",
    "  lit = mix( lit, 2.6, lamp );",
    "  vec3 litC = lit * mix( vec3( 1.0 ), alb / ( dot( alb, vec3( 0.3, 0.5, 0.2 ) ) + 0.02 ), 0.3 * ( 1.0 - lamp ) );",
    "  alb = mix( alb, vec3( 0.012, 0.01, 0.009 ) * ( 0.6 + 0.8 * nz ), chr * 0.85 );", // burnt-out: charred
    "  vec3 radn = alb * light;",
    // window-plane dressing (per window, from the world seed): ~28 % of the glazed windows — curtains pulled partly aside
    // (rarely closed), roller blinds part-way down, plywood behind the glass; torn rags in some empty frames
    "  float nx = wr.w > 1.5 ? fract( cu.x * 2.0 ) * 2.0 - 1.0 : cu.x * 2.0 - 1.0;",
    "  vec2 wl = vec2( nx / wr.x, ( ( cu.y * 2.0 - 1.0 ) - wr.y ) / ( wr.z - wr.y ) );",
    "  float fv = office > 0.5 ? 0.9 + 0.1 * txWH( sd, 8.0 ) : txWH( sd, 8.0 ), fw = txWH( sd, 9.0 ); float cov = 0.0; vec3 cc = vec3( 0.0 ); float ct = 0.5;",
    "  if ( hole < 0.5 ) {",
    "    if ( fv < 0.14 ) { float cl = fv < 0.012 ? 1.0 : 0.1 + fw * 0.3, cr = fv < 0.012 ? 1.0 : 0.1 + fract( fw * 7.3 ) * 0.3;",
    "      cov = max( 1.0 - smoothstep( -1.0 + 2.0 * cl - 0.03, -1.0 + 2.0 * cl, wl.x ), smoothstep( 1.0 - 2.0 * cr, 1.0 - 2.0 * cr + 0.03, wl.x ) );",
    "      cc = txWPal( fract( fw * 13.0 ) ) * 1.3 * ( 0.72 + 0.28 * sin( wl.x * 26.0 + fw * 9.0 ) ); ct = 0.55; }",
    "    else if ( fv < 0.25 ) { float bl = 1.0 - ( 0.12 + fw * 0.45 );",
    "      cov = smoothstep( bl - 0.01, bl, wl.y ); cc = vec3( 0.42, 0.37, 0.25 ) * ( 0.92 + 0.08 * step( 0.5, fract( wl.y * 18.0 ) ) );",
    "      cc = mix( cc, vec3( 0.05 ), txWR( wl, vec2( 0.0, bl + 0.015 ), vec2( 1.0, 0.012 ), 0.01 ) ); ct = 0.45; }",
    "    else if ( fv < 0.28 ) { cov = 1.0; cc = vec3( 0.2, 0.13, 0.07 ) * ( 0.8 + 0.2 * sin( wl.y * 40.0 + 6.0 * txNoise( wl * vec2( 2.0, 12.0 ) + sd * 3.0 ) ) ); ct = 0.02; }",
    "  } else if ( fv < 0.25 && chr < 0.5 ) {", // rags of a curtain hanging in an empty frame
    "    float rw = 0.2 + fw * 0.2, side = step( 0.5, fract( fw * 5.1 ) ) * 2.0 - 1.0;",
    "    float bot = 0.3 + 0.45 * txNoise( vec2( wl.x * 7.0, sd * 9.0 ) );",
    "    cov = step( 1.0 - 2.0 * rw, wl.x * side ) * step( bot, wl.y ); cc = txWPal( fract( fw * 13.0 ) ) * 0.6 * ( 0.7 + 0.3 * sin( wl.x * 40.0 ) ); ct = 0.3; }",
    "  cov *= step( -1.0, wl.x ) * step( wl.x, 1.0 ) * step( -0.02, wl.y ) * step( wl.y, 1.02 );",
    "  radn = mix( radn, cc * ( 0.6 + 0.4 * ( 1.0 - hole ) ), cov ); litC = mix( litC, ct * 1.3 * mix( vec3( 1.0 ), cc / ( dot( cc, vec3( 0.3, 0.5, 0.2 ) ) + 0.02 ), 0.5 ), cov );",
    "  litK = litC;",
    "  return radn; }",
    // ---- procedural wall detail (brick courses / ashlar joints / render pitting) on the atlas wall field ----
    "uniform vec4 uTxWall;", // x kind (0 off, 1 brick, 2 ashlar/panels, 3 render), y units per tile U, z courses per tile V, w stagger
    "uniform vec4 uTxWall2;", // x,y cell offsets (align with painted joints), z joint half-width (m), w relief (m)
    "uniform float uTxRecess;", // window glass set back from the wall plane (m); 0 = flush (curtain walls)
    // Procedural window grid (G.mats.trackWindows: landmark / hand-made window-grid textures without an atlas mask).
    "uniform vec4 uTxGrid;", // x,y room cells per UV unit, z 1 = procedural mask
    "uniform vec4 uTxProc;", // x mullions, y transom y (cell units, < -5 none), z bar half-width (cell units), w lit colour known
    "uniform vec3 uTxProcG;", // painted glass colour (as sampled)
    "uniform vec3 uTxProcL;", // painted lit-window colour
    // mask (R see-through, G hole) from the window rect + bars; the pane state is classified once per cell from the painted
    // texture (blurred mip): near-black = broken hole, glass-coloured / lit-coloured = glass, anything else (boards…) = opaque
    // fw = pixel footprint in cells: the rect edges and bars are box-filtered by it, and once a cell is under ~3 px the mask
    // turns into its mean coverage (what the atlas mask's mip chain does), so far grids shade evenly instead of sparkling
    "vec4 txProcMask( sampler2D tmap, vec2 uv, vec2 grid, vec4 wr, float fw ) {",
    "  vec2 cl = floor( uv * grid ); vec2 p = ( uv * grid - cl ) * 2.0 - 1.0;",
    "  float aw = max( fw * 2.0, 1e-4 ), far = smoothstep( 0.2, 0.45, fw );",
    "  float inR = clamp( ( wr.x - abs( p.x ) ) / aw + 0.5, 0.0, 1.0 ) * clamp( ( p.y - wr.y ) / aw + 0.5, 0.0, 1.0 ) * clamp( ( wr.z - p.y ) / aw + 0.5, 0.0, 1.0 );",
    "  inR = mix( inR, wr.x * ( wr.z - wr.y ) * 0.5, far );",
    "  if ( inR < 1e-3 ) return vec4( 0.0 );",
    "  float n1 = uTxProc.x + 1.0, t = ( p.x + wr.x ) / ( 2.0 * wr.x ) * n1;",
    "  float bar = clamp( ( uTxProc.z - abs( t - floor( t + 0.5 ) ) * 2.0 * wr.x / n1 ) / aw + 0.5, 0.0, 1.0 ) * step( 0.5, t ) * step( t, n1 - 0.5 );",
    "  bar = max( bar, clamp( ( uTxProc.z * 1.2 - abs( p.y - uTxProc.y ) ) / aw + 0.5, 0.0, 1.0 ) );",
    "  bar = mix( bar, min( uTxProc.x * uTxProc.z / max( wr.x, 0.05 ) + step( -5.0, uTxProc.y ) * 1.2 * uTxProc.z / max( wr.z - wr.y, 0.05 ), 0.6 ), far );",
    "  float sy = ( 1.0 + wr.y + 0.3 * ( wr.z - wr.y ) ) * 0.5;",
    "  vec3 sc = ( textureLod( tmap, ( cl + vec2( ( 1.0 - 0.6 * wr.x ) * 0.5, sy ) ) / grid, 2.0 ).rgb + textureLod( tmap, ( cl + vec2( ( 1.0 + 0.6 * wr.x ) * 0.5, sy ) ) / grid, 2.0 ).rgb ) * 0.5;",
    "  vec3 lw = vec3( 0.3, 0.5, 0.2 ); float lg = max( dot( uTxProcG, lw ), 1e-4 ), ls = max( dot( sc, lw ), 1e-5 );",
    "  float hole = 1.0 - smoothstep( 0.3, 0.55, ls / lg );",
    "  float gl = 1.0 - smoothstep( 0.22, 0.42, length( sc / ls - uTxProcG / lg ) );",
    "  float lt = uTxProc.w * ( 1.0 - smoothstep( 0.22, 0.42, length( sc / ls - uTxProcL / max( dot( uTxProcL, lw ), 1e-4 ) ) ) );",
    "  float see = max( max( gl, lt ), hole ) * ( 1.0 - bar );",
    "  return vec4( see * mix( 0.72, 1.0, hole ), hole * ( 1.0 - bar ), 0.0, 0.0 ) * inR; }",
    // height in metres at atlas uv; cell = unit id, mort = mortar coverage (box-filtered by aa metres), face = 0 joint..1 face
    "float txWallHt( vec2 uv, float aa, out vec2 cell, out float mort, out vec2 dmg ) {",
    "  cell = vec2( 0.0 ); mort = 0.0; dmg = vec2( 0.0 );",
    "  vec2 um = uv * vec2( 14.0, 21.0 );",
    "  float grain = txNoise( um * vec2( 9.0, 9.0 ) ) * 0.6 + txNoise( um * 23.0 + 7.1 ) * 0.4;",
    "  if ( uTxWall.x > 2.5 ) return ( grain - 0.5 ) * uTxWall2.w;", // render / stucco: pitting only
    "  vec2 q = vec2( uv.x * uTxWall.y, ( 1.0 - uv.y ) * uTxWall.z ) + uTxWall2.xy;",
    "  q.x += 0.5 * uTxWall.w * mod( floor( q.y ), 2.0 );",
    "  cell = floor( q ); vec2 f = fract( q );",
    "  vec2 dm = min( f, 1.0 - f ) * vec2( 14.0 / uTxWall.y, 21.0 / uTxWall.z );", // distance to the joints (m)
    "  bool brk = uTxWall.x < 1.5;",
    // brick: bed joints vary per course (hand-laid), and the arrises are eroded so the joint edge wanders (no ruler lines)
    "  float jw = uTxWall2.z * ( brk ? 0.7 + 0.6 * txHash( vec2( cell.y * 0.371, 5.3 ) ) : 1.0 );",
    "  float dist = min( dm.x, dm.y ) + ( grain - 0.5 ) * jw * ( brk ? 1.1 : 0.5 );",
    "  mort = 1.0 - smoothstep( jw - aa * 0.5, jw + aa * 0.5 + 1e-4, dist );",
    "  float face = smoothstep( jw * 0.7, jw * 2.2 + aa * 0.5, dist );", // rounded arris
    "  float hc = txHash( cell * 0.1731 + 0.37 );",
    // damage comes in clusters (frost / impact zones of a dozen units), not as a polka-dot scatter: inside a cluster 10–25 % of
    // the units are missing (the backing wythe shows one unit deep), a third have spalled faces; elsewhere ~1 %
    "  float dz = brk ? smoothstep( 0.77, 0.83, txNoise( cell * vec2( 0.11, 0.045 ) + 71.0 ) ) : 0.0;",
    "  dmg = vec2( dz * step( hc, 0.1 + 0.15 * dz * dz ), max( dz * step( 0.3, hc ) * step( hc, 0.6 ), step( hc, brk ? 0.012 : 0.02 ) ) );",
    "  float h = face * ( 0.82 + 0.36 * hc + ( grain - 0.5 ) * ( brk ? 0.35 : 0.5 ) );",
    "  h -= face * dmg.y * ( 0.8 + 0.6 * grain );", // spalled face
    "  h -= dmg.x * ( 2.6 + 0.4 * grain ); mort *= 1.0 - dmg.x;", // missing unit: the backing brick one unit in
    "  return h * uTxWall2.w; }",
  ].join("\n");
  // Runs right after the albedo map (and the macro block): swaps window pixels for the room seen through them.
  const WIN_FRAG = [
    "{ vec4 txMk = texture2D( uTxWinMask, vMapUv );", // sampled + derivatives taken in uniform control flow
    "  vec3 txDPx = dFdx( -vViewPosition ), txDPy = dFdy( -vViewPosition );",
    "  vec2 txDUx = dFdx( vMapUv ), txDUy = dFdy( vMapUv );",
    "  vec2 txGrid = uTxGrid.xy;",
    // procedural grids (landmark / POI materials) are often shared with roofs and soffits: walls only
    "  float txVg = 1.0;",
    "  float txFw = max( length( txDUx * txGrid ), length( txDUy * txGrid ) );",
    "  if ( uTxGrid.z > 0.5 ) { vec3 txNg = cross( dFdx( vTxW ), dFdy( vTxW ) ); txVg = 1.0 - smoothstep( 0.45, 0.7, abs( txNg.y ) * inversesqrt( max( dot( txNg, txNg ), 1e-12 ) ) );",
    "    txMk = txProcMask( map, vMapUv, txGrid, uTxWinRect, txFw ) * txVg; }",
    "  float txDetail = 1.0 - smoothstep( 0.045 * uTxQ.x, 0.1 * uTxQ.x, txFw );", // uTxQ.x < 1 on reduced tiers: rooms / relief only near
    // room footprint: the geometric mean of the pixel's extent in cells (sqrt of its area). The max above is right for the
    // wall relief but kills the rooms on every façade seen along a street (the U extent grows with 1 / cos); the room
    // shading is band-limited by its own aa width, so rooms stay until a cell is ~6 px on screen (≈ 90–120 m at 1080p)
    "  float txFr = sqrt( abs( txDUx.x * txDUy.y - txDUx.y * txDUy.x ) * txGrid.x * txGrid.y );",
    "  float txRp = 0.0;",
    "  if ( uTxWall.x > 0.5 && uTxWinLvl < 1.5 ) {", // uniform branch: derivatives stay valid
    "    vec2 txDmx = txDUx * vec2( 14.0, 21.0 ), txDmy = txDUy * vec2( 14.0, 21.0 );",
    "    float txPm = max( max( length( txDmx ), length( txDmy ) ), 1e-5 );", // pixel footprint (m)
    "    float txCourse = uTxWall.x > 2.5 ? 0.12 : 21.0 / uTxWall.z;",
    "    float txFa = 1.0 - smoothstep( 0.28, 0.6, txPm / txCourse );", // albedo detail until a course is ~2 px
    "    txWallN = ( 1.0 - smoothstep( 0.12, 0.3, txPm / txCourse ) ) * txMk.b * ( 1.0 - smoothstep( 0.0, 0.05, txMk.r + txMk.g ) ) * uTxQ.w;",
    "    float txWF = txMk.b * ( 1.0 - smoothstep( 0.0, 0.05, txMk.r + txMk.g ) ) * txFa;",
    "    if ( txWF > 0.001 ) {",
    "      vec2 txC0, txC1, txDg, txDg1; float txMo, txM1;",
    "      float txH0 = txWallHt( vMapUv, txPm, txC0, txMo, txDg );",
    "      if ( txWallN > 0.001 ) txDH = vec2( txWallHt( vMapUv + txDUx, txPm, txC1, txM1, txDg1 ), txWallHt( vMapUv + txDUy, txPm, txC1, txM1, txDg1 ) ) - txH0;", // bump taps only where the bump shows
    "      float txLum = dot( diffuseColor.rgb, vec3( 0.3, 0.5, 0.2 ) );",
    "      vec3 txAlb = diffuseColor.rgb;",
    "      if ( uTxWall.x < 2.5 ) {",
    "        float txT = txHash( txC0 * 0.2113 + 0.71 ), txV = uTxWall.x < 1.5 ? 0.07 : 0.1;",
    // tone is driven by soft clusters of 5–20 units (firing batches, old repairs, weathering), per-unit noise is small — no
    // checkerboard of random dark bricks. Unit ids come from the continuous UV, so repeated atlas tiles differ.
    "        vec2 txZs = txC0;",
    "        float txZ = txNoise( txZs * vec2( 0.16, 0.07 ) ) * 0.6 + txNoise( txZs * vec2( 0.05, 0.02 ) + 3.3 ) * 0.4;",
    "        txRp = uTxWall.x < 1.5 ? smoothstep( 0.72, 0.8, txNoise( txZs * vec2( 0.07, 0.03 ) + 13.0 ) ) : 0.0;",
    "        txAlb *= ( 1.0 + ( txT - 0.5 ) * txV + ( txZ - 0.5 ) * 0.34 ) * ( uTxWall.x < 1.5 && txT > 0.992 ? 0.82 : 1.0 );",
    "        txAlb = mix( txAlb, txAlb * vec3( 1.2, 1.08, 0.98 ) + 0.012, txDg.y * 0.75 );", // spalled: fresh, rougher core
    "        txAlb = mix( txAlb, txAlb * 0.3, txDg.x );", // missing: the backing wythe in shadow
    "        float txFace = clamp( txH0 / max( uTxWall2.w, 1e-4 ), 0.0, 1.0 );",
    "        txAlb *= mix( 0.72, 1.0, smoothstep( 0.2, 0.8, txFace ) ) * mix( 1.0, 0.6 + 0.4 * txFace, txDg.x );", // arris / recess occlusion
    // mortar: recessed and dirt-filled — lime where the rain washes it, dark grime where soot settles; repointed patches are
    // flush, cooler grey cement
    "        float txMd = smoothstep( 0.35, 0.75, txNoise( txZs * vec2( 0.045, 0.02 ) + 29.0 ) * 0.7 + txNoise( txZs * vec2( 0.3, 0.9 ) + 3.0 ) * 0.3 );",
    "        vec3 txMc = mix( vec3( txLum * 0.8 + 0.07 ) * vec3( 1.0, 0.96, 0.88 ), vec3( txLum * 0.42 ) * vec3( 1.0, 0.95, 0.9 ), txMd );",
    "        txMc = mix( txMc, vec3( txLum * 0.7 + 0.1 ) * vec3( 0.97, 0.99, 1.0 ), txRp );",
    "        txAlb = mix( txAlb, txMc, txMo * ( uTxWall.x < 1.5 ? 0.8 : 0.35 ) );",
    "        txAlb = mix( txAlb, txAlb * 0.55, txMo * ( uTxWall.x < 1.5 ? 0.0 : 0.6 ) );", // ashlar joints read as shadow lines
    "      }",
    "      diffuseColor.rgb = mix( diffuseColor.rgb, txAlb, txWF );",
    "      txDH *= 1.0 - 0.55 * txRp;", // repointed: flush joints
    "    }",
    // runoff under every sill (dark soot runs + white efflorescence where the water evaporates), per window from the world
    "    vec2 txWc = floor( vMapUv * txGrid ); vec2 txWp = ( vMapUv * txGrid - txWc ) * 2.0 - 1.0;",
    "    float txBelow = uTxWinRect.y - txWp.y;",
    "    if ( txBelow > 0.02 && abs( txWp.x ) < uTxWinRect.x * 1.15 && uTxGrid.z < 0.5 && txDetail > 0.01 ) {",
    "      float txWs = txHash( txWc * 0.731 + 0.19 );",
    "      float txRl = ( 0.25 + 0.6 * txWs ) * ( 1.0 - smoothstep( 0.0, 0.9, abs( txWp.x ) / uTxWinRect.x - 0.25 ) );",
    "      float txSt = smoothstep( 0.45, 0.8, txNoise( vec2( txWp.x * 11.0 + txWs * 50.0, txBelow * 1.5 ) ) ) * ( 1.0 - smoothstep( 0.0, txRl, txBelow ) );",
    "      float txEf = smoothstep( 0.6, 0.85, txNoise( vec2( txWp.x * 7.0 - txWs * 30.0, txBelow * 4.0 + 5.0 ) ) ) * smoothstep( 0.02, 0.1, txBelow ) * ( 1.0 - smoothstep( 0.1, 0.35, txBelow ) ) * step( 0.4, txWs );",
    "      float txWk = txDetail * ( 1.0 - txMk.r ) * ( 1.0 - txMk.g );",
    "      diffuseColor.rgb *= 1.0 - 0.38 * txSt * txWk;",
    "      diffuseColor.rgb = mix( diffuseColor.rgb, vec3( 0.55, 0.53, 0.49 ), 0.3 * txEf * txWk );",
    "    }",
    "  }",
    // window recess: the glass sits uTxRecess metres behind the wall plane. Inside the opening the atlas (colour + mask) is
    // re-sampled where the view ray meets the glass plane; where it hits the reveal instead we show the jamb / sill / head.
    "  vec2 txRecUv = vMapUv;",
    "  if ( uTxRecess > 0.0 && txDetail * txVg > 0.01 && uTxWinLvl < 2.5 ) {",
    "    vec2 txU0 = vMapUv * txGrid; vec2 txC0 = floor( txU0 ); vec2 txP0 = ( txU0 - txC0 ) * 2.0 - 1.0;",
    "    if ( abs( txP0.x ) < uTxWinRect.x + 0.05 && txP0.y > uTxWinRect.y - 0.05 && txP0.y < uTxWinRect.z + 0.05 ) {",
    "      float txDt = txDUx.x * txDUy.y - txDUx.y * txDUy.x; txDt = abs( txDt ) < 1e-14 ? 1e-14 : txDt;",
    "      vec3 txQu = ( txDPx * txDUy.y - txDPy * txDUx.y ) / txDt, txQv = ( txDPy * txDUx.x - txDPx * txDUy.x ) / txDt;",
    "      vec3 txNn = normalize( cross( txQu, txQv ) ); vec3 txRv = normalize( -vViewPosition );",
    "      if ( dot( txNn, txRv ) > 0.0 ) txNn = -txNn;", // outward (towards the viewer)
    "      float txTt = uTxRecess / max( -dot( txRv, txNn ), 0.12 ) * txDetail;",
    "      vec2 txDuv = vec2( dot( txRv, txQu ) / max( dot( txQu, txQu ), 1e-10 ), dot( txRv, txQv ) / max( dot( txQv, txQv ), 1e-10 ) ) * txTt;",
    "      vec2 txUg = vMapUv + txDuv; vec2 txPg = ( txUg * txGrid - txC0 ) * 2.0 - 1.0;",
    "      if ( abs( txPg.x ) < uTxWinRect.x && txPg.y > uTxWinRect.y && txPg.y < uTxWinRect.z ) {",
    "        vec3 txMg = textureGrad( map, txUg, txDUx, txDUy ).rgb;",
    "        diffuseColor.rgb *= ( txMg + 0.004 ) / ( sampledDiffuseColor.rgb + 0.004 );",
    "        txMk = uTxGrid.z > 0.5 ? txProcMask( map, txUg, txGrid, uTxWinRect, txFw ) * txVg : textureGrad( uTxWinMask, txUg, txDUx, txDUy );",
    "        txRecUv = txUg;",
    // the sun's shadow of the reveal on the glass plane (frames, sashes, curtains): trace back towards the sun to the wall plane
    "        float txShG = 1.0;",
    "#if NUM_DIR_LIGHTS > 0",
    "        vec3 txL = directionalLights[ 0 ].direction; float txLn = dot( txL, txNn );",
    "        if ( txLn > 0.02 ) {",
    "          vec2 txLuv = vec2( dot( txL, txQu ) / max( dot( txQu, txQu ), 1e-10 ), dot( txL, txQv ) / max( dot( txQv, txQv ), 1e-10 ) ) * ( uTxRecess / txLn );",
    "          vec2 txPs = ( ( txUg + txLuv ) * txGrid - txC0 ) * 2.0 - 1.0;",
    "          float txIn = txWR( txPs, vec2( 0.0, ( uTxWinRect.y + uTxWinRect.z ) * 0.5 ), vec2( uTxWinRect.x, ( uTxWinRect.z - uTxWinRect.y ) * 0.5 ), 0.03 );",
    "          txShG = mix( 1.0, 0.45 + 0.55 * txIn, clamp( txLn * 5.0, 0.0, 1.0 ) * uTxWinEnv.x * dot( directionalLights[ 0 ].color, vec3( 0.3, 0.5, 0.2 ) ) / ( dot( directionalLights[ 0 ].color, vec3( 0.3, 0.5, 0.2 ) ) + 0.3 ) );",
    "        }",
    "#endif",
    "        txShG *= 1.0 - 0.3 * smoothstep( uTxWinRect.z - 0.14, uTxWinRect.z, txPg.y ) - 0.12 * smoothstep( uTxWinRect.x - 0.1, uTxWinRect.x, abs( txPg.x ) );", // contact occlusion under the head / at the jambs
    "        diffuseColor.rgb *= mix( 1.0, txShG, txDetail );",
    "      } else {",
    // the reveal: find the face the ray hits first (jamb / sill / head) and give it its real normal, so sun, sky and night
    // lighting (and the shadow map of the wall pixel) shade it like geometry; weathered stone sill, wall-coloured jambs
    "        vec2 txD = txPg - txP0; float txS = 1.0, txKind = 0.0;",
    "        if ( abs( txPg.x ) >= uTxWinRect.x && abs( txD.x ) > 1e-5 ) { float sx = ( sign( txPg.x ) * uTxWinRect.x - txP0.x ) / txD.x; if ( sx < txS ) { txS = sx; txKind = 1.0; } }",
    "        if ( txPg.y <= uTxWinRect.y && abs( txD.y ) > 1e-5 ) { float sy = ( uTxWinRect.y - txP0.y ) / txD.y; if ( sy < txS ) { txS = sy; txKind = 2.0; } }",
    "        if ( txPg.y >= uTxWinRect.z && abs( txD.y ) > 1e-5 ) { float sy = ( uTxWinRect.z - txP0.y ) / txD.y; if ( sy < txS ) { txS = sy; txKind = 3.0; } }",
    "        txS = clamp( txS, 0.0, 1.0 ); vec2 txHit = txP0 + txD * txS;",
    "        vec3 txUu = normalize( txQu ), txVv = normalize( txQv );",
    "        txRevN = txKind < 1.5 ? -sign( txPg.x ) * txUu : txKind < 2.5 ? txVv : -txVv;",
    "        vec3 txWc = textureLod( map, ( txC0 + vec2( 0.03, 0.5 ) ) / txGrid, 3.0 ).rgb;", // the pier next to the window ≈ wall colour
    "        vec3 txJ = txKind > 1.5 && txKind < 2.5 ? vec3( 0.34, 0.32, 0.29 ) * ( 0.75 + 0.35 * txNoise( txHit * vec2( 14.0, 5.0 ) + txS * 3.0 ) ) : txWc * 0.9;",
    "        txJ *= ( 0.85 + 0.3 * txNoise( ( txHit + txS * 2.3 ) * vec2( 45.0, 35.0 ) ) ) * mix( 1.0, 0.55, txS * txS );", // grimier towards the frame
    "        diffuseColor.rgb = mix( diffuseColor.rgb, txJ, txDetail );",
    "        txRevK = txDetail;",
    "        txMk = mix( txMk, vec4( 0.0 ), txDetail );",
    "      }",
    "    }",
    "  }",
    // fire-gutted stretches (world-anchored, a few storeys × a few bays, ~8 % of the atlas façades): the windows are
    // blown out and charred, soot plumes flare up from every window head over the spandrel into the storey above,
    // and a sooty film covers the stonework in between — breaks the repeated atlas tile on towers and reads as war damage
    "  if ( uTxGrid.z < 0.5 && uTxWinLvl < 3.5 ) {",
    "    float txBa = ( vTxW.x + vTxW.z ) * 0.05;",
    "    float txBz = smoothstep( 0.71, 0.79, txNoise( vec2( txBa, vTxW.y * 0.06 ) + 91.0 ) * 0.8 + txNoise( vec2( txBa * 3.3, vTxW.y * 0.23 ) + 17.0 ) * 0.2 );",
    "    if ( txBz > 0.001 ) {",
    "      vec2 txBc = floor( vMapUv * txGrid ); vec2 txBp = ( vMapUv * txGrid - txBc ) * 2.0 - 1.0;",
    "      float txAb = txBp.y - uTxWinRect.z;", // above this storey's window head …
    "      float txDa = txAb > 0.0 ? txAb : txBp.y < uTxWinRect.y ? txBp.y + 2.0 - uTxWinRect.z : -1.0;", // … or above the head of the window below
    "      float txWob = ( txNoise( vec2( txBp.y * 3.0, txBc.x * 7.1 + txBc.y * 3.3 ) ) - 0.5 ) * 0.35 * max( txDa, 0.0 );",
    "      float txHw = uTxWinRect.x * ( 0.9 + 0.75 * max( txDa, 0.0 ) ) + ( txNoise( txBp * vec2( 6.0, 2.0 ) + txBc * 5.3 ) - 0.5 ) * 0.25;",
    "      float txPl = step( 0.0, txDa ) * ( 1.0 - smoothstep( 0.0, 1.9, txDa ) ) * ( 1.0 - smoothstep( txHw * 0.55, txHw, abs( txBp.x + txWob ) ) );",
    "      float txSo = txBz * clamp( 0.3 + 0.85 * txPl * ( 0.75 + 0.5 * txNoise( txBp * vec2( 9.0, 3.0 ) + txBc * 3.1 ) ), 0.0, 0.93 );",
    "      diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * vec3( 0.13, 0.12, 0.11 ), txSo * ( 1.0 - txMk.r ) );",
    "      float txGb = txBz * step( 0.02, txMk.r );",
    "      txMk.rg = mix( txMk.rg, vec2( 1.0 ), txGb * step( 0.4, txBz ) ); txMk.b = max( txMk.b, txGb );",
    "    }",
    "  }",
    "  txWinM = txMk.r; txWinHole = txMk.g;",
    "  txWinLitK = vec3( mix( 1.0, 0.1, txDetail ) );", // glazing bars / frames of lit windows do not glow
    "  if ( txWinM > 0.004 && uTxWinLvl < 3.5 ) {",
    "    float txDet = txDUx.x * txDUy.y - txDUx.y * txDUy.x;",
    "    txDet = abs( txDet ) < 1e-14 ? 1e-14 : txDet;",
    "    vec3 txPu = ( txDPx * txDUy.y - txDPy * txDUx.y ) / txDet;", // view-space metres per unit U / V
    "    vec3 txPv = ( txDPy * txDUx.x - txDPx * txDUy.x ) / txDet;",
    "    float txLu = max( length( txPu ), 1e-4 ), txLv = max( length( txPv ), 1e-4 );",
    "    vec3 txN = normalize( cross( txPu, txPv ) );",
    "    vec3 txRdV = normalize( -vViewPosition );",
    "    if ( dot( txN, txRdV ) > 0.0 ) txN = -txN;",
    "    vec2 txU = txRecUv * txGrid; vec2 txCell = floor( vMapUv * txGrid ); vec2 txCu = clamp( txU - txCell, 0.0, 1.0 );",
    // per-window seed from the world position of the room cell centre (camera-independent)
    "    vec3 txCv = -vViewPosition + txPu * ( ( txCell.x + 0.5 ) / txGrid.x - vMapUv.x ) + txPv * ( ( txCell.y + 0.5 ) / txGrid.y - vMapUv.y );",
    "    vec3 txCw = ( vec4( txCv, 0.0 ) * viewMatrix ).xyz + cameraPosition;",
    "    vec3 txQ = floor( txCw * 0.1371 + 0.3183 );",
    "    float txSd = fract( sin( dot( txQ, vec3( 12.9898, 78.233, 37.719 ) ) + dot( txCell, vec2( 3.17, 11.3 ) ) ) * 43758.5453 );",
    // world-random pane damage: ~15 % of the glazed windows (more near the street) are blown out, keeping 0–2 jagged
    // shards in the corners. Keyed on the world cell, so repeated atlas tiles on towers stop repeating their glass.
    "    float txBrk = txWH( txSd, 31.0 ), txBrkP = 0.13 + 0.14 * ( 1.0 - smoothstep( 4.0, 14.0, txCw.y ) );",
    "    if ( txBrk < txBrkP && txWinHole < 0.5 ) {",
    "      vec2 txWq = vec2( ( uTxWinRect.w > 1.5 ? fract( txCu.x * 2.0 ) * 2.0 - 1.0 : txCu.x * 2.0 - 1.0 ) / uTxWinRect.x, ( txCu.y * 2.0 - 1.0 - uTxWinRect.y ) / max( uTxWinRect.z - uTxWinRect.y, 1e-3 ) );",
    "      float txS1 = txWH( txSd, 32.0 ), txS2 = txWH( txSd, 33.0 ), txJg = ( txNoise( txWq * 9.0 + txSd * 40.0 ) - 0.5 ) * 0.18;",
    "      float txShd = step( ( 1.0 + txWq.x ) / ( 0.35 + 0.9 * txS1 ) + ( 1.0 - txWq.y ) / ( 0.25 + 0.6 * txS2 ) + txJg, 1.0 ) * step( 0.35, txS1 );",
    "      txShd = max( txShd, step( ( 1.0 - txWq.x ) / ( 0.25 + 0.7 * txS2 ) + txWq.y / ( 0.18 + 0.45 * txS1 ) + txJg, 1.0 ) * step( 0.45, txS2 ) );",
    "      txShd = max( txShd, step( ( 1.0 + txWq.x ) / ( 0.2 + 0.5 * txS2 ) + txWq.y / ( 0.12 + 0.3 * txS1 ) - txJg, 1.0 ) * step( 0.8, fract( txS1 * 7.0 ) ) );",
    "      txWinHole = 1.0 - txShd * ( 1.0 - txWinHole );",
    "      if ( txBrk < txBrkP * 0.25 ) txMk.b = max( txMk.b, smoothstep( 0.3, 0.7, txNoise( txWq * 2.0 + txSd * 9.0 ) ) );", // some gutted by fire
    "    }",
    "    float txCellW = txLu / txGrid.x, txCellH = txLv / txGrid.y;",
    "    float txDepth = txCellW * ( 1.1 + 0.7 * txWH( txSd, 11.0 ) );",
    "    vec3 txRd = vec3( dot( txRdV, txPu ) / txLu / txCellW, dot( txRdV, txPv ) / txLv / txCellH, min( dot( txRdV, txN ), -1e-3 ) / txDepth );",
    "    float txCos = clamp( -dot( txRdV, txN ), 0.0, 1.0 );",
    "    float txDay = uTxWinEnv.x;",
    "    vec3 txLitK = vec3( 1.0 );",
    // light inside: the rooms are lit by the same sky / sun as the street (hemisphere average + ambient + a share of the sun
    // bouncing in), so they stay at ~0.35–0.5 of the outdoor level at noon, dim with dusk and are dark (but not black) at night
    "    vec3 txE = ambientLightColor;",
    "#if NUM_HEMI_LIGHTS > 0",
    "    for ( int txI = 0; txI < NUM_HEMI_LIGHTS; txI ++ ) txE += ( hemisphereLights[ txI ].skyColor + hemisphereLights[ txI ].groundColor ) * 0.5;",
    "#endif",
    "#if NUM_DIR_LIGHTS > 0",
    "    txE += directionalLights[ 0 ].color * ( 0.06 + 0.4 * max( dot( txN, directionalLights[ 0 ].direction ), 0.0 ) );",
    "#endif",
    // far windows (and the medium tier): a flat-lit room — per-window desaturated wall tone, darker towards the ceiling —
    // with the same mean brightness as the ray-cast room, so the hand-over is invisible and glass never goes black
    "    vec3 txWt = txWPal( txWH( txSd, 1.0 ) ); txWt = mix( vec3( dot( txWt, vec3( 0.3, 0.5, 0.2 ) ) ), txWt, 0.45 );",
    "    vec3 txRoom = txWt * ( 0.42 + 0.14 * ( 1.0 - txCu.y ) ) * ( 0.8 + 0.4 * txWH( txSd, 12.0 ) );",
    // full ray-cast rooms while a cell is ≥ ~11 px (fading out by ~6 px); the medium tier keeps them only on near windows (≥ ~40 px)
    "    float txRk = ( 1.0 - smoothstep( 0.09 * uTxQ.x, 0.17 * uTxQ.x, txFr ) ) * ( uTxWinLvl < 0.5 ? 1.0 : 1.0 - smoothstep( 0.018, 0.028, txFr ) ) * step( uTxWinLvl, 1.5 );",
    "    if ( txRk > 0.002 ) txRoom = mix( txRoom, txWRoom( txCu, txRd, txSd, uTxWinRect, txWinHole, txMk.b, 0.004 + txFr * 1.5, txDay, uTxWinEnv.y, txLitK ), txRk );",
    "    float txRefl = mix( 0.1, 0.8, pow( 1.0 - txCos, 4.0 ) ) * ( 1.0 - txWinHole );", // Fresnel share of the painted reflection
    "    float txTrans = ( 1.0 - txRefl ) * mix( 0.8, 1.0, txWinHole );",
    // the mask's glass value (≈0.72) means "clear pane": the painted glass (a fake sky gradient + highlight streak) is
    // replaced by the room and the analytic reflection; grime films / cracks keep a share of the paint
    "    float txWs = clamp( txWinM * 1.35, 0.0, 1.0 );",
    "    diffuseColor.rgb = mix( diffuseColor.rgb, diffuseColor.rgb * min( txRefl * 1.3, 1.0 ), txWs );",
    "    txWinRad = txRoom * txE * ( RECIPROCAL_PI * uTxWinK.x ) * txTrans * txWs;",
    // a few rooms are lit by a scavenger's lantern / fire at night (warm, gently flickering); the '@lit' façades
    // (settlements) have their own lamp-lit rooms through the emissive map
    "#ifndef USE_EMISSIVEMAP",
    "    float txLn = step( txWH( txSd, 51.0 ), uTxWinK.y ) * ( 1.0 - txDay ) * ( 1.0 - txMk.b );",
    "    if ( txLn > 0.001 ) { float txFl = 0.85 + 0.15 * sin( uTxWet.y * 7.3 + txSd * 40.0 ) * sin( uTxWet.y * 3.1 + txSd * 9.0 );",
    "      txWinRad += mix( vec3( 0.5 ), txLitK, txRk ) * vec3( 1.0, 0.5, 0.2 ) * ( uTxWinK.z * txFl * txLn ) * txTrans * txWinM; }",
    "#endif",
    "    txWinLitK = mix( vec3( 1.0 ), mix( vec3( 0.1 ), txLitK * mix( 0.8, 1.0, txWinHole ), txWinM ), txRk );",
    // Reflections in the glass: Schlick Fresnel against the live sky / skyline / street canyon (txSkyRefl). Old
    // cylinder glass is never flat: every pane is tilted a little and gently wavy (near windows only), so the
    // reflected skyline breaks up pane by pane like real old-world sashes. Grimy panes reflect less and blur the edges.
    "    if ( uTxWinLvl < 3.5 ) {",
    "      vec2 txPq = floor( txCu * vec2( 2.0, 3.0 ) );",
    "      float txPs = txWH( txSd + txPq.x * 0.37 + txPq.y * 0.71, 41.0 );",
    "      vec2 txTl = ( vec2( txPs, txWH( txPs, 42.0 ) ) - 0.5 ) * 0.06;",
    "      txTl += vec2( sin( txCu.y * 23.0 + txSd * 40.0 ), sin( txCu.x * 17.0 + txSd * 30.0 ) ) * 0.012;",
    "      vec3 txNr = normalize( txN + txDetail * ( txTl.x * txPu / txLu + txTl.y * txPv / txLv ) );",
    "      vec3 txRw = ( vec4( reflect( txRdV, txNr ), 0.0 ) * viewMatrix ).xyz;",
    "      float txGr = txWH( txSd, 43.0 );",
    // (F0 0.08: two glass surfaces + the dust film's sheen; ×1.8 artistic, like FO4's window cubemaps)
    "      float txF = min( ( 0.06 + 0.94 * pow( 1.0 - txCos, 5.0 ) ) * mix( 0.55, 1.0, txGr ) * 1.5, 1.0 );",
    "      float txGk = txWinM * ( 1.0 - txWinHole ) * uTxSkyK;",
    "      txWinRad += txSkyRefl( txRw, txCw, 0.012 + 0.05 * ( 1.0 - txGr ) + txFw * 0.05, txDetail ) * txF * txGk;",
    "      diffuseColor.rgb *= 1.0 - 0.5 * min( txGk * txF, 1.0 );", // what the glass reflects it does not also scatter
    "    }",
    "  }",
    "}",
  ].join("\n");
  const WIN_ROUGH = [
    "#include <roughnessmap_fragment>",
    "roughnessFactor = mix( roughnessFactor, mix( 0.2, 1.0, txWinHole ), clamp( txWinM * 1.4, 0.0, 1.0 ) );",
  ].join("\n");
  const WIN_EMIS = [
    "#include <emissivemap_fragment>",
    "#ifdef USE_EMISSIVEMAP",
    "totalEmissiveRadiance *= txWinLitK;",
    "#endif",
    "totalEmissiveRadiance += txWinRad;",
  ].join("\n");
  // Bump from the procedural wall height (screen-space derivatives, same maths as three's bump map) on top of the atlas normal map.
  const WALL_NORMAL = [
    "#include <normal_fragment_maps>",
    "{ vec3 txSx = dFdx( -vViewPosition ), txSy = dFdy( -vViewPosition );",
    "  vec3 txR1 = cross( txSy, normal ), txR2 = cross( normal, txSx );",
    "  float txFD = dot( txSx, txR1 ) * faceDirection;",
    "  vec3 txGr = sign( txFD ) * ( txDH.x * txR1 + txDH.y * txR2 );",
    "  if ( txWallN > 0.001 ) normal = normalize( mix( normal, normalize( abs( txFD ) * normal - txGr ), txWallN ) ); }",
    "if ( txRevK > 0.001 ) normal = normalize( mix( normal, txRevN, txRevK ) );",
  ].join("\n");
  X.winCount = 0;
  // interior-mapping tuning (shared by every façade program): x room brightness gain, y share of lantern-lit rooms at night,
  // z lantern level. Live-tunable without recompiles: G._tx.winK.value.set(...)
  const WIN_K = { value: new THREE.Vector3(2.6, 0.08, 1.3) };
  X.winK = WIN_K;
  // Shared sky uniforms for the glass reflections (linear colours, like the atmosphere's sky dome). Defaults = hazy noon.
  const SKY = {
    z: { value: new THREE.Color(0.3, 0.36, 0.3) },
    h: { value: new THREE.Color(0.52, 0.53, 0.42) },
    g: { value: new THREE.Vector4(0.7, 0.6, 0.4, 0) },
    sd: { value: new THREE.Vector4(0.3, 0.8, 0.4, 1).normalize() },
    sc: { value: new THREE.Color(1.0, 0.92, 0.75) },
    k: { value: 1 },
  };
  SKY.sd.value.w = 1;
  X.sky = SKY;
  // dev: ?txrefl=0 switches the glass reflections off, ?txrefl=2 doubles them (A/B screenshots, no recompile)
  const SKY_DEV = (() => {
    const q = G.QS && G.QS.get && G.QS.get("txrefl");
    const v = q === null || q === undefined || q === "" ? 1 : +q;
    return isFinite(v) ? Math.max(0, v) : 1;
  })();
  const _skyGrey = new THREE.Color();
  /** Copy the atmosphere's live sky (zenith / horizon / glow / sun) into the reflection uniforms; keep defaults without it. */
  function updateSky() {
    let env = null;
    try {
      if (!G.isStub("atmos") && typeof G.atmos.getEnv === "function")
        env = G.atmos.getEnv();
    } catch (e) {
      env = null;
    }
    if (!env || !env.zenith || !env.horizon) return;
    const night = isFinite(env.night)
      ? Math.max(0, Math.min(1, env.night))
      : curNight;
    SKY.z.value.copy(env.zenith);
    SKY.h.value.copy(env.horizon);
    // a lightning flash lights the whole sky for a frame: the glass flashes with it
    if (env.flash > 0 && env.flashColor) {
      _skyGrey
        .copy(env.flashColor)
        .multiplyScalar(Math.min(1, env.flash) * 0.6);
      SKY.z.value.add(_skyGrey);
      SKY.h.value.add(_skyGrey);
    }
    const gl = env.glow || env.horizon;
    SKY.g.value.set(gl.r, gl.g, gl.b, night);
    const sy = env.sunDir ? env.sunDir.y : 0.5;
    const vis = env.interior
      ? 0
      : Math.max(0, Math.min(1, (sy + 0.06) / 0.08)) *
        (isFinite(env.sunSize) ? env.sunSize : 1);
    if (env.sunDir)
      SKY.sd.value.set(env.sunDir.x, env.sunDir.y, env.sunDir.z, vis);
    if (env.lightColor)
      SKY.sc.value
        .copy(env.lightColor)
        .multiplyScalar(0.55 + 0.45 * Math.min(1, (env.lightInt || 2) / 2.5));
    SKY.k.value = (env.interior ? 0.35 : 1) * SKY_DEV;
    const ek = uTxEnvK.value,
      cl = (v) => Math.max(0.05, Math.min(1.4, v));
    ek.setRGB(
      cl(SKY.h.value.r / ENV_H0.r),
      cl(SKY.h.value.g / ENV_H0.g),
      cl(SKY.h.value.b / ENV_H0.b),
    );
    if (env.interior) ek.multiplyScalar(0.4);
  }
  /** Interior-mapping patch for façade materials (after macroPatch, which provides vTxW + txNoise). */
  function winPatch(mat, shader, win) {
    const rect = win.rect,
      pg = win.proc;
    shader.uniforms.uTxWinMask = { value: win.mask };
    shader.uniforms.uTxWinRect = {
      value: new THREE.Vector4(rect[0], rect[1], rect[2], rect[3]),
    };
    let ws = null;
    try {
      ws =
        !pg && X.facadeWallSpec ? X.facadeWallSpec(mat.userData.txWin) : null;
    } catch (e) {
      ws = null;
    }
    shader.uniforms.uTxWall = {
      value: ws
        ? new THREE.Vector4(ws.a[0], ws.a[1], ws.a[2], ws.a[3])
        : new THREE.Vector4(0, 1, 1, 0),
    };
    shader.uniforms.uTxWall2 = {
      value: ws
        ? new THREE.Vector4(ws.b[0], ws.b[1], ws.b[2], ws.b[3])
        : new THREE.Vector4(0, 0, 0, 0),
    };
    const rec = /^facade_([a-z]+)_/.exec(mat.userData.txWin || "");
    // glass set back behind the wall face (m): NYC masonry walls are 30–60 cm thick, sashes sit 20–30 cm in
    shader.uniforms.uTxRecess = {
      value: pg
        ? +pg.recess || 0
        : rec
          ? { tenement: 0.24, brownstone: 0.28, artdeco: 0.2, warehouse: 0.22 }[
              rec[1]
            ] || 0
          : 0,
    };
    shader.uniforms.uTxGrid = {
      value: pg
        ? new THREE.Vector4(pg.cells[0], pg.cells[1], 1, 0)
        : new THREE.Vector4(4, 6, 0, 0),
    };
    shader.uniforms.uTxProc = {
      value: pg
        ? new THREE.Vector4(pg.mullions, pg.transom, pg.bar, pg.lit ? 1 : 0)
        : new THREE.Vector4(0, -9, 0, 0),
    };
    const lin = (hex, srgb) => {
      const c = new THREE.Color();
      c.setHex(hex, srgb ? THREE.SRGBColorSpace : THREE.LinearSRGBColorSpace);
      return new THREE.Vector3(c.r, c.g, c.b);
    };
    const srgbMap = !!(mat.map && mat.map.colorSpace === THREE.SRGBColorSpace);
    shader.uniforms.uTxProcG = {
      value: pg ? lin(pg.glass, srgbMap) : new THREE.Vector3(0.1, 0.1, 0.1),
    };
    shader.uniforms.uTxProcL = {
      value: pg && pg.lit ? lin(pg.lit, srgbMap) : new THREE.Vector3(1, 1, 1),
    };
    const env = new THREE.Vector2(
      1,
      pg ? (pg.office ? 1 : 0) : /office/.test(mat.userData.txWin) ? 1 : 0,
    );
    shader.uniforms.uTxWinEnv = {
      get value() {
        env.x = 1 - curNight;
        return env;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxWinK = WIN_K; // shared: room gain / night lanterns (X.winK, live-tunable)
    let fs = shader.fragmentShader.replace(
      MACRO_FRAG_PARS,
      MACRO_FRAG_PARS + "\n" + WIN_FRAG_PARS + failTest("win"),
    );
    fs = fs.replace(
      "void main() {",
      "void main() {\n  vec3 txWinRad = vec3( 0.0 ); float txWinM = 0.0, txWinHole = 0.0; vec3 txWinLitK = vec3( 1.0 ); vec2 txDH = vec2( 0.0 ); float txWallN = 0.0; vec3 txRevN = vec3( 0.0, 0.0, 1.0 ); float txRevK = 0.0;",
    );
    fs = fs.replace("#include <normal_fragment_maps>", WALL_NORMAL);
    fs = fs.replace(MACRO_FRAG, MACRO_FRAG + "\n" + WIN_FRAG);
    fs = fs.replace("#include <roughnessmap_fragment>", WIN_ROUGH);
    fs = fs.replace("#include <emissivemap_fragment>", WIN_EMIS);
    if (X.winDebug)
      fs = fs.replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\n" + X.winDebug,
      ); // dev: GLSL override, e.g. 'gl_FragColor = vec4( txWinRad * 6.0, 1.0 );'
    // dev (perf A/B in one session, X.perfLvl): 1 no rooms, 2 + no wall detail, 3 + no recess / reveals, 4 + no window branch
    // + the live perf tier (quality setting / dynamic resolution): tier 2 drops the room ray-cast (no recompile)
    shader.uniforms.uTxWinLvl = {
      get value() {
        return Math.max(X.perfLvl || 0, Q.winLvl);
      },
      set value(v) {
        /* read-only */
      },
    };
    // live sky for the glass reflections (shared objects, written once per frame in updateSky)
    shader.uniforms.uTxSkyZ = SKY.z;
    shader.uniforms.uTxSkyH = SKY.h;
    shader.uniforms.uTxSunC = SKY.sc;
    shader.uniforms.uTxSkyG = SKY.g;
    shader.uniforms.uTxSunD = SKY.sd;
    shader.uniforms.uTxSkyK = SKY.k;
    shader.fragmentShader = fs;
  }
  /** Mask texture + window rect for a material tagged userData.txWin (façade name), or null. */
  let dummyMask = null;
  function winInfo(mat) {
    const g = mat.userData && mat.userData.txWinGrid;
    if (g && mat.map && winOK()) {
      if (!dummyMask) {
        dummyMask = new THREE.DataTexture(new Uint8Array(4), 1, 1);
        dummyMask.needsUpdate = true;
      }
      return { mask: dummyMask, rect: g.rect, proc: g };
    }
    const n = mat.userData && mat.userData.txWin;
    if (!n || !mat.map || !X.facadeMask || !winOK()) return null;
    let mask = null,
      rect = null;
    try {
      mask = X.facadeMask(n);
      rect = X.facadeWinRect(n);
    } catch (e) {
      return null;
    }
    return mask && rect ? { mask, rect } : null;
  }
  let winSupport = null;
  function winOK() {
    if (winSupport === null) {
      try {
        winSupport =
          !G.renderer ||
          !G.renderer.capabilities ||
          G.renderer.capabilities.isWebGL2 !== false;
      } catch (e) {
        winSupport = false;
      }
      if (G.QS && G.QS.get && G.QS.get("txwin") === "0") winSupport = false; // dev: A/B the façade shader (perf)
    }
    return winSupport;
  }
  X.macroCount = 0;
  /**
   * Inject the macro-variation code. Uniform values are live getters on userData, so changing
   * mat.userData.txMacro / txBand later takes effect without a recompile.
   */
  function macroPatch(mat, shader) {
    shader.uniforms.uTxMacro = {
      get value() {
        return (mat.userData && +mat.userData.txMacro) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxBand = {
      get value() {
        return (mat.userData && +mat.userData.txBand) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxGround = {
      get value() {
        return (mat.userData && +mat.userData.txGround) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxBrick = {
      get value() {
        return (mat.userData && +mat.userData.txBrick) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    shader.uniforms.uTxQ = uTxQ; // shared object: one live quality vector for every patched program
    shader.uniforms.uTxWet = uTxWet; // shared: rain wetness + time + falling rain
    shader.uniforms.uTxDetail = {
      get value() {
        return DETAIL_OFF ? 0 : (mat.userData && +mat.userData.txDetail) || 0;
      },
      set value(v) {
        /* read-only */
      },
    };
    // live sky for the standing-water reflections (the same shared objects the façade glass uses)
    shader.uniforms.uTxSkyZ = SKY.z;
    shader.uniforms.uTxSkyH = SKY.h;
    shader.uniforms.uTxSunC = SKY.sc;
    shader.uniforms.uTxSkyG = SKY.g;
    shader.uniforms.uTxSunD = SKY.sd;
    shader.uniforms.uTxSkyK = SKY.k;
    shader.vertexShader =
      "varying vec3 vTxW;\n" +
      shader.vertexShader.replace("#include <project_vertex>", MACRO_VERT);
    shader.fragmentShader =
      MACRO_FRAG_PARS +
      failTest("macro") +
      "\n" +
      shader.fragmentShader
        .replace("#include <map_fragment>", MACRO_FRAG)
        .replace(
          "void main() {",
          "void main() {\n  vec2 txBDH = vec2( 0.0 ); float txDustK = 0.0, txWetK = 0.0, txPudW = 0.0, txDetR = 0.0; vec3 txPudRad = vec3( 0.0 ), txPudN = vec3( 0.0, 1.0, 0.0 ), txDetG = vec3( 0.0 );",
        )
        .replace("#include <normal_fragment_maps>", MACRO_NORMAL)
        .replace("#include <roughnessmap_fragment>", MACRO_ROUGH)
        .replace("#include <emissivemap_fragment>", MACRO_EMIS)
        .replace("#include <opaque_fragment>", MACRO_OPQ);
    if (MACRO_DBG)
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        "#include <dithering_fragment>\n" + MACRO_DBG,
      );
  }
  // dev: ?txdet=0 switches the close-range detail layer off (A/B screenshots, no recompile)
  const DETAIL_OFF = !!(G.QS && G.QS.get && G.QS.get("txdet") === "0");
  // dev: ?txdbg=wet|dust shows the rain / dust layer weights of the macro shader in false colour
  const MACRO_DBG = (() => {
    const q = G.QS && G.QS.get && G.QS.get("txdbg");
    return q === "wet"
      ? "gl_FragColor = vec4( txWetK, uTxWet.x, 0.0, 1.0 );"
      : q === "dust"
        ? "gl_FragColor = vec4( txDustK, 0.0, 0.0, 1.0 );"
        : "";
  })();

  // ------------------------------------------------------------------
  // Neon / fire flicker in the shader, per OBJECT (not per shared material)
  // ------------------------------------------------------------------
  // Every sign that shares G.mats.get('neon_red') used to dim in lock-step (the CPU wrote one emissiveIntensity per
  // material). The phase now comes from the object's world origin (instance origin for InstancedMesh), so one shared
  // material gives every sign its own tube behaviour: most hum steadily with a faint breathing, ~30 % are faulty and
  // stutter in short 18 Hz on/off bursts every few seconds, ~6 % are dying (dark, with rare sputters). Fire (mode 1)
  // gets a smooth, non-periodic flame flicker instead. The CPU only writes the day/night base intensity.
  const uTxTime = { value: 0 };
  const uTxWet = { value: new THREE.Vector4(0, 0, 0, 0) }; // x: wetness (G.atmos.wetness(), outdoors), y: time for running water, z: falling rain
  // dev: ?txwet=0..1 overrides the wetness the façade rain layer sees (A/B screenshots)
  const WET_DEV = (() => {
    const q = G.QS && G.QS.get && G.QS.get("txwet");
    const v = q === null || q === undefined || q === "" ? -1 : +q;
    return isFinite(v) ? v : -1;
  })();
  // dev: ?txfail=win|macro|flk plants a compile error in that patch to exercise the driver fallback (installShaderGuard)
  const FAILTEST = (G.QS && G.QS.get && G.QS.get("txfail")) || "";
  const failTest = (k) => (FAILTEST === k ? "\n#error txfail test\n" : "");
  // The seed is the object's world origin (instance origin) plus the ~2.2 m world cell of the fragment: signs merged into
  // one static batch (all geometry in world space, origin 0,0,0) no longer flicker in lock-step, and big signs behave like
  // real ones — each run of tubes (its own transformer) hums, stutters or dies on its own.
  const FLK_VERT = [
    "#include <project_vertex>",
    "{ vec4 txO = vec4( 0.0, 0.0, 0.0, 1.0 ); vec4 txP = vec4( transformed, 1.0 );",
    "#ifdef USE_INSTANCING",
    "  txO = instanceMatrix * txO; txP = instanceMatrix * txP;",
    "#endif",
    "  vTxFk = ( modelMatrix * txO ).xyz; vTxFkP = ( modelMatrix * txP ).xyz; }",
  ].join("\n");
  const FLK_FRAG_PARS = [
    "varying vec3 vTxFk;",
    "varying vec3 vTxFkP;",
    "uniform float uTxTime;",
    "uniform float uTxFkMode;",
    "float txFkH( float n ) { return fract( sin( n ) * 43758.5453 ); }",
    "float txFlicker( vec3 o, float t ) {",
    "  float s = fract( sin( dot( floor( o * 2.0 + 0.5 ), vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );",
    "  if ( uTxFkMode > 0.5 ) {", // fire: layered, never periodic
    "    float f = sin( t * 9.1 + s * 30.0 ) * 0.5 + sin( t * 15.7 + s * 11.0 ) * 0.3 + sin( t * 23.3 + s * 57.0 ) * 0.2;",
    "    return 0.9 + 0.14 * f + 0.1 * ( txFkH( floor( t * 11.0 ) + s * 7.0 ) - 0.5 ); }",
    "  float v = 0.955 + 0.03 * sin( t * ( 1.3 + 1.7 * s ) + s * 40.0 ) + 0.015 * sin( t * 31.0 + s * 90.0 );", // healthy hum
    "  float per = 3.0 + 9.0 * txFkH( s * 17.0 );",
    "  float cyc = t / per + s * 7.0; float ci = floor( cyc ), cf = fract( cyc ) * per;",
    "  float burst = step( cf, 0.2 + 0.9 * txFkH( ci + s * 13.0 ) ) * step( s, 0.3 ) * step( 0.35, txFkH( ci * 1.7 + s ) );",
    "  v = mix( v, mix( 0.1, 1.0, step( 0.45, txFkH( floor( t * 18.0 ) + s * 31.0 ) ) ), burst );",
    "  if ( s > 0.94 ) v = mix( 0.05, 0.85, step( 0.75, txFkH( floor( t * 9.0 ) + s * 5.0 ) ) * step( 0.6, sin( t * 0.7 + s * 20.0 ) ) );",
    "  return v; }",
  ].join("\n");
  const FLK_EMIS = [
    "#include <emissivemap_fragment>",
    "totalEmissiveRadiance *= txFlicker( vTxFk + floor( vTxFkP / 2.2 ) * 1.37, uTxTime );",
  ].join("\n");
  const flkPatched = new WeakSet();
  function flkPatch(mat, shader) {
    shader.uniforms.uTxTime = uTxTime;
    const fire =
      /fire|flame|burn/i.test(mat.name || "") ||
      !!(mat.userData.txGlow && mat.userData.txGlow.fire);
    shader.uniforms.uTxFkMode = { value: fire ? 1 : 0 };
    shader.vertexShader =
      "varying vec3 vTxFk;\nvarying vec3 vTxFkP;\n" +
      shader.vertexShader.replace("#include <project_vertex>", FLK_VERT);
    shader.fragmentShader =
      FLK_FRAG_PARS +
      failTest("flk") +
      "\n" +
      shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        FLK_EMIS,
      );
    flkPatched.add(mat);
  }

  // ------------------------------------------------------------------
  // Procedural env map follows the time of day
  // ------------------------------------------------------------------
  // X.envMap() is one static hazy-noon city panorama: chrome, glass, steel and paints used to reflect a bright daytime sky
  // at midnight and inside the bunkers. The image-based part of their lighting (radiance + irradiance from the env map,
  // nothing else) is scaled by the live sky: uTxEnvK = atmosphere horizon colour / the panorama's noon horizon (dusk turns
  // it amber, night nearly black, lightning flashes it), × 0.4 indoors. One shared uniform, no per-material CPU work.
  const uTxEnvK = { value: new THREE.Color(1, 1, 1) };
  const ENV_H0 = new THREE.Color(0.52, 0.53, 0.42);
  const ENV_FRAG = [
    "#include <lights_fragment_maps>",
    "#if defined( USE_ENVMAP ) && defined( RE_IndirectDiffuse )",
    "iblIrradiance *= uTxEnvK;",
    "#endif",
    "#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )",
    "radiance *= uTxEnvK;",
    "#endif",
  ].join("\n");
  function envOurs(m) {
    return !!(envTex && m.envMap && m.envMap === envTex);
  }
  function envPatch(shader) {
    shader.uniforms.uTxEnvK = uTxEnvK;
    shader.fragmentShader =
      "uniform vec3 uTxEnvK;\n" +
      shader.fragmentShader.replace(
        "#include <lights_fragment_maps>",
        ENV_FRAG,
      );
  }

  // ------------------------------------------------------------------
  // Quality tiers + shader-failure fallback
  // ------------------------------------------------------------------
  // Compile level (program key): quality 'low' drops the macro / façade / dust patches entirely (recompile once when the
  // setting changes). Uniform level (no recompile): the live perf tier (quality + dynamic resolution, G.atmos.perfTier)
  // narrows the window-detail radius (tier 1) or removes the room ray-cast and dust (tier 2).
  const Q = { low: false, tier: 0, winLvl: 0, quality: "" };
  const uTxQ = { value: new THREE.Vector4(1, 0, 1, 1) };
  const fail = { macro: false, win: false, flk: false, env: false };
  X.shaderFallback = fail;
  function readQuality() {
    let q = "high",
      t = 0;
    try {
      if (!G.isStub("atmos")) {
        if (typeof G.atmos.quality === "string") q = G.atmos.quality;
        if (typeof G.atmos.perfTier === "number" && G.atmos.perfTier > 0)
          t = G.atmos.perfTier;
      }
    } catch (e) {
      /* defaults */
    }
    if (G.QS && G.QS.get && G.QS.get("txq")) q = G.QS.get("txq"); // dev: ?txq=low|medium|high
    if (q === "low") t = Math.max(t, 2);
    else if (q === "medium") t = Math.max(t, 1);
    // medium quality: flat dim rooms (no ray-cast / parallax) and no relief layers (brick bump, façade wall relief,
    // close-range detail normals); dynamic-resolution pressure on high (tier 1) keeps the rooms on nearer windows only
    // and drops the relief; tier 2 (low / heavy pressure) also drops the dust layer
    Q.tier = t;
    Q.winLvl = t >= 2 || q === "medium" ? 1 : 0;
    uTxQ.value.set(
      t >= 2 ? 0.45 : t >= 1 ? 0.65 : 1,
      Q.winLvl,
      t >= 2 ? 0 : 1,
      t >= 1 ? 0 : 1,
    );
    if (q !== Q.quality) {
      const wasLow = Q.low;
      Q.quality = q;
      Q.low = q === "low";
      if (wasLow !== Q.low) recompileAll("quality " + q);
    }
  }
  X.quality = Q;
  function isTxHook(f) {
    return f === txCompile || !!(f && f.txChain);
  }
  /** Force every material carrying our hook to rebuild its program (its key changed: quality or a fallback). */
  function recompileAll(why) {
    let n = 0;
    const hit = (m) => {
      if (m && isTxHook(m.onBeforeCompile)) {
        m.needsUpdate = true;
        n++;
      }
    };
    try {
      if (G.scene)
        G.scene.traverse((o) => {
          const m = o.material;
          if (!m) return;
          if (Array.isArray(m)) m.forEach(hit);
          else hit(m);
        });
    } catch (e) {
      /* scene mid-rebuild */
    }
    matCache.forEach(hit);
    if (why && G.DEBUG)
      console.log("[textures] recompiled " + n + " materials (" + why + ")");
    return n;
  }
  /**
   * three.js calls renderer.debug.onShaderError(gl, program, vs, fs) when a program fails to link. If the failing
   * source carries one of our patches, disable that patch (façade → macro → flicker, most specific first), rebuild
   * the programs without it and warn once — the city renders unpatched instead of black/missing on that driver.
   * Anybody else's failure is logged exactly like three's default (and passed to a previous handler, if any).
   */
  function installShaderGuard() {
    const r = G.renderer;
    if (!r || !r.debug || r.debug.txGuard) return;
    const prev =
      typeof r.debug.onShaderError === "function"
        ? r.debug.onShaderError
        : null;
    r.debug.onShaderError = function (gl, program, vs, fs) {
      let src = "";
      try {
        src = gl.getShaderSource(fs) || "";
      } catch (e) {
        src = "";
      }
      const which = /uTxWinMask/.test(src)
        ? "win"
        : /uTxMacro/.test(src)
          ? "macro"
          : /uTxFkMode/.test(src)
            ? "flk"
            : /uTxEnvK/.test(src)
              ? "env"
              : null;
      let log = "";
      try {
        log =
          "Program Info Log: " +
          gl.getProgramInfoLog(program) +
          "\nVERTEX: " +
          gl.getShaderInfoLog(vs) +
          "\nFRAGMENT: " +
          gl.getShaderInfoLog(fs);
      } catch (e) {
        log = String(e);
      }
      if (which && !fail[which]) {
        fail[which] = true;
        if (which === "macro") fail.win = true; // the façade patch builds on the macro one
        console.warn(
          "[textures] " +
            which +
            " shader patch failed to compile on this GPU — falling back to plain materials.\n" +
            log.slice(0, 1200),
        );
        setTimeout(() => recompileAll("fallback " + which), 0);
        return;
      }
      if (which) return; // already falling back: this is a straggler of the same failure
      if (prev) {
        try {
          prev.call(this, gl, program, vs, fs);
          return;
        } catch (e) {
          /* fall through */
        }
      }
      let err = 0;
      try {
        err = gl.getError();
      } catch (e) {
        /* ignore */
      }
      console.error(
        "THREE.WebGLProgram: Shader Error " +
          err +
          " - VALIDATE_STATUS " +
          gl.getProgramParameter(program, gl.VALIDATE_STATUS) +
          "\n\n" +
          log,
      );
    };
    r.debug.txGuard = true;
  }
  /**
   * onBeforeCompile hook shared by every material this module builds AND by every clone of them
   * (installed in the TxStandardMaterial constructor, so `mat.clone()` inherits it with no scan and
   * no later recompile). Runs once per material when three.js first builds its program, i.e. the
   * first time it is actually rendered — the right moment to register it with the night-glow driver.
   */
  function txCompile(shader) {
    const ud = this.userData || {};
    if (ud.txGlow && !seenMats.has(this)) {
      seenMats.add(this);
      addGlow(this);
    }
    const k = txVariant(this);
    if (k.macro) {
      macroPatch(this, shader);
      X.macroCount++;
      if (k.win) {
        const win = winInfo(this);
        if (win) {
          winPatch(this, shader, win);
          X.winCount++;
        }
      }
    }
    if (k.flk) flkPatch(this, shader);
    else flkPatched.delete(this);
    if (k.env) envPatch(shader);
  }
  /** Which patches this material gets right now (quality tier, driver fallbacks, tags). */
  function txVariant(m) {
    const ud = m.userData || {};
    const hasMap = !!m.map;
    const win =
      hasMap && !Q.low && !fail.win && !!(ud.txWin || ud.txWinGrid) && winOK();
    const macro = hasMap && !Q.low && !fail.macro && (!!ud.txMacro || win);
    const flk = !fail.flk && !!(ud.txGlow && ud.txGlow.f);
    const env = !fail.env && envOurs(m);
    return { macro, win, flk, env };
  }
  // Few program variants (so clones share programs with their originals): plain / macro / façade, × flicker.
  function txKeyOf(m) {
    const k = txVariant(m);
    return (
      (k.win ? "txWin2" : k.macro ? "txMacro4" : "tx0") +
      (k.flk ? "F" : "") +
      (k.env ? "E" : "")
    );
  }
  // If another module replaces onBeforeCompile on a clone (its own shader patch), fall back to three's default key
  // (the function source) so its program can never be confused with ours.
  function txKey() {
    if (this.onBeforeCompile !== txCompile) return String(this.onBeforeCompile);
    return txKeyOf(this);
  }

  /**
   * MeshStandardMaterial whose clones keep the texture module's compile hook.
   * (Material.copy copies userData but not callbacks; the constructor re-installs them.)
   */
  class TxStandardMaterial extends THREE.MeshStandardMaterial {
    constructor(params) {
      super(params);
      this.onBeforeCompile = txCompile;
      this.customProgramCacheKey = txKey;
    }
  }
  X.TxStandardMaterial = TxStandardMaterial;
  const StdMat = TxStandardMaterial;

  /** Foreign material (not built here): install the hook if it has none of its own. */
  function addMacro(mat, recompile) {
    if (!mat.isMeshStandardMaterial) return;
    if (isTxHook(mat.onBeforeCompile)) return;
    if (mat.onBeforeCompile !== protoOBC) return; // never clobber someone else's patch (they can opt in: G.mats.chainCompile)
    mat.onBeforeCompile = txCompile;
    mat.customProgramCacheKey = txKey;
    if (recompile) mat.needsUpdate = true;
  }

  /** Register one material (shared or clone): glow driver + macro patch, once. */
  function track(mat, recompile) {
    if (!mat || !mat.isMaterial || seenMats.has(mat)) return mat;
    const ud = mat.userData || {};
    if (ud.txGlow) {
      seenMats.add(mat);
      addGlow(mat);
    }
    if (ud.txMacro || (ud.txGlow && ud.txGlow.f)) addMacro(mat, recompile); // flicker-only materials get the hook too
    return mat;
  }
  /**
   * Walk the scene for tagged materials that did NOT come from TxStandardMaterial (e.g. somebody did
   * `new MeshStandardMaterial().copy(ours)`). withMacro=true only at load time (initDone/newGame),
   * because installing the patch on an already-compiled material forces a recompile.
   */
  function scanVisit(m, withMacro) {
    if (!m || seenMats.has(m) || isTxHook(m.onBeforeCompile)) return;
    const ud = m.userData;
    if (!ud || !(ud.txGlow || ud.txMacro)) return;
    if (ud.txGlow) {
      seenMats.add(m);
      addGlow(m);
    }
    if (withMacro && (ud.txMacro || (ud.txGlow && ud.txGlow.f)))
      addMacro(m, true);
  }
  function scanScene(withMacro) {
    if (!G.scene) return;
    G.scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      if (Array.isArray(m)) {
        for (const mm of m) scanVisit(mm, withMacro);
      } else scanVisit(m, withMacro);
    });
  }
  /**
   * Periodic discovery sweep, time-sliced: ONE walk does both the foreign-clone scan and the automatic window-grid
   * detection, a slice of <= budget ms per frame (no 12 s hitch of two full traversals + readbacks), and skips
   * invisible subtrees (hidden interior roots are picked up by the first sweep after they are shown).
   */
  let sweep = null;
  X.sweepStats = { runs: 0, maxMs: 0, frames: 0 };
  function sweepStep(budgetMs) {
    if (!sweep) {
      if (!G.scene) return true;
      sweep = {
        stack: [G.scene],
        auto: winOK() && !autoOff && !Q.low,
        frames: 0,
      };
    }
    const t0 = now(),
      st = sweep.stack;
    sweep.frames++;
    while (st.length) {
      const o = st.pop();
      if (!o || (o !== G.scene && o.visible === false)) continue;
      const m = o.material;
      if (m) {
        const list = Array.isArray(m) ? m : null;
        if (list) {
          for (const mm of list) {
            scanVisit(mm, false);
            if (sweep.auto) autoVisit(mm, o, true);
          }
        } else {
          scanVisit(m, false);
          if (sweep.auto) autoVisit(m, o, true);
        }
      }
      const ch = o.children;
      if (ch) for (let i = ch.length - 1; i >= 0; i--) st.push(ch[i]);
      if (now() - t0 > budgetMs) break;
    }
    const dt = now() - t0;
    if (dt > X.sweepStats.maxMs) X.sweepStats.maxMs = +dt.toFixed(2);
    if (st.length) return false;
    X.sweepStats.runs++;
    X.sweepStats.frames = sweep.frames;
    sweep = null;
    return true;
  }

  // ==================================================================
  // Materials
  // ==================================================================
  const matCache = new Map();

  // Named special materials (no texture of the same name, or custom params)
  const NEON_COLORS = {
    red: 0xff2a2a,
    green: 0x39ff5a,
    blue: 0x3a7bff,
    pink: 0xff3fa8,
    yellow: 0xffe24a,
    orange: 0xff8a1f,
    white: 0xfff4e0,
    cyan: 0x3afcff,
    purple: 0xb14aff,
    teal: 0x22e0c0,
    magenta: 0xff2ad4,
    amber: 0xffb020,
  };
  X.NEON_COLORS = NEON_COLORS;
  const PAINTS = {
    red: "#9c2a22",
    teal: "#3e8a86",
    cream: "#d9cfae",
    yellow: "#d3a82c",
    blue: "#2f5a8c",
    green: "#4f6b3a",
    black: "#1e1e1e",
    white: "#d8d6cc",
    orange: "#c4622a",
    mint: "#8fc7a8",
    pink: "#d58a93",
    olive: "#5a5a36",
    grey: "#7c7f7c",
    brown: "#5c4030",
    navy: "#1f2f4c",
    cryo_grey: "#c4c9ca",
    cryo_orange: "#e0702a",
    fizzo_red: "#b3201c",
    army: "#4d5238",
  };
  X.PAINTS = PAINTS;

  function specialSpec(name) {
    // neon_<color> or neon_<hex>
    let m = /^neon_(.+)$/.exec(name);
    if (m) {
      const c =
        NEON_COLORS[m[1]] !== undefined
          ? NEON_COLORS[m[1]]
          : /^[0-9a-f]{6}$/i.test(m[1])
            ? parseInt(m[1], 16)
            : 0xff3366;
      const col = new THREE.Color(c);
      return {
        type: "neon",
        params: {
          color: col.clone().multiplyScalar(0.4),
          emissive: col,
          emissiveIntensity: 2.6,
          roughness: 0.35,
          metalness: 0,
        },
        night: [1.5, 3.6],
        flicker: true,
      };
    }
    switch (name) {
      case "glass":
        return {
          params: {
            color: 0x6f8886,
            roughness: 0.08,
            metalness: 0.6,
            transparent: true,
            opacity: 0.38,
            envMapIntensity: 1.2,
            depthWrite: false,
            map: "glass_dirty",
          },
          env: true,
        };
      case "glass_clean":
        return {
          params: {
            color: 0x9fb8b6,
            roughness: 0.03,
            metalness: 0.7,
            transparent: true,
            opacity: 0.25,
            envMapIntensity: 1.4,
            depthWrite: false,
          },
          env: true,
        };
      case "glass_broken":
        return {
          params: {
            color: 0x3c4744,
            roughness: 0.2,
            metalness: 0.5,
            transparent: true,
            opacity: 0.55,
            map: "glass_dirty",
            depthWrite: false,
          },
          env: true,
        };
      case "glass_green":
        return {
          params: {
            color: 0x3f7a4a,
            roughness: 0.1,
            metalness: 0.3,
            transparent: true,
            opacity: 0.6,
            envMapIntensity: 1,
          },
          env: true,
        };
      case "emissive_window":
        return {
          params: {
            color: 0x3a2a14,
            map: "window_lit",
            emissiveMap: "window_lit",
            emissive: 0xffc070,
            emissiveIntensity: 1.3,
            roughness: 0.5,
          },
          night: [0.35, 2.0],
        };
      case "window_dark":
        return {
          params: {
            color: 0x1a1d1c,
            roughness: 0.15,
            metalness: 0.6,
            envMapIntensity: 0.9,
          },
          env: true,
        };
      case "blood":
        return { params: { color: 0x5a0a08, roughness: 0.25, metalness: 0.1 } };
      case "blood_green":
        return {
          params: {
            color: 0x3a5a10,
            roughness: 0.25,
            metalness: 0.1,
            emissive: 0x1a3a05,
            emissiveIntensity: 0.3,
          },
        };
      case "cryo_grey":
        return {
          params: {
            color: 0xffffff,
            map: "paint_cryo_grey",
            roughness: 0.5,
            metalness: 0.3,
            normalMap: "metal_panel",
          },
        };
      case "cryo_orange":
        return {
          params: {
            color: 0xffffff,
            map: "paint_cryo_orange",
            roughness: 0.5,
            metalness: 0.25,
          },
        };
      case "cryo_suit_grey":
        return {
          params: {
            color: 0xffffff,
            map: "cryo_suit",
            normalMap: "cryo_suit",
            roughness: 0.85,
            metalness: 0,
          },
        };
      case "cryo_suit_orange":
        return {
          params: {
            color: 0xe0702a,
            map: "fabric",
            roughness: 0.75,
            metalness: 0,
          },
        };
      case "blast_door":
        return {
          params: {
            color: 0x9aa2a8,
            map: "metal_panel",
            normalMap: "metal_panel",
            roughness: 0.45,
            metalness: 0.85,
            envMapIntensity: 0.8,
          },
          env: true,
        };
      case "chrome":
        return {
          params: {
            color: 0xe8e8e8,
            roughness: 0.14,
            metalness: 1.0,
            envMapIntensity: 1.3,
          },
          env: true,
        };
      case "chrome_dirty":
        return {
          params: {
            color: 0xb8b4a8,
            roughness: 0.32,
            metalness: 0.95,
            envMapIntensity: 1.0,
            map: "metal_scratched",
          },
          env: true,
        };
      case "steel":
        return {
          params: {
            color: 0x9a9c9c,
            roughness: 0.4,
            metalness: 0.9,
            map: "metal_scratched",
            envMapIntensity: 0.8,
          },
          env: true,
        };
      case "iron":
        return {
          params: {
            color: 0x55504a,
            roughness: 0.7,
            metalness: 0.75,
            map: "rust",
            envMapIntensity: 0.5,
          },
          env: true,
        };
      case "gold":
        return {
          params: {
            color: 0xe0b050,
            roughness: 0.28,
            metalness: 1.0,
            map: "gold",
            envMapIntensity: 1.2,
          },
          env: true,
        };
      case "bronze":
        return {
          params: {
            color: 0xffffff,
            map: "bronze",
            roughness: 0.45,
            metalness: 0.85,
            envMapIntensity: 0.9,
          },
          env: true,
        };
      case "copper_patina":
        return {
          params: {
            color: 0xffffff,
            map: "copper_patina",
            normalMap: "copper_patina",
            roughness: 0.75,
            metalness: 0.25,
          },
        };
      case "rubber":
        return { params: { color: 0x1c1c1c, roughness: 0.95, metalness: 0 } };
      case "tire":
        return {
          params: {
            color: 0xffffff,
            map: "rubber",
            roughness: 0.95,
            metalness: 0,
          },
        };
      case "plastic_white":
        return { params: { color: 0xe0ddd2, roughness: 0.45, metalness: 0 } };
      case "plastic_black":
        return { params: { color: 0x1e1e1e, roughness: 0.4, metalness: 0 } };
      case "emissive_green":
      case "glow_green":
        return {
          params: {
            color: 0x1a5a1a,
            emissive: 0x4dff5a,
            emissiveIntensity: 2.2,
            roughness: 0.4,
          },
          night: [1.6, 2.6],
        };
      case "glow_sun":
        return {
          params: {
            color: 0x6a4a1a,
            emissive: 0xffc860,
            emissiveIntensity: 2.8,
            roughness: 0.3,
          },
          flicker: true,
        };
      case "glow_red":
        return {
          params: {
            color: 0x5a1010,
            emissive: 0xff3020,
            emissiveIntensity: 2.2,
            roughness: 0.4,
          },
          flicker: true,
        };
      case "glow_blue":
        return {
          params: {
            color: 0x10205a,
            emissive: 0x40a0ff,
            emissiveIntensity: 2.2,
            roughness: 0.4,
          },
        };
      case "glow_fizzo_blue":
        return {
          params: {
            color: 0x1a2a5a,
            emissive: 0x5ad8ff,
            emissiveIntensity: 2.6,
            roughness: 0.2,
          },
        };
      case "lamp_warm":
        return {
          params: {
            color: 0xfff0d0,
            emissive: 0xffd9a0,
            emissiveIntensity: 2.0,
            roughness: 0.3,
          },
          night: [0.2, 2.6],
        };
      case "lamp_cold":
        return {
          params: {
            color: 0xe0f0ff,
            emissive: 0xc8e4ff,
            emissiveIntensity: 2.0,
            roughness: 0.3,
          },
          night: [0.2, 2.4],
        };
      case "fire":
        return {
          params: {
            color: 0x401000,
            emissive: 0xff7a1a,
            emissiveIntensity: 3,
            roughness: 1,
          },
          flicker: true,
        };
      case "screen_green":
        return {
          params: {
            color: 0x0a1a0a,
            map: "screen_green",
            emissiveMap: "screen_green",
            emissive: 0x6aff8a,
            emissiveIntensity: 1.4,
            roughness: 0.2,
          },
        };
      case "screen_amber":
      case "terminal_screen":
        return {
          params: {
            color: 0x1a0e04,
            map: "screen_amber",
            emissiveMap: "screen_amber",
            emissive: 0xffb347,
            emissiveIntensity: 1.4,
            roughness: 0.2,
          },
        };
      case "water":
        return {
          params: {
            color: 0xffffff,
            map: "water",
            normalMap: "water",
            roughness: 0.12,
            metalness: 0.2,
            transparent: true,
            opacity: 0.88,
            envMapIntensity: 0.9,
          },
          env: true,
        };
      case "wire":
      case "cable":
        return { params: { color: 0x151515, roughness: 0.7, metalness: 0.3 } };
      case "skeleton":
      case "bone":
        return {
          params: {
            color: 0xffffff,
            map: "bone",
            roughness: 0.75,
            metalness: 0,
          },
        };
      case "shadow_blob":
        return {
          params: {
            color: 0x000000,
            transparent: true,
            opacity: 0.45,
            depthWrite: false,
            alphaMap: "shadow_blob",
          },
        };
    }
    m = /^paint_(.+)$/.exec(name);
    if (m)
      return {
        params: {
          color: 0xffffff,
          map: name,
          normalMap: "metal_painted",
          roughness: 0.62,
          metalness: 0.25,
          envMapIntensity: 0.4,
        },
        env: true,
        macro: 0.35,
      };
    return null;
  }

  /** Default macro-variation strength for a surface def (0 = off). Large, repeating world surfaces get most. */
  function macroFor(def) {
    if (!def || def.alpha || def.repeat === false) return 0;
    if (def.macro !== undefined) return def.macro;
    const m = def.metersV || def.meters || 1;
    if (m >= 2.5) return 0.75;
    if (m >= 1.5) return 0.45;
    return 0;
  }

  const GROUND = {
    asphalt: 1,
    asphalt_lines: 1,
    asphalt_dashed: 1,
    crosswalk: 1,
    sidewalk: 0.35,
    concrete: 0.3,
    concrete_dark: 0.3,
  };
  // close-range detail family (macro shader, txDetailF): 1 mineral, 2 metal
  const DETAIL_MINERAL =
    /^(concrete|sidewalk|curb|stone_|granite|marble|terrazzo|plaster|cobblestone|roof_tar|rubble)/;
  const DETAIL_METAL =
    /^(metal_|rust|corrugated|paint_|copper_patina|bronze|gold$|cryo_|tile_cryo|blast_door|military|steel$|iron$|chrome_dirty)/;
  function detailFor(name) {
    return DETAIL_METAL.test(name) ? 2 : DETAIL_MINERAL.test(name) ? 1 : 0;
  }
  X.detailFor = detailFor;
  function buildMaterial(name, opts) {
    opts = opts || {};
    const wantNormal = opts.normal !== false;
    const sp = specialSpec(name);
    let params = {};
    let env = false,
      night = null,
      flicker = false,
      macro = 0;
    if (sp) {
      params = Object.assign({}, sp.params);
      if (typeof params.map === "string") params.map = TEX.get(params.map);
      if (typeof params.emissiveMap === "string")
        params.emissiveMap = TEX.get(params.emissiveMap);
      if (typeof params.alphaMap === "string")
        params.alphaMap = TEX.get(params.alphaMap);
      if (typeof params.normalMap === "string") {
        params.normalMap = wantNormal ? TEX.normal(params.normalMap) : null;
        if (!params.normalMap) delete params.normalMap;
      }
      env = !!sp.env;
      night = sp.night || null;
      flicker = !!sp.flicker;
      macro = sp.macro || 0;
    } else if (X.GEN[name] || fallbackName(name)) {
      const real = X.GEN[name] ? name : fallbackName(name);
      const d = X.GEN[real];
      params.map = TEX.get(real);
      if (d.normal && wantNormal) {
        const nm = TEX.normal(real);
        if (nm) params.normalMap = nm;
      }
      params.roughness = d.rough !== undefined ? d.rough : 0.9;
      params.metalness = d.metal !== undefined ? d.metal : 0;
      if (d.roughVar) {
        const rm = TEX.roughness(real);
        if (rm) {
          params.roughnessMap = rm;
          params.roughness = 1;
        }
      }
      if (d.alpha) {
        params.transparent = true;
        params.alphaTest = d.alphaTest || 0.02;
        if (d.depthWrite === false) params.depthWrite = false;
      }
      if (d.emissive) {
        params.emissiveMap = params.map;
        params.emissive = new THREE.Color(d.emissive);
        params.emissiveIntensity = d.emissiveIntensity || 1;
      }
      if (d.side === "double") params.side = THREE.DoubleSide;
      if (d.matColor !== undefined) params.color = d.matColor;
      env = params.metalness > 0.3;
      macro = macroFor(d);
    } else {
      if (name !== "__grey" && !warned.has("mat:" + name)) {
        warned.add("mat:" + name);
        console.warn(
          '[textures] unknown material "' + name + '" -> grey fallback',
        );
      }
      params = {
        color: 0x7a7a74,
        roughness: 0.9,
        metalness: 0,
        map: TEX.get("concrete"),
      };
      macro = 0.5;
    }
    // --- per-call options ---
    const rep = opts.repeat;
    if (rep !== undefined) {
      // Repeat needs its own Texture objects (they share the Source → one GPU upload).
      const ru = Array.isArray(rep) ? rep[0] : rep,
        rv = Array.isArray(rep) ? rep[1] : rep;
      for (const k of [
        "map",
        "normalMap",
        "emissiveMap",
        "alphaMap",
        "roughnessMap",
      ]) {
        if (params[k]) {
          const t = params[k].clone();
          t.repeat.set(ru, rv);
          t.onUpdate = onUploaded;
          t.needsUpdate = true;
          params[k] = t;
        }
      }
    }
    const direct = [
      "color",
      "roughness",
      "metalness",
      "transparent",
      "opacity",
      "emissive",
      "emissiveIntensity",
      "alphaTest",
      "depthWrite",
      "vertexColors",
      "flatShading",
      "fog",
      "polygonOffset",
      "polygonOffsetFactor",
      "polygonOffsetUnits",
      "envMapIntensity",
      "wireframe",
    ];
    for (const k of direct) if (opts[k] !== undefined) params[k] = opts[k];
    if (opts.roughness !== undefined && params.roughnessMap)
      delete params.roughnessMap;
    if (opts.side === "double" || opts.side === THREE.DoubleSide)
      params.side = THREE.DoubleSide;
    if (opts.side === "back" || opts.side === THREE.BackSide)
      params.side = THREE.BackSide;
    if (opts.normal === false) delete params.normalMap;
    if (opts.map !== undefined)
      params.map = typeof opts.map === "string" ? TEX.get(opts.map) : opts.map;
    if (opts.normalScale !== undefined && params.normalMap) {
      const ns = opts.normalScale;
      params.normalScale = new THREE.Vector2(ns, ns);
    }
    if (env || opts.env) {
      params.envMap = X.envMap();
      if (params.envMapIntensity === undefined) params.envMapIntensity = 0.7;
    }
    const mat = new StdMat(params);
    if (params.normalMap && !params.normalScale) mat.normalScale.set(1, 1);
    mat.name = "tx:" + name;
    mat.userData.shared = true;
    mat.userData.texName = name;
    if (opts.macro !== undefined) macro = opts.macro;
    // close-range relief / roughness detail (concrete, stone, metal); it lives in the macro patch, so detail materials
    // without macro variation of their own get a token strength (no visible tint change)
    const det = opts.detail !== undefined ? +opts.detail || 0 : detailFor(name);
    if (det && params.map && !(params.transparent && params.opacity < 0.9)) {
      mat.userData.txDetail = det;
      if (!(macro > 0) && opts.macro === undefined) macro = 0.02;
    }
    if (macro > 0 && params.map) mat.userData.txMacro = macro;
    if (opts.band) mat.userData.txBand = opts.band;
    // world-anchored street damage / per-brick variation (macro shader); opts.ground / opts.brick override (0 = off)
    if (mat.userData.txMacro) {
      const gnd = opts.ground !== undefined ? opts.ground : GROUND[name];
      if (gnd) mat.userData.txGround = gnd;
      const brk =
        opts.brick !== undefined ? opts.brick : /^brick_/.test(name) ? 1 : 0;
      if (brk) mat.userData.txBrick = brk;
    }
    if (
      (night && opts.night !== false) ||
      (flicker && opts.flicker !== false)
    ) {
      const base = mat.emissiveIntensity;
      const nn = night && opts.night !== false ? night : [base, base];
      tagGlow(mat, nn[0], nn[1], flicker && opts.flicker !== false);
    }
    track(mat, false);
    return mat;
  }

  // Whitelisted, order-stable option keys → cache key (never JSON of arbitrary objects).
  const KEY_OPTS = [
    "repeat",
    "color",
    "roughness",
    "metalness",
    "side",
    "transparent",
    "opacity",
    "emissive",
    "emissiveIntensity",
    "normal",
    "normalScale",
    "vertexColors",
    "alphaTest",
    "env",
    "night",
    "flicker",
    "depthWrite",
    "flatShading",
    "fog",
    "polygonOffset",
    "polygonOffsetFactor",
    "polygonOffsetUnits",
    "envMapIntensity",
    "wireframe",
    "macro",
    "band",
    "map",
    "ground",
    "brick",
    "detail",
  ];
  function keyVal(v) {
    if (v === null || v === undefined) return "";
    if (
      typeof v === "number" ||
      typeof v === "boolean" ||
      typeof v === "string"
    )
      return String(v);
    if (Array.isArray(v)) return v.map(keyVal).join(",");
    if (v.isTexture) return "tex:" + v.uuid;
    if (v.isColor) return "c" + v.getHex();
    if (v.isVector2) return v.x + "," + v.y;
    return "?";
  }
  function matKey(name, opts) {
    if (!opts) return name;
    let k = name;
    for (const o of KEY_OPTS)
      if (opts[o] !== undefined) k += "|" + o + "=" + keyVal(opts[o]);
    return k;
  }

  function simpleKey(prefix, a, b, opts) {
    let k = prefix + "|" + a + "|" + b;
    if (opts)
      for (const o of Object.keys(opts).sort()) {
        const v = opts[o];
        if (
          v === undefined ||
          typeof v === "function" ||
          (v && typeof v === "object" && !Array.isArray(v))
        )
          continue;
        k += "|" + o + "=" + keyVal(v);
      }
    return k;
  }

  const MATS = {
    __materials: true,
    /** Shared material. opts (all optional): {repeat:n|[u,v], color, roughness, metalness, side:'double', transparent,
     *  opacity, emissive, emissiveIntensity, normal:false, normalScale, vertexColors, alphaTest, env:true, night:false, flicker:false,
     *  macro: 0..1 (world-space anti-tiling strength, default by surface), band: 0..1 (street-level grime, walls)}. */
    get(name, opts) {
      if (name === undefined || name === null || name === "") name = "__grey";
      name = String(name);
      const key = matKey(name, opts);
      let m = matCache.get(key);
      if (!m) {
        m = buildMaterial(name, opts);
        matCache.set(key, m);
      }
      return m;
    },
    /** Billboard material. opts: {lit: true → faint emissive self-illumination, stronger at night}. */
    billboard(brand, variant, opts) {
      opts = opts || {};
      if (X.resolveBrand) brand = X.resolveBrand(brand);
      const key =
        "billboard|" +
        brand +
        "|" +
        (variant || 0) +
        "|" +
        (opts.lit ? 1 : 0) +
        "|" +
        (opts.side === "double" ? 2 : 1);
      let m = matCache.get(key);
      if (m) return m;
      const map = TEX.billboard(brand, variant || 0);
      const p = { map, roughness: 0.88, metalness: 0 };
      if (opts.lit) {
        p.emissiveMap = map;
        p.emissive = new THREE.Color(0xfff2d8);
        p.emissiveIntensity = 0.25;
      }
      if (opts.side === "double") p.side = THREE.DoubleSide;
      m = new StdMat(p);
      m.name = "tx:billboard:" + brand;
      m.userData.shared = true;
      if (opts.lit) tagGlow(m, 0.08, 0.95, false);
      track(m, false);
      matCache.set(key, m);
      return m;
    },
    poster(brand, variant, opts) {
      opts = opts || {};
      if (X.resolvePoster) brand = X.resolvePoster(brand);
      const key =
        "poster|" +
        brand +
        "|" +
        (variant || 0) +
        "|" +
        (opts.side === "double" ? 2 : 1);
      let m = matCache.get(key);
      if (m) return m;
      m = new StdMat({
        map: TEX.poster(brand, variant || 0),
        roughness: 0.92,
        metalness: 0,
        transparent: true,
        alphaTest: 0.1,
        side: opts.side === "double" ? THREE.DoubleSide : THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });
      m.name = "tx:poster:" + brand;
      m.userData.shared = true;
      matCache.set(key, m);
      return m;
    },
    /**
     * Building facade material (tileable). variant: 1-based (as in texture names) or any int (wraps).
     * userData.facade = {tileW, tileH, ...} metres per tile. Lit windows glow via emissiveIntensity (clone-safe
     * night driver); world-space macro variation + street-level grime band break up the tile repetition.
     */
    facade(style, variant) {
      const s = normStyle(style);
      const count = TEX.facadeCount(s) || 1;
      const vi = Math.floor(variant || 0);
      const v =
        vi >= 1 && vi <= count ? vi : (((vi % count) + count) % count) + 1;
      const name = "facade_" + s + "_" + v;
      const key = "facade|" + name;
      let m = matCache.get(key);
      if (m) return m;
      const map = TEX.get(name);
      const emi = X.facadeEmissive ? X.facadeEmissive(name) : null;
      const p = { map, roughness: 0.86, metalness: 0.02 };
      const nm = TEX.normal(name);
      if (nm) {
        p.normalMap = nm;
      }
      if (emi) {
        p.emissiveMap = emi;
        p.emissive = new THREE.Color(0xffc27a);
        p.emissiveIntensity = 0.03 + 1.72 * curNight;
      }
      m = new StdMat(p);
      if (nm) m.normalScale.set(0.8, 0.8);
      m.name = "tx:" + name;
      m.userData.shared = true;
      m.userData.facade = TEX.facadeInfo(s);
      m.userData.txMacro = 1;
      m.userData.txBand = 1;
      // interior mapping (fake rooms behind the windows); the mask is built now so compile never paints
      try {
        if (X.facadeMask && X.facadeMask(name)) m.userData.txWin = name;
      } catch (e) {
        G.reportError("textures:facadeMask:" + name, e);
      }
      if (emi) tagGlow(m, 0.03, 1.75, false);
      track(m, false);
      matCache.set(key, m);
      return m;
    },
    /**
     * Non-repeating facade trim strip: part 'top' (cornice / parapet crown, place on the last storey) or
     * 'base' (ground-floor band). One tile = 14 m × 3.5 m, tiles in U only (see facadeInfo().top/.base).
     */
    facadeTrim(style, part) {
      const s = normStyle(style),
        pt = part === "base" ? "base" : "top";
      return MATS.get("facade_" + s + "_" + pt, {
        macro: 0.8,
        band: pt === "base" ? 0.5 : 0,
      });
    },
    /** Storefront (ground floor) material, variant 0-based. */
    storefront(variant) {
      const n =
        Object.keys(X.GEN).filter((k) => /^storefront_\d+$/.test(k)).length ||
        1;
      const v = (((Math.floor(variant || 0) % n) + n) % n) + 1;
      return MATS.get("storefront_" + v, { macro: 0.5, band: 0.6 });
    },
    sign(text, style, opts) {
      const key = simpleKey("sign", text, style, opts);
      let m = matCache.get(key);
      if (m) return m;
      const lit =
        style === "marquee" || style === "lightbox" || style === "neon";
      const emap = TEX.sign(text, style, opts);
      const map =
        (style === "neon" &&
          !(opts && opts.transparent) &&
          X.neonDayTex &&
          X.neonDayTex(emap)) ||
        emap;
      const p = {
        map,
        roughness: 0.7,
        metalness: 0.1,
        transparent: !!(map && map.userData && map.userData.alpha),
        alphaTest: 0.05,
      };
      if (lit) {
        p.emissiveMap = emap;
        p.emissive = new THREE.Color(0xffffff);
        p.emissiveIntensity = 0.8;
      }
      m = new StdMat(p);
      m.name = "tx:sign:" + text;
      m.userData.shared = true;
      if (lit) tagGlow(m, 0.35, 1.6, style === "neon");
      track(m, false);
      matCache.set(key, m);
      return m;
    },
    /** Emissive neon sign material (black backing → use additive-looking emissive). opts.transparent → only tubes visible. */
    neon(text, color, opts) {
      opts = opts || {};
      const key = simpleKey("neon", text, color, opts);
      let m = matCache.get(key);
      if (m) return m;
      const lit = TEX.neon(text, color, opts);
      // albedo: unlit tubes on the sheet-metal can; emissive: the lit tubes only (transparent signs keep the halo's alpha)
      const map =
        (!opts.transparent && X.neonDayTex && X.neonDayTex(lit)) || lit;
      m = new StdMat({
        map,
        emissiveMap: lit,
        emissive: 0xffffff,
        emissiveIntensity: 1.8,
        roughness: 0.4,
        metalness: 0,
        transparent: !!opts.transparent,
        alphaTest: opts.transparent ? 0.04 : 0,
        depthWrite: !opts.transparent,
        side: opts.side === "double" ? THREE.DoubleSide : THREE.FrontSide,
      });
      m.name = "tx:neon:" + text;
      m.userData.shared = true;
      tagGlow(m, 0.9, 3.2, opts.flicker !== false);
      track(m, false);
      matCache.set(key, m);
      return m;
    },
    /** Transparent decal material (polygonOffset to avoid z-fighting). */
    decal(name, opts) {
      opts = opts || {};
      const key = simpleKey("decal", name, "", opts);
      let m = matCache.get(key);
      if (m) return m;
      const map = TEX.decal(name);
      const glow = /glow|rad_puddle/.test(String(name));
      m = new StdMat({
        map,
        transparent: true,
        depthWrite: false,
        alphaTest: 0.01,
        roughness: /blood|puddle|oil/.test(name) ? 0.2 : 0.9,
        metalness: 0,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
        emissiveMap: glow ? map : null,
        emissive: glow ? new THREE.Color(0xffffff) : new THREE.Color(0),
        emissiveIntensity: glow ? 1.5 : 0,
        side: opts.side === "double" ? THREE.DoubleSide : THREE.FrontSide,
      });
      m.name = "tx:decal:" + name;
      m.userData.shared = true;
      if (glow) {
        tagGlow(m, 0.9, 1.8, false);
        track(m, false);
      }
      matCache.set(key, m);
      return m;
    },
    /**
     * Register a material you created or cloned yourself so it gets the night-glow driver and/or macro variation.
     * opts: {glow: [day, night], flicker: bool, macro: 0..1, band: 0..1}. Tags from a cloned G.mats material are kept.
     */
    track(mat, opts) {
      if (!mat || !mat.isMaterial) return mat;
      opts = opts || {};
      if (opts.glow) tagGlow(mat, opts.glow[0], opts.glow[1], !!opts.flicker);
      if (opts.macro !== undefined) mat.userData.txMacro = opts.macro;
      if (opts.band !== undefined) mat.userData.txBand = opts.band;
      if (seenMats.has(mat) && (opts.glow || opts.macro !== undefined)) {
        seenMats.delete(mat);
      }
      return track(mat, true);
    },
    /**
     * Fake rooms + recessed, sun-shadowed window reveals for a material whose map is a plain painted window grid
     * (landmark façades, hand-made towers) — no mask texture needed. Clone-safe (userData.txWinGrid).
     * spec: {cells:[bays, floors] per texture repeat, win:{x0,x1,y0,y1} fractions of a bay/floor (centred; y from the
     *        bottom of the floor), mullions: n vertical bars, transom: true|false (bar 38 % below the head), bar: bar
     *        half-width in bay fractions (default 1/bayPx), glass: '#hex' painted glass colour, lit: '#hex' painted lit
     *        colour, recess: m (default 0.2), office: bool (grey office interiors)}.
     * Works on any MeshStandardMaterial with a map that has no onBeforeCompile of its own (and on G.mats materials).
     */
    trackWindows(mat, spec) {
      if (!mat || !mat.isMeshStandardMaterial || !spec || !spec.cells)
        return mat;
      const w = spec.win || { x0: 0.25, x1: 0.75, y0: 0.2, y1: 0.8 };
      const hw = Math.max(0.05, Math.min(0.98, w.x1 - w.x0)),
        y0 = w.y0 * 2 - 1,
        y1 = w.y1 * 2 - 1;
      const hex = (c, d) =>
        typeof c === "number"
          ? c
          : typeof c === "string"
            ? parseInt(c.replace("#", ""), 16)
            : d;
      mat.userData.txWinGrid = {
        cells: [+spec.cells[0] || 4, +spec.cells[1] || 6],
        rect: [hw, y0, y1, 1],
        mullions:
          spec.mullions === undefined ? 1 : Math.max(0, spec.mullions | 0),
        transom: spec.transom === false ? -9 : y1 - 0.38 * (y1 - y0),
        bar:
          spec.bar !== undefined
            ? spec.bar
            : spec.bayPx
              ? 2 / spec.bayPx
              : 0.025,
        glass: hex(spec.glass, 0x2b3a3a),
        lit: spec.lit ? hex(spec.lit, 0xffcf80) : 0,
        recess: spec.recess === undefined ? 0.2 : +spec.recess,
        office: !!spec.office,
      };
      if (!isTxHook(mat.onBeforeCompile)) {
        if (mat.onBeforeCompile !== protoOBC) {
          if (!warned.has("tw:" + mat.name)) {
            warned.add("tw:" + mat.name);
            console.warn(
              '[textures] trackWindows: material "' +
                mat.name +
                '" has its own onBeforeCompile — skipped (use G.mats.chainCompile first)',
            );
          }
          delete mat.userData.txWinGrid;
          return mat;
        }
        mat.onBeforeCompile = txCompile;
        mat.customProgramCacheKey = txKey;
      }
      mat.needsUpdate = true;
      return mat;
    },
    /**
     * Opt a material that has (or needs) its OWN onBeforeCompile into this module's patches (macro grime / dust,
     * façade windows, per-object neon flicker) without either side clobbering the other: our patch runs first (it keeps
     * three's #include lines in place, so your replaces still find them), then fn(shader, renderer). The program key is
     * key + '|' + ours (key defaults to fn's source). Pass fn = mat.onBeforeCompile to keep an existing hook.
     * Callbacks are not copied by clone(): call it again on clones.
     */
    chainCompile(mat, fn, key) {
      if (!mat || !mat.isMaterial || typeof fn !== "function") return mat;
      if (fn.txChain) return mat; // already chained
      const own = fn === txCompile || fn === protoOBC ? null : fn;
      const hook = function (shader, renderer) {
        txCompile.call(this, shader, renderer);
        if (own) own.call(this, shader, renderer);
      };
      hook.txChain = true;
      const fk = key !== undefined ? String(key) : own ? String(own) : "";
      mat.onBeforeCompile = hook;
      mat.customProgramCacheKey = function () {
        return fk + "|" + txKeyOf(this);
      };
      mat.needsUpdate = true;
      return mat;
    },
    /** Re-scan the scene now for cloned materials (normally automatic). */
    rescan() {
      scanScene(true);
      return glowList.length;
    },
    list() {
      return Array.from(matCache.keys());
    },
    /** Force night factor (0 day .. 1 night); pass null to return to automatic. */
    setNight(f) {
      forcedNight =
        f === null || f === undefined ? null : Math.max(0, Math.min(1, f));
    },
    nightFactor() {
      return curNight;
    },
    neonColors() {
      return Object.keys(NEON_COLORS);
    },
    paints() {
      return Object.keys(PAINTS);
    },
  };

  // ------------------------------------------------------------------
  // Automatic window grids for foreign façade materials
  // ------------------------------------------------------------------
  // Landmarks and POIs paint their own window-grid façades (K.facade…) on plain MeshStandardMaterials, which used to
  // render as flat black squares: no fake rooms, no recess, no reveals. Instead of waiting for every module to call
  // G.mats.trackWindows, the scene sweep inspects each untouched foreign material with a canvas/image map once: the
  // luminance profiles give the bay / storey period (autocorrelation, harmonics rejected), the folded cell gives the
  // window rectangle (distance from the pier colour), the per-cell samples give the painted glass (and lit) colour.
  // Only clean, centred, consistent grids pass; the shader additionally ignores horizontal faces (roofs using the
  // same material). Results are cached per texture Source; X.autoWin lists what was patched (probe).
  const AUTO_WIN_NAME =
    /fac|facade|tower|office|window|curtain|bldg|building|skyscr|shaft|annex|brick|stone/i;
  const AUTO_WIN_SKIP =
    /tile|floor|carpet|fence|grate|vent|screen|sign|atlas|poster|bill|neon|glass|decal|ground|road|roof|lamp|glow|paint/i;
  const autoSeen = new WeakSet(),
    autoBySource = new WeakMap();
  X.autoWin = [];
  function detectWindowGrid(img, hint, hasEmissive) {
    const iw = img.width || img.naturalWidth || 0,
      ih = img.height || img.naturalHeight || 0;
    if (iw < 96 || ih < 96) return null;
    const W = 192,
      H = Math.max(64, Math.min(576, Math.round((W * ih) / iw)));
    const cv = X.canvas(W, H);
    let d;
    try {
      cv.ctx.drawImage(img, 0, 0, W, H);
      d = cv.ctx.getImageData(0, 0, W, H).data;
    } catch (e) {
      return null;
    }
    const N = W * H,
      L = new Float32Array(N);
    for (let i = 0; i < N; i++)
      L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.5 + d[i * 4 + 2] * 0.2;
    const pxp = new Float32Array(W),
      pyp = new Float32Array(H);
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const l = L[y * W + x];
        pxp[x] += l / H;
        pyp[y] += l / W;
      }
    // finest period k (repeats per texture) whose shifts by 1..4 periods all correlate: rejects sub-harmonics and near-misses
    function period(p, kMax, minLag) {
      const n = p.length;
      let mean = 0;
      for (let i = 0; i < n; i++) mean += p[i] / n;
      let vr = 0;
      for (let i = 0; i < n; i++) vr += (p[i] - mean) * (p[i] - mean);
      if (vr / n < 6) return null;
      const corr = (lag) => {
        let s = 0;
        for (let i = 0; i < n; i++) {
          const t = i + lag,
            i0 = Math.floor(t),
            f = t - i0;
          const v = p[i0 % n] * (1 - f) + p[(i0 + 1) % n] * f;
          s += (p[i] - mean) * (v - mean);
        }
        return s / vr;
      };
      let best = null;
      for (let k = 2; k <= kMax; k++) {
        const lag = n / k;
        if (lag < minLag) break;
        let sc = 1;
        for (let m = 1; m <= Math.min(k - 1, 4); m++)
          sc = Math.min(sc, corr(lag * m));
        if (sc > 0.62) best = { k, c: sc };
      }
      return best;
    }
    const rej = (why) => {
      detectWindowGrid.why = why;
      return null;
    };
    const bx = period(pxp, 24, 8),
      by = period(pyp, 32, 8);
    if (!bx || !by)
      return rej("period " + (bx ? bx.k : "-") + "x" + (by ? by.k : "-"));
    const nb = bx.k,
      nf = by.k,
      cw = W / nb,
      ch = H / nf,
      S = 24;
    // fold all cells into one mean cell
    const F = new Float32Array(S * S * 3);
    for (let cy = 0; cy < nf; cy++)
      for (let cx = 0; cx < nb; cx++)
        for (let j = 0; j < S; j++)
          for (let i = 0; i < S; i++) {
            const x = Math.min(W - 1, (cx * cw + ((i + 0.5) / S) * cw) | 0),
              y = Math.min(H - 1, (cy * ch + ((j + 0.5) / S) * ch) | 0),
              o = (y * W + x) * 4,
              f = (j * S + i) * 3;
            F[f] += d[o];
            F[f + 1] += d[o + 1];
            F[f + 2] += d[o + 2];
          }
    for (let i = 0; i < F.length; i++) F[i] /= nb * nf;
    const at = (i, j) => (j * S + i) * 3;
    const dist = (f, c) =>
      Math.hypot(F[f] - c[0], F[f + 1] - c[1], F[f + 2] - c[2]);
    const wall = [0, 0, 0];
    let wn = 0;
    for (const j of [0, 1, S - 2, S - 1])
      for (const i of [0, 1, S - 2, S - 1]) {
        const f = at(i, j);
        wall[0] += F[f];
        wall[1] += F[f + 1];
        wall[2] += F[f + 2];
        wn++;
      }
    wall[0] /= wn;
    wall[1] /= wn;
    wall[2] /= wn;
    const run = (prof, th) => {
      let mx = 0,
        am = 0;
      for (let i = 0; i < S; i++)
        if (prof[i] > mx) {
          mx = prof[i];
          am = i;
        }
      let s = am,
        e = am;
      while (s > 0 && prof[s - 1] > mx * th) s--;
      while (e < S - 1 && prof[e + 1] > mx * th) e++;
      return { s, e, mx };
    };
    const A = new Float32Array(S);
    for (let i = 0; i < S; i++) {
      let a = 0;
      for (let j = 0; j < S; j++) a += dist(at(i, j), wall);
      A[i] = a / S;
    }
    const rx = run(A, 0.5);
    if (rx.s < 1 || rx.e > S - 2 || rx.mx < 14)
      return rej("cols " + rx.s + "-" + rx.e + " " + rx.mx.toFixed(0));
    const x0 = rx.s / S,
      x1 = (rx.e + 1) / S;
    if (
      Math.abs((x0 + x1) / 2 - 0.5) > 0.07 ||
      x1 - x0 < 0.15 ||
      x1 - x0 > 0.85
    )
      return rej("xrect " + x0.toFixed(2) + "-" + x1.toFixed(2));
    // rows: distance from what sits above / below the window in the same columns (wall or spandrel)
    const ref = [0, 0, 0];
    let rn = 0;
    for (let i = rx.s; i <= rx.e; i++)
      for (const j of [0, S - 1]) {
        const f = at(i, j);
        ref[0] += F[f];
        ref[1] += F[f + 1];
        ref[2] += F[f + 2];
        rn++;
      }
    ref[0] /= rn;
    ref[1] /= rn;
    ref[2] /= rn;
    const Bp = new Float32Array(S);
    for (let j = 0; j < S; j++) {
      let a = 0;
      for (let i = rx.s; i <= rx.e; i++) a += dist(at(i, j), ref);
      Bp[j] = a / (rx.e - rx.s + 1);
    }
    const ry = run(Bp, 0.35);
    if (ry.s < 1 || ry.e > S - 2 || ry.mx < 12)
      return rej("rows " + ry.s + "-" + ry.e + " " + ry.mx.toFixed(0));
    const y1 = 1 - ry.s / S,
      y0 = 1 - (ry.e + 1) / S;
    if (y1 - y0 < 0.2 || y1 - y0 > 0.92)
      return rej("yrect " + y0.toFixed(2) + "-" + y1.toFixed(2));
    // masonry / tile joints, not windows: a fine grid whose "openings" fill most of the cell (brick faces between thin
    // mortar lines — brick_tan / brick_white read as 24 × 12 "window" grids, every brick a room). Real façade grids
    // here are ≤ 10 bays per texture with openings ≤ ~0.5 of the cell.
    if ((x1 - x0) * (y1 - y0) > 0.55 && (nb >= 12 || nf >= 12))
      return rej(
        "joints " + nb + "x" + nf + " " + ((x1 - x0) * (y1 - y0)).toFixed(2),
      );
    // per-cell pane colour (where the shader classifies it): median = painted glass, bright warm outliers = lit
    const samples = [];
    for (let cy = 0; cy < nf; cy++)
      for (let cx = 0; cx < nb; cx++) {
        let r = 0,
          g = 0,
          b = 0,
          n = 0;
        for (const fx of [0.3, 0.7])
          for (let k = -1; k <= 1; k++) {
            const x = Math.min(
              W - 1,
              Math.max(0, (cx * cw + (x0 + (x1 - x0) * fx) * cw + k) | 0),
            );
            const y = Math.min(
                H - 1,
                Math.max(0, (cy * ch + (1 - (y0 + (y1 - y0) * 0.62)) * ch) | 0),
              ),
              o = (y * W + x) * 4;
            r += d[o];
            g += d[o + 1];
            b += d[o + 2];
            n++;
          }
        samples.push([r / n, g / n, b / n]);
      }
    const lumOf = (c) => c[0] * 0.3 + c[1] * 0.5 + c[2] * 0.2;
    const sorted = samples.slice().sort((a, b) => lumOf(a) - lumOf(b));
    const glass = sorted[(sorted.length / 2) | 0];
    const dg = Math.hypot(
      glass[0] - wall[0],
      glass[1] - wall[1],
      glass[2] - wall[2],
    );
    if (dg < 18) return rej("contrast " + dg.toFixed(0));
    let cons = 0;
    for (const c of samples)
      if (
        Math.hypot(c[0] - glass[0], c[1] - glass[1], c[2] - glass[2]) <
        Math.hypot(c[0] - wall[0], c[1] - wall[1], c[2] - wall[2])
      )
        cons++;
    cons /= samples.length;
    const strong = bx.c > 0.8 && by.c > 0.8 && cons > 0.7;
    if (cons < 0.5 || !(hint || strong))
      return rej(
        "cons " + cons.toFixed(2) + " score " + Math.min(bx.c, by.c).toFixed(2),
      );
    let lit = null;
    if (hasEmissive) {
      const lg = lumOf(glass),
        L2 = samples.filter((c) => lumOf(c) > lg * 1.8 + 25 && c[0] > c[2]);
      if (L2.length)
        lit = L2.reduce(
          (a, c) => [
            a[0] + c[0] / L2.length,
            a[1] + c[1] / L2.length,
            a[2] + c[2] / L2.length,
          ],
          [0, 0, 0],
        );
    }
    const hx = (c) =>
      "#" +
      c
        .map((v) =>
          Math.max(0, Math.min(255, Math.round(v)))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("");
    const m = 0.4 / S; // the painted frame belongs to the wall
    return {
      cells: [nb, nf],
      win: { x0: x0 + m, x1: x1 - m, y0: y0 + m, y1: y1 - m },
      mullions: 1,
      bayPx: iw / nb,
      glass: hx(glass),
      lit: lit ? hx(lit) : 0,
      recess: 0.2,
      office:
        x1 - x0 > 0.55 ||
        /office|tower|esb|metlife|rock|chrysler|un_/i.test(hint || ""),
      score: +Math.min(bx.c, by.c).toFixed(2),
      cons: +cons.toFixed(2),
    };
  }
  X.detectWindowGrid = detectWindowGrid;
  /** Sweep: patch foreign window-grid façades (once per material; detection cached per texture). */
  X.autoWinRej = [];
  // Detections found by the periodic sweep are not run inside the frame: they queue here and run one at a time in idle
  // time (requestIdleCallback with a deadline check, setTimeout fallback), so the getImageData readback never lands in a
  // frame. Load-time sweeps (initDone / newGame, behind the loading screen) still detect synchronously.
  const autoQueue = [];
  let autoIdleOn = false;
  X.sweepStats.detectMaxMs = 0;
  X.sweepStats.idleRuns = 0;
  function autoIdle(deadline) {
    autoIdleOn = false;
    let n = 0;
    while (autoQueue.length) {
      if (
        deadline &&
        typeof deadline.timeRemaining === "function" &&
        n > 0 &&
        deadline.timeRemaining() < 6
      )
        break;
      const it = autoQueue.shift();
      const t0 = now();
      try {
        autoDetect(it.m, it.obj);
      } catch (e) {
        /* optional */
      }
      const dt = now() - t0;
      if (dt > X.sweepStats.detectMaxMs)
        X.sweepStats.detectMaxMs = +dt.toFixed(2);
      X.sweepStats.idleRuns++;
      n++;
      if (!deadline) break; // setTimeout fallback: one per tick
    }
    if (autoQueue.length) scheduleAutoIdle();
  }
  function scheduleAutoIdle() {
    if (autoIdleOn) return;
    autoIdleOn = true;
    if (typeof window.requestIdleCallback === "function")
      window.requestIdleCallback(autoIdle, { timeout: 4000 });
    else setTimeout(() => autoIdle(null), 50);
  }
  function autoVisit(m, obj, deferred) {
    if (!m || autoSeen.has(m)) return 0;
    autoSeen.add(m);
    if (
      !m.isMeshStandardMaterial ||
      m.onBeforeCompile !== protoOBC ||
      !m.map ||
      m.transparent ||
      m.alphaTest > 0
    )
      return 0;
    const ud = m.userData || {};
    if (ud.txWin || ud.txWinGrid || ud.noAutoWindows) return 0;
    const nm = m.name || "";
    if (AUTO_WIN_SKIP.test(nm) && !/fac/i.test(nm)) return 0;
    if (isSurfaceTile(m.map)) return 0;
    if (deferred && autoBySource.get(m.map.source || m.map) === undefined) {
      if (autoQueue.length < 400) {
        autoQueue.push({ m, obj });
        scheduleAutoIdle();
      }
      return 0;
    }
    return autoDetect(m, obj);
  }
  // Our own seamless surface tiles (G.tex.get: brick_*, stone_*, tile_*, concrete…) are never window grids — POI kits put
  // them on plain MeshStandardMaterials (pv_brick_tan, lma_brick_tan, pmid_brick_white…), and their perfectly periodic
  // courses passed the detector: every brick became a tiny fake room (USER REPORT 2026-10-06). Façade atlases stay eligible.
  function isSurfaceTile(tex) {
    const rec = tex && recBySource.get(tex.source || tex);
    const def = rec && rec.name && X.GEN[rec.name];
    return !!(def && !def.facade);
  }
  function autoDetect(m, obj) {
    if (!m.map || m.onBeforeCompile !== protoOBC || isSurfaceTile(m.map))
      return 0;
    const ud = m.userData || {};
    if (ud.txWin || ud.txWinGrid || ud.noAutoWindows) return 0;
    const nm = m.name || "";
    const src = m.map.source || m.map;
    let spec = autoBySource.get(src);
    if (spec === undefined) {
      const img = m.map.image;
      spec = null;
      if (
        img &&
        ((typeof HTMLCanvasElement !== "undefined" &&
          img instanceof HTMLCanvasElement) ||
          (typeof HTMLImageElement !== "undefined" &&
            img instanceof HTMLImageElement &&
            img.complete) ||
          (typeof ImageBitmap !== "undefined" && img instanceof ImageBitmap))
      ) {
        detectWindowGrid.why = "";
        try {
          spec = detectWindowGrid(
            img,
            AUTO_WIN_NAME.test(nm) ? nm : "",
            !!m.emissiveMap,
          );
        } catch (e) {
          spec = null;
          detectWindowGrid.why = "ERR " + e.message;
        }
        if (!spec && AUTO_WIN_NAME.test(nm) && X.autoWinRej.length < 40)
          X.autoWinRej.push(nm + ": " + detectWindowGrid.why);
      }
      autoBySource.set(src, spec);
    }
    if (!spec) return 0;
    MATS.trackWindows(m, spec);
    if (!m.userData.txWinGrid) return 0;
    if (X.autoWin.length < 64)
      X.autoWin.push({
        name: nm || "obj:" + ((obj && (obj.name || obj.type)) || ""),
        cells: spec.cells,
        win: spec.win,
        glass: spec.glass,
        score: spec.score,
        cons: spec.cons,
      });
    return 1;
  }
  /** Full sweep now (all subtrees, incl. hidden ones): patch foreign window-grid façades. Returns the count patched. */
  function autoWindows() {
    if (!G.scene || !winOK() || autoOff || Q.low) return 0;
    let n = 0;
    G.scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      if (Array.isArray(m)) {
        for (const mm of m) n += autoVisit(mm, o);
      } else n += autoVisit(m, o);
    });
    return n;
  }
  /** Load-time sweep (initDone / newGame): one traversal for clones (with macro install) + window grids. */
  function fullSweep() {
    if (!G.scene) return;
    const auto = winOK() && !autoOff && !Q.low;
    G.scene.traverse((o) => {
      const m = o.material;
      if (!m) return;
      const one = (mm) => {
        scanVisit(mm, true);
        if (auto) {
          try {
            autoVisit(mm, o);
          } catch (e) {
            /* optional */
          }
        }
      };
      if (Array.isArray(m)) m.forEach(one);
      else one(m);
    });
  }
  const autoOff = !!(G.QS && G.QS.get && G.QS.get("autowin") === "0");
  MATS.autoWindows = autoWindows;

  // ------------------------------------------------------------------
  // Night / flicker driver
  // ------------------------------------------------------------------
  let forcedNight = null,
    curNight = 0;
  function nightFromHour(h) {
    // 0 at midday, 1 at night; smooth dusk (18-20.5) & dawn (5-7)
    if (h >= 7 && h <= 18) return 0;
    if (h > 18 && h < 20.5) return (h - 18) / 2.5;
    if (h > 5 && h < 7) return 1 - (h - 5) / 2;
    return 1;
  }
  X.nightFromHour = nightFromHour;
  function computeNight() {
    if (forcedNight !== null) return forcedNight;
    // Prefer the atmosphere module's own factor so glow matches the sky exactly.
    try {
      if (!G.isStub("atmos") && typeof G.atmos.nightFactor === "function") {
        const v = G.atmos.nightFactor();
        if (typeof v === "number" && isFinite(v))
          return Math.max(0, Math.min(1, v));
      }
    } catch (e) {
      /* fall through */
    }
    // NB: hour 0 (midnight) is valid — never use `hour || 12`.
    const hr =
      G.time && typeof G.time.hour === "number" && isFinite(G.time.hour)
        ? G.time.hour
        : 12;
    return nightFromHour(((hr % 24) + 24) % 24);
  }
  X.computeNight = computeNight;

  let scanT = 0,
    trimT = 0;
  function update(dt, realDt) {
    let n = computeNight();
    // indoors, neon & lit windows read like night
    if (
      G.player &&
      G.player.pos &&
      G.LAYOUT &&
      G.player.pos.x >= G.LAYOUT.INTERIOR_X_MIN
    )
      n = Math.max(n, 0.8);
    // weather darkness (thunderstorm/overcast) boosts glow a little
    try {
      if (!G.isStub("atmos") && G.atmos.getWeather) {
        const w = G.atmos.getWeather();
        if (w === "thunderstorm" || w === "rain" || w === "overcast")
          n = Math.max(n, 0.35);
      }
    } catch (e) {
      /* ignore */
    }
    // ease towards the target so entering/leaving interiors or weather changes don't pop
    const k = Math.min(1, (realDt || 0.016) * 2.5);
    curNight += (n - curNight) * (Math.abs(n - curNight) < 0.002 ? 1 : k);
    // wet streets at night: neon and fire read brighter (the reflections themselves are the atmosphere module's nrcWet patch)
    let wet = 0;
    try {
      if (!G.isStub("atmos") && typeof G.atmos.wetness === "function") {
        const w = +G.atmos.wetness();
        if (isFinite(w)) wet = Math.max(0, Math.min(1, w));
      }
    } catch (e) {
      wet = 0;
    }
    const wetK = 1 + 0.18 * wet * curNight;
    // Flicker lives in the shader (per object, see FLK_*); the CPU only writes the day/night base value, and only when it
    // changes. Materials whose flicker patch is not compiled (driver fallback) keep the old CPU flicker.
    const t = (G.time && G.time.real) || now() / 1000;
    uTxTime.value = t % 3600;
    // falling rain (outdoors, not sheltered) for the ripple rings in the standing water
    let rain = 0;
    try {
      if (
        !G.isStub("atmos") &&
        typeof G.atmos.getWeatherParams === "function"
      ) {
        const wp = G.atmos.getWeatherParams();
        const r = wp ? +wp.rain : 0;
        if (isFinite(r)) rain = Math.max(0, Math.min(1, r));
        if (G.atmos.isSheltered && G.atmos.isSheltered()) rain = 0;
      }
    } catch (e) {
      rain = 0;
    }
    if (
      G.player &&
      G.player.pos &&
      G.LAYOUT &&
      G.player.pos.x >= G.LAYOUT.INTERIOR_X_MIN
    )
      rain = 0;
    uTxWet.value.set(
      WET_DEV >= 0 ? WET_DEV : wet,
      t % 3600,
      WET_DEV >= 0 ? Math.min(1, WET_DEV * 1.2) : rain,
      0,
    );
    for (let i = 0; i < glowList.length; i++) {
      const e = glowList[i];
      let v = e.d + (e.n - e.d) * curNight;
      if (e.f) {
        v *= wetK;
        if (!flkPatched.has(e.mat)) {
          const s =
            Math.sin(t * 13.1 * e.rate + e.ph) + Math.sin(t * 7.3 + e.ph * 2.1);
          v *= s > 1.82 ? 0.25 : 0.93 + 0.07 * Math.sin(t * 50 + e.ph);
        }
      }
      if (Math.abs(e.mat.emissiveIntensity - v) > 1e-3)
        e.mat.emissiveIntensity = v;
    }
    // quality tier (cheap: two property reads; a recompile only when crossing 'low')
    readQuality();
    updateSky();
    // periodic discovery of clones & window grids, time-sliced (<= 1.5 ms per frame)
    // (clones of our materials self-register at compile; this slow sweep only catches foreign copies)
    scanT += realDt || 0;
    if (sweep || scanT > 12) {
      if (!sweep) scanT = 0;
      try {
        sweepStep(1.5);
      } catch (e) {
        sweep = null; /* scene mid-rebuild */
      }
    }
    if (initDone) {
      trimT += realDt || 0;
      if (trimT > 6) {
        trimT = 0;
        trim(45000);
      }
    }
  }

  // ------------------------------------------------------------------
  // Install
  // ------------------------------------------------------------------
  G.tex = TEX;
  G.mats = MATS;

  G.registerModule({
    name: "textures",
    order: 10,
    init(G) {
      try {
        maxAniso = Math.min(8, G.renderer.capabilities.getMaxAnisotropy());
      } catch (e) {
        maxAniso = 4;
      }
      curNight = computeNight();
      try {
        installShaderGuard();
      } catch (e) {
        /* optional */
      }
      try {
        readQuality();
      } catch (e) {
        /* atmosphere not up yet: defaults */
      }
      try {
        // first CPU trim 2 s after init (textures uploaded by the first frames), then every 6 s of frame time
        G.events.on("initDone", () => {
          initDone = true;
          trimT = 4;
          readQuality();
          fullSweep();
        });
        G.events.on("newGame", () => {
          sweep = null;
          fullSweep();
        });
      } catch (e) {
        initDone = true;
      }
      // Give web fonts a brief chance to load before any lettering is rasterised.
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      let p = Promise.resolve();
      try {
        if (document.fonts && document.fonts.load) {
          p = Promise.race([
            Promise.all(
              [
                "700 20px Oswald",
                '20px "Special Elite"',
                "20px VT323",
                '20px "Share Tech Mono"',
              ].map((f) => document.fonts.load(f).catch(() => null)),
            ),
            wait(450),
          ]);
        }
      } catch (e) {
        /* ignore */
      }
      return p.then(() => {
        // Pre-generate the handful of surfaces virtually every module uses.
        TEX.prewarm(["concrete", "asphalt"]);
        if (X.debugInit) X.debugInit();
      });
    },
    update,
  });
})();
