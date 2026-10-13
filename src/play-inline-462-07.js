// play-inline-462 07 — long
// Lines 1193-1220 of readable/play-inline-462.pretty.js (statement-aligned).
  L.infos.ash_bear = {
    kind: "quad",
    height: 1.3,
    radius: 0.95,
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
    gait: { walkStep: 0.9, runStep: 2.0, walkSpeed: 1.5, runSpeed: 7.8 },
    style: { stride: 0.85, pant: false, wag: false, tailUp: 0, bear: true },
    variants: 3,
    build: buildAshBear,
  };

  // ==================================================================
  // LURCHER — a tall, emaciated thing that lurches along on long crooked
  // arms (knuckle-walking) with short bent hind legs, so its back slopes
  // steeply down to the rump; a long eyeless skull ending in a round,
  // lamprey-like mouth ringed with hooked teeth. Pallid, bruise-mottled,
  // burn-scarred skin stretched over ribs and spine knobs. Spits bile.
  // ==================================================================
