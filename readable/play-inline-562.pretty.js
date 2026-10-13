/* src/quests/52_french_spies.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 52: BUREAU SEPT (SQ "Sept Means Seven")
 *
 * In the summer of 1966 the Bureau Sept, the Seventh Bureau of a ministry
 * in Paris, sent a small team to New York to watch the Office of Civil
 * Defense. In March 1967 the bombers came from their own side of the ocean.
 * Nobody recalled them. Twenty-two years later the last two agents in
 * Manhattan are still here: "Mademoiselle Lys", who writes letters for scrip
 * at the Whistle Stop bar in Grand Central, and their old chief "Corbeau".
 * A third cell, Poste Dragon in Chinatown, went silent to them in 1974.
 * In 1966 Lys befriended Nicole Mead and filed what she said about her
 * fella's "government freezer" as source LUMIERE.
 *
 * MAIN STORY: absorbed by mq15 "Sept Means Seven" (63_ms_act2.js). The quest
 * no longer starts by itself: it starts when mq15 does (G.quests.start is
 * safe at any time), and the Chambers Street phone only rings while mq15 is
 * active. Outcomes set ms_bureau = 'expose' | 'leave' | 'sell'; reporting
 * the Bureau puts Corbeau's SIROCCO codebook into Liberty's evidence locker
 * (ms_codebook_on_liberty). Lys stands at the Whistle Stop from game start
 * (Act I's mq09 injects a node into dlg_bs_lys).
 *
 * Beats:
 *   start   mq15. A telephone rings in a dead phone booth on Chambers Street:
 *           a coded message (shift seven) under the receiver, or talking to
 *           Lys directly. She shows the Bureau's 1967 photograph of the hero
 *           and Nicole in the Whispering Gallery.
 *   contact Lys at the Whistle Stop (Grand Central concourse).
 *   drop    the courier's dead drop: a rusted mailbox by the Washington
 *           Square arch, combination lock q_spy_dead_drop (code 0305 —
 *           March 5, the day the sky fell; learnable from the coded
 *           message and from Lys). Inside: the microfilm and Corbeau's letter.
 *   relay   the Continuity signals cabinet at Lexington & 47th (teletype,
 *           passcode lock q_spy_relay MAYFLOWER — Corbeau's letter, Lys).
 *   choice  (back at Lys: the LUMIERE confession)
 *           (a) report the Bureau from the cabinet → Inspector Pike →
 *               the agents are arrested and held on Liberty (Continuity reward);
 *           (b) help them leave: Corbeau's launch at the Battery Park pier
 *               (standing + Lys's opera glasses);
 *           (c) sell them the Continuity's secrets and Long Winter's
 *               (scrip + the Bureau's field ledger, standing falls).
 *
 * NPCs (stable ids): bs_lys, bs_corbeau (pier, branch b), bs_inspector
 * (signals cabinet, branch a). Debug: G.quests.debug.spies(step).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;
  const QID = "sq_bureau_sept";
  const LOCK_DROP = {
    id: "q_spy_dead_drop",
    label: "Rusted Mailbox (Washington Square)",
    code: "0305",
    kind: "container",
    hint: "The coded message under the receiver of the Chambers Street phone booth; Mademoiselle Lys at the Whistle Stop bar",
  };
  const LOCK_RELAY = {
    id: "q_spy_relay",
    label: "Continuity Signals Cabinet LX-47",
    passcode: "MAYFLOWER",
    kind: "terminal",
    hint: "Corbeau's letter in the Washington Square dead drop; Mademoiselle Lys",
  };
  const LYS_FB = { x: 224, z: -238 }; // Grand Central concourse, by the Whistle Stop bar
  const safeCall = (where, fn) => {
    try {
      return fn();
    } catch (e) {
      G.reportError("quests:spies:" + where, e);
      return undefined;
    }
  };
  const locksLive = () => !G.isStub("locks") && !!G.locks;
  const first = () => L.heroName().split(" ")[0];
  const outcome = () => L.flag("bs_outcome") || null;
  const mq01Done = () => Q.isComplete("mq01") || !!L.flag("left_cryo");
  /** The quest belongs to the main story's mq15 and only starts with it (a build without mq15 keeps the old behaviour). */
  const canStart = () => (Q.get("mq15") ? Q.isStarted("mq15") : mq01Done());
  const ms = () => L.ms || null;
  const msSet = (k, v) => L.setFlag("ms_" + k, v === undefined ? true : v);
  const faceTo = (p, t) => (p && t ? Math.atan2(t.x - p.x, t.z - p.z) : 0);

  // ------------------------------------------------------------------
  // Spots (static: resolved once the world exists)
  // ------------------------------------------------------------------
  const S = {};
  function spots() {
    if (S.ok || !L.isWorldBuilt()) return S;
    const X = G.LAYOUT.cryoExit || { x: 157, z: 623 };
    S.exit = X;
    S.booth = L.freeSpot(X.x - 9, X.z + 0.5, undefined, {
      maxR: 8,
      radius: 0.9,
    });
    S.arch = L.anchor("washington_square", ["arch", "entrance"], {
      x: 120,
      z: 416,
    });
    S.drop = L.freeSpot(S.arch.x + 5, S.arch.z + 3, S.arch.y, {
      maxR: 8,
      radius: 0.6,
    });
    S.relay = L.freeSpot(283, -268, undefined, { maxR: 10, radius: 1.0 });
    S.inspector = L.freeSpot(S.relay.x + 3, S.relay.z + 2.5, S.relay.y, {
      maxR: 6,
    });
    S.pier = L.anchor("battery_park", ["skiff", "pier", "dock"], {
      x: -128,
      z: 962,
    });
    S.corbeau = L.freeSpot(S.pier.x + 2.5, S.pier.z - 1.5, S.pier.y, {
      maxR: 6,
    });
    S.lysPier = L.freeSpot(S.pier.x - 2.5, S.pier.z + 1.5, S.pier.y, {
      maxR: 6,
    });
    S.ok = true;
    return S;
  }
  const at = (p, label) => (p ? [{ x: p.x, z: p.z, y: p.y, label }] : []);

  // ------------------------------------------------------------------
  // Locks (guarded; direct fallbacks when the locks module is a stub)
  // ------------------------------------------------------------------
  function learn(spec, src) {
    if (locksLive() && G.locks.learn)
      safeCall("learn", () => G.locks.learn(spec.id, src));
    L.setFlag(spec === LOCK_DROP ? "bs_code_known" : "bs_pass_known");
  }
  const learnDrop = (src) => learn(LOCK_DROP, src || "Mademoiselle Lys");
  const learnRelay = (src) => learn(LOCK_RELAY, src || "Mademoiselle Lys");

  // ------------------------------------------------------------------
  // Items
  // ------------------------------------------------------------------
  const CIPHER =
    "HZRMV YSFZH AAOLD OPZAS LZAVW AOLIV EIFAO LHYJO VWLUZ VUAOL KHFAO LZRFM LSS";
  const ITEMS = [
    {
      id: "q_bs_note_coded",
      type: "note",
      name: 'Coded Message ("Wrong Number")',
      title: "Pencil on the back of a Continuity ration card",
      learn: LOCK_DROP.id,
      weight: 0,
      value: 0,
      desc: "A ration card with pencilled letter groups on the back. Read it with your VIGIL goggles (NOTES).",
      text:
        "[A ration card stamped OFFICE OF THE ACTING PRESIDENT — ISSUE DATE: MARCH 7, 1967. It was tucked under the receiver of a " +
        "telephone that should not have been ringing. On the back, in pencil, blocks of five letters:]\n\n" +
        CIPHER +
        "\n\n" +
        '[Along the margin, in the same neat hand: "SEPT MEANS SEVEN." Count every letter seven places back down the alphabet and it reads:]\n\n' +
        "ASK FOR LYS AT THE WHISTLE STOP. THE BOX BY THE ARCH OPENS ON THE DAY THE SKY FELL.\n\n" +
        '[Underneath, added later and in a hurry, as if the writer worried the reader might be slow: "0-3-0-5. Month first, the way they ' +
        'write it here. Burn this." You do not burn it.]',
    },
    {
      id: "q_bs_corbeau_letter",
      type: "note",
      name: 'Letter Signed "C."',
      title: "Folded inside the courier's dead drop",
      learn: LOCK_RELAY.id,
      weight: 0,
      value: 0,
      text:
        "To whoever has opened Pivert's box,\n\nIf you are Lys: hello, my dear. The coffee is still terrible. If you are not Lys, then either " +
        "she trusts you or you are very good with combination locks, and in either case I need you.\n\nThe Continuity keeps a signals cabinet on " +
        "the corner of Lexington and 47th: the grey box with the field teletype inside. Every word we send by radio goes into that box and comes " +
        "out typed. Pivert believed they had broken our cipher. I believe Pivert is dead because they had.\n\nThree winters I watched their operator " +
        "through field glasses from a window on 46th Street. He types his passcode with two fingers and moves his lips: MAYFLOWER. The Americans " +
        "name everything after a boat that arrived. Read what they know about us. Then decide whether you are our friend. I will not blame you " +
        "either way. I have been nobody's friend since March 1967 and it is very restful.\n\n— C.\n\nP.S. The canister is for Lys. Do not " +
        "develop it in daylight. Do not develop it at all.",
    },
    {
      id: "q_bs_microfilm",
      type: "misc",
      quest: true,
      name: "Microfilm Canister (VII)",
      weight: 0.5,
      value: 0,
      desc: "A film canister sealed with red wax pressed with the numeral VII. Twenty-two years of a foreign service's notes on New Rad City, or so you are told.",
    },
    {
      id: "q_bs_intercept",
      type: "note",
      name: "Continuity Intercept Printout (LX-47)",
      title: "Torn from the teletype in signals cabinet LX-47",
      weight: 0,
      value: 25,
      text:
        'INTERNAL SECURITY — FIELD INTERCEPT RELAY LX-47\nSUBJECT: "SEPT" TRAFFIC (FOREIGN, CIPHERED, BROKEN)\n\n' +
        "0214 — LYS TO C.: COURIER LATE. MAILBOX UNTOUCHED. WILL WAIT.\n0219 — C. TO LYS: WAIT. ALWAYS WAIT. WE ARE VERY GOOD AT IT.\n" +
        "0301 — LYS TO C.: PIVERT NOT AT THE ARCH. THREE DAYS.\n0302 — C. TO LYS: THEN WE NEED A FACE THEY DO NOT KNOW.\n\n" +
        "STANDING ORDER 19 (EXCERPT): All foreign nationals in the Manhattan district are to be detained on the first night of frost and " +
        "held pending the restoration of normal diplomatic relations. Date of restoration: to be announced.",
    },
    {
      id: "q_bs_cipher_ledger",
      type: "note",
      name: "Bureau Sept Field Ledger",
      title: "A cloth-bound ledger, numbered VII on the spine",
      weight: 1,
      value: 120,
      text:
        "Pages of small, careful handwriting. Sky-Eye drone circuits over Midtown, timed to the minute across three summers. The ration depots " +
        "the Continuity still stocks and the ones it has forgotten. Which Grand Central traders sell to Liberty Island and what they are paid.\n\n" +
        "On the last page, a list of every person the Bureau has ever paid in this city. The ink of the newest line is still wet:\n\n" +
        '"ACQUIRED, 1989 — THE SLEEPER. RELIABLE. EXPENSIVE. LIKES HIS COFFEE, WILL NOT FIND ANY."',
    },
    {
      id: "q_bs_photo_gallery",
      type: "note",
      name: "Bureau Photograph: the Whispering Gallery",
      title: "A glossy 8x10, creased once, from Lys's typewriter case",
      weight: 0,
      value: 0,
      text:
        "[A long-lens photograph, grainy with night film. The low tiled arches outside the Oyster Bar at Grand Central. In one corner a young man in a good overcoat stands with his face to the tiles, talking into the curve of the arch. " +
        "In the far corner, thirty feet away, a young woman in a pale coat does the same, laughing, one hand flat against the wall as if she could feel the words arrive.]\n\n" +
        "[It is you. It is Nicky.]\n\n" +
        '[On the back, typed on a strip of paper and gummed down:]\n\nBUREAU SEPT / NEW YORK — DOSSIER HIVER\nGRAND CENTRAL, GALERIE DES MURMURES. DIMANCHE 19.II.67, 22H04.\nSOURCE LUMIERE AVEC LE SUJET "E.W." (VOLONTAIRE, PROJET LONG WINTER).\nCONVERSATION NON ENREGISTREE. DISTANCE TROP GRANDE.\n\n' +
        '[Below, in pencil, in a different hand: "Laisse-les tranquilles. — L."]',
    },
    {
      id: "q_bs_commendation",
      type: "misc",
      name: "Continuity Citation for Vigilance",
      weight: 0.2,
      value: 150,
      desc: 'Heavy cream card with an embossed domed-capitol seal: "FOR SERVICES TO THE INTERNAL SECURITY OF THE UNITED STATES, MARCH 1967." It is 1989. Nobody has told the card.',
    },
  ];
  const GIFT = {
    id: "q_bs_opera_glasses",
    type: "apparel",
    slot: "eyes",
    name: "Lys's Opera Glasses",
    weight: 0.5,
    value: 140,
    dr: 0,
    attrs: { senses: 1 },
    skills: { stealth: 5 },
    noCondition: false,
    desc: "Mother-of-pearl and brass, bought in Paris in 1966 for an evening at the opera that never happened. Very good for watching people who are watching you. +1 Senses, +5 Stealth.",
  };

  // ------------------------------------------------------------------
  // Quest
  // ------------------------------------------------------------------
  const ORDER = ["contact", "drop", "relay", "choice"];
  function met(st) {
    switch (st) {
      case "contact":
        return !!L.flag("bs_met_lys");
      case "drop":
        return !!L.flag("bs_drop_open");
      case "relay":
        return !!L.flag("bs_relay_read");
      default:
        return false;
    }
  }
  /** Move the quest to the first step not already done (steps may be done out of order). */
  function advance() {
    if (!Q.isActive(QID)) return;
    const cur = Q.stage(QID);
    let i = ORDER.indexOf(cur);
    if (i < 0) return;
    while (i < ORDER.length - 1 && met(ORDER[i])) i++;
    if (ORDER[i] !== cur) Q.setStage(QID, ORDER[i]);
  }
  function ensureStarted() {
    if (!Q.isStarted(QID)) {
      if (!canStart()) return;
      Q.start(QID);
    }
    advance();
  }
  const solved = () => !!outcome();

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
  function spawnLys() {
    const o = outcome();
    if (o === "exposed" || o === "left") return;
    const pier = Q.stage(QID) === "passage" && Q.isActive(QID);
    const sp = spots();
    L.spawnNPC({
      id: "bs_lys",
      type: "human",
      name: "Mademoiselle Lys",
      outfit: "settler",
      gender: "f",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 1.5,
      hostile: false,
      essential: !o,
      level: 6,
      dialogue: "dlg_bs_lys",
      skinTone: 0.3,
      at:
        pier && sp.lysPier
          ? { fallback: sp.lysPier, maxR: 4 }
          : {
              site: "grand_central",
              anchors: ["bar_patron2", "bar_patron1"],
              fallback: LYS_FB,
            },
      barks:
        o === "sold"
          ? [
              "Letters written. Secrets bought. Both by the page.",
              "Bonsoir, sleeper. Not here, please. People watch.",
            ]
          : [
              "Letters written, five scrip a page. Love letters ten.",
              "A letter is a message nobody can answer. Very restful.",
              "The coffee here is a crime. I report it daily.",
            ],
    });
  }
  function spawnCorbeau() {
    if (solved() || Q.stage(QID) !== "passage") return;
    const p = spots().corbeau;
    if (!p) return;
    L.spawnNPC({
      id: "bs_corbeau",
      type: "human",
      name: "Corbeau",
      outfit: "drifter",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      hostile: false,
      essential: true,
      level: 7,
      dialogue: "dlg_bs_corbeau",
      pos: { x: p.x, y: p.y, z: p.z },
      skinTone: 0.25,
      barks: [
        "The tide does not care who started the war. I find that restful.",
        "Sainte-Odile, do not embarrass me now.",
      ],
    });
  }
  function spawnInspector() {
    if (Q.stage(QID) !== "expose" || solved()) return;
    const p = spots().inspector;
    if (!p) return;
    relayTruce();
    const a = L.spawnNPC({
      id: "bs_inspector",
      type: "continuity_soldier",
      name: "Inspector Harlan Pike",
      faction: "continuity",
      ai: "guard",
      home: "here",
      homeR: 2,
      hostile: false,
      essential: true,
      level: 12,
      dialogue: "dlg_bs_inspector",
      pos: { x: p.x, y: p.y, z: p.z },
      barks: [
        "Internal Security. Keep your hands where the Republic can see them.",
        "The date on my orders is March 1967. I intend to act like it.",
      ],
    });
    if (a && L.near(p.x, p.z, 40))
      L.notify("Boots on the pavement. Internal Security answers fast.", {
        quiet: true,
      });
  }
  /** Continuity actors near the cabinet stand down while the inspector is here. */
  function relayTruce() {
    const r = spots().relay;
    if (!r) return;
    L.factionTruce("continuity", r.x, r.z, 40, false, {
      id: "bs_relay_truce",
      cond: () =>
        (Q.stage(QID) === "expose" && !solved()) ||
        (outcome() === "exposed" && L.alive("bs_inspector")),
    });
  }

  // ------------------------------------------------------------------
  // Terminal: the Continuity signals cabinet
  // ------------------------------------------------------------------
  const RELAY_TERM = {
    title: "CONTINUITY SIGNALS — CABINET LX-47",
    header:
      "OFFICE OF THE ACTING PRESIDENT — INTERNAL SECURITY\nFIELD INTERCEPT RELAY LX-47 (LEXINGTON AT 47TH)\n>> DATE ON FILE: MARCH 7, 1967",
    lock: { id: LOCK_RELAY.id, passcode: LOCK_RELAY.passcode },
    entries: [
      {
        title: 'Intercept Log — "SEPT" Traffic',
        action: () => {
          readRelay();
        },
        text:
          "SOURCE: FOREIGN, SHORTWAVE, CIPHERED. CIPHER: BROKEN (SHIFT SEVEN — THEY NEVER CHANGE IT).\n\n" +
          "0214 — LYS TO C.: COURIER LATE. MAILBOX UNTOUCHED. WILL WAIT.\n0219 — C. TO LYS: WAIT. ALWAYS WAIT. WE ARE VERY GOOD AT IT.\n" +
          "0301 — LYS TO C.: PIVERT NOT AT THE ARCH. THREE DAYS.\n0302 — C. TO LYS: THEN WE NEED A FACE THEY DO NOT KNOW.\n\n" +
          'OPERATOR\'S NOTE: Subject "Pivert" detained 03/02, did not survive questioning. Mailbox left in place as bait. Bait not taken. ' +
          "Recommend patience. Recommend coffee.\n\n[You tear the printout off the roller.]",
      },
      {
        title: "Standing Order 19 — Foreign Nationals",
        action: () => {
          readRelay();
        },
        text:
          "BY ORDER OF THE ACTING PRESIDENT\n\nAll foreign nationals in the Manhattan district are to be detained on the first night of frost and " +
          'held pending the restoration of normal diplomatic relations.\n\nDate of restoration: TO BE ANNOUNCED.\n\nKnown subjects: "LYS" (female, ' +
          'forties, writes letters at the Grand Central market, location confirmed); "CORBEAU" (male, elderly, location unknown, believed to own a boat).',
      },
      {
        title: "File 67-10-23 / Attribution",
        action: () => {
          readRelay();
          msSet("attribution_on_liberty");
        },
        text:
          "FILE 67-10-23: WHO GAVE THE ORDER.\n\nSTATUS: SEALED BY ORDER OF THE ACTING PRESIDENT. ORIGINAL HELD AT LIBERTY STATION (EVIDENCE ROOM). NO COPIES.\n\nREQUESTS TO UNSEAL: 41. GRANTED: 0.\n\n" +
          "LAST REQUEST: FROM THIS CABINET'S OWN OPERATOR, 1988, HANDWRITTEN: \"Sir, if it wasn't them, who was it?\" STATUS: OPERATOR REASSIGNED.",
      },
      {
        title: "Captured Dossier HIVER — Sources",
        action: () => {
          readRelay();
        },
        text:
          'FROM BUREAU SEPT DOSSIER "HIVER" (RECOVERED 1967, PARTIAL)\n\nSUBJECT: PROJECT LONG WINTER (OCD).\n\nSOURCES:\n  LUMIERE (since summer \'66): civilian, UN interpretation staff, unwitting. Close to volunteer "E.W.".\n    Warrant signed 4 MARCH 1967. NOT SERVED.\n  PIVERT: plumber, Grand Central. Deceased 03/02/89.\n  (36 further sources redacted)\n\n' +
          'CELLS: "CORBEAU" (Manhattan), "LYS" (Manhattan), "POSTE DRAGON" (Chinatown; silent since 1974).',
      },
      {
        title: ">> TRANSMIT: Report foreign agents to Internal Security",
        cond: () => canExpose(),
        action: () => reportBureau(),
      },
    ],
  };

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  L.hook("register", function () {
    L.terminal("bs_relay", RELAY_TERM);

    // ---------------- Mademoiselle Lys ----------------
    L.dialogue("dlg_bs_lys", {
      start: () => {
        const o = outcome();
        if (o === "sold") return "after_sold";
        if (o) return "goodbye";
        if (!Q.isStarted(QID))
          return L.flag("bs_met_lys") ? "stranger_again" : "stranger";
        const st = Q.stage(QID);
        if (st === "expose") return "suspect";
        if (st === "passage") return "pier";
        if (!L.flag("bs_met_lys")) return "pitch";
        if (st === "drop") return "drop_wait";
        if (st === "relay") return "relay_wait";
        if (st === "choice") return "choice";
        return "pitch";
      },
      nodes: {
        stranger: {
          text: "[A woman in a patched cardigan sits at the end of the bar with a portable typewriter, a stack of salvaged paper and a cold cup of something.] Letters written, five scrip a page. Love letters ten: I have to believe them. Condolences free.",
          onEnter() {
            L.setFlag("bs_met_lys_once");
          },
          responses: [
            {
              text: "Who would you send a letter to? Nobody is delivering mail.",
              next: "stranger_mail",
            },
            {
              text: "You aren't a letter writer.",
              check: { attr: "presence", value: 6 },
              next: "reveal",
              failNext: "stranger_fail",
              cond: canStart,
            },
            {
              text: "You aren't a letter writer.",
              next: "not_yet",
              cond: () => !canStart(),
            },
            { text: "Not today.", end: true },
          ],
        },
        not_yet: {
          text: "[She smiles at the typewriter, not at you.] Nobody in this station is what they were, monsieur. I am a letter writer today. Come back when you have more questions than I do. You will.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        stranger_again: {
          text: "The man who does not need a letter. Changed your mind?",
          responses: [
            {
              text: "That accent isn't from Brooklyn.",
              next: "reveal",
              cond: canStart,
            },
            {
              text: "That accent isn't from Brooklyn.",
              next: "not_yet",
              cond: () => !canStart(),
            },
            { text: "Not today.", end: true },
          ],
        },
        stranger_mail: {
          text: "Precisely. A letter is a message that cannot be answered. People find that very restful. You would be amazed what they tell a page when they know no one will write back.",
          responses: [
            {
              text: "That accent isn't from Brooklyn.",
              next: "reveal",
              cond: canStart,
            },
            {
              text: "That accent isn't from Brooklyn.",
              next: "not_yet",
              cond: () => !canStart(),
            },
            { text: "Good business. Goodbye.", end: true },
          ],
        },
        stranger_fail: {
          text: "No? Then what am I? A spy? [She laughs, very nicely.] Five scrip a page, monsieur. The offer stands.",
          responses: [
            {
              text: "That accent isn't from Brooklyn.",
              next: "reveal",
              cond: canStart,
            },
            {
              text: "That accent isn't from Brooklyn.",
              next: "not_yet",
              cond: () => !canStart(),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        reveal: {
          text: "[She looks at you for a long moment, then at the door, then back.] You have the face of a man who has not read a newspaper in twenty years. Sit. Order something you will regret. We should talk.",
          onEnter() {
            L.setFlag("bs_met_lys_once");
            ensureStarted();
          },
          responses: [{ text: "All right. Talk.", next: "pitch" }],
        },
        pitch: {
          text: () =>
            (L.flag("bs_got_note")
              ? "So. You are the one who answered our telephone. We still have a few wires the city forgot. "
              : L.flag("bs_met_lys_once")
                ? "Very well. "
                : "[She looks up from the typewriter as if she has been expecting you for a week, and pushes the other stool out with her foot.] Sit down, sleeper. ") +
            "For the purposes of this conversation my name is Lys. In the summer of '66 I was a mademoiselle and the most junior officer of the Bureau Sept, " +
            "the Seventh Bureau of a ministry in Paris that no longer answers its post. We were sent to watch your Office of Civil Defense: Corbeau's cell, mine, and a third " +
            "in Chinatown, Poste Dragon, which stopped answering in 1974. Then March came, and the bombers came from our side of the ocean. Nobody called us home. " +
            "[She turns the cold cup a quarter-turn.] The code name did not age as well as I did.",
          onEnter() {
            if (!L.flag("bs_met_lys")) {
              L.setFlag("bs_met_lys");
              ensureStarted();
            }
          },
          responses: [
            {
              text: () =>
                L.flag("ms_lys_met")
                  ? "You said you knew my face. From a photograph."
                  : "You look at me as if you know my face.",
              next: "face",
              cond: () =>
                !L.has("q_bs_photo_gallery") && !L.flag("bs_photo_given"),
            },
            { text: "Europe bombed us. And you want my help?", next: "blame" },
            {
              text: "Why trust a stranger with any of this?",
              check: { attr: "presence", value: 6 },
              next: "why_you",
              failNext: "why_fail",
            },
            {
              text: "What do you need?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        face: {
          text:
            "[She opens the typewriter case, lifts the false bottom and slides a creased photograph across the bar, face down. Then, after a moment, she turns it over herself.] " +
            "The Bureau watched everyone in 1967 who went near your Long Winter. That includes the volunteers. That includes the people they kissed goodbye.\n\n" +
            "[Grand Central. The Whispering Gallery. A young man with his face to the tiles; in the far corner a young woman in a pale coat, laughing. You, and Nicky. The nineteenth of February.]\n\n" +
            "I knew her. Before. I will tell you how, and you will not like it, after you have done me a favour. Information is the only money I still have, and I am a little ashamed of how I earned this piece.",
          onEnter() {
            L.setFlag("bs_photo_given");
            if (!L.has("q_bs_photo_gallery")) L.give("q_bs_photo_gallery", 1);
            msSet("lys_photo");
          },
          responses: [
            {
              text: "How do you know Flint?",
              next: "chin",
              cond: () => !!L.flag("ms_rose_met") && !L.flag("ms_lys_chin"),
            },
            {
              text: "What favour?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        chin: {
          text:
            "Flint? She empties my dead drops when my knees will not do the stairs. Five scrip a box, and she reads everything, and she thinks I do not know. " +
            "Lately she asks about you. Where you go. Who you talk to. [Lys looks at the photograph, and then at you, and something amuses her very much.] " +
            "Ask your Flint whose chin she has.",
          onEnter() {
            L.setFlag("ms_lys_chin");
          },
          responses: [
            { text: "What is that supposed to mean?", next: "chin2" },
            {
              text: "What favour?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        chin2: {
          text: "It means I am an old spy and I enjoy myself where I can. [She puts the photograph back in your hand and folds your fingers over it.] Now. The favour.",
          responses: [
            {
              text: "What favour?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        blame: {
          text:
            "I want your help because of it. Corbeau, our chief, has spent twenty-two years believing the order did not come from Paris. " +
            "He may be wrong. He may only be old. But somewhere your Continuity keeps a file that says who gave the order, and Corbeau would like to read it before he dies. " +
            "So would I. So, I think, would you.",
          responses: [
            {
              text: "Why trust a stranger with any of this?",
              check: { attr: "presence", value: 6 },
              next: "why_you",
              failNext: "why_fail",
            },
            {
              text: "What do you need?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        why_you: {
          text: () =>
            "Because you are a sleeper, " +
            first() +
            ". Do not look so surprised: you walk like a man who expects the traffic lights to work. " +
            "Your Continuity reads your name on the radio every night. They want you so badly they will never look for you in my company. For a little while you are the only honest face in this city. I would like to borrow it.",
          action: () => {
            L.xp(20, "Presence: Lys");
          },
          responses: [
            {
              text: "What do you need?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        why_fail: {
          text: "Because I have run out of people who are not strangers. That is the whole answer. It is not a flattering one.",
          responses: [
            {
              text: "What do you need?",
              next: () => (L.flag("bs_drop_open") ? "job_already" : "job"),
            },
          ],
        },
        job: {
          text:
            "Our courier, Pivert, went to the dead drop in March and did not come back. The drop is a rusted mailbox beside the Washington Square arch, " +
            "with a combination lock. The Continuity knows my face. Nobody knows yours. Bring me what is inside. Do not open the canister; it is old film and older manners.",
          responses: [
            {
              text: "The message said the box opens on the day the sky fell. 0-3-0-5.",
              cond: () => L.has("q_bs_note_coded") || !!L.flag("bs_got_note"),
              action: () => {
                learnDrop("The coded message");
                advance();
              },
              next: "job_ok",
            },
            {
              text: "What's the combination?",
              action: () => {
                learnDrop("Mademoiselle Lys");
                advance();
              },
              next: "job_code",
            },
          ],
        },
        job_code: {
          text:
            "Zero, three, zero, five. The fifth of March, written your way, month first. Twenty-two years and my hand still wants to write the day first. " +
            "Go carefully. Washington Square has rats the size of dachshunds, and not only rats.",
          responses: [{ text: "I'll bring it back.", end: true }],
        },
        job_ok: {
          text: "Good. You read your mail. Go carefully: Washington Square has rats the size of dachshunds, and not only rats.",
          responses: [{ text: "I'll bring it back.", end: true }],
        },
        job_already: {
          text:
            "[She sees the wax seal in your hand and goes very still.] You have already been to the arch. Then you have already read Corbeau's letter, because nobody can resist a letter. " +
            "Bon. Keep the canister a little longer. Read what the Continuity knows about us, at the cabinet on Lexington.",
          action: () => {
            learnDrop("Mademoiselle Lys");
            advance();
          },
          responses: [{ text: "All right.", end: true }],
        },
        drop_wait: {
          text: "The arch, the mailbox, the day the sky fell. Mind the rats.",
          responses: [
            {
              text: "Remind me of the combination.",
              action: () => learnDrop("Mademoiselle Lys"),
              next: "job_code",
            },
            { text: "On my way.", end: true },
          ],
        },
        relay_wait: {
          text:
            "You have Pivert's canister. Keep it a little longer, please. Corbeau's letter will have told you about the grey cabinet on Lexington. " +
            "Read what they know about us. I would go myself, but the Continuity would recognise me, and then I would be a story Corbeau tells.",
          responses: [
            {
              text: "What's the passcode again?",
              action: () => learnRelay("Mademoiselle Lys"),
              next: "pass",
            },
            { text: "What happened to Pivert?", next: "pivert" },
            { text: "On my way.", end: true },
          ],
        },
        pass: {
          text: "MAYFLOWER. The Americans name everything after a boat that arrived. We name everything after birds that leave. Draw your own conclusions.",
          responses: [{ text: "On my way.", end: true }],
        },
        pivert: {
          text:
            'He was a plumber from Lyon who came to New York to watch us, and stayed to fix the pipes at Grand Central. He was the last person alive who called me "mademoiselle" and meant it. ' +
            "[She types a line on the typewriter, pulls the page, folds it, and puts it in her pocket.] That is my letter for the day.",
          responses: [
            { text: "I'm sorry.", standing: 5, end: true },
            { text: "On my way.", end: true },
          ],
        },
        choice: {
          text: () =>
            L.flag("bs_relay_read")
              ? "Well? [She does not look up from the typewriter.] What do they know about us?"
              : "You have the canister. Have you read the cabinet on Lexington yet? Corbeau's letter has the passcode.",
          responses: [
            {
              text: "Everything. They broke your cipher years ago. Pivert is dead, and there's an order to round you up on the first night of frost.",
              cond: () => !!L.flag("bs_relay_read"),
              next: "news",
            },
            {
              text: "Not yet.",
              cond: () => !L.flag("bs_relay_read"),
              end: true,
            },
            {
              text: "I'm still thinking.",
              cond: () => !!L.flag("bs_relay_read"),
              end: true,
            },
          ],
        },
        news: {
          text:
            "[She stops typing.] Shift seven. We never changed it. Corbeau said a cipher is like a coat: you do not change it in winter. [A small, tired laugh.] " +
            "And the file? Did it say who gave the order?\n\n[You tell her: sealed, forty-one requests, none granted, the original kept on Liberty Island.] ...So. Even they do not know. Or they keep it where nobody can ask.",
          responses: [
            {
              text: "You said you'd tell me how you knew Nicole. Tell me now.",
              next: "lumiere",
              cond: () => !L.flag("ms_lumiere_told"),
            },
            {
              text: "Then it's time to go. I'll get you and Corbeau out of the city.",
              standing: 10,
              next: "leave_plan",
              action: () => {
                if (Q.isActive(QID)) Q.setStage(QID, "passage");
              },
            },
            {
              text: "That log is worth something. So is what I know about Long Winter. Make me an offer.",
              next: "sell",
            },
            { text: "I need to think it over.", end: true },
          ],
        },
        lumiere: {
          text: () =>
            "Summer of '66. The Automat on Forty-Second Street, the one with the little glass doors. She was homesick for Montreal and I was homesick for Lyon, and we were the only two people in New York who complained about the coffee in French. " +
            "She talked. About the booth, the delegates, the man she was going to marry, who was going into a government freezer for ninety days for nine hundred dollars and a ring. " +
            "I wrote down every word she said that night, in my room, before I slept. That was my work. In the Bureau's files she is a source: LUMIERE.\n\n" +
            "[She does not look away from you while she says it, which you suppose is a kind of courage.]\n\n" +
            "She never knew. Or she did not know then. The photograph was taken from my report: I sat in the Oyster Bar and watched you both whisper into the walls and I could not hear a word, " +
            first() +
            ". I was glad. That is the only part of it I am proud of.",
          onEnter() {
            L.setFlag("ms_lumiere_told");
            L.xp(30, "LUMIERE");
          },
          responses: [
            { text: "You used her.", next: "lumiere2" },
            { text: "Where is she now?", next: "lumiere_where" },
          ],
        },
        lumiere2: {
          text: "Yes. [A small shrug that is not careless.] Everyone in 1966 was using everyone. She was the only one who did not know it. If that is a reason to send me to Liberty Island, then go to the cabinet on Lexington, and I will finish my drink.",
          responses: [
            { text: "Where is she now?", next: "lumiere_where" },
            { text: "Let's talk about what happens to you.", next: "news" },
          ],
        },
        lumiere_where: {
          text:
            "I do not know. After the bombs I looked. Everybody looked for somebody. The Camp under the terminal, the riot, then nothing; the Continuity wrote her name in a file and drew a line under it. " +
            "If you find her, do not tell her my name. She would remember it.",
          responses: [
            { text: "Let's talk about what happens to you.", next: "news" },
          ],
        },
        leave_plan: {
          text:
            "Corbeau has a boat. Of course he has a boat: a harbour pilot's launch, the Sainte-Odile, under the pier at the Battery. Good hull, bad engine, no fuel. " +
            'He has been "almost ready" since 1971. Go to the pier. I will be there before you: I know the tunnels, and the tunnels know me.',
          responses: [{ text: "See you at the Battery.", end: true }],
        },
        sell: {
          text:
            "Ah. A professional. [For the first time she looks pleased.] The intercept log, yes. And your Project Long Winter: we watched it from the summer of '66 until the bombs and never learned what it was for. " +
            "Where the sleepers were kept. Who still knows the way in. What they built on Liberty Island. Paris paid well for that once. I am all that is left of Paris, and I pay less.",
          responses: [
            {
              text: "Federal secrets don't come cheap. Four hundred.",
              check: { skill: "persuasion", value: 50 },
              next: "sell_high",
              failNext: "sell_low",
            },
            {
              text: "Three hundred, and something of yours I can use.",
              next: "sell_low",
            },
            { text: "Forget it. That isn't who I am.", next: "news" },
          ],
        },
        sell_high: {
          text:
            "[She counts out four hundred in scrip without blinking, then a ledger bound in cloth.] You talk like a man who has sold a country before. " +
            "Tell me everything. Start with the basement under the Municipal Building, and go slowly. I type with two fingers.",
          responses: [
            {
              text: "[Tell her everything.]",
              action: () => outcomeSold(400),
              end: true,
            },
          ],
        },
        sell_low: {
          text:
            "[She counts out three hundred in scrip and slides a cloth-bound ledger across the bar.] Our field ledger. Drone circuits, ration depots, who sells to Liberty Island. " +
            "It is worth more to you than to me now. Tell me everything. Start with the basement under the Municipal Building.",
          responses: [
            {
              text: "[Tell her everything.]",
              action: () => outcomeSold(300),
              end: true,
            },
          ],
        },
        suspect: {
          text: "[She sniffs the air near your sleeve.] Teletype ink. Fresh. [She goes back to her typing.] Go away now, please, mon ami, while I finish my drink. I would like to finish my drink.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        pier: {
          text: "Talk to Corbeau. He has the boat, the opinions and, God help us, a plan.",
          responses: [{ text: "All right.", end: true }],
        },
        after_sold: {
          text: [
            "Bonsoir. Not here, please. People watch.",
            "Another letter? No? Then another secret. My rates are reasonable.",
            "You are in my ledger now, sleeper. Do not take it personally. I am in yours.",
          ],
          responses: [{ text: "Goodbye, Lys.", end: true }],
        },
        goodbye: {
          text: "Bonne chance, sleeper.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });

    // ---------------- Corbeau ----------------
    L.dialogue("dlg_bs_corbeau", {
      start: () => (outcome() ? "gone" : "meet"),
      nodes: {
        meet: {
          text: () =>
            "[He is seventy if he is a day, in an overcoat that was elegant in 1967, sitting on a bollard as if it were a café chair.] " +
            "So. The Americans send a sleeper to row me home. Corbeau. Lys tells me you are called " +
            first() +
            " and that you are clever. " +
            "This is the Sainte-Odile. [A grey launch knocks against the pilings below.] Good hull. Bad engine. No fuel. Be clever.",
          responses: [
            {
              text: "Let me look at that engine.",
              check: { skill: "mechanics", value: 40 },
              next: "fixed",
              failNext: "fix_fail",
            },
            {
              text: "There's Hi-Octane Harry's gas on the docks. A hundred scrip; my treat.",
              cond: () => L.scrip() >= 100,
              action: () => {
                L.pay(100);
              },
              next: "fueled",
            },
            {
              text: "You don't need the engine. Go out on the ebb; the current runs through the Narrows on its own.",
              check: { attr: "wits", value: 6 },
              next: "tide",
              failNext: "tide_fail",
            },
            { text: "Where will you even go?", next: "where" },
            { text: "Then we row. I'll push you off myself.", next: "row" },
          ],
        },
        where: {
          text:
            "Out past the Narrows. Then east along the coast, harbour to harbour, asking questions. Somewhere there is a radio that answers in French, " +
            "or a file that says who gave the order. If it was Paris, I would like to hear it from Paris. If it was not, I would like to tell someone. [He pats his coat, where something book-shaped sits.] " +
            "I carry the strike flight's own codebook, SIROCCO. Paris sent one to every cell in the last week of February '67, and I have spent twenty-two years wondering why. Someone in Europe should explain it to me. Either way I would like to stop waiting. Twenty-two years is long enough to be good at something.",
          responses: [{ text: "About the boat...", next: "meet" }],
        },
        fix_fail: {
          text: "[Something goes ping and rolls into the harbour.] You have made it worse in a new and interesting way. I respect that. I have done it every spring since 1971.",
          responses: [{ text: "About the boat...", next: "meet" }],
        },
        tide_fail: {
          text: "The ebb? Mon ami, I have watched this tide for twenty years. It goes out, and then it comes back. Like me, every spring.",
          responses: [{ text: "About the boat...", next: "meet" }],
        },
        fixed: {
          text:
            "[Twenty minutes, a bent screwdriver and some language. The engine coughs, thinks about it, and catches.] ...She runs. She runs! " +
            "[He looks at the engine as if it has said his name.] Lys! LYS! Bring the bags. The American has performed a miracle with a screwdriver.",
          responses: [
            {
              text: "[See them off.]",
              action: () => outcomeLeft("mechanics"),
              end: true,
            },
          ],
        },
        fueled: {
          text:
            '[You come back with two dented cans of Hi-Octane Harry\'s gas. Corbeau pours them in with the care of a man decanting wine.] "Full service. Full tank. Full speed ahead." ' +
            "It says so on the can. I will hold Harry to that.",
          responses: [
            {
              text: "[See them off.]",
              action: () => outcomeLeft("fuel"),
              end: true,
            },
          ],
        },
        tide: {
          text:
            "[He takes a stub of pencil and does the arithmetic on his cuff, twice.] ...The ebb, at the half. Out through the Narrows before the engine is even warm. " +
            "Twenty years I have watched this water and never once asked it for a lift. [He laughs, a real one.] Lys! We are leaving with the tide, like gentlemen.",
          responses: [
            {
              text: "[See them off.]",
              action: () => outcomeLeft("tide"),
              end: true,
            },
          ],
        },
        row: {
          text:
            "Row. To France. [He considers this with great seriousness.] ...As far as the Narrows, perhaps. Then the current, then the coast, then we see. " +
            "Very well, sleeper. Put your shoulder to her. Lys, the bags. And the oars. And your patience, which you will need more than the oars.",
          responses: [
            {
              text: "[Push them off.]",
              action: () => outcomeLeft("row"),
              end: true,
            },
          ],
        },
        gone: { text: "...", responses: [{ text: "Goodbye.", end: true }] },
      },
    });

    // ---------------- Inspector Harlan Pike (the Continuity) ----------------
    L.dialogue("dlg_bs_inspector", {
      start: () => (outcome() === "exposed" ? "after" : "brief"),
      nodes: {
        brief: {
          text:
            'Inspector Harlan Pike, Internal Security, Office of the Acting President. Your transmission said "foreign agents". ' +
            "The date on my orders is March 1967, and I intend to act like it. What have you got for me?",
          responses: [
            {
              text: "They're old and stranded. Deport them through Governors Island. Not against a wall.",
              cond: () => !L.flag("bs_leniency"),
              check: { attr: "presence", value: 6 },
              action: () => {
                L.setFlag("bs_leniency");
              },
              next: "lenient",
              failNext: "lenient_fail",
            },
            {
              text: "[Hand over the microfilm canister from their dead drop.]",
              cond: () => L.has("q_bs_microfilm"),
              action: () => outcomeExposed(true),
              next: "evidence",
            },
            {
              text: "A woman called Lys, at the Whistle Stop bar in Grand Central. An old man called Corbeau with a boat. That's all I have.",
              action: () => outcomeExposed(false),
              next: "word",
            },
          ],
        },
        lenient: {
          text:
            "[He writes something in a small black book.] Liberty Station first, for questioning. Then Governors Island, deportation pending the restoration of diplomatic relations. " +
            "It will be in the file. The file is the only thing that matters.",
          responses: [
            {
              text: "[Hand over the microfilm canister.]",
              cond: () => L.has("q_bs_microfilm"),
              action: () => outcomeExposed(true),
              next: "evidence",
            },
            {
              text: "Lys, at the Whistle Stop. Corbeau, with a boat. That's all.",
              cond: () => !L.has("q_bs_microfilm"),
              action: () => outcomeExposed(false),
              next: "word",
            },
          ],
        },
        lenient_fail: {
          text: "Mercy is above my grade, citizen. Evidence is not.",
          responses: [
            {
              text: "[Hand over the microfilm canister.]",
              cond: () => L.has("q_bs_microfilm"),
              action: () => outcomeExposed(true),
              next: "evidence",
            },
            {
              text: "Lys, at the Whistle Stop. Corbeau, with a boat. That's all.",
              cond: () => !L.has("q_bs_microfilm"),
              action: () => outcomeExposed(false),
              next: "word",
            },
          ],
        },
        evidence: {
          text:
            "[He turns the canister in his gloved hand and reads the wax seal.] VII. The Bureau Sept. Twenty-two years they have been in my city. " +
            "[He pockets it.] A detail will collect them tonight and take them out to Liberty. The old man carries a codebook, I am told; it will go in the evidence locker with the rest of 1967. The Continuity thanks you, citizen. It will thank you again in writing, eventually.",
          responses: [{ text: "Glad to help.", end: true }],
        },
        word: {
          text: "[He writes it down.] A name and a bar. It will do; we have had less. A detail will collect them tonight and take them out to Liberty, and whatever they carry goes in the evidence locker. The Continuity thanks you, citizen.",
          responses: [{ text: "Glad to help.", end: true }],
        },
        after: {
          text: "The matter is closed, citizen. Move along. The Republic endures.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // World: phone booth, dead drop, signals cabinet (static, once)
  // ------------------------------------------------------------------
  L.hook("world", function () {
    const sp = spots();
    if (locksLive() && G.locks.register) {
      safeCall("register", () =>
        G.locks.register(Object.assign({}, LOCK_DROP)),
      );
      safeCall("register", () =>
        G.locks.register(Object.assign({}, LOCK_RELAY)),
      );
      if (G.locks.learnableFrom) {
        safeCall("learnableFrom", () =>
          G.locks.learnableFrom(
            LOCK_DROP.id,
            "Coded message from the Chambers Street phone booth (q_bs_note_coded); Mademoiselle Lys (dlg_bs_lys)",
          ),
        );
        safeCall("learnableFrom", () =>
          G.locks.learnableFrom(
            LOCK_RELAY.id,
            "Corbeau's letter in the Washington Square dead drop (q_bs_corbeau_letter); Mademoiselle Lys (dlg_bs_lys)",
          ),
        );
      }
      if (G.locks.obtainableFrom) {
        safeCall("obtainableFrom", () =>
          G.locks.obtainableFrom(
            "q_bs_note_coded",
            "The ringing phone booth on Chambers Street (after Long Winter)",
          ),
        );
        safeCall("obtainableFrom", () =>
          G.locks.obtainableFrom(
            "q_bs_corbeau_letter",
            "The Washington Square dead drop",
          ),
        );
      }
    }
    const V3 = L.V3;
    // The phone booth on Chambers Street, a few steps from the Municipal Building arch.
    if (sp.booth) {
      L.prop("phone_booth", {
        x: sp.booth.x,
        y: sp.booth.y,
        z: sp.booth.z,
        yaw: faceTo(sp.booth, sp.exit),
        container: false,
        persistent: true,
        id: "q_bs_phone_booth",
      });
      G.world.addInteractable({
        pos: V3(sp.booth.x, (sp.booth.y || 0) + 1.2, sp.booth.z),
        radius: 1.2,
        label: () => (phoneLive() ? "Ringing Phone Booth" : "Phone Booth"),
        verb: () => (phoneLive() ? "Answer" : "Lift Receiver"),
        enabled: () => mq01Done(),
        onInteract: () => safeCall("phone", answerPhone),
      });
    }
    // The dead drop by the Washington Square arch.
    if (sp.drop) {
      L.prop("mailbox", {
        x: sp.drop.x,
        y: sp.drop.y,
        z: sp.drop.z,
        yaw: faceTo(sp.drop, sp.arch),
        container: false,
        persistent: true,
        id: "q_bs_dead_drop_box",
      });
      G.world.addInteractable({
        pos: V3(sp.drop.x, (sp.drop.y || 0) + 1.0, sp.drop.z),
        radius: 1.0,
        label: () =>
          L.flag("bs_drop_open")
            ? "Rusted Mailbox (empty)"
            : "Rusted Mailbox (combination lock)",
        verb: () => (L.flag("bs_drop_open") ? "Search" : "Open"),
        locked: () =>
          !L.flag("bs_drop_open") &&
          locksLive() &&
          G.locks.isOpen &&
          !G.locks.isOpen(LOCK_DROP.id)
            ? "Locked"
            : null,
        onInteract: () => safeCall("drop", openDrop),
      });
    }
    // The Continuity signals cabinet (a field teletype) at Lexington & 47th.
    if (sp.relay) {
      safeCall("term", () =>
        L.spawnTerminal(
          "bs_relay",
          sp.relay,
          faceTo(sp.relay, { x: 280, z: -275 }),
        ),
      );
      // Without a terminals module the cabinet still prints its log (completability).
      if (G.isStub("terminals")) {
        const report = () => canExpose() && Q.stage(QID) === "choice";
        G.world.addInteractable({
          pos: V3(sp.relay.x, (sp.relay.y || 0) + 1.2, sp.relay.z),
          radius: 0.9,
          label: () =>
            report()
              ? "Signals Cabinet LX-47 (report the Bureau)"
              : "Signals Cabinet LX-47",
          verb: () => (report() ? "Transmit" : "Read"),
          onInteract() {
            if (report()) {
              L.notify(reportBureau());
              return;
            }
            readRelay();
            L.notify(
              "The cabinet's teletype has been printing the Bureau's radio traffic, decoded, for years. There is an order to round them up on the first night of frost.",
              { duration: 7 },
            );
          },
        });
      }
    }
  });

  // ------------------------------------------------------------------
  // Session spawns (new game / load)
  // ------------------------------------------------------------------
  L.hook("spawn", function () {
    spots();
    spawnLys();
    if (Q.isActive(QID) && Q.stage(QID) === "passage") spawnCorbeau();
    if (Q.isActive(QID) && Q.stage(QID) === "expose") spawnInspector();
    if (Q.isActive(QID) && Q.stage(QID) === "expose") relayTruce();
  });

  // A dead telephone rings on Chambers Street once the hero is out of the cryo unit.
  L.trigger({
    id: "bs_phone_ring",
    r: 16,
    pos: () => spots().booth || null,
    cond: () => phoneLive() && !L.inInterior(),
    fire() {
      L.notify(
        "Somewhere close, a telephone is ringing. Every telephone line in the city has been dead since 1967.",
        { duration: 6 },
      );
    },
  });

  // Pickups / items arriving by any route (pickup, container, debug).
  G.events.on("itemAdded", (id) => {
    safeCall("itemAdded", () => {
      if (id === "q_bs_note_coded") {
        L.setFlag("bs_got_note");
        learnDrop("The coded message");
        ensureStarted();
      } else if (id === "q_bs_corbeau_letter") {
        learnRelay("Corbeau's letter");
      }
    });
  });
  G.events.on("lockOpened", (id) => {
    if (id === LOCK_DROP.id && !L.flag("bs_drop_open"))
      safeCall("lockOpened", dropOpened);
  });

  // Lys walks to the pier (out of sight) once the hero has agreed to help them leave.
  let pollT = 0;
  L.hook("update", function (dt, realDt) {
    pollT -= realDt;
    if (pollT > 0) return;
    pollT = 1;
    if (!Q.isActive(QID)) return;
    const st = Q.stage(QID);
    if (st === "passage") {
      const sp = spots(),
        a = L.npc("bs_lys");
      if (
        a &&
        !a.dead &&
        sp.lysPier &&
        Math.hypot(a.pos.x - sp.lysPier.x, a.pos.z - sp.lysPier.z) > 8 &&
        L.dist(a.pos.x, a.pos.z) > 35 &&
        L.dist(sp.lysPier.x, sp.lysPier.z) > 35
      )
        L.moveNPC("bs_lys", sp.lysPier);
      if (!L.npc("bs_corbeau")) spawnCorbeau();
    } else if (
      st === "expose" &&
      !L.npc("bs_inspector") &&
      !L.hasPending("bs_inspector")
    ) {
      L.later(1, spawnInspector, "bs_inspector");
    }
  });

  // ------------------------------------------------------------------
  // Debug: G.quests.debug.spies(step)
  //   'start' | 'drop' | 'relay' | 'choice' | 'expose' | 'expose_done' | 'leave' | 'leave_done' | 'sell' (alias 'sell_done')
  // ------------------------------------------------------------------
  G.quests.debug.spies = function (step) {
    step = step || "start";
    const ensureStarted = () => {
      if (!Q.isStarted(QID)) Q.start(QID);
      advance();
    }; // debug: ignores the mq15 gate
    const toChoice = () => {
      ensureStarted();
      L.setFlag("bs_met_lys");
      learnDrop("debug");
      if (!L.flag("bs_drop_open")) {
        if (locksLive() && G.locks.unlock)
          safeCall("debug", () => G.locks.unlock(LOCK_DROP.id));
        dropOpened();
      }
      learnRelay("debug");
      readRelay();
      advance();
    };
    switch (step) {
      case "start":
        ensureStarted();
        break;
      case "drop":
        ensureStarted();
        L.setFlag("bs_met_lys");
        learnDrop("debug");
        advance();
        break;
      case "relay":
        ensureStarted();
        L.setFlag("bs_met_lys");
        learnDrop("debug");
        if (locksLive() && G.locks.unlock)
          safeCall("debug", () => G.locks.unlock(LOCK_DROP.id));
        dropOpened();
        advance();
        break;
      case "choice":
        toChoice();
        break;
      case "expose":
        toChoice();
        reportBureau();
        break;
      case "expose_done":
        toChoice();
        if (Q.stage(QID) !== "expose") reportBureau();
        outcomeExposed(L.has("q_bs_microfilm"));
        break;
      case "leave":
        toChoice();
        if (Q.stage(QID) === "choice") Q.setStage(QID, "passage");
        break;
      case "leave_done":
        toChoice();
        if (Q.stage(QID) === "choice") Q.setStage(QID, "passage");
        outcomeLeft("debug");
        break;
      case "sell":
      case "sell_done":
        toChoice();
        outcomeSold(300);
        break;
      default:
        break;
    }
    return {
      stage: Q.stage(QID),
      status: Q.get(QID) && Q.get(QID).status,
      outcome: outcome(),
      spots: S,
    };
  };
})();
