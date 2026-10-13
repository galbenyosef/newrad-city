// play-inline-455 07 — math
// Lines 1587-1935 of readable/play-inline-455.pretty.js (statement-aligned).
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
