// play-inline-438 04 — responses
// Lines 458-859 of readable/play-inline-438.pretty.js (statement-aligned).
  function dialogues() {
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const D = G.dialogue;

    // ---------------------------------------------------------------- Roz Tavish
    const payout = () => (PK.flag("roz_haggled") ? 200 : 150);
    const finishFeeders = () => {
      K.scrip(payout());
      K.give("ppk_rack_of_ox", 2);
      PK.setFlag("roz_discount", true);
      const a = actor("ppk_roz");
      if (a && a.merchant) a.merchant.priceMult = 0.9;
      if (!q.started(QF)) q.start(QF);
      q.complete(QF);
    };
    const finishKill = (pelt) => {
      K.scrip(payout() + (pelt ? 120 : 0));
      if (pelt) {
        K.take("ppk_gus_pelt", 1);
        PK.setFlag("pelt_given", true);
      }
      PK.setFlag("roz_discount", true);
      const a = actor("ppk_roz");
      if (a && a.merchant) a.merchant.priceMult = 0.9;
      if (!q.started(QF)) q.start(QF);
      q.complete(QF);
    };
    D.register("ppk_dlg_roz", {
      start: () =>
        q.done(QF)
          ? "after"
          : PK.flag("gates_open")
            ? "betrayed"
            : (q.active(QF) && q.stage(QF) === "return") ||
                (PK.park.resolved() && !q.done(QF))
              ? "report"
              : q.active(QF)
                ? "progress"
                : PK.flag("met_roz")
                  ? "again"
                  : "hello",
      nodes: {
        hello: {
          speaker: "Roz Tavish",
          onEnter: () => PK.setFlag("met_roz", true),
          text: "Welcome to the Tavern. Food's hot, beds are clean-ish, and the lights stay on. Roz Tavish — I run the place, and the trading. What'll it be?",
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "You look like someone with a problem.",
              next: "trouble",
              cond: () => !q.started(QF),
            },
            { text: "Tell me about the Tavern.", next: "about" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Roz Tavish",
          text: "Back again. Buying or selling?",
          responses: [
            { text: "Let's trade.", barter: true },
            {
              text: "About your pack oxen problem...",
              next: "trouble",
              cond: () => !q.started(QF),
            },
            { text: "Tell me about the Tavern.", next: "about" },
            { text: "Goodbye.", end: true },
          ],
        },
        trouble: {
          speaker: "Roz Tavish",
          text: "Something's been coming over the East Drive at night and hitting the pack oxen pen. Three head in two weeks. burrow rats I could live with — but last Tuesday it was a bear. A WHITE bear, big as a car. Buck swears it came out of the zoo.\n\nNothing comes out of the zoo. Folks go in, sure. Nothing comes out.",
          responses: [
            {
              text: "I'll look into it.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
            { text: "What's in it for me?", next: "offer" },
            { text: "Not my problem.", end: true },
          ],
        },
        offer: {
          speaker: "Roz Tavish",
          text: "A hundred and fifty scrip, and a table in the Crystal Room whenever you want one.",
          responses: [
            {
              text: "Make it two hundred. Bears are expensive.",
              check: { skill: "trade", value: 40 },
              next: "haggle_ok",
              failNext: "haggle_no",
            },
            {
              text: "Deal.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        haggle_ok: {
          speaker: "Roz Tavish",
          text: "...Two hundred. And you're paying for your own wine.",
          onEnter: () => PK.setFlag("roz_haggled", true),
          responses: [
            {
              text: "Deal.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
          ],
        },
        haggle_no: {
          speaker: "Roz Tavish",
          text: "One-fifty and a table, or one-fifty and no table. Your pick.",
          responses: [
            {
              text: "Fine. One-fifty.",
              next: "yes",
              action: () => {
                q.start(QF);
              },
            },
            { text: "Forget it.", end: true },
          ],
        },
        yes: {
          speaker: "Roz Tavish",
          text: "The zoo's across the park, down by Fifth Avenue — the red castle is the Arsenal. The Army moved in right before the bombs. Whatever they were doing in there, I'd bet my generator it's why a polar bear is eating my pack oxen twenty-two years later.\n\nBring me an answer. Or a bear.",
          responses: [{ text: "On my way.", end: true }],
        },
        progress: {
          speaker: "Roz Tavish",
          text: () =>
            q.stage(QF) === "deal"
              ? "An ARK? Under the zoo? ...Of course there is. Can you shut it down, or feed it, or shoot it? I don't much care which."
              : "Any luck at the zoo? The Arsenal's the red castle on the Fifth Avenue side.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Still working on it.", end: true },
          ],
        },
        report: {
          speaker: "Roz Tavish",
          text: () =>
            PK.park.gusDead()
              ? "Buck says the night was quiet. And you've got that look. What happened out there?"
              : "Nothing at the pen last night. Nothing the night before. What did you DO?",
          responses: [
            {
              text: "The Army built an Ark under the zoo. The feeders shut down. I turned them back on.",
              cond: () => PK.park.feedersOn(),
              next: "fed",
            },
            {
              text: "It was the zoo's old polar bear, Gus. He's dead. [Give Gus's pelt]",
              cond: () => PK.park.gusDead() && K.has("ppk_gus_pelt"),
              next: "pelt",
              action: () => finishKill(true),
            },
            {
              text: "It was the zoo's old polar bear, Gus. He won't bother you again.",
              cond: () => PK.park.gusDead() && !PK.park.feedersOn(),
              next: "killed",
              action: () => finishKill(false),
            },
          ],
        },
        fed: {
          speaker: "Roz Tavish",
          text: "Twenty-two years and the Army's machine is still putting out dinner? ...Well. If that bear's eating down there, he isn't eating up here. That's smart. And kinder than I would've been.\n\nHere — your scrip, two racks from Anton, and Tavish Trading gives you the friends-and-family price from now on.",
          responses: [
            {
              text: "Pleasure doing business.",
              end: true,
              action: () => finishFeeders(),
            },
          ],
        },
        pelt: {
          speaker: "Roz Tavish",
          text: "Gus. It had a NAME. ...Lord, look at the size of it. That goes over the fireplace in the Chestnut Room, and every wagon master who drinks under it hears how you did it. Scrip — with a bonus for the rug — and you drink at family prices from now on.",
          responses: [{ text: "He had it rough, Roz.", end: true }],
        },
        killed: {
          speaker: "Roz Tavish",
          text: "Then that's that. I'd have liked to see it — no, I wouldn't. Here's your scrip. You drink at family prices from now on.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        betrayed: {
          speaker: "Roz Tavish",
          text: "Buck saw lights in the Arsenal before the animals came through the fence. burrow rats, scorpions, that bear — ALL of them, all at once. People got hurt.\n\nI don't know what you did down there, and I don't want to. Buy what you need and go.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Goodbye.", end: true },
          ],
        },
        after: {
          speaker: "Roz Tavish",
          text: () =>
            PK.flag("pelt_given")
              ? "Table's always open for you. Wagon masters keep asking about the bear rug. I tell them it was a big white rabbit."
              : "Table's always open for you. The pen's been quiet ever since.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Tell me about the Tavern.", next: "about" },
            { text: "Goodbye.", end: true },
          ],
        },
        about: {
          speaker: "Roz Tavish",
          text: "Built in 1870 for the sheep off the Sheep Meadow. A restaurant from 1934 until the bombs. My grandmother found it with the chandeliers still hanging and the wine still in the cellar, and she said: the lights go back on. So they did.\n\nCaravans stop here between the Neon and the Upper West Side. We feed them, water their pack oxen, and nobody pulls a gun inside. That's the whole trick.",
          responses: [
            { text: "Who else is here?", next: "who" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Roz Tavish",
          text: "Maurice at the door — he came with the building. Anton in the kitchen — so did he, technically; he was the sous-chef on March 5th. Lillian sings. Buck and Dee keep the gate. Don't tip Maurice, it confuses him.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Maurice (maître d')
    D.register("ppk_dlg_maurice", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Maurice",
          text: "Good evening, and welcome to Tavern on the Green! Do you have a reservation?",
          responses: [
            { text: () => 'Yes. Under "' + pname() + '".', next: "res" },
            { text: "No.", next: "walkin" },
            { text: "What is this place?", next: "history" },
            {
              text: "The Hendersons aren't coming, Maurice.",
              check: { skill: "persuasion", value: 40 },
              next: "hendersons",
              failNext: "hendersons_no",
              cond: () => PK.flag("read_res") || PK.flag("met_maurice"),
            },
            { text: "Goodbye.", end: true },
          ],
          onEnter: () => PK.setFlag("met_maurice", true),
        },
        res: {
          speaker: "Maurice",
          text: () =>
            'Ah — "' +
            pname() +
            "\"... I am terribly sorry. The last reservation in the book is for the Hendersons, party of four, eight o'clock, March the fifth, 1967. They are running a little late.\n\nBut we have had a table free for twenty-two years! Right this way.",
          onEnter: () => PK.setFlag("read_res", true),
          responses: [
            { text: "Thanks, Maurice.", end: true },
            { text: "What's good tonight?", next: "walkin" },
          ],
        },
        walkin: {
          speaker: "Maurice",
          text: "Walk-ins are always welcome! The chef recommends the pack oxen. The chef recommends the pack oxen every evening; it is the only item on the menu that did not attempt to eat him first. Madame Tavish trades at the bar in the Chestnut Room.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        history: {
          speaker: "Maurice",
          text: "Tavern on the Green! Built 1870 to house the sheep of the Sheep Meadow. A restaurant since 1934. The finest dining in Manhattan until March the fifth, 1967, and — in my professional opinion — still the finest dining in Manhattan, the competition being largely iguana on a stick.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        hendersons: {
          speaker: "Maurice",
          text: "...[His eye stalks droop.] I suspected. I shall hold their table another hour. As I have every hour since. Thank you for your candour. You are welcome here always.",
          onEnter: () => {
            if (!PK.flag("told_maurice")) {
              PK.setFlag("told_maurice", true);
              K.xp(25, "Told Maurice the truth");
            }
          },
          responses: [{ text: "Goodbye, Maurice.", end: true }],
        },
        hendersons_no: {
          speaker: "Maurice",
          text: "Nonsense! Traffic on the Henry Hudson is simply dreadful at this hour. Can I show you to the bar in the meantime?",
          responses: [{ text: "Sure.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Chef Anton Moreau
    D.register("ppk_dlg_anton", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Anton Moreau",
          text: "Out of my kitchen — unless you're buying. Anton Moreau. Sous-chef, class of 1967. Promoted to chef by attrition.",
          responses: [
            { text: "What's cooking?", barter: true },
            { text: "You were here on March 5th?", next: "day" },
            {
              text: "Your pack oxen is overcooked.",
              check: { skill: "survival", value: 35 },
              next: "critic",
              failNext: "critic_no",
              cond: () => !PK.flag("anton_critic"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        day: {
          speaker: "Anton Moreau",
          text: "Prep for the Civil Defense party. Nine hundred crab cakes. The windows went white, then the walk-in freezer saved my life, then the grease fire on the line took the side of my face. The crab cakes did not make it. Nobody remembers the crab cakes.",
          responses: [{ text: "I'm sorry about the crab cakes.", end: true }],
        },
        critic: {
          speaker: "Anton Moreau",
          text: "...Nobody has said that to me in twenty-two years. Everybody's just grateful it's not raw. [He pulls a plate off the pass.] Sit. You're getting the good one.",
          onEnter: () => {
            PK.setFlag("anton_critic", true);
            K.give("ppk_rack_of_ox", 1);
            K.xp(15, "A discerning palate");
          },
          responses: [{ text: "Merci, chef.", end: true }],
        },
        critic_no: {
          speaker: "Anton Moreau",
          text: "It's pack oxen. It's supposed to be like that. Get out of my kitchen.",
          responses: [{ text: "Fine.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Lillian (singer)
    D.register("ppk_dlg_lillian", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Lillian",
          text: "Hi, sugar. Requests? I know every song written before 1967 and none written after. Nobody's written any since.",
          responses: [
            { text: "Sing something.", next: "sing" },
            { text: "How'd you end up here?", next: "story" },
            { text: "Goodbye.", end: true },
          ],
        },
        sing: {
          speaker: "Lillian",
          text: "[She hums a few slow bars of something about the lights going out along Broadway, one by one, and a girl who kept hers burning in the window. The Crystal Room goes quiet. Somebody at the back is crying into a Fizzo Cola.]\n\n...That one's mine. Don't tell anybody.",
          onEnter: () => {
            if (!PK.flag("heard_lillian")) {
              PK.setFlag("heard_lillian", true);
              K.xp(10, "Heard Lillian sing");
            }
          },
          responses: [{ text: "That was beautiful.", end: true }],
        },
        story: {
          speaker: "Lillian",
          text: "Sang for a trade wagon out of the Neon for six years. We stopped here one night and the lights were on and the chandeliers were going and somebody had a real piano. I told the wagon boss to go on without me. That was nine years ago.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });

    // ---------------------------------------------------------------- Buck (gate guard)
    D.register("ppk_dlg_buck", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Buck",
          text: () =>
            PK.park.resolved()
              ? "Quiet nights since you went to the zoo. I owe you a drink."
              : "Weapons holstered inside. Roz's rules. And if you see a white bear on your way in — you didn't, trust me — run.",
          responses: [
            {
              text: "A white bear?",
              next: "bear",
              cond: () => !PK.park.resolved(),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        bear: {
          speaker: "Buck",
          text: "Came over the East Drive last Tuesday. White fur, pink patches like it got boiled, eyes like a stoplight. It took a pack oxen in one bite and walked back toward the zoo like it had a bus to catch. Talk to Roz if you're crazy enough to go after it.",
          responses: [{ text: "Thanks.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // World hooks: the Delacorte Clock, the feeder food pile
  // ==================================================================
