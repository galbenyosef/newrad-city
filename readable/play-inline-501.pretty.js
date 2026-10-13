/* src/weapons/55_actions.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: viewmodel actions (animation timelines)
 *
 * An "action" is a timed animation that drives:
 *   V.anim.p / V.anim.r     weapon offset (added on top of hip/ADS pose)
 *   model part transforms   (mag out, bolt back, cylinder swing ...)
 *   V.handOv.R / .L         hand targets (socket / free pose, with blend)
 *   timed events            (sounds, ammo transfer, shell ejection, hits)
 *
 * Reload families: mag, drum, cell, revolver, single (per-round loop),
 * breakaction, bb.  Cycles: bolt, lever, pump.  Also melee swings with
 * wind-up/hold/power, grenade throws, jams and the shot-part animation
 * (slides, hammers, triggers, revolver cylinders).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const kf = (tr, t, o) => P.kf(tr, t, o);
  const ease = (t) => P.ease(t);
  const V = () => P.view;

  // ------------------------------------------------------------------
  // Parts
  // ------------------------------------------------------------------
  const _q = new THREE.Quaternion(),
    _e = new THREE.Euler();
  P.resetParts = function (m) {
    for (const k in m.parts) {
      const part = m.parts[k];
      const r = part.userData.rest;
      if (!r) continue;
      part.position.copy(r.p);
      part.quaternion.copy(r.q);
      part.visible = true;
    }
  };
  /** Offset a part from its rest pose: p (array, parent space) and r (euler array, local). */
  P.partOff = function (part, p, r, k) {
    if (!part || !part.userData.rest) return;
    k = k === undefined ? 1 : k;
    const rest = part.userData.rest;
    if (p)
      part.position.set(
        rest.p.x + p[0] * k,
        rest.p.y + p[1] * k,
        rest.p.z + p[2] * k,
      );
    if (r) {
      _e.set(r[0] * k, r[1] * k, r[2] * k);
      _q.setFromEuler(_e);
      part.quaternion.copy(rest.q).multiply(_q);
    }
  };
  function addAnim(p, r, k) {
    const A = V().anim;
    k = k === undefined ? 1 : k;
    if (p) {
      A.p[0] += p[0] * k;
      A.p[1] += p[1] * k;
      A.p[2] += p[2] * k;
    }
    if (r) {
      A.r[0] += r[0] * k;
      A.r[1] += r[1] * k;
      A.r[2] += r[2] * k;
    }
  }
  P.addAnim = addAnim;
  function ov(side, w, socket, free, t2, socket2, free2) {
    const o = V().handOv[side];
    o.w = w;
    o.socket = socket || null;
    o.free = free || null;
    o.t2 = t2 || 0;
    o.socket2 = socket2 || null;
    o.free2 = free2 || null;
  }
  P.handOverride = ov;
  /** hand basis (view camera space) from the wrist direction W (hand +Z) and the back-of-hand direction B */
  function handBasis(W, B) {
    const z = new THREE.Vector3().fromArray(W).normalize();
    const y = new THREE.Vector3().fromArray(B);
    y.addScaledVector(z, -y.dot(z)).normalize();
    const x = new THREE.Vector3().crossVectors(y, z);
    return P.basisQ(x.toArray(), y.toArray());
  }
  P.handBasis = handBasis;
  // Left hand working a magazine from below (palm up around the base, fingers up the front, wrist down-left)
  // and racking a slide / charging handle overhand (palm down, wrist back-left). Camera-space bases: the
  // gun's reload cant then never twists the forearm up across the lens.
  const LB_MAG = handBasis([-0.42, -0.82, 0.38], [-0.8, 0.3, -0.5]);
  const LB_RACK = handBasis([-0.75, -0.38, 0.55], [-0.3, 0.92, 0.0]);

  // ------------------------------------------------------------------
  // Shot animation: slides, hammers, triggers, cylinders
  // ------------------------------------------------------------------
  P.updateShotParts = function (m, dt) {
    const v = V();
    v.shotT += dt;
    const cfg = m.cfg;
    const cur = P.state.cur;
    const mag = cur ? cur.mag : 1;
    if (cfg.shot) {
      for (const s of cfg.shot) {
        const part = m.parts[s.part];
        if (!part) continue;
        let k;
        if (s.held) k = v.triggerK || 0;
        else {
          const d = s.dur || 0.07,
            t = v.shotT;
          k =
            t < d * 0.25
              ? t / (d * 0.25)
              : Math.max(0, 1 - (t - d * 0.25) / (d * 0.75));
          if (
            s.lockEmpty &&
            mag <= 0 &&
            cur &&
            cur.def.weapon.magSize > 0 &&
            !P.action
          )
            k = 1;
          if (s.cockedWhenReady) k = v.shotT < (s.dur || 0.1) ? 0 : 1;
        }
        P.partOff(part, s.p, s.r, k);
      }
    }
    // revolver cylinder step (animated)
    if (m.parts.cylinder && cfg.cylinderStep) {
      v.cylAngle = G.util.damp(v.cylAngle || 0, v.cylTarget || 0, 22, dt);
      const rest = m.parts.cylinder.userData.rest;
      _e.set(0, 0, v.cylAngle);
      _q.setFromEuler(_e);
      m.parts.cylinder.quaternion.copy(rest.q).multiply(_q);
    }
    // trigger finger
    v.triggerK = G.util.damp(v.triggerK || 0, v.triggerHeld ? 1 : 0, 30, dt);
  };

  // ------------------------------------------------------------------
  // Action runner
  // ------------------------------------------------------------------
  P.action = null;
  /**
   * def: {name, dur, update(k, act, dt), events:[[t, fn]], onEnd(), onCancel(), blocksFire, blocksAds, interruptible, abs (use seconds)}
   */
  P.startAction = function (def) {
    if (P.action) P.cancelAction();
    def.t = 0;
    def.fired = new Set();
    if (def.blocksFire === undefined) def.blocksFire = true;
    P.action = def;
    P.state.busyNoAds = def.blocksAds !== false;
    return def;
  };
  P.cancelAction = function () {
    const a = P.action;
    if (!a) return;
    P.action = null;
    P.state.busyNoAds = false;
    try {
      if (a.onCancel) a.onCancel(a);
    } catch (e) {
      G.reportError("weapons:cancel", e);
    }
    restorePoses();
  };
  function restorePoses() {
    const m = V().model;
    if (!m) return;
    P.arms.setPose("R", m.cfg.rightPose || "trigger");
    P.arms.setPose("L", m.cfg.leftPose || "support");
  }
  P.updateAction = function (dt) {
    const a = P.action;
    if (!a) return;
    if (!V().model || (a.model && a.model !== V().model)) {
      P.cancelAction();
      return;
    }
    a.t += dt * (a.speed || 1);
    const dur = a.dur || 1;
    const k = Math.min(1, a.t / dur);
    if (a.events)
      for (let i = 0; i < a.events.length; i++) {
        const ev = a.events[i];
        if (!a.fired.has(i) && k >= ev[0]) {
          a.fired.add(i);
          try {
            ev[1](a);
          } catch (e) {
            G.reportError("weapons:event " + a.name, e);
          }
        }
        if (P.action !== a) return; // event may have replaced the action
      }
    try {
      a.update(k, a, dt);
    } catch (e) {
      G.reportError("weapons:action " + a.name, e);
      P.action = null;
      return;
    }
    if (P.action === a && k >= 1 && !a.hold) {
      P.action = null;
      P.state.busyNoAds = false;
      restorePoses();
      if (a.onEnd) {
        try {
          a.onEnd(a);
        } catch (e) {
          G.reportError("weapons:end " + a.name, e);
        }
      }
    }
  };
  P.isBusy = () => !!P.action && P.action.blocksFire;

  const sfx = (name, vol, pitch) =>
    G.sfx.play(name, {
      volume: vol === undefined ? 0.7 : vol,
      pitch: pitch || 1,
    });
  // dedicated recipe if the sound module has it, else a contract-name fallback (with its own vol/pitch)
  const sfx2 = (pref, vol, pitch, fb, fbVol, fbPitch) =>
    P.hasSfx(pref)
      ? sfx(pref, vol, pitch)
      : sfx(
          fb,
          fbVol === undefined ? vol : fbVol,
          fbPitch === undefined ? pitch : fbPitch,
        );

  // ------------------------------------------------------------------
  // Shared track builders
  // ------------------------------------------------------------------
  /** envelope 0→1 between a..b, hold, 1→0 between c..d */
  function env(k, a, b, c, d) {
    if (k <= a || k >= d) return 0;
    if (k < b) return ease((k - a) / (b - a));
    if (k <= c) return 1;
    return 1 - ease((k - c) / (d - c));
  }
  P.env = env;
  const BELOW_L = { p: [-0.12, -0.5, -0.15], x: [0, 0, -1], y: [-1, 0.3, 0] };
  const BELOW_R = { p: [0.18, -0.5, -0.1], x: [0, 0, -1], y: [1, 0.3, 0] };
  P.BELOW_L = BELOW_L;
  P.BELOW_R = BELOW_R;

  // ------------------------------------------------------------------
  // MAG / DRUM / CELL reload
  // ------------------------------------------------------------------
  // centre of a part's geometry in its parent's space (cached) — drop spins turn about it, not the grip
  const _bb = new THREE.Box3(),
    _bc = new THREE.Vector3();
  function partCentre(part) {
    if (part.userData.centre) return part.userData.centre;
    try {
      part.updateMatrixWorld(true);
      _bb.makeEmpty();
      const inv = new THREE.Matrix4().copy(part.parent.matrixWorld).invert();
      part.traverse((o) => {
        if (o.isMesh && o.geometry) {
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
          const b = o.geometry.boundingBox
            .clone()
            .applyMatrix4(o.matrixWorld)
            .applyMatrix4(inv);
          _bb.union(b);
        }
      });
      _bb.getCenter(_bc);
      part.userData.centre = [_bc.x, _bc.y, _bc.z];
    } catch (e) {
      part.userData.centre = [0, 0, 0];
    }
    return part.userData.centre;
  }
  const _dq = new THREE.Quaternion(),
    _dq2 = new THREE.Quaternion(),
    _dv = new THREE.Vector3(),
    _de = new THREE.Euler(),
    _dc = new THREE.Vector3();
  /** screen-down (view camera -Y) expressed in the part parent's local frame (per unit of camera distance) */
  function localDown(part, out) {
    out = out || [0, -1, 0];
    try {
      part.parent.getWorldQuaternion(_dq);
      G.viewCamera.getWorldQuaternion(_dq2);
      const s = part.parent.getWorldScale(_dv).x || 1;
      _dv
        .set(0, -1, 0)
        .applyQuaternion(_dq2)
        .applyQuaternion(_dq.invert())
        .multiplyScalar(1 / s);
      out[0] = _dv.x;
      out[1] = _dv.y;
      out[2] = _dv.z;
    } catch (e) {
      /* keep default */
    }
    return out;
  }
  /** offset + rotate a part about its own centre (rest-relative) */
  function partOffAbout(part, p, r) {
    const rest = part.userData.rest,
      c = partCentre(part);
    _de.set(r[0], r[1], r[2]);
    _dq.setFromEuler(_de);
    part.quaternion.copy(rest.q).multiply(_dq);
    // keep the centre where the translation says: pos = rest + p + (c - R c)
    _dc.set(c[0] - rest.p.x, c[1] - rest.p.y, c[2] - rest.p.z);
    _dv.copy(_dc).applyQuaternion(_dq);
    part.position.set(
      rest.p.x + p[0] + _dc.x - _dv.x,
      rest.p.y + p[1] + _dc.y - _dv.y,
      rest.p.z + p[2] + _dc.z - _dv.z,
    );
  }

  // ------------------------------------------------------------------
  // MAG / DRUM / CELL reload choreography
  //   tilt in → release: the spent mag/cell drops free and tumbles out of frame (the left hand is
  //   already on its way down to the pouch) → the hand comes back up from below the frame WITH the
  //   fresh mag, guides it into the well and seats it with a palm slap (gun jolts) → (from empty)
  //   racks the slide / pulls the charging handle → back to the hold.
  //   cfg.reload.carry = true keeps the old behaviour (hand pulls the part out and swaps it —
  //   flamer tanks, drums that are handed off rather than dropped).
  // ------------------------------------------------------------------
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
})();
