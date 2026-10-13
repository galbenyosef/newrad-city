// play-inline-21 03 — tex
// Lines 411-843 of readable/play-inline-21.pretty.js (statement-aligned).
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

