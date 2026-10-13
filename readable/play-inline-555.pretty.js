/* src/quests/45_neon_glow.js */
/* =====================================================================
 * NEW RAD CITY — QUESTS — 45: THE NEON (TIMES SQUARE) & ST. PATRICK'S
 *   SQ "Neon Heart"     — Mayor Crowe's dying generator; a spare rig battery
 *                         in the 42nd St subway (give / sell / repair)
 *   SQ "The Long Noon"  — Keeper Hollowell of the Glowkeepers wants Grand
 *                         Central's water "kindled" (plant it / warn them /
 *                         swap it for a Fizzo Blue placebo / talk him down)
 *   SQ "Doors at Four"  — Wendell's ring in the Sterling's manager's safe, the
 *                         Maniacs (old customers and staff) still waiting for
 *                         the big sale, and the lounge singer who has been
 *                         waiting 22 years
 * NPCs: Mayor Lucius Crowe, Marigold, Wendell Pruitt, Big Sal, Doc Needles
 *       (the Neon); Keeper Ezra Hollowell, Sister Noonday (Glowkeepers).
 * Locks: terminal passcodes 'neon_glow_scripture' (Sister Noonday tells it)
 *        and 'neon_mayor_terminal' (Mayor Crowe tells it).
 * Main story (story/outline.json): sq_glow is absorbed by mq12 "The Long Noon"
 * and sq_neon by mq13 "Neon Heart" (63_ms_act2.js runs them through proxy
 * stages). Both keep their ids/flags; G.quests.start() is safe at any time
 * (stage 'take' / 'core' sync to what is already done). Outcomes are mirrored
 * into ms_glow ('planted'|'convinced'|'warned'|'placebo'|'refused', plus
 * ms_glow_warned and Rose's trust) and ms_sun_battery ('neon'|'repaired'|
 * 'covenant'|'glowkeepers'). The scripture terminal carries the Book of the
 * Kindling (L.ms.kindlingRead counts the parables for mq12).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const TS = { x: -40, z: -262 },
    SP = { x: 160, z: -342 };
  const STOCK_LOUNGE = [
    [["rush", /^rush$/i], 3],
    [["rage", /^rage$/i], 2],
    [["bull_tabs", /bull tabs/i], 2],
    [["focus_pills", /focus pills/i], 2],
    [["fizzo_cola", /^fizzo cola$/i], 6],
    [["whiskey", /whiskey/i], 4],
    [["beer", /^beer$/i], 6],
    [["prussian_blue", /^prussian blue$/i], 2],
    [["vodka", /vodka/i], 2],
  ];
  const STOCK_GLOW = [
    [["dirty_water", /dirty water/i], 6],
    [["iodine_tabs", /iodine/i], 2],
    [["prussian_blue", /^prussian blue$/i], 1],
    [["fizzo_blue", /fizzo blue/i], 1],
    [["glowcap", /glowcap/i], 3],
    [["q_glowkeeper_vestments"], 1],
  ];
  const FIZZO_BLUE = () => L.item("fizzo_blue", /fizzo blue/i);

  // ---- locks (REBRAND §5): terminal passcodes, both told in dialogue below ----
  const LOCK_SCRIPTURE = {
    id: "neon_glow_scripture",
    label: "Glowkeeper Scripture Terminal",
    passcode: "LONGNOON",
    hint: "Sister Noonday on the cathedral steps recites it to anyone who asks to read the scripture.",
  };
  const LOCK_MAYOR = {
    id: "neon_mayor_terminal",
    label: "Mayor of the Neon — Office Terminal",
    passcode: "BIGBUZZ",
    hint: "Mayor Crowe tells anyone who asks about his office; it is also painted on the generator.",
  };
  /** The Book of the Kindling: written by the Dawn in the first winters (story/outline.json mq12), shared with 63_ms_act2.js. */
  const BOOK = {
    match:
      "In the year before the Kindling the city went dark. Every lamp from the river to the lakes went out at once, and in the great hall of the station ten thousand people stood in the dark and were afraid.\n\n" +
      "And a woman went among them with a box of matches, and lit what could be lit, and said to each one: Somebody has to keep the light on.\n\n" +
      "And a clerk of the city broke open a locker and found it full of candles, and gave them to her, one by one, until his hands were empty. And on his candle box she drew the Sun, with twelve rays, one for every hour of the dark.\n\n" +
      "That was the first candle. We keep it still.",
    eleven:
      "In the first winter of the Long Noon a child lay sick under the city, and the keepers of the medicine would not give it, because the child's name was on no list.\n\n" +
      "And when the Kindling was a year old, the mother went up to the keepers of the medicine with a match.\n\n" +
      "She struck a match to save one child and the fire took eleven, and she asked the Sun why, and the Sun said: I do not choose. Be like me.",
    psalm:
      "Sleep, you sleepers, under the city.\nNinety days of winter, and then the spring.\n\nWe do not wake you. We do not dig for you.\nWe keep the light on, and we wait.\n\nNinety days of winter, and then the spring.\nAnd when you wake, it will be Sunday.",
    rule: "Whoever comes into the Light is kindled, and takes a new name.\n\nThe old name is laid beneath a stone.\n\nDo not dig for it. The Sun does not choose, and neither do we. Over the kindled there is no list, no card, no number, and no name for anyone to refuse.",
  };
  /** Hollowell's errand can be offered (not started yet, or the main story started it and he hasn't handed it over). */
  const offerOpen = () =>
    !Q.isStarted("sq_glow") ||
    (Q.isActive("sq_glow") && Q.stage("sq_glow") === "take");
  function learnCode(id) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id);
      } catch (e) {
        /* ignore */
      }
    }
  }

  L.hook("init", function () {
    L.quest({
      id: "sq_neon",
      name: "Neon Heart",
      giver: "Mayor Lucius Crowe",
      location: "The Neon (Times Square)",
      desc:
        "The Neon, the trade town in Times Square that refused to be counted in '67, runs on an old-world generator the locals call the Big Buzz, and the Big Buzz is dying. " +
        "Mayor Crowe says a spare rig battery was left in the 42nd Street subway tunnels.",
      stages: [
        {
          id: "core",
          text: () =>
            'Recover the spare rig battery ("Big Buzz #2") from the 42nd Street subway tunnels' +
            (Q.isStarted("mq13")
              ? " before the Glowkeeper acolytes find it."
              : "."),
          // Q.start('sq_neon') is safe at any time (the main story's mq13 starts it): skip what is already done.
          onEnter() {
            L.later(0.1, neonSync);
          },
          markers: () =>
            L.pickups.neon_core && !L.has("q_neon_core")
              ? [
                  {
                    x: L.pickups.neon_core.pos.x,
                    z: L.pickups.neon_core.pos.z,
                    label: "Rig Battery",
                  },
                ]
              : [{ x: -60, z: -228, label: "Subway Entrance" }],
        },
        {
          id: "nh_repair",
          text: "(Optional) Get the Big Buzz running again without a new battery.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.stage("sq_neon") === "core" && L.skill("mechanics") >= 60,
          doneIf: () => L.flag("neon_outcome") === "repair",
          markers: () => [
            { npc: "neon_crowe", label: "The Big Buzz (Mayor Crowe)" },
          ],
        },
        {
          id: "return",
          text: "Bring the rig battery back to Mayor Crowe — or find another buyer.",
          markers: () => [{ npc: "neon_crowe", label: "Mayor Crowe" }],
        },
        {
          id: "nh_give",
          text: "(Optional) Give the battery to Mayor Crowe.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_neon") === "return",
          doneIf: () => L.flag("neon_outcome") === "crowe",
        },
        {
          id: "nh_cov",
          text: "(Optional) Sell the battery to Lancer Reyes of the Iron Covenant instead (400 scrip).",
          sideObjective: true,
          optional: true,
          showIf: () =>
            Q.stage("sq_neon") === "return" &&
            !!(L.flag("met_stroud") || L.flag("mq_faction") === "covenant"),
          doneIf: () => L.flag("neon_outcome") === "sold",
          markers: () => [{ npc: "cov_reyes", label: "Lancer Reyes" }],
        },
        {
          id: "nh_glow",
          text: "(Optional) Hand the battery to the Glowkeepers.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_neon") === "return" && !!L.flag("met_ezra"),
          doneIf: () => L.flag("neon_outcome") === "glow",
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
      ],
      rewards: { xp: 300 },
      onComplete() {
        neonMirror();
      },
    });
    L.quest({
      id: "sq_glow",
      name: "The Long Noon",
      giver: "Keeper Ezra Hollowell",
      location: "St. Patrick's Cathedral",
      desc:
        'Keeper Hollowell of the Glowkeepers wants to "share the Light" with Grand Central Market by placing a hot relic in the ' +
        "market's water tower. Thousands drink from those taps.",
      stages: [
        // Q.start('sq_glow') is safe at any time (the main story's mq12 starts it): the Keeper hands over the isotope here,
        // and glowSync() skips straight to whatever the player has already done.
        {
          id: "take",
          text: "Take the Blessed Isotope from Keeper Hollowell at St. Patrick's, or tell him no.",
          onEnter() {
            L.later(0.1, glowSync);
          },
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
        {
          id: "plant",
          text: "Place the Blessed Isotope in Grand Central's water tower intake, or warn Stationmaster Okafor, swap it for something that only looks holy, or take it back to Hollowell.",
          markers: () =>
            [waterTowerMarker()].concat(
              L.flag("glow_told_delphine")
                ? []
                : [{ npc: "gc_delphine", label: "Stationmaster Okafor" }],
              [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
            ),
        },
        {
          id: "warn",
          text: "(Optional) Warn Stationmaster Okafor about the Glowkeepers.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !L.flag("glow_told_delphine") && !L.flag("glow_isotope_planted"),
          doneIf: () => !!L.flag("glow_told_delphine"),
          markers: () => [
            { npc: "gc_delphine", label: "Stationmaster Okafor" },
          ],
        },
        {
          id: "gk_placebo",
          text: "(Optional) Swap the isotope for something that only LOOKS holy (a bottle of Fizzo Blue).",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_glow") === "plant",
          doneIf: () => !!L.flag("glow_placebo_planted"),
        },
        {
          id: "gk_refuse",
          text: "(Optional) Give the isotope back and refuse the task.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("glow_refused"),
        },
        {
          id: "gk_convince",
          text: "(Optional) Talk Keeper Hollowell out of it.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("glow_convinced"),
        },
        {
          id: "return",
          text: () =>
            (L.flag("glow_isotope_planted")
              ? "Grand Central's taps are glowing. "
              : L.flag("glow_placebo_planted")
                ? "The reliquary glows a soft Fizzo blue — harmlessly. "
                : "") +
            "Return to Keeper Hollowell at St. Patrick's Cathedral.",
          markers: () => [{ npc: "glow_ezra", label: "Keeper Hollowell" }],
        },
      ],
      rewards: { xp: 250 },
      onComplete() {
        glowMirror();
      },
    });
    L.quest({
      id: "sq_blackfriday",
      name: "Doors at Four",
      giver: "Wendell Pruitt",
      location: "Sterling's of Herald Square",
      desc:
        "Wendell, a Neon old-timer, worked Housewares at Sterling's and hid an engagement ring in the manager's safe the night before the bombs. " +
        "Sterling's is now full of Maniacs, customers and staff whose minds went, still waiting for the doors to open on the big sale.",
      stages: [
        {
          id: "ring",
          text: "Retrieve Wendell's ring from the Sterling's manager's safe.",
          // ring already looted before Wendell asked (the pickup exists from game start): go straight to the hand-in
          onEnter() {
            if (L.has("q_wendell_ring")) Q.setStage("sq_blackfriday", "return");
          },
          markers: () =>
            L.pickups.wendell_ring && !L.has("q_wendell_ring")
              ? [
                  {
                    x: L.pickups.wendell_ring.pos.x,
                    z: L.pickups.wendell_ring.pos.z,
                    label: "Manager's Safe",
                  },
                ]
              : [{ x: 0, z: -50, label: "Sterling's" }],
        },
        {
          id: "return",
          text: "Bring the ring to Wendell in the Neon.",
          markers: () => [{ npc: "neon_wendell", label: "Wendell" }],
        },
        {
          id: "marjorie",
          text: "(Optional) Ask Marigold about her past.",
          sideObjective: true,
          optional: true,
          showIf: () => Q.stage("sq_blackfriday") === "return",
          doneIf: () => !!L.flag("marigold_is_marjorie"),
          markers: () => [{ npc: "neon_marigold", label: "Marigold" }],
        },
        {
          id: "bf_wed",
          text: "(Optional) Bring Wendell and Marjorie back together.",
          sideObjective: true,
          optional: true,
          showIf: () =>
            !!L.flag("marigold_is_marjorie") && !L.flag("ring_resolved"),
          doneIf: () => !!L.flag("wendell_wed"),
        },
        {
          id: "bf_keep",
          text: "(Optional) Keep the ring for yourself.",
          sideObjective: true,
          optional: true,
          showIf: () => false,
          doneIf: () => !!L.flag("ring_kept"),
        },
      ],
      rewards: { xp: 250 },
    });
  });

  function waterTowerSpot() {
    return L.anchor(
      "grand_central",
      ["water_main", "water_tower", "roof_tank"],
      { x: 267, z: -200 },
    );
  }
  function waterTowerMarker() {
    const p = waterTowerSpot();
    return p ? { x: p.x, z: p.z, label: "Water Tower Intake" } : null;
  }

  // ---- event hooks ----
  G.events.on("itemAdded", (id) => {
    if (id === "q_neon_core") {
      if (!Q.isStarted("sq_neon")) Q.start("sq_neon", { stage: "return" });
      else if (Q.stage("sq_neon") === "core") Q.setStage("sq_neon", "return");
    }
    if (id === "q_wendell_ring") {
      if (Q.stage("sq_blackfriday") === "ring")
        Q.setStage("sq_blackfriday", "return");
    }
  });

  // ---- world ----
  L.hook("world", function () {
    const t = L.anchor("st_patricks", ["terminal", "altar", "pulpit"], {
      x: SP.x - 30,
      z: SP.z + 8,
    });
    if (t) L.spawnTerminal("glow_scripture", t, Math.PI / 2);
    const tn = L.anchor("times_square", ["terminal", "mayor_office", "stage"], {
      x: TS.x + 10,
      z: TS.z + 6,
    });
    if (tn) L.spawnTerminal("neon_mayor", tn, 0);
    // City Hall of the Neon is a windowless shack: light the Mayor's office so the first
    // meeting isn't in the dark (props' lamps are emissive + glow sprites, no dynamic lights).
    const mo =
      !G.isStub("landmarks") && G.landmarks.getAnchor
        ? G.landmarks.getAnchor("times_square", "mayor_office")
        : null;
    if (mo && isFinite(mo.x)) {
      L.prop("lamp", {
        x: mo.x - 0.7,
        y: mo.y || 0,
        z: mo.z + 0.8,
        kind: "hanging",
        persistent: true,
      });
      L.prop("lamp", {
        x: mo.x - 2.0,
        y: mo.y || 0,
        z: mo.z + 3.4,
        kind: "floor",
        yaw: 0.6,
        persistent: true,
      });
    }
    // The Grand Central water tower intake (only active while carrying the isotope).
    const w = waterTowerSpot();
    if (w) {
      L.world.waterTower = G.world.addInteractable({
        pos: L.V3(w.x, (w.y || 0) + 1.2, w.z),
        radius: 0.9,
        label: "Water Tower Intake",
        verb: "Use",
        priority: 2,
        enabled: () =>
          L.has("q_blessed_isotope") &&
          !L.flag("glow_isotope_planted") &&
          !L.flag("glow_placebo_planted"),
        onInteract() {
          if (!L.startDialogue("dlg_glow_tower", null)) plantIsotope(false);
        },
      });
    }
  });

  function subwayCoreSpot() {
    // Prefer map anchors; else next to the subway's inbound door target.
    const tries = [
      () => G.map.getAnchor && G.map.getAnchor("subway", "loot"),
      () => G.map.getAnchor && G.map.getAnchor("subway", "core"),
      () =>
        G.map.anchors &&
        G.map.anchors.subway &&
        (G.map.anchors.subway.loot || G.map.anchors.subway.car),
    ];
    for (const t of tries) {
      let a = null;
      try {
        a = t();
      } catch (e) {
        a = null;
      }
      if (a && isFinite(a.x)) return { x: a.x, y: a.y || 0, z: a.z };
    }
    const d = L.doorInto("subway");
    const o = G.LAYOUT.INTERIORS.subway.origin;
    if (d) {
      const t = d.def.target;
      return L.freeSpot(
        t.x + (o.x - t.x) * 0.6,
        t.z + (o.z - t.z) * 0.6,
        t.y || 0,
        { maxR: 12 },
      );
    }
    return L.freeSpot(o.x, o.z, o.y || 0, { maxR: 20 });
  }

  L.hook("spawn", function () {
    // ---- The Neon (Times Square) ----
    const ts = (anchors, dx, dz) => ({
      site: "times_square",
      anchors,
      fallback: { x: TS.x + dx, z: TS.z + dz },
    });
    L.spawnNPC({
      id: "neon_crowe",
      type: "human",
      name: "Mayor Lucius Crowe",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 3,
      at: ts(["mayor", "leader", "stage", "merchant1"], 0, 0),
      dialogue: "dlg_neon_crowe",
      essential: true,
      level: 10,
      hat: "top_hat",
      burn: "L",
      barks: [
        "Welcome to the Neon, where the lights are bright and nobody, but nobody, is on a list!",
        "Strangers welcome. Manners required.",
        "Vote Crowe! There is no election. Vote anyway!",
      ],
      voice: "settler",
    });
    L.spawnNPC({
      id: "neon_marigold",
      type: "human",
      name: "Marigold",
      outfit: "survivor_layers",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: ts(["bar", "lounge", "merchant2"], -14, 16),
      dialogue: "dlg_neon_marigold",
      essential: true,
      merchant: { scrip: 400, stock: STOCK_LOUNGE, restock: 3 },
      barks: [
        "Welcome to the Rad-Lounge, sugar.",
        "Drinks are cheap. The company's cheaper.",
        "I used to dance, you know. Before everything. Before my knees.",
      ],
      voice: "settler",
    });
    L.spawnNPC({
      id: "neon_wendell",
      type: "human",
      name: "Wendell Pruitt",
      outfit: "survivor_layers",
      gender: "m",
      faction: "settlers",
      ai: "wander",
      home: "here",
      homeR: 3,
      at: ts(["resident1", "settler1", "spawn1"], 12, -18),
      dialogue: "dlg_neon_wendell",
      essential: true,
      barks: [
        "Housewares, third floor. Can I help you find something?",
        "Twenty-two years and I still have the name tag.",
      ],
      voice: "settler",
    });
    L.spawnNPC({
      id: "neon_sal",
      type: "human",
      name: "Big Sal",
      outfit: "raider_heavy",
      gender: "m",
      faction: "settlers",
      ai: "guard",
      home: "here",
      homeR: 2,
      at: ts(
        ["club_bouncer", "club_door", "bouncer", "gate", "entrance"],
        0,
        40,
      ),
      dialogue: "dlg_neon_sal",
      weapon: ["sawed_off_shotgun", "combat_shotgun"],
      level: 9,
      barks: [
        "No Maniacs, no raiders, no trouble.",
        "You're fine. You got a face like a face.",
      ],
      voice: "settler",
    });

    L.spawnNPC({
      id: "neon_needles",
      type: "human",
      name: "Doc Needles",
      outfit: "doctor",
      gender: "f",
      faction: "settlers",
      ai: "merchant",
      home: "here",
      at: ts(["clinic_nurse", "doctor", "clinic"], 45, 32),
      dialogue: "dlg_neon_needles",
      voice: "settler",
      merchant: {
        scrip: 250,
        stock: [
          [["rally_tonic", /^rally tonic$/i], 5],
          [["prussian_blue", /^prussian blue$/i], 5],
          [["iodine_tabs", /iodine/i], 3],
          [["morphine_syrette", /morphine/i], 2],
          [["rush", /^rush$/i], 1],
        ],
        restock: 3,
      },
      barks: [
        "Doc Needles. Don't ask about the name.",
        "Rads? Sweetie, the dirt round here's been hot since '67. Take your Prussian Blue and stop licking things.",
      ],
    });

    // ---- St. Patrick's (the Glowkeepers) ----
    const sp = (anchors, dx, dz) => ({
      site: "st_patricks",
      anchors,
      fallback: { x: SP.x + dx, z: SP.z + dz },
    });
    L.spawnNPC({
      id: "glow_ezra",
      type: "keeper_hollowell",
      name: "Keeper Ezra Hollowell",
      outfit: "glowkeeper_robes",
      gender: "m",
      faction: "glowkeepers",
      ai: "guard",
      home: "here",
      homeR: 2,
      at: sp(["preacher", "priest", "altar", "pulpit", "entrance"], -36, 0),
      dialogue: "dlg_glow_ezra",
      essential: true,
      level: 8,
      barks: [
        "The Sun came down once, and it never truly left.",
        "Stand in the Noon, friend!",
        "Can you not feel it? The warmth?",
        "The Sun does not choose.",
      ],
      voice: "m_preacher",
    });
    L.spawnNPC({
      id: "glow_sister",
      type: "sister_noonday",
      name: "Sister Noonday",
      outfit: "glowkeeper_robes",
      gender: "f",
      faction: "glowkeepers",
      ai: "merchant",
      home: "here",
      at: sp(["merchant", "acolyte", "merchant1", "steps"], -36, 7),
      dialogue: "dlg_glow_sister",
      merchant: { scrip: 200, stock: STOCK_GLOW, restock: 3 },
      barks: [
        "Noon water! Kindled in the Light itself!",
        "The Noon be on you.",
      ],
      skinTone: 0.2,
    });

    // ---- Quest objects ----
    if (!L.flag("neon_core_resolved") && !L.has("q_neon_core")) {
      const c = subwayCoreSpot();
      if (c) L.pickup("neon_core", "q_neon_core", 1, c);
    }
    if (!L.flag("ring_resolved") && !L.has("q_wendell_ring")) {
      const s = L.anchor("sterlings", ["safe", "office", "loot2", "loot"], {
        x: -18,
        z: -58,
      });
      if (s) {
        L.pickup("wendell_ring", "q_wendell_ring", 1, s);
        L.pickup("wendell_letter", "q_note_wendell_letter", 1, {
          x: s.x + 0.6,
          y: s.y,
          z: s.z + 0.2,
        });
      }
    }
  });

  // ------------------------------------------------------------------
  // Outcomes
  // ------------------------------------------------------------------
  function plantIsotope(placebo) {
    if (placebo) {
      L.take("q_blessed_isotope", 1);
      L.take(FIZZO_BLUE(), 1);
      L.setFlag("glow_placebo_planted");
      L.notify(
        "You tip the isotope into a lead-lined gutter and seat a glowing bottle of Fizzo Blue in the reliquary instead. It looks very holy.",
      );
      L.xp(60, "Mechanics: a miracle in a bottle");
      L.standing(150, "Saved Grand Central's water");
    } else {
      L.take("q_blessed_isotope", 1);
      L.setFlag("glow_isotope_planted");
      L.notify(
        "The isotope slips into the intake with a soft, warm plop. Somewhere below, a thousand taps begin to glow.",
      );
      L.standing(-400, "Poisoned Grand Central's water");
      G.world.addRadSource({
        x: 240,
        y: 1,
        z: -222,
        radius: 26,
        strength: 1.2,
      });
      L.news(
        "Health bulletin, folks, and it's not a good one. The taps at Grand Central Market are running hot. Doc Hollis says don't drink the water, don't bathe in the water, don't look at the water. The Glowkeepers are calling it a sacrament. Rocky is calling it something I can't say on the air.",
      );
    }
    glowMirror();
    if (Q.stage("sq_glow") === "plant" || Q.stage("sq_glow") === "take")
      Q.setStage("sq_glow", "return");
  }
  /** Hollowell hands over the isotope (secret = the hero means to deal with it himself). */
  function takeIsotope(secret) {
    if (!L.has("q_blessed_isotope")) L.give("q_blessed_isotope", 1);
    if (secret) L.setFlag("glow_secret_plan");
    if (!Q.isStarted("sq_glow")) Q.start("sq_glow", { stage: "plant" });
    else if (Q.stage("sq_glow") === "take") Q.setStage("sq_glow", "plant");
  }
  /** The Keeper is told no, or given the isotope back. */
  function refuseIsotope() {
    if (L.has("q_blessed_isotope")) L.take("q_blessed_isotope", 1);
    L.setFlag("glow_refused");
    L.standing(25, "Refused the Glowkeepers");
    if (!Q.isStarted("sq_glow")) Q.start("sq_glow");
    glowMirror();
    Q.complete("sq_glow");
  }
  /** sq_glow may be started by the main story at any time: move it to the first step not yet done. */
  function glowSync() {
    if (!Q.isActive("sq_glow")) return;
    if (L.flag("glow_convinced") || L.flag("glow_refused")) {
      glowMirror();
      Q.complete("sq_glow");
      return;
    }
    const st = Q.stage("sq_glow");
    if (L.flag("glow_isotope_planted") || L.flag("glow_placebo_planted")) {
      if (st !== "return") Q.setStage("sq_glow", "return");
      return;
    }
    if (st === "take" && L.has("q_blessed_isotope"))
      Q.setStage("sq_glow", "plant");
  }
  /**
   * Main story mirror (story/outline.json mq12): ms_glow = 'planted' | 'convinced' | 'warned' | 'placebo' | 'refused'
   * (strongest first; ms_glow_warned is kept as well), plus Rose's trust: planting -2, warning Grand Central +1,
   * convincing the Keeper +1 (each once).
   */
  function glowMirror() {
    const v = L.flag("glow_isotope_planted")
      ? "planted"
      : L.flag("glow_convinced")
        ? "convinced"
        : L.flag("glow_told_delphine")
          ? "warned"
          : L.flag("glow_placebo_planted")
            ? "placebo"
            : L.flag("glow_refused")
              ? "refused"
              : null;
    if (v && L.flag("ms_glow") !== v) L.setFlag("ms_glow", v);
    if (L.flag("glow_told_delphine") && !L.flag("ms_glow_warned"))
      L.setFlag("ms_glow_warned", true);
    const ms = L.ms;
    if (!ms) return;
    if (L.flag("glow_isotope_planted") && ms.once("glow_trust_planted"))
      ms.addTrust(-2, "Grand Central's taps are glowing");
    if (L.flag("glow_told_delphine") && ms.once("glow_trust_warned"))
      ms.addTrust(1, "You warned Grand Central");
    if (L.flag("glow_convinced") && ms.once("glow_trust_convinced"))
      ms.addTrust(1, "You talked the Keeper down");
  }
  // Delphine's warning is set by her own dialogue (30_midtown.js).
  G.events.on("questFlag", (name) => {
    if (name === "glow_told_delphine" || name === "glow_convinced")
      glowMirror();
  });

  function neonResolve(how) {
    L.setFlag("neon_core_resolved");
    L.setFlag("neon_outcome", how);
    neonMirror();
    if (how === "crowe" || how === "repair") {
      L.news(
        "Good news from Times Square! The lights of the Neon are shining brighter than they have since '67. Mayor Crowe says drinks are on the house tonight. Mayor Crowe has since clarified that drinks are NOT on the house. But the lights are nice.",
      );
    } else if (how === "left") {
      L.news(
        "Times Square went dark last night, friends. Folks at the Neon say a line of robes came up out of the 42nd Street tunnels carrying something heavy between them, singing. Whatever it was, the Neon isn't getting it back. Candles tonight in the Neon.",
      );
    } else {
      L.news(
        how === "glow"
          ? "Times Square went dark last night, friends. The Neon's generator gave up, and word is the Glowkeepers are very, very happy about it. Say a prayer for the folks in the Neon tonight."
          : "Times Square went dark last night. Somebody sold the Neon's last rig battery to the Iron Covenant. The Neon is lighting candles. Candles, folks. In 1989.",
      );
    }
    if (!Q.isStarted("sq_neon")) Q.start("sq_neon");
    Q.complete("sq_neon");
  }
  /** Main story mirror (mq13): who holds the battery the Second Sun will need. */
  function neonMirror() {
    const o = L.flag("neon_outcome");
    const v =
      o === "crowe"
        ? "neon"
        : o === "repair"
          ? "repaired"
          : o === "sold"
            ? "covenant"
            : o === "glow" || o === "left"
              ? "glowkeepers"
              : null;
    if (v && L.flag("ms_sun_battery") !== v) L.setFlag("ms_sun_battery", v);
  }
  /** sq_neon may be started by the main story at any time. */
  function neonSync() {
    if (!Q.isActive("sq_neon")) return;
    if (L.flag("neon_core_resolved")) {
      neonMirror();
      Q.complete("sq_neon");
      return;
    }
    if (Q.stage("sq_neon") === "core" && L.has("q_neon_core"))
      Q.setStage("sq_neon", "return");
  }
  /** A part of the Book of the Kindling was read at the teletype (the main story counts it). */
  function bookRead(part) {
    if (L.ms && L.ms.kindlingRead) L.ms.kindlingRead(part, "terminal");
    else L.setFlag("ms_book_" + part, true);
  }
  L.neon = {
    neonResolve,
    plantIsotope,
    takeIsotope,
    refuseIsotope,
    glowMirror,
    neonMirror,
    coreSpot: () => subwayCoreSpot(),
    waterTower: () => waterTowerSpot(),
    BOOK,
  };

  // ------------------------------------------------------------------
  // Terminals
  // ------------------------------------------------------------------
  L.hook("register", function () {
    if (G.locks && G.locks.register) {
      try {
        G.locks.register(Object.assign({ kind: "terminal" }, LOCK_SCRIPTURE));
        G.locks.register(Object.assign({ kind: "terminal" }, LOCK_MAYOR));
      } catch (e) {
        /* ignore */
      }
    }
    L.terminal("glow_scripture", {
      title: "THE BOOK OF THE KINDLING",
      header:
        "TELETYPE SERVICE LINE — ARCHDIOCESE OF NEW YORK (REPURPOSED)\nTHE NOON IS LONG",
      lock: { id: LOCK_SCRIPTURE.id, passcode: LOCK_SCRIPTURE.passcode },
      // The Book of the Kindling is written in the Dawn's words (story/outline.json mq12). Reading the parables is
      // an objective of the main story's mq12 (L.ms.kindlingRead, 63_ms_act2.js).
      entries: [
        {
          title: "The Kindling, 1:1-4",
          text: "In the old days there was one sun, and it rose, and it set, and it answered no one.\nAnd on a grey Sunday morning in March the Sun came down over Yonkers, and the city was kindled, and it was very, very warm.\nAnd the Sun said: Be warm. I do not choose.\nAnd the Long Noon began, and it has not ended, and the shadows have been short ever since. And one day a Second Sun will rise.",
        },
        {
          title: "The Parable of the Match",
          action: () => bookRead("match"),
          text: BOOK.match,
        },
        {
          title: "The Parable of the Eleven",
          action: () => bookRead("eleven"),
          text: BOOK.eleven,
        },
        {
          title: "The Psalm of the Sleepers",
          action: () => bookRead("psalm"),
          text: BOOK.psalm,
        },
        {
          title: "The Rule of the Kindling",
          action: () => bookRead("rule"),
          text: BOOK.rule,
        },
        {
          title: "Keeper Hollowell's Journal",
          text: "The people of the Neon burned their census cards in the first spring of the Long Noon, and that is very nearly holy: no list, no card, no number. And yet they hang electric bulbs, as if the Noon were not bright enough. The market at Grand Central drinks water scrubbed so clean it has forgotten the Light.\n\nI will show them both. Gently. The Light is patient. I am less patient.",
        },
        {
          title: "Supply List",
          text: 'Candles (for the unconverted)\nLead (for the reliquary)\nFizzo Blue (Sister Noonday calls it "the Noon in a bottle" — set aside every bottle we find, for study)',
        },
        {
          title: "Sister Noonday's Margin Notes",
          text: 'Typed below the Supply List, with a lot of crossing-out:\n\n"Candles for February: twenty-two years now, one more than last year. Even the Dawn keeps a candle every February. For her sleeper. Don\'t forget the wicks this time. — N."',
        },
      ],
    });
    L.terminal("neon_mayor", {
      title: "OFFICE OF THE MAYOR OF THE NEON",
      header:
        'TIMES SQUARE ALLIANCE — ADMINISTRATIVE TERMINAL\n"THE CROSSROADS OF THE WORLD (STILL)"',
      lock: { id: LOCK_MAYOR.id, passcode: LOCK_MAYOR.passcode },
      entries: [
        {
          title: "The Big Buzz",
          text: () =>
            "PRIMARY GENERATOR: " +
            (L.flag("neon_outcome") === "crowe" ||
            L.flag("neon_outcome") === "repair"
              ? "NOMINAL (new rig battery installed)"
              : L.flag("neon_outcome")
                ? "OFFLINE"
                : "FAILING (14% output)") +
            '\nSPARE RIG BATTERY "BIG BUZZ #2": last seen in 42nd St tunnels, maintenance closet near the derailed car.\n\nNOTE: Do not send Wendell. Wendell got lost in the tunnels in \'79 and it took him nine days to find the exit. He says it felt like nine years.',
        },
        {
          title: "Census",
          text: "Residents: 83 (uncounted, by choice), 4 married in from topside, 1 cat (refuses to be counted; respects the tradition).\nLongest resident: Wendell Pruitt (here since the week of the Bombing).\nSecond longest: Marigold (won't say which week).",
        },
        {
          title: "Mayoral Proclamation #212",
          text: "By order of the Mayor, the lights of Times Square shall never go out. The Mayor acknowledges that this proclamation has no legal force whatsoever against physics.",
        },
      ],
    });
  });

  // ------------------------------------------------------------------
  // Dialogue
  // ------------------------------------------------------------------
  L.hook("register", function () {
    // ---------------- Mayor Lucius Crowe ----------------
    L.dialogue("dlg_neon_crowe", {
      start: () =>
        Q.stage("sq_neon") === "return" && L.has("q_neon_core")
          ? "core_back"
          : L.flag("met_crowe")
            ? "again"
            : "first",
      nodes: {
        first: {
          text: "Well, well! A stranger in a cryo suit, and not screaming! Lucius Crowe, Mayor of the Neon, at your service. [He doffs a moth-eaten top hat over a face lined like an old playbill, all teeth and stage paint.] Welcome to the brightest square mile in the Ruins. What brings you to our humble crossroads?",
          onEnter() {
            L.setFlag("met_crowe");
          },
          responses: [
            { text: "Just passing through. Nice lights.", next: "lights" },
            { text: "Mayor? Of what, exactly?", next: "mayor" },
            {
              text: "A town in Times Square. Who do you answer to?",
              next: "uncounted",
            },
          ],
        },
        uncounted: {
          text: "Answer to? [He beams.] Spring of '67, the Continuity came round with clipboards and census cards, and every soul in this square lit a cigarette off theirs. I've outlived one government already, friend. I can outlive a filing cabinet. We're the uncounted, and the uncounted answer to the lights.",
          responses: [{ text: "So what is this place?", next: "mayor" }],
        },
        mayor: {
          text: "Of the Neon! Eighty-three souls, give or take the ones who wander off. We came here because nobody else wanted Times Square — too bright, too loud, too full of us. Now it's ours. The lights stay on, the drinks are warm, and nobody asks to see your card.",
          responses: [
            { text: "The lights are impressive.", next: "lights" },
            { text: "Any trouble I can help with?", next: "trouble" },
            { text: "You have a terminal in your office?", next: "office" },
          ],
        },
        office: {
          text: "The administrative terminal! Census, proclamations, the generator readings. Password's BIGBUZZ — one word, all capitals. Don't look at me like that; it's also painted on the side of the generator in letters three feet high. Transparency in government, citizen.",
          learn: LOCK_MAYOR.id,
          onEnter() {
            learnCode(LOCK_MAYOR.id);
          },
          responses: [
            { text: "Tell me about the generator.", next: "lights" },
            { text: "Thanks, Mayor." },
          ],
        },
        lights: {
          text: "Impressive, and dying. [His smile slips.] The Big Buzz — our generator — is down to fourteen percent. When it goes, the Neon goes dark, and in the dark the Maniacs come up out of the subway. We've got a spare rig battery, somewhere down in the 42nd Street tunnels. I'm a mayor, not a tunnel rat.",
          responses: [
            {
              text: "I'll get your rig battery.",
              cond: () => !Q.isStarted("sq_neon"),
              action: () => Q.start("sq_neon"),
            },
            {
              text: "Let me look at the generator first.",
              check: { skill: "mechanics", value: 60 },
              next: "repair",
              failNext: "repair_fail",
              cond: () => !L.flag("neon_core_resolved"),
            },
            {
              text: "What's in it for me?",
              next: "reward",
              cond: () => !Q.isStarted("sq_neon"),
            },
            { text: "Not my problem." },
          ],
        },
        trouble: {
          text: "Trouble? My dear topsider, we are the uncounted in a city that wants everybody on a list, run by a generator that wants to be gone, next to a cathedral that wants us to be gone in a more spiritual way. Trouble is the Neon's chief export.",
          responses: [{ text: "Start with the generator.", next: "lights" }],
        },
        reward: {
          text: "The gratitude of eighty-three uncounted souls, two hundred scrip from the civic treasury — that's my hat — and the title of Honorary Citizen of the Neon, which entitles you to absolutely nothing but feels wonderful.",
          responses: [
            { text: "Deal.", action: () => Q.start("sq_neon") },
            { text: "I'll think about it." },
          ],
        },
        repair: {
          text: "[You spend an hour elbow-deep in the Big Buzz, bypassing a burnt coil bank and rebalancing the load across the marquee circuits. When you throw the breaker, all of Times Square flares so bright the whole square cheers.] ...Now THAT is a light show! You beautiful, beautiful stranger!",
          onEnter() {
            if (!Q.isStarted("sq_neon")) Q.start("sq_neon");
            L.xp(80, "Mechanics: The Big Buzz");
            L.standing(100, "Kept the lights on");
            L.giveScrip(200);
            L.give("q_mayor_top_hat", 1);
            neonResolve("repair");
          },
          responses: [{ text: "All in a day's work." }],
        },
        repair_fail: {
          text: "You poke at the Big Buzz. The Big Buzz pokes back. [You smell your own eyebrows.] Perhaps the rig battery, then?",
          responses: [
            {
              text: "I'll get the rig battery.",
              cond: () => !Q.isStarted("sq_neon"),
              action: () => Q.start("sq_neon"),
            },
            { text: "Maybe later." },
          ],
        },
        core_back: {
          text: "Is that — Big Buzz Number Two! [He takes his hat off and holds it over his heart.] You went into the tunnels. For us. Do you know how long it's been since a topsider did anything for us that didn't involve a shotgun?",
          responses: [
            { text: "It's yours, Mayor. Keep the lights on.", next: "give" },
            {
              text: "The Iron Covenant would pay more for this.",
              next: "cov_threat",
            },
            {
              text: "This is worth more than two hundred scrip.",
              check: { skill: "trade", value: 55 },
              next: "haggle",
              failNext: "haggle_fail",
            },
          ],
        },
        give: {
          text: "[He calls for Big Sal, and it takes both of them to carry the battery to the generator. A minute later, every sign in Times Square blazes back to life at once — FIZZO COLA, PRAIRIE ROOT BEER, HI-OCTANE HARRY'S — and a cheer goes up from every shack.] Honorary Citizen of the Neon. Forever. And take the hat. A citizen needs a hat.",
          onEnter() {
            L.take("q_neon_core", 1);
            L.giveScrip(200);
            L.give("q_mayor_top_hat", 1);
            L.standing(100, "Restored the Neon");
            neonResolve("crowe");
          },
          responses: [{ text: "Long live the Neon." }],
        },
        haggle: {
          text: "A negotiator! [He laughs, a dry, crackling laugh, like a log settling in a fire.] Fine, fine. Three hundred and the hat. The treasury will need a new hat. I'll wear a lampshade.",
          onEnter() {
            L.take("q_neon_core", 1);
            L.giveScrip(300);
            L.give("q_mayor_top_hat", 1);
            L.standing(40, "Restored the Neon");
            neonResolve("crowe");
          },
          responses: [{ text: "Pleasure doing business, Mayor." }],
        },
        haggle_fail: {
          text: "Two hundred is what the treasury has, friend. If you want more, you'll have to take it out of my hide, and my hide isn't worth much these days. It's been on the market since '67 and nobody's bid.",
          responses: [{ text: "Fine. It's yours.", next: "give" }],
        },
        cov_threat: {
          text: "[The warmth leaves his face.] Then sell it to them. The Covenant will say thank you, lock it in a strongroom, and forget it exists. And when the lights go out here, eighty-three people will learn exactly what a stranger's gratitude is worth. Your call, citizen.",
          responses: [
            { text: "...You're right. It's yours.", next: "give" },
            { text: "Business is business." },
          ],
        },
        leave_it: {
          text: "[He looks at the dying marquee for a while.] Then the robes will have it by Sunday. They've been down there all week with lanterns, singing, looking for something heavy. I suppose now they'll find it. [He puts his hat back on.] Candles, then. We've had worse.",
          onEnter() {
            neonResolve("left");
          },
          responses: [{ text: "[Leave.]" }],
        },
        again: {
          text: () =>
            L.flag("neon_outcome") === "crowe" ||
            L.flag("neon_outcome") === "repair"
              ? "Citizen! Look at those lights! Every night I stand here and count them. I lose count. It's wonderful."
              : L.flag("neon_outcome")
                ? "[The Mayor doesn't look at you. The Neon is lit by candles.]"
                : "Any luck in the tunnels, citizen? The Big Buzz is making that noise again.",
          responses: [
            { text: "Tell me about the Neon.", next: "mayor" },
            {
              text: "About your generator...",
              next: "lights",
              cond: () => !Q.isStarted("sq_neon"),
            },
            {
              text: "I'm not going down into those tunnels. Let them keep your battery.",
              next: "leave_it",
              cond: () =>
                Q.isActive("sq_neon") &&
                Q.stage("sq_neon") === "core" &&
                !L.has("q_neon_core") &&
                !L.flag("neon_core_resolved"),
            },
            { text: "Goodbye, Mayor." },
          ],
        },
      },
    });

    // ---------------- Marigold (Rad-Lounge) ----------------
    L.dialogue("dlg_neon_marigold", {
      start: () => (L.flag("wendell_wed") ? "wed" : "hello"),
      nodes: {
        hello: {
          text: "Welcome to the Rad-Lounge, sugar. I'm Marigold. I pour the drinks, I sing on Thursdays, and I don't do refunds. What'll it be?",
          responses: [
            { text: "Let's see what you're pouring.", barter: true },
            { text: "How long have you lived here?", next: "past" },
            {
              text: "Marigold... is that your real name?",
              check: { attr: "senses", value: 6 },
              next: "marjorie",
              failNext: "name_fail",
              cond: () =>
                Q.isStarted("sq_blackfriday") &&
                !L.flag("marigold_is_marjorie"),
            },
            { text: "Just looking." },
          ],
        },
        past: {
          text: "Since the week of the bombs. Before that I danced at a club on 44th. Before THAT I was a girl from Queens with a boyfriend who worked in Housewares at Sterling's and was too scared to propose. Ancient history, sugar. Twenty-two years is ancient, around here.",
          responses: [
            { text: "What happened to the boyfriend?", next: "boyfriend" },
            { text: "Let's see what you're pouring.", barter: true },
          ],
        },
        boyfriend: {
          text: "Same thing that happened to everybody. [She polishes a glass that doesn't need it.] ...Next question.",
          responses: [{ text: "Sorry I asked." }],
        },
        name_fail: {
          text: "It's the name on the sign, sugar. That's as real as names get around here.",
          responses: [{ text: "Fair enough." }],
        },
        marjorie: {
          text: "[You notice she wears a Sterling's employee pin on the inside of her collar — not hers, a man's: \"W. PRUITT — HOUSEWARES.\"] ...Nobody's noticed that pin in twenty-two years. [Quietly.] It was Marjorie, once. He doesn't know it's me. Look at us — twenty-two years took both our faces; how would he? And I've been too scared to tell him. Isn't that a laugh? He was the scared one.",
          onEnter() {
            L.setFlag("marigold_is_marjorie");
            L.xp(40, "Senses");
          },
          responses: [
            { text: "He still loves you. He never stopped.", next: "still" },
            { text: "Your secret's safe with me." },
          ],
        },
        still: {
          text: "Then he'll have to ask. He always did have to be the one to ask. [She smiles, and for a second you can see a girl from Queens.]",
          responses: [{ text: "Leave it to me." }],
        },
        wed: {
          text: "Well, if it isn't the best man. You're family now, sugar. Drinks are half price for family. Don't tell Crowe.",
          responses: [
            { text: "Let's see what you're pouring.", barter: true },
            { text: "Congratulations, Marjorie." },
          ],
        },
      },
    });

    // ---------------- Wendell Pruitt ----------------
    L.dialogue("dlg_neon_wendell", {
      start: () =>
        L.flag("wendell_wed")
          ? "wed"
          : Q.stage("sq_blackfriday") === "return" && L.has("q_wendell_ring")
            ? "ring"
            : L.flag("met_wendell")
              ? "again"
              : "first",
      nodes: {
        first: {
          text: "Welcome to Sterling's — oh. Sorry. Habit. Wendell Pruitt, Housewares, third floor. [He taps a name tag pinned to a coat that has been mended so many times it's mostly mending.] I was on shift when the world ended. Technically I'm still on shift. Nobody ever clocked me out.",
          onEnter() {
            L.setFlag("met_wendell");
          },
          responses: [
            {
              text: "You worked at Sterling's before the bombs?",
              next: "sterlings",
            },
            { text: "Anything I can help you find?", next: "job" },
            { text: "Goodbye, Wendell." },
          ],
        },
        again: {
          text: "Can I help you find something? Oh — it's you.",
          responses: [
            {
              text: "About your ring...",
              next: "job",
              cond: () => !Q.isStarted("sq_blackfriday"),
            },
            { text: "Just saying hello." },
          ],
        },
        sterlings: {
          text: 'Six years. The big March sale was the next morning. Doors at four A.M. Management told us to stand aside and "let the customers be customers." [He shivers.] The customers are still in there, you know. Maniacs, now. Some still have their shopping bags. Still waiting for the doors to open. They don\'t look like customers anymore.',
          responses: [
            { text: "Is there something in there you want?", next: "job" },
          ],
        },
        job: {
          text: "A ring. For a girl named Marjorie. I hid it in the manager's safe so the customers couldn't get at it, and I was going to ask her on one knee, in Housewares, after the sale. [He looks at his hands, rough and spotted like old paint.] She's gone, of course. Everybody's gone. But I'd like to hold it. Just once. Just to know I really meant to.",
          responses: [
            {
              text: "I'll get your ring, Wendell.",
              cond: () => !Q.isStarted("sq_blackfriday"),
              action: () => Q.start("sq_blackfriday"),
            },
            {
              text: "That place is crawling with Maniacs. What's it worth to you?",
              next: "pay",
              cond: () => !Q.isStarted("sq_blackfriday"),
            },
            { text: "Sorry, Wendell." },
          ],
        },
        pay: {
          text: "I don't have much. A hundred scrip and an old-world employee discount card — twenty percent off anything in Sterling's. [He pauses.] Nothing in Sterling's is for sale anymore. So it's really just the hundred scrip.",
          responses: [
            { text: "I'll do it.", action: () => Q.start("sq_blackfriday") },
            { text: "Not worth it." },
          ],
        },
        ring: {
          text: "[Wendell sees the little gift box in your hand and forgets to breathe for a moment.] You... you found it. You actually went into the store.",
          responses: [
            { text: "Here. It's yours.", next: "give" },
            {
              text: "Wendell — Marigold is Marjorie. She's been here all along.",
              cond: () => !!L.flag("marigold_is_marjorie"),
              next: "reveal",
            },
            {
              text: "Actually, I couldn't find it. The safe was empty.",
              standing: -50,
              next: "lie",
            },
          ],
        },
        give: {
          text: "[He holds it for a long time.] Thank you. I know it's foolish. Here — the hundred scrip, as promised. [He turns the box over and over.] I think I'll keep it in my pocket. Just in case the world starts over.",
          onEnter() {
            L.take("q_wendell_ring", 1);
            L.giveScrip(100);
            L.standing(75, "Returned Wendell's ring");
            L.setFlag("ring_resolved");
            L.setFlag("ring_returned");
            Q.complete("sq_blackfriday");
          },
          responses: [{ text: "Take care, Wendell." }],
        },
        reveal: {
          text: "[He looks across the square at the Rad-Lounge, where Marigold is singing something slow. He looks for a very long time.] ...The way she holds the microphone. Left hand. She always — she ALWAYS — [He is already walking. Then running. In front of the whole Neon, on the dusty asphalt of Times Square, Wendell Pruitt of Housewares gets down on one knee.]",
          onEnter() {
            L.take("q_wendell_ring", 1);
            L.giveScrip(100);
            L.setFlag("ring_resolved");
            L.setFlag("ring_returned");
            L.setFlag("wendell_wed");
            L.standing(150, "Reunited Wendell and Marjorie");
            L.xp(150, "Twenty-two years late");
            L.say("neon_marigold", "Yes, you idiot! YES!");
            L.news(
              "I've got a wedding announcement, folks, and I don't say that often in this business. Last night in the Neon, a fella named Wendell proposed to a gal named Marjorie — twenty-two years after he meant to. She said yes. She said, and I quote, \"you idiot, yes.\" This next one's for the happy couple.",
            );
            Q.complete("sq_blackfriday");
          },
          responses: [{ text: "[Applaud.]" }],
        },
        lie: {
          text: "[His shoulders drop an inch.] Ah. Well. The customers, I suppose. [He tries to smile.] Thank you for looking. It was silly of me.",
          onEnter() {
            L.setFlag("ring_resolved");
            L.setFlag("ring_kept");
            Q.complete("sq_blackfriday");
          },
          responses: [{ text: "[Leave.]" }],
        },
        wed: {
          text: "Married! Can you believe it? I'm a married man! She says she knew me the whole time. She says she was waiting for me to ask. Twenty-two years, and I STILL wasn't fast enough. [He beams.] Housewares, third floor, if you ever need anything. Anything at all.",
          responses: [{ text: "Congratulations, Wendell." }],
        },
      },
    });

    // ---------------- Doc Needles ----------------
    L.dialogue("dlg_neon_needles", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            "Doc Needles, head nurse. Broadway does the cutting, I do the stitching — and the cheap patch-ups, if you don't need a surgeon. Strangers bleed the same colour, mostly. " +
            (G.player.rads > 100
              ? "And sweetie, you are GLOWING."
              : "What hurts?"),
          responses: [
            {
              text: "Patch me up. (25 scrip)",
              cond: () => G.player.hp < G.player.maxHp,
              action: () => {
                if (L.pay(25)) {
                  G.player.heal(G.player.maxHp);
                  L.sfx("inject");
                }
              },
            },
            {
              text: "Get the rads out of me. (30 scrip)",
              cond: () => G.player.rads > 0,
              action: () => {
                if (L.pay(30)) L.removeRads();
              },
            },
            { text: "Let me see your supplies.", barter: true },
            { text: 'Why "Needles"?', next: "name" },
            { text: "I'm fine." },
          ],
        },
        name: {
          text: "I was a seamstress before the bombs. The hands remember, even if the fingertips don't feel much anymore. Now I stitch people instead of hems. People are harder. They wiggle. For anything worse than a scratch — radiation, broken bones — see Doc Broadway inside.",
          responses: [{ text: "Makes sense.", next: "hello" }],
        },
      },
    });

    // ---------------- Big Sal ----------------
    L.dialogue("dlg_neon_sal", {
      start: "hello",
      nodes: {
        hello: {
          text: () =>
            [
              "You're fine. You got a face like a face. Go on in.",
              "No Maniacs, no raiders, no trouble. You're none of those. Probably.",
              "Mayor's by the big stage. Lounge is round the back. Don't touch the neon, it bites.",
            ][Math.floor(Math.random() * 3)],
          responses: [
            { text: "Thanks, Sal." },
            { text: "Seen anything strange lately?", next: "strange" },
          ],
        },
        strange: {
          text: "Fellas in starched 1967 uniforms handing out census forms. Sky-Eye drones floating over the square at night, playing marching music. And a big grey Brute in a traffic-light crown hanging off the Empire State yelling about a queen. So — normal Tuesday.",
          responses: [{ text: "Right." }],
        },
      },
    });

    // ---------------- Keeper Ezra Hollowell ----------------
    L.dialogue("dlg_glow_ezra", {
      start: () =>
        Q.stage("sq_glow") === "return"
          ? "return"
          : Q.stage("sq_glow") === "take"
            ? "take"
            : L.flag("met_ezra")
              ? "again"
              : "first",
      nodes: {
        first: {
          text: "Welcome, child, to the Cathedral of the Second Sun. I am Keeper Ezra Hollowell. Do not be afraid of the clicking in those goggles of yours; that is only the Light, saying hello.",
          onEnter() {
            L.setFlag("met_ezra");
          },
          responses: [
            { text: "What is the Second Sun?", next: "sun" },
            {
              text: "This used to be St. Patrick's Cathedral.",
              next: "cathedral",
            },
            {
              text: "Is there anything I can do for the Glowkeepers?",
              next: "task",
            },
          ],
        },
        sun: {
          text: "For a thousand years we prayed to one sun, and it never answered. Then, on a grey Sunday morning in March of 1967, the Sun came down over Yonkers and answered everyone at once, rich and poor, listed and unlisted. We call that moment the Kindling, and all that came after, the Long Noon. The Sun does not choose. We do not fear the Glow. We keep it.",
          responses: [
            { text: "That sounds... dangerous.", next: "danger" },
            {
              text: "Is there anything I can do for the Glowkeepers?",
              next: "task",
            },
          ],
        },
        danger: {
          text: "So is birth, child. So is love. Everything worth doing makes a Geiger counter sing.",
          responses: [
            { text: "Anything I can do for the Glowkeepers?", next: "task" },
            { text: "I'll be going." },
          ],
        },
        cathedral: {
          text: "And it still is a cathedral! Its old faith simply made room for a brighter one. We kept the windows, and hung the sun disc over the altar. The windows are very beautiful when the lightning lights them from behind.",
          responses: [
            { text: "Anything I can do for the Glowkeepers?", next: "task" },
          ],
        },
        task: {
          text: "There is a market at Grand Central where thousands drink water scrubbed so clean it has forgotten the Light entirely. [He produces a small lead box with a crack in it. The crack glows.] This is a Blessed Isotope. Place it in their water tower's intake, and every sip will carry the warmth of the Kindling. They will thank us. Eventually. After the hair loss.",
          responses: [
            {
              text: "I'll do it.",
              cond: offerOpen,
              standing: -25,
              action: () => takeIsotope(false),
            },
            {
              text: "Give me the isotope. [Intending to deal with it yourself.]",
              cond: offerOpen,
              action: () => takeIsotope(true),
            },
            {
              text: "Poisoning people isn't a blessing.",
              check: { skill: "persuasion", value: 65 },
              next: "convince",
              failNext: "convince_fail",
              cond: offerOpen,
            },
            {
              text: "I won't poison anybody's water, Keeper. Find another errand boy.",
              cond: () => Q.stage("sq_glow") === "take",
              next: "refused",
            },
            { text: "No." },
          ],
        },
        take: {
          text: "The service I spoke of, friend. [He sets a small lead box on the altar rail. There is a crack in the lid, and the crack glows.] The market at Grand Central drinks water scrubbed so clean it has forgotten the Light. Place this Blessed Isotope in their water tower's intake, and every sip will carry the warmth of the Kindling. They will thank us. Eventually. After the hair loss.",
          onEnter() {
            L.setFlag("met_ezra");
          },
          responses: [
            {
              text: "I'll do it.",
              standing: -25,
              action: () => takeIsotope(false),
            },
            {
              text: "Give me the isotope. [Intending to deal with it yourself.]",
              action: () => takeIsotope(true),
            },
            {
              text: "Poisoning people isn't a blessing.",
              check: { skill: "persuasion", value: 65 },
              next: "convince",
              failNext: "convince_fail",
            },
            {
              text: "I won't poison anybody's water, Keeper. Find another errand boy.",
              next: "refused",
            },
            { text: "Let me think about it." },
          ],
        },
        refused: {
          text: "[He puts the lead box back inside his robe, unhurried.] The Light does not force itself on anyone, friend. I only wish it would, now and then. Go with the Noon.",
          onEnter() {
            refuseIsotope();
          },
          responses: [{ text: "[Leave.]" }],
        },
        convince: {
          text: "[He is quiet for a long time.] ...You speak as if the Light were a thing to be pushed onto people. Perhaps you are right. Perhaps a blessing forced is only a burn. [He closes the lead box.] I will pray on it. Take these, for your honesty — the Noon favours those who speak plainly.",
          onEnter() {
            if (L.has("q_blessed_isotope")) L.take("q_blessed_isotope", 1);
            L.setFlag("glow_convinced");
            L.standing(100, "Talked down Keeper Hollowell");
            L.xp(80, "Persuasion: Crisis of faith");
            L.give("q_glowkeeper_vestments", 1);
            if (!Q.isStarted("sq_glow")) Q.start("sq_glow");
            glowMirror();
            Q.complete("sq_glow");
          },
          responses: [{ text: "Thank you, Keeper." }],
        },
        convince_fail: {
          text: "You are young — younger than you look, I think, for all the years you slept — and the clicking frightens you. It will pass. Everything passes. Except half-lives. Those take a while.",
          responses: [{ text: "[Leave.]" }],
        },
        again: {
          text: () =>
            L.flag("glow_isotope_planted") || L.flag("glow_placebo_planted")
              ? "Bearer of the Light! The market glows with the Noon! [He seems genuinely overjoyed.]"
              : "The Noon be on you, child.",
          responses: [
            {
              text: "Is there anything I can do for the Glowkeepers?",
              next: "task",
              cond: offerOpen,
            },
            { text: "And on you, Keeper." },
          ],
        },
        return: {
          text: () =>
            L.flag("glow_isotope_planted") || L.flag("glow_placebo_planted")
              ? "I saw it from the bell tower! Grand Central's water tower, glowing like a second dawn. The Second Sun has received your offering. Take these vestments, Bearer of the Light, and this scrip from the collection plate."
              : "You carry the isotope still. Its warmth is wasted in your pack, child. Have you changed your heart?",
          responses: [
            {
              text: "Thank you, Keeper.",
              cond: () =>
                L.flag("glow_isotope_planted") ||
                L.flag("glow_placebo_planted"),
              action: () => {
                L.give("q_glowkeeper_vestments", 1);
                L.giveScrip(150);
                Q.complete("sq_glow");
              },
            },
            {
              text: "A blessing nobody asked for is only a burn, Keeper. I carried it all this way and never once wanted to use it.",
              cond: () => L.has("q_blessed_isotope"),
              check: { skill: "persuasion", value: 50 },
              next: "convince",
              failNext: "convince_fail",
            },
            {
              text: "I won't do it. Take it back.",
              cond: () => L.has("q_blessed_isotope"),
              action: () => refuseIsotope(),
            },
            { text: "Not yet.", cond: () => L.has("q_blessed_isotope") },
          ],
        },
      },
    });

    // ---------------- Sister Noonday ----------------
    L.dialogue("dlg_glow_sister", {
      start: "hello",
      nodes: {
        hello: {
          text: "The Noon be on you, traveller! I'm Sister Noonday. I was Sister Maureen, but then I found the Light, and also a barrel of something that glows. Would you like some Noon water? It's very holy. You can tell by the colour.",
          responses: [
            { text: "Let me see what you have.", barter: true },
            {
              text: "Why do you sell Prussian Blue if you love radiation?",
              next: "flush",
            },
            { text: "Can I read your scripture?", next: "scripture" },
            { text: "The Noon be on you, Sister." },
          ],
        },
        flush: {
          text: "For the unconvinced! The Light does not force itself on anyone. [She glances at the cathedral doors, and lowers her voice.] ...Keeper Hollowell might. But the Light doesn't.",
          responses: [
            { text: "Let me see what you have.", barter: true },
            { text: "I see." },
          ],
        },
        scripture: {
          text: "Of course! The Book of the Kindling is on the teletype by the altar. The machine asks for a word before it prints; the word is LONGNOON, all one word. We are not a secret society, traveller. We are a very bright one.",
          learn: LOCK_SCRIPTURE.id,
          onEnter() {
            learnCode(LOCK_SCRIPTURE.id);
          },
          responses: [
            { text: "Let me see what you have.", barter: true },
            { text: "Thank you, Sister." },
          ],
        },
      },
    });

    // ---------------- The water tower (actor-less dialogue) ----------------
    L.dialogue("dlg_glow_tower", {
      start: "tower",
      nodes: {
        tower: {
          speaker: "Water Tower Intake",
          text: "[A rusted intake valve feeds Grand Central's rooftop water tower. You can hear water rushing below. The Blessed Isotope is warm against your leg.]",
          responses: [
            {
              text: "[Drop the Blessed Isotope into the intake.]",
              action: () => plantIsotope(false),
            },
            {
              text: "[Swap the isotope for a bottle of Fizzo Blue, seal the reliquary and drop in the fake.]",
              check: { skill: "mechanics", value: 50 },
              failNext: "swap_fail",
              cond: () => L.has(FIZZO_BLUE()),
              action: () => plantIsotope(true),
            },
            { text: "[Leave it alone.]" },
          ],
        },
        swap_fail: {
          text: "[You can't work out how to open the reliquary without cracking the lead lining — and dosing yourself thoroughly in the process.]",
          responses: [{ text: "[Step back.]" }],
        },
      },
    });
  });

  // Selling the Neon's battery to the Iron Covenant / the Glowkeepers (responses injected into their trees)
  L.hook("register", function () {
    // Extra response injected into Reyes' and Hollowell's trees at runtime: selling the Neon's battery.
    const addSell = (dlgId, nodeId, text, how, scrip, standing) => {
      const tree = L.DIALOGUES.get(dlgId);
      if (!tree || !tree.nodes[nodeId]) return;
      const rs = tree.nodes[nodeId].responses;
      if (!Array.isArray(rs) || rs.some((r) => r._neonSell)) return;
      rs.splice(rs.length - 1, 0, {
        _neonSell: true,
        text,
        cond: () => L.has("q_neon_core") && !L.flag("neon_core_resolved"),
        standing,
        action: () => {
          L.take("q_neon_core", 1);
          L.giveScrip(scrip);
          neonResolve(how);
        },
      });
    };
    addSell(
      "dlg_cov_reyes",
      "hello",
      "I have a rig battery to sell. (400 scrip)",
      "sold",
      400,
      -100,
    );
    addSell(
      "dlg_glow_ezra",
      "again",
      "I have the Neon's rig battery. Let the Neon sit in the dark. (250 scrip)",
      "glow",
      250,
      -150,
    );
  });
})();
