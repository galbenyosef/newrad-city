// play-inline-475 02 — table
// Lines 367-712 of readable/play-inline-475.pretty.js (statement-aligned).
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
