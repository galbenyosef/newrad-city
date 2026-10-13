// play-inline-567 11 — rose
// Lines 2751-2917 of readable/play-inline-567.pretty.js (statement-aligned).
  L.hook("init", function () {
    ms.quest({
      id: "mq18",
      giver: "Flint",
      location:
        "St. Patrick's Cathedral, the Kindling Garden; the Tudor City roof",
      desc: () => {
        if (Q.isComplete("mq18")) {
          return (
            "Flint is Rose Mead: " +
            first() +
            '\'s daughter, born on Track 61, raised by the Glowkeepers as "Little Sun", runaway at sixteen. The Glowkeepers keep an unexploded 1967 bomb, the Second Sun, under Grand Central. ' +
            "It takes two keys; one is held on Liberty Island, where Zeke is. Rose wants that key, so that nobody ever turns it.\n\nNICOLE MEAD: DECEASED (1968)?"
          );
        }
        return (
          "Flint wants to show " +
          first() +
          " something at St. Patrick's: the Kindling Garden, where the Glowkeepers lay down the old names."
        );
      },
      stages: [
        {
          id: "flint",
          text: "Meet Flint on the Tudor City roof.",
          markers: () => ms.rose.marker("Flint"),
          onEnter() {
            if (ms.rose.mode() === "gone") ms.rose.place("home");
          },
        },
        {
          id: "garden",
          text: "Go to the Kindling Garden at St. Patrick's with Flint.",
          markers: markAt(P.garden, "The Kindling Garden"),
        },
        {
          id: "stone",
          text: "Find the stone.",
          markers: spotMark("ms_spot_kindling_stone", "Kindling stone"),
        },
        {
          id: "ground",
          text: "(Senses 6) Look at the ground around the stone.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq18", "stone"),
          doneIf: () => !!ms.f("stone_undug"),
          failIf: () =>
            !!L.flag("ms_stone_ground_failed") && !ms.f("stone_undug"),
          markers: spotMark("ms_spot_kindling_stone", "Kindling stone"),
        },
        {
          id: "confront",
          text: () =>
            revealed()
              ? "Talk to Rose."
              : 'Confront Flint: "Your name isn\'t Flint."',
          markers: () => ms.rose.marker(),
        },
        {
          id: "roof",
          text: "Hear Rose out on the Tudor City roof.",
          markers: () =>
            markAt(ms.rose.HOME, "Rose's roof")().concat(
              ms.rose.marker("Rose"),
            ),
        },
        {
          id: "ring",
          text: "Decide what to do with your grandmother's ring: give it to Rose, lay it on the stone, or keep it.",
          markers: () =>
            ms.rose
              .marker("Rose")
              .concat(spotMark("ms_spot_kindling_stone", "Kindling stone")()),
        },
        {
          id: "dig",
          text: "(Optional) Dig up the grave.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!ms.f("stone_dug"),
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        reveal();
        if (ms.trust() >= 2) ms.set("rose_follow_ok");
        ms.rose.place("home");
        L.later(3, () =>
          L.notify("Quest log: NICOLE MEAD: DECEASED (1968)?", { duration: 6 }),
        );
      },
    });
  });
  ms.solver("mq18", {
    flint() {
      startWalk();
    },
    garden() {
      arriveGarden();
    },
    stone() {
      readStone();
    },
    confront() {
      reveal();
      L.setFlag("ms_rose_lie1");
      ms.set("rose_lie1");
      if (ms.once("mq18_hug")) ms.addTrust(1, "test");
      Q.setStage("mq18", "roof");
    },
    roof() {
      heardOut();
    },
    ring() {
      ringTo("rose");
    },
  });

  // ------------------------------------------------------------------
  // Debug: G.quests.debug.act2
  // ------------------------------------------------------------------
  G.quests.debug.act2 = {
    walk: (id) => ms.walk(id),
    flags: () => {
      const keys = [
        "knows_daughter",
        "token_rose_page",
        "book_read",
        "glow",
        "glow_warned",
        "crowe_riot",
        "bulkhead_seen",
        "sun_battery",
        "waldorf_jammer_down",
        "waldorf_loud",
        "ruby_free",
        "file_1968_read",
        "m61_seen",
        "token_pass",
        "bureau",
        "codebook_on_liberty",
        "nell",
        "token_nell",
        "finder_built",
        "dawn_relay",
        "eli_replied",
        "voice_reached",
        "token_voice",
        "stone_undug",
        "stone_dug",
        "rose_revealed",
        "rose_lie1",
        "ring",
        "rose_follow_ok",
        "rose_trust",
      ];
      const o = {};
      for (const k of keys) o["ms_" + k] = L.flag("ms_" + k);
      return o;
    },
    dawn: () => {
      waitDawn();
      return G.time && G.time.hour;
    },
  };
