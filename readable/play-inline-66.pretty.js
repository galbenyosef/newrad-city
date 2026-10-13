/* src/atmosphere/59_fx_candles.js */
/* =====================================================================
 * ATMOSPHERE / FX — candle fields (one instanced draw call)
 * Hundreds of small candle flames for the story's candle places (the Hall
 * of Candles under Grand Central, the M42 Sun Room, the C-9 service door,
 * shrines): camera-facing (vertical-axis) flame cards with a hot core, a
 * teardrop body, a soft halo and a per-candle flicker in the shader. A few
 * real pools of light come from G.atmos.addFixtureLight at cluster centres
 * (the fixture pool lights the nearest ones only), so a thousand candles cost
 * one draw and no extra lights.
 *
 *   G.fx.candles(points, opts) → {count, setLit(bool | i, bool), remove()}
 *     points: [{x, y, z}] wick-tip positions (world, any cell), or
 *             [[x, y, z, size?], …]; opts: {size = 0.06 (flame height m),
 *             color = 0xffb35a, lights = auto (≤ 4), lightIntensity = 0.9,
 *             lightRange = 6, flicker = 1}
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._;
  const FX = G.fx;
  const ATMOS = G.atmos;

  const VERT = `
    attribute vec4 iP;    // wick tip xyz, flame height (0 = unlit)
    attribute vec4 iC;    // rgb, seed
    uniform float uTime;
    varying vec2 vUv; varying vec3 vCol; varying float vSeed;
    #include <fog_pars_vertex>
    void main(){
      vec4 mv = modelViewMatrix * vec4(iP.xyz, 1.0);
      // vertical-axis billboard: the card's up is world up projected into view space
      vec3 up = normalize((modelViewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
      vec3 side = normalize(cross(up, vec3(0.0, 0.0, 1.0)));
      float h = iP.w;
      float sway = sin(uTime * 3.1 + iC.w * 17.0) * 0.12 + sin(uTime * 7.3 + iC.w * 5.0) * 0.05;
      vec2 q = position.xy;                         // x in [-1,1], y in [-0.6, 1.6] (halo around the flame)
      vec3 p = mv.xyz + side * q.x * h * 0.9 + up * (q.y * h + q.y * q.y * sway * h * 0.4);
      p += side * sway * h * max(q.y, 0.0) * 0.25;
      gl_Position = projectionMatrix * vec4(p, 1.0);
      vUv = q; vCol = iC.rgb; vSeed = iC.w;
      vec4 mvPosition = vec4(p, 1.0);
      #include <fog_vertex>
    }
  `;
  const FRAG = `
    uniform float uTime; uniform float uFlicker;
    varying vec2 vUv; varying vec3 vCol; varying float vSeed;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    void main(){
      float t = uTime + vSeed * 13.0;
      float fl = 1.0 - uFlicker * (0.12 * sin(t * 9.0) * sin(t * 4.1) + 0.08 * sin(t * 23.0 + vSeed * 3.0));
      // teardrop: narrow at the tip (y = 1), round at the base (y = 0)
      float y = vUv.y, x = vUv.x;
      float wid = 0.42 * pow(clamp(1.0 - y, 0.0, 1.0), 0.6) * smoothstep(-0.25, 0.15, y);
      float body = 1.0 - smoothstep(wid * 0.55, wid, abs(x));
      body *= smoothstep(-0.2, 0.05, y) * (1.0 - smoothstep(0.85, 1.0, y));
      float core = (1.0 - smoothstep(0.0, wid * 0.45, abs(x))) * smoothstep(-0.1, 0.1, y) * (1.0 - smoothstep(0.25, 0.6, y));
      float blue = (1.0 - smoothstep(0.0, 0.18, abs(y + 0.02))) * (1.0 - smoothstep(0.0, 0.25, abs(x)));
      float halo = exp(-(x * x * 2.2 + (y - 0.3) * (y - 0.3) * 1.6) * 2.0) * 0.22;
      vec3 col = vCol * body * 1.6 + vec3(1.0, 0.95, 0.8) * core * 1.8 + vec3(0.25, 0.35, 1.0) * blue * 0.35 + vCol * halo;
      col *= fl;
      float ff = atmosFogFactor();
      gl_FragColor = vec4(col * (1.0 - ff), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  const CAP = 3072;
  const candles = []; // {x,y,z,h,r,g,b,seed,lit,group}
  let mesh = null,
    aP,
    aC,
    dirty = true,
    time = 0;
  const uni = { uTime: { value: 0 }, uFlicker: { value: 1 } };

  function init() {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([-1, -0.6, 0, 1, -0.6, 0, -1, 1.6, 0, 1, 1.6, 0]),
        3,
      ),
    );
    geo.setIndex([0, 1, 2, 2, 1, 3]);
    const mk = (n) => {
      const at = new THREE.InstancedBufferAttribute(
        new Float32Array(CAP * n),
        n,
      );
      at.setUsage(THREE.DynamicDrawUsage);
      return at;
    };
    aP = mk(4);
    aC = mk(4);
    geo.setAttribute("iP", aP);
    geo.setAttribute("iC", aC);
    geo.instanceCount = 0;
    const mat = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms(uni),
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquation: THREE.AddEquation,
    });
    mat.name = "atmos_candles";
    mesh = new THREE.Mesh(geo, mat);
    mesh.name = "atmos_candles";
    mesh.frustumCulled = false;
    mesh.renderOrder = 34;
    mesh.visible = false;
    G.scene.add(mesh);
  }
  function update(dt) {
    time += Math.max(0, dt || 0);
    uni.uTime.value = time % 1000;
  }
  function late() {
    if (!mesh || !dirty) return;
    dirty = false;
    const n = Math.min(candles.length, CAP),
      P = aP.array,
      C = aC.array;
    for (let i = 0; i < n; i++) {
      const c = candles[i],
        o = i * 4;
      P[o] = c.x;
      P[o + 1] = c.y;
      P[o + 2] = c.z;
      P[o + 3] = c.lit ? c.h : 0;
      C[o] = c.r;
      C[o + 1] = c.g;
      C[o + 2] = c.b;
      C[o + 3] = c.seed;
    }
    mesh.geometry.instanceCount = n;
    mesh.visible = n > 0;
    if (n)
      for (const at of [aP, aC]) {
        at.updateRange.offset = 0;
        at.updateRange.count = n * 4;
        at.needsUpdate = true;
      }
  }
  // world dressing: candle fields survive new game / load (their owners remove() them); only re-upload
  function reset() {
    dirty = true;
  }

  const groups = [];
  /** Public: a field of candles. */
  FX.candles = function (points, opts) {
    opts = opts || {};
    if (!points || !points.length)
      return { count: 0, setLit() {}, remove() {} };
    const col = A.color(opts.color === undefined ? 0xffb35a : opts.color),
      size = opts.size || 0.06,
      k = 1.6;
    const mine = [];
    for (const p of points) {
      if (candles.length >= CAP) break;
      const x = Array.isArray(p) ? p[0] : p.x,
        y = Array.isArray(p) ? p[1] : p.y,
        z = Array.isArray(p) ? p[2] : p.z;
      if (!isFinite(x) || !isFinite(y) || !isFinite(z)) continue;
      const h =
        (Array.isArray(p) ? p[3] : p.size) ||
        size * (0.8 + Math.random() * 0.4);
      const c = {
        x,
        y,
        z,
        h,
        r: col.r * k,
        g: col.g * k,
        b: col.b * k,
        seed: Math.random() * 100,
        lit: opts.lit !== false,
      };
      candles.push(c);
      mine.push(c);
    }
    dirty = true;
    // a few real pools of light at cluster centres (k-means-ish: split along the longest axis)
    const lights = [];
    const nl = Math.min(
      4,
      opts.lights === undefined
        ? Math.max(1, Math.round(mine.length / 60))
        : opts.lights,
    );
    if (ATMOS.addFixtureLight && nl > 0 && mine.length) {
      const sorted = mine.slice().sort((a, b) => a.x - b.x || a.z - b.z);
      for (let i = 0; i < nl; i++) {
        const part = sorted.slice(
          Math.floor((i * sorted.length) / nl),
          Math.floor(((i + 1) * sorted.length) / nl),
        );
        if (!part.length) continue;
        const cx = part.reduce((s, c) => s + c.x, 0) / part.length,
          cy = part.reduce((s, c) => s + c.y, 0) / part.length,
          cz = part.reduce((s, c) => s + c.z, 0) / part.length;
        try {
          lights.push(
            ATMOS.addFixtureLight(
              { x: cx, y: cy + 0.25, z: cz },
              opts.color === undefined ? 0xffa850 : opts.color,
              {
                intensity: opts.lightIntensity || 0.9,
                range: opts.lightRange || 6,
                flicker: 0.35,
                glow: false,
                always: true,
              },
            ),
          );
        } catch (e) {
          /* */
        }
      }
    }
    const g = {
      get count() {
        return mine.length;
      },
      setLit(a, b) {
        if (typeof a === "number") {
          if (mine[a]) mine[a].lit = !!b;
        } else for (const c of mine) c.lit = !!a;
        dirty = true;
      },
      remove() {
        for (const c of mine) {
          const i = candles.indexOf(c);
          if (i >= 0) candles.splice(i, 1);
        }
        mine.length = 0;
        for (const l of lights) {
          try {
            l.remove();
          } catch (e) {
            /* */
          }
        }
        lights.length = 0;
        const gi = groups.indexOf(g);
        if (gi >= 0) groups.splice(gi, 1);
        dirty = true;
      },
    };
    groups.push(g);
    return g;
  };
  FX.candleStats = () => ({
    candles: candles.length,
    groups: groups.length,
    cap: CAP,
  });

  A.addSystem({ name: "candles", order: 63, init, update, late, reset });
})();
