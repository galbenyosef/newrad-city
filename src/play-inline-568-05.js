// play-inline-568 05 — next
// Lines 1231-1529 of readable/play-inline-568.pretty.js (statement-aligned).
  function coreSettled() {
    if (!at("mq22", "fate")) return;
    if (!ms.f("core") && Q.isComplete("pf3_cog") && !L.has("pf3_cog_core")) {
      ms.set("core", "given");
      L.setFlag("core_given");
    }
    if (ms.f("core")) Q.complete("mq22");
  }
  function mq22Poll() {
    // the core in hand (with or without Halloran's blessing): read it, then decide
    if (at("mq22", "side") && L.has("pf3_cog_core")) Q.setStage("mq22", "memo");
    if (at("mq22", "memo") && ms.f("memo_read")) Q.setStage("mq22", "fate");
    if (at("mq22", "fate")) coreSettled();
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pf3_cog_core" && Q.isStarted("mq22") && !L.has(NOTE_MEMO)) {
      L.give(NOTE_MEMO, 1, true);
      L.notify(
        "Taped inside the core's document sleeve: a carbon of the last flash traffic filed with it. (NOTES)",
        { duration: 5 },
      );
    }
  });
  function coreMarkers() {
    const m = [];
    if (L.has("pf3_cog_core")) {
      m.push({ npc: "rc_rocky", label: "Rocky Delgado (broadcast)" });
      if (Q.isActive("pf3_cog"))
        m.push({ npc: "pf3_halloran", label: "Lancer Halloran" });
      if (!L.flag("hale_dead") && !L.flag("con_hostile"))
        m.push({ npc: "con_hale", label: "Lieutenant Hale" });
    }
    return m;
  }
  function coreTo(who) {
    if (!L.has("pf3_cog_core")) return;
    L.take("pf3_cog_core", 1);
    if (Q.isActive("pf3_cog")) Q.fail("pf3_cog"); // the Covenant never gets it
    if (who === "rocky") {
      ms.set("core", "broadcast");
      L.setFlag("core_broadcast");
      L.standing(40, "Broadcast the 4 March memo");
      L.later(2, () =>
        L.news(
          "This is Radio Free Manhattan, and I'm going to read you something, and then I'm going to read it again every hour until my tubes melt. Fourth of March, nineteen sixty-seven. Flash traffic. \"Move the rolls and enrolled staff to Liberty tonight. No public notice.\" The day before, folks. They knew the day before.",
        ),
      );
    } else {
      ms.set("core", "given");
      L.setFlag("core_given");
      L.incFlag("hale_doubts", 1);
    }
    L.later(0.5, () => {
      if (at("mq22", "fate")) Q.complete("mq22");
    });
  }

  // ==================================================================
  // mq23 THE WHISPERING GALLERY
  // ==================================================================
  function galleryPos(which) {
    const name = which === "b" ? "whisper_corner_b" : "whisper_corner_a";
    const a = L.anchor("grand_central", [name, "whispering_gallery"], null);
    if (a) return a;
    return L.anchor("grand_central", ["oyster_bar_steps", "bar"], {
      x: 226,
      z: -238,
    });
  }
  function bulkheadPos() {
    // the tunnel side of the hatch (the lair's own 'bulkhead' anchor is on the far side, inside Track 61)
    return (
      L.anchor("grand_central", ["track61_bulkhead"], null) ||
      L.anchor("lair", ["bulkhead_outside", "tunnel_bulkhead"], null) ||
      L.anchor("grand_central", ["lower_stair"], { x: 218.5, z: -243.3 })
    );
  }
  ms.actor({
    id: "ms_taper_gallery",
    removeWhenOff: true,
    when: () =>
      at("mq23", "gallery") || at("mq23", "answer") || at("mq23", "follow"),
    def: () => {
      const p = at("mq23", "follow") ? bulkheadPos() : galleryPos("b");
      return {
        type: "brother_taper",
        name: "Brother Taper",
        gender: "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 0.6,
        dialogue: "dlg_ms_taper_gallery",
        noRespawn: true,
        at: {
          fallback: p ? { x: p.x, z: p.z, y: p.y } : { x: 215.5, z: -228 },
          maxR: 3,
        },
        barks: ["Keep the light on.", "...", "A dimanche."],
      };
    },
  });
  L.trigger({
    id: "ms_mq23_whisper",
    once: false,
    cooldown: 6,
    r: 3.2,
    pos: () => galleryPos("a"),
    cond: () =>
      at("mq23", "gallery") &&
      Math.abs(G.player.pos.y - (galleryPos("a") || { y: 0 }).y) < 3,
    fire() {
      L.notify(
        first() +
          ". [The whisper comes out of the tiles beside your ear, from the opposite corner, as close as a mouth.] Ninety days of winter, and then the spring. Turn round, sleeper. Answer me.",
        { duration: 7 },
      );
      Q.setStage("mq23", "answer");
    },
  });
  ms.spot({
    id: "ms_whisper_corner",
    label: "Whisper into the corner",
    verb: "Whisper",
    when: () => at("mq23", "answer") || at("mq23", "follow"),
    get at() {
      const p = galleryPos("a");
      return p ? { x: p.x, y: p.y, z: p.z } : null;
    },
    use() {
      ms.talk(
        "dlg_ms_taper_gallery",
        "Brother Taper",
        at("mq23", "follow") ? "again" : "t1",
      );
    },
  });
  L.trigger({
    id: "ms_mq23_hatch",
    once: false,
    cooldown: 8,
    r: 5,
    pos: () => bulkheadPos(),
    cond: () =>
      at("mq23", "follow") && !ms.f("heard_humming") && !ms.f("mq23_caught"),
    fire() {
      ms.talk("dlg_ms_mq23_hatch", "Track 61 bulkhead", "h1");
    },
  });

  function pactAgree() {
    if (ms.f("dawn_pact")) return;
    ms.set("dawn_pact", "agree");
    L.setFlag("dawn_pact");
    L.give("q_glowkeeper_vestments", 1);
    L.factionTruce("glowkeepers", undefined, undefined, 0, false);
    if (roseNear(25)) {
      ms.set("dawn_pact_known");
      ms.addTrust(-1, "She heard you make a deal with the Dawn.");
    }
  }
  function pactRefuse() {
    if (ms.f("dawn_pact")) return;
    ms.set("dawn_pact", "refuse");
    L.setFlag("dawn_refused");
    ms.addTrust(+1, "You told the Dawn no.");
  }
  function toRose() {
    L.later(1.0, () => {
      if (Q.isActive("mq23") && Q.stage("mq23") !== "rose")
        Q.setStage("mq23", "rose");
    });
  }
  function finishMq23() {
    if (Q.isActive("mq23")) Q.complete("mq23");
  }
  const offer = [
    { text: "Tell her yes. Key B, for the truth about Nicole.", next: "agree" },
    { text: "No. The key goes in the harbour.", next: "refuse" },
  ];
  ms.dlg("dlg_ms_taper_gallery", "t1")
    .when(() => (at("mq23", "follow") ? "again" : null))
    .when(() => (ms.f("dawn_pact") ? "after" : null))
    .add({
      t1: {
        speaker: "Brother Taper",
        text: "[The voice goes on in your ear, though the man who owns it stands in the far corner with his face to the tiles: tall, hooded, a candle-lantern hooked at his belt. Your tunnel watcher from Chambers Street.] You said goodbye in this corner once. She told us. She tells us everything about you, sleeper, the way other people tell about saints.",
        responses: [
          { text: "Who told you?", next: "t_who" },
          { text: "What do you want?", next: "t2" },
        ],
      },
      t_who: {
        speaker: "Brother Taper",
        text: "The Dawn. The one who keeps the light on. You will meet her when the door opens, and not before.",
        responses: [{ text: "What do you want?", next: "t2" }],
      },
      t2: {
        speaker: "Brother Taper",
        text: "There is a key on Liberty Island. European, brass, a navigator's key. The Continuity keep it in a locker and do not know what it opens. Bring it to the Dawn, and the Dawn will give you what you have been asking the whole city for: the truth about Nicole Mead. All of it. Where she went. What became of her.",
        responses: [
          { text: "What does the key open?", next: "t_key" },
          { text: "How would I know the key?", next: "t3" },
        ],
      },
      t_key: {
        speaker: "Brother Taper",
        text: "A door. Every key opens a door. [He turns his hooded head a little, as if listening to something behind the tiles.] That is all I am given to say.",
        responses: [{ text: "How would I know it?", next: "t3" }],
      },
      t3: {
        speaker: "Brother Taper",
        text: "She says you'll know the key when you see it. She says: A dimanche.",
        onEnter() {
          ms.set("mq23_offer_heard");
        },
        responses: offer.concat([
          { text: "I need to think.", next: "t_think" },
        ]),
      },
      t_think: {
        speaker: "Brother Taper",
        text: "Think, then. The light stays on. [He bows to the wall, steps out from under the arch and walks off toward the lower concourse, unhurried, the lantern swinging at his hip.]",
        responses: [
          {
            text: "[Let him go, then follow at a distance.]",
            check: { skill: "stealth", value: 40 },
            next: "follow_ok",
            failNext: "caught",
          },
          { text: "[Let him go.]", next: "leave" },
        ],
      },
      follow_ok: {
        speaker: "Brother Taper",
        text: "[You count ten and go after him, keeping a pillar between you. He never looks back. He goes past the dead clocks and the sealed stair and down, toward the tunnels under the tracks.]",
        onEnter() {
          L.later(0.3, () => {
            if (at("mq23", "answer")) Q.setStage("mq23", "follow");
          });
          L.later(6, () => {
            const p = bulkheadPos();
            if (p)
              L.moveNPC(
                "ms_taper_gallery",
                L.freeSpot(p.x + 1.2, p.z + 1.0, p.y, { maxR: 4 }),
              );
          });
        },
        responses: [{ text: "[Follow.]" }],
      },
      caught: {
        speaker: "Brother Taper",
        text: "[You have gone four steps when the hood turns.] Don't follow me, sleeper. The door is not open for you. Not yet. [He waits, very patient.] Your answer.",
        onEnter() {
          ms.set("mq23_caught");
        },
        responses: offer.concat([{ text: "No answer.", next: "leave" }]),
      },
      leave: {
        speaker: "Brother Taper",
        text: "Then keep the light on, and think. She has waited a long time. She can wait a little longer. [He is gone into the crowd at the foot of the stair.]",
        onEnter() {
          toRose();
        },
        responses: [{ text: "[Go and find Rose.]" }],
      },
      agree: {
        speaker: "Brother Taper",
        text: "[He lets out a breath, as if he has been holding it since 1967.] Then the Dawn will know. When you have it, come to this corner on any night and whisper. Somebody will always be listening. [He holds out a folded bundle of ivory cloth.] For the road. The Brothers will know you by it.",
        onEnter() {
          pactAgree();
          toRose();
        },
        responses: [{ text: "[Take the vestments.]" }],
      },
      refuse: {
        speaker: "Brother Taper",
        text: "[A long pause.] She said you might. She said you always did hate being told where to stand. [He bows to the wall.] The light stays on regardless, sleeper. A dimanche.",
        onEnter() {
          pactRefuse();
          toRose();
        },
        responses: [{ text: "[Let him go.]" }],
      },
      again: {
        speaker: "Brother Taper",
        text: "[A whisper, from somewhere under the stone:] You are not where you were told to stand, sleeper. Answer, and go home.",
        responses: offer.concat([{ text: "No answer.", next: "leave" }]),
      },
      after: {
        speaker: "Brother Taper",
        text: "Keep the light on, sleeper.",
        responses: [{ text: "[Leave.]" }],
      },
    });
