// play-inline-553 06 — next
// Lines 1460-1799 of readable/play-inline-553.pretty.js (statement-aligned).
  function startNode(k, intro) {
    return function () {
      const s = st(k);
      const c0 = cfg[k];
      if (s.rec && c0.leaves()) return "farewell";
      if (s.rec) return "comp";
      const t = TURN_IN[k];
      if (t && !s.hostile) {
        try {
          if (Q.stage(t.q) === "return" && L.has(t.item)) {
            s.met = true;
            return t.node;
          }
        } catch (e) {
          /* */
        }
      }
      const r = intro();
      s.met = true;
      return r;
    };
  }

  // ---- Malone ---------------------------------------------------------
  cfg.malone.ack = {
    far: "Give you some room. Sure. I'll be the guy in the back row.",
    near: "Close quarters. My kind of fight.",
    melee:
      "Now we're talking. [He cracks his knuckles. It sounds like a car accident.]",
    ranged: "Gun it is. Less personal. Fine.",
    passive: "Counter-puncher. I wait, they swing, I swing harder.",
    aggressive: "Swarmer. I like it. Take the fight to 'em.",
  };
  cfg.malone.partAsk =
    "You're letting me go? No hard feelings, boss. Contract's paid. I'll be at the end of the bar at the Neon if you need a hand. Or two.";
  cfg.malone.partBye = "See you around, boss. Keep your chin down.";
  cfg.malone.fullText =
    "You've already got somebody watching your back. I don't share a corner. Come back when you're flying solo.";
  cfg.malone.compLine = () =>
    Q.isActive("sq_malone")
      ? pick([
          "The Kid's still out there. Garden's on 34th.",
          "Still thinking about that sixth round.",
        ])
      : "";
  L.hook("register", function () {
    const k = "malone";
    const c0 = cfg.malone;
    const S = () => st(k);
    const canPay = (n) => L.scrip() >= n;
    const hireResps = (price) => [
      {
        text: "I'd hire you, but I've already got company.",
        cond: () => !!current() && current() !== k,
        next: "full",
      },
      {
        text: () => "Deal. [Pay " + price() + " scrip]",
        cond: () => !current() && canPay(price()),
        action: () => {
          const p = price();
          if (L.pay(p)) {
            S().paid += p;
            recruit(k, "hired");
          }
        },
        next: "hired",
      },
    ];
    makeTree(
      k,
      startNode(k, () => {
        const s = S();
        if (!c0.canHire()) return "refuse";
        if (s.left) return "rehire_left";
        if (s.dismissed && s.hired) return "rehire";
        return s.met ? "again" : "intro";
      }),
      {
        intro: {
          speaker: c0.name,
          text: "[A heavyset man in a threadbare three-piece suit sits alone at the end of the bar. The left side of his face is one old burn scar from brow to jaw, and his knuckles are the size of walnuts and about as smooth. He does not look up from his glass.] You're blocking my light, friend. Unless you're here about work.",
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "What kind of work?", next: "work" },
            { text: "[Leave.]", end: true },
          ],
        },
        again: {
          speaker: c0.name,
          text: "Back again. You here to hire me, or just to look? Looking's free. Hiring's two-fifty.",
          responses: [
            { text: "Tell me about yourself.", next: "who" },
            { text: "Let's talk about the job.", next: "work" },
            { text: "[Leave.]", end: true },
          ],
        },
        who: {
          speaker: c0.name,
          text: 'Jim Malone. "Gentleman" Jim, back when there were gentlemen. Heavyweight. Twenty-nine and three at the Garden. [He finally looks at you. The fire took half his face; it never got near his eyes.] Now I hit things for scrip. Same job, worse lighting.',
          responses: [
            { text: "What happened at the Garden?", next: "garden" },
            { text: "What kind of work do you do now?", next: "work" },
            { text: "[Leave.]", end: true },
          ],
        },
        garden: {
          speaker: c0.name,
          text: 'March fifth, 1967. Morning card — they put us on at nine so the folks in Europe could watch it at suppertime, live by satellite. Turned out Europe had other plans for suppertime. Me against Danny Kearns — "the Kid." Eighteen and oh, pretty as a picture, dropped his left every time he threw the right. Round six, I had him. I HAD him. Then the sirens went. Twenty thousand people and one exit. [He drinks.] Nobody ever finished that fight. Twenty-two years and it still itches.',
          responses: [
            { text: "I'm sorry.", next: "work" },
            { text: "So, about this work.", next: "work" },
          ],
        },
        work: {
          speaker: c0.name,
          text: "Mercenary. I walk with you, I hit what you point at, I don't ask why. Two hundred and fifty scrip up front, no refunds. One rule: I don't work for monsters. I've seen monsters. You're not one. Yet.",
          responses: () =>
            hireResps(() => 250).concat([
              {
                text: "Two-fifty for a guy whose last fight was in 1967? I'll give you one-fifty.",
                cond: () => !current() && !S().haggled,
                check: { skill: "trade", value: 45 },
                next: "haggle_ok",
                failNext: "haggle_fail",
              },
              {
                text: "Mayor Crowe says I'm good for it. Neighbour's discount?",
                cond: () =>
                  !current() &&
                  (L.flag("neon_outcome") === "crowe" ||
                    L.flag("neon_outcome") === "repair") &&
                  !S().haggled,
                next: "crowe",
              },
              {
                text: "I can't afford you right now.",
                cond: () => !current() && !canPay(250),
                next: "broke",
              },
              { text: "[Leave.]", end: true },
            ]),
        },
        haggle_ok: {
          speaker: c0.name,
          text: "[A long, dry laugh.] Hah. Fine. One-fifty. You'd have made a decent cornerman, kid.",
          onEnter: () => {
            S().haggled = 150;
          },
          responses: () =>
            hireResps(() => 150).concat([
              { text: "I'll come back with the scrip.", end: true },
            ]),
        },
        haggle_fail: {
          speaker: c0.name,
          text: "Price just went up to two-fifty and a half. The half is for the insult. ...I'm kidding. Two-fifty.",
          responses: () =>
            hireResps(() => 250).concat([{ text: "[Leave.]", end: true }]),
        },
        crowe: {
          speaker: c0.name,
          text: "You're the one who kept the lights on? [He puts his glass down.] Then I owe you one already. A hundred scrip, and we're square.",
          onEnter: () => {
            S().haggled = 100;
          },
          responses: () =>
            hireResps(() => 100).concat([
              { text: "I'll come back with the scrip.", end: true },
            ]),
        },
        broke: {
          speaker: c0.name,
          text: "Then you can't afford me. No shame in it. Most people can't afford a bottle of tonic. Come back when your pockets rustle.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        hired: {
          speaker: c0.name,
          text: "[Malone drains his glass, stands — and keeps standing; he is enormous — and cracks his neck, left, then right.] Right. Where are we going, boss?",
          onEnter: () => {
            if (!L.has("q_note_fight_card") && !S().gotCard) {
              S().gotCard = true;
              L.give("q_note_fight_card", 1);
            }
          },
          responses: [{ text: "Let's go.", end: true }],
        },
        rehire: {
          speaker: c0.name,
          text: "Boss. Missed me? The contract's still good. I'll come back on for nothing — I don't charge twice for the same corner.",
          responses: [
            {
              text: "I've already got company.",
              cond: () => !!current(),
              next: "full",
            },
            {
              text: "Come on, Jim. Let's go.",
              cond: () => !current(),
              action: () => recruit(k, "rehired"),
              next: "hired",
            },
            { text: "Not yet.", end: true },
          ],
        },
        rehire_left: {
          speaker: c0.name,
          text: "[He studies you for a long moment.] The radio's been saying different things about you lately. Better things. [He shrugs.] Everybody deserves a rematch. I'll take you back on. Don't make me regret it.",
          responses: [
            {
              text: "I've already got company.",
              cond: () => !!current(),
              next: "full",
            },
            {
              text: "Thanks, Jim. Let's go.",
              cond: () => !current(),
              action: () => recruit(k, "rehired"),
              next: "hired",
            },
            { text: "Maybe later.", end: true },
          ],
        },
        refuse: {
          speaker: c0.name,
          text: "[He doesn't look up.] No. I know what you are. I heard it on the radio. I've done ugly work, but I don't work for monsters. Walk away, friend.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        // --- companion extras ---
        about: {
          speaker: c0.name,
          text: () =>
            pick([
              "Hell's Kitchen kid. Old man was a longshoreman, mother sang in a bar on Ninth. I learned to fight so I wouldn't have to learn to sing.",
              "When the bombs dropped I was under the Garden, in the locker room. Woke up three days later with half my face cooked. The Kid was gone. So was the belt. So was everything.",
              "I've been hired by pack trains, settlers, a Neon barber who wanted me to beat up his own reflection. You're not the strangest boss I've had. You're in the top ten.",
            ]),
          responses: [
            {
              text: "Tell me more about the Kid.",
              cond: () => !Q.isStarted("sq_malone"),
              next: "kid_offer",
            },
            { text: "Let's talk about something else.", next: "comp" },
          ],
        },
        kid_offer: {
          speaker: c0.name,
          text: "Pack-train folk say there's a Maniac in the ruins of the Garden, on 34th, still wearing trunks with a shamrock on them. Still throwing hooks at nothing. Still wearing MY belt — he grabbed it off the judges' table when the lights went out. [His jaw works.] I want to finish the fight, boss. Or finish him. Same thing, now.",
          responses: [
            {
              text: "Let's go find him.",
              action: () => {
                Q.start("sq_malone");
              },
              next: "kid_go",
            },
            { text: "Maybe another time.", next: "comp" },
          ],
        },
        kid_go: {
          speaker: c0.name,
          text: "Thirty-fourth Street, west of Seventh. Where the big round roof came down. [He shadowboxes, once, slow.] Sixth round, Danny. Bell's about to ring.",
          responses: [{ text: "Let's go.", end: true }],
        },
        belt_back: {
          speaker: c0.name,
          text: "[You hold out the belt. Malone doesn't take it. He just looks at it: the gold gone green, the blank name plate.] They never engraved it. Winner's name was supposed to go right... there.",
          responses: () => [
            {
              text: "It's yours. It always was.",
              standing: 75,
              action: () => resolveBelt("given"),
              next: "belt_given",
            },
            {
              text: "Belt like that's worth a fortune. What's it worth to you?",
              check: { skill: "trade", value: 60 },
              next: "belt_sell",
              failNext: "belt_sell_fail",
            },
            {
              text: "I think I'll keep it.",
              action: () => resolveBelt("kept"),
              next: "belt_kept",
            },
          ],
        },
        belt_given: {
          speaker: c0.name,
          text: "[He takes it in both hands like it might break, and buckles it on over the three-piece suit. It's absurd. It's perfect.] Undisputed. Twenty-two years late. [He clears his throat, roughly.] Forget the contract, boss. From now on I work for free. And I work harder.",
          responses: [{ text: "You earned it, champ.", end: true }],
        },
        belt_sell: {
          speaker: c0.name,
          text: "[A long silence.] Everybody's a promoter. [He counts out scrip from an inside pocket, slow.] Two hundred. That's all I've got. Take it.",
          onEnter: () => resolveBelt("sold"),
          responses: [{ text: "Pleasure doing business.", end: true }],
        },
        belt_sell_fail: {
          speaker: c0.name,
          text: "Nice try. I don't buy things from people who got 'em off my own opponent's corpse. You gonna give it to me or not?",
          responses: [
            {
              text: "It's yours.",
              standing: 50,
              action: () => resolveBelt("given"),
              next: "belt_given",
            },
            {
              text: "Not.",
              action: () => resolveBelt("kept"),
              next: "belt_kept",
            },
          ],
        },
        belt_kept: {
          speaker: c0.name,
          text: "[He nods, slowly, like a man taking a punch he saw coming.] Sure. Keep it. Everything I ever won ended up in somebody else's pocket. Why should this be different? [He turns away.] We done here, boss?",
          responses: [{ text: "[Leave.]", end: true }],
        },
      },
      () => [
        { id: cid(k, "about"), text: "Tell me about yourself.", next: "about" },
        {
          id: cid(k, "kid"),
          text: "About the Kid...",
          cond: () => !Q.isStarted("sq_malone"),
          next: "kid_offer",
        },
        {
          id: cid(k, "belt"),
          text: "I got your belt back.",
          cond: () =>
            Q.stage("sq_malone") === "return" && L.has("q_garden_belt"),
          next: "belt_back",
        },
      ],
    );
  });
