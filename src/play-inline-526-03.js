// play-inline-526 03 — pos
// Lines 392-687 of readable/play-inline-526.pretty.js (statement-aligned).
  function rewardCaptive(E) {
    if (E.rewarded) return;
    E.rewarded = true;
    K.addStanding(E.how === "bought" ? 35 : 50, "Freed a captive");
    K.addXP(40, "Freed a captive");
    K.give(K.SCRIP, K.randInt(20, 45));
    if (Math.random() < 0.5)
      K.give(K.pick(["rally_tonic", "purified_water", "duct_tape"]), 1);
  }
  function updateFreed(E, dt) {
    const c = E.captive;
    if (!K.actorAlive(c)) return;
    E.freeT += dt;
    if (!K.actorBusy(c)) c.faceTowards(G.player.pos.x, G.player.pos.z, 2, dt);
    // talked to (dialogue sets E.thanked) or nobody came over: head home
    if ((E.thanked || E.freeT > 45) && !K.actorBusy(c)) {
      if (!E.rewarded && K.distToPlayer(c.pos.x, c.pos.z) < 40) {
        rewardCaptive(E);
        K.say(
          c,
          "I'm going home. " +
            LOCNAME(E.town) +
            ". Here — I hid these in my boot. Take them.",
          5,
        );
      }
      E.state = "walking";
      if (E.town) {
        c.aiMode = "patrol";
        c.patrol = [{ x: E.town.x, z: E.town.z }];
        c.patrolIdx = 0;
        c.walkSpeed = Math.max(c.walkSpeed, 2.4);
      }
    }
  }
  function slaverDialogues() {
    const E = () => slaverE;
    const lead = () =>
      (E() && E().slavers.find((a) => K.actorAlive(a))) || null;
    const buy = (price) => {
      if (!E() || !K.takeScrip(price)) return;
      K.sfx(K.SFX_PAY);
      free("bought");
      const e = E();
      e.released = true;
      for (const a of e.slavers)
        if (K.actorAlive(a)) {
          a.aiMode = "patrol";
          a.patrol = [
            {
              x: a.pos.x + (a.pos.x - G.player.pos.x) * 4,
              z: a.pos.z + (a.pos.z - G.player.pos.z) * 4,
            },
          ];
          a.patrolIdx = 0;
          try {
            a.follow(null);
          } catch (err) {
            /* ignore */
          }
        }
    };
    const fight = () => {
      const e = E();
      if (!e) return;
      for (const a of e.slavers) K.aggro(a);
    };
    // captive pronouns (CAPTIVES mixes men and women)
    const male = () => !!(E() && E().capG === "m");
    const her = () => (male() ? "him" : "her"),
      hers = () => (male() ? "his" : "her"),
      she = () => (male() ? "he" : "she"),
      She = () => (male() ? "He" : "She");
    // per-instance response id: the dialogue engine remembers won/blown checks by id for the whole save
    const rid = (tag) => tag + "#" + ((E() && E().uid) || "0");
    K.registerDialogue("amb_dlg_slaver", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            K.standing() <= -500
              ? "Well, well. You've got the look of someone who knows how the world works. This one's bound for the Rikers pens. Unless you want to make an offer."
              : "Keep walking, stranger. This one's bound for the Rikers Island pens, and the paperwork's in order. Unless you're buying.",
          responses: [
            { text: "How much for the captive?", next: "price" },
            {
              get id() {
                return rid("rot");
              },
              text: () =>
                "Look at those sores on " +
                hers() +
                " neck. That's the Rot. Rikers will burn your whole pen when they see " +
                her() +
                ".",
              check: { skill: "persuasion", value: 60 },
              next: "rot_ok",
              failNext: "rot_fail",
            },
            { text: () => "Let " + her() + " go. Now.", next: "threat" },
            {
              text: "Rikers hiring? I could use the work.",
              cond: () => K.standing() <= -250,
              next: "work",
            },
            { text: "Not my business. Goodbye.", end: true },
          ],
        },
        price: {
          text: () =>
            "Price is " +
            (E() ? E().price : 250) +
            " scrip. Cash, collar comes off, " +
            she() +
            "'s your problem. Don't ask me what you do with " +
            her() +
            " after. I don't want to know.",
          responses: [
            {
              text: () =>
                "[Pay " +
                (E() ? E().price : 250) +
                " scrip] Take it. Collar off.",
              cond: () => E() && K.scrip() >= E().price,
              action: () => buy(E().price),
              next: "sold",
            },
            {
              get id() {
                return rid("haggle");
              },
              text: () =>
                "For THAT? " +
                She() +
                " can barely stand. One-twenty, and you're robbing me.",
              cond: () => E() && E().price > 120,
              check: { skill: "trade", value: 50 },
              next: "haggle_ok",
              failNext: "haggle_fail",
            },
            { text: "Too rich for me.", next: "hello" },
          ],
        },
        haggle_ok: {
          text: "Hah! You haggle like a Neon pawnbroker. ...Fine. One-twenty. And you tell nobody I went soft.",
          onEnter: () => {
            if (E()) E().price = 120;
          },
          responses: [
            {
              text: "[Pay 120 scrip] Done.",
              cond: () => K.scrip() >= 120,
              action: () => buy(120),
              next: "sold",
            },
            { text: "I'll think about it.", end: true },
          ],
        },
        haggle_fail: {
          text: () =>
            "Nice try. Two-fifty, or you can watch " +
            her() +
            " walk onto the ferry.",
          responses: [
            { text: "Fine. Back up.", next: "price" },
            { text: "Forget it.", end: true },
          ],
        },
        sold: {
          text: "Pleasure doing business. Collar's off. Boys — we're done here.",
          responses: [{ text: "[Leave]", end: true }],
        },
        rot_ok: {
          text: () =>
            "...The Rot? Aw, hell. HELL. Last time somebody brought the Rot onto the island the Pen Boss fed the whole boat to the shellbacks. Keep " +
            her() +
            ". Keep " +
            her() +
            "! Boys, we're walking. Don't touch anything.",
          onEnter: () => {
            const e = E();
            if (!e) return;
            K.addXP(30, "Talked down the slavers");
            free("rot");
            e.released = true;
            for (const a of e.slavers)
              if (K.actorAlive(a)) {
                try {
                  a.follow(null);
                } catch (err) {
                  /* ignore */
                }
                a.aiMode = "patrol";
                a.patrol = [
                  {
                    x: a.pos.x + (a.pos.x - G.player.pos.x) * 4,
                    z: a.pos.z + (a.pos.z - G.player.pos.z) * 4,
                  },
                ];
                a.patrolIdx = 0;
              }
          },
          responses: [{ text: "Smart man.", end: true }],
        },
        rot_fail: {
          text: () =>
            "Those are bug bites. I checked " +
            hers() +
            " teeth myself. Walk away, friend, while that's still an option.",
          responses: [
            { text: () => "Let " + her() + " go. Now.", next: "threat" },
            { text: "Fine.", end: true },
          ],
        },
        threat: {
          text: "Or what? ...Heh. Boys, looks like we've got a second collar to fill.",
          responses: [{ text: "[Attack]", action: fight, end: true }],
        },
        work: {
          text: "Bring us bodies with a pulse (collared, fed, walking) and the Pen Boss pays a hundred a head. Ferry leaves the Battery slip at dusk. Knock three times.",
          responses: [{ text: "I'll keep it in mind.", end: true }],
        },
      },
    });
    K.registerDialogue("amb_dlg_captive", {
      start: () => (!E() ? "gone" : E().state === "bound" ? "bound" : "free"),
      nodes: {
        bound: {
          text: () =>
            "Please... please don't just walk past. They grabbed me outside " +
            LOCNAME(nearestTown(G.player.pos.x, G.player.pos.z)) +
            ". They're taking me to Rikers. Nobody comes back from Rikers.",
          responses: [
            {
              get id() {
                return rid("jam");
              },
              text: "Hold still. That latch is cheap work. I can slip it with a bit of wire.",
              check: { skill: "mechanics", value: 50 },
              next: "jam_ok",
              failNext: "jam_fail",
            },
            { text: "I'll get you out of this.", next: "promise" },
            { text: "Sorry. Not my fight.", end: true },
          ],
        },
        promise: {
          text: "The big one has the key. Or... or you could buy me. I'll pay you back. I swear I will.",
          responses: [{ text: "Sit tight.", end: true }],
        },
        jam_ok: {
          text: "*click*... it's OFF! Oh God, they saw! RUN!",
          onEnter: () => {
            const e = E();
            if (!e) return;
            K.addXP(20, "Slipped a captive's collar");
            free("slipped");
            for (const a of e.slavers) K.aggro(a);
            e.thanked = true;
          },
          responses: [{ text: "[Fight]", end: true }],
        },
        jam_fail: {
          text: "It's not... it's not budging. Stop, stop, they're looking this way!",
          responses: [{ text: "Later.", end: true }],
        },
        free: {
          text: () => {
            const e = E();
            return (
              "You actually did it. I'm going home to " +
              LOCNAME(e && e.town) +
              ". I hid a little scrip in my boot. It's yours. I won't forget this."
            );
          },
          onEnter: () => {
            const e = E();
            if (e) {
              e.thanked = true;
              rewardCaptive(e);
            }
          },
          responses: [{ text: "Stay off the avenues. Go.", end: true }],
        },
        gone: {
          text: "Thank you. For everything.",
          responses: [{ text: "Take care.", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // THE BAIT (ambush)
  // ==================================================================
  let baitE = null;
