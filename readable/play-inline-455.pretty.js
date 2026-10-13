/* src/characters/10_anim.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: procedural animation library
 * Owned by: characters.
 *
 * Every animation is a pure function  fn(o, t, ch)  that ADDS Euler
 * rotations (radians) per bone through the writer `o`:
 *     o.r('thighL', x, y, z)   o.off(x, y, z) (root-bone translation)
 *     o.s('thrust', scale)     (per-bone uniform scale; 1 = rest)
 * Missing bones are ignored, so one library serves many body plans.
 * The controller (50_character.js) evaluates base + previous (cross-
 * fade) + one-shot layers, blends buffers, adds look-at and IK.
 *
 * Bone conventions (bind pose = identity rotations):
 *   limbs hang along -Y: +X swings the limb FORWARD (toward -Z);
 *   knees bend with -X, elbows with +X, feet: +X = toes up;
 *   spine/neck/head point +Y: +X leans BACK / looks UP; +Y turns LEFT;
 *   abduction: z = side * angle  (side = -1 left, +1 right).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.chars || !G.chars._lib) return;
  const L = G.chars._lib;
  const clamp = L.clamp,
    lerp = L.lerp,
    smooth = L.smooth;
  const PI = Math.PI;
  const SIDES = [
    ["L", -1],
    ["R", 1],
  ];

  const A = (L.anim = {});

  // ------------------------------------------------------------------
  // Pose buffers & writer
  // ------------------------------------------------------------------
  class Pose {
    constructor(n) {
      this.n = n;
      this.rot = new Float32Array(n * 3);
      this.scl = new Float32Array(n).fill(1);
      this.off = new Float32Array(3);
    }
    clear() {
      this.rot.fill(0);
      this.scl.fill(1);
      this.off[0] = this.off[1] = this.off[2] = 0;
      return this;
    }
    copy(p) {
      this.rot.set(p.rot);
      this.scl.set(p.scl);
      this.off.set(p.off);
      return this;
    }
    /** this = lerp(this, p, w) for all bones (or only bones where mask[i]) */
    blend(p, w, mask) {
      if (w <= 0) return this;
      if (w >= 1 && !mask) return this.copy(p);
      const r = this.rot,
        q = p.rot;
      for (let i = 0; i < this.n; i++) {
        if (mask && !mask[i]) continue;
        const k = i * 3;
        r[k] += (q[k] - r[k]) * w;
        r[k + 1] += (q[k + 1] - r[k + 1]) * w;
        r[k + 2] += (q[k + 2] - r[k + 2]) * w;
        this.scl[i] += (p.scl[i] - this.scl[i]) * w;
      }
      if (!mask || mask.root)
        for (let k = 0; k < 3; k++) this.off[k] += (p.off[k] - this.off[k]) * w;
      return this;
    }
    /** this += p * w (additive layer; offsets too) */
    add(p, w, mask) {
      if (w <= 0) return this;
      for (let i = 0; i < this.n; i++) {
        if (mask && !mask[i]) continue;
        const k = i * 3;
        this.rot[k] += p.rot[k] * w;
        this.rot[k + 1] += p.rot[k + 1] * w;
        this.rot[k + 2] += p.rot[k + 2] * w;
      }
      if (!mask || mask.root)
        for (let k = 0; k < 3; k++) this.off[k] += p.off[k] * w;
      return this;
    }
  }
  A.Pose = Pose;

  class Writer {
    constructor(ch) {
      this.ch = ch;
      this.B = ch.B;
      this.p = null;
    }
    bind(p) {
      this.p = p;
      return this;
    }
    r(name, x, y, z) {
      const i = this.B[name];
      if (i === undefined) return;
      const k = i * 3,
        a = this.p.rot;
      a[k] += x || 0;
      a[k + 1] += y || 0;
      a[k + 2] += z || 0;
    }
    off(x, y, z) {
      const o = this.p.off;
      o[0] += x || 0;
      o[1] += y || 0;
      o[2] += z || 0;
    }
    s(name, v) {
      const i = this.B[name];
      if (i === undefined) return;
      this.p.scl[i] *= v;
    }
    has(name) {
      return this.B[name] !== undefined;
    }
  }
  A.Writer = Writer;

  // ------------------------------------------------------------------
  // Shared maths helpers for animations
  // ------------------------------------------------------------------
  /** damped spring from a→b starting at t0: overshoots then settles */
  const spr = (A.spr = function (t, t0, a, b, freq, damp) {
    if (t <= t0) return a;
    const tau = t - t0;
    return (
      b + (a - b) * Math.exp(-(damp || 6) * tau) * Math.cos((freq || 14) * tau)
    );
  });
  /** 0→1 ramps */
  const ramp = (A.ramp = (t, a, b) => clamp((t - a) / (b - a), 0, 1));
  const easeIn = (x) => x * x;
  const easeOut = (x) => 1 - (1 - x) * (1 - x);
  const easeIO = (x) => x * x * (3 - 2 * x);
  /** smooth pseudo-random noise over time (per character seed) */
  const tn = (A.tn = function (t, seed) {
    return (
      Math.sin(t * 1.13 + seed) * 0.5 +
      Math.sin(t * 2.71 + seed * 1.7) * 0.3 +
      Math.sin(t * 5.3 + seed * 3.1) * 0.2
    );
  });
  /** one-shot envelope: fade in over a, out over b (fractions of duration) */
  A.envelope = function (u, a, b) {
    return Math.min(smooth(0, a, u), 1 - smooth(1 - b, 1, u));
  };

  // ==================================================================
  //  BIPED  (humans, Maniacs, brutes, colossus, patrolmen,
  //          strikers, thinkers, bulwarks)
  // ==================================================================
  const BI = (A.biped = {});

  /** Base posture shared by idle & gait (hunch, arm splay). */
  function posture(o, ch, amt) {
    const s = ch.style;
    const h = s.hunch * amt;
    o.r("spine", -h * 0.45, 0, 0);
    o.r("chest", -h * 0.35, 0, 0);
    const nk = s.neckK === undefined ? 1 : s.neckK; // < 1: head thrust forward & low (crawlers) instead of held level
    o.r("neck", h * 0.45 * nk, 0, 0);
    o.r("head", h * 0.35 * nk, 0, 0);
    for (const [S, sg] of SIDES) {
      o.r("arm" + S, s.armFwd * amt, 0, sg * s.armOut * amt);
      o.r("forearm" + S, s.elbow * amt, 0, 0);
      o.r("shoulder" + S, 0, 0, sg * (s.shrug || 0) * amt);
    }
  }

  BI.posture = posture;
  /**
   * FINGERS (humans & Maniacs: fing1 = knuckles, fing2 = middle joints).
   * c > 0 closes toward a fist, c < 0 opens the hand flat, 0 = the bind
   * pose (relaxed grip that wraps a weapon handle).
   */
  function fingers(o, S, sg, c) {
    if (!c) return;
    const a = c > 0 ? 0.8 : 0.5,
      b = c > 0 ? 1.0 : 0.75;
    o.r("fing1" + S, 0, 0, -sg * a * c);
    o.r("fing2" + S, 0, 0, -sg * b * c);
    o.r("fingI1" + S, 0, 0, -sg * a * c);
    o.r("fingI2" + S, 0, 0, -sg * b * c); // index follows (own bones: trigger / pointing)
  }
  BI.fingers = fingers;
  A.fingers = fingers;
  /** Unarmed hands: 0 while a weapon/tool is held (the bind grip wraps it). */
  const freeHand = (ch) => !ch.weapon;
  /** Hip drop that keeps the feet on the ground for the bent-knee `crouch` stance. */
  const crouchDrop = (ch, cr) => ch.legLen * 0.92 * (1 - Math.cos(cr * 0.5));
  /** Stance-only pose for hunched creatures under full-body one-shots (attacks, roars):
   *  keeps the hunch, arm hang and bent knees so the silhouette doesn't pop upright. */
  BI.stance = function (o, ch) {
    const s = ch.style;
    posture(o, ch, 1);
    const cr = s.crouch || 0;
    if (cr) {
      for (const [S] of SIDES) {
        o.r("thigh" + S, cr * 0.5, 0, 0);
        o.r("shin" + S, -cr, 0, 0);
        o.r("foot" + S, cr * 0.5, 0, 0);
      }
      o.off(0, -crouchDrop(ch, cr), 0);
    }
  };

  // ------------------------------------------------------------------
  // IDLE ATTITUDES (humans standing about, unarmed): arms crossed,
  // hands on hips, hands clasped behind the back, one hand on the hip. Each
  // character prefers one (from its seed, or opts.idle) and drifts between
  // it and the relaxed hang every half a minute or so, so a crowd never
  // stands in one identical mannequin pose.
  // ------------------------------------------------------------------
  const IDLE_STYLES = ["relaxed", "crossed", "hips", "behind", "hip1"];
  A.IDLE_STYLES = IDLE_STYLES;
  function idleStyleOf(ch) {
    if (ch._idleStyle !== undefined) return ch._idleStyle;
    let st = 0;
    const o = ch.opts || {},
      info = ch.info || {};
    const human =
      ch.B &&
      ch.B.handL !== undefined &&
      ch.B.forearmL !== undefined &&
      !info.isRobot &&
      !info.isCreature &&
      !(ch.tpl && ch.tpl.meta && ch.tpl.meta.power);
    if (typeof o.idle === "string" && IDLE_STYLES.indexOf(o.idle) >= 0)
      st = IDLE_STYLES.indexOf(o.idle);
    else if (human && o.idle !== false) {
      const r = (((ch.seed || 1) * 2246822519) >>> 0) % 100;
      st = r < 34 ? 0 : r < 56 ? 1 : r < 70 ? 2 : r < 86 ? 3 : 4;
    }
    if (!human) st = 0;
    ch._idleStyle = st;
    return st;
  }
  A.idleStyleOf = idleStyleOf;
  function idleArm(o, S, sg, style, w, br) {
    const b = br * 0.015;
    // hands: tucked (crossed) / fists (hips) / clasped (behind) / relaxed
    fingers(
      o,
      S,
      sg,
      (style === 1
        ? 0.35
        : style === 2 || (style === 4 && sg > 0)
          ? 0.95
          : style === 3
            ? 0.6
            : 0) * w,
    );
    if (style === 1) {
      // arms crossed: right forearm over the left
      const hi = sg > 0 ? 1 : 0;
      o.r("arm" + S, (0.22 + hi * 0.06 + b) * w, sg * 1.05 * w, -sg * 0.06 * w);
      o.r("forearm" + S, (1.7 - hi * 0.08) * w, 0, 0);
      o.r("hand" + S, -0.05 * w, sg * 0.1 * w, 0);
      o.r("shoulder" + S, 0.04 * w, 0, sg * 0.03 * w);
    } else if (style === 2 || (style === 4 && sg > 0)) {
      // fists on the hips, elbows out
      // (XYZ Euler: a y-twist after abduction would swing the elbow forward,
      // so the forearm is bent medially with its own z instead)
      o.r("arm" + S, (-0.28 + b) * w, 0, sg * 0.72 * w);
      o.r("forearm" + S, 0.25 * w, 0, -sg * 1.45 * w);
      o.r("hand" + S, 0.2 * w, 0, -sg * 0.35 * w);
    } else if (style === 3) {
      // hands clasped behind the back
      o.r("arm" + S, (-0.42 + b) * w, 0, sg * 0.12 * w);
      o.r("forearm" + S, -0.1 * w, 0, -sg * 1.62 * w);
      o.r("hand" + S, 0, 0, -sg * 0.2 * w);
      o.r("shoulder" + S, -0.05 * w, 0, 0);
    } else if (style === 4) {
      // other arm of the one-hand-on-hip stance: relaxed but a touch forward
      o.r("arm" + S, 0.06 * w, 0, 0);
      o.r("forearm" + S, 0.25 * w, sg * 0.25 * w, 0);
      o.r("hand" + S, 0.08 * w, sg * 0.2 * w, sg * 0.1 * w);
    }
  }

  BI.idle = function (o, t, ch) {
    const s = ch.style,
      sd = ch.seedPhase;
    posture(o, ch, 1);
    // attitude weight: only while actually idling unarmed (talk/aim/etc. reuse idle)
    const style = idleStyleOf(ch);
    let aw = 0;
    if (style && !ch.weapon && ch.anim && ch.anim.name === "idle" && !ch.dead) {
      const per = 26 + ((sd * 37) % 18),
        ph = ((t + sd * 11) / per) % 1;
      aw = smooth(0.04, 0.12, ph) * (1 - smooth(0.8, 0.88, ph));
      if (ch._idleHold) aw = 1;
    }
    const br = Math.sin(t * (s.wild ? 3.2 : 1.7) * (s.heavy ? 0.7 : 1) + sd);
    const sway = Math.sin(t * 0.45 + sd * 2);
    const stiff = s.stiff ? 0.25 : 1;
    // CONTRAPPOSTO weight shift: settle on one leg for several seconds, then
    // the other (hips shift over the standing leg and drop on the free side,
    // shoulders counter-tilt, the free knee relaxes)
    const cp = s.hunch > 0.3 || s.crouch || s.digitigrade || s.heavy ? 0.35 : 1;
    const ws = Math.tanh(2.4 * Math.sin(t * 0.11 + sd * 3.7)) * cp * stiff;
    const shift = ws * 0.026 * ch.scale;
    o.off(
      sway * 0.008 * stiff * ch.scale + shift,
      br * 0.004 * ch.scale - Math.abs(ws) * 0.006 * ch.scale,
      0,
    );
    o.r(
      "hips",
      0,
      0.02 * Math.sin(t * 0.3 + sd) * stiff + ws * 0.05,
      sway * 0.012 * stiff - ws * 0.05,
    );
    o.r(
      "spine",
      br * 0.012 * stiff,
      -ws * 0.03,
      -sway * 0.01 * stiff + ws * 0.035,
    );
    o.r("chest", br * 0.028 * stiff, -ws * 0.02, ws * 0.025);
    // head: slow look-around (+ twitchy for Maniacs)
    let hy = tn(t * 0.25, sd) * 0.25 * stiff,
      hx = tn(t * 0.2, sd + 4) * 0.06 * stiff;
    if (s.wild) {
      hy += Math.sin(t * 7 + sd) * 0.06 * (Math.sin(t * 0.9) > 0.6 ? 1 : 0);
      hx += 0.05 * Math.sin(t * 11) * (Math.sin(t * 1.3 + 2) > 0.7 ? 1 : 0);
    }
    o.r("neck", hx * 0.4, hy * 0.4, 0);
    o.r("head", hx * 0.6, hy * 0.6, tn(t * 0.15, sd + 9) * 0.04 * stiff);
    for (const [S, sg] of SIDES) {
      // legs: slight splay, soft knees, weight shift
      const w = sg * sway;
      const free = Math.max(0, -sg * ws); // this leg carries no weight → knee relaxes
      const cr = s.crouch || 0; // bent-knee stance (crouched rigs): thigh forward, shin back, foot flat
      o.r(
        "thigh" + S,
        0.04 + free * 0.1 + (s.digitigrade ? 0.35 : 0) + cr * 0.5,
        0,
        sg * (0.035 + s.stance) -
          sway * 0.012 * stiff -
          shift / Math.max(0.3, ch.legLen) +
          ws * 0.05,
      );
      o.r(
        "shin" + S,
        -0.07 -
          free * 0.2 -
          Math.max(0, w) * 0.03 * stiff -
          (s.digitigrade ? 0.9 : 0) -
          cr,
        0,
        0,
      );
      o.r("meta" + S, s.digitigrade ? 0.75 : 0, 0, 0);
      o.r(
        "foot" + S,
        0.03 + free * 0.1 - (s.digitigrade ? 0.2 : 0) + cr * 0.5,
        0,
        -sg * 0.03 - ws * 0.05,
      );
      // crab/robot pincers idly open & close
      if (s.pincers)
        o.r(
          "pincer" + S,
          -(
            0.12 +
            0.14 * Math.max(0, Math.sin(t * (1.1 + sg * 0.17) + sd + sg))
          ),
          0,
          0,
        );
      // relaxed arms: hang close to the body, soft elbows, palms turned in to
      // the thighs, a little breathing in the shoulders
      const rw = 1 - aw;
      o.r(
        "arm" + S,
        (0.03 * br * stiff - 0.02) * rw,
        0,
        (sg * br * 0.01 * stiff - sg * ws * 0.03) * rw,
      );
      o.r("forearm" + S, (0.08 + 0.03 * br * stiff) * rw, sg * 0.25 * rw, 0);
      o.r("hand" + S, 0.08 * rw, sg * 0.2 * rw, sg * 0.1 * rw);
      // a relaxed hanging hand is half open (not clutching an invisible grip);
      // the fingers drift a little with the breath
      if (freeHand(ch))
        fingers(
          o,
          S,
          sg,
          (-0.3 - 0.06 * Math.sin(t * 0.37 + sd + sg)) * rw +
            (s.wild ? 0.5 : 0),
        );
      o.r("shoulder" + S, 0, 0, sg * (0.012 * br + 0.01) * stiff);
      if (aw > 0) idleArm(o, S, sg, style, aw, br);
      if (s.wild) o.r("hand" + S, 0.3, 0, 0);
    }
    // tails sway
    for (let i = 1; i <= 4; i++)
      o.r(
        "tail" + i,
        -0.05 + 0.03 * Math.sin(t * 1.3 + i * 0.7),
        0.08 * Math.sin(t * 0.9 - i * 0.6 + sd),
        0,
      );
    if (!ch.face) o.r("jaw", -(0.03 + 0.03 * Math.max(0, br)), 0, 0); // faces breathe through FaceCtl
    if (s.crouch) o.off(0, -crouchDrop(ch, s.crouch), 0);
  };

  /**
   * Gait: ph = gait phase (radians), k = 0 walk … 1 run, amt = 0..1 blend in.
   * Foot plants come from phase being driven by distance travelled.
   */
  BI.gait = function (o, ch, ph, k, amt, sneak, back) {
    const s = ch.style,
      sc = ch.scale;
    posture(o, ch, 1);
    const dir = back ? -1 : 1;
    const heavy = s.heavy ? 1 : 0,
      stiff = s.stiff ? 1 : 0;
    // EXO-RIG: a walking tank — planted, wide steps with a hard heel
    // strike (the whole frame drops on impact), a locked torso that barely
    // counter-rotates, short stiff arm swing and knees that stay bent
    const pw = s.power ? 1 : 0;
    const trk = s.tracked ? 0 : 1; // tank treads (thinker, bulwark): no pelvis bob / hip swing
    const am = amt === undefined ? 1 : amt; // amplitude (0 = static stance, used by sneak-idle)
    const A_th =
      lerp(0.4, 0.78, k) *
      s.stride *
      (sneak ? 0.65 : 1) *
      (1 - stiff * 0.3) *
      (1 - pw * 0.18) *
      am;
    const K = lerp(0.8, 1.7, k) * (1 - heavy * 0.35) * (1 - stiff * 0.45) * am;
    const bob = lerp(0.028, 0.06, k) * sc * (1 + heavy * 0.6) * am;
    const sneakH = sneak ? 1 : 0;
    // pelvis (power: sharp drop at each foot plant instead of a smooth bounce)
    const bobW = pw
      ? 0.5 -
        Math.pow(Math.abs(Math.cos(ph)), 6) * 1.6 -
        Math.abs(Math.sin(ph)) * 0.3
      : -Math.abs(Math.sin(ph)) + 0.5;
    o.off(
      0,
      (bobW * bob * 1.4 -
        sneakH * 0.27 * ch.hipH -
        k * 0.03 * sc -
        pw * 0.025 * sc) *
        trk,
      sneakH * 0.04 * sc * trk,
    );
    o.r(
      "hips",
      0,
      -0.11 *
        Math.sin(ph) *
        (1 - k * 0.3) *
        dir *
        (1 - stiff * 0.5) *
        (1 - pw * 0.55) *
        am *
        trk,
      0.045 * Math.cos(ph) * (1 + heavy) * (1 - stiff * 0.5) * am * trk,
    );
    o.r(
      "spine",
      -(0.04 + 0.2 * k) - sneakH * 0.32 - pw * 0.06,
      0.05 * Math.sin(ph) * dir * (1 - pw * 0.7) * am,
      0,
    );
    o.r(
      "chest",
      -0.02 * k - sneakH * 0.12,
      0.13 * Math.sin(ph) * dir * (1 - stiff * 0.7) * (1 - pw * 0.75) * am,
      -0.02 * Math.cos(ph) * am,
    );
    o.r("neck", 0.06 * k + sneakH * 0.25, -0.05 * Math.sin(ph) * dir * am, 0);
    o.r(
      "head",
      0.08 * k + sneakH * 0.2 + 0.02 * Math.cos(ph * 2),
      -0.04 * Math.sin(ph) * dir,
      0,
    );
    for (const [S, sg] of SIDES) {
      const p = ph + (sg > 0 ? PI : 0);
      const sw = Math.sin(p) * dir,
        cw = Math.cos(p);
      // swing = leg moving forward (derivative of sin > 0 in walk direction)
      const swing = Math.max(0, cw);
      const th =
        A_th * sw +
        lerp(0.02, 0.22, k) +
        sneakH * 0.55 +
        (s.digitigrade ? 0.4 : 0);
      let kn =
        -(0.06 + K * Math.pow(swing, 1.3)) -
        k * 0.3 * Math.max(0, -cw) * Math.max(0, sw + 0.3) -
        sneakH * 0.95 -
        pw * 0.14;
      if (back)
        kn =
          -(0.06 + K * 0.8 * Math.pow(Math.max(0, -cw), 1.3)) - sneakH * 0.95;
      const cr = s.crouch || 0;
      o.r(
        "thigh" + S,
        th + cr * 0.5,
        0,
        sg * (0.02 + s.stance) + (heavy ? sg * 0.04 : 0),
      );
      if (s.digitigrade) {
        o.r("shin" + S, kn * 0.6 - 0.9, 0, 0);
        o.r("meta" + S, 0.75 + kn * -0.35, 0, 0);
        o.r(
          "foot" + S,
          -0.2 - (th + kn * 0.6 - 0.9 + 0.75) * 0.4 + 0.3 * swing,
          0,
          0,
        );
      } else {
        o.r("shin" + S, kn - cr, 0, 0);
        if (s.pincers)
          o.r("pincer" + S, -0.1 - 0.1 * Math.max(0, Math.sin(p)), 0, 0);
        const toeOff =
          -0.45 * Math.max(0, -sw) * Math.max(0, cw + 0.2) * (1 - stiff);
        const heel =
          0.18 *
          Math.max(0, sw) *
          Math.max(0, -cw + 0.2) *
          (1 - stiff) *
          (1 + pw * 0.8);
        o.r(
          "foot" + S,
          -(th + kn) * 0.85 +
            toeOff * (1 - pw * 0.6) +
            heel +
            sneakH * 0.3 +
            cr * 0.5,
          0,
          0,
        );
        if (pw) o.r("thigh" + S, 0, 0, sg * 0.05);
      }
      // arms: opposite phase to same-side leg
      const armA = lerp(0.32, 0.7, k) * s.armSwing * (sneak ? 0.4 : 1) * am;
      o.r(
        "arm" + S,
        -armA * Math.sin(ph + (sg > 0 ? PI : 0)) * dir +
          k * 0.1 +
          sneakH * 0.25,
        0,
        sg * (0.02 + k * 0.08),
      );
      o.r(
        "forearm" + S,
        lerp(0.18, 1.45, k) +
          0.25 * Math.max(0, Math.sin(ph + (sg > 0 ? 0 : PI))) * (0.5 + k) +
          sneakH * 0.6,
        0,
        0,
      );
      o.r("hand" + S, 0.08, 0, 0);
      if (pw) {
        o.r("arm" + S, 0.06, 0, sg * 0.1);
        o.r("forearm" + S, 0.15, 0, 0);
      }
      // hands: half open on a walk, loosely closed at a run, clawing for Maniacs
      if (freeHand(ch))
        fingers(o, S, sg, s.wild ? 0.4 : lerp(-0.25, 0.55, k) * am);
      if (s.wild) {
        o.r("arm" + S, 0.25 + 0.2 * Math.sin(p * 2 + sg), 0, sg * 0.15);
        o.r("hand" + S, 0.4, 0, 0);
      }
    }
    for (let i = 1; i <= 4; i++)
      o.r("tail" + i, 0.04 * k, 0.12 * Math.sin(ph - i * 0.8) * (1 + k), 0);
    o.r("jaw", -(0.05 + k * 0.15 * Math.abs(Math.sin(ph))), 0, 0);
    if (s.crouch) o.off(0, -crouchDrop(ch, s.crouch), 0);
    // crabs waddle: extra side-to-side roll
    if (s.waddle) {
      o.r("hips", 0, 0, s.waddle * Math.cos(ph) * am);
      o.r("chest", 0, 0, -s.waddle * 0.6 * Math.cos(ph) * am);
    }
  };

  // --- one-shots & static poses ---------------------------------------
  BI.attack_melee = function (o, t, ch, opts) {
    const s = ch.style,
      hold = ch.holdType,
      dur = ch.one ? ch.one.dur : 0.6;
    const u = clamp(t / dur, 0, 1);
    const alt = ch.attackAlt; // alternate side for creatures
    if (s.claws) {
      // Maniacs / strikers: raking swipe(s)
      const S = alt ? "L" : "R",
        sg = alt ? -1 : 1;
      const wind = easeIO(ramp(u, 0, 0.35)),
        strike = easeOut(ramp(u, 0.35, 0.6));
      const ax = lerp(lerp(0.2, 2.3, wind), 0.1, strike);
      o.r("arm" + S, ax, 0, sg * lerp(lerp(0.2, 0.9, wind), -0.15, strike));
      o.r("forearm" + S, lerp(0.8, 0.3, strike), 0, 0);
      o.r("chest", -0.1 * strike, sg * lerp(-0.35 * wind, 0.45, strike), 0);
      o.r("spine", -0.25 * strike, 0, 0);
      o.r("head", 0.2 * strike, 0, 0);
      o.r("jaw", -(0.5 * strike * (1 - ramp(u, 0.7, 1))), 0, 0);
      if (s.wild) {
        const O = alt ? "R" : "L";
        o.r("arm" + O, 1.2 * strike, 0, 0);
        o.r("forearm" + O, 0.6, 0, 0);
      }
      return;
    }
    if (s.pincers) {
      // patrolman / thinker clamps: rear up wide open, then lunge & SNAP shut
      const S = alt ? "L" : "R",
        sg = alt ? -1 : 1,
        O = alt ? "R" : "L";
      const wind = easeIO(ramp(u, 0, 0.38)),
        strike = easeOut(ramp(u, 0.38, 0.58)),
        rec = ramp(u, 0.7, 1);
      const k = 1 - rec;
      o.r(
        "arm" + S,
        lerp(lerp(0.3, 1.9, wind), 1.25, strike) * k,
        0,
        sg * lerp(0.35 * wind, -0.1, strike) * k,
      );
      o.r("forearm" + S, lerp(lerp(0.8, 1.4, wind), 0.25, strike) * k, 0, 0);
      o.r("arm" + O, 0.9 * k * (0.6 + 0.4 * wind), 0, -sg * 0.25 * k);
      o.r("forearm" + O, 1.1 * k, 0, 0);
      const open = lerp(0.2, 0.85, wind) * (1 - strike) + 0.05; // gape during the wind-up, snap on impact
      o.r("pincer" + S, -open * k, 0, 0);
      o.r("pincer" + O, -(0.25 + 0.3 * wind) * k, 0, 0);
      o.r("spine", (0.12 * wind - 0.3 * strike) * k, 0, 0);
      o.r("chest", 0, sg * lerp(-0.25 * wind, 0.3, strike) * k, 0);
      o.r("head", 0.15 * strike * k, 0, 0);
      o.off(0, 0, -0.08 * strike * k * ch.scale);
      return;
    }
    if (hold === "melee2h" || s.club) {
      // big overhead-to-forward smash (sledge, bat, girder club)
      const wind = easeIO(ramp(u, 0, 0.4)),
        strike = easeIn(ramp(u, 0.4, 0.62)),
        rec = ramp(u, 0.7, 1);
      const armX =
        lerp(lerp(0.4, 2.7, wind), 0.35, strike) * (1 - rec) + 0.3 * rec;
      for (const [S, sg] of SIDES) {
        o.r("arm" + S, armX, 0, sg * 0.15 - sg * 0.25 * wind * (1 - strike));
        o.r(
          "forearm" + S,
          lerp(lerp(0.4, 1.5, wind), 0.2, strike) * (1 - rec) + 0.4 * rec,
          0,
          0,
        );
      }
      o.r("spine", lerp(0.15 * wind, -0.4, strike) * (1 - rec), 0, 0);
      o.r(
        "chest",
        lerp(0.1 * wind, -0.2, strike) * (1 - rec),
        0.25 * wind * (1 - strike),
        0,
      );
      o.off(0, -0.08 * strike * (1 - rec) * ch.scale, 0);
      for (const [S] of SIDES) o.r("shin" + S, -0.3 * strike * (1 - rec), 0, 0);
      return;
    }
    if (hold === "melee1h") {
      // diagonal chop with right hand weapon
      const wind = easeIO(ramp(u, 0, 0.35)),
        strike = easeIn(ramp(u, 0.35, 0.58)),
        rec = ramp(u, 0.65, 1);
      const k = 1 - rec;
      o.r(
        "armR",
        lerp(lerp(0.3, 2.5, wind), 0.5, strike) * k + 0.2 * rec,
        0,
        lerp(lerp(0.1, 0.5, wind), -0.35, strike) * k,
      );
      o.r(
        "forearmR",
        lerp(lerp(0.3, 1.6, wind), 0.25, strike) * k + 0.3 * rec,
        0,
        0,
      );
      o.r("handR", lerp(0.5 * wind, -0.4, strike) * k, 0, 0);
      o.r("chest", 0, lerp(-0.35 * wind, 0.4, strike) * k, 0);
      o.r("spine", -0.15 * strike * k, 0, 0);
      o.r("armL", 0.4 * wind * k, 0, -0.3 * k);
      return;
    }
    // unarmed: right cross (alternates with left jab) — with real fists
    fingers(o, "R", 1, 1);
    fingers(o, "L", -1, 1);
    const S = alt ? "L" : "R",
      sg = alt ? -1 : 1,
      O = alt ? "R" : "L";
    const wind = easeIO(ramp(u, 0, 0.3)),
      strike = easeOut(ramp(u, 0.3, 0.5)),
      rec = ramp(u, 0.6, 1);
    const k = 1 - rec;
    o.r(
      "arm" + S,
      lerp(lerp(0.5, 0.35, wind), 1.45, strike) * k + 0.4 * rec,
      0,
      sg * lerp(0.35, 0.05, strike) * k,
    );
    o.r(
      "forearm" + S,
      lerp(lerp(1.8, 2.1, wind), 0.15, strike) * k + 1.4 * rec,
      0,
      0,
    );
    o.r("arm" + O, 0.9 * k, 0, -sg * 0.3 * k);
    o.r("forearm" + O, 1.9 * k, 0, 0);
    o.r("chest", 0, sg * lerp(-0.3 * wind, 0.35, strike) * k * -1, 0);
    o.r("spine", -0.12 * strike * k, 0, 0);
    o.r("hips", 0, sg * 0.1 * strike * k * -1, 0);
    void opts;
  };

  BI.attack_ranged = function (o, t, ch) {
    // recoil twitch; most of the recoil happens in the IK weapon frame
    const u = clamp(t / 0.25, 0, 1);
    const kick = Math.exp(-u * 6) * (1 - Math.exp(-u * 60));
    o.r("chest", 0.06 * kick * (ch.style.heavy ? 0.4 : 1), 0, 0);
    o.r("head", 0.04 * kick, 0, 0);
    o.r("forearmR", -0.08 * kick, 0, 0);
    if (ch.style.robotZap) {
      o.r("head", -0.1 * kick, 0, 0);
    }
    // patrolman / thinker clamps flex open on the discharge and clamp back
    if (ch.style.pincers)
      for (const [S] of SIDES) o.r("pincer" + S, -0.55 * kick, 0, 0);
  };

  /** Additive hit flinch; dir from ch.hitDir (local), heavier chars flinch less. */
  BI.hit = function (o, t, ch) {
    const u = clamp(t / 0.4, 0, 1);
    const k =
      Math.exp(-u * 5) * (1 - Math.exp(-u * 40)) * (ch.style.heavy ? 0.4 : 1);
    const d = ch.hitLocal || { x: 0, z: 1 };
    const back = d.z >= 0 ? 1 : -1;
    const part = ch.hitPart || "torso";
    o.r("spine", 0.22 * k * back, 0, -d.x * 0.25 * k);
    o.r("chest", 0.18 * k * back, d.x * 0.2 * k, 0);
    o.r(
      "head",
      (part === "head" ? 0.6 : 0.25) * k * back,
      d.x * 0.3 * k,
      0.2 * k * d.x,
    );
    o.off(0, -0.03 * k * ch.scale, 0.06 * k * back * ch.scale);
    for (const [S, sg] of SIDES) {
      o.r("arm" + S, -0.2 * k, 0, sg * 0.25 * k);
      o.r("forearm" + S, 0.4 * k, 0, 0);
      o.r("shin" + S, -0.25 * k, 0, 0);
      o.r("thigh" + S, 0.12 * k, 0, 0);
    }
    if (part === "leftLeg" || part === "rightLeg") {
      const S = part === "leftLeg" ? "L" : "R";
      o.r("thigh" + S, 0.3 * k, 0, 0);
      o.r("shin" + S, -0.6 * k, 0, 0);
      o.off(0, -0.08 * k * ch.scale, 0);
    }
    if (part === "leftArm" || part === "rightArm") {
      const S = part === "leftArm" ? "L" : "R";
      o.r("arm" + S, -0.5 * k, 0, 0);
    }
  };

  BI.aim = function (o, t, ch) {
    BI.idle(o, t, ch);
    // steady stance: feet apart, knees bent a touch, torso bladed
    for (const [S, sg] of SIDES) {
      o.r("thigh" + S, sg > 0 ? -0.06 : 0.12, 0, sg * 0.06);
      o.r("shin" + S, -0.12, 0, 0);
    }
    o.r("hips", 0, -0.25, 0);
    o.r("chest", 0, 0.15, 0);
    o.r("head", 0, 0.1, 0);
    o.off(0, -0.02 * ch.scale, 0);
  };

  BI.talk = function (o, t, ch) {
    BI.idle(o, t, ch);
    const sd = ch.seedPhase;
    const g1 = Math.max(0, Math.sin(t * 1.3 + sd)),
      g2 = Math.max(0, Math.sin(t * 0.9 + sd + 2));
    o.r("armR", 0.35 * g1, 0, 0.1 * g1);
    o.r("forearmR", 1.0 * g1 + 0.2 * Math.sin(t * 5) * g1, 0, 0);
    o.r("handR", -0.3 * g1, 0.4 * g1, 0);
    o.r("armL", 0.25 * g2, 0, -0.1 * g2);
    o.r("forearmL", 0.9 * g2, 0, 0);
    o.r("handL", -0.2 * g2, -0.3 * g2, 0);
    // gesturing hands open (palm up, fingers spread) as they come up
    // …and every so often the right hand POINTS (index out, others curled) to make a point
    const pc = ((t + sd * 11) % 9.5) / 9.5;
    const pw = ch.weapon
      ? 0
      : smooth(0.62, 0.68, pc) * (1 - smooth(0.8, 0.86, pc));
    if (pw > 0) {
      o.r("armR", 0.5 * pw, 0, 0.05 * pw);
      o.r("forearmR", 0.35 * pw - 0.7 * g1 * pw, 0, 0);
      o.r("handR", 0.25 * pw, -0.35 * g1 * pw, 0);
      o.r("head", -0.05 * pw, 0, 0);
    }
    if (!ch.weapon) {
      fingers(o, "R", 1, lerp(-0.85 * g1, 0.95, pw));
      fingers(o, "L", -1, -0.8 * g2);
      if (pw > 0) {
        o.r("fingI1R", 0, 0, pw * (0.8 * 0.95 + 0.22));
        o.r("fingI2R", 0, 0, pw * (1.0 * 0.95 + 0.2));
      }
    }
    o.r(
      "head",
      0.05 * Math.sin(t * 3.1) + 0.04 * Math.sin(t * 1.7),
      0.08 * Math.sin(t * 0.8 + sd),
      0.05 * Math.sin(t * 0.6),
    );
    // lip-synced faces talk through FaceCtl (visemes); creatures flap the jaw
    if (!ch.face)
      o.r(
        "jaw",
        -(
          0.12 *
          Math.abs(Math.sin(t * 9)) *
          (Math.sin(t * 1.9) > -0.4 ? 1 : 0)
        ),
        0,
        0,
      );
    o.r("chest", 0.02 * Math.sin(t * 2), 0.05 * Math.sin(t * 0.7), 0);
  };

  BI.sit = function (o, t, ch, opts) {
    const br = Math.sin(t * 1.5 + ch.seedPhase);
    const ground = opts && opts.ground;
    const hip = ch.hipH;
    if (ground) {
      o.off(0, -(hip - 0.14 * ch.scale), 0.1 * ch.scale);
      for (const [S, sg] of SIDES) {
        o.r("thigh" + S, 1.35, sg * 0.35, sg * 0.35);
        o.r("shin" + S, -2.0, 0, 0);
        o.r("foot" + S, 0.4, 0, 0);
        o.r("arm" + S, 0.55, 0, sg * 0.15);
        o.r("forearm" + S, 0.5, 0, 0);
      }
      o.r("spine", -0.25 + br * 0.01, 0, 0);
      o.r("chest", -0.15 + br * 0.02, 0, 0);
      o.r("neck", 0.2, 0, 0);
      o.r(
        "head",
        0.1 + tn(t * 0.2, ch.seedPhase) * 0.05,
        tn(t * 0.15, 5) * 0.3,
        0,
      );
      return;
    }
    const seat = 0.47 * ch.scale;
    o.off(0, -(hip - seat - 0.07 * ch.scale), 0.12 * ch.scale);
    for (const [S, sg] of SIDES) {
      o.r("thigh" + S, 1.5, 0, sg * 0.1);
      o.r("shin" + S, -1.45 + (sg > 0 ? 0.15 * Math.sin(t * 0.3) : 0), 0, 0);
      o.r("foot" + S, -0.05, 0, 0);
      o.r("arm" + S, 0.45, 0, sg * 0.12);
      o.r("forearm" + S, 0.85, 0, 0);
      o.r("hand" + S, 0.2, 0, 0);
    }
    o.r("spine", -0.12 + br * 0.012, 0, 0);
    o.r("chest", -0.1 + br * 0.025, 0, 0);
    o.r("neck", 0.12, 0, 0);
    o.r(
      "head",
      0.05 + tn(t * 0.2, ch.seedPhase) * 0.06,
      tn(t * 0.12, ch.seedPhase + 3) * 0.35,
      0,
    );
  };

  BI.cower = function (o, t, ch) {
    const tr = Math.sin(t * 31) * 0.015 + Math.sin(t * 23) * 0.01; // trembling
    o.off(0, -ch.hipH * 0.5, 0.05 * ch.scale);
    for (const [S, sg] of SIDES) {
      o.r("thigh" + S, 1.25, 0, sg * 0.15);
      o.r("shin" + S, -2.1, 0, 0);
      o.r("foot" + S, 0.8, 0, 0);
      o.r("arm" + S, 2.35 + tr, 0, sg * 0.35);
      o.r("forearm" + S, 2.55, 0, 0);
      o.r("hand" + S, 0.3, 0, 0);
      fingers(o, S, sg, -0.9);
    }
    o.r("spine", -0.55 + tr, 0, 0);
    o.r("chest", -0.3, 0, 0);
    o.r("neck", -0.25, 0, 0);
    o.r("head", -0.2 + tr * 2, 0.1 * Math.sin(t * 0.7), 0);
  };

  /** Kneeling at prayer (Glowkeeper zealots before the Second Sun): both knees down, hands together, head bowed, a slow sway. */
  BI.kneel = function (o, t, ch) {
    const br = Math.sin(t * 1.3 + ch.seedPhase),
      sw = Math.sin(t * 0.45 + ch.seedPhase * 2);
    const leg = ch.legLen || ch.hipH,
      hip = ch.hipH;
    o.off(0, -(hip - leg * 0.53), 0.05 * ch.scale);
    for (const [S, sg] of SIDES) {
      o.r("thigh" + S, -0.08 + 0.02 * sw, 0, sg * 0.07);
      o.r("shin" + S, -1.52, 0, 0);
      o.r("foot" + S, 0.7, 0, 0);
      o.r("arm" + S, 0.5 + br * 0.01, 0, -sg * 0.28);
      o.r("forearm" + S, 1.55, 0, 0);
      o.r("hand" + S, -0.15, 0, 0);
      fingers(o, S, sg, 0.1);
    }
    o.r("spine", 0.04 * sw + br * 0.01, 0, 0.02 * sw);
    o.r("chest", -0.08 + br * 0.02, 0, 0);
    o.r("neck", -0.18, 0, 0);
    o.r("head", -0.32 + 0.03 * sw, 0, 0);
  };

  BI.work = function (o, t, ch) {
    // bent over a bench, right hand hammering / wrenching
    const h = Math.sin(t * 5.5 + ch.seedPhase),
      h2 = Math.max(0, h);
    o.off(0, -0.05 * ch.scale, 0);
    for (const [S, sg] of SIDES) {
      o.r("thigh" + S, 0.25, 0, sg * 0.08);
      o.r("shin" + S, -0.35, 0, 0);
      o.r("foot" + S, 0.1, 0, 0);
    }
    o.r("spine", -0.35, 0, 0);
    o.r("chest", -0.2, 0, 0);
    o.r("neck", 0.15, 0, 0);
    o.r("head", -0.15, 0, 0);
    o.r("armR", 0.9 + 0.45 * h, 0, 0.1);
    o.r("forearmR", 0.9 + 0.5 * h2, 0, 0);
    o.r("handR", 0.3 * h, 0, 0);
    o.r("armL", 0.8, 0, -0.15);
    o.r("forearmL", 0.9 + 0.05 * Math.sin(t * 2), 0, 0);
    o.r("handL", 0.2, 0, 0);
  };

  BI.reload = function (o, t, ch) {
    // FK part (IK hands are driven separately): glance down at the weapon
    const u = clamp(t / (ch.one ? ch.one.dur : 1.4), 0, 1);
    const k = Math.sin(u * PI);
    o.r("neck", -0.2 * k, 0.1 * k, 0);
    o.r("head", -0.25 * k, 0.15 * k, 0);
    o.r("chest", -0.05 * k, 0.1 * k, 0);
  };

  BI.throw = function (o, t, ch) {
    const u = clamp(t / 0.8, 0, 1);
    const wind = easeIO(ramp(u, 0, 0.45)),
      rel = easeOut(ramp(u, 0.45, 0.65)),
      rec = ramp(u, 0.7, 1);
    const k = 1 - rec;
    o.r(
      "armR",
      lerp(lerp(0.2, 2.6, wind), 1.2, rel) * k,
      0,
      lerp(0.3 * wind, 0.1, rel) * k,
    );
    o.r("forearmR", lerp(1.8 * wind, 0.2, rel) * k, 0, 0);
    o.r("armL", lerp(1.2 * wind, 0.2, rel) * k, 0, -0.2 * k);
    o.r("chest", 0, lerp(-0.45 * wind, 0.35, rel) * k, 0);
    o.r("spine", lerp(0.15 * wind, -0.2, rel) * k, 0, 0);
  };

  BI.roar = function (o, t, ch) {
    // taunt: arms out, chest up, head back, jaw wide (brutes / Maniacs)
    const u = clamp(t / 1.3, 0, 1);
    const k = A.envelope(u, 0.2, 0.3);
    const sh = Math.sin(t * 25) * 0.03 * k;
    for (const [S, sg] of SIDES) {
      o.r("arm" + S, 0.6 * k, 0, sg * 0.9 * k);
      o.r("forearm" + S, 0.9 * k, 0, 0);
      o.r("hand" + S, -0.3 * k, 0, 0);
    }
    o.r("spine", 0.25 * k, 0, 0);
    o.r("chest", 0.2 * k + sh, 0, 0);
    o.r("neck", 0.2 * k, 0, 0);
    o.r("head", 0.35 * k + sh, 0, 0);
    o.r("jaw", -(0.6 * k), 0, 0);
    for (let i = 1; i <= 4; i++)
      o.r("tail" + i, 0.15 * k, 0.2 * Math.sin(t * 6 - i) * k, 0);
  };

  BI.leap = function (o, t, ch) {
    // pounce: crouch, spring, arms forward
    const u = clamp(t / 1.0, 0, 1);
    const crouch =
      Math.sin(ramp(u, 0, 0.3) * PI * 0.5) * (1 - ramp(u, 0.3, 0.4));
    const air = Math.sin(ramp(u, 0.3, 0.8) * PI);
    o.off(0, -0.35 * crouch * ch.hipH + 0.9 * air * ch.scale, 0);
    for (const [S, sg] of SIDES) {
      o.r("thigh" + S, 0.9 * crouch + 0.6 * air, 0, 0);
      o.r("shin" + S, -1.3 * crouch - 0.9 * air, 0, 0);
      o.r("arm" + S, 1.8 * air + 0.4 * crouch, 0, sg * 0.5 * air);
      o.r("forearm" + S, 0.4 * air, 0, 0);
    }
    o.r("spine", -0.3 * crouch - 0.2 * air, 0, 0);
    o.r("head", 0.3 * air, 0, 0);
    o.r("jaw", -(0.6 * air), 0, 0);
  };

  /**
   * DEATH: procedural "ragdoll-ish" fall with spring settling.
   * ch.death = {style:'back'|'front'|'side'|'blast', side:±1, dist, var}
   */
  BI.death = function (o, t, ch) {
    const d = ch.death || { style: "back", side: 1, var: 0 };
    const sc = ch.scale,
      hip = ch.hipH,
      leg = ch.legLen,
      thick = ch.bodyThick;
    const v = d.var,
      sd = d.side;
    for (const [S, sg] of SIDES) fingers(o, S, sg, -0.4 * clamp(t / 0.7, 0, 1)); // limp, half-open hands
    if (d.style === "front") {
      // knees buckle → kneel → topple face-down
      const kneel = easeIO(ramp(t, 0.0, 0.45));
      const fallU = ramp(t, 0.4, 0.95);
      const th = (PI / 2) * easeIn(fallU);
      const bounce =
        t > 0.95
          ? 0.07 *
            Math.exp(-(t - 0.95) * 7) *
            Math.abs(Math.sin((t - 0.95) * 14))
          : 0;
      const kneelH = lerp(hip, leg * 0.52, kneel);
      const y = lerp(kneelH, thick, easeIn(fallU)) + bounce * sc;
      o.off(0, y - hip, -0.2 * sc * fallU);
      o.r("hips", -th + bounce, 0.25 * sd * fallU, 0);
      for (const [S, sg] of SIDES) {
        o.r(
          "thigh" + S,
          lerp(0, -0.05, kneel) + th * 0.95 * (1 - 0.2 * fallU),
          0,
          sg * 0.12 * fallU,
        );
        o.r(
          "shin" + S,
          lerp(0, -1.55, kneel) * (1 - fallU * 0.85) -
            (S === "L" && v > 0.5 ? 0.9 * fallU : 0),
          0,
          0,
        );
        o.r("foot" + S, -0.6 * fallU, 0, 0);
        const armFall = spr(
          t,
          0.9,
          1.6 * fallU,
          sg * sd > 0 ? 0.35 : 2.4,
          12,
          6,
        );
        o.r(
          "arm" + S,
          lerp(0.2 * kneel, armFall, fallU),
          0,
          sg * spr(t, 0.9, 0.2, 0.55, 10, 5) * fallU,
        );
        o.r(
          "forearm" + S,
          spr(t, 0.9, 0.6, 0.35 + (sg * sd > 0 ? 1.0 : 0.1), 12, 5),
          0,
          0,
        );
      }
      o.r("spine", -0.15 * kneel * (1 - fallU), 0, 0);
      o.r("neck", 0, 0, 0);
      o.r(
        "head",
        spr(t, 0.95, -0.4 * kneel, 0.2, 14, 6),
        spr(t, 0.95, 0, 1.2 * sd, 10, 5) * fallU,
        0,
      );
      return;
    }
    if (d.style === "blast") {
      // thrown through the air, tumbling, landing on the back
      const T = 0.85,
        u = clamp(t / T, 0, 1);
      const dist = d.dist || 2.5;
      const air = t < T;
      const h = 4 * 1.1 * u * (1 - u) * sc;
      const rot = air
        ? lerp(0, 2.5 * PI, easeOut(u))
        : spr(t, T, 2.5 * PI + 0.25, 2.5 * PI, 12, 6);
      o.off(
        0,
        (air
          ? lerp(hip * 0.8, thick, u) + h
          : thick + 0.04 * Math.exp(-(t - T) * 8) * sc) - hip,
        dist * easeOut(u),
      );
      o.r("hips", rot, 0, sd * 0.4 * u);
      for (const [S, sg] of SIDES) {
        o.r(
          "arm" + S,
          air ? 1.2 + Math.sin(t * 13 + sg) * 1.2 : spr(t, T, 2.2, 2.6, 10, 5),
          0,
          sg * (air ? 1.2 : spr(t, T, 1.4, 0.9, 9, 5)),
        );
        o.r(
          "forearm" + S,
          air ? 0.8 + Math.sin(t * 17) * 0.6 : spr(t, T, 1.2, 0.3, 10, 5),
          0,
          0,
        );
        o.r(
          "thigh" + S,
          air
            ? 0.9 + Math.sin(t * 11 + sg * 2) * 0.7
            : spr(t, T, 1.0, sg > 0 ? 0.15 : 0.5, 10, 5),
          0,
          sg * 0.25,
        );
        o.r(
          "shin" + S,
          air ? -1.2 : spr(t, T, -1.2, sg > 0 ? -0.1 : -0.9, 10, 5),
          0,
          0,
        );
        o.r("foot" + S, -0.5, 0, 0);
      }
      o.r(
        "head",
        air ? 0.3 * Math.sin(t * 15) : spr(t, T, 0.4, 0.1, 12, 5),
        air ? 0 : spr(t, T, 0, -0.9 * sd, 8, 4),
        0,
      );
      return;
    }
    if (d.style === "side") {
      const fallU = ramp(t, 0.1, 0.7);
      const th = (PI / 2) * easeIn(fallU);
      const knee = easeOut(ramp(t, 0, 0.3));
      const bounce =
        t > 0.7
          ? 0.08 * Math.exp(-(t - 0.7) * 7) * Math.abs(Math.sin((t - 0.7) * 13))
          : 0;
      const Lh = lerp(hip, hip * 0.8, knee);
      o.off(
        sd * Lh * Math.sin(th) * 0.9,
        Math.max(thick, Lh * Math.cos(th)) + bounce * sc - hip,
        0,
      );
      o.r("hips", 0.2 * fallU, sd * 0.6 * fallU, -sd * (th - bounce));
      for (const [S, sg] of SIDES) {
        const down = sg === sd; // the side the body lands on
        o.r("thigh" + S, 0.4 * knee + (down ? 0.2 : 0.9) * fallU, 0, 0);
        o.r(
          "shin" + S,
          -0.8 * knee * (1 - fallU) - (down ? 0.3 : 1.4) * fallU,
          0,
          0,
        );
        o.r(
          "arm" + S,
          spr(t, 0.7, 0.4 + 1.2 * fallU, down ? 1.6 : 0.6, 12, 5),
          0,
          sg * spr(t, 0.7, 0.9 * fallU, down ? 0.3 : 0.2, 11, 5),
        );
        o.r("forearm" + S, spr(t, 0.7, 0.5, down ? 0.4 : 1.3, 12, 5), 0, 0);
        o.r("foot" + S, -0.5 * fallU, 0, 0);
      }
      o.r("spine", -0.25 * fallU, 0, sd * 0.1 * fallU);
      o.r(
        "head",
        spr(t, 0.7, 0.3 * fallU, -0.2, 12, 5),
        0,
        spr(t, 0.7, -sd * 0.5 * fallU, sd * 0.4, 10, 5),
      );
      return;
    }
    // default: fall backwards — knees buckle, head snaps, body pivots about the feet
    const knee = easeOut(ramp(t, 0, 0.22)) * (1 - ramp(t, 0.5, 0.8) * 0.8);
    const fallU = ramp(t, 0.1, 0.72);
    const th = (PI / 2) * easeIn(fallU);
    const T = 0.72;
    const bounce =
      t > T
        ? 0.09 * Math.exp(-(t - T) * 6.5) * Math.abs(Math.sin((t - T) * 12))
        : 0;
    const Lh = lerp(hip, hip * 0.82, knee);
    const z = Lh * Math.sin(th);
    const y = Math.max(thick, Lh * Math.cos(th)) + bounce * sc * 0.6;
    o.off(0, y - hip, z);
    o.r("hips", th - bounce * 0.8, sd * 0.35 * fallU, sd * 0.08 * fallU);
    const armsUp = v > 0.5;
    for (const [S, sg] of SIDES) {
      const bentLeg = sg === sd && v > 0.3;
      o.r(
        "thigh" + S,
        0.35 * knee + (bentLeg ? spr(t, T, 0.2, 0.55, 10, 5) : 0) * fallU,
        0,
        sg * 0.1 * fallU,
      );
      o.r(
        "shin" + S,
        -0.8 * knee - (bentLeg ? spr(t, T, 0.4, 1.1, 10, 5) * fallU : 0.05),
        0,
        0,
      );
      o.r("foot" + S, -0.3 * fallU, 0, 0);
      // arms fly forward/up with the fall, then slap to the ground and settle
      const armX = armsUp
        ? spr(t, T, 1.5 * fallU, 2.7, 12, 5.5)
        : spr(t, T, 1.2 * fallU, 0.25, 12, 5.5);
      const armZ = spr(t, T, 0.7 * fallU, armsUp ? 0.35 : 1.15, 11, 5);
      o.r("arm" + S, armX, 0, sg * armZ);
      o.r(
        "forearm" + S,
        spr(t, T, 0.9 * fallU, armsUp ? 0.9 : 0.25 + 0.5 * v, 13, 5),
        0,
        0,
      );
      o.r("hand" + S, 0.2, 0, 0);
    }
    o.r("spine", 0.1 * knee, 0, 0);
    o.r("neck", spr(t, 0.02, 0, 0.1, 10, 4), 0, 0);
    o.r(
      "head",
      spr(t, 0, 0.55 * (1 - fallU), -0.05, 12, 5),
      spr(t, T, 0, sd * 0.9, 9, 4) * fallU,
      0,
    );
    o.r("jaw", -(0.35 * fallU), 0, 0);
    for (let i = 1; i <= 4; i++)
      o.r("tail" + i, 0, spr(t, T, 0.4, 0.15 * sd, 8, 4) * fallU, 0);
  };
  BI.dead = function (o, t, ch) {
    BI.death(o, 12, ch);
  };
  /**
   * Mid key of the get-up: one knee down, the other foot planted, torso
   * upright-ish, hands pushing off the front knee. (Blended from the lying
   * pose by the controller, then into idle.)
   */
  BI.getupMid = function (o, u, ch) {
    const s = ch.style,
      hip = ch.hipH;
    const d = ch.death || { side: 1 };
    const K = d.side > 0 ? "L" : "R",
      F = d.side > 0 ? "R" : "L"; // kneel on one side, plant the other foot
    if (s.digitigrade) {
      // digitigrade rigs: crouched low, claws on the ground
      o.off(0, -hip * 0.35, 0);
      for (const [S] of SIDES) {
        o.r("thigh" + S, 1.2, 0, 0);
        o.r("shin" + S, -1.8, 0, 0);
        o.r("meta" + S, 1.2, 0, 0);
        o.r("arm" + S, 1.2, 0, 0);
        o.r("forearm" + S, 0.5, 0, 0);
      }
      o.r("spine", -0.5, 0, 0);
      o.r("head", 0.5, 0, 0);
      return;
    }
    o.off(0, -hip * 0.42, 0.06 * ch.scale);
    o.r("hips", 0.15, 0.2 * d.side, 0);
    o.r("thigh" + K, 0.25, 0, 0);
    o.r("shin" + K, -1.85, 0, 0);
    o.r("foot" + K, 0.9, 0, 0);
    o.r("thigh" + F, 1.55, 0, 0);
    o.r("shin" + F, -1.5, 0, 0);
    o.r("foot" + F, 0.05, 0, 0);
    o.r("spine", -0.35, 0, 0);
    o.r("chest", -0.2, 0, 0);
    o.r("neck", 0.2, 0, 0);
    o.r("head", 0.15, 0, 0);
    o.r("arm" + F, 0.9, 0, 0);
    o.r("forearm" + F, 0.5, 0, 0);
    o.r("hand" + F, 0.4, 0, 0);
    o.r("arm" + K, 0.6, 0, -0.1 * d.side);
    o.r("forearm" + K, 0.3, 0, 0);
    if (s.wild) o.r("head", 0.3 * Math.sin(u * 20), 0.2, 0); // twitchy
  };

  // ==================================================================
  //  QUADRUPED (dog, burrow rat, ripjaw (+ middle legs), pack ox, coyote, stag, ash bear, lurcher)
  // ==================================================================
  const QU = (A.quad = {});
  const QLEGS = [
    ["FL", -1, 0],
    ["FR", 1, PI],
    ["HL", -1, PI * 0.5],
    ["HR", 1, PI * 1.5],
    ["ML", -1, PI * 1.25],
    ["MR", 1, PI * 0.25],
  ]; // M* = middle pair of six-legged quads (ripjaw)
  QU.idle = function (o, t, ch) {
    const sd = ch.seedPhase,
      br = Math.sin(t * 2.2 + sd);
    o.off(0, br * 0.004 * ch.scale, 0);
    o.r("spine", br * 0.02, 0, 0);
    o.r("neck", 0.05 + tn(t * 0.2, sd) * 0.1, tn(t * 0.25, sd + 3) * 0.3, 0);
    o.r(
      "head",
      tn(t * 0.3, sd + 5) * 0.1,
      tn(t * 0.35, sd + 7) * 0.25,
      tn(t * 0.2, sd + 1) * 0.1,
    );
    for (const [S, sg] of QLEGS) {
      o.r("upper" + S, 0, 0, sg * 0.03);
      o.r("lower" + S, 0, 0, 0);
    }
    // tail wag / ears (dogs are happy-ish when idle)
    const wag = ch.style.wag ? Math.sin(t * 9) * 0.35 : Math.sin(t * 1.2) * 0.1;
    for (let i = 1; i <= 3; i++)
      o.r(
        "tail" + i,
        ch.style.tailUp * (i === 1 ? 1 : 0.3),
        wag * (0.5 + i * 0.25),
        0,
      );
    o.r("jaw", -(ch.style.pant ? 0.25 + 0.1 * Math.sin(t * 12) : 0.02), 0, 0);
    o.r("earL", 0.1 * Math.sin(t * 0.7 + sd), 0, 0);
    o.r("earR", 0.1 * Math.sin(t * 0.8 + sd + 1), 0, 0);
    // grazers (pack ox, stag): the head goes right down to the ground, chewing, on a slow cycle
    if (ch.style.graze) {
      for (const [N, Hd, J, off] of [["neck", "head", "jaw", 0]]) {
        const per = 15 + off * 2.3,
          ph = ((t + sd * 13 + off * 5) / per) % 1;
        const g = smooth(0.04, 0.16, ph) * (1 - smooth(0.52, 0.66, ph));
        o.r(N, -1.0 * g, 0.12 * g * Math.sin(t * 0.5 + off), 0);
        o.r(Hd, -0.3 * g + 0.035 * g * Math.sin(t * 9 + off), 0, 0);
        o.r(J, -(0.1 * g * Math.max(0, Math.sin(t * 7.5 + off))), 0, 0); // chewing
      }
    }
  };
  QU.gait = function (o, ch, ph, k, amt, sneak) {
    const sc = ch.scale;
    const A_ = lerp(0.45, 0.85, k) * ch.style.stride;
    const gallop = k > 0.5;
    o.off(
      0,
      -Math.abs(Math.sin(ph)) * lerp(0.015, 0.05, k) * sc -
        (sneak ? 0.08 * sc : 0),
      0,
    );
    o.r(
      "spine",
      gallop ? 0.12 * Math.sin(ph) * k : 0,
      0.05 * Math.sin(ph),
      0.03 * Math.cos(ph),
    );
    o.r("neck", -0.1 * k + 0.05 * Math.sin(ph * 2), 0, 0);
    o.r("head", 0.08 * k - 0.04 * Math.sin(ph * 2), 0, 0);
    for (const [S, sg, off] of QLEGS) {
      // walk: lateral sequence; gallop: front pair / hind pair in near-sync
      const p = gallop
        ? ph + (S[0] === "F" ? 0 : PI * 0.8) + (sg > 0 ? 0.3 : 0)
        : ph + off;
      const sw = Math.sin(p),
        cw = Math.cos(p);
      const front = S[0] === "F";
      o.r("upper" + S, A_ * sw, 0, sg * 0.02);
      // front legs fold wrist backwards in swing; hind hocks fold forward
      if (front) {
        o.r("lower" + S, -0.9 * Math.max(0, cw) * (0.6 + k * 0.6), 0, 0);
        o.r("paw" + S, -0.7 * Math.max(0, cw), 0, 0);
      } else {
        o.r("lower" + S, -1.0 * Math.max(0, cw) * (0.6 + k * 0.5), 0, 0);
        o.r("paw" + S, 0.7 * Math.max(0, cw), 0, 0);
      }
    }
    const wag = ch.style.wag ? Math.sin(ph * 2) * 0.25 : 0;
    for (let i = 1; i <= 3; i++)
      o.r(
        "tail" + i,
        ch.style.tailUp * 0.6 - 0.1 * k,
        wag + 0.15 * Math.sin(ph - i),
        0,
      );
    o.r("jaw", -(ch.style.pant ? 0.2 * k : 0), 0, 0);
    void amt;
  };
  QU.attack_melee = function (o, t, ch) {
    const u = clamp(t / (ch.one ? ch.one.dur : 0.6), 0, 1);
    const lunge = Math.sin(ramp(u, 0.1, 0.6) * PI);
    const bite = ramp(u, 0.35, 0.45) * (1 - ramp(u, 0.5, 0.65));
    o.off(0, 0.05 * lunge * ch.scale, -0.35 * lunge * ch.scale);
    o.r("spine", -0.15 * lunge, 0, 0);
    o.r("neck", -0.3 * lunge, 0, 0);
    o.r("head", 0.35 * lunge, 0.2 * Math.sin(t * 20) * bite, 0);
    o.r("jaw", -(0.7 * lunge * (1 - bite)), 0, 0);
    o.r("upperFL", 0.6 * lunge, 0, 0);
    o.r("upperFR", 0.6 * lunge, 0, 0);
    o.r("upperHL", -0.4 * lunge, 0, 0);
    o.r("upperHR", -0.4 * lunge, 0, 0);
  };
  /** Lurcher spit: neck coils back, lunges forward, the round mouth gapes. */
  QU.attack_ranged = function (o, t, ch) {
    const u = clamp(t / 0.7, 0, 1);
    const back =
      Math.sin(ramp(u, 0, 0.45) * PI * 0.5) * (1 - ramp(u, 0.45, 0.55));
    const thrust = Math.sin(ramp(u, 0.45, 1) * PI);
    o.r("neck", 0.5 * back - 0.4 * thrust, 0, 0);
    o.r("head", -0.2 * back + 0.35 * thrust, 0, 0);
    o.r("jaw", -(0.55 * thrust), 0, 0);
    o.r("spine", 0.1 * back, 0, 0);
  };
  QU.roar = function (o, t, ch) {
    // bark / growl
    const k = A.envelope(clamp(t / 1.0, 0, 1), 0.15, 0.3);
    const b = Math.max(0, Math.sin(t * 14));
    o.r("neck", 0.25 * k, 0, 0);
    o.r("head", 0.2 * k * b, 0, 0);
    o.r("jaw", -(0.55 * k * b), 0, 0);
    o.off(0, -0.03 * k * ch.scale, 0.04 * k * b * ch.scale);
  };
  QU.hit = function (o, t, ch) {
    const k = Math.exp(-clamp(t / 0.35, 0, 1) * 5) * (1 - Math.exp(-t * 40));
    o.r("spine", 0.2 * k, 0, 0.2 * k);
    o.r("head", 0.4 * k, 0.3 * k, 0);
    o.off(0, -0.05 * k * ch.scale, 0.08 * k * ch.scale);
    o.r("jaw", -(0.5 * k), 0, 0);
  };
  QU.death = function (o, t, ch) {
    const d = ch.death || { side: 1 };
    const sd = d.side,
      fallU = ramp(t, 0.05, 0.55),
      T = 0.55;
    const roll = (PI / 2) * easeIn(fallU);
    const bounce =
      t > T
        ? 0.06 * Math.exp(-(t - T) * 7) * Math.abs(Math.sin((t - T) * 13))
        : 0;
    o.off(
      sd * ch.bodyH * 0.6 * fallU,
      -(ch.bodyH - ch.bodyThick) * easeIn(fallU) + bounce * ch.scale,
      0,
    );
    o.r("hips", 0, 0, sd * (roll - bounce));
    o.r("spine", 0, 0.1 * sd * fallU, 0);
    o.r("neck", spr(t, T, 0.2, -0.3, 10, 5) * fallU, 0, 0);
    o.r("head", spr(t, T, 0.3, -0.2, 10, 5) * fallU, 0, sd * 0.3 * fallU);
    o.r("jaw", -(0.35 * fallU), 0, 0);
    o.r("jaw2", -(0.3 * fallU), 0, 0);
    // legs: stiffen out then go limp; a couple of dying twitches
    const tw =
      t > 1.1 && t < 2.6
        ? Math.sin(t * 22) * 0.12 * Math.exp(-(t - 1.1) * 2.2)
        : 0;
    for (const [S] of QLEGS) {
      const f = S[0] === "F";
      o.r(
        "upper" + S,
        spr(t, T, f ? 0.6 : -0.6, f ? 0.35 : -0.25, 9, 4) * fallU + tw,
        0,
        0,
      );
      o.r("lower" + S, (f ? 0.2 : -0.2) * fallU, 0, 0);
    }
    for (let i = 1; i <= 3; i++) o.r("tail" + i, -0.3 * fallU, 0, 0);
  };
  QU.dead = function (o, t, ch) {
    QU.death(o, 12, ch);
  };
  QU.getupMid = function (o, u, ch) {
    // sternal: belly down, legs tucked
    o.off(0, -ch.bodyH * 0.45, 0);
    for (const [S] of QLEGS) {
      const f = S[0] === "F";
      o.r("upper" + S, f ? -0.8 : 1.0, 0, 0);
      o.r("lower" + S, f ? 1.4 : -1.6, 0, 0);
    }
    o.r("neck", 0.2, 0, 0);
    o.r("head", -0.1, 0, 0);
  };
  QU.sit = function (o, t, ch) {
    // dog sit
    const br = Math.sin(t * 2.2);
    o.off(0, -ch.bodyH * 0.25, 0.1 * ch.scale);
    o.r("hips", 0.55, 0, 0);
    o.r("spine", 0.1, 0, 0);
    o.r("neck", -0.35 + br * 0.02, tn(t * 0.3, ch.seedPhase) * 0.3, 0);
    o.r("head", -0.1, 0, tn(t * 0.2, 2) * 0.15);
    o.r("upperFL", -0.55, 0, 0);
    o.r("upperFR", -0.55, 0, 0);
    o.r("pawFL", 0.55, 0, 0);
    o.r("pawFR", 0.55, 0, 0);
    o.r("upperHL", 1.1, 0, -0.15);
    o.r("upperHR", 1.1, 0, 0.15);
    o.r("lowerHL", -2.2, 0, 0);
    o.r("lowerHR", -2.2, 0, 0);
    o.r("pawHL", 1.2, 0, 0);
    o.r("pawHR", 1.2, 0, 0);
    for (let i = 1; i <= 3; i++)
      o.r("tail" + i, -0.6, Math.sin(t * 6) * 0.2, 0);
    o.r("jaw", -(ch.style.pant ? 0.25 + 0.08 * Math.sin(t * 12) : 0), 0, 0);
  };
  QU.cower = function (o, t, ch) {
    o.off(0, -ch.bodyH * 0.3, 0.05 * ch.scale);
    o.r("neck", 0.2, 0, 0);
    o.r("head", -0.3, 0, 0);
    for (const [S] of QLEGS) o.r("lower" + S, S[0] === "F" ? 0.6 : -0.7, 0, 0);
    for (let i = 1; i <= 3; i++) o.r("tail" + i, -0.6, 0, 0);
    o.r("earL", -0.6, 0, 0);
    o.r("earR", -0.6, 0, 0);
    o.r("spine", Math.sin(t * 30) * 0.01, 0, 0);
  };
  QU.work = function (o, t, ch) {
    // sniffing the ground
    QU.idle(o, t, ch);
    o.r("neck", -0.7, 0.2 * Math.sin(t * 0.8), 0);
    o.r("head", -0.2 + 0.05 * Math.sin(t * 14), 0, 0);
  };
  QU.talk = function (o, t, ch) {
    QU.idle(o, t, ch);
    o.r("head", 0, 0, 0.3 * Math.sin(t * 1.3));
    o.r("jaw", -(0.1 * Math.abs(Math.sin(t * 7))), 0, 0);
  };

  // ==================================================================
  //  INSECT (giant roach, ants) & SHELLBACKS: 6–8 legs, tripod gait
  // ==================================================================
  const IN = (A.insect = {});
  // (a 4th pair for stingers & shellbacks; missing bones are ignored by the writer)
  const LEGS6 = [
    ["L1", -1, 0],
    ["R1", 1, PI],
    ["L2", -1, PI],
    ["R2", 1, 0],
    ["L3", -1, 0],
    ["R3", 1, PI],
    ["L4", -1, PI],
    ["R4", 1, 0],
  ];
  /** Stinger / shellback tail: ready arch (curl), sway and strike. */
  function tailPose(o, t, ch, curl, sway) {
    for (let i = 1; i <= 5; i++)
      o.r("tail" + i, -curl * (0.05 + i * 0.03), sway * (0.12 - i * 0.015), 0);
    o.r("sting", -curl * 0.2, 0, 0);
  }
  IN.idle = function (o, t, ch) {
    const sd = ch.seedPhase;
    o.r("head", 0.05 * Math.sin(t * 2 + sd), 0.15 * tn(t * 0.6, sd), 0);
    o.r("antL", 0.2 * Math.sin(t * 3.1 + sd), 0.25 * Math.sin(t * 2.3), 0);
    o.r("antR", 0.2 * Math.sin(t * 2.7 + sd), 0.25 * Math.sin(t * 2.9 + 1), 0);
    o.off(0, 0.003 * Math.sin(t * 3) * ch.scale, 0);
    for (const [S] of LEGS6)
      o.r("leg" + S, 0, 0.03 * Math.sin(t * 1.3 + S.charCodeAt(1)), 0);
    o.r("clawL", 0.1 * Math.sin(t * 0.8), 0, 0);
    o.r("clawR", 0.1 * Math.sin(t * 0.9 + 1), 0, 0);
    o.r("pincerL", 0.2 * Math.max(0, Math.sin(t * 1.4)), 0, 0);
    o.r("pincerR", 0.2 * Math.max(0, Math.sin(t * 1.2 + 2)), 0, 0);
    o.r("abdomen", 0.03 * Math.sin(t * 1.1), 0, 0);
    // stinger tail: slow menacing sway, needle twitching; ant antennae tips
    tailPose(
      o,
      t,
      ch,
      0.3 + 0.15 * Math.sin(t * 0.9 + sd),
      Math.sin(t * 0.7 + sd),
    );
    o.r(
      "sting",
      0.15 *
        Math.max(0, Math.sin(t * 2.3 + sd)) *
        (Math.sin(t * 0.4) > 0.5 ? 1 : 0),
      0,
      0,
    );
    o.r("antL2", 0.3 * Math.sin(t * 2.1 + sd), 0.2 * Math.sin(t * 1.7), 0);
    o.r(
      "antR2",
      0.3 * Math.sin(t * 2.4 + sd + 1),
      0.2 * Math.sin(t * 1.5 + 2),
      0,
    );
    o.r("foreL", 0, -0.1 * Math.sin(t * 0.8), 0);
    o.r("foreR", 0, 0.1 * Math.sin(t * 0.85 + 1), 0);
  };
  IN.gait = function (o, ch, ph, k) {
    tailPose(o, 0, ch, 0.45 + 0.1 * k, 0.4 * Math.sin(ph));
    o.r("antL2", 0.2 + 0.15 * Math.sin(ph * 3), 0, 0);
    o.r("antR2", 0.2 + 0.15 * Math.sin(ph * 3 + 1), 0, 0);
    const A_ = lerp(0.35, 0.55, k);
    o.off(0, Math.abs(Math.sin(ph * 2)) * 0.01 * ch.scale, 0);
    o.r("body", 0, 0.04 * Math.sin(ph * 2), 0.02 * Math.sin(ph * 2));
    for (const [S, sg, off] of LEGS6) {
      const p = ph + off;
      // legs splay sideways from the body: swing = yaw about the hip, lift = raise the leg
      o.r(
        "leg" + S,
        0,
        sg * A_ * Math.sin(p) * 0.9,
        sg * 0.35 * Math.max(0, Math.cos(p)),
      );
      o.r("foot" + S, 0, 0, -sg * 0.3 * Math.max(0, Math.cos(p)));
    }
    o.r("antL", 0.15 + 0.1 * Math.sin(ph * 3), 0, 0);
    o.r("antR", 0.15 + 0.1 * Math.sin(ph * 3 + 1), 0, 0);
    o.r("clawL", 0.15 * Math.sin(ph), 0, 0);
    o.r("clawR", -0.15 * Math.sin(ph), 0, 0);
  };
  /** Stinger strike: tail cocks back, whips over the head, recoils. */
  IN.sting = function (o, t, ch) {
    const u = clamp(t / (ch.one ? ch.one.dur : 0.7), 0, 1);
    const cock =
      Math.sin(ramp(u, 0, 0.35) * PI * 0.5) * (1 - ramp(u, 0.35, 0.45));
    const strike = Math.sin(ramp(u, 0.35, 0.8) * PI);
    // (tailPose: + extends the arch back, − whips it forward over the head)
    tailPose(o, t, ch, 0.3 + 0.6 * cock - 2.2 * strike, 0);
    o.r("sting", 0.5 * strike, 0, 0);
    o.r("body", -0.12 * strike + 0.08 * cock, 0, 0);
    o.off(0, 0, -0.08 * strike * ch.scale);
    o.r("clawL", 0.3 * cock, -0.2 * strike, 0);
    o.r("clawR", 0.3 * cock, 0.2 * strike, 0);
  };
  IN.attack_melee = function (o, t, ch) {
    if (ch.B.sting !== undefined && ch.attackAlt) return IN.sting(o, t, ch); // stingers alternate scythes / sting
    const u = clamp(t / (ch.one ? ch.one.dur : 0.5), 0, 1);
    const l = Math.sin(ramp(u, 0.05, 0.6) * PI);
    o.off(0, 0.06 * l * ch.scale, -0.25 * l * ch.scale);
    o.r("body", -0.25 * l, 0, 0);
    o.r("head", 0.3 * l, 0, 0);
    o.r("legL1", 0, 0, 0.5 * l);
    o.r("legR1", 0, 0, -0.5 * l);
    // queen/claws: double pinch
    o.r("clawL", 0.8 * l, 0.3 * l, 0);
    o.r("clawR", 0.8 * l, -0.3 * l, 0);
    o.r("pincerL", 0.6 * (1 - l), 0, 0);
    o.r("pincerR", 0.6 * (1 - l), 0, 0);
    o.r("mandL", 0, 0.4 * Math.abs(Math.sin(t * 20)) * l, 0);
    o.r("mandR", 0, -0.4 * Math.abs(Math.sin(t * 20)) * l, 0);
  };
  IN.attack_ranged = function (o, t, ch) {
    // queen spits acid, fire ants spray burning venom
    const k = Math.sin(clamp(t / 0.6, 0, 1) * PI);
    o.r("body", 0.2 * k, 0, 0);
    o.r("head", 0.4 * k, 0, 0);
    o.r("mandL", 0, -0.5 * k, 0);
    o.r("mandR", 0, 0.5 * k, 0);
    o.r("abdomen", -0.35 * k, 0, 0); // gaster curls under (ants spray from the abdomen tip)
  };
  IN.roar = function (o, t, ch) {
    const k = A.envelope(clamp(t / 1.2, 0, 1), 0.2, 0.3);
    o.r("body", 0.35 * k, 0, 0);
    o.off(0, 0.1 * k * ch.scale, 0);
    o.r("clawL", 1.2 * k, 0, -0.4 * k);
    o.r("clawR", 1.2 * k, 0, 0.4 * k);
    o.r("pincerL", 0.5 * k * Math.abs(Math.sin(t * 10)), 0, 0);
    o.r("pincerR", 0.5 * k * Math.abs(Math.sin(t * 11)), 0, 0);
  };
  IN.hit = function (o, t, ch) {
    const k = Math.exp(-clamp(t / 0.3, 0, 1) * 5) * (1 - Math.exp(-t * 40));
    o.r("body", 0.2 * k, 0, 0.15 * k);
    o.off(0, 0.04 * k * ch.scale, 0.05 * k * ch.scale);
  };
  IN.death = function (o, t, ch) {
    const d = ch.death || { side: 1 };
    const big = ch.style.big;
    if (big) {
      // queen: legs buckle, collapses flat
      const u = easeIn(ramp(t, 0, 0.8));
      o.off(0, -(ch.bodyH - ch.bodyThick) * u, 0);
      o.r("body", 0.1 * u, 0, d.side * 0.15 * u);
      for (const [S, sg] of LEGS6) o.r("leg" + S, 0, 0, -sg * 0.5 * u);
      o.r("clawL", -0.4 * u, 0, -0.4 * u);
      o.r("clawR", -0.4 * u, 0, 0.4 * u);
      return;
    }
    // roach: flips onto its back with a hop, legs curl & twitch
    const u = ramp(t, 0, 0.45);
    const hop = Math.sin(u * PI) * 0.25 * ch.scale;
    o.off(0, hop + ch.bodyThick * 0.6 * easeIn(u), 0);
    o.r("body", 0, 0, d.side * PI * easeIO(u));
    const tw = t < 4 ? Math.exp(-t * 0.9) : 0;
    for (const [S, sg] of LEGS6) {
      const k = S.charCodeAt(1);
      o.r(
        "leg" + S,
        0,
        0.3 * Math.sin(t * 17 + k) * tw,
        -sg * (0.6 * u + 0.35 * Math.sin(t * 13 + k * 2) * tw),
      );
      o.r("foot" + S, 0, 0, -sg * 0.9 * u);
    }
    o.r("antL", -0.3 * u, 0, 0);
    o.r("antR", -0.2 * u, 0, 0);
    tailPose(o, t, ch, -0.4 * u, 0.3 * u); // scorpion tail flops
  };
  IN.dead = function (o, t, ch) {
    IN.death(o, 12, ch);
  };
  IN.cower = IN.idle;
  IN.talk = IN.idle;
  IN.sit = IN.idle;
  IN.work = IN.idle;

  // ==================================================================
  //  FLY (gasfly) — hovering insect
  // ==================================================================
  const FL = (A.fly = {});
  FL.idle = function (o, t, ch) {
    const sd = ch.seedPhase;
    o.off(
      0.05 * Math.sin(t * 0.9 + sd) * ch.scale,
      (0.08 * Math.sin(t * 1.7 + sd) + 0.03 * Math.sin(t * 4.3)) * ch.scale,
      0.04 * Math.sin(t * 1.3) * ch.scale,
    );
    o.r(
      "body",
      0.08 * Math.sin(t * 1.1 + sd),
      0.1 * tn(t * 0.4, sd),
      0.06 * Math.sin(t * 1.9),
    );
    const f = Math.sin(t * 70 + sd) * 0.55; // wing buzz (aliasing reads as a blur)
    o.r("wingL", 0, 0, -0.25 + f);
    o.r("wingR", 0, 0, 0.25 - f);
    o.r("abdomen", 0.08 * Math.sin(t * 2.3 + sd), 0.05 * Math.sin(t * 1.4), 0);
    for (const [S, sg] of [
      ["L1", -1],
      ["R1", 1],
      ["L2", -1],
      ["R2", 1],
      ["L3", -1],
      ["R3", 1],
    ])
      o.r("leg" + S, 0.3 + 0.1 * Math.sin(t * 3 + sg), 0, sg * 0.1);
  };
  FL.gait = function (o, ch, ph, k) {
    FL.idle(o, ch.animT, ch);
    o.r("body", -0.25 - 0.2 * k, 0, 0);
    o.r("abdomen", 0.2, 0, 0);
  };
  FL.attack_ranged = function (o, t, ch) {
    // curl abdomen forward & shoot larva
    const k = Math.sin(clamp(t / 0.6, 0, 1) * PI);
    o.r("abdomen", 0.9 * k, 0, 0);
    o.r("body", 0.2 * k, 0, 0);
  };
  FL.attack_melee = function (o, t, ch) {
    const k = Math.sin(clamp(t / 0.5, 0, 1) * PI);
    o.off(0, -0.1 * k * ch.scale, -0.4 * k * ch.scale);
    o.r("abdomen", 0.7 * k, 0, 0);
  };
  FL.hit = function (o, t, ch) {
    const k = Math.exp(-t * 8) * (1 - Math.exp(-t * 40));
    o.off(0, 0.1 * k, 0.1 * k);
    o.r("body", 0.4 * k, 0, 0.3 * k);
  };
  FL.death = function (o, t, ch) {
    const d = ch.death || { side: 1 };
    // spiral down, bounce, lie on its side; wings slow down
    const fallT = 0.6;
    const u = clamp(t / fallT, 0, 1);
    const h = ch.hover * (1 - easeIn(u));
    const b =
      t > fallT
        ? 0.05 *
          Math.exp(-(t - fallT) * 6) *
          Math.abs(Math.sin((t - fallT) * 14))
        : 0;
    o.off(0, h - ch.hover + ch.bodyThick * 0.3 + b * ch.scale, 0);
    o.r("body", 0.3 * u, 2 * u, d.side * 1.4 * easeIn(u));
    const f = t < fallT ? Math.sin(t * 60) * 0.5 * (1 - u) : 0;
    o.r("wingL", 0, 0, -0.9 * u + f);
    o.r("wingR", 0, 0, 0.4 * u - f);
    o.r("abdomen", 0.4 * u, 0, 0);
  };
  FL.dead = function (o, t, ch) {
    FL.death(o, 12, ch);
  };
  FL.cower = FL.idle;
  FL.talk = FL.idle;
  FL.sit = FL.idle;
  FL.work = FL.idle;
  FL.roar = FL.idle;

  // ==================================================================
  //  HOVER / ROLLING ROBOTS (Valet one-wheel units, Sky-Eye disc drones)
  // ==================================================================
  const HV = (A.hover = {});
  HV.idle = function (o, t, ch) {
    const sd = ch.seedPhase;
    const wb = ch.style.wheel ? 0 : 1; // a wheeled unit sways on its axle instead of bobbing
    o.off(
      0.02 * Math.sin(t * 0.8 + sd) * ch.scale * wb,
      0.05 * Math.sin(t * 1.6 + sd) * ch.scale * wb,
      0,
    );
    o.r(
      "body",
      (wb ? 0.04 : 0.025) * Math.sin(t * 1.1 + sd),
      0.05 * Math.sin(t * 0.4),
      (wb ? 0.04 : 0.012) * Math.sin(t * 1.3),
    );
    o.r("wheel", -(ch.phase || 0), 0, 0); // gait step = π·r, so the gait phase IS the wheel angle (kept when stopping)
    o.r(
      "lamp",
      0.12 + 0.12 * Math.sin(t * 0.37 + sd),
      0.45 * Math.sin(t * 0.23 + sd),
      0,
    ); // searchlight sweep
    o.r("fan", 0, t * 31, 0);
    // eye stalks looking around independently
    for (let i = 1; i <= 3; i++)
      o.r(
        "stalk" + i,
        0.15 * tn(t * 0.5, sd + i * 3),
        0.3 * tn(t * 0.4, sd + i * 7),
        0,
      );
    for (let i = 1; i <= 3; i++) {
      o.r("arm" + i, 0.1 * Math.sin(t * 0.9 + i * 2), 0, 0);
      o.r("fore" + i, 0.2 + 0.1 * Math.sin(t * 1.2 + i), 0, 0);
    }
    o.r("saw", 0, t * 3, 0);
    o.r("antenna", 0.05 * Math.sin(t * 2.2), 0, 0.05 * Math.sin(t * 1.7));
    o.s(
      "thrust",
      0.85 + 0.25 * Math.abs(Math.sin(t * 37)) + 0.1 * Math.sin(t * 13),
    );
    o.r("fins", 0, 0, 0.05 * Math.sin(t * 3));
  };
  HV.gait = function (o, ch, ph, k) {
    HV.idle(o, ch.animT, ch);
    o.r("body", ch.style.wheel ? -0.1 - 0.12 * k : -0.18 - 0.12 * k, 0, 0);
    o.s("thrust", 1.2 + 0.3 * k);
  };
  HV.attack_melee = function (o, t, ch) {
    const u = clamp(t / 0.7, 0, 1),
      k = Math.sin(u * PI);
    o.off(0, 0, -0.3 * k * ch.scale);
    o.r("body", -0.2 * k, 0.3 * Math.sin(u * PI * 2), 0);
    o.r("arm1", 1.0 * k, 0, 0);
    o.r("arm2", 0.9 * k, 0, 0);
    o.r("arm3", 0.8 * k, 0, 0);
    o.r("saw", 0, t * 40, 0);
    o.r("pinch", 0.6 * Math.abs(Math.sin(t * 12)) * k, 0, 0);
  };
  HV.attack_ranged = function (o, t, ch) {
    const k = Math.exp(-clamp(t / 0.3, 0, 1) * 5) * (1 - Math.exp(-t * 50));
    o.r("body", 0.1 * k, 0, 0);
    o.r("arm2", -0.2 * k, 0, 0);
    o.r("antenna", 0.2 * k, 0, 0);
    o.off(0, 0, 0.05 * k * ch.scale);
  };
  HV.hit = function (o, t, ch) {
    const k = Math.exp(-clamp(t / 0.4, 0, 1) * 5) * (1 - Math.exp(-t * 40));
    o.r("body", 0.3 * k, 0.2 * k, 0.3 * k);
    o.off(0, 0.05 * k * ch.scale, 0.12 * k * ch.scale);
  };
  HV.death = function (o, t, ch) {
    const d = ch.death || { side: 1 };
    const fallT = 0.55,
      u = clamp(t / fallT, 0, 1);
    const b =
      t > fallT
        ? 0.12 *
          Math.exp(-(t - fallT) * 5) *
          Math.abs(Math.sin((t - fallT) * 11))
        : 0;
    const roll = ch.style.ball
      ? d.side * (easeIn(u) * 1.2 + ramp(t, fallT, 2.2) * 1.8)
      : d.side * 1.1 * easeIn(u);
    o.off(
      ch.style.ball ? d.side * 0.5 * ramp(t, fallT, 2.2) * ch.scale : 0,
      -ch.hover * easeIn(u) + b * ch.scale + ch.bodyThick * 0.1,
      0,
    );
    o.r("body", 0.4 * u, 0, roll);
    for (let i = 1; i <= 3; i++) {
      o.r("stalk" + i, -0.7 * u, 0, 0);
      o.r("arm" + i, spr(t, fallT, 0, -0.4, 9, 4), 0, 0);
    }
    o.s("thrust", t < 0.25 ? 1.6 : 0.001);
    o.r("antenna", 0.6 * u, 0, 0);
  };
  HV.dead = function (o, t, ch) {
    HV.death(o, 12, ch);
  };
  HV.talk = function (o, t, ch) {
    HV.idle(o, t, ch);
    o.r("arm1", 0.4 * Math.max(0, Math.sin(t * 1.4)), 0, 0);
    o.r("stalk2", 0.15 * Math.sin(t * 3), 0, 0);
  };
  HV.work = function (o, t, ch) {
    HV.idle(o, t, ch);
    o.r("arm1", 0.9, 0, 0);
    o.r("fore1", 0.5 + 0.4 * Math.sin(t * 6), 0, 0);
    o.r("arm3", 0.9, 0, 0);
    o.r("saw", 0, t * 30, 0);
  };
  HV.cower = HV.idle;
  HV.sit = HV.idle;
  HV.roar = HV.attack_ranged;

  // Library lookup by rig kind
  A.LIBS = { biped: BI, quad: QU, insect: IN, fly: FL, hover: HV };
  /** Anim name aliases accepted by setAnim/playOneShot. */
  A.ALIAS = {
    attack: null, // resolved at call time: ranged if holding a gun, else melee
    melee: "attack_melee",
    shoot: "attack_ranged",
    fire: "attack_ranged",
    ranged: "attack_ranged",
    swing: "attack_melee",
    bite: "attack_melee",
    flinch: "hit",
    pain: "hit",
    die: "death",
    dying: "death",
    corpse: "dead",
    gesture: "talk",
    speak: "talk",
    crouch: "sneak",
    taunt: "roar",
    bark: "roar",
    growl: "roar",
    pounce: "leap",
    grenade: "throw",
    jog: "run",
    sprint: "run",
    stand: "idle",
    guard: "aim",
    hammer: "work",
    repair: "work",
  };
  /** Which anims are one-shots (and their default durations / blending). */
  A.ONESHOT = {
    attack_melee: { dur: 0.62, mask: "full" },
    attack_ranged: { dur: 0.25, mask: "upper", additive: true },
    hit: { dur: 0.4, mask: "full", additive: true },
    reload: { dur: 1.5, mask: "upper" },
    throw: { dur: 0.8, mask: "upper" },
    roar: { dur: 1.3, mask: "full" },
    leap: { dur: 1.0, mask: "full" },
    talk: { dur: 2.2, mask: "upper" },
    sting: { dur: 0.7, mask: "full" },
    spit: { dur: 0.7, mask: "full" },
  };
  A.LOCO = { idle: 1, walk: 1, run: 1, sneak: 1 };
})();
