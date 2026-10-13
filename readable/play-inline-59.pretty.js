/* src/atmosphere/50_fx_particles.js */
/* =====================================================================
 * ATMOSPHERE / FX — GPU-instanced particle systems
 * Two pooled systems, one draw call each:
 *   A.psAdd   — additive, unlit (flashes, fire, sparks, tracers, glows)
 *   A.psAlpha — alpha-blended, lit by the environment, depth-sorted
 *               (smoke, dust, debris chips, blood droplets, ash)
 * Each particle is a camera-facing quad (rotating) or a velocity-stretched
 * streak, textured from a procedural 4×4 atlas (A.FR frame ids).
 * CPU simulates (gravity, drag, wind, ground bounce, size/colour/alpha
 * curves) and writes compact instance buffers each frame.
 * Emitters (continuous sources: fire, smoke, steam) live here too.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._;

  // ------------------------------------------------------------------
  // Atlas frames
  // ------------------------------------------------------------------
  const FR = (A.FR = {
    GLOW: 0,
    SMOKE1: 1,
    SMOKE2: 2,
    SMOKE3: 3,
    STREAK: 4,
    STAR: 5,
    FLAME_SIDE: 6,
    FLAME: 7,
    DEBRIS: 8,
    DROP: 9,
    DUST: 10,
    RING: 11,
    FLAKE: 12,
    RAIN: 13,
    ARC: 14,
    SPLASH: 15,
  });

  function makeAtlas() {
    const S = 128,
      N = 4;
    const cv = document.createElement("canvas");
    cv.width = cv.height = S * N;
    const g = cv.getContext("2d");
    const rng = G.util.rng(4242);
    const cell = (f) => [(f % N) * S, Math.floor(f / N) * S];
    function radial(cx, cy, r, stops) {
      const gr = g.createRadialGradient(cx, cy, 0, cx, cy, r);
      for (const s of stops) gr.addColorStop(s[0], s[1]);
      g.fillStyle = gr;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
    }
    function withCell(f, fn) {
      const [x, y] = cell(f);
      g.save();
      g.beginPath();
      g.rect(x, y, S, S);
      g.clip();
      g.translate(x, y);
      fn();
      g.restore();
    }
    // soft round mask: blobs that spill over the 128 px cell would otherwise be cut by the cell
    // border → smoke/dust/flame billboards showed hard straight (vertical) edges on screen
    function softMask(f, r0, r1, cy) {
      const [x, y] = cell(f);
      g.save();
      g.beginPath();
      g.rect(x, y, S, S);
      g.clip();
      g.globalCompositeOperation = "destination-in";
      const gr = g.createRadialGradient(
        x + 64,
        y + (cy || 64),
        0,
        x + 64,
        y + (cy || 64),
        64,
      );
      gr.addColorStop(0, "rgba(0,0,0,1)");
      gr.addColorStop(r0, "rgba(0,0,0,1)");
      gr.addColorStop(r1, "rgba(0,0,0,0)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.fillRect(x, y, S, S);
      g.restore();
    }
    // GLOW
    withCell(FR.GLOW, () =>
      radial(64, 64, 64, [
        [0, "rgba(255,255,255,1)"],
        [0.18, "rgba(255,255,255,0.75)"],
        [0.45, "rgba(255,255,255,0.22)"],
        [1, "rgba(255,255,255,0)"],
      ]),
    );
    // SMOKE puffs: many soft blobs with a lit top-left
    function smoke(f, blobs, spread, rad, seedShift) {
      withCell(f, () => {
        for (let i = 0; i < blobs; i++) {
          const a = rng() * Math.PI * 2,
            d = Math.pow(rng(), 0.7) * spread;
          const x = 64 + Math.cos(a) * d,
            y = 64 + Math.sin(a) * d;
          const r = rad * (0.45 + rng() * 0.7);
          const shade = Math.round(
            175 +
              80 *
                Math.max(
                  0,
                  Math.min(
                    1,
                    0.6 - (x - 64 + y - 64) / 110 + (rng() - 0.5) * 0.3,
                  ),
                ),
          );
          radial(x, y, r, [
            [0, `rgba(${shade},${shade},${shade},${0.22 + rng() * 0.18})`],
            [0.6, `rgba(${shade},${shade},${shade},${0.08 + seedShift})`],
            [1, `rgba(${shade},${shade},${shade},0)`],
          ]);
        }
      });
    }
    smoke(FR.SMOKE1, 34, 30, 26, 0.02);
    smoke(FR.SMOKE2, 46, 32, 22, 0.03);
    smoke(FR.SMOKE3, 26, 36, 19, 0.01);
    for (const f of [FR.SMOKE1, FR.SMOKE2, FR.SMOKE3]) softMask(f, 0.45, 0.97);
    // STREAK (vertical soft line, fades at both ends; head = top)
    withCell(FR.STREAK, () => {
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.15, "rgba(255,255,255,1)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      for (let w = 18; w >= 2; w -= 4) {
        g.globalAlpha = 0.25 + (18 - w) / 24;
        g.fillStyle = gr;
        g.fillRect(64 - w / 2, 0, w, 128);
      }
      g.globalAlpha = 1;
    });
    // STAR (muzzle flash front)
    withCell(FR.STAR, () => {
      radial(64, 64, 40, [
        [0, "rgba(255,255,255,1)"],
        [0.3, "rgba(255,255,255,0.7)"],
        [1, "rgba(255,255,255,0)"],
      ]);
      const spikes = 7;
      for (let i = 0; i < spikes; i++) {
        const a = (i / spikes) * Math.PI * 2 + rng() * 0.4,
          len = 40 + rng() * 22,
          w = 5 + rng() * 5;
        g.save();
        g.translate(64, 64);
        g.rotate(a);
        const gr = g.createLinearGradient(0, 0, len, 0);
        gr.addColorStop(0, "rgba(255,255,255,0.95)");
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.fillStyle = gr;
        g.beginPath();
        g.moveTo(0, -w);
        g.lineTo(len, 0);
        g.lineTo(0, w);
        g.closePath();
        g.fill();
        g.restore();
      }
    });
    // FLAME_SIDE (muzzle side cone, pointing up = +v)
    withCell(FR.FLAME_SIDE, () => {
      for (let i = 0; i < 16; i++) {
        const y = 110 - i * 6.5,
          r = 22 - i * 1.1 + rng() * 5;
        radial(64 + (rng() - 0.5) * 8, y, Math.max(4, r), [
          [0, "rgba(255,255,255,0.55)"],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    // FLAME (fire tongue)
    withCell(FR.FLAME, () => {
      for (let i = 0; i < 26; i++) {
        const t = i / 26,
          y = 108 - t * 92,
          r = (1 - t) * 30 + 5 + rng() * 6;
        radial(64 + Math.sin(t * 7 + rng()) * 8 * t, y, r, [
          [0, `rgba(255,255,255,${0.45 - t * 0.2})`],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    // DEBRIS chunk
    withCell(FR.DEBRIS, () => {
      g.translate(64, 64);
      const n = 7;
      g.beginPath();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2,
          r = 28 + rng() * 26;
        if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        else g.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      g.closePath();
      const gr = g.createLinearGradient(-40, -40, 40, 40);
      gr.addColorStop(0, "#fff");
      gr.addColorStop(1, "#777");
      g.fillStyle = gr;
      g.fill();
      g.strokeStyle = "rgba(40,40,40,0.8)";
      g.lineWidth = 3;
      g.stroke();
    });
    // DROP (liquid droplet)
    withCell(FR.DROP, () => {
      radial(64, 64, 44, [
        [0, "rgba(255,255,255,1)"],
        [0.7, "rgba(235,235,235,0.95)"],
        [1, "rgba(200,200,200,0)"],
      ]);
      radial(52, 50, 12, [
        [0, "rgba(255,255,255,0.9)"],
        [1, "rgba(255,255,255,0)"],
      ]);
    });
    // DUST (soft low-contrast)
    withCell(FR.DUST, () => {
      for (let i = 0; i < 30; i++) {
        const a = rng() * 6.28,
          d = rng() * 36;
        radial(64 + Math.cos(a) * d, 64 + Math.sin(a) * d, 22 + rng() * 18, [
          [0, "rgba(255,255,255,0.14)"],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    softMask(FR.DUST, 0.4, 0.97);
    softMask(FR.FLAME, 0.5, 0.98, 70);
    softMask(FR.FLAME_SIDE, 0.55, 0.98);
    // RING
    withCell(FR.RING, () => {
      const gr = g.createRadialGradient(64, 64, 30, 64, 64, 62);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.6, "rgba(255,255,255,0.9)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    });
    // FLAKE (ash / ember)
    withCell(FR.FLAKE, () => {
      g.translate(64, 64);
      g.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2,
          r = 22 + rng() * 26;
        if (i) g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.6);
        else g.moveTo(Math.cos(a) * r, Math.sin(a) * r * 0.6);
      }
      g.closePath();
      g.fillStyle = "rgba(255,255,255,0.95)";
      g.fill();
    });
    // RAIN streak (thin)
    withCell(FR.RAIN, () => {
      // full cell width (the quad's width IS the drop width; an 8 px line made rain sub-pixel and invisible)
      const gr = g.createLinearGradient(0, 0, 0, 128);
      gr.addColorStop(0, "rgba(255,255,255,0)");
      gr.addColorStop(0.35, "rgba(255,255,255,0.9)");
      gr.addColorStop(0.75, "rgba(255,255,255,0.7)");
      gr.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
      g.globalCompositeOperation = "destination-in";
      const gx = g.createLinearGradient(0, 0, 128, 0);
      gx.addColorStop(0, "rgba(0,0,0,0)");
      gx.addColorStop(0.5, "rgba(0,0,0,1)");
      gx.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gx;
      g.fillRect(0, 0, 128, 128);
      g.globalCompositeOperation = "source-over";
    });
    // ARC (electric zigzag)
    withCell(FR.ARC, () => {
      g.strokeStyle = "rgba(255,255,255,1)";
      g.shadowColor = "white";
      g.shadowBlur = 8;
      g.lineWidth = 3;
      for (let k = 0; k < 2; k++) {
        g.beginPath();
        let x = 64,
          y = 2;
        g.moveTo(x, y);
        while (y < 126) {
          y += 8 + rng() * 10;
          x = 64 + (rng() - 0.5) * 44;
          g.lineTo(x, y);
        }
        g.stroke();
        g.lineWidth = 1.5;
      }
    });
    // SPLASH (crown ring)
    withCell(FR.SPLASH, () => {
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineWidth = 6;
      g.beginPath();
      g.ellipse(64, 80, 44, 16, 0, 0, Math.PI * 2);
      g.stroke();
      for (let i = 0; i < 9; i++) {
        const a = rng() * Math.PI * 2;
        radial(64 + Math.cos(a) * 42, 76 + Math.sin(a) * 14 - rng() * 30, 5, [
          [0, "rgba(255,255,255,1)"],
          [1, "rgba(255,255,255,0)"],
        ]);
      }
    });
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.NoColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }

  // ------------------------------------------------------------------
  // Shaders
  // ------------------------------------------------------------------
  const VERT = `
    attribute vec4 iPos;    // xyz, size
    attribute vec4 iCol;    // rgb, alpha
    attribute vec4 iMisc;   // rot, frame, stretch (s), lit
    attribute vec3 iVel;
    varying vec2 vUv; varying vec4 vCol; varying float vLit; varying float vSoftR;
    varying float vSoftZ;
    #include <fog_pars_vertex>
    void main(){
      vec4 mv = modelViewMatrix * vec4(iPos.xyz, 1.0);
      float size = iPos.w;
      vec2 q = position.xy;
      if (iMisc.z > 0.0) {
        vec3 vv = (modelViewMatrix * vec4(iVel, 0.0)).xyz;
        vec2 d = vv.xy; float L = length(d);
        vec2 dir = L > 1e-5 ? d / L : vec2(0.0, 1.0);
        vec2 perp = vec2(dir.y, -dir.x);   // (perp, dir) must be a proper rotation: the mirrored basis flipped the winding and FrontSide culled every streak
        float len = size + L * iMisc.z;
        mv.xy += dir * (q.y - 0.5) * len + perp * q.x * size;
      } else {
        float c = cos(iMisc.x), s = sin(iMisc.x);
        mv.xy += vec2(c * q.x - s * q.y, s * q.x + c * q.y) * size;
      }
      gl_Position = projectionMatrix * mv;
      float f = iMisc.y;
      vec2 cell = vec2(mod(f, 4.0), 3.0 - floor(f / 4.0));
      vUv = (cell + (q + 0.5)) / 4.0;
      vCol = iCol; vLit = iMisc.w;
      vSoftZ = -mv.z; vSoftR = iMisc.z > 0.0 ? 0.0 : size * 0.3;   // soft-particle fade range (streaks stay crisp)
      vec4 mvPosition = mv;
      #include <fog_vertex>
    }
  `;
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
  PSystem.prototype.upload = function () {
    const n = this.n;
    const P = this.aPos.array,
      C = this.aCol.array,
      M = this.aMisc.array,
      V = this.aVel.array;
    // depth sort (alpha system only): far → near
    let order = null;
    if (!this.additive && n > 1) {
      if (!this.order || this.order.length < this.cap) {
        this.order = new Uint32Array(this.cap);
        this.depth = new Float32Array(this.cap);
      }
      G.camera.getWorldDirection(_fwd);
      const cx = A.camPos.x,
        cy = A.camPos.y,
        cz = A.camPos.z,
        D = this.depth;
      for (let i = 0; i < n; i++) {
        D[i] =
          (this.px[i] - cx) * _fwd.x +
          (this.py[i] - cy) * _fwd.y +
          (this.pz[i] - cz) * _fwd.z;
      }
      const ord = Array.from({ length: n }, (_, i) => i);
      ord.sort((a, b) => D[b] - D[a]);
      order = ord;
    }
    for (let k = 0; k < n; k++) {
      const i = order ? order[k] : k;
      const t = this.age[i] / this.life[i];
      const e = 1 - (1 - t) * (1 - t);
      const size = this.s0[i] + (this.s1[i] - this.s0[i]) * e;
      let a = this.a0[i] * Math.min(1, t / Math.max(1e-4, this.fin[i]));
      const fo = this.fout[i];
      if (t > fo) {
        const u = (t - fo) / (1 - fo);
        a *= 1 - u * u * (3 - 2 * u);
      }
      if (this.flags[i] & F_FLICKER)
        a *=
          0.65 +
          0.35 *
            Math.sin(this.age[i] * 31 + this.seed[i]) *
            Math.sin(this.age[i] * 13.7 + this.seed[i] * 2);
      const o4 = k * 4,
        o3 = k * 3,
        i3 = i * 3;
      P[o4] = this.px[i];
      P[o4 + 1] = this.py[i];
      P[o4 + 2] = this.pz[i];
      P[o4 + 3] = size;
      C[o4] = this.c0[i3] + (this.c1[i3] - this.c0[i3]) * t;
      C[o4 + 1] = this.c0[i3 + 1] + (this.c1[i3 + 1] - this.c0[i3 + 1]) * t;
      C[o4 + 2] = this.c0[i3 + 2] + (this.c1[i3 + 2] - this.c0[i3 + 2]) * t;
      C[o4 + 3] = a;
      M[o4] = this.rot[i];
      M[o4 + 1] = this.frame[i];
      M[o4 + 2] = this.stretch[i];
      M[o4 + 3] = this.lit[i];
      V[o3] = this.vx[i];
      V[o3 + 1] = this.vy[i];
      V[o3 + 2] = this.vz[i];
    }
    const geo = this.mesh.geometry;
    geo.instanceCount = n;
    for (const at of [this.aPos, this.aCol, this.aMisc, this.aVel]) {
      if (n === 0) continue;
      at.updateRange.offset = 0;
      at.updateRange.count = n * at.itemSize;
      at.needsUpdate = true;
    }
    this.mesh.visible = n > 0;
  };

  // ------------------------------------------------------------------
  // Emitters (continuous sources)
  // ------------------------------------------------------------------
  const emitters = (A.emitters = []);
  /**
   * def: {pos:Vector3, rate:per-second, spawn(pos, emitter), lod:distance, life?:seconds, obj?:Object3D (follow),
   *       offset?:Vector3, onUpdate?(dt, e)}
   * returns handle {pos, rate, stop(), setPos(v), setRate(r), alive}
   */
  A.addEmitter = function (def) {
    const e = {
      pos: def.pos ? def.pos.clone() : new THREE.Vector3(),
      rate: def.rate || 10,
      acc: Math.random(),
      lod: def.lod || 120,
      spawn: def.spawn,
      life: def.life || Infinity,
      age: 0,
      obj: def.obj || null,
      offset: def.offset || null,
      onUpdate: def.onUpdate || null,
      alive: true,
      data: def.data || {},
      scale: def.scale || 1,
      paused: false,
      transient: !!def.transient, // true → belongs to a gameplay event (explosion fire…): stopped on reset/load
    };
    e.stop = function () {
      e.alive = false;
      if (e.onStop)
        try {
          e.onStop(e);
        } catch (er) {
          /* ignore */
        }
    };
    e.setPos = function (v) {
      A.v3(v, e.pos);
      return e;
    };
    e.setRate = function (r) {
      e.rate = r;
      return e;
    };
    e.setScale = function (s) {
      e.scale = s;
      return e;
    };
    e.pause = function (b) {
      e.paused = b !== false;
      return e;
    };
    /** Make this a transient, self-expiring source: it stops by itself after `sec` more seconds of world
     *  time and is stopped on reset (new game / load). Returns the handle. */
    e.expire = function (sec) {
      e.transient = true;
      if (sec !== undefined) e.life = e.age + Math.max(0, sec);
      return e;
    };
    emitters.push(e);
    return e;
  };
  const _ep = new THREE.Vector3();
  function updateEmitters(dt) {
    for (let k = emitters.length - 1; k >= 0; k--) {
      const e = emitters[k];
      if (!e.alive) {
        emitters.splice(k, 1);
        continue;
      }
      e.age += dt;
      if (e.age > e.life) {
        e.stop();
        emitters.splice(k, 1);
        continue;
      }
      if (e.obj) {
        if (!e.obj.parent) {
          e.stop();
          emitters.splice(k, 1);
          continue;
        }
        e.obj.getWorldPosition(_ep);
        if (e.offset) _ep.add(e.offset);
        e.pos.copy(_ep);
      }
      if (e.onUpdate) e.onUpdate(dt, e);
      if (e.paused || dt <= 0) continue;
      const d = A.camDist(e.pos);
      if (d > e.lod) {
        e.acc = 0;
        continue;
      }
      // thin out distant emitters
      const lodK = d > e.lod * 0.5 ? 0.45 : 1;
      e.acc += e.rate * dt * lodK;
      let guard = 0;
      while (e.acc >= 1 && guard++ < 40) {
        e.acc -= 1;
        e.spawn(e.pos, e);
      }
    }
  }

  // ------------------------------------------------------------------
  function init() {
    A.atlasTex = makeAtlas();
    const low = A.quality === "low";
    A.psAdd = new PSystem("add", low ? 1200 : 2600, true);
    A.psAlpha = new PSystem("alpha", low ? 1000 : 2200, false);
    G.scene.add(A.psAlpha.mesh, A.psAdd.mesh);
  }
  const _lc = new THREE.Color();
  function update(dt) {
    if (A.fxFreeze) dt = 0; // debug (?fxfreeze=1): hold transient effects for close-up shots
    updateEmitters(dt);
    A.psAdd.simulate(dt);
    A.psAlpha.simulate(dt);
  }
  function late() {
    // environment lighting for lit (alpha) particles
    const env = A.env;
    _lc.copy(env.hemiSky).multiplyScalar(env.hemiInt * 0.62);
    _lc.r += env.lightColor.r * env.lightInt * 0.2;
    _lc.g += env.lightColor.g * env.lightInt * 0.2;
    _lc.b += env.lightColor.b * env.lightInt * 0.2;
    A.psAlpha.mat.uniforms.uLight.value.copy(_lc);
    A.psAdd.upload();
    A.psAlpha.upload();
  }
  function reset() {
    A.psAdd.clear();
    A.psAlpha.clear();
    // transient sources (explosion fires, smoke columns, molotov pools…) never survive into the next session;
    // permanent world features (vents, plume fires, other modules' barrel fires) are kept
    for (let k = emitters.length - 1; k >= 0; k--) {
      const e = emitters[k];
      if (e.transient || !e.alive) {
        if (e.alive) e.stop();
        emitters.splice(k, 1);
      }
    }
  }

  A.addSystem({ name: "particles", order: 60, init, update, late, reset });
})();
