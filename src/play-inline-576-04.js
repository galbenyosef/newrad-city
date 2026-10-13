// play-inline-576 04 — next
// Lines 781-1295 of readable/play-inline-576.pretty.js (statement-aligned).
  QX.hook("register", function () {
    const st = () => QX.stage(QID);
    const R_BARTER = { text: "What've you got for sale?", barter: true };
    QX.dialogue("qx_dlg_dot", {
      start: () => {
        if (QX.done(QID)) return "after";
        const s = st();
        if (!s) return QX.flag("met_dot") ? "again" : "hello";
        if (s === "ch1_ret") return "ret1";
        if (s === "ch2_ret") return "ret2";
        if (s === "ch3_ret") return "ret3";
        if (s === "ch4_ret") return "ret4";
        if (s === "ch5_ret") return "ret5";
        return "prog";
      },
      nodes: {
        hello: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.setFlag("met_dot");
          },
          text:
            "Oh! A customer! Or a tourist! Or a customer who is ALSO a tourist! You have the look — lost, a little frightened, holding a gun like it might bite you. " +
            "Welcome to Finch's Facts and Fixes: maps, directions, advice and the occasional fix. Mostly zippers. I'm Dot. Dorothea Finch, but nobody's called me Dorothea since the '67 War.",
          responses: [
            {
              text: "I just woke up in a cryo pod under the Municipal Building.",
              next: "sleeper",
            },
            { text: 'What exactly are "Facts"?', next: "facts" },
            R_BARTER,
            { text: "Nice to meet you. Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Dot Finch",
          text: "My favourite potential research assistant! Changed your mind? The future of tourism is holding its breath. Mostly because of the air.",
          responses: [
            { text: "Tell me about the book again.", next: "pitch" },
            R_BARTER,
            { text: "Just passing through.", end: true },
          ],
        },
        sleeper: {
          speaker: "Dot Finch",
          text:
            "A SLEEPER! A real live Long Winter sleeper! Oh, this is perfect. You're exactly my target audience — fresh eyes, soft hands, no idea which way is up. " +
            "Do you know how rare that is? Everyone else in this city was born knowing which puddles are hungry.",
          responses: [{ text: "Target audience for what?", next: "facts" }],
        },
        facts: {
          speaker: "Dot Finch",
          text:
            "My BOOK! The first new book written in New York since the bombs. Probably. Maybe. Nobody's checked. " +
            '"The Big Apple Survival Guide: A Visitor\'s Companion to New Rad City." Because one day the tourists are coming back, and when they do, ' +
            "somebody has to tell them which bagels bite.",
          responses: [
            { text: "And where do I come in?", next: "pitch" },
            { text: "The tourists are not coming back.", next: "cynic" },
          ],
        },
        cynic: {
          speaker: "Dot Finch",
          text: "That's what they said about the pigeons, and look at them now! Three eyes each. Twice the sightseeing.",
          responses: [
            { text: "Fair point. What do you need?", next: "pitch" },
            { text: "I'll pass.", next: "decline" },
          ],
        },
        pitch: {
          speaker: "Dot Finch",
          text:
            "A guidebook needs research. Research needs legs. My legs are lovely, thank you, but they're sort of contractually committed to this stall. " +
            "I need a FIELD RESEARCHER. Five chapters, five little errands. I pay in Scrip, credit in the acknowledgements, and the undying gratitude of future generations.",
          responses: [
            { text: "Sounds fun. Count me in.", next: "accept" },
            { text: "Errands like what?", next: "what" },
            {
              id: "dot_haggle",
              text: "Future generations don't pay rent. Make it worth my while.",
              check: { skill: "persuasion", value: 40 },
              next: "haggle",
              failNext: "haggle_fail",
              cond: () => !QX.flag("dot_haggled"),
            },
            { text: "Not interested.", next: "decline" },
          ],
        },
        what: {
          speaker: "Dot Finch",
          text: "Oh, easy stuff! Sightseeing. Eating. Getting a little radiation. Riding the subway. Meeting some wildlife. Everything a real New Yorker does before lunch!",
          responses: [
            { text: 'Define "a little radiation".', next: "what2" },
            { text: "Alright, I'm in.", next: "accept" },
            { text: "No thanks.", next: "decline" },
          ],
        },
        what2: {
          speaker: "Dot Finch",
          text: "Enough to glow, not enough to glow in the dark. Mostly. It's chapter three. We'll cross that bridge when we get to it. Also there's a bridge in chapter one.",
          responses: [
            { text: "Alright, I'm in.", next: "accept" },
            { text: "No thanks.", next: "decline" },
          ],
        },
        haggle: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.setFlag("dot_haggled");
          },
          text: "...Ooh, you drive a hard bargain. I respect that. It's going in the chapter on haggling. Fine! Half again on every chapter. Don't tell my other researchers. I don't have other researchers.",
          responses: [{ text: "Then we have a deal.", next: "accept" }],
        },
        haggle_fail: {
          speaker: "Dot Finch",
          text: "Ha! You're funny. That's going in the chapter on humour. Standard rates, sweetie — it's a small press. It's a very small press. It's me and a pencil.",
          responses: [
            { text: "Fine. I'm in.", next: "accept" },
            { text: "Forget it.", next: "decline" },
          ],
        },
        decline: {
          speaker: "Dot Finch",
          text: "That's alright! The offer stands, like the Chrysler Building. Mostly standing. Somewhat leaning. Come back anytime!",
          responses: [{ text: "Goodbye.", end: true }],
        },
        accept: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.accept();
          },
          text:
            "Wonderful! Chapter One: SIGHTS AND SOUNDS. Take my Brightline Pocket Snap — it's a camera, don't make that face — and photograph at least three of our famous landmarks. " +
            "I set up scenic viewpoints with little tripods and everything: the Flatiron, Times Square, the Chrysler Building, the Brooklyn Bridge, and Lady Liberty from Battery Park. " +
            "A few of them might have a teeny raider problem.",
          responses: [
            { text: 'A "teeny" raider problem?', next: "teeny" },
            { text: "I'll be back with pictures.", end: true },
          ],
        },
        teeny: {
          speaker: "Dot Finch",
          text: 'Teeny! Tiny. Some of the raiders are quite large, obviously, but the PROBLEM is teeny. Just smile and say "cheese". Raiders love cheese. Everybody loves cheese. There is no more cheese.',
          responses: [{ text: "Right. Pictures.", end: true }],
        },

        prog: {
          speaker: "Dot Finch",
          text: () => {
            const s = st();
            if (s === "ch1")
              return (
                "How's the photography going? Three landmarks — any three! " +
                (photos() ? "You've got " + photos() + " so far. " : "") +
                "And no thumbs over the lens, please. This city has enough extra digits."
              );
            if (s === "ch2")
              return (
                "Eaten anything local yet? Three different delicacies — coney dogs, pretzels, bagels, egg creams, chowder. Iggy and Mort out front sell most of them. " +
                (eaten() ? "That's " + eaten() + " down!" : "Chew thoroughly.")
              );
            if (s === "ch3")
              return "Still not glowing? Two hundred roentgens, sweetie. Try the river. Or a nice crater. Or lick a car. Actually don't lick a car. Actually — for science — lick one car.";
            if (s === "ch4")
              return "The derailed train is in the 42nd Street station, down past the turnstiles and the Maniacs. Copy the route placard! And pay your fare if you find a token, we're not animals.";
            if (s === "ch5")
              return "The North Woods, top of the park. Big footprints. Bigger owners. Pour the plaster, let it set, back away slowly, then back away quickly.";
            return "Research is going beautifully! I can feel it.";
          },
          responses: [
            {
              id: "dot_lie3",
              text: "(Lie) I'm already glowing. Two hundred roentgens, easy. Look at this rash.",
              check: { skill: "persuasion", value: 60 },
              cond: () => st() === "ch3",
              next: "lie3",
              failNext: "lie3_fail",
            },
            {
              id: "dot_lie5",
              text: "(Lie) The cast broke on the way back. But the footprint was THIS big.",
              check: { skill: "persuasion", value: 70 },
              cond: () => st() === "ch5" && QX.has("qx_plaster"),
              next: "lie5",
              failNext: "lie5_fail",
            },
            {
              id: "dot_med3",
              text: "Radiation destroys bone marrow and the gut lining. This chapter is dangerous advice.",
              check: { skill: "medicine", value: 50 },
              cond: () => st() === "ch3" && !QX.flag("dot_med"),
              next: "med3",
            },
            {
              id: "dot_wits5",
              text: "Wouldn't a photograph of the tracks do?",
              check: { attr: "wits", value: 7 },
              cond: () => st() === "ch5",
              next: "int5",
            },
            R_BARTER,
            { text: "I'm on it.", end: true },
          ],
        },
        lie3: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn3(true);
          },
          text: "Ooh, that IS a rash. That's a beautiful rash. I'll just write \"moderate glow, rash, brave\". Here — half pay for a half-glow. ...What? I'm gullible, not stupid.",
          responses: [{ text: "What's next?", next: "intro4" }],
        },
        lie3_fail: {
          speaker: "Dot Finch",
          text: "That's a mosquito bite, sweetie. I've SEEN radiation sickness. I have a Geiger counter in my purse. It is, admittedly, also my purse.",
          responses: [{ text: "Fine. I'll go get irradiated.", end: true }],
        },
        med3: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.setFlag("dot_med");
            QX.give(PRUSSIAN, 1);
            QX.give(IODINE, 1);
          },
          text: "Oh. Oh, when you say it like THAT. ...Fine. I'll add a very large warning box. With a skull on it. Here, take these — iodine tabs to go in, Prussian Blue to come out. The chapter stays, but now it's RESPONSIBLE.",
          responses: [{ text: "That's all I ask.", end: true }],
        },
        lie5: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn5(true);
          },
          text: "THIS big? Oh my stars. Oh, I believe you, I absolutely believe you. I'll draw it from your description! It'll be the biggest footprint in publishing history. Pass me that plaster, I'm making a model.",
          responses: [{ text: "So the book's finished?", next: "finale" }],
        },
        lie5_fail: {
          speaker: "Dot Finch",
          text: "You still have the plaster, sweetie. It's right there in your pocket, making a little plaster-shaped bulge. Go on. The ripjaws won't bite. They'll crush, mostly.",
          responses: [{ text: "Fine.", end: true }],
        },
        int5: {
          speaker: "Dot Finch",
          text: "Photographs don't show DEPTH! Tourists need to understand depth. Emotionally and literally. Also the camera's out of film. Also I sold the camera. Also I'm going to buy it back.",
          responses: [{ text: "Plaster it is.", end: true }],
        },

        // ---- Chapter I hand-in ----
        ret1: {
          speaker: "Dot Finch",
          text: () =>
            "Let's see, let's see... [She fans out the " +
            photos() +
            " snapshots like a winning poker hand.] Oh, the light! Oh, is that a raider? He's waving! " +
            (photos() >= 5
              ? "And ALL FIVE? You absolute professional."
              : "These are perfect."),
          responses: [
            { text: "[Hand over the photographs.]", next: "done1" },
            {
              id: "dot_ret1_persuade",
              text: "Some of these were taken under fire. That deserves hazard pay.",
              check: { skill: "persuasion", value: 50 },
              next: "ret1_hazard",
              failNext: "ret1_hazard_fail",
            },
            {
              id: "dot_ret1_senses",
              text: "You're holding the Flatiron one upside down.",
              check: { attr: "senses", value: 7 },
              next: "ret1_per",
            },
          ],
        },
        ret1_hazard: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.giveScrip(25);
          },
          text: "Under FIRE? Oh, that's going in a caption. \"Photographed under fire.\" Here — hazard pay. It's small, like the hazard. Hopefully.",
          responses: [{ text: "[Hand over the photographs.]", next: "done1" }],
        },
        ret1_hazard_fail: {
          speaker: "Dot Finch",
          text: "Everything in this city is taken under fire, sweetie. Even breakfast.",
          responses: [{ text: "[Hand over the photographs.]", next: "done1" }],
        },
        ret1_per: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.xp(15, "Keen eye");
          },
          text: "...So I am. Huh. It looked like it was leaning the other way. You know what? It's a triangle. Nobody will notice.",
          responses: [{ text: "[Hand over the photographs.]", next: "done1" }],
        },
        done1: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn1();
          },
          text:
            'Chapter One is WRITTEN! "Bring a camera, and a second camera for when the first one is eaten." Here\'s your pay. Now — Chapter Two: LOCAL CUISINE! ' +
            "A city is its food. I want you to eat three different New York delicacies. Coney dogs, pretzels, bagels, egg creams, the chowder. Iggy and Mort sell most of it out front. " +
            "They'll also try to recruit you into their little war. Don't take sides! Or do. It'd make a lovely sidebar.",
          responses: [
            { text: "Eat things. I can do that.", end: true },
            { text: "What little war?", next: "war" },
          ],
        },
        war: {
          speaker: "Dot Finch",
          text: "Iggy and Mort have been parked on opposite sides of the front door for eleven years. They share a supplier, a wall, and a mutual hatred so pure you could bottle it. I think they're in love. Don't tell them.",
          responses: [
            { text: "My lips are sealed. Mostly around a hot dog.", end: true },
          ],
        },

        // ---- Chapter II hand-in ----
        ret2: {
          speaker: "Dot Finch",
          text: "Well? Well?? Describe the flavours. In detail. I'm taking notes. [She licks her pencil, grimaces, licks it again.]",
          responses: [
            {
              text: "The coney dog tasted like regret and nitrates.",
              next: "done2",
            },
            {
              id: "dot_ret2_surv",
              text: "Chowder's the only thing actually cooked through. Warn people about the bagels — hard enough to chip a tooth.",
              check: { skill: "survival", value: 40 },
              next: "ret2_surv",
            },
            {
              id: "dot_ret2_grit",
              text: "My stomach says it was delicious. My stomach is lying.",
              check: { attr: "grit", value: 7 },
              next: "ret2_end",
            },
          ],
        },
        ret2_surv: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.xp(25, "Practical advice");
          },
          text: "\"Bagels: dental hazard.\" Oh, that's GOOD. That's practical. You're a natural. This is going in a little box with an exclamation mark.",
          responses: [{ text: "Happy to help.", next: "done2" }],
        },
        ret2_end: {
          speaker: "Dot Finch",
          onEnter: () => {
            QX.xp(15, "Iron stomach");
          },
          text: 'An IRON stomach. I\'ll add a sidebar: "Is your stomach made of iron? If not, consider having it replaced with iron."',
          responses: [{ text: "Sound advice.", next: "done2" }],
        },
        done2: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn2();
          },
          text:
            'Chapter Two is DONE! "The New York hot dog has survived the \'67 War. Respect it. Do not ask what it is. It does not know either." Payment! And now... Chapter Three: BLENDING IN. ' +
            "The locals glow, sweetie. Literally. You can't write about a place until you've soaked in it. Get yourself radiation sickness — two hundred roentgens — and come let me look at you. " +
            "Six hundred if you're feeling ADVANCED.",
          responses: [
            { text: "You want me to poison myself.", next: "poison" },
            { text: "For the book. Fine.", end: true },
          ],
        },
        poison: {
          speaker: "Dot Finch",
          text: "Poison is such an ugly word. Let's say \"season\". You're seasoning yourself. Like a cast-iron pan. A glowing, slightly nauseous pan.",
          responses: [{ text: "...Fine.", end: true }],
        },

        // ---- Chapter III hand-in ----
        ret3: {
          speaker: "Dot Finch",
          text: () =>
            "Oh my goodness, look at you. You're practically luminous! Hold still — [She waves a clicking Geiger counter near your face.] ...Wow. Okay. " +
            (QX.flag("g_b3")
              ? "That's ADVANCED. Please don't stand near the snacks."
              : "Don't stand near the snacks."),
          responses: [
            { text: "Can I have that Prussian Blue now?", next: "done3" },
            { text: "I feel fantastic. I can taste colours.", next: "done3" },
          ],
        },
        done3: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn3(false);
          },
          text:
            'Prussian Blue, as promised — two bottles! Chapter Three: "Nothing says I\'m a local like a gentle healthy glow." Now — Chapter Four, PUBLIC TRANSIT. ' +
            "The Times Square–42nd Street station has a derailed train in the tunnel. Go copy down its route placard. What line, where it was going. Tourists LOVE that sort of thing. And pay your fare if you find a token!",
          responses: [
            { text: "Subway. Got it.", end: true },
            { text: "Isn't the subway full of Maniacs?", next: "maniacs" },
          ],
        },
        intro4: {
          speaker: "Dot Finch",
          text: "Chapter Four, PUBLIC TRANSIT! The Times Square–42nd Street station has a derailed train in the tunnel. Copy down its route placard. And pay your fare if you find a token!",
          responses: [
            { text: "Subway. Got it.", end: true },
            { text: "Isn't the subway full of Maniacs?", next: "maniacs" },
          ],
        },
        maniacs: {
          speaker: "Dot Finch",
          text: "Commuters, sweetie. They're just very, very late for work. Stand clear of the closing jaws.",
          responses: [{ text: "Charming.", end: true }],
        },

        // ---- Chapter IV hand-in ----
        ret4: {
          speaker: "Dot Finch",
          text: "You're back! You have all your limbs! I counted! Well? Where was the train going?",
          responses: [
            {
              text: 'The 1 train. "SOUTH FERRY — ALL STOPS."',
              next: "ret4_true",
            },
            {
              text: '(Joke) It said "HELL — EXPRESS, NO STOPS".',
              next: "ret4_joke",
            },
          ],
        },
        ret4_true: {
          speaker: "Dot Finch",
          text: "All stops. [She writes it down very carefully.] All stops. Oh, that's poetry. That's the whole city in three words.",
          responses: [{ text: "You're welcome.", next: "done4" }],
        },
        ret4_joke: {
          speaker: "Dot Finch",
          text: "Ooh, dramatic! I'm using it. Tourists love a bit of menace. I'll put the real one in a footnote, you did copy the real one? You did. I can see it on your sleeve.",
          responses: [{ text: "I did.", next: "done4" }],
        },
        done4: {
          speaker: "Dot Finch",
          onEnter: () => {
            G_.turnIn4();
          },
          text: () =>
            (QX.flag("g_b4") ? "And you PAID YOUR FARE. I could cry. " : "") +
            "Chapter Four is written! And now... the LAST chapter. WILDLIFE OF CENTRAL PARK. " +
            "The North Woods, at the top of the park, has ripjaws. I need a plaster cast of a ripjaw footprint — for scale! Here's the plaster. Sneak in, pour, sneak out. " +
            "If they never even notice you, that's a whole sidebar on stealth.",
          responses: [
            { text: "Ripjaws. You want me near RIPJAWS.", next: "near" },
            { text: "Consider it done.", end: true },
          ],
        },
        near: {
          speaker: "Dot Finch",
          text: "Near their FEET. Totally different part of the ripjaw. The feet have never hurt anyone. Well. Stepped on. The feet have stepped on people.",
          responses: [{ text: "I'll be careful.", end: true }],
        },

        // ---- Chapter V hand-in ----
        ret5: {
          speaker: "Dot Finch",
          text: "Is that... is that the cast? [You set it down on her counter. The counter creaks.] It's ENORMOUS. Oh, I'm going to need a bigger chapter. A bigger BOOK.",
          responses: [
            {
              text: "So the book is finished?",
              action: () => G_.turnIn5(false),
              next: "finale",
            },
          ],
        },
        finale: {
          speaker: "Dot Finch",
          text: () =>
            "It's FINISHED. Five chapters, one foreword, one afterword, and an acknowledgements page that just says \"" +
            QX.pname() +
            '" in very large letters. ' +
            "Here — the first copy. Signed! Well, signed, smudged, and slightly irradiated. " +
            (QX.flag("g_lied")
              ? "Some of the research was... creative, I think, but that's what editors are for. We don't have editors."
              : bonuses() >= 4
                ? "And you did EVERYTHING the hard way. You're not a survivor, you're a KNOW-IT-ALL. I mean that as the highest compliment."
                : "You're a real Big Apple Survivor now."),
          responses: [
            { text: "It was an honour, Dot.", standing: 10, next: "bye" },
            { text: "Next time, pay more.", next: "bye2" },
          ],
        },
        bye: {
          speaker: "Dot Finch",
          text: "The honour was mine! Come back anytime. I'm already planning the sequel: \"The Big Apple Survival Guide 2: Brooklyn.\" ...Don't look at me like that.",
          responses: [{ text: "Goodbye, Dot.", end: true }],
        },
        bye2: {
          speaker: "Dot Finch",
          text: "Next time I WILL pay more! In royalties! Twelve copies at two Scrip each, minus pencils... you're owed nearly a whole note. I'll put it on your tab.",
          responses: [{ text: "Goodbye, Dot.", end: true }],
        },

        after: {
          speaker: "Dot Finch",
          text: [
            "Twelve copies sold! Well, eleven. One was eaten. I'm counting it as a review.",
            "My favourite field researcher! Are you here about the sequel? It's Brooklyn. You'll need a boat. And a helmet. And a second helmet.",
            'People keep coming in asking where the "Scenic Viewpoints" are. I tell them: everywhere, sweetie, if you squint.',
          ],
          responses: [R_BARTER, { text: "Just saying hello.", end: true }],
        },
      },
    });
  });

  // Barks when she sees you come back (first time per chapter hand-in).
