// play-inline-501 03 — env
// Lines 665-1006 of readable/play-inline-501.pretty.js (statement-aligned).
  function reloadSingle(m, def, ctx) {
    const c = m.cfg.reload || {};
    const open = c.open || null; // {part, p, r}
    const tOpen = c.tOpen || 0.38,
      tRound = c.tRound || 0.52,
      tClose = c.tClose || 0.38;
    // BB guns / tube feeds pour the whole load in one go
    const fillAll = def.weapon.reloadType === "bb" || c.fillAll;
    const rounds = fillAll ? 1 : Math.max(1, ctx.toLoad);
    const load = m.sockets[c.grip || "load"] || m.sockets.leftHand;
    const tilt0 = c.tilt || { p: [-0.03, -0.01, 0.02], r: [0.12, 0.1, 0.45] };
    const tilt = {
      p: [tilt0.p[0] - 0.015, tilt0.p[1] + 0.015, tilt0.p[2]],
      r: tilt0.r,
    };
    const act = {
      name: "reload",
      model: m,
      abs: true,
      dur: 1,
      blocksAds: true,
      loaded: 0,
      phase: "open",
      pt: 0,
      stopReq: false,
      update(k, a, dt) {
        a.t = 0; // we drive time ourselves
        a.pt += dt;
        // tilt envelope over the whole action
        let tw = 1;
        if (a.phase === "open") tw = ease(Math.min(1, a.pt / tOpen));
        if (a.phase === "close") tw = 1 - ease(Math.min(1, a.pt / tClose));
        addAnim(tilt.p, tilt.r, tw);
        // action open state
        let ok = 1;
        if (a.phase === "open") ok = ease(Math.min(1, a.pt / (tOpen * 0.8)));
        if (a.phase === "close")
          ok = 1 - ease(Math.min(1, a.pt / (tClose * 0.7)));
        if (open && m.parts[open.part]) {
          if (open.p2) {
            // two-stage (bolt: lift then back)
            const k1 = Math.min(1, ok * 2),
              k2 = Math.max(0, ok * 2 - 1);
            P.partOff(
              m.parts[open.part],
              [open.p2[0] * k2, open.p2[1] * k2, open.p2[2] * k2],
              [open.r[0] * k1, open.r[1] * k1, open.r[2] * k1],
            );
          } else P.partOff(m.parts[open.part], open.p, open.r, ok);
        }
        if (c.handOnBolt && m.sockets.boltGrip)
          ov("R", env(Math.min(1, ok), 0, 0.3, 2, 3), m.sockets.boltGrip);
        // left hand
        let wL = 1;
        if (a.phase === "open") wL = ease(Math.min(1, a.pt / (tOpen * 0.6)));
        if (a.phase === "close")
          wL = 1 - ease(Math.min(1, a.pt / (tClose * 0.8)));
        let fetch = 0;
        if (a.phase === "round") {
          const r = a.pt / tRound;
          fetch = env(r, 0, 0.3, 0.35, 0.65);
          addAnim([0, 0.004, 0], [0.02, 0, 0], env(r, 0.62, 0.7, 0.72, 0.85));
        }
        ov("L", wL, load, null, fetch, null, BELOW_L);
        if (c.roundPart && m.parts[c.roundPart]) {
          const part = m.parts[c.roundPart];
          if (a.phase === "round") {
            const r = a.pt / tRound;
            part.visible = r > 0.35;
            P.partOff(
              part,
              c.roundIn || [0, 0, 0.1],
              null,
              1 - ease(Math.min(1, Math.max(0, (r - 0.45) / 0.25))),
            );
          } else
            part.visible =
              a.phase === "close" || (P.state.cur && P.state.cur.mag > 0);
        }
        // phase transitions
        if (a.phase === "open" && a.pt >= tOpen) {
          a.phase = "round";
          a.pt = 0;
          a.inserted = false;
          P.arms.setPose("L", "pinch");
          if (open) sfx("reload", 0.45, 1.4);
        } else if (a.phase === "round") {
          if (!a.inserted && a.pt >= tRound * 0.7) {
            a.inserted = true;
            ctx.onInsert(fillAll ? undefined : 1);
            a.loaded++;
            sfx(c.roundSfx || "reload", 0.5, 1.25 + Math.random() * 0.1);
          }
          if (a.pt >= tRound) {
            a.pt = 0;
            a.inserted = false;
            const cur = P.state.cur;
            const full =
              !cur ||
              cur.mag >= cur.def.weapon.magSize ||
              P.reserve(cur.def) <= 0;
            if (full || a.loaded >= rounds || a.stopReq) {
              a.phase = "close";
              P.arms.setPose("L", m.cfg.leftPose || "support");
            }
          }
        } else if (a.phase === "close") {
          if (!a.closedSfx && a.pt > tClose * 0.5) {
            a.closedSfx = true;
            sfx("reload", 0.55, 1.0);
            V().springs.recZ.v += 0.2;
          }
          if (a.pt >= tClose) {
            a.t = 1;
            a.dur = 1;
            a.hold = false;
            a.done = true;
          }
        }
      },
    };
    // the runner ends the action when t>=dur: we set t=1 in update when done
    act.dur = 1;
    const origUpdate = act.update;
    act.update = function (k, a, dt) {
      origUpdate(k, a, dt);
      if (!a.done) a.t = 0;
    };
    return act;
  }

  // ------------------------------------------------------------------
  // Break-action (sawed-off)
  // ------------------------------------------------------------------
  function reloadBreak(m, def, ctx) {
    const brl = m.parts.barrels;
    return {
      name: "reload",
      model: m,
      dur: def.weapon.reloadTime,
      blocksAds: true,
      events: [
        [0.16, () => sfx("reload", 0.6, 1.2)],
        [
          0.26,
          () => {
            for (let i = 0; i < ctx.spent; i++)
              V().ejectShell("shell", i ? "eject2" : "eject", [0, 0.7, 1], 1.8);
          },
        ],
        [0.35, () => P.arms.setPose("L", "pinch")],
        [
          0.62,
          () => {
            ctx.onInsert();
            sfx("reload_shotgun", 0.7, 1.0);
          },
        ],
        [
          0.74,
          () => {
            sfx("reload", 0.8, 0.85);
            V().springs.recP.v += 3;
            V().springs.recZ.v -= 0.2;
            P.arms.setPose("L", m.cfg.leftPose || "support");
          },
        ],
      ],
      update(k) {
        addAnim(
          [-0.04, -0.01, -0.01],
          [0.25, 0.2, 0.45],
          env(k, 0, 0.14, 0.78, 0.96),
        );
        // snap-closed flick
        addAnim([0, 0.01, 0], [0.25, 0, 0], env(k, 0.72, 0.75, 0.77, 0.85));
        if (brl)
          P.partOff(brl, null, [-0.75, 0, 0], env(k, 0.12, 0.22, 0.7, 0.75));
        const wL = env(k, 0.05, 0.14, 0.75, 0.85);
        const fetch = env(k, 0.32, 0.42, 0.46, 0.58);
        ov(
          "L",
          wL,
          m.sockets.load || m.sockets.leftHand,
          null,
          fetch,
          null,
          BELOW_L,
        );
        if (m.parts.loadShells)
          m.parts.loadShells.visible = k > 0.5 && k < 0.64;
      },
    };
  }

  // ------------------------------------------------------------------
  // Bolt / lever / pump cycles (after a shot)
  // ------------------------------------------------------------------
  P.cycleAction = function (m, def, kind) {
    const c = m.cfg.cycle || {};
    if (kind === "bolt") {
      const bolt = m.parts.bolt;
      return {
        name: "cycle",
        model: m,
        dur: c.dur || 0.62,
        blocksAds: false,
        events: P.hasSfx("bolt_action")
          ? [
              [0.12, () => sfx("bolt_action", 0.7, 1.0)],
              [
                0.42,
                () =>
                  V().ejectShell(def.weapon.shell, "eject", [1, 0.8, 0.3], 1.8),
              ],
            ]
          : [
              [0.15, () => sfx("reload", 0.35, 1.6)],
              [
                0.42,
                () => {
                  V().ejectShell(def.weapon.shell, "eject", [1, 0.8, 0.3], 1.8);
                  sfx("reload", 0.4, 1.3);
                },
              ],
              [0.72, () => sfx("reload", 0.35, 1.7)],
            ],
        update(k) {
          const lift = env(k, 0.12, 0.26, 0.7, 0.82),
            back = env(k, 0.28, 0.42, 0.46, 0.64);
          if (bolt)
            P.partOff(
              bolt,
              [0, 0, (c.travel || 0.075) * back],
              [0, 0, (c.lift || 1.1) * lift],
            );
          ov("R", env(k, 0.0, 0.13, 0.84, 1.0), m.sockets.boltGrip);
          addAnim(
            [-0.01, -0.01, 0.01],
            [0.03, 0.04, 0.18],
            env(k, 0, 0.12, 0.8, 1),
          );
          if (V().adsT > 0.5)
            addAnim([0, -0.02, 0.03], [-0.05, 0, 0], env(k, 0, 0.15, 0.8, 1));
        },
      };
    }
    if (kind === "lever") {
      const lever = m.parts.lever;
      return {
        name: "cycle",
        model: m,
        dur: c.dur || 0.42,
        blocksAds: false,
        events: [
          [0.1, () => sfx("reload", 0.35, 1.8)],
          [0.55, () => sfx("reload", 0.35, 2.0)],
        ],
        update(k) {
          const e = env(k, 0.05, 0.4, 0.45, 0.85);
          if (lever) P.partOff(lever, null, [c.angle || -0.9, 0, 0], e);
          addAnim([0, -0.012, 0], [0.08, 0, 0.05], e);
        },
      };
    }
    // pump
    const pump = m.parts.pump;
    return {
      name: "cycle",
      model: m,
      dur: c.dur || 0.42,
      blocksAds: false,
      events: P.hasSfx("shotgun_pump")
        ? [
            [0.12, () => sfx("shotgun_pump", 0.75, 1.0)],
            [
              0.35,
              () =>
                V().ejectShell(def.weapon.shell, "eject", [1, 0.6, 0.2], 1.6),
            ],
          ]
        : [
            [0.2, () => sfx("reload_shotgun", 0.5, 1.2)],
            [
              0.35,
              () =>
                V().ejectShell(def.weapon.shell, "eject", [1, 0.6, 0.2], 1.6),
            ],
            [0.6, () => sfx("reload_shotgun", 0.5, 1.0)],
          ],
      update(k) {
        const e = env(k, 0.1, 0.35, 0.4, 0.7);
        if (pump) P.partOff(pump, [0, 0, 0.07], null, e);
        addAnim([0, -0.005, 0.01], [0.04, 0, 0], e);
      },
    };
  };

  // ------------------------------------------------------------------
  // Jam: slap + rack
  // ------------------------------------------------------------------
  P.jamAction = function (m, def, onDone) {
    const c = m.cfg.reload || {};
    const charge = c.charge;
    return {
      name: "jam",
      model: m,
      dur: 1.15,
      blocksAds: true,
      events: [
        [0.0, () => sfx("empty_click", 0.9, 0.8)],
        [
          0.35,
          () => {
            sfx("melee_hit", 0.25, 2.0);
            V().springs.recR.v += 3;
          },
        ],
        [0.62, () => sfx("reload", 0.7, 1.2)],
        [0.95, () => onDone && onDone()],
      ],
      update(k) {
        addAnim([-0.03, 0.0, 0.03], [0.2, 0.25, 0.7], env(k, 0, 0.18, 0.8, 1));
        addAnim([0, 0.01, 0], [0, 0, -0.15], env(k, 0.32, 0.35, 0.37, 0.45)); // slap
        const cs = charge && m.sockets[charge.grip || "chargeGrip"];
        if (cs) ov(charge.hand || "L", env(k, 0.2, 0.32, 0.72, 0.86), cs);
        else if (m.sockets.magGrip)
          ov("L", env(k, 0.2, 0.32, 0.5, 0.6), m.sockets.magGrip);
        if (charge && m.parts[charge.part])
          P.partOff(
            m.parts[charge.part],
            charge.p,
            charge.r,
            env(k, 0.52, 0.6, 0.62, 0.7),
          );
      },
    };
  };

  // ------------------------------------------------------------------
  // Idle inspect (fidget): turn the weapon over to look at it
  // ------------------------------------------------------------------
