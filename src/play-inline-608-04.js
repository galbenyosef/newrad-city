// play-inline-608 04 — loading
// Lines 1058-1388 of readable/play-inline-608.pretty.js (statement-aligned).
  TC.start = function () {
    TC.on = true;
    TC.t = 0;
    TC.i = 0;
    if (G.SHOT) {
      // review hook: ?state=title&titleShot=i&titleT=seconds
      TC.i = H.clamp(
        Number((G.QS && G.QS.get("titleShot")) || 3) | 0,
        0,
        SHOTS.length - 1,
      );
      TC.t = H.clamp(
        Number((G.QS && G.QS.get("titleT")) || 0),
        0,
        SHOTS[TC.i].dur - 2.5,
      );
    }
    if (G.player) G.player.camOverride = true;
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.setHour)
        G.atmos.setHour(17.6);
      else if (G.time) G.time.hour = 17.6;
    } catch (e) {
      /* ignore */
    }
    if (!TC.fade) {
      TC.fade = H.el("div", "menu-title-fade", SCR.title.el);
    }
  };
  TC.stop = function () {
    TC.on = false;
    if (G.player) G.player.camOverride = false;
    if (G.camera) {
      G.camera.fov = G.player.fovCurrent || 72;
      G.camera.updateProjectionMatrix();
    }
  };
  const _a = THREE ? new THREE.Vector3() : null,
    _b = THREE ? new THREE.Vector3() : null;
  TC.update = function (realDt) {
    if (!TC.on || !G.camera || !THREE) return;
    TC.t += realDt;
    let s = SHOTS[TC.i];
    if (TC.t > s.dur) {
      TC.t = 0;
      TC.i = (TC.i + 1) % SHOTS.length;
      s = SHOTS[TC.i];
    }
    const u = G.util.smoothstep(0, 1, TC.t / s.dur);
    _a.set(
      H.lerp(s.from[0], s.to[0], u),
      H.lerp(s.from[1], s.to[1], u),
      H.lerp(s.from[2], s.to[2], u),
    );
    _b.set(
      H.lerp(s.look0[0], s.look1[0], u),
      H.lerp(s.look0[1], s.look1[1], u),
      H.lerp(s.look0[2], s.look1[2], u),
    );
    const cam = G.camera;
    cam.position.copy(_a);
    cam.up.set(0, 1, 0);
    cam.lookAt(_b);
    if (Math.abs(cam.fov - 55) > 0.01) {
      cam.fov = 55;
      cam.updateProjectionMatrix();
    }
    G.player.pos.set(_a.x, 0, _a.z); // keep shadow camera, LOD and ambience near the shot
    const edge = Math.min(TC.t, s.dur - TC.t);
    if (TC.fade)
      TC.fade.style.opacity = String(H.clamp(1 - edge / 1.1, 0, 1).toFixed(2));
  };

  // ---------------- PAUSE ----------------
  function showPause() {
    hideAllScreens();
    const P = SCR.pause;
    P.el.style.display = "";
    P.opened = H.stateAge;
    P.host.push({
      title: "Paused",
      cls: "menu-pausemain",
      header:
        '<div class="menu-pause-info">' +
        H.esc(H.up(H.heroName())) +
        " &middot; " +
        H.esc(H.up(H.placeName())) +
        " &middot; " +
        H.gameDate() +
        " " +
        H.gameClock() +
        "</div>",
      items: [
        { label: "Resume", action: resume },
        {
          label: "Save",
          disabled: !G.player.alive,
          action: () => savePanel(P.host),
        },
        { label: "Load", action: () => loadPanel(P.host) },
        { label: "Settings", action: () => settingsPanel(P.host) },
        { label: "Help", action: () => helpPanel(P.host) },
        {
          label: "Quit to main menu",
          action: () =>
            confirmPanel(
              P.host,
              "Quit to the main menu? Unsaved progress will be lost.",
              quitToTitle,
              "Quit",
              "Cancel",
            ),
        },
      ],
      side: () =>
        '<div class="menu-side-gl">' +
        H.glyph("hint") +
        '</div><div class="menu-side-s">' +
        H.esc(H.randomTip()) +
        "</div>",
      onBack: () => {
        resume();
        return true;
      },
    });
  }
  function resume() {
    hideAllScreens();
    G.setState("play");
  }
  /**
   * Quit to the main menu.  Core has no quit API, so the UI emits 'reset'
   * ({loading:false, toTitle:true}) itself.  Every overlay of ours is closed and
   * the time scale restored before the emit.
   */
  function quitToTitle() {
    hideAllScreens();
    try {
      if (H.END && H.END.on && H.END.cleanup) H.END.cleanup();
    } catch (e) {
      /* ignore */
    }
    try {
      if (H.LV && H.LV.open && H.LV.close) {
        H.LV.pending = false;
        H.LV.close();
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (H.WAIT && H.WAIT.open && H.WAIT.hide) H.WAIT.hide();
    } catch (e) {
      /* ignore */
    }
    G.timeScale = 1;
    H.hudForcedHidden = false;
    G.events.emit("reset", { loading: false, toTitle: true });
    G.setState("title");
  }
  H.quitToTitle = quitToTitle;

  // ---------------- DEATH ----------------
  const DEATH_QUOTES = [
    "Twenty-two years asleep, and the city still got the last word.",
    "The Office of Civil Defense regrets that your volunteer contract has been concluded.",
    "Somewhere a giant roach is telling the others about you.",
    'The goggles logged it under "lessons".',
    "Manhattan takes another tenant. Rent was always too high here.",
    "Death is only a setback if you forgot to save.",
    "They will name a crater after you. A small one.",
    "Lady Liberty has seen worse. Not much worse, though.",
  ];
  function showDeath() {
    hideAllScreens();
    const D = SCR.dead;
    D.el.style.display = "";
    D.el.classList.remove("in");
    void D.el.offsetWidth;
    D.el.classList.add("in");
    D.el.querySelector(".menu-death-quote").textContent =
      DEATH_QUOTES[Math.floor(Math.random() * DEATH_QUOTES.length)];
    const last = G.save.listSlots()[0];
    D.host.push({
      cls: "menu-deathmenu",
      items: [
        {
          label: "Load last save",
          disabled: !last,
          action: () => last && doLoad(last.slot),
        },
        {
          label: "Load game",
          disabled: !last,
          action: () => loadPanel(D.host),
        },
        { label: "Main menu", action: quitToTitle },
      ],
      onBack: () => true,
    });
    try {
      if (G.music && G.music.stop) G.music.stop();
    } catch (e) {
      /* stub */
    }
  }

  // ---------------- LOADING ----------------
  let loadingShown = false,
    tipT = 0;
  H.showLoading = function (text, frac, quick) {
    const L = SCR.loading;
    if (!L) return;
    if (!loadingShown) {
      loadingShown = true;
      L.el.classList.add("on");
      L.el.classList.toggle("quick", !!quick);
      L.tip.textContent = H.randomTip();
      tipT = 0;
    }
    if (text !== undefined) {
      L.text.textContent = H.up(loadLabel(text));
      const m = /^Initializing (\S+?)…?$/.exec(String(text));
      if (m) {
        const k = LOAD_STEPS.findIndex((st) => st[1].test(m[1]));
        if (k >= 0) setLoadingStep(L, k);
      }
    }
    if (frac !== undefined) {
      L.bar.style.width = Math.round(H.clamp(frac, 0, 1) * 100) + "%";
      if (frac >= 1 && !quick) setLoadingStep(L, LOAD_STEPS.length - 1, true);
    }
  };
  H.hideLoading = function () {
    if (!SCR.loading) return;
    loadingShown = false;
    SCR.loading.el.classList.remove("on");
  };
  /** Quick-mode loading card ("TRAVELLING TO" / "RETURNING TO" + a place name). */
  H.setLoadingDest = function (head, name) {
    if (!SCR.loading) return;
    SCR.loading.dhead.textContent = H.up(head);
    SCR.loading.dname.textContent = H.up(name || "");
  };
  G.savePlace = () => H.placeName(); // stored with each save so loading it can say where you're going
  H.showTravel = function (name) {
    H.setLoadingDest("TRAVELLING TO", name);
    H.showLoading("Travelling to " + name + "...", 1, true);
    setTimeout(H.hideLoading, 1400);
  };

  // ------------------------------------------------------------------
  // Autosave — rotating slots auto1..auto3 (the oldest is overwritten).
  // Triggers: door transitions (>= 90 s apart), main-quest start/completion,
  // location discovered (>= 3 min apart), fast-travel arrival, closing the Wait
  // dialog, closing the level-up screen, and every 8 min of actual play.
  // A request is only *armed*; the save itself happens once the player is in
  // 'play', alive, out of combat and settled.
  // ------------------------------------------------------------------
  const AUTO_SLOTS = ["auto1", "auto2", "auto3"];
  const AS = {
    pending: null,
    playT: 0,
    lastAt: -1e9,
    lastDisc: -1e9,
    lastDoor: -1e9,
    busy: false,
  };
  const AUTO_PERIOD = 8 * 60;
  const AUTO_MIN_GAP = 30;
  H.isAutoSlot = (slot) => /^auto\d*$/.test(String(slot || ""));
  function nextAutoSlot() {
    const times = {};
    try {
      for (const s of G.save.listSlots()) times[s.slot] = s.time || 0;
    } catch (e) {
      /* ignore */
    }
    let best = AUTO_SLOTS[0],
      bt = Infinity;
    for (const k of AUTO_SLOTS) {
      const t = times[k] === undefined ? -1 : times[k];
      if (t < bt) {
        bt = t;
        best = k;
      }
    }
    return best;
  }
  function autosaveAllowed() {
    return (
      !G.SMOKE &&
      !G.SHOT &&
      G.state === "play" &&
      G.player &&
      G.player.alive &&
      !H.combatActive() &&
      !H.hudForcedHidden &&
      !(H.waitOpen && H.waitOpen())
    );
  }
  function requestAutosave(reason, delay) {
    if (G.SMOKE || G.SHOT) return;
    const d = delay === undefined ? 1.2 : delay;
    if (G.state === "title" || G.state === "loading") return;
    if (AS.pending) {
      AS.pending.delay = Math.max(AS.pending.delay, d);
      AS.pending.reason += "+" + reason;
      return;
    }
    AS.pending = { reason: String(reason || "auto"), delay: d, age: 0 };
  }
  H.requestAutosave = requestAutosave;
  function doAutosave() {
    const slot = nextAutoSlot();
    AS.pending = null;
    AS.lastAt = performance.now() / 1000;
    AS.playT = 0;
    G.notify("Autosaving…", { kind: "autosave" });
    const H2 = H.HUD;
    if (H2) H2.autosaving = true;
    let ok = false;
    try {
      ok = G.save.saveGame(slot, saveLabel());
    } catch (e) {
      ok = false;
    }
    if (H2) H2.autosaving = false;
    if (!ok) G.notify("Autosave failed.", { color: "red" });
    return ok;
  }
