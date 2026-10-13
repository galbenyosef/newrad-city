// play-inline-460 08 — all6
// Lines 1799-1874 of readable/play-inline-460.pretty.js (statement-aligned).
  const SHELL_LBL = {
    head: "Head Shield",
    torso: "Shell",
    leftArm: "Left Pincer",
    rightArm: "Right Pincer",
    leftLeg: "Left Legs",
    rightLeg: "Right Legs",
  };
  L.infos.shellback = {
    kind: "insect",
    height: 0.72,
    radius: 0.72,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 0.42, runStep: 0.75, walkSpeed: 1.4, runSpeed: 4.8 },
    style: {},
    variants: 4,
    dirt: [0.15, 0.4],
    build: (o, sd) => buildShellback(o, sd, "normal"),
  };
  L.infos.shellback_stalker = {
    kind: "insect",
    height: 1.1,
    radius: 0.75,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 0.6, runStep: 1.2, walkSpeed: 1.8, runSpeed: 7.2 },
    style: {},
    variants: 2,
    build: (o, sd) => buildShellback(o, sd, "stalker"),
  };
  L.infos.shellback_spawn = {
    kind: "insect",
    height: 0.24,
    radius: 0.24,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 0.16, runStep: 0.3, walkSpeed: 1.0, runSpeed: 4.2 },
    style: {},
    variants: 2,
    build: (o, sd) => buildShellback(o, sd, "spawn"),
  };
  L.infos.shellback_matriarch = {
    kind: "insect",
    height: 2.3,
    radius: 2.2,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 1.2, runStep: 2.0, walkSpeed: 1.8, runSpeed: 4.6 },
    style: { big: true },
    variants: 1,
    build: (o, sd) => buildShellback(o, sd, "matriarch"),
  };
  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  // shared builder helpers for the other creature files
  L.creatureKit = {
    seg,
    claw,
    bodyZ,
    skinMat,
    sixLegRig,
    smoothstep,
    ALL6,
    LBL,
  };
