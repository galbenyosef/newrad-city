// play-inline-462 09 — build
// Lines 1649-1668 of readable/play-inline-462.pretty.js (statement-aligned).
  L.infos.lurcher = {
    kind: "quad",
    height: 1.35,
    radius: 0.6,
    gore: "red",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Arm",
      rightArm: "Right Arm",
      leftLeg: "Left Leg",
      rightLeg: "Right Leg",
    },
    gait: { walkStep: 0.5, runStep: 1.0, walkSpeed: 1.2, runSpeed: 4.4 },
    style: { ranged: true, stride: 0.75, pant: false, wag: false, tailUp: 0 },
    variants: 3,
    build: buildLurcher,
  };
