// play-inline-349 04 — ctx
// Lines 1973-2025 of readable/play-inline-349.pretty.js (statement-aligned).
  function spawn(ctx) {
    const A = ctx.anchors;
    const v = (a) => ({ x: a.x, y: a.y, z: a.z });
    PC.spawnActor(ctx, {
      id: "pc_sp_sexton",
      type: "maniac_bruiser",
      name: "The Sexton",
      faction: "maniacs",
      level: 9,
      hostile: true,
      pos: v(A.boss),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 6,
      loot: "maniac",
      inventory: [["pc_sp_sexton_key", 1]],
      noRespawn: true,
      barks: [
        "(a long, cracked howl, almost a hymn)",
        "(he slaps the bone wall and screams)",
      ],
    });
    const maniacs = [
      ["pc_sp_maniac1", A.catacombs, "Maniac Parishioner"],
      ["pc_sp_maniac2", A.spawn5, "Maniac Choirboy"],
      [
        "pc_sp_maniac3",
        { x: A.altar.x + 3, y: A.altar.y, z: A.altar.z + 3 },
        "Maniac Usher",
      ],
    ];
    for (const [id, p, name] of maniacs)
      PC.spawnActor(ctx, {
        id,
        type: "maniac",
        name,
        faction: "maniacs",
        level: 4,
        hostile: true,
        pos: v(p),
        yaw: r2(),
        ai: "wander",
        home: "here",
        homeR: 5,
        loot: "maniac",
      });
  }
  function r2() {
    return Math.random() * 6.28;
  }

  PC.part("old_st_patricks", { int: interior, spawn });
