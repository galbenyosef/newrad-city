// play-inline-51 03 — composite
// Lines 252-603 of readable/play-inline-51.pretty.js (statement-aligned).
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
