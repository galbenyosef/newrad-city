// play-inline-71 02 — the
// Lines 44-376 of readable/play-inline-71.pretty.js (statement-aligned).
  const RL = (G.rlight = {
    ready: false,
    cascades: true, // near shadow cascade (quality-gated, see 10_cascade.js)
    probes: true, // canyon probe atlas (see 20_probes.js)
    autoBake: true, // automatic interior light bake (see 30_bake.js)
    contact: true, // contact blobs under cars and actors (see 40_contact.js)
    lights: true, // virtual lights: lamps / fires / fixtures (see 50_lights.js)
  });
  // private shared object for the files of this directory
  const R = {
    systems: [],
    tmpV: new THREE.Vector3(),
    tmpV2: new THREE.Vector3(),
  };
  Object.defineProperty(RL, "_", {
    value: R,
    enumerable: false,
    writable: false,
  });
  R.addSystem = function (s) {
    if (s.order === undefined) s.order = 50;
    R.systems.push(s);
    R.systems.sort((a, b) => a.order - b.order);
    return s;
  };

  // persisted toggles (per viewer; the game renders fine without them)
  let safeMode = false;
  try {
    const c = localStorage.getItem("nrc_rl_cascades");
    if (c === "0") RL.cascades = false;
    const p = localStorage.getItem("nrc_rl_probes");
    if (p === "0") RL.probes = false;
    if (localStorage.getItem("nrc_rl_bake") === "0") RL.autoBake = false;
    if (localStorage.getItem("nrc_rl_vl") === "0") R.vlOff = true;
    // a patched program failed on this machine before → plain atmosphere lighting
    if (localStorage.getItem("nrc_rl_safe") === "1") safeMode = true;
  } catch (e) {
    /* storage blocked */
  }
  try {
    const qs = new URLSearchParams(location.search);
    if (qs.get("csm") === "0") RL.cascades = false;
    if (qs.get("probes") === "0") RL.probes = false;
    if (qs.get("rlbake") === "0") RL.autoBake = false;
    if (qs.get("rlcontact") === "0") RL.contact = false;
    if (qs.get("rlvl") === "0") R.vlOff = true; // virtual lights compiled out (A/B shots)
    if (qs.get("rlsafe") === "0") safeMode = false;
    if (qs.get("rl") === "0") {
      safeMode = true;
      RL.autoBake = false;
      RL.contact = false;
    } // whole module off (A/B shots)
    RL.debug = qs.get("rldebug") === "1";
    RL._parity = Number(qs.get("rlparity")) | 0; // test tools: which pass the last shot frame renders
  } catch (e) {
    /* ignore */
  }
  RL.safeMode = safeMode;

  // ------------------------------------------------------------------
  // Shared uniforms (plain {x,y,z,w} objects are shared by reference through
  // UniformsUtils.clone; three's uniform setters accept them).
  // ------------------------------------------------------------------
  const U = (R.uniforms = {
    // x: near cascade mode: 0 off, 1 outdoor cascade, 2 INTERIOR overhead shadow (the same map, aimed straight
    //    down under a ceiling cut — see 10_cascade.js), y: near→far blend start (0..1 of the near half-extent),
    // z: far cascade fade-out start (0 = no fade), w: soft filter on (1) / plain PCF (0)
    nrcCsm: { value: { x: 0, y: 0.82, z: 0, w: 1 } },
    // x: blocker-search radius (texels), y: penumbra scale (texels per unit of shadow depth),
    // z: min filter radius (texels), w: max filter radius (texels)
    nrcCsm2: { value: { x: 6, y: 100, z: 1, w: 6 } },
    // x: near-cascade depth change per texel per unit of surface slope (receiver-plane bias),
    // y: debug tint (1 = near cascade red, far fade blue; ?rldebug=1), z: sun-shadow strength (weather),
    // w: interior overhead-shadow strength on the ambient / hemisphere / fill light (0 outdoors)
    nrcCsm3: { value: { x: 0.00003, y: 0, z: 1, w: 0 } },
    // x: blocker-search taps, y: PCF taps (tier 0: 8/12, tier 1: 4/8)
    nrcCsm4: { value: { x: 8, y: 12, z: 0, w: 0 } },
    // probe atlas mapping: tile uv = worldXZ * xy + zw
    nrcProbe: { value: { x: 0, y: 0, z: 0, w: 0 } },
    // x: 1/tilesX, y: 1/tilesY, z/w: half a texel (tile uv) — keeps bilinear taps inside a tile
    nrcAtlas: { value: { x: 1 / 3, y: 1 / 2, z: 0.5 / 400, w: 0.5 / 608 } },
    // x: strength (0 = off), y: min sky visibility, z: lit-façade fill gain, w: canyon height scale (m)
    nrcProbeK: { value: { x: 0, y: 0.3, z: 2.0, w: 320 } },
    // horizon taps: tile indices (x0, y0, x1, y1) of the two azimuth-pair tiles bracketing the key light
    nrcHzT: { value: { x: 1, y: 0, z: 2, w: 0 } },
    // x/y: pair swap (1 = key-light side stored in zw), z: azimuth blend, w: tan(key-light elevation)
    nrcHzK: { value: { x: 0, y: 0, z: 0, w: 1 } },
    // x: horizontal length of the key direction, y: skyline softness (tan), z: fill in dark alleys, w: horizon sun on (1/0)
    nrcHzL: { value: { x: 0.5, y: 0.06, z: 0.6, w: 0 } },
    // interreflected sky that replaces the hidden sky in canyons (linear, before albedo)
    nrcBounce: { value: { x: 0, y: 0, z: 0 } },
    // key light × façade albedo: bounce off the SUNLIT façades (linear, before albedo tint)
    nrcBounceSun: { value: { x: 0, y: 0, z: 0 } },
    // park / grass ground-bounce tint (multiplies the hemisphere ground colour)
    nrcParkTint: { value: { x: 0.86, y: 1.06, z: 0.74 } },
    // VIRTUAL LIGHTS (50_lights.js): x on (1/0), y/z grid origin (world x/z), w 1/tile size
    nrcVL: { value: { x: 0, y: 0, z: 0, w: 1 / 8 } },
    // x max lights per tile (tier), y factor on vertex-baked interior materials, z spec/diffuse wrap (unused 0), w unused
    nrcVL2: { value: { x: 8, y: 0.45, z: 0, w: 0 } },
  });
  // Virtual-light data texture (one sampler): rows 0/1 = light records (pos+range, colour+cone),
  // rows 2.. = the camera-centred tile grid (2 texels × 4 light ids per tile, 0 = none).
  // Created at script load for the same reason as the probe atlas below (shared by every clone).
  const VL = (R.vl = { TW: 256, GN: 40, TILE: 8, PER: 8, MAXL: 255 });
  VL.TH = 2 + Math.ceil((VL.GN * VL.GN * 2) / VL.TW);
  VL.data = new Float32Array(VL.TW * VL.TH * 4);
  VL.tex = new THREE.DataTexture(
    VL.data,
    VL.TW,
    VL.TH,
    THREE.RGBAFormat,
    THREE.FloatType,
  );
  VL.tex.magFilter = THREE.NearestFilter;
  VL.tex.minFilter = THREE.NearestFilter;
  VL.tex.wrapS = VL.tex.wrapT = THREE.ClampToEdgeWrapping;
  VL.tex.generateMipmaps = false;
  VL.tex.flipY = false;
  VL.tex.colorSpace = THREE.NoColorSpace || "";
  VL.tex.needsUpdate = true;
  U.nrcVLTex = { value: VL.tex };
  // The probe atlas must exist BEFORE any material compiles: built-in materials clone their
  // uniforms, and a texture uniform is cloned as a Texture sharing the same Source, so every
  // clone ends up on the same GL texture. The data is filled in progressively and uploaded
  // once through the master object (renderer.initTexture) — the shared GL texture updates for all.
  //   tile 0 (0,0): R sky visibility, G canyon height, B park, A valid
  //   tiles 1–4 ((1,0),(2,0),(0,1),(1,1)): horizon azimuth pair p = tile−1 →
  //       R top(az p), G dist(az p), B top(az p+4), A dist(az p+4)   (azimuth k = k·45°, from +X toward +Z)
  //   tile 5 (2,1): RGB façade/ground albedo tint ÷ 2 (district + park), A unused
  const CELL = 4;
  const WB = (G.LAYOUT && G.LAYOUT.WORLD) || {
    minX: -760,
    maxX: 820,
    minZ: -1000,
    maxZ: 1420,
  };
  const X0 = Math.floor(WB.minX - 12),
    Z0 = Math.floor(WB.minZ - 12);
  const PW = Math.ceil((WB.maxX + 12 - X0) / CELL),
    PH = Math.ceil((WB.maxZ + 12 - Z0) / CELL);
  const TX = 3,
    TY = 2,
    AW = PW * TX,
    AH = PH * TY;
  const probeData = new Uint8Array(AW * AH * 4); // tile 0 A = 0 → "no data" → neutral
  const probeTex = new THREE.DataTexture(
    probeData,
    AW,
    AH,
    THREE.RGBAFormat,
    THREE.UnsignedByteType,
  );
  probeTex.magFilter = THREE.LinearFilter;
  probeTex.minFilter = THREE.LinearFilter;
  probeTex.wrapS = probeTex.wrapT = THREE.ClampToEdgeWrapping;
  probeTex.generateMipmaps = false;
  probeTex.colorSpace = THREE.NoColorSpace || "";
  probeTex.needsUpdate = true;
  R.probe = {
    tex: probeTex,
    data: probeData,
    w: PW,
    h: PH,
    aw: AW,
    ah: AH,
    tx: TX,
    ty: TY,
    cell: CELL,
    x0: X0,
    z0: Z0,
  };
  /** byte offset of cell (i,j) in tile t */
  R.probe.off = (t, i, j) =>
    ((((t / TX) | 0) * PH + j) * AW + (t % TX) * PW + i) * 4;
  U.nrcAtlas.value.z = 0.5 / PW;
  U.nrcAtlas.value.w = 0.5 / PH;
  U.nrcProbeTex = { value: probeTex };

  // ------------------------------------------------------------------
  // GLSL
  // ------------------------------------------------------------------
  // appended to lights_pars_begin (every lit material): probe uniforms + the occluded hemisphere
  const PARS_LIGHTS = `
    uniform vec4 nrcProbe; uniform vec4 nrcProbeK; uniform vec4 nrcAtlas;
    uniform vec4 nrcHzT; uniform vec4 nrcHzK; uniform vec4 nrcHzL;
    uniform vec3 nrcBounce; uniform vec3 nrcBounceSun; uniform vec3 nrcParkTint;
    uniform sampler2D nrcProbeTex;
    uniform vec4 nrcVL; uniform vec4 nrcVL2; uniform sampler2D nrcVLTex;
    vec4 nrcTap( vec2 uv, vec2 tile ) {
      uv = clamp( uv, nrcAtlas.zw, 1.0 - nrcAtlas.zw );
      return texture2D( nrcProbeTex, ( tile + uv ) * nrcAtlas.xy );
    }
    #if NUM_HEMI_LIGHTS > 0
    // hemisphere light with the canyon term: the sky half loses what the street canyon hides,
    // replaced by interreflected sky + light bounced off the sunlit façades (tinted by the
    // district's albedo); park ground bounces greener.
    vec3 nrcHemiIrr( const in HemisphereLight h, const in vec3 n, const in float vis, const in float park, const in vec3 bcol ) {
      float w = 0.5 * dot( n, h.direction ) + 0.5;
      vec3 gnd = h.groundColor * mix( vec3( 1.0 ), nrcParkTint, park );
      vec3 sky = h.skyColor * vis + bcol * ( 1.0 - vis );
      return mix( gnd, sky, w );
    }
    #endif
  `;
  // appended to shadowmap_pars_fragment: the near-cascade sampler (soft, contact-hardening)
  const PARS_SHADOW = `
    #if defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS >= 1 )
    uniform vec4 nrcCsm; uniform vec4 nrcCsm2; uniform vec4 nrcCsm3; uniform vec4 nrcCsm4;
    #endif
    #if defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS >= 2 )
    float nrcDepth( sampler2D m, vec2 uv ) { return unpackRGBAToDepth( texture2D( m, uv ) ); }
    // PCSS-lite: blocker search → penumbra width from receiver/blocker distance → Vogel-disk PCF.
    // The disk rotation is hashed from the SHADOW-MAP texel (world-anchored: the pattern moves
    // with the world, no screen-door crawl when strafing). Tap counts come from nrcCsm4 (tiered).
    // Fully lit / fully covered pixels exit after the search taps.
    float nrcSoftShadow( sampler2D m, vec2 size, float bias, vec3 c, float slope ) {
      vec2 texel = 1.0 / size;
      vec2 tc = floor( c.xy * size * 0.5 );
      float rot = fract( 52.9829189 * fract( dot( tc, vec2( 0.06711056, 0.00583715 ) ) ) ) * 6.2831853;
      float zr = c.z + bias;
      float srch = nrcCsm2.x;
      float nS = nrcCsm4.x, nP = nrcCsm4.y;
      float bSum = 0.0, bN = 0.0;
      for ( int k = 0; k < 8; k ++ ) {
        float fk = float( k );
        if ( fk >= nS ) break;
        float r = sqrt( ( fk + 0.5 ) / nS ) * srch;
        float a = fk * 2.39996323 + rot;
        vec2 uv = c.xy + vec2( cos( a ), sin( a ) ) * r * texel;
        float d = nrcDepth( m, uv );
        float zt = zr - slope * r;                 // receiver-plane bias grows with the tap offset
        if ( d < zt ) { bSum += d; bN += 1.0; }
      }
      if ( bN < 0.5 ) return 1.0;
      float pen = clamp( ( zr - bSum / bN ) * nrcCsm2.y, nrcCsm2.z, nrcCsm2.w );
      if ( bN > nS - 0.5 && pen <= srch * 0.75 ) return 0.0;
      float lit = 0.0;
      for ( int k = 0; k < 12; k ++ ) {
        float fk = float( k );
        if ( fk >= nP ) break;
        float r = sqrt( ( fk + 0.5 ) / nP ) * pen;
        float a = fk * 2.39996323 + rot + 1.3;
        vec2 uv = c.xy + vec2( cos( a ), sin( a ) ) * r * texel;
        lit += step( zr - slope * r, nrcDepth( m, uv ) );
      }
      return lit / nP;
    }
    #endif
  `;
  // prepended to lights_fragment_begin's directional loop (inside main): canyon terms and the
  // near-cascade lookup, both computed once per fragment.
  function mainPre(hasRay) {
    return `
    float nrcVis = 1.0; float nrcPark = 0.0; float nrcFillK = 1.0; float nrcHzSun = 1.0; vec3 nrcBcol = vec3( 0.0 );
    ${hasRay ? "#if defined( USE_FOG ) && defined( FOG_EXP2 )" : "#if 0"}
    if ( nrcProbeK.x > 0.001 ) {
      vec3 nrcWP = vFogRay + cameraPosition;
      vec2 nrcUV = nrcWP.xz * nrcProbe.xy + nrcProbe.zw;
      if ( nrcUV.x > 0.0 && nrcUV.x < 1.0 && nrcUV.y > 0.0 && nrcUV.y < 1.0 ) {
        vec4 nrcT = nrcTap( nrcUV, vec2( 0.0 ) );
        if ( nrcT.a > 0.5 ) {
          // canyon height: above it the sky is open; below it visibility falls to the street value
          float nrcHc = nrcT.g * nrcProbeK.w + 2.0;
          float nrcH = clamp( nrcWP.y / nrcHc, 0.0, 1.0 );
          float nrcV = mix( nrcT.r, 1.0, nrcH * nrcH * ( 3.0 - 2.0 * nrcH ) );
          // up-facing surfaces (street, sills, car roofs) see the open slot of sky above the canyon
          vec3 nrcN = inverseTransformDirection( geometryNormal, viewMatrix );
          nrcV = mix( nrcV, sqrt( nrcV ), max( nrcN.y, 0.0 ) * 0.5 );
          nrcVis = mix( 1.0, mix( nrcProbeK.y, 1.0, nrcV ), nrcProbeK.x );
          nrcPark = nrcT.b * nrcProbeK.x;
          vec3 nrcAlb = nrcTap( nrcUV, vec2( 2.0, 1.0 ) ).rgb * 2.0;
          // skyline toward the key light (xy) and away from it (zw): occluder top + distance
          vec4 nrcH0 = nrcTap( nrcUV, nrcHzT.xy ), nrcH1 = nrcTap( nrcUV, nrcHzT.zw );
          vec4 nrcHz = mix( mix( nrcH0, nrcH0.zwxy, nrcHzK.x ), mix( nrcH1, nrcH1.zwxy, nrcHzK.y ), nrcHzK.z );
          vec2 nrcTop = nrcHz.xz * 420.0 - 20.0;
          vec2 nrcDst = max( nrcHz.yw * 256.0, 2.0 );
          vec2 nrcTn = ( nrcTop - nrcWP.y ) / nrcDst;           // tangent of the skyline seen from this height
          // key light over the skyline (used where the far shadow map fades out)
          nrcHzSun = mix( 1.0, smoothstep( nrcTn.x - nrcHzL.y, nrcTn.x + nrcHzL.y, nrcHzK.w ), nrcHzL.w );
          // façades across (away from the key light) are lit above the sun-side skyline's shadow line
          float nrcOcc = clamp( nrcTn.y, 0.0, 6.0 ); nrcOcc = nrcOcc * inversesqrt( 1.0 + nrcOcc * nrcOcc );
          float nrcLine = nrcTop.x - ( nrcDst.x + nrcDst.y ) * nrcHzK.w;
          float nrcLit = clamp( ( nrcTop.y - max( nrcLine, nrcWP.y ) ) / max( nrcTop.y - nrcWP.y, 1.0 ), 0.0, 1.0 ) * nrcHzL.x;
          float nrcLitS = nrcOcc * nrcLit;
          nrcFillK = mix( 1.0, mix( 1.0, nrcHzL.z, nrcOcc * ( 1.0 - nrcLit ) ) + nrcProbeK.z * nrcLitS, nrcProbeK.x );
          nrcBcol = ( nrcBounce + nrcBounceSun * nrcLitS ) * nrcAlb;
        }
      }
    }
    #endif
    #if defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS >= 1 ) && defined( RE_Direct )
      #define NRC_FAR_ON
      float nrcCsmW = 0.0; float nrcCsmS = 1.0; float nrcFarFade = 0.0;
      if ( receiveShadow ) {
        if ( nrcCsm.z > 0.0 ) {
          vec4 nrcFc = vDirectionalShadowCoord[ 0 ]; nrcFc.xyz /= nrcFc.w;
          vec2 nrcFe = abs( nrcFc.xy - 0.5 ) * 2.0;
          nrcFarFade = smoothstep( nrcCsm.z, 1.0, max( nrcFe.x, nrcFe.y ) );
        }
      #if ( NUM_DIR_LIGHT_SHADOWS >= 2 ) && ( NUM_DIR_LIGHTS >= 2 )
        #define NRC_CSM_ON
        if ( nrcCsm.x > 0.5 && nrcCsm.x < 1.5 ) {
          vec4 nrcNc = vDirectionalShadowCoord[ 1 ]; nrcNc.xyz /= nrcNc.w;
          vec2 nrcNe = abs( nrcNc.xy - 0.5 ) * 2.0;
          float nrcM = max( nrcNe.x, nrcNe.y );
          if ( nrcM < 1.0 && nrcNc.z <= 1.0 && nrcNc.z >= 0.0 ) {
            float nrcNdl = dot( geometryNormal, directionalLights[ 0 ].direction );
            nrcCsmW = 1.0 - smoothstep( nrcCsm.y, 1.0, nrcM );
            if ( nrcNdl <= 0.0 ) nrcCsmS = 0.0;       // facing away: unlit anyway, skip the taps
            else if ( nrcCsm.w > 0.5 ) {
              float nrcSl = min( sqrt( max( 1.0 - nrcNdl * nrcNdl, 0.0 ) ) / max( nrcNdl, 0.08 ), 8.0 );
              nrcCsmS = nrcSoftShadow( directionalShadowMap[ 1 ], directionalLightShadows[ 1 ].shadowMapSize,
                directionalLightShadows[ 1 ].shadowBias, nrcNc.xyz, nrcSl * nrcCsm3.x * 1.3 );
            } else {
              nrcCsmS = getShadow( directionalShadowMap[ 1 ], directionalLightShadows[ 1 ].shadowMapSize,
                directionalLightShadows[ 1 ].shadowBias, directionalLightShadows[ 1 ].shadowRadius, vDirectionalShadowCoord[ 1 ] );
            }
          }
        }
      #endif
      }
    #endif
  `;
  }

  // INTERIOR OVERHEAD SHADOW (10_cascade.js interior mode, nrcCsm.x == 2): indoors the near-cascade map is
  // aimed straight down from a "ceiling cut" ~2.4 m above the player's feet (ceilings, beams and hanging
  // lamps above it are clipped out; the shadow pass draws back faces, so it holds the UNDERSIDES of
  // tables, shelves, counters, people…). nrcIO = how much of the overhead light reaches this fragment
  // (1 = open) — soft contact-hardening shadows under furniture and at the feet of every NPC and
  // creature, dynamic. It dims the interior key light fully, the ambient / hemisphere / fill light by
  // nrcCsm3.w, and the virtual lights that shine from above. Computed once, before the light loops.
