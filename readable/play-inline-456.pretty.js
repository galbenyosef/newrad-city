/* src/characters/15_face_anim.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: facial animation (L.FaceCtl)
 * Owned by: characters.
 *
 * Drives the face rig built by 22_face.js (eyeL/R, lidL/R, lidLoL/R,
 * browL/R, mouthL/R, lipU + jaw) on top of the body pose:
 *
 *  • TALK DRIVER: text → viseme track (closed m/b/p, open a, wide e/i,
 *    round o/u/w, f/v, th, generic consonant) with co-articulation, stressed
 *    syllables, pauses at punctuation and tiny head nods. When the line is
 *    spoken through speechSynthesis, the utterance's `boundary` events
 *    re-sync the track to the actual word being voiced ('start'/'end' gate
 *    it); otherwise it runs on its own clock.
 *    Hooked automatically to ui_interact's `dialogueNode` event; also
 *    `char.say(text, {emotion})`, `char.babble(sec)` (combat barks).
 *  • BLINKS every 2–6 s (double blinks, blink on big gaze shifts, faster
 *    when afraid), lids follow the gaze pitch.
 *  • EYES: fixations & saccades with micro-saccades; eye contact with the
 *    camera in dialogue (alternating between the viewer's eyes and mouth,
 *    with vergence), glances at a nearby player, else wandering.
 *  • EXPRESSIONS: neutral, happy, angry, afraid, sad, surprised, disgust,
 *    pain, maniac — blended brow/lid/mouth/jaw presets, selectable per
 *    dialogue node (node.emotion|mood|face|expression) or inferred from the
 *    line, with a per-template resting mood (raiders scowl).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib) return;
  const L = G.chars._lib;
  const clamp = L.clamp,
    lerp = L.lerp;

  // ------------------------------------------------------------------
  // Visemes: jaw (radians), wide / round (0..1), press (lips together), up (upper-lip raise)
  // ------------------------------------------------------------------
  const VIS = {
    rest: { jaw: 0.0, wide: 0, round: 0, press: 0, up: 0 },
    closed: { jaw: -0.01, wide: 0.05, round: 0, press: 1, up: 0 },
    open: { jaw: 0.16, wide: 0.15, round: 0, press: 0, up: 0.45 },
    wide: { jaw: 0.065, wide: 1, round: 0, press: 0, up: 0.55 },
    round: { jaw: 0.1, wide: -0.3, round: 1, press: 0, up: 0.15 },
    fv: { jaw: 0.035, wide: 0.2, round: 0, press: 0.25, up: 0.8 },
    th: { jaw: 0.07, wide: 0.45, round: 0, press: 0, up: 0.35 },
    mid: { jaw: 0.075, wide: 0.3, round: 0.1, press: 0, up: 0.3 },
    sh: { jaw: 0.06, wide: -0.1, round: 0.7, press: 0, up: 0.5 },
  };
  const LETTER = {
    a: "open",
    e: "wide",
    i: "wide",
    y: "wide",
    o: "round",
    u: "round",
    w: "round",
    q: "round",
    r: "round",
    m: "closed",
    b: "closed",
    p: "closed",
    f: "fv",
    v: "fv",
    s: "mid",
    z: "mid",
    t: "mid",
    d: "mid",
    n: "mid",
    c: "mid",
    k: "mid",
    g: "mid",
    j: "sh",
    x: "mid",
    h: "open",
    l: "th",
  };
  const VOWEL = { a: 1, e: 1, i: 1, o: 1, u: 1, y: 1 };
  const CPS = 14.5; // characters per second at speech rate 1

  /** Text → [{t, dur, v, w, ci}] viseme keys (+ total duration). */
  function visemeTrack(text, rate) {
    const keys = [];
    const s = String(text || "")
      .toLowerCase()
      .replace(/\*[^*]*\*/g, " ")
      .replace(/\[[^\]]*\]/g, " ");
    const base = 1 / (CPS * (rate || 1));
    let t = 0.06,
      stress = 1;
    for (let i = 0; i < s.length; i++) {
      const c = s[i],
        n = s[i + 1] || "";
      if (c === " " || c === "\n" || c === "\t") {
        keys.push({ t, dur: base * 0.6, v: "rest", w: 0.5, ci: i });
        t += base * 0.6;
        stress = 0.75 + Math.random() * 0.5;
        continue;
      }
      if (c === "," || c === ";" || c === ":" || c === "-" || c === "—") {
        keys.push({ t, dur: 0.24, v: "rest", w: 1, ci: i });
        t += 0.24;
        continue;
      }
      if (c === "." || c === "!" || c === "?") {
        keys.push({ t, dur: 0.4, v: "rest", w: 1, ci: i, stop: true });
        t += 0.4;
        continue;
      }
      let v = null,
        len = 1,
        dur = base;
      const dg = c + n;
      if (dg === "th") {
        v = "th";
        len = 2;
      } else if (dg === "sh" || dg === "ch") {
        v = "sh";
        len = 2;
      } else if (dg === "oo" || dg === "ou" || dg === "ow") {
        v = "round";
        len = 2;
        dur *= 1.6;
      } else if (dg === "ee" || dg === "ea") {
        v = "wide";
        len = 2;
        dur *= 1.6;
      } else v = LETTER[c] || null;
      if (!v) {
        if (/[0-9]/.test(c)) v = "mid";
        else continue;
      }
      if (VOWEL[c]) dur *= 1.35;
      else if (v === "closed" || v === "fv") dur *= 1.1;
      else dur *= 0.8;
      keys.push({
        t,
        dur,
        v,
        w: VOWEL[c] ? stress : 0.85,
        ci: i,
        vowel: !!VOWEL[c],
      });
      t += dur;
      i += len - 1;
    }
    // TIMING: speech runs at a roughly constant SYLLABLE rate, not a constant
    // letter rate ("strengths" ≈ "idea" in time). Re-time the articulated keys
    // so the line lasts syllables / 4.3 per second (× rate) + its pauses — the
    // clock used when the voice gives no word-boundary events (or no voice).
    let syl = 0,
      pause = 0,
      art = 0;
    const words = s.match(/[a-z']+/g) || [];
    for (const w of words) {
      const g = w.replace(/e$/, "").match(/[aeiouy]+/g);
      syl += Math.max(1, g ? g.length : 1);
    }
    for (const k of keys) {
      if (k.v === "rest" && k.w >= 1) pause += k.dur;
      else art += k.dur;
    }
    if (art > 0 && syl > 0) {
      const f = clamp(syl / (4.3 * (rate || 1)) / art, 0.6, 1.7);
      let tt = 0.06;
      for (const k of keys) {
        if (!(k.v === "rest" && k.w >= 1)) k.dur *= f;
        k.t = tt;
        tt += k.dur;
      }
      t = tt;
    }
    return { keys, dur: t + 0.1 };
  }
  L.visemeTrack = visemeTrack;

  // ------------------------------------------------------------------
  // Expression presets (unit-less; FaceCtl scales them by head size)
  //   cY/cX/cZ: mouth corners up / out / back · bY: brows up · bIn: brows
  //   pull together · bRot: inner brow DOWN (+) / up (−) · lidU: upper lids
  //   open (+) / squint (−) · lidLo: lower lids up · lipU: upper lip raise
  // ------------------------------------------------------------------
  const EMO = {
    neutral: {},
    happy: {
      cY: 1,
      cX: 0.7,
      cZ: 0.5,
      bY: 0.25,
      lidU: -0.06,
      lidLo: 0.16,
      jaw: 0.02,
      lipU: 0.25,
    },
    angry: {
      cY: -0.35,
      cX: -0.25,
      bY: -0.65,
      bIn: 0.8,
      bRot: 1,
      lidU: -0.1,
      lidLo: 0.12,
      lipU: 0.35,
    },
    afraid: {
      cY: -0.35,
      cX: 0.75,
      bY: 0.95,
      bIn: 0.45,
      bRot: -0.9,
      lidU: 0.22,
      lidLo: -0.04,
      jaw: 0.08,
    },
    sad: { cY: -0.85, cX: -0.1, bY: 0.2, bIn: 0.25, bRot: -1, lidU: -0.14 },
    surprised: { bY: 1.25, lidU: 0.28, jaw: 0.2, cX: -0.25 },
    disgust: {
      lipU: 0.9,
      cY: -0.45,
      bY: -0.4,
      bIn: 0.45,
      bRot: 0.4,
      lidLo: 0.18,
      lidU: -0.08,
    },
    pain: {
      bY: -0.25,
      bIn: 0.9,
      bRot: -0.55,
      lidU: -0.3,
      lidLo: 0.16,
      jaw: 0.12,
      cX: 0.8,
      cY: -0.35,
      lipU: 0.7,
    },
    maniac: {
      lipU: 1.1,
      cY: -0.5,
      cX: 0.6,
      bY: -0.6,
      bIn: 1,
      bRot: 1,
      lidU: 0.12,
      jaw: 0.1,
    },
    smug: { cY: 0.55, cX: 0.3, cZ: 0.3, bY: 0.1, lidU: -0.12, lidLo: 0.08 },
  };
  const EMO_KEYS = [
    "cY",
    "cX",
    "cZ",
    "bY",
    "bIn",
    "bRot",
    "lidU",
    "lidLo",
    "jaw",
    "lipU",
  ];
  const ALIAS = {
    joy: "happy",
    glad: "happy",
    friendly: "happy",
    smile: "happy",
    laugh: "happy",
    mad: "angry",
    hostile: "angry",
    rage: "angry",
    furious: "angry",
    fear: "afraid",
    scared: "afraid",
    nervous: "afraid",
    worried: "afraid",
    terrified: "afraid",
    sorrow: "sad",
    grief: "sad",
    upset: "sad",
    shock: "surprised",
    shocked: "surprised",
    surprise: "surprised",
    disgusted: "disgust",
    hurt: "pain",
    calm: "neutral",
    none: "neutral",
    default: "neutral",
    sly: "smug",
    cocky: "smug",
  };
  function emoName(n) {
    if (!n) return null;
    n = String(n).toLowerCase();
    n = ALIAS[n] || n;
    return EMO[n] ? n : null;
  }
  L.FACE_EMOTIONS = Object.keys(EMO);

  /** Cheap sentiment guess for dialogue lines with no explicit emotion. */
  function inferEmotion(text) {
    const s = String(text || "").toLowerCase();
    if (!s) return null;
    const has = (re) => re.test(s);
    if (
      has(
        /\b(kill|die|dead meat|shut up|get out|scram|beat it|idiot|moron|damn you|bastard|how dare|back off|last warning)\b/,
      )
    )
      return "angry";
    if (
      has(
        /\b(please|help|don't hurt|don't shoot|scared|afraid|oh god|run|they're coming|monsters?|hide)\b/,
      )
    )
      return "afraid";
    if (
      has(
        /\b(sorry|lost|gone|miss (him|her|them)|alone|funeral|passed away|dead now|nobody left|weep)\b/,
      )
    )
      return "sad";
    if (
      has(/\b(what\?!|really\?!|no way|impossible|you're kidding|holy)\b/) ||
      /\?!|!\?/.test(s)
    )
      return "surprised";
    if (
      has(
        /\b(ha(ha)+|thanks|thank you|great|wonderful|welcome|friend|glad|perfect|excellent|lovely|pleasure|swell|nifty|good to see)\b/,
      )
    )
      return "happy";
    if (has(/\b(disgusting|gross|smell|stink|filth|vile)\b/)) return "disgust";
    return null;
  }
  L.inferEmotion = inferEmotion;

  // ------------------------------------------------------------------
  // speechSynthesis: remember the last utterance so dialogueNode can bind
  // its word-boundary events to the speaker's mouth.
  // ------------------------------------------------------------------
  let lastUtt = null;
  (function hookSpeech() {
    try {
      const ss = window.speechSynthesis;
      if (!ss || ss.__fnyFaceHook) return;
      const orig = ss.speak;
      if (typeof orig !== "function") return;
      ss.speak = function (u) {
        try {
          lastUtt = { u, at: performance.now() };
        } catch (e) {
          /* ignore */
        }
        return orig.apply(ss, arguments);
      };
      ss.__fnyFaceHook = true;
    } catch (e) {
      /* speech is optional */
    }
  })();
  L.takeRecentUtterance = function (maxAgeMs) {
    if (!lastUtt || performance.now() - lastUtt.at > (maxAgeMs || 250))
      return null;
    const u = lastUtt.u;
    lastUtt = null;
    return u;
  };

  // ------------------------------------------------------------------
  // FaceCtl
  // ------------------------------------------------------------------
  const _m = new THREE.Matrix4(),
    _v = new THREE.Vector3(),
    _t = new THREE.Vector3();
  const rnd = (a, b) => a + Math.random() * (b - a);

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
  L.FaceCtl = FaceCtl;
  L.FACE_VISEMES = Object.keys(VIS);

  // ------------------------------------------------------------------
  // Dialogue hook (ui_interact emits dialogueStart / dialogueNode / dialogueEnd)
  // ------------------------------------------------------------------
  // The line to lip-sync, best source first: text passed WITH the event
  // (ui_interact: emit('dialogueNode', id, nodeId, actor, {text, emotion}) or
  // a string), the rendered line, and only then the tree node (whose text()
  // may be randomised and so differ from what is on screen).
  function lineFor(id, nodeId, actor, info) {
    if (typeof info === "string" && info) return info;
    if (info && typeof info.text === "string" && info.text) return info.text;
    try {
      const el = document.querySelector(".dlg-wrap .dlg-line");
      if (el && el.textContent) return el.textContent;
    } catch (e) {
      /* no DOM */
    }
    try {
      const tree = G.dialogue && G.dialogue.get && G.dialogue.get(id);
      const n = tree && tree.nodes && tree.nodes[nodeId];
      if (n)
        return typeof n.text === "function"
          ? String(n.text(actor) || "")
          : String(n.text || "");
    } catch (e) {
      /* ignore */
    }
    return "";
  }
  /** Comparable form of a line: letters only, lower case, first 40. */
  const normLine = (t) =>
    String(t || "")
      .toLowerCase()
      .replace(/\*[^*]*\*/g, "")
      .replace(/\[[^\]]*\]/g, "")
      .replace(/[^a-z]/g, "")
      .slice(0, 40);
  function nodeEmotion(id, nodeId, actor, info) {
    if (info && typeof info === "object" && info.emotion)
      return typeof info.emotion === "function"
        ? info.emotion(actor)
        : info.emotion;
    try {
      const tree = G.dialogue && G.dialogue.get && G.dialogue.get(id);
      const n = tree && tree.nodes && tree.nodes[nodeId];
      if (!n) return null;
      let e = n.emotion || n.mood || n.face || n.expression;
      if (typeof e === "function") e = e(actor);
      return e || null;
    } catch (e) {
      return null;
    }
  }
  const charOf = (actor) =>
    actor &&
    (actor.char ||
      (actor.root && actor.root.userData && actor.root.userData.character) ||
      (actor.isCharacter ? actor : null));
  L.hookFaceEvents = function () {
    if (L._faceHooked || !G.events || !G.events.on) return;
    L._faceHooked = true;
    G.events.on("dialogueStart", (actor) => {
      const ch = charOf(actor);
      if (!ch || !ch.face) return;
      ch.face.focusOn(G.camera || null);
      if (ch.ensureFaceTexture) ch.ensureFaceTexture();
    });
    G.events.on("dialogueNode", (id, nodeId, actor, info) => {
      const ch = charOf(actor);
      if (!ch || !ch.face) return;
      let text = lineFor(id, nodeId, actor, info);
      let u = L.takeRecentUtterance(400);
      // only bind an utterance that is voicing THIS line (a late/previous
      // node's utterance would drive the wrong mouth shapes)
      if (u && text) {
        let ut = "";
        try {
          ut = u.text || "";
        } catch (e) {
          ut = "";
        }
        const a = normLine(ut),
          b = normLine(text);
        if (a && b && a.slice(0, 16) !== b.slice(0, 16)) u = null;
      }
      // the voiced text is the reference for boundary charIndex values
      // (ui_interact strips *actions* / [notes] and collapses whitespace)
      if (u) {
        try {
          if (u.text) text = u.text;
        } catch (e) {
          /* keep */
        }
      }
      let rate = 1;
      try {
        if (u && u.rate) rate = u.rate;
      } catch (e) {
        /* ignore */
      }
      ch.face.focusOn(G.camera || null);
      ch.face.say(text, {
        emotion: nodeEmotion(id, nodeId, actor, info),
        utterance: u,
        rate,
      });
      if (ch.face.speech)
        ch.face.speech.node = String(id) + ":" + String(nodeId);
    });
    G.events.on("dialogueEnd", (actor) => {
      const ch = charOf(actor);
      if (!ch || !ch.face) return;
      ch.face.stop();
      ch.face.focusOn(null);
      if (ch.face.emo) ch.face.emoHold = Math.min(ch.face.emoHold, 1.5);
    });
  };
  try {
    L.hookFaceEvents();
  } catch (e) {
    /* events hooked again from init */
  }
})();
