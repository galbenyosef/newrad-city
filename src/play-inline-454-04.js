// play-inline-454 04 — three
// Lines 935-1285 of readable/play-inline-454.pretty.js (statement-aligned).
  L.atlas = function () {
    if (!atlasTex) atlasTex = buildAtlas();
    return atlasTex;
  };
  /** Map a 0..1 uv into an atlas region (with a small inset to avoid bleeding). */
  L.regionUV = function (name, u, v) {
    const r = REG[name] || REG.white;
    const inset = 3;
    const x = r[0] + inset + (r[2] - inset * 2) * u;
    const y = r[1] + inset + (r[3] - inset * 2) * v;
    return [x / ATLAS_SIZE, 1 - y / ATLAS_SIZE];
  };

  // ------------------------------------------------------------------
  // MATERIAL — one shader for every character (per-vertex PBR + FX)
  // Attributes: color (rgb), pbr (roughness, metalness, emissive), partId
  // Uniforms (per character material instance): uFlash, uHiPart, uHiColor,
  // uDissolve, uDissolveColor.  All instances share one GPU program.
  // ------------------------------------------------------------------
  let envTex = null;
  L.envMap = function () {
    if (envTex !== null) return envTex || null;
    envTex = false;
    try {
      if (!G.renderer) return null;
      // tiny equirect: hazy sky above, dusty brown ground below
      const cv = document.createElement("canvas");
      cv.width = 64;
      cv.height = 32;
      const g = cv.getContext("2d");
      const gr = g.createLinearGradient(0, 0, 0, 32);
      gr.addColorStop(0, "#b8bca0");
      gr.addColorStop(0.45, "#d8d0b0");
      gr.addColorStop(0.55, "#6a5e4a");
      gr.addColorStop(1, "#2a241c");
      g.fillStyle = gr;
      g.fillRect(0, 0, 64, 32);
      const t = new THREE.CanvasTexture(cv);
      t.mapping = THREE.EquirectangularReflectionMapping;
      t.colorSpace = THREE.SRGBColorSpace;
      const pm = new THREE.PMREMGenerator(G.renderer);
      envTex = pm.fromEquirectangular(t).texture;
      pm.dispose();
      t.dispose();
    } catch (e) {
      envTex = false;
    }
    return envTex || null;
  };
  // Vertex attributes added by the rig builder:
  //   pbr (roughness mul, metalness mul, emissive), partId (body part),
  //   mcls (material class for per-instance tinting: 0 none, 1 cloth,
  //         2 skin, 3 hair/fur, 4 leather, 5 paint/metal)
  const CHAR_VERT_DECL =
    "#include <common>\nattribute vec3 pbr;\nattribute float partId;\nattribute float mcls;\nvarying vec3 vPbr;\nvarying float vPart;\nvarying float vCls;\nvarying vec3 vLocalP;\n";
  const CHAR_FRAG_DECL = [
    "#include <common>",
    "uniform vec3 uFlash; uniform float uHiPart; uniform vec3 uHiColor; uniform float uDissolve; uniform vec3 uDissolveColor;",
    "uniform vec3 uTints[6]; uniform float uDirt; uniform float uBlood; uniform vec3 uBloodColor; uniform vec3 uRim; uniform float uEmisK;",
    "uniform sampler2D uFaceMap; uniform vec4 uFaceVar;",
    "varying vec3 vPbr; varying float vPart; varying float vCls; varying vec3 vLocalP;",
    "uniform float uBump; uniform float uSss;",
    "float chSkinK = 0.0;", // set in main (colour stage) before lighting: 1 on skin → subsurface wrap
    "float chHash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }",
    "float chNoise(vec3 x){ vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);",
    "  return mix(mix(mix(chHash(i+vec3(0,0,0)), chHash(i+vec3(1,0,0)), f.x), mix(chHash(i+vec3(0,1,0)), chHash(i+vec3(1,1,0)), f.x), f.y),",
    "             mix(mix(chHash(i+vec3(0,0,1)), chHash(i+vec3(1,0,1)), f.x), mix(chHash(i+vec3(0,1,1)), chHash(i+vec3(1,1,1)), f.x), f.y), f.z); }",
  ].join("\n");
  // Per-instance variety (tint by material class), street grime and
  // accumulated blood — all in bind-pose space so it sticks to the body.
  const CHAR_COLOR = [
    "#include <color_fragment>",
    // per-instance tint: never darken already-dark materials (black leather,
    // dark cloth) — below ~sRGB #40 the tint may only brighten
    "{ int ci = int(vCls + 0.5); if (ci > 0 && ci < 6) {",
    "  vec3 chT = uTints[ci]; float chL = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));",
    "  chT = mix(max(chT, vec3(1.0)), chT, smoothstep(0.02, 0.07, chL));",
    "  diffuseColor.rgb *= chT; } }",
    "diffuseColor.rgb = mix(diffuseColor.rgb, chHairC * uTints[3], chHair);",
    "chSkinK = (1.0 - step(0.5, abs(vCls - 2.0))) * (1.0 - chHair) * uSss;",
    // grime: darkens light materials, but reads as pale DUST on dark ones
    // PER-INDIVIDUAL FACE: face maps are per template, so every instance adds
    // its own moles, freckle density, blotchy redness and (Maniacs) raw scab patches
    // in the face's (s,t) space — two NPCs sharing a template never match.
    "#ifdef USE_MAP",
    "if (chFaceK > 0.5 && uFaceVar.w > 0.0 && abs(vCls - 2.0) < 0.5 && chHair < 0.5) {",
    "  vec2 fu = vec2(vMapUv.x - 2.0, 1.0 - vMapUv.y);",
    "  if (fu.y < 0.9) {",
    "    float sd = uFaceVar.w;",
    "    vec2 mg = fu * vec2(26.0, 20.0); vec2 mc = floor(mg);",
    "    float mh = chHash(vec3(mc, sd * 17.0));",
    "    if (mh > 0.972) { vec2 cc = mc + 0.3 + 0.4 * vec2(chHash(vec3(mc, sd + 3.1)), chHash(vec3(mc, sd + 5.7)));",
    "      float sp = 1.0 - smoothstep(0.09, 0.2, length(mg - cc)); diffuseColor.rgb *= mix(vec3(1.0), vec3(0.5, 0.4, 0.35), sp * 0.85); }",
    "    float fn = chNoise(vec3(fu * vec2(210.0, 150.0), sd * 5.0));",
    "    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.8, 0.68, 0.58), smoothstep(0.72, 0.88, fn) * uFaceVar.x);",
    "    float bn = chNoise(vec3(fu * vec2(11.0, 8.0), sd * 3.0 + 7.0));",
    "    diffuseColor.rgb *= mix(vec3(1.0), vec3(1.07, 0.94, 0.93), uFaceVar.y * smoothstep(0.4, 0.8, bn));",
    "    if (uFaceVar.z > 0.0) { float rn = chNoise(vec3(fu * vec2(16.0, 12.0), sd * 2.0 + 1.3)) * 0.75 + chNoise(vec3(fu * vec2(47.0, 35.0), sd)) * 0.25;",
    "      float raw = smoothstep(0.6, 0.72, rn) * uFaceVar.z, crust = (smoothstep(0.55, 0.6, rn) - smoothstep(0.6, 0.66, rn)) * uFaceVar.z;",
    "      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.3, 0.72, 0.62), raw * 0.65) * (1.0 - crust * 0.45); }",
    "  } }",
    "#endif",
    "if (uDirt > 0.0) {",
    "  float dn = chNoise(vLocalP * 5.0) * 0.6 + chNoise(vLocalP * 17.0) * 0.4;",
    "  float low = 0.55 + 0.45 * (1.0 - smoothstep(0.0, 1.1, vLocalP.y));",
    "  float k = uDirt * smoothstep(0.4, 0.78, dn) * low;",
    "  vec3 chD = max(diffuseColor.rgb * vec3(0.55, 0.49, 0.4), vec3(0.075, 0.062, 0.045));",
    "  diffuseColor.rgb = mix(diffuseColor.rgb, chD, k);",
    "}",
    "if (uBlood > 0.0) {",
    "  float bn = chNoise(vLocalP * 9.0 + 3.7) * 0.7 + chNoise(vLocalP * 31.0) * 0.3;",
    "  float bk = smoothstep(1.0 - uBlood * 0.45, 1.02 - uBlood * 0.45, bn);",
    "  diffuseColor.rgb = mix(diffuseColor.rgb, uBloodColor, bk * 0.85);",
    "}",
  ].join("\n");
  // FACE MAP: vertices whose uv.x lies in [2,3) sample the per-character face
  // texture (skin detail painted in the head's own parameter space) instead of
  // the shared atlas. The face texture is stored LINEAR with 0.5 = neutral, so
  // it can both darken (brows, stubble, sockets) and brighten (scars, lips).
  // Its alpha channel is a roughness multiplier (oily T-zone, wet lips).
  // Both textures are always sampled (no divergent texture fetches).
  // Texels with alpha ≈ 0.2 are HAIR painted into the face (brows, stubble):
  // their rgb is the ABSOLUTE hair colour (sqrt-encoded) and replaces the
  // skin after the vertex colour, tinted by the per-instance HAIR tint — so
  // brows always match the character's (tinted) hair.
  const CHAR_MAP = [
    "float chFaceRough = 1.0; float chHair = 0.0; vec3 chHairC = vec3(0.0); float chFaceK = 0.0;",
    "#ifdef USE_MAP",
    "{ vec4 chA = texture2D(map, vMapUv);",
    "  vec4 chF = texture2D(uFaceMap, vec2(vMapUv.x - 2.0, vMapUv.y));",
    "  float chK = step(1.5, vMapUv.x); chFaceK = chK;",
    // hair shells with partial coverage (mcls 2.55..3): strand-shaped discard —
    // bright strands survive longest; beyond ~6 m a plain coverage threshold (stable, no shimmer)
    "  if (vCls > 2.52 && vCls < 2.995) {",
    "    float chCov = clamp((vCls - 2.55) / 0.45, 0.0, 1.0);",
    "    float chS = clamp((dot(chA.rgb, vec3(0.3333)) - 0.3) * 1.8, 0.0, 1.0);",
    "    float chN = chNoise(vLocalP * vec3(900.0, 70.0, 900.0)) * 0.65 + chNoise(vLocalP * vec3(260.0, 900.0, 260.0)) * 0.35;",
    "    float chH = mix(chS * 0.55 + chN * 0.45, 0.5, smoothstep(4.0, 9.0, length(vViewPosition)));",
    "    if (chH < 1.0 - chCov) discard;",
    "  }",
    "  chHair = chK * (1.0 - smoothstep(0.24, 0.42, chF.a));",
    "  chHairC = chF.rgb * chF.rgb;",
    "  vec4 sampledDiffuseColor = mix(chA, vec4(chF.rgb * 2.0, 1.0), chK);",
    "  chFaceRough = mix(1.0, chF.a, chK * (1.0 - chHair));",
    "  diffuseColor *= sampledDiffuseColor; }",
    "#endif",
  ].join("\n");
  const CHAR_EMISSIVE = [
    "#include <emissivemap_fragment>",
    // soft rim (sky bounce) so dark armour and clothing keep a readable silhouette
    "{ float chF = 1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);",
    "  totalEmissiveRadiance += uRim * (chF * chF * chF) * (0.3 + diffuseColor.rgb); }",
    "totalEmissiveRadiance += diffuseColor.rgb * vPbr.z * uEmisK + uFlash;",
    "if (uHiPart >= 0.0 && abs(vPart - uHiPart) < 0.5) totalEmissiveRadiance += uHiColor;",
    "if (uDissolve > 0.0) {",
    "  float dn = chNoise(vLocalP * 9.0) * 0.65 + chNoise(vLocalP * 23.0) * 0.35;",
    "  if (dn < uDissolve) discard;",
    "  float edge = 1.0 - smoothstep(uDissolve, uDissolve + 0.08, dn);",
    "  totalEmissiveRadiance += uDissolveColor * edge * 4.0;",
    "  diffuseColor.rgb *= mix(1.0, 0.25, smoothstep(0.0, 1.0, uDissolve * 1.5));",
    "}",
  ].join("\n");
  // SURFACE RELIEF: derivative bump mapping from the luminance of whatever
  // the fragment samples (atlas: weave, seams, stitching, folds, leather
  // grain, rivets, fur strands; face map: pores, wrinkles, scars, scabbed
  // crust). Heights are in METRES per unit of luminance (Mikkelsen's
  // unnormalised surface-gradient form → resolution independent, so close-ups
  // keep their relief), scaled per material class, faded out beyond 30 m.
  const CHAR_BUMP = [
    "#include <normal_fragment_maps>",
    "#if defined(USE_MAP) && __VERSION__ >= 300",
    "{ vec2 chUv = vMapUv; vec2 chDx = dFdx(chUv), chDy = dFdy(chUv);",
    "  vec3 chSX = dFdx(-vViewPosition), chSY = dFdy(-vViewPosition);",
    "  float chBk = uBump * (1.0 - smoothstep(14.0, 30.0, length(vViewPosition)));",
    "  int chC = int(vCls + 0.5);",
    "  chBk *= chC == 1 ? 1.0 : chC == 2 ? 0.55 : chC == 3 ? 1.6 : chC == 4 ? 0.9 : chC == 5 ? 0.45 : 0.6;",
    "  if (chBk > 1e-7) {",
    "    const vec3 chLW = vec3(0.299, 0.587, 0.114); float h0, hx, hy;",
    "    if (chUv.x > 1.5) { vec2 fu = chUv - vec2(2.0, 0.0);",
    "      h0 = dot(textureGrad(uFaceMap, fu, chDx, chDy).rgb, chLW); hx = dot(textureGrad(uFaceMap, fu + chDx, chDx, chDy).rgb, chLW); hy = dot(textureGrad(uFaceMap, fu + chDy, chDx, chDy).rgb, chLW); }",
    "    else { vec2 gx = chDx * 1.8, gy = chDy * 1.8; h0 = dot(textureGrad(map, chUv, gx, gy).rgb, chLW); hx = dot(textureGrad(map, chUv + chDx, gx, gy).rgb, chLW); hy = dot(textureGrad(map, chUv + chDy, gx, gy).rgb, chLW); }",
    "    vec2 dH = vec2(hx - h0, hy - h0) * chBk;",
    "    vec3 R1 = cross(chSY, normal), R2 = cross(normal, chSX);",
    "    float fDet = dot(chSX, R1) * faceDirection;",
    "    vec3 vGrad = sign(fDet) * (dH.x * R1 + dH.y * R2);",
    "    vec3 chN = abs(fDet) * normal - vGrad;",
    "    if (dot(chN, chN) > 1e-24) normal = normalize(chN);",
    "  } }",
    "#endif",
  ].join("\n");
  // SKIN: wrapped diffuse with a wider red wrap (cheap subsurface scattering)
  // — warm, soft terminators instead of the hard plastic falloff. Patched
  // into the physical direct-light function; skipped if the chunk differs.
  let physChunk = null;
  function charPhysChunk() {
    if (physChunk !== null) return physChunk;
    physChunk = false;
    try {
      const src = THREE.ShaderChunk.lights_physical_pars_fragment;
      const a = "vec3 irradiance = dotNL * directLight.color;";
      const b =
        "reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );";
      const m =
        /float dotNL = saturate\( dot\( ([\w.]+), directLight\.direction \) \);/.exec(
          src,
        );
      if (src && m && src.indexOf(a) >= 0 && src.indexOf(b) >= 0) {
        physChunk = src
          .replace(
            a,
            a +
              "\n\tvec3 chIrrD = irradiance;\n\tif (chSkinK > 0.0) { float chD = dot(" +
              m[1] +
              ", directLight.direction);" +
              " vec3 chW = clamp((vec3(chD) + vec3(0.62, 0.34, 0.26)) / vec3(1.62, 1.34, 1.26), 0.0, 1.0);" +
              " chIrrD = mix(irradiance, chW * directLight.color * vec3(1.0, 0.97, 0.95), chSkinK); }",
          )
          .replace(
            b,
            "reflectedLight.directDiffuse += chIrrD * BRDF_Lambert( material.diffuseColor );",
          );
      }
    } catch (e) {
      physChunk = false;
    }
    return physChunk;
  }
  /** Uniforms shared by EVERY character material (one object → one update per frame). */
  L.shared = {
    uRim: { value: new THREE.Color(0.05, 0.052, 0.046) },
    uBump: { value: 0.0016 }, // relief height (m) per unit luminance; 0 disables
    uSss: { value: 0.85 }, // skin subsurface wrap strength; 0 disables
  };
  L.makeMaterial = function (opts) {
    opts = opts || {};
    // FrontSide: open surfaces (coat panels, hoods, masks, visors) get an
    // inner shell at build time, so back-face culling is safe; shadows are
    // rendered from back faces (less acne on skinned bodies).
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: L.atlas(),
      roughness: 1,
      metalness: 1,
      side: opts.side || THREE.FrontSide,
    });
    m.shadowSide =
      opts.side === THREE.DoubleSide ? THREE.DoubleSide : THREE.BackSide;
    const env = G.scene && G.scene.environment ? null : L.envMap();
    if (env) {
      m.envMap = env;
      m.envMapIntensity = 0.55;
    }
    const white = () => new THREE.Color(1, 1, 1);
    const u = (m.userData.uniforms = {
      uFlash: { value: new THREE.Color(0, 0, 0) },
      uHiPart: { value: -1 },
      uHiColor: { value: new THREE.Color(0, 0, 0) },
      uDissolve: { value: 0 },
      uDissolveColor: { value: new THREE.Color(1, 0.4, 0.1) },
      uTints: { value: [white(), white(), white(), white(), white(), white()] },
      uDirt: { value: 0 },
      uEmisK: { value: 1 },
      uBlood: { value: 0 },
      uBloodColor: { value: new THREE.Color(0.2, 0.015, 0.01) },
      uFaceMap: { value: L.faceTexDefault() },
      uFaceVar: { value: new THREE.Vector4(0, 0, 0, 0) }, // per-individual face: freckles, redness, raw scabs, seed (0 = off)
      uRim: L.shared.uRim,
      uBump: L.shared.uBump,
      uSss: L.shared.uSss,
    });
    m.onBeforeCompile = function (shader) {
      Object.assign(shader.uniforms, u);
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", CHAR_VERT_DECL)
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvPbr = pbr; vPart = partId; vCls = mcls; vLocalP = position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", CHAR_FRAG_DECL)
        .replace("#include <color_fragment>", CHAR_COLOR)
        .replace("#include <map_fragment>", CHAR_MAP)
        .replace(
          "#include <roughnessmap_fragment>",
          "float roughnessFactor = clamp(roughness * vPbr.x * chFaceRough, 0.04, 1.0);",
        )
        .replace(
          "#include <metalnessmap_fragment>",
          "float metalnessFactor = metalness * vPbr.y;",
        )
        .replace("#include <emissivemap_fragment>", CHAR_EMISSIVE)
        .replace("#include <normal_fragment_maps>", CHAR_BUMP);
      const phys = charPhysChunk();
      if (phys)
        shader.fragmentShader = shader.fragmentShader.replace(
          "#include <lights_physical_pars_fragment>",
          phys,
        );
    };
    m.customProgramCacheKey = function () {
      return "nrc_char_v8" + (m.envMap ? "_env" : "");
    };
    return m;
  };
  /**
   * Default face texture: the generic face painted by the humans builder
   * (L.faceGeneric, same head parameterisation for every human head), or a
   * 1×1 neutral grey (0.5 → ×1) until it exists.
   */
  let neutralFace = null;
  L.faceTexDefault = function () {
    if (L.faceGeneric) {
      try {
        const t = L.faceGeneric();
        if (t) return t;
      } catch (e) {
        /* fall through */
      }
    }
    if (!neutralFace) {
      neutralFace = new THREE.DataTexture(
        new Uint8Array([128, 128, 128, 255]),
        1,
        1,
        THREE.RGBAFormat,
      );
      neutralFace.needsUpdate = true;
    }
    return neutralFace;
  };
  /** Shared (never per-character) material used by gibs & player arms. */
  let sharedMat = null;
  L.sharedMaterial = function () {
    if (!sharedMat) {
      sharedMat = L.makeMaterial();
      sharedMat.userData.shared = true;
    }
    return sharedMat;
  };

  // ------------------------------------------------------------------
  // GEOMETRY PRIMITIVES — all return non-indexed-or-indexed BufferGeometry
  // with position/normal/uv. Coordinates are bone-local metres.
  // ------------------------------------------------------------------
  const P = (L.prim = {});
  const _m4 = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3();
  /** Bake transform: position (x,y,z), rotation euler XYZ (rx,ry,rz), scale (sx,sy,sz | single). */
