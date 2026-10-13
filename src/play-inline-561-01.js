// play-inline-561 01 — locks
// Lines 20-128 of readable/play-inline-561.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const L = G.quests.lib;
  const Q = G.quests;

  const CHRYSLER = { x: 309, z: -208 },
    FLAT = { x: 150, z: 118 },
    WRECK = { x: 100, z: 40 },
    MET = { x: 82, z: -655 };
  const STOCK_WAGON = [
    [["purified_water", /purified water/i], 10],
    [["rally_tonic"], 3],
    [["ammo_10mm"], 50],
    [["ammo_556"], 40],
    [["ammo_12ga"], 24],
    [["duct_tape", /duct tape/i], 4],
    [["golden_plain_jerky", /golden plain|jerky/i], 5],
    [["franks_and_beans", /franks/i], 4],
  ];
  const STOCK_GUS = [
    [["leather_armor", /leather armor/i], 1],
    [["metal_armor", /metal armor/i], 1],
    [["lead_pipe"], 1],
    [["bolt_rifle_32"], 1],
    [["ammo_32"], 60],
    [["scrap_metal", /scrap metal/i], 6],
    [["prussian_blue"], 2],
    [["frag_mine"], 2],
    [["hunting_knife"], 1],
  ];

  // ------------------------------------------------------------------
  // Locks (G.locks, REBRAND §5): every passcode / combination is learnable in this file
  // ------------------------------------------------------------------
  const LOCK_MET = {
    id: "q_dt_met_security",
    label: "Met Security Teletype",
    passcode: "VERMEER",
    kind: "terminal",
    hint: "CURATOR-7 remembers the Director of Security's passcode.",
    learnedFrom: ["CURATOR-7 (Metropolitan Museum steps)"],
  };
  const LOCK_CITY_HALL = {
    id: "q_dt_city_hall_mayor",
    label: "Mayor's Office Teletype",
    passcode: "GRACIE",
    kind: "terminal",
    hint: "Chess Charlie clerked in the Mayor's office before the bombs.",
    learnedFrom: ["Chess Charlie (Washington Square)"],
  };
  const LOCK_STRONGBOX = {
    id: "q_dt_caldwell_strongbox",
    label: "Caldwell Strongbox",
    code: "0419",
    kind: "container",
    hint: "Hattie keeps her combinations in the Flatiron ledger.",
    learnedFrom: ["Flatiron Trading Post teletype (Hattie — Personal)"],
  };
  const LOCKS = [LOCK_MET, LOCK_CITY_HALL, LOCK_STRONGBOX];
  function learnLock(id, src) {
    if (G.locks && G.locks.learn) {
      try {
        G.locks.learn(id, src);
      } catch (e) {
        /* */
      }
    }
  }
  function knows(id) {
    return !!(G.locks && G.locks.isKnown && G.locks.isKnown(id));
  }
  const AT = (t) => t;
  const isSecBot = (a) => {
    const t = AT(a.type);
    return t === "patrolman" || t === "valet";
  };
  const isShellback = (a) => /^shellback/.test(AT(a.type) || "");
  const covenantSided = () => L.flag("mq_faction") === "covenant";

  // ------------------------------------------------------------------
  // Spots
  // ------------------------------------------------------------------
  function batteryPier() {
    return L.anchor("battery_park", ["ferryman", "skiff", "pier", "dock"], {
      x: -128,
      z: 962,
    });
  }
  function libertyDock() {
    const c = G.LAYOUT.LIBERTY;
    const dx = -100 - c.x,
      dz = 960 - c.z,
      dl = Math.hypot(dx, dz);
    return L.anchor("statue_of_liberty", ["dock", "pier", "ferry", "landing"], {
      x: c.x + (dx / dl) * (c.r - 8),
      z: c.z + (dz / dl) * (c.r - 8),
    });
  }
  L.spots = { batteryPier, libertyDock };
  const sniperDone = () =>
    !!(
      L.flag("dolores_recruited") ||
      L.flag("dolores_left") ||
      L.flag("dolores_dead")
    );

  // ------------------------------------------------------------------
  // Quests
  // ------------------------------------------------------------------
