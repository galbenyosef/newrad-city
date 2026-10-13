// play-inline-409 05 — the
// Lines 1733-1991 of readable/play-inline-409.pretty.js (statement-aligned).
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // Speaker Voss: holds the gavel on his throne, talks first (Persuasion check), fights after
    const voss = PV.spawnActor(ctx, {
      id: "pf3_voss",
      type: "human",
      gender: "m",
      outfit: "raider_heavy",
      name: "Speaker Voss",
      faction: "raiders",
      level: 12,
      hostile: false,
      pos: v(A.throne),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 2.5,
      dialogue: "pf3_dlg_voss",
      voice: "raider",
      hp: 260,
      dr: 12,
      weapon: K.itemExists("combat_shotgun") ? "combat_shotgun" : undefined,
      inventory: [
        ["pf3_fh_archive_key", 1],
        ["pf3_speaker_gavel", 1],
      ],
      loot: "raider_boss",
      noRespawn: true,
      barks: [
        "ORDER! ORDER!",
        "The chair recognises the gentleman from the sewer.",
        "All in favour? Motion carries.",
        "Filibuster THIS!",
      ],
      onDeath: () => {
        PV.setFlag("fh_voss_dead", true);
      },
    });
    void voss;
    // THE CONGRESS IN SESSION: members on the benches and in the annex are neutral (a parley, a raider
    // truce) until the Speaker calls the vote — or anyone in the chamber gets shot.
    const reps = [
      ["pf3_fh_rep1", "Rep. Skeeter", "sit", "raider", "m"],
      ["pf3_fh_rep2", "The Gentlewoman from Jersey", "sit", "raider", "f"],
      ["pf3_fh_rep3", "Senator Knuckles", "guard", "raider_heavy", "m"],
      ["pf3_fh_rep4", "Rep. Mags", "sit", "raider", "f"],
      ["pf3_fh_rep5", "Pill Committee Chair", "guard", "raider", "m"],
      ["pf3_fh_rep6", "Backbencher", "sit", "raider", "m"],
    ];
    const barks = [
      "Point of order!",
      "I yield my time to my knife.",
      "Aye! Wait, what are we voting on?",
      "The Speaker will see you now. Maybe.",
      "Filibuster! Filibuster!",
      "Lunch recess soon.",
    ];
    reps.forEach(([id, name, ai, outfit, g], i) => {
      const a = A["rep" + (i + 1)];
      if (!a) return;
      PV.spawnActor(ctx, {
        id,
        type: "human",
        gender: g,
        outfit,
        name,
        faction: "raiders",
        level: 6 + (i % 3),
        hostile: false,
        pos: v(a),
        yaw: i < 4 ? Math.atan2(-(a.x - A.throne.x), -(a.z - A.throne.z)) : PI,
        ai,
        home: "here",
        homeR: 1.5,
        loot: "raider",
        noRespawn: true,
        weapon: K.itemExists(i % 2 ? "pipe_pistol" : "pistol_10mm")
          ? i % 2
            ? "pipe_pistol"
            : "pistol_10mm"
          : undefined,
        voice: "raider",
        barks: [barks[i], barks[(i + 3) % barks.length]],
      });
    });
    PV.spawnActor(ctx, {
      id: "pf3_fh_sgt",
      type: "human",
      gender: "m",
      outfit: "raider_heavy",
      name: "Sergeant-at-Arms",
      faction: "raiders",
      level: 9,
      hostile: false,
      pos: v(A.sgt),
      yaw: PI,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_fh_sgt",
      voice: "raider",
      loot: "raider",
      noRespawn: true,
      weapon: K.itemExists("hunting_shotgun")
        ? "hunting_shotgun"
        : K.itemExists("combat_shotgun")
          ? "combat_shotgun"
          : undefined,
      barks: [
        "Entry tax is ten scrip. Or a finger.",
        "Hands where I can see 'em.",
        "Chamber's in session. Keep it down.",
      ],
    });
    // turn the Speaker (and the whole Congress) hostile when the vote goes against you or anyone opens fire in the chamber
    PV.vossHostile = () => {
      if (G.isStub("actors") || !G.actors.get) return;
      for (const id of PV.FH_CONGRESS) {
        const a = G.actors.get(id);
        if (a && !a.dead && a.setHostile) a.setHostile(true);
      }
      PV.setFlag("fh_congress_hostile", true);
    };
    if (PV.flag("fh_congress_hostile")) PV.vossHostile();
    // Lancer Halloran in the assay office (friendly, essential)
    PV.spawnActor(ctx, {
      id: "pf3_halloran",
      type: "human",
      gender: "m",
      outfit: "covenant_exo_rig",
      name: "Lancer Halloran",
      faction: "covenant",
      level: 12,
      essential: true,
      pos: v(A.halloran),
      yaw: 0,
      ai: "guard",
      home: "here",
      homeR: 1.2,
      dialogue: "pf3_dlg_halloran",
      weapon: K.itemExists("gyrojet_carbine") ? "gyrojet_carbine" : undefined,
      barks: [
        "Iron holds.",
        "Leg's fine. Leg's fine.",
        "Come on, relief. Any day now.",
        "I count four of them. Maybe five.",
      ],
    });
    // two Congress pages guarding the vault hall (in addition to the location's raiders)
    if (!PV.flag("fh_pages_dead")) {
      const ids = ["pf3_fh_page1", "pf3_fh_page2"];
      ids.forEach((id, i) =>
        PV.spawnActor(ctx, {
          id,
          type: "human",
          outfit: i ? "raider" : "raider_heavy",
          name: "Congress Page",
          faction: "raiders",
          level: 7,
          hostile: true,
          pos: v(A["page" + (i + 1)]),
          yaw: 0,
          ai: "guard",
          home: "here",
          homeR: 4,
          loot: "raider",
          noRespawn: true,
          weapon: K.itemExists(i ? "hunting_rifle" : "pistol_10mm")
            ? i
              ? "hunting_rifle"
              : "pistol_10mm"
            : undefined,
          barks: [
            "The vault is closed to the public!",
            "Congress is in recess, tourist!",
          ],
          onDeath: () => {
            if (
              ids.every((m) => {
                const a = G.actors.get && G.actors.get(m);
                return !a || a.dead;
              })
            )
              PV.setFlag("fh_pages_dead", true);
          },
        }),
      );
    }
  }

  PV.FH_CONGRESS = [
    "pf3_voss",
    "pf3_fh_sgt",
    "pf3_fh_rep1",
    "pf3_fh_rep2",
    "pf3_fh_rep3",
    "pf3_fh_rep4",
    "pf3_fh_rep5",
    "pf3_fh_rep6",
  ];
  // any shot at a member of the Congress (or the Speaker) ends the parley
  G.events.on("actorDamaged", (actor, amt, info) => {
    if (
      !actor ||
      !actor.id ||
      PV.FH_CONGRESS.indexOf(actor.id) < 0 ||
      PV.flag("fh_congress_hostile")
    )
      return;
    if (
      info &&
      info.source &&
      info.source !== "player" &&
      !(info.source.following === "player")
    )
      return;
    if (PV.vossHostile) PV.vossHostile();
  });
  function update(dt, realDt, ctx) {
    if (PV.fhCoreUpdate) PV.fhCoreUpdate(ctx);
    if (PV.fhDoorUpdate) PV.fhDoorUpdate(ctx, realDt);
    // Voss turns on you when combat starts anywhere in the rotunda
    if (!ctx.inside || !dt) return;
    const a = G.actors.get && G.actors.get("pf3_voss");
    if (!a || a.dead || (a.hostile && a.hostile())) return;
    const P = G.player;
    // same floor only: the delegation's firefight with Halloran downstairs is none of the Speaker's business
    if (
      P &&
      P.pos &&
      a.pos &&
      Math.abs(P.pos.y - a.pos.y) < 2.5 &&
      Math.hypot(P.pos.x - a.pos.x, P.pos.z - a.pos.z) < 30
    ) {
      const fight =
        !G.isStub("combat") && G.combat.isInCombat && G.combat.isInCombat();
      if (fight || a.hp < a.maxHp) PV.vossHostile();
    }
  }

  PV.define({
    id: "federal_hall",
    name: "Federal Hall",
    interior: "federal_hall",
    order: 10,
    build(ctx) {
      exterior(ctx);
      if (PV.fhInterior) PV.fhInterior(ctx);
    },
    data,
    spawn,
    update,
    reset() {
      PV.vossHostile = null;
    },
  });
