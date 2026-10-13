// play-inline-491 05 — the
// Lines 1108-1457 of readable/play-inline-491.pretty.js (statement-aligned).
  const _tm = new THREE.Matrix4(),
    _tq = new THREE.Quaternion();
  function blendPose(h, rate) {
    const a = h.pose,
      b = h.target;
    const k = Math.min(1, rate);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 3; j++) a.f[i][j] += (b.f[i][j] - a.f[i][j]) * k;
      a.s[i] += (b.s[i] - a.s[i]) * k;
    }
    for (let j = 0; j < 6; j++) a.t[j] += (b.t[j] - a.t[j]) * k;
    applyPose(h);
  }

  // ------------------------------------------------------------------
  // Sleeves
  // ------------------------------------------------------------------
  function buildUpperArm(len) {
    const b = P.builder();
    b.add(
      GEO.lathe(
        [
          [0.05, -0.05],
          [0.052, 0.0],
          [0.05, len * 0.5],
          [0.047, len],
          [0.044, len + 0.03],
        ],
        14,
      ),
      "sleeve",
      { s: [1, 0.92, 1] },
    );
    b.add(GEO.cyl(0.0025, len, 4), "sleeve", {
      p: [0.0, 0.047, -len * 0.5],
      tint: 0.8,
    }); // seam
    return b.build();
  }
  function buildForearm(len, isLeft) {
    const b = P.builder();
    // tapered sleeve with soft fabric folds (radius wobble), slightly baggy near the elbow
    const pts = [[0.043, -0.03]];
    const n = 11,
      end = len - 0.03;
    for (let i = 0; i <= n; i++) {
      const t = i / n,
        z = t * end;
      const base = 0.045 - t * 0.0115; // taper toward the wrist (knit cuff hugs the wrist)
      const fold = (i % 2 ? 0.0022 : -0.0012) * (1 - t * 0.6);
      pts.push([base + fold, z]);
    }
    b.add(GEO.lathe(pts, 18), "sleeve", { s: [1.08, 0.94, 1] });
    // knitted orange cuff band right at the wrist + grey turned lip (cryo suit)
    // (slimmer than before: the old 8.5 cm padded band dominated the bottom of the pistol view)
    b.add(
      GEO.lathe(
        [
          [0.0335, len - 0.03],
          [0.0356, len - 0.027],
          [0.0354, len - 0.01],
          [0.0336, len - 0.004],
        ],
        20,
      ),
      "sleeveTrim",
      { s: [1.06, 0.92, 1] },
    );
    for (let i = 0; i < 3; i++)
      b.add(GEO.torus(0.0355, 0.0007, 4, 24), "sleeveTrim", {
        p: [0, 0, -(len - 0.024 + i * 0.007)],
        s: [1.06, 0.92, 1],
        tint: 0.82,
      }); // ribbing
    b.add(GEO.torus(0.0322, 0.0022, 6, 22), "sleeve", {
      p: [0, 0, -(len - 0.003)],
      s: [1.06, 0.92, 1],
      tint: 0.85,
    });
    // side seam / stitches
    b.add(GEO.cyl(0.0018, len * 0.75, 4), "sleeve", {
      p: [isLeft ? 0.046 : -0.046, 0, -len * 0.4],
      tint: 0.75,
    });
    // wrist: a short skin stub + joint ball that fills the gap when the hand bends away from the forearm
    b.add(
      GEO.lathe(
        [
          [0.027, -0.02],
          [0.027, 0.0],
          [0.0255, 0.008],
        ],
        14,
      ),
      "skin",
      { p: [0, 0.001, -len], s: [1.1, 0.78, 1] },
    );
    b.add(GEO.sphere(1, 14, 10), "skin", {
      p: [0, 0.001, -len - 0.006],
      s: [0.0272, 0.0198, 0.02],
    });
    return b.build();
  }

  // ------------------------------------------------------------------
  // Rig
  // ------------------------------------------------------------------
  const UPPER = 0.27,
    FORE = 0.25;
  const A = (P.arms = {
    built: false,
    root: null,
    R: null,
    L: null, // {shoulder, hint, upper, fore, hand}
  });
  // Elbow hints (view camera space): where the elbow goes when the gun holds the hand far out.
  // Low and outside the frame so forearms enter from the bottom corners.
  const HINT_R = [0.34, -0.6, -0.08],
    HINT_L = [-0.3, -0.65, -0.12];
  const HINT_L_ADS = [-0.2, -0.88, -0.3]; // ADS: left elbow drops so the forearm leaves the sight picture
  const HINT_L_RAISE = [-0.2, -0.16, -0.3]; // left forearm raised across the view (scripted gestures)
  // ADS: the gun arm is extended toward the sights, so its forearm runs back toward the shoulder —
  // a short, foreshortened sleeve into the bottom-right corner instead of a column under the gun
  const HINT_R_ADS = [0.52, -0.46, 0.2];
  P.ARM_HINTS = {
    R: HINT_R,
    L: HINT_L,
    L_ADS: HINT_L_ADS,
    L_RAISE: HINT_L_RAISE,
  };

  function buildSide(isLeft) {
    const s = {
      isLeft,
      shoulder: new THREE.Vector3(isLeft ? -0.19 : 0.19, -0.3, 0.08),
      pole: new THREE.Vector3(isLeft ? -0.75 : 0.75, -1, 0.3).normalize(),
      hint: new THREE.Vector3().fromArray(isLeft ? HINT_L : HINT_R),
      upper: new THREE.Group(),
      fore: new THREE.Group(),
      hand: buildHand(isLeft),
      visible: true,
    };
    s.upper.add(buildUpperArm(UPPER));
    // elbow cap
    const elbow = P.mesh(GEO.sphere(0.047, 12, 10), "sleeve");
    elbow.scale.set(1, 0.95, 1);
    s.upper.add(elbow);
    elbow.position.z = -UPPER;
    s.fore.add(buildForearm(FORE, isLeft));
    A.root.add(s.upper, s.fore, s.hand.root);
    return s;
  }

  A.build = function () {
    if (A.built) return;
    A.root = new THREE.Group();
    A.root.name = "wpn_arms";
    A.R = buildSide(false);
    A.L = buildSide(true);
    A.built = true;
  };

  // ------------------------------------------------------------------
  // Arm solve
  // ------------------------------------------------------------------
  const _d = new THREE.Vector3(),
    _perp = new THREE.Vector3(),
    _elbow = new THREE.Vector3(),
    _wrist = new THREE.Vector3();
  const _m = new THREE.Matrix4(),
    _up = new THREE.Vector3(),
    _dir = new THREE.Vector3(),
    _e2 = new THREE.Vector3(),
    _toEye = new THREE.Vector3();
  const _hint = new THREE.Vector3(),
    _hA = new THREE.Vector3(),
    _hB = new THREE.Vector3();
  const WRIST_OFF = new THREE.Vector3(0, PALM_Y - 0.001, 0.086); // wrist joint in hand frame (heel of the palm) — the cuff ends here
  const _mirrorOff = new THREE.Vector3();

  /**
   * target: {p, q} hand pose in arms-root space (or null to hide the side)
   * opt: {ads, raise, hint (array override)}
   */
  const _sh = new THREE.Vector3();
  function solveSide(s, target, opt) {
    if (!target) {
      s.upper.visible = s.fore.visible = s.hand.root.visible = false;
      return;
    }
    s.upper.visible = s.fore.visible = s.hand.root.visible = true;
    // hand placement
    s.hand.root.position.copy(target.p);
    s.hand.root.quaternion.copy(target.q);
    // wrist point
    _mirrorOff.copy(WRIST_OFF);
    if (s.isLeft) _mirrorOff.x *= -1;
    _wrist.copy(_mirrorOff).applyQuaternion(target.q).add(target.p);
    // (0) lean into long guns: when the hand is held beyond arm's reach (rifle fore-ends), the shoulder comes
    // forward toward it (bladed stance) instead of the upper arm stretching into a long thin sleeve
    _sh.copy(s.shoulder);
    {
      _d.subVectors(_wrist, _sh);
      const over = _d.length() - (UPPER + FORE) * 0.96;
      if (over > 0) _sh.addScaledVector(_d.normalize(), Math.min(0.2, over));
    }
    // (1) classic two-bone IK with natural lengths (valid when the hand is within reach)
    _d.subVectors(_wrist, _sh);
    const dist = Math.max(1e-4, _d.length());
    const dir = _dir.copy(_d).divideScalar(dist);
    const reach = UPPER + FORE;
    if (dist < reach * 0.999) {
      const cosA = THREE.MathUtils.clamp(
        (UPPER * UPPER + dist * dist - FORE * FORE) / (2 * UPPER * dist),
        -1,
        1,
      );
      const sinA = Math.sqrt(1 - cosA * cosA);
      _perp.copy(s.pole).addScaledVector(dir, -s.pole.dot(dir));
      if (_perp.lengthSq() < 1e-6) _perp.set(0, -1, 0);
      _perp.normalize();
      _elbow
        .copy(_sh)
        .addScaledVector(dir, UPPER * cosA)
        .addScaledVector(_perp, UPPER * sinA);
    } else _elbow.copy(_sh).addScaledVector(dir, UPPER);
    // (2) elbow hint for out-of-reach hands (gun sockets far forward): forearm aims at the hint
    const hintW = smooth(0.78, 1.0, dist / reach);
    if (hintW > 0) {
      if (opt && opt.hint) _hint.fromArray(opt.hint);
      else _hint.copy(s.hint);
      if (s.isLeft && opt) {
        if (opt.ads > 0) _hint.lerp(_hA.fromArray(HINT_L_ADS), opt.ads);
        if (opt.raise > 0) _hint.lerp(_hB.fromArray(HINT_L_RAISE), opt.raise);
      } else if (opt && opt.ads > 0 && !opt.hint)
        _hint.lerp(_hA.fromArray(HINT_R_ADS), opt.ads);
      // forearm direction: toward the hint, but never more than MAX_BEND away from the straight-wrist
      // direction (+Z of the hand) — real wrists only flex so far, and a hard kink reads as broken
      _hA.subVectors(_hint, _wrist).normalize();
      _hB.set(0, 0, 1).applyQuaternion(target.q); // straight-wrist direction
      if (_hB.z < 0.25) {
        _hB.z = 0.25;
        _hB.normalize();
      } // ...but the elbow never goes out in front of the wrist
      const adsR = !s.isLeft && opt && !opt.hint ? opt.ads || 0 : 0; // extended gun arm: follow the hint freely
      _hA.lerp(_hB, 0.4 * (1 - adsR)).normalize();
      const maxBend = s.isLeft ? 0.62 : 0.85 + 0.7 * adsR;
      const ang = _hA.angleTo(_hB);
      if (ang > maxBend) {
        _hA.lerp(_hB, 1 - maxBend / ang).normalize();
      }
      _e2.copy(_wrist).addScaledVector(_hA, FORE);
      _elbow.lerp(_e2, hintW);
    }
    // (3) anatomy guard: the elbow hangs BELOW the wrist and stays on its own side. Without this a hand
    // turned palm-down under the gun (mag fetch, reload tilt, first draw) aimed the forearm straight up
    // and swung the sleeve across the lens. Relaxed only while the left forearm is deliberately raised.
    {
      const raiseK =
        s.isLeft && opt ? THREE.MathUtils.clamp(opt.raise || 0, 0, 1) : 0;
      const minDrop = (s.isLeft ? 0.42 : 0.3) * (1 - raiseK);
      _e2.subVectors(_elbow, _wrist);
      const l = _e2.length();
      if (l > 1e-6) {
        _e2.divideScalar(l);
        let changed = false;
        const side = s.isLeft ? -1 : 1;
        if (_e2.x * side < -0.18 * (1 - raiseK)) {
          _e2.x = -0.18 * (1 - raiseK) * side;
          changed = true;
        } // never cross to the other side
        if (_e2.z < -0.1 * (1 - raiseK)) {
          _e2.z = -0.1 * (1 - raiseK);
          changed = true;
        } // never in front of the wrist
        if (_e2.y > -minDrop) {
          const h = Math.hypot(_e2.x, _e2.z),
            ny = -minDrop,
            hs = Math.sqrt(1 - ny * ny);
          if (h > 1e-4) {
            _e2.x *= hs / h;
            _e2.z *= hs / h;
          } else {
            _e2.x = side * hs * 0.8;
            _e2.z = hs * 0.6;
          }
          _e2.y = ny;
          changed = true;
        }
        if (changed) {
          _e2.normalize();
          _elbow.copy(_wrist).addScaledVector(_e2, l);
        }
      }
    }
    // keep the forearm at its natural length (it is the part you actually see)
    _e2.subVectors(_elbow, _wrist);
    if (_e2.lengthSq() < 1e-8) _e2.set(s.isLeft ? -1 : 1, -1, 0.3);
    _elbow.copy(_wrist).addScaledVector(_e2.normalize(), FORE);
    // upper arm: shoulder -> elbow, stretched as needed (normally off-screen)
    const ul = _elbow.distanceTo(_sh);
    _perp.subVectors(_elbow, _sh);
    _up.copy(s.pole).negate();
    if (Math.abs(_up.dot(_perp) / Math.max(ul, 1e-4)) > 0.98) _up.set(0, 1, 0);
    _m.lookAt(_sh, _elbow, _up);
    s.upper.position.copy(_sh);
    s.upper.quaternion.setFromRotationMatrix(_m);
    s.upper.scale.set(1, 1, THREE.MathUtils.clamp(ul / UPPER, 0.5, 3));
    // forearm: -Z toward the wrist, twist follows the back of the hand (+Y of hand)
    _up.set(0, 1, 0).applyQuaternion(target.q);
    if (s.isLeft) {
      // forearm twist: in play it mostly follows the hand; raised, the inside of the wrist turns toward the eye
      _toEye.copy(_elbow).add(_wrist).multiplyScalar(-0.5).normalize();
      const ads = opt ? opt.ads || 0 : 0,
        raise = opt ? opt.raise || 0 : 0;
      const k = 0.3 * (1 - 0.8 * ads) + 0.6 * raise;
      _up
        .multiplyScalar(1 - k)
        .addScaledVector(_toEye, k)
        .normalize();
    }
    _m.lookAt(_elbow, _wrist, _up);
    s.fore.position.copy(_elbow);
    s.fore.quaternion.setFromRotationMatrix(_m);
    s.fore.scale.set(1, 1, 1);
  }

  /**
   * Called every frame by the viewmodel.
   * right/left: {p:Vector3, q:Quaternion} in arms-root (view camera) space, or null to hide.
   * opt: {ads:0..1, raise:0..1, hintL, hintR}
   */
  const _optL = { ads: 0, raise: 0, hint: null },
    _optR = { ads: 0, raise: 0, hint: null };
  A.solve = function (right, left, opt) {
    if (!A.built) return;
    _optL.ads = _optR.ads = (opt && opt.ads) || 0;
    // one-handed guns: the gun arm is always the "extended" arm (hip, reload, ADS) and the off arm keeps its
    // elbow dropped when it comes up to the gun, like in ADS
    if (opt && opt.ext) {
      _optR.ads = Math.max(_optR.ads, opt.ext);
      _optL.ads = Math.max(_optL.ads, opt.ext * 0.8);
    }
    _optL.raise = _optR.raise = (opt && opt.raise) || 0;
    _optL.hint = (opt && opt.hintL) || null;
    _optR.hint = (opt && opt.hintR) || null;
    solveSide(A.R, right, _optR);
    solveSide(A.L, left, _optL);
  };
  /** Set target pose for a hand ('R'|'L'). */
