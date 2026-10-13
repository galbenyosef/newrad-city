// play-inline-551 02 — stock
// Lines 362-674 of readable/play-inline-551.pretty.js (statement-aligned).
  L.hook("init", function () {
    if (L.ms) L.ms.galleryMemory = galleryMemory;
  });
  L.trigger({
    id: "gc_gallery",
    once: false,
    cooldown: 4,
    r: 4,
    pos: () =>
      L.anchor("grand_central", ["whispering_gallery", "oyster_bar", "bar"], {
        x: 222,
        z: -232,
      }),
    cond: () => !L.flag("ms_gallery_memory") && Q.isStarted("mq02"),
    fire() {
      galleryMemory();
    },
  });
  L.trigger({
    id: "rc_arrive",
    x: RC.x,
    z: RC.z,
    r: 40,
    cond: () => Q.stage("mq03") === "rocky",
    fire() {
      L.say(
        "rc_rocky",
        "Is that a cryo suit? In MY lobby? Somebody get the Popsicle a microphone!",
      );
    },
  });

  G.events.on("itemAdded", (id) => {
    if (id === "q_signal_amplifier") {
      L.setFlag("got_amp_chrysler");
      if (Q.stage("mq03") === "amp" || Q.stage("mq03") === "rocky")
        Q.setStage("mq03", "deliver");
    }
  });

  // ------------------------------------------------------------------
  // World: terminals, notes, the amplifier
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const t1 = L.anchor(
      "grand_central",
      ["stationmaster_terminal", "mayor_terminal", "office"],
      { x: GC.x + 22, z: GC.z - 6 },
    );
    if (t1) L.spawnTerminal("gc_stationmaster", t1, Math.PI);
    const t2 = L.anchor(
      "radio_city",
      ["terminal", "console", "radio_dj_terminal"],
      { x: RC.x + 4, z: RC.z + 3 },
    );
    if (t2) L.spawnTerminal("rc_console", t2, 0);
  });
  L.hook("spawn", function () {
    // The Chrysler amplifier (MQ03) — guarded by raiders (combat populates the Chrysler).
    const amp = L.anchor("chrysler", ["amplifier", "loot2", "loot1", "boss"], {
      x: 309,
      z: -186,
    });
    if (amp && !L.has("q_signal_amplifier") && !L.flag("amp_delivered"))
      L.pickup("amp", "q_signal_amplifier", 1, amp);
    // Market rules notice
    const board = L.anchor(
      "grand_central",
      ["notice_board", "entrance", "door"],
      { x: GC.x - 4, z: GC.z + 20 },
    );
    if (board)
      L.pickup("market_rules", "q_note_market_rules", 1, {
        x: board.x + 0.8,
        y: board.y,
        z: board.z,
      });

    // ---- Grand Central Market NPCs ----
    L.spawnNPC({
      id: "gc_delphine",
      type: "human",
      name: "Stationmaster Delphine Okafor",
      outfit: "settler",
      gender: "f",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 3,
      at: gcSpot(["stationmaster", "mayor", "leader"], 24, -7),
      dialogue: "dlg_gc_delphine",
      essential: true,
      weapon: ["hunting_rifle"],
      level: 8,
      skinTone: 0.75,
      barks: [
        "Keep it moving, keep it civil.",
        "Scrip only. No teeth, no promises.",
        "Clock's broken. Has been since '67. Don't ask.",
      ],
    });
    L.spawnNPC({
      id: "gc_moe",
      type: "human",
      name: "Moe Kessler",
      outfit: "merchant",
      gender: "m",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: gcSpot(["bar", "oyster_bar", "merchant2"], -14, -8),
      dialogue: "dlg_gc_moe",
      essential: true,
      merchant: { scrip: 350, stock: STOCK.bar, restock: 3 },
      barks: ["Oyster Bar's open. Oysters ain't.", "Tunnel shrimp! Fresh-ish!"],
    });
    // The info booth is a closed kiosk: INFO-BOT stands at its south counter, facing the concourse (inside it,
    // nobody could see or talk to him).
    const booth = L.anchor("grand_central", ["info_booth", "clock", "center"], {
      x: GC.x,
      z: GC.z,
    });
    const botAt = booth
      ? L.freeSpot(booth.x, booth.z + 3.3, booth.y, { maxR: 3 })
      : null;
    L.spawnNPC({
      id: "gc_infobot",
      type: "patrolman",
      name: "INFO-BOT",
      faction: "settlers",
      ai: "static",
      at:
        botAt && !botAt.forced
          ? undefined
          : gcSpot(["info_booth", "clock", "center"], 0, 0),
      pos: botAt && !botAt.forced ? botAt : undefined,
      lookYaw: Math.PI,
      dialogue: "dlg_gc_infobot",
      essential: true,
      merchant: { scrip: 120, stock: STOCK.infobot },
      barks: [
        "INFORMATION! NOW ONLY SLIGHTLY OUTDATED!",
        "THE 8:15 TO POUGHKEEPSIE IS DELAYED. DELAY: TWENTY-TWO YEARS.",
        "PLEASE DO NOT FEED THE INFO-BOT.",
      ],
      voice: "robot",
    });
    {
      const b = L.npc("gc_infobot");
      if (
        b &&
        booth &&
        botAt &&
        !botAt.forced &&
        Math.hypot(b.pos.x - booth.x, b.pos.z - booth.z) < 2.4
      ) {
        b.pos.set(botAt.x, botAt.y, botAt.z);
        b.yaw = Math.PI;
      }
    } // older saves: step out of the kiosk
    L.spawnNPC({
      id: "gc_doc",
      type: "human",
      name: "Doc Hollis",
      outfit: "doctor",
      gender: "m",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: gcSpot(["doctor", "clinic", "merchant3"], 13, -8),
      dialogue: "dlg_gc_doc",
      essential: true,
      merchant: { scrip: 300, stock: STOCK.doctor, restock: 3 },
      barks: ["Next patient!", "If it's glowing, I charge extra."],
      hair: "bald",
    });
    L.spawnNPC({
      id: "gc_rosa",
      type: "human",
      name: 'Rosa "Two-Guns" Marquez',
      outfit: "merchant",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: gcSpot(["merchant4", "guns", "stall1"], -12, 9),
      dialogue: "dlg_gc_rosa",
      essential: true,
      weapon: ["pistol_10mm"],
      merchant: { scrip: 600, stock: STOCK.guns, restock: 3 },
      barks: [
        "Guns, ammo, questionable advice!",
        "You break it, you bought it. You shoot it, you REALLY bought it.",
      ],
      skinTone: 0.45,
    });
    L.spawnNPC({
      id: "gc_guard_kowalski",
      type: "human",
      name: "Guard Kowalski",
      outfit: "combat_armor",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      at: gcSpot(["guard1", "entrance"], -6, 30),
      dialogue: "dlg_gc_guard",
      weapon: ["assault_rifle", "hunting_rifle"],
      level: 7,
      barks: [
        "Market's safe. Street ain't.",
        "Eyes up. Something's been sniping on 42nd.",
      ],
    });
    L.spawnNPC({
      id: "gc_guard_ng",
      type: "human",
      name: "Guard Ng",
      outfit: "leather_armor",
      gender: "f",
      faction: "settlers",
      ai: "patrol",
      home: "here",
      homeR: 12,
      at: gcSpot(["guard2", "spawn2"], 10, 22),
      dialogue: "dlg_gc_guard",
      weapon: ["smg_10mm", "pistol_10mm"],
      level: 6,
      barks: [
        "No trouble, now.",
        "Hands where I can see 'em. Local or stranger, same rule.",
      ],
    });

    L.spawnNPC({
      id: "gc_water",
      type: "human",
      name: "Aqua Al",
      outfit: "settler",
      gender: "m",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: gcSpot(["vendor_water", "merchant2"], -7, 19),
      dialogue: "dlg_gc_vendor",
      merchant: { scrip: 150, stock: STOCK.water, restock: 2 },
      barks: [
        "Water! Clean water! Only slightly haunted!",
        "Purified! Filtered! Blessed by nobody!",
      ],
      skinTone: 0.8,
    });
    L.spawnNPC({
      id: "gc_junk",
      type: "human",
      name: "Scrapper Sue",
      outfit: "drifter",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: gcSpot(["vendor_junk", "merchant3"], 7, 19),
      dialogue: "dlg_gc_vendor",
      merchant: { scrip: 250, stock: STOCK.junk, restock: 2 },
      barks: [
        "One settler's junk is another settler's slightly different junk.",
        "Tin cans! Get your tin cans!",
      ],
    });

    // ---- Radio City ----
    L.spawnNPC({
      id: "rc_rocky",
      type: "human",
      name: '"Rocky" Delgado',
      outfit: "dj",
      gender: "m",
      faction: "settlers",
      ai: "sit",
      home: "here",
      at: rcSpot(["radio_dj", "dj", "booth"], 0, 4),
      dialogue: "dlg_rc_rocky",
      essential: true,
      hair: "slick",
      barks: [
        "Tell your friends! Tell your enemies! Tell the guy who owes you scrip!",
        "Radio Free Manhattan — knocked down in '67, up before the count!",
      ],
      voice: "m_radio",
    });
    L.spawnNPC({
      id: "rc_rockette",
      type: "valet",
      name: "ROCKETTE-7",
      faction: "settlers",
      ai: "wander",
      home: "here",
      homeR: 6,
      at: rcSpot(["stage", "lobby", "spawn1"], -6, 6),
      dialogue: "dlg_rc_rockette",
      essential: true,
      barks: [
        "FIVE, SIX, SEVEN, EIGHT! KICK!",
        "THE SHOW MUST GO ON. THE SHOW HAS BEEN GOING ON SINCE 1967.",
        "JAZZ HANDS! BOTH OF THEM!",
      ],
      voice: "robot",
    });
  });

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
