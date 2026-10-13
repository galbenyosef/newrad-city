// play-inline-463 03 — all6
// Lines 368-391 of readable/play-inline-463.pretty.js (statement-aligned).
  L.infos.dog = {
    kind: "quad",
    height: 0.85,
    radius: 0.4,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gait: { walkStep: 0.42, runStep: 1.15, walkSpeed: 1.5, runSpeed: 8.0 },
    style: { stride: 1, wag: true, pant: true, tailUp: 0.2 },
    variants: 4,
    build: buildDog,
  };

  // ==================================================================
  // BURROW RAT
  // ==================================================================
