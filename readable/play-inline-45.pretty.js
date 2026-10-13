/* src/atmosphere/00_core.js */
/* =====================================================================
 * NEW RAD CITY — ATMOSPHERE MODULE : core / shared internals
 * Owned by: atmosphere.  Namespaces: G.atmos, G.fx
 *
 * This file creates the public namespaces (replacing core's stubs),
 * the private shared object `G.atmos._` used by the other files of
 * this directory, shared GLSL snippets, the procedural noise texture,
 * colour-keyframe helpers, and registers the module with core.
 *
 * Sub-systems (sky, lighting, water, weather, post-fx, particles, …)
 * live in the other files and register themselves with A.addSystem():
 *   { name, order, init(), update(dt, realDt, animDt), late(dt, realDt, animDt), reset() }
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;

  // ------------------------------------------------------------------
  // Public namespaces (wholesale replacement of core's Proxy stubs)
  // ------------------------------------------------------------------
  const ATMOS = (G.atmos = {
    sunDirection: new THREE.Vector3(0.35, 0.8, 0.45).normalize(), // direction TOWARDS the sun/moon light
    moonDirection: new THREE.Vector3(-0.3, 0.7, -0.4).normalize(),
    wind: new THREE.Vector3(3, 0, 1), // world wind velocity (m/s) — flags, smoke, dust read this
    interior: false, // true while the camera is in an interior cell
    interiorKey: null, // key of G.LAYOUT.INTERIORS we're in (or null)
    district: "midtown",
    grading: "olive",
    quality: "high",
  });
  const FX = (G.fx = {});

  // ------------------------------------------------------------------
  // Private shared state for all atmosphere files
  // ------------------------------------------------------------------
  const A = {
    systems: [],
    env: null, // computed per-frame environment (see 10_timeofday.js)
    animTime: 0, // visual time (advances with world dt, or realDt on the title screen)
    realTime: 0,
    camPos: new THREE.Vector3(),
    tmpV: new THREE.Vector3(),
    tmpV2: new THREE.Vector3(),
    tmpV3: new THREE.Vector3(),
    tmpC: new THREE.Color(),
    tmpC2: new THREE.Color(),
    ready: false,
    lowSpec: !!G.SMOKE,
  };
  Object.defineProperty(ATMOS, "_", {
    value: A,
    enumerable: false,
    writable: false,
  });

  A.addSystem = function (sys) {
    if (sys.order === undefined) sys.order = 50;
    A.systems.push(sys);
    A.systems.sort((a, b) => a.order - b.order);
    return sys;
  };

  // ------------------------------------------------------------------
  // Game-time timers. Everything with a gameplay-length lifetime (lingering
  // fires, delayed thunder / rumble, smoke columns…) runs on these instead of
  // setTimeout: they advance with the WORLD clock (frozen in the goggles
  // menu, pause menu, dialogue…) and are dropped on reset (new game / load), so no
  // callback from a previous session ever fires into the next one.
  // ------------------------------------------------------------------
  A.timers = [];
  /**
   * Run fn after `sec` seconds of world (animation) time. Returns a cancel function.
   * opts.onReset: true → if a reset (new game / load) happens first, fn is still run
   * (immediately, during the reset) instead of being dropped. Use this for CLEANUP
   * callbacks (stop an emitter, release a light, remove a rad source) so nothing
   * started in the previous session can be orphaned.
   */
  A.after = function (sec, fn, opts) {
    const t = {
      t: Math.max(0, Number(sec) || 0),
      fn,
      dead: false,
      onReset: !!(opts && opts.onReset),
    };
    A.timers.push(t);
    return () => {
      t.dead = true;
    };
  };
  /** Drop all timers; cleanup timers (onReset) run now. */
  A.flushTimersOnReset = function () {
    const list = A.timers.slice();
    A.timers.length = 0;
    for (const t of list) {
      if (t.dead || !t.onReset) continue;
      try {
        t.fn();
      } catch (e) {
        G.reportError("event:reset/atmosphere-timer", e);
      }
    }
  };
  function runTimers(animDt) {
    if (!A.timers.length || !(animDt > 0)) return;
    const list = A.timers;
    for (let i = list.length - 1; i >= 0; i--) {
      const t = list[i];
      if (t.dead) {
        list.splice(i, 1);
        continue;
      }
      t.t -= animDt;
      if (t.t <= 0) {
        list.splice(i, 1);
        try {
          t.fn();
        } catch (e) {
          G.reportError("update:atmosphere/timer", e);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Small helpers
  // ------------------------------------------------------------------
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  A.clamp = clamp;
  A.lerp = lerp;
  A.smooth = smooth;
  A.damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
  A.rand = Math.random;
  A.rr = (a, b) => a + (b - a) * Math.random();
  A.pick = (arr) => arr[(Math.random() * arr.length) | 0];
  /** random unit vector */
  A.randDir = function (out) {
    const u = Math.random() * 2 - 1,
      t = Math.random() * Math.PI * 2,
      s = Math.sqrt(1 - u * u);
    return (out || new THREE.Vector3()).set(
      s * Math.cos(t),
      u,
      s * Math.sin(t),
    );
  };
  /** random direction inside a cone around `axis` (normalized) with half-angle `ang` */
  A.coneDir = function (axis, ang, out) {
    out = out || new THREE.Vector3();
    const cosA = Math.cos(ang);
    const z = cosA + (1 - cosA) * Math.random();
    const r = Math.sqrt(Math.max(0, 1 - z * z)),
      phi = Math.random() * Math.PI * 2;
    // build basis
    const ax = axis;
    const up = Math.abs(ax.y) < 0.95 ? A._up : A._right;
    const t1 = A._t1.crossVectors(up, ax).normalize();
    const t2 = A._t2.crossVectors(ax, t1);
    return out
      .copy(ax)
      .multiplyScalar(z)
      .addScaledVector(t1, r * Math.cos(phi))
      .addScaledVector(t2, r * Math.sin(phi));
  };
  A._up = new THREE.Vector3(0, 1, 0);
  A._right = new THREE.Vector3(1, 0, 0);
  A._t1 = new THREE.Vector3();
  A._t2 = new THREE.Vector3();
  /** Parse a colour argument: number | string | THREE.Color | named ('red','green','blue','yellow','orange') */
  const NAMED = {
    red: 0xff2a1a,
    green: 0x39ff5a,
    blue: 0x3aa0ff,
    yellow: 0xffd24a,
    orange: 0xff8a2a,
    white: 0xffffff,
    purple: 0xb04aff,
    pink: 0xff5ab0,
    cyan: 0x4affef,
    laser: 0xff2a1a,
    plasma: 0x5aff3a,
    blood: 0x7a0a06,
    teal: 0x2affd0,
    amber: 0xffb43a,
  };
  A.color = function (c, out) {
    out = out || new THREE.Color();
    if (c === undefined || c === null) return out.set(0xffffff);
    if (c.isColor) return out.copy(c);
    if (typeof c === "string" && NAMED[c] !== undefined)
      return out.set(NAMED[c]);
    try {
      return out.set(c);
    } catch (e) {
      return out.set(0xffffff);
    }
  };
  A.v3 = function (p, out) {
    out = out || new THREE.Vector3();
    if (!p) return out.set(0, 0, 0);
    if (Array.isArray(p)) return out.set(p[0] || 0, p[1] || 0, p[2] || 0);
    return out.set(p.x || 0, p.y || 0, p.z || 0);
  };
  A.isInteriorPos = (x) => !!(G.LAYOUT && x >= G.LAYOUT.INTERIOR_X_MIN);
  A.camDist = (p) => {
    const c = G.camera ? G.camera.position : A.camPos;
    return Math.hypot(p.x - c.x, p.y - c.y, p.z - c.z);
  };
  A.groundAt = function (x, z, yRef) {
    try {
      return G.world.groundHeight(x, z, yRef === undefined ? 1e5 : yRef, 0);
    } catch (e) {
      return 0;
    }
  };

  // ------------------------------------------------------------------
  // Colour keyframe helpers (hex authored in sRGB, blended in linear)
  // ------------------------------------------------------------------
  /** Convert a keyframe table { hour: {k: hex|number} } into sorted list with linear colours. */
  A.buildKeys = function (table) {
    const keys = [];
    for (const h in table) {
      const src = table[h],
        k = { h: Number(h) };
      for (const n in src) {
        const v = src[n];
        if (typeof v === "string" && v[0] === "#") k[n] = new THREE.Color(v);
        else k[n] = v;
      }
      keys.push(k);
    }
    keys.sort((a, b) => a.h - b.h);
    return keys;
  };
  /** Sample keyframes at hour h (wrapping over 24h) into `out`. */
  A.sampleKeys = function (keys, h, out) {
    h = ((h % 24) + 24) % 24;
    let i = keys.length - 1;
    for (let k = 0; k < keys.length; k++) if (keys[k].h <= h) i = k;
    const a = keys[i],
      b = keys[(i + 1) % keys.length];
    let span = b.h - a.h;
    if (span <= 0) span += 24;
    let t = h - a.h;
    if (t < 0) t += 24;
    t = clamp(t / span, 0, 1);
    t = t * t * (3 - 2 * t);
    for (const n in a) {
      if (n === "h") continue;
      const va = a[n],
        vb = b[n] !== undefined ? b[n] : va;
      if (va && va.isColor) {
        (out[n] = out[n] && out[n].isColor ? out[n] : new THREE.Color())
          .copy(va)
          .lerp(vb, t);
      } else out[n] = lerp(va, vb, t);
    }
    return out;
  };

  // ------------------------------------------------------------------
  // Procedural noise texture (256², R = white noise, G = R shifted by
  // (37,17) — the classic trick for cheap 3D value noise in shaders;
  // B/A = smooth tileable fbm for broad variation).
  // ------------------------------------------------------------------
  function makeNoiseTexture() {
    const N = 256;
    const data = new Uint8Array(N * N * 4);
    const rng = G.util.rng(1337);
    const R = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) R[i] = (rng() * 256) | 0;
    // smooth tileable value-noise fbm for B / A
    function tileNoise(x, y, period, seed) {
      const xi = Math.floor(x),
        yi = Math.floor(y),
        xf = x - xi,
        yf = y - yi;
      const h = (a, b) => {
        a = ((a % period) + period) % period;
        b = ((b % period) + period) % period;
        return G.util.hash2(a + seed * 131, b + seed * 71);
      };
      const s = (t) => t * t * (3 - 2 * t);
      const v00 = h(xi, yi),
        v10 = h(xi + 1, yi),
        v01 = h(xi, yi + 1),
        v11 = h(xi + 1, yi + 1);
      return lerp(lerp(v00, v10, s(xf)), lerp(v01, v11, s(xf)), s(yf));
    }
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const i = y * N + x;
        data[i * 4] = R[i];
        data[i * 4 + 1] = R[((y - 17 + N) % N) * N + ((x - 37 + N) % N)];
        let b = 0,
          a = 0,
          amp = 0.5,
          f = 8;
        for (let o = 0; o < 4; o++) {
          b += amp * tileNoise((x * f) / N, (y * f) / N, f, 3 + o);
          a += amp * tileNoise((x * f * 2) / N, (y * f * 2) / N, f * 2, 11 + o);
          amp *= 0.5;
          f *= 2;
        }
        data[i * 4 + 2] = clamp((b / 0.9375) * 255, 0, 255) | 0;
        data[i * 4 + 3] = clamp((a / 0.9375) * 255, 0, 255) | 0;
      }
    }
    const tex = new THREE.DataTexture(
      data,
      N,
      N,
      THREE.RGBAFormat,
      THREE.UnsignedByteType,
    );
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.magFilter = THREE.LinearFilter;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.colorSpace = THREE.NoColorSpace;
    tex.needsUpdate = true;
    return tex;
  }
  A.noiseTex = makeNoiseTexture();

  // ------------------------------------------------------------------
  // Shared GLSL snippets
  // ------------------------------------------------------------------
  A.glsl = {};
  /** value noise helpers using uNoise (must declare `uniform sampler2D uNoise;`) */
  A.glsl.noise = `
    float an2(vec2 p){ return texture2D(uNoise, p / 256.0).r; }
    float afbm2(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a * an2(p); p = p * 2.03 + vec2(17.1, 9.3); a *= 0.5; } return v; }
    float afbm3o(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++){ v += a * an2(p); p = p * 2.07 + vec2(7.1, 29.3); a *= 0.5; } return v; }
    float an3(vec3 x){
      vec3 p = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
      vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
      vec2 rg = texture2D(uNoise, (uv + 0.5) / 256.0).yx;
      return mix(rg.x, rg.y, f.z);
    }
    float afbm3(vec3 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * an3(p); p = p * 2.02 + vec3(3.1, 7.7, 1.3); a *= 0.5; } return v; }
  `;
  // ------------------------------------------------------------------
  // HEIGHT FOG + AERIAL PERSPECTIVE (global ShaderChunk patch)
  // three's FogExp2 is a uniform wall: everything past ~800 m turns the same
  // flat green-grey, tall silhouettes vanish with their bases. We replace the
  // fog chunks for EVERY material (built-ins and ShaderMaterials that include
  // the chunks) with an analytic exponential height fog:
  //   density(y) = d · (haze + (1-haze) · exp(-(y - base) / H))
  // integrated along the camera→fragment ray (closed form), then FogExp2's
  // squared falloff on that effective length (keeps the clear-near /
  // hazy-far street look). Rays that climb fade toward a desaturated SKY tint
  // instead of the ground haze (aerial perspective), there is forward scatter
  // toward the sun/moon, and very bright HDR sources (lit windows, fires,
  // neon) punch through the haze at night.
  // Extra parameters live in SHARED uniform objects (plain {x,y,z,w} objects
  // are shared by reference through UniformsUtils.clone, and three's uniform
  // setters accept them) that 14_lighting.js writes once per frame.
  // Materials that never received them (all zero) fall back to plain FogExp2.
  // ------------------------------------------------------------------
  const FOGU = (A.fogShared = {
    nrcFogP: { value: { x: 0, y: 0, z: 0, w: 0 } }, // x: 1/scaleHeight, y: base height, z: haze floor 0..1, w: enabled
    nrcFogX: { value: { x: 0, y: 1, z: 0, w: 0 } }, // x: hot-light resist, y: max fog, z: aerial tint amount, w: -
    nrcFogSky: { value: { x: 0, y: 0, z: 0 } }, // aerial-perspective colour (desaturated sky)
    nrcFogSun: { value: { x: 0, y: 1, z: 0, w: 0 } }, // xyz: dir to sun/moon, w: forward-scatter strength
    nrcFogSunC: { value: { x: 0, y: 0, z: 0 } }, // forward-scatter colour
    nrcCld: { value: { x: 0, y: 0.6, z: 0, w: 0 } }, // CLOUD SHADOWS: x strength (0 = off), y coverage threshold, zw wind drift (m)
    nrcCldS: { value: { x: 0, y: 0, z: 0.004, w: 320 } }, // xy: light dir xz / y (ray up to the deck), z: 1/cell size, w: deck height
  });
  A.glsl.heightFogPars = `
    uniform vec4 nrcFogP; uniform vec4 nrcFogX; uniform vec3 nrcFogSky; uniform vec4 nrcFogSun; uniform vec3 nrcFogSunC;
    uniform vec4 nrcCld; uniform vec4 nrcCldS;
    // moving cloud shadows on the key light (sun, or moon at night): the point is followed up the light
    // ray to a virtual cloud deck and a 3-octave value noise drifting with the wind decides whether a
    // cloud sits there. Same function in JS (A.cloudShadowAt) for the viewmodel light.
    float nrcCH(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
    float nrcCN(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(nrcCH(i), nrcCH(i + vec2(1.0, 0.0)), f.x), mix(nrcCH(i + vec2(0.0, 1.0)), nrcCH(i + vec2(1.0, 1.0)), f.x), f.y); }
    // cloud-deck macro density (the sky dome draws its cumulus from the SAME field, so the shadow you
    // stand in belongs to the cloud you see between you and the sun)
    float nrcCloudN(vec2 q){ return nrcCN(q) * 0.62 + nrcCN(q * 2.13 + vec2(5.7, 1.9)) * 0.28 + nrcCN(q * 4.7 + vec2(2.3, 8.1)) * 0.1; }
    float nrcCloudSh(vec3 wp){
      if (nrcCld.x < 0.001) return 1.0;
      vec2 q = (wp.xz + nrcCldS.xy * max(nrcCldS.w - wp.y, 0.0) + nrcCld.zw) * nrcCldS.z;
      return 1.0 - nrcCld.x * smoothstep(nrcCld.y, nrcCld.y + 0.17, nrcCloudN(q));
    }
    // ray: world-space camera→point vector, camY: camera height, fc: base fog colour, src: surface colour (HDR)
    float nrcFogAmt(vec3 ray, float camY, float dens, vec3 fc, vec3 src, out vec3 fcol){
      float dist = length(ray);
      float L = dist;
      fcol = fc;
      if (nrcFogP.w > 0.5) {
        vec3 dir = ray / max(dist, 1e-3);
        float a = max(camY - nrcFogP.y, 0.0) * nrcFogP.x;
        float b = max(camY + ray.y - nrcFogP.y, 0.0) * nrcFogP.x;
        float db = b - a;
        float fh = abs(db) > 1e-3 ? (exp(-a) - exp(-b)) / db : exp(-a);
        L = dist * mix(fh, 1.0, nrcFogP.z);
        fcol = mix(fc, nrcFogSky, smoothstep(-0.03, 0.3, dir.y) * nrcFogX.z);
        float mu = max(dot(dir, nrcFogSun.xyz), 0.0);
        float mu2 = mu * mu; float mu4 = mu2 * mu2;
        fcol += nrcFogSunC * (mu4 * mu4 * 0.75 + mu2 * 0.25) * nrcFogSun.w;
      }
      float t = dens * L;
      float f = 1.0 - exp(-t * t);
      float hot = max(max(src.r, max(src.g, src.b)) - 1.2, 0.0);
      f /= 1.0 + hot * nrcFogX.x;
      return min(f, nrcFogP.w > 0.5 ? nrcFogX.y : 1.0);
    }
  `;
  (function patchFogChunks() {
    const SC = THREE.ShaderChunk;
    if (!SC || !SC.fog_fragment || A._fogPatched) return;
    A._fogPatched = true;
    SC.fog_pars_vertex = `
      #ifdef USE_FOG
        varying float vFogDepth;
        varying vec3 vFogRay;
        varying float vFogCamY;
      #endif
    `;
    SC.fog_vertex = `
      #ifdef USE_FOG
        vFogDepth = - mvPosition.z;
        vFogRay = vec3(dot(viewMatrix[0].xyz, mvPosition.xyz), dot(viewMatrix[1].xyz, mvPosition.xyz), dot(viewMatrix[2].xyz, mvPosition.xyz));
        vFogCamY = - dot(viewMatrix[1].xyz, viewMatrix[3].xyz);
      #endif
    `;
    SC.fog_pars_fragment = `
      #ifdef USE_FOG
        uniform vec3 fogColor;
        varying float vFogDepth;
        varying vec3 vFogRay;
        varying float vFogCamY;
        #ifdef FOG_EXP2
          uniform float fogDensity;
          ${A.glsl.heightFogPars}
        #else
          uniform float fogNear;
          uniform float fogFar;
        #endif
      #endif
    `;
    SC.fog_fragment = `
      #ifdef USE_FOG
        #ifdef FOG_EXP2
          vec3 nrcFogCol;
          float fogFactor = nrcFogAmt(vFogRay, vFogCamY, fogDensity, fogColor, gl_FragColor.rgb, nrcFogCol);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, nrcFogCol, fogFactor);
        #else
          float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
        #endif
      #endif
    `;
    // hand the shared parameter objects to every built-in shader that has fog, and to
    // UniformsLib.fog (ShaderMaterials merging it later get them by reference too)
    const add = (u) => {
      if (u && u.fogDensity)
        for (const k in FOGU) u[k] = { value: FOGU[k].value };
    };
    add(THREE.UniformsLib && THREE.UniformsLib.fog);
    for (const k in THREE.ShaderLib)
      add(THREE.ShaderLib[k] && THREE.ShaderLib[k].uniforms);
  })();

  // CLOUD SHADOWS: the shadow-casting directional light (atmosphere's sun/moon key — the only one)
  // is multiplied by nrcCloudSh() right after its shadow-map lookup. Only lit materials with the
  // height fog (they carry the uniforms and the world-position varying); off indoors (strength 0).
  (function patchCloudShadows() {
    const SC = THREE.ShaderChunk;
    if (!SC || !SC.lights_fragment_begin || A._cloudPatched) return;
    const rx =
      /(directLight\.color \*= \( directLight\.visible && receiveShadow \) \? getShadow\( directionalShadowMap\[ i \][^;]*;)/;
    if (!rx.test(SC.lights_fragment_begin)) {
      console.warn("[atmosphere] cloud shadows: three chunk changed, skipped");
      return;
    }
    A._cloudPatched = true;
    SC.lights_fragment_begin = SC.lights_fragment_begin.replace(
      rx,
      `$1
		#if defined( USE_FOG ) && defined( FOG_EXP2 )
		directLight.color *= nrcCloudSh( vFogRay + cameraPosition );
		#endif`,
    );
  })();
  // JS twin of nrcCloudSh (float64 vs float32 hashes differ only in the last bits)
  (function () {
    const fr = (x) => x - Math.floor(x);
    function h(px, py) {
      let a = fr(px * 0.1031),
        b = fr(py * 0.1031),
        c = fr(px * 0.1031);
      const d = a * (b + 33.33) + b * (c + 33.33) + c * (a + 33.33);
      a += d;
      b += d;
      c += d;
      return fr((a + b) * c);
    }
    function vn(x, y) {
      const ix = Math.floor(x),
        iy = Math.floor(y);
      let fx = x - ix,
        fy = y - iy;
      fx = fx * fx * (3 - 2 * fx);
      fy = fy * fy * (3 - 2 * fy);
      const a = h(ix, iy),
        b = h(ix + 1, iy),
        c = h(ix, iy + 1),
        d = h(ix + 1, iy + 1);
      return a + (b - a) * fx + (c + (d - c) * fx - (a + (b - a) * fx)) * fy;
    }
    A.cloudShadowAt = function (x, y, z) {
      const C = FOGU.nrcCld.value,
        S = FOGU.nrcCldS.value;
      if (C.x < 0.001) return 1;
      const up = Math.max(S.w - y, 0);
      const qx = (x + S.x * up + C.z) * S.z,
        qy = (z + S.y * up + C.w) * S.z;
      const n =
        vn(qx, qy) * 0.62 +
        vn(qx * 2.13 + 5.7, qy * 2.13 + 1.9) * 0.28 +
        vn(qx * 4.7 + 2.3, qy * 4.7 + 8.1) * 0.1;
      const t = Math.min(1, Math.max(0, (n - C.y) / 0.17));
      return 1 - C.x * t * t * (3 - 2 * t);
    };
  })();

  // ------------------------------------------------------------------
  // WET SURFACES (rain). Patched into every MeshStandard/Physical material (same
  // mechanism as the height fog, before anything compiles): while `nrcWet.x` > 0
  // porous surfaces darken, everything gets glossier, and up-facing ground
  // collects puddles (world-space noise) that turn almost mirror-smooth — street
  // lamps, neon and lightning then streak across the wet asphalt. Driven by
  // 30_weather.js (soaks in over ~20 s of rain, dries over ~1.5 min).
  // Needs the fog varyings (world position) → only on fogged materials.
  // x: wetness 0..1, y: puddle coverage 0..1, z: distance fade start (m)
  // ------------------------------------------------------------------
  const WETU = (A.wetShared = {
    nrcWet: { value: { x: 0, y: 0, z: 45, w: 0 } },
    nrcRip: { value: { x: 0, y: 0 } },
  });
  (function patchWetChunks() {
    const SC = THREE.ShaderChunk;
    if (
      !SC ||
      !SC.lights_physical_fragment ||
      !SC.lights_physical_pars_fragment ||
      A._wetPatched
    )
      return;
    A._wetPatched = true;
    SC.lights_physical_pars_fragment =
      `
      uniform vec4 nrcWet; uniform vec2 nrcRip;
      float nrcWH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float nrcWN(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(nrcWH(i), nrcWH(i + vec2(1.0, 0.0)), f.x), mix(nrcWH(i + vec2(0.0, 1.0)), nrcWH(i + vec2(1.0, 1.0)), f.x), f.y); }
    ` + SC.lights_physical_pars_fragment;
    SC.lights_physical_fragment =
      `
      #ifdef USE_FOG
      #define NRC_PUDTAG 1
      float nrcPudTag = 0.0;
      if (nrcWet.x > 0.001) {
        float nrcUp = smoothstep(0.55, 0.92, dot(normal, viewMatrix[1].xyz));
        vec3 nrcWP = vFogRay + cameraPosition;
        float nrcD = length(vFogRay);
        float nrcN = nrcWN(nrcWP.xz * 0.23) * 0.6 + nrcWN(nrcWP.xz * 0.9 + 7.3) * 0.3 + nrcWN(nrcWP.xz * 3.1) * 0.1;
        float nrcTh = 0.68 - nrcWet.y * 0.12;   // puddles in the low spots (~⅓ of the ground when soaked), not a mirror street
        float nrcPud = smoothstep(nrcTh, nrcTh + 0.05, nrcN) * nrcUp * (1.0 - smoothstep(nrcWet.z, nrcWet.z * 3.0, nrcD));
        float nrcW = nrcWet.x * mix(0.5, 1.0, nrcUp);
        float nrcPor = 1.0 - metalnessFactor;
        diffuseColor.rgb *= 1.0 - nrcW * nrcPor * 0.3 - nrcPud * nrcWet.x * 0.2;
        // raindrop rings in the puddles: two staggered cell layers of expanding ripples perturb the
        // normal (lamps and neon shiver in the water); faded out with distance before they can alias
        if (nrcRip.y > 0.01 && nrcPud > 0.02 && nrcD < 22.0) {
          vec2 nrcG = vec2(0.0);
          for (int l = 0; l < 2; l++) {
            vec2 q = nrcWP.xz * 2.4 + float(l) * vec2(0.37, 0.61);
            vec2 ci = floor(q) + float(l) * 17.0; vec2 cf = fract(q) - 0.5;
            float h = nrcWH(ci);
            vec2 dv = cf - (vec2(nrcWH(ci + 3.1), nrcWH(ci + 5.7)) - 0.5) * 0.36;
            float ph = fract(nrcRip.x * (0.8 + 0.5 * h) + h * 7.0);
            float d = length(dv), x = (d - ph * 0.42) * 30.0;
            float ring = sin(x * 3.0) * exp(-x * x * 0.5) * (1.0 - ph) * step(h, 0.25 + 0.75 * nrcRip.y);
            nrcG += dv / max(d, 1e-3) * ring;
          }
          float nrcRk = 0.45 * nrcPud * nrcRip.y * (1.0 - smoothstep(8.0, 22.0, nrcD));
          normal = normalize(normal + (viewMatrix[0].xyz * nrcG.x + viewMatrix[2].xyz * nrcG.y) * nrcRk);
        }
        roughnessFactor = mix(roughnessFactor, roughnessFactor * 0.6, nrcW);
        roughnessFactor = mix(roughnessFactor, 0.16, nrcPud * nrcWet.x);
        // specular anti-aliasing (Kaplanyan/Tokuyoshi): widen the lobe where the (normal-mapped) normal
        // varies inside the pixel → wet asphalt and car hoods no longer glitter under the lamps
        #if __VERSION__ >= 300 || defined(GL_OES_standard_derivatives)
          vec3 nrcNx = dFdx(normal), nrcNy = dFdy(normal);
          float nrcVar = 0.25 * (dot(nrcNx, nrcNx) + dot(nrcNy, nrcNy));
          float nrcA2 = roughnessFactor * roughnessFactor; nrcA2 *= nrcA2;
          roughnessFactor = max(sqrt(sqrt(clamp(nrcA2 + min(2.0 * nrcVar, 0.25), 0.0, 1.0))), 0.12);
        #endif
        // puddles are tagged for the post pass (screen-space mirror reflections), see opaque_fragment
        nrcPudTag = nrcPud * nrcWet.x * nrcWet.w;
      }
      #endif
    ` + SC.lights_physical_fragment;
    // puddle tag → alpha 0.87..0.97 in the HDR target (only opaque materials, only while the post
    // pipeline asked for it through nrcWet.w; the canvas has no alpha channel anyway)
    if (SC.opaque_fragment)
      SC.opaque_fragment =
        SC.opaque_fragment +
        `
      #if defined(NRC_PUDTAG) && defined(OPAQUE)
        if (nrcPudTag > 0.03) gl_FragColor.a = 0.87 + 0.1 * clamp(nrcPudTag, 0.0, 1.0);
      #endif
    `;
    const L = THREE.ShaderLib;
    for (const k of ["standard", "physical"])
      if (L[k] && L[k].uniforms)
        for (const n in WETU) L[k].uniforms[n] = { value: WETU[n].value };
  })();

  /** fog factor honoring FOG_EXP2 / linear (requires fog_pars_fragment include). Also sets
   *  `atmosFogC` = the aerial-perspective fog colour for this fragment (use it instead of fogColor). */
  A.glsl.fogFactor = `
    vec3 atmosFogC = vec3(0.0);
    float atmosFogFactor(){
      #ifdef USE_FOG
        atmosFogC = fogColor;
        #ifdef FOG_EXP2
          return nrcFogAmt(vFogRay, vFogCamY, fogDensity, fogColor, vec3(0.0), atmosFogC);
        #else
          return smoothstep(fogNear, fogFar, vFogDepth);
        #endif
      #else
        return 0.0;
      #endif
    }
  `;
  /** Fullscreen triangle vertex shader (for post passes) */
  A.glsl.fsVert = `
    varying vec2 vUv;
    void main(){ vUv = position.xy * 0.5 + 0.5; gl_Position = vec4(position.xy, 0.0, 1.0); }
  `;

  /** Create uniforms merged with fog uniforms (textures assigned after merge so they're not cloned). */
  A.fogUniforms = function (extra) {
    const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {}]);
    for (const k in extra) u[k] = extra[k];
    return u;
  };

  // ------------------------------------------------------------------
  // SOFT PARTICLES. 40_postfx.js copies the opaque scene depth (blit, WebGL2) right before the
  // transparent pass into `tSoftDepth`; smoke, fire, dust and explosion puffs fade out where they
  // meet walls and the ground instead of cutting hard lines through them. The uniform objects
  // are SHARED by reference (never clone a material that uses them).
  //   uSoftP: x near, y far, z enabled (0 → softK() returns 1), w -;  uSoftInv: 1 / scene target size
  // Vertex: write `vSoftZ = -mvPosition.z;`  Fragment: `a *= softK(vSoftZ, range_m);`
  // ------------------------------------------------------------------
  A.softU = {
    tSoftDepth: { value: null },
    uSoftP: { value: new THREE.Vector4(0.1, 3000, 0, 0) },
    uSoftInv: { value: new THREE.Vector2(1, 1) },
  };
  A.softUniforms = function (u) {
    for (const k in A.softU) u[k] = A.softU[k];
    return u;
  };
  A.glsl.softPars = `
    uniform sampler2D tSoftDepth; uniform vec4 uSoftP; uniform vec2 uSoftInv;
    varying float vSoftZ;
    float softK(float z, float range){
      if (uSoftP.z < 0.5) return 1.0;
      float d = texture2D(tSoftDepth, gl_FragCoord.xy * uSoftInv).r;
      if (d >= 0.99999) return 1.0;
      float nz = d * 2.0 - 1.0;
      float sz = 2.0 * uSoftP.x * uSoftP.y / (uSoftP.y + uSoftP.x - nz * (uSoftP.y - uSoftP.x));
      return clamp((sz - z) / max(range, 0.05), 0.0, 1.0);
    }
  `;

  /** Check a material compiled fine; returns false on GLSL errors. */
  A.validateMaterial = function (mat, geomOpt) {
    try {
      const r = G.renderer;
      const scene = new THREE.Scene();
      const mesh = new THREE.Mesh(
        geomOpt || new THREE.PlaneGeometry(1, 1),
        mat,
      );
      mesh.frustumCulled = false;
      scene.add(mesh);
      const cam = new THREE.PerspectiveCamera();
      r.compile(scene, cam);
      const props = r.properties.get(mat);
      const prog = props && props.currentProgram;
      if (prog && prog.diagnostics && prog.diagnostics.runnable === false)
        return false;
      if (prog && typeof prog.getUniforms === "function") prog.getUniforms(); // forces link check
      if (prog && prog.diagnostics && prog.diagnostics.runnable === false)
        return false;
      return true;
    } catch (e) {
      G.reportError("atmos:validate", e);
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Shader prewarm. Effects that first appear mid-combat (fireballs, shock
  // rings, ash/goo piles, dissolve materials…) would otherwise compile their
  // GL programs on the frame they spawn → a visible hitch on the first
  // explosion / disintegration. Systems register sample objects via
  // A.onPrewarm(fn → Object3D[]); after initDone they are compiled against the
  // real scene (fog + lights) and — when post-fx is on — the HDR render
  // target, so the cached program is exactly the one used at runtime.
  // ------------------------------------------------------------------
  A.prewarmFns = [];
  A.onPrewarm = (fn) => {
    A.prewarmFns.push(fn);
  };
  /**
   * Compile the materials of `root` (Object3D) for the world scene. async=true uses
   * renderer.compileAsync (parallel compile, no stall) when available → Promise.
   */
  A.compileFor = function (root, async) {
    const r = G.renderer;
    if (!r || !G.camera || !root) return Promise.resolve(false);
    const prevRT = r.getRenderTarget();
    const P = A.post;
    try {
      if (P && P.enabled && P.rtScene) r.setRenderTarget(P.rtScene);
      if (async && typeof r.compileAsync === "function") {
        const pr = r.compileAsync(root, G.camera, G.scene); // synchronous part (program creation) happens here
        r.setRenderTarget(prevRT);
        return Promise.resolve(pr).then(
          () => true,
          () => false,
        );
      }
      r.compile(root, G.camera, G.scene);
    } catch (e) {
      /* older three: ignore */
    }
    r.setRenderTarget(prevRT);
    return Promise.resolve(true);
  };
  function prewarm() {
    if (!A.prewarmFns.length || !G.renderer || !G.camera) return;
    const t0 = performance.now();
    const root = new THREE.Scene();
    root.fog = G.scene.fog;
    for (const fn of A.prewarmFns) {
      try {
        const objs = fn() || [];
        for (const o of objs)
          if (o) {
            o.frustumCulled = false;
            root.add(o);
          }
      } catch (e) {
        G.reportError("init:atmosphere/prewarm", e);
      }
    }
    A.compileFor(root, false);
    root.traverse((o) => {
      if (
        o.isMesh &&
        o.geometry &&
        o.geometry.userData &&
        o.geometry.userData.prewarmTemp
      )
        o.geometry.dispose();
    });
    A.prewarmMs = Math.round(performance.now() - t0);
  }
  A._prewarm = prewarm;

  // ------------------------------------------------------------------
  // Module registration
  // ------------------------------------------------------------------
  function interiorKeyAt(p) {
    const L = G.LAYOUT;
    if (!L || p.x < L.INTERIOR_X_MIN) return null;
    let best = null,
      bd = 1e9;
    for (const k in L.INTERIORS) {
      const o = L.INTERIORS[k].origin;
      const d = Math.hypot(p.x - o.x, p.z - o.z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best || "interior";
  }
  A.interiorKeyAt = interiorKeyAt;

  // ------------------------------------------------------------------
  // Headless screenshot helper (?shot=…): Chrome's --screenshot does not
  // always pick up the WebGL canvas when no further animation frames are
  // produced, so after core's runShot() finishes we copy the final frame
  // into an <img> layered over the canvas (below #ui-root). SHOT mode only.
  // ------------------------------------------------------------------
  if (G.SHOT) {
    G.events.on("initDone", () =>
      setTimeout(() => {
        try {
          const c = G.renderer && G.renderer.domElement;
          if (!c) return;
          // Only overlay a frame that actually contains an image: if the drawing buffer was
          // already cleared (black), an overlay would HIDE a valid canvas instead of fixing it.
          try {
            const probe = document.createElement("canvas");
            probe.width = 48;
            probe.height = 27;
            const pg = probe.getContext("2d");
            pg.drawImage(c, 0, 0, 48, 27);
            const px = pg.getImageData(0, 0, 48, 27).data;
            let sum = 0;
            for (let i = 0; i < px.length; i += 4)
              sum += px[i] + px[i + 1] + px[i + 2];
            if (sum / (px.length / 4) < 6) {
              console.warn(
                "[atmosphere] shot: frame buffer looks empty, no overlay",
              );
              return;
            }
          } catch (e) {
            /* tainted/unsupported → just overlay */
          }
          const img = document.createElement("img");
          img.src = c.toDataURL("image/png");
          img.id = "atmos-shot-frame";
          img.style.cssText =
            "position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none";
          (document.getElementById("game-root") || document.body).appendChild(
            img,
          );
          // the overlay is only for the capture: as soon as the game renders another frame
          // (someone keeps the loop running after the shot) it is removed again
          A.shotOverlay = img;
          const t0 = performance.now();
          A.onFrameRendered = () => {
            if (performance.now() - t0 > 1500 && A.shotOverlay) {
              A.shotOverlay.remove();
              A.shotOverlay = null;
              A.onFrameRendered = null;
            }
          };
        } catch (e) {
          /* ignore */
        }
      }, 0),
    );
  }

  G.registerModule({
    name: "atmosphere",
    order: 15,
    init: function () {
      A.quality = ATMOS.quality = G.SMOKE ? "medium" : "high";
      try {
        const q = localStorage.getItem("nrc_gfx_quality");
        if (q) A.quality = ATMOS.quality = q;
      } catch (e) {
        /* ignore */
      }
      for (const s of A.systems) {
        if (!s.init) continue;
        const t0 = performance.now();
        try {
          s.init();
        } catch (e) {
          s._dead = true;
          G.reportError("init:atmosphere/" + s.name, e);
        }
        s._initMs = Math.round(performance.now() - t0);
      }
      G.events.on("initDone", () => {
        try {
          prewarm();
        } catch (e) {
          G.reportError("event:initDone/atmosphere-prewarm", e);
        }
      });
      G.events.on("reset", () => {
        A.flushTimersOnReset();
        for (const s of A.systems)
          if (s.reset && !s._dead) {
            try {
              s.reset();
            } catch (e) {
              G.reportError("event:reset/atmosphere/" + s.name, e);
            }
          }
      });
      A.ready = true;
    },
    update: function (dt, realDt) {
      // visual time: world time while the world runs; real time on the title screen/menus
      // that show the world in motion (title, chargen); frozen in the goggles menu / pause.
      const st = G.state;
      const animDt = G.worldRunning()
        ? dt
        : st === "title" ||
            st === "loading" ||
            st === "chargen" ||
            st === "dead"
          ? realDt
          : 0;
      A.animDt = animDt;
      A.animTime += animDt;
      A.realTime += realDt;
      if (G.camera) A.camPos.copy(G.camera.position);
      // interior detection (camera-based: title camera, cutscene cams etc.)
      const key = interiorKeyAt(A.camPos);
      const inter = !!key;
      if (inter !== ATMOS.interior || key !== ATMOS.interiorKey) {
        ATMOS.interior = inter;
        ATMOS.interiorKey = key;
        A.envSnap = true; // snap environment on transitions (doors fade to black anyway)
        G.events.emit("atmosInterior", inter, key);
      }
      if (!inter && G.LAYOUT)
        ATMOS.district = G.LAYOUT.districtAt(A.camPos.x, A.camPos.z);
      else ATMOS.district = "interior";
      runTimers(animDt);
      for (const s of A.systems) {
        if (s._dead || !s.update) continue;
        try {
          s.update(dt, realDt, animDt);
        } catch (e) {
          G.reportError("update:atmosphere/" + s.name, e);
          s._errs = (s._errs || 0) + 1;
          if (s._errs > 30) s._dead = true;
        }
      }
    },
    lateUpdate: function (dt, realDt) {
      if (G.camera) {
        G.camera.updateMatrixWorld();
        A.camPos.copy(G.camera.position);
      }
      const animDt = A.animDt || 0;
      for (const s of A.systems) {
        if (s._dead || !s.late) continue;
        try {
          s.late(dt, realDt, animDt);
        } catch (e) {
          G.reportError("late:atmosphere/" + s.name, e);
          s._errs = (s._errs || 0) + 1;
          if (s._errs > 30) s._dead = true;
        }
      }
      A.envSnap = false;
    },
  });
})();
