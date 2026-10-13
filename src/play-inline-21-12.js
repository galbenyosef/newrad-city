// play-inline-21 12 — opts
// Lines 3262-3626 of readable/play-inline-21.pretty.js (statement-aligned).
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
