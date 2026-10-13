// play-inline-413 05 — ctx
// Lines 1448-1793 of readable/play-inline-413.pretty.js (statement-aligned).
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  const SOCIETY = [
    "pf3_lorenzo",
    "pf3_anton",
    "pf3_hock",
    "pf3_dm_d1",
    "pf3_dm_d2",
    "pf3_dm_d3",
    "pf3_dm_d4",
    "pf3_dm_d5",
    "pf3_dm_waiter",
  ];
  function spawn(ctx) {
    const A = ctx.anchors,
      S = PV;
    const stock = K.stock(
      [
        ["pf3_dm_newberg", 4],
        ["pf3_dm_alaska", 3],
        ["pf3_dm_benedict", 5],
        ["wine", 4],
        ["scotch", 2],
        ["whiskey", 2],
        ["purified_water", 4],
      ],
      "merchant_food",
      4,
    );
    if (S.flag("dm_member")) stock.push(["pf3_dm_steak", 3]);
    PV.spawnActor(ctx, {
      id: "pf3_lorenzo",
      type: "human",
      gender: "m",
      outfit: "dj",
      hair: "slick",
      beard: "moustache",
      name: "Lorenzo Delmonico",
      faction: "settlers",
      level: 8,
      pos: v(A.maitre),
      yaw: A.maitre.yaw || 0,
      ai: "merchant",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_lorenzo",
      merchant: { scrip: 600, stock, restock: 2, priceMult: 1.4 },
      barks: [
        "Welcome to Delmonico's.",
        "Your table will be ready momentarily.",
        "Jackets are, regrettably, no longer required.",
        "The Chef's special is for members only.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pf3_anton",
      type: "human",
      gender: "m",
      outfit: "lab_coat",
      hair: "short",
      name: "Chef Bastien",
      faction: "settlers",
      level: 10,
      pos: v(A.chef),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 2.5,
      dialogue: "pf3_dlg_anton",
      inventory: [["pf3_dm_key", 1]],
      weapon: K.itemExists("combat_knife") ? "combat_knife" : undefined,
      barks: [
        "Mise en place!",
        "The sauce is everything.",
        "More salt. Always more salt.",
        "Hock! The Colonel wants the rib.",
      ],
    });
    if (!S.flag("dm_hock_dead"))
      PV.spawnActor(ctx, {
        id: "pf3_hock",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "bald",
        beard: "full",
        name: "Hock",
        faction: "settlers",
        level: 11,
        hp: 220,
        scale: 1.12,
        pos: v(A.hock),
        yaw: 0,
        ai: "guard",
        home: "here",
        homeR: 3,
        inventory: [["pf3_dm_key", 1]],
        noRespawn: true,
        weapon: K.itemExists("hunting_knife")
          ? "hunting_knife"
          : K.itemExists("combat_knife")
            ? "combat_knife"
            : undefined,
        barks: [
          "...",
          "Heavy one today.",
          "Chef says the rib.",
          "[humming a lullaby, off-key]",
        ],
        onDeath: () => S.setFlag("dm_hock_dead", true),
      });
    const diners = [
      ["pf3_dm_d1", "Mrs. Van Duyn", "f"],
      ["pf3_dm_d2", "The Judge", "m"],
      ["pf3_dm_d3", "Colonel Whitcombe", "m"],
      ["pf3_dm_d4", "Miss Fenwick", "f"],
      ["pf3_dm_d5", "Mr. Astor-Pryce", "m"],
    ];
    const dbarks = [
      [
        "Too much salt again. Bastien is getting sentimental.",
        "Have you tried the special? No? Oh, you must.",
        "My grandmother dined here with Mark Twain. He was delicious company.",
      ],
      [
        "Order. Order in the dining room.",
        "The sentence is the special.",
        "Pass the horseradish.",
      ],
      [
        "In Korea we ate far worse, young man.",
        "Is it the rib tonight? Splendid.",
        "Waiter! More claret.",
      ],
      [
        "One simply cannot get good help.",
        "He had such lovely strong arms.",
        "Is that a new guest? How... fresh.",
      ],
      [
        "Money? My dear, we ARE the money.",
        "Everyone eats. Omnes edunt.",
        "The Baked Alaska, and something to cleanse the palate.",
      ],
    ];
    diners.forEach(([id, name, g], i) => {
      const a = A["diner" + (i + 1)];
      if (a)
        PV.spawnActor(ctx, {
          id,
          type: "human",
          gender: g,
          outfit: i % 2 ? "dj" : "doctor",
          hair: g === "f" ? "long" : "slick",
          name,
          faction: "settlers",
          level: 6,
          pos: v(a),
          yaw: a.yaw || 0,
          ai: "sit",
          home: "here",
          homeR: 0.3,
          age: 0.4 + i * 0.1,
          barks: S.flag("dm_reformed")
            ? ["Ox. How... rustic.", "I suppose one adapts."]
            : dbarks[i],
        });
    });
    PV.spawnActor(ctx, {
      id: "pf3_dm_waiter",
      type: "valet",
      name: "Jeeves",
      faction: "settlers",
      level: 6,
      pos: v(A.waiter),
      ai: "wander",
      home: "here",
      homeR: 6,
      barks: [
        "May I top up your glass, sir?",
        "The Baked Alaska will be flambéed tableside.",
        "Very good, madam.",
        "Your coat, sir? Your... everything, sir?",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pf3_dm_porter",
      type: "valet",
      name: "Porter-Bot",
      faction: "settlers",
      level: 6,
      pos: v(A.porter),
      yaw: PI * 0.25,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      barks: [
        "Members and guests only.",
        "Welcome to Delmonico's. Please wipe your feet. And your weapon.",
        "Now seating. Now hiring.",
      ],
    });
    // Mae waits outside; Walt is either in his cage, home with Mae, or... not.
    PV.spawnActor(ctx, {
      id: "pf3_mae",
      type: "human",
      gender: "f",
      outfit: "survivor",
      name: "Mae Tully",
      faction: "settlers",
      level: 3,
      essential: true,
      pos: v(A.mae),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_mae",
      barks: [
        "Walt? ...No.",
        "Two weeks. It's been two weeks.",
        "Real food, he said.",
      ],
    });
    if (!S.flag("dm_walt_eaten")) {
      const home = !!S.flag("dm_walt_free");
      PV.spawnActor(ctx, {
        id: "pf3_walt",
        type: "human",
        gender: "m",
        outfit: "settler",
        hair: "short",
        beard: "full",
        hairColor: 0x8a3a1a,
        name: "Walt Tully",
        faction: "settlers",
        level: 3,
        essential: true,
        pos: v(home ? A.walt_home : A.walt),
        yaw: home ? PI : 0,
        ai: home ? "guard" : "static",
        home: "here",
        homeR: home ? 1.5 : 0.3,
        dialogue: "pf3_dlg_walt",
        barks: home
          ? [
              "Never again. Never, ever again.",
              "I'm gonna wash dishes at home. For free. Forever.",
            ]
          : [
              "Help! Somebody!",
              "[singing, badly, to keep from crying]",
              "They weigh me every morning...",
            ],
      });
    }
    PV.dmHostile = () => {
      for (const id of SOCIETY) {
        const a = G.actors.get && G.actors.get(id);
        if (a && !a.dead && a.setHostile) a.setHostile(true);
      }
    };
    PV.dmHockHostile = () => {
      const a = G.actors.get && G.actors.get("pf3_hock");
      if (a && !a.dead && a.setHostile) a.setHostile(true);
    };
    PV.dmFreeWalt = () => {
      if (S.flag("dm_walt_free")) return;
      S.setFlag("dm_walt_free", true);
      PV.dmHockHostile();
      G.fadeTransition(() => {
        K.safe("walt", () => {
          const w = G.actors.get && G.actors.get("pf3_walt");
          if (w && G.actors.remove) G.actors.remove(w);
        });
        const h = A.walt_home;
        PV.spawnActor(ctx, {
          id: "pf3_walt",
          type: "human",
          gender: "m",
          outfit: "settler",
          hair: "short",
          beard: "full",
          hairColor: 0x8a3a1a,
          name: "Walt Tully",
          faction: "settlers",
          level: 3,
          essential: true,
          pos: v(h),
          yaw: PI,
          ai: "guard",
          home: "here",
          homeR: 1.5,
          dialogue: "pf3_dlg_walt",
          barks: ["Never again.", "Mae... Mae..."],
        });
      });
      K.notify("Walt slips out through the service stairs.");
      if (K.q.active("pf3_taste")) K.q.set("pf3_taste", "return");
    };
  }

  // Society retaliates when you shoot one of them inside the dining room
  G.events.on("actorDamaged", (actor, amount, info) => {
    if (
      !actor ||
      !actor.id ||
      !/^pf3_(lorenzo|anton|hock|dm_d\d|dm_waiter)$/.test(actor.id)
    )
      return;
    if (info && info.source === "player") {
      if (actor.id === "pf3_hock") PV.dmHockHostile && PV.dmHockHostile();
      else PV.dmHostile && PV.dmHostile();
    }
  });
  G.events.on("actorDamaged", (actor, amount, info) => {
    if (!actor || actor.faction !== "raiders" || !actor.pos) return;
    const it = G.LAYOUT.INTERIORS.federal_hall;
    if (!it) return;
    if (
      Math.abs(actor.pos.x - it.origin.x) < 150 &&
      Math.abs(actor.pos.z - it.origin.z) < 150 &&
      PV.vossHostile
    )
      PV.vossHostile();
  });

  PV.define({
    id: "delmonicos",
    name: "Delmonico's",
    interior: "delmonicos",
    order: 30,
    build(ctx) {
      exterior(ctx);
      if (PV.dmInterior) PV.dmInterior(ctx);
    },
    data,
    spawn,
    reset() {
      PV.dmHostile = PV.dmHockHostile = PV.dmFreeWalt = null;
    },
    update(dt, realDt, ctx) {
      if (PV.dmUpdate) PV.dmUpdate(dt, realDt, ctx);
    },
  });
