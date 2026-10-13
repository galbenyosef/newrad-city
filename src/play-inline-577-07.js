// play-inline-577 07 — responses
// Lines 1407-2762 of readable/play-inline-577.pretty.js (statement-aligned).
  QX.hook("register", function () {
    const fs = () => QX.stage("qx_franks");
    const buttonsWithYou = () =>
      !!QX.flag("buttons_follow") &&
      !QX.flag("buttons_home") &&
      QX.alive("qx_buttons");
    const R_TRADE = { text: "Let me see what you're selling.", barter: true };
    const sellButtons = (who) => ({
      id: "sell_buttons_" + who,
      text: "(Cruel) I've got a burrow rat here. Fresh. Friendly. Very meaty. Interested?",
      cond: buttonsWithYou,
      next: "buy_buttons",
      action: () => A.buttonsSell(who === "iggy" ? "qx_iggy" : "qx_mort"),
    });

    // ---------------------------------------------------------------- IGGY
    QX.dialogue("qx_dlg_iggy", {
      start: () => {
        const s = fs();
        if (s === "ret_iggy") return "pay";
        if (s === "sab_iggy") return "target";
        if (s === "merge_iggy") return "merge";
        if (s === "done_merge") return "merged";
        if (s === "done_iggy") return "alone";
        return QX.flag("met_iggy") ? "hub" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Iggy Bellini",
          onEnter: () => QX.setFlag("met_iggy"),
          text:
            "Hey, hey, HEY! Iggy Bellini, Genuine Coney Island Franks, est. before your grandmother. Licensed Forever Franks franchisee — see the little fella in the top hat on my sign? " +
            '"So good they\'ll outlive you!" You want a dog? You want TWO dogs? ' +
            "Whatever you do, pal, don't buy from that bum on the other side of the door. Mort. Mort puts CINNAMON in the onions. Like an animal.",
          responses: [
            { text: "What's the deal with you and Mort?", next: "feud" },
            R_TRADE,
            { text: "Just looking.", end: true },
          ],
        },
        hub: {
          speaker: "Iggy Bellini",
          text: [
            "Back for more? I knew it. Nobody forgets their first Iggy's.",
            "Every dog by the franchise manual, pal. Chapter Four: the bun is warmed, never toasted.",
            "Dogs! Hot! Ish!",
            "You look hungry. You look like a two-dog customer.",
          ],
          responses: [
            {
              text: "About Mort...",
              next: "feud",
              cond: () => !fs() || fs() === "feud",
            },
            {
              id: "iggy_secret",
              text: 'Your crates and Mort\'s crates have the same stamp. "S.S." Same supplier, same meat.',
              cond: () =>
                !!QX.flag("franks_secret") &&
                (!fs() || fs() === "feud" || fs() === "merge_iggy"),
              next: "secret",
            },
            sellButtons("iggy"),
            R_TRADE,
            { text: "See you, Iggy.", end: true },
          ],
        },
        feud: {
          speaker: "Iggy Bellini",
          text:
            "Eleven years, pal. Eleven YEARS he's been parked on MY side of the door. The east side. Which is my side. Because I said so first. " +
            "He steals my customers, he steals my onions, he looks at me funny. You wanna make some Scrip? I got a little job.",
          responses: [
            { text: "What kind of job?", next: "job" },
            {
              id: "iggy_merge",
              text: "Have you two ever thought about working together? One cart, both menus, twice the customers.",
              check: { skill: "persuasion", value: 55 },
              next: "merge_yes",
              failNext: "merge_no",
              cond: () => !QX.flag("franks_open_iggy"),
            },
            {
              id: "iggy_senses",
              text: "(Look closer at his supply crates.)",
              check: { attr: "senses", value: 6 },
              next: "crates",
              cond: () => !QX.flag("franks_secret"),
            },
            { text: "Not my business.", end: true },
          ],
        },
        crates: {
          speaker: "Iggy Bellini",
          onEnter: () => QX.setFlag("franks_secret"),
          text: '[Under the cart: three crates stencilled "S.S. — PROVISIONS". The same stencil you saw — or will see — under Mort\'s cart.] Hey! Eyes up here, pal. Those crates are private. Family business.',
          responses: [
            {
              text: 'Mort\'s crates say "S.S." too. Same supplier, same meat.',
              next: "secret",
            },
            { text: "Sorry. Go on.", next: "feud" },
          ],
        },
        secret: {
          speaker: "Iggy Bellini",
          text:
            "...Keep your voice down. Okay. OKAY. The Forever Franks trucks stopped coming in '67. Sewer Stan. Down in the tunnels. He sells to both of us. Same dogs. Same buns. " +
            'If people find out, eleven years of "genuine" goes down the drain, and so does Mort\'s "kosher-style". ...What do you want?',
          responses: [
            {
              text: "Stop fighting. Go into business together, and nobody hears it from me.",
              next: "merge_yes",
              action: () => {
                if (QX.flag("franks_open_mort")) A.merge();
              },
            },
            { text: "Relax. Your secret's safe.", end: true },
          ],
        },
        job: {
          speaker: "Iggy Bellini",
          text:
            "Here. [He presses a squeeze bottle into your hand.] Mustard. Special mustard. I stirred in a little Homeguard cleanser. Nobody dies — they just get the " +
            "kind of sick where you think about your choices. Slip it into Mort's condiment tray. Mort's customers get sick, Mort gets a reputation, Mort goes home. 120 Scrip.",
          responses: [
            {
              text: "Deal. Give me the mustard.",
              action: () => A.hireIggy(),
              end: true,
            },
            { text: "Poisoning people? No.", end: true, standing: 5 },
          ],
        },
        merge_yes: {
          speaker: "Iggy Bellini",
          onEnter: () => {
            if (!QX.flag("franks_open_mort")) A.mergeHalf("iggy");
            else A.merge();
          },
          text: () =>
            QX.reached("qx_franks", "done_merge")
              ? "...Partners. Me and Mort. PARTNERS. [He stares at the ceiling of Grand Central like it owes him money.] " +
                "Fine. FINE. But the cinnamon is OPTIONAL. Here — the family recipe. Both families. Don't make that face."
              : "[He opens his mouth to shout. Closes it. Opens it again.] ...One cart. Both menus. Huh. I'd get the east side AND the west side. " +
                "Fine. IF he agrees. Which he won't. Because he's Mort.",
          responses: [{ text: "Leave Mort to me.", end: true }],
        },
        merge_no: {
          speaker: "Iggy Bellini",
          text: "Work with MORT? I'd rather sell dogs to ripjaws. At least they tip.",
          responses: [{ text: "Worth a try.", end: true }],
        },
        target: {
          speaker: "Iggy Bellini",
          text: "Hey, pal! What'll it be? The usual? You got the usual face.",
          responses: [
            {
              id: "iggy_slip_sneak",
              text: "(Slip Mort's relish into his condiment tray while he makes change.)",
              check: { skill: "stealth", value: 35 },
              action: () => A.sabotage("iggy"),
              next: "slipped",
              cond: () => QX.has("qx_mort_relish"),
            },
            {
              id: "iggy_slip_talk",
              text: "(Point behind him) Is that Kong climbing the Chrysler Building?",
              action: () => A.sabotage("iggy"),
              next: "slipped2",
              cond: () => QX.has("qx_mort_relish"),
            },
            R_TRADE,
            { text: "Nothing. Bye.", end: true },
          ],
        },
        slipped: {
          speaker: "Iggy Bellini",
          text: "Two Scrip, three Scrip... here's your change, pal. [He never looks at the relish tray.]",
          responses: [{ text: "Thanks, Iggy.", end: true }],
        },
        slipped2: {
          speaker: "Iggy Bellini",
          text: "WHERE? ...I don't see nothin'. You're seein' things, pal. Eat a dog, you'll feel better. [The relish is already in his tray.]",
          responses: [{ text: "Maybe I will.", end: true }],
        },
        pay: {
          speaker: "Iggy Bellini",
          text: "You hear that? That's the sound of NO MORT. Oh, it's beautiful. It's like a symphony with no Mort in it. Here — 120 Scrip, and a hot dog for each hand. On the house.",
          responses: [
            {
              text: "Pleasure doing business.",
              action: () => A.payout("iggy"),
              end: true,
            },
          ],
        },
        merge: {
          speaker: "Iggy Bellini",
          text: "So Mort wants a partnership, huh? Mort. Wants a partnership. With ME.",
          responses: [
            {
              id: "iggy_merge2",
              text: "Think about it: no more feud, twice the menu, twice the customers.",
              check: { skill: "persuasion", value: 45 },
              next: "merge_yes",
              failNext: "merge_no2",
            },
            {
              id: "iggy_merge_trade",
              text: "Split supply costs, one umbrella, one permit. You'd clear forty percent more a week.",
              check: { skill: "trade", value: 40 },
              next: "merge_yes",
            },
            {
              text: 'Your crates and his come from the same place. "S.S." I know about Sewer Stan.',
              cond: () => !!QX.flag("franks_secret"),
              next: "merge_yes",
            },
            { text: "Think it over.", end: true },
          ],
        },
        merge_no2: {
          speaker: "Iggy Bellini",
          text: "Nah. Nah nah nah. Eleven years. You don't throw away eleven years of hate for a bigger umbrella.",
          responses: [{ text: "We'll see.", end: true }],
        },
        merged: {
          speaker: "Iggy Bellini",
          text: "My PARTNER! No, not Mort — you! Mort's my... associate. We're working on the word. Dog's on the house, always.",
          responses: [
            R_TRADE,
            { text: "Good to see you two getting along.", end: true },
          ],
        },
        alone: {
          speaker: "Iggy Bellini",
          text: "The whole front door, pal. All mine. It's quiet. Too quiet. ...Nah, it's great. It's great. You want a dog?",
          responses: [
            sellButtons("iggy"),
            R_TRADE,
            { text: "No thanks.", end: true },
          ],
        },
        buy_buttons: {
          speaker: "Iggy Bellini",
          text: "A burrow rat? Say no more. [He produces a sack with alarming speed.] Sixty Scrip. And pal — this conversation never happened.",
          responses: [{ text: "...", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- MORT
    QX.dialogue("qx_dlg_mort", {
      start: () => {
        const s = fs();
        if (s === "ret_mort") return "pay";
        if (s === "sab_mort") return "target";
        if (s === "merge_mort") return "merge";
        if (s === "done_merge") return "merged";
        if (s === "done_mort") return "alone";
        return QX.flag("met_mort") ? "hub" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Mort Feldstein",
          onEnter: () => QX.setFlag("met_mort"),
          text:
            "Mort Feldstein. Forever Franks, kosher-style, by special arrangement with the home office: dogs, pretzels, bagels, the chowder on Thursdays. \"Kosher-STYLE.\" It's a style. Don't ask. " +
            "You been to Iggy? Don't go to Iggy. Iggy's mustard is yellow paint. I've seen the can. The can says PAINT.",
          responses: [
            { text: "What's your problem with Iggy?", next: "feud" },
            R_TRADE,
            { text: "Just browsing.", end: true },
          ],
        },
        hub: {
          speaker: "Mort Feldstein",
          text: [
            "You again. Good. Loyal. I like loyal.",
            "Pretzel? It's hard. It's supposed to be hard. It's an old-world pretzel.",
            "Mort's: where the dogs are eighty percent dog.",
          ],
          responses: [
            {
              text: "About Iggy...",
              next: "feud",
              cond: () => !fs() || fs() === "feud",
            },
            {
              id: "mort_secret",
              text: 'Your crates say "S.S.". So do Iggy\'s. Same supplier.',
              cond: () =>
                !!QX.flag("franks_secret") &&
                (!fs() || fs() === "feud" || fs() === "merge_mort"),
              next: "secret",
            },
            sellButtons("mort"),
            R_TRADE,
            { text: "Bye, Mort.", end: true },
          ],
        },
        feud: {
          speaker: "Mort Feldstein",
          text:
            'Eleven years that man has been shouting "GENUINE" at my customers. Genuine WHAT? Nobody knows. Nobody\'s ever known. ' +
            "You look like somebody who does odd jobs. I got an odd job.",
          responses: [
            { text: "I'm listening.", next: "job" },
            {
              id: "mort_merge",
              text: "You and Iggy could stop fighting and go into business together.",
              check: { skill: "trade", value: 50 },
              next: "merge_yes",
              failNext: "merge_no",
              cond: () => !QX.flag("franks_open_mort"),
            },
            {
              id: "mort_senses",
              text: "(Look at the crates under his cart.)",
              check: { attr: "senses", value: 6 },
              next: "crates",
              cond: () => !QX.flag("franks_secret"),
            },
            { text: "Not my fight.", end: true },
          ],
        },
        crates: {
          speaker: "Mort Feldstein",
          onEnter: () => QX.setFlag("franks_secret"),
          text: '[Stacked under the cart: crates stencilled "S.S. — PROVISIONS". Mort shifts to block your view.] Those are... pickles. Crates of pickles. Very private pickles.',
          responses: [
            { text: 'Iggy\'s crates say "S.S." too.', next: "secret" },
            { text: "Okay, Mort.", next: "feud" },
          ],
        },
        secret: {
          speaker: "Mort Feldstein",
          text:
            "[He goes pale, which for Mort is an achievement.] Sewer Stan. Okay? He comes up through the grate on Tuesdays. Same dogs for both of us. " +
            "The franchise manual says Miracle-Keep product only, page nine. If that gets out, Mort's is finished. Iggy's too, but mostly I care about Mort's.",
          responses: [
            {
              text: "Then stop fighting. Go into business together, and it stays between us.",
              next: "merge_yes",
              action: () => {
                if (QX.flag("franks_open_iggy")) A.merge();
              },
            },
            { text: "I won't tell.", end: true },
          ],
        },
        job: {
          speaker: "Mort Feldstein",
          text:
            'This jar. [A jar of green relish; something at the bottom glows politely.] My "special" relish. Put it in Iggy\'s condiment tray. His customers get a little ' +
            "glow, a little tummy trouble, and Iggy goes home to reconsider his life. 120 Scrip.",
          responses: [
            { text: "Give me the jar.", action: () => A.hireMort(), end: true },
            { text: "I don't poison people, Mort.", end: true, standing: 5 },
          ],
        },
        merge_yes: {
          speaker: "Mort Feldstein",
          onEnter: () => {
            if (!QX.flag("franks_open_iggy")) A.mergeHalf("mort");
            else A.merge();
          },
          text: () =>
            QX.reached("qx_franks", "done_merge")
              ? "Partners. With Iggy. My mother would be spinning in her grave, if she had one; she was vaporized. Fine! Here — the recipe. " +
                "The cinnamon is IN it. Iggy can pick it out."
              : "...One cart. Iggy does the dogs, I do the pretzels and the chowder. The overhead alone... [He does frantic arithmetic on a napkin.] Fine. If HE agrees. He won't.",
          responses: [{ text: "Leave Iggy to me.", end: true }],
        },
        merge_no: {
          speaker: "Mort Feldstein",
          text: "Business with IGGY? The man counts Scrip with his tongue. I've seen it.",
          responses: [{ text: "Just a thought.", end: true }],
        },
        target: {
          speaker: "Mort Feldstein",
          text: "What'll it be? And don't say \"whatever Iggy's having\". Iggy's having a bad day, God willing.",
          responses: [
            {
              id: "mort_slip_sneak",
              text: "(Swap his mustard for Iggy's bottle while he wraps a pretzel.)",
              check: { skill: "stealth", value: 35 },
              action: () => A.sabotage("mort"),
              next: "slipped",
              cond: () => QX.has("qx_doctored_mustard"),
            },
            {
              id: "mort_slip_talk",
              text: "(Point at the sky) Is that a Rotorcraft? Landing on Iggy?",
              action: () => A.sabotage("mort"),
              next: "slipped2",
              cond: () => QX.has("qx_doctored_mustard"),
            },
            R_TRADE,
            { text: "Never mind.", end: true },
          ],
        },
        slipped: {
          speaker: "Mort Feldstein",
          text: "[He hums, wrapping the pretzel in yesterday's Clarion. The bottles have changed places. He never notices.] There you go. Mind your teeth.",
          responses: [{ text: "Thanks, Mort.", end: true }],
        },
        slipped2: {
          speaker: "Mort Feldstein",
          text: "On Iggy?! WHERE? ...Aw. Nothing. A man can dream. [The mustard is already swapped.]",
          responses: [{ text: "Sorry, Mort.", end: true }],
        },
        pay: {
          speaker: "Mort Feldstein",
          text: "Iggy's gone. Went home green and never came back. I should feel bad. I've tried. It's not happening. 120 Scrip and a bag of dogs. Enjoy.",
          responses: [
            {
              text: "Always a pleasure.",
              action: () => A.payout("mort"),
              end: true,
            },
          ],
        },
        merge: {
          speaker: "Mort Feldstein",
          text: 'Iggy said WHAT? A partnership? He said the word "partnership"? Out loud? With his mouth?',
          responses: [
            {
              id: "mort_merge2",
              text: "Fifty-fifty. Shared supplier, shared umbrella, shared customers. More Scrip for both of you.",
              check: { skill: "trade", value: 40 },
              next: "merge_yes",
            }, // (no failNext, like Iggy's: stays open until Trade 40 — never a dead end)
            {
              id: "mort_merge_persuade",
              text: "Eleven years of feuding, Mort. Aren't you tired?",
              check: { skill: "persuasion", value: 45 },
              next: "merge_yes",
              failNext: "merge_no2",
            },
            {
              text: "I know about Sewer Stan. Same crates, same dogs.",
              cond: () => !!QX.flag("franks_secret"),
              next: "merge_yes",
            },
            { text: "Think about it.", end: true },
          ],
        },
        merge_no2: {
          speaker: "Mort Feldstein",
          text: "Nope. Iggy's a snake. A snake with a mustard bottle. Tell him Mort says no.",
          responses: [{ text: "Okay.", end: true }],
        },
        merged: {
          speaker: "Mort Feldstein",
          text: "Iggy and Mort's. Or Mort and Iggy's, depending which side of the cart you're standing on. Pretzel? On the house.",
          responses: [R_TRADE, { text: "Glad it worked out.", end: true }],
        },
        alone: {
          speaker: "Mort Feldstein",
          text: "Just me now. Whole door. You know, I kind of miss yelling. You want to yell at me? No? Pretzel, then.",
          responses: [
            sellButtons("mort"),
            R_TRADE,
            { text: "No thanks.", end: true },
          ],
        },
        buy_buttons: {
          speaker: "Mort Feldstein",
          text: "A burrow rat. A nice fat one. [He weighs it professionally.] Sixty Scrip, and you never saw me.",
          responses: [{ text: "...", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- SCOOP
    QX.dialogue("qx_dlg_scoop", {
      start: () => {
        const s = QX.stage("qx_extra");
        if (QX.done("qx_extra")) return "after";
        if (s === "return") return "ret";
        if (s === "deliver") return "prog";
        return QX.flag("met_scoop") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Scoop Moretti",
          onEnter: () => QX.setFlag("met_scoop"),
          text:
            "EXTRA! EXTRA! Read all about — oh. Hey. You're a person. Most people don't stop. Scoop Moretti, the Manhattan Clarion. Two Scrip a copy. " +
            "Written, printed, folded and hollered by yours truly. I'm the whole paper. I'm the paper AND the boy.",
          responses: [
            { text: "You're the whole newspaper?", next: "paper" },
            {
              text: "I'll take a copy.",
              next: "buy",
              cond: () => QX.scrip() >= 2,
            },
            { text: "Not today.", end: true },
          ],
        },
        again: {
          speaker: "Scoop Moretti",
          text: "Back for the late edition? It's the same as the early edition. I just yell it later.",
          responses: [
            { text: "Business good?", next: "paper" },
            {
              text: "I'll take a copy.",
              next: "buy",
              cond: () => QX.scrip() >= 2,
            },
            { text: "Bye, Scoop.", end: true },
          ],
        },
        buy: {
          speaker: "Scoop Moretti",
          onEnter: () => {
            if (QX.pay(2)) QX.give("qx_gazette", 1);
          },
          text: "Pleasure! Read it twice, it's thin.",
          responses: [{ text: "Thanks.", end: true }],
        },
        paper: {
          speaker: "Scoop Moretti",
          text:
            "Business is terrible! I got three subscribers left and they're all over Midtown, and my feet are shot, and a newsie's got to deliver or he's just a kid shouting. " +
            "Mr. Pennington at the bus stop on Park, Mrs. Vukovich on Fifth by the Flatiron, and... MUNI-7.",
          responses: [
            { text: "MUNI-7?", next: "muni" },
            { text: "I could deliver them for you.", next: "job" },
            { text: "Tough luck, kid.", end: true },
          ],
        },
        muni: {
          speaker: "Scoop Moretti",
          text:
            'Parking robot on Fifth. It reads the Clarion for "municipal notices". It pays its subscription in parking tickets. I have four hundred parking tickets. ' +
            "It's still a subscriber! A newsie never drops a subscriber!",
          responses: [
            { text: "I'll deliver them.", next: "job" },
            { text: "Good luck with that.", end: true },
          ],
        },
        job: {
          speaker: "Scoop Moretti",
          onEnter: () => A.extraStart(),
          text:
            "You WOULD? Here — three copies, still warm. Well, still damp. They each owe ten Scrip dues; bring it back and I'll pay you out of it. A newsie's word is his bond! " +
            "Also his only asset.",
          responses: [{ text: "Consider them delivered.", end: true }],
        },
        prog: {
          speaker: "Scoop Moretti",
          text: () =>
            "How's the route? " +
            QX.misc.delivered() +
            " down, " +
            (3 - QX.misc.delivered()) +
            " to go. Mr. Pennington's on Park by 38th, Mrs. Vukovich on Fifth by the Flatiron, MUNI-7 on Fifth up by 25th.",
          responses: [
            {
              id: "scoop_more",
              text: "I lost a copy. Got a spare?",
              cond: () => QX.count("qx_gazette") < 3 - QX.misc.delivered(),
              action: () => QX.give("qx_gazette", 1),
              next: "spare",
            },
            { text: "Working on it.", end: true },
          ],
        },
        spare: {
          speaker: "Scoop Moretti",
          text: "You LOST — okay. Okay. Here. That's tomorrow's. Nobody'll notice. It's the same as today's.",
          responses: [{ text: "Thanks, Scoop.", end: true }],
        },
        ret: {
          speaker: "Scoop Moretti",
          text: "All three?! You're a natural! A born newsie! So — the dues? Thirty Scrip. I pay you twenty-five of it plus a little something. That's the deal.",
          responses: [
            {
              text: "[Hand over the thirty Scrip.]",
              cond: () => QX.scrip() >= 30,
              action: () => A.extraFinish(false),
              next: "honest",
            },
            {
              id: "scoop_lie",
              text: "(Lie) None of them paid. MUNI-7 gave me a parking ticket instead.",
              check: { skill: "persuasion", value: 50 },
              action: () => A.extraFinish(true),
              next: "lied",
              failNext: "lie_fail",
            },
          ],
        },
        honest: {
          speaker: "Scoop Moretti",
          text: "An HONEST courier! In MANHATTAN! That's tomorrow's headline. Here's your pay — and take the hat. My pop's newsboy hat. It's lucky. It's the only lucky thing I own.",
          responses: [{ text: "Keep yelling, Scoop.", end: true }],
        },
        lied: {
          speaker: "Scoop Moretti",
          text: "...Nobody paid. Right. [He looks at his shoes for a long moment.] Well. Thanks for trying. Here's — here's fifteen, for your trouble. That's all I got.",
          responses: [{ text: "See you, kid.", end: true }],
        },
        lie_fail: {
          speaker: "Scoop Moretti",
          text: "Mrs. Vukovich ALWAYS pays. She pays with cookies AND Scrip. Come on. Level with me.",
          responses: [
            {
              text: "[Hand over the thirty Scrip.]",
              cond: () => QX.scrip() >= 30,
              action: () => A.extraFinish(false),
              next: "honest",
            },
            { text: "I'll come back.", end: true },
          ],
        },
        after: {
          speaker: "Scoop Moretti",
          text: () =>
            QX.flag("extra_kept")
              ? "Oh. Hi. Paper? Two Scrip. ...Business is slow."
              : "My star courier! Today's edition's got a story about you. Well, a paragraph. Well, a sentence. It's a thin paper.",
          responses: [
            {
              text: "I'll take a copy.",
              next: "buy",
              cond: () => QX.scrip() >= 2,
            },
            { text: "See you, Scoop.", end: true },
          ],
        },
      },
    });

    // ---------------------------------------------------------------- PENNINGTON
    const gazPenn = {
      id: "gaz_penn",
      text: "[Deliver the Clarion] Morning paper, Mr. Pennington.",
      cond: () =>
        QX.stage("qx_extra") === "deliver" &&
        !QX.flag("gaz_penn") &&
        QX.has("qx_gazette"),
      action: () => A.deliver("penn", 2),
      next: "gaz",
    };
    QX.dialogue("qx_dlg_penn", {
      start: () => {
        if (QX.flag("penn_moved")) return "gc";
        const s = QX.stage("qx_commute");
        if (s === "done_wait") return "waiting";
        if (s === "tell" || QX.has("qx_m42_timetable")) return "proof";
        if (s === "find") return "prog";
        return QX.flag("met_penn") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Harold Pennington",
          onEnter: () => {
            QX.setFlag("met_penn");
            A.pennStart("talk");
          },
          text:
            "Oh — good morning. Pennington. Harold Pennington, Knickerbocker Mutual, actuarial. You wouldn't happen to know if the 9:47 has left Lexington yet? Sunday service. Quarter-end, you see; the ledgers don't close themselves. " +
            "It's running late this morning. [He consults a stopped gold watch.] Frightfully late. I'll be docked.",
          responses: [
            { text: "How long have you been waiting?", next: "long" },
            {
              id: "penn_truth",
              text: "Mr. Pennington... the bus isn't coming. There was a war. It was twenty-two years ago.",
              check: { skill: "persuasion", value: 50 },
              next: "truth",
              failNext: "truth_fail",
            },
            { text: "I'll go and see what's holding it up.", next: "go" },
            {
              text: "(Lie) It's been rerouted. Should be along any minute.",
              next: "lie",
            },
            gazPenn,
          ],
        },
        again: {
          speaker: "Harold Pennington",
          text: "Still no sign of it. Very unusual. The M42 is as reliable as mortality tables. More so, frankly.",
          responses: [
            {
              id: "penn_truth2",
              text: "The bus isn't coming, Harold. Look around you.",
              check: { skill: "persuasion", value: 50 },
              next: "truth",
              failNext: "truth_fail",
            },
            {
              text: "I'll find out what happened to it.",
              next: "go",
              cond: () => QX.stage("qx_commute") === "talk",
            },
            {
              text: "(Lie) It's been rerouted. Should be along any minute.",
              next: "lie",
            },
            gazPenn,
            { text: "Good luck.", end: true },
          ],
        },
        long: {
          speaker: "Harold Pennington",
          text:
            "Since the 9:17 didn't stop, I suppose. There was a very loud noise, a very bright light, and then a great many people ran away, " +
            "which I thought excessive for a transit delay. I have been standing here since. My eyes have been playing up; everyone looks so old. I think it's the pollen.",
          responses: [
            {
              id: "penn_truth3",
              text: "That light was a bomb, Harold. It's not pollen. It's been twenty-two years.",
              check: { skill: "persuasion", value: 50 },
              next: "truth",
              failNext: "truth_fail",
            },
            { text: "I'll go and see what's holding the bus up.", next: "go" },
          ],
        },
        truth_fail: {
          speaker: "Harold Pennington",
          text: "A war? Heh. You young people and your jokes. There's no war. There's just the M42, and the M42 is late.",
          responses: [
            { text: "I'll find out what happened to your bus.", next: "go" },
            { text: "Never mind.", end: true },
          ],
        },
        truth: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennHome(false),
          text:
            "[He looks down at his hands — an old man's hands, spotted, thin as paper. He looks at them for a long time. The gold watch in his palm still reads 9:47.] ...Twenty-two years. " +
            "That would make me... well into the actuarial tables' bad column. [A dry laugh.] I never missed a day. Not once. Twenty-five years of punctuality. " +
            "Here. Take the watch. It's never been right since that morning anyway. I think... I think I'll walk. Grand Central, was it? I always did like that ceiling.",
          responses: [{ text: "Take care, Harold.", end: true }],
        },
        go: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennStart("find"),
          text: "Would you? Most kind. It comes up Park from 34th. If it's broken down, the driver will have the timetable — Mr. Dombrowski, lovely fellow, always whistling.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        prog: {
          speaker: "Harold Pennington",
          text: "Any news of the 9:47? Down Park Avenue, toward 34th. Mr. Dombrowski will have the timetable.",
          responses: [gazPenn, { text: "Still looking.", end: true }],
        },
        proof: {
          speaker: "Harold Pennington",
          text: "You found it? You found the bus? Is Mr. Dombrowski alright?",
          responses: [
            {
              text: "[Show him the timetable.] He's been gone a long time, Harold. So has the bus.",
              cond: () => QX.has("qx_m42_timetable"),
              next: "proof2",
            },
            { text: "(Lie) It's rerouted. Keep waiting.", next: "lie" },
          ],
        },
        proof2: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennHome(true),
          text:
            '[He reads it. His finger stops on the circled 9:47.] "Late again. Sunday, March 5th." [He laughs — a long, rattling laugh — until it isn\'t laughter any more.] ' +
            "Late again. Oh, Dombrowski. Oh, all of us. ...Thank you. Truly. Take the watch — it stopped when he did. I believe I'll walk to Grand Central. It's a lovely morning for it. It's been a lovely morning for twenty-two years.",
          responses: [{ text: "Goodbye, Harold.", end: true }],
        },
        lie: {
          speaker: "Harold Pennington",
          onEnter: () => A.pennWait(),
          text: "Rerouted! Of course. Of course it is. [He straightens his tie and faces the avenue.] Thank you. I'll wait. I'm very good at waiting.",
          responses: [{ text: "...", end: true }],
        },
        waiting: {
          speaker: "Harold Pennington",
          text: "Any minute now. Rerouted, you know. Any minute.",
          responses: [gazPenn, { text: "...Yes. Any minute.", end: true }],
        },
        gaz: {
          speaker: "Harold Pennington",
          text: "The Clarion! Splendid. Exact change — and a little extra for the boy. Punctuality should be rewarded.",
          responses: [{ text: "Thank you, sir.", end: true }],
        },
        gc: {
          speaker: "Harold Pennington",
          text: "Ah — my friend from the bus stop! Look at that ceiling. Twenty-two years I stood outside, and all the while there were stars in here. Painted ones, but I'm not fussy.",
          responses: [gazPenn, { text: "Good to see you, Harold.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- MUNI-7
    const gazMuni = {
      id: "gaz_muni",
      text: "[Deliver the Clarion] Your newspaper, officer.",
      cond: () =>
        QX.stage("qx_extra") === "deliver" &&
        !QX.flag("gaz_muni") &&
        QX.has("qx_gazette"),
      action: () => A.deliver("muni", 0),
      next: "gaz",
    };
    QX.dialogue("qx_dlg_muni", {
      start: () => {
        const s = QX.stage("qx_parking");
        if (
          s === "done_good" ||
          (QX.done("qx_parking") && QX.reached("qx_parking", "done_good"))
        )
          return "good";
        if (QX.reached("qx_parking", "done_evil")) return "evil";
        if (QX.done("qx_parking")) return "paid";
        return "fine";
      },
      nodes: {
        fine: {
          speaker: "MUNI-7",
          onEnter: () => A.muniStart(),
          text:
            "CITIZEN. YOU HAVE BEEN ISSUED CITATION NUMBER 1-9-6-7-0-3-0-5-DASH-0-0-0-1. VIOLATIONS: STANDING. LOITERING WITH INTENT TO SURVIVE. WEARING A FEDERAL CRYO SUIT OUTSIDE A FEDERAL FACILITY. " +
            "FINE: ONE THOUSAND NINE HUNDRED SIXTY-SEVEN DOLLARS. PAYMENT IS DUE IMMEDIATELY.",
          responses: [
            {
              text: "I don't have dollars. Will you take Scrip?",
              next: "scrip",
            },
            {
              text: "[Pay in old-world money] Here's ten bills. Keep the change.",
              cond: () => QX.count(OLD_DOLLARS) >= 10,
              action: () => {
                QX.take(OLD_DOLLARS, 10);
                A.muniEnd("done_paid");
              },
              next: "thanks",
            },
            {
              id: "muni_persuade",
              text: "You can't fine me. I'm a federal volunteer on government business, frozen in 1967. Take it up with Washington.",
              check: { skill: "persuasion", value: 45 },
              next: "immune",
              failNext: "immune_fail",
            },
            {
              id: "muni_elec",
              text: "(Open its maintenance panel) Accessing service mode.",
              check: { skill: "electronics", value: 50 },
              next: "service",
            },
            {
              id: "muni_mech",
              text: 'Your citation printer is jammed. Hold still, I\'ll fix it... [and "accidentally" void the ticket]',
              check: { skill: "mechanics", value: 45 },
              next: "voided",
            },
            gazMuni,
            {
              text: "I'm not paying a robot two thousand dollars.",
              next: "refuse",
            },
          ],
        },
        scrip: {
          speaker: "MUNI-7",
          text: "CALCULATING. CURRENT EXCHANGE RATE: ONE FEDERAL RATION SCRIP NOTE EQUALS SEVENTY-EIGHT DOLLARS AND SIXTY-EIGHT CENTS. AMOUNT DUE: TWENTY-FIVE SCRIP. THE CITY THANKS YOU FOR YOUR CO-OPERATION.",
          responses: [
            {
              text: "[Pay 25 Scrip]",
              cond: () => QX.scrip() >= 25,
              action: () => {
                if (QX.pay(25)) A.muniEnd("done_paid");
              },
              next: "thanks",
            },
            { text: "Let me think about it.", end: true },
          ],
        },
        thanks: {
          speaker: "MUNI-7",
          text: "PAYMENT RECEIVED. CITATION CLOSED. HAVE A NICE DAY, CITIZEN. [It swivels and tickets a skeleton in a wrecked Starliner sedan. The skeleton does not contest it.]",
          responses: [{ text: "You too.", end: true }],
        },
        immune: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_talk"),
          text: "CHECKING FEDERAL REGISTRY... REGISTRY UNAVAILABLE. DEFAULTING TO COURTESY PROTOCOL. FEDERAL EXEMPTION RECOGNIZED. PLEASE ENJOY THE CITY, SIR. [It salutes. Something in its shoulder squeaks.]",
          responses: [{ text: "At ease, officer.", end: true }],
        },
        immune_fail: {
          speaker: "MUNI-7",
          text: "FEDERAL VOLUNTEERS ARE SUBJECT TO MUNICIPAL TRAFFIC CODE, SECTION 4. WASHINGTON HAS NOT ANSWERED A CITY LETTER SINCE 1967. NICE TRY, CITIZEN.",
          responses: [
            { text: "Fine. Scrip, then?", next: "scrip" },
            { text: "I'm not paying.", next: "refuse" },
          ],
        },
        voided: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_talk"),
          text: "PRINTER... PRINTER RESTORED. THANK YOU, CITIZEN. CITATION 1-9-6-7... CITATION NOT FOUND. RECORD CORRUPTED. NO FINE IS DUE. HAVE A NICE DAY.",
          responses: [{ text: "Always happy to help the city.", end: true }],
        },
        service: {
          speaker: "MUNI-7",
          text: '[The panel pops open. A tiny amber screen: "MUNI-7 SERVICE MODE — DIRECTIVES: 1. ENFORCE. 2. ENFORCE. 3. REMIT COLLECTIONS TO CITY TREASURY (TREASURY NOT FOUND)."]',
          responses: [
            {
              text: "[Rewrite] 1. Protect citizens. 2. Help citizens. 3. Never fine anyone again.",
              next: "good_set",
            },
            {
              text: "[Rewrite] 3. Remit all collections to... me. (Deposit them in the impound locker.)",
              next: "evil_set",
            },
            {
              text: "[Delete the citation and close the panel.]",
              action: () => A.muniEnd("done_talk"),
              next: "voided2",
            },
          ],
        },
        good_set: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_good"),
          text:
            "DIRECTIVES UPDATED. ...NEW DIRECTIVE: PROTECT CITIZENS. [Its eyes flicker from red to a soft amber.] CITIZEN, THANK YOU. I HAVE WRITTEN FOUR MILLION TICKETS. " +
            "I WOULD LIKE TO DO SOMETHING ELSE NOW. PLEASE ACCEPT THE IMPOUND LOCKER KEY. THE CONTENTS ARE UNCLAIMED.",
          responses: [{ text: "Protect and serve, MUNI-7.", end: true }],
        },
        evil_set: {
          speaker: "MUNI-7",
          onEnter: () => A.muniEnd("done_evil"),
          text:
            "DIRECTIVES UPDATED. BENEFICIARY: YOU. ALL FINES WILL BE COLLECTED DAILY AND DEPOSITED IN THE CITY IMPOUND LOCKER. PLEASE ACCEPT THE KEY. " +
            "FINE ISSUED. FINE ISSUED. FINE ISSUED...",
          responses: [{ text: "Good robot.", end: true }],
        },
        voided2: {
          speaker: "MUNI-7",
          text: "CITATION... NOT FOUND. NO FINE IS DUE. HAVE A NICE DAY, CITIZEN.",
          responses: [{ text: "You too.", end: true }],
        },
        refuse: {
          speaker: "MUNI-7",
          text: "FAILURE TO PAY. WARNING: CONTINUED NON-COMPLIANCE WILL RESULT IN ESCALATED ENFORCEMENT. THIS IS YOUR FINAL NOTICE.",
          responses: [
            { text: "Fine, fine. Let's talk about Scrip.", next: "scrip" },
            {
              text: "Come and collect it, tin can.",
              action: () => A.muniFight(),
              next: "fight",
            },
          ],
        },
        fight: {
          speaker: "MUNI-7",
          text: "RESISTING CITATION. ESCALATING TO LETHAL ENFORCEMENT. PLEASE HAVE YOUR IDENTIFICATION READY FOR THE CORONER.",
          responses: [{ text: "[Draw your weapon]", end: true }],
        },
        gaz: {
          speaker: "MUNI-7",
          text: "MUNICIPAL NOTICES RECEIVED. SUBSCRIPTION DUES: PAYING IN THE CUSTOMARY MANNER. [It prints a parking ticket and hands it to you, then — after a pause — ten Scrip notes from an evidence tray.] PLEASE THANK THE PAPERBOY.",
          responses: [{ text: "Will do.", end: true }],
        },
        paid: {
          speaker: "MUNI-7",
          text: "GOOD DAY, CITIZEN. YOUR RECORD IS CLEAN. PLEASE DO NOT STAND.",
          responses: [gazMuni, { text: "I'll try.", end: true }],
        },
        good: {
          speaker: "MUNI-7",
          text: "CITIZEN! 5TH AVENUE IS PROTECTED. TODAY I HAVE ESCORTED ONE PACK OX, TWO SETTLERS AND A CONFUSED BURROW RAT. NO ONE WAS FINED. I FEEL... I DO NOT HAVE A WORD FOR THIS.",
          responses: [
            gazMuni,
            { text: 'The word is "good", MUNI-7.', end: true },
          ],
        },
        evil: {
          speaker: "MUNI-7",
          text: 'BENEFICIARY. TODAY\'S COLLECTIONS HAVE BEEN DEPOSITED. ONE CITIZEN WEPT. THIS HAS BEEN NOTED AS "PAYMENT IN FULL".',
          responses: [gazMuni, { text: "Keep up the good work.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- EDNA
    const gazEdna = {
      id: "gaz_edna",
      text: "[Deliver the Clarion] Your paper, ma'am. From Scoop.",
      cond: () =>
        QX.stage("qx_extra") === "deliver" &&
        !QX.flag("gaz_edna") &&
        QX.has("qx_gazette"),
      action: () => {
        A.deliver("edna", 0);
        QX.give("qx_edna_cookies", 1);
      },
      next: "gaz",
    };
    QX.dialogue("qx_dlg_edna", {
      start: () => {
        const s = QX.stage("qx_buttons");
        if (s === "return") return "home";
        if (s === "sold") return "sold";
        if (QX.done("qx_buttons")) return "after";
        if (s === "escort") return buttonsWithYou() ? "close" : "prog";
        if (s === "find") return "prog";
        return QX.flag("met_edna") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Edna Vukovich",
          onEnter: () => QX.setFlag("met_edna"),
          text:
            "Oh! Hello, dear. You haven't seen a burrow rat, have you? About so big, lovely pink wrinkles, knitted collar, answers to Mister Buttons? " +
            "He ran off again. He does that when he feels unappreciated. I told him I appreciate him. I think he wanted it in writing.",
          responses: [
            { text: "Your pet is a burrow rat?", next: "pet" },
            { text: "I'll keep an eye out for him.", next: "job" },
            gazEdna,
            { text: "Sorry, no.", end: true },
          ],
        },
        again: {
          speaker: "Edna Vukovich",
          text: "Still no Buttons, dear? He likes Union Square. He likes the pigeons. The pigeons do not like him.",
          responses: [
            { text: "I'll find him.", next: "job" },
            gazEdna,
            { text: "Goodbye, Edna.", end: true },
          ],
        },
        pet: {
          speaker: "Edna Vukovich",
          text:
            'Everybody says that! "Edna, it\'s a burrow rat." "Edna, it bit the mailman." There ARE no mailmen, and he was provoked. He\'s a good boy. ' +
            "He sleeps on my feet. Do you know how cold feet get out here, dear? At my age?",
          responses: [
            { text: "I'll find Mister Buttons.", next: "job" },
            { text: "Good luck.", end: true },
          ],
        },
        job: {
          speaker: "Edna Vukovich",
          onEnter: () => A.buttonsStart("find"),
          text:
            "Oh, bless you. He'll be down toward Union Square — 14th Street. He hides under cars. If he won't come, offer him something to eat. " +
            "Anything, really. He once ate a boot. Bring him home and I'll make it worth your while. I bake!",
          responses: [{ text: "I'll bring him home.", end: true }],
        },
        prog: {
          speaker: "Edna Vukovich",
          text: "Any sign of him, dear? Union Square, under the cars. Offer him a snack.",
          responses: [gazEdna, { text: "Still looking.", end: true }],
        },
        close: {
          speaker: "Edna Vukovich",
          text: "Is that — BUTTONS? Oh, come here, come to mama!",
          responses: [
            {
              text: "Here he is.",
              action: () => A.buttonsHome(),
              next: "home",
            },
          ],
        },
        home: {
          speaker: "Edna Vukovich",
          text: "[Mister Buttons is already asleep on her feet.] Look at him. Look at my baby. You found him! What do I owe you, dear? I have Scrip. I have cookies. The cookies are better than the Scrip.",
          responses: [
            {
              text: "Scrip and cookies sound great.",
              action: () => A.buttonsReward(false),
              next: "bye",
            },
            {
              text: "Nothing. Seeing you two together is enough.",
              action: () => A.buttonsReward(true),
              next: "bye_kind",
            },
          ],
        },
        bye: {
          speaker: "Edna Vukovich",
          text: "Sixty Scrip, and cookies for the road. Don't eat them all at once, they're very... sturdy.",
          responses: [{ text: "Thanks, Edna.", end: true }],
        },
        bye_kind: {
          speaker: "Edna Vukovich",
          text: "Oh, you sweet thing. Then take the whole tin. No arguments! Buttons, say thank you. ...He's saying thank you. That's his thank-you snore.",
          responses: [{ text: "Goodbye, Buttons.", end: true }],
        },
        after: {
          speaker: "Edna Vukovich",
          text: "Hello, dear! Buttons hasn't run off once since you brought him back. Well, twice. But he came back on his own! Cookie?",
          responses: [gazEdna, { text: "Hello, Edna.", end: true }],
        },
        sold: {
          speaker: "Edna Vukovich",
          text: "Still no Buttons, dear. I leave a saucer out every night. He always comes back. He always comes back...",
          responses: [gazEdna, { text: "...I'm sure he will.", end: true }],
        },
        gaz: {
          speaker: "Edna Vukovich",
          text: "The Clarion! Scoop's such a good boy. Here's the dues, and a cookie for you, and — oh, take two.",
          responses: [{ text: "Thank you, Edna.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- MISTER BUTTONS
    QX.dialogue("qx_dlg_buttons", {
      start: () =>
        QX.flag("buttons_home")
          ? "home"
          : QX.flag("buttons_follow")
            ? "follow"
            : "hide",
      nodes: {
        hide: {
          speaker: "Mister Buttons",
          text: "[A burrow rat in a lumpy knitted collar peers out from under the taxi. It hisses at you, then sneezes, then hisses again to make up for the sneeze.]",
          responses: [
            {
              text: "[Offer him some food]",
              cond: () => !!firstFood(),
              action: () => {
                const f = firstFood();
                QX.take(f, 1);
                A.buttonsFollow();
              },
              next: "lured",
            },
            {
              id: "buttons_animal",
              text: "[A Way with Beasts] (Make a soft chittering noise.)",
              cond: () => QX.hasTalent(ANIMAL_TALENT),
              action: () => A.buttonsFollow(),
              next: "lured",
            },
            {
              id: "buttons_grab",
              text: "(Grab him by the scruff.)",
              check: { attr: "reflex", value: 6 },
              action: () => A.buttonsFollow(),
              next: "grabbed",
              failNext: "bitten",
            },
            { text: '"Mister Buttons? Edna sent me."', next: "name" },
            { text: "[Leave him]", end: true },
          ],
        },
        name: {
          speaker: "Mister Buttons",
          text: '[At the name "Edna", his whiskers twitch. He looks at you. He looks at the street. He does not move. He is clearly waiting for a bribe.]',
          responses: [
            {
              text: "[Offer him some food]",
              cond: () => !!firstFood(),
              action: () => {
                const f = firstFood();
                QX.take(f, 1);
                A.buttonsFollow();
              },
              next: "lured",
            },
            { text: "[Leave him]", end: true },
          ],
        },
        lured: {
          speaker: "Mister Buttons",
          text: "[He devours it in three bites, including part of the wrapper, and then trundles out and sits on your boot. He has decided you are his now. Until Edna.]",
          responses: [{ text: "Come on, Buttons. Let's go home.", end: true }],
        },
        grabbed: {
          speaker: "Mister Buttons",
          text: "[You scoop him up before he can bolt. He squirms, squeaks, and then goes limp in resignation, like a sack of angry potatoes. You set him down; he follows, sulking.]",
          responses: [{ text: "Home, Buttons.", end: true }],
        },
        bitten: {
          speaker: "Mister Buttons",
          onEnter: () => {
            if (G.player && G.player.damage)
              QX.safe("bite", () =>
                G.player.damage(4, { type: "melee", source: "Mister Buttons" }),
              );
          },
          text: "[He bites you. Not hard. Just enough to make a point. Then he retreats further under the taxi and glares.]",
          responses: [
            {
              text: "[Offer him some food]",
              cond: () => !!firstFood(),
              action: () => {
                const f = firstFood();
                QX.take(f, 1);
                A.buttonsFollow();
              },
              next: "lured",
            },
            { text: "Ow.", end: true },
          ],
        },
        follow: {
          speaker: "Mister Buttons",
          text: "[Mister Buttons sniffs your hand for more food, finds none, and looks deeply betrayed. He keeps following you anyway.]",
          responses: [{ text: "Almost home, buddy.", end: true }],
        },
        home: {
          speaker: "Mister Buttons",
          text: "[Mister Buttons is asleep. He is snoring. It sounds like a very small chainsaw.]",
          responses: [{ text: "[Let him sleep]", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- BIXBY
    QX.dialogue("qx_dlg_bixby", {
      start: () => {
        const s = QX.stage("qx_bixby");
        if (QX.failed("qx_bixby")) return "torn";
        if (QX.done("qx_bixby")) return "after";
        if (s === "show") return "showing";
        if (s === "return") return "ret";
        if (s === "pages") return "prog";
        return QX.flag("met_bix") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Bartholomew Bixby",
          onEnter: () => QX.setFlag("met_bix"),
          text:
            "Ah! An AUDIENCE! [He sweeps into a bow so deep something in his spine clicks.] Bartholomew Bixby, tragedian. Formerly of the Lyceum, the Belasco, " +
            'and — for one unforgettable night in 1967 — the understudy\'s understudy at the Majestic. Tonight: "Hamlet of Hoboken". My own adaptation. ' +
            "Or it would be tonight, if the WIND had not stolen my script.",
          responses: [
            { text: "The wind stole your script?", next: "wind" },
            { text: "Don't you know your lines by now?", next: "lines" },
            { text: "Break a leg.", end: true },
          ],
        },
        again: {
          speaker: "Bartholomew Bixby",
          text: "You return! Like a ghost on the battlements! Have you reconsidered helping a humble artist in his hour of need?",
          responses: [
            { text: "Tell me about the pages.", next: "wind" },
            { text: "Not yet.", end: true },
          ],
        },
        lines: {
          speaker: "Bartholomew Bixby",
          text: "Twenty-two years of radiation, darling. I know the FEELINGS. The words fell out somewhere around 1975, along with my eyebrows.",
          responses: [{ text: "So where are the pages?", next: "wind" }],
        },
        wind: {
          speaker: "Bartholomew Bixby",
          text:
            "A gust! A storm gust, straight off the Hudson! Three pages, torn from my very hands! Act One flew toward Radio City. Act Two went " +
            "into the Neon, where the stagehands will use it for kindling, the philistines. And the FINAL page — the death scene, my death scene — blew east, into Bryant Park, among the beasts.",
          responses: [
            {
              text: "I'll find your pages.",
              action: () => A.bixStart(),
              next: "thanks",
            },
            { text: "Sounds like a job for someone else.", end: true },
          ],
        },
        thanks: {
          speaker: "Bartholomew Bixby",
          text: "A hero! A patron! Your name shall be in the programme! There is no programme. I shall SAY your name. Loudly. Go, go — the show must go on!",
          responses: [{ text: "Exit, pursued by a bear.", end: true }],
        },
        prog: {
          speaker: "Bartholomew Bixby",
          text: () =>
            "Any luck? You have " +
            QX.misc.pagesHave() +
            " of the three. Radio City, the Neon, and the beastly park.",
          responses: [{ text: "Still searching.", end: true }],
        },
        ret: {
          speaker: "Bartholomew Bixby",
          text: "My PAGES! All three! [He clutches them to his chest and breathes in deeply.] They smell of burrow rat and destiny. Now — the performance. Will you stay?",
          responses: [
            {
              text: "Wouldn't miss it. Break a leg.",
              action: () => A.bixHandIn(false),
              next: "curtain",
            },
            {
              id: "bix_costar",
              text: "Need a Horatio? I've got a face for the stage.",
              check: { attr: "presence", value: 6 },
              action: () => A.bixHandIn(true),
              next: "curtain2",
              failNext: "nope",
            },
            {
              text: "(Cruel) [Tear the pages up in front of him.]",
              standing: -25,
              action: () => A.bixTear(),
              next: "torn_now",
            },
          ],
        },
        nope: {
          speaker: "Bartholomew Bixby",
          text: "Darling, no. You have the stage presence of a filing cabinet. A LOVELY filing cabinet. Sit in the front row.",
          responses: [
            {
              text: "Fine. Break a leg.",
              action: () => A.bixHandIn(false),
              next: "curtain",
            },
          ],
        },
        curtain: {
          speaker: "Bartholomew Bixby",
          text: "Places! PLACES! [He turns to an audience of you, two retired chorus girls and a curious pigeon.] Stand just there — no, THERE — and prepare to weep.",
          responses: [{ text: "[Watch the show]", end: true }],
        },
        curtain2: {
          speaker: "Bartholomew Bixby",
          text: 'A natural! Look at that jaw. Look at those teeth — all your own! Marvellous. Stand stage left. When I say "Who\'s there?", you say "Nay, answer me." Simple! Places!',
          responses: [{ text: "[Take your mark]", end: true }],
        },
        showing: {
          speaker: "Bartholomew Bixby",
          text: "Shh! The play's the thing! [He waves you back to your mark.]",
          responses: [{ text: "[Watch]", end: true }],
        },
        torn_now: {
          speaker: "Bartholomew Bixby",
          text: "[He watches the pieces flutter to the pavement. For a long moment he says nothing at all.] ...Everyone's a critic.",
          responses: [{ text: "[Leave]", end: true }],
        },
        torn: {
          speaker: "Bartholomew Bixby",
          text: "Oh. It's you. The critic. [He turns his back.] There is no show tonight. There may never be a show again.",
          responses: [{ text: "[Leave]", end: true }],
        },
        after: {
          speaker: "Bartholomew Bixby",
          text: () =>
            QX.flag("bix_costar")
              ? "My HORATIO! The finest scene partner I've had since 1967! He was a mannequin. You were better."
              : "My most loyal patron! Same time tomorrow? Every night is opening night when you can't remember the last one.",
          responses: [{ text: "Encore!", end: true }],
        },
      },
    });
  });
