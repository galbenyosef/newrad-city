// play-inline-473 01 — tags
// Lines 13-356 of readable/play-inline-473.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const A = (d) =>
    G.items.define(
      Object.assign({ type: "apparel", slot: "body", tags: ["apparel"] }, d),
    );

  // ---------------------------------------------------------------
  // Project Long Winter issue (Cryo Unit C-9)
  // ---------------------------------------------------------------
  A({
    id: "vigil_goggles",
    name: "VIGIL Goggles",
    slot: "goggles",
    weight: 0,
    value: 0,
    quest: true,
    noCondition: true,
    noLoot: true,
    tags: ["apparel", "tech"],
    mesh: "goggles",
    desc: "Project Long Winter field goggles: smoked lenses, a rubber strap and a tiny cathode display that paints maps, logs and vital signs across your vision. Office of Civil Defense property. Do not remove.",
  });
  A({
    id: "cryo_suit",
    name: "Long Winter Cryo Suit",
    weight: 1,
    value: 6,
    dr: 1,
    outfit: "cryo_suit",
    tags: ["apparel", "clothing", "cryo"],
    mesh: "cloth_cryo",
    desc: 'A grey-white padded sleeper suit with an orange collar ring and a stencilled "C-9" over the heart. Warm, at least. It was designed to be.',
  });
  A({
    id: "long_winter_guard_armor",
    name: "Long Winter Guard Armor",
    weight: 12,
    value: 150,
    dr: 12,
    outfit: "cryo_suit",
    tags: ["apparel", "armor_light", "cryo"],
    mesh: "armor_guard",
    desc: "A grey Civil Defense duty jacket under a moulded riot vest, issued to the facility guards. Built to calm a panicking sleeper, and occasionally something worse.",
  });
  A({
    id: "long_winter_guard_helmet",
    name: "Long Winter Guard Helmet",
    slot: "head",
    weight: 2,
    value: 40,
    dr: 3,
    tags: ["apparel", "helmet", "cryo"],
    mesh: "helmet_guard",
    desc: "A white helmet with a smoked visor and an orange Civil Defense triangle on the brow.",
  });
  A({
    id: "cryo_tech_uniform",
    name: "Cryo Technician Uniform",
    weight: 1,
    value: 10,
    dr: 1,
    skills: { electronics: 5 },
    outfit: "lab_coat",
    tags: ["apparel", "clothing", "cryo"],
    mesh: "cloth_white",
    desc: "A white smock over a grey coverall, with a pocket full of grease pencils and a dosimeter badge that went black long ago.",
  });
  A({
    id: "director_suit",
    name: "Facility Director's Suit",
    weight: 2,
    value: 60,
    dr: 2,
    attrs: { presence: 1 },
    skills: { persuasion: 5 },
    outfit: "director_suit",
    tags: ["apparel", "clothing", "cryo"],
    mesh: "cloth_grey",
    noLoot: true,
    desc: "A charcoal government suit with an Office of Civil Defense pin on the lapel. Authority, tailored, and slightly freezer-burnt.",
  });

  // ---------------------------------------------------------------
  // Light & medium armour
  // ---------------------------------------------------------------
  A({
    id: "leather_armor",
    name: "Leather Armor",
    weight: 15,
    value: 160,
    dr: 12,
    outfit: "leather_armor",
    tags: ["apparel", "armor_light"],
    mesh: "armor_leather",
    desc: "Boiled ox hide over a padded jacket. The city's favourite compromise between protection and being able to run away.",
  });
  A({
    id: "leather_armor_reinforced",
    name: "Reinforced Leather Armor",
    weight: 16,
    value: 260,
    dr: 16,
    outfit: "leather_armor",
    tags: ["apparel", "armor_light"],
    mesh: "armor_leather_r",
    lootWeight: 0.6,
    desc: "Leather armor with riveted steel plates across the chest and shoulders. A Brooklyn cobbler's masterpiece.",
  });
  A({
    id: "metal_armor",
    name: "Metal Armor",
    weight: 30,
    value: 250,
    dr: 28,
    skills: { stealth: -5 },
    outfit: "raider_heavy",
    tags: ["apparel", "armor_heavy"],
    mesh: "armor_metal",
    desc: "Sheet metal, hubcaps and road signs, hammered to shape and strapped together. You can hear it coming three blocks away.",
  });
  A({
    id: "metal_helmet",
    name: "Metal Helmet",
    slot: "head",
    weight: 5,
    value: 60,
    dr: 5,
    tags: ["apparel", "helmet"],
    mesh: "helmet_metal",
    desc: "A dented steel bucket with eye slits. Protects the head; destroys the peripheral vision.",
  });
  A({
    id: "combat_armor",
    name: "Combat Armor",
    weight: 25,
    value: 300,
    dr: 32,
    outfit: "combat_armor",
    tags: ["apparel", "armor_heavy"],
    mesh: "armor_combat",
    desc: "U.S. Army composite body armour, 1966 pattern. Still the best protection you can wear that doesn't need a rig battery.",
  });
  A({
    id: "combat_helmet",
    name: "Combat Armor Helmet",
    slot: "head",
    weight: 3,
    value: 50,
    dr: 5,
    tags: ["apparel", "helmet"],
    mesh: "helmet_combat",
    desc: "A matching composite helmet with a chin strap and a faded unit stencil.",
  });
  A({
    id: "scout_armor",
    name: "Scout Armor",
    weight: 20,
    value: 400,
    dr: 30,
    skills: { stealth: 5 },
    outfit: "combat_armor",
    tags: ["apparel", "armor_heavy"],
    mesh: "armor_scout",
    lootWeight: 0.4,
    desc: "Lightweight combat armour cut for Army forward scouts. Quieter joints, fewer rattles.",
  });
  A({
    id: "riot_police_armor",
    name: "Riot Police Armor",
    weight: 20,
    value: 280,
    dr: 25,
    attrs: { presence: -1 },
    outfit: "combat_armor",
    tags: ["apparel", "armor_heavy"],
    mesh: "armor_riot",
    lootWeight: 0.6,
    desc: "Black ballistic plates stamped with the badge of a Midtown precinct. Built for the blackout riots of '66. Looks like it saw them.",
  });
  A({
    id: "riot_police_helmet",
    name: "Riot Police Helmet",
    slot: "head",
    weight: 3,
    value: 60,
    dr: 6,
    tags: ["apparel", "helmet"],
    mesh: "helmet_riot",
    lootWeight: 0.6,
    desc: "A full helmet with a scratched polycarbonate faceplate and a tiny, faded American flag decal.",
  });
  A({
    id: "bureau_stealth_suit",
    name: "Bureau Sept Infiltration Suit",
    weight: 10,
    value: 1000,
    dr: 15,
    skills: { stealth: 10 },
    outfit: "combat_armor",
    tags: ["apparel", "armor_light", "rare"],
    mesh: "armor_stealth",
    lootWeight: 0.1,
    desc: "A matte-black French agent's suit with quilted panels that drink the light. The label is cut out. The cut is unmistakably Parisian.",
  });

  // ---------------------------------------------------------------
  // Raider gear
  // ---------------------------------------------------------------
  A({
    id: "raider_spiked_leathers",
    name: "Raider Spiked Leathers",
    weight: 15,
    value: 180,
    dr: 14,
    outfit: "raider",
    tags: ["apparel", "armor_light", "raider"],
    mesh: "armor_raider",
    desc: "Leather straps, tire rubber, a shoulder pad from an old-world football uniform and somebody else's dried blood.",
  });
  A({
    id: "raider_scrap_plate",
    name: "Raider Scrap Plate",
    weight: 15,
    value: 180,
    dr: 14,
    skills: { explosives: 5 },
    outfit: "raider",
    tags: ["apparel", "armor_light", "raider"],
    mesh: "armor_scrap",
    desc: "Car-door panels and stop signs wired over singed padding and bandoliers. The previous owner liked explosives more than eyebrows.",
  });
  A({
    id: "raider_chain_harness",
    name: "Raider Chain Harness",
    weight: 16,
    value: 190,
    dr: 16,
    outfit: "raider_heavy",
    tags: ["apparel", "armor_light", "raider"],
    mesh: "armor_raider",
    desc: "A leather harness studded with rebar spikes and railroad nails. Hugs are no longer an option.",
  });
  A({
    id: "raider_duster",
    name: "Raider Duster",
    weight: 15,
    value: 180,
    dr: 14,
    skills: { firearms: 5 },
    outfit: "raider",
    tags: ["apparel", "armor_light", "raider"],
    mesh: "armor_duster",
    desc: "A long oilskin duster over old motorcycle leathers and scavenged kneepads, favoured by the Bowery gangs.",
  });
  A({
    id: "raider_welding_mask",
    name: "Raider Welding Mask",
    slot: "head",
    weight: 3,
    value: 50,
    dr: 3,
    radResist: 5,
    tags: ["apparel", "helmet", "raider"],
    mesh: "helmet_gasmask",
    desc: "A welding mask bolted to a gas mask bolted to a football helmet. Airtight, mostly.",
  });
  A({
    id: "wall_street_suit_armor",
    name: "Exchange Enforcer Armor",
    weight: 18,
    value: 240,
    dr: 18,
    skills: { trade: 5 },
    outfit: "raider_heavy",
    tags: ["apparel", "armor_light", "raider"],
    mesh: "armor_wallstreet",
    lootWeight: 0.5,
    desc: "A pinstripe suit jacket reinforced with trading-floor ticker plates. The uniform of the raiders who run The Exchange.",
  });

  // ---------------------------------------------------------------
  // Exo-rigs (require the Exo-Rig Certified Talent)
  // ---------------------------------------------------------------
  A({
    id: "exo_rig_mk1",
    name: "Exo-Rig Mk I",
    weight: 45,
    value: 680,
    dr: 40,
    dt: 4,
    radResist: 10,
    exoRig: true,
    helmetFor: "exo_rig_mk1_helmet",
    outfit: "covenant_exo_rig",
    tags: ["apparel", "exo_rig"],
    mesh: "rig_mk1",
    noLoot: true,
    desc: "An Army Corps of Engineers load frame wrapped in boiler plate: hydraulic legs, a riveted chest and a backpack battery. Slow, loud, and nearly bulletproof. The Iron Covenant has made a religion of them.",
  });
  A({
    id: "exo_rig_mk1_helmet",
    name: "Exo-Rig Mk I Helmet",
    slot: "head",
    weight: 5,
    value: 110,
    dr: 8,
    radResist: 3,
    exoRig: true,
    tags: ["apparel", "helmet", "exo_rig"],
    mesh: "helmet_rig",
    noLoot: true,
    desc: "A flat-topped steel helm with a single horizontal vision slit and a rubber air hose. You breathe; it rattles.",
  });
  A({
    id: "exo_rig_mk2",
    name: "Exo-Rig Mk II",
    weight: 40,
    value: 1200,
    dr: 40,
    dt: 6,
    radResist: 25,
    exoRig: true,
    helmetFor: "exo_rig_mk2_helmet",
    outfit: "covenant_exo_rig",
    tags: ["apparel", "exo_rig", "rare"],
    mesh: "rig_mk2",
    noLoot: true,
    desc: "The sealed second pattern, built for decontamination crews: smooth plates, gasketed joints and an oxygen reserve. Rarer than an honest merchant.",
  });
  A({
    id: "exo_rig_mk2_helmet",
    name: "Exo-Rig Mk II Helmet",
    slot: "head",
    weight: 4,
    value: 200,
    dr: 8,
    radResist: 8,
    exoRig: true,
    tags: ["apparel", "helmet", "exo_rig"],
    mesh: "helmet_rig_mk2",
    noLoot: true,
    desc: "A squared helm with a narrow amber visor strip and twin side filters. It makes every wearer look like the same patient machine.",
  });
