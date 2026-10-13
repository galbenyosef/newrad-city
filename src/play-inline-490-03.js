// play-inline-490 03 — color
// Lines 441-768 of readable/play-inline-490.pretty.js (statement-aligned).
  const MAT_DEFS = {
    gunmetal: {
      color: 0x5c6066,
      metalness: 0.8,
      roughness: 0.42,
      tex: "metal",
      bump: 0.004,
    },
    darksteel: {
      color: 0x383a3e,
      metalness: 0.75,
      roughness: 0.5,
      tex: "metal",
      bump: 0.004,
    },
    steel: {
      color: 0xa4a7ac,
      metalness: 0.9,
      roughness: 0.32,
      tex: "metal",
      bump: 0.003,
    },
    chrome: { color: 0xe6e8ea, metalness: 1.0, roughness: 0.14 },
    brass: { color: 0xc9a14a, metalness: 1.0, roughness: 0.3, tex: "metal" },
    copper: { color: 0xc07448, metalness: 1.0, roughness: 0.32, tex: "metal" },
    gold: { color: 0xe0b848, metalness: 1.0, roughness: 0.22, tex: "metal" },
    wood: {
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.55,
      tex: "wood",
      bump: 0.006,
    },
    woodLight: {
      color: 0xffffff,
      metalness: 0.0,
      roughness: 0.6,
      tex: "woodLight",
      bump: 0.006,
    },
    bakelite: {
      color: 0x5a3220,
      metalness: 0.0,
      roughness: 0.38,
      tex: "grip",
      bump: 0.01,
    },
    rubber: {
      color: 0x1c1c1c,
      metalness: 0.0,
      roughness: 0.85,
      tex: "grip",
      bump: 0.012,
    },
    plastic: {
      color: 0x2a2a2a,
      metalness: 0.0,
      roughness: 0.55,
      tex: "brushed",
    },
    olive: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.6,
      paint: 0x5b6242,
      bump: 0.004,
    },
    tan: {
      color: 0xffffff,
      metalness: 0.25,
      roughness: 0.6,
      paint: 0xa89468,
      bump: 0.004,
    },
    red: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0xa82a22,
      bump: 0.004,
    },
    yellow: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0xd8b030,
      bump: 0.004,
    },
    enamelBlue: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0x2c5aa0,
      bump: 0.004,
    },
    white: { color: 0xffffff, metalness: 0.2, roughness: 0.4, paint: 0xd8d6cc },
    rust: {
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.75,
      tex: "rust",
      bump: 0.008,
    },
    brushed: {
      color: 0x9aa0a6,
      metalness: 0.85,
      roughness: 0.35,
      tex: "brushed",
    },
    tape: { color: 0x8a8a82, metalness: 0.0, roughness: 0.9, tex: "fabric" },
    cloth: { color: 0x6a5a40, metalness: 0.0, roughness: 0.95, tex: "fabric" },
    leather: {
      color: 0x5a3a22,
      metalness: 0.0,
      roughness: 0.7,
      tex: "leather",
    },
    // skin: warm wrap-lit (see P.skinPatch), no emissive — the old flat emissive made the hands read as unlit plastic
    skin: {
      color: 0xc58f72,
      metalness: 0.0,
      roughness: 0.66,
      tex: "skinPlain",
      bump: 0.0025,
      skin: true,
      envK: 0.35,
    },
    blued: {
      color: 0x4a4d53,
      metalness: 0.7,
      roughness: 0.42,
      tex: "blued",
      bump: 0.003,
    }, // worn service finish: dark grey steel that still reads its machining under overcast light (0x35373c/0.82 went pitch-black on the flanks)
    gripGrey: {
      color: 0x8a8e90,
      metalness: 0.0,
      roughness: 0.42,
      tex: "grip",
      bump: 0.011,
    },
    orange: {
      color: 0xffffff,
      metalness: 0.3,
      roughness: 0.45,
      paint: 0xd8641a,
      bump: 0.004,
    },
    gripWood: {
      color: 0x8a5230,
      metalness: 0.0,
      roughness: 0.48,
      tex: "grip",
      bump: 0.011,
    },
    amberRubber: { color: 0xb57a38, metalness: 0.0, roughness: 0.42 },
    sleeve: { color: 0xb9bcb6, metalness: 0.0, roughness: 0.92, tex: "fabric" }, // Long Winter cryo-suit grey-white (matches the NPC suit)
    sleeveTrim: {
      color: 0x7b7f7c,
      metalness: 0.0,
      roughness: 0.85,
      tex: "fabric",
    }, // grey knit cuff (the orange is the collar ring only)
    lens: {
      color: 0x112018,
      metalness: 0.9,
      roughness: 0.05,
      transparent: true,
      opacity: 0.8,
    },
    glass: {
      color: 0x9fe8c0,
      metalness: 0.1,
      roughness: 0.05,
      transparent: true,
      opacity: 0.35,
    },
    // unlit glows
    glowRed: { basic: true, color: 0xff3a24 },
    glowGreen: { basic: true, color: 0x5cff6a },
    glowBlue: { basic: true, color: 0x6ad8ff },
    glowAmber: { basic: true, color: 0xffb040 },
    glowWhite: { basic: true, color: 0xfff4d0 },
  };
  P.MAT_DEFS = MAT_DEFS;

  /**
   * Skin shading for the first-person hands (MeshStandardMaterial patch):
   *  - wrap-around diffuse per colour channel (red light scatters furthest under the skin), so the
   *    terminator is soft and warm instead of the hard plastic falloff of plain Lambert;
   *  - optional per-vertex `skinfx` (x = nail mask, y = palm-side mask): nails and the paler palm /
   *    finger pads keep their own, tone-independent colour (dark skin still has pale palms & pink nails).
   * Works with MeshStandard lights (RE_Direct_Physical, three r158).
   */
  P.skinPatch = function (m, withFx) {
    m.onBeforeCompile = (sh) => {
      let lp = THREE.ShaderChunk.lights_physical_pars_fragment;
      const key =
        "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );";
      if (lp.indexOf(key) >= 0) {
        lp = lp.replace(
          key,
          "float nlS = dot( geometryNormal, directLight.direction );\n" +
            "\tvec3 wrapS = clamp( ( vec3( nlS ) + vec3( 0.46, 0.24, 0.16 ) ) / vec3( 1.46, 1.24, 1.16 ), 0.0, 1.0 );\n" +
            "\twrapS = mix( wrapS, wrapS * wrapS * ( 3.0 - 2.0 * wrapS ), 0.5 );\n" +
            "\treflectedLight.directDiffuse += directLight.color * wrapS * BRDF_Lambert( material.diffuseColor );",
        );
        sh.fragmentShader = sh.fragmentShader.replace(
          "#include <lights_physical_pars_fragment>",
          lp,
        );
      }
      if (withFx) {
        sh.vertexShader =
          "attribute vec2 skinfx;\nvarying vec2 vSkinFx;\n" +
          sh.vertexShader.replace(
            "#include <begin_vertex>",
            "#include <begin_vertex>\n  vSkinFx = skinfx;",
          );
        sh.fragmentShader =
          "varying vec2 vSkinFx;\n" +
          sh.fragmentShader.replace(
            "#include <color_fragment>",
            "#include <color_fragment>\n" +
              "  {\n" +
              "    vec3 texL = vec3( 1.0 );\n" +
              "    #ifdef USE_MAP\n    texL = texture2D( map, vMapUv ).rgb;\n    #endif\n" +
              "    vec3 palm = diffuseColor.rgb * 0.55 + vec3( 0.30, 0.19, 0.155 ) * texL;\n" +
              "    diffuseColor.rgb = mix( diffuseColor.rgb, max( diffuseColor.rgb, palm ), vSkinFx.y * 0.7 );\n" +
              "    vec3 nail = vec3( 0.80, 0.60, 0.55 ) * texL;\n" +
              "    diffuseColor.rgb = mix( diffuseColor.rgb, nail, vSkinFx.x );\n" +
              "  }",
          );
      }
    };
    m.customProgramCacheKey = () => "wpnSkin" + (withFx ? "Fx" : "");
    return m;
  };
  const matCache = { view: {}, world: {} };
  function makeMat(name, world) {
    const d = MAT_DEFS[name] || MAT_DEFS.gunmetal;
    let m;
    if (d.basic) {
      m = new THREE.MeshBasicMaterial({
        color: d.color,
        vertexColors: true,
        toneMapped: false,
        fog: !!world,
      });
    } else {
      m = new THREE.MeshStandardMaterial({
        color: d.color,
        metalness: world ? Math.min(d.metalness, 0.45) : d.metalness,
        roughness: world ? Math.max(d.roughness, 0.45) : d.roughness,
        vertexColors: true,
        transparent: !!d.transparent,
        opacity: d.opacity || 1,
      });
      if (d.paint) {
        m.map = paintTex(name, d.paint);
        if (d.bump && !world) {
          m.bumpMap = paintBumpTex();
          m.bumpScale = d.bump;
        }
      } else if (d.tex) {
        m.map = TEX[d.tex]();
        if (d.bump && !world) {
          m.bumpMap = m.map;
          m.bumpScale = d.bump;
        }
      }
      if (d.emissive && !world) m.emissive = new THREE.Color(d.emissive);
      if (!world) {
        m.envMapIntensity = d.envK || 1.0;
        if (d.envK) m.userData.envK = d.envK;
      }
      if (d.skin && !world) P.skinPatch(m);
      if (world) m.fog = true;
    }
    m.name = "wpn_" + name + (world ? "_w" : "");
    m.userData.shared = true;
    m.userData.wpnMat = name;
    return m;
  }
  /** Material for the viewmodel layer (or world when world=true). */
  P.mat = function (name, world) {
    const set = world ? matCache.world : matCache.view;
    return set[name] || (set[name] = makeMat(name, world));
  };
  P.allViewMats = () => Object.values(matCache.view);
  /** Register a hand-made view material (so env map / light scaling reach it). */
  P.addViewMat = function (key, m) {
    matCache.view["_" + key] = m;
  };

  // ------------------------------------------------------------------
  // Material families (view layer only): kit materials sharing a texture
  // merge into one material; colour → vertex colour, roughness/metalness →
  // a per-vertex 'wrm' attribute read by a tiny onBeforeCompile patch.
  // ------------------------------------------------------------------
  const FAMILY = {
    gunmetal: "metalFam",
    darksteel: "metalFam",
    steel: "metalFam",
    brass: "metalFam",
    copper: "metalFam",
    gold: "metalFam",
    chrome: "metalFam",
    brushed: "brushedFam",
    plastic: "brushedFam",
    rubber: "gripFam",
    bakelite: "gripFam",
    gripGrey: "gripFam",
    gripWood: "gripFam",
    blued: "bluedFam",
    glowRed: "glowFam",
    glowGreen: "glowFam",
    glowBlue: "glowFam",
    glowAmber: "glowFam",
    glowWhite: "glowFam",
  };
  const FAMILY_TEX = {
    metalFam: ["metal", 0.004],
    brushedFam: ["brushed", 0],
    gripFam: ["grip", 0.011],
    bluedFam: ["blued", 0.003],
  };
  P.FAMILY = FAMILY;
