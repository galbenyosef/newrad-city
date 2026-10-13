// play-inline-454 06 — bones
// Lines 1637-1659 of readable/play-inline-454.pretty.js (statement-aligned).
  const PART_IDS = (L.PART_IDS = {
    head: 0,
    torso: 1,
    leftArm: 2,
    rightArm: 3,
    leftLeg: 4,
    rightLeg: 5,
    none: 9,
  });
  L.PART_NAMES = [
    "head",
    "torso",
    "leftArm",
    "rightArm",
    "leftLeg",
    "rightLeg",
  ];

  /**
   * Rig: define bones (bind positions, identity rotations) and attach
   * geometry to bones. build() produces a cached "template" from which
   * any number of SkinnedMesh instances are spawned.
   */
