// play-inline-299 04 — responses
// Lines 589-900 of readable/play-inline-299.pretty.js (statement-aligned).
  PM.dialogue("pm2_dlg_park", {
    start: () =>
      PM.inv.count("pm2_gutenberg") > 0
        ? "have"
        : PM.q.complete("pm2_q_archivist")
          ? "after"
          : "root",
    nodes: {
      root: {
        text: "Archivist Evangeline Park. Formerly of the Iron Covenant, Records division. I left because they wanted me to copy tank manuals for the rest of my life. I wanted to copy something that mattered. [She taps a stack of salvaged books.] This is the Algonquin library. It is small. I intend to fix that.",
        responses: [
          {
            text: "What are you looking for?",
            cond: () => !PM.q.started("pm2_q_archivist"),
            next: "want",
          },
          {
            text: "About the Morgan Library...",
            cond: () => PM.q.active("pm2_q_archivist"),
            next: "progress",
          },
          { text: "Why did you really leave the Covenant?", next: "why" },
          { text: "Goodbye, Archivist." },
        ],
      },
      want: {
        text: "The Morgan Library, on 36th Street. J. P. Morgan bought three Gutenberg Bibles — the first books ever printed with movable type. Before the war, the director moved them into a rare-book vault under the building. The building is now a Maniac nest. The vault, as far as I know, is intact.",
        responses: [{ text: "You want me to bring you a Bible.", next: "ask" }],
      },
      ask: {
        text: "I want you to bring the world a Bible. I will copy it, page by page, and send copies to every settlement that can read. The Covenant hoards knowledge in its Hold. I would rather it walked around. Will you go?",
        responses: [
          {
            text: "I'll get it.",
            action: () => PM.q.start("pm2_q_archivist"),
            next: "how",
          },
          {
            text: "[Wits 7] Movable type, 1455. Mainz. You don't need all three, just one intact volume.",
            check: { attr: "wits", value: 7 },
            action: () => PM.q.start("pm2_q_archivist"),
            next: "smart",
            failNext: "how",
          },
          { text: "Maniacs? No thanks." },
        ],
      },
      smart: {
        text: "[She actually smiles.] Finally, someone who reads. Yes — one volume, whichever survived. Take this, for the stacks. [She hands you a bottle of Prussian Blue.] The water glows down there, I'm told. The reading lamps do not.",
        onEnter() {
          if (!PM.flag("park_purge")) {
            PM.setFlag("park_purge", true);
            PM.inv.add("prussian_blue", 1);
          }
        },
        responses: [{ text: "I'll be careful.", next: "how" }],
      },
      how: {
        learn: "pm2_term_morgan",
        text: "The director — Belle da Costa Greene's successors kept the tradition — would have kept the vault combination close. Her teletype word was always BELLE; every reader in the building knew it. Her office was the North Room, off the rotunda. Morgan's own vault is in his study, the red room. The stacks are below. Bring a light. Bring a gun. Bring the Bible.",
        responses: [{ text: "On my way." }],
      },
      progress: {
        text: "The Morgan is on 36th, between Madison and Park — a marble box with no windows and two stone lionesses. The vault combination should be in the director's office. If you find anything else worth reading, I am always buying.",
        responses: [{ text: "I'll keep looking." }],
      },
      have: {
        text: "[She takes the book with both hands, the way people used to hold newborns.] Vol. I. The paper is sound. The binding is — hot. Radiologically. I'll wear gloves. [She turns a page and does not speak for some time.] Do you know what this is? It's the first time anyone made a thousand copies of the same thought.",
        responses: [
          {
            text: "It belongs here. Make your copies.",
            action: () => giveBible("gift"),
            next: "thanks",
          },
          {
            text: "[Persuasion 55] Rex Hadley would pay a fortune for this. Match it.",
            check: { skill: "persuasion", value: 55 },
            action: () => giveBible("more"),
            next: "matched",
            failNext: "nomatch",
          },
          { text: "I'm keeping it.", next: "keep" },
        ],
      },
      thanks: {
        text: "Two hundred scrip, and two books from my own shelf — the two I'd save from a fire. Everybody at this table owes you now. We pay our debts in words, mostly, but I'll see what I can do about the scrip.",
        responses: [{ text: "Happy copying, Archivist." }],
      },
      matched: {
        text: "Four hundred. It is everything the library has. [She counts it out with an archivist's precision and a mercenary's resentment.] Worth it. Get out of my scriptorium.",
        responses: [{ text: "Pleasure." }],
      },
      nomatch: {
        text: "Rex would pay you in counterfeit scrip and sell it to the Covenant by morning. Two hundred, two books, and my gratitude, which does not come cheap.",
        responses: [
          {
            text: "Fine. It's yours.",
            action: () => giveBible("gift"),
            next: "thanks",
          },
          { text: "I'll keep it.", next: "keep" },
        ],
      },
      keep: {
        text: "Then it's a book in a bag. It could be a thousand books in a thousand hands. Think about it.",
        responses: [{ text: "Goodbye." }],
      },
      after: {
        text: () =>
          PM.flag("park_outcome") === "sold"
            ? "Rex sold a Bible to the Covenant last week. I recognised the burn mark on the spine. [She does not look up.] I hope the scrip keep you warm."
            : "Page two hundred and six. My hand cramps, the candles run out, and the Maniacs in the Morgan are welcome to the rest of the building. We have the book.",
        responses: [{ text: "Goodbye, Archivist." }],
      },
      why: {
        text: "They said knowledge was a weapon and had to be kept from the Ruins. I said a weapon nobody can pick up is a paperweight. They said that was insubordination. I said it was a metaphor. They said metaphors were insubordination. So here I am.",
        responses: [{ text: "Goodbye." }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Doc Benchley (doctor), Rex Hadley (merchant, fence), Woolcott (guard)
  // -------------------------------------------------------------------
  PM.dialogue("pm2_dlg_benchley", {
    start: "root",
    nodes: {
      root: {
        text: 'Robert Benchley, M.D. — the M.D. stands for "Mostly Diagnoses". Room 201, the only room in this hotel that has been properly cleaned since 1967. What ails you? Besides the obvious.',
        responses: [
          {
            text: "[30 scrip] Patch me up.",
            cond: () => PM.inv.scrip() >= 30,
            action: () => {
              PM.inv.addScrip(-30);
              try {
                G.player.heal(999);
              } catch (e) {
                /* core */
              }
              PM.sfx("inject");
            },
            next: "healed",
          },
          {
            text: "[50 scrip] Flush out the radiation.",
            cond: () => PM.inv.scrip() >= 50 && G.player && G.player.rads > 0,
            action: () => {
              PM.inv.addScrip(-50);
              try {
                if (PM.live("rpg") && G.rpg.removeRads) G.rpg.removeRads(9999);
                else G.player.addRads(-G.player.rads);
              } catch (e) {
                /* core */
              }
              PM.sfx("iodine_tabs");
            },
            next: "flushed",
          },
          { text: "What do you have for sale?", barter: true },
          { text: "Goodbye, Doc." },
        ],
      },
      healed: {
        text: "There. Stitched, jetted and sterilised, in order of importance. Try not to get shot again. Or do; I need the scrip.",
        responses: [{ text: "Thanks, Doc." }],
      },
      flushed: {
        text: "Prussian Blue, a glass of water and a stern lecture. The lecture is free. You may notice some... bathroom urgency. That is the radiation leaving. Wave goodbye.",
        responses: [{ text: "Thanks, Doc." }],
      },
    },
  });
  PM.dialogue("pm2_dlg_rex", {
    start: "root",
    nodes: {
      root: {
        text: "Rex Hadley. Books, bullets, batteries, and the occasional work of art, no questions asked, no answers given. Browse. Touch everything. Break it and it's yours at full price.",
        responses: [
          { text: "Let's trade.", barter: true },
          {
            text: 'I have a painting. A Penrose. "Nocturne for a Dying City".',
            cond: () =>
              PM.inv.count("pm2_nocturne") > 0 && PM.q.active("pm2_q_critic"),
            next: "painting",
          },
          {
            text: "I have a Gutenberg Bible.",
            cond: () =>
              PM.inv.count("pm2_gutenberg") > 0 &&
              PM.q.active("pm2_q_archivist"),
            next: "bible",
          },
          { text: "Goodbye, Rex." },
        ],
      },
      painting: {
        text: "[His eyes do a thing.] A Penrose, with a provenance, and a Brute review on the back? I have a buyer uptown who collects \"survivor art\". Five hundred scrip. Aldous never has to know. Aldous also never has to see it again. That's the part you'll have to live with.",
        responses: [
          {
            text: "Sold. [Sell the painting for 500 scrip]",
            action: () => {
              PM.inv.remove("pm2_nocturne", 1);
              PM.inv.addScrip(500);
              PM.setFlag("crane_outcome", "sold");
              PM.standing(-25, "Sold Penrose's painting");
              PM.q.done("pm2_q_critic");
            },
            next: "sold",
          },
          { text: "No. It goes back to Penrose." },
        ],
      },
      bible: {
        text: "A Gutenberg. An actual — [He lowers his voice.] The Covenant pays in scrip for anything old-world and holy, and they pay very well for anything old-world and holy and FIRST. Seven hundred scrip. Park gets over it. Park always gets over it.",
        responses: [
          {
            text: "Sold. [Sell the Bible for 700 scrip]",
            action: () => {
              PM.inv.remove("pm2_gutenberg", 1);
              PM.inv.addScrip(700);
              PM.setFlag("park_outcome", "sold");
              PM.standing(-35, "Sold the Gutenberg Bible to a fence");
              PM.q.done("pm2_q_archivist");
            },
            next: "sold",
          },
          { text: "No. It stays in the Algonquin library." },
        ],
      },
      sold: {
        text: "Pleasure doing business. [He wraps it in oilcloth with the tenderness of a man who has already spent the money.] If anyone asks, you never saw me, and I have never been seen.",
        responses: [{ text: "Goodbye." }],
      },
    },
  });
  PM.dialogue("pm2_dlg_woolcott", {
    start: "root",
    nodes: {
      root: {
        text: () =>
          PM.flag("woolcott_talked")
            ? "Still here. Still watching. Still armed."
            : "Sergeant Woolcott, Round Table security. Guns stay holstered past the sandbags, voices stay down past the lobby, and nobody — nobody — insults the poetry. You look literate enough. Go on in.",
        onEnter() {
          PM.setFlag("woolcott_talked", true);
        },
        responses: [
          { text: "Any trouble lately?", next: "trouble" },
          { text: "Thanks, Sergeant." },
        ],
      },
      trouble: {
        text: 'Brutes from the Modern come by some nights, sniffing. One of them left a note on the door that said "HOTEL: 2 STARS". Penrose took it personally. Maniacs from the Morgan don\'t come out much. Must be good reading down there.',
        responses: [{ text: "Thanks." }],
      },
    },
  });

  // -------------------------------------------------------------------
  // Quests
  // -------------------------------------------------------------------
  const ALG = () => {
    const a = PM.anchorOf("algonquin", "exterior_entrance");
    return a || { x: -79, z: -145 };
  };
  PM.quest({
    id: "pm2_q_cat",
    name: "Nine Lives",
    giver: "Francis Case IV",
    location: "The Algonquin Hotel",
    desc: "The Algonquin's cat, Matilda, has gone missing. Francis Case IV, the hotel's manager, would very much like her back.",
    stages: [
      {
        id: "find",
        text: "Find Matilda in Room 207 on the Algonquin's second floor.",
        markers: () => {
          const a = AN("cat_hide");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Room 207",
                  interior: "algonquin",
                },
              ]
            : [];
        },
      },
      {
        id: "return",
        text: "Return Matilda to Francis Case IV at the front desk.",
        markers: () => {
          const a = AN("manager");
          return a
            ? [
                {
                  x: a.x,
                  z: a.z,
                  y: a.y,
                  label: "Francis Case IV",
                  interior: "algonquin",
                },
              ]
            : [];
        },
      },
    ],
    rewards: { xp: 100, scrip: 50, items: [["pm2_alg_pass", 1]], standing: 5 },
  });
