// play-inline-45 02 — three
// Lines 24-368 of readable/play-inline-45.pretty.js (statement-aligned).
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
