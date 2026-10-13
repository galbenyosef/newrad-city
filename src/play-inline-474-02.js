// play-inline-474 02 — desc
// Lines 355-676 of readable/play-inline-474.pretty.js (statement-aligned).
  J({
    id: "baseball",
    name: "Baseball",
    weight: 0.2,
    value: 2,
    tags: ["junk", "toy"],
    mesh: "ball",
    desc: "A scuffed baseball signed by a Bronx slugger whose name has faded into a smudge.",
  });
  J({
    id: "pool_ball",
    name: "Pool Ball",
    weight: 0.2,
    value: 1,
    tags: ["junk", "toy"],
    mesh: "ball",
    desc: "A solid 8-ball from a Bowery billiards hall. Bad luck, reportedly.",
  });
  J({
    id: "broken_camera",
    name: "Tourist Camera",
    weight: 1,
    value: 8,
    tags: ["junk"],
    mesh: "camera",
    desc: "A tourist camera with the film still inside. The last roll is thirty-six photos of the Empire State Building.",
  });
  J({
    id: "souvenir_statue",
    name: "Souvenir Liberty Statuette",
    weight: 0.5,
    value: 6,
    tags: ["junk", "souvenir"],
    mesh: "statuette",
    desc: "A little pot-metal Statue of Liberty from a gift shop. Her torch has broken off, which feels like commentary.",
  });
  J({
    id: "souvenir_paperweight",
    name: "Skyline Paperweight",
    weight: 1,
    value: 15,
    tags: ["junk", "souvenir"],
    mesh: "globe",
    lootWeight: 0.4,
    desc: "A glass dome paperweight with a tiny Manhattan skyline inside, from a Times Square gift shop. A hairline crack runs right through the Empire State.",
  });
  J({
    id: "subway_token",
    name: "Subway Token",
    weight: 0,
    value: 3,
    tags: ["junk", "souvenir"],
    mesh: "token",
    desc: "A brass transit token with a Y cut out of the middle. Good for one ride on a train that will never come.",
  });
  J({
    id: "stock_certificate",
    name: "Stock Certificate",
    weight: 0,
    value: 2,
    tags: ["junk", "office"],
    mesh: "paper",
    desc: "1,000 shares of the Fizzo Bottling Company, purchased in March 1967. A tremendous investment for about three days.",
  });
  J({
    id: "old_world_book",
    name: "Old-World Book",
    weight: 1,
    value: 5,
    tags: ["junk", "book"],
    mesh: "book",
    desc: 'A water-stained novel of the "tough detective, dangerous dame" variety. The last chapter is missing. It\'s always the last chapter.',
  });
  J({
    id: "ruined_book",
    name: "Ruined Book",
    weight: 1,
    value: 1,
    tags: ["junk", "book"],
    mesh: "book",
    desc: "A book so swollen with water that it no longer opens. The Iron Covenant's archivists will still take it, grumbling.",
  });
  J({
    id: "covenant_tag",
    name: "Covenant Tag",
    weight: 0,
    value: 5,
    tags: ["junk", "covenant"],
    mesh: "tag",
    lootWeight: 0.3,
    desc: "A stamped steel tag on a bead chain, cog-tooth edged, with a name and a rank punched in. The Iron Covenant would want it returned.",
  });
  J({
    id: "ripjaw_claw",
    name: "Ripjaw Claw",
    weight: 2,
    value: 80,
    tags: ["junk", "trophy"],
    mesh: "meat",
    meatColor: 0x3a2a20,
    lootWeight: 0.1,
    desc: "A severed ripjaw foreclaw, hooked and serrated like a hay knife. Traders in the Neon pay well; tinkerers pay better.",
  });
  J({
    id: "raider_tags",
    name: "Raider Tags",
    weight: 0,
    value: 2,
    tags: ["junk", "raider"],
    mesh: "tag",
    desc: "Scratched dog tags looted from a dead soldier, then looted again from a dead raider. The circle of life.",
  });

  // ---------------------------------------------------------------
  // SKILL MANUALS: read to permanently raise a skill (+2, +3 with Bookworm)
  // ---------------------------------------------------------------
  const BOOKS = [
    [
      "book_riflemans_companion",
      "The Rifleman's Companion",
      "firearms",
      "A National Guard marksmanship manual with dog-eared range tables and a pressed four-leaf clover marking the chapter on wind.",
    ],
    [
      "book_super_sergeant",
      "Super Sergeant #22",
      "melee",
      'A Bowery Comics war comic: "America\'s finest fighting man!" Issue 22, "Hand-to-Hand on Hill 9," is drawn by an ex-Marine, and the close-combat panels are surprisingly sound.',
    ],
    [
      "book_golden_gloves",
      "Golden Gloves Boxing Annual",
      "melee",
      "Ringside photographs from Madison Square Garden with diagrams of every hook, jab and clinch a welterweight ever threw.",
    ],
    [
      "book_demolitions",
      "Demolitions, Field Manual 5-25",
      "explosives",
      "An Army engineers' manual on charges, fuses and how not to lose your fingers. Several pages are singed, which is not reassuring.",
    ],
    [
      "book_bellevue_manual",
      "Bellevue Emergency Ward Manual",
      "medicine",
      "The triage bible of Bellevue Hospital's night shift, annotated in three colours of ink by three very tired doctors.",
    ],
    [
      "book_motor_manual",
      "Hollis Motor Repair Manual",
      "mechanics",
      "A grease-stained shop manual for every engine, pump and generator built between 1950 and 1966.",
    ],
    [
      "book_handyman",
      "The Handyman's Big Book",
      "mechanics",
      'Eight hundred pages on fixing anything in the home, from leaky faucets to "your new atomic-age dishwasher."',
    ],
    [
      "book_radio_handbook",
      "Radio Amateur's Handbook",
      "electronics",
      "The ham operator's bible: circuits, tubes, antennas and a fold-out chart of every frequency in the Northeast.",
    ],
    [
      "book_popular_circuits",
      "Popular Circuits Annual",
      "electronics",
      "A year of hobbyist electronics magazines bound in buckram, with a teletype schematic someone has circled twice.",
    ],
    [
      "book_bureau_manual",
      "Bureau Sept Field Manual",
      "stealth",
      "A French agent's pocket manual, in French, on blending into an American crowd. The diagrams need no translation.",
    ],
    [
      "book_art_of_the_pitch",
      "The Art of the Pitch",
      "persuasion",
      'A Madison Avenue ad man\'s guide to getting anyone to say yes. Chapter 1: "Make Them Think It Was Their Idea."',
    ],
    [
      "book_pushcart_king",
      "Confessions of a Pushcart King",
      "trade",
      "The memoir of an Orchard Street peddler who sold pickles, then buttons, then buildings. Every page is a haggle.",
    ],
    [
      "book_survival_handbook",
      "Civil Defense Survival Handbook",
      "survival",
      "The government's own guide to food, water and shelter after an attack. Half of it is wrong. The other half kept people alive.",
    ],
  ];
  for (const b of BOOKS) {
    const nm = b[2].charAt(0).toUpperCase() + b[2].slice(1);
    M({
      id: b[0],
      name: b[1],
      weight: 2,
      value: 100,
      tags: ["book", "skill_book"],
      book: { skill: b[2] },
      mesh: "manual_" + b[0].slice(5),
      lootWeight: 0.25,
      desc: b[3] + " Reading it raises your " + nm + " skill.",
    });
  }

  // ---------------------------------------------------------------
  // WORLD'S FAIR MEDALLIONS: twenty bronze medallions from the 1964 New York
  // World's Fair souvenir set, scattered through the city. They grant nothing
  // by themselves: the Fair's last curator at Grand Central collects them and
  // pays out at 5 / 10 / 15 / 20 (src/quests/55_medallions.js). Placed by
  // props / quests via the item id or G.items.medallionId(key).
  // ---------------------------------------------------------------
  const MEDALS = [
    ["unisphere", "Unisphere"],
    ["monorail", "Monorail"],
    ["hall_of_science", "Hall of Science"],
    ["hall_of_education", "Hall of Education"],
    ["space_park", "Space Park"],
    ["tent_of_tomorrow", "Tent of Tomorrow"],
    ["rocket_thrower", "Rocket Thrower"],
    ["pool_of_industry", "Pool of Industry"],
    ["heliport", "Heliport"],
    ["pavilion_of_medicine", "Pavilion of Medicine"],
    ["transportation_hall", "Transportation Hall"],
    ["hall_of_free_enterprise", "Hall of Free Enterprise"],
    ["wax_museum", "Wax Museum"],
    ["federal_pavilion", "Federal Pavilion"],
    ["better_living", "Better Living Center"],
    ["lake_amusement", "Lake Amusement Area"],
    ["observation_towers", "Observation Towers"],
    ["court_of_states", "Court of the States"],
    ["fountain_of_planets", "Fountain of the Planets"],
    ["tower_of_light", "Tower of Light"],
  ];
  MEDALS.forEach((m, i) => {
    M({
      id: "medallion_" + m[0],
      name: "World's Fair Medallion: " + m[1],
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      tags: ["medallion", "collectible"],
      medallion: { key: m[0], index: i },
      mesh: "medallion",
      desc:
        "A heavy bronze souvenir medallion from the 1964 World's Fair in Flushing Meadows, stamped with the " +
        m[1] +
        ". One of twenty in the set. " +
        "The Fair's last curator keeps a stall at Grand Central and pays for every one you bring him.",
    });
  });

  // ---------------------------------------------------------------
  // KEYS (quests / landmarks may define more with G.items.define)
  // ---------------------------------------------------------------
  K({
    id: "key_c9_director",
    name: "Facility Director's Key",
    desc: "A brass key on an Office of Civil Defense tag. Opens the Facility Director's office in Cryo Unit C-9 and his private file cabinet.",
  });
  K({
    id: "key_c9_armory",
    name: "Cryo Unit C-9 Armory Key",
    desc: 'A heavy security key stamped "ARMORY — AUTHORIZED PERSONNEL."',
  });
  K({
    id: "key_c9_clinic",
    name: "Cryo Unit C-9 Clinic Key",
    desc: "The key to the facility clinic's drug locker. Nobody is left to notice it's missing.",
  });
  K({
    id: "key_grand_central_stockroom",
    name: "Grand Central Stockroom Key",
    desc: "A ring key to the market's shared stockroom under the Main Concourse.",
  });
  K({
    id: "key_chrysler_penthouse",
    name: "Chrysler Penthouse Key",
    desc: "An art-deco key with a tiny eagle head on the bow. Opens the raider boss's penthouse.",
  });
  K({
    id: "key_exchange_vault",
    name: "Exchange Strongroom Key",
    desc: "A long bank strongroom key taken from the raider boss of The Exchange.",
  });
  K({
    id: "key_subway_maintenance",
    name: "Subway Maintenance Key",
    desc: "A transit authority key for the maintenance doors off the 42nd Street platform.",
  });
  K({
    id: "key_neon_mayor",
    name: "Mayor's Office Key",
    desc: "The key to the Neon mayor's office above the old theatre marquee.",
  });
  K({
    id: "key_met_archive",
    name: "Met Archive Keycard",
    desc: "A laminated security keycard for the Metropolitan Museum's restricted archive.",
  });
  K({
    id: "key_liberty_pedestal",
    name: "Liberty Pedestal Key",
    desc: "A Continuity-issue key for the service door in the base of the Statue of Liberty.",
  });
  K({
    id: "key_generic_apartment",
    name: "Apartment Key",
    desc: 'A plain brass apartment key on a ring with a plastic tag: "4B."',
  });
  K({
    id: "key_generic_office",
    name: "Office Key",
    desc: "A desk key from some midtown office. Somewhere, a drawer awaits.",
  });
