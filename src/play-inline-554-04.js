// play-inline-554 04 — flag
// Lines 804-1053 of readable/play-inline-554.pretty.js (statement-aligned).
  L.hook("spawn", function () {
    // ---- The Iron Covenant, Rockefeller Center ----
    L.spawnNPC({
      id: "cov_stroud",
      type: "human",
      name: "Lancer-Commander Stroud",
      outfit: SH.covRig,
      gender: "m",
      faction: SH.covFaction,
      ai: "guard",
      home: "here",
      homeR: 3,
      at: {
        site: "rockefeller",
        anchors: ["commander", "boss", "leader", "plaza"],
        fallback: { x: ROCK.x, z: ROCK.z + 32 },
      },
      dialogue: "dlg_cov_stroud",
      essential: true,
      weapon: [SH.gyroCarbine],
      level: 14,
      hp: 400,
      barks: ["Hold fast.", "Eyes on the rooftops.", "Iron keeps."],
      voice: "m_gruff",
    });
    L.spawnNPC({
      id: "cov_wexler",
      type: "human",
      name: "Archivist Ingrid Wexler",
      outfit: "lab_coat",
      gender: "f",
      faction: SH.covFaction,
      ai: "guard",
      home: "here",
      homeR: 3,
      at: {
        site: "rockefeller",
        anchors: ["archivist", "merchant1", "rink"],
        fallback: { x: ROCK.x - 10, z: ROCK.z + 28 },
      },
      dialogue: "dlg_cov_wexler",
      essential: true,
      weapon: [SH.gyroPistol],
      level: 6,
      barks: [
        "Knowledge is the only armour that never rusts.",
        "Please don't touch that. Or that.",
      ],
      hair: "bun",
    });
    L.spawnNPC({
      id: "cov_reyes",
      type: "human",
      name: "Lancer Tobias Reyes",
      outfit: "combat_armor",
      gender: "m",
      faction: SH.covFaction,
      ai: "merchant",
      home: "here",
      at: {
        site: "rockefeller",
        anchors: ["quartermaster", "exo_rig", "workbench"],
        fallback: { x: ROCK.x + 12, z: ROCK.z + 30 },
      },
      dialogue: "dlg_cov_reyes",
      essential: true, // Hostile Takeover's turn-in
      weapon: [SH.gyroCarbine, "assault_rifle"],
      level: 9,
      merchant: { scrip: 700, stock: STOCK_COV, restock: 3 },
      barks: [
        "Requisitions. Make it quick.",
        "You break it, the Covenant bills you.",
      ],
      skinTone: 0.55,
    });

    // ---- The Continuity, UN Plaza ----
    if (!L.flag("hale_left")) {
      L.spawnNPC({
        id: "con_hale",
        type: "human",
        name: "Lieutenant Vesper Hale",
        outfit: SH.conRig,
        gender: "f",
        faction: SH.conFaction,
        ai: "guard",
        home: "here",
        homeR: 3,
        hostile: !!L.flag("con_hostile"),
        essential: !L.flag("con_hostile"),
        at: {
          site: "un_hq",
          anchors: ["recruiter", "entrance", "gate", "plaza"],
          fallback: { x: 286, z: -318 },
        },
        dialogue: "dlg_con_hale",
        weapon: [SH.gyroCarbine],
        level: 14,
        hp: 350,
        barks: [
          "God bless America.",
          "Stay behind the line, civilian.",
          "Papers, please. Kidding. Mostly.",
        ],
        voice: "f_stern",
      });
    }
    // Specialist Ortiz's blotter note beside the command teletype (the non-violent way in).
    {
      const t = L.anchor(
        "un_hq",
        ["terminal", "command", "continuity_terminal"],
        { x: UN.x - 22, z: UN.z + 12 },
      );
      if (t && !L.has("q_note_ortiz_blotter"))
        L.pickup("ortiz_blotter", "q_note_ortiz_blotter", 1, {
          x: t.x + 1.1,
          y: t.y,
          z: t.z + 0.4,
        });
    }

    // ---- KONG, Empire State Building ----
    {
      const hasCore = !L.flag("kong_resolution");
      L.spawnNPC({
        id: "esb_kong",
        type: SH.bruteKing,
        name: "KONG",
        faction: SH.bruteFaction,
        ai: "guard",
        home: "here",
        homeR: 6,
        hostile: !!L.flag("kong_hostile"),
        level: 14,
        hp: 900,
        damage: 45,
        aggroRange: 14,
        at: {
          site: "empire_state",
          anchors: ["observation_deck", "rooftop", "boss", "lobby_boss"],
          fallback: { x: ESB.x, z: ESB.z + 26 },
        },
        dialogue: "dlg_esb_kong",
        inventory: hasCore
          ? [
              ["q_knickerbocker_core", 1],
              ["q_note_kong_manifesto", 1],
            ]
          : [["q_note_kong_manifesto", 1]],
        barks: L.flag("kong_friend")
          ? ["KONG IS HAPPY.", "QUEEN FAY IS BEAUTIFUL TODAY.", "SMALL FRIEND!"]
          : [
              "KONG IS KING!",
              "THE EMPIRE IS TALLEST!",
              "SMALL HUMANS GO SQUISH.",
            ],
        voice: "brute",
      });
    }

    // ---- A captive of the Brutes: Pete Ruiz, Hattie Caldwell's missing driver ----
    if (!L.flag("pete_rescued")) {
      L.spawnNPC({
        id: "esb_pete",
        type: "human",
        name: "Pete Ruiz (Captive)",
        outfit: "drifter",
        gender: "m",
        faction: "settlers",
        ai: "static",
        hostile: false,
        at: {
          site: "empire_state",
          anchors: ["captive", "captive2"],
          fallback: { x: ESB.x + 32, z: ESB.z - 8 },
        },
        dialogue: "dlg_esb_pete",
        skinTone: 0.55,
        barks: [
          "Psst! Hey! Over here!",
          'Please... they\'re talking about "lunch" again.',
        ],
      });
    }

    // ---- Sterling's mannequin "Fay" (for Kong) ----
    if (!L.flag("kong_resolution")) {
      const fay = L.anchor(
        "sterlings",
        ["mannequin", "display", "loot1", "loot", "entrance"],
        { x: 0, z: -50 },
      );
      if (fay) L.pickup("fay", "q_fay_mannequin", 1, fay);
    }

    // ---- NYPL books ----
    for (const b of BOOKS) {
      if (L.has(b.id) || L.flag("overdue_done")) continue;
      const p = L.anchor("nypl", b.anchors, {
        x: NYPL.x + b.off.x,
        z: NYPL.z + b.off.z,
      });
      if (p) L.pickup(b.key, b.id, 1, p);
    }

    // ---- The Exchange: Bear Market Betty + ledger ----
    {
      L.spawnNPC({
        id: "ws_betty",
        type: "human",
        name: "Bear Market Betty",
        outfit: "raider_heavy",
        gender: "f",
        faction: "raiders",
        ai: "guard",
        home: "here",
        homeR: 5,
        hostile: true,
        level: 10,
        hp: 260,
        weapon: ["closing_bell", "magnum_44"],
        inventory: [
          ["scrip", 180],
          ["closing_bell", 1],
        ],
        // on the trading floor in front of her throne (the 'boss' anchor sits ON the throne, inside its collider)
        at: {
          site: "nyse",
          anchors: ["trading_floor", "boss", "bell"],
          fallback: { x: 0, z: 850 },
        },
        barks: [
          "Sell! SELL!",
          "The market's crashing, and so are you!",
          "Ring the bell, boys!",
        ],
      });
    }
    const led = L.anchor("nyse", ["ledger", "loot", "desk", "loot1"], {
      x: 8,
      z: 848,
    });
    if (led && !L.flag("sq_exchange_done"))
      L.pickup("betty_ledger", "q_note_betty_ledger", 1, led);
  });

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
