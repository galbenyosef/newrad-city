/* src/atmosphere/46_post_aa.js */
/* =====================================================================
 * ATMOSPHERE — post: anti-aliasing + final film grain (render_post)
 * FXAA 3.11-style (quality preset: 12-step edge search, sub-pixel blend 0.75)
 * on the graded LDR frame. The composite writes perceptual luma into alpha
 * for it. Runs whenever MSAA is off (medium / low, dynamic-resolution
 * upscales) and on 'ultra' on top of MSAA (alpha-tested foliage, fences,
 * cables, specular shimmer that MSAA can't touch).
 * Film grain is added here, AFTER the AA (grain edges would otherwise be
 * detected and smeared): triangular-distribution LUMINANCE grain (no chroma
 * noise), refreshed at 24 fps like a film print, strongest in the lower mids,
 * a touch stronger at night.
 * CONTRAST-ADAPTIVE SHARPENING (AMD CAS-style, luma only): texture detail
 * inside surfaces (brick, rust, signage, faces) gets back the crispness that
 * FXAA, the dynamic-resolution upscale and bilinear mip filtering take away.
 * Pixels FXAA treats as edges are anti-aliased instead, never both. The
 * sharpened luma is clamped to the local 3×3 min/max (no halos, no ringing)
 * and applied as a brightness RATIO (hue can't shift → no coloured specks),
 * bounded to −20 %…+25 % and faded out on highlights. Runs on every level:
 * on 'high' (MSAA, no FXAA) the pass runs as sharpen + grain only.
 * Exposes A.postAA = { FXAA, GRAIN_GLSL }.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._;

  // shared by the composite (when AA is off) and the AA pass. uGrain, uTime, uNight, uRes must exist.
  const GRAIN_GLSL = `
    float grainHash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    vec3 filmGrain(vec3 c, vec2 fragXY){
      if (uGrain <= 0.0) return c;
      float fr = floor(uTime * 24.0);                        // film cadence, not per-frame fizz
      vec2 p = floor(fragXY / 1.25) + fr * vec2(37.0, 17.0);  // grain a little larger than a pixel
      float n = grainHash(p) + grainHash(p + 71.3) - 1.0;    // triangular −1..1
      float L = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float resp = (0.35 + 0.8 * L * (1.0 - L)) * (1.0 - smoothstep(0.75, 1.0, L) * 0.6);   // lower mids, fading in highlights
      float k = uGrain * resp * (1.0 + uNight * 0.5);
      // luminance-only grain (the faint chroma component was dropped: no coloured specks, user report 2026-09-27)
      return c + vec3(n) * k;
    }
  `;

  const FXAA = `
    uniform sampler2D tSrc; uniform vec2 uTexel, uRes; uniform float uGrain, uTime, uNight, uAA, uSharp;
    varying vec2 vUv;
    ${GRAIN_GLSL}
    float Lu(vec2 uv){ return texture2D(tSrc, uv).a; }
    float stepQ(int i){ return i < 5 ? 1.0 : (i == 5 ? 1.5 : (i < 10 ? 2.0 : (i == 10 ? 4.0 : 8.0))); }
    // CAS (luma only): alpha holds sqrt(perceptual luma) → the luma ratio is the square of the alpha ratio
    vec3 cas(vec3 c, float lM, float lN, float lS, float lE, float lW, float lNW, float lNE, float lSW, float lSE){
      if (uSharp <= 0.0 || lM < 0.02) return c;
      float mn = min(min(min(lN, lS), min(lE, lW)), lM), mx = max(max(max(lN, lS), max(lE, lW)), lM);
      float mn2 = min(mn, min(min(lNW, lNE), min(lSW, lSE))), mx2 = max(mx, max(max(lNW, lNE), max(lSW, lSE)));
      mn += mn2; mx += mx2;                                               // AMD CAS: cross + 3×3 ring
      float amp = sqrt(clamp(min(mn, 2.0 - mx) / max(mx, 1e-4), 0.0, 1.0));
      float w = -amp * mix(0.125, 0.2, clamp(uSharp, 0.0, 1.0));          // CAS peak
      float ls = (lM + w * (lN + lS + lE + lW)) / (1.0 + 4.0 * w);
      ls = clamp(ls, mn2, mx2);                                            // never beyond the local range: no halos
      float ratio = (ls * ls) / max(lM * lM, 1e-5);
      ratio = clamp(ratio, 0.8, 1.25);
      ratio = mix(ratio, 1.0, smoothstep(0.82, 0.97, lM));                // leave highlights (glows, flashes) alone
      return c * ratio;
    }
    vec3 fxaa(vec2 uv, vec2 t){
      vec4 cM = texture2D(tSrc, uv);
      float lM = cM.a;
      float lN = Lu(uv + vec2(0.0, t.y)), lS = Lu(uv - vec2(0.0, t.y));
      float lE = Lu(uv + vec2(t.x, 0.0)), lW = Lu(uv - vec2(t.x, 0.0));
      float mx = max(max(max(lN, lS), max(lE, lW)), lM), mn = min(min(min(lN, lS), min(lE, lW)), lM);
      float range = mx - mn;
      float lNW = Lu(uv + vec2(-t.x, t.y)), lNE = Lu(uv + t), lSW = Lu(uv - t), lSE = Lu(uv + vec2(t.x, -t.y));
      // not an edge (or AA off): sharpen the texture detail instead
      if (uAA < 0.5 || range < max(0.0312, mx * 0.125)) return cas(cM.rgb, lM, lN, lS, lE, lW, lNW, lNE, lSW, lSE);
      float lNS = lN + lS, lWE = lW + lE;
      float eH = abs(lNW + lNE - 2.0 * lN) + abs(lWE - 2.0 * lM) * 2.0 + abs(lSW + lSE - 2.0 * lS);
      float eV = abs(lNW + lSW - 2.0 * lW) + abs(lNS - 2.0 * lM) * 2.0 + abs(lNE + lSE - 2.0 * lE);
      bool horz = eH >= eV;
      float l1 = horz ? lS : lW, l2 = horz ? lN : lE;
      float g1 = abs(l1 - lM), g2 = abs(l2 - lM);
      bool steep1 = g1 >= g2;
      float gS = 0.25 * max(g1, g2);
      float stepLen = horz ? t.y : t.x;
      float lAvgL;
      if (steep1) { stepLen = -stepLen; lAvgL = 0.5 * (l1 + lM); } else lAvgL = 0.5 * (l2 + lM);
      vec2 cuv = uv;
      if (horz) cuv.y += stepLen * 0.5; else cuv.x += stepLen * 0.5;
      vec2 off = horz ? vec2(t.x, 0.0) : vec2(0.0, t.y);
      vec2 uv1 = cuv - off, uv2 = cuv + off;
      float e1 = Lu(uv1) - lAvgL, e2 = Lu(uv2) - lAvgL;
      bool r1 = abs(e1) >= gS, r2 = abs(e2) >= gS;
      if (!r1) uv1 -= off;
      if (!r2) uv2 += off;
      for (int i = 2; i < 12; i++) {
        if (r1 && r2) break;
        float q = stepQ(i);
        if (!r1) { e1 = Lu(uv1) - lAvgL; r1 = abs(e1) >= gS; if (!r1) uv1 -= off * q; }
        if (!r2) { e2 = Lu(uv2) - lAvgL; r2 = abs(e2) >= gS; if (!r2) uv2 += off * q; }
      }
      float d1 = horz ? uv.x - uv1.x : uv.y - uv1.y;
      float d2 = horz ? uv2.x - uv.x : uv2.y - uv.y;
      bool dir1 = d1 < d2;
      float dmin = min(d1, d2);
      float pixOff = -dmin / max(d1 + d2, 1e-6) + 0.5;
      bool correct = ((dir1 ? e1 : e2) < 0.0) != (lM < lAvgL);
      float fOff = correct ? pixOff : 0.0;
      float lAvg = (1.0 / 12.0) * (2.0 * (lNS + lWE) + lNW + lNE + lSW + lSE);
      float s1 = clamp(abs(lAvg - lM) / range, 0.0, 1.0);
      float s2 = (-2.0 * s1 + 3.0) * s1 * s1;
      fOff = max(fOff, s2 * s2 * 0.75);
      vec2 fuv = uv;
      if (horz) fuv.y += fOff * stepLen; else fuv.x += fOff * stepLen;
      return texture2D(tSrc, fuv).rgb;
    }
    void main(){
      vec3 c = uAA > 0.5 || uSharp > 0.0 ? fxaa(vUv, uTexel) : texture2D(tSrc, vUv).rgb;
      gl_FragColor = vec4(clamp(filmGrain(c, gl_FragCoord.xy), 0.0, 1.0), 1.0);
    }
  `;

  A.postAA = { FXAA, GRAIN_GLSL };
})();
