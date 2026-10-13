// play-inline-46 03 — light
// Lines 251-541 of readable/play-inline-46.pretty.js (statement-aligned).
  const MOODS = {
    cryo_c9: {
      fog: "#16232a",
      fogD: 0.011,
      hemiS: "#b0c8d8",
      hemiG: "#4e585e",
      hemiI: 1.3,
      light: "#e4f4ff",
      lightI: 0.8,
      exp: 1.15,
    },
    subway: {
      fog: "#0a0e0b",
      fogD: 0.032,
      hemiS: "#6c7c68",
      hemiG: "#1a1a14",
      hemiI: 0.62,
      light: "#b4cca2",
      lightI: 0.22,
      exp: 1.3,
    },
    empire_lobby: {
      fog: "#1a130b",
      fogD: 0.011,
      hemiS: "#dcbc92",
      hemiG: "#54402a",
      hemiI: 0.9,
      light: "#ffd8a0",
      lightI: 0.45,
      exp: 1.12,
    },
    liberty_pedestal: {
      fog: "#0f1319",
      fogD: 0.024,
      hemiS: "#8c9caa",
      hemiG: "#2a2a2a",
      hemiI: 0.78,
      light: "#c4d4e4",
      lightI: 0.38,
      exp: 1.15,
    },
    // map's six street dungeons (56_dungeons.js)
    dng_garment: {
      fog: "#16120d",
      fogD: 0.02,
      hemiS: "#b8a080",
      hemiG: "#3e3226",
      hemiI: 0.84,
      light: "#f0d8b0",
      lightI: 0.4,
      exp: 1.14,
    }, // dusty sweatshop lofts
    dng_chelsea: {
      fog: "#12130e",
      fogD: 0.024,
      hemiS: "#a8a47e",
      hemiG: "#34322a",
      hemiI: 0.76,
      light: "#d8e0b0",
      lightI: 0.34,
      exp: 1.16,
    }, // scorched-rotten hotel
    dng_bank: {
      fog: "#0f1216",
      fogD: 0.018,
      hemiS: "#a4b0bc",
      hemiG: "#34383c",
      hemiI: 0.86,
      light: "#dce8f4",
      lightI: 0.42,
      exp: 1.12,
    }, // marble & fluorescent
    dng_metro: {
      fog: "#0a0e0b",
      fogD: 0.028,
      hemiS: "#74846e",
      hemiG: "#1c1c16",
      hemiI: 0.7,
      light: "#bcd0a8",
      lightI: 0.26,
      exp: 1.28,
    }, // subway platform
    dng_market: {
      fog: "#15130e",
      fogD: 0.02,
      hemiS: "#b4a888",
      hemiG: "#3a3428",
      hemiI: 0.86,
      light: "#f0e0c0",
      lightI: 0.4,
      exp: 1.14,
    }, // grocery hall
    dng_pump: {
      fog: "#0c1413",
      fogD: 0.022,
      hemiS: "#88a8a0",
      hemiG: "#1e2826",
      hemiI: 0.95,
      light: "#c8e8e0",
      lightI: 0.36,
      exp: 1.3,
    }, // wet pump hall (kept readable)
    // The Neon's shared interior cell (18 places, TIMES_SQUARE_PLAN.md): the one place in NY with power —
    // warm tungsten under a pink/violet neon spill, low bloom threshold so tubes and signs glow (owner may override)
    neon_interiors: {
      fog: "#1a1016",
      fogD: 0.016,
      hemiS: "#d8a8c0",
      hemiG: "#3e2a26",
      hemiI: 0.86,
      light: "#ffcc98",
      lightI: 0.38,
      exp: 1.16,
      bloom: 0.5,
      vig: 0.04,
    },
    default: {
      fog: "#121412",
      fogD: 0.022,
      hemiS: "#a2aa92",
      hemiG: "#3e3c34",
      hemiI: 0.82,
      light: "#e2e2d2",
      lightI: 0.38,
      exp: 1.12,
    },
  };
  for (const k in MOODS) {
    const m = MOODS[k];
    for (const n of ["fog", "hemiS", "hemiG", "light"])
      m[n] = new THREE.Color(m[n]);
  }
  A.MOODS = MOODS;

  // ------------------------------------------------------------------
  // Interior mood CATEGORIES. ~70 interior cells exist (POIs, landmark interiors…); the owners
  // may inject an exact mood into MOODS (they win), every other cell gets the mood of its
  // category instead of one generic grey: interiors each read by their light — sickly
  // green fluorescents in asylums, amber tungsten in bars and hotels, cold stone in churches,
  // sodium-orange rust in factories, blue-white tech light in bunkers.
  // `bloom` (bright-pass threshold), `vig` (extra vignette) and `grain` are optional post-fx hints.
  // ------------------------------------------------------------------
  const CAT = {
    hotel: {
      fog: "#18120b",
      fogD: 0.014,
      hemiS: "#d8b88c",
      hemiG: "#4a3a28",
      hemiI: 0.84,
      light: "#ffd49a",
      lightI: 0.36,
      exp: 1.15,
      bloom: 0.55,
    },
    residence: {
      fog: "#16110c",
      fogD: 0.017,
      hemiS: "#c8ac88",
      hemiG: "#3a2e22",
      hemiI: 0.8,
      light: "#ffd8a8",
      lightI: 0.33,
      exp: 1.16,
      vig: 0.04,
    },
    church: {
      fog: "#121418",
      fogD: 0.011,
      hemiS: "#a4b2c6",
      hemiG: "#4c4032",
      hemiI: 0.8,
      light: "#eadcc0",
      lightI: 0.36,
      exp: 1.17,
      bloom: 0.5,
    },
    museum: {
      fog: "#141512",
      fogD: 0.01,
      hemiS: "#c6c6b2",
      hemiG: "#4a4638",
      hemiI: 0.9,
      light: "#f2ecd6",
      lightI: 0.42,
      exp: 1.12,
    },
    hospital: {
      fog: "#0d140f",
      fogD: 0.021,
      hemiS: "#98b89c",
      hemiG: "#28362c",
      hemiI: 0.8,
      light: "#ccf0cc",
      lightI: 0.34,
      exp: 1.2,
      vig: 0.06,
      grain: 0.01,
    },
    bank: {
      fog: "#0f1216",
      fogD: 0.016,
      hemiS: "#a8b4c0",
      hemiG: "#363a3e",
      hemiI: 0.88,
      light: "#dfeaf6",
      lightI: 0.42,
      exp: 1.12,
    },
    bar: {
      fog: "#1a1109",
      fogD: 0.024,
      hemiS: "#d0a472",
      hemiG: "#3e2818",
      hemiI: 0.78,
      light: "#ffc47e",
      lightI: 0.34,
      exp: 1.17,
      bloom: 0.5,
      vig: 0.04,
    },
    theater: {
      fog: "#120d0b",
      fogD: 0.012,
      hemiS: "#b89880",
      hemiG: "#2c221c",
      hemiI: 0.7,
      light: "#ffd4aa",
      lightI: 0.3,
      exp: 1.22,
      bloom: 0.5,
      vig: 0.06,
    },
    industrial: {
      fog: "#15110b",
      fogD: 0.019,
      hemiS: "#b2a07c",
      hemiG: "#30281e",
      hemiI: 0.8,
      light: "#ffc486",
      lightI: 0.36,
      exp: 1.18,
      vig: 0.03,
    },
    transit: {
      fog: "#0c100d",
      fogD: 0.024,
      hemiS: "#86987e",
      hemiG: "#20221a",
      hemiI: 0.74,
      light: "#c4d6ae",
      lightI: 0.3,
      exp: 1.25,
      vig: 0.05,
    },
    bunker: {
      fog: "#0d1318",
      fogD: 0.014,
      hemiS: "#9cbcd0",
      hemiG: "#283238",
      hemiI: 0.86,
      light: "#d6eaff",
      lightI: 0.4,
      exp: 1.15,
      bloom: 0.55,
    },
    office: {
      fog: "#141411",
      fogD: 0.015,
      hemiS: "#bebaa0",
      hemiG: "#3c382e",
      hemiI: 0.84,
      light: "#f0e8cc",
      lightI: 0.38,
      exp: 1.13,
    },
    store: {
      fog: "#131510",
      fogD: 0.014,
      hemiS: "#b8bea2",
      hemiG: "#383c30",
      hemiI: 0.86,
      light: "#e6f0d0",
      lightI: 0.4,
      exp: 1.13,
    },
  };
  for (const k in CAT) {
    const m = CAT[k];
    for (const n of ["fog", "hemiS", "hemiG", "light"])
      m[n] = new THREE.Color(m[n]);
  }
