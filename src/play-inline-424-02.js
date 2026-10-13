// play-inline-424 02 — building
// Lines 27-61 of readable/play-inline-424.pretty.js (statement-aligned).
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;

  const PA = (PV.pa = {
    PY: 0.35,
    PF: 0.75, // deck top, building floor
    DX0: -255.5,
    DX1: -206,
    DZ0: 884.5,
    DZ1: 905.5,
    HX0: -224,
    HX1: -214,
    BZ0: 889,
    BZ1: 901, // head house x, building z
    SX0: -245, // shed west end
    TX: -248,
    TZ: 895,
    TW: 6, // tower centre/width
    BOAT: {
      x: -233,
      z: 878.6,
      y: -0.95,
      pitch: -0.13,
      roll: 0.06,
      len: 24,
      beam: 6.6,
      deck: 1.2,
    },
  });

  // ==================================================================
  // EXTERIOR
  // ==================================================================
