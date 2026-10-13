// play-inline-277 02 — inventory
// Lines 36-264 of readable/play-inline-277.pretty.js (statement-aligned).
  const P = G._uw;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];
  P.tick = P.tick || [];

  // locks (read by the site builders in init; see the header for where each unlock lives)
  P.LOCKS = {
    ans_seedbank: {
      id: "uw_ans_seedbank",
      label: "Stokes Seed Bank",
      kind: "container",
      key: "uw_key_stokes",
      hint: "Old Stokes carries the key on the Ansonia roof.",
      keyFrom: "NPC: Old Stokes (Ansonia roof)",
    },
    ans_safe: {
      id: "uw_ans_safe",
      label: "Ansonia Office Safe",
      kind: "safe",
      code: "1904",
      hint: "The Ansonia management teletype.",
    },
    ans_manager: {
      id: "uw_ans_manager",
      label: "Ansonia Management Teletype",
      kind: "terminal",
      passcode: "GOATS",
      hint: "The residents board on the Ansonia front-desk teletype.",
    },
    sr_office: {
      id: "uw_sr_office",
      label: "San Remo Commune Ledger",
      kind: "terminal",
      passcode: "SEEDLING",
      hint: "The commune notice in the San Remo lobby.",
    },
    bl_manager: {
      id: "uw_bl_manager",
      label: "Bellamy's Store Manager Teletype",
      kind: "terminal",
      passcode: "DRESSUP",
      hint: "The Window Dresser's rules, nailed to the manager's desk.",
    },
    bl_safe: {
      id: "uw_bl_safe",
      label: "Manager's Safe",
      kind: "safe",
      code: "1886",
      hint: "The Bellamy's manager teletype.",
    },
    bl_cage: {
      id: "uw_bl_cage",
      label: "Hold Cage",
      kind: "door",
      key: "uw_key_cage",
      hint: "The Window Dresser carries the key; the manager teletype can release it.",
      keyFrom: "NPC: the Window Dresser (Bellamy's)",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);

  // ------------------------------------------------------------------
  // persistent state
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    bonus: false,
    niaGift: false,
    planted: false,
    seedsGiven: false,
    cageOpen: false,
    tobyFreed: false,
    tobyHome: false,
    birdieMet: false,
    adelineMet: false,
    gusTalks: 0,
    healed: 0,
    stokesDead: false,
  });
  let F = DEF_STATE();
  C.F = () => F;
  P.saveHooks.content = {
    save: () => Object.assign({}, F),
    load: (d) => {
      F = Object.assign(DEF_STATE(), d || {});
      applyWorldState();
    },
  };

  // ------------------------------------------------------------------
  // safe wrappers
  // ------------------------------------------------------------------
  const has = (id, n) => {
    try {
      return !G.isStub("inventory") && G.inventory.count(id) >= (n || 1);
    } catch (e) {
      return false;
    }
  };
  const give = (id, n, silent) => {
    try {
      if (G.isStub("inventory")) return;
      if (id === "scrip" && G.inventory.addScrip) G.inventory.addScrip(n);
      else G.inventory.add(id, n || 1, silent ? { silent: true } : undefined);
    } catch (e) {
      G.reportError("poi_uws:give", e);
    }
  };
  const take = (id, n) => {
    try {
      if (!has(id, n)) return false;
      G.inventory.remove(id, n || 1);
      return true;
    } catch (e) {
      return false;
    }
  };
  const scrip = () => {
    try {
      return G.isStub("inventory")
        ? 0
        : G.inventory.scrip
          ? G.inventory.scrip()
          : G.inventory.count("scrip");
    } catch (e) {
      return 0;
    }
  };
  const pay = (n) => {
    if (scrip() < n) {
      G.notify("You don't have enough scrip.");
      P.safe("sfx", () => G.sfx.play("ui_error"));
      return false;
    }
    if (G.inventory.addScrip) G.inventory.addScrip(-n);
    else take("scrip", n);
    P.safe("sfx", () => G.sfx.play("barter_trade"));
    return true;
  };
  const xp = (n, why) => {
    try {
      if (!G.isStub("rpg")) G.rpg.addXP(n, why);
    } catch (e) {
      /* */
    }
  };
  const standing = (n, why) => {
    try {
      if (!G.isStub("rpg") && G.rpg.addStanding) G.rpg.addStanding(n, why);
    } catch (e) {
      /* */
    }
  };
  const Q = () =>
    !G.isStub("quests") && G.quests && typeof G.quests.define === "function"
      ? G.quests
      : null;
  const qStage = (id) => {
    const q = Q();
    try {
      return q ? q.stage(id) : null;
    } catch (e) {
      return null;
    }
  };
  const qActive = (id) => {
    const q = Q();
    try {
      return !!(q && q.isActive(id));
    } catch (e) {
      return false;
    }
  };
  const qDone = (id) => {
    const q = Q();
    try {
      return !!(q && q.isComplete(id));
    } catch (e) {
      return false;
    }
  };
  const qSet = (id, st) => {
    const q = Q();
    if (!q) return;
    if (!q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => q.start(id));
    P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => {
        q.start(id);
        if (st) q.setStage(id, st);
      });
  };
  const qComplete = (id) => {
    const q = Q();
    if (q && !q.isComplete(id)) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
  const sfx = (n, o) => P.safe("sfx", () => G.sfx.play(n, o));
  C.helpers = {
    has,
    give,
    take,
    pay,
    xp,
    standing,
    qStage,
    qActive,
    qDone,
    qSet,
    qStart,
    actor,
    A,
  };

  // ==================================================================
  // ITEMS
  // ==================================================================
