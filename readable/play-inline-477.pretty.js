/* src/rpg/32_talents.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — TALENTS
 *
 * One Talent per level. Def:
 *   { id, name, desc, ranks, reqLevel, reqAttrs {grit:5}, reqSkills {medicine:40},
 *     reqStanding?: 'good'|'bad', icon, levelStep? (extra levels per rank),
 *     mods(rank, ctx, choices) → modifier object (see 30_rpg_core emptyMods),
 *     apply(choice, rank)  one-shot effect when taken,
 *     choice?: 'attr' (UI offers an attribute picker; otherwise auto-chosen),
 *     needsHook?: world feature another module must declare, hidden?: true (quest-granted) }
 * Names and descriptions are original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const T = (d) => G.rpg.defineTalent(d);
  const R = () => G.rpg;

  // ---------------- LEVEL 2 ----------------
  T({
    id: "steady_hands",
    name: "Steady Hands",
    icon: "crosshair",
    ranks: 2,
    reqLevel: 2,
    reqAttrs: { reflex: 4 },
    desc: "You learned to breathe out before you squeeze. Weapon spread −12% per rank.",
    mods: (r) => ({ spreadMult: -0.12 * r }),
  });
  T({
    id: "quick_study",
    name: "Quick Study",
    icon: "book",
    ranks: 3,
    reqLevel: 2,
    reqAttrs: { wits: 4 },
    desc: "You pick things up by doing them once. Skills grow 15% faster per rank.",
    mods: (r) => ({ practiceMult: 0.15 * r }),
  });
  T({
    id: "studious",
    name: "Studious",
    icon: "book",
    ranks: 3,
    reqLevel: 2,
    reqAttrs: { wits: 5 },
    desc: "Every scrape is a lesson you write down. +8% experience per rank.",
    mods: (r) => ({ xpMult: 0.08 * r }),
  });
  T({
    id: "field_medic",
    name: "Field Medic",
    icon: "medic",
    ranks: 2,
    reqLevel: 2,
    reqAttrs: { wits: 4 },
    desc: "Civil Defense first-aid drills, finally useful. Rally Tonic and other medicine heal 20% more per rank, and Prussian Blue works 15% better.",
    mods: (r) => ({ medMult: 0.2 * r, radMedMult: 0.15 * r }),
  });
  T({
    id: "thick_skin",
    name: "Thick Skin",
    icon: "shield",
    ranks: 3,
    reqLevel: 2,
    reqAttrs: { grit: 4 },
    desc: "Bruises fade, cuts close, and you stop flinching. +3 Damage Resistance per rank.",
    mods: (r) => ({ dr: 3 * r }),
  });
  T({
    id: "pack_mule",
    name: "Pack Mule",
    icon: "pack",
    ranks: 2,
    reqLevel: 2,
    reqAttrs: { brawn: 4 },
    desc: "Straps cinched, load balanced, back straight. +25 carry weight per rank.",
    mods: (r) => ({ carry: 25 * r }),
  });
  T({
    id: "silver_tongue",
    name: "Silver Tongue",
    icon: "talk",
    ranks: 2,
    reqLevel: 2,
    reqAttrs: { presence: 4 },
    desc: "You always seem to know what the other fellow wants to hear. +8 Persuasion per rank.",
    mods: (r) => ({ skills: { persuasion: 8 * r } }),
  });
  T({
    id: "haggler",
    name: "Haggler",
    icon: "scrip",
    ranks: 2,
    reqLevel: 2,
    reqAttrs: { presence: 4 },
    desc: "You never take the first price. Goods cost 6% less per rank.",
    mods: (r) => ({ barterMult: -0.06 * r }),
  });
  T({
    id: "night_owl",
    name: "Night Owl",
    icon: "moon",
    reqLevel: 2,
    reqAttrs: { senses: 4 },
    desc: "After dark your eyes open wide and your head clears. Between 6 p.m. and 6 a.m.: +1 Senses, +1 Wits.",
    mods: (r, c) => (c.night ? { attrs: { senses: 1, wits: 1 } } : null),
  });
  T({
    id: "keen_eye",
    name: "Keen Eye",
    icon: "eye",
    reqLevel: 2,
    reqAttrs: { senses: 5 },
    desc: "You spot the gap in the armour before you spot the armour. +3% critical chance and spread −5%.",
    mods: () => ({ crit: 3, spreadMult: -0.05 }),
  });
  T({
    id: "self_improvement",
    name: "Self-Improvement",
    icon: "flex",
    ranks: 6,
    reqLevel: 2,
    choice: "attr",
    desc: "Push-ups at dawn, crosswords at midnight. Raise any one attribute by 1.",
    apply(choice) {
      const S = R()._state();
      let k = choice && R().ATTR_INFO[choice] ? choice : null;
      if (!k || S.attrs[k] >= 10)
        k = R()
          .ATTRS.filter((x) => S.attrs[x] < 10)
          .sort((a, b) => S.attrs[a] - S.attrs[b])[0];
      if (k) {
        S.attrs[k] = Math.min(10, S.attrs[k] + 1);
        G.notify(R().ATTR_INFO[k].name + " increased to " + S.attrs[k] + ".", {
          kind: "attr",
        });
      }
      R()._dirty();
    },
  });

  // ---------------- LEVEL 4 ----------------
  T({
    id: "bookworm",
    name: "Bookworm",
    icon: "book",
    reqLevel: 4,
    reqAttrs: { wits: 5 },
    desc: "You read the footnotes. Skill manuals give +1 more point, and every one you finish is worth 75 XP.",
    mods: () => ({ bookBonus: 1 }),
  });
  T({
    id: "gearhead",
    name: "Gearhead",
    icon: "wrench",
    ranks: 2,
    reqLevel: 4,
    reqAttrs: { wits: 5 },
    desc: "Grease under the fingernails since grade school. +8 Mechanics and +4 Electronics per rank.",
    mods: (r) => ({ skills: { mechanics: 8 * r, electronics: 4 * r } }),
  });
  T({
    id: "brawler",
    name: "Brawler",
    icon: "fist",
    ranks: 2,
    reqLevel: 4,
    reqAttrs: { brawn: 5 },
    desc: "Golden Gloves, 1961, welterweight. Bare-knuckle blows deal +4 damage per rank, melee weapons +2.",
    mods: (r) => ({ unarmedDmg: 4 * r, meleeDmg: 2 * r }),
  });
  T({
    id: "slugger",
    name: "Slugger",
    icon: "bat",
    ranks: 2,
    reqLevel: 4,
    reqAttrs: { brawn: 6 },
    desc: "You swing through the target, not at it. Melee damage +12% per rank.",
    mods: (r) => ({ dmgSkill: { melee: 0.12 * r } }),
  });
  T({
    id: "pistolero",
    name: "Pistolero",
    icon: "pistol",
    ranks: 2,
    reqLevel: 4,
    reqAttrs: { reflex: 5 },
    desc: "One hand, one gun, no hesitation. One-handed firearms deal +12% damage per rank.",
    mods: (r) => ({ dmgOneHand: 0.12 * r }),
  });
  T({
    id: "rifleman",
    name: "Rifleman",
    icon: "rifle",
    ranks: 2,
    reqLevel: 4,
    reqAttrs: { reflex: 5 },
    desc: "Cheek on the stock, elbow in. Two-handed firearms deal +12% damage per rank.",
    mods: (r) => ({ dmgTwoHand: 0.12 * r }),
  });
  T({
    id: "ammo_hound",
    name: "Ammo Hound",
    icon: "ammo",
    reqLevel: 4,
    reqAttrs: { senses: 5 },
    desc: "You can smell gun oil through a locked footlocker. You find 50% more ammunition.",
    mods: () => ({ lootAmmo: 0.5 }),
  });
  T({
    id: "scrip_sniffer",
    name: "Scrip Sniffer",
    icon: "scrip",
    reqLevel: 4,
    reqAttrs: { senses: 4 },
    desc: "Folded notes in coat linings, envelopes behind radiators. You find 50% more scrip.",
    mods: () => ({ lootScrip: 0.5 }),
  });
  T({
    id: "exterminator",
    name: "Exterminator",
    icon: "bug",
    reqLevel: 4,
    reqAttrs: { senses: 4 },
    desc: "You know exactly where the shell is thinnest. +25% damage against roaches, gasflies, stingers, shellbacks and giant ants.",
    mods: () => ({ dmgVs: { insect: 0.25 } }),
  });
  T({
    id: "neighborly",
    name: "Neighborly",
    icon: "talk",
    reqLevel: 4,
    reqAttrs: { presence: 5 },
    desc: "People remember the good you do. Standing gains are 25% larger, and +5 Trade.",
    mods: () => ({ standingMult: 0.25, skills: { trade: 5 } }),
  });

  // ---------------- LEVEL 6 ----------------
  T({
    id: "deadeye",
    name: "Deadeye",
    icon: "crosshair",
    ranks: 2,
    reqLevel: 6,
    reqAttrs: { senses: 6 },
    desc: "You put the round where it hurts most. +4% critical chance per rank.",
    mods: (r) => ({ crit: 4 * r }),
  });
  T({
    id: "bomb_tech",
    name: "Bomb Tech",
    icon: "grenade",
    ranks: 3,
    reqLevel: 6,
    reqAttrs: { wits: 5 },
    levelStep: 2,
    desc: "You know which wire, and why. Explosives deal +15% damage per rank.",
    mods: (r) => ({ dmgType: { explosive: 0.15 * r } }),
  });
  T({
    id: "trapper",
    name: "Trapper",
    icon: "paw",
    reqLevel: 6,
    reqSkills: { survival: 35 },
    desc: "You know where an animal keeps its heart. Critical hits on creatures deal +50% damage.",
    mods: () => ({ critDmgVs: { creature: 0.5 } }),
  });
  T({
    id: "shadow_step",
    name: "Shadow Step",
    icon: "sneak",
    ranks: 2,
    reqLevel: 6,
    reqAttrs: { reflex: 6 },
    desc: "Heel to toe, breath held. +10 Stealth per rank, and sneak-attack criticals deal +20% damage per rank.",
    mods: (r) => ({ sneak: 10 * r, sneakAttackMult: 0.2 * r }),
  });
  T({
    id: "lead_lining",
    name: "Lead Lining",
    icon: "radiation",
    ranks: 2,
    reqLevel: 6,
    reqAttrs: { grit: 5 },
    desc: "Twenty-two years in a cryo pod did something to your marrow. +12% radiation resistance per rank.",
    mods: (r) => ({ radResist: 12 * r }),
  });
  T({
    id: "marathoner",
    name: "Marathoner",
    icon: "run",
    ranks: 2,
    reqLevel: 6,
    reqAttrs: { grit: 5 },
    desc: "Lungs like bellows. +20 stamina and +25% stamina recovery per rank.",
    mods: (r) => ({ stamina: 20 * r, staminaRegenMult: 0.25 * r }),
  });
  T({
    id: "light_feet",
    name: "Light Feet",
    icon: "step",
    reqLevel: 6,
    reqAttrs: { reflex: 6, senses: 5 },
    needsHook: "traps",
    desc: "You read a floor like a map. Pressure plates, tripwires and mines never go off under your feet.",
    mods: () => ({ lightStep: 1 }),
  });

  // ---------------- LEVEL 8 ----------------
  T({
    id: "quick_hands",
    name: "Quick Hands",
    icon: "reload",
    reqLevel: 8,
    reqAttrs: { reflex: 6 },
    desc: "Magazine out, magazine in, before the brass hits the floor. Reloads are 20% faster.",
    mods: () => ({ reloadMult: -0.2 }),
  });
  T({
    id: "pharmacist",
    name: "Pharmacist",
    icon: "pill",
    reqLevel: 8,
    reqSkills: { medicine: 40 },
    desc: "You know how to make a dose last. Chems last 50% longer.",
    mods: () => ({ chemDurationMult: 0.5 }),
  });
  T({
    id: "clean_living",
    name: "Clean Living",
    icon: "pill",
    reqLevel: 8,
    reqAttrs: { grit: 6 },
    desc: "Your body shrugs off the pull of a habit. Half as likely to get hooked on chems or drink.",
    mods: () => ({ addictionMult: -0.5 }),
  });
  T({
    id: "iron_gut",
    name: "Iron Gut",
    icon: "food",
    reqLevel: 8,
    reqAttrs: { grit: 5 },
    desc: "Tinned, salvaged, scavenged, scorched: it all goes down. Half the radiation from food and water, and food heals 20% more.",
    mods: () => ({ foodRadMult: -0.5, foodHealMult: 0.2 }),
  });
  T({
    id: "scrap_wrangler",
    name: "Scrap Wrangler",
    icon: "gear",
    reqLevel: 8,
    reqSkills: { mechanics: 40 },
    desc: "You know where every robot keeps its fuse box. +25% damage against robots and drones.",
    mods: () => ({ dmgVs: { robot: 0.25 } }),
  });
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
})();
