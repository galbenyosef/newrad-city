// play-inline-460 04 — gait
// Lines 740-795 of readable/play-inline-460.pretty.js (statement-aligned).
  L.infos.brute = {
    kind: "biped",
    height: 2.3,
    radius: 0.6,
    gore: "violet",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.88, runStep: 1.5, walkSpeed: 1.6, runSpeed: 4.9 },
    // hunched, head low and forward, long heavy forearms swinging in front
    style: {
      hunch: 0.72,
      crouch: 0.34,
      armOut: 0.2,
      armFwd: 0.55,
      elbow: 0.42,
      stride: 1.0,
      armSwing: 0.9,
      shrug: 0.2,
    },
    variants: 6,
    dirt: [0.3, 0.6],
    build: (o, s) => buildBrute(o, s, false),
  };
  L.infos.colossus = {
    kind: "biped",
    height: 4.6,
    radius: 1.4,
    gore: "violet",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 1.6, runStep: 2.5, walkSpeed: 2.1, runSpeed: 5.4 },
    style: {
      hunch: 0.85,
      crouch: 0.6,
      armOut: 0.24,
      armFwd: 0.7,
      elbow: 0.32,
      stride: 0.95,
      armSwing: 0.6,
      heavy: true,
      club: true,
      shrug: 0.24,
      lookLimit: 0.9,
    },
    variants: 1,
    build: (o, s) => buildBrute(o, s, true),
  };

  // ==================================================================
  // RIPJAW — a low, six-legged armoured predator: sprawling crocodilian
  // limbs, overlapping bony scutes from the nape to the tail tip, and a
  // very long narrow jaw lined with interlocking teeth.
  // Quad plan + a middle leg pair (ML/MR) that the gait drives too.
  // ==================================================================
