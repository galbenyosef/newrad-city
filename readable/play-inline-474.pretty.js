/* src/rpg/14_items_misc.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — MISC, JUNK, KEYS, SKILL MANUALS,
 * WORLD'S FAIR MEDALLIONS
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const M = (d) => G.items.define(Object.assign({ type: "misc" }, d));
  const J = (d) =>
    G.items.define(Object.assign({ type: "junk", tags: ["junk"] }, d));
  const K = (d) =>
    G.items.define(
      Object.assign(
        {
          type: "key",
          weight: 0,
          value: 0,
          tags: ["key"],
          mesh: "key",
          noLoot: true,
        },
        d,
      ),
    );

  // ---------------------------------------------------------------
  // Currency & valuables
  // ---------------------------------------------------------------
  M({
    id: "scrip",
    name: "Ration Scrip",
    weight: 0,
    value: 1,
    tags: ["currency"],
    mesh: "scrip",
    noLoot: true,
    desc: 'Federal ration scrip: folded paper notes printed by the Office of Civil Defense in 1966 "for use in a national emergency." The emergency came. The notes stayed. Every trader in the city takes them.',
  });
  M({
    id: "old_dollars",
    name: "Old-World Dollars",
    weight: 0,
    value: 10,
    tags: ["valuable"],
    mesh: "money",
    desc: "A crisp stack of U.S. dollars. Worth less than scrip, because scrip at least promises a can of beans. Makes decent kindling.",
  });
  M({
    id: "gold_bar",
    name: "Gold Bar",
    weight: 5,
    value: 500,
    tags: ["valuable", "rare"],
    mesh: "gold_bar",
    lootWeight: 0.05,
    desc: "A Federal Reserve gold bar from the vaults under Liberty Street. Heavy, gleaming, and still, somehow, worth killing for.",
  });

  // ---------------------------------------------------------------
  // Electronic components & valuables (repair / quests / barter)
  // ---------------------------------------------------------------
  J({
    id: "dry_cell",
    name: "Dry Cell Battery",
    weight: 1,
    value: 30,
    tags: ["junk", "electronic"],
    mesh: "battery",
    desc: "A brick-sized six-volt lantern battery with brass screw terminals. Half the gadgets in the ruins will run off one, briefly.",
  });
  J({
    id: "relay_board",
    name: "Relay Board",
    weight: 0.5,
    value: 40,
    tags: ["junk", "electronic"],
    mesh: "sensor",
    desc: "A circuit board of clicking relays and a photo-eye, salvaged from a robot, a turret or a very fancy elevator.",
  });
  J({
    id: "scrap_electronics",
    name: "Scrap Electronics",
    weight: 1,
    value: 25,
    tags: ["junk", "electronic"],
    mesh: "electronics",
    desc: "A tangle of circuit boards, wire and solder that once did something clever.",
  });
  J({
    id: "vacuum_tube",
    name: "Vacuum Tube",
    weight: 0.2,
    value: 12,
    tags: ["junk", "electronic"],
    mesh: "tube",
    desc: "A glass thermionic valve. The old world ran on these, and so do most of its robots.",
  });
  J({
    id: "conductor",
    name: "Conductor",
    weight: 0.2,
    value: 8,
    tags: ["junk", "electronic"],
    mesh: "conductor",
    desc: "A copper conductor coil. Useful for fixing radios and, reportedly, ray guns.",
  });
  J({
    id: "microscope",
    name: "Microscope",
    weight: 3,
    value: 25,
    tags: ["junk", "science"],
    mesh: "microscope",
    desc: "A brass lab microscope from Columbia University. Its lenses have seen the smallest things in the world; now they see the Ruins.",
  });
  J({
    id: "gas_igniter",
    name: "Gas Igniter",
    weight: 0.5,
    value: 6,
    tags: ["junk"],
    mesh: "pilot_light",
    desc: "A gas stove igniter assembly. Every self-respecting flamer enthusiast has three.",
  });
  J({
    id: "surgical_tubing",
    name: "Surgical Tubing",
    weight: 0.2,
    value: 5,
    tags: ["junk", "medical"],
    mesh: "junk_rubber",
    desc: "Rubber tubing from a hospital supply room. Stretchy. Useful. Slightly sticky.",
  });
  J({
    id: "scrap_metal",
    name: "Scrap Metal",
    weight: 1,
    value: 2,
    tags: ["junk", "metal"],
    mesh: "scrap",
    desc: "Twisted pieces of steel, the building blocks of every shack, wall and weapon in the city.",
  });
  J({
    id: "duct_tape",
    name: "Duct Tape",
    weight: 0.2,
    value: 6,
    tags: ["junk", "tool"],
    mesh: "tape",
    desc: "Holds the city together. Literally, in some settlements.",
  });
  J({
    id: "tuff_bond",
    name: "Tuff-Bond Glue",
    weight: 0.2,
    value: 8,
    tags: ["junk", "tool"],
    mesh: "bottle_small",
    desc: "Two-part epoxy in a pair of squeeze tubes. The lids are permanently glued on, which is its own kind of endorsement.",
  });
  J({
    id: "homeguard_cleanser",
    name: "Homeguard Cleanser",
    weight: 1,
    value: 6,
    tags: ["junk", "chemical"],
    mesh: "can_homeguard",
    desc: 'A tall canister of Homeguard scouring powder with a red, white and blue shield on the label. "Defending the American kitchen." Caustic enough to strip paint and, mixed right, a good deal more.',
  });
  J({
    id: "turpentine",
    name: "Turpentine",
    weight: 1,
    value: 5,
    tags: ["junk", "chemical"],
    mesh: "can_paint",
    desc: "A can of paint thinner from a Greenwich Village art studio. Flammable, pungent, and good for cleaning up mistakes.",
  });
  J({
    id: "lighter",
    name: "Lighter",
    weight: 0.2,
    value: 4,
    tags: ["junk"],
    mesh: "lighter",
    desc: 'A chrome flip-top lighter engraved "To J., from Coney, \'64." Still sparks.',
  });

  // ---------------------------------------------------------------
  // Household junk
  // ---------------------------------------------------------------
  J({
    id: "tin_can",
    name: "Tin Can",
    weight: 0.5,
    value: 0,
    tags: ["junk", "household"],
    mesh: "can_empty",
    desc: "An empty tin can. The contents are long gone. So is the label.",
  });
  J({
    id: "bent_tin_can",
    name: "Bent Tin Can",
    weight: 0.5,
    value: 0,
    tags: ["junk", "household"],
    mesh: "can_empty",
    desc: "A crushed tin can. Somebody really didn't like whatever was in it.",
  });
  J({
    id: "empty_fizzo_bottle",
    name: "Empty Fizzo Bottle",
    weight: 1,
    value: 0,
    tags: ["junk", "household"],
    mesh: "bottle_empty",
    desc: "A tall ribbed Fizzo Cola bottle, empty. Water sellers pay for these in bulk.",
  });
  J({
    id: "empty_whiskey_bottle",
    name: "Empty Whiskey Bottle",
    weight: 1,
    value: 0,
    tags: ["junk", "household"],
    mesh: "bottle_empty",
    desc: "The saddest thing in the city is an empty bottle of whiskey. The second saddest is you, looking at it.",
  });
  J({
    id: "milk_bottle",
    name: "Milk Bottle",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "bottle_milk_empty",
    desc: "A glass milk bottle from the milkman who used to deliver on the Upper West Side. He never finished his route.",
  });
  J({
    id: "coffee_mug",
    name: "Coffee Mug",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "mug",
    desc: 'A diner mug with a chipped rim and a faded "I ♥ NY" print. The heart has lasted better than the city.',
  });
  J({
    id: "plate",
    name: "Plate",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "plate",
    desc: "A melamine dinner plate, pastel green. Unbreakable, as advertised.",
  });
  J({
    id: "cooking_pan",
    name: "Cooking Pan",
    weight: 3,
    value: 3,
    tags: ["junk", "household"],
    mesh: "pan",
    desc: "A cast-iron skillet. Fries eggs, blocks bullets, settles arguments.",
  });
  J({
    id: "fork",
    name: "Fork",
    weight: 0.2,
    value: 1,
    tags: ["junk", "household"],
    mesh: "fork",
    desc: "A stainless steel dinner fork. One of the tines is bent from something you don't want to know about.",
  });
  J({
    id: "clipboard",
    name: "Clipboard",
    weight: 1,
    value: 2,
    tags: ["junk", "office"],
    mesh: "clipboard",
    desc: 'A clipboard holding a Civil Defense form: "List all members of your household eligible for shelter assignment."',
  });
  J({
    id: "pencil",
    name: "Pencil",
    weight: 0,
    value: 1,
    tags: ["junk", "office"],
    mesh: "junk_wood",
    desc: "A yellow No. 2 pencil, freshly sharpened by someone who never got to take their exam.",
  });
  J({
    id: "typewriter",
    name: "Typewriter",
    weight: 8,
    value: 12,
    tags: ["junk", "office"],
    mesh: "typewriter",
    desc: 'A heavy office typewriter from a Madison Avenue ad agency. Its last sheet reads "Fizzo Cola: the taste of tomorr".',
  });
  J({
    id: "ashtray",
    name: "Ashtray",
    weight: 1,
    value: 1,
    tags: ["junk", "household"],
    mesh: "ashtray",
    desc: "A glass ashtray stolen from a Times Square lounge. Still holds one very old cigarette butt.",
  });
  J({
    id: "cigarettes",
    name: "Cigarettes",
    weight: 0.1,
    value: 5,
    tags: ["junk", "valuable"],
    mesh: "cig_pack",
    desc: "A pack of Silver Torch king-size filter tips, the silver foil gone dull. Nobody smokes them (the paper is dust) but everyone trades them.",
  });
  J({
    id: "cigarette_carton",
    name: "Carton of Cigarettes",
    weight: 1,
    value: 25,
    tags: ["junk", "valuable"],
    mesh: "cig_carton",
    desc: 'A carton of Silver Torch, ten packs of king-size filter tips still in their cellophane. "Light up like the lady in the harbor." Better than scrip on the Lower East Side.',
  });
  J({
    id: "toy_car",
    name: "Toy Car",
    weight: 0.5,
    value: 1,
    tags: ["junk", "toy"],
    mesh: "toy_car",
    desc: "A die-cast station wagon with working wheels. More reliable than the real thing.",
  });
  J({
    id: "teddy_bear",
    name: "Teddy Bear",
    weight: 1,
    value: 1,
    tags: ["junk", "toy"],
    mesh: "teddy",
    desc: "A threadbare teddy bear with one button eye. It has been waiting for someone to come home for a very long time.",
  });
  J({
    id: "lunchbox",
    name: "Lunchbox",
    weight: 1,
    value: 4,
    tags: ["junk", "toy"],
    mesh: "lunchbox",
    desc: 'A tin lunchbox with Super Sergeant on the lid, fist raised against the sky. Empty, except for a note that says "love, Mom."',
  });
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
})();
