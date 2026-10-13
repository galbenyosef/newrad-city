// play-inline-562 02 — qid
// Lines 285-600 of readable/play-inline-562.pretty.js (statement-aligned).
  L.hook("init", function () {
    for (const it of ITEMS) L.defineItem(Object.assign({}, it));
    L.defineItem(Object.assign({}, GIFT));
    L.quest({
      id: QID,
      name: "Sept Means Seven",
      giver: "Mademoiselle Lys",
      location: "Grand Central Market",
      order: 52,
      desc: () =>
        "In 1967 the bombers came from Europe. Some Europeans were already here: the agents of the Bureau Sept, sent to watch the " +
        "Office of Civil Defense and never called home. Twenty-two years on, two of them are still in New Rad City, and they need a face " +
        "the Continuity does not know. " +
        L.heroName() +
        " has one.",
      stages: [
        {
          id: "contact",
          text: () =>
            L.flag("bs_got_note")
              ? 'Ask for "Lys" at the Whistle Stop bar in Grand Central, as the coded message says.'
              : "Talk to Mademoiselle Lys at the Whistle Stop bar in Grand Central.",
          markers: () => [
            {
              npc: "bs_lys",
              label: "Mademoiselle Lys",
              x: LYS_FB.x,
              z: LYS_FB.z,
            },
          ],
        },
        {
          id: "drop",
          text: () =>
            "Empty the Bureau's dead drop: the rusted mailbox by the Washington Square arch" +
            (L.flag("bs_code_known") ? " (combination 0305)." : "."),
          markers: () => at(spots().drop, "Dead Drop"),
        },
        {
          id: "relay",
          text: "Read what the Continuity knows about the Bureau at the signals cabinet on Lexington and 47th.",
          markers: () => at(spots().relay, "Signals Cabinet LX-47"),
          onEnter() {
            L.later(1.5, () =>
              L.notify(
                "Corbeau's letter names a passcode. The goggles have logged it under NOTES → CODES.",
                { quiet: true },
              ),
            );
          },
        },
        {
          id: "choice",
          text: "Decide what to do with what you know: take it back to Lys, or report the Bureau from the signals cabinet.",
          markers: () =>
            [
              {
                npc: "bs_lys",
                label: "Mademoiselle Lys",
                x: LYS_FB.x,
                z: LYS_FB.z,
              },
            ].concat(at(spots().relay, "Signals Cabinet LX-47")),
        },
        {
          id: "expose",
          text: "Meet Continuity Internal Security at the signals cabinet on Lexington and 47th.",
          markers: () => {
            const p = spots().inspector;
            return [
              {
                npc: "bs_inspector",
                label: "Inspector Pike",
                x: p && p.x,
                z: p && p.z,
              },
            ];
          },
          onEnter() {
            L.later(1.2, spawnInspector);
          },
        },
        {
          id: "passage",
          text: "Meet Corbeau at the Battery Park pier and get the Bureau's launch out of the harbour.",
          markers: () => {
            const p = spots().corbeau;
            return [
              { npc: "bs_corbeau", label: "Corbeau", x: p && p.x, z: p && p.z },
            ];
          },
          onEnter() {
            spawnCorbeau();
          },
        },
        // Closing lines (one per outcome; entering one completes the quest)
        {
          id: "end_exposed",
          complete: true,
          text: () =>
            "You handed the Bureau Sept to the Continuity. Lys and Corbeau are in a cell on Liberty Island, and Corbeau's codebook is in the evidence locker there" +
            (L.flag("bs_leniency")
              ? ". Governors Island after that, if Inspector Pike keeps his word."
              : ". The file on them is closed. The file is the only thing that matters."),
        },
        {
          id: "end_left",
          complete: true,
          text: "The launch slipped out past the Statue on the ebb. Lys and Corbeau are going home, or at least away, with a sealed canister, Corbeau's codebook and a great many questions.",
        },
        {
          id: "end_sold",
          complete: true,
          text: "You sold the Bureau the Continuity's secrets, and a few of your own. Lys is still at the Whistle Stop, writing letters to nobody, and you are a line in her ledger.",
        },
        // Solutions (ticked off with the path actually taken)
        {
          id: "bs_expose",
          text: "(Optional) Report the Bureau to Continuity Internal Security.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached(QID, "choice") && !solved(),
          doneIf: () => outcome() === "exposed",
        },
        {
          id: "bs_leave",
          text: "(Optional) Help Lys and Corbeau leave the city by boat.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.reached(QID, "choice") && !solved() && !Q.reached(QID, "expose"),
          doneIf: () => outcome() === "left",
        },
        {
          id: "bs_sell",
          text: "(Optional) Sell the Bureau the Continuity's secrets, and Long Winter's.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.reached(QID, "choice") &&
            !solved() &&
            !Q.reached(QID, "expose") &&
            !Q.reached(QID, "passage"),
          doneIf: () => outcome() === "sold",
        },
      ],
      rewards: { xp: 350 },
    });
  });

  // ------------------------------------------------------------------
  // Outcomes
  // ------------------------------------------------------------------
  function finish(kind, endStage) {
    if (outcome()) return false;
    L.setFlag("bs_outcome", kind);
    msSet(
      "bureau",
      kind === "exposed" ? "expose" : kind === "left" ? "leave" : "sell",
    );
    if (!Q.isStarted(QID)) Q.start(QID);
    Q.setStage(QID, endStage);
    return true;
  }
  /** (a) The Bureau is reported and arrested. */
  function outcomeExposed(withEvidence) {
    if (outcome()) return;
    if (L.has("q_bs_microfilm")) L.take("q_bs_microfilm");
    L.giveScrip(withEvidence ? 200 : 120);
    L.give("q_bs_commendation", 1);
    if (L.flag("bs_leniency")) L.standing(10, "Asked mercy for the Bureau");
    else L.standing(-15, "Handed the Bureau to Internal Security");
    L.setFlag("bs_arrested");
    msSet("codebook_on_liberty"); // Corbeau's SIROCCO codebook: Liberty Station's evidence locker (mq26)
    msSet("bureau_on_liberty"); // Lys and Corbeau are held on Liberty
    L.removeNPC("bs_lys");
    L.later(10, () => {
      const p = spots().inspector;
      if (!p || L.dist(p.x, p.z) > 25) L.removeNPC("bs_inspector");
    });
    L.news(
      "Grand Central regulars tell me men in grey took the letter-writer from the Whistle Stop last night, quiet as you like, and an old fella with a boat off the Battery an hour later. " +
        "Word is they went out to Liberty in irons" +
        (L.flag("bs_leniency")
          ? ", and Governors Island after that, if anybody keeps his word"
          : "") +
        ". Write your own letters for a while, folks.",
    );
    finish("exposed", "end_exposed");
  }
  /** (b) Lys and Corbeau leave the city on the launch. */
  function outcomeLeft(how) {
    if (outcome()) return;
    if (L.has("q_bs_microfilm")) L.take("q_bs_microfilm");
    L.standing(75, "Helped the Bureau go home");
    L.give(GIFT.id, 1);
    if (how === "mechanics" || how === "tide")
      L.xp(
        40,
        how === "mechanics"
          ? "Mechanics: the Sainte-Odile"
          : "Wits: the ebb tide",
      );
    L.overlay("#05080c", 0.8, 1.2, 1.6, 0.85);
    msSet("codebook_gone"); // the SIROCCO codebook leaves with Corbeau: only Poste Dragon's copy is left (mq31)
    L.later(1.2, () => {
      L.removeNPC("bs_corbeau");
      L.removeNPC("bs_lys");
    });
    L.later(2.2, () =>
      L.notify(
        "A small grey launch slides out past the end of the pier, low in the water, and turns for the Narrows. Nobody on it looks back. Then one of them does.",
        { duration: 7 },
      ),
    );
    L.news(
      "Harbour report: a pilot launch nobody's seen run in twenty years went out past the Statue this morning on the ebb, two passengers aboard. " +
        "If you're listening out there: bon voyage. Write.",
    );
    finish("left", "end_left");
  }
  /** (c) The secrets are sold. */
  function outcomeSold(price) {
    if (outcome()) return;
    if (L.has("q_bs_microfilm")) L.take("q_bs_microfilm");
    if (L.has("q_bs_intercept")) L.take("q_bs_intercept");
    L.giveScrip(price);
    L.give("q_bs_cipher_ledger", 1);
    L.standing(-75, "Sold federal secrets to a foreign service");
    finish("sold", "end_sold");
  }

  // ------------------------------------------------------------------
  // Scripted beats
  // ------------------------------------------------------------------
  // The dead telephone only rings once the main story's mq15 is under way (never right after mq01 any more).
  const phoneLive = () =>
    (Q.get("mq15") ? Q.isActive("mq15") : mq01Done()) &&
    !L.flag("bs_got_note") &&
    !L.flag("bs_drop_open") &&
    !solved();
  function answerPhone() {
    if (!phoneLive()) {
      L.notify(
        "The line is dead. It has been dead since 1967. You hang up feeling slightly foolish.",
      );
      return;
    }
    L.setFlag("bs_got_note");
    L.notify(
      'A woman\'s voice, very polite, from very far away: "Ah. Wrong number, monsieur. But since you are there: look under the telephone." The line goes dead.',
      { duration: 8 },
    );
    L.later(1.5, () => {
      const ok = L.give("q_bs_note_coded", 1);
      if (!ok) learnDrop("The coded message");
      ensureStarted();
    });
  }
  /** The dead drop's lock has opened: hand over what is inside (once). */
  function dropOpened() {
    if (L.flag("bs_drop_open")) return;
    L.setFlag("bs_drop_open");
    L.notify(
      "The four brass wheels click round to 0-3-0-5 and the hasp drops. Inside: a wax-sealed film canister, a folded letter and the courier's float.",
    );
    L.give("q_bs_microfilm", 1);
    if (!L.give("q_bs_corbeau_letter", 1)) learnRelay("Corbeau's letter");
    L.giveScrip(40);
    L.xp(25, "The dead drop");
    ensureStarted();
  }
  function openDrop() {
    if (L.flag("bs_drop_open")) {
      L.notify(
        "The mailbox is empty except for a dead moth and a 1967 flyer for a dance at the Elks lodge.",
      );
      return;
    }
    if (locksLive() && G.locks.open) {
      if (G.locks.isOpen && G.locks.isOpen(LOCK_DROP.id)) {
        dropOpened();
        return;
      }
      safeCall("locks.open", () => G.locks.open(LOCK_DROP, dropOpened));
      return;
    }
    dropOpened(); // no locks module: the box opens directly
  }
  function readRelay() {
    const firstRead = !L.flag("bs_relay_read");
    L.setFlag("bs_relay_read");
    if (firstRead) {
      L.xp(40, "Signals cabinet LX-47");
      if (!L.flag("bs_got_intercept")) {
        L.setFlag("bs_got_intercept");
        L.give("q_bs_intercept", 1, true);
      }
    }
    ensureStarted();
  }
  const canExpose = () =>
    !!L.flag("bs_relay_read") &&
    !solved() &&
    Q.isActive(QID) &&
    Q.stage(QID) !== "expose" &&
    Q.stage(QID) !== "passage";
  function reportBureau() {
    if (!canExpose()) return "TRANSMISSION REFUSED. LINE BUSY.";
    Q.setStage(QID, "expose");
    return "TRANSMITTING... ACKNOWLEDGED.\n\nINTERNAL SECURITY: REMAIN AT THE CABINET. AN INSPECTOR IS EN ROUTE. THE CONTINUITY THANKS YOU FOR YOUR VIGILANCE.";
  }

  // ------------------------------------------------------------------
  // NPCs
  // ------------------------------------------------------------------
