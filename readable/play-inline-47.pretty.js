/* src/atmosphere/12_sky.js */
/* =====================================================================
 * ATMOSPHERE — Sky dome
 * A camera-centred sphere at the far plane, drawn after the opaque world with a
 * single fragment shader: horizon→zenith gradient in a hazy olive
 * palette, Mie-ish sun halo + HDR sun disc (feeds bloom), a two-layer
 * drifting cloud deck (puffy cumulus + streaky cirrus) lit from the sun
 * side, stars that twinkle, a cratered moon, green churn for rad weather,
 * lightning flashes, distant horizon flashes, and an exact blend into the
 * fog colour at the horizon so the city fades seamlessly into the sky.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos;

  const VERT = `
    varying vec3 vDir;
    void main(){
      vDir = position;
      vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      p.z = p.w * 0.9999999;               // always at the far plane, never clipped
      gl_Position = p;
    }
  `;
  const FRAG = `
    uniform sampler2D uNoise;
    uniform vec3 uZenith, uHorizon, uFog, uGlow;
    uniform vec3 uSunDir, uSunColor, uMoonDir;
    uniform float uSunSize, uStars, uTime, uNight;
    uniform float uCloud, uCloudDark;
    uniform vec3 uCloudLit, uCloudShade;
    uniform vec2 uWind;
    uniform float uFlash; uniform vec3 uFlashColor;
    uniform float uRad, uDust;
    uniform vec4 uHFlash;
    uniform float uFogBlend, uFogDensity, uCamY, uFogFar, uSkyAlpha;
    uniform vec4 uDeck;          // x: deck thickness (m, light march), y: edge detail, z: -, w: cumulus on
    uniform vec3 uLightDir, uLightCol;   // cloud key light (sun / moon) and its HDR colour
    uniform float uMoonPhase, uTwi;      // moon phase 0..1 (0.5 = full), twilight strength
    uniform vec3 uWaterFar;              // far harbour colour (x < 0: no water → plain sky below the horizon)
    uniform vec4 uNeonP; uniform vec3 uNeonC;   // THE NEON's sky-glow: xyz = glow centre (world), w = width exponent; colour × strength
    varying vec3 vDir;
    ${A.glsl.noise}
    ${A.glsl.heightFogPars}
    float h13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }

    float stars(vec3 d, float scale, float thresh){
      vec3 sp = d * scale; vec3 c = floor(sp); vec3 f = fract(sp) - 0.5;
      float r = h13(c);
      if (r < thresh) return 0.0;
      vec3 off = vec3(h13(c + 1.7), h13(c + 3.1), h13(c + 5.3)) - 0.5;
      float s = smoothstep(0.22, 0.0, length(f - off * 0.5));
      float tw = 0.65 + 0.35 * sin(uTime * (1.5 + r * 5.0) + r * 60.0);
      return s * tw * (r - thresh) / (1.0 - thresh);
    }

    void main(){
      vec3 d = normalize(vDir);
      float h = d.y;
      float hp = max(h, 0.0);
      // ---- base gradient
      vec3 col = mix(uHorizon, uZenith, pow(smoothstep(0.0, 1.0, hp), 0.5));
      // ---- sun-side warm glow along the horizon
      vec2 dh = normalize(d.xz + 1e-5), sh = normalize(uSunDir.xz + 1e-5);
      float side = pow(max(dot(dh, sh), 0.0), 3.0);
      float sunLow = 1.0 - smoothstep(0.0, 0.55, uSunDir.y);
      col = mix(col, uGlow, side * exp(-hp * 4.0) * (0.25 + 0.55 * sunLow) * min(uSunSize, 1.0));
      // ---- civil twilight: EARTH'S SHADOW (a slate-blue band rising on the horizon opposite the sun)
      // capped by the BELT OF VENUS (a dusty rose arch). Read from rooftops / aerials at dawn and dusk.
      if (uTwi > 0.001) {
        float anti = pow(max(dot(dh, -sh), 0.0), 1.6) * uTwi;
        float eshadow = smoothstep(-0.015, 0.01, h) * (1.0 - smoothstep(0.03, 0.085, h));
        float venus = smoothstep(0.05, 0.1, h) * (1.0 - smoothstep(0.13, 0.26, h));
        col = mix(col, col * vec3(0.66, 0.7, 0.86), eshadow * anti * 0.85);
        col = mix(col, col * vec3(1.22, 0.98, 1.02) + vec3(0.07, 0.025, 0.035), venus * anti * 0.8);
      }
      // ---- sun halo (Mie) + disc
      float sd = dot(d, uSunDir);
      float sdp = max(sd, 0.0);
      col += uSunColor * (pow(sdp, 5.0) * 0.07 + pow(sdp, 40.0) * 0.22 + pow(sdp, 400.0) * 0.6) * uSunSize;

      // ---- stars
      float starAmt = 0.0;
      if (uStars > 0.01 && h > 0.0) {
        starAmt = stars(d, 160.0, 0.985) + stars(d, 320.0, 0.992) * 0.7 + stars(d, 90.0, 0.994) * 1.6;
        // faint milky band
        float band = exp(-pow(dot(d, normalize(vec3(0.4, 0.3, -0.87))) * 3.2, 2.0));
        starAmt += band * afbm3o(d.xz / (h + 0.3) * 30.0) * 0.12;
        starAmt *= uStars * smoothstep(0.0, 0.25, h);
      }

      // ---- moon (fixed gibbous phase, cratered)
      float moon = 0.0; float moonHalo = 0.0;
      {
        vec3 md = normalize(uMoonDir);
        vec3 t1 = normalize(cross(md, vec3(0.0, 1.0, 0.0)));
        vec3 t2 = cross(t1, md);
        vec2 q = vec2(dot(d, t1), dot(d, t2)) / 0.021;
        float r2 = dot(q, q);
        float front = step(0.0, dot(d, md));
        if (r2 < 1.0 && front > 0.0) {
          vec3 n = vec3(q, sqrt(1.0 - r2));
          // phase: the terminator sweeps across the disc over the lunar month; earthshine on the dark side
          float ph = uMoonPhase * 6.2832;
          float lit = smoothstep(-0.06, 0.1, dot(n, normalize(vec3(sin(ph), 0.12, -cos(ph)))));
          float crater = 0.72 + 0.28 * afbm3o(q * 6.0 + 11.0);
          float maria = smoothstep(0.45, 0.62, afbm3o(q * 1.7 + 3.0));
          moon = (lit * crater * (1.0 - 0.3 * maria) + 0.035) * smoothstep(1.0, 0.92, r2) * (0.8 + 0.2 * n.z);
        }
        moonHalo = pow(max(dot(d, md), 0.0), 700.0) * 0.35 + pow(max(dot(d, md), 0.0), 60.0) * 0.05;
      }

      // ---- clouds. (1) CUMULUS DECK anchored in the world: the view ray is intersected with the
      // cloud-deck plane (nrcCldS.w m up) and the macro field is nrcCloudN — the very field that casts
      // the moving cloud shadows on the city (00_core.js). Volumetric look without a raymarch: column
      // thickness from how far the field rises above the coverage threshold, self-shadowing by marching
      // the field toward the key light (Beer), powder-darkened cores, forward-scattering silver rims,
      // darker bellies seen from below, torn edges from mip-mapped detail noise.
      // (2) high wind-combed cirrus, (3) an overcast stratus sheet under heavy weather.
      float cloudA = 0.0; vec3 cloudCol = vec3(0.0);
      float skyHeavy = 0.0, skyScud = 0.0, skyBreak = 0.0;
      if (h > -0.03) {
        vec2 uv = d.xz / (h + 0.1);
        vec2 w = uWind * uTime;
        float hy = max(h, 0.012);
        float tD = max(nrcCldS.w - cameraPosition.y, 60.0) / hy;
        vec2 q = (cameraPosition.xz + d.xz * tD + nrcCld.zw) * nrcCldS.z;
        float far = smoothstep(8000.0, 40000.0, tD);
        float det = (afbm2(q * 4.3 + w * 2.2) - 0.5) * 0.26 + (an2(q * 15.0 - w * 4.0) - 0.5) * 0.07 * (1.0 - far);
        det *= uDeck.y;
        float cov = nrcCld.y;
        float nm = nrcCloudN(q);
        float nd = nm + det;
        float soft = 0.07 + 0.14 * far;
        float c1 = smoothstep(cov - 0.01, cov + soft, nd);
        float th = clamp((nd - cov) / 0.26, 0.0, 1.0);
        // self-shadow toward the key light (sun by day, moon by night)
        vec2 ls = uLightDir.xz / max(uLightDir.y, 0.12) * uDeck.x * nrcCldS.z;
        ls *= min(1.0, 1.6 / max(length(ls), 1e-3));
        float od = max(nrcCloudN(q + ls * 0.25) + det * 0.6 - cov, 0.0)
                 + max(nrcCloudN(q + ls * 0.6) + det * 0.3 - cov, 0.0) * 1.2
                 + max(nrcCloudN(q + ls * 1.1) - cov, 0.0) * 1.3;
        float Tl = exp(-od * 6.5);
        float mu = dot(d, uLightDir);
        float fwd = pow(max(mu, 0.0), 10.0) * 1.6 + pow(max(mu, 0.0), 3.0) * 0.35;
        float edge = c1 * (1.0 - th);
        float powder = 1.0 - exp(-(th + 0.12) * 5.0);
        vec3 amb = mix(uCloudLit * 0.66, uCloudShade * 0.9, th * 0.8);
        amb = mix(amb, uCloudLit * 0.8, (1.0 - th) * 0.25 * (1.0 - hp));        // thin far edges catch skylight
        vec3 cum = amb + uLightCol * Tl * (0.42 * powder + fwd * (0.35 + 1.7 * edge));
        float cumA = c1 * clamp(0.5 + th * 1.4 + (1.0 - hp) * 0.25, 0.0, 1.0) * uDeck.w;
        // cirrus streaks (high, thin, wind-combed), lit by the key light
        vec2 p2 = vec2(uv.x * 1.2 + uv.y * 0.4, uv.y * 6.0 - uv.x * 0.9) + w * 1.6;
        float cs = smoothstep(0.52, 0.84, afbm2(p2)) * 0.42 * (1.0 - uCloud * 0.6);
        vec3 cir = mix(uCloudLit * 0.85, uLightCol * 1.1 + uCloudLit * 0.3, pow(max(mu, 0.0), 4.0) * 0.6);
        // overcast / rain stratus sheet
        float nS = afbm2(uv * 2.2 + w * 0.8);
        float sheet = smoothstep(0.55, 1.0, uCloud) * (0.62 + 0.38 * nS);
        vec3 shc = mix(uCloudShade, uCloudLit * 0.8, clamp(0.25 + 0.55 * nS + 0.2 * Tl * (1.0 - uCloudDark), 0.0, 1.0));
        cloudCol = mix(cir, cum, cumA);
        cloudA = 1.0 - (1.0 - cs) * (1.0 - cumA);
        float shW = sheet * (1.0 - cumA * 0.6);
        cloudCol = mix(cloudCol, shc, shW / max(max(cloudA, shW), 1e-3) * step(0.001, shW));
        cloudA = max(cloudA, sheet);
        // heavy skies (overcast → rain): the deck is THICK overhead (darker toward the zenith, lighter
        // toward the horizon where you see its thin, lit edge) with ragged dark scud racing along the
        // wind underneath it — a textured nimbostratus instead of a flat pale-grey card
        // (applied AFTER the height fog below: at these distances the haze would erase it)
        if (sheet > 0.001) {
          skyHeavy = sheet * uCloudDark;
          vec2 su = uv * 1.1 + w * 4.2 + vec2(afbm3o(uv * 0.6 - w * 1.5), afbm3o(uv * 0.5 + w)) * 0.9;
          float sc = afbm2(su);
          skyScud = smoothstep(0.4, 0.66, sc) * smoothstep(0.015, 0.14, h);
          skyBreak = smoothstep(0.6, 0.85, nS) * (1.0 - skyScud) * sheet;
        }
        cloudA *= smoothstep(-0.03, 0.12, h);
        cloudCol = mix(cloudCol, uCloudShade * 0.8, uCloudDark * 0.5);
        // silver lining around the sun
        cloudCol += uSunColor * pow(sdp, 12.0) * 0.35 * (1.0 - cloudA * 0.5) * uSunSize;
        // rad weather (rad > 0; none currently): toxic green churn, glowing bellies
        if (uRad > 0.001) {
          float churn = afbm2(uv * 4.5 - w * 3.0 + vec2(sin(uTime * 0.05), cos(uTime * 0.04)) * 4.0);
          vec3 radc = vec3(0.30, 0.55, 0.16) * (0.35 + 0.65 * churn);
          cloudCol = mix(cloudCol, radc * (0.45 + 0.55 * (1.0 - uNight * 0.7)), uRad * 0.7);
          cloudCol += vec3(0.25, 0.9, 0.2) * uRad * pow(churn, 3.0) * 0.35 * (0.6 + 0.4 * sin(uTime * 0.7 + churn * 9.0));
          cloudA = max(cloudA, uRad * (0.75 + 0.25 * churn) * smoothstep(-0.03, 0.12, h));
        }
        // dust storm: brown veil
        if (uDust > 0.001) {
          float dn = afbm2(uv * 9.0 + w * 4.0);
          cloudCol = mix(cloudCol, uFog * (0.8 + 0.4 * dn), uDust * 0.8);
          cloudA = max(cloudA, uDust * 0.85);
        }
      }

      // ---- compose
      float sunDisc = smoothstep(0.99955, 0.99975, sd) * 14.0 * uSunSize;
      col += uSunColor * sunDisc * (1.0 - cloudA * 0.97);
      col += vec3(0.9, 0.95, 1.0) * starAmt * (1.0 - cloudA);
      col += vec3(1.6, 1.65, 1.5) * moon * (1.0 - cloudA * 0.85) * uNight;
      col += vec3(0.5, 0.6, 0.65) * moonHalo * uNight * (1.0 - cloudA * 0.5);
      col = mix(col, cloudCol, cloudA * 0.94);
      // lightning (lights up the clouds from inside)
      col += uFlashColor * uFlash * (0.25 + 1.6 * cloudA);
      // THE NEON (Times Square) is the one place in New York with power: at night its signs light the
      // haze and the undersides of the clouds above it — a pink/amber dome seen from across the city
      vec3 neon = vec3(0.0);
      if (uNeonC.r + uNeonC.g + uNeonC.b > 0.0005) {
        vec3 nd = normalize(uNeonP.xyz - cameraPosition);
        float na = pow(max(dot(d, nd), 0.0), uNeonP.w);
        float low = exp(-max(h - nd.y, 0.0) * 3.5);
        // (the haze glows as a soft dome; cloud bellies catch a little more — a softened cloud mask, so the
        // glow doesn't read as painted pink stripes along the cumulus edges)
        neon = uNeonC * na * low * (0.6 + 0.8 * smoothstep(0.1, 0.9, cloudA)) * smoothstep(-0.03, 0.01, h);
      }
      // distant horizon flashes (far-off gunfights / burning)
      if (uHFlash.w > 0.001) {
        float hf = pow(max(dot(d, normalize(uHFlash.xyz)), 0.0), 18.0) * exp(-hp * 9.0);
        col += vec3(1.0, 0.55, 0.25) * hf * uHFlash.w;
      }
      // seamless horizon: the SAME height fog / aerial perspective the world uses, evaluated for a
      // ray to the far skyline distance → distant towers melt into exactly the sky behind them
      // rays below the horizon end on the ground/water plane (continuous across h = 0 from any altitude)
      // Below the horizon the dome continues the HARBOUR past the camera's far clip (3.5 km): the far
      // water colour (computed by 20_water.js with the same formula the water shader converges to
      // out there) under the true-distance fog plus the water's own far mist → no visible edge where
      // the water plane is clipped in aerial views, the sea runs on into the haze.
      vec3 fogC;
      float rayL = h < 0.0 ? min(h < -0.0005 ? 60000.0 : uFogFar, max(uCamY, 1.0) / max(-h, 1e-4)) : uFogFar;
      if (h < 0.0 && uWaterFar.x >= 0.0) col = mix(col, uWaterFar, smoothstep(0.0, -0.004, h));
      float fa = nrcFogAmt(d * rayL, uCamY, uFogDensity, uFog, vec3(0.0), fogC);
      if (h < 0.0 && uWaterFar.x >= 0.0) fa = mix(fa, fa + 0.4 * (1.0 - fa), smoothstep(0.0, -0.004, h));
      // at street level also pin the exact horizon line to the fog (hides the world's far edge)
      // looking UP through heavy weather the deck overhead is much closer than the far skyline, and its
      // structure must survive the uniform haze share (rain/overcast used to fog the whole sky into a
      // flat pale card). The horizon — where distant towers melt into the sky — is untouched.
      if (h > 0.0) fa *= 1.0 - 0.45 * smoothstep(0.04, 0.5, h) * (1.0 - uDust);
      float band = (1.0 - smoothstep(-0.02, 0.012, h)) * (1.0 - smoothstep(12.0, 60.0, uCamY));
      float fb = max(fa, band);
      col = mix(col, fogC, clamp(fb * uFogBlend, 0.0, 1.0));
      col += neon;   // lit haze: added after the fog (the glow IS the haze)
      // heavy skies: thick deck darker overhead, ragged dark scud racing under it, lighter breaks
      if (skyHeavy > 0.001) {
        col *= 1.0 - skyHeavy * 0.34 * smoothstep(0.03, 0.5, h);
        col = mix(col, col * vec3(0.6, 0.62, 0.64), skyScud * skyHeavy * 0.75);
        col += col * 0.16 * skyBreak * (1.0 - skyScud) * smoothstep(0.02, 0.2, h);
      }
      // rad weather: the churning green storm deck hangs low and shows THROUGH the haze (seen from the
      // street only the lowest band of sky is visible), with glowing, pulsing bellies
      if (uRad > 0.001 && h > -0.03) {
        vec2 ruv = d.xz / (max(h, 0.0) + 0.12);
        vec2 rw = uWind * uTime;
        // rolling shelf: the deck boils (domain-warped noise, advected fast along the wind) with dark,
        // heavy bellies and sickly glowing seams between them
        vec2 roll = vec2(afbm2(ruv * 1.3 + rw * 1.5), afbm2(ruv * 1.3 - rw * 1.2 + 5.0)) - 0.5;
        float ch = afbm2(ruv * 2.4 + roll * 1.6 - rw * 5.0 + vec2(sin(uTime * 0.05), cos(uTime * 0.04)) * 3.0);
        float ch2 = afbm2(ruv * 6.0 + roll * 2.5 + rw * 2.0 + 11.0);
        float belly = smoothstep(0.35, 0.75, ch);
        // heavy, dark deck (the storm light is dim: dusk at noon); lit undersides only where the seams
        // let the sickly light through; the lowest band stays a brighter yellow-green glow (the storm
        // front's lit edge far away) — not a flat lime wash
        vec3 gc = mix(vec3(0.2, 0.29, 0.09), vec3(0.035, 0.05, 0.022), belly) * (0.45 + 0.55 * (1.0 - uNight * 0.6));
        gc = mix(gc, vec3(0.42, 0.5, 0.17) * (0.45 + 0.55 * (1.0 - uNight * 0.6)), (1.0 - smoothstep(0.0, 0.1, h)) * (1.0 - belly * 0.6));
        gc *= 1.0 - 0.45 * smoothstep(0.08, 0.6, h);    // the deck is thickest (darkest) overhead
        float m = uRad * smoothstep(-0.03, 0.12, h) * clamp(0.55 + 0.5 * ch + 0.2 * ch2, 0.0, 0.96);
        col = mix(col, gc, m);
        float seam = pow(clamp(1.0 - abs(ch - 0.5) * 5.0, 0.0, 1.0), 2.0) * ch2;
        col += vec3(0.3, 1.0, 0.22) * (pow(ch * ch2 * 1.6, 3.0) * 0.5 + seam * 0.35) * uRad * smoothstep(-0.02, 0.25, h) * (0.55 + 0.45 * sin(uTime * 0.9 + ch * 12.0));
        // lightning lights the deck from inside
        col += uFlashColor * uFlash * m * (0.6 + 0.8 * (1.0 - belly));
      }
      // alpha = 0 marks open sky in the HDR target (post-fx light shafts use it as their occlusion mask;
      // everything opaque writes 1). In plain rendering it stays 1.
      gl_FragColor = vec4(col, uSkyAlpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  let sky = null,
    mat = null;
  // ------------------------------------------------------------------
  // CLOUD DECK (shared with the cloud-shadow chunk in 00_core.js): world-anchored, drifting with the
  // upper wind. Written here every frame (also indoors, so the deck keeps moving) into the shared
  // fog uniform objects nrcCld / nrcCldS that every lit outdoor material and the sky read.
  // ------------------------------------------------------------------
  const DECK = {
    height: 1150,
    cell: 820,
    thick: 540,
    drift: new THREE.Vector2(173.0, -91.0),
    shadow: 0,
  };
  A.cloudDeck = DECK;
  function updateDeck(env, W, animDt) {
    const F = A.fogShared;
    if (!F || !F.nrcCld) return;
    const C = F.nrcCld.value,
      S = F.nrcCldS.value;
    const cloud = W ? W.cloud : 0.22,
      oc = W ? W.cloud * W.cloudDark : 0;
    // upper-level wind: ~3× the street wind, veering a little from it
    if (animDt > 0 && animDt < 1) {
      const wx = W ? W.windX : 3,
        wz = W ? W.windZ : 1;
      DECK.drift.x += (wx * 2.6 - wz * 0.8) * animDt;
      DECK.drift.y += (wz * 2.6 + wx * 0.8) * animDt;
      if (Math.abs(DECK.drift.x) > 4e5 || Math.abs(DECK.drift.y) > 4e5)
        DECK.drift.set(173, -91);
    }
    // coverage threshold of the macro field: ~25 % sky cover when clear, ~80 % overcast, full in rain
    C.y =
      A.lerp(0.52, 0.26, A.smooth(0.2, 0.85, cloud)) -
      0.07 * A.smooth(0.85, 1.0, cloud);
    C.z = DECK.drift.x;
    C.w = DECK.drift.y;
    S.z = 1 / DECK.cell;
    S.w = DECK.height;
    const ld = env.lightDir;
    const ly = Math.max(ld.y, 0.14);
    S.x = ld.x / ly;
    S.y = ld.z / ly;
    // shadow strength: crisp moving patches under broken cloud, nothing left to see under a full deck
    // (the key light is already dimmed by the weather), weaker by moonlight, off indoors
    let k = env.interior ? 0 : env.night > 0.5 ? 0.42 : 0.62;
    k *= 1 - 0.55 * A.smooth(0.2, 0.7, oc);
    k *= 1 - A.smooth(0.86, 1.0, cloud);
    if (W) k *= 1 - 0.7 * Math.min(1, W.dust) - 0.6 * Math.min(1, W.rad);
    if (A.cloudShadowsOff) k = 0;
    C.x = Math.max(0, k);
    DECK.shadow = C.x;
  }
  /** Cloud shadow factor (1 = in sun, <1 under a cloud) at a world point — the CPU twin of the shader. */
  ATMOS.cloudShadowAt = function (x, y, z) {
    return A.cloudShadowAt ? A.cloudShadowAt(x, y, z) : 1;
  };
  /** Toggle the moving cloud shadows (debug / A-B shots: ?cloudsh=0). */
  ATMOS.setCloudShadows = function (on) {
    A.cloudShadowsOff = !on;
  };

  const hflash = { t: 0, next: 8, dir: new THREE.Vector3(1, 0.02, 0), int: 0 };

  function init() {
    // height-fog parameters shared with every world material; the two colours get linear-space
    // copies (the sky encodes itself, while built-ins in plain mode fog after the encode)
    const shared = {};
    for (const k in A.fogShared) shared[k] = { value: A.fogShared[k].value };
    A.skyFog = { sky: { x: 0, y: 0, z: 0 }, sunC: { x: 0, y: 0, z: 0 } };
    shared.nrcFogSky = { value: A.skyFog.sky };
    shared.nrcFogSunC = { value: A.skyFog.sunC };
    mat = new THREE.ShaderMaterial({
      uniforms: {
        uNoise: { value: A.noiseTex },
        uZenith: { value: new THREE.Color() },
        uHorizon: { value: new THREE.Color() },
        uFog: { value: new THREE.Color() },
        uGlow: { value: new THREE.Color() },
        uSunDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color() },
        uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
        uSunSize: { value: 1 },
        uStars: { value: 0 },
        uTime: { value: 0 },
        uNight: { value: 0 },
        uCloud: { value: 0.3 },
        uCloudDark: { value: 0 },
        uCloudLit: { value: new THREE.Color() },
        uCloudShade: { value: new THREE.Color() },
        uWind: { value: new THREE.Vector2(0.002, 0.001) },
        uFlash: { value: 0 },
        uFlashColor: { value: new THREE.Color(0x9aff9a) },
        uRad: { value: 0 },
        uDust: { value: 0 },
        uHFlash: { value: new THREE.Vector4(1, 0, 0, 0) },
        uFogBlend: { value: 1 },
        uFogDensity: { value: 0.0016 },
        uCamY: { value: 2 },
        uFogFar: { value: 2000 },
        uSkyAlpha: { value: 1 },
        uDeck: { value: new THREE.Vector4(520, 1, 0, 1) },
        uLightDir: { value: new THREE.Vector3(0, 1, 0) },
        uLightCol: { value: new THREE.Color() },
        uMoonPhase: { value: 0.4 },
        uTwi: { value: 0 },
        uWaterFar: { value: new THREE.Vector3(-1, 0, 0) },
        uNeonP: { value: new THREE.Vector4(-40, 90, -262, 8) },
        uNeonC: { value: new THREE.Color(0, 0, 0) },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
      defines: { NRC_WRITE_ALPHA: 1 }, // writes the sky mask (alpha 0) into the HDR target
    });
    Object.assign(mat.uniforms, shared);
    sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 48, 24), mat);
    sky.name = "atmos_sky";
    sky.renderOrder = 9; // after the opaque world (early-z: sky shader only runs where nothing covers it)
    sky.frustumCulled = false;
    sky.matrixAutoUpdate = true;
    G.scene.add(sky);
    A.sky = sky;
    A.skyMat = mat;
    G.scene.background = new THREE.Color(0x8a8f78);
  }

  function update(dt, realDt, animDt) {
    const env = A.env,
      u = mat.uniforms,
      W = A.weather ? A.weather.cur : null;
    sky.visible = !env.interior;
    G.scene.background.copy(env.fogColor);
    updateDeck(env, W, animDt);
    if (env.interior) return;
    u.uSkyAlpha.value = A.post && A.post.enabled ? 0 : 1;
    u.uZenith.value.copy(env.zenith);
    u.uHorizon.value.copy(env.horizon);
    u.uFog.value.copy(env.fogColor);
    u.uGlow.value.copy(env.glow);
    u.uFogDensity.value = env.fogDensity;
    u.uCamY.value = A.camPos.y;
    u.uFogFar.value = env.fogFar || 2000;
    u.uSunDir.value.copy(env.sunDir);
    u.uMoonDir.value.copy(env.moonDir);
    // HDR sun colour: brighter at day, tinted at dusk
    u.uSunColor.value
      .copy(env.lightColor)
      .multiplyScalar(0.55 + 0.45 * Math.min(1, env.lightInt / 2.5));
    u.uSunSize.value = env.sunSize * A.smooth(-0.06, 0.02, env.sunY);
    u.uStars.value = env.stars;
    u.uNight.value = env.night;
    u.uTime.value = A.animTime;
    u.uCloudLit.value.copy(env.cloudLit);
    u.uCloudShade.value.copy(env.cloudShade);
    // cloud key light: the sun, or the moon at night (silver-edged moonlit cumulus); dips at the handover
    const dayW = A.smooth(-0.05, 0.05, env.sunY);
    u.uLightDir.value.copy(dayW > 0.5 ? env.sunDir : env.moonDir);
    if (u.uLightDir.value.y < 0.02) {
      u.uLightDir.value.y = 0.02;
      u.uLightDir.value.normalize();
    }
    const lk =
      dayW > 0.5
        ? 0.62 * Math.min(1.2, env.lightInt / 2.4 + 0.25)
        : 0.3 * Math.min(1, env.lightInt);
    u.uLightCol.value
      .copy(env.lightColor)
      .multiplyScalar(lk * (W ? 1 - 0.6 * W.cloud * W.cloudDark : 1));
    u.uDeck.value.set(DECK.thick, 1, 0, 1);
    if (A.waterFar && A.water && A.water.visible !== false)
      u.uWaterFar.value.set(A.waterFar.r, A.waterFar.g, A.waterFar.b);
    else u.uWaterFar.value.set(-1, 0, 0);
    // lunar month of 29.5 game days, kept between a fat crescent and full so moonlit nights stay bright
    const lun = (((env.day || 1) + env.hour / 24) / 29.53) % 1;
    u.uMoonPhase.value = 0.5 + 0.3 * Math.sin(lun * Math.PI * 2);
    u.uTwi.value =
      A.smooth(-0.2, -0.04, env.sunY) *
      (1 - A.smooth(0.03, 0.13, env.sunY)) *
      (W ? 1 - 0.8 * W.cloud * W.cloudDark : 1);
    if (W) {
      u.uCloud.value = W.cloud;
      u.uCloudDark.value = W.cloudDark;
      u.uRad.value = W.rad;
      u.uDust.value = W.dust;
      u.uFlash.value = env.flash;
      u.uFlashColor.value.copy(W.flashColor);
      u.uWind.value.set(W.windX * 0.0009, W.windZ * 0.0009);
    }
    // The Neon's sky-glow (night only; fades with the haze when very far away; overhead when inside it)
    {
      const L = G.LAYOUT,
        site = L && L.getSite ? L.getSite("times_square") : null;
      const cx = site ? (site.x0 + site.x1) / 2 : -40,
        cz = site ? (site.z0 + site.z1) / 2 : -262;
      const dx = cx - A.camPos.x,
        dz = cz - A.camPos.z,
        dist = Math.hypot(dx, dz);
      const nk =
        A.smooth(0.35, 0.85, env.night) *
        (1 - A.smooth(900, 2600, dist)) *
        (W ? 1 - 0.5 * W.dust : 1);
      u.uNeonP.value.set(
        cx,
        70 + Math.min(80, dist * 0.08),
        cz,
        A.lerp(3, 26, A.smooth(60, 1400, dist)),
      );
      u.uNeonC.value
        .setRGB(0.16, 0.065, 0.1)
        .multiplyScalar(nk * (W ? 1 + 0.6 * W.cloud : 1));
    }
    // occasional distant flashes on the horizon at night (far-off battles)
    hflash.next -= animDt;
    if (hflash.next <= 0) {
      hflash.next = A.rr(6, 22);
      if (env.night > 0.5 && Math.random() < 0.6) {
        const a = Math.random() * Math.PI * 2;
        hflash.dir.set(Math.cos(a), 0.02, Math.sin(a));
        hflash.t = 0;
        hflash.int = A.rr(0.3, 0.9);
        hflash.pulses = 1 + ((Math.random() * 3) | 0);
      }
    }
    if (hflash.int > 0) {
      hflash.t += animDt;
      const p = hflash.pulses || 1;
      const ph = hflash.t * 6;
      const k = ph < p ? Math.max(0, Math.sin(ph * Math.PI)) : 0;
      u.uHFlash.value.set(
        hflash.dir.x,
        hflash.dir.y,
        hflash.dir.z,
        k * hflash.int * env.night,
      );
      if (ph > p) hflash.int = 0;
    } else u.uHFlash.value.w = 0;
  }

  function late() {
    if (sky && G.camera) sky.position.copy(G.camera.position);
  }

  A.addSystem({ name: "sky", order: 20, init, update, late });
})();
