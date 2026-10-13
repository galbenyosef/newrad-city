// play-inline-601 03 — code
// Lines 721-1037 of readable/play-inline-601.pretty.js (statement-aligned).
  function close(toState) {
    if (!GG.open) return;
    GG.open = false;
    const page = curPage();
    if (page && page.leave) {
      try {
        page.leave(GG);
      } catch (e) {
        /* ignore */
      }
    }
    closeModal();
    H.sfx("goggles_close");
    const o = GG.el.overlay;
    o.classList.remove("opening");
    o.classList.add("closing");
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      if (!GG.open) {
        o.style.display = "none";
        o.classList.remove("closing");
      }
    }, 240);
    if (G.state === "goggles") {
      let back = toState || GG.returnState || "play";
      // only return to a soft screen whose owner UI is still alive
      if (back !== "play" && back !== "paused" && !softScreenAlive(back))
        back = "play";
      if (!G.player.alive) back = "dead";
      G.setState(back);
    }
    GG.returnState = "play";
  }
  GG.close = close;

  // Keyboard inside the goggles (DOM keydown so key-repeat works)
  function onKey(code, e) {
    if (G.state !== "goggles" || !GG.open) return;
    if (code === "Tab" || code === "KeyI" || code === "Escape") return; // handled in update()
    const I = G.input;
    if (GG.modal) {
      if (
        code === "KeyA" ||
        code === "ArrowLeft" ||
        code === "KeyD" ||
        code === "ArrowRight" ||
        code === "KeyW" ||
        code === "KeyS"
      ) {
        GG.modal.sel = GG.modal.sel ? 0 : 1;
        GG.modal.btns.forEach((b) =>
          b.classList.toggle("sel", Number(b.dataset.v) === GG.modal.sel),
        );
        H.sfx("ui_hover", { volume: 0.3 });
      } else if (code === "Enter" || code === "Space" || code === "KeyE")
        GG.modal.pick(GG.modal.sel);
      else if (code === "Backspace") GG.modal.pick(0);
      I.consume(code);
      return;
    }
    const page = curPage();
    if (page && page.onKey) {
      let used = false;
      try {
        used = page.onKey(code, e, GG);
      } catch (err) {
        H.warnOnce("gg.onKey", err);
      }
      if (used) {
        I.consume(code);
        return;
      }
    }
    const L = GG.activeList;
    const dm = /^Digit([1-6])$/.exec(code);
    switch (true) {
      case code === "KeyQ":
        cycleTab(-1);
        break;
      case code === "KeyE":
        cycleTab(1);
        break;
      case !!dm && !(page && page.digits):
        setTab(TABS[Number(dm[1]) - 1].id);
        break;
      case code === "KeyA" || code === "ArrowLeft":
        cycleSub(-1);
        break;
      case code === "KeyD" || code === "ArrowRight":
        cycleSub(1);
        break;
      case code === "KeyW" || code === "ArrowUp":
        if (L) L.move(-1);
        break;
      case code === "KeyS" || code === "ArrowDown":
        if (L) L.move(1);
        break;
      case code === "PageUp":
        if (L) L.setSel(L.sel - 8, true);
        break;
      case code === "PageDown":
        if (L) L.setSel(L.sel + 8, true);
        break;
      case code === "Enter" || code === "Space":
        if (L && L.opts.onActivate && L.items.length)
          L.opts.onActivate(L.sel, L.items[L.sel]);
        break;
      default:
        return;
    }
    I.consume(code);
  }

  // ------------------------------------------------------------------
  // Goggle lamp (L): a pale, very wide spot light carried by the camera at
  // brow height and aimed slightly down the view direction.  Created once
  // at init and kept in the scene (intensity 0 when off) so toggling never
  // changes the light count → no shader recompiles.
  // ------------------------------------------------------------------
  const LAMP = { on: false, obj: null, target: 0, cur: 0 };
  const LAMP_I = { outside: 34, inside: 22 }; // candela (physically-based lights, r158)
  function buildLamp() {
    if (!THREE || !G.camera) return;
    const l = new THREE.SpotLight(0xdcefff, 0, 34, 0.95, 0.8, 1.35);
    l.position.set(0, 0.06, 0.12);
    l.castShadow = false;
    l.name = "goggle_lamp";
    const tgt = new THREE.Object3D();
    tgt.position.set(0, -1.4, -10);
    tgt.name = "goggle_lamp_target";
    G.camera.add(tgt);
    l.target = tgt;
    G.camera.add(l);
    LAMP.obj = l;
  }
  function setLamp(on, silent) {
    LAMP.on = !!on;
    LAMP.target = LAMP.on ? 1 : 0;
    G.player.lightOn = LAMP.on;
    if (!silent)
      H.sfx("goggle_lamp", { volume: 0.8, pitch: LAMP.on ? 1.15 : 0.9 });
    G.events.emit("gogglesLamp", LAMP.on);
  }
  function updateLamp(realDt) {
    if (!LAMP.obj) return;
    LAMP.cur = H.lerp(LAMP.cur, LAMP.target, 1 - Math.exp(-12 * realDt));
    const flick = LAMP.on
      ? 0.98 +
        Math.sin(G.time.real * 31) * 0.01 +
        Math.sin(G.time.real * 11.3) * 0.01
      : 1;
    const inside = G.LAYOUT && G.LAYOUT.isInterior(G.player.pos.x);
    LAMP.obj.intensity =
      LAMP.cur * (inside ? LAMP_I.inside : LAMP_I.outside) * flick;
    LAMP.obj.visible = true;
  }

  // ------------------------------------------------------------------
  // Part
  // ------------------------------------------------------------------
  const pressed = (a) => {
    const I = G.input;
    if (I.actionPressed(a)) {
      I.consumeAction(a);
      return true;
    }
    return false;
  };
  H.part({
    name: "goggles",
    order: 30,
    init() {
      build();
      buildLamp();
      G.events.on("keydown", onKey);
      G.events.on("state", (s, prev) => {
        if (s !== "goggles" && GG.open) close(s);
        // another module switched straight to 'goggles': remember where to return
        if (s === "goggles" && !GG.open)
          GG.returnState =
            prev === "play" || OPEN_FROM_SOFT[prev] ? prev : "play";
      });
      const refresh = () => {
        if (GG.open) GG.dirty = true;
      };
      [
        "inventoryChanged",
        "equipChanged",
        "questUpdated",
        "questStarted",
        "questCompleted",
        "questFailed",
        "effectsChanged",
        "radioChanged",
        "talentTaken",
        "attributeChanged",
        "standingChanged",
        "levelUp",
        "questTracked",
        "codeLearned",
        "lockOpened",
      ].forEach((ev) => G.events.on(ev, refresh));
      G.events.on("reset", () => {
        setLamp(false, true);
        GG.sel = {};
      });
    },
    update(dt, realDt) {
      const I = G.input;
      const s = G.state;
      if (s === "play" && H.prevState === "play" && G.player.alive) {
        if (pressed("goggles")) open();
        else if (pressed("map")) open("map", "city");
        else if (pressed("journal")) open("quests");
        else if (pressed("light")) setLamp(!LAMP.on);
      } else if (s === "goggles" && H.prevState === "goggles") {
        if (pressed("goggles") || I.justPressed("Escape")) {
          I.consume("Escape");
          if (GG.modal) GG.modal.pick(0);
          else close();
        }
      }
      // entered 'goggles' via setState (e.g. screenshot harness: ?state=goggles[&ggTab=quests&ggSub=main])
      if (G.state === "goggles" && !GG.open)
        open(
          G.SHOT && G.QS ? G.QS.get("ggTab") || undefined : undefined,
          G.SHOT && G.QS ? G.QS.get("ggSub") || undefined : undefined,
          true,
        );
      if (G.SHOT && G.QS && G.QS.get("lamp") && !LAMP.on && G.state === "play")
        setLamp(true, true);
      if (GG.open) {
        if (GG.dirty) render();
        // review hook (screenshots only): &ggKey=KeyF presses one key inside the goggles once it is up
        if (
          G.SHOT &&
          G.QS &&
          G.QS.get("ggKey") &&
          !GG._shotKey &&
          (GG._shotKeyT = (GG._shotKeyT || 0) + realDt) > 0.5
        ) {
          GG._shotKey = true;
          onKey(G.QS.get("ggKey"), {});
        }
        const page = curPage();
        if (page && page.update) {
          try {
            page.update(realDt, GG);
          } catch (e) {
            H.warnOnce("gg.page.update", e);
          }
        }
        GG.hdrT = (GG.hdrT || 0) - realDt;
        if (GG.hdrT <= 0) {
          GG.hdrT = 0.5;
          renderHeader();
        }
        drawGlobe(realDt);
      }
      updateLamp(realDt);
    },
  });

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  G.goggles = {
    /** open(tab?, sub?, opts?) — tab: status|inventory|quests|map|notes|radio. opts.force lets dialogue/barter/container/terminal/keypad/paused raise it. */
    open(tab, sub, opts) {
      if (GG.open && G.state === "goggles") {
        const r = resolve(tab, sub);
        if (r[0]) setTab(r[0], r[1]);
        return true;
      }
      return open(tab, sub, !!(opts && opts.force));
    },
    close() {
      close();
    },
    toggle(opts) {
      if (GG.open) {
        close();
        return false;
      }
      return open(undefined, undefined, !!(opts && opts.force));
    },
    /** state the goggles return to when closed */
    returnState() {
      return GG.returnState;
    },
    isOpen() {
      return GG.open;
    },
    refresh() {
      GG.dirty = true;
    },
    toggleLamp() {
      setLamp(!LAMP.on);
      return LAMP.on;
    },
    setLamp(on, silent) {
      setLamp(on, silent);
    },
    lampOn() {
      return LAMP.on;
    },
    lamp() {
      return LAMP.obj;
    },
    tabs() {
      return TABS.map((t) => ({
        id: t.id,
        label: t.label,
        subs: t.subs.map((s) => s[0]),
      }));
    },
  };
