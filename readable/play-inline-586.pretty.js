/* src/lair/05_ui.js */
/* =====================================================================
 * NEW RAD CITY — lair / 05_ui.js
 * Two small overlays used by the finale (text only, no voice):
 *   K.cards(list, done)  letterboxed narration cards (the recognition scene,
 *                        the ending beats). Advance on a timer or Space/E/click.
 *   K.clock              the Sun Room clock readout ("09:31"), top-left.
 * Both hide themselves on reset and when the game leaves play/cutscene.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const K = G.lair && G.lair._;
  if (!K) return;

  // ------------------------------------------------------------------
  // Story cards
  // ------------------------------------------------------------------
  const C = { el: null, queue: [], cur: null, t: 0, done: null, typed: 0 };
  K.cardState = C;
  function ensureEl() {
    if (C.el) return C.el;
    const el = document.createElement("div");
    el.className = "lair-cards";
    el.innerHTML =
      '<div class="lair-bar top"></div><div class="lair-bar bot"></div><div class="lair-card"><div class="lair-who"></div><div class="lair-text"></div><div class="lair-hint">SPACE</div></div>';
    document.body.appendChild(el);
    C.el = el;
    C.who = el.querySelector(".lair-who");
    C.text = el.querySelector(".lair-text");
    el.addEventListener("click", () => advance());
    return el;
  }
  function show(card) {
    ensureEl();
    C.cur = card;
    C.t = 0;
    C.typed = 0;
    C.who.textContent = card.who || "";
    C.who.style.display = card.who ? "" : "none";
    C.text.textContent = "";
    C.el.classList.add("on");
    if (card.onShow) K.safe("card.onShow", card.onShow);
  }
  function advance() {
    if (!C.cur) return;
    const full = C.cur.text;
    if (C.typed < full.length) {
      C.typed = full.length;
      C.text.textContent = full;
      return;
    }
    next();
  }
  function next() {
    const c = C.queue.shift();
    if (c) {
      show(c);
      return;
    }
    finish();
  }
  function finish() {
    C.cur = null;
    if (C.el) C.el.classList.remove("on");
    const d = C.done;
    C.done = null;
    if (d) K.safe("cards.done", d);
  }
  /** Show narration cards: items are strings or {text, who?, dur?, onShow?}. done() runs after the last one. */
  K.cards = function (list, done) {
    C.queue = (list || [])
      .filter(Boolean)
      .map((c) => (typeof c === "string" ? { text: c } : c));
    C.done = done || null;
    if (G.SMOKE || G.SHOT || K.fastCards) {
      // headless runs: no waiting
      for (const c of C.queue) if (c.onShow) K.safe("card.onShow", c.onShow);
      C.queue = [];
      C.cur = null;
      const d = C.done;
      C.done = null;
      if (d) K.safe("cards.done", d);
      return;
    }
    next();
  };
  K.cardsActive = () => !!C.cur;
  K.cardsAbort = function () {
    C.queue = [];
    C.cur = null;
    C.done = null;
    if (C.el) C.el.classList.remove("on");
  };

  G.events.on("keydown", (code) => {
    if (!C.cur) return;
    if (code === "Space" || code === "Enter" || code === "KeyE") {
      advance();
      if (G.input && G.input.consume) G.input.consume(code);
    }
  });

  // ------------------------------------------------------------------
  // The Sun Room clock (the information-booth clock hangs on a converter)
  // ------------------------------------------------------------------
  const CK = { el: null, min: 31, on: false };
  K.clock = {
    show(min) {
      if (!CK.el) {
        CK.el = document.createElement("div");
        CK.el.className = "lair-clock";
        CK.el.innerHTML =
          '<span class="lair-clock-l">SUNDAY</span><span class="lair-clock-t">09:31</span>';
        document.body.appendChild(CK.el);
      }
      CK.on = true;
      CK.el.classList.add("on");
      if (min !== undefined) K.clock.set(min);
    },
    hide() {
      CK.on = false;
      if (CK.el) CK.el.classList.remove("on");
    },
    set(min) {
      CK.min = Math.max(0, Math.min(59, Math.round(min)));
      if (CK.el)
        CK.el.querySelector(".lair-clock-t").textContent =
          "09:" + String(CK.min).padStart(2, "0");
      if (K.onClock) K.safe("clock", () => K.onClock(CK.min));
    },
    get: () => CK.min,
    shown: () => CK.on,
  };

  // ------------------------------------------------------------------
  // Housekeeping
  // ------------------------------------------------------------------
  K.onUpdate(function (dt, realDt) {
    if (C.cur) {
      if (
        G.state !== "play" &&
        G.state !== "cutscene" &&
        G.state !== "dialogue"
      ) {
        C.el.style.visibility = "hidden";
        return;
      }
      C.el.style.visibility = "";
      const full = C.cur.text;
      if (C.typed < full.length) {
        C.typed = Math.min(
          full.length,
          C.typed + Math.max(1, Math.round(realDt * 45)),
        );
        C.text.textContent = full.slice(0, Math.floor(C.typed));
      } else {
        C.t += realDt;
        const dur = C.cur.dur || Math.max(3.2, 1.6 + full.length / 22);
        if (C.t >= dur) next();
      }
    }
    if (CK.el)
      CK.el.style.visibility =
        G.state === "play" || G.state === "cutscene" || G.state === "dialogue"
          ? ""
          : "hidden";
  });
  K.onReset(function () {
    K.cardsAbort();
    K.clock.hide();
  });
})();
