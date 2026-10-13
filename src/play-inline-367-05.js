// play-inline-367 05 — next
// Lines 1061-1345 of readable/play-inline-367.pretty.js (statement-aligned).
  PF.dialogue("pws_dlg_ramona", {
    start: "root",
    nodes: {
      root: {
        speaker: "Ramona Diaz",
        text: "Hold up. Gun stays holstered past this gate. Soup's at sundown, cots are first-come, and if you start trouble I finish it. We clear?",
        responses: [
          { text: "Crystal. Who runs the place?", next: "who" },
          { text: "Any trouble around here?", next: "trouble" },
          { text: "We're clear." },
        ],
      },
      who: {
        speaker: "Ramona Diaz",
        text: "Sister Constance. Inside, by the altar, probably fussing with the candles. Doc Ainsworth's in the vestry if you're leaking.",
        responses: [{ text: "Thanks." }],
      },
      trouble: {
        speaker: "Ramona Diaz",
        text: "Stitchers from the Singer, twice a season. Bank robots on Wall Street if you go down there after dark. Burrow rats under the Custom House, which is Hattie's problem. And an old-timer from Pearl Street who keeps trying to sell me a \"genuine Washington tooth.\" That one's mostly my problem.",
        responses: [{ text: "Good to know." }],
      },
    },
  });

  // ---------------------------------------------------------------
  // Dialogue — Custom House Trading Post
  // ---------------------------------------------------------------
  const haveCharter = () => PF.inv.count("pws_charter") > 0;
  PF.dialogue("pws_dlg_hattie", {
    start: () =>
      haveCharter() && PF.q.active("pws_deposit")
        ? "charter"
        : haveCharter() && !PF.q.complete("pws_deposit")
          ? "charter"
          : PF.q.complete("pws_deposit")
            ? "after"
            : PF.q.active("pws_deposit")
              ? "waiting"
              : "root",
    nodes: {
      root: {
        speaker: "Hattie Fenwick",
        text: "Hattie Fenwick, convoy master. Welcome to the Custom House — the only place south of Canal where the scales are honest and the guards are sober. Mostly sober. If you're buying, see the stalls. If you're selling, see me. If you're looking for work, sit down.",
        responses: [
          { text: "I'm looking for work.", next: "job" },
          {
            text: "I have something to sell. A painting.",
            cond: haveSeal,
            next: "sell",
          },
          { text: "Tell me about this place.", next: "place" },
          { text: "Just browsing." },
        ],
      },
      place: {
        speaker: "Hattie Fenwick",
        text: "Alexander Hamilton's Custom House. Built to count the country's money. Now it counts mine. The convoys run from here up to Grand Central and across to the Seaport. Four ladies on thrones out front — the Continents. The one with the torch is America. She gets the most bird droppings. Symbolic, I think.",
        responses: [
          { text: "About that work...", next: "job" },
          { text: "Thanks." },
        ],
      },
      job: {
        speaker: "Hattie Fenwick",
        text: "My family's been hauling freight in this city since before the war — M. Fenwick & Sons, Carriers. Grandma rented a safe-deposit box in the Bank of the Manhattan Company, 40 Wall Street. The green pyramid up the avenue. Box eighteen-oh-four. I have the claim ticket. I don't have a death wish.",
        responses: [
          { text: "What's in the box?", next: "box" },
          { text: "Why not go yourself?", next: "why" },
        ],
      },
      why: {
        speaker: "Hattie Fenwick",
        text: 'Because the bank is still guarded. Robots. Turrets. A Valet-M that calls himself "Colonel Burr" and challenges anyone holding a ten-dollar bill to a duel — Hamilton\'s on the ten, see. Two of my people went in last year. The Colonel sent their boots back. Politely.',
        responses: [{ text: "And what's in the box?", next: "box" }],
      },
      box: {
        speaker: "Hattie Fenwick",
        text: "Paper. The Manhattan Company's original charter — 1799, the water company Aaron Burr set up that was secretly a bank. Near two hundred years on, the bank's dead and water's the only thing worth anything. The oldest legal claim to supplying water in the city. Nobody will honour it, of course. But they'll listen to whoever holds it.",
        responses: [
          {
            text: "I'll get it.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
              PF.inv.add("pws_claim_ticket", 1);
            },
          },
          {
            text: "[Trade 50] Robots, turrets and a dueling robot. What's it pay?",
            check: { skill: "trade", value: 50 },
            next: "pay",
            failNext: "payFail",
          },
          { text: "Not interested.", next: "decline" },
        ],
      },
      pay: {
        speaker: "Hattie Fenwick",
        text: "[She laughs.] A trader. Fine: three hundred scrip on delivery, and I'll throw in my spare duster — plated, hundred pockets, better than whatever you're wearing. And the key to the Evidence Cage downstairs, if you can get past the burrow rats.",
        responses: [
          {
            text: "Deal.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
              PF.inv.add("pws_claim_ticket", 1);
              PF.setFlag("hattie_bonus", true);
            },
          },
        ],
      },
      payFail: {
        speaker: "Hattie Fenwick",
        text: "It pays what it pays, and it pays on delivery. You want a better deal, go rob the bank yourself. Oh wait.",
        responses: [
          {
            text: "Fine. Give me the ticket.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
              PF.inv.add("pws_claim_ticket", 1);
            },
          },
          { text: "Pass.", next: "decline" },
        ],
      },
      accept: {
        speaker: "Hattie Fenwick",
        text: "Here's the ticket — the little brass key on the string opens the renter's lock. The vault is on a time lock that's been waiting for Monday morning since 1967; there's a security office behind the tellers, and a president who liked to write his passcodes down. Or take the override off the Colonel. Try not to let him take anything off you.",
        responses: [{ text: "I'll be back." }],
      },
      decline: {
        speaker: "Hattie Fenwick",
        text: "Suit yourself. The offer stands. The bank's not going anywhere, and neither am I.",
        responses: [{ text: "[Leave]" }],
      },
      waiting: {
        speaker: "Hattie Fenwick",
        text: "Forty Wall Street. Green pyramid. Box eighteen-oh-four. And mind the Colonel.",
        responses: [
          { text: "On my way." },
          {
            text: "I have something to sell. A painting.",
            cond: haveSeal,
            next: "sell",
          },
        ],
      },
      charter: {
        speaker: "Hattie Fenwick",
        text: 'Is that — let me see it. [She unrolls it on the desk with two fingers.] "...for supplying the City of New York with pure and wholesome water..." A hundred and ninety years old, and it\'s going to make me the most annoying woman in Manhattan.',
        responses: [
          { text: "Here. It's yours.", next: "paid" },
          {
            text: "[Persuasion 60] This is worth more to you than the fee.",
            check: { skill: "persuasion", value: 60 },
            next: "more",
            failNext: "moreFail",
          },
        ],
      },
      more: {
        speaker: "Hattie Fenwick",
        text: "[She sighs.] It is. Another hundred and fifty. You'd have done well in this family.",
        responses: [
          {
            text: "Pleasure doing business.",
            next: "paid",
            action: () => PF.setFlag("hattie_more", true),
          },
        ],
      },
      moreFail: {
        speaker: "Hattie Fenwick",
        text: "Don't push it. A deal's a deal, and I'm the one with the guards.",
        responses: [{ text: "Fine. Here.", next: "paid" }],
      },
      paid: {
        speaker: "Hattie Fenwick",
        text: () =>
          "Your pay" +
          (PF.flag("hattie_bonus")
            ? ", the duster, and the Evidence Cage key — the burrow rats are a bonus"
            : " and the key to the Evidence Cage downstairs — mind the burrow rats") +
          ". And friend: whatever the Colonel said to you, don't take it personally. He challenges everyone.",
        onEnter: () => {
          if (PF.q.complete("pws_deposit")) return;
          PF.inv.remove("pws_charter", 1);
          PF.inv.addScrip(300 + (PF.flag("hattie_more") ? 150 : 0));
          PF.inv.add("pws_evidence_key", 1);
          if (PF.flag("hattie_bonus")) PF.inv.add("pws_convoy_duster", 1);
          if (!PF.q.started("pws_deposit")) PF.q.start("pws_deposit");
          PF.q.done("pws_deposit");
          PF.news(
            "Down at the Battery, Hattie Fenwick of the Custom House is waving a hundred-and-ninety-year-old water charter at anyone who'll listen. Most people are listening. Water's like that.",
          );
        },
        responses: [{ text: "Thanks, Hattie." }],
      },
      sell: {
        speaker: "Hattie Fenwick",
        text: "[She turns the frame over, whistles.] The Great Seal. From the chapel. That's... well, that's either four hundred scrip or a lot of explaining to Sister Constance. I don't explain things. Four hundred.",
        responses: [
          {
            text: "Sold.",
            standing: -50,
            action: () => {
              PF.inv.remove("pws_great_seal", 1);
              PF.inv.addScrip(400);
              PF.setFlag("seal_sold", true);
              if (PF.q.active("pws_seal")) {
                try {
                  G.quests.fail("pws_seal");
                } catch (e) {
                  /* optional */
                }
              }
            },
          },
          { text: "On second thought, no." },
        ],
      },
      after: {
        speaker: "Hattie Fenwick",
        text: "My favourite employee who doesn't work here. The charter's framed in my office — next to the one Hamilton would've hated. Anything I can do for you?",
        responses: [
          { text: "Tell me about this place.", next: "place" },
          {
            text: "I have something to sell. A painting.",
            cond: haveSeal,
            next: "sell",
          },
          { text: "Just saying hello." },
        ],
      },
    },
  });
  const trader = (id, name, text) =>
    PF.dialogue(id, {
      start: "root",
      nodes: {
        root: {
          speaker: name,
          text,
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Maybe later." },
          ],
        },
      },
    });
  trader(
    "pws_dlg_cyrus",
    "Cyrus Belle",
    "Cyrus Belle, purveyor of fine violence. Ten-mil, five-five-six, shells, the occasional grenade with most of its pin. Hattie checks my scales. I check my ammo counts. Mostly.",
  );
  trader(
    "pws_dlg_lin",
    "Lin Hua",
    "Everything a person needs to survive, at prices a person can almost afford. Needles, water, batteries — and yes, that's real Golden Plain Jerky, sealed in '66. \"Tough enough for any trail,\" says the packet. It isn't wrong.",
  );
  trader(
    "pws_dlg_gorski",
    "Doc Gorski",
    "Tonic, Prussian Blue, and the other stuff Hattie pretends she doesn't see me sell. Doctor's orders, friend. I'm the doctor. These are my orders.",
  );
  PF.dialogue("pws_dlg_juniper", {
    start: "root",
    nodes: {
      root: {
        speaker: "Juniper",
        text: "Mm? Oh, I'm awake. Resting my eyes. You try walking a pack ox from the Seaport to Grand Central and back. He wants to go one way, I want the other, and he weighs a ton.",
        responses: [
          { text: "Any advice for the road?", next: "advice" },
          { text: "Sleep well." },
        ],
      },
      advice: {
        speaker: "Juniper",
        text: "Stay off Wall Street after dark — the bank robots walk the steps. Pay the Stitchers' toll or go around the Singer. And if you ever get the chance, look up in the Rotunda. Those murals. Ships coming into the harbour, full of people. Makes you think the harbour's got to fill up again someday.",
        responses: [{ text: "Maybe it will." }],
      },
    },
  });
