// play-inline-553 08 — next
// Lines 2149-2496 of readable/play-inline-553.pretty.js (statement-aligned).
  cfg.rook.compLine = () =>
    Q.isActive("sq_rook") && !L.has("q_rook_lockbox")
      ? "My lockbox isn't gonna steal itself back. Woolworth. Downtown."
      : "";
  L.hook("register", function () {
    if (G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({}, LOCK_ROOK));
      } catch (e) {
        /* */
      }
    }
    const k = "rook";
    const c0 = cfg.rook;
    const S = () => st(k);
    const joinResps = () => [
      {
        text: "Want to run with me?",
        cond: () => !current() && c0.canHire(),
        action: () => recruit(k, "asked"),
        next: "hired",
      },
      {
        text: "I'd take you along, but I've got company.",
        cond: () => !!current() && current() !== k,
        next: "full",
      },
    ];
    makeTree(
      k,
      startNode(k, () => {
        const s = S();
        if (s.left) return c0.canHire() ? "rehire_left" : "refuse";
        if (s.dismissed && s.hired) return c0.canHire() ? "rehire" : "refuse";
        return s.met ? "again" : "intro";
      }),
      {
        intro: {
          speaker: c0.name,
          text: "[A wiry woman in patched raider leathers sits on an ammo crate under the Arch, sharpening a knife that is already very sharp. A crude tattoo of a chess castle sits under her left eye.] Walk on, snowsuit. Unless you're buying, or you've got a death wish. Either's fine by me.",
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "What are you doing out here alone?", next: "alone" },
            { text: "[Leave.]", end: true },
          ],
        },
        again: {
          speaker: c0.name,
          text: "You again. Buying, dying, or staring?",
          responses: [
            { text: "Tell me about yourself.", next: "who" },
            { text: "Want to run with me?", next: "ask_join" },
            { text: "[Leave.]", end: true },
          ],
        },
        who: {
          speaker: c0.name,
          text: "Rook. Like the chess piece. Charlie gave me the name — said I only move in straight lines and I always take something. I ran with Gutter's crew at the Woolworth for four years. Now I don't.",
          responses: [
            { text: "What happened with Gutter?", next: "alone" },
            { text: "Want to run with me?", next: "ask_join" },
            { text: "[Leave.]", end: true },
          ],
        },
        alone: {
          speaker: c0.name,
          text: "Gutter kept my cut. Six months of it. So I left. Loudly. Three of his boys aren't walking anymore, and there's a wanted poster with my face on it that I think is very flattering. [She tests the knife on her thumb.] Now I'm between jobs.",
          responses: [
            { text: "Want to run with me?", next: "ask_join" },
            { text: "[Leave.]", end: true },
          ],
        },
        ask_join: {
          speaker: c0.name,
          text: () => {
            const t = tier();
            if (t >= 3)
              return (
                '[She looks you up and down, and slowly smiles.] Yeah. I heard about you. "' +
                (L.standingTitle() || "Trouble") +
                ",\" right? You get your hands dirty. I don't run with saints — saints get you killed being noble. You? You'll do."
              );
            if (t === 2)
              return "Nah. You're a fence-sitter. Can't trust a fence-sitter, they fall whichever way's easier. Come back when you've made your mind up about what you are.";
            return "[She laughs in your face.] A boy scout! Oh, that's precious. Run along before I take your lunchbox.";
          },
          responses: () =>
            joinResps().concat([{ text: "[Leave.]", end: true }]),
        },
        hired: {
          speaker: c0.name,
          text: "[She flips the knife, catches it by the blade, and sheathes it without looking.] Rules: I take first pick of the boots. You don't lecture me. We don't go in the front door if there's a window. Let's go.",
          responses: [{ text: "Let's go.", end: true }],
        },
        rehire: {
          speaker: c0.name,
          text: "Knew you'd be back. Nobody else puts up with you, huh? Fine. Let's go ruin somebody's day.",
          responses: () =>
            joinResps().concat([{ text: "Not yet.", end: true }]),
        },
        rehire_left: {
          speaker: c0.name,
          text: "[She looks at you sideways.] Heard you've been busy. The ugly kind of busy. [A grin.] Welcome back to the dark side. I'm in.",
          responses: () =>
            joinResps().concat([{ text: "Maybe later.", end: true }]),
        },
        refuse: {
          speaker: c0.name,
          text: "[She doesn't even get up.] Still a saint, huh? Walk on. I don't babysit.",
          responses: [{ text: "[Leave.]", end: true }],
        },
        // --- companion extras ---
        about: {
          speaker: c0.name,
          text: () =>
            pick([
              "Grew up in a tunnel under Canal Street. Had eleven brothers and sisters. Now I have one. Don't ask which one I kept, it's a whole thing.",
              "First thing I ever stole was a box of Chocolate Zeppelins off a trade wagon. Got caught. The wagon guard laughed so hard he let me keep them. I robbed him for real a year later. Felt bad. Didn't give it back.",
              "Chess Charlie taught me the game. Said I play like I fight: never defend, only trade up. He's the only person in this city I haven't robbed. Yet.",
            ]),
          responses: [
            {
              text: "About that money Gutter kept...",
              cond: () => !Q.isStarted("sq_rook"),
              next: "stash_offer",
            },
            { text: "Let's talk about something else.", next: "comp" },
          ],
        },
        stash_offer: {
          speaker: c0.name,
          text: "Six months of cuts in a lockbox with a skull on it. It's still in the Woolworth — Gutter's too dumb to spend it and too greedy to share it, and he never figured out the dials. Combination's oh-three-one-two, if you're curious. You're not opening it without me, though. We go in, we take it back. Split's sixty-forty, my favour. [She considers.] Put a bullet in Gutter while you're there, and I'll make it fifty-fifty.",
          learn: LOCK_ROOK.id,
          onEnter: () => learnLock(LOCK_ROOK.id, "Rook"),
          responses: [
            {
              text: "Let's go get your money.",
              action: () => Q.start("sq_rook"),
              next: "stash_go",
            },
            { text: "Maybe later.", next: "comp" },
          ],
        },
        stash_go: {
          speaker: c0.name,
          text: "Woolworth Building, downtown, by City Hall. Gutter will be on the ground floor pretending he's a king. The box is somewhere he can look at it. He likes looking at it.",
          responses: [{ text: "Let's go.", end: true }],
        },
        stash_back: {
          speaker: c0.name,
          text: () =>
            "[Her eyes go straight to the lockbox.] There she is. " +
            (L.isDead("comp_gutter")
              ? "And Gutter's feeding the pigeons, I hear. Fifty-fifty, like I promised."
              : "Gutter's still breathing, though. Sixty-forty.") +
            " Hand it over.",
          responses: () => [
            {
              text: "Here. Your money.",
              action: () => resolveStash("paid"),
              next: "stash_paid",
            },
            {
              text: "Bad news. I dialled it open on the way. It was empty. Gutter must have spent it.",
              cond: () => knows(LOCK_ROOK.id),
              check: { skill: "persuasion", value: 55 },
              standing: -50,
              next: "stash_lie",
              failNext: "stash_lie_fail",
            },
            { text: "Finders keepers, Rook.", next: "stash_steal" },
          ],
        },
        stash_paid: {
          speaker: c0.name,
          text: () =>
            "[She spins the dials — zero, three, one, two — counts with her lips moving, and slaps a stack of scrip into your hand.] " +
            (L.isDead("comp_gutter")
              ? "Two hundred. Fifty-fifty."
              : "One-sixty. Sixty-forty.") +
            " [She hesitates.] ...Nobody ever paid me what they said they would. Huh. Don't make it weird.",
          responses: [{ text: "Wouldn't dream of it.", end: true }],
        },
        stash_lie: {
          speaker: c0.name,
          text: "[She stares at the empty box you show her for a long moment. Then she kicks it into the gutter.] That MISERABLE — [a string of words that would peel paint] — fine. FINE. It's just money. [She walks off a few steps and comes back.] Thanks for trying, I guess.",
          onEnter: () => resolveStash("lied"),
          responses: [{ text: "[Pocket the scrip later.]", end: true }],
        },
        stash_lie_fail: {
          speaker: c0.name,
          text: "[Her knife is out before you finish the sentence.] Empty. Empty? It RATTLES, genius. Hand. It. Over.",
          responses: [
            {
              text: "Okay, okay. Here.",
              action: () => resolveStash("paid"),
              next: "stash_paid",
            },
            { text: "No.", next: "stash_steal" },
          ],
        },
        stash_steal: {
          speaker: c0.name,
          text: "[Something closes in her face, like a door.] Yeah. I figured. You're exactly like Gutter. [She backs away, hand on her knife.] Next time I see you, I won't be saying anything.",
          onEnter: () => resolveStash("stolen"),
          responses: [{ text: "[Leave.]", end: true }],
        },
      },
      () => [
        { id: cid(k, "about"), text: "Tell me about yourself.", next: "about" },
        {
          id: cid(k, "stash"),
          text: "About that money Gutter kept...",
          cond: () => !Q.isStarted("sq_rook"),
          next: "stash_offer",
        },
        {
          id: cid(k, "box"),
          text: "I got your lockbox.",
          cond: () =>
            Q.stage("sq_rook") === "return" && L.has("q_rook_lockbox"),
          next: "stash_back",
        },
      ],
    );
  });
  function resolveStash(how) {
    L.take("q_rook_lockbox", 1);
    if (G.locks && G.locks.unlock) {
      try {
        G.locks.unlock(LOCK_ROOK.id, "code");
      } catch (e) {
        /* */
      }
    }
    const s = st("rook");
    if (how === "paid") {
      L.setFlag("rook_paid");
      L.giveScrip(L.isDead("comp_gutter") ? 200 : 160);
      L.give(L.item("rage"), 1);
      L.xp(75, "Honour among thieves");
    } else if (how === "lied") {
      L.setFlag("rook_lied");
      L.giveScrip(400);
    } else {
      L.setFlag("rook_stolen");
      L.giveScrip(400);
      // She walks out and turns on you.
      L.later(0.2, () => {
        release("rook", "dismiss");
        s.hostile = true;
        s.dismissed = false;
        const a = actor("rook");
        if (a && !a.dead) {
          a.essential = false;
          a.faction = "raiders";
          a.dialogue = null;
          try {
            a.setHostile(true);
          } catch (e) {
            /* */
          }
        }
        L.notify("Rook has turned against you.");
      });
    }
    Q.setStage("sq_rook", "done");
    talentOn.rook = null;
  }

  // ------------------------------------------------------------------
  // Quest progression events
  // ------------------------------------------------------------------
  G.events.on("itemAdded", (id) => {
    if (
      id === "q_garden_belt" &&
      Q.isActive("sq_malone") &&
      Q.stage("sq_malone") !== "return" &&
      Q.stage("sq_malone") !== "done"
    )
      Q.setStage("sq_malone", "return");
    if (id === "q_press_core" && Q.stage("sq_tull") === "fetch")
      Q.setStage("sq_tull", "return");
    if (id === "q_rook_lockbox" && Q.stage("sq_rook") === "stash")
      Q.setStage("sq_rook", "return");
  });
  G.events.on("actorKilled", (a) => {
    if (!a || !a.id) return;
    if (a.id === "msg_kid" && Q.stage("sq_malone") === "find") {
      Q.setStage("sq_malone", "belt");
      if (following("malone"))
        L.later(1.2, () =>
          bark(
            "malone",
            "Stay down, Danny. Ten count. [Quietly.] It's over, kid. Nobody won.",
            6,
            true,
          ),
        );
    }
    if (a.id === "comp_gutter") {
      if (following("rook"))
        L.later(1.0, () =>
          bark(
            "rook",
            "That's for the three hundred and twelve scrip, you pig.",
            5,
            true,
          ),
        );
      G.events.emit("questCounter", Q.get("sq_rook"));
    }
    // a companion's own kills get a line now and then
    for (const k of KEYS) {
      const c = following(k);
      if (c && a.hostile && Math.random() < 0.18 && c.distTo(a.pos) < 30)
        L.later(0.8, () => bark(k, pick(cfg[k].kill), 3));
    }
  });
  L.trigger({
    id: "comp_kid_sighted",
    pos: () => {
      const a = L.npc("msg_kid");
      return a && !a.dead ? a.pos : null;
    },
    r: 30,
    cond: () => Q.stage("sq_malone") === "find" && !!following("malone"),
    fire() {
      bark(
        "malone",
        "That's him. That's the Kid. [He stares.] Look at him. Still bobbing. Still dropping that left.",
        6,
        true,
      );
    },
  });
  L.trigger({
    id: "comp_gutter_sighted",
    pos: () => {
      const a = L.npc("comp_gutter");
      return a && !a.dead ? a.pos : null;
    },
    r: 28,
    cond: () => Q.stage("sq_rook") === "stash" && !!following("rook"),
    fire() {
      bark("rook", "Hey GUTTER! Remember me? I remember YOU!", 5, true);
    },
  });
