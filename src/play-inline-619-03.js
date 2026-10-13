// play-inline-619 03 — opts
// Lines 725-910 of readable/play-inline-619.pretty.js (statement-aligned).
  function begin(id, def, opts, extra) {
    if (S) T.close(true);
    const h = G.util.hashStr(String(id));
    S = Object.assign(
      {
        id,
        def,
        opts,
        mode: "boot",
        stack: [],
        line: "LINE " + (10 + (h % 80)),
        serial: String(40000 + (h % 59999)),
        typed: "",
      },
      extra || {},
    );
    buildUI();
    X.pushScreen(screen);
    if (G.state !== "terminal") G.setState("terminal");
    G.viewmodelVisible = false;
    X.sfx("teletype_on", { volume: 0.7 }); // the teleprinter wakes (the only boot cue)
    G.events.emit("terminalOpened", id);
  }

  const T = {
    register(id, def) {
      if (!id || !def) return;
      defs[id] = def;
      if (!status[id]) status[id] = {};
      try {
        registerLock(id, def);
      } catch (e) {
        G.reportError("terminal:lock:" + id, e);
      }
    },
    has: (id) => !!defs[id],
    get: (id) => defs[id] || null,
    /** Open terminal id. opts: {onClose, skipBoot} */
    open(id, opts) {
      opts = opts || {};
      let def = defs[id];
      if (!def) {
        console.warn(
          '[terminals] unknown terminal "' + id + '" — showing a generic one',
        );
        def = {
          title: "Municipal Records Teleprinter",
          entries: [
            {
              title: "Operator Log",
              text: "LAST ENTRY RECORDED 1967.\n\nCIVIL DEFENSE ALERT RECEIVED. ALL STAFF PROCEED TO THE NEAREST PUBLIC SHELTER.\n\n-- END OF LOG --",
            },
          ],
        };
      }
      const st = (status[id] = status[id] || {});
      const lock = lockSpec(id);
      begin(id, def, opts, { lock });
      const next = () => {
        if (!S) return;
        if (S.lock && !G.locks.isOpen(S.lock.id)) {
          if (
            !S.lock.passcode &&
            !S.lock.code &&
            S.lock.key &&
            X.invCount(S.lock.key) <= 0
          ) {
            showGate(
              "THIS TERMINAL NEEDS " +
                X.itemName(S.lock.key).toUpperCase() +
                ".",
            );
            return;
          }
          showGate();
        } else showMenu();
      };
      if (opts.skipBoot || st.booted) next();
      else {
        st.booted = true;
        bootThen(next);
      }
      return true;
    },
    close(silent) {
      if (!S) return;
      const s = S;
      S = null;
      X.popScreen(screen);
      if (ui) {
        const r = ui.root;
        ui = null;
        if (!silent) r.classList.add("tty-offline");
        r.style.pointerEvents = "none";
        r.style.transition = "opacity .2s ease .15s";
        r.style.opacity = "0";
        setTimeout(() => r.remove(), 400);
      }
      G.viewmodelVisible = true;
      if (!silent) X.sfx("teletype_off", { volume: 0.4 }, "ui_back");
      G.events.emit("terminalClosed", s.id);
      if (s.promptOnly) {
        if (!s.done && s.opts.onCancel) {
          try {
            s.opts.onCancel("cancel");
          } catch (e) {
            G.reportError("terminal:prompt:onCancel", e);
          }
        }
      } else if (s.opts.onClose) {
        try {
          s.opts.onClose(s.id);
        } catch (e) {
          G.reportError("terminal:onClose", e);
        }
      }
      if (!silent) X.returnToPlay("terminal", s.prev);
    },
    isOpen: () => !!S,
    current: () => (S && !S.promptOnly ? S.id : null),
    unlock(id) {
      const s = lockSpec(id);
      if (s) G.locks.unlock(s.id, "script");
    },
    lock(id) {
      const s = lockSpec(id);
      if (s) G.locks.relock(s.id);
    },
    isUnlocked: (id) => {
      const s = lockSpec(id);
      return !s || G.locks.isOpen(s.id);
    },
    /** The G.locks id guarding a terminal (or null). */
    lockId: (id) => lockOf[id] || null,
  };
  G.terminals = T;

  X.terminal = {
    update(realDt) {
      if (S) tickPrinter(realDt);
    },
    /** Teletype passcode prompt for any lock with a passcode (G.locks.open → doors, safes...). */
    prompt(spec, onOk, opts) {
      if (!spec || !spec.passcode) return false;
      const RET = { play: 1, cutscene: 1 };
      const prev = RET[G.state] ? G.state : "play";
      begin("lock:" + spec.id, { title: spec.label }, opts || {}, {
        lock: spec,
        promptOnly: true,
        prev,
        onOk,
      });
      showGate();
      return true;
    },
    learnSources,
    onState(s) {
      if (S && s !== "terminal") T.close(true);
    },
    reset() {
      if (S) T.close(true);
      for (const k in status) status[k] = {};
    },
    save() {
      const o = {};
      for (const k in status) if (status[k].booted) o[k] = { booted: true };
      return o;
    },
    load(d) {
      for (const k in status) status[k] = {};
      if (!d) return;
      for (const k in d) {
        status[k] = { booted: !!d[k].booted };
        if (d[k].unlocked && lockOf[k] && !G.locks.isOpen(lockOf[k]))
          G.locks.unlock(lockOf[k], "load"); // old saves
      }
    },
  };
  // scripted runs only: type a passcode and press RETURN
  if (X.testMode())
    X._termType = (word) => {
      if (S && S.mode === "gate") {
        finishPrint();
        submitPass(word);
      }
    };
