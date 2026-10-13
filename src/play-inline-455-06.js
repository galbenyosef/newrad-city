// play-inline-455 06 — math
// Lines 1251-1586 of readable/play-inline-455.pretty.js (statement-aligned).
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
