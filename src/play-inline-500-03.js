// play-inline-500 03 — three
// Lines 705-868 of readable/play-inline-500.pretty.js (statement-aligned).
  function updateFlames(dt) {
    for (const p of V.flames.parts) {
      if (!p.alive) continue;
      p.age += dt;
      const k = p.age / p.life;
      if (k >= 1) {
        p.alive = false;
        p.m.visible = false;
        continue;
      }
      p.vel.y += 1.5 * dt;
      p.m.position.addScaledVector(p.vel, dt);
      const s = 0.05 + k * 1.3;
      p.m.scale.set(s, s, s);
      const c = p.m.material.color;
      if (k < 0.2) c.setRGB(1, 0.95, 0.7);
      else if (k < 0.6) c.setRGB(1, 0.55, 0.15);
      else c.setRGB(0.5 * (1 - k) * 2, 0.15 * (1 - k), 0.02);
      p.m.material.opacity = 1 - k * k;
    }
  }

  // ------------------------------------------------------------------
  // Scope overlay (DOM)
  // ------------------------------------------------------------------
  function buildScopeOverlay() {
    if (document.getElementById("wpn-scope")) {
      V.scopeEl = document.getElementById("wpn-scope");
      return;
    }
    const el = document.createElement("div");
    el.id = "wpn-scope";
    el.className = "wpn-scope";
    el.innerHTML =
      '<div class="wpn-scope-ring"></div><div class="wpn-scope-h"></div><div class="wpn-scope-v"></div>' +
      '<div class="wpn-scope-post"></div><div class="wpn-scope-dots"></div><div class="wpn-scope-glint"></div>' +
      '<div class="wpn-scope-breath"><span>HOLD BREATH</span><i></i></div>';
    document.body.appendChild(el);
    V.scopeEl = el;
    V.breathEl = el.querySelector
      ? el.querySelector(".wpn-scope-breath")
      : null;
    V.breathBar = V.breathEl ? V.breathEl.querySelector("i") : null;
  }
  function updateScope() {
    if (!V.scopeEl) return;
    const show =
      V.scoped &&
      V.adsT > 0.88 &&
      V.root.visible !== false &&
      G.state !== "dead";
    const cls = show ? "wpn-scope on" : "wpn-scope";
    if (V.scopeEl.className !== cls) V.scopeEl.className = cls;
    // hold-breath meter (Shift): only shown while holding or recovering
    if (show && V.breathEl && V.breathBar && P.breathState) {
      const b = P.breathState();
      const vis = b.holding || b.winded || b.breath < 0.999;
      const bc =
        "wpn-scope-breath" + (vis ? " on" : "") + (b.winded ? " winded" : "");
      if (V.breathEl.className !== bc) V.breathEl.className = bc;
      const wpc = Math.round(b.breath * 100) + "%";
      if (V.breathBar.style.width !== wpc) V.breathBar.style.width = wpc;
    }
  }

  // ------------------------------------------------------------------
  // Model switching
  // ------------------------------------------------------------------
  /** Show a model instance (already built) — detaches the previous one. */
  V.setModel = function (inst) {
    if (V.model === inst) return;
    if (V.model && V.model.root.parent)
      V.model.root.parent.remove(V.model.root);
    V.model = inst;
    if (inst) {
      V.pivot.add(inst.root);
      // per-model on-screen scale (long guns are drawn a touch smaller)
      inst.root.scale.setScalar(inst.cfg.viewScale || 1);
      // optional turn about the model's own up axis (two-handed melee: show the side of the head, not its back)
      inst.root.rotation.y = inst.cfg.spinY || 0;
      P.arms.setPose("R", inst.cfg.rightPose || "trigger");
      P.arms.setPose("L", inst.cfg.leftPose || "support");
      V.applyEnv();
    }
  };

  // ------------------------------------------------------------------
  // Hand targets
  // ------------------------------------------------------------------
  const _inv = new THREE.Matrix4(),
    _tm = new THREE.Matrix4(),
    _tp = new THREE.Vector3(),
    _tq = new THREE.Quaternion(),
    _ts = new THREE.Vector3();
  /** World (view camera) transform of an Object3D expressed in arms-root space. */
  V.socketPose = function (obj, out) {
    out = out || { p: new THREE.Vector3(), q: new THREE.Quaternion() };
    _inv.copy(P.arms.root.matrixWorld).invert();
    _tm.multiplyMatrices(_inv, obj.matrixWorld);
    _tm.decompose(out.p, out.q, _ts);
    return out;
  };
  /** Free pose in camera space: p array, basis x/y arrays */
  V.freePose = function (p, x, y, out) {
    out = out || { p: new THREE.Vector3(), q: new THREE.Quaternion() };
    out.p.set(p[0], p[1], p[2]).sub(P.arms.root.position);
    P.basisQ(x, y, out.q);
    return out;
  };
  const tgtR = { p: new THREE.Vector3(), q: new THREE.Quaternion() },
    tgtL = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
  function blendTarget(t, pose, w) {
    w = Math.min(1, w);
    t.p.lerp(pose.p, w);
    t.q.slerp(pose.q, w);
    return t;
  }
  const ovA = { p: new THREE.Vector3(), q: new THREE.Quaternion() },
    ovB = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
  const ovT = { p: new THREE.Vector3(), q: new THREE.Quaternion() };
  /** Resolve an override descriptor into a pose (or null). */
  function resolveOv(ov, out) {
    if (!(ov.w > 0)) return null;
    let a = null;
    if (ov.socket) {
      a = V.socketPose(ov.socket, out);
      if (ov.basis) a.q.copy(ov.basis);
    } // socket position, camera-space hand basis
    else if (ov.free) a = V.freePose(ov.free.p, ov.free.x, ov.free.y, out);
    if (ov.t2 > 0 && (ov.socket2 || ov.free2)) {
      const b = ov.socket2
        ? V.socketPose(ov.socket2, ovT)
        : V.freePose(ov.free2.p, ov.free2.x, ov.free2.y, ovT);
      if (ov.socket2 && ov.basis2) b.q.copy(ov.basis2);
      if (!a) {
        out.p.copy(b.p);
        out.q.copy(b.q);
        a = out;
      } else {
        a.p.lerp(b.p, Math.min(1, ov.t2));
        a.q.slerp(b.q, Math.min(1, ov.t2));
      }
    }
    return a;
  }

  // ------------------------------------------------------------------
  // Per-frame pose
  // ------------------------------------------------------------------
  const _pos = new THREE.Vector3(),
    _hip = new THREE.Vector3(),
    _adsP = new THREE.Vector3();
  const _solveOpt = { ads: 0, ext: 0, raise: 0, hintL: null, hintR: null };
  const DEFAULT_LOWER = { p: [0.06, -0.3, 0.1], r: [-0.9, 0.35, 0.3] };
  const DEFAULT_SPRINT = { p: [-0.02, -0.04, 0.03], r: [-0.35, 0.55, 0.35] };
  // left-arm raise (scripted gestures): forearm horizontal across the view, inside of the wrist toward the eye
  const RAISE_LEFT = {
    p: [0.21, -0.035, -0.37],
    x: [0.0, -0.95, 0.3],
    y: [0.0, 0.3, 0.95],
  };
  // one-handed guns: left hand hanging just below the bottom edge of the frame
  const LEFT_REST = { p: [-0.1, -0.42, -0.2], x: [0, 0, -1], y: [-1, 0.25, 0] };

