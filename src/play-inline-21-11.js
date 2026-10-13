// play-inline-21 11 — params
// Lines 3000-3261 of readable/play-inline-21.pretty.js (statement-aligned).
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

