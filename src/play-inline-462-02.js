// play-inline-462 02 — clamp
// Lines 23-49 of readable/play-inline-462.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human,
    P = L.prim,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ;
  const lerp = L.lerp,
    clamp = L.clamp,
    PI = Math.PI;
  const sm = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ==================================================================
  // STINGER — a giant wasp-like arthropod on eight legs: banded ochre &
  // black, a pinched waist, folded smoky wings over a segmented abdomen,
  // two RAPTORIAL front arms (spined forearm + folding scythe) and a long
  // whip-thin tail arched over the back ending in a needle sting.
  // ==================================================================
  const SCORP_V = {
    bark: { s: 0.55, col: 0xb8a060, joint: 0x2a2218 },
    normal: { s: 1, col: 0xa88a40, joint: 0x221c14 },
    giant: { s: 1.65, col: 0x8a6a2a, joint: 0x1a140e },
  };
