// play-inline-227 02 — math
// Lines 33-58 of readable/play-inline-227.pretty.js (statement-aligned).
  const LI = G._li,
    A = LI.arch,
    F = LI.furn,
    TAU = Math.PI * 2;
  const KEY = "un_assembly";

  // ---- hall geometry constants ----
  const CX = 0,
    CZ = 12; // focus of the tiers (speaker's rostrum)
  const R0 = 5,
    DR = 1.4,
    NT = 16,
    RISE = 0.225,
    TOPY = NT * RISE,
    RB = R0 + NT * DR,
    RW = 29;
  const AM = (70 * Math.PI) / 180,
    HH = 19,
    NF = 13;
  const P = (a, r) => [CX + r * Math.sin(a), CZ - r * Math.cos(a)];
  const LOBY = TOPY; // lobby floor = back aisle
  const LCEIL = LOBY + 9.5;

  // ==================================================================
  // Art (all original)
  // ==================================================================
