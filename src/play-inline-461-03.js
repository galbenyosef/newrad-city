// play-inline-461 03 — maniac_info
// Lines 364-405 of readable/play-inline-461.pretty.js (statement-aligned).
  const MANIAC_INFO = {
    kind: "biped",
    height: 1.68,
    radius: 0.32,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.66, runStep: 1.45, walkSpeed: 1.5, runSpeed: 6.3 },
    // crouched, twitchy stance: rounded back, shoulders up, head thrust forward & low, knees bent, hands clawed
    style: {
      hunch: 0.7,
      crouch: 0.3,
      shrug: 0.18,
      neckK: 0.7,
      wild: true,
      claws: true,
      armFwd: 0.44,
      elbow: 0.72,
      armOut: 0.22,
      stride: 1.0,
      armSwing: 1.15,
      lookLimit: 1.4,
    },
    variants: 24,
  };
  L.infos.maniac = Object.assign({}, MANIAC_INFO, {
    build: (o, s) => buildManiac(o, s, false),
  });
  L.infos.maniac_bruiser = Object.assign({}, MANIAC_INFO, {
    height: 1.86,
    radius: 0.38,
    variants: 8,
    gait: { walkStep: 0.72, runStep: 1.5, walkSpeed: 1.4, runSpeed: 5.9 },
    style: Object.assign({}, MANIAC_INFO.style, {
      hunch: 0.55,
      crouch: 0.22,
      shrug: 0.26,
      armOut: 0.3,
    }),
    build: (o, s) => buildManiac(o, s, true),
  });
