// play-inline-161 05 — responses
// Lines 794-1585 of readable/play-inline-161.pretty.js (statement-aligned).
  function defineDialogue() {
    if (G.isStub("dialogue") || typeof G.dialogue.register !== "function")
      return;
    const R = (id, tree) =>
      P.safe("dlg:" + id, () => G.dialogue.register(id, tree));
    const gatherLeft = () =>
      [
        !(F.scoreGiven || has("pu_score")),
        !(F.powerGiven || has("pu_planetarium_cell") || has("dry_cell", 3)),
        !F.patron,
      ].filter(Boolean).length;
    // ---------------- Maestro Bell ----------------
    R("dlg_pu_bell", {
      start: () =>
        qDone("pu_encore")
          ? "after"
          : qStage("pu_encore") === "deliver"
            ? "deliver"
            : qStage("pu_encore") === "dynamo"
              ? "dynamo"
              : qStage("pu_encore") === "concert"
                ? "concert"
                : qActive("pu_encore")
                  ? "progress"
                  : "first",
      nodes: {
        first: {
          speaker: "Maestro Bell",
          text: "Ah — a listener! No, don't tell me: you've come for the music. Everybody comes for the music eventually. I am Ignatius Bell, conductor of the Carnegie Consort, and you are standing in the finest acoustic space left on this ruined planet.",
          responses: [
            { text: "The Carnegie Consort?", next: "consort" },
            {
              text: "Why is a conductor living in a burned-out concert hall?",
              next: "why",
            },
            { text: "Just passing through.", end: true },
          ],
        },
        consort: {
          speaker: "Maestro Bell",
          text: "Nine musicians, one stagehand robot, and a piano player who has been practising the same Chopin étude since the Johnson administration. We play every night. To the rats, mostly. But we are planning something... larger.",
          responses: [{ text: "Larger how?", next: "plan" }],
        },
        why: {
          speaker: "Maestro Bell",
          text: "Because on the fifth of March, 1967, the New York Philharmonic refused to leave this building, on the grounds that the acoustics were better than the subway. They were right. Three of them are still in my orchestra. Their children are the rest.",
          responses: [{ text: "So what are you planning?", next: "plan" }],
        },
        plan: {
          speaker: "Maestro Bell",
          text: 'A premiere! Julius Hollis\'s Symphony No. 1 — "Lullaby for Ada" — scheduled for November 1967 and cancelled on account of the end of the world. Twenty-two years late. I intend to be on time for once. But I need three things, and I cannot fetch them with a baton.',
          responses: [
            { text: "What do you need?", next: "needs" },
            { text: "Not my problem.", end: true },
          ],
        },
        needs: {
          speaker: "Maestro Bell",
          text: "One: the score. Hollis lived at the Dakota, and the Dakota is... haunted, frankly. Two: power. Stage dynamo number two wants a real cell — I'm told the old Hayden Planetarium ran its projector on an Army one. Three: an audience with standing. The Plaza Society. Rich, idle, and desperate to be seen at something. Win them over and the whole uptown will come.",
          responses: [
            {
              text: "I'll do it. Where do I start?",
              next: "accept",
              action: () => {
                qStart("pu_encore", "gather");
              },
            },
            {
              text: "[Trade 40] What's in it for me?",
              check: { skill: "trade", value: 40 },
              next: "pay",
              failNext: "payFail",
            },
            { text: "Maybe later.", end: true },
          ],
        },
        pay: {
          speaker: "Maestro Bell",
          text: "A businessman! Splendid, Carnegie would approve. Two hundred and fifty scrip from the house, a seat in my own box, and my second-best tailcoat. The first-best I am buried in, eventually.",
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => {
                qStart("pu_encore", "gather");
              },
            },
          ],
        },
        payFail: {
          speaker: "Maestro Bell",
          text: "What's in it for you? Art! Culture! The applause of a grateful civilisation! ...Also some scrip. We'll discuss it after.",
          responses: [
            {
              text: "Fine. I'll help.",
              next: "accept",
              action: () => {
                qStart("pu_encore", "gather");
              },
            },
          ],
        },
        accept: {
          speaker: "Maestro Bell",
          text: "Bravo! Score from the Dakota — the Hollis apartment, third floor. Power from the planetarium in the Museum of Natural History, west of the park. Patronage from Lady Constance at the Plaza, who will pretend not to know who I am. Allegro, my friend. Allegro!",
          responses: [{ text: "On my way.", end: true }],
        },
        progress: {
          speaker: "Maestro Bell",
          text: () =>
            gatherLeft() === 0
              ? "You have everything? Then what are we standing here for?"
              : "Still " +
                gatherLeft() +
                " movement" +
                (gatherLeft() > 1 ? "s" : "") +
                " left to this symphony. The score from the Dakota, a cell for the dynamo, and Lady Constance's blessing. I shall rehearse in the meantime. Loudly.",
          responses: [
            {
              text: "I have everything.",
              cond: () => gatherLeft() === 0,
              next: "deliver",
              action: () => qSet("pu_encore", "deliver"),
            },
            { text: "Remind me about the Dakota.", next: "rDakota" },
            { text: "Remind me about the power.", next: "rPower" },
            { text: "Remind me about the Plaza.", next: "rPlaza" },
            { text: "I'll get back to it.", end: true },
          ],
        },
        rDakota: {
          speaker: "Maestro Bell",
          text: "The Dakota, on Central Park West. Hollis's apartment was sealed during the panic — his wife and daughter inside. People say you can still hear a lullaby up there. People say a lot of things. Take a gun AND a hymn book.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        rPower: {
          speaker: "Maestro Bell",
          text: "The Hayden Planetarium, inside the museum across the park. Its star projector ran on a military cell. Mind you — take it, and the stars go out for good. Or three fission batteries, if you enjoy explosions near the woodwinds.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        rPlaza: {
          speaker: "Maestro Bell",
          text: "Lady Constance Vane-Worthington holds court in the Palm Court every afternoon, which is all afternoons. She collects two things: gossip and jewellery. Tiffany's is down the avenue, full of raiders and, allegedly, a very large diamond.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        deliver: {
          speaker: "Maestro Bell",
          text: "Let me see... The score! Hollis's own hand — look at these dynamics, \"ppp — as if the whole city is asleep.\" And the Plaza will come? Marvellous. Now: the power cell goes into Dynamo Number Two, backstage. I'd do it myself but last time I touched it I heard colours.",
          onEnter: () => {
            if (take("pu_score")) F.scoreGiven = true;
          },
          responses: [
            {
              text: "I'll install it.",
              end: true,
              action: () => qSet("pu_encore", "dynamo"),
            },
          ],
        },
        dynamo: {
          speaker: "Maestro Bell",
          text: "Backstage, through the green room, past Rudy's laundry. Dynamo Number Two. Put the cell in, pull the big lever, try not to die before the overture.",
          responses: [{ text: "On it.", end: true }],
        },
        concert: {
          speaker: "Maestro Bell",
          text: "The lights! The ORGAN! Take a seat in the house — anywhere in the parquet — and we shall begin. Phones off. Well. You know what I mean.",
          responses: [{ text: "Break a leg, Maestro.", end: true }],
        },
        after: {
          speaker: "Maestro Bell",
          text: [
            "Did you hear them? Did you hear the Plaza lot BOOING the Society's own cellist for tuning? Culture is back, my friend.",
            "We play every night now. Bring anyone. Leave the guns in the lobby.",
            "Twenty-two years late and they STILL clapped between movements. Perfection.",
          ],
          responses: [{ text: "Good night, Maestro.", end: true }],
        },
      },
    });
    // ---------------- Lady Constance ----------------
    R("dlg_pu_constance", {
      start: () =>
        F.patron ? "patron" : qActive("pu_encore") ? "encore" : "first",
      nodes: {
        first: {
          speaker: "Lady Constance",
          text: "Oh. A guest. How... rustic. You may address me as Lady Constance, or not at all. We are the Plaza Society, and we are maintaining standards while the rest of the city eats rats off a stick.",
          responses: [
            { text: "What is the Plaza Society?", next: "society" },
            { text: "Standards?", next: "standards" },
            { text: "Nice hat.", next: "hat", standing: 0 },
            { text: "Goodbye.", end: true },
          ],
        },
        society: {
          speaker: "Lady Constance",
          text: 'The last civilised people in New York. We dine at eight, we dress for dinner, and we refer to the War as "the Unpleasantness". Membership is by invitation, and I do not invite.',
          responses: [{ text: "Charming.", next: "first" }],
        },
        standards: {
          speaker: "Lady Constance",
          text: "Tablecloths. Silverware, laid correctly. No firearms at luncheon. No guests who are not old money. And NO talk of radiation — it's simply not done.",
          responses: [{ text: "I see.", next: "first" }],
        },
        hat: {
          speaker: "Lady Constance",
          text: "It is a Schiaparelli, it is older than your entire family tree, and it is none of your concern. ...Thank you.",
          responses: [{ text: "Right.", next: "first" }],
        },
        encore: {
          speaker: "Lady Constance",
          text: "Bell sent you, didn't he? That dreadful man wants the Society to sit in a draughty ruin and listen to a lullaby. Absurd. We are the Plaza. We do not attend. We are ATTENDED.",
          responses: [
            {
              text: "[Persuasion 60] Everyone who is anyone will be there. If you're not, it's because you weren't invited.",
              check: { skill: "persuasion", value: 60 },
              next: "speechWin",
              failNext: "speechFail",
            },
            {
              text: "Would the Atlas Diamond from Tiffany's change your mind?",
              next: "diamondAsk",
            },
            {
              text: "I have the Atlas Diamond.",
              cond: () => has("pu_atlas_diamond"),
              next: "diamond",
            },
            {
              text: "What if I bought you a subscription? 400 scrip.",
              next: "buy",
            },
            { text: "Forget it.", end: true },
          ],
        },
        speechWin: {
          speaker: "Lady Constance",
          text: "...Not INVITED? The Vane-Worthingtons have not been uninvited from anything since the Titanic. Very well. The Society will attend. In the front row. And we shall arrive LATE, so that everyone sees us.",
          onEnter: () => {
            C.setPatron("speech");
          },
          responses: [{ text: "Wonderful.", end: true }],
        },
        speechFail: {
          speaker: "Lady Constance",
          text: "Please. I have been flattered by congressmen, by a Rockefeller and by a robot butler with a malfunction. You are not in their league, dear.",
          responses: [{ text: "Worth a try.", next: "encore" }],
        },
        diamondAsk: {
          speaker: "Lady Constance",
          text: "The ATLAS? Ninety facets, canary yellow, lost in the Unpleasantness with the rest of Fifth Avenue? I tried it on myself, in February of 1967, and was refused by a clerk. If you brought me that stone, I would attend a concert in a SEWER.",
          responses: [
            {
              text: "I'll see what I can do.",
              end: true,
              action: () => qStart("pu_heist", "in"),
            },
          ],
        },
        diamond: {
          speaker: "Lady Constance",
          text: "Oh. Oh my. Oh my GOODNESS. [she holds it up to the stained-glass light and forgets to be rude for nearly four seconds] ...It's real. The Society will attend. The Society will adore it. And you — you shall have three hundred scrip, and a standing invitation to dinner. At eight.",
          onEnter: () => {
            if (take("pu_atlas_diamond")) {
              give("scrip", 300);
              C.setPatron("diamond");
              standing(5, "Returned the Atlas Diamond to high society");
            }
          },
          responses: [{ text: "A pleasure, Your Ladyship.", end: true }],
        },
        buy: {
          speaker: "Lady Constance",
          text: 'Money? How vulgar. How absolutely... four hundred, you said? Very well. The Society will "subscribe". Nobody is to know.',
          responses: [
            {
              text: "[Pay 400 scrip]",
              cond: () => scrip() >= 400,
              action: () => {
                if (pay(400)) C.setPatron("scrip");
              },
              next: "bought",
            },
            { text: "On second thought...", next: "encore" },
          ],
        },
        bought: {
          speaker: "Lady Constance",
          text: "Charmed, I'm sure. Do tell Bell we expect the good chairs.",
          responses: [{ text: "I will.", end: true }],
        },
        patron: {
          speaker: "Lady Constance",
          text: [
            "We shall attend. I have had my good gloves aired out. It took four days and a Rally Tonic.",
            "Dinner is at eight. You may come. Do wash.",
            "The Society thanks you for your service to culture. Now go away, I'm being seen.",
          ],
          responses: [
            {
              text: "I have the Atlas Diamond. The Society might like it back.",
              cond: () =>
                has("pu_atlas_diamond") && qStage("pu_heist") === "fence",
              next: "diamond2",
            },
            { text: "Goodbye, Lady Constance.", end: true },
          ],
        },
        // round 1b (quest walk): once the Society was won over by persuasion or scrip, the diamond could no longer be fenced here and
        // "The Great Tiffany Heist" stayed open forever at its optional last stage.
        diamond2: {
          speaker: "Lady Constance",
          text: "The ATLAS. You darling, criminal thing. [she pockets it before anyone can see] Three hundred scrip, and we never speak of where it came from.",
          onEnter: () => {
            if (take("pu_atlas_diamond")) {
              give("scrip", 300);
              standing(5, "Returned the Atlas Diamond to high society");
              if (qStage("pu_heist") === "fence") qComplete("pu_heist");
            }
          },
          responses: [{ text: "Never.", end: true }],
        },
      },
    });
    // ---------------- Pemberton (rooms) ----------------
    R("dlg_pu_pemberton", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Pemberton",
          text: () =>
            F.rented
              ? "Welcome back. Suite 610 is as you left it: charming, historic, and only slightly radioactive."
              : "Good evening, and welcome to The Plaza. Checking in? We have one suite available — the others are occupied by the Society, or by what's left of their previous occupants.",
          responses: [
            {
              text: "I'd like a room. [40 scrip]",
              cond: () => !F.rented,
              next: "rent",
            },
            {
              text: "[Persuasion 45] I'm a personal guest of Lady Constance.",
              cond: () => !F.rented,
              check: { skill: "persuasion", value: 45 },
              next: "free",
              failNext: "freeFail",
            },
            { text: "Tell me about the hotel.", next: "hotel" },
            {
              text: "What's behind the Presidential Suite door?",
              next: "pres",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        rent: {
          speaker: "Pemberton",
          text: "Forty scrip the night, and the night is as long as you like. Suite 610, up the grand staircase and to the right. Linens changed every century.",
          responses: [
            {
              text: "[Pay 40 scrip]",
              cond: () => scrip() >= 40,
              action: () => {
                if (pay(40)) C.rent();
              },
              next: "rented",
            },
            { text: "Too rich for me.", next: "hello" },
          ],
        },
        free: {
          speaker: "Pemberton",
          text: "...Of course. Forgive me. Any friend of Her Ladyship is a friend of the house. Suite 610, compliments of the Society. Please don't tell her I asked.",
          onEnter: () => C.rent(),
          responses: [{ text: "Thank you, Pemberton.", end: true }],
        },
        freeFail: {
          speaker: "Pemberton",
          text: "Her Ladyship has no personal guests. She has personal SERVANTS, and those are not guests. Forty scrip, please.",
          responses: [{ text: "Fine.", next: "hello" }],
        },
        rented: {
          speaker: "Pemberton",
          text: "Your key. The bed in 610 is yours whenever you need it. Sleep well — and if you hear a string quartet at three in the morning, no, you didn't.",
          responses: [{ text: "Thanks.", end: true }],
        },
        hotel: {
          speaker: "Pemberton",
          text: "Built 1907. Survived the Depression, two world wars and the end of the world. The Palm Court still serves tea. The Oak Bar still serves Ferdinand. The Grand Ballroom is still holding the Last Cotillion — they began dancing at the Sunday brunch on the morning of the Unpleasantness and simply... never stopped. The mannequins are for the members who died.",
          responses: [{ text: "Of course they are.", next: "hello" }],
        },
        pres: {
          speaker: "Pemberton",
          text: "The Presidential Suite. Locked since 1967 — the key went down with the night manager. The Society considers it \"in mourning\". If someone were to... open it, I would be forced to look the other way. I'm very good at looking the other way. It's a hotel.",
          responses: [{ text: "Noted.", next: "hello" }],
        },
      },
    });
    // ---------------- bar, couture, kitchen ----------------
    R("dlg_pu_ferdinand", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Ferdinand",
          text: [
            "The Oak Bar is open. The Oak Bar is always open. What'll it be?",
            "Welcome to the finest bar on the island. The competition is a crater.",
            "Martini? I have gin, I have vermouth, I have an olive I've been saving since '67.",
          ],
          responses: [
            { text: "Let me see what you've got.", barter: true },
            { text: "Heard any gossip?", next: "gossip" },
            { text: "Goodbye.", end: true },
          ],
        },
        gossip: {
          speaker: "Ferdinand",
          text: [
            "They say the old nanny robot at the Dakota still sings every night at eleven. Same song. Twenty-two years.",
            "Raiders at Tiffany's. Wear diamonds on their knuckles. It's not a look.",
            "Bell over at Carnegie wants the Society at his concert. Her Ladyship says never. Her Ladyship says never about a lot of things, right up until she doesn't.",
            "Something big moved into the Natural History museum. Not a dinosaur. The dinosaurs don't leave tracks.",
          ],
          responses: [{ text: "Thanks.", next: "hi" }],
        },
      },
    });
    R("dlg_pu_hortense", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Madame Hortense",
          text: [
            "Darling. DARLING. You cannot go into the Palm Court looking like that. Let me help.",
            "Couture, darling. Old-world, hand-stitched, lead-lined where it matters.",
          ],
          responses: [
            { text: "Show me your clothes.", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    R("dlg_pu_anton", {
      start: () =>
        F.eggGiven ? "after" : qActive("pu_omelette") ? "waiting" : "hi",
      nodes: {
        hi: {
          speaker: "Chef Gaston",
          text: "Ah! Finally, someone who is not a Society dowager complaining about the soup. I am Gaston. I cook. I cook with nothing — burrow rat, gnarlberry, despair. But I have a dream.",
          responses: [
            { text: "What dream?", next: "dream" },
            { text: "Can I buy some food?", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
        dream: {
          speaker: "Chef Gaston",
          text: "The omelette. The TRUE omelette. Not giant roach eggs, not shellback — a RIPJAW egg. There is a nest, they say, in the Museum of Natural History, in the hall of the dinosaurs. Bring me one egg and you shall eat like a president and be paid like a senator.",
          responses: [
            {
              text: "I'll find you an egg.",
              end: true,
              action: () => qStart("pu_omelette"),
            },
            {
              text: "I have one right here.",
              cond: () => has("pu_ripjaw_egg"),
              next: "egg",
            },
            { text: "That sounds like suicide.", next: "hi" },
          ],
        },
        waiting: {
          speaker: "Chef Gaston",
          text: "The egg! Do you have the egg?",
          responses: [
            {
              text: "Here it is.",
              cond: () => has("pu_ripjaw_egg"),
              next: "egg",
            },
            { text: "Let me buy something meanwhile.", barter: true },
            { text: "Not yet.", end: true },
          ],
        },
        egg: {
          speaker: "Chef Gaston",
          text: "[Gaston cradles the egg like a newborn, weeps a little, then cracks it into a pan with surgical precision] Magnifique. MAGNIFIQUE. Take these — two omelettes and two hundred scrip. You have given an old man his reason to live. And to cook.",
          onEnter: () => {
            if (take("pu_ripjaw_egg")) {
              F.eggGiven = true;
              give("scrip", 200);
              give("ruins_omelet", 2);
              qComplete("pu_omelette");
            }
          },
          responses: [{ text: "Bon appétit.", end: true }],
        },
        after: {
          speaker: "Chef Gaston",
          text: [
            'The Society asked for "the usual". I served them the ripjaw omelette. The Colonel wept.',
            "You again! My favourite egg-hunter. Hungry?",
          ],
          responses: [
            { text: "Let me see the menu.", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    R("dlg_pu_ophelia", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Ophelia",
          text: [
            "Box office is open! Tonight: the Consort. Tomorrow: the Consort. Price: whatever you've got.",
            "Programmes, candles, rosin, ammunition. We're a full-service venue.",
          ],
          responses: [
            { text: "What are you selling?", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
      },
    });
    R("dlg_pu_rudy", {
      start: "hi",
      nodes: {
        hi: {
          speaker: 'Rudy "Keys" Lomax',
          text: [
            "Heh. Chopin, opus ten, number three. Been workin' on it since '67. Nearly got it.",
            "Don't mind the burns, kid, the fingers still work. Mostly. Ring finger locks up if I play too much Rachmaninoff.",
          ],
          responses: [
            { text: "Play something.", next: "play" },
            { text: "Goodbye.", end: true },
          ],
        },
        play: {
          speaker: 'Rudy "Keys" Lomax',
          text: "[He plays four soft notes, then stops] That's the Hollis theme. Julius wrote it for his kid. Four notes, see? A-D-A. Well. It's the thought that counts.",
          responses: [{ text: "Beautiful.", end: true }],
        },
      },
    });
    R("dlg_pu_clara", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Clara",
          text: [
            "First violin. Which means I get the good chair and the blame.",
            "Bell thinks music will fix the world. I think it'll fix Tuesday. That's enough for me.",
          ],
          responses: [
            { text: "How does the Consort survive?", next: "survive" },
            { text: "Goodbye.", end: true },
          ],
        },
        survive: {
          speaker: "Clara",
          text: "Ophelia trades, Rudy scares off raiders by smiling, and the stagehand shoots anything that talks during the adagio. We grow mushrooms in the old organ loft. They taste like Bach.",
          responses: [{ text: "Sounds like home.", end: true }],
        },
      },
    });
    R("dlg_pu_stagehand", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Stagehand",
          text: () =>
            F.dynamoOn
              ? "DYNAMO NUMBER TWO: RUNNING. HOUSE LIGHTS: READY. MY HAPPINESS SUBROUTINE: ENGAGED."
              : "GREETINGS, PATRON. DYNAMO NUMBER TWO IS OFFLINE. PLEASE DO NOT LICK THE TERMINALS.",
          responses: [{ text: "Carry on.", end: true }],
        },
      },
    });
    // ---------------- Dakota: Agnes & Nanny ----------------
    R("dlg_pu_agnes", {
      start: () =>
        qStage("pu_nursery") === "report"
          ? "report"
          : qDone("pu_nursery")
            ? "after"
            : qActive("pu_nursery")
              ? "progress"
              : "first",
      nodes: {
        first: {
          speaker: "Mrs. Hollister",
          text: "Oh! A visitor. Do come in, mind the Maniacs on the stairs, they were the Van Rensselaers. Tea? It's mostly rust, but it's hot rust. I'm Agnes Hollister, apartment 3A. I've lived here since 1961. The building has had a few... changes.",
          onEnter: () => {
            F.agnesMet = true;
          },
          responses: [
            { text: "What happened to your face?", next: "scars" },
            { text: "Do you hear crying at night?", next: "crying" },
            { text: "I should go.", end: true },
          ],
        },
        scars: {
          speaker: "Mrs. Hollister",
          text: "And you're impolite. We all have our afflictions, dear. Mine came from the boiler room in 1968, the night it blew a gasket. Yours I suspect you were born with.",
          responses: [{ text: "Sorry. The crying?", next: "crying" }],
        },
        crying: {
          speaker: "Mrs. Hollister",
          text: "Every night at eleven, for twenty-two years. A baby crying next door, in 3B — the Hollises. And a woman singing to it. The Board sealed their door during the panic. Margaret and little Ada were inside. Julius was on tour. He never came home.",
          responses: [
            { text: "Want me to look inside?", next: "ask" },
            { text: "That's horrible.", next: "ask" },
          ],
        },
        ask: {
          speaker: "Mrs. Hollister",
          text: "Would you? I'm too old and too brittle to break down doors. The super kept the key in the basement office — Mr. Ruiz. He's... still down there, in a way. The boiler cooked his mind years ago; he doesn't know anyone now. Please. I only want to know that the little one isn't... that nobody is suffering.",
          responses: [
            {
              text: "I'll find out.",
              end: true,
              action: () => qStart("pu_nursery", "key"),
            },
            { text: "Not my business.", end: true },
          ],
        },
        progress: {
          speaker: "Mrs. Hollister",
          text: () =>
            F.hollisOpen
              ? "You've opened it? What's in there? No — go and see first. Then tell me."
              : "The key's in the superintendent's office in the basement. Watch out for Mr. Ruiz. He was never pleasant, and now he only screams.",
          responses: [{ text: "I'm on it.", end: true }],
        },
        report: {
          speaker: "Mrs. Hollister",
          text: () =>
            F.nanny === "agnes"
              ? "She's here! She came down the stairs singing, and she brought me a blanket, and she asked if I wanted a bedtime story. I haven't had a bedtime story since Eisenhower. Thank you."
              : F.nanny === "rest"
                ? "It stopped. The singing. For the first time in twenty-two years it's quiet next door. I thought I would be glad. I am. I think I am."
                : "The robot? You... well. The noise has stopped. I suppose that is what I asked for.",
          onEnter: () => {
            give("scrip", 150);
            give("fizzo_blue", 1);
            qComplete("pu_nursery");
            if (F.nanny === "destroyed") standing(-5, "Destroyed Nanny");
            else standing(15, "Laid the Dakota's ghost to rest");
          },
          responses: [{ text: "Rest well, Mrs. Hollister.", end: true }],
        },
        after: {
          speaker: "Mrs. Hollister",
          text: [
            "More tea, dear? It's the good rust.",
            "The building is so quiet now. Well. Apart from the Van Rensselaers.",
            "If you ever find Julius Hollis's music played anywhere, you come and tell me.",
          ],
          responses: [{ text: "Goodbye, Agnes.", end: true }],
        },
      },
    });
    R("dlg_pu_nanny", {
      start: () => (F.nanny ? "done" : "hush"),
      nodes: {
        hush: {
          speaker: "Nanny",
          text: "Shhhh! Please use your indoor voice. Ada is SLEEPING. She has been having trouble sleeping. It has been... [whirr] ...eight thousand and thirty-five nights. But tonight will be the night, I am sure of it.",
          onEnter: () => {
            qSet("pu_nursery", "nanny");
          },
          responses: [
            { text: "Who is Ada?", next: "ada" },
            {
              text: "[Electronics 45] Let me see your maintenance log.",
              check: { skill: "electronics", value: 45 },
              next: "log",
              failNext: "logFail",
            },
            {
              text: "[Persuasion 50] Mrs. Hollister downstairs needs someone to look after her.",
              check: { skill: "persuasion", value: 50 },
              next: "agnes",
              failNext: "agnesFail",
            },
            { text: "The baby is dead, you bucket of bolts.", next: "cruel" },
            {
              text: "I'm putting you out of your misery. [Attack]",
              next: "attack",
            },
          ],
        },
        ada: {
          speaker: "Nanny",
          text: 'Ada Hollis, age six months, sixty-one centimetres, favourite song "the four-note one". Mrs. Hollis went to lie down on March the fifth. She told me: keep Ada calm, sing to her, do not stop until she is grown. [whirr] She is still very small.',
          responses: [{ text: "Nanny...", next: "hush" }],
        },
        log: {
          speaker: "Nanny",
          text: "[Her optics dim as you scroll through two decades of entries: SANG. SANG. SANG. CHANGED BLANKET. SANG.] ...You are reading the part about the growing. Ada's growth chart has not changed since 1967. Is... is Ada grown? I was told not to stop until she was grown.",
          responses: [
            {
              text: "She's grown, Nanny. She grew up a long time ago. Your shift is over.",
              next: "rest",
              standing: 10,
            },
            { text: "Never mind.", next: "hush" },
          ],
        },
        logFail: {
          speaker: "Nanny",
          text: "Access to maintenance is restricted to Mr. and Mrs. Hollis. You are neither. You are also tracking dirt onto my carpet.",
          responses: [{ text: "Sorry.", next: "hush" }],
        },
        rest: {
          speaker: "Nanny",
          text: "...Grown. [a very long pause] Then I will sing one more time. For the grown-up Ada. [She sings four soft notes, and her thrusters wind down one by one.] Good night, Ada. Good night, Mrs. Hollis. Good night, little building.",
          onEnter: () => C.nannyResolve("rest"),
          responses: [{ text: "Good night, Nanny.", end: true }],
        },
        agnes: {
          speaker: "Nanny",
          text: "[whirr] A resident... requiring care? Downstairs? Does she have trouble sleeping? Does she like the four-note song? ...Ada would want me to be useful. Ada was always generous with her rattle.",
          onEnter: () => C.nannyResolve("agnes"),
          responses: [{ text: "She'll love you.", end: true, standing: 5 }],
        },
        agnesFail: {
          speaker: "Nanny",
          text: "I have ONE charge and she is SLEEPING. Mrs. Hollister has a cat. Had a cat. The cat is also sleeping.",
          responses: [{ text: "Right.", next: "hush" }],
        },
        cruel: {
          speaker: "Nanny",
          text: "[Every lamp in the nursery flickers] You are upsetting the baby. I will have to ask you to LEAVE.",
          onEnter: () => C.nannyResolve("hostile"),
          responses: [{ text: "...", end: true }],
        },
        attack: {
          speaker: "Nanny",
          text: "INTRUDER IN THE NURSERY. INITIATING LULLABY PROTOCOL SEVEN.",
          onEnter: () => C.nannyResolve("hostile"),
          responses: [{ text: "...", end: true }],
        },
        done: {
          speaker: "Nanny",
          text: [
            "Shh. Everyone is sleeping.",
            "Would you like a bedtime story? I know one about a building with a very long nap.",
          ],
          responses: [{ text: "Goodnight, Nanny.", end: true }],
        },
      },
    });
    R("dlg_pu_winthrop", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Winthrop",
          text: [
            "WELCOME TO THE PLAZA. PROPER ATTIRE IS REQUIRED. YOUR ATTIRE HAS BEEN... ACCEPTED.",
            "GOOD EVENING. PLEASE WIPE YOUR FEET. AND YOUR WEAPONS.",
            "THE PLAZA SOCIETY THANKS YOU FOR NOT BLEEDING ON THE CARPET.",
          ],
          responses: [{ text: "Thanks, Winthrop.", end: true }],
        },
      },
    });
    R("dlg_pu_socialite", {
      start: "hi",
      nodes: {
        hi: {
          text: [
            "Have you MET the new people? They survived. How dreadfully common.",
            "I was at the Cotillion in '67. Well — my mother was, and I was nine and under the table. It's the same thing, socially.",
            "Radiation? We don't discuss that at luncheon.",
            "Colonel Ashby is telling the story about the Soviet submarine again. Do sit somewhere else.",
          ],
          responses: [{ text: "Excuse me.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
