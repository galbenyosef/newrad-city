// play-inline-561 06 — next
// Lines 1237-2228 of readable/play-inline-561.pretty.js (statement-aligned).
  L.hook("register", function () {
    // ---------------- Deadeye Dolores ----------------
    L.dialogue("dlg_chr_dolores", {
      start: () =>
        L.flag("dolores_recruited")
          ? "guard"
          : L.flag("met_dolores")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Stop right there, Frosty. That's the third time today somebody's walked right up to me instead of shooting from the stairwell. Either you're brave or you're dumb, and I'm honestly curious which.",
          onEnter() {
            L.setFlag("met_dolores");
            if (!Q.isStarted("sq_sniper")) Q.start("sq_sniper");
          },
          responses: [
            {
              text: "You've been shooting Grand Central's pack-bots.",
              next: "bots",
            },
            { text: "Brave. Definitely brave.", next: "bots" },
            { text: "I'm here to kill you.", next: "fight" },
          ],
        },
        again: {
          text: "Back again, Frosty. Made up your mind?",
          responses: [
            { text: "About the supply runs...", next: "bots" },
            { text: "I'm here to kill you.", next: "fight" },
          ],
        },
        bots: {
          text: "Pack-bots. I shoot the pack-bots, never the drivers. The raiders downstairs pay me per bot, and they think I work for them. I work for the view. [She nods at the window — all of 42nd Street, laid out like a map.] Beats anything else I've seen in this city.",
          responses: [
            {
              text: "Grand Central needs someone with eyes like yours. Guard their supply runs instead.",
              check: { skill: "persuasion", value: 50 },
              next: "recruit",
              failNext: "recruit_fail",
            },
            {
              text: "Here's 150 scrip. Find another city to look at.",
              cond: () => L.scrip() >= 150,
              next: "payoff",
            },
            {
              text: "The raiders are using you. And you know it.",
              check: { attr: "presence", value: 7 },
              next: "recruit",
              failNext: "recruit_fail",
            },
            { text: "This ends now.", next: "fight" },
          ],
        },
        recruit: {
          text: "...Guard duty. For the market. [She laughs, short.] You know what? Fine. Tell Okafor the eagle's coming down off the Chrysler. And tell her I want a window. A big one.",
          onEnter() {
            L.setFlag("dolores_recruited");
            L.standing(50, "Recruited Dolores");
            L.xp(60, "Persuasion: New employer");
            Q.setStage("sq_sniper", "report");
            const d = L.npc("chr_dolores");
            if (d) {
              d.faction = "settlers";
            }
            L.give(["sniper_rifle", "hunting_rifle"], 1);
            L.give(["ammo_308"], 20);
          },
          responses: [{ text: "Welcome to the market, Dolores." }],
        },
        recruit_fail: {
          text: "Nah. I like it up here. Nobody bothers me except people like you, and people like you usually leave. Go on. Leave.",
          responses: [
            { text: "Fine." },
            { text: "Then this ends now.", next: "fight" },
          ],
        },
        payoff: {
          text: "[She weighs the scrip in her palm.] Hundred and fifty to go look at Jersey. ...Jersey's got a view too, I guess. Worse. But a view. [She shoulders the rifle.] Nice doing business, Frosty.",
          onEnter() {
            L.pay(150);
            L.setFlag("dolores_left");
            Q.setStage("sq_sniper", "report");
            L.removeNPC("chr_dolores");
            L.xp(40, "Paid off the sniper");
          },
          responses: [{ text: "Enjoy Jersey." }],
        },
        fight: {
          text: "Shame. You were the first interesting thing I'd seen all week.",
          onEnter() {
            L.hostile("chr_dolores", true);
          },
          responses: [{ text: "[Fight!]" }],
        },
        guard: {
          text: () =>
            [
              "Supply run's clear. I've got eyes on all of 42nd.",
              "Okafor gave me the big window. Don't tell her I cried.",
              "Frosty! Still alive? Good. Keep it that way.",
            ][Math.floor(Math.random() * 3)],
          responses: [{ text: "Keep watching, Dolores." }],
        },
      },
    });

    // ---------------- Tollbooth Tony ----------------
    L.dialogue("dlg_bb_tony", {
      start: () =>
        L.flag("bridge_legit")
          ? "legit"
          : L.flag("met_tony")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Welcome to the Brooklyn Bridge, the eighth wonder of the world, now under new management! Me! I'm the management! Tollbooth Tony. Crossin' is twenty scrip. Complaints are fifty. Complaints about the complaint fee are a hundred.",
          onEnter() {
            L.setFlag("met_tony");
          },
          responses: [
            {
              text: "[Pay the toll.] (20 scrip)",
              cond: () => L.scrip() >= 20 && !L.flag("toll_paid"),
              next: "paid",
            },
            {
              text: "The Brooklyn traders stopped coming. Your toll's too high.",
              next: "traders",
            },
            {
              text: "How about I cross for free?",
              check: { attr: "brawn", value: 7 },
              next: "free",
              failNext: "free_fail",
            },
            {
              text: "I think your management is about to be restructured.",
              next: "fight",
            },
          ],
        },
        again: {
          text: "You again! My favourite customer. Or my least favourite. Depends if you're payin'.",
          responses: [
            {
              text: "[Pay the toll.] (20 scrip)",
              cond: () => L.scrip() >= 20 && !L.flag("toll_paid"),
              next: "paid",
            },
            {
              text: "About the traders...",
              next: "traders",
              cond: () => Q.isActive("sq_bridge") && !L.flag("bridge_resolved"),
            },
            {
              text: "Your management is about to be restructured.",
              next: "fight",
            },
            { text: "Just passing." },
          ],
        },
        paid: {
          text: "Pleasure doin' business! Keep to the right, don't feed the gulls, the gulls have teeth now.",
          onEnter() {
            L.pay(20);
            L.setFlag("toll_paid");
          },
          responses: [{ text: "Thanks, Tony." }],
        },
        free: {
          text: "[You lean in until Tony is looking directly up at your chin.] ...Y'know what, first crossing's complimentary. New customer promotion. Just started it. Right now.",
          onEnter() {
            L.setFlag("toll_paid");
            L.xp(10, "Brawn");
          },
          responses: [{ text: "Smart man." }],
        },
        free_fail: {
          text: "Ha! Knuckles, get a load of this one. Tough guy in pyjamas.",
          responses: [{ text: "Fine. About the traders...", next: "traders" }],
        },
        traders: {
          text: "Too high? It's a BRIDGE, pal. Longest suspension bridge in the world, once. Maintenance ain't cheap. Mostly the maintenance is me shootin' shellbacks off the cables, but it's still maintenance.",
          responses: [
            {
              text: "Lower the toll and they'll cross again. More crossings, more scrip. Go legit — run it like a real toll authority.",
              check: { skill: "persuasion", value: 50 },
              next: "legit_pitch",
              failNext: "legit_fail",
            },
            {
              text: "Here's 200 scrip. Lower the wagon toll.",
              cond: () => L.scrip() >= 200,
              next: "bribe",
            },
            {
              text: '[Point at the booth.] Those old-world demolition charges under your booth — the det cord\'s frayed. One good pothole and "management" ends up in the East River.',
              check: { skill: "explosives", value: 45 },
              next: "charges",
              failNext: "charges_fail",
            },
            { text: "Or I restructure your management.", next: "fight" },
          ],
        },
        charges: {
          text: '[Tony looks down. Tony looks at Knuckles. Knuckles looks at the sky.] ...KNUCKLES wired those. For "security." [You spend five careful minutes teaching the Brooklyn Bridge Toll Gang the difference between a blasting cap and a thinking cap.] Okay. OKAY. You saved our lives, which I resent. Wagons cross for five. You cross free. Forever. Don\'t tell nobody I was scared.',
          onEnter() {
            L.setFlag("bridge_charges");
            L.setFlag("bridge_resolved");
            L.setFlag("toll_paid");
            L.xp(80, "Explosives: Bridge safety inspection");
            L.standing(50, "Defused the toll booth");
            if (Q.isActive("sq_bridge")) Q.setStage("sq_bridge", "report");
            L.news(
              "Brooklyn Bridge update: the toll's down to five scrip, and I'm told the raiders up there just attended their first-ever safety briefing. Taught by a fella in a frost-grey suit. With a detonator. As one does.",
            );
          },
          responses: [{ text: "Safety first, Tony." }],
        },
        charges_fail: {
          text: "Them? Them's decorative. [He kicks the booth. Nothing explodes. He looks very relieved and pretends he isn't.] See? Decorative.",
          responses: [
            {
              text: "Here's 200 scrip. Lower the wagon toll.",
              cond: () => L.scrip() >= 200,
              next: "bribe",
            },
            { text: "Then I restructure your management.", next: "fight" },
            { text: "Forget it." },
          ],
        },
        legit_pitch: {
          text: "[Tony's mouth moves silently as he does the maths. He does it twice. He counts on his fingers. He borrows Knuckles' fingers.] ...More crossings. More scrip. And I get to wear a hat. A REAL toll hat. [He sticks out a hand.] Brooklyn Bridge Toll Authority. I'm gonna print receipts.",
          onEnter() {
            L.setFlag("bridge_legit");
            L.setFlag("bridge_resolved");
            L.standing(75, "Made Tony go legit");
            L.xp(80, "Persuasion: Infrastructure reform");
            Q.setStage("sq_bridge", "report");
            L.news(
              'Traffic report! The Brooklyn Bridge is open for business, and — I\'m reading this right — the "Brooklyn Bridge Toll Authority" is now issuing RECEIPTS. Five scrip a head. Somebody out there talked a raider into civic responsibility. Unbelievable.',
            );
          },
          responses: [{ text: "Nice doing business, Commissioner." }],
        },
        legit_fail: {
          text: "Legit? LEGIT? Pal, I'm a raider. Raiders don't go legit. We go... [he searches for the word] ...illegit.",
          responses: [
            {
              text: "Here's 200 scrip. Lower the wagon toll.",
              cond: () => L.scrip() >= 200,
              next: "bribe",
            },
            { text: "Then I restructure your management.", next: "fight" },
            { text: "Forget it." },
          ],
        },
        bribe: {
          text: "Two hundred scrip... for me... to charge LESS? [He takes it quick, before you change your mind.] Pal, you are the worst negotiator I ever met, and I love you. Wagons cross for five. Tell your friends.",
          onEnter() {
            L.pay(200);
            L.setFlag("bridge_paid");
            L.setFlag("bridge_resolved");
            L.standing(10, "Paid for safe passage");
            Q.setStage("sq_bridge", "report");
          },
          responses: [{ text: "Don't make me regret it." }],
        },
        fight: {
          text: "Knuckles! Dee-Dee! We got a complaint! [He racks his shotgun.] Complaint department is OPEN!",
          onEnter() {
            L.setFlag("bridge_hostile");
            ["bb_tony", "bb_knuckles", "bb_deedee"].forEach((id) =>
              L.hostile(id, true),
            );
          },
          responses: [{ text: "[Fight!]" }],
        },
        legit: {
          text: "Brooklyn Bridge Toll Authority, how may I help ya? Five scrip a head, receipts on request, and the complaint fee is now a very reasonable ten scrip.",
          responses: [{ text: "Looking sharp, Tony." }],
        },
      },
    });

    // ---------------- Hattie Caldwell ----------------
    L.dialogue("dlg_fl_hattie", {
      start: () =>
        Q.stage("sq_wagon") === "return" && L.has("q_caldwell_strongbox")
          ? "return"
          : L.flag("met_hattie")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Hattie Caldwell, Caldwell & Daughters Freight. Well — Caldwell and Daughter, since my sister married a Brooklyn boy. If you're buying, I'm selling. If you've seen a pack-bot called Dolly, I'm begging.",
          onEnter() {
            L.setFlag("met_hattie");
          },
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "Your trade wagon is missing?",
              next: "missing",
              cond: () => !Q.isStarted("sq_wagon"),
            },
            { text: "Just browsing." },
          ],
        },
        again: {
          text: () =>
            Q.isActive("sq_wagon")
              ? "Any sign of them? Dolly, Ruiz, the strongbox? Anything?"
              : L.flag("wagon_done")
                ? "Best customer on Broadway! What can I get you?"
                : "What can I do for you?",
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "About your wagon...",
              next: "missing",
              cond: () => !Q.isStarted("sq_wagon"),
            },
            { text: "Nothing today." },
          ],
        },
        missing: {
          text: "Four days ago Ruiz and Pete took Dolly up Broadway to Grand Central. Water, Rally Tonic, and a strongbox with our payroll — and my mother's locket, which I should not have put in there. They never arrived. Somewhere between here and Madison Square they just... stopped.",
          responses: [
            { text: "I'll look for them.", action: () => Q.start("sq_wagon") },
            { text: "What's in it for me?", next: "pay" },
            { text: "Sorry, I can't." },
          ],
        },
        pay: {
          text: "Two hundred scrip if you bring back that strongbox. And a discount at this stall for life, which, considering the neighbourhood, may not be long.",
          responses: [
            {
              text: "Your payroll's in that box. Three hundred, and I leave now.",
              check: { skill: "trade", value: 45 },
              next: "pay_up",
              failNext: "pay_no",
            },
            { text: "I'll find it.", action: () => Q.start("sq_wagon") },
            { text: "Maybe later." },
          ],
        },
        pay_up: {
          text: "[She laughs, not happily.] You'd make a good Caldwell. Three hundred. Bring me that box.",
          onEnter() {
            L.setFlag("hattie_haggled");
            L.xp(15, "Trade");
          },
          responses: [{ text: "Deal.", action: () => Q.start("sq_wagon") }],
        },
        pay_no: {
          text: "Two hundred is what the job pays. Two hundred is what I HAVE, until that box comes back.",
          responses: [
            { text: "Fine. I'll find it.", action: () => Q.start("sq_wagon") },
            { text: "Maybe later." },
          ],
        },
        return: {
          text: "[She sees the strongbox and sits down hard on a crate.] You found it. And Ruiz? Pete? ...No. Don't tell me. I can see your face.",
          responses: [
            {
              text: "Here's your strongbox. I'm sorry about your men.",
              standing: 50,
              next: "give",
            },
            {
              text: "[Lie] The raiders already cleaned it out. It's empty.",
              cond: () => !!L.flag("strongbox_looted"),
              standing: -75,
              next: "lie",
            },
            {
              text: "[Dial 0-4-1-9 and check inside first.] Let me make sure nothing's missing.",
              cond: () =>
                !L.flag("strongbox_looted") && knows(LOCK_STRONGBOX.id),
              action: () => {
                if (G.locks && G.locks.unlock) {
                  try {
                    G.locks.unlock(LOCK_STRONGBOX.id, "code");
                  } catch (e) {
                    /* */
                  }
                }
              },
              next: "peek",
            },
            {
              text: "Let me open it first — make sure nothing's missing.",
              cond: () =>
                !L.flag("strongbox_looted") && !knows(LOCK_STRONGBOX.id),
              next: "peek_fail",
            },
          ],
        },
        peek: {
          text: "[The dials click home. Inside: a thick bundle of scrip — the payroll — and a silver locket with a faded photograph of two little girls. Hattie is watching you.]",
          onEnter() {
            L.setFlag("strongbox_looted");
          },
          responses: [
            {
              text: "[Close it and hand it over.] Everything's here.",
              standing: 50,
              next: "give",
            },
            {
              text: "[Pocket the scrip. Hand over the locket.] The raiders took the payroll.",
              standing: -50,
              next: "half",
            },
          ],
        },
        peek_fail: {
          text: "[You try a few numbers on the dials. Nothing. Hattie raises an eyebrow.] It's a Caldwell box, friend. Only a Caldwell knows the combination.",
          responses: [{ text: "Here you go, then.", next: "give" }],
        },
        give: {
          text: () =>
            "[She spins the dials without looking. She takes out the locket first, and holds it to her chest for a long moment.] " +
            (L.flag("hattie_haggled")
              ? "Three hundred scrip, you shark."
              : "Two hundred scrip, as promised.") +
            " And three bottles of Rally Tonic, because you look like a person who needs them. Thank you. Truly.",
          onEnter() {
            L.take("q_caldwell_strongbox", 1);
            L.giveScrip(L.flag("hattie_haggled") ? 300 : 200);
            L.give(["rally_tonic"], 3);
            L.setFlag("wagon_done");
            L.setFlag("wagon_honest");
            Q.complete("sq_wagon");
          },
          responses: [{ text: "Take care, Hattie." }],
        },
        half: {
          text: "[She opens the locket, and smiles through tears.] The payroll can be replaced. This can't. Thank you. Here — it's not much. [Fifty scrip.] It's what I've got left.",
          onEnter() {
            L.take("q_caldwell_strongbox", 1);
            L.giveScrip(300 + 50);
            L.setFlag("wagon_done");
            L.setFlag("wagon_skimmed");
            Q.complete("sq_wagon");
          },
          responses: [{ text: "[Leave.]" }],
        },
        lie: {
          text: "Empty. [She stares at it.] Well. At least I have the box. [She doesn't open it in front of you.] Thanks for trying.",
          onEnter() {
            L.take("q_caldwell_strongbox", 1);
            L.giveScrip(300);
            L.setFlag("wagon_done");
            L.setFlag("wagon_skimmed");
            Q.complete("sq_wagon");
          },
          responses: [{ text: "[Leave.]" }],
        },
      },
    });

    // ---------------- Nurse Kwan ----------------
    L.dialogue("dlg_fl_kwan", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            "Abigail Kwan. I'm not a doctor, I'm a nurse — which out here means I know the difference, and that's rarer than a doctor. " +
            (G.player.hp < G.player.maxHp
              ? "You're bleeding on my floor."
              : "What do you need?"),
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
              text: "Flush out my radiation. (35 scrip)",
              cond: () => G.player.rads > 0,
              action: () => {
                if (L.pay(35)) L.removeRads();
              },
            },
            { text: "Let me see your supplies.", barter: true },
            { text: "I'm fine." },
          ],
        },
      },
    });

    // ---------------- Chess Charlie ----------------
    L.dialogue("dlg_ws_charlie", {
      start: "hello",
      nodes: {
        hello: {
          text: "Charlie. Chess Charlie. Been playing chess under this arch since before the bombs, and I've been winning since about ten minutes after. The competition thinned out, see. Game? Ten scrip says I take you in twenty moves.",
          responses: [
            {
              text: "You're on. (10 scrip)",
              cond: () => L.scrip() >= 10,
              check: { attr: "wits", value: 7 },
              next: "win",
              failNext: "lose",
            },
            {
              text: "Speed chess. Five seconds a move — no time to think, just instinct. (10 scrip)",
              cond: () => L.scrip() >= 10 && !L.flag("beat_charlie"),
              check: { attr: "senses", value: 7 },
              next: "blitz_win",
              failNext: "lose",
            },
            { text: "What was it like here, before?", next: "before" },
            { text: "Maybe later." },
          ],
        },
        win: {
          text: "[Twenty-three moves later, you trap his king behind his own rook. He stares at the board for a long time.] ...Huh. Twenty-two years. Nobody. [He pays you, grinning with his whole weathered, gap-toothed face.] Come back anytime, kid. I mean it. I haven't had this much fun since Eisenhower.",
          onEnter() {
            L.giveScrip(20);
            L.xp(25, "Beat Chess Charlie");
            L.setFlag("beat_charlie");
          },
          responses: [{ text: "Good game, Charlie." }],
        },
        blitz_win: {
          text: "[You play fast and badly. Charlie plays fast and brilliantly — and on move seventeen his burned, stiff hand knocks his own king over reaching for a pawn. He stares at it.] ...Touch-move. That's the rule. I made the rule. [He laughs until he coughs.] Quick eyes, kid. Quick, quick eyes. Take the scrip.",
          onEnter() {
            L.giveScrip(20);
            L.xp(25, "Senses: Beat Chess Charlie");
            L.setFlag("beat_charlie");
          },
          responses: [{ text: "Good game, Charlie." }],
        },
        lose: {
          text: "[He takes your queen on move nine and your dignity on move fourteen.] Checkmate. Don't feel bad — the last person who beat me was a Russian grandmaster in 1966, and he cheated. I'll take those ten scrip.",
          onEnter() {
            L.giveScrip(-10);
          },
          responses: [{ text: "Rematch sometime." }],
        },
        before: {
          text: "Before? I was a clerk in the Mayor's office, right down Broadway. Every lunch hour, right here: chess players, NYU kids, a guy with a piano on wheels. Pigeons. Lotta pigeons. Now it's burrow rats, which are like pigeons but with teeth and without the charm. The arch is still standing, though. So am I. Mostly.",
          responses: [
            {
              text: "Let's play.",
              cond: () => L.scrip() >= 10,
              check: { attr: "wits", value: 7 },
              next: "win",
              failNext: "lose",
            },
            {
              text: "The Mayor's office still has a working teletype. Locked.",
              next: "mayor",
            },
            { text: "Take care, Charlie." },
          ],
        },
        mayor: {
          text: "Hizzoner's teletype? Hah! His passcode was GRACIE — after the mansion. Every January the security fella made him change it, and every January he changed it to GRACIE. Go on. Tell those tin patrolmen the Mayor sends his regards. They've been waiting on him longer than I have.",
          learn: LOCK_CITY_HALL.id,
          onEnter() {
            learnLock(LOCK_CITY_HALL.id, "Chess Charlie");
          },
          responses: [
            { text: "Thanks, Charlie." },
            {
              text: "Fancy a game?",
              cond: () => L.scrip() >= 10,
              check: { attr: "wits", value: 7 },
              next: "win",
              failNext: "lose",
            },
          ],
        },
      },
    });

    // ---------------- Gus Papadakis ----------------
    L.dialogue("dlg_fl_gus", {
      start: "hello",
      nodes: {
        hello: {
          text: "Gus Papadakis! Armour, junk, armour made of junk. The Flatiron is the pointiest building in New York, and Gus has the pointiest prices. Hah! That is a joke. The prices are round. Like Gus.",
          responses: [
            { text: "Show me your wares.", barter: true },
            { text: "Why the Flatiron?", next: "why" },
            { text: "Bye, Gus." },
          ],
        },
        why: {
          text: "Is a triangle! Raiders come from one side, Gus sees them. Raiders come from other side, Gus sees them. Raiders come from third side, Gus is already running. Is perfect building.",
          responses: [
            { text: "Show me your wares.", barter: true },
            { text: "Solid logic." },
          ],
        },
      },
    });

    // ---------------- CURATOR-7 ----------------
    L.dialogue("dlg_met_curator", {
      start: () =>
        Q.stage("sq_exhibit") === "report"
          ? "report"
          : L.flag("met_curator")
            ? "again"
            : "first",
      nodes: {
        first: {
          speaker: "CURATOR-7",
          text: "Ah! A PATRON! Welcome, welcome to the Metropolitan Museum of Art. I am CURATOR-7, your docent. Please observe that I am holding my manipulators BEHIND my chassis; this is the international posture of non-threatening scholarship.",
          onEnter() {
            L.setFlag("met_curator");
          },
          responses: [
            {
              text: "Why is a docent standing outside the museum?",
              next: "outside",
            },
            { text: "Tell me about the collection.", next: "collection" },
            { text: "Goodbye." },
          ],
        },
        again: {
          text: "Welcome back! Please do not touch the exhibits. You have not touched them yet, but I like to say it early.",
          responses: [
            {
              text: "About the security robots...",
              next: "outside",
              cond: () => !Q.isStarted("sq_exhibit"),
            },
            {
              text: "Is there a way to switch the robots off without a fight?",
              next: "passcode",
              cond: () => Q.isActive("sq_exhibit") && !L.flag("met_closed"),
            },
            { text: "Tell me about the collection.", next: "collection" },
            { text: "Goodbye." },
          ],
        },
        outside: {
          text: 'An EXCELLENT question. On the morning of March 5th, 1967, our security Patrolmen were set to "Exhibit Protection: Maximum." Every patron since has been classified as an art thief. They have expelled... everyone. With considerable enthusiasm. I have been locked outside with the rest of the public for twenty-two years.',
          responses: [
            {
              text: "I'll deal with them.",
              cond: () => !Q.isStarted("sq_exhibit"),
              action: () => Q.start("sq_exhibit"),
            },
            {
              text: "What would you pay?",
              next: "pay",
              cond: () => !Q.isStarted("sq_exhibit"),
            },
            {
              text: "Is there a way to switch them off without a fight?",
              next: "passcode",
            },
            { text: "That sounds like a museum problem." },
          ],
        },
        passcode: {
          text: "There is! The security teletype in the Great Hall can engage the MUSEUM CLOSED protocol. The Director of Security's passcode was VERMEER — he was very fond of the Dutch, and very bad at secrets. He typed it with one finger while saying it aloud. Every morning. For eleven years.",
          learn: LOCK_MET.id,
          onEnter() {
            learnLock(LOCK_MET.id, "CURATOR-7");
          },
          responses: [
            {
              text: "I'll take care of it.",
              cond: () => !Q.isStarted("sq_exhibit"),
              action: () => Q.start("sq_exhibit"),
            },
            { text: "Thanks, Curator." },
          ],
        },
        pay: {
          text: "The Museum is prepared to offer an honorarium of one hundred and fifty scrip, a complimentary lifetime membership, and an item from my personal collection of optical instruments. Membership benefits currently include: not being shot.",
          responses: [
            {
              text: "Robot-proof art handling is specialist work. Specialists cost two hundred and fifty.",
              check: { skill: "trade", value: 50 },
              next: "pay_up",
              failNext: "pay_no",
            },
            { text: "Deal.", action: () => Q.start("sq_exhibit") },
          ],
        },
        pay_up: {
          text: "[CURATOR-7 whirrs through what sounds like a very short budget meeting with itself.] The Acquisitions Committee — me — approves. Two hundred and fifty scrip. Please do not tell the Education Department. It is also me, and it is furious.",
          onEnter() {
            L.setFlag("curator_haggled");
            L.xp(15, "Trade");
          },
          responses: [
            {
              text: "Pleasure doing business.",
              action: () => Q.start("sq_exhibit"),
            },
          ],
        },
        pay_no: {
          text: "I am afraid the endowment has been frozen since 1967. Literally. The strongroom is full of ice. One hundred and fifty.",
          responses: [
            { text: "Deal.", action: () => Q.start("sq_exhibit") },
            { text: "I'll think about it." },
          ],
        },
        collection: {
          text: 'Five thousand years of art! American, Egyptian, Greek, Roman, and a special exhibition sponsored by Atlas Power & Light: "Tomorrowland, U.S.A." Gallery 4 is closed for renovation. Please disregard the glow.',
          responses: [{ text: "Sounds great." }],
        },
        report: {
          text: () =>
            L.flag("met_closed")
              ? "MUSEUM CLOSED protocol! How elegant! The Patrolmen are asleep in their alcoves, humming the Museum hymn. You have preserved the collection AND the security staff. The Board would be delighted. There is no Board. I am delighted on their behalf."
              : "The security staff have been... retired. Permanently. [A long, sad whirr.] They were very dedicated. Too dedicated, perhaps. Thank you, patron.",
          responses: [
            {
              text: "Enjoy your museum, Curator.",
              action: () => {
                Q.complete("sq_exhibit");
                if (L.flag("curator_haggled")) L.giveScrip(100);
                L.news(
                  'Arts and culture! The Metropolitan Museum of Art is — and I quote the robot who called in — "open for patrons for the first time since 1967." The robot would like everyone to know the gift shop is still closed.',
                );
              },
            },
          ],
        },
      },
    });

    // ---------------- Ossie the ferryman ----------------
    L.dialogue("dlg_bp_ossie", {
      start: () => {
        if (Q.stage("sq_shellshock") === "report") return "report";
        // MAIN STORY mq24 "Crossing" (lone path / Covenant muster): the crossing itself
        if (
          Q.isActive("mq24") &&
          (Q.stage("mq24") === "ferry" || Q.stage("mq24") === "muster")
        ) {
          L.setFlag("met_ossie");
          return "ms24_ferry";
        }
        return L.flag("met_ossie") ? "again" : "first";
      },
      nodes: {
        first: {
          text: "Name's Ossie. I run the ferry. The ferry is that boat. The boat is mostly holes held together with other, smaller holes. You want to go to Liberty Island, it's a hundred scrip. You want to come back, that's free. Nobody ever asks to come back. Think about that.",
          onEnter() {
            L.setFlag("met_ossie");
          },
          responses: [
            { text: "Take me to Liberty Island.", next: "ferry" },
            { text: "What's on Liberty Island?", next: "liberty" },
            {
              text: "You look like you have a problem.",
              next: "problem",
              cond: () => !Q.isStarted("sq_shellshock"),
            },
            { text: "Maybe later." },
          ],
        },
        again: {
          text: () =>
            L.flag("ending_played")
              ? "The sky's different. You notice? I noticed."
              : "Back again. Ferry's still floatin'. Mostly.",
          responses: [
            { text: "Take me to Liberty Island.", next: "ferry" },
            {
              text: "About those shellbacks...",
              next: "problem",
              cond: () => !Q.isStarted("sq_shellshock"),
            },
            {
              text: "About that old net generator...",
              next: "net",
              cond: () =>
                Q.isActive("sq_shellshock") && !L.flag("ossie_net_known"),
            },
            {
              text: "Ever ferry anybody strange out to the island?",
              next: "ms24_lady",
              cond: () => Q.isStarted("mq04") && !L.flag("ms_ossie_lady"),
            },
            { text: "Not today." },
          ],
        },
        liberty: {
          text: "Pressed uniforms. Big guns. A statue with her arm still up, like she's still hailing a cab after twenty-two years. The Continuity moved in a year back. They pay me not to ferry people over. I take their scrip. Then I ferry people over. Business is business.",
          responses: [
            { text: "Take me there.", next: "ferry" },
            { text: "Maybe later." },
          ],
        },
        problem: {
          text: "Shellbacks. Big armoured crabs with worse attitudes. They come up out of the harbour at night and try to eat my boat. They've eaten four boats. This is boat five. Boat five is my favourite. Kill some for me, and the ferry's free for you — forever. Or as long as I am, which, at sixty-eight, is not a promise.",
          responses: [
            {
              text: "I'll thin them out.",
              action: () => Q.start("sq_shellshock"),
            },
            { text: "What's that rusted machine on the pier?", next: "net" },
            { text: "Not my problem." },
          ],
        },
        net: {
          text: "That? Old-world harbour defence. The city strung electrified nets across the slips to keep sharks off the tourist boats. Generator's been dead since the day I got cooked. Get it humming and the crabs'll keep off my boat all by themselves. Needs somebody handy with a wrench, though. Or somebody who reads wiring diagrams for fun.",
          onEnter() {
            L.setFlag("ossie_net_known");
            if (!Q.isStarted("sq_shellshock")) Q.start("sq_shellshock");
            else L.refresh("sq_shellshock");
          },
          responses: [
            { text: "I'll take a look at it." },
            { text: "I'll just shoot the crabs." },
          ],
        },
        report: {
          text: "Heard the shooting. Heard the crunching. Didn't hear any eating of boats. [He presses a punched subway token into your palm.] Lifetime ferry pass. Don't lose it — I don't make copies, I just remember faces, and yours is gonna change a lot out there.",
          responses: [
            {
              text: "Thanks, Ossie.",
              action: () => Q.complete("sq_shellshock"),
            },
          ],
        },
        ferry: {
          text: () => {
            if (L.has("q_ferry_token"))
              return "Got your token? Hop in. Mind the hole. No, the other hole.";
            if (covenantSided() && Q.isActive("mq06"))
              return 'The Covenant already paid. Well — "paid." They pointed a very large gun at me and said "please." Hop in.';
            return "Hundred scrip. Liberty Island. Don't stand up, don't lean over, and don't feed the thing that follows the boat.";
          },
          responses: [
            {
              text: "[Board the ferry.]",
              cond: () =>
                L.has("q_ferry_token") ||
                (covenantSided() && Q.isActive("mq06")),
              action: () => boardFerry(),
            },
            {
              text: "[Pay 100 scrip for a season pass and board.]",
              cond: () => !ferryAllowed() && L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("ferry_paid");
                  boardFerry();
                }
              },
            },
            {
              text: "[Board the ferry.]",
              cond: () =>
                !L.has("q_ferry_token") &&
                !(covenantSided() && Q.isActive("mq06")) &&
                ferryAllowed(),
              action: () => boardFerry(),
            },
            {
              text: "How about a discount for a fella who slept through the war?",
              check: { skill: "persuasion", value: 45 },
              next: "discount",
              failNext: "no_discount",
              cond: () => !L.has("q_ferry_token") && !L.flag("ossie_haggled"),
            },
            {
              text: "[Wait for him to turn and slip under the tarp in the stern.]",
              check: { skill: "stealth", value: 40 },
              next: "stowaway",
              failNext: "stowaway_fail",
              cond: () =>
                !L.has("q_ferry_token") &&
                !ferryAllowed() &&
                !L.flag("ossie_stowaway"),
            },
            { text: "Not yet." },
          ],
        },
        discount: {
          text: "Slept through it, huh? So did I. Under a bar on Pearl Street, with my hat over my face. Woke up looking like this. ...Fine. Free ride. Once. Don't tell the Continuity.",
          onEnter() {
            L.setFlag("ossie_haggled");
            L.setFlag("ossie_free_ride");
            L.xp(20, "Persuasion");
          },
          responses: [
            { text: "[Board the ferry.]", action: () => boardFerry() },
          ],
        },
        stowaway: {
          text: "[Ossie shuffles off to curse at a bollard. You fold yourself under a tarp that smells of twenty years of shellback. The engine coughs. The boat moves. Somewhere above you, Ossie starts singing to the harbour, badly.]",
          onEnter() {
            L.setFlag("ossie_stowaway");
            L.xp(20, "Stealth: Stowaway");
          },
          responses: [
            { text: "[Hold your breath.]", action: () => boardFerry() },
          ],
        },
        stowaway_fail: {
          text: "[A boot taps the tarp.] Kid. I'm old, not stupid. I can smell a stowaway through a lead wall. Hundred scrip, or swim — and the thing that follows the boat LOVES swimmers.",
          onEnter() {
            L.setFlag("ossie_stowaway");
          },
          responses: [
            {
              text: "[Pay 100 scrip and board.]",
              cond: () => L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("ferry_paid");
                  boardFerry();
                }
              },
            },
            { text: "[Climb out, sheepishly.]" },
          ],
        },
        // ---- MAIN STORY (outline v2) mq24 "Crossing": the lone path's boat, and the Covenant's (commandeered) ----
        ms24_ferry: {
          text: () =>
            covenantSided()
              ? "Your tin soldiers are already sitting in my boat. Sitting very heavy. If she goes down, I want it on record she was overloaded by the Iron Covenant."
              : (L.flag("shell_net")
                  ? "Net's humming, crabs are sulking, and boat five is still boat five. "
                  : "Crabs are thinned out and boat five is still boat five. ") +
                "Liberty Island. Tonight, if you like. Nobody on that island will be expecting an old man in a bucket.",
          responses: [
            { text: "[Cross to Liberty Island.]", action: () => boardFerry() },
            {
              text: "Ever ferry anybody strange out to the island?",
              next: "ms24_lady",
              cond: () => !L.flag("ms_ossie_lady"),
            },
            { text: "Not yet, Ossie." },
          ],
        },
        ms24_lady: {
          text: "Strange? Kid, I ferry Continuity deserters, Covenant spies and one fella with a goat. [He scratches the grey stubble under his chin.] But yeah. Back in the winter. A lady in long robes comes down the pier after dark with two of them candle-carriers behind her. Gold face. Not paint, a mask, a sun with all the rays out. Wants Liberty, middle of the night. Pays me in candles. A whole crate of candles. Who pays in candles?",
          onEnter() {
            L.setFlag("ms_ossie_lady");
          },
          responses: [
            { text: "What happened on the island?", next: "ms24_lady2" },
          ],
        },
        ms24_lady2: {
          text: "Walked up the pier like she owned it, and some private on the gate let her in, polite as a church usher. She was back inside the hour. Sat in my stern the whole way home with that gold face pointed at the water and never said a word. Whatever she went over there to buy, kid, they didn't sell it to her. [He shrugs.] I still got most of the candles. They burn nice.",
          responses: [{ text: "Thanks, Ossie." }],
        },
        no_discount: {
          text: "Hundred scrip. I got boats to replace.",
          onEnter() {
            L.setFlag("ossie_haggled");
          },
          responses: [
            {
              text: "[Pay 100 scrip and board.]",
              cond: () => L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("ferry_paid");
                  boardFerry();
                }
              },
            },
            { text: "Not now." },
          ],
        },
      },
    });
  });

  // ------------------------------------------------------------------
  // "Shell Shock" alternative: the old-world shark-net generator on the Battery pier
  // (Mechanics 50 or Electronics 65). A small procedural machine: 4 meshes, shared materials.
  // ------------------------------------------------------------------
