/* src/atmosphere/54_fx_lights_decals.js */
/* =====================================================================
 * ATMOSPHERE / FX — flash lights, glow sprites, decals, floating text
 *  - A pool of 3 PointLights (permanently in the scene, intensity 0 when
 *    idle → no shader recompiles) used by G.fx.flash for muzzle flashes,
 *    explosions, lightning. Plus one viewmodel light in G.viewScene so the
 *    first-person gun is lit by its own muzzle flash.
 *  - Glow sprites: G.fx.glowSprite() returns a lightweight Object3D proxy
 *    (parent it anywhere); ALL glows are drawn in ONE instanced additive
 *    draw call, brighter at night, fogged, respecting parent visibility/LOD.
 *  - Decals: one InstancedMesh (lit MeshStandardMaterial, per-instance atlas
 *    cell/alpha/heat) — bullet holes per surface, scorch marks, blood
 *    (red/green/oil), laser & plasma burns (glowing, cooling), goo, cracks.
 *  - Floating text sprites (damage numbers / "+XP" if anyone wants them).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    FX = G.fx;

  // ==================================================================
  // Flash light pool
  // ==================================================================
  // Every PointLight in the scene costs every lit fragment a loop iteration (even at
  // intensity 0), so the pool is small: 3 on medium/high, 2 on low. Combined with the
  // viewmodel light (separate scene) and the goggle lamp this stays within the
  // CONTRACT budget of ≤ 6 dynamic lights.
  let POOL = 3,
    flashSeq = 0;
  const flashes = [];
  let viewLight = null,
    viewT = 0,
    viewDur = 0.06,
    viewI = 0;

  /** render_lighting's virtual lights are compiled in and switched on (lamps / fires / fixtures get
   *  their pools of light from them — atmosphere's real PointLights are then only needed for combat). */
  A.rlVirtualLights = function () {
    const RL = G.rlight;
    if (
      !RL ||
      G.isStub("rlight") ||
      RL.safeMode ||
      RL.patched === false ||
      RL.lights === false
    )
      return false;
    if (RL.lightsInfo) {
      try {
        const i = RL.lightsInfo();
        if (!i || !i.patched) return false;
      } catch (e) {
        return false;
      }
    }
    return true;
  };
  function initLights() {
    POOL = A.quality === "low" ? 2 : 3;
    // With render_lighting's virtual lights doing the lamps, the third PointLight only ever served a
    // fixture: every lit fragment in the world pays a loop iteration per PointLight (even at intensity
    // 0), so drop to 2 — combat flashes keep both (fixtures no longer borrow slots outdoors).
    // ?pool=3 restores the old pool for A/B tests.
    const qp = G.QS && G.QS.get("pool");
    if (POOL === 3 && A.rlVirtualLights() && qp !== "3") POOL = 2;
    if (qp === "2" || qp === "3") POOL = +qp;
    for (let i = 0; i < POOL; i++) {
      const l = new THREE.PointLight(0xffaa55, 0, 10, 2);
      l.name = "atmos_flash_" + i;
      l.castShadow = false;
      G.scene.add(l);
      flashes.push({
        light: l,
        t: 1,
        dur: 0,
        i0: 0,
        flicker: 0,
        follow: null,
        curve: "exp",
        prio: 1,
      });
    }
    // The weapons module owns the first-person muzzle light (weapons/50_view.js V.light). Only
    // when it is absent do we add our own, so the gun is never lit twice per shot.
    if (G.viewScene && G.isStub("weapons")) {
      viewLight = new THREE.PointLight(0xffc070, 0, 3, 2);
      viewLight.name = "atmos_view_flash";
      viewLight.position.set(0.1, -0.05, -0.8);
      G.viewScene.add(viewLight);
    }
  }
  /**
   * Temporary point light. color, intensity (≈ illuminance at 1/3 range; 1–4 typical), dur seconds.
   * opts: {range, follow:Object3D|Vector3, flicker:0..1, curve:'exp'|'linear'|'hold',
   *        priority: 0 = ambient (fires; only takes FREE slots or other ambient ones), 1 = combat (default), 2 = big (explosions, lightning)}
   * Returns a handle {light, stop()} or null if culled / no slot.
   */
  FX.flash = function (pos, color, intensity, dur, opts) {
    opts = opts || {};
    if (!pos || flashes.length === 0) return null;
    intensity = intensity === undefined ? 2 : intensity;
    dur = dur === undefined ? 0.12 : dur;
    const range = opts.range || 6 + 4 * Math.sqrt(Math.max(0.1, intensity));
    const d = A.camDist(pos);
    if (d > range + 90) return null; // too far to matter
    const prio =
      opts.priority !== undefined ? opts.priority : intensity >= 6 ? 2 : 1;
    // pick a free slot; else steal the lowest-priority, weakest one (a muzzle flash always
    // beats a flickering fire; nothing steals from a bigger event than itself)
    let best = null,
      bestScore = Infinity;
    for (const f of flashes) {
      const busy = f.t < f.dur;
      if (busy && f.prio > prio) continue;
      const score = busy ? 1 + f.prio * 1e6 + f.light.intensity : -1;
      if (score < bestScore) {
        bestScore = score;
        best = f;
      }
    }
    if (!best) return null;
    const f = best;
    if (f.fixture) {
      f.fixture.entry = null;
      f.fixture = null;
    } // combat flash wins over a lamp's pool of light
    f.t = 0;
    f.dur = dur;
    f.prio = prio;
    f.flicker = opts.flicker || 0;
    f.follow = opts.follow || null;
    f.curve = opts.curve || "exp";
    f.light.position.copy(pos);
    A.color(color === undefined ? 0xffaa55 : color, f.light.color);
    f.light.distance = range;
    f.i0 = intensity * Math.pow(range * 0.33, 2);
    f.light.intensity = f.i0;
    const token = (f.owner = ++flashSeq);
    return {
      light: f.light,
      stop() {
        if (f.owner === token) {
          f.t = f.dur;
          f.light.intensity = 0;
        }
      },
      /** still holding its pool slot? */
      alive() {
        return f.owner === token && f.t < f.dur;
      },
      /** keep a continuous source (fire) on the same slot instead of re-grabbing one */
      extend(d, p) {
        if (f.owner !== token) return false;
        f.t = 0;
        f.dur = d || f.dur;
        if (p) f.light.position.copy(p);
        return true;
      },
    };
  };
  /** Pulse the viewmodel light (muzzle flash on the first-person weapon). */
  A.flashPool = flashes;
  A.viewFlash = function (color, intensity, dur) {
    if (!viewLight) return;
    A.color(color || 0xffc070, viewLight.color);
    viewI = (intensity || 1) * 2.5;
    viewT = 0;
    viewDur = dur || 0.06;
  };
  function updateLights(dt, realDt) {
    if (A.fxFreeze) dt = 0; // debug (?fxfreeze=1)
    for (const f of flashes) {
      if (f.fixture) continue; // driven by the fixture-light manager (55_fx_fixtures.js)
      if (f.t >= f.dur) {
        if (f.light.intensity !== 0) f.light.intensity = 0;
        continue;
      }
      f.t += dt;
      const u = Math.min(1, f.t / Math.max(1e-3, f.dur));
      let k =
        f.curve === "linear"
          ? 1 - u
          : f.curve === "hold"
            ? u < 0.7
              ? 1
              : 1 - (u - 0.7) / 0.3
            : Math.exp(-u * 4) * (1 - u);
      if (f.flicker)
        k *=
          1 - f.flicker * 0.5 * (1 + Math.sin(f.t * 47) * Math.sin(f.t * 23));
      f.light.intensity = u >= 1 ? 0 : f.i0 * Math.max(0, k);
      if (f.follow) {
        if (f.follow.isVector3) f.light.position.copy(f.follow);
        else if (f.follow.getWorldPosition)
          f.follow.getWorldPosition(f.light.position);
      }
    }
    if (viewLight) {
      if (viewT < viewDur) {
        viewT += realDt;
        viewLight.intensity = viewI * Math.max(0, 1 - viewT / viewDur);
      } else viewLight.intensity = 0;
    }
  }

  // ==================================================================
  // Glow sprites (batched)
  // ==================================================================
  const GLOW_CAP = 2048;
  const glows = [];
  let glowMesh = null,
    gPos,
    gCol;
  const GVERT = `
    attribute vec4 iPos; attribute vec4 iCol;
    varying vec2 vQ; varying vec4 vCol;
    #include <fog_pars_vertex>
    void main(){
      vec4 mv = modelViewMatrix * vec4(iPos.xyz, 1.0);
      // clamp the on-screen size: a glow right next to the camera must never balloon into a
      // quarter-screen orb (max ≈ 0.16 × distance → ~12% of the screen height at 70° fov)
      float size = min(iPos.w, max(0.05, -mv.z) * 0.16);
      // pull the quad toward the camera so the lamp housing / fixture it surrounds can't cut
      // dark bars through it (never past the near plane, never more than half the distance)
      vec3 toCam = normalize(-mv.xyz);
      mv.xyz += toCam * min(max(size * 0.9, 0.75), max(0.0, -mv.z - 0.3) * 0.5);
      mv.xy += position.xy * size;
      gl_Position = projectionMatrix * mv;
      vQ = position.xy * 2.0; vCol = iCol;
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }
  `;
  const GFRAG = `
    varying vec2 vQ; varying vec4 vCol;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    void main(){
      float d2 = dot(vQ, vQ);
      if (d2 > 1.0) discard;
      // Colour-preserving glow: the halo and core keep the lamp's HUE (a sodium lamp stays
      // amber, neon stays pink) — the core's peak is capped so tone mapping can't flatten it
      // to a white disc; only a tiny centre desaturates toward white-hot. Bloom adds the rest.
      vec3 c = vCol.rgb * vCol.a;
      float m = max(max(c.r, c.g), c.b);
      if (m < 1e-4) discard;
      vec3 hue = c / m;
      float Ic = min(m, 1.1);
      float halo = exp(-d2 * 5.0) * 0.30 * m;
      float core = exp(-d2 * 26.0) * 0.72 * Ic;
      float hot = exp(-d2 * 150.0) * 0.55 * Ic;
      vec3 col = hue * (halo + core) + mix(hue, vec3(1.0), 0.55) * hot;
      col *= 1.0 - d2;
      float ff = atmosFogFactor();
      gl_FragColor = vec4(col * (1.0 - ff * 0.92), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  function initGlows() {
    const geo = new THREE.InstancedBufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          -0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0,
        ]),
        3,
      ),
    );
    geo.setIndex([0, 1, 2, 0, 2, 3]);
    gPos = new THREE.InstancedBufferAttribute(
      new Float32Array(GLOW_CAP * 4),
      4,
    );
    gPos.setUsage(THREE.DynamicDrawUsage);
    gCol = new THREE.InstancedBufferAttribute(
      new Float32Array(GLOW_CAP * 4),
      4,
    );
    gCol.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("iPos", gPos);
    geo.setAttribute("iCol", gCol);
    geo.instanceCount = 0;
    const mat = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({}),
      vertexShader: GVERT,
      fragmentShader: GFRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      blendEquation: THREE.AddEquation,
    });
    mat.name = "atmos_glows";
    glowMesh = new THREE.Mesh(geo, mat);
    glowMesh.name = "atmos_glows";
    glowMesh.frustumCulled = false;
    glowMesh.renderOrder = 40;
    G.scene.add(glowMesh);
  }
  /**
   * Fake light halo (street lamps, neon, fires, terminals…). Returns an Object3D proxy you may parent anywhere
   * (its world position/scale/visibility drive the glow). Also exposes .material.color / .material.opacity
   * like a Sprite. opts: {intensity=1.6, dayFactor=0.35 (visibility by day), flicker=0 (0..1), parent, add=true}
   */
  FX.glowSprite = function (pos, color, size, opts) {
    opts = opts || {};
    const o = new THREE.Object3D();
    o.name = "atmos_glow";
    o.isAtmosGlow = true;
    A.v3(pos, o.position);
    const c = A.color(color === undefined ? 0xffd8a0 : color);
    o.glowSize = size || 1.5;
    o.glowIntensity = opts.intensity !== undefined ? opts.intensity : 1.6;
    o.dayFactor = opts.dayFactor !== undefined ? opts.dayFactor : 0.35;
    o.flicker = opts.flicker || 0;
    o.material = { color: c, opacity: 1, isFakeMaterial: true };
    o._seed = Math.random() * 100;
    o._fresh = true;
    o.setColor = (col) => {
      A.color(col, o.material.color);
      return o;
    };
    o.setIntensity = (i) => {
      o.glowIntensity = i;
      return o;
    };
    o.setSize = (s) => {
      o.glowSize = s;
      return o;
    };
    o._disposed = false;
    o.dispose = () => {
      o._disposed = true;
      if (o.parent) o.parent.remove(o);
      unlist(o);
    };
    // (re-)register whenever it is attached somewhere: detached glows are dropped from the
    // list immediately and come back automatically if someone re-parents them
    o.addEventListener("added", () => {
      if (!o._disposed) list(o);
    });
    if (opts.parent) opts.parent.add(o);
    else if (opts.add !== false) G.scene.add(o);
    list(o);
    return o;
  };
  function list(o) {
    if (!o._listed) {
      o._listed = true;
      o._visF = -1;
      glows.push(o);
    }
  }
  function unlist(o) {
    if (!o._listed) return;
    o._listed = false;
    const i = glows.indexOf(o);
    if (i >= 0) glows.splice(i, 1);
  }
  function effVisible(o) {
    let p = o,
      depth = 0;
    while (p) {
      if (!p.visible) return false;
      if (p === G.scene) return true;
      p = p.parent;
      if (++depth > 32) return false;
    }
    return false; // not (yet) attached to the scene
  }
  const _gp = new THREE.Vector3(),
    _gs = new THREE.Vector3();
  const _frustum = new THREE.Frustum(),
    _pv = new THREE.Matrix4(),
    _sph = new THREE.Sphere();
  let glowFrame = 0;
  function uploadGlows() {
    if (!glowMesh) return;
    const env = A.env,
      night = env.interior ? 1 : env.night;
    const P = gPos.array,
      C = gCol.array;
    const cam = A.camPos,
      t = A.animTime;
    let n = 0;
    glowFrame++;
    const camObj = G.camera;
    const LC = A.glowLightCands || (A.glowLightCands = []);
    let nLC = 0;
    const lightsFromGlows = !env.interior && night > 0.35;
    if (camObj) {
      _pv.multiplyMatrices(camObj.projectionMatrix, camObj.matrixWorldInverse);
      _frustum.setFromProjectionMatrix(_pv);
    }
    for (let k = glows.length - 1; k >= 0; k--) {
      const o = glows[k];
      if (!o.parent) {
        unlist(o);
        continue;
      } // detached → drop now ('added' re-lists it)
      if (o._fresh) {
        o.updateWorldMatrix(true, false);
        o._fresh = false;
      }
      const e = o.matrixWorld.elements;
      _gp.set(e[12], e[13], e[14]);
      const dx = _gp.x - cam.x,
        dy = _gp.y - cam.y,
        dz = _gp.z - cam.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 > 900 * 900) continue;
      _gs.set(e[0], e[1], e[2]);
      const sc = _gs.length();
      // candidates for a real pool of light at night (street lamps, neon, fires) — see 55_fx_fixtures.js.
      // Collected before the frustum test: a lamp just behind you still lights the street you look at.
      if (
        lightsFromGlows &&
        d2 < 900 &&
        !o.noLight &&
        o.glowSize * sc >= 0.5 &&
        nLC < 48 &&
        o._vis !== false
      ) {
        const lc =
          LC[nLC] ||
          (LC[nLC] = {
            x: 0,
            y: 0,
            z: 0,
            r: 1,
            g: 1,
            b: 1,
            i: 0,
            size: 1,
            flicker: 0,
            seed: 0,
            obj: null,
          });
        const vis0 = o.dayFactor + (1 - o.dayFactor) * night;
        lc.x = _gp.x;
        lc.y = _gp.y;
        lc.z = _gp.z;
        lc.r = o.material.color.r;
        lc.g = o.material.color.g;
        lc.b = o.material.color.b;
        lc.i =
          o.glowIntensity *
          vis0 *
          (o.material.opacity !== undefined ? o.material.opacity : 1);
        lc.size = o.glowSize * sc;
        lc.flicker = o.flicker;
        lc.seed = o._seed;
        lc.obj = o;
        if (lc.i > 0.25) nLC++;
      }
      // frustum cull BEFORE the (parent-chain) visibility walk
      if (camObj) {
        _sph.center.copy(_gp);
        _sph.radius = o.glowSize * sc * 0.6 + 0.5;
        if (!_frustum.intersectsSphere(_sph)) continue;
      }
      // effective visibility is cached and refreshed every 6 frames (staggered per glow)
      if (o._visF < 0 || (glowFrame + k) % 6 === 0) {
        o._vis = effVisible(o);
        o._visF = glowFrame;
      }
      if (!o._vis) continue;
      if (n >= GLOW_CAP) break;
      const vis = o.dayFactor + (1 - o.dayFactor) * night;
      let inten =
        o.glowIntensity *
        vis *
        (o.material.opacity !== undefined ? o.material.opacity : 1);
      if (o.flicker)
        inten *=
          1 -
          o.flicker *
            (0.5 +
              0.5 *
                Math.sin(t * 17 + o._seed) *
                Math.sin(t * 7.3 + o._seed * 3)) *
            (Math.sin(t * 2.1 + o._seed) > 0.6 ? 1 : 0.3);
      if (inten <= 0.002) continue;
      const c = o.material.color;
      const i4 = n * 4;
      P[i4] = _gp.x;
      P[i4 + 1] = _gp.y;
      P[i4 + 2] = _gp.z;
      P[i4 + 3] = o.glowSize * sc;
      C[i4] = c.r * inten;
      C[i4 + 1] = c.g * inten;
      C[i4 + 2] = c.b * inten;
      C[i4 + 3] = 1;
      n++;
    }
    A.glowLightCandN = nLC;
    glowMesh.geometry.instanceCount = n;
    glowMesh.visible = n > 0;
    if (n) {
      gPos.updateRange.offset = 0;
      gPos.updateRange.count = n * 4;
      gPos.needsUpdate = true;
      gCol.updateRange.offset = 0;
      gCol.updateRange.count = n * 4;
      gCol.needsUpdate = true;
    }
  }
  A.glowCount = () => glows.length;
  /** Public, read-only walk over every live glow sprite (render_lighting request f): fn(glowProxy, index).
   *  The proxy is an Object3D (world position via getWorldPosition); `.glowSize`, `.noLight`, `.material.color`. */
  FX.forEachGlow = function (fn) {
    for (let k = 0; k < glows.length; k++) {
      try {
        fn(glows[k], k);
      } catch (e) {
        G.reportError("fx/forEachGlow", e);
        return;
      }
    }
  };

  // ==================================================================
  // Decals
  // ==================================================================
  const DK = {
    bullet: 0,
    bullet_concrete: 0,
    bullet_metal: 1,
    scorch: 2,
    blood: 3,
    blood_red: 3,
    blood_green: 4,
    green_blood: 4,
    laser: 5,
    laser_burn: 5,
    plasma: 6,
    plasma_burn: 6,
    crack: 7,
    oil: 8,
    blood_oil: 8,
    goo: 9,
    scorch_small: 10,
    blood_smear: 11,
    bullet_wood: 12,
    puddle: 13,
    dirt: 14,
    rad_puddle: 15,
    radiation: 15,
  };
  const DEC_CAP = 360;
  let decMesh = null,
    decAttr = null,
    decNext = 0,
    decCount = 0;
  const decMeta = []; // {born, life, heat, alpha}
  const hotDecals = new Set();
  let lastDecal = { x: 1e9, y: 0, z: 0, t: -1, k: -1 };

  function makeDecalAtlas() {
    const S = 256,
      N = 4;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S * N;
    const g = cv.getContext("2d");
    const rng = G.util.rng(777);
    function cell(k, fn) {
      const x = (k % N) * S,
        y = Math.floor(k / N) * S;
      g.save();
      g.beginPath();
      g.rect(x, y, S, S);
      g.clip();
      g.translate(x + S / 2, y + S / 2);
      fn();
      g.restore();
    }
    function blob(r, col, alpha, n) {
      g.fillStyle = col;
      for (let i = 0; i < (n || 1); i++) {
        g.globalAlpha = alpha;
        g.beginPath();
        const pts = 12;
        for (let p = 0; p < pts; p++) {
          const a = (p / pts) * Math.PI * 2,
            rr = r * (0.7 + rng() * 0.45);
          p
            ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
            : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        g.closePath();
        g.fill();
      }
      g.globalAlpha = 1;
    }
    function rad(r, stops) {
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
      stops.forEach((s) => gr.addColorStop(s[0], s[1]));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(0, 0, r, 0, Math.PI * 2);
      g.fill();
    }
    function cracks(n, len, col, w) {
      g.strokeStyle = col;
      g.lineWidth = w;
      for (let i = 0; i < n; i++) {
        let a = rng() * Math.PI * 2,
          x = 0,
          y = 0;
        g.beginPath();
        g.moveTo(0, 0);
        const segs = 4 + ((rng() * 4) | 0);
        for (let s = 0; s < segs; s++) {
          a += (rng() - 0.5) * 0.9;
          const l = (len / segs) * (0.6 + rng() * 0.8);
          x += Math.cos(a) * l;
          y += Math.sin(a) * l;
          g.lineTo(x, y);
        }
        g.stroke();
      }
    }
    // 0 bullet concrete: chipped light halo, dark hole, radial cracks
    cell(0, () => {
      rad(110, [
        [0, "rgba(210,205,190,0.55)"],
        [0.5, "rgba(190,185,170,0.25)"],
        [1, "rgba(190,185,170,0)"],
      ]);
      cracks(7, 90, "rgba(40,36,30,0.6)", 3);
      blob(34, "#1a1712", 0.95);
      rad(22, [
        [0, "rgba(0,0,0,1)"],
        [1, "rgba(0,0,0,0.6)"],
      ]);
    });
    // 1 bullet metal: dimple with bright rim
    cell(1, () => {
      rad(80, [
        [0, "rgba(40,36,32,0.9)"],
        [0.45, "rgba(90,86,80,0.7)"],
        [0.6, "rgba(210,205,195,0.6)"],
        [1, "rgba(120,110,100,0)"],
      ]);
      rad(26, [
        [0, "rgba(5,5,5,1)"],
        [1, "rgba(20,20,20,0.9)"],
      ]);
    });
    // 2 scorch: big soot burst
    cell(2, () => {
      for (let i = 0; i < 26; i++) {
        g.save();
        g.rotate(rng() * 6.28);
        g.translate(rng() * 40, 0);
        rad(60 + rng() * 60, [
          [0, "rgba(8,6,4,0.55)"],
          [1, "rgba(8,6,4,0)"],
        ]);
        g.restore();
      }
      for (let i = 0; i < 18; i++) {
        g.save();
        g.rotate(rng() * 6.28);
        g.fillStyle = "rgba(10,8,6,0.35)";
        g.fillRect(20, -3, 80 + rng() * 40, 6);
        g.restore();
      }
    });
    // 3 blood red / 4 blood green / 8 oil / 9 goo : splats with droplets
    function splat(k, core, edge, glowCol) {
      cell(k, () => {
        blob(60, core, 0.92, 1);
        blob(46, edge, 0.5, 2);
        for (let i = 0; i < 22; i++) {
          const a = rng() * 6.28,
            d = 60 + rng() * 60,
            r = 3 + rng() * 11;
          g.globalAlpha = 0.85;
          g.fillStyle = core;
          g.beginPath();
          g.arc(Math.cos(a) * d, Math.sin(a) * d, r, 0, 6.28);
          g.fill();
        }
        for (let i = 0; i < 6; i++) {
          const a = rng() * 6.28;
          g.save();
          g.rotate(a);
          g.fillStyle = core;
          g.globalAlpha = 0.8;
          g.beginPath();
          g.ellipse(70, 0, 30 + rng() * 25, 5 + rng() * 5, 0, 0, 6.28);
          g.fill();
          g.restore();
        }
        g.globalAlpha = 1;
        if (glowCol)
          rad(70, [
            [0, glowCol],
            [1, "rgba(0,0,0,0)"],
          ]);
      });
    }
    splat(3, "#5a0906", "#7a100a");
    splat(4, "#3c5a0c", "#5c8a18");
    // 5 laser burn: dark pit + hot rim (emissive handled in shader)
    cell(5, () => {
      rad(70, [
        [0, "rgba(10,6,4,1)"],
        [0.35, "rgba(30,14,8,0.9)"],
        [0.6, "rgba(120,50,20,0.6)"],
        [1, "rgba(60,30,20,0)"],
      ]);
      cracks(5, 50, "rgba(20,10,5,0.7)", 2);
    });
    // 6 plasma burn: molten green-edged crater
    cell(6, () => {
      rad(95, [
        [0, "rgba(12,16,8,1)"],
        [0.4, "rgba(30,50,15,0.9)"],
        [0.65, "rgba(90,150,40,0.55)"],
        [1, "rgba(40,60,20,0)"],
      ]);
      blob(30, "#0c0f08", 0.9);
    });
    // 7 crack
    cell(7, () => {
      cracks(9, 120, "rgba(25,22,18,0.85)", 4);
      cracks(12, 70, "rgba(25,22,18,0.6)", 2);
    });
    splat(8, "#0c0b09", "#1e1a14");
    splat(9, "#46b02a", "#6ade3a");
    // 10 small scorch
    cell(10, () => {
      rad(120, [
        [0, "rgba(6,5,4,0.85)"],
        [0.5, "rgba(12,10,8,0.5)"],
        [1, "rgba(12,10,8,0)"],
      ]);
    });
    // 11 blood smear (drag)
    cell(11, () => {
      g.fillStyle = "#5a0906";
      for (let i = 0; i < 9; i++) {
        g.globalAlpha = 0.25 + rng() * 0.35;
        g.fillRect(
          -110 + rng() * 20,
          -50 + i * 11 + rng() * 4,
          200 + rng() * 20,
          6 + rng() * 6,
        );
      }
      g.globalAlpha = 0.9;
      blob(34, "#5a0906", 0.9);
      g.globalAlpha = 1;
    });
    // 12 bullet wood: splintered
    cell(12, () => {
      for (let i = 0; i < 10; i++) {
        g.save();
        g.rotate(rng() * 6.28);
        g.fillStyle = "rgba(200,170,120,0.6)";
        g.fillRect(10, -3, 40 + rng() * 40, 5);
        g.restore();
      }
      blob(28, "#140e08", 0.95);
    });
    // 13 wet puddle
    cell(13, () => {
      blob(110, "rgba(20,24,22,1)", 0.45, 2);
    });
    // 14 dirt splat
    cell(14, () => {
      blob(80, "#3a3020", 0.6, 3);
      for (let i = 0; i < 30; i++) {
        const a = rng() * 6.28,
          d = 60 + rng() * 60;
        g.fillStyle = "rgba(60,50,35,0.7)";
        g.beginPath();
        g.arc(Math.cos(a) * d, Math.sin(a) * d, 2 + rng() * 6, 0, 6.28);
        g.fill();
      }
    });
    // 15 radioactive puddle
    cell(15, () => {
      blob(100, "#2c5a14", 0.8, 2);
      rad(90, [
        [0, "rgba(120,255,60,0.6)"],
        [1, "rgba(60,160,30,0)"],
      ]);
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    tex.needsUpdate = true;
    return tex;
  }

  function initDecals() {
    const geo = new THREE.PlaneGeometry(1, 1);
    geo.setAttribute("dUv", geo.attributes.uv.clone());
    decAttr = new THREE.InstancedBufferAttribute(
      new Float32Array(DEC_CAP * 4),
      4,
    );
    decAttr.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("aDecal", decAttr);
    const tex = makeDecalAtlas();
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.0,
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -4,
    });
    mat.name = "atmos_decals";
    mat.onBeforeCompile = (sh) => {
      sh.uniforms.uDecalMap = { value: tex };
      sh.vertexShader = sh.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute vec4 aDecal; attribute vec2 dUv; varying vec4 vDecal; varying vec2 vDUv;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvDecal = aDecal; vDUv = (vec2(mod(aDecal.x, 4.0), 3.0 - floor(aDecal.x / 4.0)) + dUv) / 4.0;",
        );
      sh.fragmentShader = sh.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform sampler2D uDecalMap; varying vec4 vDecal; varying vec2 vDUv;",
        )
        .replace(
          "#include <map_fragment>",
          "vec4 dcol = texture2D(uDecalMap, vDUv); diffuseColor.rgb *= dcol.rgb; diffuseColor.a *= dcol.a * vDecal.y; if (diffuseColor.a < 0.01) discard;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float cell = vDecal.x;
          vec3 heatCol = (cell > 4.5 && cell < 5.5) ? vec3(3.2, 0.9, 0.2) : ((cell > 5.5 && cell < 6.5) || cell > 8.5) ? vec3(0.6, 2.6, 0.3) : vec3(2.2, 0.9, 0.3);
          float rim = (cell > 4.5 && cell < 6.5) ? smoothstep(0.05, 0.45, 1.0 - dcol.r * 2.0) : 1.0;
          totalEmissiveRadiance += heatCol * vDecal.z * dcol.a * vDecal.y * rim;`,
        );
    };
    mat.customProgramCacheKey = () => "atmos_decals_v1";
    decMesh = new THREE.InstancedMesh(geo, mat, DEC_CAP);
    decMesh.name = "atmos_decals";
    decMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    decMesh.count = 0;
    decMesh.frustumCulled = false;
    decMesh.receiveShadow = true;
    decMesh.castShadow = false;
    decMesh.renderOrder = 5;
    G.scene.add(decMesh);
    for (let i = 0; i < DEC_CAP; i++)
      decMeta.push({ born: -1e9, life: 0, heat: 0, alpha: 0 });
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _q2 = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _n = new THREE.Vector3(),
    _p = new THREE.Vector3();
  const _z = new THREE.Vector3(0, 0, 1);
  /**
   * Place a decal. kind: bullet|bullet_metal|bullet_wood|scorch|scorch_small|blood|blood_green|oil|goo|laser|plasma|crack|puddle|dirt|rad_puddle
   * opts: {size, life (s, default 240), heat (0..1 emissive glow that cools), rot}
   */
  FX.decal = function (pos, normal, kind, opts) {
    if (!decMesh || !pos) return -1;
    opts = opts || {};
    if (
      A.isInteriorPos(pos.x) === false &&
      G.LAYOUT &&
      G.LAYOUT.isWater &&
      G.world &&
      pos.y < (G.world.waterLevel || -1.2) + 0.05 &&
      G.LAYOUT.isWater(pos.x, pos.z)
    )
      return -1;
    const k =
      DK[kind] !== undefined ? DK[kind] : typeof kind === "number" ? kind : 0;
    // de-dupe (combat may call decal() and impact() for the same hit)
    const now = A.animTime;
    if (
      lastDecal.k === k &&
      now - lastDecal.t < 0.05 &&
      Math.abs(lastDecal.x - pos.x) +
        Math.abs(lastDecal.y - pos.y) +
        Math.abs(lastDecal.z - pos.z) <
        0.05
    )
      return -1;
    lastDecal.k = k;
    lastDecal.t = now;
    lastDecal.x = pos.x;
    lastDecal.y = pos.y;
    lastDecal.z = pos.z;
    const defSize = {
      0: 0.16,
      1: 0.12,
      2: 2.6,
      3: 0.9,
      4: 0.9,
      5: 0.22,
      6: 0.4,
      7: 1.2,
      8: 0.8,
      9: 1.2,
      10: 1.1,
      11: 1.4,
      12: 0.16,
      13: 1.5,
      14: 0.8,
      15: 1.6,
    }[k];
    const size =
      (opts.size || defSize) * (opts.size ? 1 : 0.8 + Math.random() * 0.4);
    A.v3(normal || { x: 0, y: 1, z: 0 }, _n);
    if (_n.lengthSq() < 1e-6) _n.set(0, 1, 0);
    _n.normalize();
    _p.copy(pos).addScaledVector(_n, 0.015 + Math.random() * 0.01);
    _q.setFromUnitVectors(_z, _n);
    _q2.setFromAxisAngle(
      _z,
      opts.rot !== undefined ? opts.rot : Math.random() * Math.PI * 2,
    );
    _q.multiply(_q2);
    _s.set(size, size, size);
    _m.compose(_p, _q, _s);
    const i = decNext;
    decNext = (decNext + 1) % DEC_CAP;
    decCount = Math.min(DEC_CAP, decCount + 1);
    decMesh.setMatrixAt(i, _m);
    decMesh.instanceMatrix.needsUpdate = true;
    decMesh.count = decCount;
    const meta = decMeta[i];
    meta.born = now;
    meta.life = opts.life || 240;
    meta.heat =
      opts.heat !== undefined
        ? opts.heat
        : k === 5
          ? 1
          : k === 6
            ? 0.8
            : k === 15
              ? 0.25
              : k === 9
                ? 0.2
                : 0;
    meta.alpha = 1;
    meta.cool = k === 15 || k === 9 ? 0 : 1.1;
    const a = decAttr.array;
    a[i * 4] = k;
    a[i * 4 + 1] = 1;
    a[i * 4 + 2] = meta.heat;
    a[i * 4 + 3] = 0;
    decAttr.needsUpdate = true;
    if (meta.heat > 0 && meta.cool > 0) hotDecals.add(i);
    else hotDecals.delete(i);
    return i;
  };
  let decAgeT = 0;
  function updateDecals(dt) {
    if (!decMesh || dt <= 0) return;
    const a = decAttr.array;
    let dirty = false;
    for (const i of hotDecals) {
      const m = decMeta[i];
      m.heat = Math.max(0, m.heat - dt * m.cool * 0.35);
      a[i * 4 + 2] = m.heat;
      dirty = true;
      if (m.heat <= 0) hotDecals.delete(i);
    }
    decAgeT -= dt;
    if (decAgeT <= 0) {
      decAgeT = 1;
      const now = A.animTime;
      for (let i = 0; i < decCount; i++) {
        const m = decMeta[i];
        const age = now - m.born;
        const fadeStart = m.life * 0.8;
        const al =
          age < fadeStart
            ? 1
            : Math.max(0, 1 - (age - fadeStart) / (m.life - fadeStart));
        if (al !== a[i * 4 + 1]) {
          a[i * 4 + 1] = al;
          dirty = true;
        }
      }
    }
    if (dirty) decAttr.needsUpdate = true;
  }
  function clearDecals() {
    decCount = 0;
    decNext = 0;
    if (decMesh) decMesh.count = 0;
    hotDecals.clear();
  }

  // ==================================================================
  // Floating text
  // ==================================================================
  const texts = [];
  function makeTextSprite() {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 64;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    });
    const sp = new THREE.Sprite(mat);
    sp.renderOrder = 999;
    sp.visible = false;
    sp.scale.set(1.6, 0.4, 1);
    sp.name = "atmos_float_text";
    G.scene.add(sp);
    return { sp, cv, tex, t: 1, life: 1, vy: 0 };
  }
  /** Floating world text (e.g. damage numbers). color hex/string. */
  FX.floatingText = function (pos, text, color, opts) {
    if (!pos) return null;
    opts = opts || {};
    let e = texts.find((x) => x.t >= x.life);
    if (!e) {
      if (texts.length < 14) {
        e = makeTextSprite();
        texts.push(e);
      } else e = texts.reduce((a, b) => (a.t / a.life > b.t / b.life ? a : b));
    }
    const g = e.cv.getContext("2d");
    g.clearRect(0, 0, 256, 64);
    g.font = 'bold 40px "Share Tech Mono", "VT323", monospace';
    g.textAlign = "center";
    g.textBaseline = "middle";
    const col = "#" + A.color(color || 0x39ff6a).getHexString();
    g.lineWidth = 6;
    g.strokeStyle = "rgba(0,0,0,0.75)";
    g.strokeText(String(text), 128, 34);
    g.shadowColor = col;
    g.shadowBlur = 10;
    g.fillStyle = col;
    g.fillText(String(text), 128, 34);
    e.tex.needsUpdate = true;
    e.sp.position.copy(pos);
    const sc = opts.scale || 1;
    e.sp.scale.set(1.6 * sc, 0.4 * sc, 1);
    e.t = 0;
    e.life = opts.life || 1.4;
    e.vy = opts.rise !== undefined ? opts.rise : 0.9;
    e.sp.visible = true;
    e.sp.material.opacity = 1;
    return e.sp;
  };
  function updateTexts(dt, realDt) {
    const d = dt > 0 ? dt : realDt * 0; // freeze with the world
    for (const e of texts) {
      if (e.t >= e.life) {
        e.sp.visible = false;
        continue;
      }
      e.t += d;
      e.sp.position.y += e.vy * d;
      e.sp.material.opacity = Math.max(0, 1 - Math.pow(e.t / e.life, 2));
      if (e.t >= e.life) e.sp.visible = false;
    }
  }

  // ==================================================================
  A.addSystem({
    name: "lights_decals",
    order: 64,
    init() {
      initLights();
      initGlows();
      initDecals();
    },
    update(dt, realDt) {
      updateLights(dt, realDt);
      updateDecals(dt);
      updateTexts(dt, realDt);
    },
    late() {
      uploadGlows();
    },
    reset() {
      for (const f of flashes) {
        if (f.fixture) {
          f.fixture.entry = null;
          f.fixture = null;
        }
        f.t = f.dur;
        f.light.intensity = 0;
      }
      clearDecals();
      for (const e of texts) {
        e.t = e.life;
        e.sp.visible = false;
      }
    },
  });
})();
