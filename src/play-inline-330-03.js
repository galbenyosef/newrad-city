// play-inline-330 03 — responses
// Lines 246-501 of readable/play-inline-330.pretty.js (statement-aligned).
  PF.dialogue("pch_dlg_dizzy", {
    start: () => {
      if (PF.q.complete("pch_encore")) return "after";
      if (PF.flag("lulu_freed")) {
        if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
        if (PF.q.stage("pch_encore") !== "return")
          PF.q.set("pch_encore", "return");
        return "report";
      }
      return PF.q.active("pch_encore") ? "waiting" : "root";
    },
    nodes: {
      root: {
        speaker: "Dizzy Calhoun",
        text: "Welcome to Webster Hall, friend. Dizzy Calhoun, trumpet, bandleader, and — since the boss died in '69 — management. Grab a drink, dance if you got the knees for it. Just... don't ask for \"Two Hearts Are Better.\" Not tonight.",
        responses: [
          { text: "Why not tonight?", next: "why" },
          { text: "How does a dance hall survive out here?", next: "survive" },
          { text: "I'll let you get back to it." },
        ],
      },
      survive: {
        speaker: "Dizzy Calhoun",
        text: "Same as it always did: people pay to forget. Scrip at the door, Gina's gin at the bar, Big Tony outside to explain the rules. Twenty-two years and it turns out a good Saturday night is the one thing the bombs couldn't cancel.",
        responses: [
          { text: 'And why not "Two Hearts Are Better"?', next: "why" },
          { text: "Fair enough." },
        ],
      },
      why: {
        speaker: "Dizzy Calhoun",
        text: "Because that's Lulu's number, and Lulu ain't here. The Conductors — raiders who squat on the old High Line and charge a toll to walk it — grabbed her off the 14th Street stair four days ago. Ransom note says three hundred scrip. I don't have three hundred scrip. I have a trumpet and a bad heart.",
        responses: [
          {
            text: "I'll get her back.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
            },
          },
          {
            text: "[Persuasion 40] Three hundred scrip for a singer? She must be good.",
            check: { skill: "persuasion", value: 40 },
            next: "speech",
            failNext: "speechFail",
          },
          { text: "Not my problem.", next: "decline" },
        ],
      },
      speech: {
        speaker: "Dizzy Calhoun",
        text: "Good? Kid, when Lulu sings \"Moonlight Over the Hudson\" the old-timers in the back cry and the raiders outside stop shooting to listen. That's why they took her. [He leans in.] Bring her home and I'll give you the only thing I own worth more than my horn. And I'll throw in a hundred scrip from the door.",
        responses: [
          {
            text: "Deal. Where is she?",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
              PF.setFlag("dizzy_bonus", true);
            },
          },
        ],
      },
      speechFail: {
        speaker: "Dizzy Calhoun",
        text: "Don't get cute. She's the best voice south of 34th Street and she's the closest thing I got to family. Will you help or not?",
        responses: [
          {
            text: "I'll help.",
            next: "accept",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
            },
          },
          { text: "Not right now.", next: "decline" },
        ],
      },
      accept: {
        speaker: "Dizzy Calhoun",
        text: 'Bless you. The Conductors hole up in the St. John\'s Park Freight Terminal — the big brick building where the High Line ends, south of 14th. Stairs up to the tracks at the north end or by 18th Street, or try the loading dock. Their boss calls himself "the Conductor." Wears a hat. Carries a shotgun. Has no sense of rhythm.',
        responses: [{ text: "I'm on it." }],
      },
      decline: {
        speaker: "Dizzy Calhoun",
        text: "Yeah. Sure. Nobody's problem. [He turns back to the stage and plays four slow bars that sound exactly like a door closing.]",
        responses: [{ text: "[Leave]" }],
      },
      waiting: {
        speaker: "Dizzy Calhoun",
        text: () =>
          encoreStage() === "free"
            ? "You found her? She's alive? Then what are you doing HERE? Get that cage open!"
            : "Any word on Lulu? The Freight Terminal, south end of the High Line. Please.",
        responses: [
          { text: "Working on it." },
          { text: "Tell me about the Conductors again.", next: "accept" },
        ],
      },
      report: {
        speaker: "Dizzy Calhoun",
        text: "You... she walked in the door an hour ago, shaking like a leaf and humming. HUMMING. Lord have mercy. You brought her home.",
        responses: [{ text: "She did most of the walking.", next: "reward" }],
      },
      reward: {
        speaker: "Dizzy Calhoun",
        text: () =>
          "Here. This is The Encore — my father's .44. Kept it in the trumpet case since before the war. Never played it once. I think it's been waiting for you." +
          (PF.flag("dizzy_bonus")
            ? " And the hundred scrip, like I promised."
            : "") +
          " Saturday night, you drink free. Every Saturday. For life.",
        onEnter: () => {
          if (PF.q.active("pch_encore")) {
            PF.q.done("pch_encore");
            PF.inv.add("pch_encore_gun", 1);
            if (PF.flag("dizzy_bonus")) PF.inv.addScrip(100);
            PF.news(
              "Good news from 14th Street: Lulu Monroe is back on stage at Webster Hall, and the Conductors on the High Line are one conductor short. The Radium Rhythm Kings play Saturday. Dance like nobody's irradiated.",
            );
          }
        },
        responses: [{ text: "Thanks, Dizzy." }],
      },
      after: {
        speaker: "Dizzy Calhoun",
        text: "Our hero! Gina — this one drinks on the house. Lulu, honey, sing the one about the moon.",
        responses: [{ text: "Play something good." }],
      },
    },
  });
  PF.dialogue("pch_dlg_lulu", {
    start: () =>
      PF.flag("lulu_freed")
        ? "home"
        : PF.flag("hl_cage_open")
          ? "free"
          : "caged",
    nodes: {
      caged: {
        speaker: "Lulu Monroe",
        text: "Hey. Hey! You're not one of them — you don't smell like diesel and bad decisions. I'm Lulu. The big ugly one in the hat has the key on his belt. Please tell me you're good at taking things off big ugly men.",
        responses: [
          {
            text: "Dizzy sent me.",
            cond: () => PF.q.active("pch_encore"),
            next: "dizzy",
          },
          {
            text: "Hang tight. I'll get you out.",
            action: () => {
              if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
              PF.q.advance("pch_encore", ["find"], "free");
            },
          },
        ],
      },
      dizzy: {
        speaker: "Lulu Monroe",
        text: "That old goat actually did something? God bless him. The key's on the Conductor — upstairs, the office overlooking the tracks. Ask him nicely, or don't. Just hurry — the butcher keeps coming by to \"measure\" me.",
        responses: [
          {
            text: "On it.",
            action: () => PF.q.advance("pch_encore", ["find"], "free"),
          },
        ],
      },
      free: {
        speaker: "Lulu Monroe",
        text: "Oh, sweet fresh-ish air. Thank you. I know the way home — the loading dock lets out on 14th and I can run the rest. Tell Dizzy to warm up the band. And tell him I want a raise.",
        responses: [
          { text: "Go. I'll meet you there.", action: () => freeLulu() },
          {
            text: "[Presence 6] Sing me something before you go?",
            check: { attr: "presence", value: 6 },
            next: "song",
            failNext: "nosong",
          },
        ],
      },
      song: {
        speaker: "Lulu Monroe",
        text: "[She clears her throat and sings, low and warm, a few bars about moonlight on the Hudson and a sailor who never came home. For a moment the freight terminal is very quiet.] ...That one's for you, hero. Now get me out of here.",
        onEnter: () => {
          if (!PF.flag("lulu_song")) {
            PF.setFlag("lulu_song", true);
            PF.xp(50, "A song from Lulu");
            try {
              G.player.heal(40);
            } catch (e) {
              /* core */
            }
          }
        },
        responses: [{ text: "Go home, Lulu.", action: () => freeLulu() }],
      },
      nosong: {
        speaker: "Lulu Monroe",
        text: "Honey, I've been in a meat locker for four days. The encore can wait for the stage.",
        responses: [{ text: "Go home, Lulu.", action: () => freeLulu() }],
      },
      home: {
        speaker: "Lulu Monroe",
        text: () =>
          PF.q.complete("pch_encore")
            ? "There's my hero! Stick around for the late set — I'm doing \"Two Hearts Are Better,\" and I'm dedicating it to you and the butcher's bad aim."
            : "Did you tell Dizzy yet? Go on, he's up on the stage pretending he wasn't crying.",
        responses: [
          { text: "Break a leg." },
          {
            text: "[Presence 6] Sing me something?",
            cond: () => !PF.flag("lulu_song"),
            check: { attr: "presence", value: 6 },
            next: "song2",
            failNext: "nosong2",
          },
        ],
      },
      song2: {
        speaker: "Lulu Monroe",
        text: '[Lulu hums the opening of "Glow, Little Geiger," a lullaby that somehow makes radiation sound cozy. A couple on the dance floor stop to listen.]',
        onEnter: () => {
          if (!PF.flag("lulu_song")) {
            PF.setFlag("lulu_song", true);
            PF.xp(50, "A song from Lulu");
          }
        },
        responses: [{ text: "Beautiful." }],
      },
      nosong2: {
        speaker: "Lulu Monroe",
        text: "Buy a ticket like everybody else, sugar. Saturday.",
        responses: [{ text: "Fair." }],
      },
    },
  });
  function freeLulu() {
    if (PF.flag("lulu_freed")) return;
    PF.setFlag("lulu_freed", true);
    if (!PF.q.started("pch_encore")) PF.q.start("pch_encore");
    if (PF.q.active("pch_encore")) PF.q.set("pch_encore", "return");
    PF.xp(75, "Freed Lulu Monroe");
    const a = PF.getNpc("pch_lulu_cage");
    if (a)
      setTimeout(() => {
        PF.safe("lulu_leave", () => {
          if (G.fadeTransition && a && !a.dead) {
            try {
              G.actors.remove(a);
            } catch (e) {
              /* */
            }
          }
        });
      }, 1200);
    PF.spawnRoster();
  }
