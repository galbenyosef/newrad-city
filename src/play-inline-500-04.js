// play-inline-500 04 — cfg
// Lines 869-1207 of readable/play-inline-500.pretty.js (statement-aligned).
  V.update = function (dt, realDt) {
    if (!V.built) return;
    const pl = G.player;
    const S = V.springs;
    V.time += realDt;
    const m = V.model;
    const cfg = m ? m.cfg : {};
    const st = G.state;

    // ---------------- visibility ----------------
    const stateOk =
      st === "play" ||
      st === "goggles" ||
      st === "paused" ||
      st === "container" ||
      st === "barter" ||
      st === "levelup" ||
      st === "cutscene";
    const vis =
      !!m &&
      stateOk &&
      !pl.camOverride &&
      pl.alive !== false &&
      G.viewmodelVisible !== false;
    V.root.visible = vis;
    if (!vis) {
      V.flash.visible = false;
      V.light.intensity = 0;
      updateScope();
      return;
    }

    // ---------------- blend channels ----------------
    const wantLower =
      V.pendingKind !== null ||
      P.state.holstered ||
      pl.swimming ||
      V.forceLower;
    if (wantLower) {
      V.lowerT = G.util.damp(V.lowerT, 1, 9, realDt);
      V._raiseFrom = V.lowerT;
    } else if (V.lowerT > 0) {
      // draw: a timed swing up from below (smoothstep, weight-dependent) instead of an exponential creep, then
      // the gun's momentum carries it a hair past the hold and it settles (muzzle flick + roll)
      const w = P.state.cur && P.state.cur.def && P.state.cur.def.weapon;
      const dd =
        cfg.drawTime ||
        (w && w.twoHanded ? ((cfg.viewScale || 1) < 0.85 ? 0.75 : 0.55) : 0.42);
      V._raiseFrom = Math.max(V._raiseFrom || 0, V.lowerT);
      V.lowerT = Math.max(0, V.lowerT - realDt / dd);
      if (V.lowerT === 0 && (V._raiseFrom || 0) > 0.3) {
        const heavy = w && w.twoHanded ? 1.3 : 1;
        S.recP.v += 1.1 * heavy;
        S.recR.v -= 1.4;
        S.recZ.v -= 0.12 * heavy;
        S.land.v -= 0.12 * heavy;
        V._raiseFrom = 0;
      }
    }
    const wantAds = V.ads && !wantLower && !P.state.busyNoAds;
    V.adsT = G.util.damp(
      V.adsT,
      wantAds ? 1 : 0,
      wantAds ? 13 : 11,
      dt > 0 ? dt / Math.max(G.timeScale, 0.05) : realDt,
    );
    const sprinting = pl.sprinting && !V.ads;
    V.sprintT = G.util.damp(V.sprintT, sprinting ? 1 : 0, 8, realDt);
    V.blockT = G.util.damp(V.blockT, V.blocking ? 1 : 0, 14, realDt);
    V.raiseT = G.util.damp(V.raiseT, V.raiseWanted ? 1 : 0, 10, realDt); // nothing on the wrist: only scripted gestures raise it

    // pending model swap once fully lowered
    if (V.pendingKind !== null && V.lowerT > 0.93) {
      P.swapToPending();
    }

    // ---------------- springs: look sway, landing, strafe ----------------
    const I = G.input;
    if (st === "play" && I.locked) {
      const k = 1 - 0.7 * V.adsT;
      S.yaw.v += I.mouse.dx * 0.018 * k;
      S.pitch.v += I.mouse.dy * 0.014 * k;
      S.sx.v -= I.mouse.dx * 0.0011 * k;
      S.sy.v += I.mouse.dy * 0.0009 * k;
    }
    // clamp sway so fast flicks don't throw the gun off-screen
    S.yaw.x = G.util.clamp(S.yaw.x, -0.12, 0.12);
    S.pitch.x = G.util.clamp(S.pitch.x, -0.1, 0.1);
    S.sx.x = G.util.clamp(S.sx.x, -0.03, 0.03);
    S.sy.x = G.util.clamp(S.sy.x, -0.03, 0.03);
    // jump start
    if (V.lastOnGround && !pl.onGround && pl.vel && pl.vel.y > 1) {
      S.land.v -= 0.35;
    }
    V.lastOnGround = pl.onGround;
    // strafe roll: lateral velocity in camera frame
    if (pl.vel) {
      const lat = pl.vel.x * Math.cos(pl.yaw) - pl.vel.z * Math.sin(pl.yaw);
      V.strafe = G.util.damp(V.strafe, G.util.clamp(lat / 5, -1, 1), 6, realDt);
    }
    const sdt = dt > 0 ? dt : st === "goggles" ? realDt : 0;
    for (const k in S) stepSpring(S[k], sdt);

    // ---------------- bob ----------------
    const speed = pl.moveSpeed || 0;
    V.bobAmt = G.util.damp(
      V.bobAmt,
      pl.onGround ? Math.min(speed / 4.6, 1.7) : 0,
      8,
      realDt,
    );
    V.bobPhase =
      pl._bob !== undefined ? pl._bob : V.bobPhase + realDt * speed * 1.9;
    const ph = V.bobPhase,
      ba = V.bobAmt * (1 - 0.8 * V.adsT);
    const sprintK = V.sprintT;
    const bobX = Math.cos(ph) * (0.007 + 0.016 * sprintK) * ba;
    const bobY = -Math.abs(Math.sin(ph)) * (0.009 + 0.012 * sprintK) * ba;
    const bobR = Math.cos(ph) * (0.014 + 0.03 * sprintK) * ba;
    const bobP = Math.sin(ph * 2) * (0.006 + 0.02 * sprintK) * ba;
    const bobYaw = Math.cos(ph) * 0.03 * sprintK * ba;
    // idle breathing
    const t = V.time;
    const br = 1 - 0.75 * V.adsT;
    const idleY = Math.sin(t * 1.5) * 0.0016 * br,
      idleP = Math.sin(t * 1.5 + 0.6) * 0.004 * br,
      idleYaw = Math.sin(t * 0.63) * 0.003 * br;

    // ---------------- actions ----------------
    V.anim.p[0] = V.anim.p[1] = V.anim.p[2] = 0;
    V.anim.r[0] = V.anim.r[1] = V.anim.r[2] = 0;
    for (const k of ["R", "L"]) {
      const o = V.handOv[k];
      o.w = 0;
      o.socket = o.socket2 = o.free = o.free2 = o.basis = o.basis2 = null;
      o.t2 = 0;
    }
    V.hideModel = false;
    V.hideLeft = false;
    if (m) P.resetParts(m);
    P.updateAction(dt, realDt);
    if (m) P.updateShotParts(m, dt);

    // ---------------- compose weapon transform ----------------
    const hip = cfg.hip || { p: [0.12, -0.14, -0.3], r: [0, 0, 0] };
    _hip.set(hip.p[0], hip.p[1], hip.p[2]);
    // ADS: sight socket to screen centre
    if (m && m.sockets.sight) {
      const sp = m.sockets.sight.position; // sight sockets are direct children of model root
      const vs = cfg.viewScale || 1;
      _adsP.set(-sp.x * vs, -sp.y * vs, -(cfg.adsDist || 0.22) - sp.z * vs);
    } else _adsP.copy(_hip);
    _pos.copy(_hip).lerp(_adsP, ease(V.adsT));
    let rx = (hip.r[0] || 0) * (1 - V.adsT),
      ry = (hip.r[1] || 0) * (1 - V.adsT),
      rz = (hip.r[2] || 0) * (1 - V.adsT);
    const sp = cfg.sprint || DEFAULT_SPRINT,
      lw = cfg.lower || DEFAULT_LOWER,
      bl = cfg.block || { p: [-0.05, 0.05, 0.02], r: [0.3, -0.2, 0.9] };
    const eS = ease(sprintK),
      eL = ease(V.lowerT),
      eB = ease(V.blockT),
      eP = ease(V.raiseT);
    _pos.x += sp.p[0] * eS + lw.p[0] * eL + bl.p[0] * eB + 0.02 * eP;
    _pos.y += sp.p[1] * eS + lw.p[1] * eL + bl.p[1] * eB - 0.3 * eP;
    _pos.z += sp.p[2] * eS + lw.p[2] * eL + bl.p[2] * eB;
    rx += sp.r[0] * eS + lw.r[0] * eL + bl.r[0] * eB - 0.6 * eP;
    ry += sp.r[1] * eS + lw.r[1] * eL + bl.r[1] * eB;
    rz += sp.r[2] * eS + lw.r[2] * eL + bl.r[2] * eB;
    // sway/bob/recoil/anim
    const kickK = 1 - 0.45 * V.adsT;
    _pos.x += bobX + S.sx.x + S.recX.x * kickK + V.anim.p[0];
    _pos.y += bobY + idleY + S.sy.x + S.land.x * 0.06 + V.anim.p[1];
    _pos.z += S.recZ.x * kickK + V.anim.p[2];
    rx +=
      bobP +
      idleP +
      S.pitch.x * 0.6 +
      S.recP.x * kickK +
      V.anim.r[0] +
      S.land.x * 0.15;
    ry += bobYaw + idleYaw + S.yaw.x * 0.6 + S.recY.x * kickK + V.anim.r[1];
    rz +=
      bobR +
      S.recR.x * kickK -
      V.strafe * 0.05 * (1 - 0.7 * V.adsT) +
      S.yaw.x * 0.25 +
      V.anim.r[2];
    V.pivot.position.copy(_pos);
    V.pivot.rotation.set(rx, ry, rz, "YXZ");
    // whole rig bob (shoulders follow a little)
    V.root.position.set(bobX * 0.4, bobY * 0.5 + S.land.x * 0.02, 0);
    if (m) m.root.visible = !V.hideModel;

    // minigun barrels etc.
    if (m && m.parts.barrels && cfg.spinBarrels) {
      V.spinAngle += V.spin * dt * 42;
      m.parts.barrels.rotation.z = V.spinAngle;
    }
    if (m && cfg.onFrame) cfg.onFrame(m, dt, V);

    // ---------------- hands ----------------
    V.root.updateMatrixWorld(true);
    let right = null,
      left = null;
    if (m && !V.hideModel && m.sockets.rightHand)
      right = V.socketPose(m.sockets.rightHand, tgtR);
    else if (m && cfg.rightFree)
      right = V.freePose(
        cfg.rightFree.p,
        cfg.rightFree.x,
        cfg.rightFree.y,
        tgtR,
      );
    // handguns are fired one-handed: the left arm rests below the frame and only
    // swings up for the reload / slide rack, so hip fire and iron sights show a single sleeve.
    const oneHanded = !!(m && cfg.oneHanded);
    if (oneHanded && V.raiseT > 0.01)
      left = V.freePose(LEFT_REST.p, LEFT_REST.x, LEFT_REST.y, tgtL); // the raise starts from the rest pose
    else if (m && cfg.leftFree)
      left = V.freePose(cfg.leftFree.p, cfg.leftFree.x, cfg.leftFree.y, tgtL);
    else if (m && m.sockets.leftHand && !V.hideModel && !oneHanded)
      left = V.socketPose(m.sockets.leftHand, tgtL);
    const ovR = resolveOv(V.handOv.R, ovA),
      ovL = resolveOv(V.handOv.L, ovB);
    if (ovR) {
      if (!right || V.handOv.R.w >= 1) {
        right = tgtR;
        right.p.copy(ovR.p);
        right.q.copy(ovR.q);
      } else blendTarget(right, ovR, V.handOv.R.w);
    }
    if (ovL && !left && oneHanded && V.handOv.L.w < 1) {
      // rise from the rest pose below the frame instead of popping in at the socket
      if (V.handOv.L.w >= 0.03) {
        left = V.freePose(LEFT_REST.p, LEFT_REST.x, LEFT_REST.y, tgtL);
        blendTarget(left, ovL, V.handOv.L.w);
      }
    } else if (ovL) {
      if (!left || V.handOv.L.w >= 1) {
        left = tgtL;
        left.p.copy(ovL.p);
        left.q.copy(ovL.q);
      } else blendTarget(left, ovL, V.handOv.L.w);
    }
    // left-arm raise: left arm to the face, right arm drops away
    if (V.raiseT > 0.01) {
      const pp = V.freePose(RAISE_LEFT.p, RAISE_LEFT.x, RAISE_LEFT.y);
      if (!left) {
        left = tgtL;
        left.p.copy(pp.p);
        left.q.copy(pp.q);
      } else {
        left.p.lerp(pp.p, ease(V.raiseT));
        left.q.slerp(pp.q, ease(V.raiseT));
      }
      P.arms.setPose(
        "L",
        V.raiseT > 0.5 ? "relaxed" : cfg.leftPose || "support",
      );
    }
    if (V.hideLeft) left = null;
    // fully lowered: hide arms entirely (holstered)
    if (
      V.lowerT > 0.97 &&
      V.raiseT < 0.02 &&
      !(P.action && P.action.name === "throw")
    ) {
      right = null;
      left = null;
    }
    if (V.raiseT > 0.5) right = null;
    _solveOpt.ads = V.adsT;
    _solveOpt.ext = oneHanded ? 1 : 0;
    _solveOpt.raise = V.raiseT;
    _solveOpt.hintL = cfg.hintL || null;
    _solveOpt.hintR = cfg.hintR || null;
    P.arms.solve(right, left, _solveOpt);
    P.arms.updateHands(realDt);
    P.arms.updateScreen(realDt);

    // ---------------- lighting follows the world (atmosphere dims G.viewLights at night / indoors)
    const amb =
      G.viewLights && G.viewLights.amb ? G.viewLights.amb.intensity : 1.1;
    const lk = G.util.clamp(amb / 1.1, 0.15, 1.4);
    V.fill.intensity = 0.22 * lk;
    V.rim.intensity = 0.3 * lk;
    if (Math.abs((V._envK || 0) - lk) > 0.02) {
      V._envK = lk;
      for (const mt of P.allViewMats())
        if (mt.isMeshStandardMaterial)
          mt.envMapIntensity = lk * (mt.userData.envK || 1);
    }

    // ---------------- effects ----------------
    updateFlash(realDt > 0 ? dt : 0);
    updateShells(dt);
    updateFlames(dt);
    updateSmoke(dt);
    // ADS: view camera FOV (bigger gun, feel of focus)
    const vfov = 58 - 8 * V.adsT * (V.scoped ? 0 : 1);
    // ADS near plane: the eye sits a few cm above the stock comb, so the stock top between the eye and the rear
    // sight filled the bottom half of the sight picture as a flat slab. Pull the view near plane out while
    // aiming (the stock is simply not in the sight picture); the sights are ≥12 cm away.
    const vnear =
      0.01 +
      (cfg.adsNear !== undefined ? cfg.adsNear : 0.075) *
        ease(V.adsT) *
        (V.scoped ? 0 : 1);
    if (
      Math.abs(G.viewCamera.fov - vfov) > 0.01 ||
      Math.abs(G.viewCamera.near - vnear) > 0.0005
    ) {
      G.viewCamera.fov = vfov;
      G.viewCamera.near = vnear;
      G.viewCamera.updateProjectionMatrix();
    }
    // scoped: overlay on, weapon hidden when fully in the scope
    updateScope();
    if (V.scoped && V.adsT > 0.88) V.root.visible = false;
  };

  /** Recoil impulse. k = def.kick scale, ads reduces automatically. */
  V.kick = function (k, def) {
    const S = V.springs;
    k = k || 1;
    // one-handed guns flip at the wrist (grip = pivot): more muzzle climb, less push-back, a hint of roll
    const oneH = !!(V.model && V.model.cfg.oneHanded);
    const one = (def && !def.twoHanded) || oneH ? 1.3 : 1;
    S.recZ.v += (oneH ? 0.42 : 0.55) * k;
    S.recP.v += 2.2 * k * one;
    if (oneH) S.recR.v -= 0.6 * k;
    S.recR.v += (Math.random() - 0.5) * 2.4 * k;
    S.recY.v += (Math.random() - 0.5) * 1.2 * k;
    S.recX.v += (Math.random() - 0.5) * 0.12 * k;
  };
  V.landImpulse = function (vy) {
    V.springs.land.v -= Math.min(Math.abs(vy || 0), 16) * 0.05;
  };
