// play-inline-596 02 — stats
// Lines 362-522 of readable/play-inline-596.pretty.js (statement-aligned).
  try {
    if (!document.getElementById("gg-font")) {
      const l = document.createElement("link");
      l.id = "gg-font";
      l.rel = "stylesheet";
      l.href =
        "https://fonts.googleapis.com/css2?family=Major+Mono+Display&display=swap";
      document.head.appendChild(l);
    }
  } catch (e) {
    /* offline: falls back to Share Tech Mono */
  }

  // ------------------------------------------------------------------
  // Game-state bookkeeping used by several parts
  // ------------------------------------------------------------------
  H.combatActive = function () {
    try {
      if (G.combat && !G.combat.__stub) {
        if (typeof G.combat.inCombat === "function")
          return !!G.combat.inCombat();
        if (typeof G.combat.inCombat === "boolean") return G.combat.inCombat;
        if (typeof G.combat.isInCombat === "function")
          return !!G.combat.isInCombat();
      }
    } catch (e) {
      /* ignore */
    }
    return H.inCombat;
  };
  G.events.on("combatStart", () => {
    H.inCombat = true;
  });
  G.events.on("combatEnd", () => {
    H.inCombat = false;
  });
  G.events.on("reset", () => {
    H.inCombat = false;
  });
  G.events.on("state", () => {
    H.stateAge = 0;
  });

  // Stats for the goggles STATUS > RECORD page
  G.events.on("actorKilled", (actor, killer) => {
    if (
      killer === "player" ||
      killer === G.player ||
      (killer && killer.isPlayer)
    )
      H.stats.kills++;
  });
  G.events.on("locationDiscovered", () => {
    H.stats.locations++;
  });
  G.events.on("questCompleted", () => {
    H.stats.questsDone++;
  });
  G.events.on("playerDied", () => {
    H.stats.deaths++;
  });
  const resetStats = () => {
    for (const k in H.stats) H.stats[k] = 0;
  };
  G.events.on("newGame", resetStats);
  // core emits 'reset' before applying a save, so an old save without a ui_hud block starts clean
  G.events.on("reset", resetStats);
  G.save.register("ui_hud", {
    save: () => ({
      stats: H.stats,
      lamp: !!(G.goggles && G.goggles.lampOn && G.goggles.lampOn()),
    }),
    load: (d) => {
      if (d && d.stats) Object.assign(H.stats, d.stats);
      if (d && G.goggles && G.goggles.setLamp)
        G.goggles.setLamp(!!(d.lamp || d.light), true);
    },
  });

  // ------------------------------------------------------------------
  // The public namespace (other files extend G.hud with more methods)
  // ------------------------------------------------------------------
  G.hud = {
    _: H,
    /** Show/hide the whole in-game HUD overlay (e.g. for cinematics). */
    setVisible(v) {
      H.hudForcedHidden = !v;
    },
    isVisible() {
      return !H.hudForcedHidden;
    },
    settings() {
      return Object.assign({}, H.settings);
    },
    setSetting(k, v) {
      H.settings[k] = v;
      H.saveSettings();
      H.applySettings();
    },
  };

  // ------------------------------------------------------------------
  // Module registration — fans out to all parts
  // ------------------------------------------------------------------
  G.registerModule({
    name: "ui_hud",
    order: 75,
    init() {
      const uiRoot = document.getElementById("ui-root") || document.body;
      H.uiRoot = uiRoot;
      H.root = H.el("div", "hud-layer passthrough", uiRoot);
      H.root.id = "hud-layer";
      H.applyColors();
      for (const p of H.parts) {
        if (!p.init) continue;
        try {
          p.init();
        } catch (e) {
          G.reportError("init:ui_hud/" + p.name, e);
        }
      }
      H.applySettings();
    },
    update(dt, realDt) {
      H.stateAge += realDt;
      // review shots freeze world time, so a world-timed full-screen fade (e.g. the wake-up frost) would
      // cover a menu shot for good: hide such overlays while a menu of ours is captured (?shot= only)
      if (
        G.SHOT &&
        (G.state === "goggles" || G.state === "levelup" || G.state === "title")
      ) {
        for (const el of document.body.children)
          if (
            el.style &&
            el.style.position === "fixed" &&
            el.style.zIndex === "870"
          )
            el.style.display = "none";
      }
      if (G.state === "play") H.stats.playSeconds += realDt;
      for (const p of H.parts) {
        if (!p.update) continue;
        try {
          p.update(dt, realDt);
        } catch (e) {
          G.reportError("update:ui_hud/" + p.name, e);
        }
      }
    },
    lateUpdate(dt, realDt) {
      for (const p of H.parts) {
        if (!p.lateUpdate) continue;
        try {
          p.lateUpdate(dt, realDt);
        } catch (e) {
          G.reportError("late:ui_hud/" + p.name, e);
        }
      }
      H.prevState = G.state;
    },
  });
