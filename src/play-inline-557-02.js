// play-inline-557 02 — stock
// Lines 31-363 of readable/play-inline-557.pretty.js (statement-aligned).
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const gh = (o) => Object.assign({ type: "human", faction: "settlers" }, o);

  // ------------------------------------------------------------------
  // Stock
  // ------------------------------------------------------------------
  const STOCK = {
    smokes: [
      ["cigarettes", 12],
      ["cigarette_carton", 3],
      ["lighter", 3],
      ["bubblegum", 6],
      ["licorice_twists", 5],
      ["subway_token", 4],
      ["sunglasses", 1],
      ["reading_glasses", 1],
      ["newsboy_cap", 1],
      ["pencil", 4],
      ["clipboard", 1],
      ["whiskey", 2],
      ["focus_pills", 1],
    ],
    tinker: [
      ["scrap_metal", 12],
      ["scrap_electronics", 6],
      ["duct_tape", 4],
      ["tuff_bond", 2],
      ["conductor", 4],
      ["vacuum_tube", 3],
      ["dry_cell", 2],
      ["surgical_tubing", 2],
      ["gas_igniter", 1],
      ["cooking_pan", 2],
      ["coffee_mug", 3],
      ["fork", 6],
      ["empty_fizzo_bottle", 8],
      ["milk_bottle", 3],
      ["broken_camera", 1],
      ["typewriter", 1],
    ],
    souvenir: [
      ["souvenir_paperweight", 3],
      ["souvenir_statue", 4],
      ["toy_car", 2],
      ["teddy_bear", 2],
      ["baseball", 2],
      ["pool_ball", 2],
      ["old_world_book", 3],
      ["old_dollars", 10],
      ["stock_certificate", 2],
      ["ashtray", 2],
      ["lunchbox", 1],
      ["baseball_cap", 2],
      ["top_hat", 1],
      ["doorman_uniform", 1],
      ["conductor_uniform", 1],
    ],
    hotdog: [
      ["coney_dog", 8],
      ["bodega_pretzel", 6],
      ["old_world_bagel", 4],
      ["saratoga_chips", 5],
      ["chocolate_zeppelin", 3],
      ["freedom_flakes", 3],
      ["astronaut_ice_cream", 3],
      ["frank_in_a_bun", 6],
      ["fizzo_cola", 6],
      ["prairie_root_beer", 4],
      ["purified_water", 3],
    ],
    club: [
      ["whiskey", 6],
      ["scotch", 4],
      ["vodka", 4],
      ["wine", 4],
      ["beer", 10],
      ["fizzo_blue", 1],
      ["fizzo_lime", 3],
      ["cigarettes", 6],
      ["cigarette_carton", 1],
    ],
    clerk: [
      ["purified_water", 8],
      ["golden_plain_jerky", 6],
      ["franks_and_beans", 4],
      ["ox_meat", 3],
      ["ox_milk", 3],
      ["prussian_blue", 1],
      ["iodine_tabs", 2],
      ["rally_tonic", 2],
      ["duct_tape", 2],
    ],
    armory: [
      ["combat_armor", 1],
      ["combat_helmet", 1],
      ["leather_armor_reinforced", 2],
      ["metal_armor", 1],
      ["army_helmet", 2],
      ["ammo_556", 240],
      ["ammo_308", 60],
      ["ammo_10mm", 200],
      ["ammo_12ga", 80],
      ["frag_grenade", 6],
      ["frag_mine", 3],
      ["rally_tonic", 6],
      ["morphine_syrette", 2],
      ["assault_rifle", 1],
      ["hunting_rifle", 1],
      ["combat_shotgun", 1],
      ["sniper_rifle", 1],
    ],
  };
  T.STOCK.armory = STOCK.armory;

  // ------------------------------------------------------------------
  // Hawker cries & busker tunes (47's lifeTick reads T.HAWK[id] / def.songs)
  // ------------------------------------------------------------------
  Object.assign(T.HAWK, {
    neon_bellhop: [
      "Welcome to the Neon! Beds at the Bunkhouse, twenty scrip, clean-ish sheets!",
      "First time in the Neon? Ask Barnaby! I know everything! Mostly where the bathrooms were!",
      "Rooms! Rooms by the night! Rooms by the hour — no, not like that!",
      "Lost? Tired? Irradiated? The Bunkhouse cures two of three!",
    ],
    neon_campaign: [
      "Vote Crowe! Crowe for Mayor! Crowe: he's still here!",
      "Four more years! Four more decades!",
      "Crowe! The only candidate with a hat AND a plan! The plan is the hat!",
      "Buttons! Free buttons! Wear your Crowe with pride!",
    ],
  });
  const SAX = [
    "♪ Bwaaah-dah-dahhh… ♪ [A long, cracked note from a dented saxophone.]",
    "♪ Doo-bah, doo-bah-dee… ♪",
    "♪ [A slow, smoky tune that sounds like the Neon at 3 AM.] ♪",
    "♪ [He hits a high note, loses it, and pretends he meant to.] ♪",
    "♪ Ba-da-bap, ba-da-bap, bwaaaah… ♪",
    "♪ [Something that was probably a love song, once.] ♪",
  ];

  // ------------------------------------------------------------------
  // Roster (pushed onto 47's ROSTER — spawned, scheduled and saved like the rest)
  // ------------------------------------------------------------------
  const R = [];
  const stall = (id, name, n, o) =>
    R.push(
      gh(
        Object.assign(
          {
            id,
            name,
            role: "merchant",
            ai: "merchant",
            voice: "merchant",
            level: 5,
            homeR: 1.2,
            where: [["market_stall_" + n], null],
          },
          o,
        ),
      ),
    ); // a trader without a built stall is never faked in the street
  stall("neon_smokes", "Smokestack Sid", 9, {
    outfit: "merchant",
    gender: "m",
    hat: "fedora",
    hatColor: 0x4a3a2a,
    routine: "stall_day",
    dialogue: "dlg_neon_stall2",
    merchant: { scrip: 300, stock: STOCK.smokes, restock: 2 },
    barks: {
      greet: [
        "Smokes, gum, pencils, the little things that make the end of the world bearable.",
        "Sid's Sundries. You need it small, I got it small.",
      ],
      idle: [
        "Smokes! Old-world smokes! Only a little stale!",
        "Pencils! For your crossword, or your last will!",
        "Gum! Chew it before it chews you!",
      ],
    },
  });
  stall("neon_tinker", "Nuts-and-Bolts Nell", 10, {
    outfit: "drifter",
    gender: "f",
    hat: "bandana",
    hatColor: 0x5a4a2a,
    routine: "stall_night",
    dialogue: "dlg_neon_stall2",
    merchant: { scrip: 300, stock: STOCK.tinker, restock: 2 },
    barks: {
      greet: [
        "Night market's open. Nell's got what Joe threw out and Joe don't know it yet.",
        "Forks, tubes, wire, pans. Everything a growing girl needs.",
      ],
      idle: [
        "Salvage! Fresh from the ruins!",
        "Buyin' scrap! Sellin' scrap! Scrap all night!",
        "Got a pan here only slightly melted!",
      ],
    },
  });
  stall("neon_sadie", "Souvenir Sadie", 11, {
    outfit: "survivor_layers",
    gender: "f",
    hat: "cap",
    hatColor: 0x2a5a8a,
    routine: "stall_late",
    dialogue: "dlg_neon_stall2",
    merchant: { scrip: 350, stock: STOCK.souvenir, restock: 2 },
    barks: {
      greet: [
        "Souvenirs of the Big Apple! Get 'em before the apple gets you!",
        "Paperweights, Lady Liberty, genuine old-world dollars! Take a piece of New York home! If you have a home!",
      ],
      idle: [
        "I ♥ NY! Still do! Mostly!",
        "Paperweights! Heavy as a guilty conscience! Twice as decorative!",
        "Postcards! Wish you were here! Nobody is!",
      ],
    },
  });
  stall("neon_hotdog", "Frankie Franks", 12, {
    outfit: "settler",
    gender: "m",
    hat: "cap",
    hatColor: 0xd8d8d0,
    routine: "stall_day",
    dialogue: "dlg_neon_stall2",
    merchant: { scrip: 250, stock: STOCK.hotdog, restock: 2 },
    barks: {
      greet: [
        "Frankie's Franks! Coney Island dogs, genuine! The island's underwater, the dogs are genuine!",
        "Mustard? No mustard. Relish? No relish. Dog? DOG.",
        "Welcome to Forever Franks, licensed franchise! So good they'll outlive you!",
      ],
      idle: [
        "Hot dogs! Pretzels! Food that was food once!",
        "Frank-in-a-Bun! Sealed fresh by the Miracle-Keep process! Fresh as the day it was made!",
        "Get your dogs here! No dogs were harmed! Probably!",
        "Pretzels! Salted by the ocean spray! It's radioactive spray!",
      ],
    },
  });

  R.push(
    gh({
      id: "neon_sax",
      name: "Blue Note Benny",
      role: "busker",
      outfit: "survivor_layers",
      gender: "m",
      hat: "fedora",
      hatColor: 0x1a1a2a,
      ai: "static",
      voice: "settler",
      level: 3,
      routine: "busker",
      songs: SAX,
      dialogue: "dlg_neon_busker",
      where: [["hawker_4"], { near: ["plaza", "center"], dx: 8, dz: 6 }],
      barks: {
        greet: [
          "Evening. Tips in the case. Requests in the case too — but tips first.",
          "You like the sax, friend? The sax likes you.",
        ],
        idle: [
          "*warms up the reed*",
          "This one's for the ones who didn't make it.",
        ],
      },
    }),
  );
  R.push(
    gh({
      id: "neon_bellhop",
      name: "Bellhop Barnaby",
      role: "hawker",
      outfit: "merchant",
      gender: "m",
      hat: "cap",
      hatColor: 0x8a1a1a,
      ai: "static",
      voice: "settler",
      level: 3,
      routine: "hawker",
      dialogue: "dlg_neon_bellhop",
      where: [
        ["hawker_5"],
        { near: ["entrance_south", "plaza"], dx: 0, dz: -4 },
      ],
    }),
  );
  R.push(
    gh({
      id: "neon_campaign",
      name: "Polly Prentiss",
      role: "hawker",
      outfit: "settler",
      gender: "f",
      hat: "bandana",
      hatColor: 0x2a3a8a,
      ai: "static",
      voice: "settler",
      level: 3,
      routine: "hawker",
      dialogue: "dlg_neon_campaign",
      where: [["hawker_6"], { near: ["mayor", "plaza"], dx: 3, dz: 3 }],
    }),
  );

  // ---- interior people (requireAnchor: only where the interior stream built the place) ----
  R.push(
    gh({
      id: "neon_patient1",
      name: 'Mickey "Two-Stitches" Moran',
      role: "patient",
      outfit: "survivor_layers",
      gender: "m",
      ai: "sit",
      voice: "settler",
      level: 3,
      dialogue: "dlg_neon_patient",
      where: [["clinic_bed_1"], null],
      barks: {
        idle: [
          "Ow.",
          "Doc? DOC? …Doc says the arm goes back on Tuesday.",
          "*groans*",
        ],
      },
    }),
  );
