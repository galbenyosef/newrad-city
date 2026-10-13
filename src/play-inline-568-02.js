// play-inline-568 02 — markers
// Lines 143-569 of readable/play-inline-568.pretty.js (statement-aligned).
  L.hook("init", function () {
    // ================= n17 mq19 EYES ON THE ISLAND =================
    ms.quest({
      id: "mq19",
      name: "Eyes on the Island",
      giver: "Lancer Dalca / Lieutenant Hale / Rose",
      location: "Top of the Rock, the UN Sky-Eye room, the Chrysler crown",
      desc: () =>
        "Before the crossing somebody has to count the guns on Liberty Island, and the boats move at night. " +
        (faction() === "covenant"
          ? "The Covenant's long-range scope is on the Top of the Rock."
          : faction() === "continuity"
            ? "Lieutenant Hale can sign you into the Sky-Eye monitor room at the UN Plaza."
            : "Deadeye Dolores's nest in the Chrysler crown has the best view in Manhattan.") +
        (ms.f("teague_seen")
          ? " At two in the morning a Glowkeeper skiff met a Continuity private on Liberty's pier."
          : ""),
      stages: [
        {
          id: "lens",
          text: () => lensText(),
          markers: () => lensMarkers(),
          onEnter() {
            if (Q.isComplete("li_rock_scope"))
              L.later(1.2, () => {
                if (at("mq19", "lens")) setLens("rock");
              });
          },
        },
        {
          id: "watch",
          text: () =>
            "Keep watch on Liberty Island after midnight (" +
            LENS_NAME[ms.f("mq19_lens") || "chrysler"] +
            "). The boats move at two.",
          markers: () => {
            const p = lensPos(ms.f("mq19_lens"));
            return p
              ? [lensMarker(p, LENS_NAME[ms.f("mq19_lens")] || "Long lens")]
              : [];
          },
          onEnter() {
            placeRoseAtLens();
            // watched already (the Covenant scope's own night watch, before this quest began): Rose tells it later
            if (L.flag("ms_teague_seen"))
              L.later(1.0, () => {
                if (at("mq19", "watch")) {
                  ms.set("mq19_rose_taper_pending");
                  watchDone();
                }
              });
          },
        },
        {
          id: "report",
          text: () =>
            "Report the skiff (" +
            reportTo() +
            "), or tell Rose you will keep it quiet.",
          markers: () => reportMarkers(),
        },
        {
          id: "dalca",
          text: "(Optional) Give Lancer Dalca the gun count in the Rockefeller war room.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.isActive("li_rock_scope") &&
            Q.stage("li_rock_scope") === "report",
          doneIf: () => Q.isComplete("li_rock_scope"),
          markers: () => [{ npc: "li_cov_dalca", label: "Lancer Dalca" }],
        },
      ],
      rewards: { xp: 420 },
      onComplete() {
        if (rose.mode() === "at") rose.place("home");
      },
    });
    L.absorb("li_rock_scope", "mq19");

    // ================= n18 mq20 NUMBERS GAME =================
    ms.quest({
      id: "mq20",
      name: "Numbers Game",
      giver: "Static Okonkwo",
      location: "Lexington Avenue listening post",
      desc: () =>
        "Static Okonkwo has written down the numbers on 93.9 for six years. With the Continuity's one-time pad she can read their name list." +
        (L.flag("ms_read_7a_schedule")
          ? " Your name is at the top of it. Rose is on Directive 7-A, Schedule C."
          : ""),
      stages: [
        ms.proxy("mq20", "qx_numbers", {
          id: "side",
          next: "rose",
          text: "Find Static Okonkwo's listening post on Lexington Avenue, by the First Journal.",
          reach: {
            site: "journal_bldg",
            anchors: ["lexington", "listening_post"],
            fallback: { x: 283, z: -262 },
            label: "Listening Post",
            r: 12,
          },
          onDone: mq20Done,
        }),
        {
          id: "rose",
          text: "Show Rose the decoded name list.",
          markers: () => rose.marker("Rose"),
          onEnter() {
            if (L.flag("ms_rose_read_schedule_c"))
              L.later(1.0, () => {
                if (at("mq20", "rose")) Q.complete("mq20");
              });
          },
        },
      ],
      rewards: { xp: 380 },
    });

    // ================= n19 mq21 PURE RECORDS =================
    ms.quest({
      id: "mq21",
      name: "Pure Records",
      giver: "Major Adelaide Keel",
      location: "UN General Assembly Hall, Records Strongroom",
      desc: () =>
        "Directive 7-A cannot run without the 1967 enrolment microfilm, kept in the UN Records Strongroom beside the Relief Station's 1968 ledger. " +
        (ms.f("lock_truth")
          ? "The ledger says the ration store was padlocked from outside, with eleven children in it, on Captain Crane's order. "
          : "") +
        (ms.f("keel")
          ? ""
          : "Major Keel signed that ledger. Rose wants to see her face."),
      stages: [
        ms.proxy("mq21", "li_un_records", {
          id: "records",
          next: "ledger",
          text: "Get into the UN Records Strongroom (Keel's pass, or the code on Ortiz's blotter), recover the enrolment microfilm and decide its fate.",
          reach: {
            site: "un_hq",
            anchors: ["entrance", "door", "gate"],
            fallback: { x: 314, z: -308 },
            label: "UN General Assembly",
            r: 14,
          },
          onDone: syncMicrofilm,
        }),
        {
          id: "ledger_opt",
          text: "(Optional) Read the Relief Station's 1968 ledger, shelved beside the microfilm.",
          sideObjective: true,
          optional: true,
          showIf: () => at("mq21", "records"),
          doneIf: () => !!ms.f("lock_truth"),
          markers: () => {
            const p = ledgerPos();
            return p && !L.has(NOTE_LEDGER)
              ? [
                  {
                    x: p.x,
                    z: p.z,
                    y: p.y,
                    label: "1968 Ledger",
                    interior: p.x >= 2500,
                  },
                ]
              : [];
          },
        },
        {
          id: "ledger",
          text: () =>
            L.has(NOTE_LEDGER)
              ? "Read the Relief Station's 1968 ledger (NOTES)."
              : "Find the Relief Station's 1968 ledger in the Records Strongroom, and read it.",
          markers: () => {
            const p = ledgerPos();
            return p && !L.has(NOTE_LEDGER)
              ? [
                  {
                    x: p.x,
                    z: p.z,
                    y: p.y,
                    label: "1968 Ledger",
                    interior: p.x >= 2500,
                  },
                ]
              : [];
          },
          onEnter() {
            if (ms.f("lock_truth")) {
              L.later(0.8, () => {
                if (at("mq21", "ledger")) Q.setStage("mq21", "keel");
              });
              return;
            }
            // no strongroom to find it in (module missing / anchor gone): the ledger comes out with the microfilm
            if (!L.has(NOTE_LEDGER) && !ledgerPos()) {
              L.give(NOTE_LEDGER, 1);
              L.notify(
                "Shelved beside the microfilm: a water-stained ledger stencilled RELIEF STATION No. 3. You take it.",
              );
            }
          },
        },
        {
          id: "keel",
          text: () =>
            keelGone()
              ? "Tell Rose what the ledger says."
              : "Confront Major Keel, with Rose.",
          markers: () => {
            const m = [];
            if (!keelGone() && L.npc("li_keel"))
              m.push({ npc: "li_keel", label: "Major Keel" });
            if (!roseNear(12)) m.push(...rose.marker("Rose"));
            return m;
          },
          onEnter() {
            roseJoinsForKeel();
          },
        },
      ],
      rewards: { xp: 480 },
      onComplete() {
        if (rose.mode() === "follow" && !L.flag("ms_rose_follow_ok"))
          rose.place("home");
      },
    });

    // ================= n21 mq22 CONTINUITY OF GOVERNMENT =================
    ms.quest({
      id: "mq22",
      name: "Continuity of Government",
      giver: "Lancer Halloran / decoded traffic",
      location: "Federal Hall, the Sub-Treasury strongroom",
      desc: () =>
        "A wounded Lancer is pinned under Federal Hall by the raider gang called the Congress. The Sub-Treasury's 1967 archive core holds the Continuity's last orders before the Bombing." +
        (ms.f("memo_read")
          ? ' One of them is dated the fourth of March: the day before. "Move the rolls and enrolled staff to Liberty tonight."'
          : ""),
      stages: [
        ms.proxy("mq22", "pf3_cog", {
          id: "side",
          next: "memo",
          text: "Reach Lancer Halloran under Federal Hall, get past Speaker Voss and recover the archive core from the Sub-Treasury strongroom.",
          reach: {
            site: "federal_hall",
            anchors: ["entrance", "door", "steps"],
            fallback: { x: 80, z: 826 },
            label: "Federal Hall",
            r: 14,
          },
        }),
        {
          id: "memo",
          text: "Read the memo filed with the archive core (NOTES).",
          markers: () => [],
          onEnter() {
            if (!L.has(NOTE_MEMO)) {
              L.give(NOTE_MEMO, 1);
              if (!L.has("pf3_cog_core"))
                L.notify(
                  "Archivist Ames had copied the core's index into her notebook. One carbon was folded inside the cover.",
                );
            }
            if (ms.f("memo_read"))
              L.later(0.8, () => {
                if (at("mq22", "memo")) Q.setStage("mq22", "fate");
              });
          },
        },
        {
          id: "fate",
          text: "Decide who gets the archive core: Rocky Delgado (to broadcast it), Lancer Halloran or Lieutenant Hale.",
          markers: () => coreMarkers(),
          onEnter() {
            L.later(0.8, coreSettled);
          },
        },
      ],
      rewards: { xp: 420 },
    });

    // ================= n22 mq23 THE WHISPERING GALLERY =================
    ms.quest({
      id: "mq23",
      name: "The Whispering Gallery",
      giver: "A whisper",
      location:
        "Grand Central: the Whispering Gallery, the lower level, the Track 61 bulkhead",
      desc: () =>
        "In the corner where you said goodbye to Nicole, a whisper from the opposite arch." +
        (ms.f("dawn_pact") === "agree"
          ? " You agreed: Key B for the truth about Nicole Mead."
          : ms.f("dawn_pact") === "refuse"
            ? " You told the Dawn no."
            : "") +
        (ms.f("heard_humming")
          ? " Behind the Track 61 bulkhead a woman was humming your song. You know that voice. You can't place it."
          : ""),
      stages: [
        {
          id: "gallery",
          text: "Go to the Whispering Gallery under Grand Central's west balcony and stand in the corner.",
          markers: () => {
            const p = galleryPos("a");
            return p
              ? [
                  {
                    x: p.x,
                    z: p.z,
                    y: p.y,
                    label: "Whispering Gallery",
                    exact: true,
                  },
                ]
              : [];
          },
          onEnter() {
            L.later(2, () => {
              if (at("mq23", "gallery"))
                L.notify(
                  "Moe, at the Oyster Bar, sent word: somebody keeps asking for you in the Whispering Gallery. Nobody saw who.",
                  { duration: 6 },
                );
            });
          },
        },
        {
          id: "answer",
          text: "Answer the whisper.",
          markers: () => [{ npc: "ms_taper_gallery", label: "The whisper" }],
        },
        {
          id: "follow",
          text: "Follow Brother Taper to the Track 61 bulkhead without being seen (or give it up and go back to the gallery corner).",
          markers: () => {
            const p = bulkheadPos();
            return p
              ? [{ x: p.x, z: p.z, y: p.y, label: "Track 61 Bulkhead" }]
              : [];
          },
        },
        { id: "rose", text: "Find Rose.", markers: () => rose.marker("Rose") },
      ],
      rewards: { xp: 400 },
      onComplete() {
        L.news(
          ms.f("dawn_pact") === "agree"
            ? "Night owls report candles in the Grand Central gallery, a whole row of them, lit all at once around midnight. The Glowkeepers say it's a feast day. Rocky checked: it isn't."
            : "A quiet night at Grand Central, Moe tells me. One fella in a hood stood in the Whispering Gallery till dawn, talking to the wall. The wall did not answer.",
        );
      },
    });

    // ================= n23 mq24 CROSSING =================
    ms.quest({
      id: "mq24",
      name: "Crossing",
      giver: "Lancer-Commander Stroud / Lieutenant Hale / Ossie",
      location: "Battery Park pier / UN Plaza",
      desc: () =>
        "With the core and the Liberty Key in hand, you need a way across the harbour to Liberty Island, where Zeke, Dr. Calloway and Key B are held. " +
        (ms.trust() >= 2
          ? "Rose wants to be there when the key is found."
          : "Rose will watch the crossing through her scope from the Battery."),
      stages: [
        {
          id: "route",
          text: "Find a way across the harbour.",
          hidden: true,
          onEnter() {
            L.later(0.4, routeCrossing);
          },
        },
        {
          id: "muster",
          text: "Muster with the Covenant Lancers at the Battery Park pier.",
          markers: () => [
            { npc: "ms_lancer_muster", label: "Covenant muster" },
            { npc: "bp_ossie", label: "Ossie's ferry" },
          ],
          onEnter() {
            placeRoseForCrossing("battery");
          },
        },
        {
          id: "rotorcraft",
          text: "Board the Continuity Rotorcraft with Lieutenant Hale at the UN Plaza.",
          markers: () => [{ npc: "con_hale", label: "Lieutenant Hale" }],
          onEnter() {
            placeRoseForCrossing("un");
          },
        },
        ms.proxy("mq24", "sq_shellshock", {
          id: "shells",
          next: "ferry",
          text: "Clear the shellbacks off Battery Park so Ossie's ferry can run.",
          reach: {
            site: "battery_park",
            anchors: ["ferryman", "pier", "dock"],
            fallback: { x: -40, z: 950 },
            label: "Battery Park",
            r: 25,
          },
          onEnter() {
            placeRoseForCrossing("battery");
          },
        }),
        {
          id: "ferry",
          text: "Cross to Liberty Island with Ossie from the Battery Park pier.",
          markers: () => [{ npc: "bp_ossie", label: "Ossie" }],
          onEnter() {
            placeRoseForCrossing("battery");
          },
        },
      ],
      rewards: { xp: 500 },
    });
  });

  // ==================================================================
  // mq19 EYES ON THE ISLAND
  // ==================================================================
