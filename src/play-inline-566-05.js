// play-inline-566 05 — responses
// Lines 1283-1628 of readable/play-inline-566.pretty.js (statement-aligned).
  ms.inject("dlg_con_hale", {
    start: () =>
      at("mq08", "hale")
        ? "mq08_offer"
        : Q.isActive("mq08") &&
            Q.reached("mq08", "ilse") &&
            !L.flag("ms_con_knows_nicole") &&
            !L.flag("ms_hale_asked")
          ? "mq08_again"
          : null,
    nodes: {
      mq08_offer: {
        speaker: "Lieutenant Hale",
        text: () =>
          "[A young officer in a pressed grey uniform, hair regulation-short, a clipboard she holds like a shield.] Lieutenant Vesper Hale, the Continuity, United Nations forward command. And you are the second sleeper. Volunteer " +
          last() +
          ", Long Winter, Cryo Unit C-9. " +
          "We've had a file open on you since the day your pod went green. Welcome back to the United States Government, Mr. " +
          last() +
          ". It has missed you.",
        responses: [
          { text: "What do you want with me?", next: "mq08_want" },
          {
            text: "You're holding my friend on Liberty Island.",
            next: "mq08_zeke",
          },
        ],
      },
      mq08_want: {
        text: "A standing offer, nothing more today. Civil Defense records clerk, Grade 4, reinstated, back pay at 1967 rates, which the Treasury will honour as soon as there is a Treasury. A bunk, ration cards, a uniform that isn't padded. In return, when the time comes, you help us light the Statue's torch. That's all. The offer stands until you take it or shoot at us. Most people take it.",
        responses: [
          { text: "Not today, Lieutenant.", next: "mq08_notyet" },
          { text: "And Zeke Marlow?", next: "mq08_zeke" },
        ],
      },
      mq08_zeke: {
        text: "Mr. Marlow is a guest of Colonel Crane on Liberty Island. Uncooperative, unharmed, very loud about water pressure. When you're ready to talk about the torch, we'll talk about Mr. Marlow. That's not a threat. It's the order of business.",
        responses: [{ text: "Not today, Lieutenant.", next: "mq08_notyet" }],
      },
      mq08_notyet: {
        text: "Understood. The offer stands. [She makes a small mark on her clipboard.] Was there something else you came for? People don't walk into the UN for the view.",
        onEnter() {
          L.setFlag("met_hale");
          if (at("mq08", "hale")) Q.setStage("mq08", "ilse");
        },
        responses: [
          {
            text: "I'm looking for someone who worked here in 1967. An interpreter.",
            next: "mq08_interp",
          },
          { text: "Just the view.", next: "mq08_view" },
        ],
      },
      mq08_interp: {
        text:
          "In 1967? [She thinks.] Then you want Mrs. Moravec. Ilse Moravec. She was here before the Bombing and she never left; we kept her on as a translator because nobody else reads Czech, French and Continuity forms. She's on the plaza most afternoons, feeding pigeons that aren't there. " +
          "[She hesitates.] And, Mr. " +
          last() +
          "? I saw who walked you to the gate. Tell Flint she still owes me a book.",
        responses: [{ text: "I'll tell her." }],
      },
      mq08_view: {
        text: "Then enjoy it. Mrs. Moravec is on the plaza if you want a guide. She remembers everything, which is a burden in this building. [A pause.] And tell Flint she still owes me a book. I saw her at the gate.",
        responses: [{ text: "I'll tell her." }],
      },
      mq08_again: {
        speaker: "Lieutenant Hale",
        text: () =>
          "Mr. " + last() + ". Back already. Have you reconsidered the offer?",
        responses: [
          {
            text: "I'm here for Nicole Mead. She was an interpreter here. I was going to marry her.",
            next: "mq08_truth",
          },
          { text: "Still thinking.", action: () => L.setFlag("ms_hale_asked") },
        ],
      },
      mq08_truth: {
        text: "[She writes nothing down. That's the first time.] Mead. Booth Four. [Very quietly.] There's a file in Records with that name on it, from 1968. I've never been cleared to open it. ...I'll ask. I shouldn't, and I will.",
        onEnter() {
          ms.set("con_knows_nicole");
          L.setFlag("con_knows_nicole");
          L.setFlag("ms_hale_asked");
          L.xp(20, "The truth, to Hale");
        },
        responses: [{ text: "Thank you, Lieutenant." }],
      },
    },
  });
  // Ilse Moravec: on the plaza (stage ilse), then at Booth Four (booth / steno).
  const ilseDef = (where) => ({
    type: "ilse_moravec",
    preset: "ilse",
    name: "Ilse Moravec",
    gender: "f",
    age: 64,
    hair: "bun",
    hairColor: 0xc9c3b8,
    outfit: "continuity_uniform",
    faction: "continuity",
    hostile: false,
    essential: true,
    ai: "guard",
    home: "here",
    homeR: 2,
    level: 3,
    dialogue: "dlg_ms_ilse",
    at: Object.assign({ maxR: 8 }, where),
  });
  ms.actor({
    id: "ms_ilse",
    when: () =>
      Q.isActive("mq08") &&
      (stage("mq08") === "hale" || stage("mq08") === "ilse"),
    def: () => ilseDef(P.unPlaza),
  });
  ms.actor({
    id: "ms_ilse_booth",
    when: () =>
      Q.isActive("mq08") &&
      (stage("mq08") === "booth" || stage("mq08") === "steno"),
    def: () => ilseDef(P.booth()),
  });
  ms.dlg("dlg_ms_ilse", "idle")
    .when(() =>
      at("mq08", "ilse")
        ? "meet"
        : at("mq08", "booth") || at("mq08", "steno")
          ? "booth"
          : null,
    )
    .add({
      idle: {
        speaker: "Ilse Moravec",
        text: "Booth Four. Go on. I will wait.",
        responses: [{ text: "All right." }],
      },
      meet: {
        speaker: "Ilse Moravec",
        text: "[A grey-haired woman in a Continuity uniform two sizes too big sits on a bench with a paper bag of crumbs and no pigeons.] You are the one from the freezer. Everybody is talking. [She looks at you over her glasses.] What do you want with an old translator, Mr. Sleeper?",
        responses: [
          { text: "Did you know Nicole Mead? Booth Four.", next: "nicole" },
        ],
      },
      nicole: {
        text: "[The bag of crumbs goes still.] Nicky. Booth Four, French into English. I had the booth beside her for three years; we shared a thermos and a dictionary and a great many opinions about the Soviet delegation. [Her eyes are wet and she ignores them.] She talked about a boy who made bad jokes about winter. Is that you? It is you. You are taller than she said.",
        responses: [
          {
            text: "What happened to her? The day of the Bombing.",
            next: "day",
          },
        ],
      },
      day: {
        text: "Not here. Not in front of the plaza. [She stands, slowly.] Come to the Assembly Hall. Booth Four. Her things are still there; nobody has used that booth since. Mind the public gallery. The Maniacs nest in the seats, and the soldiers will not help you, only watch.",
        onEnter() {
          if (at("mq08", "ilse")) Q.setStage("mq08", "booth");
        },
        responses: [{ text: "I'll meet you there." }],
      },
      booth: {
        speaker: "Ilse Moravec",
        text: () =>
          stage("mq08") === "booth"
            ? "[Ilse is already in the booth, sitting in her old chair as if it were 1967 and the session were about to start.] You found it. Sit. Not that chair. That one is hers."
            : "[Ilse taps the steno pad on the desk.] Her pad. She wrote everything down, even when we were told not to. Especially then.",
        responses: [{ text: "Tell me about that morning.", next: "morning" }],
      },
      morning: {
        text:
          "Sunday, the fifth. They called an emergency session at dawn — radar contacts over the Atlantic, coming west. Nicky was sick when she came in. She had been sick every morning that week. [A small, dry look.] I had my guess. I did not say it. " +
          "The French delegate was beside herself. At half past eight the American Civil Defense man, the liaison, stood up and took his hat and left. He did not look at anyone. Nicky wrote it down. She said he walked out like a man who knew the time.",
        onEnter() {
          if (at("mq08", "booth")) Q.setStage("mq08", "steno");
        },
        responses: [{ text: "And at 9:47?", next: "shelter" }],
      },
      shelter: {
        text:
          'At nine-forty the French delegate said, into Nicky\'s headset, "These aircraft did not leave from Paris." At nine-forty-five they sent us to the basement of the Secretariat. Two minutes later the building shook. We were fifteen kilometres from it and the lights went out and the basement filled with dust. ' +
          'She held my hand. When they let us up, in the afternoon, she said she was going to Grand Central. "Everybody will go to the station," she said. "Somebody has to keep the light on." I went home to my husband. I never saw her again.',
        responses: [{ text: "[Read the steno pad.]", next: "pad" }],
      },
      pad: {
        text: "[The pad is in shorthand. Ilse has transcribed it in the margins, years ago, in pencil, as if she had needed to read it more than once. The last line is not shorthand at all.]",
        responses: [
          {
            text: "[Take the steno pad.]",
            action: () => {
              if (!L.has("ms_note_ilse_steno")) L.give("ms_note_ilse_steno", 1);
              ms.token("booth");
            },
            next: "end",
          },
          {
            text: "[Leave it where it belongs.]",
            action: () => {
              L.setFlag("ms_steno_left");
            },
            next: "end",
          },
        ],
      },
      end: {
        text: () =>
          "Hale will tell you the Continuity is the government. The man who walked out at eight-thirty was the government too. [She smooths the empty chair.] Find her, Mr. " +
          last() +
          ". Or find out. One of those.",
        onEnter() {
          L.xp(60, "Booth Four");
          if (
            Q.isActive("mq08") &&
            (stage("mq08") === "steno" || stage("mq08") === "booth")
          )
            Q.complete("mq08");
        },
        responses: [{ text: "Thank you, Ilse." }],
      },
    });
  // Maniacs in the public gallery when Booth Four is reached.
  function spawnGalleryManiacs() {
    const b = ms.resolve(P.booth());
    if (!b) return;
    for (let i = 0; i < 3; i++) {
      const id = "ms_un_maniac_" + i;
      if (L.flag("dead_" + id)) continue;
      const a = (i / 3) * Math.PI * 2;
      L.spawnNPC({
        id,
        type: "maniac",
        name: "Maniac",
        faction: "maniacs",
        hostile: true,
        ai: "wander",
        level: 5,
        noRespawn: true,
        at: {
          fallback: {
            x: b.x + Math.cos(a) * 9,
            z: b.z + Math.sin(a) * 9,
            y: b.y,
          },
          maxR: 6,
        },
        home: { x: b.x, z: b.z, r: 14 },
      });
    }
  }
  L.trigger({
    id: "ms_booth_maniacs",
    once: false,
    cooldown: 30,
    pos: () => ms.resolve(P.booth()),
    r: 40,
    cond: () =>
      at("mq08", "booth") && L.inInterior() && !L.flag("ms_maniacs_spawned"),
    fire() {
      L.setFlag("ms_maniacs_spawned");
      spawnGalleryManiacs();
    },
  });
  L.trigger({
    id: "ms_booth_reach",
    once: false,
    cooldown: 2,
    pos: () => ms.resolve(P.booth()),
    r: 5,
    cond: () => at("mq08", "booth") && L.inInterior(),
    fire() {
      L.notify(
        "Booth Four. Two chairs, two headsets on a hook, a thermos with a cracked cork. On the desk, a steno pad.",
        { duration: 6 },
      );
    },
  });

  // ------------------------------------------------------------------
  // mq09: Grand Central old-timers
  // ------------------------------------------------------------------
  const OLD = ["gc_doc", "ms_mort", "gc_moe"];
  function oldtimers() {
    return OLD.filter((id) => L.flag("ms_ot_" + id)).length;
  }
  function askedOldTimer(id) {
    if (L.flag("ms_ot_" + id)) return;
    L.setFlag("ms_ot_" + id);
    if (at("mq09", "oldtimers")) {
      if (oldtimers() >= 2) Q.setStage("mq09", "grate");
      else L.refresh("mq09");
    }
  }
  ms.actor({
    id: "ms_mort",
    when: () => Q.isStarted("mq07") || Q.isStarted("mq09"),
    def: {
      type: "human",
      name: "Mort Feldstein",
      gender: "m",
      age: 72,
      hair: "balding",
      hairColor: 0xc9c3b8,
      outfit: "settler",
      glasses: true,
      faction: "settlers",
      hostile: false,
      essential: true,
      ai: "sit",
      home: "here",
      level: 3,
      dialogue: "dlg_ms_mort",
      at: Object.assign({ maxR: 8 }, P.gcMort),
      barks: [
        "Shine? No? Nobody shines anymore.",
        "Fifty-nine I started this stand. Fifty-nine!",
      ],
    },
  });
  ms.dlg("dlg_ms_mort", "idle")
    .when(() =>
      Q.isActive("mq09") &&
      !L.flag("ms_ot_ms_mort") &&
      Q.reached("mq09", "oldtimers")
        ? "mq09"
        : null,
    )
    .add({
      idle: {
        speaker: "Mort Feldstein",
        text: "Mort Feldstein. Shoe shine, since 1959. I had a stand by the Vanderbilt ramp. Now I have a box. The box is a stand if you squint.",
        responses: [{ text: "Take care, Mort." }],
      },
      mq09: {
        speaker: "Mort Feldstein",
        text:
          "The lower level? [He puts down his rag.] I lived down there a year. Everybody did, the first winter. The Sixty-One Camp, we called it, after the old private siding nobody was supposed to know about. It was warm-ish, and it was dark, and there was a lady with candles. " +
          'The Candle Lady. Every kid got one. "For the people who are sleeping," she said. I asked her who was sleeping and she said "everybody I love."',
        responses: [{ text: "What happened to the Camp?", next: "riot" }],
      },
      riot: {
        text: "The OCD set up a Relief Station on the concourse, winter of '68. Penicillin, rations — if you had a card. The fifth of March, the anniversary, there was a riot. Fire. They say it started with one match. [He looks at the floor.] After, they bricked up the stair and wired a grate on it. Nobody's been down since. Nobody wants to.",
        onEnter() {
          askedOldTimer("ms_mort");
        },
        responses: [{ text: "Thank you, Mort." }],
      },
    });
