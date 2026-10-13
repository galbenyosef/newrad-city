// play-inline-365 02 — attic
// Lines 22-49 of readable/play-inline-365.pretty.js (statement-aligned).
  const PF = G._pws;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const CH = (PF.CH = {
    X0: -109.5,
    X1: -50.5,
    ZN: 857.2,
    ZF: 881,
    ZP: 883,
    ZS: 887.8, // north wall, front (colonnade), pavilions, forecourt edge
    PW: -99,
    PE: -61, // pavilion inner edges
    MAIN: 4.2,
    ORDER: 17.0,
    ENT: 19.4,
    ATTIC: 22.4,
    ROOF: 26.9,
    GX0: -67.2,
    GX1: -61.2, // the shell-broken stretch of cornice & attic (east end of the colonnade)
  });
  CH.XC = (CH.X0 + CH.X1) / 2; // -80
  CH.door = V3(CH.XC, CH.MAIN + 1.6, CH.ZF + 0.5);

