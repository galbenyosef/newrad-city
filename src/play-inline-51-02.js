// play-inline-51 02 — the
// Lines 21-251 of readable/play-inline-51.pretty.js (statement-aligned).
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
