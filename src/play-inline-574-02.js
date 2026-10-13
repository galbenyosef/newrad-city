// play-inline-574 02 — mesh
// Lines 54-404 of readable/play-inline-574.pretty.js (statement-aligned).
  const DEFS = [
    // ------------------------------------------------------------ The Big Apple Survival Guide
    Q({
      id: "qx_pocket_snap",
      name: "Brightline Pocket Snap",
      mesh: "camera",
      desc: 'Dot Finch\'s old-world instant camera. "Brightline — Because Tomorrow Forgets!" Seven exposures left. Dot says six of them are cursed.',
    }),
    Q({
      id: "qx_photo_flatiron",
      name: "Snapshot: The Flatiron",
      mesh: "paper",
      desc: "A photograph of the Flatiron Building's prow, slightly overexposed. A pigeon with one eye too many has wandered into the frame.",
    }),
    Q({
      id: "qx_photo_times",
      name: "Snapshot: Times Square",
      mesh: "paper",
      desc: "The Neon at full blaze. An old showman in the foreground is tipping his hat to the camera. The hat has seen better decades. So has the showman.",
    }),
    Q({
      id: "qx_photo_chrysler",
      name: "Snapshot: The Chrysler Building",
      mesh: "paper",
      desc: "The crown of the Chrysler, gleaming. If you look closely there is a raider on the 61st-floor eagle, looking closely back.",
    }),
    Q({
      id: "qx_photo_bridge",
      name: "Snapshot: The Brooklyn Bridge",
      mesh: "paper",
      desc: 'Gothic arches and a sagging web of cables. A hand-painted sign reads "TOLL: EVERYTHING".',
    }),
    Q({
      id: "qx_photo_liberty",
      name: "Snapshot: Lady Liberty",
      mesh: "paper",
      desc: "The Statue of Liberty across the harbour, torch up, patina gone the colour of old mint. Something large and armoured is surfacing in the corner of the frame.",
    }),
    Q({
      id: "qx_plaster",
      name: "Bag of Plaster of Paris",
      mesh: "bag_small",
      desc: 'Dot\'s "fieldwork plaster". Just add water and bravery.',
    }),
    Q({
      id: "qx_claw_cast",
      name: "Ripjaw Footprint Cast",
      mesh: "statuette",
      weight: 2,
      desc: "A plaster cast of a ripjaw track: three toes, a heel spur and a fourth claw that drags. It is roughly the size of a manhole cover. The claw marks go all the way through.",
    }),
    NOTE({
      id: "qx_guide_book",
      name: "The Big Apple Survival Guide",
      title:
        "THE BIG APPLE SURVIVAL GUIDE — by Dorothea Finch (with research by {NAME})",
      weight: 1,
      value: 150,
      mesh: "book",
      quest: false,
      text:
        'THE BIG APPLE SURVIVAL GUIDE\nA Visitor\'s Companion to New Rad City\nby Dorothea "Dot" Finch\nField research: {NAME}\n\n' +
        "FOREWORD\nWelcome to New York — sorry, New Rad City; the sign-painters voted. Whether you thawed out of a government freezer, rode in on a pack ox, " +
        "or woke up in a gutter wearing somebody else's goggles, you have arrived in the greatest city on (or under) Earth. This book will help you see the sights, " +
        "eat like a local, blend in, ride the rails and enjoy the wildlife — mostly in that order.\n\n" +
        "CHAPTER ONE: SIGHTS & SOUNDS\nEvery great city has a skyline. Ours has one with holes in it, which means more light gets through. " +
        "Bring a camera. Bring a second camera for when the first one is eaten.\n\n" +
        "CHAPTER TWO: LOCAL CUISINE\nThe New York hot dog has survived the '67 War, twenty-two years of decay and the collapse of every known " +
        "food-safety authority. Respect it. Do not ask what it is. It does not know either.\n\n" +
        'CHAPTER THREE: BLENDING IN\nNothing says "I\'m a local" like a gentle healthy glow. Our research assistant soaked up a truly heroic dose ' +
        'for this chapter and reports only mild hair loss, a metallic taste and "the humming".\n\n' +
        "CHAPTER FOUR: PUBLIC TRANSIT\nThe subway is still running! Not the trains. The Maniacs. Please stand clear of the closing jaws.\n\n" +
        "CHAPTER FIVE: WILDLIFE OF CENTRAL PARK\nThe ripjaw is a shy creature that wants only to be left alone, and also to eat you. " +
        "Observe it from a respectful distance (another borough).\n\n" +
        "AFTERWORD\nNew York isn't dead. It's just resting its eyes. See you on the streets!\n— Dot",
    }),

    // ------------------------------------------------------------ Extra! Extra! (Scoop)
    NOTE({
      id: "qx_gazette",
      name: "The Manhattan Clarion",
      title: "THE MANHATTAN CLARION — Vol. 1, No. 311 — PRICE: 2 SCRIP",
      quest: true,
      weight: 0.1,
      text:
        'BRUTE CLIMBS EMPIRE STATE, DEMANDS "QUEEN"\nMidtown residents report a Brute of unusual size occupying the observation deck and ' +
        "shouting for a bride. Anyone matching the description of a queen is advised to stay indoors.\n\n" +
        "NEON MAYOR CELEBRATES 18 YEARS SINCE LAST ELECTION\nThe mayor of Times Square marked the anniversary of the Neon's 1971 vote, which he won 83 to 0. His opponent, a mannequin, " +
        "did not campaign, and has not asked for a recount.\n\n" +
        "WEATHER\nOverlit. Chance of glowing: 60%.\n\n" +
        'CLASSIFIEDS\nLOST: Burrow rat, answers to "Mister Buttons". Reward. Ask for Edna, 5th & 23rd.\nFOR SALE: Bus pass, M42, never used. ' +
        "Serious enquiries only.\nWANTED: Research assistant, must be durable. Enquire Finch's Facts, Grand Central.",
    }),

    // ------------------------------------------------------------ Last Stop (Pennington)
    NOTE({
      id: "qx_m42_timetable",
      name: "M42 Crosstown Timetable",
      title:
        "N.Y.C. TRANSIT AUTHORITY — M42 CROSSTOWN — SUNDAY & HOLIDAY SERVICE",
      quest: true,
      text:
        "EASTBOUND — PARK AVE & 38th ST\n  7:47  8:17  8:47  9:17  [9:47]  10:17  10:47\n\n" +
        'The 9:47 has been circled in pencil. Beside it, in a shaky hand: "LATE AGAIN. SUN MAR 5."\n\n' +
        "NOTICE: In the event of enemy air attack, service may be subject to delays.",
    }),
    Q({
      id: "qx_pocket_watch",
      name: "Pennington's Pocket Watch",
      type: "misc",
      quest: false,
      value: 85,
      weight: 0.1,
      mesh: "lighter",
      desc: 'A gold-plated commuter\'s watch, engraved "H.P. — 25 YEARS OF PUNCTUALITY — KNICKERBOCKER MUTUAL". It stopped at 9:47.',
    }),

    // ------------------------------------------------------------ No Standing Anytime (MUNI-7)
    NOTE({
      id: "qx_citation",
      name: "Parking Citation #19670305-0001",
      title: "CITY OF NEW YORK — DEPT. OF TRAFFIC — NOTICE OF VIOLATION",
      quest: true,
      text:
        "ISSUED BY: MUNICIPAL ENFORCEMENT UNIT MUNI-7\nOFFENDER: {NAME} (PEDESTRIAN, UNREGISTERED)\nLOCATION: 5TH AVENUE, NO STANDING ANYTIME ZONE\n\n" +
        "VIOLATION(S):\n  §4-08 Standing in a No Standing zone\n  §4-12 Wearing a federal cryo suit outside a federal facility\n  §4-99 Loitering with intent to survive\n\n" +
        "FINE: $1,967.00 (ONE THOUSAND NINE HUNDRED SIXTY-SEVEN DOLLARS)\nLATE PENALTY (ACCRUED SINCE ISSUANCE): $0.00\n\n" +
        "Pay by mail or in person at any Municipal Enforcement Unit. Failure to pay may result in the booting of your vehicle, or you.",
    }),
    {
      id: "qx_impound_key",
      name: "Impound Locker Key",
      type: "key",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      mesh: "key",
      tags: ["key"],
      desc: 'A brass key stamped "N.Y.C. DEPT. OF TRAFFIC — IMPOUND — 5TH AVE". Opens the city impound locker at the curb.',
    },

    // ------------------------------------------------------------ A Frank Exchange of Views (Iggy & Mort)
    Q({
      id: "qx_doctored_mustard",
      name: "Doctored Mustard",
      mesh: "bottle_small",
      desc: "A squeeze bottle of mustard with a generous dose of Homeguard Cleanser stirred in. It smells exactly the same, which is the worrying part.",
    }),
    Q({
      id: "qx_mort_relish",
      name: 'Mort\'s "Special" Relish',
      mesh: "bottle_small",
      desc: 'Green relish with something that glows faintly at the bottom of the jar. Mort says it\'s "just pickle". It is not just pickle.',
    }),
    NOTE({
      id: "qx_franks_recipe",
      name: "Recipe: Iggy & Mort's Onion Sauce",
      title: "Iggy & Mort's — THE SAUCE (Family Secret, Both Families)",
      text:
        "[Written on the back of a page torn from the Forever Franks franchise manual, under the little top-hat frank and his hourglass.]\n\nOnions (any colour, however many heads they came with)\nOne can tomato paste (old-world, dent optional)\nCinnamon (Mort insists)\nNo cinnamon (Iggy insists)\n" +
        "A shake of chili, a shake of salt, a shake of whatever's in the brown tin\n\nSimmer until it stops moving. Serve on anything that has also stopped moving.",
    }),

    // ------------------------------------------------------------ To Glow, or Not to Glow (Bixby)
    NOTE({
      id: "qx_script_page_1",
      name: "Script Page (Act I)",
      title: '"HAMLET OF HOBOKEN" — ACT I, sc. i',
      quest: true,
      text:
        "HAMLET: (to a skull) Alas, poor Yorick! I knew him, Horatio. He owed me eleven Scrip.\nHORATIO: My lord, that skull is still wearing a hat.\n" +
        "HAMLET: Then he is better dressed than he was in life. (He takes the hat.)",
    }),
    NOTE({
      id: "qx_script_page_2",
      name: "Script Page (Act II)",
      title: '"HAMLET OF HOBOKEN" — ACT II, sc. ii',
      quest: true,
      text:
        "HAMLET: To glow, or not to glow — that is the question.\nWhether 'tis nobler in the lungs to suffer\nThe roentgens and the rems of outrageous ash,\n" +
        "Or to take Prussian Blue against a sea of isotopes,\nAnd by excreting, end them.\n(Stage direction: HAMLET exits, urgently.)",
    }),
    NOTE({
      id: "qx_script_page_3",
      name: "Script Page (Act V)",
      title: '"HAMLET OF HOBOKEN" — ACT V, sc. ii (FINAL PAGE)',
      quest: true,
      text:
        "HAMLET: The rest is static.\n(He dies. Everyone dies. A Brute enters from stage left.)\nBRUTE: WHERE IS THE LITTLE PRINCE.\n" +
        "HORATIO: You're too late. They're all dead.\nBRUTE: GOOD. LESS WAITING IN LINE FOR SNACKS.\n(Curtain. Applause, hopefully.)",
    }),
    {
      id: "qx_bixby_hat",
      name: "Bixby's Opera Hat",
      type: "apparel",
      slot: "head",
      weight: 1,
      value: 60,
      dr: 1,
      attrs: { presence: 1 },
      skills: { persuasion: 5 },
      tags: ["apparel", "hat"],
      mesh: "hat_top",
      noLoot: true,
      desc: "A collapsible opera hat, lovingly re-glued. It still springs open with a satisfying POP. Wear it and people listen, if only to see what it does next. (+1 Presence, +5 Persuasion)",
    },

    // ------------------------------------------------------------ Mister Buttons (Edna)
    {
      id: "qx_edna_cookies",
      name: "Edna's Glow-Oat Cookies",
      type: "aid",
      weight: 0.2,
      value: 12,
      mesh: "cakes",
      sound: "eat",
      tags: ["food"],
      effects: { hpOverTime: [30, 6], rads: -5 },
      noLoot: true,
      desc: 'Oatmeal cookies baked on a car hood by a woman who calls you "dear". The oats were irradiated once, but Edna says she "talked to them".',
    },

    // ------------------------------------------------------------ Water Rising (Cryo Unit C-4)
    REEL({
      id: "qx_reel_c4_day12",
      name: 'Tape Reel: "C-4 — Day Twelve"',
      title: "Cryo Unit C-4 — Facility Director's Log, Day 12",
      text:
        "[Water dripping. A woman's voice, hoarse but precise.]\n\nBRANDT: Director's log, Cryo Unit C-4, day twelve. The thawed held a vote this " +
        "morning. Fifty-nine for opening the freight hatch and taking our chances on the surface. Two against. I was one of the two.\n\n" +
        "Marcus Abernathy was the other. He said he didn't want to miss the next radio show. I think he was joking. I think.\n\n" +
        "They leave tonight. I've given them the rations, the rifles and the map. I've kept the transmitter. Someone has to be here when " +
        "the Office of Civil Defense answers. Someone has to tell them what happened to C-4.\n\nEnd log.\n\n[Pause.]\n\nBRANDT: ...Washington is going to answer. Isn't it.\n\n[Click.]",
    }),
    NOTE({
      id: "qx_c4_roll",
      name: "Cryo Unit C-4 Departure Roll",
      title: "CRYO UNIT C-4 — PERSONNEL DEPARTING VIA FREIGHT HATCH",
      text:
        'Signed by each sleeper and crew member on leaving. 59 names.\n\nAdler, Ruth — "Save my seat, Director."\nBaptiste, Lorraine & family (4)\nCho, Daniel — "See you topside, Director."\n' +
        '...\nYu, Min-jun — "Thank you for thawing us. Come with us. Please."\n\nOn the back, a later hand, in pencil, years afterwards by the look of it:\n' +
        '"Made it to the Ellis ferry slip, all 59. Took the long way round. We send the kids to the seawall every spring to wave at the hatch. ' +
        "She never comes up. Tell her we're alright. — L.B.\"",
    }),
    {
      id: "qx_c4_cryo_suit",
      name: "Long Winter Cryo Suit (C-4)",
      type: "apparel",
      slot: "body",
      weight: 1,
      value: 45,
      dr: 4,
      outfit: SUIT_OUTFIT,
      skills: { survival: 5 },
      tags: ["apparel", "clothing", "cryo"],
      mesh: SUIT_MESH,
      noLoot: true,
      desc: 'A grey-white padded Project Long Winter cryo suit with an orange collar ring and "C-4" stencilled across the shoulders. Never worn: it has been folded in a locker for twenty-two years, waiting for someone.',
    },
    {
      id: "qx_c4_director_key",
      name: "C-4 Director's Key",
      type: "key",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      mesh: "key",
      tags: ["key"],
      desc: 'An Office of Civil Defense master key on a lanyard. The tag reads "UNIT C-4 — FACILITY DIRECTOR — DO NOT LEND". Opens the Director\'s office bulkhead and her footlocker.',
    },

    // ------------------------------------------------------------ Numbers Game
    NOTE({
      id: "qx_cipher_sheet",
      name: "Continuity One-Time Pad (Sheet 14)",
      title:
        "CLASSIFIED — CONTINUITY SIGNALS OFFICE — PAD 14 — DESTROY AFTER USE",
      quest: true,
      text:
        "A grid of five-digit groups printed on rice paper, plus a substitution key along the bottom.\n\n" +
        'Someone has pencilled in the margin: "Don\'t forget to eat this after reading — Lt. D."\n\nNobody ate it.',
    }),
    NOTE({
      id: "qx_decoded_signal",
      name: "Decoded Transmission (Numbers Station)",
      title: "UNIDENTIFIED SIGNAL 93.9 — DECODED (with Static Okonkwo)",
      text:
        'MORSE HEADER: Z MARLOW LIBERTY\n  "Z" = Continuity priority prefix: DETAINEE. (Marlow: the second sleeper, held on Liberty.)\n\n' +
        'GROUP 1 — 60041: Liberty resupply window, 0600. One Rotorcraft. Rear rotor still "sounds like a dishwasher".\n' +
        "GROUP 2 — 99273: Sky-Eye relay net, frequency rotation. Change every Tuesday. (It is always Tuesday somewhere.)\n" +
        "GROUP 3 — 196789 (THE NAME READINGS):\n" +
        '  WAYTE, E. — FILE C-9/WAYTE — PRIORITY ASSET. RECOVER WITH THE KEY. "Walking around Manhattan in a cryo suit."\n' +
        "  MEAD, N. — STRUCK 1968.\n" +
        "  MEAD, R. — UNENROLLED — DIRECTIVE 7-A SCHEDULE C (STERILISE).\n" +
        "  SUN CULT EMISSARY REQUESTS KEY B — REFUSED. EMISSARY ESCORTED OFF THE ISLAND.\n\n" +
        'Static\'s note underneath: "Kid. That first line is you."',
    }),

    // ------------------------------------------------------------ The Closing Bell
    {
      id: "qx_shackle_key",
      name: "Pit Boss's Shackle Key",
      type: "key",
      weight: 0,
      value: 0,
      quest: true,
      noLoot: true,
      mesh: "key",
      tags: ["key"],
      desc: 'A small iron key on a loop of ticker tape. Someone has written "HARLAN" on the tape and underlined it twice.',
    },
    NOTE({
      id: "qx_pruitt_voucher",
      name: "Pruitt Trade Convoy Voucher",
      title: "PRUITT & SONS OVERLAND FREIGHT — GOOD FOR ONE (1) FAVOUR",
      text:
        'The bearer is owed one favour by Harlan Pruitt, convoy master, lately of the Exchange\'s "inventory".\n\n' +
        "Favours include: freight, directions, bad jokes, a hot meal, a place by the fire, and one (1) opinion on oxen, whether requested or not.\n\n— H.P.",
    }),

    // ------------------------------------------------------------ Street encounters
    NOTE({
      id: "qx_zora_card",
      name: "Atomic Tarot: The Stranger",
      title: "THE STRANGER (upright)",
      weight: 0,
      value: 5,
      quest: false,
      text:
        "A hand-painted card: a small figure in a grey-white padded suit with an orange collar, walking toward a skyline that is on fire.\n\n" +
        'On the back, in Madame Zora\'s spidery hand: "You will travel far, meet many people, and shoot most of them. Tip your fortune teller."',
    }),
  ];

  QX.hook("items", function () {
    if (!QX.live("items")) return;
    for (const d of DEFS) {
      const def = Object.assign({}, d);
      // attribute boons are written by name; the rpg registry gets them in whatever form it currently reads
      if (def.attrs) {
        const m = QX.attrMods(def.attrs);
        delete def.attrs;
        Object.assign(def, m);
      }
      // {NAME} is resolved when the note is read (quests' notes use the same token), but keep a static fallback.
      QX.defineItem(def);
    }
  });
  // Personalise {NAME} tokens in note titles/texts with the player's name (on new game / load).
