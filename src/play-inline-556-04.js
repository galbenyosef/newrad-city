// play-inline-556 04 — gender
// Lines 677-1424 of readable/play-inline-556.pretty.js (statement-aligned).
  function roster() {
    const R = [];
    // ---- Neon Guards ----
    R.push(
      gh({
        id: "neon_capt",
        name: "Captain Mercy Kincaid",
        role: "captain",
        outfit: "combat_armor",
        gender: "f",
        hat: "beret",
        hatColor: 0x7a1c1c,
        level: 14,
        essential: true,
        weapon: ["assault_rifle"],
        ai: "guard",
        voice: "guard",
        dialogue: "dlg_neon_capt",
        guard: true,
        where: [
          ["guard_captain"],
          { near: ["gate_n", "guard1", "entrance"], dx: 3, dz: 5 },
        ],
        barks: {
          greet: [
            "Kincaid. Captain of the Neon Guard. You behave, we get along.",
            "Stranger. Welcome. Keep your hands where I can see them.",
          ],
          idle: [
            "Guard rotation in ten. Look sharp.",
            "Nobody sleeps on my wall.",
            "Two gates quiet, two gates lying.",
          ],
        },
      }),
    );
    GATES.forEach(([d, old, ox, oz], gi) => {
      for (let k = 1; k <= 2; k++) {
        R.push(
          gh({
            id: "neon_g" + d + k,
            name: "Neon Guard",
            role: "gate",
            gate: d,
            outfit: k === 1 ? "combat_armor" : "leather_armor",
            gender: (gi + k) % 3 ? "m" : "f",
            hat: k === 1 ? "helmet" : "beret",
            hatColor: k === 1 ? 0x44463a : 0x7a1c1c,
            level: 9,
            weapon: [GUARD_W[gi * 2 + k - 1], "hunting_rifle"],
            ai: "guard",
            voice: "guard",
            dialogue: "dlg_neon_guard",
            guard: true,
            where: [
              ["gate_" + d + "_guard" + k],
              {
                near: ["gate_" + d, old],
                dx: ox * 0.5 + (k === 1 ? -1.8 : 1.8) * (oz ? 1 : 0),
                dz: oz * 0.5 + (k === 1 ? -1.8 : 1.8) * (ox ? 1 : 0),
              },
            ],
          }),
        );
      }
    });
    for (let k = 1; k <= 2; k++) {
      R.push(
        gh({
          id: "neon_pat" + k,
          name: "Neon Guard",
          role: "patrol",
          outfit: "leather_armor",
          gender: k === 1 ? "m" : "f",
          hat: "beret",
          hatColor: 0x7a1c1c,
          level: 9,
          weapon: [k === 1 ? "smg_10mm" : "combat_shotgun", "pistol_10mm"],
          ai: "patrol",
          voice: "guard",
          dialogue: "dlg_neon_guard",
          guard: true,
          where: [
            ["crowd_" + k * 5],
            { near: ["plaza_centre", "center"], dx: k === 1 ? -8 : 8, dz: 4 },
          ],
        }),
      );
    }
    for (let k = 1; k <= 2; k++) {
      R.push(
        gh({
          id: "neon_snp" + k,
          name: "Neon Sharpshooter",
          role: "sniper",
          outfit: "combat_armor",
          gender: k === 1 ? "f" : "m",
          hat: "helmet",
          hatColor: 0x44463a,
          level: 11,
          weapon: ["sniper_rifle", "hunting_rifle"],
          ai: "guard",
          voice: "guard",
          guard: true,
          holdPos: true,
          sniper: true,
          where: [["sniper_" + k, k === 1 ? "lookout" : "guard5"], null],
          maxR: 1.5,
        }),
      );
    }
    // ---- The Marquee Market ----
    const stall = (id, name, n, oldNames, o) =>
      R.push(
        gh(
          Object.assign(
            {
              id,
              name,
              role: "merchant",
              ai: "merchant",
              voice: "merchant",
              level: 6,
              where: [
                ["market_stall_" + n].concat(o.alt || []),
                { near: oldNames, dx: 0, dz: 0 },
              ],
              homeR: 1.2,
            },
            o,
          ),
        ),
      );
    stall("neon_tillie", "Two-Gun Tillie", 1, ["merchant1"], {
      outfit: "leather_armor",
      gender: "f",
      hat: "cowboy",
      hatColor: 0x3a2a1a,
      weapon: ["magnum_44", "pistol_10mm"],
      routine: "stall_day",
      merchant: { scrip: 700, stock: STOCK.guns, restock: 3 },
      dialogue: "dlg_neon_tillie",
      barks: {
        greet: [
          "Tillie's Iron. You break it, you bought it. You shoot it at me, you bought it twice.",
          "Looking for something that goes bang, sugar?",
        ],
        idle: [
          "Guns! Guns that mostly work!",
          "Every piece here's been fired at least once. By me. At raiders.",
          "Ask about the layaway plan! There is no layaway plan.",
        ],
      },
    });
    stall("neon_brass", "Brass Beaumont", 2, ["merchant3", "merchant2"], {
      outfit: "merchant",
      gender: "m",
      hat: "fedora",
      hatColor: 0x6a5a30,
      routine: "stall_day",
      merchant: { scrip: 500, stock: STOCK.ammo, restock: 2 },
      dialogue: "dlg_neon_brass",
      barks: {
        greet: [
          "Brass Beaumont, purveyor of fine ammunition. Every round hand-counted. Twice.",
          "Running low? Nobody leaves Brass running low.",
        ],
        idle: [
          "Ammo! Ten-mil, five-five-six, shells, cells! Bullets for every occasion!",
          "Buy in bulk, die less!",
          "I reload my own brass. That's where the name comes from. Also my face.",
        ],
      },
    });
    stall("neon_mags", "Mags Delacroix", 3, ["merchant4", "vendor1"], {
      outfit: "merchant",
      gender: "f",
      hat: "bandana",
      hatColor: 0x6a2a5a,
      routine: "stall_day",
      merchant: { scrip: 550, stock: STOCK.armor, restock: 3 },
      dialogue: "dlg_neon_mags",
      barks: {
        greet: [
          "Mags Delacroix. Armour, clothes, hats. I dress the living and the mostly-living.",
          "Oh, honey. We need to talk about that outfit.",
        ],
        idle: [
          "Leather, metal, silk! Protect your hide in style!",
          "Old-world formals! Bullet holes pre-mended!",
          "Hats! A hat hides a multitude of sins. And scalps.",
        ],
      },
    });
    stall("neon_joe", "Scrapper Joe", 4, ["repairman", "vendor2"], {
      outfit: "drifter",
      gender: "m",
      hat: "cap",
      hatColor: 0x4a4030,
      routine: "stall_late",
      merchant: { scrip: 350, stock: STOCK.junk, restock: 2 },
      dialogue: "dlg_neon_joe",
      barks: {
        greet: [
          "Scrapper Joe. I buy junk, I sell junk, I AM junk. What'll it be?",
          "Got tin cans, got duct tape, got a lunchbox that hums. Don't ask about the lunchbox.",
        ],
        idle: [
          "Scrap! Parts! Treasures of the ancients!",
          "Bring me your broken toasters!",
          "One man's trash is another man's… also trash. But I'll buy it.",
        ],
      },
    });
    stall("neon_noodle", "Old Sato", 5, ["noodles", "noodles_customer"], {
      outfit: "merchant",
      gender: "m",
      hat: "cap",
      hatColor: 0xdddddd,
      routine: "stall_night",
      alt: ["noodles"],
      merchant: { scrip: 220, stock: STOCK.noodles, restock: 2 },
      dialogue: "dlg_neon_noodle",
      barks: {
        greet: [
          "Sit, sit. Noodles are hot. Everything else is cold. Especially the customers.",
          "You want noodles? Two. Two is enough. Trust me.",
        ],
        idle: [
          "Noodles! Hot noodles!",
          "Real broth! Almost real!",
          "Rain, no rain, the noodle man is open.",
        ],
      },
    });
    stall("neon_bev", "Oxcart Bev", 6, ["butcher"], {
      outfit: "settler",
      gender: "f",
      hat: "bandana",
      hatColor: 0x8a2a1a,
      routine: "stall_day",
      alt: ["butcher"],
      merchant: { scrip: 250, stock: STOCK.grill, restock: 2 },
      dialogue: "dlg_neon_bev",
      barks: {
        greet: [
          "Bev's Grill! Ox, roach or pigeon, grilled to order.",
          "Steak's fresh. The ox was named Gerald. He was a good boy.",
        ],
        idle: [
          "Ox steak! Pigeon bits! Hot off the hubcap!",
          "Get it while it's cooked!",
          "Roach kebabs, three for a scrip! Legs extra!",
        ],
      },
    });
    stall("neon_candy", "Candy Rourke", 7, ["merchant2", "merchant1"], {
      outfit: "drifter",
      gender: "m",
      hat: "fedora",
      hatColor: 0x2a2a3a,
      routine: "stall_night",
      merchant: { scrip: 450, stock: STOCK.chems, restock: 3 },
      dialogue: "dlg_neon_candy",
      barks: {
        greet: [
          "Candy's the name, chems are the game. Doc Broadway hates me. That's how you know I'm good.",
          "Need a pick-me-up? A put-me-down? A take-me-somewhere-else?",
        ],
        idle: [
          "Rush! Rage! Bull tabs! Legal as the day is long!",
          "Candy for the soul, friends!",
          "First hit's full price. Second hit too. I'm not a charity.",
        ],
      },
    });
    stall("neon_willie", "Wet Willie", 8, ["water", "vendor1"], {
      outfit: "settler",
      gender: "m",
      hat: "cowboy",
      hatColor: 0x5a4028,
      routine: "stall_late",
      alt: ["water"],
      merchant: { scrip: 300, stock: STOCK.water, restock: 2 },
      dialogue: "dlg_neon_willie",
      barks: {
        greet: [
          "Wet Willie! Water, booze, and Fizzo — if it pours, I sell it.",
          "Thirsty? Course you are. Everybody's thirsty. It's the apocalypse.",
        ],
        idle: [
          "Clean water! Only lightly glowing!",
          "Ice-cold Fizzo! Well. Cool-ish.",
          "Whiskey! For medicinal purposes! The medicine is whiskey!",
        ],
      },
    });
    // ---- The places ----
    R.push(
      gh({
        id: "neon_broadway",
        name: "Doc Broadway",
        role: "doctor",
        outfit: "doctor",
        gender: "m",
        ai: "merchant",
        voice: "merchant",
        level: 8,
        essential: true,
        where: [
          ["clinic_doctor", "clinic_door"],
          { near: ["doctor"], dx: 1.6, dz: 0.8 },
        ],
        dialogue: "dlg_neon_broadway",
        merchant: { scrip: 600, stock: STOCK.doc, restock: 3 },
        barks: {
          greet: [
            "Doc Broadway. Surgeon, pharmacist, and understudy. What seems to be the trouble?",
            "Sit down, sit down. You're bleeding on my lobby.",
          ],
          idle: [
            "Next patient!",
            "The limb goes back on the OTHER way.",
            "Scalpel. Scalpel! …Where did I put the scalpel.",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_annie",
        name: "Ammo Annie",
        role: "shop",
        outfit: "combat_armor",
        gender: "f",
        hat: "cowboy",
        hatColor: 0x6a3a1a,
        ai: "merchant",
        voice: "merchant",
        level: 10,
        weapon: ["hunting_rifle"],
        where: [
          ["gallery_owner", "gallery_door"],
          { near: ["plaza", "center"], dx: -3, dz: 10 },
        ],
        dialogue: "dlg_neon_annie",
        routine: "shop_keep",
        place: "gallery",
        needsPlace: true,
        merchant: { scrip: 600, stock: STOCK.annie, restock: 3 },
        barks: {
          greet: [
            "Step right up! Annie's Shooting Gallery! Hit the cans, win the scrip!",
            "You look like somebody who can hit a tin can at twenty paces. Prove it.",
          ],
          idle: [
            "Five scrip a round! Knock down the tin raiders!",
            "Sharpshooters wanted! Also targets. Mostly targets.",
            "Step right up, step right up!",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_sprocket",
        name: "Sprocket",
        role: "shop",
        outfit: "drifter",
        gender: "f",
        hat: "hardhat",
        hatColor: 0xc8a020,
        ai: "merchant",
        voice: "merchant",
        level: 7,
        where: [
          ["robo_owner", "robo_door"],
          { near: ["repairman", "vendor2"], dx: 3, dz: 2 },
        ],
        dialogue: "dlg_neon_sprocket",
        routine: "shop_keep",
        merchant: { scrip: 500, stock: STOCK.robo, restock: 3 },
        barks: {
          greet: [
            "Radio repair, robot repair, heart repair — two outta three, anyway.",
            "Careful, that one bites. That one too. Actually, touch nothing.",
          ],
          idle: [
            "Tubes! Sensors! Gently used robot brains!",
            "Your Valet making that noise again? Bring him in!",
            "Fixed radios, fixed prices!",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_goldie",
        name: "Goldie Glass",
        role: "shop",
        outfit: "merchant",
        gender: "m",
        hat: "fedora",
        hatColor: 0xb08a20,
        ai: "merchant",
        voice: "merchant",
        level: 7,
        where: [
          ["pawn_owner", "pawn_door"],
          { near: ["merchant4", "vendor1"], dx: -3, dz: 3 },
        ],
        dialogue: "dlg_neon_goldie",
        routine: "stall_late",
        merchant: { scrip: 2000, stock: STOCK.pawn, restock: 2, sellMult: 1.2 },
        barks: {
          greet: [
            "Goldie Glass, Pawn Palace. I buy anything. ANYTHING. Don't test me, the last guy sold me his shadow.",
            "Welcome, welcome! Where you got it is none of my business.",
          ],
          idle: [
            "Cash for junk! Scrip for trash!",
            "No questions asked! No answers given!",
            "Gold, silver, old-world dollars, suspiciously warm wallets!",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_director",
        name: "Lionel Fairweather",
        role: "director",
        outfit: "merchant",
        gender: "m",
        hat: "bowler",
        hatColor: 0x222222,
        ai: "static",
        voice: "settler",
        level: 5,
        routine: "director",
        where: [
          ["opry_director", "opry_door"],
          { near: ["stage", "singer"], dx: 3, dz: 2 },
        ],
        dialogue: "dlg_neon_director",
        barks: {
          greet: [
            "Lionel Fairweather, artistic director of the Neon Opry. The Neon Opry, dear. The only theatre left in New York with a running show AND a running audience.",
          ],
          idle: [
            "From the top! No — from the bottom! We ARE the bottom!",
            "Where is my lead? Where is my LEAD?",
            "Art never dies. It just smells a bit.",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_velvet",
        name: "Velvet Maloney",
        role: "singer",
        outfit: "survivor_layers",
        gender: "f",
        ai: "static",
        voice: "settler",
        level: 4,
        routine: "singer",
        where: [
          ["opry_stage", "singer", "stage"],
          { near: ["stage"], dx: 0, dz: 1 },
        ],
        dialogue: "dlg_neon_velvet",
        barks: {
          greet: [
            "Velvet Maloney. Yes, THE Velvet Maloney. Well — one of them. The others didn't make it.",
            "Autographs after the show, darling.",
          ],
          idle: [
            "Mi-mi-mi-miiii… oh, my larynx.",
            "Somebody fetch my good wig.",
            "Twenty-two years of standing ovations. Well, standing. Ovations pending.",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_dealer",
        name: "Lucky Lou Parisi",
        role: "dealer",
        outfit: "merchant",
        gender: "m",
        hat: "fedora",
        hatColor: 0x3a1a1a,
        ai: "static",
        voice: "settler",
        level: 6,
        where: [
          ["radroom_cards", "rad_room_cards", "rad_room"],
          { near: ["bar", "bar_patron", "rad_room"], dx: -2.2, dz: 1.5 },
        ],
        dialogue: "dlg_neon_dealer",
        routine: "stall_late",
        barks: {
          greet: [
            "Lucky Lou. Pull up a chair, lose some scrip, tell your friends.",
            "Cards? Cards. Sit.",
          ],
          idle: [
            "House always wins. I'm the house. Look at me — I'm winning.",
            "Shuffle up and deal!",
            "Who wants to lose some money?",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_sparks",
        name: "Sparks Malloy",
        role: "engineer",
        outfit: "drifter",
        gender: "f",
        hat: "hardhat",
        hatColor: 0xd0a020,
        ai: "static",
        voice: "settler",
        level: 8,
        where: [
          ["power_engineer", "power_generator", "power_door"],
          { near: ["stage", "totem"], dx: -4, dz: -3 },
        ],
        dialogue: "dlg_neon_sparks",
        routine: "shop_keep",
        barks: {
          greet: [
            "Sparks Malloy, chief engineer. Don't touch anything that hums.",
            "You smell that? That's ozone. That's the smell of the lights staying on.",
          ],
          idle: [
            "Load's spiking again…",
            "Who plugged a toaster into Circuit Nine?!",
            "Come on, baby, hold together…",
          ],
        },
      }),
    );
    R.push({
      id: "neon_wagon",
      type: "human",
      faction: "settlers",
      name: "Eustace Byrd",
      role: "convoy",
      outfit: "drifter",
      gender: "m",
      hat: "cowboy",
      hatColor: 0x5a4028,
      ai: "guard",
      voice: "merchant",
      level: 10,
      weapon: ["hunting_rifle"],
      where: [
        ["convoy_master", "depot_door", "convoy_arrive"],
        { near: ["entrance_south", "subway"], dx: -6, dz: 2 },
      ],
      dialogue: "dlg_neon_wagon",
      homeR: 3,
      barks: {
        greet: [
          "Eustace Byrd, wagonmaster of the Neon Depot. You looking for work or looking for trouble? We pay for one of those.",
        ],
        idle: [
          "Oxen don't load themselves!",
          "Pack train out at sixteen hundred sharp!",
          "Tighten that strap. No, the OTHER strap.",
        ],
      },
    });
    R.push(
      gh({
        id: "neon_dottie",
        name: "Dottie Blythe",
        role: "innkeeper",
        outfit: "settler",
        gender: "f",
        hat: "bandana",
        hatColor: 0x3a5a8a,
        ai: "static",
        voice: "settler",
        level: 5,
        where: [
          ["bunk_keeper", "bunk_door"],
          { near: ["settler6", "entrance"], dx: 2, dz: 2 },
        ],
        dialogue: "dlg_neon_dottie",
        place: "bunkhouse",
        needsPlace: true,
        barks: {
          greet: [
            "Welcome to the Bunkhouse! Clean sheets, mostly! Twenty scrip a night.",
            "Room for one? We've got room for one. We've got room for forty.",
          ],
          idle: [
            "Checkout's whenever you wake up, sugar.",
            "Beds! Real beds! Springs optional!",
          ],
        },
      }),
    );
    R.push(
      gh({
        id: "neon_whisper",
        name: "Whisper",
        role: "speakeasy",
        outfit: "merchant",
        gender: "m",
        ai: "merchant",
        voice: "merchant",
        level: 6,
        requireAnchor: true,
        where: [["speakeasy_bar", "speakeasy_bartender"], null],
        dialogue: "dlg_neon_whisper",
        merchant: {
          scrip: 300,
          stock: STOCK.water.concat([["fizzo_blue", 1]]),
          restock: 3,
        },
        barks: {
          greet: ["…Password? Kidding. Nobody remembers the password. Sit."],
          idle: ["Shh.", "Keep it down. The walls have ears. Mine, mostly."],
        },
      }),
    );
    // ---- Hawkers ----
    R.push(
      gh({
        id: "neon_newsie",
        name: "Scoop Doolan",
        role: "hawker",
        outfit: "survivor_layers",
        gender: "m",
        hat: "cap",
        hatColor: 0x4a3a2a,
        ai: "static",
        voice: "settler",
        routine: "hawker",
        where: [
          ["hawker_1"],
          { near: ["plaza_centre", "center"], dx: -9, dz: -6 },
        ],
        dialogue: "dlg_neon_hawker",
      }),
    );
    R.push(
      gh({
        id: "neon_doomer",
        name: "Brother Tick-Tock",
        role: "hawker",
        outfit: "drifter",
        gender: "m",
        ai: "static",
        voice: "settler",
        routine: "hawker",
        where: [["hawker_2"], { near: ["plaza", "totem"], dx: 3, dz: 6 }],
        dialogue: "dlg_neon_hawker",
      }),
    );
    R.push(
      gh({
        id: "neon_tout",
        name: "Tickets Tessie",
        role: "hawker",
        outfit: "survivor_layers",
        gender: "f",
        hat: "cap",
        hatColor: 0x8a1a1a,
        ai: "static",
        voice: "settler",
        routine: "hawker",
        where: [["hawker_3"], { near: ["stage", "singer"], dx: -4, dz: 4 }],
        dialogue: "dlg_neon_hawker",
      }),
    );
    // ---- Townsfolk ----
    const folk = (id, name, routine, o) =>
      R.push(
        gh(
          Object.assign(
            {
              id,
              name,
              role: "folk",
              routine,
              ai: "wander",
              voice: "settler",
              level: 3,
              dialogue: "dlg_neon_folk",
              where: [
                ["crowd_" + ((R.length % 20) + 1)],
                {
                  near: ["plaza_centre", "center", "plaza"],
                  dx: (Math.random() - 0.5) * 18,
                  dz: (Math.random() - 0.5) * 18,
                },
              ],
            },
            o,
          ),
        ),
      );
    folk("neon_gums", "Gums Gallagher", "drunk", {
      outfit: "survivor_layers",
      gender: "m",
      hat: "cap",
      hatColor: 0x3a3a2a,
    });
    folk("neon_ruby", "Ruby Fontaine", "reveler", {
      outfit: "survivor_layers",
      gender: "f",
    });
    folk("neon_stan", "Stan Hollis", "porter", {
      outfit: "drifter",
      gender: "m",
      hat: "cap",
      hatColor: 0x5a4a2a,
    });
    folk("neon_pearl", "Grandma Pearl", "shopper", {
      outfit: "settler",
      gender: "f",
      hat: "bandana",
      hatColor: 0x6a5a8a,
    });
    folk("neon_nicky", "Nicky Two-Thumbs", "reveler", {
      outfit: "survivor_layers",
      gender: "m",
      hat: "fedora",
      hatColor: 0x2a2a2a,
    });
    folk("neon_dusty", "Dusty Mae Carver", "shopper", {
      faction: "settlers",
      outfit: "drifter",
      gender: "f",
      hat: "cowboy",
      hatColor: 0x6a5030,
    });
    return R;
  }
