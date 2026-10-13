/* src/atmosphere/58_fx_explosions.js */
/* =====================================================================
 * ATMOSPHERE / FX — explosions & the NUKE-CLASS mushroom cloud
 * G.fx.explosion(pos, radius, kind='normal'|'nuke'|'plasma'|'fire'|'electric'|'car'|'grenade')
 * Mesh-based volumetric-looking fireballs (noise-displaced icosphere with a
 * heat→smoke ramp, lit by the sun), shockwave rings & blast shell, flaming
 * debris chunks (instanced, bouncing, trailing smoke), sparks, smoke
 * columns, ground dust surge, scorch decals, light flash, camera shake,
 * screen flash, sky flash, and for a nuke-class blast: a full mushroom cloud
 * (rising fireball → rolling toroidal cap, stem, condensation ring, base
 * surge), lingering fires and a decaying radiation zone.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    FX = G.fx,
    FR = A.FR;
  const rr = A.rr,
    clamp = A.clamp;
  const _d = new THREE.Vector3(),
    _v = new THREE.Vector3();

  // ------------------------------------------------------------------
  // Fireball / cloud shader
  // ------------------------------------------------------------------
  const VERT = `
    uniform sampler2D uNoise;
    uniform float uTime, uAmp, uFreq;
    uniform vec3 uScroll;
    varying vec3 vN; varying vec3 vW; varying float vNz;
    #include <fog_pars_vertex>
    ${A.glsl.noise}
    float dispH(vec3 q){ return afbm3(q * uFreq + uScroll * uTime); }
    void main(){
      // displace along the normal by 3D noise; rebuild the normal from two neighbour samples
      vec3 nrm = normalize(normal);
      float h0 = dispH(position);
      vNz = h0;
      vec3 p = position + nrm * (h0 - 0.45) * uAmp;
      vec3 t1 = normalize(cross(nrm, abs(nrm.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
      vec3 t2 = cross(nrm, t1);
      float e = 0.06;
      vec3 q1 = position + t1 * e, q2 = position + t2 * e;
      vec3 p1 = q1 + nrm * (dispH(q1) - 0.45) * uAmp;
      vec3 p2 = q2 + nrm * (dispH(q2) - 0.45) * uAmp;
      vec3 dn = normalize(cross(p1 - p, p2 - p));
      if (dot(dn, nrm) < 0.0) dn = -dn;
      vec4 wp = modelMatrix * vec4(p, 1.0);
      vW = wp.xyz;
      vN = normalize(mat3(modelMatrix) * dn);
      vec4 mvPosition = viewMatrix * wp;
      gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
  const FRAG = `
    uniform sampler2D uNoise;
    uniform float uTime, uHeat, uAlpha, uHotY, uHotRange, uFreq;
    uniform float uEdge, uUnder, uRimDark;   // nuke look: noisy silhouette, glowing underside, sooty rim
    uniform float uLimb;                     // grenade/car fireballs: contrasty turbulent core, cooler sooty limb
    uniform vec3 uScroll, uSunDir, uSunCol, uAmbient, uSmoke;
    uniform vec3 uHot1, uHot2, uHot3;
    varying vec3 vN; varying vec3 vW; varying float vNz;
    #include <fog_pars_fragment>
    ${A.glsl.noise}
    ${A.glsl.fogFactor}
    void main(){
      vec3 N = normalize(vN);
      vec3 V = normalize(cameraPosition - vW);
      if (dot(N, V) < 0.0) N = -N;
      // lumpy shading from the displaced surface (screen-space derivative normal)
      vec3 Nd = normalize(cross(dFdx(vW), dFdy(vW)));
      if (dot(Nd, V) < 0.0) Nd = -Nd;
      N = normalize(mix(N, Nd, 0.2 * (1.0 - uEdge)));   // smooth normals for the big, dense nuke meshes
      float detail = afbm3(vW * 0.35 * uFreq / 3.0 + uScroll * uTime * 1.7);
      float n = vNz * 0.6 + detail * 0.6;
      // fireballs: a finer, faster-churning octave so the surface never reads as one smooth solid
      float d2 = uLimb > 0.001 ? afbm3(vW * 0.42 * uFreq + uScroll * uTime * 3.2 + 17.0) : 0.5;
      n = mix(n, vNz * 0.35 + detail * 0.38 + d2 * 0.5, uLimb);
      // heat: global * vertical falloff from the hot height * noise
      float hy = 1.0 - smoothstep(0.0, uHotRange, vW.y - uHotY);
      // fireballs: sharpen the turbulence (hot tongues and dark sooty pockets instead of one flat glow)
      // and cool the limb — the core you look into burns white-orange, the edges roll over red into smoke
      float nh = mix(n, smoothstep(0.28, 0.9, n) * 1.1, uLimb);
      float rimV = clamp(dot(N, V), 0.0, 1.0);
      float limb = mix(1.0, 0.35 + 0.65 * smoothstep(0.05, 0.75, rimV), uLimb);
      float heat = clamp(uHeat * (0.35 + 0.9 * nh) * (0.35 + 0.65 * hy) * 1.25 * limb, 0.0, 1.2);
      vec3 fire = heat > 0.66 ? mix(uHot2, uHot1, (heat - 0.66) / 0.54) : (heat > 0.25 ? mix(uHot3, uHot2, (heat - 0.25) / 0.41) : uHot3 * (heat / 0.25));
      // lit smoke body
      float lam = max(dot(N, uSunDir), 0.0) * 0.7 + 0.3;
      lam = mix(lam, 0.6 + 0.4 * lam, uLimb);   // soft, scattering smoke (not a lit boulder)
      vec3 smoke = uSmoke * (0.55 + 0.6 * n) * (uAmbient + uSunCol * lam * 0.5);
      vec3 col = mix(smoke, fire, smoothstep(0.08, 0.4, heat));
      col += fire * smoothstep(0.4, 1.0, heat) * 0.6;
      // soft edges (rim fades) so the silhouette reads as billowing, not a hard ball
      float rim = smoothstep(0.0, 0.45, dot(N, V));
      // underside lit by the fire inside the cloud (hotter when the core is hot)
      float under = smoothstep(0.15, -0.75, N.y);
      float uh = clamp(uHeat, 0.0, 1.2);
      col += uHot2 * under * uUnder * (0.35 + 0.9 * n) * (0.04 + 0.3 * uh * uh);
      // sooty, darker silhouette rim gives the cloud definition against the sky
      col *= mix(1.0 - 0.5 * uRimDark, 1.0, rim);
      float edgeA = mix(mix(0.35, 1.0, rim), smoothstep(0.0, 0.6, rim + (n - 0.55) * 0.8), uEdge);
      float a = uAlpha * edgeA * smoothstep(0.1, 0.35, n + 0.2);
      a *= mix(1.0, smoothstep(0.12, 0.5, d2 * 0.8 + rimV * 0.55), uLimb);   // wispy, torn edges
      if (a < 0.01) discard;
      float ff = atmosFogFactor();
      col = mix(col, atmosFogC, ff);
      gl_FragColor = vec4(col, a);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  // Shockwave ring (flat) & blast shell
  const RING_FRAG = `
    uniform float uAlpha; uniform vec3 uColor;
    varying vec2 vUv;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    void main(){
      float r = length(vUv - 0.5) * 2.0;
      float a = smoothstep(0.55, 0.92, r) * smoothstep(1.0, 0.94, r) * uAlpha;
      float ff = atmosFogFactor();
      gl_FragColor = vec4(uColor * a * (1.0 - ff), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;
  const RING_VERT = `
    varying vec2 vUv;
    #include <fog_pars_vertex>
    void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
  const SHELL_VERT = `
    varying vec3 vN; varying vec3 vW;
    #include <fog_pars_vertex>
    void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal);
      vec4 mvPosition = viewMatrix * wp; gl_Position = projectionMatrix * mvPosition;
      #include <fog_vertex>
    }
  `;
  const SHELL_FRAG = `
    uniform float uAlpha; uniform vec3 uColor;
    varying vec3 vN; varying vec3 vW;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    void main(){
      vec3 V = normalize(cameraPosition - vW);
      float f = 1.0 - abs(dot(normalize(vN), V));
      float a = pow(f, 3.0) * uAlpha;
      float ff = atmosFogFactor();
      gl_FragColor = vec4(uColor * a * (1.0 - ff), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  const shared = {
    uSunDir: { value: new THREE.Vector3(0, 1, 0) },
    uSunCol: { value: new THREE.Color() },
    uAmbient: { value: new THREE.Color() },
  };
  const HOT = {
    fire: [
      new THREE.Color(6.5, 5.2, 3.2),
      new THREE.Color(4.2, 1.5, 0.28),
      new THREE.Color(0.9, 0.12, 0.02),
    ],
    // grenades / cars / missiles: a notch cooler so the ball keeps its internal detail after tone mapping
    fireball: [
      new THREE.Color(4.6, 3.1, 1.5),
      new THREE.Color(3.0, 0.95, 0.16),
      new THREE.Color(0.75, 0.1, 0.02),
    ],
    plasma: [
      new THREE.Color(4.5, 7.0, 3.5),
      new THREE.Color(1.0, 4.2, 0.6),
      new THREE.Color(0.1, 0.8, 0.08),
    ],
    electric: [
      new THREE.Color(4.5, 6.0, 8.0),
      new THREE.Color(0.8, 2.2, 5.0),
      new THREE.Color(0.1, 0.3, 1.0),
    ],
  };
  let baseMat = null,
    geoBall = null,
    geoBallHi = null,
    geoBallXL = null,
    geoRing = null,
    geoShell = null,
    geoTorus = null,
    geoStem = null,
    geoSkirt = null;
  let ringMatBase = null,
    shellMatBase = null;

  function makeCloudMat(hot, smoke) {
    const m = baseMat.clone();
    // share environment uniforms by reference
    m.uniforms.uSunDir = shared.uSunDir;
    m.uniforms.uSunCol = shared.uSunCol;
    m.uniforms.uAmbient = shared.uAmbient;
    m.uniforms.uNoise.value = A.noiseTex;
    const H = HOT[hot] || HOT.fire;
    m.uniforms.uHot1.value.copy(H[0]);
    m.uniforms.uHot2.value.copy(H[1]);
    m.uniforms.uHot3.value.copy(H[2]);
    m.uniforms.uSmoke.value.set(smoke !== undefined ? smoke : 0x2c2622);
    return m;
  }

  function init() {
    baseMat = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({
        uNoise: { value: A.noiseTex },
        uTime: { value: 0 },
        uAmp: { value: 0.35 },
        uFreq: { value: 3.0 },
        uScroll: { value: new THREE.Vector3(0, -0.4, 0) },
        uHeat: { value: 1 },
        uAlpha: { value: 1 },
        uHotY: { value: 0 },
        uHotRange: { value: 10 },
        uEdge: { value: 0 },
        uUnder: { value: 0 },
        uRimDark: { value: 0 },
        uLimb: { value: 0 },
        uSunDir: shared.uSunDir,
        uSunCol: shared.uSunCol,
        uAmbient: shared.uAmbient,
        uSmoke: { value: new THREE.Color(0x2c2622) },
        uHot1: { value: new THREE.Color() },
        uHot2: { value: new THREE.Color() },
        uHot3: { value: new THREE.Color() },
      }),
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      side: THREE.FrontSide,
      extensions: { derivatives: true },
    });
    baseMat.name = "atmos_fireball";
    geoBall = new THREE.IcosahedronGeometry(1, 3);
    geoBallHi = new THREE.IcosahedronGeometry(1, 4);
    geoBallXL = new THREE.IcosahedronGeometry(1, 5); // mushroom cap: dense enough that displacement reads as billows, not facets
    geoRing = new THREE.PlaneGeometry(2, 2);
    geoRing.rotateX(-Math.PI / 2);
    geoShell = new THREE.SphereGeometry(1, 24, 16);
    geoTorus = new THREE.TorusGeometry(1, 0.55, 40, 96);
    geoTorus.rotateX(Math.PI / 2);
    geoSkirt = new THREE.TorusGeometry(1, 0.16, 14, 72);
    geoSkirt.rotateX(Math.PI / 2);
    // stem profile (unit height): flared base, narrow neck, widening under the cap
    const prof = [];
    const pts = [
      [1.5, 0],
      [1.1, 0.03],
      [0.62, 0.1],
      [0.42, 0.25],
      [0.34, 0.45],
      [0.33, 0.65],
      [0.38, 0.82],
      [0.52, 0.95],
      [0.6, 1.0],
    ];
    for (const p of pts) prof.push(new THREE.Vector2(p[0], p[1]));
    geoStem = new THREE.LatheGeometry(prof, 28);
    ringMatBase = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({
        uAlpha: { value: 1 },
        uColor: { value: new THREE.Color() },
      }),
      vertexShader: RING_VERT,
      fragmentShader: RING_FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
      side: THREE.DoubleSide,
    });
    shellMatBase = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({
        uAlpha: { value: 1 },
        uColor: { value: new THREE.Color() },
      }),
      vertexShader: SHELL_VERT,
      fragmentShader: SHELL_FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });
    initDebris();
    initPuffs();
    // compile every explosion program up front (no hitch on the first grenade / big blast)
    A.onPrewarm(() => {
      const cloud = makeCloudMat("fire");
      const di = new THREE.InstancedMesh(debMesh.geometry, debMesh.material, 1);
      di.setColorAt(0, new THREE.Color(1, 1, 1));
      const pm = new THREE.Mesh(PF.mesh.geometry, PF.mat);
      return [
        new THREE.Mesh(geoBall, cloud),
        new THREE.Mesh(geoRing, ringMatBase),
        new THREE.Mesh(geoShell, shellMatBase),
        di,
        pm,
      ];
    });
  }

  // ------------------------------------------------------------------
  // Active explosion pieces
  // ------------------------------------------------------------------
  const active = []; // {obj, mat, t, dur, update(t, dt)}
  function addPiece(obj, dur, fn) {
    obj.frustumCulled = false;
    G.scene.add(obj);
    const p = { obj, t: 0, dur, fn };
    active.push(p);
    return p;
  }
  function killPiece(p) {
    if (p.obj.parent) p.obj.parent.remove(p.obj);
    p.obj.traverse((o) => {
      if (o.material && o.material.dispose) o.material.dispose();
    });
  }

  // ------------------------------------------------------------------
  // Debris chunks (instanced, physical)
  // ------------------------------------------------------------------
  const DEB_CAP = 64;
  let debMesh = null;
  const debris = [];
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _s = new THREE.Vector3();
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
  function spawnPuff(o) {
    let i = PF.n;
    if (i >= PUFF_CAP) {
      // full: recycle the most-aged puff
      let best = 0,
        bt = -1;
      for (let k = 0; k < PUFF_CAP; k++) {
        const t = PF.age[k] / PF.life[k];
        if (t > bt) {
          bt = t;
          best = k;
        }
      }
      i = best;
    } else PF.n++;
    const p = o.pos;
    PF.px[i] = p ? p.x : o.x;
    PF.py[i] = p ? p.y : o.y;
    PF.pz[i] = p ? p.z : o.z;
    PF.vx[i] = o.vx || 0;
    PF.vy[i] = o.vy || 0;
    PF.vz[i] = o.vz || 0;
    PF.age[i] = -(o.delay || 0);
    PF.life[i] = o.life || 2;
    PF.s0[i] = o.size || 1;
    PF.s1[i] = o.size1 || PF.s0[i] * 2;
    PF.T0[i] = o.T || 0;
    PF.hold[i] = o.hold || 0;
    PF.cool[i] = o.cool || 0.4;
    PF.a0[i] = o.alpha !== undefined ? o.alpha : 1;
    PF.rot[i] = Math.random() * 6.283;
    PF.rotv[i] = o.rotv !== undefined ? o.rotv : rr(-0.6, 0.6);
    PF.seed[i] = Math.random() * 10;
    PF.drag[i] = o.drag || 0;
    PF.buoy[i] = o.buoy || 0;
    PF.wind[i] = o.wind || 0;
    PF.ramp[i] = o.ramp || 0;
    PF.tone[i] = o.tone !== undefined ? o.tone : Math.random();
    PF.e0[i] = o.erode || 0;
    PF.gy[i] = A.groundAt(PF.px[i], PF.pz[i], PF.py[i] + 0.5);
  }
  function killPuff(i) {
    const j = --PF.n;
    if (i !== j)
      for (let k = 0; k < PF_KEYS.length; k++) {
        const a = PF[PF_KEYS[k]];
        a[i] = a[j];
      }
  }
  const _pfFwd = new THREE.Vector3();
  function updatePuffs(dt) {
    if (!PF.mesh) return;
    const wx = G.atmos.wind.x,
      wz = G.atmos.wind.z;
    if (dt > 0) {
      for (let i = 0; i < PF.n; i++) {
        const age = (PF.age[i] += dt);
        if (age >= PF.life[i]) {
          killPuff(i);
          i--;
          continue;
        }
        if (age < 0) continue;
        const k = Math.exp(-PF.drag[i] * dt);
        let vx = PF.vx[i] * k,
          vy = PF.vy[i] * k,
          vz = PF.vz[i] * k;
        vy += PF.buoy[i] * dt * Math.exp(-age * 0.5);
        const wk = Math.min(1, PF.wind[i] * dt);
        vx += (wx - vx) * wk;
        vz += (wz - vz) * wk;
        PF.px[i] += vx * dt;
        PF.py[i] += vy * dt;
        PF.pz[i] += vz * dt;
        // puffs roll along the street instead of sinking into it
        const minY =
          PF.gy[i] +
          (PF.s0[i] + (PF.s1[i] - PF.s0[i]) * Math.min(1, age / PF.life[i])) *
            0.28;
        if (PF.py[i] < minY) {
          PF.py[i] = minY;
          if (vy < 0) vy = 0;
        }
        PF.vx[i] = vx;
        PF.vy[i] = vy;
        PF.vz[i] = vz;
        PF.rot[i] += PF.rotv[i] * dt;
      }
    }
    PF.mat.uniforms.uTime.value = A.animTime % 1000;
    // depth sort far → near (premultiplied "over")
    const n = PF.n;
    let vis = 0;
    if (n) {
      G.camera.getWorldDirection(_pfFwd);
      const cx = A.camPos.x,
        cy = A.camPos.y,
        cz = A.camPos.z;
      for (let i = 0; i < n; i++) {
        if (PF.age[i] < 0) continue;
        PF.depth[i] =
          (PF.px[i] - cx) * _pfFwd.x +
          (PF.py[i] - cy) * _pfFwd.y +
          (PF.pz[i] - cz) * _pfFwd.z;
        PF.order[vis++] = i;
      }
      const ord = Array.prototype.slice
        .call(PF.order, 0, vis)
        .sort((a, b) => PF.depth[b] - PF.depth[a]);
      const P4 = PF.aPos.array,
        Pp = PF.aP.array,
        Pq = PF.aQ.array;
      for (let k = 0; k < vis; k++) {
        const i = ord[k],
          age = PF.age[i],
          t = age / PF.life[i],
          o = k * 4;
        const size =
          PF.s0[i] + (PF.s1[i] - PF.s0[i]) * (1 - Math.pow(1 - t, 2.6));
        const T =
          PF.T0[i] * Math.exp(-Math.max(0, age - PF.hold[i]) / PF.cool[i]);
        let a = PF.a0[i] * Math.min(1, age / 0.05);
        if (t > 0.5) {
          const u = (t - 0.5) / 0.5;
          a *= 1 - u * u * (3 - 2 * u);
        }
        P4[o] = PF.px[i];
        P4[o + 1] = PF.py[i];
        P4[o + 2] = PF.pz[i];
        P4[o + 3] = size;
        Pp[o] = T;
        Pp[o + 1] = a;
        Pp[o + 2] = PF.seed[i];
        Pp[o + 3] = PF.rot[i];
        Pq[o] = PF.ramp[i];
        Pq[o + 1] = t;
        Pq[o + 2] = PF.tone[i];
        Pq[o + 3] = PF.e0[i] + Math.pow(t, 1.4) * 0.95;
      }
      for (const at of [PF.aPos, PF.aP, PF.aQ]) {
        if (!vis) break;
        at.updateRange.offset = 0;
        at.updateRange.count = vis * 4;
        at.needsUpdate = true;
      }
    }
    PF.mesh.geometry.instanceCount = vis;
    PF.mesh.visible = vis > 0;
    if (vis && G.camera)
      PF.mat.uniforms.uSunV.value
        .copy(A.env.lightDir)
        .transformDirection(G.camera.matrixWorldInverse);
  }
  /**
   * A fireball as a cluster of hot puffs that roll out, stall, rise and cool into sooty,
   * grey-brown smoke, followed by a slower, bigger smoke column.
   */
  function puffExplosion(p, R, ramp, opts) {
    opts = opts || {};
    const k = Math.sqrt(R / 3);
    const nFire = opts.nFire || (ramp ? 10 : 16);
    for (let i = 0; i < nFire; i++) {
      A.randDir(_d);
      _d.y = _d.y * 0.7 + 0.25;
      _d.normalize();
      const r0 = R * rr(0.0, 0.45),
        sp = rr(3, 11) * k;
      spawnPuff({
        x: p.x + _d.x * r0,
        y: p.y + _d.y * r0 * 0.7,
        z: p.z + _d.z * r0,
        vx: _d.x * sp,
        vy: _d.y * sp + 1.2 * k,
        vz: _d.z * sp,
        delay: i < 4 ? 0 : rr(0, 0.07),
        life: rr(1.2, 2.1) * (ramp ? 0.7 : 1),
        size: R * rr(0.28, 0.55),
        size1: R * rr(0.8, 1.5),
        T: i % 3 === 2 ? rr(0.35, 0.55) : rr(0.85, 1.1),
        hold: rr(0.22, 0.45),
        cool: rr(0.28, 0.42),
        alpha: 0.96,
        drag: rr(3.2, 4.5),
        buoy: 2.6 * k,
        wind: 0.15,
        ramp,
        tone: rr(0, 0.45),
        erode: 0,
        rotv: rr(-1.2, 1.2),
      });
    }
    if (opts.smoke === false) return;
    const nSm = opts.nSmoke || (ramp ? 5 : 11);
    for (let i = 0; i < nSm; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) * 0.5 + 0.2;
      _d.normalize();
      const r0 = R * rr(0.15, 0.55),
        sp = rr(0.8, 2.2) * k;
      spawnPuff({
        x: p.x + _d.x * r0,
        y: p.y + R * rr(0.1, 0.5),
        z: p.z + _d.z * r0,
        vx: _d.x * sp,
        vy: rr(1.4, 3.2) * k,
        vz: _d.z * sp,
        delay: rr(0.12, 0.55),
        life: rr(3.5, 6.5) * (ramp ? 0.6 : 1),
        size: R * rr(0.55, 0.8),
        size1: R * rr(1.9, 2.8),
        T: rr(0.25, 0.5),
        hold: 0.05,
        cool: 0.35,
        alpha: rr(0.5, 0.68),
        drag: 1.1,
        buoy: 0.9 * k,
        wind: 0.35,
        ramp,
        tone: rr(0.35, 1),
        erode: 0.08,
        rotv: rr(-0.4, 0.4),
      });
    }
    if (ramp || opts.column === false) return;
    // lingering column: dark, oily smoke keeps boiling up from the blast site for ~10 s, leaning with the wind
    const nCol = opts.nColumn || 7;
    for (let i = 0; i < nCol; i++) {
      const f = i / nCol;
      spawnPuff({
        x: p.x + rr(-0.3, 0.3) * R,
        y: p.y + R * 0.2,
        z: p.z + rr(-0.3, 0.3) * R,
        vx: rr(-0.4, 0.4),
        vy: rr(2.2, 3.4) * k,
        vz: rr(-0.4, 0.4),
        delay: 0.5 + f * 2.6 + rr(0, 0.3),
        life: rr(8, 12),
        size: R * rr(0.5, 0.75),
        size1: R * rr(2.6, 3.8),
        T: i < 2 ? 0.32 : 0.12,
        hold: 0.1,
        cool: 0.5,
        alpha: rr(0.5, 0.64),
        drag: 0.8,
        buoy: 0.55 * k,
        wind: 0.25,
        ramp: 0,
        tone: rr(0.0, 0.25),
        erode: 0.12,
        rotv: rr(-0.3, 0.3),
      });
    }
  }

  // ------------------------------------------------------------------
  // Explosion building blocks
  // ------------------------------------------------------------------
  function shockRing(pos, maxR, dur, color, alpha) {
    const mat = ringMatBase.clone();
    mat.uniforms.uColor.value.copy(A.color(color || 0xffc890));
    const mesh = new THREE.Mesh(geoRing, mat);
    mesh.position.copy(pos);
    mesh.position.y += 0.15;
    mesh.renderOrder = 26;
    addPiece(mesh, dur, (t) => {
      const u = t / dur,
        e = 1 - Math.pow(1 - u, 2.2);
      mesh.scale.setScalar(Math.max(0.01, maxR * e));
      mat.uniforms.uAlpha.value = (alpha || 1.5) * (1 - u) * (1 - u);
    });
  }
  function blastShell(pos, maxR, dur, color, amp) {
    const mat = shellMatBase.clone();
    mat.uniforms.uColor.value.copy(A.color(color || 0xffe0b0));
    const mesh = new THREE.Mesh(geoShell, mat);
    mesh.position.copy(pos);
    mesh.renderOrder = 27;
    addPiece(mesh, dur, (t) => {
      const u = t / dur;
      mesh.scale.setScalar(Math.max(0.01, maxR * (1 - Math.pow(1 - u, 3))));
      mat.uniforms.uAlpha.value = (amp || 1.4) * (1 - u) * (1 - u); // gone well before 0.35 s
    });
  }
  function cameraKick(pos, R, strength) {
    const P = G.player;
    if (!P || !P.shake) return;
    const d = A.camDist(pos);
    const k = clamp((R * 6 - d) / (R * 6), 0, 1) * (strength || 1);
    if (k > 0.01) P.shake(Math.min(1.5, 0.25 + k * 1.1), 0.35 + k * 0.6);
  }

  // ------------------------------------------------------------------
  // Explosion kinds
  // ------------------------------------------------------------------
  function explodeNormal(p, R, kind) {
    const isPlasma = kind === "plasma",
      isElec = kind === "electric",
      isFire = kind === "fire";
    const hot = isPlasma ? "plasma" : isElec ? "electric" : "fire";
    const lightCol = isPlasma ? 0x7aff4a : isElec ? 0x6ab8ff : 0xffa050;
    const gy = A.groundAt(p.x, p.z, p.y + 0.5);
    const nearGround = p.y - gy < R * 1.2;
    const gp = new THREE.Vector3(p.x, gy, p.z);
    FX.flash(p, lightCol, 7 + R, 0.55, { range: Math.max(14, R * 7) });
    // the burning fireball keeps lighting the street and façades for a second, flickering as it rolls up
    if (!isElec)
      A.after(0.12, () => {
        FX.flash(
          _v.set(p.x, p.y + R * 0.5, p.z),
          isPlasma ? 0x6aff40 : 0xff8434,
          2.6 + R * 0.35,
          1.5,
          {
            range: Math.max(12, R * 5.5),
            flicker: 0.35,
            curve: "linear",
            priority: 1,
          },
        );
      });
    // core flash sprites
    A.psAdd.spawn({
      pos: p,
      size: R * 2.4,
      size1: R * 3.6,
      life: 0.12,
      color: lightCol,
      intensity: 1.3,
      frame: FR.GLOW,
      fadeIn: 0.01,
      fadeOut: 0.2,
    });
    A.psAdd.spawn({
      pos: p,
      size: R * 1.6,
      life: 0.07,
      color: 0xffe8c0,
      intensity: 3,
      frame: FR.STAR,
      fadeIn: 0.01,
    });
    // volumetric fireball: a cluster of procedural fire/smoke puffs (no mesh → no facets, no "boulder")
    puffExplosion(
      p,
      R,
      isPlasma ? 1 : isElec ? 2 : 0,
      isElec ? { nFire: 8, smoke: false } : null,
    );
    // flame licks: a few small, short-lived tongues flicking out of the ball
    const nFl = isPlasma ? 6 : 10;
    for (let i = 0; i < nFl; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) * 0.8 + 0.2;
      const sp = rr(2.5, 8) * R * 0.5;
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: R * rr(0.25, 0.45),
        size1: R * rr(0.45, 0.8),
        life: rr(0.2, 0.45),
        color: isPlasma ? 0xc8ffa0 : 0xffa048,
        intensity: 1.5,
        color1: isPlasma ? 0x208a10 : 0x901804,
        intensity1: 0.6,
        frame: isPlasma ? FR.GLOW : FR.FLAME,
        rot: rr(0, 6.28),
        rotv: rr(-2, 2),
        drag: 2.5,
        grav: -0.2,
        fadeIn: 0.02,
        fadeOut: 0.5,
      });
    }
    // sparks
    const nSp = isElec ? 40 : 28;
    for (let i = 0; i < nSp; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) + 0.1;
      const sp = rr(6, 22) * Math.sqrt(R / 3);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.035,
        life: rr(0.4, 1.3),
        color: isPlasma ? 0x9aff6a : isElec ? 0xa0d8ff : 0xffc070,
        intensity: 6,
        color1: 0xff4010,
        intensity1: 2,
        frame: FR.STREAK,
        stretch: 0.035,
        grav: 1,
        bounce: true,
        drag: 0.4,
      });
    }
    if (isElec)
      for (let i = 0; i < 6; i++) {
        A.randDir(_d);
        FX.arc(_v.copy(p).addScaledVector(_d, R * rr(0.3, 1)), {
          scale: R * 0.5,
          count: 2,
        });
      }
    // smoke column
    if (!isPlasma && !isElec) {
      // thin, lit wisps trailing off the smoke column (the body of the smoke is the puff cluster)
      for (let i = 0; i < 6; i++) {
        A.randDir(_d);
        _d.y = Math.abs(_d.y) * 0.6 + 0.3;
        const sp = rr(1, 3) * Math.sqrt(R);
        A.psAlpha.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1.5,
          vz: _d.z * sp,
          size: R * 0.5,
          size1: R * rr(1.6, 2.4),
          life: rr(3, 5.5),
          color: 0x5a524a,
          alpha: 0.22,
          frame: FR.SMOKE1 + (i % 3),
          drag: 1.1,
          wind: 0.4,
          grav: -0.03,
          rotv: rr(-0.5, 0.5),
          fadeIn: 0.25,
          fadeOut: 0.4,
        });
      }
    } else {
      for (let i = 0; i < 10; i++) {
        A.randDir(_d);
        const sp = rr(2, 6);
        A.psAdd.spawn({
          pos: p,
          vx: _d.x * sp,
          vy: _d.y * sp + 1,
          vz: _d.z * sp,
          size: 0.15,
          life: rr(0.6, 1.4),
          color: lightCol,
          intensity: 4,
          frame: FR.GLOW,
          drag: 1.5,
          grav: 0.3,
        });
      }
      if (isPlasma) FX.blood(p, new THREE.Vector3(0, 1, 0), 2, "glowing");
    }
    // ground effects
    if (nearGround) {
      shockRing(gp, R * 4, 0.45, isPlasma ? 0x9aff7a : 0xffd8a0, 1.2);
      // dust-ring shockwave: a fast, ground-hugging ring of dust racing out, then a slower, taller skirt
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + rr(-0.12, 0.12),
          sp = rr(9, 15) * Math.sqrt(R / 3);
        A.psAlpha.spawn({
          x: gp.x + Math.cos(a) * R * 0.3,
          y: gp.y + 0.2,
          z: gp.z + Math.sin(a) * R * 0.3,
          vx: Math.cos(a) * sp,
          vy: rr(0.1, 0.6),
          vz: Math.sin(a) * sp,
          size: R * 0.3,
          size1: R * rr(0.9, 1.4),
          life: rr(0.9, 1.6),
          color: 0x9a8e76,
          alpha: 0.34,
          frame: FR.DUST,
          drag: 3.2,
          wind: 0.3,
          rotv: rr(-0.6, 0.6),
          fadeIn: 0.02,
          fadeOut: 0.45,
          lit: 1,
        });
      }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + rr(-0.2, 0.2),
          sp = rr(4, 8) * Math.sqrt(R / 3);
        A.psAlpha.spawn({
          x: gp.x,
          y: gp.y + 0.4,
          z: gp.z,
          vx: Math.cos(a) * sp,
          vy: rr(0.8, 2.2),
          vz: Math.sin(a) * sp,
          size: R * 0.5,
          size1: R * rr(1.6, 2.4),
          life: rr(2.2, 3.6),
          color: 0x7e7462,
          alpha: 0.26,
          frame: FR.DUST,
          drag: 1.6,
          wind: 0.45,
          rotv: rr(-0.5, 0.5),
          fadeIn: 0.06,
          fadeOut: 0.4,
          lit: 1,
        });
      }
      if (!isElec) {
        spawnDebris(gp, Math.round(6 + R * 1.3), 6 + R * 0.9, {
          burn: isPlasma ? 0 : 0.7,
          scale: 0.6,
        });
        for (let i = 0; i < 16; i++) {
          A.randDir(_d);
          _d.y = Math.abs(_d.y) + 0.5;
          const sp = rr(4, 12);
          A.psAlpha.spawn({
            pos: gp,
            vx: _d.x * sp,
            vy: _d.y * sp,
            vz: _d.z * sp,
            size: rr(0.05, 0.14),
            life: rr(1, 2),
            color: 0x4a443c,
            frame: FR.DEBRIS,
            grav: 1,
            bounce: true,
            rotv: rr(-10, 10),
            lit: 1,
          });
        }
      }
      FX.decal(gp, new THREE.Vector3(0, 1, 0), isPlasma ? "plasma" : "scorch", {
        size: R * (isPlasma ? 1.4 : 1.7),
        heat: isPlasma ? 0.6 : 0.35,
      });
    }
    blastShell(p, R * 2.4, 0.26, isPlasma ? 0x9aff7a : 0xfff0d0, 0.8);
    if (isFire)
      for (let i = 0; i < 3; i++) {
        const f = FX.fire(
          new THREE.Vector3(
            gp.x + rr(-R, R) * 0.6,
            gp.y,
            gp.z + rr(-R, R) * 0.6,
          ),
          rr(0.6, 1.1),
        );
        if (f) f.expire(rr(6, 10));
      }
    cameraKick(p, R, 1);
    const d = A.camDist(p);
    if (d < R * 4 && G.atmos.screenFlash)
      G.atmos.screenFlash(
        0.25 * (1 - d / (R * 4)),
        isPlasma ? 0xb0ffa0 : 0xffe0b0,
        0.3,
      );
  }

  // ---- NUKE-CLASS BLAST ---------------------------------------------------------------------
  function explodeNuke(p, R) {
    const S = Math.max(10, R);
    const gy = A.groundAt(p.x, p.z, p.y + 1);
    const g = new THREE.Vector3(p.x, gy, p.z);
    const H = S * 4.2; // final cap height
    // blinding flash
    FX.flash(p, 0xfff0d0, 14, 2.6, { range: S * 30, curve: "hold" });
    if (G.atmos.screenFlash) {
      const d = A.camDist(p);
      G.atmos.screenFlash(clamp(1.1 - d / (S * 40), 0.25, 0.95), 0xfff6e8, 1.4);
    }
    if (A.weather)
      A.weather.flashes.push({ t0: A.animTime, amp: 1.5, decay: 1.4 });
    A.psAdd.spawn({
      pos: p,
      size: S * 9,
      size1: S * 14,
      life: 0.7,
      color: 0xfff0d0,
      intensity: 5,
      frame: FR.GLOW,
      fadeIn: 0.01,
      fadeOut: 0.1,
    });
    A.psAdd.spawn({
      pos: p,
      size: S * 5,
      life: 0.25,
      color: 0xffffff,
      intensity: 8,
      frame: FR.STAR,
      fadeIn: 0.01,
    });
    // the rising fireball that becomes the cap: dense, noise-displaced, billowing
    const capMat = makeCloudMat("fire", 0x7c6c5c);
    const cu = capMat.uniforms;
    cu.uAmp.value = 0.55;
    cu.uFreq.value = 2.3;
    cu.uHotRange.value = S * 1.3;
    cu.uEdge.value = 1;
    cu.uUnder.value = 1.1;
    cu.uRimDark.value = 1;
    const cap = new THREE.Group();
    cap.name = "atmos_nuke_cap";
    const ball = new THREE.Mesh(geoBallXL, capMat);
    cap.add(ball);
    // the rolling toroidal vortex under the cap (own material: lumpier, hotter underside)
    const torMat = makeCloudMat("fire", 0x6e6052);
    const tu = torMat.uniforms;
    tu.uAmp.value = 0.5;
    tu.uFreq.value = 3.1;
    tu.uHotRange.value = S * 0.9;
    tu.uEdge.value = 1;
    tu.uUnder.value = 1.5;
    tu.uRimDark.value = 0.8;
    const torus = new THREE.Mesh(geoTorus, torMat);
    torus.visible = false;
    cap.add(torus);
    cap.position.copy(p);
    cap.renderOrder = 24;
    cap.traverse((o) => {
      o.renderOrder = 24;
      o.frustumCulled = false;
    });
    // stem: thicker column with rising churn
    const stemMat = makeCloudMat("fire", 0x6c6056);
    const su = stemMat.uniforms;
    su.uAmp.value = 0.3;
    su.uFreq.value = 3.6;
    su.uScroll.value.set(0, -1.0, 0);
    su.uHotY.value = gy;
    su.uHotRange.value = S * 1.4;
    su.uEdge.value = 1;
    su.uUnder.value = 0.4;
    su.uRimDark.value = 0.6;
    const stem = new THREE.Mesh(geoStem, stemMat);
    stem.position.copy(g);
    stem.scale.set(0.01, 0.01, 0.01);
    stem.renderOrder = 23;
    // condensation collar (Wilson ring) around the stem
    const skirtMat = makeCloudMat("fire", 0xdcd8cc);
    skirtMat.uniforms.uHeat.value = 0;
    skirtMat.uniforms.uAmp.value = 0.12;
    skirtMat.uniforms.uFreq.value = 4.0;
    skirtMat.uniforms.uEdge.value = 1;
    const skirt = new THREE.Mesh(geoSkirt, skirtMat);
    skirt.visible = false;
    skirt.renderOrder = 22;
    const dur = 26;
    const capState = { y: p.y, s: S, ts: S, h: S };
    let puffT = 0,
      stemPuffT = 0,
      collarT = 0;
    addPiece(stem, dur, (t, dt) => {
      const rise = 1 - Math.pow(1 - Math.min(1, t / 6.5), 2.2);
      const h = S * 0.6 + (H - S * 0.6) * rise;
      const w = S * (0.62 + 0.45 * Math.min(1, t / 3.5));
      stem.scale.set(w, Math.max(0.01, h - S * 0.35), w);
      capState.h = h;
      su.uTime.value += dt;
      su.uHeat.value = clamp(1.1 * Math.exp(-t / 3.0), 0.1, 1);
      su.uAlpha.value =
        t < 0.5 ? t / 0.5 : t > 15 ? Math.max(0, 1 - (t - 15) / 11) : 1;
      // rising puffs hugging the column: breaks up the lathe silhouette, reads as churning volume
      stemPuffT -= dt;
      if (stemPuffT <= 0 && t > 0.6 && t < 16 && A.psAlpha) {
        stemPuffT = 0.07;
        const a = rr(0, 6.28),
          yy = rr(0.05, 0.9) * h,
          rad = w * rr(0.25, 0.45);
        A.psAlpha.spawn({
          x: g.x + Math.cos(a) * rad,
          y: g.y + yy,
          z: g.z + Math.sin(a) * rad,
          vx: Math.cos(a) * 0.6,
          vy: rr(2, 5) * Math.sqrt(S / 10),
          vz: Math.sin(a) * 0.6,
          size: S * rr(0.45, 0.7),
          size1: S * rr(0.9, 1.4),
          life: rr(3.5, 6),
          color: 0x5e554c,
          alpha: 0.42,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.35,
          wind: 0.12,
          rotv: rr(-0.25, 0.25),
          fadeIn: 0.15,
          fadeOut: 0.5,
          lit: 1,
        });
      }
    });
    addPiece(cap, dur, (t, dt) => {
      const rise = 1 - Math.pow(1 - Math.min(1, t / 6.5), 2.2);
      const y = gy + S * 0.6 + (H - S * 0.6) * rise;
      cap.position.set(p.x, y, p.z);
      const grow = 1 - Math.pow(1 - Math.min(1, t / 0.7), 3);
      const s = S * (0.4 + 1.05 * grow) * (1 + 0.1 * t);
      // flattens from a ball into a mushroom cap as the vortex forms
      const flat = t < 1.2 ? 0.9 : Math.max(0.58, 0.9 - (t - 1.2) * 0.2);
      ball.scale.set(s, s * flat, s);
      let ts = s;
      if (t > 0.9) {
        torus.visible = true;
        const k = Math.min(1, (t - 0.9) / 2.5);
        ts = s * (0.6 + 0.62 * k);
        torus.scale.set(ts, ts * 0.85, ts);
        torus.position.y = -s * 0.22;
        tu.uTime.value += dt;
        tu.uScroll.value.set(0, 0.5 + 0.3 * k, 0); // underside rolls upward and outward
        tu.uHeat.value = clamp(1.25 * Math.exp(-(t - 0.9) / 5.5), 0.3, 1.2);
        tu.uHotY.value = y - s * 0.2;
        tu.uAlpha.value =
          t > 14 ? Math.max(0, 1 - (t - 14) / 12) : Math.min(1, (t - 0.9) * 2);
      }
      capState.y = y;
      capState.s = s;
      capState.ts = ts;
      cu.uTime.value += dt;
      cu.uScroll.value.set(0, -0.35 - 0.4 * Math.min(1, t / 3), 0); // rolling churn
      cu.uHeat.value =
        t < 1.0 ? 1.15 : clamp(1.15 * Math.exp(-(t - 1.0) / 4.5), 0.18, 1.15);
      cu.uHotY.value = y - s * 0.7;
      cu.uAlpha.value = t > 14 ? Math.max(0, 1 - (t - 14) / 12) : 1;
      cu.uAmp.value = 0.55 + t * 0.012;
      // volume billboards: lit puffs rolling around the cap's rim + fiery glow under it
      puffT -= dt;
      if (puffT <= 0 && t > 0.8 && t < 17 && A.psAlpha) {
        puffT = 0.045;
        const a = rr(0, 6.28),
          rad = ts * rr(0.8, 1.25),
          yy = y + rr(-0.35, 0.25) * s;
        A.psAlpha.spawn({
          x: p.x + Math.cos(a) * rad,
          y: yy,
          z: p.z + Math.sin(a) * rad,
          vx: Math.cos(a) * rr(0.5, 2),
          vy: rr(0.8, 2.5),
          vz: Math.sin(a) * rr(0.5, 2),
          size: S * rr(0.6, 1.0),
          size1: S * rr(1.4, 2.1),
          life: rr(5, 8),
          color: Math.random() < 0.5 ? 0x6a5e52 : 0x4c443c,
          alpha: 0.4,
          frame: FR.SMOKE1 + ((Math.random() * 3) | 0),
          drag: 0.4,
          wind: 0.18,
          rotv: rr(-0.2, 0.2),
          fadeIn: 0.12,
          fadeOut: 0.55,
          lit: 1,
        });
        if (t < 7 && A.psAdd && Math.random() < 0.6) {
          const a2 = rr(0, 6.28),
            r2 = ts * rr(0.2, 0.9);
          A.psAdd.spawn({
            x: p.x + Math.cos(a2) * r2,
            y: y - s * rr(0.25, 0.5),
            z: p.z + Math.sin(a2) * r2,
            vy: rr(0.5, 2),
            size: S * rr(0.5, 0.9),
            size1: S * rr(0.9, 1.4),
            life: rr(0.8, 1.6),
            color: 0xffa040,
            intensity: 1.6 * (1 - t / 7),
            color1: 0x8a2008,
            intensity1: 0.3,
            frame: FR.FLAME,
            rot: rr(0, 6.28),
            rotv: rr(-0.5, 0.5),
            fadeIn: 0.2,
            fadeOut: 0.6,
          });
        }
      }
    });
    addPiece(skirt, 10, (t, dt) => {
      if (t < 2.2) return;
      skirt.visible = true;
      const u = (t - 2.2) / 7.8;
      const r = S * (1.1 + 2.0 * u);
      const cy = gy + capState.h * 0.5;
      skirt.scale.set(r, r * 0.55, r);
      skirt.position.set(p.x, cy, p.z);
      skirtMat.uniforms.uTime.value += dt;
      skirtMat.uniforms.uAlpha.value = Math.sin(Math.min(1, u) * Math.PI) * 0.6;
      // wispy condensation puffs along the collar
      collarT -= dt;
      if (collarT <= 0 && u < 0.7 && A.psAlpha) {
        collarT = 0.05;
        const a = rr(0, 6.28);
        A.psAlpha.spawn({
          x: p.x + Math.cos(a) * r,
          y: cy + rr(-0.15, 0.15) * S,
          z: p.z + Math.sin(a) * r,
          vx: Math.cos(a) * S * 0.25,
          vy: 0.2,
          vz: Math.sin(a) * S * 0.25,
          size: S * 0.5,
          size1: S * rr(1.0, 1.5),
          life: rr(2.5, 4),
          color: 0xe4e0d6,
          alpha: 0.3,
          frame: FR.SMOKE2,
          drag: 0.8,
          wind: 0.2,
          rotv: rr(-0.2, 0.2),
          fadeIn: 0.2,
          fadeOut: 0.6,
          lit: 1,
        });
      }
    });
    // ground shockwaves & shell
    shockRing(g, S * 14, 1.6, 0xffe0b0, 2);
    shockRing(g, S * 7, 0.8, 0xffffff, 2.5);
    blastShell(p, S * 6, 0.8, 0xfff0d0);
    // base surge: rolling dust
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2 + rr(-0.1, 0.1),
        sp = rr(14, 30) * Math.sqrt(S / 10);
      A.psAlpha.spawn({
        x: g.x + Math.cos(a) * S * 0.5,
        y: g.y + rr(0.5, 2),
        z: g.z + Math.sin(a) * S * 0.5,
        vx: Math.cos(a) * sp,
        vy: rr(0.5, 2.5),
        vz: Math.sin(a) * sp,
        size: S * 0.8,
        size1: S * rr(2.2, 3.5),
        life: rr(4, 7),
        color: 0x8a7e68,
        alpha: 0.5,
        frame: FR.DUST,
        drag: 0.9,
        wind: 0.2,
        rotv: rr(-0.4, 0.4),
        fadeIn: 0.03,
        fadeOut: 0.5,
      });
    }
    // fire storm + sparks + debris
    for (let i = 0; i < 40; i++) {
      A.randDir(_d);
      _d.y = Math.abs(_d.y) + 0.2;
      const sp = rr(15, 45);
      A.psAdd.spawn({
        pos: p,
        vx: _d.x * sp,
        vy: _d.y * sp,
        vz: _d.z * sp,
        size: 0.08,
        life: rr(1, 3),
        color: 0xffd080,
        intensity: 7,
        color1: 0xff3a08,
        intensity1: 2,
        frame: FR.STREAK,
        stretch: 0.04,
        grav: 1,
        bounce: true,
        drag: 0.3,
      });
    }
    spawnDebris(g, 30, 22, { burn: 0.7, scale: 1.4 });
    FX.decal(g, new THREE.Vector3(0, 1, 0), "scorch", {
      size: S * 3.2,
      heat: 0.5,
      life: 900,
    });
    FX.decal(
      new THREE.Vector3(g.x + 0.3, g.y + 0.01, g.z - 0.2),
      new THREE.Vector3(0, 1, 0),
      "rad_puddle",
      { size: S * 1.4, life: 900 },
    );
    for (let i = 0; i < 5; i++) {
      const a = rr(0, 6.28),
        r = rr(0.3, 1.1) * S;
      const f = FX.fire(
        new THREE.Vector3(
          g.x + Math.cos(a) * r,
          A.groundAt(g.x + Math.cos(a) * r, g.z + Math.sin(a) * r, g.y + 2),
          g.z + Math.sin(a) * r,
        ),
        rr(0.8, 1.6),
        { sound: i === 0 },
      );
      if (f) f.expire(rr(18, 26));
    }
    // smoke that keeps feeding the column
    const col = FX.smoke(new THREE.Vector3(g.x, g.y + 1, g.z), S * 0.35, {
      rate: 6,
      rise: 1.6,
    });
    if (col) col.expire(18);
    // radiation zone that decays
    if (G.world && G.world.addRadSource) {
      const src = G.world.addRadSource({
        x: g.x,
        y: g.y + 1,
        z: g.z,
        radius: S * 3.5,
        strength: 30,
        tag: "nuke_rad",
      });
      nukeRads.push({ src, t: 0, dur: 60, s0: 30 });
    }
    // camera: big shake, delayed rumble
    cameraKick(p, S * 3, 1.6);
    const d = A.camDist(p);
    A.after(Math.min(1.5, d / 343), () => {
      if (G.player && G.player.shake && d < 600)
        G.player.shake(clamp(1.2 - d / 500, 0.2, 1.2), 1.4);
    });
  }
  const nukeRads = [];
  function updateNukeRads(dt) {
    for (let i = nukeRads.length - 1; i >= 0; i--) {
      const r = nukeRads[i];
      r.t += dt;
      r.src.strength = r.s0 * Math.max(0, 1 - r.t / r.dur);
      if (r.t >= r.dur) {
        G.world.removeRadSource(r.src);
        nukeRads.splice(i, 1);
      }
    }
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  /**
   * Explosion. kind: 'normal'|'grenade'|'car'|'missile'|'nuke'|'plasma'|'fire'|'electric'|'emp'.
   * radius ≈ damage radius in metres. opts: {noShake, noDecal}
   */
  FX.explosion = function (pos, radius, kind) {
    if (!A.psAdd || !baseMat || !pos) return;
    const p = A.v3(pos);
    const R = Math.max(0.5, radius || 4);
    kind = kind || "normal";
    if (kind === "nuke") return explodeNuke(p, R);
    if (kind === "emp") kind = "electric";
    if (kind === "car") {
      explodeNormal(p, Math.max(R, 5), "normal");
      const f = FX.fire(
        new THREE.Vector3(p.x, A.groundAt(p.x, p.z, p.y + 1) + 0.4, p.z),
        1.4,
        { light: false },
      );
      if (f) f.expire(30);
      const s = FX.smoke(
        new THREE.Vector3(p.x, A.groundAt(p.x, p.z, p.y + 1) + 1.5, p.z),
        1.2,
      );
      if (s) s.expire(40);
      return;
    }
    return explodeNormal(
      p,
      R,
      kind === "plasma" || kind === "electric" || kind === "fire"
        ? kind
        : "normal",
    );
  };
  /** Expose for debug/tests */
  FX.mushroomCloud = (pos, radius) => explodeNuke(A.v3(pos), radius || 12);
  /** Live volumetric explosion puffs (debug / tests). */
  FX.puffCount = () => PF.n;

  function update(dt) {
    const env = A.env;
    shared.uSunDir.value.copy(env.lightDir);
    shared.uSunCol.value
      .copy(env.lightColor)
      .multiplyScalar(env.lightInt * 0.5);
    shared.uAmbient.value.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.7);
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      if (dt > 0) p.t += dt;
      if (p.t >= p.dur) {
        killPiece(p);
        active.splice(i, 1);
        continue;
      }
      if (dt > 0)
        try {
          p.fn(p.t, dt);
        } catch (e) {
          killPiece(p);
          active.splice(i, 1);
          G.reportError("update:atmosphere/explosion", e);
        }
    }
    updateDebris(dt);
    try {
      updatePuffs(dt);
    } catch (e) {
      PF.n = 0;
      G.reportError("update:atmosphere/puffs", e);
    }
    updateNukeRads(dt);
  }
  function reset() {
    for (const p of active) killPiece(p);
    active.length = 0;
    debris.length = 0;
    if (debMesh) debMesh.count = 0;
    PF.n = 0;
    if (PF.mesh) {
      PF.mesh.geometry.instanceCount = 0;
      PF.mesh.visible = false;
    }
    for (const r of nukeRads) G.world.removeRadSource(r.src);
    nukeRads.length = 0;
  }

  A.addSystem({ name: "explosions", order: 63, init, update, reset });
})();
