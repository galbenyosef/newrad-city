// play-inline-21 07 — the
// Lines 1581-1891 of readable/play-inline-21.pretty.js (statement-aligned).
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
