// play-inline-61 02 — light
// Lines 21-366 of readable/play-inline-61.pretty.js (statement-aligned).
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
