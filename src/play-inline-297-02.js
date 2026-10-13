// play-inline-297 02 — alg_cat_found
// Lines 23-47 of readable/play-inline-297.pretty.js (statement-aligned).
  const PM = G._pm2;
  const K = PM.kit,
    D = PM.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const FZ = -147.3; // facade plane (44th Street)
  const AX0 = -92,
    AX1 = -66,
    AH = 38; // hotel footprint x, cornice height
  const F2 = 5.4,
    CEIL2 = 8.8;

  Object.assign(PM.flagDefaults, {
    alg_cat_found: false,
    alg_cat_home: false,
    alg_cat_pets: 0,
    alg_room_rented: false,
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
