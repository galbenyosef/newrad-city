// play-inline-577 03 — spot
// Lines 444-795 of readable/play-inline-577.pretty.js (statement-aligned).
  const FRANK_STOCK_M = [
    ["coney_dog", 6],
    ["bodega_pretzel", 6],
    [BAGEL, 5],
    [CHOWDER, 2],
    ["prairie_root_beer", 2],
  ];
  /**
   * A vendor's menu. Once the rival is gone (food poisoning) or they merged, each cart sells both menus — so the
   * guide's Chapter II ("three different delicacies") can always be bought, whichever way the feud ended.
   */
  function frankStock(who) {
    const own = who === "iggy" ? FRANK_STOCK_I : FRANK_STOCK_M,
      other = who === "iggy" ? FRANK_STOCK_M : FRANK_STOCK_I;
    const rivalGone = QX.flag(
      who === "iggy" ? "franks_mort_gone" : "franks_iggy_gone",
    );
    const out = own.map((e) => e.slice());
    if (rivalGone || QX.reached("qx_franks", "done_merge"))
      for (const e of other)
        if (!out.some((o) => o[0] === e[0])) out.push(e.slice());
    return out;
  }
  /** Live update of a vendor's shelf (rpg's merchant sweep folds quest additions into the base list at the next reset). */
  function absorbMenu(who) {
    const a = QX.npc(who === "iggy" ? "qx_iggy" : "qx_mort");
    if (!a || !a.merchant || !Array.isArray(a.merchant.stock)) return;
    for (const e of frankStock(who))
      if (QX.itemExists(e[0]) && !a.merchant.stock.some((o) => o[0] === e[0]))
        a.merchant.stock.push(e.slice());
  }
  QX.hook("spawn", function () {
    const cartVendor = (c) => ({ x: c.x, z: c.z - 1.6 });
    // ---- Iggy & Mort ----
    if (!QX.flag("franks_iggy_gone"))
      QX.spawnNPC({
        id: "qx_iggy",
        type: "human",
        name: "Iggy Bellini",
        outfit: "merchant",
        gender: "m",
        hair: "slick",
        hat: "cap",
        skinTone: "olive",
        faction: "settlers",
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        essential: true,
        level: 3,
        at: { fallback: cartVendor(SPOT.iggyCart) },
        lookAt: { x: SPOT.iggyCart.x, z: SPOT.iggyCart.z + 6 },
        dialogue: "qx_dlg_iggy",
        merchant: { scrip: 160, stock: frankStock("iggy"), restock: 2 },
        voice: "merchant",
      });
    if (!QX.flag("franks_mort_gone"))
      QX.spawnNPC({
        id: "qx_mort",
        type: "human",
        name: "Mort Feldstein",
        outfit: "merchant",
        gender: "m",
        hair: "balding",
        hat: "fedora",
        skinTone: "fair",
        faction: "settlers",
        ai: "merchant",
        home: "here",
        homeR: 1.2,
        essential: true,
        level: 3,
        at: { fallback: cartVendor(SPOT.mortCart) },
        lookAt: { x: SPOT.mortCart.x, z: SPOT.mortCart.z + 6 },
        dialogue: "qx_dlg_mort",
        merchant: { scrip: 160, stock: frankStock("mort"), restock: 2 },
        voice: "merchant",
      });
    setFrankBarks();

    // ---- Scoop ----
    QX.spawnNPC({
      id: "qx_scoop",
      type: "human",
      name: "Scoop Moretti",
      outfit: "drifter",
      gender: "m",
      hair: "short",
      hat: "cap",
      skinTone: "tan",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 2,
      at: { fallback: SPOT.scoop },
      lookAt: { x: SPOT.scoop.x - 8, z: SPOT.scoop.z },
      dialogue: "qx_dlg_scoop",
      barks: scoopBarks(),
    });

    // ---- Harold Pennington ----
    const penn = QX.flag("penn_moved")
      ? { site: "grand_central", anchors: ["lobby_bench"], fallback: GC_PENN }
      : { fallback: { x: SPOT.busStop.x + 0.2, z: SPOT.busStop.z - 1.2 } };
    QX.spawnNPC({
      id: "qx_pennington",
      type: "human",
      name: "Harold Pennington",
      outfit: "merchant",
      gender: "m",
      hat: "fedora",
      hair: "balding",
      faction: TOWN_FACTION,
      ai: "static",
      essential: true,
      level: 3,
      at: penn,
      lookAt: QX.flag("penn_moved")
        ? { x: 240, z: -226 }
        : { x: SPOT.busStop.x + 10, z: SPOT.busStop.z - 3 },
      dialogue: "qx_dlg_penn",
      barks: QX.flag("penn_moved")
        ? [
            "Lovely ceiling. Lovely.",
            "I used to catch the 9:47. Now I catch my breath.",
            "No bus. No boss. No rush.",
          ]
        : [
            "Any minute now.",
            "Eight forty-seven. Eight forty-seven...",
            "The M42 has never once been this late.",
            "I'll be docked a half-day for this.",
          ],
    });

    // ---- MUNI-7 ----
    const good = QX.done("qx_parking") && QX.reached("qx_parking", "done_good");
    QX.spawnNPC({
      id: "qx_muni7",
      type: PATROLMAN_TYPE,
      variant: "police",
      name: "MUNI-7",
      faction: good ? "settlers" : "robots",
      hostile: QX.stage("qx_parking") === "scrap" ? true : false,
      ai: good ? "patrol" : "guard",
      home: "here",
      homeR: good ? 14 : 5,
      patrol: good
        ? [
            { x: SPOT.muni.x, z: SPOT.muni.z - 20 },
            { x: SPOT.muni.x, z: SPOT.muni.z + 60 },
          ]
        : undefined,
      level: 6,
      noRespawn: true,
      at: { fallback: SPOT.muni },
      lookAt: { x: SPOT.muni.x - 6, z: SPOT.muni.z },
      dialogue: "qx_dlg_muni",
      voice: PATROLMAN_VOICE,
      inventory: [
        ["qx_impound_key", 1],
        ["dry_cell", 1],
        ["scrap_electronics", 1],
      ],
      barks: good
        ? [
            "CITIZEN. YOU ARE PROTECTED.",
            "HAVE A SAFE DAY.",
            "NO ONE WILL BE FINED TODAY.",
          ]
        : QX.reached("qx_parking", "done_evil")
          ? [
              "FINE ISSUED. FINE ISSUED. FINE ISSUED.",
              "ALL COLLECTIONS FORWARDED TO THE BENEFICIARY.",
              "PAY THE BENEFICIARY.",
            ]
          : [
              "NO STANDING. NO STOPPING. NO SURVIVING WITHOUT A PERMIT.",
              "THIS VEHICLE HAS BEEN PARKED FOR 8,036 DAYS.",
              "CITATION ISSUED.",
              "MOVE ALONG, CITIZEN.",
            ],
    });
    const muni = QX.npc("qx_muni7");
    if (muni) muni[KILL_STANDING] = 0; // no standing loss for scrapping a ticket robot

    // ---- Edna & Mister Buttons ----
    QX.spawnNPC({
      id: "qx_edna",
      type: "human",
      name: "Edna Vukovich",
      outfit: "settler",
      gender: "f",
      hair: "bun",
      hairColor: 0xd8d4cc,
      skinTone: "pale",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 2,
      at: { fallback: SPOT.edna },
      lookAt: { x: SPOT.edna.x + 8, z: SPOT.edna.z + 2 },
      dialogue: "qx_dlg_edna",
      barks:
        QX.done("qx_buttons") && !QX.reached("qx_buttons", "sold")
          ? ["Who's a good boy? Buttons is a good boy.", "Cookie, dear?"]
          : [
              "Buttons? Mister Buttons?",
              "Here, Buttons! Mama has a beetle!",
              "He always comes back. He always comes back.",
            ],
    });
    if (!QX.flag("buttons_sold")) {
      const home = QX.flag("buttons_home");
      QX.spawnNPC({
        id: "qx_buttons",
        type: BURROW_RAT_TYPE,
        name: "Mister Buttons",
        faction: "settlers",
        hostile: false,
        essential: true,
        level: 1,
        noRespawn: true,
        ai: home ? "wander" : "static",
        home: "here",
        homeR: home ? 3 : 1,
        at: {
          fallback: home
            ? { x: SPOT.edna.x + 1.5, z: SPOT.edna.z + 1 }
            : SPOT.buttons,
        },
        dialogue: "qx_dlg_buttons",
        barks: ["*squeak*", "*snuffle snuffle*", "*chitter*"],
      });
      const b = QX.npc("qx_buttons");
      if (b) {
        b[KILL_STANDING] = -100;
        if (QX.flag("buttons_follow") && !home && b.follow)
          QX.safe("follow", () => b.follow("player"));
      }
    }

    // ---- Bartholomew Bixby ----
    QX.spawnNPC({
      id: "qx_bixby",
      type: "human",
      name: "Bartholomew Bixby",
      outfit: "dj",
      gender: "m",
      hair: "long",
      faction: TOWN_FACTION,
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 3,
      at: { fallback: stageFront() },
      lookAt: { x: SPOT.stage.x, z: SPOT.stage.z + 12 },
      dialogue: "qx_dlg_bixby",
      barks: QX.done("qx_bixby")
        ? [
            "Encore? ENCORE? Oh, you're too kind.",
            "Alas, poor Yorick. He owed me money.",
            "The rest is static.",
          ]
        : QX.failed("qx_bixby")
          ? ["...", "The show is cancelled.", "Go away."]
          : [
              "To glow, or not to glow...",
              "Has anyone seen a page of iambic pentameter? About yea big?",
              "The wind! The WIND has stolen my second act!",
            ],
    });

    // ---- quest pickups ----
    if (QX.active("qx_bixby") && QX.stage("qx_bixby") === "pages") spawnPages();
    if (QX.stage("qx_commute") === "find") spawnTimetable();
  });

  function stageFront() {
    // in front of the stage (the audience side is south, +Z)
    return { x: SPOT.stage.x + 0.8, z: SPOT.stage.z + 2.1 };
  }
  function setFrankBarks() {
    const merged = QX.reached("qx_franks", "done_merge");
    const i = QX.npc("qx_iggy"),
      m = QX.npc("qx_mort");
    if (i)
      i.barks = merged
        ? [
            "Iggy AND Mort's! Get 'em while they're... warm-ish!",
            "Mort, no cinnamon. MORT.",
            "Two carts, one sauce, zero regrets!",
          ]
        : [
            "Genuine Coney Island franks! Accept no radiation-free substitutes!",
            "Don't buy from HIM. He puts cinnamon in the onions!",
            "Iggy's! Since before YOU were born, pal!",
            "Forever Franks! So good they'll outlive you!",
          ];
    if (m)
      m.barks = merged
        ? [
            "Iggy and Mort's. The cinnamon is OPTIONAL.",
            "Pretzels! Bagels! A partnership!",
            "Get your dogs, get your dogs!",
          ]
        : [
            "Kosher-style! Style! It's a STYLE!",
            "Mort's dogs: now eighty percent dog!",
            "Iggy's mustard is just yellow paint. I've SEEN it.",
          ];
  }
  function scoopBarks() {
    const b = [
      "EXTRA! EXTRA! Read all about it!",
      "Clarion! Two Scrip! Get your Clarion!",
    ];
    if (QX.qflag && QX.qflag("kong_dead"))
      b.push("EXTRA! KONG IS DEAD! Empire State under new management!");
    if (QX.qflag && QX.qflag("kong_friend"))
      b.push("EXTRA! BRUTE KING FINDS LOVE! Mannequin says yes!");
    if (QX.flag("photo_chrysler"))
      b.push("EXTRA! Thawed sleeper photographs Chrysler, survives!");
    if (QX.reached("qx_franks", "done_merge"))
      b.push("EXTRA! HOT DOG PEACE ACCORD SIGNED AT GRAND CENTRAL!");
    if (
      QX.reached("qx_franks", "done_iggy") ||
      QX.reached("qx_franks", "done_mort")
    )
      b.push("EXTRA! FOOD POISONING AT GRAND CENTRAL! Foul play suspected!");
    if (QX.done("qx_bell"))
      b.push("EXTRA! CONVOY MASTER FREED FROM THE EXCHANGE!");
    if (QX.done("qx_c4"))
      b.push("EXTRA! FROZEN FEDERAL BASEMENT FOUND UNDER BATTERY PARK!");
    if (QX.done("qx_bixby") && QX.flag("bix_costar"))
      b.push('EXTRA! BIXBY\'S HAMLET: "A TRIUMPH," SAYS BIXBY!');
    return b;
  }
  QX.scoopBarks = () => {
    const a = QX.npc("qx_scoop");
    if (a) a.barks = scoopBarks();
  };
  G.events.on("questCompleted", () => QX.scoopBarks());

  // ==================================================================
  // WORLD SET DRESSING (static)
  // ==================================================================
