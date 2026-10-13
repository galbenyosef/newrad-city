// play-inline-191 07 — next
// Lines 2860-3222 of readable/play-inline-191.pretty.js (statement-aligned).
  function data() {
    K.defineItem({
      id: "pv_q_portrait",
      type: "misc",
      name: 'Odile\'s Portrait ("Girl on the Swing, 1967")',
      weight: 2,
      value: 0,
      quest: true,
      desc: "A small oil portrait of a laughing girl on a rope swing, painted the week before the bombs. The raiders used it as a dartboard. They missed a lot.",
    });
    K.defineItem({
      id: "pv_key_penthouse",
      type: "key",
      name: "Penthouse Key (Hotel Chelsea)",
      weight: 0,
      value: 0,
      quest: true,
      desc: "A heavy brass key on a tassel. The tag says VOSS in faded ink.",
    });
    K.defineItem({
      id: "pv_artists_beret",
      type: "apparel",
      slot: "head",
      name: "Moretz's Beret",
      weight: 0.5,
      value: 120,
      dr: 1,
      attrs: { presence: 1 },
      skills: { persuasion: 5 },
      mesh: "hat_cap",
      tags: ["apparel", "hat"],
      desc: "Paint-stiffened black beret of the late Aurelio Moretz. Makes you feel like your opinions about color matter. (+1 Presence, +5 Persuasion)",
    });

    // ---- quest ----
    // round 1b (quest walk): picking the portrait up never advanced 'find' → 'return' (objective + marker stayed on the
    // Tombs). Advance on pickup, and on load if the player already carries it.
    if (!PV._portraitHook) {
      PV._portraitHook = true;
      const adv = () => {
        if (K.q.stage("pv_last_portrait") === "find" && K.has("pv_q_portrait"))
          K.q.set("pv_last_portrait", "return");
      };
      G.events.on("itemAdded", (id) => {
        if (id === "pv_q_portrait") adv();
      });
      G.events.on("loaded", () => setTimeout(adv, 0));
      G.events.on("questStarted", () => setTimeout(adv, 0));
    }
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pv_last_portrait",
        name: "The Last Portrait",
        giver: "Odile Marchetti",
        location: "Hotel Chelsea",
        desc: "Odile, a painter at the Hotel Chelsea, painted a portrait the week the bombs fell — the last thing she painted before the Bombing burned her hands. Raiders from the Tombs stole it. She wants it back.",
        stages: [
          {
            id: "find",
            text: "Recover Odile's portrait from the raiders holed up in the Tombs.",
            markers: [
              () => {
                const a = PV.anchor("tombs", "portrait");
                return a
                  ? { x: a.x, z: a.z, y: a.y, label: "Odile's Portrait" }
                  : null;
              },
            ],
          },
          {
            id: "return",
            text: "Return the portrait to Odile at the Hotel Chelsea.",
            markers: [{ npc: "pv_vivienne", label: "Odile" }],
          },
          {
            id: "lp_sell",
            text: "(Optional) Sell the portrait to Leopold instead.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.stage("pv_last_portrait") === "return",
            doneIf: () => PV.flag("portrait") === "sold",
          },
        ],
        rewards: { xp: 300 },
      });
    }

    // ---- dialogues ----
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const has = () => K.has("pv_q_portrait");
    G.dialogue.register("pv_dlg_vivienne", {
      start: () =>
        K.q.done("pv_last_portrait")
          ? "after"
          : has()
            ? "returned"
            : K.q.active("pv_last_portrait")
              ? "waiting"
              : PV.flag("met_viv")
                ? "again"
                : "hello",
      nodes: {
        hello: {
          speaker: "Odile Marchetti",
          onEnter: () => PV.setFlag("met_viv", true),
          text: "Don't touch that, it's wet. Well — it's been wet since '67. Linseed oil and radiation, darling: nothing ever quite dries. I'm Odile. You look like someone who walks into dangerous places for money.",
          responses: [
            { text: "Depends on the money. What do you need?", next: "pitch" },
            { text: "What is this place?", next: "place" },
            { text: "Just admiring the art.", next: "art" },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Odile Marchetti",
          text: "Back again? Stand there. No — there. The light likes your face. It's the only thing that does, I imagine.",
          responses: [
            { text: "About that job...", next: "pitch" },
            { text: "Tell me about the hotel.", next: "place" },
            { text: "Goodbye.", end: true },
          ],
        },
        place: {
          speaker: "Odile Marchetti",
          text: "The Hotel Chelsea. Poets died here, painters went mad here, musicians did both. When the bombs fell the residents simply... stayed. The ones who lived came out of it burned, broke and stubborn, and kept painting. Twenty-two years of rent in arrears. Stanley still keeps the ledger.",
          responses: [
            { text: "And the job?", next: "pitch" },
            { text: "Goodbye.", end: true },
          ],
        },
        art: {
          speaker: "Odile Marchetti",
          text: "Eleven hundred paintings on those stairs, and not one of them is for sale. Well. Leopold sells some. Leopold would sell the staircase if he could get it through the door.",
          responses: [
            { text: "Do you need anything?", next: "pitch" },
            { text: "Goodbye.", end: true },
          ],
        },
        pitch: {
          speaker: "Odile Marchetti",
          text: "The last thing I painted with two good hands was a girl on a swing — my niece, Rosie, in Washington Square, March 1967. Raiders from the Tombs broke in last winter and took it. They took it because it was small enough to carry. I want it back before they burn it for warmth.",
          responses: [
            {
              text: "I'll get your painting back.",
              next: "accept",
              action: () => K.q.start("pv_last_portrait"),
            },
            {
              text: "[Trade 40] What's it worth to you?",
              check: { skill: "trade", value: 40 },
              next: "haggle",
              failNext: "haggle_fail",
            },
            { text: "The Tombs? No thanks.", next: "refuse" },
          ],
        },
        haggle: {
          speaker: "Odile Marchetti",
          text: "Everything I have, which is a key to a dead man's penthouse and a roll of scrip I've been saving to buy cadmium red. Fine. The key, and a hundred and fifty scrip. Bring her home.",
          onEnter: () => PV.setFlag("viv_bonus", 50),
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => K.q.start("pv_last_portrait"),
            },
          ],
        },
        haggle_fail: {
          speaker: "Odile Marchetti",
          text: "Worth? It's worth what my face was worth. Which is to say, you'll get what you get, and you'll like it.",
          responses: [
            {
              text: "Fine. I'll get it.",
              next: "accept",
              action: () => K.q.start("pv_last_portrait"),
            },
            { text: "Not interested.", end: true },
          ],
        },
        accept: {
          speaker: "Odile Marchetti",
          text: "The Tombs — the old Detention Complex on White Street, the art-deco tower with the bridge. The raiders' boss keeps his \"trophies\" in the Warden's office upstairs. Try not to get shot through the canvas.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        refuse: {
          speaker: "Odile Marchetti",
          text: "Nobody ever wants to go downtown. Go on, then. Pose for somebody else.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        waiting: {
          speaker: "Odile Marchetti",
          text: "Well? Is she safe? ...No. I can see it on you. The Tombs, darling. The Warden's office. Upstairs, past the cells.",
          responses: [{ text: "I'm working on it.", end: true }],
        },
        returned: {
          speaker: "Odile Marchetti",
          text: "...Oh. Oh, Rosie. Look at you. They put holes in the sky but you're still laughing.",
          responses: [
            {
              text: "Here. She's yours.",
              next: "thanks",
              standing: 20,
              action: () => finishPortrait("returned"),
            },
            {
              text: "[Persuasion 60] Keep your scrip. Paint something new instead.",
              check: { skill: "persuasion", value: 60 },
              next: "thanks_free",
              failNext: "thanks",
              action: () => finishPortrait("returned", true),
            },
            { text: "Leopold offered me more for it.", next: "betray" },
          ],
        },
        betray: {
          speaker: "Odile Marchetti",
          text: "Leopold would. ...Go on, then. Sell her. I'll paint her again from memory. My memory is twenty-two years long and every year of it is her; it will only take the rest of it.",
          responses: [
            {
              text: "(Give the painting back after all.)",
              next: "thanks",
              standing: 20,
              action: () => finishPortrait("returned"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        thanks: {
          speaker: "Odile Marchetti",
          text: "Take this — Moretz's key. The penthouse at the top of the stairs. He was the best of us and the worst tenant. His beret is up there too. He'd want it on someone who still goes outside.",
          responses: [{ text: "Thank you, Odile.", end: true }],
        },
        thanks_free: {
          speaker: "Odile Marchetti",
          text: "Something new. What a strange, generous, terrible idea. ...All right. Take the key at least. Moretz would haunt me otherwise.",
          responses: [{ text: "Goodbye, Odile.", end: true }],
        },
        after: {
          speaker: "Odile Marchetti",
          text: () =>
            PV.flag("portrait") === "sold"
              ? "Leopold hung her in the window with a price tag on her. I walk the long way round now."
              : "She's over the bed, where I can see her when I wake up. Old women don't sleep much. I look at her a lot.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_leopold", {
      start: () =>
        K.has("pv_q_portrait") && K.q.active("pv_last_portrait")
          ? "offer"
          : "hello",
      nodes: {
        hello: {
          speaker: "Leopold Fisk",
          text: "Welcome to the Fisk Gallery, est. 1964, re-est. 1971, re-re-established after the fire. Everything on the walls is for sale except the walls. The walls are negotiable.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Who are you?", next: "who" },
            { text: "Goodbye.", end: true },
          ],
        },
        who: {
          speaker: "Leopold Fisk",
          text: "A gallerist. Before the bombs I sold abstract expressionism to bankers. Now I sell canned beans to painters. It's the same job, really: you convince somebody that a thing is worth more than it is.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        offer: {
          speaker: "Leopold Fisk",
          text: "Is that — that's the Marchetti. The swing girl. Listen, friend. Odile will cry and hug you. I will give you two hundred and fifty scrip. A hug does not buy tonic.",
          responses: [
            {
              text: "Sold. (Sell the portrait for 250 scrip.)",
              standing: -30,
              action: () => finishPortrait("sold"),
              next: "sold",
            },
            { text: "It isn't for sale.", next: "no" },
            { text: "Let's trade something else.", barter: true, end: true },
          ],
        },
        sold: {
          speaker: "Leopold Fisk",
          text: "A pleasure. I'll put her in the window. With the right lighting she'll look even sadder. Sad sells.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        no: {
          speaker: "Leopold Fisk",
          text: "Everything is for sale. You just haven't heard the right number. Come back when you have.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_stanley", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Stanley",
          text: "Welcome to the Hotel Chelsea. Checking in? Rooms are fifteen scrip a night, thirty with a door. I've been on this desk since 1951. The management changed. I didn't.",
          responses: [
            { text: "Any news around the Village?", next: "news" },
            { text: "Tell me about the residents.", next: "res" },
            { text: "What's in the penthouse?", next: "pent" },
            { text: "Goodbye.", end: true },
          ],
        },
        news: {
          speaker: "Stanley",
          text: "The Vanguard is still swinging — robots on the bandstand, Mags behind the bar, down on Seventh. Katz's on Houston is crawling with roaches the size of dogs. Nobody sane goes into Chinatown after dark; there's something under the Golden Dragon that sings in a language nobody speaks. And the Tombs on White Street — raiders. Keep prisoners. Terrible tippers.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        res: {
          speaker: "Stanley",
          text: "Odile paints on two. Leopold sells on two. Johnny Nitro screams on three — that's music, apparently. The writer on three stopped writing in '67. Mr. Moretz has the penthouse. Mr. Moretz is dead. We don't hold that against him.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
        pent: {
          speaker: "Stanley",
          text: "Mr. Moretz's studio. Locked since the bombs. Odile has his own key and she won't part with it unless you do something decent for her. I keep the spare in the cubbies, but there's twenty-two years of back rent on that room, and whoever opens the door pays it. Two hundred scrip.",
          responses: [
            {
              text: "[Pay 200 scrip] I'll settle Mr. Moretz's account.",
              cond: () => !K.has("pv_key_penthouse") && K.scripCount() >= 200,
              next: "spare",
              action: () => {
                K.scrip(-200);
                K.give("pv_key_penthouse", 1);
              },
            },
            { text: "Thanks.", next: "hello" },
          ],
        },
        spare: {
          speaker: "Stanley",
          text: "Paid in full. First time in twenty-two years. Here: brass, tassel, MORETZ on the tag. Wipe your feet up there; he was particular.",
          responses: [{ text: "Thanks.", next: "hello" }],
        },
      },
    });
    G.dialogue.register("pv_dlg_johnny", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Johnny Nitro",
          text: "OI. You. Fresh-face. You ever hear a guitar played through a Valet robot's voice box at full volume? It's the sound of the end of the world, mate. I was THERE for the end of the world. It was quieter.",
          responses: [
            { text: "Were you really here in '67?", next: "past" },
            { text: "Got anything to trade?", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        past: {
          speaker: "Johnny Nitro",
          text: "Room 822, that March morning, still up from Saturday night, playing the loudest chord in New York. Then the sky up north played a louder one. I took that personal. Been trying to top it for twenty-two years.",
          responses: [{ text: "Good luck with that.", end: true }],
        },
      },
    });
  }
