// play-inline-191 08 — ctx
// Lines 3223-3446 of readable/play-inline-191.pretty.js (statement-aligned).
  function finishPortrait(how, free) {
    if (!K.has("pv_q_portrait")) return;
    K.take("pv_q_portrait", 1);
    PV.setFlag("portrait", how);
    if (how === "sold") {
      K.scrip(250);
      K.q.complete("pv_last_portrait");
      return;
    }
    if (!K.has("pv_key_penthouse")) K.give("pv_key_penthouse", 1);
    if (!free) K.scrip(150 + (PV.flag("viv_bonus") || 0));
    else {
      K.standing(10, "Generosity");
      K.xp(50, "Persuasion");
    }
    K.q.complete("pv_last_portrait");
  }

  // ==================================================================
  // SPAWN (newGame / loaded)
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    const merch = K.stock(
      [
        ["rally_tonic", 3],
        ["prussian_blue", 2],
        ["purified_water", 4],
        ["fizzo_cola", 3],
        ["whiskey", 2],
        ["wine", 3],
        ["scrap_metal", 4],
        ["relay_board", 1],
        ["fedora", 1],
        ["bowler_hat", 1],
        ["old_world_spring_dress", 1],
      ],
      "merchant_general",
      5,
    );
    PV.spawnActor(ctx, {
      id: "pv_vivienne",
      type: "human",
      gender: "f",
      outfit: "survivor_layers",
      name: "Odile Marchetti",
      burn: "L",
      faction: "settlers",
      level: 8,
      essential: true,
      pos: v(A.vivienne),
      yaw: 0.6,
      ai: "wander",
      home: "here",
      homeR: 2.5,
      dialogue: "pv_dlg_vivienne",
      voice: "settler",
      barks: [
        "Hold still. No — the other still.",
        "Cadmium red. What I would give for cadmium red.",
        "The light up here was better before the sky caught fire.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_leopold",
      type: "human",
      gender: "m",
      outfit: "merchant",
      name: "Leopold Fisk",
      faction: "settlers",
      level: 7,
      essential: true,
      pos: v(A.merchant),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 1.5,
      dialogue: "pv_dlg_leopold",
      merchant: { scrip: 450, stock: merch, restock: 3 },
      voice: "settler",
      barks: [
        "Everything is for sale. Especially the things that aren't.",
        "Don't touch the canvases. Unless you're buying.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_stanley",
      type: "human",
      gender: "m",
      outfit: "merchant",
      hat: "bowler_hat",
      name: "Stanley",
      faction: "settlers",
      level: 6,
      essential: true,
      pos: v(A.stanley),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 1,
      dialogue: "pv_dlg_stanley",
      voice: "settler",
      barks: [
        "Rent is due Friday. Every Friday. Forever.",
        "Welcome to the Chelsea. Wipe your feet.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_johnny",
      type: "human",
      gender: "m",
      outfit: "raider",
      name: "Johnny Nitro",
      faction: "settlers",
      level: 7,
      essential: true,
      pos: v(A.johnny),
      yaw: 0.3,
      ai: "wander",
      home: "here",
      homeR: 3,
      dialogue: "pv_dlg_johnny",
      merchant: {
        scrip: 150,
        stock: K.stock(
          [
            ["rush", 2],
            ["rage", 1],
            ["beer", 4],
            ["vodka", 2],
          ],
          null,
        ),
      },
      voice: "settler",
      barks: [
        "ONE MORE TIME! FROM THE TOP!",
        "The roaches at Katz's are brilliant, mate. Crunchy.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_chelsea_res1",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Resident Poet",
      faction: "settlers",
      level: 4,
      pos: v(A.npc1),
      ai: "wander",
      home: "here",
      homeR: 4,
      voice: "settler",
      barks: [
        "The stairwell is a poem. I'm still on the second verse.",
        "Do you rhyme? You look like you rhyme.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_chelsea_res2",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Sculptor",
      faction: "settlers",
      level: 4,
      pos: v(A.npc3),
      ai: "wander",
      home: "here",
      homeR: 3,
      voice: "settler",
      barks: ["Found a Valet robot's arm on Eighth. It's going to be a bird."],
    });
    const door = ctx.anchors.door;
    PV.spawnActor(ctx, {
      id: "pv_chelsea_guard",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Chelsea Doorman",
      faction: "settlers",
      level: 8,
      pos: ctx.anchors.doorman
        ? { x: ctx.anchors.doorman.x, y: 0, z: ctx.anchors.doorman.z }
        : { x: door.x, y: 0, z: door.z },
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      voice: "settler",
      barks: ["Art lovers only.", "Critics get shot. Customers get tea."],
    });
    // the beret waits in the penthouse
    if (!PV.flag("beret_taken") && !K.has("pv_artists_beret")) {
      K.safe("beret", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_artists_beret", 1, v(ctx.anchors.beret), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  PV.define({
    id: "chelsea",
    name: "Hotel Chelsea",
    interior: "chelsea_hotel",
    order: 10,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
  });
  G.events.on("itemAdded", (id) => {
    if (id === "pv_artists_beret") PV.setFlag("beret_taken", true);
  });
