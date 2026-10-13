// play-inline-620 04 — intro
// Lines 1015-1162 of readable/play-inline-620.pretty.js (statement-aligned).
  X.intro = {
    /** Play the intro; onDone called when finished or skipped. */
    play(onDone, opts) {
      opts = opts || {};
      if (I) stop();
      const root = G.ui.el("div", "ui-screen cg-intro");
      root.innerHTML =
        '<canvas></canvas><canvas></canvas><div class="cg-intro-text"></div><div class="cg-intro-skip">SPACE continue &nbsp;·&nbsp; ESC skip</div>';
      const cvs = Array.from(root.querySelectorAll("canvas"));
      ui = { root, cvs, text: root.querySelector(".cg-intro-text") };
      const fit = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
        cvs.forEach((c) => {
          c.width = Math.round(window.innerWidth * dpr);
          c.height = Math.round(window.innerHeight * dpr);
        });
      };
      fit();
      ui.fit = fit;
      root.addEventListener("click", advance);
      I = {
        i: 0,
        t: 0,
        chars: 0,
        front: 0,
        onDone,
        slide: SLIDES[0],
        text: "",
      };
      X.pushScreen(screen);
      try {
        if (X.live("music") && G.music.setMood) G.music.setMood("title");
      } catch (e) {
        /* ignore */
      }
      show(opts.start || 0);
      if (opts.chars !== undefined) {
        I.chars = opts.chars;
      }
    },
    stop,
    isActive: () => !!I,
    /** Fully covers the screen (painted card) — false during a live world shot, so the world renders. */
    isOpaque: () => !!I && !I.live,
    update(realDt) {
      if (!I) return;
      const s = I.slide,
        len = I.text.length;
      I.t += realDt;
      const cps = s.title ? 9 : 34;
      if (I.t > (s.title ? 0.8 : 0.9) && I.chars < len) {
        I.chars = Math.min(len, I.chars + cps * realDt);
        paintText();
      }
      const cv = ui.cvs[I.front];
      // auto advance after the text has typed out + hold
      const typedAt = (s.title ? 0.8 : 0.9) + len / cps;
      if (I.live) liveCamera(I.t / (typedAt + I.hold + 1.5));
      drawSlide(cv, s, I.t);
      if (I.t > typedAt + I.hold) show(I.i + 1);
    },
    SLIDES,
  };
  function refit() {
    if (ui && ui.fit) {
      ui.fit();
      if (I) drawSlide(ui.cvs[I.front], I.slide, I.t);
    }
  }
  G.events.on("resize", refit); // core re-emits window resizes
  if (X.testMode())
    X._introChars = (n) => {
      if (I) {
        I.chars = Math.min(n, I.text.length);
        paintText();
      }
    };

  // ------------------------------------------------------------------
  // Start the game. There is no character creation: the hero is G.HERO
  // (core/player.js). A short fade to black, then G.newGame puts him in
  // his pod in Cryo Unit C-9.
  // ------------------------------------------------------------------
  let starting = false;
  function startGame() {
    if (starting) return;
    starting = true;
    const H = G.HERO || { name: "Eli Wayte" };
    const opts = {
      name: H.name,
      appearance: H.appearance ? Object.assign({}, H.appearance) : undefined,
    };
    const go = () => {
      starting = false;
      try {
        G.newGame(opts);
      } catch (e) {
        G.reportError("intro:newGame", e);
      }
    };
    if (G.SHOT || G.SMOKE) {
      go();
      return;
    }
    const fade = G.ui.el("div", "", document.body);
    fade.style.cssText =
      "position:fixed;inset:0;background:#000;opacity:0;transition:opacity .7s;z-index:990;pointer-events:none";
    requestAnimationFrame(() => {
      fade.style.opacity = "1";
    });
    setTimeout(() => {
      go();
      setTimeout(() => {
        fade.style.opacity = "0";
        setTimeout(() => fade.remove(), 800);
      }, 250);
    }, 750);
  }
  X.intro.startGame = startGame;
  /** New Game flow: intro (unless skipped) → the hero wakes in his pod. */
  X.intro.begin = function (data) {
    if (X.intro.isActive()) return;
    if (data && data.skipIntro) {
      startGame();
      return;
    }
    X.intro.play(() => {
      if (G.state === "chargen") startGame();
    });
  };
  G.events.on("state", (st) => {
    if (st !== "chargen") starting = false;
  });
  /** Public entry for the title screen's New Game: the pre-game state plays the intro, then the hero wakes. */
  G.intro = {
    start(opts) {
      if (opts && opts.skipIntro) {
        startGame();
        return;
      }
      G.setState("chargen", opts || {});
    },
    isActive: () => X.intro.isActive(),
    skip: () => {
      if (X.intro.isActive()) X.intro.stop();
      startGame();
    },
  };
