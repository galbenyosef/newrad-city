// play-inline-533 01 — row
// Lines 18-361 of readable/play-inline-533.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const C = G.crafting;
  const X = C._;

  const UI = (X.ui = {
    el: null,
    open: false,
    station: "workbench",
    tab: 0,
    sel: 0,
    sub: 0,
    qty: 1,
    rows: [],
    msg: "",
    msgT: 0,
    msgBad: false,
    bench: null,
    lastRender: 0,
  });
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  const pct = (v) => Math.round(Math.max(0, Math.min(1, v || 0)) * 100);
  const SK_ABBR = X.SKILL_ABBR || {};
  const tabsOf = () => X.TABS[UI.station] || X.TABS.workbench;
  const tabKey = () => (tabsOf()[UI.tab] || tabsOf()[0])[0];

  // ------------------------------------------------------------------
  // DOM
  // ------------------------------------------------------------------
  function build() {
    if (UI.el) return;
    const root =
      (!G.isStub("ui") && G.ui && G.ui.root) ||
      document.getElementById("ui-root") ||
      document.body;
    const el = document.createElement("div");
    el.className = "craft-root craft-hidden";
    el.innerHTML =
      '<div class="craft-box"><div class="craft-scan"></div><div class="craft-glare"></div>' +
      '<div class="craft-head"><span class="craft-glyph"></span><span class="craft-title"></span><span class="craft-skills"></span></div>' +
      '<div class="craft-tabs"></div>' +
      '<div class="craft-body"><ul class="craft-list"></ul><div class="craft-info"></div></div>' +
      '<div class="craft-msg"></div><div class="craft-foot"></div></div>';
    root.appendChild(el);
    UI.el = el;
    UI.glyphEl = el.querySelector(".craft-glyph");
    UI.titleEl = el.querySelector(".craft-title");
    UI.skillsEl = el.querySelector(".craft-skills");
    UI.tabsEl = el.querySelector(".craft-tabs");
    UI.listEl = el.querySelector(".craft-list");
    UI.infoEl = el.querySelector(".craft-info");
    UI.msgEl = el.querySelector(".craft-msg");
    UI.footEl = el.querySelector(".craft-foot");
    el.addEventListener("mousedown", (e) => {
      const t = e.target.closest
        ? e.target.closest("[data-tab],[data-row],[data-act]")
        : null;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.dataset.tab !== undefined) {
        setTab(+t.dataset.tab);
      } else if (t.dataset.row !== undefined) {
        const i = +t.dataset.row;
        if (UI.sel === i && e.detail > 1) act("primary");
        else {
          select(i);
        }
      } else if (t.dataset.act) act(t.dataset.act);
    });
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // Station glyphs: small vector line icons in the goggles style (no illustrations).
  const GLYPH = {
    workbench:
      '<path d="M14 50 L38 26"/><path d="M34 18 a9 9 0 1 0 12 12 l-5-1 -3-3 -1-5z"/><path d="M18 18 l10 10 M14 22 l8-8 l6 6 l-8 8z"/><path d="M28 28 L50 50"/>',
    campfire:
      '<path d="M12 50 L52 40 M12 40 L52 50"/><path d="M32 38 c-10-6-8-16 0-26 c2 8 10 10 8 20 c-1 4-4 6-8 6z"/><path d="M32 38 c-4-3-3-8 0-12 c1 4 4 5 3 9"/>',
    reloading:
      '<path d="M18 46 h22 l6-4 v-12 l-6-4 H18z"/><path d="M18 26 v20 M22 26 v20"/><path d="M46 30 h4 q6 0 8 6 q-2 6-8 6 h-4"/><path d="M10 54 h44"/>',
  };
  function stationGlyph(station, big) {
    const g = GLYPH[station] || GLYPH.workbench;
    return (
      '<svg viewBox="0 0 64 64" class="craft-glyph-svg' +
      (big ? " big" : "") +
      '" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M4 14 V4 H14 M50 4 H60 V14 M60 50 V60 H50 M14 60 H4 V50" class="br"/>' +
      g +
      "</svg>"
    );
  }

  // ------------------------------------------------------------------
  // Rows per tab
  // ------------------------------------------------------------------
  function rowsFor(key) {
    if (key === "modify")
      return X.modWeaponRows().map((r) => Object.assign({ type: "modw" }, r));
    if (key === "repair")
      return X.repairRows().map((r) => Object.assign({ type: "repair" }, r));
    return X.recipes(UI.station, key).map((r) =>
      Object.assign({ type: "recipe", tab: key }, r),
    );
  }

  // ------------------------------------------------------------------
  // Info builders
  // ------------------------------------------------------------------
  function effectsLine(def) {
    if (!def) return "";
    const cells = [];
    if (def.weapon) {
      const w = def.weapon;
      if (w.damage)
        cells.push("DAM " + Math.round(w.damage * (w.pellets || 1)));
      if (w.explosionRadius) cells.push("RAD " + w.explosionRadius + "m");
      if (w.magSize > 1) cells.push("MAG " + w.magSize);
      if (w.strReq) cells.push("BRAWN " + w.strReq);
    }
    const ef = def.effects || {};
    if (ef.hp) cells.push("HP +" + ef.hp);
    if (ef.hpOverTime)
      cells.push("HP +" + ef.hpOverTime[0] + " / " + ef.hpOverTime[1] + "s");
    if (ef.rads > 0) cells.push("RADS +" + ef.rads);
    if (ef.rads < 0) cells.push("RADS " + ef.rads);
    if (ef.radsOverTime) cells.push("RADS " + ef.radsOverTime[0]);
    if (ef.radResist) cells.push("RAD RES +" + ef.radResist);
    if (ef.dr) cells.push("DR +" + ef.dr);
    const at = ef.attrs;
    if (at)
      for (const k in at)
        cells.push(attrLabel(k) + " " + (at[k] > 0 ? "+" : "") + at[k]);
    if (ef.duration && (at || ef.dr || ef.radResist))
      cells.push(Math.round(ef.duration / 60) + " MIN");
    if (ef.addiction) cells.push("ADDICTIVE");
    cells.push("WG " + (def.weight || 0));
    cells.push("VAL " + (def.value || 0));
    return (
      '<div class="craft-stats">' +
      cells.map((c) => "<span>" + esc(c) + "</span>").join("") +
      "</div>"
    );
  }
  /** Attribute label for an effect key. */
  function attrLabel(k) {
    try {
      if (!G.isStub("rpg") && typeof G.rpg.attrName === "function")
        return String(G.rpg.attrName(k)).toUpperCase();
    } catch (e) {
      /* ignore */
    }
    return String(k).toUpperCase();
  }
  function condBar(v, cap, label) {
    const p = pct(v);
    return (
      '<div class="craft-cnd"><b>' +
      (label || "CND") +
      '</b><span class="bar"><i style="width:' +
      p +
      '%"></i>' +
      (cap !== undefined && cap < 1
        ? '<em style="left:' + pct(cap) + '%"></em>'
        : "") +
      "</span><span>" +
      p +
      "%</span></div>"
    );
  }
  function partsList(row, times) {
    return (
      '<ol class="craft-parts">' +
      row.parts
        .map(([id, n], i) => {
          const have = X.count(id),
            need = n * (times || 1);
          return (
            '<li class="' +
            (have >= need ? "ok" : "no") +
            '"><u>' +
            (i + 1) +
            "</u><span>" +
            esc(X.name(id)) +
            (n > 1 ? " &times;" + n : "") +
            "</span><i>" +
            Math.min(have, 999) +
            "/" +
            need +
            "</i></li>"
          );
        })
        .join("") +
      "</ol>"
    );
  }
  function reqList(row) {
    const keys = Object.keys(row.req || {});
    if (!keys.length) return "";
    return (
      '<div class="craft-reqs">' +
      keys
        .map((k) => {
          const ok = X.skill(k) >= row.req[k];
          return (
            '<span class="' +
            (ok ? "ok" : "no") +
            '">REQUIRES ' +
            esc((X.SKILL_NAMES[k] || k).toUpperCase()) +
            " " +
            row.req[k] +
            " <em>(" +
            Math.round(X.skill(k)) +
            ")</em></span>"
          );
        })
        .join("") +
      "</div>"
    );
  }
  const capFor = (row) => {
    const d = X.def(row.makes);
    if (row.kind === "schem" && d && d.hasCondition) return 5;
    if (row.src === "wpn") return X.WPN_BATCH || 10; // one G.weapons.craft call per unit
    return UI.station === "reloading" ? 500 : 50;
  };
  function verbFor(row) {
    if (UI.station === "campfire")
      return row.tab === "cooking" ? "COOK" : "BREW";
    if (UI.station === "reloading")
      return row.breakdown
        ? "BREAK DOWN"
        : row.tab === "recycle"
          ? "RECHARGE"
          : "LOAD";
    return "BUILD";
  }
  function recipeInfo(row) {
    const def = X.def(row.makes);
    const why = X.blocker(row, 1);
    const max = why ? 0 : X.maxTimes(row, capFor(row));
    if (UI.qty > Math.max(1, max)) UI.qty = Math.max(1, max);
    const q = Math.max(1, UI.qty);
    const sub =
      row.kind === "schem"
        ? "SCHEMATIC · " + row.copies + "/3 COPIES"
        : row.breakdown
          ? "EXPLODED VIEW · FIG. 2"
          : (row.tab === "handload"
              ? "HAND LOAD"
              : (row.tab || "").toUpperCase()) +
            " · YIELD " +
            (row.n || 1);
    let h =
      '<div class="craft-bpwrap">' +
      X.blueprint(row.art, {
        title: row.name,
        sub,
        parts: row.breakdown ? row.gives.length : row.parts.length,
      }) +
      "</div>";
    h +=
      "<h3>" +
      (row.breakdown ? "BREAK DOWN: " : "") +
      esc(row.name) +
      (row.n > 1 && !row.breakdown
        ? " <small>&times;" + row.n + "</small>"
        : "") +
      '<small class="own">IN INVENTORY ' +
      X.count(row.makes) +
      "</small></h3>";
    const text =
      row.kind === "schem" ? row.text : row.text || (def && def.desc) || "";
    if (text) h += '<p class="craft-note">' + esc(text) + "</p>";
    if (!row.breakdown) h += effectsLine(def);
    if (
      row.cond !== null &&
      row.cond !== undefined &&
      def &&
      def.hasCondition
    ) {
      h +=
        condBar(row.cond, undefined, "BUILT CND") +
        '<div class="craft-sub">' +
        (row.copies >= 3
          ? "All three schematics found: built in top condition."
          : "Find more copies of this schematic to build it in better condition.") +
        "</div>";
    } else if (
      row.kind === "schem" &&
      row.src === "cr" &&
      X.SCHEM[row.key] &&
      X.SCHEM[row.key].perCopy === "count"
    ) {
      h +=
        '<div class="craft-sub">' +
        row.copies +
        "/3 schematics: builds " +
        row.n +
        " per batch.</div>";
    }
    h +=
      "<h4>" +
      (row.breakdown ? "TAKES" : "COMPONENTS") +
      (q > 1 ? " <em>&times;" + q + "</em>" : "") +
      "</h4>" +
      partsList(row, q) +
      reqList(row);
    if (row.gives)
      h +=
        "<h4>YIELDS" +
        (q > 1 ? " <em>&times;" + q + "</em>" : "") +
        "</h4>" +
        givesList(row, q);
    // quantity selector + actions
    const qsel =
      !why && max > 1
        ? '<span class="craft-qty"><button data-act="qm">&minus;</button><b>' +
          q +
          '</b><button data-act="qp">+</button><em>/ ' +
          max +
          "</em></span>"
        : "";
    h +=
      '<div class="craft-btns">' +
      qsel +
      '<button data-act="primary" class="' +
      (why ? "off" : "") +
      '">' +
      (why
        ? esc(why.toUpperCase())
        : "<b>E</b> " + verbFor(row) + (q > 1 ? " &times;" + q : "")) +
      "</button>" +
      (!why && max > 1
        ? '<button data-act="max"><b>R</b> ALL &times;' + max + "</button>"
        : "") +
      "</div>";
    return h;
  }
