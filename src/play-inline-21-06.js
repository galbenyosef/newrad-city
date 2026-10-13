// play-inline-21 06 — the
// Lines 1368-1580 of readable/play-inline-21.pretty.js (statement-aligned).
  const WIN_FRAG_PARS = [
    "uniform sampler2D uTxWinMask;",
    "uniform vec4 uTxWinRect;",
    "uniform float uTxWinLvl;",
    "uniform vec2 uTxWinEnv;", // x: daylight 0..1, y: office interiors
    "uniform vec3 uTxWinK;", // x: room brightness gain (× the scene's sky + bounced sun irradiance), y: share of lantern-lit rooms at night, z: lantern level
    "float txWH( float s, float k ) { return fract( sin( s * 91.3458 + k * 47.1231 ) * 43758.5453 ); }",
    "vec3 txWPal( float h ) {",
    "  vec3 c = h < 0.125 ? vec3( 0.46, 0.58, 0.47 ) : h < 0.25 ? vec3( 0.68, 0.56, 0.31 ) : h < 0.375 ? vec3( 0.66, 0.47, 0.44 ) : h < 0.5 ? vec3( 0.43, 0.53, 0.62 )",
    "    : h < 0.625 ? vec3( 0.70, 0.64, 0.51 ) : h < 0.75 ? vec3( 0.45, 0.46, 0.31 ) : h < 0.875 ? vec3( 0.40, 0.27, 0.17 ) : vec3( 0.55, 0.55, 0.52 );",
    "  return c * c; }",
    // wallpaper / paint (room units): plain paint, fine pinstripes or a small diamond print — low contrast, so the
    // pattern never reads as curtains or blinds
    "float txWPat( vec2 p, float h ) {",
    "  if ( h < 0.4 ) return 1.0;",
    "  if ( h < 0.7 ) return 0.93 + 0.07 * step( 0.5, fract( p.x * ( 14.0 + 10.0 * h ) ) );",
    "  vec2 g = fract( vec2( p.x + p.y, p.x - p.y ) * 7.0 ) - 0.5; return 0.94 + 0.06 * step( max( abs( g.x ), abs( g.y ) ), 0.18 ); }",
    // furniture silhouette (front view) in room units; lamp = glowing lamp-shade coverage
    "float txWFurn( vec2 p, float kind, float ox, float aa, inout float lamp ) {",
    "  vec2 q = p - vec2( ox, 0.0 ); vec2 qa = vec2( abs( q.x ), q.y ); float c = 0.0;",
    "  if ( kind < 1.0 ) { c = max( txWR( q, vec2( 0.0, -0.8 ), vec2( 0.46, 0.2 ), aa ), txWR( q, vec2( 0.0, -0.5 ), vec2( 0.4, 0.14 ), aa ) );",
    "    c = max( c, txWR( qa, vec2( 0.44, -0.64 ), vec2( 0.07, 0.12 ), aa ) ); }",
    "  else if ( kind < 2.0 ) { c = txWR( q, vec2( 0.0, -0.2 ), vec2( 0.27, 0.8 ), aa ) * ( 1.0 - 0.6 * txWR( vec2( q.x, fract( q.y * 2.6 ) ), vec2( 0.0, 0.55 ), vec2( 0.22, 0.3 ), aa * 2.6 ) * step( q.y, 0.5 ) ); }",
    "  else if ( kind < 3.0 ) { c = max( txWR( q, vec2( 0.0, -0.44 ), vec2( 0.42, 0.035 ), aa ), txWR( qa, vec2( 0.36, -0.73 ), vec2( 0.03, 0.27 ), aa ) );",
    "    c = max( c, txWR( q, vec2( 0.2, -0.35 ), vec2( 0.02, 0.07 ), aa ) );",
    "    float sh = txWR( vec2( ( q.x - 0.2 ) * ( 1.0 + ( q.y + 0.17 ) * 3.5 ), q.y ), vec2( 0.0, -0.17 ), vec2( 0.11, 0.08 ), aa );",
    "    lamp = max( lamp, sh ); c = max( c, sh ); }",
    "  else if ( kind < 4.0 ) { c = txWR( q, vec2( 0.0, -0.3 ), vec2( 0.25, 0.7 ), aa ) * ( 1.0 - 0.5 * txWR( q, vec2( 0.0, -0.3 ), vec2( 0.006, 0.66 ), aa ) ); }",
    "  else if ( kind < 5.0 ) { c = max( txWR( q, vec2( 0.0, -0.83 ), vec2( 0.62, 0.13 ), aa ), txWR( q, vec2( -0.58, -0.62 ), vec2( 0.05, 0.34 ), aa ) ); }",
    "  else if ( kind < 6.0 ) { float m = -1.0 + 0.62 * max( 0.0, 1.0 - q.x * q.x * 2.2 ) + 0.05 * sin( q.x * 37.0 + ox * 11.0 ) + 0.03 * sin( q.x * 83.0 );",
    "    c = 1.0 - smoothstep( -aa, aa, q.y - m ); }",
    "  else if ( kind < 7.0 ) { c = max( txWR( q, vec2( 0.0, -0.56 ), vec2( 0.18, 0.03 ), aa ), txWR( q, vec2( -0.16, -0.32 ), vec2( 0.028, 0.26 ), aa ) );",
    "    c = max( c, txWR( qa, vec2( 0.15, -0.8 ), vec2( 0.022, 0.22 ), aa ) ); }",
    "  return c; }",
    /*
     * One room. cu: position in the cell (0..1), rd: view ray in room units (x along U, y up, z out of the wall,
     * rd.z < 0), sd: window seed, wr: window rect, hole: no glass, chr: charred, aa: antialias width.
     * Returns daylight radiance (before glass); litK = colour multiplier for the lamp-lit night look.
     */
    "vec3 txWRoom( vec2 cu, vec3 rd, float sd, vec4 wr, float hole, float chr, float aa, float day, float office, out vec3 litK ) {",
    "  vec3 p0 = vec3( cu * 2.0 - 1.0, 1.0 );",
    "  float h0 = txWH( sd, 1.0 ), h1 = txWH( sd, 2.0 ), h2 = txWH( sd, 3.0 ), h3 = txWH( sd, 4.0 ), h4 = txWH( sd, 5.0 ), h5 = txWH( sd, 6.0 ), h6 = txWH( sd, 7.0 ), h7 = txWH( sd, 13.0 );",
    // room box (cell units, window plane z = 1, back wall z = -1): the side walls stand 0.45–1 m beyond the jambs, the floor
    // ~0.8 m below the sill and the ceiling 0.3–0.6 m above the head, so floor, ceiling and both side walls show through
    // the window and slide against each other as the camera moves (random size per window). hp = normalised room coords.
    "  float bw = office > 0.5 || wr.w > 1.5 ? 1.0 : min( wr.x + 0.14 + 0.3 * txWH( sd, 14.0 ), 1.0 );",
    "  float ylo = wr.y - 0.36 - 0.12 * txWH( sd, 15.0 ), yhi = wr.z + 0.1 + 0.16 * txWH( sd, 16.0 );",
    "  vec3 bc = vec3( 0.0, ( ylo + yhi ) * 0.5, 0.0 ), bh = vec3( bw, ( yhi - ylo ) * 0.5, 1.0 );",
    "  vec3 id = 1.0 / rd; vec3 kk = ( bc + sign( rd ) * bh - p0 ) * id;",
    "  float t = min( min( kk.x, kk.y ), kk.z ); vec3 hq = p0 + rd * t; vec3 hp = clamp( ( hq - bc ) / bh, -1.0, 1.0 ); vec3 e3 = 1.0 - abs( hp );",
    "  vec3 wall = txWPal( h0 ); wall = max( mix( vec3( dot( wall, vec3( 0.3, 0.5, 0.2 ) ) ), wall, 1.3 ), 0.004 ); if ( office > 0.5 ) wall = mix( vec3( 0.42, 0.41, 0.36 ), wall, 0.3 );",
    "  vec3 alb; float edge; float lf = 1.0;",
    "  float nz = txNoise( hp.xy * vec2( 3.1, 1.3 ) + hp.z * 2.3 + sd * 57.0 );",
    "  if ( t == kk.z ) {", // back wall: wallpaper (stripes), water runs, baseboard; doorway / picture / torn plaster
    "    edge = min( e3.x, e3.y ); lf = 1.0;",
    "    alb = wall * txWPat( hp.xy, h1 ) * ( 0.75 + 0.35 * nz ) * ( 1.0 - 0.45 * smoothstep( 0.62, 0.82, txNoise( hp.xy * 1.7 + sd * 23.0 ) ) );",
    "    alb *= 1.0 - 0.4 * smoothstep( 0.35, 0.95, hp.y ) * smoothstep( 0.5, 0.8, txNoise( vec2( hp.x * 9.0, hp.y * 1.5 ) + sd * 13.0 ) );", // water runs from the ceiling
    "    alb = mix( alb, wall * 0.3, step( hp.y, -0.9 ) );", // baseboard
    "    float dx = ( h1 - 0.5 ) * 1.1;",
    "    if ( h2 < 0.45 ) { float fr = txWR( hp.xy, vec2( dx, -0.28 ), vec2( 0.25, 0.74 ), aa ), dr = txWR( hp.xy, vec2( dx, -0.3 ), vec2( 0.2, 0.7 ), aa );",
    "      alb = mix( alb, wall * 0.5, fr ); alb = mix( alb, vec3( 0.012 ), dr * ( 1.0 - 0.7 * step( hp.x, dx - 0.2 + 0.22 * h3 ) ) ); }", // doorway to a dark hall, door leaf ajar
    "    else if ( h2 < 0.8 ) { float pf = txWR( hp.xy, vec2( dx, 0.12 ), vec2( 0.2, 0.15 ), aa ), pi = txWR( hp.xy, vec2( dx, 0.12 ), vec2( 0.16, 0.11 ), aa );",
    "      alb = mix( alb, vec3( 0.04, 0.03, 0.015 ), pf ); alb = mix( alb, txWPal( h4 ) * 0.8, pi ); }", // framed picture
    "    else { float hl = smoothstep( 0.55, 0.6, txNoise( hp.xy * 2.2 + sd * 31.0 ) );",
    "      alb = mix( alb, vec3( 0.09, 0.06, 0.035 ) * ( 0.6 + 0.4 * step( 0.5, fract( hp.y * 22.0 ) ) ), hl ); }", // torn plaster exposing lath
    "  } else if ( t == kk.y ) {",
    "    edge = min( e3.x, e3.z );",
    "    if ( rd.y < 0.0 ) {", // floor: warm planks running into the room, rug, debris, the sun patch under the window
    "      alb = vec3( 0.2, 0.12, 0.065 ) * ( 0.78 + 0.22 * step( 0.5, fract( hp.x * 4.0 + floor( hp.z * 1.7 + hp.x * 4.0 ) * 0.37 ) ) ) * ( 0.8 + 0.4 * nz );",
    "      float rug = txWR( hp.xz, vec2( h3 - 0.5, -0.35 ), vec2( 0.45, 0.4 ), aa ) * step( 0.45, h4 );",
    "      alb = mix( alb, txWPal( fract( h4 * 7.0 ) ) * 0.6 * ( 0.8 + 0.2 * sin( hp.x * 60.0 ) ), rug );",
    "      alb *= 0.8 + 0.35 * step( 0.85, txWH( dot( floor( hp.xz * vec2( 31.0, 23.0 ) ), vec2( 1.0, 57.0 ) ), sd ) ) - 0.3 * smoothstep( 0.55, 0.7, txNoise( hp.xz * 5.0 + sd * 21.0 ) );",
    "      lf = 0.6 + 0.9 * step( abs( hq.x ), wr.x ) * smoothstep( 0.1, 0.6, hp.z ) * ( 1.0 - hole * 0.2 );",
    "    } else {", // ceiling: off-white stained plaster, fixture, sometimes collapsed; brighter where the floor bounces the daylight up
    // (seen from the street the ceiling fills half the window: darker than the walls, lit by the floor bounce near the
    // window, brown water stains and a crown moulding line so it never reads as a frosted pane)
    "      alb = vec3( 0.34, 0.32, 0.28 ) * ( 0.85 + 0.15 * nz );",
    "      alb = mix( alb, alb * vec3( 0.82, 0.7, 0.52 ), 0.8 * smoothstep( 0.72, 0.8, txNoise( hp.xz * 3.0 + sd * 17.0 ) ) );",
    "      alb *= 1.0 - 0.45 * ( 1.0 - smoothstep( 0.03, 0.07, min( e3.x, e3.z ) ) );",
    "      lf = 0.35 + 0.5 * smoothstep( -0.8, 1.0, hp.z );",
    "      alb = mix( alb, vec3( 0.03 ), txWR( hp.xz, vec2( 0.0, -0.1 ), vec2( 0.07, 0.07 ), aa ) );",
    "      if ( h5 < 0.22 ) alb = mix( alb, vec3( 0.01 ), smoothstep( 0.5, 0.56, txNoise( hp.xz * 2.4 + sd * 19.0 ) ) );",
    "    }",
    "  } else {", // side walls: same paper a shade darker, baseboard, picture rail, a doorway on one side and a picture on the other
    "    edge = min( e3.y, e3.z ); lf = 0.55; vec2 sp = hp.zy; float sx = sign( hp.x );",
    "    float ns = txNoise( sp * vec2( 3.1, 1.3 ) + sx * 7.3 + sd * 41.0 );",
    "    alb = wall * 0.85 * txWPat( sp.xy, h1 ) * ( 0.75 + 0.35 * ns ) * ( 1.0 - 0.45 * smoothstep( 0.62, 0.82, txNoise( sp * 1.7 + sx * 3.1 + sd * 29.0 ) ) );",
    "    alb = mix( alb, wall * 0.3, step( hp.y, -0.9 ) );",
    "    alb = mix( alb, wall * 0.45, txWR( sp, vec2( 0.0, 0.42 ), vec2( 1.0, 0.015 ), aa ) );",
    "    float sz = ( h3 - 0.5 ) * 1.1;",
    "    if ( sx * ( h1 - 0.5 ) > 0.0 ) { float fr = txWR( sp, vec2( sz, -0.3 ), vec2( 0.27, 0.74 ), aa ), dr = txWR( sp, vec2( sz, -0.32 ), vec2( 0.22, 0.7 ), aa );",
    "      alb = mix( alb, wall * 0.5, fr ); alb = mix( alb, vec3( 0.01 ), dr ); }",
    "    else { float pf = txWR( sp, vec2( sz, 0.1 ), vec2( 0.22, 0.17 ), aa ), pi = txWR( sp, vec2( sz, 0.1 ), vec2( 0.18, 0.13 ), aa );",
    "      alb = mix( alb, vec3( 0.04, 0.03, 0.015 ), pf ); alb = mix( alb, txWPal( fract( h4 * 3.7 ) ) * 0.7 * ( 0.7 + 0.3 * ns ), pi ); }",
    "  }",
    // daylight from the window: every surface keeps a solid ambient share (rooms read by day), brighter towards the glass,
    // corner occlusion draws the box edges (the perspective cue); the faces differ in tone (paper / plaster / wood)
    "  float zz = clamp( ( hp.z + 1.0 ) * 0.5, 0.0, 1.0 );",
    "  float ao = 0.22 + 0.78 * smoothstep( 0.0, 0.4, edge );",
    "  float light = ( 0.4 + 0.6 * zz * zz ) * lf * ao;",
    // lamp for lit rooms: ceiling fixture or the table lamp
    "  vec3 lp = vec3( ( h3 - 0.5 ) * 0.8, 0.7, -0.25 );",
    "  vec3 dl = hp - lp; float lit = ( 0.35 + 1.6 / ( 1.0 + 3.0 * dot( dl, dl ) ) ) * ( 0.4 + 0.6 * ao ) * mix( 1.0, 0.75, step( rd.y, 0.0 ) * step( kk.y, t ) );",
    "  lit *= clamp( dot( alb, vec3( 0.3, 0.5, 0.2 ) ) / max( dot( wall, vec3( 0.3, 0.5, 0.2 ) ), 0.02 ), 0.12, 1.4 );", // wallpaper, doorways, pictures, rugs read in lamplight
    // furniture cards: a large piece in the back half of the room, sometimes a small one near the window
    "  float lamp = 0.0;",
    "  float kind = floor( h6 * 8.0 ); if ( office > 0.5 ) kind = h6 < 0.4 ? 2.0 : h6 < 0.65 ? 3.0 : h6 < 0.85 ? 1.0 : 7.0;",
    "  float zf = -0.25 - 0.55 * h2; float tf = ( zf - 1.0 ) / rd.z;",
    "  vec3 furn = wall * 0.22 + vec3( 0.02, 0.014, 0.008 );",
    "  if ( tf < t && kind < 7.0 ) { vec2 pf = ( p0.xy + rd.xy * tf - bc.xy ) / bh.xy; float cv = txWFurn( pf, kind, ( h4 - 0.5 ) * 0.9, aa * 2.0, lamp );",
    "    float fl = ( 0.5 + 0.5 * ( zf + 1.0 ) * 0.5 ) * 0.8;",
    "    alb = mix( alb, furn, cv ); light = mix( light, fl, cv ); lit = mix( lit, 0.05, cv * ( 1.0 - lamp ) ); }",
    "  float zn = 0.35; float tn = ( zn - 1.0 ) / rd.z;",
    "  if ( h5 > 0.62 && tn < t ) { vec2 pn = ( p0.xy + rd.xy * tn - bc.xy ) / bh.xy; float cv = txWFurn( pn, h5 > 0.82 ? 6.0 : 2.0, ( h1 - 0.5 ) * 1.2, aa * 2.0, lamp );",
    "    alb = mix( alb, furn * 0.8, cv ); light = mix( light, 0.7, cv ); lit = mix( lit, 0.03, cv * ( 1.0 - lamp ) ); }",
    // a pendant light hanging from the ceiling in about half the rooms (a strong mid-air parallax cue from the street)
    "  if ( h3 > 0.45 ) { float zp = -0.05 - 0.5 * fract( h3 * 13.0 ); float tp = ( zp - 1.0 ) / rd.z;",
    "    if ( tp < t ) { vec2 pp = ( p0.xy + rd.xy * tp - bc.xy ) / bh.xy; float px = ( fract( h3 * 7.0 ) - 0.5 ) * 0.5, sy = 0.55 + 0.15 * fract( h3 * 3.0 );",
    "      float cv = txWR( pp, vec2( px, ( 1.0 + sy ) * 0.5 ), vec2( 0.012, ( 1.0 - sy ) * 0.5 ), aa );",
    "      float sw = 0.05 + max( sy - pp.y, 0.0 ) * 0.9; cv = max( cv, txWR( pp, vec2( px, sy - 0.07 ), vec2( sw, 0.07 ), aa ) * step( abs( pp.x - px ), sw ) );",
    "      alb = mix( alb, vec3( 0.03, 0.027, 0.022 ), cv ); light = mix( light, 0.6, cv ); lit = mix( lit, 0.05, cv ); } }",
    // an occasional figure standing in the room: a propped-up skeleton (bone) or a dark silhouette (1.75 m = 1 room unit)
    "  if ( office < 0.5 && h7 < 0.08 ) { float zg = 0.1 - 0.5 * fract( h7 * 17.0 ); float tg = ( zg - 1.0 ) / rd.z;",
    "    if ( tg < t ) { vec2 q = p0.xy + rd.xy * tg - vec2( ( fract( h7 * 29.0 ) - 0.5 ) * bw, ylo + 1.0 ); vec2 qa = vec2( abs( q.x ), q.y ); float bone = step( 0.45, fract( h7 * 41.0 ) );",
    "      float cv = 1.0 - smoothstep( 0.075 - aa, 0.075 + aa, length( ( q - vec2( 0.0, -0.1 ) ) * vec2( 1.0, 0.8 ) ) );", // head
    "      cv = max( cv, txWR( q, vec2( 0.0, -0.36 ), vec2( 0.13 - 0.04 * bone, 0.17 ), aa ) * ( 1.0 - bone * 0.7 * step( 0.5, fract( q.y * 16.0 ) ) * step( 0.02, qa.x ) ) );", // torso / ribs
    "      cv = max( cv, txWR( qa, vec2( 0.16 - 0.03 * bone, -0.42 ), vec2( 0.03 - 0.01 * bone, 0.19 ), aa ) );", // arms
    "      cv = max( cv, txWR( qa, vec2( 0.06, -0.78 ), vec2( 0.04 - 0.015 * bone, 0.24 ), aa ) );", // legs
    "      vec3 fc = bone > 0.5 ? vec3( 0.42, 0.39, 0.31 ) : furn * 0.6;",
    "      alb = mix( alb, fc, cv ); light = mix( light, bone > 0.5 ? 0.75 : 0.55, cv ); lit = mix( lit, bone > 0.5 ? 0.5 : 0.04, cv ); } }",
    "  lit = mix( lit, 2.6, lamp );",
    "  vec3 litC = lit * mix( vec3( 1.0 ), alb / ( dot( alb, vec3( 0.3, 0.5, 0.2 ) ) + 0.02 ), 0.3 * ( 1.0 - lamp ) );",
    "  alb = mix( alb, vec3( 0.012, 0.01, 0.009 ) * ( 0.6 + 0.8 * nz ), chr * 0.85 );", // burnt-out: charred
    "  vec3 radn = alb * light;",
    // window-plane dressing (per window, from the world seed): ~28 % of the glazed windows — curtains pulled partly aside
    // (rarely closed), roller blinds part-way down, plywood behind the glass; torn rags in some empty frames
    "  float nx = wr.w > 1.5 ? fract( cu.x * 2.0 ) * 2.0 - 1.0 : cu.x * 2.0 - 1.0;",
    "  vec2 wl = vec2( nx / wr.x, ( ( cu.y * 2.0 - 1.0 ) - wr.y ) / ( wr.z - wr.y ) );",
    "  float fv = office > 0.5 ? 0.9 + 0.1 * txWH( sd, 8.0 ) : txWH( sd, 8.0 ), fw = txWH( sd, 9.0 ); float cov = 0.0; vec3 cc = vec3( 0.0 ); float ct = 0.5;",
    "  if ( hole < 0.5 ) {",
    "    if ( fv < 0.14 ) { float cl = fv < 0.012 ? 1.0 : 0.1 + fw * 0.3, cr = fv < 0.012 ? 1.0 : 0.1 + fract( fw * 7.3 ) * 0.3;",
    "      cov = max( 1.0 - smoothstep( -1.0 + 2.0 * cl - 0.03, -1.0 + 2.0 * cl, wl.x ), smoothstep( 1.0 - 2.0 * cr, 1.0 - 2.0 * cr + 0.03, wl.x ) );",
    "      cc = txWPal( fract( fw * 13.0 ) ) * 1.3 * ( 0.72 + 0.28 * sin( wl.x * 26.0 + fw * 9.0 ) ); ct = 0.55; }",
    "    else if ( fv < 0.25 ) { float bl = 1.0 - ( 0.12 + fw * 0.45 );",
    "      cov = smoothstep( bl - 0.01, bl, wl.y ); cc = vec3( 0.42, 0.37, 0.25 ) * ( 0.92 + 0.08 * step( 0.5, fract( wl.y * 18.0 ) ) );",
    "      cc = mix( cc, vec3( 0.05 ), txWR( wl, vec2( 0.0, bl + 0.015 ), vec2( 1.0, 0.012 ), 0.01 ) ); ct = 0.45; }",
    "    else if ( fv < 0.28 ) { cov = 1.0; cc = vec3( 0.2, 0.13, 0.07 ) * ( 0.8 + 0.2 * sin( wl.y * 40.0 + 6.0 * txNoise( wl * vec2( 2.0, 12.0 ) + sd * 3.0 ) ) ); ct = 0.02; }",
    "  } else if ( fv < 0.25 && chr < 0.5 ) {", // rags of a curtain hanging in an empty frame
    "    float rw = 0.2 + fw * 0.2, side = step( 0.5, fract( fw * 5.1 ) ) * 2.0 - 1.0;",
    "    float bot = 0.3 + 0.45 * txNoise( vec2( wl.x * 7.0, sd * 9.0 ) );",
    "    cov = step( 1.0 - 2.0 * rw, wl.x * side ) * step( bot, wl.y ); cc = txWPal( fract( fw * 13.0 ) ) * 0.6 * ( 0.7 + 0.3 * sin( wl.x * 40.0 ) ); ct = 0.3; }",
    "  cov *= step( -1.0, wl.x ) * step( wl.x, 1.0 ) * step( -0.02, wl.y ) * step( wl.y, 1.02 );",
    "  radn = mix( radn, cc * ( 0.6 + 0.4 * ( 1.0 - hole ) ), cov ); litC = mix( litC, ct * 1.3 * mix( vec3( 1.0 ), cc / ( dot( cc, vec3( 0.3, 0.5, 0.2 ) ) + 0.02 ), 0.5 ), cov );",
    "  litK = litC;",
    "  return radn; }",
    // ---- procedural wall detail (brick courses / ashlar joints / render pitting) on the atlas wall field ----
    "uniform vec4 uTxWall;", // x kind (0 off, 1 brick, 2 ashlar/panels, 3 render), y units per tile U, z courses per tile V, w stagger
    "uniform vec4 uTxWall2;", // x,y cell offsets (align with painted joints), z joint half-width (m), w relief (m)
    "uniform float uTxRecess;", // window glass set back from the wall plane (m); 0 = flush (curtain walls)
    // Procedural window grid (G.mats.trackWindows: landmark / hand-made window-grid textures without an atlas mask).
    "uniform vec4 uTxGrid;", // x,y room cells per UV unit, z 1 = procedural mask
    "uniform vec4 uTxProc;", // x mullions, y transom y (cell units, < -5 none), z bar half-width (cell units), w lit colour known
    "uniform vec3 uTxProcG;", // painted glass colour (as sampled)
    "uniform vec3 uTxProcL;", // painted lit-window colour
    // mask (R see-through, G hole) from the window rect + bars; the pane state is classified once per cell from the painted
    // texture (blurred mip): near-black = broken hole, glass-coloured / lit-coloured = glass, anything else (boards…) = opaque
    // fw = pixel footprint in cells: the rect edges and bars are box-filtered by it, and once a cell is under ~3 px the mask
    // turns into its mean coverage (what the atlas mask's mip chain does), so far grids shade evenly instead of sparkling
    "vec4 txProcMask( sampler2D tmap, vec2 uv, vec2 grid, vec4 wr, float fw ) {",
    "  vec2 cl = floor( uv * grid ); vec2 p = ( uv * grid - cl ) * 2.0 - 1.0;",
    "  float aw = max( fw * 2.0, 1e-4 ), far = smoothstep( 0.2, 0.45, fw );",
    "  float inR = clamp( ( wr.x - abs( p.x ) ) / aw + 0.5, 0.0, 1.0 ) * clamp( ( p.y - wr.y ) / aw + 0.5, 0.0, 1.0 ) * clamp( ( wr.z - p.y ) / aw + 0.5, 0.0, 1.0 );",
    "  inR = mix( inR, wr.x * ( wr.z - wr.y ) * 0.5, far );",
    "  if ( inR < 1e-3 ) return vec4( 0.0 );",
    "  float n1 = uTxProc.x + 1.0, t = ( p.x + wr.x ) / ( 2.0 * wr.x ) * n1;",
    "  float bar = clamp( ( uTxProc.z - abs( t - floor( t + 0.5 ) ) * 2.0 * wr.x / n1 ) / aw + 0.5, 0.0, 1.0 ) * step( 0.5, t ) * step( t, n1 - 0.5 );",
    "  bar = max( bar, clamp( ( uTxProc.z * 1.2 - abs( p.y - uTxProc.y ) ) / aw + 0.5, 0.0, 1.0 ) );",
    "  bar = mix( bar, min( uTxProc.x * uTxProc.z / max( wr.x, 0.05 ) + step( -5.0, uTxProc.y ) * 1.2 * uTxProc.z / max( wr.z - wr.y, 0.05 ), 0.6 ), far );",
    "  float sy = ( 1.0 + wr.y + 0.3 * ( wr.z - wr.y ) ) * 0.5;",
    "  vec3 sc = ( textureLod( tmap, ( cl + vec2( ( 1.0 - 0.6 * wr.x ) * 0.5, sy ) ) / grid, 2.0 ).rgb + textureLod( tmap, ( cl + vec2( ( 1.0 + 0.6 * wr.x ) * 0.5, sy ) ) / grid, 2.0 ).rgb ) * 0.5;",
    "  vec3 lw = vec3( 0.3, 0.5, 0.2 ); float lg = max( dot( uTxProcG, lw ), 1e-4 ), ls = max( dot( sc, lw ), 1e-5 );",
    "  float hole = 1.0 - smoothstep( 0.3, 0.55, ls / lg );",
    "  float gl = 1.0 - smoothstep( 0.22, 0.42, length( sc / ls - uTxProcG / lg ) );",
    "  float lt = uTxProc.w * ( 1.0 - smoothstep( 0.22, 0.42, length( sc / ls - uTxProcL / max( dot( uTxProcL, lw ), 1e-4 ) ) ) );",
    "  float see = max( max( gl, lt ), hole ) * ( 1.0 - bar );",
    "  return vec4( see * mix( 0.72, 1.0, hole ), hole * ( 1.0 - bar ), 0.0, 0.0 ) * inR; }",
    // height in metres at atlas uv; cell = unit id, mort = mortar coverage (box-filtered by aa metres), face = 0 joint..1 face
    "float txWallHt( vec2 uv, float aa, out vec2 cell, out float mort, out vec2 dmg ) {",
    "  cell = vec2( 0.0 ); mort = 0.0; dmg = vec2( 0.0 );",
    "  vec2 um = uv * vec2( 14.0, 21.0 );",
    "  float grain = txNoise( um * vec2( 9.0, 9.0 ) ) * 0.6 + txNoise( um * 23.0 + 7.1 ) * 0.4;",
    "  if ( uTxWall.x > 2.5 ) return ( grain - 0.5 ) * uTxWall2.w;", // render / stucco: pitting only
    "  vec2 q = vec2( uv.x * uTxWall.y, ( 1.0 - uv.y ) * uTxWall.z ) + uTxWall2.xy;",
    "  q.x += 0.5 * uTxWall.w * mod( floor( q.y ), 2.0 );",
    "  cell = floor( q ); vec2 f = fract( q );",
    "  vec2 dm = min( f, 1.0 - f ) * vec2( 14.0 / uTxWall.y, 21.0 / uTxWall.z );", // distance to the joints (m)
    "  bool brk = uTxWall.x < 1.5;",
    // brick: bed joints vary per course (hand-laid), and the arrises are eroded so the joint edge wanders (no ruler lines)
    "  float jw = uTxWall2.z * ( brk ? 0.7 + 0.6 * txHash( vec2( cell.y * 0.371, 5.3 ) ) : 1.0 );",
    "  float dist = min( dm.x, dm.y ) + ( grain - 0.5 ) * jw * ( brk ? 1.1 : 0.5 );",
    "  mort = 1.0 - smoothstep( jw - aa * 0.5, jw + aa * 0.5 + 1e-4, dist );",
    "  float face = smoothstep( jw * 0.7, jw * 2.2 + aa * 0.5, dist );", // rounded arris
    "  float hc = txHash( cell * 0.1731 + 0.37 );",
    // damage comes in clusters (frost / impact zones of a dozen units), not as a polka-dot scatter: inside a cluster 10–25 % of
    // the units are missing (the backing wythe shows one unit deep), a third have spalled faces; elsewhere ~1 %
    "  float dz = brk ? smoothstep( 0.77, 0.83, txNoise( cell * vec2( 0.11, 0.045 ) + 71.0 ) ) : 0.0;",
    "  dmg = vec2( dz * step( hc, 0.1 + 0.15 * dz * dz ), max( dz * step( 0.3, hc ) * step( hc, 0.6 ), step( hc, brk ? 0.012 : 0.02 ) ) );",
    "  float h = face * ( 0.82 + 0.36 * hc + ( grain - 0.5 ) * ( brk ? 0.35 : 0.5 ) );",
    "  h -= face * dmg.y * ( 0.8 + 0.6 * grain );", // spalled face
    "  h -= dmg.x * ( 2.6 + 0.4 * grain ); mort *= 1.0 - dmg.x;", // missing unit: the backing brick one unit in
    "  return h * uTxWall2.w; }",
  ].join("\n");
  // Runs right after the albedo map (and the macro block): swaps window pixels for the room seen through them.
