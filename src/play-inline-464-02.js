// play-inline-464 02 — blanket
// Lines 23-44 of readable/play-inline-464.pretty.js (statement-aligned).
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

  const PACKS = [
    { blanket: 0x7a2a22, stripe: 0xd8c8a0 }, // oxblood
    { blanket: 0x2c4a6a, stripe: 0xe0d0a0 }, // faded navy
    { blanket: 0x5a6a2a, stripe: 0xc8a040 }, // olive
  ];

