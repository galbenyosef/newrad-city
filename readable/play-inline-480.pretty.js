/* src/rpg/50_pickups.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — WORLD PICKUPS & ITEM MESHES
 *
 * G.items.spawnPickup(id, count, pos, opts) → pickup
 *   opts: {cond, owner (faction → stealing), yaw, static (bool), dropped, noSave}
 * G.items.createItemModel(id) → Object3D (small procedural mesh; shared geometry)
 * G.items.pickups() / removePickup(p)
 *
 * Every item kind is a single merged, vertex-coloured BufferGeometry
 * (cached per kind) → one draw call per pickup. Pickups are culled by
 * distance (70 m) by this module (no LOD entries leak).
 *
 * Static pickups (spawned during module init, e.g. by props/landmarks)
 * persist across new games; taking one is remembered by a stable key.
 * Dynamic pickups (dropped, spawned after init / at newGame) are saved.
 * ===================================================================== */
(function () {
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

  const BUILDERS = {
    // ---------------- medical & chems ----------------
    rally_tonic: (k) => {
      // Dr. Halloran's Rally Tonic: a brown patent-medicine bottle with sloped shoulders, a cream label wrapped
      // round it, a cork stopper under a red wax seal and a paper tax strip over the top
      const pr = [
        [0, 0],
        [0.026, 0],
        [0.028, 0.006],
        [0.028, 0.105],
        [0.024, 0.12],
        [0.011, 0.14],
        [0.0095, 0.165],
        [0.0115, 0.17],
        [0, 0.17],
      ];
      k.lathe(pr, C.glassBrown, 0, 0, 0, 16);
      k.cylL(0.0298, 0.0298, 0.07, 0xffffff, "tonic", 0, 0.06, 0, 18); // label
      k.cyl(0.0085, 0.0095, 0.02, 0xb08a58, 0, 0.176, 0, 10); // cork
      k.cyl(0.0118, 0.0118, 0.012, 0x9a1a12, 0, 0.17, 0, 10); // red wax seal
      k.box(0.006, 0.05, 0.0245, 0xe8dcb8, 0, 0.152, 0); // paper tax strip over the stopper
      return k;
    },
    rally_tonic_extra: (k) => {
      // Rally Tonic Extra: a square-shouldered flask with a gold foil collar and the black-and-gold label
      k.box(0.05, 0.11, 0.032, C.glassBrown, 0, 0.055, 0);
      k.lathe(
        [
          [0, 0],
          [0.018, 0],
          [0.012, 0.02],
          [0.0095, 0.04],
          [0, 0.04],
        ],
        C.glassBrown,
        0,
        0.11,
        0,
        12,
      );
      k.boxL(0.052, 0.06, 0.034, 0xffffff, "tonic_x", "zZ", 0, 0.058, 0); // label front & back
      k.cyl(0.0125, 0.0125, 0.016, C.crownGold, 0, 0.142, 0, 12); // gold foil collar
      k.cyl(0.0085, 0.0095, 0.014, 0xb08a58, 0, 0.155, 0, 10); // cork
      return k;
    },
    prussian_blue: (k) => {
      // a brown pharmacy bottle of Prussian Blue capsules with a white Civil Defense label, and two blue
      // capsules spilled beside it
      pillBottle(k, 0x6a3a14, 0xf0f0e8, 0xf4f2ea, "prussian");
      k.cyl(
        0.0045,
        0.0045,
        0.014,
        0x123a7a,
        0.04,
        0.0045,
        0.012,
        8,
        0,
        Math.PI / 2,
      );
      k.sph(0.0045, 0x123a7a, 0.033, 0.0045, 0.012, 1, 1, 1, 6);
      k.sph(0.0045, 0x123a7a, 0.047, 0.0045, 0.012, 1, 1, 1, 6);
      k.cyl(
        0.0045,
        0.0045,
        0.014,
        0x1e4a9a,
        0.03,
        0.0045,
        -0.03,
        8,
        0,
        Math.PI / 2,
        0.7,
      );
      return k;
    },
    injector: (k) => {
      // a generic hypodermic injector (fallback for medicines other modules define)
      syringe(k, 0xe8e8e4, 0x303030, 0xc0201c);
      k.cyl(0.007, 0.007, 0.012, 0x1f5a9a, -0.085, 0.026, 0, 8);
      return k;
    },
    syrette: (k) => {
      // collapsible tube with a fold-down needle
      k.cylL(
        0.012,
        0.012,
        0.07,
        0xffffff,
        "syrette",
        0,
        0.012,
        0,
        12,
        0,
        Math.PI / 2,
      );
      k.box(0.03, 0.006, 0.02, 0xb8b8b0, -0.045, 0.008, 0);
      k.cyl(0.0015, 0.0015, 0.04, C.chrome, 0.055, 0.012, 0, 4, 0, Math.PI / 2);
      return k;
    },
    rage_inhaler: (k) => {
      k.cyl(0.02, 0.02, 0.09, 0x1a1a1a, 0, 0.045, 0, 12);
      k.cylL(0.021, 0.021, 0.05, 0xffffff, "rage", 0, 0.05, 0, 14);
      k.cyl(0.022, 0.022, 0.02, 0xc02020, 0, 0.1, 0, 12);
      return k;
    },
    pills_orange: (k) => pillBottle(k, 0xe08a2a, 0xf0f0e8, 0xf6f0dc, "iodine"),
    pills_white: (k) => pillBottle(k, 0xe8e8e0, 0x3a6ab0, 0xdcdcd0, "syrette"),
    pills_bull: (k) => pillBottle(k, 0xe6e0c8, 0xc02a1a, 0x2a2a2a, "bull"),
    focus_tin: (k) => {
      k.boxL(0.09, 0.022, 0.07, 0xffffff, "focus", "y", 0, 0.011, 0);
      k.box(0.092, 0.016, 0.072, 0x1f6aa0, 0, 0.009, 0);
      return k;
    },
    rush_inhaler: (k) => {
      k.cyl(0.025, 0.025, 0.1, 0xb0b8c0, 0, 0.05, 0, 12);
      k.cylL(0.026, 0.026, 0.045, 0xffffff, "rush", 0, 0.058, 0, 14);
      k.cyl(0.012, 0.018, 0.03, 0x303030, 0, 0.115, 0, 10);
      k.cyl(0.004, 0.004, 0.02, C.chrome, 0, 0.14, 0, 6);
      return k;
    },
    overdrive_canister: (k) => {
      k.cyl(0.025, 0.025, 0.1, 0xc0a040, 0, 0.05, 0, 12);
      k.cyl(0.026, 0.026, 0.04, 0x2a2a2a, 0, 0.06, 0, 12);
      k.cyl(0.012, 0.018, 0.03, 0x303030, 0, 0.115, 0, 10);
      return k;
    },
    field_kit: (k) => {
      k.box(0.3, 0.06, 0.16, 0x5a6a3a, 0, 0.03, 0);
      k.cyl(0.03, 0.03, 0.3, 0x4a5a30, 0, 0.06, -0.05, 10, 0, Math.PI / 2);
      k.box(0.31, 0.012, 0.03, 0x2a2a1a, 0, 0.064, 0.03);
      k.boxL(0.07, 0.004, 0.07, 0xffffff, "redcross", "y", 0.08, 0.062, 0.02);
      return k;
    },
    bloodpack: (k) => {
      k.sph(0.07, 0x8a0a0a, 0, 0.016, 0, 1, 0.25, 1.2, 10);
      k.boxL(0.08, 0.004, 0.1, 0xffffff, "bloodpack", "y", 0, 0.034, 0);
      k.cyl(0.005, 0.005, 0.03, 0xd8d0c0, 0, 0.01, -0.095, 6, Math.PI / 2);
      return k;
    },
    powder: (k) => {
      k.sph(0.05, 0x8a6a40, 0, 0.03, 0, 1, 0.7, 1, 8);
      k.cyl(0.02, 0.02, 0.02, 0x6a4a20, 0, 0.065, 0, 6);
      return k;
    },
    shade_field: (k) => {
      k.boxL(0.12, 0.06, 0.08, 0x6a7060, "shade", "y", 0, 0.03, 0);
      k.cyl(0.018, 0.018, 0.012, 0x9ad0ff, 0.03, 0.066, 0, 10);
      k.box(0.16, 0.012, 0.03, 0x2a2a20, 0, 0.02, -0.05);
      return k;
    },
    // ---------------- drinks ----------------
    bottle_fizzo: (k) =>
      bottle(k, "fizzo", 0x6a8070, 0xd8d0c0, C.crownRed, C.colaDark, "fizzo"),
    bottle_fizzo_frost: (k) =>
      bottle(k, "fizzo", 0xb8d8e0, 0xe8e8f0, C.crownRed, 0x2a1008, "fizzo"),
    bottle_fizzo_blue: (k) =>
      bottle(k, "fizzo", 0x6ab8ff, 0xe0f0ff, 0x1a5ad0, 0x40a0ff, "fizzo_blue"),
    bottle_fizzo_lime: (k) =>
      bottle(
        k,
        "fizzo",
        0x7aa060,
        0xe0e8d0,
        C.crownGold,
        0x3a5a10,
        "fizzo_lime",
      ),
    bottle_rootbeer: (k) =>
      bottle(k, "soda", 0x6a3a1a, 0xe8c050, C.crownGold, 0x3a1a08, "rootbeer"),
    bottle_water: (k) =>
      bottle(k, "water", 0xa8c8d8, 0x3a70c0, 0xe0e0e0, 0x8ab0c8, "water"),
    bottle_dirty: (k) =>
      bottle(k, "water", 0x8a9a70, undefined, 0x606060, 0x6a7040),
    bottle_milk: (k) =>
      bottle(k, "milk", 0xe8e8e0, 0xd02020, 0xe0e0e0, undefined, "milk"),
    bottle_milk_empty: (k) => bottle(k, "milk", 0xb0c0b8, undefined, undefined),
    bottle_beer: (k) =>
      bottle(k, "beer", C.glassBrown, 0xe8d8a0, 0xc0a030, undefined, "beer"),
    bottle_whiskey: (k) => {
      k.box(0.075, 0.16, 0.045, 0x6a3a10, 0, 0.08, 0);
      k.boxL(0.077, 0.07, 0.047, 0xffffff, "whiskey", "zZ", 0, 0.09, 0);
      k.cyl(0.013, 0.02, 0.06, 0x6a3a10, 0, 0.19, 0, 8);
      k.cyl(0.015, 0.015, 0.02, 0x2a1a0a, 0, 0.225, 0, 8);
      return k;
    },
    bottle_scotch: (k) => {
      k.box(0.075, 0.15, 0.075, 0x8a5a20, 0, 0.075, 0);
      k.box(0.077, 0.05, 0.077, 0x1a1a1a, 0, 0.08, 0);
      k.cyl(0.013, 0.02, 0.06, 0x8a5a20, 0, 0.18, 0, 8);
      k.cyl(0.016, 0.016, 0.02, 0xc0a040, 0, 0.215, 0, 8);
      return k;
    },
    bottle_vodka: (k) =>
      bottle(k, "wine", 0xd8e8e8, 0xc02020, 0xe0e0e0, undefined, "vodka"),
    bottle_wine: (k) =>
      bottle(k, "wine", C.glassGreen, 0xe8e0c8, 0x6a0a14, undefined, "wine"),
    bottle_empty: (k) => bottle(k, "fizzo", 0x7a8a7a),
    bottle_small: (k) => bottle(k, "small", 0xe0e0e0, 0xd0a020, 0xd02020),
    // ---------------- food ----------------
    bag_jerky: (k) => {
      // Golden Plain: an upright kraft-paper bag, printed front & back, oxblood crimped header, a little puffed out
      k.sph(0.055, 0xc89a5a, 0, 0.078, 0, 1.05, 1.4, 0.32, 10);
      k.boxL(0.115, 0.15, 0.03, 0xffffff, "jerky", "zZ", 0, 0.075, 0);
      k.box(0.12, 0.022, 0.012, 0x7a2a12, 0, 0.161, 0);
      return k;
    },
    box_flakes: (k) =>
      cerealBox(k, 0.17, 0.25, 0.06, 0x1e3a8a, 0xc8201a, 0xffffff, "flakes"),
    wrap_zeppelin: (k) => {
      // Chocolate Zeppelin: an airship-shaped cake in silver foil, tail fins crimped from the wrapper, printed seal on top
      k.sph(0.04, 0xc8ced4, 0, 0.034, 0, 1.75, 0.82, 0.95, 12);
      k.box(0.03, 0.04, 0.004, 0xb8c0c6, -0.072, 0.034, 0);
      k.box(0.03, 0.004, 0.04, 0xb8c0c6, -0.072, 0.034, 0);
      k.boxL(0.07, 0.003, 0.045, 0xffffff, "zeppelin", "y", 0.005, 0.066, 0);
      return k;
    },
    can_marinara: (k) => tinCan(k, 0.042, 0.1, 0xb0b0a8, 0xc8281e, "marinara"),
    wrap_frank: (k) => {
      // Frank-in-a-Bun: bun, frank and mustard sealed in a clear sleeve (crimped ends) with the round Forever Franks sticker
      k.sph(0.04, 0xe0b070, 0, 0.022, 0, 1.9, 0.55, 0.72, 10);
      k.cyl(0.0165, 0.0165, 0.17, 0xa8402a, 0, 0.036, 0, 10, 0, Math.PI / 2);
      for (let i = 0; i < 5; i++)
        k.box(
          0.026,
          0.004,
          0.006,
          0xf4c21e,
          -0.052 + i * 0.026,
          0.053,
          i % 2 ? 0.004 : -0.004,
          i % 2 ? 0.5 : -0.5,
        );
      for (const sd of [-1, 1])
        k.box(0.018, 0.05, 0.075, 0xdfe8ee, sd * 0.098, 0.03, 0);
      for (const sd of [-1, 1])
        k.box(0.18, 0.003, 0.003, 0xf2f8fb, 0, 0.06, sd * 0.032);
      k.boxL(
        0.042,
        0.003,
        0.042,
        0xffffff,
        "frankbun",
        "y",
        0.035,
        0.058,
        0.012,
      );
      return k;
    },
    pouch_astro: (k) => {
      // Astronaut Ice Cream: flat foil pouch standing on its gusset, crimped seals top and bottom
      k.boxL(0.11, 0.15, 0.022, 0xffffff, "astro", "zZ", 0, 0.08, 0);
      k.box(0.116, 0.014, 0.012, 0xd8dde2, 0, 0.158, 0);
      k.box(0.116, 0.01, 0.026, 0xb8c0c6, 0, 0.005, 0);
      return k;
    },
    can_homeguard: (k) => {
      // Homeguard: a tall cardboard cleanser canister with a perforated shaker lid
      tinCan(k, 0.036, 0.16, 0xd8d8d0, 0x1e3a6a, "homeguard");
      k.cyl(0.037, 0.037, 0.008, 0xc8c8c0, 0, 0.164, 0, 14);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        k.cyl(
          0.003,
          0.003,
          0.002,
          0x3a3a3a,
          Math.cos(a) * 0.018,
          0.169,
          Math.sin(a) * 0.018,
          6,
        );
      }
      return k;
    },
    box_tvdinner: (k) => {
      k.box(0.24, 0.035, 0.17, 0x8a2a2a, 0, 0.0175, 0);
      k.box(0.2, 0.004, 0.13, 0xe8d8b0, 0, 0.037, 0);
      return k;
    },
    bag_crisps: (k) => {
      k.sph(0.08, 0xe0b020, 0, 0.04, 0, 1, 0.45, 1.3, 8);
      k.box(0.12, 0.01, 0.02, 0xc02020, 0, 0.04, -0.1);
      return k;
    },
    bag_small: (k) => {
      k.sph(0.035, 0xe8d0e0, 0, 0.02, 0, 1, 0.6, 1.2, 8);
      k.box(0.04, 0.005, 0.01, 0x2a2a2a, 0, 0.025, -0.045);
      return k;
    },
    can_beans: (k) => tinCan(k, 0.038, 0.1, 0xb0b0a8, 0xc85a2a, "beans"),
    can_dog: (k) => tinCan(k, 0.04, 0.07, 0xa0a098, 0x3a6a3a, "dogfood"),
    can_chowder: (k) => tinCan(k, 0.04, 0.1, 0xb0b0a8, 0xc02a2a, "chowder"),
    can_empty: (k) => tinCan(k, 0.036, 0.09, 0x9a948a, 0x7a6a5a),
    can_paint: (k) => tinCan(k, 0.07, 0.12, 0x9a9a90, 0xd0c080, "paint"),
    noodle_cup: (k) => {
      k.cylL(0.05, 0.038, 0.09, 0xffffff, "noodle", 0, 0.045, 0, 16);
      k.cyl(0.052, 0.052, 0.005, 0xd02a2a, 0, 0.09, 0, 14);
      return k;
    },
    sweet_roll: (k) => {
      k.cyl(0.06, 0.065, 0.045, 0xc88a40, 0, 0.0225, 0, 14);
      k.cyl(0.058, 0.06, 0.012, 0xf4ecd8, 0, 0.05, 0, 14);
      return k;
    },
    pretzel: (k) => {
      k.torus(0.04, 0.012, 0x8a4a1a, -0.02, 0.012, 0, Math.PI / 2);
      k.torus(0.04, 0.012, 0x8a4a1a, 0.02, 0.012, 0, Math.PI / 2);
      return k;
    },
    bagel: (k) => k.torus(0.045, 0.022, 0xc08040, 0, 0.022, 0, Math.PI / 2),
    hot_dog: (k) => {
      k.cyl(0.02, 0.02, 0.15, 0xa0402a, 0, 0.03, 0, 8, 0, Math.PI / 2);
      k.box(0.14, 0.025, 0.05, 0xe0b070, 0, 0.0125, 0);
      return k;
    },
    meat: (k, d) => meat(k, (d && d.meatColor) || 0xa0402a, 0xe8c8b0),
    meat_stick: (k) => {
      k.cyl(0.004, 0.004, 0.3, 0x8a6a40, 0, 0.012, 0, 5, 0, Math.PI / 2);
      k.sph(0.035, 0x6a3a1a, 0.04, 0.02, 0, 1.8, 0.8, 0.9, 8);
      return k;
    },
    steak: (k) => {
      k.sph(0.09, 0x6a2a14, 0, 0.02, 0, 1.2, 0.25, 0.9, 10);
      k.sph(0.04, 0xe0c0a0, 0.06, 0.025, 0.03, 1, 0.25, 0.8, 7);
      return k;
    },
    cakes: (k) => {
      k.cyl(0.05, 0.05, 0.025, 0xc08a40, -0.03, 0.0125, 0, 12);
      k.cyl(0.05, 0.05, 0.025, 0xb87a30, 0.04, 0.0125, 0.02, 12);
      k.cyl(0.045, 0.045, 0.025, 0xc89050, 0.01, 0.037, 0.01, 12);
      return k;
    },
    fungus: (k) => {
      k.cyl(0.008, 0.01, 0.04, 0xd8d0c0, 0, 0.02, 0, 6);
      k.sph(0.03, 0x8a8078, 0, 0.045, 0, 1, 0.6, 1, 8);
      k.cyl(0.006, 0.008, 0.03, 0xd8d0c0, 0.03, 0.015, 0.01, 6);
      k.sph(0.02, 0x8a8078, 0.03, 0.033, 0.01, 1, 0.6, 1, 7);
      return k;
    },
    fungus_glow: (k) => {
      k.cyl(0.008, 0.01, 0.04, 0xc8e8b0, 0, 0.02, 0, 6);
      k.sph(0.03, 0x80ff70, 0, 0.045, 0, 1, 0.6, 1, 8);
      k.sph(0.02, 0x80ff70, 0.03, 0.03, 0.01, 1, 0.6, 1, 7);
      return k;
    },
    gnarlberry: (k) => {
      k.sph(0.045, 0x6a2a7a, 0, 0.045, 0, 1, 1.1, 1, 10);
      k.sph(0.02, 0x8a4aa0, 0.02, 0.07, 0.01, 1, 1, 1, 6);
      k.cyl(0.003, 0.003, 0.02, 0x3a5a2a, 0, 0.1, 0, 4);
      return k;
    },
    // ---------------- apparel ----------------
    goggles: (k) => {
      // VIGIL field goggles: two smoked lenses in rubber cups, a bridge housing with a tiny display, a strap loop
      for (const x of [-0.04, 0.04]) {
        k.cyl(0.028, 0.03, 0.03, 0x2a2a2a, x, 0.03, 0, 12, Math.PI / 2);
        k.cyl(0.022, 0.022, 0.032, 0x3a5a6a, x, 0.03, 0.002, 12, Math.PI / 2);
      }
      k.boxL(0.04, 0.02, 0.025, 0xffffff, "goggles", "z", 0, 0.035, 0.004);
      k.torus(0.07, 0.006, 0x3a3a34, 0, 0.006, -0.03, Math.PI / 2);
      return k;
    },
    cloth_cryo: (k) => foldedCloth(k, C.cryoGrey, C.cryoOrange),
    cloth_white: (k) => foldedCloth(k, 0xe8e8e0, 0xa0a0a0),
    cloth_black: (k) => foldedCloth(k, 0x2a2a2e, 0x6a6a6a),
    cloth_red: (k) => foldedCloth(k, 0x7a1a14, 0xd0b040),
    cloth_green: (k) => foldedCloth(k, 0x4a6a2a, 0xa0d040),
    cloth_yellow: (k) => foldedCloth(k, 0xd8b020, 0x2a2a2a),
    cloth_orange: (k) => foldedCloth(k, 0xd07020, 0x2a2a2a),
    cloth_grey: (k) => foldedCloth(k, 0x6a6a68, 0x3a3a3a),
    cloth_olive: (k) => foldedCloth(k, 0x5a603a, 0x3a3a2a),
    cloth_brown: (k) => foldedCloth(k, 0x6a4a2a, 0x3a2a1a),
    cloth_blue: (k) => foldedCloth(k, 0x3a5070, 0xd8d8d0),
    cloth_floral: (k) => foldedCloth(k, 0xd890a0, 0xf0e0a0),
    cloth_sequin: (k) => foldedCloth(k, 0xd0a030, 0xff60a0),
    armor_guard: (k) => {
      foldedCloth(k, C.cryoGrey, C.cryoOrange);
      k.box(0.26, 0.05, 0.2, 0x4a4e52, 0, 0.12, 0);
      return k;
    },
    armor_leather: (k) => {
      k.box(0.32, 0.07, 0.26, 0x5a3a1e, 0, 0.035, 0);
      k.box(0.12, 0.05, 0.1, 0x4a2e16, -0.1, 0.09, -0.06);
      k.box(0.12, 0.05, 0.1, 0x4a2e16, 0.1, 0.09, -0.06);
      k.box(0.3, 0.012, 0.03, 0x2a1a0a, 0, 0.075, 0.07);
      return k;
    },
    armor_metal: (k) => {
      k.box(0.34, 0.08, 0.26, 0x6a6660, 0, 0.04, 0);
      k.box(0.14, 0.05, 0.12, 0x7a7670, -0.11, 0.1, -0.05, 0.2);
      k.box(0.14, 0.05, 0.12, 0x7a7670, 0.11, 0.1, -0.05, -0.2);
      k.cyl(0.03, 0.03, 0.01, 0x8a8a80, 0, 0.085, 0.06, 10);
      return k;
    },
    armor_combat: (k) => {
      k.box(0.34, 0.08, 0.26, 0x3a3e34, 0, 0.04, 0);
      k.box(0.28, 0.04, 0.2, 0x4a4e40, 0, 0.1, 0);
      k.box(0.1, 0.04, 0.08, 0x2a2e26, -0.12, 0.13, -0.06);
      k.box(0.1, 0.04, 0.08, 0x2a2e26, 0.12, 0.13, -0.06);
      return k;
    },
    armor_stealth: (k) => {
      k.box(0.32, 0.06, 0.24, 0x4a1414, 0, 0.03, 0);
      k.box(0.26, 0.04, 0.18, 0x6a2020, 0, 0.08, 0);
      k.box(0.04, 0.02, 0.04, 0x40ff80, 0.08, 0.11, 0.04);
      return k;
    },
    armor_raider: (k) => {
      k.box(0.32, 0.06, 0.26, 0x4a3420, 0, 0.03, 0);
      k.box(0.14, 0.06, 0.12, 0x5a5a58, -0.1, 0.09, -0.05, 0.3);
      k.cone(0.015, 0.06, 0x8a8a80, -0.1, 0.15, -0.05);
      k.cone(0.015, 0.06, 0x8a8a80, 0.02, 0.1, 0.05);
      k.box(0.3, 0.015, 0.04, 0x2a2a2a, 0, 0.065, 0.06);
      return k;
    },
    crate_rig: (k) => {
      crate(k, 0x5a5e4a, 0x3a3c30, 0.7, 0.55, 0.45);
      k.box(0.4, 0.12, 0.01, 0xd8c040, 0, 0.3, 0.228);
      k.box(0.3, 0.2, 0.26, 0x6a6e5a, 0, 0.66, 0);
      return k;
    },
    helmet_guard: (k) => helmet(k, 0xe8e8e0, 0x2a2a34),
    helmet_metal: (k) => helmet(k, 0x6a6660, 0x1a1a1a, "crest"),
    helmet_combat: (k) => helmet(k, 0x3a3e34, 0x1a1a18),
    helmet_riot: (k) => helmet(k, 0x1e1e22, 0x6a8090),
    helmet_gasmask: (k) => helmet(k, 0x4a3a2a, 0x1a1a1a, "filter"),
    helmet_rig: (k) => rigHelmet(k, 0x5a5e4a, 0x3a3c32, 0x1a1a1a),
    helmet_continuity: (k) => {
      rigHelmet(k, 0x4a5236, 0x2e3424, 0xd8f0e0);
      k.box(0.06, 0.04, 0.02, 0x1a1a1a, 0, 0.06, 0.15);
      return k;
    },
    helmet_hazmat: (k) => {
      k.sph(0.13, 0xd8b020, 0, 0.11, 0, 1, 1, 1, 12);
      k.box(0.16, 0.08, 0.03, 0x90a8a0, 0, 0.11, 0.12);
      return k;
    },
    helmet_army: (k) => helmet(k, 0x4a5030),
    helmet_moto: (k) => {
      helmet(k, 0xc02a1a);
      k.box(0.02, 0.1, 0.2, 0xf0c020, 0.1, 0.12, 0);
      return k;
    },
    hat_officer: (k) => {
      k.cyl(0.11, 0.1, 0.07, 0x2a2a30, 0, 0.05, 0, 14);
      k.box(0.2, 0.01, 0.08, 0x1a1a1a, 0, 0.012, 0.08);
      k.box(0.04, 0.03, 0.01, 0xd0b040, 0, 0.06, 0.1);
      return k;
    },
    hat_fedora: (k) => hat(k, 0x5a4a3a, 0x1a1a1a, 0.15, 0.1, 0.09),
    hat_cap: (k) => {
      k.sph(0.09, 0x3a4a6a, 0, 0.01, 0, 1, 0.7, 1, 10);
      k.box(0.12, 0.008, 0.1, 0x3a4a6a, 0, 0.012, 0.1);
      return k;
    },
    hat_cowboy: (k) => hat(k, 0x8a6a40, 0x3a2a1a, 0.2, 0.11, 0.09),
    hat_top: (k) => hat(k, 0x1a1a1c, 0x5a1a1a, 0.15, 0.18, 0.085),
    hat_bowler: (k) => {
      k.cyl(0.13, 0.13, 0.01, 0x1a1a1a, 0, 0.005, 0, 16);
      k.sph(0.09, 0x1a1a1a, 0, 0.01, 0, 1, 0.9, 1, 12);
      return k;
    },
    hat_crown: (k) => {
      k.cyl(0.1, 0.1, 0.05, 0x5a9a7a, 0, 0.025, 0, 14);
      for (let i = 0; i < 7; i++) {
        const a = -0.9 + i * 0.3;
        k.cone(
          0.012,
          0.12,
          0x5a9a7a,
          Math.sin(a) * 0.1,
          0.1,
          Math.cos(a) * 0.1,
          6,
          Math.cos(a) * 0.6,
          -Math.sin(a) * 0.6,
        );
      }
      return k;
    },
    hat_hard: (k) => {
      helmet(k, 0xe8c020);
      return k;
    },
    glasses: (k) => {
      k.cyl(0.025, 0.025, 0.006, 0x1a1a1a, -0.03, 0.01, 0, 12, Math.PI / 2);
      k.cyl(0.025, 0.025, 0.006, 0x1a1a1a, 0.03, 0.01, 0, 12, Math.PI / 2);
      k.box(0.02, 0.004, 0.004, 0x3a3a3a, 0, 0.02, 0);
      k.box(0.004, 0.004, 0.11, 0x3a3a3a, -0.055, 0.015, -0.055);
      k.box(0.004, 0.004, 0.11, 0x3a3a3a, 0.055, 0.015, -0.055);
      return k;
    },
    gas_mask: (k) => {
      k.sph(0.08, 0x3a3a34, 0, 0.05, 0, 1, 1.1, 0.7, 10);
      k.cyl(0.028, 0.028, 0.02, 0x9ab0a0, -0.03, 0.07, 0.05, 10, Math.PI / 2);
      k.cyl(0.028, 0.028, 0.02, 0x9ab0a0, 0.03, 0.07, 0.05, 10, Math.PI / 2);
      k.cyl(0.03, 0.035, 0.05, 0x2a2a2a, 0, 0.02, 0.07, 10, Math.PI / 2);
      return k;
    },
    bandana: (k) => {
      k.box(0.2, 0.01, 0.2, 0xb02020, 0, 0.005, 0, 0.785);
      return k;
    },
    mask_hockey: (k) => {
      k.sph(0.09, 0xe8e8e0, 0, 0.03, 0, 0.9, 0.35, 1.2, 10);
      k.box(0.02, 0.01, 0.01, 0xc02020, -0.03, 0.06, 0.03);
      k.box(0.02, 0.01, 0.01, 0xc02020, 0.03, 0.06, 0.03);
      return k;
    },
    // ---------------- misc & junk ----------------
    scrip: (k) => {
      // a little stack of folded paper ration notes, the top one with its printed face up
      for (let i = 0; i < 6; i++) {
        const a = i * 0.7,
          x = Math.cos(a) * 0.006 * i,
          z = Math.sin(a) * 0.005 * i;
        k.box(0.09, 0.003, 0.05, 0xc8ccb4, x, 0.0016 + i * 0.0032, z, a * 0.3);
      }
      k.boxL(
        0.09,
        0.002,
        0.05,
        0xffffff,
        "scrip_note",
        "y",
        0.004,
        0.021,
        0.002,
        0.15,
      );
      k.box(0.04, 0.004, 0.052, 0xb8bca4, -0.025, 0.024, 0.0, 0.15, 0, 0.25); // folded flap
      return k;
    },
    money: (k) => {
      k.box(0.15, 0.02, 0.065, 0x7a9a6a, 0, 0.01, 0);
      k.box(0.02, 0.022, 0.067, 0xe8e0c0, 0, 0.01, 0);
      return k;
    },
    gold_bar: (k) => {
      k.box(0.16, 0.045, 0.07, 0xd8a820, 0, 0.0225, 0);
      k.box(0.13, 0.01, 0.05, 0xe8c040, 0, 0.05, 0);
      return k;
    },
    battery: (k) => {
      k.cyl(0.04, 0.04, 0.12, 0x3a3a3a, 0, 0.06, 0, 12);
      k.cylL(0.041, 0.041, 0.06, 0xffffff, "drycell", 0, 0.06, 0, 14);
      k.cyl(0.015, 0.015, 0.015, C.chrome, 0, 0.125, 0, 8);
      return k;
    },
    electronics: (k) => {
      k.box(0.14, 0.012, 0.1, 0x2a6a3a, 0, 0.006, 0);
      k.box(0.03, 0.02, 0.03, 0x1a1a1a, -0.03, 0.02, 0.01);
      k.cyl(0.01, 0.01, 0.03, 0x3060c0, 0.03, 0.025, -0.02, 8);
      k.box(0.05, 0.01, 0.01, 0xc08040, 0.02, 0.018, 0.03);
      return k;
    },
    tube: (k) => {
      k.cyl(0.018, 0.018, 0.012, 0x2a2a2a, 0, 0.006, 0, 10);
      k.lathe(
        [
          [0, 0],
          [0.016, 0],
          [0.016, 0.05],
          [0.01, 0.07],
          [0, 0.075],
        ],
        0xb8c8c0,
        0,
        0.012,
        0,
        10,
      );
      return k;
    },
    junk_metal: (k) => {
      k.box(0.1, 0.03, 0.06, 0x7a7870, 0, 0.015, 0);
      k.cyl(0.015, 0.015, 0.05, 0x5a5a58, 0.03, 0.04, 0, 8);
      return k;
    },
    junk_rubber: (k) =>
      k.torus(0.05, 0.008, 0xc09060, 0, 0.008, 0, Math.PI / 2),
    junk_wood: (k) =>
      k.cyl(0.004, 0.004, 0.18, 0xe0b020, 0, 0.004, 0, 6, 0, Math.PI / 2),
    scrap: (k) => {
      k.box(0.18, 0.012, 0.08, 0x6a5a4a, 0, 0.006, 0, 0.3);
      k.box(0.12, 0.012, 0.07, 0x7a6a58, 0.02, 0.018, 0.03, -0.4, 0.1);
      k.cyl(0.01, 0.01, 0.16, 0x5a4a3a, -0.02, 0.03, 0, 6, 0, Math.PI / 2);
      return k;
    },
    tape: (k) => k.torus(0.035, 0.014, 0x8a8a88, 0, 0.014, 0, Math.PI / 2),
    mug: (k) => {
      k.cyl(0.035, 0.032, 0.09, 0xe8e0d0, 0, 0.045, 0, 12);
      k.torus(0.022, 0.006, 0xe8e0d0, 0.04, 0.045, 0, 0, 0);
      k.cyl(0.036, 0.036, 0.02, 0xc02030, 0, 0.06, 0, 12);
      return k;
    },
    plate: (k) => k.cyl(0.1, 0.07, 0.015, 0x9ad0a8, 0, 0.0075, 0, 18),
    pan: (k) => {
      k.cyl(0.12, 0.1, 0.035, 0x2a2a2a, 0, 0.0175, 0, 16);
      k.box(0.16, 0.015, 0.03, 0x2a2a2a, 0.2, 0.03, 0);
      return k;
    },
    clipboard: (k) => {
      k.box(0.23, 0.008, 0.3, 0x8a6a40, 0, 0.004, 0);
      k.box(0.2, 0.004, 0.26, C.paper, 0, 0.01, 0.01);
      k.box(0.08, 0.015, 0.03, C.chrome, 0, 0.012, -0.13);
      return k;
    },
    cig_pack: (k) => {
      k.box(0.055, 0.085, 0.022, 0xe8e0d0, 0, 0.0425, 0);
      k.box(0.057, 0.03, 0.024, 0xc02020, 0, 0.06, 0);
      return k;
    },
    cig_carton: (k) => {
      k.box(0.25, 0.05, 0.09, 0xe8e0d0, 0, 0.025, 0);
      k.box(0.252, 0.02, 0.092, 0xc02020, 0, 0.035, 0);
      return k;
    },
    toy_car: (k) => {
      k.box(0.12, 0.03, 0.05, 0x3a8ac0, 0, 0.025, 0);
      k.sph(0.035, 0x3a8ac0, 0, 0.04, 0, 1.2, 0.6, 0.7, 8);
      for (const x of [-0.04, 0.04])
        for (const z of [-0.027, 0.027])
          k.cyl(0.012, 0.012, 0.008, 0x1a1a1a, x, 0.012, z, 8, Math.PI / 2);
      return k;
    },
    teddy: (k) => {
      k.sph(0.07, 0x8a5a30, 0, 0.07, 0, 1, 1.1, 0.9, 10);
      k.sph(0.05, 0x8a5a30, 0, 0.17, 0, 1, 1, 1, 10);
      k.sph(0.018, 0x8a5a30, -0.04, 0.21, 0, 1, 1, 0.6, 6);
      k.sph(0.018, 0x8a5a30, 0.04, 0.21, 0, 1, 1, 0.6, 6);
      k.sph(0.02, 0xc09060, 0, 0.16, 0.045, 1, 0.8, 0.8, 6);
      k.sph(0.025, 0x8a5a30, -0.05, 0.02, 0.04, 1, 1, 1, 6);
      k.sph(0.025, 0x8a5a30, 0.05, 0.02, 0.04, 1, 1, 1, 6);
      return k;
    },
    lunchbox: (k) => {
      k.boxL(0.2, 0.14, 0.09, 0xffffff, "sb_super_sergeant", "zZ", 0, 0.07, 0);
      k.box(0.21, 0.015, 0.095, 0xd8b040, 0, 0.14, 0);
      k.torus(0.03, 0.006, 0x3a3a3a, 0, 0.16, 0);
      return k;
    },
    ball: (k, d) =>
      k.sph(
        0.037,
        d && d.id === "pool_ball" ? 0x1a1a1a : 0xe8e0d0,
        0,
        0.037,
        0,
        1,
        1,
        1,
        10,
      ),
    statuette: (k) => {
      k.box(0.05, 0.03, 0.05, 0x3a6a5a, 0, 0.015, 0);
      k.cyl(0.015, 0.025, 0.12, 0x5a9a7a, 0, 0.09, 0, 8);
      k.sph(0.015, 0x5a9a7a, 0, 0.16, 0, 1, 1, 1, 6);
      k.cyl(0.004, 0.004, 0.06, 0x5a9a7a, 0.02, 0.17, 0, 5, 0, -0.3);
      return k;
    },
    globe: (k) => {
      k.cyl(0.05, 0.055, 0.03, 0x2a2a2a, 0, 0.015, 0, 12);
      k.sph(0.05, 0xc8e0e8, 0, 0.075, 0, 1, 1, 1, 12);
      k.box(0.03, 0.04, 0.03, 0x6a6a6a, 0, 0.06, 0);
      return k;
    },
    paper: (k) =>
      k.boxL(0.2, 0.003, 0.28, 0xffffff, "paper", "y", 0, 0.002, 0, 0.2),
    note: (k) => {
      k.boxL(0.2, 0.003, 0.28, 0xf0ece0, "paper", "y", 0, 0.002, 0, 0.2);
      k.boxL(0.18, 0.003, 0.26, 0xffffff, "note", "y", 0.02, 0.005, 0.01, -0.1);
      return k;
    },
    tape_reel: (k) => {
      // open-reel audio tape: a flanged metal spool with brown tape wound on it, and a paper label
      k.cyl(0.06, 0.06, 0.003, 0x9a9a92, 0, 0.0015, 0, 18);
      k.cyl(0.06, 0.06, 0.003, 0x9a9a92, 0, 0.0185, 0, 18);
      k.cyl(0.045, 0.045, 0.014, 0x4a2a14, 0, 0.01, 0, 18);
      k.cyl(0.012, 0.012, 0.016, 0x2a2a2a, 0, 0.01, 0, 10);
      k.boxL(0.05, 0.002, 0.024, 0xffffff, "reel", "y", 0, 0.0205, 0.02);
      return k;
    },
    book: (k) => {
      k.boxL(0.16, 0.035, 0.22, 0xffffff, "book", "y", 0, 0.0175, 0);
      k.box(0.15, 0.03, 0.212, 0xe0d4b0, 0.006, 0.0175, 0);
      return k;
    },
    book_skill: (k) => {
      k.boxL(0.17, 0.03, 0.24, 0x8aa8ff, "book", "y", 0, 0.015, 0);
      k.box(0.16, 0.026, 0.232, 0xe8dcc0, 0.006, 0.015, 0);
      k.box(0.1, 0.004, 0.06, 0xe0b020, -0.02, 0.031, 0.04);
      return k;
    },
    tag: (k) => {
      k.box(0.05, 0.003, 0.03, C.chrome, 0, 0.002, 0);
      k.torus(0.03, 0.002, C.chrome, 0.02, 0.003, -0.02, Math.PI / 2);
      return k;
    },
    key: (k) => {
      k.torus(0.018, 0.005, 0xc0a040, -0.05, 0.005, 0, Math.PI / 2);
      k.box(0.07, 0.006, 0.01, 0xc0a040, 0.005, 0.005, 0);
      k.box(0.012, 0.006, 0.015, 0xc0a040, 0.03, 0.005, 0.01);
      return k;
    },
    medallion: (k) => {
      // bronze souvenir medallion in an open velvet-lined presentation case
      k.box(0.11, 0.018, 0.11, 0x3a1a20, 0, 0.009, 0);
      k.box(0.1, 0.004, 0.1, 0x6a1a2a, 0, 0.019, 0);
      k.box(0.11, 0.09, 0.012, 0x3a1a20, 0, 0.05, -0.055, -0.25);
      k.cyl(0.038, 0.038, 0.008, 0xb07a30, 0, 0.024, 0, 18);
      k.discL(0.036, 0xffffff, "medallion", 0, 0.0285, 0);
      return k;
    },
    ammo: (k, d) => {
      const col = new THREE.Color()
        .setHSL((U.hashStr((d && d.id) || "ammo") % 360) / 360, 0.35, 0.35)
        .getHex();
      k.boxL(0.12, 0.06, 0.08, 0x6a6a52, "olive", "all", 0, 0.03, 0);
      k.box(0.122, 0.02, 0.082, col, 0, 0.035, 0);
      k.box(0.05, 0.004, 0.03, 0xe0d8b0, 0, 0.061, 0);
      for (let i = 0; i < 4; i++)
        k.cyl(
          0.005,
          0.005,
          0.03,
          0xc0a040,
          0.08 + (i % 2) * 0.012,
          0.005,
          -0.02 + i * 0.012,
          6,
          0,
          Math.PI / 2,
        );
      return k;
    },
    weapon: (k) => {
      k.box(0.35, 0.05, 0.04, 0x3a3a38, 0, 0.03, 0);
      k.box(0.07, 0.1, 0.035, 0x5a3a20, -0.1, 0.02, 0, 0, 0, 0.4);
      k.cyl(0.012, 0.012, 0.25, 0x2a2a2a, 0.25, 0.04, 0, 8, 0, Math.PI / 2);
      return k;
    },
    misc: (k) => {
      k.box(0.1, 0.06, 0.08, 0x7a6a50, 0, 0.03, 0);
      k.box(0.06, 0.02, 0.05, 0x5a5048, 0.01, 0.07, 0);
      return k;
    },
  };
  // ------------------------------------------------------------------
  // Apparel on the ground: garments are laid out like a collapsed outfit
  // (collar toward −Z, legs toward +Z, ≈0.6 × 0.8 m), body armor adds its
  // plates on top, and an exo-rig is an upright torso shell (≈0.65 m).
  // ------------------------------------------------------------------
  function shade(hex, f) {
    const c = new THREE.Color(hex);
    c.multiplyScalar(f);
    return c.getHex();
  }
  /** style: 'coverall' | 'suit' | 'robe' | 'dress' | 'coat' | 'rags' | 'hazmat' */
  function garment(k, color, trim, style) {
    const T = 0.03,
      dk = shade(color, 0.78);
    const puffy = style === "hazmat" ? 1.25 : 1;
    // torso panel + chest wrinkle
    k.box(0.34 * puffy, T * puffy, 0.36, color, 0, (T * puffy) / 2, -0.08);
    k.sph(0.12, dk, -0.06, T * 0.6, -0.12, 1.1, 0.12, 0.8, 8);
    // collar & shoulders
    k.box(0.15, T + 0.012, 0.05, trim, 0, T / 2 + 0.006, -0.27);
    // sleeves splayed outward, with cuffs
    for (const sx of [-1, 1]) {
      k.box(
        0.09 * puffy,
        T * 0.9 * puffy,
        0.3,
        color,
        sx * 0.235,
        T * 0.45 * puffy,
        -0.1,
        sx * 0.55,
      );
      k.box(
        0.095 * puffy,
        T * puffy + 0.004,
        0.035,
        style === "suit" ? 0xe8e4dc : trim,
        sx * 0.315,
        T * 0.5 * puffy + 0.002,
        0.03,
        sx * 0.55,
      );
    }
    // lower half
    if (style === "robe" || style === "coat") {
      k.box(0.38, T, 0.4, color, 0, T / 2, 0.29);
      k.box(0.012, T + 0.004, 0.72, trim, 0, T / 2 + 0.002, 0.1); // front seam / buttons
      k.sph(0.1, dk, 0.08, T * 0.6, 0.35, 1.3, 0.12, 0.9, 8);
    } else if (style === "dress") {
      k.sph(0.5, color, 0, T * 0.6, 0.3, 0.44, 0.07, 0.42, 12); // flared skirt lying flat
      k.sph(0.5, dk, 0.04, T * 0.9, 0.34, 0.2, 0.05, 0.3, 8); // fold
      k.box(0.3, T + 0.006, 0.03, trim, 0, T / 2 + 0.004, 0.1);
    } else {
      // two trouser legs, slightly apart; boots/cuffs at the ends
      for (const sx of [-1, 1]) {
        k.box(
          0.14 * puffy,
          T * puffy,
          0.44,
          style === "suit" ? dk : color,
          sx * 0.085,
          (T * puffy) / 2,
          0.32,
          sx * 0.05,
        );
        k.box(
          0.145 * puffy,
          T * puffy + 0.01,
          0.07,
          style === "coverall" || style === "hazmat"
            ? 0x2a2a2a
            : shade(color, 0.6),
          sx * 0.095,
          (T * puffy) / 2 + 0.006,
          0.52,
          sx * 0.05,
        );
      }
      k.box(
        0.35 * puffy,
        T * puffy + 0.008,
        0.04,
        style === "coverall" ? trim : 0x2a2018,
        0,
        (T * puffy) / 2 + 0.004,
        0.1,
      ); // belt
    }
    if (style === "coverall" || style === "hazmat")
      k.box(
        0.02,
        T * puffy + 0.006,
        0.34,
        trim,
        0,
        (T * puffy) / 2 + 0.003,
        -0.08,
      ); // zip stripe
    if (style === "suit") {
      k.box(0.05, T + 0.008, 0.2, 0xe8e4dc, 0, T / 2 + 0.004, -0.16);
      k.box(0.02, T + 0.012, 0.16, trim, 0, T / 2 + 0.008, -0.14);
    } // shirt + tie
    if (style === "rags") {
      k.box(
        0.12,
        T + 0.006,
        0.1,
        shade(color, 1.25),
        0.08,
        T / 2 + 0.003,
        -0.02,
        0.4,
      );
      k.box(
        0.1,
        T + 0.006,
        0.08,
        shade(color, 0.6),
        -0.07,
        T / 2 + 0.003,
        0.3,
        -0.3,
      );
    }
    return k;
  }
  /** Rounded plate lying on the garment (chest plates, pauldrons, knee pads). */
  function plate(k, w, d, color, x, z, y, ry) {
    k.sph(0.5, color, x, y || 0.045, z, w, 0.07, d, 10);
    if (ry) {
      /* rotation folded into scale for spheres */
    }
    return k;
  }
  function rivets(k, xs, z, y, color) {
    for (const x of xs)
      k.cyl(0.008, 0.008, 0.01, color || 0xa8a8a0, x, y, z, 6);
    return k;
  }
  function spikes(k, pts, color) {
    for (const p of pts)
      k.cone(0.012, 0.07, color, p[0], p[1], p[2], 6, p[3] || 0, p[4] || 0);
    return k;
  }

  /** Exo-rig helmet: a squared helm with a single horizontal slit visor and twin side filters (no snout). */
  function rigHelmet(k, shell, dark, slit) {
    k.box(0.24, 0.2, 0.26, shell, 0, 0.12, 0);
    k.box(0.26, 0.04, 0.28, dark, 0, 0.02, 0);
    k.box(0.2, 0.02, 0.02, slit, 0, 0.15, 0.131); // slit visor
    for (const x of [-0.13, 0.13])
      k.cyl(0.03, 0.03, 0.04, dark, x, 0.09, 0.04, 10, 0, Math.PI / 2); // side filters
    k.box(0.12, 0.02, 0.2, dark, 0, 0.225, -0.02); // crown ridge
    return k;
  }
  /** Upright exo-rig torso shell. style: 'mk1' (riveted boiler plate) | 'mk2' (sealed, smooth) | 'mk3' (servo frame) */
  function rigTorso(k, main, dark, trim, style) {
    const metal = 0x3a3a38;
    // hip block / frame resting on the ground
    k.box(0.36, 0.12, 0.26, dark, 0, 0.06, 0);
    k.box(0.06, 0.1, 0.06, metal, -0.2, 0.07, 0);
    k.box(0.06, 0.1, 0.06, metal, 0.2, 0.07, 0);
    // abdomen segments
    for (let i = 0; i < 3; i++)
      k.box(
        0.3 - i * 0.015,
        0.05,
        0.22,
        i % 2 ? dark : main,
        0,
        0.145 + i * 0.052,
        0.015,
      );
    // chest
    if (style === "mk1") {
      k.box(0.46, 0.24, 0.3, main, 0, 0.4, 0);
      k.box(0.3, 0.16, 0.06, main, 0, 0.41, 0.17, 0, -0.25); // angled front plate
      for (let i = 0; i < 4; i++)
        k.box(0.2, 0.012, 0.012, metal, 0, 0.36 + i * 0.03, 0.2); // vent grille
      rivets(k, [-0.2, -0.1, 0.1, 0.2], 0.155, 0.51, 0x8a8a80);
    } else if (style === "mk2") {
      k.box(0.44, 0.22, 0.28, main, 0, 0.4, 0);
      k.sph(0.2, main, 0, 0.42, 0.07, 1.1, 0.72, 0.72, 12); // rounded chest bulge
      k.box(0.05, 0.2, 0.02, trim, 0, 0.42, 0.21); // gold centre stripe
      k.torus(0.06, 0.012, trim, 0, 0.4, 0.2, 0, 0);
    } else {
      k.box(0.46, 0.24, 0.3, main, 0, 0.4, 0);
      k.box(0.2, 0.18, 0.08, main, -0.1, 0.42, 0.16, 0.25, -0.15);
      k.box(0.2, 0.18, 0.08, main, 0.1, 0.42, 0.16, -0.25, -0.15); // faceted chest
      k.box(0.04, 0.02, 0.02, trim, -0.12, 0.47, 0.215);
      k.box(0.04, 0.02, 0.02, trim, 0.12, 0.47, 0.215); // red status lights
    }
    // collar ring
    k.cyl(0.12, 0.14, 0.05, dark, 0, 0.545, 0.0, 12);
    k.cyl(0.08, 0.08, 0.052, 0x121212, 0, 0.547, 0.0, 12);
    // pauldrons + hanging upper arms
    for (const sx of [-1, 1]) {
      if (style === "mk3")
        k.box(0.2, 0.1, 0.26, main, sx * 0.3, 0.5, 0, 0, 0, sx * -0.35);
      else k.sph(0.13, main, sx * 0.3, 0.48, 0, 1, 0.78, 1.1, 12);
      k.torus(
        0.12,
        0.012,
        style === "mk2" ? trim : dark,
        sx * 0.3,
        0.44,
        0,
        Math.PI / 2,
        0,
      );
      k.cyl(0.065, 0.06, 0.2, dark, sx * 0.31, 0.3, 0, 10);
      k.cyl(0.07, 0.07, 0.035, metal, sx * 0.31, 0.21, 0, 10); // elbow joint cap
    }
    // backpack with twin exhaust pipes & rig-battery housing
    k.box(0.38, 0.3, 0.14, dark, 0, 0.4, -0.21);
    k.cyl(0.035, 0.035, 0.24, metal, -0.1, 0.48, -0.3, 8);
    k.cyl(0.035, 0.035, 0.24, metal, 0.1, 0.48, -0.3, 8);
    k.cyl(0.045, 0.045, 0.04, 0x1a1a1a, -0.1, 0.61, -0.3, 8);
    k.cyl(0.045, 0.045, 0.04, 0x1a1a1a, 0.1, 0.61, -0.3, 8);
    k.cyl(0.05, 0.05, 0.1, 0x6a6a60, 0, 0.3, -0.3, 10, Math.PI / 2); // core port
    // unit stencil patch
    k.box(
      0.1,
      0.05,
      0.004,
      style === "mk3" ? 0x6a6a6a : 0xd8d0b0,
      -0.12,
      0.44,
      0.152,
    );
    return k;
  }

  Object.assign(BUILDERS, {
    // ---- clothing ----
    cloth_cryo: (k) => {
      garment(k, C.cryoGrey, C.cryoOrange, "coverall");
      k.torus(0.06, 0.014, C.cryoOrange, 0, 0.034, -0.27, Math.PI / 2);
      return k;
    },
    cloth_white: (k) => garment(k, 0xe8e8e0, 0xb0b0a8, "coat"),
    cloth_black: (k) => garment(k, 0x26262a, 0x8a1a1a, "suit"),
    cloth_red: (k) => garment(k, 0x7a1a14, 0xd0b040, "robe"),
    cloth_green: (k) => garment(k, 0x4a6a2a, 0xa0d040, "robe"),
    cloth_yellow: (k) => garment(k, 0xd8b020, 0x2a2a2a, "hazmat"),
    cloth_orange: (k) => garment(k, 0xd07020, 0x2a2a2a, "hazmat"),
    cloth_grey: (k) => garment(k, 0x6a6a68, 0x3a3a3a, "suit"),
    cloth_olive: (k) => garment(k, 0x5a603a, 0x3a3a2a, "coverall"),
    cloth_brown: (k) => garment(k, 0x6a4a2a, 0x3a2a1a, "rags"),
    cloth_blue: (k) => garment(k, 0x2e4466, 0xc8a040, "suit"),
    cloth_floral: (k) => {
      garment(k, 0xd890a0, 0xf0e0a0, "dress");
      for (let i = 0; i < 5; i++)
        k.sph(
          0.018,
          0xf4f0d8,
          -0.1 + i * 0.05,
          0.03,
          0.2 + (i % 2) * 0.08,
          1,
          0.3,
          1,
          6,
        );
      return k;
    },
    cloth_sequin: (k) => garment(k, 0xd0a030, 0xff60a0, "dress"),
    // ---- World's Fair curator rewards (src/quests/55_medallions.js) ----
    wf_blazer: (k) => {
      // the Fair host's blazer: Unisphere blue with orange piping and the Fair seal on the breast pocket
      garment(k, 0x1e3a8a, 0xf08a1a, "suit");
      k.boxL(0.07, 0.004, 0.07, 0xffffff, "wf_seal", "y", 0.09, 0.052, 0.05);
      return k;
    },
    hat_boater: (k) => {
      // a stiff straw boater with the orange-and-blue Fair ribbon
      k.cyl(0.15, 0.15, 0.008, 0xd8c078, 0, 0.004, 0, 20);
      k.cyl(0.095, 0.098, 0.06, 0xd0b468, 0, 0.038, 0, 18);
      k.cyl(0.095, 0.095, 0.004, 0xd8c078, 0, 0.07, 0, 18);
      k.cylL(0.1, 0.1, 0.022, 0xffffff, "wf_ribbon", 0, 0.022, 0, 18);
      return k;
    },
    wf_case: (k) => {
      // the walnut presentation case for the complete set: twenty bronze discs in green velvet, the Fair seal in the lid
      k.box(0.42, 0.04, 0.3, 0x5a3418, 0, 0.02, 0);
      k.box(0.4, 0.004, 0.28, 0x1a4a2a, 0, 0.041, 0);
      k.box(0.42, 0.26, 0.02, 0x5a3418, 0, 0.13, -0.15, 0, -0.35);
      k.boxL(
        0.12,
        0.12,
        0.004,
        0xffffff,
        "wf_seal",
        "z",
        0,
        0.14,
        -0.135,
        0,
        -0.35,
      );
      for (let r = 0; r < 4; r++)
        for (let c = 0; c < 5; c++)
          k.cyl(
            0.026,
            0.026,
            0.006,
            0xb07a30,
            -0.14 + c * 0.07,
            0.045,
            -0.1 + r * 0.065,
            12,
          );
      k.box(0.04, 0.012, 0.012, C.crownGold, 0, 0.03, 0.152);
      return k;
    },
    // ---- body armor ----
    armor_guard: (k) => {
      garment(k, 0x8a8e92, C.cryoOrange, "coverall");
      plate(k, 0.3, 0.28, 0x3a3e52, 0, -0.1);
      plate(k, 0.13, 0.13, 0x3a3e52, -0.2, -0.22);
      plate(k, 0.13, 0.13, 0x3a3e52, 0.2, -0.22);
      k.box(0.12, 0.012, 0.03, 0xe8e8e0, 0, 0.068, -0.14);
      return k;
    },
    armor_leather: (k) => {
      garment(k, 0x4a3a2a, 0x2a1a0a, "suit");
      plate(k, 0.32, 0.28, 0x6a4424, 0, -0.1);
      plate(k, 0.15, 0.15, 0x5a3a1e, -0.2, -0.2);
      plate(k, 0.15, 0.15, 0x5a3a1e, 0.2, -0.2);
      for (const z of [-0.18, -0.08, 0.02])
        k.box(0.3, 0.012, 0.018, 0x2a1a0a, 0, 0.07, z); // straps
      k.box(0.08, 0.05, 0.06, 0x5a3a1e, 0.12, 0.05, 0.1);
      k.box(0.08, 0.05, 0.06, 0x5a3a1e, -0.12, 0.05, 0.1); // belt pouches
      plate(k, 0.1, 0.1, 0x6a4424, -0.1, 0.36);
      plate(k, 0.1, 0.1, 0x6a4424, 0.1, 0.36); // knee pads
      return k;
    },
    armor_leather_r: (k) => {
      BUILDERS.armor_leather(k);
      for (const x of [-0.08, 0.08]) {
        k.box(0.1, 0.012, 0.12, 0x7a7870, x, 0.08, -0.12);
        rivets(k, [x - 0.04, x + 0.04], -0.17, 0.088);
      }
      return k;
    },
    armor_metal: (k) => {
      garment(k, 0x3a3430, 0x2a2420, "rags");
      for (let i = 0; i < 3; i++)
        k.box(
          0.34 - i * 0.03,
          0.02,
          0.12,
          i % 2 ? 0x7a7670 : 0x6a6660,
          0,
          0.05 + i * 0.008,
          -0.2 + i * 0.1,
          0,
          0.12,
        ); // overlapping chest plates
      for (const sx of [-1, 1]) {
        k.sph(0.1, 0x8a8680, sx * 0.21, 0.04, -0.2, 1, 0.45, 1.1, 10);
        rivets(k, [sx * 0.21], -0.2, 0.087);
      }
      rivets(k, [-0.14, -0.05, 0.05, 0.14], -0.2, 0.072, 0xb0b0a8);
      k.box(0.12, 0.02, 0.2, 0x6a6660, -0.09, 0.05, 0.36);
      k.box(0.12, 0.02, 0.2, 0x6a6660, 0.09, 0.05, 0.36); // greaves
      k.cyl(0.05, 0.05, 0.012, 0x9a9a90, 0, 0.078, 0.02, 12); // hubcap belly plate
      return k;
    },
    armor_combat: (k) => {
      garment(k, 0x2e3228, 0x1a1c18, "coverall");
      plate(k, 0.3, 0.26, 0x4a5040, 0, -0.12);
      k.box(0.26, 0.022, 0.05, 0x3a3e34, 0, 0.056, 0.02);
      k.box(0.24, 0.022, 0.05, 0x3a3e34, 0, 0.056, 0.075); // chest + ab plates
      for (const sx of [-1, 1]) {
        plate(k, 0.13, 0.16, 0x4a5040, sx * 0.21, -0.2);
        plate(k, 0.09, 0.09, 0x4a5040, sx * 0.09, 0.36);
        k.box(0.08, 0.02, 0.1, 0x3a3e34, sx * 0.28, 0.04, -0.02, sx * 0.55);
      }
      k.box(0.06, 0.03, 0.04, 0x1a1a18, 0.1, 0.055, -0.2);
      k.box(0.1, 0.004, 0.03, 0xd8d0b0, -0.08, 0.075, -0.16); // radio + stencil
      return k;
    },
    armor_scout: (k) => {
      BUILDERS.armor_combat(k);
      k.box(0.12, 0.012, 0.08, 0x6a6a50, 0.06, 0.08, -0.08, 0.5);
      k.box(0.1, 0.012, 0.06, 0x3a3a2a, -0.07, 0.078, -0.16, -0.4);
      return k;
    },
    armor_riot: (k) => {
      garment(k, 0x1a1a1e, 0x0e0e10, "coverall");
      plate(k, 0.34, 0.3, 0x24242a, 0, -0.1);
      k.box(0.3, 0.004, 0.03, 0xd8d8d0, 0, 0.078, -0.03); // POLICE stripe
      for (const sx of [-1, 1]) {
        k.sph(0.12, 0x26262c, sx * 0.22, 0.04, -0.2, 1, 0.5, 1.2, 10);
        plate(k, 0.1, 0.12, 0x26262c, sx * 0.09, 0.36);
      }
      k.cyl(0.03, 0.03, 0.004, 0xc0a040, -0.08, 0.08, -0.18, 8); // precinct badge
      return k;
    },
    armor_stealth: (k) => {
      garment(k, 0x2a1414, 0x4a1a1a, "coverall");
      plate(k, 0.3, 0.26, 0x5a1a1a, 0, -0.1);
      for (const sx of [-1, 1])
        k.box(0.02, 0.01, 0.3, 0x3aff7a, sx * 0.06, 0.07, 0.05); // glowing field lines
      k.box(0.05, 0.03, 0.05, 0x40ff80, 0.1, 0.07, -0.16);
      return k;
    },
    armor_raider: (k) => {
      garment(k, 0x4a3420, 0x2a1a10, "rags");
      k.box(0.16, 0.03, 0.14, 0x5a5a58, -0.18, 0.05, -0.2, 0.3);
      k.sph(0.08, 0x8a2a1a, 0.2, 0.04, -0.2, 1, 0.5, 1, 8); // mismatched pads
      spikes(
        k,
        [
          [-0.2, 0.09, -0.22],
          [-0.14, 0.09, -0.16],
          [0.2, 0.08, -0.2],
        ],
        0x8a8a80,
      );
      k.torus(0.08, 0.025, 0x1a1a1a, 0.05, 0.035, 0.06, Math.PI / 2); // tire strapped to the belly
      k.box(0.3, 0.012, 0.03, 0x2a2a2a, 0, 0.06, -0.08, 0.35); // bandolier
      return k;
    },
    armor_scrap: (k) => {
      BUILDERS.armor_raider(k);
      k.cyl(0.03, 0.03, 0.14, 0x9a2a1a, -0.06, 0.07, -0.1, 8, 0, Math.PI / 2);
      k.cyl(0.03, 0.03, 0.14, 0x9a2a1a, -0.06, 0.07, -0.03, 8, 0, Math.PI / 2);
      return k;
    },
    armor_duster: (k) => {
      garment(k, 0x5a4230, 0x2a1a10, "rags");
      k.box(0.34, 0.02, 0.16, 0x6a5a48, 0, 0.05, -0.18);
      spikes(
        k,
        [
          [0.22, 0.08, -0.2],
          [0.26, 0.08, -0.14],
        ],
        0x7a7a70,
      );
      k.box(0.3, 0.012, 0.03, 0x2a2a2a, 0, 0.06, -0.02, -0.35);
      return k;
    },
    armor_wallstreet: (k) => {
      garment(k, 0x2a2a34, 0x8a1a1a, "suit");
      for (let i = 0; i < 3; i++)
        k.box(0.26, 0.018, 0.08, 0x6a6a60, 0, 0.05, -0.2 + i * 0.09);
      k.box(0.1, 0.004, 0.04, 0xd8c060, -0.08, 0.062, -0.24);
      return k;
    },
    // ---- exo-rigs ----
    rig_mk1: (k) => rigTorso(k, 0x5c604e, 0x3a3c32, 0xb0a060, "mk1"),
    rig_mk2: (k) => rigTorso(k, 0x8a8c84, 0x4a4c48, 0xd07020, "mk2"),
    rig_mk3: (k) => rigTorso(k, 0x4a5236, 0x2e3424, 0xe8e8e0, "mk3"),
    helmet_rig_mk2: (k) => rigHelmet(k, 0x8a8c84, 0x4a4c48, 0xf0a030),
    // ---- junk with distinct silhouettes ----
    sensor: (k) => {
      k.box(0.1, 0.06, 0.08, 0xc8c0a8, 0, 0.03, 0);
      k.cyl(0.028, 0.028, 0.02, C.chrome, 0, 0.035, 0.045, 12, Math.PI / 2);
      k.cyl(0.02, 0.02, 0.022, 0x102030, 0, 0.035, 0.05, 12, Math.PI / 2);
      k.cyl(0.003, 0.003, 0.08, 0x2a2a2a, 0.035, 0.1, -0.02, 4);
      k.sph(0.007, 0xd02020, 0.035, 0.14, -0.02, 1, 1, 1, 6);
      k.box(0.05, 0.008, 0.01, 0xc08040, -0.03, 0.004, -0.05);
      return k;
    },
    conductor: (k) => {
      k.cyl(0.006, 0.006, 0.16, 0xc07a40, 0, 0.08, 0, 6);
      for (let i = 0; i < 4; i++)
        k.cyl(
          0.03 - i * 0.003,
          0.034 - i * 0.003,
          0.018,
          0xe8e0d0,
          0,
          0.02 + i * 0.03,
          0,
          12,
        );
      k.torus(0.02, 0.004, 0xc07a40, 0, 0.15, 0, Math.PI / 2);
      return k;
    },
    microscope: (k) => {
      k.box(0.12, 0.02, 0.16, 0x2a2a2e, 0, 0.01, 0);
      k.box(0.04, 0.2, 0.04, 0x2a2a2e, 0, 0.11, -0.05, 0, 0.15);
      k.box(0.1, 0.012, 0.08, 0x3a3a3e, 0, 0.08, 0.02);
      k.cyl(0.018, 0.018, 0.15, 0xd8d8d0, 0, 0.19, 0.0, 10, 0.35);
      k.cyl(0.012, 0.012, 0.04, 0x1a1a1a, 0, 0.27, -0.03, 8, 0.35);
      k.cyl(0.02, 0.02, 0.03, C.chrome, 0.04, 0.12, -0.05, 10, 0, Math.PI / 2);
      return k;
    },
    pilot_light: (k) => {
      k.cyl(0.018, 0.018, 0.06, 0xc0a050, 0, 0.03, 0, 10);
      k.cyl(0.022, 0.022, 0.01, 0x2a2a2a, 0, 0.065, 0, 10);
      k.box(0.03, 0.01, 0.008, 0xc02020, 0, 0.074, 0);
      k.torus(0.035, 0.004, C.chrome, 0.045, 0.006, 0, Math.PI / 2);
      k.cyl(0.006, 0.006, 0.04, 0xc0a050, 0.025, 0.02, 0, 6, 0, Math.PI / 2);
      return k;
    },
    lighter: (k) => {
      k.box(0.024, 0.045, 0.012, C.chrome, 0, 0.0225, 0);
      k.box(0.0245, 0.003, 0.0125, 0x6a6a6a, 0, 0.032, 0);
      k.cyl(0.003, 0.003, 0.008, 0x3a3a3a, 0.006, 0.048, 0, 6);
      return k;
    },
    fork: (k) => {
      k.box(0.1, 0.004, 0.012, C.chrome, -0.03, 0.002, 0);
      k.box(0.03, 0.004, 0.022, C.chrome, 0.035, 0.002, 0);
      for (const z of [-0.008, 0, 0.008])
        k.box(0.04, 0.004, 0.003, C.chrome, 0.07, 0.002, z);
      return k;
    },
    camera: (k) => {
      k.box(0.12, 0.07, 0.06, 0x1e1e1e, 0, 0.035, 0);
      k.box(0.122, 0.018, 0.062, C.chrome, 0, 0.066, 0);
      k.cyl(0.024, 0.026, 0.04, 0x2a2a2a, 0, 0.035, 0.045, 12, Math.PI / 2);
      k.cyl(0.016, 0.016, 0.042, 0x2a4a5a, 0, 0.035, 0.046, 10, Math.PI / 2);
      k.box(0.02, 0.012, 0.012, C.chrome, 0.04, 0.08, 0);
      return k;
    },
    typewriter: (k) => {
      k.box(0.3, 0.07, 0.24, 0x2a3a2a, 0, 0.035, 0.02);
      k.box(0.3, 0.05, 0.1, 0x2a3a2a, 0, 0.09, -0.06, 0, 0.3);
      for (let r = 0; r < 3; r++)
        for (let i = 0; i < 8; i++)
          k.cyl(
            0.009,
            0.009,
            0.008,
            0xe8e0d0,
            -0.105 + i * 0.03,
            0.074 + r * 0.008,
            0.1 - r * 0.03,
            6,
          );
      k.cyl(0.02, 0.02, 0.34, 0x1a1a1a, 0, 0.13, -0.09, 10, 0, Math.PI / 2);
      k.box(0.2, 0.003, 0.08, C.paper, 0, 0.17, -0.1, 0, -0.2);
      return k;
    },
    ashtray: (k) => {
      k.cyl(0.06, 0.055, 0.018, 0x9ab8b0, 0, 0.009, 0, 14);
      k.cyl(0.045, 0.045, 0.01, 0x3a3a38, 0, 0.014, 0, 14);
      k.cyl(0.004, 0.004, 0.05, 0xe8e0d0, 0.02, 0.022, 0, 6, 0, Math.PI / 2);
      return k;
    },
    token: (k) => {
      k.cyl(0.012, 0.012, 0.003, 0xc0a040, 0, 0.0015, 0, 12);
      k.cyl(0.004, 0.004, 0.0035, 0x2a2010, 0, 0.0016, 0, 8);
      return k;
    },
  });

  // Materials per kind (default 'base')
  const KIND_MAT = {
    bottle_fizzo_blue: "glowBlue",
    fungus_glow: "glowGreen",
    shade_field: "glowBlue",
    gold_bar: "shiny",
    key: "shiny",
    tag: "shiny",
    medallion: "shiny",
    battery: "shiny",
    bottle_fizzo: "shiny",
    bottle_fizzo_frost: "shiny",
    bottle_fizzo_lime: "shiny",
    bottle_water: "shiny",
    bottle_beer: "shiny",
    bottle_wine: "shiny",
    bottle_vodka: "shiny",
    bottle_empty: "shiny",
    bottle_rootbeer: "shiny",
    helmet_continuity: "shiny",
    wrap_zeppelin: "shiny",
    pouch_astro: "shiny",
    // exo-rigs & metal pieces read as painted steel
    rig_mk1: "shiny",
    rig_mk2: "shiny",
    crate_rig: "shiny",
    helmet_rig_mk2: "shiny",
    helmet_rig: "shiny",
    armor_metal: "shiny",
    lighter: "shiny",
    fork: "shiny",
    token: "shiny",
    rig_mk3: "shiny",
    tape_reel: "shiny",
    rally_tonic: "shiny",
    rally_tonic_extra: "shiny",
    wf_case: "shiny",
  };

  // ---- skill manuals: one builder per cover (48_art COVERS) ----
  // Hardbacks: cloth boards over a page block + gilt spine. Comics / pamphlets / annuals: thin
  // (the cover art carries the creased corner). All one merged mesh per kind.
  (function coverBuilders() {
    const covers = (G.items._art && G.items._art.COVERS) || {};
    const hexToNum = (h) =>
      parseInt(String(h).replace("#", ""), 16) || 0x888888;
    for (const name in covers) {
      const spec = covers[name];
      if (name.indexOf("sb_") !== 0) continue;
      const kind = "manual_" + name.slice(3);
      BUILDERS[kind] = (k) => {
        if (spec.style === "hard") {
          const w = 0.16,
            d = 0.225,
            t = 0.042,
            b = hexToNum(spec.bg);
          k.boxL(
            w - 0.008,
            t - 0.008,
            d - 0.01,
            0xffffff,
            "page_edge",
            "xzZ",
            0.003,
            t / 2,
            0,
          ); // page block
          k.boxL(w, 0.004, d, 0xffffff, name, "y", 0, t - 0.002, 0); // front board (cover art)
          k.box(w, 0.004, d, b, 0, 0.002, 0); // back board
          k.box(0.006, t, d, b, -w / 2 + 0.001, t / 2, 0); // spine
          k.box(
            0.0065,
            0.004,
            d * 0.9,
            hexToNum(spec.fg),
            -w / 2 + 0.0008,
            t * 0.7,
            0,
          ); // gilt spine band
          return k;
        }
        const w = spec.style === "pamphlet" ? 0.15 : 0.18,
          d = spec.style === "pamphlet" ? 0.21 : 0.255,
          t = spec.style === "comic" ? 0.004 : 0.006;
        k.boxL(
          w * 0.985,
          t,
          d * 0.985,
          0xffffff,
          "page_edge",
          "xXzZ",
          0.001,
          t / 2,
          0,
        ); // pages
        k.boxL(w, 0.0014, d, 0xffffff, name, "y", 0, t + 0.0007, 0); // front cover
        k.box(w, 0.0014, d, 0xd8d0c0, 0, 0.0007, 0); // back cover
        return k;
      };
    }
  })();

  const GEO = new Map();
  function kindFor(d) {
    if (!d) return "misc";
    if (d.mesh && BUILDERS[d.mesh]) return d.mesh;
    if (d.type === "ammo") return "ammo";
    if (d.type === "weapon") return "weapon";
    if (d.type === "note") return "note";
    if (d.type === "tape") return "tape_reel";
    if (d.type === "key") return "key";
    if (d.type === "apparel")
      return d.slot === "head" ? "hat_cap" : "cloth_grey";
    // keyword heuristics for items defined by other modules (quest items etc.)
    const s = (d.id + " " + (d.name || "")).toLowerCase();
    if (d.type === "aid") {
      if (/cake|roll|pie/.test(s)) return "sweet_roll";
      if (/jet|syringe|inject/.test(s)) return "injector";
      return d.tags.indexOf("drink") >= 0
        ? "bottle_water"
        : d.tags.indexOf("food") >= 0
          ? "can_beans"
          : "pills_white";
    }
    if (/book|manual|journal|ledger/.test(s)) return "book";
    if (
      /note|letter|card|manifest|flyer|playbill|postcard|map|plaque|sign|memo|orders/.test(
        s,
      )
    )
      return "note";
    if (/reel|tape/.test(s)) return "tape_reel";
    if (/\btag\b|_tag|token|ring|medal|badge/.test(s)) return "tag";
    if (/key/.test(s)) return "key";
    if (/core|cell|battery|isotope|reactor/.test(s)) return "battery";
    if (/amplifier|module|circuit|transmitter|radio|chip/.test(s))
      return "electronics";
    if (/strongbox|box|crate|case|chest/.test(s)) return "lunchbox";
    if (/bottle/.test(s)) return "bottle_empty";
    if (/teddy|bear|doll|toy|mannequin/.test(s)) return "teddy";
    return "misc";
  }
  function geometryFor(kind, d) {
    // meat colour and ammo tint vary per item — cache by item id for those
    const key =
      kind === "meat" || kind === "ammo" || kind === "ball"
        ? kind + ":" + (d ? d.id : "")
        : kind;
    let g = GEO.get(key);
    if (!g) {
      const k = kit();
      try {
        (BUILDERS[kind] || BUILDERS.misc)(k, d);
      } catch (e) {
        G.reportError("rpg:itemMesh:" + kind, e);
      }
      g = k.parts.length ? k.build() : new THREE.BoxGeometry(0.1, 0.1, 0.1);
      GEO.set(key, g);
    }
    return g;
  }

  /** Small procedural world model for an item (weapons via G.weapons.createWorldModel when available). */
  function createItemModel(id) {
    const d = G.items.get(id);
    if (
      d &&
      d.type === "weapon" &&
      !G.isStub("weapons") &&
      G.weapons.createWorldModel
    ) {
      try {
        const m = G.weapons.createWorldModel(id);
        if (m) {
          const holder = new THREE.Group();
          holder.add(m);
          // lay it flat and rest it on the ground
          const box = new THREE.Box3().setFromObject(m);
          const sz = box.getSize(new THREE.Vector3());
          if (sz.y > Math.max(sz.x, sz.z)) {
            m.rotation.x = -Math.PI / 2;
          }
          m.updateMatrixWorld(true);
          const b2 = new THREE.Box3().setFromObject(m);
          m.position.y -= b2.min.y - 0.005;
          m.traverse((o) => {
            o.castShadow = false;
            o.receiveShadow = false;
          });
          return holder;
        }
      } catch (e) {
        /* fall through to generic */
      }
    }
    const kind = kindFor(d);
    const M = mats();
    const mesh = new THREE.Mesh(
      geometryFor(kind, d),
      M[KIND_MAT[kind] || "base"],
    );
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.name = "item:" + id;
    return mesh;
  }

  // ------------------------------------------------------------------
  // Pickups
  // ------------------------------------------------------------------
  let pickups = []; // live pickups
  let staticDefs = []; // static pickup definitions (re-created on reset)
  let takenStatic = new Set(); // keys of static pickups the player took
  let initPhase = true; // true until initDone → pickups spawned are static
  let pickupSeq = 0;
  const CULL = 70;

  function stableKey(id, pos) {
    return (
      "p_" +
      id +
      "_" +
      Math.round(pos.x * 10) +
      "_" +
      Math.round(pos.z * 10) +
      "_" +
      Math.round((pos.y || 0) * 10)
    );
  }

  function groundAt(pos) {
    const W = G.world;
    try {
      return W.groundHeight(
        pos.x,
        pos.z,
        (pos.y !== undefined ? pos.y : 0) + 0.3,
        0.05,
      );
    } catch (e) {
      return pos.y || 0;
    }
  }

  /**
   * Spawn a world pickup. pos {x,y,z} (y optional → ground).
   * opts: {cond, owner, yaw, static, dropped, noSave, keepY}
   */
  function spawnPickup(id, count, pos, opts) {
    if (!id || !pos) return null;
    opts = opts || {};
    count = Math.max(1, Math.floor(count || 1));
    if (!G.scene) return null;
    const isStatic = opts.static !== undefined ? !!opts.static : initPhase;
    const key = isStatic ? stableKey(id, pos) : "d" + ++pickupSeq;
    if (isStatic && !opts._restore) {
      staticDefs.push({
        id,
        count,
        pos: { x: pos.x, y: pos.y, z: pos.z },
        opts: Object.assign({}, opts, { static: true }),
        key,
      });
      if (takenStatic.has(key)) return null;
    }
    const obj = new THREE.Group();
    const model = createItemModel(id);
    // Readability: real-size small loot vanishes against rubble at standing height, so small items are
    // shown ~1.3–1.5× (a common trick for small clutter). Weapons & big items stay 1:1.
    const sc = readableScale(model);
    if (sc !== 1) model.scale.multiplyScalar(sc);
    obj.add(model);
    const y = opts.keepY && pos.y !== undefined ? pos.y : groundAt(pos);
    obj.position.set(pos.x, y, pos.z);
    obj.rotation.y =
      opts.yaw !== undefined
        ? opts.yaw
        : U.hash2(Math.round(pos.x * 13), Math.round(pos.z * 17)) * Math.PI * 2;
    G.scene.add(obj);
    const p = {
      key,
      id,
      count,
      cond: opts.cond,
      owner: opts.owner || null,
      object3d: obj,
      static: isStatic,
      dropped: !!opts.dropped,
      noSave: !!opts.noSave,
      pos: obj.position,
    };
    const d = G.items.get(id);
    const labelPos = new THREE.Vector3(pos.x, y + 0.12, pos.z);
    p.interactable = G.world.addInteractable({
      getPos: () => labelPos,
      radius: 0.45,
      priority: 0.5,
      range: 2.8,
      label: () => G.items.displayName(id, p.count),
      verb: () => (isOwnedByOther(p.owner) ? "Steal" : "Take"),
      stealing: () => isOwnedByOther(p.owner),
      itemId: id,
      _rpgPickup: p,
      onInteract: () => takePickup(p),
    });
    p.labelPos = labelPos;
    pickups.push(p);
    return p;
  }

  const _box = new THREE.Box3(),
    _sz = new THREE.Vector3();
  function readableScale(model) {
    try {
      if (model.isMesh && model.geometry) {
        if (!model.geometry.boundingBox) model.geometry.computeBoundingBox();
        _box.copy(model.geometry.boundingBox);
      } else _box.setFromObject(model);
      _box.getSize(_sz);
      const m = Math.max(_sz.x, _sz.y, _sz.z);
      if (!(m > 0)) return 1;
      if (m < 0.1) return 1.5;
      if (m < 0.2) return 1.4;
      if (m < 0.32) return 1.25;
      return 1;
    } catch (e) {
      return 1;
    }
  }

  // ------------------------------------------------------------------
  // Focus highlight (soft glow on the item under the crosshair)
  // ------------------------------------------------------------------
  const HL = new Map(); // source material uuid -> highlighted twin (shared)
  function hlMat(m) {
    if (
      !m ||
      m.isShaderMaterial ||
      (!m.isMeshStandardMaterial &&
        !m.isMeshPhongMaterial &&
        !m.isMeshLambertMaterial)
    )
      return m;
    let h = HL.get(m.uuid);
    if (!h) {
      h = m.clone();
      h.emissive = (m.emissive ? m.emissive.clone() : new THREE.Color(0)).add(
        new THREE.Color(0x3a3a30),
      );
      if (m.map && !m.emissiveMap) h.emissiveMap = m.map;
      h.emissiveIntensity = Math.max(1, m.emissiveIntensity || 1);
      h.userData = { shared: true, rpgHighlight: true };
      HL.set(m.uuid, h);
    }
    return h;
  }
  let hlPickup = null;
  function setHighlight(p, on) {
    if (!p || !p.object3d) return;
    p.object3d.traverse((o) => {
      if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
      if (on) {
        if (!o.userData._rpgMat) {
          o.userData._rpgMat = o.material;
          o.material = hlMat(o.material);
        }
      } else if (o.userData._rpgMat) {
        o.material = o.userData._rpgMat;
        delete o.userData._rpgMat;
      }
    });
  }
  G.events.on("focus", (it) => {
    const p = it && it._rpgPickup ? it._rpgPickup : null;
    if (p === hlPickup) return;
    if (hlPickup) setHighlight(hlPickup, false);
    hlPickup = p && !p.taken ? p : null;
    if (hlPickup) setHighlight(hlPickup, true);
  });

  function isOwnedByOther(owner) {
    if (!owner || owner === "player") return false;
    const c = G.containers; // share the container module's hostile-owner rule when present
    return c && !G.isStub("containers") && c.isStealing
      ? c.isStealing(owner)
      : true;
  }

  function takePickup(p) {
    if (!p || p.taken) return false;
    const d = G.items.get(p.id);
    if (isOwnedByOther(p.owner) && G.containers && G.containers.stealCheck) {
      const value = (d ? d.value : 1) * p.count;
      G.containers.stealCheck(p.owner, value, {
        pos: p.pos,
        name: d ? d.name : p.id,
      });
    }
    const silent = !!(d && d.medallion);
    G.inventory.add(p.id, p.count, { cond: p.cond, silent });
    const snd =
      p.id === "scrip"
        ? "pickup_scrip"
        : d && d.type === "weapon"
          ? "pickup_weapon"
          : d && d.type === "apparel"
            ? "pickup_armor"
            : "pickup";
    G.sfx.play(snd, {
      pos: p.pos.clone ? p.pos.clone() : undefined,
      volume: 0.8,
    });
    if (p.static) takenStatic.add(p.key);
    removePickup(p);
    G.events.emit("pickupTaken", p.id, p.count);
    return true;
  }

  function removePickup(p) {
    if (!p) return;
    p.taken = true;
    if (hlPickup === p) {
      setHighlight(p, false);
      hlPickup = null;
    }
    if (p.interactable) G.world.removeInteractable(p.interactable);
    if (p.object3d && p.object3d.parent) p.object3d.parent.remove(p.object3d);
    const i = pickups.indexOf(p);
    if (i >= 0) pickups.splice(i, 1);
  }

  let cullT = 0;
  function update(realDt) {
    cullT -= realDt;
    if (cullT > 0) return;
    cullT = 0.3;
    const cam = G.camera && G.camera.position;
    if (!cam) return;
    const m2 = CULL * CULL;
    for (const p of pickups) {
      const dx = p.pos.x - cam.x,
        dz = p.pos.z - cam.z;
      p.object3d.visible = dx * dx + dz * dz < m2;
    }
  }

  function clearDynamic() {
    for (const p of pickups.slice()) if (!p.static) removePickup(p);
  }
  function restoreStatics() {
    // remove all statics then recreate those not taken
    for (const p of pickups.slice()) if (p.static) removePickup(p);
    for (const s of staticDefs)
      if (!takenStatic.has(s.key))
        spawnPickup(
          s.id,
          s.count,
          s.pos,
          Object.assign({}, s.opts, { static: true, _restore: true }),
        );
  }

  function serialize() {
    const dyn = [];
    for (const p of pickups)
      if (!p.static && !p.noSave)
        dyn.push([
          p.id,
          p.count,
          Math.round(p.pos.x * 100) / 100,
          Math.round(p.pos.y * 100) / 100,
          Math.round(p.pos.z * 100) / 100,
          p.cond === undefined ? null : p.cond,
          p.owner,
        ]);
    return { taken: Array.from(takenStatic), dyn };
  }
  function deserialize(d) {
    takenStatic = new Set((d && d.taken) || []);
    restoreStatics();
    for (const e of (d && d.dyn) || [])
      spawnPickup(
        e[0],
        e[1],
        { x: e[2], y: e[3], z: e[4] },
        {
          static: false,
          cond: e[5] === null ? undefined : e[5],
          owner: e[6] || null,
          keepY: true,
        },
      );
  }

  Object.assign(G.items, {
    spawnPickup,
    createItemModel,
    removePickup,
    takePickup,
    pickups: () => pickups.slice(),
    _pickupsUpdate: update,
    _pickupsReset() {
      clearDynamic();
      takenStatic = new Set();
      restoreStatics();
    },
    _pickupsSerialize: serialize,
    _pickupsDeserialize: deserialize,
    _endInitPhase() {
      initPhase = false;
    },
    MESH_KINDS: Object.keys(BUILDERS),
  });
})();
