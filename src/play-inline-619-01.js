// play-inline-619 01 — page
// Lines 21-371 of readable/play-inline-619.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._uix;

  const defs = {};
  const status = {}; // id → {booted}
  const lockOf = {}; // terminal id → lock spec id
  let S = null; // active session
  let ui = null;
  const HISTORY = 48; // printed lines kept above the current page (the paper that has fed past)

  const arr = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const titleOf = (d) => {
    try {
      return String(
        (typeof d.title === "function" ? d.title() : d.title) || "",
      );
    } catch (e) {
      return "";
    }
  };

  // ------------------------------------------------------------------
  // Locks
  // ------------------------------------------------------------------
  /** The G.locks spec guarding terminal id (registered on G.terminals.register), or null. */
  function lockSpec(id) {
    const lid = lockOf[id];
    return lid ? G.locks.get(lid) : null;
  }
  function registerLock(id, def) {
    delete lockOf[id];
    const L = def.lock;
    if (L && typeof L === "object") {
      const s = G.locks.register(
        Object.assign(
          { kind: "terminal", label: titleOf(def) || X.prettify(id) },
          L,
          { id: L.id || "terminal:" + id },
        ),
      );
      if (s) lockOf[id] = s.id;
      return;
    }
    if (L)
      console.warn(
        '[terminals] terminal "' +
          id +
          '": lock must be a {id, passcode|code|key} spec — ignored',
      );
  }
  /** Lock ids taught by terminal entries: Map lock id → [labels] (for G.locks.audit). */
  function learnSources() {
    const out = new Map();
    const add = (lid, l) => {
      if (!out.has(lid)) out.set(lid, []);
      out.get(lid).push(l);
    };
    const walk = (list, id, trail, depth) => {
      if (!Array.isArray(list) || depth > 6) return;
      for (const e of list) {
        if (!e) continue;
        const t =
          trail + " / " + (typeof e.title === "function" ? "?" : e.title);
        for (const lid of arr(e.learn)) add(lid, "terminal " + id + t);
        walk(e.entries, id, t, depth + 1);
      }
    };
    for (const id in defs) {
      for (const lid of arr(defs[id].learn)) add(lid, "terminal " + id);
      walk(defs[id].entries, id, "", 0);
    }
    return out;
  }

  // ------------------------------------------------------------------
  // DOM: a teleprinter
  // ------------------------------------------------------------------
  function buildUI() {
    const root = G.ui.el("div", "ui-screen term-screen");
    root.innerHTML =
      '<div class="tty">' +
      '<div class="tty-top"><span class="tty-brand">MERIDIAN DATA <i>TELEPRINTER T-9</i></span><span class="tty-lamp"><i></i>ON LINE</span></div>' +
      '<div class="tty-window">' +
      '<div class="tty-holes l"></div><div class="tty-holes r"></div>' +
      '<div class="tty-paper"><div class="tty-text"></div></div>' +
      '<div class="tty-dots"></div><div class="tty-shade"></div>' +
      "</div>" +
      '<div class="tty-plate">' +
      '<span class="tty-key" data-k="up">&#9650;</span><span class="tty-key" data-k="down">&#9660;</span>' +
      '<span class="tty-key wide" data-k="return">RETURN</span><span class="tty-key" data-k="feed">LINE<br>FEED</span>' +
      '<span class="tty-key red" data-k="break">BREAK</span><span class="tty-key" data-k="off">LOG<br>OFF</span>' +
      "</div>" +
      "</div>";
    ui = {
      root,
      text: root.querySelector(".tty-text"),
      win: root.querySelector(".tty-window"),
      paper: root.querySelector(".tty-paper"),
      holes: root.querySelectorAll(".tty-holes"),
      feed: 0,
      lastCount: 0,
      history: [],
    };
    root.querySelectorAll(".tty-key").forEach((k) => {
      k.onmousedown = (e) => {
        e.preventDefault();
        k.classList.remove("down");
        void k.offsetWidth;
        k.classList.add("down");
        plateKey(k.dataset.k);
      };
    });
    if (!G.SHOT) root.classList.add("tty-on");
    fitFont();
  }
  function plateKey(k) {
    if (!S) return;
    X.sfx("teletype_key", { volume: 0.5 }, "terminal_type");
    const map = {
      up: "ArrowUp",
      down: "ArrowDown",
      return: "Enter",
      feed: "LineFeed",
      break: "Escape",
      off: "LogOff",
    };
    screen.onKey(map[k] || "");
  }
  function fitFont() {
    if (!ui) return;
    const h = ui.win.clientHeight || window.innerHeight * 0.7;
    const w = ui.win.clientWidth || window.innerWidth * 0.8;
    const fs = Math.max(
      14,
      Math.min(26, Math.floor(h / 22.5), Math.floor((w - 110) / 80 / 0.5)),
    );
    ui.fs = fs;
    ui.text.style.fontSize = fs + "px";
    ui.lh = Math.round(fs * 1.12);
    ui.lines = Math.max(10, Math.floor((h - fs * 1.6) / ui.lh));
    ui.cols = Math.max(
      36,
      Math.min(76, Math.floor((w - 110) / (fs * 0.5)) - 2),
    );
    for (const ho of ui.holes)
      ho.style.backgroundSize = "100% " + ui.lh * 2 + "px";
  }
  G.events.on("resize", () => {
    if (ui) {
      fitFont();
      if (S) renderPage();
    }
  });

  // ------------------------------------------------------------------
  // Printer: pages print line by line onto paper that feeds upward
  // ------------------------------------------------------------------
  // page = {lines:[{t, cls?, act?}], sel, reveal, total, cps, onDone}
  function setPage(lines, opts) {
    opts = opts || {};
    // the page that was on the platen feeds up into the history (dimmed), then a perforation
    if (S.page && ui) {
      for (const l of S.page.lines)
        ui.history.push({ t: l.t, cls: (l.cls || "") + " old" });
      if (opts.tear) ui.history.push({ t: "", cls: "tty-tear" });
      if (ui.history.length > HISTORY)
        ui.history.splice(0, ui.history.length - HISTORY);
    }
    const total = lines.reduce((s, l) => s + l.t.length + 1, 0);
    S.page = {
      lines,
      sel: opts.noSel ? -1 : opts.sel || 0,
      reveal: opts.instant ? total : 0,
      total,
      cps: opts.cps || 420,
      onDone: opts.onDone || null,
      doneFired: false,
    };
    S.page.items = lines.map((l, i) => (l.act ? i : -1)).filter((i) => i >= 0);
    if (S.page.sel >= S.page.items.length) S.page.sel = 0;
    if (opts.noSel) S.page.sel = -1;
    if (ui) ui.lastCount = ui.history.length;
    renderPage();
  }
  function renderPage() {
    if (!ui || !S || !S.page) return;
    const pg = S.page;
    let left = pg.reveal;
    const html = [];
    for (const h of ui.history)
      html.push(
        '<div class="' + h.cls + '">' + (X.esc(h.t) || "&nbsp;") + "</div>",
      );
    let printing = -1;
    pg.lines.forEach((l, i) => {
      if (left <= 0) return;
      const vis = l.t.slice(0, Math.max(0, left));
      if (left < l.t.length + 1) printing = i;
      left -= l.t.length + 1;
      const selIdx = pg.items.indexOf(i);
      const done = pg.reveal >= pg.total;
      const isSel = l.act && selIdx === pg.sel && done;
      let body = X.esc(vis) || "&nbsp;";
      if (l.input && done)
        body =
          X.esc(l.t) +
          X.esc(S.typed || "") +
          '<span class="term-cursor"></span>';
      if (i === printing) body += '<span class="tty-head"></span>';
      html.push(
        '<div class="' +
          (l.act ? "term-item " : "") +
          (l.cls || "") +
          '" data-i="' +
          i +
          '">' +
          (isSel ? '<span class="term-sel">' + body + "</span>" : body) +
          "</div>",
      );
    });
    if (pg.reveal >= pg.total && !pg.lines.some((l) => l.input))
      html.push('<div>&gt;<span class="term-cursor"></span></div>');
    ui.text.innerHTML = html.join("");
    // paper feed: one line up per new printed line (sprocket holes travel with it)
    const count =
      ui.history.length + (printing >= 0 ? printing + 1 : pg.lines.length);
    if (count > ui.lastCount) {
      ui.feed += count - ui.lastCount;
      for (const ho of ui.holes)
        ho.style.backgroundPosition = "0 " + -ui.feed * ui.lh + "px";
      if (!G.SHOT) {
        const t = ui.text;
        t.style.transition = "none";
        t.style.transform = "translateY(" + ui.lh + "px)";
        void t.offsetHeight;
        t.style.transition = "transform 70ms linear";
        t.style.transform = "none";
      }
      if (S.mode !== "boot" || ui.feed % 2 === 0)
        X.sfx("teletype_feed", { volume: 0.12 }, null);
    }
    ui.lastCount = count;
    Array.from(ui.text.querySelectorAll(".term-item")).forEach((el) => {
      const i = Number(el.dataset.i);
      el.onmouseenter = () => {
        const k = pg.items.indexOf(i);
        if (k >= 0 && k !== pg.sel && pg.reveal >= pg.total) {
          pg.sel = k;
          renderPage();
          X.sfx("teletype_key", { volume: 0.2 }, "terminal_type");
        }
      };
      el.onclick = () => {
        if (pg.reveal < pg.total) {
          finishPrint();
          return;
        }
        const k = pg.items.indexOf(i);
        if (k >= 0) {
          pg.sel = k;
          activateLine();
        }
      };
    });
  }
  function finishPrint() {
    const pg = S && S.page;
    if (!pg) return;
    pg.reveal = pg.total;
    renderPage();
    if (pg.onDone && !pg.doneFired) {
      pg.doneFired = true;
      pg.onDone();
    }
  }
  function activateLine() {
    const pg = S.page;
    if (!pg) return;
    const li = pg.items[pg.sel];
    if (li === undefined) {
      X.sfx("teletype_bell", { volume: 0.3 }, "ui_error");
      return;
    }
    const l = pg.lines[li];
    X.sfx("teletype_key", { volume: 0.55 }, "terminal_enter");
    if (l.act) l.act();
  }
  let chatter = 0;
  function tickPrinter(dt) {
    const pg = S && S.page;
    if (!pg || pg.reveal >= pg.total) return;
    const before = pg.reveal;
    pg.reveal = Math.min(pg.total, pg.reveal + pg.cps * dt);
    chatter += dt;
    if (chatter > 0.07 && Math.floor(pg.reveal) !== Math.floor(before)) {
      chatter = 0;
      X.sfx(
        "teletype_print",
        { volume: 0.22, pitch: 0.92 + Math.random() * 0.16 },
        "terminal_type",
      );
    }
    renderPage();
    if (pg.reveal >= pg.total && pg.onDone && !pg.doneFired) {
      pg.doneFired = true;
      pg.onDone();
    }
  }

  // ------------------------------------------------------------------
  // Screens
  // ------------------------------------------------------------------
  function headerLines() {
    const d = S.def;
    const out = [
      { t: "MERIDIAN TIME-SHARE NETWORK  --  " + S.line, cls: "term-c" },
      { t: "" },
    ];
    const title = titleOf(d);
    if (title) out.push({ t: title.toUpperCase(), cls: "term-c" });
    let hdr = typeof d.header === "function" ? d.header() : d.header;
    if (hdr)
      String(hdr)
        .split("\n")
        .forEach((h) => out.push({ t: h, cls: "term-c" }));
    out.push({ t: "" });
    return out;
  }

  function bootThen(next) {
    S.mode = "boot";
    const lines = [
      { t: ">CONNECT " + S.line },
      { t: "MERIDIAN DATA TELEPRINTER T-9 -- SERIAL " + S.serial },
      { t: "CORE STORE ......... 32K WORDS OK" },
      { t: "TAPE UNIT .......... READY" },
      { t: "TRUNK .............. CIVIL DEFENSE NET [NO CARRIER]" },
      { t: "LOCAL STORE ........ RESTORED (LAST SYNC 1967)" },
      { t: "" },
    ];
    setPage(lines, {
      cps: 760,
      onDone: () =>
        setTimeout(() => {
          if (S) next();
        }, 220),
    });
  }

  /** True when the current session may see the entries (no lock, or unlocked). */
