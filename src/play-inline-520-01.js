// play-inline-520 01 — three
// Lines 21-77 of readable/play-inline-520.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const K = G.ambient._;

  const BODY_TYPE = "ash_bear"; // borrowed combat body (bear-sized capsules)
  const PACKS = [
    { blanket: 0x7a2a22, stripe: 0xd8c8a0 }, // oxblood
    { blanket: 0x2c4a6a, stripe: 0xe0d0a0 }, // faded navy
    { blanket: 0x5a6a2a, stripe: 0xc8a040 }, // olive
  ];
  let GEO = null; // shared geometries, built on first use

  // Dun hide with darker patches, a pale belly and old healed scars (thin pale streaks)
  function paintHide(geo, seed) {
    const p = geo.attributes.position,
      n = p.count,
      a = new Float32Array(n * 3);
    const U = G.util;
    const hide = new THREE.Color(0x8c6a4c),
      dark = new THREE.Color(0x4a3526),
      pale = new THREE.Color(0xb39478),
      scar = new THREE.Color(0xc9ab9c),
      c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const f = U.fbm2(x * 1.6 + seed, z * 1.4 + y * 1.2, 3);
      if (f > 0.64) c.copy(dark).lerp(hide, K.clamp((0.72 - f) * 6, 0, 1));
      else c.copy(hide);
      if (y < 0.85) c.lerp(pale, K.clamp((0.85 - y) * 2.5, 0, 0.7)); // pale belly
      const r = Math.abs(U.noise2(x * 1.7 + seed * 3, y * 12 + z * 2.4) - 0.5); // long thin ridges → scars
      if (r < 0.022 && y > 0.8) c.lerp(scar, 0.85);
      const ao = K.clamp(0.62 + (y - 0.55) * 0.55, 0.55, 1.05); // darker underside
      const grain = 0.94 + U.hash2(i * 7 + seed, i * 3) * 0.1;
      a[i * 3] = c.r * ao * grain;
      a[i * 3 + 1] = c.g * ao * grain;
      a[i * 3 + 2] = c.b * ao * grain;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(a, 3));
    return geo;
  }
  const S = (geo, pos, scale, rot) =>
    G.util.bake(
      geo,
      new THREE.Vector3(pos[0], pos[1], pos[2]),
      rot ? rot[1] : 0,
      scale
        ? typeof scale === "number"
          ? scale
          : new THREE.Vector3(scale[0], scale[1], scale[2])
        : 1,
      rot ? rot[0] : 0,
      rot ? rot[2] : 0,
    );

