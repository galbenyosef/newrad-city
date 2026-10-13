// play-inline-455 04 — strike
// Lines 596-929 of readable/play-inline-455.pretty.js (statement-aligned).
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

