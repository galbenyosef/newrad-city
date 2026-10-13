// play-inline-555 03 — flag
// Lines 701-886 of readable/play-inline-555.pretty.js (statement-aligned).
  function glowMirror() {
    const v = L.flag("glow_isotope_planted")
      ? "planted"
      : L.flag("glow_convinced")
        ? "convinced"
        : L.flag("glow_told_delphine")
          ? "warned"
          : L.flag("glow_placebo_planted")
            ? "placebo"
            : L.flag("glow_refused")
              ? "refused"
              : null;
    if (v && L.flag("ms_glow") !== v) L.setFlag("ms_glow", v);
    if (L.flag("glow_told_delphine") && !L.flag("ms_glow_warned"))
      L.setFlag("ms_glow_warned", true);
    const ms = L.ms;
    if (!ms) return;
    if (L.flag("glow_isotope_planted") && ms.once("glow_trust_planted"))
      ms.addTrust(-2, "Grand Central's taps are glowing");
    if (L.flag("glow_told_delphine") && ms.once("glow_trust_warned"))
      ms.addTrust(1, "You warned Grand Central");
    if (L.flag("glow_convinced") && ms.once("glow_trust_convinced"))
      ms.addTrust(1, "You talked the Keeper down");
  }
  // Delphine's warning is set by her own dialogue (30_midtown.js).
  G.events.on("questFlag", (name) => {
    if (name === "glow_told_delphine" || name === "glow_convinced")
      glowMirror();
  });

  function neonResolve(how) {
    L.setFlag("neon_core_resolved");
    L.setFlag("neon_outcome", how);
    neonMirror();
    if (how === "crowe" || how === "repair") {
      L.news(
        "Good news from Times Square! The lights of the Neon are shining brighter than they have since '67. Mayor Crowe says drinks are on the house tonight. Mayor Crowe has since clarified that drinks are NOT on the house. But the lights are nice.",
      );
    } else if (how === "left") {
      L.news(
        "Times Square went dark last night, friends. Folks at the Neon say a line of robes came up out of the 42nd Street tunnels carrying something heavy between them, singing. Whatever it was, the Neon isn't getting it back. Candles tonight in the Neon.",
      );
    } else {
      L.news(
        how === "glow"
          ? "Times Square went dark last night, friends. The Neon's generator gave up, and word is the Glowkeepers are very, very happy about it. Say a prayer for the folks in the Neon tonight."
          : "Times Square went dark last night. Somebody sold the Neon's last rig battery to the Iron Covenant. The Neon is lighting candles. Candles, folks. In 1989.",
      );
    }
    if (!Q.isStarted("sq_neon")) Q.start("sq_neon");
    Q.complete("sq_neon");
  }
  /** Main story mirror (mq13): who holds the battery the Second Sun will need. */
  function neonMirror() {
    const o = L.flag("neon_outcome");
    const v =
      o === "crowe"
        ? "neon"
        : o === "repair"
          ? "repaired"
          : o === "sold"
            ? "covenant"
            : o === "glow" || o === "left"
              ? "glowkeepers"
              : null;
    if (v && L.flag("ms_sun_battery") !== v) L.setFlag("ms_sun_battery", v);
  }
  /** sq_neon may be started by the main story at any time. */
  function neonSync() {
    if (!Q.isActive("sq_neon")) return;
    if (L.flag("neon_core_resolved")) {
      neonMirror();
      Q.complete("sq_neon");
      return;
    }
    if (Q.stage("sq_neon") === "core" && L.has("q_neon_core"))
      Q.setStage("sq_neon", "return");
  }
  /** A part of the Book of the Kindling was read at the teletype (the main story counts it). */
  function bookRead(part) {
    if (L.ms && L.ms.kindlingRead) L.ms.kindlingRead(part, "terminal");
    else L.setFlag("ms_book_" + part, true);
  }
  L.neon = {
    neonResolve,
    plantIsotope,
    takeIsotope,
    refuseIsotope,
    glowMirror,
    neonMirror,
    coreSpot: () => subwayCoreSpot(),
    waterTower: () => waterTowerSpot(),
    BOOK,
  };

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
  L.hook("register", function () {
    if (G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({ kind: "terminal" }, LOCK_SCRIPTURE));
        G.locks.register(Object.assign({ kind: "terminal" }, LOCK_MAYOR));
      } catch (e) {
        /* ignore */
      }
    }
    L.terminal("glow_scripture", {
      title: "THE BOOK OF THE KINDLING",
      header:
        "TELETYPE SERVICE LINE — ARCHDIOCESE OF NEW YORK (REPURPOSED)\nTHE NOON IS LONG",
      lock: { id: LOCK_SCRIPTURE.id, passcode: LOCK_SCRIPTURE.passcode },
      // The Book of the Kindling is written in the Dawn's words (story/outline.json mq12). Reading the parables is
      // an objective of the main story's mq12 (L.ms.kindlingRead, 63_ms_act2.js).
      entries: [
        {
          title: "The Kindling, 1:1-4",
          text: "In the old days there was one sun, and it rose, and it set, and it answered no one.\nAnd on a grey Sunday morning in March the Sun came down over Yonkers, and the city was kindled, and it was very, very warm.\nAnd the Sun said: Be warm. I do not choose.\nAnd the Long Noon began, and it has not ended, and the shadows have been short ever since. And one day a Second Sun will rise.",
        },
        {
          title: "The Parable of the Match",
          action: () => bookRead("match"),
          text: BOOK.match,
        },
        {
          title: "The Parable of the Eleven",
          action: () => bookRead("eleven"),
          text: BOOK.eleven,
        },
        {
          title: "The Psalm of the Sleepers",
          action: () => bookRead("psalm"),
          text: BOOK.psalm,
        },
        {
          title: "The Rule of the Kindling",
          action: () => bookRead("rule"),
          text: BOOK.rule,
        },
        {
          title: "Keeper Hollowell's Journal",
          text: "The people of the Neon burned their census cards in the first spring of the Long Noon, and that is very nearly holy: no list, no card, no number. And yet they hang electric bulbs, as if the Noon were not bright enough. The market at Grand Central drinks water scrubbed so clean it has forgotten the Light.\n\nI will show them both. Gently. The Light is patient. I am less patient.",
        },
        {
          title: "Supply List",
          text: 'Candles (for the unconverted)\nLead (for the reliquary)\nFizzo Blue (Sister Noonday calls it "the Noon in a bottle" — set aside every bottle we find, for study)',
        },
        {
          title: "Sister Noonday's Margin Notes",
          text: 'Typed below the Supply List, with a lot of crossing-out:\n\n"Candles for February: twenty-two years now, one more than last year. Even the Dawn keeps a candle every February. For her sleeper. Don\'t forget the wicks this time. — N."',
        },
      ],
    });
    L.terminal("neon_mayor", {
      title: "OFFICE OF THE MAYOR OF THE NEON",
      header:
        'TIMES SQUARE ALLIANCE — ADMINISTRATIVE TERMINAL\n"THE CROSSROADS OF THE WORLD (STILL)"',
      lock: { id: LOCK_MAYOR.id, passcode: LOCK_MAYOR.passcode },
      entries: [
        {
          title: "The Big Buzz",
          text: () =>
            "PRIMARY GENERATOR: " +
            (L.flag("neon_outcome") === "crowe" ||
            L.flag("neon_outcome") === "repair"
              ? "NOMINAL (new rig battery installed)"
              : L.flag("neon_outcome")
                ? "OFFLINE"
                : "FAILING (14% output)") +
            '\nSPARE RIG BATTERY "BIG BUZZ #2": last seen in 42nd St tunnels, maintenance closet near the derailed car.\n\nNOTE: Do not send Wendell. Wendell got lost in the tunnels in \'79 and it took him nine days to find the exit. He says it felt like nine years.',
        },
        {
          title: "Census",
          text: "Residents: 83 (uncounted, by choice), 4 married in from topside, 1 cat (refuses to be counted; respects the tradition).\nLongest resident: Wendell Pruitt (here since the week of the Bombing).\nSecond longest: Marigold (won't say which week).",
        },
        {
          title: "Mayoral Proclamation #212",
          text: "By order of the Mayor, the lights of Times Square shall never go out. The Mayor acknowledges that this proclamation has no legal force whatsoever against physics.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
