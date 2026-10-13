// play-inline-475 01 — rolls
// Lines 22-366 of readable/play-inline-475.pretty.js (statement-aligned).
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
