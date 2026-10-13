// play-inline-21 05 — the
// Lines 1187-1367 of readable/play-inline-21.pretty.js (statement-aligned).
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
