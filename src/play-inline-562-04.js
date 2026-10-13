// play-inline-562 04 — next
// Lines 769-1431 of readable/play-inline-562.pretty.js (statement-aligned).
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
