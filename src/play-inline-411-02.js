// play-inline-411 02 — log_y
// Lines 23-41 of readable/play-inline-411.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const BT = (PV.bt = {
    X0: 147,
    X1: 173,
    Z0: 818,
    Z1: 842,
    XC: 160,
    LOG_Z: 821.5, // loggia back wall (the doors)
    LOG_Y: 1.0, // loggia floor
    BASE_H: 22,
    SHAFT_H: 86,
    COLO_H: 98,
  });
  BT.door = new THREE.Vector3(BT.XC, BT.LOG_Y + 1.3, BT.LOG_Z - 0.45);

