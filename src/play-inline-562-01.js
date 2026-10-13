// play-inline-562 01 — the
// Lines 47-284 of readable/play-inline-562.pretty.js (statement-aligned).
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

