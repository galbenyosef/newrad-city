// play-inline-364 02 — hall
// Lines 28-45 of readable/play-inline-364.pretty.js (statement-aligned).
  const PF = G._pws;
  const D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "forty_wall";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const HALL = 6.5,
    VAULT = 0,
    HCEIL = HALL + 11;

