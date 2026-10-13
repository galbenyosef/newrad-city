// play-inline-316 07 — ctx
// Lines 2569-2823 of readable/play-inline-316.pretty.js (statement-aligned).
  function amMarker(name, label) {
    const a = PH.anchor("automat", name);
    return a ? { x: a.x, y: a.y, z: a.z, label } : null;
  }
  function startNickel() {
    K.q.start("ph_nickel");
    const ctx = PH.amCtx;
    if (ctx && roachesClear(ctx)) K.q.set("ph_nickel", "crank");
    if (PH.flag("am_fixed")) K.q.set("ph_nickel", "return");
  }
  function finishNickel() {
    if (PH.flag("am_paid")) return;
    PH.setFlag("am_paid", true);
    K.scrip(PH.flag("am_bonus") || 0);
    K.give("ph_am_pie", 3);
    K.q.complete("ph_nickel");
  }
  function finishPembroke(more) {
    if (!K.has("ph_ny_q_notebook")) return;
    K.take("ph_ny_q_notebook", 1);
    K.scrip(more ? 250 : 150);
    K.give("ph_bellhop_cap", 1);
    PH.setFlag("ny_notebook_given", true);
    PH.nyQuestTo("return");
    K.q.complete("ph_room_3327");
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const food = [
      ["ph_am_pie", 4],
      ["ph_am_sandwich", 3],
      ["ph_am_beans", 4],
      ["ph_am_mac", 3],
      ["ph_am_coffee", 6],
      ["fizzo_cola", 4],
      ["purified_water", 3],
      ["chocolate_zeppelin", 2],
    ];
    PH.spawnActor(ctx, {
      id: "ph_penny",
      type: "valet",
      name: "Penny",
      faction: "settlers",
      level: 8,
      essential: true,
      hostile: false,
      pos: v(A.penny),
      yaw: HP,
      ai: "merchant",
      home: "here",
      homeR: 2.5,
      dialogue: "ph_dlg_penny",
      voice: "robot",
      merchant: {
        scrip: 420,
        stock: K.stock(food, "merchant_food", 4),
        restock: 2,
      },
      barks: [
        "Pie! Fresh pie! Fresh as of twenty-two years ago, re-baked this morning!",
        "Less work for Mother!",
        "Please bus your table. Mother is resting.",
        "Coffee is fresh every twenty minutes. I set a timer. I have always set a timer.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_nell",
      type: "human",
      gender: "f",
      outfit: "merchant",
      name: "Nickel Nell",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: v(A.nell),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 0.6,
      dialogue: "ph_dlg_nell",
      merchant: {
        scrip: 300,
        stock: K.stock(
          [
            ["rally_tonic", 2],
            ["scrap_metal", 6],
            ["ammo_10mm", 30],
            ["purified_water", 3],
          ],
          "merchant_general",
          4,
        ),
        restock: 3,
      },
      barks: [
        "Change! Nickels, scrip, bottle tops!",
        "Don't lean on the booth, hon.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_pembroke",
      type: "human",
      gender: "m",
      outfit: "survivor_layers",
      name: "Archibald Pembroke",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v(A.pembroke),
      yaw: 0,
      ai: "sit",
      home: "here",
      homeR: 0.5,
      dialogue: "ph_dlg_pembroke",
      voice: "settler",
      barks: [
        "Two thousand five hundred rooms, and a radio in every one.",
        "Nine o'clock. Seed for the birds.",
        "Thirty-third floor. Never again. Unless.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_am_settler1",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Automat Regular",
      faction: "settlers",
      level: 3,
      pos: v(A.settler1),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: [
        "Best beans in Manhattan.",
        "You put the cap in, the little door opens. Never gets old.",
      ],
    });
    PH.spawnActor(ctx, {
      id: "ph_am_settler2",
      type: "human",
      gender: "f",
      outfit: "drifter",
      name: "Automat Regular",
      faction: "settlers",
      level: 3,
      pos: v(A.settler2),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: [
        "Don't order the hash.",
        "Penny remembers everybody's order. Everybody's. Since 1950-something.",
      ],
    });
    const ext = PH.anchor("automat", "guard_gate");
    if (ext)
      PH.spawnActor(ctx, {
        id: "ph_am_guard",
        type: "human",
        gender: "m",
        outfit: "leather_armor",
        name: "Garden Guard",
        faction: "settlers",
        level: 6,
        pos: v(ext),
        yaw: PI,
        ai: "guard",
        home: "here",
        homeR: 2,
        weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
        barks: [
          "Guns away inside. Robot's rules.",
          "Automat's open. Always open.",
        ],
      });
    const gar = PH.anchor("automat", "garden");
    if (gar)
      PH.spawnActor(ctx, {
        id: "ph_am_gardener",
        type: "human",
        gender: "f",
        outfit: "settler",
        name: "Garden Keeper",
        faction: "settlers",
        level: 3,
        pos: v(gar),
        ai: "wander",
        home: "here",
        homeR: 5,
        barks: ["Tatos are coming in nice.", "Mind the tire beds."],
      });
    // commissary roaches (until the carousel is running)
    if (!PH.flag("am_fixed")) {
      for (let i = 1; i <= 5; i++) {
        PH.spawnActor(ctx, {
          id: "ph_am_roach" + i,
          type: i === 5 ? "burrow_rat" : "giant_roach",
          name: i === 5 ? "Pie Thief" : "Giant roach",
          faction: "creatures",
          level: i === 5 ? 3 : 2,
          hostile: true,
          pos: v(A["roach" + i]),
          yaw: i,
          ai: "wander",
          home: "here",
          homeR: 4,
          noRespawn: true,
          onDeath: () => {
            if (roachesClear(ctx)) {
              PH.setFlag("am_roaches", true);
              if (
                K.q.active("ph_nickel") &&
                K.q.stage("ph_nickel") === "cellar"
              ) {
                K.q.set("ph_nickel", "crank");
              }
            }
          },
        });
      }
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  function update(dt, realDt, ctx) {
    if (!ctx.inside || !dt) return;
    // entering the commissary starts the quest softly if Penny already explained the problem
    const P = G.player.pos;
    if (P.y - ctx.O.y < -2 && PH.flag("am_asked") && !K.q.started("ph_nickel"))
      startNickel();
  }

  PH.define({
    id: "automat",
    lod: 520,
    name: "Penny & Price Automat",
    interior: "automat",
    order: 20,
    lift: 5, // lift: the commissary cellar (y −4.2) must stay ≥ 0
    build(ctx) {
      PH.amCtx = ctx;
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
  });
