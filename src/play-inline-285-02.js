// play-inline-285 02 — inventory
// Lines 31-261 of readable/play-inline-285.pretty.js (statement-aligned).
  const P = G._pt;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];

  // ------------------------------------------------------------------
  // Locks (read by the site builders in init). Every unlock is placed in this module:
  //   pt_es_producer   passcode APPLAUSE  pencilled on the Tomorrow Hour cue cards (Studio 50 stage)
  //   pt_es_safe       code 5050          the producer's teletype (its remote release also opens it)
  //   pt_ly_strongbox  code 1903          Barnaby's ghost-light tape reel (Lyceum fly gallery)
  //   pt_pa_dispatch   passcode GATE206   the porter's tape reel (Port Authority baggage level)
  //   pt_pa_safe       code 4105          the dispatcher's teletype
  //   pt_pa_locker417  key pt_key_locker417 (Lost & Found, baggage level)
  // The Ed Sullivan stage door is one-way (bolted from inside), not a lock.
  // ------------------------------------------------------------------
  P.LOCKS = {
    es_producer: {
      id: "pt_es_producer",
      label: "Office of the Producer — Teletype",
      kind: "terminal",
      passcode: "APPLAUSE",
      hint: "Pencilled on the Tomorrow Hour cue cards.",
    },
    es_safe: {
      id: "pt_es_safe",
      label: "Producer's Safe",
      kind: "safe",
      code: "5050",
      hint: "The producer's teletype.",
    },
    ly_strongbox: {
      id: "pt_ly_strongbox",
      label: "Director's Strongbox",
      kind: "safe",
      code: "1903",
      hint: "Barnaby's ghost-light tape reel.",
    },
    pa_dispatch: {
      id: "pt_pa_dispatch",
      label: "Dispatcher — Upper Level Teletype",
      kind: "terminal",
      passcode: "GATE206",
      hint: "The porter's tape reel on the baggage level.",
    },
    pa_safe: {
      id: "pt_pa_safe",
      label: "Dispatcher's Safe",
      kind: "safe",
      code: "4105",
      hint: "The dispatcher's teletype.",
    },
    locker417: {
      id: "pt_pa_locker417",
      label: "Coin Locker 417",
      kind: "container",
      key: "pt_key_locker417",
      hint: "The Lost & Found on the baggage level.",
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);
  // the cue cards are handed over by the stage interactable (not a world pickup): declare it for the locks audit
  G.events.on("initDone", () => {
    P.safe("cueSource", () => {
      if (P.locksLive() && G.locks.obtainableFrom)
        G.locks.obtainableFrom(
          "pt_note_es_cuecards",
          "Cue Cards on the Studio 50 stage",
        );
    });
  });
  P.onRelocated = P.onRelocated || [];
  P.tick = P.tick || [];

  // ------------------------------------------------------------------
  // persistent state (saved under G.save 'poi_theater' → content)
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    bookGiven: false,
    lightGiven: false,
    showDone: false,
    showsSeen: 0,
    bonusCaps: false,
    power: false,
    broadcast: false,
    locker: false,
    ticket: false,
    metBarnaby: false,
    safeReleased: false,
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
      G.reportError("poi_theater:give", e);
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
    if (G.inventory.addScrip) G.inventory.addScrip(-n);
    else take("scrip", n);
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
  const news = (t) => {
    try {
      if (!G.isStub("radio") && G.radio.addNews) G.radio.addNews(t);
    } catch (e) {
      /* optional */
    }
  };
  C.helpers = {
    has,
    give,
    take,
    pay,
    xp,
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
