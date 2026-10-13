// play-inline-60 02 — math
// Lines 13-299 of readable/play-inline-60.pretty.js (statement-aligned).
  const A = G.atmos._;

  const VERT = `
    attribute vec4 iA;    // start xyz, half-width
    attribute vec4 iB;    // end xyz, kind
    attribute vec4 iCol;  // rgb (HDR), alpha
    attribute vec4 iStyle; // taper start, taper end, seed, time
    varying vec2 vUv; varying vec4 vCol; varying vec4 vStyle; varying float vKind;
    #include <fog_pars_vertex>
    void main(){
      vec3 a = (modelViewMatrix * vec4(iA.xyz, 1.0)).xyz;
      vec3 b = (modelViewMatrix * vec4(iB.xyz, 1.0)).xyz;
      float t = position.x, s = position.y;
      vec3 p = mix(a, b, t);
      vec3 axis = b - a;
      vec3 side = cross(axis, p);
      float sl = length(side);
      side = sl > 1e-6 ? side / sl : vec3(1.0, 0.0, 0.0);
      float w = iA.w * mix(iStyle.x, iStyle.y, t);
      // keep very distant beams at least ~1px wide
      w = max(w, -p.z * 0.0009);
      p += side * s * w;
      gl_Position = projectionMatrix * vec4(p, 1.0);
      vUv = vec2(t, s); vCol = iCol; vStyle = iStyle; vKind = iB.w;
      vec4 mvPosition = vec4(p, 1.0);
      #include <fog_vertex>
    }
  `;
  const FRAG = `
    varying vec2 vUv; varying vec4 vCol; varying vec4 vStyle; varying float vKind;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    float hsh(float x){ return fract(sin(x * 127.1) * 43758.5453); }
    void main(){
      float y = abs(vUv.y);
      float core = exp(-y * y * 22.0);
      float glow = exp(-y * y * 3.5);
      float a = vCol.a;
      vec3 col = vCol.rgb * (glow * 0.55 + core * 1.1) + vec3(1.0) * core * core * 0.9;
      if (vKind > 0.5 && vKind < 1.5) {          // tracer: fade toward the tail
        a *= smoothstep(0.0, 1.0, vUv.x);
      } else if (vKind > 1.5 && vKind < 2.5) {   // lightning: flicker along its length
        a *= 0.7 + 0.3 * hsh(floor(vUv.x * 9.0) + floor(vStyle.w * 30.0) + vStyle.z);
      } else if (vKind > 2.5) {                  // plasma trail: soft fade both ends
        a *= smoothstep(0.0, 0.5, vUv.x);
      } else {                                   // laser: pulse travelling along the beam
        a *= 0.85 + 0.15 * sin(vUv.x * 40.0 - vStyle.w * 60.0);
        a *= smoothstep(0.0, 0.02, vUv.x) * (1.0 - smoothstep(0.985, 1.0, vUv.x) * 0.5);
      }
      float ff = atmosFogFactor();
      gl_FragColor = vec4(col * a * (1.0 - ff), 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  const KIND = { laser: 0, tracer: 1, lightning: 2, plasma: 3 };
  const CAP = 320;
  const beams = [];
  let mesh = null,
    aA,
    aB,
    aCol,
    aStyle;

  function init() {
    const geo = new THREE.InstancedBufferGeometry();
    // strip: x = t along [0,1], y = side [-1,1]; 8 segments along for taper/perspective
    const SEG = 8,
      pos = [],
      idx = [];
    for (let i = 0; i <= SEG; i++) {
      pos.push(i / SEG, -1, 0, i / SEG, 1, 0);
    }
    for (let i = 0; i < SEG; i++) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(pos), 3),
    );
    geo.setIndex(idx);
    const mk = (n) => {
      const at = new THREE.InstancedBufferAttribute(
        new Float32Array(CAP * n),
        n,
      );
      at.setUsage(THREE.DynamicDrawUsage);
      return at;
    };
    aA = mk(4);
    aB = mk(4);
    aCol = mk(4);
    aStyle = mk(4);
    geo.setAttribute("iA", aA);
    geo.setAttribute("iB", aB);
    geo.setAttribute("iCol", aCol);
    geo.setAttribute("iStyle", aStyle);
    geo.instanceCount = 0;
    const mat = new THREE.ShaderMaterial({
      uniforms: A.fogUniforms({}),
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
    mat.name = "atmos_beams";
    mesh = new THREE.Mesh(geo, mat);
    mesh.name = "atmos_beams";
    mesh.frustumCulled = false;
    mesh.renderOrder = 35;
    G.scene.add(mesh);
  }

  /**
   * Add a beam. o: {a:Vector3, b:Vector3, width (half-width m), color, intensity, alpha, life, kind:'laser'|'tracer'|'lightning'|'plasma',
   *   taper:[t0,t1], update(beam, dt)?}
   */
  A.addBeam = function (o) {
    if (beams.length >= CAP) beams.shift();
    const c = A.color(o.color || 0xffffff);
    const k = o.intensity || 1;
    const bm = {
      a: A.v3(o.a),
      b: A.v3(o.b),
      width: o.width || 0.05,
      r: c.r * k,
      g: c.g * k,
      bl: c.b * k,
      alpha: o.alpha !== undefined ? o.alpha : 1,
      a0: o.alpha !== undefined ? o.alpha : 1,
      life: o.life || 0.2,
      age: 0,
      kind: KIND[o.kind] !== undefined ? KIND[o.kind] : 0,
      t0: o.taper ? o.taper[0] : 1,
      t1: o.taper ? o.taper[1] : 1,
      seed: Math.random() * 100,
      update: o.update || null,
      fade: o.fade !== undefined ? o.fade : 0.4,
      data: o.data || null,
    };
    beams.push(bm);
    return bm;
  };

  function update(dt) {
    if (dt <= 0) return;
    for (let i = beams.length - 1; i >= 0; i--) {
      const bm = beams[i];
      bm.age += dt;
      if (bm.update) {
        try {
          if (bm.update(bm, dt) === false) bm.age = bm.life;
        } catch (e) {
          bm.age = bm.life;
        }
      }
      if (bm.age >= bm.life) {
        beams.splice(i, 1);
        continue;
      }
      const t = bm.age / bm.life;
      bm.alpha =
        bm.a0 * (t < 1 - bm.fade ? 1 : 1 - (t - (1 - bm.fade)) / bm.fade);
    }
  }
  function late() {
    if (!mesh) return;
    const n = Math.min(beams.length, CAP);
    const PA = aA.array,
      PB = aB.array,
      PC = aCol.array,
      PS = aStyle.array;
    for (let i = 0; i < n; i++) {
      const bm = beams[i],
        o = i * 4;
      PA[o] = bm.a.x;
      PA[o + 1] = bm.a.y;
      PA[o + 2] = bm.a.z;
      PA[o + 3] = bm.width;
      PB[o] = bm.b.x;
      PB[o + 1] = bm.b.y;
      PB[o + 2] = bm.b.z;
      PB[o + 3] = bm.kind;
      PC[o] = bm.r;
      PC[o + 1] = bm.g;
      PC[o + 2] = bm.bl;
      PC[o + 3] = bm.alpha;
      PS[o] = bm.t0;
      PS[o + 1] = bm.t1;
      PS[o + 2] = bm.seed;
      PS[o + 3] = bm.age;
    }
    mesh.geometry.instanceCount = n;
    mesh.visible = n > 0;
    if (n)
      for (const at of [aA, aB, aCol, aStyle]) {
        at.updateRange.offset = 0;
        at.updateRange.count = n * 4;
        at.needsUpdate = true;
      }
  }
  function reset() {
    beams.length = 0;
  }

  // ------------------------------------------------------------------
  // Lightning bolt geometry (midpoint displacement + branches)
  // ------------------------------------------------------------------
  function boltPath(a, b, rough, depth) {
    let pts = [a.clone(), b.clone()];
    let disp = a.distanceTo(b) * rough;
    for (let d = 0; d < depth; d++) {
      const np = [pts[0]];
      for (let i = 0; i < pts.length - 1; i++) {
        const p = pts[i],
          q = pts[i + 1];
        const m = p.clone().add(q).multiplyScalar(0.5);
        m.x += (Math.random() - 0.5) * disp;
        m.z += (Math.random() - 0.5) * disp;
        m.y += (Math.random() - 0.5) * disp * 0.3;
        np.push(m, q);
      }
      pts = np;
      disp *= 0.55;
    }
    return pts;
  }
  A.lightningBolt = function (top, ground, color, dist) {
    const w = Math.max(0.35, Math.min(2.2, (dist || 300) / 300));
    const life = 0.42;
    const main = boltPath(top, ground, 0.35, 6);
    const col = A.color(color || 0xc8ffc0);
    const add = (pts, width, inten) => {
      for (let i = 0; i < pts.length - 1; i++) {
        A.addBeam({
          a: pts[i],
          b: pts[i + 1],
          width,
          color: col,
          intensity: inten,
          life,
          kind: "lightning",
          fade: 0.7,
        });
      }
    };
    add(main, w, 6);
    // branches
    const nb = 2 + ((Math.random() * 3) | 0);
    for (let k = 0; k < nb; k++) {
      const i0 = 3 + ((Math.random() * (main.length * 0.6)) | 0);
      const s = main[Math.min(i0, main.length - 2)];
      const e = s
        .clone()
        .add(
          new THREE.Vector3(
            (Math.random() - 0.5) * 120,
            -A.rr(40, 140),
            (Math.random() - 0.5) * 120,
          ),
        );
      add(boltPath(s, e, 0.3, 4), w * 0.5, 3.5);
    }
    // ground glow
    if (A.psAdd)
      A.psAdd.spawn({
        pos: ground,
        size: 30 * w,
        size1: 50 * w,
        life: 0.4,
        color: col,
        intensity: 3,
        frame: A.FR.GLOW,
        fadeIn: 0.01,
        fadeOut: 0.1,
      });
  };

  A.addSystem({ name: "beams", order: 62, init, update, late, reset });
