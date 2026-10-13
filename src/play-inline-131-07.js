// play-inline-131 07 — def
// Lines 1614-1866 of readable/play-inline-131.pretty.js (statement-aligned).
  const baseKey = (k) =>
    k.length > 4 && k.slice(-4) === "@lit" ? k.slice(0, -4) : k;
  LB.baseKey = baseKey;
  LB.MAT_DEFS = MAT_DEFS;
  const matCache = {};
  const NO_SHADOW = new Set();
  /**
   * Shared material for a key. Keys may be MAT_DEFS names, or 'tex:<cacheKey>' for
   * one-off textured quads (registered with LB.texMat).
   */
  const texInfoMeters = {};
  /** World metres per texture tile for a MAT_DEFS key (textures module's own scale when we use its surface). */
  function metersFor(key) {
    const def = MAT_DEFS[key];
    if (!def) return 4;
    if (texInfoMeters[key] !== undefined) return texInfoMeters[key];
    let m = def.uv || 4;
    const mat = LB.mat(key);
    if (mat && mat.userData.lbSrc && def.src) {
      try {
        const inf = G.tex.info(def.src);
        if (inf && inf.meters) m = inf.meters;
      } catch (e) {
        /* keep default */
      }
    }
    texInfoMeters[key] = m;
    return m;
  }
  /**
   * Material for a key. Keys: MAT_DEFS names, 'tex:<k>' (LB.texMat), 'brand:<id>' (LB.brandMat), each optionally
   * suffixed '@lit' → a clone that adds the per-vertex baked light (attribute `bake`) as emission (fake interior GI).
   */
  LB.mat = function (key) {
    if (matCache[key]) return matCache[key];
    if (baseKey(key) !== key)
      return (matCache[key] = makeBakedVariant(LB.mat(baseKey(key)), key));
    if (key.indexOf("tex:") === 0 || key.indexOf("brand:") === 0)
      return matCache[key] || LB.mat("concrete");
    const def = MAT_DEFS[key] || { color: 0x808080, rough: 0.9, uv: 4 };
    let m = null;
    const haveMats =
      !G.isStub("mats") && G.mats && typeof G.mats.get === "function";
    const haveSrc =
      def.src &&
      haveMats &&
      !def.forceFallback &&
      (() => {
        try {
          return !G.tex.has || G.tex.has(def.src);
        } catch (e) {
          return false;
        }
      })();
    if (haveSrc && def.prefer !== "custom") {
      try {
        // Shared, cached material from the textures module (keeps its anti-tiling macro variation).
        const o = { vertexColors: true };
        if (def.tint !== undefined) o.color = def.tint;
        if (def.metal !== undefined) o.metalness = def.metal;
        const base = G.mats.get(def.src, o);
        if (base && base.isMaterial) {
          m = base;
          m.userData.lbSrc = def.src;
        }
      } catch (e) {
        m = null;
      }
    }
    if (!m) {
      const opts = {
        color: def.color,
        roughness: def.rough === undefined ? 0.9 : def.rough,
        metalness: def.metal || 0,
        vertexColors: true,
      };
      const ct =
        def.custom && def.custom !== "verdigris"
          ? LB.customTex(def.custom)
          : null;
      if (def.custom === "verdigris") {
        opts.map = LB.verdigrisTex();
        opts.color = def.tint !== undefined ? def.tint : 0xffffff;
      } else if (ct) {
        opts.map = ct;
        opts.color = def.tint !== undefined ? def.tint : 0xffffff;
        if (def.bump) {
          opts.bumpMap = ct;
          opts.bumpScale = def.bump;
        }
      } else if (!def.plain)
        opts.map =
          def.src === "metal_painted" ||
          def.src === "rust" ||
          def.src === "metal_panel"
            ? LB.grimeTex()
            : LB.noiseTex();
      if (def.emissive !== undefined) {
        opts.emissive = def.emissive;
        opts.emissiveIntensity = def.emissiveIntensity || 1;
        if (def.emissiveMapCustom && ct) opts.emissiveMap = ct;
      }
      m = new THREE.MeshStandardMaterial(opts);
      m.userData.shared = true;
    }
    m.userData.lbKey = m.userData.lbKey || key;
    if (def.noShadow) NO_SHADOW.add(key);
    return (matCache[key] = m);
  };
  /** Clone a material and add `albedo * bake` (per-vertex baked lamp light) to its emission. */
  function makeBakedVariant(base, key) {
    const m = base.clone();
    m.vertexColors = true;
    m.userData = Object.assign({}, base.userData, {
      shared: true,
      lbKey: key,
      lbBaked: true,
    });
    m.onBeforeCompile = function (sh) {
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec3 bake;\nvarying vec3 vLbBake;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvLbBake = bake;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vLbBake;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          "#include <emissivemap_fragment>\ntotalEmissiveRadiance += diffuseColor.rgb * vLbBake * 1.6;",
        );
    };
    m.customProgramCacheKey = () => "lb_baked_v2";
    m.needsUpdate = true;
    return m;
  }
  /** Register a textured material (signs, flags, banners). Returns the key to use with batch/quad. */
  LB.texMat = function (key, tex, opts) {
    opts = opts || {};
    const k = "tex:" + key;
    if (!matCache[k]) {
      const m = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: opts.rough === undefined ? 0.85 : opts.rough,
        metalness: opts.metal || 0,
        side: opts.side || THREE.FrontSide,
        vertexColors: !!opts.vc,
      });
      if (opts.emissive) {
        m.emissive = new THREE.Color(0xffffff);
        m.emissiveMap = tex;
        m.emissiveIntensity = opts.emissive;
      }
      if (opts.transparent) {
        m.transparent = true;
        m.alphaTest = 0.4;
      }
      if (opts.color !== undefined) m.color = new THREE.Color(opts.color);
      m.userData.shared = true;
      m.userData.uv = 1;
      m.userData.keepUV = true;
      matCache[k] = m;
      if (opts.noShadow) NO_SHADOW.add(k);
    }
    return k;
  };
  /** Use a billboard/brand material from G.mats if available (brand billboards). */
  /**
   * This module's own billboard art (original 1960s ads, painted on a canvas and weathered). LB.brandMat uses it before
   * asking the textures module, so landmark billboards never depend on another module's brand list.
   */
  const AD_ART = {
    fizzo_cola: {
      bg: ["#c8261e", "#8a1610"],
      head: "FIZZO COLA",
      sub: "THE BIG FIZZ · 5¢",
      fg: "#fff4dc",
      bottle: "#5a1a12",
    },
    fizzo_blue: {
      bg: ["#1d4f8f", "#0e2a52"],
      head: "FIZZO BLUE",
      sub: "COOL AS A WINTER SKY",
      fg: "#e8f4ff",
      bottle: "#7fd0ff",
    },
    hi_octane: {
      bg: ["#f2c230", "#d8961a"],
      head: "HI-OCTANE HARRY'S",
      sub: "FULL SERVICE. FULL TANK. FULL SPEED AHEAD.",
      fg: "#3a1608",
      star: "#c82a1a",
    },
    long_winter: {
      bg: ["#e8e4dc", "#b8c4cc"],
      head: "CIVIL DEFENSE ENROLMENT",
      sub: "CARRY YOUR CARD, AMERICA · OFFICE OF CIVIL DEFENSE",
      fg: "#1a2a3a",
      ring: "#e07020",
    },
    prairie_root_beer: {
      bg: ["#6a3a1a", "#3a1e0c"],
      head: "PRAIRIE ROOT BEER",
      sub: "OLD-TIME FLAVOR, POURED COLD.",
      fg: "#f4dca0",
      bottle: "#2a1206",
    },
    freedom_flakes: {
      bg: ["#2a56a8", "#1e3f86"],
      head: "FREEDOM FLAKES",
      sub: "THE BREAKFAST OF A FREE NATION.",
      fg: "#f6eedc",
      disc: "#c42a22",
      letter: "F",
    },
    super_sergeant: {
      bg: ["#f0d040", "#d8a820"],
      head: "SUPER SERGEANT",
      sub: "AMERICA'S FINEST FIGHTING MAN! · BOWERY COMICS",
      fg: "#7a1410",
      disc: "#5a6234",
      letter: "S",
    },
    first_journal: {
      bg: ["#ece6d6", "#c8c0aa"],
      head: "THE FIRST JOURNAL",
      sub: "YOU HEARD IT HERE FIRST.",
      fg: "#1e3a66",
      disc: "#1e3a66",
      letter: "J",
    },
    lonly_tv: {
      bg: ["#2a2a3a", "#14141e"],
      head: "LONLY TELEVISION",
      sub: "THE BEST COMPANY IN THE HOUSE.",
      fg: "#f0e0b0",
      disc: "#c8a040",
      letter: "L",
    },
    burger_brigade: {
      bg: ["#d0301e", "#a01c14"],
      head: "BURGER BRIGADE",
      sub: "FIFTEEN CENTS. FIFTEEN SECONDS.",
      fg: "#fff0c8",
      star: "#f0c030",
    },
  };
