// play-inline-230 04 — cov
// Lines 527-742 of readable/play-inline-230.pretty.js (statement-aligned).
  function spawnRoofDrone() {
    const W = LI.rockWorld;
    if (!W || Q.flag("li_rock_drone_done")) return;
    const a = LI.spawnNPC(
      {
        id: "li_rock_skyeye",
        type: "sky_eye",
        name: "Continuity Sky-Eye Drone",
        faction: "continuity",
        hostile: true,
        level: 6,
        ai: "guard",
        homeR: 6,
        noRespawn: true,
        onDeath: () => Q.set("li_rock_drone_done"),
      },
      W.anchors.rooftop.clone().setY(W.anchors.rooftop.y + 1.5),
    );
    if (a) a.hover = true;
  }

  // ---------- NPCs ----------
  const STOCK_BOOKS = [
    ["book_popular_circuits", 1],
    ["book_motor_manual", 1],
    ["book_radio_handbook", 1],
    ["rally_tonic", 3],
    ["prussian_blue", 2],
    ["purified_water", 4],
    ["old_world_book", 3],
  ];
  const STOCK_FERRO = [
    ["ammo_gyrojet", 80],
    ["ammo_308", 100],
    ["ammo_556", 120],
    ["gyrojet_pistol", 1],
    ["gyrojet_carbine", 1],
    ["belt_fed_mg", 1],
    ["combat_armor", 1],
    ["combat_helmet", 1],
    ["frag_grenade", 6],
    ["dry_cell", 2],
    ["scrap_electronics", 4],
    ["rally_tonic", 4],
  ];
  const STOCK_PELL = [
    ["ox_steak", 3],
    ["shellback_cakes", 3],
    ["golden_plain_jerky", 5],
    ["franks_and_beans", 4],
    ["purified_water", 6],
    ["fizzo_cola", 5],
    ["beer", 4],
    ["cinnamon_bun", 2],
  ];
  LI.spawnFns.push(function () {
    const C = LI.rock;
    if (!C) return;
    const A = C.anchors;
    const cov = (o, at) =>
      LI.spawnNPC(
        Object.assign(
          {
            type: "human",
            faction: "covenant",
            ai: "guard",
            homeR: 2,
            voice: "covenant",
          },
          o,
        ),
        at,
      );
    cov(
      {
        id: "li_cov_marsh",
        name: "Archivist Ottoline Pryor",
        outfit: "lab_coat",
        gender: "f",
        ai: "merchant",
        essential: true,
        dialogue: "dlg_li_marsh",
        level: 8,
        weapon: "gyrojet_pistol",
        hair: "bun",
        skinTone: 0.3,
        merchant: { scrip: 600, stock: STOCK_BOOKS, restock: 3 },
        barks: [
          "Shh.",
          "That goes back on the shelf you took it from.",
          "Knowledge keeps. People don't.",
        ],
      },
      A.marsh,
    );
    cov(
      {
        id: "li_cov_dalca",
        name: "Lancer Imre Dalca",
        outfit: "combat_armor",
        gender: "m",
        essential: true,
        dialogue: "dlg_li_dalca",
        level: 12,
        weapon: "gyrojet_carbine",
        skinTone: 0.45,
        barks: [
          "The map is not the territory. The map is, however, on my table.",
          "Eyes on the island.",
        ],
      },
      A.dalca,
    );
    cov(
      {
        id: "li_cov_ferro",
        name: "Lancer Ada Ferro",
        outfit: "combat_armor",
        gender: "f",
        ai: "merchant",
        essential: true,
        dialogue: "dlg_li_ferro",
        level: 10,
        weapon: "gyrojet_carbine",
        skinTone: 0.7,
        merchant: { scrip: 800, stock: STOCK_FERRO, restock: 3 },
        barks: [
          "Don't lean on the gantry.",
          "Rig batteries don't grow on trees. I checked.",
        ],
      },
      A.ferro,
    );
    cov(
      {
        id: "li_cov_pell",
        name: "Acolyte Quill",
        outfit: "settler",
        gender: "m",
        ai: "merchant",
        dialogue: "dlg_li_pell",
        level: 3,
        weapon: "combat_knife",
        skinTone: 0.5,
        merchant: { scrip: 250, stock: STOCK_PELL, restock: 2 },
        barks: ["Soup's on! Allegedly.", "Best view in Manhattan. Worst stew."],
      },
      A.cook,
    );
    cov(
      {
        id: "li_cov_harrow",
        name: "Lancer Hargrove",
        outfit: "covenant_exo_rig",
        gender: "m",
        level: 12,
        weapon: "gyrojet_carbine",
        homeR: 1.5,
        barks: [
          "Rockefeller Center. Iron Covenant ground. State your business.",
          "Iron keeps.",
          "Keep your weapon holstered on Covenant ground.",
        ],
      },
      A.npc1,
    );
    cov(
      {
        id: "li_cov_oyelaran",
        name: "Lancer Oyelaran",
        outfit: "covenant_exo_rig",
        gender: "f",
        level: 12,
        weapon: "gyrojet_carbine",
        homeR: 1.5,
        barks: [
          "Eyes front, Acolyte.",
          "The plaza's quiet. I hate it when the plaza's quiet.",
        ],
      },
      A.npc2,
    );
    cov(
      {
        id: "li_cov_acolyte",
        name: "Acolyte Moss",
        outfit: "settler",
        gender: "f",
        level: 3,
        weapon: "gyrojet_pistol",
        homeR: 1.2,
        barks: [
          "...clean the lens, check the cell, clean the lens...",
          "Lancer Ferro counts every round. EVERY round.",
        ],
      },
      A.acolyte,
    );
    cov(
      {
        id: "li_cov_mess",
        name: "Lancer Tamsin Roarke",
        outfit: "combat_armor",
        gender: "f",
        level: 9,
        weapon: "gyrojet_carbine",
        homeR: 1.0,
        barks: [
          "Quill, this is not stew. This is a crime scene.",
          "Best view in the world, and I'm looking at a bowl.",
        ],
      },
      A.lancer_mess1,
    );
    if (Q.stage(QID) === "climb") spawnRoofDrone();
  });
