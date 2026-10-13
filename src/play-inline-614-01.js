// play-inline-614 01 — focus
// Lines 10-322 of readable/play-inline-614.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G._uix;

  /**
   * cfg: {
   *   title, subtitle(),
   *   cols: [{ title(), info(), entries() → [{id,count,def,equipped,condition,marked?,steal?,quest?}], right(entry) → html }, {...}],
   *   footer() → html (balance line), keys: html,
   *   cats: bool, onActivate(side, entry, all:boolean)
   * }
   */
  X.createXfer = function (cfg) {
    const root = G.ui.el("div", "ui-screen ui-xfer");
    const box = G.ui.el("div", "ui-xfer-box ui-panel", root);
    G.ui.el("div", "ui-scan", box);
    const head = G.ui.el("div", "ui-xfer-head", box);
    const titleEl = G.ui.el("div", "ui-xfer-title", head);
    titleEl.textContent = cfg.title;
    const subEl = G.ui.el("div", "ui-xfer-sub", head);
    const colsEl = G.ui.el("div", "ui-xfer-cols", box);
    const cols = [0, 1].map((i) => {
      const c = G.ui.el("div", "ui-col", colsEl);
      const h = G.ui.el("div", "ui-col-head", c);
      const hl = G.ui.el("span", "", h),
        hr = G.ui.el("span", "", h);
      let cats = null;
      if (cfg.cats) {
        cats = G.ui.el("div", "ui-cats", c);
        X.CATS.forEach((ct, k) => {
          const s = G.ui.el("span", "", cats);
          s.textContent = ct.name;
          s.onclick = () => {
            W.cat = k;
            W.sel = [0, 0];
            X.sfx("ui_tab", { volume: 0.4 }, "ui_click");
            W.render();
          };
        });
      }
      const list = G.ui.el("div", "ui-list", c);
      c.onmouseenter = () => {
        if (W.focus !== i) {
          W.focus = i;
          W.render();
        }
      };
      return { el: c, hl, hr, list, cats, entries: [] };
    });
    const stats = G.ui.el("div", "ui-stats", box);
    // the selected item's line-art icon (ui_hud) beside its stats, when available
    const iconEl = G.ui.el("div", "ui-icon", stats);
    const statBody = G.ui.el("div", "ui-stats-body", stats);
    const grid = G.ui.el("div", "ui-stat-grid", statBody);
    const desc = G.ui.el("div", "ui-desc", statBody);
    const bal = G.ui.el("div", "ui-balance", box);
    const keys = G.ui.el("div", "ui-keys ui-foot", box);
    keys.innerHTML = cfg.keys || "";
    const flashEl = G.ui.el("div", "ui-flash ui-panel", box);
    let flashT = null;

    const W = {
      root,
      focus: cfg.startFocus || 1,
      sel: [0, 0],
      cat: 0,
      qtyOpen: null,
      render() {
        subEl.innerHTML = cfg.subtitle ? cfg.subtitle() : "";
        const cat = X.CATS[W.cat].id;
        cols.forEach((c, i) => {
          const spec = cfg.cols[i];
          c.el.classList.toggle("focus", W.focus === i);
          c.hl.innerHTML = spec.title();
          c.hr.innerHTML = spec.info ? spec.info() : "";
          if (c.cats)
            Array.from(c.cats.children).forEach((s, k) =>
              s.classList.toggle("on", k === W.cat),
            );
          let es = spec.entries() || [];
          if (cfg.cats && cat !== "all")
            es = es.filter((e) => X.catOf(e.def) === cat);
          c.entries = es;
          if (W.sel[i] >= es.length) W.sel[i] = Math.max(0, es.length - 1);
          c.list.innerHTML = "";
          if (!es.length) {
            const e = G.ui.el("div", "ui-empty", c.list);
            e.textContent = spec.empty || "— empty —";
          }
          es.forEach((e, k) => {
            const row = G.ui.el("div", "ui-row", c.list);
            if (k === W.sel[i]) row.classList.add("sel");
            if (e.marked) row.classList.add("marked");
            if (e.equipped) row.classList.add("eq");
            if (e.def && e.def.quest) row.classList.add("quest");
            const nm = G.ui.el("span", "nm", row);
            nm.innerHTML =
              (e.steal ? '<span class="steal">[STEAL]</span>' : "") +
              X.esc(e.def.name || X.prettify(e.id)) +
              (e.count > 1 ? " (" + e.count + ")" : "") +
              (e.marked
                ? ' <span style="opacity:.8">[' + e.marked + "]</span>"
                : "") +
              // tiny condition gauge for weapons/armour
              (e.condition != null &&
              (X.weaponBlock(e.def) || e.def.type === "apparel") &&
              e.def.hasCondition !== false
                ? '<span class="cndbar"><i style="width:' +
                  Math.round(
                    X.clamp(
                      e.condition > 1 ? e.condition / 100 : e.condition,
                      0,
                      1,
                    ) * 100,
                  ) +
                  '%"></i></span>'
                : "");
            const rt = G.ui.el("span", "rt", row);
            rt.innerHTML = spec.right ? spec.right(e) : "";
            row.onmouseenter = () => {
              if (W.focus !== i || W.sel[i] !== k) {
                W.focus = i;
                W.sel[i] = k;
                W.paintSel();
                X.sfx("ui_hover", { volume: 0.2 });
              }
            };
            row.onclick = (ev) => {
              W.focus = i;
              W.sel[i] = k;
              cfg.onActivate(i, e, !!ev.shiftKey);
            };
            row.oncontextmenu = (ev) => {
              ev.preventDefault();
              W.focus = i;
              W.sel[i] = k;
              cfg.onActivate(i, e, true);
            };
          });
        });
        W.paintStats();
        bal.innerHTML = cfg.footer ? cfg.footer() : "";
        W.scrollIntoView();
      },
      paintSel() {
        cols.forEach((c, i) => {
          c.el.classList.toggle("focus", W.focus === i);
          Array.from(c.list.querySelectorAll(".ui-row")).forEach((r, k) =>
            r.classList.toggle("sel", k === W.sel[i]),
          );
        });
        W.paintStats();
        W.scrollIntoView();
      },
      paintStats() {
        const e = W.current();
        if (!e) {
          grid.innerHTML = "";
          desc.textContent = "";
          iconEl.innerHTML = "";
          iconEl.classList.remove("on");
          return;
        }
        const svg = X.itemIconSVG(e.def);
        iconEl.innerHTML = svg;
        iconEl.classList.toggle("on", !!svg);
        grid.innerHTML = X.statCells(e.def, e.condition)
          .map(
            (c) =>
              "<div" +
              (c[0] === "CND" ? ' class="wide"' : "") +
              "><span>" +
              c[0] +
              "</span><span>" +
              c[1] +
              "</span></div>",
          )
          .join("");
        let d = e.def.desc || "";
        if (!d) {
          const w = X.weaponBlock(e.def);
          if (w)
            d =
              (X.SKILL_NAMES[X.skillId(w.skill)] || "Weapon") +
              (w.ammo ? " · uses " + X.itemName(w.ammo) : "");
          else if (e.def.type === "apparel")
            d = "Apparel" + (e.def.slot ? " · " + e.def.slot : "");
          else if (e.def.type === "ammo") d = "Ammunition.";
          else if (e.def.type === "aid") d = "Consumable.";
        }
        desc.innerHTML =
          X.esc(d) + (cfg.extraDesc ? cfg.extraDesc(W.focus, e) : "");
      },
      scrollIntoView() {
        const c = cols[W.focus];
        const r = c.list.querySelectorAll(".ui-row")[W.sel[W.focus]];
        if (r && r.scrollIntoView) {
          try {
            r.scrollIntoView({ block: "nearest" });
          } catch (e) {
            /* ignore */
          }
        }
      },
      current() {
        const c = cols[W.focus];
        return c.entries[W.sel[W.focus]] || null;
      },
      move(d) {
        const n = cols[W.focus].entries.length;
        if (!n) return;
        W.sel[W.focus] = (W.sel[W.focus] + d + n) % n;
        W.paintSel();
        X.sfx("ui_hover", { volume: 0.25 });
      },
      switchCol(to) {
        const t = to === undefined ? 1 - W.focus : to;
        if (t !== W.focus) {
          W.focus = t;
          W.paintSel();
          X.sfx("ui_click", { volume: 0.3 });
        }
      },
      nextCat(d) {
        if (!cfg.cats) return;
        W.cat = (W.cat + d + X.CATS.length) % X.CATS.length;
        W.sel = [0, 0];
        X.sfx("ui_tab", { volume: 0.4 }, "ui_click");
        W.render();
      },
      setCat(k) {
        if (!cfg.cats || k < 0 || k >= X.CATS.length) return;
        W.cat = k;
        W.sel = [0, 0];
        X.sfx("ui_tab", { volume: 0.4 }, "ui_click");
        W.render();
      },
      flash(text, bad) {
        flashEl.textContent = text;
        flashEl.style.color = bad ? "var(--uix-bad)" : "";
        flashEl.classList.add("on");
        clearTimeout(flashT);
        flashT = setTimeout(() => flashEl.classList.remove("on"), 1300);
      },
      /** Quantity chooser → Promise<number|null>. */
      askQty(max, label, priceFn) {
        return new Promise((resolve) => {
          const q = G.ui.el("div", "ui-qty ui-panel", box);
          let n = max;
          q.innerHTML =
            "<div>" +
            X.esc(label) +
            '</div><div class="q"></div><input type="range" min="1" max="' +
            max +
            '" value="' +
            max +
            '"><div class="pr" style="min-height:22px"></div>' +
            '<div class="ui-keys" style="margin-top:8px"><span><b>A/D</b>±1</span><span><b>W/S</b>±10</span><span><b>E</b>OK</span><span><b>ESC</b>Cancel</span></div>';
          const qn = q.querySelector(".q"),
            sl = q.querySelector("input"),
            pr = q.querySelector(".pr");
          const paint = () => {
            qn.textContent = n;
            sl.value = n;
            pr.innerHTML = priceFn ? priceFn(n) : "";
          };
          sl.oninput = () => {
            n = Number(sl.value);
            paint();
          };
          paint();
          W.qtyOpen = {
            onKey(code) {
              const K = X.K;
              if (K.left(code)) {
                n = Math.max(1, n - 1);
                paint();
                X.sfx("ui_hover", { volume: 0.2 });
              } else if (K.right(code)) {
                n = Math.min(max, n + 1);
                paint();
                X.sfx("ui_hover", { volume: 0.2 });
              } else if (K.up(code)) {
                n = Math.min(max, n + 10);
                paint();
              } else if (K.down(code)) {
                n = Math.max(1, n - 10);
                paint();
              } else if (K.ok(code)) done(n);
              else if (code === "Escape" || code === "Tab") done(null);
              return true;
            },
          };
          q.ondblclick = () => done(n);
          function done(v) {
            W.qtyOpen = null;
            q.remove();
            X.sfx(v ? "ui_select" : "ui_back", { volume: 0.4 });
            resolve(v);
          }
          X.sfx("ui_click", { volume: 0.4 });
        });
      },
      destroy() {
        clearTimeout(flashT);
        root.style.transition = "opacity .18s";
        root.style.opacity = "0";
        setTimeout(() => root.remove(), 200);
      },
    };
    W.render();
    return W;
  };
