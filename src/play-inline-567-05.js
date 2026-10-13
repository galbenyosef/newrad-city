// play-inline-567 05 — when
// Lines 956-1223 of readable/play-inline-567.pretty.js (statement-aligned).
  L.hook("init", function () {
    ms.quest({
      id: "mq13",
      giver: "Mayor Lucius Crowe",
      location: "The Neon (Times Square); 42nd Street Subway Tunnels",
      desc: () =>
        "Mayor Crowe of the Neon was at the Relief Station Riot in 1968." +
        (L.flag("ms_crowe_riot")
          ? " He saw the Candle Lady strike the match, and come out of the fire with a baby in one arm and her hand on fire; behind her, eleven children didn't come out."
          : "") +
        " The Neon's generator is dying, and the spare rig battery in the 42nd Street tunnels is wanted by the Glowkeepers too. Who ends up holding it will matter.",
      stages: [
        {
          id: "crowe",
          text: "Ask Mayor Crowe in the Neon about the Sixty-One Camp and the 1968 riot.",
          markers: () => [{ npc: "neon_crowe", label: "Mayor Crowe" }],
        },
        ms.proxy("mq13", "sq_neon", {
          id: "battery",
          text: 'Recover "Big Buzz #2" from the 42nd Street tunnels, then decide who gets it: Crowe, the Covenant or the Glowkeepers.',
          next: null,
          reach: {
            site: "times_square",
            anchors: ["mayor", "stage"],
            fallback: TS,
            label: "The Neon",
            r: 15,
          },
          onDone() {
            if (N().neonMirror) N().neonMirror();
          },
        }),
        {
          id: "bulkhead",
          text: "(Optional) Inspect the welded TRACK 61 bulkhead in the tunnels.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq13", "battery"),
          doneIf: () => !!ms.f("bulkhead_seen"),
          markers: spotMark("ms_spot_bulkhead", "TRACK 61 Bulkhead"),
        },
      ],
      rewards: { xp: 400 },
      onComplete() {
        if (N().neonMirror) N().neonMirror();
      },
    });
  });
  ms.solver("mq13", {
    crowe() {
      toBattery();
    },
    battery() {
      if (Q.get("sq_neon") && N().neonResolve) {
        if (!Q.isStarted("sq_neon")) Q.start("sq_neon");
        N().neonResolve("crowe");
      } else Q.complete("mq13");
    },
  });

  // ==================================================================
  // mq14 — JAMMING SEASON (Ruby Kehoe; pmid_q_deadair; the 1968 file; M-61)
  // ==================================================================
  function heardStory() {
    L.setFlag("ms_ruby_story");
    if (at("mq14", "ruby_story")) Q.setStage("mq14", "jammer");
  }
  function freeRuby(loud) {
    if (ms.f("ruby_free")) return;
    ms.set("ruby_free");
    ms.set("waldorf_loud", !!loud);
    if (loud) {
      const p = G.player && G.player.pos;
      if (p) L.factionTruce("continuity", p.x, p.z, 45, true);
      L.notify("Every Continuity boot on the floor is coming your way.", {
        quiet: true,
      });
    } else L.xp(50, "Quietly does it");
    if (at("mq14", "ruby")) Q.setStage("mq14", "file");
  }
  function fileRead() {
    if (!ms.f("file_1968_read")) {
      ms.set("file_1968_read");
      L.setFlag("ms_lumiere_hint");
      L.xp(40, "File 68-0305");
    }
    if (at("mq14", "file")) Q.setStage("mq14", "pass");
  }
  function passTo(kind) {
    if (L.flag("ms_pass_done")) return;
    L.setFlag("ms_pass_done", kind);
    if (kind === "keep" || kind === "buy") {
      if (kind === "buy") L.pay(50);
      ms.token("pass");
      if (!L.has("ms_un_pass")) L.give("ms_un_pass", 1);
    } else {
      if (L.has("ms_un_pass")) L.take("ms_un_pass", 1);
      L.standing(10, "Gave Ruby back her find");
    }
    if (Q.isActive("mq14")) Q.complete("mq14");
    L.later(5, () => {
      L.setFlag("ms_ruby_home");
      ms.pollRoster();
    }); // back to her stall in the Neon (after the conversation)
  }
  G.events.on("itemAdded", (id) => {
    if (id === "ms_note_file_mead_1968") {
      if (!L.has("ms_un_pass") && !L.flag("ms_pass_done"))
        L.give("ms_un_pass", 1);
    }
    if (id === "ms_note_acolyte") L.setFlag("ms_acolyte_card");
  });
  G.events.on("noteRead", (id) => {
    if (
      id === "ms_note_file_mead_1968" &&
      (at("mq14", "file") || Q.isActive("mq14"))
    )
      fileRead();
    if (id === "ms_note_register_61" && at("mq11", "register61")) readPages();
  });
  G.events.on("questFlag", (name, v) => {
    if (name === "pmid_jammer_off" && v) ms.set("waldorf_jammer_down");
  });

  ms.actor({
    id: "ms_thimble",
    when: () => Q.isStarted("mq14"),
    def: {
      type: "human",
      name: "Thimble",
      gender: "f",
      age: 15,
      outfit: "settler",
      hair: "bob",
      faction: "settlers",
      hostile: false,
      essential: true,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      level: 2,
      dialogue: "dlg_ms_thimble",
      at: Object.assign({ maxR: 6 }, P.market),
      barks: [
        "Coats. Mending. No credit.",
        "Ruby'd have that sleeve done by now.",
        "Hold still, I'm measuring the air.",
      ],
    },
  });
  const rubyDef = (where) => ({
    type: "ruby_kehoe",
    preset: "ruby",
    name: "Ruby Kehoe",
    gender: "f",
    age: 62,
    outfit: "settler",
    hair: "bun",
    faction: "settlers",
    hostile: false,
    essential: true,
    ai: "guard",
    home: "here",
    homeR: 1.5,
    level: 4,
    dialogue: "dlg_ms_ruby",
    at: Object.assign({ maxR: 5 }, R(where)),
    barks: [
      "Coats come with all sorts in the linings.",
      "Still winter, whatever the calendar says.",
    ],
  });
  // Held in the Waldorf while mq14 runs (ms_ruby); afterwards at her stall in the Neon market (ms_ruby_market, a second
  // stable id so the saved Waldorf position is never restored onto the market Ruby).
  ms.actor({
    id: "ms_ruby",
    when: () =>
      (Q.isActive("mq14") && Q.reached("mq14", "jammer")) ||
      (Q.isComplete("mq14") && !L.flag("ms_ruby_home")),
    def: () => rubyDef(P.rubyCell),
  });
  ms.actor({
    id: "ms_ruby_market",
    when: () => Q.isComplete("mq14") && !!L.flag("ms_ruby_home"),
    def: () => rubyDef(P.market),
  });
  ms.pickup({
    key: "ms_file_1968",
    item: "ms_note_file_mead_1968",
    when: () => !!ms.f("ruby_free") && Q.isStarted("mq14"),
    at: P.rubyFile,
  });
  ms.spot({
    id: "ms_spot_m61",
    label: "Freight elevator (M-61)",
    verb: "Examine",
    radius: 1.3,
    when: () => Q.isStarted("mq14"),
    get at() {
      return P.m61();
    },
    use() {
      const firstTime = !ms.f("m61_seen");
      ms.set("m61_seen");
      L.notify(
        "A service freight elevator, its doors welded shut along every seam. Stencilled on the lintel: M-61. A brass tag wired to the handle: SEALED BY ORDER — OCD — 10 III 1968.\n\n" +
          "You put your ear to the steel. Far below, so faint it might be your own blood, something hums.",
        { duration: 10 },
      );
      if (firstTime) L.xp(30, "The M-61 shaft");
    },
  });

  ms.dlg("dlg_ms_thimble", "idle")
    .when(() => (at("mq14", "ruby_story") ? "story" : null))
    .add({
      idle: {
        speaker: "Thimble",
        text: () =>
          Q.isComplete("mq14")
            ? "Ruby's back. She's been telling everybody you shot a door for her. [Pause.] Did you shoot a door?"
            : "Coats. Mending. No credit. Ruby's rule, not mine.",
        responses: [{ text: "See you, Thimble." }],
      },
      story: {
        speaker: "Thimble",
        text:
          "[A girl of fifteen or so sits cross-legged in a coat stall, a mouthful of pins, re-lining a sleeve with tent canvas. A hand-lettered sign: KEHOE — COATS — MENDING — NO CREDIT.] " +
          "You're the sleeper. Rocky said you might come. [She spits the pins into her palm.] They took Ruby. Three days ago. The Continuity, from the Waldorf.",
        responses: [
          { text: "Who's Ruby? Why did they take her?", next: "story2" },
        ],
      },
      story2: {
        speaker: "Thimble",
        text:
          "Ruby Kehoe. My boss. Best coat-woman in the Neon; she's been here since before I was born. This winter she was re-lining an old green coat, good wool, and there was a card sewn up inside the lining. A pass from the United Nations, from 1967. Some lady interpreter. " +
          "And Ruby knew the name, because it's on a bill the Continuity nailed up at their checkpoint on Park Avenue years and years ago. WANTED. With a reward. So she took the pass up there to claim it.",
        responses: [{ text: "What name?", next: "story3" }],
      },
      story3: {
        speaker: "Thimble",
        text:
          "Mead. Nicole Mead. [She watches your face change.] ...You knew her. " +
          'Ruby always told it the same way, about that coat. She swapped for it in March of \'68 "from a woman going with the sun people, a baby asleep in a sling. She said the Light would keep them warm." ' +
          "Ruby gave her two blankets and a pair of mittens for it and thought she'd cheated her.",
        responses: [
          { text: "I'll get Ruby out.", action: () => heardStory() },
          { text: "What happened at the Waldorf?", next: "story4" },
        ],
      },
      story4: {
        speaker: "Thimble",
        text: "They didn't pay her. They put her in a room. Rocky says the Continuity's got a jamming thing on the Waldorf roof stepping on his show, too, and he wants it gone. You go up there for one, you might as well do the other.",
        responses: [{ text: "I'll get her out.", action: () => heardStory() }],
      },
    });
  const RUBY = ms.dlg("dlg_ms_ruby", "idle");
  RUBY.when(() => (Q.isActive("mq14") && !ms.f("ruby_free") ? "held" : null));
  RUBY.when(() => (at("mq14", "jammer") ? "wait_jammer" : null));
  RUBY.when(() =>
    atAny("mq14", ["ruby", "file"])
      ? L.has("ms_note_file_mead_1968")
        ? "file_have"
        : "freed"
      : null,
  );
  RUBY.when(() => (at("mq14", "pass") ? "pass" : null));
