// play-inline-507 07 — types
// Lines 2211-2524 of readable/play-inline-507.pretty.js (statement-aligned).
  C.bark = function (voice, cat) {
    const t = C.BARKS[voice];
    if (!t) return null;
    const arr = t[cat];
    if (!arr || !arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  // ------------------------------------------------------------------
  // Roaming encounters (by district).  Each entry: [weight, group spec]
  // group spec: {types:[[type,count]...], faction?, ai?, name?, friendly?, merchant?, patrol?, wagon?}
  // ------------------------------------------------------------------
  C.ENCOUNTERS = {
    central_park: [
      [4, { types: [["burrow_rat", 3]] }],
      [3, { types: [["gasfly", 2]] }],
      [3, { types: [["dog", 3]] }],
      [2, { types: [["giant_roach", 5]] }],
      [1, { types: [["maniac", 3]] }],
      [0.4, { types: [["ripjaw", 1]], minLevel: 8 }],
      [0.8, { types: [["ash_bear", 1]], minLevel: 6 }],
      [0.8, { types: [["stinger", 2]], minLevel: 4 }],
      [0.8, { types: [["small_stinger", 4]] }],
    ],
    upper_west_side: [
      [3, { types: [["maniac", 3]] }],
      [2, { types: [["raider", 3]] }],
      [2, { types: [["dog", 3]] }],
      [1, { types: [["valet_m", 1]] }],
      [1, { patrol: "covenant" }],
    ],
    upper_east_side: [
      [3, { types: [["maniac", 3]] }],
      [2, { types: [["raider", 3]] }],
      [2, { types: [["giant_roach", 5]] }],
      [1, { types: [["patrolman", 1]] }],
      [1, { patrol: "covenant" }],
    ],
    midtown: [
      [3, { types: [["raider", 3]] }],
      [3, { types: [["maniac", 4]] }],
      [2, { types: [["brute", 2]] }],
      [2, { types: [["giant_roach", 5]] }],
      [1, { types: [["valet_m", 1]] }],
      [1.3, { patrol: "covenant" }],
      [0.8, { wagon: true }],
    ],
    midtown_south: [
      [
        0.7,
        {
          types: [
            ["brute", 1],
            ["lurcher", 2],
          ],
          minLevel: 5,
        },
      ],
      [3, { types: [["brute", 2]] }],
      [3, { types: [["raider", 3]] }],
      [2, { types: [["maniac", 3]] }],
      [1, { types: [["dog", 3]] }],
      [0.8, { wagon: true }],
      [0.8, { patrol: "covenant" }],
    ],
    greenwich_village: [
      [1, { types: [["giant_ant", 4]] }],
      [0.6, { types: [["fire_ant", 3]], minLevel: 5 }],
      [3, { types: [["raider", 3]] }],
      [3, { types: [["dog", 3]] }],
      [2, { types: [["burrow_rat", 3]] }],
      [2, { types: [["maniac", 3]] }],
      [0.8, { wagon: true }],
    ],
    financial_district: [
      [4, { types: [["raider", 4]] }],
      [2, { types: [["valet_m", 1]] }],
      [2, { types: [["shellback", 2]] }],
      [1, { types: [["brute", 2]] }],
    ],
    brooklyn: [
      [1.2, { types: [["stinger", 2]], minLevel: 4 }],
      [0.5, { types: [["giant_stinger", 1]], minLevel: 10 }],
      [4, { types: [["shellback", 2]] }],
      [3, { types: [["dog", 3]] }],
      [2, { types: [["raider", 3]] }],
      [1, { types: [["giant_roach", 5]] }],
    ],
    harbor: [[1, { types: [["shellback", 2]] }]],
  };

  /** Generic settlement populations (quests add the named NPCs). */
  C.SETTLEMENT_POP = {
    grand_central: [
      {
        type: "human",
        outfit: "settler",
        name: "Market Guard",
        voice: "guard",
        ai: "guard",
        pool: "merchant_guard",
        count: 3,
      },
      {
        type: "human",
        outfit: "settler",
        name: "Settler",
        voice: "settler",
        ai: "wander",
        pool: null,
        count: 3,
      },
    ],
    flatiron: [
      {
        type: "human",
        outfit: "combat_armor",
        name: "Wagon Guard",
        voice: "guard",
        ai: "guard",
        pool: "merchant_guard",
        count: 2,
      },
      {
        type: "human",
        outfit: "drifter",
        name: "Trader",
        voice: "settler",
        ai: "wander",
        pool: null,
        count: 2,
      },
    ],
    radio_city: [
      {
        type: "human",
        outfit: "settler",
        name: "Radio City Guard",
        voice: "guard",
        ai: "guard",
        pool: "settler",
        count: 2,
      },
    ],
    times_square: [
      {
        type: "human",
        outfit: "survivor_layers",
        faction: "settlers",
        name: "Neon Bouncer",
        voice: "neon",
        ai: "guard",
        pool: "neon",
        count: 2,
      },
      {
        type: "human",
        outfit: "survivor_layers",
        faction: "settlers",
        name: "Neon Resident",
        voice: "neon",
        ai: "wander",
        pool: null,
        count: 3,
      },
    ],
    rockefeller: [
      {
        type: "covenant_warden",
        name: "Covenant Lancer",
        voice: "covenant",
        ai: "guard",
        pool: "covenant_warden",
        count: 3,
        faction: "covenant",
      },
    ],
    st_patricks: [
      {
        type: "human",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        name: "Glowkeeper",
        voice: "glowkeeper",
        ai: "wander",
        pool: "glowkeeper",
        count: 3,
      },
    ],
  };

  /** Settlements whose population the quests module spawns itself (generics above only without quests). */
  C.SETTLEMENT_QUEST_OWNED = { times_square: true };

  /** Rank names by level (used when a spawn def gives no name). */
  C.rankName = function (type, level, def) {
    const L = level || 1;
    switch (type) {
      case "raider":
        return L >= 9
          ? C.pick(["Raider Veteran", "Raider Butcher", "Raider Wrecker"])
          : L >= 5
            ? C.pick([
                "Raider",
                "Raider Butcher",
                "Raider Scrounger",
                "Raider Punk",
              ])
            : C.pick(["Raider", "Raider", "Raider Scum", "Raider Punk"]);
      case "brute":
        return L >= 17
          ? "Brute Warlord"
          : L >= 12
            ? "Brute Chieftain"
            : L >= 7
              ? "Brute Bonecrusher"
              : "Brute";
      case "maniac":
        return L >= 10 ? "Raving Maniac" : L >= 5 ? "Maniac Prowler" : "Maniac";
      case "maniac_bruiser":
        return L >= 14 ? "Maniac Butcher" : "Maniac Bruiser";
      case "ripjaw":
        return L >= 14 ? "Ripjaw Matriarch" : "Ripjaw";
      case "shellback":
        return L <= 3 ? "Shellback Spawn" : "Shellback";
      case "giant_roach":
        return L >= 8 ? "Blistered Roach" : "Giant Roach";
      case "continuity_soldier":
        return L >= 18
          ? "Continuity Marshal"
          : L >= 14
            ? "Continuity Sergeant"
            : "Continuity Trooper";
      case "covenant_warden":
        return L >= 12 ? "Covenant Warden" : "Covenant Lancer";
      case "valet_m":
        return "Valet-M";
      case "dog":
        return L >= 6 ? "Feral Dog" : "Wild Dog";
      default:
        return null;
    }
  };

  // ------------------------------------------------------------------
  // Reaction window ([CAUTION]): half-noticed player → a "?" bark and a turn of the head.
  // ------------------------------------------------------------------
  C.CAUTION_BARKS = {
    _default: ["Huh?", "What was that?", "Hello?", "...?"],
    raider: [
      "Huh? Somebody there?",
      "Who's creepin'?",
      "Eh? I see ya... maybe.",
      "That you, Skeeter? ...Skeeter?",
    ],
    brute: ["Hrrm? Something moved?", "Smell... something.", "Who is there?"],
    continuity: [
      "Movement. Hold.",
      "Did you see that?",
      "Possible contact. Confirm.",
    ],
    covenant: ["Hold. Something's out there.", "Movement. Eyes up."],
    settler: ["Hello? Who's out there?", "Is someone there?"],
    guard: ["Who goes there?", "Show yourself."],
    neon: ["Somebody there? I got bad eyes, not bad aim."],
    glowkeeper: ["Who approaches the warm place?"],
    patrolman: [
      "Motion detected. Please identify.",
      "Citizen? Please state your business.",
    ],
    valet_m: [
      "Who goes there, recruit?!",
      "Something's rustling! French pigeon?",
    ],
  };
  C.cautionBark = (voice) =>
    C.pick(C.CAUTION_BARKS[voice] || C.CAUTION_BARKS._default);

  // ------------------------------------------------------------------
  // Trespass (UN Plaza garrison before the main quest settles it):
  // warn → last warning → open fire. ALL ORIGINAL LINES.
  // ------------------------------------------------------------------
  C.TRESPASS_BARKS = {
    warn: [
      "Halt! This is a federal exclusion zone. Turn around, civilian.",
      "You are approaching a restricted installation. Leave. Now.",
      "Stop right there! Unauthorized personnel are not permitted on the plaza.",
      "Civilian! You are entering a secured area. Back off.",
    ],
    last: [
      "Final warning. Five seconds, then we open fire.",
      "I will not tell you again. Leave the plaza.",
      "Weapons are hot, civilian. Walk away. NOW.",
    ],
    open: [
      "Trespasser will not comply. Weapons free!",
      "That's it. Light them up!",
      "Non-compliant hostile. Engage!",
    ],
    leave: [
      "That's right. Keep walking.",
      "Smart choice. Stay off the plaza.",
      "And don't come back without an invitation.",
    ],
    sky_eye: [
      "[Loudhailer: RESTRICTED AREA... PERSONNEL WITHOUT CLEARANCE WILL BE... DETAINED...]",
      "[Sky-Eye: ...EXCLUSION ZONE... TURN BACK... THIS IS A LAWFUL ORDER OF THE ACTING PRESIDENT...]",
    ],
  };

  // ------------------------------------------------------------------
  // NPC greetings that react to the faction armour the player wears.
  // key: 'covenant' | 'continuity' → voice → lines.  ALL ORIGINAL LINES.
  // ------------------------------------------------------------------
