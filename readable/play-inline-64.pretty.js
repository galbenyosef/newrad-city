/* src/atmosphere/57_fx_flames.js */
/* =====================================================================
 * ATMOSPHERE / FX — procedural FLAME VOLUMES (fires, burning wrecks, molotovs)
 *
 * Sprite fire (a canvas-drawn flame cell stretched over a quad) reads as a
 * flat cut-out, especially up close. Every G.fx.fire() now also owns a
 * vertical, camera-turning "flame card" whose pixels are a procedural
 * fire: licking tongues from domain-warped, upward-scrolling noise inside a
 * teardrop envelope, a capped blackbody ramp (yellow-orange roots →
 * orange body → deep red tips, never white), per-tongue flicker, thin dark
 * soot wisps breaking off the tips, a hot bed/coal glow at the base and a
 * soft-particle fade where it meets the barrel rim / rubble / street.
 * Premultiplied blending: the flame glows (nearly additive) while the soot
 * occludes. All fires share ONE instanced draw call (cap 96), depth-sorted,
 * distance-culled with the emitter LOD. The sprite licks, embers and smoke
 * of the emitter stay on top for motion.
 *
 * Internal API (used by 56_fx_effects.js FX.fire):
 *   A.flameCard(pos, scale, {seed, lod, width, height, lift}) →
 *     {setPos(v), setScale(s), setIntensity(k), setVisible(b), remove()}
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._;

  const CAP = 96;
  const VERT = `
    attribute vec4 iPos;   // base xyz, height (m)
    attribute vec4 iPar;   // width (m), seed, intensity, alpha
    varying vec2 vUv; varying vec4 vPar; varying float vAsp; varying float vSoftZ; varying float vW;
    #include <fog_pars_vertex>
    void main(){
      vec3 base = iPos.xyz;
      vec3 toCam = cameraPosition - base;
      float dy = toCam.y;
      toCam.y = 0.0;
      float dh = length(toCam);
      toCam = dh > 1e-3 ? toCam / dh : vec3(0.0, 0.0, 1.0);
      vec3 right = vec3(toCam.z, 0.0, -toCam.x);
      // seen from above the card leans back toward the viewer (never a razor-thin sliver)
      float lean = clamp(dy / max(dh, 0.5), 0.0, 3.0);
      vec3 up = normalize(vec3(0.0, 1.0, 0.0) - toCam * lean * 0.45);
      float W = iPar.x, H = iPos.w;
      // pulled a little toward the camera so the barrel rim / wreck it sits in doesn't slice the flame
      vec3 wp = base + right * position.x * W + up * position.y * H + toCam * W * 0.22;
      vUv = vec2(position.x * 2.0, position.y);
      vPar = iPar; vAsp = W / max(H, 0.01); vW = W;
      vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
      vSoftZ = -mvPosition.z;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
  const FRAG = `
    uniform sampler2D uNoise;
    uniform float uTime, uDay;
    uniform vec3 uSoot;
    varying vec2 vUv; varying vec4 vPar; varying float vAsp; varying float vW;
    #include <fog_pars_fragment>
    ${A.glsl.noise}
    ${A.glsl.fogFactor}
    ${A.glsl.softPars}
    vec3 ramp(float T){
      // capped blackbody: deep red → orange → yellow-orange; only the very root of the core gets
      // near-white (after ACES + bloom a flame body at 2+ HDR washed out to a pale cone)
      vec3 c = vec3(0.42, 0.045, 0.008) * smoothstep(0.02, 0.22, T);
      c = mix(c, vec3(1.15, 0.26, 0.03), smoothstep(0.22, 0.48, T));
      c = mix(c, vec3(1.55, 0.62, 0.08), smoothstep(0.48, 0.74, T));
      c = mix(c, vec3(1.85, 1.0, 0.3), smoothstep(0.78, 1.0, T));
      return c;
    }
    void main(){
      float y = vUv.y;
      float sd = vPar.y;
      float t = uTime + sd * 17.0;
      // isotropic noise space: x scaled by the card's aspect
      vec2 p = vec2(vUv.x * vAsp * 1.1, y * 1.9);
      // rising turbulence: large slow billows warp a faster fine layer; a crisp top octave tears the edges
      float n1 = afbm3o(vec2(p.x * 1.7 + sd * 13.0, p.y * 1.6 - t * 1.35));
      float n2 = afbm2(vec2(p.x * 4.2 - sd * 7.0, p.y * 3.6 - t * 3.3) + (n1 - 0.5) * 1.8);
      float n3 = an2(vec2(p.x * 11.0 + sd * 3.0, p.y * 8.0 - t * 6.5) + (n2 - 0.5) * 3.0);
      // sway grows with height (buoyant tongues whip about), plus a slow wind lean
      float x = vUv.x + (n1 - 0.5) * 1.15 * y + sin(t * 1.9) * 0.08 * y * y;
      // envelope: full width over the fuel bed, pinching toward the tips
      float prof = 0.9 * pow(max(1.0 - y, 0.0), 0.75) * smoothstep(-0.12, 0.12, y) + 0.03;
      float body = 1.0 - abs(x) / prof;
      // separate tongues: a comb of rising lobes across the width (phase wanders with the noise),
      // the gaps between them open up with height so the top breaks into licks, not a cone
      float nT = 2.0 + floor(1.5 * vAsp + 0.5);
      float comb = 0.5 + 0.5 * cos((x / max(prof, 0.05)) * nT * 3.1416 + (n1 - 0.5) * 6.0 + sin(t * 0.9) * 0.8);
      float lick = body * 0.85 + (n2 - 0.5) * 1.5 + (n3 - 0.5) * 0.35 - y * 0.55 + 0.2 - comb * smoothstep(0.1, 0.8, y) * 0.75;
      // ragged, soft root (no ruler-straight bottom edge where a fire sits on open ground)
      float mask = smoothstep(0.0, 0.1, lick) * smoothstep(0.0, 0.07, y - 0.02 + (n2 - 0.5) * 0.08);
      // detached flame wisps: pockets above the tips flicker in and out
      float wisp = smoothstep(0.62, 0.8, n2) * smoothstep(0.35, 0.7, y) * (1.0 - smoothstep(0.8, 1.0, y)) * smoothstep(-0.45, -0.05, lick);
      mask = max(mask, wisp * 0.8);
      // temperature: hottest at the roots in the core, cooling out and up
      float flick = 0.86 + 0.14 * sin(uTime * 13.0 + sd * 40.0) * sin(uTime * 7.3 + sd * 11.0);
      float T = (smoothstep(-0.05, 0.95, lick) * (1.0 - 0.62 * y) + wisp * 0.25) * vPar.z * flick;
      vec3 fire = ramp(T);
      // hot fuel bed: a low glow band at the base (coals / burning debris)
      float bed = exp(-y * 18.0) * smoothstep(0.9, 0.2, abs(vUv.x)) * (0.5 + 0.5 * n2) * smoothstep(0.0, 0.04, y + (n1 - 0.5) * 0.05);
      fire += vec3(1.1, 0.3, 0.05) * bed * vPar.z * flick;
      float glowA = max(mask, bed * 0.8);
      // soot wisps tearing off the tips: dark, semi-opaque, only above the flame
      float soot = 0.0;
      if (y > 0.35 && lick < -0.02 && lick > -0.32) {   // (3 extra taps only where soot can exist)
        float sootN = afbm3o(vec2(p.x * 2.2 + sd * 5.0, p.y * 1.4 - t * 0.9));
        soot = smoothstep(-0.32, -0.02, lick) * (1.0 - mask) * smoothstep(0.35, 0.85, y) * (1.0 - smoothstep(0.9, 1.0, y))
             * smoothstep(0.42, 0.7, sootN) * 0.45 * smoothstep(-0.02, -0.14, lick);
      }
      float soft = softK(vSoftZ, vW * 0.35);
      float a = vPar.w * soft;
      // by day the flame body lets more of the scene through (reads as heat, not a paper cut-out)
      // (dim red edges must not occlude: that drew a dark outline around every tongue by day)
      float occ = glowA * mix(0.34, 0.2, uDay) * smoothstep(0.25, 0.7, T) + soot;
      vec3 col = fire * glowA + uSoot * soot;
      float ff = atmosFogFactor();
      col = mix(col, atmosFogC * occ, ff * 0.85);
      if (occ * a < 0.003 && max(col.r, col.g) * a < 0.003) discard;
      gl_FragColor = vec4(col * a, clamp(occ, 0.0, 1.0) * a);   // premultiplied
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  const F = {
    mesh: null,
    mat: null,
    aPos: null,
    aPar: null,
    slots: [], // live cards
    order: [],
    depth: new Float32Array(CAP),
  };

  function init() {
    const geo = new THREE.InstancedBufferGeometry();
    // 1 × 6 strip so the lean / envelope interpolate smoothly
    const SEG = 6,
      pos = [],
      idx = [];
    for (let i = 0; i <= SEG; i++) {
      const y = i / SEG;
      pos.push(-0.5, y, 0, 0.5, y, 0);
    }
    for (let i = 0; i < SEG; i++) {
      const a = i * 2;
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(pos), 3),
    );
    geo.setIndex(idx);
    const mk = (k) => {
      const a = new THREE.InstancedBufferAttribute(
        new Float32Array(CAP * 4),
        4,
      );
      a.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute(k, a);
      return a;
    };
    F.aPos = mk("iPos");
    F.aPar = mk("iPar");
    geo.instanceCount = 0;
    F.mat = new THREE.ShaderMaterial({
      uniforms: A.softUniforms(
        A.fogUniforms({
          uNoise: { value: A.noiseTex },
          uTime: { value: 0 },
          uDay: { value: 1 },
          uSoot: { value: new THREE.Color(0x0b0908) },
        }),
      ),
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation,
    });
    F.mat.name = "atmos_flames";
    F.mesh = new THREE.Mesh(geo, F.mat);
    F.mesh.name = "atmos_flames";
    F.mesh.frustumCulled = false;
    F.mesh.renderOrder = 24;
    F.mesh.visible = false;
    G.scene.add(F.mesh);
  }

  /** Create a flame card. pos = fuel-bed centre (world), scale = FX.fire scale. */
  A.flameCard = function (pos, scale, opts) {
    opts = opts || {};
    const c = {
      pos: new THREE.Vector3(),
      scale: scale || 1,
      seed: opts.seed !== undefined ? opts.seed : Math.random() * 10,
      k: 1,
      vis: true,
      alive: true,
      lod: opts.lod || 160,
      fade: 0,
      wK: opts.width || 1,
      hK: opts.height || 1,
      lift: opts.lift || 0,
    };
    A.v3(pos, c.pos);
    c.setPos = (v) => {
      A.v3(v, c.pos);
      return c;
    };
    c.setScale = (s) => {
      c.scale = s;
      return c;
    };
    c.setIntensity = (k) => {
      c.k = k;
      return c;
    };
    c.setVisible = (b) => {
      c.vis = b !== false;
      return c;
    };
    c.remove = () => {
      if (!c.alive) return;
      c.alive = false;
      const i = F.slots.indexOf(c);
      if (i >= 0) F.slots.splice(i, 1);
    };
    if (F.slots.length >= CAP) {
      // full: the farthest card gives up its slot
      let far = -1,
        fd = -1;
      for (let i = 0; i < F.slots.length; i++) {
        const d = A.camDist(F.slots[i].pos);
        if (d > fd) {
          fd = d;
          far = i;
        }
      }
      if (far >= 0) ((F.slots[far].alive = false), F.slots.splice(far, 1));
    }
    F.slots.push(c);
    return c;
  };
  A.flameStats = () => ({
    cards: F.slots.length,
    drawn: F.mesh ? F.mesh.geometry.instanceCount : 0,
  });

  const _fwd = new THREE.Vector3();
  function update(dt, realDt, animDt) {
    if (!F.mesh) return;
    const env = A.env;
    if (env.interior && !F.slots.length) {
      F.mesh.visible = false;
      return;
    }
    F.mat.uniforms.uTime.value = A.animTime % 1000;
    F.mat.uniforms.uDay.value = 1 - (env.night || 0);
    const n = F.slots.length;
    let vis = 0;
    if (n && G.camera) {
      G.camera.getWorldDirection(_fwd);
      const cx = A.camPos.x,
        cy = A.camPos.y,
        cz = A.camPos.z;
      for (let i = 0; i < n; i++) {
        const c = F.slots[i];
        const dx = c.pos.x - cx,
          dy = c.pos.y - cy,
          dz = c.pos.z - cz;
        const d2 = dx * dx + dy * dy + dz * dz;
        const on = c.vis && d2 < c.lod * c.lod;
        c.fade = Math.max(
          0,
          Math.min(
            1,
            c.fade + (on ? 3 : -3) * Math.max(realDt || dt || 0.016, 0.001),
          ),
        );
        if (c.fade <= 0.001) continue;
        const along = dx * _fwd.x + dy * _fwd.y + dz * _fwd.z;
        const R = 2.5 * c.scale * c.hK;
        if (along < -R) continue; // behind the camera
        F.depth[i] = along;
        F.order[vis++] = i;
      }
      if (vis > 1) {
        const ord = F.order
          .slice(0, vis)
          .sort((a, b) => F.depth[b] - F.depth[a]);
        for (let k = 0; k < vis; k++) F.order[k] = ord[k];
      }
      const P = F.aPos.array,
        Q = F.aPar.array;
      for (let k = 0; k < vis; k++) {
        const c = F.slots[F.order[k]],
          o = k * 4,
          s = c.scale;
        P[o] = c.pos.x;
        P[o + 1] = c.pos.y + c.lift * s - 0.08 * s;
        P[o + 2] = c.pos.z;
        P[o + 3] = 2.0 * s * c.hK;
        Q[o] = 1.1 * s * c.wK;
        Q[o + 1] = c.seed;
        Q[o + 2] = c.k;
        Q[o + 3] = c.fade;
      }
      if (vis)
        for (const at of [F.aPos, F.aPar]) {
          at.updateRange.offset = 0;
          at.updateRange.count = vis * 4;
          at.needsUpdate = true;
        }
    }
    F.mesh.geometry.instanceCount = vis;
    F.mesh.visible = vis > 0;
  }
  function reset() {
    /* cards belong to emitters: their onStop removes them */
  }

  A.addSystem({ name: "flames", order: 62, init, update, reset });
})();
