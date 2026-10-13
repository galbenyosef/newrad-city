/* src/arcade/00_core.js */
/* =====================================================================
 * NEW RAD CITY — ARCADE & COLLECTIBLES (module arcade, order 57)
 * 00_core.js — namespace, data tables, run state, items, rewards, save/load.
 *
 *   G.arcade = {
 *     play(gameId, {cabinet, force})                   stand at a cabinet and play (state 'arcade', cabinet screen)
 *     open(tab?) / close() / isOpen() / toggle()        collections ledger (state 'arcade', key K)
 *     games() / highScores(id) / houseRecord(id)
 *     cabinets() → [{id, game, style, area, x, z}]
 *     collectibles() → {minis:{found,total,list}, keys:{found,total,list}, cabinets:{found,total}}
 *     collect(kind, id)                                 (debug / quests) mark a collectible as found: 'mini' | 'key'
 *     stats()
 *   }
 * The three games are played ONLY on physical arcade cabinets placed in the
 * world (40_world.js): Sky Patrol, Catacomb Crawl, Steelworks.
 * The collections ledger also tracks the landmark miniatures and the
 * KEYS TO THE CITY: sixteen ceremonial gold keys Mayor Delahunt presented to
 * dignitaries before 1967. All sixteen open the Mayor's sealed vault under
 * Gracie Mansion (built by poi_ues, 35_gracie_vault.js).
 * Other files of this module extend the private hub `G.arcade._` (alias AR).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;

  // ------------------------------------------------------------------
  // Hub (shared between this module's files)
  // ------------------------------------------------------------------
  const AR = {
    games: {}, // gameId → game implementation (registered by 30_* files)
    STATE: null, // run state (per playthrough; saved)
    ui: null, // cabinet screen + ledger overlay (20_crt.js)
    audio: null, // cabinet sound chip (10_audio.js)
    world: null, // cabinets & collectibles in the world (40_world.js)
    KEY: "KeyK", // opens the collections ledger
  };

  // ------------------------------------------------------------------
  // Data: the cabinet games. board = the high-score table burned into the
  // cabinet's memory before the bombs (its top line is the "house record").
  // ------------------------------------------------------------------
  AR.GAME_DEFS = [
    {
      id: "skypatrol",
      title: "SKY PATROL",
      sub: "SAUCER RAID ON MANHATTAN",
      maker: "Starline Amusements · 1965",
      goal: "Hold the line through Wave 5",
      style: "space",
      art: { bg: "#0b1030", a: "#ffd23a", b: "#ff4a8a", c: "#5fe0ff" },
      board: [
        ["DOT", 8800],
        ["GUS", 7150],
        ["ACE", 5600],
        ["MAX", 4200],
        ["LOU", 2900],
      ],
      blurb:
        "Saucers from beyond the Moon are raining fire on the greatest skyline in the world. Three flak batteries. " +
        "Six landmarks. One steady hand on the trackball. Aim ahead of the falling bombs and let the sky light up.",
    },
    {
      id: "catacomb",
      title: "CATACOMB CRAWL",
      sub: "THE CROWN OF THE BONE KING",
      maker: "Empire Coin Machine Co. · 1966",
      goal: "Defeat the Bone King",
      style: "chrome",
      art: { bg: "#1a0d06", a: "#ffb347", b: "#c04aff", c: "#f2e6c8" },
      board: [
        ["RAY", 3000],
        ["BEA", 2400],
        ["SAL", 1800],
        ["VIC", 1200],
        ["IDA", 700],
      ],
      blurb:
        "Five floors down, under the ruined abbey of Greyhollow, the Bone King sits on a throne of his own subjects, " +
        "wearing the Sunstone Crown. Sir Bran does not read maps. Sir Bran does not knock. Sir Bran goes DOWN.",
    },
    {
      id: "steelworks",
      title: "STEELWORKS",
      sub: "TOPPING OUT ON 34TH STREET",
      maker: "Bowery Amusement Works · 1964",
      goal: "Top out three towers",
      style: "wood",
      art: { bg: "#1c0a0a", a: "#ff6a2a", b: "#ffd23a", c: "#7ad0ff" },
      board: [
        ["MAC", 9500],
        ["JOE", 8000],
        ["RIV", 6200],
        ["PAT", 4400],
        ["DEE", 3000],
      ],
      blurb:
        "Goliath, the runaway steam riveter, has climbed the steelwork of a half-built tower and is rolling red-hot " +
        "rivet kegs down the girders. Climb the ladders, hop the kegs, ring the topping-out bell. Hard hats required.",
    },
  ];
  AR.gameDef = (id) => AR.GAME_DEFS.find((g) => g.id === id) || null;

  // ------------------------------------------------------------------
  // Data: arcade cabinets in the world.
  //   fixed: exact floor spot (inside a venue other modules built; checked by hand against its furniture), yaw faces the room
  //   hint : street-level search origin (spiral spot finder) — cabinets hauled out to the sidewalk, run off a car battery
  // ------------------------------------------------------------------
  AR.CABINETS = [
    // The Rad Room (Times Square, the Neon): west wall, either side of the door (door opening z -294.7 … -292.3)
    {
      id: "rr_skypatrol",
      game: "skypatrol",
      style: "space",
      fixed: { x: -19.04, z: -296.4, yaw: Math.PI / 2 },
      area: "the Rad Room, Times Square",
      indoor: true,
    },
    {
      id: "rr_steelworks",
      game: "steelworks",
      style: "wood",
      fixed: { x: -19.04, z: -295.6, yaw: Math.PI / 2 },
      area: "the Rad Room, Times Square",
      indoor: true,
    },
    {
      id: "rr_catacomb",
      game: "catacomb",
      style: "chrome",
      fixed: { x: -19.04, z: -290.5, yaw: Math.PI / 2 },
      area: "the Rad Room, Times Square",
      indoor: true,
    },
    // street level
    {
      id: "st_radiocity",
      game: "catacomb",
      style: "chrome",
      hint: { x: 0, z: -320 },
      area: "Radio City",
      battery: true,
    },
    {
      id: "st_grandcentral",
      game: "steelworks",
      style: "wood",
      hint: { x: 240, z: -183 },
      area: "Grand Central",
      battery: true,
    },
    {
      id: "st_park",
      game: "skypatrol",
      style: "space",
      hint: { x: -57, z: -692 },
      allowSite: true,
      area: "Central Park",
      battery: true,
    },
  ];
  AR.cabinetDef = (id) => AR.CABINETS.find((c) => c.id === id) || null;

  // ------------------------------------------------------------------
  // Data: landmark miniatures (die-cast souvenirs) — one per NYC landmark
  // hint: search origin for a free outdoor spot; allowSite: open plaza/park site
  // ------------------------------------------------------------------
  AR.MINIS = [
    {
      id: "empire",
      name: "Empire State Building",
      site: "empire_state",
      hint: { x: 44, z: -72 },
      desc: "The Empire State Building in painted pot metal, three inches tall. The mast is a bent pin. It still stands straighter than the real one.",
    },
    {
      id: "liberty",
      name: "Statue of Liberty",
      site: "statue_of_liberty",
      hint: { x: -395, z: 1226 },
      allowSite: true, // on the island by the ferry dock
      desc: "Lady Liberty, torch held high, painted that hopeful copper-green. Somebody has touched up the flame with nail varnish.",
    },
    {
      id: "chrysler",
      name: "Chrysler Building",
      site: "chrysler",
      hint: { x: 286, z: -208 },
      desc: "The Chrysler spire in miniature, every sunburst window picked out in silver paint. Made in Newark. Says so on the bottom.",
    },
    {
      id: "bridge",
      name: "Brooklyn Bridge",
      site: "brooklyn_bridge",
      hint: { x: 132, z: 662 },
      desc: 'Two gothic towers and a web of silver thread. "GREETINGS FROM BROOKLYN" on the base, half scratched away.',
    },
    {
      id: "grand_central",
      name: "Grand Central Terminal",
      site: "grand_central",
      hint: { x: 204, z: -230 },
      desc: "The Beaux-Arts facade with a gold clock face no bigger than a shirt button. The clock says 9:47. Someone painted it that way on purpose.",
    },
    {
      id: "flatiron",
      name: "Flatiron Building",
      site: "flatiron",
      hint: { x: 150, z: 86 },
      desc: "A wedge of a building on a felt-bottomed base. It looks like it is sailing up Fifth Avenue, which it has been doing for eighty-odd years.",
    },
    {
      id: "times_square",
      name: "Times Square",
      site: "times_square",
      hint: { x: -40, z: -262 },
      allowSite: true,
      desc: "A crush of tiny billboards around a tinier ball drop. The paint is supposed to be neon. It is mostly rust now.",
    },
    {
      id: "central_park",
      name: "Central Park",
      site: "bethesda",
      hint: { x: 0, z: -560 },
      allowSite: true,
      desc: "The Angel of the Waters over her fountain, ringed by little bottle-brush trees. Greener than anything left around the real one.",
    },
  ];

  // ------------------------------------------------------------------
  // Data: the Keys to the City. Sixteen ceremonial gold keys Mayor Francis X.
  // Delahunt (and the two mayors before him) presented between 1954 and 1967.
  // Every one was cut with a working bit: together they open the Mayor's
  // vault under Gracie Mansion. In February 1967 the Mayor's office began
  // calling them home for an exhibition ("The Keys Come Home", Gracie
  // Mansion, Sunday March 12, 1967); on March 5 they were wherever this
  // table says.
  //   site + anchors : where the key lies (landmark / POI anchor names, tried in order);
  //                    the key is set down on a free floor spot near the anchor
  //   set            : what it lies on — 'case' (display case), 'desk' (writing desk),
  //                    'suite' (hotel side table + lamp), 'lectern' (presentation lectern)
  //   hint           : exterior map position (filled in below from the site's location)
  // ------------------------------------------------------------------
  AR.KEYS = [
    {
      id: "ck_ellis",
      no: 1,
      year: 1954,
      who: "Mrs. Maria Calabrese",
      title:
        "the ten-millionth arrival through the Port of New York (honorary)",
      kept: "Lent to the Ellis Island records office for the exhibition, and still waiting on a desk there for the courier.",
      area: "Ellis Island",
      site: "ellis_island",
      anchors: ["records", "office", "registrar"],
      set: "desk",
    },
    {
      id: "ck_armory",
      no: 2,
      year: 1955,
      who: "General Amos T. Whitfield",
      title: "Commanding General, First Army",
      kept: "In the regimental trophy case of the Park Avenue Armory, beside his own portrait.",
      area: "Upper East Side",
      site: "park_ave_armory",
      anchors: ["veterans", "upper_hall", "hall"],
      set: "case",
    },
    {
      id: "ck_hotelpenn",
      no: 3,
      year: 1956,
      who: "Rube Kowalski",
      title: "Brooklyn's own twenty-five-game winner",
      kept: "In his room at the Hotel Pennsylvania. He came in for the exhibition early and never checked out.",
      area: "Midtown South",
      site: "hotel_pennsylvania",
      anchors: ["loot2", "loot1", "loot3"],
      set: "suite",
    },
    {
      id: "ck_frick",
      no: 4,
      year: 1957,
      who: "Prince Konstantin von Albrechtsberg",
      title: "collector and patron of the arts, Bonn",
      kept: "Lent to the Frick Collection, and shown in its library with his letter of thanks.",
      area: "Upper East Side",
      site: "frick",
      anchors: ["library", "dining", "north_hall"],
      set: "case",
    },
    {
      id: "ck_nypl",
      no: 5,
      year: 1958,
      who: "Mme. Simone Aubert",
      title: "novelist, of Paris",
      kept: 'Left on a desk in the Public Library after her reading, with a note: "for the city that reads."',
      area: "Midtown",
      site: "nypl",
      anchors: ["books", "hall", "terminal"],
      set: "desk",
    },
    {
      id: "ck_algonquin",
      no: 6,
      year: 1959,
      who: "Mr. Desmond Hale",
      title: 'playwright ("The Long Lease")',
      kept: "In the library of the Algonquin Hotel, where he wrote the second act.",
      area: "Midtown",
      site: "algonquin",
      anchors: ["library", "scriptorium", "writer"],
      set: "desk",
    },
    {
      id: "ck_fedhall",
      no: 7,
      year: 1960,
      who: "President Charles-Edouard Mercier",
      title: "President of the French Republic",
      kept: "In a display case at Federal Hall, where he laid a wreath and promised that France and New York would never quarrel.",
      area: "Financial District",
      site: "federal_hall",
      anchors: ["loot1", "loot2", "throne"],
      set: "case",
    },
    {
      id: "ck_carnegie",
      no: 8,
      year: 1960,
      who: "Maestro Anton Reisz",
      title: "conductor, of Vienna",
      kept: "In the green room at Carnegie Hall, propped against the score of his last concert here.",
      area: "Midtown",
      site: "carnegie_hall",
      anchors: ["greenroom", "office", "lobby"],
      set: "case",
    },
    {
      id: "ck_waldorf",
      no: 9,
      year: 1961,
      who: "H.E. Henri-Paul Lavergne",
      title: "Ambassador of the French Republic to the United Nations",
      kept: "In his suite in the Waldorf Towers. He was recalled to Paris on the Thursday and did not pack it.",
      area: "Midtown East",
      site: "waldorf",
      anchors: ["suite", "radio", "loot1"],
      set: "suite",
    },
    {
      id: "ck_met",
      no: 10,
      year: 1962,
      who: "Capt. Jacques Morel",
      title: "and the crew of the bathyscaphe Abyssal",
      kept: "Lent to the Metropolitan Museum and shown in the Great Hall, under the bathyscaphe's logbook.",
      area: "Upper East Side",
      site: "met",
      anchors: ["great_hall", "info_desk", "balcony"],
      set: "case",
    },
    {
      id: "ck_morgan",
      no: 11,
      year: 1962,
      who: "H.E. Kwame Asante",
      title: "first Ambassador of Ghana to the United Nations",
      kept: "Lent to the Morgan Library for its exhibition of letters to the city.",
      area: "Murray Hill",
      site: "morgan_library",
      anchors: ["east_room", "study", "rotunda"],
      set: "case",
    },
    {
      id: "ck_un",
      no: 12,
      year: 1963,
      who: "Dr. Ingrid Solvang",
      title: "President of the United Nations General Assembly",
      kept: "In a display case at United Nations Headquarters, which she said was the only proper home for it.",
      area: "Midtown East",
      site: "un_hq",
      anchors: ["sky_eye_room", "loot1", "terminal"],
      set: "case",
    },
    {
      id: "ck_customs",
      no: 13,
      year: 1964,
      who: "Admiral Sir Geoffrey Ashcombe",
      title: "Royal Navy, for the visiting tall-ships flotilla",
      kept: "On the Collector's desk at the Custom House, waiting to be signed for.",
      area: "Battery Park",
      site: "custom_house",
      anchors: ["office", "evidence", "rotunda"],
      set: "desk",
    },
    {
      id: "ck_plaza",
      no: 14,
      year: 1964,
      who: "H.S.H. Princess Marie-Clemence",
      title: "of Monteval",
      kept: "In the Presidential Suite at the Plaza, where she spent the winter of 1967.",
      area: "Central Park South",
      site: "plaza_hotel",
      anchors: ["presidential", "suite610", "palm_court"],
      set: "suite",
    },
    {
      id: "ck_tavern",
      no: 15,
      year: 1965,
      who: "Contessa Lucia Varzi",
      title: "soprano, of La Scala",
      kept: "At Tavern on the Green. She left it with her coat and never came back for either.",
      area: "Central Park",
      site: "tavern_on_green",
      anchors: ["loot1", "loot2", "loot3"],
      set: "desk",
    },
    {
      id: "ck_cityhall",
      no: 16,
      year: 1967,
      who: "the crew of Liberty Seven",
      title: "Cmdr. Wes Kittredge, Maj. Dale Okafor and Lt. Cmdr. Ray Sobel",
      kept: "Never presented. On the lectern at City Hall, ready for the ceremony on Monday, March 6, 1967.",
      area: "Civic Center",
      site: "city_hall",
      anchors: ["rotunda", "desk", "entrance"],
      set: "lectern",
    },
  ];
  /** Exterior map position of a key's site (its LOCATION, else the site centre). */
  AR.keyHint = function (q) {
    if (q.hint) return q.hint;
    const L = G.LAYOUT;
    let h = null;
    try {
      const loc = L && L.getLocation ? L.getLocation(q.site) : null;
      if (loc && isFinite(loc.x)) h = { x: loc.x, z: loc.z };
    } catch (e) {
      h = null;
    }
    if (!h) {
      try {
        const st = L && L.getSite ? L.getSite(q.site) : null;
        if (st) h = { x: (st.x0 + st.x1) / 2, z: (st.z0 + st.z1) / 2 };
      } catch (e) {
        h = null;
      }
    }
    q.hint = h || { x: 0, z: 0 };
    return q.hint;
  };
  AR.keyDef = (id) => AR.KEYS.find((q) => q.id === id) || null;
  AR.ITEM_KEY = "arc_city_key"; // one per key found (stack)
  AR.ITEM_KEYRING = "arc_city_keyring"; // all sixteen, threaded on the Mayor's ribbon (opens the vault)
  AR.VAULT_LOCK = "ues_gracie_vault"; // registered by poi_ues (35_gracie_vault.js)

  // ------------------------------------------------------------------
  // Rewards (collection milestones) — paid automatically
  // ------------------------------------------------------------------
  AR.REWARDS = {
    minis: [
      {
        n: 4,
        id: "minis4",
        text: "Collector's bounty: 400 Scrip",
        scrip: 400,
        xp: 100,
      },
      {
        n: 8,
        id: "minis8",
        text: "Complete set! 1,000 Scrip, Persuasion +5, Trade +5",
        scrip: 1000,
        xp: 300,
        skills: { persuasion: 5, trade: 5 },
        final: true,
      },
    ],
    keys: [
      {
        n: 16,
        id: "keys16",
        text: "All sixteen, threaded on the Mayor's ribbon: the Keys to the City. They open the Mayor's vault under Gracie Mansion.",
        xp: 300,
        keyring: true,
        final: true,
      },
    ],
  };
  AR.XP_MINI = 75;
  AR.XP_KEY = 40;
  AR.XP_CHAMPION = 100;
  AR.XP_RECORD = 50;

  // ------------------------------------------------------------------
  // Run state
  // ------------------------------------------------------------------
  function freshState() {
    return {
      minis: new Set(),
      keys: new Set(), // found (world pickups taken)
      cabinets: new Set(), // cabinet ids the player has played at
      rewards: new Set(), // milestone ids paid
      champion: new Set(), // game ids "beaten" (goal reached)
      records: new Set(), // game ids whose house record the player has broken
      scores: {}, // gameId → [{score, name, day}] (top 5, the player's runs)
      plays: {}, // gameId → count
    };
  }
  AR.STATE = freshState();
  AR.reset = function () {
    AR.STATE = freshState();
  };

  // All-time best per game survives across saves (like a real cabinet's memory), localStorage.
  const LS_KEY = "nrc_arcade_best";
  AR.allTime = {};
  try {
    AR.allTime = JSON.parse(localStorage.getItem(LS_KEY) || "{}") || {};
  } catch (e) {
    AR.allTime = {};
  }
  function saveAllTime() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(AR.allTime));
    } catch (e) {
      /* private mode */
    }
  }

  // ------------------------------------------------------------------
  // Items (inventory side of the collectibles)
  // ------------------------------------------------------------------
  AR.miniItem = (id) => "arc_mini_" + id;
  AR.defineItems = function () {
    if (G.isStub("items") || typeof G.items.define !== "function") return;
    for (const s of AR.MINIS) {
      G.items.define({
        id: AR.miniItem(s.id),
        name: "Landmark Miniature - " + s.name,
        type: "misc",
        weight: 0,
        value: 0,
        tags: ["collectible", "landmark_mini"],
        noLoot: true,
        noSell: true,
        mesh: "misc",
        desc: s.desc,
      });
    }
    // The Keys to the City: one stack while the hunt runs, then the threaded set (the vault's key).
    G.items.define({
      id: AR.ITEM_KEY,
      name: "Gold Key to the City",
      type: "misc",
      weight: 0.2,
      value: 0,
      quest: true,
      tags: ["collectible", "key_to_the_city"],
      noLoot: true,
      noSell: true,
      mesh: "key",
      desc:
        "A foot-long ceremonial key in gilded bronze, the city seal on the bow and a red, white and blue ribbon through it. " +
        'Unlike most keys to most cities, this one has a working bit. Engraved on the shaft: "OFFICE OF THE MAYOR · NEW YORK".',
    });
    G.items.define({
      id: AR.ITEM_KEYRING,
      name: "The Keys to the City",
      type: "key",
      weight: 3,
      value: 0,
      quest: true,
      tags: ["key", "key_to_the_city"],
      noLoot: true,
      noSell: true,
      mesh: "key",
      desc:
        "All sixteen ceremonial Keys to the City, threaded on the Mayor's ribbon in the order they were given, 1954 to 1967. " +
        "Sixteen bits, sixteen locks. The vault is under Gracie Mansion.",
    });
    try {
      if (!G.isStub("locks") && G.locks.obtainableFrom)
        G.locks.obtainableFrom(
          AR.ITEM_KEYRING,
          "Keys to the City: all sixteen ceremonial keys found (arcade ledger, key K)",
        );
    } catch (e) {
      /* locks stub */
    }
  };
  function titleCase(s) {
    return String(s)
      .toLowerCase()
      .replace(/(^|[\s(!-])([a-z])/g, (m, a, b) => a + b.toUpperCase());
  }
  AR.titleCase = titleCase;
  AR.heroName = () => (G.HERO && G.HERO.name) || "stranger";
  /** Three-letter arcade initials from the hero's name. */
  AR.initials = function () {
    const n = String(AR.heroName())
      .toUpperCase()
      .replace(/[^A-Z]/g, "");
    return (n + "XXX").slice(0, 3);
  };

  // ------------------------------------------------------------------
  // Collecting
  // ------------------------------------------------------------------
  function notify(text, opts) {
    try {
      G.notify(text, opts || {});
    } catch (e) {
      /* hud stub */
    }
  }
  function addXP(n, why) {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      G.reportError("arcade:xp", e);
    }
  }
  function addItem(id, n, silent) {
    try {
      if (!G.isStub("inventory") && G.items.get && G.items.get(id)) {
        G.inventory.add(id, n || 1, { silent: !!silent });
        return true;
      }
    } catch (e) {
      G.reportError("arcade:addItem", e);
    }
    return false;
  }
  function addScrip(n) {
    try {
      if (!n || G.isStub("inventory")) return;
      if (G.inventory.addScrip) G.inventory.addScrip(n);
    } catch (e) {
      G.reportError("arcade:scrip", e);
    }
  }
  AR.addItem = addItem;
  AR.addScrip = addScrip;
  AR.addXP = addXP;
  AR.notify = notify;

  /**
   * Mark a collectible as found. kind: 'mini'|'key'. Returns true if newly found.
   * opts.fromItem: the inventory item already arrived (don't add it again).
   */
  AR.collect = function (kind, id, opts) {
    opts = opts || {};
    const S = AR.STATE;
    if (kind === "mini") {
      const def = AR.MINIS.find((g) => g.id === id);
      if (!def || S.minis.has(id)) return false;
      S.minis.add(id);
      if (!opts.fromItem) addItem(AR.miniItem(id), 1, true);
      G.sfx.play("pickup", { volume: 0.8 });
      notify(
        "Landmark Miniature: " +
          def.name +
          " (" +
          S.minis.size +
          "/" +
          AR.MINIS.length +
          ")",
        { icon: "collectible", sub: "Press K to view your collections." },
      );
      addXP(AR.XP_MINI, "Landmark miniature");
      checkMilestones("minis", S.minis.size);
    } else if (kind === "key") {
      const def = AR.keyDef(id);
      if (!def || S.keys.has(id)) return false;
      S.keys.add(id);
      if (!opts.fromItem && !S.rewards.has("keys16"))
        addItem(AR.ITEM_KEY, 1, true);
      G.sfx.play("pickup", { volume: 0.8 });
      notify(
        "Key to the City No. " +
          def.no +
          " (" +
          def.year +
          ", " +
          def.who +
          ") " +
          S.keys.size +
          "/" +
          AR.KEYS.length,
        {
          icon: "collectible",
          sub: "Keys to the City: press K for the Mayor's register.",
        },
      );
      addXP(AR.XP_KEY, "Key to the City");
      checkMilestones("keys", S.keys.size);
    } else return false;
    G.events.emit("arcadeCollected", kind, id);
    if (AR.world && AR.world.refresh) AR.world.refresh();
    if (AR.ui && AR.ui.isOpen && AR.ui.isOpen()) AR.ui.render();
    return true;
  };

  function checkMilestones(kind, count) {
    for (const r of AR.REWARDS[kind]) {
      if (count < r.n || AR.STATE.rewards.has(r.id)) continue;
      AR.STATE.rewards.add(r.id);
      payReward(r, kind);
    }
  }
  function payReward(r, kind) {
    try {
      if (r.scrip) addScrip(r.scrip);
      if (r.items) for (const it of r.items) addItem(it[0], it[1], true);
      if (r.skills && !G.isStub("rpg") && G.rpg.boostSkill)
        for (const k in r.skills) G.rpg.boostSkill(k, r.skills[k], "silent");
      if (r.keyring) threadKeyring();
      if (r.xp) addXP(r.xp, "Collection");
    } catch (e) {
      G.reportError("arcade:reward", e);
    }
    // the final milestone of a collection that runs as a quest: the QUEST COMPLETED banner presents it
    if (r.final && AR.quests && AR.quests.active(kind)) {
      notify("Collection reward: " + r.text, { icon: "check" });
      return;
    }
    G.sfx.play("quest_complete", { volume: 0.7 });
    try {
      if (!G.isStub("hud") && G.hud.banner)
        G.hud.banner({ title: "COLLECTION REWARD", sub: r.text });
      else notify("Collection reward: " + r.text);
    } catch (e) {
      notify("Collection reward: " + r.text);
    }
  }
  /** Sixteen loose keys → the threaded set (the vault lock's key item). */
  function threadKeyring() {
    try {
      if (G.isStub("inventory")) return;
      const n = G.inventory.count ? G.inventory.count(AR.ITEM_KEY) : 0;
      if (n > 0 && G.inventory.remove)
        G.inventory.remove(AR.ITEM_KEY, n, { silent: true });
      if (!G.inventory.count || G.inventory.count(AR.ITEM_KEYRING) === 0)
        addItem(AR.ITEM_KEYRING, 1, true);
    } catch (e) {
      G.reportError("arcade:keyring", e);
    }
  }
  AR.threadKeyring = threadKeyring;
  /** Has the Mayor's vault been opened (the end of the hunt)? */
  AR.vaultOpen = () => {
    try {
      return !G.isStub("locks") && G.locks.isOpen(AR.VAULT_LOCK);
    } catch (e) {
      return false;
    }
  };

  // ------------------------------------------------------------------
  // High scores. The cabinet board = the player's runs merged with the
  // old-world table burned into the machine.
  // ------------------------------------------------------------------
  AR.highScores = (gameId) => (AR.STATE.scores[gameId] || []).slice();
  AR.best = (gameId) => {
    const t = AR.STATE.scores[gameId];
    return t && t.length ? t[0].score : 0;
  };
  AR.houseRecord = (gameId) => {
    const d = AR.gameDef(gameId);
    return d && d.board.length ? d.board[0][1] : 0;
  };
  AR.allTimeBest = (gameId) =>
    Math.max(
      AR.best(gameId),
      (AR.allTime[gameId] && AR.allTime[gameId].score) || 0,
      AR.houseRecord(gameId),
    );
  /** The cabinet's top-5 table: [{name, score, mine}] */
  AR.board = function (gameId) {
    const d = AR.gameDef(gameId);
    if (!d) return [];
    const rows = d.board
      .map((b) => ({ name: b[0], score: b[1], mine: false }))
      .concat(
        AR.highScores(gameId).map((s) => ({
          name: s.name,
          score: s.score,
          mine: true,
        })),
      );
    rows.sort((a, b) => b.score - a.score || (a.mine ? -1 : 1));
    return rows.slice(0, 5);
  };
  /** Record a finished run. Returns the rank (0-based) on the cabinet board, or -1. */
  AR.recordScore = function (gameId, score) {
    score = Math.max(0, Math.floor(score || 0));
    const S = AR.STATE;
    S.plays[gameId] = (S.plays[gameId] || 0) + 1;
    if (score <= 0) return -1;
    const name = AR.initials();
    const t = S.scores[gameId] || (S.scores[gameId] = []);
    const entry = { score, name, day: (G.time && G.time.day) || 1 };
    t.push(entry);
    t.sort((a, b) => b.score - a.score);
    if (t.length > 5) t.length = 5;
    const at = AR.allTime[gameId];
    if (!at || score > at.score) {
      AR.allTime[gameId] = { score, name };
      saveAllTime();
    }
    const board = AR.board(gameId);
    let rank = -1;
    for (let i = 0; i < board.length; i++)
      if (board[i].mine && board[i].score === score) {
        rank = i;
        break;
      }
    if (score > AR.houseRecord(gameId) && !S.records.has(gameId)) {
      S.records.add(gameId);
      addXP(AR.XP_RECORD, "Arcade house record");
      G.events.emit("arcadeRecord", gameId, score);
    }
    if (rank === 0) G.events.emit("arcadeHighScore", gameId, score);
    return rank;
  };
  /** A game's goal reached (first time → XP). */
  AR.champion = function (gameId) {
    if (AR.STATE.champion.has(gameId)) return false;
    AR.STATE.champion.add(gameId);
    addXP(AR.XP_CHAMPION, "Arcade challenge");
    return true;
  };
  /** Has the player found (played at) a cabinet with this game? */
  AR.discovered = function (gameId) {
    for (const id of AR.STATE.cabinets) {
      const c = AR.cabinetDef(id);
      if (c && c.game === gameId) return true;
    }
    return AR.STATE.plays[gameId] > 0;
  };

  // ------------------------------------------------------------------
  // Save / load
  // ------------------------------------------------------------------
  AR.serialize = function () {
    const S = AR.STATE;
    return {
      v: 3,
      minis: Array.from(S.minis),
      keys: Array.from(S.keys),
      cabinets: Array.from(S.cabinets),
      rewards: Array.from(S.rewards),
      champion: Array.from(S.champion),
      records: Array.from(S.records),
      scores: S.scores,
      plays: S.plays,
    };
  };
  AR.deserialize = function (d) {
    const S = freshState();
    if (d && typeof d === "object") {
      const set = (a, valid) =>
        new Set(
          (Array.isArray(a) ? a : []).filter(
            (x) => typeof x === "string" && (!valid || valid(x)),
          ),
        );
      S.minis = set(d.minis, (x) => AR.MINIS.some((g) => g.id === x));
      S.keys = set(d.keys, (x) => !!AR.keyDef(x));
      S.cabinets = set(d.cabinets, (x) => !!AR.cabinetDef(x));
      S.rewards = set(d.rewards);
      S.champion = set(d.champion);
      S.records = set(d.records, (x) => !!AR.gameDef(x));
      if (d.scores && typeof d.scores === "object") {
        for (const k in d.scores)
          if (AR.gameDef(k) && Array.isArray(d.scores[k])) {
            S.scores[k] = d.scores[k]
              .filter((e) => e && isFinite(e.score))
              .slice(0, 5)
              .map((e) => ({
                score: Math.floor(e.score),
                name: String(e.name || "").slice(0, 12),
                day: e.day | 0,
              }));
          }
      }
      if (d.plays && typeof d.plays === "object")
        for (const k in d.plays) S.plays[k] = d.plays[k] | 0;
    }
    AR.STATE = S;
  };

  // ------------------------------------------------------------------
  // Public namespace
  // ------------------------------------------------------------------
  G.arcade = {
    _: AR,
    play: (id, opts) => (AR.ui ? AR.ui.play(id, opts) : false),
    open: (tab) => (AR.ui ? AR.ui.open(tab) : false),
    close: () => (AR.ui ? AR.ui.close() : false),
    toggle: () =>
      AR.ui ? (AR.ui.isOpen() ? AR.ui.close() : AR.ui.open()) : false,
    isOpen: () => !!(AR.ui && AR.ui.isOpen()),
    games: () =>
      AR.GAME_DEFS.map((g) => ({
        id: g.id,
        title: g.title,
        discovered: AR.discovered(g.id),
        best: AR.best(g.id),
        houseRecord: AR.houseRecord(g.id),
        record: AR.STATE.records.has(g.id),
        champion: AR.STATE.champion.has(g.id),
      })),
    highScores: (id) => AR.board(id),
    houseRecord: (id) => AR.houseRecord(id),
    cabinets: () =>
      AR.world
        ? AR.world.entries
            .filter((e) => e.kind === "cabinet")
            .map((e) => ({
              id: e.id,
              game: e.game,
              style: e.style,
              area: e.area,
              x: e.x,
              z: e.z,
            }))
        : [],
    collect: (kind, id) => AR.collect(kind, id),
    collectibles: () => ({
      minis: {
        found: AR.STATE.minis.size,
        total: AR.MINIS.length,
        list: AR.MINIS.map((g) => ({
          id: g.id,
          name: g.name,
          found: AR.STATE.minis.has(g.id),
        })),
      },
      keys: {
        found: AR.STATE.keys.size,
        total: AR.KEYS.length,
        vault: AR.vaultOpen(),
        list: AR.KEYS.map((q) => ({
          id: q.id,
          no: q.no,
          year: q.year,
          who: q.who,
          area: q.area,
          site: q.site,
          found: AR.STATE.keys.has(q.id),
        })),
      },
      cabinets: { found: AR.STATE.cabinets.size, total: AR.CABINETS.length },
    }),
    stats: () => ({
      state: AR.serialize(),
      allTime: AR.allTime,
      placed: AR.world ? AR.world.placedCount() : 0,
    }),
  };
})();
