// play-inline-567 08 — next
// Lines 1910-2249 of readable/play-inline-567.pretty.js (statement-aligned).
  for (let i = 1; i <= 2; i++) {
    ms.actor({
      id: "ms_n17_acolyte" + i,
      removeWhenOff: false,
      when: () => atAny("mq17", ["relay", "cable"]),
      def: () => ({
        type: "human",
        name: "Glowkeeper Acolyte",
        gender: i === 1 ? "f" : "m",
        outfit: "glowkeeper_robes",
        faction: "glowkeepers",
        hostile: !glowFriendly(),
        ai: "guard",
        home: "here",
        homeR: 4,
        level: 7,
        weapon: ["bolt_rifle_32", "pipe_pistol", "knife"],
        at: P.relayGuard(i - 1),
        barks: [
          "The Dawn is speaking. Be quiet.",
          "This is a holy wire, stranger.",
          "Keep the light on.",
        ],
      }),
    });
  }
  ms.actor({
    id: "ms_taper_relay",
    when: () => atAny("mq17", ["relay", "cable", "choice"]),
    def: () => ({
      type: "human",
      preset: "taper",
      name: "Brother Taper",
      gender: "m",
      age: 50,
      outfit: "glowkeeper_robes",
      faction: "glowkeepers",
      hostile: false,
      essential: true,
      ai: "guard",
      home: "here",
      homeR: 2,
      level: 8,
      dialogue: "dlg_ms_taper_relay",
      at: Object.assign({ maxR: 6 }, P.relay),
      barks: [
        "Mind the wire, sleeper.",
        "She'll be on again at five forty-seven. She always is.",
      ],
    }),
  });
  ms.dlg("dlg_ms_taper_relay", "hello").add({
    hello: {
      speaker: "Brother Taper",
      text: () =>
        L.flag("ms_taper_relay_met")
          ? "Still here, sleeper. So is the wire."
          : "[A broad man in grey robes, a lantern at his feet though the room has daylight, sits beside a car battery and a tape deck with a microphone hung on a coat hanger. You know him: the robe with the lantern on Chambers Street, the morning you woke.] " +
            "You found our little candle on the air. Brother Taper. [He doesn't get up.] I am a messenger, sleeper, not a guard. The guards are the ones with the pipes.",
      onEnter() {
        L.setFlag("ms_taper_relay_met");
      },
      responses: [
        { text: "Where does the Dawn Hour come from?", next: "wire" },
        { text: "You were watching me on Chambers Street.", next: "chambers" },
        { text: "Tell the Dawn I'm looking for Nicole Mead.", next: "name" },
        { text: "Goodbye, Brother." },
      ],
    },
    wire: {
      text: "Down. [He points at the floor, where a lead-sheathed cable drops through a hole cut in the parquet.] She speaks below, the wire carries her up, the globe sends her out. Follow it if you like. It goes where the light is kept.",
      onEnter() {
        relayFound();
      },
      responses: [{ text: "I will." }],
    },
    chambers: {
      text: "Somebody had to. I was asked to see that you came out of that door all right, and you did. [He smiles.] A girl with a rifle disagreed with me about the watching. I used to carry a little girl on my shoulders, down below, a long time ago. Little Sun, we called her. She'd be grown now.",
      responses: [{ text: "Where does the wire go?", next: "wire" }],
    },
    name: {
      text: "We don't keep the old names, sleeper. [He picks up his lantern and looks at it.] But I'll tell her a sleeper asked. She will know which one.",
      responses: [{ text: "Where does the wire go?", next: "wire" }],
    },
  });
  ms.spot({
    id: "ms_spot_relay",
    radius: 1.2,
    at: P.relaySpot,
    verb: () => (at("mq17", "choice") ? "Decide" : "Examine"),
    label: () =>
      at("mq17", "choice")
        ? "The Dawn Hour relay (decide)"
        : "The Dawn Hour relay",
    when: () => atAny("mq17", ["relay", "cable", "choice"]),
    use() {
      if (at("mq17", "choice")) {
        ms.talk("dlg_ms_relay", "The Dawn Hour Relay");
        return;
      }
      if (at("mq17", "relay")) {
        L.notify(
          "Under the great dusty globe: a car battery, a reel-to-reel deck, a microphone hung from a coat hanger, and a lead-sheathed cable that drops through a hole in the floor and away down the stairwell, east under 42nd Street. Every morning the Dawn Hour comes up this wire and goes out from the old mast on the roof.",
          { duration: 10 },
        );
        relayFound();
        return;
      }
      L.notify(
        "The cable runs down the stairwell and out under the street. Follow it.",
      );
    },
  });
  ms.spot({
    id: "ms_spot_cable_grate",
    radius: 1.4,
    at: P.grate,
    label: "Storm grate (the cable)",
    verb: "Look down",
    when: () => at("mq17", "cable"),
    use() {
      L.notify(
        "The cable surfaces in a gutter on 42nd Street and goes down again through a storm grate, west, toward Grand Central. Warm air breathes up through the bars, and with it a smell you know from the cathedral: candle wax, a great deal of it. " +
          "Somewhere below, under the Terminal, the wire goes where the light is kept.",
        { duration: 10 },
      );
      cableFound();
    },
  });
  ms.dlg("dlg_ms_relay", "choose").add({
    choose: {
      text: "[The relay hums. The reel-to-reel has a RECORD key, and the wire goes down into the dark under 42nd Street. Whatever you put on this tape tonight goes down that wire before five forty-seven.]",
      responses: [
        { text: "[Record a reply.]", next: "reply" },
        { text: "[Cut the cable.]", next: "cut" },
        { text: "[Leave it be.]", next: "leave" },
        { text: "[Not yet.]" },
      ],
    },
    reply: {
      text: () =>
        "[You press RECORD. The tape hiss fills the little room. You have had twenty-two years and two weeks to think of something, and in the end you say what is true.]\n\n\"Nicky. It's " +
        first() +
        ". I'm awake.\"\n\n[You stop the tape. Your hand is shaking a little.]",
      responses: [
        {
          text: "[Let it go down the wire.]",
          action: () => relayChoice("replied"),
          next: "reply_out",
        },
      ],
    },
    reply_out: {
      text: () =>
        ms.f("voice_reached")
          ? (ms.f("waldorf_jammer_down")
              ? "[With the Waldorf jammer dead, the line is clean all the way down. "
              : "[The jam still gnaws at the carrier, but you know this kind of rig: you tune the playback under the noise. ") +
            "The needle on the line meter kicks, twice, the way a line kicks when somebody at the far end lifts a receiver. Then nothing.]"
          : "[The Waldorf's jammer chews the carrier into static. Whatever went down the wire went down in pieces. Maybe some of it got through. Maybe none.]",
      responses: [{ text: "[Step back from the relay.]" }],
    },
    cut: {
      text: "[You take the cable in both hands and cut it with Taper's own fire axe from the wall bracket. The lead sheath parts with a sound like a bone. The hum stops. Somewhere below, somebody is about to find out.]",
      onEnter() {
        relayChoice("cut");
      },
      responses: [{ text: "[Step back.]" }],
    },
    leave: {
      text: "[You leave the relay humming. Tomorrow, at five forty-seven, she will speak again, and you will know where the wire goes.]",
      onEnter() {
        relayChoice("left");
      },
      responses: [{ text: "[Step back.]" }],
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq17",
      giver: '"Rocky" Delgado',
      location: "Radio City; the Chrysler roof; the First Journal Building",
      desc: () =>
        "Every morning at 05:47 the Glowkeepers' pirate Dawn Hour steps on Rocky's signal. " +
        first() +
        " and Rocky set out to trace it." +
        (ms.f("dawn_bearing")
          ? " The sermon used " +
            first() +
            "'s own words: \"Wake me when it's spring.\" The bearings cross at the First Journal Building."
          : "") +
        (L.flag("ms_cable_followed")
          ? " The relay there is fed by a cable that runs under 42nd Street toward Grand Central."
          : ""),
      stages: [
        {
          id: "rocky",
          text: "Talk to Rocky at Radio City about the Dawn Hour.",
          markers: () => [{ npc: "rc_rocky", label: '"Rocky" Delgado' }],
        },
        {
          id: "finder",
          text: () =>
            "Build a direction-finder with Rocky (Electronics 30), or bring him a sign transformer from Mayor Crowe in the Neon." +
            (L.has("ms_neon_coil") ? " You have the transformer." : ""),
          onEnter() {
            ms.rose.place("at", nearRocky());
          },
          markers: () =>
            [{ npc: "rc_rocky", label: '"Rocky" Delgado' }].concat(
              L.has("ms_neon_coil") || L.skill("electronics") >= 30
                ? []
                : [{ npc: "neon_crowe", label: "Mayor Crowe (transformer)" }],
            ),
        },
        {
          id: "bearings",
          text: () =>
            "Take a bearing on the Dawn Hour with Rocky when it airs at 05:47 (it is " +
            clock() +
            ").",
          onEnter() {
            if (ms.rose.mode() !== "at") ms.rose.place("at", nearRocky());
          },
          markers: () => [{ npc: "rc_rocky", label: '"Rocky" Delgado' }],
        },
        {
          id: "relay",
          text: "Find the relay in the First Journal Building's globe room.",
          markers: () =>
            L.alive("ms_taper_relay")
              ? [{ npc: "ms_taper_relay", label: "The Dawn Hour relay" }]
              : markAt(P.relay, "The Dawn Hour relay")(),
        },
        {
          id: "cable",
          text: "Follow the relay's cable under 42nd Street to where it goes down toward Grand Central.",
          markers: spotMark("ms_spot_cable_grate", "The cable (storm grate)"),
        },
        {
          id: "choice",
          text: "Decide the relay's fate: record a reply to Nicole, cut it, or leave it.",
          markers: spotMark("ms_spot_relay", "The Dawn Hour relay"),
        },
      ],
      rewards: { xp: 450 },
      onComplete() {
        ms.rose.place("home");
      },
    });
  });
  ms.solver("mq17", {
    rocky() {
      Q.setStage("mq17", "finder");
    },
    finder() {
      buildFinder("skill");
    },
    bearings() {
      sermonDone();
    },
    relay() {
      relayFound();
    },
    cable() {
      cableFound();
    },
    choice() {
      relayChoice("replied");
    },
  });

  // ==================================================================
  // mq18 — THE STONE AND THE GIRL
  // ==================================================================
  function startWalk() {
    ms.rose.place("follow");
    if (at("mq18", "flint")) Q.setStage("mq18", "garden");
  }
  function arriveGarden() {
    if (!at("mq18", "garden")) return;
    Q.setStage("mq18", "stone");
    L.later(0.8, () =>
      ms.rose.say("Third row from the wall. The one with the sun on it."),
    );
  }
  function readStone() {
    L.setFlag("ms_stone_read");
    if (at("mq18", "stone")) Q.setStage("mq18", "confront");
  }
  function reveal() {
    if (!L.flag("ms_rose_revealed")) {
      ms.set("rose_revealed");
      L.xp(100, "Rose");
    }
    ms.rose.apply();
  }
  function digGrave() {
    if (ms.f("stone_dug")) return;
    ms.set("stone_dug");
    ms.set("glow_wary");
    L.setFlag("ms_glow_wary");
    ms.set("eli_doubts");
    L.standing(-20, "Dug up a Kindling stone");
    L.later(2, () =>
      L.notify(
        "Two acolytes on the cathedral steps have stopped sweeping. They are watching you, and they do not look away.",
        { duration: 6 },
      ),
    );
  }
  function heardOut() {
    L.setFlag("ms_rose_heard_out");
    ms.set("knows_second_sun");
    if (!at("mq18", "roof")) return;
    if (hasRing()) Q.setStage("mq18", "ring");
    else Q.complete("mq18");
  }
  function ringTo(kind) {
    if (ms.f("ring")) return;
    ms.set("ring", kind);
    if (kind === "rose") {
      ms.set("ring_to_rose");
      ms.addTrust(2, "You gave her the ring");
    }
    if (kind === "stone") ms.set("ring_on_stone");
    if (kind !== "kept") {
      for (const id of ["ms_ring", "ms_grandmother_ring"])
        if (L.has(id)) L.take(id, 1);
    }
    if (Q.isActive("mq18")) Q.complete("mq18");
  }
  function nearRoof() {
    const p = ms.resolve(ms.rose.HOME);
    if (!p || !G.player) return false;
    const P0 = G.player.pos;
    if (Math.hypot(P0.x - p.x, P0.z - p.z) > 28) return false;
    return !p.anchored || P0.y > (p.y || 0) - 5;
  }
