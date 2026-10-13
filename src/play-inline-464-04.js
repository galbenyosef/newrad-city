// play-inline-464 04 — build
// Lines 670-689 of readable/play-inline-464.pretty.js (statement-aligned).
  L.infos.pack_ox = {
    kind: "quad",
    height: 1.75,
    radius: 1.0,
    gore: "red",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gait: { walkStep: 0.95, runStep: 1.7, walkSpeed: 1.3, runSpeed: 5.2 },
    style: { stride: 0.8, pant: false, wag: false, tailUp: -0.15, graze: true },
    variants: 6,
    build: buildPackOx,
  };
