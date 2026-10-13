// play-inline-568 06 — responses
// Lines 1530-1856 of readable/play-inline-568.pretty.js (statement-aligned).
  ms.dlg("dlg_ms_mq23_hatch", "h1").add({
    h1: {
      speaker: "Track 61 bulkhead",
      text: '[The bulkhead is a steel hatch in the tunnel wall, painted over so many times the rivets have gone soft. Taper knocks twice, and is let through, and the hatch swings shut behind him. You put your ear to the cold steel.]\n\nSomewhere beyond it, a woman is humming. "Two Bits and a Kiss". Then she reaches the verse that was never on any record, the one that only ever existed in pencil on a paper sleeve, and hums that too, every note of it, slow, the way you would hum a child to sleep. Her voice is low and roughened, an older woman\'s voice. You know that voice. You cannot think from where.',
      onEnter() {
        ms.set("heard_humming");
        L.setFlag("heard_humming");
        L.xp(40, "Two Bits and a Kiss");
      },
      responses: [{ text: "[Listen.]", next: "h2" }],
    },
    h2: {
      speaker: "Track 61 bulkhead",
      text: "[The humming stops in the middle of a bar, as if someone has come into the room. A man's voice, too low to make out. Footsteps. The hatch opens a hand's width and Brother Taper slips back out, and finds you there, and does not seem surprised.]",
      responses: [{ text: "[Face him.]", next: "h3" }],
    },
    h3: {
      speaker: "Brother Taper",
      text: "You followed. She thought you might. [He pulls the hatch shut behind him without looking.] Well, sleeper? Yes, or no.",
      responses: [
        {
          text: "Tell her yes. Key B, for the truth about Nicole.",
          action: () => {
            pactAgree();
            toRose();
          },
          next: "h_yes",
        },
        {
          text: "No. The key goes in the harbour.",
          action: () => {
            pactRefuse();
            toRose();
          },
          next: "h_no",
        },
        { text: "Who was singing?", next: "h_who" },
        { text: "No answer.", action: () => toRose(), next: "h_none" },
      ],
    },
    h_who: {
      speaker: "Brother Taper",
      text: "Nobody you know, sleeper. [He says it gently, the way you would tell a child there is nothing under the bed.] Yes, or no.",
      responses: [
        {
          text: "Yes. Key B, for the truth about Nicole.",
          action: () => {
            pactAgree();
            toRose();
          },
          next: "h_yes",
        },
        {
          text: "No.",
          action: () => {
            pactRefuse();
            toRose();
          },
          next: "h_no",
        },
        { text: "No answer.", action: () => toRose(), next: "h_none" },
      ],
    },
    h_yes: {
      speaker: "Brother Taper",
      text: "Then come to the gallery corner on any night, when you have it, and whisper. [He presses a folded bundle of ivory cloth into your hands.] For the road.",
      responses: [{ text: "[Go back up.]" }],
    },
    h_no: {
      speaker: "Brother Taper",
      text: "She said you always did hate being told where to stand. Go back up, sleeper. Mind the third rail. It is not live, but it remembers.",
      responses: [{ text: "[Go back up.]" }],
    },
    h_none: {
      speaker: "Brother Taper",
      text: "Then go back up and think. The light stays on.",
      responses: [{ text: "[Go back up.]" }],
    },
  });

  // ==================================================================
  // mq24 CROSSING
  // ==================================================================
  const BATTERY_ROSE = {
    site: "battery_park",
    anchors: ["pier", "dock"],
    fallback: { x: -40, z: 985 },
  };
  function routeCrossing() {
    if (!at("mq24", "route")) return;
    const f = faction();
    if (f === "covenant") Q.setStage("mq24", "muster");
    else if (
      f === "continuity" &&
      !L.flag("hale_dead") &&
      !L.flag("con_hostile")
    )
      Q.setStage("mq24", "rotorcraft");
    else Q.setStage("mq24", "shells");
  }
  function placeRoseForCrossing(where) {
    if (
      ms.f("rose_on_liberty") ||
      ms.f("rose_overwatch") ||
      rose.mode() === "follow"
    )
      return;
    if (where === "un") {
      rose.place("at", {
        site: "un_hq",
        anchors: ["plaza", "gate"],
        fallback: { x: 290, z: -300 },
      });
      return;
    }
    rose.place("at", BATTERY_ROSE);
  }
  function placeOverwatch() {
    rose.place("at", BATTERY_ROSE);
  }
  const howForPath = () =>
    faction() === "covenant"
      ? "lancers"
      : Q.stage("mq24") === "rotorcraft"
        ? "rotorcraft"
        : "ferry";
  let pendingHow = null;
  /** Leave for Liberty: Rose decides (or is decided for), then Act IV takes over. */
  function go(how) {
    if (!Q.isActive("mq24")) {
      if (L.ferryToLiberty) L.ferryToLiberty();
      return;
    }
    if (ms.f("rose_on_liberty") || ms.f("rose_overwatch")) {
      depart(how);
      return;
    }
    if (ms.trust() >= 2) {
      pendingHow = how;
      L.later(0.1, () => ms.talk("dlg_ms_mq24_rose", "Rose", "ask"));
      return;
    }
    ms.set("rose_overwatch");
    placeOverwatch();
    rose.say(
      "I'll be on the Battery wall with my scope. If they shoot at you, I'll shoot back. That's the deal.",
      6,
    );
    depart(how);
  }
  function roseComes() {
    ms.set("rose_on_liberty");
    L.setFlag("rose_on_liberty");
    rose.place("follow");
  }
  function roseStays() {
    ms.set("rose_overwatch");
    L.setFlag("rose_overwatch");
    placeOverwatch();
  }
  function depart(how) {
    ms.set("mq24_departed");
    L.later(0.3, () => {
      if (!Q.isActive("mq24")) return;
      const lib = ms.liberty;
      if (lib && typeof lib.arrive === "function") {
        try {
          lib.arrive(how);
          return;
        } catch (e) {
          G.reportError("quests:ms:mq24:arrive", e);
        }
      }
      // fallback: no Act IV hand-off yet
      Q.complete("mq24");
      if (how === "rotorcraft" && L.spots && L.spots.libertyDock) {
        const d = L.spots.libertyDock();
        if (d)
          L.travel(d.x, d.y || 0, d.z, 0, () =>
            L.notify(
              "The Rotorcraft banks low over the harbour and sets you down on Liberty Island in a storm of rotor-wash.",
            ),
          );
      } else if (L.ferryToLiberty) L.ferryToLiberty();
    });
  }
  ms.crossing = { go, depart, routeCrossing };
  ms.dlg("dlg_ms_mq24_rose", "ask").add({
    ask: {
      speaker: "Rose",
      text: () =>
        "[Rose is already there, rifle slung, cuff buckled tight.] You're going. [She checks the bolt without looking at it.] " +
        (pendingHow === "rotorcraft"
          ? "In their machine, on their list. Fine. If anybody checks my wrist, I'm shooting the pilot. "
          : "") +
        "I want to be in the room when they open that locker. I want to see the key with my own eyes before it goes in the water.",
      responses: [
        {
          text: "Come with me.",
          action: () => {
            roseComes();
            depart(pendingHow || howForPath());
          },
          next: "come",
        },
        {
          text: "Stay on the Battery. Cover the landing with your scope.",
          action: () => {
            roseStays();
            depart(pendingHow || howForPath());
          },
          next: "stay",
        },
      ],
    },
    come: {
      speaker: "Rose",
      text: "Good. Don't make a speech about it. [She falls in on your left, half a step behind, where she can see past you.]",
      responses: [{ text: "[Cross.]" }],
    },
    stay: {
      speaker: "Rose",
      text: "[A flicker of something, then nothing.] Fine. I'll be on the wall. If they shoot at you, I'll shoot back. [She is already walking away.] Don't make me watch you drown.",
      responses: [{ text: "[Cross.]" }],
    },
  });
  // the Covenant muster at the Battery pier
  const MUSTER_AT = (dx, dz) => ({
    site: "battery_park",
    anchors: ["ferryman", "pier", "dock"],
    fallback: { x: -124 + dx, z: 960 + dz },
    maxR: 6,
  });
  ms.actor({
    id: "ms_lancer_muster",
    when: () => at("mq24", "muster"),
    def: {
      type: "human",
      name: "Lancer Castillo",
      outfit: "covenant_exo_rig",
      gender: "f",
      faction: "covenant",
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 10,
      hp: 300,
      weapon: ["gyrojet_carbine", "assault_rifle"],
      dialogue: "dlg_ms_mq24_muster",
      noRespawn: true,
      at: MUSTER_AT(4, 3),
      barks: [
        "Iron keeps.",
        "Boat's loaded, sleeper.",
        "Mind the ferryman. He bites.",
      ],
    },
  });
  ms.actor({
    id: "ms_lancer_muster2",
    when: () => at("mq24", "muster"),
    def: {
      type: "human",
      name: "Lancer-Sergeant Albright",
      outfit: "covenant_exo_rig",
      gender: "m",
      faction: "covenant",
      ai: "guard",
      home: "here",
      homeR: 2,
      essential: true,
      level: 11,
      hp: 320,
      weapon: ["minigun", "belt_fed_mg"],
      dialogue: "dlg_ms_mq24_muster",
      noRespawn: true,
      at: MUSTER_AT(6, -2),
      barks: ["Checking the cannon. Again.", "File THIS, paper-pushers."],
    },
  });
  ms.dlg("dlg_ms_mq24_muster", "hello").add({
    hello: {
      speaker: () => "Lancer Castillo",
      text: () =>
        "The Lancer-Commander's compliments, sleeper. Two squads, one rotary cannon and an old ferryman who has called us every name in the harbour. " +
        (L.flag("stroud_dead")
          ? "We fly the Commander's colours anyway. "
          : "") +
        "Boat's loaded. Say the word.",
      responses: [
        { text: "[Cross to Liberty Island.]", action: () => go("lancers") },
        { text: "Not yet." },
      ],
    },
  });
  // the Rotorcraft: Hale's tree (the boarding moved here from the Act IV file)
  ms.inject("dlg_con_hale", {
    start: () => (at("mq24", "rotorcraft") ? "ms24_rotor" : null),
    nodes: {
      ms24_rotor: {
        text: () =>
          "The Rotorcraft is fuelled and the pilot is only mildly terrified. Liberty Island is ten minutes away. Last chance to change your mind, Mr. " +
          String(L.heroName()).split(" ").pop() +
          "." +
          (L.flag("hale_defects")
            ? " [Lower:] When you land, the Sky-Eye net will have a technical fault. I am told they are very common."
            : ""),
        responses: [
          { text: "Let's go.", action: () => go("rotorcraft") },
          { text: "Not yet." },
        ],
      },
    },
  });
  // Arrived on Liberty without the crossing's own exit (Ossie's plain ferry ride while mq24 ran): settle Rose.
  G.events.on("ferryArrived", (where) => {
    if (
      where !== "liberty" ||
      !Q.isStarted("mq24") ||
      ms.f("rose_on_liberty") ||
      ms.f("rose_overwatch")
    )
      return;
    if (rose.mode() === "follow" && ms.trust() >= 2) roseComes();
    else roseStays();
  });
