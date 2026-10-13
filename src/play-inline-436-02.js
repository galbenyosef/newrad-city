// play-inline-436 02 — bx0
// Lines 24-74 of readable/play-inline-436.pretty.js (statement-aligned).
  const PK = G._ppk;
  const K = PK.kit;
  const PI = Math.PI,
    HP = PI / 2;
  PK.EXT = PK.EXT || {};

  // ---------------------------------------------------------------- plan (world)
  const BX0 = -108.5,
    BX1 = -99.0,
    BZ0 = -574.5,
    BZ1 = -558.0; // main building
  const YE = 4.6,
    YR = 9.7; // eave, ridge
  const CX0 = -99.0,
    CX1 = -94.4,
    CZ0 = -573.0,
    CZ1 = -559.6,
    CH = 5.0; // Crystal Room pavilion
  const DOOR = { x: -104, z: BZ1 };
  const YZ0 = -557.8,
    YZ1 = -546.3,
    YX0 = -108.9,
    YX1 = -93.9; // courtyard
  const GATE = { x: -101, z: YZ1 },
    EGATE = { x: YX1, z: -549.4 };
  const BRICK = [0.6, 0.3, 0.22],
    BUFF = [0.86, 0.8, 0.66],
    DARKB = [0.3, 0.18, 0.14];
  PK.TAV_DOOR = DOOR;

  function groundY() {
    let s = 0,
      n = 0;
    for (const [x, z] of [
      [BX0, BZ0],
      [BX1, BZ0],
      [BX0, BZ1],
      [CX1, CZ1],
      [GATE.x, GATE.z],
      [YX0, YZ1],
    ]) {
      try {
        s += G.world.terrainHeight(x, z) || 0;
        n++;
      } catch (e) {
        /* 0 */
      }
    }
    return n ? Math.max(-0.2, Math.min(0.6, s / n)) : 0;
  }

