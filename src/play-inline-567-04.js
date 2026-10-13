// play-inline-567 04 — the
// Lines 638-955 of readable/play-inline-567.pretty.js (statement-aligned).
  ms.inject("dlg_glow_ezra", {
    start: () => (at("mq12", "keeper") ? "mq12_keeper" : null),
    nodes: {
      mq12_keeper: {
        speaker: "Keeper Ezra Hollowell",
        text: () => {
          const g = L.flag("ms_glow");
          if (g === "planted")
            return "Bearer of the Light! I watched the market's tower from the bell loft. It glows like a second dawn. [His joy is entirely real, which is the worst of it.] And you have read the Book. Good. Good.";
          if (g === "convinced")
            return "[He looks tired, and lighter.] I have been praying on what you said. A Light that asks, instead of insisting. I am not sure the Dawn will like it. I am not sure I care. And you have read the Book.";
          if (g === "placebo")
            return "The market's tower glows a lovely blue, they tell me. [He beams.] And you have read the Book. You see now why we keep the Light.";
          return "[He folds his hands into his sleeves.] Grand Central's water is as clean as it ever was, and you have read our Book all the same. The Light does not hold a grudge, friend. I try not to.";
        },
        responses: [
          {
            text: "The match. The clerk. The candles. That's my story, Keeper. Mine and hers.",
            next: "mq12_book",
          },
        ],
      },
      mq12_book: {
        text: "It is everybody's story now, friend. That is what a scripture is: a private thing that was given away. [He touches the sun disc on his chest.] The Dawn gave us the words, in the first hard winters. Where she found them I never asked; you do not ask a lamp where it got its oil. I had the fire in me, and nothing to say with it. She had the words. I only ever stammered.",
        responses: [
          { text: "Who is the Dawn?", next: "mq12_dawn" },
          { text: "Is Nicole Mead one of your kindled?", next: "mq12_stone" },
        ],
      },
      mq12_dawn: {
        text: "The one who keeps the light on for all of us. She does not come up into the day, and we do not say the name she had before. [Gently.] Whatever it is you are hoping, sleeper, hope it gently. Hope breaks easily down here.",
        responses: [
          { text: "Is Nicole Mead one of your kindled?", next: "mq12_stone" },
        ],
      },
      mq12_stone: {
        text: "We do not keep the old names. We lay them down. [He nods toward the north side of the cathedral, where a garden has gone to seed inside the railings, full of flat grey stones.] If you must look for a name, look in the garden. But do not dig. The Rule is the Rule.",
        onEnter() {
          L.setFlag("ms_garden_hint");
        },
        responses: [
          { text: "[Leave him to his Light.]", action: () => completeMq12() },
        ],
      },
    },
  });

  L.hook("init", function () {
    ms.quest({
      id: "mq12",
      giver: "Keeper Ezra Hollowell",
      location: "St. Patrick's Cathedral; Grand Central's water tower",
      desc: () =>
        "Keeper Hollowell's service: bless Grand Central's water tower with a Blessed Isotope. Whatever " +
        first() +
        " does with it decides who trusts him: the cult, the market, Flint. " +
        "The Book of the Kindling is read only to those who have served." +
        (ms.f("book_read")
          ? " It is written in Nicole's phrases: the match in the blackout, ninety days of winter, and one rule: the Sun does not choose."
          : ""),
      stages: [
        ms.proxy("mq12", "sq_glow", {
          id: "service",
          text: "Do Keeper Hollowell's service: the Blessed Isotope and Grand Central's water tower.",
          next: "book",
          reach: {
            site: "st_patricks",
            anchors: ["preacher", "altar", "entrance"],
            fallback: { x: 124, z: -342 },
            label: "Keeper Hollowell",
            r: 12,
          },
          onDone() {
            if (N().glowMirror) N().glowMirror();
          },
        }),
        {
          id: "book",
          text: "Read the Book of the Kindling: the teletype by St. Patrick's altar (passcode LONGNOON, from Sister Noonday), or ask Sister Noonday to recite it.",
          onEnter() {
            L.later(0.3, () => {
              if (ms.f("book_read") && at("mq12", "book"))
                Q.setStage("mq12", "keeper");
            });
          },
          markers: () =>
            ms
              .termMarker(
                "glow_scripture",
                "The Book of the Kindling (teletype)",
              )
              .concat([{ npc: "glow_sister", label: "Sister Noonday" }]),
        },
        {
          id: "keeper",
          text: "Return to Keeper Hollowell.",
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
      ],
      rewards: { xp: 380 },
      onComplete() {
        if (N().glowMirror) N().glowMirror();
      },
    });
  });
  ms.solver("mq12", {
    service() {
      if (Q.get("sq_glow")) {
        L.setFlag("glow_told_delphine");
        if (N().refuseIsotope) N().refuseIsotope();
        else {
          if (!Q.isStarted("sq_glow")) Q.start("sq_glow");
          Q.complete("sq_glow");
        }
      } else Q.setStage("mq12", "book");
    },
    book() {
      ms.kindlingRead("all", "solver");
      if (at("mq12", "book")) Q.setStage("mq12", "keeper");
    },
    keeper() {
      L.setFlag("ms_garden_hint");
      completeMq12();
    },
  });

  // ==================================================================
  // mq13 — NEON HEART (Crowe's riot; sq_neon; the TRACK 61 bulkhead)
  // ==================================================================
  function heardRiot() {
    if (!L.flag("ms_crowe_riot")) {
      L.setFlag("ms_crowe_riot");
      ms.set("crowe_riot");
      L.xp(40, "An eyewitness");
    }
  }
  function toBattery() {
    heardRiot();
    if (at("mq13", "crowe")) Q.setStage("mq13", "battery");
  }
  ms.inject("dlg_neon_crowe", {
    start: () => (at("mq13", "crowe") ? "mq13_crowe" : null),
    nodes: {
      mq13_crowe: {
        speaker: "Mayor Lucius Crowe",
        text: '[You say "the Sixty-One Camp" and the Mayor\'s showman smile goes away entirely. What is left is an old man with a burned face.] Sit down, citizen. Not on the crate; the crate is the treasury.',
        onEnter() {
          L.setFlag("met_crowe");
        },
        responses: [
          {
            text: "Tobias Wren's Register says there was a riot at the Relief Station in '68. Were you there?",
            next: "mq13_riot1",
          },
        ],
      },
      mq13_riot1: {
        text:
          "I was there. Nobody without a card was let below, so we traded at the top of the ramp, by the Relief Station. OCD boys in clean helmets behind a counter, a ration store at the back with a steel door, and a line every morning. " +
          "Medicine for card-holders: enrolled in '67, card in your hand, or back down the stairs you went. [He turns his hat round in his hands.] There was a woman from below who handed out candles. Everybody knew her. That winter her baby got the cough. " +
          "She stood in that line every morning for two weeks with the baby inside her coat, and every morning the lieutenant behind the glass said the same word to her.",
        responses: [{ text: "What happened?", next: "mq13_riot2" }],
      },
      mq13_riot2: {
        text:
          "The fifth of March. A year to the day. Somebody had carried a crate of candles up for the anniversary, and the whole concourse was lit like a birthday. [A long pause.] " +
          "She walked up to that counter with a candle in one hand and a match in the other, and she set light to the paper on it. Then the crate. Then the place went up like a hay barn. People ran for the medicine, people ran for the store, the OCD boys ran for the doors.\n\n" +
          "[He is very quiet.] She came out of the fire with a baby in one arm and her hand on fire. Behind her, eleven kids didn't come out.",
        onEnter() {
          heardRiot();
        },
        responses: [
          { text: "The baby?", next: "mq13_riot3" },
          { text: "[Say nothing.]", next: "mq13_riot3" },
        ],
      },
      mq13_riot3: {
        text:
          "Alive. I heard it crying all the way down the stairs. The robes had her by then, Hollowell's lot, carrying her down the tracks into the dark with the baby still yelling. " +
          "The OCD wrote her up as dead in the morning and welded the lower level shut. Eleven kids in the ration store. Twelve dead, the Continuity says; they count their captain. " +
          "[He puts his hat back on, carefully.] I never once judged her, citizen. I've just never stopped hearing it.",
        responses: [{ text: "Thank you, Mayor.", next: "mq13_pivot" }],
      },
      mq13_pivot: {
        text: () =>
          "[The showman comes back, slowly, like a man getting into a cold coat.] Now. I've a problem of my own, and it's the opposite of fire. " +
          (Q.isComplete("sq_neon")
            ? "Except you've already seen to it, haven't you. The Neon owes you, and the Neon pays its debts, eventually."
            : "The Big Buzz is dying, and there's a spare rig battery down in the 42nd Street tunnels. Glowkeeper robes have been seen down there all week with lanterns, looking for something heavy. I'd like it to be us who finds it."),
        responses: [
          {
            text: "I'll find your battery before they do.",
            cond: () => !Q.isComplete("sq_neon"),
            action: () => toBattery(),
          },
          {
            text: "Glad it worked out, Mayor.",
            cond: () => Q.isComplete("sq_neon"),
            action: () => toBattery(),
          },
        ],
      },
    },
  });
  // Glowkeeper acolytes in the tunnels, after the same battery.
  for (let i = 1; i <= 2; i++) {
    const id = "ms_n13_acolyte" + i;
    ms.actor({
      id,
      removeWhenOff: false,
      when: () =>
        at("mq13", "battery") &&
        !L.has("q_neon_core") &&
        !L.flag("neon_core_resolved") &&
        !!coreSpot(),
      def: () => {
        const c = coreSpot() || { x: -60, z: -228 };
        return {
          type: "human",
          name: "Glowkeeper Acolyte",
          gender: i === 1 ? "m" : "f",
          outfit: "glowkeeper_robes",
          faction: "glowkeepers",
          hostile: !glowFriendly(),
          ai: "guard",
          home: "here",
          homeR: 5,
          level: 6,
          weapon: ["pipe_pistol", "bolt_rifle_32", "knife"],
          at: {
            fallback: {
              x: c.x + (i === 1 ? 3.5 : -3),
              z: c.z + (i === 1 ? 2 : -2.5),
              y: c.y,
            },
            maxR: 6,
          },
          barks: [
            "The Dawn needs it more than the Neon does.",
            "Go back up into the day, topsider.",
            "The Sun does not choose. We do.",
          ],
        };
      },
    });
  }
  // The card one of them carried ("on an acolyte's body"), by the fallen acolyte or by the battery.
  ms.pickup({
    key: "ms_acolyte_card",
    item: "ms_note_acolyte",
    when: () =>
      Q.isStarted("mq13") &&
      (L.isDead("ms_n13_acolyte1") ||
        L.has("q_neon_core") ||
        !!L.flag("neon_core_resolved")) &&
      !!coreSpot(),
    at: {
      get x() {
        return cardPos().x;
      },
      get z() {
        return cardPos().z;
      },
      get y() {
        return cardPos().y;
      },
    },
  });
  function cardPos() {
    const a = L.npc("ms_n13_acolyte1");
    if (a && a.pos) return { x: a.pos.x + 0.6, z: a.pos.z, y: a.pos.y };
    const c = coreSpot() || { x: -60, z: -228, y: 0 };
    return { x: c.x + 1.2, z: c.z + 0.4, y: c.y };
  }
  // The welded TRACK 61 bulkhead (the lair's own bulkhead anchor when src/lair has built it).
  function bulkheadAt() {
    try {
      if (G.lair && G.lair.getAnchor) {
        const a = G.lair.getAnchor("bulkhead");
        if (a && isFinite(a.x))
          return {
            site: "lair",
            anchors: ["bulkhead"],
            fallback: { x: a.x, z: a.z, y: a.y },
            dx: 1.3,
          };
      }
    } catch (e) {
      /* */
    }
    const c = coreSpot();
    return {
      site: "grand_central",
      anchors: ["track61_bulkhead"],
      fallback: c ? { x: c.x + 6, z: c.z - 4, y: c.y } : { x: 254, z: -214 },
    };
  }
  ms.spot({
    id: "ms_spot_bulkhead",
    label: "Welded bulkhead (TRACK 61)",
    verb: "Examine",
    radius: 1.3,
    when: () => Q.isStarted("mq13"),
    get at() {
      return bulkheadAt();
    },
    use() {
      const firstTime = !ms.f("bulkhead_seen");
      ms.set("bulkhead_seen");
      L.notify(
        "A steel bulkhead across the old service passage, welded along every seam, the beads gone brown with rust. Stencilled across it: TRACK 61. NO ADMITTANCE. OCD 1968.\n\n" +
          "Over the stencil, in chalk so fresh it comes off on your fingertip: suns with twelve rays, a dozen of them, and a candle stub melted to the floor in front of each.",
        { duration: 11 },
      );
      if (firstTime) L.xp(30, "TRACK 61");
    },
  });

