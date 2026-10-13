// play-inline-88 01 — three
// Lines 24-50 of readable/play-inline-88.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  // -------------------------------------------------------------------
  // Grime atlas (4×4 cells, RGBA, drawn once)
  // -------------------------------------------------------------------
  const GR = {
    STREAKS: 0,
    SOOT: 1,
    BASE: 2,
    STAIN: 3,
    RUST: 4,
    VINES: 5,
    CRACKS: 6,
    SCORCH: 7,
    BULLETS: 8,
    MOSS: 9,
    PEEL: 10,
    SOOTBAND: 11,
    HANGVINES: 12,
    LEAK: 13,
    CHAR: 14,
    DUST: 15,
  };
  M.GR = GR;
