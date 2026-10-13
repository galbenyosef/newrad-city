// play-inline-570 10 — fallback
// Lines 2555-2890 of readable/play-inline-570.pretty.js (statement-aligned).
  L.hook("init", function () {
    ms.quest({
      id: "mq34",
      giver: "Stationmaster Delphine Okafor / Zeke / Rose",
      location: "Grand Central Market, Saturday night",
      desc: () =>
        "Tomorrow is Sunday. Grand Central fills up with whoever you have earned, to hold the tunnels while you go the last stretch. One quiet night first.",
      stages: [
        {
          id: "muster",
          text: "Muster your allies for the morning, then tell Stationmaster Delphine who is coming.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Delphine" },
          ],
          onEnter() {
            zekePlace(null);
            if (!captive()) rose.place("at", ROSE_STEPS);
            L.later(2, () =>
              L.hint(
                "ms5_muster",
                "Allies you muster tonight hold the tunnels behind you tomorrow, and the finale remembers who came.",
              ),
            );
          },
        },
        {
          id: "call",
          text: "(Optional) Ask Rocky Delgado to put out the call on Radio Free Manhattan.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            stage("mq34") === "muster" && ALLIES.some((a) => a.call && a.ok()),
          doneIf: () => !!ms.f("mq34_called"),
          markers: () => [{ npc: "rc_rocky", label: "Rocky Delgado" }],
        },
        {
          id: "ask_neon",
          text: "(Optional) Ask Captain Kincaid to bring the Neon Guard.",
          sideObjective: true,
          optional: true,
          showIf: () => stage("mq34") === "muster" && ALLY_BY.neon.ok(),
          doneIf: () => mustered("neon"),
          markers: () => [{ npc: "neon_capt", label: "Captain Kincaid" }],
        },
        {
          id: "ask_lys",
          text: "(Optional) Ask Mademoiselle Lys to stand with you.",
          sideObjective: true,
          optional: true,
          showIf: () => stage("mq34") === "muster" && ALLY_BY.lys.ok(),
          doneIf: () => mustered("lys"),
          markers: () => [{ npc: "bs_lys", label: "Mademoiselle Lys" }],
        },
        {
          id: "ask_guards",
          text: "(Optional) Ask Delphine for Grand Central's guards.",
          sideObjective: true,
          optional: true,
          showIf: () => stage("mq34") === "muster" && ALLY_BY.gc_guards.ok(),
          doneIf: () => mustered("gc_guards"),
        },
        {
          id: "zeke",
          text: "Talk to Zeke at the Oyster Bar.",
          markers: () =>
            L.alive("lib_zeke")
              ? [{ npc: "lib_zeke", label: "Zeke Marlow" }]
              : [
                  {
                    anchor: [OYSTER.site, OYSTER.anchors],
                    fallback: OYSTER.fallback,
                    label: "Zeke's Stool",
                  },
                ],
          onEnter() {
            if (ms.f("mq34_zeke"))
              L.later(0.2, () => {
                if (stage("mq34") === "zeke") zekeDone();
              });
          },
        },
        {
          id: "rose",
          text: "Talk to Rose on the Oyster Bar steps.",
          markers: () => [{ npc: rose.id, label: "Rose" }],
          onEnter() {
            if (captive() || ms.f("rose_with_eli") || ms.f("rose_stays")) {
              L.later(0.2, () => {
                if (stage("mq34") === "rose") Q.setStage("mq34", "evac");
              });
              return;
            }
            rose.place("at", ROSE_STEPS);
          },
        },
        {
          id: "evac",
          text: "Decide with Delphine whether to evacuate Grand Central.",
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Delphine" },
          ],
          onEnter() {
            if (captive())
              L.later(3, () =>
                L.notify(
                  "The Oyster Bar steps are empty tonight. Somewhere under your feet, they have her.",
                  { duration: 6 },
                ),
              );
          },
        },
        {
          id: "sleep",
          text: "Sleep until 05:00 (the cot in the Stationmaster's office).",
          markers: () => [
            {
              anchor: ["grand_central", ["stationmaster", "office", "leader"]],
              fallback: { x: 262, z: -236 },
              label: "Cot",
            },
          ],
        },
      ],
      rewards: { xp: 500 },
      onComplete() {
        if (ms.f("mq34_zeke")) {
          muster("zeke", true);
          muster("calloway", true);
        }
        if (!Array.isArray(ms.f("musters"))) ms.set("musters", []);
        if (!ms.f("rose_with_eli") && !ms.f("rose_stays") && !captive())
          ms.set("rose_stays");
      },
    });
  });
  ms.solver("mq34", {
    muster() {
      rockyCall();
      closeMuster();
    },
    zeke() {
      zekeDone();
    },
    rose() {
      roseChoice(true);
    },
    evac() {
      evac(false);
    },
    sleep() {
      sleepToFive();
      if (Q.isActive("mq34")) Q.complete("mq34");
    },
  });

  // ==================================================================
  // MQ35 — TRACK 61 (the outer lair; src/lair builds the place)
  // ==================================================================
  // Lair anchors (site 'lair', G.lair.getAnchor); fallbacks at Grand Central / the Waldorf so the quest degrades.
  const LAIR_FB = {
    m61_shaft: {
      site: "waldorf",
      anchors: ["m61_door", "sub_basement", "freight_elevator"],
      fallback: { x: 240, z: -342 },
    },
    bulkhead: {
      site: "grand_central",
      anchors: ["track61_bulkhead", "lower_stair"],
      fallback: { x: 236, z: -246 },
    },
    handcar_spur: {
      site: "grand_central",
      anchors: ["lower_stair"],
      fallback: { x: 240, z: -266 },
    },
    platform: {
      site: "grand_central",
      anchors: ["lower_stair"],
      fallback: { x: 248, z: -240 },
    },
    railcar: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 252, z: -238 },
    },
    candles_hall: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 254, z: -226 },
    },
    candle_r: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 255, z: -224 },
    },
    candle_pod7: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 252, z: -223 },
    },
    record_player: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 256, z: -228 },
    },
    drill: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 230, z: -222 },
    },
    m42_door: {
      site: "grand_central",
      anchors: [],
      fallback: { x: 226, z: -226 },
    },
  };
  const lairOn = () =>
    !!(
      G.lair &&
      (typeof G.lair.getAnchor === "function" ||
        typeof G.lair.anchor === "function")
    );
  /** A lair anchor (or its fallback): {x,y,z, lair:true|false}. */
  function lp(name) {
    if (lairOn()) {
      const a = L.anchor("lair", [name], null, { noCache: true });
      if (a) return Object.assign(a, { lair: true });
    }
    const f = LAIR_FB[name];
    const p = L.anchor(f.site, f.anchors, f.fallback);
    return p ? Object.assign(p, { lair: false }) : null;
  }
  const lpAt = (name, dx, dz) => ({
    get x() {
      const p = lp(name);
      return p ? p.x + (dx || 0) : 0;
    },
    get z() {
      const p = lp(name);
      return p ? p.z + (dz || 0) : 0;
    },
    get y() {
      const p = lp(name);
      return p ? p.y : 0;
    },
  });
  const roseWithEli = () => !!ms.f("rose_with_eli") && !captive();
  const T61_Z = ["ms_t61_ember", "ms_t61_z1", "ms_t61_z2", "ms_t61_z3"];
  const T61_CREW = ["ms_t61_crew1", "ms_t61_crew2"];
  const killedAny = (ids) => ids.some((id) => !!L.flag("dead_" + id));
  const platformClear = () =>
    !!ms.f("mq35_stood_down") || T61_Z.every((id) => !!L.flag("dead_" + id));
  const tinderResolved = () => !!ms.f("mq35_drill_resolved");

  function alliesHold() {
    const m = musters()
      .map((id) => ALLY_BY[id] && ALLY_BY[id].name)
      .filter(Boolean);
    L.notify(
      m.length
        ? "Behind you, on the stairs, " +
            m.join(", ") +
            " take their places and hold."
        : "Behind you the stairs are empty. Nobody is holding them. You go on anyway.",
      { duration: 7 },
    );
  }
  function standDown(how) {
    if (ms.f("mq35_stood_down")) return;
    ms.set("mq35_stood_down", how || true);
    for (const id of T61_Z) {
      const a = L.npc(id);
      if (a && !a.dead && a.setHostile) {
        try {
          a.setHostile(false);
        } catch (e) {
          /* */
        }
      }
    }
    L.notify(
      how === "hollowell"
        ? 'An old voice from the stair behind you: "Children. Put them down." Keeper Hollowell comes down onto the platform in his vestments, and one by one the zealots lower their weapons and walk past you, up toward the light.'
        : "One by one the zealots lower their weapons and walk past you, up toward the light.",
      { duration: 8 },
    );
    L.later(5, () => {
      L.setFlag("ms_mq35_left", true);
      if (stage("mq35") === "platform") Q.setStage("mq35", "candles");
    });
  }
  function platformFight() {
    ms.set("mq35_fight");
    for (const id of T61_Z) L.hostile(id, true);
    const a = L.npc("ms_t61_ember");
    if (a) a.essential = false;
  }
  function tinder(how) {
    if (tinderResolved()) return;
    ms.set("mq35_drill_resolved", how);
    if (how === "persuade" || how === "jam") {
      ms.set("tinder_stopped");
      L.notify(
        how === "jam"
          ? "The bit seizes with a shriek and shears off at the chuck. Nobody is cutting anything through that plate before nine forty-seven."
          : "Brother Tinder lets the drill spin down. In the silence you can hear the record player again, two halls away.",
        { duration: 6 },
      );
      for (const id of T61_CREW) {
        const a = L.npc(id);
        if (a && !a.dead && a.setHostile) {
          try {
            a.setHostile(false);
          } catch (e) {
            /* */
          }
        }
      }
    } else if (how === "fight") {
      const a = L.npc("ms_tinder");
      if (a) a.essential = false;
      L.hostile("ms_tinder", true);
      for (const id of T61_CREW) L.hostile(id, true);
    }
    if (how !== "fight" && stage("mq35") === "drill")
      L.later(1, () => {
        if (stage("mq35") === "drill") Q.setStage("mq35", "door");
      });
  }
  function reachDoor() {
    if (!Q.isActive("mq35")) return;
    if (!killedAny(T61_Z.concat(T61_CREW))) ms.set("zealots_spared");
    if (G.time) passTo(9.5, false);
    Q.complete("mq35");
  }
  // the platform zealots (stand in the way; talk, fight, or Hollowell talks them down)
