// play-inline-440 05 — math
// Lines 1326-1556 of readable/play-inline-440.pretty.js (statement-aligned).
  const FLAME_VS = [
    "attribute vec3 base; attribute vec4 prm;", // prm: scale, seed, life, heightMul
    "uniform float time; uniform float kind;",
    "varying vec2 vUv; varying float vT; varying float vSeed;",
    "void main(){",
    "  vUv = uv;",
    "  float sc = prm.x; float seed = prm.y;",
    "  float life = prm.z;",
    "  float t = fract(time / life + seed);",
    "  vT = t; vSeed = seed;",
    "  vec3 c = base;",
    "  if (kind < 0.5) {",
    "    c.y += t * 1.1 * sc * prm.w;",
    "    c.x += sin(time * 5.0 + seed * 40.0) * 0.07 * sc * t;",
    "    c.z += cos(time * 4.3 + seed * 33.0) * 0.07 * sc * t;",
    "  } else {",
    "    c.y += 0.6 * sc + t * 4.5 * sc * prm.w;",
    "    c.x += sin(seed * 60.0) * 0.4 * sc * t + t * t * 0.8 * sc;",
    "    c.z += cos(seed * 50.0) * 0.4 * sc * t;",
    "  }",
    "  float s = kind < 0.5 ? sc * (0.55 - 0.35 * t) * (0.8 + 0.4 * fract(seed * 7.0)) : sc * (0.4 + 1.6 * t);",
    "  vec4 mv = modelViewMatrix * vec4(c, 1.0);",
    "  mv.xy += (uv - 0.5) * 2.0 * s;",
    "  gl_Position = projectionMatrix * mv;",
    "}",
  ].join("\n");
  const FLAME_FS = [
    "uniform float kind; uniform float time;",
    "varying vec2 vUv; varying float vT; varying float vSeed;",
    "void main(){",
    "  vec2 p = vUv * 2.0 - 1.0;",
    "  if (kind < 0.5) {",
    "    p.y += 0.25; float r = length(vec2(p.x * 1.25, p.y * 0.8));",
    "    float a = smoothstep(1.0, 0.1, r) * (1.0 - vT) * 1.1;",
    "    vec3 hot = vec3(1.0, 0.85, 0.45), mid = vec3(1.0, 0.45, 0.1), cool = vec3(0.6, 0.12, 0.03);",
    "    vec3 col = mix(hot, mid, smoothstep(0.0, 0.4, vT)); col = mix(col, cool, smoothstep(0.4, 1.0, vT));",
    "    gl_FragColor = vec4(col * a * 1.4, 1.0);",
    "  } else {",
    "    float r = length(p);",
    "    float a = smoothstep(1.0, 0.2, r) * smoothstep(0.0, 0.15, vT) * (1.0 - vT) * 0.45;",
    "    gl_FragColor = vec4(vec3(0.16, 0.15, 0.14) + 0.05 * vSeed, a);",
    "  }",
    "}",
  ].join("\n");
  class FlameLayer {
    constructor(cap, kind) {
      this.cap = cap;
      this.kind = kind;
      const quad = new THREE.PlaneGeometry(1, 1);
      const g = new THREE.InstancedBufferGeometry();
      g.index = quad.index;
      g.setAttribute("position", quad.attributes.position);
      g.setAttribute("uv", quad.attributes.uv);
      this.base = new Float32Array(cap * 3);
      this.prm = new Float32Array(cap * 4);
      g.setAttribute("base", new THREE.InstancedBufferAttribute(this.base, 3));
      g.setAttribute("prm", new THREE.InstancedBufferAttribute(this.prm, 4));
      g.instanceCount = cap;
      this.geo = g;
      this.mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 }, kind: { value: kind } },
        vertexShader: FLAME_VS,
        fragmentShader: FLAME_FS,
        transparent: true,
        depthWrite: false,
        blending: kind === 0 ? THREE.AdditiveBlending : THREE.NormalBlending,
      });
      this.mesh = new THREE.Mesh(g, this.mat);
      this.mesh.frustumCulled = false;
      this.mesh.renderOrder = kind === 0 ? 6 : 4;
      this.used = new Uint8Array(cap);
    }
    alloc(n) {
      // find n contiguous free slots
      let run = 0;
      for (let i = 0; i < this.cap; i++) {
        run = this.used[i] ? 0 : run + 1;
        if (run === n) {
          const s = i - n + 1;
          for (let k = s; k <= i; k++) this.used[k] = 1;
          return s;
        }
      }
      return -1;
    }
    set(slot, x, y, z, scale, seed, life, hm) {
      this.base[slot * 3] = x;
      this.base[slot * 3 + 1] = y;
      this.base[slot * 3 + 2] = z;
      this.prm[slot * 4] = scale;
      this.prm[slot * 4 + 1] = seed;
      this.prm[slot * 4 + 2] = life;
      this.prm[slot * 4 + 3] = hm || 1;
      this.dirty = true;
    }
    release(s, n) {
      for (let k = s; k < s + n; k++) {
        this.used[k] = 0;
        this.prm[k * 4] = 0;
      }
      this.dirty = true;
    }
    update(time) {
      this.mat.uniforms.time.value = time;
      if (this.dirty) {
        this.dirty = false;
        this.geo.attributes.base.needsUpdate = true;
        this.geo.attributes.prm.needsUpdate = true;
      }
    }
  }
  class FlameField {
    constructor() {
      this.flames = new FlameLayer(1400, 0);
      this.smoke = new FlameLayer(900, 1);
      this.group = new THREE.Group();
      this.group.name = "props_flames";
      this.group.add(this.smoke.mesh, this.flames.mesh);
    }
    /** Add a fire. Returns handle {setScale(s), stop(), pos}. */
    add(x, y, z, scale, opts) {
      opts = opts || {};
      const nf =
          opts.flames !== undefined
            ? opts.flames
            : Math.max(5, Math.round(6 * Math.min(2, scale))),
        ns = opts.smoke === false ? 0 : opts.smokeCount || 4;
      const fs = nf > 0 ? this.flames.alloc(nf) : -1,
        ss = ns ? this.smoke.alloc(ns) : -1;
      const h = { x, y, z, scale, fs, nf, ss, ns, alive: true, field: this };
      const apply = () => {
        const spread = 0.28 * h.scale * (opts.spread || 1);
        if (fs >= 0)
          for (let i = 0; i < nf; i++) {
            const a = (i / nf) * X.TAU + Math.random() * 0.5,
              rr = spread * Math.sqrt(Math.random());
            this.flames.set(
              fs + i,
              x + Math.cos(a) * rr,
              y,
              z + Math.sin(a) * rr,
              h.scale * (0.8 + Math.random() * 0.4),
              i / nf + Math.random() * 0.1,
              0.7 + Math.random() * 0.5,
              opts.height || 1,
            );
          }
        if (ss >= 0)
          for (let i = 0; i < ns; i++)
            this.smoke.set(
              ss + i,
              x,
              y,
              z,
              h.scale * (opts.smokeScale || 1),
              i / ns,
              3.5 + Math.random() * 1.5,
              opts.smokeHeight || 1,
            );
      };
      apply();
      h.setScale = (s) => {
        h.scale = s;
        if (s <= 0.01) {
          if (fs >= 0)
            for (let i = 0; i < nf; i++) this.flames.prm[(fs + i) * 4] = 0;
          this.flames.dirty = true;
        } else apply();
      };
      h.stop = () => {
        if (!h.alive) return;
        h.alive = false;
        if (fs >= 0) this.flames.release(fs, nf);
        if (ss >= 0) this.smoke.release(ss, ns);
      };
      return h;
    }
    update(time) {
      this.flames.update(time);
      this.smoke.update(time);
    }
  }
  X.FlameField = FlameField;

  // ------------------------------------------------------------------
  // Misc helpers
  // ------------------------------------------------------------------
  /** Terrain/ground height at x,z (map module may provide hills). */
  X.ground = function (x, z) {
    try {
      const h = G.world.terrainHeight(x, z);
      return isFinite(h) ? Math.max(h, 0) : 0;
    } catch (e) {
      return 0;
    }
  };
  X.nightFactor = function () {
    const h = G.time ? G.time.hour : 12;
    if (
      G.atmos &&
      !G.isStub("atmos") &&
      typeof G.atmos.isNight === "function"
    ) {
      try {
        if (G.atmos.isNight()) return 1;
      } catch (e) {
        /* ignore */
      }
    }
    // smooth: full night 20→5, dusk/dawn ramps
    if (h >= 20.5 || h < 5) return 1;
    if (h >= 18) return X.smooth(18, 20.5, h);
    if (h < 7) return 1 - X.smooth(5, 7, h);
    return 0;
  };
  X.safe = function (fn, where) {
    try {
      return fn();
    } catch (e) {
      G.reportError("props:" + (where || "call"), e);
      return undefined;
    }
  };
  X.sfx = function (name, o) {
    try {
      if (!G.isStub("sfx")) return G.sfx.play(name, o || {});
    } catch (e) {
      /* ignore */
    }
    return null;
  };
