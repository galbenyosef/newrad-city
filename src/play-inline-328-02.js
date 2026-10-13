// play-inline-328 02 — neon
// Lines 18-34 of readable/play-inline-328.pretty.js (statement-aligned).
  const PF = G._pch;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const WH = (PF.WH = {
    X0: 130,
    X1: 190,
    Z0: 272,
    Z1: 303,
    HX0: 138,
    HX1: 182,
    H: 19,
  });
  WH.neon = []; // neon meshes (materials animated by the generator state)

