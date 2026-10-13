// play-inline-426 02 — brick
// Lines 29-57 of readable/play-inline-426.pretty.js (statement-aligned).
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const ES = (PV.es = {
    X0: 472,
    X1: 528,
    Z0: 591,
    Z1: 619,
    UW: 11.2,
    H: [18.2, 20.2, 18.2, 19.2, 20.6],
    // brick tints (×brick_brown): warm Brooklyn common brick, one tone per unit — lifted in round 2 (the block read as a black
    // silhouette at noon)
    TINT: [
      [1.4, 1.02, 0.84],
      [1.28, 0.93, 0.78],
      [1.46, 1.08, 0.88],
      [1.18, 0.9, 0.78],
      [1.34, 0.99, 0.83],
    ],
    FL: [0, 4.4, 7.4, 10.4, 13.4], // floor levels
    YARD: 3, // gutted unit index
  });
  ES.ux = (i) => ES.X0 + i * ES.UW;

  // ==================================================================
  // EXTERIOR
  // ==================================================================
