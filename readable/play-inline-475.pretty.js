/* src/rpg/20_loot_tables.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — LOOT TABLES
 *
 * Table ids usable by props (`opts.loot`), containers, combat (`def.loot`)
 * and quests:
 *  containers: ammo_box, first_aid, medical_cabinet, fridge, cooler, desk, file_cabinet,
 *    safe, wall_safe, locker, cryo_locker, footlocker, toolbox, dumpster, trash_can, mailbox,
 *    fizzo_machine, cash_register, scrip_stash, weapon_crate, dresser, bookshelf,
 *    luggage, briefcase, crate, cabinet, grocery_shelf, raider_stash, covenant_crate,
 *    continuity_crate, workbench, newspaper_box, field_surgery_kit, mail_sack, skeleton, corpse
 *  actors: raider, raider_boss, brute, colossus, maniac, maniac_bruiser, robot, patrolman,
 *    valet, sky_eye, bulwark, continuity, continuity_soldier, covenant, covenant_warden,
 *    settler, merchant, trade_wagon, giant_roach, burrow_rat, gasfly, shellback,
 *    shellback_matriarch, ripjaw, dog, creature
 *  merchant stock: merchant_general, merchant_doctor, merchant_arms, merchant_food, merchant_tech
 *  helpers: junk_common, junk_office, junk_household, junk_valuable, electronics,
 *    food_oldworld, drinks, chems, medical, apparel_common, hats, books
 * Old table ids (and actor types / factions) resolve through src/core/compat.js.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const T = (id, t) => G.items.defineLootTable(id, t);
  const R = (chance, picks, entries) => ({ chance, picks, entries });

  // ---------------------------------------------------------------
  // Building blocks
  // ---------------------------------------------------------------
  T("junk_common", {
    rolls: [
      R(1, 1, [
        { id: "tin_can", w: 4 },
        { id: "bent_tin_can", w: 3 },
        { id: "empty_fizzo_bottle", w: 3 },
        { id: "scrap_metal", w: 4 },
        { id: "coffee_mug", w: 2 },
        { id: "plate", w: 2 },
        { id: "fork", w: 2 },
        { id: "pencil", w: 2 },
        { id: "clipboard", w: 1 },
        { id: "duct_tape", w: 1 },
        { id: "tuff_bond", w: 1 },
        { id: "homeguard_cleanser", w: 1 },
        { id: "turpentine", w: 1 },
        { id: "milk_bottle", w: 1 },
        { id: "empty_whiskey_bottle", w: 2 },
        { id: "lighter", w: 1 },
        { id: "toy_car", w: 1 },
        { id: "teddy_bear", w: 0.6 },
        { id: "baseball", w: 0.6 },
        { id: "pool_ball", w: 0.4 },
        { id: "subway_token", w: 1 },
        { id: "souvenir_statue", w: 0.5 },
        { id: "ashtray", w: 1 },
        { id: "old_world_book", w: 1 },
        { id: "ruined_book", w: 1 },
      ]),
    ],
  });
  T("junk_office", {
    rolls: [
      R(1, 1, [
        { id: "clipboard", w: 3 },
        { id: "pencil", w: 4 },
        { id: "coffee_mug", w: 2 },
        { id: "typewriter", w: 0.4 },
        { id: "old_dollars", w: 2 },
        { id: "stock_certificate", w: 2 },
        { id: "cigarettes", w: 1 },
        { id: "old_world_book", w: 1 },
        { id: "scrap_electronics", w: 0.6 },
        { id: "vacuum_tube", w: 0.6 },
        { id: "ashtray", w: 1 },
      ]),
    ],
  });
  T("junk_household", {
    rolls: [
      R(1, 1, [
        { id: "plate", w: 3 },
        { id: "cooking_pan", w: 1 },
        { id: "fork", w: 3 },
        { id: "coffee_mug", w: 3 },
        { id: "tin_can", w: 2 },
        { id: "homeguard_cleanser", w: 1 },
        { id: "milk_bottle", w: 2 },
        { id: "teddy_bear", w: 0.6 },
        { id: "toy_car", w: 0.8 },
        { id: "lunchbox", w: 0.6 },
        { id: "souvenir_paperweight", w: 0.3 },
        { id: "cigarettes", w: 1 },
        { id: "old_world_book", w: 1 },
      ]),
    ],
  });
  T("junk_valuable", {
    rolls: [
      R(1, 1, [
        { id: "old_dollars", w: 5, n: [1, 3] },
        { id: "cigarette_carton", w: 2 },
        { id: "cigarettes", w: 3 },
        { id: "souvenir_paperweight", w: 1 },
        { id: "relay_board", w: 1 },
        { id: "dry_cell", w: 1 },
        { id: "gold_bar", w: 0.15, minLevel: 6 },
        { tag: "skill_book", w: 0.4 },
      ]),
    ],
  });
  T("electronics", {
    rolls: [
      R(1, 1, [
        { id: "scrap_electronics", w: 4 },
        { id: "vacuum_tube", w: 3 },
        { id: "conductor", w: 3 },
        { id: "relay_board", w: 1.5 },
        { id: "dry_cell", w: 2 },
        { id: "gas_igniter", w: 1 },
        { id: "microscope", w: 0.4 },
      ]),
    ],
  });
  T("food_oldworld", {
    rolls: [
      R(1, 1, [
        { id: "golden_plain_jerky", w: 3 },
        { id: "freedom_flakes", w: 2 },
        { id: "chocolate_zeppelin", w: 2 },
        { id: "mama_marinara_meatballs", w: 3 },
        { id: "franks_and_beans", w: 3 },
        { id: "frank_in_a_bun", w: 2 },
        { id: "salisbury_steak", w: 1 },
        { id: "saratoga_chips", w: 2 },
        { id: "astronaut_ice_cream", w: 1.5 },
        { id: "licorice_twists", w: 1 },
        { id: "bubblegum", w: 1 },
        { id: "chow_mein_cup", w: 1.5 },
        { id: "bodega_pretzel", w: 1 },
        { id: "old_world_bagel", w: 1 },
        { id: "dog_chow", w: 1 },
        { id: "cinnamon_bun", w: 0.4 },
      ]),
    ],
  });
  T("drinks", {
    rolls: [
      R(1, 1, [
        { id: "fizzo_cola", w: 5 },
        { id: "prairie_root_beer", w: 2 },
        { id: "dirty_water", w: 3 },
        { id: "purified_water", w: 2 },
        { id: "beer", w: 2 },
        { id: "whiskey", w: 1 },
        { id: "vodka", w: 1 },
        { id: "wine", w: 1 },
        { id: "scotch", w: 0.6 },
        { id: "fizzo_lime", w: 0.8 },
        { id: "fizzo_blue", w: 0.15, minLevel: 3 },
        { id: "egg_cream", w: 0.3 },
      ]),
    ],
  });
  T("chems", {
    rolls: [
      R(1, 1, [
        { id: "rage", w: 2 },
        { id: "rush", w: 3 },
        { id: "bull_tabs", w: 2 },
        { id: "focus_pills", w: 2 },
        { id: "morphine_syrette", w: 2 },
        { id: "sunny_pills", w: 1 },
        { id: "redline", w: 1 },
        { id: "overdrive", w: 0.4, minLevel: 6 },
        { id: "clean_slate", w: 0.5 },
      ]),
    ],
  });
  T("medical", {
    rolls: [
      R(1, 1, [
        { id: "rally_tonic", w: 6 },
        { id: "prussian_blue", w: 3 },
        { id: "iodine_tabs", w: 3 },
        { id: "morphine_syrette", w: 1.5 },
        { id: "blood_pack", w: 1.5 },
        { id: "rally_tonic_extra", w: 0.5, minLevel: 6 },
        { id: "field_surgery_kit", w: 0.6 },
        { id: "clean_slate", w: 0.4 },
        { id: "root_poultice", w: 0.5 },
      ]),
    ],
  });
  T("apparel_common", {
    rolls: [
      R(1, 1, [
        { id: "patched_workwear", w: 3 },
        { id: "old_world_casualwear", w: 3 },
        { id: "old_world_businesswear", w: 2 },
        { id: "old_world_spring_dress", w: 2 },
        { id: "biker_leathers", w: 1.5 },
        { id: "hired_gun_fatigues", w: 1 },
        { id: "mechanic_coveralls", w: 1 },
        { id: "lab_coat", w: 1 },
        { id: "army_fatigues", w: 1 },
        { id: "conductor_uniform", w: 0.6 },
        { id: "doorman_uniform", w: 0.5 },
        { id: "old_world_formalwear", w: 0.5 },
        { id: "showgirl_costume", w: 0.2 },
        { id: "stockbroker_suit", w: 0.3 },
        { id: "radiation_suit", w: 0.4 },
      ]),
    ],
  });
  T("hats", {
    rolls: [
      R(1, 1, [
        { id: "fedora", w: 2 },
        { id: "newsboy_cap", w: 2 },
        { id: "baseball_cap", w: 2 },
        { id: "bowler_hat", w: 1 },
        { id: "top_hat", w: 0.6 },
        { id: "cowboy_hat", w: 0.6 },
        { id: "hard_hat", w: 1 },
        { id: "motorcycle_helmet", w: 0.6 },
        { id: "sunglasses", w: 1.5 },
        { id: "reading_glasses", w: 1.5 },
        { id: "bandana", w: 1 },
        { id: "gas_mask", w: 0.8 },
        { id: "liberty_crown", w: 0.3 },
      ]),
    ],
  });
  T("books", {
    rolls: [
      R(1, 1, [
        { tag: "skill_book", w: 1 },
        { id: "old_world_book", w: 4 },
        { id: "ruined_book", w: 3 },
      ]),
    ],
  });
  T("armor_random", {
    rolls: [
      R(1, 1, [
        { id: "leather_armor", w: 3 },
        { id: "metal_armor", w: 1.5, minLevel: 3 },
        { id: "combat_armor", w: 1, minLevel: 6 },
        { id: "leather_armor_reinforced", w: 1, minLevel: 4 },
        { id: "scout_armor", w: 0.4, minLevel: 10 },
        { id: "riot_police_armor", w: 0.6, minLevel: 5 },
        { id: "metal_helmet", w: 1 },
        { id: "combat_helmet", w: 0.8, minLevel: 5 },
        { id: "army_helmet", w: 1 },
        { id: "riot_police_helmet", w: 0.5, minLevel: 5 },
      ]),
    ],
  });

  // ---------------------------------------------------------------
  // CONTAINERS
  // ---------------------------------------------------------------
  T("ammo_box", {
    rolls: [
      R(1, [1, 3], [{ cat: "ammo", w: 1, n: [6, 20] }]),
      R(0.25, 1, [
        { cat: "grenade", w: 3, n: [1, 2] },
        { cat: "mine", w: 1, n: [1, 1] },
      ]),
      R(0.08, 1, [{ cat: "weapon", w: 1 }]),
    ],
  });
  T("weapon_crate", {
    rolls: [
      R(0.8, 1, [{ cat: "weapon", w: 1, cond: [0.4, 0.9] }]),
      R(1, [1, 3], [{ cat: "ammo", w: 1, n: [8, 24] }]),
      R(0.35, 1, [{ cat: "grenade", w: 1, n: [1, 3] }]),
    ],
  });
  T("first_aid", {
    rolls: [
      R(
        0.85,
        [1, 2],
        [
          { id: "rally_tonic", w: 5 },
          { id: "prussian_blue", w: 2 },
          { id: "iodine_tabs", w: 2 },
          { id: "morphine_syrette", w: 1 },
          { id: "blood_pack", w: 1 },
        ],
      ),
      R(0.15, 1, [
        { id: "field_surgery_kit", w: 1 },
        { id: "rally_tonic_extra", w: 1, minLevel: 6 },
        { id: "clean_slate", w: 0.5 },
      ]),
      R(0.2, 1, [{ id: "surgical_tubing", w: 1 }]),
    ],
  });
  T("medical_cabinet", {
    rolls: [R(1, 1, [{ table: "first_aid" }]), R(0.4, 1, [{ table: "chems" }])],
  });
  T("field_surgery_kit", {
    rolls: [
      R(1, [2, 3], [{ table: "medical" }]),
      R(0.3, 1, [{ table: "chems" }]),
    ],
  });
  T("fridge", {
    rolls: [
      R(
        0.9,
        [1, 3],
        [
          { table: "food_oldworld", w: 2 },
          { table: "drinks", w: 3 },
        ],
      ),
      R(0.15, 1, [
        { id: "fizzo_cola_chilled", w: 2 },
        { id: "ox_milk", w: 1 },
        { id: "fizzo_blue", w: 0.4 },
      ]),
    ],
  });
  T("cooler", {
    rolls: [
      R(
        1,
        [1, 3],
        [
          { table: "drinks", w: 3 },
          { id: "fizzo_cola_chilled", w: 2 },
          { id: "beer", w: 2 },
        ],
      ),
      R(0.2, 1, [{ table: "food_oldworld" }]),
    ],
  });
  T("grocery_shelf", {
    rolls: [
      R(
        0.85,
        [1, 3],
        [
          { table: "food_oldworld", w: 4 },
          { table: "drinks", w: 1 },
          { id: "homeguard_cleanser", w: 0.5 },
        ],
      ),
    ],
  });
  T("desk", {
    rolls: [
      R(0.6, [1, 2], [{ table: "junk_office" }]),
      R(0.35, 1, [{ scrip: [3, 18] }]),
      R(0.12, 1, [
        { id: "scrap_metal", n: [1, 3] },
        { table: "chems" },
        { cat: "ammo", n: [4, 10] },
        { id: "rally_tonic" },
      ]),
      R(0.04, 1, [{ tag: "skill_book" }]),
    ],
  });
  T("file_cabinet", {
    rolls: [
      R(0.7, [1, 2], [{ table: "junk_office" }]),
      R(0.15, 1, [{ scrip: [2, 12] }, { id: "old_dollars", n: [1, 2] }]),
      R(0.03, 1, [{ tag: "skill_book" }]),
    ],
  });
  T("safe", {
    rolls: [
      R(1, 1, [{ scrip: [25, 90] }]),
      R(0.7, [1, 2], [{ table: "junk_valuable" }]),
      R(0.4, 1, [
        { table: "chems", w: 1 },
        { table: "medical", w: 1 },
        { cat: "ammo", w: 1, n: [10, 24] },
      ]),
      R(0.15, 1, [
        { cat: "weapon", w: 1, cond: [0.6, 1] },
        { tag: "skill_book", w: 1 },
      ]),
    ],
  });
  T("wall_safe", { rolls: [R(1, 1, [{ table: "safe" }])] });
  T("locker", {
    rolls: [
      R(0.6, 1, [
        { table: "apparel_common", w: 2 },
        { table: "hats", w: 1 },
      ]),
      R(0.35, 1, [{ cat: "ammo", n: [5, 14] }]),
      R(0.25, 1, [{ table: "junk_common" }]),
      R(0.15, 1, [{ id: "rally_tonic" }, { table: "chems" }]),
      R(0.08, 1, [{ table: "armor_random" }]),
    ],
  });
  T("cryo_locker", {
    rolls: [
      R(0.5, 1, [
        { id: "cryo_suit", w: 3 },
        { id: "cryo_tech_uniform", w: 1 },
        { id: "long_winter_guard_helmet", w: 0.5 },
      ]),
      R(
        0.6,
        [1, 2],
        [
          { table: "food_oldworld", w: 1 },
          { table: "junk_household", w: 1 },
          { id: "fizzo_cola", w: 1 },
        ],
      ),
      R(0.25, 1, [
        { id: "rally_tonic", w: 2 },
        { id: "scrap_metal", n: [1, 3], w: 2 },
        { id: "iodine_tabs", w: 1 },
      ]),
      R(0.2, 1, [{ scrip: [2, 10] }]),
    ],
  });
  T("footlocker", {
    rolls: [
      R(
        0.7,
        [1, 2],
        [
          { table: "junk_common", w: 2 },
          { table: "apparel_common", w: 1 },
          { table: "food_oldworld", w: 1 },
        ],
      ),
      R(0.4, 1, [{ cat: "ammo", n: [5, 15] }]),
      R(0.3, 1, [{ scrip: [5, 25] }]),
      R(0.15, 1, [{ table: "medical" }]),
      R(0.1, 1, [{ cat: "weapon" }, { table: "armor_random" }]),
    ],
  });
  T("toolbox", {
    rolls: [
      R(
        0.9,
        [1, 3],
        [
          { id: "scrap_metal", w: 3 },
          { id: "duct_tape", w: 2 },
          { id: "tuff_bond", w: 1.5 },
          { id: "gas_igniter", w: 1 },
          { id: "conductor", w: 1 },
          { id: "vacuum_tube", w: 1 },
          { id: "dry_cell", w: 0.6 },
          { id: "scrap_metal", w: 1, n: [1, 2] },
        ],
      ),
      R(0.1, 1, [{ id: "book_motor_manual" }]),
    ],
  });
  T("workbench", {
    rolls: [R(1, [1, 2], [{ table: "toolbox" }, { table: "electronics" }])],
  });
  T("dumpster", {
    rolls: [
      R(
        0.8,
        [1, 3],
        [
          { table: "junk_common", w: 4 },
          { table: "food_oldworld", w: 1 },
          { id: "dirty_water", w: 0.6 },
        ],
      ),
      R(0.15, 1, [{ scrip: [1, 6] }, { cat: "ammo", n: [3, 8] }]),
    ],
  });
  T("trash_can", {
    rolls: [
      R(
        0.6,
        [1, 2],
        [
          { table: "junk_common", w: 5 },
          { id: "saratoga_chips", w: 0.5 },
          { id: "bodega_pretzel", w: 0.5 },
        ],
      ),
      R(0.08, 1, [{ scrip: [1, 5] }]),
    ],
  });
  T("mailbox", {
    rolls: [
      R(0.6, 1, [
        { id: "old_dollars", w: 1 },
        { id: "stock_certificate", w: 1 },
        { id: "old_world_book", w: 1 },
        { id: "cigarettes", w: 0.5 },
      ]),
      R(0.14, 1, [
        { scrip: [2, 10] },
        { tag: "skill_book", w: 0.3 },
        { id: "old_world_book", w: 0.8 },
      ]),
    ],
  });
  T("mail_sack", { rolls: [R(1, [1, 3], [{ table: "mailbox" }])] });
  T("newspaper_box", {
    rolls: [R(0.3, 1, [{ scrip: [1, 4] }, { id: "old_dollars" }])],
  });
  T("fizzo_machine", {
    rolls: [
      R(
        1,
        [1, 4],
        [
          { id: "fizzo_cola", w: 8 },
          { id: "fizzo_cola_chilled", w: 2 },
          { id: "fizzo_lime", w: 1 },
        ],
      ),
      R(0.1, 1, [{ id: "fizzo_blue" }]),
      R(0.7, 1, [{ scrip: [3, 14] }]),
    ],
  });
  T("cash_register", {
    rolls: [
      R(1, 1, [{ scrip: [6, 30] }]),
      R(0.5, 1, [{ id: "old_dollars", n: [1, 4] }]),
    ],
  });
  T("scrip_stash", {
    rolls: [
      R(1, 1, [{ scrip: [30, 80] }]),
      R(0.3, 1, [{ id: "old_dollars", n: [1, 3] }]),
    ],
  });
  T("dresser", {
    rolls: [
      R(
        0.75,
        [1, 2],
        [
          { table: "apparel_common", w: 2 },
          { table: "hats", w: 1 },
          { table: "junk_household", w: 2 },
        ],
      ),
      R(0.2, 1, [{ scrip: [2, 15] }, { id: "scrap_metal", n: [1, 2] }]),
      R(0.08, 1, [{ table: "chems" }]),
    ],
  });
  T("cabinet", {
    rolls: [
      R(
        0.7,
        [1, 2],
        [
          { table: "junk_household", w: 3 },
          { table: "food_oldworld", w: 2 },
          { id: "homeguard_cleanser", w: 1 },
        ],
      ),
    ],
  });
  T("bookshelf", {
    rolls: [
      R(
        0.8,
        [1, 3],
        [
          { id: "old_world_book", w: 4 },
          { id: "ruined_book", w: 4 },
        ],
      ),
      R(0.08, 1, [{ tag: "skill_book" }]),
    ],
  });
  T("luggage", {
    rolls: [
      R(
        0.9,
        [1, 3],
        [
          { table: "apparel_common", w: 3 },
          { table: "hats", w: 1 },
          { table: "junk_household", w: 1 },
          { table: "junk_valuable", w: 0.6 },
        ],
      ),
      R(0.2, 1, [{ scrip: [4, 20] }]),
    ],
  });
  T("briefcase", {
    rolls: [
      R(
        1,
        [1, 2],
        [
          { table: "junk_office", w: 2 },
          { id: "old_dollars", n: [2, 5] },
          { id: "stock_certificate", n: [1, 3] },
        ],
      ),
      R(0.2, 1, [{ scrip: [5, 30] }]),
    ],
  });
  T("crate", {
    rolls: [
      R(
        0.8,
        [1, 2],
        [
          { table: "junk_common", w: 3 },
          { table: "food_oldworld", w: 2 },
          { id: "scrap_metal", w: 2 },
          { table: "drinks", w: 1 },
        ],
      ),
      R(0.2, 1, [{ cat: "ammo", n: [5, 12] }]),
    ],
  });
  T("raider_stash", {
    rolls: [
      R(1, [1, 2], [{ cat: "ammo", n: [8, 24] }]),
      R(0.7, [1, 2], [{ table: "chems" }]),
      R(0.8, 1, [{ scrip: [15, 60] }]),
      R(0.35, 1, [
        { cat: "weapon", skill: ["firearms", "melee"] },
        { cat: "grenade", n: [1, 2] },
      ]),
      R(0.3, 1, [{ table: "medical" }]),
      R(0.3, 1, [
        { id: "raider_spiked_leathers" },
        { id: "raider_duster" },
        { id: "raider_scrap_plate" },
        { id: "raider_chain_harness" },
      ]),
    ],
  });
  T("covenant_crate", {
    rolls: [
      R(1, [1, 3], [{ cat: "ammo", n: [10, 24] }]),
      R(
        0.6,
        [1, 2],
        [
          { id: "rally_tonic", w: 3 },
          { id: "prussian_blue", w: 2 },
          { id: "iodine_tabs", w: 2 },
          { id: "dry_cell", w: 1 },
        ],
      ),
      R(0.2, 1, [{ cat: "weapon", skill: "firearms" }, { id: "covenant_tag" }]),
    ],
  });
  T("continuity_crate", {
    rolls: [
      R(1, [1, 3], [{ cat: "ammo", n: [10, 30] }]),
      R(
        0.7,
        [1, 2],
        [
          { id: "rally_tonic", w: 3 },
          { id: "rally_tonic_extra", w: 1 },
          { id: "iodine_tabs", w: 1 },
          { id: "prussian_blue", w: 1 },
        ],
      ),
      R(0.25, 1, [
        { cat: "weapon", skill: "firearms", cond: [0.6, 1] },
        { cat: "grenade", n: [1, 3] },
      ]),
    ],
  });
  T("skeleton", {
    rolls: [
      R(0.5, 1, [{ table: "junk_common" }]),
      R(0.2, 1, [
        { scrip: [1, 12] },
        { id: "scrap_metal", n: [1, 2] },
        { cat: "ammo", n: [3, 8] },
      ]),
      R(0.06, 1, [
        { id: "rally_tonic" },
        { table: "chems" },
        { tag: "skill_book", w: 0.2 },
      ]),
    ],
  });
  T("corpse", { rolls: [R(1, 1, [{ table: "skeleton" }])] });
  T("duffle_bag", {
    rolls: [
      R(
        0.8,
        [1, 2],
        [
          { cat: "ammo", n: [6, 16] },
          { table: "food_oldworld" },
          { table: "drinks" },
          { table: "apparel_common", w: 0.6 },
        ],
      ),
      R(0.5, 1, [{ scrip: [3, 20] }]),
      R(0.25, 1, [
        { id: "rally_tonic" },
        { table: "chems" },
        { id: "scrap_metal", n: [1, 3] },
      ]),
    ],
  });
  T("generic", {
    rolls: [
      R(
        0.8,
        [1, 2],
        [
          { table: "junk_common", w: 3 },
          { table: "food_oldworld", w: 1 },
          { table: "drinks", w: 1 },
        ],
      ),
      R(0.35, 1, [{ scrip: [1, 10] }, { id: "scrap_metal", n: [1, 2] }]),
      R(0.1, 1, [{ cat: "ammo", n: [4, 10] }, { id: "rally_tonic" }]),
    ],
  });
  // aliases used by other modules
  const ALIAS = {
    trash: "trash_can",
    register: "cash_register",
    ammo: "ammo_box",
    medkit: "first_aid",
    medical_box: "first_aid",
    wall_locker: "locker",
    suitcase: "luggage",
    cabinet_kitchen: "cabinet",
    filing_cabinet: "file_cabinet",
    strongbox: "safe",
    weapons_locker: "weapon_crate",
    gun_case: "weapon_crate",
    maniacs: "maniac",
    brutes: "brute",
    robots: "robot",
    creatures: "creature",
    settlers: "settler",
    raiders: "raider",
    warden: "covenant_warden",
    human: "settler",
  };
  for (const a in ALIAS) T(a, { rolls: [R(1, 1, [{ table: ALIAS[a] }])] });

  // ---------------------------------------------------------------
  // ACTORS (corpse loot; worn armour/weapon are added separately)
  // ---------------------------------------------------------------
  T("raider", {
    rolls: [
      R(0.65, 1, [{ scrip: [3, 25] }]),
      R(0.75, 1, [{ cat: "ammo", n: [5, 16], forWeapons: true }]),
      R(0.3, 1, [{ table: "chems" }]),
      R(0.15, 1, [
        { id: "rally_tonic", w: 3 },
        { cat: "grenade", w: 1, n: [1, 1] },
      ]),
      R(0.35, 1, [
        { table: "junk_common" },
        { id: "raider_tags", w: 0.4 },
        { id: "beer", w: 0.6 },
        { id: "whiskey", w: 0.4 },
      ]),
      R(0.08, 1, [{ id: "scrap_metal", n: [1, 3] }, { id: "cigarettes" }]),
    ],
  });
  T("raider_boss", {
    rolls: [
      R(1, 1, [{ table: "raider" }]),
      R(1, 1, [{ scrip: [30, 90] }]),
      R(0.6, 1, [{ table: "chems" }]),
      R(0.5, 1, [{ id: "rally_tonic", n: [1, 2] }]),
      R(0.2, 1, [{ tag: "skill_book" }]),
    ],
  });
  T("brute", {
    rolls: [
      R(0.7, 1, [{ cat: "ammo", n: [6, 18], forWeapons: true }]),
      R(0.35, 1, [{ scrip: [2, 20] }]),
      R(0.2, 1, [
        { table: "junk_common" },
        { id: "brute_hound_meat", w: 0.4 },
        { id: "teddy_bear", w: 0.2 },
      ]),
      R(0.12, 1, [{ id: "rally_tonic" }, { cat: "grenade", n: [1, 2] }]),
    ],
  });
  T("colossus", {
    rolls: [
      R(1, [2, 3], [{ table: "brute" }]),
      R(1, 1, [{ scrip: [40, 120] }]),
      R(0.5, 1, [{ tag: "skill_book" }, { id: "rally_tonic_extra" }]),
    ],
  });
  T("maniac", {
    rolls: [
      R(0.18, 1, [{ scrip: [1, 8] }]),
      R(0.25, 1, [
        { table: "junk_common" },
        { id: "survivor_layers", w: 0.4 },
        { id: "cigarettes", w: 0.3 },
      ]),
      R(0.05, 1, [{ id: "scrap_metal" }, { id: "old_dollars" }]),
    ],
  });
  T("maniac_bruiser", {
    rolls: [
      R(1, 1, [{ table: "maniac" }]),
      R(0.5, 1, [
        { table: "junk_common" },
        { id: "old_dollars" },
        { id: "cigarettes" },
      ]),
      R(0.4, 1, [{ scrip: [5, 25] }]),
    ],
  });
  T("robot", {
    rolls: [
      R(0.7, 1, [
        { id: "scrap_electronics", w: 3 },
        { id: "vacuum_tube", w: 2 },
        { id: "conductor", w: 2 },
        { id: "scrap_metal", w: 3 },
      ]),
      R(0.35, 1, [
        { id: "dry_cell", w: 2 },
        { id: "relay_board", w: 1 },
      ]),
      R(0.3, 1, [{ cat: "ammo", n: [8, 20] }]),
    ],
  });
  T("patrolman", {
    rolls: [R(1, 1, [{ table: "robot" }]), R(0.4, 1, [{ id: "dry_cell" }])],
  });
  T("valet", {
    rolls: [
      R(1, 1, [{ table: "robot" }]),
      R(0.4, 1, [{ id: "gas_igniter" }, { id: "relay_board" }]),
    ],
  });
  T("sky_eye", {
    rolls: [
      R(
        1,
        [1, 2],
        [
          { id: "scrap_electronics", w: 2 },
          { id: "relay_board", w: 1 },
          { id: "vacuum_tube", w: 1 },
        ],
      ),
      R(0.5, 1, [{ id: "dry_cell" }]),
    ],
  });
  T("bulwark", {
    rolls: [
      R(1, [2, 3], [{ table: "robot" }]),
      R(0.8, 1, [{ id: "dry_cell", n: [1, 2] }]),
    ],
  });
  T("continuity", {
    rolls: [
      R(0.9, [1, 2], [{ cat: "ammo", n: [10, 30], forWeapons: true }]),
      R(0.5, 1, [
        { id: "rally_tonic", w: 3 },
        { id: "rally_tonic_extra", w: 1 },
        { id: "morphine_syrette", w: 1 },
      ]),
      R(0.4, 1, [{ scrip: [10, 40] }]),
      R(0.15, 1, [{ cat: "grenade", n: [1, 2] }]),
    ],
  });
  T("continuity_soldier", { rolls: [R(1, 1, [{ table: "continuity" }])] });
  T("covenant", {
    rolls: [
      R(0.9, [1, 2], [{ cat: "ammo", n: [10, 24], forWeapons: true }]),
      R(0.5, 1, [
        { id: "rally_tonic", w: 3 },
        { id: "prussian_blue", w: 1 },
        { id: "iodine_tabs", w: 1 },
      ]),
      R(0.6, 1, [{ id: "covenant_tag" }]),
      R(0.3, 1, [{ scrip: [5, 25] }]),
    ],
  });
  T("covenant_warden", { rolls: [R(1, 1, [{ table: "covenant" }])] });
  T("settler", {
    rolls: [
      R(0.6, 1, [{ scrip: [2, 18] }]),
      R(0.5, 1, [
        { table: "junk_common" },
        { table: "food_oldworld" },
        { table: "drinks" },
      ]),
      R(0.15, 1, [{ id: "rally_tonic" }, { cat: "ammo", n: [4, 10] }]),
    ],
  });
  T("merchant", {
    rolls: [
      R(1, 1, [{ scrip: [40, 150] }]),
      R(
        1,
        [2, 4],
        [
          { table: "medical" },
          { table: "food_oldworld" },
          { cat: "ammo" },
          { table: "junk_valuable" },
        ],
      ),
    ],
  });
  T("trade_wagon", {
    rolls: [R(1, 1, [{ table: "merchant" }]), R(0.6, 1, [{ cat: "weapon" }])],
  });

  // creatures
  T("giant_roach", { rolls: [R(0.6, 1, [{ id: "roach_meat" }])] });
  T("burrow_rat", { rolls: [R(0.75, 1, [{ id: "burrow_rat_meat" }])] });
  T("gasfly", { rolls: [R(0.6, 1, [{ id: "gasfly_meat" }])] });
  T("shellback", {
    rolls: [R(0.85, 1, [{ id: "shellback_meat", n: [1, 2] }])],
  });
  T("shellback_matriarch", {
    rolls: [
      R(1, 1, [{ id: "shellback_meat", n: [3, 5] }]),
      R(0.6, 1, [{ scrip: [20, 60] }, { tag: "skill_book" }]),
    ],
  });
  T("ripjaw", {
    rolls: [
      R(1, 1, [{ id: "ripjaw_meat" }]),
      R(0.2, 1, [{ id: "ripjaw_steak" }]),
    ],
  });
  T("dog", { rolls: [R(0.6, 1, [{ id: "dog_meat" }])] });
  T("brute_hound", { rolls: [R(0.6, 1, [{ id: "brute_hound_meat" }])] });
  T("creature", { rolls: [R(0.3, 1, [{ table: "junk_common" }])] });

  // ---------------------------------------------------------------
  // MERCHANT STOCK (quests may use these for actor.merchant.stock)
  // ---------------------------------------------------------------
  T("merchant_general", {
    rolls: [
      R(
        1,
        [4, 7],
        [
          { table: "food_oldworld", w: 2 },
          { table: "drinks", w: 2 },
          { table: "medical", w: 2 },
          { table: "chems", w: 1 },
          { table: "apparel_common", w: 1 },
          { table: "hats", w: 1 },
          { table: "electronics", w: 1 },
        ],
      ),
      R(1, [2, 4], [{ cat: "ammo", n: [15, 40] }]),
      R(0.8, [1, 2], [{ cat: "weapon", cond: [0.5, 0.9] }]),
      R(0.6, 1, [{ table: "armor_random" }]),
      R(0.3, 1, [{ tag: "skill_book" }]),
      R(1, 1, [{ id: "duct_tape", n: [1, 3] }]),
    ],
  });
  T("merchant_doctor", {
    rolls: [
      R(1, 1, [{ id: "rally_tonic", n: [4, 8] }]),
      R(1, 1, [{ id: "prussian_blue", n: [2, 5] }]),
      R(1, 1, [{ id: "iodine_tabs", n: [2, 5] }]),
      R(0.7, 1, [{ id: "field_surgery_kit", n: [1, 2] }]),
      R(0.5, 1, [{ id: "rally_tonic_extra", n: [1, 2] }]),
      R(0.8, [1, 3], [{ table: "chems" }]),
      R(0.5, 1, [{ id: "clean_slate", n: [1, 2] }]),
      R(0.6, 1, [{ id: "purified_water", n: [2, 5] }]),
    ],
  });
  T("merchant_arms", {
    rolls: [
      R(1, [2, 4], [{ cat: "weapon", cond: [0.6, 1] }]),
      R(1, [3, 6], [{ cat: "ammo", n: [20, 60] }]),
      R(0.8, [1, 2], [{ cat: "grenade", n: [2, 5] }]),
      R(0.7, [1, 2], [{ table: "armor_random" }]),
    ],
  });
  T("merchant_tech", {
    rolls: [
      R(1, [2, 4], [{ table: "electronics" }]),
      R(
        0.9,
        [1, 2],
        [
          { id: "ammo_dry_cell", w: 3, n: [3, 8] },
          { id: "ammo_gyrojet", w: 2, n: [12, 30], minLevel: 6 },
          { id: "ammo_rivet", w: 1, n: [12, 36] },
        ],
      ),
      R(0.45, 1, [{ cat: "weapon", skill: "firearms", cond: [0.55, 0.95] }]),
      R(0.35, 1, [
        { id: "shade_field", w: 1 },
        { id: "dry_cell", w: 2, n: [1, 3] },
      ]),
      R(0.1, 1, [
        { id: "book_popular_circuits", w: 1 },
        { id: "book_radio_handbook", w: 1 },
      ]),
    ],
  });
  T("merchant_food", {
    rolls: [
      R(
        1,
        [4, 8],
        [
          { table: "food_oldworld", w: 2 },
          { table: "drinks", w: 2 },
          { id: "shellback_cakes", w: 1 },
          { id: "ox_steak", w: 1 },
          { id: "coney_dog", w: 1 },
          { id: "shellback_chowder", w: 1 },
          { id: "gnarlberry", w: 1 },
          { id: "purified_water", w: 1 },
        ],
      ),
    ],
  });
})();
