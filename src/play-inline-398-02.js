// play-inline-398 02 — door
// Lines 22-38 of readable/play-inline-398.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI;
  PV.EXT = PV.EXT || {};

  const X0 = -68.5,
    X1 = -51.5,
    BZ0 = 376.5,
    BZ1 = 385; // house
  const SZ = 391.6; // street wall line
  const GATE_X = -63.5;
  const DOOR = { x: -59, z: BZ1 }; // courtyard door (south face)
  const D86 = { x: X1, z: 380.8 }; // the "86" door (east face)
  PV.CH_DOOR = DOOR;
  PV.CH_86 = D86;
  const BRICK = [0.8, 0.52, 0.42];

