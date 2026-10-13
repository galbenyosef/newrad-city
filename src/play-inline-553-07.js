// play-inline-553 07 — next
// Lines 1800-2148 of readable/play-inline-553.pretty.js (statement-aligned).
  function resolveBelt(how) {
    L.take("q_garden_belt", 1);
    if (how === "given") {
      L.setFlag("malone_belt_given");
      L.xp(100, "The Undisputed");
      L.news(
        'Word from the Neon, folks: "Gentleman" Jim Malone was seen at the Rad-Lounge last night wearing a championship belt over his suit, buying rounds for the house. First time anybody\'s seen him smile. It was terrifying. It was beautiful.',
      );
    } else if (how === "sold") {
      L.setFlag("malone_belt_sold");
      L.giveScrip(200);
    } else {
      L.setFlag("malone_belt_kept");
      L.give("q_garden_belt_trophy", 1);
    }
    L.setFlag("malone_quest_done", how);
    Q.setStage("sq_malone", "done");
    talentOn.malone = null;
  }

  // ---- Tull -----------------------------------------------------------
  cfg.tull.ack = {
    far: "Distance. Yes. I'm very good at distance. Ask anyone at the Keep.",
    near: "Close. Good. I'm — good. Yes.",
    melee: "Melee. Oh dear. Right. Stabby end forwards.",
    ranged: "Ranged. Thank you. Genuinely.",
    passive: "Passive. That's my natural state, honestly.",
    aggressive: "Aggressive. I'll... try to be. Rarr. Sorry.",
  };
  cfg.tull.partAsk =
    "Oh. Of course. I understand. I'll go back to my bench at Grand Central. If you need me, I'll be the one surrounded by paper.";
  cfg.tull.partBye = "Take care of yourself. Read something, occasionally.";
  cfg.tull.fullText =
    "You're already travelling with someone. I'd only slow you both down. And I snore. In Latin.";
  cfg.tull.compLine = () =>
    Q.isActive("sq_tull")
      ? "The Guggenheim is on Fifth, by the park. Top of the spiral."
      : "";
  L.hook("register", function () {
    const k = "tull";
    const c0 = cfg.tull;
    const S = () => st(k);
    const joinResps = () => [
      {
        text: "Travel with me, Ambrose.",
        cond: () => !current() && c0.canHire(),
        action: () => recruit(k, "asked"),
        next: "hired",
      },
      {
        text: "I'd ask you along, but I already have company.",
        cond: () => !!current() && current() !== k,
        next: "full",
      },
    ];
    makeTree(
      k,
      startNode(k, () => {
        const s = S();
        if (tier() >= 3) return "refuse";
        if (s.left) return c0.canHire() ? "rehire_left" : "refuse_soft";
        if (s.dismissed && s.hired)
          return c0.canHire() ? "rehire" : "refuse_soft";
        return s.met ? "again" : "intro";
      }),
      {
        intro: {
          speaker: c0.name,
          text: "[A thin man in an Archivist's grey robe sits on a waiting-room bench, copying one book into another by hand. Where the Covenant's iron sigil should be there is a paler square of cloth, and a few loose threads.] Please don't stand in my light. Or — do. It isn't my light anymore. Nothing is, officially.",
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "What are you copying?", next: "copying" },
            { text: "[Leave.]", end: true },
          ],
        },
        again: {
          speaker: c0.name,
          text: "Oh — hello again. I'm on page three hundred and twelve. It's going well. The ink isn't.",
          responses: () => [
            { text: "Tell me about yourself.", next: "who" },
            { text: "Would you like to travel with me?", next: "ask_join" },
            { text: "[Leave.]", end: true },
          ],
        },
        who: {
          speaker: c0.name,
          text: 'Ambrose Tull. Formerly Archivist Tull, of the Iron Covenant\'s Keep at Rockefeller Center. Expelled — for "unauthorised dissemination of restricted technical material." [He hands you a folded paper.] I gave Doc Hollis a copy of a field-surgery manual. Forty-one people are alive because of it. The Covenant\'s Rule has a footnote for that. The footnote is: "irrelevant."',
          onEnter: () => {
            if (!S().gotOrder) {
              S().gotOrder = true;
              L.give("q_note_tull_expulsion", 1);
            }
          },
          responses: [
            { text: "That's rough.", next: "rough" },
            { text: "Would you like to travel with me?", next: "ask_join" },
            { text: "[Leave.]", end: true },
          ],
        },
        copying: {
          speaker: c0.name,
          text: "\"Principles of Water Purification,\" fourth edition. The only copy is in the Covenant's archive, so I'm copying it from memory. Mostly memory. Some of it I'm improving.",
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "[Leave.]", end: true },
          ],
        },
        rough: {
          speaker: c0.name,
          text: "It's fine. It's... no, it isn't fine. But I can read, and nobody can take that away. They tried. They took the library card. Metaphorically. Also literally.",
          responses: [
            { text: "Would you like to travel with me?", next: "ask_join" },
            { text: "[Leave.]", end: true },
          ],
        },
        ask_join: {
          speaker: c0.name,
          text: () =>
            c0.canHire()
              ? "[He studies you over his spectacles.] You're... actually decent, aren't you? I've been listening to Rocky Delgado. [He closes the book.] I know this city's machines better than anyone outside the Keep. I can fix what you break and read what you can't. In exchange, you keep the Maniacs off me while I look at things. I'm told that's called \"a companion.\""
              : "I'm sorry. I've read enough history to be careful about who I follow. The radio doesn't say anything about you yet — nothing good, anyway. Come back when it does.",
          responses: () =>
            joinResps().concat([{ text: "[Leave.]", end: true }]),
        },
        hired: {
          speaker: c0.name,
          text: "[He packs the two books, a bottle of ink, eleven pencils and a sidearm he holds like a dead fish.] Right. Adventure. I've read about it. Lead the way.",
          responses: [{ text: "Let's go.", end: true }],
        },
        rehire: {
          speaker: c0.name,
          text: "You came back. [He looks genuinely pleased.] I kept notes while you were gone. There's a great deal to catch up on. Shall we?",
          responses: () =>
            joinResps().concat([{ text: "Not yet.", end: true }]),
        },
        rehire_left: {
          speaker: c0.name,
          text: "[He closes his book, slowly.] Rocky's been saying kind things about you. I checked his sources. They hold up. [A small smile.] Everyone deserves a second edition. I'll come.",
          responses: () =>
            joinResps().concat([{ text: "Maybe later.", end: true }]),
        },
        refuse_soft: {
          speaker: c0.name,
          text: "I'm sorry. I can't follow you. Not the way things are. If the radio ever says something kind about you, I'll be right here.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        refuse: {
          speaker: c0.name,
          text: "[He doesn't look up from the page.] No. I know who you are. I've read about people like you — every century has them. I'd rather copy books in the dark.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        // --- companion extras ---
        about: {
          speaker: c0.name,
          text: () =>
            pick([
              'I was born in the Keep. My first word was "catalogue." My second was "why," and I\'m told that\'s where the trouble started.',
              "Knowledge must be kept, says the Rule. I always thought it should be lent. You don't lock a lamp in a strongroom. Well. You can. It just doesn't do anything.",
              "I miss the archive. The smell of it. Old paper and machine oil. I don't miss the people who guard it.",
            ]),
          responses: [
            {
              text: "You said you had a plan once.",
              cond: () => !Q.isStarted("sq_tull"),
              next: "press_offer",
            },
            { text: "Let's talk about something else.", next: "comp" },
          ],
        },
        press_offer: {
          speaker: c0.name,
          text: 'A plan. Yes. [He brightens alarmingly.] In 1967 the Guggenheim held an exhibition — "The Printed Word: Five Hundred Years of the Press." The centrepiece was an Autotype Mark IX, a teletype press that sets and prints a whole book from a tape reel in a minute. If I had its core, I could open a free reading room at Grand Central. Books for anyone. The Covenant would call it heresy. I call it the entire point.',
          responses: [
            {
              text: "Let's go get it.",
              action: () => Q.start("sq_tull"),
              next: "press_go",
            },
            { text: "Another time.", next: "comp" },
          ],
        },
        press_go: {
          speaker: c0.name,
          text: "Wonderful. It's on Fifth Avenue by the park — the building that looks like a teacup someone sat on. The core should be at the top of the ramp. There will be robots. There are always robots.",
          responses: [{ text: "Let's go.", end: true }],
        },
        press_back: {
          speaker: c0.name,
          text: "[You hold out the core. Tull makes a small sound, the kind people make at weddings.] That's it. That's really it. May I...?",
          responses: () => [
            {
              text: "It's yours. Go build your library.",
              standing: 100,
              action: () => resolvePress("given"),
              next: "press_given",
            },
            {
              text: "Something like this must be worth a lot of scrip.",
              check: { skill: "trade", value: 50 },
              next: "press_paid",
              failNext: "press_paid_fail",
            },
            {
              text: "I'm keeping it.",
              action: () => resolvePress("kept"),
              next: "press_kept",
            },
          ],
        },
        press_given: {
          speaker: c0.name,
          text: "The Grand Central Free Reading Room. Open to anyone. No sigil required. [He blinks, hard.] I'll print you a copy of everything. First edition. Footnoted. Thank you. Truly.",
          responses: [{ text: "You're welcome, Ambrose.", end: true }],
        },
        press_paid: {
          speaker: c0.name,
          text: "Oh. Yes, of course. That's — fair. [He empties his pockets: scrip, a pencil stub, a button.] One hundred and fifty. It's everything I have. Well, not the button.",
          onEnter: () => resolvePress("paid"),
          responses: [{ text: "Keep the button.", end: true }],
        },
        press_paid_fail: {
          speaker: c0.name,
          text: "I... don't have much. I'm an expelled Archivist. My net worth is a bench. Please?",
          responses: [
            {
              text: "Fine. Take it.",
              standing: 75,
              action: () => resolvePress("given"),
              next: "press_given",
            },
            {
              text: "No.",
              action: () => resolvePress("kept"),
              next: "press_kept",
            },
          ],
        },
        press_kept: {
          speaker: c0.name,
          text: "[The light goes out of his face, carefully, like a man turning down a lamp.] I see. Well. It was only a library. I'll keep copying by hand. It's fine. I'm used to it.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        repair: {
          speaker: c0.name,
          text: () => {
            const n = tullRepair();
            return n
              ? "[He spreads a cloth on the ground and works fast, muttering part numbers.] There. Stripped, cleaned, re-seated. It won't be new, but it won't explode. Probably."
              : "Everything you're carrying is in better shape than I could make it. Honestly, I'm impressed.";
          },
          responses: [{ text: "Thanks, Ambrose.", next: "comp" }],
        },
      },
      () => [
        { id: cid(k, "about"), text: "Tell me about yourself.", next: "about" },
        {
          id: cid(k, "press"),
          text: "You mentioned a plan...",
          cond: () => !Q.isStarted("sq_tull"),
          next: "press_offer",
        },
        {
          id: cid(k, "rep"),
          text: "Can you look at my gear?",
          cond: () => st(k).lastDay !== (G.time ? G.time.day : 0),
          next: "repair",
        },
        {
          id: cid(k, "core"),
          text: "I found your press core.",
          cond: () => Q.stage("sq_tull") === "return" && L.has("q_press_core"),
          next: "press_back",
        },
      ],
    );
  });
  /** Tull's field repair (once a day): equipped weapon + armour up to 90% condition. */
  function tullRepair() {
    const s = st("tull");
    s.lastDay = G.time ? G.time.day : 0;
    if (
      G.isStub("inventory") ||
      !G.inventory.equipped ||
      !G.inventory.setCondition
    )
      return 0;
    let n = 0;
    for (const slot of ["weapon", "body", "head"]) {
      let id = null;
      try {
        id = G.inventory.equipped(slot);
      } catch (e) {
        id = null;
      }
      if (!id) continue;
      let c = 1;
      try {
        c = G.inventory.condition(id);
      } catch (e) {
        c = 1;
      }
      if (typeof c === "number" && c < 0.9) {
        try {
          G.inventory.setCondition(id, 0.9);
          n++;
        } catch (e) {
          /* */
        }
      }
    }
    if (n) L.sfx("repair", { volume: 0.6 });
    return n;
  }
  function resolvePress(how) {
    L.take("q_press_core", 1);
    if (how === "given" || how === "paid") {
      L.setFlag("tull_library");
      if (how === "paid") {
        L.giveScrip(150);
        L.setFlag("tull_paid");
      } else L.xp(100, "The Free Press");
      cfg.tull._home = null;
      dressLibrary();
      L.news(
        "Here's something you don't hear every day, New Rad City: there's a free library at Grand Central. A free LIBRARY. Run by a fella named Tull who used to wear the Covenant's grey robes. Books for anybody who asks. Rocky checked out three. Rocky has not returned them. Rocky regrets nothing.",
      );
    } else {
      L.setFlag("tull_press_kept");
      L.give("q_press_core_kept", 1);
      L.standing(-50, "Kept Tull's press core");
    }
    Q.setStage("sq_tull", "done");
    talentOn.tull = null;
  }

  // ---- Rook -----------------------------------------------------------
  cfg.rook.ack = {
    far: "Sniper nest. Fine by me. Don't get shot, I'm not coming down.",
    near: "Up close and personal. My favourite.",
    melee: "Knife time. [She grins. It is not a nice grin.]",
    ranged: "Rifle it is. Nice and quiet. Well. Loud. Then quiet.",
    passive: "Passive? Ugh. Fine. I'll only stab people who deserve it.",
    aggressive: "Now you're speaking my language.",
  };
  cfg.rook.partAsk =
    "You're ditching me? Heh. Everybody does, eventually. Fine. I'll be under the Arch. Don't let the rats eat you.";
  cfg.rook.partBye = "Later, boss. Try not to go soft without me.";
  cfg.rook.fullText =
    "You've already got a pet. I don't share. Get rid of them and we'll talk.";
