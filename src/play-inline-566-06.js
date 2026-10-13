// play-inline-566 06 — responses
// Lines 1629-1945 of readable/play-inline-566.pretty.js (statement-aligned).
  ms.inject("dlg_gc_delphine", {
    start: () => (at("mq09", "delphine") ? "mq09_lower" : null),
    nodes: {
      mq09_lower: {
        speaker: "Stationmaster Okafor",
        text: "The lower level. [Delphine stops walking, which she never does.] Who's been talking? ...Fine. I was eight. My mother and I came down the Vanderbilt stairs the afternoon of the Bombing with four thousand other people, and we stayed a year, down on the deep platforms by the old Track 61 siding. The Sixty-One Camp.",
        responses: [
          {
            text: "Was there a woman down there called Nicole? Nicky?",
            next: "mq09_lady",
          },
        ],
      },
      mq09_lady: {
        text: "We didn't use names much. There was the Candle Lady. She had a box of candles from God knows where and she gave every child one. \"For the people who are sleeping.\" She taught us to sing in the dark so we wouldn't be scared. [A pause.] She had a baby, that winter. I used to mind it. Rock it while she worked. I was eight. I thought it was the most important job in the world.",
        responses: [{ text: "What happened to them?", next: "mq09_after" }],
      },
      mq09_after: {
        text: "There was a riot in '68, on the anniversary, and a fire, and they sealed the stair. After that I don't know. I know what people say. [She looks at you, then away.] Ask the other old-timers. Doc Hollis was down there, he was a student then. Mort, at the shoeshine. Moe ran a soup kettle. And look through the grate, if you have to. I never do.",
        onEnter() {
          if (at("mq09", "delphine")) Q.setStage("mq09", "oldtimers");
        },
        responses: [{ text: "Thank you, Delphine." }],
      },
    },
  });
  ms.inject("dlg_gc_doc", {
    start: () =>
      Q.isActive("mq09") &&
      Q.reached("mq09", "oldtimers") &&
      (!L.flag("ms_ot_gc_doc") || !L.flag("ms_hollis_named"))
        ? "mq09_doc"
        : null,
    nodes: {
      mq09_doc: {
        speaker: "Doc Hollis",
        text: () =>
          L.flag("ms_ot_gc_doc")
            ? "Still on about the Camp? I told you what I saw."
            : "1967. [He takes his glasses off.] I was a third-year at Bellevue when the bombers came. Down there I was the closest thing to a doctor for four thousand people. I delivered nine babies on those platforms. " +
              "One of them I remember. November, a girl, at dawn. On the tracks by the old siding, on a pile of mailbags. The mother laughed the whole time. Laughed. I'd never seen anything like it.",
        onEnter() {
          askedOldTimer("gc_doc");
        },
        responses: [
          {
            text: "[Medicine 30] Breech? Long labour? You'd remember her name, Doc — you'd have written it on the chart.",
            check: { skill: "medicine", value: 30 },
            next: "mq09_name",
            failNext: "mq09_noname",
            cond: () => !L.flag("ms_hollis_named"),
          },
          {
            text: "[Presence 5] Please. Her name.",
            check: { attr: "presence", value: 5 },
            next: "mq09_name",
            failNext: "mq09_noname",
            cond: () => !L.flag("ms_hollis_named"),
          },
          { text: "Thank you, Doc." },
        ],
      },
      mq09_name: {
        text: 'Chart. [A short laugh.] I wrote it on my cuff. ...Nicky. The mother was called Nicky. She made me write the time, too: "at dawn," she said, "write at dawn," like it mattered. [He puts his glasses back on.] It did, I suppose.',
        onEnter() {
          ms.set("hollis_named");
          L.setFlag("ms_hollis_named");
          L.xp(25, "Doc Hollis remembers");
        },
        responses: [{ text: "Thank you, Doc." }],
      },
      mq09_noname: {
        text: "Names. Twenty-two years and four thousand people. I remember the laughing.",
        responses: [{ text: "Thank you, Doc." }],
      },
    },
  });
  ms.inject("dlg_gc_moe", {
    start: () =>
      Q.isActive("mq09") &&
      Q.reached("mq09", "oldtimers") &&
      !L.flag("ms_ot_gc_moe")
        ? "mq09_moe"
        : null,
    nodes: {
      mq09_moe: {
        speaker: "Moe Kessler",
        text:
          "The Candle Lady? [Moe reaches under the bar and puts down a candle stub, yellow with age, wrapped in a bar napkin.] Everybody down there had one of hers. I ran a soup kettle by the siding and she'd come by every night, light one off the burner, and walk off with it into the dark to hand out more. " +
          'She talked funny, French-funny. Called everybody "chéri." Called me "chéri." Nobody called me that before or since.',
        onEnter() {
          askedOldTimer("gc_moe");
        },
        responses: [{ text: "You kept the candle.", next: "mq09_kept" }],
      },
      mq09_kept: {
        text: "Never lit it. Felt like somebody else's to light. [He puts it away again.] Whatever you're looking for, pal, I hope it's still there.",
        responses: [{ text: "Thanks, Moe." }],
      },
    },
  });
  ms.inject("dlg_bs_lys", {
    start: () =>
      Q.isActive("mq09") && !L.flag("ms_lys_met") ? "mq09_lys" : null,
    nodes: {
      mq09_lys: {
        speaker: "Mademoiselle Lys",
        text: "[A woman in a good coat, out of place and comfortable with it, sits at the Whistle Stop with a typewriter and a sign: LETTERS WRITTEN, ANY LANGUAGE.] Sit down, monsieur. You are looking at me as if you know my face. It is the other way round. I know yours. From a photograph.",
        responses: [
          { text: "What photograph?", next: "mq09_lys2" },
          { text: "Another time." },
        ],
      },
      mq09_lys2: {
        text: "Another time, as you say. [She rolls a fresh sheet into the typewriter.] I write letters for people who cannot. If you ever want to write one to someone who will not answer, I am here every day. That is the whole business of this station, you know. Letters to people who will not answer.",
        onEnter() {
          ms.set("lys_met");
          L.setFlag("ms_lys_met");
        },
        responses: [{ text: "I'll remember." }],
      },
    },
  });
  ms.spot({
    id: "ms_spot_grate",
    label: "Sealed stair (grate)",
    verb: "Look through",
    when: () => Q.isStarted("mq09"),
    at: P.gcStair,
    use() {
      if (!L.has("ms_note_gc_grate")) L.give("ms_note_gc_grate", 1);
      L.notify(
        "Through the grate: a wall of melted candles at the first landing, years deep, and above it a sun with twelve rays in chalk. The chalk is fresh. A notice is wired to the bars: LOWER LEVEL CLOSED BY ORDER OF THE OCD. RELIEF STATION RIOT, 5 MARCH 1968.",
        { duration: 9 },
      );
      L.setFlag("ms_grate_seen");
      if (at("mq09", "grate")) {
        L.xp(30, "The sealed stair");
        Q.complete("mq09");
      }
    },
  });
  ms.spot({
    id: "ms_spot_gallery_act1",
    label: "Whispering Gallery corner",
    verb: "Stand in the corner",
    when: () => Q.isStarted("mq02") && !L.flag("ms_gallery_memory"),
    at: P.gcGallery,
    use() {
      L.ms.galleryMemory && L.ms.galleryMemory();
    },
  });

  // ------------------------------------------------------------------
  // mq10: the reply, the cathedral, the Dawn Hour
  // ------------------------------------------------------------------
  ms.inject("dlg_rc_rocky", {
    start: () =>
      at("mq10", "reply")
        ? "mq10_reply"
        : at("mq10", "compare")
          ? "mq10_compare"
          : null,
    nodes: {
      mq10_reply: {
        speaker: '"Rocky" Delgado',
        text: 'Popsicle! You got mail. Somebody slid this under the stage door at five in the morning, and Rockette-7 says the somebody was wearing a bedsheet. [He holds up an envelope by one corner, like it might go off.] It\'s addressed "For the sleeper, c/o Radio Free Manhattan." Smells like a church.',
        responses: [
          {
            text: "[Take the envelope.]",
            action: () => {
              if (!L.has("ms_note_dawn_reply")) L.give("ms_note_dawn_reply", 1);
              if (at("mq10", "reply")) Q.setStage("mq10", "compare");
            },
            next: "mq10_compare",
          },
        ],
      },
      mq10_compare: {
        speaker: '"Rocky" Delgado',
        text: "Well? Open it. I'm dying here. I'm a professional and I'm dying.",
        responses: [
          {
            text: "[Hold the seal next to Nicole's letters.]",
            next: "mq10_match",
          },
        ],
      },
      mq10_match: {
        text:
          "[Three words inside: Stop looking. She is in the Light. You lay the wax seal beside the signature on Nicole's letters. The same sun. Twelve rays. The same short ray at four o'clock where her pen always skipped. Somebody carved her doodle into a stamp.] " +
          "...Pal, you're white as a sheet. Who's \"she\"? ...That sun. That's the Glowkeepers' sun. The cathedral crowd, St. Patrick's, Fifth Avenue. Every morning at five forty-seven their pirate show steps on my signal, a lady reading scripture. The Dawn Hour.",
        onEnter() {
          L.setFlag("ms_seal_matched");
          if (at("mq10", "compare")) Q.setStage("mq10", "cathedral");
        },
        responses: [
          { text: "Then I'm going to the cathedral.", next: "mq10_go" },
        ],
      },
      mq10_go: {
        text: "Then go careful. They're nice. That's what bothers me. ...And Popsicle? Flint's been hanging around the lobby all morning pretending she's not waiting for you. She's waiting for you.",
        responses: [{ text: "Thanks, Rocky." }],
      },
    },
  });
  ms.inject("dlg_glow_ezra", {
    start: () =>
      at("mq10", "keeper") || at("mq10", "cathedral") ? "mq10_keeper" : null,
    nodes: {
      mq10_keeper: {
        speaker: "Keeper Ezra Hollowell",
        text: "[A tall, stooped man in grey robes, a sun disc on his chest, a voice built for a bigger room.] The sleeper. Welcome to the Cathedral of the Second Sun. We have been told to expect you, and here you are, which is the nicest kind of prophecy. What do you seek in the Light?",
        onEnter() {
          if (at("mq10", "cathedral")) Q.setStage("mq10", "keeper");
        },
        responses: [
          {
            text: "[Show him the reply.] Someone in your church sent me this. With her seal.",
            next: "mq10_seal",
          },
        ],
      },
      mq10_seal: {
        text: "[He looks at the seal and something passes over his face and is gone.] We do not keep the old names, friend. When we come into the Light, the name we had goes under a stone, and we take a new one. Whoever you are looking for is not here. Not under that name.",
        responses: [
          {
            text: "[Persuasion 40] Then tell me who wrote it.",
            check: { skill: "persuasion", value: 40 },
            next: "mq10_dawn",
            failNext: "mq10_nodawn",
            cond: () => !L.flag("ms_dawn_wrote_letter"),
          },
          {
            text: "[Threaten him.] You'll tell me where she is, Keeper, or I'll take this church apart.",
            next: "mq10_threat",
          },
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_dawn: {
        text: "[A long breath.] The Dawn herself. She leads us. She does not come up into the daylight, and she does not write to anyone. She wrote to you. [He hands the letter back very carefully.] I do not know why. I would like to.",
        onEnter() {
          ms.set("dawn_wrote_letter");
          L.setFlag("ms_dawn_wrote_letter");
          L.xp(30, "Persuasion: the Dawn");
        },
        responses: [
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_nodawn: {
        text: "Words come from the Light, friend. The Light uses many hands. [He smiles. It does not reach his eyes.]",
        responses: [
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_threat: {
        text: "[The acolytes along the nave stand up, all at once.] We have been threatened by better-armed men than you, sleeper, and by the sky itself. [Quietly.] We will remember that you asked this way.",
        onEnter() {
          ms.set("glow_wary");
          L.setFlag("ms_glow_wary");
          L.standing(-15, "Threatened the Keeper");
        },
        responses: [
          { text: "What do I have to do to be heard?", next: "mq10_service" },
        ],
      },
      mq10_service: {
        text: "Serve the Light, and the Light may turn its face toward you. I have a small service in mind — a blessing, for the water of Grand Central. When the time comes, I will ask it of you. Speak to Sister Noonday. She will give you the Dawn's words to read until then.",
        responses: [
          {
            text: "I'll do your service.",
            action: () => {
              ms.set("glow_service");
              L.setFlag("ms_glow_service");
            },
            next: "mq10_noon",
          },
          { text: "We'll see.", next: "mq10_noon" },
        ],
      },
      mq10_noon: {
        text: "Go in the Light, sleeper. A dimanche.",
        onEnter() {
          if (at("mq10", "keeper")) Q.setStage("mq10", "dawnhour");
        },
        responses: [{ text: "[A dimanche. She used to say that.]" }],
      },
    },
  });
  ms.inject("dlg_glow_sister", {
    start: () =>
      Q.isActive("mq10") &&
      Q.reached("mq10", "keeper") &&
      !L.has("ms_note_dawn_hour_1")
        ? "mq10_noonday"
        : null,
    nodes: {
      mq10_noonday: {
        speaker: "Sister Noonday",
        text: "[A round-faced woman with flour on her robes and a candle burning in a jar at her elbow.] You want the Dawn's words? We print them. Every morning, five forty-seven, she speaks, and by noon we have it on paper for the ones who sleep through. Here — last Sunday's. It's a good one. It's about keeping.",
        onEnter() {
          if (!L.has("ms_note_dawn_hour_1")) L.give("ms_note_dawn_hour_1", 1);
        },
        responses: [{ text: "Thank you, Sister." }],
      },
    },
  });
  // The Dawn Hour itself: tune in any morning at 05:47 (game time) while the stage is open.
  function dawnHourHeard(how) {
    if (!at("mq10", "dawnhour")) return;
    L.setFlag("ms_dawn_hour_heard", how);
    L.xp(40, "The Dawn Hour");
    Q.complete("mq10");
  }
  let dhT = 0;
