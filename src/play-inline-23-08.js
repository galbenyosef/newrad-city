// play-inline-23 08 — ctx
// Lines 2312-2498 of readable/play-inline-23.pretty.js (statement-aligned).
  function playTail(tp, opts, now) {
    const key = tp.name + (opts.pos ? "@" : "");
    if (lastTail[key] !== undefined && now - lastTail[key] < 0.09) return;
    lastTail[key] = now;
    const to = {
      pos: opts.pos,
      volume: (opts.volume === undefined ? 1 : opts.volume) * tp.k,
      pitch: 0.97 + (opts.pitch || 1) * 0.03,
      delay: opts.delay,
      noOcclusion: true,
      distant: opts.distant,
      _tail: true,
    };
    S.play(tp.name, to);
    if (tp.far)
      S.play(
        tp.name.replace(/_out_|_in_/, "_far_"),
        Object.assign({}, to, { distant: true, volume: to.volume * 1.2 }),
      );
  }
  function setPannerPos(p, pos) {
    const y = pos.y || 0;
    if (p.positionX) {
      p.positionX.value = pos.x;
      p.positionY.value = y;
      p.positionZ.value = pos.z;
    } else p.setPosition(pos.x, y, pos.z);
  }
  S.setPannerPos = setPannerPos;

  /** Update the AudioListener from the camera (called each frame). */
  const _m = new Float32Array(16);
  S.syncListener = function () {
    const ctx = S.ctx,
      cam = G.camera;
    if (!ctx || !cam) return;
    cam.updateMatrixWorld();
    const e = cam.matrixWorld.elements;
    const px = e[12],
      py = e[13],
      pz = e[14];
    const fx = -e[8],
      fy = -e[9],
      fz = -e[10],
      ux = e[4],
      uy = e[5],
      uz = e[6];
    // smoothed listener velocity for Doppler (relative motion); a jump > 5 m in one frame (teleport, door, fast
    // travel, respawn) or a stall resets it instead of reading as a 1000 m/s approach
    const tn = performance.now() / 1000,
      LV = S.listenerVel,
      ldt = tn - LV.t;
    if (ldt > 0.004) {
      const mx = px - S.listenerPos.x,
        my = py - S.listenerPos.y,
        mz = pz - S.listenerPos.z;
      if (ldt < 0.25 && mx * mx + my * my + mz * mz < 25) {
        const a = Math.min(1, ldt / 0.12);
        LV.x += (mx / ldt - LV.x) * a;
        LV.y += (my / ldt - LV.y) * a;
        LV.z += (mz / ldt - LV.z) * a;
      } else {
        LV.x = 0;
        LV.y = 0;
        LV.z = 0;
      }
      LV.t = tn;
    }
    S.listenerPos.x = px;
    S.listenerPos.y = py;
    S.listenerPos.z = pz;
    S.listenerFwd.x = fx;
    S.listenerFwd.y = fy;
    S.listenerFwd.z = fz;
    // skip the AudioParam writes when the camera hasn't moved/turned (no automation churn on the audio thread)
    const E = 1e-4;
    if (
      Math.abs(px - _m[0]) < 1e-3 &&
      Math.abs(py - _m[1]) < 1e-3 &&
      Math.abs(pz - _m[2]) < 1e-3 &&
      Math.abs(fx - _m[3]) < E &&
      Math.abs(fy - _m[4]) < E &&
      Math.abs(fz - _m[5]) < E &&
      Math.abs(ux - _m[6]) < E &&
      Math.abs(uy - _m[7]) < E &&
      Math.abs(uz - _m[8]) < E &&
      _m[9] === 1
    )
      return;
    _m[0] = px;
    _m[1] = py;
    _m[2] = pz;
    _m[3] = fx;
    _m[4] = fy;
    _m[5] = fz;
    _m[6] = ux;
    _m[7] = uy;
    _m[8] = uz;
    _m[9] = 1;
    const L = ctx.listener;
    if (L.positionX) {
      // direct .value writes: one immediate update each, no per-frame automation events
      L.positionX.value = px;
      L.positionY.value = py;
      L.positionZ.value = pz;
      L.forwardX.value = fx;
      L.forwardY.value = fy;
      L.forwardZ.value = fz;
      L.upX.value = ux;
      L.upY.value = uy;
      L.upZ.value = uz;
    } else if (L.setPosition) {
      L.setPosition(px, py, pz);
      L.setOrientation(fx, fy, fz, ux, uy, uz);
    }
  };

  // ------------------------------------------------------------------
  // Unlock on first gesture
  // ------------------------------------------------------------------
  S.unlockHandlers = [];
  S.onUnlock = function (fn) {
    if (S.ctx && S.ctx.state === "running") {
      try {
        fn();
      } catch (e) {
        G.reportError("sound:unlock", e);
      }
    } else S.unlockHandlers.push(fn);
  };
  function tryUnlock() {
    if (!S.ctx) return;
    if (S.ctx.state !== "running") {
      const p = S.ctx.resume();
      if (p && p.then) p.then(fireUnlock).catch(() => {});
    } else fireUnlock();
  }
  function fireUnlock() {
    if (!S.ctx || S.ctx.state !== "running") return;
    const hs = S.unlockHandlers.splice(0);
    hs.forEach((fn) => {
      try {
        fn();
      } catch (e) {
        G.reportError("sound:unlock", e);
      }
    });
  }
  S.installUnlock = function () {
    ["pointerdown", "mousedown", "keydown", "touchstart"].forEach((ev) =>
      window.addEventListener(ev, tryUnlock, { capture: true, passive: true }),
    );
    if (S.ctx)
      S.ctx.addEventListener &&
        S.ctx.addEventListener("statechange", () => {
          if (S.ctx.state === "running") fireUnlock();
        });
    tryUnlock();
  };

  // ------------------------------------------------------------------
  // Background work queue (time-sliced small tasks, e.g. instrument sample generation)
  // ------------------------------------------------------------------
  const taskQ = [];
  let taskTimer = null;
  S.task = function (fn) {
    taskQ.push(fn);
    if (!taskTimer) taskTimer = setTimeout(runTasks, 0);
  };
  function runTasks() {
    taskTimer = null;
    const t0 = performance.now();
    while (taskQ.length && performance.now() - t0 < 8) {
      const fn = taskQ.shift();
      try {
        fn();
      } catch (e) {
        G.reportError("sound:task", e);
      }
    }
    if (taskQ.length) taskTimer = setTimeout(runTasks, 4);
  }

  S.init = function () {
    S.noiseBufs = makeNoiseBuffers();
    S.createContext();
  };
