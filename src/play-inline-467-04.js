// play-inline-467 04 — all6
// Lines 622-656 of readable/play-inline-467.pretty.js (statement-aligned).
  L.infos.thinker = {
    kind: "biped",
    height: 1.95,
    radius: 0.42,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Tube Dome",
      torso: "Cabinet",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Tread",
      rightLeg: "Right Tread",
    },
    gait: { walkStep: 0.6, runStep: 0.9, walkSpeed: 1.1, runSpeed: 2.6 },
    style: {
      stiff: true,
      tracked: true,
      armOut: 0.22,
      armFwd: 0.45,
      elbow: 0.9,
      armSwing: 0.2,
      stride: 0.5,
      pincers: true,
      ranged: true,
      lookLimit: 0.6,
    },
    variants: 3,
    build: buildThinker,
  };

  // ==================================================================
  // STRIKER
  // ==================================================================
