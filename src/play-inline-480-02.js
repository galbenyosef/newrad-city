// play-inline-480 02 — box
// Lines 345-1102 of readable/play-inline-480.pretty.js (statement-aligned).
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
