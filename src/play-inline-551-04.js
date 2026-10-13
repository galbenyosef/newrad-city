// play-inline-551 04 — next
// Lines 751-1682 of readable/play-inline-551.pretty.js (statement-aligned).
  L.hook("register", function () {
    // ---------------- Stationmaster Delphine Okafor ----------------
    L.dialogue("dlg_gc_delphine", {
      start: () => (L.flag("met_delphine") ? "again" : "first"),
      nodes: {
        first: {
          text: "Delphine Okafor, Stationmaster. You're new, you're padded like a mattress, and you're standing in my concourse, which makes you my business. Welcome to Grand Central Market — the safest forty thousand square feet in New Rad City, give or take the pigeons.",
          onEnter() {
            L.setFlag("met_delphine");
          },
          responses: [
            { text: "I'm looking for a friend. Zeke Marlow.", next: "zeke" },
            { text: "Tell me about the market.", next: "market" },
            { text: "The safest? That's a low bar out here.", next: "bar" },
          ],
        },
        again: {
          text: () =>
            [
              "Stationmaster's office is open. What do you need?",
              "You again. Good. I like repeat customers who haven't been shot yet.",
              "Walk with me — no, stand still, I'm busy. What is it?",
            ][Math.floor(Math.random() * 3)],
          responses: [
            {
              text: "About Zeke Marlow...",
              next: "zeke",
              cond: () => Q.isActive("mq02"),
            },
            { text: "Tell me about the market.", next: "market" },
            { text: "Got any work?", next: "work" },
            {
              text: "About the sniper on 42nd...",
              next: "sniper_report",
              cond: () =>
                Q.isActive("sq_sniper") &&
                (L.flag("dolores_dead") ||
                  L.flag("dolores_recruited") ||
                  L.flag("dolores_left")),
            },
            {
              text: "About the Brooklyn Bridge toll...",
              next: "bridge_report",
              cond: () => Q.isActive("sq_bridge") && L.flag("bridge_resolved"),
            },
            {
              text: 'The Glowkeepers want to "bless" your water tower.',
              next: "glow_warn",
              cond: () =>
                Q.isActive("sq_glow") &&
                !glowFlag("told_delphine") &&
                !glowFlag("isotope_planted"),
            },
            { text: "Nothing. Just saying hello." },
          ],
        },
        bar: {
          text: "Low bar, high walls. We've got food, water, a doctor who mostly washes his hands, and a gun merchant who only occasionally shoots customers. That's paradise, mister. Ask anyone who's lived outside it.",
          responses: [
            { text: "I'm looking for Zeke Marlow.", next: "zeke" },
            { text: "Tell me about the market.", next: "market" },
          ],
        },
        zeke: {
          text: "Big fella, grey suit like yours, frost still in his eyebrows, fixed our water pump for free and wouldn't shut up about the Statue of Liberty? Yeah, he was here. Try Moe at the Oyster Bar, down the ramp. Zeke drank there every night he was in town. Moe remembers everything a man says after his third drink.",
          responses: [
            { text: "Thanks, Stationmaster." },
            { text: "Got any work while I'm here?", next: "work" },
          ],
        },
        market: {
          text: "Moe runs the Oyster Bar — food and drink. Doc Hollis patches holes. Rosa sells guns and opinions. INFO-BOT sells information, some of it true. Rules are on the board: no shooting in the concourse, scrip only, and you treat the Neon folks like folks, because they are.",
          responses: [
            { text: "What's the story with the INFO-BOT?", next: "infobot" },
            { text: "Got any work?", next: "work" },
            { text: "Thanks." },
          ],
        },
        infobot: {
          text: "Came with the building. Knows every train schedule from 1967 and nothing useful after. Traders have been reading it their goggle logs for years, so now it knows gossip too. It charges. Don't tip it. It gets ideas.",
          responses: [
            { text: "Got any work?", next: "work" },
            { text: "Thanks." },
          ],
        },
        work: {
          text: "Two problems, both of them shooting at my convoys. Somebody's sniping pack-bots on 42nd from the Chrysler Building. And the Brooklyn Bridge gang has raised the toll so high the Brooklyn traders won't cross. Fix either one and I'll make it worth your while.",
          responses: [
            {
              text: "I'll deal with the sniper.",
              cond: () => !Q.isStarted("sq_sniper"),
              action: () => Q.start("sq_sniper"),
            },
            {
              text: "I'll look into the bridge.",
              cond: () => !Q.isStarted("sq_bridge"),
              action: () => Q.start("sq_bridge"),
            },
            { text: "Maybe later." },
          ],
        },
        sniper_report: {
          text: () =>
            L.flag("dolores_recruited")
              ? "You... hired her? The sniper? And she's going to guard OUR convoys now? [She rubs her temples.] That is the single most New York solution I have ever heard. Fine. Here's your pay. If she shoots Kowalski, it's coming out of your end."
              : L.flag("dolores_left")
                ? "You paid her to leave? Out of your own pocket? ...Well, the flashes stopped, and I'm not going to argue with a miracle. Here — let me at least pay you back."
                : "No more flashes from the Chrysler. Kowalski's actually smiling, which is upsetting for everybody. Here — you earned this.",
          responses: [
            {
              text: "Pleasure doing business.",
              action: () => Q.complete("sq_sniper"),
            },
          ],
        },
        bridge_report: {
          text: () =>
            L.flag("bridge_legit")
              ? "A \"Toll Authority\"? With receipts? Tony the raider is issuing RECEIPTS? ...Honestly, that's better than dead. Dead men don't reopen trade routes. Here's your cut."
              : L.flag("bridge_charges")
                ? "Tony says you \"inspected\" his toll booth and now he flinches every time a cart hits a pothole. Toll's five scrip. I don't want to know. Here's your cut."
                : L.flag("bridge_paid")
                  ? "You paid him off? With your own scrip? That's either very generous or very stupid, and out here those look the same. The Brooklyn traders are crossing again, though. Take this."
                  : "Tony's done and the bridge is open. Brooklyn wagons are already lining up. Nice work.",
          responses: [
            { text: "Glad to help.", action: () => Q.complete("sq_bridge") },
          ],
        },
        glow_warn: {
          text: "They WHAT? [She takes a breath.] Okay. Okay. Thank you. That tower feeds every tap in this building. I'm putting two guards on it and a third guard on the first two. You did right telling me.",
          onEnter() {
            L.setFlag("glow_told_delphine");
            L.standing(50, "Warned Grand Central");
            L.giveScrip(60);
          },
          responses: [{ text: "Keep your people safe." }],
        },
      },
    });

    // ---------------- Moe Kessler (Oyster Bar) ----------------
    L.dialogue("dlg_gc_moe", {
      start: () =>
        Q.stage("mq02") === "ask" ||
        Q.stage("mq02") === "travel" ||
        Q.stage("mq02") === "gallery"
          ? "zeke"
          : "bar",
      nodes: {
        zeke: {
          text: "Welcome to the Oyster Bar, home of zero oysters since '67. What'll it be? ...Hold on. Grey padded suit, orange collar, the look of a man who just found out what year it is. You're the other one. Zeke's buddy from the freezer. He said you'd thaw out eventually. He said you'd be taller, but he said a lot of things after the third drink.",
          responses: [
            { text: "Where is he? Is he alright?", next: "zeke2" },
            {
              text: "What else did he say after the third drink?",
              check: { attr: "presence", value: 5 },
              next: "zeke_c",
              failNext: "zeke2",
            },
            {
              text: "Buy me a drink first. (10 scrip)",
              next: "drink",
              cond: () => L.scrip() >= 10,
            },
          ],
        },
        drink: {
          text: "A man after Zeke's own heart. [He pours something amber and slightly fizzy.] On the house — no, I'm kidding, ten scrip. Now: Zeke.",
          onEnter() {
            L.pay(10);
            L.give(["beer", "fizzo_cola"], 1, true);
          },
          responses: [{ text: "Where is he?", next: "zeke2" }],
        },
        zeke_c: {
          text: "He said the computer down in your hole was the best roommate he ever had, because it never finished a sentence. Then he got quiet. Then he said you two had a deal: whoever woke up first waits for the other one, and he broke it, and he's sorry. [He slides a tape reel across the bar.] He said you'd probably try to pay for it. Don't.",
          onEnter() {
            L.setFlag("moe_extra");
            L.xp(10, "Presence");
          },
          responses: [{ text: "Where did he go?", next: "zeke2" }],
        },
        zeke2: {
          text: "Went to see \"Rocky\" Delgado over at Radio City — the DJ. Something about government chatter coming off the Statue of Liberty. That was nine days ago. He left this for you. [A worn tape reel.] Radio City's on Sixth Avenue, north of Times Square. Don't cut through Times Square after dark unless you like Maniacs. The Neon folks there are fine. The Maniacs are not folks anymore.",
          onEnter() {
            if (!L.has("q_reel_zeke_travel")) L.give("q_reel_zeke_travel", 1);
          },
          responses: [
            {
              text: "Did he ask about anybody else? A woman. Nicole Mead.",
              next: "nicky",
              cond: () => !L.flag("ms_moe_nicky"),
            },
            {
              text: "Thanks, Moe. I owe you one.",
              action: () => Q.complete("mq02"),
            },
            {
              text: "Let me see what you've got for sale first.",
              barter: true,
              action: () => Q.complete("mq02"),
            },
          ],
        },
        bar: {
          text: () =>
            [
              "Back again? The tunnel shrimp are fresh. Well. They're fresher than yesterday's.",
              "What'll it be, Popsicle?",
              "You look like a man who needs a Fizzo. Or a nap. You already had the nap. Fizzo it is.",
            ][Math.floor(Math.random() * 3)],
          responses: [
            barterR,
            { text: "What's the word around the market?", next: "rumor" },
            { text: "What exactly is tunnel shrimp?", next: "shrimp" },
            { text: "See you, Moe." },
          ],
        },
        nicky: {
          text: "Funny you say that. Zeke asked after a Nicky Mead too, every night, like it was a toast. Nobody knew the name. [He wipes the same spot on the bar twice.] And here's a funny one: a girl with a rifle came in yesterday. Didn't drink. Asked me whether a man in a grey padded suit had come through. I said no. She said \"He will,\" and left a tip. Nobody leaves a tip.",
          onEnter() {
            L.setFlag("ms_moe_nicky");
          },
          responses: [
            {
              text: "Thanks, Moe. I owe you one.",
              action: () => Q.complete("mq02"),
            },
            { text: "What did she look like?", next: "girl" },
          ],
        },
        girl: {
          text: "Young. Leather jacket. Hair scraped back like it owed her money. Rifle with a scope taped up in white. She looked at the door the whole time she talked to me. People who look at the door are either scared or waiting. She wasn't scared.",
          responses: [
            { text: "Thanks, Moe.", action: () => Q.complete("mq02") },
          ],
        },
        shrimp: {
          text: "Crustacean. Probably. Comes out of the flooded tracks under Track 42. It's got more legs than a shrimp and fewer than a giant roach, and I choose to live in that middle ground.",
          responses: [barterR, { text: "I'll pass." }],
        },
        rumor: {
          text: () => {
            const r = [];
            if (!Q.isStarted("sq_neon"))
              r.push(
                "Mayor Crowe over at Times Square says the Neon's lights are dying. Man looks worried, and Neon folks don't worry easy. They've already had the worst day there is.",
              );
            if (!Q.isStarted("sq_overdue"))
              r.push(
                "The Iron Covenant's got an Archivist at Rockefeller paying scrip for old-world books. The Public Library's full of books. Also Maniacs. It's a trade-off.",
              );
            if (!Q.isStarted("sq_wagon"))
              r.push(
                "Hattie Caldwell's convoy never showed up from the Flatiron. Hattie's stuck down there worrying herself sick.",
              );
            if (!Q.isStarted("sq_shellshock"))
              r.push(
                "Old Ossie, the ferryman at Battery Park, is having Shellback trouble. Says they keep trying to eat his boat.",
              );
            if (!Q.isStarted("sq_biscuit") && !L.flag("biscuit_recruited"))
              r.push(
                "Traders keep talking about a dog down at Bethesda Terrace in the park. Won't leave some dead fella's side. Breaks your heart.",
              );
            if (!r.length)
              r.push(
                "Word is, YOU'RE the word around the market. Rocky won't shut up about you.",
              );
            return r[Math.floor(Math.random() * r.length)];
          },
          responses: [
            { text: "Anything else?", next: "rumor" },
            barterR,
            { text: "Thanks, Moe." },
          ],
        },
      },
    });

    // ---------------- INFO-BOT ----------------
    L.dialogue("dlg_gc_infobot", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "INFO-BOT",
          text: "WELCOME TO GRAND CENTRAL TERMINAL. I AM INFO-BOT. HOW MAY I DIRECT YOUR JOURNEY? PLEASE NOTE: ALL TRAINS ARE DELAYED. DELAY ESTIMATE: INDEFINITE.",
          responses: [
            {
              text: "Have you seen a man named Zeke Marlow? (20 scrip)",
              next: "zeke",
              cond: () =>
                !L.flag("infobot_zeke") &&
                (Q.isActive("mq02") || Q.isActive("mq03")),
            },
            {
              text: "Look up a missing person: Nicole Mead. (10 scrip)",
              next: "nicole",
              cond: () =>
                !L.flag("ms_knows_track61") &&
                L.scrip() >= 10 &&
                Q.isStarted("mq02"),
            },
            {
              text: "I need a map of Manhattan. (30 scrip)",
              next: "map",
              cond: () => !L.flag("infobot_map"),
            },
            { text: "Sell me a rumour. (10 scrip)", next: "rumor" },
            { text: "When is the next train?", next: "train" },
            { text: "Let me see your merchandise.", barter: true },
            { text: "Goodbye." },
          ],
        },
        zeke: {
          text: 'PROCESSING PAYMENT... THANK YOU. PASSENGER "MARLOW, EZEKIEL" DEPARTED THIS TERMINAL NINE DAYS AGO. DESTINATION DECLARED: RADIO CITY MUSIC HALL. PASSENGER ASKED ME FOR A "SIGNAL AMPLIFIER." I DO NOT SELL THOSE. PASSENGER CALLED ME "A GLORIFIED TIMETABLE." I HAVE LOGGED THIS.',
          onEnter() {
            if (L.pay(20)) {
              L.setFlag("infobot_zeke");
              if (Q.stage("mq02") === "ask" || Q.stage("mq02") === "gallery") {
                L.give("q_reel_zeke_travel", 1);
                Q.complete("mq02");
              }
            }
          },
          responses: [{ text: "Thanks, Info-Bot.", next: "hello" }],
        },
        nicole: {
          text: 'PROCESSING PAYMENT... THANK YOU. SEARCHING "LOST PERSONS BOARD, 1967-1968"... ONE (1) ENTRY.\n\nMEAD, NICOLE: INQUIRE TRACK 61.\n\nTHERE IS NO TRACK 61. PLEASE DISREGARD.',
          onEnter() {
            if (L.pay(10)) {
              L.setFlag("ms_knows_track61");
              if (!L.has("ms_note_infobot_lost"))
                L.give("ms_note_infobot_lost", 1, true);
            }
          },
          responses: [
            { text: "Who posted that entry?", next: "nicole2" },
            { text: "Thanks, Info-Bot.", next: "hello" },
          ],
        },
        nicole2: {
          text: "ENTRY POSTED: 1968. AUTHOR: NOT LOGGED. HANDWRITING: NEAT. INFO-BOT IS REQUIRED TO REPEAT THAT THERE IS NO TRACK 61. INFO-BOT HAS BEEN REQUIRED TO REPEAT THIS SINCE 1913.",
          responses: [{ text: "Thanks, Info-Bot.", next: "hello" }],
        },
        map: {
          text: 'PROCESSING PAYMENT... THANK YOU. TRANSMITTING "VISITOR\'S MAP OF MANHATTAN, WORLD\'S FAIR EDITION, 1964" TO YOUR GOGGLES. PLEASE DISREGARD ALL ATTRACTIONS LISTED AS "OPEN."',
          onEnter() {
            if (L.pay(30)) {
              L.setFlag("infobot_map");
              for (const id of [
                "radio_city",
                "times_square",
                "rockefeller",
                "st_patricks",
                "empire_state",
                "nypl",
                "flatiron",
                "battery_park",
                "brooklyn_bridge",
                "sterlings",
                "met",
              ])
                G.discover(id);
              L.notify(
                "Map data received: 11 locations added to your goggles.",
              );
            }
          },
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        rumor: {
          text: () => {
            const r = [
              'RUMOR #0412: THE BRUTES IN THE EMPIRE STATE BUILDING ANSWER TO A "KING." HE IS LARGE. THAT IS ALL THE RUMOR SAYS. HE IS LARGE.',
              "RUMOR #0977: THE CONTINUITY AT THE UNITED NATIONS WILL NOT FIRE ON ANYONE WEARING A LONG WINTER CRYO SUIT. RELIABILITY: 61%.",
              "RUMOR #1103: A SNIPER IN THE CHRYSLER BUILDING ONLY SHOOTS ROBOTS. INFO-BOT IS A ROBOT. INFO-BOT HAS STOPPED STANDING NEAR WINDOWS.",
              "RUMOR #1288: THE STERLING'S WINTER CLEARANCE SALE IS STILL IN PROGRESS. ATTENDANCE: MANIACAL.",
              "RUMOR #1501: THE GLOWKEEPERS AT ST. PATRICK'S PAY WELL FOR ERRANDS. THE ERRANDS GLOW.",
              "RUMOR #1622: THERE IS A RECOILLESS ROUND ON THE ROOF OF THE MET. RELIABILITY: 4%. INFO-BOT WANTED YOU TO HAVE HOPE.",
            ];
            return r[Math.floor(Math.random() * r.length)];
          },
          onEnter() {
            L.pay(10);
          },
          responses: [
            {
              text: "Another. (10 scrip)",
              next: "rumor",
              cond: () => L.scrip() >= 10,
            },
            { text: "That's enough.", next: "hello" },
          ],
        },
        train: {
          text: "THE NEXT TRAIN, THE 8:15 TO POUGHKEEPSIE, DEPARTS FROM TRACK 23 IN THE SPRING OF 1967. WE APOLOGIZE FOR THE INCONVENIENCE. THE INCONVENIENCE HAS BEEN ONGOING FOR TWENTY-TWO YEARS. PLEASE ENJOY THE MARKET.",
          responses: [{ text: "Right.", next: "hello" }],
        },
      },
    });

    // ---------------- Doc Hollis ----------------
    L.dialogue("dlg_gc_doc", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            "Doc Hollis. Bullets out, stitches in, rads down. " +
            (G.player.hp < G.player.maxHp * 0.6
              ? "And by the look of you, I'd start with the bullets."
              : "What's the trouble?"),
          responses: [
            {
              text: "Patch me up. (30 scrip)",
              next: "heal",
              cond: () => G.player.hp < G.player.maxHp,
            },
            {
              text: "Get rid of my radiation. (40 scrip)",
              next: "rads",
              cond: () => G.player.rads > 0,
            },
            { text: "Let me see your medical supplies.", barter: true },
            {
              text: "You look swamped. Want a hand with the patients?",
              check: { skill: "medicine", value: 40 },
              next: "triage",
              failNext: "triage_fail",
              cond: () => !L.flag("doc_triage"),
            },
            {
              text: "Forty scrip for a radiation flush? Make it twenty and I'll send you every customer I meet.",
              check: { skill: "trade", value: 45 },
              next: "haggle",
              failNext: "haggle_fail",
              cond: () => !L.flag("doc_discount"),
            },
            { text: "How did you become a doctor out here?", next: "story" },
            { text: "Just passing through." },
          ],
        },
        heal: {
          text: () =>
            "Bite down on this. No, not the scalpel. [A few minutes of unpleasantness.] There. You'll live. " +
            (L.flag("doc_discount")
              ? "Fifteen, colleague rate."
              : "That's thirty."),
          onEnter() {
            if (L.pay(L.flag("doc_discount") ? 15 : 30)) {
              G.player.heal(G.player.maxHp);
              L.sfx("inject");
            }
          },
          responses: [{ text: "Thanks, Doc." }],
        },
        rads: {
          text: () =>
            "Two capsules of Prussian Blue, a glass of water and an hour on the cot while I tell you about my cat. [An hour passes. The cat was named Mister Whiskers. The cat had two tails.] You're clean. " +
            (L.flag("doc_discount") ? "Twenty scrip." : "Forty scrip."),
          onEnter() {
            if (L.pay(L.flag("doc_discount") ? 20 : 40)) L.removeRads();
          },
          responses: [{ text: "Thanks, Doc." }],
        },
        triage: {
          text: "[For an hour you work the cots beside him: a convoy guard with buckshot in his thigh, a kid with a burrow-rat bite going dark at the edges, an old woman with burn-scarred hands who only wants someone to hold one. You set a splint the way the Long Winter first-aid course drilled into you. Hollis watches, then stops watching.] ...You've got hands, mister. Steady ones. Here — you earned these. And from now on you pay colleague rates.",
          onEnter() {
            L.setFlag("doc_triage");
            L.setFlag("doc_discount");
            L.xp(40, "Medicine: Triage at Grand Central");
            L.standing(50, "Helped Doc Hollis");
            L.give("rally_tonic", 2);
          },
          responses: [{ text: "Any time, Doc." }],
        },
        triage_fail: {
          text: "[You reach for the bone saw. Hollis gently takes it out of your hand, the way you'd take scissors from a toddler.] Tell you what. You hold the lamp.",
          onEnter() {
            L.setFlag("doc_triage");
          },
          responses: [{ text: "Holding the lamp." }],
        },
        haggle: {
          text: "[He squints at you over his glasses.] Every customer, huh? ...Out here, word of mouth is the only advertising that doesn't get shot. Fine. Twenty for the flush, fifteen for patching. Don't tell Rosa; she'll want a discount on principle.",
          onEnter() {
            L.setFlag("doc_discount");
            L.xp(15, "Trade");
          },
          responses: [{ text: "Pleasure, Doc." }],
        },
        haggle_fail: {
          text: "Mister, I've haggled with raiders who were actively on fire. Forty scrip.",
          responses: [{ text: "Worth a try." }],
        },
        story: {
          text: "I was a third-year at Bellevue when the bombers came. Never finished. The textbooks I finished myself, by candlelight, on the deep platforms downstairs — one I fished out of a flooded pharmacy had lost chapters six through nine, so I'm excellent with bones and skin and I improvise with organs. Nobody's complained. Nobody who's still around.",
          responses: [{ text: "That's... reassuring." }],
        },
      },
    });

    // ---------------- Rosa "Two-Guns" Marquez ----------------
    const sellAmp = (price, why) => {
      if (L.pay(price)) {
        L.setFlag("rosa_sold_amp");
        L.give("q_signal_amplifier", 1);
        if (why) L.xp(10, why);
      }
    };
    L.dialogue("dlg_gc_rosa", {
      start: "hello",
      nodes: {
        hello: {
          text: 'Rosa Marquez. They call me Two-Guns because I have two guns. I had three once, but "Three-Guns" sounds like a breakfast cereal. You buying or browsing?',
          responses: [
            { text: "I'm buying.", barter: true },
            {
              text: "I need a signal amplifier for a radio transmitter.",
              next: "amp",
              cond: () =>
                (Q.stage("mq03") === "amp" || Q.stage("mq03") === "rocky") &&
                !L.has("q_signal_amplifier"),
            },
            { text: "Any advice for a newcomer?", next: "advice" },
            { text: "Just browsing." },
          ],
        },
        amp: {
          text: "A broadcast amp? I got one. Pulled it out of a dead Sky-Eye drone, if you can believe it — the Continuity floats those things all over Midtown, and every one's got a little transmitter in its belly. It'll cost you. Two hundred and fifty scrip.",
          responses: [
            {
              text: "Deal. (250 scrip)",
              cond: () => L.scrip() >= 250,
              action: () => sellAmp(250),
            },
            {
              text: "Two-fifty for a drone's guts? How about one-fifty.",
              check: { skill: "trade", value: 45 },
              next: "amp_deal",
              failNext: "amp_nodeal",
            },
            {
              text: "It's for Radio Free Manhattan. For Rocky.",
              check: { attr: "presence", value: 6 },
              next: "amp_rocky",
              failNext: "amp_nodeal",
            },
            { text: "I'll find one elsewhere." },
          ],
        },
        amp_deal: {
          text: "...You drive a hard bargain for somebody who still has frost behind his ears. Fine. One-fifty.",
          responses: [
            {
              text: "Deal. (150 scrip)",
              cond: () => L.scrip() >= 150,
              action: () => sellAmp(150, "Trade"),
            },
            { text: "I'll come back." },
          ],
        },
        amp_rocky: {
          text: "For Rocky? [Her face softens.] He played my mother's favourite song the night she passed. Didn't know he was doing it — just did. ...Take it. Seventy-five scrip, for the drone's trouble. Tell him Rosa says hi. Don't tell him I cried.",
          responses: [
            {
              text: "Deal. (75 scrip)",
              cond: () => L.scrip() >= 75,
              action: () => sellAmp(75, "Presence"),
            },
            { text: "I'll come back." },
          ],
        },
        amp_nodeal: {
          text: "Two-fifty. The price is the price. The price is always the price. That's why they call it the price.",
          responses: [
            {
              text: "Deal. (250 scrip)",
              cond: () => L.scrip() >= 250,
              action: () => sellAmp(250),
            },
            { text: "Forget it." },
          ],
        },
        advice: {
          text: "Three rules. One: always carry more ammo than you think. Two: Brutes are slow, but they don't stop. Three: if somebody in rags starts screaming and running at you, it's a Maniac. If he walks up and asks for directions, he's just ragged, and he's a person. Don't get those mixed up. People hate that.",
          responses: [{ text: "Thanks, Rosa.", next: "hello" }],
        },
      },
    });

    // ---------------- Market vendors (generic) ----------------
    L.dialogue("dlg_gc_vendor", {
      start: "hello",
      nodes: {
        hello: {
          text: (a) =>
            a && a.name === "Aqua Al"
              ? "Aqua Al's Aqua! Clean water, pumped fresh from somewhere under the Hudson I don't like to think about. What'll it be?"
              : "Scrapper Sue. Everything here fell off something. Some of it fell off something that was on fire. You buying?",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Where does all this come from?", next: "where" },
            { text: "Just looking." },
          ],
        },
        where: {
          text: (a) =>
            a && a.name === "Aqua Al"
              ? "Pump under Track 19. Big fella in a grey suit like yours fixed it for free a couple weeks back — Zeke. Good man, talked too much about pipes. Water's been clearer since."
              : "Everywhere. Nowhere. Mostly the Chrysler, before the raiders got touchy. Now mostly Sterling's, which is worse, because of the customers.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Thanks." },
          ],
        },
      },
    });

    // ---------------- Market guards ----------------
    L.dialogue("dlg_gc_guard", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            [
              "Market's safe as long as I'm standing here. I'm standing here a lot.",
              "Holster that thing in the concourse, friend. Stationmaster's rules.",
              "You hear about the sniper on 42nd? Keep your head down on the way out.",
              "Brooklyn Bridge gang again. Every week it's ten more scrip.",
            ][Math.floor(Math.random() * 4)],
          responses: [
            {
              text: "What's on the Stationmaster's teletype?",
              next: "passcode",
              cond: () => !!L.flag("met_delphine"),
            },
            { text: "Stay safe." },
          ],
        },
        passcode: {
          text: "Rents, gripes, who owes who. Boring stuff. She thinks nobody knows the passcode, but it's her birthday — JUNENINE, all one word. Every guard in this building signed the card. [Lowers voice.] You didn't hear it from me. You heard it from the other guard.",
          learn: LOCK_GC.id,
          onEnter() {
            learn(LOCK_GC.id);
          },
          responses: [{ text: "My lips are sealed." }],
        },
      },
    });

    // ---------------- "Rocky" Delgado ----------------
    L.dialogue("dlg_rc_rocky", {
      start: () => {
        const s = Q.stage("mq03");
        if (s === "rocky") return "meet";
        // amplifier picked up before the quest reached 'amp' (no itemAdded will come again): straight to delivery
        if (s === "amp") {
          if (L.has("q_signal_amplifier")) {
            Q.setStage("mq03", "deliver");
            return "deliver";
          }
          return "amp_wait";
        }
        if (s === "deliver") return "deliver";
        if (s === "notice") return "notice";
        if (s === "listen") return "listen";
        return L.flag("met_rocky") ? "again" : "meet_early";
      },
      nodes: {
        meet_early: {
          text: '"Rocky" Delgado, the Bronx Bomber of the Airwaves, three-time Golden Gloves runner-up, current undisputed champion of the dial! You\'re in Radio City, pal — only building in Manhattan with better acoustics after the bombs than before. What can Rocky do for ya?',
          onEnter() {
            L.setFlag("met_rocky");
          },
          responses: [
            { text: "Just a fan, Rocky." },
            { text: "Tell me about the station.", next: "station" },
          ],
        },
        meet: {
          text: () =>
            '"Rocky" Delgado, champion of the dial! And you — grey suit, orange collar, walking like your knees are still on ice — you\'re ' +
            first() +
            ". Zeke's " +
            first() +
            ". Oh, pal. Sit down. No, not there, that's the sound board. THERE.",
          onEnter() {
            L.setFlag("met_rocky");
          },
          responses: [
            { text: "Where's Zeke?", next: "zeke" },
            { text: "How do you know who I am?", next: "know" },
          ],
        },
        know: {
          text: 'Zeke described you for three days straight. "Skinny, serious, files his paperwork early, still owes me a dollar from the commissary." He had a photograph, too. You were holding a clipboard in it. The resemblance holds.',
          responses: [{ text: "Where is he, Rocky?", next: "zeke" }],
        },
        zeke: {
          text: "Honest answer? I don't know. Zeke came here because I'd been catching something weird under Continuity Radio — you know, the government station, Acting President Marsh reading 1967 bond rates every night. Underneath the anthem there's a second channel. Coded. Coming off the Statue of Liberty. Zeke heard one word of it and went white: \"Knickerbocker.\" He wanted to listen in properly. My amp ain't strong enough. He went to find a better one. Nine days ago.",
          responses: [
            { text: "Then I'll find the amplifier.", next: "where_amp" },
            {
              text: "Could we boost the signal some other way?",
              check: { skill: "electronics", value: 50 },
              next: "science",
              failNext: "science_fail",
            },
            {
              text: "Could I just fix your amplifier?",
              check: { skill: "mechanics", value: 45 },
              next: "repair",
              failNext: "science_fail",
            },
          ],
        },
        where_amp: {
          text: "Chrysler Building — the raiders up there stripped a broadcast amp off the old WNYC relay years ago. Zeke was headed there. Or, I hear Rosa Marquez at Grand Central sells anything that fits in a crate, if you've got scrip and don't ask where it came from.",
          onEnter() {
            if (L.has("q_signal_amplifier")) {
              Q.setStage("mq03", "deliver");
              return "deliver";
            }
            Q.setStage("mq03", "amp");
          },
          responses: [{ text: "I'll be back." }],
        },
        science: {
          text: "...You want to run the receiver through the Music Hall's stage lighting grid? Four thousand bulbs as an antenna array? That's — that's crazy. That's beautiful. ROCKETTE! Plug in the lights! ALL the lights!",
          onEnter() {
            L.setFlag("mq03_science");
            L.xp(40, "Electronics: The Rockette Array");
          },
          responses: [
            {
              text: "Let's hear it.",
              action: () => Q.setStage("mq03", "listen"),
              next: "listen",
            },
          ],
        },
        repair: {
          text: "You reseat the tubes, bridge a cracked coil with a hairpin and a prayer, and — ha! Listen to that hum! That's the sound of a transmitter that wants to get back in the ring, pal.",
          onEnter() {
            L.setFlag("mq03_repair");
            L.xp(40, "Mechanics: Radio Free Manhattan");
          },
          responses: [
            {
              text: "Let's hear it.",
              action: () => Q.setStage("mq03", "listen"),
              next: "listen",
            },
          ],
        },
        science_fail: {
          text: "Pal, I love the enthusiasm, but you just tried to plug the microphone into the coffee pot. We need a real amplifier.",
          responses: [{ text: "Where would I find one?", next: "where_amp" }],
        },
        amp_wait: {
          text: "Any luck with that amplifier? Chrysler Building raiders or Rosa at Grand Central. Rocky'll keep the coffee warm. The coffee is not coffee.",
          responses: [{ text: "Working on it." }],
        },
        deliver: {
          text: "Is that — oh, baby. A genuine Teletype broadcast amplifier. Give it here. [He cradles it like a newborn.] ROCKETTE! We're going LOUD!",
          onEnter() {
            if (L.take("q_signal_amplifier", 1)) {
              L.setFlag("amp_delivered");
              L.xp(40, "Delivered the amplifier");
            }
          },
          responses: [
            {
              text: "Let's hear that signal.",
              action: () => Q.setStage("mq03", "notice"),
              next: "notice",
            },
          ],
        },
        notice: {
          text: () =>
            "Before we go chasing ghosts on the government band, one thing. [He pulls a clipboard off a nail: MISSING PERSONS HOUR, 9 PM NIGHTLY.] Every night at nine I read the names. Folks looking for folks. Most of them never get an answer. Some do. " +
            "Zeke said you were going to marry somebody, pal. Before. You want her name on the air?",
          responses: [
            {
              text: () =>
                '"Nicole Mead — ' +
                first() +
                "'s awake. Whispering Gallery, Sundays.\"",
              action: () => {
                L.setFlag("ms_notice", "sundays");
              },
              next: "notice2",
            },
            {
              text: "Just her name and what she looked like.",
              action: () => {
                L.setFlag("ms_notice", "plain");
              },
              next: "notice2",
            },
          ],
        },
        notice2: {
          text: () =>
            "[He writes it down in block capitals, reads it back, nods.] Goes out tonight at nine, and every night after till you tell me to stop. " +
            (L.flag("ms_notice") === "sundays"
              ? "\"Whispering Gallery, Sundays.\" That's a good one. That's the kind people answer. "
              : "") +
            "Now. The government. [He cracks his knuckles.] ROCKETTE! Headphones!",
          onEnter() {
            if (Q.stage("mq03") === "notice") Q.setStage("mq03", "listen");
          },
          responses: [{ text: "Let's hear it.", next: "listen" }],
        },
        listen: {
          text: "[Rocky twists a dozen knobs. The anthem swells, then drops away, and under it a flat federal voice reads a docket: \"...Asset MARLOW, E. — Long Winter, Unit C-9 — in custody, Liberty Station. Knickerbocker Array: ignition pending. Liberty Key not recovered. Second sleeper expected. Do not engage the second sleeper...\" Then, further back, a voice you last heard in 1967, swearing at somebody about water pressure.] ...That's him. That's Zeke. They've got him on Liberty Island, pal. The Continuity.",
          onEnter() {
            if (!L.has("q_reel_intercept")) L.give("q_reel_intercept", 1);
            L.sfx("hum_electric");
          },
          responses: [
            { text: "Who are the Continuity?", next: "continuity" },
            { text: "How do I get to Liberty Island?", next: "how" },
          ],
        },
        dawnhour: {
          text: "Oh, her. Every morning at five forty-seven since '79 some pirate steps all over my frequency for fifteen minutes. A woman reading scripture. Sun this, light that. Nice voice. Gives me the creeps. Flint — my tube runner, kid with a rifle, keeps my transmitter in valves — Flint says ignore it. She says it like she's heard it a thousand times.",
          responses: [
            {
              text: "Thanks, Rocky. For everything.",
              standing: 2,
              action: () => Q.complete("mq03"),
            },
            { text: "I'll get him back.", action: () => Q.complete("mq03") },
          ],
        },
        continuity: {
          text: "What's left of the federal government — or what thinks it is. Pressed uniforms, rubber stamps, Sky-Eye drones floating around playing the anthem. As far as they're concerned it's still March of 1967 and the emergency is temporary. Acting President Marsh is on the air every night telling folks to keep calm and file Form 22-B. They hold the UN Plaza and Liberty Island, and they are very polite right up until they ain't.",
          responses: [{ text: "How do I get to Liberty Island?", next: "how" }],
        },
        how: {
          text:
            "Listen to it again: \"Liberty Key not recovered. Second sleeper expected.\" They're holding Zeke because they need the key YOU carry. No key, no deal. So Zeke's safe as long as you stay out of their hands — that's the good news. The bad news: nobody crosses to Liberty without an army. Not me, not you, not this week. " +
            "You want to get out there someday, pal, make a name first. Make friends with guns. And in the meantime — [he taps the clipboard] — your notice goes out every night. Rocky's in your corner.",
          responses: [
            {
              text: "Who's the woman who keeps stepping on your signal?",
              next: "dawnhour",
              cond: () => !L.flag("ms_rocky_dawnhour"),
              action: () => L.setFlag("ms_rocky_dawnhour"),
            },
            {
              text: "Thanks, Rocky. For everything.",
              standing: 2,
              action: () => Q.complete("mq03"),
            },
            { text: "I'll get him back.", action: () => Q.complete("mq03") },
          ],
        },
        again: {
          text: () =>
            [
              "Hey hey, it's the Thawed Man of Chambers Street! What's the news, pal? Give Rocky something to talk about!",
              "You're on the air! No, I'm kidding. Or am I? I am. Probably.",
              'Listeners have been calling in about you. Well, "calling" — they shout at the building. Same thing.',
            ][Math.floor(Math.random() * 3)],
          responses: [
            { text: "Tell me about the station.", next: "station" },
            { text: "Any news?", next: "news" },
            { text: "Keep the music playing, Rocky." },
          ],
        },
        station: {
          text: "Radio Free Manhattan! Swing, jazz, a little crooning, news of the day, and whatever the Rockette finds in the basement. We're free because nobody pays for it, and we're Manhattan because I refuse to be Radio Free Hoboken.",
          responses: [
            { text: "Any news?", next: "news" },
            { text: "Keep it up." },
          ],
        },
        news: {
          text: () =>
            L.flag("ending_played")
              ? "News? PAL. You ARE the news. There's a whole new sky out there and it's got your fingerprints on it."
              : Q.isComplete("mq05")
                ? "Word is a certain sleeper took something shiny off a nine-foot Brute in the Empire State. Word is, Liberty Island's next. Word is, Rocky's biting his nails."
                : "Convoys say the Brooklyn Bridge tolls are highway robbery. Which, to be fair, is technically what they are.",
          responses: [{ text: "Thanks, Rocky." }],
        },
      },
    });

    // ---------------- ROCKETTE-7 ----------------
    L.dialogue("dlg_rc_rockette", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "ROCKETTE-7",
          text: "WELCOME TO RADIO CITY MUSIC HALL, WHERE THE SHOW NEVER STOPS! I AM ROCKETTE-7, A VALET-SERIES STAGE MANAGER, LIGHTING TECHNICIAN AND 1/36TH OF A KICK LINE. THE OTHER 35 ARE... ON BREAK.",
          responses: [
            { text: "Can you still dance?", next: "dance" },
            { text: "What happened to the other Rockettes?", next: "others" },
            { text: "Goodbye." },
          ],
        },
        dance: {
          text: "CAN I STILL — ! FIVE, SIX, SEVEN, EIGHT! [Its jointed legs snap up in perfect sequence, gyros whining, sequins it glued on itself flashing under the work lights. It is, honestly, very good.] THANK YOU. PLEASE TIP YOUR STAGE MANAGER.",
          responses: [
            {
              text: "Bravo! (tip 5 scrip)",
              cond: () => L.scrip() >= 5,
              action: () => {
                if (L.pay(5)) {
                  L.standing(1, "Tipped a robot");
                  L.say("rc_rockette", "A PATRON OF THE ARTS!");
                }
              },
            },
            { text: "Very impressive." },
          ],
        },
        others: {
          text: "THE OTHER THIRTY-FIVE WERE HUMAN. THE DAY THE BOMBERS CAME, THE MATINEE WAS SOLD OUT. [It pauses for a long moment.] THE SHOW MUST GO ON. SOMEBODY HAS TO KEEP DANCING FOR THEM.",
          responses: [
            { text: "I'm sorry." },
            { text: "Then keep dancing.", standing: 1 },
          ],
        },
      },
    });
  });

