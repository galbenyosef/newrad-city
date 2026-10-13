// play-inline-540 03 — code
// Lines 673-943 of readable/play-inline-540.pretty.js (statement-aligned).
  function play(id, opts) {
    opts = opts || {};
    const impl = AR.games[id],
      def = AR.gameDef(id);
    if (!impl || !def) return false;
    build();
    if (G.state !== "arcade") {
      const ok = G.state === "play" || opts.force;
      if (!ok || (G.player && G.player.alive === false && !opts.force))
        return false;
    }
    UI.cabinet = opts.cabinet || null;
    let S = UI.session;
    if (!S || S.id !== id) {
      S = UI.session = {
        id,
        impl,
        def,
        phase: "boot",
        t: 0,
        bootT: 0,
        inst: null,
        demoH: null,
        rank: -1,
        overT: 0,
        champT: 0,
        recordT: 0,
      };
      AR.audio.coin();
    } else if (S.phase === "over") {
      S.phase = "title";
      S.inst = null;
    }
    UI.mode = "cabinet";
    if (G.state !== "arcade") G.setState("arcade");
    else render();
    requestAnimationFrame(layout);
    return true;
  }
  UI.play = play;

  /** Start a real run (opts.demo: attract-mode AI drives it — screenshots / tests). */
  function startRun(opts) {
    const S = UI.session;
    if (!S) return;
    try {
      S.inst = S.impl.create(makeApi(S.id, !!(opts && opts.demo)));
    } catch (e) {
      G.reportError("arcade:create:" + S.id, e);
      S.inst = null;
      return;
    }
    S.phase = "play";
    S.t = 0;
    S.rank = -1;
    S.overT = 0;
    S.champT = 0;
    S.champDone = false;
    S.recordT = 0;
    AR.audio.start();
  }
  UI.startRun = startRun;
  function finishRun() {
    const S = UI.session;
    S.phase = "over";
    S.overT = 0;
    const hadRecord = AR.STATE.records.has(S.id);
    S.rank = AR.recordScore(S.id, S.inst.score);
    S.newRecord = !hadRecord && AR.STATE.records.has(S.id);
    if (S.newRecord) AR.audio.houseRecord();
    else if (S.inst.won) AR.audio.victory();
    else if (S.rank === 0) AR.audio.highScore();
    else AR.audio.gameOver();
  }
  function quitRun() {
    const S = UI.session;
    if (S && S.inst && S.inst.score > 0) AR.recordScore(S.id, S.inst.score);
    if (S) {
      S.phase = "title";
      S.inst = null;
    }
    AR.audio.uiBack();
  }
  /** Leave the cabinet (title / game over: the session ends; mid-run it stays paused for this game). */
  function stepAway() {
    const S = UI.session;
    if (S && (S.phase === "title" || S.phase === "over" || S.phase === "boot"))
      UI.session = null;
    close();
  }
  UI.stepAway = stepAway;

  // ------------------------------------------------------------------
  // Input
  // ------------------------------------------------------------------
  function onKey(code, e) {
    if (G.state !== "arcade" || !UI.visible) return;
    const rep = !!(e && e.repeat);
    G.input.consume(code);
    if (UI.mode === "cabinet" && UI.session) {
      if (code === "Tab" && !rep) {
        pauseSession();
        close();
        return;
      }
      gameKey(code, rep);
      return;
    }
    if (code === "Tab" || code === AR.KEY) {
      if (!rep) close();
      return;
    }
    ledgerKey(code, rep);
  }
  G.events.on("keydown", onKey);

  function ledgerKey(code, rep) {
    if (BACK[code]) {
      if (!rep) close();
      return;
    }
    const ti = TABS.findIndex((t) => t.id === UI.tab);
    if (code === "KeyQ" || code === "KeyA" || code === "ArrowLeft") {
      setTab(TABS[(ti + TABS.length - 1) % TABS.length].id);
      return;
    }
    if (code === "KeyE" || code === "KeyD" || code === "ArrowRight") {
      setTab(TABS[(ti + 1) % TABS.length].id);
      return;
    }
    if (code === "Digit1" || code === "Digit2" || code === "Digit3") {
      setTab(TABS[+code.slice(5) - 1].id);
      return;
    }
    const n =
      UI.tab === "minis"
        ? AR.MINIS.length
        : UI.tab === "arcade"
          ? AR.GAME_DEFS.length
          : UI.tab === "keys"
            ? AR.KEYS.length
            : 0;
    if (n && (code === "KeyW" || code === "ArrowUp")) {
      UI.sel[UI.tab] = (UI.sel[UI.tab] + n - 1) % n;
      render();
      return;
    }
    if (n && (code === "KeyS" || code === "ArrowDown")) {
      UI.sel[UI.tab] = (UI.sel[UI.tab] + 1) % n;
      render();
    }
  }

  function gameKey(code, rep) {
    const S = UI.session;
    if (S.phase === "boot" || S.phase === "title") {
      // power-on / title: START begins a run, ESC steps away
      if (CONFIRM[code] && !rep) startRun();
      else if (BACK[code] && !rep) stepAway();
      return;
    }
    if (S.phase === "play") {
      if (code === "Escape" && !rep) {
        S.phase = "paused";
        AR.audio.uiBack();
        return;
      }
      if (S.inst && S.inst.key) {
        try {
          S.inst.key(code, rep);
        } catch (e) {
          G.reportError("arcade:key:" + S.id, e);
        }
      }
      return;
    }
    if (S.phase === "paused") {
      if (CONFIRM[code] && !rep) {
        S.phase = "play";
        AR.audio.uiSelect();
      } else if (BACK[code] && !rep) quitRun();
      return;
    }
    if (S.phase === "over") {
      if (CONFIRM[code] && !rep && S.overT > 0.8) startRun();
      else if (BACK[code] && !rep) {
        S.phase = "title";
        S.inst = null;
        AR.audio.uiBack();
      }
    }
  }

  // ------------------------------------------------------------------
  // Per-frame
  // ------------------------------------------------------------------
  UI.update = function (dt) {
    if (!UI.visible) return;
    UI.t += dt;
    dt = Math.min(dt, 0.05);
    if (UI.mode === "cabinet" && UI.session) updateGame(dt);
    else updateLedger(dt);
  };

  function tickDemo(holder, id, dt) {
    const impl = AR.games[id];
    if (!impl) return null;
    if (!holder.inst || (holder.inst.over && holder.t > 2.5)) {
      try {
        holder.inst = impl.create(makeApi(id, true));
      } catch (e) {
        G.reportError("arcade:demo:" + id, e);
        return null;
      }
      holder.t = 0;
    }
    if (holder.inst.over) holder.t += dt;
    else {
      try {
        holder.inst.update(dt);
      } catch (e) {
        G.reportError("arcade:demoUpdate:" + id, e);
        holder.inst.over = true;
      }
    }
    return holder.inst;
  }

  AR.tickDemo = tickDemo;

  // Attract mode for the 3D cabinets' monitors (40_world.js): own scratch canvas, no bloom.
  let attractScratch = null,
    attractCtx = null;
  /** Advance a demo held in `holder` and paint it (with a title band) into ctx (w×h). */
  AR.renderAttract = function (holder, id, dt, ctx, w, h) {
    if (!attractScratch) {
      attractScratch = document.createElement("canvas");
      attractScratch.width = W;
      attractScratch.height = H;
      attractCtx = attractScratch.getContext("2d");
    }
    const inst = tickDemo(holder, id, Math.min(dt, 0.1));
    const c = attractCtx,
      pal = AR.palette(id),
      def = AR.gameDef(id);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
    c.fillStyle = pal.bg;
    c.fillRect(0, 0, W, H);
    if (inst) {
      try {
        inst.draw(c, (holder.clock = (holder.clock || 0) + dt));
      } catch (e) {
        G.reportError("arcade:attractDraw:" + id, e);
      }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalAlpha = 1;
    if (def && ((holder.clock * 0.5) | 0) % 2 === 0) {
      c.fillStyle = "rgba(0,0,0,0.55)";
      c.fillRect(0, H - 70, W, 50);
      c.font = FONTS.l;
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.fillStyle = pal.yellow;
      c.fillText("PRESS START  ·  FREE PLAY", W / 2, H - 45);
    }
    ctx.drawImage(attractScratch, 0, 0, w, h);
  };

