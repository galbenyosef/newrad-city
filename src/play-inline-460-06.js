// play-inline-460 06 — bone
// Lines 1263-1332 of readable/play-inline-460.pretty.js (statement-aligned).
  L.infos.ripjaw = {
    kind: "quad",
    height: 1.0,
    radius: 0.85,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: {
      head: "Jaws",
      torso: "Armoured Back",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Legs",
      rightLeg: "Right Legs",
    },
    gait: { walkStep: 0.75, runStep: 1.7, walkSpeed: 1.8, runSpeed: 8.5 },
    style: { stride: 0.8, tailUp: -0.05, lookLimit: 0.9 },
    variants: 3,
    build: buildRipjaw,
  };

  // ==================================================================
  // shared six-legged insect rig (roaches, ants)
  // ==================================================================
  function sixLegRig(R, s, bodyH, legSpan, legs, partMap) {
    R.bone("body", null, 0, bodyH, 0, "torso");
    R.bone("head", "body", 0, 0.01 * s, -legs.headZ * s, "head");
    R.bone("antL", "head", -0.02 * s, 0.03 * s, -0.04 * s, "head");
    R.bone("antR", "head", 0.02 * s, 0.03 * s, -0.04 * s, "head");
    R.bone("mandL", "head", -0.02 * s, -0.02 * s, -0.05 * s, "head");
    R.bone("mandR", "head", 0.02 * s, -0.02 * s, -0.05 * s, "head");
    R.bone("abdomen", "body", 0, 0, legs.abdZ * s, "torso");
    const rows = [
      ["1", -legs.z1],
      ["2", 0],
      ["3", legs.z3],
    ];
    for (const [n, z] of rows) {
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + n;
        R.bone(
          "leg" + S,
          "body",
          sg * legs.hipX * s,
          -0.01 * s,
          z * s,
          partMap[S] || "torso",
        );
        R.bone(
          "foot" + S,
          "leg" + S,
          sg * legSpan[0] * s,
          legSpan[1] * s,
          (z === 0 ? 0 : Math.sign(z)) * legSpan[2] * s,
          partMap[S] || "torso",
        );
      }
    }
  }
  // ==================================================================
  // SHELLBACK — horseshoe-crab-like: a broad, low DOMED head shield with
  // a keel and compound eyes, a hinged spiny rear shell, a long spike
  // tail, four pairs of walking legs mostly hidden under the dome rim and
  // two short pincer arms at the front. Variants: normal, 'stalker'
  // (high-legged, dark, fast), 'spawn' (small pale juvenile), 'matriarch'
  // (huge, rim spines, barnacles, egg clusters). Insect plan.
  // ==================================================================
