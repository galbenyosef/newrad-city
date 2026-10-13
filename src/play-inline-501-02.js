// play-inline-501 02 — the
// Lines 334-664 of readable/play-inline-501.pretty.js (statement-aligned).
  function reloadMag(m, def, ctx) {
    const c = m.cfg.reload || {};
    const part = m.parts[c.part || "mag"];
    const grip = m.sockets[c.grip || "magGrip"];
    const axis = c.axis || [0, -1, 0];
    const out = c.out === undefined ? 0.06 : c.out;
    const away0 = c.away || [-0.04, -0.34, 0.1];
    const tilt0 = c.tilt || { p: [-0.02, -0.015, 0.02], r: [0.15, 0.12, 0.5] };
    const long =
      def.weapon.twoHanded &&
      m.sockets.rightHand &&
      !(m.cfg.reload && m.cfg.reload.noLift) &&
      m.cfg.hip &&
      m.cfg.hip.p[1] < -0.15;
    // Long guns: lifted toward the centre and rolled clockwise (top to the right) so the magwell turns
    // toward the left hand arriving from the bottom-left; muzzle up a touch so the stock stays below the frame.
    const RIFLE_RELOAD = { p: [-0.07, 0.08, 0.0], r: [0.14, 0.2, -0.5] };
    // One-handed handguns: raised toward the centre, muzzle up so the grip's magwell turns toward the eye and
    // canted clockwise toward the left hand coming up from below.
    const ONEH_RELOAD = { p: [-0.075, 0.1, -0.02], r: [0.6, 0.15, -0.35] };
    const tilt = long
      ? m.cfg.reload.pose || RIFLE_RELOAD
      : m.cfg.oneHanded
        ? c.oneHPose || ONEH_RELOAD
        : {
            p: [tilt0.p[0] - 0.02, tilt0.p[1] + 0.02, tilt0.p[2] - 0.01],
            r: [tilt0.r[0], tilt0.r[1] * 0.8, tilt0.r[2]],
          };
    const charge =
      c.charge && (ctx.wasEmpty || c.alwaysCharge) ? c.charge : null;
    const isCell = def.weapon.reloadType === "cell";
    const carry = !!c.carry || !part || c.part === "tank";
    const A = [axis[0] * out, axis[1] * out, axis[2] * out];
    // the fresh mag rises from well below the frame along (roughly) the drop line
    const far = [
      A[0] + away0[0] * 1.1,
      A[1] + away0[1] * 1.1,
      A[2] + away0[2] * 1.1,
    ];
    const tIns = charge ? 0.6 : 0.66;
    const tRel = 0.12,
      tGone = 0.3,
      tBack = 0.32;
    const endT = charge ? 0.9 : 0.86;
    const dur = def.weapon.reloadTime * (c.speed || 1);
    const down = [0, -1, 0];
    const spin = [
      (Math.random() < 0.5 ? -1 : 1) * (2 + Math.random() * 2),
      0,
      (Math.random() - 0.5) * 5,
    ];
    // carry-style track (old behaviour) for parts that are handed off, not dropped
    const B = [
      A[0] + away0[0] * 0.8,
      A[1] + away0[1] * 0.5,
      A[2] + away0[2] * 0.6,
    ];
    const carryTr = [
      [0, [0, 0, 0]],
      [0.15, [0, 0, 0]],
      [0.24, A],
      [0.4, B],
      [0.44, B],
      [tIns - 0.1, A],
      [tIns - 0.02, [0, 0, 0]],
    ];
    const newTr = [
      [tBack, far],
      [
        tBack + 0.09,
        [
          far[0] * 0.45 + A[0] * 0.55,
          far[1] * 0.45 + A[1] * 0.55,
          far[2] * 0.45 + A[2] * 0.55,
        ],
      ],
      [tIns - 0.09, A],
      [tIns - 0.02, [0, 0, 0]],
    ];
    const act = {
      name: "reload",
      model: m,
      dur,
      blocksAds: true,
      events: [
        [
          0.06,
          () => {
            P.arms.setPose("L", "cup");
          },
        ],
        [
          tRel - 0.01,
          () => {
            if (isCell)
              sfx2("reload_energy", 0.6, 1.05, "hum_electric", 0.25, 2.2);
            else sfx("reload", 0.55, 1.15);
            if (isCell && G.fx.sparks && ctx.fxSpark) ctx.fxSpark();
            V().springs.recZ.v += 0.1;
          },
        ],
        [
          tRel + 0.12,
          () => {
            if (!carry)
              sfx("ricochet", isCell ? 0.05 : 0.07, isCell ? 1.6 : 0.6);
          },
        ], // spent mag clatters away
        [tBack, () => P.arms.setPose("L", "grip")],
        [tIns - 0.08, () => sfx("reload", 0.45, 1.3)], // mag lips into the well
        [
          tIns - 0.03,
          () => {
            ctx.onInsert();
            sfx("reload", 0.75, 0.9);
            const S = V().springs;
            S.recZ.v += 0.3;
            S.recP.v -= 1.1;
            S.recR.v += 0.9;
          },
        ], // palm slap
      ],
      update(k) {
        const tw = env(k, 0, 0.14, endT - 0.05, 1);
        addAnim(tilt.p, tilt.r, tw);
        // ---- magazine / cell
        if (part) {
          if (carry) {
            P.partOff(
              part,
              kf(carryTr, k),
              isCell
                ? [
                    kf(
                      [
                        [0, 0],
                        [0.15, 0],
                        [0.4, 1.2],
                        [0.44, 0],
                        [1, 0],
                      ],
                      k,
                    ),
                    0,
                    0,
                  ]
                : null,
            );
            part.visible = !(k > 0.41 && k < 0.43);
          } else if (k >= tRel && k < tGone) {
            // released: slides out of the well, then falls (screen-down) and tumbles
            const s = (k - tRel) * dur;
            const slide = Math.min(1, s / 0.07);
            localDown(part, down);
            const g = 0.5 * 5.5 * s * s,
              v0 = (isCell ? 0.55 : 0.25) * s;
            const p = [
              A[0] * slide + axis[0] * v0 + down[0] * g,
              A[1] * slide + axis[1] * v0 + down[1] * g,
              A[2] * slide + axis[2] * v0 + down[2] * g,
            ];
            const sp = Math.max(0, s - 0.05);
            partOffAbout(part, p, [spin[0] * sp, 0, spin[2] * sp]);
          } else if (k >= tGone && k < tBack + 0.02) {
            part.visible = false; // out of frame / in the pouch
          } else if (k >= tBack + 0.02) {
            P.partOff(part, kf(newTr, k), null); // the fresh one, in the hand
          }
        }
        // ---- left hand: (hold) → down to the pouch → up with the fresh mag → (charge) → hold
        const wIn = env(k, 0.04, tRel + 0.02, 2, 3); // leaves the hold / rest
        const fetch = carry
          ? env(k, 0.3, 0.38, 0.42, 0.5)
          : k < tBack
            ? 1
            : 1 - ease(Math.min(1, (k - tBack) / 0.09));
        let wOut = charge
          ? env(k, -1, 0, 0.84, 0.93)
          : env(k, -1, 0, tIns + 0.02, tIns + 0.12);
        const w = Math.min(wIn, wOut);
        if (carry) {
          if (grip)
            ov(
              "L",
              env(k, 0.04, 0.14, tIns, tIns + 0.08),
              grip,
              null,
              fetch,
              null,
              BELOW_L,
            );
        } else if (k < tBack) {
          ov("L", w, null, BELOW_L); // straight down: the old mag falls past it
        } else if (grip) {
          ov("L", w, grip, null, fetch, null, BELOW_L);
          V().handOv.L.basis = LB_MAG;
        }
        if (charge) {
          const cs = m.sockets[charge.grip || "chargeGrip"];
          const cw = env(k, tIns + 0.01, tIns + 0.09, 2, 3);
          if (cs && cw > 0) {
            if ((charge.hand || "L") === "L") {
              // mag → slide/handle, one continuous move
              ov("L", w, grip || cs, null, grip ? cw : 0, grip ? cs : null);
              const o = V().handOv.L;
              if (grip) {
                o.basis = LB_MAG;
                o.basis2 = LB_RACK;
              } else o.basis = LB_RACK;
            } else ov("R", env(k, tIns + 0.01, tIns + 0.09, 0.84, 0.93), cs);
          }
          const cp = m.parts[charge.part];
          if (cp) {
            const ck = env(
              k,
              tIns + 0.1,
              tIns + 0.15,
              tIns + 0.17,
              tIns + 0.21,
            );
            P.partOff(cp, charge.p, charge.r, ck);
          }
        }
        // seat jolt (palm slap drives the gun up and back a hair)
        const j = env(k, tIns - 0.035, tIns - 0.015, tIns - 0.005, tIns + 0.07);
        addAnim([0, 0.014, 0.006], [-0.06, 0, 0.03], j);
        // rack: gun yanked back by the slide pull
        if (charge)
          addAnim(
            [0, -0.004, 0.012],
            [0.04, 0, 0],
            env(k, tIns + 0.1, tIns + 0.14, tIns + 0.16, tIns + 0.24),
          );
      },
    };
    if (charge)
      act.events.push([
        tIns + 0.15,
        () => {
          sfx("reload", 0.6, 1.35);
          V().springs.recZ.v += 0.25;
        },
      ]);
    act.events.push([
      charge ? 0.86 : tIns + 0.04,
      () => P.arms.setPose("L", m.cfg.leftPose || "support"),
    ]);
    return act;
  }

  // ------------------------------------------------------------------
  // Revolver (swing-out cylinder, speedloader)
  // ------------------------------------------------------------------
  function reloadRevolver(m, def, ctx) {
    const c = m.cfg.reload || {};
    const cyl = m.parts.crane || m.parts.cylinder;
    const grip = m.sockets.cylGrip || m.sockets.leftHand;
    const swing = c.swing || { p: [-0.018, -0.004, 0], r: [0, 0, 1.25] };
    const n = ctx.spent;
    return {
      name: "reload",
      model: m,
      dur: def.weapon.reloadTime,
      blocksAds: true,
      events: [
        [0.17, () => sfx("reload", 0.5, 1.35)],
        [
          0.3,
          () => {
            for (let i = 0; i < n; i++)
              setTimeout(
                () =>
                  V().ejectShell(
                    def.weapon.shellKind || "magnum",
                    "cylEject",
                    [(Math.random() - 0.5) * 0.4, -0.3, 1],
                    1.2,
                  ),
                i * 25,
              );
            sfx("ricochet", 0.08, 1.8);
          },
        ],
        [0.36, () => P.arms.setPose("L", "pinch")],
        [
          0.64,
          () => {
            ctx.onInsert();
            sfx("reload", 0.7, 0.95);
          },
        ],
        [
          0.74,
          () => {
            sfx("reload", 0.6, 1.5);
            V().springs.recR.v -= 3;
            P.arms.setPose("L", m.cfg.leftPose || "support");
            V().cylTarget = (V().cylTarget || 0) + Math.PI * 2 * 1.5;
          },
        ],
      ],
      update(k) {
        // muzzle up, rolled left, pulled toward the chest
        const tw = env(k, 0, 0.16, 0.76, 0.97);
        // (one-handed hold: brought to the centre at arm's length instead of against the chest, so the left
        //  hand works the cylinder in plain view rather than filling the lens)
        if (m.cfg.oneHanded)
          addAnim([-0.1, 0.05, -0.08], [0.85, 0.3, 0.55], tw);
        else addAnim([-0.07, 0.03, 0.06], [0.95, 0.35, 0.55], tw);
        // cylinder swing
        const sw = env(k, 0.14, 0.22, 0.7, 0.76);
        if (cyl) P.partOff(cyl, swing.p, swing.r, sw);
        // ejector rod push (visual poke by palm)
        if (m.parts.ejector)
          P.partOff(
            m.parts.ejector,
            [0, 0, 0.02],
            null,
            env(k, 0.26, 0.3, 0.32, 0.36),
          );
        // left hand: to cylinder, down to fetch speedloader, back, away
        const wL = env(k, 0.08, 0.18, 0.78, 0.9);
        const fetch = env(k, 0.36, 0.46, 0.5, 0.6);
        ov("L", wL, grip, null, fetch, null, BELOW_L);
      },
    };
  }

  // ------------------------------------------------------------------
  // Per-round loop (bolt rifles, the .32 bolt rifle, launchers, recoilless rifle)
  // ------------------------------------------------------------------
