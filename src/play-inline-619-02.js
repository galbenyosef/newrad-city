// play-inline-619 02 — code
// Lines 372-724 of readable/play-inline-619.pretty.js (statement-aligned).
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
