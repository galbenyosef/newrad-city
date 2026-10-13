// play-inline-556 09 — actor
// Lines 2618-2963 of readable/play-inline-556.pretty.js (statement-aligned).
  function guardDialogue() {
    const nodes = {
      hello: {
        text: () =>
          L.flag("neon_guard_member")
            ? pick([
                "Evening, brother. Anything to report?",
                "Hey, you're one of us now. Try not to get shot.",
              ])
            : nightNow()
              ? pick(GUARD_NIGHT.greet)
              : pick(GUARD_DAY.greet),
        responses: PLACE_DIRS.map(([q], i) => ({
          text: q,
          next: "dir" + i,
        })).concat([
          { text: "What are the rules here?", next: "rules" },
          {
            text: "Who's in charge of the guard?",
            next: "capt",
            cond: () => !L.flag("met_kincaid"),
          },
          { text: "Carry on." },
        ]),
      },
      rules: {
        text: "Three rules. No shooting inside the gates. No stealing from the stalls. No Maniacs, no raiders, no Brutes — that one's ours to enforce, not yours. Break one and you'll meet the Captain. Break two and you'll meet the Doc.",
        responses: [{ text: "Understood.", next: "hello" }],
      },
      capt: {
        text: "Captain Mercy Kincaid. Up at the north gate most days. She's hiring, if you're any good. Or even if you're not — we lose a lot of people.",
        responses: [{ text: "Thanks.", next: "hello" }],
      },
    };
    PLACE_DIRS.forEach(([, a], i) => {
      nodes["dir" + i] = {
        text: a,
        responses: [
          { text: "Anything else I should know?", next: "hello" },
          { text: "Thanks." },
        ],
      };
    });
    L.dialogue("dlg_neon_guard", L.neonTown.sleepy({ start: "hello", nodes }));
  }
  const FOLK = {
    neon_gums: {
      hi: [
        "Heyyy, stranger. Buy an old man a drink? No? Buy a young man a drink? Also me.",
        "*hic* You're blurry. Or I'm blurry. One of us is blurry.",
      ],
      story:
        "Tended bar at the Astor before the bombs. Now I'm retired. From standing up, mostly.",
      rumor:
        "Heard Lou's deck got five aces. Heard it from Lou. He was bragging.",
    },
    neon_ruby: {
      hi: [
        "Ruby Fontaine, second from the left in the old Revue kick line. Now I'm second from the left in the bar line.",
        "Honey, you are GLOWING. Oh, no, that's the sign behind you.",
      ],
      story:
        "Velvet and I came up together. She got the solo, I got the radiation. Well — we both got the radiation. She got the solo.",
      rumor:
        "Lionel's lead man walked off mid-song last week. Walked off the stage, walked off the island. Opry needs a new face. Any face.",
    },
    neon_stan: {
      hi: [
        "Stan Hollis, Depot porter. If it's on an ox, I lifted it.",
        "Back hurts. Ox hurts. Everything hurts. Good day, though.",
      ],
      story:
        "Eustace hired me off the Grand Central run. Says I've got a strong back and a weak mind. Best compliment I ever got.",
      rumor:
        "Eustace is hiring guards for the pack-train runs. Good scrip. Not good odds.",
    },
    neon_pearl: {
      hi: [
        "Oh, a visitor! You're so… young. Do you moisturise?",
        "Grandma Pearl, dear. Everybody's grandma. Nobody's actually related to me. Anymore.",
      ],
      story:
        "I was ninety-one when the bombs fell. Wait — I was nine. Or nineteen. Something with a nine. I'm old, dear.",
      rumor:
        "The power keeps flickering at night. Sparks says it's not the grid this time. Somebody's pulling cable. Mark my words.",
    },
    neon_nicky: {
      hi: [
        "Nicky Two-Thumbs. Both on the same hand. Wanna see?",
        "You new? You look new. Everything about you is new. It's disgusting.",
      ],
      story:
        "I'm a professional heckler. I heckle at the Opry. They pay me not to. It's a living.",
      rumor:
        "Captain Kincaid posts bounties on the Mayor's board. Raiders, Maniacs, the works. Easy scrip if you're quick on the draw.",
    },
    neon_dusty: {
      hi: [
        "Oh thank god, another topsider. That's what they call us here. I don't love it. Makes me sound like a pie crust.",
        "Dusty Mae. Came in with a pack train and never left. Folks here are nicer than most people. Don't tell people.",
      ],
      story:
        "I'm trying to get into the Cinder Club. They don't let topsiders in. That's the point, apparently. That's WHY I want in.",
      rumor:
        'There\'s a ticker-tape oracle booth under the zipper sign. Tells your fortune for five scrip. Mine said "BEWARE THE OX." Then an ox stepped on me.',
    },
  };
  function folkDialogue() {
    const F = (actor) => FOLK[actor && actor.id] || FOLK.neon_gums;
    L.dialogue(
      "dlg_neon_folk",
      L.neonTown.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: (actor) => pick(F(actor).hi),
            responses: [
              { text: "Tell me about yourself.", next: "story" },
              { text: "Heard anything interesting?", next: "rumor" },
              {
                text: "[Give Gums a bottle of purified water.]",
                standing: 15,
                repeatStanding: true,
                cond: (actor) =>
                  !!actor &&
                  actor.id === "neon_gums" &&
                  L.has("purified_water") &&
                  L.flag("gums_water_day") !== G.time.day,
                action: () => {
                  L.take("purified_water", 1);
                  L.setFlag("gums_water_day", G.time.day);
                  L.incFlag("gums_water");
                },
                next: "water",
              },
              { text: "See you around." },
            ],
          },
          water: {
            text: () =>
              Number(L.flag("gums_water")) > 1
                ? "Again? You keep this up, kid, I'll have to start remembering your name. [He drinks it like a man who forgot water came without a label.]"
                : "Water? Real water? [He holds the bottle like it might bite.] Nobody's given me anything but a hard time since the Astor burned. …Tastes like nothing. Tastes like being alive. Thanks, kid.",
            responses: [{ text: "Take care of yourself, Gums." }],
          },
          story: {
            text: (actor) => F(actor).story,
            responses: [
              { text: "Heard anything interesting?", next: "rumor" },
              { text: "Take care." },
            ],
          },
          rumor: {
            text: (actor) => F(actor).rumor,
            onEnter(actor) {
              if (actor && FOLK[actor.id]) L.setFlag("neon_rumor_" + actor.id);
            },
            responses: [{ text: "Thanks." }],
          },
        },
      }),
    );
  }
  function hawkerDialogue() {
    const HD = {
      neon_newsie: [
        'Scoop Doolan, Neon Gazette! One scrip! Today\'s headline: "YOU." Well — "LOCAL TOPSIDER STUMBLES IN." Slow news day.',
        'Paper, mister? It\'s got a crossword. All the answers are "radiation."',
      ],
      neon_doomer: [
        "Brother Tick-Tock, prophet of the Second Ending! Repent! Or don't. Honestly it won't help.",
        "The ticker sign — the zipper — it spells out the future, friend! Yesterday it said SALE. What does THAT mean?!",
      ],
      neon_tout: [
        "Tickets Tessie! Tonight at eight, the Neon Revue! Velvet Maloney! Dancing! Mild singing!",
        "Two scrip a seat and I'll throw in a program. The program is a napkin.",
      ],
    };
    const who = (actor) => (actor && HD[actor.id] ? actor.id : "neon_newsie");
    L.dialogue(
      "dlg_neon_hawker",
      L.neonTown.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: (actor) => pick(HD[who(actor)]),
            responses: [
              {
                text: "Buy a paper. (1 scrip)",
                cond: (actor) => who(actor) === "neon_newsie",
                action: () => {
                  if (L.pay(1))
                    L.notify(
                      pick([
                        "NEON GAZETTE: \"MAYOR CROWE: 'I AM STILL THE MAYOR'\"",
                        'NEON GAZETTE: "BALL STILL STUCK — DAY 8,000-SOMETHING"',
                        "NEON GAZETTE: \"GUARDS REPEL MANIACS AT 42ND ST GATE; ONE GUARD 'MOSTLY FINE'\"",
                        'NEON GAZETTE: "OPRY STAR\'S WIG STOLEN; POLICE BAFFLED (THERE ARE NO POLICE)"',
                      ]),
                    );
                },
              },
              {
                text: "Buy a ticket for tonight's show. (2 scrip)",
                cond: (actor) =>
                  who(actor) === "neon_tout" && !L.has("q_neon_ticket"),
                action: () => {
                  if (L.pay(2)) {
                    L.give("q_neon_ticket", 1);
                  }
                },
              },
              {
                text: "What is the Second Ending?",
                cond: (actor) => who(actor) === "neon_doomer",
                next: "doom",
              },
              {
                text: "[Drop 5 scrip in Brother Tick-Tock's tin.]",
                standing: 10,
                repeatStanding: true,
                cond: (actor) =>
                  who(actor) === "neon_doomer" &&
                  L.scrip() >= 5 &&
                  L.flag("doomer_alms_day") !== G.time.day,
                action: () => {
                  if (L.pay(5)) L.setFlag("doomer_alms_day", G.time.day);
                },
                next: "alms",
              },
              { text: "Not today." },
            ],
          },
          alms: {
            text: "Bless you! Bless you, stranger! When the Second Ending comes I shall tell it you were one of the GOOD ones! …It probably won't listen. Nothing listens. But I'll TELL it.",
            responses: [{ text: "Much obliged." }],
          },
          doom: {
            text: "The FIRST ending was the bombs. The SECOND ending is when the lights of the Neon go out. When the power fails, friend, the dark comes back into the square — and so do THEY. Mark me! Mark me! …Nobody ever marks me.",
            responses: [{ text: "Marked." }],
          },
        },
      }),
    );
  }

  // ---- stall merchants (hello → trade / chat / goodbye) ----
  const MERCH_TALK = {
    neon_tillie: {
      who: "Two-Gun Tillie. Had three guns once — the third one's in a raider. Long story. Short raider.",
      tip: "Tip for free: aim for the legs on Maniacs. Slow 'em down, then say goodnight.",
    },
    neon_brass: {
      who: "Ran a sporting goods store on 44th before the bombs. Now I run the only honest ammo counter on the island. Counting is a lost art, friend.",
      tip: "Gyrojet rockets go bad in the damp. Keep 'em in your pack, not your pockets.",
    },
    neon_mags: {
      who: "Seamstress to the stars, once. Broadway costumes. Now I stitch armour for guards and prom dresses for Neon girls who never got to go to prom. Same thing, really.",
      tip: "Wear something with a collar to the Cinder Club. Sal respects a collar.",
    },
    neon_joe: {
      who: "Scrapper Joe. I had a real name once. I sold it. Got three scrip for it.",
      tip: "Sprocket at the Robo-Shop pays good for relay boards. Me, I pay better. Don't tell her.",
    },
    neon_noodle: {
      who: "I cook noodles. My father cooked noodles. His father cooked noodles. The noodles are the same noodles. Very old noodles.",
      tip: "Eat, then sleep at the Bunkhouse. Full belly, full rest. Old man's wisdom.",
    },
    neon_bev: {
      who: "Bev. I raise 'em, I name 'em, I grill 'em. It's called the circle of life, sweetie, and I'm at the grilling end of it.",
      tip: "Eustace's pack trains bring fresh oxen twice a week. The meat's better when the train's on time.",
    },
    neon_candy: {
      who: "Candy Rourke, pharmaceutical entrepreneur. Broadway calls me a pusher. I call myself a motivator.",
      tip: "Don't mix Rage and Bull tabs before a fight. Or do. I'm not your mother.",
    },
    neon_willie: {
      who: "Wet Willie. Used to be a plumber. Water was my life. Still is. Now it's just in bottles.",
      tip: "Boil anything that don't come from me. Then buy from me anyway.",
    },
  };
  function merchantDialogues() {
    for (const id in MERCH_TALK) {
      const m = MERCH_TALK[id];
      L.dialogue(
        "dlg_" + id,
        L.neonTown.sleepy({
          start: "hello",
          nodes: {
            hello: {
              text: () => {
                const r = BY_ID[id];
                return pick((r.barks && r.barks.greet) || ["What'll it be?"]);
              },
              responses: [
                { text: "Let's trade.", barter: true, end: true },
                { text: "Tell me about yourself.", next: "who" },
                { text: "Any advice?", next: "tip" },
                { text: "Goodbye." },
              ],
            },
            who: {
              text: m.who,
              responses: [
                { text: "Let's trade.", barter: true, end: true },
                { text: "Goodbye." },
              ],
            },
            tip: {
              text: m.tip,
              responses: [
                { text: "Thanks. Let's trade.", barter: true, end: true },
                { text: "Goodbye." },
              ],
            },
          },
        }),
      );
    }
  }

  L.hook("init", function () {
    L.defineItem({
      id: "q_neon_ticket",
      name: "Neon Revue Ticket",
      type: "misc",
      weight: 0,
      value: 2,
      quest: false,
      mesh: "paper",
      desc: 'ADMIT ONE — THE NEON REVUE, STARRING VELVET MALONEY. "No refunds. No re-entry. No heckling (Nicky)." Printed on the back of an old-world parking ticket.',
    });
  });
  L.hook("register", function () {
    guardDialogue();
    folkDialogue();
    hawkerDialogue();
    merchantDialogues();
  });
  L.hook("spawn", function () {
    try {
      spawnAll();
    } catch (e) {
      G.reportError("quests:neon spawnAll", e);
    }
  });
