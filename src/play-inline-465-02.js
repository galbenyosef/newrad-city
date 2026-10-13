// play-inline-465 02 — out
// Lines 31-64 of readable/play-inline-465.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human,
    P = L.prim,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ,
    ALL6 = K.ALL6,
    LBL = K.LBL;
  const lerp = L.lerp,
    clamp = L.clamp,
    PI = Math.PI;
  const sm = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const mixTo = (out, c, k) => {
    out[0] = lerp(out[0], c.r, k);
    out[1] = lerp(out[1], c.g, k);
    out[2] = lerp(out[2], c.b, k);
  };
  const QLBL = {
    head: "Head",
    torso: "Torso",
    leftArm: "Left Foreleg",
    rightArm: "Right Foreleg",
    leftLeg: "Left Hind Leg",
    rightLeg: "Right Hind Leg",
  };

  // ==================================================================
  // COYOTE — rangy, mangy, scarred city coyotes ('dark' = night coat)
  // ==================================================================
