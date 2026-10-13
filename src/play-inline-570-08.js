// play-inline-570 08 — flag
// Lines 1910-2251 of readable/play-inline-570.pretty.js (statement-aligned).
  L.hook("init", function () {
    ms.quest({
      id: "mq33",
      giver: "Keeper Ezra Hollowell",
      location: "St. Patrick's Cathedral",
      desc: () =>
        "Hollowell stayed behind in the empty cathedral when the Glowkeepers went below. He has the key to Track 61, and he knows the Dawn's name. He will not say it.",
      stages: [
        {
          id: "confront",
          text: "Confront Keeper Hollowell in St. Patrick's Cathedral. Get the Track 61 key and the route.",
          markers: () =>
            [
              { npc: "glow_ezra", label: "Keeper Hollowell" },
              L.flag("dead_glow_ezra")
                ? {
                    anchor: ["st_patricks", ["altar", "preacher"]],
                    fallback: { x: 168, z: -342 },
                    label: "Ring of Keys",
                  }
                : null,
            ].filter(Boolean),
          onEnter() {
            if (!captive()) rose.place("at", ROSE_SP);
          },
        },
        {
          id: "leave",
          text: "You have the key and the way down. Speak to Sister Noonday about the children, or leave the cathedral.",
          markers: () =>
            ms.f("children_sent") || L.flag("dead_glow_sister")
              ? []
              : [{ npc: "glow_sister", label: "Sister Noonday" }],
        },
        {
          id: "children",
          text: "(Optional) Send the cult's children out of the city with Sister Noonday.",
          sideObjective: true,
          optional: true,
          showIf: () => !!L.flag("ms_mq33_children_known"),
          doneIf: () => !!ms.f("children_sent"),
          failIf: () => !!L.flag("dead_glow_sister") && !ms.f("children_sent"),
          markers: () => [{ npc: "glow_sister", label: "Sister Noonday" }],
        },
      ],
      rewards: { xp: 700, items: [["q_track61_key", 1]] },
      onComplete() {
        if (L.count("q_track61_key") > 1)
          L.take("q_track61_key", L.count("q_track61_key") - 1); // handed over in dialogue + the reward
        if (!ms.f("route_known")) ms.set("route_known");
        if (!ms.f("hollowell"))
          ms.set("hollowell", L.flag("dead_glow_ezra") ? "dead" : "given");
        if (!captive()) rose.place("home");
        if (ms.f("children_sent"))
          L.later(3, () =>
            L.news(
              "Odd sight on the Harlem River Drive this morning, listeners: a nun in yellow pushing a handcart, and thirty-odd kids behind her in a line, holding hands. Heading north. Whoever you are, Sister: Godspeed. Rocky means that.",
            ),
          );
      },
    });
  });
  // leaving the cathedral (or sending the children) closes the quest
  L.trigger({
    id: "ms5_sp_leave",
    once: false,
    cooldown: 2,
    cond: () =>
      stage("mq33") === "leave" &&
      (ms.f("children_sent") ||
        dist2(SP_FB) > 75 ||
        L.flag("dead_glow_sister")),
    fire() {
      Q.complete("mq33");
    },
  });
  ms.solver("mq33", {
    confront() {
      giveKey(ms.f("glow") === "convinced" ? "ally" : "given");
    },
    leave() {
      sendChildren();
      Q.complete("mq33");
    },
  });

  // ==================================================================
  // MQ34 — SUNDAY BEST (Saturday night at Grand Central)
  // ==================================================================
  const GC = { x: 240, z: -230 };
  const OYSTER = {
    site: "grand_central",
    anchors: ["bar", "oyster_bar", "merchant2"],
    fallback: { x: 226, z: -238 },
  };
  const ROSE_STEPS = {
    site: "grand_central",
    anchors: ["whispering_gallery", "bar", "oyster_bar"],
    fallback: { x: 229, z: -236 },
  };
  /** Allies the hero has earned, each with its condition (outline mq34 / NOTES). */
  const ALLIES = [
    {
      id: "lancers",
      name: "Lancers of the Iron Covenant",
      call: true,
      ok: () =>
        L.flag("mq_faction") === "covenant" || ms.f("torch") === "charter",
    },
    {
      id: "hale",
      name: "Lt. Hale and her defectors",
      call: true,
      ok: () => !!L.flag("hale_defects") && !L.flag("hale_dead"),
    },
    {
      id: "keel",
      name: "Major Keel",
      call: true,
      ok: () => ms.f("keel") === "defects",
    },
    {
      id: "kong",
      name: "KONG and his Brutes",
      call: true,
      ok: () => ms.f("kong") === "friend" && !L.flag("kong_dead"),
    },
    {
      id: "neon",
      name: "Captain Kincaid's Neon Guard",
      ok: () =>
        ms.f("sun_battery") === "neon" &&
        !ms.f("kincaid_dead") &&
        !L.flag("dead_neon_capt"),
    },
    {
      id: "gc_guards",
      name: "Grand Central's guards",
      ok: () => ms.f("glow") === "warned",
    },
    {
      id: "lys",
      name: "Mademoiselle Lys",
      ok: () => ms.f("bureau") === "sell" && !L.flag("dead_bs_lys"),
    },
    {
      id: "zeke",
      name: "Zeke Marlow",
      ok: () => ms.f("torch") !== "selective" && !L.flag("dead_lib_zeke"),
    },
    {
      id: "calloway",
      name: "Dr. Ruth Calloway",
      ok: () =>
        !L.flag("dead_ms_calloway") &&
        (!!ms.f("calloway_free") || L.alive("ms_calloway")),
    },
  ];
  const ALLY_BY = {};
  for (const a of ALLIES) ALLY_BY[a.id] = a;
  const musters = () => {
    const m = ms.f("musters");
    return Array.isArray(m) ? m.slice() : [];
  };
  const mustered = (id) => musters().indexOf(id) >= 0;
  function muster(id, quiet) {
    const a = ALLY_BY[id];
    if (!a || !a.ok() || mustered(id)) return false;
    const m = musters();
    m.push(id);
    ms.set("musters", m);
    if (!quiet)
      L.notify(a.name + " will hold the tunnels tomorrow.", {
        sub: "Sunday Best",
        quiet: true,
        duration: 4,
      });
    L.later(0.3, ms.pollRoster);
    return true;
  }
  function rockyCall() {
    if (ms.f("mq34_called")) return;
    ms.set("mq34_called");
    const came = [];
    for (const a of ALLIES) if (a.call && muster(a.id, true)) came.push(a.name);
    L.news(
      "A message for some friends of ours, listeners, and you know who you are. Tomorrow's Sunday. Wear your Sunday best, and wear it to Grand Central tonight. Bring the good boots. That's all. Rocky out.",
    );
    L.later(6, () =>
      L.notify(
        came.length
          ? "Over the evening, word comes back down the line to Grand Central: " +
              came.join(", ") +
              "."
          : "The call goes out. Nobody answers it tonight. Some favours don't stretch this far.",
        { duration: 7 },
      ),
    );
  }
  function closeMuster() {
    if (stage("mq34") === "muster") Q.setStage("mq34", "zeke");
  }
  function zekeDone() {
    ms.set("mq34_zeke");
    muster("zeke", true);
    muster("calloway", true);
    if (stage("mq34") === "zeke")
      Q.setStage("mq34", captive() ? "evac" : "rose");
  }
  function roseChoice(come) {
    if (ms.f("rose_with_eli") || ms.f("rose_stays")) {
      if (stage("mq34") === "rose") Q.setStage("mq34", "evac");
      return;
    }
    if (come && ms.trust() >= 3) ms.set("rose_with_eli");
    else ms.set("rose_stays");
    if (stage("mq34") === "rose") Q.setStage("mq34", "evac");
  }
  function evac(yes) {
    ms.set("mq34_evac_decided");
    if (yes) {
      ms.set("evac_gc");
      L.news(
        "Grand Central Market is closed tomorrow, folks. Stationmaster's orders. Don't ask, don't argue, don't come. Go see your cousins in Queens. Rocky's going to see his.",
      );
    }
    if (stage("mq34") === "evac") Q.setStage("mq34", "sleep");
  }
  function sleepToFive() {
    if (stage("mq34") !== "sleep") return;
    fade(() => {
      passTo(5.0, true);
      L.notify(
        "You sleep the way you slept in 1967: badly, and all at once. Delphine shakes you at five. Down on the concourse, somebody is already lacing boots.",
        { duration: 7 },
      );
    }, 1.4);
    L.later(1.6, () => {
      if (Q.isActive("mq34")) Q.complete("mq34");
    });
  }
  const rollText = () => {
    const m = musters()
      .map((id) => ALLY_BY[id] && ALLY_BY[id].name)
      .filter(Boolean);
    return m.length
      ? "On my board for tomorrow: " + m.join("; ") + "."
      : "My board for tomorrow is empty. That's not a criticism. That's a board.";
  };
  ms.inject("dlg_gc_delphine", {
    start: () => {
      const s = stage("mq34");
      return s === "muster"
        ? "mq34_roll"
        : s === "evac"
          ? "mq34_evac"
          : s === "sleep"
            ? "mq34_sleep"
            : null;
    },
    nodes: {
      mq34_roll: {
        text: () =>
          '[The Stationmaster has a chalkboard propped against the information booth and a stub of chalk behind her ear.] Everybody who walks in and says "Sunday best" gets their name on here and a cot for the night. ' +
          rollText(),
        responses: [
          {
            text: "Will your guards hold the lower stair tomorrow?",
            cond: () => ALLY_BY.gc_guards.ok() && !mustered("gc_guards"),
            next: "mq34_guards",
          },
          {
            text: "Will your guards hold the lower stair tomorrow?",
            cond: () =>
              !ALLY_BY.gc_guards.ok() && !L.flag("ms_mq34_guards_asked"),
            next: "mq34_noguards",
          },
          { text: "That's everyone who's coming.", next: "mq34_closed" },
          { text: "Not yet. I've got more people to ask." },
        ],
      },
      mq34_guards: {
        text: "You warned us about the water tower when you could have looked the other way. Kowalski and Ng have been waiting all week for somebody to shoot at who deserves it. They'll hold the lower stair. [She chalks it up.]",
        onEnter() {
          muster("gc_guards");
        },
        responses: [{ text: "Thank you, Stationmaster.", next: "mq34_roll" }],
      },
      mq34_noguards: {
        text: () =>
          ms.f("glow") === "planted"
            ? "Half my guards are still sick from whatever got into the water tower last month. I can't spare the ones who aren't."
            : "My guards guard my market. That's the job. Tomorrow, the market's the job. I'm sorry.",
        onEnter() {
          L.setFlag("ms_mq34_guards_asked", true);
        },
        responses: [{ text: "I understand.", next: "mq34_roll" }],
      },
      mq34_closed: {
        text: () =>
          rollText() +
          " [She dusts the chalk off her hands.] Then that's the board. Zeke's been sitting at Moe's bar for an hour pretending he isn't waiting for you. Go on.",
        onEnter() {
          closeMuster();
        },
        responses: [{ text: "Going." }],
      },
      mq34_evac: {
        text: "One more thing, and it's mine to decide but I want your word on it. Tomorrow there are two thousand people in this market by nine. If whatever's under my floor goes up, they go up with it. I can close the doors tonight and send everybody home. The robes will notice, if they're watching. They're always watching.",
        responses: [
          {
            text: "Close the market. Send everyone home.",
            action: () => evac(true),
            next: "mq34_evac_yes",
          },
          {
            text: "Keep it open. If the market empties, they'll know we're coming.",
            action: () => evac(false),
            next: "mq34_evac_no",
          },
        ],
      },
      mq34_evac_yes: {
        text: "Done. Rocky'll put it out on the air. [She looks up at the dark ceiling, at the old painted stars.] I was eight in the Camp, down there. I minded a baby so her mother could hand out candles. Funny what comes back.",
        responses: [{ text: "Get some sleep, Delphine." }],
      },
      mq34_evac_no: {
        text: "[A long breath through the nose.] Your call, sleeper. I'll keep the doors open and the coffee on and pretend it's a Sunday. [Quieter.] I was eight in the Camp, down there. I minded a baby so her mother could hand out candles. Funny what comes back.",
        responses: [{ text: "Get some sleep, Delphine." }],
      },
      mq34_sleep: {
        text: "There's a cot in my office behind the booth. Five o'clock, I'll shake you. I've never once overslept and I'm not starting tomorrow.",
        responses: [
          {
            text: "Wake me at five. [Sleep until 05:00.]",
            action: () => sleepToFive(),
          },
          { text: "Not yet." },
        ],
      },
    },
  });
