// play-inline-396 02 — len
// Lines 25-89 of readable/play-inline-396.pretty.js (statement-aligned).
  const PV = G._pv3;
  const K = PV.kit;
  const PI = Math.PI;
  PV.EXT = PV.EXT || {};

  // footprint (world)
  const HX0 = 0,
    HX1 = 20,
    HZ0 = 368,
    HZ1 = 384; // courtroom hall
  const WX0 = 3,
    WX1 = 13,
    WZ1 = 391; // south entrance wing (z 384..391)
  const TX0 = 20,
    TX1 = 28,
    TZ0 = 383,
    TZ1 = 391; // corner tower
  const EZ0 = 368; // east wing x 20..28, z 368..383
  const DOOR = { x: 8, z: WZ1 };
  PV.JM_DOOR = DOOR;
  const BRICK = [0.78, 0.44, 0.36],
    STONE = [0.9, 0.86, 0.76];
  const BANDS = [1.05, 4.3, 8.0, 11.6];

  function wall(b, ax, az, bx, bz, nx, nz, y0, y1) {
    // brick face from A to B facing (nx,nz); U axis must satisfy U×Y = n
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const cross = [-uz, 0, ux]; // U × Y
    const same = cross[0] * nx + cross[2] * nz > 0;
    if (same)
      b.face("brick_red", ax, y0, az, ux, 0, uz, 0, 1, 0, len, y1 - y0, {
        tint: BRICK,
      });
    else
      b.face("brick_red", bx, y0, bz, -ux, 0, -uz, 0, 1, 0, len, y1 - y0, {
        tint: BRICK,
      });
    // granite plinth + stone bands
    b.beam(
      "granite",
      ax + nx * 0.12,
      0,
      az + nz * 0.12,
      bx + nx * 0.12,
      0,
      bz + nz * 0.12,
      0.24,
      2.0,
      { tint: [0.62, 0.6, 0.58] },
    );
    K.bands(
      b,
      ax,
      az,
      bx,
      bz,
      nx,
      nz,
      BANDS.filter((y) => y < y1 - 0.3 && y > y0),
      { tint: STONE },
    );
  }

