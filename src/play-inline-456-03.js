// play-inline-456 03 — math
// Lines 377-890 of readable/play-inline-456.pretty.js (statement-aligned).
  class FaceCtl {
    constructor(ch) {
      this.ch = ch;
      const rig = (this.rig = ch.tpl.meta.faceRig);
      const B = ch.B,
        bn = (n) => (B[n] !== undefined ? ch.bones[B[n]] : null);
      this.hs = rig.hs || 1;
      this.bone = {
        head: bn("head"),
        jaw: bn("jaw"),
        lipU: bn("lipU"),
        eyeL: bn("eyeL"),
        eyeR: bn("eyeR"),
        lidL: bn("lidL"),
        lidR: bn("lidR"),
        lidLoL: bn("lidLoL"),
        lidLoR: bn("lidLoR"),
        browL: bn("browL"),
        browR: bn("browR"),
        mouthL: bn("mouthL"),
        mouthR: bn("mouthR"),
      };
      this.rest = {};
      for (const k of [
        "lipU",
        "browL",
        "browR",
        "mouthL",
        "mouthR",
        "eyeL",
        "eyeR",
      ])
        if (this.bone[k]) this.rest[k] = this.bone[k].position.clone();
      this.ok = !!(this.bone.eyeL && this.bone.lidL && this.bone.mouthL);
      // blinking
      this.blinkIn = rnd(0.5, 3);
      this.blinkT = -1;
      this.blinkDur = 0.17;
      this.double = false;
      // gaze
      this.gy = 0;
      this.gp = 0;
      this.ty = 0;
      this.tp = 0;
      this.fixT = 0;
      this.micro = [0, 0];
      this.microT = 0;
      this.glance = 0;
      this.glanceIn = rnd(2, 8);
      this.focus = null;
      this.contactPt = 0;
      this.contactT = 0;
      // expressions
      this.mood = emoName(rig.mood) || "neutral";
      this.moodK = rig.mood ? 0.55 : 0;
      this.emo = null;
      this.emoK = 0;
      this.emoHold = 0;
      this.cur = {};
      for (const k of EMO_KEYS) this.cur[k] = 0;
      this.pain = 0;
      // mouth
      this.mouth = { jaw: 0, wide: 0, round: 0, press: 0, up: 0 };
      this.speech = null;
      this.nod = 0;
      this.atRest = false;
    }

    // ---------------- public ----------------
    /** Lip-sync a line. opts: {emotion, rate, utterance (SpeechSynthesisUtterance), dur, hold} */
    say(text, opts) {
      opts = opts || {};
      const tr = visemeTrack(text, opts.rate || 1);
      const sp = (this.speech = {
        text: String(text || ""),
        keys: tr.keys,
        dur: opts.dur || tr.dur,
        t: 0,
        rate: opts.rate || 1,
        synced: false,
        waiting: false,
        ended: false,
        idx: 0,
      });
      const em = emoName(opts.emotion) || inferEmotion(text);
      if (em)
        this.setEmotion(
          em,
          opts.intensity || 0.85,
          Math.max(2.5, sp.dur + 1.5),
        );
      const u = opts.utterance;
      if (u && u.addEventListener) {
        sp.waiting = true;
        sp.waitT = 0;
        const self = this;
        const onStart = () => {
          if (self.speech !== sp) return;
          sp.waiting = false;
          sp.synced = true;
          sp.t = 0;
        };
        const onB = (e) => {
          if (self.speech !== sp) return;
          sp.waiting = false;
          sp.synced = true;
          const ci = e && typeof e.charIndex === "number" ? e.charIndex : -1;
          if (ci < 0) return;
          // jump the track to the first key at/after this character
          for (let i = 0; i < sp.keys.length; i++)
            if (sp.keys[i].ci >= ci) {
              if (Math.abs(sp.keys[i].t - sp.t) > 0.06) sp.t = sp.keys[i].t;
              break;
            }
        };
        const onEnd = () => {
          if (self.speech === sp) {
            sp.ended = true;
            sp.t = Math.max(sp.t, sp.dur);
          }
        };
        try {
          u.addEventListener("start", onStart);
          u.addEventListener("boundary", onB);
          u.addEventListener("end", onEnd);
          u.addEventListener("error", onEnd);
        } catch (e) {
          sp.waiting = false;
        }
      }
      return sp.dur;
    }
    /** Mouth moves with no text (combat barks, grunts). */
    babble(sec) {
      if (this.speech && !this.speech.babble && this.speech.t < this.speech.dur)
        return;
      const n = Math.max(3, Math.round((sec || 1.2) * 5));
      let s = "";
      const syl = [
        "ba",
        "ra",
        "go",
        "di",
        "ne",
        "to",
        "ma",
        "ha",
        "yo",
        "we",
        "ka",
      ];
      for (let i = 0; i < n; i++)
        s +=
          syl[(Math.random() * syl.length) | 0] +
          (Math.random() < 0.3 ? " " : "");
      this.say(s, { dur: sec || 1.2 });
      if (this.speech) this.speech.babble = true;
    }
    stop() {
      this.speech = null;
    }
    isTalking() {
      return !!(
        this.speech &&
        this.speech.t < this.speech.dur &&
        !this.speech.ended
      );
    }
    /** Blend to an expression (name, 0..1, seconds to hold before easing back to the resting mood). */
    setEmotion(name, k, hold) {
      const n = emoName(name);
      if (!n) return;
      this.emo = n;
      this.emoK = k === undefined ? 1 : clamp(k, 0, 1.3);
      this.emoHold = hold === undefined ? 1e9 : hold;
    }
    setMood(name, k) {
      this.mood = emoName(name) || "neutral";
      this.moodK = k === undefined ? 0.6 : k;
    }
    /** Eye contact target: Vector3 | Object3D (e.g. the camera) | null */
    focusOn(t) {
      this.focus = t || null;
      this.fixT = 0;
    }
    hurt(k) {
      this.pain = Math.min(1, this.pain + (k || 0.8));
      if (Math.random() < 0.7) this.blinkT = 0;
    }

    // ---------------- per frame ----------------
    update(dt) {
      if (!this.ok) return;
      const ch = this.ch;
      if (ch.dead) {
        this.speech = null;
        return;
      }
      // ---- speech
      const sp = this.speech;
      let tv = VIS.rest,
        w = 0,
        nv = null,
        blend = 0;
      if (sp) {
        if (sp.waiting) {
          sp.waitT += dt;
          if (sp.waitT > 0.6) sp.waiting = false;
        } // voice never started: run on our own clock
        else sp.t += dt;
        if (sp.t >= sp.dur || sp.ended) {
          if (!sp.ended || sp.t >= sp.dur) this.speech = null;
        } else {
          // find the current key
          const K = sp.keys;
          let i = sp.idx;
          if (i >= K.length || K[i].t > sp.t) i = 0;
          while (i + 1 < K.length && K[i + 1].t <= sp.t) i++;
          sp.idx = i;
          const k = K[i];
          if (k) {
            tv = VIS[k.v] || VIS.rest;
            w = k.w;
            const u = clamp((sp.t - k.t) / k.dur, 0, 1);
            if (K[i + 1] && u > 0.55) {
              nv = VIS[K[i + 1].v];
              blend = ((u - 0.55) / 0.45) * 0.5;
            } // co-articulation
            if (k.vowel && u < 0.3 && k.w > 1.05)
              this.nod = Math.max(this.nod, (k.w - 1) * 0.8);
          }
        }
      }
      const M = this.mouth,
        rate = 1 - Math.exp(-dt * 26);
      for (const key of ["jaw", "wide", "round", "press", "up"]) {
        let v = tv[key] * w;
        if (nv) v = lerp(v, nv[key], blend);
        M[key] += (v - M[key]) * rate;
      }
      this.nod *= Math.exp(-dt * 6);
      // ---- expressions: resting mood + transient emotion + pain
      if (this.emo) {
        this.emoHold -= dt;
        if (this.emoHold <= 0) {
          this.emoK -= dt * 0.8;
          if (this.emoK <= 0) {
            this.emo = null;
            this.emoK = 0;
          }
        }
      }
      this.pain *= Math.exp(-dt * 1.6);
      const mood = EMO[this.mood] || EMO.neutral,
        emo = this.emo ? EMO[this.emo] : null,
        pain = EMO.pain;
      const er = 1 - Math.exp(-dt * 5);
      for (const k of EMO_KEYS) {
        let v = (mood[k] || 0) * this.moodK;
        if (emo)
          v =
            lerp(v, emo[k] || 0, clamp(this.emoK, 0, 1)) +
            (this.emoK > 1 ? (emo[k] || 0) * (this.emoK - 1) : 0);
        if (this.pain > 0.01) v = lerp(v, pain[k] || 0, this.pain);
        this.cur[k] += (v - this.cur[k]) * er;
      }
      // ---- blinks
      const afraid = this.emo === "afraid" ? this.emoK : 0;
      if (this.blinkT >= 0) {
        this.blinkT += dt;
        if (this.blinkT > this.blinkDur) {
          this.blinkT = -1;
          if (this.double) {
            this.double = false;
            this.blinkIn = 0.08;
          } else this.blinkIn = rnd(2, 6) * (1 - afraid * 0.5);
        }
      } else {
        this.blinkIn -= dt;
        if (this.blinkIn <= 0) {
          this.blinkT = 0;
          this.blinkDur = rnd(0.14, 0.2);
          this.double = Math.random() < 0.14;
        }
      }
      // ---- gaze
      this._gaze(dt);
    }

    _gaze(dt) {
      const ch = this.ch,
        B = this.bone;
      this.fixT -= dt;
      this.microT -= dt;
      if (this.microT <= 0) {
        this.microT = rnd(0.25, 0.6);
        this.micro[0] = rnd(-0.012, 0.012);
        this.micro[1] = rnd(-0.01, 0.01);
      }
      // who are we looking at?
      let target = null;
      const cam = G.camera;
      if (this.focus)
        target = this.focus.isObject3D
          ? this.focus.getWorldPosition(_t)
          : this.focus;
      else if (ch.lookTarget) target = ch.lookTarget;
      else if (cam && ch._camD2 !== undefined && ch._camD2 < 49) {
        // glance at a nearby player now and then
        this.glanceIn -= dt;
        if (this.glance > 0) {
          this.glance -= dt;
          target = cam.position;
        } else if (this.glanceIn <= 0) {
          this.glance = rnd(1, 3.2);
          this.glanceIn = rnd(4, 11);
        }
      }
      let ty = this.ty,
        tp = this.tp,
        ok = false;
      if (target && B.head) {
        _m.copy(B.head.matrixWorld).invert();
        _v.copy(target).applyMatrix4(_m);
        const eye = this.rest.eyeL;
        // eye contact: alternate between the viewer's two eyes and mouth (tiny offsets)
        if (
          target === (cam && cam.position) ||
          (this.focus && this.focus === cam)
        ) {
          this.contactT -= dt;
          if (this.contactT <= 0) {
            this.contactT = rnd(0.35, 1.4);
            this.contactPt =
              Math.random() < 0.18 ? 2 : this.contactPt === 0 ? 1 : 0;
          }
        }
        const ey = eye ? eye.y : 0,
          ez = eye ? eye.z : 0;
        const dx = _v.x,
          dy = _v.y - ey,
          dz = _v.z - ez;
        const hd = Math.hypot(dx, dz);
        let yaw = Math.atan2(-dx, -dz),
          pit = Math.atan2(dy, hd);
        if (this.contactT > 0 && target === (cam && cam.position)) {
          const d = Math.max(0.3, Math.hypot(dx, dy, dz));
          yaw +=
            (this.contactPt === 0 ? 0.032 : this.contactPt === 1 ? -0.032 : 0) /
            d;
          pit += (this.contactPt === 2 ? -0.06 : 0) / d;
        }
        if (Math.abs(yaw) < 1.0 && pit > -0.6 && pit < 0.55) {
          ty = clamp(yaw, -0.55, 0.55);
          tp = clamp(pit, -0.35, 0.3);
          ok = true;
          this.vergeD = Math.hypot(dx, dy, dz);
        }
      }
      if (!ok) {
        this.vergeD = 6;
        // wandering fixations
        if (this.fixT <= 0) {
          this.fixT = rnd(0.6, 2.6);
          const talking = this.isTalking();
          ty = rnd(-0.28, 0.28) * (talking ? 0.5 : 1);
          tp = rnd(-0.14, 0.08);
          if (Math.random() < 0.35) {
            ty = 0;
            tp = 0;
          }
        }
      }
      // big shifts sometimes trigger a blink (natural)
      if (
        Math.abs(ty - this.ty) + Math.abs(tp - this.tp) > 0.28 &&
        this.blinkT < 0 &&
        Math.random() < 0.35
      ) {
        this.blinkT = 0;
        this.blinkDur = rnd(0.13, 0.17);
      }
      this.ty = ty;
      this.tp = tp;
      const k = 1 - Math.exp(-dt * 30); // saccades are fast
      this.gy += (ty + this.micro[0] - this.gy) * k;
      this.gp += (tp + this.micro[1] - this.gp) * k;
    }

    /** Write face bones (after the body pose was applied). */
    apply() {
      if (!this.ok) return;
      const B = this.bone,
        R = this.rest,
        rig = this.rig,
        hs = this.hs,
        E = this.cur,
        M = this.mouth;
      const ch = this.ch;
      // far away: park the rig at rest once
      if (ch._lod > 0 && !ch.dead) {
        if (!this.atRest) {
          this._restPose();
          this.atRest = true;
        }
        return;
      }
      this.atRest = false;
      if (ch.dead) {
        this._deadPose();
        return;
      }
      // blink curve: fast close, slower open
      let blink = 0;
      if (this.blinkT >= 0) {
        const u = this.blinkT / this.blinkDur;
        blink =
          u < 0.4
            ? Math.sin(((u / 0.4) * Math.PI) / 2)
            : Math.cos((((u - 0.4) / 0.6) * Math.PI) / 2);
        blink = blink * blink * (3 - 2 * blink);
      }
      const close = rig.lidOpen + rig.lidLow + 0.06;
      const wideEyes = E.lidU;
      for (const [S, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        // eyes (slight vergence toward close targets)
        const verg =
          clamp(0.032 / Math.max(0.25, this.vergeD || 6), 0, 0.09) * -sg;
        const eye = B["eye" + S];
        if (eye) eye.rotation.set(this.gp, this.gy + verg, 0);
        // upper lid: follows gaze pitch, expression, blink
        const lid = B["lid" + S];
        if (lid) {
          const open = clamp(
            this.gp * 0.6 + wideEyes - this.pain * 0.1,
            -close * 0.6,
            0.4,
          );
          lid.rotation.set(
            open * (1 - blink) - blink * close,
            this.gy * 0.12,
            0,
          );
        }
        const lo = B["lidLo" + S];
        if (lo)
          lo.rotation.set(
            E.lidLo * 0.55 + this.gp * 0.25 + blink * 0.1 + this.pain * 0.05,
            this.gy * 0.08,
            0,
          );
        // brows
        const br = B["brow" + S],
          rb = R["brow" + S];
        if (br && rb) {
          br.position.set(
            rb.x - sg * E.bIn * 0.0035 * hs,
            rb.y + E.bY * 0.0068 * hs,
            rb.z + Math.max(0, -E.bY) * 0.002 * hs,
          );
          br.rotation.set(0, 0, sg * E.bRot * 0.2);
        }
        // mouth corners: expression + viseme width / rounding
        const mc = B["mouth" + S],
          rm = R["mouth" + S];
        if (mc && rm) {
          const out = E.cX * 0.0035 + M.wide * 0.004 - M.round * 0.0062;
          mc.position.set(
            rm.x + sg * out * hs,
            rm.y + (E.cY * 0.0042 + M.wide * 0.0008) * hs,
            rm.z + (E.cZ * 0.003 - M.round * 0.0045) * hs,
          );
        }
      }
      if (B.lipU && R.lipU)
        B.lipU.position.set(
          R.lipU.x,
          R.lipU.y + (E.lipU * 0.0028 + M.up * 0.0016 - M.press * 0.0012) * hs,
          R.lipU.z - M.round * 0.003 * hs,
        );
      if (B.jaw)
        B.jaw.rotation.x -= Math.max(-0.02, M.jaw + E.jaw - M.press * 0.01);
      if (B.head && this.nod > 0.001) B.head.rotation.x += -this.nod * 0.05;
    }
    _restPose() {
      const B = this.bone,
        R = this.rest;
      for (const k of [
        "eyeL",
        "eyeR",
        "lidL",
        "lidR",
        "lidLoL",
        "lidLoR",
        "browL",
        "browR",
      ])
        if (B[k]) B[k].rotation.set(0, 0, 0);
      for (const k in R) if (B[k]) B[k].position.copy(R[k]);
    }
    _deadPose() {
      const B = this.bone,
        rig = this.rig;
      const close = rig.lidOpen + rig.lidLow;
      for (const S of ["L", "R"]) {
        if (B["lid" + S]) B["lid" + S].rotation.set(-close * 0.72, 0, 0);
        if (B["eye" + S]) B["eye" + S].rotation.set(0.25, 0, 0); // eyes rolled up under half-shut lids
      }
      if (B.jaw) B.jaw.rotation.x -= 0.1;
    }
  }
