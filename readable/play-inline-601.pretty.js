/* src/ui_hud/30_goggles.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : VIGIL GOGGLES (shell, navigation, lamp)
 *
 * State 'goggles'.  Tab / I toggles, M opens MAP > CITY, J opens QUESTS,
 * L toggles the goggle lamp.  Opening the goggles keeps the 3D view on
 * screen but dims it to ~30 % with a blue-grey tint and a soft vignette;
 * over it the readout powers up (flicker + scanline sweep) in pale
 * cyan-white CRT text and vector line art — a 1970s ship-computer feel.
 * Style 02 "Red frame": red title bar + red rules, red active tab and
 * section titles over a blue readout.  The readout (.gg-frame) sits in
 * one container, .gg-lens (the hook for any later lens effect); the dim layer
 * (with its backdrop-filter) stays outside it.
 *
 * Pages live in 31_gg_status.js, 32_gg_items.js, 33_gg_quests.js,
 * 34_gg_map.js, 35_gg_notes.js, 36_gg_radio.js and register through
 * H.ggPage(tab, sub, page).  A page is
 *   { render(body, GG)            → fill body element
 *     onKey?(code, e, GG) → bool  → consume a key before default nav
 *     onWheel?(e, GG) → bool
 *     update?(realDt, GG)         → per-frame while visible
 *     info?(GG) → [[label,value],...]  header readouts (optional)
 *     hints?(GG) → [[key,label],...]   footer key hints (optional)
 *     leave?(GG) }
 *
 * Keyboard: Q/E tab, A/D or ←/→ sub tab, W/S or ↑/↓ list,
 *           Enter/Space activate, Tab / I / Esc close.  Mouse: everything.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const H = G.hud._;

  const TABS = [
    {
      id: "status",
      label: "STATUS",
      subs: [
        ["vitals", "Vitals"],
        ["attributes", "Attributes"],
        ["skills", "Skills"],
        ["talents", "Talents"],
        ["effects", "Effects"],
        ["record", "Record"],
      ],
    },
    {
      id: "inventory",
      label: "INVENTORY",
      subs: [
        ["weapons", "Weapons"],
        ["apparel", "Apparel"],
        ["aid", "Aid"],
        ["misc", "Misc"],
        ["ammo", "Ammo"],
      ],
    },
    {
      id: "quests",
      label: "QUESTS",
      subs: [
        ["all", "All"],
        ["main", "Main"],
        ["side", "Side"],
        ["misc", "Misc"],
      ],
    },
    {
      id: "map",
      label: "MAP",
      subs: [
        ["local", "Local"],
        ["city", "City"],
      ],
    },
    {
      id: "notes",
      label: "NOTES",
      subs: [
        ["notes", "Notes"],
        ["codes", "Codes"],
        ["reels", "Tape Reels"],
      ],
    },
    { id: "radio", label: "RADIO", subs: [["radio", "Receiver"]] },
  ];

  const GG = {
    open: false,
    tab: "status",
    sub: {
      status: "vitals",
      inventory: "weapons",
      quests: "all",
      map: "city",
      notes: "notes",
      radio: "radio",
    },
    sel: {}, // per page key → selected index
    pages: {}, // 'tab/sub' → page
    el: {},
    dirty: true,
    TABS,
  };
  H.GG = GG;
  H.ggPage = function (tab, sub, page) {
    GG.pages[tab + "/" + sub] = page;
  };

  // ------------------------------------------------------------------
  // Generic list view used by most pages
  // ------------------------------------------------------------------
  /**
   * H.ggList(container, items, key, {onSelect(i,item), onActivate(i,item), empty})
   * items: [{label, right?, cls?, mark?:'eq'|'track'|'new'|html, dim?, head?:true (section header, not selectable)}]
   * Selection is persisted per key in GG.sel. Returns the list object.
   */
  H.ggList = function (container, items, key, opts) {
    opts = opts || {};
    const list = { items, key, el: H.el("div", "gg-list", container), opts };
    const selectable = (i) => items[i] && !items[i].head;
    let sel = GG.sel[key] || 0;
    if (sel >= items.length) sel = Math.max(0, items.length - 1);
    while (sel < items.length - 1 && !selectable(sel)) sel++;
    list.sel = sel;
    GG.sel[key] = sel;
    if (!items.some((it, i) => selectable(i)))
      H.el("div", "gg-empty", list.el, H.esc(opts.empty || "NO DATA."));
    list.rows = items.map((it, i) => {
      if (it.head)
        return H.el(
          "div",
          "gg-li-head",
          list.el,
          "[ " + H.esc(H.up(it.label)) + " ]",
        );
      const r = H.el(
        "div",
        "gg-li" + (it.cls ? " " + it.cls : "") + (it.dim ? " dim" : ""),
        list.el,
      );
      r.dataset.i = i;
      const mk =
        it.mark === "eq"
          ? "&#9632;"
          : it.mark === "track"
            ? "&#9658;"
            : it.mark === "new"
              ? "&#9679;"
              : it.mark || "";
      r.innerHTML =
        '<span class="gg-mark">' +
        mk +
        '</span><span class="gg-lab">' +
        H.esc(H.up(it.label)) +
        "</span>" +
        (it.right !== undefined && it.right !== ""
          ? '<span class="gg-rt">' + H.esc(it.right) + "</span>"
          : "");
      r.addEventListener("mouseenter", () => {
        if (list.sel !== i) list.setSel(i, true);
      });
      r.addEventListener("click", (ev) => {
        ev.stopPropagation();
        list.setSel(i, false);
        if (opts.onActivate) opts.onActivate(i, items[i]);
      });
      return r;
    });
    list.setSel = function (i, sound) {
      if (!items.length) return;
      i = H.clamp(i, 0, items.length - 1);
      if (!selectable(i)) return;
      if (list.rows[list.sel]) list.rows[list.sel].classList.remove("sel");
      list.sel = i;
      GG.sel[key] = i;
      const r = list.rows[i];
      if (r) {
        r.classList.add("sel");
        if (r.scrollIntoViewIfNeeded) r.scrollIntoViewIfNeeded(false);
        else r.scrollIntoView({ block: "nearest" });
      }
      if (sound) H.sfx("ui_hover", { volume: 0.3 });
      if (opts.onSelect) opts.onSelect(i, items[i]);
    };
    list.move = function (d) {
      if (!items.length) return;
      let i = list.sel;
      for (let k = 0; k < items.length; k++) {
        i = (i + d + items.length) % items.length;
        if (selectable(i)) break;
      }
      list.setSel(i, true);
    };
    list.current = () => items[list.sel];
    GG.activeList = list;
    if (selectable(sel)) list.setSel(sel, false);
    // long lists: fade the bottom edge while more rows sit below the fold
    const scroller =
      container &&
      container.classList &&
      container.classList.contains("gg-col-l")
        ? container
        : null;
    if (scroller) {
      const upd = () =>
        scroller.classList.toggle(
          "gg-overflow",
          scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight >
            4,
        );
      scroller.addEventListener("scroll", upd, { passive: true });
      requestAnimationFrame(upd);
    }
    return list;
  };

  /** Segmented bar: n blocks, filled fraction; cls 'amber' / 'red' / 'low'. */
  H.ggSeg = function (frac, n, cls) {
    n = n || 20;
    frac = H.clamp(Number(frac) || 0, 0, 1);
    const on = Math.round(frac * n);
    let s = '<span class="gg-seg ' + (cls || "") + '">';
    for (let i = 0; i < n; i++)
      s += "<i" + (i < on ? ' class="on"' : "") + "></i>";
    return s + "</span>";
  };
  H.ggBar = function (frac, cls) {
    return (
      '<div class="gg-bar ' +
      (cls || "") +
      '"><i style="width:' +
      (H.clamp(frac, 0, 1) * 100).toFixed(1) +
      '%"></i></div>'
    );
  };
  H.ggStat = function (label, value, raw) {
    return (
      '<div class="gg-stat"><span class="gg-sl">' +
      H.esc(H.up(label)) +
      '</span><span class="gg-dots"></span><span class="gg-sv">' +
      (raw ? value : H.esc(value)) +
      "</span></div>"
    );
  };
  H.ggHead = function (t) {
    return '<div class="gg-h">[ ' + H.esc(H.up(t)) + " ]</div>";
  };
  H.fmtTime = function (s) {
    s = Math.round(s);
    if (s >= 3600)
      return Math.floor(s / 3600) + "H " + Math.floor((s % 3600) / 60) + "M";
    if (s >= 60) return Math.floor(s / 60) + "M " + (s % 60) + "S";
    return s + "S";
  };

  // ------------------------------------------------------------------
  // DOM
  // ------------------------------------------------------------------
  function build() {
    const o = H.el("div", "gg-overlay", H.uiRoot);
    o.style.display = "none";
    if (G.SHOT) o.classList.add("shot");
    if (G.SHOT && G.QS && G.QS.get("ggHide")) o.style.visibility = "hidden"; // review hook: isolate the overlay     // headless review shots: no backdrop filters (software compositor)
    GG.el.overlay = o;
    o.innerHTML =
      '<div class="gg-dim"></div>' +
      '<div class="gg-lens">' +
      '<div class="gg-frame">' +
      '<div class="gg-head">' +
      '<div class="gg-brand"><canvas class="gg-globe" width="64" height="64"></canvas>' +
      '<div class="gg-brand-t"><div class="gg-brand-n">VIGIL</div><div class="gg-brand-s">FIELD OPTICS</div></div></div>' +
      '<div class="gg-hinfo"></div></div>' +
      '<div class="gg-tabs"></div>' +
      '<div class="gg-subs"></div>' +
      '<div class="gg-body"></div>' +
      '<div class="gg-foot"><div class="gg-hints"></div><div class="gg-sys"></div></div>' +
      '<div class="gg-modal"></div>' +
      "</div></div>" +
      '<div class="gg-fx"><div class="gg-scan"></div><div class="gg-sweep"></div><div class="gg-vig"></div></div>';
    GG.el.lens = o.querySelector(".gg-lens");
    GG.el.frame = o.querySelector(".gg-frame");
    GG.el.screen = GG.el.frame; // message box host (20_hud.js)
    GG.el.hinfo = o.querySelector(".gg-hinfo");
    GG.el.tabs = o.querySelector(".gg-tabs");
    GG.el.subs = o.querySelector(".gg-subs");
    GG.el.body = o.querySelector(".gg-body");
    GG.el.hints = o.querySelector(".gg-hints");
    GG.el.sys = o.querySelector(".gg-sys");
    GG.el.modal = o.querySelector(".gg-modal");
    GG.el.globe = o.querySelector(".gg-globe");
    GG.el.tabBtns = TABS.map((t, i) => {
      const b = H.el(
        "div",
        "gg-tab",
        GG.el.tabs,
        '<span class="gg-tab-k">' + (i + 1) + "</span>" + t.label,
      );
      b.addEventListener("click", () => setTab(t.id));
      return b;
    });
    o.addEventListener("contextmenu", (e) => e.preventDefault());
    o.addEventListener(
      "wheel",
      (e) => {
        const page = curPage();
        if (page && page.onWheel && page.onWheel(e, GG)) e.preventDefault();
        else if (GG.activeList && !e.target.closest(".gg-col-l")) {
          GG.activeList.move(e.deltaY > 0 ? 1 : -1);
          e.preventDefault();
        }
      },
      { passive: false },
    );
    window.addEventListener("resize", layout);
    layout();
  }

  /** Rotating wire globe beside the VIGIL mark (vector line art, dark ink on the red title bar). */
  let globeA = 0;
  function drawGlobe(dt) {
    const cv = GG.el.globe;
    if (!cv) return;
    globeA += dt * 0.6;
    const g = cv.getContext("2d"),
      W = cv.width,
      R = W * 0.4,
      cx = W / 2,
      cy = W / 2;
    const col = "#04080b";
    g.clearRect(0, 0, W, W);
    g.strokeStyle = col;
    g.lineWidth = 1.4;
    g.shadowBlur = 0;
    g.globalAlpha = 0.9;
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 0.5;
    for (let k = 0; k < 6; k++) {
      // meridians
      const a = globeA + (k * Math.PI) / 6,
        rx = Math.abs(Math.cos(a)) * R;
      g.beginPath();
      g.ellipse(cx, cy, Math.max(0.5, rx), R, 0, 0, Math.PI * 2);
      g.stroke();
    }
    for (let k = -2; k <= 2; k++) {
      // parallels
      const y = cy + (k * R) / 3,
        rr = Math.sqrt(Math.max(0, R * R - ((k * R) / 3) * ((k * R) / 3)));
      g.beginPath();
      g.ellipse(cx, y, rr, rr * 0.18, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    g.shadowBlur = 0;
  }

  /** Scale the readout with the viewport. */
  function layout() {
    if (!GG.el.frame) return;
    const fs = H.clamp(
      Math.min(window.innerWidth / 92, window.innerHeight / 52),
      11,
      19,
    );
    GG.el.frame.style.fontSize = fs.toFixed(2) + "px";
    GG.dirty = true;
    // re-render right away so canvases (maps, radio scope) match the new size even if no frame follows
    if (GG.open && GG.el.body && GG.el.body.childNodes.length) {
      try {
        render();
      } catch (e) {
        /* ignore */
      }
    }
  }

  // ------------------------------------------------------------------
  // Navigation
  // ------------------------------------------------------------------
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
})();
