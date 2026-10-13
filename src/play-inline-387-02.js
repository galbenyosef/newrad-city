// play-inline-387 02 — the
// Lines 31-58 of readable/play-inline-387.pretty.js (statement-aligned).
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const FA = (PV.fa = {
    X0: -180,
    X1: -140,
    Z0: -132,
    Z1: -106,
    PY: 3.0, // portico / stylobate height
    STEP_X: -144.5, // top of the steps = front of the pavilions & entablature
    WALL_X: -148.5, // loggia back wall (building front)
    COL_X: -145.4, // column centre line
    COL_TOP: 15.0,
    ROOF: 22.5,
    PZ0: -128.6,
    PZ1: -109.4, // colonnade span between the pavilions
    DOCK_X: -176, // west wall behind the loading dock
  });
  FA.door = new THREE.Vector3(FA.WALL_X + 0.35, FA.PY + 1.3, -119);

  const STONE = [0.88, 0.85, 0.8],
    GRAN = [0.8, 0.77, 0.73];

  // ==================================================================
  // EXTERIOR
  // ==================================================================
