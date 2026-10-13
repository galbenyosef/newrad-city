// play-inline-330 04 — next
// Lines 502-774 of readable/play-inline-330.pretty.js (statement-aligned).
  PF.dialogue("pch_dlg_rosa", {
    start: () => {
      if (!PF.q.complete("pch_sweet") && PF.inv.count("pch_royal_jelly")) {
        if (!PF.q.started("pch_sweet")) PF.q.start("pch_sweet");
        if (PF.q.active("pch_sweet") && PF.q.stage("pch_sweet") !== "return")
          PF.q.set("pch_sweet", "return");
        return "jelly";
      }
      return "root";
    },
    nodes: {
      root: {
        speaker: "Gina Bellini",
        text: () =>
          PF.q.complete("pch_encore")
            ? "Well, if it isn't the hero of 14th Street. Your money's no good here on Saturdays. Today's Tuesday. What'll it be?"
            : "Welcome to the best bar in the Village, which is saying something, because it's the only bar on 11th Street. I'm Gina. I pour, I listen, I throw people out. What'll it be?",
        responses: [
          { text: "Let's see what you're pouring.", barter: true },
          {
            text: "What's good here?",
            next: "good",
            cond: () => !PF.q.started("pch_sweet"),
          },
          {
            text: "About that royal jelly...",
            next: "status",
            cond: () => PF.q.active("pch_sweet"),
          },
          {
            text: "[5 scrip] Pour me a Queen Bee.",
            cond: () => PF.q.complete("pch_sweet") && PF.inv.scrip() >= 5,
            action: () => {
              PF.inv.addScrip(-5);
              PF.inv.add("pch_queen_bee", 1);
            },
            next: "pour",
          },
          { text: "Any gossip?", next: "gossip" },
          { text: "Later, Gina." },
        ],
      },
      good: {
        speaker: "Gina Bellini",
        text: "Honestly? Nothing yet. I'm working on a cocktail — the Queen Bee. Gin, Fizzo syrup, and royal jelly. Real royal jelly, the kind giant ant queens make for their brood. Makes you feel twenty years younger and twice as fast. Problem is, the nearest queen lives under the old Nabisco bakery on 15th and Tenth, and she doesn't do deliveries.",
        responses: [
          {
            text: "I could get you some.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_sweet")) PF.q.start("pch_sweet");
            },
          },
          { text: "Giant ants? Hard pass.", next: "pass" },
        ],
      },
      accept: {
        speaker: "Gina Bellini",
        text: "You're a doll. The bakery's crawling — the ants moved in for the Chocolate Zeppelins, twenty-two years of snack cakes. The queen will be down deep, under the mixing floor where the nest is warm. Kill her, find the brood cell, bring me the jelly. Bring a flamer if you've got one. Bring two.",
        responses: [{ text: "Back soon." }],
      },
      pass: {
        speaker: "Gina Bellini",
        text: "Can't blame you. Offer stands if you grow a spine. Or six legs.",
        responses: [{ text: "[Leave]" }],
      },
      status: {
        speaker: "Gina Bellini",
        text: "National Biscuit Company, 15th and Tenth. Queen's underneath. Jelly's in her brood cell. Try not to get eaten, the tab is still open.",
        responses: [{ text: "Right." }],
      },
      jelly: {
        speaker: "Gina Bellini",
        text: "Is that — oh, look at that. Amber as sunset and it smells like burnt sugar. You actually did it.",
        responses: [
          {
            text: "Here you go.",
            next: "thanks",
            action: () => {
              PF.inv.remove("pch_royal_jelly", 1);
              PF.q.done("pch_sweet");
            },
          },
          {
            text: "[Trade 50] A cocktail this good should come with a partnership.",
            check: { skill: "trade", value: 50 },
            next: "partner",
            failNext: "nopartner",
          },
        ],
      },
      partner: {
        speaker: "Gina Bellini",
        text: "Ha! A shark in a deep-freeze suit. Fine — ten percent of every Queen Bee I sell, paid up front. Call it a hundred scrip and we're square.",
        responses: [
          {
            text: "Pleasure doing business.",
            next: "thanks",
            action: () => {
              PF.inv.remove("pch_royal_jelly", 1);
              PF.inv.addScrip(100);
              PF.q.done("pch_sweet");
            },
          },
        ],
      },
      nopartner: {
        speaker: "Gina Bellini",
        text: "Nice try, sugar. The recipe's mine. The reward's fair.",
        responses: [
          {
            text: "Fine. Here.",
            next: "thanks",
            action: () => {
              PF.inv.remove("pch_royal_jelly", 1);
              PF.q.done("pch_sweet");
            },
          },
        ],
      },
      thanks: {
        speaker: "Gina Bellini",
        text: "First three Queen Bees are yours. After that, five scrip, same as everybody. [She pours something gold that fizzes like it's thinking.] Welcome to the hive.",
        responses: [{ text: "Cheers." }],
      },
      pour: {
        speaker: "Gina Bellini",
        text: "One Queen Bee. Don't operate heavy machinery. Or light machinery. Or a gun, ideally.",
        responses: [{ text: "Cheers." }],
      },
      gossip: {
        speaker: "Gina Bellini",
        text: () => {
          const G2 = [
            "The Conductors up on the High Line charge twenty scrip to walk the tracks. Double if you're from Webster Hall, because we \"have a band\". I've never heard a stupider business model and I've heard DJ Cinders'.",
            "Cinders says the generator downstairs is on its last legs. If somebody handy fixed it, the neon out front would stop blinking like a drunk's turn signal.",
            "Doc Wendt used to be a vet. For horses. Nobody tells him we know.",
            "There's a boxcar on the High Line with OFFICE OF CIVIL DEFENSE stencilled on the side. The Conductors can't open it. Nobody can. That never stops anybody from trying.",
            "You can walk from the High Line straight into the old Nabisco bakery — there's a rail bridge over Tenth Avenue. Ants use it too, so, you know. Watch your ankles.",
          ];
          const i = (PF.flag("rosa_gossip") || 0) % G2.length;
          PF.setFlag("rosa_gossip", (PF.flag("rosa_gossip") || 0) + 1);
          return G2[i];
        },
        responses: [
          { text: "Anything else?", next: "gossip" },
          { text: "Thanks.", next: "root" },
        ],
      },
    },
  });
  function heal(rads) {
    try {
      if (PF.live("rpg") && G.rpg.doctorHeal)
        G.rpg.doctorHeal({ rads: !!rads, limbs: true, hp: true });
      else {
        G.player.heal(999);
        if (rads) G.player.rads = Math.max(0, G.player.rads - 400);
      }
    } catch (e) {
      try {
        G.player.heal(999);
      } catch (e2) {
        /* ignore */
      }
    }
    PF.sfx("inject");
  }
  PF.dialogue("pch_dlg_doc", {
    start: "root",
    nodes: {
      root: {
        speaker: "Doc Wendt",
        text: "Coat check's closed. Clinic's open. Bullet holes, bite marks, bad tattoos, glowing in the dark — I've seen it all and I charge for it all. Sit.",
        responses: [
          {
            text: "[30 scrip] Patch me up.",
            cond: () => PF.inv.scrip() >= 30,
            action: () => {
              PF.inv.addScrip(-30);
              heal(false);
            },
            next: "done",
          },
          {
            text: "[70 scrip] Get the radiation out of me.",
            cond: () => PF.inv.scrip() >= 70,
            action: () => {
              PF.inv.addScrip(-70);
              heal(true);
            },
            next: "done",
          },
          { text: "Show me your supplies.", barter: true },
          { text: "Were you really a horse doctor?", next: "horse" },
          { text: "Not today." },
        ],
      },
      done: {
        speaker: "Doc Wendt",
        text: "There. Don't pick at it. Don't drink Gina's specials for an hour. You won't listen, but I said it, so legally I'm covered.",
        responses: [{ text: "Thanks, Doc." }],
      },
      horse: {
        speaker: "Doc Wendt",
        text: "...I was a VETERINARIAN. Large animals. You know what humans are? Medium animals. The principles are identical. Now do you want the stitches or not?",
        responses: [{ text: "Neigh.", next: "root" }],
      },
    },
  });
  PF.dialogue("pch_dlg_static", {
    start: "root",
    nodes: {
      root: {
        speaker: "DJ Cinders",
        text: () =>
          PF.flag("wh_power")
            ? "You! Generator hero! The Studio's spinnin' again, baby — best sound south of Radio City. What can I do you for?"
            : "Welcome to the Studio, where the beats are hot and the generator's hotter, and not in a good way. DJ Cinders. Yeah, the scars. Pulled my crates out of a fire in '67. I was spinning records here then and I'm still spinning 'em. Records don't care what your face looks like.",
        responses: [
          {
            text: "What's wrong with the generator?",
            cond: () => !PF.flag("wh_power"),
            next: "gen",
          },
          { text: "Got anything to trade?", barter: true },
          { text: "Play something.", next: "play" },
          { text: "Later, Cinders." },
        ],
      },
      gen: {
        speaker: "DJ Cinders",
        text: "Consolidated Dynamo Hearth, forty kilowatts, installed March 1967, warranty expired March 1967. Regulator's cooked. Somebody with a wrench and a clue — or a dry cell to buffer it — could fix it in five minutes. I've got the clue. I lost the wrench in '71.",
        responses: [
          { text: "I'll take a look." },
          { text: "Not my department." },
        ],
      },
      play: {
        speaker: "DJ Cinders",
        text: "[He drops the needle on a crackling 78. A big band swings out of speakers the size of refrigerators. It sounds like 1941 and like the end of the world at the same time.] That's the stuff.",
        responses: [{ text: "[Nod along]" }],
      },
    },
  });
  PF.dialogue("pch_dlg_tony", {
    start: "root",
    nodes: {
      root: {
        speaker: "Big Tony",
        text: "Webster Hall. Three rules. One: holster your piece on the dance floor. Two: no fighting unless it's a dance-off. Three: if Gina cuts you off, you're cut off. Questions?",
        responses: [
          { text: "What's the cover?", next: "cover" },
          { text: "Seen any trouble lately?", next: "trouble" },
          { text: "No questions." },
        ],
      },
      cover: {
        speaker: "Big Tony",
        text: "Five scrip, Saturdays. Rest of the week it's free, 'cause the band's only rehearsing. Honestly, rehearsals are better. Don't tell Dizzy.",
        responses: [{ text: "Got it.", next: "root" }],
      },
      trouble: {
        speaker: "Big Tony",
        text: "Conductors snatched Lulu. That's trouble. The ants at the bakery are getting bolder — found one gnawing on the marquee last week. That's weird trouble. Otherwise? Quiet. Too quiet. I don't like quiet. I like swing.",
        responses: [{ text: "Thanks.", next: "root" }],
      },
    },
  });

  // ---------------------------------------------------------------
  // NPC roster (built after the interior anchors exist)
  // ---------------------------------------------------------------
