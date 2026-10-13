// play-inline-555 01 — flag
// Lines 27-350 of readable/play-inline-555.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const TS = { x: -40, z: -262 },
    SP = { x: 160, z: -342 };
  const STOCK_LOUNGE = [
    [["rush", /^rush$/i], 3],
    [["rage", /^rage$/i], 2],
    [["bull_tabs", /bull tabs/i], 2],
    [["focus_pills", /focus pills/i], 2],
    [["fizzo_cola", /^fizzo cola$/i], 6],
    [["whiskey", /whiskey/i], 4],
    [["beer", /^beer$/i], 6],
    [["prussian_blue", /^prussian blue$/i], 2],
    [["vodka", /vodka/i], 2],
  ];
  const STOCK_GLOW = [
    [["dirty_water", /dirty water/i], 6],
    [["iodine_tabs", /iodine/i], 2],
    [["prussian_blue", /^prussian blue$/i], 1],
    [["fizzo_blue", /fizzo blue/i], 1],
    [["glowcap", /glowcap/i], 3],
    [["q_glowkeeper_vestments"], 1],
  ];
  const FIZZO_BLUE = () => L.item("fizzo_blue", /fizzo blue/i);

  // ---- locks (REBRAND §5): terminal passcodes, both told in dialogue below ----
  const LOCK_SCRIPTURE = {
    id: "neon_glow_scripture",
    label: "Glowkeeper Scripture Terminal",
    passcode: "LONGNOON",
    hint: "Sister Noonday on the cathedral steps recites it to anyone who asks to read the scripture.",
  };
  const LOCK_MAYOR = {
    id: "neon_mayor_terminal",
    label: "Mayor of the Neon — Office Terminal",
    passcode: "BIGBUZZ",
    hint: "Mayor Crowe tells anyone who asks about his office; it is also painted on the generator.",
  };
  /** The Book of the Kindling: written by the Dawn in the first winters (story/outline.json mq12), shared with 63_ms_act2.js. */
  const BOOK = {
    match:
      "In the year before the Kindling the city went dark. Every lamp from the river to the lakes went out at once, and in the great hall of the station ten thousand people stood in the dark and were afraid.\n\n" +
      "And a woman went among them with a box of matches, and lit what could be lit, and said to each one: Somebody has to keep the light on.\n\n" +
      "And a clerk of the city broke open a locker and found it full of candles, and gave them to her, one by one, until his hands were empty. And on his candle box she drew the Sun, with twelve rays, one for every hour of the dark.\n\n" +
      "That was the first candle. We keep it still.",
    eleven:
      "In the first winter of the Long Noon a child lay sick under the city, and the keepers of the medicine would not give it, because the child's name was on no list.\n\n" +
      "And when the Kindling was a year old, the mother went up to the keepers of the medicine with a match.\n\n" +
      "She struck a match to save one child and the fire took eleven, and she asked the Sun why, and the Sun said: I do not choose. Be like me.",
    psalm:
      "Sleep, you sleepers, under the city.\nNinety days of winter, and then the spring.\n\nWe do not wake you. We do not dig for you.\nWe keep the light on, and we wait.\n\nNinety days of winter, and then the spring.\nAnd when you wake, it will be Sunday.",
    rule: "Whoever comes into the Light is kindled, and takes a new name.\n\nThe old name is laid beneath a stone.\n\nDo not dig for it. The Sun does not choose, and neither do we. Over the kindled there is no list, no card, no number, and no name for anyone to refuse.",
  };
  /** Hollowell's errand can be offered (not started yet, or the main story started it and he hasn't handed it over). */
  const offerOpen = () =>
    !Q.isStarted("sq_glow") ||
    (Q.isActive("sq_glow") && Q.stage("sq_glow") === "take");
  function learnCode(id) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id);
      } catch (e) {
        /* ignore */
      }
    }
  }

  L.hook("init", function () {
    L.quest({
      id: "sq_neon",
      name: "Neon Heart",
      giver: "Mayor Lucius Crowe",
      location: "The Neon (Times Square)",
      desc:
        "The Neon, the trade town in Times Square that refused to be counted in '67, runs on an old-world generator the locals call the Big Buzz, and the Big Buzz is dying. " +
        "Mayor Crowe says a spare rig battery was left in the 42nd Street subway tunnels.",
      stages: [
        {
          id: "core",
          text: () =>
            'Recover the spare rig battery ("Big Buzz #2") from the 42nd Street subway tunnels' +
            (Q.isStarted("mq13")
              ? " before the Glowkeeper acolytes find it."
              : "."),
          // Q.start('sq_neon') is safe at any time (the main story's mq13 starts it): skip what is already done.
          onEnter() {
            L.later(0.1, neonSync);
          },
          markers: () =>
            L.pickups.neon_core && !L.has("q_neon_core")
              ? [
                  {
                    x: L.pickups.neon_core.pos.x,
                    z: L.pickups.neon_core.pos.z,
                    label: "Rig Battery",
                  },
                ]
              : [{ x: -60, z: -228, label: "Subway Entrance" }],
        },
        {
          id: "nh_repair",
          text: "(Optional) Get the Big Buzz running again without a new battery.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.stage("sq_neon") === "core" && L.skill("mechanics") >= 60,
          doneIf: () => L.flag("neon_outcome") === "repair",
          markers: () => [
            { npc: "neon_crowe", label: "The Big Buzz (Mayor Crowe)" },
          ],
        },
        {
          id: "return",
          text: "Bring the rig battery back to Mayor Crowe — or find another buyer.",
          markers: () => [{ npc: "neon_crowe", label: "Mayor Crowe" }],
        },
        {
          id: "nh_give",
          text: "(Optional) Give the battery to Mayor Crowe.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_neon") === "return",
          doneIf: () => L.flag("neon_outcome") === "crowe",
        },
        {
          id: "nh_cov",
          text: "(Optional) Sell the battery to Lancer Reyes of the Iron Covenant instead (400 scrip).",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.stage("sq_neon") === "return" &&
            !!(L.flag("met_stroud") || L.flag("mq_faction") === "covenant"),
          doneIf: () => L.flag("neon_outcome") === "sold",
          markers: () => [{ npc: "cov_reyes", label: "Lancer Reyes" }],
        },
        {
          id: "nh_glow",
          text: "(Optional) Hand the battery to the Glowkeepers.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_neon") === "return" && !!L.flag("met_ezra"),
          doneIf: () => L.flag("neon_outcome") === "glow",
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
      ],
      rewards: { xp: 300 },
      onComplete() {
        neonMirror();
      },
    });
    L.quest({
      id: "sq_glow",
      name: "The Long Noon",
      giver: "Keeper Ezra Hollowell",
      location: "St. Patrick's Cathedral",
      desc:
        'Keeper Hollowell of the Glowkeepers wants to "share the Light" with Grand Central Market by placing a hot relic in the ' +
        "market's water tower. Thousands drink from those taps.",
      stages: [
        // Q.start('sq_glow') is safe at any time (the main story's mq12 starts it): the Keeper hands over the isotope here,
        // and glowSync() skips straight to whatever the player has already done.
        {
          id: "take",
          text: "Take the Blessed Isotope from Keeper Hollowell at St. Patrick's, or tell him no.",
          onEnter() {
            L.later(0.1, glowSync);
          },
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
        {
          id: "plant",
          text: "Place the Blessed Isotope in Grand Central's water tower intake, or warn Stationmaster Okafor, swap it for something that only looks holy, or take it back to Hollowell.",
          markers: () =>
            [waterTowerMarker()].concat(
              L.flag("glow_told_delphine")
                ? []
                : [{ npc: "gc_delphine", label: "Stationmaster Okafor" }],
              [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
            ),
        },
        {
          id: "warn",
          text: "(Optional) Warn Stationmaster Okafor about the Glowkeepers.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !L.flag("glow_told_delphine") && !L.flag("glow_isotope_planted"),
          doneIf: () => !!L.flag("glow_told_delphine"),
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
        {
          id: "gk_placebo",
          text: "(Optional) Swap the isotope for something that only LOOKS holy (a bottle of Fizzo Blue).",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_glow") === "plant",
          doneIf: () => !!L.flag("glow_placebo_planted"),
        },
        {
          id: "gk_refuse",
          text: "(Optional) Give the isotope back and refuse the task.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("glow_refused"),
        },
        {
          id: "gk_convince",
          text: "(Optional) Talk Keeper Hollowell out of it.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("glow_convinced"),
        },
        {
          id: "return",
          text: () =>
            (L.flag("glow_isotope_planted")
              ? "Grand Central's taps are glowing. "
              : L.flag("glow_placebo_planted")
                ? "The reliquary glows a soft Fizzo blue — harmlessly. "
                : "") +
            "Return to Keeper Hollowell at St. Patrick's Cathedral.",
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
      ],
      rewards: { xp: 250 },
      onComplete() {
        glowMirror();
      },
    });
    L.quest({
      id: "sq_blackfriday",
      name: "Doors at Four",
      giver: "Wendell Pruitt",
      location: "Sterling's of Herald Square",
      desc:
        "Wendell, a Neon old-timer, worked Housewares at Sterling's and hid an engagement ring in the manager's safe the night before the bombs. " +
        "Sterling's is now full of Maniacs, customers and staff whose minds went, still waiting for the doors to open on the big sale.",
      stages: [
        {
          id: "ring",
          text: "Retrieve Wendell's ring from the Sterling's manager's safe.",
          // ring already looted before Wendell asked (the pickup exists from game start): go straight to the hand-in
          onEnter() {
            if (L.has("q_wendell_ring")) Q.setStage("sq_blackfriday", "return");
          },
          markers: () =>
            L.pickups.wendell_ring && !L.has("q_wendell_ring")
              ? [
                  {
                    x: L.pickups.wendell_ring.pos.x,
                    z: L.pickups.wendell_ring.pos.z,
                    label: "Manager's Safe",
                  },
                ]
              : [{ x: 0, z: -50, label: "Sterling's" }],
        },
        {
          id: "return",
          text: "Bring the ring to Wendell in the Neon.",
          markers: () => [{ npc: "neon_wendell", label: "Wendell" }],
        },
        {
          id: "marjorie",
          text: "(Optional) Ask Marigold about her past.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_blackfriday") === "return",
          doneIf: () => !!L.flag("marigold_is_marjorie"),
          markers: () => [{ npc: "neon_marigold", label: "Marigold" }],
        },
        {
          id: "bf_wed",
          text: "(Optional) Bring Wendell and Marjorie back together.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("marigold_is_marjorie") && !L.flag("ring_resolved"),
          doneIf: () => !!L.flag("wendell_wed"),
        },
        {
          id: "bf_keep",
          text: "(Optional) Keep the ring for yourself.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("ring_kept"),
        },
      ],
      rewards: { xp: 250 },
    });
  });

  function waterTowerSpot() {
    return L.anchor(
      "grand_central",
      ["water_main", "water_tower", "roof_tank"],
      { x: 267, z: -200 },
    );
  }
  function waterTowerMarker() {
    const p = waterTowerSpot();
    return p ? { x: p.x, z: p.z, label: "Water Tower Intake" } : null;
  }

  // ---- event hooks ----
  G.events.on("itemAdded", (id) => {
    if (id === "q_neon_core") {
      if (!Q.isStarted("sq_neon")) Q.start("sq_neon", { stage: "return" });
      else if (Q.stage("sq_neon") === "core") Q.setStage("sq_neon", "return");
    }
    if (id === "q_wendell_ring") {
      if (Q.stage("sq_blackfriday") === "ring")
        Q.setStage("sq_blackfriday", "return");
    }
  });

  // ---- world ----
