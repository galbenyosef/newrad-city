// play-inline-183 04 — end
// Lines 675-875 of readable/play-inline-183.pretty.js (statement-aligned).
  K.dialogueDef("pmid_dlg_mickey", {
    start: () =>
      K.q.done("pmid_q_pit")
        ? "champ"
        : K.q.started("pmid_q_pit")
          ? "back"
          : "intro",
    nodes: {
      intro: {
        speaker: "Mickey Brannigan",
        text: "Well, lookit you! cryo suit, all your teeth, nothin' broken yet. Name's Mickey Brannigan — \"Two-Count\", on account of that's how long my opponents lasted. Welcome to The Pit, the last honest sport in Manhattan.",
        responses: [
          R("What is this place?", "place"),
          R("Honest sport? You run fist fights in a ruin.", "honest"),
          R("I want to fight.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("Just looking around.", null, { end: true }),
        ],
      },
      place: {
        speaker: "Mickey Brannigan",
        text: "Madison Square Garden, pal! Eighteen thousand seats, the fights every Friday. Now it's forty settlers, an old longshoreman with a bad heart and whoever wanders in. Carla feeds 'em, Ike stitches 'em, Ondine takes their money, and I give 'em a show. That's civilization.",
        responses: [
          R("And the fights?", "rules"),
          R("I want to fight.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("See you around.", null, { end: true }),
        ],
      },
      honest: {
        speaker: "Mickey Brannigan",
        text: "Honest as they come. No guns in the ring, no pills before the bell, no fixing — Ondine would skin me. You bleed, you win, you get paid. Try findin' THAT deal at the Exchange.",
        responses: [
          R("What are the rules?", "rules"),
          R("Sign me up.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("Maybe later.", null, { end: true }),
        ],
      },
      rules: {
        speaker: "Mickey Brannigan",
        text: "Three bouts. Scrapper Sully first — tough kid, glass jaw. Then the Burrow Rat Melee, which is exactly what it sounds like. Win both and you get a shot at Brick Bruno, fifty-seven and oh. Fists, knuckles, bats — fine. Pull a gun and you're disqualified and I let the crowd decide what happens next.",
        responses: [
          R("Deal. I'm in.", "sign", {
            action: () => {
              K.q.start("pmid_q_pit");
              K.q.set("pmid_q_pit", "r1");
            },
          }),
          R("I'll think about it.", null, { end: true }),
        ],
      },
      sign: {
        speaker: "Mickey Brannigan",
        text: "Atta kid! Go see Ondine at the betting window up on the concourse if you wanna put scrip on yourself — bet BEFORE the bell. When you're ready, tell me and step through the ropes.",
        responses: [
          R("I'm ready. Ring the bell.", null, {
            action: () => A.pitStart(0),
            end: true,
          }),
          R("Give me a minute.", null, { end: true }),
        ],
      },
      back: {
        speaker: "Mickey Brannigan",
        text: () =>
          [
            "Back for your first bout? Sully's warming up. Well, he's standing up.",
            "The rats are hungry, kid. Hungrier than you, I hope.",
            "This is it. Brick. The main event. The whole Garden's here — all forty of 'em.",
          ][Math.min(2, wins())],
        responses: [
          R("Ring the bell. I'm ready.", null, {
            cond: () => wins() < 3,
            action: () => A.pitStart(Math.min(2, wins())),
            end: true,
          }),
          R("Any advice?", "advice"),
          R("Not yet.", null, { end: true }),
        ],
      },
      advice: {
        speaker: "Mickey Brannigan",
        text: () =>
          [
            "Sully drops his left. Everybody knows it. Sully doesn't.",
            "Rats go for the ankles. Keep movin' and swing low.",
            "Brick don't feel pain the way you and me do. But he feels embarrassment. Make it last and he'll quit before he'll fall.",
          ][Math.min(2, wins())],
        responses: [
          R("Thanks. Ring the bell.", null, {
            cond: () => wins() < 3,
            action: () => A.pitStart(Math.min(2, wins())),
            end: true,
          }),
          R("Later.", null, { end: true }),
        ],
      },
      champ: {
        speaker: "Mickey Brannigan",
        text: "The champ! Hey, everybody, the CHAMP is here! You want a rematch with anybody, you come see Mickey. The belt looks good on you. Brick says it pinched anyway.",
        responses: [
          R("How's Brick taking it?", "brick"),
          R("See you, Mickey.", null, { end: true }),
        ],
      },
      brick: {
        speaker: "Mickey Brannigan",
        text: "Honestly? Best day he's had in twenty-two years. Guy's been undefeated since before the bombs. You know how lonely that is?",
        responses: [R("I can imagine.", null, { end: true })],
      },
    },
  });
  const betResp = (amt) =>
    R("Put " + amt + " scrip on me for my next bout.", "bet_ok", {
      cond: () =>
        K.inv.scrip() >= amt &&
        K.q.active("pmid_q_pit") &&
        wins() < 3 &&
        !(S.pitBetRound === wins() && S.pitBet > 0),
      action: () => {
        K.inv.addScrip(-amt);
        S.pitBet = amt;
        S.pitBetRound = wins();
      },
      id: "bet" + amt,
    });
  K.dialogueDef("pmid_dlg_ondine", {
    start: "hi",
    nodes: {
      hi: {
        speaker: "Ondine Fairweather",
        text: () =>
          S.pitBetRound === wins() && S.pitBet > 0
            ? "You've got " +
              S.pitBet +
              " scrip riding on yourself, sugar. Don't make me look bad."
            : "Window's open. What'll it be — a wager, or are you just here to look at my ledger with those big sad sleeper eyes?",
        responses: [
          betResp(25),
          betResp(50),
          betResp(100),
          R("What are the odds?", "odds"),
          R("Let me see what you're selling.", null, { barter: true }),
          R("Nothing right now.", null, { end: true }),
        ],
      },
      bet_ok: {
        speaker: "Ondine Fairweather",
        text: () =>
          "Done. " +
          S.pitBet +
          " scrip at " +
          [3, 4, 9][Math.min(2, wins())] +
          " to 1. Win, and I pay you out the moment the bell rings. Lose, and you learn something about yourself.",
        responses: [R("Pleasure doing business.", null, { end: true })],
      },
      odds: {
        speaker: "Ondine Fairweather",
        text: "Sully, three to one. The rats, four to one. Brick... nine to one, and I've never paid it out. House takes ten percent of everything, including your dignity.",
        responses: [
          R("Back to business.", "hi"),
          R("Goodbye.", null, { end: true }),
        ],
      },
    },
  });
  K.dialogueDef("pmid_dlg_carla", {
    start: "hi",
    nodes: {
      hi: {
        speaker: "Concessions Carla",
        text: "Squirrel on a stick, eight scrip. Fizzo, twenty. Golden Plain Jerky, sealed before the bombs, still tough enough for any trail. Buying?",
        responses: [
          R("Let's see the menu.", null, { barter: true }),
          R("How long have you been here?", "long"),
          R("Not hungry.", null, { end: true }),
        ],
      },
      long: {
        speaker: "Concessions Carla",
        text: "My granny sold peanuts in this building when it still had a roof. The peanuts ran out in 1969. The customers didn't. I adapted.",
        responses: [
          R("Show me what you've got.", null, { barter: true }),
          R("Bye, Carla.", null, { end: true }),
        ],
      },
    },
  });
