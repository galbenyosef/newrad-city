/* src/atmosphere/48_post_eye.js */
/* =====================================================================
 * ATMOSPHERE — post: eye adaptation / auto-exposure metering (render_post)
 *
 * Eye adaptation on top of atmosphere's hand-tuned exposure
 * keyframes (14_lighting.js keeps the per-time / per-interior base exposure
 * and the cryo-exit glare). This pass only corrects what the keyframes can't
 * know: WHERE the player looks.
 *   * staring out of a dark subway mouth at a sunlit avenue → the street
 *     blooms bright and settles over ~½ s;
 *   * stepping into a black alley / looking into an unlit doorway at noon →
 *     the shadows open up over ~1½ s (eyes adapt to the dark more slowly);
 *   * night stays night (a lower key), bright neon plazas are pulled back a
 *     little so the tubes keep their colour.
 *
 *   meter   1×1 half-float pass, ping-ponged: 96 centre-weighted log-luminance
 *           taps of the HDR scene × the base exposure (sky counts half, hot
 *           pixels are capped, so the sun can't black out the street), then
 *           asymmetric temporal smoothing (brighter: τ 0.45 s, darker: τ 1.4 s).
 *           No CPU readback, no stall.
 *   apply   the composite scales the scene by clamp((key / L̄)^k, lo, hi)
 *           right before the ACES tone curve.
 *
 * Exposes A.postEye = { METER, APPLY_GLSL, params(env) }.
 * Public: G.atmos.setEyeAdaptation(bool) (persisted nrc_eye), G.atmos.eyeInfo().
 * Test: ?eye=0 off, ?eyedebug=1 → live numbers in a small corner readout.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._ || !THREE) return;
  const A = G.atmos._;

  // tSrc = HDR scene, tPrev = last adapted value (r = adapted log L, g = this frame's log L)
  const METER = `
    uniform sampler2D tSrc, tPrev; uniform float uExpo, uK, uKUp, uFirst, uSkyW;
    varying vec2 vUv;
    void main(){
      float acc = 0.0, ws = 0.0;
      for (int j = 0; j < 8; j++) {
        for (int i = 0; i < 12; i++) {
          // a slightly jittered 12×8 grid over the central 90 % of the frame
          vec2 g = (vec2(float(i), float(j)) + 0.5 + 0.18 * vec2(sin(float(j) * 2.1), cos(float(i) * 1.7))) / vec2(12.0, 8.0);
          vec2 uv = mix(vec2(0.5), g, 0.9);
          vec2 d = (uv - vec2(0.5, 0.54)) * vec2(1.0, 1.35);
          float w = exp(-dot(d, d) * 3.2);                     // centre-weighted (what the player looks at)
          vec4 s = texture2D(tSrc, uv);
          vec3 c = s.rgb;
          #if __VERSION__ >= 300
            if (any(isnan(c)) || any(isinf(c))) c = vec3(1.0);
          #endif
          float l = dot(clamp(c, 0.0, 16.0), vec3(0.2126, 0.7152, 0.0722)) * uExpo;
          w *= mix(uSkyW, 1.0, step(0.2, s.a));                // open sky (alpha 0) counts less
          acc += log(max(l, 0.002)) * w; ws += w;
        }
      }
      float m = acc / max(ws, 1e-4);
      float p = texture2D(tPrev, vec2(0.5)).r;
      bool bad = !(p > -20.0 && p < 20.0);                    // first frame / NaN guard
      float k = m > p ? uKUp : uK;
      gl_FragColor = vec4(uFirst > 0.5 || bad ? m : mix(p, m, k), m, 0.0, 1.0);
    }
  `;

  // composite side: uEye = (on, key, strength, lo), uEyeHi = hi
  const APPLY_GLSL = `
    uniform sampler2D tEye; uniform vec4 uEye; uniform float uEyeHi;
    float eyeFactor(){
      if (uEye.x < 0.5) return 1.0;
      float la = texture2D(tEye, vec2(0.5)).r;
      if (!(la > -20.0 && la < 20.0)) return 1.0;
      return clamp(pow(uEye.y / exp(la), uEye.z), uEye.w, uEyeHi);
    }
  `;

  // Per-context tuning. key = the post-exposure log-average the eye settles to (ACES input). CALIBRATED on real views
  // (round 2, `?eyedebug=1`): 5th Ave noon street L̄ ≈ 0.065, The Neon 23:00 ≈ 0.042, Cryo Unit C-9 corridor ≈ 0.116 →
  // the keys below put those "reference" views at a factor ≈ 1.0, so the hand-tuned keyframes stay the look and the
  // eye only corrects views that are darker / brighter than usual. strength k: 0 = none, 1 = fully normalised.
  const S = { on: true, debugEl: null, last: null, snapNext: true };
  function params(env) {
    const n = env.night || 0;
    if (env.interior) return { key: 0.11, k: 0.36, lo: 0.75, hi: 1.5, skyW: 1 };
    // daylight: a firm hand on dark views (alleys, doorways, under the El); night: stays night, small lift only
    return {
      key: 0.068 - 0.03 * n,
      k: 0.36 - 0.16 * n,
      lo: 0.72 + 0.13 * n,
      hi: 1.5 - 0.25 * n,
      skyW: 0.45,
    };
  }

  try {
    if (localStorage.getItem("nrc_eye") === "0") S.on = false;
  } catch (e) {
    /* ignore */
  }
  if (G.QS && G.QS.get("eye") === "0") S.on = false;

  // debug readout (?eyedebug=1): GPU readback twice a second — debug only
  const _h = new Uint16Array(4);
  function readback(r, rt) {
    try {
      r.readRenderTargetPixels(rt, 0, 0, 1, 1, _h);
      const f = THREE.DataUtils && THREE.DataUtils.fromHalfFloat;
      if (!f) return null;
      return { adapted: Math.exp(f(_h[0])), current: Math.exp(f(_h[1])) };
    } catch (e) {
      return null;
    }
  }

  A.postEye = {
    METER,
    APPLY_GLSL,
    params,
    S,
    readback,
    snap() {
      S.snapNext = true;
    },
    consumeSnap() {
      const s = S.snapNext;
      S.snapNext = false;
      return s;
    },
  };
  if (G.events && G.events.on) {
    G.events.on("reset", () => {
      S.snapNext = true;
    });
    // wait / sleep / setHour jump the lighting → re-meter at once (the natural hourly tick doesn't)
    let lastH = null;
    G.events.on("hourChanged", (h) => {
      if (lastH !== null) {
        let d = Math.abs(h - lastH);
        d = Math.min(d, 24 - d);
        if (d > 0.6) S.snapNext = true;
      }
      lastH = h;
    });
  }
})();
