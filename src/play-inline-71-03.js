// play-inline-71 03 — the
// Lines 377-662 of readable/play-inline-71.pretty.js (statement-aligned).
  function interiorBlock() {
    return `
    float nrcIO = 1.0;
    #if defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS >= 2 ) && ( NUM_DIR_LIGHTS >= 2 ) && defined( USE_FOG )
    if ( nrcCsm.x > 1.5 ) {
      vec4 nrcIc = vDirectionalShadowCoord[ 1 ]; nrcIc.xyz /= nrcIc.w;
      vec2 nrcIe = abs( nrcIc.xy - 0.5 ) * 2.0;
      float nrcIm = max( nrcIe.x, nrcIe.y );
      if ( nrcIm < 1.0 && nrcIc.z >= 0.0 && nrcIc.z <= 1.0 ) {
        float nrcIn = dot( geometryNormal, directionalLights[ 1 ].direction );
        if ( nrcIn > -0.3 ) {
          float nrcIs = min( sqrt( max( 1.0 - nrcIn * nrcIn, 0.0 ) ) / max( nrcIn, 0.08 ), 8.0 );
          float nrcIv = nrcSoftShadow( directionalShadowMap[ 1 ], directionalLightShadows[ 1 ].shadowMapSize,
            directionalLightShadows[ 1 ].shadowBias, nrcIc.xyz, nrcIs * nrcCsm3.x * 1.3 );
          nrcIO = mix( nrcIv, 1.0, smoothstep( 0.85, 1.0, nrcIm ) );
        }
      }
    }
    #endif
`;
  }

  // VIRTUAL LIGHTS: street lamps, fires, shop pendants, interior fixtures… evaluated per fragment
  // from a camera-centred tile grid (≤ 8 lights per 8 m tile) through the material's own RE_Direct
  // (diffuse + specular: wet asphalt glints under a lamp). World materials only (USE_FOG — the
  // viewmodel / goggles scenes have no fog). No shadows; lamp heads get a soft downward cone.
  function vlBlock() {
    const TW = VL.TW.toFixed(1),
      TH = VL.TH.toFixed(1),
      GN = VL.GN.toFixed(1);
    return `
    #if defined( RE_Direct ) && defined( USE_FOG )
    if ( nrcVL.x > 0.5 ) {
      vec3 nrcVW = ( vec4( geometryPosition, 0.0 ) * viewMatrix ).xyz + cameraPosition;
      vec2 nrcVG = ( nrcVW.xz - nrcVL.yz ) * nrcVL.w;
      if ( nrcVG.x >= 0.0 && nrcVG.y >= 0.0 && nrcVG.x < ${GN} && nrcVG.y < ${GN} ) {
        float nrcVI = ( floor( nrcVG.y ) * ${GN} + floor( nrcVG.x ) ) * 2.0;
        for ( int nrcVH = 0; nrcVH < 2; nrcVH ++ ) {
          float nrcVX = nrcVI + float( nrcVH );
          vec4 nrcVIds = texture2D( nrcVLTex, vec2( ( mod( nrcVX, ${TW} ) + 0.5 ) / ${TW}, ( floor( nrcVX / ${TW} ) + 2.5 ) / ${TH} ) );
          if ( nrcVIds.x < 0.5 ) break;
          if ( nrcVL2.w > 0.5 && nrcVH == 0 ) reflectedLight.directDiffuse += vec3( 0.25, 0.0, 0.25 ) * nrcVIds.x * 0.1;   // ?rldebug=1: tiles with lights
          for ( int nrcVJ = 0; nrcVJ < 4; nrcVJ ++ ) {
            float nrcVId = nrcVIds[ nrcVJ ];
            if ( nrcVId < 0.5 || float( nrcVH * 4 + nrcVJ ) >= nrcVL2.x ) break;
            float nrcVU = ( nrcVId - 0.5 ) / ${TW};
            vec4 nrcVP = texture2D( nrcVLTex, vec2( nrcVU, 0.5 / ${TH} ) );
            vec3 nrcVLv = nrcVP.xyz - nrcVW;
            float nrcVD2 = dot( nrcVLv, nrcVLv );
            if ( nrcVD2 >= nrcVP.w * nrcVP.w ) continue;
            vec4 nrcVC = texture2D( nrcVLTex, vec2( nrcVU, 1.5 / ${TH} ) );
            float nrcVD = sqrt( nrcVD2 );
            vec3 nrcVN = nrcVLv / max( nrcVD, 1e-3 );
            // soft inverse square (1 m core: no hot spot on the wall a lamp hangs on) × smooth range window
            float nrcVWin = saturate( 1.0 - pow4( nrcVD / nrcVP.w ) );
            float nrcVAt = nrcVWin * nrcVWin / ( nrcVD2 + 1.0 );
            // lamp heads throw their light downward (w = cone strength); fragments above the head keep a little
            nrcVAt *= mix( 1.0, 0.06 + 0.94 * smoothstep( 0.1, 0.75, nrcVN.y ), nrcVC.w );
            nrcVAt *= mix( 1.0, nrcIO, 0.85 * saturate( nrcVN.y + 0.3 ) );   // indoors: lamps above are blocked by what is overhead
            directLight.color = nrcVC.rgb * nrcVAt;
            #ifdef NRC_BAKED
            directLight.color *= nrcVL2.y;
            #endif
            directLight.direction = ( viewMatrix * vec4( nrcVN, 0.0 ) ).xyz;   // unit (rotation) — never normalize(0) → NaN
            directLight.visible = true;
            RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
          }
        }
      }
    }
    #endif
`;
  }

  // Originals are kept so a failing GPU/driver can be put back on stock three.js lighting.
  R.orig = null;
  function patchChunks() {
    const SC = THREE.ShaderChunk;
    if (!SC || R._patched) return false;
    const LFB = SC.lights_fragment_begin;
    if (!LFB || !SC.lights_pars_begin || !SC.shadowmap_pars_fragment) {
      console.warn(
        "[render_lighting] three chunks missing, lighting patches skipped",
      );
      return false;
    }
    // 1) the directional-light shadow statement (atmosphere's cloud-shadow line stays right after it)
    const rxDir =
      /directLight\.color \*= \( directLight\.visible && receiveShadow \) \? getShadow\( directionalShadowMap\[ i \], directionalLightShadow\.shadowMapSize, directionalLightShadow\.shadowBias, directionalLightShadow\.shadowRadius, vDirectionalShadowCoord\[ i \] \) : 1\.0;/;
    // 2) the directional loop header (insertion point for the per-fragment block)
    const rxDirHead = /#if \( NUM_DIR_LIGHTS > 0 \) && defined\( RE_Direct \)/;
    // 3) the hemisphere accumulation
    const rxHemi =
      /irradiance \+= getHemisphereLightIrradiance\( hemisphereLights\[ i \], geometryNormal \);/;
    // 4) the RE_Direct call of the directional loop (fill scaling + near-carrier skip go right before it)
    const rxDirRE =
      /(directionalLightShadow = directionalLightShadows\[ i \];[\s\S]*?#endif)(\s*)(RE_Direct\( directLight)/;
    // 5) the spot-light loop header (virtual lights go right before it, after the point lights)
    const rxSpot = /#if \( NUM_SPOT_LIGHTS > 0 \) && defined\( RE_Direct \)/;
    // 6) the incident-light declaration (the interior overhead shadow is computed right after it, before any loop)
    const rxIL = /IncidentLight directLight;/;
    // 7) the end of the indirect-diffuse block (ambient + hemisphere accumulated → interior overhead shadow)
    const rxIndEnd =
      /(irradiance \+= getHemisphereLightIrradiance\( hemisphereLights\[ i \], geometryNormal \);\s*\}\s*#pragma unroll_loop_end\s*#endif)/;
    if (
      !rxDir.test(LFB) ||
      !rxDirHead.test(LFB) ||
      !rxHemi.test(LFB) ||
      !rxDirRE.test(LFB) ||
      !rxIL.test(LFB)
    ) {
      console.warn(
        "[render_lighting] three lights_fragment_begin changed — lighting patches skipped (plain atmosphere lighting)",
      );
      return false;
    }
    // the canyon terms need atmosphere's world-position varying; without it they compile out
    const hasRay =
      /vFogRay/.test(SC.fog_pars_fragment || "") &&
      /vFogRay/.test(SC.fog_vertex || "");
    R.orig = {
      lights_fragment_begin: LFB,
      lights_pars_begin: SC.lights_pars_begin,
      shadowmap_pars_fragment: SC.shadowmap_pars_fragment,
    };
    let s = LFB.replace(
      rxDir,
      `
		#if defined( NRC_FAR_ON ) && ( UNROLLED_LOOP_INDEX == 0 )
		directLight.color *= nrcIO;   // interior key light under the overhead shadow (1 outdoors)
		#ifdef NRC_CSM_ON
		if ( nrcCsm.x > 0.5 ) directLight.color += directionalLights[ 1 ].color;   // the carrier is black; never lose the key light
		#endif
		if ( directLight.visible && receiveShadow ) {
			float nrcFar = ( nrcCsmW > 0.999 || nrcFarFade > 0.999 ) ? 1.0 : getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] );
			float nrcSh = mix( mix( nrcFar, nrcHzSun, nrcFarFade ), nrcCsmS, nrcCsmW );
			directLight.color *= mix( 1.0, nrcSh, nrcCsm3.z );
			if ( nrcCsm3.y > 0.5 ) directLight.color *= mix( mix( vec3( 1.0 ), vec3( 0.3, 0.45, 1.0 ), nrcFarFade ), vec3( 1.0, 0.3, 0.3 ), nrcCsmW );
		}
		#elif defined( NRC_CSM_ON ) && ( UNROLLED_LOOP_INDEX == 1 )
		if ( nrcCsm.x > 0.5 ) directLight.color = vec3( 0.0 );
		else directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#else
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif`,
    );
    // non-shadow directional lights (atmosphere's bounce fill): directional canyon bounce;
    // the near-cascade carrier (#1) skips its (black) lighting evaluation entirely
    s = s.replace(
      rxDirRE,
      `$1
		#if ( UNROLLED_LOOP_INDEX >= NUM_DIR_LIGHT_SHADOWS )
		directLight.color *= nrcFillK;
		#if defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS >= 2 )
		directLight.color *= mix( 1.0, nrcIO, nrcCsm3.w );
		#endif
		#endif
		#if defined( NRC_CSM_ON ) && ( UNROLLED_LOOP_INDEX == 1 )
		if ( nrcCsm.x < 0.5 )
		#endif$2$3`,
    );
    s = s.replace(
      rxDirHead,
      mainPre(hasRay) + "\n#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )",
    );
    // indirect diffuse under the interior overhead shadow (before the hemisphere swap: the anchor text changes)
    R.ioIndirect = false;
    if (rxIndEnd.test(s)) {
      s = s.replace(
        rxIndEnd,
        `$1
	#if defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS >= 2 )
	irradiance *= mix( 1.0, nrcIO, nrcCsm3.w );
	if ( nrcCsm3.y > 0.5 && nrcCsm.x > 1.5 ) reflectedLight.directDiffuse += vec3( 1.0 - nrcIO, 0.0, 0.0 );   // ?rldebug=1 indoors: overhead shadow red
	#endif`,
      );
      R.ioIndirect = true;
    }
    s = s.replace(
      rxHemi,
      "irradiance += nrcHemiIrr( hemisphereLights[ i ], geometryNormal, nrcVis, nrcPark, nrcBcol );",
    );
    s = s.replace(rxIL, "IncidentLight directLight;\n" + interiorBlock());
    // virtual lights (optional: a changed spot-loop header only loses this feature)
    R.vlPatched = false;
    if (rxSpot.test(s) && !R.vlOff) {
      s = s.replace(
        rxSpot,
        vlBlock() + "\n#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )",
      );
      R.vlPatched = true;
    }
    SC.lights_fragment_begin = s;
    SC.lights_pars_begin = SC.lights_pars_begin + PARS_LIGHTS;
    SC.shadowmap_pars_fragment = SC.shadowmap_pars_fragment + PARS_SHADOW;
    // hand the shared parameter objects to every lit built-in shader + UniformsLib.lights
    const add = (u) => {
      if (!u) return;
      for (const k in U) u[k] = { value: U[k].value };
    };
    add(THREE.UniformsLib && THREE.UniformsLib.lights);
    for (const k of ["standard", "physical", "lambert", "phong", "toon"]) {
      const L = THREE.ShaderLib[k];
      if (L && L.uniforms) add(L.uniforms);
    }
    R._patched = true;
    R.hasRay = hasRay;
    return true;
  }
  R.patched = safeMode ? false : patchChunks();
  RL.patched = R.patched;
  if (safeMode)
    console.warn(
      "[render_lighting] safe mode (nrc_rl_safe / ?rl=0): lighting patches skipped",
    );

  /** Put stock three.js lighting back (shader failure fallback). Every lit material must recompile. */
  R.unpatch = function () {
    if (!R._patched || !R.orig) return false;
    const SC = THREE.ShaderChunk;
    for (const k in R.orig) SC[k] = R.orig[k];
    R._patched = false;
    R.patched = RL.patched = false;
    // the program cache key does not include chunk text: bust it so programs are rebuilt
    const proto = THREE.Material && THREE.Material.prototype;
    if (proto && !proto._nrcKeyBust) {
      const orig = proto.customProgramCacheKey;
      proto.customProgramCacheKey = function () {
        return (orig ? orig.call(this) : "") + "|rlsafe";
      };
      proto._nrcKeyBust = true;
    }
    return true;
  };

  // ------------------------------------------------------------------
  // helpers
  // ------------------------------------------------------------------
  R.damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  R.quality = function () {
    const A = G.atmos || {};
    const q = A.quality || "high";
    const t = Math.max(
      q === "low" ? 2 : q === "medium" ? 1 : 0,
      A.perfTier | 0,
    );
    return Math.min(2, t); // 0 full, 1 reduced, 2 low
  };
  R.interior = function () {
    if (G.atmos && typeof G.atmos.interior === "boolean" && !G.isStub("atmos"))
      return G.atmos.interior;
    const c = G.camera;
    return !!(c && G.LAYOUT && c.position.x >= G.LAYOUT.INTERIOR_X_MIN);
  };
  /** key light (sun by day, moon by night) as atmosphere aims it: world direction TOWARD the light */
  R.keyDir = function (out) {
    const A = G.atmos,
      sun =
        A && A.sun && A.sun.isDirectionalLight
          ? A.sun
          : G.baseLights && G.baseLights.sun;
    if (!sun) return null;
    out.copy(sun.position).sub(sun.target.position);
    if (out.lengthSq() < 1e-8) return null;
    return out.normalize();
  };
  /** weather overcast factor 0..1 (0 clear, ~0.35 overcast, ~0.75 rain / thunderstorm) */
  R.overcast = function () {
    try {
      const A = G.atmos;
      if (!A || G.isStub("atmos") || !A.getWeatherParams) return 0;
      const w = A.getWeatherParams();
      if (!w) return 0;
      return Math.min(
        1,
        Math.max(
          0,
          (w.cloud || 0) * (w.cloudDark || 0) +
            (w.dust || 0) * 0.35 +
            (w.rain || 0) * 0.1,
        ),
      );
    } catch (e) {
      return 0;
    }
  };
