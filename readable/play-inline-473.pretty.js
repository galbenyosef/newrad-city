/* src/rpg/12_items_apparel.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — APPAREL DATABASE
 *
 * Apparel fields:
 *   slot: 'body'|'head'|'eyes'|'mouth'|'goggles'
 *   dr (damage resistance, %-points), dt (damage threshold, optional),
 *   radResist, energyResist, fireResist, attrs {senses:+1}, skills {stealth:+5},
 *   carry (+carry weight), outfit (G.chars outfit id for NPC dressing),
 *   exoRig:true (requires the Exo-Rig Certified Talent), helmetFor (rig helmet pairing)
 * ===================================================================== */
(function () {
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
  A({
    id: "exo_rig_mk3",
    name: "Exo-Rig Mk III",
    weight: 45,
    value: 1400,
    dr: 45,
    dt: 8,
    radResist: 20,
    attrs: { brawn: 1 },
    exoRig: true,
    helmetFor: "exo_rig_mk3_helmet",
    outfit: "continuity_exo_rig",
    tags: ["apparel", "exo_rig", "continuity"],
    mesh: "rig_mk3",
    noLoot: true,
    desc: "The Continuity's own pattern, olive drab with white federal stars and a servo-assisted frame that never stops humming. Built from blueprints nobody else was supposed to keep.",
  });
  A({
    id: "exo_rig_mk3_helmet",
    name: "Exo-Rig Mk III Helmet",
    slot: "head",
    weight: 5,
    value: 250,
    dr: 10,
    radResist: 10,
    attrs: { senses: 1 },
    exoRig: true,
    tags: ["apparel", "helmet", "exo_rig", "continuity"],
    mesh: "helmet_continuity",
    noLoot: true,
    desc: "A domed olive helm with a slit visor glowing faint green-white, and a loudhailer grille that turns every word into an order.",
  });
  A({
    id: "continuity_officer_uniform",
    name: "Continuity Officer Uniform",
    weight: 2,
    value: 90,
    dr: 5,
    attrs: { presence: 1 },
    skills: { persuasion: 5 },
    outfit: "lab_coat",
    tags: ["apparel", "clothing", "continuity"],
    mesh: "cloth_black",
    lootWeight: 0.3,
    desc: "A pressed 1967 Army service uniform, kept spotless for twenty-two years by men who still file reports in triplicate.",
  });
  A({
    id: "continuity_officer_cap",
    name: "Continuity Officer Cap",
    slot: "head",
    weight: 1,
    value: 40,
    dr: 1,
    attrs: { presence: 1 },
    tags: ["apparel", "hat", "continuity"],
    mesh: "hat_officer",
    lootWeight: 0.3,
    desc: 'A peaked service cap with a gold eagle and a "CONTINUITY OF GOVERNMENT" band. Makes anyone look like they are about to read you a regulation.',
  });

  // ---------------------------------------------------------------
  // Faction robes & uniforms
  // ---------------------------------------------------------------
  A({
    id: "covenant_archivist_robe",
    name: "Covenant Archivist Robe",
    weight: 2,
    value: 40,
    dr: 4,
    skills: { electronics: 5, mechanics: 5 },
    outfit: "lab_coat",
    tags: ["apparel", "clothing", "covenant"],
    mesh: "cloth_red",
    lootWeight: 0.4,
    desc: "A hooded rust-brown work robe with a gear-tooth hem, worn by the Iron Covenant's archivists, the keepers of salvaged technology and stern librarians.",
  });
  A({
    id: "glowkeeper_robes",
    name: "Glowkeeper Robes",
    weight: 2,
    value: 30,
    dr: 3,
    radResist: 10,
    outfit: "glowkeeper_robes",
    tags: ["apparel", "clothing", "glowkeepers"],
    mesh: "cloth_green",
    lootWeight: 0.4,
    desc: "Undyed sackcloth robes stitched with a golden sun disc. The Glowkeepers wear them to the craters to give thanks for the light.",
  });
  A({
    id: "radiation_suit",
    name: "Radiation Suit",
    weight: 5,
    value: 60,
    dr: 8,
    radResist: 30,
    tags: ["apparel", "clothing", "hazmat"],
    mesh: "cloth_yellow",
    desc: "A yellow rubberized hazmat suit with sealed cuffs. Squeaks when you walk. Beats glowing.",
  });
  A({
    id: "radiation_hood",
    name: "Radiation Suit Hood",
    slot: "head",
    weight: 1,
    value: 20,
    dr: 2,
    radResist: 10,
    tags: ["apparel", "helmet", "hazmat"],
    mesh: "helmet_hazmat",
    desc: "The matching hood, with a fogged plastic faceplate.",
  });
  A({
    id: "heavy_radiation_suit",
    name: "Heavy Radiation Suit",
    weight: 7,
    value: 180,
    dr: 10,
    radResist: 40,
    tags: ["apparel", "clothing", "hazmat"],
    mesh: "cloth_orange",
    lootWeight: 0.4,
    desc: "An improved hazmat suit with lead-lined panels, built for reactor technicians. Heavier, safer, sweatier.",
  });
  A({
    id: "lab_coat",
    name: "Lab Coat",
    weight: 2,
    value: 10,
    dr: 2,
    skills: { electronics: 5, medicine: 5 },
    outfit: "lab_coat",
    tags: ["apparel", "clothing"],
    mesh: "cloth_white",
    desc: "A long white lab coat with a pocket protector still in place. Instantly adds five points of credibility.",
  });
  A({
    id: "doctor_scrubs",
    name: "Street Medic Fatigues",
    weight: 2,
    value: 15,
    dr: 3,
    skills: { medicine: 10 },
    outfit: "doctor",
    tags: ["apparel", "clothing"],
    mesh: "cloth_white",
    desc: "Stained surgical scrubs with a leather apron. Every stain is a story; most of them end badly.",
  });
  A({
    id: "mechanic_coveralls",
    name: "Mechanic Coveralls",
    weight: 2,
    value: 10,
    dr: 2,
    skills: { mechanics: 10 },
    outfit: "settler",
    tags: ["apparel", "clothing"],
    mesh: "cloth_grey",
    desc: 'Grease-stiff coveralls with "SAL" embroidered on the chest. Sal is not coming back for them.',
  });
  A({
    id: "army_fatigues",
    name: "Army Fatigues",
    weight: 3,
    value: 20,
    dr: 4,
    skills: { firearms: 5 },
    outfit: "combat_armor",
    tags: ["apparel", "clothing"],
    mesh: "cloth_olive",
    desc: 'Olive drab fatigues, U.S. Army issue. Name tape reads "DOE." Of course it does.',
  });
  A({
    id: "army_helmet",
    name: "Army Helmet",
    slot: "head",
    weight: 2,
    value: 20,
    dr: 3,
    tags: ["apparel", "helmet"],
    mesh: "helmet_army",
    desc: "A steel pot helmet with a netting cover. The camouflage is for a forest that no longer exists.",
  });

  // ---------------------------------------------------------------
  // Street wear & settler clothing
  // ---------------------------------------------------------------
  A({
    id: "patched_workwear",
    name: "Patched Workwear",
    weight: 2,
    value: 8,
    dr: 2,
    outfit: "settler",
    tags: ["apparel", "clothing"],
    mesh: "cloth_brown",
    desc: "Patched overalls and a flannel shirt. Honest, hardworking, and in need of a wash since about 1975.",
  });
  A({
    id: "biker_leathers",
    name: "Biker Leathers",
    weight: 5,
    value: 20,
    dr: 5,
    skills: { melee: 5 },
    outfit: "drifter",
    tags: ["apparel", "clothing"],
    mesh: "cloth_brown",
    desc: 'A cracked leather jacket and scuffed chaps. The look says "don\'t." The smell says "please don\'t."',
  });
  A({
    id: "hired_gun_fatigues",
    name: "Hired Gun Fatigues",
    weight: 5,
    value: 30,
    dr: 6,
    skills: { firearms: 5 },
    outfit: "drifter",
    tags: ["apparel", "clothing"],
    mesh: "cloth_olive",
    desc: "Hardwearing canvas and a load-bearing vest, the uniform of every trade-wagon guard between here and Jersey.",
  });
  A({
    id: "hired_gun_vest",
    name: "Hired Gun Vest",
    weight: 5,
    value: 35,
    dr: 6,
    skills: { melee: 5 },
    outfit: "drifter",
    tags: ["apparel", "clothing"],
    mesh: "cloth_black",
    desc: "A leather duster over a torn tank top. Every bar fight in the Neon started with somebody wearing this.",
  });
  A({
    id: "drifter_coat",
    name: "Drifter's Coat",
    weight: 4,
    value: 40,
    dr: 6,
    attrs: { grit: 1 },
    outfit: "drifter",
    tags: ["apparel", "clothing"],
    mesh: "cloth_brown",
    lootWeight: 0.5,
    desc: "A long, dust-coloured coat with deep pockets, a turned-up collar and holes where the lining used to be.",
  });
  A({
    id: "merchant_outfit",
    name: "Merchant Outfit",
    weight: 3,
    value: 30,
    dr: 3,
    skills: { trade: 5 },
    outfit: "merchant",
    tags: ["apparel", "clothing"],
    mesh: "cloth_brown",
    desc: "A vest with a dozen pockets, a pencil behind each ear, and a coin purse sewn inside the lining.",
  });
  A({
    id: "survivor_layers",
    name: "Survivor Layers",
    weight: 1,
    value: 3,
    dr: 1,
    radResist: 5,
    outfit: "survivor_layers",
    tags: ["apparel", "clothing"],
    mesh: "cloth_grey",
    desc: "A long coat over a knit pullover, a cowl scarf and a watch cap: twenty-two winters of street wear, patched and re-patched. Half the Neon dresses like this.",
  });

  // ---------------------------------------------------------------
  // Old-world clothing (New York flavour)
  // ---------------------------------------------------------------
  A({
    id: "old_world_businesswear",
    name: "Old-World Businesswear",
    weight: 2,
    value: 20,
    dr: 1,
    attrs: { presence: 1 },
    outfit: "merchant",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_grey",
    desc: "A grey flannel suit with narrow lapels and a tie clip. Madison Avenue's finest, with only minor ash damage.",
  });
  A({
    id: "old_world_casualwear",
    name: "Old-World Casualwear",
    weight: 2,
    value: 10,
    dr: 1,
    attrs: { reflex: 1 },
    outfit: "settler",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_blue",
    desc: "Rolled jeans and a short-sleeve button-up. Perfect for a Sunday stroll through Central Park, which is now a deathtrap.",
  });
  A({
    id: "old_world_spring_dress",
    name: "Old-World Spring Dress",
    weight: 1,
    value: 15,
    dr: 1,
    attrs: { presence: 1 },
    outfit: "settler",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_floral",
    desc: "A floral dress from a Fifth Avenue department store. The flowers have outlived every real flower in the city.",
  });
  A({
    id: "old_world_formalwear",
    name: "Old-World Formal Wear",
    weight: 2,
    value: 40,
    dr: 1,
    attrs: { presence: 1 },
    skills: { persuasion: 5 },
    outfit: "merchant",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_black",
    desc: "A tuxedo last worn to a Broadway premiere in the winter of 1967. The show got terrible reviews. Then, well.",
  });
  A({
    id: "stockbroker_suit",
    name: "Stockbroker's Three-Piece",
    weight: 2,
    value: 60,
    dr: 2,
    skills: { trade: 10 },
    outfit: "merchant",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_grey",
    lootWeight: 0.4,
    desc: "A Wall Street pinstripe with a pocket square and a ticker tape still stuck to the cuff. Sell high. Die rich.",
  });
  A({
    id: "showgirl_costume",
    name: "Broadway Showgirl Costume",
    weight: 1,
    value: 50,
    dr: 0,
    attrs: { presence: 2 },
    skills: { persuasion: 5 },
    outfit: "dj",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_sequin",
    lootWeight: 0.3,
    desc: "Sequins, feathers and very little else, from the wardrobe room of a 42nd Street revue. Glitters in the rubble.",
  });
  A({
    id: "conductor_uniform",
    name: "Subway Conductor Uniform",
    weight: 2,
    value: 20,
    dr: 3,
    skills: { mechanics: 5 },
    outfit: "settler",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_blue",
    desc: "A navy transit authority jacket with brass buttons. Stand clear of the closing doors, please.",
  });
  A({
    id: "doorman_uniform",
    name: "Doorman's Uniform",
    weight: 2,
    value: 25,
    dr: 2,
    attrs: { presence: 1 },
    outfit: "merchant",
    tags: ["apparel", "clothing", "oldworld"],
    mesh: "cloth_red",
    desc: "Maroon wool with gold braid, from a Park Avenue apartment lobby. The building is gone; the dignity remains.",
  });

  // ---------------------------------------------------------------
  // Hats, glasses & masks
  // ---------------------------------------------------------------
  A({
    id: "fedora",
    name: "Fedora",
    slot: "head",
    weight: 1,
    value: 10,
    attrs: { senses: 1 },
    tags: ["apparel", "hat"],
    mesh: "hat_fedora",
    desc: "A felt fedora with a pinched crown. Adds a certain hard-boiled perspective to everything you look at.",
  });
  A({
    id: "newsboy_cap",
    name: "Newsboy Cap",
    slot: "head",
    weight: 1,
    value: 8,
    attrs: { presence: 1 },
    tags: ["apparel", "hat"],
    mesh: "hat_cap",
    desc: "Extra, extra — the world ended! Read all about it!",
  });
  A({
    id: "baseball_cap",
    name: "Baseball Cap",
    slot: "head",
    weight: 1,
    value: 6,
    skills: { firearms: 2 },
    tags: ["apparel", "hat"],
    mesh: "hat_cap",
    desc: "A faded cap from a Bronx ball club. They were having a good season.",
  });
  A({
    id: "cowboy_hat",
    name: "Cowboy Hat",
    slot: "head",
    weight: 1,
    value: 10,
    attrs: { reflex: 1 },
    tags: ["apparel", "hat"],
    mesh: "hat_cowboy",
    desc: "Not a lot of cattle in Manhattan. Plenty of pack oxen, though.",
  });
  A({
    id: "top_hat",
    name: "Top Hat",
    slot: "head",
    weight: 1,
    value: 20,
    attrs: { presence: 1 },
    skills: { persuasion: 3 },
    tags: ["apparel", "hat"],
    mesh: "hat_top",
    desc: "A silk opera hat from the Metropolitan. The kind of hat that demands to be tipped.",
  });
  A({
    id: "bowler_hat",
    name: "Bowler Hat",
    slot: "head",
    weight: 1,
    value: 12,
    attrs: { wits: 1 },
    tags: ["apparel", "hat"],
    mesh: "hat_bowler",
    desc: "A rounded derby hat. Makes the wearer look like a banker, a butler or a burglar.",
  });
  A({
    id: "liberty_crown",
    name: "Foam Liberty Crown",
    slot: "head",
    weight: 0.5,
    value: 5,
    attrs: { presence: 1, senses: 1 },
    tags: ["apparel", "hat", "souvenir"],
    mesh: "hat_crown",
    lootWeight: 0.3,
    desc: "A green foam souvenir crown from a Battery Park gift stand. Seven spikes for seven seas and continents. Surprisingly uplifting.",
  });
  A({
    id: "hard_hat",
    name: "Hard Hat",
    slot: "head",
    weight: 1,
    value: 10,
    dr: 3,
    skills: { mechanics: 2 },
    tags: ["apparel", "helmet"],
    mesh: "hat_hard",
    desc: "A yellow construction helmet from the eternal repair work on the FDR Drive.",
  });
  A({
    id: "motorcycle_helmet",
    name: "Motorcycle Helmet",
    slot: "head",
    weight: 2,
    value: 20,
    dr: 4,
    tags: ["apparel", "helmet"],
    mesh: "helmet_moto",
    desc: "A scuffed open-face helmet with a flame decal. Safety first, style a very close second.",
  });
  A({
    id: "sunglasses",
    name: "Sunglasses",
    slot: "eyes",
    weight: 0,
    value: 5,
    attrs: { presence: 1 },
    tags: ["apparel", "glasses"],
    mesh: "glasses",
    desc: "Dark aviator shades. The sun is harsher now, and so are you.",
  });
  A({
    id: "reading_glasses",
    name: "Reading Glasses",
    slot: "eyes",
    weight: 0,
    value: 5,
    attrs: { wits: 1 },
    tags: ["apparel", "glasses"],
    mesh: "glasses",
    desc: "Horn-rimmed spectacles with a small crack in the left lens. The world is sharper, if not better.",
  });
  A({
    id: "shooting_glasses",
    name: "Shooting Glasses",
    slot: "eyes",
    weight: 0,
    value: 12,
    attrs: { senses: 1 },
    tags: ["apparel", "glasses"],
    mesh: "glasses",
    lootWeight: 0.5,
    desc: "Yellow-tinted range glasses. Everything looks like a target, which is more or less accurate.",
  });
  A({
    id: "gas_mask",
    name: "Gas Mask",
    slot: "mouth",
    weight: 2,
    value: 15,
    dr: 1,
    radResist: 10,
    tags: ["apparel", "mask"],
    mesh: "gas_mask",
    desc: "A civil-defense rubber mask from a subway emergency locker. Breathing through it sounds like a leaky accordion.",
  });
  A({
    id: "bandana",
    name: "Bandana",
    slot: "mouth",
    weight: 0,
    value: 3,
    attrs: { reflex: 1 },
    tags: ["apparel", "mask"],
    mesh: "bandana",
    desc: "A red paisley bandana. Keeps the dust out and the anonymity in.",
  });
  A({
    id: "hockey_mask",
    name: "Hockey Mask",
    slot: "mouth",
    weight: 1,
    value: 10,
    dr: 1,
    attrs: { presence: -1 },
    skills: { melee: 5 },
    tags: ["apparel", "mask"],
    mesh: "mask_hockey",
    lootWeight: 0.4,
    desc: "A white goalie mask from a Rangers fan who never made it to the game. Wearing it makes people very nervous around you.",
  });
})();
