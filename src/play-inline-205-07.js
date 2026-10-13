// play-inline-205 07 — anch
// Lines 4311-4623 of readable/play-inline-205.pretty.js (statement-aligned).
  function heal(rads) {
    try {
      if (PF.live("rpg") && G.rpg.doctorHeal)
        G.rpg.doctorHeal({ rads: !!rads, limbs: true, hp: true });
      else {
        G.player.heal(999);
        if (rads) {
          G.player.rads = Math.max(0, G.player.rads - 400);
        }
      }
    } catch (e) {
      try {
        G.player.heal(999);
      } catch (e2) {
        /* ignore */
      }
    }
    PF.sfx("inject");
  }

  PF.quest({
    id: "pf_dust",
    name: "Dust to Dust",
    giver: "Reverend Penhallow",
    location: "Trinity Church",
    desc: "Something has been scratching at the crypt gate beneath Trinity Church every night. Reverend Josiah Penhallow asked me to find out what, and make it stop.",
    stages: [
      {
        id: "talk",
        text: "Speak with Reverend Josiah Penhallow inside Trinity Church.",
        markers: () => [{ npc: "pf_tr_reverend", label: "Reverend Penhallow" }],
      },
      {
        id: "key",
        text: "Unlock the crypt gate at the end of the west aisle.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "crypt_door");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Crypt Gate",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "crypt",
        text: "Descend into the crypt beneath Trinity Church.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "crypt");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Crypt",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "clear",
        text: "Find the source of the scratching in the crypt.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "breach");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "South Wall",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "breach",
        text: "Seal the breach in the crypt's south wall.",
        markers: () => {
          const a = PF.anchorOf("trinity_church", "breach");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "The Breach",
                  interior: "trinity_church",
                },
              ]
            : [];
        },
      },
      {
        id: "report",
        text: "Return to Reverend Penhallow.",
        markers: () => [{ npc: "pf_tr_reverend", label: "Reverend Penhallow" }],
      },
    ],
    rewards: {
      xp: 350,
      scrip: 100,
      standing: 50,
      items: [["pf_weehawken", 1]],
    },
  });
  PF.anchorOf = function (poi, name) {
    try {
      return G.pois.getAnchor(poi, name);
    } catch (e) {
      return null;
    }
  };

  // Sexton killed → the breach stage
  G.events.on("actorKilled", (a) => {
    if (!a || !a.id) return;
    if (a.id === "pf_tr_sexton") {
      PF.setFlag("tr_sexton_dead", true);
      if (
        PF.q.active("pf_dust") &&
        ["crypt", "clear", "key", "talk"].indexOf(PF.q.stage("pf_dust")) >= 0 &&
        !PF.flag("tr_breach")
      )
        PF.q.set("pf_dust", "breach");
    }
  });

  // ---- NPC roster ----------------------------------------------------------
  function npcAt(name) {
    return () => PF.anchorOf("trinity_church", name);
  }
  PF.trNpcs = function (anch) {
    const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
    PF.npc({
      id: "pf_tr_reverend",
      type: "human",
      name: "Reverend Josiah Penhallow",
      outfit: "settler",
      gender: "m",
      faction: "settlers",
      level: 6,
      pos: pos(anch.reverend),
      yaw: anch.reverend.yaw,
      ai: "guard",
      home: { x: anch.reverend.x, z: anch.reverend.z, r: 2 },
      dialogue: "pf_dlg_pell",
      essential: true,
      voice: "settler",
      seed: 4101,
      weapon: "none",
      barks: [
        "Guns stay holstered in the Lord's house.",
        "Mind the hole in the roof. And in the floor.",
        "Bless you, child.",
      ],
    });
    PF.npc({
      id: "pf_tr_doctor",
      type: "human",
      name: "Doctor Hester Obi",
      outfit: "doctor",
      gender: "f",
      faction: "settlers",
      level: 6,
      pos: pos(anch.doctor),
      yaw: anch.doctor.yaw,
      ai: "guard",
      home: { x: anch.doctor.x, z: anch.doctor.z, r: 2.5 },
      dialogue: "pf_dlg_obi",
      essential: true,
      voice: "settler",
      seed: 4102,
      weapon: "none",
      merchant: {
        scrip: 350,
        stock: [
          ["rally_tonic", 6],
          ["prussian_blue", 3],
          ["iodine_tabs", 3],
          ["morphine_syrette", 2],
          ["purified_water", 4],
          ["field_surgery_kit", 1],
          ["bull_tabs", 1],
        ],
        restock: 3,
      },
      barks: [
        "Next!",
        "Keep pressure on it.",
        "I'm out of Prussian Blue. Again.",
      ],
    });
    PF.npc({
      id: "pf_tr_deacon",
      type: "human",
      name: "Deacon Barlow",
      outfit: "leather_armor",
      gender: "m",
      faction: "settlers",
      level: 7,
      pos: pos(anch.ext_guard),
      yaw: anch.ext_guard.yaw,
      ai: "guard",
      home: { x: anch.ext_guard.x, z: anch.ext_guard.z, r: 1.5 },
      weapon: "hunting_rifle",
      voice: "guard",
      seed: 4103,
      barks: [
        "Holster it or turn around.",
        "Sanctuary's inside. Doc too.",
        "Welcome to Trinity. Wipe your feet. On the raiders, ideally.",
      ],
    });
    PF.npc({
      id: "pf_tr_maggie",
      type: "human",
      name: "Maggie Vail",
      outfit: "survivor",
      gender: "f",
      faction: "settlers",
      level: 3,
      pos: pos(anch.refugee1),
      yaw: 0,
      ai: "wander",
      home: { x: anch.refugee1.x, z: anch.refugee1.z, r: 5 },
      voice: "settler",
      seed: 4104,
      weapon: "none",
      barks: [
        "Pews are hard, but they don't shoot back.",
        "The Reverend saved my kids. Don't you cause trouble.",
        "Heard the Seaport shellbacks are laying eggs on that big ship.",
      ],
    });
    PF.npc({
      id: "pf_tr_tobias",
      type: "human",
      name: "Old Tobias",
      outfit: "settler",
      gender: "m",
      faction: "settlers",
      level: 2,
      pos: pos(anch.refugee2),
      yaw: PI,
      ai: "guard",
      home: { x: anch.refugee2.x, z: anch.refugee2.z, r: 1 },
      voice: "settler",
      seed: 4105,
      weapon: "none",
      barks: [
        "Scratching again last night. I heard it. Nobody believes old Tobias.",
        "Hamilton owed my great-great-great-grandpappy money. Probably.",
        "Don't sit there, that's where the roof drips.",
      ],
    });
    // crypt Maniacs + the Sexton (hostile, stable ids so their deaths persist)
    const pack = [
      [anch.spawn1, "Maniac Parishioner"],
      [anch.spawn2, "Maniac Parishioner"],
      [anch.spawn3, "Maniac Parishioner"],
      [anch.spawn5, "Maniac Parishioner"],
    ];
    pack.forEach(([a, nm], i) =>
      PF.npc({
        id: "pf_tr_maniac" + (i + 1),
        type: "maniac",
        name: nm,
        faction: "maniacs",
        level: 4 + i,
        pos: pos(a),
        yaw: r0(i),
        ai: "wander",
        home: { x: a.x, z: a.z, r: 6 },
        seed: 4110 + i,
      }),
    );
    PF.npc({
      id: "pf_tr_sexton",
      type: "maniac_bruiser",
      name: "Silas Cobb, the Sexton",
      faction: "maniacs",
      level: 8,
      pos: pos(anch.boss),
      yaw: 0,
      ai: "guard",
      home: { x: anch.boss.x, z: anch.boss.z, r: 5 },
      seed: 4120,
      loot: "maniac_bruiser",
      inventory: [
        ["pf_note_sexton", 1],
        ["scrip", 35],
      ],
    });
  };
  function r0(i) {
    return (i * 1.7) % TAU;
  }

  // ===================================================================
  // BUILDER
  // ===================================================================
