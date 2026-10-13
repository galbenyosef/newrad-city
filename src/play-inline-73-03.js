// play-inline-73 03 — math
// Lines 379-614 of readable/play-inline-73.pretty.js (statement-aligned).
  function startBake() {
    if (!RL.probes || !R.patched || B.state === "running" || B.state === "done")
      return;
    const n = W * H;
    B.height = new Float32Array(n);
    B.ground = new Float32Array(n);
    B.bld = new Uint8Array(n);
    B.state = "running";
    B.phase = "ground";
    B.row = 0;
    B.col = 0;
    B.ci = 0;
    B.colliders = 0;
    progress();
  }
  function progress() {
    if (B.state !== "running") return;
    const t0 = performance.now(),
      lim = budgetMs();
    try {
      if (B.phase === "ground" && stepGround(t0, lim)) {
        B.phase = "colliders";
      }
      if (
        B.phase === "colliders" &&
        performance.now() - t0 < lim &&
        stepColliders(t0, lim)
      ) {
        B.phase = "scan";
        B.row = 0;
        B.col = 0;
      }
      if (
        B.phase === "scan" &&
        performance.now() - t0 < lim &&
        stepScan(t0, lim)
      )
        finish();
    } catch (e) {
      G.reportError("render_lighting/probes", e);
      B.state = "failed";
      B.height = B.ground = B.bld = null;
    }
    const ms = performance.now() - t0;
    B.ms += ms;
    B.frames++;
    if (ms > B.maxFrameMs && lim < 1e8) B.maxFrameMs = ms;
  }

  /** CPU twin of the shader's sky term: sky visibility 0..1 at a world point (1 off-grid / indoors).
   *  Allocation-free (safe to call per NPC per frame). */
  RL.skyVisibility = function (x, y, z, upness) {
    if (B.state !== "done") return 1;
    const u = (x - X0) / CELL - 0.5,
      v = (z - Z0) / CELL - 0.5;
    const i = Math.floor(u),
      j = Math.floor(v);
    if (i < 0 || j < 0 || i >= W - 1 || j >= H - 1) return 1;
    const fx = u - i,
      fz = v - j,
      d = P.data;
    const o00 = P.off(0, i, j),
      o10 = o00 + 4,
      o01 = P.off(0, i, j + 1),
      o11 = o01 + 4;
    const w00 = (1 - fx) * (1 - fz),
      w10 = fx * (1 - fz),
      w01 = (1 - fx) * fz,
      w11 = fx * fz;
    if (
      d[o00 + 3] * w00 +
        d[o10 + 3] * w10 +
        d[o01 + 3] * w01 +
        d[o11 + 3] * w11 <
      127
    )
      return 1;
    const v0 =
      (d[o00] * w00 + d[o10] * w10 + d[o01] * w01 + d[o11] * w11) / 255;
    const hcv =
      (d[o00 + 1] * w00 +
        d[o10 + 1] * w10 +
        d[o01 + 1] * w01 +
        d[o11 + 1] * w11) /
      255;
    const hc = hcv * HC_SCALE + 2;
    const hy = Math.min(1, Math.max(0, (y || 0) / hc));
    let vv = v0 + (1 - v0) * hy * hy * (3 - 2 * hy);
    vv =
      vv +
      (Math.sqrt(vv) - vv) * Math.max(0, upness == null ? 0.5 : upness) * 0.5;
    return 1 + (OPT.minVis + (1 - OPT.minVis) * vv - 1) * OPT.strength;
  };
  RL.probeInfo = () => ({
    state: B.state,
    phase: B.phase,
    ms: Math.round(B.ms),
    frames: B.frames,
    maxFrameMs: +B.maxFrameMs.toFixed(1),
    colliders: B.colliders,
    cells: W * H,
    cell: CELL,
    atlas: P.aw + "x" + P.ah,
    atlasMB: +((P.aw * P.ah * 4) / 1048576).toFixed(1),
    bounce: [U.nrcBounce.value.x, U.nrcBounce.value.y, U.nrcBounce.value.z].map(
      (v) => +v.toFixed(3),
    ),
    bounceSun: [
      U.nrcBounceSun.value.x,
      U.nrcBounceSun.value.y,
      U.nrcBounceSun.value.z,
    ].map((v) => +v.toFixed(3)),
    key: {
      tan: +U.nrcHzK.value.w.toFixed(2),
      hor: +U.nrcHzL.value.x.toFixed(2),
    },
  });
  /** Tune the canyon terms: {strength, minVis, interreflect, facadeAlbedo, fillGain, alleyFill, skyline}. */
  RL.setProbeParams = function (o) {
    if (o) for (const k in OPT) if (typeof o[k] === "number") OPT[k] = o[k];
  };
  RL.getProbeParams = () => Object.assign({}, OPT);
  RL.setProbes = function (on) {
    RL.probes = !!on;
    try {
      localStorage.setItem("nrc_rl_probes", on ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    if (on && (B.state === "idle" || B.state === "failed") && B.initDone) {
      B.state = "idle";
      startBake();
    }
  };

  // ---------------------------------------------------------------- per-frame uniforms
  const _sky = new THREE.Color(),
    _sun = new THREE.Color(),
    _L = new THREE.Vector3();
  let vmVis = 1,
    vmBase = -1,
    vmWritten = -1;
  const TILE_X = [0, 1, 2, 0, 1, 2],
    TILE_Y = [0, 0, 0, 1, 1, 1];
  function update() {
    progress();
    const K = U.nrcProbeK.value;
    const indoors = R.interior();
    K.x = RL.probes && B.state === "done" && !indoors ? OPT.strength : 0;
    K.y = OPT.minVis;
    K.z = OPT.fillGain;
    K.w = HC_SCALE;
    if (K.x <= 0) return;
    const A = G.atmos || {};
    const hemi = A.hemi || (G.baseLights && G.baseLights.hemi),
      sun = A.sun || (G.baseLights && G.baseLights.sun);
    if (!hemi || !sun) return;
    // skyline taps bracketing the key light's azimuth (pairs p / p+4 share a texel)
    const HK = U.nrcHzK.value,
      HT = U.nrcHzT.value,
      HL = U.nrcHzL.value;
    if (R.keyDir(_L)) {
      let az = Math.atan2(_L.z, _L.x);
      if (az < 0) az += Math.PI * 2;
      const kf = az / (Math.PI / 4),
        k = Math.floor(kf) % 8,
        k1 = (k + 1) % 8;
      const t0 = (k % 4) + 1,
        t1 = (k1 % 4) + 1;
      HT.x = TILE_X[t0];
      HT.y = TILE_Y[t0];
      HT.z = TILE_X[t1];
      HT.w = TILE_Y[t1];
      HK.x = k >= 4 ? 1 : 0;
      HK.y = k1 >= 4 ? 1 : 0;
      HK.z = kf - Math.floor(kf);
      const lxz = Math.hypot(_L.x, _L.z);
      HK.w = Math.min(20, Math.max(0, _L.y) / Math.max(lxz, 0.05));
      HL.x = lxz;
    }
    HL.y = 0.06;
    HL.z = OPT.alleyFill;
    R.skylineOff = !(OPT.skyline > 0); // (10_cascade.js writes nrcHzL.w every frame)
    // interreflected sky (warm-grey multiple bounces between the walls) and sunlit-façade bounce
    _sky.copy(hemi.color).multiplyScalar(hemi.intensity);
    _sun.copy(sun.color).multiplyScalar(sun.intensity);
    const Bn = U.nrcBounce.value,
      Bs = U.nrcBounceSun.value;
    const ir = OPT.interreflect;
    Bn.x = _sky.r * ir * 1.06;
    Bn.y = _sky.g * ir;
    Bn.z = _sky.b * ir * 0.9;
    const fa = OPT.facadeAlbedo;
    Bs.x = _sun.r * fa;
    Bs.y = _sun.g * fa * 0.96;
    Bs.z = _sun.b * fa * 0.88;
  }

  // viewmodel: the first-person arms/gun sit in the same canyon. Atmosphere sets the viewmodel
  // hemisphere in its lateUpdate; we run after it and scale it — from the value atmosphere wrote
  // THIS frame (never compounding if atmosphere stopped writing), floored so it stacks gently
  // with atmosphere's own "in shadow" darkening.
  function late(dt, realDt) {
    const VL = G.viewLights;
    if (!VL || !VL.amb) return;
    const cur = VL.amb.intensity;
    if (cur !== vmWritten) vmBase = cur; // atmosphere rewrote it (normal case)
    if (vmBase < 0) return;
    let tgt = 1;
    if (
      B.state === "done" &&
      RL.probes &&
      !R.interior() &&
      !G.isStub("atmos")
    ) {
      const p = G.camera.position;
      const v = RL.skyVisibility(p.x, p.y, p.z, 0.3);
      // the hidden sky partly comes back as bounce (see update): net loss is ~half the occlusion
      tgt = Math.max(0.7, 1 - (1 - v) * 0.45);
    }
    vmVis = R.damp(vmVis, tgt, 3, realDt || 0.016);
    VL.amb.intensity = vmWritten = vmBase * vmVis;
  }

  R.addSystem({
    name: "probes",
    order: 20,
    update,
    late,
    init() {
      G.events.on("initDone", () => {
        B.initDone = true;
        startBake();
      });
    },
  });
