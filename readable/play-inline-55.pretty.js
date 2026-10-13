/* src/atmosphere/45_post_vol.js */
/* =====================================================================
 * ATMOSPHERE — post: volumetric sun/moon light shafts (render_post)
 *
 * "God rays through dust and ruins", done properly: for every
 * pixel (half res on high/ultra, quarter res on medium) the view ray is
 * marched from the camera to the first opaque surface (or ~110 m for open
 * sky) and at each step the atmosphere's SUN SHADOW MAP (14_lighting.js,
 * ±75 m box pushed ahead of the view) is tested: lit air scatters the key
 * light toward the eye, air in the shadow of a tower / girder / billboard
 * does not. The result is real shafts:
 *   * slanting across avenues from every cross-street gap at dawn/dusk,
 *   * through the girders, collapsed floors and window holes of ruins,
 *   * visible even when the sun itself is OFF screen (the radial-blur rays
 *     in 40_postfx.js only work while the sun disc is in view — both run
 *     together: those handle the distant skyline, this the air around you),
 *   * thick and ochre in a dust storm, cold and faint in moonlight.
 * Scattering: Henyey-Greenstein forward lobe (g 0.6) + isotropic floor,
 * height-falling density (dust hangs in the street canyons), per-weather /
 * time-of-day density, gentle extinction. Output r = in-scatter, g = linear
 * view depth (the AO bilateral blur and a depth-matched upsample in the
 * composite keep silhouettes crisp). The composite adds colour × r.
 * 16 steps × ¼ of the pixels (half res) ≈ the cost of the GTAO pass.
 * Exposes A.postVol = { FS, params(env, W, level) }.
 * Test: ?postoff=vol, ?voldebug=1 (shows only the in-scatter), ?volk=<gain>.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._ || !THREE) return;
  const A = G.atmos._;

  const FS = `
    #include <packing>
    uniform sampler2D tDepth, tShadow;
    uniform mat4 uInvProj, uCamWorld, uShadowMat;
    uniform vec3 uCamPos, uLightDir;
    uniform vec4 uVolP;   // x max march distance (m), y steps, z density (1/m), w density scale height (m)
    uniform vec4 uVolQ;   // x ground height, y HG g, z "lit" value outside the shadow box, w shadow depth bias
    uniform float uExt, uLit0;
    varying vec2 vUv;
    vec3 viewAt(vec2 uv, float d){ vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
    float shadowLit(vec3 p){
      vec4 sc = uShadowMat * vec4(p, 1.0);
      vec3 s = sc.xyz / sc.w;
      if (s.x <= 0.002 || s.x >= 0.998 || s.y <= 0.002 || s.y >= 0.998 || s.z >= 1.0) return uVolQ.z;
      float sd = unpackRGBAToDepth(texture2D(tShadow, s.xy));
      return step(s.z + uVolQ.w, sd);
    }
    void main(){
      float d = texture2D(tDepth, vUv).r;
      bool sky = d >= 0.99999;
      vec3 vp = viewAt(vUv, sky ? 0.9995 : d);
      vec3 wp = (uCamWorld * vec4(vp, 1.0)).xyz;
      vec3 rd = wp - uCamPos;
      float dist = length(rd);
      rd /= max(dist, 1e-4);
      float len = sky ? uVolP.x : min(dist, uVolP.x);
      float z = sky ? 10000.0 : -vp.z;
      // interleaved gradient noise: a FIXED screen pattern (no crawling), cleaned up by the bilateral blur
      float jit = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      float n = uVolP.y, dt = len / n, acc = 0.0, tot = 0.0;
      for (int i = 0; i < 32; i++) {
        if (float(i) >= n) break;
        float t = (float(i) + jit) * dt;
        vec3 p = uCamPos + rd * t;
        float h = max(p.y - uVolQ.x, 0.0);
        float dens = exp(-h / uVolP.w) + 0.18;
        float w = dens * exp(-uExt * t);
        acc += shadowLit(p) * w;
        tot += w;
      }
      // three's exponential fog already scatters light as if a share uLit0 of the air were lit: add only the
      // DIFFERENCE → lit shafts brighten, air in the shadow of the towers gets a little clearer/darker (signed)
      acc = (acc - uLit0 * tot) * dt * uVolP.z;
      if (acc < 0.0) acc *= 0.6;
      // phase: Henyey-Greenstein forward lobe + isotropic floor (normalised so isotropic = 1)
      float g = uVolQ.y, c = dot(rd, uLightDir);
      float hg = (1.0 - g * g) / pow(max(1.0 + g * g - 2.0 * g * c, 1e-3), 1.5);
      float ph = 0.2 + 0.8 * hg;
      gl_FragColor = vec4(acc * ph, z, 0.0, 1.0);
    }
  `;

  // composite side: depth-matched upsample of the (blurred) low-res in-scatter
  const APPLY_GLSL = `
    uniform sampler2D tVol; uniform vec3 uVolCol; uniform vec2 uVolTexel; uniform float uVolSky;
    float volAt(vec2 uv, float zf){
      vec2 s = texture2D(tVol, uv).rg;
      if (abs(s.y - zf) <= 0.06 * zf + 0.25) return s.x;
      // silhouette: bilinear would bleed the far air over the near edge (or back) → best-matching neighbour
      float best = 1e9, v = s.x;
      for (int i = 0; i < 4; i++) {
        vec2 o = vec2(i == 0 || i == 2 ? -1.0 : 1.0, i < 2 ? -1.0 : 1.0) * uVolTexel * 0.75;
        vec2 t = texture2D(tVol, uv + o).rg;
        float e = abs(t.y - zf);
        if (e < best) { best = e; v = t.x; }
      }
      return v;
    }
  `;

  // per weather / time of day: [density 1/m, HG g]
  const S = { gain: 1 };
  try {
    const k = G.QS && +G.QS.get("volk");
    if (k > 0) S.gain = k;
  } catch (e) {
    /* ignore */
  }

  /** What the pass should do this frame → null (off) or
   *  {dens, g, H, ext, col (THREE.Color, linear HDR), sky, lightDir (Vector3 toward the light)} */
  const _col = new THREE.Color(),
    _dustC = new THREE.Color(),
    _ld = new THREE.Vector3();
  function params(env, W, level) {
    if (env.interior || !A.sun) return null;
    const day = env.sunY > -0.03;
    const dir = day ? env.sunDir : env.moonDir;
    if (dir.y < -0.02) return null;
    const cloud = W ? W.cloud * W.cloudDark : 0;
    const dust = W ? W.dust : 0,
      rad = W ? W.rad : 0,
      rain = W ? W.rain : 0,
      fogM = W ? W.fogMul : 1;
    // low sun = the long golden shafts of the mornings / evenings
    const lowSun = 1 - A.smooth(0.06, 0.55, dir.y);
    let dens =
      0.0013 *
      (1 + 3.0 * lowSun) *
      (1 + dust * 2.2 + rad * 1.2 + Math.max(0, fogM - 1) * 0.35);
    // the shafts need a sun to cast them: overcast / rain wash them out (diffuse light has no beams)
    let k = (1 - 0.85 * cloud) * (1 - 0.6 * rain);
    if (!day) k *= 0.55 * env.night; // cold, faint moon shafts
    k *= S.gain;
    if (k < 0.02) return null;
    _col.copy(A.sun.color).multiplyScalar(A.sun.intensity * k);
    // dust storms: the shafts turn ochre (sunlight through suspended grit)
    if (dust > 0.05)
      _col.lerp(
        _dustC.setRGB(1.0, 0.78, 0.5).multiplyScalar(A.sun.intensity * k),
        Math.min(0.5, dust * 0.5),
      );
    _ld.copy(dir).normalize();
    return {
      dens,
      g: 0.6 + 0.08 * dust,
      H: 26 + 40 * dust,
      ext: 0.004 + 0.01 * dust,
      col: _col,
      sky: 0.35,
      lightDir: _ld,
      lit0: 0.2,
      steps: level >= 3 ? 24 : level === 2 ? 16 : 12,
      maxDist: level >= 3 ? 130 : level === 2 ? 110 : 90,
      div: level >= 2 ? 2 : 4,
    };
  }

  A.postVol = { FS, APPLY_GLSL, params, S };
})();
