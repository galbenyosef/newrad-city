// play-inline-559 06 — responses
// Lines 1635-2866 of readable/play-inline-559.pretty.js (statement-aligned).
  L.hook("register", function () {
    // ---- Mayor Crowe gets the Ball ----
    const crowe = L.DIALOGUES.get("dlg_neon_crowe");
    if (crowe && crowe.nodes && crowe.nodes.again) {
      const add = [
        {
          _neonBall: true,
          text: "Tell me about the Ball.",
          cond: () => !Q.isStarted("sq_neon_ball"),
          next: "ball",
        },
        {
          _neonBall: true,
          text: "About the Ball…",
          cond: () => Q.isActive("sq_neon_ball"),
          next: "ball_prog",
        },
      ];
      for (const nid of ["again", "first"]) {
        const n = crowe.nodes[nid];
        if (
          n &&
          Array.isArray(n.responses) &&
          !n.responses.some((r) => r._neonBall)
        )
          n.responses.splice(Math.max(0, n.responses.length - 1), 0, ...add);
      }
      crowe.nodes.ball = {
        text: "The Ball! Up there — see it? Stuck on its mast since the morning the sky caught fire. Every New Year's Eve, before the bombs, a million people watched it fall. Now it just… hangs. Like the rest of us. If that Ball drops again, friend, the Neon isn't a shanty town any more. It's a CITY. We'd need a winch motor — the old book lift at the Public Library has one — and forty metres of cable. Sprocket can spin you cable.",
        responses: [
          {
            text: "I'll get your Ball dropping.",
            action: () => Q.start("sq_neon_ball"),
          },
          { text: "What's in it for me?", next: "ball_pay" },
          { text: "Maybe later." },
        ],
      };
      crowe.nodes.ball_pay = {
        text: "Two hundred and fifty scrip from the treasury — that's my other hat — and the eternal gratitude of the Neon. Also, at midnight, you get to watch the Ball drop. You can't put a price on that. I tried. Council said no.",
        responses: [
          { text: "Deal.", action: () => Q.start("sq_neon_ball") },
          { text: "I'll think about it." },
        ],
      };
      crowe.nodes.ball_prog = {
        text: () =>
          Q.stage("sq_neon_ball") === "midnight"
            ? "Midnight, citizen! Be in the square at midnight! I've had my good hat pressed."
            : Q.stage("sq_neon_ball") === "install"
              ? "You have the parts? Then to the base of One Times Square, quick, before I start crying. A mayor crying is not a pretty thing. Very… gravelly."
              : "The motor's in the Library, the cable's at Sprocket's. Don't let the Library's residents shush you to death.",
        responses: [{ text: "On it." }],
      };
    }
    // ---- Sprocket spins cable ----
    const spr = L.DIALOGUES.get("dlg_neon_sprocket");
    if (
      spr &&
      spr.nodes &&
      spr.nodes.hello &&
      !spr.nodes.hello.responses.some((r) => r._neonCable)
    ) {
      spr.nodes.hello.responses.splice(1, 0, {
        _neonCable: true,
        text: "I need forty metres of steel cable. For the Ball.",
        cond: () =>
          Q.stage("sq_neon_ball") === "parts" && !L.has("q_neon_cable"),
        next: "cable",
      });
      spr.nodes.cable = {
        text: "For the BALL? Oh, you beautiful lunatic. I've been saving a spool of elevator cable since 1967 for exactly this. Sixty scrip, and that's the patriot discount.",
        responses: [
          {
            text: "Here. (60 scrip)",
            cond: () => L.scrip() >= 60,
            action: () => {
              if (L.pay(60)) {
                L.give("q_neon_cable", 1);
                ballPartsCheck();
              }
            },
          },
          {
            text: "It's for the whole Neon. Surely the patriot discount is bigger.",
            check: { skill: "persuasion", value: 40 },
            next: "cable_free",
            failNext: "cable_no",
          },
          { text: "Later.", next: "hello" },
        ],
      };
      spr.nodes.cable_free = {
        text: "Ugh. Fine! Take it! For the Neon! If it snaps, you never got it from me.",
        onEnter() {
          L.give("q_neon_cable", 1);
          ballPartsCheck();
        },
        responses: [{ text: "Thanks, Sprocket." }],
      };
      spr.nodes.cable_no = {
        text: "The whole Neon can chip in, then. Sixty scrip.",
        responses: [
          {
            text: "Fine. (60 scrip)",
            cond: () => L.scrip() >= 60,
            action: () => {
              if (L.pay(60)) {
                L.give("q_neon_cable", 1);
                ballPartsCheck();
              }
            },
          },
          { text: "Later." },
        ],
      };
    }
    // ---- The Ball's winch (actor-less) ----
    L.dialogue("dlg_neon_winch", {
      start: () =>
        L.has("q_neon_winch_motor") && L.has("q_neon_cable") ? "fix" : "look",
      nodes: {
        look: {
          text: "[A rusted winch house at the foot of the mast. The motor mount is empty and the old cable hangs in a frayed, sad loop. You'll need a winch motor and new cable.]",
          responses: [{ text: "[Leave.]" }],
        },
        fix: {
          text: "[You lay out the book-lift motor and the spool of cable. The mount is corroded, the wiring was old when Eisenhower was young, and the mast is thirty metres up.]",
          responses: [
            {
              text: "Bolt in the motor and re-reeve the cable yourself.",
              check: { skill: "mechanics", value: 50 },
              next: "done",
              failNext: "fail",
              action: () => installBall("mechanics"),
            },
            {
              text: "Wire the motor to the Neon's grid through a timer relay.",
              check: { skill: "electronics", value: 55 },
              next: "done_sci",
              failNext: "fail",
              action: () => installBall("electronics"),
            },
            {
              text: "Pay Sparks Malloy's crew to install it. (100 scrip)",
              cond: () => L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) installBall("paid");
              },
              next: "done_paid",
            },
            { text: "[Leave.]" },
          ],
        },
        fail: {
          text: "[The mount bolts sheer off in your hand. You're going to need help with this.]",
          responses: [
            {
              text: "Pay Sparks's crew instead. (100 scrip)",
              cond: () => L.scrip() >= 100,
              action: () => {
                if (L.pay(100)) installBall("paid");
              },
              next: "done_paid",
            },
            { text: "[Leave.]" },
          ],
        },
        done: {
          text: "[The motor coughs, catches, and hums. High above, the Ball shivers on its mast for the first time in twenty-two years. An old man in the crowd drops his noodles.]",
          onEnter() {
            L.xp(60, "Mechanics: the Ball winch");
          },
          responses: [{ text: "[Midnight, then.]" }],
        },
        done_sci: {
          text: "[A relay clacks. The Neon's grid feeds the winch through a timer: at midnight, every night, the Ball will drop. Sparks is going to be furious you didn't ask.]",
          onEnter() {
            L.xp(60, "Electronics: the Ball winch");
          },
          responses: [{ text: "[Midnight, then.]" }],
        },
        done_paid: {
          text: '[Sparks\'s crew swarms the mast with ropes and swearing. An hour later the winch hums. "Don\'t touch it," they tell you. "Don\'t even look at it."]',
          responses: [{ text: "[Midnight, then.]" }],
        },
      },
    });

    // ---- Sparks Malloy ----
    L.dialogue(
      "dlg_neon_sparks",
      N().sleepy({
        start: () =>
          Q.isActive("sq_neon_power") && Q.stage("sq_neon_power") === "report"
            ? "report"
            : "hello", // (stage stays 'report' once complete)
        nodes: {
          hello: {
            text: () =>
              Q.isComplete("sq_neon_power")
                ? "Lights are steady. Kip's gone, Slag's gone, and the Big Buzz is purring. I owe you one. Well — I owe you several."
                : pick([
                    "Sparks Malloy, chief engineer. You're standing on the Big Buzz. Well, above it. It's under the stage. Everything's under the stage.",
                    "Don't touch anything that hums. Or glows. Or hums AND glows.",
                  ]),
            responses: [
              {
                text: "Your lights keep going out.",
                cond: () => !Q.isStarted("sq_neon_power"),
                next: "job",
              },
              {
                text: "I've got three dry cells for the backup bank.",
                cond: () =>
                  Q.isActive("sq_neon_power") &&
                  !L.flag("power_fuel") &&
                  L.has("dry_cell", 3),
                next: "fuel",
              },
              { text: "What exactly is the Big Buzz?", next: "buzz" },
              { text: "See you, Sparks." },
            ],
          },
          job: {
            text: "Three nights running! Two in the morning, on the dot, the whole west side goes dark. Generators are fine. Fuel's fine. Somebody's pulling my breakers, and I can't leave the board long enough to catch 'em. Take a look at the main panel for me?",
            responses: [
              {
                text: "I'll take a look.",
                action: () => Q.start("sq_neon_power"),
              },
              { text: "Not my problem." },
            ],
          },
          buzz: {
            text: "Old-world theatre generator, two steam turbines I rebuilt from a laundry, one very old diesel, and six hundred metres of cable up the billboards. She's the only thing between the Neon and the dark. Without her, the Maniacs come back into the square. So — don't touch her.",
            responses: [{ text: "Got it.", next: "hello" }],
          },
          fuel: {
            text: "Three cells! Look at them. Beautiful. That's a week of backup if the main goes. Here — it's not much, but it's what the Council gives me.",
            onEnter() {
              L.take("dry_cell", 3);
              L.giveScrip(120);
              L.setFlag("power_fuel");
              L.xp(50, "Fuel run");
            },
            responses: [{ text: "Glad to help.", next: "hello" }],
          },
          report: {
            text: () =>
              "It's over? Slag's crew is dead at the west gate? " +
              (L.flag("kip_outcome") === "arrested"
                ? "And Kip in the Captain's lock-up. "
                : L.flag("kip_outcome") === "fled"
                  ? "And Kip ran off. Good riddance. "
                  : L.flag("kip_outcome") === "dead"
                    ? "And Kip… well. Kip made his choice. "
                    : "") +
              "The Neon's got power, and it's got it because of you. Here — Council pay, and my thanks.",
            onEnter() {
              Q.complete("sq_neon_power");
              if (L.flag("kip_outcome") !== "fled")
                L.standing(100, "Saved the Neon's lights");
              L.news(
                'Raiders who tried to storm the Neon in the dark found the lights on and the guards waiting. The Neon\'s chief engineer credits "a topsider with a gun and a nose for trouble."',
              );
            },
            responses: [{ text: "Keep the lights on, Sparks." }],
          },
        },
      }),
    );
    L.dialogue("dlg_neon_panel", {
      start: () => (Q.stage("sq_neon_power") === "inspect" ? "look" : "fine"),
      nodes: {
        fine: {
          text: "[The Big Buzz's main breaker panel: a wall of Bakelite switches, jury-rigged fuses and cables thick as your arm. Everything hums. Nothing is on fire.]",
          responses: [{ text: "[Leave.]" }],
        },
        look: {
          text: "[Behind the panel, the main feed to the west side has been cut — neatly, with bolt cutters, then twisted back together so it only fails under load. Tucked behind the conduit is a crumpled note.]",
          onEnter() {
            if (!L.has("q_neon_sab_note")) L.give("q_neon_sab_note", 1);
          },
          responses: [
            {
              text: "Splice the cut properly.",
              check: { skill: "mechanics", value: 30 },
              next: "spliced",
              failNext: "nosplice",
            },
            {
              text: "[Take the note and tell Sparks.]",
              action: () => {
                if (Q.stage("sq_neon_power") === "inspect")
                  Q.setStage("sq_neon_power", "culprit");
              },
            },
          ],
        },
        spliced: {
          text: "[You strip the ends, splice and tape the feed. The west side won't go dark again — not by accident. Whoever did this will have to try something else.]",
          onEnter() {
            L.setFlag("power_spliced");
            L.xp(40, "Mechanics: the Big Buzz");
            if (Q.stage("sq_neon_power") === "inspect")
              Q.setStage("sq_neon_power", "culprit");
          },
          responses: [{ text: "[Read the note.]" }],
        },
        nosplice: {
          text: "[You burn your fingers and nearly your eyebrows. Better leave the splice to Sparks.]",
          onEnter() {
            if (Q.stage("sq_neon_power") === "inspect")
              Q.setStage("sq_neon_power", "culprit");
          },
          responses: [{ text: "[Take the note.]" }],
        },
      },
    });
    L.dialogue("dlg_neon_kip", {
      start: () =>
        Q.stage("sq_neon_power") === "confront" ||
        (Q.stage("sq_neon_power") === "culprit" && L.has("q_neon_sab_note"))
          ? "confront"
          : "hello",
      nodes: {
        hello: {
          text: pick([
            "What? I'm working.",
            "You need something moved, move it yourself.",
          ]),
          responses: [{ text: "Never mind." }],
        },
        confront: {
          text: "[He sees the note in your hand and goes the colour of old newspaper.] I… that ain't mine. Lotsa people are K.L. Kevin… Lefkowitz. Karl… Lamb.",
          responses: [
            {
              text: "Kip. The Guard is going to find out anyway. Tell me now, and I'll speak for you.",
              check: { skill: "persuasion", value: 50 },
              next: "confess",
              failNext: "deny",
            },
            {
              text: "[Grab him by the collar.] Talk.",
              check: { attr: "brawn", value: 7 },
              next: "confess",
            },
            {
              text: "Lucky Lou says you owe him three hundred scrip.",
              cond: () => L.flag("kip_known") === "lou",
              next: "confess",
            },
            {
              text: "Nice try. You're coming with me to the Captain.",
              next: "deny",
            },
          ],
        },
        deny: {
          text: "I ain't going nowhere with you! [He pulls a switchblade.] Stay back! STAY BACK!",
          onEnter() {
            const a = L.npc("neon_kip");
            if (a) {
              a.setHostile(true);
              a.safeExempt = true;
            }
          },
          responses: [{ text: "[Fight.]" }],
        },
        confess: {
          text: "Okay! OKAY! It's Slag. Slag and the Terminal Boys, from the Port Authority. I owed Lou three hundred and Slag paid it — said all I had to do was kill the lights at two, open the west gate, and he'd… he'd take the market. Tonight. Tonight at two. Please. They said nobody'd get hurt.",
          responses: [
            {
              text: "You're going to tell that to Captain Kincaid.",
              standing: 50,
              action: () => kipResolved("arrested"),
              next: "arrest",
            },
            {
              text: "Run. And don't ever come back to the Neon.",
              next: "flee",
            },
            {
              text: "How much is it worth to you to walk away?",
              next: "bribe",
            },
          ],
        },
        arrest: {
          text: "[Kip slumps.] Yeah. Yeah, okay. [Two guards appear at your shoulder — the Captain's been watching. They march him off.] Two o'clock. West gate. Don't let 'em in.",
          responses: [{ text: "[Leave.]" }],
        },
        flee: {
          text: "Thank you. THANK you. I'm gone. You never saw me.",
          onEnter() {
            kipResolved("fled");
            const a = L.npc("neon_kip");
            if (a) {
              const g = N().has(["gate_s", "entrance_south"]);
              if (g) a.moveTo(g.x, g.z + 30);
            }
          },
          responses: [{ text: "[Leave.]" }],
        },
        bribe: {
          text: "I… I got a hundred scrip. That's everything. Everything! Take it!",
          responses: [
            {
              text: "Deal. Now run.",
              standing: -100,
              action: () => {
                L.giveScrip(100);
                kipResolved("fled");
              },
            },
            {
              text: "Keep your scrip. You're going to the Captain.",
              standing: 50,
              action: () => kipResolved("arrested"),
              next: "arrest",
            },
          ],
        },
      },
    });

    // ---- Captain Mercy Kincaid ----
    const tags = () => L.count("raider_tags"),
      fingers = () => L.count("bounty_finger");
    const CAPT = { paid: 0 };
    L.dialogue("dlg_neon_capt", {
      start: () => (L.flag("met_kincaid") ? "hello" : "first"),
      nodes: {
        first: {
          text: "Hold it. [She looks you over the way a butcher looks at a pack ox.] Topsider. Cryo suit. Big eyes. Welcome to the Neon — I'm Captain Mercy Kincaid, and the Neon Guard is me and everybody holding a gun in this square. No toll for the living. The dead pay double.",
          onEnter() {
            L.setFlag("met_kincaid");
          },
          responses: [
            { text: "The dead pay double?", next: "toll" },
            { text: "What are the rules?", next: "rules" },
            { text: "Understood, Captain.", next: "hello" },
          ],
        },
        toll: {
          text: "Maniacs. Raiders. Anything that walks in here screaming or wanting you dead. They pay in lead. Twice. [Something that might be a smile.] You're fine. You still got manners. Lucky you.",
          responses: [
            { text: "And the rules?", next: "rules" },
            { text: "Good to know.", next: "hello" },
          ],
        },
        rules: {
          text: "No shooting inside the gates. No stealing from the stalls. No starting fights with residents — they've outlived one government and they've got nothing left to lose. Holster your weapon when you're near my people and we'll never have a problem.",
          responses: [{ text: "Understood.", next: "hello" }],
        },
        hello: {
          text: () =>
            L.flag("neon_guard_sergeant")
              ? "Sergeant. Walls are quiet. What do you need?"
              : L.flag("neon_guard_member")
                ? "Guardsman. Report."
                : pick([
                    "Topsider. Behaving?",
                    "Captain Kincaid. Make it quick, I've got four gates and six guards.",
                  ]),
          responses: [
            {
              text: "I hear you're hiring.",
              cond: () => !Q.isStarted("sq_neon_guard"),
              next: "hire",
            },
            {
              text: () => {
                const b = currentBounty();
                return "About the bounty on " + (b ? b.name : "…") + ".";
              },
              cond: () => !!currentBounty(),
              next: "bounty",
            },
            {
              text: "The job's done.",
              cond: () =>
                Q.isActive("sq_neon_guard") &&
                /^r[123]$/.test(Q.stage("sq_neon_guard") || ""),
              next: "paid",
            },
            {
              text: () =>
                "I have raider tags for you. (" + tags() + " × 5 scrip)",
              cond: () => !!L.flag("neon_guard_member") && tags() > 0,
              action: () => {
                const n = tags();
                L.take("raider_tags", n);
                L.giveScrip(n * 5);
                return "thanks";
              },
            },
            {
              text: () =>
                "I have bounty fingers. (" + fingers() + " × 20 scrip)",
              cond: () => fingers() > 0,
              action: () => {
                const n = fingers();
                L.take("bounty_finger", n);
                L.giveScrip(n * 20);
                return "thanks";
              },
            },
            {
              text: "Kip Lasko cut the power. Slag's raiders hit the west gate at two.",
              cond: () =>
                Q.stage("sq_neon_power") === "defend" && !L.flag("capt_warned"),
              next: "warn",
            },
            {
              text: "I'm ready for the raid. [Wait until 1:50 AM]",
              cond: () =>
                Q.stage("sq_neon_power") === "defend" &&
                !!L.flag("capt_warned") &&
                !(G.time.hour >= 1.8 && G.time.hour < 5),
              action: () => waitForRaid(),
            },
            {
              text: 'Anything I should know about "K.L."?',
              cond: () => Q.stage("sq_neon_power") === "culprit",
              next: "kl",
            },
            { text: "What are the rules again?", next: "rules" },
            { text: "Carry on, Captain." },
          ],
        },
        thanks: {
          text: "Good. Every one of these is one less problem at my gates.",
          responses: [
            { text: "Anything else?", next: "hello" },
            { text: "Later." },
          ],
        },
        hire: {
          text: "Hiring? I'm BEGGING. Three bounties on the Mayor's board, all within a day's walk. Bring them down, you get paid, you get a place on the wall. Do all three and I'll make you a Sergeant — I'm short one, the last one got eaten. Interested?",
          responses: [
            {
              text: "Sign me up.",
              action: () => {
                Q.start("sq_neon_guard");
                L.setFlag("neon_guard_member");
                spawnBounty(BOUNTIES[0]);
              },
              next: "sworn",
            },
            { text: "Not right now.", next: "hello" },
          ],
        },
        sworn: {
          text: () =>
            "Then raise your right hand. …The other right. Do you swear to guard the Neon, its people, its lights and its terrible noodles? Good enough. First name on the board: " +
            BOUNTIES[0].name +
            ", on the Public Library steps. Don't get shushed.",
          responses: [{ text: "On my way." }],
        },
        bounty: {
          text: () => {
            const b = currentBounty();
            return b ? b.text.replace(/^WANTED: /, "") : "…";
          },
          responses: [{ text: "Consider it done." }],
        },
        paid: {
          text: () => {
            const i = CAPT.paid;
            const b = BOUNTIES[i];
            return i < 2
              ? b.name +
                  " is dead? Good. That's " +
                  b.pay +
                  " scrip. Next name on the board is " +
                  BOUNTIES[i + 1].name +
                  ". " +
                  BOUNTIES[i + 1].text.split("—")[0].replace(/^WANTED: /, "")
              : "Gristle. The Gristle. [She takes a long breath.] You know how many of my people that thing ate? Sergeant. Kneel. …Stand up, I was joking about kneeling. Here — your beret. Wear it where the Maniacs can see it.";
          },
          onEnter() {
            const i = (CAPT.paid = Math.max(
              0,
              Math.min(
                2,
                Number((Q.stage("sq_neon_guard") || "r1").slice(1)) - 1,
              ),
            ));
            const b = BOUNTIES[i];
            L.giveScrip(b.pay);
            L.setFlag("bounty_done_" + b.id);
            if (b.standing)
              L.standing(b.standing, "Neon Guard bounty: " + b.name);
            if (i < 2) {
              Q.setStage("sq_neon_guard", BOUNTIES[i + 1].stage);
              spawnBounty(BOUNTIES[i + 1]);
            } else {
              L.give("q_neon_beret", 1);
              L.setFlag("neon_guard_sergeant");
              Q.complete("sq_neon_guard");
              L.news(
                'The Neon Guard has a new Sergeant: a topsider from out of town who took down a Brute war-chief called Gristle on Seventh Avenue. The Captain calls it "adequate."',
              );
            }
          },
          responses: [{ text: "Thank you, Captain." }],
        },
        warn: {
          text: "Two in the morning. West gate. [Her jaw works.] Kip. I bought that kid a drink on his first day. …Alright. I'll double the west wall. You — if you want to earn your keep, be at that gate at two.",
          onEnter() {
            L.setFlag("capt_warned");
          },
          responses: [{ text: "I'll be there.", next: "hello" }],
        },
        kl: {
          text: "K.L.? [She pulls a duty roster from her coat.] …Kip Lasko signed out a night pass for the west gate every night this week. Depot porter. Twitchy. I'd start there.",
          onEnter() {
            kipKnown("capt");
          },
          responses: [{ text: "Thanks, Captain." }],
        },
      },
    });

    // ---- Lucky Lou knows about Kip (inject into the dealer's rumours) ----
    const lou = L.DIALOGUES.get("dlg_neon_dealer");
    if (
      lou &&
      lou.nodes &&
      lou.nodes.hello &&
      !lou.nodes.hello.responses.some((r) => r._kip)
    ) {
      lou.nodes.hello.responses.splice(4, 0, {
        _kip: true,
        text: 'Anybody around here go by "K.L."?',
        cond: () => Q.stage("sq_neon_power") === "culprit",
        next: "kip",
      });
      lou.nodes.kip = {
        text: "K.L.? Kip Lasko. Depot porter. Owes me three hundred scrip — well, owed. Paid it off last week in one lump. Porter don't make three hundred in a year. Made me think somebody else is paying Kip's debts. Somebody who wants something.",
        onEnter() {
          kipKnown("lou");
        },
        responses: [{ text: "Thanks, Lou.", next: "hello" }],
      };
    }

    // ---- Lionel Fairweather & the Opry ----
    L.dialogue(
      "dlg_neon_director",
      N().sleepy({
        start: () =>
          Q.stage("sq_neon_opry") === "wig" && L.has("q_neon_wig")
            ? "wigback"
            : "hello",
        nodes: {
          hello: {
            text: () =>
              L.flag("opry_star")
                ? "My star! My STAR! The Opry has never been fuller. Half the Neon came to see the topsider sing, and the other half came to see the topsider fail."
                : Q.stage("sq_neon_opry") === "show"
                  ? "Opening night, darling! Eight o'clock! Be on that stage or I will personally die. Dramatically."
                  : Q.stage("sq_neon_opry") === "wig"
                    ? "Velvet won't go on without her wig. She says she's \"naked up there.\" She hasn't had her own hair since the fire, darling. Find that wig!"
                    : pick([
                        "Lionel Fairweather, artistic director of the Neon Opry. The only theatre in New York with a running show AND a running audience.",
                        "Art never dies, darling. It just gets a little singed.",
                      ]),
            responses: [
              {
                text: "I hear you need a leading player.",
                cond: () =>
                  !Q.isStarted("sq_neon_opry") ||
                  Q.stage("sq_neon_opry") === "audition",
                next: "audition",
              },
              {
                text: "What happened to your last lead?",
                cond: () => !L.flag("opry_star"),
                next: "lead",
              },
              { text: "Goodbye, Lionel." },
            ],
          },
          lead: {
            text: 'Mister Dalton Pryce. Twenty years in the role. Middle of "Shine On, Ashen Moon," he looks at the audience, says "I can\'t do this anymore," and walks off the stage, out the stage door, and — last we heard — into the Hudson. Artists.',
            responses: [
              { text: "I could take his place.", next: "audition" },
              { text: "Tragic.", next: "hello" },
            ],
          },
          audition: {
            text: "You?! A topsider? Well — beggars can't be choosers, and I'm a beggar with a theatre. Show me something. Anything. Please.",
            onEnter() {
              if (!Q.isStarted("sq_neon_opry")) Q.start("sq_neon_opry");
            },
            responses: [
              {
                text: "[Sing a few bars of an old Civil Defense jingle.]",
                check: { attr: "presence", value: 6 },
                next: "aud_sing",
                failNext: "aud_fail",
                retry: true,
              },
              {
                text: "[Deliver a dramatic monologue about the cryo unit's cafeteria.]",
                check: { skill: "persuasion", value: 45 },
                next: "aud_speak",
                failNext: "aud_fail",
                retry: true,
              },
              {
                text: "Your spotlight's dying. I could be your stagehand instead.",
                check: { skill: "mechanics", value: 35 },
                next: "aud_hand",
                failNext: "aud_fail",
                retry: true,
              },
              { text: "Let me prepare. I'll be back." },
            ],
          },
          aud_sing: {
            text: "[Lionel dabs at a scarred eyelid.] That was… that was the worst thing I have ever heard, and I have heard a Maniac howl along to Puccini. The audience will ADORE you. You're hired!",
            onEnter() {
              opryCast("lead");
            },
            responses: [{ text: "When do I start?", next: "cast" }],
          },
          aud_speak: {
            text: "\"…and the Salisbury steak, oh, the Salisbury steak, it looked at me, and I at it, and we both knew…\" [Lionel is openly weeping.] Stop. STOP. You're hired. You're a genius. You're a monster.",
            onEnter() {
              opryCast("lead");
            },
            responses: [{ text: "When do I start?", next: "cast" }],
          },
          aud_hand: {
            text: "[You re-seat the spotlight's carbon arc and the stage floods with white light. Lionel gasps.] Light! LIGHT! Oh, you marvellous mechanic. You're our new stagehand — and our new walk-on, because frankly we need bodies.",
            onEnter() {
              opryCast("hand");
            },
            responses: [{ text: "When do I start?", next: "cast" }],
          },
          aud_fail: {
            text: "[Silence. Somewhere in the back, Nicky Two-Thumbs is laughing so hard he's wheezing.] …Right. Well. Come back when you've… practised. At anything.",
            responses: [{ text: "I'll be back." }],
          },
          cast: {
            text: "Opening night is the moment Velvet gets her wig back. Somebody STOLE it — right off the dummy head in her dressing room. She won't go on without it. Find the wig, and then be on that stage at eight o'clock.",
            responses: [{ text: "I'll find it." }],
          },
          wigback: {
            text: "The WIG! You found the wig! [He clutches it like a newborn.] Velvet! VELVET! We have a show! Eight o'clock, darling, eight o'clock!",
            onEnter() {
              L.take("q_neon_wig", 1);
              L.setFlag("opry_wig_back");
              Q.setStage("sq_neon_opry", "show");
            },
            responses: [{ text: "See you on stage." }],
          },
        },
      }),
    );
    L.dialogue(
      "dlg_neon_velvet",
      N().sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              Q.stage("sq_neon_opry") === "wig"
                ? "Don't look at me! I'm NAKED! [She is fully clothed. She means the wig.] Someone stole my wig. Someone who LAUGHS too much. Someone with too many THUMBS."
                : L.flag("opry_star")
                  ? "Darling! My co-star! Twenty-two years and I've never had a leading player who smelled of soap. It's refreshing. It's disgusting. Kiss kiss."
                  : pick([
                      "Velvet Maloney. Yes, THE Velvet Maloney. Well — one of them.",
                      "Autographs after the show, darling.",
                    ]),
            onEnter() {
              if (Q.stage("sq_neon_opry") === "wig")
                L.setFlag("wig_thief_known");
            },
            responses: [
              { text: "How long have you been performing?", next: "career" },
              { text: "Break a leg." },
            ],
          },
          career: {
            text: "Since before the bombs, darling. I was in the chorus of \"Sweethearts of '67\" at the Winter Garden. Opening night was the night the bombs fell. We never got to the second act. [She stares at nothing.] I've been doing the second act ever since.",
            responses: [{ text: "Break a leg." }],
          },
        },
      }),
    );
    L.dialogue("dlg_neon_opry_show", {
      start: "curtain",
      nodes: {
        curtain: {
          speaker: "Lionel Fairweather",
          text: "[The house lights dim. The spotlight finds you. Two hundred faces — painted, patched, lit pink and green by the marquee — stare up at you. Lionel hisses from the wings:] Your line, darling! YOUR LINE!",
          responses: [
            {
              text: '"Ladies and gentlemen and… others! Welcome to the Neon!"',
              action: () => {
                L.incFlag("opry_score", 2);
                applause(3);
              },
              next: "act2",
            },
            {
              text: '[Ad-lib] "I was told there\'d be a smaller crowd. And fewer eyebrows."',
              check: { attr: "presence", value: 7 },
              action: () => {
                L.incFlag("opry_score", 3);
                applause(5);
              },
              next: "act2",
              failNext: "act2_bad",
            },
            {
              text: '"Uh… hi."',
              action: () => {
                boo(2);
              },
              next: "act2",
            },
          ],
        },
        act2_bad: {
          text: "[The joke dies somewhere around the third row. Nicky Two-Thumbs boos. Velvet sweeps on stage to save the scene.]",
          responses: [{ text: "[Carry on.]", next: "act2" }],
        },
        act2: {
          speaker: "Velvet Maloney",
          text: '[Velvet takes your arm and leads into the duet — "Mind the Face, Darling." It\'s your verse.]',
          responses: [
            {
              text: "[Sing it straight, from the heart.]",
              action: () => {
                L.incFlag("opry_score", L.attr("presence") >= 5 ? 2 : 1);
                applause(3);
              },
              next: "finale",
            },
            {
              text: "[Turn it into a comedy number.]",
              check: { skill: "persuasion", value: 50 },
              action: () => {
                L.incFlag("opry_score", 3);
                applause(6);
              },
              next: "finale",
              failNext: "finale",
            },
            {
              text: "[Dance instead. Badly. With conviction.]",
              action: () => {
                L.incFlag("opry_score", L.attr("reflex") >= 6 ? 2 : 1);
                applause(2);
              },
              next: "finale",
            },
          ],
        },
        finale: {
          speaker: "Lionel Fairweather",
          text: () =>
            (Number(L.flag("opry_score")) || 0) >= 5
              ? '[The finale: "Shine On, Ashen Moon." The whole company joins you. By the last note, the audience is on its feet — some of them on somebody else\'s feet. The applause shakes dust out of the rafters.]'
              : '[The finale: "Shine On, Ashen Moon." You mostly remember the words. The audience claps politely — a dry, papery patter, and one enthusiastic pack ox.]',
          responses: [{ text: "[Take a bow.]", action: () => opryFinish() }],
        },
      },
    });

    // ---- Nicky and the wig (the shared townsfolk tree gets a line for him) ----
    const folk = L.DIALOGUES.get("dlg_neon_folk");
    if (
      folk &&
      folk.nodes &&
      folk.nodes.hello &&
      !folk.nodes.hello.responses.some((r) => r._wig)
    ) {
      folk.nodes.hello.responses.splice(0, 0, {
        _wig: true,
        text: "Velvet's wig. I know you took it, Nicky.",
        cond: (a) =>
          !!a &&
          a.id === "neon_nicky" &&
          Q.stage("sq_neon_opry") === "wig" &&
          !L.has("q_neon_wig") &&
          !L.flag("opry_wig_back"),
        next: "wig",
      });
      folk.nodes.wig = {
        text: "Me?! Take the WIG? [His two thumbs twitch.] …Okay, it was funny, okay? She sings flat and she's got a wig like a rotorcraft landing pad. What's it worth to you?",
        responses: [
          {
            text: "If Velvet doesn't sing, there's no show for you to heckle.",
            check: { skill: "persuasion", value: 40 },
            next: "wig_ok",
            failNext: "wig_pay",
          },
          {
            text: "[Pin him to the wall.] Give me the wig or you'll be heckling through a straw.",
            check: { attr: "brawn", value: 6 },
            standing: -15,
            next: "wig_scared",
            failNext: "wig_pay",
          },
          {
            text: "Thirty scrip. Final offer.",
            cond: () => L.scrip() >= 30,
            action: () => {
              if (L.pay(30)) {
                L.give("q_neon_wig", 1);
              }
            },
            next: "wig_sold",
          },
          { text: "Never mind." },
        ],
      };
      folk.nodes.wig_ok = {
        text: "…Huh. No show, no heckling. No heckling, no Nicky. You're right, you're RIGHT. [He pulls the enormous wig out of his coat.] Here. Tell her it was a critic.",
        onEnter() {
          L.give("q_neon_wig", 1);
        },
        responses: [{ text: "Thanks, Nicky." }],
      };
      folk.nodes.wig_scared = {
        text: "[His feet leave the ground. Both thumbs go up — the universal sign of surrender.] OKAY! Okay! Jeez! [The wig is shoved into your chest.] It's a JOKE, pal. It's COMEDY. Nobody in this town can take a joke anymore…",
        onEnter() {
          L.give("q_neon_wig", 1);
          L.setFlag("nicky_roughed");
        },
        responses: [{ text: "[Let him down.]" }],
      };
      folk.nodes.wig_pay = {
        text: "Nice speech. Thirty scrip.",
        responses: [
          {
            text: "Fine. (30 scrip)",
            cond: () => L.scrip() >= 30,
            action: () => {
              if (L.pay(30)) L.give("q_neon_wig", 1);
            },
            next: "wig_sold",
          },
          { text: "Forget it." },
        ],
      };
      folk.nodes.wig_sold = {
        text: "Pleasure doing business. [The wig emerges from his coat like a startled animal.]",
        responses: [{ text: "[Leave.]" }],
      };
    }

    // ---- Big Sal and the Cinder Club (replaces 45's tree; same opening lines) ----
    // ---- The Subway Speakeasy (Whisper only spawns once the interior stream builds speakeasy_bar; nothing points here before) ----
    L.dialogue(
      "dlg_neon_whisper",
      N().sleepy({
        start: () =>
          N().place("speakeasy")
            ? L.flag("met_whisper")
              ? "hello"
              : "first"
            : "closed",
        nodes: {
          closed: {
            text: '[A chained gate across the stairs. Somebody has painted "NO" on it. Twice.]',
            responses: [{ text: "[Leave.]" }],
          },
          first: {
            text: "[A thin, grey-haired man polishing a glass that will never be clean. He speaks without moving his lips.] You found the stairs. Most folks walk right past. That's the idea. I'm Whisper. What you drink down here, you didn't drink. What you hear, you didn't hear.",
            onEnter() {
              L.setFlag("met_whisper");
            },
            responses: [
              { text: "What do you pour?", barter: true },
              {
                text: "Why hide a bar under a town that loves bars?",
                next: "why",
              },
              { text: "I was never here." },
            ],
          },
          hello: {
            text: () =>
              pick([
                "…",
                "Usual? You don't have a usual. Sit.",
                "Keep your voice down. The trains are sleeping.",
              ]),
            responses: [
              { text: "Pour me something.", barter: true },
              { text: "Hear anything?", next: "hear" },
              {
                text: "Why hide a bar under a town that loves bars?",
                next: "why",
              },
              { text: "Goodbye." },
            ],
          },
          why: {
            text: "Upstairs, the Mayor taxes the drink, the Captain counts the drunks, and Sal decides who's pretty enough. Down here nobody counts anybody. Crowe knows. Crowe drinks here Thursdays. Crowe doesn't know that I know.",
            responses: [{ text: "Your secret's safe.", next: "hello" }],
          },
          hear: {
            text: () =>
              pick([
                "Terminal Boys have been walking the Port Authority ramps at night. Counting our guards. Somebody should count them back.",
                "There's a service door behind the Rad Room's jukebox. Goes nowhere. Or somewhere. I stopped asking around '75.",
                "Lucky Lou marks his cards with his thumbnail. Only the aces. Only when he's losing.",
                "Doc Broadway gives away medicine to anybody who can't pay. Then he tells everyone he doesn't. Let him.",
              ]),
            responses: [{ text: "Thanks.", next: "hello" }],
          },
        },
      }),
    );
    L.dialogue("dlg_neon_sal", {
      start: () => (clubOk() ? "member" : "hello"),
      nodes: {
        hello: {
          text: () =>
            pick([
              "Cinder Club. Members only. Members burned their census cards in '67. You don't look like you ever burned anything. You see the problem.",
              "You got a face like a catalogue model. That's the problem, pal. Club's for folks with faces like ME.",
              "No Maniacs, no raiders, no topsiders. You're one of those. Probably the freshest one.",
            ]),
          onEnter() {
            if (!Q.isStarted("sq_neon_club")) Q.start("sq_neon_club");
          },
          responses: [
            {
              text: "Sal. A club with no guests is just a room full of the same old faces. Let me in and give them something to talk about.",
              check: { skill: "persuasion", value: 50 },
              next: "in",
              failNext: "no",
            },
            { text: "Want to hear a joke?", next: "joke" },
            {
              text: "How about now? [Wearing survivor layers]",
              cond: () => L.equipped("survivor_layers"),
              next: "outfit",
            },
            {
              text: "Would a hundred and fifty scrip make me a member?",
              cond: () => L.scrip() >= 150,
              next: "bribe",
            },
            { text: "Seen anything strange lately?", next: "strange" },
            { text: "Never mind." },
          ],
        },
        no: {
          text: "Heh. Nice try. You talk pretty for a topsider. Still no.",
          responses: [{ text: "Fine." }],
        },
        joke: {
          text: "A joke. [He folds his arms, which takes a while.] Alright. Make me laugh. You get one shot.",
          responses: [
            {
              text: "\"Knock knock. Who's there? The Continuity. The Continuity who? The Continuity, open up, it's the census.\"",
              next: "joke_bad",
            },
            {
              text: '"A topsider walks into a bar. Bartender says: why the long face? He says: I just found out I\'ve been counted."',
              next: "in",
            },
            {
              text: '"What do you call a Times Square bouncer in a tuxedo? Overdressed."',
              next: "joke_bad",
            },
          ],
        },
        joke_bad: {
          text: "[Silence. A pigeon lands on his shoulder and thinks better of it.] I heard that one in '68. It wasn't funny then, either.",
          responses: [{ text: "Tough crowd." }],
        },
        outfit: {
          text: "[Sal looks you up and down. Then down and up.] You look like a Neon fella who lost a bet with a better-looking Neon fella. …Ha! Alright. ALRIGHT. Go on in, you ugly son of a gun.",
          responses: [
            { text: "Thanks, Sal.", action: () => clubAdmit("outfit") },
          ],
        },
        bribe: {
          text: "A hundred and fifty scrip? [He counts them twice.] …Congratulations. You're a member. Honorary. Don't let it go to your head. Your head's ugly enough.",
          responses: [
            {
              text: "Thanks, Sal.",
              action: () => {
                if (L.pay(150)) clubAdmit("bribe");
              },
            },
          ],
        },
        in: {
          text: "[Sal laughs — a deep, rattling, glorious sound — and unhooks the velvet rope.] Aw, hell. Alright, topsider. You're in. Honorary card-burner. Here — your card. Lose it and I eat you.",
          onEnter() {
            clubAdmit("talk");
          },
          responses: [{ text: "Thanks, Sal." }],
        },
        member: {
          text: () =>
            clubInterior()
              ? pick([
                  "Evening, card-burner. Smiley's on at ten. Laugh or he cries.",
                  "Go on in. Wipe your feet. Actually, muss your hair, you look too rested.",
                  "Member. Welcome back.",
                ])
              : pick([
                  "Evening, card-burner. Club's shut while the roof's being patched — members drink on the house tab at the Rad Room till we reopen.",
                  "Member. Card still works at every stall in the square. Club's closed for repairs. Don't ask, it involves a Ripjaw and a skylight.",
                ]),
          responses: [
            { text: "Seen anything strange lately?", next: "strange" },
            { text: "Thanks, Sal." },
          ],
        },
        strange: {
          text: "Men in pressed uniforms asking who was born before '67. Sky-Eye drones floating over the square at night, playing marching music. And a big grey-violet Brute in a traffic-light crown hanging off the Empire State, yelling about being king. So — normal Tuesday.",
          responses: [{ text: "Right." }],
        },
      },
    });
    L.dialogue("dlg_neon_smiley", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            pick([
              "A TOPSIDER! In MY club! Folks, look, it's like a peeled potato that learned to walk! Give it up for the potato!",
              "Good evening, good evening! I'd say break a leg, but in here we're just happy to still have 'em!",
              "You know the difference between a local and a topsider? About twenty-two years and one very bad Sunday morning!",
            ]),
          onEnter() {
            if (Q.stage("sq_neon_club") === "meet") {
              L.later(1, () => Q.complete("sq_neon_club"));
            }
          },
          responses: [
            { text: "[Laugh.]", next: "laugh" },
            { text: "[Heckle him.]", next: "heckle" },
            { text: "[Leave.]" },
          ],
        },
        laugh: {
          text: "SEE? The potato gets it! Folks, I love this potato. Drinks on the potato!",
          responses: [
            { text: "Wait — what?", next: "hello" },
            { text: "[Leave.]" },
          ],
        },
        heckle: {
          text: "Oh-ho! It HECKLES! Buddy, I was heckled by a whole continent. You're gonna have to do better than that. Nicky! Nicky, show him how it's done!",
          responses: [{ text: "[Leave with dignity.]" }],
        },
      },
    });

    // ---- Eustace Byrd (wagonmaster of the Depot) ----
    L.dialogue("dlg_neon_wagon", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            EXP.run && !EXP.done
              ? "What are you doing here? Your wagon's rolling — go!"
              : pick([
                  "Eustace Byrd, wagonmaster of the Neon Depot. Looking for work or looking for trouble? We pay for one of those.",
                  "Oxen don't load themselves, friend. What do you need?",
                ]),
          responses: [
            {
              text: "You need an escort?",
              cond: () => !EXP.run && !!nextRun(),
              next: "job",
            },
            { text: "When do the wagons come in?", next: "sched" },
            { text: "Tell me about the Depot.", next: "depot" },
            { text: "Goodbye." },
          ],
        },
        job: {
          text: () => {
            const r = nextRun();
            return (
              "The Neon Express — " +
              r.cargo +
              ", bound for " +
              r.name +
              ". " +
              r.driver +
              " drives. You walk alongside and keep the raiders off. " +
              r.pay +
              " scrip on arrival. The Terminal Boys hit about every other run, so bring a real gun."
            );
          },
          responses: [
            {
              text: "I'll take it. Let's roll.",
              action: () => {
                const r = nextRun();
                if (r) {
                  if (Q.isFailed(r.q)) L.STATE.delete(r.q);
                  /* a lost wagon can be re-run (a fresh driver id each time) */ Q.start(
                    r.q,
                  );
                  if (!startExpress(r)) Q.fail(r.q);
                }
              },
            },
            { text: "Not right now.", next: "hello" },
          ],
        },
        sched: {
          text: "Freight wagons roll in from the south gate every morning around eight, trade at the Depot through the afternoon, and head out at four. Mad Eddie Moss stops by on his loop, too. You want oxen, we got oxen. You want oxen that don't kick — that's extra.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        depot: {
          text: "Used to be the bus terminal's overflow lot. Now it's the only place south of the Park where a wagon train can sleep with both eyes shut. The Captain keeps the walls, I keep the wagons. Neon eats because of us, and don't let Crowe tell you different.",
          responses: [{ text: "Got it.", next: "hello" }],
        },
      },
    });
  });

