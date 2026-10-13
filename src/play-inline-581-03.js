// play-inline-581 03 — end
// Lines 635-965 of readable/play-inline-581.pretty.js (statement-aligned).
  QX.hook("register", function () {
    QX.dialogue("qx_dlg_zora", {
      start: () =>
        QX.flag("zora_prophecy_due")
          ? "prophecy"
          : QX.flag("met_zora")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Madame Zora",
          onEnter: () => QX.setFlag("met_zora"),
          text:
            "[A woman in a dozen scarves, every one a different decade, looks up from a table draped in velvet. In front of her sits a glowing glass globe that is very obviously a car's fuse housing.] " +
            "Ah. I have been expecting you. [A pause.] That is what I say to everyone. It is, however, true of everyone. Madame Zora. Ten Scrip, and the cards will tell you what the day holds.",
          responses: [
            {
              text: "Read my cards. [10 Scrip]",
              cond: () => Z.canRead(),
              next: "reading",
              action: () => {
                if (!Z.read(false)) QX.setFlag("zora_broke");
              },
            },
            { text: "Can you really see the future?", next: "real" },
            { text: "Maybe later.", end: true },
          ],
        },
        again: {
          speaker: "Madame Zora",
          text: () =>
            Z.canRead()
              ? "The stranger returns. The cards have been shuffling themselves all morning. They are impatient. Like me."
              : "You have had your reading for today, child. The cards need to rest. So do I. So, frankly, do you.",
          responses: [
            {
              text: "Read my cards. [10 Scrip]",
              cond: () => Z.canRead(),
              next: "reading",
              action: () => {
                if (!Z.read(false)) QX.setFlag("zora_broke");
              },
            },
            {
              text: "Give me the deep reading. [50 Scrip]",
              cond: () => Z.canRead() && !QX.started(PQ),
              next: "reading",
              action: () => {
                if (!Z.read(true)) QX.setFlag("zora_broke");
              },
            },
            { text: "Can you really see the future?", next: "real" },
            { text: "Goodbye, Zora.", end: true },
          ],
        },
        reading: {
          speaker: "Madame Zora",
          text: () => {
            if (QX.flag("zora_broke")) {
              QX.setFlag("zora_broke", false);
              return "The cards do not read on credit, child. Neither do I.";
            }
            return (
              "[She fans the deck, and turns one card with a long, lacquered nail.] " +
              Z.cardText()
            );
          },
          responses: [
            {
              text: "Anything else?",
              cond: () => !!QX.flag("zora_prophecy_due"),
              next: "prophecy",
            },
            { text: "Thank you, Zora.", end: true },
          ],
        },
        prophecy: {
          speaker: "Madame Zora",
          onEnter: () => Z.prophecy(),
          text:
            "[Her eyes go glassy. The fuse-globe flickers — possibly on its own, possibly because her knee is on the cable.] \"Beneath the stone arch, where the kings sit and never move, count nine stones from the old men's tables. " +
            "What the stranger finds there was left for a stranger.\" [She blinks.] ...Did I say something? I do that. Don't tell anyone. It's bad for business when it comes true.",
          responses: [
            { text: "Where the kings sit and never move...", end: true },
          ],
        },
        real: {
          speaker: "Madame Zora",
          text:
            "Child, I can see that you walk like a man who slept a long time in a cold box, stand like a soldier and smell like a shellback. From that, I can tell you a great deal about tomorrow. " +
            "The cards help. The cards are mostly a way of keeping people still while I look at them.",
          responses: [
            {
              id: "zora_wits",
              text: "So it's a cold reading. Observation and suggestion.",
              check: { attr: "wits", value: 7 },
              next: "cold",
              failNext: "cold_fail",
            },
            { text: "Fair enough.", next: "again" },
          ],
        },
        cold: {
          speaker: "Madame Zora",
          text: "[She laughs, delighted.] Ha! Clever. Yes. Mostly. [She leans in.] And every now and then, child, something comes through that I did not put there. Those, I don't charge for.",
          responses: [{ text: "Every now and then?", next: "again" }],
        },
        cold_fail: {
          speaker: "Madame Zora",
          text: "Hush. The cards are listening. They are very sensitive about their methods.",
          responses: [{ text: "...Sorry, cards.", next: "again" }],
        },
      },
    });

    const lost = () => Number(QX.flag("monte_lost")) || 0;
    QX.dialogue("qx_dlg_lou", {
      start: () =>
        QX.flag("lou_caught") && !QX.flag("lou_settled")
          ? "caught"
          : QX.flag("met_lou")
            ? "again"
            : "hello",
      nodes: {
        hello: {
          speaker: "Fingers Fiorello",
          onEnter: () => QX.setFlag("met_lou"),
          text:
            "[A thin man in a pinstripe suit with more patches than stripes flips three cards across a folding table so fast they blur.] Step right up, step right up! Fingers Fiorello's, the only honest game on Thirty-Fourth Street! " +
            "Find the lady, double your Scrip. Lose the lady, well — [he spreads his hands] — she was never really yours.",
          responses: [
            {
              text: "I'll play. [10 Scrip]",
              next: null,
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            {
              text: "I'll play. [25 Scrip]",
              next: null,
              end: true,
              action: () => Lou.play(25),
              cond: () => QX.scrip() >= 25,
            },
            {
              text: "Big money. [50 Scrip]",
              next: null,
              end: true,
              action: () => Lou.play(50),
              cond: () => QX.scrip() >= 50,
            },
            { text: '"The only honest game"?', next: "honest" },
            { text: "Not today.", end: true },
          ],
        },
        again: {
          speaker: "Fingers Fiorello",
          text: () =>
            QX.flag("lou_honest")
              ? "My friend! My honest friend! The game is clean, I swear on my mother. My real mother. Play?"
              : "Back for more? The lady missed you. She told me.",
          responses: [
            {
              text: "Deal me in. [10 Scrip]",
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            {
              text: "Deal me in. [25 Scrip]",
              end: true,
              action: () => Lou.play(25),
              cond: () => QX.scrip() >= 25,
            },
            {
              text: "Big money. [50 Scrip]",
              end: true,
              action: () => Lou.play(50),
              cond: () => QX.scrip() >= 50,
            },
            { text: "Not today, Fingers.", end: true },
          ],
        },
        honest: {
          speaker: "Fingers Fiorello",
          text: "Honest as the day is long! Ask anybody. Ask Mort, from the hot dogs. Actually don't ask Mort. Mort and I have a history. Play a round, you'll see.",
          responses: [
            {
              id: "lou_senses",
              text: "Your left cuff is two inches too wide.",
              check: { attr: "senses", value: 7 },
              next: "cuff",
              failNext: "cuff_fail",
              cond: () => !QX.flag("lou_caught"),
            },
            {
              text: "Deal me in. [10 Scrip]",
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            { text: "Maybe later.", end: true },
          ],
        },
        cuff: {
          speaker: "Fingers Fiorello",
          onEnter: () => QX.setFlag("lou_caught"),
          text: "[His hands freeze mid-shuffle. He looks at his cuff. He looks at you. The queen of hearts slides out of his sleeve and lands face-up on the table.] ...Would you believe that's where she lives?",
          responses: [{ text: "No.", next: "caught" }],
        },
        cuff_fail: {
          speaker: "Fingers Fiorello",
          text: "My cuff? Tailored! Old-world! You got an eye for fashion, friend. Now — got an eye for the lady?",
          responses: [
            {
              text: "Deal me in. [10 Scrip]",
              end: true,
              action: () => Lou.play(10),
              cond: () => QX.scrip() >= 10,
            },
            { text: "Later.", end: true },
          ],
        },
        caught: {
          speaker: "Fingers Fiorello",
          text: () =>
            "[Fingers glances left and right, then leans across the table, all teeth.] Okay. Okay! Keep your voice down. " +
            (lost() ? "You're down " + lost() + " Scrip — " : "") +
            "Let's be reasonable people about this. Reasonable, quiet people.",
          responses: [
            {
              text: "Give me back what I lost.",
              cond: () => lost() > 0,
              next: "refund",
              action: () => {
                QX.giveScrip(lost());
                QX.setFlag("monte_lost", 0);
                QX.setFlag("lou_settled");
                QX.setFlag("lou_honest");
              },
            },
            {
              id: "lou_persuade",
              text: "Everyone on this street is going to hear about your sleeve. Unless you make it worth my while.",
              check: { skill: "persuasion", value: 45 },
              next: "hush",
              failNext: "hush_fail",
            },
            {
              text: "From now on you play it straight. With everybody.",
              next: "straight",
              action: () => {
                QX.setFlag("lou_honest");
                QX.setFlag("lou_settled");
                QX.giveScrip(lost());
                QX.setFlag("monte_lost", 0);
                QX.standing(20, "Made Fingers Fiorello play it straight");
              },
            },
            {
              text: "[Attack] Cheats get what's coming.",
              end: true,
              action: () => {
                QX.setFlag("lou_settled");
                const a = QX.npc("qx_lou");
                if (a && a.setHostile) a.setHostile(true);
              },
            },
          ],
        },
        refund: {
          speaker: "Fingers Fiorello",
          text: "There. Every note. Counted twice. [He mops his brow.] No hard feelings. The game's clean now. For you. For you, I'm a church.",
          responses: [{ text: "Good.", end: true }],
        },
        hush: {
          speaker: "Fingers Fiorello",
          onEnter: () => {
            QX.setFlag("lou_settled");
            QX.giveScrip(lost() + 75);
            QX.setFlag("monte_lost", 0);
            QX.standing(-10);
            if (QX.itemExists("qx_marked_deck")) QX.give("qx_marked_deck", 1);
          },
          text: "[He counts out Scrip with the speed of long practice.] Your losses. Plus seventy-five for your trouble. Plus — [he slides over a worn deck] — a little something for your own games. Marked. Every card. You didn't get it from me.",
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        hush_fail: {
          speaker: "Fingers Fiorello",
          onEnter: () => {
            QX.setFlag("lou_settled");
            QX.giveScrip(lost());
            QX.setFlag("monte_lost", 0);
          },
          text: "Hey, hey — don't push it, friend. You get your Scrip back. That's the deal. Everybody walks away. Walk away.",
          responses: [{ text: "Fine.", end: true }],
        },
        straight: {
          speaker: "Fingers Fiorello",
          text: "[He looks physically pained.] Straight. With EVERYBODY? ...Fine. FINE. Here's your Scrip. You know what an honest monte game is? It's a card trick nobody pays for. [He sighs.] Straight.",
          responses: [{ text: "You'll live.", end: true }],
        },
      },
    });
  });

  // Extra items for this file (defined in the items phase)
  QX.hook("items", function () {
    QX.defineItem({
      id: "qx_lucky_horseshoe",
      name: "Lucky Horseshoe",
      type: "misc",
      weight: 0.5,
      value: 60,
      mesh: "lighter",
      tags: ["junk"],
      desc: 'An ox shoe, bent from a single stride, with "LUCK" scratched into it. It is heavier than luck ought to be.',
    });
    QX.defineItem({
      id: "qx_marked_deck",
      name: "Fingers' Marked Deck",
      type: "misc",
      weight: 0.1,
      value: 40,
      mesh: "paper",
      tags: ["junk"],
      skills: { trade: 5 },
      desc: "Fifty-two old-world playing cards with pinprick marks in the corners. Hold it and you feel slightly more persuasive, and slightly less trustworthy.",
    });
  });
