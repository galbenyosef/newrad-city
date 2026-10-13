/* src/crafting/00_data.js */
/* =====================================================================
 * NEW RAD CITY — CRAFTING · 00_data.js
 * Namespace + static data: item defs owned by crafting (two schematic
 * weapons, their schematic diagrams, the Gunsmith Kit, forage ingredients,
 * campfire food & field remedies), our own recipes (workshop, chemistry,
 * cooking, remedies), harvestable plant patches and schematic placements.
 *
 * Weapons already owns five schematic weapons + the workshop mods/ammo
 * (src/weapons/70_craft.js); crafting shows them in the same workbench
 * screen and builds them through G.weapons.craft (see 20_logic.js).
 * All ids we create are prefixed `cr_` (items) / `schematic_cr_`.
 *
 * Skill gates use the rpg skill ids (shared; labels in X.SKILL_NAMES).
 * Item ids of other modules (rpg aid / food / junk, weapons ammo) are
 * shared ids owned by those modules.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;

  // Replace the namespace wholesale (contract §0.3). Internals live on C._ (= X).
  const C = (G.crafting = { __crafting: true });
  const X = (C._ = {});

  // ------------------------------------------------------------------
  // Skills shown / used by the recipe gates (rpg skill id → label)
  // ------------------------------------------------------------------
  X.SKILL_NAMES = {
    mechanics: "Mechanics",
    electronics: "Electronics",
    medicine: "Medicine",
    survival: "Survival",
    explosives: "Explosives",
  };
  X.SKILL_ABBR = {
    mechanics: "MEC",
    electronics: "ELC",
    medicine: "MED",
    survival: "SRV",
    explosives: "EXP",
  };

  // ------------------------------------------------------------------
  // Schematic weapons owned by crafting: the Lunchbox Mine.
  // `w` = weapon block overrides on top of the weapons module's BASE block.
  // ------------------------------------------------------------------
  X.WEAPON_DEFS = [
    {
      id: "cr_lunchbox_mine",
      name: "Lunchbox Mine",
      weight: 0.5,
      value: 75,
      desc: 'A tin "Super Sergeant" lunchbox packed with a frag mine, a motion sensor and two fistfuls of roofing nails. When the lid pops, the nails go everywhere at once.',
      w: {
        skill: "explosives",
        damage: 250,
        rof: 1.0,
        magSize: 1,
        ammo: "cr_lunchbox_mine",
        critMult: 1,
        sound: "melee_swing",
        viewmodel: "frag_mine",
        skin: "lunchbox",
        damageType: "explosive",
        projectile: "mine",
        projectileSpeed: 7,
        explosionRadius: 7,
        reloadType: "throw",
        flash: "none",
        twoHanded: false,
        shell: null,
        fuse: 60,
        mine: true,
        condDecay: 0,
      },
    },
  ];

  // ------------------------------------------------------------------
  // Our schematics (learned on pickup, copies 1..3).
  //   mine     → each copy adds one mine per build
  // ------------------------------------------------------------------
  X.SCHEM = {
    schematic_cr_lunchbox_mine: {
      name: "Schematic - Lunchbox Mine",
      makes: "cr_lunchbox_mine",
      perCopy: "count",
      art: "mine",
      parts: [
        ["frag_mine", 1],
        ["lunchbox", 1],
        ["relay_board", 1],
        ["scrap_metal", 2],
      ],
      text: 'A "Super Sergeant" comic with the centre pages replaced by pencil diagrams: "Lid hinge = tripwire. Nails go in LAST. Do not store under bed." Signed, in crayon, "the Bowery Boys".',
    },
  };

  // ------------------------------------------------------------------
  // Items (G.items.define). Ingredients are aid (edible forage).
  // ------------------------------------------------------------------
  X.ITEM_DEFS = [
    // schematic diagrams (misc, consumed on pickup → learned)
    {
      id: "schematic_cr_lunchbox_mine",
      name: "Schematic - Lunchbox Mine",
      type: "misc",
      weight: 0,
      value: 50,
      tags: ["schematic"],
      mesh: "clipboard",
      noLoot: true,
      icon: "note",
      schematic: "cr_lunchbox_mine",
    },
    // Gunsmith Kit: used from the goggles inventory (Aid) or the workbench REPAIR tab
    {
      id: "cr_weapon_repair_kit",
      name: "Gunsmith Kit",
      type: "aid",
      weight: 2,
      value: 100,
      tags: ["repair", "tool"],
      mesh: "lunchbox",
      sound: "reload",
      noLoot: true,
      effects: {},
      desc: "Files, springs, pins, a tube of glue and a greasy rag in a tin box. Use it to restore the condition of your equipped weapon. Better hands, better results.",
    },
    // forage (harvested from plants in the parks)
    {
      id: "cr_ashbloom",
      name: "Ashbloom",
      type: "aid",
      weight: 0.1,
      value: 6,
      tags: ["food", "forage", "ingredient"],
      mesh: "gnarlberry",
      sound: "eat",
      noLoot: true,
      effects: { hpOverTime: [6, 4] },
      desc: "A rust-orange bloom that pushes up through the dead turf of Central Park wherever the ash fell thickest. Bitter as a lawyer. Grind it with knotroot for a root poultice.",
    },
    {
      id: "cr_knotroot",
      name: "Knotroot",
      type: "aid",
      weight: 0.2,
      value: 8,
      tags: ["food", "forage", "ingredient"],
      mesh: "fungus",
      sound: "eat",
      noLoot: true,
      effects: { hpOverTime: [8, 4] },
      desc: "A knobbly purple taproot. Old-timers boil it for the stomach, chew it for the nerves and swear by it for everything else.",
    },
    // campfire food
    {
      id: "cr_roach_kebab",
      name: "Roach Kebab",
      type: "aid",
      weight: 0.4,
      value: 8,
      tags: ["food", "cooked"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [22, 6] },
      desc: "Two giant-roach thoraxes on a coat-hanger skewer, charred until the fire won the argument with the radiation. Crunchy. Honest.",
    },
    {
      id: "cr_jerky",
      name: "Street Jerky",
      type: "aid",
      weight: 0.1,
      value: 10,
      tags: ["food", "cooked"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [26, 12] },
      desc: "Thin strips of feral dog, smoked for hours over trash-can embers. Keeps forever, chews for about as long.",
    },
    {
      id: "cr_gasfly_slider",
      name: "Gasfly Slider",
      type: "aid",
      weight: 0.3,
      value: 14,
      tags: ["food", "cooked"],
      mesh: "bagel",
      sound: "eat",
      effects: { hpOverTime: [30, 6] },
      desc: "Grilled gasfly on a split old-world bagel. The Lower East Side's answer to the question nobody asked.",
    },
    {
      id: "cr_tunnel_stew",
      name: "Tunnel Stew",
      type: "aid",
      weight: 1,
      value: 22,
      tags: ["food", "cooked"],
      mesh: "can_chowder",
      sound: "eat",
      effects: { hpOverTime: [50, 10], duration: 180, attrs: { grit: 1 } },
      desc: "Burrow rat, a tin of Mama Marinara's and boiled river water, simmered in a hubcap the way the subway track crews made it. Sticks to the ribs, and to the pot.",
    },
    {
      id: "cr_bowery_knish",
      name: "Bowery Knish",
      type: "aid",
      weight: 0.3,
      value: 9,
      tags: ["food", "cooked"],
      mesh: "pretzel",
      sound: "eat",
      effects: { hpOverTime: [18, 5] },
      desc: "Crushed Saratoga Chips and shredded Golden Plain Jerky folded into a fried dough pocket. Twenty-two years after the bombs, still the best thing on Delancey Street.",
    },
    // campfire remedies (Survival recipes)
    {
      id: "cr_bitter_tonic",
      name: "Bitterroot Tonic",
      type: "aid",
      weight: 0.5,
      value: 20,
      tags: ["medical", "drink"],
      mesh: "bottle_small",
      sound: "drink",
      effects: { hpOverTime: [70, 12] },
      desc: "A dark tonic of ashbloom and knotroot in boiled water. Tastes like punishment, heals like a promise.",
    },
    {
      id: "cr_fungus_tea",
      name: "Tunnel-Fungus Tea",
      type: "aid",
      weight: 0.5,
      value: 25,
      tags: ["medical", "drink"],
      mesh: "mug",
      sound: "drink",
      effects: { radsOverTime: [-60, 20] },
      desc: "Grey cap mushrooms steeped in purified water. The old-timers who live along the IRT swear it pulls the glow out of your bones. It certainly pulls something out.",
    },
    {
      id: "cr_stevedore_brew",
      name: "Stevedore's Brew",
      type: "aid",
      weight: 0.5,
      value: 35,
      tags: ["chem", "drink"],
      mesh: "bottle_beer",
      sound: "drink",
      effects: {
        hpOverTime: [20, 8],
        dr: 8,
        duration: 240,
        attrs: { brawn: 1 },
      },
      desc: "Warm beer, grey cap and mashed gnarlberry, shaken until it foams. The longshoremen of the Hudson piers swear by it. Makes you tougher, braver and much louder.",
    },
  ];

  // ------------------------------------------------------------------
  // Our recipes. station: workbench | campfire; tab: workshop | chemistry |
  // cooking | remedies. req = skill gates (rpg skill ids). xp per craft.
  // ------------------------------------------------------------------
  const R = (id, station, tab, makes, n, parts, req, xp, art, note) => ({
    id,
    station,
    tab,
    makes,
    n,
    parts,
    req: req || {},
    xp: xp || 0,
    art,
    note,
  });
  X.RECIPES = [
    // ---- WORKBENCH · WORKSHOP (tools & ammunition) ----
    R(
      "cr_wk_repair_kit",
      "workbench",
      "workshop",
      "cr_weapon_repair_kit",
      1,
      [
        ["scrap_metal", 2],
        ["duct_tape", 1],
        ["tuff_bond", 1],
        ["scrap_electronics", 1],
      ],
      { mechanics: 40 },
      10,
      "kit",
    ),
    R(
      "cr_wk_dry_cell",
      "workbench",
      "workshop",
      "ammo_dry_cell",
      4,
      [["dry_cell", 1]],
      { electronics: 30 },
      5,
      "cell",
      "Split a dry cell's plates into four lantern batteries.",
    ),
    R(
      "cr_wk_gyrojet",
      "workbench",
      "workshop",
      "ammo_gyrojet",
      6,
      [
        ["scrap_metal", 1],
        ["gas_igniter", 1],
      ],
      { mechanics: 60 },
      8,
      "rounds",
      "Turn six rocket bodies from scrap, cant the nozzles and pack them with igniter compound.",
    ),
    R(
      "cr_wk_shells",
      "workbench",
      "workshop",
      "ammo_12ga",
      8,
      [
        ["tin_can", 2],
        ["scrap_metal", 1],
      ],
      { mechanics: 35 },
      5,
      "shells",
      "Hand-loaded buckshot: tin-can hulls, scrap shot and a prayer.",
    ),
    R(
      "cr_wk_10mm",
      "workbench",
      "workshop",
      "ammo_10mm",
      12,
      [
        ["bent_tin_can", 2],
        ["scrap_metal", 1],
      ],
      { mechanics: 45 },
      5,
      "rounds",
      "Re-swaged 10mm cases with scrap-lead bullets.",
    ),
    // ---- WORKBENCH · CHEMISTRY (Electronics / Medicine) ----
    R(
      "cr_ch_rally_tonic",
      "workbench",
      "chemistry",
      "rally_tonic",
      1,
      [
        ["whiskey", 1],
        ["root_poultice", 2],
      ],
      { medicine: 45 },
      10,
      "bottle",
      "Two root poultices steeped in a shot of whiskey, strained and corked. Doctor recommended. You are the doctor.",
    ),
    R(
      "cr_ch_rally_tonic_extra",
      "workbench",
      "chemistry",
      "rally_tonic_extra",
      1,
      [
        ["rally_tonic", 1],
        ["bull_tabs", 1],
        ["gnarlberry", 1],
      ],
      { medicine: 70 },
      15,
      "bottle",
    ),
    R(
      "cr_ch_prussian_blue",
      "workbench",
      "chemistry",
      "prussian_blue",
      1,
      [
        ["purified_water", 1],
        ["grey_cap", 1],
        ["scrap_metal", 1],
      ],
      { medicine: 40, electronics: 40 },
      10,
      "pills",
      "Iron salts from scrap, precipitated blue and packed into capsules. The painters' pigment, doing a doctor's job.",
    ),
    R(
      "cr_ch_iodine",
      "workbench",
      "chemistry",
      "iodine_tabs",
      1,
      [
        ["glowcap", 1],
        ["cr_knotroot", 1],
      ],
      { electronics: 40 },
      8,
      "pills",
    ),
    R(
      "cr_ch_focus",
      "workbench",
      "chemistry",
      "focus_pills",
      1,
      [
        ["grey_cap", 2],
        ["gnarlberry", 1],
      ],
      { medicine: 45, electronics: 50 },
      10,
      "pills",
    ),
    R(
      "cr_ch_morphine",
      "workbench",
      "chemistry",
      "morphine_syrette",
      1,
      [
        ["surgical_tubing", 1],
        ["root_poultice", 1],
        ["glowcap", 1],
      ],
      { medicine: 55 },
      10,
      "syringe",
    ),
    R(
      "cr_ch_rush",
      "workbench",
      "chemistry",
      "rush",
      1,
      [
        ["tin_can", 1],
        ["turpentine", 1],
        ["homeguard_cleanser", 1],
      ],
      { electronics: 45, medicine: 20 },
      8,
      "inhaler",
    ),
    R(
      "cr_ch_surgery_kit",
      "workbench",
      "chemistry",
      "field_surgery_kit",
      1,
      [
        ["surgical_tubing", 2],
        ["duct_tape", 1],
        ["tuff_bond", 1],
        ["root_poultice", 1],
      ],
      { medicine: 70 },
      15,
      "bag",
    ),
    R(
      "cr_ch_shade_field",
      "workbench",
      "chemistry",
      "shade_field",
      1,
      [
        ["relay_board", 1],
        ["dry_cell", 1],
        ["conductor", 1],
        ["vacuum_tube", 1],
      ],
      { electronics: 80 },
      25,
      "stealth",
    ),
    // ---- CAMPFIRE · COOKING (Survival) ----
    R(
      "cr_ck_water",
      "campfire",
      "cooking",
      "purified_water",
      1,
      [["dirty_water", 2]],
      { survival: 10 },
      2,
      "bottle",
      "Boil it twice, strain it through a sock, trust it once.",
    ),
    R(
      "cr_ck_knish",
      "campfire",
      "cooking",
      "cr_bowery_knish",
      1,
      [
        ["saratoga_chips", 1],
        ["golden_plain_jerky", 1],
      ],
      { survival: 10 },
      3,
      "bun",
    ),
    R(
      "cr_ck_ox_steak",
      "campfire",
      "cooking",
      "ox_steak",
      1,
      [["ox_meat", 1]],
      { survival: 15 },
      3,
      "steak",
    ),
    R(
      "cr_ck_roach_kebab",
      "campfire",
      "cooking",
      "cr_roach_kebab",
      1,
      [["roach_meat", 2]],
      { survival: 15 },
      3,
      "skewer",
    ),
    R(
      "cr_ck_jerky",
      "campfire",
      "cooking",
      "cr_jerky",
      1,
      [["dog_meat", 1]],
      { survival: 20 },
      4,
      "skewer",
    ),
    R(
      "cr_ck_slider",
      "campfire",
      "cooking",
      "cr_gasfly_slider",
      1,
      [
        ["gasfly_meat", 1],
        ["old_world_bagel", 1],
      ],
      { survival: 25 },
      4,
      "bun",
    ),
    R(
      "cr_ck_tunnel_stew",
      "campfire",
      "cooking",
      "cr_tunnel_stew",
      1,
      [
        ["burrow_rat_meat", 1],
        ["mama_marinara_meatballs", 1],
        ["dirty_water", 1],
      ],
      { survival: 30 },
      5,
      "pot",
    ),
    R(
      "cr_ck_shellback_cakes",
      "campfire",
      "cooking",
      "shellback_cakes",
      1,
      [
        ["shellback_meat", 1],
        ["freedom_flakes", 1],
      ],
      { survival: 35 },
      5,
      "pan",
    ),
    R(
      "cr_ck_chowder",
      "campfire",
      "cooking",
      "shellback_chowder",
      1,
      [
        ["shellback_meat", 1],
        ["purified_water", 1],
        ["cr_knotroot", 1],
      ],
      { survival: 40 },
      6,
      "pot",
    ),
    R(
      "cr_ck_omelet",
      "campfire",
      "cooking",
      "ruins_omelet",
      1,
      [
        ["shellback_meat", 1],
        ["ox_milk", 1],
        ["gnarlberry", 1],
      ],
      { survival: 50 },
      6,
      "pan",
    ),
    R(
      "cr_ck_ripjaw_steak",
      "campfire",
      "cooking",
      "ripjaw_steak",
      1,
      [["ripjaw_meat", 1]],
      { survival: 60 },
      10,
      "steak",
    ),
    // ---- CAMPFIRE · REMEDIES (Survival + Medicine) ----
    R(
      "cr_rm_root_poultice",
      "campfire",
      "remedies",
      "root_poultice",
      1,
      [
        ["cr_ashbloom", 1],
        ["cr_knotroot", 1],
      ],
      { survival: 20 },
      5,
      "powder",
    ),
    R(
      "cr_rm_fungus_tea",
      "campfire",
      "remedies",
      "cr_fungus_tea",
      1,
      [
        ["grey_cap", 1],
        ["purified_water", 1],
      ],
      { survival: 35, medicine: 20 },
      6,
      "mug",
    ),
    R(
      "cr_rm_bitter_tonic",
      "campfire",
      "remedies",
      "cr_bitter_tonic",
      1,
      [
        ["cr_ashbloom", 1],
        ["cr_knotroot", 1],
        ["purified_water", 1],
      ],
      { survival: 50 },
      8,
      "bottle",
    ),
    R(
      "cr_rm_stevedore_brew",
      "campfire",
      "remedies",
      "cr_stevedore_brew",
      1,
      [
        ["beer", 1],
        ["grey_cap", 1],
        ["gnarlberry", 1],
      ],
      { survival: 60 },
      10,
      "bottle",
    ),
  ];

  // Station tabs (key, label).
  X.TABS = {
    workbench: [
      ["schematics", "SCHEMATICS"],
      ["workshop", "WORKSHOP"],
      ["chemistry", "CHEMISTRY"],
      ["modify", "MODIFY"],
      ["repair", "REPAIR"],
    ],
    campfire: [
      ["cooking", "COOKING"],
      ["remedies", "REMEDIES"],
    ],
  };
  X.STATION_TITLE = { workbench: "WORKBENCH", campfire: "CAMPFIRE" };

  // Blueprint art per output id (weapons-owned items & common outputs). Our recipes carry their own `art`.
  X.ART_BY_ITEM = {
    third_rail_shoe: "blade",
    siren_horn: "launcher",
    rivet_gun: "dartgun",
    molotov: "grenade",
    cr_lunchbox_mine: "mine",
    ammo_rivet: "spikes",
    ammo_dry_cell: "cell",
    mod_10mm_silencer: "silencer",
    mod_10mm_ext_mag: "mag",
    mod_rifle_ext_mag: "mag",
    mod_rifle_scope: "scope",
    mod_44_scope: "scope",
    mod_gyro_venturi: "lens",
  };
  /** Blueprint kind for an item id. */
  X.artFor = function (id, fb) {
    if (X.ART_BY_ITEM[id]) return X.ART_BY_ITEM[id];
    return fb || "generic";
  };

  // ------------------------------------------------------------------
  // Schematic diagrams in the world: [schematicId, x, z, searchRadius, note]
  // (static pickups: remembered per save). Third copies sit somewhere risky.
  // ------------------------------------------------------------------
  X.SCHEM_PLACEMENTS = [
    [
      "schematic_cr_lunchbox_mine",
      4,
      -40,
      10,
      "Herald Square, by the Sterling's entrance",
    ],
    [
      "schematic_cr_lunchbox_mine",
      0,
      790,
      12,
      "Wall Street, under the Stock Exchange columns",
    ],
    ["schematic_cr_lunchbox_mine", 150, 935, 14, "Battery Park promenade"],
  ];

  // ------------------------------------------------------------------
  // Harvestable plant patches: [x, z, radius, count, species mix 0..1 (share of ashbloom)]
  // ------------------------------------------------------------------
  X.PLANT_PATCHES = [
    [-58, -694, 5, 4, 0.5], // west shore of the Lake (by the camp; teaches foraging)
    [-60, -500, 9, 6, 0.5], // Sheep Meadow
    [30, -560, 7, 4, 0.6], // near the Terrace fountain
    [-50, -670, 7, 4, 0.4], // Lake shore / Ramble
    [60, -950, 9, 5, 0.3], // North Woods
    [80, -208, 6, 4, 0.5], // Bryant Park lawn
    [80, 445, 7, 4, 0.5], // Washington Square
    [-60, 960, 9, 5, 0.5], // Battery Park
  ];
  X.PLANT_SPECIES = {
    ashbloom: { item: "cr_ashbloom", label: "Ashbloom" },
    knotroot: { item: "cr_knotroot", label: "Knotroot" },
  };
  X.REGROW_HOURS = 72; // three game days

  // Extra campfires we light ourselves if the area has none (survivor camps).
  X.CAMPFIRES = [
    [-48, -690, "pot"], // Lake shore survivor camp
    [-30, 945, "spit"], // Battery Park fishermen
    [95, -200, "pot"], // Bryant Park squatters
  ];
  // Extra workbench at the Lake shore camp (so the first schematics can be built early).
  X.WORKBENCHES = [[-44, -688, Math.PI / 2]];
})();
