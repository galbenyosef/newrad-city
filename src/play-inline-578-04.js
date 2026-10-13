// play-inline-578 04 — next
// Lines 979-1398 of readable/play-inline-578.pretty.js (statement-aligned).
  QX.hook("register", function () {
    // ------------------------------------------------------------ Static Okonkwo
    const nst = () => QX.stage(NUM);
    QX.dialogue("qx_dlg_sparks", {
      start: () => {
        if (QX.done(NUM)) return "after";
        const s = nst();
        if (s === "decode" && QX.has("qx_cipher_sheet")) return "gotpad";
        if (s === "choose") return "choose";
        if (s === "pad") return "padprog";
        if (QX.has("qx_cipher_sheet")) return "gotpad";
        return QX.flag("met_sparks") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Static Okonkwo",
          onEnter: () => QX.setFlag("met_sparks"),
          text:
            '[She holds up one finger without looking at you. A chime drifts out of the headphones around her neck, then a woman\'s voice: "...Nine. Nine. Two. Seven..." She writes it down.] ' +
            "Sorry. Group two. You don't interrupt group two. Static Okonkwo. Radios, repairs, and a strong professional interest in things that are none of my business.",
          responses: [
            { text: "What are you listening to?", next: "what" },
            {
              text: "I picked up that numbers station on my goggles.",
              next: "what",
              cond: () => QX.started(NUM),
            },
            { text: "What do you have for sale?", barter: true },
            { text: "I'll leave you to it.", end: true },
          ],
        },
        again: {
          speaker: "Static Okonkwo",
          text: "Back again? Station's still reading. Station's always reading.",
          responses: [
            { text: "Tell me about the numbers again.", next: "what" },
            { text: "What do you have for sale?", barter: true },
            { text: "Later.", end: true },
          ],
        },
        what: {
          speaker: "Static Okonkwo",
          text:
            "Ninety-three point nine. A numbers station. Chime, a voice reading five-digit groups, a line of Morse, then it starts over. " +
            "I've been writing it down for six years. Twelve notebooks. It's the Continuity — the chime is the first bar of \"Hail, Columbia\", slowed down to a crawl. Somebody's idea of a joke.",
          responses: [
            { text: "What do the numbers mean?", next: "otp" },
            { text: "And the Morse?", next: "morse" },
          ],
        },
        morse: {
          speaker: "Static Okonkwo",
          text:
            "Z. MARLOW. LIBERTY. Every time. \"Z\" is a priority prefix: I think it means somebody they're holding. Liberty's the island. Marlow's a name. " +
            "And twice a week, after the groups, a man reads names. Just surnames and an initial, like a school register. I can't tell you what list they come off without the key.",
          responses: [{ text: "What key?", next: "otp" }],
        },
        otp: {
          speaker: "Static Okonkwo",
          text:
            "One-time pad. Unbreakable, if you use it right. Which the Continuity does, mostly — they still think it's 1967 and the Reds are listening. Sheets of random numbers; add the sheet to the message and it's gibberish to everybody without the sheet. " +
            "Here's the thing — they don't radio the pads. Too smart for that. They walk them in. A courier in a grey overcoat and two Sky-Eye drones, once a month, up Lexington to the U.N.",
          responses: [{ text: '"Once a month"?', next: "courier" }],
        },
        courier: {
          speaker: "Static Okonkwo",
          text:
            "Last month he never came back down. His drones are still up by Fortieth Street, going around and around like a pair of dogs at a grave. " +
            "Somebody who wasn't me could go and look in his satchel. Somebody with a gun. And shoes.",
          responses: [
            {
              text: "I'll get you the pad.",
              next: "accept",
              cond: () => QX.mainOpen(NUM),
            },
            {
              id: "sparks_why",
              text: "Why do you care what the Continuity is saying?",
              next: "why",
            },
            {
              id: "sparks_pay",
              text: "What's in it for me?",
              check: { skill: "trade", value: 35 },
              next: "pay",
              failNext: "pay_fail",
              cond: () => !QX.flag("sparks_pay") && QX.mainOpen(NUM),
            },
            { text: "Not my business. Not yet.", end: true },
          ],
        },
        why: {
          speaker: "Static Okonkwo",
          text:
            "Because they're listening to US. Every Sky-Eye on every corner is a microphone with a speaker glued on so you don't notice. " +
            "Six years I've heard them talk, and I've never once heard them say anything nice. Also — [she taps a notebook] — group three changed three weeks ago. Right about when somebody walked out of the Municipal Building who hadn't walked anywhere since 1967.",
          responses: [
            {
              text: "I'll get you the pad.",
              next: "accept",
              cond: () => QX.mainOpen(NUM),
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        pay: {
          speaker: "Static Okonkwo",
          onEnter: () => QX.setFlag("sparks_pay"),
          text: "Scrip, a cut of whatever's in his bag, and a real discount on anything I sell. You drive a bargain like a man with a jammed transmission. Deal.",
          responses: [{ text: "Deal.", next: "accept" }],
        },
        pay_fail: {
          speaker: "Static Okonkwo",
          text: "What's in it for you is knowing. Knowing is free. Knowing is also the most expensive thing in this city. Think about that on your way up Lexington.",
          responses: [
            { text: "Fine. I'll get the pad.", next: "accept" },
            { text: "Pass.", end: true },
          ],
        },
        accept: {
          speaker: "Static Okonkwo",
          onEnter: () => {
            if (!QX.started(NUM)) QX.start(NUM, { stage: "pad" });
            else if (nst() === "sparks") QX.setStage(NUM, "pad");
          },
          text: "Fortieth and Lex. Watch the drones — they're old but they're Continuity, which means they'll shoot first and file a form about it after. If you can get the bag without cracking them open, even better. Nobody comes looking for drones that don't call in dead.",
          responses: [{ text: "On my way.", end: true }],
        },
        padprog: {
          speaker: "Static Okonkwo",
          text: "Fortieth and Lex. Grey coat, satchel, two Sky-Eyes doing laps. Bring me the pad and we'll find out what the Continuity thinks about at night.",
          responses: [
            { text: "What do you have for sale?", barter: true },
            { text: "On it.", end: true },
          ],
        },
        gotpad: {
          speaker: "Static Okonkwo",
          text:
            "[She takes the rice-paper sheet with two fingers, like it's hot.] Sheet fourteen. \"Don't forget to eat this after reading.\" ...He didn't eat it. Bless the civil service. " +
            "Give me a minute. [She lays the sheet over her notebook, runs a pencil down the columns, subtracts under her breath. The pencil stops.]",
          responses: [
            {
              text: "What does it say?",
              next: "decoded",
              action: () => N.decode(),
            },
          ],
        },
        decoded: {
          speaker: "Static Okonkwo",
          text: () =>
            "Group one's a resupply window for Liberty Island. Group two's the Sky-Eye relay net. They rotate frequencies every Tuesday. Group three is the names. " +
            '[She reads it twice, then reads it out, flat, like the man on the radio.] "WAYTE, E. FILE C-9/WAYTE. PRIORITY ASSET. RECOVER WITH THE KEY." In plain text, like somebody couldn\'t help himself: "Walking around Manhattan in a cryo suit." ' +
            '"MEAD, N. STRUCK, 1968."' +
            (QX.qflag("con_knows_nicole")
              ? ' And a new line under it: "FILE REOPENED 1989. SLEEPER INQUIRING."'
              : "") +
            ' "MEAD, R. UNENROLLED. DIRECTIVE 7-A, SCHEDULE C." In brackets: STERILISE. ' +
            'Last one: "SUN CULT EMISSARY REQUESTS KEY B. REFUSED." [She looks at your suit. She looks at you.] Kid. That first line is you. And I\'d bet my headphones that "Mead, R." is somebody\'s little girl.' +
            (QX.roseNear(18)
              ? " [Behind you, Rose takes the transcript out of Static's hand without asking. She reads her own line twice. She folds the paper very small, gives it back, and says nothing at all.]"
              : ""),
          onEnter: () => {
            QX.msFlag("read_7a_schedule");
            if (QX.roseNear(18)) QX.msFlag("rose_read_schedule_c");
          },
          responses: [
            { text: "Why would the Continuity care about me?", next: "whyme" },
            { text: "What is Schedule C?", next: "sched" },
            { text: "What can we do about it?", next: "choose" },
          ],
        },
        sched: {
          speaker: "Static Okonkwo",
          text:
            "Directive 7-A. They've been reading it out since November: everybody who isn't on the 1967 enrolment rolls, sorted into schedules. Schedule C is the children, " +
            'everyone born since the Bombing, because nobody born since was ever enrolled. "Sterilise" is the word they use. They don\'t say how. They say "the Array" a lot. ' +
            "[She taps the last line.] And somebody in a robe walked up to their front door asking for a key. Funny old year.",
          responses: [
            { text: "Why would the Continuity care about me?", next: "whyme" },
            { text: "What can we do about it?", next: "choose" },
          ],
        },
        whyme: {
          speaker: "Static Okonkwo",
          text:
            "Sleeper file. They're not interested in what you DO, they're interested in what you ARE, and what you carry. A federal volunteer, frozen in '67, thawed in '89, with a key on him they want badly enough to write it down. Whoever signed you into Long Winter made a note somewhere, and the Continuity keeps very good notes. " +
            "That's above my pay grade. What isn't above my pay grade is what we do about it tonight.",
          responses: [{ text: "Go on.", next: "choose" }],
        },
        choose: {
          speaker: "Static Okonkwo",
          text:
            "Three ways I can see. One: I use group two to jam the Sky-Eye relay net, harbour and all. They'll fix it eventually, but for a good while there's not a drone over Liberty that can see you coming. " +
            "Two: we use the pad to talk back. Same cipher, their frequency. We tell them FILE C-9/WAYTE is closed: the sleeper's dead, stop looking. It takes a steady hand. If the groups are wrong, they'll know someone's got the pad. " +
            "Three: you keep the pad. Continuity paper is worth a lot to the right buyer, and we both pretend this never happened.",
          responses: [
            { text: "Jam the relay net.", next: "jam", action: () => N.jam() },
            {
              id: "sparks_fake",
              text: "Let me write the reply. I know how to make a cipher look right.",
              check: { skill: "electronics", value: 55 },
              next: "fake",
              failNext: "fake_fail",
              cond: () => !QX.flag("num_fake_failed"),
            },
            {
              id: "sparks_fake_w",
              text: 'The pad is additive mod ten. We encrypt "FILE C-9/WAYTE CLOSED" in their format, same padding, same prefix.',
              check: { attr: "wits", value: 8 },
              next: "fake",
              failNext: "fake_fail",
              cond: () => !QX.flag("num_fake_failed"),
            },
            {
              text: "I'll keep the pad. Let's leave it alone.",
              next: "keep",
              action: () => N.keep(),
            },
          ],
        },
        jam: {
          speaker: "Static Okonkwo",
          text:
            "[She is already turning dials.] Group two, Tuesday rotation... and... there. [Somewhere up the avenue a drone's recorded announcement turns into a long, sad whistle.] Oh, that's beautiful. That's the prettiest thing I've heard in six years. " +
            "Here — for your trouble. And for the next few hours, walk soft. Nobody's listening.",
          responses: [{ text: "Thanks, Static.", end: true }],
        },
        fake: {
          speaker: "Static Okonkwo",
          onEnter: () => N.fakeDeath(),
          text:
            '[You work it out on the back of her notebook: prefix, groups, padding, the anthem chime. She keys it out over a hand-cranked transmitter, one digit at a time.] ... [Thirty seconds of static. Then, on 93.9, the voice: "Acknowledged. FILE C-9/WAYTE closed."] ' +
            "You just died, kid. Congratulations. Nobody on that island is waiting up for you now.",
          responses: [{ text: "Rest in peace, me.", end: true }],
        },
        fake_fail: {
          speaker: "Static Okonkwo",
          onEnter: () => QX.setFlag("num_fake_failed"),
          text: "[She reads your groups and winces.] No. No — that's a bad group, they'd spot that in a heartbeat. We send that and we've got a Rotorcraft on Lexington by breakfast. Let's not. Jam or leave it?",
          responses: [
            { text: "Jam the relay net.", next: "jam", action: () => N.jam() },
            { text: "Leave it.", next: "keep", action: () => N.keep() },
          ],
        },
        keep: {
          speaker: "Static Okonkwo",
          text: "Your call. Your file. Your pad. [She hands the rice paper back with two fingers.] Somebody in this city will pay for that. If you change your mind, I'll be here. Writing down numbers. Forever, apparently.",
          responses: [{ text: "Goodbye, Static.", end: true }],
        },
        after: {
          speaker: "Static Okonkwo",
          text: () =>
            QX.flag("num_jammed")
              ? "Relay net's back up, by the way. They fixed it. But they had to send a Rotorcraft to do it, and I watched it land. I know where they park now."
              : QX.flag("num_ghost")
                ? "Station's reading a new group three. Doesn't mention you. Still mentions Schedule C. [She winks.] Ghost."
                : "Still writing it all down. Somebody has to. They read Schedule C again last night. Same names. One more.",
          responses: [
            { text: "What do you have for sale?", barter: true },
            { text: "See you, Static.", end: true },
          ],
        },
      },
    });

    // ------------------------------------------------------------ Harlan Pruitt
    const bst = () => QX.stage(BELL);
    QX.dialogue("qx_dlg_harlan", {
      start: () => {
        if (QX.done(BELL) || QX.flag("bell_how") === "betty_fell")
          return "after";
        if (bst() === "gc" || QX.flag("bell_freed")) return "thanks";
        return QX.flag("met_harlan") ? "again" : "hello";
      },
      nodes: {
        hello: {
          speaker: "Harlan Pruitt",
          onEnter: () => {
            QX.setFlag("met_harlan");
            if (!QX.started(BELL)) R.startBell();
          },
          text:
            "[A big, sun-browned man in a torn duster, chained by one ankle to the brass rail of the bell podium. He looks at you, looks past you for raiders, and lowers his voice.] " +
            "You're not one of Betty's. You've got that look — the \"I've bathed this month\" look. Harlan Pruitt, Pruitt and Sons Overland Freight. The sons are in Jersey. The freight is in Betty's pockets. And I am, apparently, for sale.",
          responses: [
            {
              text: "I heard the broadcast. I'm getting you out.",
              next: "how",
            },
            { text: "How much are you worth, exactly?", next: "price" },
            { text: "Good luck with that.", end: true },
          ],
        },
        again: {
          speaker: "Harlan Pruitt",
          text: "Still here. Still chained. Still worth five hundred Scrip, apparently, which is more than I was worth at my wedding.",
          responses: [
            { text: "How do I get you out?", next: "how" },
            { text: "Hang in there.", end: true },
          ],
        },
        price: {
          speaker: "Harlan Pruitt",
          text: "Five hundred, in the drop box on Wall Street. Betty rings the bell on the radio every night and the price goes up. It never actually goes up. She just likes saying it. She's very theatrical, for a woman who eats rats raw.",
          responses: [{ text: "How do I get you out?", next: "how" }],
        },
        how: {
          speaker: "Harlan Pruitt",
          text:
            "Ticker Tate — the pit boss, the one with the shotgun and the ticker tape in his hair — he's got the key. Or you pay the box and Betty lets me walk. " +
            "Or — I don't want to tell you your business — you've got hands. This shackle's older than I am.",
          responses: [
            {
              text: "[Use the shackle key]",
              cond: () => QX.has("qx_shackle_key"),
              next: "freed",
              action: () => B.useKey(),
            },
            {
              id: "harlan_pin",
              text: "Hold still. That hinge pin is rusted half through — one good knock and the cuff falls open.",
              check: { skill: "mechanics", value: 50 },
              next: "pinned",
              failNext: "pin_fail",
              cond: () => !QX.flag("harlan_pin_fail"),
            },
            {
              id: "harlan_str",
              text: "[Wrench the rail out of the podium]",
              check: { attr: "brawn", value: 8 },
              next: "freed",
              failNext: "str_fail",
              cond: () => !QX.flag("harlan_str_fail"),
              action: () => {
                if (QX.attr("brawn") >= 8) B.breakChain();
              },
            },
            { text: "I'll be back with the key, or the Scrip.", end: true },
          ],
        },
        pinned: {
          speaker: "Harlan Pruitt",
          text: "[You set the edge of a brass bell-clapper against the hinge pin and give it one short, honest whack. Harlan holds his breath so hard he goes purple. The pin drops out, the cuff swings open, and nobody upstairs hears a thing.] ...Well, I'll be.",
          responses: [
            { text: "Go. Quietly.", next: "freed", action: () => B.knockPin() },
          ],
        },
        pin_fail: {
          speaker: "Harlan Pruitt",
          onEnter: () => QX.setFlag("harlan_pin_fail"),
          text: "That's — no, you've mushroomed the end of it. It's not coming out now. It's never coming out. Okay. Okay. The key. Get the key.",
          responses: [{ text: "Right. The key.", end: true }],
        },
        str_fail: {
          speaker: "Harlan Pruitt",
          onEnter: () => QX.setFlag("harlan_str_fail"),
          text: "[The rail groans, and holds. Harlan pats your shoulder.] Good effort. Solid effort. They built this place to hold money. It holds.",
          responses: [{ text: "I'll find the key.", end: true }],
        },
        freed: {
          speaker: "Harlan Pruitt",
          text: "[The shackle drops. Harlan rubs his ankle and grins with every tooth he has left.] Grand Central. Find me at Grand Central. I owe you a thing Pruitts never say out loud. Go!",
          responses: [{ text: "Go. I'll see you there.", end: true }],
        },
        thanks: {
          speaker: "Harlan Pruitt",
          text: () =>
            QX.flag("bell_paid")
              ? "There they are! My investor! Five hundred Scrip — " +
                (QX.flag("bell_haggled")
                  ? "three hundred, you haggled ME, I heard — "
                  : "") +
                "I'll pay it back. Not all at once, I'm a Pruitt, but I'll pay it."
              : "There they are! The hero of Wall Street! Six days on that bell and you walked in like it was a Tuesday. Pruitt and Sons owes you, and Pruitts pay.",
          responses: [
            {
              text: "Glad you made it.",
              next: "reward",
              cond: () => bst() === "gc",
            },
            {
              text: "Glad you made it.",
              end: true,
              cond: () => bst() !== "gc",
            },
          ],
        },
        reward: {
          speaker: "Harlan Pruitt",
          onEnter: () => B.reward(),
          text: "Here — Scrip, and a voucher. One favour, redeemable any time, from any Pruitt. And I'm setting up shop right here. Freight, food, ammunition. For you, the good prices. The ones I give my mother.",
          responses: [
            { text: "Let's see what you've got.", barter: true },
            { text: "Take care, Harlan.", end: true },
          ],
        },
        after: {
          speaker: "Harlan Pruitt",
          text: "My favourite customer! Freight, food, ammunition. And one opinion on oxen, free: they're smarter than they look. They'd have to be.",
          responses: [
            { text: "Let's trade.", barter: true },
            { text: "Tell me about the convoy routes.", next: "routes" },
            { text: "Bye, Harlan.", end: true },
          ],
        },
        routes: {
          speaker: "Harlan Pruitt",
          text:
            "Grand Central to the Neon, the Neon to the Village, down Broadway to the bridge if the toll-boys are feeling reasonable. Never the East River at night. " +
            "And never, ever buy a hot dog from a man who won't tell you what's in it. That rules out every hot dog in New York. Hence my figure.",
          responses: [
            { text: "Ha. Let's trade.", barter: true },
            { text: "See you around.", end: true },
          ],
        },
      },
    });
  });
