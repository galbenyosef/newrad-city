// play-inline-299 03 — next
// Lines 357-588 of readable/play-inline-299.pretty.js (statement-aligned).
  PM.dialogue("pm2_dlg_dottie", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PM.flag("dottie_rumour")
            ? "You again. The usual? We don't have a usual. We have gin."
            : "Welcome to the Blue Bar, where the lighting is flattering and the company is not. I'm Dottie. What'll it be — drink, gossip, or both, in that order?",
        responses: [
          {
            text: "[5 scrip] An Algonquin Martini.",
            cond: () => PM.inv.scrip() >= 5,
            action: () => {
              PM.inv.addScrip(-5);
              PM.inv.add("pm2_martini", 1);
            },
            next: "martini",
            repeatable: true,
          },
          {
            text: "On the house, Mr. Case says. (Returned the cat)",
            cond: () => !!PM.flag("alg_cat_home") && !PM.flag("dottie_free"),
            action: () => {
              PM.setFlag("dottie_free", true);
              PM.inv.add("pm2_martini", 2);
            },
            next: "free",
          },
          {
            text: "Heard anything interesting?",
            next: "rumour",
            repeatable: true,
          },
          { text: "Let's trade.", barter: true },
          { text: "Why the Blue Bar?", next: "blue" },
          { text: "Later, Dottie." },
        ],
      },
      martini: {
        text: "One martini. Bathtub gin, a whisper of vermouth, and an olive we have all agreed to believe in. Try not to fall into anything.",
        responses: [{ text: "Cheers." }],
      },
      free: {
        text: "Two, then, on the Case account. [She pours.] You found the cat. You're the most popular person in this hotel, which I realise is a low bar. Ha. Bar.",
        responses: [{ text: "Cheers." }],
      },
      rumour: {
        text: () => {
          const i = (PM.flag("dottie_rumour") || 0) % RUMOURS.length;
          PM.setFlag("dottie_rumour", (PM.flag("dottie_rumour") || 0) + 1);
          return RUMOURS[i];
        },
        responses: [
          { text: "Anything else?", next: "rumour", repeatable: true },
          { text: "Thanks.", next: "root" },
        ],
      },
      blue: {
        text: "The lights. Before the war they were blue on purpose. Now they're blue because the only neon Rex could find was blue. Also, the drawings on the walls — caricatures of the old Round Table crowd. I talk to them when it's quiet. They never interrupt. Unlike some people.",
        responses: [{ text: "Noted.", next: "root" }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Aldous Penrose (painter, burned in '67) — "Everyone's a Critic"
  // -------------------------------------------------------------------
  function giveNocturne(how) {
    PM.inv.remove("pm2_nocturne", 1);
    PM.setFlag("crane_outcome", how);
    if (how === "gift") {
      PM.standing(25, "Returned Penrose's painting");
      PM.inv.add("pm2_crane_sketch", 1);
      PM.inv.addScrip(150);
    } else if (how === "bargain") {
      PM.inv.addScrip(300);
    }
    PM.q.done("pm2_q_critic");
    PM.news(
      "A painting has come home to the Algonquin. Aldous Penrose, painter and Round Table regular, reportedly wept, then complained about the frame.",
    );
  }
  PM.dialogue("pm2_dlg_crane", {
    start: () =>
      PM.inv.count("pm2_nocturne") > 0
        ? "have"
        : PM.q.complete("pm2_q_critic")
          ? "after"
          : "root",
    nodes: {
      root: {
        text: 'Aldous Penrose. Painter. Before the war I was "promising". Now I\'m "well preserved", like a pickle. [He gestures at the old burns down one side of his face.] You\'re staring. Everybody stares. At least stare at the brushwork.',
        responses: [
          {
            text: "I hear you have a painting in the Museum of Modern Art.",
            cond: () => !PM.q.started("pm2_q_critic"),
            next: "painting",
          },
          {
            text: "About your painting...",
            cond: () => PM.q.active("pm2_q_critic"),
            next: "progress",
          },
          { text: "What was the Round Table?", next: "table" },
          { text: "Goodbye, Aldous." },
        ],
      },
      painting: {
        text: '"Nocturne for a Dying City." Oil, 1966. I painted it on the roof of this hotel. The Modern bought it that winter, in January of \'67 — the only time in my life anyone important agreed with me. Six weeks later the city agreed with me too. Rather emphatically.',
        responses: [{ text: "And now?", next: "now" }],
      },
      now: {
        text: 'Now the Modern belongs to Brutes who call themselves critics. Their leader wears a beret. A BERET. I have heard they "review" visitors, and that the reviews are not kind. I would like to see my painting once more before my eyes finish going. Would you bring it to me?',
        responses: [
          {
            text: "I'll get your painting back.",
            action: () => PM.q.start("pm2_q_critic"),
            next: "go",
          },
          {
            text: "[Persuasion 35] What's in it for me?",
            check: { skill: "persuasion", value: 35 },
            next: "pay",
            failNext: "nopay",
          },
          { text: "Not a chance. Brutes." },
        ],
      },
      pay: {
        text: "Honesty! How refreshing. A hundred and fifty scrip — all of it — and a portrait of you, by me, which will one day be worth considerably more than a hundred and fifty scrip. Or nothing. Art is a gamble. So is walking into the Modern.",
        responses: [
          {
            text: "Deal.",
            action: () => PM.q.start("pm2_q_critic"),
            next: "go",
          },
        ],
      },
      nopay: {
        text: "In it for you? The satisfaction of a job well done, the gratitude of an old man with a bar tab, and a mention in my memoirs. The memoirs are one page long. It's a very good page.",
        responses: [
          {
            text: "Fine. I'll do it.",
            action: () => PM.q.start("pm2_q_critic"),
            next: "go",
          },
          { text: "Pass." },
        ],
      },
      go: {
        text: "The museum is on 53rd, between Fifth and Sixth — the white building with the milky glass and the roof full of holes. The curators would have hidden it somewhere safe. Curators always do. Mind the man in the beret.",
        responses: [{ text: "I'll be back." }],
      },
      progress: {
        text: "Any news of my Nocturne? The Modern is on 53rd. If the curators hid it, it'll be in storage — third floor, if memory serves. My memory serves. My knees do not.",
        responses: [{ text: "Working on it." }],
      },
      have: {
        text: "[He stops breathing. For a moment you wonder whether to fetch Cutman Ike.] That's — that's it. Look at the moon. I painted that moon green because I was angry. And now — [He turns the canvas over.] \"GOOD. MAKE CRITIC SAD. 5 STARS.\" [Long silence.] Twenty-two years. My only review. From a Brute. [He laughs until he coughs.] Five stars!",
        responses: [
          {
            text: "It's yours. Welcome home, Nocturne.",
            action: () => giveNocturne("gift"),
            next: "thanks",
          },
          {
            text: "[Barter] A five-star painting is worth more than 150 scrip.",
            check: { skill: "trade", value: 45 },
            action: () => giveNocturne("bargain"),
            next: "bargained",
            failNext: "nobargain",
          },
          { text: "I think I'll hold on to it.", next: "keep" },
        ],
      },
      thanks: {
        text: "Sit. No — stay exactly like that. [He sketches you in charcoal on the back of a menu in four furious minutes.] There. The Stranger, Seated. And the scrip, as promised. Now go away before I get sentimental. It's terrible for the skin.",
        responses: [{ text: "Thank you, Aldous." }],
      },
      bargained: {
        text: "Three hundred! You'd have made a fine gallerist — utterly without shame. Take it. The painting is worth it. Everything else in my life has been worth considerably less.",
        responses: [{ text: "Pleasure doing business." }],
      },
      nobargain: {
        text: "My dear, I am a painter with a bar tab. A hundred and fifty scrip and a portrait. Take it or keep the painting and hang it over your bed so it can stare at you.",
        responses: [
          {
            text: "Fine. It's yours.",
            action: () => giveNocturne("gift"),
            next: "thanks",
          },
          { text: "I'll keep it.", next: "keep" },
        ],
      },
      keep: {
        text: "Then keep it somewhere dry. And when you look at it, think of me, and feel appropriately guilty. [Rex Hadley, at his stall, has noticed the canvas. He is pretending not to.]",
        responses: [{ text: "Goodbye." }],
      },
      after: {
        text: () =>
          PM.flag("crane_outcome") === "sold"
            ? 'Rex tells me my painting went to "a private collector". I know what that means. It means you. It means scrip. [He turns back to his drink.] I hope they were worth it.'
            : "The Nocturne hangs in my room now. I look at it every morning. Some mornings it looks back. Five stars. Ha.",
        responses: [{ text: "Goodbye, Aldous." }],
      },
      table: {
        text: "The original Round Table: writers and critics who lunched here every day in the twenties, trading insults like other people trade recipes. We revived it in '72. Same table, same insults, fewer teeth. Everyone at this table is a writer, a critic, or a liar — the categories overlap considerably.",
        responses: [{ text: "Goodbye." }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Archivist Evangeline Park (ex-Covenant archivist) — "Ink and Ash"
  // -------------------------------------------------------------------
  function giveBible(how) {
    PM.inv.remove("pm2_gutenberg", 1);
    PM.setFlag("park_outcome", how);
    if (how === "gift") {
      PM.standing(35, "Gave the Gutenberg Bible to the Algonquin library");
      PM.inv.addScrip(200);
      PM.inv.add("book_art_of_the_pitch", 1);
      PM.inv.add("book_popular_circuits", 1);
    } else if (how === "more") {
      PM.inv.addScrip(400);
      PM.inv.add("book_popular_circuits", 1);
    }
    PM.q.done("pm2_q_archivist");
    PM.news(
      "Rumour from the Algonquin: a Gutenberg Bible has come up from the Morgan Library's vault — the oldest book in Manhattan now has a library card.",
    );
  }
