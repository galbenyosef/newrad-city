// play-inline-134 02 — the
// Lines 27-37 of readable/play-inline-134.pretty.js (statement-aligned).
  const LB = G._lb;
  const U = G.util;
  const TAU = Math.PI * 2;

  const TORCH = { x: -6.15, z: -0.3 }; // torch handle axis in the statue's local frame (see buildStatue)
  const LIB_TURRETS = []; // props turret handles (filled at initDone)
  // STATUE_S: the sculpt is modelled at 1:1 of this pedestal's 48 m; scaled up 20 % so at gameplay distances she reads
  // at least as tall as pedestal + fort (the real heel-to-torch 46 m vs 47 m base looks short on screen because the
  // flame and the raised arm are thin, and the eye compares masses, not tips).
  const STATUE_S = 1.3; // round 1 revise: +8 % more (1.2 → 1.3) so she holds her own over the taller fort

