// play-inline-468 04 — opts
// Lines 519-2754 of readable/play-inline-468.pretty.js (statement-aligned).
  class Character {
    constructor(type, base, tpl, info, opts, seed) {
      this.id = ++charCount;
      this.type = type;
      this.baseType = base;
      this.tpl = tpl;
      this.info = info;
      this.opts = opts;
      this.seed = seed;
      this.kind = tpl.kind || info.kind;
      const meta = tpl.meta || {};
      this.scale = meta.s || opts.scale || 1;
      this.height = meta.height || info.height;
      this.radius = meta.radius || info.radius * (meta.power ? 1.3 : 1);
      this.hipH = meta.hipH || this.height * 0.53;
      this.legLen = meta.legLen || this.hipH * 0.95;
      this.bodyThick = meta.bodyThick || 0.13 * this.scale * (meta.bulk || 1);
      this.bodyH = meta.bodyH || this.hipH;
      this.hover = meta.hover || 0;
      this.gore = meta.gore || info.gore || "red";
      this.style = Object.assign(
        {},
        BIPED_STYLE,
        info.style || {},
        meta.style || {},
      );
      this.gait = Object.assign(
        { walkStep: 0.72, runStep: 1.25, walkSpeed: 1.6, runSpeed: 4.6 },
        info.gait || {},
        meta.gait || {},
      );
      if (meta.power) {
        // exo-rig: heavy planted gait (see BI.gait 'power'), slower run
        this.style = Object.assign({}, this.style, {
          heavy: true,
          power: true,
          armOut: 0.22,
          stance: 0.06,
          armSwing: 0.42,
        });
        this.gait = Object.assign({}, this.gait, {
          walkStep: 0.8,
          runStep: 1.15,
          walkSpeed: 1.45,
          runSpeed: 4.0,
        });
      }
      if (meta.noFootIK) this.noFootIK = true;
      // Crowd far tier: explicit opts.crowd, else AUTO for actor-driven characters
      // (G.actors / combat pass their def with a `level`) — nobody else opted in, so
      // every standing NPC / idle enemy far away still cost a skinned draw call each.
      // Never the player's own body (opts.player / opts.noCrowd) or portraits.
      this.crowd =
        opts.crowd !== undefined
          ? !!opts.crowd
          : opts.level !== undefined &&
            !opts.player &&
            !opts.noCrowd &&
            !opts.essentialRig;
      this.seedPhase = (seed % 1000) * 0.0137;
      // --- scene graph ---
      this.root = new THREE.Group();
      this.root.name = "char:" + type;
      this.root.userData.character = this;
      this.rig = new THREE.Group();
      this.root.add(this.rig);
      this.bones = tpl.bones.map((b) => {
        const bone = new THREE.Bone();
        bone.name = b.name;
        bone.position.set(b.pos[0], b.pos[1], b.pos[2]);
        return bone;
      });
      tpl.bones.forEach((b, i) => {
        if (b.parent >= 0) this.bones[b.parent].add(this.bones[i]);
        else this.rig.add(this.bones[i]);
      });
      this.B = tpl.map;
      this.rest = this.bones.map((b) => b.position.clone());
      this.root.updateMatrixWorld(true);
      this.skeleton = new THREE.Skeleton(this.bones);
      this.material = L.makeMaterial();
      this.mesh = new THREE.SkinnedMesh(tpl.geometry, this.material);
      this.mesh.name = "charMesh";
      this.rig.add(this.mesh);
      this.mesh.bind(this.skeleton);
      this.mesh.castShadow = true;
      this.mesh.receiveShadow = true;
      this.mesh.boundingSphere = new THREE.Sphere(
        new THREE.Vector3(0, this.height * 0.5, 0),
        Math.max(this.height, this.radius * 3) * 0.75 + 3.5,
      );
      this.mesh.userData.character = this;
      // --- body part markers ---
      this.parts = {};
      for (const p of L.PART_NAMES) {
        const m = tpl.markers[p];
        const o = new THREE.Object3D();
        o.name = "part:" + p;
        o.userData = { part: p, radius: m ? m.r : 0.25, character: this };
        if (m) {
          o.position.set(m.pos[0], m.pos[1], m.pos[2]);
          this.bones[m.bone].add(o);
          o.userData.bone = m.bone;
        }
        this.parts[p] = o;
      }
      for (const p of L.PART_NAMES)
        if (!tpl.markers[p]) {
          // alias missing parts to torso marker
          const t = tpl.markers.torso ? this.parts.torso : null;
          if (t) {
            this.parts[p] = t;
          } else {
            this.rig.add(this.parts[p]);
            this.parts[p].position.set(0, this.height * 0.5, 0);
          }
        }
      // --- sockets ---
      this.sockets = {};
      for (const k in tpl.sockets) {
        const s = tpl.sockets[k];
        const o = new THREE.Object3D();
        o.name = "socket:" + k;
        o.position.set(s.pos[0], s.pos[1], s.pos[2]);
        o.rotation.set(s.rot[0], s.rot[1], s.rot[2]);
        this.bones[s.bone].add(o);
        this.sockets[k] = o;
      }
      // --- animation state ---
      const n = this.bones.length;
      this.poseA = new A.Pose(n);
      this.poseB = new A.Pose(n);
      this.poseC = new A.Pose(n);
      this.poseT = new A.Pose(n);
      this.poseF = new A.Pose(n);
      this.poseG = new A.Pose(n);
      this.W = new A.Writer(this);
      this.lib = A.LIBS[this.kind] || A.LIBS.biped;
      this.anim = { name: "idle", t: 0, speed: 1, loop: true, opts: {} };
      this.prev = null;
      this.fade = 1;
      this.fadeDur = 0.22;
      this.one = null;
      this.oneFade = 0;
      this.animT = this.seedPhase * 10;
      this.phase = this.seedPhase * 3;
      this.speedM = 0;
      this.velLocal = { x: 0, z: 0 };
      this._lastPos = new THREE.Vector3(NaN, 0, 0);
      this.upperMask = this._makeMask(
        this.B.spine !== undefined ? "spine" : null,
      );
      this.lookTarget = null;
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.aimFlag = false;
      this.ikW = 0;
      this.recoil = 0;
      this.lastFire = -99;
      this.weapon = null;
      this.holdType = null;
      this.dead = false;
      this.death = null;
      this._softDead = false; // lying down via setAnim('dead') (dormant Maniac / knocked out): gets up on the next anim
      this._getup = null; // {dur, next, nextOpts} while standing back up
      this._pendingOne = null; // one-shot queued while getting up
      this.dismembered = {};
      this._stumps = [];
      this.hitLocal = null;
      this.hitPart = null;
      this.attackAlt = false;
      this._flash = 0;
      this._flashColor = new THREE.Color(1, 0.2, 0.1);
      this._flashing = false;
      this._flashingColor = new THREE.Color(0.2, 1, 0.3);
      this._dissolve = null;
      this._extFrame = -99;
      this._lastTick = 0;
      this._acc = 0;
      this.autoUpdate = true;
      this.disposed = false;
      this.hidden = false;
      this.hitScale = meta.hitScale || 1;
      this.rigYaw = 0;
      this.rigYawTarget = 0;
      // cut map for dismemberment
      this.cut = Object.assign(
        {
          head: "head",
          leftArm: "armL",
          rightArm: "armR",
          leftLeg: "thighL",
          rightLeg: "thighR",
        },
        meta.cut || {},
      );
      // geometric LOD (same skeleton → free geometry swap)
      this._lod = 0;
      this.lodDist = clamp(this.height * 19, 9, 90);
      this._gen = L.resetGen || 0;
      tpl.users = (tpl.users || 0) + 1;
      this._ratios = opts._ratios || null;
      applyVariety(this);
      this._headK = 1;
      if (meta.face && !meta.power) {
        // per-INDIVIDUAL face on top of the per-template face map (moles,
        // freckle density, blotchy redness, Maniac scabs) + head size
        const fr = L.rng(((seed * 40503) ^ 0x2c1b3c6d) >>> 0),
          F = meta.face;
        const light =
          F.skin !== undefined
            ? (() => {
                const c = L.col(F.skin);
                return c.r * 0.3 + c.g * 0.6 + c.b * 0.1;
              })()
            : 0.4;
        const frk =
          !F.maniac && !F.mutant
            ? fr() < (light > 0.45 ? 0.35 : 0.12)
              ? fr.range(0.35, 1)
              : fr() * 0.15
            : 0;
        this.material.userData.uniforms.uFaceVar.value.set(
          frk,
          fr.range(0.1, 0.9) * (F.mutant ? 0.3 : 1),
          F.maniac ? fr.range(0.12, 0.3) : 0,
          1 + fr() * 97,
        );
        this._headK = F.mutant ? 1 : fr.range(0.965, 1.035);
      }
      // dialogue-grade face (humans, Maniacs, brutes): blinks, gaze, visemes, expressions
      this.face =
        tpl.meta && tpl.meta.faceRig && L.FaceCtl ? new L.FaceCtl(this) : null;
      this._faceTexT = 0;
      LIVE.add(this);
      this._evaluate(0);
    }

    /**
     * Corpse settle: sample the ground under the lying body's parts, fit a
     * plane (root-local, ridge-regularised: a body is nearly a line, so the
     * slope across it stays near flat unless the samples say otherwise) and
     * return the rig tilt + height that lays the body on it. null on flat
     * ground or without a world.
     */
    _computeSettle() {
      const W = G.world;
      if (!W || typeof W.groundHeight !== "function" || !this.root.parent)
        return null;
      this.root.updateMatrixWorld(true);
      const p0 = this.root.position,
        yaw = this.root.rotation.y,
        c = Math.cos(yaw),
        sn = Math.sin(yaw);
      const seen = new Set();
      let n = 0,
        sx = 0,
        sz = 0,
        sy = 0,
        sxx = 0,
        szz = 0,
        sxz = 0,
        sxy = 0,
        szy = 0,
        maxd = 0;
      for (const pn of [
        "torso",
        "head",
        "leftLeg",
        "rightLeg",
        "leftArm",
        "rightArm",
      ]) {
        const o = this.parts[pn];
        if (!o || seen.has(o) || this.dismembered[pn] !== undefined) continue;
        seen.add(o);
        o.getWorldPosition(_sv);
        let gh;
        try {
          gh = W.groundHeight(_sv.x, _sv.z, Math.max(_sv.y, p0.y) + 0.9, 0.12);
        } catch (e) {
          gh = NaN;
        }
        if (!isFinite(gh)) continue;
        const dy = clamp(gh - p0.y, -1.2, 1.2);
        const wx = _sv.x - p0.x,
          wz = _sv.z - p0.z;
        const lx = wx * c - wz * sn,
          lz = wx * sn + wz * c; // world → root-local
        n++;
        sx += lx;
        sz += lz;
        sy += dy;
        sxx += lx * lx;
        szz += lz * lz;
        sxz += lx * lz;
        sxy += lx * dy;
        szy += lz * dy;
        maxd = Math.max(maxd, Math.abs(dy));
      }
      if (n < 2 || maxd < 0.035) return null;
      // least squares dy = a + b·x + c·z with ridge λ on the slopes
      const lam = 0.06 * n;
      const M = [
          [n, sx, sz],
          [sx, sxx + lam, sxz],
          [sz, sxz, szz + lam],
        ],
        Y = [sy, sxy, szy];
      const det3 = (m) =>
        m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
        m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
        m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
      const D = det3(M);
      if (Math.abs(D) < 1e-9) return null;
      const sol = [0, 0, 0];
      for (let i = 0; i < 3; i++) {
        const Mi = M.map((r, j) => r.map((v, k) => (k === i ? Y[j] : v)));
        sol[i] = det3(Mi) / D;
      }
      const a = clamp(sol[0], -0.8, 0.8),
        b = clamp(sol[1], -0.55, 0.55),
        cz = clamp(sol[2], -0.55, 0.55);
      _sn.set(-b, 1, -cz).normalize();
      const q = new THREE.Quaternion().setFromUnitVectors(_yAxis, _sn);
      return { q, dy: a, k: 0 };
    }

    // ---------------------------------------------------------------
    // Crowd FAR TIER: a standing crowd member far away (or beyond the live
    // budget) hides its skinned mesh and joins its scene's far BATCH — one
    // static merged mesh of frozen baked poses (one draw call for the whole
    // distant crowd, no skinning, no animation, no shadow). Any animation
    // request, movement or approach brings the real rig back the same frame.
    // ---------------------------------------------------------------
    _farEnter() {
      if (this._far || this.disposed || !this.root.parent) return false;
      // a rig whose mesh somebody else hid (ambient_life dresses a borrowed
      // actor with its own model) must never reappear as a far impostor
      if (!this.mesh.visible || this._exploded) return false;
      const pool = FAR.pool(this);
      if (!pool) return false;
      pool.members.push(this);
      this._far = pool;
      this.mesh.visible = false;
      FAR.dirty = true;
      return true;
    }
    _farExit() {
      const pool = this._far;
      if (!pool) return;
      this._far = null;
      const i = pool.members.indexOf(this);
      if (i >= 0) pool.members.splice(i, 1);
      pool.dirty = true;
      FAR.release(this);
      this._farAt = null;
      if (
        !this._exploded &&
        !(this._dissolve && this._dissolve.t >= this._dissolve.dur)
      )
        this.mesh.visible = true;
      this._acc = 1e3; // re-pose on the next tick
      FAR.dirty = true;
    }

    _makeMask(rootName) {
      const n = this.bones.length;
      if (!rootName) return null;
      const ri = this.B[rootName];
      const m = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        let b = i;
        while (b >= 0) {
          if (b === ri) {
            m[i] = 1;
            break;
          }
          b = this.tpl.bones[b].parent;
        }
      }
      return m;
    }

    // ---------------------------------------------------------------
    // Public animation API
    // ---------------------------------------------------------------
    _resolveName(name) {
      if (!name) return "idle";
      name = String(name);
      if (name === "attack")
        return RANGED[this.holdType] || this.style.ranged
          ? "attack_ranged"
          : "attack_melee";
      if (A.ALIAS[name]) return A.ALIAS[name];
      return name;
    }
    /** Set the base (looping / static) animation. */
    setAnim(name, opts) {
      if (this.disposed) return;
      opts = opts || {};
      const n = this._resolveName(name);
      // (callers re-send the same anim every frame: only a CHANGE wakes a frozen far-tier member)
      if (this._far && (n !== this.anim.name || this.dead)) this._farExit();
      if (n === "death" || n === "dead") return this._die(n, opts);
      // one-shot names passed to setAnim play as one-shots (except loopable 'talk')
      if (A.ONESHOT[n] && n !== "talk" && !opts.loop)
        return this.playOneShot(n, opts);
      if (!this.lib[n] && !A.LOCO[n]) return;
      if (this.dead) {
        // Real corpses (killed via 'death', or restored with {corpse:true}) stay down unless
        // explicitly revived. A body that was merely POSED dead (dormant Maniac, knocked-out
        // essential NPC) climbs back up with a get-up transition.
        if (this._softDead || opts.revive) {
          this._startGetup(n, opts);
          return;
        }
        return;
      }
      if (this._getup) {
        this._getup.next = n;
        this._getup.nextOpts = opts;
        return;
      } // finish standing first
      const cur = this.anim;
      if (cur.name === n) {
        cur.speed = opts.speed || 1;
        cur.opts = opts;
        return;
      }
      this.prev = {
        name: cur.name,
        t: cur.t,
        speed: cur.speed,
        opts: cur.opts,
      };
      this.fade = 0;
      this.fadeDur = opts.fade !== undefined ? opts.fade : 0.22;
      this.anim = {
        name: n,
        t: 0,
        speed: opts.speed || 1,
        loop: opts.loop !== false,
        opts,
      };
      if (n === "aim") this.aimFlag = true;
    }
    /** Layered one-shot action (attack, hit, reload, talk gesture, throw, roar…). */
    playOneShot(name, opts) {
      if (this.disposed) return false;
      opts = opts || {};
      if (this._far && !this.dead) this._farExit();
      const n = this._resolveName(name);
      if (n === "death" || n === "dead") {
        this._die(n, opts);
        return true;
      }
      if (this.dead) return false;
      if (n === "hit") {
        this._addBlood(opts.part === "head" ? 0.09 : 0.06);
        if (this.face) this.face.hurt(opts.part === "head" ? 1 : 0.75);
      }
      if (this.face && n === "talk" && !this.face.isTalking())
        this.face.babble((opts.dur || 1.4) * 0.8);
      if (this.face && n === "roar")
        this.face.setEmotion(
          this.face.rig.maniac ? "maniac" : "angry",
          1.2,
          1.2,
        );
      if (this._getup) {
        // standing up: flinches still play (additive), actions wait until upright
        if (n !== "hit") {
          this._pendingOne = { name: n, opts, age: 0 };
          return true;
        }
      }
      if (!this.lib[n]) {
        if (n === "attack_ranged" || n === "reload") {
          this.recoil = n === "attack_ranged" ? 1 : this.recoil;
          if (n === "attack_ranged") this.lastFire = this.animT;
          return true;
        }
        return false;
      }
      const def = A.ONESHOT[n] || { dur: 0.6, mask: "full" };
      // callers often re-trigger every frame: don't restart an action that is still playing
      if (
        this.one &&
        this.one.name === n &&
        n !== "attack_ranged" &&
        n !== "hit" &&
        !opts.restart &&
        this.one.t < this.one.dur * 0.85
      )
        return true;
      if (n === "attack_melee") this.attackAlt = !this.attackAlt;
      if (n === "attack_ranged") {
        this.recoil = 1;
        this.lastFire = this.animT;
      }
      if (n === "hit") {
        this.hitPart = opts.part || null;
        if (opts.dir) {
          const d = this._toLocalDir(opts.dir);
          this.hitLocal = { x: d.x, z: d.z };
        } else this.hitLocal = { x: (Math.random() - 0.5) * 0.6, z: 1 };
        this.flash(opts.flashColor || 0xff4020, 0.12);
        // don't let hit reactions cancel an attack in progress
        if (
          this.one &&
          this.one.name !== "hit" &&
          this.one.t < this.one.dur * 0.8
        ) {
          this._hitAdd = { t: 0 };
          return true;
        }
      }
      this.one = {
        name: n,
        t: 0,
        dur: (opts.dur || def.dur) / (opts.speed || 1),
        speed: opts.speed || 1,
        mask: def.mask,
        additive: !!def.additive,
        opts,
      };
      return true;
    }
    setAim(on) {
      if (on && this._far) this._farExit();
      this.aimFlag = !!on;
    }
    /**
     * Bring a dead character back (respawn / Lazarus). revive() snaps upright;
     * revive(anim, {getup:true}) climbs back up with the get-up transition.
     */
    revive(anim, opts) {
      if (opts && opts.getup && this.dead) {
        this._startGetup(this._resolveName(anim || "idle"), {});
        return;
      }
      if (this.dead) this._revive();
      this._getup = null;
      this.anim = { name: "idle", t: 0, speed: 1, loop: true, opts: {} };
      this.prev = null;
      this.fade = 1;
      if (anim) this.setAnim(anim);
    }
    /** Is the character lying on the ground (dead, dormant or knocked out)? */
    isDown() {
      return this.dead;
    }
    /** Is it currently climbing back to its feet? */
    isGettingUp() {
      return !!this._getup;
    }
    /** Wear & tear: grime 0..1, blood 0..1 (blood also builds up automatically from hits). */
    setWear(o) {
      const U = this.material.userData.uniforms;
      if (o && o.dirt !== undefined) U.uDirt.value = clamp(o.dirt, 0, 1);
      if (o && o.blood !== undefined) U.uBlood.value = clamp(o.blood, 0, 1);
    }
    _addBlood(k) {
      if (this.gore === "oil" && this.info.isRobot) k *= 0.6;
      const U = this.material.userData.uniforms;
      U.uBlood.value = Math.min(0.75, U.uBlood.value + k);
    }
    lookAt(v) {
      if (!v) {
        this.lookTarget = null;
        return;
      }
      if (!this.lookTarget) this.lookTarget = new THREE.Vector3();
      this.lookTarget.copy(v);
    }
    /** Current one-shot {name, t, dur} or null (combat can time melee hits at ~45% of dur). */
    getOneShot() {
      return this.one
        ? { name: this.one.name, t: this.one.t, dur: this.one.dur }
        : null;
    }
    isBusy() {
      return !!this.one && this.one.name !== "hit";
    }
    get animName() {
      return this.dead ? "dead" : this.anim.name;
    }
    isDead() {
      return this.dead;
    }

    _toLocalDir(dirW) {
      const yaw = this.root.rotation.y + this.rigYaw;
      const c = Math.cos(-yaw),
        s = Math.sin(-yaw);
      // rotate world dir by -yaw around Y
      const x = dirW.x * c + dirW.z * s,
        z = -dirW.x * s + dirW.z * c;
      const l = Math.hypot(x, z) || 1;
      return { x: x / l, z: z / l };
    }

    _die(n, opts) {
      opts = opts || {};
      if (this.dead) {
        // already on the ground: a real death (or a corpse restore) makes it permanent
        if (n === "death" || opts.corpse || opts.restore || opts.sticky)
          this._softDead = false;
        return;
      }
      if (this._getup) {
        this._getup = null;
        this._pendingOne = null;
      }
      const rng = L.rng(this.seed * 31 + this.id * 17);
      let style = "back",
        side = rng.chance(0.5) ? 1 : -1;
      if (opts.dir) {
        const d = this._toLocalDir(opts.dir);
        // dir = travel direction of the killing blow (shooter → victim)
        if (d.z > 0.45) style = "back";
        else if (d.z < -0.45) style = "front";
        else {
          style = "side";
          side = d.x > 0 ? 1 : -1;
        }
        if (this.kind !== "biped") side = d.x > 0 ? 1 : -1;
      } else style = rng.pick(["back", "back", "front", "side"]);
      const force = opts.force || 0;
      if (
        (force > 45 || opts.explosive || opts.blast) &&
        this.kind === "biped" &&
        !this.style.heavy
      ) {
        style = "blast";
        if (opts.dir) {
          const d = this._toLocalDir(opts.dir);
          this.rigYawTarget = Math.atan2(d.x, d.z);
        }
      } else if (opts.dir && this.kind === "biped") {
        const d = this._toLocalDir(opts.dir);
        if (style === "back")
          this.rigYawTarget = clamp(Math.atan2(d.x, d.z), -0.5, 0.5);
        if (style === "front")
          this.rigYawTarget = clamp(Math.atan2(-d.x, -d.z), -0.5, 0.5);
      }
      if (this.style.heavy && style === "blast") style = "back";
      // don't fall through walls: if the chosen fall direction is blocked within a
      // body length, pick the first clear alternative (opposite, then either side)
      if (style !== "blast" && this.kind === "biped") {
        const pick = this._clearFall(style, side);
        if (pick) {
          if (pick.style !== style) this.rigYawTarget = 0;
          style = pick.style;
          side = pick.side;
        }
      }
      this.death = {
        style,
        side,
        var: rng(),
        dist: clamp(force / 25, 1.5, 3.5),
        moved: false,
      };
      if (style === "blast") this._planBlast(opts);
      this.dead = true;
      // 'dead' without a preceding 'death' = posed on the ground (dormant/knocked out), not a corpse
      this._softDead =
        n === "dead" && !(opts.corpse || opts.restore || opts.sticky);
      this.one = null;
      this.aimFlag = false;
      this.lookTarget = null;
      this._hitAdd = null;
      this.prev = {
        name: this.anim.name,
        t: this.anim.t,
        speed: this.anim.speed,
        opts: this.anim.opts,
      };
      this.fade = n === "dead" ? 1 : 0;
      this.fadeDur = 0.12;
      this.anim = {
        name: n === "dead" ? "dead" : "death",
        t: 0,
        speed: 1,
        loop: false,
        opts: opts,
      };
      if (n === "dead") {
        this.rigYaw = this.rigYawTarget;
        this.prev = null;
      }
    }
    /** First fall style whose landing zone is free of walls/props ({style, side}); null = no world. */
    _clearFall(style, side) {
      const W = G.world;
      if (!W || typeof W.raycast !== "function") return null;
      const yaw = this.root.rotation.y + this.rigYawTarget;
      const reach = Math.max(0.6, this.height * 0.85);
      const cands = [[style, side]];
      if (style === "back")
        cands.push(["front", side], ["side", side], ["side", -side]);
      else if (style === "front")
        cands.push(["back", side], ["side", side], ["side", -side]);
      else cands.push(["side", -side], ["back", side], ["front", side]);
      const p = this.root.position;
      for (const [st, sd] of cands) {
        // local fall direction: back = +Z, front = -Z, side = +X * sd (rig yaw applied)
        const lx = st === "side" ? sd : 0,
          lz = st === "back" ? 1 : st === "front" ? -1 : 0;
        const c = Math.cos(yaw),
          sn = Math.sin(yaw);
        _v2.set(lx * c + lz * sn, 0, -lx * sn + lz * c).normalize();
        let blocked = false;
        for (const h of [0.35, 0.9]) {
          _v1.set(p.x, p.y + Math.min(h, this.height * 0.5), p.z);
          try {
            const hit = W.raycast(_v1, _v2, reach, {
              ignoreTags: ["actor", "char"],
            });
            if (
              hit &&
              hit.dist !== undefined &&
              hit.dist < reach * (st === "front" ? 0.8 : 1)
            ) {
              blocked = true;
              break;
            }
          } catch (e) {
            return null;
          }
        }
        if (!blocked) return { style: st, side: sd };
      }
      return { style: "front", side }; // boxed in: crumple forward onto the knees
    }
    /**
     * Explosion/huge-hit death throw: the body flies `dist` metres along the blast.
     * Clamp the throw against walls up front; on landing the travelled offset is
     * moved into root.position (so loot, targeting, interactables & raycasts follow the body).
     * If the caller moves the root itself (combat's explosion corpse physics: opts.blast),
     * the rig only tumbles in place.
     */
    _planBlast(opts) {
      const d = this.death;
      if (opts.blast || opts.rootMoves) {
        d.dist = 0.35;
        d.inPlace = true;
        return;
      }
      const yaw = this.root.rotation.y + this.rigYawTarget;
      d.wdx = Math.sin(yaw);
      d.wdz = Math.cos(yaw);
      const W = G.world;
      if (W && typeof W.raycast === "function") {
        try {
          const o = _v1.set(
            this.root.position.x,
            this.root.position.y + Math.min(1.0, this.hipH),
            this.root.position.z,
          );
          const hit = W.raycast(
            o,
            _v2.set(d.wdx, 0, d.wdz),
            d.dist + this.radius + 0.4,
            { ignoreTags: ["actor", "char"] },
          );
          if (hit && hit.dist !== undefined)
            d.dist = clamp(hit.dist - this.radius - 0.25, 0.1, d.dist);
        } catch (e) {
          /* world optional */
        }
      }
    }
    /** Called when a thrown body lands: bake the rig's travel into the root position. */
    _landBlast() {
      const d = this.death;
      if (!d || d.moved) return;
      d.moved = true;
      if (d.inPlace || !(d.dist > 0.05)) return;
      // only blast deaths carry a planned travel (wdx/wdz); ordinary falls reach here after 4 s via the
      // 'death'→'dead' hand-off and must not move (undefined * dist = NaN used to teleport corpses to NaN)
      if (!isFinite(d.wdx) || !isFinite(d.wdz)) return;
      const p = this.root.position;
      let dx = d.wdx * d.dist,
        dz = d.wdz * d.dist;
      const W = G.world;
      try {
        if (W && typeof W.moveCircle === "function") {
          const r = W.moveCircle(p, 0.3, 1.0, dx, dz);
          if (r && isFinite(r.x) && isFinite(r.z)) {
            dx = r.x - p.x;
            dz = r.z - p.z;
          }
        }
      } catch (e) {
        /* ignore */
      }
      if (!isFinite(dx) || !isFinite(dz)) return;
      p.x += dx;
      p.z += dz;
      try {
        if (W && typeof W.groundHeight === "function") {
          const gh = W.groundHeight(p.x, p.z, p.y + 1.0, 0.3);
          if (isFinite(gh)) p.y = gh;
        }
      } catch (e) {
        /* ignore */
      }
      d.dist = 0; // the rig offset no longer carries the travel
      this._lastPos.copy(p);
    }
    /** Per-limb corpse drape: [{bi, q (parent-space delta), k}] or null. */
    _computeDrape() {
      const W = G.world;
      if (!W || typeof W.groundHeight !== "function") return null;
      if (this._camD2 !== undefined && this._camD2 > 40 * 40) {
        this._drapeTry = false;
        return null;
      } // retry when the player comes close
      const B = this.B,
        out = [];
      const chains = [
        ["armL", "handL", 0.035, "forearmL"],
        ["armR", "handR", 0.035, "forearmR"],
        ["thighL", "footL", 0.05, "shinL"],
        ["thighR", "footR", 0.05, "shinR"],
        ["neck", "head", 0.09, null],
      ];
      for (const [a, t, clr, mid] of chains) {
        const ai = B[a],
          ti = B[t];
        if (ai === undefined || ti === undefined) continue;
        let cut = false;
        for (const k in this.dismembered) {
          let b = ti;
          while (b >= 0) {
            if (b === this.dismembered[k]) {
              cut = true;
              break;
            }
            b = this.tpl.bones[b].parent;
          }
        }
        if (cut) continue;
        const ba = this.bones[ai],
          bt = this.bones[ti];
        ba.getWorldPosition(_dPr);
        bt.getWorldPosition(_dPt);
        let g;
        try {
          g = W.groundHeight(_dPt.x, _dPt.z, _dPt.y + 0.45, 0.05);
        } catch (e) {
          continue;
        }
        if (!isFinite(g)) continue;
        const e = g + clr * this.scale - _dPt.y;
        if (Math.abs(e) < 0.025 || e > 0.3 || e < -0.4) continue; // (bigger gaps: a wall / ledge edge, leave the limb be)
        _dD.subVectors(_dPt, _dPr);
        const len = _dD.length();
        if (len < 0.08) continue;
        _dN.crossVectors(_yAxis, _dD);
        if (_dN.lengthSq() < 1e-8) continue;
        _dN.normalize();
        _dV.crossVectors(_dN, _dD); // tip velocity for a unit rotation about _dN
        if (Math.abs(_dV.y) < 0.15 * len) continue;
        let th = clamp(e / _dV.y, -0.55, 0.55);
        // lowering a limb must not push its middle joint (elbow / knee) into the ground
        if (th * _dV.y < 0 && mid && B[mid] !== undefined) {
          this.bones[B[mid]].getWorldPosition(_dPt);
          let gm;
          try {
            gm = W.groundHeight(_dPt.x, _dPt.z, _dPt.y + 0.45, 0.05);
          } catch (err) {
            gm = NaN;
          }
          const vm = _dD.subVectors(_dPt, _dPr);
          const vmy = _dV.crossVectors(_dN, vm).y;
          if (isFinite(gm) && Math.abs(vmy) > 1e-4) {
            const room = _dPt.y - (gm + 0.03 * this.scale); // how far the joint may still drop
            const drop = -th * vmy; // how far it would drop
            if (drop > room) th *= Math.max(0, room) / drop;
          }
          if (Math.abs(th) < 0.02) continue;
        }
        const qw = new THREE.Quaternion().setFromAxisAngle(_dN, th);
        const qp = new THREE.Quaternion();
        ba.parent.getWorldQuaternion(qp);
        out.push({
          bi: ai,
          q: qp.clone().invert().multiply(qw).multiply(qp),
          k: 0,
        });
      }
      return out.length ? out : null;
    }
    /** World position of a corpse's torso (where the body actually lies). */
    getCorpsePos(out) {
      return this.getPartWorldPos("torso", out);
    }
    _revive() {
      this.dead = false;
      this._softDead = false;
      this.death = null;
      this.rigYaw = this.rigYawTarget = 0;
      this.rig.rotation.set(0, 0, 0);
      this.rig.position.set(0, 0, 0);
      this._settle = null;
      this._settleDone = false;
      this._drape = null;
      this._drapeTry = false;
      if (this._dissolve) {
        this._dissolve = null;
        this.material.userData.uniforms.uDissolve.value = 0;
      }
      if (!this._exploded) this.mesh.visible = true;
    }
    /** Climb back to the feet from the current lying pose, then play `next`. */
    _startGetup(next, nextOpts) {
      if (this._dissolve || this._exploded) return;
      this._settle = null;
      this._settleDone = false;
      this._drape = null;
      this._drapeTry = false;
      this.rig.position.set(0, 0, 0);
      const d = this.death || { style: "back", side: 1, var: 0, dist: 0 };
      d.dist = 0;
      this.dead = false;
      this._softDead = false;
      const dur =
        this.kind === "biped"
          ? this.style.wild
            ? 0.95
            : this.style.heavy
              ? 1.7
              : 1.35
          : 0.75;
      this._getup = {
        dur,
        death: d,
        next: next || "idle",
        nextOpts: nextOpts || {},
      };
      this.anim = { name: "getup", t: 0, speed: 1, loop: false, opts: {} };
      this.prev = null;
      this.fade = 1;
      this.rigYawTarget = 0;
    }
    _finishGetup() {
      const g = this._getup;
      this._getup = null;
      this.death = null;
      this.anim = { name: "idle", t: 0, speed: 1, loop: true, opts: {} };
      this.prev = null;
      this.fade = 1;
      const n = g && g.next ? g.next : "idle";
      if (n !== "idle" && n !== "getup") this.setAnim(n, g.nextOpts || {});
      if (this._pendingOne) {
        const p = this._pendingOne;
        this._pendingOne = null;
        if (p.age < 1.2) this.playOneShot(p.name, p.opts);
      }
    }

    // ---------------------------------------------------------------
    // Weapons
    // ---------------------------------------------------------------
    /** Attach an Object3D (grip at origin, barrel toward -Z, up +Y) to the right hand. Returns the previous weapon. */
    setWeapon(obj, hold) {
      if (this._far) this._farExit();
      const old = this.weapon;
      if (old && old.parent) old.parent.remove(old);
      this.weapon = obj || null;
      this.holdType = null;
      this._muzzle = null;
      if (!obj) return old;
      const sock = this.sockets.gripR;
      if (!sock) {
        this.weapon = null;
        return old;
      }
      this.holdType = inferHold(obj, hold);
      sock.add(obj);
      obj.position.set(0, 0, 0);
      obj.rotation.set(0, 0, 0);
      if (this.meta && this.meta.weaponScale)
        obj.scale.setScalar(this.meta.weaponScale);
      obj.traverse((o) => {
        if (o.isMesh) o.castShadow = true;
      });
      // muzzle: explicit userData.muzzle (Object3D/Vector3) or the -Z end of the bounding box
      const um = obj.userData && obj.userData.muzzle;
      if (um && um.isObject3D) this._muzzle = { obj: um };
      else {
        obj.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(obj.matrixWorld).invert();
        const box = new THREE.Box3();
        obj.traverse((o) => {
          if (o.geometry) {
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
            box.union(
              o.geometry.boundingBox
                .clone()
                .applyMatrix4(
                  new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld),
                ),
            );
          }
        });
        this._muzzle = {
          local:
            um && um.isVector3
              ? um.clone()
              : box.isEmpty()
                ? new THREE.Vector3(0, 0.05, -0.4)
                : new THREE.Vector3(
                    0,
                    (box.min.y + box.max.y) / 2 +
                      (box.max.y - box.min.y) * 0.15,
                    box.min.z,
                  ),
        };
      }
      return old;
    }
    getHoldType() {
      return this.holdType;
    }
    /** World-space muzzle position & forward (weapon or built-in emitter). */
    getMuzzle(outPos, outDir) {
      // without out-params the result lives in per-character scratch vectors
      // (valid until the next getMuzzle call on this character) — no per-shot garbage
      if (!outPos) outPos = this._mzP || (this._mzP = new THREE.Vector3());
      if (!outDir) outDir = this._mzD || (this._mzD = new THREE.Vector3());
      this.root.updateMatrixWorld(true);
      if (this.weapon && this._muzzle) {
        if (this._muzzle.obj) this._muzzle.obj.getWorldPosition(outPos);
        else
          outPos.copy(this._muzzle.local).applyMatrix4(this.weapon.matrixWorld);
        this.weapon.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      } else if (this.sockets.muzzle) {
        this.sockets.muzzle.getWorldPosition(outPos);
        this.sockets.muzzle.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      } else if (this.sockets.eyes) {
        this.sockets.eyes.getWorldPosition(outPos);
        this.root.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      } else {
        this.parts.torso.getWorldPosition(outPos);
        this.root.getWorldQuaternion(_q1);
        outDir.set(0, 0, -1).applyQuaternion(_q1);
      }
      if (this.lookTarget) {
        outDir.subVectors(this.lookTarget, outPos).normalize();
      }
      const res = this._mzR || (this._mzR = { pos: null, dir: null });
      res.pos = outPos;
      res.dir = outDir;
      return res;
    }
    /** Detach the held weapon into the world with a little tumble; returns it. */
    dropWeapon() {
      const w = this.weapon;
      if (!w) return null;
      w.updateMatrixWorld(true);
      w.matrixWorld.decompose(_v1, _q1, _s1);
      if (w.parent) w.parent.remove(w);
      G.scene.add(w);
      w.position.copy(_v1);
      w.quaternion.copy(_q1);
      w.scale.copy(_s1);
      this.weapon = null;
      this.holdType = null;
      L.gibs.add(
        w,
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          2,
          (Math.random() - 0.5) * 2,
        ),
        4,
        { keep: true, radius: 0.05 },
      );
      return w;
    }

    // ---------------------------------------------------------------
    // Visual FX hooks
    // ---------------------------------------------------------------
    flash(color, dur) {
      if (this._far) this._farExit();
      this._flashColor.set(color === undefined ? 0xff3010 : color);
      this._flash = dur || 0.12;
      this._flashDur = this._flash;
    }
    setFlashing(on, color) {
      if (on && this._far) this._farExit();
      this._flashing = !!on;
      if (color !== undefined) this._flashingColor.set(color);
    }
    /** Targeting: glow one body part (or null to clear). */
    highlightPart(part, color) {
      const u = this.material.userData.uniforms;
      if (!part) {
        u.uHiPart.value = -1;
        return;
      }
      if (this._far) this._farExit(); // part highlighting must see the real rig
      const id = L.PART_IDS[part];
      u.uHiPart.value = id === undefined ? -1 : id;
      u.uHiColor.value
        .set(color === undefined ? 0x1aff60 : color)
        .multiplyScalar(0.55);
    }
    /** Laser/plasma disintegration: dissolve with glowing edges, leaves ash pile or goo puddle. */
    disintegrate(kind, dur) {
      if (this._dissolve) return;
      if (this._far) this._farExit();
      kind = kind === "goo" || kind === "plasma" ? "goo" : "ash";
      this._dissolve = { kind, t: 0, dur: dur || 1.6, left: false };
      this.material.userData.uniforms.uDissolveColor.value.set(
        kind === "goo" ? 0x46ff3a : 0xff7a20,
      );
      this._die("death", { dir: null }); // also makes a dormant/knocked-out body a permanent corpse
      this.mesh.castShadow = false;
    }
    setVisible(v) {
      this.hidden = !v;
      this.root.visible = !!v;
    }

    // ---------------------------------------------------------------
    // Hit testing (for combat / part targeting)
    // ---------------------------------------------------------------
    getPartWorldPos(part, out) {
      out = out || new THREE.Vector3();
      const m = this.parts[part] || this.parts.torso;
      this.root.updateMatrixWorld(true);
      return m.getWorldPosition(out);
    }
    /** Ray vs part capsules. Returns nearest {part, dist, point} or null. */
    raycast(origin, dir, maxDist) {
      maxDist = maxDist || 1e4;
      // quick reject with bounding sphere around root
      _v1.copy(this.root.position);
      _v1.y += this.height * 0.5;
      _v2.subVectors(_v1, origin);
      const tc = _v2.dot(dir);
      const d2 = _v2.lengthSq() - tc * tc;
      const R =
        Math.max(this.height, this.radius * 4) * 0.8 + (this.dead ? 2 : 0.5);
      if (d2 > R * R || tc < -R) return null;
      this.root.updateMatrixWorld(true);
      let best = null;
      for (const h of this.tpl.hit) {
        if (this._cutHides(h.bone)) continue;
        const bm = this.bones[h.bone].matrixWorld;
        _v3.set(h.a[0], h.a[1], h.a[2]).applyMatrix4(bm);
        _v4.set(h.b[0], h.b[1], h.b[2]).applyMatrix4(bm);
        const t = rayCapsule(origin, dir, _v3, _v4, h.r * (this.hitScale || 1));
        if (t !== null && t >= 0 && t <= maxDist && (!best || t < best.dist))
          best = {
            part: h.part,
            dist: t,
            point: new THREE.Vector3().copy(origin).addScaledVector(dir, t),
            character: this,
          };
      }
      return best;
    }
    _cutHides(bi) {
      for (const k in this.dismembered) {
        const cb = this.dismembered[k];
        let b = bi;
        while (b >= 0) {
          if (b === cb) return true;
          b = this.tpl.bones[b].parent;
        }
      }
      return false;
    }
    hasPart(part) {
      const bn = this.cut[part];
      const bi = bn !== undefined ? this.B[bn] : undefined;
      return !(bi !== undefined && this.dismembered[part] !== undefined);
    }

    // ---------------------------------------------------------------
    // Dismemberment
    // ---------------------------------------------------------------
    /**
     * Sever a part (head/leftArm/rightArm/leftLeg/rightLeg) or 'torso'/'all'
     * to explode the whole body. opts: {dir: Vector3 (impulse), explode: bool}
     * Returns the gib Object3Ds spawned.
     */
    dismember(part, opts) {
      opts = opts || {};
      if (this.disposed) return [];
      if (this._far) this._farExit();
      this.root.updateMatrixWorld(true);
      const goreC = GORE[this.gore] || GORE.red;
      const dir = opts.dir ? _v1.copy(opts.dir).normalize() : _v1.set(0, 0, 0);
      const gibs = [];
      if (part === "torso" || part === "all" || part === "body") {
        // full-body burst: the whole body comes apart
        const center = this.getPartWorldPos("torso", new THREE.Vector3());
        for (const p of ["head", "leftArm", "rightArm", "leftLeg", "rightLeg"])
          gibs.push(
            ...this.dismember(p, {
              dir: opts.dir,
              explode: p === "head" ? true : Math.random() < 0.4,
              quiet: true,
            }),
          );
        gibs.push(
          ...L.gibs.chunks(
            center,
            7 + Math.floor(Math.random() * 5),
            goreC,
            dir,
            this.gore === "oil",
            this.scale,
          ),
        );
        this.mesh.visible = false;
        this._exploded = true;
        if (this.weapon) this.dropWeapon();
        this._goreFx(center, dir, 3);
        return gibs;
      }
      const bn = this.cut[part];
      const bi = bn !== undefined ? this.B[bn] : undefined;
      if (bi === undefined || this.dismembered[part] !== undefined) return [];
      this.dismembered[part] = bi;
      const bone = this.bones[bi];
      bone.updateMatrixWorld(true);
      bone.matrixWorld.decompose(_v2, _q1, _s1);
      const jointPos = _v2.clone();
      if (opts.explode) {
        gibs.push(
          ...L.gibs.chunks(
            jointPos.clone().add(new THREE.Vector3(0, 0.1 * this.scale, 0)),
            5 + Math.floor(Math.random() * 4),
            goreC,
            dir,
            this.gore === "oil",
            this.scale,
          ),
        );
      } else {
        const geo = L.subtreeGeometry(this.tpl, bi, false);
        if (geo) {
          const m = new THREE.Mesh(geo, this._gibMaterial());
          m.castShadow = true;
          m.position.copy(jointPos);
          m.quaternion.copy(_q1);
          G.scene.add(m);
          const vel = new THREE.Vector3(
            (Math.random() - 0.5) * 2.5,
            2.5 + Math.random() * 2.5,
            (Math.random() - 0.5) * 2.5,
          ).addScaledVector(dir, 4 + Math.random() * 3);
          L.gibs.add(m, vel, 6 + Math.random() * 8, {
            radius: 0.08 * this.scale,
            goreColor: goreC,
            bleed: this.gore !== "oil",
          });
          gibs.push(m);
          // a raw end on the severed piece
          const cap = L.gibs.stumpMesh(
            goreC,
            0.055 * this.scale * ((this.meta && this.meta.bulk) || 1),
            this.gore === "oil",
          );
          m.add(cap);
        }
      }
      // stump on the parent bone
      const pb = this.tpl.bones[bi].parent;
      if (pb >= 0) {
        const st = L.gibs.stumpMesh(
          goreC,
          0.06 * this.scale * ((this.tpl.meta && this.tpl.meta.bulk) || 1),
          this.gore === "oil",
        );
        st.position.copy(bone.position);
        this.bones[pb].add(st);
        this._stumps.push(st);
      }
      if (this.weapon && part === "rightArm") this.dropWeapon();
      if (!opts.quiet) this._goreFx(jointPos, dir, part === "head" ? 2 : 1.4);
      // hide the severed subtree on the body THIS frame (the flying gib already
      // shows it) and force a full re-pose on the next tick regardless of anim LOD
      bone.scale.setScalar(1e-4);
      bone.updateMatrixWorld(true);
      this._acc = 1e3;
      return gibs;
    }
    /** Material for severed parts: same per-instance tint/grime/blood as the body. */
    _gibMaterial() {
      if (this._gibMat) return this._gibMat;
      const m = L.makeMaterial();
      const a = this.material.userData.uniforms,
        b = m.userData.uniforms;
      for (let i = 0; i < 6; i++) b.uTints.value[i].copy(a.uTints.value[i]);
      b.uDirt.value = a.uDirt.value;
      b.uBlood.value = Math.max(0.3, a.uBlood.value);
      b.uBloodColor.value.copy(a.uBloodColor.value);
      b.uFaceMap.value = a.uFaceMap.value;
      m.userData.gib = true;
      this._gibMat = m;
      return m;
    }
    _goreFx(pos, dir, amount) {
      try {
        if (G.isStub("fx")) return;
        if (this.gore === "oil") {
          G.fx.sparks && G.fx.sparks(pos);
          G.fx.smoke && G.fx.smoke(pos, 0.5);
        } else
          G.fx.blood &&
            G.fx.blood(
              pos,
              dir.lengthSq() > 0 ? dir : new THREE.Vector3(0, 1, 0),
              amount,
              this.gore === "green" ? 0x5a8a1a : undefined,
            );
      } catch (e) {
        /* fx optional */
      }
    }

    // ---------------------------------------------------------------
    // Update
    // ---------------------------------------------------------------
    /** Advance & pose. Called by the owner (combat) each frame; auto-called otherwise. */
    update(dt) {
      this._extFrame = G.time ? G.time.frame : 0;
      this._tick(dt || 0);
    }
    _tick(dt) {
      if (this.disposed) return;
      dt = clamp(dt, 0, 0.1);
      // ---- distance LOD: update less often far away ----
      const cam = G.camera ? G.camera.position : null;
      let d2 = 0;
      if (cam) {
        const dx = this.root.position.x - cam.x,
          dz = this.root.position.z - cam.z;
        d2 = dx * dx + dz * dz;
      }
      this._camD2 = d2;
      this._updateLod(d2);
      // close-up face texture (per template, LRU-cached) once the camera comes near
      if (this.face && d2 < 16 * 16 && (this._faceTexT -= dt) <= 0) {
        this._faceTexT = 0.5;
        this.ensureFaceTexture(false, d2);
      }
      const interval =
        d2 < 45 * 45
          ? 0
          : d2 < 90 * 90
            ? 1 / 20
            : d2 < 180 * 180
              ? 1 / 8
              : 1 / 3;
      this._acc += dt;
      this._measure(dt);
      if (this._far) {
        // frozen impostor (crowd far tier): only watch for movement
        if (this.speedM > 0.35) this._farExit();
        else {
          this._acc = Math.min(this._acc, 1);
          return;
        }
      }
      if (this._acc < interval && this._posed) return;
      const step = this._acc;
      this._acc = 0;
      this.mesh.castShadow =
        d2 < 60 * 60 && !this._dissolve && this._shadowOk !== false;
      this._advance(step);
      this._evaluate(step);
    }
    /** Swap to a simplified proxy mesh at distance (with a little hysteresis). */
    _updateLod(d2) {
      if (this.noLod) return;
      const cur = this._lod,
        D = this.lodDist;
      const band = cur === 0 || cur === 3 ? 1.0 : 0.9; // step back in a bit closer than we step out
      const d1 = D * band,
        dd2 = D * 2.6 * (cur === 2 ? 0.9 : 1.0);
      let want = d2 > dd2 * dd2 ? 2 : d2 > d1 * d1 ? 1 : 0;
      // faces: the full dialogue-grade head only within ~10 m; beyond that a
      // lightly simplified template (level 3) keeps the body but drops face detail
      if (want === 0 && this.face) {
        const fc = cur === 0 ? 11 : 9.5;
        if (d2 > fc * fc) want = 3;
      }
      if (want === cur) return;
      this._lod = want;
      this.mesh.geometry = L.getLod(this.tpl, want);
    }
    /** Force a LOD level (null = automatic). Debug / cut-scenes. */
    setLod(level) {
      if (level === null || level === undefined) {
        this.noLod = false;
        return;
      }
      this.noLod = true;
      this._lod = level;
      this.mesh.geometry = L.getLod(this.tpl, level);
    }
    /** Is the full close-up template active? */
    get closeLod() {
      return this._lod === 0;
    }
    /** Measure actual ground speed from root movement (drives gait phase). */
    _measure(dt) {
      const p = this.root.position;
      if (isNaN(this._lastPos.x)) {
        this._lastPos.copy(p);
        return;
      }
      const dx = p.x - this._lastPos.x,
        dz = p.z - this._lastPos.z;
      this._lastPos.copy(p);
      if (dt <= 0) return;
      const dist = Math.hypot(dx, dz);
      if (dist > 3) return; // teleport
      const yaw = this.root.rotation.y;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      // world → local (rotate by -yaw)
      const lx = dx * c - dz * s,
        lz = dx * s + dz * c;
      const v = dist / dt;
      this.speedM = lerp(this.speedM, v, 1 - Math.exp(-dt * 8));
      this.velLocal.x = lerp(this.velLocal.x, lx / dt, 1 - Math.exp(-dt * 8));
      this.velLocal.z = lerp(this.velLocal.z, lz / dt, 1 - Math.exp(-dt * 8));
      this._distAcc = (this._distAcc || 0) + dist * (lz > 0.3 * dist ? -1 : 1);
    }
    _nominalSpeed(name) {
      const g = this.gait;
      return name === "run"
        ? g.runSpeed
        : name === "sneak"
          ? g.walkSpeed * 0.6
          : name === "walk"
            ? g.walkSpeed
            : 0;
    }
    _advance(dt) {
      const a = this.anim;
      this.animT += dt;
      a.t += dt * a.speed;
      if (this.prev) {
        this.prev.t += dt * (this.prev.speed || 1);
        this.fade = Math.min(1, this.fade + dt / Math.max(0.01, this.fadeDur));
        if (this.fade >= 1) this.prev = null;
      }
      if (this.one) {
        this.one.t += dt;
        if (this.one.t >= this.one.dur) this.one = null;
      }
      if (this.face && this._lod === 0) this.face.update(dt);
      if (this._hitAdd) {
        this._hitAdd.t += dt;
        if (this._hitAdd.t > 0.4) this._hitAdd = null;
      }
      if (this.dead && a.name === "death") {
        if (
          this.death &&
          this.death.style === "blast" &&
          !this.death.moved &&
          a.t >= 0.86
        )
          this._landBlast();
        if (a.t > 4) {
          if (this.death && !this.death.moved) this._landBlast();
          a.name = "dead";
        }
      }
      if (
        this.dead &&
        !this._settleDone &&
        !this._dissolve &&
        (a.name === "dead" || a.t > 1.15) &&
        !(this.death && this.death.style === "blast" && !this.death.moved)
      ) {
        this._settleDone = true;
        try {
          this._settle = this._computeSettle();
        } catch (e) {
          this._settle = null;
        }
      }
      if (this._getup) {
        if (this._pendingOne) this._pendingOne.age += dt;
        if (a.name === "getup" && a.t >= this._getup.dur) this._finishGetup();
      }
      // gait phase
      const isLoco = A.LOCO[a.name];
      const g = this.gait;
      let v = this.speedM;
      const inPlace = a.opts && a.opts.inPlace;
      if (inPlace) v = this._nominalSpeed(a.name) * (a.speed || 1);
      const k =
        a.name === "sneak"
          ? 0
          : smooth(g.walkSpeed * 1.05, g.runSpeed * 0.85, v);
      const stepLen =
        lerp(g.walkStep, g.runStep, k) * (a.name === "sneak" ? 0.7 : 1);
      let dist = inPlace ? v * dt : Math.abs(this._distAcc || 0);
      const back =
        !inPlace &&
        this.velLocal.z > 0.35 &&
        this.velLocal.z > Math.abs(this.velLocal.x) * 0.6;
      this._distAcc = 0;
      if (isLoco) this.phase += (dist / (2 * stepLen)) * PI * 2;
      this._k = k;
      this._v = v;
      this._back = back;
      this.recoil *= Math.exp(-dt * 11);
      if (this._flash > 0) this._flash = Math.max(0, this._flash - dt);
      // rig yaw (death alignment)
      this.rigYaw = lerp(
        this.rigYaw,
        this.rigYawTarget,
        1 - Math.exp(-dt * 10),
      );
      // look-at smoothing
      let ty = 0,
        tp = 0;
      if (this.lookTarget && !this.dead) {
        const r = this.root;
        _v1.copy(this.lookTarget);
        r.worldToLocal(_v1);
        ty = Math.atan2(-_v1.x, -_v1.z);
        tp = Math.atan2(_v1.y - this.height * 0.9, Math.hypot(_v1.x, _v1.z));
        const lim = this.style.lookLimit || 1.25;
        if (Math.abs(ty) > 2.2) ty = 0; // behind: don't break the neck
        ty = clamp(ty, -lim, lim);
        tp = clamp(tp, -0.8, 0.8);
      }
      const ls = 1 - Math.exp(-dt * 7);
      this.lookYaw += (ty - this.lookYaw) * ls;
      this.lookPitch += (tp - this.lookPitch) * ls;
      // disintegration
      if (this._dissolve) {
        const d = this._dissolve;
        d.t += dt;
        const u = clamp(d.t / d.dur, 0, 1);
        this.material.userData.uniforms.uDissolve.value = u * 1.02;
        if (u > 0.55 && !d.left) {
          d.left = true;
          L.gibs.remains(this, d.kind);
        }
        if (u >= 1) this.mesh.visible = false;
      }
    }

    _evalBase(P, name, t, opts) {
      P.clear();
      if (name === "getup") return this._evalGetup(P, t);
      const W = this.W.bind(P),
        lib = this.lib;
      if (A.LOCO[name]) {
        const v = this._v,
          k = this._k;
        const inPlace = opts && opts.inPlace;
        if (name === "sneak") {
          const amt = inPlace ? 1 : smooth(0.05, 0.5, v);
          if (lib.gait) lib.gait(W, this, this.phase, 0, amt, true, this._back);
          else lib.idle(W, this.animT, this);
          return;
        }
        let amt = inPlace ? (name === "idle" ? 0 : 1) : smooth(0.08, 0.55, v);
        if (!inPlace && name === "idle" && v < 0.05) amt = 0;
        if (amt < 1) lib.idle(W, this.animT, this, opts);
        if (amt > 0 && lib.gait) {
          const T = this.poseT.clear();
          lib.gait(this.W.bind(T), this, this.phase, k, 1, false, this._back);
          P.blend(T, amt);
          this.W.bind(P);
        }
        return;
      }
      const fn = lib[name] || lib.idle;
      fn(
        W,
        name === "death" || name === "dead"
          ? t
          : name === "idle" ||
              name === "aim" ||
              name === "talk" ||
              name === "sit" ||
              name === "cower" ||
              name === "work"
            ? this.animT
            : t,
        this,
        opts || {},
      );
    }

    /**
     * Get-up: lying pose → push up to a kneel/crouch (lib.getupMid) → idle.
     * Blending Euler poses between these three keys reads as rolling over,
     * planting a knee and standing.
     */
    _evalGetup(P, t) {
      const g = this._getup,
        lib = this.lib;
      const dur = g ? g.dur : 1;
      const u = clamp(t / dur, 0, 1);
      (lib.dead || lib.idle)(this.W.bind(P), 12, this, {});
      const M = this.poseT.clear();
      if (lib.getupMid) lib.getupMid(this.W.bind(M), u, this);
      else lib.idle(this.W.bind(M), this.animT, this, {});
      P.blend(M, smooth(0.0, 0.5, u));
      const I = this.poseG.clear();
      lib.idle(this.W.bind(I), this.animT, this, {});
      P.blend(I, smooth(0.45, 1.0, u));
      this.W.bind(P);
    }

    _evaluate(dt) {
      const F = this.poseF;
      this._evalBase(F, this.anim.name, this.anim.t, this.anim.opts);
      if (this.prev && this.fade < 1) {
        this._evalBase(this.poseB, this.prev.name, this.prev.t, this.prev.opts);
        // F = lerp(prev, cur, fade)
        const fe = smooth(0, 1, this.fade);
        this.poseB.blend(F, fe);
        F.copy(this.poseB);
      }
      // one-shot layer
      if (this.one) {
        const o = this.one,
          lib = this.lib;
        const P = this.poseC.clear();
        // hunched creatures keep their stance under full-body one-shots (else a
        // colossus/brute would straighten up for every swing)
        if (
          !o.additive &&
          o.mask !== "upper" &&
          lib.stance &&
          (this.style.hunch > 0.2 || this.style.crouch)
        )
          lib.stance(this.W.bind(P), this);
        lib[o.name](this.W.bind(P), o.t * (o.speed || 1), this, o.opts);
        const u = o.t / o.dur;
        const mask = o.mask === "upper" ? this.upperMask : null;
        if (o.additive) F.add(P, 1, mask);
        else {
          const w = A.envelope(u, 0.12, 0.2);
          if (
            o.mask === "full" &&
            this.kind === "biped" &&
            A.LOCO[this.anim.name] &&
            this._v > 0.5
          ) {
            // attacking while moving: keep the legs walking
            F.blend(P, w, this.upperMask);
          } else F.blend(P, w, mask);
        }
      }
      if (this._hitAdd && this.lib.hit) {
        const P = this.poseC.clear();
        this.lib.hit(this.W.bind(P), this._hitAdd.t, this);
        F.add(P, 1);
      }
      // look-at (additive on spine/neck/head)
      if (
        !this.dead &&
        (Math.abs(this.lookYaw) > 1e-3 || Math.abs(this.lookPitch) > 1e-3)
      ) {
        const W = this.W.bind(F);
        const y = this.lookYaw,
          p = this.lookPitch;
        if (this.kind === "biped") {
          W.r("chest", 0, y * 0.3, 0);
          W.r("neck", p * 0.35, y * 0.25, 0);
          W.r("head", p * 0.5, y * 0.45, 0);
        } else if (this.kind === "quad") {
          W.r("neck", p * 0.4, y * 0.5, 0);
          W.r("head", p * 0.4, y * 0.4, 0);
        } else if (this.kind === "hover") {
          W.r("body", 0, y * 0.9, 0);
          for (let i = 1; i <= 3; i++) W.r("stalk" + i, p * 0.6, y * 0.1, 0);
          W.r("eye", p, 0, 0);
        } else W.r("head", p * 0.5, y * 0.6, 0);
      }
      // TRIGGER FINGER: with a gun in hand the index lies straight along the frame
      // (trigger discipline) and only goes onto the trigger when aiming; it
      // squeezes on each shot
      if (
        this.kind === "biped" &&
        this.weapon &&
        !this.dead &&
        this.B.fingI1R !== undefined
      ) {
        const h = this.holdType;
        if (h === "pistol" || h === "rifle" || h === "heavy") {
          const on =
            this.one &&
            (this.one.name === "attack_ranged" || this.one.name === "attack");
          const k = on ? 0.02 : this.aimFlag ? 0.13 : 0.42;
          const W = this.W.bind(F);
          W.r("fingI1R", 0, 0, k);
          W.r("fingI2R", 0, 0, k * 0.85);
        }
      }
      // ---- apply to bones ----
      const bones = this.bones,
        rot = F.rot,
        scl = F.scl;
      for (let i = 0; i < bones.length; i++) {
        const b = bones[i];
        b.rotation.set(rot[i * 3], rot[i * 3 + 1], rot[i * 3 + 2]);
        const sc = scl[i];
        if (sc !== 1 || b.scale.x !== 1) b.scale.setScalar(sc);
      }
      const r0 = bones[0];
      r0.position.set(
        this.rest[0].x + F.off[0],
        this.rest[0].y + F.off[1],
        this.rest[0].z + F.off[2],
      );
      if (this._headK !== 1 && this.B.head !== undefined)
        bones[this.B.head].scale.multiplyScalar(this._headK);
      for (const k in this.dismembered)
        bones[this.dismembered[k]].scale.setScalar(1e-4);
      if (this.face && !this.dismembered.head) this.face.apply();
      // corpse settle: the lying body tilts onto the sampled ground plane
      // (slopes, rubble, stairs) instead of floating/clipping
      if (this._settle) {
        const st = this._settle;
        st.k = Math.min(1, st.k + (dt || 0.016) / 0.4);
        _sq1.setFromAxisAngle(_yAxis, this.rigYaw);
        _sq2.identity().slerp(st.q, smooth(0, 1, st.k));
        this.rig.quaternion.copy(_sq2).multiply(_sq1);
        this.rig.position.y = st.dy * smooth(0, 1, st.k);
      } else this.rig.rotation.set(0, this.rigYaw, 0);
      // LIMB DRAPE: once the body has landed (and tilted onto the ground plane),
      // each limb (arms, legs, neck) swings about its root joint so the hand /
      // foot / head rests on the ground sampled under it (steps, kerbs, rubble)
      // instead of floating above it or sinking in; computed once, eased in
      if (
        this.dead &&
        this.kind === "biped" &&
        this._settleDone &&
        !this._dissolve &&
        (!this._settle || this._settle.k >= 1)
      ) {
        if (!this._drape && !this._drapeTry) {
          this._drapeTry = true;
          this.rig.updateMatrixWorld(true);
          try {
            this._drape = this._computeDrape();
          } catch (e) {
            this._drape = null;
          }
        }
        if (this._drape)
          for (const d of this._drape) {
            d.k = Math.min(1, d.k + (dt || 0.016) / 0.3);
            this.bones[d.bi].quaternion.premultiply(
              _sq3.identity().slerp(d.q, smooth(0, 1, d.k)),
            );
          }
      }
      // weapon visibility (holstered while sitting/working)
      if (this.weapon)
        this.weapon.visible = !(
          this.anim.name === "sit" ||
          this.anim.name === "work" ||
          this.anim.name === "cower"
        );
      // ---- IK: feet on uneven ground (stairs, rubble, slopes), then hands on the gun ----
      this.root.updateMatrixWorld(true);
      this._footIK(dt);
      this._ik(dt);
      // ---- material FX ----
      const u = this.material.userData.uniforms;
      if (this._flash > 0) {
        u.uFlash.value
          .copy(this._flashColor)
          .multiplyScalar((this._flash / (this._flashDur || 0.12)) * 0.9);
      } else if (this._flashing) {
        u.uFlash.value
          .copy(this._flashingColor)
          .multiplyScalar(0.25 + 0.2 * Math.sin(this.animT * 8));
      } else u.uFlash.value.setRGB(0, 0, 0);
      this._posed = true;
    }

    /**
     * Cheap foot IK: sample the ground under each foot (G.world.groundHeight),
     * drop the pelvis to the lower foot and shorten the other leg analytically
     * in its own bend plane (knee via law of cosines, thigh swings to keep the
     * foot under the hip, foot pitch preserved). Smoothed; skipped far away,
     * on flat ground, for corpses, sitting and non-plantigrade rigs.
     */
    _footIK(dt) {
      const B = this.B,
        W = G.world;
      const fi = this._fik || (this._fik = { l: 0, r: 0 });
      let tl = 0,
        tr = 0;
      const ok =
        this.kind === "biped" &&
        !this.dead &&
        !this._getup &&
        !this.noFootIK &&
        W &&
        typeof W.groundHeight === "function" &&
        B.thighL !== undefined &&
        B.footR !== undefined &&
        !this.hover &&
        this.root.parent &&
        (this._camD2 === undefined || this._camD2 < 40 * 40) &&
        this.anim.name !== "sit";
      const bones = this.bones;
      if (ok) {
        const ry = this.root.position.y,
          lim = 0.45 * this.scale;
        bones[B.footL].getWorldPosition(_v1);
        bones[B.footR].getWorldPosition(_v2);
        try {
          const gl = W.groundHeight(_v1.x, _v1.z, ry + 0.5, 0.06),
            gr = W.groundHeight(_v2.x, _v2.z, ry + 0.5, 0.06);
          if (isFinite(gl)) tl = clamp(gl - ry, -lim, lim);
          if (isFinite(gr)) tr = clamp(gr - ry, -lim, lim);
        } catch (e) {
          tl = tr = 0;
        }
      }
      // foot PITCH (toe vs heel sample) and ROLL (inner vs outer edge) to the
      // ground under each foot, only where it isn't flat and close enough to see
      let pl = 0,
        pr = 0,
        rl = 0,
        rr = 0;
      if (
        ok &&
        this._camD2 < 25 * 25 &&
        (Math.abs(tl) > 0.008 ||
          Math.abs(tr) > 0.008 ||
          Math.abs(fi.pl || 0) > 0.01 ||
          Math.abs(fi.pr || 0) > 0.01 ||
          Math.abs(fi.rl || 0) > 0.01 ||
          Math.abs(fi.rr || 0) > 0.01)
      ) {
        const yaw = this.root.rotation.y,
          fx = -Math.sin(yaw),
          fz = -Math.cos(yaw),
          ry = this.root.position.y;
        const sx = Math.cos(yaw),
          sz = -Math.sin(yaw); // character's local +X (right) in world
        const toe = 0.13 * this.scale,
          heel = 0.06 * this.scale,
          side = 0.045 * this.scale;
        const gh = (x, z) => W.groundHeight(x, z, ry + 0.5, 0.03);
        const slope = (p) => {
          try {
            const a = gh(p.x + fx * toe, p.z + fz * toe),
              b = gh(p.x - fx * heel, p.z - fz * heel);
            return isFinite(a) && isFinite(b)
              ? clamp(Math.atan2(a - b, toe + heel), -0.45, 0.45)
              : 0;
          } catch (e) {
            return 0;
          }
        };
        const roll = (p) => {
          try {
            const a = gh(p.x + sx * side, p.z + sz * side),
              b = gh(p.x - sx * side, p.z - sz * side);
            return isFinite(a) && isFinite(b)
              ? clamp(Math.atan2(a - b, side * 2), -0.3, 0.3)
              : 0; // (+: right edge higher → +z roll lifts it)
          } catch (e) {
            return 0;
          }
        };
        pl = slope(_v1);
        pr = slope(_v2);
        rl = roll(_v1);
        rr = roll(_v2);
      }
      const k = dt > 0 ? 1 - Math.exp(-dt * 14) : 0;
      fi.l += (tl - fi.l) * k;
      fi.r += (tr - fi.r) * k;
      fi.pl = (fi.pl || 0) + (pl - (fi.pl || 0)) * k;
      fi.pr = (fi.pr || 0) + (pr - (fi.pr || 0)) * k;
      fi.rl = (fi.rl || 0) + (rl - (fi.rl || 0)) * k;
      fi.rr = (fi.rr || 0) + (rr - (fi.rr || 0)) * k;
      if (B.footL !== undefined) {
        const f = bones[B.footL];
        if (Math.abs(fi.pl) > 0.004) f.rotation.x += fi.pl;
        if (Math.abs(fi.rl) > 0.004) f.rotation.z += fi.rl;
      }
      if (B.footR !== undefined) {
        const f = bones[B.footR];
        if (Math.abs(fi.pr) > 0.004) f.rotation.x += fi.pr;
        if (Math.abs(fi.rr) > 0.004) f.rotation.z += fi.rr;
      }
      if (Math.abs(fi.l) < 0.006 && Math.abs(fi.r) < 0.006) {
        if (
          Math.abs(fi.pl) > 0.004 ||
          Math.abs(fi.pr) > 0.004 ||
          Math.abs(fi.rl) > 0.004 ||
          Math.abs(fi.rr) > 0.004
        )
          this.root.updateMatrixWorld(true);
        return;
      }
      const sy = this.root.scale.y || 1;
      const drop = Math.min(0, fi.l, fi.r);
      const hips = bones[0];
      hips.position.y += drop / sy;
      hips.updateMatrixWorld(true);
      for (const [S, d] of [
        ["L", fi.l],
        ["R", fi.r],
      ]) {
        const dy = d - drop;
        if (dy < 0.004) continue;
        const th = bones[B["thigh" + S]],
          sh = bones[B["shin" + S]],
          ft = bones[B["foot" + S]];
        // digitigrade legs (thigh → shin → METATARSAL → toes): the
        // shin + metatarsal pair is treated as one rigid lower segment (knee →
        // foot distance in the CURRENT pose); the toes take the angle
        // compensation so they stay planted flat
        const mt = B["meta" + S] !== undefined ? bones[B["meta" + S]] : null;
        const a = sh.position.length();
        let b = ft.position.length();
        if (mt) {
          sh.getWorldPosition(_fH);
          ft.getWorldPosition(_fF);
          b = _fH.distanceTo(_fF) / (sy || 1);
        }
        th.getWorldPosition(_fH);
        ft.getWorldPosition(_fF);
        const Lc = _fH.distanceTo(_fF);
        _fF.y += dy;
        const Lt = clamp(
          _fH.distanceTo(_fF),
          Math.abs(a - b) + 0.05 * a,
          (a + b) * 0.999,
        );
        const lc = clamp(Lc, Math.abs(a - b) + 0.05 * a, (a + b) * 0.999);
        const knee = (L_) =>
          Math.acos(clamp((a * a + b * b - L_ * L_) / (2 * a * b), -1, 1));
        const hipA = (L_) =>
          Math.acos(clamp((a * a + L_ * L_ - b * b) / (2 * a * L_), -1, 1));
        const dK = knee(Lt) - knee(lc),
          dA = hipA(Lt) - hipA(lc);
        th.rotation.x += dA;
        sh.rotation.x += dK;
        ft.rotation.x -= dA + dK; // (digitigrade: the toes re-level, the rigid shin+meta swings)
        th.updateMatrixWorld(true);
      }
    }

    /** Two-bone IK for ranged weapon holds (aiming, low-ready, recoil, reload). */
    _ik(dt) {
      const B = this.B;
      const hold = this.holdType;
      const armR = this.bones[B.armR],
        foreR = this.bones[B.forearmR],
        handR = this.bones[B.handR];
      let want = 0;
      const an = this.anim.name;
      if (
        this.weapon &&
        RANGED[hold] &&
        armR &&
        !this.dead &&
        !this.dismembered.rightArm &&
        this.kind === "biped"
      ) {
        want = an === "sit" || an === "work" || an === "cower" ? 0 : 1;
        if (
          this.one &&
          (this.one.name === "throw" ||
            this.one.name === "attack_melee" ||
            this.one.name === "roar" ||
            this.one.name === "leap")
        )
          want = 0;
      }
      this.ikW += (want - this.ikW) * (1 - Math.exp(-(dt || 0.016) * 10));
      if (this.ikW < 0.01 || this._camD2 > 70 * 70) return;
      const w = this.ikW;
      const s = this.scale;
      const aiming =
        this.aimFlag ||
        an === "aim" ||
        this.animT - this.lastFire < 1.8 ||
        (this.one && this.one.name === "attack_ranged");
      // frame axes from the chest bone
      const chest = this.bones[B.chest];
      chest.matrixWorld.decompose(_v1, _q1, _s1);
      this.root.getWorldQuaternion(_q2);
      _fwd.set(0, 0, -1).applyQuaternion(_q2);
      _up.set(0, 1, 0);
      armR.getWorldPosition(_v2); // right shoulder
      // aim direction
      if (aiming && this.lookTarget) {
        _v3.copy(this.lookTarget).sub(_v2).normalize();
        _fwd.lerp(_v3, 1);
        _fwd.normalize();
      } else if (aiming) {
        _fwd.applyAxisAngle(
          _right.crossVectors(_fwd, _up).normalize(),
          this.lookPitch,
        );
      }
      let pitchDown = 0,
        yawLeft = 0;
      if (!aiming) {
        pitchDown = hold === "pistol" ? 1.15 : hold === "heavy" ? 0.2 : 0.55;
        yawLeft = hold === "pistol" ? 0.1 : hold === "heavy" ? 0.05 : 0.55;
      }
      // reload: tilt the weapon
      let rel = 0;
      if (this.one && this.one.name === "reload")
        rel = Math.sin(clamp(this.one.t / this.one.dur, 0, 1) * PI);
      pitchDown += rel * 0.35;
      pitchDown -= this.recoil * 0.12;
      _right.crossVectors(_fwd, _up).normalize();
      if (yawLeft) _fwd.applyAxisAngle(_up, yawLeft);
      _right.crossVectors(_fwd, _up).normalize();
      if (pitchDown) _fwd.applyAxisAngle(_right, -pitchDown);
      _fwd.normalize();
      _up.crossVectors(_right, _fwd).normalize();
      // grip & support targets
      if (hold === "pistol") {
        if (aiming) {
          _grip
            .copy(_v2)
            .addScaledVector(_fwd, 0.48 * s)
            .addScaledVector(_right, -0.14 * s)
            .addScaledVector(_up, -0.05 * s);
          _sup
            .copy(_grip)
            .addScaledVector(_right, -0.045 * s)
            .addScaledVector(_up, -0.03 * s)
            .addScaledVector(_fwd, -0.02 * s);
        } else {
          _grip
            .copy(_v2)
            .addScaledVector(_up, -0.5 * s)
            .addScaledVector(_fwd, 0.14 * s)
            .addScaledVector(_right, 0.02 * s);
          _sup.set(NaN, 0, 0);
        }
      } else if (hold === "heavy") {
        this.bones[B.hips].getWorldPosition(_v4);
        _grip
          .copy(_v4)
          .addScaledVector(_right, 0.2 * s)
          .addScaledVector(_up, 0.3 * s)
          .addScaledVector(
            _fwd,
            Math.max(
              0.22 * s,
              ((this.meta && this.meta.chestD) || 0.13) + 0.12 * s,
            ),
          );
        _sup
          .copy(_grip)
          .addScaledVector(_fwd, 0.34 * s)
          .addScaledVector(_up, 0.12 * s)
          .addScaledVector(_right, -0.12 * s);
      } else {
        // rifle / shotgun / smg / launcher
        const cd = (this.meta && this.meta.chestD) || 0.13 * s;
        if (aiming)
          _grip
            .copy(_v2)
            .addScaledVector(_fwd, Math.max(0.2 * s, cd + 0.1 * s))
            .addScaledVector(_up, -0.09 * s)
            .addScaledVector(_right, -0.05 * s);
        else
          _grip
            .copy(_v1)
            .addScaledVector(_right, 0.12 * s)
            .addScaledVector(_up, -0.06 * s)
            .addScaledVector(_fwd, Math.max(0.24 * s, cd + 0.14 * s));
        _sup
          .copy(_grip)
          .addScaledVector(_fwd, 0.33 * s)
          .addScaledVector(_up, 0.015 * s)
          .addScaledVector(_right, -0.025 * s);
      }
      _grip.addScaledVector(_fwd, -0.06 * s * this.recoil);
      if (rel > 0 && !isNaN(_sup.x)) {
        // left hand goes to the belt pouch and back
        this.bones[B.hips].getWorldPosition(_v4);
        _v4
          .addScaledVector(_right, -0.14 * s)
          .addScaledVector(_fwd, 0.14 * s)
          .addScaledVector(_up, 0.02 * s);
        const u = clamp(this.one.t / this.one.dur, 0, 1);
        const k = smooth(0.1, 0.35, u) * (1 - smooth(0.55, 0.85, u));
        _sup.lerp(_v4, k);
      }
      // weapon frame orientation: X=right, Y=up, Z=-fwd
      _m1.makeBasis(_right, _up, _v3.copy(_fwd).negate());
      _q3.setFromRotationMatrix(_m1); // weapon world quat
      const sock = this.sockets.gripR;
      // hand world quat = Qw * inv(Qsocket)
      _q1.copy(sock.quaternion).invert();
      const handQ = _q2.copy(_q3).multiply(_q1);
      // wrist target = grip - handQ * socketPos
      _wrist.copy(sock.position).applyQuaternion(handQ);
      _wrist.subVectors(_grip, _wrist);
      // pole: elbow down & out
      _pole
        .copy(_v2)
        .addScaledVector(_right, 0.35 * s)
        .addScaledVector(_up, -0.7 * s)
        .addScaledVector(_fwd, -0.1 * s);
      L.solveIK2(
        armR,
        foreR,
        _wrist,
        _pole,
        foreR.position.length(),
        handR.position.length(),
        w,
      );
      armR.updateMatrixWorld(true);
      foreR.matrixWorld.decompose(_v4, _q1, _s1);
      _q1.invert().multiply(handQ);
      handR.quaternion.slerp(_q1, w);
      handR.updateMatrixWorld(true);
      // left (support) hand
      const armL = this.bones[B.armL],
        foreL = this.bones[B.forearmL],
        handL = this.bones[B.handL];
      if (armL && !isNaN(_sup.x) && !this.dismembered.leftArm) {
        armL.getWorldPosition(_v4);
        const sockL = this.sockets.gripL;
        _q1.copy(sockL ? sockL.quaternion : sock.quaternion).invert();
        const hq = _q2.copy(_q3).multiply(_q1);
        _wrist.copy(sockL ? sockL.position : sock.position).applyQuaternion(hq);
        _wrist.subVectors(_sup, _wrist);
        _pole
          .copy(_v4)
          .addScaledVector(_right, -0.4 * s)
          .addScaledVector(_up, -0.7 * s);
        L.solveIK2(
          armL,
          foreL,
          _wrist,
          _pole,
          foreL.position.length(),
          handL.position.length(),
          w,
        );
        armL.updateMatrixWorld(true);
        foreL.matrixWorld.decompose(_v4, _q1, _s1);
        _q1.invert().multiply(hq);
        handL.quaternion.slerp(_q1, w);
        handL.updateMatrixWorld(true);
      }
    }

    // ---------------------------------------------------------------
    // Face API (no-ops on faceless rigs: robots, creatures, exo-rig helmets)
    // ---------------------------------------------------------------
    /** Lip-sync a line: opts {emotion, rate, utterance, dur}. Returns the estimated duration (s). */
    say(text, opts) {
      if (!this.face) {
        this.playOneShot("talk");
        return 0;
      }
      this.ensureFaceTexture(true);
      return this.face.say(text, opts);
    }
    /** Wordless mouth movement (barks, grunts) for `sec` seconds. */
    babble(sec) {
      if (this.face) this.face.babble(sec);
    }
    stopTalking() {
      if (this.face) this.face.stop();
    }
    isTalking() {
      return !!(this.face && this.face.isTalking());
    }
    /** Expression: neutral|happy|angry|afraid|sad|surprised|disgust|pain|maniac|smug (k 0..1, hold seconds). */
    setExpression(name, k, hold) {
      if (this.face) this.face.setEmotion(name, k, hold);
    }
    /** Resting mood the face returns to (k 0..1). */
    setMood(name, k) {
      if (this.face) this.face.setMood(name, k);
    }
    /** Eye contact: Vector3 | Object3D | null. */
    lookAtEyes(t) {
      if (this.face) this.face.focusOn(t);
    }
    /** Upgrade this character's face from the generic map to its own painted face texture. */
    ensureFaceTexture(force, d2) {
      if (!this.face || !L.faceTexFor) return;
      const t = L.faceTexFor(this.tpl, force, d2);
      const U = this.material.userData.uniforms;
      if (t && U.uFaceMap.value !== t) U.uFaceMap.value = t;
    }

    dispose() {
      if (this.disposed) return;
      if (this._far) this._farExit();
      this.disposed = true;
      LIVE.delete(this);
      if (this.weapon && this.weapon.parent)
        this.weapon.parent.remove(this.weapon);
      for (const st of this._stumps) {
        if (st.geometry && !st.geometry.userData.shared) st.geometry.dispose();
      }
      if (this.root.parent) this.root.parent.remove(this.root);
      this.material.dispose();
      this.skeleton.dispose();
      this.tpl.users = Math.max(0, (this.tpl.users || 1) - 1);
      if (L.templates.size > L.MAX_TEMPLATES) L.evictTemplates();
    }
  }
