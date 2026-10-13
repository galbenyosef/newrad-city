// play-inline-554 06 — next
// Lines 1172-2232 of readable/play-inline-554.pretty.js (statement-aligned).
  L.hook("register", function () {
    // ---------------- Lancer-Commander Stroud ----------------
    L.dialogue("dlg_cov_stroud", {
      start: () => {
        if (Q.stage("mq05") === "return_cov" && L.has("q_knickerbocker_core"))
          return "return";
        if (Q.isActive("mq04") && !faction())
          return L.flag("met_stroud") ? "pitch" : "first";
        if (faction() === "continuity") return "traitor";
        return "again";
      },
      nodes: {
        first: {
          text: "Halt. That's close enough. ...A Long Winter cryo suit. So you're the second sleeper the Continuity's drones keep singing about. Lancer-Commander Harlan Stroud, the Iron Covenant. State your business, and state it quickly.",
          onEnter() {
            L.setFlag("met_stroud");
          },
          responses: [
            {
              text: "The Continuity has my friend Zeke on Liberty Island. I need to get there.",
              next: "help",
            },
            { text: "What is the Covenant doing in Manhattan?", next: "why" },
            { text: "Nothing. Sorry to bother you." },
          ],
        },
        why: {
          text: "Taking machines away from people who aren't ready for them. Which, in my experience, is everyone. We came down from the mountains for a power plant. We found a city full of machines that could finish what Europe's bombers started. So we stayed.",
          responses: [
            {
              text: "The Continuity has my friend on Liberty Island.",
              next: "help",
            },
          ],
        },
        pitch: {
          text: "Back again, sleeper. Have you considered my offer?",
          responses: [
            { text: "Remind me what the offer is.", next: "deal" },
            { text: "Tell me about the Array.", next: "array" },
            { text: "I'll find my own way across.", next: "alone" },
            { text: "Not yet." },
          ],
        },
        help: {
          text: "The Continuity has a lot of things that aren't theirs. The UN building. The sky over Liberty Island. My patience. We've watched Liberty for a year — we know about the Array in the torch. And now we know about you.",
          responses: [
            { text: "What is the Array?", next: "array" },
            { text: "Will you help me?", next: "deal" },
          ],
        },
        array: {
          text: "Old-world atmospheric reclamation. The Office of Civil Defense and Atlas Power called it Knickerbocker. In theory it could scrub the radiation out of Manhattan's sky. In the Continuity's hands it would scrub out whatever isn't on their paperwork — and they have a great deal of paperwork.",
          responses: [
            { text: "How do you know that?", next: "know" },
            { text: "Will you help me?", next: "deal" },
          ],
        },
        know: {
          text: "I don't. I assume it. That is the difference between the Covenant and every dead institution in this city: we assume the worst about machines, and we are usually right.",
          responses: [{ text: "Will you help me?", next: "deal" }],
        },
        deal: {
          text: "Here are my terms. You carry the Liberty Key — the Array's civilian authorization. Without it, the Continuity owns a very expensive lamp. The Array also needs an ignition core, which the Brutes dragged to the top of the Empire State Building. Bring me that core. My Lancers escort you onto Liberty Island, we put the Continuity in the ground, and the Array comes under Covenant protection.",
          responses: [
            { text: "Deal. I'll get the core.", next: "join" },
            {
              text: "And if I want the Array turned on — for everyone?",
              check: { skill: "persuasion", value: 55 },
              next: "wexler",
              failNext: "charter",
            },
            {
              text: "Why should I trust you over the Continuity?",
              next: "trust",
            },
            { text: "I'll find my own way across.", next: "alone" },
            { text: "I need to think about it." },
          ],
        },
        trust: {
          text: "You shouldn't trust either of us. But I'll tell you what I'll do with that Array, and I'll tell you to your face. Ask the Continuity what they'll do with it. Then ask to see it in writing. They will have it in writing.",
          responses: [
            { text: "Deal. I'll get the core.", next: "join" },
            { text: "I'll think about it." },
          ],
        },
        wexler: {
          text: "[A long pause.] You sound like my Archivist. I'll tell you what I told her: we will debate turning it on when there is no Continuity left to debate with. If that day comes... I will listen. That is more than I promise most people.",
          onEnter() {
            L.setFlag("stroud_will_listen");
            L.xp(20, "Persuasion");
          },
          responses: [
            { text: "Good enough. I'll get the core.", next: "join" },
          ],
        },
        charter: {
          text: "The Charter is not a debating society, sleeper. We secure it first. Everything else comes after.",
          responses: [
            { text: "Fine. I'll get the core.", next: "join" },
            { text: "I'll think about it." },
          ],
        },
        join: {
          text: "Good. The Empire State Building is on 34th and Fifth; you can't miss it, it's the tall one with Brutes hanging off it. Lancer Reyes will outfit you. When you have the core, my Lancers take you across. Hold fast, sleeper.",
          onEnter() {
            L.setFlag("mq_faction", "covenant");
            setConHostile();
            L.factionTruce(SH.conFaction, undefined, undefined, 0, true);
            if (Q.isActive("mq04")) Q.complete("mq04");
            L.give(SH.tonic, 3);
            L.give(SH.gyroRounds, 30);
          },
          responses: [
            {
              text: "Anything else I should know?",
              next: "intel",
              cond: () => !L.flag("ms_stroud_intel"),
            },
            { text: "Hold fast." },
          ],
        },
        intel: {
          text: "One thing. My Archivists trade with every book-runner south of Harlem. Since the winter the sun cult has been buying two things, and paying in gold leaf: rig batteries, and European ordnance manuals. French. Flemish. Fusing and arming, sleeper. Nobody buys a bomb manual to pray over it.",
          onEnter() {
            L.setFlag("ms_stroud_intel");
          },
          responses: [
            {
              text: "The Glowkeepers have a bomb under Grand Central.",
              next: "intel2",
              cond: () => !!L.flag("ms_rose_revealed"),
            },
            { text: "I'll keep my eyes open." },
          ],
        },
        intel2: {
          text: "[He looks at you for a long time.] Then they need a key, a wheel and twenty-eight volts, and they are shopping for the last two. If that is true, sleeper, there are two machines in this city that could end it, and I have been watching the wrong one. Get across the harbour. Then we talk about Grand Central.",
          onEnter() {
            L.setFlag("ms_stroud_knows_sun");
          },
          responses: [{ text: "Hold fast." }],
        },
        alone: {
          text: "Your own way. [He almost smiles.] The old ferryman at the Battery, I suppose, and whatever is eating his boats. Very well. The Covenant does not beg. If you change your mind before you cross, my door is the one with the guns in front of it.",
          onEnter() {
            if (!faction()) L.setFlag("mq_faction", "none");
            if (Q.isActive("mq04")) Q.complete("mq04");
          },
          responses: [{ text: "Hold fast, Commander." }],
        },
        return: {
          text: "Is that it? [He takes the humming core in both gauntlets and turns it over slowly.] It's warm. Machines shouldn't be warm. ...Keep it. The Array wants its key and its core in the same pair of hands, and yours have earned it. Take this as well.",
          onEnter() {
            if (!L.flag("stroud_rewarded")) {
              L.setFlag("stroud_rewarded");
              L.give("q_reel_codex_override", 1);
              L.give(["ticker_tape", SH.gyroCarbine], 1);
              L.give(SH.gyroRounds, 40);
            }
          },
          responses: [
            { text: "What's the plan for Liberty Island?", next: "plan" },
          ],
        },
        plan: {
          text: "When you are ready to cross, my Lancers will be waiting at the Battery Park pier. The old fellow who runs the ferry has agreed to carry us, after a very convincing conversation involving a rotary cannon. On the island we hit the Continuity hard. You find Marlow and the torch controls. The Charter Override on that reel hands the Array to us.",
          responses: [
            {
              text: "Understood. Hold fast.",
              action: () => {
                if (Q.isActive("mq05")) Q.complete("mq05");
              },
            },
          ],
        },
        again: {
          text: () =>
            L.flag("ending_played")
              ? "The Continuity is broken. Whatever else happened on that island, sleeper... you did that. The Covenant remembers."
              : "Sleeper. The Covenant has a long memory. Make sure it remembers you kindly.",
          responses: [
            {
              text: "Anything I should know before I cross?",
              next: "intel",
              cond: () =>
                faction() === "covenant" && !L.flag("ms_stroud_intel"),
            },
            { text: "Hold fast." },
          ],
        },
        traitor: {
          text: "You've been seen with the Continuity, sleeper. You are tolerated on this plaza because my Archivist asked me nicely. Do not make her regret it.",
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    // ---------------- Archivist Ingrid Wexler ----------------
    const wexlerTrusts = () =>
      faction() === "covenant" ||
      Q.isStarted("sq_overdue") ||
      !!L.flag("wexler_promise");
    L.dialogue("dlg_cov_wexler", {
      start: () =>
        Q.stage("sq_overdue") === "return"
          ? "return"
          : L.flag("met_wexler")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Oh — hello! Archivist Ingrid Wexler. Please don't touch the gyrojets, they're catalogued. You're the sleeper? From 1967? A real one? Did you read the papers before you went under? What did a fresh newspaper SMELL like?",
          onEnter() {
            L.setFlag("met_wexler");
          },
          responses: [
            {
              text: "Ink and cigarettes. I mostly read civil-defense pamphlets.",
              next: "pamphlets",
            },
            { text: "You seem excited about books.", next: "books" },
            { text: "What does an Archivist do?", next: "archivist" },
          ],
        },
        pamphlets: {
          text: "\"Duck, Cover and Keep Smiling!\" I have that one. It's a masterpiece of denial. The Office of Civil Defense should have won a prize for copywriting, right before Europe's bombers made the point moot.",
          responses: [{ text: "You seem to need books.", next: "books" }],
        },
        archivist: {
          text: "We preserve knowledge. The Lancers protect it with guns; we protect it with footnotes. Honestly, the footnotes do more damage.",
          responses: [{ text: "Any work for a sleeper?", next: "books" }],
        },
        books: {
          text: "I need three specific books from the Public Library on 42nd: a cold fusion text, an Exo-rig servicing manual, and — don't laugh — a home-mechanic's guide to Rotorcraft. The Library's full of Maniacs. The Lancer-Commander won't spare a squad for \"homework.\" Would you?",
          responses: [
            {
              text: "I'll get your books.",
              cond: () => !Q.isStarted("sq_overdue"),
              action: () => Q.start("sq_overdue"),
            },
            {
              text: "What's in it for me?",
              next: "pay",
              cond: () => !Q.isStarted("sq_overdue"),
            },
            { text: "Tell me about the Knickerbocker Array.", next: "array" },
            { text: "Not right now." },
          ],
        },
        pay: {
          text: "Scrip — a hundred and fifty. Gyrojet rockets. And the eternal gratitude of an Archivist, which is worth absolutely nothing in trade but is very sincere.",
          responses: [
            { text: "Deal.", action: () => Q.start("sq_overdue") },
            { text: "Maybe later." },
          ],
        },
        array: {
          text: "[She lowers her voice.] I've read the Atlas Power papers. Knickerbocker was built to scrub radiation out of the air. The whole city. No more ash-storms, no more burning rain. The Lancer-Commander thinks every machine is a bomb. Some of them are just... medicine.",
          onEnter() {
            L.setFlag("wexler_array_talk");
          },
          responses: [
            {
              text: "If I get the chance, I'll turn it on.",
              standing: 2,
              next: "promise",
            },
            { text: "Stroud might be right.", next: "maybe" },
          ],
        },
        promise: {
          text: "Then... then I'll be listening to Rocky Delgado every night until I hear that you did. Don't tell the Commander I said this. Please.",
          onEnter() {
            L.setFlag("wexler_promise");
          },
          responses: [{ text: "Your secret's safe." }],
        },
        maybe: {
          text: "He might. He usually is. That's the worst thing about him.",
          responses: [{ text: "Goodbye, Archivist." }],
        },
        again: {
          text: () =>
            Q.stage("sq_overdue") === "books"
              ? "Any luck at the library? " +
                bookCount() +
                " of 3 — oh, I'm keeping count, sorry, it's an Archivist thing."
              : "Sleeper! Have you read anything good lately? Anything at all? I would kill for the back of a Freedom Flakes box. Figuratively.",
          responses: [
            {
              text: "About those books...",
              next: "books",
              cond: () => !Q.isStarted("sq_overdue"),
            },
            { text: "Tell me about the Knickerbocker Array.", next: "array" },
            {
              text: "Could I read the Hold's records?",
              next: "records",
              cond: () => wexlerTrusts(),
            },
            {
              text: "I'm a historian of sorts. Twenty-two years behind. Could I read the Hold's records?",
              check: { attr: "presence", value: 5 },
              next: "records",
              failNext: "records_no",
              cond: () => !wexlerTrusts(),
            },
            { text: "See you around." },
          ],
        },
        records: {
          text: "The Chronicle teletype by the rink? It's mostly memos. Very cross memos. [She glances toward the Commander.] The passcode is EXCELSIOR. The Commander chose it — it's the state motto. He thinks it's Latin for \"keep out.\" I have never corrected him.",
          learn: LOCKS.cov.id,
          onEnter() {
            learn(LOCKS.cov.id);
          },
          responses: [{ text: "Thank you, Archivist." }],
        },
        records_no: {
          text: "I'm sorry. The Chronicle is for members. Bring me a book and we'll talk. Any book. Please bring me a book.",
          responses: [{ text: "I'll see what I can do." }],
        },
        return: {
          text: 'Is that — all three? "Practical Cold Fusion"! And the Exo-rig manual — oh, there\'s a coffee ring on page forty, somebody actually USED it. And "Rotorcraft for the Home Mechanic." [She hugs the book.] I\'ve wanted this one since I was eight.',
          responses: [
            {
              text: "Happy reading, Archivist.",
              action: () => finishOverdue(false),
            },
            {
              text: "These were dangerous to get. The fee should reflect that.",
              check: { skill: "trade", value: 50 },
              next: "haggle",
              failNext: "haggle_fail",
            },
          ],
        },
        haggle: {
          text: "You're... right. The Maniacs. Of course. [She counts out extra scrip from a very small purse.] Two hundred and fifty. Please don't tell the quartermaster where it came from.",
          onEnter() {
            L.setFlag("overdue_haggled");
          },
          responses: [
            {
              text: "Pleasure doing business.",
              action: () => finishOverdue(true),
            },
          ],
        },
        haggle_fail: {
          text: "I'm an Archivist. I'm paid in ration bars and disappointment. A hundred and fifty is everything I have.",
          responses: [
            { text: "Fair enough.", action: () => finishOverdue(false) },
          ],
        },
      },
    });
    function finishOverdue(extra) {
      for (const b of BOOKS) L.take(b.id, 1);
      L.setFlag("overdue_done");
      if (extra) L.giveScrip(100);
      Q.complete("sq_overdue");
      L.news(
        "Culture corner, folks: three books went BACK INTO a library this week. A library! I know! The Covenant's own Archivist Wexler reportedly wept. Returned by our friend the sleeper, no late fees charged — and after twenty-two years, brother, those fees would've been a heavyweight.",
      );
    }

    // ---------------- Lancer Tobias Reyes (quartermaster) ----------------
    L.dialogue("dlg_cov_reyes", {
      start: () => (Q.stage("sq_exchange") === "report" ? "report" : "hello"),
      nodes: {
        hello: {
          text: () =>
            "Lancer Reyes, quartermaster. " +
            (faction() === "covenant"
              ? "Commander says you're with us now. That means you get the good prices — which are the same as the bad prices, but I say them nicer."
              : "I trade with outsiders when the Commander says so. The Commander says so. Make it quick."),
          responses: [
            { text: "Show me what you've got.", barter: true },
            {
              text: "Any bounties?",
              next: "bounty",
              cond: () => !Q.isStarted("sq_exchange"),
            },
            { text: "What's it like in the Covenant?", next: "life" },
            { text: "Nothing, thanks." },
          ],
        },
        life: {
          text: "Early mornings. Heavy rigs. A lot of speeches about the Charter. You get used to it. Then one day you catch yourself giving the speech to some Acolyte, and you realise it's been used to you all along.",
          responses: [
            {
              text: "Any bounties?",
              next: "bounty",
              cond: () => !Q.isStarted("sq_exchange"),
            },
            { text: "Thanks." },
          ],
        },
        bounty: {
          text: "There's a raider on Wall Street. Calls herself Bear Market Betty. Runs the Exchange like a protection racket — every convoy going south pays her or burns. The Commander wants her gone, or wants proof of the racket so he can justify a raid to the Warden. Her ledger would do it. Three hundred for her head, one-fifty for the book.",
          responses: [
            { text: "Consider it done.", action: () => Q.start("sq_exchange") },
            { text: "Maybe later." },
          ],
        },
        report: {
          text: () =>
            L.flag("betty_dead")
              ? "Betty's done? [He checks a list.] Confirmed by our scouts. The Exchange is leaderless and the southern convoys are already talking. Here's your three hundred. Hold fast."
              : "Her ledger. \"Liabilities: Kevin.\" ...Who's Kevin? Doesn't matter. This is enough to justify a raid. The Warden will be thrilled. Here's one-fifty.",
          responses: [
            {
              text: "Pleasure.",
              action: () => {
                L.giveScrip(L.flag("betty_dead") ? 300 : 150);
                if (!L.flag("betty_dead")) L.take("q_note_betty_ledger", 1);
                L.setFlag("sq_exchange_done");
                Q.complete("sq_exchange");
                L.news(
                  L.flag("betty_dead")
                    ? "Market report: the Exchange on Wall Street is under new management, by which I mean no management, by which I mean Bear Market Betty is dead. Convoys heading south, you can breathe a little easier."
                    : "Word from Wall Street: the Iron Covenant is planning a little audit of the Exchange. I don't think Bear Market Betty's going to like the numbers.",
                );
              },
            },
          ],
        },
      },
    });

    // ---------------- Lieutenant Vesper Hale (the Continuity) ----------------
    L.dialogue("dlg_con_hale", {
      start: () => {
        if (Q.stage("mq05") === "return_con" && L.has("q_knickerbocker_core"))
          return "return";
        if (faction() === "covenant") return "enemy";
        if (Q.isActive("mq04")) return L.flag("met_hale") ? "pitch" : "first";
        return "again";
      },
      nodes: {
        first: {
          text: "Hold your fire! ...Cryo Unit C-9. You're exactly who we've been waiting for. Lieutenant Vesper Hale, United States Government, Continuity Division. Please don't reach for the pistol — my soldiers have orders not to shoot you, and they have signed for those orders in triplicate.",
          onEnter() {
            L.setFlag("met_hale");
          },
          responses: [
            { text: "You have Zeke Marlow.", next: "zeke" },
            { text: "What does the Continuity want with me?", next: "want" },
            { text: '"The Continuity"? Continuity of what?', next: "gov" },
          ],
        },
        gov: {
          text: "Of government, sir. Of the United States of America, which did not stop existing because somebody dropped a bomb on Yonkers. It is March of 1967. Acting President Marsh has extended March by executive order until the emergency is over. We never stopped governing. The country just stopped answering the phone.",
          responses: [
            { text: "You have Zeke Marlow.", next: "zeke" },
            { text: "What do you want with me?", next: "want" },
          ],
        },
        zeke: {
          text: "Mr. Marlow is a guest of the federal government on Liberty Island. He is safe, fed, and remarkably rude. He helped build something before he went into the freezer — something that will clean the air of this entire city. He is helping us finish it. You could help, too.",
          responses: [{ text: "What do you want?", next: "want" }],
        },
        pitch: {
          text: () =>
            "Have you decided, " +
            mister() +
            "? The Colonel isn't a patient man, but I've been told I'm a persuasive woman.",
          responses: [
            { text: "Remind me of the offer.", next: "want" },
            { text: "Clean the air for whom, exactly?", next: "whom" },
            {
              text: "Where did you grow up, Lieutenant?",
              next: "home",
              cond: () => !L.flag("ms_hale_home"),
            },
            {
              text: "Did you ever hear about the Candle Lady?",
              next: "mother",
              cond: () =>
                !!L.flag("ms_hale_home") &&
                !L.flag("ms_hale_mother") &&
                (Q.isComplete("mq09") || !!L.flag("ms_rose_revealed")),
            },
            {
              text: "[Play Directive 7-A for her.]",
              cond: () =>
                L.has("q_reel_directive_7a") &&
                !L.flag("hale_knows") &&
                !L.flag("hale_defects"),
              next: "truth",
            },
            {
              text: "[Play Nell Brady's reels for her.]",
              cond: () => !!L.flag("ms_token_nell") && !L.flag("hale_defects"),
              next: "nell",
            },
            {
              text: "[Show her the Deed Ledger.]",
              cond: () =>
                L.flag("ms_deed_ledger") === "kept" && !L.flag("hale_defects"),
              next: "deed",
            },
            { text: "I'll find my own way across.", next: "alone" },
            { text: "Not yet." },
          ],
        },
        want: {
          text: "You carry the Liberty Key — authorization cartridge C9-A. Without it the Array won't accept a program. Colonel Crane also needs an ignition core, which the Brutes dragged up the Empire State Building. Bring the core to me, and the Colonel will fly you to Liberty by Rotorcraft, reunite you with Mr. Marlow, and let you watch the sky turn blue. There will be some forms.",
          responses: [
            { text: "Clean the air for whom, exactly?", next: "whom" },
            { text: "Fine. I'll get your core.", next: "join" },
            { text: "I'll find my own way across.", next: "alone" },
            { text: "I'll never work for the Continuity.", next: "refuse" },
          ],
        },
        whom: {
          text: "For Americans. [A beat.] For citizens. For everyone on the rolls. That's what I was told, and it's what I believe.",
          onEnter() {
            L.setFlag("hale_evasive");
          },
          responses: [
            {
              text: '"On the rolls." Does that include the Neon? They burned their cards.',
              check: { skill: "persuasion", value: 50 },
              next: "doubt",
              failNext: "doubt_fail",
            },
            {
              text: "[Play Directive 7-A for her.]",
              cond: () =>
                L.has("q_reel_directive_7a") && !L.flag("hale_defects"),
              next: "truth",
            },
            {
              text: "[Play Nell Brady's reels for her.]",
              cond: () => !!L.flag("ms_token_nell") && !L.flag("hale_defects"),
              next: "nell",
            },
            {
              text: "[Show her the Deed Ledger.]",
              cond: () =>
                L.flag("ms_deed_ledger") === "kept" && !L.flag("hale_defects"),
              next: "deed",
            },
            {
              text: "Alright. I'll get your core.",
              next: "join",
              cond: () => !faction(),
            },
            {
              text: "I don't trust you.",
              next: "refuse",
              cond: () => !faction(),
            },
            { text: "Never mind.", cond: () => !!faction() },
          ],
        },
        doubt: {
          text: "[She hesitates for exactly one second too long.] ...I'd have to ask the Colonel. I will ask the Colonel. [Quieter.] There's a command teletype in the lobby behind me. If there were something I should know, it would be on there. Requisitions set every passcode to TRIPLICATE — I'm only telling you so you know how this outfit thinks. I wouldn't know what's on it. My clearance doesn't go that high.",
          learn: LOCKS.un.id,
          onEnter() {
            L.setFlag("hale_doubts_1");
            L.xp(20, "Persuasion");
            learn(LOCKS.un.id);
          },
          responses: [
            { text: "Maybe you should find out." },
            { text: "I'll get your core.", next: "join" },
          ],
        },
        doubt_fail: {
          text: "Every citizen counts. That's what makes them citizens. [She says it very quickly, like a pledge.]",
          responses: [
            { text: "I'll get your core.", next: "join" },
            { text: "I'll think about it." },
          ],
        },
        truth: {
          text: "[The reel plays. Hale's helmet lamps flicker as she listens. When the line \"keep this reel away from Lieutenant Hale\" plays, she takes the helmet off entirely. She's younger than you expected.] ...Everyone not on the 1967 rolls. Do you know who that is? That's everyone born since. I was born in the spring of '71, in a basement on Tudor Place. [She stares at the UN tower.] They said \"restoring the census.\" They said it to me and I said it to you. I need to think. Whatever you decide to do out there — I won't stand in your way.",
          onEnter() {
            L.setFlag("hale_knows");
            L.standing(50, "Told Hale the truth");
            L.xp(50, "The truth about Directive 7-A");
          },
          responses: [
            { text: "Come with me. Help me stop Crane.", next: "defect" },
            { text: "Do the right thing, Lieutenant.", next: "defect" },
          ],
        },
        nell: {
          text: '[Nell Brady\'s voice comes out of the reel, fast and close, a reporter whispering in a madhouse: "Marsh says tomorrow. Move the rolls to Liberty tonight. No public notice." The date on the box is the fourth of March, 1967. Hale plays the last ten seconds three times.] The day before. They knew the day before, and they moved the paper. [She takes her helmet off.] My mother was on the wrong side of that door. So was everybody I grew up with.',
          onEnter() {
            L.setFlag("hale_knows");
            L.incFlag("hale_doubts", 1);
            L.xp(50, "Nell Brady's reels");
          },
          responses: [
            { text: "Help me stop Crane.", next: "defect" },
            { text: "Do the right thing, Lieutenant.", next: "defect" },
          ],
        },
        deed: {
          text: "[She turns the ledger's pages with one gauntlet finger until she finds it: the whole island of Manhattan, conveyed to the Office of Civil Defense for one dollar, recorded on the fourth of March, 1967.] One dollar. The day before. Somebody sold the city to the Office the day before the city burned. [Quietly.] I have been guarding the receipt.",
          onEnter() {
            L.setFlag("hale_knows");
            L.incFlag("hale_doubts", 1);
            L.xp(50, "The Deed Ledger");
          },
          responses: [
            { text: "Help me stop Crane.", next: "defect" },
            { text: "Do the right thing, Lieutenant.", next: "defect" },
          ],
        },
        defect: {
          text: () =>
            "[She puts the helmet back on.] Not with you. Not yet. But when you hit Liberty, the Sky-Eye net will go down at exactly the wrong moment for the Colonel. Call it a technical fault. I'll call it my oath. There are others in this building who read the same papers I did. When the time comes, we'll stand where you need us." +
            (L.flag("ms_rose_revealed")
              ? " [A pause.] And tell Flint, or whatever her name is now, that she can keep the book."
              : ""),
          onEnter() {
            haleDefects();
          },
          responses: [{ text: "Thank you, Vesper." }],
        },
        home: {
          text: "Tudor Place. A basement, then a third floor when the basement flooded. There was a girl two doors down who read everything she could carry and returned nothing. I still want my book back. [She almost smiles.] It was a good street for a while. Everyone on it was born after the bombs, so nobody on it was on anybody's list.",
          onEnter() {
            L.setFlag("ms_hale_home");
          },
          responses: [
            {
              text: "Did you ever hear about the Candle Lady?",
              next: "mother",
              cond: () => Q.isComplete("mq09") || !!L.flag("ms_rose_revealed"),
            },
            { text: "Thank you, Lieutenant." },
          ],
        },
        mother: {
          text: "[Her voice drops out of the recruiting register.] My mother was a Camp kid. She said the Candle Lady didn't die in the riot. The sun people carried her off breathing. [She clears her throat.] Camp kids tell a lot of stories. That one she told until she died.",
          onEnter() {
            L.setFlag("ms_hale_mother");
            L.setFlag("ms_heard_candle_lady_breathing");
          },
          responses: [{ text: "Thank you for telling me." }],
        },
        alone: {
          text: () =>
            "Your own way. With the ferryman, I suppose, and his crabs. [She sighs.] I won't stop you, " +
            mister() +
            ". Nobody here will shoot at you while I can help it. The Colonel wants you cooperative, and I'd rather you were alive.",
          onEnter() {
            if (!faction()) L.setFlag("mq_faction", "none");
            if (Q.isActive("mq04")) Q.complete("mq04");
          },
          responses: [{ text: "Thank you, Lieutenant." }],
        },
        join: {
          text: "Excellent. Welcome to the federal government; your paperwork has already been filed. The Empire State Building is on 34th Street — follow the smell. Take these; the Colonel likes his guests alive. When you have the core, come back to me and I'll call in a Rotorcraft.",
          onEnter() {
            L.setFlag("mq_faction", "continuity");
            // Real allegiance change: the Continuity stops shooting at you city-wide.
            L.factionTruce(SH.conFaction, undefined, undefined, 0, false);
            if (Q.isActive("mq04")) Q.complete("mq04");
            L.give("q_note_continuity_orders", 1);
            L.give(SH.tonic, 3);
            L.give(SH.gyroRounds, 24);
            L.standing(-100, "Signed on with the Continuity");
            if (L.ms) L.ms.addTrust(-1, "You signed on with the Continuity.");
          },
          responses: [{ text: "See you soon, Lieutenant." }],
        },
        refuse: {
          text: "That's... disappointing. You have until you leave the plaza before my soldiers remember their training. I'd walk quickly.",
          onEnter() {
            L.setFlag("con_refused");
          },
          responses: [{ text: "[Leave.]" }],
        },
        return: {
          text: "The core. [She doesn't touch it. Nobody in the Continuity seems to want to touch it.] Keep it; the Array wants it in your hands with the key. When you are ready to cross, the Rotorcraft will be fuelled on the plaza. The Colonel asked me to give you this reel for the Array: his program. Don't play it. It's just procedure.",
          onEnter() {
            if (!L.flag("hale_rewarded")) {
              L.setFlag("hale_rewarded");
              L.give("q_reel_directive_7a", 1);
              L.give(SH.gyroPistol, 1);
              L.give(SH.gyroRounds, 30);
            }
          },
          responses: [
            {
              text: "When I'm ready, Lieutenant.",
              action: () => {
                if (Q.isActive("mq05")) Q.complete("mq05");
              },
            },
            { text: "What if I play it anyway?", next: "playit" },
          ],
        },
        playit: {
          text: "Then you'll hear a lot of numbers and a lot of section headings, and you'll be as bored as I was when they briefed me. [She almost smiles.] Go on. Finish whatever you have to finish. The Colonel will wait. He has been waiting since 1967.",
          responses: [
            {
              text: "Until then.",
              action: () => {
                if (Q.isActive("mq05")) Q.complete("mq05");
              },
            },
          ],
        },
        again: {
          text: () =>
            faction() === "continuity"
              ? mister() + ". The Colonel sends his regards. In triplicate."
              : L.flag("con_refused")
                ? "I told you to walk quickly."
                : "Good day, citizen. Remember: it is 1967, and America is listening.",
          responses: [
            {
              text: "Where did you grow up, Lieutenant?",
              next: "home",
              cond: () => !L.flag("ms_hale_home"),
            },
            {
              text: "Did you ever hear about the Candle Lady?",
              next: "mother",
              cond: () =>
                !!L.flag("ms_hale_home") &&
                !L.flag("ms_hale_mother") &&
                (Q.isComplete("mq09") || !!L.flag("ms_rose_revealed")),
            },
            {
              text: "[Play Directive 7-A for her.]",
              cond: () =>
                L.has("q_reel_directive_7a") &&
                !L.flag("hale_knows") &&
                !L.flag("hale_defects"),
              next: "truth",
            },
            {
              text: "[Play Nell Brady's reels for her.]",
              cond: () => !!L.flag("ms_token_nell") && !L.flag("hale_defects"),
              next: "nell",
            },
            {
              text: "[Show her the Deed Ledger.]",
              cond: () =>
                L.flag("ms_deed_ledger") === "kept" && !L.flag("hale_defects"),
              next: "deed",
            },
            { text: "[Leave.]" },
          ],
        },
        enemy: {
          text: "You threw in with the boilers at Rockefeller. That's your right. It's also my right to ask you to leave before this conversation becomes a firefight.",
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    // ---------------- Pete Ruiz (captive) ----------------
    L.dialogue("dlg_esb_pete", {
      start: () => (L.flag("pete_rescued") ? "gone" : "hello"),
      nodes: {
        hello: {
          text: "Oh thank God, a person! A normal-sized person! Name's Pete Ruiz — I drive for Caldwell & Daughters. The Brutes grabbed me off Broadway four days ago. They keep asking each other if I'm \"ready.\" I don't want to find out what for.",
          responses: [
            {
              text: "[Cut him loose.] Run for the Flatiron. Hattie's worried sick.",
              standing: 50,
              next: "free",
            },
            { text: "What happened to your convoy?", next: "convoy" },
            { text: "What's on that teletype by the window?", next: "box" },
            { text: "What's it worth to you?", next: "worth" },
          ],
        },
        convoy: {
          text: "Raiders hit us at Madison Square — took Dolly's strongbox and ran south to the Woolworth. Then, while I was hiding, the Brutes found me. Worst day of my life, and I once ate Moe's tunnel shrimp.",
          onEnter() {
            if (Q.stage("sq_wagon") === "wreck")
              Q.setStage("sq_wagon", "woolworth");
          },
          responses: [
            {
              text: "[Cut him loose.] Go. Get to the Flatiron.",
              standing: 50,
              next: "free",
            },
          ],
        },
        box: {
          text: 'The big one, the king? He types on it with one finger. Every time, he yells the word at it first: "KONGISKING!" One word, real loud. I think he thinks it\'s a secret. Please — the ropes?',
          learn: LOCKS.esb.id,
          onEnter() {
            learn(LOCKS.esb.id);
          },
          responses: [
            {
              text: "[Cut him loose.] Go. Get to the Flatiron.",
              standing: 50,
              next: "free",
            },
            { text: "What's it worth to you?", next: "worth" },
          ],
        },
        worth: {
          text: "Worth? I got twenty-two scrip and a lucky rabbit's foot. The rabbit's foot hasn't been very lucky lately. Take 'em both, just get me out of here!",
          responses: [
            {
              text: "[Take the scrip and cut him loose.]",
              standing: -15,
              action: () => L.giveScrip(22),
              next: "free",
            },
            {
              text: "[Cut him loose.] Keep your scrip.",
              standing: 60,
              next: "free",
            },
          ],
        },
        free: {
          text: "You're a saint. A saint in a cryo suit! I'm gone — I'm so gone! Tell Hattie I'm coming home!",
          onEnter() {
            L.setFlag("pete_rescued");
            L.xp(50, "Rescued Pete Ruiz");
            L.later(1.5, () => L.removeNPC("esb_pete"));
            L.news(
              "A convoy driver named Pete Ruiz stumbled into the Flatiron Trading Post today, three days overdue and very, very pale. Says a sleeper in a grey suit cut him loose from a Brute larder in the Empire State. Welcome home, Pete.",
            );
          },
          responses: [{ text: "Go!" }],
        },
        gone: { text: "...", responses: [{ text: "[Leave.]" }] },
      },
    });

    // ---------------- KONG ----------------
    L.dialogue("dlg_esb_kong", {
      start: () =>
        L.flag("kong_friend")
          ? "friend"
          : L.flag("kong_resolution")
            ? "after"
            : L.flag("met_kong")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "KONG",
          text: "SMALL HUMAN! STOP! [The floor shakes as something enormous and grey-violet turns around. It wears a bent traffic light as a crown.] KONG SEES YOU. KONG IS KING OF THE EMPIRE. EMPIRE IS TALLEST. THEREFORE KONG IS TALLEST KING. WHY IS SMALL HUMAN IN KONG'S EMPIRE?",
          onEnter() {
            L.setFlag("met_kong");
          },
          responses: [
            { text: "I've come for the shiny rock.", next: "rock" },
            {
              text: "A king deserves tribute, not a rock. I'll take it off your hands, your majesty.",
              check: { skill: "persuasion", value: 60 },
              next: "speech",
              failNext: "speech_fail",
            },
            {
              text: "That rock is radioactive. It's been making you smaller.",
              check: { attr: "wits", value: 7 },
              next: "trick",
              failNext: "trick_fail",
            },
            {
              text: "I brought you a queen. [Present Fay.]",
              cond: () => L.has("q_fay_mannequin"),
              next: "queen",
            },
            { text: "What do you type on the talking box?", next: "box" },
            {
              text: "What do you look at through that tube by the window?",
              next: "look",
              cond: () => !L.flag("ms_kong_told"),
            },
            { text: "Your reign is over, Brute.", next: "fight" },
          ],
        },
        again: {
          text: "SMALL HUMAN IS BACK. DID SMALL HUMAN BRING QUEEN?",
          responses: [
            {
              text: "I brought you a queen. [Present Fay.]",
              cond: () => L.has("q_fay_mannequin"),
              next: "queen",
            },
            { text: "About the shiny rock...", next: "rock" },
            {
              text: "That rock is radioactive. It's been making you smaller.",
              check: { attr: "wits", value: 7 },
              next: "trick",
              failNext: "trick_fail",
              cond: () => !L.flag("kong_trick_failed"),
            },
            { text: "What do you type on the talking box?", next: "box" },
            {
              text: "What do you look at through that tube by the window?",
              next: "look",
              cond: () => !L.flag("ms_kong_told"),
            },
            { text: "Not yet." },
            { text: "Your reign is over, Brute.", next: "fight" },
          ],
        },
        box: {
          text: 'KONG TELLS TALKING BOX SECRET WORD. SECRET WORD IS "KONGISKING." THEN TALKING BOX OPENS. NOBODY ELSE KNOWS SECRET WORD. [He taps the side of his nose. This takes a while.] NOW SMALL HUMAN KNOWS. SMALL HUMAN TELLS NOBODY.',
          learn: LOCKS.esb.id,
          onEnter() {
            learn(LOCKS.esb.id);
          },
          responses: [{ text: "Your secret's safe with me." }],
        },
        rock: {
          text: "SHINY ROCK IS KONG'S. SHINY ROCK HUMS FOR KONG. HUMMING MEANS IT LIKES KONG. KONG WILL TRADE SHINY ROCK ONLY FOR... [he leans in; his breath could strip paint] ...A QUEEN. SMALL. PRETTY. DOES NOT SCREAM.",
          onEnter() {
            L.setFlag("kong_wants_queen");
            L.refresh("mq05");
          },
          responses: [
            {
              text: "Where would I find a queen who doesn't scream?",
              next: "where",
            },
            { text: "Why do all your queens scream?", next: "scream" },
            { text: "Forget it. I'll take the rock by force.", next: "fight" },
          ],
        },
        scream: {
          text: 'KONG DOES NOT KNOW. KONG SAYS "HELLO, PRETTY." THEY SCREAM. KONG SAYS "PLEASE DO NOT SCREAM." THEY SCREAM MORE. KONG IS VERY SAD ABOUT THIS. KONG HAS BIG FEELINGS.',
          responses: [
            { text: "Where could I find one who won't scream?", next: "where" },
          ],
        },
        where: {
          text: "BIG STORE WITH RED CROWN. CROWN LIKE KONG'S. MANY SMALL PRETTY HUMANS STANDING VERY STILL. THEY NEVER RUN. THEY NEVER SCREAM. KONG WENT THERE. SCREAMING MEN BIT KONG. KONG DOES NOT GO THERE NOW.",
          responses: [{ text: "I'll see what I can do." }],
        },
        speech: {
          text: "TRIBUTE... [He scratches his crown.] KINGS GET TRIBUTE. KONG IS KING. SO KONG... GIVES... NO. KONG GETS. BUT SMALL HUMAN SAYS KONG... [His face works through several expressions.] TAKE ROCK. TAKE IT BEFORE KONG UN-CONFUSES.",
          onEnter() {
            kongGives("speech");
            L.xp(60, "Persuasion: Royal tribute");
          },
          responses: [{ text: "Long live the king." }],
        },
        speech_fail: {
          text: 'SMALL HUMAN USES BIG WORDS. KONG DOES NOT LIKE BIG WORDS. KONG LIKES SMALL WORDS. LIKE "SQUISH."',
          responses: [
            { text: "Let's talk about the rock.", next: "rock" },
            { text: "Okay, okay. I'm going." },
          ],
        },
        trick: {
          text: "ROCK MAKES KONG... SMALL? [He stares at his enormous hands. He holds them further away. He holds them closer.] ...KONG FELT SMALLER THIS MORNING. TAKE IT! TAKE IT AWAY FROM KONG!",
          onEnter() {
            kongGives("trick");
            L.xp(60, "Wits: Size matters");
            L.standing(-10, "Lied to a lonely Brute");
          },
          responses: [{ text: "Glad I could help." }],
        },
        trick_fail: {
          text: "KONG IS NOT SMALLER. KONG MEASURED HIMSELF AGAINST DOOR. DOOR IS SMALLER. SMALL HUMAN IS LIAR.",
          onEnter() {
            L.setFlag("kong_trick_failed");
          },
          responses: [{ text: "Worth a try." }],
        },
        queen: {
          text: "[You set the mannequin down. Kong goes very, very still. He kneels — the floor groans — and very gently touches the scorched evening gown with one enormous finger.] ...SHE IS PERFECT. SHE DOES NOT SCREAM. SHE DOES NOT RUN. SHE IS... FAY. KONG WILL CALL HER FAY. KONG IS IN LOVE.",
          onEnter() {
            L.take("q_fay_mannequin", 1);
            L.setFlag("kong_friend");
            L.setFlag("ms_kong", "friend");
            kongGives("queen");
            L.give("q_kong_crown", 1);
            L.standing(75, "Found a king his queen");
            L.xp(100, "Royal wedding");
          },
          responses: [{ text: "You two make a lovely couple.", next: "crown" }],
        },
        crown: {
          text: "SMALL FRIEND TAKE SHINY ROCK. AND TAKE OLD CROWN. KONG HAS NEW CROWN NOW. [He gestures at Fay.] SHE IS KONG'S CROWN. [He sniffs, enormously.] KONG HAS BIG FEELINGS.",
          responses: [{ text: "Goodbye, Kong." }],
        },
        fight: {
          text: "THEN SMALL HUMAN WILL BE SMALL PANCAKE! KONG SMASH!",
          onEnter() {
            L.setFlag("kong_hostile");
            L.hostile("esb_kong", true);
            L.factionTruce(SH.bruteFaction, ESB.x, ESB.z, 120, true);
          },
          responses: [{ text: "[Fight!]" }],
        },
        friend: {
          speaker: "KONG",
          text: () =>
            [
              "SMALL FRIEND! FAY SAYS HELLO. FAY DOES NOT SAY IT OUT LOUD. KONG HEARS IT.",
              "KONG AND FAY ARE VERY HAPPY. KONG ONLY SMASHES BAD HUMANS NOW. MOSTLY.",
              'KONG IS WRITING POEM FOR FAY. IT IS ALL ONE WORD. THE WORD IS "FAY."',
            ][Math.floor(Math.random() * 3)],
          responses: [
            { text: "Good to see you, Kong." },
            { text: "What's the word for the talking box again?", next: "box" },
            {
              text: "What do you look at through that tube by the window?",
              next: "look",
              cond: () => !L.flag("ms_kong_told"),
            },
          ],
        },
        after: {
          text: "SMALL HUMAN HAS SHINY ROCK. KONG IS STILL KING. KONG IS KING OF SLIGHTLY LESS.",
          responses: [
            { text: "What do you type on the talking box?", next: "box" },
            {
              text: "What do you look at through that tube by the window?",
              next: "look",
              cond: () => !L.flag("ms_kong_told"),
            },
            { text: "[Leave.]" },
          ],
        },
        look: {
          speaker: "KONG",
          text: "LOOKING-TUBE! [He pats a brass telescope bolted to the window frame, bent where he once sat on it.] KONG LOOKS AT CITY ALL NIGHT. KINGS WATCH KINGDOM. [He swings it east with one finger.] TRAIN HOUSE. BIG ROOF, GREEN. SUN LADY LIVE UNDER TRAIN HOUSE. KONG SEE HER CANDLES GO DOWN THE HOLE EVERY NIGHT. KONG COUNT CANDLES. KONG GOOD AT COUNTING. ONE. MANY.",
          onEnter() {
            L.setFlag("ms_kong_told");
            L.xp(25, "KONG's night watch");
            if (Q.isActive("mq05")) L.refresh("mq05");
          },
          responses: [
            { text: "Who is the sun lady?", next: "look2" },
            { text: "Thank you, your majesty." },
          ],
        },
        look2: {
          speaker: "KONG",
          text: "LADY WITH SHINY GOLD FACE. NOT REAL FACE. KONG KNOWS REAL FACES. [He frowns, enormously.] KONG TOLD SMALL HUMANS. SMALL HUMANS LAUGH. NOBODY BELIEVE BRUTES. [He looks at you sideways.] SMALL FRIEND BELIEVE KONG?",
          responses: [
            {
              text: "I believe you, Kong.",
              action: () => {
                L.setFlag("ms_kong_believed");
              },
            },
            { text: "Gold face. Got it." },
          ],
        },
      },
    });
  });
