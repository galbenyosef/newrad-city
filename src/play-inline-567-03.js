// play-inline-567 03 — next
// Lines 318-637 of readable/play-inline-567.pretty.js (statement-aligned).
  WREN.add({
    mq11_pages: {
      speaker: "Tobias Wren",
      text: () =>
        L.has("ms_note_register_61")
          ? "The Sixty-One Camp pages again? I have them right here. I keep coming back to them myself."
          : "[Wren has the Register open on his desk and a kitchen knife warming over a candle. He slides the blade between two scorched leaves the way you would lift the skin off warm milk.] " +
            "There. The Sixty-One Camp, under the Terminal, 1967 and '68. I went down every Sunday with my book until they closed the stair. Who are you looking for?",
      responses: [
        { text: "Mead. Nicole Mead.", next: "mq11_e1" },
        { text: "Read me the births first.", next: "mq11_e1" },
      ],
    },
    mq11_e1: {
      speaker: "Tobias Wren",
      text:
        "[He runs a fingernail down the column of black ink, stops, and turns the book round so you can read it yourself.]\n\n" +
        '"MEAD, ROSE. f. Born 11 Nov 1967, at dawn, Track 61. Mother: Nicole Mead, interpreter, Canadian national. Father: E. W. (asleep, Civil Defense)."',
      responses: [
        {
          text: "E. W. ...That's me. Those are my initials.",
          next: "mq11_e1b",
        },
        { text: "[Read it again.]", next: "mq11_e1again" },
      ],
    },
    mq11_e1again: {
      text: "[MEAD, ROSE. Born at dawn. Father: E. W. (asleep). You read it a third time, and a fourth, and the words stay exactly where they are.]",
      responses: [{ text: "E. W. That's me.", next: "mq11_e1b" }],
    },
    mq11_e1b: {
      speaker: "Tobias Wren",
      text:
        '[Wren takes his glasses off.] Asleep, Civil Defense. She was very particular about that. I wrote "father unknown" and she made me cross it out. "Not unknown," she said. "Not dead. Asleep." She made me write it twice so the book would be sure. ' +
        "I thought she was out of her mind with the birth. [He looks at you over the desk for a long moment.] I am beginning to think she was the only sane person in the building.",
      responses: [
        { text: "A daughter. Rose. What happened to her?", next: "mq11_e2" },
      ],
    },
    mq11_e2: {
      speaker: "Tobias Wren",
      text:
        '[He turns the leaf. Red ink now, and black, crowded together.]\n\n"18 Feb 1968: refused penicillin at the Relief Station (not enrolled)."\n\n' +
        "The OCD gave out medicine against 1967 enrolment cards. No card, no medicine. Your Miss Mead was a Canadian; she had never been on anybody's list, and neither was a baby born in a railway tunnel.",
      responses: [{ text: "Keep going.", next: "mq11_e3" }],
    },
    mq11_e3: {
      speaker: "Tobias Wren",
      text:
        '"5 Mar 1968: riot. Penicillin taken. ROSE MEAD lives. Eleven children dead in the ration store. MEAD, NICOLE: missing."\n\n' +
        "[Under it, eleven names in red. Wren does not read them out. He puts his hand flat over them, as if to keep them warm.] The first anniversary of the Bombing. The Relief Station burned. I came down on the Sunday after with my book and wrote what people told me. " +
        "The baby lived. That one I underlined; you can see where the pencil went through.",
      responses: [
        { text: "She lived. Rose lived.", next: "mq11_margin" },
        { text: '"Missing." Not dead?', next: "mq11_missing" },
      ],
    },
    mq11_missing: {
      speaker: "Tobias Wren",
      text: "Missing is what I write when nobody saw a body and nobody will say. The Continuity, when it was still the OCD, wrote \"presumed dead\" on everything that went down those tracks. I don't presume. It isn't a clerk's job to presume.",
      responses: [{ text: "And Rose?", next: "mq11_margin" }],
    },
    mq11_margin: {
      speaker: "Tobias Wren",
      text:
        '[He hesitates, then points to the margin, where a much later pencil note sits sideways along the edge.]\n\n"1984: A girl of sixteen asked whether her father was in my book. I told her: asleep."\n\n' +
        'She came up the stairs here on her own, thin as a rail, soot on her fingers like a lamplighter, and asked for the Sixty-One Camp, 1967. I showed her the line. She read it for a long time. I said, "asleep." She said, "Still?" and I didn\'t have an answer for that. She wouldn\'t give a name. I never saw her again.',
      onEnter() {
        readPages();
      },
      responses: [
        {
          text: "She's alive. My daughter is alive, somewhere in this city.",
          next: "mq11_copy",
        },
      ],
    },
    mq11_copy: {
      speaker: "Tobias Wren",
      text: "Somewhere. People do turn up, you know. It's the one thing the book has taught me. [He squares the Register on the desk.] The City of New York doesn't have many offices left. I'm all of them. If you like, I can make you a certified copy of her entry. Properly. With the seal.",
      responses: [
        { text: "Please. I want it in writing.", next: "mq11_copy_yes" },
        {
          text: "Keep it in the book, where it belongs.",
          next: "mq11_copy_no",
        },
      ],
    },
    mq11_copy_yes: {
      speaker: "Tobias Wren",
      text: "[He copies the entry out in his best clerk's hand, blots it, and then leans his whole weight on the City Clerk's seal until the paper creaks.] \"Issued at the request of the father, who is awake.\" There. That's official. Nobody can say otherwise now.",
      onEnter() {
        takeCopy();
      },
      responses: [{ text: "Thank you, Tobias.", action: () => finishMq11() }],
    },
    mq11_copy_no: {
      speaker: "Tobias Wren",
      text: "As you like. It will be here. That's what the book is for. [He closes it gently.] Go and find her, Mister E. W. And if you do, bring her up the stairs. I'd like to cross out \"asleep.\"",
      responses: [{ text: "I will.", action: () => finishMq11() }],
    },
  });
  // Wren's own tree lives in poi_civic (registered straight with G.dialogue): add the Register beat to it while mq11 needs it.
  function patchWren() {
    if (G.isStub("dialogue") || !G.dialogue.get) return;
    const t = G.dialogue.get("pc_dlg_wren");
    if (!t || !t.nodes || t._ms11) return;
    t._ms11 = true;
    for (const k in WREN.nodes) if (!t.nodes[k]) t.nodes[k] = WREN.nodes[k];
    const s0 = t.start;
    t.start = (actor, A) =>
      at("mq11", "register61")
        ? "mq11_pages"
        : typeof s0 === "function"
          ? s0(actor, A)
          : s0;
  }
  G.events.on("initDone", patchWren);
  L.hook("spawn", function () {
    L.later(0.5, patchWren);
  });

  ms.spot({
    id: "ms_spot_register61",
    label: "The Register (Sixty-One Camp pages)",
    verb: "Ask Wren about",
    when: () => at("mq11", "register61"),
    at: P.wrenDesk,
    use() {
      ms.talk("dlg_ms_wren", "Tobias Wren");
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq11",
      giver: "Tobias Wren, Last Clerk",
      location: "Manhattan Municipal Building, Hall of Records",
      desc: () =>
        Q.isComplete("mq11")
          ? "Tobias Wren's Register: MEAD, ROSE, born 11 November 1967 at dawn on Track 61. Father: E. W. (asleep). Refused penicillin in February 1968; alive after the riot of 5 March 1968. " +
            first() +
            " has a daughter, and she lived. In 1984 a girl of sixteen asked Wren whether her father was in his book."
          : "Since 1967 Tobias Wren, the Last Clerk, has kept a Register of every birth and death he could reach, the Sixty-One Camp under Grand Central included. The Brutes in the Hall of Records are burning it to cook with.",
      stages: [
        ms.proxy("mq11", "pc_records", {
          id: "records",
          text: "Free Tobias Wren and recover his Register from the Brutes in the Hall of Records.",
          next: "register61",
          reach: {
            site: P.hall.site,
            anchors: P.hall.anchors,
            fallback: P.hall.fallback,
            label: "Hall of Records",
            r: 18,
          },
        }),
        {
          id: "register61",
          text: "Read the Register's Sixty-One Camp entries with Tobias Wren at his desk.",
          markers: () =>
            L.alive("pc_mb_wren")
              ? [{ npc: "pc_mb_wren", label: "Tobias Wren" }]
              : markAt(P.wrenDesk, "Wren's Desk")(),
        },
        {
          id: "deed",
          text: "(Optional) Recover the Deed Ledger from the Surrogate's Strongroom.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq11", "records") && !!Q.get("pc_records"),
          doneIf: () => !!L.flag("ms_deed_ledger") || L.has("pc_mb_ledger"),
        },
      ],
      rewards: { xp: 350 },
      onComplete() {
        readPages();
      },
    });
  });
  ms.solver("mq11", {
    records() {
      if (Q.get("pc_records")) {
        if (!Q.isStarted("pc_records")) Q.start("pc_records");
        Q.complete("pc_records");
      } else Q.setStage("mq11", "register61");
    },
    register61() {
      readPages();
      takeCopy();
      finishMq11();
    },
  });

  // ==================================================================
  // mq12 — THE LONG NOON (sq_glow + the Book of the Kindling)
  // ==================================================================
  const BOOK_PARTS = ["match", "eleven", "psalm", "rule"];
  /** A part of the Book was read (terminal entry or Noonday's recitation). part: one of BOOK_PARTS or 'all'. */
  ms.kindlingRead = function (part, src) {
    const parts = part === "all" ? BOOK_PARTS : [part];
    for (const p of parts) {
      if (!L.flag("ms_book_" + p)) {
        L.setFlag("ms_book_" + p, true);
        if (p === "match" && src === "terminal")
          L.later(0.4, () =>
            L.notify(
              "The blackout. November '65. In the dark concourse a clerk broke open a supply locker full of candles, and a girl with a box of matches drew a sun on his box. You were the clerk.",
              { duration: 9 },
            ),
          );
      }
    }
    if (ms.f("book_read")) return;
    if (
      L.flag("ms_book_rule") ||
      BOOK_PARTS.every((p) => L.flag("ms_book_" + p))
    )
      bookDone(src);
  };
  function bookDone(src) {
    if (ms.f("book_read")) return;
    ms.set("book_read", src || true);
    if (!L.has("ms_note_kindling")) L.give("ms_note_kindling", 1);
    L.xp(40, "The Book of the Kindling");
    if (at("mq12", "book")) Q.setStage("mq12", "keeper");
  }
  function completeMq12() {
    if (N().glowMirror) N().glowMirror();
    if (Q.isActive("mq12")) Q.complete("mq12");
  }

  ms.inject("dlg_glow_sister", {
    start: () => (at("mq12", "book") ? "mq12_noonday" : null),
    nodes: {
      mq12_noonday: {
        speaker: "Sister Noonday",
        text: "The Book? Of course. The teletype by the altar will print it for you; the word is LONGNOON, all one word. Or sit with me a minute and I'll say it. I know it by heart. We all do. [She nudges a stool toward you with her foot.]",
        learn: "neon_glow_scripture",
        onEnter() {
          if (G.locks && G.locks.learn) {
            try {
              G.locks.learn("neon_glow_scripture");
            } catch (e) {
              /* */
            }
          }
        },
        responses: [
          { text: "Say it for me.", next: "mq12_n_match" },
          { text: "I'll read it at the altar." },
        ],
      },
      mq12_n_match: {
        speaker: "Sister Noonday",
        text: () =>
          "The Parable of the Match.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.match) || ""),
        onEnter() {
          ms.kindlingRead("match", "noonday");
        },
        responses: [
          {
            text: "[That was the blackout. November '65. You were the clerk with the candles.] ...Go on.",
            next: "mq12_n_eleven",
          },
        ],
      },
      mq12_n_eleven: {
        speaker: "Sister Noonday",
        text: () =>
          "The Parable of the Eleven.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.eleven) || ""),
        onEnter() {
          ms.kindlingRead("eleven", "noonday");
        },
        responses: [{ text: "Go on.", next: "mq12_n_psalm" }],
      },
      mq12_n_psalm: {
        speaker: "Sister Noonday",
        text: () =>
          "The Psalm of the Sleepers. We sing that one.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.psalm) || ""),
        onEnter() {
          ms.kindlingRead("psalm", "noonday");
        },
        responses: [
          {
            text: "[Ninety days of winter. Your own joke, in a stranger's mouth.] Go on.",
            next: "mq12_n_rule",
          },
        ],
      },
      mq12_n_rule: {
        speaker: "Sister Noonday",
        text: () =>
          "And the Rule, which is short, because rules should be.\n\n" +
          ((L.neon && L.neon.BOOK && L.neon.BOOK.rule) || ""),
        onEnter() {
          ms.kindlingRead("rule", "noonday");
        },
        responses: [{ text: "Who wrote all this?", next: "mq12_n_candle" }],
      },
      mq12_n_candle: {
        speaker: "Sister Noonday",
        text:
          "The Dawn. Nobody says her name, not even me; I'm not sure I ever knew it. [She shields her candle jar from a draught that isn't there.] But I'll tell you a thing about her, because you've a face like a man who's been waiting on something. " +
          "Even the Dawn keeps a candle every February. For her sleeper.",
        onEnter() {
          L.setFlag("ms_noonday_candle");
          ms.kindlingRead("all", "noonday");
        },
        responses: [
          {
            text: "[Every February. You were frozen on the twentieth of February.] ...Thank you, Sister.",
          },
        ],
      },
    },
  });
