// play-inline-49 02 — math
// Lines 21-332 of readable/play-inline-49.pretty.js (statement-aligned).
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

