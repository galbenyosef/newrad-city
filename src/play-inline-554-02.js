// play-inline-554 02 — flag
// Lines 116-497 of readable/play-inline-554.pretty.js (statement-aligned).
  L.hook("init", function () {
    // Specialist Ortiz's passcode reminder, left on the blotter beside the UN teletype.
    L.defineItem({
      id: "q_note_ortiz_blotter",
      type: "note",
      name: "Blotter Note (Specialist Ortiz)",
      title: "Taped under the desk blotter",
      weight: 0,
      value: 0,
      quest: false,
      learn: LOCKS.un.id,
      desc: "A note. Read it in your goggles (NOTES).",
      text:
        'NOTE TO SELF:\nTeletype passcode is TRIPLICATE.\nAll passcodes are TRIPLICATE. Requisitions says this is "for consistency."\n\nDo NOT write the passcode down again. ' +
        "You got a reprimand last time. In triplicate.\n\n— R. Ortiz, Spec. 4th Class",
    });

    // ---- MAIN STORY, Act III (outline v2): mq04 = n16 "The Company You Keep", mq05 = n20 "King of the Empire".
    // Both are started by the spine (61_ms_core.js) after mq18 / mq04; nothing here starts a main quest.
    const MS = L.ms;
    MS.quest({
      id: "mq04",
      name: "The Company You Keep",
      giver: '"Rocky" Delgado / Rose',
      location: "Rockefeller Center, UN Plaza",
      desc: () =>
        "Zeke is held on Liberty Island, and so is Key B, the second key to the Glowkeepers' bomb, which Rose wants destroyed. Two powers in Midtown could take you across the harbour: " +
        "Lancer-Commander Stroud's Iron Covenant at Rockefeller Center, and Lieutenant Hale's Continuity at the UN Plaza. Or you could go alone." +
        (faction()
          ? " You chose: " +
            ({
              covenant: "the Iron Covenant.",
              continuity: "the Continuity.",
              none: "nobody.",
            }[faction()] || "")
          : ""),
      stages: [
        {
          id: "choose",
          text: "Decide who takes you to Liberty: the Iron Covenant (Rockefeller Center), the Continuity (UN Plaza), or nobody.",
          markers: () => {
            const m = [{ npc: "cov_stroud", label: "The Iron Covenant" }];
            if (!L.flag("con_hostile") && !L.flag("hale_dead"))
              m.push({ npc: "con_hale", label: "The Continuity" });
            m.push({ npc: "ms_rose", label: "Rose" });
            return m;
          },
          onEnter() {
            L.news(
              "Word on the dial, Manhattan: our friend the sleeper is shopping for a boat to Liberty Island. The Covenant has boats. The Continuity has a Rotorcraft. Ossie has a bucket with an engine. Choose wisely, pal, and choose soon.",
            );
            L.hint(
              "standing",
              "Your choices shape your Standing: how New Rad City remembers you. Check it under STATUS in your goggles.",
              6,
            );
          },
        },
        {
          id: "ask_rose",
          text: "(Optional) Ask Rose who she would trust.",
          sideObjective: true,
          optional: true,
          showIf: () => !faction(),
          doneIf: () => !!L.flag("ms_mq04_rose_asked"),
          markers: () => [{ npc: "ms_rose", label: "Rose" }],
        },
        {
          id: "unterm",
          text: "(Optional) Copy Directive 7-A from the Continuity teletype at the UN Plaza (passcode: TRIPLICATE).",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("con_hostile") || L.has("q_reel_directive_7a"),
          doneIf: () =>
            !!(L.flag("knows_directive") || L.has("q_reel_directive_7a")),
          markers: () => {
            const p = L.termPos("un_command");
            return p
              ? [{ x: p.x, z: p.z, label: "Continuity Command Teletype" }]
              : [];
          },
        },
        {
          id: "hale_ev",
          text: "(Optional) Play Directive 7-A, Nell's reels or the Deed Ledger for Lieutenant Hale.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !L.flag("con_hostile") && !L.flag("hale_dead") && haleEvidence(),
          doneIf: () => !!L.flag("hale_defects"),
          markers: () => [{ npc: "con_hale", label: "Lieutenant Hale" }],
        },
        {
          id: "join_cov",
          text: "(Optional) Join the Iron Covenant at Rockefeller Center.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("met_stroud") && !faction(),
          doneIf: () => faction() === "covenant",
        },
        {
          id: "join_con",
          text: "(Optional) Accept Lieutenant Hale's offer and sign on with the Continuity.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("met_hale") && !faction() && !L.flag("con_hostile"),
          doneIf: () => faction() === "continuity",
        },
        {
          id: "go_alone",
          text: "(Optional) Go alone: tell Stroud, Hale or Rose you will find your own way across.",
          sideObjective: true,
          optional: true,
          showIf: () => !faction(),
          doneIf: () => faction() === "none",
        },
      ],
      rewards: { xp: 300 },
      onComplete() {
        const f = faction();
        L.news(
          f === "covenant"
            ? "Fifth Avenue report: the sleeper was seen shaking hands with Lancer-Commander Stroud at Rockefeller Center. The Iron Covenant has a new friend. The Continuity has a new headache."
            : f === "continuity"
              ? "Well, folks. The sleeper walked into the UN Plaza and walked out with Continuity papers. Rocky is not going to editorialise. Rocky is going to play a sad song. This one's for Manhattan."
              : "The sleeper turned down the Covenant AND the Continuity, I hear. Going it alone. Rocky respects that. Rocky also recommends a good life jacket.",
        );
      },
    });

    MS.quest({
      id: "mq05",
      name: "King of the Empire",
      giver: "Lancer-Commander Stroud / Lieutenant Hale",
      location: "Empire State Building; Sterling's",
      desc: () =>
        "The Knickerbocker Array needs an ignition core, and the core was hauled to the top of the Empire State Building by Brutes whose leader calls himself KONG, King of the Empire. " +
        "The core is your ticket onto Liberty. " +
        (faction() === "covenant"
          ? "Lancer-Commander Stroud wants to see it."
          : faction() === "continuity"
            ? "Lieutenant Hale wants to see it."
            : "Nobody else gets a say in it.") +
        (L.flag("ms_kong_told")
          ? ' KONG claims he watches Grand Central at night: "Sun lady live under train house." Nobody believes Brutes.'
          : ""),
      stages: [
        {
          id: "core",
          text: "Get the Knickerbocker Ignition Core from KONG at the top of the Empire State Building.",
          markers: () => [kongMarker()],
          onEnter() {
            // taken before this quest began (the core_obtained flag): move on as soon as it starts
            if (L.has("q_knickerbocker_core") || L.flag("core_obtained"))
              L.later(1.5, () => {
                if (Q.stage("mq05") === "core" && Q.isActive("mq05"))
                  routeCore();
              });
          },
        },
        {
          id: "queen",
          text: "(Optional) Find KONG a \"queen\" who doesn't scream. Sterling's is full of mannequins.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("kong_wants_queen") &&
            !L.has("q_fay_mannequin") &&
            !L.has("q_knickerbocker_core"),
          doneIf: () => !!L.flag("kong_friend"),
          markers: () =>
            L.pickups.fay
              ? [
                  {
                    x: L.pickups.fay.pos.x,
                    z: L.pickups.fay.pos.z,
                    label: "Mannequin (Sterling's)",
                  },
                ]
              : [{ x: 0, z: -50, label: "Sterling's" }],
        },
        {
          id: "kg_talk",
          text: '(Optional) Talk KONG into giving up his "shiny rock".',
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () =>
            L.flag("kong_resolution") === "speech" ||
            L.flag("kong_resolution") === "trick",
        },
        {
          id: "kg_kill",
          text: "(Optional) Kill KONG and take the core.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () =>
            !!L.flag("kong_dead") &&
            !L.flag("kong_friend") &&
            !L.flag("kong_resolution"),
        },
        {
          id: "kg_look",
          text: "(Optional) Ask KONG what he watches through his looking-tube.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("met_kong") &&
            !L.flag("kong_dead") &&
            !L.flag("kong_hostile"),
          doneIf: () => !!L.flag("ms_kong_told"),
          markers: () => [{ npc: "esb_kong", label: "KONG" }],
        },
        {
          id: "return_cov",
          text: "Bring the Knickerbocker Core to Lancer-Commander Stroud at Rockefeller Center (or keep it: it is yours either way).",
          markers: () => [
            { npc: "cov_stroud", label: "Lancer-Commander Stroud" },
          ],
        },
        {
          id: "return_con",
          text: "Bring the Knickerbocker Core to Lieutenant Hale at the UN Plaza (or keep it: it is yours either way).",
          markers: () => [{ npc: "con_hale", label: "Lieutenant Hale" }],
        },
      ],
      rewards: { xp: 450 },
      onComplete() {
        L.news(
          "This just in from Midtown: the Brute king of the Empire State Building (yes, he calls himself Kong, no, I am not making that up) has lost his favourite toy. A fella in a grey cryo suit walked off with it. " +
            (L.flag("kong_friend")
              ? "And get this: the big guy's reportedly HAPPY about it. Says he's in love. With a department-store mannequin. Congratulations to the couple."
              : L.flag("kong_dead")
                ? "The king is down for the count, folks. And he ain't getting up."
                : "Kong's reportedly confused. Kong is usually confused."),
        );
      },
    });
    // Test solvers (forced stage walk, 61_ms_core.js): the default resolution of every stage.
    MS.solver("mq04", {
      choose() {
        if (!faction()) L.setFlag("mq_faction", "none");
        L.setFlag("ms_mq04_rose_asked");
        Q.complete("mq04");
      },
    });
    MS.solver("mq05", {
      core() {
        if (!L.has("q_knickerbocker_core")) kongGives("speech");
        onCore();
        if (Q.stage("mq05") === "core" && Q.isActive("mq05")) routeCore();
      },
      return_cov() {
        Q.complete("mq05");
      },
      return_con() {
        Q.complete("mq05");
      },
    });

    L.quest({
      id: "sq_overdue",
      name: "Overdue",
      giver: "Archivist Ingrid Wexler",
      location: "New York Public Library",
      desc:
        "Archivist Wexler of the Iron Covenant wants three old-world technical books recovered from the New York Public Library, " +
        "which a pack of Maniacs now calls home.",
      stages: [
        {
          id: "books",
          text: () =>
            "Recover the three technical books from the New York Public Library (" +
            bookCount() +
            "/3).",
          markers: () =>
            BOOKS.filter((b) => !L.has(b.id) && L.pickups[b.key]).map((b) => ({
              x: L.pickups[b.key].pos.x,
              z: L.pickups[b.key].pos.z,
              label: b.label,
            })),
        },
        {
          id: "od_catalog",
          text: "(Optional) Look the books up on the library's catalogue teletype.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_overdue") === "books",
          doneIf: () => !!L.flag("nypl_catalog_read"),
          markers: () => {
            const p = L.termPos("nypl_catalog");
            return p ? [{ x: p.x, z: p.z, label: "Library Catalogue" }] : [];
          },
        },
        {
          id: "od_haggle",
          text: "(Optional) Negotiate a better fee with Archivist Wexler.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("overdue_haggled"),
        },
        {
          id: "return",
          text: "Return the books to Archivist Wexler at Rockefeller Center.",
          markers: () => [{ npc: "cov_wexler", label: "Archivist Wexler" }],
        },
      ],
      rewards: { xp: 250, scrip: 150, items: [[SH.gyroRounds, 40]] },
    });

    L.quest({
      id: "sq_exchange",
      name: "Hostile Takeover",
      giver: "Lancer Tobias Reyes",
      location: "The Exchange (Wall Street)",
      desc:
        "Bear Market Betty and her raiders run a protection racket out of the New York Stock Exchange. The Iron Covenant has put a bounty on her — " +
        "or on proof of the racket that would justify a raid.",
      stages: [
        {
          id: "hunt",
          text: "Deal with Bear Market Betty at the New York Stock Exchange.",
          markers: () => {
            const m = [
              { npc: "ws_betty", label: "Bear Market Betty", x: 0, z: 850 },
            ];
            if (L.pickups.betty_ledger && !L.has("q_note_betty_ledger"))
              m.push({
                x: L.pickups.betty_ledger.pos.x,
                z: L.pickups.betty_ledger.pos.z,
                label: "Betty's Ledger",
              });
            return m;
          },
        },
        {
          id: "xc_kill",
          text: "(Optional) Kill Bear Market Betty.",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("betty_ledger_stolen"),
          doneIf: () => !!L.flag("betty_dead"),
        },
        {
          id: "xc_ledger",
          text: "(Optional) Steal Betty's ledger from the Exchange as proof of the racket.",
          sideObjective: true,
          optional: true,
          showIf: () => !L.flag("betty_dead"),
          doneIf: () => !!L.flag("betty_ledger_stolen"),
        },
        {
          id: "xc_ghost",
          text: "(Optional) Take the ledger without being detected.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !L.flag("betty_dead") &&
            !L.flag("betty_ledger_stolen") &&
            !L.flag("exchange_alerted"),
          doneIf: () => !!L.flag("betty_ledger_ghost"),
        },
        {
          id: "report",
          text: () =>
            (L.flag("betty_dead")
              ? "Bear Market Betty is dead. "
              : "You have Betty's ledger. ") +
            "Report to Lancer Reyes at Rockefeller Center.",
          markers: () => [{ npc: "cov_reyes", label: "Lancer Reyes" }],
        },
      ],
      rewards: { xp: 300 },
    });
  });

  // ------------------------------------------------------------------
  // Books (NYPL)
  // ------------------------------------------------------------------
