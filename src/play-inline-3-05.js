// play-inline-3 05 — time
// Lines 1309-1647 of readable/play-inline-3.pretty.js (statement-aligned).
  W.addLOD = function (obj, maxDist, center) {
    const e = { obj, max2: maxDist * maxDist, c: center || null };
    W.lods.push(e);
    return e;
  };
  let lodTimer = 0;
  const _lp = new THREE.Vector3();
  function updateLODs(dt) {
    lodTimer -= dt;
    if (lodTimer > 0) return;
    lodTimer = 0.25;
    const cam = G.camera.position;
    for (const e of W.lods) {
      const p = e.c || e.obj.getWorldPosition(_lp);
      const dx = p.x - cam.x,
        dz = p.z - cam.z;
      e.obj.visible = dx * dx + dz * dz < e.max2;
    }
  }

  // ---- Radiation sources ---------------------------------------------
  /** {x,y,z, radius, strength (rads/sec at centre)} — player accumulates rads when inside. */
  W.addRadSource = function (src) {
    W.radSources.push(src);
    return src;
  };
  W.removeRadSource = function (src) {
    const i = W.radSources.indexOf(src);
    if (i >= 0) W.radSources.splice(i, 1);
  };
  W.radiationAt = function (p) {
    let r = 0;
    for (const s of W.radSources) {
      const d = Math.hypot(p.x - s.x, (p.y || 0) - (s.y || 0), p.z - s.z);
      if (d < s.radius) r += s.strength * (1 - d / s.radius);
    }
    return r;
  };

  // ---- Location discovery --------------------------------------------
  G.discovered = new Set();
  let discTimer = 0;
  function updateDiscovery(dt) {
    discTimer -= dt;
    if (discTimer > 0 || !G.LAYOUT) return;
    discTimer = 0.5;
    const p = G.player.pos;
    for (const l of G.LAYOUT.LOCATIONS) {
      if (G.discovered.has(l.id)) continue;
      if (l.sub) continue; // sub-locations share their parent's map marker
      if (Math.hypot(p.x - l.x, p.z - l.z) < Math.max(l.r, 25) + 15)
        G.discover(l.id);
    }
  }
  G.discover = function (id) {
    if (G.discovered.has(id)) return;
    const l = G.LAYOUT.getLocation(id);
    if (!l) return;
    G.discovered.add(id);
    G.events.emit("locationDiscovered", l);
  };

  // ------------------------------------------------------------------
  // Notifications & fades (UI module may style; core provides fallback DOM)
  // ------------------------------------------------------------------
  /** Short on-screen message ("Rally Tonic added."). HUD listens to 'notify'. */
  G.notify = function (text, opts) {
    G.events.emit("notify", text, opts || {});
    if (G.isStub("hud")) console.log("[notify] " + text);
  };
  let fadeEl = null;
  G.fadeTransition = function (midFn, dur) {
    dur = dur || 0.45;
    if (!fadeEl) {
      fadeEl = document.createElement("div");
      fadeEl.style.cssText =
        "position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:900;transition:opacity " +
        dur +
        "s";
      document.body.appendChild(fadeEl);
    }
    fadeEl.style.opacity = "1";
    setTimeout(() => {
      try {
        midFn && midFn();
      } catch (e) {
        G.reportError("fade", e);
      }
      setTimeout(() => {
        fadeEl.style.opacity = "0";
      }, 120);
    }, dur * 1000);
  };

  // ------------------------------------------------------------------
  // Save / load (localStorage)
  // ------------------------------------------------------------------
  const saveRegs = {};
  G.save = {
    /** reg: {save(): json, load(data)} — load is called after 'reset'. */
    register(key, reg) {
      saveRegs[key] = reg;
    },
    /** Save migrations: fn(data) → data (or undefined to keep the mutated object). Run on every load, before any module loads. */
    migrations: [],
    saveGame(slot, label) {
      slot = slot || "quick";
      // Never write a save of a dead player (e.g. F5 during the death fall).
      if (G.player && G.player.alive === false) {
        G.notify("You can't save while dead.");
        return false;
      }
      let place = "";
      try {
        place = G.savePlace ? String(G.savePlace() || "") : "";
      } catch (e) {
        /* ignore */
      }
      const data = {
        version: G.VERSION,
        time: Date.now(),
        label: label || "",
        place,
        modules: {},
      };
      for (const k in saveRegs) {
        try {
          data.modules[k] = saveRegs[k].save();
        } catch (e) {
          G.reportError("save:" + k, e);
        }
      }
      try {
        localStorage.setItem("nrc_save_" + slot, JSON.stringify(data));
      } catch (e) {
        G.reportError("save", e);
        G.notify("Save failed.");
        return false;
      }
      G.events.emit("saved", slot);
      G.notify("Game saved.");
      return true;
    },
    loadGame(slot) {
      slot = slot || "quick";
      let data = null;
      try {
        data = JSON.parse(localStorage.getItem("nrc_save_" + slot));
      } catch (e) {
        data = null;
      }
      if (!data) {
        G.notify("No saved game.");
        return false;
      }
      for (const fn of G.save.migrations) {
        try {
          const r = fn(data);
          if (r && typeof r === "object") data = r;
        } catch (e) {
          G.reportError("save:migrate", e);
        }
      }
      G.events.emit("reset", { loading: true });
      for (const k in saveRegs) {
        if (data.modules[k] !== undefined) {
          try {
            saveRegs[k].load(data.modules[k]);
          } catch (e) {
            G.reportError("load:" + k, e);
          }
        }
      }
      G.events.emit("loaded", data);
      G.setState("play");
      return true;
    },
    listSlots() {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("nrc_save_")) {
          try {
            const d = JSON.parse(localStorage.getItem(k));
            out.push({
              slot: k.slice(9),
              time: d.time,
              label: d.label,
              place: d.place || "",
            });
          } catch (e) {
            /* skip */
          }
        }
      }
      return out.sort((a, b) => b.time - a.time);
    },
    deleteSlot(slot) {
      localStorage.removeItem("nrc_save_" + slot);
    },
    hasAny() {
      return G.save.listSlots().length > 0;
    },
  };
  G.save.register("core", {
    save: () => ({
      discovered: Array.from(G.discovered),
      time: { hour: G.time.hour, day: G.time.day },
      unlocked: W.unlockedDoorKeys(),
    }),
    load: (d) => {
      G.discovered = new Set(d.discovered || []);
      if (d.time) {
        G.time.hour = d.time.hour;
        G.time.day = d.time.day;
      }
      W.restoreDoorLocks(d.unlocked || []);
    },
  });
  // New game / load start from the defined lock state (load then re-applies the saved unlocks).
  G.events.on("reset", () => {
    try {
      W.restoreDoorLocks([]);
    } catch (e) {
      G.reportError("doors", e);
    }
  });

  // ------------------------------------------------------------------
  // New game
  // ------------------------------------------------------------------
  /** opts: {name, special?, tags?, skipIntro?}. UI chargen calls this. */
  G.newGame = function (opts) {
    opts = opts || {};
    G.events.emit("reset", { loading: false });
    G.discovered = new Set();
    G.time.hour = 9.5;
    G.time.day = 1;
    const s = G.LAYOUT.playerStart;
    G.player.teleport(s.x, s.y || 0, s.z, s.yaw || 0);
    G.events.emit("newGame", opts);
    G.setState("play");
  };

  // ------------------------------------------------------------------
  // Main loop
  // ------------------------------------------------------------------
  let last = 0;
  G.stats = { fps: 0, frameMs: 0 };
  let fpsAcc = 0,
    fpsN = 0,
    holdFrames = 0;
  G.redrawHeld = () => {
    holdFrames = 0;
  }; // e.g. after a resize while the goggles are open
  function frame(t) {
    requestAnimationFrame(frame);
    const now = t / 1000;
    let realDt = last ? now - last : 0.016;
    last = now;
    if (realDt > 0.1) realDt = 0.1;
    step(realDt);
  }
  function step(realDt) {
    const t0 = performance.now();
    const running = G.worldRunning();
    const dt = running ? realDt * G.timeScale : 0;
    G.dt = dt;
    G.realDt = realDt;
    G.time.real += realDt;
    G.time.elapsed += dt;
    G.time.frame++;
    // global hotkeys
    if (G.state === "play") {
      if (I.actionPressed("quicksave")) {
        if (G.player && G.player.alive) G.save.saveGame("quick", "Quicksave");
        else I.consumeAction("quicksave");
      }
      if (I.actionPressed("quickload")) G.save.loadGame("quick");
    }
    try {
      if (G.player && G.player.update) G.player.update(dt, realDt);
    } catch (e) {
      G.reportError("player", e);
    }
    for (const m of G._modules)
      if (m.update && !m._dead) {
        try {
          m.update(dt, realDt, G);
        } catch (e) {
          G.reportError("update:" + m.name, e);
        }
      }
    if (G.state === "play") updateFocus();
    else if (W.focus) {
      W.focus = null;
      G.events.emit("focus", null);
    }
    if (running || G.state === "play") {
      updateDiscovery(realDt);
    }
    updateLODs(realDt);
    // E to interact
    if (G.state === "play" && W.focus && I.actionPressed("interact")) {
      I.consumeAction("interact");
      try {
        W.focus.onInteract();
      } catch (e) {
        G.reportError("interact", e);
      }
    }
    for (const m of G._modules)
      if (m.lateUpdate && !m._dead) {
        try {
          m.lateUpdate(dt, realDt, G);
        } catch (e) {
          G.reportError("late:" + m.name, e);
        }
      }
    G.viewCamera.fov = G.viewCamera.fov; // (weapons module may adjust)
    // The world is frozen behind the VIGIL goggles: after a few frames keep the last image instead of
    // redrawing it, so the blurred backdrop is computed once rather than every frame.
    holdFrames = G.state === "goggles" && !G.SHOT ? holdFrames + 1 : 0;
    if (holdFrames < 4) G.render();
    I.endFrame();
    G.stats.frameMs = performance.now() - t0;
    fpsAcc += realDt;
    fpsN++;
    if (fpsAcc > 0.5) {
      G.stats.fps = fpsN / fpsAcc;
      fpsAcc = 0;
      fpsN = 0;
    }
  }
  G._step = step;

  // ------------------------------------------------------------------
  // Boot / loading
  // ------------------------------------------------------------------
