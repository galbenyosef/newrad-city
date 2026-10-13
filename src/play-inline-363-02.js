// play-inline-363 02 — pyr
// Lines 21-44 of readable/play-inline-363.pretty.js (statement-aligned).
  const PF = G._pws;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FW = (PF.FW = {
    X0: -110,
    X1: -50,
    Z0: 812,
    Z1: 843,
    BASE: 24,
    MID: 62,
    TWR: 94,
    TOP: 106,
    PYR: 134,
    SPIRE: 147, // PYR = apex of the (truncated) pyramid
  });
  FW.XC = (FW.X0 + FW.X1) / 2;
  FW.ZC = (FW.Z0 + FW.Z1) / 2;
  FW.door = V3(FW.XC, 1.6, FW.Z0 + 2.2);

