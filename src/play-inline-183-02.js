// play-inline-183 02 — blue
// Lines 20-366 of readable/play-inline-183.pretty.js (statement-aligned).
  const K = G.PMID.kit,
    A = G.PMID;
  const PI = Math.PI,
    HP = PI / 2;
  const S = A.state; // saved (see 99_main) — fields: pitWins, pitBet, pitBetRound
  const an = (n) => K.anchor("msg", n);
  const P3 = (v, dy) => ({ x: v.x, y: v.y + (dy || 0), z: v.z });
  const MSG_OUT = () => {
    const s = G.LAYOUT.getSite("msg");
    return { x: s.x1 + 4, z: (s.z0 + s.z1) / 2 };
  };
  const loc = (id) => {
    const s = G.LAYOUT.getSite(id);
    return { x: (s.x0 + s.x1) / 2, z: (s.z0 + s.z1) / 2 };
  };

  // ------------------------------------------------------------------
  // Settlement NPCs
  // ------------------------------------------------------------------
  const npc = (id, anchorName, def) =>
    K.npc(() => {
      const v = an(anchorName);
      if (!v) return null;
      return Object.assign(
        {
          id,
          pos: P3(v),
          yaw: v.yaw || 0,
          home: { x: v.x, z: v.z, r: 1.5 },
          faction: "settlers",
          essential: true,
          level: 6,
        },
        def,
      );
    });
  npc("pmid_msg_mickey", "promoter", {
    type: "human",
    name: 'Mickey "Two-Count" Brannigan',
    outfit: "drifter",
    gender: "m",
    ai: "guard",
    dialogue: "pmid_dlg_mickey",
    voice: "settler",
    barks: {
      idle: [
        "Step right up! Fists only, folks!",
        "Who wants a shot at the champ?",
        "Two-count! That's all it took, in '62.",
      ],
      greet: ["Hey, fresh face! You look like you can take a punch."],
    },
  });
  npc("pmid_msg_ondine", "bookie", {
    type: "human",
    name: 'Ondine "Odds" Fairweather',
    outfit: "merchant",
    gender: "f",
    ai: "merchant",
    dialogue: "pmid_dlg_ondine",
    voice: "merchant",
    merchant: {
      scrip: 350,
      stock: [
        ["rally_tonic", 3],
        ["rush", 2],
        ["rage", 2],
        ["bull_tabs", 2],
        ["whiskey", 3],
        ["ammo_10mm", 60],
        ["ammo_12ga", 24],
        ["frag_grenade", 2],
      ],
    },
    barks: {
      idle: [
        "Place your bets, place your bets.",
        "The house always wins. I AM the house.",
      ],
    },
  });
  npc("pmid_msg_carla", "merchant", {
    type: "human",
    name: "Concessions Carla",
    outfit: "settler",
    gender: "f",
    ai: "merchant",
    dialogue: "pmid_dlg_carla",
    voice: "merchant",
    merchant: {
      scrip: 200,
      stock: [
        ["tunnel_rat_skewer", 6],
        ["fizzo_cola", 5],
        ["purified_water", 6],
        ["golden_plain_jerky", 4],
        ["beer", 4],
        ["cinnamon_bun", 2],
        ["coney_dog", 3],
      ],
    },
    barks: {
      idle: [
        "Get your squirrel on a stick! Hot-ish!",
        "Fizzo Cola! Mostly cold!",
      ],
    },
  });
  npc("pmid_msg_ike", "doctor", {
    type: "human",
    name: "Cutman Ike",
    outfit: "doctor",
    gender: "m",
    ai: "merchant",
    dialogue: "pmid_dlg_ike",
    voice: "settler",
    merchant: {
      scrip: 250,
      stock: [
        ["rally_tonic", 5],
        ["prussian_blue", 3],
        ["iodine_tabs", 3],
        ["morphine_syrette", 2],
        ["field_surgery_kit", 1],
      ],
    },
    barks: {
      idle: [
        "Hold still. It only stings if you think about it.",
        "Next patient!",
      ],
    },
  });
  npc("pmid_msg_hector", "hector", {
    type: "human",
    name: "Old Hector Pfeiffer",
    outfit: "survivor_layers",
    gender: "m",
    burn: "L",
    ai: "sit",
    faction: "settlers",
    dialogue: "pmid_dlg_hector",
    voice: "settler",
    barks: {
      idle: [
        "Paid my premiums for twelve years...",
        "Act of God, they said. God never set foot in Midtown.",
      ],
    },
  });
  npc("pmid_msg_brick", "champ", {
    type: "human",
    name: "Brick Bruno",
    outfit: "raider_heavy",
    gender: "m",
    ai: "guard",
    dialogue: "pmid_dlg_brick",
    voice: "settler",
    level: 12,
    hp: 420,
    barks: {
      idle: [
        "*cracks knuckles*",
        "Fifty-seven and oh.",
        "Nobody goes the distance.",
      ],
    },
  });
  // crowd: spectators on the seats and a gate guard
  ["crowd1", "crowd2", "crowd3", "crowd4"].forEach((n, i) =>
    npc("pmid_msg_fan" + i, n, {
      type: "human",
      name: ["Settler", "Settler", "Old Settler", "Settler"][i],
      outfit: ["settler", "drifter", "survivor_layers", "settler"][i],
      gender: i % 2 ? "f" : "m",
      ai: "sit",
      essential: false,
      level: 3,
      barks: {
        idle: [
          "C'mon, somebody fight!",
          "Two scrip on the rat!",
          "BRICK! BRICK! BRICK!",
          "I seen better fights at the Neon.",
        ],
      },
    }),
  );
  npc("pmid_msg_guard", "guard1", {
    type: "human",
    name: "Pit Doorman",
    outfit: "leather_armor",
    gender: "m",
    ai: "guard",
    essential: false,
    level: 7,
    weapon: "combat_shotgun",
    voice: "guard",
    barks: {
      idle: [
        "No guns in the ring. Guns at the bar are fine.",
        "Welcome to The Pit.",
      ],
    },
  });

  // ------------------------------------------------------------------
  // The fight system
  // ------------------------------------------------------------------
  const BOUTS = [
    {
      name: "Scrapper Sully",
      odds: 3,
      prize: 50,
      spawn: () => [
        {
          id: "pmid_pit_sully",
          type: "human",
          name: "Scrapper Sully",
          outfit: "raider",
          gender: "m",
          level: 4,
          weapon: "brass_knuckles",
          hp: 110,
        },
      ],
    },
    {
      name: "The Burrow Rat Melee",
      odds: 4,
      prize: 100,
      spawn: () => [
        {
          id: "pmid_pit_rat1",
          type: "burrow_rat",
          name: 'Pit Rat "Gnasher"',
          level: 4,
          hp: 70,
        },
        {
          id: "pmid_pit_rat2",
          type: "burrow_rat",
          name: 'Pit Rat "Nibbles"',
          level: 4,
          hp: 70,
        },
      ],
    },
    { name: "Brick Bruno", odds: 9, prize: 200, champ: true },
  ];
  let fight = null; // {round, opps:[actor], t, bet}
  const player = () => G.player;
  function meleeOnly() {
    try {
      if (G.isStub("weapons")) return true;
      if (G.weapons.isHolstered && G.weapons.isHolstered()) return true;
      const c = G.weapons.current();
      if (!c || !c.weapon) return true;
      return c.weapon.skill === "melee" || c.id === "unarmed";
    } catch (e) {
      return true;
    }
  }
  function bell() {
    try {
      G.sfx.play("ui_select", { volume: 1, pitch: 0.6 });
      G.sfx.play("melee_hit", { volume: 0.5, pitch: 1.8 });
    } catch (e) {
      /* */
    }
  }
  function crowd(text) {
    for (const a of A.spawnedNPCs)
      if (
        a &&
        !a.dead &&
        /pmid_msg_fan/.test(a.id || "") &&
        Math.random() < 0.6
      )
        try {
          a.say(text, 2.5);
        } catch (e) {
          /* */
        }
  }
  A.pitStart = function (round) {
    if (fight || G.isStub("actors")) return false;
    const R = BOUTS[round];
    if (!R) return false;
    const red = an("ring_red"),
      blue = an("ring_blue");
    if (!red || !blue) return false;
    G.fadeTransition(() => {
      G.player.teleport(red.x, red.y, red.z, red.yaw);
      const opps = [];
      if (R.champ) {
        const b = G.actors.get("pmid_msg_brick");
        if (b && !b.dead) {
          b.pos.set(blue.x, blue.y, blue.z);
          b.home = { x: blue.x, z: blue.z, r: 4 };
          b.setHostile(true);
          opps.push(b);
        }
      } else {
        R.spawn().forEach((d, i) => {
          const a = G.actors.spawn(
            Object.assign(
              {
                faction: "settlers",
                hostile: true,
                ai: "guard",
                noLoot: true,
                noRespawn: true,
                pos: { x: blue.x + i * 1.2, y: blue.y, z: blue.z - i },
                yaw: blue.yaw,
                home: { x: blue.x, z: blue.z, r: 4 },
              },
              d,
            ),
          );
          if (a) {
            opps.push(a);
            a.setHostile(true);
          }
        });
      }
      fight = {
        round,
        opps,
        t: 0,
        bet: S.pitBetRound === round ? S.pitBet || 0 : 0,
        over: false,
      };
      S.pitBet = 0;
      S.pitBetRound = -1;
      bell();
      K.say(
        "ROUND " +
          (round + 1) +
          " — " +
          R.name.toUpperCase() +
          "! Fists and clubs only. FIGHT!",
      );
      crowd(["FIGHT!", "Get 'im!", "Knock his block off!"][round % 3]);
    });
    return true;
  };
