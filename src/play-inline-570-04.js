// play-inline-570 04 — the
// Lines 538-886 of readable/play-inline-570.pretty.js (statement-aligned).
  ms.spot({
    id: "ms5_inscription",
    when: () => inStage("mq30", ["drag"]),
    at: P_INSCR,
    label: "Inscribed Slab",
    verb: "Read",
    radius: 1.4,
    use() {
      ms.talk("dlg_ms5_wreck", "Slab", "mq30_inscr");
    },
  });

  // Rose at the wreck (she led them here)
  ms.dlg("dlg_ms_rose")
    .add({
      mq30_wreck: {
        speaker: "Rose",
        text: () =>
          stage("mq30") === "drag"
            ? "The marks go that way, into the trees. They dragged it out on a sledge. Took them all winter. I wasn't born yet. I've heard about it a hundred times anyway."
            : "This is it. Sirocco Two. When I was little we came here every March. A pilgrimage, they called it. I thought it was a church that fell out of the sky. [She kicks a rivet.] Read the plate. That's what we came for.",
        responses: [
          {
            text: "Every March?",
            next: "mq30_march",
            cond: () => stage("mq30") !== "drag",
          },
          { text: "Let's read it.", cond: () => stage("mq30") !== "drag" },
          { text: "Lead on.", cond: () => stage("mq30") === "drag" },
        ],
      },
      mq30_march: {
        speaker: "Rose",
        text: "The fifth. The anniversary. Candles all the way up the path, and singing, and the little kids carried on shoulders so they could see the hole. [A shrug that doesn't quite work.] It was the best day of the year. That's the problem with being raised by people like that. The best days are the worst ones.",
        responses: [{ text: "Let's read the plate." }],
      },
    })
    .when(() =>
      inStage("mq30", ["wreck", "plate", "harness", "drag"])
        ? "mq30_wreck"
        : null,
    );

  // Zeke at the wreck: the same plate reading
  ms.inject("dlg_lib_zeke", {
    start: () =>
      inStage("mq30", ["wreck", "plate"]) && !ms.f("knows_arming")
        ? "mq30_zstart"
        : null,
    nodes: Object.assign(
      {
        mq30_zstart: {
          text: "Fresh air, trees, a downed bomber. Just like the Catskills. [He nods at the brass on the cradle.] There's a plate on the cradle. Come on, you were always better at forms than me.",
          onEnter() {
            if (stage("mq30") === "wreck") Q.setStage("mq30", "plate");
          },
          responses: [
            { text: "[Read the plate with him.]", next: "mq30_plate" },
            { text: "In a minute." },
          ],
        },
      },
      WRECK_NODES,
    ),
  });

  const ROSE_WRECK = () => ({
    fallback: { x: P_ROSE.x, z: P_ROSE.z, y: P_ROSE.y },
  });
  const ROSE_INSCR = () => ({
    fallback: { x: P_INSCR.x - 1.6, z: P_INSCR.z - 1.2, y: P_INSCR.y },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq30",
      giver: "Zeke Marlow / Rose",
      location: "The North Woods, Central Park",
      desc: () =>
        "Rose knows where the second bomber came down: the North Woods, where the Glowkeepers made their pilgrimages when she was a child. Zeke wants to see the weapon plate. Whatever the Second Sun still needs, they mean to deny it.",
      stages: [
        {
          id: "wreck",
          text: "Find the Sirocco Two wreck in the North Woods. Rose is leading the way.",
          markers: () =>
            [
              plain(wc(), "Sirocco Two"),
              rosePresent() ? { npc: rose.id, label: "Rose" } : null,
            ].filter(Boolean),
          onEnter() {
            if (!captive()) rose.place("at", ROSE_WRECK());
            zekePlace({
              site: "north_woods",
              anchors: ["sirocco_zeke", "sirocco_wreck"],
              fallback: { x: P_ZEKE.x, z: P_ZEKE.z },
            });
            L.later(1.5, () =>
              ms.say(
                "Rose",
                "North Woods. Past the Loch, where the path gives up. Bring Zeke. He'll want to read the plate.",
              ),
            );
          },
        },
        {
          id: "plate",
          text: "Read the weapon plate with Zeke.",
          markers: () => [plain(P_PLATE, "Weapon Plate")],
        },
        {
          id: "harness",
          text: "Check the cockpit harnesses.",
          markers: () => [plain(P_COCKPIT, "Cockpit")],
        },
        {
          id: "drag",
          text: "Follow the drag marks to where they end.",
          markers: () => [plain(P_INSCR, "Drag Marks")],
          onEnter() {
            if (!captive()) rose.place("at", ROSE_INSCR());
          },
        },
      ],
      rewards: { xp: 600 },
      onComplete() {
        ms.set("knows_arming");
        if (!captive()) rose.place("home");
        L.later(4, () => zekePlace(null));
        L.news(
          "Folks up by the Harlem Meer say there were lights in the North Woods last night, and nobody came back out screaming. In this city that counts as a nature walk. Rocky's advice: stay out of the trees.",
        );
      },
    });
  });
  // Reaching the wreck moves the story on.
  L.trigger({
    id: "ms5_wreck_reach",
    once: false,
    cooldown: 2,
    pos: () => wc(),
    r: 16,
    cond: () => stage("mq30") === "wreck",
    fire() {
      Q.setStage("mq30", "plate");
    },
  });
  ms.solver("mq30", {
    wreck() {
      Q.setStage("mq30", "plate");
    },
    plate() {
      readPlate();
    },
    harness() {
      checkHarness();
    },
    drag() {
      readInscription();
    },
  });

  // ==================================================================
  // MQ31 — POSTE DRAGON (absorbs pv_red_star)
  // ==================================================================
  const RACE_MAX = 420; // game seconds near the post before the Glowkeepers break through
  const POST_FB = { x: 164, z: 504 };
  const postPos = () => L.anchor("chinatown", ["boss", "transmitter"], POST_FB);
  const codebookDone = () =>
    !!(ms.f("sun_word_denied") || ms.f("sun_word_glow"));
  const lysGuides = () => ms.f("bureau") === "sell" && !L.flag("dead_bs_lys");
  const DIGGERS = ["ms_pd_dig1", "ms_pd_dig2", "ms_pd_dig3"];
  const diggersDead = () => DIGGERS.every((id) => !!L.flag("dead_" + id));

  function codebook(how) {
    if (codebookDone()) return;
    ms.set("sun_word_denied");
    ms.set("codebook_" + (how === "burn" ? "burned" : "held"));
    if (how === "burn") {
      L.sfx("fire_ignite");
      L.notify(
        "The ledger goes up page by page, dates first. In a minute there is no word left for the wheel to want.",
      );
    } else {
      L.give("ms_note_sirocco_codebook", 1);
    }
    L.xp(150, "Denied the Second Sun its word");
    if (stage("mq31") === "codebook") Q.complete("mq31");
  }
  function lostCodebook() {
    if (codebookDone()) return;
    ms.set("sun_word_glow");
    L.notify(
      "Through the wall: a crash of brick, a shout, and running feet going away up the kitchen tunnel. When you reach the Commandant's desk the cipher safe stands open and empty.",
      { duration: 7 },
    );
    L.news(
      "Chinatown's quiet again. The Golden Dragon's kitchen has a new hole in the floor, and the Lums' old cat won't go near it. Something got carried out of there in a hurry, folks. Something with pages.",
    );
    if (stage("mq31") === "codebook") Q.complete("mq31");
  }
  ms.dlg("dlg_ms5_codebook", "idle").add({
    idle: {
      text: "[The safe is empty.]",
      responses: [{ text: "[Step back.]" }],
    },
    safe: {
      speaker: "Cipher Safe",
      text: () =>
        "[Behind the Commandant's desk a small grey safe stands open; its dial has rusted at zero. Inside, wrapped in oilcloth, a ledger bound in grey card: CARNET SIROCCO — POSTE DRAGON.]" +
        (L.flag("ms_mq31_breach") && !diggersDead()
          ? "\n\n[Behind the east wall the picks have stopped. Somebody on the other side is shouting in a voice that has never once been told no.]"
          : "\n\n[Behind the east wall, faint and steady: picks.]"),
      responses: [
        {
          text: "[Take the codebook.] If it's with me, it isn't with them.",
          action: () => codebook("take"),
        },
        { text: "[Burn it, here and now.]", action: () => codebook("burn") },
        { text: "[Leave it for the moment.]" },
      ],
    },
  });
  ms.spot({
    id: "ms5_codebook",
    when: () => inStage("mq31", ["post", "codebook"]) && !codebookDone(),
    at: {
      site: "chinatown",
      anchors: ["cipher_safe", "boss", "transmitter"],
      fallback: POST_FB,
    },
    label: "Cipher Safe",
    verb: "Open",
    radius: 1.4,
    use() {
      ms.talk("dlg_ms5_codebook", "Cipher Safe", "safe");
    },
  });
  ms.pickup({
    key: "ms_brault_page",
    item: "ms_note_brault_1970",
    when: () => inStage("mq31", ["post", "codebook"]),
    at: {
      site: "chinatown",
      anchors: ["soldier1", "boss"],
      fallback: { x: POST_FB.x - 2, z: POST_FB.z + 1 },
    },
  });
  // the Glowkeepers break through from the kitchen
  for (let i = 0; i < DIGGERS.length; i++) {
    const id = DIGGERS[i];
    ms.actor({
      id,
      when: () =>
        Q.isActive("mq31") && !!L.flag("ms_mq31_breach") && !codebookDone(),
      def: () => ({
        type: "glowkeeper_zealot",
        seed: 310 + i,
        name: i === 0 ? "Brother Wick" : "Glowkeeper Digger",
        gender: i === 1 ? "f" : "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: true,
        ai: "guard",
        level: 10,
        hp: 150,
        weapon:
          i === 0
            ? ["pipe_pistol", "pistol_10mm"]
            : ["sledgehammer", "lead_pipe", "machete"],
        at: {
          site: "chinatown",
          anchors: [["loot2", "soldier3", "soldier4"][i]],
          fallback: { x: POST_FB.x + 3 + i, z: POST_FB.z - 3 },
          maxR: 4,
        },
        barks: [
          "For the Long Noon!",
          "The book belongs to the Dawn!",
          "Keep the light on!",
        ],
      }),
    });
  }
  /** The race: ticks while the hero is near/inside the post during mq31. */
  function raceUpdate(dt) {
    if (!inStage("mq31", ["post", "codebook"]) || codebookDone()) return;
    const sideStage = Q.isActive("pv_red_star") ? Q.stage("pv_red_star") : null;
    const p = postPos();
    const inside =
      sideStage === "bunker" ||
      sideStage === "armory" ||
      (p && (p.anchored ? dist2(p) < 60 : dist2(p) < 18));
    if (!inside && !L.flag("ms_mq31_race")) return;
    if (!L.flag("ms_mq31_race")) {
      ms.set("mq31_race");
      L.setFlag("ms_mq31_race_t", 0);
      L.notify(
        "Somewhere behind the east wall: the dull, steady knock of picks on brick. The Glowkeepers are digging in from the Golden Dragon's kitchen.",
        { duration: 7 },
      );
    }
    if (!(p && dist2(p) < 140)) return; // the clock only runs while you're in the area
    const t = (Number(L.flag("ms_mq31_race_t")) || 0) + dt;
    L.setFlag("ms_mq31_race_t", t);
    if (t > RACE_MAX * 0.5 && !L.flag("ms_mq31_half")) {
      L.setFlag("ms_mq31_half", true);
      L.notify("The picks are louder now. Closer.");
    }
    if (t > RACE_MAX * 0.6 && !L.flag("ms_mq31_breach")) {
      ms.set("mq31_breach");
      L.notify(
        "A wall gives way somewhere in the post. Robed figures with lanterns and hammers come through the dust.",
        { duration: 6 },
      );
      L.later(0.3, ms.pollRoster);
    }
    if (L.flag("ms_mq31_breach") && diggersDead() && !L.flag("ms_mq31_held")) {
      L.setFlag("ms_mq31_held", true);
      L.notify("The digging crew is down. Nobody else comes through the hole.");
    }
    if (t >= RACE_MAX && !(L.flag("ms_mq31_breach") && diggersDead()))
      lostCodebook();
  }

  // Lys guides (Bureau Sept path)
  ms.inject("dlg_bs_lys", {
    start: () => (stage("mq31") === "lead" ? "mq31_lys" : null),
    nodes: {
      mq31_lys: {
        text: "[She doesn't look up from the typewriter.] You want the other book. Of course you do. Corbeau's copy went where Corbeau went. The second copy never left the city: Poste Dragon, under the Golden Dragon on Mott Street. Push the shelf in the storeroom; the stairs are behind it.",
        responses: [{ text: "And the men down there?", next: "mq31_lys2" }],
      },
      mq31_lys2: {
        text: "Eleven men, once. Now: what the sky left of them. The Commandant still types his daughter's name into his teletype every morning, MARGUERITE, as if Paris might answer. [Now she looks up.] And hurry. The sun people have been buying shovels in Chinatown all week, and they do not garden.",
        onEnter() {
          if (!G.isStub("locks") && G.locks && G.locks.learn) {
            try {
              G.locks.learn("pv_lk_ct_commander", "Mademoiselle Lys");
            } catch (e) {
              /* optional */
            }
          }
          Q.setStage("mq31", "post");
        },
        responses: [{ text: "Merci, Lys." }],
      },
    },
  });
  // Rose's sugar cube
