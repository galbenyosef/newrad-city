// play-inline-501 01 — part
// Lines 17-333 of readable/play-inline-501.pretty.js (statement-aligned).
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
