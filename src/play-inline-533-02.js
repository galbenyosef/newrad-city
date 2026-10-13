// play-inline-533 02 — row
// Lines 362-709 of readable/play-inline-533.pretty.js (statement-aligned).
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
