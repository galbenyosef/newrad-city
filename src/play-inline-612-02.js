// play-inline-612 02 — def
// Lines 361-602 of readable/play-inline-612.pretty.js (statement-aligned).
  X.catOf = function (def) {
    const t = (def && def.type) || "misc";
    if (t === "weapon" || t === "apparel" || t === "aid" || t === "ammo")
      return t;
    return "misc";
  };
  const CAT_ORDER = { weapon: 0, apparel: 1, aid: 2, misc: 3, ammo: 4 };
  X.sortEntries = function (arr) {
    return arr.sort(
      (a, b) =>
        CAT_ORDER[X.catOf(a.def)] - CAT_ORDER[X.catOf(b.def)] ||
        String(a.def.name).localeCompare(String(b.def.name)),
    );
  };

  /** Stat cells for the bottom info grid: [[label, valueHTML], ...] */
  X.statCells = function (def, cnd) {
    if (!def) return [];
    const cells = [];
    const w = X.weaponBlock(def);
    if (w) cells.push(["DMG", Math.round((w.damage || 0) * (w.pellets || 1))]);
    if (def.type === "apparel") cells.push(["ARM", def.dr || def.armor || 0]);
    if (def.type === "aid" && def.effects) {
      const e = def.effects;
      if (e.hp) cells.push(["HP", "+" + e.hp]);
      if (e.rads) cells.push(["RAD", (e.rads > 0 ? "+" : "") + e.rads]);
    }
    cells.push(["WT", fmtNum(def.weight || 0)]);
    cells.push(["VAL", Math.round(def.value || 0)]);
    if ((w || def.type === "apparel") && cnd !== undefined && cnd !== null) {
      const c = X.clamp(cnd > 1 ? cnd / 100 : cnd, 0, 1);
      cells.push([
        "CND",
        '<span class="ui-cnd"><i style="width:' +
          Math.round(c * 100) +
          '%"></i></span>',
      ]);
    }
    return cells;
  };
  function fmtNum(n) {
    return Math.abs(n - Math.round(n)) < 0.05
      ? String(Math.round(n))
      : n.toFixed(1);
  }
  X.fmtNum = fmtNum;
  X.esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );

  // ------------------------------------------------------------------
  // Screen stack & key routing. The top-most screen receives keydowns.
  // A handler returning true marks the key consumed (core won't act on it).
  // ------------------------------------------------------------------
  X.screens = [];
  X.pushScreen = function (s) {
    X.popScreen(s);
    X.screens.push(s);
    return s;
  };
  X.popScreen = function (s) {
    const i = X.screens.indexOf(s);
    if (i >= 0) X.screens.splice(i, 1);
  };
  X.topScreen = () => X.screens[X.screens.length - 1] || null;
  X.anyOpen = () => X.screens.length > 0;
  // Some synthetic/remote keyboards (automation, IME, a few virtual keyboards) send an empty
  // KeyboardEvent.code; derive one from .key so every screen still gets 'Digit1', 'KeyE', ...
  const KEYMAP = {
    " ": "Space",
    Enter: "Enter",
    Escape: "Escape",
    Esc: "Escape",
    Tab: "Tab",
    Backspace: "Backspace",
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    Shift: "ShiftLeft",
    Delete: "Delete",
  };
  X.codeOf = function (code, e) {
    if (code || !e || !e.key) return code;
    const k = e.key;
    if (KEYMAP[k]) return KEYMAP[k];
    if (/^[0-9]$/.test(k)) return "Digit" + k;
    if (/^[a-z]$/i.test(k)) return "Key" + k.toUpperCase();
    return code;
  };
  G.events.on("keydown", function (code, e) {
    code = X.codeOf(code, e);
    if (e && e.repeat && !X._allowRepeat(code)) return;
    const s = X.topScreen();
    if (!s || !s.onKey) return;
    let handled = false;
    try {
      handled = s.onKey(code, e) !== false;
    } catch (err) {
      G.reportError("uix:key", err);
    }
    if (handled) {
      try {
        G.input.consume(code);
      } catch (err) {
        /* ignore */
      }
      if (e && e.preventDefault) e.preventDefault();
    }
  });
  const REPEATABLE = new Set([
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "KeyW",
    "KeyS",
    "Backspace",
  ]);
  X._allowRepeat = (code) => REPEATABLE.has(code);

  /** Keys commonly used by screens. */
  X.K = {
    up: (c) => c === "ArrowUp" || c === "KeyW",
    down: (c) => c === "ArrowDown" || c === "KeyS",
    left: (c) => c === "ArrowLeft" || c === "KeyA",
    right: (c) => c === "ArrowRight" || c === "KeyD",
    ok: (c) =>
      c === "Enter" || c === "NumpadEnter" || c === "KeyE" || c === "Space",
    back: (c) => c === "Escape" || c === "Tab" || c === "Backspace",
    digit: (c) => {
      const m = /^(?:Digit|Numpad)([0-9])$/.exec(c);
      return m ? Number(m[1]) : -1;
    },
  };

  /** Consume every currently-down key so a screen closing doesn't leak its keypress into gameplay. */
  X.swallowInput = function () {
    try {
      const I = G.input;
      for (const k in I.pressed) I.pressed[k] = false;
    } catch (e) {
      /* ignore */
    }
  };

  // Return to gameplay safely (only if we are still the ones in charge).
  X.returnToPlay = function (fromState, toState) {
    X.swallowInput();
    if (!fromState || G.state === fromState) G.setState(toState || "play");
  };

  // ------------------------------------------------------------------
  // Pointer-lock recovery. Browsers only grant pointer lock inside a user
  // gesture, so screens that close on a timer (code accepted, passcode accepted,
  // new game, cutscenes) land in 'play' with a free cursor. Instead of the
  // player's first click silently re-locking AND firing their weapon, show a
  // small "click to resume" veil that grabs the lock and eats that click.
  // Any non-Escape key also resumes (keydown counts as a gesture).
  // ------------------------------------------------------------------
  let resumeEl = null,
    resumeTimer = 0;
  function hideResume() {
    clearTimeout(resumeTimer);
    resumeTimer = 0;
    if (resumeEl) {
      resumeEl.remove();
      resumeEl = null;
      window.removeEventListener("keydown", resumeKey, true);
    }
  }
  function grabLock() {
    try {
      G.input.requestLock();
    } catch (e) {
      /* ignore */
    }
  }
  function resumeKey(e) {
    if (e.code !== "Escape" && G.state === "play") grabLock();
  }
  function showResume() {
    if (resumeEl || G.state !== "play" || G.SMOKE || G.SHOT) return;
    if ((G.input && G.input.locked) || document.pointerLockElement) return;
    resumeEl = document.createElement("div");
    // ui_hud already draws a "CLICK TO RESUME" hint in this situation (display only — it doesn't
    // eat the click). When it exists we stay an invisible click-catcher and let the HUD do the talking.
    const hudHint = !!document.querySelector(".hud-lockhint");
    resumeEl.className = "ui-resume" + (hudHint ? " bare" : "");
    resumeEl.innerHTML = hudHint
      ? ""
      : '<div class="ui-resume-box"><b>CLICK</b> TO RESUME</div>';
    const eat = (e) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        const I = G.input;
        I.pressed["Mouse" + e.button] = false;
        I.keys["Mouse" + e.button] = false;
      } catch (err) {
        /* ignore */
      }
      if (e.type === "mousedown") {
        grabLock();
        // pointer lock can be unavailable (sandboxed frame, denied) — never trap the player behind the veil
        setTimeout(() => {
          if (resumeEl && !(G.input && G.input.locked)) hideResume();
        }, 600);
      }
    };
    resumeEl.addEventListener("mousedown", eat);
    resumeEl.addEventListener("mouseup", eat);
    resumeEl.addEventListener("click", eat);
    window.addEventListener("keydown", resumeKey, true);
    document.body.appendChild(resumeEl);
  }
  G.events.on("state", (s, prev) => {
    if (s !== "play") {
      hideResume();
      return;
    }
    // Applies to every way back into play (our screens, cutscenes, Esc-resume from pause —
    // Escape never counts as a user gesture for pointer lock).
    if (!prev || prev === "loading") return;
    clearTimeout(resumeTimer);
    // give an in-gesture requestPointerLock (e.g. closing with Tab) time to land first
    resumeTimer = setTimeout(() => {
      resumeTimer = 0;
      showResume();
    }, 320);
  });
  G.events.on("pointerlock", (locked) => {
    if (locked) hideResume();
  });
  X.hideResume = hideResume;

  // ------------------------------------------------------------------
  // PUBLIC: G.ui shared helpers
  // ------------------------------------------------------------------
  const prevUi = G.ui && !G.ui.__stub ? G.ui : null;
