/* src/ui_interact/30_terminal.js */
/* =====================================================================
 * NEW RAD CITY — ui_interact / 30_terminal.js
 * G.terminals — teletype / mainframe terminals (REBRAND §6).
 *  - A teleprinter on a time-share line: amber dot-matrix type on black
 *    continuous paper that feeds upward (sprocket holes, tear perforations),
 *    print-head chatter, and a key plate with a few physical keys.
 *  - Boot banner, menu of entries (nested entries, paginated text, actions,
 *    cond), RETURN / BREAK to go back.
 *  - Locked terminals ask for their passcode (G.locks, 25_locks.js). The
 *    passcode can be typed (a guess works too), picked from the codes on file,
 *    or bypassed with the lock's key item.
 *  - X.terminal.prompt(spec, onOk) — the same passcode prompt for any lock
 *    with a `passcode` (doors, safes) opened through G.locks.open.
 *
 * Register: G.terminals.register(id, {title, header, lock?:{id, passcode, key?}, learn?,
 *            entries:[{title, text|fn, action?(entry,id)→string?, cond?, entries?, learn?:'lock_id'|[...]}], onUnlock?(id)})
 * Sound ids: teletype_on, teletype_off, teletype_print, teletype_key, teletype_feed, teletype_bell, teletype_accept
 * ===================================================================== */
