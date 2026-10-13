// play-inline-98 01 — cell
// Lines 24-42 of readable/play-inline-98.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  const T = 0.18; // wall thickness (each room draws its half)
  const PI = Math.PI;
  // shared signage atlas (55_dungeon_kit.js)
  const DSIGNS = M.DSIGNS,
    SIGN_COLS = M.DSIGN_COLS,
    SIGN_ROWS = M.DSIGN_ROWS;

  // -------------------------------------------------------------------
  // Kit factory
  // -------------------------------------------------------------------
  /**
   * K = M.dungeonKit(key, origin, seed): every helper below works in local
   * cell coordinates (y = 0 is the cell floor). K.finish() pops the transform.
   */
