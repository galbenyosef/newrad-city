// play-inline-361 02 — math
// Lines 21-56 of readable/play-inline-361.pretty.js (statement-aligned).
  const PF = G._pws;
  const K = PF.kit,
    D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const SG = (PF.SG = {
    X0: -110,
    X1: -50,
    Z0: 722,
    Z1: 753,
    TX0: -68,
    TX1: -50,
    TZ0: 728.5,
    TZ1: 746.5, // tower
    BASE: 34,
    MANS: 40, // base block cornice / mansard top
    TOP: 112,
    DOME: 133,
    LANT: 141.5,
    FLAG: 150, // tower shaft top, dome top (gallery), lantern roof, flag
  });
  SG.TXC = (SG.TX0 + SG.TX1) / 2;
  SG.TZC = (SG.TZ0 + SG.TZ1) / 2;
  SG.door = V3(SG.X1 - 1.7, 1.6, SG.TZC);
  SG.gallery = V3(SG.TXC + 3.6, SG.DOME + 0.05, SG.TZC); // exterior lantern-gallery arrival point (east side)

  /** Rounded-square (superellipse) factor for angle a: 1 at the face centres, >1 toward the corners. */
  function sq(a, p) {
    const c = Math.abs(Math.cos(a)),
      s = Math.abs(Math.sin(a));
    return 1 / Math.pow(Math.pow(c, p) + Math.pow(s, p), 1 / p);
  }

