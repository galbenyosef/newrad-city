// play-inline-480 01 — cyl
// Lines 19-344 of readable/play-inline-480.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;

  // ------------------------------------------------------------------
  // Materials (shared)
  // ------------------------------------------------------------------
  let MAT = null;
  function mats() {
    if (MAT) return MAT;
    MAT = {
      base: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.62,
        metalness: 0.12,
      }),
      shiny: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.3,
        metalness: 0.55,
      }),
      glowBlue: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.25,
        metalness: 0.1,
        emissive: new THREE.Color(0x2a8cff),
        emissiveIntensity: 0.9,
      }),
      glowGreen: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.5,
        metalness: 0.0,
        emissive: new THREE.Color(0x66ff55),
        emissiveIntensity: 0.7,
      }),
      glowRed: new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.35,
        metalness: 0.1,
        emissive: new THREE.Color(0xff3322),
        emissiveIntensity: 0.35,
      }),
    };
    // brand labels, stencils and grime come from the shared label atlas (48_art.js)
    const atlas = G.items._art ? G.items._art.texture() : null;
    for (const k in MAT) {
      if (atlas) MAT[k].map = atlas;
      MAT[k].userData.shared = true;
    }
    return MAT;
  }

  // ------------------------------------------------------------------
  // Geometry kit — every primitive is painted & baked, then merged
  // ------------------------------------------------------------------
  // (kit lives in 48_art.js: vertex colour + atlas UVs, merged into one mesh per item kind)
  function kit() {
    return G.items._art.kit();
  }

  // ------------------------------------------------------------------
  // Item shape builders
  // ------------------------------------------------------------------
  const C = {
    glass: 0x9fb8a8,
    glassBrown: 0x5a3414,
    glassGreen: 0x2f5a2c,
    colaDark: 0x1c0d06,
    crownRed: 0xb01410,
    crownGold: 0xc8a030,
    chrome: 0xc9c9c2,
    cream: 0xe8dcc0,
    cryoGrey: 0xd8dcd8,
    cryoOrange: 0xe0701a,
    skin: 0xe8b890,
    paper: 0xd9ceb0,
  };

  /** Bottle profiles. 'fizzo' is the tall, straight-sided ribbed cola bottle (ribs ring the lower half). */
  function bottleProfile(style) {
    switch (style) {
      case "fizzo":
        return [
          [0, 0],
          [0.03, 0],
          [0.032, 0.012],
          [0.03, 0.024],
          [0.032, 0.036],
          [0.03, 0.048],
          [0.032, 0.06],
          [0.03, 0.072],
          [0.032, 0.084],
          [0.031, 0.15],
          [0.026, 0.19],
          [0.013, 0.235],
          [0.013, 0.26],
          [0, 0.26],
        ];
      case "soda":
        return [
          [0, 0],
          [0.032, 0],
          [0.033, 0.12],
          [0.026, 0.15],
          [0.013, 0.19],
          [0.013, 0.215],
          [0, 0.215],
        ];
      case "water":
        return [
          [0, 0],
          [0.036, 0],
          [0.037, 0.17],
          [0.03, 0.2],
          [0.014, 0.225],
          [0.014, 0.25],
          [0, 0.25],
        ];
      case "beer":
        return [
          [0, 0],
          [0.03, 0],
          [0.031, 0.13],
          [0.02, 0.17],
          [0.011, 0.2],
          [0.011, 0.235],
          [0, 0.235],
        ];
      case "wine":
        return [
          [0, 0],
          [0.036, 0],
          [0.037, 0.19],
          [0.03, 0.22],
          [0.012, 0.26],
          [0.012, 0.3],
          [0, 0.3],
        ];
      case "milk":
        return [
          [0, 0],
          [0.04, 0],
          [0.042, 0.1],
          [0.035, 0.15],
          [0.024, 0.18],
          [0.024, 0.2],
          [0, 0.2],
        ];
      case "small":
        return [
          [0, 0],
          [0.018, 0],
          [0.018, 0.06],
          [0.008, 0.075],
          [0.008, 0.09],
          [0, 0.09],
        ];
      default:
        return [
          [0, 0],
          [0.035, 0],
          [0.035, 0.16],
          [0.015, 0.2],
          [0.015, 0.23],
          [0, 0.23],
        ];
    }
  }
  function bottle(k, style, glass, label, cap, liquid, labelCell) {
    const pr = bottleProfile(style);
    k.lathe(pr, glass, 0, 0, 0, 14);
    const top = pr[pr.length - 1][1];
    const r = pr[1][0];
    if (liquid !== undefined) {
      // the filled part of the bottle reads as the liquid colour through the glass
      let rl = 0;
      for (const p of pr) if (p[1] <= top * 0.55) rl = Math.max(rl, p[0]);
      k.cyl(
        rl + 0.0008,
        pr[1][0] + 0.0008,
        top * 0.5,
        liquid,
        0,
        top * 0.25 + 0.001,
        0,
        14,
      );
    }
    if (labelCell)
      k.cylL(
        r + 0.0025,
        r + 0.0025,
        top * 0.3,
        0xffffff,
        labelCell,
        0,
        top * 0.36,
        0,
        16,
      );
    else if (label !== undefined)
      k.cyl(r + 0.0025, r + 0.0025, top * 0.22, label, 0, top * 0.38, 0, 14);
    if (cap !== undefined) {
      const cr = pr[pr.length - 2][0] + 0.003;
      k.cyl(cr, cr, 0.012, cap, 0, top - 0.004, 0, 10);
    }
    return k;
  }
  function syringe(k, barrel, plunger, band, bandCell) {
    // lying flat along X
    k.cyl(0.012, 0.012, 0.13, barrel, 0, 0.013, 0, 10, 0, Math.PI / 2);
    if (bandCell)
      k.cylL(
        0.0135,
        0.0135,
        0.05,
        0xffffff,
        bandCell,
        -0.005,
        0.013,
        0,
        12,
        0,
        Math.PI / 2,
      );
    else
      k.cyl(0.0135, 0.0135, 0.018, band, -0.02, 0.013, 0, 10, 0, Math.PI / 2);
    k.cyl(0.005, 0.005, 0.05, plunger, -0.085, 0.013, 0, 6, 0, Math.PI / 2);
    k.cyl(0.018, 0.018, 0.006, plunger, -0.11, 0.013, 0, 10, 0, Math.PI / 2);
    k.cyl(0.0015, 0.0015, 0.05, C.chrome, 0.09, 0.013, 0, 4, 0, Math.PI / 2);
    k.cyl(0.02, 0.02, 0.008, C.chrome, 0.063, 0.013, 0, 10, 0, Math.PI / 2);
    return k;
  }
  function pillBottle(k, body, lid, label, labelCell) {
    k.cyl(0.022, 0.022, 0.07, body, 0, 0.035, 0, 12);
    if (labelCell)
      k.cylL(0.0235, 0.0235, 0.04, 0xffffff, labelCell, 0, 0.035, 0, 14);
    else k.cyl(0.0235, 0.0235, 0.03, label, 0, 0.035, 0, 12);
    k.cyl(0.024, 0.024, 0.014, lid, 0, 0.077, 0, 12);
    return k;
  }
  function cerealBox(k, w, h, d, body, stripe, accent, artCell) {
    if (artCell) {
      // printed front & back art; the sides and top keep the brand colour
      k.boxL(w, h, d, 0xffffff, artCell, "zZ", 0, h / 2, 0);
      k.box(w + 0.002, h + 0.002, d * 0.97, body, 0, h / 2, 0); // brand-colour sides & top (the printed faces stay visible)
      return k;
    }
    k.box(w, h, d, body, 0, h / 2, 0);
    k.box(w + 0.002, h * 0.22, d + 0.002, stripe, 0, h * 0.78, 0);
    if (accent !== undefined)
      k.sph(Math.min(w, h) * 0.18, accent, 0, h * 0.42, d / 2, 1, 1, 0.15);
    return k;
  }
  function tinCan(k, r, h, body, label, labelCell) {
    k.cyl(r, r, h, body, 0, h / 2, 0, 14);
    if (labelCell)
      k.cylL(
        r + 0.002,
        r + 0.002,
        h * 0.74,
        0xffffff,
        labelCell,
        0,
        h / 2,
        0,
        16,
      );
    else k.cyl(r + 0.002, r + 0.002, h * 0.7, label, 0, h / 2, 0, 14);
    k.torus(r - 0.002, 0.0025, body, 0, h, 0, Math.PI / 2); // rolled rim
    k.torus(r * 0.98, 0.003, body, 0, h, 0, Math.PI / 2);
    return k;
  }
  function foldedCloth(k, color, trim) {
    k.box(0.34, 0.05, 0.26, color, 0, 0.025, 0);
    k.box(0.3, 0.04, 0.22, color, 0.01, 0.07, 0.005, 0.08);
    k.box(
      0.12,
      0.012,
      0.06,
      trim !== undefined ? trim : color,
      -0.02,
      0.095,
      -0.07,
    );
    k.box(
      0.02,
      0.012,
      0.18,
      trim !== undefined ? trim : color,
      0.12,
      0.095,
      0.0,
    );
    return k;
  }
  function helmet(k, shell, visor, extra) {
    k.sph(0.13, shell, 0, 0.1, 0, 1, 0.85, 1.05, 12);
    k.box(0.27, 0.035, 0.28, shell, 0, 0.03, 0);
    if (visor !== undefined) k.box(0.19, 0.06, 0.04, visor, 0, 0.1, 0.12);
    if (extra === "filter") {
      k.cyl(0.03, 0.035, 0.05, 0x333333, 0, 0.05, 0.15, 10, Math.PI / 2);
    }
    if (extra === "crest") k.box(0.02, 0.05, 0.22, shell, 0, 0.21, 0);
    return k;
  }
  function hat(k, crown, band, brimR, crownH, crownR) {
    k.cyl(brimR, brimR, 0.01, crown, 0, 0.005, 0, 18);
    k.cyl(crownR * 0.92, crownR, crownH, crown, 0, crownH / 2 + 0.01, 0, 14);
    k.cyl(crownR + 0.002, crownR + 0.002, 0.02, band, 0, 0.022, 0, 14);
    return k;
  }
  function meat(k, color, fat) {
    k.sph(0.08, color, 0, 0.035, 0, 1.2, 0.45, 0.8, 8);
    k.sph(0.05, fat, 0.05, 0.04, 0.02, 1, 0.45, 0.7, 7);
    k.cyl(0.012, 0.012, 0.08, 0xe0d6c0, -0.1, 0.035, 0, 6, 0, Math.PI / 2);
    return k;
  }
  function crate(k, color, trim, w, h, d) {
    k.boxL(w, h, d, color, "olive", "all", 0, h / 2, 0);
    k.box(w + 0.01, 0.025, d + 0.01, trim, 0, h * 0.2, 0);
    k.box(w + 0.01, 0.025, d + 0.01, trim, 0, h * 0.8, 0);
    return k;
  }

