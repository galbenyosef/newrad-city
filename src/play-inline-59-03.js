// play-inline-59 03 — three
// Lines 368-700 of readable/play-inline-59.pretty.js (statement-aligned).
  const FRAG = `
    uniform sampler2D uMap;
    uniform vec3 uLight;
    varying vec2 vUv; varying vec4 vCol; varying float vLit; varying float vSoftR;
    #include <fog_pars_fragment>
    ${A.glsl.fogFactor}
    ${A.glsl.softPars}
    void main(){
      vec4 t = texture2D(uMap, vUv);
      float a = vCol.a * t.a;
      if (a < 0.003) discard;
      if (vSoftR > 0.02) { a *= softK(vSoftZ, vSoftR); if (a < 0.003) discard; }
      vec3 c = vCol.rgb * t.rgb;
      float ff = atmosFogFactor();
      #ifdef ADDITIVE
        // per-sprite HDR cap (and NaN guard): stacked additive sprites must not reach the absurd values that
        // the tone map / bloom turn into off-colour discs and fireflies
        gl_FragColor = vec4(clamp(c * a, vec3(0.0), vec3(9.0)) * (1.0 - ff), 1.0);
      #else
        c = mix(c, c * uLight, vLit);
        c = mix(c, atmosFogC, ff);
        gl_FragColor = vec4(c, a);
      #endif
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  // ------------------------------------------------------------------
  // Particle system class
  // ------------------------------------------------------------------
  const F_BOUNCE = 1,
    F_FLICKER = 2,
    F_STICK = 4;
  A.PF = { BOUNCE: F_BOUNCE, FLICKER: F_FLICKER, STICK: F_STICK };

  function PSystem(name, cap, additive) {
    this.name = name;
    this.cap = cap;
    this.additive = additive;
    this.n = 0;
    const f = (k) => new Float32Array(cap * k);
    // state
    this.px = f(1);
    this.py = f(1);
    this.pz = f(1);
    this.vx = f(1);
    this.vy = f(1);
    this.vz = f(1);
    this.age = f(1);
    this.life = f(1);
    this.s0 = f(1);
    this.s1 = f(1);
    this.c0 = f(3);
    this.c1 = f(3);
    this.a0 = f(1);
    this.rot = f(1);
    this.rotv = f(1);
    this.frame = f(1);
    this.drag = f(1);
    this.grav = f(1);
    this.stretch = f(1);
    this.lit = f(1);
    this.fin = f(1);
    this.fout = f(1);
    this.windK = f(1);
    this.gy = f(1);
    this.flags = new Uint8Array(cap);
    this.seed = f(1);
    // GPU
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
    this.aPos = new THREE.InstancedBufferAttribute(
      new Float32Array(cap * 4),
      4,
    );
    this.aPos.setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.InstancedBufferAttribute(
      new Float32Array(cap * 4),
      4,
    );
    this.aCol.setUsage(THREE.DynamicDrawUsage);
    this.aMisc = new THREE.InstancedBufferAttribute(
      new Float32Array(cap * 4),
      4,
    );
    this.aMisc.setUsage(THREE.DynamicDrawUsage);
    this.aVel = new THREE.InstancedBufferAttribute(
      new Float32Array(cap * 3),
      3,
    );
    this.aVel.setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute("iPos", this.aPos);
    geo.setAttribute("iCol", this.aCol);
    geo.setAttribute("iMisc", this.aMisc);
    geo.setAttribute("iVel", this.aVel);
    geo.instanceCount = 0;
    const uniforms = A.softUniforms(
      A.fogUniforms({
        uMap: { value: A.atlasTex },
        uLight: { value: new THREE.Color(1, 1, 1) },
      }),
    );
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      defines: additive ? { ADDITIVE: 1 } : {},
    });
    if (additive) {
      mat.blending = THREE.CustomBlending;
      mat.blendSrc = THREE.OneFactor;
      mat.blendDst = THREE.OneFactor;
      mat.blendEquation = THREE.AddEquation;
    }
    mat.name = "atmos_particles_" + name;
    this.mat = mat;
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.name = "atmos_ps_" + name;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = additive ? 30 : 20;
    this.order = null;
    this.depth = null;
  }

  /**
   * Spawn a particle. o: {x,y,z | pos, vx,vy,vz | vel, life, size, size1, color(hex|Color|[r,g,b]), color1, alpha,
   *   frame, rot, rotv, drag, grav, stretch, lit, fadeIn, fadeOut, wind, bounce, flicker, gy}
   * Colours for the additive system may exceed 1 (HDR → bloom).
   */
  PSystem.prototype.spawn = function (o) {
    let i = this.n;
    if (i >= this.cap) {
      // full: recycle the oldest-in-life particle (cheap scan of a few candidates)
      let best = 0,
        bt = -1;
      for (let k = 0; k < 16; k++) {
        const j = (Math.random() * this.cap) | 0;
        const t = this.age[j] / this.life[j];
        if (t > bt) {
          bt = t;
          best = j;
        }
      }
      i = best;
    } else this.n++;
    const p = o.pos;
    this.px[i] = p ? p.x : o.x || 0;
    this.py[i] = p ? p.y : o.y || 0;
    this.pz[i] = p ? p.z : o.z || 0;
    const v = o.vel;
    this.vx[i] = v ? v.x : o.vx || 0;
    this.vy[i] = v ? v.y : o.vy || 0;
    this.vz[i] = v ? v.z : o.vz || 0;
    this.age[i] = 0;
    this.life[i] = Math.max(0.01, o.life || 1);
    this.s0[i] = o.size !== undefined ? o.size : 1;
    this.s1[i] = o.size1 !== undefined ? o.size1 : this.s0[i];
    setCol(
      this.c0,
      i,
      o.color !== undefined ? o.color : 0xffffff,
      o.intensity || 1,
    );
    if (o.color1 !== undefined)
      setCol(
        this.c1,
        i,
        o.color1,
        o.intensity1 !== undefined ? o.intensity1 : o.intensity || 1,
      );
    else {
      this.c1[i * 3] = this.c0[i * 3];
      this.c1[i * 3 + 1] = this.c0[i * 3 + 1];
      this.c1[i * 3 + 2] = this.c0[i * 3 + 2];
    }
    this.a0[i] = o.alpha !== undefined ? o.alpha : 1;
    this.rot[i] = o.rot !== undefined ? o.rot : Math.random() * 6.283;
    this.rotv[i] = o.rotv || 0;
    this.frame[i] = o.frame || 0;
    this.drag[i] = o.drag || 0;
    this.grav[i] = o.grav || 0;
    this.stretch[i] = o.stretch || 0;
    this.lit[i] = o.lit !== undefined ? o.lit : this.additive ? 0 : 1;
    this.fin[i] = o.fadeIn !== undefined ? o.fadeIn : 0.08;
    this.fout[i] = o.fadeOut !== undefined ? o.fadeOut : 0.55;
    this.windK[i] = o.wind || 0;
    this.flags[i] =
      (o.bounce ? F_BOUNCE : 0) |
      (o.flicker ? F_FLICKER : 0) |
      (o.stick ? F_STICK : 0);
    this.gy[i] =
      o.gy !== undefined
        ? o.gy
        : o.bounce || o.stick
          ? A.groundAt(this.px[i], this.pz[i], this.py[i] + 0.3)
          : -1e9;
    this.seed[i] = Math.random() * 100;
    return i;
  };
  const _col = new THREE.Color();
  function setCol(arr, i, c, k) {
    if (Array.isArray(c)) {
      arr[i * 3] = c[0] * k;
      arr[i * 3 + 1] = c[1] * k;
      arr[i * 3 + 2] = c[2] * k;
      return;
    }
    A.color(c, _col);
    arr[i * 3] = _col.r * k;
    arr[i * 3 + 1] = _col.g * k;
    arr[i * 3 + 2] = _col.b * k;
  }
  PSystem.prototype.kill = function (i) {
    const j = --this.n;
    if (i === j) return;
    const F1 = [
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
      "a0",
      "rot",
      "rotv",
      "frame",
      "drag",
      "grav",
      "stretch",
      "lit",
      "fin",
      "fout",
      "windK",
      "gy",
      "seed",
    ];
    for (let k = 0; k < F1.length; k++) {
      const a = this[F1[k]];
      a[i] = a[j];
    }
    this.flags[i] = this.flags[j];
    const c0 = this.c0,
      c1 = this.c1;
    c0[i * 3] = c0[j * 3];
    c0[i * 3 + 1] = c0[j * 3 + 1];
    c0[i * 3 + 2] = c0[j * 3 + 2];
    c1[i * 3] = c1[j * 3];
    c1[i * 3 + 1] = c1[j * 3 + 1];
    c1[i * 3 + 2] = c1[j * 3 + 2];
  };
  PSystem.prototype.clear = function () {
    this.n = 0;
    this.mesh.geometry.instanceCount = 0;
  };
  PSystem.prototype.simulate = function (dt) {
    if (dt <= 0) return;
    const wx = G.atmos.wind.x,
      wz = G.atmos.wind.z;
    for (let i = 0; i < this.n; i++) {
      const age = (this.age[i] += dt);
      if (age >= this.life[i]) {
        this.kill(i);
        i--;
        continue;
      }
      let vx = this.vx[i],
        vy = this.vy[i],
        vz = this.vz[i];
      vy -= this.grav[i] * 9.8 * dt;
      const dr = this.drag[i];
      if (dr > 0) {
        const k = Math.exp(-dr * dt);
        vx *= k;
        vy *= k;
        vz *= k;
      }
      const wk = this.windK[i];
      if (wk > 0) {
        const k = Math.min(1, wk * dt);
        vx += (wx - vx) * k;
        vz += (wz - vz) * k;
      }
      let x = this.px[i] + vx * dt,
        y = this.py[i] + vy * dt,
        z = this.pz[i] + vz * dt;
      const fl = this.flags[i];
      if (fl & (F_BOUNCE | F_STICK)) {
        const gy = this.gy[i];
        if (y < gy) {
          y = gy;
          if (fl & F_STICK) {
            vx = vy = vz = 0;
            this.rotv[i] = 0;
          } else {
            vy = -vy * 0.32;
            vx *= 0.55;
            vz *= 0.55;
            this.rotv[i] *= 0.5;
            if (Math.abs(vy) < 0.6) {
              vy = 0;
              vx *= 0.8;
              vz *= 0.8;
            }
          }
        }
      }
      this.px[i] = x;
      this.py[i] = y;
      this.pz[i] = z;
      this.vx[i] = vx;
      this.vy[i] = vy;
      this.vz[i] = vz;
      this.rot[i] += this.rotv[i] * dt;
    }
  };
  const _fwd = new THREE.Vector3();
