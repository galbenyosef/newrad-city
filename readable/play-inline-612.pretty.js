/* src/ui_interact/00_base.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 00_base.js
 * Shared plumbing for every interaction screen:
 *   - G._uix : private module-internal toolbox (screen stack, key routing,
 *              defensive wrappers around rpg / inventory / items / sfx)
 *   - G.ui   : public shared UI helpers (root, el, confirm, prompt,
 *              openContainer (see 22_container.js), theme)
 * Everything talks to other modules at CALL time and survives stubs.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const X = (G._uix = G._uix || {});

  // ------------------------------------------------------------------
  // Defensive accessors to other modules
  // ------------------------------------------------------------------
  const live = (ns) => G[ns] && !G.isStub(ns);
  X.live = live;
  /**
   * Play a UI sound. `fallback` is used when the sound module has no recipe for `name` yet
   * (new ids land in sound/ later in the rebrand; the fallback keeps the screen audible meanwhile).
   */
  X.sfx = function (name, opts, fallback) {
    try {
      if (!live("sfx")) return null;
      if (fallback && typeof G.sfx.has === "function" && !G.sfx.has(name))
        name = fallback;
      return G.sfx.play(name, opts || {});
    } catch (e) {
      /* sound optional */
    }
    return null;
  };
  /** Scripted/debug runs (smoke, shot, ?debug) — the only time test hooks are attached. */
  X.testMode = () => !!(G.DEBUG || G.SMOKE || G.SHOT);
  X.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  X.gameName = () => G.GAME_NAME || "NEW RAD CITY";
  /** The hero's name (fixed protagonist, read from G.HERO). */
  X.heroName = () =>
    (G.HERO && G.HERO.name) || (G.player && G.player.name) || "Stranger";

  // ---- attributes & skills (§4) ------------------------------------------
  X.ATTR_NAMES = {
    brawn: "Brawn",
    reflex: "Reflex",
    grit: "Grit",
    wits: "Wits",
    senses: "Senses",
    presence: "Presence",
  };
  X.SKILL_NAMES = {
    firearms: "Firearms",
    melee: "Melee",
    explosives: "Explosives",
    medicine: "Medicine",
    mechanics: "Mechanics",
    electronics: "Electronics",
    stealth: "Stealth",
    persuasion: "Persuasion",
    trade: "Trade",
    survival: "Survival",
  };
  X.skillId = (id) => String(id || "").toLowerCase();
  X.attrId = (id) => String(id || "").toLowerCase();

  /** Attribute value (1-10). Defaults to 5 when rpg is missing. */
  X.attr = function (id) {
    id = X.attrId(id);
    try {
      if (live("rpg")) {
        if (typeof G.rpg.attr === "function") {
          const v = G.rpg.attr(id);
          if (typeof v === "number" && !isNaN(v)) return v;
        }
        const t = G.rpg.attributes || G.rpg.attrs;
        if (t && typeof t[id] === "number") return t[id];
      }
    } catch (e) {
      /* ignore */
    }
    return 5;
  };
  /** Skill value (0-100). Defaults to a sane novice value when rpg is missing. */
  X.skill = function (id) {
    const nid = X.skillId(id);
    try {
      if (live("rpg") && typeof G.rpg.skill === "function") {
        const v = G.rpg.skill(nid);
        if (typeof v === "number" && !isNaN(v)) return v;
      }
    } catch (e) {
      /* ignore */
    }
    return 25;
  };
  /** Count a skill use (rpg grows skills by use; Electronics by keypads/terminals). */
  X.useSkill = function (id, amount, reason) {
    try {
      if (live("rpg") && typeof G.rpg.useSkill === "function") {
        G.rpg.useSkill(X.skillId(id), amount || 1, reason || "");
        return;
      }
    } catch (e) {
      G.reportError("uix:useSkill", e);
      return;
    }
    G.events.emit("skillUsed", X.skillId(id), amount || 1, reason || ""); // only when rpg has no useSkill (never both)
  };
  /** Standing (reputation) change. */
  X.standing = function (n, reason) {
    if (!n || !live("rpg")) return;
    try {
      if (typeof G.rpg.addStanding === "function")
        G.rpg.addStanding(n, reason || "");
    } catch (e) {
      G.reportError("uix:standing", e);
    }
  };
  X.xp = function (n, reason) {
    try {
      if (n && live("rpg") && G.rpg.addXP) G.rpg.addXP(n, reason || "");
    } catch (e) {
      G.reportError("uix:xp", e);
    }
  };
  X.level = function () {
    try {
      if (live("rpg") && typeof G.rpg.level === "number") return G.rpg.level;
    } catch (e) {
      /* ignore */
    }
    return 1;
  };

  // ---- Items -------------------------------------------------------------
  function prettify(id) {
    return String(id)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  X.prettify = prettify;
  // Readable owner label for [STEAL] tags: an actor id resolves to that NPC's name, a faction id to a
  // faction label, anything else is prettified.
  const FACTION_LABEL = {
    settlers: "Settlers",
    continuity: "The Continuity",
    covenant: "The Iron Covenant",
    neon: "The Neon",
    raiders: "Raiders",
    glowkeepers: "The Glowkeepers",
    maniacs: "Maniacs",
    brutes: "Brutes",
    robots: "Robots",
    cryo: "Project Long Winter",
  };
  X.ownerName = function (owner) {
    if (!owner) return "";
    if (typeof owner === "object")
      return owner.name || prettify(owner.id || "someone");
    try {
      if (!G.isStub("actors") && G.actors.get) {
        const a = G.actors.get(owner);
        if (a && a.name) return a.name;
      }
    } catch (e) {
      /* ignore */
    }
    return FACTION_LABEL[owner] || prettify(owner);
  };

  // ---- currency: federal ration Scrip -----------------------------------
  X.CUR = "scrip";
  X.CUR_NAME = "Scrip";
  X.isCurrency = (id) => id === X.CUR;
  const curId = () => X.CUR;
  /** Read a merchant's / NPC's scrip purse (merchant.scrip). */
  X.purse = (m) => (m && typeof m.scrip === "number" ? m.scrip : undefined);
  X.setPurse = (m, v) => {
    if (m) m.scrip = v;
  };

  /** Item definition, or a harmless placeholder so UIs never crash on unknown ids. */
  X.itemDef = function (id) {
    let d = null;
    try {
      if (live("items") && G.items.get) d = G.items.get(id);
    } catch (e) {
      d = null;
    }
    if (d) return d;
    if (X.isCurrency(id))
      return {
        id,
        name: X.CUR_NAME,
        type: "misc",
        weight: 0,
        value: 1,
        _fake: true,
      };
    return {
      id,
      name: prettify(id),
      type: "misc",
      weight: 0,
      value: 1,
      _fake: true,
    };
  };
  X.itemName = (id) => {
    const d = X.itemDef(id);
    return (d && d.name) || prettify(id);
  };
  /** Line-art icon for an item (SVG markup) from ui_hud, or '' when the HUD is absent. */
  X.itemIconSVG = function (def) {
    if (!def || G.isStub("hud") || !G.hud) return "";
    try {
      const f = G.hud.itemIcon || (G.hud._ && G.hud._.itemIcon);
      return typeof f === "function" ? String(f(def) || "") : "";
    } catch (e) {
      return "";
    }
  };
  X.weaponBlock = function (def) {
    if (!def) return null;
    if (def.weapon) return def.weapon;
    try {
      if (live("weapons") && G.weapons.getDef) {
        const w = G.weapons.getDef(def.id);
        if (w) return w.weapon || w;
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  };
  X.invLive = () => live("inventory");
  X.invCount = function (id) {
    if (X.isCurrency(id)) return X.scrip();
    if (!live("inventory")) return X._fakeInv[id] || 0;
    try {
      return G.inventory.count(id) || 0;
    } catch (e) {
      return 0;
    }
  };
  X._fakeInv = { scrip: 120 }; // used only when rpg/inventory is a stub (demo / degraded mode)
  X.invAdd = function (id, n) {
    if (n <= 0) return;
    if (X.isCurrency(id)) {
      X.addScrip(n);
      return;
    }
    if (!live("inventory")) {
      X._fakeInv[id] = (X._fakeInv[id] || 0) + n;
      return;
    }
    try {
      G.inventory.add(id, n, { silent: true });
    } catch (e) {
      G.reportError("uix:invAdd", e);
    }
  };
  X.invRemove = function (id, n) {
    if (n <= 0) return;
    if (X.isCurrency(id)) {
      X.addScrip(-n);
      return;
    }
    if (!live("inventory")) {
      X._fakeInv[id] = Math.max(0, (X._fakeInv[id] || 0) - n);
      return;
    }
    try {
      G.inventory.remove(id, n);
    } catch (e) {
      G.reportError("uix:invRemove", e);
    }
  };
  /** Player's scrip. */
  X.scrip = function () {
    if (!live("inventory")) return X._fakeInv.scrip || 0;
    try {
      if (typeof G.inventory.scrip === "function")
        return G.inventory.scrip() || 0;
      return G.inventory.count(curId()) || 0;
    } catch (e) {
      return 0;
    }
  };
  X.addScrip = function (n) {
    if (!n) return;
    if (!live("inventory")) {
      X._fakeInv.scrip = Math.max(0, (X._fakeInv.scrip || 0) + n);
      return;
    }
    try {
      if (typeof G.inventory.addScrip === "function") {
        G.inventory.addScrip(n);
        return;
      }
      if (n > 0) G.inventory.add(curId(), n, { silent: true });
      else G.inventory.remove(curId(), -n);
    } catch (e) {
      G.reportError("uix:addScrip", e);
    }
  };
  /** Player inventory as [{id,count,def,equipped,condition}] (never throws). Currency is not listed. */
  X.invList = function () {
    if (!live("inventory")) {
      return Object.keys(X._fakeInv)
        .filter((k) => X._fakeInv[k] > 0 && !X.isCurrency(k))
        .map((k) => ({
          id: k,
          count: X._fakeInv[k],
          def: X.itemDef(k),
          equipped: false,
          condition: 1,
        }));
    }
    try {
      const l = G.inventory.list() || [];
      return l
        .filter((e) => !X.isCurrency(e.id))
        .map((e) => Object.assign({}, e, { def: e.def || X.itemDef(e.id) }));
    } catch (e) {
      return [];
    }
  };
  X.invWeight = function () {
    try {
      if (live("inventory") && G.inventory.weight)
        return G.inventory.weight() || 0;
    } catch (e) {
      /* ignore */
    }
    return 0;
  };
  X.carryMax = function () {
    try {
      if (live("rpg") && G.rpg.carryWeight) return G.rpg.carryWeight() || 200;
    } catch (e) {
      /* ignore */
    }
    return 200;
  };
  /** Items that belong to the hero's own kit and never trade/store (the goggles). */
  X.isKit = (id, def) =>
    /goggles/.test(String(id)) || !!(def && (def.kit || def.noDrop));

  /** Short type category for item lists. */
  X.CATS = [
    { id: "all", name: "ALL" },
    { id: "weapon", name: "WEAPONS" },
    { id: "apparel", name: "APPAREL" },
    { id: "aid", name: "AID" },
    { id: "misc", name: "MISC" },
    { id: "ammo", name: "AMMO" },
  ];
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
  const UI = {
    get root() {
      return document.getElementById("ui-root") || document.body;
    },
    /** Create element with class, append to parent (default: #ui-root). */
    el(tag, cls, parent) {
      const e = document.createElement(tag || "div");
      if (cls) e.className = cls;
      if (parent !== null) (parent || UI.root).appendChild(e);
      return e;
    },
    /** Yes/No modal → Promise<boolean>. Keyboard: Y/N, Enter, Esc, arrows. */
    confirm(text, opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        const back = UI.el("div", "ui-modal-back", document.body);
        const box = UI.el("div", "ui-modal ui-panel", back);
        const t = UI.el("div", "ui-modal-text", box);
        t.textContent = text;
        const row = UI.el("div", "", box);
        const yes = UI.el("span", "ui-btn sel", row);
        yes.textContent = opts.yes || "YES";
        const no = UI.el("span", "ui-btn", row);
        no.textContent = opts.no || "NO";
        let sel = 0;
        const paint = () => {
          yes.classList.toggle("sel", sel === 0);
          no.classList.toggle("sel", sel === 1);
        };
        const scr = {
          id: "confirm",
          onKey(c) {
            if (X.K.left(c) || X.K.right(c) || c === "Tab") {
              sel = 1 - sel;
              paint();
              X.sfx("ui_hover", { volume: 0.4 });
              return true;
            }
            if (c === "KeyY") return done(true);
            if (c === "KeyN" || c === "Escape") return done(false);
            if (
              c === "Enter" ||
              c === "NumpadEnter" ||
              c === "KeyE" ||
              c === "Space"
            )
              return done(sel === 0);
            return true;
          },
        };
        function done(v) {
          X.popScreen(scr);
          back.remove();
          X.sfx(v ? "ui_select" : "ui_back", { volume: 0.6 });
          resolve(v);
          return true;
        }
        yes.onclick = () => done(true);
        no.onclick = () => done(false);
        yes.onmouseenter = () => {
          sel = 0;
          paint();
        };
        no.onmouseenter = () => {
          sel = 1;
          paint();
        };
        X.pushScreen(scr);
      });
    },
    /** Text entry modal → Promise<string|null>. */
    prompt(text, def, opts) {
      opts = opts || {};
      return new Promise((resolve) => {
        const back = UI.el("div", "ui-modal-back", document.body);
        const box = UI.el("div", "ui-modal ui-panel", back);
        const t = UI.el("div", "ui-modal-text", box);
        t.textContent = text;
        const inp = UI.el("input", "", box);
        inp.value = def || "";
        inp.maxLength = opts.maxLength || 40;
        inp.spellcheck = false;
        const row = UI.el("div", "", box);
        const ok = UI.el("span", "ui-btn sel", row);
        ok.textContent = "ACCEPT";
        const ca = UI.el("span", "ui-btn", row);
        ca.textContent = "CANCEL";
        const scr = {
          id: "prompt",
          onKey(c) {
            if (c === "Escape") return done(null);
            return true;
          },
        };
        function done(v) {
          X.popScreen(scr);
          back.remove();
          X.sfx(v !== null ? "ui_select" : "ui_back", { volume: 0.6 });
          resolve(v);
          return true;
        }
        inp.addEventListener("keydown", (e) => {
          e.stopPropagation();
          if (e.key === "Enter") done(inp.value.trim());
          else if (e.key === "Escape") done(null);
          else
            X.sfx(
              "teletype_key",
              { volume: 0.25, pitch: 0.9 + Math.random() * 0.2 },
              "terminal_type",
            );
        });
        ok.onclick = () => done(inp.value.trim());
        ca.onclick = () => done(null);
        X.pushScreen(scr);
        setTimeout(() => {
          try {
            inp.focus();
            inp.select();
          } catch (e) {
            /* ignore */
          }
        }, 30);
      });
    },
    /** Colour theme for the goggle-style screens: 'cyan' (default) or 'amber'. */
    theme(name) {
      document.body.classList.toggle("ui-amber", name === "amber");
      UI._theme = name;
    },
    /** True while any ui_interact screen owns the input. */
    isOpen() {
      return X.anyOpen();
    },
    itemName: (id) => X.itemName(id),
  };
  // keep anything another module might already have put on G.ui (never clobber)
  if (prevUi)
    for (const k of Object.keys(prevUi)) if (!(k in UI)) UI[k] = prevUi[k];
  G.ui = UI;
})();
