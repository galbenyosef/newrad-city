// play-inline-65 03 — puff_cap
// Lines 351-701 of readable/play-inline-65.pretty.js (statement-aligned).
  function initDebris() {
    const g = new THREE.DodecahedronGeometry(0.22, 0);
    g.scale(1, 0.7, 1.2);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.05,
    });
    mat.name = "atmos_debris";
    debMesh = new THREE.InstancedMesh(g, mat, DEB_CAP);
    debMesh.name = "atmos_debris";
    debMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    debMesh.count = 0;
    debMesh.frustumCulled = false;
    debMesh.castShadow = false;
    debMesh.setColorAt(0, new THREE.Color(1, 1, 1));
    G.scene.add(debMesh);
  }
  function spawnDebris(pos, n, speed, opts) {
    opts = opts || {};
    for (let i = 0; i < n; i++) {
      if (debris.length >= DEB_CAP) debris.shift();
      A.randDir(_d);
      _d.y = Math.abs(_d.y) * 1.3 + 0.35;
      _d.normalize();
      const sp = rr(0.4, 1) * speed;
      debris.push({
        p: new THREE.Vector3(
          pos.x + rr(-0.4, 0.4),
          pos.y + rr(0.1, 0.6),
          pos.z + rr(-0.4, 0.4),
        ),
        v: new THREE.Vector3(_d.x * sp, _d.y * sp, _d.z * sp),
        r: new THREE.Vector3(rr(0, 6), rr(0, 6), rr(0, 6)),
        w: new THREE.Vector3(rr(-9, 9), rr(-9, 9), rr(-9, 9)),
        s: rr(0.5, 1.6) * (opts.scale || 1),
        age: 0,
        life: rr(4, 7),
        burn: Math.random() < (opts.burn !== undefined ? opts.burn : 0.35),
        trailT: 0,
        col: opts.color || (Math.random() < 0.5 ? 0x5e5850 : 0x3a3430),
        rest: false,
      });
    }
  }
  const _col = new THREE.Color();
  function updateDebris(dt) {
    if (!debMesh) return;
    for (let i = debris.length - 1; i >= 0; i--) {
      const d = debris[i];
      d.age += dt;
      if (d.age > d.life) {
        debris.splice(i, 1);
        continue;
      }
      if (!d.rest && dt > 0) {
        d.v.y -= 9.8 * dt;
        d.p.addScaledVector(d.v, dt);
        d.r.addScaledVector(d.w, dt);
        const gy = A.groundAt(d.p.x, d.p.z, d.p.y + 0.5);
        if (d.p.y < gy + 0.1 * d.s) {
          d.p.y = gy + 0.1 * d.s;
          if (Math.abs(d.v.y) < 1.2) {
            d.rest = true;
            d.v.set(0, 0, 0);
          } else {
            d.v.y = -d.v.y * 0.35;
            d.v.x *= 0.55;
            d.v.z *= 0.55;
            d.w.multiplyScalar(0.6);
          }
          if (Math.random() < 0.3) FX.dust(d.p, { scale: 0.35, count: 3 });
        }
        if (d.burn && d.age < 2.5) {
          d.trailT -= dt;
          if (d.trailT <= 0) {
            d.trailT = 0.035;
            const hot = 1 - d.age / 2.5;
            A.psAdd.spawn({
              pos: d.p,
              size: 0.45 * d.s * hot,
              size1: 0.1,
              life: 0.3,
              color: 0xffb060,
              intensity: 3,
              color1: 0xa02004,
              intensity1: 1,
              frame: FR.FLAME,
              fadeIn: 0.02,
            });
            if (Math.random() < 0.7)
              A.psAlpha.spawn({
                pos: d.p,
                vy: 0.5,
                size: 0.35 * d.s,
                size1: rr(1.6, 2.6) * d.s,
                life: rr(1.2, 2.2),
                color: 0x2e2a27,
                alpha: 0.26 * hot + 0.06,
                frame: FR.SMOKE1 + (i % 3),
                wind: 0.5,
                drag: 1.2,
                rotv: rr(-1, 1),
              });
          }
        } else if (d.age < 0.9) {
          // plain chunks drag a short trail of dust while they fly
          d.trailT -= dt;
          if (d.trailT <= 0) {
            d.trailT = 0.06;
            A.psAlpha.spawn({
              pos: d.p,
              size: 0.18 * d.s,
              size1: 0.9 * d.s,
              life: rr(0.5, 0.9),
              color: 0x6e665a,
              alpha: 0.22 * (1 - d.age / 0.9),
              frame: FR.DUST,
              drag: 2,
              wind: 0.4,
              rotv: rr(-1, 1),
              lit: 1,
            });
          }
        }
      }
    }
    const n = debris.length;
    for (let i = 0; i < n; i++) {
      const d = debris[i];
      const fade = d.age > d.life - 1 ? Math.max(0.01, d.life - d.age) : 1;
      _q.setFromEuler(_e.set(d.r.x, d.r.y, d.r.z));
      _s.setScalar(d.s * fade);
      _m.compose(d.p, _q, _s);
      debMesh.setMatrixAt(i, _m);
      _col.set(d.col);
      if (d.burn && d.age < 2.5)
        _col.lerp(A.tmpC.setRGB(2.5, 0.8, 0.2), (1 - d.age / 2.5) * 0.6);
      debMesh.setColorAt(i, _col);
    }
    debMesh.count = n;
    debMesh.visible = n > 0;
    if (n) {
      debMesh.instanceMatrix.needsUpdate = true;
      if (debMesh.instanceColor) debMesh.instanceColor.needsUpdate = true;
    }
  }

  // ------------------------------------------------------------------
  // VOLUMETRIC PUFFS — grenade / missile / car / plasma fireballs and their smoke.
  // Camera-facing billboards (one instanced draw) whose pixels are a procedural volume: a
  // pseudo-sphere eroded by animated 3D noise (no geometric edges, the silhouette tears and
  // breaks up as the puff ages), a per-puff TEMPERATURE mapped through a blackbody ramp (hot
  // cores stay yellow-orange, never white; cooling gas turns red, then soot), lit smoke
  // (sun wrap + ambient, fire glowing through from inside), premultiplied blending (hot gas
  // glows while cold soot occludes) and soft-particle depth fade against walls and the street.
  // ------------------------------------------------------------------
  const PUFF_VERT = `
    attribute vec4 iPos;   // xyz, size
    attribute vec4 iP;     // temperature, alpha, seed, rotation
    attribute vec4 iQ;     // ramp (0 fire, 1 plasma, 2 electric), -, smoke tone, erosion
    varying vec2 vQ; varying vec4 vP; varying vec4 vQ2; varying float vSize;
    varying float vSoftZ;
    #include <fog_pars_vertex>
    void main(){
      vec4 mv = modelViewMatrix * vec4(iPos.xyz, 1.0);
      float c = cos(iP.w), s = sin(iP.w);
      vec2 q = position.xy;
      mv.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y) * iPos.w;
      gl_Position = projectionMatrix * mv;
      vQ = q; vP = iP; vQ2 = iQ; vSize = iPos.w; vSoftZ = -mv.z;
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }
  `;
  const PUFF_FRAG = `
    uniform sampler2D uNoise;
    uniform float uTime;
    uniform vec3 uSunV, uSunCol, uAmb, uSmokeA, uSmokeB;
    varying vec2 vQ; varying vec4 vP; varying vec4 vQ2; varying float vSize;
    #include <fog_pars_fragment>
    ${A.glsl.noise}
    ${A.glsl.fogFactor}
    ${A.glsl.softPars}
    vec3 ramp(float T, float k){
      // blackbody-ish, HDR but capped: dark red → red-orange → orange → yellow-orange
      vec3 c = vec3(0.75, 0.1, 0.01) * smoothstep(0.08, 0.3, T);
      c = mix(c, vec3(1.8, 0.52, 0.07), smoothstep(0.3, 0.55, T));
      c = mix(c, vec3(2.1, 0.9, 0.17), smoothstep(0.55, 0.85, T));
      c = mix(c, vec3(2.4, 1.22, 0.3), smoothstep(0.85, 1.15, T));
      if (k > 1.5) c = c.bgr * vec3(0.55, 1.1, 1.9);            // electric: blue-white arcs
      else if (k > 0.5) c = vec3(c.g * 0.45, c.r * 1.05, c.b * 0.5 + 0.02);   // plasma: toxic green
      return c;
    }
    void main(){
      vec2 q0 = vQ * 2.0;
      if (dot(q0, q0) > 1.0) discard;
      float seed = vP.z;
      // domain warp: the billow outline wanders, so a puff never reads as a clean disc/sphere
      vec2 wq = vec2(an3(vec3(q0 * 1.6, seed * 2.3 + uTime * 0.35)), an3(vec3(q0 * 1.6 + 7.1, seed * 1.7 - uTime * 0.3))) - 0.5;
      vec2 q = q0 + wq * 0.34;
      float r = length(q);
      if (r > 1.0) discard;
      float sph = sqrt(max(1.0 - r * r, 0.0));
      // evolving turbulence: large billows + fine churn, advected upward through the puff
      vec3 np = vec3(q * 1.25, 0.0) + vec3(seed * 3.7, seed * 1.3 - uTime * 0.55, seed * 5.1 + uTime * 0.18);
      float n1 = afbm3(np * 1.7);
      float n2 = an3(np * 4.6 + 13.0 - vec3(0.0, uTime * 1.2, 0.0));
      float n = n1 * 0.78 + n2 * 0.3;
      // density: sphere eroded by noise; erosion grows with age → torn, wispy break-up
      float ero = vQ2.w;
      float rim = 1.0 - sph;
      float dens = sph * 1.2 + (n - 0.52) * 1.7 + (n2 - 0.5) * 1.1 * rim - ero - rim * rim * 0.25;
      float a = smoothstep(0.0, 0.38, dens) * vP.y * smoothstep(1.0, 0.72, r) * smoothstep(1.0, 0.7, length(q0));   // never a hard disc edge (warped or not)
      a *= softK(vSoftZ, vSize * 0.45);
      if (a < 0.004) discard;
      // temperature: hot core, cooler ragged rim; the top cools first (buoyant soot cap)
      float T = vP.x * clamp(sph * 1.0 + (n - 0.47) * 1.9 - q.y * 0.15, 0.0, 1.35);
      T *= smoothstep(0.02, 0.4, sph + (n2 - 0.5) * 0.45);     // sooty, cooler limb: the outline is smoke, not glow
      vec3 fire = ramp(T, vQ2.x);
      float fireM = smoothstep(0.1, 0.42, T);
      // lit smoke: view-space pseudo normal bumped by the noise, wrapped sun + ambient
      vec3 N = normalize(vec3(q * 0.85 + (vec2(n2, n1) - 0.5) * 0.7, sph + 0.25));
      float lam = clamp(dot(N, uSunV) * 0.6 + 0.4, 0.0, 1.0);
      vec3 sc = mix(uSmokeA, uSmokeB, vQ2.z) * (0.6 + 0.65 * n);
      vec3 smoke = sc * (uAmb + uSunCol * lam);
      // embers still glowing inside young smoke
      smoke += ramp(vP.x * 0.75, vQ2.x) * 0.22 * smoothstep(0.05, 0.4, vP.x) * (1.0 - fireM) * sph;
      vec3 col = mix(smoke, fire, fireM);
      float occ = mix(1.0, 0.82, fireM);                 // glowing gas lets a little background through
      float ff = atmosFogFactor();
      col = mix(col, atmosFogC, ff * mix(1.0, 0.6, fireM));
      gl_FragColor = vec4(col * a, a * occ);             // premultiplied alpha
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  const PUFF_CAP = 320;
  const PF = {
    n: 0,
    mesh: null,
    mat: null,
    px: new Float32Array(PUFF_CAP),
    py: new Float32Array(PUFF_CAP),
    pz: new Float32Array(PUFF_CAP),
    vx: new Float32Array(PUFF_CAP),
    vy: new Float32Array(PUFF_CAP),
    vz: new Float32Array(PUFF_CAP),
    age: new Float32Array(PUFF_CAP),
    life: new Float32Array(PUFF_CAP),
    s0: new Float32Array(PUFF_CAP),
    s1: new Float32Array(PUFF_CAP),
    T0: new Float32Array(PUFF_CAP),
    hold: new Float32Array(PUFF_CAP),
    cool: new Float32Array(PUFF_CAP),
    a0: new Float32Array(PUFF_CAP),
    rot: new Float32Array(PUFF_CAP),
    rotv: new Float32Array(PUFF_CAP),
    seed: new Float32Array(PUFF_CAP),
    drag: new Float32Array(PUFF_CAP),
    buoy: new Float32Array(PUFF_CAP),
    wind: new Float32Array(PUFF_CAP),
    ramp: new Float32Array(PUFF_CAP),
    tone: new Float32Array(PUFF_CAP),
    e0: new Float32Array(PUFF_CAP),
    gy: new Float32Array(PUFF_CAP),
    order: new Uint16Array(PUFF_CAP),
    depth: new Float32Array(PUFF_CAP),
  };
  const PF_KEYS = [
    "px",
    "py",
    "pz",
    "vx",
    "vy",
    "vz",
    "age",
    "life",
    "s0",
    "s1",
    "T0",
    "hold",
    "cool",
    "a0",
    "rot",
    "rotv",
    "seed",
    "drag",
    "buoy",
    "wind",
    "ramp",
    "tone",
    "e0",
    "gy",
  ];
  function initPuffs() {
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
    const mk = (k) => {
      const a = new THREE.InstancedBufferAttribute(
        new Float32Array(PUFF_CAP * 4),
        4,
      );
      a.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute(k, a);
      return a;
    };
    PF.aPos = mk("iPos");
    PF.aP = mk("iP");
    PF.aQ = mk("iQ");
    geo.instanceCount = 0;
    PF.mat = new THREE.ShaderMaterial({
      uniforms: A.softUniforms(
        A.fogUniforms({
          uNoise: { value: A.noiseTex },
          uTime: { value: 0 },
          uSunV: { value: new THREE.Vector3(0, 1, 0) },
          uSunCol: shared.uSunCol,
          uAmb: shared.uAmbient,
          uSmokeA: { value: new THREE.Color(0x221d1a) },
          uSmokeB: { value: new THREE.Color(0x524a42) },
        }),
      ),
      vertexShader: PUFF_VERT,
      fragmentShader: PUFF_FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
      blendEquation: THREE.AddEquation,
    });
    PF.mat.name = "atmos_puffs";
    PF.mesh = new THREE.Mesh(geo, PF.mat);
    PF.mesh.name = "atmos_puffs";
    PF.mesh.frustumCulled = false;
    PF.mesh.renderOrder = 25;
    PF.mesh.visible = false;
    G.scene.add(PF.mesh);
  }
  /** o: {pos|x,y,z, vx,vy,vz, delay, life, size, size1, T, hold, cool, alpha, drag, buoy, wind, ramp, tone, erode} */
