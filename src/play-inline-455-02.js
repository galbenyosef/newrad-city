// play-inline-455 02 — the
// Lines 24-291 of readable/play-inline-455.pretty.js (statement-aligned).
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

