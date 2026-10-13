// play-inline-46 04 — three
// Lines 542-742 of readable/play-inline-46.pretty.js (statement-aligned).
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

