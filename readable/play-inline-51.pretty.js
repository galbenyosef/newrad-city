/* src/atmosphere/40_postfx.js */
/* =====================================================================
 * ATMOSPHERE — post-processing (G.renderHook)
 * World + viewmodel render into an HDR (half-float, MSAA when available)
 * target, then:
 *   bright-pass → 4-level dual-filter bloom (neon, sun, explosions, glows)
 *   composite: subtle chromatic aberration, bloom add, ACES tone mapping
 *   (same curve as three's), sRGB encode, colour grading presets
 *   ('olive' green-olive, 'amber' warm sepia, 'teal' cleaner teal/orange, 'none'),
 *   vignette, animated film grain, low-health desaturation + pulsing red
 *   edges, damage flash, radiation shimmer,
 *   nuke/lightning white-outs, menu dim, death fade to grey.
 * Robust: capability checks + shader validation up front; on any failure
 * (or if core drops the hook after an exception) the game renders plainly.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos;
  const { clamp } = A;

  // ------------------------------------------------------------------
  // Grading presets (applied in display space after tone mapping)
  // ------------------------------------------------------------------
  // lift = the black floor, applied AFTER contrast (before, the contrast pass crushed it back to 0);
  // nightLift is added in proportion to night (blue-green moonlit shadows instead of pure black)
  const GRADES = {
    olive: {
      sat: 0.74,
      contrast: 1.1,
      lift: [0.03, 0.04, 0.02],
      nightLift: [0.004, 0.012, 0.024],
      gamma: [1.0, 1.04, 0.94],
      gain: [1.0, 1.02, 0.86],
      shadowTint: [0.0, 0.018, 0.004],
      highTint: [0.02, 0.025, -0.02],
      bloom: 0.7,
    },
    amber: {
      sat: 0.8,
      contrast: 1.07,
      lift: [0.036, 0.026, 0.012],
      nightLift: [0.006, 0.012, 0.018],
      gamma: [1.04, 1.0, 0.9],
      gain: [1.07, 0.99, 0.8],
      shadowTint: [0.012, 0.004, -0.004],
      highTint: [0.035, 0.012, -0.03],
      bloom: 0.65,
    },
    teal: {
      sat: 1.0,
      contrast: 1.06,
      lift: [0.016, 0.022, 0.032],
      nightLift: [0.002, 0.012, 0.022],
      gamma: [1.0, 1.0, 1.02],
      gain: [1.04, 1.0, 0.95],
      shadowTint: [-0.004, 0.006, 0.018],
      highTint: [0.02, 0.008, -0.012],
      bloom: 0.8,
    },
    none: {
      sat: 1.0,
      contrast: 1.0,
      lift: [0, 0, 0],
      nightLift: [0, 0, 0],
      gamma: [1, 1, 1],
      gain: [1, 1, 1],
      shadowTint: [0, 0, 0],
      highTint: [0, 0, 0],
      bloom: 0.6,
    },
  };

  // ------------------------------------------------------------------
  // Shaders
  // ------------------------------------------------------------------
  // HDR sanitiser (user report 2026-09-27, coloured dots in muzzle flashes / glows). The scene target is
  // half float: stacked additive sprites (flash cores, glows, sparks) can overflow a channel to +Inf
  // (> 65504) and Inf − Inf / 0 · Inf in blending, MSAA resolve or bilinear upscale give NaN. One bad
  // CHANNEL used to come out of ACES as 0 or 1 while the others didn't → a pure red / green / cyan dot.
  // Now any pixel with a non-finite channel becomes NEUTRAL: white-hot if a channel overflowed, else
  // the brightest finite channel as grey — never a coloured speck. Finite values are clamped to [0, 6e4].
  const SAN_GLSL = `
    vec3 nrcSan(vec3 c){
      #if __VERSION__ >= 300
        bvec3 nn = isnan(c), ii = isinf(c);
        if (any(nn) || any(ii)) {
          float m = 0.0;
          if (!nn.r && !ii.r) m = max(m, c.r);
          if (!nn.g && !ii.g) m = max(m, c.g);
          if (!nn.b && !ii.b) m = max(m, c.b);
          if ((ii.r && c.r > 0.0) || (ii.g && c.g > 0.0) || (ii.b && c.b > 0.0)) m = 60000.0;
          c = vec3(m);
        }
      #endif
      return clamp(c, 0.0, 60000.0);
    }
  `;
  const BRIGHT = `
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uThreshold, uKnee, uHot, uKaris;
    varying vec2 vUv;
    ${SAN_GLSL}
    vec3 samp(vec2 uv){ return min(nrcSan(texture2D(tSrc, uv).rgb), vec3(24.0)); }
    // Karis average: each tap weighted by 1/(1+luma) → a single sub-pixel-hot texel (a distant neon
    // tube, a specular glint on a wet car) can't pop the whole bloom on and off as it crawls between pixels
    float kw(vec3 c){ return mix(1.0, 1.0 / (1.0 + dot(c, vec3(0.2126, 0.7152, 0.0722))), uKaris); }
    void main(){
      vec3 a = samp(vUv + uTexel * vec2(-0.5, -0.5)), b = samp(vUv + uTexel * vec2(0.5, -0.5));
      vec3 d = samp(vUv + uTexel * vec2(-0.5, 0.5)), e = samp(vUv + uTexel * vec2(0.5, 0.5));
      float wa = kw(a), wb = kw(b), wd = kw(d), we = kw(e);
      vec3 c = (a * wa + b * wb + d * wd + e * we) / (wa + wb + wd + we);
      float br = max(c.r, max(c.g, c.b));
      float soft = clamp(br - uThreshold + uKnee, 0.0, 2.0 * uKnee);
      soft = soft * soft / (4.0 * uKnee + 1e-4);
      float contrib = max(soft, br - uThreshold) / max(br, 1e-4);
      // compress very hot sources (lamp heads, neon tubes) so a tiny bright spot can't flood a big halo;
      // large bright areas (explosions, the sun) still bloom by their size
      c *= contrib;
      float bm = max(c.r, max(c.g, c.b));
      c *= 1.0 / (1.0 + max(bm - uHot, 0.0) * 0.22);
      gl_FragColor = vec4(c, 1.0);
    }
  `;
  // 13-tap downsample (Jimenez, "Next Generation Post Processing in Call of Duty: AW"): 4 overlapping
  // 2×2 boxes + a centre box. Rounder, alias-free glows than the 5-tap dual-filter down — the neon of
  // Times Square keeps round halos while it slides across the screen instead of shimmering squares.
  const DOWN = `
    uniform sampler2D tSrc; uniform vec2 uTexel;
    varying vec2 vUv;
    vec3 s(vec2 o){ return texture2D(tSrc, vUv + uTexel * o).rgb; }
    void main(){
      vec3 A = s(vec2(-2.0, 2.0)), B = s(vec2(0.0, 2.0)), C = s(vec2(2.0, 2.0));
      vec3 D = s(vec2(-1.0, 1.0)), E = s(vec2(1.0, 1.0));
      vec3 F = s(vec2(-2.0, 0.0)), Gc = s(vec2(0.0)), H = s(vec2(2.0, 0.0));
      vec3 I = s(vec2(-1.0, -1.0)), J = s(vec2(1.0, -1.0));
      vec3 K = s(vec2(-2.0, -2.0)), L = s(vec2(0.0, -2.0)), M = s(vec2(2.0, -2.0));
      vec3 o = (D + E + I + J) * 0.125;
      o += (A + B + F + Gc) * 0.03125 + (B + C + Gc + H) * 0.03125 + (F + Gc + K + L) * 0.03125 + (Gc + H + L + M) * 0.03125;
      gl_FragColor = vec4(o, 1.0);
    }
  `;
  const UP = `
    uniform sampler2D tSrc; uniform vec2 uTexel; uniform float uWeight;
    varying vec2 vUv;
    void main(){
      vec2 o = uTexel;
      vec3 s = texture2D(tSrc, vUv + vec2(-o.x * 2.0, 0.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(-o.x, o.y)).rgb * 2.0;
      s += texture2D(tSrc, vUv + vec2(0.0, o.y * 2.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(o.x, o.y)).rgb * 2.0;
      s += texture2D(tSrc, vUv + vec2(o.x * 2.0, 0.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(o.x, -o.y)).rgb * 2.0;
      s += texture2D(tSrc, vUv + vec2(0.0, -o.y * 2.0)).rgb;
      s += texture2D(tSrc, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
      gl_FragColor = vec4(s / 12.0 * uWeight, 1.0);
    }
  `;
  // Light shafts ("god rays", the volumetric sun through the ruins): screen-space radial
  // blur toward the sun/moon of an occlusion mask. The mask is OPEN SKY only (the sky dome writes
  // alpha 0 into the HDR target, everything opaque writes 1), weighted by how bright that sky is
  // and how close it is to the light, so buildings, ruins and cloud banks cut dark wedges into it.
  const RAYS = `
    uniform sampler2D tSrc; uniform vec2 uSun; uniform float uAspect, uThresh, uFall, uTime;
    varying vec2 vUv;
    ${SAN_GLSL}
    float h12(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float msk(vec2 uv){
      vec4 s = texture2D(tSrc, uv);
      float sky = 1.0 - smoothstep(0.0, 0.25, s.a);   // sky = 0; water/puddle tags and geometry occlude
      float l = dot(min(nrcSan(s.rgb), vec3(8.0)), vec3(0.2126, 0.7152, 0.0722));
      vec2 d = uv - uSun; d.x *= uAspect;
      return sky * max(l - uThresh, 0.0) * exp(-length(d) * uFall);
    }
    void main(){
      const int N = 40;
      vec2 delta = (vUv - uSun) * (0.92 / float(N));
      vec2 uv = vUv - delta * h12(gl_FragCoord.xy + fract(uTime * 13.7) * 97.0);
      float acc = 0.0, w = 1.0, wsum = 0.0;
      for (int i = 0; i < N; i++) {
        uv -= delta;
        acc += msk(clamp(uv, 0.001, 0.999)) * w;
        wsum += w; w *= 0.965;
      }
      gl_FragColor = vec4(vec3(acc / wsum), 1.0);
    }
  `;
  // ------------------------------------------------------------------
  // SSAO (half resolution, from the opaque depth copy). Normal from the flatter depth neighbours,
  // N golden-angle samples in a world-sized disc (≈ uRadius m) around the pixel, cosine-weighted
  // occlusion with a distance falloff (a far background never occludes a silhouette). Output:
  // r = ambient occlusion, g = linear view depth (for the bilateral blur and the depth-checked
  // upsample in the composite). Fades out with fog and distance.
  // ------------------------------------------------------------------
  const AO = `
    uniform sampler2D tDepth; uniform mat4 uProj, uInvProj; uniform vec2 uCamNF, uDTexel;
    uniform float uRadius, uN, uFar, uInt, uFogD, uMaxUV;
    varying vec2 vUv;
    vec3 viewAt(vec2 uv, float d){ vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
    vec3 posAt(vec2 uv){ return viewAt(uv, texture2D(tDepth, uv).r); }
    void main(){
      float d = texture2D(tDepth, vUv).r;
      if (d >= 0.99999) { gl_FragColor = vec4(1.0, 60000.0, 0.0, 1.0); return; }
      vec3 P = viewAt(vUv, d);
      float z = -P.z;
      float rad = uRadius * (1.0 + z * 0.012);          // a little wider far away: street-canyon corners, not just cracks
      vec2 rUV = rad * 0.5 / z * vec2(uProj[0][0], uProj[1][1]);
      float fade = exp(-(uFogD * z) * (uFogD * z) * 1.4) * (1.0 - smoothstep(uFar * 0.55, uFar, z)) * smoothstep(1.2, 2.5, rUV.y / uDTexel.y);
      if (fade < 0.01) { gl_FragColor = vec4(1.0, z, 0.0, 1.0); return; }
      rUV *= min(1.0, uMaxUV / rUV.y);
      vec3 pr = posAt(vUv + vec2(uDTexel.x, 0.0)), pl = posAt(vUv - vec2(uDTexel.x, 0.0));
      vec3 pu = posAt(vUv + vec2(0.0, uDTexel.y)), pd = posAt(vUv - vec2(0.0, uDTexel.y));
      vec3 dx = abs(pr.z - P.z) < abs(P.z - pl.z) ? pr - P : P - pl;
      vec3 dy = abs(pu.z - P.z) < abs(P.z - pd.z) ? pu - P : P - pd;
      vec3 N = normalize(cross(dx, dy));
      float ang = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715)))) * 6.2831853;
      float R2 = rad * rad * 1.3;
      float occ = 0.0;
      for (int i = 0; i < 16; i++) {
        if (float(i) >= uN) break;
        float t = (float(i) + 0.5) / uN;
        float a = ang + float(i) * 2.39996323;
        vec2 suv = vUv + vec2(cos(a), sin(a)) * rUV * (0.12 + 0.88 * t);
        vec3 v = posAt(suv) - P;
        float vv = dot(v, v);
        float c = dot(v, N) * inversesqrt(vv + 1e-4);
        occ += max(0.0, c - 0.12) * max(0.0, 1.0 - vv / R2);
      }
      float ao = clamp(1.0 - uInt * occ / uN, 0.0, 1.0);
      gl_FragColor = vec4(mix(1.0, ao, fade), z, 0.0, 1.0);
    }
  `;
  // depth-aware separable blur of the AO (keeps silhouettes crisp; interleaved noise → smooth)
  const AOBLUR = `
    uniform sampler2D tSrc; uniform vec2 uTexel, uDir;
    varying vec2 vUv;
    void main(){
      vec4 c = texture2D(tSrc, vUv);
      float z0 = c.g, s = c.r, w = 1.0;
      float tol = 0.035 * z0 + 0.08;
      for (int i = -3; i <= 3; i++) {
        if (i == 0) continue;
        vec2 t = texture2D(tSrc, vUv + uDir * uTexel * float(i)).rg;
        float wt = exp(-float(i * i) * 0.18) * max(0.0, 1.0 - abs(t.y - z0) / tol);
        s += t.x * wt; w += wt;
      }
      gl_FragColor = vec4(s / w, z0, 0.0, 1.0);
    }
  `;
  const COMPOSITE = `
    uniform sampler2D tScene, tBloom;
    uniform vec2 uRes;
    uniform float uTime, uExposure, uBloom, uCA, uVignette, uGrain;
    uniform float uSat, uContrast;
    uniform vec3 uLift, uNightLift, uGamma, uGain, uShadowTint, uHighTint;
    uniform vec2 uSrcTexel; uniform float uSharpen;
    uniform float uHurt, uDamage, uRad, uMenuDim, uDead, uFlashAmt, uNight, uBeat;
    uniform vec3 uFlashCol;
    uniform vec2 uSunUV; uniform float uSunOn, uAspect; uniform vec3 uSunTint;
    uniform sampler2D tRays; uniform vec3 uRayCol;
    uniform sampler2D uNoise; uniform float uWaterOn, uWaterStep, uHorizonY, uWaterN; uniform vec3 uWaterTint;
    uniform sampler2D tDepth; uniform float uPudOn, uPudN; uniform mat4 uProj, uInvProj; uniform vec3 uUpView, uSkyRefl; uniform vec2 uCamNF;
    uniform float uStorm; uniform vec3 uStormTint;
    uniform sampler2D tAO, tVM; uniform float uAOOn, uAOStr, uVMOn;
    uniform float uOutLuma;
    #ifdef USE_LUT
      uniform sampler2D tLutA, tLutB; uniform float uLutMix;
      __LUT_GLSL__
    #endif
    #ifdef USE_DOF
      uniform sampler2D tDof, tFocus; uniform vec4 uDof; uniform float uDofOn;
      __COC_GLSL__
    #endif
    varying vec2 vUv;
    ${SAN_GLSL}
    #ifdef USE_EYE
      __EYE_GLSL__
    #endif
    #ifdef USE_VOL
      uniform float uVolOn;
      __VOL_GLSL__
    #endif
    #ifdef USE_DIST
      __DISTU_GLSL__
    #endif
    __GRAIN_GLSL__
    float linZ(float d){ float z = d * 2.0 - 1.0; return 2.0 * uCamNF.x * uCamNF.y / (uCamNF.y + uCamNF.x - z * (uCamNF.y - uCamNF.x)); }
    vec3 viewAt(vec2 uv, float d){ vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
    vec2 toScreen(vec3 q){ vec4 c = uProj * vec4(q, 1.0); return c.xy / c.w * 0.5 + 0.5; }
    #ifdef USE_DIST
      __DIST_GLSL__
    #endif

    vec3 RRTAndODTFit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
    vec3 acesFilmic(vec3 color){
      const mat3 ACESInputMat = mat3(vec3(0.59719, 0.07600, 0.02840), vec3(0.35458, 0.90834, 0.13383), vec3(0.04823, 0.01566, 0.83777));
      const mat3 ACESOutputMat = mat3(vec3(1.60475, -0.10208, -0.00327), vec3(-0.53108, 1.10813, -0.07276), vec3(-0.07367, -0.00605, 1.07602));
      color *= uExposure / 0.6;
      color = ACESInputMat * color; color = RRTAndODTFit(color); color = ACESOutputMat * color;
      return clamp(color, 0.0, 1.0);
    }
    vec3 toSRGB(vec3 c){ c = max(c, 0.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
    float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

    void main(){
      vec2 uv = vUv;
      vec2 r = uv - 0.5;
      float r2 = dot(r, r);
      // --- heat haze above fires + explosion blast-wave refraction (49_post_distort.js): offsets the scene read only
      vec2 suv = uv;
      #ifdef USE_DIST
        if (uHeatN + uShockN > 0.5) suv = clamp(uv + nrcDistort(uv), 0.001, 0.999);
      #endif
      // --- chromatic aberration (radial, stronger at edges)
      // no baseline fringing: only damage, radiation and rad-weather surges split the channels
      float ca = (uCA + 0.012 * (uDamage * 3.0 + uRad * 2.0 + uStorm * (0.6 + 0.9 * max(0.0, sin(uTime * 2.3) * sin(uTime * 0.77))))) * r2;
      vec3 hdr;
      if (ca > 0.00001) {
        vec2 off = r * ca;
        hdr.r = texture2D(tScene, suv - off).r;
        hdr.g = texture2D(tScene, suv).g;
        hdr.b = texture2D(tScene, suv + off).b;
      } else hdr = texture2D(tScene, suv).rgb;
      hdr = nrcSan(hdr);
      // dynamic resolution: the scene target may be smaller than the screen → light unsharp mask on upscale
      if (uSharpen > 0.001) {
        vec3 nb = texture2D(tScene, suv + vec2(uSrcTexel.x, 0.0)).rgb + texture2D(tScene, suv - vec2(uSrcTexel.x, 0.0)).rgb
                + texture2D(tScene, suv + vec2(0.0, uSrcTexel.y)).rgb + texture2D(tScene, suv - vec2(0.0, uSrcTexel.y)).rgb;
        nb = nrcSan(nb);
        // LUMA-ONLY, bounded unsharp mask: sharpening each channel separately overshot on small bright sprites
        // (muzzle flashes, lamp/neon glows) and produced red/green/blue speckles (user report 2026-09-27).
        // Scale the pixel by a brightness ratio instead (hue can't shift), cap the gain to ±35 %, and fade the
        // effect out on anything bright (> ~0.8) where ringing is most visible.
        float lC = luma(hdr), lN = luma(nb) * 0.25;
        float dL = clamp((lC - lN) * uSharpen, -0.35 * lC, 0.35 * lC);
        float fadeHi = 1.0 - smoothstep(0.8, 1.6, max(lC, lN));
        hdr *= lC > 1e-4 ? (lC + dL * fadeHi) / lC : 1.0;
      }
      // --- ambient occlusion (half-res SSAO, depth-checked upsample; never on the sky, water or the viewmodel;
      //     bright emitters — windows, neon, fire — are not darkened)
      if (uAOOn > 0.5) {
        float sa = texture2D(tScene, uv).a;
        if (sa > 0.86) {
          vec2 ao2 = texture2D(tAO, uv).rg;
          float zf = linZ(texture2D(tDepth, uv).r);
          float ok = 1.0 - smoothstep(0.03, 0.1, abs(ao2.y - zf) / max(zf, 0.1));
          if (uVMOn > 0.5 && texture2D(tVM, uv).r < 0.99999) ok = 0.0;
          float aoK = mix(1.0, ao2.x, ok * uAOStr);
          hdr *= mix(aoK, 1.0, smoothstep(1.2, 4.0, luma(hdr)));
          #ifdef AO_DEBUG
            hdr = vec3(aoK * 0.6);
          #endif
        }
      }
      // --- water reflections (screen space). The water shader tags its pixels through alpha
      // (0.3..0.65 = reflectivity). March up the screen to the waterline (first non-water pixel),
      // mirror about it and fetch what stands on the shore: skyline, piers, wrecks, lit windows at
      // night — wobbled by the waves and smeared vertically into long shimmering streaks.
      if (uWaterOn > 0.5 && uv.y < uHorizonY) {   // (smoke drawn over open sky can't pass for water: water lies below the horizon)
        float wa = texture2D(tScene, uv).a;
        if (wa > 0.27 && wa < 0.86) {  // (rain/smoke drawn over the water raise alpha a little)
          float refl = clamp((wa - 0.3) / 0.35, 0.0, 1.0);
          float yb = -1.0, lastW = uv.y;
          for (int i = 1; i <= 30; i++) {
            if (float(i) > uWaterN) break;
            float y = uv.y + float(i) * uWaterStep;
            if (y > 0.998) break;
            float aa = texture2D(tScene, vec2(uv.x, y)).a;
            if (aa > 0.86 || aa < 0.2) { yb = y; break; }
            lastW = y;
          }
          if (yb > 0.0) {
            // refine the waterline between the last water sample and the first shore sample
            float lo = lastW, hi = yb;
            for (int j = 0; j < 4; j++) {
              float m = 0.5 * (lo + hi); float aa = texture2D(tScene, vec2(uv.x, m)).a;
              if (aa > 0.86 || aa < 0.2) hi = m; else lo = m;
            }
            yb = hi;
            float ry = 2.0 * yb - uv.y;
            if (ry < 0.998) {
              vec2 nz = vec2(texture2D(uNoise, vec2(uv.x * 2.3, uv.y * 31.0) + vec2(uTime * 0.013, uTime * 0.021)).r,
                             texture2D(uNoise, vec2(uv.x * 5.1 + 0.37, uv.y * 57.0) - vec2(uTime * 0.017, uTime * 0.011)).r) - 0.5;
              float depthK = clamp((ry - yb) * 6.0, 0.2, 1.0);                 // far from the waterline = more wave distortion
              vec2 ruv = vec2(uv.x + (nz.x * 0.011 + nz.y * 0.005) * depthK, ry + nz.y * 0.004 * depthK);
              vec3 rc = vec3(0.0), rmax = vec3(0.0); float rw = 0.0;
              for (int k = 0; k < 7; k++) {
                // taps spread both ways along the reflection: lights smear into long vertical streaks
                vec2 q = ruv + vec2(0.0, (float(k) - 2.0) * 0.0075 * (0.5 + depthK));
                vec4 sm = texture2D(tScene, clamp(q, 0.001, 0.999));
                float solid = step(0.86, sm.a) * step(q.y, 0.998);            // only real geometry (sky is already in the water)
                vec3 c = min(nrcSan(sm.rgb), vec3(12.0)) * solid;
                rc += c; rmax = max(rmax, c); rw += solid;
              }
              if (rw > 0.0) {
                // lights (windows, lamps, fires) stretch into long saturated streaks: blend toward the brightest tap
                float hot = smoothstep(0.3, 1.6, max(rmax.r, max(rmax.g, rmax.b)));
                vec3 lum = vec3(dot(rmax, vec3(0.2126, 0.7152, 0.0722)));
                rc = max(mix(rc / rw, mix(lum, rmax, 1.35), 0.65 * hot), 0.0);   // (the saturation push can't go negative → no coloured specks)
                // reflections of things near the top of the frame fade out (back to the sky reflection),
                // they never pop off at the screen edge
                float cover = rw / 7.0 * smoothstep(0.0, 0.01, ry - yb) * smoothstep(0.998, 0.9, ry) * smoothstep(0.0, 0.04, uv.x) * smoothstep(1.0, 0.96, uv.x);
                // near the water horizon the reflection softens away (distance: less mirror, more chop)
                float farK = smoothstep(0.004, 0.1, uHorizonY - uv.y);
                hdr = mix(hdr, rc * uWaterTint, refl * cover * 0.85 * mix(0.35, 1.0, farK));
              }
            }
          }
        }
      }
      // --- wet-street puddles (tagged 0.87..0.97 by the wet-surface patch): depth-buffer screen-space
      // mirror reflections — façades, lamps, neon and the sky in the rain puddles.
      if (uPudOn > 0.5) {
        float pa = texture2D(tScene, uv).a;
        if (pa > 0.866 && pa < 0.975) {
          float pk = clamp((pa - 0.87) / 0.1, 0.0, 1.0);
          float d0 = texture2D(tDepth, uv).r;
          if (d0 < 0.99999) {
            vec3 P = viewAt(uv, d0);
            vec3 V = normalize(P);
            vec2 rip = texture2D(uNoise, uv * vec2(3.0, 9.0) + vec2(uTime * 0.021, -uTime * 0.034)).rg - 0.5;
            vec3 N = normalize(uUpView + vec3(rip.x, 0.0, rip.y) * 0.014);
            vec3 R = reflect(V, N);
            float fres = 0.05 + 0.95 * pow(1.0 - clamp(dot(-V, N), 0.0, 1.0), 5.0);
            vec3 Q = P + N * 0.03;
            float stepL = clamp(-P.z * 0.035, 0.12, 3.0);
            vec2 hit = vec2(-1.0);
            for (int i = 0; i < 24; i++) {
              if (float(i) >= uPudN) break;
              vec3 Qn = Q + R * stepL;
              vec2 sc = toScreen(Qn);
              if (sc.x < 0.0 || sc.x > 1.0 || sc.y < 0.0 || sc.y > 1.0 || Qn.z > -uCamNF.x) break;
              float sd = texture2D(tDepth, sc).r;
              float qz = -Qn.z, sz = linZ(sd);
              if (sd < 0.99999 && qz > sz + 0.03) {
                if (qz - sz < stepL * 2.5 + 0.4) {
                  vec3 lo = Q, hi = Qn;
                  for (int j = 0; j < 4; j++) {
                    vec3 m = 0.5 * (lo + hi);
                    if (-m.z > linZ(texture2D(tDepth, toScreen(m)).r)) hi = m; else lo = m;
                  }
                  hit = toScreen(hi);
                }
                break;
              }
              Q = Qn; stepL *= 1.28;
            }
            vec3 rc = uSkyRefl;
            if (hit.x >= 0.0) {
              // rippled water film: the reflection smears vertically into broken streaks (4 taps along
              // screen-y, jittered by the ripple noise), each tap capped at 2.5 HDR so neon and lamps
              // give coloured streaks instead of flooding the puddle
              vec2 rn = texture2D(uNoise, uv * vec2(41.0, 7.0) + vec2(0.0, uTime * 0.09)).rg - 0.5;
              float sy = 0.004 + 0.012 * abs(rn.y) + 0.02 * pk * (1.0 - fres);
              vec3 hc = vec3(0.0);
              for (int k = 0; k < 4; k++) {
                vec2 q = hit + vec2(rn.x * 0.006, (float(k) - 1.0) * sy);
                hc += min(nrcSan(texture2D(tScene, clamp(q, 0.001, 0.999)).rgb), vec3(2.5));
              }
              hc *= 0.25;
              float ef = smoothstep(0.0, 0.06, hit.x) * smoothstep(1.0, 0.94, hit.x) * smoothstep(1.0, 0.9, hit.y) * smoothstep(0.0, 0.05, hit.y);
              rc = mix(uSkyRefl, hc, ef);
            }
            // broken by ripples: some of the puddle surface scatters (rain rings) instead of mirroring
            float brk = smoothstep(0.35, 0.65, texture2D(uNoise, uv * vec2(9.0, 26.0) - vec2(uTime * 0.05, uTime * 0.13)).b);
            hdr = mix(hdr, rc * vec3(0.78, 0.82, 0.84), pk * min(fres, 0.75) * mix(0.55, 0.85, brk));
          }
        }
      }
      // --- depth of field (dialogue close-ups): per-pixel CoC from the full-res depth →
      //     sharp silhouettes; the half-res gathered bokeh fills in where the CoC is large
      #ifdef USE_DOF
      if (uDofOn > 0.5) {
        float dd = texture2D(tDepth, uv).r;
        float kz = dofCoc(dd >= 0.99999 ? 1e5 : linZ(dd), texture2D(tFocus, vec2(0.5)).r, uDof);
        if (uVMOn > 0.5 && texture2D(tVM, uv).r < 0.99999) kz = 0.0;
        vec4 db = texture2D(tDof, uv);
        // blend by the smaller of the two CoCs at edges (no halo of blurred background over the subject)
        float kb = min(kz, db.a + 0.15);
        hdr = mix(hdr, db.rgb, smoothstep(0.03, 0.22, kb) * uDofOn);
      }
      #endif
      // --- bloom
      hdr += texture2D(tBloom, uv).rgb * uBloom;
      // --- volumetric light shafts (45_post_vol.js): sun/moon light scattered by the lit air between the eye
      //     and the surface — shadow-map-tested, so towers, girders and ruins cut real shafts into it
      #ifdef USE_VOL
      if (uVolOn > 0.5) {
        float vd = texture2D(tDepth, uv).r;
        bool vsky = vd >= 0.99999;
        float vv = volAt(uv, vsky ? 10000.0 : linZ(vd)) * (vsky ? uVolSky : 1.0);
        if (uVMOn > 0.5 && texture2D(tVM, uv).r < 0.99999) vv = 0.0;
        #ifdef VOL_DEBUG
          hdr = uVolCol * vv * 3.0;
        #else
          hdr = max(hdr + uVolCol * vv, hdr * 0.7);   // signed: air in the towers' shadow takes back ≤ 30 %
        #endif
      }
      #endif
      // --- light shafts (scattered sun/moon light in the haze; soft-light so they never wash out highlights)
      if (uRayCol.r + uRayCol.g + uRayCol.b > 0.0001) {
        vec3 ray = texture2D(tRays, uv).rgb * uRayCol;
        hdr += ray / (1.0 + max(hdr.r, max(hdr.g, hdr.b)) * 0.35);
        #ifdef RAYS_DEBUG
          hdr = hdr * 0.25 + ray * 4.0;
        #endif
      }
      // --- sun glare: anamorphic streak, halo ring & ghosts, gated by how bright the (blurred) sun spot is
      if (uSunOn > 0.001) {
        vec3 sb = texture2D(tBloom, uSunUV).rgb;
        float vis = clamp(dot(sb, vec3(0.33)) - 0.25, 0.0, 1.5) * uSunOn;
        if (vis > 0.001) {
          vec2 d = uv - uSunUV; d.x *= uAspect;
          float streak = exp(-abs(d.y) * 160.0) * exp(-abs(d.x) * 2.5);
          float halo = smoothstep(0.035, 0.0, abs(length(d) - 0.22)) * 0.12;
          float gh = 0.0;
          for (int i = 1; i <= 3; i++) {
            vec2 gp = uSunUV + (vec2(0.5) - uSunUV) * (0.6 * float(i));
            vec2 gd = uv - gp; gd.x *= uAspect;
            gh += smoothstep(0.03 + 0.02 * float(i), 0.0, length(gd)) * (0.08 / float(i));
          }
          hdr += uSunTint * vis * (streak * 0.5 + halo + gh);
        }
      }
      // --- eye adaptation (48_post_eye.js): where the player looks sets the exposure within a clamped range
      #ifdef USE_EYE
        hdr *= eyeFactor();
      #endif
      // --- tone map + encode
      vec3 c = toSRGB(acesFilmic(hdr));

      #ifdef USE_LUT
      // --- grading: baked 32³ LUTs (42_post_grade.js), cross-faded while a preset / context look changes;
      //     the moonlit night floor stays dynamic
      vec3 ga = lutSample(tLutA, c);
      c = uLutMix > 0.001 ? mix(ga, lutSample(tLutB, c), uLutMix) : ga;
      vec3 nl = uNightLift * uNight;
      c = nl + c * (1.0 - nl);
      #else
      // --- grading: gain/gamma, split toning, saturation, contrast, THEN the lifted black floor
      c = uGain * c;
      c = pow(max(c, 0.0), 1.0 / uGamma);
      float l = luma(c);
      c += uShadowTint * (1.0 - l) * (1.0 - l) + uHighTint * l * l;
      c = mix(vec3(l), c, uSat);
      // contrast pivots around mid-grey but rolls the toe off softly instead of clipping it to black
      vec3 cc = (c - 0.5) * uContrast + 0.5;
      vec3 toe = c * (1.0 - (uContrast - 1.0) * 2.0 * (0.02 / (c + 0.02)));
      c = mix(toe, cc, smoothstep(0.02, 0.22, c));
      c = max(c, 0.0);
      vec3 lift = uLift + uNightLift * uNight;
      c = lift + c * (1.0 - lift);
      #endif
      // night: moonlight is blue-grey under the green grade (keeps sky, water and stone apart)
      c = mix(c, c * vec3(0.9, 0.98, 1.2), uNight * 0.65);
      // rad weather (preset rad > 0; none currently): the whole frame goes sick green (toxic grade, lifted green shadows)
      if (uStorm > 0.001) {
        float Ls = luma(c);
        c = mix(c, mix(c, vec3(Ls), 0.6) * uStormTint + vec3(0.0, 0.02, 0.0), uStorm * 0.42);
      }

      // --- low health: desaturate + pulsing blood-red edges; damage flash
      float edge = smoothstep(0.16, 0.55, r2 * 1.6);   // red creeps in from the frame edges, centre stays readable
      if (uHurt > 0.001 || uDamage > 0.001) {
        // heartbeat (lub-dub) pulse driven from JS; the edges throb and the frame dims a touch on each beat
        float pulse = 0.6 + 0.4 * uBeat;
        c = mix(c, vec3(luma(c)), uHurt * 0.65);
        c *= 1.0 - uHurt * uBeat * 0.06;
        c = mix(c, vec3(0.42, 0.015, 0.0), clamp(edge * (uHurt * pulse * 0.75 + uDamage * 0.7), 0.0, 0.85));
      }
      // --- radiation shimmer (green speckle when taking rads)
      if (uRad > 0.001) {
        float n = hash(floor(uv * uRes / 2.0) + floor(uTime * 24.0));
        c += vec3(0.1, 0.55, 0.08) * step(0.985 - uRad * 0.02, n) * uRad * 0.6;
        c = mix(c, c * vec3(0.9, 1.08, 0.88), uRad * 0.4);
      }
      // --- death: drain to grey
      if (uDead > 0.001) c = mix(c, vec3(luma(c)) * vec3(0.9, 0.86, 0.82), uDead * 0.85) * (1.0 - uDead * 0.25);
      // --- white-outs (nuke-class blasts, close lightning)
      c = mix(c, uFlashCol, clamp(uFlashAmt, 0.0, 1.0));
      // --- menus
      c *= 1.0 - uMenuDim * 0.35;
      // --- vignette
      float vig = smoothstep(0.95, 0.2, sqrt(r2) * 1.35);
      c *= mix(1.0, vig, uVignette);
      // --- film grain (here only when no AA pass follows; otherwise the AA pass adds it after the edge blend)
      c = clamp(filmGrain(c, gl_FragCoord.xy), 0.0, 1.0);
      // alpha: perceptual luma for the FXAA pass when rendering into the LDR target, else opaque
      gl_FragColor = vec4(c, uOutLuma > 0.5 ? sqrt(dot(c, vec3(0.299, 0.587, 0.114))) : 1.0);
    }
  `;
  // fallback grain (used if 46_post_aa.js is missing)
  const GRAIN_FALLBACK = `
    vec3 filmGrain(vec3 c, vec2 fragXY){
      float gn = fract(sin(dot(fragXY + fract(uTime * 7.31) * 811.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
      return c + gn * uGrain * (1.2 - dot(c, vec3(0.2126, 0.7152, 0.0722)) * 0.8) * (1.0 + uNight * 0.6);
    }
  `;

  // ------------------------------------------------------------------
  const P = {
    enabled: false,
    failed: false,
    msaa: 0,
    rtScene: null,
    rtBright: null,
    chain: [],
    rtRays: null,
    wideW: 0.9,
    raysOn: false,
    rayK: 0,
    quad: null,
    qScene: null,
    qCam: null,
    mats: {},
    grade: "teal",
    hurt: 0,
    damage: 0,
    rad: 0,
    menu: 0,
    dead: 0,
    flashAmt: 0,
    flashDecay: 2,
    flashCol: new THREE.Color(1, 1, 1),
    fpsLow: 0,
    w: 0,
    h: 0,
    sw: 0,
    sh: 0,
    beatPh: 0,
    vig: 0.42,
    vigCur: 0.42,
    // dynamic resolution (scene + bloom targets scale 0.6..1.0 from a 1 s frame-time average, target 16.6 ms)
    dyn: {
      on: true,
      fixed: 0,
      scale: 1,
      min: 0.6,
      max: 1.0,
      target: 22.2, // 45 fps floor: a 16.6 ms target never registers as 'comfortable' on a vsync'd 60 Hz display (frames average 17–19 ms), so the scale/tier ratcheted down after the load hitch and never came back — 60% resolution, tier 2, window interiors off (user report 2026-09-27)
      acc: 0,
      n: 0,
      warm: 0,
      avgMs: 16.6,
      upWins: 0,
      upNeed: 3,
      prevScale: 1,
      prevMs: 0,
      noGain: 0,
      cpuHold: 0,
      slowWins: 0,
      fastWins: 0,
      dynTier: 0,
    },
    // post quality (render_post): 0 low, 1 medium, 2 high, 3 ultra; `level` = effective (capped by the live perf tier)
    postQ: 2,
    level: 2,
    feat: {},
    fail: {},
    grain: 0.035,
    // LUT grading cross-fade
    lut: {
      on: false,
      a: "olive",
      b: null,
      mix: 0,
      dur: 1.2,
      ctx: null,
      ctxW: 0,
    },
    // depth of field
    dof: null,
    dofFocusIdx: 0,
    // black-frame watchdog
    watch: { until: 0, next: 0, zero: 0, stage: 0 },
  };
  const TIER_LOD = [1, 0.8, 0.65];
  const POSTQ = ["low", "medium", "high", "ultra"];
  // per-level pass settings (see NOTES.md "Post-processing stack v2")
  const QSET = [
    /* low    */ {
      bloomLv: 3,
      karis: 1,
      ao: 0,
      aoN: 0,
      vol: false,
      rays: false,
      water: false,
      pud: false,
      dofN: 12,
      aa: "fxaa",
      msaa: false,
      cas: 0.3,
    },
    /* medium */ {
      bloomLv: 4,
      karis: 1,
      ao: 1,
      aoN: 8,
      vol: true,
      rays: true,
      water: true,
      pud: true,
      dofN: 20,
      aa: "fxaa",
      msaa: false,
      cas: 0.45,
    },
    /* high   */ {
      bloomLv: 4,
      karis: 1,
      ao: 1,
      aoN: 12,
      vol: true,
      rays: true,
      water: true,
      pud: true,
      dofN: 28,
      aa: "auto",
      msaa: true,
      cas: 0.5,
    },
    /* ultra  */ {
      bloomLv: 4,
      karis: 1,
      ao: 1,
      aoN: 16,
      vol: true,
      rays: true,
      water: true,
      pud: true,
      dofN: 40,
      aa: "fxaa",
      msaa: true,
      cas: 0.55,
    },
  ];
  A.post = P;
  const _sunV = new THREE.Vector3(),
    _hz = new THREE.Vector3();

  function capable() {
    const r = G.renderer;
    if (!r || !r.capabilities) return false;
    if (r.capabilities.isWebGL2) {
      return (
        r.extensions.has("EXT_color_buffer_float") ||
        r.extensions.has("EXT_color_buffer_half_float")
      );
    }
    return (
      r.extensions.has("OES_texture_half_float") &&
      r.extensions.has("EXT_color_buffer_half_float")
    );
  }

  function mkRT(w, h, opts) {
    const rt = new THREE.WebGLRenderTarget(
      Math.max(1, w),
      Math.max(1, h),
      Object.assign(
        {
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
          stencilBuffer: false,
          generateMipmaps: false,
        },
        opts || {},
      ),
    );
    rt.texture.generateMipmaps = false;
    return rt;
  }

  function sizes() {
    const v = G.renderer.getDrawingBufferSize(new THREE.Vector2());
    return { w: Math.max(2, v.x | 0), h: Math.max(2, v.y | 0) };
  }

  function sceneSize(w, h) {
    const k = P.dyn.fixed || P.dyn.scale;
    return {
      sw: Math.max(2, Math.round(w * k)),
      sh: Math.max(2, Math.round(h * k)),
    };
  }
  function build() {
    const { w, h } = sizes();
    P.w = w;
    P.h = h;
    const { sw, sh } = sceneSize(w, h);
    P.sw = sw;
    P.sh = sh;
    const r = G.renderer;
    P.msaa = wantMSAA();
    P.rtScene = mkRT(sw, sh, { depthBuffer: true, samples: P.msaa });
    P.rtScene.texture.name = "atmos_scene";
    const bw = (x, d) => Math.max(1, Math.floor(x / d));
    P.rtBright = mkRT(bw(sw, 2), bw(sh, 2));
    P.chain = [
      mkRT(bw(sw, 4), bw(sh, 4)),
      mkRT(bw(sw, 8), bw(sh, 8)),
      mkRT(bw(sw, 16), bw(sh, 16)),
      mkRT(bw(sw, 32), bw(sh, 32)),
    ];
    P.rtRays = mkRT(bw(sw, 4), bw(sh, 4));
    buildDepthCapture(sw, sh);
    if (P.rtDepth) {
      P.rtAO = mkRT(bw(sw, 2), bw(sh, 2));
      P.rtAO.texture.name = "atmos_ao";
      P.rtAO2 = mkRT(bw(sw, 2), bw(sh, 2));
      buildViewDepthCapture(sw, sh);
    }

    const vs = A.glsl.fsVert;
    const mk = (fs, uniforms) =>
      new THREE.ShaderMaterial({
        vertexShader: vs,
        fragmentShader: fs,
        uniforms,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
    P.mats.bright = mk(BRIGHT, {
      tSrc: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uThreshold: { value: 1.0 },
      uKnee: { value: 0.5 },
      uHot: { value: 3.0 },
      uKaris: { value: 1 },
    });
    P.mats.down = mk(DOWN, {
      tSrc: { value: null },
      uTexel: { value: new THREE.Vector2() },
    });
    P.mats.up = mk(UP, {
      tSrc: { value: null },
      uTexel: { value: new THREE.Vector2() },
      uWeight: { value: 1 },
    });
    P.mats.up.blending = THREE.AdditiveBlending;
    P.mats.up.transparent = true;
    P.mats.rays = mk(RAYS, {
      tSrc: { value: null },
      uSun: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: w / h },
      uThresh: { value: 0.3 },
      uFall: { value: 1.6 },
      uTime: { value: 0 },
    });
    if (P.rtAO) {
      // GTAO-lite (43_post_gtao.js) when it compiles, else the previous disc SSAO. ?aomode=ssao for A/B shots.
      const wantGT = !!(
        A.postGTAO &&
        !P.fail.gtao &&
        !(G.QS && G.QS.get("aomode") === "ssao")
      );
      const aoU = () => ({
        tDepth: { value: P.rtDepth.depthTexture },
        uProj: { value: new THREE.Matrix4() },
        uInvProj: { value: new THREE.Matrix4() },
        uCamNF: { value: new THREE.Vector2(0.1, 3000) },
        uDTexel: { value: new THREE.Vector2(1 / sw, 1 / sh) },
        uRadius: { value: 0.9 },
        uN: { value: 12 },
        uFar: { value: 140 },
        uInt: { value: 2.2 },
        uFogD: { value: 0.0015 },
        uMaxUV: { value: 0.09 },
      });
      if (wantGT) {
        const gm = mk(A.postGTAO.FS, aoU());
        if (A.validateMaterial(gm, null) !== false) {
          P.mats.ao = gm;
          P.aoKind = "gtao";
        } else {
          gm.dispose();
          P.fail.gtao = "GTAO failed to compile (disc SSAO)";
        }
      }
      if (!P.mats.ao) {
        P.aoKind = "ssao";
        P.mats.ao = mk(AO, {
          tDepth: { value: P.rtDepth.depthTexture },
          uProj: { value: new THREE.Matrix4() },
          uInvProj: { value: new THREE.Matrix4() },
          uCamNF: { value: new THREE.Vector2(0.1, 3000) },
          uDTexel: { value: new THREE.Vector2(1 / sw, 1 / sh) },
          uRadius: { value: 0.9 },
          uN: { value: 12 },
          uFar: { value: 140 },
          uInt: { value: 2.2 },
          uFogD: { value: 0.0015 },
          uMaxUV: { value: 0.09 },
        });
      }
      P.mats.aoBlur = mk(AOBLUR, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uDir: { value: new THREE.Vector2(1, 0) },
      });
    }
    // depth of field (needs the depth copy) — 44_post_dof.js
    const DF = A.postDOF;
    if (P.rtDepth && DF && !P.fail.dof) {
      const nf = () => ({ value: new THREE.Vector2(0.1, 3000) });
      P.mats.dofFocus = mk(DF.FOCUS, {
        tDepth: { value: P.rtDepth.depthTexture },
        tPrev: { value: null },
        uCamNF: nf(),
        uK: { value: 0.1 },
        uOverride: { value: 0 },
        uFirst: { value: 1 },
      });
      P.mats.dofPre = mk(DF.PRE, {
        tSrc: { value: null },
        tDepth: { value: P.rtDepth.depthTexture },
        tFocus: { value: null },
        tVM: { value: null },
        uCamNF: nf(),
        uDof: { value: new THREE.Vector4(1.6, 1, 0.2, 0) },
        uVMOn: { value: 0 },
      });
      P.mats.dofBlur = mk(DF.BLUR, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uMaxR: { value: 8 },
        uN: { value: 24 },
      });
    }
    // volumetric light shafts (shadow-map ray march, ½ / ¼ res + bilateral blur) — 45_post_vol.js
    if (P.rtDepth && A.postVol && !P.fail.vol) {
      P.mats.vol = mk(A.postVol.FS, {
        tDepth: { value: P.rtDepth.depthTexture },
        tShadow: { value: null },
        uInvProj: { value: new THREE.Matrix4() },
        uCamWorld: { value: new THREE.Matrix4() },
        uShadowMat: { value: new THREE.Matrix4() },
        uCamPos: { value: new THREE.Vector3() },
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uVolP: { value: new THREE.Vector4(110, 16, 0.001, 30) },
        uVolQ: { value: new THREE.Vector4(0, 0.5, 0.5, 0) },
        uExt: { value: 0.004 },
        uLit0: { value: 0.35 },
      });
      P.mats.volBlur = mk(AOBLUR, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2() },
        uDir: { value: new THREE.Vector2(1, 0) },
      });
    }
    // eye adaptation meter (1×1 ping-pong, half float) — 48_post_eye.js
    if (A.postEye && !P.fail.eye) {
      P.mats.eye = mk(A.postEye.METER, {
        tSrc: { value: null },
        tPrev: { value: null },
        uExpo: { value: 1 },
        uK: { value: 0.02 },
        uKUp: { value: 0.05 },
        uFirst: { value: 1 },
        uSkyW: { value: 0.45 },
      });
      const n1 = () =>
        mkRT(1, 1, {
          minFilter: THREE.NearestFilter,
          magFilter: THREE.NearestFilter,
        });
      P.rtEye = [n1(), n1()];
      P.eyeIdx = 0;
    }
    // anti-aliasing + grain pass — 46_post_aa.js
    if (A.postAA && !P.fail.aa) {
      P.mats.aa = mk(A.postAA.FXAA, {
        tSrc: { value: null },
        uTexel: { value: new THREE.Vector2(1 / w, 1 / h) },
        uRes: { value: new THREE.Vector2(w, h) },
        uGrain: { value: 0 },
        uTime: { value: 0 },
        uNight: { value: 0 },
        uAA: { value: 1 },
        uSharp: { value: 0 },
      });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]),
        3,
      ),
    );
    P.geo = geo;
    // validate every optional pass on its own: a failing one is switched off, the rest keeps running
    const OPTIONAL = {
      rays: "rays",
      ao: "ao",
      aoBlur: "ao",
      dofFocus: "dof",
      dofPre: "dof",
      dofBlur: "dof",
      aa: "aa",
      eye: "eye",
      vol: "vol",
      volBlur: "vol",
    };
    for (const k in P.mats) {
      if (A.validateMaterial(P.mats[k], geo)) continue;
      const f = OPTIONAL[k];
      if (!f) throw new Error('post-fx shader "' + k + '" failed to compile');
      dropFeature(f, 'shader "' + k + '" failed to compile');
    }
    // composite: full → without DOF → without LUT; only if even the plain composite fails is post-fx off
    buildComposite(w, h);
    P.quad = new THREE.Mesh(geo, P.mats.comp);
    P.quad.frustumCulled = false;
    P.qScene = new THREE.Scene();
    P.qScene.add(P.quad);
    P.qCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    applyGrade(P.grade, true);
    P.sw = 0;
    resize(); // push the source-texel / sharpen uniforms for the initial scale
    armWatch();
  }
  function dropFeature(f, why) {
    P.fail[f] = why;
    if (f === "ao") {
      dropAO(why);
      return;
    }
    if (f === "eye" && P.mats.comp && P.mats.comp.uniforms.uEye)
      P.mats.comp.uniforms.uEye.value.x = 0;
    console.warn("[atmosphere] post " + f + " off: " + why);
  }
  function compShader(flags) {
    const DF = A.postDOF,
      GR = A.postGrade,
      AA = A.postAA;
    let pre = "";
    if (G.QS && G.QS.get("raysdebug")) pre += "#define RAYS_DEBUG\n";
    if (G.QS && G.QS.get("aodebug")) pre += "#define AO_DEBUG\n";
    if (flags.lut) pre += "#define USE_LUT\n";
    if (flags.dof) pre += "#define USE_DOF\n";
    if (flags.eye) pre += "#define USE_EYE\n";
    if (flags.vol) pre += "#define USE_VOL\n";
    if (flags.dist) pre += "#define USE_DIST\n";
    if (flags.vol && G.QS && G.QS.get("voldebug")) pre += "#define VOL_DEBUG\n";
    return (
      pre +
      COMPOSITE.replace("__EYE_GLSL__", flags.eye ? A.postEye.APPLY_GLSL : "")
        .replace("__VOL_GLSL__", flags.vol ? A.postVol.APPLY_GLSL : "")
        .replace("__DISTU_GLSL__", flags.dist ? A.postDistort.GLSL : "")
        .replace("__DIST_GLSL__", flags.dist ? A.postDistort.APPLY_GLSL : "")
        .replace("__LUT_GLSL__", flags.lut ? GR.GLSL : "")
        .replace("__COC_GLSL__", flags.dof ? DF.COC_GLSL : "")
        .replace(
          "__GRAIN_GLSL__",
          AA && !P.fail.grain ? AA.GRAIN_GLSL : GRAIN_FALLBACK,
        )
    );
  }
  function buildComposite(w, h) {
    const g = GRADES.olive;
    const variants = [];
    const canLut = !!(A.postGrade && !P.fail.lut),
      canDof = !!(P.mats.dofBlur && !P.fail.dof),
      canEye = !!(P.mats.eye && !P.fail.eye);
    const canVol = !!(P.mats.vol && P.mats.volBlur && !P.fail.vol);
    const canDist = !!(A.postDistort && !P.fail.heat);
    variants.push({
      lut: canLut,
      dof: canDof,
      eye: canEye,
      vol: canVol,
      dist: canDist,
    });
    if (canVol || canDist)
      variants.push({
        lut: canLut,
        dof: canDof,
        eye: canEye,
        vol: false,
        dist: false,
      });
    if (canDof)
      variants.push({ lut: canLut, dof: false, eye: canEye, vol: false });
    if (canLut)
      variants.push({ lut: false, dof: false, eye: canEye, vol: false });
    if (canEye)
      variants.push({ lut: false, dof: false, eye: false, vol: false });
    let last = null;
    for (const fl of variants) {
      const u = {
        tScene: { value: null },
        tBloom: { value: null },
        uRes: { value: new THREE.Vector2(w, h) },
        uTime: { value: 0 },
        uExposure: { value: 1 },
        uBloom: { value: 0.7 },
        uCA: { value: 0.0 },
        uVignette: { value: 0.42 },
        uGrain: { value: P.grain },
        uSat: { value: g.sat },
        uContrast: { value: g.contrast },
        uLift: { value: new THREE.Vector3() },
        uNightLift: { value: new THREE.Vector3() },
        uSrcTexel: { value: new THREE.Vector2(1 / w, 1 / h) },
        uSharpen: { value: 0 },
        uGamma: { value: new THREE.Vector3(1, 1, 1) },
        uGain: { value: new THREE.Vector3(1, 1, 1) },
        uShadowTint: { value: new THREE.Vector3() },
        uHighTint: { value: new THREE.Vector3() },
        uHurt: { value: 0 },
        uDamage: { value: 0 },
        uRad: { value: 0 },
        uMenuDim: { value: 0 },
        uDead: { value: 0 },
        uFlashAmt: { value: 0 },
        uFlashCol: { value: new THREE.Color(1, 1, 1) },
        uNight: { value: 0 },
        uBeat: { value: 0 },
        uSunUV: { value: new THREE.Vector2(0.5, 0.5) },
        uSunOn: { value: 0 },
        uAspect: { value: w / h },
        uSunTint: { value: new THREE.Color(1, 0.9, 0.7) },
        tRays: { value: null },
        uRayCol: { value: new THREE.Color(0, 0, 0) },
        uNoise: { value: A.noiseTex },
        uWaterOn: { value: 0 },
        uWaterStep: { value: 1 / 48 },
        uHorizonY: { value: 0.5 },
        uWaterTint: { value: new THREE.Color(0.62, 0.66, 0.54) },
        uWaterN: { value: 30 },
        tDepth: { value: P.rtDepth ? P.rtDepth.depthTexture : null },
        uPudOn: { value: 0 },
        uPudN: { value: 24 },
        uProj: { value: new THREE.Matrix4() },
        uInvProj: { value: new THREE.Matrix4() },
        uUpView: { value: new THREE.Vector3(0, 1, 0) },
        uSkyRefl: { value: new THREE.Color() },
        uCamNF: { value: new THREE.Vector2(0.1, 3000) },
        uStorm: { value: 0 },
        uStormTint: { value: new THREE.Color(0.86, 1.08, 0.6) },
        tAO: { value: P.rtAO ? P.rtAO.texture : null },
        tVM: { value: P.rtVM ? P.rtVM.depthTexture : null },
        uAOOn: { value: 0 },
        uAOStr: { value: 0.8 },
        uVMOn: { value: 0 },
        uOutLuma: { value: 0 },
      };
      if (fl.lut) {
        const t = A.postGrade.lut(P.grade);
        u.tLutA = { value: t };
        u.tLutB = { value: t };
        u.uLutMix = { value: 0 };
      }
      if (fl.dof) {
        u.tDof = { value: null };
        u.tFocus = { value: null };
        u.uDof = { value: new THREE.Vector4(1.6, 1, 0.2, 0) };
        u.uDofOn = { value: 0 };
      }
      if (fl.eye) {
        u.tEye = { value: null };
        u.uEye = { value: new THREE.Vector4(0, 0.2, 0.35, 0.7) };
        u.uEyeHi = { value: 1.6 };
      }
      if (fl.dist) Object.assign(u, A.postDistort.uniforms());
      if (fl.vol) {
        u.tVol = { value: null };
        u.uVolCol = { value: new THREE.Color(0, 0, 0) };
        u.uVolTexel = { value: new THREE.Vector2(1 / 256, 1 / 256) };
        u.uVolSky = { value: 0.35 };
        u.uVolOn = { value: 0 };
      }
      const m = new THREE.ShaderMaterial({
        vertexShader: A.glsl.fsVert,
        fragmentShader: compShader(fl),
        uniforms: u,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
      });
      if (A.validateMaterial(m, P.geo)) {
        P.mats.comp = m;
        P.feat.lutShader = fl.lut;
        P.feat.dofShader = fl.dof;
        P.feat.eyeShader = !!fl.eye;
        P.feat.volShader = !!fl.vol;
        P.feat.distShader = !!fl.dist;
        if (canVol && !fl.vol)
          dropFeature("vol", "volumetric composite failed to compile");
        if (canDist && !fl.dist)
          dropFeature("heat", "heat-haze composite failed to compile");
        if (canLut && !fl.lut)
          dropFeature(
            "lut",
            "LUT composite failed to compile (analytic grade)",
          );
        if (canDof && !fl.dof)
          dropFeature("dof", "DOF composite failed to compile");
        if (canEye && !fl.eye)
          dropFeature("eye", "eye-adaptation composite failed to compile");
        return;
      }
      last = fl;
      m.dispose();
    }
    throw new Error(
      "post-fx composite failed to compile (" + JSON.stringify(last) + ")",
    );
  }
  function wantMSAA() {
    const r = G.renderer;
    return QSET[P.postQ].msaa && r.capabilities.isWebGL2 && !G.SMOKE
      ? Math.min(4, r.capabilities.maxSamples || 4)
      : 0;
  }
  function setMSAA(want) {
    if (!P.rtScene || want === P.msaa) return;
    P.msaa = want;
    const old = P.rtScene;
    P.rtScene = mkRT(P.sw, P.sh, { depthBuffer: true, samples: want });
    P.rtScene.texture.name = "atmos_scene";
    old.dispose();
  }
  // lazily created targets (only when the feature is first used)
  function ensureDofRTs() {
    if (P.rtDofA) return;
    const bw = (x) => Math.max(1, Math.floor(x / 2));
    P.rtDofA = mkRT(bw(P.sw), bw(P.sh));
    P.rtDofB = mkRT(bw(P.sw), bw(P.sh));
    P.rtFocus = [
      mkRT(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      }),
      mkRT(1, 1, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
      }),
    ];
  }
  function ensureVol(div) {
    const w = Math.max(1, Math.floor(P.sw / div)),
      h = Math.max(1, Math.floor(P.sh / div));
    if (P.rtVol && P.volDiv === div) {
      if (P.rtVol.width !== w || P.rtVol.height !== h) {
        P.rtVol.setSize(w, h);
        P.rtVol2.setSize(w, h);
      }
      return;
    }
    if (P.rtVol) {
      P.rtVol.dispose();
      P.rtVol2.dispose();
    }
    P.volDiv = div;
    P.rtVol = mkRT(w, h);
    P.rtVol.texture.name = "atmos_vol";
    P.rtVol2 = mkRT(w, h);
  }
  function ensureLDR() {
    if (P.rtLDR) return;
    P.rtLDR = mkRT(P.w, P.h, { type: THREE.UnsignedByteType });
    P.rtLDR.texture.name = "atmos_ldr";
  }

  function resize() {
    if (!P.rtScene) return;
    const { w, h } = sizes();
    const { sw, sh } = sceneSize(w, h);
    if (w === P.w && h === P.h && sw === P.sw && sh === P.sh) return;
    P.w = w;
    P.h = h;
    P.sw = sw;
    P.sh = sh;
    P.rtScene.setSize(sw, sh);
    const bw = (x, d) => Math.max(1, Math.floor(x / d));
    P.rtBright.setSize(bw(sw, 2), bw(sh, 2));
    const divs = [4, 8, 16, 32];
    P.chain.forEach((rt, i) => rt.setSize(bw(sw, divs[i]), bw(sh, divs[i])));
    if (P.rtRays) P.rtRays.setSize(bw(sw, 4), bw(sh, 4));
    if (P.rtDepth) {
      P.rtDepth.setSize(sw, sh);
      P.depthDirty = true;
    }
    if (P.rtAO) {
      P.rtAO.setSize(bw(sw, 2), bw(sh, 2));
      P.rtAO2.setSize(bw(sw, 2), bw(sh, 2));
      P.mats.ao.uniforms.uDTexel.value.set(1 / sw, 1 / sh);
    }
    if (P.rtVM) {
      P.rtVM.setSize(sw, sh);
      P.vmDirty = true;
    }
    if (P.rtDofA) {
      P.rtDofA.setSize(bw(sw, 2), bw(sh, 2));
      P.rtDofB.setSize(bw(sw, 2), bw(sh, 2));
    }
    if (P.rtVol) ensureVol(P.volDiv);
    if (P.rtLDR) P.rtLDR.setSize(w, h);
    if (P.mats.aa) {
      P.mats.aa.uniforms.uTexel.value.set(1 / w, 1 / h);
      P.mats.aa.uniforms.uRes.value.set(w, h);
    }
    if (P.mats.rays) P.mats.rays.uniforms.uAspect.value = w / h;
    const u = P.mats.comp.uniforms;
    u.uRes.value.set(w, h);
    u.uAspect.value = w / h;
    u.uSrcTexel.value.set(1 / sw, 1 / sh);
    const k = sw / w;
    u.uSharpen.value = k < 0.97 ? Math.min(0.5, (1 - k) * 1.3) : 0;
  }

  // ------------------------------------------------------------------
  // Dynamic resolution + perf tier. Each 1 s window of frame times (hitches > 120 ms ignored)
  // steers the scene-target scale: over budget → shrink (pixel count ∝ scale², so the step is
  // sqrt(target/avg)); comfortably at budget for a few windows → grow by 0.1 (the wait doubles after
  // every up-step that had to be taken back, so it doesn't oscillate). If shrinking doesn't buy any
  // time we're CPU-bound: go back up and stop shrinking for 20 s. The perf tier (0 full, 1 reduced,
  // 2 low) follows the scale / sustained overload and drives shadow size/extent here and — via
  // G.atmos.perfTier / lodScale / the 'perfTierChanged' event — other modules' LOD distances.
  // ------------------------------------------------------------------
  function qualityTier() {
    return A.quality === "low" ? 2 : A.quality === "medium" ? 1 : 0;
  }
  function setTier() {
    const t = Math.max(qualityTier(), P.dyn.dynTier);
    if (t !== ATMOS.perfTier) {
      ATMOS.perfTier = t;
      ATMOS.lodScale = TIER_LOD[t];
      if (A.applyShadowTier) A.applyShadowTier();
      G.events.emit("perfTierChanged", t);
    }
  }
  function setScale(k) {
    const D = P.dyn;
    k = Math.round(clamp(k, D.min, D.max) * 20) / 20;
    if (Math.abs(k - D.scale) < 0.001) return false;
    D.scale = k;
    resize();
    return true;
  }
  function dynUpdate(realDt, st) {
    const D = P.dyn;
    if (
      !D.on ||
      D.fixed ||
      G.SMOKE ||
      G.SHOT ||
      st !== "play" ||
      document.hidden
    ) {
      D.acc = 0;
      D.n = 0;
      D.warm = 0;
      return;
    }
    D.warm += realDt;
    if (D.warm < 3) return; // let the level settle (shader compiles, streaming)
    const ms = realDt * 1000;
    if (ms > 120) return;
    D.acc += ms;
    D.n++;
    if (D.acc < 1000) return;
    const avg = D.acc / D.n;
    D.acc = 0;
    D.n = 0;
    D.avgMs = avg;
    D.cpuHold = Math.max(0, D.cpuHold - 1);
    // did the last down-step help?
    if (D.prevMs > 0) {
      if (avg > D.prevMs * 0.97 && D.scale < D.prevScale) {
        if (++D.noGain >= 2) {
          setScale(D.prevScale);
          D.cpuHold = 20;
          D.noGain = 0;
        }
      } else D.noGain = 0;
      D.prevMs = 0;
    }
    const over = avg > D.target * 1.1,
      ok = avg < D.target * 1.05;
    if (over && D.scale > D.min && D.cpuHold === 0) {
      D.prevScale = D.scale;
      D.prevMs = avg;
      setScale(D.scale * clamp(Math.sqrt(D.target / avg), 0.8, 0.95));
      if (D.upWins < 0) D.upNeed = Math.min(24, D.upNeed * 2); // we just grew into this → wait longer next time
      D.upWins = 0;
    } else if (ok && D.scale < D.max) {
      if (++D.upWins >= D.upNeed) {
        setScale(D.scale + 0.1);
        D.upWins = -1;
      }
    } else if (!over && D.upWins < 0) {
      D.upWins = 0;
      D.upNeed = Math.max(3, D.upNeed - 1);
    }
    // tier: sustained overload even at reduced scale → step down a tier; recover slowly
    D.slowWins = over ? D.slowWins + 1 : 0;
    D.fastWins = ok ? D.fastWins + 1 : 0;
    let t = D.dynTier;
    if (
      t < 2 &&
      D.slowWins >= 3 &&
      (D.scale <= (t === 0 ? 0.85 : 0.65) || D.cpuHold > 0)
    ) {
      t++;
      D.slowWins = 0;
    } else if (t > 0 && D.fastWins >= 8 && D.scale >= (t === 2 ? 0.75 : 0.9)) {
      t--;
      D.fastWins = 0;
    }
    if (t !== D.dynTier) {
      D.dynTier = t;
      setTier();
    }
  }

  // ------------------------------------------------------------------
  // Scene depth for soft particles + puddle reflections (WebGL2 only). An invisible, zero-length
  // draw sorted FIRST in the transparent list blits the opaque depth (MSAA-resolved) into a
  // DepthTexture right before smoke/fire/glows render; nothing is drawn twice. The GL bindings are
  // restored exactly (three's state cache stays valid). A blit error switches the feature off.
  // ------------------------------------------------------------------
  function buildDepthCapture(sw, sh) {
    const r = G.renderer;
    if (
      !r.capabilities.isWebGL2 ||
      P.depthFailed ||
      (G.QS && G.QS.get("softdepth") === "0")
    )
      return;
    const dt = new THREE.DepthTexture(sw, sh, THREE.UnsignedIntType);
    dt.minFilter = dt.magFilter = THREE.NearestFilter;
    P.rtDepth = new THREE.WebGLRenderTarget(sw, sh, {
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture: dt,
    });
    P.rtDepth.texture.generateMipmaps = false;
    P.depthDirty = true;
    P.depthOK = false;
    P.depthChecks = 0;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(9), 3),
    );
    g.setDrawRange(0, 0);
    const m = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
    });
    m.name = "atmos_depth_capture";
    const cap = new THREE.Mesh(g, m);
    cap.name = "atmos_depth_capture";
    cap.frustumCulled = false;
    cap.renderOrder = -1e9;
    cap.onBeforeRender = captureDepth;
    G.scene.add(cap);
    P.depthCap = cap;
    A.softU.tSoftDepth.value = dt;
  }
  // Viewmodel mask for the SSAO: core renders the gun/hands after clearing depth, so a blit of the
  // depth buffer at the END of the viewScene pass (zero-length draw sorted last) holds only the
  // viewmodel → the composite leaves those pixels alone (no world creases printed onto the gun).
  function buildViewDepthCapture(sw, sh) {
    if (!G.viewScene) return;
    const dt = new THREE.DepthTexture(sw, sh, THREE.UnsignedIntType);
    dt.minFilter = dt.magFilter = THREE.NearestFilter;
    P.rtVM = new THREE.WebGLRenderTarget(sw, sh, {
      type: THREE.UnsignedByteType,
      depthBuffer: true,
      stencilBuffer: false,
      depthTexture: dt,
    });
    P.rtVM.texture.generateMipmaps = false;
    P.vmDirty = true;
    const g = new THREE.BufferGeometry();
    g.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(9), 3),
    );
    g.setDrawRange(0, 0);
    const m = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
    });
    m.name = "atmos_vm_depth_capture";
    const cap = new THREE.Mesh(g, m);
    cap.name = "atmos_vm_depth_capture";
    cap.frustumCulled = false;
    cap.renderOrder = 1e9;
    cap.onBeforeRender = captureViewDepth;
    G.viewScene.add(cap);
    P.vmCap = cap;
  }
  function captureViewDepth(r, scene, camera) {
    if (
      !P.vmArmed ||
      camera !== G.viewCamera ||
      r.getRenderTarget() !== P.rtScene
    )
      return;
    P.vmArmed = false;
    const gl = r.getContext();
    const fb = r.properties.get(P.rtVM).__webglFramebuffer;
    if (!fb) return;
    const rd = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),
      dr = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
    const w = P.rtScene.width,
      h = P.rtScene.height;
    if (P.vmChecks < 3)
      while (gl.getError() !== gl.NO_ERROR) {
        /* flush stale errors */
      }
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dr);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb);
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rd);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dr);
    if (
      (P.vmChecks = (P.vmChecks || 0) + 1) <= 3 &&
      gl.getError() !== gl.NO_ERROR
    ) {
      dropAO("viewmodel depth copy failed");
      return;
    }
    P.vmGot = true;
  }
  function dropAO(why) {
    P.aoFailed = true;
    if (P.mats.comp) P.mats.comp.uniforms.uAOOn.value = 0;
    console.warn("[atmosphere] SSAO off: " + why);
  }
  function renderAO(r) {
    const m = P.mats.ao;
    P.quad.material = m;
    r.setRenderTarget(P.rtAO);
    r.render(P.qScene, P.qCam);
    const b = P.mats.aoBlur;
    b.uniforms.uDir.value.set(1, 0);
    pass(b, P.rtAO, P.rtAO2, P.rtAO);
    b.uniforms.uDir.value.set(0, 1);
    pass(b, P.rtAO2, P.rtAO, P.rtAO2);
  }
  function captureDepth(r, scene, camera) {
    if (!P.capArmed || camera !== G.camera || r.getRenderTarget() !== P.rtScene)
      return;
    P.capArmed = false;
    const gl = r.getContext();
    const fb = r.properties.get(P.rtDepth).__webglFramebuffer;
    if (!fb) return;
    const rd = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING),
      dr = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING);
    const w = P.rtScene.width,
      h = P.rtScene.height;
    if (P.depthChecks < 3)
      while (gl.getError() !== gl.NO_ERROR) {
        /* flush stale errors */
      }
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, dr);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, fb);
    gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.DEPTH_BUFFER_BIT, gl.NEAREST);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, rd);
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, dr);
    if (P.depthChecks < 3) {
      P.depthChecks++;
      if (gl.getError() !== gl.NO_ERROR) {
        P.depthFailed = true;
        P.depthOK = false;
        A.softU.uSoftP.value.z = 0;
        console.warn("[atmosphere] depth copy unsupported: soft particles off");
        return;
      }
    }
    P.depthOK = true;
    A.softU.uSoftP.value.z = 1;
  }

  // ------------------------------------------------------------------
  // ALPHA CHANNEL RULE of the HDR target. Alpha carries three tags: the sky mask (0), the water
  // reflectivity tag (0.3..0.65) and the puddle tag (0.87..0.97); everything else must read 1.
  // Two public-API mechanisms enforce it while (and only while) the world renders into that target:
  //  1) OPAQUE ShaderMaterials (any module) get their final alpha forced to 1: ShaderMaterial's
  //     onBeforeCompile wraps `main()` and adds `gl_FragColor.a = mix(a, 1, nrcForceA)` under three's
  //     own OPAQUE define (part of the program cache key, so transparent variants are untouched).
  //     nrcForceA is a shared uniform that is 1 only during the HDR world pass → offscreen passes of
  //     other modules (texture bakes, minimaps) keep their alpha. Opt-out for real taggers (sky,
  //     water): `defines: { NRC_WRITE_ALPHA: 1 }`. Not covered (see alphaAudit): RawShaderMaterial,
  //     GLSL3 shaders, materials with their own onBeforeCompile.
  //  2) BLENDED draws (smoke, glows, rain, other modules' sprites) keep the destination alpha:
  //     Material.onBeforeRender switches them to the equivalent CustomBlending with alpha factors
  //     (ZERO, ONE) during the HDR pass and restores the author's blend settings outside it.
  //     Opt-out: material.userData.nrcWriteAlpha = true.
  // ------------------------------------------------------------------
  const FORCE_A = { value: 0 };
  const MAIN_RE = /\bvoid\s+main\s*\(\s*(?:void)?\s*\)/g;
  const AUDIT = { patched: 0, skipped: [] };
  function auditSkip(m, why) {
    if (AUDIT.skipped.length < 40)
      AUDIT.skipped.push((m.name || m.type) + ": " + why);
  }
  (function patchShaderMaterials() {
    const SMP = THREE.ShaderMaterial && THREE.ShaderMaterial.prototype;
    if (!SMP || SMP._nrcAlpha) return;
    SMP.onBeforeCompile = function nrcOpaqueAlpha(shader) {
      try {
        if (this.isRawShaderMaterial) return auditSkip(this, "raw");
        if (this.glslVersion === THREE.GLSL3) return auditSkip(this, "glsl3");
        const fs = shader.fragmentShader;
        if (typeof fs !== "string" || fs.indexOf("nrc_main") >= 0) return;
        const hits = fs.match(MAIN_RE);
        if (!hits || hits.length !== 1 || fs.indexOf("gl_FragData") >= 0)
          return auditSkip(this, "main() not found");
        shader.uniforms.nrcForceA = FORCE_A;
        shader.fragmentShader =
          fs.replace(MAIN_RE, "uniform float nrcForceA;\nvoid nrc_main()") +
          "\nvoid main(){\n  nrc_main();\n#if defined(OPAQUE) && !defined(NRC_WRITE_ALPHA)\n  gl_FragColor.a = mix(gl_FragColor.a, 1.0, nrcForceA);\n#endif\n}\n";
        AUDIT.patched++;
      } catch (e) {
        /* leave the shader as authored */
      }
    };
    SMP._nrcAlpha = true;
  })();
  function guardMat(m) {
    const g = m.__nrcG;
    if (
      g &&
      m.blending === THREE.CustomBlending &&
      m.blendSrcAlpha === THREE.ZeroFactor &&
      m.blendDstAlpha === THREE.OneFactor
    )
      return;
    const b = m.blending;
    if (
      b === THREE.NoBlending ||
      (!m.transparent && b === THREE.NormalBlending) ||
      (m.userData && m.userData.nrcWriteAlpha)
    )
      return;
    const pm = m.premultipliedAlpha;
    let src,
      dst,
      eq = THREE.AddEquation;
    if (b === THREE.NormalBlending) {
      src = pm ? THREE.OneFactor : THREE.SrcAlphaFactor;
      dst = THREE.OneMinusSrcAlphaFactor;
    } else if (b === THREE.AdditiveBlending) {
      src = pm ? THREE.OneFactor : THREE.SrcAlphaFactor;
      dst = THREE.OneFactor;
    } else if (b === THREE.MultiplyBlending) {
      src = THREE.ZeroFactor;
      dst = THREE.SrcColorFactor;
    } else if (b === THREE.SubtractiveBlending) {
      src = THREE.ZeroFactor;
      dst = THREE.OneMinusSrcColorFactor;
    } else if (b === THREE.CustomBlending) {
      const ea =
        m.blendEquationAlpha !== null && m.blendEquationAlpha !== undefined
          ? m.blendEquationAlpha
          : m.blendEquation;
      if (
        ea !== THREE.AddEquation &&
        ea !== THREE.SubtractEquation &&
        ea !== THREE.ReverseSubtractEquation
      )
        return;
      src = m.blendSrc;
      dst = m.blendDst;
      eq = m.blendEquation;
    } else return;
    m.__nrcG = {
      blending: b,
      blendSrc: m.blendSrc,
      blendDst: m.blendDst,
      blendEquation: m.blendEquation,
      blendSrcAlpha: m.blendSrcAlpha,
      blendDstAlpha: m.blendDstAlpha,
      blendEquationAlpha: m.blendEquationAlpha,
    };
    m.blending = THREE.CustomBlending;
    m.blendSrc = src;
    m.blendDst = dst;
    m.blendEquation = eq;
    m.blendEquationAlpha = THREE.AddEquation;
    m.blendSrcAlpha = THREE.ZeroFactor;
    m.blendDstAlpha = THREE.OneFactor;
  }
  function unguardMat(m) {
    const g = m.__nrcG;
    m.__nrcG = null;
    // restore only if nobody changed the blending while it was guarded
    if (
      m.blending !== THREE.CustomBlending ||
      m.blendSrcAlpha !== THREE.ZeroFactor ||
      m.blendDstAlpha !== THREE.OneFactor
    )
      return;
    m.blending = g.blending;
    m.blendSrc = g.blendSrc;
    m.blendDst = g.blendDst;
    m.blendEquation = g.blendEquation;
    m.blendSrcAlpha = g.blendSrcAlpha;
    m.blendDstAlpha = g.blendDstAlpha;
    m.blendEquationAlpha = g.blendEquationAlpha;
  }
  function installAlphaGuard() {
    const MP = THREE.Material.prototype;
    if (MP._nrcGuard) return;
    const prev = MP.onBeforeRender;
    MP.onBeforeRender = function (
      renderer,
      scene,
      camera,
      geometry,
      object,
      group,
    ) {
      if (P.alphaGuard) {
        if (this.transparent || this.blending !== THREE.NormalBlending)
          guardMat(this);
      } else if (this.__nrcG) unguardMat(this);
      if (prev)
        prev.call(this, renderer, scene, camera, geometry, object, group);
    };
    MP._nrcGuard = true;
  }
  /** Which ShaderMaterials the alpha rule could NOT patch (raw / GLSL3 / no main) — for module owners. */
  A.alphaAudit = () => ({
    patched: AUDIT.patched,
    skipped: AUDIT.skipped.slice(),
  });
  ATMOS.alphaAudit = A.alphaAudit;

  function pass(mat, src, dst, texelOf) {
    const r = G.renderer;
    P.quad.material = mat;
    if (mat.uniforms.tSrc) mat.uniforms.tSrc.value = src.texture;
    if (mat.uniforms.uTexel)
      mat.uniforms.uTexel.value.set(1 / texelOf.width, 1 / texelOf.height);
    r.setRenderTarget(dst);
    r.render(P.qScene, P.qCam);
  }

  // renderer.info normally only reflects the LAST render() call. While our hook runs we let it
  // accumulate over the whole frame (world + viewmodel + post passes) so the smoke test's
  // draw-call / triangle numbers stay meaningful, and ALWAYS restore autoReset afterwards —
  // nothing global is left changed if post-fx dies or is switched off.
  function hook(r) {
    const info = r.info;
    info.autoReset = false;
    info.reset();
    try {
      frameRender(r);
    } finally {
      info.autoReset = true;
    }
    if (A.onFrameRendered) {
      try {
        A.onFrameRendered();
      } catch (e) {
        A.onFrameRendered = null;
      }
    }
  }
  function frameRender(r) {
    if (!P.enabled) {
      G.renderScenes(null);
      return;
    }
    resize();
    const F = P.feat;
    // 1) world + viewmodel → HDR target (depth copied before the transparent pass; alpha guarded)
    if (P.rtDepth && P.depthDirty) {
      const cur = r.getRenderTarget();
      r.setRenderTarget(P.rtDepth);
      r.setRenderTarget(cur);
      P.depthDirty = false;
    }
    const soft = A.softU;
    if (P.rtDepth && !P.depthFailed) {
      P.capArmed = true;
      soft.uSoftInv.value.set(1 / P.rtScene.width, 1 / P.rtScene.height);
      soft.uSoftP.value.set(G.camera.near, G.camera.far, P.depthOK ? 1 : 0, 0);
    }
    if (P.rtVM && P.vmDirty) {
      const cur = r.getRenderTarget();
      r.setRenderTarget(P.rtVM);
      r.setRenderTarget(cur);
      P.vmDirty = false;
    }
    P.vmArmed = !!((P.aoWant || F.dof) && P.rtVM);
    P.vmGot = false;
    P.alphaGuard = true;
    FORCE_A.value = 1;
    try {
      G.renderScenes(P.rtScene);
    } finally {
      P.alphaGuard = false;
      P.capArmed = false;
      P.vmArmed = false;
      FORCE_A.value = 0;
      soft.uSoftP.value.z = 0; // other render passes (reflections, minimap…) never sample a stale depth
    }
    P.depthValid = P.depthOK && !P.depthFailed;
    const prevAuto = r.autoClear;
    r.autoClear = true;
    // 1b) SSAO (half res + 2 blur passes) from the opaque depth copy
    const cu0 = P.mats.comp.uniforms;
    cu0.uAOOn.value = 0;
    cu0.uVMOn.value = 0;
    if (P.aoWant && P.depthValid && !P.aoFailed && P.mats.ao) {
      renderAO(r);
      cu0.uAOOn.value = 1;
      cu0.tDepth.value = P.rtDepth.depthTexture;
    }
    if (P.vmGot) cu0.uVMOn.value = 1;
    // 1c) volumetric light shafts (shadow-map ray march + 2 bilateral blur passes)
    if (cu0.uVolOn) {
      cu0.uVolOn.value = 0;
      if (P.volWant && P.depthValid) renderVol(r, cu0);
    }
    // 2) bloom (Karis bright pass → 13-tap downsamples → tent upsamples; 3 levels on 'low')
    const bloomOn = P.mats.comp.uniforms.uBloom.value > 0.001;
    if (bloomOn) {
      const lv = Math.max(2, Math.min(P.chain.length, F.bloomLv || 4));
      pass(P.mats.bright, P.rtScene, P.rtBright, P.rtScene);
      let src = P.rtBright;
      for (let i = 0; i < lv; i++) {
        pass(P.mats.down, src, P.chain[i], src);
        src = P.chain[i];
      }
      r.autoClear = false;
      for (let i = lv - 1; i > 0; i--) {
        // the widest levels are weighted down (tighter, less milky halos), more so at night (neon)
        P.mats.up.uniforms.uWeight.value =
          i >= 3 ? P.wideW * 0.85 : i === 2 ? P.wideW : 1.0;
        pass(P.mats.up, P.chain[i], P.chain[i - 1], P.chain[i]);
      }
      r.autoClear = true;
    }
    // 2b) light shafts (quarter resolution, only while the sun/moon is near the view)
    const cu = P.mats.comp.uniforms;
    if (P.raysOn) {
      P.mats.rays.uniforms.tSrc.value = P.rtScene.texture;
      P.quad.material = P.mats.rays;
      r.setRenderTarget(P.rtRays);
      r.render(P.qScene, P.qCam);
      cu.tRays.value = P.rtRays.texture;
    } else cu.uRayCol.value.setRGB(0, 0, 0);
    // 2c) depth of field (dialogue only): autofocus → CoC + colour at half res → bokeh gather
    if (cu.uDofOn) cu.uDofOn.value = 0;
    if (F.dof && P.dof && P.depthValid && cu.uDofOn) renderDOF(r, cu);
    // 2d) eye adaptation meter (1×1, reads the HDR scene; no readback)
    if (cu.uEye) {
      cu.uEye.value.x = 0;
      if (F.eye && P.mats.eye && P.rtEye) {
        const em = P.mats.eye,
          eu = em.uniforms,
          prevRT = P.rtEye[P.eyeIdx],
          nextRT = P.rtEye[1 - P.eyeIdx];
        eu.tSrc.value = P.rtScene.texture;
        eu.tPrev.value = prevRT.texture;
        P.quad.material = em;
        r.setRenderTarget(nextRT);
        r.render(P.qScene, P.qCam);
        P.eyeIdx = 1 - P.eyeIdx;
        cu.tEye.value = nextRT.texture;
        cu.uEye.value.x = 1;
      }
    }
    // 3) composite → screen, or → LDR target + FXAA/grain pass → screen
    cu.tScene.value = P.rtScene.texture;
    cu.tBloom.value = P.chain[0].texture;
    if (!cu.tRays.value) cu.tRays.value = P.chain[0].texture;
    P.quad.material = P.mats.comp;
    const aa = !!(F.aa && P.mats.aa);
    if (aa) ensureLDR();
    cu.uOutLuma.value = aa ? 1 : 0;
    cu.uGrain.value = aa ? 0 : P.grain;
    r.setRenderTarget(aa ? P.rtLDR : null);
    r.render(P.qScene, P.qCam);
    if (aa) {
      const au = P.mats.aa.uniforms;
      au.uGrain.value = P.grain;
      au.uTime.value = cu.uTime.value;
      au.uNight.value = cu.uNight.value;
      au.uAA.value = F.fxaa ? 1 : 0;
      au.uSharp.value = F.cas ? P.casAmt : 0;
      pass(P.mats.aa, P.rtLDR, null, P.rtLDR);
    }
    r.autoClear = prevAuto;
    watchFrame(r);
  }

  function renderVol(r, cu) {
    const V = P.vol,
      sun = A.sun,
      cam = G.camera;
    const map = sun && sun.shadow && sun.shadow.map;
    if (!V || !map || !map.texture) return;
    ensureVol(V.div);
    const vu = P.mats.vol.uniforms;
    vu.tShadow.value = map.texture;
    vu.uShadowMat.value.copy(sun.shadow.matrix);
    vu.uInvProj.value.copy(cam.projectionMatrixInverse);
    vu.uCamWorld.value.copy(cam.matrixWorld);
    vu.uCamPos.value.setFromMatrixPosition(cam.matrixWorld);
    vu.uLightDir.value.copy(V.lightDir);
    vu.uVolP.value.set(V.maxDist, V.steps, V.dens, V.H);
    vu.uVolQ.value.set(
      (G.world && G.world.groundY) || 0,
      V.g,
      V.lit0 !== undefined ? V.lit0 : 0.35,
      0,
    ); // outside the shadow box: neutral
    vu.uExt.value = V.ext;
    vu.uLit0.value = V.lit0 !== undefined ? V.lit0 : 0.35;
    vu.tDepth.value = P.rtDepth.depthTexture;
    P.quad.material = P.mats.vol;
    r.setRenderTarget(P.rtVol);
    r.render(P.qScene, P.qCam);
    const b = P.mats.volBlur;
    b.uniforms.uDir.value.set(1, 0);
    pass(b, P.rtVol, P.rtVol2, P.rtVol);
    b.uniforms.uDir.value.set(0, 1);
    pass(b, P.rtVol2, P.rtVol, P.rtVol2);
    cu.tVol.value = P.rtVol.texture;
    cu.uVolTexel.value.set(1 / P.rtVol.width, 1 / P.rtVol.height);
    cu.uVolCol.value.copy(V.col);
    cu.uVolSky.value = V.sky;
    cu.tDepth.value = P.rtDepth.depthTexture;
    cu.uCamNF.value.set(cam.near, cam.far);
    cu.uVolOn.value = 1;
  }

  function renderDOF(r, cu) {
    const D = P.dof,
      m = P.mats;
    ensureDofRTs();
    const cam = G.camera;
    // focus (1×1 ping-pong: temporal smoothing without a readback)
    const fi = P.dofFocusIdx,
      prev = P.rtFocus[fi],
      next = P.rtFocus[1 - fi];
    const fu = m.dofFocus.uniforms;
    fu.tPrev.value = prev.texture;
    fu.uCamNF.value.set(cam.near, cam.far);
    fu.uOverride.value = D.override || 0;
    fu.uFirst.value = A.postDOF.consumeSnap() || G.SHOT ? 1 : 0;
    fu.uK.value = 1 - Math.exp(-(P.rdLast || 0.016) * 6);
    P.quad.material = m.dofFocus;
    r.setRenderTarget(next);
    r.render(P.qScene, P.qCam);
    P.dofFocusIdx = 1 - fi;
    const dv = cu.uDof.value.set(D.far, D.near, D.band, D.all || 0);
    // CoC + colour at half res
    const pu = m.dofPre.uniforms;
    pu.tSrc.value = P.rtScene.texture;
    pu.tFocus.value = next.texture;
    pu.uCamNF.value.set(cam.near, cam.far);
    pu.uDof.value.copy(dv);
    pu.tVM.value = P.rtVM ? P.rtVM.depthTexture : null;
    pu.uVMOn.value = P.vmGot ? 1 : 0;
    P.quad.material = m.dofPre;
    r.setRenderTarget(P.rtDofA);
    r.render(P.qScene, P.qCam);
    // gather
    const bu = m.dofBlur.uniforms;
    bu.uMaxR.value = D.maxR;
    bu.uN.value = D.n;
    pass(m.dofBlur, P.rtDofA, P.rtDofB, P.rtDofA);
    cu.tDof.value = P.rtDofB.texture;
    cu.tFocus.value = next.texture;
    cu.tDepth.value = P.rtDepth.depthTexture;
    cu.uCamNF.value.set(cam.near, cam.far);
    cu.uDofOn.value = 1;
  }

  // ------------------------------------------------------------------
  // Black-frame watchdog: for ~25 s after post-fx (re)builds or changes quality, every 0.5 s read 5
  // pixels of the final frame. Film grain makes an honestly dark frame non-zero somewhere, so 5
  // exact-zero pixels 3 times in a row means a pass is producing garbage (NaN, driver bug):
  // first strip down to the minimal composite, then — if it is still black — plain rendering.
  // ------------------------------------------------------------------
  const _px = new Uint8Array(4);
  function armWatch() {
    const W = P.watch;
    W.until = (A.realTime || 0) + 25;
    W.next = (A.realTime || 0) + 2;
    W.zero = 0;
  }
  function watchFrame(r) {
    const W = P.watch,
      t = A.realTime || 0;
    if (t > W.until || t < W.next || P.grain < 0.004) return;
    const st = G.state;
    if (
      st !== "play" ||
      P.dead > 0.05 ||
      P.flashAmt > 0.05 ||
      P.menu > 0.05 ||
      (G.player && !G.player.alive)
    )
      return;
    W.next = t + 0.5;
    try {
      const gl = r.getContext();
      const cw = gl.drawingBufferWidth,
        ch = gl.drawingBufferHeight;
      let zero = 0;
      const pts = [
        [0.5, 0.5],
        [0.25, 0.3],
        [0.75, 0.3],
        [0.3, 0.7],
        [0.7, 0.7],
      ];
      for (const p of pts) {
        gl.readPixels(
          (cw * p[0]) | 0,
          (ch * p[1]) | 0,
          1,
          1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          _px,
        );
        if (_px[0] === 0 && _px[1] === 0 && _px[2] === 0) zero++;
      }
      W.zero = zero === pts.length ? W.zero + 1 : 0;
      if (W.zero < 3) return;
      W.zero = 0;
      if (W.stage === 0) {
        W.stage = 1;
        console.warn(
          "[atmosphere] black frame detected: post-fx stripped to the minimal composite",
        );
        for (const f of ["dof", "lut", "aa", "ao", "eye", "vol", "heat"])
          if (!P.fail[f]) dropFeature(f, "black-frame watchdog");
        P.rayOpt = false;
        const old = P.mats.comp;
        buildComposite(P.w, P.h);
        P.quad.material = P.mats.comp;
        applyGrade(P.grade, true);
        if (old && old !== P.mats.comp) old.dispose();
        P.sw = 0;
        resize();
        armWatch();
      } else {
        console.warn("[atmosphere] black frame persists: plain rendering");
        P.failed = true;
        enable(false);
      }
    } catch (e) {
      W.until = 0;
    }
  }

  function applyGrade(name, snap) {
    const g = GRADES[name] || GRADES.olive;
    P.grade = GRADES[name] ? name : "olive";
    ATMOS.grading = P.grade;
    if (!P.mats.comp) return;
    const u = P.mats.comp.uniforms;
    u.uSat.value = g.sat;
    u.uContrast.value = g.contrast;
    u.uLift.value.fromArray(g.lift);
    u.uNightLift.value.fromArray(g.nightLift || [0, 0, 0]);
    u.uGamma.value.fromArray(g.gamma);
    u.uGain.value.fromArray(g.gain);
    u.uShadowTint.value.fromArray(g.shadowTint);
    u.uHighTint.value.fromArray(g.highTint);
    P.baseBloom = g.bloom;
    if (snap) {
      const L = P.lut;
      L.a = P.grade;
      L.b = null;
      L.mix = 0;
      lutBind();
    }
  }
  // LUT cross-fade state → uniforms. Target look = user grade, or a context look (cryo-unit interiors)
  // mixed in by weight; any change blends over L.dur seconds.
  function lutBind() {
    const u = P.mats.comp && P.mats.comp.uniforms,
      GR = A.postGrade;
    if (!u || !u.tLutA || !GR) return;
    const L = P.lut;
    u.tLutA.value = GR.lut(L.a);
    u.tLutB.value = GR.lut(L.b || L.a);
    u.uLutMix.value = L.b ? L.mix : 0;
  }
  function lutTarget() {
    const L = P.lut;
    return L.ctx && L.ctxW > 0.5 ? L.ctx : P.grade;
  }
  function lutUpdate(rd) {
    const L = P.lut;
    if (!P.feat.lutShader) return;
    const tgt = lutTarget();
    if (!L.b) {
      if (tgt !== L.a) {
        L.b = tgt;
        L.mix = 0;
      }
    } else if (tgt !== L.b) {
      if (tgt === L.a) {
        L.a = L.b;
        L.b = tgt;
        L.mix = 1 - L.mix;
      } else if (L.mix < 0.5) {
        L.b = tgt;
      } else {
        L.a = L.b;
        L.b = tgt;
        L.mix = 0;
      }
    }
    if (L.b) {
      L.mix =
        A.envSnap || G.SHOT
          ? 1
          : Math.min(1, L.mix + rd / Math.max(0.05, L.dur));
      if (L.mix >= 1) {
        L.a = L.b;
        L.b = null;
        L.mix = 0;
      }
    }
    lutBind();
  }

  function enable(on) {
    on = !!on && !P.failed;
    if (on && !P.rtScene) {
      try {
        build();
      } catch (e) {
        P.failed = true;
        on = false;
        console.warn("[atmosphere] post-fx disabled: " + (e && e.message));
      }
    }
    P.enabled = on;
    G.renderHook = on ? hook : null;
  }

  // ------------------------------------------------------------------
  function init() {
    // the world's colour grade is fixed to teal (not player-selectable); clear any old saved choice
    P.grade = "teal";
    try {
      localStorage.removeItem("nrc_grading");
    } catch (e) {
      /* ignore */
    }
    ATMOS.grading = P.grade;
    let want = A.quality !== "low";
    // post quality: explicit setting (nrc_postq) wins, else it follows the graphics quality
    P.postQ = A.quality === "low" ? 0 : A.quality === "medium" ? 1 : 2;
    try {
      const pq = POSTQ.indexOf(localStorage.getItem("nrc_postq"));
      if (pq >= 0) {
        P.postQ = pq;
        want = true;
      }
    } catch (e) {
      /* ignore */
    }
    if (G.QS && POSTQ.indexOf(G.QS.get("postq")) >= 0) {
      P.postQ = POSTQ.indexOf(G.QS.get("postq"));
      want = true;
    }
    ATMOS.postQuality = POSTQ[P.postQ];
    try {
      if (localStorage.getItem("nrc_postfx") === "0") want = false;
    } catch (e) {
      /* ignore */
    }
    if (G.QS && G.QS.get("postfx") === "0") want = false;
    if (!capable()) {
      P.failed = true;
      want = false;
      console.warn(
        "[atmosphere] no renderable half-float targets: plain rendering",
      );
    }
    try {
      if (localStorage.getItem("nrc_dynres") === "0") P.dyn.on = false;
    } catch (e) {
      /* ignore */
    }
    const qd = G.QS && G.QS.get("dynres");
    if (qd === "0") P.dyn.on = false;
    else if (qd && isFinite(+qd) && +qd >= 0.3 && +qd < 1) P.dyn.fixed = +qd; // testing: fixed render scale
    ATMOS.perfTier = -1;
    setTier();
    try {
      installAlphaGuard();
    } catch (e) {
      /* plain three state: no guard */
    }
    // testing: ?postoff=pud,water,rays switches single post features off (shots / A-B comparisons)
    const off = (G.QS && G.QS.get("postoff")) || "";
    if (off) {
      if (/pud/.test(off)) P.puddleOpt = false;
      if (/water/.test(off)) P.waterOpt = false;
      if (/rays/.test(off)) P.rayOpt = false;
      if (/ao/.test(off)) P.aoOpt = false;
      if (/aa/.test(off)) P.aaOpt = false;
      if (/dof/.test(off)) P.dofOpt = false;
      if (/cas|sharp/.test(off)) P.casOpt = false;
      if (/eye/.test(off)) P.eyeOpt = false;
      if (/vol/.test(off)) P.volOpt = false;
      if (/lut/.test(off)) P.fail.lut = "postoff";
      if (/grain/.test(off)) P.grain = 0;
    }
    // testing: ?postdof=2.5 forces a 2.5 m focus distance (dialogue-style depth of field in shots)
    const fd = G.QS && +G.QS.get("postdof");
    if (fd > 0 && A.postDOF) A.postDOF.force(fd);
    // testing: ?postfail=dof,aa,lut,comp simulates shader compile failures (fallback checks)
    const pf = (G.QS && G.QS.get("postfail")) || "";
    if (pf) {
      const _v = A.validateMaterial;
      A.validateMaterial = function (m, g) {
        const fs = (m && m.fragmentShader) || "";
        // (match DEFINITIONS, not call sites: the composite source always contains the #ifdef'd calls)
        if (
          /dof/.test(pf) &&
          (fs.indexOf("float dofCoc(") >= 0 ||
            fs.indexOf("uOverride") >= 0 ||
            fs.indexOf("scatter-as-gather") >= 0)
        )
          return false;
        if (/aa/.test(pf) && fs.indexOf("stepQ") >= 0) return false;
        if (
          /eye/.test(pf) &&
          (fs.indexOf("uKUp") >= 0 || fs.indexOf("float eyeFactor(") >= 0)
        )
          return false;
        if (/lut/.test(pf) && fs.indexOf("vec3 lutSample(") >= 0) return false;
        if (/comp/.test(pf) && fs.indexOf("uOutLuma") >= 0) return false;
        if (
          /vol/.test(pf) &&
          (fs.indexOf("float shadowLit(") >= 0 ||
            fs.indexOf("float volAt(") >= 0)
        )
          return false;
        if (/heat/.test(pf) && fs.indexOf("vec2 nrcDistort(") >= 0)
          return false;
        return _v.call(this, m, g);
      };
      A._postFailTest = pf;
    }
    enable(want);
    G.events.on("playerDamaged", (amt) => {
      P.damage = Math.min(1, P.damage + 0.3 + (amt || 0) / 30);
    });
    // crippled limb: a sharp red throb even at high HP
    G.events.on("limbCrippled", () => {
      P.damage = Math.min(1, P.damage + 0.8);
      P.beatPh = 0;
    });
    G.events.on("radsChanged", (rads, amt) => {
      if (amt > 0) P.rad = Math.min(1, P.rad + amt * 0.08);
    });
    G.events.on("resize", () => resize());
    G.events.on("reset", () => {
      P.damage = 0;
      P.rad = 0;
      P.dead = 0;
      P.flashAmt = 0;
      if (A.postDistort) A.postDistort.reset();
    });
  }

  function update(dt, realDt) {
    if (!P.enabled || !P.mats.comp) {
      // core may have dropped our hook after an exception → stay in plain mode
      return;
    }
    if (G.renderHook !== hook) {
      P.enabled = false;
      P.failed = true;
      return;
    }
    const u = P.mats.comp.uniforms,
      env = A.env,
      pl = G.player,
      st = G.state;
    const rd = realDt || 0.016;
    P.rdLast = rd;
    // effective post level: the chosen quality, capped by the live perf tier (tier 1 → medium, tier 2 → low)
    const lvl = Math.min(
      P.postQ,
      P.dyn.dynTier >= 2 ? 0 : P.dyn.dynTier === 1 ? 1 : 3,
    );
    P.level = lvl;
    const QS_ = QSET[lvl],
      F = P.feat;
    F.bloomLv = QS_.bloomLv;
    P.mats.bright.uniforms.uKaris.value = QS_.karis;
    F.fxaa = !!(
      P.mats.aa &&
      !P.fail.aa &&
      P.aaOpt !== false &&
      (QS_.aa === "fxaa" || (QS_.aa === "auto" && P.msaa === 0))
    );
    // contrast-adaptive sharpening (46_post_aa.js) rides in the same LDR pass; halved while the composite's own
    // upscale unsharp mask is active (dynamic resolution) so the two never stack into ringing
    const casBase =
      P.casOpt === false ? 0 : P.casStr !== undefined ? P.casStr : QS_.cas;
    P.casAmt =
      casBase * (P.mats.comp.uniforms.uSharpen.value > 0.001 ? 0.5 : 1);
    F.cas = !!(P.mats.aa && !P.fail.aa && P.casAmt > 0.01);
    F.aa = F.fxaa || F.cas;
    lutUpdate(rd);
    u.uTime.value = A.realTime;
    u.uExposure.value = G.renderer.toneMappingExposure;
    // bloom: stronger at night (neon!) and indoors
    u.uBloom.value =
      (P.baseBloom || 0.7) *
      (0.8 + 0.2 * env.night + (env.interior ? 0.2 : 0)) *
      (1 -
        0.15 * (A.wetShared && !env.interior ? A.wetShared.nrcWet.value.x : 0));
    // interiors: low threshold so emissive ceiling tubes / terminals bloom (bunkers, the cryo unit)
    const md = env.interior ? env.mood : null;
    P.wideW = env.interior ? 0.85 : 0.9 - 0.2 * env.night;
    P.mats.bright.uniforms.uHot.value = env.interior
      ? 3.0
      : 4.0 - 1.5 * env.night;
    const wetB = A.wetShared && !env.interior ? A.wetShared.nrcWet.value.x : 0;
    P.mats.bright.uniforms.uThreshold.value = env.interior
      ? (md && md.bloom) || 0.6
      : 1.2 + 0.2 * (1 - env.night) + 0.35 * wetB;
    u.uNight.value = env.night;
    // moodier framing indoors and at night (bunker corridors, subway tunnels)
    P.vigCur = A.damp(
      P.vigCur,
      P.vig + (env.interior ? 0.14 + ((md && md.vig) || 0) : 0.06 * env.night),
      2,
      rd,
    );
    u.uVignette.value = P.vigCur;
    // sun glare position
    u.uSunOn.value = 0;
    if (!env.interior && env.sunSize > 0.05 && env.sunY > -0.02 && G.camera) {
      const sp = _sunV
        .copy(G.camera.position)
        .addScaledVector(env.sunDir, 1500)
        .project(G.camera);
      if (sp.z < 1 && Math.abs(sp.x) < 1.3 && Math.abs(sp.y) < 1.3) {
        u.uSunUV.value.set(sp.x * 0.5 + 0.5, sp.y * 0.5 + 0.5);
        const W = A.weather ? A.weather.cur : null;
        u.uSunOn.value =
          (1 - Math.max(Math.abs(sp.x), Math.abs(sp.y)) / 1.3) *
          (W ? 1 - W.cloud * W.cloudDark : 1);
        u.uSunTint.value.copy(env.lightColor).multiplyScalar(0.6);
      }
    }
    updateRays(u, env, rd);
    // screen-space water reflections: outdoors, medium+
    P.waterRefl = !env.interior && QS_.water && P.waterOpt !== false;
    u.uWaterOn.value =
      P.waterRefl && A.water && A.water.visible !== false ? 1 : 0;
    if (u.uWaterOn.value && G.camera) {
      // screen height of the water plane's horizon (straight ahead, 3 km out)
      G.camera.getWorldDirection(_hz);
      _hz.y = 0;
      if (_hz.lengthSq() < 1e-6) _hz.set(0, 0, -1);
      _hz.normalize().multiplyScalar(3000).add(G.camera.position);
      _hz.y =
        G.world && G.world.waterLevel !== undefined ? G.world.waterLevel : -1.2;
      _hz.project(G.camera);
      u.uHorizonY.value = clamp(_hz.y * 0.5 + 0.5 + 0.01, -0.1, 1.1);
    }
    // step budget by level (same reach: fewer, longer steps on medium)
    const hi = lvl >= 2;
    u.uWaterN.value = hi ? 30 : 16;
    u.uWaterStep.value = hi ? 1 / 48 : 1 / 26;
    // rain puddles: depth-buffer SSR (needs the depth copy), outdoors, medium+
    const wet = A.wetShared ? A.wetShared.nrcWet.value : null;
    P.pudRefl = !!(
      P.depthValid &&
      !env.interior &&
      QS_.pud &&
      P.puddleOpt !== false &&
      wet &&
      wet.x > 0.05 &&
      G.camera
    );
    u.uPudOn.value = P.pudRefl ? 1 : 0;
    if (P.pudRefl) {
      const cam = G.camera;
      u.uPudN.value = hi ? 24 : 12;
      u.uProj.value.copy(cam.projectionMatrix);
      u.uInvProj.value.copy(cam.projectionMatrixInverse);
      u.uUpView.value.set(0, 1, 0).transformDirection(cam.matrixWorldInverse);
      u.uCamNF.value.set(cam.near, cam.far);
      u.uSkyRefl.value.copy(env.horizon).lerp(env.zenith, 0.35);
      if (P.rtDepth) u.tDepth.value = P.rtDepth.depthTexture;
    }
    // SSAO: medium 8 samples, high 12, ultra 16, low off. Contact shadow under cars, rubble and props, dark
    // wall/floor seams, window reveals and street-canyon corners; strongest indoors (bunkers, subway).
    P.aoWant = !!(
      P.mats.ao &&
      !P.aoFailed &&
      P.depthValid !== false &&
      P.rtDepth &&
      !P.depthFailed &&
      QS_.ao &&
      P.aoOpt !== false &&
      G.camera &&
      st !== "title"
    );
    if (P.aoWant) {
      const cam = G.camera,
        au = P.mats.ao.uniforms;
      au.uProj.value.copy(cam.projectionMatrix);
      au.uInvProj.value.copy(cam.projectionMatrixInverse);
      au.uCamNF.value.set(cam.near, cam.far);
      u.uCamNF.value.set(cam.near, cam.far);
      au.uN.value = QS_.aoN;
      au.uRadius.value = env.interior ? 0.75 : 0.9;
      au.uInt.value = env.interior ? 2.4 : 2.1;
      au.uFar.value = env.interior ? 60 : 150;
      au.uFogD.value =
        (G.scene && G.scene.fog && G.scene.fog.density) ||
        env.fogDensity ||
        0.0015;
      // outdoors the direct sun already carves form: a lighter hand by day, fuller at night / overcast / indoors
      const Wa = A.weather ? A.weather.cur : null;
      const overc = Wa ? clamp(Wa.cloud * Wa.cloudDark, 0, 1) : 0;
      u.uAOStr.value = env.interior
        ? 0.95
        : 0.62 + 0.25 * Math.max(env.night, overc);
    }
    // depth of field: dialogue close-ups (44_post_dof.js decides the profile)
    const dofOk = !!(
      A.postDOF &&
      P.mats.dofBlur &&
      F.dofShader &&
      !P.fail.dof &&
      P.dofOpt !== false &&
      P.rtDepth &&
      !P.depthFailed &&
      G.camera
    );
    const dw = dofOk ? A.postDOF.want(env, rd) : null;
    F.dof = !!dw;
    if (dw) {
      dw.n = QS_.dofN;
      P.dof = dw;
    }
    // volumetric light shafts (45_post_vol.js): medium+, outdoors, needs the depth copy and the sun's shadow map
    const VP = A.postVol;
    const volOk = !!(
      VP &&
      P.mats.vol &&
      F.volShader &&
      !P.fail.vol &&
      P.volOpt !== false &&
      QS_.vol &&
      P.rtDepth &&
      !P.depthFailed &&
      G.camera &&
      st !== "title" &&
      G.renderer.shadowMap.enabled
    );
    const vp = volOk
      ? VP.params(env, A.weather ? A.weather.cur : null, lvl)
      : null;
    P.volK = A.damp(P.volK || 0, vp ? 1 : 0, 3, rd);
    if (A.envSnap || G.SHOT) P.volK = vp ? 1 : 0;
    P.volWant = !!vp && P.volK > 0.01;
    if (P.volWant) {
      vp.col.multiplyScalar(P.volK);
      P.vol = vp;
    }
    // heat haze over fires + explosion blast waves (49_post_distort.js; all levels — a UV offset, no extra pass)
    if (F.distShader && A.postDistort && u.uHeatN) {
      A.postDistort.hook();
      const on = P.distOpt !== false && !P.fail.heat;
      if (on)
        P.distOn = A.postDistort.update(
          u,
          env,
          rd,
          !!(P.depthValid && P.rtDepth),
        );
      else {
        u.uHeatN.value = 0;
        u.uShockN.value = 0;
        P.distOn = false;
      }
      if (P.distOn && P.rtDepth) {
        u.tDepth.value = P.rtDepth.depthTexture;
        if (G.camera) u.uCamNF.value.set(G.camera.near, G.camera.far);
      }
    }
    // eye adaptation (48_post_eye.js): meter what the player looks at, adapt faster to light than to dark
    const EY = A.postEye;
    F.eye = !!(
      EY &&
      EY.S.on &&
      P.mats.eye &&
      F.eyeShader &&
      !P.fail.eye &&
      P.eyeOpt !== false &&
      st !== "title"
    );
    if (F.eye) {
      const ep = EY.params(env),
        eu = P.mats.eye.uniforms;
      // meter against the BASE exposure (without the lighting's cryo-exit glare boost, which must stay visible)
      eu.uExpo.value =
        (A.exposure || G.renderer.toneMappingExposure || 1) / 0.6;
      eu.uKUp.value = 1 - Math.exp(-rd / 0.45);
      eu.uK.value = 1 - Math.exp(-rd / 1.4);
      eu.uFirst.value =
        EY.consumeSnap() || G.SHOT || G.SMOKE || P.eyeWasOff ? 1 : 0;
      eu.uSkyW.value = ep.skyW;
      const cu = u;
      if (cu.uEye) {
        cu.uEye.value.set(cu.uEye.value.x, ep.key, ep.k, ep.lo);
        cu.uEyeHi.value = ep.hi;
      }
    }
    P.eyeWasOff = !F.eye;
    // ?eyedebug=1: live meter numbers in a corner readout (GPU readback twice a second — testing only)
    if (G.QS && G.QS.get("eyedebug") && (A.realTime || 0) > (P.eyeDbgT || 0)) {
      P.eyeDbgT = (A.realTime || 0) + 0.5;
      try {
        let el = document.getElementById("nrc-eye-debug");
        if (!el) {
          el = document.createElement("div");
          el.id = "nrc-eye-debug";
          el.style.cssText =
            "position:fixed;left:6px;top:6px;z-index:99999;font:13px monospace;color:#9f9;background:rgba(0,0,0,.6);padding:2px 5px;pointer-events:none";
          document.body.appendChild(el);
        }
        el.textContent =
          "EYE " +
          JSON.stringify(ATMOS.eyeInfo()) +
          " exp=" +
          (A.exposure || 0).toFixed(3) +
          " POST " +
          JSON.stringify(ATMOS.postInfo());
      } catch (e) {
        /* ignore */
      }
    }
    // context look: a cool clinical blue inside the cryo units (blended in over ~1 s)
    // + region / weather imagespaces (42_post_grade.js MODS, layered on the player's grade): The Neon after dark,
    //   dust storms, rain / fog, subway tunnels. Weather looks fade over ~6 s, districts ~2.5 s, interiors snap.
    // bake the current grade's region/weather looks in idle play time (one ≈10 ms LUT every 1.5 s) → no hitch later
    if (
      F.lutShader &&
      A.postGrade &&
      A.postGrade.cached &&
      st === "play" &&
      P.grade !== "none" &&
      (A.realTime || 0) > (P.bakeT || 0)
    ) {
      P.bakeT = (A.realTime || 0) + 1.5;
      for (const m of ["neon", "dust", "rain", "metro"]) {
        const n = P.grade + "+" + m;
        if (!A.postGrade.cached(n)) {
          A.postGrade.lut(n);
          break;
        }
      }
    }
    const L = P.lut,
      ctx = contextLook(env);
    if (ctx !== L.ctx) {
      const prevT = lutTarget();
      L.ctx = ctx;
      L.ctxW = ctx ? 1 : 0;
      if (lutTarget() !== prevT) L.dur = P.ctxDur || 1.2;
    }
    // rad-weather grade (preset rad > 0 only; outdoors only; follows the storm's blend-in)
    const Wc = A.weather ? A.weather.cur : null;
    P.storm = A.damp(
      P.storm || 0,
      !env.interior && Wc ? clamp(Wc.rad, 0, 1) : 0,
      3,
      rd,
    );
    if (A.envSnap || G.SHOT)
      P.storm = !env.interior && Wc ? clamp(Wc.rad, 0, 1) : 0;
    // the toxic grade surges in slow pulses and jumps with every lightning flash
    const sT = A.realTime || 0,
      sp = 0.5 + 0.5 * Math.sin(sT * 0.83) * Math.sin(sT * 0.31 + 1.3);
    u.uStorm.value =
      P.storm * (0.8 + 0.3 * sp + 0.35 * clamp(env.flash || 0, 0, 1));
    // health
    let hurtT = 0;
    // the world starts draining of colour around half health and is fully "hurt" at 10 %
    if (pl && pl.maxHp > 0 && pl.alive) {
      const f = pl.hp / pl.maxHp;
      hurtT = clamp((0.5 - f) / 0.4, 0, 1);
      hurtT = hurtT * (0.7 + 0.3 * hurtT);
    }
    P.hurt = A.damp(P.hurt, hurtT, 3, rd);
    u.uHurt.value = P.hurt;
    // heartbeat: 70 → 125 bpm as health drops; "lub" then a softer "dub"
    if (P.hurt > 0.001 || P.damage > 0.001) {
      P.beatPh = (P.beatPh + (rd * (70 + 55 * P.hurt)) / 60) % 1;
      const ph = P.beatPh,
        b1 = (ph - 0.04) / 0.045,
        b2 = (ph - 0.23) / 0.055;
      u.uBeat.value = Math.exp(-b1 * b1) + 0.6 * Math.exp(-b2 * b2);
    } else u.uBeat.value = 0;
    P.damage = Math.max(0, P.damage - rd * 2.2);
    u.uDamage.value = P.damage;
    // radiation: event pulses + steady when in a hot zone
    const rr = pl ? pl.radRate || 0 : 0;
    P.rad = Math.max(
      rr > 0.05 ? Math.min(0.5, rr * 0.08) : 0,
      P.rad - rd * 1.5,
    );
    u.uRad.value = P.rad;
    // menus / death
    const menu =
      st === "paused" || st === "goggles"
        ? 1
        : st === "levelup" || st === "barter" || st === "container"
          ? 0.5
          : 0;
    P.menu = A.damp(P.menu, menu, 8, rd);
    u.uMenuDim.value = P.menu;
    P.dead = A.damp(
      P.dead,
      st === "dead" || (pl && !pl.alive) ? 1 : 0,
      1.2,
      rd,
    );
    u.uDead.value = P.dead;
    // flashes: nuke (set by fx) + close lightning
    P.flashAmt = Math.max(0, P.flashAmt - rd * P.flashDecay);
    const lf = env.flash > 0.6 && !env.interior ? (env.flash - 0.6) * 0.25 : 0;
    u.uFlashAmt.value = Math.max(P.flashAmt, lf);
    u.uFlashCol.value.copy(
      P.flashAmt >= lf
        ? P.flashCol
        : A.weather
          ? A.weather.cur.flashColor
          : P.flashCol,
    );
    dynUpdate(rd, st);
    // performance watchdog: drop MSAA when struggling
    if (!G.SMOKE && !G.SHOT && st === "play" && G.stats && G.stats.fps > 0) {
      if (G.stats.fps < 24) P.fpsLow += realDt;
      else P.fpsLow = Math.max(0, P.fpsLow - realDt * 0.5);
      if (P.fpsLow > 6 && P.msaa > 0) {
        P.fpsLow = 0;
        setMSAA(0);
        console.warn("[atmosphere] low fps → MSAA off");
      }
    }
  }

  // ------------------------------------------------------------------
  // Context look (an "imagespace" per region / weather): returns a LUT name or null (= the user grade).
  // Hysteresis on every trigger so a look never flickers at a threshold. Sets P.ctxDur (blend seconds).
  // ------------------------------------------------------------------
  function contextLook(env) {
    const GR = A.postGrade;
    if (!GR || P.grade === "none" || !P.feat.lutShader || P.ctxOpt === false)
      return null;
    const cur = P.lut.ctx || "",
      key = ATMOS.interiorKey || "";
    const mod = (m) => (GR.has(P.grade + "+" + m) ? P.grade + "+" + m : null);
    if (env.interior) {
      P.ctxDur = 0.6;
      if (/cryo/i.test(key) && GR.has("cryo")) return "cryo";
      if (/subway|metro|tunnel/i.test(key)) return mod("metro");
      if (/neon/i.test(key)) return mod("neon");
      return null;
    }
    const W = A.weather ? A.weather.cur : null;
    if (W) {
      const isDust = /\+dust$/.test(cur),
        isRain = /\+rain$/.test(cur);
      if (W.dust > (isDust ? 0.35 : 0.55) && W.rad < 0.3) {
        P.ctxDur = 6;
        return mod("dust");
      }
      if (
        W.rad < 0.3 &&
        (W.rain > (isRain ? 0.3 : 0.5) || W.fogMul > (isRain ? 2.6 : 3.0))
      ) {
        P.ctxDur = 6;
        return mod("rain");
      }
    }
    // The Neon (Times Square) after dark
    let ts = P._tsLoc;
    if (ts === undefined) {
      try {
        ts = P._tsLoc =
          (G.LAYOUT &&
            G.LAYOUT.getLocation &&
            G.LAYOUT.getLocation("times_square")) ||
          null;
      } catch (e) {
        ts = P._tsLoc = null;
      }
    }
    if (ts) {
      const isNeon = /\+neon$/.test(cur);
      const d = Math.hypot(A.camPos.x - ts.x, A.camPos.z - ts.z);
      if (
        d < (ts.r || 55) + (isNeon ? 40 : 20) &&
        env.night > (isNeon ? 0.25 : 0.4)
      ) {
        P.ctxDur = 2.5;
        return mod("neon");
      }
    }
    return null;
  }

  // ------------------------------------------------------------------
  // Light shafts: which light (sun by day, moon at night), where it is on screen, how strong.
  // Strength follows the haze (forward scatter), is strongest with a low sun (dawn/dusk through the
  // ruins, the cryo-exit glare), dims under a thick overcast and fades as the light leaves the view.
  // ------------------------------------------------------------------
  const _rayC = new THREE.Color();
  function updateRays(u, env, rd) {
    let want = 0;
    const W = A.weather ? A.weather.cur : null;
    if (
      !env.interior &&
      G.camera &&
      P.rtRays &&
      QSET[P.level].rays &&
      !P.fail.rays &&
      P.rayOpt !== false
    ) {
      const day = env.sunY > -0.03;
      const dir = day ? env.sunDir : env.moonDir;
      if (dir.y > -0.05) {
        const sp = _sunV
          .copy(G.camera.position)
          .addScaledVector(dir, 1500)
          .project(G.camera);
        const m = Math.max(Math.abs(sp.x), Math.abs(sp.y));
        if (sp.z < 1 && m < 2.2) {
          const onView = 1 - A.smooth(0.9, 2.2, m);
          const cloud = W ? W.cloud * W.cloudDark : 0;
          const lowSun = 1 - A.smooth(0.08, 0.6, dir.y);
          const haze =
            1 + (W ? W.dust * 0.8 + W.rad * 0.5 + (W.fogMul - 1) * 0.15 : 0);
          if (day) {
            want =
              onView *
              (0.55 + 0.75 * lowSun) *
              (1 - 0.8 * cloud) *
              Math.min(1, env.sunSize + 0.2) *
              haze;
            want *= A.smooth(-0.03, 0.04, env.sunY);
            _rayC.copy(env.lightColor);
          } else {
            want =
              onView *
              0.35 *
              (1 - 0.9 * cloud) *
              A.smooth(0.02, 0.2, dir.y) *
              env.night;
            _rayC.setRGB(0.55, 0.68, 0.85);
          }
          P.mats.rays.uniforms.uSun.value.set(
            sp.x * 0.5 + 0.5,
            sp.y * 0.5 + 0.5,
          );
          // mask threshold just under the sky brightness around the light: only the bright halo streams
          const hz = env.horizon,
            zl = hz.r * 0.2126 + hz.g * 0.7152 + hz.b * 0.0722;
          P.mats.rays.uniforms.uThresh.value = day
            ? zl * 0.55
            : zl * 0.9 + 0.02;
          P.mats.rays.uniforms.uFall.value = day
            ? 1.5 + 1.5 * (1 - lowSun)
            : 3.0;
          P.mats.rays.uniforms.uTime.value = A.realTime;
        }
      }
    }
    P.rayK = A.damp(P.rayK, want, 4, rd);
    if (A.envSnap || G.SHOT) P.rayK = want;
    P.raysOn = P.rayK > 0.01;
    if (P.raysOn) u.uRayCol.value.copy(_rayC).multiplyScalar(P.rayK * 3.0);
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  /** Grading preset 'olive' | 'amber' | 'teal' | 'none'. The game keeps 'teal' (fixed, not a player setting);
   *  this stays for debugging only and is not persisted. With the LUT path it cross-fades over opts.blend seconds. */
  ATMOS.setGrading = function (name, opts) {
    if (!GRADES[name]) return false;
    const bl = opts && opts.blend !== undefined ? +opts.blend : 1.2;
    P.lut.dur = Math.max(0.05, bl || 0.05);
    applyGrade(name, bl <= 0);
    return true;
  };
  ATMOS.getGrading = () => P.grade;
  ATMOS.gradings = () => Object.keys(GRADES);
  ATMOS.setPostFX = function (on) {
    enable(on);
    try {
      localStorage.setItem("nrc_postfx", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    return P.enabled;
  };
  ATMOS.isPostFX = () => P.enabled;
  /** Full-screen colour flash (nuke white-out etc). amount 0..1, decays in `dur` seconds. */
  ATMOS.screenFlash = function (amount, color, dur) {
    P.flashAmt = Math.max(P.flashAmt, clamp(amount || 1, 0, 1));
    P.flashCol.copy(A.color(color || 0xffffff));
    P.flashDecay = 1 / Math.max(0.05, dur || 0.5);
  };
  /** 'damage' | 'rad' pulse for UI-driven effects. */
  ATMOS.pulse = function (type, amt) {
    amt = amt === undefined ? 0.6 : amt;
    if (type === "damage") P.damage = Math.min(1, P.damage + amt);
    else if (type === "rad") P.rad = Math.min(1, P.rad + amt);
  };
  /** Post effect knobs (0..1 scalars): {vignette, grain, ca, bloom, sharpen: 0..1|false, rays:bool, waterReflections:bool,
   *  puddleReflections:bool, ao:bool, aa:bool (FXAA), dof:bool, eye:bool (eye adaptation)} */
  ATMOS.setPostParams = function (o) {
    if (!P.mats.comp || !o) return;
    const u = P.mats.comp.uniforms;
    if (o.rays !== undefined) P.rayOpt = !!o.rays;
    if (o.waterReflections !== undefined) P.waterOpt = !!o.waterReflections;
    if (o.puddleReflections !== undefined) P.puddleOpt = !!o.puddleReflections;
    if (o.ao !== undefined) P.aoOpt = !!o.ao;
    if (o.vignette !== undefined) {
      P.vig = o.vignette;
      u.uVignette.value = o.vignette;
    }
    if (o.grain !== undefined) P.grain = Math.max(0, +o.grain || 0);
    if (o.aa !== undefined) P.aaOpt = !!o.aa;
    if (o.dof !== undefined) P.dofOpt = !!o.dof;
    if (o.sharpen !== undefined) {
      if (o.sharpen === false) P.casOpt = false;
      else {
        P.casOpt = true;
        P.casStr = clamp(+o.sharpen || 0, 0, 1);
      }
    }
    if (o.eye !== undefined) P.eyeOpt = !!o.eye;
    if (o.looks !== undefined) P.ctxOpt = !!o.looks;
    if (o.volumetric !== undefined) P.volOpt = !!o.volumetric;
    if (o.heatHaze !== undefined) P.distOpt = !!o.heatHaze;
    if (o.ca !== undefined) u.uCA.value = o.ca;
    if (o.bloom !== undefined) P.baseBloom = o.bloom;
  };
  /** 'low' (no post, 1024 shadows) | 'medium' (post, no MSAA) | 'high' */
  ATMOS.setQuality = function (q) {
    if (["low", "medium", "high"].indexOf(q) < 0) return false;
    A.quality = ATMOS.quality = q;
    try {
      localStorage.setItem("nrc_gfx_quality", q);
    } catch (e) {
      /* ignore */
    }
    if (ATMOS.setShadowQuality) ATMOS.setShadowQuality(q);
    // the post level follows the graphics quality (an explicit setPostQuality afterwards overrides it)
    P.postQ = q === "low" ? 0 : q === "medium" ? 1 : 2;
    ATMOS.postQuality = POSTQ[P.postQ];
    try {
      localStorage.removeItem("nrc_postq");
    } catch (e) {
      /* ignore */
    }
    if (P.rtScene) setMSAA(wantMSAA());
    enable(q !== "low");
    setTier();
    armWatch();
    return true;
  };
  /**
   * Post-processing quality (persisted, independent of shadows/LOD):
   *  'low'    grade LUT, 3-level Karis bloom, vignette/grain, FXAA; no AO / light shafts / SSR
   *  'medium' + SSAO (8), light shafts, water + puddle SSR (short), DOF 20 taps, FXAA
   *  'high'   + MSAA 4× (WebGL2; FXAA only if MSAA is unavailable), SSAO 12, full SSR, DOF 28
   *  'ultra'  + FXAA on top of MSAA (foliage / wires / specular), SSAO 16, DOF 40
   * The live perf tier still limits the effective level (tier 1 → medium, tier 2 → low).
   * Turns post-fx on if it was off (unless it failed); use setPostFX(false) for plain rendering.
   */
  ATMOS.setPostQuality = function (q) {
    const i = POSTQ.indexOf(q);
    if (i < 0) return false;
    P.postQ = i;
    ATMOS.postQuality = q;
    try {
      localStorage.setItem("nrc_postq", q);
    } catch (e) {
      /* ignore */
    }
    if (P.rtScene) setMSAA(wantMSAA());
    if (!P.enabled && !P.failed) enable(true);
    armWatch();
    return P.enabled;
  };
  ATMOS.getPostQuality = () => POSTQ[P.postQ];
  ATMOS.postQualities = () => POSTQ.slice();
  /** Force a depth-of-field focus distance in metres (cutscenes, photo mode); 0 / null = automatic. */
  ATMOS.setDOF = function (dist) {
    if (A.postDOF) A.postDOF.force(+dist || 0);
  };
  /** What the post stack is doing right now (debug / settings UI / smoke). */
  ATMOS.postInfo = function () {
    const F = P.feat;
    return {
      enabled: P.enabled,
      failed: P.failed,
      quality: POSTQ[P.postQ],
      level: POSTQ[P.level],
      msaa: P.msaa,
      passes: {
        ao: P.aoWant && P.depthValid ? P.aoKind || "ssao" : false,
        bloomLevels: F.bloomLv || 0,
        rays: !!P.raysOn,
        water: !!P.waterRefl,
        puddles: !!P.pudRefl,
        dof: !!F.dof,
        aa:
          (F.fxaa ? "fxaa" : "") +
          (P.msaa
            ? (F.fxaa ? "+" : "") + "msaa" + P.msaa
            : F.fxaa
              ? ""
              : "none"),
        lut: !!F.lutShader,
        grade: P.grade,
        lutBlend: P.lut.b ? [P.lut.a, P.lut.b, +P.lut.mix.toFixed(2)] : P.lut.a,
        look: lutTarget(),
        eye: !!F.eye,
        sharpen: F.cas ? +(P.casAmt || 0).toFixed(2) : 0,
        heat: P.feat.distShader
          ? P.distOn && A.postDistort.S.last
            ? A.postDistort.S.last
            : "idle"
          : false,
        volumetric:
          P.volWant && P.vol
            ? {
                steps: P.vol.steps,
                res: "1/" + P.vol.div,
                dens: +P.vol.dens.toFixed(4),
              }
            : false,
      },
      failed_passes: Object.assign({}, P.fail),
      depthCopy: !!P.depthValid,
      scale: ATMOS.renderScale(),
    };
  };
  /** Eye adaptation (auto-exposure metering, 48_post_eye.js) on/off — persisted (nrc_eye). */
  ATMOS.setEyeAdaptation = function (on) {
    const EY = A.postEye;
    if (!EY) return false;
    EY.S.on = !!on;
    try {
      localStorage.setItem("nrc_eye", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (on) EY.snap();
    return EY.S.on;
  };
  /** {on, adapted, current, factor, key, k} — adapted/current = metered post-exposure log-average luminance.
   *  Reads 1 pixel back from the GPU (debug / tests only, not per frame). */
  ATMOS.eyeInfo = function () {
    const EY = A.postEye;
    if (
      !EY ||
      !P.rtEye ||
      !P.feat.eye ||
      !P.mats.comp ||
      !P.mats.comp.uniforms.uEye
    )
      return { on: false, failed: P.fail.eye || null };
    const v = EY.readback(G.renderer, P.rtEye[P.eyeIdx]);
    const e = P.mats.comp.uniforms.uEye.value,
      hi = P.mats.comp.uniforms.uEyeHi.value;
    const f = v
      ? clamp(Math.pow(e.y / Math.max(1e-4, v.adapted), e.z), e.w, hi)
      : null;
    return {
      on: true,
      adapted: v && +v.adapted.toFixed(4),
      current: v && +v.current.toFixed(4),
      factor: f && +f.toFixed(3),
      key: +e.y.toFixed(3),
      k: +e.z.toFixed(3),
      range: [+e.w.toFixed(2), +hi.toFixed(2)],
    };
  };
  /** Dynamic resolution on/off (persisted). Off → full-resolution scene target. */
  ATMOS.setDynamicResolution = function (on) {
    P.dyn.on = !!on;
    try {
      localStorage.setItem("nrc_dynres", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (!on) {
      P.dyn.dynTier = 0;
      setScale(1);
      setTier();
    }
    return P.dyn.on;
  };
  /** Current scene render scale (0.6..1) — 1 when post-fx is off. */
  ATMOS.renderScale = () => (P.enabled ? P.dyn.fixed || P.dyn.scale : 1);
  /** {scale, avgMs, tier, lodScale, shadow} for debug overlays. */
  ATMOS.perfStats = () => ({
    scale: ATMOS.renderScale(),
    avgMs: +P.dyn.avgMs.toFixed(1),
    tier: ATMOS.perfTier,
    lodScale: ATMOS.lodScale,
    dynres: P.dyn.on,
    shadow: ATMOS.shadowInfo ? ATMOS.shadowInfo() : null,
  });

  A.addSystem({ name: "postfx", order: 90, init, update });
})();
