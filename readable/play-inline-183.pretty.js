/* src/poi_midtown/85_pit.js */
/* =====================================================================
 * NEW RAD CITY — poi_midtown / 85_pit.js
 * THE PIT (Madison Square Garden settlement): named NPCs, dialogue, the
 * three side quests given here, and the ring-fight system.
 *   SQ "The Pit"          — Mickey Brannigan: three bouts (Scrapper Sully,
 *                           the Burrow Rat Melee, champion Brick Bruno), no
 *                           guns in the ring, bets at Ondine's window.
 *   SQ "Act of God"       — Old Hector's MetLife policy: records vault →
 *                           actuarial engine in the clock room → cheque.
 *   SQ "Second Opinion"   — Cutman Ike: Bellevue pharmacy cache, optional
 *                           truth about the Kessler-Haas annex (K-agent lab).
 * All writing is original.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G.PMID) return;
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
  function endFight(won, reason) {
    if (!fight || fight.over) return;
    fight.over = true;
    const R = BOUTS[fight.round];
    for (const a of fight.opps) {
      try {
        if (a.dead) continue;
        a.setHostile(false);
        a.setHostile(undefined);
        if (R.champ) {
          a.heal && a.heal(a.maxHp);
          const h = an("champ");
          if (h) {
            a.home = { x: h.x, z: h.z, r: 1.5 };
            a.moveTo && a.moveTo(h.x, h.z);
          }
        } else {
          G.actors.remove(a);
        }
      } catch (e) {
        /* ignore */
      }
    }
    bell();
    if (won) {
      S.pitWins = Math.max(S.pitWins || 0, fight.round + 1);
      K.inv.addScrip(R.prize);
      let msg = "You win the bout! +" + R.prize + " scrip purse.";
      if (fight.bet > 0) {
        const pay = fight.bet * R.odds;
        K.inv.addScrip(pay);
        msg += " Ondine pays out " + pay + " scrip on your bet.";
      }
      K.say(msg);
      K.xp(40 + fight.round * 40, "Won a bout at The Pit");
      crowd(
        ["WHAT A FIGHT!", "The kid's got hands!", "Pay up, pay up!"][
          fight.round % 3
        ],
      );
      if (fight.round === 0) K.q.set("pmid_q_pit", "r2");
      else if (fight.round === 1) K.q.set("pmid_q_pit", "r3");
      else {
        K.q.setFlag("pmid_pit_champion", true);
        K.q.complete("pmid_q_pit");
        K.news(
          "Sports news from Madison Square Garden: Brick Bruno, fifty-seven and oh, is now fifty-seven and ONE. There's a new champion of The Pit, folks, and I hear they slept through the whole war on ice. Mama always said, get your rest.",
        );
      }
    } else {
      K.say(reason || "The ref stops the fight. You lose.");
      crowd("Boooo!");
      try {
        const p = player();
        if (p.hp < p.maxHp * 0.3) p.heal(p.maxHp * 0.3 - p.hp);
      } catch (e) {
        /* */
      }
    }
    const f = fight;
    fight = null;
    void f;
  }
  K.animate((dt) => {
    if (!fight || fight.over || !dt) return;
    fight.t += dt;
    const p = player();
    const ring = an("ring");
    if (!p || !ring) return;
    if (p.hp < p.maxHp * 0.15 || p.alive === false) {
      endFight(false, "You hit the canvas! The ref waves it off — you lose.");
      return;
    }
    if (Math.hypot(p.pos.x - ring.x, p.pos.z - ring.z) > 7.5 && fight.t > 2) {
      endFight(false, "You left the ring. Forfeit!");
      return;
    }
    let alive = 0;
    for (const a of fight.opps) {
      if (a.dead) continue;
      if (a.hp < a.maxHp * (BOUTS[fight.round].champ ? 0.25 : 0.2)) {
        try {
          a.say(
            BOUTS[fight.round].champ
              ? "Okay... okay! Enough! You got it, kid."
              : "I yield! I YIELD!",
            3,
          );
        } catch (e) {
          /* */
        }
        a._yielded = true;
      }
      if (!a._yielded) alive++;
    }
    if (!alive) endFight(true);
  });
  G.events.on("weaponFired", (def) => {
    if (!fight || fight.over) return;
    const w = def && (def.weapon || def);
    const skill = w && w.skill;
    if (skill && skill !== "melee" && skill !== "melee")
      endFight(
        false,
        "GUNS IN THE RING?! Disqualified! The whole Garden is booing you.",
      );
  });
  A.resets = A.resets || [];
  A.resets.push(() => {
    fight = null;
  });

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
  const ringMarker = () => {
    const r = an("ring");
    return r
      ? [{ x: r.x, z: r.z, y: r.y, label: "The Pit — Ring", interior: "msg" }]
      : [];
  };
  K.questDef({
    id: "pmid_q_pit",
    name: "The Pit",
    giver: 'Mickey "Two-Count" Brannigan',
    location: "Madison Square Garden",
    desc: "Mickey Brannigan runs fist fights in the ruins of the old Garden. Three bouts stand between a newcomer and the championship belt — and no guns in the ring.",
    stages: [
      {
        id: "talk",
        text: "Talk to Mickey Brannigan at The Pit (Madison Square Garden).",
        markers: () => {
          const m = an("promoter");
          return m
            ? [
                {
                  x: m.x,
                  z: m.z,
                  y: m.y,
                  label: "Mickey Brannigan",
                  interior: "msg",
                },
              ]
            : [
                {
                  x: MSG_OUT().x,
                  z: MSG_OUT().z,
                  label: "Madison Square Garden",
                },
              ];
        },
      },
      {
        id: "r1",
        text: "Tell Mickey you're ready, then beat Scrapper Sully in the ring. (Optional: bet on yourself at Ondine's window.)",
        markers: ringMarker,
      },
      {
        id: "r2",
        text: "Survive the Burrow Rat Melee. Talk to Mickey when you're ready.",
        markers: ringMarker,
      },
      {
        id: "r3",
        text: "Go the distance with the champion, Brick Bruno.",
        markers: ringMarker,
      },
    ],
    rewards: {
      xp: 300,
      items: [
        ["pmid_champion_belt", 1],
        ["pmid_twocount_brass", 1],
      ],
    },
  });
  K.questDef({
    id: "pmid_q_claim",
    name: "Act of God",
    giver: "Old Hector Pfeiffer",
    location: "Metropolitan Life Tower",
    desc: 'Old Hector paid Metropolitan Life for twelve years. Then the bomb fell, he came off Pier 64 burned too badly to work, and his claim was denied as an "Act of God". He wants his appeal heard — by whatever is still running the tower.',
    stages: [
      {
        id: "find",
        text: "Find Hector's policy (No. 7741-P) in the Records Vault on the MetLife Tower's executive floor.",
        markers: () => {
          const v = K.anchor("metlife_tower", "records");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: "Records Vault",
                  interior: "metlife_tower",
                },
              ]
            : [loc("metlife_tower")];
        },
      },
      {
        id: "approve",
        text: 'Get the claim approved by the actuarial engine "Prudence" in the clock room at the top of the tower.',
        markers: () => {
          const v =
            K.anchor("metlife_tower", "mainframe") ||
            K.anchor("metlife_tower", "clockroom");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: 'Actuarial Engine "Prudence"',
                  interior: "metlife_tower",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Bring the certified cheque to Old Hector at The Pit.",
        markers: () => {
          const v = an("hector");
          return v
            ? [{ x: v.x, z: v.z, y: v.y, label: "Old Hector", interior: "msg" }]
            : [];
        },
      },
    ],
    rewards: { xp: 250 },
  });
  K.questDef({
    id: "pmid_q_bellevue",
    name: "Second Opinion",
    giver: "Cutman Ike",
    location: "Bellevue Hospital",
    desc: "Cutman Ike patches up The Pit's fighters with rags and moonshine. Bellevue Hospital's pharmacy might still hold real medicine — if you can get past whatever moved into the psychiatric wards.",
    stages: [
      {
        id: "meds",
        text: "Recover the pharmacy cache from Bellevue Hospital's psychiatric wards.",
        markers: () => {
          const v = K.anchor("bellevue", "pharmacy");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: "Bellevue Pharmacy",
                  interior: "bellevue",
                },
              ]
            : [loc("bellevue")];
        },
      },
      {
        id: "lab",
        text: "(Optional) Find out what Kessler-Haas was doing in the sealed annex beneath Bellevue.",
        optional: true,
        markers: () => {
          const v = K.anchor("bellevue", "lab");
          return v
            ? [
                {
                  x: v.x,
                  z: v.z,
                  y: v.y,
                  label: "Kessler-Haas Annex",
                  interior: "bellevue",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Bring the medicine back to Cutman Ike at The Pit.",
        markers: () => {
          const v = an("doctor");
          return v
            ? [{ x: v.x, z: v.z, y: v.y, label: "Cutman Ike", interior: "msg" }]
            : [];
        },
      },
    ],
    rewards: { xp: 300, items: [["rally_tonic", 3]] },
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "q_pmid_ml_policy" &&
      K.q.active("pmid_q_claim") &&
      K.q.stage("pmid_q_claim") === "find"
    )
      K.q.set("pmid_q_claim", "approve");
    if (id === "q_pmid_bv_meds" && K.q.active("pmid_q_bellevue"))
      K.q.set("pmid_q_bellevue", "return");
    if (id === "pmid_bv_hasselby") K.q.setFlag("pmid_bv_truth", true);
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  const R = (text, next, o) => Object.assign({ text, next }, o || {});
  const wins = () => S.pitWins || 0;
  K.dialogueDef("pmid_dlg_mickey", {
    start: () =>
      K.q.done("pmid_q_pit")
        ? "champ"
        : K.q.started("pmid_q_pit")
          ? "back"
          : "intro",
    nodes: {
      intro: {
        speaker: "Mickey Brannigan",
        text: "Well, lookit you! cryo suit, all your teeth, nothin' broken yet. Name's Mickey Brannigan — \"Two-Count\", on account of that's how long my opponents lasted. Welcome to The Pit, the last honest sport in Manhattan.",
        responses: [
          R("What is this place?", "place"),
          R("Honest sport? You run fist fights in a ruin.", "honest"),
          R("I want to fight.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("Just looking around.", null, { end: true }),
        ],
      },
      place: {
        speaker: "Mickey Brannigan",
        text: "Madison Square Garden, pal! Eighteen thousand seats, the fights every Friday. Now it's forty settlers, an old longshoreman with a bad heart and whoever wanders in. Carla feeds 'em, Ike stitches 'em, Ondine takes their money, and I give 'em a show. That's civilization.",
        responses: [
          R("And the fights?", "rules"),
          R("I want to fight.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("See you around.", null, { end: true }),
        ],
      },
      honest: {
        speaker: "Mickey Brannigan",
        text: "Honest as they come. No guns in the ring, no pills before the bell, no fixing — Ondine would skin me. You bleed, you win, you get paid. Try findin' THAT deal at the Exchange.",
        responses: [
          R("What are the rules?", "rules"),
          R("Sign me up.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("Maybe later.", null, { end: true }),
        ],
      },
      rules: {
        speaker: "Mickey Brannigan",
        text: "Three bouts. Scrapper Sully first — tough kid, glass jaw. Then the Burrow Rat Melee, which is exactly what it sounds like. Win both and you get a shot at Brick Bruno, fifty-seven and oh. Fists, knuckles, bats — fine. Pull a gun and you're disqualified and I let the crowd decide what happens next.",
        responses: [
          R("Deal. I'm in.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("I'll think about it.", null, { end: true }),
        ],
      },
      sign: {
        speaker: "Mickey Brannigan",
        text: "Atta kid! Go see Ondine at the betting window up on the concourse if you wanna put scrip on yourself — bet BEFORE the bell. When you're ready, tell me and step through the ropes.",
        responses: [
          R("I'm ready. Ring the bell.", null, {
            action: () => A.pitStart(0),
            end: true,
          }),
          R("Give me a minute.", null, { end: true }),
        ],
      },
      back: {
        speaker: "Mickey Brannigan",
        text: () =>
          [
            "Back for your first bout? Sully's warming up. Well, he's standing up.",
            "The rats are hungry, kid. Hungrier than you, I hope.",
            "This is it. Brick. The main event. The whole Garden's here — all forty of 'em.",
          ][Math.min(2, wins())],
        responses: [
          R("Ring the bell. I'm ready.", null, {
            cond: () => wins() < 3,
            action: () => A.pitStart(Math.min(2, wins())),
            end: true,
          }),
          R("Any advice?", "advice"),
          R("Not yet.", null, { end: true }),
        ],
      },
      advice: {
        speaker: "Mickey Brannigan",
        text: () =>
          [
            "Sully drops his left. Everybody knows it. Sully doesn't.",
            "Rats go for the ankles. Keep movin' and swing low.",
            "Brick don't feel pain the way you and me do. But he feels embarrassment. Make it last and he'll quit before he'll fall.",
          ][Math.min(2, wins())],
        responses: [
          R("Thanks. Ring the bell.", null, {
            cond: () => wins() < 3,
            action: () => A.pitStart(Math.min(2, wins())),
            end: true,
          }),
          R("Later.", null, { end: true }),
        ],
      },
      champ: {
        speaker: "Mickey Brannigan",
        text: "The champ! Hey, everybody, the CHAMP is here! You want a rematch with anybody, you come see Mickey. The belt looks good on you. Brick says it pinched anyway.",
        responses: [
          R("How's Brick taking it?", "brick"),
          R("See you, Mickey.", null, { end: true }),
        ],
      },
      brick: {
        speaker: "Mickey Brannigan",
        text: "Honestly? Best day he's had in twenty-two years. Guy's been undefeated since before the bombs. You know how lonely that is?",
        responses: [R("I can imagine.", null, { end: true })],
      },
    },
  });
  const betResp = (amt) =>
    R("Put " + amt + " scrip on me for my next bout.", "bet_ok", {
      cond: () =>
        K.inv.scrip() >= amt &&
        K.q.active("pmid_q_pit") &&
        wins() < 3 &&
        !(S.pitBetRound === wins() && S.pitBet > 0),
      action: () => {
        K.inv.addScrip(-amt);
        S.pitBet = amt;
        S.pitBetRound = wins();
      },
      id: "bet" + amt,
    });
  K.dialogueDef("pmid_dlg_ondine", {
    start: "hi",
    nodes: {
      hi: {
        speaker: "Ondine Fairweather",
        text: () =>
          S.pitBetRound === wins() && S.pitBet > 0
            ? "You've got " +
              S.pitBet +
              " scrip riding on yourself, sugar. Don't make me look bad."
            : "Window's open. What'll it be — a wager, or are you just here to look at my ledger with those big sad sleeper eyes?",
        responses: [
          betResp(25),
          betResp(50),
          betResp(100),
          R("What are the odds?", "odds"),
          R("Let me see what you're selling.", null, { barter: true }),
          R("Nothing right now.", null, { end: true }),
        ],
      },
      bet_ok: {
        speaker: "Ondine Fairweather",
        text: () =>
          "Done. " +
          S.pitBet +
          " scrip at " +
          [3, 4, 9][Math.min(2, wins())] +
          " to 1. Win, and I pay you out the moment the bell rings. Lose, and you learn something about yourself.",
        responses: [R("Pleasure doing business.", null, { end: true })],
      },
      odds: {
        speaker: "Ondine Fairweather",
        text: "Sully, three to one. The rats, four to one. Brick... nine to one, and I've never paid it out. House takes ten percent of everything, including your dignity.",
        responses: [
          R("Back to business.", "hi"),
          R("Goodbye.", null, { end: true }),
        ],
      },
    },
  });
  K.dialogueDef("pmid_dlg_carla", {
    start: "hi",
    nodes: {
      hi: {
        speaker: "Concessions Carla",
        text: "Squirrel on a stick, eight scrip. Fizzo, twenty. Golden Plain Jerky, sealed before the bombs, still tough enough for any trail. Buying?",
        responses: [
          R("Let's see the menu.", null, { barter: true }),
          R("How long have you been here?", "long"),
          R("Not hungry.", null, { end: true }),
        ],
      },
      long: {
        speaker: "Concessions Carla",
        text: "My granny sold peanuts in this building when it still had a roof. The peanuts ran out in 1969. The customers didn't. I adapted.",
        responses: [
          R("Show me what you've got.", null, { barter: true }),
          R("Bye, Carla.", null, { end: true }),
        ],
      },
    },
  });
  K.dialogueDef("pmid_dlg_ike", {
    start: () =>
      K.q.active("pmid_q_bellevue") && K.inv.count("q_pmid_bv_meds") > 0
        ? "meds_back"
        : "hi",
    nodes: {
      hi: {
        speaker: "Cutman Ike",
        text: "Cutman Ike. I stop the bleeding between rounds and after the funerals. You hurt? Sit. You're not hurt? Then don't waste my gauze.",
        responses: [
          R("Patch me up. (30 scrip)", "healed", {
            cond: () => K.inv.scrip() >= 30 && G.player.hp < G.player.maxHp,
            action: () => {
              K.inv.addScrip(-30);
              try {
                if (!G.isStub("rpg") && G.rpg.doctorHeal) G.rpg.doctorHeal();
                else G.player.heal(G.player.maxHp);
              } catch (e) {
                G.player.heal(G.player.maxHp);
              }
            },
          }),
          R("You need anything?", "job", {
            cond: () => !K.q.started("pmid_q_bellevue"),
          }),
          R("About Bellevue...", "progress", {
            cond: () => K.q.active("pmid_q_bellevue"),
          }),
          R("What have you got for sale?", null, { barter: true }),
          R("I'm fine.", null, { end: true }),
        ],
      },
      healed: {
        speaker: "Cutman Ike",
        text: "There. Good as new, if new was a little lumpy. Try blocking with your arms next time — that's what they're for.",
        responses: [R("Thanks, Doc.", null, { end: true })],
      },
      job: {
        speaker: "Cutman Ike",
        text: "Need anything? Kid, I'm sewing fighters up with fishing line and rotgut. Bellevue Hospital's pharmacy — over by the East River — ought to have real antibiotics sealed up in the psych wing. But the Brutes moved in. Big grey bastards, and they're... organised. Like somebody's running the place.",
        responses: [
          R("I'll get your medicine.", "accept", {
            action: () => {
              K.q.start("pmid_q_bellevue");
            },
          }),
          R(
            "[Medicine 40] Sulfa and morphine would last you years if you store them right.",
            "med",
            { check: { skill: "medicine", value: 40 }, failNext: "medfail" },
          ),
          R("What's in it for me?", "pay"),
          R("Not my problem.", null, { end: true }),
        ],
      },
      med: {
        speaker: "Cutman Ike",
        text: "A colleague! Yeah — cool and dry, away from the rads. You bring me that cache and I'll split it with you, fair and square. Doctor's honour.",
        responses: [
          R("Deal.", "accept", {
            action: () => {
              K.q.start("pmid_q_bellevue");
              K.q.setFlag("pmid_ike_split", true);
            },
          }),
        ],
      },
      medfail: {
        speaker: "Cutman Ike",
        text: "Uh-huh. And you learned that from a comic book. Just bring the medicine, doc.",
        responses: [
          R("Fine, I'll go.", "accept", {
            action: () => K.q.start("pmid_q_bellevue"),
          }),
          R("Forget it.", null, { end: true }),
        ],
      },
      pay: {
        speaker: "Cutman Ike",
        text: "Scrip, Rally Tonic, and free stitching for life. Which, given your line of work, is worth more than the scrip.",
        responses: [
          R("Deal.", "accept", { action: () => K.q.start("pmid_q_bellevue") }),
          R("No thanks.", null, { end: true }),
        ],
      },
      accept: {
        speaker: "Cutman Ike",
        text: "Bellevue. The old psychiatric building on First, iron fence, can't miss it. Pharmacy's off the nurses' station. And kid — if you find out who's running that place, I want to know.",
        responses: [R("I'll be back.", null, { end: true })],
      },
      progress: {
        speaker: "Cutman Ike",
        text: "Still waiting on that medicine. Pharmacy's off the nurses' station in the psych wing at Bellevue.",
        responses: [R("On my way.", null, { end: true })],
      },
      meds_back: {
        speaker: "Cutman Ike",
        text: "Is that — sulfa! Morphine! Sterile dressings, still sealed! Kid, you just saved more lives than you'll ever take in that ring.",
        responses: [
          R("Here. It's all yours.", "truth_q", {
            action: () => {
              K.inv.remove("q_pmid_bv_meds", 1);
              K.inv.addScrip(K.q.flag("pmid_ike_split") ? 150 : 120);
              K.standing(50, "Brought medicine to The Pit");
            },
          }),
          R("[Trade 50] Real medicine is worth more than that.", "haggle", {
            check: { skill: "trade", value: 50 },
            failNext: "haggle_fail",
          }),
        ],
      },
      haggle: {
        speaker: "Cutman Ike",
        text: "You're a bandit. You're a cryo suited bandit. ...Two hundred. And don't tell Mickey.",
        responses: [
          R("Pleasure.", "truth_q", {
            action: () => {
              K.inv.remove("q_pmid_bv_meds", 1);
              K.inv.addScrip(200);
            },
          }),
        ],
      },
      haggle_fail: {
        speaker: "Cutman Ike",
        text: "Nice try. A hundred and twenty and a lollipop. I'm out of lollipops.",
        responses: [
          R("Fine.", "truth_q", {
            action: () => {
              K.inv.remove("q_pmid_bv_meds", 1);
              K.inv.addScrip(120);
            },
          }),
        ],
      },
      truth_q: {
        speaker: "Cutman Ike",
        text: "So. Who's running that madhouse?",
        responses: [
          R(
            "Kessler-Haas was brewing K-agent under the hospital for Civil Defense. The Brutes are the patients.",
            "truth",
            { cond: () => K.q.flag("pmid_bv_truth") },
          ),
          R("A Brute who thinks he's the chief of medicine. Was.", "chief", {
            cond: () => K.q.flag("pmid_chief_dead"),
          }),
          R("I didn't stick around to find out.", "done"),
        ],
      },
      truth: {
        speaker: "Cutman Ike",
        text: () =>
          'God in heaven. They were treating the patients for it — "vitamins". ' +
          (K.q.flag("pmid_kagent_purged")
            ? "And you burned the tanks? Good. Good. Nobody gets to finish that experiment."
            : "And the tanks are still down there? Somebody's gonna want that stuff. Somebody in a black helmet, probably."),
        responses: [
          R("It's over now.", "done", {
            action: () => K.xp(100, "Learned the truth of Bellevue"),
          }),
        ],
      },
      chief: {
        speaker: "Cutman Ike",
        text: "A Brute... playing doctor. Twenty-two years of rounds. I'll drink to the poor bastard. He never had a chance to be anything else.",
        responses: [R("Me neither, some days.", "done")],
      },
      done: {
        speaker: "Cutman Ike",
        text: "Here — Rally Tonic, the good kind. And your stitches are free from now on. Doctor's orders.",
        responses: [
          R("Thanks, Ike.", null, {
            action: () => K.q.complete("pmid_q_bellevue"),
            end: true,
          }),
        ],
      },
    },
  });
  K.dialogueDef("pmid_dlg_hector", {
    start: () =>
      K.q.done("pmid_q_claim")
        ? "after"
        : K.inv.count("q_pmid_ml_cheque") > 0
          ? "cheque"
          : K.q.started("pmid_q_claim")
            ? "waiting"
            : "intro",
    nodes: {
      intro: {
        speaker: "Old Hector",
        text: 'Siddown, siddown. Hector Pfeiffer. Longshoreman, Pier 64, retired. You know what I did every month for twelve years? Paid Metropolitan Life. Eleven dollars and forty cents. "Whole life," they said. "Protect your family from the unexpected."',
        responses: [
          R("What happened?", "what"),
          R("I have to go.", null, { end: true }),
        ],
      },
      what: {
        speaker: "Old Hector",
        text: 'The unexpected happened! Bomb fell, the pier burned with me on it, family... well. I filed my claim. "Total incapacity." Walked it to the tower myself in \'68. Some robot at the desk stamped it DENIED. Act of God, he says. I says God\'s got nothing to do with whoever flew them planes. He says, "Please exit the building."',
        responses: [
          R(
            "The tower's still standing. Maybe the claim can be appealed.",
            "appeal",
          ),
          R("Insurance companies. Some things never change.", "never"),
          R("Sorry, Hector.", null, { end: true }),
        ],
      },
      never: {
        speaker: "Old Hector",
        text: "Twenty-two years and they're STILL the only business in New York that's open. Robots up there denying claims to nobody. I can see the clock from the roof here. Stuck at 9:47 like the rest of us.",
        responses: [
          R("I could try appealing your claim.", "appeal"),
          R("Take care, Hector.", null, { end: true }),
        ],
      },
      appeal: {
        speaker: "Old Hector",
        text: "You'd do that? The original policy's in their records vault — executive floor, they told me, like it's Fort Knox. And there's a big thinking-machine up in the clock that reviews appeals. \"Prudence,\" they called it. Get my claim through and... I don't know what I'd do with the money. Frame it, maybe. Show it to God.",
        responses: [
          R("I'll get your claim approved.", "yes", {
            action: () => {
              K.q.start("pmid_q_claim");
              if (K.inv.count("q_pmid_ml_policy") > 0)
                K.q.set("pmid_q_claim", "approve");
            },
          }),
          R("Maybe some other time.", null, { end: true }),
        ],
      },
      yes: {
        speaker: "Old Hector",
        text: "Madison Square, the white tower with the clock. Mind the robots — they don't take no for an answer. They only GIVE it.",
        responses: [R("Back soon.", null, { end: true })],
      },
      waiting: {
        speaker: "Old Hector",
        text: "Any word from the claims department? I've waited twenty-two years, I can wait a few more days. Probably. Heart's not what it was. Neither's the rest.",
        responses: [R("Working on it.", null, { end: true })],
      },
      cheque: {
        speaker: "Old Hector",
        text: "Is that... APPROVED? A certified cheque! Forty-eight thousand dollars! Kid, I — I don't know whether to laugh or fall apart. Well. More apart.",
        responses: [
          R("It's yours, Hector. You earned it.", "give", {
            standing: 50,
            action: () => {
              K.inv.remove("q_pmid_ml_cheque", 1);
              K.inv.addScrip(150);
              K.q.setFlag("pmid_claim_paid", true);
            },
          }),
          R(
            "[Persuasion 50] A cheque like that needs a finder's fee. Say... half your savings?",
            "speech",
            {
              check: { skill: "persuasion", value: 50 },
              failNext: "speech_fail",
            },
          ),
          R("I think I'll keep it. Consider it my commission.", "keep", {
            standing: -50,
            action: () => {
              K.q.setFlag("pmid_claim_kept", true);
            },
          }),
        ],
      },
      give: {
        speaker: "Old Hector",
        text: "Nobody's gonna cash it. I know that. But it says APPROVED, and it's got my name on it. Here — a hundred and fifty scrip. Every one I've got under the seat cushion. Don't argue with a policyholder.",
        responses: [
          R("Thank you, Hector.", null, {
            action: () => K.q.complete("pmid_q_claim"),
            end: true,
          }),
        ],
      },
      speech: {
        speaker: "Old Hector",
        text: "Ha! You'd have made a fine adjuster. Fine — two-fifty, and the cushion. I'll sit on the cheque instead.",
        responses: [
          R("Pleasure doing business.", null, {
            action: () => {
              K.inv.remove("q_pmid_ml_cheque", 1);
              K.inv.addScrip(250);
              K.q.setFlag("pmid_claim_paid", true);
              K.q.complete("pmid_q_claim");
            },
            end: true,
          }),
        ],
      },
      speech_fail: {
        speaker: "Old Hector",
        text: "Finder's fee? Kid, the robots asked for less. Here, a hundred and fifty, and that's being generous to you.",
        responses: [
          R("Fair enough.", null, {
            action: () => {
              K.inv.remove("q_pmid_ml_cheque", 1);
              K.inv.addScrip(150);
              K.q.setFlag("pmid_claim_paid", true);
              K.q.complete("pmid_q_claim");
            },
            end: true,
          }),
        ],
      },
      keep: {
        speaker: "Old Hector",
        text: "...Of course. Of course you will. You know, you'd have fit right in up there in the tower. Get out of my section.",
        responses: [
          R("Your loss, old man.", null, {
            action: () => K.q.complete("pmid_q_claim"),
            end: true,
          }),
        ],
      },
      after: {
        speaker: "Old Hector",
        text: () =>
          K.q.flag("pmid_claim_kept")
            ? "Don't you have a cheque to not cash somewhere?"
            : "Look at it. APPROVED. Every night before I sleep. Best eleven-forty I ever spent.",
        responses: [R("Take care, Hector.", null, { end: true })],
      },
    },
  });
  K.dialogueDef("pmid_dlg_brick", {
    start: () => (K.q.flag("pmid_pit_champion") ? "after" : "hi"),
    nodes: {
      hi: {
        speaker: "Brick Bruno",
        text: () =>
          wins() >= 2
            ? "...So you beat the rats. Good. Been a long time since anybody got this far. Don't go easy on me, kid. Everybody goes easy on the old man. It's insulting."
            : "Fifty-seven fights. Fifty-seven wins. You know what that is? That's fifty-seven times I didn't get to go home early.",
        responses: [
          R("Why do you still fight?", "why"),
          R("See you in the ring.", null, { end: true }),
        ],
      },
      why: {
        speaker: "Brick Bruno",
        text: "Fought my first pro bout right there, February 11th, 1967. Won in the third. Three weeks later, the whole world lost in the first. Figure I'm still waiting for somebody to go the distance. Then maybe I'll know the fight's over.",
        responses: [R("Maybe I'll be the one.", null, { end: true })],
      },
      after: {
        speaker: "Brick Bruno",
        text: "Champ. Heh. Feels good to say it to somebody else. Wear that belt proud — and if you ever get tired of it, I'll be right here. Always am.",
        responses: [R("Thanks, Brick.", null, { end: true })],
      },
    },
  });
})();
