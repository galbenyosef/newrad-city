// play-inline-286 02 — light
// Lines 34-53 of readable/play-inline-286.pretty.js (statement-aligned).
  const P = G._pt;

  const C = (h) => new THREE.Color(h);
  // light profile: hemiS/hemiG (sky/ground of the HemisphereLight), hemiI, light/lightI (overhead key), exp, fog/fogD
  const PR = (o) => ({
    hemiS: C(o.hemiS),
    hemiG: C(o.hemiG),
    hemiI: o.hemiI,
    light: C(o.light),
    lightI: o.lightI,
    exp: o.exp,
    fog: C(o.fog),
    fogD: o.fogD,
  });

  // ------------------------------------------------------------------
  // Per-cell zones (local coords relative to the cell origin, floor lift
  // included: world = origin + (x, y + LIFT, z)). Classification = nearest
  // point, with height weighted ×4 so floors never bleed into each other.
  // ------------------------------------------------------------------
