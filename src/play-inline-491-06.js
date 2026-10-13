// play-inline-491 06 — hsl
// Lines 1458-1488 of readable/play-inline-491.pretty.js (statement-aligned).
  A.setPose = function (side, name) {
    const h = (side === "L" ? A.L : A.R).hand;
    const p = POSES[name] || POSES.relaxed;
    h.target = clonePose(p);
    h.targetName = name;
  };
  A.updateHands = function (dt) {
    if (!A.built) return;
    const rate = 1 - Math.exp(-18 * dt);
    blendPose(A.R.hand, rate);
    blendPose(A.L.hand, rate);
  };
  /** (kept for callers: nothing on the arms has a screen any more) */
  A.updateScreen = function () {};
  /** Player skin tone (view material only — world/NPC skins are separate materials). */
  A.setSkinTone = function (hex) {
    // chargen tones are picked for faces under world light; on the close-up first-person hands the
    // same value reads pale and chalky, so deepen & saturate it a touch (real skin albedo is ~0.6)
    const c = new THREE.Color(hex),
      hsl = {};
    c.getHSL(hsl);
    c.setHSL(hsl.h, Math.min(1, hsl.s * 1.12 + 0.03), hsl.l * 0.86);
    P.mat("skin").color.copy(c);
    getHandMat().color.copy(c);
  };
  // exposed for tools/tests
  A._buildHand = buildHand;
  A._applyPose = function (h, name) {
    h.pose = clonePose(POSES[name] || POSES.relaxed);
    applyPose(h);
  };
