// play-inline-68 03 — three
// Lines 366-585 of readable/play-inline-68.pretty.js (statement-aligned).
  const PFRAG = `
    uniform sampler2D uNoise; uniform float uTime; uniform vec3 uLight, uGlowCol, uSmoke;
    varying vec2 vUv; varying vec4 vParam; varying float vFade; varying float vH; varying float vHm;
    #include <fog_pars_fragment>
    ${A.glsl.noise}
    ${A.glsl.fogFactor}
    void main(){
      vec2 p = vec2(vUv.x * 3.0, vUv.y * vH * 0.9) + vec2(vParam.y * 17.0, -uTime * 0.35);
      float n = afbm2(p * 1.1);
      float n2 = afbm2(p * 2.6 + 11.0);
      float cx = abs(vUv.x - 0.5) * 2.0;
      float body = smoothstep(1.0, 0.25, cx + (n - 0.5) * 0.9);
      float top = 1.0 - smoothstep(0.7, 1.0, vUv.y + (n2 - 0.5) * 0.35);
      float fh = vUv.y * vHm;                         // metres above the burning roof
      float bot = smoothstep(0.0, 1.2, fh);
      // dense sooty column, thinner (but wide) drifting canopy
      float dens = body * top * bot * (0.55 + 0.6 * n) * mix(1.0, 0.5, smoothstep(0.4, 1.0, vUv.y));
      // FIRE at the base: licking tongues (upward-scrolling noise, several across the roof), tapering
      // into the smoke — not a glowing gradient card
      float flameH = 9.0 + 7.0 * fract(vParam.y * 7.3);
      vec2 fp = vec2(vUv.x * 9.0 + vParam.y * 31.0, fh * 0.2 - uTime * 1.7);
      float fn = afbm2(fp), fn2 = afbm2(fp * 2.2 + vec2(3.1, -uTime * 1.1));
      float lick = 1.0 - fh / flameH + (fn - 0.5) * 1.5 + (fn2 - 0.5) * 0.6;
      float fw = smoothstep(0.9, 0.3, cx + (fn2 - 0.5) * 0.5) * smoothstep(0.0, 0.35, fh);
      float flame = smoothstep(0.2, 0.6, lick) * fw;
      float flick = 0.82 + 0.18 * sin(uTime * 11.0 + vParam.y * 40.0) * sin(uTime * 5.3 + vUv.x * 7.0);
      float fireK = clamp(uGlowCol.r * 0.45, 0.25, 1.0) * vParam.w;          // brighter at night
      float a = clamp(max(dens * vParam.z, flame * 0.95), 0.0, 1.0) * vFade;
      if (a < 0.01) discard;
      // canopy is greyer / sun-lit, the column darker and sootier
      vec3 c = uSmoke * mix(1.0, 1.9, smoothstep(0.35, 1.0, vUv.y)) * (0.6 + 0.6 * n2) * uLight;
      // the smoke right above the fire is lit from below (warm bounce), fading up the column
      c += uGlowCol * vParam.w * exp(-max(fh - flameH * 0.6, 0.0) / 16.0) * (1.0 - flame) * 0.16 * (0.6 + 0.4 * n) * flick;
      vec3 fcol = mix(vec3(0.7, 0.12, 0.02), mix(vec3(2.0, 0.62, 0.1), vec3(2.8, 1.6, 0.45), smoothstep(0.75, 1.1, lick)), smoothstep(0.25, 0.7, lick));
      c = mix(c, fcol * flick * (0.7 + 0.6 * fireK), flame);
      float ff = atmosFogFactor();
      gl_FragColor = vec4(mix(c, atmosFogC, ff * mix(0.92, 0.7, flame)), a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  let plumes = null;
  const plumeEmitters = [];
  function initPlumes() {
    PLUME_SITES = choosePlumeSites();
    const n = PLUME_SITES.length;
    if (!n) return;
    const geo = new THREE.InstancedBufferGeometry();
    const SEG = 16,
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
    const base = new Float32Array(n * 4),
      par = new Float32Array(n * 4);
    PLUME_SITES.forEach((s, i) => {
      base.set([s.x, 0, s.z, s.h], i * 4);
      par.set([s.w, Math.random(), 0.8, 1], i * 4);
    });
    geo.setAttribute("iBase", new THREE.InstancedBufferAttribute(base, 4));
    geo.setAttribute("iParam", new THREE.InstancedBufferAttribute(par, 4));
    geo.instanceCount = n;
    const mat = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({
        uNoise: { value: A.noiseTex },
        uCam: { value: new THREE.Vector3() },
        uWind: { value: new THREE.Vector2() },
        uTime: { value: 0 },
        uLight: { value: new THREE.Color(1, 1, 1) },
        uGlowCol: { value: new THREE.Color(3, 1.1, 0.3) },
        uSmoke: { value: new THREE.Color(0x2a2622) },
      }),
      vertexShader: PVERT,
      fragmentShader: PFRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    mat.name = "atmos_plumes";
    plumes = new THREE.Mesh(geo, mat);
    plumes.name = "atmos_plumes";
    plumes.frustumCulled = false;
    plumes.renderOrder = 15;
    G.scene.add(plumes);
  }
  function placePlumeBases() {
    // after the world is built: sit each plume on top of whatever is there (burning rooftop / rubble)
    if (!plumes) return;
    const base = plumes.geometry.attributes.iBase;
    PLUME_SITES.forEach((s, i) => {
      // sit on whatever is there (burning rooftop / rubble): probe straight down from high above
      let y = 0;
      try {
        const hit = G.world.raycast(
          A.tmpV.set(s.x, 400, s.z),
          A.tmpV2.set(0, -1, 0),
          420,
          { ignoreTags: ["actor", "tree", "lamp", "sign", "prop"] },
        );
        y = hit ? 400 - hit.dist : G.world.groundHeight(s.x, s.z, 5000, 0);
      } catch (e) {
        y = 0;
      }
      if (!isFinite(y) || y < 0 || y > 150) y = 0;
      base.setY(i, y);
      s.y = y;
      const f = FX.fire(new THREE.Vector3(s.x, y + 0.2, s.z), 2.6, {
        lod: 170,
        sound: true,
      });
      const sm = FX.smoke(new THREE.Vector3(s.x, y + 2.5, s.z), 3.2, {
        lod: 260,
        rate: 4,
        alpha: 0.5,
      });
      if (f) plumeEmitters.push(f);
      if (sm) plumeEmitters.push(sm);
    });
    base.needsUpdate = true;
  }

  // ------------------------------------------------------------------
  const _vel = new THREE.Vector3(),
    _light = new THREE.Color(),
    _radL = new THREE.Color(),
    _rainL = new THREE.Color();
  let splashAcc = 0,
    shelterK = 0,
    shelterR = 6;
  function init() {
    const low = A.quality === "low";
    // near: [fade-in start, fade-in end (m), max size/distance] — nothing smears across the lens as a blob
    makeField("motes", low ? 250 : 500, {
      box: [18, 10, 18],
      size: 0.025,
      frame: FR.GLOW,
      jitter: 0.6,
      additive: true,
      near: [0.35, 0.9, 0.006],
    });
    makeField("ash", low ? 250 : 600, {
      box: [46, 26, 46],
      size: 0.07,
      frame: FR.FLAKE,
      jitter: 1.4,
      near: [0.6, 1.6, 0.012],
    });
    makeField("rain", low ? 1600 : 3600, {
      box: [36, 24, 36],
      size: 0.02,
      frame: FR.RAIN,
      stretch: 0.07,
      near: [1.5, 3.0, 0.004],
      lit: true,
    });
    // close-up sheet of rain: fewer, shorter streaks just in front of the camera (reads as falling water)
    makeField("rainnear", low ? 300 : 700, {
      box: [11, 8, 11],
      size: 0.012,
      frame: FR.RAIN,
      stretch: 0.05,
      near: [1.5, 2.8, 0.003],
      lit: true,
    });
    makeField("dust", low ? 300 : 650, {
      box: [70, 18, 70],
      size: 3.2,
      frame: FR.DUST,
      jitter: 2.5,
      near: [1.5, 4.5, 0],
    });
    // dust storm: fast wind-driven streaks of grit racing past at eye level (the sheets above are the slow
    // billowing body of the storm; these sell its speed)
    makeField("duststreak", low ? 300 : 700, {
      box: [34, 7, 34],
      size: 0.07,
      frame: FR.RAIN,
      stretch: 0.11,
      jitter: 0.8,
      near: [2.5, 6.0, 0.004],
    });
    makeField("rad", low ? 400 : 900, {
      box: [40, 22, 40],
      size: 0.085,
      frame: FR.GLOW,
      jitter: 1.4,
      additive: true,
      near: [1.2, 3.0, 0.012],
    });
    // rad weather (rad > 0 only): green, wind-driven veils of irradiated dust (like the dust storm's sheets, thinner)
    makeField("radveil", low ? 120 : 260, {
      box: [64, 16, 64],
      size: 4.5,
      frame: FR.DUST,
      jitter: 3.0,
      near: [2.5, 7.0, 0],
    });
    initPlumes();
    G.events.on("initDone", () => {
      try {
        buildVents();
        placePlumeBases();
      } catch (e) {
        G.reportError("event:initDone/atmosphere", e);
      }
    });
  }

