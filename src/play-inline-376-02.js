// play-inline-376 02 — hint
// Lines 35-251 of readable/play-inline-376.pretty.js (statement-aligned).
  const P = G._m3;
  const PI = P.PI,
    HP = P.HP;
  const C = (P.content = {});
  P.onPreReady = P.onPreReady || [];

  // ------------------------------------------------------------------
  // locks (read by the site builders in init)
  // ------------------------------------------------------------------
  P.LOCKS = {
    king_safe: {
      id: "m3_king_safe",
      label: "The King's Safe",
      kind: "safe",
      code: "1105",
      hint: 'The King\'s ledger teletype in the "52" office.',
    },
    officer_safe: {
      id: "m3_officer_safe",
      label: "Officer's Safe",
      kind: "safe",
      code: "0712",
      hint: "Lieutenant Voss's teletype, New York Central Building, 3rd floor.",
    },
    armory_locker: {
      id: "m3_armory_locker",
      label: "Armory Locker",
      kind: "container",
      code: "3197",
      hint: "The Detachment 7 duty log tape reel.",
    },
    officer_term: {
      id: "m3_helms_officer",
      label: "Lt. A. Voss — Teletype",
      kind: "terminal",
      passcode: "GILDEDCROWN",
      hint: "The watch bill on the barracks teletype.",
    },
    relay_term: {
      id: "m3_helms_relay",
      label: "Relay 7 — Carrier Control",
      kind: "terminal",
      passcode: "REDEYE",
      key: "m3_relay_codes",
      hint: "Lieutenant Voss carries the relay code card.",
      keyFrom: "NPC: Lieutenant Voss (Helmsley crown)",
    },
    locker_vanderhoof: {
      id: "m3_locker_vanderhoof",
      label: "Private Locker — Mrs. Vanderhoof",
      kind: "container",
      code: "1931",
      hint: "The sommelier's cellar-book tape reel.",
    },
    locker_bradberton: {
      id: "m3_locker_bradberton",
      label: "Private Locker — J.-C. Bradberton",
      kind: "container",
      code: "4422",
      hint: "The sommelier's cellar-book tape reel.",
    },
    cellar_wall: {
      id: "m3_cellar_wall",
      label: "Brick Wall (pin-hole latch)",
      kind: "door",
      key: "m3_meat_skewer",
      hint: 'A meat skewer from the "52" kitchen rack.',
    },
  };
  for (const k in P.LOCKS) P.lockReg(P.LOCKS[k]);
  P.tick = P.tick || [];

  // ------------------------------------------------------------------
  // persistent state (G.save 'poi_midtown3' → content)
  // ------------------------------------------------------------------
  const DEF_STATE = () => ({
    holeFound: false,
    cellarOpen: false,
    reserveTaken: false,
    relay: "on",
    vossDead: false,
    kingNamed: false,
    extraDead: [],
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
  const take = (id, n) => {
    try {
      if (!has(id, n)) return false;
      G.inventory.remove(id, n || 1);
      return true;
    } catch (e) {
      return false;
    }
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
  const skill = (id) => {
    try {
      return G.isStub("rpg") ? 0 : G.rpg.skill(id) || 0;
    } catch (e) {
      return 0;
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
    if (q && !qDone(id)) P.safe("qset", () => q.setStage(id, st));
  };
  const qStart = (id, st) => {
    const q = Q();
    if (q && !q.isActive(id) && !q.isComplete(id))
      P.safe("qstart", () => (st ? q.setStage(id, st) : q.start(id)));
  };
  const qComplete = (id) => {
    const q = Q();
    if (q && !qDone(id)) P.safe("qdone", () => q.complete(id));
  };
  const actor = (id) => {
    try {
      return !G.isStub("actors") && G.actors.get ? G.actors.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  const A = (poi, name) => P.anchor(poi, name);
  const news = (text, key) =>
    P.safe("news", () => {
      if (!G.isStub("radio") && typeof G.radio.addNews === "function")
        G.radio.addNews(text, key);
    });
  const sfx = (name, o) => P.safe("sfx", () => G.sfx.play(name, o));

  // ==================================================================
  // ITEMS
  // ==================================================================
  function cloneWeapon(id, baseId, patch, def) {
    if (G.items.get(id)) return;
    const base = G.items.get(baseId);
    if (!base || !base.weapon) return;
    const w = JSON.parse(
      JSON.stringify(base.weapon, (k, v) =>
        typeof v === "function" ? undefined : v,
      ),
    );
    Object.assign(w, patch);
    G.items.define(
      Object.assign(
        {
          type: "weapon",
          weight: base.weight || 3,
          value: (base.value || 100) * 3,
          unique: true,
          weapon: w,
        },
        def,
        { id },
      ),
    );
  }
