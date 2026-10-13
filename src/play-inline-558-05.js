// play-inline-558 05 — next
// Lines 1103-1814 of readable/play-inline-558.pretty.js (statement-aligned).
  L.hook("register", function () {
    if (!G.isStub("locks") && G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({}, LOCKER_LOCK));
      } catch (e) {
        G.reportError("quests:neon locker lock", e);
      }
    }
    if (!G.isStub("locks") && G.locks && G.locks.obtainableFrom) {
      try {
        G.locks.obtainableFrom(
          LOCKER_LOCK.key,
          "Dottie at the Neon bunkhouse (rent the locker for 100 scrip)",
        );
      } catch (e) {
        /* optional */
      }
    }

    L.dialogue(
      "dlg_neon_broadway",
      N().sleepy({
        start: () => (L.flag("met_broadway") ? "hello" : "first"),
        nodes: {
          first: {
            text: 'Ah! A stranger, and a leaky one. Doc Broadway — surgeon, pharmacist, and for nine years the understudy for the Count in "Midnight at the Opera House." The Count wore a half-mask. The Count never missed a show. Not once. Not even the night of the bombs. Anyway! What seems to be the trouble?',
            onEnter() {
              L.setFlag("met_broadway");
            },
            responses: [
              { text: "I need some treatment.", next: "hello" },
              { text: "Understudy?", next: "mask" },
            ],
          },
          mask: {
            text: "The half-mask was the best part of the role. Now I don't need one — the fire did the whole half-face thing for free. Broadway giveth, Broadway taketh away. Now, you're dripping on my floor.",
            responses: [{ text: "Let's talk treatment.", next: "hello" }],
          },
          hello: {
            text: () =>
              G.player.rads > 400
                ? "Good lord, you're practically a night-light. Sit, sit."
                : hurt() || crippled()
                  ? "Let's have a look at you. Mm. Mm-hm. Yes. You're broken. What'll it be?"
                  : pick([
                      "Clean bill of health! Congratulations. That'll be nothing. I hate nothing.",
                      "You look fine. Disgustingly fine. Buying, then?",
                    ]),
            responses: [
              {
                text: () => "Heal my wounds. (" + price.hp() + " scrip)",
                cond: hurt,
                action: () => docHeal({ hp: true }, price.hp()),
                next: "done",
              },
              {
                text: () =>
                  "Flush out the radiation. (" + price.rads() + " scrip)",
                cond: rads,
                action: () => docHeal({ rads: true }, price.rads()),
                next: "done",
              },
              {
                text: () =>
                  "Fix my crippled limbs. (" + price.limbs() + " scrip)",
                cond: crippled,
                action: () => docHeal({ limbs: true }, price.limbs()),
                next: "done",
              },
              {
                text: () => "Cure my addictions. (" + price.add() + " scrip)",
                cond: addicted,
                action: () => docHeal({ addictions: true }, price.add()),
                next: "done",
              },
              {
                text: () =>
                  "The works — everything. (" + everythingCost() + " scrip)",
                cond: () =>
                  [hurt(), rads(), crippled()].filter(Boolean).length > 1,
                action: () =>
                  docHeal(
                    { hp: true, rads: true, limbs: true },
                    everythingCost(),
                  ),
                next: "done",
              },
              { text: "Let me see your medical supplies.", barter: true },
              {
                text: "You got anything… stronger? Under the counter?",
                cond: () => !L.flag("broadway_under"),
                check: { skill: "medicine", value: 40 },
                next: "under",
                failNext: "under_no",
              },
              {
                text: "Folks say you and Candy Rourke don't get along.",
                next: "candy",
                cond: () => !!L.flag("met_broadway"),
              },
              {
                text: "I'd like to donate — for the patients who can't pay. (100 scrip)",
                standing: 50,
                repeatStanding: true,
                cond: () =>
                  L.scrip() >= 100 &&
                  !!L.flag("met_broadway") &&
                  (Number(G.time.day) || 0) -
                    (Number(L.flag("broadway_donation_day")) || -99) >=
                    3,
                action: () => {
                  if (L.pay(100)) {
                    L.setFlag("broadway_donation_day", G.time.day);
                    L.incFlag("broadway_donations");
                  }
                },
                next: "donate",
              },
              { text: "Goodbye, Doc." },
            ],
          },
          done: {
            text: () =>
              pick([
                "There. Good as new. Well — good as used. Next!",
                "All done. Try not to die for at least a week, it's bad for my reputation.",
                "Finished! You were a very brave stranger. Here, have a lollipop. It's a bone.",
              ]),
            responses: [
              { text: "Something else, Doc.", next: "hello" },
              { text: "Thanks, Doc." },
            ],
          },
          under: {
            text: "[He lowers his voice.] A professional! Medicine is medicine, friend — the dose makes the poison. I keep a few little bottles for the long nights and the short tempers: Rush, Rage, Bull tabs, Focus pills. Priced accordingly. Don't tell Candy, he thinks he has a monopoly.",
            onEnter() {
              L.setFlag("broadway_under");
              const a = L.npc("neon_broadway");
              if (a && a.merchant) {
                const st = a.merchant.stock || (a.merchant.stock = []);
                for (const s of L.resolveStock(UNDER)) st.push(s);
              }
            },
            responses: [
              { text: "Show me.", barter: true },
              { text: "Maybe later.", next: "hello" },
            ],
          },
          donate: {
            text: () =>
              Number(L.flag("broadway_donations")) > 1
                ? "Again? [He takes the scrip, then takes off his spectacles and cleans them for a very long time.] The Kearny girl's lungs. That's where the last lot went. She says thank you. She says it wheezily, but she says it."
                : "[He stares at the notes as if they might be a trick.] For… nobody? For the ones who can't pay? [He clears his throat, which takes a while.] Nobody's done that since the Count's last matinee. I'll put it where it does the most good, and I'll never tell a soul. Especially not Candy.",
            responses: [
              { text: "Something else, Doc.", next: "hello" },
              { text: "Take care, Doc." },
            ],
          },
          under_no: {
            text: "Under the counter? There's only gum under the counter. Old gum. Old-world gum. [He looks at you like you're a rash.]",
            responses: [{ text: "Right.", next: "hello" }],
          },
          candy: {
            text: 'Candy Rourke sells pills to children and calls it "motivation." I sell pills to patients and call it "medicine." The difference, my friend, is a medical degree and a conscience. …I have one of those.',
            responses: [{ text: "Ha. Back to business.", next: "hello" }],
          },
        },
      }),
    );

    L.dialogue("dlg_neon_dottie", {
      start: () => "hello",
      nodes: {
        hello: {
          text: () =>
            pick([
              "Welcome to the Bunkhouse Hotel! Formerly the Hotel Astor. Formerly a hotel. Beds are " +
                bedPrice() +
                " scrip a night.",
              "You look like you could use a bed, sugar. And a bath. The bed's " +
                bedPrice() +
                " scrip. The bath is a rumour.",
            ]),
          responses: [
            {
              text: () =>
                "Rent a bed — sleep eight hours. (" + bedPrice() + " scrip)",
              action: () => sleepAt(8),
            },
            {
              text: () =>
                "Rent a bed — sleep until nightfall. (" +
                bedPrice() +
                " scrip)",
              cond: () => G.time.hour >= 5 && G.time.hour < 18,
              action: () => sleepAt(hoursUntil(20)),
            },
            {
              text: () =>
                "Rent a bed — sleep until morning. (" + bedPrice() + " scrip)",
              cond: () => G.time.hour >= 18 || G.time.hour < 4,
              action: () => sleepAt(hoursUntil(7)),
            },
            {
              text: "I'd like a storage locker. (100 scrip, yours for good)",
              cond: () => !L.flag("neon_locker"),
              action: () => {
                if (L.pay(100)) {
                  L.setFlag("neon_locker", true);
                  giveLockerKey();
                  L.notify(
                    "Bunkhouse Locker rented. Dottie hands you the only key. Probably the only key.",
                  );
                }
              },
            },
            {
              text: "I lost my locker key.",
              cond: () => !!L.flag("neon_locker") && !L.has(LOCKER_LOCK.key),
              action: () => {
                giveLockerKey();
                L.notify(
                  "Dottie sighs and hands you a fresh key from a cigar box full of them.",
                );
              },
            },
            { text: "Why so cheap?", next: "cheap" },
            { text: "Maybe later." },
          ],
        },
        cheap: {
          text: "Cheap? Sugar, it's a bunk in a burnt-out hotel full of showfolk who snore like a rotorcraft. Twenty scrip is robbery. I'm the robber. [She winks. A scarred eyelid is involved, mostly.]",
          responses: [{ text: "Fair enough.", next: "hello" }],
        },
      },
    });

    L.dialogue("dlg_neon_oracle", {
      start: () => (L.scrip() >= 5 ? "insert" : "broke"),
      nodes: {
        broke: {
          text: "[The brass automaton behind the glass stares at you. A slot glows: INSERT 5 SCRIP. You don't have 5 scrip. The automaton seems to know.]",
          responses: [{ text: "[Leave.]" }],
        },
        insert: {
          text: "[A turbaned automaton behind green glass, face cracked like an egg. The news-ticker above it spells TICKER ORACLE — THE FUTURE, 5 SCRIP — over and over.]",
          responses: [
            {
              text: "[Feed it 5 scrip.]",
              action: () => (L.pay(5) ? "fortune" : "broke"),
            },
            { text: "[Leave.]" },
          ],
        },
        fortune: {
          text: () => {
            L.sfx("terminal_type");
            const today = L.flag("neon_oracle_day") === G.time.day;
            let f;
            if (!today && Math.random() < 0.65) {
              const h = hints();
              f = h.length ? pick(h) : pick(JOKES);
            } else f = pick(JOKES);
            {
              const RF = [
                [/THE BALL THAT DOES NOT FALL/, "neon_rumor_ball"],
                [/HAND IS ON THE SWITCH/, "neon_rumor_power"],
                [/THE WALL NEEDS SHOULDERS/, "neon_rumor_guard"],
                [/A STAGE STANDS EMPTY/, "neon_rumor_opry"],
                [/FORTY-SECOND STREET STAIRS/, "neon_rumor_speakeasy"],
                [/THE VELVET ROPE/, "neon_rumor_club"],
              ];
              for (const [re, fl] of RF)
                if (re.test(f) && !L.flag(fl)) L.setFlag(fl);
            }
            if (!today) {
              L.setFlag("neon_oracle_day", G.time.day);
              if (!G.isStub("rpg") && G.rpg.addEffect)
                try {
                  G.rpg.addEffect({
                    id: "neon_fortune",
                    name: "Fortune's Favour",
                    kind: "buff",
                    duration: 900,
                    mods: { attrs: { senses: 1 } },
                    desc: "Senses +1",
                  });
                } catch (e) {
                  /* ignore */
                }
            }
            return (
              "[The automaton's head swivels. Its jaw clacks. A strip of ticker tape curls out of the slot:]\n\n\"" +
              f +
              '"' +
              (today
                ? ""
                : "\n\n[You feel a little sharper. Probably the theatre of it.]")
            );
          },
          responses: [
            {
              text: "[Feed it another 5 scrip.]",
              cond: () => L.scrip() >= 5,
              action: () => (L.pay(5) ? "fortune" : "broke"),
            },
            { text: "[Pocket the ticker tape and leave.]" },
          ],
        },
      },
    });

    L.dialogue(
      "dlg_neon_dealer",
      N().sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              dailyWon() >= CAP
                ? "You again. No. No no no. You've cleaned me out for today, pal. Come back tomorrow and let me win some back."
                : pick([
                    "Lucky Lou. Pull up a chair. Rad Jack — blackjack, but everything's slightly on fire. Ten, twenty-five or fifty a hand.",
                    "Sit, sit. Cards are warm, the deck is honest, and I'm only lying about one of those.",
                  ]),
            responses: [
              {
                text: "Deal me in. (10 scrip)",
                cond: () => dailyWon() < CAP && L.scrip() >= 10,
                action: () => deal(10),
              },
              {
                text: "Deal me in. (25 scrip)",
                cond: () => dailyWon() < CAP && L.scrip() >= 25,
                action: () => deal(25),
              },
              {
                text: "Deal me in. (50 scrip)",
                cond: () => dailyWon() < CAP && L.scrip() >= 50,
                action: () => deal(50),
              },
              { text: "Heard any rumours?", next: "rumor" },
              { text: 'Why "Lucky"?', next: "lucky" },
              { text: "Not tonight." },
            ],
          },
          table: {
            text: () => tableText(),
            responses: [
              {
                text: "Hit me.",
                action: () => {
                  RJ.you.push(draw());
                  L.sfx("ui_click");
                  const s = score(RJ.you);
                  return s > 21
                    ? settle(false)
                    : s === 21
                      ? settle(false)
                      : "table";
                },
              },
              { text: "Stand.", action: () => settle(false) },
              {
                text: () => "Double down. (" + RJ.bet + " more scrip)",
                cond: () => RJ.you.length === 2 && L.scrip() >= RJ.bet,
                action: () => {
                  if (!L.pay(RJ.bet)) return "table";
                  RJ.bet *= 2;
                  RJ.you.push(draw());
                  return settle(false);
                },
              },
            ],
          },
          result: {
            text: () =>
              "YOUR HAND: " +
              RJ.you.join("  ") +
              "   (" +
              score(RJ.you) +
              ")\nLOU'S HAND: " +
              RJ.lou.join("  ") +
              "   (" +
              score(RJ.lou) +
              ")\n\n" +
              RJ.msg,
            responses: [
              {
                text: () => "Again. (" + RJ.bet + " scrip)",
                cond: () => dailyWon() < CAP && L.scrip() >= RJ.bet,
                action: () => deal(RJ.bet),
              },
              { text: "Change the stakes.", next: "hello" },
              { text: "I'm done." },
            ],
          },
          rumor: {
            text: () => {
              const left = RUMORS.filter((r) => !L.flag(r[1]));
              const r = left.length ? left[0] : pick(RUMORS);
              L.setFlag(r[1]);
              return r[0];
            },
            responses: [
              { text: "Anything else?", next: "rumor" },
              { text: "Back to the cards.", next: "hello" },
            ],
          },
          lucky: {
            text: "I was dealing the midnight game at the Rad Room — well, it was the Automat back then — when the sirens went. Four of us under the counter. Three of us got up, and none of us got up pretty. I had a royal flush in my hand the whole time. Still got it. [He taps his breast pocket.] Never played it. Never will.",
            responses: [{ text: "Deal me in.", next: "hello" }],
          },
        },
      }),
    );

    L.dialogue(
      "dlg_neon_annie",
      N().sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              L.flag("neon_gallery_champ")
                ? "Well if it ain't my Deadeye! Back for more, champ? Your discount's still good."
                : pick([
                    "Ammo Annie's Shooting Gallery! Five scrip a round, thirty seconds, tin raiders pop up — you knock 'em down. Five hits pays fifteen, eight pays forty, twelve pays eighty and a ribbon.",
                    "Step right up! You look like somebody who can hit a tin can. Or at least look at one.",
                  ]),
            responses: [
              {
                text: "I'll take a round. (5 scrip)",
                cond: () => !GAL.active && !!N().place("gallery"),
                action: () => {
                  L.later(0.3, startGallery);
                },
              },
              { text: "Show me your guns.", barter: true },
              { text: () => "What's the record?", next: "record" },
              { text: "How'd you end up here?", next: "story" },
              { text: "Later, Annie." },
            ],
          },
          record: {
            text: () =>
              "House record's nineteen. Mine. Yours is " +
              (Number(L.flag("neon_gallery_best")) || 0) +
              ". " +
              ((Number(L.flag("neon_gallery_best")) || 0) >= 12
                ? "Respectable. Downright respectable."
                : "Keep practising. The tin raiders ain't going anywhere. Literally, they're bolted down."),
            responses: [{ text: "Back.", next: "hello" }],
          },
          story: {
            text: "County fair champion, Ohio, 1966. Came to New York for the national finals in the spring of '67. The finals were cancelled on account of Europe. I've been practising ever since. Twenty-two years of practice, sugar, and nothing else to do with my hands. Don't ever challenge me to a real duel.",
            responses: [{ text: "Noted.", next: "hello" }],
          },
        },
      }),
    );

    L.dialogue(
      "dlg_neon_goldie",
      N().sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Goldie Glass, Pawn Palace! I buy anything, sell everything, and pay twenty percent over what those stall rats pay. Where you got it? Don't care. Whose it was? Don't care more.",
                "Welcome back, my favourite customer! You're all my favourite customer. What are we selling?",
              ]),
            responses: [
              { text: "Let's deal.", barter: true, end: true },
              { text: "You buy stolen goods?", next: "fence" },
              { text: 'Why "Goldie"?', next: "gold" },
              { text: "Goodbye." },
            ],
          },
          fence: {
            text: "Stolen? There's no such thing as stolen, friend. There's only \"previously owned.\" Everything in New York was somebody else's once — they're just not using it anymore on account of being dead. You bring it, I pay. No questions, no sermons, no Captain Kincaid.",
            responses: [
              { text: "Let's deal.", barter: true, end: true },
              { text: "Goodbye." },
            ],
          },
          gold: {
            text: "[He grins. Every single tooth is gold. Some of them are clearly not his.] Take a guess.",
            responses: [
              { text: "Let's deal.", barter: true, end: true },
              { text: "Goodbye." },
            ],
          },
        },
      }),
    );

    L.dialogue(
      "dlg_neon_sprocket",
      N().sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Sprocket's Radio Repair and Robotorium! If it beeps, I fix it. If it doesn't beep, I make it beep.",
                "Mind the wires. And the tubes. And that arm — it's still twitchy.",
              ]),
            responses: [
              { text: "Show me your parts.", barter: true },
              {
                text: "Is that a Valet robot in the corner?",
                cond: () => !(L.flag("neon_marquee") || {}).owned,
                next: "valet",
              },
              {
                text: "About Marquee…",
                cond: () => !!(L.flag("neon_marquee") || {}).owned,
                next: "after",
              },
              { text: "Goodbye." },
            ],
          },
          valet: {
            text: "That's Marquee! Old-world American Automaton Valet, Series Four — the hotel model, white gloves and all. Fourteen owners, reprogrammed by me with a little extra buzzsaw. Loyal, polite, the flame nozzle works most of the time. Yours for five hundred scrip.",
            responses: [
              {
                text: "Sold. (500 scrip)",
                cond: () => L.scrip() >= 500,
                action: () => {
                  if (L.pay(500)) buyMarquee();
                },
                next: "bought",
              },
              {
                text: "Five hundred? For a robot with fourteen owners?",
                check: { skill: "trade", value: 50 },
                next: "deal",
                failNext: "nodeal",
              },
              {
                text: "I could finish his repairs myself, for a discount.",
                check: { skill: "mechanics", value: 70 },
                next: "repair",
              },
              { text: "Maybe later.", next: "hello" },
            ],
          },
          deal: {
            text: "Fourteen HAPPY owners! …Nine happy owners. Fine. Three-fifty, and you didn't hear it from me.",
            responses: [
              {
                text: "Deal. (350 scrip)",
                cond: () => L.scrip() >= 350,
                action: () => {
                  if (L.pay(350)) buyMarquee();
                },
                next: "bought",
              },
              { text: "Still too rich for me.", next: "hello" },
            ],
          },
          nodeal: {
            text: "Five hundred, pal. His last owner said the same thing. His last owner is fertiliser now. Unrelated! Probably.",
            responses: [{ text: "Right.", next: "hello" }],
          },
          repair: {
            text: "[You open his chest plate, re-seat two vacuum tubes and splice a servo line.] Huh. HUH. He hasn't hummed like that since the bombs. Okay, genius — two hundred and he's yours.",
            onEnter() {
              L.xp(40, "Mechanics: Marquee");
            },
            responses: [
              {
                text: "Deal. (200 scrip)",
                cond: () => L.scrip() >= 200,
                action: () => {
                  if (L.pay(200)) buyMarquee();
                },
                next: "bought",
              },
              { text: "Later.", next: "hello" },
            ],
          },
          bought: {
            text: "He's all yours! Talk to him to give orders — follow, wait, go home. He'll come back to the shop if you send him home. Be nice to him. He cries oil.",
            responses: [{ text: "Thanks, Sprocket." }],
          },
          after: {
            text: "How's my boy? Keeping his gloves clean? If he ever stops talking, bring him in. If he ever STARTS singing, bring him in faster.",
            responses: [{ text: "He's fine.", next: "hello" }],
          },
        },
      }),
    );
    L.dialogue("dlg_neon_marquee", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            pick([
              "Marquee, reporting! How may I be of service, sir?",
              "At your disposal! Shall I dust something? Or someone?",
              "Ready and eager! Mostly eager!",
            ]),
          responses: [
            {
              text: "Follow me.",
              cond: () => {
                const a = marquee();
                return !!a && a.following !== "player";
              },
              action: () => marqueeFollow(true),
            },
            {
              text: "Wait here.",
              cond: () => {
                const a = marquee();
                return !!a && a.following === "player";
              },
              action: () => marqueeFollow(false),
            },
            { text: "Go back to the Robo-Shop.", action: () => marqueeHome() },
            { text: "Never mind." },
          ],
        },
      },
    });

    // ---- The notice board: bounties & jobs (quests live in 49_) ----
    const job = (title, text, cond, act, done) => ({
      title,
      text,
      cond,
      act,
      done,
    });
    const JOBS = () =>
      (L.neonJobs ? L.neonJobs() : []).concat([
        // services advertise only once their place is built (TIMES_SQUARE_PLAN: the Bunkhouse, Annie's gallery)
        job(
          "ROOMS — THE BUNKHOUSE",
          "BEDS 20 SCRIP. LOCKERS FOR RENT, KEY INCLUDED. NO PACK OXEN IN THE ROOMS. — DOTTIE",
          () => !!N().place("bunkhouse"),
          null,
        ),
        job(
          "SHARPSHOOTERS WANTED",
          "ANNIE'S SHOOTING GALLERY. 5 SCRIP A ROUND. BEAT TWELVE, WIN A RIBBON AND ANNIE'S RESPECT (RIBBON GUARANTEED).",
          () => !!N().place("gallery"),
          null,
        ),
        job(
          "HOTEL ASTOR — HANDS WANTED",
          "CLEARING RUBBLE FROM THE OLD ASTOR SO THE NEON CAN HAVE BEDS AGAIN. PAY IN SOUP. — DOTTIE BLYTHE",
          () => !N().place("bunkhouse"),
          null,
        ),
        job(
          "LOST: ONE (1) EYEBROW",
          "IF FOUND PLEASE RETURN TO GUMS GALLAGHER, RAD ROOM, 3RD STOOL. REWARD: GRATITUDE, POSSIBLY A DRINK.",
          () => true,
          null,
        ),
      ]);
    L.dialogue("dlg_neon_board", {
      start: "board",
      nodes: {
        board: {
          text: '[A scrap-wood board crowded with notices, nailed and re-nailed. "BY ORDER OF THE MAYOR" is painted across the top. Someone has added "(AND THE CAPTAIN)" underneath.]',
          responses: () =>
            JOBS()
              .filter((j) => !j.cond || j.cond())
              .slice(0, 8)
              .map((j, i) => ({
                id: "j" + i + j.title,
                text: (j.done && j.done() ? "[DONE] " : "") + j.title,
                next: () => {
                  L.world.__job = j;
                  return "job";
                },
              }))
              .concat([{ text: "[Step away.]" }]),
        },
        job: {
          text: () => {
            const j = L.world.__job;
            return j
              ? j.title +
                  "\n\n" +
                  (typeof j.text === "function" ? j.text() : j.text)
              : "…";
          },
          responses: [
            {
              text: "[Take the notice.]",
              cond: () => {
                const j = L.world.__job;
                return !!(j && j.act && !(j.done && j.done()));
              },
              action: () => {
                const j = L.world.__job;
                if (j && j.act) j.act();
              },
            },
            { text: "[Back to the board.]", next: "board" },
          ],
        },
      },
    });
  });

