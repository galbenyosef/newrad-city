// play-inline-475 03 — table
// Lines 713-1032 of readable/play-inline-475.pretty.js (statement-aligned).
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
