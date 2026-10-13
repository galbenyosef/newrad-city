// play-inline-579 05 — next
// Lines 1767-2055 of readable/play-inline-579.pretty.js (statement-aligned).
  QX.hook("register", function () {
    const st = () => QX.stage(QID);
    const intercom = () => !QX.flag("c4_bulkhead");
    const D = "Director Brandt",
      DI = "Director Brandt (intercom)";
    QX.dialogue("qx_dlg_brandt", {
      start: () => {
        if (intercom())
          return QX.flag("c4_intercom") ? "intercom2" : "intercom";
        if (QX.done(QID))
          return QX.flag("c4_lied")
            ? "after_lie"
            : QX.flag("c4_outside")
              ? "after_out"
              : "after_lie";
        return QX.flag("met_brandt") ? "again" : "hello";
      },
      nodes: {
        intercom: {
          speaker: DI,
          onEnter: () => {
            QX.setFlag("c4_intercom");
            if (!QX.started(QID))
              QX.radioQuests && QX.radioQuests.startC4(true);
          },
          text: "[Static, then a voice — dry, precise, very tired.] This is Facility Director Brandt, Cryo Unit C-4. Identify yourself. ...Are you from Civil Defense?",
          responses: [
            {
              text: "I heard your distress call. I'm here to help.",
              next: "ic_help",
            },
            { text: "(Lie) Yes. Washington sent me.", next: "ic_vt" },
            { text: "[Say nothing]", end: true },
          ],
        },
        intercom2: {
          speaker: DI,
          text: "You again. The bulkhead is open if you want it to be. I've been talking to walls for a long time. It would be nice to talk to a face.",
          responses: [
            { text: "Open the door.", next: "ic_open" },
            { text: "Not yet.", end: true },
          ],
        },
        ic_help: {
          speaker: DI,
          text: "[A long pause.] Somebody heard. Somebody actually heard. ...Mind the sandbags. I'm opening the bulkhead. Please don't scream when you see me. The last visitor did. He was a shellback.",
          responses: [
            {
              text: "[Enter]",
              next: null,
              end: true,
              action: () => V.openBulkhead(),
            },
          ],
        },
        ic_vt: {
          speaker: DI,
          text: "[The breath catches.] Oh. Oh, thank God. Come in. Come in, please. I'll open the bulkhead. I have... I have a report ready. I've had it ready for a while.",
          responses: [
            {
              text: "[Enter]",
              end: true,
              action: () => {
                QX.setFlag("c4_said_ocd");
                V.openBulkhead();
              },
            },
          ],
        },
        ic_open: {
          speaker: DI,
          text: "Opening.",
          responses: [
            { text: "[Enter]", end: true, action: () => V.openBulkhead() },
          ],
        },

        hello: {
          speaker: D,
          onEnter: () => {
            QX.setFlag("met_brandt");
            if (st() === "inside") QX.setStage(QID, "talk");
          },
          text: () =>
            "[A gaunt, paper-pale woman stands up from a folding chair beside a humming transmitter. She wears a pressed Civil Defense tunic with a Director's bar, buttoned to the throat. Her hair is still pinned in a perfect bun. It is white, and there is not a great deal of it.] " +
            (QX.flag("c4_said_ocd")
              ? "Washington. You came. I knew — I told them you would. "
              : "A visitor. An actual visitor. ") +
            "Josephine Brandt, Facility Director, Cryo Unit C-4. I apologise for the water. And the smell. And the — [she gestures at herself] — this. I'm told it happened slowly. It didn't feel slow.",
          responses: [
            { text: "How long have you been down here?", next: "howlong" },
            { text: "What happened to this place?", next: "what" },
            { text: "Where is everyone?", next: "where" },
          ],
        },
        again: {
          speaker: D,
          text: () =>
            st() === "roll"
              ? "Did you find anything? About my people? I'll wait. I'm good at waiting."
              : "You came back. People don't, as a rule.",
          responses: [
            { text: "About your people...", next: "ask" },
            {
              text: "Tell me about Marcus Abernathy.",
              next: "marcus",
              cond: () => !QX.flag("c4_asked_marcus"),
            },
            {
              text: "What's the passcode for your teletype?",
              next: "pass",
              cond: () => !QX.flag("c4_asked_pass"),
            },
            {
              text: "Have you heard from any other Long Winter unit?",
              next: "c9",
              cond: () => !QX.flag("c4_heard_c9"),
            },
            { text: "I'll be back.", end: true },
          ],
        },
        pass: {
          speaker: D,
          learn: "qx_c4_dir_term",
          onEnter: () => {
            QX.setFlag("c4_asked_pass");
            QX.learnCode("qx_c4_dir_term", "Director Brandt");
          },
          text: "\"Watchkeeper.\" One word. It was a joke, when I chose it. Read whatever you like. There's nothing on it I haven't said to the walls.",
          responses: [{ text: "Thank you.", next: "again" }],
        },
        c9: {
          speaker: D,
          onEnter: () => {
            QX.setFlag("c4_heard_c9");
            QX.setQflag("brandt_heard_calloway");
          },
          text:
            "The transmitter keeps a listening watch on the Civil Defense band. In twenty-two years it has spoken twice. The second time was last month: C-9, under the Municipal Building. A Director Calloway. " +
            "She said one of her sleepers had thawed on a fault and gone up, and that she was going to the U.N. to find out who was reading names on the radio. She sounded like me, twenty years ago. " +
            "[A pause.] I wished her luck. I couldn't send it. The transmitter only goes one way.",
          responses: [
            { text: "Calloway was my Director.", next: "c9b" },
            { text: "Thank you.", next: "again" },
          ],
        },
        c9b: {
          speaker: D,
          text: "Then you know the type. [Almost a smile.] If you find her, tell her C-4 heard. Directors should hear that, once.",
          responses: [{ text: "I will.", next: "again" }],
        },
        howlong: {
          speaker: D,
          text: "The tape says day nine. The tape has said day nine for a very long time. I stopped counting years at some point. I kept counting days. [She nods at the wall. The tile is covered in tally marks.] Eight thousand and twelve.",
          responses: [
            { text: "That's twenty-two years.", next: "what" },
            { text: "Where is everyone?", next: "where" },
          ],
        },
        what: {
          speaker: D,
          text:
            "The bomb fell north of the island and the harbour came in to see what the noise was. The seawall coupling failed on day three. The pumps died on day eight, and the main generator with them, and fifty-eight people asleep in pods had about an hour of cold left. So I thawed them. All of them. Every lid. " +
            "C-4 was the family-unit pilot, you understand: whole households, children too, to see whether a family takes the cold. They took it. They took it better than the building did. " +
            "What you see lit runs off the beacon set's own little generator and a battery bank I ration like communion wine. " +
            "On day nine the pressure door went under and I recorded the message. On day twelve the thawed and my crew voted to go out the freight hatch and take their chances. Fifty-nine for. Two against.",
          responses: [{ text: "Who were the two?", next: "two" }],
        },
        two: {
          speaker: D,
          text: "Me, and Marcus Abernathy — a sleeper, a bus driver from Hoboken. I stayed because somebody had to be here when Civil Defense answered. Marcus stayed because he didn't want to miss the next radio show. He was joking. I think he was joking.",
          responses: [
            { text: "What happened to Marcus?", next: "marcus" },
            { text: "And the fifty-nine?", next: "where" },
          ],
        },
        marcus: {
          speaker: D,
          onEnter: () => {
            QX.setFlag("c4_asked_marcus");
            if (!QX.flag("c4_marcus")) {
              QX.setFlag("c4_marcus");
              QX.refresh(QID);
            }
          },
          text: "Year three. He fell asleep in his chair in front of that radio and he didn't wake up. Two weeks in a pod and he woke up fine; one nap in an armchair and that was that. I left the radio on. He made me promise. The batteries died in year five. I didn't have the heart to tell him. I still haven't.",
          responses: [{ text: "I'm sorry.", next: "where" }],
        },
        where: {
          speaker: D,
          onEnter: () => {
            if (st() === "talk" || st() === "inside") QX.setStage(QID, "roll");
          },
          text: "That's the question, isn't it. They went up the hatch with fourteen days of rations, twenty rifles and one laminated map. I never heard. Not once. The radio only goes one way. [She looks at you, and for a moment she looks every one of her twenty-two years down here.] Do you know? Did they make it?",
          responses: [{ text: "Let me tell you...", next: "ask" }],
        },
        ask: {
          speaker: D,
          text: "Tell me. Whatever it is. I've had a long time to get ready for it.",
          responses: [
            {
              text: "[Give her the Departure Roll] Read the back.",
              cond: () => QX.has("qx_c4_roll"),
              next: "truth",
            },
            {
              id: "c4_persuade",
              text: "Nobody is coming. Civil Defense is gone — it went the day the bombs fell. You did your job. You can stop now.",
              check: { skill: "persuasion", value: 60 },
              next: "speech",
              failNext: "speech_fail",
              cond: () => !QX.flag("c4_speech_failed"),
            },
            {
              text: "(Lie) Washington received your message. Help is on the way. Keep broadcasting.",
              next: "lie",
            },
            { text: "I don't know yet. I'll find out.", next: "notyet" },
          ],
        },
        notyet: {
          speaker: D,
          text: "They went out the freight hatch. If anything was ever left for me, it would be there — the bottom of the shaft. I don't go there. The shellbacks do. [A thin smile.] We have an arrangement. They don't come in, and I don't scream.",
          responses: [{ text: "I'll look.", end: true }],
        },
        truth: {
          speaker: D,
          onEnter: () => QX.setFlag("c4_read_roll"),
          text:
            '[She reads the names first. All of them, slowly, her lips moving. Then she turns it over. "Made it to the Ellis ferry slip, all 59. Took the long way round. We send the kids to the seawall every spring to wave at the hatch. She never comes up. Tell her we\'re alright. — L.B."] ' +
            "...Lorraine Baptiste. Pod twenty-six. She had four children in the pods beside her. She had four children and she came BACK here, to put this down the hatch, and I never... [She holds it against her chest.] All fifty-nine.",
          responses: [
            {
              text: "They made it, Director. You can stop broadcasting.",
              next: "truth2",
            },
          ],
        },
        truth2: {
          speaker: D,
          onEnter: () => V.resolve("truth"),
          text:
            "[She reaches over to the transmitter and, very carefully, as if it might break, flips a switch. The reels stop. The room is suddenly enormous with quiet.] " +
            "Day nine is over. ...Take the key. There's a footlocker behind you with my things in it, and a cryo suit that was never worn. Someone should wear it outside. As for me — I believe I'll go and stand on the seawall. It seems only polite to wave back.",
          responses: [{ text: "I'll see you up there, Director.", end: true }],
        },
        speech: {
          speaker: D,
          onEnter: () => V.resolve("speech"),
          text:
            "[For a long time she doesn't move. Then she laughs — a dry, rattling thing that turns into a cough.] Gone. Of course they're gone. I read the memorandum on day forty; I knew what this site was worth to them. I just — someone had to be the one who stayed awake. " +
            "[She switches the transmitter off.] Take the key. Everything I own is in that footlocker. I'm going to go and look at the sky. I'm told it's a strange colour now. I'd like to see it for myself.",
          responses: [{ text: "Goodbye, Director.", end: true }],
        },
        speech_fail: {
          speaker: D,
          onEnter: () => QX.setFlag("c4_speech_failed"),
          text: "[Her face closes like a pressure door.] You don't know that. You can't know that. I have a DUTY. [She turns back to the transmitter.] If you have something real — something from them — bring it. Otherwise, the bulkhead is where you left it.",
          responses: [{ text: "I'll find something.", end: true }],
        },
        lie: {
          speaker: D,
          onEnter: () => V.resolve("lie"),
          text:
            "[Her whole body loosens, as if a cable holding her upright has been cut.] Help. Help is coming. [She laughs, and wipes her eyes on a pressed sleeve.] I knew it. I KNEW it. I'll keep the beacon on so they can find us. " +
            "Here — the key to my stores. Take what you need for the road. Tell them — tell them C-4 held.",
          responses: [{ text: "I'll tell them.", end: true }],
        },
        after_out: {
          speaker: D,
          text: "Hello again. I've been practising waving. [She demonstrates. It is a very formal wave.] Lorraine's grandchildren came by. Eleven of them. I'm told that is normal for grandchildren. It seems excessive. It was wonderful.",
          responses: [
            { text: "You look well, Director.", next: "after_out2" },
            { text: "Take care.", end: true },
          ],
        },
        after_out2: {
          speaker: D,
          text: "I look like a boiled boot. But it's very kind of you to say. [A pause.] Thank you. For answering. Nobody else did.",
          responses: [{ text: "Goodbye.", end: true }],
        },
        after_lie: {
          speaker: D,
          text: "Any word from Washington? No? They'll be here soon. I've re-recorded the message so they know we're still waiting. Twelfth time. I changed it to day ten. It felt like progress.",
          responses: [{ text: "...Soon.", end: true }],
        },
      },
    });
  });
