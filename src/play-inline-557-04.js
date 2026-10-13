// play-inline-557 04 — actor
// Lines 639-1230 of readable/play-inline-557.pretty.js (statement-aligned).
  L.hook("register", function () {
    L.dialogue(
      "dlg_neon_stall2",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: (actor) => {
              const d = T.ROSTER.find((r) => actor && r.id === actor.id);
              return pick(
                (d && d.barks && d.barks.greet) || ["What'll it be?"],
              );
            },
            responses: [
              { text: "Let's trade.", barter: true, end: true },
              { text: "Tell me about yourself.", next: "who" },
              { text: "Any advice?", next: "tip" },
              {
                text: "Got any postcards?",
                cond: (actor) =>
                  !!actor &&
                  actor.id === "neon_sadie" &&
                  !L.has("q_neon_postcard"),
                next: "postcard",
              },
              { text: "Goodbye." },
            ],
          },
          who: {
            text: (actor) =>
              (STALL_TALK[actor && actor.id] || STALL_TALK.neon_smokes).who,
            responses: [
              { text: "Let's trade.", barter: true, end: true },
              { text: "Goodbye." },
            ],
          },
          tip: {
            text: (actor) =>
              (STALL_TALK[actor && actor.id] || STALL_TALK.neon_smokes).tip,
            responses: [
              { text: "Thanks. Let's trade.", barter: true, end: true },
              { text: "Goodbye." },
            ],
          },
          postcard: {
            text: "Postcards! One scrip. I'll even stamp it for you — well. I'll glue a soda label on it. Mail's been slow.",
            responses: [
              {
                text: "One postcard. (1 scrip)",
                cond: () => L.scrip() >= 1,
                action: () => {
                  if (L.pay(1)) L.give("q_neon_postcard", 1);
                },
              },
              { text: "Maybe later.", next: "hello" },
            ],
          },
        },
      }),
    );

    // ---- Blue Note Benny: requests ----
    const BUSK = { t: 0 };
    function playSet(actor, mood) {
      const a = actor || L.npc("neon_sax");
      if (!a) return;
      const lines =
        mood === "sad"
          ? [
              "♪ [A slow, low lament. Somebody across the square stops walking.] ♪",
              "♪ [The last note hangs in the air like smoke.] ♪",
            ]
          : mood === "fast"
            ? [
                "♪ Bap-ba-da-bap-ba-DAH! ♪ [Two of the regulars start dancing. One loses a shoe.]",
                "♪ [A frantic run up the scale, ending in a honk.] ♪",
              ]
            : [
                "♪ [An old standard, played like he means it.] ♪",
                "♪ Bwaaaah… da-da-dahhh… ♪",
              ];
      lines.forEach((l, i) =>
        L.later(1 + i * 4.2, () => {
          if (!a.dead && !a.talking) a.say(l, 4);
        }),
      );
      if (L.flag("neon_busk_day") !== G.time.day) {
        L.setFlag("neon_busk_day", G.time.day);
        if (!G.isStub("rpg") && G.rpg.addEffect)
          try {
            G.rpg.addEffect({
              id: "neon_swing",
              name: "Swing Time",
              kind: "buff",
              duration: 600,
              mods: { attrs: { presence: 1 } },
              desc: "Presence +1",
            });
          } catch (e) {
            /* ignore */
          }
      }
    }
    L.dialogue(
      "dlg_neon_busker",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Blue Note Benny. I played the Village Vanguard in '66. Now I play the Neon. The acoustics are worse and the crowd's deader.",
                "Tips in the case, friend. The case is hungry.",
              ]),
            responses: [
              {
                text: "Play something sad. (2 scrip)",
                cond: () => L.scrip() >= 2,
                action: (actor) => {
                  if (L.pay(2)) playSet(actor, "sad");
                },
              },
              {
                text: "Play something fast. (2 scrip)",
                cond: () => L.scrip() >= 2,
                action: (actor) => {
                  if (L.pay(2)) playSet(actor, "fast");
                },
              },
              { text: "What happened to your band?", next: "band" },
              {
                text: "[Drop 10 scrip in the case.]",
                standing: 5,
                repeatStanding: true,
                cond: () =>
                  L.scrip() >= 10 && L.flag("neon_busk_tip") !== G.time.day,
                action: () => {
                  if (L.pay(10)) L.setFlag("neon_busk_tip", G.time.day);
                },
                next: "tip",
              },
              { text: "Keep playing." },
            ],
          },
          band: {
            text: "Drummer's mind went in '71; he runs with the Maniacs now. Bass player went north looking for a cure. Piano player IS a piano now, far as I can tell — sat down at one in the Village and never got up. It's just me and the horn. The horn never leaves.",
            responses: [{ text: "I'm sorry.", next: "hello" }],
          },
          tip: {
            text: "Ten scrip! Friend, for ten scrip I'll play your funeral. For free. When it happens. Not saying it'll happen soon. It's the Neon, though.",
            responses: [{ text: "Thanks, Benny." }],
          },
        },
      }),
    );

    // ---- Bellhop Barnaby: the Neon's greeter ----
    L.dialogue(
      "dlg_neon_bellhop",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Welcome, welcome! Bellhop Barnaby, Bunkhouse Hotel, formerly the Astor! Luggage? No luggage? Travelling light! Smart!",
                "First time in the Neon? I can tell. You're still flinching.",
              ]),
            responses: [
              { text: "Give me the tour.", next: "tour" },
              { text: "Tell me about the Bunkhouse.", next: "bunk" },
              { text: "Where's the action tonight?", next: "tonight" },
              { text: "Thanks, Barnaby." },
            ],
          },
          tour: {
            text: "North end: Captain Kincaid's gate and the big screen. Middle: the Marquee Market — guns, ammo, clothes, noodles, trouble. East side: the Opry, the Rad Room, Doc Broadway's clinic behind the red cross. Crowe's office is the recruiting station on the island. Depot's out west past the ox smell. The Cinder Club's the velvet rope — don't. The subway stairs — also don't. Well. Maybe do. Don't tell anyone I said so.",
            onEnter() {
              L.setFlag("neon_toured");
            },
            responses: [
              { text: "The subway stairs?", next: "subway" },
              { text: "Got it.", next: "hello" },
            ],
          },
          subway: {
            text: "[He leans in.] Forty-Second Street stairs. Gate's locked. Knock twice, wait, knock once. Nobody'll answer. Knock again anyway. That's all I know. That's all ANYBODY knows. Officially.",
            responses: [{ text: "Officially.", next: "hello" }],
          },
          bunk: {
            text: () =>
              T.place("bunkhouse")
                ? "Dottie runs it. Twenty scrip a bed, and you wake up rested or your money back. Nobody's ever asked for their money back. Nobody's ever woken up rested either. It's a paradox."
                : "Dottie's still digging out the old Astor. Soon! Beds, sheets, doors that close! I'm practising my bows.",
            responses: [{ text: "Thanks.", next: "hello" }],
          },
          tonight: {
            text: () => {
              const h = G.time.hour;
              return (
                (h >= 19 && h < 23.5
                  ? "The Revue's on at the Opry right now! Velvet Maloney, live! Technically."
                  : "Revue's at eight at the Opry.") +
                " Lucky Lou's dealing at the Rad Room all night. And at midnight, everybody stands under the Ball" +
                (Q.isComplete("sq_neon_ball")
                  ? " — and it DROPS now! You should see Crowe cry."
                  : " and hopes. It never drops. We hope anyway. That's the Neon.")
              );
            },
            responses: [{ text: "Thanks.", next: "hello" }],
          },
        },
      }),
    );

    // ---- Polly Prentiss: Crowe's campaign ----
    L.dialogue(
      "dlg_neon_campaign",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Polly Prentiss, Crowe for Mayor committee! Can Crowe count on your vote?",
                "Vote Crowe! Crowe is the Neon! The Neon is Crowe! Please take a button, I have nine hundred.",
              ]),
            responses: [
              {
                text: "Sure. Crowe has my vote.",
                cond: () => !L.has("q_crowe_button"),
                next: "yes",
              },
              { text: "Who's running against him?", next: "against" },
              {
                text: "How long since the last election?",
                check: { skill: "persuasion", value: 35 },
                next: "truth",
                failNext: "dodge",
              },
              { text: "Not interested." },
            ],
          },
          yes: {
            text: "A VOTER! [She pins a button on you with shaking hands.] Wear it with pride! Wear it with dignity! Wear it above the heart, or where the heart used to be!",
            onEnter() {
              L.give("q_crowe_button", 1);
            },
            responses: [{ text: "Go Crowe." }],
          },
          against: {
            text: "Nobody! It's a landslide! Well. Nicky Two-Thumbs wrote himself in once. Got one vote. Crowe demanded a recount. Nicky got two votes the second time. We don't do recounts anymore.",
            responses: [{ text: "Democracy in action.", next: "hello" }],
          },
          truth: {
            text: "[She glances at the recruiting station, then lowers her voice.] Nineteen seventy-one. Crowe won by one vote. His. The other candidate died before the count. Nobody's had the heart to hold another one. The campaign is… it's tradition. It makes him happy. Don't tell him I told you.",
            onEnter() {
              L.xp(15, "Persuasion: the Neon's eternal election");
            },
            responses: [{ text: "Your secret's safe.", next: "hello" }],
          },
          dodge: {
            text: "Every day is election day in the Neon! And every day, Crowe wins! Button?",
            responses: [{ text: "Uh-huh.", next: "hello" }],
          },
        },
      }),
    );

    // ---- Clinic patients ----
    const PAT = {
      neon_patient1: {
        hi: [
          "Don't mind me. Doc's re-attaching the arm Tuesday. Or was it the leg. Something's getting re-attached Tuesday.",
          "Mickey Moran. They call me Two-Stitches. Doc Broadway only uses two stitches. On everything.",
        ],
        story:
          "A Maniac bit me on Forty-Fourth. Fella used to sell me papers. Getting bit by a guy you used to tip, it's like — it's like being insulted by your own reflection. Guards got it, though. Guards always get 'em.",
      },
      neon_patient2: {
        hi: [
          "I have an appointment. I have had an appointment since the spring. Which spring, I couldn't tell you.",
          "Oh, you're not the doctor. You're too… rested. Are you ill? You look ill. You look healthy. That's the same thing, around here.",
        ],
        story:
          "It's my lungs, dear. Doc says they're \"decorative\" now. I say, at my age, what isn't?",
      },
    };
    L.dialogue("dlg_neon_patient", {
      start: "hello",
      nodes: {
        hello: {
          text: (actor) =>
            pick((PAT[actor && actor.id] || PAT.neon_patient1).hi),
          responses: [
            { text: "What happened to you?", next: "story" },
            {
              text: "Let me take a look.",
              check: { skill: "medicine", value: 40 },
              cond: (actor) =>
                !!actor && L.flag("neon_triage_" + actor.id) !== G.time.day,
              next: "treat",
              failNext: "treat_fail",
            },
            {
              text: "[Give them a Rally Tonic.]",
              standing: 10,
              repeatStanding: true,
              cond: (actor) =>
                L.has("rally_tonic") &&
                !!actor &&
                L.flag("neon_stim_" + actor.id) !== G.time.day,
              action: (actor) => {
                L.take("rally_tonic", 1);
                if (actor) L.setFlag("neon_stim_" + actor.id, G.time.day);
              },
              next: "stim",
            },
            { text: "Get well." },
          ],
        },
        story: {
          text: (actor) => (PAT[actor && actor.id] || PAT.neon_patient1).story,
          responses: [{ text: "Get well soon." }],
        },
        treat: {
          text: "[You check the dressing, re-pack the wound and tighten a splint Doc Broadway tied like a shoelace.] …Hey. Hey, that actually feels better. You sure you're not a doctor? You're not a doctor. You're better than a doctor. You're FREE.",
          onEnter(actor) {
            if (actor) L.setFlag("neon_triage_" + actor.id, G.time.day);
            L.xp(20, "Medicine: triage at Doc Broadway's");
          },
          responses: [{ text: "Take it easy." }],
        },
        treat_fail: {
          text: "[You poke the bandage. Something underneath pokes back.] OW! Okay! Okay, that's — let's leave it to the Doc.",
          onEnter(actor) {
            if (actor) L.setFlag("neon_triage_" + actor.id, G.time.day);
          },
          responses: [{ text: "Sorry." }],
        },
        stim: {
          text: "[They stare at the bottle like it's a gold bar.] For me? Stranger, those cost more than my whole… me. God bless. God bless whoever thawed you out.",
          responses: [{ text: "Feel better." }],
        },
      },
    });

    // ---- Rocco (Cinder Club bar) ----
    L.dialogue(
      "dlg_neon_rocco",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Rocco. I pour, I listen, I crack a rib when I laugh. Sal told you about the rib? Everybody knows about the rib.",
                "What'll it be, honorary? House special's the Meltdown. Don't ask what's in it. I don't know. It's been in the bottle since '67.",
              ]),
            responses: [
              {
                text: "Let's see what you're pouring.",
                barter: true,
                end: true,
              },
              { text: "What's the story with this place?", next: "club" },
              { text: "Heard any good gossip?", next: "gossip" },
              { text: "See you, Rocco." },
            ],
          },
          club: {
            text: "Before the bombs, this was the Starlight Room, a jazz club for the kind of people who looked down on the kind of people who went to jazz clubs. Then the bombs came, and the snobs never left. Spring of '67 the Continuity came round with census cards, and we burned every last one in the ashtray on that bar. Somebody painted CINDER over the sign. Members are folks who burned a card. It's not about keeping people out, see. It's about having one door in the world that's on nobody's list.",
            responses: [{ text: "And you let me in.", next: "in" }],
          },
          in: {
            text: "Sal let you in. I just pour. …But yeah. You're alright. For somebody who looks like he'd fill in a form.",
            responses: [{ text: "Thanks. I think.", next: "hello" }],
          },
          gossip: {
            text: () =>
              pick([
                "The Countess? Not a countess. Was a hat-check girl at the Waldorf. Don't tell her I told you. Tell everyone else.",
                "Mortimer's been writing the same novel since '68. Says it's about a man who writes a novel. It's very long.",
                "Smiley Pete stole his best bit from a Valet robot. The Valet's suing. Through Crowe. It's going badly for everyone.",
                "Lucky Lou's got a royal flush in his breast pocket he's never played. I think it's the only thing keeping him alive. I mean that literally.",
              ]),
            responses: [
              { text: "More.", next: "gossip" },
              { text: "Thanks, Rocco.", next: "hello" },
            ],
          },
        },
      }),
    );

    // ---- Club regulars ----
    const CL = {
      neon_club1: [
        "Darling, you are the first topsider to set foot in here since the Mayor of New York in '66. HE left in a hurry. Try to leave more gracefully.",
        "The Countess Vivienne Roth. Yes, a real countess. Of what? Of THIS, darling. Of all of this.",
      ],
      neon_club2: [
        "Mortimer Graves, novelist. My novel is in its hundred and thirty-first draft. Would you like to hear chapter one? It's four hundred pages.",
        "Please don't stand in my light. I don't have much of it left.",
      ],
      neon_club3: [
        "Lulu LaBelle! I danced at the Copacabana! …Well, outside it. On the sidewalk. For tips. But I DANCED.",
        "Ooh, a new one. Can I touch your cheek? It's so… springy.",
      ],
    };
    L.dialogue(
      "dlg_neon_clubber",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: (actor) => pick(CL[actor && actor.id] || CL.neon_club1),
            responses: [
              {
                text: "You wear the years beautifully.",
                check: { attr: "presence", value: 7 },
                cond: (actor) =>
                  !!actor && !L.flag("neon_club_drink_" + actor.id),
                next: "charmed",
                failNext: "cold",
              },
              { text: "What do you do here all night?", next: "night" },
              { text: "Enjoy your evening." },
            ],
          },
          charmed: {
            text: "[A long, delighted rattle of a laugh.] Oh, it SPEAKS. And it speaks WELL. Rocco — a drink for my new friend, on my tab. My tab is twenty-two years long. What's one more line.",
            onEnter(actor) {
              if (actor) L.setFlag("neon_club_drink_" + actor.id, true);
              L.give(pick(["whiskey", "scotch", "wine"]), 1);
            },
            responses: [{ text: "Cheers." }],
          },
          cold: {
            text: "[They look at you the way you'd look at a stray dog who asked you to dance.] How… sincere. Run along, darling. Sincerity is so very nineteen-sixty-six.",
            responses: [{ text: "Right." }],
          },
          night: {
            text: "Drink. Gossip. Watch Smiley die on stage — professionally. Remember being young, darling, and decide over another drink that it was overrated.",
            responses: [{ text: "Sounds nice.", next: "hello" }],
          },
        },
      }),
    );

    // ---- Speakeasy regulars ----
    const SP = {
      neon_speak1: {
        hi: "Pinky Nolan. You found the Speakeasy? Nobody finds the Speakeasy. That means somebody told you. Who told you? …Barnaby. It's always Barnaby.",
        lore: "The Neon's Speakeasy was a speakeasy BEFORE it was a speakeasy — in the nineteen-twenties, when booze was illegal. Then it was a subway maintenance room. Then the bombs. Now it's a speakeasy again. Things in this city come back around. Like me. Like my cough.",
      },
      neon_speak2: {
        hi: "Dutch. Just Dutch. Don't sit there, that's where Crowe sits when he comes down to hide from being Mayor.",
        lore: "See the back wall? Brick, brick, brick, door. Behind that door's the old IRT tunnel — goes clear to Grand Central, they say, if the Maniacs don't get you. Whisper keeps the key. Whisper keeps everything.",
      },
    };
    L.dialogue(
      "dlg_neon_speakeasy",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: (actor) => (SP[actor && actor.id] || SP.neon_speak1).hi,
            responses: [
              { text: "What is this place?", next: "lore" },
              { text: "Who's Whisper?", next: "whisper" },
              { text: "I'll leave you to your drink." },
            ],
          },
          lore: {
            text: (actor) => (SP[actor && actor.id] || SP.neon_speak1).lore,
            onEnter() {
              L.setFlag("neon_speakeasy_lore");
            },
            responses: [{ text: "Interesting.", next: "hello" }],
          },
          whisper: {
            text: "Whisper pours. Whisper doesn't talk. Whisper was a Broadway prompter — the guy in the box who whispers your lines when you forget. Now he whispers everybody's secrets to nobody. Best bartender in New York. Worst conversation.",
            responses: [{ text: "Thanks.", next: "hello" }],
          },
        },
      }),
    );

    // ---- Lydia Pham, Depot clerk ----
    L.dialogue(
      "dlg_neon_clerk",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Depot office. Manifests, tolls, lost oxen. Which one?",
                "Lydia Pham. Books, bills and oxen. Mostly the oxen.",
              ]),
            responses: [
              {
                text: "Let's trade. (travel supplies)",
                barter: true,
                end: true,
              },
              { text: "What comes through the Depot?", next: "freight" },
              { text: "You're not from around here.", next: "human" },
              {
                text: "Anything odd in the books?",
                cond: () =>
                  ["culprit", "confront"].indexOf(Q.stage("sq_neon_power")) >=
                  0,
                next: "kip",
              },
              { text: "Goodbye." },
            ],
          },
          freight: {
            text: "Grand Central sends vegetables and gossip. Radio City sends tubes and gossip. Carnegie Hall sends music sheets nobody can read and a LOT of gossip. The Neon sends back power cells, chems and lights. We're the only place that makes light. Everybody wants light.",
            responses: [{ text: "Thanks.", next: "hello" }],
          },
          human: {
            text: "Nope. Jersey girl. Came in with Eustace nine years ago, looked at the books, fainted, and stayed to fix them. The Neon's good people. They just need someone to count for them. They burned their census cards in '67 and lost the habit.",
            responses: [{ text: "Fair enough.", next: "hello" }],
          },
          kip: {
            text: '[She flips back through a ledger.] Kip Lasko signed out for "night loading" every night this week. There was no night loading. And somebody paid off his debt to Lou in one lump — three hundred scrip, all in Terminal Boys notes. I flagged it. Nobody reads my flags.',
            onEnter() {
              try {
                if (
                  L.neonQuests &&
                  Q.stage("sq_neon_power") === "culprit" &&
                  !L.flag("kip_known")
                ) {
                  L.setFlag("kip_known", "clerk");
                  Q.setStage("sq_neon_power", "confront");
                }
              } catch (e) {
                /* ignore */
              }
            },
            responses: [{ text: "I read it. Thanks, Lydia.", next: "hello" }],
          },
        },
      }),
    );

    // ---- Bertie Quill, Opry stagehand (a witness to the wig theft) ----
    L.dialogue(
      "dlg_neon_stagehand",
      T.sleepy({
        start: "hello",
        nodes: {
          hello: {
            text: () =>
              pick([
                "Bertie Quill, stage crew. Don't touch the ropes. The ropes hold up the moon.",
                "Mind your feet. Actually, mind everything. Theatre's dangerous.",
              ]),
            responses: [
              {
                text: "Did you see who took Velvet's wig?",
                cond: () =>
                  Q.stage("sq_neon_opry") === "wig" && !L.has("q_neon_wig"),
                next: "wig",
              },
              { text: "How's the show going?", next: "show" },
              { text: "See you, Bertie." },
            ],
          },
          wig: {
            text: "Didn't SEE. Heard. Somebody backstage during the second act, giggling. Only one fella in the Neon giggles like a kettle — Nicky Two-Thumbs. And he left the dressing-room door open. Pro tip: heckler's always got a prop in his pocket.",
            onEnter() {
              L.setFlag("wig_thief_known");
            },
            responses: [{ text: "Thanks, Bertie." }],
          },
          show: {
            text: () =>
              L.flag("opry_star")
                ? "Since you joined, we've sold out every night. Sold out means eleven people. Eleven is a LOT, for the Neon."
                : "Same show every night for twenty-two years. I know every cue. I could run it in my sleep. I have. Nobody noticed.",
            responses: [{ text: "Break a leg.", next: "hello" }],
          },
        },
      }),
    );
  });

  // More ambient two-person talk for the market (47 plays one at a time near the player)
