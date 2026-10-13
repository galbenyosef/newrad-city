// play-inline-466 08 — all6
// Lines 1869-1899 of readable/play-inline-466.pretty.js (statement-aligned).
  L.infos.bulwark = {
    kind: "biped",
    height: 2.0,
    radius: 0.75,
    gore: "oil",
    isRobot: true,
    parts: ALL6,
    labels: {
      head: "Periscope",
      torso: "Turret",
      leftArm: "Twin Cannon",
      rightArm: "Rocket Box",
      leftLeg: "Left Tread",
      rightLeg: "Right Tread",
    },
    gait: { walkStep: 0.6, runStep: 0.9, walkSpeed: 1.2, runSpeed: 3.2 },
    style: {
      stiff: true,
      heavy: true,
      tracked: true,
      armOut: 0.05,
      armFwd: 1.5,
      elbow: 0.05,
      armSwing: 0.0,
      stride: 0.6,
      ranged: true,
      lookLimit: 1.4,
    },
    variants: 1,
    build: buildBulwark,
  };
