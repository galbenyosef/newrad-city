// play-inline-207 07 — next
// Lines 3225-3550 of readable/play-inline-207.pretty.js (statement-aligned).
  const FT_LOCKS = (PF.ftLocks = {
    strongbox: PF.regLock({
      id: "pf_lk_ft_strongbox",
      label: "Whitlock Strongbox",
      key: "pf_nan_key",
      kind: "safe",
      hint: "Nan Whitlock gives the key when you bring back her husband's ring.",
    }),
    tricorn: PF.regLock({
      id: "pf_lk_ft_tricorn",
      label: "Tricorn Display Case",
      code: "1783",
      kind: "container",
      hint: "GW-1776 lets the curatorial code slip when you ask about the hat.",
    }),
    cache: PF.regLock({
      id: "pf_lk_ft_cache",
      label: "Smugglers' Cache",
      code: "1765",
      kind: "container",
      hint: "Chalked on the cellar wall beside it.",
    }),
  });
  PF.keyFrom("pf_nan_key", "Nan Whitlock (returning the Whitlock ring)");
  PF.item({
    id: "pf_nan_key",
    type: "key",
    name: "Nan's Strongbox Key",
    weight: 0,
    value: 0,
    desc: "A small brass key for the strongbox in the owner's room at Fraunces Tavern.",
  });

  // --- Mortimer Vane (ruined financier, The Gold Standard) ---
  PF.dialogue("pf_dlg_vane", {
    start: () =>
      PF.inv.count("pf_reserve_ledger") > 0 && PF.q.active("pf_gold")
        ? "ledger"
        : PF.q.complete("pf_gold")
          ? "after"
          : "root",
    nodes: {
      root: {
        text: "Mortimer Vane, formerly of Vane, Vane & Oberlin, Broad Street. Bonds, mostly. Now I sit in taverns and watch the only market that never closed: people. You have the look of an investor. Or a thief. The distinction was always academic.",
        responses: [
          {
            text: "I hear you have a thing about the Federal Reserve.",
            next: "job",
          },
          { text: "Where are the other Vanes?", next: "vanes" },
          { text: "I'll let you get back to your drink." },
        ],
      },
      vanes: {
        text: "Oberlin took his shelter card. Vane — my brother — took the helicopter. I took the stairs to the bar. Of the three of us, I am the only one still drinking. Draw your own conclusions about risk.",
        responses: [
          { text: "About the Fed...", next: "job" },
          { text: "Goodbye." },
        ],
      },
      job: {
        text: "Under Liberty Street, five storeys down, is the largest pile of gold in the history of the species. And in the vault manager's office, a ledger. Every bar, every owner, every secret transfer — including one the Office of Civil Defense very much wanted to make on March 5th. Bring me that ledger. The gold, you can keep. You won't carry much. Nobody does.",
        responses: [
          { text: "How do I get down there?", next: "how" },
          {
            text: "I'm in.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
            next: "go",
          },
          { text: "Not interested." },
        ],
      },
      how: {
        text: "The vault elevator runs on the security office's power — ground floor, behind the teller line. That teletype answers to nothing but the Chief of Security's keycard, and the Chief, I am told, died at his post in the records room. Level Five has a control room that turns the cylinder. That one wants an override card — I know for a fact there's one in the barracks safe. And there is the Sentinel. Big. Treads. Very polite. Shut it off if you can; run if you can't.",
        responses: [
          {
            text: "[Persuasion 55] You worked with these people. You have an override card of your own, don't you?",
            check: { skill: "persuasion", value: 55 },
            next: "card",
            failNext: "nocard",
            cond: () => !PF.flag("ft_vane_card"),
          },
          {
            text: "[Trade 40] I'll buy your override card. 150 scrip.",
            check: { skill: "trade", value: 40 },
            cond: () => !PF.flag("ft_vane_card") && PF.inv.scrip() >= 150,
            action: () => {
              PF.inv.addScrip(-150);
              PF.inv.add("pf_fed_override", 1);
              PF.setFlag("ft_vane_card", true);
            },
            next: "sold",
            failNext: "nocard",
          },
          {
            text: "I'm in.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
            next: "go",
          },
        ],
      },
      card: {
        text: "...Perceptive. I kept it for twenty-two years in case I ever grew brave. I did not. [He slides a gold-edged card across the table.] Level Five control room. It turns the cylinder, and it puts the Sentinel to sleep. Don't lose it; it's the only thing I own that isn't mortgaged.",
        onEnter() {
          if (!PF.flag("ft_vane_card")) {
            PF.inv.add("pf_fed_override", 1);
            PF.setFlag("ft_vane_card", true);
          }
        },
        responses: [
          {
            text: "I'll bring back your ledger.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
          },
        ],
      },
      sold: {
        text: "A buyer! I had forgotten the feeling. [He pockets the scrip with alarming speed.] Pleasure doing business.",
        responses: [
          {
            text: "I'll bring back your ledger.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
          },
        ],
      },
      nocard: {
        text: "An override card? My dear, I was in bonds, not bullion. [He does not quite meet your eye.]",
        responses: [
          {
            text: "Fine. I'll find another way.",
            action: () => {
              if (!PF.q.started("pf_gold"))
                PF.q.start("pf_gold", { stage: "enter" });
              else PF.q.advance("pf_gold", "meet", "enter");
            },
          },
        ],
      },
      go: {
        text: "Splendid. The Fed is on Liberty Street, just north of here — the building that looks like it's expecting a siege. It is.",
        responses: [{ text: "See you soon." }],
      },
      ledger: {
        text: 'Is that — [He takes the book with both hands, like a relic.] The Reserve Ledger. Look at this. The Office of Civil Defense tried to move a billion in bullion to "secure storage" under the Municipal Building. Account LW-9, it says here, some Civil Defense program nobody ever heard of. Dated the day before the bombs. They were buying their way into the future and the vault manager said no. One word. No.',
        responses: [
          {
            text: "It's yours. As agreed.",
            action: () => {
              PF.inv.remove("pf_reserve_ledger", 1);
              PF.q.done("pf_gold");
              PF.standing(20, "Delivered the Reserve Ledger");
            },
            next: "paid",
          },
          {
            text: "[Persuasion 60] A ledger like that is worth more than 250 scrip.",
            check: { skill: "persuasion", value: 60 },
            action: () => {
              PF.inv.remove("pf_reserve_ledger", 1);
              PF.inv.addScrip(250);
              PF.q.done("pf_gold");
            },
            next: "paid_more",
            failNext: "nomore",
          },
          { text: "I think I'll keep it.", next: "keep" },
        ],
      },
      nomore: {
        text: "My dear, I am a ruined man with a bar tab. Two hundred and fifty is everything.",
        responses: [
          {
            text: "Fine. Take it.",
            action: () => {
              PF.inv.remove("pf_reserve_ledger", 1);
              PF.q.done("pf_gold");
            },
            next: "paid",
          },
          { text: "I'll keep it.", next: "keep" },
        ],
      },
      keep: {
        text: "Then keep it safe. Someone in the Continuity is still looking for it, I promise you. They still think it is 1967; to them it is current business.",
        responses: [{ text: "Goodbye." }],
      },
      paid: {
        text: "Your fee. And my thanks, which are worth rather more. I shall spend the rest of my life reading this. It is the best story ever written, and every word of it is a number.",
        responses: [{ text: "Enjoy it." }],
      },
      paid_more: {
        text: "Robbery. Absolute robbery. I admire it. [He counts out the scrip with a sigh that lasts a full minute.]",
        responses: [{ text: "Pleasure doing business." }],
      },
      after: {
        text: "Page four hundred and twelve. Did you know the Swiss had forty tons down there? They're not coming for it. Nobody's coming for anything any more. Isn't that wonderful?",
        responses: [{ text: "Goodbye, Mortimer." }],
      },
    },
  });

  // --- GW-1776, the docent patrolman (quiz for the tricorn) ---
  const QUIZ = [
    {
      q: "QUESTION THE FIRST: IN WHAT YEAR DID GENERAL WASHINGTON BID FAREWELL TO HIS OFFICERS IN THIS VERY ROOM?",
      a: ["1783", "1776", "1967"],
      ok: 0,
    },
    {
      q: "QUESTION THE SECOND: THE BRITISH EVACUATED NEW YORK CITY IN THAT SAME YEAR. WHAT WAS THE DAY CELEBRATED AS?",
      a: ["Evacuation Day", "Tea Party Day", "Civil Defense Appreciation Day"],
      ok: 0,
    },
    {
      q: "QUESTION THE THIRD: WHO FOUNDED THIS ESTABLISHMENT IN 1762?",
      a: ["Samuel Fraunces", "Alexander Hamilton", "Valet"],
      ok: 0,
    },
  ];
  const quizNodes = {};
  QUIZ.forEach((Qz, i) => {
    quizNodes["q" + i] = {
      text: Qz.q,
      responses: Qz.a
        .map((ans, k) => ({
          text: ans,
          next:
            k === Qz.ok
              ? i + 1 < QUIZ.length
                ? "q" + (i + 1)
                : "win"
              : "lose",
          id: "gw_q" + i + "_" + k,
        }))
        .concat(
          i === 0
            ? [
                {
                  text: '[Wits 7] "The answers are 1783, Evacuation Day and Samuel Fraunces. Skip to the prize."',
                  check: { attr: "wits", value: 7 },
                  next: "win",
                  failNext: "q0",
                },
              ]
            : [],
        ),
    };
  });
  PF.dialogue("pf_dlg_gw", {
    start: () => (PF.flag("ft_tricorn") ? "done" : "root"),
    nodes: Object.assign(
      {
        root: {
          text: "GREETINGS, CITIZEN! I AM GW-1776, DOCENT OF THE FRAUNCES TAVERN MUSEUM. PLEASE DO NOT TOUCH THE EXHIBITS. PLEASE DO NOT TOUCH THE DOCENT. WOULD YOU LIKE TO HEAR ABOUT THE LONG ROOM?",
          responses: [
            { text: "Tell me about the Long Room.", next: "long" },
            { text: "What's the hat in the case?", next: "hat" },
            {
              text: "I'd like to take your quiz.",
              next: "q0",
              cond: () => !PF.flag("ft_tricorn"),
            },
            { text: "Goodbye, George." },
          ],
        },
        long: {
          text: "ON DECEMBER 4TH, 1783, GENERAL WASHINGTON RAISED A GLASS IN THIS ROOM AND SAID FAREWELL TO HIS OFFICERS. WITNESSES REPORT THAT HE WEPT. I HAVE BEEN PROGRAMMED TO WEEP AT THIS POINT. [A small jet of coolant sprays from its face grille.] THANK YOU FOR YOUR PATIENCE.",
          responses: [{ text: "That was... moving.", next: "root" }],
        },
        hat: {
          learn: "pf_lk_ft_tricorn",
          text: 'THAT IS A TRICORN HAT OF THE REVOLUTIONARY PERIOD. IT IS NOT FOR SALE. IT MAY, HOWEVER, BE AWARDED TO ANY VISITOR WHO ANSWERS THE MUSEUM QUIZ CORRECTLY. NO VISITOR HAS DONE SO SINCE 1967. THE LAST ONE ANSWERED "RADIATION" TO EVERY QUESTION. THE CASE IS SECURED BY CURATORIAL CODE 1-7-8-3. I SHOULD NOT HAVE SAID THAT. PLEASE FORGET IT.',
          responses: [
            { text: "I'll take the quiz.", next: "q0" },
            { text: "Maybe later." },
          ],
        },
        win: {
          text: "CORRECT! HUZZAH! THE REPUBLIC IS SAFE IN YOUR HANDS. PLEASE ACCEPT THIS AUTHENTIC* TRICORN. [*AUTHENTICITY NOT GUARANTEED.]",
          onEnter() {
            if (!PF.flag("ft_tricorn")) {
              PF.setFlag("ft_tricorn", true);
              PF.inv.add("pf_tricorn", 1);
              PF.xp(100, "Museum Quiz");
            }
          },
          responses: [{ text: "Huzzah." }],
        },
        lose: {
          text: "INCORRECT. THE REVOLUTION HAS BEEN SET BACK SEVERAL YEARS. YOU MAY TRY AGAIN WHEN YOU HAVE REFLECTED UPON YOUR IGNORANCE.",
          onEnter() {
            PF.setFlag("ft_quiz", (PF.flag("ft_quiz") || 0) + 1);
          },
          responses: [
            { text: "Try again.", next: "q0", repeatable: true },
            { text: "Goodbye." },
          ],
        },
        done: {
          text: "WELCOME BACK, CITIZEN. YOUR TRICORN LOOKS MAGNIFICENT. MIGHT I INTEREST YOU IN THE LONG ROOM?",
          responses: [
            { text: "Tell me again.", next: "long" },
            { text: "Goodbye, George." },
          ],
        },
      },
      quizNodes,
    ),
  });

