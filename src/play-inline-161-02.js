// play-inline-161 02 — code
// Lines 33-292 of readable/play-inline-161.pretty.js (statement-aligned).
  const P = G._pu;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];
  P.tick = P.tick || [];

  // ------------------------------------------------------------------
  // locks (read by the site builders in init). Every unlock is placed in this module:
  //   pu_dakota_3b        key pu_key_hollis (Superintendent's Desk, Dakota basement office)
  //   pu_dakota_pell_safe code 0412 (the Pell place card, 2B dining room)
  //   pu_amnh_star_safe   code 4117 (the projectionist's tape reel, Hayden booth)
  //   pu_amnh_collections passcode UNGUIS (Curator Halvorsen's memo)
  //   pu_plaza_pres       code 1907 (the Plaza front-desk teletype)
  //   pu_plaza_pres_safe  code 2215 (Winifred's letter on hotel stationery, Presidential Suite)
  //   pu_tiffany_watch    code 1837 (Tiffany security teletype)
  //   pu_tiffany_box_1238 code 4417 (Tiffany security teletype)
  //   pu_tiffany_security passcode MOSLER (Walt the night watchman's note)
  //   pu_tiffany_vault    key pu_key_tiffany_vault (the Raider Boss) — or the time-lock override on the security teletype
  // ------------------------------------------------------------------
  P.LOCKS = {
    dakota_3b: {
      id: "pu_dakota_3b",
      label: "Apartment 3B — Hollis",
      kind: "door",
      key: "pu_key_hollis",
      hint: "The superintendent kept the key in his desk.",
    },
    pell_safe: {
      id: "pu_dakota_pell_safe",
      label: "Pell Family Safe",
      kind: "safe",
      code: "0412",
      hint: "The place card on the Pell dining table.",
    },
    star_safe: {
      id: "pu_amnh_star_safe",
      label: "Planetarium Safe",
      kind: "safe",
      code: "4117",
      hint: "The projectionist's tape reel in the Hayden booth.",
    },
    collections: {
      id: "pu_amnh_collections",
      label: "AMNH Collections Teletype",
      kind: "terminal",
      passcode: "UNGUIS",
      hint: "Curator Halvorsen's memo.",
    },
    pres_door: {
      id: "pu_plaza_pres",
      label: "Presidential Suite",
      kind: "door",
      code: "1907",
      hint: "The Plaza front-desk teletype.",
    },
    pres_safe: {
      id: "pu_plaza_pres_safe",
      label: "Presidential Suite Safe",
      kind: "safe",
      code: "2215",
      hint: "Winifred's letter on hotel stationery, in the suite.",
    },
    watch_safe: {
      id: "pu_tiffany_watch",
      label: "Watch Department Safe",
      kind: "safe",
      code: "1837",
      hint: "The Tiffany security teletype.",
    },
    deposit_1238: {
      id: "pu_tiffany_box_1238",
      label: "Safety Deposit Box 1238",
      kind: "safe",
      code: "4417",
      hint: "The Tiffany security teletype.",
    },
    security: {
      id: "pu_tiffany_security",
      label: "Tiffany Security Teletype",
      kind: "terminal",
      passcode: "MOSLER",
      hint: "Walt the night watchman's note.",
    },
    vault: {
      id: "pu_tiffany_vault",
      label: "Tiffany Vault Door",
      kind: "door",
      key: "pu_key_tiffany_vault",
      hint: "The Raider Boss wears the key; the security teletype can also release the time lock.",
      keyFrom: "NPC: the Tiffany Raider Boss (carries the key)",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);

  // ------------------------------------------------------------------
  // persistent state (own save block: G.save 'poi_uptown' → content)
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    showRuns: 0,
    cellTaken: false,
    hollisOpen: false,
    presOpen: false,
    vaultOpen: false,
    timelock: false,
    breakerOff: false,
    rented: false,
    dynamoOn: false,
    concertDone: false,
    patron: false,
    scoreGiven: false,
    powerGiven: false,
    nanny: null,
    agnesMet: false,
    cryHeard: false,
    eggGiven: false,
    heistStarted: false,
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
      G.reportError("poi_uptown:give", e);
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
      G.sfx.play("ui_error");
      return false;
    }
    give("scrip", -n);
    if (!G.inventory.addScrip) take("scrip", n);
    G.sfx.play("barter_trade");
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
    if (q) P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => (st ? q.setStage(id, st) : q.start(id)));
  };
  const qComplete = (id) => {
    const q = Q();
    if (q) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
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
