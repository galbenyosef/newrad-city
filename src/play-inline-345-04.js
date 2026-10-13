// play-inline-345 04 — ctx
// Lines 2759-2879 of readable/play-inline-345.pretty.js (statement-aligned).
  function spawn(ctx) {
    const A = ctx.anchors;
    const lifted = !!PC.flag("pd_curfew_lifted");
    const v = (a) => ({ x: a.x, y: a.y, z: a.z });
    PC.spawnActor(ctx, {
      id: "pc_pd_sergeant",
      type: "patrolman",
      name: "Desk Sergeant",
      faction: "robots",
      level: 6,
      hostile: !lifted,
      pos: v(A.sergeant),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      loot: "patrolman",
      barks: [
        "CITIZEN. THE CURFEW IS IN EFFECT.",
        "PLEASE STATE THE NATURE OF YOUR VIOLATION.",
        "ALL COMPLAINTS WILL BE PROCESSED IN THE ORDER THEY ARE RECEIVED. YOU ARE NUMBER 88,214.",
        "HAVE A NICE DAY. INDOORS.",
      ],
    });
    PC.spawnActor(ctx, {
      id: "pc_pd_patrol1",
      type: "patrolman",
      name: "Patrolman Patrolman",
      faction: "robots",
      level: 5,
      hostile: !lifted,
      pos: v(A.patrol_a),
      ai: "patrol",
      patrol: [
        { x: A.patrol_a.x, z: A.patrol_a.z },
        { x: A.patrol_b.x, z: A.patrol_b.z },
        { x: A.cells.x - 8, z: A.cells.z },
      ],
      home: "here",
      homeR: 12,
      loot: "patrolman",
      barks: [
        "YOU ARE OUT AFTER CURFEW.",
        "RETURN TO YOUR RESIDENCE.",
        "RESISTANCE WILL BE NOTED IN YOUR FILE.",
      ],
    });
    PC.spawnActor(ctx, {
      id: "pc_pd_warden",
      type: "bulwark",
      name: "Bulwark Unit B-9",
      faction: "robots",
      level: 10,
      hostile: !lifted,
      pos: v(A.boss),
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 8,
      loot: "bulwark",
      barks: [
        "DETENTION LEVEL SECURE.",
        "YOU HAVE THE RIGHT TO REMAIN STATIONARY.",
        "ANYTHING YOU SAY WILL BE IGNORED.",
      ],
    });
    if (!PC.flag("pd_pike_done")) {
      const free = !!PC.flag("pd_pike_free");
      PC.spawnActor(ctx, {
        id: "pc_pd_pike",
        type: "human",
        gender: "m",
        outfit: "survivor",
        name: "Lenny Mott",
        faction: "settlers",
        level: 4,
        essential: true,
        hostile: false,
        pos: free ? v(A.cells) : v(A.pike),
        yaw: 0,
        ai: free ? "wander" : "sit",
        home: "here",
        homeR: free ? 3 : 0.4,
        dialogue: "pc_dlg_pike",
        barks: [
          "Hey! HEY! Human! Thank God — get me out of here!",
          "Three days of crackers through a slot.",
          "Don't let the tin can hear you.",
        ],
      });
    }
  }
  function update(ctx, dt) {
    if (!ctx.inside || !dt) return;
    ctx._pdT = (ctx._pdT || 0) - dt;
    if (ctx._pdT > 0) return;
    ctx._pdT = 1.0;
    if (
      PC.flag("pd_curfew_lifted") &&
      !G.isStub("actors") &&
      G.actors.inRadius
    ) {
      K.safe("pacify", () => {
        for (const a of G.actors.inRadius(
          new THREE.Vector3(ctx.O.x, ctx.O.y, ctx.O.z - 15),
          60,
        ) || [])
          if (
            a &&
            !a.dead &&
            a.faction === "robots" &&
            a.hostile &&
            a.hostile() &&
            a.setHostile
          )
            a.setHostile(false);
      });
    }
  }

  PC.part("police_hq", { int: interior, spawn, update });
