// play-inline-608 01 — host
// Lines 17-365 of readable/play-inline-608.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const H = G.hud._;

  // ------------------------------------------------------------------
  // Generic panel stack
  // ------------------------------------------------------------------
  /**
   * H.menuHost(el) → host with push(panel), pop(), top(), clear(), onKey(code,e)
   * panel = { title, items:[{label, right?, action?(), adjust?(dir), disabled?, desc?, cls?}] | fn,
   *           side?(item)→html, footer?, cls?, onBack?() → bool (return true to block pop), onKey?(code) }
   */
  H.menuHost = function (el) {
    const host = { el, stack: [] };
    host.top = () => host.stack[host.stack.length - 1] || null;
    host.push = (p) => {
      host.stack.push(p);
      p.sel = p.sel || 0;
      render();
    };
    host.pop = () => {
      const p = host.top();
      if (p && p.onBack && p.onBack()) return;
      if (host.stack.length > 1) {
        host.stack.pop();
        H.sfx("ui_back", { volume: 0.6 });
        render();
      }
    };
    host.clear = () => {
      host.stack.length = 0;
      el.innerHTML = "";
    };
    host.refresh = () => render();
    function items(p) {
      return typeof p.items === "function" ? p.items() : p.items;
    }
    function render() {
      const p = host.top();
      el.innerHTML = "";
      if (!p) return;
      const its = items(p);
      if (p.sel >= its.length) p.sel = Math.max(0, its.length - 1);
      while (its[p.sel] && its[p.sel].disabled && p.sel < its.length - 1)
        p.sel++;
      const box = H.el("div", "menu-panel " + (p.cls || ""), el);
      if (p.title)
        H.el("div", "menu-ptitle", box, "[ " + H.esc(H.up(p.title)) + " ]");
      if (p.header) H.el("div", "menu-pheader", box, p.header);
      const wrap = H.el("div", "menu-pwrap", box);
      const list = H.el("div", "menu-list", wrap);
      const side = p.side ? H.el("div", "menu-side", wrap) : null;
      p._rows = its.map((it, i) => {
        const r = H.el(
          "div",
          "menu-item" +
            (i === p.sel ? " sel" : "") +
            (it.disabled ? " disabled" : "") +
            (it.cls ? " " + it.cls : ""),
          list,
        );
        r.innerHTML =
          (it.adjust ? '<span class="menu-arrow l">&#9664;</span>' : "") +
          '<span class="menu-lab">' +
          H.esc(H.up(it.label)) +
          "</span>" +
          (it.right !== undefined
            ? '<span class="menu-right">' +
              (typeof it.right === "function" ? it.right() : it.right) +
              "</span>"
            : "") +
          (it.adjust ? '<span class="menu-arrow r">&#9654;</span>' : "");
        r.addEventListener("mouseenter", () => {
          if (p.sel !== i && !it.disabled) select(i, true);
        });
        r.addEventListener("click", (e) => {
          if (it.disabled) return;
          const t = e.target;
          if (it.adjust && t.classList.contains("menu-arrow")) {
            it.adjust(t.classList.contains("l") ? -1 : 1);
            H.sfx("ui_click", { volume: 0.5 });
            render();
            return;
          }
          if (it.adjust && !it.action) {
            it.adjust(1);
            H.sfx("ui_click", { volume: 0.5 });
            render();
            return;
          }
          activate(it);
        });
        return r;
      });
      function select(i, snd) {
        if (p._rows[p.sel]) p._rows[p.sel].classList.remove("sel");
        p.sel = i;
        if (p._rows[i]) {
          p._rows[i].classList.add("sel");
          p._rows[i].scrollIntoView({ block: "nearest" });
        }
        if (snd) H.sfx("ui_hover", { volume: 0.3 });
        if (side) side.innerHTML = p.side(its[i]) || "";
      }
      p._select = select;
      if (side) side.innerHTML = p.side(its[p.sel]) || "";
      if (p.footer)
        H.el(
          "div",
          "menu-footer",
          box,
          typeof p.footer === "function" ? p.footer() : p.footer,
        );
    }
    function activate(it) {
      if (!it || it.disabled) return;
      H.sfx("ui_select", { volume: 0.7 });
      if (it.action) it.action();
    }
    host.onKey = function (code, e) {
      const p = host.top();
      if (!p) return false;
      if (p.onKey && p.onKey(code, e)) return true;
      const its = items(p);
      const move = (d) => {
        if (!its.length) return;
        let i = p.sel;
        for (let k = 0; k < its.length; k++) {
          i = (i + d + its.length) % its.length;
          if (!its[i].disabled) break;
        }
        p._select(i, true);
      };
      switch (code) {
        case "KeyW":
        case "ArrowUp":
          move(-1);
          return true;
        case "KeyS":
        case "ArrowDown":
          move(1);
          return true;
        case "KeyA":
        case "ArrowLeft":
          if (its[p.sel] && its[p.sel].adjust) {
            its[p.sel].adjust(-1);
            H.sfx("ui_click", { volume: 0.5 });
            render();
          }
          return true;
        case "KeyD":
        case "ArrowRight":
          if (its[p.sel] && its[p.sel].adjust) {
            its[p.sel].adjust(1);
            H.sfx("ui_click", { volume: 0.5 });
            render();
          }
          return true;
        case "Enter":
        case "Space":
        case "KeyE": {
          const it = its[p.sel];
          if (it && it.adjust && !it.action) {
            it.adjust(1);
            render();
          } else activate(it);
          return true;
        }
        case "Escape":
        case "Backspace":
        case "Tab":
          host.pop();
          return true;
      }
      return false;
    };
    return host;
  };

  // ------------------------------------------------------------------
  // Shared panels: confirm, save, load, settings, help, credits
  // ------------------------------------------------------------------
  function confirmPanel(host, text, onYes, yes, no) {
    host.push({
      title: text,
      cls: "menu-confirm",
      items: [
        {
          label: yes || "Yes",
          action: () => {
            host.stack.pop();
            onYes();
            host.refresh();
          },
        },
        { label: no || "No", action: () => host.pop() },
      ],
    });
  }
  H.confirmPanel = confirmPanel;

  function fmtDate(t) {
    const d = new Date(t);
    return (
      d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  }
  function slotName(s) {
    return s.slot === "quick"
      ? "Quicksave"
      : H.isAutoSlot(s.slot)
        ? "Autosave"
        : "Save";
  }
  function saveLabel() {
    return H.heroName() + " · Lvl " + H.level() + " · " + H.placeName();
  }
  H.saveLabel = saveLabel;
  function slotsSide(s) {
    if (!s || !s.meta)
      return '<div class="menu-side-gl">' + H.glyph("save") + "</div>";
    const m = s.meta;
    return (
      '<div class="menu-side-gl">' +
      H.glyph(H.isAutoSlot(m.slot) ? "time" : "save") +
      '</div><div class="menu-side-t">' +
      H.esc(H.up(m.label || slotName(m))) +
      '</div><div class="menu-side-s">' +
      fmtDate(m.time) +
      "</div>"
    );
  }
  function savePanel(host) {
    const panel = {
      title: "Save game",
      cls: "menu-saves",
      items: () => {
        const slots = G.save
          .listSlots()
          .filter((s) => !H.isAutoSlot(s.slot) && s.slot !== "quick");
        const out = [
          {
            label: "[ New save ]",
            meta: null,
            action: () => doSave("s" + Date.now().toString(36)),
          },
        ];
        for (const s of slots)
          out.push({
            label: s.label || s.slot,
            right: fmtDate(s.time),
            meta: s,
            action: () =>
              confirmPanel(host, "Overwrite this save?", () => doSave(s.slot)),
          });
        return out;
      },
      side: slotsSide,
      footer:
        "<b>ENTER</b> SAVE &nbsp; <b>DEL</b> DELETE &nbsp; <b>ESC</b> BACK",
      onKey(code) {
        if (code === "Delete" || code === "KeyX") {
          const it = this.items()[this.sel];
          if (it && it.meta)
            confirmPanel(host, "Delete this save?", () => {
              G.save.deleteSlot(it.meta.slot);
            });
          return true;
        }
        return false;
      },
    };
    function doSave(slot) {
      if (G.state === "dead" || !G.player.alive) {
        H.sfx("ui_error");
        return;
      }
      const ok = G.save.saveGame(slot, saveLabel());
      H.sfx(ok ? "ui_select" : "ui_error");
      host.refresh();
    }
    host.push(panel);
  }
  function loadPanel(host) {
    host.push({
      title: "Load game",
      cls: "menu-saves",
      items: () => {
        const slots = G.save.listSlots();
        if (!slots.length)
          return [{ label: "No saved games.", disabled: true }];
        return slots.map((s) => ({
          label:
            (s.slot === "quick"
              ? "[Quick] "
              : H.isAutoSlot(s.slot)
                ? "[Auto] "
                : "") + (s.label || s.slot),
          right: fmtDate(s.time),
          meta: s,
          action: () => doLoad(s.slot),
        }));
      },
      side: slotsSide,
      footer:
        "<b>ENTER</b> LOAD &nbsp; <b>DEL</b> DELETE &nbsp; <b>ESC</b> BACK",
      onKey(code) {
        if (code === "Delete" || code === "KeyX") {
          const it = this.items()[this.sel];
          if (it && it.meta)
            confirmPanel(host, "Delete this save?", () => {
              G.save.deleteSlot(it.meta.slot);
            });
          return true;
        }
        return false;
      },
    });
  }
  function doLoad(slot) {
    hideAllScreens();
    let meta = null;
    try {
      meta = G.save.listSlots().find((m) => m.slot === slot) || null;
    } catch (e) {
      /* ignore */
    }
    H.setLoadingDest(
      "RETURNING TO",
      (meta && (meta.place || meta.label)) || "YOUR LAST SAVE",
    );
    H.showLoading("Loading...", 0.5, true);
    setTimeout(() => {
      const ok = G.save.loadGame(slot);
      H.hideLoading();
      if (!ok) {
        H.sfx("ui_error");
        if (G.state === "title") showTitle();
        else if (G.state === "dead") showDeath();
        else if (G.state === "paused") showPause();
        G.notify("That save could not be loaded.", { color: "red" });
      }
    }, 60);
  }
  H.doLoad = doLoad;

