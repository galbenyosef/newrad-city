// play-inline-282 04 — the
// Lines 726-733 of readable/play-inline-282.pretty.js (statement-aligned).
  const Y_PIT = -2.1,
    Y_STAGE = -1.0,
    Y_BASE = -4.5,
    Y_UP = 6.5;
  // The engine's ground never goes below the interior terrain (y = 0), so the whole cell is lifted:
  // local y = -4.5 (basement) sits at world y = 0.
  const LIFT = 4.5;

