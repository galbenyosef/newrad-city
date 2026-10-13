// play-inline-107 03 — motif
// Lines 359-600 of readable/play-inline-107.pretty.js (statement-aligned).
  K.neonDraw = function (key, w, h, draw) {
    if (K.atlases.neon.slots[key]) return K.atlases.neon.slots[key].rect;
    return K.atlases.neon.alloc(key, w * NEON_SC, h * NEON_SC, (x) => {
      x.scale(NEON_SC, NEON_SC);
      x.fillStyle = "#000";
      x.fillRect(0, 0, w, h);
      draw(x, w, h);
    }).rect;
  };

  // ------------------------------------------------------------------
  // Brand billboards → 'ads' atlas (400×200 cells)
  // ------------------------------------------------------------------
  // Keys are the shared brand ids of G.LAYOUT.BRANDS (core layout / textures module); the art and names are original.
  const BRAND_ART = {
    fizzo_cola: {
      name: "FIZZO COLA",
      slogan: "THE TALL COOL ONE!",
      bg: "#b3261e",
      fg: "#fff4e0",
      ac: "#ffd23f",
      motif: "bottle",
    },
    fizzo_blue: {
      name: "FIZZO BLUE",
      slogan: "THE ELECTRIC TASTE OF TOMORROW",
      bg: "#12305a",
      fg: "#7fe7ff",
      ac: "#3cc9ff",
      motif: "bottle_glow",
    },
    long_winter: {
      name: "CIVIL DEFENSE",
      slogan: "KNOW YOUR SHELTER · KNOW YOUR NEIGHBOR",
      bg: "#e8e4d8",
      fg: "#1a2a4a",
      ac: "#c81e1e",
      motif: "cd",
    },
    prairie_root_beer: {
      name: "Prairie Root Beer",
      slogan: "Old-time flavor, poured cold.",
      bg: "#e98a2c",
      fg: "#4a1d0e",
      ac: "#ffe08a",
      motif: "sun",
    },
    liberty_jetliner: {
      name: "LIBERTY JETLINER",
      slogan: "Fly the flag. Fly Liberty.",
      bg: "#1c2f5c",
      fg: "#f2eee2",
      ac: "#d23a2a",
      motif: "plane",
    },
    first_journal: {
      name: "THE FIRST JOURNAL",
      slogan: "You heard it here first.",
      bg: "#ece6d6",
      fg: "#1e3a66",
      ac: "#a01e1e",
      motif: "news",
    },
    pizza_galaxy: {
      name: "PIZZA GALAXY",
      slogan: "Out of this world. Into your mouth in 30 minutes.",
      bg: "#20103a",
      fg: "#ffcf40",
      ac: "#e8452c",
      motif: "pizza",
    },
    empire_brew: {
      name: "EMPIRE BREW HOUSE",
      slogan: "Brewed in Brooklyn. Poured everywhere.",
      bg: "#1e4a34",
      fg: "#f0e0b0",
      ac: "#e8b030",
      motif: "beer",
    },
    silver_torch: {
      name: "SILVER TORCH",
      slogan: "Light up like the lady in the harbor.",
      bg: "#26323e",
      fg: "#e8eaee",
      ac: "#ffcf60",
      motif: "torch",
    },
    burger_brigade: {
      name: "BURGER BRIGADE",
      slogan: "Fifteen cents. Fifteen seconds.",
      bg: "#c8281e",
      fg: "#fff0c8",
      ac: "#ffd23f",
      motif: "burger",
    },
    excalibur_gardens: {
      name: "EXCALIBUR GARDENS",
      slogan: "COMING SOON · Summer 1967. Your kingdom awaits.",
      bg: "#3a2a6a",
      fg: "#f0d070",
      ac: "#8ad0a0",
      motif: "castle",
    },
    junior_rocketeer: {
      name: "JUNIOR ROCKETEER CO.",
      slogan: "Real science. Real rockets.",
      bg: "#e8e4d8",
      fg: "#c8281e",
      ac: "#1f4f8a",
      motif: "rocket",
    },
    miracle_mane: {
      name: "DR. THATCHER'S MIRACLE MANE",
      slogan: "Grows hair on anything. Anything.",
      bg: "#2a4a3a",
      fg: "#f0e0b0",
      ac: "#c8a040",
      motif: "tonic",
    },
    big_apple_cab: {
      name: "BIG APPLE MOTOR CAB",
      slogan: "Just get in already!",
      bg: "#e0b020",
      fg: "#151515",
      ac: "#c8201a",
      motif: "apple",
    },
    mama_marinara: {
      name: "MAMA MARINARA'S",
      slogan: "Just add water. Mama will never know.",
      bg: "#c42a1e",
      fg: "#f6ead0",
      ac: "#f6d860",
      motif: "can",
    },
    hi_octane: {
      name: "HI-OCTANE HARRY'S",
      slogan: "Full service. Full tank. Full speed ahead.",
      bg: "#f0e6d0",
      fg: "#c01e1e",
      ac: "#1c1c1c",
      motif: "pump",
    },
    vigil: {
      name: "VIGIL DEFENSE",
      slogan: "Protecting America Always",
      bg: "#13263a",
      fg: "#cfeefa",
      ac: "#e8a040",
      motif: "goggles",
    },
    freedom_flakes: {
      name: "FREEDOM FLAKES",
      slogan: "The breakfast of a free nation.",
      bg: "#1e3f86",
      fg: "#f6eedc",
      ac: "#f0c040",
      motif: "bowl",
    },
    chocolate_zeppelin: {
      name: "CHOCOLATE ZEPPELIN",
      slogan: "Lighter than air. Sweeter than pie.",
      bg: "#7ab0d8",
      fg: "#3a1e10",
      ac: "#5a3420",
      motif: "zeppelin",
    },
    golden_plain: {
      name: "GOLDEN PLAIN JERKY",
      slogan: "Tough enough for any trail.",
      bg: "#d8a838",
      fg: "#4a2410",
      ac: "#fff0b0",
      motif: "plain",
    },
    homeguard: {
      name: "HOMEGUARD",
      slogan: "Defending the American kitchen.",
      bg: "#e8e4d8",
      fg: "#1a3a6a",
      ac: "#c42a22",
      motif: "can",
    },
    lonly_tv: {
      name: "LONLY",
      slogan: "The best company in the house.",
      bg: "#2a2a2a",
      fg: "#ffcc33",
      ac: "#e8e8e8",
      motif: "tv",
    },
    eagle_motors: {
      name: "EAGLE MOTORS",
      slogan: "Freedom to Explore",
      bg: "#2a5a7a",
      fg: "#f0e8d0",
      ac: "#ffd23f",
      motif: "car",
    },
    super_sergeant: {
      name: "SUPER SERGEANT",
      slogan: "America's finest fighting man!",
      bg: "#f0d040",
      fg: "#b8261c",
      ac: "#5a6234",
      motif: "chevrons",
    },
    american_automaton: {
      name: "AMERICAN AUTOMATON CO.",
      slogan: "Built in America, to serve America.",
      bg: "#d8d0b8",
      fg: "#1f3f6a",
      ac: "#a0281e",
      motif: "robot",
    },
    forever_franks: {
      name: "FOREVER FRANKS",
      slogan: "So good they'll outlive you!",
      bg: "#f0e4c4",
      fg: "#b01a14",
      ac: "#8a5a10",
      motif: "franks",
    },
    sky_patrol: {
      name: "SKY PATROL",
      slogan: "Defend The Skyline! Now At Arcades",
      bg: "#0c0c14",
      fg: "#ffb347",
      ac: "#ff3c3c",
      motif: "missile",
    },
    worlds_fair: {
      name: "WORLD'S FAIR '64",
      slogan: "Peace Through Understanding",
      bg: "#16406e",
      fg: "#f4f0e0",
      ac: "#f0a830",
      motif: "star",
    },
  };
  K.BRAND_ART = BRAND_ART;

