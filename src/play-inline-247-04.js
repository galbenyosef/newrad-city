// play-inline-247 04 — next
// Lines 653-946 of readable/play-inline-247.pretty.js (statement-aligned).
  PR.dialogue("pr_dlg_keeper", {
    start: () => {
      if (PR.q.active("pr_tendays") && PR.q.stage("pr_tendays") === "return")
        return PR.flag("tapes_kept") ? "kept" : "aired";
      if (PR.q.active("pr_pox") && PR.q.stage("pr_pox") === "return")
        return "pox_done";
      return PR.flag("mac_met") ? "root" : "intro";
    },
    nodes: {
      intro: {
        speaker: "Old Mac",
        text: "Whoa there — no shooting at the light. Name's McCarthy. Mac. I keep the lamp on Blackwell's Island, same as the fella who built it. Didn't build it myself, mind. Tell people I did. From the bottom to the top.",
        onEnter: () => PR.setFlag("mac_met", true),
        responses: [
          { text: "A lighthouse keeper? Out here?", next: "who" },
          { text: "What is this island?", next: "island" },
          { text: "Nice to meet you, Mac.", next: "root" },
        ],
      },
      root: {
        speaker: "Old Mac",
        text: () =>
          PR.flag("tapes_aired")
            ? "There's my favourite disc jockey. Light's burning bright tonight. Something I can do for you?"
            : "Light's on, tide's out, nobody's shooting. Good day on Blackwell's. What'll it be?",
        responses: [
          { text: "Tell me about yourself.", next: "who" },
          { text: "Tell me about the island.", next: "island" },
          {
            text: "Need a hand with anything?",
            next: "jobs",
            cond: () => !PR.q.started("pr_tendays") || !PR.q.started("pr_pox"),
          },
          {
            text: () => "About Nell Brady's tapes... (" + tapeCount() + "/3)",
            next: "tapes",
            cond: () =>
              PR.q.active("pr_tendays") &&
              PR.q.stage("pr_tendays") !== "return",
          },
          {
            text: "I'm keeping Nell's reels, Mac. There are people who need to hear them in person.",
            next: "keep_ask",
            cond: () =>
              PR.q.active("pr_tendays") &&
              PR.q.stage("pr_tendays") === "beacon" &&
              tapeCount() >= 3,
          },
          {
            text: "About the Pox House...",
            next: "pox_status",
            cond: () => PR.q.active("pr_pox"),
          },
          {
            text: "I found a sample of whatever was in that lab.",
            next: "sample",
            cond: () =>
              PR.inv.count("pr_kagent_sample") > 0 && !PR.flag("mac_sample"),
          },
          { text: "Let's trade.", barter: true },
          { text: "See you around, Mac." },
        ],
      },
      who: {
        speaker: "Old Mac",
        text: "I was an orderly at the Metropolitan, over by the Octagon. Night shift. When the flash came I was out here on the rocks having a smoke I wasn't supposed to have. Lungs went, hair went, half my hearing went, but I didn't. Twenty-two years I've been waiting for my shift to end. Somebody had to keep the lamp lit, so boats know there's rocks. There aren't any boats. Still.",
        responses: [
          { text: "Why stay?", next: "why" },
          { text: "Back to business.", next: "root" },
        ],
      },
      why: {
        speaker: "Old Mac",
        text: 'Owe it to the ones inside. The Octagon. I pushed the carts, I ran the baths. I knew what "Program Twelve" was, near enough, and I kept my head down and my pay packet up. There was a girl in there — reporter, called herself Nellie Brown. She asked me to smuggle out a tape. I said no. [He looks out at the river.] I say no to a lot less these days.',
        responses: [
          {
            text: "Maybe I can help with that.",
            next: "jobs",
            cond: () => !PR.q.started("pr_tendays"),
          },
          { text: "I see.", next: "root" },
        ],
      },
      island: {
        speaker: "Old Mac",
        text: "Blackwell's Island, then Welfare Island, now just \"the island.\" Asylum up north — the Octagon, the one with the stair. Smallpox hospital down south — the Pox House — been a ruin since before the war; the Army was poking at it right before the end. Bridge goes over the middle; there's a stair up to the deck if you like heights. And my skiff's at the dock on the west side if you want to row back to Manhattan. Bring it back.",
        responses: [
          { text: "What's in the Octagon now?", next: "octagon" },
          { text: "And the Pox House?", next: "pox" },
          { text: "Thanks.", next: "root" },
        ],
      },
      octagon: {
        speaker: "Old Mac",
        text: "Patients. What's left of them. Maniacs, all of 'em, some still in their gowns — they walk the wards like they're waiting for the bath. And the Superintendent. Harrow. Biggest of the lot now. Goes round and round that stair all night, howling. You can hear it from here, some nights, through the drum windows. Round and round.",
        responses: [{ text: "Back to business.", next: "root" }],
      },
      pox: {
        speaker: "Old Mac",
        text: "Things come out of there at night. Stitched out of other things. Too many hands. They drag themselves down to the water and drink and go back. The Army put something in that cellar before the bombs. Whatever it is, it's still cooking.",
        responses: [
          {
            text: "I could take a look.",
            next: "pox_offer",
            cond: () => !PR.q.started("pr_pox"),
          },
          { text: "Back to business.", next: "root" },
        ],
      },
      jobs: {
        speaker: "Old Mac",
        text: "Two things keep me up at night — well, I don't sleep, but you know what I mean.",
        responses: [
          {
            text: "The reporter's tapes?",
            next: "tapes_offer",
            cond: () => !PR.q.started("pr_tendays"),
          },
          {
            text: "The Pox House?",
            next: "pox_offer",
            cond: () => !PR.q.started("pr_pox"),
          },
          { text: "Maybe later.", next: "root" },
        ],
      },
      tapes_offer: {
        speaker: "Old Mac",
        text: "Nell Brady. The girl who asked me for help. She made three tapes before the end and hid 'em somewhere in the Octagon — wards, the Lodge up top, maybe the treatment room. Find 'em, bring 'em here, and we'll put 'em out over my beacon rig. The DJ in Manhattan picks up anything I send. Twenty-two years late, but she'll get her story.",
        responses: [
          {
            text: "I'll find her tapes.",
            action: () => {
              PR.q.start("pr_tendays", { stage: "tapes" });
              if (tapeCount() >= 3) PR.q.set("pr_tendays", "beacon");
            },
            next: "root",
          },
          {
            text: "[Persuasion 40] What's in it for me?",
            check: { skill: "persuasion", value: 40 },
            next: "tapes_pay",
            failNext: "tapes_fail",
          },
          { text: "Not now.", next: "root" },
        ],
      },
      tapes_pay: {
        speaker: "Old Mac",
        text: "[He laughs, a sound like gravel in a can.] Fair. I've got her hat. She left it on the orderly's hook the day they took her to the Lodge. Kept it twenty-two years in case she came back for it. Get her story out and it's yours. Scrip too.",
        responses: [
          {
            text: "Deal.",
            action: () => {
              PR.q.start("pr_tendays", { stage: "tapes" });
              if (tapeCount() >= 3) PR.q.set("pr_tendays", "beacon");
            },
            next: "root",
          },
        ],
      },
      tapes_fail: {
        speaker: "Old Mac",
        text: "The satisfaction of a job well done. And maybe some scrip. I'm a lighthouse keeper, not a bank.",
        responses: [
          {
            text: "Fine. I'll find the tapes.",
            action: () => PR.q.start("pr_tendays", { stage: "tapes" }),
            next: "root",
          },
          { text: "Not now.", next: "root" },
        ],
      },
      tapes: {
        speaker: "Old Mac",
        text: () =>
          tapeCount() >= 3
            ? "All three? Then what are you standing here for — the rig's right there. Put her on the air."
            : "Keep looking. Ward A, ground floor north. The Lodge, top of the north wing. Treatment room, south side. And mind the Superintendent.",
        responses: [{ text: "On it.", next: "root" }],
      },
      aired: {
        speaker: "Old Mac",
        text: 'Heard it go out. Every word. [He is quiet for a while.] She said "I was here. We were all here." Twenty-two years I\'ve been the only one who knew that. Not any more. And that last one, the Saturday night. "Marsh says tomorrow." They knew, and they let the whole city go to church. Here: her hat. And some scrip. You\'ve earned both.',
        responses: [
          {
            text: "She did it for her roommate. Nicky. She was trying to find out where they'd put me.",
            cond: () => msDone("mq07"),
            next: "nicky",
          },
          {
            text: "She got her byline, Mac.",
            action: () => {
              PR.q.done("pr_tendays");
              PR.xp(50, "Ten Days in the Madhouse");
            },
            next: "root",
          },
        ],
      },
      nicky: {
        speaker: "Old Mac",
        text: "[He looks at you a long while, the way he looks at the river.] You're one of the freezer boys. The roster in Harrow's drawer. [He shakes his head.] She went in a madhouse for a girl who was worried about her fella, and the fella turns up twenty-two years late in my camp. Nellie'd have loved that. She'd have put it on the front page. Take the hat. Wear it when you find your Nicky.",
        responses: [
          {
            text: "I will, Mac.",
            action: () => {
              PR.q.done("pr_tendays");
              PR.xp(50, "Ten Days in the Madhouse");
            },
            next: "root",
          },
        ],
      },
      keep_ask: {
        speaker: "Old Mac",
        text: "[He rubs the back of his neck.] I wanted her on the air. Twenty-two years I wanted it. [A long breath.] But she gave them to whoever found them, and that's you, not me. If there's somebody who ought to hear Nellie's voice with their own ears, a real person, not a radio... all right. Keep them safe.",
        responses: [
          {
            text: "I'll keep them safe.",
            action: () => {
              PR.setFlag("tapes_kept", true);
              msFlag("ms_nell", "kept");
              PR.q.set("pr_tendays", "return");
            },
            next: "kept",
          },
          { text: "You're right. Let's put her on the air.", next: "tapes" },
        ],
      },
      kept: {
        speaker: "Old Mac",
        text: "Then take her hat too. She left it on the orderly's hook the day they took her to the Lodge. A reporter ought to be dressed when she finally gets heard. And, stranger: whoever you play those for, tell them Nellie Brady was here.",
        responses: [
          {
            text: "I'll tell them, Mac.",
            action: () => {
              PR.q.done("pr_tendays");
              PR.xp(50, "Ten Days in the Madhouse");
            },
            next: "root",
          },
        ],
      },
      pox_offer: {
        speaker: "Old Mac",
        text: "Go in the front, past the old theatre. The cellar's where the Army worked — quarantine cells, a morgue, and something behind a steel door. Army nurse kept the key, I heard, up on the first floor. Whatever's cooking down there — burn it. I'll make it worth your while.",
        responses: [
          {
            text: "I'll deal with it.",
            action: () => PR.q.start("pr_pox", { stage: "enter" }),
            next: "root",
          },
          { text: "Not now.", next: "root" },
        ],
      },
      pox_status: {
        speaker: "Old Mac",
        text: () =>
          PR.flag("ren_purged")
            ? "Smoke's been coming out of the Pox House chimneys. That you?"
            : "Still cooking over there. I can smell it when the wind turns.",
        responses: [{ text: "Working on it.", next: "root" }],
      },
      pox_done: {
        speaker: "Old Mac",
        text: "Saw the smoke. Smelled it too — smelled like the day the bombs fell, only for once it was the right thing burning. Here. Scrip, and my thanks. The river'll be a little quieter tonight.",
        responses: [
          {
            text: "Glad to help.",
            action: () => {
              PR.setFlag("pox_reported", true);
              PR.q.done("pr_pox");
            },
            next: "root",
          },
        ],
      },
      sample: {
        speaker: "Old Mac",
        text: "You brought that THING out here? [He backs away.] Throw it in the river. No — don't, the fish have enough problems. Sell it to somebody who deserves it, or bury it deep. I won't touch it. Here, though — for not lying to me about it. Take some water.",
        responses: [
          {
            text: "Fair enough.",
            action: () => {
              PR.setFlag("mac_sample", true);
              PR.inv.add("purified_water", 2);
            },
            next: "root",
          },
        ],
      },
    },
  });
