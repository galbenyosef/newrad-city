// play-inline-525 03 — pos
// Lines 615-829 of readable/play-inline-525.pretty.js (statement-aligned).
  function encLostSleeper() {
    const P = G.player.pos;
    const gc = G.LAYOUT.getLocation(GC_ID);
    if (!gc || Math.hypot(P.x - gc.x, P.z - gc.z) < 120) return null;
    const s = K.streetSpot(P.x, P.z, 22, 40, {
      road: true,
      hidden: true,
      notSettlement: true,
      clear: 1,
      tries: 40,
    });
    if (!s) return null;
    const a = K.spawnActor({
      type: "human",
      outfit: K.outfit("cryo_suit", "lab_coat"),
      gender: "m",
      hair: "short",
      faction: "settlers",
      name: "Timothy Pell",
      level: 2,
      hp: 60,
      pos: s,
      yaw: K.yawTo(s.x, s.z, P.x, P.z),
      ai: "patrol",
      patrol: [{ x: P.x, z: P.z }],
      weapon: K.itemExists("bb_gun") ? "bb_gun" : "none",
      noRespawn: true,
      dialogue: "amb_dlg_sleeper",
      inventory: K.stock([
        [K.SCRIP, 40],
        ["amb_note_wake_card", 1],
        ["purified_water", 1],
      ]),
      seed: "amb_pell",
      barks: {
        idle: [
          "Is it always this... big?",
          "Where is everybody?",
          "Okay. Okay. Think, Timothy. What would the Facility Director do?",
        ],
        greet: ["Oh thank goodness, a person!"],
      },
    });
    if (!a) return null;
    sleeper = a;
    stats.lostSleeper++;
    const E = {
      kind: "lost_sleeper",
      x: s.x,
      z: s.z,
      actors: [a],
      t: 0,
      hailed: false,
      state: "approach",
      thinkT: 0,
    };
    E.update = function (dt) {
      E.t += dt;
      if (!K.actorAlive(a)) {
        if (a.dead && questActive()) failQuest();
        return castGone(E) ? "gone" : null;
      }
      E.x = a.pos.x;
      E.z = a.pos.z;
      const d = K.distToPlayer(a.pos.x, a.pos.z);
      E.thinkT -= dt;
      if (E.state === "approach" && E.thinkT <= 0 && !a.inCombat) {
        E.thinkT = 2;
        if (!E.hailed && d < 30) {
          E.hailed = true;
          K.say(
            a,
            "Hey! Hey, you! Is that a Long Winter suit? Are you a volunteer too? Wait up!",
            4,
          );
        }
        if (d > 3.5 && !K.actorBusy(a)) {
          a.patrol = [{ x: G.player.pos.x, z: G.player.pos.z }];
          a.patrolIdx = 0;
        } else if (d <= 3.5) {
          a.patrol = [{ x: a.pos.x, z: a.pos.z }];
          a.patrolIdx = 0;
          a.faceTowards(G.player.pos.x, G.player.pos.z);
        }
      }
      if (E.state === "escort") {
        const gcL = G.LAYOUT.getLocation(GC_ID);
        if (gcL && Math.hypot(a.pos.x - gcL.x, a.pos.z - gcL.z) < gcL.r + 12) {
          arrived(a);
          E.state = "home";
          E.t = 0;
        } else if (a.following !== "player" && !a.inCombat && E.thinkT <= 0) {
          E.thinkT = 3;
          try {
            a.follow("player");
          } catch (e) {
            /* ignore */
          }
        }
      }
      if (E.state === "walk" && E.thinkT <= 0) {
        // walking to Grand Central on his own; vanishes (arrives) once out of sight
        E.thinkT = 4;
        if (d > 90 && !K.inView(a.pos.x, a.pos.y + 1, a.pos.z, 1, true))
          return "gone";
      }
      if (E.state === "escort") return null; // never despawn a follower mid-escort
      if (E.state === "approach" && E.t > 240 && d > 80) return "gone";
      return castGone(E) ? "gone" : null;
    };
    E.cleanup = function () {
      // told to wait and then left behind until he despawned: the escort is over
      if (E.state === "wait" && questActive()) {
        failQuest();
        try {
          G.notify("Timothy Pell got tired of waiting and wandered off.");
        } catch (e) {
          /* ignore */
        }
      }
      if (sleeper === a && E.state !== "escort") sleeper = null;
      removeCast(E);
    };
    E.keep = () => E.state === "escort";
    return E;
  }
  const Q_ID = "amb_q_lost_and_found";
  function questApi() {
    return !G.isStub("quests") && typeof G.quests.define === "function";
  }
  function questActive() {
    try {
      return questApi() && G.quests.isActive(Q_ID);
    } catch (e) {
      return false;
    }
  }
  function defineQuest() {
    if (!questApi()) return;
    try {
      if (G.quests.get && G.quests.get(Q_ID)) return;
      const gc = G.LAYOUT.getLocation(GC_ID);
      G.quests.define({
        id: Q_ID,
        name: "Lost and Found",
        giver: "Timothy Pell",
        desc: "Timothy Pell, a Project Long Winter volunteer, has just thawed out of the failing Cryo Unit C-7 under the Hudson piers and walked into 1989 with a 1967 street map and no idea where anyone is. He's heard of a market at Grand Central.",
        stages: [
          {
            id: "escort",
            text: "Escort Timothy Pell to Grand Central Market",
            markers: gc
              ? [{ x: gc.x, z: gc.z, label: "Grand Central Market" }]
              : [],
          },
          { id: "done", text: "Timothy Pell reached Grand Central Market" },
        ],
        rewards: { xp: 60 },
      });
    } catch (e) {
      G.reportError("ambient:quest define", e);
    }
  }
  function startQuest() {
    try {
      if (questApi()) {
        if (!G.quests.get || G.quests.get(Q_ID)) G.quests.start(Q_ID);
      }
    } catch (e) {
      G.reportError("ambient:quest start", e);
    }
  }
  function failQuest() {
    try {
      if (questApi() && G.quests.isActive(Q_ID)) G.quests.fail(Q_ID);
    } catch (e) {
      /* ignore */
    }
  }
  function arrived(a) {
    try {
      a.follow(null);
    } catch (e) {
      /* ignore */
    }
    const gc = G.LAYOUT.getLocation(GC_ID);
    if (gc) {
      a.aiMode = "wander";
      a.home = { x: gc.x, z: gc.z, r: Math.max(8, gc.r * 0.5) };
    }
    K.say(
      a,
      "Grand Central! It's real! People! Oh, here. It's not much, but it's everything I've got. Thank you. Really.",
      6,
    );
    K.give(K.SCRIP, 60);
    K.addStanding(15, "Escorted a lost sleeper to safety");
    try {
      if (questApi() && G.quests.isActive(Q_ID)) {
        G.quests.setStage(Q_ID, "done");
        G.quests.complete(Q_ID);
      } else K.addXP(60, "Lost and Found");
    } catch (e) {
      /* ignore */
    }
    try {
      if (!G.isStub("radio") && typeof G.radio.addNews === "function")
        G.radio.addNews(
          "Word from Grand Central: a freshly thawed government sleeper walked in yesterday, escorted by another one. That's two popsicles in one week, folks. Somebody check the basements.",
        );
    } catch (e) {
      /* ignore */
    }
    sleeper = null;
  }
