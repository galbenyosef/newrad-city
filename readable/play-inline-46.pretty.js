/* src/atmosphere/10_timeofday.js */
/* =====================================================================
 * ATMOSPHERE — time of day & environment solver
 * Advances G.time.hour (≈1 game hour per 2 real minutes by default via
 * G.time.minutesPerSecond), computes the sun & moon positions and the
 * per-frame environment `A.env` (light colours, sky gradient, fog…)
 * from authored keyframes, the current weather blend (A.weather.cur),
 * the district the camera is in, and interior "moods".
 * Every visual sub-system (sky, lights, water, post, particles) reads A.env.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !G.atmos || !G.atmos._) return;
  const A = G.atmos._,
    ATMOS = G.atmos;
  const { clamp, lerp, smooth } = A;

  // ------------------------------------------------------------------
  // Outdoor keyframes (authored in sRGB hex). The palette is a
  // sickly olive/green-yellow haze by day, bruised oranges at dusk and a
  // deep teal-blue night that stays readable.
  // ------------------------------------------------------------------
  // Night stays navigable: the moon is a real (shadow-casting) key light, the sky
  // hemisphere is a readable blue-green and the horizon stays lighter than the
  // skyline so silhouettes read. 06:00 is CIVIL TWILIGHT (bright pastel sky,
  // soft sky-lit world), sunrise proper is ~06:45.
  const OUT = A.buildKeys({
    0: {
      zen: "#08152a",
      hor: "#474a4a",
      fog: "#283030",
      sunC: "#94b0da",
      sunI: 1.05,
      hemiS: "#7298b0",
      hemiG: "#36423f",
      hemiI: 1.42,
      exp: 1.52,
      stars: 1.0,
      cLit: "#363c46",
      cShade: "#0d131c",
      fogD: 0.0019,
      glow: "#403f40",
      sunSize: 0,
    },
    4.4: {
      zen: "#09162b",
      hor: "#474a4a",
      fog: "#283030",
      sunC: "#94b0da",
      sunI: 1.05,
      hemiS: "#7298b0",
      hemiG: "#36423f",
      hemiI: 1.42,
      exp: 1.52,
      stars: 1.0,
      cLit: "#363c46",
      cShade: "#0d131c",
      fogD: 0.0019,
      glow: "#403f40",
      sunSize: 0,
    },
    5.3: {
      zen: "#15283e",
      hor: "#4a5058",
      fog: "#343c3a",
      sunC: "#a8b6d0",
      sunI: 0.62,
      hemiS: "#7c94ae",
      hemiG: "#42463f",
      hemiI: 1.62,
      exp: 1.5,
      stars: 0.55,
      cLit: "#56565e",
      cShade: "#1c2028",
      fogD: 0.002,
      glow: "#7a6264",
      sunSize: 0,
    },
    6.0: {
      zen: "#32506a",
      hor: "#c89274",
      fog: "#7a7466",
      sunC: "#ffa878",
      sunI: 0.5,
      hemiS: "#98a8bc",
      hemiG: "#54504a",
      hemiI: 1.6,
      exp: 1.42,
      stars: 0.08,
      cLit: "#d8a488",
      cShade: "#524c58",
      fogD: 0.002,
      glow: "#ffa070",
      sunSize: 1,
    },
    6.8: {
      zen: "#50686f",
      hor: "#dca271",
      fog: "#a3926f",
      sunC: "#ffaa6a",
      sunI: 1.45,
      hemiS: "#949888",
      hemiG: "#4a3e30",
      hemiI: 0.92,
      exp: 1.08,
      stars: 0.0,
      cLit: "#f4b886",
      cShade: "#6e605c",
      fogD: 0.0018,
      glow: "#ffb070",
      sunSize: 1,
    },
    8.0: {
      zen: "#65888a",
      hor: "#c9c498",
      fog: "#adac88",
      sunC: "#ffe0b0",
      sunI: 2.35,
      hemiS: "#b6bea0",
      hemiG: "#544c3c",
      hemiI: 1.02,
      exp: 1.0,
      stars: 0.0,
      cLit: "#f2eed2",
      cShade: "#8a8c78",
      fogD: 0.0014,
      glow: "#fff0c0",
      sunSize: 1,
    },
    12.0: {
      zen: "#5c8490",
      hor: "#cfcb9e",
      fog: "#b3b28e",
      sunC: "#fff3d4",
      sunI: 2.8,
      hemiS: "#c3cba8",
      hemiG: "#5e5644",
      hemiI: 1.12,
      exp: 0.95,
      stars: 0.0,
      cLit: "#f7f5de",
      cShade: "#9b9d86",
      fogD: 0.00125,
      glow: "#fff6d8",
      sunSize: 1,
    },
    16.0: {
      zen: "#62868a",
      hor: "#d3c897",
      fog: "#b5ae88",
      sunC: "#ffe6b6",
      sunI: 2.5,
      hemiS: "#c1c3a0",
      hemiG: "#5e5240",
      hemiI: 1.06,
      exp: 0.97,
      stars: 0.0,
      cLit: "#f6eccb",
      cShade: "#98927a",
      fogD: 0.0013,
      glow: "#ffe6b0",
      sunSize: 1,
    },
    18.0: {
      zen: "#55646a",
      hor: "#e2a96b",
      fog: "#b99b6f",
      sunC: "#ffb26e",
      sunI: 1.75,
      hemiS: "#aa9a80",
      hemiG: "#4e4032",
      hemiI: 0.92,
      exp: 1.02,
      stars: 0.0,
      cLit: "#ffc890",
      cShade: "#7a6660",
      fogD: 0.00155,
      glow: "#ffb070",
      sunSize: 1.1,
    },
    19.1: {
      zen: "#323e58",
      hor: "#e07846",
      fog: "#8a634f",
      sunC: "#ff7040",
      sunI: 0.62,
      hemiS: "#7e7272",
      hemiG: "#403634",
      hemiI: 1.65,
      exp: 1.5,
      stars: 0.12,
      cLit: "#e08262",
      cShade: "#3a3040",
      fogD: 0.0019,
      glow: "#ff7a4a",
      sunSize: 1.2,
    },
    20.2: {
      zen: "#122038",
      hor: "#504a4c",
      fog: "#2e3030",
      sunC: "#90a2c0",
      sunI: 0.62,
      hemiS: "#6a82a0",
      hemiG: "#3a403e",
      hemiI: 1.58,
      exp: 1.5,
      stars: 0.75,
      cLit: "#46404a",
      cShade: "#161820",
      fogD: 0.002,
      glow: "#6a4a50",
      sunSize: 0,
    },
    21.5: {
      zen: "#08152a",
      hor: "#474a4a",
      fog: "#283030",
      sunC: "#94b0da",
      sunI: 1.05,
      hemiS: "#7298b0",
      hemiG: "#36423f",
      hemiI: 1.42,
      exp: 1.52,
      stars: 1.0,
      cLit: "#363c46",
      cShade: "#0d131c",
      fogD: 0.0019,
      glow: "#403f40",
      sunSize: 0,
    },
  });

  // District atmosphere tweaks (fog density multiplier + colour tint)
  const DISTRICT = {
    central_park: { d: 0.85, tint: new THREE.Color("#a8b890"), t: 0.12 },
    upper_west_side: { d: 1.0, tint: null, t: 0 },
    upper_east_side: { d: 1.0, tint: null, t: 0 },
    midtown: { d: 1.05, tint: new THREE.Color("#b0ac8c"), t: 0.05 },
    midtown_south: { d: 1.05, tint: null, t: 0 },
    greenwich_village: { d: 0.95, tint: new THREE.Color("#b8a888"), t: 0.08 },
    financial_district: { d: 1.1, tint: new THREE.Color("#9aa096"), t: 0.12 },
    brooklyn: { d: 1.1, tint: new THREE.Color("#b09a78"), t: 0.16 },
    harbor: { d: 1.0, tint: new THREE.Color("#98a8a0"), t: 0.2 },
    water: { d: 1.0, tint: new THREE.Color("#98a8a0"), t: 0.18 },
  };

  // Interior moods (no sky/sun). light = overhead key light.
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
  const CAT_OF = {
    hotel: [
      "plaza_hotel",
      "waldorf",
      "chelsea_hotel",
      "algonquin",
      "hotel_new_yorker",
      "ansonia",
    ],
    residence: ["dakota", "san_remo", "gracie_mansion", "tudor_city"],
    museum: [
      "amnh",
      "moma",
      "frick",
      "cooper_hewitt",
      "morgan_library",
      "ellis_island",
    ],
    church: ["trinity_church", "old_st_patricks", "st_pauls_chapel"],
    hospital: ["bellevue", "roosevelt_octagon", "smallpox_hospital", "tombs"],
    bank: [
      "federal_reserve",
      "forty_wall",
      "custom_house",
      "singer_building",
      "nyse_floor",
    ],
    bar: [
      "katz_deli",
      "orourkes",
      "fraunces_tavern",
      "automat",
      "empire_diner",
      "village_vanguard",
      "webster_hall",
    ],
    theater: [
      "carnegie_hall",
      "ed_sullivan",
      "lyceum_theatre",
      "msg",
      "un_assembly",
    ],
    industrial: [
      "domino_sugar",
      "nabisco_factory",
      "uss_hudson",
      "seaport",
      "high_line",
      "queensboro_bridge",
      "manhattan_bridge",
      "park_ave_armory",
    ],
    transit: ["port_authority", "penn_station"],
    bunker: ["chinatown", "rockefeller_30rock"],
    office: [
      "municipal_building",
      "tammany_hall",
      "cooper_union",
      "journal_bldg",
      "new_york_life",
      "police_hq",
      "metlife_tower",
      "city_hall_rotunda",
      "woolworth_lobby",
      "flatiron_interior",
    ],
    store: ["bellamys", "tiffany"],
  };
  const KEY_CAT = {};
  for (const c in CAT_OF) for (const k of CAT_OF[c]) KEY_CAT[k] = c;
  // unknown/future cells: guess from the key and the display name
  const CAT_RX = [
    [/cryo|bunker|citadel|lab|bomb|shelter/i, "bunker"],
    [/subway|metro|tunnel|station|terminal|sewer/i, "transit"],
    [/hotel|inn\b|motel|suite/i, "hotel"],
    [/church|chapel|cathedral|abbey|crypt|catacomb/i, "church"],
    [/hospital|clinic|asylum|prison|jail|tomb|morgue/i, "hospital"],
    [/bank|reserve|exchange|strongroom|treasury/i, "bank"],
    [/bar|tavern|saloon|pub|deli|diner|club|ale|automat|restaurant/i, "bar"],
    [/theat|hall|opera|arena|garden|assembly/i, "theater"],
    [
      /factory|refinery|plant|pump|dock|pier|ship|bridge|warehouse|foundry|armory/i,
      "industrial",
    ],
    [/museum|gallery|library|collection/i, "museum"],
    [/store|shop|mart|market|mall/i, "store"],
    [/mansion|house|apartment|residence|dakota/i, "residence"],
    [/office|building|tower|police|court|city/i, "office"],
  ];
  const moodCache = {};
  function moodFor(key) {
    if (MOODS[key]) return MOODS[key]; // exact mood (atmosphere's own or injected by the cell owner)
    if (moodCache[key]) return moodCache[key];
    let c = KEY_CAT[key];
    if (!c) {
      const L = G.LAYOUT,
        def = L && L.INTERIORS && L.INTERIORS[key];
      const txt = key + " " + ((def && def.name) || "");
      for (const [rx, cat] of CAT_RX)
        if (rx.test(txt)) {
          c = cat;
          break;
        }
    }
    return (moodCache[key] = (c && CAT[c]) || MOODS.default);
  }
  A.moodFor = moodFor;
  A.MOOD_CATS = CAT;

  // ------------------------------------------------------------------
  // Environment state
  // ------------------------------------------------------------------
  const env = (A.env = {
    hour: 10,
    day: 1,
    night: 0,
    sunY: 0.5,
    sunDir: new THREE.Vector3(0.3, 0.8, 0.4).normalize(), // true sun position
    moonDir: new THREE.Vector3(-0.3, 0.6, -0.4).normalize(), // true moon position
    lightDir: new THREE.Vector3(0.3, 0.8, 0.4).normalize(), // direction of the main directional light
    lightColor: new THREE.Color(),
    lightInt: 2,
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    hemiInt: 0.9,
    fogColor: new THREE.Color(0x8a8f78),
    fogDensity: 0.0017,
    zenith: new THREE.Color(),
    horizon: new THREE.Color(),
    glow: new THREE.Color(),
    cloudLit: new THREE.Color(),
    cloudShade: new THREE.Color(),
    stars: 0,
    sunSize: 1,
    exposure: 1,
    interior: false,
    mood: null,
    flash: 0,
    flashColor: new THREE.Color(0x9aff9a),
    // height fog / aerial perspective (see 00_core.js) and the ambient-bounce fill light
    fogH: 70,
    fogBase: 6,
    fogHaze: 0.12,
    fogMax: 1,
    fogFar: 2000,
    fogSky: new THREE.Color(),
    aerial: 0.85,
    scatterColor: new THREE.Color(),
    scatter: 0,
    scatterDir: new THREE.Vector3(0, 1, 0),
    fillDir: new THREE.Vector3(-0.5, 0.3, -0.5).normalize(),
    fillColor: new THREE.Color(),
    fillInt: 0,
  });
  const keyOut = {};
  const _distTint = new THREE.Color(),
    _grey = new THREE.Color();
  let distD = 1,
    distT = 0;
  const distTintCur = new THREE.Color(0xb0ac8c);

  // ------------------------------------------------------------------
  // Sun / moon path. Sunrise ≈ 6:00 in the east (+X), noon high in the
  // south (+Z), sunset ≈ 19:00 in the west (-X).
  // ------------------------------------------------------------------
  function sunPath(h, out) {
    const th = ((h - 6.0) / 13.0) * Math.PI;
    const s = Math.sin(th),
      c = Math.cos(th);
    return out
      .set(c, s * 0.86, 0.42 * Math.max(0.2, Math.abs(s)) + 0.12)
      .normalize();
  }
  function moonPath(h, out) {
    let hh = h < 12 ? h + 24 : h;
    const th = ((hh - 18.5) / 12.0) * Math.PI;
    const s = Math.sin(th),
      c = Math.cos(th);
    return out.set(c * 0.9, s * 0.72, -0.25 + 0.1 * s).normalize();
  }

  let lastHourInt = -1;
  function advance(dt) {
    const T = G.time;
    if (dt > 0 && G.worldRunning()) {
      const mps = T.minutesPerSecond !== undefined ? T.minutesPerSecond : 0.5;
      T.hour += (dt * mps) / 60;
      while (T.hour >= 24) {
        T.hour -= 24;
        T.day = (T.day || 1) + 1;
        G.events.emit("dayChanged", T.day);
      }
    }
    const hi = Math.floor(T.hour);
    if (hi !== lastHourInt) {
      if (lastHourInt >= 0) G.events.emit("hourChanged", T.hour);
      lastHourInt = hi;
    }
  }

  function solve(realDt) {
    const h = G.time.hour;
    env.hour = h;
    env.day = G.time.day;
    sunPath(h, env.sunDir);
    moonPath(h, env.moonDir);
    env.sunY = env.sunDir.y;
    env.night = 1 - smooth(-0.12, 0.16, env.sunY);
    ATMOS.sunDirection.copy(env.sunDir);
    ATMOS.moonDirection.copy(env.moonDir);

    const W = A.weather ? A.weather.cur : null;
    const snap = A.envSnap || !A._envInit;
    A._envInit = true;
    const k = realDt > 0 ? 1 - Math.exp(-2.0 * realDt) : 1;

    if (ATMOS.interior) {
      const mood = moodFor(ATMOS.interiorKey);
      env.interior = true;
      env.mood = mood;
      env.lightDir.set(0.25, 1, 0.18).normalize();
      env.lightColor.copy(mood.light);
      env.lightInt = mood.lightI;
      env.hemiSky.copy(mood.hemiS);
      env.hemiGround.copy(mood.hemiG);
      env.hemiInt = mood.hemiI;
      env.fogColor.copy(mood.fog);
      env.fogDensity = mood.fogD;
      env.zenith.copy(mood.fog);
      env.horizon.copy(mood.fog);
      env.glow.copy(mood.fog);
      env.stars = 0;
      env.exposure = mood.exp;
      env.sunSize = 0;
      env.flash = 0;
      // soft side fill (bounce off floors/walls) so shadowed sides keep their form
      env.fillDir.set(-0.62, 0.35, -0.42).normalize();
      env.fillColor.copy(mood.hemiG).lerp(mood.light, 0.5);
      normColor(env.fillColor);
      env.fillInt = 0.18 + mood.lightI * 0.3;
      env.scatter = 0;
      return;
    }
    env.interior = false;
    env.mood = null;
    A.sampleKeys(OUT, h, keyOut);

    // --- light direction: sun by day, moon at night; clamp low angles for sane shadows
    const w = smooth(-0.05, 0.05, env.sunY);
    const src = w > 0.5 ? env.sunDir : env.moonDir;
    env.lightDir.copy(src);
    if (env.lightDir.y < 0.14) {
      env.lightDir.y = 0.14;
      env.lightDir.normalize();
    }
    env.lightColor.copy(keyOut.sunC);
    env.lightInt = keyOut.sunI;
    env.hemiSky.copy(keyOut.hemiS);
    env.hemiGround.copy(keyOut.hemiG);
    env.hemiInt = keyOut.hemiI;
    env.fogColor.copy(keyOut.fog);
    env.fogDensity = keyOut.fogD;
    env.zenith.copy(keyOut.zen);
    env.horizon.copy(keyOut.hor);
    env.glow.copy(keyOut.glow);
    env.cloudLit.copy(keyOut.cLit);
    env.cloudShade.copy(keyOut.cShade);
    env.stars = keyOut.stars;
    env.exposure = keyOut.exp;
    env.sunSize = keyOut.sunSize;

    // --- district tweaks (smoothly blended)
    const D = DISTRICT[ATMOS.district] || { d: 1, tint: null, t: 0 };
    if (snap) {
      distD = D.d;
      distT = D.t;
      if (D.tint) distTintCur.copy(D.tint);
    } else {
      distD = lerp(distD, D.d, k * 0.5);
      distT = lerp(distT, D.t, k * 0.5);
      if (D.tint) distTintCur.lerp(D.tint, k * 0.5);
    }
    env.fogDensity *= distD;
    if (distT > 0.001) {
      _distTint.copy(distTintCur).multiplyScalar(0.25 + 0.75 * (1 - env.night)); // tints are darker at night
      env.fogColor.lerp(_distTint, distT);
      env.horizon.lerp(_distTint, distT * 0.6);
    }

    // --- weather
    if (W) {
      const nightDim = 0.3 + 0.7 * (1 - env.night);
      // overcast: pull the sky toward a flat grey-olive, crush the sun
      const oc = W.cloudDark * W.cloud;
      _grey
        .copy(env.fogColor)
        .lerp(A.tmpC.setRGB(0.28, 0.3, 0.26).multiplyScalar(nightDim), 0.35);
      env.zenith.lerp(_grey, oc * 0.85);
      env.horizon.lerp(_grey, oc * 0.5);
      env.glow.lerp(_grey, oc * 0.8);
      env.cloudLit.lerp(env.cloudShade, oc * 0.55);
      env.lightInt *= W.sunMul;
      env.hemiInt *= 0.78 + 0.22 * W.sunMul + 0.1 * oc;
      env.stars *= 1 - W.cloud * 0.95;
      env.sunSize *= 1 - oc * 0.9;
      // the eye opens up under a heavy sky (grey rain days stay readable, not murky)
      env.exposure *= 1 + 0.22 * oc * (1 - env.night);
      // weather fog tint (dust = brown, rad weather = toxic green, rain = grey-blue)
      if (W.fogTintAmt > 0.001) {
        A.tmpC2.copy(W.fogTint).multiplyScalar(nightDim);
        env.fogColor.lerp(A.tmpC2, W.fogTintAmt);
        env.horizon.lerp(A.tmpC2, W.fogTintAmt * 0.85);
        env.zenith.lerp(A.tmpC2, W.fogTintAmt * 0.45);
        env.hemiSky.lerp(A.tmpC2, W.fogTintAmt * 0.35);
        env.cloudLit.lerp(A.tmpC2, W.fogTintAmt * 0.5);
        env.cloudShade.lerp(A.tmpC2.multiplyScalar(0.45), W.fogTintAmt * 0.5);
      }
      env.fogDensity *= W.fogMul;
      // rad weather (preset rad > 0; none currently): the storm light itself is green — sky fill, key light, bounce and clouds
      // look: NOT a monochrome night-vision filter — a dark, brooding sky (dusk-level light at
      // noon), a sickly yellow-green glow band low on the horizon under the deck, green-lit shadows and
      // haze, while surfaces keep their own colour (brick still reads as brick). Green lightning does
      // the rest (+ atmosphere's post grade pulses).
      if (W.rad > 0.01) {
        const rk = clamp(W.rad, 0, 1);
        env.hemiSky.lerp(_radSky, 0.42 * rk);
        env.hemiGround.lerp(_radGround, 0.35 * rk);
        env.lightColor.lerp(_radKey, 0.34 * rk);
        env.cloudLit.lerp(_radSky, 0.45 * rk);
        env.glow.lerp(_radGlow, 0.7 * rk);
        env.zenith.lerp(
          _radZen.copy(_radZen0).multiplyScalar(nightDim),
          0.75 * rk,
        );
        env.horizon.lerp(
          _radHor.copy(_radHor0).multiplyScalar(nightDim),
          0.55 * rk,
        );
        env.hemiInt *= 1 - 0.22 * rk;
        env.exposure *= 1 - 0.14 * rk * (1 - env.night);
      }
      // lightning
      env.flash = W.flash || 0;
      if (env.flash > 0.001) {
        env.flashColor.copy(W.flashColor);
        env.hemiInt += env.flash * 2.2;
        env.hemiSky.lerp(env.flashColor, clamp(env.flash, 0, 1) * 0.6);
      }
    }

    // --- the key light dips while it hands over between sun and moon (hides the shadow flip at 06:00 / 19:00)
    env.lightInt *= 0.3 + 0.7 * smooth(0.0, 0.07, Math.abs(env.sunY));

    // --- height fog: dense in the streets, thinning above ~60-70 m (weather sets scale height & the uniform haze share)
    env.fogH = W && W.fogH ? W.fogH : 70;
    env.fogHaze = W && W.haze !== undefined ? W.haze : 0.12;
    env.fogH *= 1 - 0.15 * env.night; // cold night air pools the haze lower
    env.fogBase = 6;
    env.fogMax = 1;
    env.fogFar = 2000;
    // aerial perspective: climbing rays fade toward a desaturated horizon-sky tint (not the ground haze)
    const hl =
      env.horizon.r * 0.2126 + env.horizon.g * 0.7152 + env.horizon.b * 0.0722;
    env.fogSky
      .copy(env.horizon)
      .lerp(_grey.setRGB(hl, hl, hl), 0.3)
      .lerp(env.fogColor, 0.3);
    env.aerial = 0.85 * (1 - (W ? W.dust * 0.8 : 0));
    // forward scattering around the sun (warm dusk glow in the haze) or the moon (cold halo)
    const dayW = smooth(-0.05, 0.05, env.sunY);
    env.scatterDir.copy(dayW > 0.5 ? env.sunDir : env.moonDir);
    env.scatterColor.copy(env.lightColor);
    const lowSun = 1 - smooth(0.05, 0.5, Math.abs(env.sunY));
    env.scatter =
      (dayW > 0.5 ? 0.12 + 0.3 * lowSun : 0.06) *
      (W ? 1 - 0.75 * W.cloud * W.cloudDark : 1);

    // --- ambient bounce: sunlit streets & façades across the street light the shaded sides.
    // A shadowless fill from the anti-sun direction, slightly from below, in the warm ground-bounce colour.
    env.fillDir.set(-env.lightDir.x, 0, -env.lightDir.z);
    if (env.fillDir.lengthSq() < 1e-4) env.fillDir.set(-0.6, 0, -0.4);
    env.fillDir.normalize();
    env.fillDir.y = 0.32;
    env.fillDir.normalize();
    env.fillColor
      .copy(env.lightColor)
      .multiply(_bounceAlb)
      .lerp(env.hemiGround, 0.25);
    normColor(env.fillColor);
    env.fillInt = env.lightInt * 0.17 + env.hemiInt * 0.05;
  }
  const _bounceAlb = new THREE.Color("#c9b99a");
  const _radSky = new THREE.Color("#7c983a"),
    _radGround = new THREE.Color("#3c4a22"),
    _radKey = new THREE.Color("#c4ec8a");
  const _radGlow = new THREE.Color("#b8c64a"),
    _radZen0 = new THREE.Color("#1e2814"),
    _radHor0 = new THREE.Color("#7e8a3e");
  const _radZen = new THREE.Color(),
    _radHor = new THREE.Color();
  function normColor(c) {
    const m = Math.max(c.r, c.g, c.b, 1e-4);
    c.multiplyScalar(1 / m);
    return c;
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  ATMOS.setHour = function (h, opts) {
    h = Number(h);
    if (!isFinite(h)) return;
    const T = G.time;
    if (opts && opts.advanceDay && h < T.hour) T.day = (T.day || 1) + 1;
    T.hour = ((h % 24) + 24) % 24;
    A.envSnap = true;
    G.events.emit("hourChanged", T.hour);
  };
  /** Pass game hours (waiting/sleeping). */
  ATMOS.advanceHours = function (n) {
    const T = G.time;
    let h = T.hour + (Number(n) || 0);
    while (h >= 24) {
      h -= 24;
      T.day = (T.day || 1) + 1;
      G.events.emit("dayChanged", T.day);
    }
    T.hour = h;
    A.envSnap = true;
    G.events.emit("hourChanged", T.hour);
  };
  ATMOS.getHour = () => G.time.hour;
  /** Night = the sun is (mostly) below the horizon — the SAME measure the lighting uses, so sneak/detection agree with what you see. */
  ATMOS.isNight = () => env.night > 0.5;
  /** 0 = full day, 1 = full night (smooth). */
  ATMOS.nightFactor = () => env.night;
  /** Approximate ambient light level 0..1 at the camera/player (for sneak detection etc.). */
  ATMOS.lightLevel = function () {
    if (env.interior) return clamp(0.25 + env.hemiInt * 0.35, 0, 1);
    return clamp(
      0.18 +
        (1 - env.night) *
          0.75 *
          (A.weather ? 0.6 + 0.4 * A.weather.cur.sunMul : 1),
      0,
      1,
    );
  };
  ATMOS.getEnv = () => env;
  /** 12h clock string "9:45 AM" for UI. */
  ATMOS.clockString = function () {
    const h = G.time.hour,
      hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    const h12 = ((hh + 11) % 12) + 1;
    return h12 + ":" + (mm < 10 ? "0" : "") + mm + (hh < 12 ? " AM" : " PM");
  };

  A.addSystem({
    name: "timeofday",
    order: 10,
    init() {
      solve(0);
    },
    update(dt, realDt) {
      advance(dt);
      solve(realDt);
    },
  });
})();
