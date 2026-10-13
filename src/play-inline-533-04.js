// play-inline-533 04 — station
// Lines 1053-1203 of readable/play-inline-533.pretty.js (statement-aligned).
  C.open = function (station, opts) {
    opts = opts || {};
    station = X.TABS[station] ? station : "workbench";
    if (UI.open && UI.station === station) return true;
    if (G.state !== "play" && G.state !== "crafting" && !opts.force)
      return false;
    // the weapons module's own workbench screen must never be up at the same time
    try {
      if (
        !G.isStub("weapons") &&
        G.weapons.isWorkbenchOpen &&
        G.weapons.isWorkbenchOpen() &&
        G.weapons.closeWorkbench
      )
        G.weapons.closeWorkbench();
    } catch (e) {
      /* ignore */
    }
    build();
    const wasOpen = UI.open;
    UI.open = true;
    UI.station = station;
    UI.bench = opts.bench || null;
    UI.msg = "";
    UI.msgT = 0;
    UI.sel = 0;
    UI.sub = 0;
    UI.qty = 1;
    if (opts.tab !== undefined) {
      const i =
        typeof opts.tab === "number"
          ? opts.tab
          : tabsOf().findIndex((t) => t[0] === opts.tab);
      UI.tab = Math.max(0, i);
    } else if (station === "workbench")
      UI.tab = X.recipes("workbench", "schematics").length ? 0 : 1;
    else UI.tab = 0;
    UI.glyphEl.innerHTML = stationGlyph(station, false);
    if (G.state !== "crafting") G.setState("crafting", { station });
    UI.el.classList.remove("craft-hidden");
    if (!wasOpen)
      X.sfx(X.hasSfx("ui_open") ? "ui_open" : "ui_select", { volume: 0.5 });
    if (station === "campfire") X.sfx("fire_loop", { volume: 0.25 });
    render();
    G.events.emit("craftingOpen", station);
    return true;
  };
  C.close = function () {
    if (!UI.open) return;
    UI.open = false;
    if (UI.el) UI.el.classList.add("craft-hidden");
    try {
      const I = G.input;
      for (const k in I.pressed) I.pressed[k] = false;
    } catch (e) {
      /* ignore */
    }
    if (G.state === "crafting") G.setState("play");
    X.sfx("ui_back", { volume: 0.4 });
    G.events.emit("craftingClose", UI.station);
  };
  /** Hide without touching G.state (reset / state already changed). */
  X.hide = function () {
    if (!UI.open) return;
    UI.open = false;
    if (UI.el) UI.el.classList.add("craft-hidden");
    G.events.emit("craftingClose", UI.station);
  };
  C.isOpen = () => UI.open;
  C.station = () => (UI.open ? UI.station : null);
  X.render = render;

  // ------------------------------------------------------------------
  // Input (only while open)
  // ------------------------------------------------------------------
  G.events.on("keydown", (code, e) => {
    if (!UI.open || G.state !== "crafting") return;
    const k = code || (e && e.key) || "";
    const rep = !!(e && e.repeat);
    let used = true;
    if (k === "Escape" || k === "Tab" || k === "Backspace") {
      if (!rep) C.close();
    } else if (k === "ArrowUp" || k === "KeyW") select(UI.sel - 1);
    else if (k === "ArrowDown" || k === "KeyS") select(UI.sel + 1);
    else if (k === "KeyZ" || k === "Minus" || k === "NumpadSubtract")
      setQty(e && e.shiftKey ? -10 : -1);
    else if (k === "KeyC" || k === "Equal" || k === "NumpadAdd")
      setQty(e && e.shiftKey ? 10 : 1);
    else if (k === "ArrowLeft" || k === "KeyA" || k === "KeyQ") {
      if (!rep) setTab(UI.tab - 1);
    } else if (k === "ArrowRight" || k === "KeyD") {
      if (!rep) setTab(UI.tab + 1);
    } else if (k === "PageDown") {
      if (UI.rows.length) select(Math.min(UI.rows.length - 1, UI.sel + 8));
    } else if (k === "PageUp") {
      if (UI.rows.length) select(Math.max(0, UI.sel - 8));
    } else if (
      k === "Enter" ||
      k === "NumpadEnter" ||
      k === "KeyE" ||
      k === "Space"
    ) {
      if (!rep) act("primary");
    } else if (k === "KeyR") {
      if (!rep && tabKey() !== "repair" && tabKey() !== "modify") act("max");
    } else if (/^Digit[1-9]$/.test(k)) {
      const n = +k.slice(5);
      if (rep) {
        /* ignore */
      } else if (tabKey() === "repair") act("m" + (n - 1));
      else if (tabKey() === "modify") {
        const r = UI.rows[UI.sel];
        if (r && r.mods && n <= r.mods.length) act("s" + (n - 1));
      } else if (n <= tabsOf().length) setTab(n - 1);
    } else used = false;
    if (used) {
      try {
        G.input.consume(k);
      } catch (err) {
        /* ignore */
      }
      if (e && e.preventDefault) e.preventDefault();
    }
  });

  // Every UI screen hides itself when the state leaves it (cheats can jump anywhere).
  G.events.on("state", (s) => {
    if (s === "crafting") {
      if (!UI.open) {
        // someone set the state directly (shot mode / debug): come up on the requested station
        const st = (G.QS && G.QS.get("craftStation")) || "workbench";
        const tb = G.QS && G.QS.get("craftTab");
        C.open(st, { tab: tb || undefined, force: true });
      }
      return;
    }
    X.hide();
  });
  G.events.on("inventoryChanged", () => {
    if (UI.open && performance.now() - UI.lastRender > 30) render();
  });

  /** Per-frame UI upkeep (message fade), called from the module update. */
  X.uiUpdate = function (realDt) {
    if (!UI.open || UI.msgT <= 0) return;
    UI.msgT -= realDt;
    if (UI.msgT <= 0) {
      UI.msg = "";
      if (UI.msgEl) UI.msgEl.textContent = "";
    }
  };
