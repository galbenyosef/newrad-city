// play-inline-268 02 — arc
// Lines 32-61 of readable/play-inline-268.pretty.js (statement-aligned).
  const P = G._ues,
    D = P.dress,
    A = P.arch;
  const PI = P.PI,
    HP = P.HP,
    TAU = P.TAU;
  const LIFT = 5;
  // cylinder (axis y, arc in x/z) → axis along x, arc in the y/z plane (y = R cosθ up, z = R sinθ)
  const PERM_X = new THREE.Matrix4().set(
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    1,
    0,
    0,
    0,
    0,
    0,
    0,
    1,
  );

  // ===================================================================
  // EXTERIOR
  // ===================================================================
