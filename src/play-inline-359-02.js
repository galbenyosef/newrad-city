// play-inline-359 02 — tower
// Lines 19-50 of readable/play-inline-359.pretty.js (statement-aligned).
  const PF = G._pws;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  // footprint (world)
  const SP = (PF.SP = {
    FN: 632.4,
    FS: 662.6,
    FW: -109.5,
    FE: -50.5, // churchyard fence line
    TW: -105,
    TE: -98,
    TN: 644,
    TS: 651,
    ZC: 647.5, // tower
    NW: -98,
    NE: -72,
    NN: 639.5,
    NS: 655.5, // nave
    PE: -66,
    PN: 640.3,
    PS: 654.7, // portico
    WALL: 10.5,
    RIDGE: 15.2,
    TOWER: 15.6,
  });
  PF.SP.door = V3(SP.TW - 0.35, 1.6, SP.ZC);

