// play-inline-65 02 — three
// Lines 18-350 of readable/play-inline-65.pretty.js (statement-aligned).
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
