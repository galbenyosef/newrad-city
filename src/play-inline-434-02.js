// play-inline-434 02 — polar
// Lines 33-92 of readable/play-inline-434.pretty.js (statement-aligned).
  const PK = G._ppk;
  const K = PK.kit;
  const PI = Math.PI,
    HP = PI / 2;
  PK.EXT = PK.EXT || {};

  // ---------------------------------------------------------------- plan (world coords)
  const AX0 = 90,
    AX1 = 108,
    AZ0 = -494.5,
    AZ1 = -481,
    AH = 13; // Arsenal main block
  const PX0 = 96.3,
    PX1 = 101.7,
    PZ = -479.5,
    PH = 15.2; // entrance pavilion
  const DOORX = 99;
  const STOOP = 0.9;
  const WZ = -470; // zoo north wall (Delacorte arch)
  const SZ = -436.5; // zoo south wall
  const EX = 108; // zoo east wall
  const CLK = { x: 96.5, z: WZ };
  const POOL = { x: 95.5, z: -454, r: 6 };
  const TROP = { x: 89.6, z: -463.2, r: 4 };
  const POLAR = { x: 80.5, z: -443 };
  const SGATE = { x: 85.6, z: SZ };
  const KEEPER = { x: 81.2, z: -448.6 }; // keeper's door in the polar rocks (faces north)
  const BRICK = [0.62, 0.34, 0.27],
    TRIM = [0.7, 0.55, 0.43],
    LIME = [0.84, 0.8, 0.72];
  /** East Drive east edge (+ safety margin) at z — nothing solid west of this line. */
  function driveEdge(z) {
    return (
      (z >= -470 ? 84 - (z + 470) * 0.408 : 84 + (-470 - z) * 0.1778) + 1.6
    );
  }
  PK.zooDriveEdge = driveEdge;

  function groundY() {
    let s = 0,
      n = 0;
    for (const [x, z] of [
      [AX0, AZ0],
      [AX1, AZ0],
      [AX0, AZ1],
      [AX1, AZ1],
      [POOL.x, POOL.z],
      [SGATE.x, SGATE.z],
      [POLAR.x, POLAR.z],
    ]) {
      try {
        s += G.world.terrainHeight(x, z) || 0;
        n++;
      } catch (e) {
        /* default 0 */
      }
    }
    return n ? Math.max(-0.2, Math.min(0.6, s / n)) : 0;
  }

