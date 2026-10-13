// play-inline-467 06 — all6
// Lines 1082-1113 of readable/play-inline-467.pretty.js (statement-aligned).
  L.infos.striker = {
    kind: "biped",
    height: 1.85,
    radius: 0.36,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Sensor Wedge",
      torso: "Torso",
      leftArm: "Left Blade",
      rightArm: "Right Blade",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.85, runStep: 1.7, walkSpeed: 1.8, runSpeed: 7.0 },
    style: {
      stiff: false,
      claws: true,
      armOut: 0.14,
      armFwd: 0.3,
      elbow: 0.7,
      armSwing: 0.7,
      stride: 1.15,
      hunch: 0.32,
      crouch: 0.12,
      ranged: true,
      lookLimit: 1.4,
    },
    variants: 3,
    build: buildStriker,
  };
