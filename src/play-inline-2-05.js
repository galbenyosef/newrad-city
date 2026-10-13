// play-inline-2 05 — origin
// Lines 2652-3099 of readable/play-inline-2.pretty.js (statement-aligned).
  const INTERIORS = {
    cryo_c9: {
      owner: "map",
      origin: { x: 4000, y: 0, z: 0 },
      name: "Cryo Unit C-9",
    },
    subway: {
      owner: "map",
      origin: { x: 4000, y: 0, z: 400 },
      name: "42nd Street Subway Tunnels",
    },
    empire_lobby: {
      owner: "landmarks_a",
      origin: { x: 4000, y: 0, z: 800 },
      name: "Empire State Building — Lobby",
    },
    liberty_pedestal: {
      owner: "landmarks_b",
      origin: { x: 4000, y: 0, z: 1200 },
      name: "Statue of Liberty — Pedestal",
    },
    spare_1: {
      owner: "quests",
      origin: { x: 4400, y: 0, z: 0 },
      name: "(quest interior 1)",
    },
    spare_2: {
      owner: "quests",
      origin: { x: 4400, y: 0, z: 400 },
      name: "(quest interior 2)",
    },

    // ---- NEW POI interiors: 400 m grid east of the world. Build within origin ±150 m, y -40..80. ----
    amnh: {
      owner: "poi_uptown",
      origin: { x: 5000, y: 0, z: 0 },
      name: "American Museum of Natural History",
    },
    dakota: {
      owner: "poi_uptown",
      origin: { x: 5000, y: 0, z: 400 },
      name: "The Dakota",
    },
    plaza_hotel: {
      owner: "poi_uptown",
      origin: { x: 5000, y: 0, z: 800 },
      name: "The Plaza Hotel",
    },
    carnegie_hall: {
      owner: "poi_uptown",
      origin: { x: 5000, y: 0, z: 1200 },
      name: "Carnegie Hall",
    },
    tiffany: {
      owner: "poi_uptown",
      origin: { x: 5000, y: 0, z: 1600 },
      name: "Tiffany & Co.",
    },
    waldorf: {
      owner: "poi_midtown",
      origin: { x: 5400, y: 0, z: 0 },
      name: "Waldorf-Astoria",
    },
    msg: {
      owner: "poi_midtown",
      origin: { x: 5400, y: 0, z: 400 },
      name: "Madison Square Garden",
    },
    penn_station: {
      owner: "poi_midtown",
      origin: { x: 5400, y: 0, z: 800 },
      name: "Pennsylvania Station",
    },
    metlife_tower: {
      owner: "poi_midtown",
      origin: { x: 5400, y: 0, z: 1200 },
      name: "Metropolitan Life Tower",
    },
    bellevue: {
      owner: "poi_midtown",
      origin: { x: 5400, y: 0, z: 1600 },
      name: "Bellevue Hospital",
    },
    chelsea_hotel: {
      owner: "poi_village",
      origin: { x: 5800, y: 0, z: 0 },
      name: "Hotel Chelsea",
    },
    village_vanguard: {
      owner: "poi_village",
      origin: { x: 5800, y: 0, z: 400 },
      name: "Village Vanguard",
    },
    katz_deli: {
      owner: "poi_village",
      origin: { x: 5800, y: 0, z: 800 },
      name: "Katz's Delicatessen",
    },
    chinatown: {
      owner: "poi_village",
      origin: { x: 5800, y: 0, z: 1200 },
      name: "Chinatown — Remnant Bunker",
    },
    tombs: {
      owner: "poi_village",
      origin: { x: 5800, y: 0, z: 1600 },
      name: "The Tombs",
    },
    trinity_church: {
      owner: "poi_financial",
      origin: { x: 6200, y: 0, z: 0 },
      name: "Trinity Church",
    },
    federal_reserve: {
      owner: "poi_financial",
      origin: { x: 6200, y: 0, z: 400 },
      name: "Federal Reserve Bank — Gold Vault",
    },
    fraunces_tavern: {
      owner: "poi_financial",
      origin: { x: 6200, y: 0, z: 800 },
      name: "Fraunces Tavern",
    },
    seaport: {
      owner: "poi_financial",
      origin: { x: 6200, y: 0, z: 1200 },
      name: "South Street Seaport",
    },
    ellis_island: {
      owner: "poi_harbor",
      origin: { x: 6600, y: 0, z: 0 },
      name: "Ellis Island — Registry Room",
    },
    domino_sugar: {
      owner: "poi_harbor",
      origin: { x: 6600, y: 0, z: 400 },
      name: "Brooklyn Sugar Works",
    },
    uss_hudson: {
      owner: "poi_harbor",
      origin: { x: 6600, y: 0, z: 800 },
      name: "USS Hudson",
    },
    // ---- interiors for existing landmarks that lacked them (landmark_interiors module) ----
    un_assembly: {
      owner: "landmark_interiors",
      origin: { x: 7000, y: 0, z: 0 },
      name: "UN General Assembly Hall",
    },
    rockefeller_30rock: {
      owner: "landmark_interiors",
      origin: { x: 7000, y: 0, z: 400 },
      name: "30 Rockefeller Plaza — Iron Covenant Citadel",
    },
    nyse_floor: {
      owner: "landmark_interiors",
      origin: { x: 7000, y: 0, z: 800 },
      name: "NYSE Trading Floor",
    },
    woolworth_lobby: {
      owner: "landmark_interiors",
      origin: { x: 7000, y: 0, z: 1200 },
      name: "Woolworth Building",
    },
    city_hall_rotunda: {
      owner: "landmark_interiors",
      origin: { x: 7000, y: 0, z: 1600 },
      name: "City Hall",
    },
    flatiron_interior: {
      owner: "landmark_interiors",
      origin: { x: 7000, y: 0, z: 2000 },
      name: "Flatiron Building",
    },
    // ---- POI wave 2 interiors (x 7400..9400 grid) ----
    roosevelt_octagon: {
      owner: "poi_roosevelt",
      origin: { x: 7400, y: 0, z: 0 },
      name: "The Octagon (Blackwell's Island Asylum)",
    },
    smallpox_hospital: {
      owner: "poi_roosevelt",
      origin: { x: 7400, y: 0, z: 400 },
      name: "Renwick Smallpox Hospital",
    },
    queensboro_bridge: {
      owner: "poi_bridges",
      origin: { x: 7400, y: 0, z: 800 },
      name: "Queensboro Bridge & Bridgemarket",
    },
    manhattan_bridge: {
      owner: "poi_bridges",
      origin: { x: 7400, y: 0, z: 1200 },
      name: "Manhattan Bridge",
    },
    frick: {
      owner: "poi_ues",
      origin: { x: 7400, y: 0, z: 1600 },
      name: "The Frick Collection",
    },
    cooper_hewitt: {
      owner: "poi_ues",
      origin: { x: 7400, y: 0, z: 2000 },
      name: "Carnegie Mansion (Cooper Hewitt)",
    },
    gracie_mansion: {
      owner: "poi_ues",
      origin: { x: 7800, y: 0, z: 0 },
      name: "Gracie Mansion",
    },
    park_ave_armory: {
      owner: "poi_ues",
      origin: { x: 7800, y: 0, z: 400 },
      name: "Park Avenue Armory",
    },
    ansonia: {
      owner: "poi_uws",
      origin: { x: 7800, y: 0, z: 800 },
      name: "The Ansonia",
    },
    san_remo: {
      owner: "poi_uws",
      origin: { x: 7800, y: 0, z: 1200 },
      name: "The San Remo",
    },
    bellamys: {
      owner: "poi_uws",
      origin: { x: 7800, y: 0, z: 1600 },
      name: "Bellamy's",
    },
    ed_sullivan: {
      owner: "poi_theater",
      origin: { x: 7800, y: 0, z: 2000 },
      name: "Ed Sullivan Theater",
    },
    lyceum_theatre: {
      owner: "poi_theater",
      origin: { x: 8200, y: 0, z: 0 },
      name: "Lyceum Theatre",
    },
    port_authority: {
      owner: "poi_theater",
      origin: { x: 8200, y: 0, z: 400 },
      name: "Port Authority Bus Terminal",
    },
    moma: {
      owner: "poi_midtown2",
      origin: { x: 8200, y: 0, z: 800 },
      name: "Museum of Modern Art",
    },
    algonquin: {
      owner: "poi_midtown2",
      origin: { x: 8200, y: 0, z: 1200 },
      name: "The Algonquin Hotel",
    },
    morgan_library: {
      owner: "poi_midtown2",
      origin: { x: 8200, y: 0, z: 1600 },
      name: "The Morgan Library",
    },
    journal_bldg: {
      owner: "poi_eastside",
      origin: { x: 8200, y: 0, z: 2000 },
      name: "First Journal Building",
    },
    tudor_city: {
      owner: "poi_eastside",
      origin: { x: 8600, y: 0, z: 0 },
      name: "Tudor City",
    },
    new_york_life: {
      owner: "poi_eastside",
      origin: { x: 8600, y: 0, z: 400 },
      name: "New York Life Building",
    },
    hotel_new_yorker: {
      owner: "poi_herald",
      origin: { x: 8600, y: 0, z: 800 },
      name: "Hotel New Yorker",
    },
    automat: {
      owner: "poi_herald",
      origin: { x: 8600, y: 0, z: 1200 },
      name: "Penny & Price Automat",
    },
    empire_diner: {
      owner: "poi_herald",
      origin: { x: 8600, y: 0, z: 1600 },
      name: "Empire Diner",
    },
    high_line: {
      owner: "poi_chelsea",
      origin: { x: 8600, y: 0, z: 2000 },
      name: "The High Line",
    },
    nabisco_factory: {
      owner: "poi_chelsea",
      origin: { x: 9000, y: 0, z: 0 },
      name: "National Biscuit Company Factory",
    },
    webster_hall: {
      owner: "poi_chelsea",
      origin: { x: 9000, y: 0, z: 400 },
      name: "Webster Hall",
    },
    cooper_union: {
      owner: "poi_eastvillage",
      origin: { x: 9000, y: 0, z: 800 },
      name: "Cooper Union Foundation Building",
    },
    orourkes: {
      owner: "poi_eastvillage",
      origin: { x: 9000, y: 0, z: 1200 },
      name: "O'Rourke's Old Ale House",
    },
    tammany_hall: {
      owner: "poi_eastvillage",
      origin: { x: 9000, y: 0, z: 1600 },
      name: "Tammany Hall",
    },
    police_hq: {
      owner: "poi_civic",
      origin: { x: 9000, y: 0, z: 2000 },
      name: "Police Headquarters",
    },
    municipal_building: {
      owner: "poi_civic",
      origin: { x: 9400, y: 0, z: 0 },
      name: "Manhattan Municipal Building",
    },
    old_st_patricks: {
      owner: "poi_civic",
      origin: { x: 9400, y: 0, z: 400 },
      name: "Old St. Patrick's Cathedral",
    },
    st_pauls_chapel: {
      owner: "poi_wallst",
      origin: { x: 9400, y: 0, z: 800 },
      name: "St. Paul's Chapel",
    },
    singer_building: {
      owner: "poi_wallst",
      origin: { x: 9400, y: 0, z: 1200 },
      name: "Singer Building",
    },
    forty_wall: {
      owner: "poi_wallst",
      origin: { x: 9400, y: 0, z: 1600 },
      name: "40 Wall Street (Bank of Manhattan)",
    },
    custom_house: {
      owner: "poi_wallst",
      origin: { x: 9400, y: 0, z: 2000 },
      name: "Alexander Hamilton Custom House",
    },
    // ---- The Neon (Times Square) — all 18 approved places share one interior cell (see TIMES_SQUARE_PLAN.md) ----
    neon_interiors: {
      owner: "landmarks_a",
      origin: { x: 11000, y: 0, z: 0 },
      name: "The Neon (Times Square)",
    },
    // ---- POI wave 3 interiors (x 9800..10600 grid) ----
    club_52: {
      owner: "poi_midtown3",
      origin: { x: 9800, y: 0, z: 0 },
      name: "The 52 Club",
    },
    helmsley: {
      owner: "poi_midtown3",
      origin: { x: 9800, y: 0, z: 400 },
      name: "New York Central Building",
    },
    farley_post_office: {
      owner: "poi_penn",
      origin: { x: 9800, y: 0, z: 800 },
      name: "James A. Farley Post Office",
    },
    hotel_pennsylvania: {
      owner: "poi_penn",
      origin: { x: 9800, y: 0, z: 1200 },
      name: "Hotel Pennsylvania",
    },
    jefferson_market: {
      owner: "poi_village3",
      origin: { x: 9800, y: 0, z: 1600 },
      name: "Jefferson Market Courthouse",
    },
    bedfords: {
      owner: "poi_village3",
      origin: { x: 9800, y: 0, z: 2000 },
      name: "Bedford's",
    },
    five_boro_tower: {
      owner: "poi_village3",
      origin: { x: 10200, y: 0, z: 0 },
      name: "Five Boroughs Tower of Light",
    },
    federal_hall: {
      owner: "poi_fidi3",
      origin: { x: 10200, y: 0, z: 400 },
      name: "Federal Hall",
    },
    bankers_trust: {
      owner: "poi_fidi3",
      origin: { x: 10200, y: 0, z: 800 },
      name: "Bankers Trust Building",
    },
    delmonicos: {
      owner: "poi_fidi3",
      origin: { x: 10200, y: 0, z: 1200 },
      name: "Delmonico's",
    },
    whitehall_terminal: {
      owner: "poi_harbor2",
      origin: { x: 10200, y: 0, z: 1600 },
      name: "Whitehall Ferry Terminal",
    },
    pier_a: {
      owner: "poi_harbor2",
      origin: { x: 10200, y: 0, z: 2000 },
      name: "Pier A",
    },
    empire_stores: {
      owner: "poi_harbor2",
      origin: { x: 10600, y: 0, z: 0 },
      name: "Empire Stores",
    },
    cp_zoo_arsenal: {
      owner: "poi_park",
      origin: { x: 10600, y: 0, z: 400 },
      name: "Central Park Zoo & Arsenal",
    },
    tavern_on_green: {
      owner: "poi_park",
      origin: { x: 10600, y: 0, z: 800 },
      name: "Tavern on the Green",
    },
    // ---- quests_extra: Cryo Unit C-4, the second (flooded) Project Long Winter site ----
    qx_cryo_c4: {
      owner: "quests_extra",
      origin: { x: 12600, y: 0, z: 2800 },
      name: "Cryo Unit C-4",
    },
  };

  // The new game begins inside Cryo Unit C-9 (the map module places the real spawn in the hero's
  // open pod); the service stair at the top of the cryo cell leads out to CRYO_EXIT, under the
  // Municipal Building's Chambers Street arch, looking west toward City Hall.
