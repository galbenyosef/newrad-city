/* src/ui_interact/26_keypad.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 26_keypad.js
 * The VIGIL keypad overlay (state 'keypad'), opened by G.locks.open for a
 * lock with a `code`. Goggle style (REBRAND §3): the world dims behind a
 * blue-grey veil, pale cyan-white vector line art, blocky monospace digits,
 * CLR / ENTER, a wrong-code buzz, and the codes already on file for this
 * lock. Any code can be typed — a lucky guess opens the lock too.
 *
 * Keys: 0-9 type · Backspace delete · Delete / C clear · Enter submit · Tab / Esc leave
 * Sound ids: keypad_open, keypad_key, keypad_clear, keypad_buzz, keypad_accept
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = G._uix;

  const MAXLEN = 6;
  let K = null; // active session {spec, onOk, opts, entry, tries, busy, prev, ui}

  function build() {
    const root = G.ui.el("div", "ui-screen kp-screen");
    root.innerHTML =
      '<div class="kp-veil"></div>' +
      '<div class="kp-panel">' +
      '<i class="kp-corner tl"></i><i class="kp-corner tr"></i><i class="kp-corner bl"></i><i class="kp-corner br"></i>' +
      '<div class="kp-head">[ KEYPAD ]</div>' +
      '<div class="kp-label"></div>' +
      '<div class="kp-sub">VIGIL FIELD ASSIST // ACCESS CODE</div>' +
      '<div class="kp-display"><div class="kp-digits"></div><div class="kp-status">READY</div></div>' +
      '<div class="kp-grid"></div>' +
      '<div class="kp-file"></div>' +
      '<div class="kp-keys ui-keys"><span><b>0-9</b>Type</span><span><b>BKSP</b>Delete</span><span><b>DEL</b>Clear</span><span><b>ENTER</b>Submit</span><span><b>TAB</b>Leave</span></div>' +
      "</div>";
    const grid = root.querySelector(".kp-grid");
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "ENTER"].forEach(
      (k) => {
        const b = G.ui.el(
          "div",
          "kp-btn" + (k.length > 1 ? " fn " + k.toLowerCase() : ""),
          grid,
        );
        b.textContent = k;
        b.dataset.k = k;
        b.onmousedown = (e) => {
          e.preventDefault();
          press(k);
        };
      },
    );
    root.querySelector(".kp-veil").onmousedown = () => {
      if (K && !K.busy) close();
    };
    return {
      root,
      panel: root.querySelector(".kp-panel"),
      label: root.querySelector(".kp-label"),
      digits: root.querySelector(".kp-digits"),
      status: root.querySelector(".kp-status"),
      file: root.querySelector(".kp-file"),
      grid,
    };
  }

  function paint() {
    if (!K) return;
    const u = K.ui;
    u.label.textContent = String(K.spec.label || "Locked").toUpperCase();
    let h = "";
    for (let i = 0; i < MAXLEN; i++) {
      const ch = K.entry[i];
      h +=
        '<span class="kp-cell' +
        (ch ? " on" : "") +
        (i === K.entry.length && !K.busy ? " cur" : "") +
        '">' +
        (ch || "") +
        "</span>";
    }
    u.digits.innerHTML = h;
    // codes on file for THIS lock (the hero never sees other locks' codes here)
    const known = G.locks.isKnown(K.spec.id) && K.spec.code;
    if (known) {
      u.file.innerHTML =
        '<div class="kp-file-h">[ CODE ON FILE ]</div><div class="kp-file-row" title="Type it">' +
        X.esc(String(K.spec.label || "").toUpperCase()) +
        '<span class="kp-dots"></span><b>' +
        X.esc(K.spec.code) +
        "</b></div>";
      const row = u.file.querySelector(".kp-file-row");
      row.onmousedown = (e) => {
        e.preventDefault();
        if (K && !K.busy) {
          K.entry = "";
          for (const d of K.spec.code) press(d, true);
          paint();
        }
      };
    } else
      u.file.innerHTML = '<div class="kp-file-h dim">[ NO CODE ON FILE ]</div>';
  }
  function setStatus(t, cls) {
    if (!K) return;
    K.ui.status.textContent = t;
    K.ui.status.className = "kp-status" + (cls ? " " + cls : "");
  }
  function flashBtn(k) {
    if (!K) return;
    const b = K.ui.grid.querySelector('[data-k="' + k + '"]');
    if (!b) return;
    b.classList.remove("hit");
    void b.offsetWidth;
    b.classList.add("hit");
  }

  function press(k, quiet) {
    if (!K || K.busy) return;
    flashBtn(k);
    if (k === "CLR") {
      K.entry = "";
      setStatus("READY");
      X.sfx("keypad_clear", { volume: 0.5 }, "ui_back");
      paint();
      return;
    }
    if (k === "ENTER") {
      submit();
      return;
    }
    if (k === "DEL") {
      K.entry = K.entry.slice(0, -1);
      X.sfx("keypad_key", { volume: 0.35, pitch: 0.85 }, "ui_click");
      paint();
      return;
    }
    if (!/^\d$/.test(k) || K.entry.length >= MAXLEN) {
      if (!quiet) X.sfx("keypad_key", { volume: 0.25, pitch: 0.7 }, "ui_click");
      return;
    }
    K.entry += k;
    if (K.ui.status.classList.contains("bad")) setStatus("READY");
    if (!quiet)
      X.sfx(
        "keypad_key",
        { volume: 0.45, pitch: 0.94 + Number(k) * 0.012 },
        "ui_click",
      );
    paint();
  }

  function submit() {
    if (!K || K.busy) return;
    if (!K.entry.length) {
      X.sfx("keypad_buzz", { volume: 0.4 }, "ui_error");
      return;
    }
    K.busy = true;
    if (K.entry === K.spec.code) {
      setStatus("ACCEPTED", "ok");
      K.ui.panel.classList.add("kp-ok");
      X.sfx("keypad_accept", { volume: 0.75 }, "terminal_success");
      paint();
      const s = K;
      setTimeout(
        () => {
          if (K === s) finish(true);
        },
        G.SMOKE || G.SHOT ? 0 : 520,
      );
    } else {
      K.tries++;
      setStatus("DENIED", "bad");
      K.ui.panel.classList.remove("kp-shake");
      void K.ui.panel.offsetWidth;
      K.ui.panel.classList.add("kp-shake");
      X.sfx("keypad_buzz", { volume: 0.8 }, "ui_error");
      G.events.emit("codeRejected", K.spec.id, K.entry);
      const s = K;
      setTimeout(
        () => {
          if (K !== s) return;
          K.busy = false;
          K.entry = "";
          paint();
        },
        G.SMOKE || G.SHOT ? 0 : 650,
      );
    }
  }

  function finish(ok) {
    if (!K) return;
    const s = K;
    K = null;
    X.popScreen(screen);
    teardown(s.ui);
    G.viewmodelVisible = true;
    G.events.emit("keypadClosed", s.spec.id, ok);
    if (ok) {
      try {
        s.onOk();
      } catch (e) {
        G.reportError("keypad:onOk", e);
      }
    } else if (s.opts.onCancel) {
      try {
        s.opts.onCancel("cancel");
      } catch (e) {
        G.reportError("keypad:onCancel", e);
      }
    }
    X.returnToPlay("keypad", s.prev);
  }
  function teardown(u) {
    if (!u) return;
    const r = u.root;
    r.classList.remove("on");
    r.style.pointerEvents = "none";
    setTimeout(() => r.remove(), 220);
  }
  function close(silent) {
    if (!K) return;
    if (silent) {
      const s = K;
      K = null;
      X.popScreen(screen);
      if (s.ui) s.ui.root.remove();
      G.viewmodelVisible = true;
      return;
    }
    X.sfx("ui_back", { volume: 0.4 });
    finish(false);
  }

  const screen = {
    id: "keypad",
    onKey(code) {
      if (!K) return false;
      const d = X.K.digit(code);
      if (d >= 0) press(String(d));
      else if (
        code === "Enter" ||
        code === "NumpadEnter" ||
        code === "KeyE" ||
        code === "Space"
      )
        press("ENTER");
      else if (code === "Backspace") press("DEL");
      else if (code === "Delete" || code === "KeyC" || code === "NumpadDecimal")
        press("CLR");
      else if (code === "Tab" || code === "Escape") {
        if (!K.busy) close();
      }
      return true;
    },
  };
  const RETURNABLE = { play: 1, cutscene: 1 };

  X.keypad = {
    /** Open the keypad for a lock spec with a code. onOk() runs after the right code is entered. */
    open(spec, onOk, opts) {
      if (!spec || !spec.code) return false;
      if (K) close(true);
      const prev = RETURNABLE[G.state] ? G.state : "play";
      K = {
        spec,
        onOk: onOk || (() => {}),
        opts: opts || {},
        entry: "",
        tries: 0,
        busy: false,
        prev,
        ui: build(),
      };
      paint();
      X.pushScreen(screen);
      if (G.state !== "keypad") G.setState("keypad");
      G.viewmodelVisible = false;
      X.sfx("keypad_open", { volume: 0.5 }, "ui_select");
      requestAnimationFrame(() => {
        if (K) K.ui.root.classList.add("on");
      });
      if (G.SMOKE || G.SHOT) K.ui.root.classList.add("on");
      G.events.emit("keypadOpened", spec.id);
      return true;
    },
    close,
    isOpen: () => !!K,
    current: () => (K ? K.spec.id : null),
    onState(s) {
      if (K && s !== "keypad") close(true);
    },
    reset() {
      close(true);
    },
  };
  // scripted runs only: type + submit a code
  if (X.testMode())
    X._keypadType = (str) => {
      for (const ch of String(str)) press(ch === "\n" ? "ENTER" : ch);
    };
})();
