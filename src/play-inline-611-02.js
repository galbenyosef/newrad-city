// play-inline-611 02 — code
// Lines 363-453 of readable/play-inline-611.pretty.js (statement-aligned).
  function cleanup() {
    const was = E.on;
    E.on = false;
    E.done = false;
    E.typing = null;
    if (E.el) E.el.style.display = "none";
    if (E.host) E.host.clear();
    if (was) G.timeScale = E.prevTimeScale || 1;
    if (G.timeScale === 0) G.timeScale = 1;
    H.hudForcedHidden = false;
  }
  E.cleanup = cleanup;
  function finish(toTitle) {
    cleanup();
    if (toTitle && H.quitToTitle) H.quitToTitle();
    else G.setState("play");
  }
  /** State guard: the slideshow owns the 'cutscene' state while it runs. */
  function onState(s) {
    if (!E.on) return;
    if (s === "cutscene" || s === "cheats") return; // ours / dev menu overlay (returns to 'play')
    if (s === "play") {
      // Something bounced us to play mid-slideshow.  Never re-enter the state
      // machine from inside its own 'state' event (listener re-entrancy /
      // ping-pong): defer the correction, and give up after a few bounces —
      // the overlay keeps covering the screen and G.timeScale stays 0 anyway.
      E.bounces = (E.bounces || 0) + 1;
      if (E.bounces <= 3 && !E.fixPending) {
        E.fixPending = true;
        setTimeout(() => {
          E.fixPending = false;
          if (E.on && G.state === "play") G.setState("cutscene");
        }, 0);
      }
      G.timeScale = 0;
      return;
    }
    cleanup(); // title / dead / loading / anything else: bail out cleanly
  }

  function onKey(code) {
    if (!E.on) return;
    if (E.done) {
      if (E.host.onKey(code)) G.input.consume(code);
      return;
    }
    if (
      code === "Space" ||
      code === "Enter" ||
      code === "KeyE" ||
      code === "ArrowRight" ||
      code === "KeyD"
    )
      next();
    else if (code === "Escape") {
      E.typing = null;
      E.i = E.slides.length;
      finale();
    }
    G.input.consume(code);
  }

  H.part({
    name: "ending",
    order: 70,
    init() {
      build();
      G.events.on("ending", (slides) => start(slides));
      G.events.on("keydown", onKey);
      G.events.on("reset", () => {
        if (E.on) cleanup();
      });
      G.events.on("state", onState);
    },
    update(dt, realDt) {
      if (!E.on || E.done) return;
      const t = E.typing;
      if (t && t.i < t.text.length) {
        t.i = Math.min(
          t.text.length,
          t.i + Math.max(1, Math.round(realDt * 38)),
        );
        E.body.textContent = t.text.slice(0, t.i);
      } else if (t) {
        E.body.textContent = t.text;
        E.wait += realDt;
        if (E.wait > 5 + t.text.length / 60 && !G.SHOT) next();
      }
    },
  });
  G.hud.playEnding = (slides) => start(slides);
