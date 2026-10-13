// play-inline-566 03 — label
// Lines 649-977 of readable/play-inline-566.pretty.js (statement-aligned).
  L.hook("init", function () {
    // ---------------- mq07 The Court of Tudor City ----------------
    ms.quest({
      id: "mq07",
      giver: "Nicole's letters (return address)",
      location: "Tudor City",
      desc: () =>
        "Nicole's letters all carry the same return address: N. Mead, 5 Tudor City Place, apartment 9C, on the bluff above First Avenue. " +
        'Tudor City is a raider "Court" now, ruled by a Lord Protector who makes visitors kneel. If anything of Nicole is left in this city, it starts in 9C.',
      stages: [
        {
          id: "court",
          text: "Get into Tudor City: kneel and pay the Court, talk your way in, fight, or come in over the roof sign.",
          markers: () => [
            { npc: "ms_court_herald", label: "The Court's Herald" },
            {
              anchor: [P.tcEntrance.site, P.tcEntrance.anchors],
              fallback: P.tcEntrance.fallback,
              label: "Tudor City",
            },
          ],
          onEnter() {
            L.hint(
              "ms_court",
              'Tudor City\'s raiders answer to a "Lord Protector". His herald at the door takes tribute; there is also a way in over the roof.',
              4,
            );
          },
        },
        {
          id: "apt",
          text: "Search apartment 9C.",
          markers: markAt(P.apt9c, "Apartment 9C"),
        },
        {
          id: "flint",
          text: "Face the woman with the rifle.",
          markers: () => ms.rose.marker("The woman with the rifle"),
          onEnter() {
            ms.rose.place("at", P.apt9c());
            L.later(0.6, () => ms.rose.say("Don't. Move."));
          },
        },
        {
          id: "sol",
          text: "Talk to Sol, the doorman, in the lobby.",
          markers: () => [{ npc: "ms_sol", label: "Sol Abramowitz" }],
        },
        {
          id: "letter",
          text: "Read Nicole's 1968 letter (goggles → NOTES).",
          markers: () => [{ npc: "ms_sol", label: "Sol Abramowitz" }],
        },
        {
          id: "c_kneel",
          text: "(Optional) Kneel and pay the Court.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => L.flag("ms_court") === "knelt",
        },
        {
          id: "c_talk",
          text: "(Optional) Talk your way past the Court.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => L.flag("ms_court") === "talked",
        },
        {
          id: "c_roof",
          text: "(Optional) Come in over the roof sign.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => L.flag("ms_court") === "roof",
        },
        {
          id: "record",
          text: "(Optional) Take the record from 9C.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq07", "apt") && !ms.hasToken("record"),
          doneIf: () => ms.hasToken("record"),
        },
      ],
      rewards: { xp: 350 },
      onComplete() {
        ms.rose.place("home");
        L.news(
          "Rocky here with a lost-and-found. A certain sleeper was seen climbing the steps at Tudor City and walking back down with all his teeth. The Lord Protector's Court reports \"no incident.\" The Lord Protector's Court reports that every day.",
        );
      },
    });

    // ---------------- mq08 Booth Four ----------------
    ms.quest({
      id: "mq08",
      giver: "Lt. Vesper Hale / Ilse Moravec",
      location: "United Nations Plaza",
      desc: () =>
        'Nicole was an interpreter at the United Nations: Booth Four, French into English. The UN is the Continuity\'s forward command now, and Lieutenant Hale has been waiting to meet "the second sleeper". ' +
        "Somebody there may still remember the woman in Booth Four.",
      stages: [
        {
          id: "hale",
          text: "Go to the UN Plaza and hear Lieutenant Hale out (you don't have to take her deal).",
          markers: () => [
            { npc: "con_hale", label: "Lieutenant Hale" },
            {
              anchor: [P.unPlaza.site, P.unPlaza.anchors],
              fallback: P.unPlaza.fallback,
              label: "UN Plaza",
            },
          ],
          onEnter() {
            ms.rose.place("at", P.unGate);
          },
        },
        {
          id: "ilse",
          text: "Find Ilse Moravec, Nicole's old booth partner.",
          markers: () => [{ npc: "ms_ilse", label: "Ilse Moravec" }],
        },
        {
          id: "booth",
          text: "Reach Booth Four in the General Assembly Hall (Maniacs in the gallery).",
          markers: markAt(P.booth, "Booth Four"),
          onEnter() {
            L.hint(
              "ms_booth",
              "The Assembly Hall's public gallery is full of Maniacs. The Continuity guards will leave you alone while you're Hale's guest.",
              2,
            );
          },
        },
        {
          id: "steno",
          text: "Read Nicole's steno pad with Ilse.",
          markers: () => [{ npc: "ms_ilse_booth", label: "Ilse Moravec" }],
        },
        {
          id: "tell",
          text: "(Optional) Tell Hale why you are really here.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq08", "ilse"),
          doneIf: () => !!L.flag("ms_con_knows_nicole"),
          markers: () => [{ npc: "con_hale", label: "Lieutenant Hale" }],
        },
        {
          id: "keep",
          text: "(Optional) Keep the steno pad.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq08", "steno"),
          doneIf: () => ms.hasToken("booth"),
        },
      ],
      rewards: { xp: 400 },
      onComplete() {
        ms.rose.place("home");
      },
    });

    // ---------------- mq09 The Candle Lady ----------------
    ms.quest({
      id: "mq09",
      giver: "Stationmaster Delphine Okafor",
      location: "Grand Central Market",
      desc: () =>
        "Nicole went to Grand Central on the afternoon of the Bombing, like half of Midtown. Grand Central's old-timers remember a shelter on the lower level in 1967 — and a woman there who gave every child a candle.",
      stages: [
        {
          id: "delphine",
          text: "Ask Stationmaster Delphine Okafor about the lower level.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
        {
          id: "oldtimers",
          text: () =>
            "Ask two more of Grand Central's old-timers about 1967: Doc Hollis, Mort Feldstein or Moe (" +
            oldtimers() +
            "/2).",
          markers: () =>
            [
              { npc: "gc_doc", label: "Doc Hollis" },
              { npc: "ms_mort", label: "Mort Feldstein" },
              { npc: "gc_moe", label: "Moe Kessler" },
            ].filter((m) => !L.flag("ms_ot_" + m.npc)),
          onEnter() {
            ms.pollRoster();
          },
        }, // Mort is at his bench the moment the stage opens
        {
          id: "grate",
          text: "Look through the grate of the sealed lower-level stair.",
          markers: markAt(P.gcStair, "Sealed stair"),
        },
        {
          id: "lys",
          text: "(Optional) Sit down with Lys at the Whistle Stop.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("ms_lys_noticed") || Q.reached("mq09", "oldtimers"),
          doneIf: () => !!L.flag("ms_lys_met"),
          markers: () => [{ npc: "bs_lys", label: "Mademoiselle Lys" }],
        },
        {
          id: "press",
          text: "(Optional) Press Doc Hollis about the mother's name.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_ot_gc_doc"),
          doneIf: () => !!L.flag("ms_hollis_named"),
          markers: () => [{ npc: "gc_doc", label: "Doc Hollis" }],
        },
      ],
      rewards: { xp: 400 },
      onComplete() {
        L.news(
          "Rocky here. Somebody's been asking the old-timers at Grand Central about 1967 — the Camp, the candles, the stair they bricked up. Folks, if you were down there, you know who you are. Maybe go and say hello to the man in the padded suit.",
        );
      },
    });

    // ---------------- mq10 Return to Sender ----------------
    ms.quest({
      id: "mq10",
      giver: '"Rocky" Delgado',
      location: "Radio City → St. Patrick's Cathedral",
      desc: () =>
        "Somebody answered your Missing Persons notice. The reply is waiting at Radio City, and Rocky says it smells of candle wax.",
      stages: [
        {
          id: "reply",
          text: "Collect the reply to your notice from Rocky at Radio City.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "compare",
          text: "Compare the seal with Nicole's letters.",
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "cathedral",
          text: "Go to St. Patrick's, the Cathedral of the Second Sun.",
          markers: markAt(P.stpSteps, "St. Patrick's Cathedral"),
          onEnter() {
            ms.rose.place("at", P.stpSteps);
          },
        },
        {
          id: "keeper",
          text: "Speak with Keeper Hollowell and Sister Noonday.",
          markers: () => [
            { npc: "glow_ezra", label: "Keeper Hollowell" },
            { npc: "glow_sister", label: "Sister Noonday" },
          ],
        },
        {
          id: "dawnhour",
          text: () =>
            "Hear the Dawn Hour at 05:47 on the radio (wait for morning) — or read the printed transcript." +
            (L.has("ms_note_dawn_hour_1")
              ? ""
              : " Sister Noonday hands them out."),
          markers: () =>
            L.has("ms_note_dawn_hour_1")
              ? []
              : [{ npc: "glow_sister", label: "Sister Noonday (transcripts)" }],
        },
        {
          id: "who",
          text: "(Optional) Ask who wrote the reply.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq10", "keeper"),
          doneIf: () => !!L.flag("ms_dawn_wrote_letter"),
        },
      ],
      rewards: { xp: 450, scrip: 60 },
      onComplete() {
        ms.rose.place("home");
      },
    });
  });

  // ------------------------------------------------------------------
  // mq07: the Court, 9C, Flint, Sol
  // ------------------------------------------------------------------
  ms.actor({
    id: "ms_court_herald",
    when: () =>
      Q.isActive("mq07") && stage("mq07") === "court" && !L.flag("ms_court"),
    def: {
      type: "human",
      name: "Herald of the Court",
      gender: "m",
      outfit: "raider",
      hat: "cap",
      faction: "raiders",
      hostile: false,
      essential: true,
      ai: "guard",
      home: "here",
      homeR: 2,
      level: 6,
      weapon: ["bolt_rifle_32"],
      dialogue: "dlg_ms_herald",
      at: Object.assign({ maxR: 6 }, P.tcEntrance),
      barks: ["Kneel for the Lord Protector!", "Tribute first. Then dignity."],
    },
  });
  function courtTruce() {
    const o = IX("tudor_city");
    L.factionTruce("raiders", o.x, o.z, 140, false, { id: "ms_court_in" });
    L.factionTruce("raiders", TUDOR.x, TUDOR.z, 45, false, {
      id: "ms_court_out",
    });
  }
  function passCourt(how) {
    if (!L.flag("ms_court")) L.setFlag("ms_court", how);
    if (how !== "fight" && how !== "roof") courtTruce();
    if (at("mq07", "court")) Q.setStage("mq07", "apt");
  }
