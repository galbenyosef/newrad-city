// play-inline-366 02 — main
// Lines 24-50 of readable/play-inline-366.pretty.js (statement-aligned).
  const PF = G._pws;
  const D = PF.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const KEY = "custom_house";
  const O = G.LAYOUT.INTERIORS[KEY].origin;
  const OX = O.x,
    OZ = O.z;
  const X = (x) => OX + x,
    Z = (z) => OZ + z;
  const P = (x, y, z) => V3(OX + x, y, OZ + z);
  const MAIN = 4.5,
    BASE = 0,
    AMB = MAIN + 6.2; // ambulatory ceiling
  const RA = 13,
    RC = 9; // rotunda semi-axes (x, z)
  const DRUM0 = MAIN + 8,
    DRUM1 = MAIN + 11,
    CROWN = MAIN + 16.5;
  const XW = -21,
    XE = 21,
    ZN = -16,
    ZS = 20;

