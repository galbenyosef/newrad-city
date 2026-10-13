/* src/atmosphere/20_water.js */
/* =====================================================================
 * ATMOSPHERE — irradiated harbour water
 * One big plane at G.world.waterLevel covering everything that isn't land
 * (the land plates of the map module sit above it). Custom shader:
 *   - murky olive/brown irradiated water, deeper = darker (distance field)
 *   - analytic swell waves + scrolling noise chop → per-pixel normals
 *   - Fresnel sky reflection (matches the sky gradient), sun/moon glints
 *   - animated foam & lapping bands along every shoreline (baked shore
 *     distance texture from G.LAYOUT.isLand)
 *   - faint glowing green radioactive slicks (stronger at night)
 *   - rain dimples, lightning flashes, exponential fog
 * Also exports G.atmos.createWaterMesh() for ponds (Central Park Lake,
 * Reservoir) and G.atmos.waterMaterial.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos;

  const VERT = `
    varying vec3 vWorld;
    #include <fog_pars_vertex>
    void main(){
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorld = wp.xyz;
      vec4 mvPosition = viewMatrix * wp;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
  const FRAG = `
    uniform sampler2D uNoise, uShore;
    uniform vec4 uShoreRect;          // minX, minZ, 1/sizeX, 1/sizeZ
    uniform float uTime, uNight, uGlow, uRain, uFlash, uFoamAmt, uChop;
    uniform vec3 uSunDir, uSunColor, uZenith, uHorizon, uFogTop;
    uniform vec3 uDeep, uShallow, uFoamColor, uAmbient, uSunLight, uFlashColor;
    uniform vec3 uCloudLit, uCloudShade, uSSS;
    uniform vec2 uWind;
    uniform float uPostA;
    varying vec3 vWorld;
    #include <fog_pars_fragment>
    ${A.glsl.noise}
    ${A.glsl.fogFactor}

    // analytic directional swells: returns (dh/dx, dh/dz)
    vec2 swells(vec2 p, float t){
      vec2 g = vec2(0.0);
      vec2 d; float k, a, ph;
      d = normalize(vec2(1.0, 0.35));  k = 0.21; a = 0.06; ph = dot(d, p) * k + t * 1.1; g += d * k * a * cos(ph);
      d = normalize(vec2(-0.4, 1.0));  k = 0.37; a = 0.035; ph = dot(d, p) * k + t * 1.6; g += d * k * a * cos(ph);
      d = normalize(vec2(0.8, -0.6));  k = 0.63; a = 0.02; ph = dot(d, p) * k + t * 2.2; g += d * k * a * cos(ph);
      d = normalize(vec2(-0.9, -0.3)); k = 1.1;  a = 0.01; ph = dot(d, p) * k + t * 2.9; g += d * k * a * cos(ph);
      return g;
    }
    vec2 chopGrad(vec2 p){
      float e = 0.6;
      float c = an2(p), x = an2(p + vec2(e, 0.0)), z = an2(p + vec2(0.0, e));
      return vec2(x - c, z - c) / e;
    }

    void main(){
      vec3 P = vWorld;
      vec2 p = P.xz;
      float t = uTime;
      vec3 V = normalize(cameraPosition - P);
      float dist = length(cameraPosition - P);

      // ---- shore distance (metres)
      float shoreD = 400.0;
      #ifndef NO_SHORE
        vec2 suv = (p - uShoreRect.xy) * uShoreRect.zw;
        if (suv.x > 0.0 && suv.x < 1.0 && suv.y > 0.0 && suv.y < 1.0) shoreD = texture2D(uShore, suv).r * 510.0;
      #endif

      // ---- normal: swells + two layers of scrolling chop (faded with distance to avoid shimmer)
      vec2 g = swells(p, t);
      // chop fades out early (a single noise scale seen at grazing angles far away reads as a
      // tiled dune pattern); the octaves are rotated & anisotropically scaled against each other
      float detailFade = 1.0 - smoothstep(40.0, 250.0, dist);
      const mat2 R1 = mat2(0.80, -0.60, 0.60, 0.80);
      const mat2 R2 = mat2(0.28, 0.96, -0.96, 0.28);
      g += chopGrad(p * vec2(0.9, 0.62) + uWind * t * 1.5) * 0.22 * uChop * detailFade;
      g += R1 * chopGrad((R1 * p) * vec2(3.7, 2.3) - uWind.yx * t * 3.0 + 40.0) * 0.08 * uChop * detailFade;
      g += R2 * chopGrad((R2 * p) * vec2(8.3, 6.1) + uWind * t * 4.5 + 91.0) * 0.035 * uChop * (1.0 - smoothstep(12.0, 70.0, dist));
      // grazing angles: blend the normal toward flat (kills distant shimmer & tiling, keeps a clean horizon)
      float graze = 1.0 - smoothstep(0.02, 0.25, abs(V.y));
      g *= 1.0 - graze * 0.65;
      // WIND FIELD over the harbour: gust patches ("cat's paws") and long wind streaks (Langmuir
      // slicks) aligned with the wind. Calm, oily lanes mirror the sky; rough patches are darker
      // with a broad glitter. This is what gives open water its scale from rooftops and aerials,
      // where the wave normals themselves are far below a pixel.
      vec2 wdir = uWind / max(length(uWind), 1e-4);
      vec2 wq = vec2(dot(p, wdir), dot(p, vec2(-wdir.y, wdir.x)));
      float gust = afbm3o(p * 0.0042 + vec2(-t * 0.004, t * 0.0025) + wdir * t * 0.006);
      float lane = afbm3o(vec2(wq.x * 0.0021 - t * 0.003, wq.y * 0.026));
      float rough = clamp(0.5 + (gust - 0.5) * 1.9 + (smoothstep(0.42, 0.62, lane) - 0.5) * 0.7, 0.0, 1.0);
      // big slow patches of calmer / rougher water break up any remaining repetition
      g *= 0.35 + 1.0 * rough;
      // rain dimples
      if (uRain > 0.01) {
        vec2 rp = p * 6.0; vec2 ci = floor(rp); vec2 cf = fract(rp) - 0.5;
        float rnd = fract(sin(dot(ci, vec2(12.9898, 78.233))) * 43758.5453);
        float ph = fract(t * 1.3 + rnd);
        float ring = sin(length(cf) * 40.0 - ph * 30.0) * (1.0 - ph) * smoothstep(0.5, 0.1, length(cf));
        g += normalize(cf + 1e-4) * ring * 0.25 * uRain * detailFade;
      }
      vec3 N = normalize(vec3(-g.x, 1.0, -g.y));

      // ---- base colour: muddy shallows near shore → dark olive deep water
      float depthK = smoothstep(4.0, 140.0, shoreD);
      vec3 base = mix(uShallow, uDeep, depthK);
      // subsurface murk variation
      float murk = afbm3o(p * 0.03 + vec2(t * 0.01, -t * 0.007));
      base *= 0.8 + 0.4 * murk;
      // moving cloud shadows (same deck as the sky / the city): dim the sun on the water and its glints
      float csh = 1.0;
      #if defined( USE_FOG ) && defined( FOG_EXP2 )
        csh = nrcCloudSh(P);
      #endif
      vec3 lit = base * (uAmbient * 0.9 + uSunLight * max(dot(N, uSunDir), 0.0) * 0.35 * csh);
      // light through the wave crests when looking toward a low sun (murky, irradiated green-yellow)
      vec2 toSun = normalize(uSunDir.xz + 1e-5);
      float back = max(dot(-V.xz / max(length(V.xz), 1e-4), toSun), 0.0);
      float crest = clamp(length(g) * 5.0 - 0.15, 0.0, 1.0);
      lit += uSSS * pow(back, 3.0) * crest * (1.0 - smoothstep(0.1, 0.6, uSunDir.y)) * csh * detailFade;

      // ---- reflection (sky gradient + the cloud deck) with Fresnel
      vec3 R = reflect(-V, N);
      float ry = max(R.y, 0.0);
      vec3 sky = mix(uHorizon, uZenith, pow(ry, 0.5));
      #if defined( USE_FOG ) && defined( FOG_EXP2 )
        if (nrcCldS.z > 0.0) {
          // the cloud deck is looked up with a SMOOTHED normal: small chop only blurs a reflection
          // this far away (a sharp per-wave lookup turned it into high-contrast leopard blotches)
          vec3 Rc = reflect(-V, normalize(mix(N, vec3(0.0, 1.0, 0.0), 0.7)));
          float rcy = max(Rc.y, 0.0);
          float rt = max(nrcCldS.w - P.y, 60.0) / max(rcy, 0.035);
          vec2 cq = (P.xz + Rc.xz * rt + nrcCld.zw) * nrcCldS.z;
          float cn = nrcCloudN(cq);
          float cc = smoothstep(nrcCld.y, nrcCld.y + 0.12 + 0.15 * smoothstep(3000.0, 30000.0, rt), cn);
          float cth = clamp((cn - nrcCld.y) / 0.26, 0.0, 1.0);
          vec3 ccol = mix(uCloudLit * 0.7, uCloudShade, cth * 0.7);
          sky = mix(sky, ccol, cc * mix(0.72, 0.45, rough) * smoothstep(0.0, 0.08, rcy));
        }
      #endif
      sky = mix(sky, uFogTop, 0.35);
      // Fresnel with MASKING: at grazing view angles the wave backs hide behind the crests and what is
      // left is seen nearly edge-on, and further out the chop is far below a pixel — the average
      // reflectance is that of a much smoother surface. The Fresnel term uses a flattened normal (the
      // reflection direction keeps the full one, so reflections still wobble and streak). Without this
      // every chop cell flipped between mirror sky and the dark water body → a high-contrast
      // "leopard" pattern across the mid-field at street level.
      float flatK = clamp(graze * 0.7 + smoothstep(25.0, 220.0, dist) * 0.5, 0.0, 0.85);
      vec3 Nf = normalize(mix(N, vec3(0.0, 1.0, 0.0), flatK));
      float fres = 0.03 + 0.97 * pow(1.0 - max(dot(Nf, V), 0.0), 5.0);
      // keep a little of the per-facet variation (glints of darker wave faces), mostly near the viewer
      float fresN = 0.03 + 0.97 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
      fres = mix(fres, fresN, 0.3 * (1.0 - flatK));
      fres = min(fres, 0.75);
      // sub-pixel roughness far out: rough water shows more of the (dark) wave faces and a dimmer,
      // blurrier sky; calm lanes stay glassy → visible streaks and gust patches at any distance
      float farK = smoothstep(40.0, 700.0, dist);
      // (tilted facets raise the average Fresnel when looking steeply down, lower it at grazing angles:
      // rough patches pull toward a mid value — lighter than calm water from the air, darker at the horizon)
      fres = clamp(mix(fres, 0.16, clamp(farK * (rough - 0.3) * 1.3, -0.6, 0.9)), 0.02, 0.75);
      vec3 col = mix(lit * (1.0 - 0.18 * farK * rough), sky * (1.0 - 0.12 * farK * rough), fres);
      float reflK = fres;   // how mirror-like this pixel is (post-fx screen-space reflections read it from alpha)

      // ---- sun / moon glints
      float rs = max(dot(R, uSunDir), 0.0);
      // the specular lobe widens where the (sub-pixel) waves are rough and far away: a sharp sun
      // point on calm water nearby, a long broken glitter path across the harbour (energy-normalised)
      float gRough = clamp(farK * (0.45 + 0.8 * rough) + rough * 0.15, 0.0, 1.0);
      float nS = mix(220.0, 22.0, gRough);
      float glitter = pow(rs, nS) * (nS + 2.0) / 222.0;
      // twinkle: individual wave facets flashing (only where they are still resolvable)
      glitter *= mix(1.0, 0.35 + 1.3 * smoothstep(0.45, 0.8, an2(p * 1.7 + vec2(t * 0.9, -t * 0.7))), 1.0 - farK);
      col += uSunColor * (glitter * 3.5 + pow(rs, 24.0) * 0.08 + pow(rs, mix(70.0, 18.0, gRough)) * 0.5 * uNight) * csh;

      // ---- radioactive slicks (glow green, stronger at night)
      // oily scum, broken up by fbm so it reads as patchy film, not painted bands
      float slick = afbm3o(p * 0.012 + vec2(t * 0.004, t * 0.002));
      float brk = smoothstep(0.35, 0.7, afbm2(p * 0.05 + vec2(13.0, -t * 0.01)));
      float s = smoothstep(0.64, 0.76, slick) * brk * uGlow * (0.6 + 0.4 * an2(p * 0.08 + t * 0.05));
      col = mix(col, col * vec3(0.78, 1.0, 0.62), s * 0.45);
      // oil-film sheen: faint iridescent shift in the reflection
      col += sky * fres * s * 0.25 * (vec3(0.5, 0.35, 0.6) + 0.5 * sin(vec3(0.0, 2.1, 4.2) + slick * 30.0));
      col += vec3(0.02, 0.085, 0.015) * s * (0.15 + 0.5 * uNight) * (0.8 + 0.2 * sin(t * 1.3 + slick * 20.0));

      // ---- foam & lapping at the shore
      #ifndef NO_SHORE
        float fn = an2(p * 1.3 + vec2(t * 0.4, t * 0.25)) * 0.6 + an2(p * 3.1 - t * 0.3) * 0.4;
        float edge = 1.0 - smoothstep(0.0, 5.0 + fn * 4.0, shoreD);
        float bands = smoothstep(0.55, 1.0, sin(shoreD * 0.9 - t * 1.6 + fn * 3.0)) * (1.0 - smoothstep(2.0, 16.0, shoreD));
        float foam = clamp(edge * (0.55 + 0.45 * fn) + bands * fn * 0.8, 0.0, 1.0) * uFoamAmt;
        foam *= 0.55 + 0.45 * smoothstep(0.25, 0.6, afbm3o(p * 0.4 + t * 0.05));   // clumpy, broken scum
        // grimy scum lines (dirty grey-brown, lit by the scene — never neon)
        // seen from far away / from the air the 5 m foam band is sub-pixel: keep a thin, lighter scum
        // line hugging every shore whose width grows with distance (≈ 1–2 px), plus a muddier band
        float farLine = (1.0 - smoothstep(0.0, 3.0 + dist * 0.012, shoreD)) * smoothstep(70.0, 320.0, dist);
        foam = max(foam, farLine * 0.42 * uFoamAmt);
        col = mix(col, col * vec3(0.86, 0.8, 0.66), (1.0 - smoothstep(0.0, 10.0 + dist * 0.03, shoreD)) * smoothstep(60.0, 300.0, dist) * 0.5);
        col = mix(col, uFoamColor * (uAmbient * 0.8 + uSunLight * 0.25), foam * 0.7);
        reflK *= 1.0 - foam * 0.8;
      #endif
      reflK *= 1.0 - s * 0.35;

      // lightning
      col += uFlashColor * uFlash * (0.08 + fres * 0.5);

      float ff = atmosFogFactor();
      // far harbour: rougher (wind-chopped, polluted) water mirrors less, and a low mist lies on it —
      // no glassy copies of distant islands, no hard edge where the water plane meets the sky
      #ifdef USE_FOG
        float farW = smoothstep(300.0, 1400.0, length(vFogRay));
        reflK *= 1.0 - 0.8 * farW;
        col = mix(col, lit * 0.9, farW * 0.35);
        ff = clamp(ff + farW * 0.4 * (1.0 - ff), 0.0, 1.0);
      #endif
      // alpha tags water for the post-fx reflections: 0.3..0.65 = water with that reflectivity
      // (fog-attenuated), 1 = everything else, 0 = open sky. Plain rendering keeps alpha 1.
      float wa = 0.3 + 0.35 * clamp(reflK / 0.75 * (1.0 - ff), 0.0, 1.0);
      gl_FragColor = vec4(col, mix(1.0, wa, uPostA));
      gl_FragColor.rgb = mix(gl_FragColor.rgb, atmosFogC, ff);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  let water = null,
    mat = null,
    shoreTex = null;
  const extraMats = [];

  /** Bake a distance-to-land field over the world (4 m texels). */
  function bakeShore() {
    const L = G.LAYOUT;
    if (!L) return null;
    const W = L.WORLD,
      pad = 60,
      cell = 4;
    const minX = W.minX - pad,
      minZ = W.minZ - pad,
      maxX = W.maxX + pad,
      maxZ = W.maxZ + pad;
    const nx = Math.ceil((maxX - minX) / cell),
      nz = Math.ceil((maxZ - minZ) / cell);
    const INF = 1e9;
    const d = new Float32Array(nx * nz);
    for (let j = 0; j < nz; j++) {
      const z = minZ + (j + 0.5) * cell;
      for (let i = 0; i < nx; i++) {
        const x = minX + (i + 0.5) * cell;
        d[j * nx + i] = L.isLand(x, z) ? 0 : INF;
      }
    }
    // two-pass chamfer distance transform (3-4 approximation of euclidean)
    const a = cell,
      b = cell * 1.4142;
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        let v = d[k];
        if (v === 0) continue;
        if (i > 0) v = Math.min(v, d[k - 1] + a);
        if (j > 0) {
          v = Math.min(v, d[k - nx] + a);
          if (i > 0) v = Math.min(v, d[k - nx - 1] + b);
          if (i < nx - 1) v = Math.min(v, d[k - nx + 1] + b);
        }
        d[k] = v;
      }
    for (let j = nz - 1; j >= 0; j--)
      for (let i = nx - 1; i >= 0; i--) {
        const k = j * nx + i;
        let v = d[k];
        if (v === 0) continue;
        if (i < nx - 1) v = Math.min(v, d[k + 1] + a);
        if (j < nz - 1) {
          v = Math.min(v, d[k + nx] + a);
          if (i < nx - 1) v = Math.min(v, d[k + nx + 1] + b);
          if (i > 0) v = Math.min(v, d[k + nx - 1] + b);
        }
        d[k] = v;
      }
    const data = new Uint8Array(nx * nz * 4);
    for (let k = 0; k < nx * nz; k++) {
      const v = Math.min(255, Math.round(d[k] / 2));
      data[k * 4] = v;
      data[k * 4 + 1] = d[k] === 0 ? 255 : 0;
      data[k * 4 + 2] = 0;
      data[k * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(
      data,
      nx,
      nz,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
    );
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearFilter;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.colorSpace = THREE.NoColorSpace;
    tex.needsUpdate = true;
    A.shore = {
      minX,
      minZ,
      sizeX: nx * cell,
      sizeZ: nz * cell,
      nx,
      nz,
      cell,
      dist: d,
    };
    return tex;
  }

  /** Distance to nearest land (m) at x,z from the baked field (for other modules: boats, shellbacks...). */
  ATMOS.shoreDistance = function (x, z) {
    const S = A.shore;
    if (!S) return 0;
    const i = Math.floor((x - S.minX) / S.cell),
      j = Math.floor((z - S.minZ) / S.cell);
    if (i < 0 || j < 0 || i >= S.nx || j >= S.nz) return 500;
    return S.dist[j * S.nx + i];
  };

  function init() {
    shoreTex = bakeShore();
    const U = A.fogUniforms({
      uNoise: { value: A.noiseTex },
      uShore: { value: shoreTex },
      uShoreRect: { value: new THREE.Vector4(0, 0, 1, 1) },
      uTime: { value: 0 },
      uNight: { value: 0 },
      uGlow: { value: 1 },
      uRain: { value: 0 },
      uFlash: { value: 0 },
      uFoamAmt: { value: 1 },
      uChop: { value: 1 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color() },
      uZenith: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uFogTop: { value: new THREE.Color() },
      uDeep: { value: new THREE.Color("#1d2419") },
      uShallow: { value: new THREE.Color("#3e4228") },
      uFoamColor: { value: new THREE.Color("#7e7b68") },
      uAmbient: { value: new THREE.Color() },
      uSunLight: { value: new THREE.Color() },
      uFlashColor: { value: new THREE.Color() },
      uWind: { value: new THREE.Vector2(0.3, 0.1) },
      uCloudLit: { value: new THREE.Color() },
      uCloudShade: { value: new THREE.Color() },
      uSSS: { value: new THREE.Color() },
      uPostA: { value: 0 },
    });
    if (A.shore)
      U.uShoreRect.value.set(
        A.shore.minX,
        A.shore.minZ,
        1 / A.shore.sizeX,
        1 / A.shore.sizeZ,
      );
    mat = new THREE.ShaderMaterial({
      uniforms: U,
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      defines: { NRC_WRITE_ALPHA: 1 },
    }); // writes the reflectivity tag
    mat.name = "atmos_water";
    mat.userData.shared = true;
    const y =
      G.world && G.world.waterLevel !== undefined ? G.world.waterLevel : -1.2;
    const L = G.LAYOUT;
    const xMax = L ? L.INTERIOR_X_MIN - 150 : 2350;
    const x0 = -3400,
      x1 = xMax,
      z0 = -3400,
      z1 = 3400;
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, 48, 48);
    geo.rotateX(-Math.PI / 2);
    geo.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
    water = new THREE.Mesh(geo, mat);
    water.name = "atmos_water";
    water.frustumCulled = false;
    water.receiveShadow = false;
    water.castShadow = false;
    water.renderOrder = 10; // after other opaques → early-z skips water hidden under the land plates
    G.scene.add(water);
    A.water = water;
    A.waterMat = mat;
    ATMOS.waterMaterial = mat;
    ATMOS.waterMesh = water;
  }

  /**
   * Create an extra water surface (pond/lake/reservoir/flooded area) sharing the water look.
   * spec: {x0,x1,z0,z1,y} rectangle, or {geometry, y?}. opts: {murk:0..1, glow:0..1}
   * Returns the Mesh (caller adds it to its own group or it is added to G.scene when opts.add !== false).
   */
  ATMOS.createWaterMesh = function (spec, opts) {
    opts = opts || {};
    if (!mat) return null;
    let m2 = extraMats[0];
    if (!m2) {
      m2 = new THREE.ShaderMaterial({
        uniforms: mat.uniforms,
        vertexShader: VERT,
        fragmentShader: FRAG,
        fog: true,
        defines: { NO_SHORE: 1, NRC_WRITE_ALPHA: 1 },
      });
      m2.name = "atmos_water_pond";
      m2.userData.shared = true;
      extraMats.push(m2);
    }
    let geo;
    if (spec && spec.geometry) geo = spec.geometry;
    else {
      const x0 = spec.x0,
        x1 = spec.x1,
        z0 = spec.z0,
        z1 = spec.z1;
      geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, 4, 4);
      geo.rotateX(-Math.PI / 2);
      geo.translate(
        (x0 + x1) / 2,
        spec.y !== undefined ? spec.y : -0.6,
        (z0 + z1) / 2,
      );
    }
    const mesh = new THREE.Mesh(geo, m2);
    mesh.name = "atmos_pond";
    if (opts.add !== false) G.scene.add(mesh);
    return mesh;
  };

  const _wl = new THREE.Color(),
    _ws = new THREE.Color();
  function cloudAvg() {
    const D = A.cloudDeck;
    return D ? 1 - D.shadow * 0.3 : 1;
  }
  function update(dt, realDt, animDt) {
    if (!water) return;
    const env = A.env,
      u = mat.uniforms,
      W = A.weather ? A.weather.cur : null;
    water.visible = !env.interior;
    if (env.interior) return;
    u.uPostA.value = A.post && A.post.enabled && A.post.waterRefl ? 1 : 0;
    u.uTime.value = A.animTime;
    u.uNight.value = env.night;
    u.uSunDir.value.copy(env.night > 0.5 ? env.moonDir : env.sunDir);
    const sunVis =
      env.night > 0.5
        ? 0.35 * A.smooth(0.02, 0.2, env.moonDir.y)
        : env.sunSize * A.smooth(-0.02, 0.1, env.sunY);
    u.uSunColor.value
      .copy(env.lightColor)
      .multiplyScalar(
        Math.min(1.6, env.lightInt) *
          sunVis *
          (W ? 0.2 + 0.8 * (1 - W.cloud * W.cloudDark) : 1),
      );
    u.uZenith.value.copy(env.zenith);
    u.uHorizon.value.copy(env.horizon);
    u.uFogTop.value.copy(env.fogColor);
    u.uAmbient.value.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.55);
    u.uSunLight.value.copy(env.lightColor).multiplyScalar(env.lightInt * 0.3);
    u.uCloudLit.value.copy(env.cloudLit);
    u.uCloudShade.value.copy(env.cloudShade);
    u.uSSS.value
      .setRGB(0.42, 0.52, 0.2)
      .multiply(env.lightColor)
      .multiplyScalar(Math.min(1.5, env.lightInt) * 0.22 * (1 - env.night));
    // colour the water converges to near the far clip (grazing Fresnel ≈ 0.71, far roughness mix 0.35,
    // murk averages out) — the sky dome continues the sea with it below the horizon (12_sky.js)
    const wf = A.waterFar || (A.waterFar = new THREE.Color());
    const _l = _wl
      .copy(u.uSunLight.value)
      .multiplyScalar(Math.max(0, u.uSunDir.value.y) * 0.35 * cloudAvg());
    _l.r += u.uAmbient.value.r * 0.9;
    _l.g += u.uAmbient.value.g * 0.9;
    _l.b += u.uAmbient.value.b * 0.9;
    _l.multiply(u.uDeep.value);
    const _s = _ws
      .copy(env.horizon)
      .lerp(env.zenith, 0.15)
      .lerp(env.fogColor, 0.35);
    wf.copy(_l).lerp(_s, 0.71).lerp(_l.multiplyScalar(0.9), 0.35);
    if (W) {
      u.uRain.value = W.rain;
      u.uFlash.value = env.flash;
      u.uFlashColor.value.copy(W.flashColor);
      u.uChop.value = 0.7 + Math.min(1.5, W.wind / 8);
      u.uWind.value.set(W.windX * 0.05, W.windZ * 0.05);
    }
  }

  A.addSystem({ name: "water", order: 40, init, update });
})();
