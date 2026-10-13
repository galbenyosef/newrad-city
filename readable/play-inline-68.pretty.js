/* src/atmosphere/70_ambient.js */
/* =====================================================================
 * ATMOSPHERE — ambient life of the ruined city's air
 *  - GPU "wrap fields" around the camera (zero CPU per particle):
 *      motes (drifting dust specks), ash (slow falling flakes), rain
 *      streaks, dust-storm sheets, rad-weather green specks (rad > 0 only).
 *  - rain splashes on the ground around the player
 *  - manhole / grate steam at street intersections near the camera
 *  - distant black smoke plumes rising over the skyline from burning
 *    ruins (cylindrical billboards bent by the wind; real fire & smoke
 *    emitters at their base when you get close)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos,
    FX = G.fx,
    FR = A.FR;
  const rr = A.rr;

  // ------------------------------------------------------------------
  // Wrap fields
  // ------------------------------------------------------------------
  const WVERT = `
    attribute vec4 iSeed;
    uniform vec3 uCam, uBox, uVel;
    uniform float uTime, uSize, uStretch, uJitter, uAmount, uFrame;
    uniform vec4 uColor;
    uniform vec2 uShelter;   // x = radius of the dry zone around the camera (m), y = 0..1 strength
    uniform vec3 uNear;      // x..y: fade-in distance band (nothing smears across the lens), z: max size / distance (0 = off)
    varying vec2 vUv; varying float vA; varying float vSoftZ; varying float vSoftR;
    #ifdef LIT_POOL
      // the flash/fixture light pool (street lamps near the player at night, muzzle flashes, lightning,
      // explosions): streaks passing through a light's reach catch it — rain glitters in lamp light
      uniform vec4 uPL[3]; uniform vec3 uPC[3];
      varying vec3 vLit;
    #endif
    #include <fog_pars_vertex>
    void main(){
      vec3 p = iSeed.xyz * uBox + uVel * uTime * (0.75 + 0.5 * iSeed.w);
      p += vec3(sin(uTime * 0.7 + iSeed.w * 40.0), sin(uTime * 0.9 + iSeed.w * 23.0) * 0.5, cos(uTime * 0.6 + iSeed.w * 31.0)) * uJitter;
      vec3 rel = mod(p - uCam + uBox * 0.5, uBox) - uBox * 0.5;
      vec3 wp = uCam + rel;
      vec3 rn = rel / (uBox * 0.5);
      float edge = 1.0 - smoothstep(0.55, 1.0, max(max(abs(rn.x), abs(rn.y)), abs(rn.z)));
      vA = edge * step(iSeed.w, uAmount) * uColor.a;
      // under a roof: nothing falls in a disc around the player (rain keeps falling outside the doorway)
      if (uShelter.y > 0.0) vA *= 1.0 - uShelter.y * (1.0 - smoothstep(uShelter.x, uShelter.x + 2.5, length(rel.xz)));
      #ifdef LIT_POOL
        vLit = vec3(0.0);
        for (int i = 0; i < 3; i++) {
          vec3 dl = wp - uPL[i].xyz; float d2 = dot(dl, dl);
          float w = clamp(1.0 - sqrt(d2) / max(uPL[i].w, 0.01), 0.0, 1.0);
          vLit += uPC[i] * (w * w / max(d2, 0.35));
        }
        vLit = min(vLit, vec3(3.0));
      #endif
      vec4 mv = viewMatrix * vec4(wp, 1.0);
      float dcam = max(-mv.z, 0.01);
      vA *= smoothstep(uNear.x, uNear.y, dcam);
      float size = uSize * (0.6 + 0.8 * fract(iSeed.w * 13.7));
      if (uNear.z > 0.0) size = min(size, dcam * uNear.z);      // a speck/streak never grows past ~1-2 px wide
      vec2 q = position.xy;
      if (uStretch > 0.0) {
        vec3 vv = (viewMatrix * vec4(uVel, 0.0)).xyz;
        vec2 d = vv.xy; float L = length(d);
        vec2 dir = L > 1e-4 ? d / L : vec2(0.0, 1.0);
        vec2 perp = vec2(dir.y, -dir.x);   // (perp, dir) must be a proper rotation: the mirrored basis flipped the winding and FrontSide culled every streak
        float len = min(size + L * uStretch, 0.1 + dcam * 0.22);   // near streaks stay short
        mv.xy += dir * q.y * len + perp * q.x * size;
      } else {
        float a = iSeed.w * 40.0 + uTime * (fract(iSeed.w * 7.1) - 0.5);
        float c = cos(a), s = sin(a);
        mv.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y) * size;
      }
      gl_Position = projectionMatrix * mv;
      vSoftZ = -mv.z; vSoftR = uStretch > 0.0 ? 0.0 : size * 0.45;   // big dust/veil sheets fade into the ground & walls
      vec2 cell = vec2(mod(uFrame, 4.0), 3.0 - floor(uFrame / 4.0));
      vUv = (cell + q + 0.5) / 4.0;
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }
  `;
  const WFRAG = `
    uniform sampler2D uMap; uniform vec4 uColor; uniform vec3 uLight;
    varying vec2 vUv; varying float vA; varying float vSoftR;
    #ifdef LIT_POOL
      varying vec3 vLit;
    #endif
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    ${A.glsl.softPars}
    void main(){
      if (vA < 0.004) discard;
      vec4 t = texture2D(uMap, vUv);
      float a = t.a * vA;
      if (vSoftR > 0.3) a *= softK(vSoftZ, vSoftR);
      float ff = atmosFogFactor();
      #ifdef ADDITIVE
        gl_FragColor = vec4(uColor.rgb * t.rgb * a * (1.0 - ff), 1.0);
      #else
        vec3 c = uColor.rgb * t.rgb * uLight;
        #ifdef LIT_POOL
          c += t.rgb * vLit;
          a = min(1.0, a * (1.0 + 0.6 * min(dot(vLit, vec3(0.33)), 1.5)));
        #endif
        gl_FragColor = vec4(mix(c, atmosFogC, ff), a);
      #endif
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  const fields = (A.fields = {});
  // light-pool uniforms shared by the lit fields (rain): position + reach, colour × strength
  const POOL_P = [
    new THREE.Vector4(0, -1e4, 0, 0.01),
    new THREE.Vector4(0, -1e4, 0, 0.01),
    new THREE.Vector4(0, -1e4, 0, 0.01),
  ];
  const POOL_C = [
    new THREE.Color(0, 0, 0),
    new THREE.Color(0, 0, 0),
    new THREE.Color(0, 0, 0),
  ];
  function updatePoolUniforms() {
    const P = A.flashPool || [];
    for (let i = 0; i < 3; i++) {
      const f = P[i],
        L = f && f.light;
      if (!L || !(L.intensity > 0.01)) {
        POOL_P[i].set(0, -1e4, 0, 0.01);
        POOL_C[i].setRGB(0, 0, 0);
        continue;
      }
      POOL_P[i].set(L.position.x, L.position.y, L.position.z, L.distance || 10);
      POOL_C[i].copy(L.color).multiplyScalar(Math.min(L.intensity, 400) * 0.12);
    }
  }
  function makeField(name, count, opts) {
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
    const seeds = new Float32Array(count * 4);
    for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
    geo.setAttribute("iSeed", new THREE.InstancedBufferAttribute(seeds, 4));
    geo.instanceCount = count;
    const u = A.softUniforms(
      A.fogUniforms({
        uMap: { value: A.atlasTex },
        uCam: { value: new THREE.Vector3() },
        uBox: { value: new THREE.Vector3().fromArray(opts.box) },
        uVel: { value: new THREE.Vector3() },
        uTime: { value: 0 },
        uSize: { value: opts.size },
        uStretch: { value: opts.stretch || 0 },
        uJitter: { value: opts.jitter || 0 },
        uAmount: { value: 0 },
        uFrame: { value: opts.frame },
        uColor: { value: new THREE.Vector4(1, 1, 1, 1) },
        uLight: { value: new THREE.Color(1, 1, 1) },
        uShelter: { value: new THREE.Vector2(6, 0) },
        uNear: {
          value: new THREE.Vector3().fromArray(opts.near || [0, 0.01, 0]),
        },
      }),
    );
    const defs = {};
    if (opts.additive) defs.ADDITIVE = 1;
    if (opts.lit) {
      defs.LIT_POOL = 1;
      u.uPL = { value: POOL_P };
      u.uPC = { value: POOL_C };
    }
    const mat = new THREE.ShaderMaterial({
      uniforms: u,
      vertexShader: WVERT,
      fragmentShader: WFRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      defines: defs,
    });
    if (opts.additive) {
      mat.blending = THREE.CustomBlending;
      mat.blendSrc = THREE.OneFactor;
      mat.blendDst = THREE.OneFactor;
    }
    mat.name = "atmos_field_" + name;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = "atmos_field_" + name;
    mesh.frustumCulled = false;
    mesh.renderOrder = 28;
    mesh.visible = false;
    G.scene.add(mesh);
    const f = { mesh, u, count, amount: 0 };
    fields[name] = f;
    return f;
  }
  function setField(f, amount, vel, color, alpha, light) {
    f.amount = amount;
    f.mesh.visible = amount > 0.003;
    if (!f.mesh.visible) return;
    f.u.uAmount.value = amount;
    f.u.uCam.value.copy(A.camPos);
    f.u.uTime.value = A.animTime % 2000;
    if (vel) f.u.uVel.value.copy(vel);
    if (color !== undefined) {
      const c = A.color(color, A.tmpC);
      f.u.uColor.value.set(c.r, c.g, c.b, alpha);
    }
    if (light) f.u.uLight.value.copy(light);
  }

  // ------------------------------------------------------------------
  // Steam vents & distant plumes
  // ------------------------------------------------------------------
  const vents = [];
  function buildVents() {
    const L = G.LAYOUT;
    if (!L) return;
    let pts = [];
    try {
      if (!G.isStub("map") && Array.isArray(G.map.manholes))
        pts = G.map.manholes.map((m) => ({ x: m.x, z: m.z, y: m.y || 0 }));
    } catch (e) {
      pts = [];
    }
    if (!pts.length) {
      for (const a of L.avenues)
        for (const s of L.streets) {
          if (s.park) continue;
          if (a.x < s.x0 || a.x > s.x1 || s.z < a.z0 || s.z > a.z1) continue;
          const h = G.util.hash2(a.x * 3 + 11, s.z * 7 + 5);
          if (h > 0.3) continue;
          const ox = (G.util.hash2(a.x, s.z) - 0.5) * 7,
            oz = (G.util.hash2(s.z, a.x) - 0.5) * 5;
          pts.push({ x: a.x + ox, z: s.z + oz, y: 0 });
        }
    } else
      pts = pts.filter(
        (p, i) => G.util.hash2(Math.round(p.x), Math.round(p.z)) < 0.35,
      );
    for (const p of pts) {
      const e = FX.steam(
        new THREE.Vector3(p.x, p.y + 0.05, p.z),
        rr(0.7, 1.2),
        { lod: 80, rate: rr(3, 6) },
      );
      if (e) vents.push(e);
    }
  }

  // Distant plumes: picked from the LAYOUT (generic city blocks only — never inside a
  // landmark SITE, never within a discoverable LOCATION, spread across the map, biased
  // toward the burnt-out Financial District / Brooklyn / Midtown South). Deterministic.
  const PLUME_COUNT = 7;
  function choosePlumeSites() {
    const L = G.LAYOUT,
      out = [];
    if (!L || !Array.isArray(L.blocks) || !L.blocks.length) return out;
    const rng = G.util && G.util.rng ? G.util.rng(9151) : Math.random;
    const bias = {
      financial_district: 1.6,
      brooklyn: 1.5,
      midtown_south: 1.2,
      greenwich_village: 1.0,
      midtown: 0.8,
      upper_west_side: 0.7,
      upper_east_side: 0.7,
    };
    const cands = [];
    for (const b of L.blocks) {
      const w = b.x1 - b.x0,
        d = b.z1 - b.z0;
      if (w < 30 || d < 20) continue;
      const x = b.cx,
        z = b.cz;
      if (!L.isLand(x, z) || (L.inPark && L.inPark(x, z))) continue;
      if (L.rectOverlapsSite && L.rectOverlapsSite(b.x0, b.z0, b.x1, b.z1, 6))
        continue;
      if (L.siteAt && L.siteAt(x, z, 20)) continue;
      let nearLoc = false;
      for (const l of L.LOCATIONS || [])
        if (Math.hypot(x - l.x, z - l.z) < (l.r || 30) + 45) {
          nearLoc = true;
          break;
        }
      if (nearLoc) continue;
      const vp = L.cryoExit;
      if (vp && Math.hypot(x - vp.x, z - vp.z) < 200) continue;
      cands.push({ b, score: (bias[b.district] || 0.8) * (0.4 + rng()) });
    }
    cands.sort((a, b) => b.score - a.score);
    const perDist = {};
    for (let pass = 1; pass <= 2; pass++) {
      // pass 1: one per district (spread over the skyline), pass 2: fill
      for (const c of cands) {
        if (out.length >= PLUME_COUNT) break;
        const x = c.b.cx,
          z = c.b.cz,
          dn = c.b.district || "?";
        if ((perDist[dn] || 0) >= pass) continue;
        if (out.some((o) => Math.hypot(o.x - x, o.z - z) < 230)) continue;
        perDist[dn] = (perDist[dn] || 0) + 1;
        out.push({ x, z, h: 170 + rng() * 90, w: 26 + rng() * 14 });
      }
    }
    return out;
  }
  let PLUME_SITES = [];
  const PVERT = `
    attribute vec4 iBase;   // x, y, z, height
    attribute vec4 iParam;  // width, seed, alpha, glow
    uniform vec3 uCam; uniform vec2 uWind; uniform float uTime;
    varying vec2 vUv; varying vec4 vParam; varying float vFade; varying float vH; varying float vHm;
    #include <fog_pars_vertex>
    void main(){
      float y = position.y;       // 0..1 up the column
      float h = iBase.w;
      vec3 base = iBase.xyz;
      vec3 up = vec3(0.0, 1.0, 0.0);
      vec3 toCam = uCam - base; toCam.y = 0.0;
      float dc = length(toCam);
      toCam /= max(dc, 1e-3);
      // width: tight rising column that mushrooms out into a broad, drifting canopy near the top
      float spread = 0.55 + 1.3 * y + 4.2 * pow(smoothstep(0.35, 1.0, y), 1.6);
      float w = iParam.x * spread * (1.0 + 0.08 * sin(uTime * 0.3 + iParam.y * 9.0 + y * 6.0));
      // wind shear: little lean low down, strong lean once the smoke loses buoyancy
      vec2 wv = uWind; float ws = length(wv); vec2 wd = ws > 0.01 ? wv / ws : vec2(0.8, 0.6);
      float shear = h * (0.05 * y + 0.85 * pow(smoothstep(0.3, 1.0, y), 1.5)) * clamp(0.35 + ws * 0.12, 0.35, 1.3);
      // the canopy flattens: the top rises slower than it spreads
      float yy = y < 0.55 ? y : 0.55 + (y - 0.55) * 0.55;
      vec3 ctr = base + up * yy * h + vec3(wd.x, 0.0, wd.y) * shear;
      // ribbon turned around its own (sheared) centre line toward the viewer: from the street it is the
      // usual upright column, from rooftops / the air the wind-blown canopy opens into a broad sheet
      // instead of an edge-on black line
      float y2 = min(y + 0.04, 1.0), y1 = y2 - 0.04;
      float s1 = h * (0.05 * y1 + 0.85 * pow(smoothstep(0.3, 1.0, y1), 1.5)) * clamp(0.35 + ws * 0.12, 0.35, 1.3);
      float s2 = h * (0.05 * y2 + 0.85 * pow(smoothstep(0.3, 1.0, y2), 1.5)) * clamp(0.35 + ws * 0.12, 0.35, 1.3);
      float q1 = y1 < 0.55 ? y1 : 0.55 + (y1 - 0.55) * 0.55, q2 = y2 < 0.55 ? y2 : 0.55 + (y2 - 0.55) * 0.55;
      vec3 tang = up * (q2 - q1) * h + vec3(wd.x, 0.0, wd.y) * (s2 - s1);
      vec3 v3 = normalize(uCam - ctr);
      vec3 rgt = cross(normalize(tang + up * 1e-3), v3);
      vec3 right = length(rgt) > 1e-3 ? normalize(rgt) : normalize(cross(up, toCam));
      vec3 wp = ctr + right * position.x * w;
      vUv = vec2(position.x + 0.5, y);
      vParam = iParam;
      vH = h / max(iParam.x, 1.0); vHm = h;
      vFade = smoothstep(90.0, 220.0, dc);
      vec4 mvPosition = viewMatrix * vec4(wp, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
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

  function update(dt, realDt, animDt) {
    const env = A.env,
      W = A.weather ? A.weather.cur : null;
    const inter = env.interior;
    // lighting factor for alpha fields
    _light.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.7);
    _light.r += env.lightColor.r * env.lightInt * 0.25;
    _light.g += env.lightColor.g * env.lightInt * 0.25;
    _light.b += env.lightColor.b * env.lightInt * 0.25;
    const sheltered = !!(A.weather && A.weather.sheltered);
    // dry zone around the player while under a roof (smoothly faded, radius from the roof height)
    shelterK = A.damp(
      shelterK,
      sheltered && !inter ? 1 : 0,
      4,
      realDt || 0.016,
    );
    if (sheltered) shelterR = A.clamp(3 + (A.weather.roofH || 4) * 0.6, 3.5, 9);
    for (const k of [
      "rain",
      "rainnear",
      "ash",
      "rad",
      "radveil",
      "dust",
      "duststreak",
    ])
      if (fields[k])
        fields[k].u.uShelter.value.set(
          k === "dust" ? shelterR * 0.6 : shelterR,
          shelterK * (k === "dust" ? 0.7 : 1),
        );
    // motes: always (subtle), more indoors (bunker dust in the light)
    _vel.set(ATMOS.wind.x * 0.08, 0.02, ATMOS.wind.z * 0.08);
    const moteI = inter ? 0.9 : 0.35 + 0.35 * (1 - env.night);
    setField(
      fields.motes,
      inter ? 0.8 : 0.55,
      _vel,
      0xfff4d8,
      0.35 * moteI,
      null,
    );
    // ash: outdoors, district-dependent, heavier in dust storms
    const dist = ATMOS.district;
    const ashBase =
      dist === "financial_district" || dist === "brooklyn"
        ? 0.5
        : dist === "central_park"
          ? 0.15
          : 0.3;
    _vel.set(ATMOS.wind.x * 0.35, -0.45, ATMOS.wind.z * 0.35);
    setField(
      fields.ash,
      inter ? 0 : Math.min(1, ashBase + (W ? W.dust * 0.4 + W.rad * 0.3 : 0)),
      _vel,
      0x6a665e,
      0.75,
      _light,
    );
    // rain
    const rain = !inter && W ? W.rain : 0;
    _vel.set(W ? W.windX * 0.5 : 0, -15, W ? W.windZ * 0.5 : 0);
    // streaks catch the light: a brightness floor (lamps, neon, the grey sky behind them) so rain reads at night too
    _rainL.copy(_light).multiplyScalar(1.15);
    _rainL.r += 0.07;
    _rainL.g += 0.075;
    _rainL.b += 0.085;
    if (rain > 0.003) updatePoolUniforms();
    setField(fields.rain, rain, _vel, 0xc4ced2, 0.3, _rainL);
    setField(fields.rainnear, rain, _vel, 0xd4dce0, 0.22, _rainL);
    // dust storm sheets
    const dust = !inter && W ? W.dust : 0;
    _vel.set(W ? W.windX * 1.4 : 0, 0.3, W ? W.windZ * 1.4 : 0);
    setField(fields.dust, dust, _vel, 0xa8906a, 0.2, _light);
    _vel.set(W ? W.windX * 1.9 : 0, -0.25, W ? W.windZ * 1.9 : 0);
    setField(fields.duststreak, dust, _vel, 0xc0a47c, 0.13, _light);
    // rad-weather specks
    const rad = !inter && W ? W.rad : 0;
    _vel.set(W ? W.windX * 0.4 : 0, -0.8, W ? W.windZ * 0.4 : 0);
    _vel.set(W ? W.windX * 0.8 : 0, -0.6, W ? W.windZ * 0.8 : 0);
    setField(
      fields.rad,
      rad,
      _vel,
      0x7aff4a,
      1.1 * (0.6 + 0.4 * Math.sin(A.animTime * 1.7)),
      null,
    );
    _vel.set(W ? W.windX * 1.2 : 0, 0.2, W ? W.windZ * 1.2 : 0);
    _radL.copy(_light).multiplyScalar(1.3);
    _radL.g *= 1.25;
    setField(fields.radveil, rad, _vel, 0x78a846, 0.16, _radL);
    // rain splashes near the player
    if (rain > 0.05 && animDt > 0 && A.psAlpha) {
      splashAcc += animDt * 150 * rain;
      while (splashAcc >= 1) {
        splashAcc -= 1;
        const a = Math.random() * Math.PI * 2,
          r = Math.sqrt(Math.random()) * 14;
        if (shelterK > 0.5 && r < shelterR + 1) continue; // dry under the roof
        const x = A.camPos.x + Math.cos(a) * r,
          z = A.camPos.z + Math.sin(a) * r;
        const y = A.groundAt(x, z, A.camPos.y + 1);
        if (y < A.camPos.y - 6) continue;
        A.psAlpha.spawn({
          x,
          y: y + 0.03,
          z,
          size: 0.05,
          size1: rr(0.2, 0.35),
          life: 0.28,
          color: 0xc8d0d4,
          alpha: 0.5,
          frame: FR.SPLASH,
          rot: 0,
          fadeIn: 0.02,
          lit: 1,
        });
      }
    }
    // plumes
    if (plumes) {
      plumes.visible = !inter;
      const u = plumes.material.uniforms;
      u.uCam.value.copy(A.camPos);
      u.uTime.value = A.animTime;
      u.uWind.value.set(ATMOS.wind.x, ATMOS.wind.z);
      u.uLight.value.copy(_light);
      u.uGlowCol.value
        .setRGB(3, 1.1, 0.3)
        .multiplyScalar(0.3 + 0.9 * env.night);
    }
  }

  function reset() {
    /* ambient emitters are permanent world features */
  }

  A.addSystem({ name: "ambient", order: 70, init, update, reset });
})();
