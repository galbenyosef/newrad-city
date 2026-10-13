// play-inline-566 02 — responses
// Lines 342-648 of readable/play-inline-566.pretty.js (statement-aligned).
  UNKINDLED.forEach((u, i) => {
    ms.actor({
      id: u.id,
      when: houseOn,
      def: () => ({
        type: "unkindled_" + u.name.toLowerCase(),
        preset: "unkindled",
        name: u.name,
        gender: u.gender,
        age: u.age,
        hair: u.hair,
        hat: u.hat,
        outfit: "drifter",
        faction: "raiders",
        hostile: false,
        essential: true,
        ai: "guard",
        home: "here",
        homeR: 3,
        level: 4,
        weapon:
          i === 3
            ? ["hunting_rifle", "bolt_rifle_32"]
            : ["bolt_rifle_32", "pistol_32"],
        dialogue: "dlg_ms_unkindled",
        at: {
          site: "tudor_city",
          anchors: ["unkindled" + (i + 1), "ext_roof"],
          fallback: { x: 316 + (i - 1.5) * 2.2, z: -166 + (i % 2) * 2 },
          maxR: 6,
        },
        barks: u.line,
      }),
    });
  });
  ms.dlg("dlg_ms_unkindled", "hi").add({
    hi: {
      text: (a) => {
        const n = a && a.name;
        if (n === "Jory")
          return "Jory. I run messages. Four years out of the tunnels and I still count candles in my sleep. Flint's up on the gantry if you want her. You don't want her when she's on the gantry.";
        if (n === "Pockets")
          return "Pockets. Because of the pockets. [She has eleven.] I don't do candles. We don't do candles here. We do sparks.";
        if (n === "Beanie")
          return "I'm Beanie. I'm twelve. I was born down there, same as Flint. Same as everybody. We call ourselves the Unkindled. Flint made it up. It means we didn't burn.";
        return "Ash. I'm the oldest, after Flint. If you're here for trouble, we've got four rifles and a very long drop. If you're here for Flint, she'll decide.";
      },
      responses: [
        { text: "What are the Unkindled?", next: "what" },
        { text: "See you around." },
      ],
    },
    what: {
      text: "Kids who got out. The sun people raise you to sing in the dark and wait for the Light. Some of us stopped waiting. Flint got out first. She came back for the rest of us, one at a time, through the tunnels, with that rifle. So: we keep her sign lit, and the Court lets us sleep on the roof.",
      responses: [
        { text: "She came back for you.", next: "back" },
        { text: "Thanks." },
      ],
    },
    back: {
      text: "Every one. She says it was for the practice. [A shrug.] She says a lot of things.",
      responses: [{ text: "Thanks." }],
    },
  });

  // Sol's composite dialogue
  const SOL = ms.dlg("dlg_ms_sol", "idle");
  SOL.add({
    idle: {
      speaker: "Sol Abramowitz",
      text: () =>
        L.flag("ms_sol_letter_given")
          ? [
              "Mind the step.",
              "She still has her old key, you know. Flint. To 9C. I never asked for it back.",
              "Twenty-two years I kept that letter dry. Felt good to hand it over. Felt terrible.",
            ][Math.floor(Math.random() * 3)]
          : "Tudor City, five Tudor City Place. I'm Sol. I was the doorman here before the Bombing and I'm the doorman here now. The building got worse. The job didn't change.",
      responses: [
        {
          text: "Tell me about Nicole Mead.",
          next: "nicole",
          cond: () => Q.isStarted("mq07") && !L.flag("ms_sol_letter_given"),
        },
        {
          text: "How long have you known Flint?",
          next: "flint",
          cond: () => !!L.flag("ms_rose_met"),
        },
        { text: "Take care, Sol." },
      ],
    },
    nicole: {
      text: "9C. Miss Mead and Miss Brady. The French girl — Canadian, she'd correct you — and the reporter. Miss Mead tipped at Christmas in chocolate and wrote me a card every year with a little sun on it. [He looks at your suit a long time.] And you're the fella. The freezer fella. She showed me your picture so I'd let you up without calling. You never came. Then nobody came.",
      onEnter() {
        if (at("mq07", "sol")) L.setFlag("ms_sol_talked");
      },
      responses: [
        { text: "Did she come back here after the Bombing?", next: "back" },
        { text: "I need to know what happened to her.", next: "back" },
      ],
    },
    back: {
      text: "Twice. Autumn of '67 she came up the back stairs round as a harvest moon, laughing at me for staring. Took some things from 9C and went back down to wherever she was living. Underground somewhere. The station. Then spring of '68, March, she came again with a baby on her hip and her hand wrapped in rags, and she wasn't laughing. She gave me a letter. \"For when he wakes up,\" she said. I said, Miss Mead, he's not waking up. She said, \"Then you'll have it forever, Sol, and that's a nice thing to have.\"",
      responses: [{ text: "You kept it. Twenty-one years.", next: "letter" }],
    },
    letter: {
      text: "In my coat, in the inside pocket, wrapped in a bread bag. Two fires and a flood. [He takes out a folded envelope, soft as cloth, and holds it a moment before he gives it to you.] Your name's on the front. Well. Your first name. She didn't need the rest.",
      onEnter() {
        if (!L.has("ms_note_nicole_1968")) L.give("ms_note_nicole_1968", 1);
        L.setFlag("ms_sol_letter_given");
        if (at("mq07", "sol")) Q.setStage("mq07", "letter");
      },
      responses: [
        { text: "[Read it now.]", next: "read" },
        { text: "Thank you, Sol." },
      ],
    },
    read: {
      speaker: "",
      text: () =>
        G.items && G.items.get && G.items.get("ms_note_nicole_1968")
          ? G.items.get("ms_note_nicole_1968").text
          : "",
      onEnter() {
        readLetter();
      },
      responses: [{ text: "[Fold it up again.]", next: "after" }],
    },
    after: {
      speaker: "Sol Abramowitz",
      text: "The baby had a little red hat. Somebody knitted it. That's all I know. [He does not look at you.] That's all I know.",
      responses: [{ text: "...Thank you." }],
    },
    flint: {
      text: "Five years. She came up the elevator shaft one night in '84, sixteen, soaked, with a burned wrist she wouldn't let me look at, and asked if 9C was still empty. I said it's been empty since before you were born, kid. She said \"I know.\" [He shrugs.] So I gave her the roof. The Court doesn't argue with me. I'm the only one who knows how the boiler works.",
      responses: [{ text: "Thanks, Sol." }],
    },
  });
  function readLetter() {
    if (!L.flag("ms_letter_read")) {
      L.setFlag("ms_letter_read");
      L.xp(40, "Nicole's letter");
    }
    if (at("mq07", "letter") || at("mq07", "sol")) Q.complete("mq07");
  }
  G.events.on("noteRead", (id) => {
    if (id === "ms_note_nicole_1968") readLetter();
    if (id === "ms_note_dawn_hour_1" && at("mq10", "dawnhour"))
      dawnHourHeard("transcript");
  });

  // ------------------------------------------------------------------
  // Chambers Street: the watcher and the rooftop shot (right after mq01)
  // ------------------------------------------------------------------
  function cryoOut() {
    return G.LAYOUT.cryoExit || { x: 150, z: 588 };
  }
  const spotAt = {}; // Chambers Street spot positions (computed once the world is built)
  function watcherSpot() {
    const X = cryoOut();
    return L.freeSpot(X.x - 6, X.z - 16, undefined, { maxR: 8 });
  }
  ms.actor({
    id: "ms_taper_chambers",
    removeWhenOff: true,
    when: () => !!L.flag("ms_watcher_scene") && !L.flag("ms_watcher_fled"),
    def: () => ({
      type: "brother_taper",
      preset: "taper",
      name: "Robed Watcher",
      gender: "m",
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: false,
      essential: true,
      ai: "static",
      level: 5,
      pos: watcherSpot(),
      barks: ["..."],
    }),
  });
  L.hook("update", function () {
    if (!L.flag("left_cryo") || L.flag("ms_watcher_scene") || !G.player) return;
    const X = cryoOut(),
      p = G.player.pos;
    if (p.x >= G.LAYOUT.INTERIOR_X_MIN || Math.hypot(p.x - X.x, p.z - X.z) > 30)
      return;
    L.setFlag("ms_watcher_scene");
    ms.pollRoster();
    L.later(3.5, () => {
      const a = L.npc("ms_taper_chambers");
      if (a && a.faceTowards) {
        try {
          a.faceTowards(p.x, p.z);
        } catch (e) {
          /* */
        }
      }
      L.notify(
        "Across Chambers Street a man in grey robes stands very still, a lantern raised in one hand, as if to see your face better. A twelve-ray sun is stitched on his breast.",
        { duration: 7 },
      );
    });
    L.later(10, () => {
      L.sfx("gunshot_rifle_far", { volume: 0.9 });
      L.sfx("glass_break", { volume: 0.6 });
      L.notify(
        "CRACK. A rifle, somewhere high. The watcher's lantern bursts in his hand. He drops it and runs north, robes flapping, into the Ruins.",
        { duration: 7 },
      );
      const a = L.npc("ms_taper_chambers");
      if (a && a.moveTo) {
        try {
          a.moveTo(a.pos.x + 4, a.pos.z - 60);
        } catch (e) {
          /* */
        }
      }
      L.setFlag("ms_watcher_shot");
    });
    L.later(16, () => {
      L.setFlag("ms_watcher_fled");
      ms.pollRoster();
    });
  });
  ms.spot({
    id: "ms_spot_watcher",
    label: "The watcher's trail",
    verb: "Chase",
    when: () => !!L.flag("ms_watcher_shot") && !L.flag("ms_watcher_chased"),
    at: () => spotAt.ms_spot_watcher || null,
    use() {
      ms.talk("dlg_ms_chambers", "Chambers Street", "chase");
    },
  });
  ms.spot({
    id: "ms_spot_shooter",
    label: "Fire escape",
    verb: "Search",
    when: () => !!L.flag("ms_watcher_shot") && !L.flag("ms_saw_shooter_done"),
    at: () => spotAt.ms_spot_shooter || null,
    use() {
      ms.talk("dlg_ms_chambers", "Chambers Street", "shooter");
    },
  });
  ms.dlg("dlg_ms_chambers", "chase").add({
    chase: {
      speaker: "",
      text: "The lantern lies in the slush where he dropped it, still smoking. His tracks go north between the burned cars.",
      responses: [
        {
          text: "[Reflex 6] Run him down.",
          check: { attr: "reflex", value: 6 },
          next: "caught",
          failNext: "lost",
        },
        {
          text: "[Stealth 25] Follow him quietly.",
          check: { skill: "stealth", value: 25 },
          next: "caught",
          failNext: "lost",
        },
        { text: "[Let him go.]", action: () => L.setFlag("ms_watcher_chased") },
      ],
    },
    caught: {
      text: "Two blocks north he ducks into a doorway and out the back, and he's gone — but in the doorway, dropped in his hurry, is a fold of brown paper.",
      onEnter() {
        L.setFlag("ms_watcher_chased");
        ms.set("saw_watcher");
        if (!L.has("ms_note_glow_tract")) L.give("ms_note_glow_tract", 1);
        L.xp(25, "Chased the watcher");
      },
      responses: [{ text: "[Unfold it.]", next: "tract" }],
    },
    tract: {
      text: "A tract. At the top, inked by hand, a small sun with twelve rays. You know that sun. You have three letters in your pocket signed with it, and the short ray at four o'clock is short on this one too.",
      responses: [{ text: "...That's her sun." }],
    },
    lost: {
      text: "Two blocks north the tracks run into a crowd of burned-out buses and simply stop. There's a smell of candle smoke and nothing else.",
      onEnter() {
        L.setFlag("ms_watcher_chased");
      },
      responses: [{ text: "[Give up.]" }],
    },
    shooter: {
      speaker: "",
      text: "The shot came from the fire escape on the old Hall of Records side. You climb two flights. On the third landing: a square of cardboard to kneel on, a bootprint, and a single spent casing.",
      onEnter() {
        L.setFlag("ms_saw_shooter_done");
        ms.set("saw_shooter");
        if (!L.has("ms_flint_casing")) L.give("ms_flint_casing", 1);
        L.xp(25, "Found the shooter's nest");
      },
      responses: [{ text: "[Look at the casing.]", next: "casing" }],
    },
    casing: {
      text: "A rifle casing, a strip of white tape wound round it. Neon-tube tape. Somebody marks their brass, and somebody was waiting up here for you, or for him.",
      responses: [{ text: "[Pocket it.]" }],
    },
  });

  // ------------------------------------------------------------------
  // QUESTS
  // ------------------------------------------------------------------
