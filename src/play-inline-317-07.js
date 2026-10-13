// play-inline-317 07 — ctx
// Lines 1950-2182 of readable/play-inline-317.pretty.js (statement-aligned).
  function dnMarker(name, label) {
    const a = PH.anchor("empire_diner", name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  }
  function decide(choice) {
    PH.setFlag("dn_choice", choice);
    if (K.q.active("ph_mystery_meat")) K.q.set("ph_mystery_meat", "decide");
    if (choice === "reform" && !PH.flag("dn_reform_gift")) {
      PH.setFlag("dn_reform_gift", true);
      K.give("ph_dn_blue_plate", 2);
    }
  }
  function finishMeat(how) {
    if (PH.flag("dn_done")) return;
    PH.setFlag("dn_done", how);
    if (how === "reform" || how === "truth") K.scrip(120);
    if (how === "truth") K.standing(10, "Told Bernadette the truth");
    K.q.complete("ph_mystery_meat");
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const menu = [
      ["ph_dn_mystery_meat", PH.flag("dn_choice") === "reform" ? 0 : 5],
      ["ph_dn_coffee", 6],
      ["ph_dn_blue_plate", PH.flag("dn_choice") === "reform" ? 4 : 1],
      ["fizzo_cola", 3],
      ["cinnamon_bun", 2],
      ["beer", 2],
    ].filter((e) => e[1] > 0);
    PH.spawnActor(ctx, {
      id: "ph_gus",
      type: "human",
      gender: "m",
      outfit: "survivor_layers",
      name: "Spiro Papadakis",
      burn: "R",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v(A.gus),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 2.5,
      dialogue: "ph_dlg_gus",
      voice: "settler",
      merchant: {
        scrip: 280,
        stock: K.stock(menu, "merchant_food", 3),
        restock: 2,
      },
      barks: [
        "Order up!",
        "Mystery Meat, extra gravy, coming right up!",
        "Siddown, siddown!",
        "Nobody leaves the Empire hungry.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_dolores",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Bernadette Wisniewski",
      faction: "settlers",
      level: 3,
      essential: true,
      pos: v(A.dolores),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.4,
      dialogue: "ph_dlg_dolores",
      barks: ["It is NOT the coffee.", "Forty years of the same order. Forty!"],
    });
    PH.spawnActor(ctx, {
      id: "ph_flo",
      type: "patrolman",
      variant: "medical",
      name: "Flo",
      faction: "settlers",
      level: 4,
      essential: true,
      hostile: false,
      pos: v(A.flo),
      yaw: 0,
      ai: "wander",
      home: "here",
      homeR: 4,
      dialogue: "ph_dlg_flo",
      voice: "robot",
      barks: [
        "MORE COFFEE?",
        "PLEASE WAIT TO BE SEATED. YOU HAVE WAITED. PLEASE SIT.",
        "THE SPECIAL IS SPECIAL.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_dn_regular",
      type: "human",
      gender: "m",
      outfit: "drifter",
      name: "Earl Wisniewski",
      faction: "settlers",
      level: 3,
      pos: v(A.regular),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.4,
      barks: [
        "Best Mystery Meat in the five boroughs.",
        "My fingernails? Oh, that's the coffee.",
        "Hmmm-mmm-mm.",
      ],
    });
    const yard = PH.anchor("empire_diner", "yard");
    if (yard)
      PH.spawnActor(ctx, {
        id: "ph_dn_guard",
        type: "human",
        gender: "f",
        outfit: "combat_armor",
        name: "Diner Guard",
        faction: "settlers",
        level: 6,
        pos: v(yard),
        ai: "guard",
        home: "here",
        homeR: 4,
        weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
        barks: ["Spiro says no fighting in the lot.", "You eat, you pay."],
      });
    if (!PH.flag("dn_bertha")) {
      const bert = PH.spawnActor(ctx, {
        id: "ph_dn_bertha",
        type: "burrow_rat",
        name: "Big Bertha",
        faction: "creatures",
        level: 6,
        hostile: true,
        pos: v(A.bertha),
        yaw: 1,
        ai: "guard",
        home: "here",
        homeR: 6,
        noRespawn: true,
        hp: 160,
        xp: 90,
        inventory: [["burrow_rat_meat", 3]],
        onDeath: () => {
          PH.setFlag("dn_bertha", true);
          K.notify("Big Bertha is dead. Forty-one pounds of her.");
        },
      });
      if (bert && bert.char && bert.char.root) {
        bert.char.root.scale.setScalar(2.2);
        bert.radius = Math.max(bert.radius || 0.4, 0.8);
      }
      for (let i = 1; i <= 3; i++)
        PH.spawnActor(ctx, {
          id: "ph_dn_rat" + i,
          type: "burrow_rat",
          name: ["Maude", "Lil' Sue", "Burrow Rat"][i - 1],
          faction: "creatures",
          level: 3,
          hostile: true,
          pos: v(A["rat" + i]),
          ai: "wander",
          home: "here",
          homeR: 4,
          noRespawn: true,
        });
    }
    if (!K.has("ph_dn_ledger") && !PH.flag("dn_ledger"))
      K.safe("ledger", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("ph_dn_ledger", 1, v(A.ledger), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    if (ctx.bulkIn && PH.flag("dn_bulk")) ctx.bulkIn.unbar(true);
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  G.events.on("itemAdded", (id) => {
    if (id === "ph_dn_ledger") {
      PH.setFlag("dn_ledger", true);
      if (!K.q.started("ph_mystery_meat")) K.q.start("ph_mystery_meat");
      if (K.q.active("ph_mystery_meat")) K.q.set("ph_mystery_meat", "decide");
    }
  });

  function update(dt, realDt, ctx) {
    if (ctx.inside || JB.on) K.safe("jukebox", () => jbUpdate(ctx));
    if (!ctx.inside || !dt) return;
    const P = G.player.pos;
    if (
      P.y - ctx.O.y < -1.5 &&
      K.q.active("ph_mystery_meat") &&
      ["ask", "cellar"].indexOf(K.q.stage("ph_mystery_meat")) >= 0
    )
      K.q.set("ph_mystery_meat", "pens");
  }
  function reset(ctx) {
    JB.on = false;
    if (ctx.bulkIn) ctx.bulkIn.rebar();
  }

  PH.define({
    id: "empire_diner",
    lod: 480,
    name: "Empire Diner",
    interior: "empire_diner",
    order: 30,
    lift: 4, // lift: the cellar (y −3.4) must stay ≥ 0
    build(ctx) {
      PH.dnCtx = ctx;
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
    reset,
  });
