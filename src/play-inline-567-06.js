// play-inline-567 06 — next
// Lines 1224-1571 of readable/play-inline-567.pretty.js (statement-aligned).
  RUBY.add({
    idle: {
      speaker: "Ruby Kehoe",
      text: () =>
        Q.isComplete("mq14")
          ? "Ruby Kehoe, coats. You'll want something warmer than that suit, sleeper. It's still winter, whatever the calendar says."
          : "Mm?",
      responses: [{ text: "Take care, Ruby." }],
    },
    held: {
      speaker: "Ruby Kehoe",
      text:
        "[A grey-haired woman in her sixties sits on an upturned bucket in a locked linen room, a tape measure still round her neck. She looks at you through the wire glass in the door.] " +
        "If you're the Continuity, I've told you everything twice. If you're not, you've a funny way of knocking.",
      responses: [
        { text: "Thimble sent me. I'm getting you out.", next: "held2" },
        { text: "Hang on. I'll be back." },
      ],
    },
    held2: {
      speaker: "Ruby Kehoe",
      text: "Thimble. God love her. [She gets up.] The door's locked, the key's on the sergeant's belt, and the sergeant has a temper. How quiet can you be?",
      responses: [
        {
          text: "[Mechanics 35] Pick the lock. Quietly.",
          check: { skill: "mechanics", value: 35 },
          next: "free_quiet",
          failNext: "pick_fail",
        },
        {
          text: "[Stealth 40] Lift the key off the sergeant's belt.",
          check: { skill: "stealth", value: 40 },
          next: "free_quiet",
          failNext: "lift_fail",
        },
        { text: "[Shoot the lock off.]", next: "free_loud" },
        { text: "Hang on. I'll be back." },
      ],
    },
    pick_fail: {
      text: "[The pick snaps off in the lock with a ping that sounds very loud in the corridor.] ...That'll be a no, then.",
      responses: [
        { text: "[Shoot the lock off.]", next: "free_loud" },
        { text: "I'll find another way." },
      ],
    },
    lift_fail: {
      text: "[The sergeant turns round just as your hand gets there. You turn it into a friendly pat on the back. He looks at you like a man who will remember your face.]",
      responses: [
        { text: "[Shoot the lock off.]", next: "free_loud" },
        { text: "I'll find another way." },
      ],
    },
    free_quiet: {
      text: "[The door swings open without a sound.] Not bad for a man with frost in his eyebrows. [She steps out, rubbing her wrists.]",
      onEnter() {
        freeRuby(false);
      },
      responses: [{ text: "Are you hurt?", next: "freed" }],
    },
    free_loud: {
      text: "[Two shots, a great many splinters, and every boot on the floor turns your way.] Well. They know now. [Ruby is already out of the door, tape measure flying.]",
      onEnter() {
        freeRuby(true);
      },
      responses: [{ text: "Move!", next: "freed" }],
    },
    freed: {
      speaker: "Ruby Kehoe",
      text:
        "I've had worse fittings. Listen: they questioned me with a file. A fat old thing, OCD stamps all over it, with my pass clipped to the front. The pass I found. The lieutenant left it on the table by the door when the noise started. " +
        "If you want to know about your Nicole Mead, it's in there. I couldn't read most of it. They wouldn't let me.",
      responses: [{ text: "I'll get it." }],
    },
    wait_jammer: {
      speaker: "Ruby Kehoe",
      text: () =>
        "Go and shut that racket on the roof up first, the thing that hums. I'll keep. Nobody looks for a seamstress in a linen room." +
        (L.has("ms_note_file_mead_1968")
          ? " And read that file while you're at it. I know you're dying to."
          : " And the file they questioned me with is on the table by the door. Take it."),
      responses: [{ text: "Back soon." }],
    },
    file_have: {
      speaker: "Ruby Kehoe",
      text: "You've got it. Read it, then. I'll wait. I've waited in worse places than a hotel.",
      responses: [
        { text: "[Read the file here.]", next: "file_read" },
        { text: "Later." },
      ],
    },
    file_read: {
      speaker: "File 68-0305",
      text: () => {
        const d =
          G.items && G.items.get && G.items.get("ms_note_file_mead_1968");
        return d && d.text
          ? d.text
          : "MEAD, NICOLE: WANTED, arson, 12 dead; child MEAD, ROSE (unenrolled); both PRESUMED DEAD.";
      },
      onEnter() {
        fileRead();
      },
      responses: [{ text: "[Close the folder.]", next: "pass" }],
    },
    pass: {
      speaker: "Ruby Kehoe",
      text: "[Ruby looks at the pass clipped to the front of the folder: the young woman trying not to laugh at the photographer.] That's my reward you're holding. Not that they paid it. ...You knew her. You've got the look.",
      responses: [
        { text: "I'm keeping it. It was hers.", next: "pass_keep" },
        {
          text: "Here's fifty scrip for it. Fair's fair.",
          cond: () => L.scrip() >= 50,
          next: "pass_buy",
        },
        { text: "It's yours. You found it.", next: "pass_ruby" },
      ],
    },
    pass_keep: {
      speaker: "Ruby Kehoe",
      text: '[She shrugs.] Keep it, then. Coats come with all sorts in the linings. ...She was kind to me, you know. In \'68. Baby crying, her hand wrapped up in rags, and she called me "chérie". Nobody has, before or since.',
      onEnter() {
        passTo("keep");
      },
      responses: [{ text: "Get home safe, Ruby." }],
    },
    pass_buy: {
      speaker: "Ruby Kehoe",
      text: "[She folds the scrip into her tape-measure case.] Pleasure. Keep it somewhere dry; paper doesn't last out here. ...She was kind to me, you know. In '68. Called me \"chérie\".",
      onEnter() {
        passTo("buy");
      },
      responses: [{ text: "Get home safe, Ruby." }],
    },
    pass_ruby: {
      speaker: "Ruby Kehoe",
      text: "[She turns the pass over and over in her burned fingers.] I'll sew it back in the coat. Seems right. ...She was kind to me, you know. In '68.",
      onEnter() {
        passTo("ruby");
      },
      responses: [{ text: "Get home safe, Ruby." }],
    },
  });

  L.hook("spawn", function () {
    if (Q.isComplete("mq14") && !L.flag("ms_ruby_home"))
      L.setFlag("ms_ruby_home");
  });
  L.hook("init", function () {
    ms.quest({
      id: "mq14",
      giver: "Rocky / Ruby Kehoe's apprentice",
      location:
        "The Waldorf-Astoria (Continuity forward post); the Neon market",
      desc: () =>
        "The Continuity post in the Waldorf jams Rocky's broadcasts, and it has arrested Ruby Kehoe, a Neon seamstress who tried to claim a reward with Nicole's 1967 UN pass, found in the lining of a green coat." +
        (ms.f("file_1968_read")
          ? " The Continuity's 1968 file: MEAD, NICOLE: WANTED, arson, 12 dead; child MEAD, ROSE (unenrolled); both PRESUMED DEAD."
          : ""),
      stages: [
        {
          id: "ruby_story",
          text: "Hear Ruby Kehoe's story at her coat stall in the Neon market.",
          markers: npcOr("ms_thimble", "Ruby's stall (Thimble)", P.market),
          onEnter() {
            L.later(2, () =>
              L.news(
                "Rocky here, and if I sound like I'm talking through a sock, blame the Waldorf. The Continuity's got something on that roof eating my signal every night. " +
                  "And while I'm complaining: they picked up Ruby Kehoe, the coat lady from the Neon market. Her girl Thimble's asking everybody for help. Somebody help the kid.",
              ),
            );
          },
        },
        ms.proxy("mq14", "pmid_q_deadair", {
          id: "jammer",
          text: "Get into the Waldorf-Astoria and silence the Continuity's jamming array on the roof.",
          next: "ruby",
          reach: {
            site: P.waldorf.site,
            anchors: P.waldorf.anchors,
            fallback: P.waldorf.fallback,
            label: "Waldorf-Astoria",
            r: 14,
          },
          onDone() {
            if (L.flag("pmid_jammer_off") || Q.isComplete("pmid_q_deadair"))
              ms.set("waldorf_jammer_down");
          },
        }),
        {
          id: "ruby",
          text: "Free Ruby Kehoe from the Continuity's holding room in the Waldorf, quietly or loudly.",
          onEnter() {
            L.later(0.3, () => {
              if (ms.f("ruby_free") && at("mq14", "ruby"))
                Q.setStage("mq14", "file");
            });
          },
          markers: npcOr("ms_ruby", "Ruby Kehoe", P.rubyCell),
        },
        {
          id: "file",
          text: () =>
            L.has("ms_note_file_mead_1968")
              ? "Read the Continuity's 1968 file (goggles → NOTES), or read it beside Ruby."
              : "Take the Continuity's 1968 file from the table by Ruby's room.",
          onEnter() {
            L.later(0.3, () => {
              if (ms.f("file_1968_read") && at("mq14", "file"))
                Q.setStage("mq14", "pass");
            });
          },
          markers: () => {
            const pk = L.pickups.ms_file_1968;
            return pk && pk.pos && !L.has("ms_note_file_mead_1968")
              ? [
                  {
                    x: pk.pos.x,
                    z: pk.pos.z,
                    y: pk.pos.y,
                    label: "File 68-0305",
                  },
                ]
              : [{ npc: "ms_ruby", label: "Ruby Kehoe" }];
          },
        },
        {
          id: "pass",
          text: "Talk to Ruby about Nicole's UN pass.",
          markers: () => [{ npc: "ms_ruby", label: "Ruby Kehoe" }],
        },
        {
          id: "m61",
          text: "(Optional) Find the welded M-61 freight elevator in the Waldorf's service core.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.reached("mq14", "jammer"),
          doneIf: () => !!ms.f("m61_seen"),
          markers: spotMark("ms_spot_m61", "M-61 Freight Elevator"),
        },
      ],
      rewards: { xp: 420, scrip: 80 },
      onComplete() {
        if (L.flag("pmid_jammer_off")) ms.set("waldorf_jammer_down");
      },
    });
  });
  ms.solver("mq14", {
    ruby_story() {
      heardStory();
    },
    jammer() {
      if (Q.get("pmid_q_deadair")) {
        L.setFlag("pmid_jammer_off", true);
        ms.set("waldorf_jammer_down");
        if (!Q.isStarted("pmid_q_deadair")) Q.start("pmid_q_deadair");
        Q.complete("pmid_q_deadair");
      } else Q.setStage("mq14", "ruby");
    },
    ruby() {
      freeRuby(false);
    },
    file() {
      if (!L.has("ms_note_file_mead_1968")) L.give("ms_note_file_mead_1968", 1);
      fileRead();
    },
    pass() {
      passTo("keep");
    },
  });

  // ==================================================================
  // mq15 — SEPT MEANS SEVEN (sq_bureau_sept, 52_french_spies.js)
  // ==================================================================
  L.hook("init", function () {
    ms.quest({
      id: "mq15",
      giver: "Mademoiselle Lys",
      location:
        "Grand Central (the Whistle Stop); Washington Square; Lexington & 47th; Battery Park pier",
      desc: () =>
        "Lys, a French agent posing as a letter-writer at the Whistle Stop, knew Nicole in 1966. She will tell " +
        first() +
        " what she knows if he empties her dead drop and reads the Continuity's signals cabinet. " +
        'Her Bureau\'s question is "who gave the order?"' +
        (L.flag("ms_lumiere_told")
          ? " In the Bureau's files Nicole is a source: LUMIERE. She never knew."
          : "") +
        (ms.f("attribution_on_liberty")
          ? " The sealed attribution file is kept on Liberty Island."
          : ""),
      stages: [
        ms.proxy("mq15", "sq_bureau_sept", {
          id: "bureau",
          text: "Talk to Mademoiselle Lys at the Whistle Stop bar in Grand Central.",
          next: null,
          markers: () => [
            {
              npc: "bs_lys",
              label: "Mademoiselle Lys",
              x: P.lys.fallback.x,
              z: P.lys.fallback.z,
            },
          ],
          onDone() {
            const o = L.flag("bs_outcome");
            if (o && !ms.f("bureau"))
              ms.set(
                "bureau",
                o === "exposed" ? "expose" : o === "left" ? "leave" : "sell",
              );
            if (o === "exposed") ms.set("codebook_on_liberty");
          },
        }),
        {
          id: "lumiere",
          text: "(Optional) Ask Lys how she knew Nicole.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("bs_photo_given") &&
            !L.flag("bs_outcome") &&
            !!L.flag("bs_relay_read"),
          doneIf: () => !!L.flag("ms_lumiere_told"),
          markers: () => [{ npc: "bs_lys", label: "Mademoiselle Lys" }],
        },
      ],
      rewards: { xp: 420 },
    });
  });
  ms.solver("mq15", {
    bureau() {
      if (Q.get("sq_bureau_sept") && G.quests.debug.spies)
        G.quests.debug.spies("sell");
      else if (Q.get("sq_bureau_sept")) {
        if (!Q.isStarted("sq_bureau_sept")) Q.start("sq_bureau_sept");
        Q.complete("sq_bureau_sept");
      } else Q.complete("mq15");
    },
  });

  // ==================================================================
  // mq16 — TEN DAYS IN THE MADHOUSE (pr_tendays, poi_roosevelt)
  // ==================================================================
  function nellMirror() {
    if (!L.flag("ms_nell")) L.setFlag("ms_nell", "broadcast");
    if (L.flag("ms_nell") === "kept" && !ms.hasToken("nell")) ms.token("nell");
  }
