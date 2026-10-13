// play-inline-455 05 — fallu
// Lines 930-1250 of readable/play-inline-455.pretty.js (statement-aligned).
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
