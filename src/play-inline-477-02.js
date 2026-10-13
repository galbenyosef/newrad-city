// play-inline-477 02 — desc
// Lines 359-562 of readable/play-inline-477.pretty.js (statement-aligned).
  T({
    id: "firebug",
    name: "Firebug",
    icon: "fire",
    reqLevel: 8,
    reqAttrs: { wits: 5 },
    desc: "Some men just like to watch things burn. Fire weapons deal +40% damage.",
    mods: () => ({ dmgType: { fire: 0.4 } }),
  });

  // ---------------- LEVEL 10 ----------------
  T({
    id: "beast_whisperer",
    name: "Beast Whisperer",
    icon: "paw",
    ranks: 2,
    reqLevel: 10,
    reqAttrs: { presence: 6 },
    desc: "Dogs, burrow rats and other ordinary animals leave you alone. At rank two they come to your aid.",
    mods: (r) => ({ animalFriend: r }),
  });
  T({
    id: "second_wind",
    name: "Second Wind",
    icon: "heart",
    reqLevel: 10,
    reqAttrs: { grit: 6 },
    desc: "When you are down to your last few breaths, your body digs in. Below 30% health you regenerate 2 health per second.",
    mods: (r, c) => (c.hpFrac < 0.3 ? { hpRegen: 2 } : null),
  });
  T({
    id: "last_stand",
    name: "Last Stand",
    icon: "skull",
    reqLevel: 10,
    reqAttrs: { brawn: 5 },
    desc: "Cornered men are dangerous men. Below 25% health you deal +25% damage and gain +10 Damage Resistance.",
    mods: (r, c) => (c.hpFrac < 0.25 ? { dmgMult: 0.25, dr: 10 } : null),
  });
  T({
    id: "fence",
    name: "Fence",
    icon: "scrip",
    reqLevel: 10,
    reqAttrs: { presence: 6 },
    reqSkills: { trade: 40 },
    desc: "You know a man who knows a man. Merchants pay you 15% more for what you sell.",
    mods: () => ({ sellMult: 0.15 }),
  });
  T({
    id: "tunnel_rat",
    name: "Tunnel Rat",
    icon: "tunnel",
    reqLevel: 10,
    reqAttrs: { reflex: 5 },
    desc: "The subway taught you to move in the dark. Indoors and underground: +10 Stealth and +4% critical chance.",
    mods: (r, c) => (c.indoors ? { skills: { stealth: 10 }, crit: 4 } : null),
  });
  T({
    id: "ghost_walk",
    name: "Ghost Walk",
    icon: "sneak",
    reqLevel: 10,
    reqSkills: { stealth: 50 },
    desc: "You run on the balls of your feet. Moving at speed no longer makes your footsteps louder.",
    mods: () => ({ silentRun: 1 }),
  });

  // ---------------- LEVEL 12+ ----------------
  T({
    id: "thick_bones",
    name: "Thick Bones",
    icon: "bone",
    reqLevel: 12,
    reqAttrs: { grit: 7 },
    desc: "Your bones have been broken and set so many times they knit like rebar. Limbs take 50% less damage.",
    mods: () => ({ limbDmgMult: -0.5 }),
  });
  T({
    id: "lucky_break",
    name: "Lucky Break",
    icon: "clover",
    reqLevel: 12,
    reqAttrs: { senses: 6 },
    desc: "Some days the bullet just grazes you. Now and then an incoming hit deals half damage.",
    mods: () => ({ luckyBreak: 1 }),
  });
  T({
    id: "sun_worshipper",
    name: "Sun Worshipper",
    icon: "sun",
    reqLevel: 12,
    reqAttrs: { grit: 6 },
    desc: "Daylight on your face puts the strength back in you. Outdoors by day: +1 Brawn and slow healing.",
    mods: (r, c) => (c.sunlight ? { attrs: { brawn: 1 }, hpRegen: 0.6 } : null),
  });
  T({
    id: "big_game",
    name: "Big Game",
    icon: "skull",
    reqLevel: 14,
    reqAttrs: { senses: 7 },
    desc: "The bigger they are, the more you enjoy it. +20% damage against creatures and Brutes.",
    mods: () => ({ dmgVs: { creature: 0.2, brute: 0.2 } }),
  });
  T({
    id: "iron_will",
    name: "Iron Will",
    icon: "shield",
    reqLevel: 16,
    reqAttrs: { grit: 8 },
    desc: "Pain is just information. +8 Damage Resistance and +10% radiation resistance.",
    mods: () => ({ dr: 8, radResist: 10 }),
  });
  T({
    id: "point_man",
    name: "Point Man",
    icon: "crosshair",
    reqLevel: 16,
    reqAttrs: { senses: 8 },
    desc: "First through the door, first to fire. +5% critical chance and critical hits deal +25% damage.",
    mods: () => ({ crit: 5, critDmg: 0.25 }),
  });
  T({
    id: "executioner",
    name: "Executioner",
    icon: "skull",
    reqLevel: 20,
    reqSkills: { firearms: 60 },
    desc: "You finish what you start. Critical hits deal +50% damage.",
    mods: () => ({ critDmg: 0.5 }),
  });
  T({
    id: "hard_drinker",
    name: "Hard Drinker",
    icon: "bottle",
    reqLevel: 12,
    reqAttrs: { grit: 5 },
    desc: "You can drink a stevedore under the table and still walk home. You never get hooked on alcohol.",
    mods: () => ({ hardDrinker: 1 }),
  });
  T({
    id: "deep_sleeper",
    name: "Deep Sleeper",
    icon: "sleep",
    reqLevel: 12,
    desc: "Twenty-two years in a cryo pod and you still sleep like a baby. You are always Well Rested after a full night, even in a stranger's bed.",
    mods: () => ({ deepSleep: 1 }),
  });
  T({
    id: "cartographer",
    name: "Cartographer",
    icon: "map",
    reqLevel: 18,
    desc: "You have pored over every subway map and street guide you could find. Every location in the city appears on your map.",
    apply() {
      try {
        for (const l of G.LAYOUT.LOCATIONS) if (!l.interior) G.discover(l.id);
      } catch (e) {
        /* ignore */
      }
    },
  });

  // ---------------- HIDDEN (quest-granted) ----------------
  T({
    id: "rig_certified",
    name: "Exo-Rig Certified",
    icon: "exo_rig",
    hidden: true,
    reqLevel: 1,
    desc: "Someone finally showed you the servos, the balance and the weight. You can now wear an exo-rig.",
  });
  T({
    id: "street_friend",
    name: "Friend of the Street",
    icon: "paw",
    hidden: true,
    reqLevel: 1,
    desc: "A reward for sparing the Neon's outcasts: +5 Persuasion, and creatures are slower to notice you.",
    mods: () => ({ skills: { persuasion: 5 }, sneak: 5 }),
  });
  T({
    id: "cryo_survivor",
    name: "Long Winter Survivor",
    icon: "cryo",
    hidden: true,
    reqLevel: 1,
    desc: "You walked out of Cryo Unit C-9 alive when nobody else did. +2 to every skill.",
    mods: () => ({
      skills: {
        firearms: 2,
        melee: 2,
        explosives: 2,
        medicine: 2,
        mechanics: 2,
        electronics: 2,
        stealth: 2,
        persuasion: 2,
        trade: 2,
        survival: 2,
      },
    }),
  });
