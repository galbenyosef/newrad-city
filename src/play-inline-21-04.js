// play-inline-21 04 — the
// Lines 844-1186 of readable/play-inline-21.pretty.js (statement-aligned).
  function normStyle(s) {
    s = String(s || "tenement").toLowerCase();
    if (s.indexOf("deco") >= 0 || s.indexOf("skyscraper") >= 0)
      return "artdeco";
    if (s.indexOf("brown") >= 0) return "brownstone";
    if (s.indexOf("ware") >= 0 || s.indexOf("indust") >= 0) return "warehouse";
    if (
      s.indexOf("office") >= 0 ||
      s.indexOf("commercial") >= 0 ||
      s.indexOf("modern") >= 0
    )
      return "office";
    return "tenement";
  }
  X.normStyle = normStyle;

  // ------------------------------------------------------------------
  // Procedural environment map (for chrome/glass/metal reflections)
  // ------------------------------------------------------------------
  let envTex = null;
  X.envMap = function () {
    if (envTex) return envTex;
    const w = 512,
      h = 256,
      cv = X.canvas(w, h),
      ctx = cv.ctx,
      r = X.rng(99);
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#5d6a5c");
    g.addColorStop(0.3, "#9aa383");
    g.addColorStop(0.48, "#d8d2ae");
    g.addColorStop(0.5, "#8a8270");
    g.addColorStop(0.62, "#6a6252");
    g.addColorStop(1, "#4a4438");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // skyline silhouettes at the horizon so reflections read as "city"
    ctx.fillStyle = "rgba(40,40,36,0.85)";
    for (let x = 0; x < w;) {
      const bw = 6 + r() * 18,
        bh = 8 + r() * 42;
      ctx.fillRect(x, h * 0.5 - bh, bw, bh);
      x += bw + r() * 3;
    }
    // soft sun hotspot
    const sg = ctx.createRadialGradient(
      w * 0.3,
      h * 0.22,
      0,
      w * 0.3,
      h * 0.22,
      60,
    );
    sg.addColorStop(0, "rgba(255,248,220,0.9)");
    sg.addColorStop(1, "rgba(255,248,220,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, w, h);
    envTex = new THREE.CanvasTexture(cv.c);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    envTex.needsUpdate = true;
    X.stats.cpuBytes += w * h * 4;
    return envTex;
  };

  // ==================================================================
  // Night glow + flicker (clone-safe via userData.txGlow)
  // ==================================================================
  const glowList = []; // {mat, d, n, f, rate, ph}
  const seenMats = new WeakSet();
  const protoOBC = THREE.Material.prototype.onBeforeCompile;

  function hashId(s) {
    let h = 2166136261;
    s = String(s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;
  }

  function addGlow(mat) {
    const g = mat.userData && mat.userData.txGlow;
    if (!g) return;
    const prev = glowList.find((e) => e.mat === mat);
    if (prev) {
      prev.d = g.d;
      prev.n = g.n;
      prev.f = !!g.f;
      return;
    } // re-tracked with new values
    const u = hashId(mat.uuid);
    const e = { mat, d: g.d, n: g.n, f: !!g.f, rate: 0.55 + u, ph: u * 100 };
    glowList.push(e);
    mat.emissiveIntensity = e.d + (e.n - e.d) * curNight;
    mat.addEventListener("dispose", function onD() {
      mat.removeEventListener("dispose", onD);
      const i = glowList.indexOf(e);
      if (i >= 0) glowList.splice(i, 1);
    });
  }
  function tagGlow(mat, day, night, flicker) {
    mat.userData.txGlow = { d: day, n: night, f: flicker ? 1 : 0 };
  }

  // ==================================================================
  // World-space macro variation (anti-tiling), clone-safe via userData.txMacro
  // ==================================================================
  const MACRO_VERT = [
    "#include <project_vertex>",
    "{ vec4 txP = vec4( transformed, 1.0 );",
    "#ifdef USE_INSTANCING",
    "  txP = instanceMatrix * txP;",
    "#endif",
    "  vTxW = ( modelMatrix * txP ).xyz; }",
  ].join("\n");
  const MACRO_FRAG_PARS = [
    "varying vec3 vTxW;",
    "uniform float uTxMacro;",
    "uniform float uTxBand;",
    "uniform vec4 uTxQ;", // quality: x window-detail footprint scale, y minimum window level, z dust on/off, w relief (bump) layers on/off
    "uniform vec4 uTxWet;", // x: rain wetness 0..1 (atmosphere), y: time (s) for running water, z: falling rain (ripples)
    // (lattice wrapped at 1024 cells: fract( p * 456.21 ) loses every bit of precision once p is ~1e4, which turned the
    // fine grain of far-from-origin streets into streaks — the wrap keeps it exact and is seamless for the lattice noise)
    "float txHash( vec2 p ) { p = mod( p, 1024.0 ); p = fract( p * vec2( 123.34, 456.21 ) ); p += dot( p, p + 45.32 ); return fract( p.x * p.y ); }",
    "float txNoise( vec2 p ) { vec2 i = floor( p ); vec2 f = fract( p ); f = f * f * ( 3.0 - 2.0 * f );",
    "  return mix( mix( txHash( i ), txHash( i + vec2( 1.0, 0.0 ) ), f.x ), mix( txHash( i + vec2( 0.0, 1.0 ) ), txHash( i + vec2( 1.0, 1.0 ) ), f.x ), f.y ); }",
    "uniform float uTxGround;", // world-anchored street damage: 1 roads (cracks, tar snakes, patches, alligator), ~0.35 pavements (cracks)
    "uniform float uTxBrick;", // world-anchored per-brick tone / zones / repointing on brick_* surfaces (breaks the 3 m repeat)
    "vec2 txH2( vec2 p ) { p = vec2( dot( p, vec2( 127.1, 311.7 ) ), dot( p, vec2( 269.5, 183.3 ) ) ); return fract( sin( p ) * 43758.5453 ); }",
    // Voronoi border distance (cell units) + hash of the nearest cell (two-pass border distance, 3×3 neighbourhoods)
    "vec3 txVor( vec2 x ) {",
    "  vec2 n = floor( x ), f = fract( x ), mg = vec2( 0.0 ), mr = vec2( 0.0 ); float md = 8.0;",
    "  for ( int j = -1; j <= 1; j++ ) for ( int i = -1; i <= 1; i++ ) {",
    "    vec2 g = vec2( float( i ), float( j ) ); vec2 r = g + 0.05 + 0.9 * txH2( n + g ) - f; float d = dot( r, r );",
    "    if ( d < md ) { md = d; mr = r; mg = g; } }",
    "  md = 8.0;",
    "  for ( int j = -1; j <= 1; j++ ) for ( int i = -1; i <= 1; i++ ) {",
    "    vec2 g = mg + vec2( float( i ), float( j ) ); vec2 r = g + 0.05 + 0.9 * txH2( n + g ) - f;",
    "    if ( dot( mr - r, mr - r ) > 1e-5 ) md = min( md, dot( 0.5 * ( mr + r ), normalize( r - mr ) ) ); }",
    "  return vec3( md, txH2( n + mg ) ); }",
    /*
     * Street damage in world space (p = world xz in metres, fp = pixel footprint in metres, amt = uTxGround).
     * Rolled-in repair patches and utility-trench cuts (soft irregular edges, dark seam, feathered crown), ~4 m block
     * cracking in some areas only (meandering, broken runs, dust along the lips), long tar-sealed "snakes", and alligator
     * fatigue cracking in wheel-path blotches. Line widths are box-filtered against the pixel footprint (sub-pixel cracks
     * fade by coverage instead of shimmering) and the fine layers are skipped when they would be < 1 px.
     */
    "vec3 txGround( vec3 col, vec2 p, float fp, float amt, out vec4 pho ) {",
    "  pho = vec4( 0.0 );",
    "  float pat = step( 0.9, amt );",
    "  vec2 wp = p + ( vec2( txNoise( p * 0.31 ), txNoise( p * 0.31 + 7.3 ) ) - 0.5 ) * 1.8 + ( vec2( txNoise( p * 1.9 + 3.1 ), txNoise( p * 1.9 + 9.7 ) ) - 0.5 ) * 0.25;",
    "  float inP = 0.0;",
    "  if ( pat > 0.5 ) {",
    // broad stains: oil / soot / water marks (dark) and wind-blown dust drifts (light), 3–10 m, world-anchored
    "    col *= 1.0 - 0.2 * smoothstep( 0.62, 0.85, txNoise( p * 0.21 + 31.0 ) * 0.7 + txNoise( p * 0.9 ) * 0.3 );",
    "    col = mix( col, vec3( 0.2, 0.18, 0.15 ), 0.35 * smoothstep( 0.6, 0.85, txNoise( p * 0.11 + 5.0 ) * 0.75 + txNoise( p * 0.7 + 2.0 ) * 0.25 ) );",
    "    vec2 pc = floor( p / 7.5 ); vec2 ph = txH2( pc + 17.0 ), ph2 = txH2( pc + 41.0 );",
    "    if ( ph.x > 0.86 ) {", // pothole: broken-out depression, dark wet grit inside, crumbled light rim
    "      vec2 c = ( pc + 0.25 + 0.5 * ph2 ) * 7.5; float rr = 0.3 + 0.45 * ph.y;",
    "      float sd = length( ( p - c ) * vec2( 1.0, 0.8 + 0.4 * ph2.x ) ) - rr + ( txNoise( p * 4.0 + ph * 7.0 ) - 0.5 ) * 0.35 * rr + ( txNoise( p * 17.0 ) - 0.5 ) * 0.06;",
    "      float ins = 1.0 - smoothstep( -0.01 - fp, 0.01 + fp, sd );",
    "      vec3 pin = mix( vec3( 0.075, 0.07, 0.062 ) * ( 0.6 + 0.8 * txNoise( p * 31.0 ) ), vec3( 0.02, 0.019, 0.017 ), smoothstep( -0.04, -0.25 * rr, sd ) );", // broken aggregate at the rim, dark wet grit in the bowl
    "      col = mix( col, pin * ( 0.75 + 0.5 * txNoise( p * 13.0 + 3.0 ) ), ins * 0.92 );",
    "      col *= 1.0 + 0.35 * smoothstep( 0.0, 0.02, sd ) * ( 1.0 - smoothstep( 0.02, 0.12, sd ) ) * step( 0.45, txNoise( p * 13.0 ) );",
    "      inP = ins;",
    "      pho = vec4( ins, clamp( -sd / rr, 0.0, 1.0 ), fract( ph.y * 13.7 + ph2.x * 3.1 ), 1.0 );",
    "    }",
    "    if ( ph.x < 0.4 ) {",
    "      vec2 c = ( pc + 0.3 + 0.4 * ph2 ) * 7.5;",
    "      vec2 hs = ph.y < 0.35 ? vec2( 0.35 + 0.3 * ph2.x, 2.2 + 2.0 * ph2.y ) : vec2( 0.7 + 1.5 * ph2.y, 0.55 + 1.2 * ph2.x );", // trench cut / pothole patch (half sizes)
    "      if ( fract( ph2.x * 7.1 ) > 0.5 ) hs = hs.yx;",
    "      vec2 q = abs( p - c ) - hs + 0.3;",
    "      float sd = length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 ) - 0.3;",
    "      sd += ( txNoise( p * 2.3 + ph * 9.0 ) - 0.5 ) * 0.2 + ( txNoise( p * 11.0 ) - 0.5 ) * 0.05;",
    "      inP = 1.0 - smoothstep( -0.015 - fp, 0.015 + fp, sd );",
    "      float fresh = ph.x < 0.17 ? 0.68 : 1.13;", // newer black tar vs. older, dusty grey patch
    "      col *= mix( 1.0, fresh * ( 0.92 + 0.16 * txNoise( p * 3.7 ) ), inP );",
    "      col *= 1.0 - 0.45 * ( 1.0 - smoothstep( 0.0, 0.03 + fp, abs( sd ) ) ) * ( 1.0 - smoothstep( 0.06, 0.25, fp ) );", // rolled seam
    "      col *= 1.0 + 0.07 * smoothstep( 0.0, 0.06, sd ) * ( 1.0 - smoothstep( 0.1, 0.35, sd ) );", // feathered crown outside
    "    }",
    "  } else {",
    // pavements / concrete: decades of city dirt — a patchy grime coat (2–10 m), dark water / oil blooms with a faint
    // tide line, pale wind-blown dust drifts, soot-grey zones; world-anchored so the 1.5 m slab grid never repeats
    "    float gz = txNoise( p * 0.16 + 51.0 ) * 0.6 + txNoise( p * 0.62 + 9.0 ) * 0.3 + txNoise( p * 2.3 ) * 0.1;",
    "    col = mix( col, col * vec3( 0.6, 0.56, 0.5 ), smoothstep( 0.38, 0.78, gz ) * 0.85 );",
    "    float sb = txNoise( p * 0.42 + 77.0 ) * 0.7 + txNoise( p * 1.9 + 4.0 ) * 0.3;",
    "    col *= 1.0 - 0.32 * smoothstep( 0.68, 0.8, sb ) - 0.1 * ( 1.0 - smoothstep( 0.0, 0.012, abs( sb - 0.665 ) ) ) * ( 1.0 - smoothstep( 0.02, 0.05, fp ) );", // dried-puddle tide line
    "    col = mix( col, vec3( 0.34, 0.31, 0.27 ) * ( 0.9 + 0.2 * txNoise( p * 7.0 ) ), 0.32 * smoothstep( 0.62, 0.86, txNoise( p * 0.3 + 19.0 ) * 0.8 + txNoise( p * 3.1 ) * 0.2 ) );",
    "  }",
    // dead leaves & scraps of paper blown into drifts (roads' gutters and pavements alike): a brown tint zone at any
    // distance, individual leaves (rotated, veined ellipses) only where they are a few pixels big
    "  float lz = smoothstep( 0.56, 0.82, txNoise( p * 0.21 + 61.0 ) * 0.75 + txNoise( p * 0.9 + 3.0 ) * 0.25 );",
    "  if ( lz > 0.01 ) {",
    "    col = mix( col, vec3( 0.19, 0.13, 0.07 ), lz * 0.22 );",
    "    if ( fp < 0.025 ) {",
    "      vec2 lc = p * 4.5; vec2 li = floor( lc ); vec2 lh = txH2( li + 3.7 ); vec2 lf = fract( lc ) - 0.3 - 0.4 * lh;",
    "      float la = lh.x * 6.2832; vec2 lq = mat2( cos( la ), -sin( la ), sin( la ), cos( la ) ) * lf;",
    "      float ld = length( lq * vec2( 1.0, 2.1 ) ) - 0.1 - 0.07 * lh.y;",
    "      float lv = ( 1.0 - smoothstep( -0.012, 0.012 + fp * 4.5, ld ) ) * step( 1.0 - lz * 0.85, txHash( li * 0.371 + 1.3 ) ) * ( 1.0 - smoothstep( 0.012, 0.025, fp ) );",
    "      float pap = step( 0.93, fract( lh.y * 17.0 ) );", // a few paper scraps among the leaves
    "      vec3 lcol = pap > 0.5 ? vec3( 0.5, 0.47, 0.4 ) : mix( vec3( 0.2, 0.11, 0.045 ), vec3( 0.38, 0.26, 0.1 ), fract( lh.y * 5.3 ) );",
    "      lcol *= ( 0.72 + 0.28 * smoothstep( 0.0, 0.05, -ld ) ) * ( 0.88 + 0.16 * step( 0.012, abs( lq.y ) ) * ( 1.0 - pap ) );", // curled darker edges, mid-rib
    "      col = mix( col, lcol, lv );",
    "    }",
    "  }",
    "  if ( fp > 0.3 ) return col;",
    "  float nf = 1.0 - smoothstep( 0.08, 0.3, fp );",
    "  float act = smoothstep( 0.36, 0.55, txNoise( p * 0.043 + 3.0 ) * 0.7 + txNoise( p * 0.17 ) * 0.3 ) * min( amt * 1.4, 1.0 );",
    "  float seal = smoothstep( 0.56, 0.7, txNoise( p * 0.023 + 11.0 ) ) * pat;",
    "  if ( act + seal > 0.01 ) {",
    "    vec3 v = txVor( wp * 0.24 ); float e = v.x / 0.24;", // metres to the nearest crack line
    "    float seg = smoothstep( 0.32, 0.5, txNoise( wp * 0.6 + v.yz * 37.0 ) );", // broken runs, not a closed lattice
    "    float wdt = mix( 0.004, 0.022, v.y * v.y ) * ( 0.5 + 0.5 * seg );",
    "    float ww = max( wdt, fp * 0.7 );",
    "    float cov = ( 1.0 - smoothstep( ww * 0.5, ww * 0.5 + fp * 0.7, e ) ) * ( wdt / ww ) * seg * act * ( 1.0 - inP );",
    "    float sbw = 0.035 + 0.035 * v.z;",
    "    float sb = ( 1.0 - smoothstep( sbw - fp * 0.7, sbw + fp * 0.7, e + ( txNoise( wp * 6.0 ) - 0.5 ) * 0.025 ) ) * seal * ( 1.0 - inP ) * step( 0.25, v.z );",
    "    col = mix( col, vec3( 0.026, 0.025, 0.024 ), sb * 0.7 );",
    "    col *= 1.0 - 0.22 * ( 1.0 - smoothstep( 0.0, 0.1 + fp, e ) ) * act * seg * ( 1.0 - sb );", // grime collects along the lips
    "    col = mix( col, vec3( 0.018, 0.017, 0.015 ), cov * 0.9 * nf * ( 1.0 - sb ) );",
    "    col = mix( col, vec3( 0.085, 0.09, 0.04 ) * ( 0.7 + 0.6 * txNoise( wp * 40.0 ) ), ( 1.0 - pat ) * 0.6 * ( 1.0 - smoothstep( 0.0, 0.035 + fp, e ) ) * act * seg * smoothstep( 0.5, 0.68, txNoise( wp * 2.5 + 8.0 ) ) );", // moss / dead weeds in pavement cracks
    "  }",
    "  float fat = smoothstep( 0.66, 0.8, txNoise( p * 0.09 + 23.0 ) ) * pat * ( 1.0 - inP );",
    "  if ( fat > 0.01 && fp < 0.08 ) {",
    "    vec3 v2 = txVor( wp * 3.0 ); float e2 = v2.x / 3.0;",
    "    float wd2 = 0.003 + 0.003 * fat, ww2 = max( wd2, fp * 0.7 );",
    "    float c2 = ( 1.0 - smoothstep( ww2 * 0.5, ww2 * 0.5 + fp * 0.7, e2 ) ) * ( wd2 / ww2 ) * fat * ( 1.0 - smoothstep( 0.03, 0.08, fp ) );",
    "    col *= 1.0 + ( v2.y - 0.5 ) * 0.14 * fat;", // loose, slightly tilted chunks
    "    col = mix( col, vec3( 0.018 ), c2 * 0.85 );",
    "  }",
    "  return col; }",
    "float txWR( vec2 p, vec2 c, vec2 h, float aa ) { vec2 d = abs( p - c ) - h; return 1.0 - smoothstep( -aa, aa, max( d.x, d.y ) ); }",
    /*
     * Reflected environment seen in façade glass (world direction r, window position p, edge softness soft):
     * the atmosphere's live sky (horizon→zenith gradient, sun-side glow, sun halo + glint) above the skyline,
     * a far city skyline (~320 m, hazy) and the near street canyon (the opposite façades ~25–45 m away, with
     * their window rows and, at night, a few lit rooms) below it, the dark street under the horizon.
     * Skylines are keyed on the reflection azimuth and the ~90 m block the window sits in, so they stay put in
     * the world while the camera moves; low windows reflect the opposite buildings, high ones the open sky.
     */
    "uniform vec3 uTxSkyZ, uTxSkyH, uTxSunC;",
    "uniform float uTxSkyK;",
    "uniform vec4 uTxSkyG, uTxSunD;", // G: sun-side glow rgb + night factor; SunD: sun direction + visible size
    "vec3 txSkyRefl( vec3 r, vec3 p, float soft, float det ) {",
    "  float hz = max( length( r.xz ), 1e-3 ); float el = r.y / hz;",
    "  float az = atan( r.z, r.x ) * 0.15915 + 0.5;",
    "  vec2 bq = floor( p.xz / 90.0 );",
    "  float hp = max( r.y, 0.0 );",
    "  vec3 sky = mix( uTxSkyH, uTxSkyZ, pow( smoothstep( 0.0, 1.0, hp ), 0.5 ) );",
    "  vec2 sh = normalize( uTxSunD.xz + 1e-5 );",
    "  sky = mix( sky, uTxSkyG.rgb, pow( max( dot( r.xz / hz, sh ), 0.0 ), 3.0 ) * exp( -hp * 4.0 ) * 0.5 * min( uTxSunD.w, 1.0 ) );",
    "  float sd = max( dot( r, uTxSunD.xyz ), 0.0 );",
    "  sky += uTxSunC * ( pow( sd, 5.0 ) * 0.07 + pow( sd, 40.0 ) * 0.25 + pow( sd, 350.0 ) * 2.5 * det ) * uTxSunD.w;",
    // far skyline: ~24 towers per turn at ~320 m, 30–200 m tall, washed out by the haze
    "  float fa = az * 24.0 + txHash( bq * 0.37 + 0.5 ) * 24.0; float fi = floor( fa );",
    "  float fh = 30.0 + 170.0 * pow( txHash( vec2( fi * 0.173, bq.x * 0.31 + bq.y * 0.77 ) ), 2.0 );",
    "  float fB = 1.0 - smoothstep( -soft, soft, el - ( fh - p.y ) / 320.0 );",
    "  vec3 c = mix( sky, uTxSkyH * ( 0.58 + 0.08 * txHash( vec2( fi, 5.0 ) ) ), fB );",
    // the street far below (high windows looking down)
    "  c = mix( c, uTxSkyH * 0.2, smoothstep( -0.25, -0.6, el ) );",
    // near street canyon: ~10 frontages per turn, 25–45 m across the street, 12–72 m tall
    "  float na = az * 10.0 + txHash( bq * 0.71 + 3.0 ) * 10.0; float ni = floor( na );",
    "  float nh = 12.0 + 60.0 * pow( txHash( vec2( ni * 0.37, bq.y * 0.53 + bq.x * 0.19 + 1.0 ) ), 1.5 );",
    "  float nd = 25.0 + 20.0 * txHash( vec2( ni * 0.61, 7.0 ) );",
    "  float nB = 1.0 - smoothstep( -soft, soft, el - ( nh - p.y ) / nd );",
    "  vec2 wu = vec2( fract( na ) * 7.0, ( p.y + el * nd ) / 3.5 ); vec2 wi = floor( wu ); vec2 wf = fract( wu );",
    "  float wm = txWR( wf, vec2( 0.5, 0.55 ), vec2( 0.26, 0.24 ), 0.08 ) * det;",
    "  vec3 nc = uTxSkyH * ( 0.26 + 0.12 * txHash( vec2( ni, 3.0 ) ) ) * ( 1.0 - 0.45 * wm );",
    "  nc += vec3( 1.0, 0.6, 0.28 ) * 0.35 * uTxSkyG.w * wm * step( 0.9, txHash( wi * 0.37 + ni * 1.31 + bq ) );",
    "  return mix( c, nc, nB * step( -0.9, el ) ); }",
    // ---- value noise with analytic gradient (no derivative taps → safe inside non-uniform branches). The lattice is
    // periodic (509 cells), so high frequencies far from the origin keep their precision and never seam.
    "float txHq( vec2 i ) { i = mod( i, 509.0 ); return txHash( i * 0.0731 + 0.37 ); }",
    "vec3 txNoiseD( vec2 p ) { vec2 i = floor( p ); vec2 f = p - i;",
    "  vec2 u = f * f * ( 3.0 - 2.0 * f ); vec2 du = 6.0 * f * ( 1.0 - f );",
    "  float a = txHq( i ), b = txHq( i + vec2( 1.0, 0.0 ) ), c = txHq( i + vec2( 0.0, 1.0 ) ), d = txHq( i + vec2( 1.0, 1.0 ) );",
    "  float k = a - b - c + d;",
    "  return vec3( a + ( b - a ) * u.x + ( c - a ) * u.y + k * u.x * u.y, du * ( vec2( b - a, c - a ) + k * u.yx ) ); }",
    /*
     * Close-range surface detail (uTxDetail: 1 mineral — concrete, stone, plaster, kerbs; 2 metal — painted, bare, rusty,
     * corrugated). q: planar world coordinates (m, projected on the dominant axis), fp: pixel footprint (m), wet 0..1.
     * Returns xy = height gradient per metre (for the normal), z = albedo multiplier, w = roughness offset.
     * Mineral: 10 cm undulation, 2–3 cm aggregate, pinhole pores (dark, rough). Metal: oil-canning dents, grease / wear
     * smudges (roughness breakup — the specular highlight no longer slides over a perfect plane), fine directional
     * scratches that catch the light (bare metal: brighter, glossier) and corrosion pits. Every layer fades out before
     * it would be smaller than ~3 px, so nothing shimmers.
     */
    "uniform float uTxDetail;",
    "vec4 txDetailF( vec2 q, float fp, float kind ) {",
    "  vec2 g = vec2( 0.0 ); float al = 1.0, ro = 0.0;",
    "  if ( kind < 1.5 ) {",
    "    float f0 = 1.0 - smoothstep( 0.02, 0.06, fp ), f1 = 1.0 - smoothstep( 0.005, 0.016, fp ), f2 = 1.0 - smoothstep( 0.0018, 0.005, fp );",
    "    vec3 a = txNoiseD( q * 2.3 + 11.0 ); ro += ( a.x - 0.5 ) * 0.14 * f0; al *= 1.0 + ( a.x - 0.5 ) * 0.07 * f0;",
    "    if ( f1 > 0.0 ) { vec3 b = txNoiseD( q * 9.0 ); g += b.yz * 9.0 * 0.0075 * f1; ro += ( b.x - 0.5 ) * 0.08 * f1; }",
    "    if ( f2 > 0.0 ) {",
    "      vec3 c = txNoiseD( q * 34.0 + 3.7 ); g += c.yz * 34.0 * 0.0016 * f2; al *= 1.0 + ( c.x - 0.5 ) * 0.1 * f2;",
    "      vec3 e = txNoiseD( q * 71.0 + 9.1 ); float t = clamp( ( e.x - 0.8 ) / 0.1, 0.0, 1.0 );",
    "      float pit = t * t * ( 3.0 - 2.0 * t ); g -= e.yz * 71.0 * 6.0 * t * ( 1.0 - t ) / 0.1 * 0.0005 * f2;",
    "      al *= 1.0 - 0.45 * pit * f2; ro += 0.12 * pit * f2;",
    "    }",
    "  } else {",
    "    float f0 = 1.0 - smoothstep( 0.03, 0.1, fp ), f1 = 1.0 - smoothstep( 0.006, 0.02, fp ), f2 = 1.0 - smoothstep( 0.0015, 0.0045, fp );",
    "    vec3 dn = txNoiseD( q * 1.1 + 5.0 ); vec3 dn2 = txNoiseD( q * 3.7 + 1.0 );",
    "    g += ( dn.yz * 1.1 * 0.02 + dn2.yz * 3.7 * 0.0035 ) * f0;", // oil-canning dents
    "    float sm = txNoise( q * 2.6 + 17.0 ) * 0.65 + txNoise( q * 9.0 + 3.0 ) * 0.35;",
    "    ro += ( sm - 0.5 ) * 0.34 * f0; al *= 1.0 - 0.1 * smoothstep( 0.62, 0.85, sm ) * f0;", // grease / hand wear
    "    if ( f2 > 0.0 ) {",
    "      vec2 cq = floor( q * 1.4 ); float an = txHash( cq * 0.37 + 0.11 ) * 3.1416;", // scratch direction per ~70 cm patch
    "      vec2 dr = vec2( cos( an ), sin( an ) ); vec2 sq = vec2( dot( q, dr ), dot( q, vec2( -dr.y, dr.x ) ) );",
    "      float sc = txNoise( vec2( sq.x * 1.7, sq.y * 160.0 ) ) * txNoise( vec2( sq.x * 0.6 + 7.0, sq.y * 3.0 ) );",
    "      float scr = smoothstep( 0.42, 0.62, sc ) * f2;",
    "      al *= 1.0 + 0.35 * scr; ro -= 0.3 * scr;",
    "    }",
    "    if ( f1 > 0.0 ) {",
    "      vec3 e = txNoiseD( q * 45.0 + 2.2 ); float t = clamp( ( e.x - 0.84 ) / 0.1, 0.0, 1.0 );",
    "      g -= e.yz * 45.0 * 6.0 * t * ( 1.0 - t ) / 0.1 * 0.0003 * f1;",
    "      float pit = t * t * ( 3.0 - 2.0 * t ) * f1 * smoothstep( 0.45, 0.7, sm ); al *= 1.0 - 0.16 * pit; ro += 0.15 * pit;",
    "    }",
    "  }",
    "  return vec4( g, al, ro ); }",
    /*
     * Standing water (roads and pavements, world-anchored): about half of the potholes hold murky water in dry weather,
     * all of them brim-full in the rain; shallow sags in the carriageway keep stagnant puddles (~2 % of the road dry,
     * ~10 % soaked). ph = pothole info from txGround (inside, depth 0 rim..1 bowl, hash). Returns the water coverage;
     * ring = the silt tide line left by evaporation (dry) / the dark soaked margin (wet).
     */
    "float txPuddle( vec2 p, float fp, float amt, vec4 ph, float wet, out float ring ) {",
    "  float w = 0.0;",
    "  if ( ph.x > 0.001 ) {",
    "    float lvl = mix( 0.42, -0.02, wet );",
    "    w = ph.x * smoothstep( lvl, lvl + 0.05 + fp * 3.0, ph.y ) * step( ph.z, 0.55 + 0.45 * wet );",
    "  }",
    "  float n = txNoise( p * 0.23 + 91.0 ) * 0.6 + txNoise( p * 0.83 + 5.0 ) * 0.28 + txNoise( p * 3.1 + 2.0 ) * 0.09 + txNoise( p * 11.0 ) * 0.03;",
    "  float th = mix( 0.76, 0.68, wet ) + ( 1.0 - min( amt, 1.0 ) ) * 0.06;",
    "  float aa = 0.003 + fp * 0.5;",
    "  w = max( w, smoothstep( th - aa, th + aa, n ) );",
    "  ring = ( 1.0 - smoothstep( 0.0, 0.035 + aa, th - n ) ) * step( n, th ) * ( 1.0 - w );",
    "  return w; }",
  ].join("\n");
  // Applied right after the albedo map: broad blotchy value variation (8–30 m), vertical rain-wash
  // bands, warm sun-bleach vs. cool soot tint, and (walls only) a dark street-level grime band.
