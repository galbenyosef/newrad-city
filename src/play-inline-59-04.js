// play-inline-59 04 — def
// Lines 701-920 of readable/play-inline-59.pretty.js (statement-aligned).
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
