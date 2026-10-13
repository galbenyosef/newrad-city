// play-inline-501 04 — ctx
// Lines 1007-1326 of readable/play-inline-501.pretty.js (statement-aligned).
  P.inspectAction = function (m) {
    const melee =
      (m.cfg.rightPose === "grip" || m.cfg.rightPose === "gripThin") &&
      !m.sockets.sight;
    return {
      name: "inspect",
      model: m,
      dur: melee ? 2.2 : 2.8,
      blocksFire: false,
      blocksAds: false,
      events: [
        [0.12, () => sfx("reload", 0.12, 1.8)],
        [0.5, () => sfx("reload", 0.1, 1.6)],
      ],
      update(k) {
        const a = env(k, 0.02, 0.2, 0.42, 0.55),
          b = env(k, 0.48, 0.62, 0.82, 0.97);
        const wob = Math.sin(k * 20) * 0.01;
        if (melee) {
          addAnim([-0.05, 0.05, 0.03], [0.3 + wob, 0.4, 0.5], a);
          addAnim([-0.03, 0.04, 0.02], [0.2, -0.3, -0.3 + wob], b);
        } else {
          addAnim([-0.07, 0.05, 0.06], [0.12 + wob, 0.55, 0.95], a);
          addAnim([-0.05, 0.04, 0.05], [0.25, -0.35, -0.45 + wob], b);
        }
      },
    };
  };

  // ------------------------------------------------------------------
  // Reload dispatcher
  // ------------------------------------------------------------------
  P.reloadAction = function (m, def, ctx) {
    const rt = (m.cfg.reload && m.cfg.reload.type) || def.weapon.reloadType;
    switch (rt) {
      case "revolver":
        return reloadRevolver(m, def, ctx);
      case "single":
      case "bb":
        return reloadSingle(m, def, ctx);
      case "breakaction":
        return reloadBreak(m, def, ctx);
      default:
        return reloadMag(m, def, ctx);
    }
  };

  // ------------------------------------------------------------------
  // Melee
  // ------------------------------------------------------------------
  // Offsets relative to the hip pose. W = wind-up, S = strike end.
  const MELEE = {
    swing: {
      W: { p: [0.07, 0.07, 0.08], r: [0.3, -0.45, -0.45] },
      S: { p: [-0.3, -0.02, -0.06], r: [-1.1, 0.9, 1.7] },
      wu: 0.16,
      st: 0.2,
      rc: 0.3,
      hit: 0.45,
    },
    overhead: {
      W: { p: [0.0, 0.12, 0.1], r: [0.45, 0.0, 0.25] },
      S: { p: [-0.12, -0.06, -0.14], r: [-1.75, 0.2, 0.55] },
      wu: 0.3,
      st: 0.22,
      rc: 0.45,
      hit: 0.55,
    },
    slash: {
      W: { p: [0.08, 0.09, 0.06], r: [0.5, -0.6, -1.0] },
      S: { p: [-0.22, -0.12, -0.12], r: [-0.45, 0.95, 0.7] },
      wu: 0.1,
      st: 0.16,
      rc: 0.22,
      hit: 0.45,
    },
    stab: {
      W: { p: [0.02, 0.01, 0.1], r: [0.15, 0.05, 0] },
      S: { p: [-0.05, 0.03, -0.3], r: [-0.08, 0.1, 0.1] },
      wu: 0.1,
      st: 0.12,
      rc: 0.2,
      hit: 0.6,
    },
    punch: {
      W: { p: [0.01, -0.012, 0.05], r: [0.08, -0.06, 0] },
      S: { p: [-0.075, 0.045, -0.21], r: [0.1, 0.18, -0.35] },
      wu: 0.08,
      st: 0.11,
      rc: 0.2,
      hit: 0.7,
    },
  };
  P.MELEE = MELEE;
  /**
   * Melee action with a hold phase. ctx: {power:false, onHit(power), style}
   * The action starts in 'windup'; P.meleeRelease(act) moves it to strike.
   */
  P.meleeAction = function (m, def, ctx) {
    const style = MELEE[ctx.style] || MELEE.swing;
    const punchSide = ctx.side || "R"; // for fists: which fist
    const fistPart =
      def.weapon.meleeStyle === "punch"
        ? m.parts[punchSide === "R" ? "fistR" : "fistL"]
        : null;
    const act = {
      name: "melee",
      model: m,
      dur: 1,
      blocksAds: true,
      hold: true,
      phase: "windup",
      pt: 0,
      power: false,
      released: !!ctx.instant,
      hitDone: false,
      update(k, a, dt) {
        a.pt += dt * (ctx.speed || 1); // <1 when the weapon is too heavy (Strength requirement)
        const pw = a.power ? 1.3 : 1;
        const W = style.W,
          S = style.S;
        let wP = [0, 0, 0],
          wR = [0, 0, 0];
        const mix = (o, t) => {
          wP = [o.p[0] * t, o.p[1] * t, o.p[2] * t];
          wR = [o.r[0] * t, o.r[1] * t, o.r[2] * t];
        };
        if (a.phase === "windup") {
          const t = ease(Math.min(1, a.pt / style.wu));
          mix(W, t * (a.charging ? pw : 1));
          if (a.charging) {
            const sh = Math.sin(a.pt * 40) * 0.0015;
            wP[0] += sh;
            wP[1] += sh;
          }
          if (a.pt >= style.wu && a.released) {
            a.phase = "strike";
            a.pt = 0;
            G.sfx.play(
              def.weapon.sound === "punch" ? "melee_swing" : "melee_swing",
              {
                volume: 0.7 * pw,
                pitch: (a.power ? 0.8 : 1) * (ctx.pitch || 1),
              },
            );
          }
          // holding past threshold → power attack charge
          if (
            !a.released &&
            a.pt > (ctx.powerHold || 0.42) &&
            !a.charging &&
            ctx.canPower &&
            ctx.canPower()
          ) {
            a.charging = true;
            a.power = true;
            ctx.onCharge && ctx.onCharge();
          }
        } else if (a.phase === "strike") {
          const stDur = style.st / (a.power ? 1.15 : 1);
          const t = Math.min(1, a.pt / stDur);
          const e = t * t * (3 - 2 * t);
          // W -> S
          for (let i = 0; i < 3; i++) {
            wP[i] = (W.p[i] * (1 - e) + S.p[i] * e) * pw;
            wR[i] = (W.r[i] * (1 - e) + S.r[i] * e) * pw;
          }
          if (!a.hitDone && t >= style.hit) {
            a.hitDone = true;
            ctx.onHit && ctx.onHit(a.power);
          }
          if (t >= 1) {
            a.phase = "recover";
            a.pt = 0;
          }
        } else if (a.phase === "recover") {
          const t = ease(Math.min(1, a.pt / style.rc));
          for (let i = 0; i < 3; i++) {
            wP[i] = S.p[i] * pw * (1 - t);
            wR[i] = S.r[i] * pw * (1 - t);
          }
          if (t >= 1) {
            a.hold = false;
            a.t = 1;
            a.dur = 1;
          }
        }
        if (fistPart) {
          // fists: move only the punching fist; the other stays in guard
          const sideSign = punchSide === "R" ? 1 : -1;
          P.partOff(
            fistPart,
            [wP[0] * sideSign, wP[1], wP[2]],
            [wR[0], wR[1] * sideSign, wR[2] * sideSign],
          );
          addAnim([0, 0, 0], [0, -wR[1] * 0.05, 0]);
          if (m.parts.piston && a.phase === "strike" && a.hitDone)
            P.partOff(m.parts.piston, [0, 0, -0.05], null, 1);
        } else {
          addAnim(wP, wR);
        }
        if (a.phase !== "recover" || a.pt < style.rc) a.t = 0; // runner time unused
      },
    };
    return act;
  };
  P.meleeRelease = function (a) {
    if (a && a.name === "melee") a.released = true;
  };

  // ------------------------------------------------------------------
  // Grenade throw
  // ------------------------------------------------------------------
  // right-hand free poses (camera space) for the throw
  const TH = {
    hold: { p: [0.16, -0.2, -0.32], x: [0.2, -0.9, 0.3], y: [0.95, 0.2, 0.1] },
    back: { p: [0.24, 0.02, 0.02], x: [0.1, -0.7, -0.6], y: [0.9, 0.3, -0.2] },
    fore: {
      p: [0.02, -0.08, -0.5],
      x: [-0.2, -0.8, -0.3],
      y: [0.8, 0.1, -0.6],
    },
    follow: {
      p: [-0.06, -0.35, -0.38],
      x: [-0.3, -0.6, -0.7],
      y: [0.6, 0.6, -0.4],
    },
    lPin: {
      p: [0.02, -0.16, -0.3],
      x: [0.4, -0.8, -0.2],
      y: [-0.9, -0.3, 0.1],
    },
    lAim: {
      p: [-0.14, -0.08, -0.46],
      x: [0.3, -0.9, -0.2],
      y: [-0.6, -0.1, 0.8],
    },
  };
  P.THROW_POSES = TH;
  P.throwAction = function (m, def, ctx) {
    const quick = !!ctx.quick;
    const lerpPose = (a, b, t) => ({
      p: a.p.map((v, i) => v + (b.p[i] - v) * t),
      x: a.x.map((v, i) => v + (b.x[i] - v) * t),
      y: a.y.map((v, i) => v + (b.y[i] - v) * t),
    });
    return {
      name: "throw",
      model: m,
      dur: quick ? 1.05 : 0.85,
      blocksAds: true,
      events: [
        [
          quick ? 0.22 : 0.05,
          () => {
            ctx.showGrenade(true);
            P.arms.setPose("R", "cup");
          },
        ],
        [
          quick ? 0.36 : 0.2,
          () => {
            sfx2("grenade_pin", 0.7, 1.0, "reload", 0.3, 2.2);
          },
        ], // pin
        [
          quick ? 0.6 : 0.52,
          () => {
            ctx.release();
            ctx.showGrenade(false);
            sfx2("grenade_throw", 0.7, 1.0, "melee_swing", 0.6, 1.3);
            P.arms.setPose("R", "relaxed");
          },
        ],
      ],
      update(k) {
        let rp;
        const T0 = quick ? 0.22 : 0.0,
          T1 = quick ? 0.42 : 0.25,
          T2 = quick ? 0.6 : 0.52,
          T3 = quick ? 0.8 : 0.75;
        if (k < T1)
          rp = lerpPose(
            P.BELOW_R,
            TH.hold,
            ease(Math.max(0, (k - T0) / (T1 - T0))),
          );
        else if (k < T2 - 0.06)
          rp = lerpPose(TH.hold, TH.back, ease((k - T1) / (T2 - 0.06 - T1)));
        else if (k < T2 + 0.04)
          rp = lerpPose(TH.back, TH.fore, ease((k - (T2 - 0.06)) / 0.1));
        else if (k < T3)
          rp = lerpPose(
            TH.fore,
            TH.follow,
            ease((k - T2 - 0.04) / (T3 - T2 - 0.04)),
          );
        else rp = lerpPose(TH.follow, P.BELOW_R, ease((k - T3) / (1 - T3)));
        ov("R", 1, null, rp);
        // left hand: pin pull then point forward
        const lp = k < (quick ? 0.45 : 0.3) ? TH.lPin : TH.lAim;
        const lw = env(
          k,
          quick ? 0.2 : 0.0,
          quick ? 0.32 : 0.12,
          quick ? 0.8 : 0.72,
          quick ? 0.95 : 0.9,
        );
        ov("L", lw, null, lp);
        if (quick) {
          // gun drops out of view, returns at the end
          const low = env(k, 0, 0.18, 0.82, 1);
          addAnim([0.05, -0.32, 0.1], [-0.9, 0.3, 0.3], low);
          V().hideModel = low > 0.8;
        } else {
          V().hideModel = true;
        }
      },
    };
  };
