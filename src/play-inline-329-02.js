// play-inline-329 02 — key
// Lines 22-44 of readable/play-inline-329.pretty.js (statement-aligned).
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "webster_hall";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const STU = 0,
    MAIN = 4.5,
    BALC = 10,
    CEIL = 16.5,
    STAGE = MAIN + 1.2;
  const XW = -22,
    XE = 22,
    ZN = -16,
    ZS = 16;

