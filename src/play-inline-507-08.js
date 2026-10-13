// play-inline-507 08 — rpg
// Lines 2525-2852 of readable/play-inline-507.pretty.js (statement-aligned).
  C.ARMOR_GREET = {
    covenant: {
      settler: [
        "A Covenant rig! Thank heaven. Are you with the patrols from Rockefeller?",
        "Lancer! The raiders have been at the south fence again.",
        "We don't get many of you walking boilers this far out. Welcome.",
      ],
      guard: [
        "Good to see iron on the street. Keep the Brutes off our market, will you?",
        "Covenant. Our gate's open to you.",
      ],
      neon: [
        "Covenant, huh? Your lot usually shoots first and asks for papers later. Appreciate the restraint.",
      ],
      glowkeeper: [
        "The Covenant hoards the old machines like misers. Still... the Light on you, Lancer.",
      ],
      covenant: [
        "Iron remembers, sworn one.",
        "Good to see you in the rig. Iron holds.",
        "Hold the line out there.",
      ],
      continuity: ["Covenant scavenger. Walk on before I remember my orders."],
      merchant: ["Covenant discount? ...No. But I'll throw in a smile."],
    },
    continuity: {
      settler: [
        "That... that's a Continuity rig. We don't want any trouble. Please.",
        "Take what you need, sir. Just... take it and go.",
      ],
      guard: [
        "Easy. Nobody here wants a fight with the Continuity.",
        "I'll be watching you, Liberty.",
      ],
      neon: [
        'Continuity. Great. Here to "register" the neighborhood again?',
        "I've outlived one government already. I'll outlive yours.",
      ],
      glowkeeper: [
        'The Continuity would file the sun under "classified" if it could.',
      ],
      covenant: [
        "You've got a lot of nerve wearing that on our street.",
        "Continuity colors. Keep your hands where I can see them.",
      ],
      continuity: [
        "As you were, trooper.",
        "Good to see a friendly helmet out here.",
        "Stay sharp. The locals bite.",
      ],
      merchant: [
        "Continuity vouchers? Not worth the paper. Scrip only... sir.",
      ],
    },
  };

  // ------------------------------------------------------------------
  // Standing & faction world reactions (roaming "special" encounters).
  // Good Standing → the Gallowglass Company, mercenaries on a Liberty Island
  // contract (the Continuity wants the hero quiet); a grateful stranger with a gift.
  // Bad Standing → the Lantern Marshals, a self-appointed posse with a warrant.
  // After the main quest's faction choice: allied Covenant / Continuity patrols
  // clashing with the other side. All names & text original.
  // ------------------------------------------------------------------
  C.BARKS.merc = {
    alert: [
      "There's the payday! Weapons up!",
      "Target confirmed. Collect the bounty!",
      "Nothing personal, pal. Liberty pays in gold.",
    ],
    combat: [
      "Earn your cut, boys!",
      "Push! Push!",
      'Contract says dead. Not "mostly dead".',
      "Pin them down!",
    ],
    search: [
      "Spread out. The client wants a body.",
      "They're close. I can smell the freezer on 'em.",
    ],
    lost: [
      "Lost the mark. Regroup.",
      "Damn it. The paymaster won't like this.",
    ],
    hurt: ["I'm hit! Hazard pay!", "Agh! Double the fee!"],
    kill: ["Contract fulfilled.", "Payday."],
    reload: ["Reloading!", "Changing mags!"],
    grenade: ["Frag out!"],
    allyDown: ["Man down! That's a bigger cut for me.", "They got Rourke!"],
    flee: ["This ain't worth the gold!"],
  };
  C.BARKS.marshal = {
    alert: [
      "By the Lantern! There's the one on the warrant!",
      "You're under arrest! ...Kidding. Draw!",
      "Wanted, dead or deader. We'll take either.",
    ],
    combat: [
      "Justice don't miss twice!",
      "Answer for what you did!",
      "Hold the line, marshals!",
      "Too late to repent now!",
    ],
    search: [
      "Spread out. Warrant says they're close.",
      "Come out and face the Lantern!",
    ],
    lost: ["Slippery. We'll find 'em.", "The warrant stays open."],
    hurt: ["Winged me!", "Still standing!"],
    kill: ["Warrant served.", "May whoever's left forgive you."],
    reload: ["Reloading!"],
    allyDown: ["Marshal down!", "They killed Hollis!"],
  };
  C.BARKS.gift = {
    greet: [
      "You probably don't remember me. You helped my family. Here, it's not much.",
      "Word gets around about folks like you. Take this, please.",
      "I've been looking for you! My brother says you saved his life. This is from both of us.",
    ],
    idle: ["Hello there, friend!"],
  };
  C.STANDING_SQUADS = {
    merc: {
      faction: "mercenaries",
      voice: "merc",
      leader: "Gallowglass Captain",
      member: "Gallowglass Merc",
      outfit: "combat_armor",
      note: "cmb_note_contract",
      pool: "mercenary",
      count: [3, 4],
      levelBonus: 1,
      evil: true,
    },
    marshal: {
      faction: "lawmen",
      voice: "marshal",
      leader: "Lantern Marshal",
      member: "Lantern Deputy",
      outfit: "leather_armor",
      hat: "cowboy",
      note: "cmb_note_warrant",
      pool: "lawman",
      count: [3, 4],
      levelBonus: 0,
    },
  };
  C.NOTES = {
    cmb_note_contract: {
      name: "Gallowglass Contract",
      title: "Contract No. 89-L",
      value: 0,
      text:
        "GALLOWGLASS COMPANY: LETTER OF ENGAGEMENT\n\nClient: Office of Civil Pacification, Liberty Island (via courier).\nTarget: the sleeper out of Cryo Unit C-9, " +
        "calling himself a friend of Manhattan.\n\nThe client notes with concern the target's growing popularity among the local population. Popular people " +
        "become symbols. Symbols become problems.\n\nTerms: 500 in federal gold on proof of death. Goggles to be returned intact.\nThe Company does not ask why.\n\n(signed) Capt. M. Rourke",
    },
    cmb_note_warrant: {
      name: "Lantern Warrant",
      title: "Warrant of the Lantern Marshals",
      value: 0,
      text:
        "BY THE AUTHORITY OF THE LANTERN (which is to say: nobody's, and so everybody's)\n\nWANTED: the sleeper who walked out of the ice downtown.\nCharges: murder of " +
        "innocents; theft; general wickedness as witnessed by the good people of Manhattan.\n\nThe bearer of this warrant is empowered to bring the accused " +
        "to justice, or justice to the accused, whichever proves simpler.\n\nLet the lamp stay lit.\n(signed) Marshal H. Crane, Flatiron District",
    },
  };
  C.WEAPON_POOLS.mercenary = (l) =>
    l <= 6
      ? [
          ["assault_rifle", 3],
          ["combat_shotgun", 2],
          ["smg_10mm", 2],
          ["hunting_rifle", 1],
        ]
      : [
          ["assault_rifle", 3],
          ["combat_shotgun", 2],
          ["sniper_rifle", 1],
          ["belt_fed_mg", 0.6],
          ["missile_launcher", 0.3],
        ];
  C.WEAPON_POOLS.lawman = (l) =>
    l <= 6
      ? [
          ["hunting_rifle", 3],
          ["magnum_44", 2],
          ["pistol_10mm", 2],
          ["sawed_off_shotgun", 1],
        ]
      : [
          ["hunting_rifle", 2],
          ["magnum_44", 3],
          ["combat_shotgun", 2],
          ["sniper_rifle", 1],
        ];
  C.GIFTS = [
    [["rally_tonic", 3]],
    [
      ["rally_tonic", 2],
      ["iodine_tabs", 1],
    ],
    [["scrip", 100]],
    [
      ["fizzo_blue", 1],
      ["rally_tonic", 1],
    ],
    [
      ["prussian_blue", 2],
      ["purified_water", 2],
    ],
    [
      ["ammo_10mm", 40],
      ["frag_grenade", 2],
    ],
    [
      ["rally_tonic_extra", 1],
      ["rally_tonic", 1],
    ],
  ];

  // Human first names for generic NPC flavour (original list)
  C.FIRST_NAMES = [
    "Mags",
    "Dutch",
    "Rosie",
    "Tully",
    "Vic",
    "Sal",
    "Bea",
    "Jojo",
    "Lou",
    "Nell",
    "Otis",
    "Kit",
    "Ruth",
    "Gus",
    "Hank",
    "Ida",
    "Moe",
    "Dot",
    "Frankie",
    "Lefty",
  ];
  C.RAIDER_NAMES = [
    "Raider",
    "Raider",
    "Raider",
    "Raider Scum",
    "Raider Butcher",
    "Raider Punk",
    "Raider Scrounger",
  ];

  // ------------------------------------------------------------------
  // Small shared helpers
  // ------------------------------------------------------------------
  C.rand = (a, b) => a + Math.random() * (b - a);
  C.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  C.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  C.weighted = (pairs) => {
    let tot = 0;
    for (const p of pairs) tot += p[1];
    let r = Math.random() * tot;
    for (const p of pairs) {
      r -= p[1];
      if (r <= 0) return p[0];
    }
    return pairs[pairs.length - 1][0];
  };
  C.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  C.sfx = function (name, opts) {
    try {
      return G.sfx.play(name, opts);
    } catch (e) {
      return null;
    }
  };
  C.fx = function (fn) {
    if (G.isStub("fx")) return null;
    const f = G.fx[fn];
    if (typeof f !== "function") return null;
    try {
      return f.apply(G.fx, Array.prototype.slice.call(arguments, 1));
    } catch (e) {
      G.reportError("combat:fx." + fn, e);
      return null;
    }
  };

  /** Talent rank / modifier queries (defensive against an absent rpg module). */
  C.talent = (id) => {
    if (G.isStub("rpg") || typeof G.rpg.hasTalent !== "function") return false;
    try {
      return !!G.rpg.hasTalent(id);
    } catch (e) {
      return false;
    }
  };
  C.mod = (name) => {
    if (G.isStub("rpg") || typeof G.rpg.mod !== "function") return 0;
    try {
      return G.rpg.mod(name) || 0;
    } catch (e) {
      return 0;
    }
  };
  C.skill = (id, dflt) => {
    if (G.isStub("rpg") || typeof G.rpg.skill !== "function")
      return dflt === undefined ? 30 : dflt;
    try {
      const v = G.rpg.skill(id);
      return typeof v === "number" ? v : dflt || 30;
    } catch (e) {
      return dflt || 30;
    }
  };
  C.attr = (k, dflt) => {
    if (G.isStub("rpg") || typeof G.rpg.attr !== "function") return dflt || 5;
    try {
      const v = G.rpg.attr(k);
      return typeof v === "number" && v > 0 ? v : dflt || 5;
    } catch (e) {
      return dflt || 5;
    }
  };
  C.playerLevel = () =>
    !G.isStub("rpg") && typeof G.rpg.level === "number" ? G.rpg.level : 1;
