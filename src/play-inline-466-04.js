// play-inline-466 04 — the
// Lines 631-674 of readable/play-inline-466.pretty.js (statement-aligned).
  function hazardOrDark(vk, dark) {
    return vk === "fire" || vk === "utility"
      ? metal(0xd8a020, { rough: 0.5 })
      : dark;
  }
  L.infos.patrolman = {
    kind: "biped",
    height: 2.0,
    radius: 0.44,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.55, runStep: 0.8, walkSpeed: 1.0, runSpeed: 2.2 },
    style: {
      stiff: true,
      heavy: false,
      armOut: 0.2,
      armFwd: 0.35,
      elbow: 0.9,
      armSwing: 0.4,
      stride: 0.8,
      pincers: true,
      robotZap: true,
      ranged: true,
      lookLimit: 1.6,
    },
    variants: 5,
    build: buildPatrolman,
  };

  // ==================================================================
  // VALET / VALET-M — one-wheel balancing household (or military) unit
  // Hover plan: 'body' is the wheel AXLE (the whole unit leans around it),
  // 'wheel' spins with distance, 'stalk1' is the head (looks around),
  // arm1/fore1 right arm, arm2/fore2 left arm, 'pinch' the right gripper.
  // ==================================================================
