// play-inline-525 04 — victim
// Lines 830-1142 of readable/play-inline-525.pretty.js (statement-aligned).
  function sleeperDialogue() {
    const E = () => (active && active.kind === "lost_sleeper" ? active : null);
    K.registerDialogue("amb_dlg_sleeper", {
      start: () =>
        E() && E().state === "escort"
          ? "escorting"
          : E() && E().state === "walk"
            ? "walking"
            : "hello",
      nodes: {
        hello: {
          text: "Oh thank goodness, a person! A normal person! You ARE normal, right? I'm Timothy. Timothy Pell, Project Long Winter, Cryo Unit C-7. My pod popped this morning. The lights were down to one bulb. And I think I'm the only one who got out.",
          responses: [
            { text: "What are you doing out here?", next: "why" },
            { text: "You look lost.", next: "lost" },
            { text: "Goodbye.", end: true },
          ],
        },
        why: {
          text: "The card they pinned to my suit says \"report to your Facility Director.\" My Director has been sitting at her desk for a very long time. She's a skeleton. I said excuse me anyway. The card also says it's March 1967. It is not. A lady with a cart told me it's 1989. Also there are dogs with no fur. Is that normal? Please tell me that's normal.",
          responses: [{ text: "That's normal.", next: "lost" }],
        },
        lost: {
          text: "I'm looking for \"Grand Central Market.\" A man with burns all over his face, very friendly, said everyone trades there. My map is from 1967. It says there's a Woolworth's on every corner. There is not a Woolworth's on every corner.",
          responses: [
            {
              text: "Grand Central is north-east of here. Stay off the avenues after dark.",
              action: () => {
                K.addStanding(5, "Gave directions");
                K.addXP(15, "Gave directions");
                goWalk();
              },
              next: "directions",
            },
            {
              text: "I'll take you there myself. Stay close.",
              action: () => goEscort(),
              next: "escort",
            },
            {
              text: "Here, take a Rally Tonic. You'll need it more than I will.",
              cond: () =>
                !G.isStub("inventory") && G.inventory.count("rally_tonic") > 0,
              action: () => {
                try {
                  G.inventory.remove("rally_tonic", 1);
                } catch (e) {
                  /* ignore */
                }
                K.addStanding(20, "Gave a Rally Tonic to a lost sleeper");
                goWalk();
              },
              next: "gift",
            },
            {
              text: "Guides cost scrip. Pay up front. The city isn't free.",
              check: { skill: "persuasion", value: 50 },
              action: () => {
                K.give(K.SCRIP, 40);
                K.addStanding(-15, "Swindled a lost sleeper");
                goWalk();
              },
              next: "swindle",
              failNext: "noswindle",
            },
            {
              text: "Not my problem, kid.",
              action: () => goWalk(),
              next: "alone",
            },
          ],
        },
        directions: {
          text: "North-east. Avenues bad. Got it. Got it! I'm writing that down. On my arm. Thank you, you're the nicest person I've met all day! You're also the only person I've met all day.",
          responses: [{ text: "Good luck, Timothy.", end: true }],
        },
        escort: {
          text: "Really? Oh gosh. Okay! I'll be right behind you. Not too close. Unless there's danger. Then very close.",
          responses: [{ text: "Let's go.", end: true }],
        },
        gift: {
          text: "Real Rally Tonic? We only had the training bottles in C-7, full of cold tea and good intentions. I'll... I'll pay you back someday. Grand Central, here I come!",
          responses: [{ text: "Stay safe.", end: true }],
        },
        swindle: {
          text: "Oh. Oh, of course. Surface economics. Here... that's all my scrip. So where is it? ...North-east? Thank you! I think. I feel like I got the bad end of that.",
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        noswindle: {
          text: 'Hm. My Long Winter handbook says: "Never pay a stranger in advance." It also says the surface would be safe by spring 1968, so. I\'ll hold on to my scrip, thanks.',
          responses: [
            { text: "Fine. North-east.", action: () => goWalk(), end: true },
          ],
        },
        alone: {
          text: "Right. Right! Self-reliance. The Civil Defense way. I'll just... pick a direction. That one. That one looks good.",
          responses: [{ text: "...", end: true }],
        },
        escorting: {
          text: "I'm right behind you! Is it much farther? My legs have been asleep for twenty-two years.",
          responses: [
            { text: "Almost there. Keep up.", end: true },
            {
              text: "Wait here. I'll come back for you.",
              action: () => {
                try {
                  sleeper && sleeper.follow(null);
                } catch (e) {
                  /* ignore */
                }
                if (E()) E().state = "wait";
              },
              end: true,
            },
          ],
        },
        walking: {
          text: "North-east! Avenues bad! I remember!",
          responses: [
            {
              text: "Actually, I'll take you there. Stay close.",
              action: () => goEscort(),
              end: true,
            },
            { text: "Good luck.", end: true },
          ],
        },
      },
    });
    function goWalk() {
      const e = E();
      if (!e || !K.actorAlive(sleeper)) return;
      e.state = "walk";
      const gc = G.LAYOUT.getLocation(GC_ID);
      if (gc) {
        sleeper.aiMode = "patrol";
        sleeper.patrol = [{ x: gc.x, z: gc.z }];
        sleeper.patrolIdx = 0;
      }
    }
    function goEscort() {
      const e = E();
      if (!e || !K.actorAlive(sleeper)) return;
      e.state = "escort";
      try {
        sleeper.follow("player");
      } catch (err) {
        /* ignore */
      }
      startQuest();
    }
  }

  // ------------------------------------------------------------------
  // Encounter: scavenger chased by wild dogs
  // ------------------------------------------------------------------
  function encDogChase() {
    const P = G.player.pos;
    const s = K.streetSpot(P.x, P.z, 40, 60, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    const lvl = K.level();
    const victim = K.spawnActor({
      type: "human",
      outfit: K.outfit("drifter", "settler"),
      faction: "settlers",
      name: "Scavenger",
      level: Math.max(2, lvl - 1),
      hp: 70,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "patrol",
      patrol: [{ x: P.x, z: P.z }],
      weapon: "none",
      noRespawn: true,
      voice: "settler",
      seed: "amb_scav" + Math.floor(Math.random() * 99),
      inventory: K.stock([
        [K.SCRIP, K.randInt(15, 40)],
        ["scrap_metal", 2],
      ]),
      speed: 5.4,
      barks: {
        idle: ["Help! HELP!", "Get them off me!", "Somebody shoot them!"],
        combat: ["Help! HELP!", "Get them off me!"],
        flee: ["Get them off me!"],
      },
    });
    if (!victim) return null;
    const dogs = [];
    const n = K.randInt(2, 3) + (lvl >= 6 ? 1 : 0);
    const ang = K.yawTo(P.x, P.z, s.x, s.z); // behind the scavenger, away from the player
    for (let i = 0; i < n; i++) {
      const bx = s.x - Math.sin(ang) * (6 + i * 1.5),
        bz = s.z - Math.cos(ang) * (6 + i * 1.5);
      const sp = K.freeSpotNear(bx, bz, 3, 8);
      if (!sp) continue;
      const d = K.spawnActor({
        type: "dog",
        variant: "wild",
        faction: "creatures",
        level: Math.max(1, lvl - 2 + K.randInt(0, 2)),
        pos: sp,
        yaw: K.yawTo(sp.x, sp.z, s.x, s.z),
        ai: "wander",
        home: { x: s.x, z: s.z, r: 10 },
        noRespawn: true,
      });
      if (d) dogs.push(d);
    }
    const E = {
      kind: "dog_chase",
      x: s.x,
      z: s.z,
      actors: [victim].concat(dogs),
      t: 0,
      done: false,
      hailT: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      E.hailT -= dt;
      if (K.actorAlive(victim)) {
        E.x = victim.pos.x;
        E.z = victim.pos.z;
        const d = K.distToPlayer(victim.pos.x, victim.pos.z);
        // keep running toward the player (the dogs chase him in)
        if (!E.done && d > 4 && E.hailT <= 0) {
          E.hailT = 1.5;
          victim.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
          victim.patrolIdx = 0;
          if (victim.state === "flee" || victim.state === "cower") {
            try {
              victim.setState && victim.setState("idle");
            } catch (e) {
              /* ignore */
            }
          }
          if (Math.random() < 0.4)
            K.say(
              victim,
              K.pick([
                "Help! HELP!",
                "Shoot them! Shoot them!",
                "They're right behind me!",
              ]),
              2.5,
            );
        }
        // make the dogs go for him
        for (const dg of dogs) {
          if (!K.actorAlive(dg) || dg.inCombat) continue;
          try {
            if (typeof G.combat.provoke === "function")
              G.combat.provoke(dg, victim);
            else if (dg.moveTo) dg.moveTo(victim.pos.x, victim.pos.z);
          } catch (e) {
            /* ignore */
          }
          dg.home = { x: victim.pos.x, z: victim.pos.z, r: 3 };
        }
        if (!E.done && dogs.every((dg) => !K.actorAlive(dg))) {
          E.done = true;
          victim.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
          K.say(
            victim,
            "You... you saved my life! Here, take this, it's all I found today. And the scrip. Mostly the scrip.",
            6,
          );
          const loot = K.pick([
            ["rally_tonic", 1],
            ["ammo_10mm", 20],
            ["purified_water", 2],
            ["duct_tape", 2],
            ["iodine_tabs", 1],
          ]);
          if (K.distToPlayer(victim.pos.x, victim.pos.z) < 30) {
            K.give(K.SCRIP, K.randInt(20, 45));
            K.give(loot[0], loot[1]);
            K.addStanding(10, "Saved a scavenger");
            K.addXP(20, "Saved a scavenger");
          }
          E.doneT = E.t;
        }
      } else if (!E.done) {
        E.done = true;
        E.doneT = E.t;
      }
      if (E.done && E.t - E.doneT > 20 && K.actorAlive(victim)) {
        victim.aiMode = "patrol";
        victim.patrol = [
          {
            x: victim.pos.x + (Math.random() - 0.5) * 200,
            z: victim.pos.z + (Math.random() - 0.5) * 200,
          },
        ];
      }
      return castGone(E) || E.t > 600 ? "gone" : null;
    };
    E.cleanup = function () {
      removeCast(E);
    };
    return E;
  }

  // ------------------------------------------------------------------
  // Encounter: dead drop (skeleton + footlocker + last note)
  // ------------------------------------------------------------------
