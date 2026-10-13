// play-inline-567 07 — next
// Lines 1572-1909 of readable/play-inline-567.pretty.js (statement-aligned).
  G.events.on("questFlag", (name, v) => {
    if (name === "ms_nell" && v === "kept" && !ms.hasToken("nell"))
      ms.token("nell");
  });
  L.hook("init", function () {
    ms.quest({
      id: "mq16",
      giver: "Old Mac",
      location: "The Octagon, Blackwell's Island; Old Mac's lighthouse",
      desc: () =>
        "Nell Brady, Nicole's roommate, had herself committed to the Octagon asylum on 19 February 1967 to find out what Project Long Winter was, because Nicole was worried about " +
        first() +
        ". " +
        "Her three tape reels are still inside, and Old Mac, the lighthouse keeper on Blackwell's Island, wants them heard." +
        (Q.isComplete("mq16")
          ? L.flag("ms_nell") === "kept"
            ? " " + first() + " kept the reels."
            : " The reels went out over the beacon: the city has heard that someone knew."
          : ""),
      stages: [
        ms.proxy("mq16", "pr_tendays", {
          id: "tapes",
          text: "Find Nell Brady's three tape reels in the Octagon on Blackwell's Island.",
          next: null,
          reach: {
            site: P.octagon.site,
            anchors: P.octagon.anchors,
            fallback: P.octagon.fallback,
            label: "The Octagon",
            r: 18,
          },
          onEnter() {
            L.later(2, () =>
              L.news(
                "Message for the sleeper from Old Mac, the lighthouse fella out on Blackwell's Island. Says a reporter named Nell Brady hid three tape reels in the old Octagon asylum back in '67, " +
                  "and that Nell roomed on Tudor Place with a girl from the UN. Says you'd want to know. Says bring a flashlight. Says the Superintendent glows.",
              ),
            );
          },
          onDone: nellMirror,
        }),
      ],
      rewards: { xp: 420 },
      onComplete() {
        nellMirror();
        L.later(1.5, () =>
          L.notify(
            '"Nicky, if you hear this, get out of the city." She didn\'t. She went to Grand Central, and down.',
            { duration: 7 },
          ),
        );
      },
    });
  });
  ms.solver("mq16", {
    tapes() {
      if (Q.get("pr_tendays")) {
        if (!L.flag("ms_nell")) L.setFlag("ms_nell", "broadcast");
        if (!Q.isStarted("pr_tendays")) Q.start("pr_tendays");
        Q.complete("pr_tendays");
      } else {
        nellMirror();
        Q.complete("mq16");
      }
    },
  });

  // ==================================================================
  // mq17 — THE DAWN HOUR
  // ==================================================================
  const inWindow = () => {
    const h = G.time && G.time.hour;
    return typeof h === "number" && h >= 5.7 && h < 6.75;
  };
  const clock = () => {
    if (G.atmos && G.atmos.clockString) {
      try {
        return G.atmos.clockString();
      } catch (e) {
        /* */
      }
    }
    const h = (G.time && G.time.hour) || 0,
      hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    return hh + ":" + (mm < 10 ? "0" : "") + mm;
  };
  /** Wait on Rocky's couch until 05:47 (in-world clock). */
  function waitDawn() {
    L.overlay("#000000", 0.5, 0.8, 1.2, 0.95);
    const T = G.time;
    if (!T) return;
    if (G.atmos && G.atmos.setHour) {
      try {
        G.atmos.setHour(5.79, { advanceDay: true });
        return;
      } catch (e) {
        /* */
      }
    }
    if (T.hour > 5.79) T.day = (T.day || 1) + 1;
    T.hour = 5.79;
  }
  function nearRocky() {
    const a = L.npc("rc_rocky");
    if (a && a.pos && !a.dead)
      return { fallback: { x: a.pos.x + 2.2, z: a.pos.z + 1.4, y: a.pos.y } };
    return {
      site: P.radio.site,
      anchors: P.radio.anchors,
      fallback: P.radio.fallback,
    };
  }
  function buildFinder(src) {
    if (src === "coil") L.take("ms_neon_coil", 1);
    if (!L.has("ms_direction_finder")) L.give("ms_direction_finder", 1);
    if (!ms.f("finder_built")) {
      ms.set("finder_built", src || true);
      L.xp(
        40,
        src === "skill" ? "Electronics: Sugar Ray" : "The direction-finder",
      );
    }
    if (at("mq17", "finder")) Q.setStage("mq17", "bearings");
  }
  function sermonDone() {
    L.setFlag("ms_rose_mouthed");
    ms.set("dawn_bearing");
    if (at("mq17", "bearings")) Q.setStage("mq17", "relay");
  }
  function relayFound() {
    L.setFlag("ms_relay_found");
    if (at("mq17", "relay")) Q.setStage("mq17", "cable");
  }
  function cableFound() {
    L.setFlag("ms_cable_followed");
    if (at("mq17", "cable")) Q.setStage("mq17", "choice");
  }
  function relayChoice(kind) {
    if (ms.f("dawn_relay")) return;
    ms.set("dawn_relay", kind);
    if (kind === "replied") {
      ms.set("eli_replied");
      ms.token("voice");
      if (ms.f("waldorf_jammer_down") || L.skill("electronics") >= 50) {
        ms.set("voice_reached");
        L.news(
          "Funny thing on the dial last night, folks. The Dawn Hour's carrier came up at two in the morning all by itself, played eleven seconds of a man's voice, and went off again. Nobody up here sent it. Somebody down there played it back.",
        );
      }
    } else if (kind === "cut") {
      ms.set("dawn_relay_cut");
      ms.set("glow_wary");
      L.setFlag("ms_glow_wary");
      L.later(4, () =>
        L.news(
          "Quiet morning, folks. For the first time since 1979 there was no Dawn Hour at five forty-seven. Rocky slept in. Rocky doesn't know how to feel about that.",
        ),
      );
    } else ms.set("dawn_relay_left");
    if (Q.isActive("mq17")) Q.complete("mq17");
  }

  ms.inject("dlg_rc_rocky", {
    start: () =>
      at("mq17", "rocky")
        ? "mq17_job"
        : at("mq17", "finder")
          ? "mq17_finder"
          : at("mq17", "bearings")
            ? "mq17_bear"
            : atAny("mq17", ["relay", "cable", "choice"])
              ? "mq17_status"
              : null,
    nodes: {
      mq17_job: {
        speaker: '"Rocky" Delgado',
        text:
          "Popsicle. Sit. [He has a city map pinned over the sound board with three pencil lines on it that don't meet.] Every morning since 1979, five forty-seven on the dot, the Dawn Hour steps right on top of me. " +
          "Ten years I've been trying to find where she's coming from and ten years I get static and scripture. After that letter they sent you? I want to know. I think you want to know more.",
        responses: [{ text: "How do we find her?", next: "mq17_job2" }],
      },
      mq17_job2: {
        text:
          "Direction-finder. A loop antenna you turn till the signal goes quiet; the quiet points at her. Two of those from two places, and where the lines cross, that's your church. I've got the headset and the compass. I need the loop. " +
          "You good with a soldering iron, pal? If not, Crowe in the Neon has crates of sign transformers. Wind one of those right and it'll hear a mouse in Jersey.",
        onEnter() {
          if (at("mq17", "rocky")) Q.setStage("mq17", "finder");
        },
        responses: [
          {
            text: "[Electronics 30] Hand me the iron.",
            check: { skill: "electronics", value: 30 },
            next: "mq17_built",
            failNext: "mq17_burnt",
          },
          {
            text: "I brought one of Crowe's transformers.",
            cond: () => L.has("ms_neon_coil"),
            next: "mq17_coil_built",
          },
          { text: "I'll get a transformer from the Neon." },
        ],
      },
      mq17_finder: {
        speaker: '"Rocky" Delgado',
        text: "How's my loop coming, Popsicle?",
        responses: [
          {
            text: "[Electronics 30] Let me build it here.",
            check: { skill: "electronics", value: 30 },
            next: "mq17_built",
            failNext: "mq17_burnt",
          },
          {
            text: "I brought one of Crowe's transformers.",
            cond: () => L.has("ms_neon_coil"),
            next: "mq17_coil_built",
          },
          { text: "Still working on it." },
        ],
      },
      mq17_built: {
        text: "[An hour, a burnt thumb and a broom handle later, the loop turns smooth on its pivot and the headset hisses like the sea.] Look at that. Look at THAT. I'm calling her Sugar Ray. She points at whoever's doing the talking.",
        onEnter() {
          buildFinder("skill");
        },
        responses: [{ text: "Now what?", next: "mq17_bear" }],
      },
      mq17_coil_built: {
        text: "[Rocky unwraps Crowe's transformer like a Christmas present, strips the windings and coils them round a bicycle wheel.] Mayor's good for something after all. There. Sugar Ray. She points at whoever's doing the talking.",
        onEnter() {
          buildFinder("coil");
        },
        responses: [{ text: "Now what?", next: "mq17_bear" }],
      },
      mq17_burnt: {
        text: "[The iron slips. Something on the board goes pop, and the room smells of hot rosin and regret.] Okay. Okay! Nobody's hurt. Get me one of Crowe's transformers from the Neon, pal, and let the professionals hold the hot end.",
        responses: [{ text: "I'll get a transformer." }],
      },
      mq17_bear: {
        speaker: '"Rocky" Delgado',
        text: () =>
          inWindow()
            ? "She's on. Five forty-seven, right on time. Grab the loop. Jory's on the Chrysler roof with the spare set and a walkie-talkie, ready to take the second line."
            : "Now we wait. She's on at five forty-seven and not a minute before. It's " +
              clock() +
              ". Jory's going up the Chrysler with the spare set for the second line. Couch is there. It's clean. It's cleaner than it looks.",
        responses: [
          {
            text: "[Swing the loop and listen.]",
            cond: inWindow,
            next: "mq17_tune1",
          },
          {
            text: "[Wait on Rocky's couch until 05:47.]",
            cond: () => !inWindow(),
            action: () => waitDawn(),
            next: "mq17_tune1",
          },
          { text: "I'll come back before dawn." },
        ],
      },
      mq17_tune1: {
        speaker: "THE DAWN HOUR (radio)",
        text:
          "[The headset fills with a woman's voice, low and careful, wrapped in so much echo it could be coming from the bottom of a well.]\n\n" +
          '"Good morning, children. It is five forty-seven. The list has returned, and the Sun has been patient with us for one more night. Let me tell you about the sleeper."',
        responses: [
          { text: "[Turn the loop slowly. Listen.]", next: "mq17_tune2" },
        ],
      },
      mq17_tune2: {
        speaker: "THE DAWN HOUR (radio)",
        text: '"Wake me when it\'s spring, the sleeper said. And the Dawn said: I will keep the light on."',
        responses: [{ text: "[...]", next: "mq17_rocky" }],
      },
      mq17_rocky: {
        speaker: '"Rocky" Delgado',
        text: "[Rocky has stopped writing. He looks at you over the top of the headset.] Funny. That's your line, Popsicle.",
        responses: [{ text: "[Look at Flint.]", next: "mq17_flint" }],
      },
      mq17_flint: {
        speaker: " ",
        text: () =>
          '[Flint is sitting on Rocky\'s tube crate with a socket wrench forgotten in her hand. Her lips are moving, half a beat ahead of the radio: "...and the light was kept, every February, for the one who slept." ' +
          "Then the voice in the headset says it, word for word. Flint sees you watching. She shuts her mouth, finds something urgent to do with the tube rack, and does not look up again.]",
        onEnter() {
          L.setFlag("ms_rose_mouthed");
        },
        responses: [{ text: "[Take the bearing.]", next: "mq17_fix" }],
      },
      mq17_fix: {
        speaker: '"Rocky" Delgado',
        text:
          '[Rocky swings the loop until the voice drops to a whisper.] Null at zero-nine-seven. [The walkie-talkie crackles: "Chrysler, two-one-four, Jory out."] Two-one-four from the Chrysler... ' +
          "[He draws two lines on the map. They cross on Forty-Second Street, a block from the river side of Grand Central.] First Journal Building. The globe. She's not broadcasting from there, Popsicle: that's a relay. Something feeds it. Go see what.",
        onEnter() {
          sermonDone();
        },
        responses: [{ text: "On my way." }],
      },
      mq17_status: {
        speaker: '"Rocky" Delgado',
        text: () =>
          at("mq17", "relay")
            ? "First Journal Building, Popsicle. The globe room. Mind the robes."
            : at("mq17", "cable")
              ? "A cable? Going where? Follow it, pal. Rocky needs an ending."
              : "Your call, pal. Cut it, leave it, or say something into it. I'd know what I'd say. I just don't know if I'd want it heard.",
        responses: [{ text: "Right." }],
      },
    },
  });
  ms.inject("dlg_neon_crowe", {
    start: () =>
      at("mq17", "finder") &&
      !L.has("ms_neon_coil") &&
      !ms.f("finder_built") &&
      !L.flag("ms_coil_given")
        ? "mq17_coil"
        : null,
    nodes: {
      mq17_coil: {
        speaker: "Mayor Lucius Crowe",
        text:
          "A sign transformer? For a radio direction-finder? To find the Dawn Hour? [He is already rummaging in a crate behind the stage.] Citizen, every morning at five forty-seven that woman tells my people the Sun does not choose. " +
          "My people were chosen, in March of '67, by a sunrise over Yonkers. [He hands you a heavy coil wrapped in sacking.] Take it. Take two. Tell Rocky the Neon sends its regards and wants a request played.",
        onEnter() {
          L.setFlag("ms_coil_given");
          if (!L.has("ms_neon_coil")) L.give("ms_neon_coil", 1);
        },
        responses: [{ text: "Thanks, Mayor." }],
      },
    },
  });

  // The relay in the First Journal globe room: acolytes and Brother Taper.
