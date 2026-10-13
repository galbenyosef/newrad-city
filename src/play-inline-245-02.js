// play-inline-245 02 — exterior
// Lines 28-77 of readable/play-inline-245.pretty.js (statement-aligned).
  const PR = G._pr;
  const K = PR.kit,
    D = PR.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  const C = { x: 406, z: -670 }; // rotunda centre (exterior)
  const RO = 9.8; // exterior circumradius
  const APO = RO * Math.cos(PI / 8); // exterior apothem (≈ 9.05)
  // interior
  const IAP = 9.05,
    IRI = IAP / Math.cos(PI / 8); // inner apothem / circumradius
  const LV = [0, 5, 10, 15]; // floor levels
  const STAIR = { rIn: 2.9, rOut: 5.3, a0: 0, per: 20 };
  const GAL_IN = 5.45; // gallery inner edge radius

  Object.assign(PR.MAT_DEFS, {
    win_day: {
      color: 0x8a947c,
      emissive: 0x76866a,
      emissiveIntensity: 0.55,
      rough: 0.8,
      uv: 1.5,
      plain: true,
      noShadow: true,
    },
    dado: {
      custom: "plaster_old",
      prefer: "custom",
      color: 0x46503c,
      tint: 0x55604a,
      rough: 0.7,
      uv: 3.2,
    },
    tv_glow: {
      color: 0x9ab0c8,
      emissive: 0x8aa8e0,
      emissiveIntensity: 1.3,
      rough: 0.3,
      uv: 1,
      plain: true,
      noShadow: true,
    },
  });

  // ===================================================================
  // EXTERIOR
  // ===================================================================
