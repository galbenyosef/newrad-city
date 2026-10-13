// play-inline-336 07 — ctx
// Lines 2912-3166 of readable/play-inline-336.pretty.js (statement-aligned).
  function finishGraftGood() {
    if (!K.q.active("pev_honest_graft")) return;
    EV.setFlag("graft_good", true);
    K.give("pev_orourke_stein", 1);
    K.scrip(150 + (EV.flag("graft_bonus") || 0));
    K.give("pev_ale_dark", 2);
    K.give("pev_ale_light", 2);
    K.standing(40, "Freed O'Rourke's from Tammany");
    K.q.complete("pev_honest_graft");
  }
  EV.mcsFinishGraftGood = finishGraftGood;

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const stock = K.stock(
      [
        ["pev_ale_light", 12],
        ["pev_ale_dark", 12],
        ["pev_cheese_plate", 6],
        ["beer", 4],
        ["whiskey", 2],
        ["purified_water", 4],
        ["fizzo_cola", 2],
        ["rally_tonic", 2],
      ],
      "merchant_food",
      3,
    );
    EV.spawnActor(ctx, {
      id: "pev_deck",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Deck O'Rourke",
      faction: "settlers",
      level: 9,
      essential: true,
      pos: v(A.bartender),
      yaw: -HP,
      ai: "merchant",
      home: "here",
      homeR: 1.6,
      dialogue: "pev_dlg_deck",
      voice: "settler",
      merchant: {
        scrip: EV.flag("deck_betrayed") ? 260 : 420,
        stock,
        restock: 2,
        priceMult: EV.flag("deck_betrayed") ? 2 : 1,
      },
      barks: [
        "Light or dark?",
        "Be good or be gone.",
        "Two at a time, pal. House rule since 1854.",
        "Mind the sawdust. It's load-bearing.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_tess",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Tess",
      faction: "settlers",
      level: 4,
      pos: v(A.cook),
      yaw: 0,
      ai: "wander",
      home: "here",
      homeR: 1.6,
      barks: [
        "Cheese and onions, coming up.",
        "Don't cry. It's the onions.",
        "Deck, we're low on mustard again.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_finnegan",
      type: "human",
      gender: "m",
      outfit: "combat_armor",
      name: "Sgt. Finnegan",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v(A.npc1),
      yaw: HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      dialogue: "pev_dlg_finnegan",
      voice: "settler",
      barks: ["Saigon. Never again.", "Two lights, Deck."],
    });
    EV.spawnActor(ctx, {
      id: "pev_abigail",
      type: "human",
      gender: "f",
      outfit: "lab_coat",
      name: "Abigail Hewitt",
      faction: "settlers",
      level: 5,
      essential: true,
      pos: v(A.npc2),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      dialogue: "pev_dlg_abigail",
      voice: "settler",
      barks: [
        "Shh.",
        "Right makes might.",
        "Eleven million minutes overdue...",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_regular",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Regular",
      faction: "settlers",
      level: 3,
      pos: v(A.npc3),
      yaw: -HP,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Light.",
        "Dark.",
        "I been coming here since before it was cool. Which it never was.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_docker",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Dock Worker",
      faction: "settlers",
      level: 3,
      pos: v(A.npc4),
      yaw: PI,
      ai: "sit",
      home: "here",
      homeR: 0.3,
      barks: [
        "Tammany took my wages again. Took 'em \"for the widows.\" I'm not even married.",
      ],
    });
    const g = A.guard;
    EV.spawnActor(ctx, {
      id: "pev_sully",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Big Sully",
      faction: "settlers",
      level: 9,
      pos: v(g),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("combat_shotgun")
        ? "combat_shotgun"
        : K.itemExists("baseball_bat")
          ? "baseball_bat"
          : undefined,
      barks: [
        "Be good or be gone.",
        "No Braves inside. You a Brave? You don't look like a Brave.",
        "Light or dark, that's the menu.",
      ],
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_gardener",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Beer Garden Settler",
      faction: "settlers",
      level: 3,
      pos: v(A.garden),
      ai: "wander",
      home: "here",
      homeR: 5,
    });
    EV.spawnActor(ctx, {
      id: "pev_mcs_gardener2",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Hop Picker",
      faction: "settlers",
      level: 3,
      pos: v(A.garden2),
      ai: "wander",
      home: "here",
      homeR: 4,
    });
    // the cellar roaches (until cleared)
    if (!EV.flag("mcs_roaches_clear")) {
      const ids = ["roach1", "roach2", "roach3", "roach4"];
      ids.forEach((n) =>
        EV.spawnActor(ctx, {
          id: "pev_mcs_" + n,
          type: "giant_roach",
          name: "Giant roach",
          faction: "creatures",
          level: 2,
          hostile: true,
          pos: v(A[n]),
          ai: "wander",
          home: "here",
          homeR: 3,
          noRespawn: true,
          onDeath: () => {
            const alive = ids.some((m) => {
              const a = G.actors.get && G.actors.get("pev_mcs_" + m);
              return a && !a.dead;
            });
            if (!alive) {
              EV.setFlag("mcs_roaches_clear", true);
              if (K.q.active("pev_cellar_dwellers")) {
                K.q.set("pev_cellar_dwellers", "return");
              }
            }
          },
        }),
      );
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  EV.define({
    id: "mcs",
    name: "O'Rourke's Old Ale House",
    interior: "orourkes",
    order: 20,
    lift: 4,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
  });
