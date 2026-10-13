// play-inline-285 05 — next
// Lines 628-1096 of readable/play-inline-285.pretty.js (statement-aligned).
  function defineDialogue() {
    if (G.isStub("dialogue") || typeof G.dialogue.register !== "function")
      return;
    const R = (id, tree) =>
      P.safe("dlg:" + id, () => G.dialogue.register(id, tree));
    const left = () =>
      [
        !(F.bookGiven || has("pt_prompt_book")),
        !(F.lightGiven || has("pt_es_klieg")),
      ].filter(Boolean).length;
    // ---------------- Barnaby Thistlewood (director, quest giver) ----------------
    R("dlg_pt_barnaby", {
      start: () =>
        qDone("pt_show")
          ? "after"
          : qStage("pt_show") === "showtime"
            ? "showtime"
            : qActive("pt_show")
              ? "progress"
              : F.metBarnaby
                ? "again"
                : "first",
      nodes: {
        first: {
          speaker: "Barnaby Thistlewood",
          onEnter: () => {
            F.metBarnaby = true;
          },
          text: "A patron! An actual, ambulatory patron! Forgive me — we get so few who arrive through the door rather than the ceiling. Barnaby Thistlewood, artistic director of the Lyceum Players. Welcome to the oldest legitimate theatre on Broadway. Mind the third row; it bites.",
          responses: [
            { text: "The Lyceum Players?", next: "troupe" },
            { text: "What are you performing?", next: "play" },
            { text: "You've all been in here since '67?", next: "stayed" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Barnaby Thistlewood",
          text: [
            "Back again! The house recognises you. Well — the house recognises everyone, it has been waiting twenty-two years for anyone.",
            "Ah, our patron returns. Have you reconsidered helping a poor company in distress?",
          ],
          responses: [
            { text: "Tell me about the play again.", next: "play" },
            { text: "What do you need?", next: "problem" },
            { text: "Goodbye.", end: true },
          ],
        },
        troupe: {
          speaker: "Barnaby Thistlewood",
          text: "Nineteen of us were in tech rehearsal on the fifth of March, 1967. We did not leave. The Bombing took our audience, our electricity and, in Mortimer's case, his sense of rhythm — but not our lines. We have performed every night since. The audiences have been... patchy.",
          responses: [
            { text: "What's the show?", next: "play" },
            { text: "Every night for twenty-two years?", next: "every" },
          ],
        },
        every: {
          speaker: "Barnaby Thistlewood",
          text: "Excepting the Great Burrow Rat Intermission of 1974, yes. Some nights to an empty house. Some nights to the rats. One unforgettable night to a Brute who wept at the wedding scene and then ate the usher. We have a new usher.",
          responses: [{ text: "And the play?", next: "play" }],
        },
        stayed: {
          speaker: "Barnaby Thistlewood",
          text: "Darling, the theatre has always been run by people too stubborn to leave. The Bombing simply gave us a very good excuse.",
          responses: [{ text: "Fair enough. What's playing?", next: "play" }],
        },
        play: {
          speaker: "Barnaby Thistlewood",
          text: '"Our Glowing Town." An original work, three acts. A small town in New Hampshire, after the end of the world: birth, love, marriage, radiation, and the dawning realisation that nobody ever notices their life while they\'re living it. I play the Stage Manager. I narrate. At length. It was supposed to open on the night of March fifth. We are running a touch late.',
          responses: [
            { text: "When's the premiere?", next: "problem" },
            { text: "Sounds lovely. Goodbye.", end: true },
          ],
        },
        problem: {
          speaker: "Barnaby Thistlewood",
          text: "Ah. There's the rub. We cannot open. Two catastrophes: first, the raiders who squat in the Port Authority terminal \"collected a toll\" from Tess last week — and the toll was our prompt book. The only complete script in existence. Second, Act Three needs a proper spotlight for Emily's farewell, and our last good lamp died in '83.",
          responses: [
            {
              text: "I'll get your book back — and find you a light.",
              next: "accept",
              action: () => qStart("pt_show", "gather"),
            },
            {
              text: "[Persuasion 50] A dangerous job. The patronage of the arts had better pay.",
              check: { skill: "persuasion", value: 50 },
              next: "pay",
              failNext: "payFail",
            },
            { text: "Not my problem.", next: "refuse" },
          ],
        },
        pay: {
          speaker: "Barnaby Thistlewood",
          text: "A critic AND a negotiator. Very well: the company will scrape together an additional hundred scrip, and you shall have the best seat in the house for life. The best seat is the one that doesn't bite.",
          onEnter: () => {
            F.bonusCaps = true;
          },
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => qStart("pt_show", "gather"),
            },
          ],
        },
        payFail: {
          speaker: "Barnaby Thistlewood",
          text: "Pay? My dear, we pay in ART. And the occasional scrip, when Mortimer hasn't drunk the float. We'll see what we can do.",
          responses: [
            {
              text: "Fine. I'll help.",
              next: "accept",
              action: () => qStart("pt_show", "gather"),
            },
            { text: "Forget it.", end: true },
          ],
        },
        refuse: {
          speaker: "Barnaby Thistlewood",
          text: "Of course, of course. The Ruins are full of things more important than theatre. Food. Water. Not being shot. I simply maintain that none of them are more INTERESTING.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        accept: {
          speaker: "Barnaby Thistlewood",
          text: 'Bravo! The Port Authority Bus Terminal is at Eighth and 41st — raiders, cages, a boss who styles himself "the Dispatcher". Our book will be wherever he keeps his treasure. As for light: the old Ed Sullivan Theater, north on Eighth. CBS\'s Studio 50. They kept Klieg lights like other people keep spoons. Unfortunately it is staffed entirely by robots who refuse to acknowledge the show is over.',
          responses: [{ text: "I'll be back.", end: true }],
        },
        progress: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            left() === 0
              ? "Is that — do you have — oh, don't keep an old ham in suspense!"
              : "Still " +
                left() +
                " thing" +
                (left() > 1 ? "s" : "") +
                " standing between us and opening night: the prompt book from the Port Authority raiders, and a Klieg light from Studio 50. We rehearse in the meantime. From memory. Badly.",
          responses: [
            {
              text: "Here's your prompt book.",
              cond: () => !F.bookGiven && has("pt_prompt_book"),
              next: "gotBook",
              action: () => {
                if (take("pt_prompt_book")) {
                  F.bookGiven = true;
                  xp(50, "Returned the prompt book");
                }
              },
            },
            {
              text: "I brought you a Klieg light.",
              cond: () => !F.lightGiven && has("pt_es_klieg"),
              next: "gotLight",
              action: () => {
                if (take("pt_es_klieg")) {
                  F.lightGiven = true;
                  xp(50, "Delivered the Klieg light");
                }
              },
            },
            {
              text: "Remind me about the prompt book.",
              cond: () => !F.bookGiven,
              next: "rBook",
            },
            {
              text: "Remind me about the light.",
              cond: () => !F.lightGiven,
              next: "rLight",
            },
            { text: "I'm working on it.", end: true },
          ],
        },
        gotBook: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            "My book! My beautiful— they burned pages forty to fifty-five. Of course they did. Those were mostly me. No matter, I know them by heart. I know everything by heart. " +
            (F.lightGiven
              ? "And with the light already rigged... we open TONIGHT."
              : "Now, if only we had light to see it by."),
          responses: [{ text: "Continue.", next: "checkDone" }],
        },
        gotLight: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            "A Studio 50 Klieg! Look at that lens. Tess! TESS! Get this on the balcony rail before Genevieve sees it and demands it for every scene. " +
            (F.bookGiven
              ? "And the book is home. My friend — we open TONIGHT."
              : "Now we need only words to illuminate."),
          responses: [{ text: "Continue.", next: "checkDone" }],
        },
        checkDone: {
          speaker: "Barnaby Thistlewood",
          text: () =>
            F.bookGiven && F.lightGiven
              ? "Places, everyone! PLACES! And you — you take the seat of honour. Front row, centre aisle. The one with the little brass plate. Curtain up in two minutes."
              : "One down! Onward.",
          onEnter: () => {
            if (
              F.bookGiven &&
              F.lightGiven &&
              qStage("pt_show") !== "showtime"
            ) {
              qSet("pt_show", "showtime");
              C.setupShow();
            }
          },
          responses: [{ text: "Break a leg.", end: true }],
        },
        rBook: {
          speaker: "Barnaby Thistlewood",
          text: "Port Authority, Eighth Avenue at 41st. Tess says the raider boss holes up in the old dispatcher's office on the upper bus level. Bring the book, and anything else of ours you find. Also bring yourself back. That part is important.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        rLight: {
          speaker: "Barnaby Thistlewood",
          text: "The Ed Sullivan Theater on Eighth, near 53rd — the one with the great vertical sign. Studio 50. The lighting store was upstairs by the control room, if memory serves, and memory always serves. It just serves slowly.",
          responses: [{ text: "Back to business.", next: "progress" }],
        },
        showtime: {
          speaker: "Barnaby Thistlewood",
          text: "Places! Take your seat — front row, centre. The one with the brass plate. We begin when you sit.",
          responses: [{ text: "On my way.", end: true }],
        },
        after: {
          speaker: "Barnaby Thistlewood",
          text: [
            "Did you see their faces? Well — Mortimer's face. It was very moved. He blew his nose on the curtain.",
            "We play every night now. Come back any time; the seat is yours. It no longer bites. Much.",
            "Twenty-two years, and we finally had an audience that clapped in the right places. I may retire. I won't. But I may.",
          ],
          responses: [
            { text: "I'd like to see it again.", next: "again2" },
            { text: "Good night, Barnaby.", end: true },
          ],
        },
        again2: {
          speaker: "Barnaby Thistlewood",
          text: "An encore! Take your seat, front row centre, and we'll run it from the top.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    // ---------------- Genevieve Laurent ----------------
    R("dlg_pt_vivienne", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Genevieve Laurent",
          text: [
            "Oh! An audience. Do I look all right? No — don't answer. Nobody's answered that question honestly since 1967.",
            "I was twenty-three when I was cast as Emily. I am forty-five now. It is still, technically, a stretch.",
            "The trick to Emily's last speech is that you must mean it every time. After the first ten years, that's the only trick left.",
          ],
          responses: [
            { text: "What was it like, before?", next: "before" },
            { text: "Why keep doing the same play?", next: "why" },
            { text: "You look wonderful.", next: "flatter" },
            { text: "Goodbye.", end: true },
          ],
        },
        before: {
          speaker: "Genevieve Laurent",
          text: 'Before? Stage-door Johnnies with orchids. Photographers. A write-up in the Herald: "Miss Laurent, a young talent to watch." Well — they could watch. Nobody told them how long for.',
          responses: [{ text: "Go on.", next: "hi" }],
        },
        why: {
          speaker: "Genevieve Laurent",
          text: "Because it's a play about noticing. About how nobody notices their life while it's happening. We had twenty-two years to notice ours. You'd be surprised how much there is. Even in here. Especially in here.",
          responses: [{ text: "I see.", next: "hi" }],
        },
        flatter: {
          speaker: "Genevieve Laurent",
          text: "Liar. Lovely, generous liar. Come to the show and lie to me again at the stage door afterwards.",
          responses: [{ text: "It's a date.", end: true }],
        },
      },
    });
    // ---------------- Tess Carraway (trader) ----------------
    R("dlg_pt_tess", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Tess Carraway",
          text: [
            "Tess Carraway, stage manager — the job, not the part; Barnaby does the part. Props, provisions, ammunition. Only one in the company under fifty, so I also handle anything involving stairs.",
            "Need something? I've got props that shoot and props that don't. Price is the same.",
            "Barnaby says we're a family. I say families don't make you run the rope-lines at three in the morning.",
          ],
          responses: [
            { text: "Let's trade.", barter: true, next: "hi" },
            {
              text: "What happened to the prompt book?",
              cond: () => !F.bookGiven,
              next: "book",
            },
            {
              text: "How does a kid end up running a troupe of old hams?",
              next: "human",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        book: {
          speaker: "Tess Carraway",
          text: 'I went out for lamp oil and walked straight into a raider "toll" on Eighth. They took my scrip, my boots and the book. The boss up in the terminal liked the pictures — Barnaby draws blocking diagrams. Little stick men. The raider thinks it\'s a comic.',
          responses: [{ text: "I'll see about it.", next: "hi" }],
        },
        human: {
          speaker: "Tess Carraway",
          text: "Walked in during a rainstorm when I was eleven. Genevieve gave me soup and a costume. Barnaby gave me a clipboard. Twenty years later I'm still holding the clipboard. Don't tell them I like it.",
          responses: [{ text: "Your secret's safe.", next: "hi" }],
        },
      },
    });
    // ---------------- Mortimer (bartender) ----------------
    R("dlg_pt_mortimer", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Mortimer",
          text: [
            "Welcome to Mortimer's. Intermission specials all day, because every day is intermission.",
            "What'll it be? I got Fizzo, I got beer, I got something in a bathtub that I call gin.",
            "Drinks are for paying customers. Talking is free, but I charge for listening.",
          ],
          responses: [
            {
              text: "Let's see what you're pouring.",
              barter: true,
              next: "hi",
            },
            { text: "Heard any rumours?", next: "rumours" },
            { text: "Goodbye.", end: true },
          ],
        },
        rumours: {
          speaker: "Mortimer",
          text: [
            "The Ed Sullivan up on Eighth? Robots still running the show. Scav went in last month, came out with a program and a nervous twitch. Said the robot MC made him sit through the whole hour.",
            "Port Authority raiders strung a cage up in the concourse. Say there's a bus up top nobody's been able to move since the war. Say a lot of things, raiders.",
            "There's a bank of coin lockers in the Port Authority nobody's cracked. Twenty-two years of luggage. I'd look, if I didn't hate bus stations.",
          ],
          responses: [{ text: "Thanks.", next: "hi" }],
        },
      },
    });
    // ---------------- Rosalind (makeup & mending — doctor) ----------------
    R("dlg_pt_rosalind", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Rosalind",
          text: [
            "Sit, sit. Makeup, wigs, wounds. The principles are the same: cover it, colour it, send them back on.",
            "You're bleeding on my good floor. Twenty scrip and I'll make you presentable.",
          ],
          responses: [
            {
              text: "Patch me up. (20 scrip)",
              next: "healed",
              cond: () => scrip() >= 20,
              action: () => {
                if (pay(20)) {
                  try {
                    if (!G.isStub("rpg") && G.rpg.doctorHeal)
                      G.rpg.doctorHeal("all");
                    else G.player.heal(999);
                  } catch (e) {
                    G.player.heal(999);
                  }
                  G.sfx.play("inject");
                }
              },
            },
            { text: "Let me see your supplies.", barter: true, next: "hi" },
            { text: "Goodbye.", end: true },
          ],
        },
        healed: {
          speaker: "Rosalind",
          text: "There. Good as new. Newer, possibly; I used the good greasepaint. Try not to die in the second act.",
          responses: [{ text: "Thanks, Rosalind.", end: true }],
        },
      },
    });
    // ---------------- Ticket-Taker (patrolman usher) ----------------
    R("dlg_pt_usher", {
      start: () => (F.ticket ? "hasTicket" : "hi"),
      nodes: {
        hi: {
          speaker: "Ticket-Taker",
          text: "GOOD EVENING. WELCOME TO THE LYCEUM. TICKETS ARE FIVE (5) SCRIP. CHILDREN AND SENIORS ARE FREE. PLEASE DO NOT DISCHARGE FIREARMS DURING THE PERFORMANCE.",
          responses: [
            {
              text: "[Pay 5 scrip] One ticket, please.",
              cond: () => scrip() >= 5,
              next: "paid",
              action: () => {
                if (pay(5)) {
                  F.ticket = true;
                }
              },
            },
            {
              text: "I was born before the war. I'm a senior. Honest.",
              next: "senior",
            },
            { text: "Goodbye.", end: true },
          ],
        },
        paid: {
          speaker: "Ticket-Taker",
          text: "THANK YOU. YOUR SEAT IS: ANYWHERE. ENJOY THE SHOW. THE SHOW IS: GOOD.",
          responses: [{ text: "Thanks.", end: true }],
        },
        senior: {
          speaker: "Ticket-Taker",
          text: "SCANNING... BIRTH YEAR: PLAUSIBLE. FACE: IMPLAUSIBLE. VERDICT: NOT A SENIOR. HOWEVER, YOUR HONESTY RATING IS: ENTERTAINING. ADMIT ONE.",
          onEnter: () => {
            F.ticket = true;
          },
          responses: [{ text: "Thank you.", end: true }],
        },
        hasTicket: {
          speaker: "Ticket-Taker",
          text: [
            "ENJOY THE SHOW.",
            "PLEASE SILENCE ALL GEIGER COUNTERS.",
            "THE MANAGEMENT IS NOT RESPONSIBLE FOR LOST LIMBS.",
          ],
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    // ---------------- Horace (doorman, outside) + players ----------------
    R("dlg_pt_horace", {
      start: "hi",
      nodes: {
        hi: {
          speaker: "Horace",
          text: [
            "Evening. Show's inside. Guns stay holstered in the house or you'll be finding out what I do between acts.",
            "Lyceum Players. Best — and only — theatre on Broadway.",
            "Raiders from the Port Authority come up this way now and then. They don't come up twice.",
          ],
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
    R("dlg_pt_player", {
      start: "hi",
      nodes: {
        hi: {
          text: [
            'Shh — running lines. "The sun comes up over the crater about quarter to six..."',
            "Twenty-two years of Act Two. You would think I would stop crying at the wedding.",
            "Barnaby says I have the best death scene in the company. I have the ONLY death scene in the company. It's a small cast.",
          ],
          responses: [{ text: "Break a leg.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // QUESTS
  // ==================================================================
