// play-inline-548 06 — lib
// Lines 2067-2183 of readable/play-inline-548.pretty.js (statement-aligned).
  function resetAll() {
    STATE.clear();
    FLAGS = {};
    TRACKED = null;
    lib.npcs = {};
    lib.pickups = {};
    lib.hintsShown = {};
    lib.hintBusyUntil = 0;
    lib.gen++;
    clearScheduled();
    anchorCache.clear();
    lib.markerCache.clear();
    doorCache.map.clear();
    snapCache.clear();
    for (const t of TRUCE_LIVE.values()) t.off = false;
    clearDynamic();
    for (const t of TRIGGERS) t._cool = 0;
    lib.run("reset");
  }

  // ------------------------------------------------------------------
  // Public namespace (replaces the core stub wholesale)
  // ------------------------------------------------------------------
  G.quests = {
    /** Every registered quest definition (id, name, stages, rewards …) — the lock audit reads quest-reward keys from it. */
    all: () => Array.from(DEFS.values()),
    define: defineQuest,
    start,
    setStage,
    complete,
    fail,
    isActive,
    isComplete,
    isFailed,
    isStarted,
    stage,
    reached,
    list,
    get: view,
    activeMarkers,
    allMarkers,
    setTracked,
    tracked,
    flag,
    setFlag,
    incFlag,
    playEnding,
    defineEnding,
    /** Debug helpers: G.quests.debug.skipTo('mq03') etc. are defined by content files. */
    debug: {},
    lib,
  };

  // ------------------------------------------------------------------
  // Module registration
  // ------------------------------------------------------------------
  G.registerModule({
    name: "quests",
    order: 60,
    init() {
      lib.run("init"); // items, quests
      lib.run("register"); // dialogue trees & terminals (collected into DIALOGUES/TERMINALS)
      lib.registerAll();
      G.events.on("initDone", () => {
        lib.registerAll(); // again, in case ui_interact (order 70) rebuilt its registries in init
        if (!worldBuilt) {
          worldBuilt = true;
          lib.run("world");
        }
      });
      G.events.on("reset", () => resetAll());
      G.events.on("newGame", (opts) => {
        if (!worldBuilt) {
          worldBuilt = true;
          lib.run("world");
        }
        lib.run("newGame", opts || {});
        lib.run("spawn", { newGame: true });
      });
      G.events.on("loaded", () => {
        if (!worldBuilt) {
          worldBuilt = true;
          lib.run("world");
        }
        lib.run("spawn", { loaded: true });
        lib.run("loaded");
      });
      G.events.on("actorKilled", onActorKilled);
      // Remember collected quest pickups so they don't respawn after loading. Only the
      // pickup the player actually took counts: the same item id bought from a merchant
      // (or looted elsewhere) must not mark a world copy as collected.
      G.events.on("itemAdded", (id) => {
        const P = G.player && G.player.pos;
        for (const k in lib.pickups) {
          const pk = lib.pickups[k];
          if (pk.id !== id || FLAGS["got_" + k]) continue;
          if (
            pickupTaken(pk) ||
            (P &&
              pk.pos &&
              Math.hypot(P.x - pk.pos.x, P.z - pk.pos.z) < 4.5 &&
              Math.abs(P.y - (pk.pos.y || 0)) < 4)
          )
            FLAGS["got_" + k] = true;
        }
      });
    },
    update(dt, realDt) {
      tickLater(dt); // game time: 0 while paused / in menus
      if (G.state !== "play" && G.state !== "cutscene") return;
      if (G.state === "play") gogglesGate();
      tickCine(realDt); // camera scripts run at real speed
      pollTruces(realDt);
      pollTriggers(realDt);
      for (const fn of HOOKS.update) safe("update", () => fn(dt, realDt));
    },
  });
