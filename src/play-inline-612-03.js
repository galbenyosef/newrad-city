// play-inline-612 03 — done
// Lines 603-742 of readable/play-inline-612.pretty.js (statement-aligned).
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
