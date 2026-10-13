// play-inline-564 05 — setflag
// Lines 1328-1648 of readable/play-inline-564.pretty.js (statement-aligned).
  G.events.on("actorKilled", (a) => {
    if (!a) return;
    if (a.id === "lib_crane") {
      L.setFlag("crane_dead");
      L.setFlag("ms_crane", "dead");
      if (Q.isActive("mq06")) Q.complete("mq06");
      if (at("mq25", "confront")) Q.complete("mq25");
      L.news(
        "Reports from the harbour: gunfire on Liberty Island, and then quiet. The Continuity's Colonel Crane is dead. Never met the man. I'm told he signed everything twice.",
      );
    }
  });
  // Completability net: any hit on Crane before he is resolved opens the fight path.
  G.events.on("actorDamaged", (a, dmg, info) => {
    if (
      !a ||
      a.id !== "lib_crane" ||
      a.dead ||
      L.flag("crane_fight") ||
      L.flag("crane_surrendered") ||
      L.flag("crane_ally")
    )
      return;
    if (!Q.isActive("mq06") && !Q.isActive("mq25")) return;
    const src = info && info.source;
    if (
      src === "player" ||
      (src && src.faction === SH.covFaction) ||
      (a.hostile && a.hostile())
    )
      craneFight();
  });
  G.events.on("itemAdded", (id) => {
    if (
      id === "ms_note_crane_duty" &&
      G.locks &&
      G.locks.learn &&
      !G.isStub("locks")
    ) {
      try {
        G.locks.learn(
          [LOCKS.evidence.id, LOCKS.safe.id],
          "Colonel Crane's duty log",
        );
      } catch (e) {
        /* */
      }
    }
    if (id === "ms_key_b") {
      L.setFlag("ms_evidence_emptied");
      if (at("mq26", "locker")) Q.setStage("mq26", "keyb");
    }
    if (id === "ms_sirocco_codebook") {
      L.setFlag("ms_codebook_taken");
      L.setFlag("ms_sun_word_denied");
      L.xp(40, "The SIROCCO codebook");
    }
    if (id === "ms_note_file_670305") {
      L.setFlag("ms_safe_emptied");
      if (at("mq27", "safe")) Q.setStage("mq27", "read");
    }
  });
  G.events.on("noteRead", (id) => {
    if (id === "ms_note_file_670305") fileRead();
  });

  // ------------------------------------------------------------------
  // Crane resolution
  // ------------------------------------------------------------------
  function craneFight() {
    L.setFlag("crane_fight");
    const c = L.npc("lib_crane");
    if (c) c.essential = false;
    L.hostile("lib_crane", true);
    L.hostile("lib_rourke", true);
    L.hostile("lib_dunn", true);
    const turncoat = faction() === "continuity" && !L.flag("con_hostile");
    L.setFlag("con_hostile");
    if (turncoat) L.factionTruce(SH.conFaction, undefined, undefined, 0, true);
    else L.factionTruce(SH.conFaction, LIB().x, LIB().z, 200, true);
    if (Q.isActive("mq06")) Q.complete("mq06");
    if (Q.isActive("mq25")) L.refresh("mq25");
  }
  function craneSurrender() {
    L.setFlag("crane_surrendered");
    L.setFlag("ms_crane", "surrendered");
    L.factionTruce(SH.conFaction, LIB().x, LIB().z, 220, false, {
      id: "liberty_surrender",
    });
    L.xp(150, "Colonel Crane stood down");
    if (!L.has("ms_crane_key")) L.give("ms_crane_key", 1);
    if (Q.isActive("mq06")) Q.complete("mq06");
    if (at("mq25", "confront")) Q.complete("mq25");
  }
  function craneAlly() {
    L.setFlag("crane_ally");
    L.setFlag("ms_crane", "ally");
    if (!L.has("ms_crane_key")) L.give("ms_crane_key", 1);
    const M = ms();
    if (M) {
      M.addTrust(-2, "You stood with Crane");
      if (roseHere()) {
        M.rose.say(
          "[Rose looks at you as if she has never seen you before.] He's got my name on his list. And you shook his hand. [She walks out of the command post. Later you see a small boat pulling hard for the Battery.]",
          8,
        );
        L.setFlag("ms_rose_left_liberty");
        L.later(4, () => M.rose.place("home"));
      }
    }
    if (Q.isActive("mq06")) Q.complete("mq06");
    if (at("mq25", "confront")) Q.complete("mq25");
  }
  L.lib_finale = { craneFight, craneSurrender, craneAlly };

  // A Crane resolved before mq25 even started (killed early, an older save): close it as soon as it opens.
  L.hook("update", function () {
    if (
      at("mq25", "confront") &&
      (L.flag("crane_dead") ||
        L.flag("crane_surrendered") ||
        L.flag("crane_ally"))
    ) {
      if (!L.flag("ms_crane"))
        L.setFlag(
          "ms_crane",
          L.flag("crane_dead")
            ? "dead"
            : L.flag("crane_ally")
              ? "ally"
              : "surrendered",
        );
      Q.complete("mq25");
    }
  });

  // ------------------------------------------------------------------
  // mq26: Zeke, Calloway, Key B
  // ------------------------------------------------------------------
  function keyB(choice) {
    if (L.flag("ms_keyB")) return;
    const M = ms();
    if (choice === "destroyed") {
      L.setFlag("ms_keyB", "destroyed");
      L.take("ms_key_b", 1);
      if (roseHere()) {
        M.addTrust(2, "You let her destroy Key B");
        L.notify(
          "Rose lays Key B on the stone floor, puts the muzzle of her rifle to the bow of it and fires. The key jumps, bent double, the stamped letters torn through. She drops it through a gun slit into the harbour, and her hands are shaking.",
          { duration: 9 },
        );
      } else {
        M.addTrust(1, "You destroyed Key B");
        L.notify(
          "You wedge Key B in the hinge of the locker door and lean on it until the shaft bends double. Then you drop it through a gun slit into the harbour.",
          { duration: 7 },
        );
      }
      if (L.flag("ms_dawn_pact") === "agree") L.setFlag("ms_dawn_pact_broken");
    } else {
      L.setFlag("ms_keyB", "kept");
      if (roseHere()) {
        M.addTrust(-1, "You kept Key B");
        M.rose.say(
          "[She drops her hand.] You're going to take it to them. [She doesn't wait for an answer.]",
          6,
        );
      }
    }
    if (at("mq26", "keyb")) Q.complete("mq26");
  }
  L.hook("init", function () {
    const M = ms();
    if (!M) return;
    M.dlg("dlg_ms_keyb", "k").add({
      k: {
        speaker: "",
        text: () =>
          (roseHere()
            ? '[Rose has her hand out. "Give it to me." The other hand is on her rifle, and she doesn\'t seem to know it.] '
            : "") +
          "Key B lies in your palm: a heavy steel arming key, CLÉ B — NAVIGATEUR — SIROCCO 2. Somewhere under Grand Central there is a lock it fits.",
        responses: [
          {
            text: () =>
              roseHere() ? "[Give it to Rose.] Do it." : "[Destroy it.]",
            action: () => keyB("destroyed"),
          },
          { text: "[Keep it.]", action: () => keyB("kept") },
        ],
      },
    });
    M.dlg("dlg_ms_calloway", "idle")
      .when(() =>
        at("mq26", "calloway") && L.flag("ms_casemate_open") ? "freed" : null,
      )
      .add({
        idle: {
          speaker: "Dr. Ruth Calloway",
          text: () =>
            L.flag("ms_calloway_free")
              ? [
                  "Pod seven. Every February. I never opened the door. I will be sorry about that for the rest of my life, which is a shorter sentence than it used to be.",
                  "Is there coffee? No. Of course not.",
                ][Math.floor(Math.random() * 2)]
              : "This cell is locked, and I am in it. Both facts are being logged.",
          responses: [{ text: "Take care, Doctor." }],
        },
        freed: {
          speaker: "Dr. Ruth Calloway",
          text: () =>
            "[She stands, smooths her jacket, and looks at your cryo suit with the expression of a woman checking a delivery against an invoice.] Pod seven. " +
            hero() +
            ". You opened on your own schedule. CUSTODIAN always said you would. I'm sorry about the coffee. I am sorry about a great many things.",
          onEnter() {
            if (!L.flag("ms_calloway_free")) {
              L.setFlag("ms_calloway_free");
              L.xp(80, "Freed Dr. Calloway");
            }
          },
          responses: [
            {
              text: "Doctor — did anyone ever come to the cryo unit? After the Bombing?",
              next: "knock",
            },
          ],
        },
        knock: {
          text:
            "Yes. [She does not hesitate; she has been waiting to say it.] Every twentieth of February since 1968, at about three in the morning, someone knocked on the service door. Three knocks. A woman's voice. She asked for pod seven. Every year. Protocol forbade me to open the door, and I followed protocol, and I am not proud of it. " +
            "She left a candle each time. The first year she had a baby with her; I heard it cry. The last time was this February. The twentieth. The night before I came up after Zeke. Her voice was older. She still asked for pod seven.",
          responses: [{ text: "This February. She's alive.", next: "alive" }],
        },
        alive: {
          text: () =>
            "Someone who knew which pod you were in, and the date you went under, has been knocking on your door for twenty-one years. I would call that alive, Mr. " +
            lastName() +
            ". I would call that very alive.",
          onEnter() {
            L.setFlag("ms_nicole_alive_known");
            stoneScene();
            if (at("mq26", "calloway")) Q.setStage("mq26", "locker");
          },
          responses: [{ text: "...Thank you, Doctor." }],
        },
      });
  });
  function stoneScene() {
    if (L.flag("ms_stone_scene")) return;
    L.setFlag("ms_stone_scene");
    const M = ms();
    if (!M) return;
    const lines = [
      [
        "Zeke Marlow",
        "I saw her stone, " +
          first() +
          ". In the cathedral garden, before they grabbed me. NICOLE MEAD, KINDLED. I didn't put it on the reel. I didn't know how. ...The dirt was never turned. Nobody's under there.",
        7.5,
      ],
    ];
    if (roseHere() && !L.flag("ms_rose_detained"))
      lines.push([
        roseName(),
        "[Everyone is looking at her. Rose looks at the floor, then at the gun slit, then at you.] I'll explain. Not here.",
        6,
      ]);
    else if (L.flag("ms_rose_revealed"))
      lines.push([
        "",
        'Rose told you her mother was dead. Rose stood at that stone and said "That\'s her."',
        6,
      ]);
    M.scene(lines);
    L.setFlag("ms_rose_lie1_exposed");
  }

  // ------------------------------------------------------------------
  // mq27: the file
  // ------------------------------------------------------------------
  function fileRead() {
    if (!L.flag("ms_attribution_read")) {
      L.setFlag("ms_attribution_read");
      L.xp(80, "FILE 67-03-05");
    }
    if (roseHere() && !L.flag("ms_rose_sirocco_line")) {
      L.setFlag("ms_rose_sirocco_line");
      L.later(1, () =>
        ms().rose.say(
          "[Rose reads the Sirocco Two page over your shoulder and goes white.] That's ours. That's the Sun.",
          6,
        ),
      );
    }
    if (at("mq27", "read") || at("mq27", "safe")) Q.setStage("mq27", "decide");
    L.later(roseHere() ? 7 : 1.5, () => {
      if (at("mq27", "decide") && ms())
        ms().talk("dlg_ms_file", "FILE 67-03-05");
    });
  }
  function fileDecide(choice) {
    if (choice === "broadcast") {
      L.setFlag("ms_attribution_broadcast");
      L.setFlag("hale_defects");
      L.setFlag("ms_hale_defects");
      L.news(
        "This is Rocky Delgado, and I'm reading you something that came over the Liberty relay an hour ago, and I'm going to read it slow. Brussels gave the order. Paris said no and got outvoted. And our own Office of Civil Defense read that order twenty-six hours before the bombers came, and moved the list to Liberty Island, and told nobody. Nobody. ...I need a minute, folks.",
      );
      L.notify(
        "You feed FILE 67-03-05 into the torch relay. Across the harbour, every receiver in the city starts printing.",
        { duration: 6 },
      );
    } else if (choice === "sept") {
      L.setFlag("ms_attribution_to_sept");
      L.notify(
        "You fold FILE 67-03-05 into your suit. Corbeau has waited twenty-two years for it; he can wait a few days more.",
        { duration: 5 },
      );
    } else L.setFlag("ms_attribution_kept");
    if (at("mq27", "decide")) Q.complete("mq27");
  }
