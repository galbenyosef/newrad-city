// play-inline-608 05 — scr
// Lines 1389-1604 of readable/play-inline-608.pretty.js (statement-aligned).
  function wireAutosave() {
    const on = G.events.on;
    const now = () => performance.now() / 1000;
    const isMain = (q) => {
      if (!q) return false;
      if (q.main) return true;
      const id = typeof q === "string" ? q : q.id;
      const d =
        typeof q === "string" ? H.call("quests", "get", [q], null) : null;
      return !!(d && d.main) || /^mq\d/.test(String(id || ""));
    };
    on("doorTransition", () => {
      if (now() - AS.lastDoor < 90) return;
      AS.lastDoor = now();
      requestAutosave("door", 1.0);
    });
    on("questStarted", (q) => {
      if (isMain(q)) requestAutosave("mainQuestStarted", 1.5);
    });
    on("questCompleted", (q) => {
      if (isMain(q)) requestAutosave("mainQuestCompleted", 1.5);
    });
    on("locationDiscovered", () => {
      if (G.state === "title" || G.state === "loading" || G.state === "chargen")
        return;
      if (now() - AS.lastDisc < 180) return;
      AS.lastDisc = now();
      requestAutosave("discovered", 2.0);
    });
    on("fastTravel", () => requestAutosave("fastTravel", 1.6));
    on("reset", () => {
      AS.pending = null;
      AS.playT = 0;
    });
    on("newGame", () => {
      AS.pending = null;
      AS.playT = 0;
      AS.lastDisc = now();
      AS.lastAt = now();
    });
    on("loaded", () => {
      AS.pending = null;
      AS.playT = 0;
      AS.lastDisc = now();
      AS.lastAt = now();
    });
  }
  function updateAutosave(realDt) {
    if (G.SMOKE || G.SHOT) return;
    const inPlay = G.state === "play" && G.player && G.player.alive;
    if (inPlay) {
      AS.playT += realDt;
      if (AS.playT >= AUTO_PERIOD && !AS.pending) requestAutosave("timer", 0.5);
    }
    const p = AS.pending;
    if (!p) return;
    if (!inPlay) {
      p.settle = 0;
      return;
    }
    p.settle = (p.settle || 0) + realDt;
    if (p.settle < p.delay || H.stateAge < p.delay) return;
    if (!autosaveAllowed()) return;
    if (performance.now() / 1000 - AS.lastAt < AUTO_MIN_GAP) {
      if (p.reason === "timer") AS.pending = null;
      return;
    }
    doAutosave();
  }

  // ------------------------------------------------------------------
  // Keyboard routing
  // ------------------------------------------------------------------
  function onKey(code, e) {
    const I = G.input;
    let host = null;
    if (G.state === "title" && SCR.title.el.style.display !== "none") {
      if (SCR.title.waiting) {
        titleProceed();
        I.consume(code);
        return;
      }
      host = SCR.title.host;
    } else if (G.state === "paused" && SCR.pause.el.style.display !== "none") {
      if (code === "Escape" && SCR.pause.host.stack.length === 1) {
        if (H.stateAge < 0.35) {
          I.consume(code);
          return;
        } // ignore the key that opened the menu
        resume();
        I.consume(code);
        return;
      }
      host = SCR.pause.host;
    } else if (G.state === "dead" && SCR.dead.el.style.display !== "none")
      host = SCR.dead.host;
    if (host && host.onKey(code, e)) I.consume(code);
  }

  // ------------------------------------------------------------------
  // Part
  // ------------------------------------------------------------------
  H.part({
    name: "menus",
    order: 50,
    init() {
      buildScreens();
      G.events.on("keydown", onKey);
      G.events.on("state", (s, prev, data) => {
        const waiting =
          s === "paused" &&
          ((data && data.wait) || (H.waitOpen && H.waitOpen()));
        if (s === "title") {
          showTitle();
          setTimeout(killCoreFallback, 0);
        } else if (prev === "title") {
          TC.stop();
          if (s !== "paused") hideAllScreens();
        }
        if (s === "paused" && !waiting) showPause();
        else if (prev === "paused" && SCR.pause.el.style.display !== "none")
          hideAllScreens();
        if (prev === "dead" && s !== "dead") hideAllScreens();
      });
      G.events.on("initDone", () => {
        H.hideLoading();
      });
      G.events.on("loaded", () => {
        H.hideLoading();
        hideAllScreens();
        TC.stop();
      });
      G.events.on("newGame", () => {
        hideAllScreens();
        TC.stop();
      });
      wireAutosave();
      if (G.state === "title") showTitle();
    },
    update(dt, realDt) {
      const s = G.state;
      if (s === "play" && H.prevState === "play") {
        if (G.input.actionPressed("pause")) {
          G.input.consumeAction("pause");
          G.setState("paused");
        }
      }
      updateAutosave(realDt);
      if (s === "title" && SCR.title.el.style.display === "none") showTitle();
      if (
        s === "dead" &&
        SCR.dead.el.style.display === "none" &&
        (H.stateAge > 0.9 || G.SHOT)
      )
        showDeath();
      if (
        s === "paused" &&
        SCR.pause.el.style.display === "none" &&
        !(H.waitOpen && H.waitOpen())
      )
        showPause();
      if (loadingShown) {
        tipT += realDt;
        if (tipT > 7) {
          tipT = 0;
          SCR.loading.tip.textContent = H.randomTip();
        }
      }
    },
    lateUpdate(dt, realDt) {
      if (G.state === "title") TC.update(realDt);
    },
  });

  // The loading screen hooks up before init (core emits loadingProgress during boot)
  let firstProgress = true;
  G.events.on("loadingProgress", (text, frac) => {
    if (!SCR.loading) {
      try {
        SCR.loading = buildLoading();
        SCR.loading.early = true;
      } catch (e) {
        return;
      }
    }
    if (firstProgress) {
      firstProgress = false;
      const c = document.getElementById("core-loading");
      if (c) c.style.visibility = "hidden";
    }
    H.showLoading(text, frac);
  });
  // buildScreens() must reuse the early loading screen if it exists
  const _build = buildScreens;
  buildScreens = function () {
    // eslint-disable-line no-func-assign
    const early = SCR.loading;
    _build();
    if (early && early.early) {
      SCR.loading.el.remove();
      SCR.loading = early;
    }
  };

  Object.assign(G.hud, {
    showTitle,
    showPause,
    showDeath,
    showLoading: (t, f) => H.showLoading(t, f),
    hideLoading: () => H.hideLoading(),
    openSettings() {
      if (G.state === "paused") settingsPanel(SCR.pause.host);
      else if (G.state === "title") settingsPanel(SCR.title.host);
    },
    tips: () => TIPS.slice(),
  });
