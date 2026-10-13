// play-inline-455 03 — math
// Lines 292-595 of readable/play-inline-455.pretty.js (statement-aligned).
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
