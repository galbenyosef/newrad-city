// play-inline-555 04 — responses
// Lines 887-1577 of readable/play-inline-555.pretty.js (statement-aligned).
  L.hook("register", function () {
    // ---------------- Mayor Lucius Crowe ----------------
    L.dialogue("dlg_neon_crowe", {
      start: () =>
        Q.stage("sq_neon") === "return" && L.has("q_neon_core")
          ? "core_back"
          : L.flag("met_crowe")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Well, well! A stranger in a cryo suit, and not screaming! Lucius Crowe, Mayor of the Neon, at your service. [He doffs a moth-eaten top hat over a face lined like an old playbill, all teeth and stage paint.] Welcome to the brightest square mile in the Ruins. What brings you to our humble crossroads?",
          onEnter() {
            L.setFlag("met_crowe");
          },
          responses: [
            { text: "Just passing through. Nice lights.", next: "lights" },
            { text: "Mayor? Of what, exactly?", next: "mayor" },
            {
              text: "A town in Times Square. Who do you answer to?",
              next: "uncounted",
            },
          ],
        },
        uncounted: {
          text: "Answer to? [He beams.] Spring of '67, the Continuity came round with clipboards and census cards, and every soul in this square lit a cigarette off theirs. I've outlived one government already, friend. I can outlive a filing cabinet. We're the uncounted, and the uncounted answer to the lights.",
          responses: [{ text: "So what is this place?", next: "mayor" }],
        },
        mayor: {
          text: "Of the Neon! Eighty-three souls, give or take the ones who wander off. We came here because nobody else wanted Times Square — too bright, too loud, too full of us. Now it's ours. The lights stay on, the drinks are warm, and nobody asks to see your card.",
          responses: [
            { text: "The lights are impressive.", next: "lights" },
            { text: "Any trouble I can help with?", next: "trouble" },
            { text: "You have a terminal in your office?", next: "office" },
          ],
        },
        office: {
          text: "The administrative terminal! Census, proclamations, the generator readings. Password's BIGBUZZ — one word, all capitals. Don't look at me like that; it's also painted on the side of the generator in letters three feet high. Transparency in government, citizen.",
          learn: LOCK_MAYOR.id,
          onEnter() {
            learnCode(LOCK_MAYOR.id);
          },
          responses: [
            { text: "Tell me about the generator.", next: "lights" },
            { text: "Thanks, Mayor." },
          ],
        },
        lights: {
          text: "Impressive, and dying. [His smile slips.] The Big Buzz — our generator — is down to fourteen percent. When it goes, the Neon goes dark, and in the dark the Maniacs come up out of the subway. We've got a spare rig battery, somewhere down in the 42nd Street tunnels. I'm a mayor, not a tunnel rat.",
          responses: [
            {
              text: "I'll get your rig battery.",
              cond: () => !Q.isStarted("sq_neon"),
              action: () => Q.start("sq_neon"),
            },
            {
              text: "Let me look at the generator first.",
              check: { skill: "mechanics", value: 60 },
              next: "repair",
              failNext: "repair_fail",
              cond: () => !L.flag("neon_core_resolved"),
            },
            {
              text: "What's in it for me?",
              next: "reward",
              cond: () => !Q.isStarted("sq_neon"),
            },
            { text: "Not my problem." },
          ],
        },
        trouble: {
          text: "Trouble? My dear topsider, we are the uncounted in a city that wants everybody on a list, run by a generator that wants to be gone, next to a cathedral that wants us to be gone in a more spiritual way. Trouble is the Neon's chief export.",
          responses: [{ text: "Start with the generator.", next: "lights" }],
        },
        reward: {
          text: "The gratitude of eighty-three uncounted souls, two hundred scrip from the civic treasury — that's my hat — and the title of Honorary Citizen of the Neon, which entitles you to absolutely nothing but feels wonderful.",
          responses: [
            { text: "Deal.", action: () => Q.start("sq_neon") },
            { text: "I'll think about it." },
          ],
        },
        repair: {
          text: "[You spend an hour elbow-deep in the Big Buzz, bypassing a burnt coil bank and rebalancing the load across the marquee circuits. When you throw the breaker, all of Times Square flares so bright the whole square cheers.] ...Now THAT is a light show! You beautiful, beautiful stranger!",
          onEnter() {
            if (!Q.isStarted("sq_neon")) Q.start("sq_neon");
            L.xp(80, "Mechanics: The Big Buzz");
            L.standing(100, "Kept the lights on");
            L.giveScrip(200);
            L.give("q_mayor_top_hat", 1);
            neonResolve("repair");
          },
          responses: [{ text: "All in a day's work." }],
        },
        repair_fail: {
          text: "You poke at the Big Buzz. The Big Buzz pokes back. [You smell your own eyebrows.] Perhaps the rig battery, then?",
          responses: [
            {
              text: "I'll get the rig battery.",
              cond: () => !Q.isStarted("sq_neon"),
              action: () => Q.start("sq_neon"),
            },
            { text: "Maybe later." },
          ],
        },
        core_back: {
          text: "Is that — Big Buzz Number Two! [He takes his hat off and holds it over his heart.] You went into the tunnels. For us. Do you know how long it's been since a topsider did anything for us that didn't involve a shotgun?",
          responses: [
            { text: "It's yours, Mayor. Keep the lights on.", next: "give" },
            {
              text: "The Iron Covenant would pay more for this.",
              next: "cov_threat",
            },
            {
              text: "This is worth more than two hundred scrip.",
              check: { skill: "trade", value: 55 },
              next: "haggle",
              failNext: "haggle_fail",
            },
          ],
        },
        give: {
          text: "[He calls for Big Sal, and it takes both of them to carry the battery to the generator. A minute later, every sign in Times Square blazes back to life at once — FIZZO COLA, PRAIRIE ROOT BEER, HI-OCTANE HARRY'S — and a cheer goes up from every shack.] Honorary Citizen of the Neon. Forever. And take the hat. A citizen needs a hat.",
          onEnter() {
            L.take("q_neon_core", 1);
            L.giveScrip(200);
            L.give("q_mayor_top_hat", 1);
            L.standing(100, "Restored the Neon");
            neonResolve("crowe");
          },
          responses: [{ text: "Long live the Neon." }],
        },
        haggle: {
          text: "A negotiator! [He laughs, a dry, crackling laugh, like a log settling in a fire.] Fine, fine. Three hundred and the hat. The treasury will need a new hat. I'll wear a lampshade.",
          onEnter() {
            L.take("q_neon_core", 1);
            L.giveScrip(300);
            L.give("q_mayor_top_hat", 1);
            L.standing(40, "Restored the Neon");
            neonResolve("crowe");
          },
          responses: [{ text: "Pleasure doing business, Mayor." }],
        },
        haggle_fail: {
          text: "Two hundred is what the treasury has, friend. If you want more, you'll have to take it out of my hide, and my hide isn't worth much these days. It's been on the market since '67 and nobody's bid.",
          responses: [{ text: "Fine. It's yours.", next: "give" }],
        },
        cov_threat: {
          text: "[The warmth leaves his face.] Then sell it to them. The Covenant will say thank you, lock it in a strongroom, and forget it exists. And when the lights go out here, eighty-three people will learn exactly what a stranger's gratitude is worth. Your call, citizen.",
          responses: [
            { text: "...You're right. It's yours.", next: "give" },
            { text: "Business is business." },
          ],
        },
        leave_it: {
          text: "[He looks at the dying marquee for a while.] Then the robes will have it by Sunday. They've been down there all week with lanterns, singing, looking for something heavy. I suppose now they'll find it. [He puts his hat back on.] Candles, then. We've had worse.",
          onEnter() {
            neonResolve("left");
          },
          responses: [{ text: "[Leave.]" }],
        },
        again: {
          text: () =>
            L.flag("neon_outcome") === "crowe" ||
            L.flag("neon_outcome") === "repair"
              ? "Citizen! Look at those lights! Every night I stand here and count them. I lose count. It's wonderful."
              : L.flag("neon_outcome")
                ? "[The Mayor doesn't look at you. The Neon is lit by candles.]"
                : "Any luck in the tunnels, citizen? The Big Buzz is making that noise again.",
          responses: [
            { text: "Tell me about the Neon.", next: "mayor" },
            {
              text: "About your generator...",
              next: "lights",
              cond: () => !Q.isStarted("sq_neon"),
            },
            {
              text: "I'm not going down into those tunnels. Let them keep your battery.",
              next: "leave_it",
              cond: () =>
                Q.isActive("sq_neon") &&
                Q.stage("sq_neon") === "core" &&
                !L.has("q_neon_core") &&
                !L.flag("neon_core_resolved"),
            },
            { text: "Goodbye, Mayor." },
          ],
        },
      },
    });

    // ---------------- Marigold (Rad-Lounge) ----------------
    L.dialogue("dlg_neon_marigold", {
      start: () => (L.flag("wendell_wed") ? "wed" : "hello"),
      nodes: {
        hello: {
          text: "Welcome to the Rad-Lounge, sugar. I'm Marigold. I pour the drinks, I sing on Thursdays, and I don't do refunds. What'll it be?",
          responses: [
            { text: "Let's see what you're pouring.", barter: true },
            { text: "How long have you lived here?", next: "past" },
            {
              text: "Marigold... is that your real name?",
              check: { attr: "senses", value: 6 },
              next: "marjorie",
              failNext: "name_fail",
              cond: () =>
                Q.isStarted("sq_blackfriday") &&
                !L.flag("marigold_is_marjorie"),
            },
            { text: "Just looking." },
          ],
        },
        past: {
          text: "Since the week of the bombs. Before that I danced at a club on 44th. Before THAT I was a girl from Queens with a boyfriend who worked in Housewares at Sterling's and was too scared to propose. Ancient history, sugar. Twenty-two years is ancient, around here.",
          responses: [
            { text: "What happened to the boyfriend?", next: "boyfriend" },
            { text: "Let's see what you're pouring.", barter: true },
          ],
        },
        boyfriend: {
          text: "Same thing that happened to everybody. [She polishes a glass that doesn't need it.] ...Next question.",
          responses: [{ text: "Sorry I asked." }],
        },
        name_fail: {
          text: "It's the name on the sign, sugar. That's as real as names get around here.",
          responses: [{ text: "Fair enough." }],
        },
        marjorie: {
          text: "[You notice she wears a Sterling's employee pin on the inside of her collar — not hers, a man's: \"W. PRUITT — HOUSEWARES.\"] ...Nobody's noticed that pin in twenty-two years. [Quietly.] It was Marjorie, once. He doesn't know it's me. Look at us — twenty-two years took both our faces; how would he? And I've been too scared to tell him. Isn't that a laugh? He was the scared one.",
          onEnter() {
            L.setFlag("marigold_is_marjorie");
            L.xp(40, "Senses");
          },
          responses: [
            { text: "He still loves you. He never stopped.", next: "still" },
            { text: "Your secret's safe with me." },
          ],
        },
        still: {
          text: "Then he'll have to ask. He always did have to be the one to ask. [She smiles, and for a second you can see a girl from Queens.]",
          responses: [{ text: "Leave it to me." }],
        },
        wed: {
          text: "Well, if it isn't the best man. You're family now, sugar. Drinks are half price for family. Don't tell Crowe.",
          responses: [
            { text: "Let's see what you're pouring.", barter: true },
            { text: "Congratulations, Marjorie." },
          ],
        },
      },
    });

    // ---------------- Wendell Pruitt ----------------
    L.dialogue("dlg_neon_wendell", {
      start: () =>
        L.flag("wendell_wed")
          ? "wed"
          : Q.stage("sq_blackfriday") === "return" && L.has("q_wendell_ring")
            ? "ring"
            : L.flag("met_wendell")
              ? "again"
              : "first",
      nodes: {
        first: {
          text: "Welcome to Sterling's — oh. Sorry. Habit. Wendell Pruitt, Housewares, third floor. [He taps a name tag pinned to a coat that has been mended so many times it's mostly mending.] I was on shift when the world ended. Technically I'm still on shift. Nobody ever clocked me out.",
          onEnter() {
            L.setFlag("met_wendell");
          },
          responses: [
            {
              text: "You worked at Sterling's before the bombs?",
              next: "sterlings",
            },
            { text: "Anything I can help you find?", next: "job" },
            { text: "Goodbye, Wendell." },
          ],
        },
        again: {
          text: "Can I help you find something? Oh — it's you.",
          responses: [
            {
              text: "About your ring...",
              next: "job",
              cond: () => !Q.isStarted("sq_blackfriday"),
            },
            { text: "Just saying hello." },
          ],
        },
        sterlings: {
          text: 'Six years. The big March sale was the next morning. Doors at four A.M. Management told us to stand aside and "let the customers be customers." [He shivers.] The customers are still in there, you know. Maniacs, now. Some still have their shopping bags. Still waiting for the doors to open. They don\'t look like customers anymore.',
          responses: [
            { text: "Is there something in there you want?", next: "job" },
          ],
        },
        job: {
          text: "A ring. For a girl named Marjorie. I hid it in the manager's safe so the customers couldn't get at it, and I was going to ask her on one knee, in Housewares, after the sale. [He looks at his hands, rough and spotted like old paint.] She's gone, of course. Everybody's gone. But I'd like to hold it. Just once. Just to know I really meant to.",
          responses: [
            {
              text: "I'll get your ring, Wendell.",
              cond: () => !Q.isStarted("sq_blackfriday"),
              action: () => Q.start("sq_blackfriday"),
            },
            {
              text: "That place is crawling with Maniacs. What's it worth to you?",
              next: "pay",
              cond: () => !Q.isStarted("sq_blackfriday"),
            },
            { text: "Sorry, Wendell." },
          ],
        },
        pay: {
          text: "I don't have much. A hundred scrip and an old-world employee discount card — twenty percent off anything in Sterling's. [He pauses.] Nothing in Sterling's is for sale anymore. So it's really just the hundred scrip.",
          responses: [
            { text: "I'll do it.", action: () => Q.start("sq_blackfriday") },
            { text: "Not worth it." },
          ],
        },
        ring: {
          text: "[Wendell sees the little gift box in your hand and forgets to breathe for a moment.] You... you found it. You actually went into the store.",
          responses: [
            { text: "Here. It's yours.", next: "give" },
            {
              text: "Wendell — Marigold is Marjorie. She's been here all along.",
              cond: () => !!L.flag("marigold_is_marjorie"),
              next: "reveal",
            },
            {
              text: "Actually, I couldn't find it. The safe was empty.",
              standing: -50,
              next: "lie",
            },
          ],
        },
        give: {
          text: "[He holds it for a long time.] Thank you. I know it's foolish. Here — the hundred scrip, as promised. [He turns the box over and over.] I think I'll keep it in my pocket. Just in case the world starts over.",
          onEnter() {
            L.take("q_wendell_ring", 1);
            L.giveScrip(100);
            L.standing(75, "Returned Wendell's ring");
            L.setFlag("ring_resolved");
            L.setFlag("ring_returned");
            Q.complete("sq_blackfriday");
          },
          responses: [{ text: "Take care, Wendell." }],
        },
        reveal: {
          text: "[He looks across the square at the Rad-Lounge, where Marigold is singing something slow. He looks for a very long time.] ...The way she holds the microphone. Left hand. She always — she ALWAYS — [He is already walking. Then running. In front of the whole Neon, on the dusty asphalt of Times Square, Wendell Pruitt of Housewares gets down on one knee.]",
          onEnter() {
            L.take("q_wendell_ring", 1);
            L.giveScrip(100);
            L.setFlag("ring_resolved");
            L.setFlag("ring_returned");
            L.setFlag("wendell_wed");
            L.standing(150, "Reunited Wendell and Marjorie");
            L.xp(150, "Twenty-two years late");
            L.say("neon_marigold", "Yes, you idiot! YES!");
            L.news(
              "I've got a wedding announcement, folks, and I don't say that often in this business. Last night in the Neon, a fella named Wendell proposed to a gal named Marjorie — twenty-two years after he meant to. She said yes. She said, and I quote, \"you idiot, yes.\" This next one's for the happy couple.",
            );
            Q.complete("sq_blackfriday");
          },
          responses: [{ text: "[Applaud.]" }],
        },
        lie: {
          text: "[His shoulders drop an inch.] Ah. Well. The customers, I suppose. [He tries to smile.] Thank you for looking. It was silly of me.",
          onEnter() {
            L.setFlag("ring_resolved");
            L.setFlag("ring_kept");
            Q.complete("sq_blackfriday");
          },
          responses: [{ text: "[Leave.]" }],
        },
        wed: {
          text: "Married! Can you believe it? I'm a married man! She says she knew me the whole time. She says she was waiting for me to ask. Twenty-two years, and I STILL wasn't fast enough. [He beams.] Housewares, third floor, if you ever need anything. Anything at all.",
          responses: [{ text: "Congratulations, Wendell." }],
        },
      },
    });

    // ---------------- Doc Needles ----------------
    L.dialogue("dlg_neon_needles", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            "Doc Needles, head nurse. Broadway does the cutting, I do the stitching — and the cheap patch-ups, if you don't need a surgeon. Strangers bleed the same colour, mostly. " +
            (G.player.rads > 100
              ? "And sweetie, you are GLOWING."
              : "What hurts?"),
          responses: [
            {
              text: "Patch me up. (25 scrip)",
              cond: () => G.player.hp < G.player.maxHp,
              action: () => {
                if (L.pay(25)) {
                  G.player.heal(G.player.maxHp);
                  L.sfx("inject");
                }
              },
            },
            {
              text: "Get the rads out of me. (30 scrip)",
              cond: () => G.player.rads > 0,
              action: () => {
                if (L.pay(30)) L.removeRads();
              },
            },
            { text: "Let me see your supplies.", barter: true },
            { text: 'Why "Needles"?', next: "name" },
            { text: "I'm fine." },
          ],
        },
        name: {
          text: "I was a seamstress before the bombs. The hands remember, even if the fingertips don't feel much anymore. Now I stitch people instead of hems. People are harder. They wiggle. For anything worse than a scratch — radiation, broken bones — see Doc Broadway inside.",
          responses: [{ text: "Makes sense.", next: "hello" }],
        },
      },
    });

    // ---------------- Big Sal ----------------
    L.dialogue("dlg_neon_sal", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            [
              "You're fine. You got a face like a face. Go on in.",
              "No Maniacs, no raiders, no trouble. You're none of those. Probably.",
              "Mayor's by the big stage. Lounge is round the back. Don't touch the neon, it bites.",
            ][Math.floor(Math.random() * 3)],
          responses: [
            { text: "Thanks, Sal." },
            { text: "Seen anything strange lately?", next: "strange" },
          ],
        },
        strange: {
          text: "Fellas in starched 1967 uniforms handing out census forms. Sky-Eye drones floating over the square at night, playing marching music. And a big grey Brute in a traffic-light crown hanging off the Empire State yelling about a queen. So — normal Tuesday.",
          responses: [{ text: "Right." }],
        },
      },
    });

    // ---------------- Keeper Ezra Hollowell ----------------
    L.dialogue("dlg_glow_ezra", {
      start: () =>
        Q.stage("sq_glow") === "return"
          ? "return"
          : Q.stage("sq_glow") === "take"
            ? "take"
            : L.flag("met_ezra")
              ? "again"
              : "first",
      nodes: {
        first: {
          text: "Welcome, child, to the Cathedral of the Second Sun. I am Keeper Ezra Hollowell. Do not be afraid of the clicking in those goggles of yours; that is only the Light, saying hello.",
          onEnter() {
            L.setFlag("met_ezra");
          },
          responses: [
            { text: "What is the Second Sun?", next: "sun" },
            {
              text: "This used to be St. Patrick's Cathedral.",
              next: "cathedral",
            },
            {
              text: "Is there anything I can do for the Glowkeepers?",
              next: "task",
            },
          ],
        },
        sun: {
          text: "For a thousand years we prayed to one sun, and it never answered. Then, on a grey Sunday morning in March of 1967, the Sun came down over Yonkers and answered everyone at once, rich and poor, listed and unlisted. We call that moment the Kindling, and all that came after, the Long Noon. The Sun does not choose. We do not fear the Glow. We keep it.",
          responses: [
            { text: "That sounds... dangerous.", next: "danger" },
            {
              text: "Is there anything I can do for the Glowkeepers?",
              next: "task",
            },
          ],
        },
        danger: {
          text: "So is birth, child. So is love. Everything worth doing makes a Geiger counter sing.",
          responses: [
            { text: "Anything I can do for the Glowkeepers?", next: "task" },
            { text: "I'll be going." },
          ],
        },
        cathedral: {
          text: "And it still is a cathedral! Its old faith simply made room for a brighter one. We kept the windows, and hung the sun disc over the altar. The windows are very beautiful when the lightning lights them from behind.",
          responses: [
            { text: "Anything I can do for the Glowkeepers?", next: "task" },
          ],
        },
        task: {
          text: "There is a market at Grand Central where thousands drink water scrubbed so clean it has forgotten the Light entirely. [He produces a small lead box with a crack in it. The crack glows.] This is a Blessed Isotope. Place it in their water tower's intake, and every sip will carry the warmth of the Kindling. They will thank us. Eventually. After the hair loss.",
          responses: [
            {
              text: "I'll do it.",
              cond: offerOpen,
              standing: -25,
              action: () => takeIsotope(false),
            },
            {
              text: "Give me the isotope. [Intending to deal with it yourself.]",
              cond: offerOpen,
              action: () => takeIsotope(true),
            },
            {
              text: "Poisoning people isn't a blessing.",
              check: { skill: "persuasion", value: 65 },
              next: "convince",
              failNext: "convince_fail",
              cond: offerOpen,
            },
            {
              text: "I won't poison anybody's water, Keeper. Find another errand boy.",
              cond: () => Q.stage("sq_glow") === "take",
              next: "refused",
            },
            { text: "No." },
          ],
        },
        take: {
          text: "The service I spoke of, friend. [He sets a small lead box on the altar rail. There is a crack in the lid, and the crack glows.] The market at Grand Central drinks water scrubbed so clean it has forgotten the Light. Place this Blessed Isotope in their water tower's intake, and every sip will carry the warmth of the Kindling. They will thank us. Eventually. After the hair loss.",
          onEnter() {
            L.setFlag("met_ezra");
          },
          responses: [
            {
              text: "I'll do it.",
              standing: -25,
              action: () => takeIsotope(false),
            },
            {
              text: "Give me the isotope. [Intending to deal with it yourself.]",
              action: () => takeIsotope(true),
            },
            {
              text: "Poisoning people isn't a blessing.",
              check: { skill: "persuasion", value: 65 },
              next: "convince",
              failNext: "convince_fail",
            },
            {
              text: "I won't poison anybody's water, Keeper. Find another errand boy.",
              next: "refused",
            },
            { text: "Let me think about it." },
          ],
        },
        refused: {
          text: "[He puts the lead box back inside his robe, unhurried.] The Light does not force itself on anyone, friend. I only wish it would, now and then. Go with the Noon.",
          onEnter() {
            refuseIsotope();
          },
          responses: [{ text: "[Leave.]" }],
        },
        convince: {
          text: "[He is quiet for a long time.] ...You speak as if the Light were a thing to be pushed onto people. Perhaps you are right. Perhaps a blessing forced is only a burn. [He closes the lead box.] I will pray on it. Take these, for your honesty — the Noon favours those who speak plainly.",
          onEnter() {
            if (L.has("q_blessed_isotope")) L.take("q_blessed_isotope", 1);
            L.setFlag("glow_convinced");
            L.standing(100, "Talked down Keeper Hollowell");
            L.xp(80, "Persuasion: Crisis of faith");
            L.give("q_glowkeeper_vestments", 1);
            if (!Q.isStarted("sq_glow")) Q.start("sq_glow");
            glowMirror();
            Q.complete("sq_glow");
          },
          responses: [{ text: "Thank you, Keeper." }],
        },
        convince_fail: {
          text: "You are young — younger than you look, I think, for all the years you slept — and the clicking frightens you. It will pass. Everything passes. Except half-lives. Those take a while.",
          responses: [{ text: "[Leave.]" }],
        },
        again: {
          text: () =>
            L.flag("glow_isotope_planted") || L.flag("glow_placebo_planted")
              ? "Bearer of the Light! The market glows with the Noon! [He seems genuinely overjoyed.]"
              : "The Noon be on you, child.",
          responses: [
            {
              text: "Is there anything I can do for the Glowkeepers?",
              next: "task",
              cond: offerOpen,
            },
            { text: "And on you, Keeper." },
          ],
        },
        return: {
          text: () =>
            L.flag("glow_isotope_planted") || L.flag("glow_placebo_planted")
              ? "I saw it from the bell tower! Grand Central's water tower, glowing like a second dawn. The Second Sun has received your offering. Take these vestments, Bearer of the Light, and this scrip from the collection plate."
              : "You carry the isotope still. Its warmth is wasted in your pack, child. Have you changed your heart?",
          responses: [
            {
              text: "Thank you, Keeper.",
              cond: () =>
                L.flag("glow_isotope_planted") ||
                L.flag("glow_placebo_planted"),
              action: () => {
                L.give("q_glowkeeper_vestments", 1);
                L.giveScrip(150);
                Q.complete("sq_glow");
              },
            },
            {
              text: "A blessing nobody asked for is only a burn, Keeper. I carried it all this way and never once wanted to use it.",
              cond: () => L.has("q_blessed_isotope"),
              check: { skill: "persuasion", value: 50 },
              next: "convince",
              failNext: "convince_fail",
            },
            {
              text: "I won't do it. Take it back.",
              cond: () => L.has("q_blessed_isotope"),
              action: () => refuseIsotope(),
            },
            { text: "Not yet.", cond: () => L.has("q_blessed_isotope") },
          ],
        },
      },
    });

    // ---------------- Sister Noonday ----------------
    L.dialogue("dlg_glow_sister", {
      start: "hello",
      nodes: {
        hello: {
          text: "The Noon be on you, traveller! I'm Sister Noonday. I was Sister Maureen, but then I found the Light, and also a barrel of something that glows. Would you like some Noon water? It's very holy. You can tell by the colour.",
          responses: [
            { text: "Let me see what you have.", barter: true },
            {
              text: "Why do you sell Prussian Blue if you love radiation?",
              next: "flush",
            },
            { text: "Can I read your scripture?", next: "scripture" },
            { text: "The Noon be on you, Sister." },
          ],
        },
        flush: {
          text: "For the unconvinced! The Light does not force itself on anyone. [She glances at the cathedral doors, and lowers her voice.] ...Keeper Hollowell might. But the Light doesn't.",
          responses: [
            { text: "Let me see what you have.", barter: true },
            { text: "I see." },
          ],
        },
        scripture: {
          text: "Of course! The Book of the Kindling is on the teletype by the altar. The machine asks for a word before it prints; the word is LONGNOON, all one word. We are not a secret society, traveller. We are a very bright one.",
          learn: LOCK_SCRIPTURE.id,
          onEnter() {
            learnCode(LOCK_SCRIPTURE.id);
          },
          responses: [
            { text: "Let me see what you have.", barter: true },
            { text: "Thank you, Sister." },
          ],
        },
      },
    });

    // ---------------- The water tower (actor-less dialogue) ----------------
    L.dialogue("dlg_glow_tower", {
      start: "tower",
      nodes: {
        tower: {
          speaker: "Water Tower Intake",
          text: "[A rusted intake valve feeds Grand Central's rooftop water tower. You can hear water rushing below. The Blessed Isotope is warm against your leg.]",
          responses: [
            {
              text: "[Drop the Blessed Isotope into the intake.]",
              action: () => plantIsotope(false),
            },
            {
              text: "[Swap the isotope for a bottle of Fizzo Blue, seal the reliquary and drop in the fake.]",
              check: { skill: "mechanics", value: 50 },
              failNext: "swap_fail",
              cond: () => L.has(FIZZO_BLUE()),
              action: () => plantIsotope(true),
            },
            { text: "[Leave it alone.]" },
          ],
        },
        swap_fail: {
          text: "[You can't work out how to open the reliquary without cracking the lead lining — and dosing yourself thoroughly in the process.]",
          responses: [{ text: "[Step back.]" }],
        },
      },
    });
  });

  // Selling the Neon's battery to the Iron Covenant / the Glowkeepers (responses injected into their trees)
