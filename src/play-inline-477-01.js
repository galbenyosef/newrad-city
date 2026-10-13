// play-inline-477 01 — desc
// Lines 15-358 of readable/play-inline-477.pretty.js (statement-aligned).
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
