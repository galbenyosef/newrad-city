// play-inline-601 01 — list
// Lines 30-383 of readable/play-inline-601.pretty.js (statement-aligned).
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
