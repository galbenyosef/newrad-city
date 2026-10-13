// play-inline-492 01 — the
// Lines 10-97 of readable/play-inline-492.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const P = G.weapons._;
  const GEO = P.GEO,
    C = P.COMP;
  P.MODELS = P.MODELS || {};
  const M = P.MODELS;

  /** Rotate a list of [u (across/fwd), v (along/up)] points by rake angle a (top leans forward). */
  function raked(pts, a, off) {
    const c = Math.cos(a),
      s = Math.sin(a);
    return pts.map((p) => [
      p[0] * c + p[1] * s + (off ? off[0] : 0),
      -p[0] * s + p[1] * c + (off ? off[1] : 0),
    ]);
  }
  P.raked = raked;
  /** Grip-axis vectors for a rake angle a: down along grip (weapon space). */
  function gripAxis(a) {
    return [0, -Math.cos(a), Math.sin(a)];
  }
  P.gripAxis = gripAxis;

  // ------------------------------------------------------------------
  // FISTS rig (also base for brass knuckles & power fist)
  // ------------------------------------------------------------------
  P.fistsRig = function (skin, world, extraR) {
    const root = new THREE.Group();
    root.name = "fists";
    // root sits between the fists (so sway/recoil/sprint rotate about the hands, not the eye)
    const fistR = new THREE.Group();
    fistR.name = "fistR";
    fistR.position.set(0.125, 0.007, 0.015);
    root.add(fistR);
    const fistL = new THREE.Group();
    fistL.name = "fistL";
    fistL.position.set(-0.125, -0.003, -0.015);
    root.add(fistL);
    // boxing guard: knuckles forward & slightly up, thumbs on top, palms facing inward
    // boxer's guard: knuckles forward and a little up, backs of the hands facing up/outward,
    // thumbs on the inner top edge — from the eye you see knuckles, backs of hands and thumbs.
    // (round 2) fists turned ~45° thumbs-up-and-in, knuckles forward, backs of the hands out: from the eye you see the
    // rolled fingers, the thumb locked over index & middle finger and the knuckle ridge — the old
    // backs-up guard showed only a smooth hand-back from behind and read as a lump.
    // (loop 2) rolled back toward a classic guard: backs of the hands up-and-out (~35° from flat), thumbs on the
    // inner top edge — the eye sees the knuckle row and the finger backs rolling under, not the curled
    // fingertips/nails of a thumbs-up fist (which read as claws once the fingers bend smoothly)
    // (round 2b) backs of the hands turned a further ~15° up and toward the eye: the curled middle phalanges
    // now face down/away (hidden under the fist) — from the eye you see the hand-back, knuckle ridge and the
    // thumb locked across the fingers, a solid fist instead of a hooked "claw"
    const rh = P.handSocket(
      fistR,
      "rightHand",
      [0, 0, 0],
      [0.85, -0.45, 0.1],
      [0.45, 0.85, 0.28],
    );
    const lh = P.handSocket(
      fistL,
      "leftHand",
      [0, 0, 0],
      [0.85, 0.45, -0.1],
      [-0.45, 0.85, 0.28],
    );
    if (extraR) extraR(fistR, rh);
    return {
      root,
      parts: { fistR, fistL },
      sockets: { rightHand: rh, leftHand: lh, muzzle: rh },
      cfg: {
        hip: { p: [0, -0.112, -0.355], r: [0, 0, 0] },
        rightPose: "fist",
        leftPose: "fist",
        sprint: { p: [0, -0.06, 0.04], r: [-0.25, 0.2, 0.1] },
        block: { p: [-0.02, 0.1, 0.06], r: [0.25, 0, 0.15] },
      },
    };
  };
  M.fists = function (skin, world) {
    return P.fistsRig(skin, world);
  };

  // ------------------------------------------------------------------
  // 10mm PISTOL (M-55): boxy slide with slanted nose, big square
  // trigger guard, raked grip with bakelite panels, exposed hammer.
  // ------------------------------------------------------------------
