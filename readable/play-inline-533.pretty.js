/* src/crafting/30_ui.js */
/* =====================================================================
 * NEW RAD CITY — CRAFTING · 30_ui.js
 * The crafting screen (state `crafting`, world paused, cursor free):
 *   WORKBENCH: SCHEMATICS · WORKSHOP · CHEMISTRY · MODIFY · REPAIR
 *   CAMPFIRE:  COOKING · REMEDIES
 *   RELOADING BENCH: HAND LOAD · BREAK DOWN · RECYCLE
 * VIGIL goggles readout style (pale cyan-white vector text on a dark
 * blue-grey field, bracketed headers): list on the left, a schematic
 * blueprint with numbered callouts + components/requirements on the right.
 * Quantity selector, MODIFY shows every mod slot of a weapon with a
 * before/after stat comparison, REPAIR previews the gain.
 * Keys: W/S select · A/D tab · E build/install/repair · Z/C quantity −/+ ·
 *       R build max · 1-9 repair method / mod (REPAIR, MODIFY) or tab jump ·
 *       Esc/Tab close.
 * ===================================================================== */
(function () {
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
  function givesList(row, times) {
    return (
      '<ol class="craft-parts yields">' +
      row.gives
        .map(
          ([id, n], i) =>
            '<li class="ok"><u>' +
            (i + 1) +
            "</u><span>" +
            esc(X.name(id)) +
            (n > 1 ? " &times;" + n : "") +
            "</span><i>+" +
            n * (times || 1) +
            " <small>(" +
            X.count(id) +
            ")</small></i></li>",
        )
        .join("") +
      "</ol>"
    );
  }

  // ---- MODIFY: one weapon, its mod slots, before/after stats ----
  const DEG = 57.2958;
  // [label, get(weapon block, pv), fmt, better direction (+1 = higher is better), always shown]
  const STAT_ROWS = [
    [
      "DAMAGE",
      (w, pv) => w.damage * (w.pellets || 1) * pv.cm.damage,
      (v) => Math.round(v),
      1,
      true,
    ],
    [
      "DAM / SEC",
      (w, pv) => w.damage * (w.pellets || 1) * (w.rof || 1) * pv.cm.damage,
      (v) => Math.round(v),
      1,
      false,
    ],
    ["MAGAZINE", (w) => w.magSize || 0, (v) => Math.round(v), 1, true],
    ["RELOAD", (w) => w.reloadTime || 0, (v) => v.toFixed(1) + " s", -1, false],
    [
      "AIM SPREAD",
      (w, pv) => (w.adsSpread || 0) * DEG * pv.cm.spread,
      (v) => v.toFixed(2) + "&deg;",
      -1,
      false,
    ],
    [
      "HIP SPREAD",
      (w, pv) => (w.spread || 0) * DEG * pv.cm.spread,
      (v) => v.toFixed(2) + "&deg;",
      -1,
      false,
    ],
    ["RANGE", (w) => w.range || 0, (v) => Math.round(v) + " m", 1, false],
    [
      "ZOOM",
      (w) => w.scope || 0,
      (v) => (v ? v.toFixed(1) + "x SCOPE" : "IRON SIGHTS"),
      1,
      false,
    ],
    [
      "REPORT",
      (w) => (w.silenced ? 1 : 0),
      (v) => (v ? "SUPPRESSED" : "LOUD"),
      1,
      false,
    ],
  ];
  /** ▲/▼ follow the number; bright/red follow whether that is good (lower spread is a bright ▼). */
  const arrow = (a, b) => (b > a ? " &#9650;" : " &#9660;");
  X.arrow = arrow;
  function statCompare(pv) {
    if (!pv) return "";
    pv.cm = X.condMults(pv.def.id, pv.cond);
    const cnd = pct(pv.cond);
    let h = '<table class="craft-cmp">';
    for (const [label, get, fmt, dir, always] of STAT_ROWS) {
      const a = +get(pv.now, pv) || 0;
      const b = pv.next ? +get(pv.next, pv) || 0 : a;
      const changed = Math.abs(a - b) > 1e-6;
      if (!changed && !always) continue;
      if (label === "MAGAZINE" && !a) continue;
      const better = changed && (b - a) * dir > 0;
      const lab =
        label === "DAMAGE" && cnd < 100
          ? "DAM <em>(CND " + cnd + "%)</em>"
          : label;
      h +=
        '<tr class="' +
        (changed ? (better ? "up" : "down") : "") +
        '"><th>' +
        lab +
        "</th><td>" +
        fmt(a) +
        "</td>" +
        (pv.next
          ? '<td class="ar">' +
            (changed ? "&#9656;" : "") +
            "</td><td>" +
            (changed ? fmt(b) + arrow(a, b) : "") +
            "</td>"
          : "") +
        "</tr>";
    }
    return h + "</table>";
  }
  function weaponArt(def) {
    const w = (def && def.weapon) || {};
    if (w.reloadType === "melee") return "blade";
    return (def.weight || 0) <= 4.5 && !w.scope ? "pistol" : "rifle";
  }
  const MOD_SLOTS = 3; // up to three mods per weapon
  function modwInfo(row) {
    if (UI.sub >= row.mods.length) UI.sub = 0;
    const m = row.mods[UI.sub];
    let h =
      '<div class="craft-bpwrap">' +
      X.blueprint(weaponArt(row.def), {
        title: row.def.name,
        sub: "MODS · " + row.nInst + "/" + MOD_SLOTS + " SLOTS USED",
        parts: Math.min(MOD_SLOTS, row.mods.length),
      }) +
      "</div>";
    h +=
      "<h3>" +
      esc(row.def.name) +
      (row.equipped ? ' <small class="eq">EQUIPPED</small>' : "") +
      "</h3>";
    h += '<h4>MOD SLOTS</h4><ol class="craft-methods craft-mods">';
    for (let i = 0; i < MOD_SLOTS; i++) {
      const x = row.mods[i];
      if (!x) {
        h +=
          '<li class="empty"><u>' +
          (i + 1) +
          "</u><span>" +
          (i === 0 && !row.mods.length
            ? "No mods available for this weapon"
            : "&mdash; EMPTY SLOT &mdash;") +
          "</span><i></i></li>";
        continue;
      }
      const st = x.installed
        ? "INSTALLED"
        : x.have
          ? "&times;" + x.have + " CARRIED"
          : x.craft && x.can
            ? "BUILD &amp; INSTALL"
            : "NOT CARRIED";
      h +=
        '<li data-act="s' +
        i +
        '" class="' +
        (i === UI.sub ? "cur " : "") +
        (x.installed ? "inst" : x.can ? "ok" : "no") +
        '"><u>' +
        (i + 1) +
        "</u><span>" +
        esc(x.name) +
        (x.effect ? " <small>" + esc(x.effect) + "</small>" : "") +
        "</span><i>" +
        st +
        "</i></li>";
    }
    // (more than three fitting mods: the rest listed below the slots)
    for (let i = MOD_SLOTS; i < row.mods.length; i++) {
      const x = row.mods[i];
      h +=
        '<li data-act="s' +
        i +
        '" class="' +
        (i === UI.sub ? "cur " : "") +
        (x.installed ? "inst" : x.can ? "ok" : "no") +
        '"><u>' +
        (i + 1) +
        "</u><span>" +
        esc(x.name) +
        "</span><i>" +
        (x.installed ? "INSTALLED" : x.have ? "&times;" + x.have : "") +
        "</i></li>";
    }
    h += "</ol>";
    if (!row.mods.length) {
      h += "<h4>CURRENT</h4>" + statCompare(X.modPreview(row.wid, null));
      h +=
        '<div class="craft-sub">No one in Rad City is making parts for this weapon yet. Keep it repaired instead.</div>';
      return h;
    }
    const pv = X.modPreview(row.wid, m && !m.installed ? m.id : null);
    h +=
      "<h4>" +
      (m && !m.installed ? "WITH " + esc(m.name.toUpperCase()) : "CURRENT") +
      "</h4>" +
      statCompare(pv);
    const md = m && X.def(m.id);
    if (md && md.desc)
      h +=
        '<p class="craft-note small">' +
        esc(md.desc.replace(/ Fits: .*$/, "")) +
        "</p>";
    const ok = m && m.can && !m.installed;
    h +=
      '<div class="craft-btns"><button data-act="primary" class="' +
      (ok ? "" : "off") +
      '">' +
      (!m
        ? "&mdash;"
        : m.installed
          ? "INSTALLED"
          : ok
            ? "<b>E</b> " + (m.have ? "INSTALL" : "BUILD &amp; INSTALL")
            : esc((m.why || "CAN'T INSTALL").toUpperCase())) +
      "</button></div>";
    if (m && !m.installed)
      h +=
        '<div class="craft-sub">Installing a mod is permanent. It applies to every ' +
        esc(row.def.name) +
        " you carry." +
        (m.craft && !m.have
          ? " Building it here uses the WORKSHOP recipe."
          : "") +
        "</div>";
    return h;
  }
  function modInfo(row) {
    const md = X.def(row.modId),
      wd = X.def(row.wid);
    let h =
      '<div class="craft-bpwrap">' +
      X.blueprint(X.artFor(row.modId), {
        title: md ? md.name : row.modId,
        sub: "WEAPON MODIFICATION",
        parts: 0,
      }) +
      "</div>";
    h += "<h3>" + esc(md ? md.name : row.modId) + "</h3>";
    if (md && md.desc) h += '<p class="craft-note">' + esc(md.desc) + "</p>";
    h += "<h4>" + esc((wd ? wd.name : row.wid).toUpperCase()) + "</h4>";
    const inst = X.modsOf(row.wid).map((m) => X.name(m));
    h +=
      '<p class="craft-note">Installed: ' +
      (inst.length ? esc(inst.join(", ")) : "none") +
      "</p>";
    let cur = null;
    try {
      cur = G.weapons.current && G.weapons.current();
    } catch (e) {
      cur = null;
    }
    h += effectsLine(cur && cur.id === row.wid && cur.def ? cur.def : wd);
    const ok = X.canInstall(row);
    h +=
      '<div class="craft-btns"><button data-act="primary" class="' +
      (ok ? "" : "off") +
      '">' +
      (row.installed
        ? "INSTALLED"
        : ok
          ? "<b>E</b> INSTALL"
          : "CAN'T INSTALL") +
      "</button></div>";
    if (!row.installed)
      h +=
        '<div class="craft-sub">Installing a mod is permanent. It applies to every ' +
        esc(wd ? wd.name : row.wid) +
        " you carry.</div>";
    return h;
  }
  function repairInfo(row) {
    const methods = (UI.methods = X.repairMethods(row));
    const cap = X.repairCap();
    let h =
      "<h3>" +
      esc(row.def.name) +
      (row.count > 1 ? " <small>(" + row.count + ")</small>" : "") +
      (row.equipped ? ' <small class="eq">EQUIPPED</small>' : "") +
      "</h3>";
    if (row.def.desc)
      h += '<p class="craft-note">' + esc(row.def.desc) + "</p>";
    h += condBar(row.cond, cap);
    if (row.def.type === "weapon") {
      const best = methods
        .filter((m) => m.can)
        .sort((a, b) => b.gain - a.gain)[0];
      const c1 = Math.min(1, row.cond + (best ? best.gain : 0));
      const dm = (c) => Math.round(X.condMults(row.id, c).damage * 100),
        sp = (c) => Math.round(X.condMults(row.id, c).spread * 100);
      const cell = (a, b) =>
        best && b !== a
          ? '<td class="ar">&#9656;</td><td class="up">' +
            b +
            "%" +
            arrow(a, b) +
            "</td>"
          : "";
      h +=
        '<table class="craft-cmp"><tr><th>DAMAGE</th><td>' +
        dm(row.cond) +
        "%</td>" +
        cell(dm(row.cond), dm(c1)) +
        "</tr>" +
        "<tr><th>SPREAD</th><td>" +
        sp(row.cond) +
        "%</td>" +
        cell(sp(row.cond), sp(c1)) +
        "</tr></table>";
    }
    h +=
      '<div class="craft-sub">Mechanics ' +
      Math.round(X.skill("mechanics")) +
      ": combining parts can restore up to " +
      pct(cap) +
      "%." +
      (row.def.type === "weapon"
        ? " A Gunsmith Kit restores " +
          pct(X.kitGain()) +
          "% and ignores that limit."
        : "") +
      "</div>";
    h +=
      '<h4>REPAIR WITH</h4><ol class="craft-methods">' +
      methods
        .map(
          (m, i) =>
            '<li data-act="m' +
            i +
            '" class="' +
            (m.can ? "ok" : "no") +
            '"><u>' +
            (i + 1) +
            "</u><span>" +
            esc(m.label) +
            "</span><i>" +
            (m.can ? "+" + pct(m.gain) + "%" : esc(m.why)) +
            "</i></li>",
        )
        .join("") +
      "</ol>";
    return h;
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  function render() {
    if (!UI.el) return;
    UI.lastRender = performance.now();
    const tabs = tabsOf();
    if (UI.tab >= tabs.length) UI.tab = 0;
    const key = tabKey();
    UI.rows = rowsFor(key);
    if (UI.sel >= UI.rows.length) UI.sel = Math.max(0, UI.rows.length - 1);
    UI.el.dataset.station = UI.station;
    UI.titleEl.textContent =
      "[ " + (X.STATION_TITLE[UI.station] || "WORKBENCH") + " ]";
    const sk = (X.STATION_SKILLS && X.STATION_SKILLS[UI.station]) || [
      "mechanics",
      "electronics",
      "medicine",
    ];
    let wg = "";
    try {
      if (X.invReal() && !G.isStub("rpg"))
        wg =
          " · WG " +
          Math.round(G.inventory.weight()) +
          "/" +
          Math.round(G.rpg.carryWeight());
    } catch (e) {
      wg = "";
    }
    UI.skillsEl.textContent =
      sk
        .map(
          (k) =>
            (X.SKILL_NAMES[k] || k).toUpperCase() +
            " " +
            Math.round(X.skill(k)),
        )
        .join(" · ") + wg;
    UI.tabsEl.innerHTML = tabs
      .map(
        ([, label], i) =>
          '<b data-tab="' +
          i +
          '" class="' +
          (i === UI.tab ? "on" : "") +
          '">' +
          label +
          "</b>",
      )
      .join("");
    // list
    let list = "";
    UI.rows.forEach((r, i) => {
      let label = "",
        tag = "",
        dim = false;
      if (r.type === "recipe") {
        label = esc(r.name) + (r.n > 1 ? " <small>(" + r.n + ")</small>" : "");
        if (r.kind === "schem")
          tag =
            '<i class="cp">' +
            "&#9632;".repeat(Math.min(3, r.copies)) +
            "&#9633;".repeat(Math.max(0, 3 - r.copies)) +
            "</i>";
        else {
          const u = X.unmetReq(r),
            ks = Object.keys(r.req || {});
          tag = ks.length
            ? '<i class="' +
              (u ? "bad" : "") +
              '">' +
              ks.map((k) => (SK_ABBR[k] || k) + " " + r.req[k]).join(" ") +
              "</i>"
            : r.cat
              ? "<i>" + esc(r.cat) + "</i>"
              : "";
        }
        dim = !!X.blocker(r, 1);
      } else if (r.type === "modw") {
        label =
          (r.equipped ? '<span class="eqd">&#9632;</span> ' : "") +
          esc(r.def.name);
        const ready = r.mods.filter((m) => m.can && !m.installed).length;
        tag = !r.mods.length
          ? "<i>NO MODS</i>"
          : '<i class="cp">' +
            "&#9632;".repeat(r.nInst) +
            "&#9633;".repeat(Math.max(0, 3 - r.nInst)) +
            (ready ? ' <b class="rdy">+' + ready + "</b>" : "") +
            "</i>";
        dim = !ready;
      } else {
        label =
          (r.equipped ? '<span class="eqd">&#9632;</span> ' : "") +
          esc(r.def.name) +
          (r.count > 1 ? " <small>(" + r.count + ")</small>" : "");
        tag =
          '<i class="cbar"><span style="width:' +
          pct(r.cond) +
          '%"></span></i>';
        dim = r.cond >= 0.999;
      }
      list +=
        '<li data-row="' +
        i +
        '" class="' +
        (i === UI.sel ? "sel " : "") +
        (dim ? "dim" : "") +
        '"><span>' +
        label +
        "</span>" +
        tag +
        "</li>";
    });
    if (!list) list = '<li class="empty">' + esc(emptyText(key)) + "</li>";
    UI.listEl.innerHTML = list;
    // info
    const r = UI.rows[UI.sel];
    UI.methods = null;
    UI.infoEl.innerHTML = !r
      ? '<div class="craft-glyph-big">' +
        stationGlyph(UI.station, true) +
        "</div>"
      : r.type === "recipe"
        ? recipeInfo(r)
        : r.type === "modw"
          ? modwInfo(r)
          : r.type === "mod"
            ? modInfo(r)
            : repairInfo(r);
    layoutInfo(UI.infoEl);
    UI.msgEl.textContent = UI.msg;
    UI.msgEl.classList.toggle("bad", !!UI.msgBad);
    UI.footEl.innerHTML = footer(key);
    const selEl = UI.listEl.querySelector(".sel");
    if (selEl && selEl.scrollIntoView) {
      try {
        selEl.scrollIntoView({ block: "nearest" });
      } catch (e) {
        /* ignore */
      }
    }
  }
  // Split the info column into a scrolling body and a fixed action footer, so the
  // E / R button row never covers the last lines of a long description (it used to be
  // position:sticky inside the scroller and overlapped the text at first glance).
  function layoutInfo(el) {
    if (!el || !el.firstChild) return;
    const btns = el.querySelector(":scope > .craft-btns");
    const body = document.createElement("div");
    body.className = "craft-scroll";
    while (el.firstChild) body.appendChild(el.firstChild);
    if (btns) body.removeChild(btns);
    el.appendChild(body);
    if (btns) {
      btns.classList.add("craft-dock");
      el.appendChild(btns);
    }
    // fade + "more" cue while there is text below the fold; cleared once scrolled to the end
    // (measured on the last element's box, not scrollHeight, so trailing margins don't raise a false cue)
    const more = () => {
      const last = body.lastElementChild;
      let cut = false;
      try {
        cut =
          !!last &&
          last.getBoundingClientRect().bottom -
            body.getBoundingClientRect().bottom >
            4;
      } catch (e) {
        cut = false;
      }
      body.classList.toggle("more", cut);
    };
    body.addEventListener("scroll", more, { passive: true });
    more();
    // the screen scales/fades in and webfonts can land late: re-measure whenever the scroller resizes
    try {
      if (UI.infoRO) UI.infoRO.disconnect();
      if (typeof ResizeObserver === "function") {
        UI.infoRO = new ResizeObserver(more);
        UI.infoRO.observe(body);
      }
    } catch (e) {
      UI.infoRO = null;
    }
    requestAnimationFrame(more);
  }
  function emptyText(key) {
    switch (key) {
      case "schematics":
        return "No schematics known. Schematic diagrams are hidden all over the city: find one, then come back here to build it.";
      case "modify":
        return "None of the weapons you carry take mods. 10mm pistols and SMGs, assault rifles, hunting-class rifles, the .44 and gyrojets can all be modified.";
      case "handload":
        return "You don't know how to load anything here.";
      case "breakdown":
        return "You carry no cartridges to break down.";
      case "repair":
        return "You carry nothing that needs repairing.";
      default:
        return "Nothing you can make here.";
    }
  }
  function footer(key) {
    const k = (a, b) => "<span><b>" + a + "</b> " + b + "</span>";
    const r = UI.rows[UI.sel];
    const main =
      key === "repair"
        ? k("1-" + Math.max(1, (UI.methods || []).length), "REPAIR") +
          k("E", "BEST")
        : key === "modify"
          ? k("1-9", "MOD") + k("E", "INSTALL")
          : k("E", r && r.type === "recipe" ? verbFor(r) : "BUILD") +
            k("Z/C", "QTY") +
            k("R", "ALL");
    return main + k("W/S", "SELECT") + k("A/D", "TAB") + k("ESC", "EXIT");
  }
  function flash(msg, bad) {
    UI.msg = msg || "";
    UI.msgBad = !!bad;
    UI.msgT = 2.8;
    if (UI.msgEl) {
      UI.msgEl.textContent = UI.msg;
      UI.msgEl.classList.toggle("bad", !!bad);
    }
  }
  X.flash = flash;

  // ------------------------------------------------------------------
  // Actions
  // ------------------------------------------------------------------
  function select(i) {
    if (!UI.rows.length) return;
    const n = UI.rows.length;
    UI.sel = ((i % n) + n) % n;
    UI.sub = 0;
    UI.qty = 1;
    X.sfx("ui_hover", { volume: 0.25 });
    render();
  }
  function setQty(d) {
    const r = UI.rows[UI.sel];
    if (!r || r.type !== "recipe" || X.blocker(r, 1)) return;
    const max = Math.max(1, X.maxTimes(r, capFor(r)));
    const q = Math.max(1, Math.min(max, UI.qty + d));
    if (q !== UI.qty) {
      UI.qty = q;
      X.sfx("ui_hover", { volume: 0.22, pitch: 1.2 });
      render();
    }
  }
  function setTab(i) {
    const n = tabsOf().length;
    UI.tab = ((i % n) + n) % n;
    UI.sel = 0;
    UI.sub = 0;
    UI.qty = 1;
    X.sfx("ui_tab", { volume: 0.5 });
    render();
  }
  function act(kind) {
    const r = UI.rows[UI.sel];
    if (!r) {
      X.sfx("ui_error", { volume: 0.4 });
      return;
    }
    if (kind === "qm" || kind === "qp") {
      setQty(kind === "qm" ? -1 : 1);
      return;
    }
    if (kind && kind[0] === "s" && r.type === "modw") {
      UI.sub = Math.max(0, Math.min(r.mods.length - 1, +kind.slice(1)));
      X.sfx("ui_hover", { volume: 0.25 });
      render();
      return;
    }
    let res = null;
    if (r.type === "recipe") {
      let times = Math.max(1, UI.qty);
      if (kind === "max") times = Math.max(1, X.maxTimes(r, capFor(r)));
      res = X.craft(r, times, UI.station);
      if (res.ok) {
        flash(
          res.broken
            ? X.name(res.made) +
                (res.n > 1 ? " (" + res.n + ")" : "") +
                " broken down into components."
            : X.name(res.made) +
                (res.n > 1 ? " (" + res.n + ")" : "") +
                (UI.station === "campfire" && r.tab === "cooking"
                  ? " cooked."
                  : UI.station === "reloading"
                    ? r.tab === "recycle"
                      ? " recharged."
                      : " loaded."
                    : " built."),
        );
        UI.qty = 1;
      }
    } else if (r.type === "modw") {
      const m = r.mods[UI.sub];
      res = X.installModRow(r, m);
      if (res.ok) flash(m.name + " installed on " + r.def.name + ".");
    } else if (r.type === "mod") {
      if (r.installed) return;
      res = X.installMod(r);
      if (res.ok)
        flash(X.name(r.modId) + " installed on " + X.name(r.wid) + ".");
    } else if (r.type === "repair") {
      const ms = X.repairMethods(r);
      let m = null;
      if (kind && kind[0] === "m") m = ms[+kind.slice(1)];
      else
        m =
          ms
            .filter((x) => x.can)
            .sort(
              (a, b) =>
                (a.key === "kit") - (b.key === "kit") || b.gain - a.gain,
            )[0] || ms[0];
      res = X.repair(r, m);
      if (res.ok)
        flash(
          r.def.name +
            " repaired: " +
            pct(res.cond) +
            "% (+" +
            pct(res.gain) +
            "%).",
        );
    }
    if (res && !res.ok) {
      flash(res.reason || "Can't do that.", true);
      X.sfx("ui_error", { volume: 0.5 });
    }
    render();
  }
  X.act = act;
  X.setTab = setTab;

  // ------------------------------------------------------------------
  // Open / close
  // ------------------------------------------------------------------
  /** Open a station screen ('workbench' | 'campfire'). Returns true when the screen is (already) up. */
  C.open = function (station, opts) {
    opts = opts || {};
    station = X.TABS[station] ? station : "workbench";
    if (UI.open && UI.station === station) return true;
    if (G.state !== "play" && G.state !== "crafting" && !opts.force)
      return false;
    // the weapons module's own workbench screen must never be up at the same time
    try {
      if (
        !G.isStub("weapons") &&
        G.weapons.isWorkbenchOpen &&
        G.weapons.isWorkbenchOpen() &&
        G.weapons.closeWorkbench
      )
        G.weapons.closeWorkbench();
    } catch (e) {
      /* ignore */
    }
    build();
    const wasOpen = UI.open;
    UI.open = true;
    UI.station = station;
    UI.bench = opts.bench || null;
    UI.msg = "";
    UI.msgT = 0;
    UI.sel = 0;
    UI.sub = 0;
    UI.qty = 1;
    if (opts.tab !== undefined) {
      const i =
        typeof opts.tab === "number"
          ? opts.tab
          : tabsOf().findIndex((t) => t[0] === opts.tab);
      UI.tab = Math.max(0, i);
    } else if (station === "workbench")
      UI.tab = X.recipes("workbench", "schematics").length ? 0 : 1;
    else UI.tab = 0;
    UI.glyphEl.innerHTML = stationGlyph(station, false);
    if (G.state !== "crafting") G.setState("crafting", { station });
    UI.el.classList.remove("craft-hidden");
    if (!wasOpen)
      X.sfx(X.hasSfx("ui_open") ? "ui_open" : "ui_select", { volume: 0.5 });
    if (station === "campfire") X.sfx("fire_loop", { volume: 0.25 });
    render();
    G.events.emit("craftingOpen", station);
    return true;
  };
  C.close = function () {
    if (!UI.open) return;
    UI.open = false;
    if (UI.el) UI.el.classList.add("craft-hidden");
    try {
      const I = G.input;
      for (const k in I.pressed) I.pressed[k] = false;
    } catch (e) {
      /* ignore */
    }
    if (G.state === "crafting") G.setState("play");
    X.sfx("ui_back", { volume: 0.4 });
    G.events.emit("craftingClose", UI.station);
  };
  /** Hide without touching G.state (reset / state already changed). */
  X.hide = function () {
    if (!UI.open) return;
    UI.open = false;
    if (UI.el) UI.el.classList.add("craft-hidden");
    G.events.emit("craftingClose", UI.station);
  };
  C.isOpen = () => UI.open;
  C.station = () => (UI.open ? UI.station : null);
  X.render = render;

  // ------------------------------------------------------------------
  // Input (only while open)
  // ------------------------------------------------------------------
  G.events.on("keydown", (code, e) => {
    if (!UI.open || G.state !== "crafting") return;
    const k = code || (e && e.key) || "";
    const rep = !!(e && e.repeat);
    let used = true;
    if (k === "Escape" || k === "Tab" || k === "Backspace") {
      if (!rep) C.close();
    } else if (k === "ArrowUp" || k === "KeyW") select(UI.sel - 1);
    else if (k === "ArrowDown" || k === "KeyS") select(UI.sel + 1);
    else if (k === "KeyZ" || k === "Minus" || k === "NumpadSubtract")
      setQty(e && e.shiftKey ? -10 : -1);
    else if (k === "KeyC" || k === "Equal" || k === "NumpadAdd")
      setQty(e && e.shiftKey ? 10 : 1);
    else if (k === "ArrowLeft" || k === "KeyA" || k === "KeyQ") {
      if (!rep) setTab(UI.tab - 1);
    } else if (k === "ArrowRight" || k === "KeyD") {
      if (!rep) setTab(UI.tab + 1);
    } else if (k === "PageDown") {
      if (UI.rows.length) select(Math.min(UI.rows.length - 1, UI.sel + 8));
    } else if (k === "PageUp") {
      if (UI.rows.length) select(Math.max(0, UI.sel - 8));
    } else if (
      k === "Enter" ||
      k === "NumpadEnter" ||
      k === "KeyE" ||
      k === "Space"
    ) {
      if (!rep) act("primary");
    } else if (k === "KeyR") {
      if (!rep && tabKey() !== "repair" && tabKey() !== "modify") act("max");
    } else if (/^Digit[1-9]$/.test(k)) {
      const n = +k.slice(5);
      if (rep) {
        /* ignore */
      } else if (tabKey() === "repair") act("m" + (n - 1));
      else if (tabKey() === "modify") {
        const r = UI.rows[UI.sel];
        if (r && r.mods && n <= r.mods.length) act("s" + (n - 1));
      } else if (n <= tabsOf().length) setTab(n - 1);
    } else used = false;
    if (used) {
      try {
        G.input.consume(k);
      } catch (err) {
        /* ignore */
      }
      if (e && e.preventDefault) e.preventDefault();
    }
  });

  // Every UI screen hides itself when the state leaves it (cheats can jump anywhere).
  G.events.on("state", (s) => {
    if (s === "crafting") {
      if (!UI.open) {
        // someone set the state directly (shot mode / debug): come up on the requested station
        const st = (G.QS && G.QS.get("craftStation")) || "workbench";
        const tb = G.QS && G.QS.get("craftTab");
        C.open(st, { tab: tb || undefined, force: true });
      }
      return;
    }
    X.hide();
  });
  G.events.on("inventoryChanged", () => {
    if (UI.open && performance.now() - UI.lastRender > 30) render();
  });

  /** Per-frame UI upkeep (message fade), called from the module update. */
  X.uiUpdate = function (realDt) {
    if (!UI.open || UI.msgT <= 0) return;
    UI.msgT -= realDt;
    if (UI.msgT <= 0) {
      UI.msg = "";
      if (UI.msgEl) UI.msgEl.textContent = "";
    }
  };
})();
