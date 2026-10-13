// play-inline-567 09 — flag
// Lines 2250-2421 of readable/play-inline-567.pretty.js (statement-aligned).
  L.trigger({
    id: "ms_mq18_garden",
    once: false,
    cooldown: 2,
    r: 12,
    pos: () => ms.resolve(P.garden),
    cond: () => at("mq18", "garden"),
    fire() {
      arriveGarden();
    },
  });

  ms.spot({
    id: "ms_spot_kindling_stone",
    label: "Kindling stone",
    verb: "Read",
    radius: 1.2,
    at: P.stone,
    when: () => Q.reached("mq18", "garden") || Q.isComplete("mq18"),
    use() {
      ms.talk("dlg_ms_stone", "Kindling Stone");
    },
  });
  ms.dlg("dlg_ms_stone", "read").add({
    read: {
      text: () =>
        "[A garden gone to seed inside the cathedral railings: rows of flat grey stones set in the grass, a hundred of them, more, each cut with the same twelve-rayed sun and a name. Under the sun on this one:]\n\n" +
        "NICOLE MEAD\nKINDLED 5 III 1968\n\n" +
        (revealed()
          ? "[Rose stands a little way off and does not look at it.]"
          : '[Behind you, very quietly, Flint says: "That\'s her."]'),
      onEnter() {
        readStone();
      },
      responses: [
        {
          text: "[Senses 6] Look at the ground around the stone.",
          check: { attr: "senses", value: 6 },
          next: "ground",
          failNext: "ground_fail",
          cond: () => !ms.f("stone_undug") && !L.flag("ms_stone_ground_failed"),
        },
        { text: "[Kneel by the stone.]", next: "kneel" },
        {
          text: "[Lay the ring on the stone.]",
          cond: () => at("mq18", "ring") && hasRing(),
          next: "ring_laid",
        },
        {
          text: "[Dig up the grave.]",
          cond: () => Q.reached("mq18", "confront") && !ms.f("stone_dug"),
          next: "dig",
        },
        { text: "[Step back.]" },
      ],
    },
    ground: {
      text: () =>
        "[You crouch. The grass over the plot is old and unbroken, matted with twenty years of roots, and the stone's edge is furred with moss right down into the sod. Nobody has ever cut this turf. Nobody was ever put under it.]" +
        (L.flag("ms_book_rule") || ms.f("book_read")
          ? "\n\n[The Rule of the Kindling: the old name is laid beneath a stone. A name. Not a woman.]"
          : "\n\n[A stone with nothing under it, like a signpost.]"),
      onEnter() {
        ms.set("stone_undug");
        L.xp(40, "Senses: the unbroken ground");
      },
      responses: [{ text: "[Stand up.]" }],
    },
    ground_fail: {
      text: "[Grass, moss, a stone. A grave like a hundred others in this city. You don't know what you expected.]",
      onEnter() {
        L.setFlag("ms_stone_ground_failed");
      },
      responses: [{ text: "[Stand up.]" }],
    },
    kneel: {
      text: "[You kneel. The granite is cold through your knee. You think about a girl laughing in the far corner of the Whispering Gallery, and about Sunday, and about spring.]",
      responses: [{ text: "[Stand up.]" }],
    },
    ring_laid: {
      text: "[You set your grandmother's ring on the stone, in the middle of the sun. It looks very small there. You leave it.]",
      onEnter() {
        ringTo("stone");
      },
      responses: [{ text: "[Step back.]" }],
    },
    dig: {
      text: () =>
        "[You pull up the sod with your hands and a bent trowel from the gardener's bucket. Under the turf the earth is packed hard and has never been turned. A hand's depth down: a flat tobacco tin. Inside it, a stub of candle, and a slip of paper with two words in a careful hand: NICOLE MEAD.]\n\n" +
        "[No box. No bones. A name, buried like a seed.]\n\n" +
        (revealed()
          ? "[Rose, behind you, flat:] Leave it. She's dead to me."
          : "[Flint, behind you, flat:] Leave it. She's dead to me."),
      onEnter() {
        digGrave();
      },
      responses: [{ text: "[Put the tin back. Press the sod down.]" }],
    },
  });

  // Rose's beats (dlg_ms_rose): mq18 first, then the Act II one-offs (each says its piece once).
  const RD = ms.dlg("dlg_ms_rose");
  RD.when(() =>
    at("mq18", "flint")
      ? "mq18_start"
      : at("mq18", "garden")
        ? "mq18_walk"
        : at("mq18", "stone")
          ? "mq18_atstone"
          : at("mq18", "confront")
            ? "mq18_confront"
            : at("mq18", "roof")
              ? nearRoof()
                ? "mq18_roof"
                : "mq18_roof_wait"
              : at("mq18", "ring")
                ? "mq18_ring"
                : null,
  );
  RD.when(() =>
    at("mq17", "finder") || at("mq17", "bearings")
      ? L.flag("ms_rose_mq17_rc")
        ? null
        : "mq17_rc"
      : null,
  );
  RD.when(() =>
    Q.isActive("mq17") &&
    L.flag("ms_rose_mouthed") &&
    !L.flag("ms_rose_mq17_after")
      ? "mq17_after"
      : null,
  );
  RD.when(() =>
    !revealed() &&
    L.flag("ms_glow") === "planted" &&
    Q.isStarted("mq13") &&
    !L.flag("ms_rose_said_planted")
      ? "mq13_planted"
      : null,
  );
  RD.when(() =>
    !revealed() &&
    (L.flag("ms_glow") === "warned" || L.flag("ms_glow") === "convinced") &&
    Q.isStarted("mq13") &&
    !L.flag("ms_rose_said_glow")
      ? "mq13_glow"
      : null,
  );
  RD.when(() =>
    !revealed() && L.flag("ms_crowe_riot") && !L.flag("ms_rose_said_riot")
      ? "mq13_riot"
      : null,
  );
  RD.when(() =>
    !revealed() &&
    ms.f("waldorf_jammer_down") &&
    Q.isStarted("mq14") &&
    !L.flag("ms_rose_said_jam")
      ? "mq14_jam"
      : null,
  );
  RD.when(() =>
    !revealed() && L.flag("ms_lys_chin") && !L.flag("ms_rose_said_chin")
      ? "mq15_chin"
      : null,
  );
  RD.when(() =>
    !revealed() && Q.isComplete("mq16") && !L.flag("ms_rose_said_nell")
      ? "mq16_nell"
      : null,
  );
