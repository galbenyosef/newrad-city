// play-inline-601 02 — tab
// Lines 384-720 of readable/play-inline-601.pretty.js (statement-aligned).
  function tabDef(id) {
    return TABS.find((t) => t.id === id) || TABS[0];
  }
  function curPage() {
    return GG.pages[GG.tab + "/" + GG.sub[GG.tab]];
  }
  function setTab(id, sub, silent) {
    if (!TABS.find((t) => t.id === id)) id = "status";
    if (sub && !tabDef(id).subs.find((s) => s[0] === sub)) sub = null;
    const changed = GG.tab !== id || (sub && GG.sub[id] !== sub);
    const prev = curPage();
    if (prev && prev.leave && changed) {
      try {
        prev.leave(GG);
      } catch (e) {
        H.warnOnce("gg.leave", e);
      }
    }
    GG.tab = id;
    if (sub) GG.sub[id] = sub;
    if (changed && !silent) H.sfx("goggles_tab", { volume: 0.6 });
    closeModal();
    render();
    // the readout redraws top-down when the page changes (typed-in look)
    if (changed && GG.el.body) {
      const b = GG.el.body;
      b.classList.remove("gg-switch");
      void b.offsetWidth;
      b.classList.add("gg-switch");
    }
  }
  function cycleTab(d) {
    const i = TABS.findIndex((t) => t.id === GG.tab);
    setTab(TABS[(i + d + TABS.length) % TABS.length].id);
  }
  function cycleSub(d) {
    const t = tabDef(GG.tab);
    if (t.subs.length < 2) return;
    const i = t.subs.findIndex((s) => s[0] === GG.sub[GG.tab]);
    setTab(GG.tab, t.subs[(i + d + t.subs.length) % t.subs.length][0]);
  }
  GG.setTab = setTab;
  GG.rerender = function () {
    GG.dirty = true;
  };
  // sound module: proximity signals come and go while you walk — refresh RADIO if it is on screen
  G.events.on("radioStationsChanged", () => {
    if (GG.open && GG.tab === "radio") GG.dirty = true;
  });

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------
  function render() {
    GG.dirty = false;
    const t = tabDef(GG.tab);
    GG.el.tabBtns.forEach((b, i) =>
      b.classList.toggle("on", TABS[i].id === GG.tab),
    );
    GG.el.subs.innerHTML = "";
    if (t.subs.length > 1) {
      for (const s of t.subs) {
        const e = H.el(
          "div",
          "gg-sub" + (GG.sub[GG.tab] === s[0] ? " on" : ""),
          GG.el.subs,
          H.esc(H.up(s[1])),
        );
        e.addEventListener("click", () => setTab(GG.tab, s[0]));
      }
    }
    renderHeader();
    GG.activeList = null;
    const body = GG.el.body;
    body.innerHTML = "";
    body.className = "gg-body pg-" + GG.tab + "-" + GG.sub[GG.tab];
    const page = curPage();
    if (page) {
      try {
        page.render(body, GG);
      } catch (e) {
        G.reportError("update:ui_hud/goggles-page", e);
        body.innerHTML = '<div class="gg-empty">ERROR READING DATA</div>';
      }
    } else body.innerHTML = '<div class="gg-empty">NO DATA</div>';
    renderHints();
  }
  function renderHeader() {
    const page = curPage();
    let info = null;
    if (page && page.info) {
      try {
        info = page.info(GG);
      } catch (e) {
        info = null;
      }
    }
    if (!info) info = defaultInfo();
    const html = info
      .map(
        (x) =>
          '<div class="gg-hbox' +
          (x[2] ? " " + x[2] : "") +
          '">' +
          (x[0] ? '<span class="gg-hl">' + H.esc(x[0]) + "</span>" : "") +
          '<span class="gg-hv">' +
          H.esc(x[1]) +
          "</span></div>",
      )
      .join("");
    H.setHTML(GG.el.hinfo, html);
    // system line (bottom-right): lamp / radiation rate / clock
    const rr = (G.player && G.player.radRate) || 0;
    H.setHTML(
      GG.el.sys,
      "SYS NOMINAL &middot; LAMP " +
        (LAMP.on ? "ON" : "OFF") +
        ' &middot; <span class="' +
        (rr > 0.05 ? "amber" : "") +
        '">RAD ' +
        rr.toFixed(1) +
        "/S</span> &middot; " +
        H.gameClock() +
        '<span class="gg-cursor">&#9608;</span>',
    );
  }
  function renderHints() {
    const page = curPage();
    let hs = null;
    if (page && page.hints) {
      try {
        hs = page.hints(GG);
      } catch (e) {
        hs = null;
      }
    }
    const base = [
      ["Q/E", "Tab"],
      ["A/D", "Section"],
      ["W/S", "Select"],
    ];
    const all = base
      .concat(hs || [["Enter", "Use"]])
      .concat([["Tab", "Close"]]);
    H.setHTML(
      GG.el.hints,
      all
        .map(
          (h) =>
            "<span><b>" + H.esc(h[0]) + "</b>" + H.esc(H.up(h[1])) + "</span>",
        )
        .join(""),
    );
  }
  GG.renderHints = renderHints;
  /** Player level / XP from rpg (old or new API). */
  H.level = function () {
    const r = G.rpg;
    if (!r || r.__stub) return 1;
    const v = typeof r.getLevel === "function" ? r.getLevel() : r.level;
    return Number(v) || 1;
  };
  function defaultInfo() {
    const P = G.player;
    if (GG.tab === "status") {
      const lvl = H.level();
      const xp = (G.rpg && !G.rpg.__stub && G.rpg.xp) || 0;
      const next = H.call("rpg", "xpForLevel", [lvl + 1], 0);
      return [
        ["LVL", lvl],
        [
          "HP",
          Math.round(P.hp) + "/" + Math.round(P.maxHp),
          P.hp < P.maxHp * 0.25 ? "red" : "",
        ],
        ["XP", Math.round(xp) + "/" + Math.round(next || 0)],
      ];
    }
    if (GG.tab === "inventory") {
      const wt = H.call("inventory", "weight", [], 0),
        cap = H.callAny("rpg", ["carryCapacity", "carryWeight"], [], 200);
      const dr = H.callAny("rpg", ["armorRating", "getDR"], [], 0);
      const scrip = H.callAny("inventory", ["scrip", "money"], [], 0);
      return [
        ["WT", Math.round(wt) + "/" + Math.round(cap), wt > cap ? "amber" : ""],
        ["ARM", Math.round(dr)],
        ["SCRIP", scrip],
      ];
    }
    return [
      ["", H.up(H.placeName())],
      ["", H.gameClock()],
    ];
  }
  GG.renderHeader = renderHeader;

  // ------------------------------------------------------------------
  // In-display modal (confirmations)
  // ------------------------------------------------------------------
  GG.confirm = function (text, onYes, yesLabel, noLabel, extraHTML) {
    const m = GG.el.modal;
    m.innerHTML =
      '<div class="gg-modal-box"><div class="gg-h">[ CONFIRM ]</div><div class="gg-modal-text">' +
      H.esc(H.up(text)) +
      "</div>" +
      (extraHTML || "") +
      '<div class="gg-modal-btns"><div class="gg-mbtn sel" data-v="1">[ ' +
      H.esc(H.up(yesLabel || "Yes")) +
      ' ]</div><div class="gg-mbtn" data-v="0">[ ' +
      H.esc(H.up(noLabel || "No")) +
      " ]</div></div></div>";
    m.classList.add("on");
    GG.modal = { sel: 1, onYes };
    const btns = m.querySelectorAll(".gg-mbtn");
    const pick = (v) => {
      closeModal();
      if (v) {
        H.sfx("ui_select");
        onYes();
      } else H.sfx("ui_back");
    };
    btns.forEach((b) => {
      b.addEventListener("mouseenter", () => {
        btns.forEach((x) => x.classList.remove("sel"));
        b.classList.add("sel");
        GG.modal.sel = Number(b.dataset.v);
      });
      b.addEventListener("click", () => pick(Number(b.dataset.v)));
    });
    GG.modal.pick = pick;
    GG.modal.btns = btns;
  };
  function closeModal() {
    if (GG.el.modal) {
      GG.el.modal.classList.remove("on");
      GG.el.modal.innerHTML = "";
    }
    GG.modal = null;
  }
  GG.closeModal = closeModal;

  // ------------------------------------------------------------------
  // Open / close
  // ------------------------------------------------------------------
  let closeTimer = null;
  // 'play' always; the listed soft screens only when a caller asks (opts.force) —
  // the goggles then return to that screen on close.
  const OPEN_FROM_SOFT = {
    container: 1,
    barter: 1,
    dialogue: 1,
    terminal: 1,
    keypad: 1,
    paused: 1,
  };
  GG.returnState = "play";
  function canOpenFrom(s, force) {
    if (s === "play" || s === "goggles") return true;
    return !!(force && OPEN_FROM_SOFT[s]);
  }
  function softScreenAlive(st) {
    const q = (ns, fns) => {
      try {
        if (!G[ns] || G.isStub(ns)) return false;
        for (const fn of fns)
          if (typeof G[ns][fn] === "function") return !!G[ns][fn]();
      } catch (e) {
        return false;
      }
      return false;
    };
    switch (st) {
      case "dialogue":
        return q("dialogue", ["isActive"]);
      case "barter":
        return q("barter", ["isOpen"]);
      case "terminal":
        return q("terminals", ["isOpen"]);
      case "keypad":
        return q("locks", ["isKeypadOpen", "isOpen"]);
      case "container":
        return q("ui", ["isOpen"]);
      default:
        return false;
    }
  }
  /** Normalise tab/sub names (also accepts old page ids from callers not yet renamed). */
  const OLD_SUB = {
    world: ["map", "city"],
    local: ["map", "local"],
    quests: ["quests", null],
    notes: ["notes", "notes"],
    radio: ["radio", "radio"],
    status: ["status", "vitals"],
    skills: ["status", "skills"],
    talents: ["status", "talents"],
    general: ["status", "record"],
  };
  function resolve(tab, sub) {
    if (tab && TABS.find((t) => t.id === tab)) return [tab, sub];
    if (sub && OLD_SUB[sub]) return [OLD_SUB[sub][0], OLD_SUB[sub][1]];
    if (tab === "stat") return ["status", sub];
    if (tab === "items") return ["inventory", sub];
    if (tab === "data") return ["quests", null];
    return [tab, sub];
  }
  function open(tab, sub, force) {
    if (!GG.el.overlay) return false;
    const s = G.state;
    if (!canOpenFrom(s, force) && force !== "any" && !(G.SHOT || G.SMOKE))
      return false;
    if (s !== "goggles" && force !== "any")
      GG.returnState = s === "play" || OPEN_FROM_SOFT[s] ? s : "play";
    const r = resolve(tab, sub);
    if (r[0]) {
      GG.tab = r[0];
      if (r[1]) GG.sub[r[0]] = r[1];
    }
    if (!TABS.find((t) => t.id === GG.tab)) GG.tab = "status";
    GG.open = true;
    if (G.state !== "goggles") G.setState("goggles");
    clearTimeout(closeTimer);
    const o = GG.el.overlay;
    o.style.display = "";
    o.classList.remove("closing");
    void o.offsetWidth;
    // review screenshots capture the readout at rest (virtual time can freeze mid power-up)
    if (!G.SHOT) {
      o.classList.remove("opening");
      void o.offsetWidth;
      o.classList.add("opening");
    }
    H.sfx("goggles_open");
    layout();
    render();
    return true;
  }
