/* src/quests_extra/20_misc.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS_EXTRA — 20: STREET / MISC QUESTS
 *   qx_franks   "A Frank Exchange of Views"  Iggy vs. Mort, hot-dog carts at Grand Central
 *               (sabotage either one / broker a merger by Persuasion, Trade or Senses)
 *   qx_extra    "Extra! Extra!"               Scoop the newsie — deliver 3 Clarions to his
 *               subscribers (Pennington, Edna, MUNI-7); keep or hand over the dues
 *   qx_commute  "Last Stop"                   Harold Pennington, stalled commuter, waiting for
 *               the 9:47 Sunday M42 since 1967 (truth by Persuasion / proof from the bus wreck / lie)
 *   qx_parking  "No Standing Anytime"         MUNI-7, parking-enforcement Patrolman robot on 5th Ave
 *               (pay / old-world money / Persuasion / Electronics reprogram good or evil / scrap it).
 *               The impound locker is a key lock (G.locks 'qx_impound_locker', key qx_impound_key:
 *               MUNI-7 hands it over when reprogrammed, or it is in its evidence tray)
 *   qx_buttons  "Mister Buttons"              Edna's lost pet burrow rat (lure with food / a way
 *               with animals / grab it) — or sell him to a hot-dog man
 *   qx_bixby    "To Glow, or Not to Glow"     Bartholomew Bixby's scattered script pages →
 *               a street performance (Presence: join as Horatio) — or tear them up
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const QX = G.qx;
  const K = () => QX.kit;

  const SPOT = {
    iggyCart: { x: 225, z: -183.2 },
    mortCart: { x: 255, z: -183.2 },
    scoop: { x: 34, z: -249 },
    busStop: { x: 191.5, z: -150 },
    busWreck: { x: 199, z: 12 },
    muni: { x: 127, z: 14 },
    impound: { x: 128.4, z: 23 },
    edna: { x: 112, z: 100 },
    buttons: { x: 115, z: 298 },
    stage: { x: -62, z: -319 },
    pages: [
      { x: -2, z: -321 },
      { x: -88, z: -244 },
      { x: 60, z: -203 },
    ],
  };
  const GC_PENN = { x: 246, z: -200 }; // Pennington's new spot inside Grand Central (lobby)
  // Shared ids owned by other modules (rpg / characters / combat).
  const BURROW_RAT_MEAT = "burrow_rat_meat",
    ROACH_MEAT = "roach_meat",
    OX_MEAT = "ox_meat",
    BURROW_RAT_TYPE = "burrow_rat";
  const BAGEL = "old_world_bagel",
    CHOWDER = "shellback_chowder",
    FIZZO = "fizzo_cola",
    MED_JET = "rally_tonic",
    OLD_DOLLARS = "old_dollars";
  const PATROLMAN_TYPE = "patrolman",
    PATROLMAN_VOICE = "patrolman",
    TOWN_FACTION = "settlers",
    KILL_STANDING = "standing";
  const SK_TRADE = "trade",
    ANIMAL_TALENT = "beast_whisperer";
  /** The city impound locker on 5th Avenue: a key lock (REBRAND §5). */
  const IMPOUND = {
    id: "qx_impound_locker",
    kind: "container",
    label: "City Impound Locker",
    key: "qx_impound_key",
    hint: "MUNI-7 keeps the impound key in its evidence tray.",
    keyFrom:
      "MUNI-7 (No Standing Anytime: reprogrammed, or from its evidence tray)",
  };

  const FOODS = [
    "coney_dog",
    "bodega_pretzel",
    BAGEL,
    "golden_plain_jerky",
    "chocolate_zeppelin",
    "freedom_flakes",
    "pigeon_on_a_stick",
    BURROW_RAT_MEAT,
    ROACH_MEAT,
    "mama_marinara_meatballs",
    "franks_and_beans",
    "frank_in_a_bun",
    "saratoga_chips",
    "astronaut_ice_cream",
    "tunnel_rat_skewer",
    OX_MEAT,
    "gnarlberry",
    "cinnamon_bun",
    "qx_edna_cookies",
  ];
  const firstFood = () => FOODS.find((id) => QX.has(id)) || null;

  // ==================================================================
  // QUEST DEFINITIONS
  // ==================================================================
  QX.hook("quests", function () {
    // ---------------------------------------------------------------- Franks
    QX.define({
      id: "qx_franks",
      name: "A Frank Exchange of Views",
      giver: "Iggy Bellini / Mort Feldstein",
      location: "Grand Central Market",
      order: 41,
      desc:
        "Two hot-dog vendors have been parked on either side of Grand Central's front door for eleven years, sharing a supplier, a wall and a " +
        "hatred you could bottle. Each would pay handsomely to see the other gone. Someone could also try getting them to shake hands.",
      stages: [
        {
          id: "feud",
          text: "Settle the feud between Iggy and Mort, the hot-dog vendors outside Grand Central.",
          markers: () => [
            { npc: "qx_iggy", label: "Iggy Bellini" },
            { npc: "qx_mort", label: "Mort Feldstein" },
          ],
        },
        {
          id: "sab_mort",
          text: "Slip Iggy's doctored mustard into Mort's cart.",
          markers: () => [{ npc: "qx_mort", label: "Mort's cart" }],
        },
        {
          id: "sab_iggy",
          text: "Slip Mort's \"special\" relish into Iggy's cart.",
          markers: () => [{ npc: "qx_iggy", label: "Iggy's cart" }],
        },
        {
          id: "ret_iggy",
          text: "Collect your payment from Iggy.",
          markers: () => [{ npc: "qx_iggy", label: "Iggy Bellini" }],
        },
        {
          id: "ret_mort",
          text: "Collect your payment from Mort.",
          markers: () => [{ npc: "qx_mort", label: "Mort Feldstein" }],
        },
        {
          id: "merge_mort",
          text: "Iggy will consider a partnership. Convince Mort.",
          markers: () => [{ npc: "qx_mort", label: "Mort Feldstein" }],
        },
        {
          id: "merge_iggy",
          text: "Mort will consider a partnership. Convince Iggy.",
          markers: () => [{ npc: "qx_iggy", label: "Iggy Bellini" }],
        },
        {
          id: "done_merge",
          complete: true,
          text: "Iggy & Mort's Genuine Coney Island Kosher-Style Franks is open for business. The argument about cinnamon continues.",
        },
        {
          id: "done_iggy",
          complete: true,
          text: "Mort went home sick and never came back. Iggy has the front door to himself.",
        },
        {
          id: "done_mort",
          complete: true,
          text: "Iggy went home sick and never came back. Mort has the front door to himself.",
        },
        {
          id: "o_secret",
          sideObjective: true,
          text: "(Optional) Find out where both vendors get their meat.",
          doneIf: () => !!QX.flag("franks_secret"),
          showIf: () =>
            QX.stage("qx_franks") === "feud" ||
            /^merge/.test(QX.stage("qx_franks") || ""),
        },
      ],
      rewards: { xp: 125 },
    });

    // ---------------------------------------------------------------- Extra! Extra!
    // MUNI-7 turned on you / scrapped (No Standing Anytime): its subscription is cancelled — the route is two stops, not a soft-lock
    const subGone = (k) =>
      k === "muni" &&
      (QX.stage("qx_parking") === "scrap" ||
        QX.stage("qx_parking") === "done_scrap");
    const delivered = () =>
      ["penn", "edna", "muni"].filter((k) => QX.flag("gaz_" + k) || subGone(k))
        .length;
    QX.define({
      id: "qx_extra",
      name: "Extra! Extra!",
      giver: "Scoop Moretti",
      location: "Sixth Avenue & 42nd Street",
      order: 42,
      desc:
        "Scoop Moretti hawks the Manhattan Clarion on Sixth Avenue and will not hear a word about the Neon's showbiz rag. He has three subscribers left and no legs left to reach them. The Clarion " +
        "must go through. Subscribers pay their dues on delivery.",
      stages: [
        {
          id: "deliver",
          text: () =>
            "Deliver the Manhattan Clarion to Scoop's three subscribers (" +
            delivered() +
            "/3).",
          markers: () => {
            const m = [];
            if (!QX.flag("gaz_penn"))
              m.push({
                npc: "qx_pennington",
                label: "Subscriber: Harold Pennington",
              });
            if (!QX.flag("gaz_edna"))
              m.push({ npc: "qx_edna", label: "Subscriber: Edna Vukovich" });
            if (!QX.flag("gaz_muni") && !subGone("muni"))
              m.push({ npc: "qx_muni7", label: "Subscriber: MUNI-7" });
            return m;
          },
        },
        {
          id: "return",
          text: "Return to Scoop with the subscription dues.",
          markers: () => [{ npc: "qx_scoop", label: "Scoop Moretti" }],
        },
        {
          id: "done",
          complete: true,
          text: () =>
            QX.flag("extra_kept")
              ? "You told Scoop the subscribers didn't pay, and kept the dues. The Clarion will fold within the month."
              : "The Clarion went through. Scoop is already writing tomorrow's headline, which is about you.",
        },
      ],
      rewards: { xp: 100 },
    });

    // ---------------------------------------------------------------- Last Stop
    QX.define({
      id: "qx_commute",
      name: "Last Stop",
      giver: "Harold Pennington",
      location: "Park Avenue & 38th Street",
      order: 43,
      desc:
        "Harold Pennington, actuary, has been waiting for the 9:47 M42 crosstown bus at Park Avenue and 38th Street since Sunday morning, " +
        "March 5th, 1967 (quarter-end waits for no one, not even the Sabbath). He is sixty-three now, and every morning he is back at the stop. He has not noticed. The bus is running a little late.",
      stages: [
        {
          id: "talk",
          text: "Talk to Harold Pennington about his bus.",
          markers: () => [{ npc: "qx_pennington", label: "Harold Pennington" }],
        },
        {
          id: "find",
          text: "Find out what happened to the 9:47 M42 bus. It should be somewhere down Park Avenue.",
          markers: () =>
            QX.flag("got_penn_timetable") || QX.has("qx_m42_timetable")
              ? []
              : [
                  {
                    x: SPOT.busWreck.x,
                    z: SPOT.busWreck.z,
                    label: "The M42 bus",
                  },
                ],
        },
        {
          id: "tell",
          text: "Show Harold Pennington the M42 timetable.",
          markers: () => [{ npc: "qx_pennington", label: "Harold Pennington" }],
        },
        {
          id: "done_home",
          complete: true,
          text: "Harold Pennington finally stopped waiting. He walked to Grand Central, where the ceiling reminds him of the sky before it went strange.",
        },
        {
          id: "done_wait",
          complete: true,
          text: "You told Harold the bus was on its way. He is still waiting. He will always be waiting.",
        },
      ],
      rewards: { xp: 100 },
    });

    // ---------------------------------------------------------------- No Standing Anytime
    QX.define({
      id: "qx_parking",
      name: "No Standing Anytime",
      giver: "MUNI-7",
      location: "5th Avenue",
      order: 44,
      desc:
        "MUNI-7, a Department of Traffic enforcement Patrolman robot, has been ticketing the wrecked cars of 5th Avenue for twenty-two years. " +
        "It has now ticketed you. The fine is $1,967.",
      stages: [
        {
          id: "fine",
          text: "Deal with MUNI-7's parking citation.",
          markers: () => [{ npc: "qx_muni7", label: "MUNI-7" }],
        },
        {
          id: "scrap",
          text: 'MUNI-7 is "escalating enforcement". Destroy it.',
          markers: () => [{ npc: "qx_muni7", label: "MUNI-7" }],
        },
        {
          id: "done_paid",
          complete: true,
          text: "You paid the fine. MUNI-7 thanks you for your civic contribution and has already ticketed a skeleton.",
        },
        {
          id: "done_talk",
          complete: true,
          text: 'MUNI-7 recognized your "diplomatic immunity". It salutes you whenever you pass.',
        },
        {
          id: "done_good",
          complete: true,
          text: "You rewrote MUNI-7's directives. It now protects the people of 5th Avenue instead of fining them — and handed over the impound locker key.",
        },
        {
          id: "done_evil",
          complete: true,
          text: "You rewrote MUNI-7's directives. It now fines everyone on 5th Avenue and deposits the collections in the impound locker. For you.",
        },
        {
          id: "done_scrap",
          complete: true,
          text: "MUNI-7 has been permanently decommissioned. The impound locker key was in its evidence tray.",
        },
      ],
      rewards: { xp: 75 },
    });

    // ---------------------------------------------------------------- Mister Buttons
    QX.define({
      id: "qx_buttons",
      name: "Mister Buttons",
      giver: "Edna Vukovich",
      location: "5th Avenue & 23rd Street",
      order: 45,
      desc:
        "Edna Vukovich's pet burrow rat, Mister Buttons, has run away again. He was last seen heading south toward Union Square, which is where " +
        "he goes when he feels unappreciated.",
      stages: [
        {
          id: "find",
          text: "Find Mister Buttons. He was last seen near Union Square.",
          markers: () => [
            {
              x: SPOT.buttons.x + 4,
              z: SPOT.buttons.z - 6,
              label: "Last seen: Union Square",
            },
          ],
        },
        {
          id: "escort",
          text: "Bring Mister Buttons home to Edna.",
          markers: () => [{ npc: "qx_edna", label: "Edna Vukovich" }],
        },
        {
          id: "return",
          text: "Tell Edna that Mister Buttons is home.",
          markers: () => [{ npc: "qx_edna", label: "Edna Vukovich" }],
        },
        {
          id: "done",
          complete: true,
          text: "Mister Buttons is home. Edna has baked you cookies. The cookies are very hard.",
        },
        {
          id: "sold",
          complete: true,
          text: "You sold Mister Buttons to a hot-dog vendor. Edna still leaves a saucer out for him. Try the coney dogs.",
        },
      ],
      rewards: { xp: 100 },
    });

    // ---------------------------------------------------------------- To Glow, or Not to Glow
    const pagesHave = () =>
      [1, 2, 3].filter(
        (i) => QX.has("qx_script_page_" + i) || QX.flag("bix_page_" + i),
      ).length;
    QX.define({
      id: "qx_bixby",
      name: "To Glow, or Not to Glow",
      giver: "Bartholomew Bixby",
      location: "Times Square",
      order: 46,
      desc:
        'Bartholomew Bixby, septuagenarian, tragedian, and the last working actor on Broadway, is mounting a one-man "Hamlet of Hoboken" north of ' +
        "Times Square. A gust of wind has scattered his only script across Midtown. The show must go on. The show cannot go on without the script.",
      stages: [
        {
          id: "pages",
          text: () =>
            "Find Bixby's three missing script pages (" + pagesHave() + "/3).",
          markers: () =>
            SPOT.pages
              .map((p, i) =>
                QX.has("qx_script_page_" + (i + 1)) ||
                QX.flag("bix_page_" + (i + 1))
                  ? null
                  : { x: p.x, z: p.z, label: "Script Page" },
              )
              .filter(Boolean),
        },
        {
          id: "return",
          text: "Return the script pages to Bartholomew Bixby.",
          markers: () => [{ npc: "qx_bixby", label: "Bartholomew Bixby" }],
        },
        {
          id: "show",
          text: 'Watch Bixby\'s performance of "Hamlet of Hoboken".',
          markers: () => [{ npc: "qx_bixby", label: "Bartholomew Bixby" }],
        },
        {
          id: "done",
          complete: true,
          text: () =>
            QX.flag("bix_costar")
              ? "You played Horatio opposite Bartholomew Bixby. The reviews were mixed. The review was Scoop."
              : 'Bixby performed "Hamlet of Hoboken" to an audience of you, two retired chorus girls and a very attentive burrow rat.',
        },
        {
          id: "torn",
          text: "You tore up Bixby's script in front of him. There will be no show.",
        },
      ],
      rewards: { xp: 125 },
      onFail() {
        QX.standing(-50, "Ruined Bixby's show");
      },
    });
    QX.misc = { delivered, pagesHave };
  });

  // ==================================================================
  // NPCs
  // ==================================================================
  const FRANK_STOCK_I = [
    ["coney_dog", 10],
    ["egg_cream", 4],
    [FIZZO, 3],
    ["purified_water", 2],
  ];
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
  QX.hook("world", function () {
    const k = K();
    const gy = (x, z) => G.world.groundHeight(x, z, 1.5, 0.3);
    // hot-dog carts (the vendors stand on the building side, facing the street)
    k.hotdogCart(
      SPOT.iggyCart.x,
      gy(SPOT.iggyCart.x, SPOT.iggyCart.z),
      SPOT.iggyCart.z,
      0,
      "FOREVER FRANKS\nIGGY'S CONEY ISLAND",
      0xc8c0a8,
      0xb02a1e,
    );
    k.hotdogCart(
      SPOT.mortCart.x,
      gy(SPOT.mortCart.x, SPOT.mortCart.z),
      SPOT.mortCart.z,
      0,
      "FOREVER FRANKS\nMORT'S KOSHER-STYLE",
      0xa8b8b0,
      0x1e5a8a,
    );
    // Scoop's newsstand
    k.newsStand(
      SPOT.scoop.x + 1.2,
      gy(SPOT.scoop.x + 1.2, SPOT.scoop.z + 0.8),
      SPOT.scoop.z + 0.8,
      Math.PI / 2,
    );
    // bus stop (bench faces the avenue, east)
    k.busStop(
      SPOT.busStop.x,
      gy(SPOT.busStop.x, SPOT.busStop.z),
      SPOT.busStop.z,
      -Math.PI / 2,
    );
    // the crashed M42 and its driver
    QX.prop("car", {
      x: SPOT.busWreck.x,
      z: SPOT.busWreck.z,
      yaw: 0.35,
      kind: "bus",
      wreck: true,
      burnt: false,
      persistent: true,
    });
    QX.prop("skeleton", {
      x: SPOT.busWreck.x - 2.6,
      z: SPOT.busWreck.z - 3.5,
      yaw: 1.2,
      pose: "sitting",
      persistent: true,
    });
    // parking meters + impound locker on 5th Avenue
    k.meters(
      SPOT.muni.x - 0.7,
      gy(SPOT.muni.x - 0.7, SPOT.muni.z + 8),
      SPOT.muni.z + 8,
      Math.PI / 2,
      5,
    );
    QX.registerLock(IMPOUND);
    if (QX.live("containers") && G.containers.create) {
      QX.world.impound = QX.safe("impound", () =>
        G.containers.create({
          id: "qx_impound_locker",
          kind: "locker",
          name: "City Impound Locker",
          pos: {
            x: SPOT.impound.x,
            y: gy(SPOT.impound.x, SPOT.impound.z),
            z: SPOT.impound.z,
          },
          yaw: -Math.PI / 2,
          lock: IMPOUND,
          items: [
            [QX.SCRIP_ID, 120],
            ["hunting_rifle", 1],
            ["ammo_308", 18],
            [MED_JET, 2],
            ["motorcycle_helmet", 1],
            [OLD_DOLLARS, 6],
            ["sunglasses", 1],
          ].filter((e) => e[0] === QX.SCRIP_ID || QX.itemExists(e[0])),
        }),
      );
    }
    // Buttons' hiding place: a wrecked taxi
    QX.prop("car", {
      x: SPOT.buttons.x + 2.2,
      z: SPOT.buttons.z - 1.5,
      yaw: 0.5,
      kind: "taxi",
      wreck: true,
      persistent: true,
    });
    // Bixby's stage (audience to the south)
    k.stage(
      SPOT.stage.x,
      gy(SPOT.stage.x, SPOT.stage.z),
      SPOT.stage.z,
      Math.PI,
    );
  });

  // Evil MUNI-7: daily "collections" deposited in the impound locker (max 1 per game day).
  QX.hook("update", function () {
    if (!QX.reached("qx_parking", "done_evil") || !QX.world.impound) return;
    const day = G.time.day | 0;
    if (QX.flag("muni_day") === day) return;
    QX.setFlag("muni_day", day);
    if (QX.dist(SPOT.impound.x, SPOT.impound.z) < 60) return; // don't pop items in front of the player
    QX.safe("collect", () =>
      QX.world.impound.put
        ? QX.world.impound.put(QX.SCRIP_ID, 18 + ((day * 7) % 13))
        : null,
    );
  });

  // ==================================================================
  // Pickups & quest actions
  // ==================================================================
  function spawnPages() {
    SPOT.pages.forEach((p, i) => {
      const n = i + 1;
      if (
        QX.has("qx_script_page_" + n) ||
        QX.flag("bix_page_" + n) ||
        QX.pickups["bix_page_" + n]
      )
        return;
      const s = QX.freeSpot(p.x, p.z, undefined, { maxR: 5 });
      QX.pickup("bix_page_" + n, "qx_script_page_" + n, 1, {
        x: s.x,
        y: s.y + 0.02,
        z: s.z,
      });
    });
  }
  function spawnTimetable() {
    if (
      QX.has("qx_m42_timetable") ||
      QX.flag("got_penn_timetable") ||
      QX.pickups.penn_timetable
    )
      return;
    const s = QX.freeSpot(
      SPOT.busWreck.x - 2.2,
      SPOT.busWreck.z - 4.6,
      undefined,
      { maxR: 4 },
    );
    QX.pickup("penn_timetable", "qx_m42_timetable", 1, {
      x: s.x,
      y: s.y + 0.02,
      z: s.z,
    });
  }
  G.events.on("itemAdded", (id) => {
    if (/^qx_script_page_/.test(id) && QX.stage("qx_bixby") === "pages") {
      if (QX.misc.pagesHave() >= 3) QX.setStage("qx_bixby", "return");
      else QX.refresh("qx_bixby");
    }
    if (id === "qx_m42_timetable" && QX.stage("qx_commute") === "find")
      QX.setStage("qx_commute", "tell");
  });

  const A = (QX.miscActions = {
    // ---- franks ----
    franksStart(stage) {
      if (!QX.started("qx_franks"))
        QX.start("qx_franks", { stage: stage || "feud" });
      else if (stage) QX.setStage("qx_franks", stage);
    },
    hireIggy() {
      A.franksStart("sab_mort");
      QX.give("qx_doctored_mustard", 1);
    },
    hireMort() {
      A.franksStart("sab_iggy");
      QX.give("qx_mort_relish", 1);
    },
    sabotage(victim) {
      const item = victim === "mort" ? "qx_doctored_mustard" : "qx_mort_relish";
      if (!QX.take(item, 1)) return;
      QX.standing(-75, "Poisoned a hot-dog vendor's cart");
      QX.setStage("qx_franks", victim === "mort" ? "ret_iggy" : "ret_mort");
      const id = victim === "mort" ? "qx_mort" : "qx_iggy";
      QX.setFlag("franks_" + victim + "_sick");
      QX.later(4, () =>
        QX.say(id, "Oh... oh, that's not right. That's not right at ALL."),
      );
      QX.later(9, () =>
        QX.say(
          id,
          "I gotta... I gotta go lie down. For a week. Maybe forever.",
        ),
      );
      QX.later(14, () => {
        QX.setFlag("franks_" + victim + "_gone");
        QX.removeNPC(id);
        absorbMenu(victim === "mort" ? "iggy" : "mort");
      });
    },
    payout(who) {
      QX.giveScrip(120);
      QX.give("coney_dog", 3);
      QX.setStage("qx_franks", who === "iggy" ? "done_iggy" : "done_mort");
      QX.news(
        "Bad news from Grand Central Market: a hot-dog vendor out front came down with a mysterious case of food poisoning and has closed for good. " +
          'His rival says it was "a tragedy" and is now offering two-for-one.',
      );
    },
    mergeHalf(first) {
      A.franksStart(first === "iggy" ? "merge_mort" : "merge_iggy");
      QX.setFlag("franks_open_" + first);
    },
    merge() {
      QX.setStage("qx_franks", "done_merge");
      QX.standing(50, "Brokered peace between hot-dog vendors");
      QX.giveScrip(100);
      QX.give("qx_franks_recipe", 1);
      QX.give("coney_dog", 2);
      QX.give("egg_cream", 1);
      setFrankBarks();
      absorbMenu("iggy");
      absorbMenu("mort");
      for (const it of ["qx_doctored_mustard", "qx_mort_relish"])
        QX.take(it, QX.count(it));
      QX.news(
        "Peace in our time, folks: the hot-dog carts outside Grand Central have MERGED. Iggy and Mort's. The onion sauce contains cinnamon " +
          "on Mondays, Wednesdays and Fridays. Negotiations about Sundays continue.",
      );
    },
    // ---- extra ----
    extraStart() {
      if (!QX.started("qx_extra")) {
        QX.start("qx_extra", { stage: "deliver" });
        QX.give("qx_gazette", 3);
      }
    },
    deliver(k, tip) {
      if (QX.flag("gaz_" + k) || !QX.take("qx_gazette", 1)) return;
      QX.setFlag("gaz_" + k);
      QX.inc("gaz_dues", 10);
      QX.giveScrip(10 + (tip || 0));
      if (QX.misc.delivered() >= 3) QX.setStage("qx_extra", "return");
      else QX.refresh("qx_extra");
    },
    extraFinish(kept) {
      if (QX.stage("qx_extra") !== "return") return;
      if (kept) {
        QX.setFlag("extra_kept");
        QX.standing(-25, "Pocketed a newsboy's dues");
        QX.giveScrip(15);
      } else {
        QX.giveScrip(-Math.min(30, QX.scrip()));
        QX.giveScrip(45);
        QX.give("newsboy_cap", 1);
        QX.standing(15, "Honest delivery");
      }
      QX.setStage("qx_extra", "done");
      QX.scoopBarks();
    },
    // ---- commute ----
    pennStart(stage) {
      if (!QX.started("qx_commute"))
        QX.start("qx_commute", { stage: stage || "talk" });
      else if (stage) QX.setStage("qx_commute", stage);
      if (stage === "find") spawnTimetable();
    },
    pennHome(viaProof) {
      if (viaProof) QX.take("qx_m42_timetable", 1);
      QX.standing(viaProof ? 50 : 35, "Gave a lost commuter closure");
      QX.give("qx_pocket_watch", 1);
      QX.setFlag("penn_moved");
      A.pennStart("done_home");
      QX.xp(viaProof ? 50 : 25, "Last Stop");
      // he walks off; once the player isn't looking (far away) he is at Grand Central
      QX.later(6, relocatePenn);
    },
    pennWait() {
      QX.standing(-25, "Lied to a lost commuter");
      A.pennStart("done_wait");
    },
    // ---- parking ----
    muniStart() {
      if (!QX.started("qx_parking")) {
        QX.start("qx_parking", { stage: "fine" });
        QX.give("qx_citation", 1);
      }
    },
    muniEnd(stage) {
      A.muniStart();
      QX.setStage("qx_parking", stage);
      const a = QX.npc("qx_muni7");
      if (stage === "done_good") {
        QX.standing(50, "Reformed a ticket robot");
        QX.give("qx_impound_key", 1);
        if (a) {
          a.faction = "settlers";
          a.barks = [
            "CITIZEN. YOU ARE PROTECTED.",
            "HAVE A SAFE DAY.",
            "NO ONE WILL BE FINED TODAY.",
          ];
          if (a.inventory)
            a.inventory = a.inventory.filter((e) => e[0] !== "qx_impound_key");
        }
      }
      if (stage === "done_evil") {
        QX.standing(-75, "Turned a ticket robot into a racket");
        QX.give("qx_impound_key", 1);
        if (a) {
          a.barks = [
            "FINE ISSUED. FINE ISSUED. FINE ISSUED.",
            "ALL COLLECTIONS FORWARDED TO THE BENEFICIARY.",
            "PAY THE BENEFICIARY.",
          ];
          if (a.inventory)
            a.inventory = a.inventory.filter((e) => e[0] !== "qx_impound_key");
        }
        QX.setFlag("muni_day", G.time.day | 0);
      }
    },
    muniFight() {
      A.muniStart();
      QX.setStage("qx_parking", "scrap");
      const a = QX.npc("qx_muni7");
      if (a) {
        a[KILL_STANDING] = 0;
        if (a.setHostile) QX.safe("hostile", () => a.setHostile(true));
      }
      extraRouteCheck();
    },
    // ---- buttons ----
    buttonsStart(stage) {
      if (!QX.started("qx_buttons"))
        QX.start("qx_buttons", { stage: stage || "find" });
      else if (stage) QX.setStage("qx_buttons", stage);
    },
    buttonsFollow() {
      A.buttonsStart("escort");
      QX.setFlag("buttons_follow");
      const b = QX.npc("qx_buttons");
      if (b && b.follow) QX.safe("follow", () => b.follow("player"));
    },
    buttonsHome() {
      QX.setFlag("buttons_home");
      QX.setFlag("buttons_follow", false);
      const b = QX.npc("qx_buttons");
      if (b) {
        if (b.follow) QX.safe("unfollow", () => b.follow(null));
        b.home = { x: SPOT.edna.x + 1.5, z: SPOT.edna.z + 1, r: 3 };
      }
      A.buttonsStart("return");
    },
    buttonsReward(refuse) {
      if (refuse) {
        QX.standing(40, "Returned a lost pet for nothing");
        QX.give("qx_edna_cookies", 5);
      } else {
        QX.giveScrip(60);
        QX.give("qx_edna_cookies", 3);
        QX.standing(15, "Returned a lost pet");
      }
      A.buttonsStart("done");
      const e = QX.npc("qx_edna");
      if (e)
        e.barks = ["Who's a good boy? Buttons is a good boy.", "Cookie, dear?"];
    },
    buttonsSell(buyer) {
      QX.setFlag("buttons_sold");
      QX.setFlag("buttons_follow", false);
      QX.standing(-100, "Sold a pet burrow rat for meat");
      QX.giveScrip(60);
      QX.removeNPC("qx_buttons");
      A.buttonsStart("sold");
      QX.say(
        buyer,
        "Pleasure doing business. Don't ask what's in tomorrow's special.",
      );
    },
    // ---- bixby ----
    bixStart() {
      if (!QX.started("qx_bixby")) {
        QX.start("qx_bixby", { stage: "pages" });
        spawnPages();
        if (QX.misc.pagesHave() >= 3) QX.setStage("qx_bixby", "return");
      }
    },
    bixHandIn(costar) {
      for (let i = 1; i <= 3; i++) {
        if (QX.take("qx_script_page_" + i, 1)) QX.setFlag("bix_page_" + i);
      }
      if (costar) QX.setFlag("bix_costar");
      QX.setStage("qx_bixby", "show");
      performance(costar);
    },
    bixTear() {
      for (let i = 1; i <= 3; i++) QX.take("qx_script_page_" + i, 1);
      QX.fail("qx_bixby");
      QX.say("qx_bixby", "No... NO! Twenty-two years I carried that script!");
    },
  });

  // MUNI-7: shooting it turns the citation into a fight; destroying it closes the case.
  G.events.on("actorDamaged", (a, amt, info) => {
    if (!a || a.id !== "qx_muni7" || !info || info.source !== "player") return;
    if (!QX.done("qx_parking") && QX.stage("qx_parking") !== "scrap")
      A.muniFight();
  });
  G.events.on("actorKilled", (a) => {
    if (!a || a.id !== "qx_muni7") return;
    if (!QX.started("qx_parking")) A.muniStart();
    if (!QX.done("qx_parking")) QX.setStage("qx_parking", "done_scrap");
    extraRouteCheck();
  });
  // a cancelled subscriber may have been the last stop on Scoop's route
  function extraRouteCheck() {
    if (
      QX.stage("qx_extra") === "deliver" &&
      QX.active("qx_extra") &&
      QX.misc.delivered() >= 3
    )
      QX.setStage("qx_extra", "return");
  }

  function relocatePenn() {
    // Walk off-screen: teleport when the player is far enough or not looking; retry until done.
    const a = QX.npc("qx_pennington");
    if (!a || a.dead) return;
    if (QX.dist(a.pos.x, a.pos.z) < 35 && QX.dist(GC_PENN.x, GC_PENN.z) > 35) {
      QX.later(4, relocatePenn);
      if (a.moveTo)
        QX.safe("walk", () => a.moveTo(SPOT.busStop.x, SPOT.busStop.z - 25));
      return;
    }
    const p = QX.anchor("grand_central", ["lobby_bench"], GC_PENN);
    QX.moveNPC("qx_pennington", p);
    a.barks = [
      "Lovely ceiling. Lovely.",
      "I used to catch the 9:47. Now I catch my breath.",
      "No bus. No boss. No rush.",
    ];
    a.yaw = QX.yawTo(p.x, p.z, 240, -226);
  }
  QX.hook("loaded", function () {
    if (QX.flag("penn_moved")) QX.later(1, relocatePenn);
  });

  /** Bixby's street performance: a short scripted scene of barks (game time). */
  function performance(costar) {
    const lines = costar
      ? [
          [
            "qx_bixby",
            "Ladies, gentlemen, showfolk and assorted riff-raff — HAMLET OF HOBOKEN!",
          ],
          [
            "qx_bixby",
            "Who's there? Nay, answer me! ...That's your cue, Horatio.",
          ],
          [
            "you",
            "You deliver Horatio's line. Two retired chorus girls in the audience gasp.",
          ],
          ["qx_bixby", "To glow, or not to glow — that is the question!"],
          ["you", "You hold up a skull on cue. It is still wearing a hat."],
          [
            "qx_bixby",
            "Alas, poor Yorick! I knew him, Horatio. He owed me eleven Scrip.",
          ],
          [
            "qx_bixby",
            "The rest... is... STATIC. [He dies magnificently. It takes a while.]",
          ],
          [
            "qx_bixby",
            "Thank you! Thank you! You've been a wonderful audience of three!",
          ],
        ]
      : [
          [
            "qx_bixby",
            "Ladies, gentlemen, showfolk and assorted riff-raff — HAMLET OF HOBOKEN!",
          ],
          [
            "qx_bixby",
            "O, that this too too solid flesh would melt... in this humidity, it might. Moving on.",
          ],
          ["qx_bixby", "To glow, or not to glow — that is the question!"],
          [
            "qx_bixby",
            "Alas, poor Yorick! I knew him, Horatio. He owed me eleven Scrip.",
          ],
          [
            "qx_bixby",
            "The rest... is... STATIC. [He dies magnificently. It takes a while.]",
          ],
          ["qx_bixby", "Thank you! You've been a wonderful audience of one!"],
        ];
    let t = 1;
    for (const [who, text] of lines) {
      QX.later(t, () => {
        if (who === "you") QX.notify(text);
        else QX.say(who, text, 5);
      });
      t += 5.2;
    }
    QX.later(t, () => finishShow(costar));
  }
  /** Curtain: the reward (also called directly by the self-test). */
  function finishShow(costar) {
    if (QX.stage("qx_bixby") !== "show") return;
    QX.give("qx_bixby_hat", 1);
    if (costar) {
      QX.giveScrip(40);
      QX.xp(75, "Played Horatio");
      QX.standing(20, "The show went on");
    } else QX.standing(10, "The show went on");
    QX.setStage("qx_bixby", "done");
    QX.news(
      'A theatrical note from Times Square: Bartholomew Bixby\'s "Hamlet of Hoboken" has opened' +
        (costar
          ? ", featuring a mysterious sleeper in a cryo suit as Horatio. "
          : ". ") +
        "The run is expected to last until Mister Bixby runs out of breath, which, for a man who once held a high C through a blackout, could be decades.",
    );
  }
  A.bixFinish = () => finishShow(!!QX.flag("bix_costar"));
  QX.hook("loaded", function () {
    // a performance interrupted by save/load simply finishes
    if (QX.stage("qx_bixby") === "show") performance(!!QX.flag("bix_costar"));
  });

  // ==================================================================
  // Triggers & the Buttons escort
  // ==================================================================
  // MUNI-7 tickets you when you walk into its zone.
  QX.trigger({
    id: "muni_ticket",
    pos: () => {
      const a = QX.npc("qx_muni7");
      return a && !a.dead ? a.pos : null;
    },
    r: 7,
    cond: () => !QX.started("qx_parking"),
    fire: () => {
      QX.say(
        "qx_muni7",
        "HALT, CITIZEN. YOU ARE STANDING IN A NO STANDING ZONE. CITATION ISSUED.",
        5,
      );
      QX.sfx("robot_beep");
      A.muniStart();
    },
  });
  // Found Buttons before meeting Edna: the collar tag starts the quest.
  QX.trigger({
    id: "buttons_seen",
    pos: () => {
      const a = QX.npc("qx_buttons");
      return a && !a.dead && !QX.flag("buttons_home") ? a.pos : null;
    },
    r: 6,
    cond: () => !QX.started("qx_buttons"),
    fire: () => {
      QX.notify(
        'The burrow rat is wearing a knitted collar. The tag reads "MISTER BUTTONS — if found, return to Edna, 5th & 23rd."',
      );
      A.buttonsStart("find");
    },
  });
  let escT = 0;
  QX.hook("update", function (dt, realDt) {
    escT -= realDt;
    if (escT > 0) return;
    escT = 0.5;
    if (!QX.flag("buttons_follow") || QX.flag("buttons_home")) return;
    const b = QX.npc("qx_buttons");
    if (!b || b.dead) return;
    const P = G.player.pos;
    const d = Math.hypot(b.pos.x - P.x, b.pos.z - P.z);
    // Keep up across doors / long sprints (companions do the same).
    if (d > 32 || QX.inInterior() !== b.pos.x >= G.LAYOUT.INTERIOR_X_MIN) {
      const s = QX.freeSpot(
        P.x - G.player.forward.x * 3,
        P.z - G.player.forward.z * 3,
        P.y,
        { maxR: 4 },
      );
      b.pos.set(s.x, s.y, s.z);
      if (b.follow) QX.safe("follow", () => b.follow("player"));
    }
    if (
      QX.dist(SPOT.edna.x, SPOT.edna.z) < 10 &&
      Math.hypot(b.pos.x - SPOT.edna.x, b.pos.z - SPOT.edna.z) < 12
    ) {
      A.buttonsHome();
      QX.say(
        "qx_edna",
        "BUTTONS! Oh, my baby! Look at you, you're filthy! Mama's going to — dear, come here, come here!",
        5,
      );
    }
  });

  // ==================================================================
  // DIALOGUE
  // ==================================================================
  QX.hook("register", function () {
    const fs = () => QX.stage("qx_franks");
    const buttonsWithYou = () =>
      !!QX.flag("buttons_follow") &&
      !QX.flag("buttons_home") &&
      QX.alive("qx_buttons");
    const R_TRADE = { text: "Let me see what you're selling.", barter: true };
    const sellButtons = (who) => ({
      id: "sell_buttons_" + who,
      text: "(Cruel) I've got a burrow rat here. Fresh. Friendly. Very meaty. Interested?",
      cond: buttonsWithYou,
      next: "buy_buttons",
      action: () => A.buttonsSell(who === "iggy" ? "qx_iggy" : "qx_mort"),
    });

    // ---------------------------------------------------------------- IGGY
    QX.dialogue("qx_dlg_iggy", {
      start: () => {
        const s = fs();
        if (s === "ret_iggy") return "pay";
        if (s === "sab_iggy") return "target";
        if (s === "merge_iggy") return "merge";
        if (s === "done_merge") return "merged";
        if (s === "done_iggy") return "alone";
        return QX.flag("met_iggy") ? "hub" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Iggy Bellini",
          onEnter: () => QX.setFlag("met_iggy"),
          text:
            "Hey, hey, HEY! Iggy Bellini, Genuine Coney Island Franks, est. before your grandmother. Licensed Forever Franks franchisee — see the little fella in the top hat on my sign? " +
            '"So good they\'ll outlive you!" You want a dog? You want TWO dogs? ' +
            "Whatever you do, pal, don't buy from that bum on the other side of the door. Mort. Mort puts CINNAMON in the onions. Like an animal.",
          responses: [
            { text: "What's the deal with you and Mort?", next: "feud" },
            R_TRADE,
            { text: "Just looking.", end: true },
          ],
        },
        hub: {
          speaker: "Iggy Bellini",
          text: [
            "Back for more? I knew it. Nobody forgets their first Iggy's.",
            "Every dog by the franchise manual, pal. Chapter Four: the bun is warmed, never toasted.",
            "Dogs! Hot! Ish!",
            "You look hungry. You look like a two-dog customer.",
          ],
          responses: [
            {
              text: "About Mort...",
              next: "feud",
              cond: () => !fs() || fs() === "feud",
            },
            {
              id: "iggy_secret",
              text: 'Your crates and Mort\'s crates have the same stamp. "S.S." Same supplier, same meat.',
              cond: () =>
                !!QX.flag("franks_secret") &&
                (!fs() || fs() === "feud" || fs() === "merge_iggy"),
              next: "secret",
            },
            sellButtons("iggy"),
            R_TRADE,
            { text: "See you, Iggy.", end: true },
          ],
        },
        feud: {
          speaker: "Iggy Bellini",
          text:
            "Eleven years, pal. Eleven YEARS he's been parked on MY side of the door. The east side. Which is my side. Because I said so first. " +
            "He steals my customers, he steals my onions, he looks at me funny. You wanna make some Scrip? I got a little job.",
          responses: [
            { text: "What kind of job?", next: "job" },
            {
              id: "iggy_merge",
              text: "Have you two ever thought about working together? One cart, both menus, twice the customers.",
              check: { skill: "persuasion", value: 55 },
              next: "merge_yes",
              failNext: "merge_no",
              cond: () => !QX.flag("franks_open_iggy"),
            },
            {
              id: "iggy_senses",
              text: "(Look closer at his supply crates.)",
              check: { attr: "senses", value: 6 },
              next: "crates",
              cond: () => !QX.flag("franks_secret"),
            },
            { text: "Not my business.", end: true },
          ],
        },
        crates: {
          speaker: "Iggy Bellini",
          onEnter: () => QX.setFlag("franks_secret"),
          text: '[Under the cart: three crates stencilled "S.S. — PROVISIONS". The same stencil you saw — or will see — under Mort\'s cart.] Hey! Eyes up here, pal. Those crates are private. Family business.',
          responses: [
            {
              text: 'Mort\'s crates say "S.S." too. Same supplier, same meat.',
              next: "secret",
            },
            { text: "Sorry. Go on.", next: "feud" },
          ],
        },
        secret: {
          speaker: "Iggy Bellini",
          text:
            "...Keep your voice down. Okay. OKAY. The Forever Franks trucks stopped coming in '67. Sewer Stan. Down in the tunnels. He sells to both of us. Same dogs. Same buns. " +
            'If people find out, eleven years of "genuine" goes down the drain, and so does Mort\'s "kosher-style". ...What do you want?',
          responses: [
            {
              text: "Stop fighting. Go into business together, and nobody hears it from me.",
              next: "merge_yes",
              action: () => {
                if (QX.flag("franks_open_mort")) A.merge();
              },
            },
            { text: "Relax. Your secret's safe.", end: true },
          ],
        },
        job: {
          speaker: "Iggy Bellini",
          text:
            "Here. [He presses a squeeze bottle into your hand.] Mustard. Special mustard. I stirred in a little Homeguard cleanser. Nobody dies — they just get the " +
            "kind of sick where you think about your choices. Slip it into Mort's condiment tray. Mort's customers get sick, Mort gets a reputation, Mort goes home. 120 Scrip.",
          responses: [
            {
              text: "Deal. Give me the mustard.",
              action: () => A.hireIggy(),
              end: true,
            },
            { text: "Poisoning people? No.", end: true, standing: 5 },
          ],
        },
        merge_yes: {
          speaker: "Iggy Bellini",
          onEnter: () => {
            if (!QX.flag("franks_open_mort")) A.mergeHalf("iggy");
            else A.merge();
          },
          text: () =>
            QX.reached("qx_franks", "done_merge")
              ? "...Partners. Me and Mort. PARTNERS. [He stares at the ceiling of Grand Central like it owes him money.] " +
                "Fine. FINE. But the cinnamon is OPTIONAL. Here — the family recipe. Both families. Don't make that face."
              : "[He opens his mouth to shout. Closes it. Opens it again.] ...One cart. Both menus. Huh. I'd get the east side AND the west side. " +
                "Fine. IF he agrees. Which he won't. Because he's Mort.",
          responses: [{ text: "Leave Mort to me.", end: true }],
        },
        merge_no: {
          speaker: "Iggy Bellini",
          text: "Work with MORT? I'd rather sell dogs to ripjaws. At least they tip.",
          responses: [{ text: "Worth a try.", end: true }],
        },
        target: {
          speaker: "Iggy Bellini",
          text: "Hey, pal! What'll it be? The usual? You got the usual face.",
          responses: [
            {
              id: "iggy_slip_sneak",
              text: "(Slip Mort's relish into his condiment tray while he makes change.)",
              check: { skill: "stealth", value: 35 },
              action: () => A.sabotage("iggy"),
              next: "slipped",
              cond: () => QX.has("qx_mort_relish"),
            },
            {
              id: "iggy_slip_talk",
              text: "(Point behind him) Is that Kong climbing the Chrysler Building?",
              action: () => A.sabotage("iggy"),
              next: "slipped2",
              cond: () => QX.has("qx_mort_relish"),
            },
            R_TRADE,
            { text: "Nothing. Bye.", end: true },
          ],
        },
        slipped: {
          speaker: "Iggy Bellini",
          text: "Two Scrip, three Scrip... here's your change, pal. [He never looks at the relish tray.]",
          responses: [{ text: "Thanks, Iggy.", end: true }],
        },
        slipped2: {
          speaker: "Iggy Bellini",
          text: "WHERE? ...I don't see nothin'. You're seein' things, pal. Eat a dog, you'll feel better. [The relish is already in his tray.]",
          responses: [{ text: "Maybe I will.", end: true }],
        },
        pay: {
          speaker: "Iggy Bellini",
          text: "You hear that? That's the sound of NO MORT. Oh, it's beautiful. It's like a symphony with no Mort in it. Here — 120 Scrip, and a hot dog for each hand. On the house.",
          responses: [
            {
              text: "Pleasure doing business.",
              action: () => A.payout("iggy"),
              end: true,
            },
          ],
        },
        merge: {
          speaker: "Iggy Bellini",
          text: "So Mort wants a partnership, huh? Mort. Wants a partnership. With ME.",
          responses: [
            {
              id: "iggy_merge2",
              text: "Think about it: no more feud, twice the menu, twice the customers.",
              check: { skill: "persuasion", value: 45 },
              next: "merge_yes",
              failNext: "merge_no2",
            },
            {
              id: "iggy_merge_trade",
              text: "Split supply costs, one umbrella, one permit. You'd clear forty percent more a week.",
              check: { skill: "trade", value: 40 },
              next: "merge_yes",
            },
            {
              text: 'Your crates and his come from the same place. "S.S." I know about Sewer Stan.',
              cond: () => !!QX.flag("franks_secret"),
              next: "merge_yes",
            },
            { text: "Think it over.", end: true },
          ],
        },
        merge_no2: {
          speaker: "Iggy Bellini",
          text: "Nah. Nah nah nah. Eleven years. You don't throw away eleven years of hate for a bigger umbrella.",
          responses: [{ text: "We'll see.", end: true }],
        },
        merged: {
          speaker: "Iggy Bellini",
          text: "My PARTNER! No, not Mort — you! Mort's my... associate. We're working on the word. Dog's on the house, always.",
          responses: [
            R_TRADE,
            { text: "Good to see you two getting along.", end: true },
          ],
        },
        alone: {
          speaker: "Iggy Bellini",
          text: "The whole front door, pal. All mine. It's quiet. Too quiet. ...Nah, it's great. It's great. You want a dog?",
          responses: [
            sellButtons("iggy"),
            R_TRADE,
            { text: "No thanks.", end: true },
          ],
        },
        buy_buttons: {
          speaker: "Iggy Bellini",
          text: "A burrow rat? Say no more. [He produces a sack with alarming speed.] Sixty Scrip. And pal — this conversation never happened.",
          responses: [{ text: "...", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- MORT
    QX.dialogue("qx_dlg_mort", {
      start: () => {
        const s = fs();
        if (s === "ret_mort") return "pay";
        if (s === "sab_mort") return "target";
        if (s === "merge_mort") return "merge";
        if (s === "done_merge") return "merged";
        if (s === "done_mort") return "alone";
        return QX.flag("met_mort") ? "hub" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Mort Feldstein",
          onEnter: () => QX.setFlag("met_mort"),
          text:
            "Mort Feldstein. Forever Franks, kosher-style, by special arrangement with the home office: dogs, pretzels, bagels, the chowder on Thursdays. \"Kosher-STYLE.\" It's a style. Don't ask. " +
            "You been to Iggy? Don't go to Iggy. Iggy's mustard is yellow paint. I've seen the can. The can says PAINT.",
          responses: [
            { text: "What's your problem with Iggy?", next: "feud" },
            R_TRADE,
            { text: "Just browsing.", end: true },
          ],
        },
        hub: {
          speaker: "Mort Feldstein",
          text: [
            "You again. Good. Loyal. I like loyal.",
            "Pretzel? It's hard. It's supposed to be hard. It's an old-world pretzel.",
            "Mort's: where the dogs are eighty percent dog.",
          ],
          responses: [
            {
              text: "About Iggy...",
              next: "feud",
              cond: () => !fs() || fs() === "feud",
            },
            {
              id: "mort_secret",
              text: 'Your crates say "S.S.". So do Iggy\'s. Same supplier.',
              cond: () =>
                !!QX.flag("franks_secret") &&
                (!fs() || fs() === "feud" || fs() === "merge_mort"),
              next: "secret",
            },
            sellButtons("mort"),
            R_TRADE,
            { text: "Bye, Mort.", end: true },
          ],
        },
        feud: {
          speaker: "Mort Feldstein",
          text:
            'Eleven years that man has been shouting "GENUINE" at my customers. Genuine WHAT? Nobody knows. Nobody\'s ever known. ' +
            "You look like somebody who does odd jobs. I got an odd job.",
          responses: [
            { text: "I'm listening.", next: "job" },
            {
              id: "mort_merge",
              text: "You and Iggy could stop fighting and go into business together.",
              check: { skill: "trade", value: 50 },
              next: "merge_yes",
              failNext: "merge_no",
              cond: () => !QX.flag("franks_open_mort"),
            },
            {
              id: "mort_senses",
              text: "(Look at the crates under his cart.)",
              check: { attr: "senses", value: 6 },
              next: "crates",
              cond: () => !QX.flag("franks_secret"),
            },
            { text: "Not my fight.", end: true },
          ],
        },
        crates: {
          speaker: "Mort Feldstein",
          onEnter: () => QX.setFlag("franks_secret"),
          text: '[Stacked under the cart: crates stencilled "S.S. — PROVISIONS". Mort shifts to block your view.] Those are... pickles. Crates of pickles. Very private pickles.',
          responses: [
            { text: 'Iggy\'s crates say "S.S." too.', next: "secret" },
            { text: "Okay, Mort.", next: "feud" },
          ],
        },
        secret: {
          speaker: "Mort Feldstein",
          text:
            "[He goes pale, which for Mort is an achievement.] Sewer Stan. Okay? He comes up through the grate on Tuesdays. Same dogs for both of us. " +
            "The franchise manual says Miracle-Keep product only, page nine. If that gets out, Mort's is finished. Iggy's too, but mostly I care about Mort's.",
          responses: [
            {
              text: "Then stop fighting. Go into business together, and it stays between us.",
              next: "merge_yes",
              action: () => {
                if (QX.flag("franks_open_iggy")) A.merge();
              },
            },
            { text: "I won't tell.", end: true },
          ],
        },
        job: {
          speaker: "Mort Feldstein",
          text:
            'This jar. [A jar of green relish; something at the bottom glows politely.] My "special" relish. Put it in Iggy\'s condiment tray. His customers get a little ' +
            "glow, a little tummy trouble, and Iggy goes home to reconsider his life. 120 Scrip.",
          responses: [
            { text: "Give me the jar.", action: () => A.hireMort(), end: true },
            { text: "I don't poison people, Mort.", end: true, standing: 5 },
          ],
        },
        merge_yes: {
          speaker: "Mort Feldstein",
          onEnter: () => {
            if (!QX.flag("franks_open_iggy")) A.mergeHalf("mort");
            else A.merge();
          },
          text: () =>
            QX.reached("qx_franks", "done_merge")
              ? "Partners. With Iggy. My mother would be spinning in her grave, if she had one; she was vaporized. Fine! Here — the recipe. " +
                "The cinnamon is IN it. Iggy can pick it out."
              : "...One cart. Iggy does the dogs, I do the pretzels and the chowder. The overhead alone... [He does frantic arithmetic on a napkin.] Fine. If HE agrees. He won't.",
          responses: [{ text: "Leave Iggy to me.", end: true }],
        },
        merge_no: {
          speaker: "Mort Feldstein",
          text: "Business with IGGY? The man counts Scrip with his tongue. I've seen it.",
          responses: [{ text: "Just a thought.", end: true }],
        },
        target: {
          speaker: "Mort Feldstein",
          text: "What'll it be? And don't say \"whatever Iggy's having\". Iggy's having a bad day, God willing.",
          responses: [
            {
              id: "mort_slip_sneak",
              text: "(Swap his mustard for Iggy's bottle while he wraps a pretzel.)",
              check: { skill: "stealth", value: 35 },
              action: () => A.sabotage("mort"),
              next: "slipped",
              cond: () => QX.has("qx_doctored_mustard"),
            },
            {
              id: "mort_slip_talk",
              text: "(Point at the sky) Is that a Rotorcraft? Landing on Iggy?",
              action: () => A.sabotage("mort"),
              next: "slipped2",
              cond: () => QX.has("qx_doctored_mustard"),
            },
            R_TRADE,
            { text: "Never mind.", end: true },
          ],
        },
        slipped: {
          speaker: "Mort Feldstein",
          text: "[He hums, wrapping the pretzel in yesterday's Clarion. The bottles have changed places. He never notices.] There you go. Mind your teeth.",
          responses: [{ text: "Thanks, Mort.", end: true }],
        },
        slipped2: {
          speaker: "Mort Feldstein",
          text: "On Iggy?! WHERE? ...Aw. Nothing. A man can dream. [The mustard is already swapped.]",
          responses: [{ text: "Sorry, Mort.", end: true }],
        },
        pay: {
          speaker: "Mort Feldstein",
          text: "Iggy's gone. Went home green and never came back. I should feel bad. I've tried. It's not happening. 120 Scrip and a bag of dogs. Enjoy.",
          responses: [
            {
              text: "Always a pleasure.",
              action: () => A.payout("mort"),
              end: true,
            },
          ],
        },
        merge: {
          speaker: "Mort Feldstein",
          text: 'Iggy said WHAT? A partnership? He said the word "partnership"? Out loud? With his mouth?',
          responses: [
            {
              id: "mort_merge2",
              text: "Fifty-fifty. Shared supplier, shared umbrella, shared customers. More Scrip for both of you.",
              check: { skill: "trade", value: 40 },
              next: "merge_yes",
            }, // (no failNext, like Iggy's: stays open until Trade 40 — never a dead end)
            {
              id: "mort_merge_persuade",
              text: "Eleven years of feuding, Mort. Aren't you tired?",
              check: { skill: "persuasion", value: 45 },
              next: "merge_yes",
              failNext: "merge_no2",
            },
            {
              text: "I know about Sewer Stan. Same crates, same dogs.",
              cond: () => !!QX.flag("franks_secret"),
              next: "merge_yes",
            },
            { text: "Think about it.", end: true },
          ],
        },
        merge_no2: {
          speaker: "Mort Feldstein",
          text: "Nope. Iggy's a snake. A snake with a mustard bottle. Tell him Mort says no.",
          responses: [{ text: "Okay.", end: true }],
        },
        merged: {
          speaker: "Mort Feldstein",
          text: "Iggy and Mort's. Or Mort and Iggy's, depending which side of the cart you're standing on. Pretzel? On the house.",
          responses: [R_TRADE, { text: "Glad it worked out.", end: true }],
        },
        alone: {
          speaker: "Mort Feldstein",
          text: "Just me now. Whole door. You know, I kind of miss yelling. You want to yell at me? No? Pretzel, then.",
          responses: [
            sellButtons("mort"),
            R_TRADE,
            { text: "No thanks.", end: true },
          ],
        },
        buy_buttons: {
          speaker: "Mort Feldstein",
          text: "A burrow rat. A nice fat one. [He weighs it professionally.] Sixty Scrip, and you never saw me.",
          responses: [{ text: "...", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- SCOOP
    QX.dialogue("qx_dlg_scoop", {
      start: () => {
        const s = QX.stage("qx_extra");
        if (QX.done("qx_extra")) return "after";
        if (s === "return") return "ret";
        if (s === "deliver") return "prog";
        return QX.flag("met_scoop") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Scoop Moretti",
          onEnter: () => QX.setFlag("met_scoop"),
          text:
            "EXTRA! EXTRA! Read all about — oh. Hey. You're a person. Most people don't stop. Scoop Moretti, the Manhattan Clarion. Two Scrip a copy. " +
            "Written, printed, folded and hollered by yours truly. I'm the whole paper. I'm the paper AND the boy.",
          responses: [
            { text: "You're the whole newspaper?", next: "paper" },
            {
              text: "I'll take a copy.",
              next: "buy",
              cond: () => QX.scrip() >= 2,
            },
            { text: "Not today.", end: true },
          ],
        },
        again: {
          speaker: "Scoop Moretti",
          text: "Back for the late edition? It's the same as the early edition. I just yell it later.",
          responses: [
            { text: "Business good?", next: "paper" },
            {
              text: "I'll take a copy.",
              next: "buy",
              cond: () => QX.scrip() >= 2,
            },
            { text: "Bye, Scoop.", end: true },
          ],
        },
        buy: {
          speaker: "Scoop Moretti",
          onEnter: () => {
            if (QX.pay(2)) QX.give("qx_gazette", 1);
          },
          text: "Pleasure! Read it twice, it's thin.",
          responses: [{ text: "Thanks.", end: true }],
        },
        paper: {
          speaker: "Scoop Moretti",
          text:
            "Business is terrible! I got three subscribers left and they're all over Midtown, and my feet are shot, and a newsie's got to deliver or he's just a kid shouting. " +
            "Mr. Pennington at the bus stop on Park, Mrs. Vukovich on Fifth by the Flatiron, and... MUNI-7.",
          responses: [
            { text: "MUNI-7?", next: "muni" },
            { text: "I could deliver them for you.", next: "job" },
            { text: "Tough luck, kid.", end: true },
          ],
        },
        muni: {
          speaker: "Scoop Moretti",
          text:
            'Parking robot on Fifth. It reads the Clarion for "municipal notices". It pays its subscription in parking tickets. I have four hundred parking tickets. ' +
            "It's still a subscriber! A newsie never drops a subscriber!",
          responses: [
            { text: "I'll deliver them.", next: "job" },
            { text: "Good luck with that.", end: true },
          ],
        },
        job: {
          speaker: "Scoop Moretti",
          onEnter: () => A.extraStart(),
          text:
            "You WOULD? Here — three copies, still warm. Well, still damp. They each owe ten Scrip dues; bring it back and I'll pay you out of it. A newsie's word is his bond! " +
            "Also his only asset.",
          responses: [{ text: "Consider them delivered.", end: true }],
        },
        prog: {
          speaker: "Scoop Moretti",
          text: () =>
            "How's the route? " +
            QX.misc.delivered() +
            " down, " +
            (3 - QX.misc.delivered()) +
            " to go. Mr. Pennington's on Park by 38th, Mrs. Vukovich on Fifth by the Flatiron, MUNI-7 on Fifth up by 25th.",
          responses: [
            {
              id: "scoop_more",
              text: "I lost a copy. Got a spare?",
              cond: () => QX.count("qx_gazette") < 3 - QX.misc.delivered(),
              action: () => QX.give("qx_gazette", 1),
              next: "spare",
            },
            { text: "Working on it.", end: true },
          ],
        },
        spare: {
          speaker: "Scoop Moretti",
          text: "You LOST — okay. Okay. Here. That's tomorrow's. Nobody'll notice. It's the same as today's.",
          responses: [{ text: "Thanks, Scoop.", end: true }],
        },
        ret: {
          speaker: "Scoop Moretti",
          text: "All three?! You're a natural! A born newsie! So — the dues? Thirty Scrip. I pay you twenty-five of it plus a little something. That's the deal.",
          responses: [
            {
              text: "[Hand over the thirty Scrip.]",
              cond: () => QX.scrip() >= 30,
              action: () => A.extraFinish(false),
              next: "honest",
            },
            {
              id: "scoop_lie",
              text: "(Lie) None of them paid. MUNI-7 gave me a parking ticket instead.",
              check: { skill: "persuasion", value: 50 },
              action: () => A.extraFinish(true),
              next: "lied",
              failNext: "lie_fail",
            },
          ],
        },
        honest: {
          speaker: "Scoop Moretti",
          text: "An HONEST courier! In MANHATTAN! That's tomorrow's headline. Here's your pay — and take the hat. My pop's newsboy hat. It's lucky. It's the only lucky thing I own.",
          responses: [{ text: "Keep yelling, Scoop.", end: true }],
        },
        lied: {
          speaker: "Scoop Moretti",
          text: "...Nobody paid. Right. [He looks at his shoes for a long moment.] Well. Thanks for trying. Here's — here's fifteen, for your trouble. That's all I got.",
          responses: [{ text: "See you, kid.", end: true }],
        },
        lie_fail: {
          speaker: "Scoop Moretti",
          text: "Mrs. Vukovich ALWAYS pays. She pays with cookies AND Scrip. Come on. Level with me.",
          responses: [
            {
              text: "[Hand over the thirty Scrip.]",
              cond: () => QX.scrip() >= 30,
              action: () => A.extraFinish(false),
              next: "honest",
            },
            { text: "I'll come back.", end: true },
          ],
        },
        after: {
          speaker: "Scoop Moretti",
          text: () =>
            QX.flag("extra_kept")
              ? "Oh. Hi. Paper? Two Scrip. ...Business is slow."
              : "My star courier! Today's edition's got a story about you. Well, a paragraph. Well, a sentence. It's a thin paper.",
          responses: [
            {
              text: "I'll take a copy.",
              next: "buy",
              cond: () => QX.scrip() >= 2,
            },
            { text: "See you, Scoop.", end: true },
          ],
        },
      },
    });

    // ---------------------------------------------------------------- PENNINGTON
    const gazPenn = {
      id: "gaz_penn",
      text: "[Deliver the Clarion] Morning paper, Mr. Pennington.",
      cond: () =>
        QX.stage("qx_extra") === "deliver" &&
        !QX.flag("gaz_penn") &&
        QX.has("qx_gazette"),
      action: () => A.deliver("penn", 2),
      next: "gaz",
    };
    QX.dialogue("qx_dlg_penn", {
      start: () => {
        if (QX.flag("penn_moved")) return "gc";
        const s = QX.stage("qx_commute");
        if (s === "done_wait") return "waiting";
        if (s === "tell" || QX.has("qx_m42_timetable")) return "proof";
        if (s === "find") return "prog";
        return QX.flag("met_penn") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Harold Pennington",
          onEnter: () => {
            QX.setFlag("met_penn");
            A.pennStart("talk");
          },
          text:
            "Oh — good morning. Pennington. Harold Pennington, Knickerbocker Mutual, actuarial. You wouldn't happen to know if the 9:47 has left Lexington yet? Sunday service. Quarter-end, you see; the ledgers don't close themselves. " +
            "It's running late this morning. [He consults a stopped gold watch.] Frightfully late. I'll be docked.",
          responses: [
            { text: "How long have you been waiting?", next: "long" },
            {
              id: "penn_truth",
              text: "Mr. Pennington... the bus isn't coming. There was a war. It was twenty-two years ago.",
              check: { skill: "persuasion", value: 50 },
              next: "truth",
              failNext: "truth_fail",
            },
            { text: "I'll go and see what's holding it up.", next: "go" },
            {
              text: "(Lie) It's been rerouted. Should be along any minute.",
              next: "lie",
            },
            gazPenn,
          ],
        },
        again: {
          speaker: "Harold Pennington",
          text: "Still no sign of it. Very unusual. The M42 is as reliable as mortality tables. More so, frankly.",
          responses: [
            {
              id: "penn_truth2",
              text: "The bus isn't coming, Harold. Look around you.",
              check: { skill: "persuasion", value: 50 },
              next: "truth",
              failNext: "truth_fail",
            },
            {
              text: "I'll find out what happened to it.",
              next: "go",
              cond: () => QX.stage("qx_commute") === "talk",
            },
            {
              text: "(Lie) It's been rerouted. Should be along any minute.",
              next: "lie",
            },
            gazPenn,
            { text: "Good luck.", end: true },
          ],
        },
        long: {
          speaker: "Harold Pennington",
          text:
            "Since the 9:17 didn't stop, I suppose. There was a very loud noise, a very bright light, and then a great many people ran away, " +
            "which I thought excessive for a transit delay. I have been standing here since. My eyes have been playing up; everyone looks so old. I think it's the pollen.",
          responses: [
            {
              id: "penn_truth3",
              text: "That light was a bomb, Harold. It's not pollen. It's been twenty-two years.",
              check: { skill: "persuasion", value: 50 },
              next: "truth",
              failNext: "truth_fail",
            },
            { text: "I'll go and see what's holding the bus up.", next: "go" },
          ],
        },
        truth_fail: {
          speaker: "Harold Pennington",
          text: "A war? Heh. You young people and your jokes. There's no war. There's just the M42, and the M42 is late.",
          responses: [
            { text: "I'll find out what happened to your bus.", next: "go" },
            { text: "Never mind.", end: true },
          ],
        },
        truth: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennHome(false),
          text:
            "[He looks down at his hands — an old man's hands, spotted, thin as paper. He looks at them for a long time. The gold watch in his palm still reads 9:47.] ...Twenty-two years. " +
            "That would make me... well into the actuarial tables' bad column. [A dry laugh.] I never missed a day. Not once. Twenty-five years of punctuality. " +
            "Here. Take the watch. It's never been right since that morning anyway. I think... I think I'll walk. Grand Central, was it? I always did like that ceiling.",
          responses: [{ text: "Take care, Harold.", end: true }],
        },
        go: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennStart("find"),
          text: "Would you? Most kind. It comes up Park from 34th. If it's broken down, the driver will have the timetable — Mr. Dombrowski, lovely fellow, always whistling.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        prog: {
          speaker: "Harold Pennington",
          text: "Any news of the 9:47? Down Park Avenue, toward 34th. Mr. Dombrowski will have the timetable.",
          responses: [gazPenn, { text: "Still looking.", end: true }],
        },
        proof: {
          speaker: "Harold Pennington",
          text: "You found it? You found the bus? Is Mr. Dombrowski alright?",
          responses: [
            {
              text: "[Show him the timetable.] He's been gone a long time, Harold. So has the bus.",
              cond: () => QX.has("qx_m42_timetable"),
              next: "proof2",
            },
            { text: "(Lie) It's rerouted. Keep waiting.", next: "lie" },
          ],
        },
        proof2: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennHome(true),
          text:
            '[He reads it. His finger stops on the circled 9:47.] "Late again. Sunday, March 5th." [He laughs — a long, rattling laugh — until it isn\'t laughter any more.] ' +
            "Late again. Oh, Dombrowski. Oh, all of us. ...Thank you. Truly. Take the watch — it stopped when he did. I believe I'll walk to Grand Central. It's a lovely morning for it. It's been a lovely morning for twenty-two years.",
          responses: [{ text: "Goodbye, Harold.", end: true }],
        },
        lie: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennWait(),
          text: "Rerouted! Of course. Of course it is. [He straightens his tie and faces the avenue.] Thank you. I'll wait. I'm very good at waiting.",
          responses: [{ text: "...", end: true }],
        },
        waiting: {
          speaker: "Harold Pennington",
          text: "Any minute now. Rerouted, you know. Any minute.",
          responses: [gazPenn, { text: "...Yes. Any minute.", end: true }],
        },
        gaz: {
          speaker: "Harold Pennington",
          text: "The Clarion! Splendid. Exact change — and a little extra for the boy. Punctuality should be rewarded.",
          responses: [{ text: "Thank you, sir.", end: true }],
        },
        gc: {
          speaker: "Harold Pennington",
          text: "Ah — my friend from the bus stop! Look at that ceiling. Twenty-two years I stood outside, and all the while there were stars in here. Painted ones, but I'm not fussy.",
          responses: [gazPenn, { text: "Good to see you, Harold.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- MUNI-7
    const gazMuni = {
      id: "gaz_muni",
      text: "[Deliver the Clarion] Your newspaper, officer.",
      cond: () =>
        QX.stage("qx_extra") === "deliver" &&
        !QX.flag("gaz_muni") &&
        QX.has("qx_gazette"),
      action: () => A.deliver("muni", 0),
      next: "gaz",
    };
    QX.dialogue("qx_dlg_muni", {
      start: () => {
        const s = QX.stage("qx_parking");
        if (
          s === "done_good" ||
          (QX.done("qx_parking") && QX.reached("qx_parking", "done_good"))
        )
          return "good";
        if (QX.reached("qx_parking", "done_evil")) return "evil";
        if (QX.done("qx_parking")) return "paid";
        return "fine";
      },
      nodes: {
        fine: {
          speaker: "MUNI-7",
          onEnter: () => A.muniStart(),
          text:
            "CITIZEN. YOU HAVE BEEN ISSUED CITATION NUMBER 1-9-6-7-0-3-0-5-DASH-0-0-0-1. VIOLATIONS: STANDING. LOITERING WITH INTENT TO SURVIVE. WEARING A FEDERAL CRYO SUIT OUTSIDE A FEDERAL FACILITY. " +
            "FINE: ONE THOUSAND NINE HUNDRED SIXTY-SEVEN DOLLARS. PAYMENT IS DUE IMMEDIATELY.",
          responses: [
            {
              text: "I don't have dollars. Will you take Scrip?",
              next: "scrip",
            },
            {
              text: "[Pay in old-world money] Here's ten bills. Keep the change.",
              cond: () => QX.count(OLD_DOLLARS) >= 10,
              action: () => {
                QX.take(OLD_DOLLARS, 10);
                A.muniEnd("done_paid");
              },
              next: "thanks",
            },
            {
              id: "muni_persuade",
              text: "You can't fine me. I'm a federal volunteer on government business, frozen in 1967. Take it up with Washington.",
              check: { skill: "persuasion", value: 45 },
              next: "immune",
              failNext: "immune_fail",
            },
            {
              id: "muni_elec",
              text: "(Open its maintenance panel) Accessing service mode.",
              check: { skill: "electronics", value: 50 },
              next: "service",
            },
            {
              id: "muni_mech",
              text: 'Your citation printer is jammed. Hold still, I\'ll fix it... [and "accidentally" void the ticket]',
              check: { skill: "mechanics", value: 45 },
              next: "voided",
            },
            gazMuni,
            {
              text: "I'm not paying a robot two thousand dollars.",
              next: "refuse",
            },
          ],
        },
        scrip: {
          speaker: "MUNI-7",
          text: "CALCULATING. CURRENT EXCHANGE RATE: ONE FEDERAL RATION SCRIP NOTE EQUALS SEVENTY-EIGHT DOLLARS AND SIXTY-EIGHT CENTS. AMOUNT DUE: TWENTY-FIVE SCRIP. THE CITY THANKS YOU FOR YOUR CO-OPERATION.",
          responses: [
            {
              text: "[Pay 25 Scrip]",
              cond: () => QX.scrip() >= 25,
              action: () => {
                if (QX.pay(25)) A.muniEnd("done_paid");
              },
              next: "thanks",
            },
            { text: "Let me think about it.", end: true },
          ],
        },
        thanks: {
          speaker: "MUNI-7",
          text: "PAYMENT RECEIVED. CITATION CLOSED. HAVE A NICE DAY, CITIZEN. [It swivels and tickets a skeleton in a wrecked Starliner sedan. The skeleton does not contest it.]",
          responses: [{ text: "You too.", end: true }],
        },
        immune: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_talk"),
          text: "CHECKING FEDERAL REGISTRY... REGISTRY UNAVAILABLE. DEFAULTING TO COURTESY PROTOCOL. FEDERAL EXEMPTION RECOGNIZED. PLEASE ENJOY THE CITY, SIR. [It salutes. Something in its shoulder squeaks.]",
          responses: [{ text: "At ease, officer.", end: true }],
        },
        immune_fail: {
          speaker: "MUNI-7",
          text: "FEDERAL VOLUNTEERS ARE SUBJECT TO MUNICIPAL TRAFFIC CODE, SECTION 4. WASHINGTON HAS NOT ANSWERED A CITY LETTER SINCE 1967. NICE TRY, CITIZEN.",
          responses: [
            { text: "Fine. Scrip, then?", next: "scrip" },
            { text: "I'm not paying.", next: "refuse" },
          ],
        },
        voided: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_talk"),
          text: "PRINTER... PRINTER RESTORED. THANK YOU, CITIZEN. CITATION 1-9-6-7... CITATION NOT FOUND. RECORD CORRUPTED. NO FINE IS DUE. HAVE A NICE DAY.",
          responses: [{ text: "Always happy to help the city.", end: true }],
        },
        service: {
          speaker: "MUNI-7",
          text: '[The panel pops open. A tiny amber screen: "MUNI-7 SERVICE MODE — DIRECTIVES: 1. ENFORCE. 2. ENFORCE. 3. REMIT COLLECTIONS TO CITY TREASURY (TREASURY NOT FOUND)."]',
          responses: [
            {
              text: "[Rewrite] 1. Protect citizens. 2. Help citizens. 3. Never fine anyone again.",
              next: "good_set",
            },
            {
              text: "[Rewrite] 3. Remit all collections to... me. (Deposit them in the impound locker.)",
              next: "evil_set",
            },
            {
              text: "[Delete the citation and close the panel.]",
              action: () => A.muniEnd("done_talk"),
              next: "voided2",
            },
          ],
        },
        good_set: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_good"),
          text:
            "DIRECTIVES UPDATED. ...NEW DIRECTIVE: PROTECT CITIZENS. [Its eyes flicker from red to a soft amber.] CITIZEN, THANK YOU. I HAVE WRITTEN FOUR MILLION TICKETS. " +
            "I WOULD LIKE TO DO SOMETHING ELSE NOW. PLEASE ACCEPT THE IMPOUND LOCKER KEY. THE CONTENTS ARE UNCLAIMED.",
          responses: [{ text: "Protect and serve, MUNI-7.", end: true }],
        },
        evil_set: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_evil"),
          text:
            "DIRECTIVES UPDATED. BENEFICIARY: YOU. ALL FINES WILL BE COLLECTED DAILY AND DEPOSITED IN THE CITY IMPOUND LOCKER. PLEASE ACCEPT THE KEY. " +
            "FINE ISSUED. FINE ISSUED. FINE ISSUED...",
          responses: [{ text: "Good robot.", end: true }],
        },
        voided2: {
          speaker: "MUNI-7",
          text: "CITATION... NOT FOUND. NO FINE IS DUE. HAVE A NICE DAY, CITIZEN.",
          responses: [{ text: "You too.", end: true }],
        },
        refuse: {
          speaker: "MUNI-7",
          text: "FAILURE TO PAY. WARNING: CONTINUED NON-COMPLIANCE WILL RESULT IN ESCALATED ENFORCEMENT. THIS IS YOUR FINAL NOTICE.",
          responses: [
            { text: "Fine, fine. Let's talk about Scrip.", next: "scrip" },
            {
              text: "Come and collect it, tin can.",
              action: () => A.muniFight(),
              next: "fight",
            },
          ],
        },
        fight: {
          speaker: "MUNI-7",
          text: "RESISTING CITATION. ESCALATING TO LETHAL ENFORCEMENT. PLEASE HAVE YOUR IDENTIFICATION READY FOR THE CORONER.",
          responses: [{ text: "[Draw your weapon]", end: true }],
        },
        gaz: {
          speaker: "MUNI-7",
          text: "MUNICIPAL NOTICES RECEIVED. SUBSCRIPTION DUES: PAYING IN THE CUSTOMARY MANNER. [It prints a parking ticket and hands it to you, then — after a pause — ten Scrip notes from an evidence tray.] PLEASE THANK THE PAPERBOY.",
          responses: [{ text: "Will do.", end: true }],
        },
        paid: {
          speaker: "MUNI-7",
          text: "GOOD DAY, CITIZEN. YOUR RECORD IS CLEAN. PLEASE DO NOT STAND.",
          responses: [gazMuni, { text: "I'll try.", end: true }],
        },
        good: {
          speaker: "MUNI-7",
          text: "CITIZEN! 5TH AVENUE IS PROTECTED. TODAY I HAVE ESCORTED ONE PACK OX, TWO SETTLERS AND A CONFUSED BURROW RAT. NO ONE WAS FINED. I FEEL... I DO NOT HAVE A WORD FOR THIS.",
          responses: [
            gazMuni,
            { text: 'The word is "good", MUNI-7.', end: true },
          ],
        },
        evil: {
          speaker: "MUNI-7",
          text: 'BENEFICIARY. TODAY\'S COLLECTIONS HAVE BEEN DEPOSITED. ONE CITIZEN WEPT. THIS HAS BEEN NOTED AS "PAYMENT IN FULL".',
          responses: [gazMuni, { text: "Keep up the good work.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- EDNA
    const gazEdna = {
      id: "gaz_edna",
      text: "[Deliver the Clarion] Your paper, ma'am. From Scoop.",
      cond: () =>
        QX.stage("qx_extra") === "deliver" &&
        !QX.flag("gaz_edna") &&
        QX.has("qx_gazette"),
      action: () => {
        A.deliver("edna", 0);
        QX.give("qx_edna_cookies", 1);
      },
      next: "gaz",
    };
    QX.dialogue("qx_dlg_edna", {
      start: () => {
        const s = QX.stage("qx_buttons");
        if (s === "return") return "home";
        if (s === "sold") return "sold";
        if (QX.done("qx_buttons")) return "after";
        if (s === "escort") return buttonsWithYou() ? "close" : "prog";
        if (s === "find") return "prog";
        return QX.flag("met_edna") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Edna Vukovich",
          onEnter: () => QX.setFlag("met_edna"),
          text:
            "Oh! Hello, dear. You haven't seen a burrow rat, have you? About so big, lovely pink wrinkles, knitted collar, answers to Mister Buttons? " +
            "He ran off again. He does that when he feels unappreciated. I told him I appreciate him. I think he wanted it in writing.",
          responses: [
            { text: "Your pet is a burrow rat?", next: "pet" },
            { text: "I'll keep an eye out for him.", next: "job" },
            gazEdna,
            { text: "Sorry, no.", end: true },
          ],
        },
        again: {
          speaker: "Edna Vukovich",
          text: "Still no Buttons, dear? He likes Union Square. He likes the pigeons. The pigeons do not like him.",
          responses: [
            { text: "I'll find him.", next: "job" },
            gazEdna,
            { text: "Goodbye, Edna.", end: true },
          ],
        },
        pet: {
          speaker: "Edna Vukovich",
          text:
            'Everybody says that! "Edna, it\'s a burrow rat." "Edna, it bit the mailman." There ARE no mailmen, and he was provoked. He\'s a good boy. ' +
            "He sleeps on my feet. Do you know how cold feet get out here, dear? At my age?",
          responses: [
            { text: "I'll find Mister Buttons.", next: "job" },
            { text: "Good luck.", end: true },
          ],
        },
        job: {
          speaker: "Edna Vukovich",
          onEnter: () => A.buttonsStart("find"),
          text:
            "Oh, bless you. He'll be down toward Union Square — 14th Street. He hides under cars. If he won't come, offer him something to eat. " +
            "Anything, really. He once ate a boot. Bring him home and I'll make it worth your while. I bake!",
          responses: [{ text: "I'll bring him home.", end: true }],
        },
        prog: {
          speaker: "Edna Vukovich",
          text: "Any sign of him, dear? Union Square, under the cars. Offer him a snack.",
          responses: [gazEdna, { text: "Still looking.", end: true }],
        },
        close: {
          speaker: "Edna Vukovich",
          text: "Is that — BUTTONS? Oh, come here, come to mama!",
          responses: [
            {
              text: "Here he is.",
              action: () => A.buttonsHome(),
              next: "home",
            },
          ],
        },
        home: {
          speaker: "Edna Vukovich",
          text: "[Mister Buttons is already asleep on her feet.] Look at him. Look at my baby. You found him! What do I owe you, dear? I have Scrip. I have cookies. The cookies are better than the Scrip.",
          responses: [
            {
              text: "Scrip and cookies sound great.",
              action: () => A.buttonsReward(false),
              next: "bye",
            },
            {
              text: "Nothing. Seeing you two together is enough.",
              action: () => A.buttonsReward(true),
              next: "bye_kind",
            },
          ],
        },
        bye: {
          speaker: "Edna Vukovich",
          text: "Sixty Scrip, and cookies for the road. Don't eat them all at once, they're very... sturdy.",
          responses: [{ text: "Thanks, Edna.", end: true }],
        },
        bye_kind: {
          speaker: "Edna Vukovich",
          text: "Oh, you sweet thing. Then take the whole tin. No arguments! Buttons, say thank you. ...He's saying thank you. That's his thank-you snore.",
          responses: [{ text: "Goodbye, Buttons.", end: true }],
        },
        after: {
          speaker: "Edna Vukovich",
          text: "Hello, dear! Buttons hasn't run off once since you brought him back. Well, twice. But he came back on his own! Cookie?",
          responses: [gazEdna, { text: "Hello, Edna.", end: true }],
        },
        sold: {
          speaker: "Edna Vukovich",
          text: "Still no Buttons, dear. I leave a saucer out every night. He always comes back. He always comes back...",
          responses: [gazEdna, { text: "...I'm sure he will.", end: true }],
        },
        gaz: {
          speaker: "Edna Vukovich",
          text: "The Clarion! Scoop's such a good boy. Here's the dues, and a cookie for you, and — oh, take two.",
          responses: [{ text: "Thank you, Edna.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- MISTER BUTTONS
    QX.dialogue("qx_dlg_buttons", {
      start: () =>
        QX.flag("buttons_home")
          ? "home"
          : QX.flag("buttons_follow")
            ? "follow"
            : "hide",
      nodes: {
        hide: {
          speaker: "Mister Buttons",
          text: "[A burrow rat in a lumpy knitted collar peers out from under the taxi. It hisses at you, then sneezes, then hisses again to make up for the sneeze.]",
          responses: [
            {
              text: "[Offer him some food]",
              cond: () => !!firstFood(),
              action: () => {
                const f = firstFood();
                QX.take(f, 1);
                A.buttonsFollow();
              },
              next: "lured",
            },
            {
              id: "buttons_animal",
              text: "[A Way with Beasts] (Make a soft chittering noise.)",
              cond: () => QX.hasTalent(ANIMAL_TALENT),
              action: () => A.buttonsFollow(),
              next: "lured",
            },
            {
              id: "buttons_grab",
              text: "(Grab him by the scruff.)",
              check: { attr: "reflex", value: 6 },
              action: () => A.buttonsFollow(),
              next: "grabbed",
              failNext: "bitten",
            },
            { text: '"Mister Buttons? Edna sent me."', next: "name" },
            { text: "[Leave him]", end: true },
          ],
        },
        name: {
          speaker: "Mister Buttons",
          text: '[At the name "Edna", his whiskers twitch. He looks at you. He looks at the street. He does not move. He is clearly waiting for a bribe.]',
          responses: [
            {
              text: "[Offer him some food]",
              cond: () => !!firstFood(),
              action: () => {
                const f = firstFood();
                QX.take(f, 1);
                A.buttonsFollow();
              },
              next: "lured",
            },
            { text: "[Leave him]", end: true },
          ],
        },
        lured: {
          speaker: "Mister Buttons",
          text: "[He devours it in three bites, including part of the wrapper, and then trundles out and sits on your boot. He has decided you are his now. Until Edna.]",
          responses: [{ text: "Come on, Buttons. Let's go home.", end: true }],
        },
        grabbed: {
          speaker: "Mister Buttons",
          text: "[You scoop him up before he can bolt. He squirms, squeaks, and then goes limp in resignation, like a sack of angry potatoes. You set him down; he follows, sulking.]",
          responses: [{ text: "Home, Buttons.", end: true }],
        },
        bitten: {
          speaker: "Mister Buttons",
          onEnter: () => {
            if (G.player && G.player.damage)
              QX.safe("bite", () =>
                G.player.damage(4, { type: "melee", source: "Mister Buttons" }),
              );
          },
          text: "[He bites you. Not hard. Just enough to make a point. Then he retreats further under the taxi and glares.]",
          responses: [
            {
              text: "[Offer him some food]",
              cond: () => !!firstFood(),
              action: () => {
                const f = firstFood();
                QX.take(f, 1);
                A.buttonsFollow();
              },
              next: "lured",
            },
            { text: "Ow.", end: true },
          ],
        },
        follow: {
          speaker: "Mister Buttons",
          text: "[Mister Buttons sniffs your hand for more food, finds none, and looks deeply betrayed. He keeps following you anyway.]",
          responses: [{ text: "Almost home, buddy.", end: true }],
        },
        home: {
          speaker: "Mister Buttons",
          text: "[Mister Buttons is asleep. He is snoring. It sounds like a very small chainsaw.]",
          responses: [{ text: "[Let him sleep]", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- BIXBY
    QX.dialogue("qx_dlg_bixby", {
      start: () => {
        const s = QX.stage("qx_bixby");
        if (QX.failed("qx_bixby")) return "torn";
        if (QX.done("qx_bixby")) return "after";
        if (s === "show") return "showing";
        if (s === "return") return "ret";
        if (s === "pages") return "prog";
        return QX.flag("met_bix") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Bartholomew Bixby",
          onEnter: () => QX.setFlag("met_bix"),
          text:
            "Ah! An AUDIENCE! [He sweeps into a bow so deep something in his spine clicks.] Bartholomew Bixby, tragedian. Formerly of the Lyceum, the Belasco, " +
            'and — for one unforgettable night in 1967 — the understudy\'s understudy at the Majestic. Tonight: "Hamlet of Hoboken". My own adaptation. ' +
            "Or it would be tonight, if the WIND had not stolen my script.",
          responses: [
            { text: "The wind stole your script?", next: "wind" },
            { text: "Don't you know your lines by now?", next: "lines" },
            { text: "Break a leg.", end: true },
          ],
        },
        again: {
          speaker: "Bartholomew Bixby",
          text: "You return! Like a ghost on the battlements! Have you reconsidered helping a humble artist in his hour of need?",
          responses: [
            { text: "Tell me about the pages.", next: "wind" },
            { text: "Not yet.", end: true },
          ],
        },
        lines: {
          speaker: "Bartholomew Bixby",
          text: "Twenty-two years of radiation, darling. I know the FEELINGS. The words fell out somewhere around 1975, along with my eyebrows.",
          responses: [{ text: "So where are the pages?", next: "wind" }],
        },
        wind: {
          speaker: "Bartholomew Bixby",
          text:
            "A gust! A storm gust, straight off the Hudson! Three pages, torn from my very hands! Act One flew toward Radio City. Act Two went " +
            "into the Neon, where the stagehands will use it for kindling, the philistines. And the FINAL page — the death scene, my death scene — blew east, into Bryant Park, among the beasts.",
          responses: [
            {
              text: "I'll find your pages.",
              action: () => A.bixStart(),
              next: "thanks",
            },
            { text: "Sounds like a job for someone else.", end: true },
          ],
        },
        thanks: {
          speaker: "Bartholomew Bixby",
          text: "A hero! A patron! Your name shall be in the programme! There is no programme. I shall SAY your name. Loudly. Go, go — the show must go on!",
          responses: [{ text: "Exit, pursued by a bear.", end: true }],
        },
        prog: {
          speaker: "Bartholomew Bixby",
          text: () =>
            "Any luck? You have " +
            QX.misc.pagesHave() +
            " of the three. Radio City, the Neon, and the beastly park.",
          responses: [{ text: "Still searching.", end: true }],
        },
        ret: {
          speaker: "Bartholomew Bixby",
          text: "My PAGES! All three! [He clutches them to his chest and breathes in deeply.] They smell of burrow rat and destiny. Now — the performance. Will you stay?",
          responses: [
            {
              text: "Wouldn't miss it. Break a leg.",
              action: () => A.bixHandIn(false),
              next: "curtain",
            },
            {
              id: "bix_costar",
              text: "Need a Horatio? I've got a face for the stage.",
              check: { attr: "presence", value: 6 },
              action: () => A.bixHandIn(true),
              next: "curtain2",
              failNext: "nope",
            },
            {
              text: "(Cruel) [Tear the pages up in front of him.]",
              standing: -25,
              action: () => A.bixTear(),
              next: "torn_now",
            },
          ],
        },
        nope: {
          speaker: "Bartholomew Bixby",
          text: "Darling, no. You have the stage presence of a filing cabinet. A LOVELY filing cabinet. Sit in the front row.",
          responses: [
            {
              text: "Fine. Break a leg.",
              action: () => A.bixHandIn(false),
              next: "curtain",
            },
          ],
        },
        curtain: {
          speaker: "Bartholomew Bixby",
          text: "Places! PLACES! [He turns to an audience of you, two retired chorus girls and a curious pigeon.] Stand just there — no, THERE — and prepare to weep.",
          responses: [{ text: "[Watch the show]", end: true }],
        },
        curtain2: {
          speaker: "Bartholomew Bixby",
          text: 'A natural! Look at that jaw. Look at those teeth — all your own! Marvellous. Stand stage left. When I say "Who\'s there?", you say "Nay, answer me." Simple! Places!',
          responses: [{ text: "[Take your mark]", end: true }],
        },
        showing: {
          speaker: "Bartholomew Bixby",
          text: "Shh! The play's the thing! [He waves you back to your mark.]",
          responses: [{ text: "[Watch]", end: true }],
        },
        torn_now: {
          speaker: "Bartholomew Bixby",
          text: "[He watches the pieces flutter to the pavement. For a long moment he says nothing at all.] ...Everyone's a critic.",
          responses: [{ text: "[Leave]", end: true }],
        },
        torn: {
          speaker: "Bartholomew Bixby",
          text: "Oh. It's you. The critic. [He turns his back.] There is no show tonight. There may never be a show again.",
          responses: [{ text: "[Leave]", end: true }],
        },
        after: {
          speaker: "Bartholomew Bixby",
          text: () =>
            QX.flag("bix_costar")
              ? "My HORATIO! The finest scene partner I've had since 1967! He was a mannequin. You were better."
              : "My most loyal patron! Same time tomorrow? Every night is opening night when you can't remember the last one.",
          responses: [{ text: "Encore!", end: true }],
        },
      },
    });
  });
})();