(function () {
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
  function accessOk() {
    if (!S) return false;
    if (S.promptOnly) return false;
    const s = S.lock;
    if (!s) return true;
    return G.locks.isOpen(s.id);
  }
  function showGate(msg) {
    S.mode = "gate";
    S.stack = [];
    S.typed = "";
    S.navigated = false;
    const s = S.lock;
    const lines = [];
    if (msg) lines.push({ t: msg, cls: "term-warn" }, { t: "" });
    else {
      lines.push(
        { t: "*** ACCESS RESTRICTED ***", cls: "term-c" },
        { t: String(s.label || "").toUpperCase(), cls: "term-c" },
        { t: "" },
      );
      lines.push({ t: "TYPE THE PASSCODE AND PRESS RETURN." }, { t: "" });
    }
    lines.push({ t: "PASSCODE: ", input: true }, { t: "" });
    if (G.locks.isKnown(s.id) && s.passcode)
      lines.push({
        t: "> [USE PASSCODE ON FILE: " + s.passcode + "]",
        act: () => submitPass(s.passcode),
      });
    if (s.key && X.invCount(s.key) > 0)
      lines.push({
        t: "> [INSERT " + X.itemName(s.key).toUpperCase() + "]",
        act: useKey,
      });
    lines.push({
      t: S.promptOnly ? "> [CANCEL]" : "> [LOG OFF]",
      act: () => T.close(),
    });
    setPage(lines, { cps: msg ? 900 : 620, tear: !msg, noSel: true });
  }
  function useKey() {
    const s = S.lock;
    if (s.consume) X.invRemove(s.key, 1);
    accept("KEY ACCEPTED.", null, "key");
  }
  function submitPass(word) {
    if (!S || S.mode !== "gate") return;
    const s = S.lock;
    const w = String(word || "")
      .toUpperCase()
      .replace(/\s+/g, "");
    if (!w) {
      X.sfx("teletype_bell", { volume: 0.4 }, "ui_error");
      return;
    }
    if (w === s.passcode) {
      accept(">" + w, "PASSCODE ACCEPTED.");
      return;
    }
    S.tries = (S.tries || 0) + 1;
    X.sfx("teletype_bell", { volume: 0.7 }, "terminal_fail");
    G.events.emit("codeRejected", s.id, w);
    showGate(">" + w + "  -- PASSCODE REJECTED (" + S.tries + ")");
  }
  function accept(l1, l2, how) {
    S.mode = "accepting";
    X.sfx("teletype_accept", { volume: 0.75 }, "terminal_success");
    const lines = [{ t: l1 }];
    if (l2) lines.push({ t: l2 });
    lines.push(
      { t: "" },
      {
        t: S.promptOnly
          ? "RELEASING LOCK..."
          : "PLEASE WAIT WHILE THE SYSTEM IS ACCESSED...",
      },
    );
    setPage(lines, {
      cps: 900,
      onDone: () =>
        setTimeout(
          () => {
            if (!S) return;
            if (S.promptOnly) {
              const s = S;
              s.done = true;
              T.close();
              try {
                if (s.onOk) s.onOk();
              } catch (e) {
                G.reportError("terminal:prompt:onOk", e);
              }
              return;
            }
            G.locks.unlock(S.lock.id, how || "passcode");
            G.events.emit("terminalUnlocked", S.id);
            try {
              if (S.def.onUnlock) S.def.onUnlock(S.id);
            } catch (e) {
              G.reportError("terminal:onUnlock:" + S.id, e);
            }
            if (S) showMenu();
          },
          G.SMOKE || G.SHOT ? 0 : 450,
        ),
    });
  }

  function visibleEntries(list) {
    return (list || []).filter((e) => {
      try {
        return !e.cond || e.cond();
      } catch (err) {
        return false;
      }
    });
  }
  function showMenu(entries, trail, sel) {
    // Hard gate: the entry list is never shown for a locked terminal, whatever path got us here.
    if (!accessOk()) {
      if (S.lock) showGate();
      else T.close();
      return;
    }
    if (S.def.learn && !S.taught) {
      S.taught = true;
      G.locks.learn(S.def.learn, "Terminal: " + (titleOf(S.def) || S.id));
    }
    S.mode = "menu";
    const list = entries || S.def.entries || [];
    S.trail = trail || [];
    S.curList = list;
    const lines = headerLines();
    const vis = visibleEntries(typeof list === "function" ? list() : list);
    vis.forEach((e) =>
      lines.push({
        t: "> [" + (typeof e.title === "function" ? e.title() : e.title) + "]",
        act: () => openEntry(e),
      }),
    );
    if (!vis.length) lines.push({ t: "(NO ENTRIES)" });
    if (S.trail.length) lines.push({ t: "> [BACK]", act: back });
    else lines.push({ t: "> [LOG OFF]", act: () => T.close() });
    setPage(lines, {
      cps: S.fastMenu ? 99999 : 640,
      sel: sel || 0,
      tear: !S.fastMenu,
    });
    S.fastMenu = false;
  }
  function openEntry(e) {
    let ret;
    if (e.action) {
      try {
        ret = e.action(e, S.id);
      } catch (err) {
        G.reportError("terminal:action:" + S.id, err);
      }
      if (!S) return; // action closed us
    }
    if (e.entries) {
      S.stack = S.stack || [];
      S.stack.push({ list: S.curList, trail: S.trail, sel: S.page.sel });
      showMenu(e.entries, S.trail.concat([e.title]), 0);
      return;
    }
    let text = typeof e.text === "function" ? e.text(e, S.id) : e.text;
    if (typeof ret === "string") text = (text ? text + "\n\n" : "") + ret;
    if (e.learn)
      G.locks.learn(
        e.learn,
        "Terminal: " + (typeof e.title === "function" ? e.title() : e.title),
      );
    if (text === undefined || text === null) {
      S.fastMenu = true;
      showMenu(S.curList, S.trail, S.page.sel);
      return;
    }
    S.stack = S.stack || [];
    S.stack.push({ list: S.curList, trail: S.trail, sel: S.page.sel });
    showText(typeof e.title === "function" ? e.title() : e.title, String(text));
  }
  function wrap(text, width) {
    const out = [];
    String(text)
      .split("\n")
      .forEach((para) => {
        if (!para.length) {
          out.push("");
          return;
        }
        let line = "";
        para.split(" ").forEach((w) => {
          if ((line + (line ? " " : "") + w).length > width) {
            if (line) out.push(line);
            line = w;
            while (line.length > width) {
              out.push(line.slice(0, width));
              line = line.slice(width);
            }
          } else line += (line ? " " : "") + w;
        });
        out.push(line);
      });
    return out;
  }
  function showText(title, text, page) {
    S.mode = "view";
    const body = wrap(text, (ui && ui.cols) || 64);
    const per = Math.max(6, ((ui && ui.lines) || 20) - 6);
    const pages = Math.max(1, Math.ceil(body.length / per));
    page = page || 0;
    const lines = [{ t: String(title || "").toUpperCase() }, { t: "" }];
    body
      .slice(page * per, page * per + per)
      .forEach((l) => lines.push({ t: l }));
    lines.push({ t: "" });
    if (page < pages - 1)
      lines.push({
        t: "> [NEXT PAGE " + (page + 2) + "/" + pages + "]",
        act: () => showText(title, text, page + 1),
      });
    if (page > 0)
      lines.push({
        t: "> [PREVIOUS PAGE]",
        act: () => showText(title, text, page - 1),
      });
    lines.push({ t: "> [RETURN]", act: back });
    setPage(lines, { cps: 1100, tear: page === 0 });
  }
  function back() {
    if (!S) return;
    // anything outside the unlocked entry browser (boot, gate, prompt) just logs off
    if (S.mode !== "menu" && S.mode !== "view") {
      T.close();
      return;
    }
    const st = S.stack && S.stack.pop();
    if (st) {
      S.fastMenu = true;
      showMenu(st.list, st.trail, st.sel);
    } else if (S.mode === "menu") T.close();
    else {
      S.fastMenu = true;
      showMenu();
    }
  }

  // ------------------------------------------------------------------
  // Key routing
  // ------------------------------------------------------------------
  function typedChar(code) {
    let m = /^Key([A-Z])$/.exec(code);
    if (m) return m[1];
    m = /^(?:Digit|Numpad)([0-9])$/.exec(code);
    if (m) return m[1];
    if (code === "Minus" || code === "NumpadSubtract") return "-";
    return "";
  }
  const screen = {
    id: "terminal",
    onKey(code) {
      if (!S) return false;
      const pg = S.page;
      if (code === "LogOff") {
        T.close();
        return true;
      }
      if (pg && pg.reveal < pg.total) {
        if (code) finishPrint();
        return true;
      }
      if (code === "LineFeed") return true;
      if (!pg) return true;
      if (S.mode === "accepting") return true;
      if (S.mode === "gate") {
        const ch = typedChar(code);
        if (ch) {
          if ((S.typed || "").length < 16) {
            S.typed = (S.typed || "") + ch;
            X.sfx(
              "teletype_key",
              { volume: 0.4, pitch: 0.9 + Math.random() * 0.2 },
              "terminal_type",
            );
            renderPage();
          }
          return true;
        }
        if (code === "Backspace") {
          if (S.typed) {
            S.typed = S.typed.slice(0, -1);
            X.sfx("teletype_key", { volume: 0.3, pitch: 0.8 }, "terminal_type");
            renderPage();
          }
          return true;
        }
        if (code === "Enter" || code === "NumpadEnter") {
          if (S.typed) submitPass(S.typed);
          else activateLine();
          return true;
        }
        if (code === "ArrowUp" || code === "ArrowDown") {
          if (pg.items.length) {
            pg.sel =
              pg.sel < 0
                ? code === "ArrowUp"
                  ? pg.items.length - 1
                  : 0
                : (pg.sel + (code === "ArrowUp" ? pg.items.length - 1 : 1)) %
                  pg.items.length;
            renderPage();
            X.sfx("teletype_key", { volume: 0.25 }, "terminal_type");
          }
          return true;
        }
        if (code === "Tab" || code === "Escape") {
          X.sfx("teletype_off", { volume: 0.4 }, "ui_back");
          T.close();
        }
        return true;
      }
      const K = X.K;
      if (K.up(code)) {
        if (pg.items.length) {
          pg.sel = (pg.sel + pg.items.length - 1) % pg.items.length;
          renderPage();
          X.sfx("teletype_key", { volume: 0.3 }, "terminal_type");
        }
      } else if (K.down(code)) {
        if (pg.items.length) {
          pg.sel = (pg.sel + 1) % pg.items.length;
          renderPage();
          X.sfx("teletype_key", { volume: 0.3 }, "terminal_type");
        }
      } else if (
        code === "Enter" ||
        code === "NumpadEnter" ||
        code === "KeyE" ||
        code === "Space"
      )
        activateLine();
      else if (code === "Tab" || code === "Escape" || code === "Backspace") {
        X.sfx("teletype_key", { volume: 0.4, pitch: 0.8 }, "terminal_enter");
        back();
      }
      return true;
    },
  };

  // ------------------------------------------------------------------
  // Sessions
  // ------------------------------------------------------------------
  function begin(id, def, opts, extra) {
    if (S) T.close(true);
    const h = G.util.hashStr(String(id));
    S = Object.assign(
      {
        id,
        def,
        opts,
        mode: "boot",
        stack: [],
        line: "LINE " + (10 + (h % 80)),
        serial: String(40000 + (h % 59999)),
        typed: "",
      },
      extra || {},
    );
    buildUI();
    X.pushScreen(screen);
    if (G.state !== "terminal") G.setState("terminal");
    G.viewmodelVisible = false;
    X.sfx("teletype_on", { volume: 0.7 }); // the teleprinter wakes (the only boot cue)
    G.events.emit("terminalOpened", id);
  }

  const T = {
    register(id, def) {
      if (!id || !def) return;
      defs[id] = def;
      if (!status[id]) status[id] = {};
      try {
        registerLock(id, def);
      } catch (e) {
        G.reportError("terminal:lock:" + id, e);
      }
    },
    has: (id) => !!defs[id],
    get: (id) => defs[id] || null,
    /** Open terminal id. opts: {onClose, skipBoot} */
    open(id, opts) {
      opts = opts || {};
      let def = defs[id];
      if (!def) {
        console.warn(
          '[terminals] unknown terminal "' + id + '" — showing a generic one',
        );
        def = {
          title: "Municipal Records Teleprinter",
          entries: [
            {
              title: "Operator Log",
              text: "LAST ENTRY RECORDED 1967.\n\nCIVIL DEFENSE ALERT RECEIVED. ALL STAFF PROCEED TO THE NEAREST PUBLIC SHELTER.\n\n-- END OF LOG --",
            },
          ],
        };
      }
      const st = (status[id] = status[id] || {});
      const lock = lockSpec(id);
      begin(id, def, opts, { lock });
      const next = () => {
        if (!S) return;
        if (S.lock && !G.locks.isOpen(S.lock.id)) {
          if (
            !S.lock.passcode &&
            !S.lock.code &&
            S.lock.key &&
            X.invCount(S.lock.key) <= 0
          ) {
            showGate(
              "THIS TERMINAL NEEDS " +
                X.itemName(S.lock.key).toUpperCase() +
                ".",
            );
            return;
          }
          showGate();
        } else showMenu();
      };
      if (opts.skipBoot || st.booted) next();
      else {
        st.booted = true;
        bootThen(next);
      }
      return true;
    },
    close(silent) {
      if (!S) return;
      const s = S;
      S = null;
      X.popScreen(screen);
      if (ui) {
        const r = ui.root;
        ui = null;
        if (!silent) r.classList.add("tty-offline");
        r.style.pointerEvents = "none";
        r.style.transition = "opacity .2s ease .15s";
        r.style.opacity = "0";
        setTimeout(() => r.remove(), 400);
      }
      G.viewmodelVisible = true;
      if (!silent) X.sfx("teletype_off", { volume: 0.4 }, "ui_back");
      G.events.emit("terminalClosed", s.id);
      if (s.promptOnly) {
        if (!s.done && s.opts.onCancel) {
          try {
            s.opts.onCancel("cancel");
          } catch (e) {
            G.reportError("terminal:prompt:onCancel", e);
          }
        }
      } else if (s.opts.onClose) {
        try {
          s.opts.onClose(s.id);
        } catch (e) {
          G.reportError("terminal:onClose", e);
        }
      }
      if (!silent) X.returnToPlay("terminal", s.prev);
    },
    isOpen: () => !!S,
    current: () => (S && !S.promptOnly ? S.id : null),
    unlock(id) {
      const s = lockSpec(id);
      if (s) G.locks.unlock(s.id, "script");
    },
    lock(id) {
      const s = lockSpec(id);
      if (s) G.locks.relock(s.id);
    },
    isUnlocked: (id) => {
      const s = lockSpec(id);
      return !s || G.locks.isOpen(s.id);
    },
    /** The G.locks id guarding a terminal (or null). */
    lockId: (id) => lockOf[id] || null,
  };
  G.terminals = T;

  X.terminal = {
    update(realDt) {
      if (S) tickPrinter(realDt);
    },
    /** Teletype passcode prompt for any lock with a passcode (G.locks.open → doors, safes...). */
    prompt(spec, onOk, opts) {
      if (!spec || !spec.passcode) return false;
      const RET = { play: 1, cutscene: 1 };
      const prev = RET[G.state] ? G.state : "play";
      begin("lock:" + spec.id, { title: spec.label }, opts || {}, {
        lock: spec,
        promptOnly: true,
        prev,
        onOk,
      });
      showGate();
      return true;
    },
    learnSources,
    onState(s) {
      if (S && s !== "terminal") T.close(true);
    },
    reset() {
      if (S) T.close(true);
      for (const k in status) status[k] = {};
    },
    save() {
      const o = {};
      for (const k in status) if (status[k].booted) o[k] = { booted: true };
      return o;
    },
    load(d) {
      for (const k in status) status[k] = {};
      if (!d) return;
      for (const k in d) {
        status[k] = { booted: !!d[k].booted };
        if (d[k].unlocked && lockOf[k] && !G.locks.isOpen(lockOf[k]))
          G.locks.unlock(lockOf[k], "load"); // old saves
      }
    },
  };
  // scripted runs only: type a passcode and press RETURN
  if (X.testMode())
    X._termType = (word) => {
      if (S && S.mode === "gate") {
        finishPrint();
        submitPass(word);
      }
    };
})();
