// play-inline-503 05 — pos
// Lines 1372-1582 of readable/play-inline-503.pretty.js (statement-aligned).
  function updateFires(dt) {
    if (!fires.length || dt <= 0) return;
    const C = CMB(),
      c2 = cmb(),
      pl = G.player;
    for (let i = fires.length - 1; i >= 0; i--) {
      const f = fires[i];
      f.t -= dt;
      f.tick -= dt;
      if (f.tick <= 0) {
        f.tick = 0.5;
        if (C && C.list)
          for (const a of C.list) {
            if (!a || a.dead || !a.inScene) continue;
            const dx = a.pos.x - f.pos.x,
              dz = a.pos.z - f.pos.z;
            if (
              dx * dx + dz * dz > f.r * f.r ||
              Math.abs(a.pos.y - f.pos.y) > 2
            )
              continue;
            if (c2 && typeof c2.ignite === "function") {
              try {
                c2.ignite(a, 3, f.dps, "player");
              } catch (e) {
                /* ignore */
              }
            }
          }
        if (pl && pl.alive !== false) {
          const dx = pl.pos.x - f.pos.x,
            dz = pl.pos.z - f.pos.z;
          if (
            dx * dx + dz * dz < f.r * f.r * 0.6 &&
            Math.abs(pl.pos.y - f.pos.y) < 2
          ) {
            try {
              pl.damage(f.dps * 0.5, { type: "fire", source: "player" });
            } catch (e) {
              /* ignore */
            }
          }
        }
      }
      if (f.t <= 0) {
        if (f.fx) {
          try {
            f.fx.stop();
          } catch (e) {
            /* ignore */
          }
        }
        fires.splice(i, 1);
      }
    }
  }

  function clearFlying() {
    for (const p of flying) G.scene.remove(p.obj);
    for (const s of stuck) G.scene.remove(s.obj);
    for (const q of papers) G.scene.remove(q.obj);
    for (const r of rings) {
      G.scene.remove(r.obj);
      r.obj.material.dispose();
    }
    for (const c of clouds)
      for (const e of c.em) {
        try {
          e.stop();
        } catch (er) {
          /* ignore */
        }
      }
    for (const f of fires)
      if (f.fx) {
        try {
          f.fx.stop();
        } catch (er) {
          /* ignore */
        }
      }
    flying.length = 0;
    stuck.length = 0;
    papers.length = 0;
    rings.length = 0;
    dots.length = 0;
    clouds.length = 0;
    fires.length = 0;
  }

  // ------------------------------------------------------------------
  // Workbench UI (goggle styled; state 'container' while open)
  // ------------------------------------------------------------------
  const UI = {
    el: null,
    open: false,
    tab: 0,
    sel: 0,
    rows: [],
    bench: null,
    msg: "",
    msgT: 0,
  };
  const TABS = ["SCHEMATICS", "WORKSHOP", "MODIFY"];
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  function buildUI() {
    if (UI.el) return;
    const root =
      G.ui && !G.isStub("ui") && G.ui.root ? G.ui.root : document.body;
    const el = document.createElement("div");
    el.className = "wpn-craft";
    el.innerHTML =
      '<div class="wpn-craft-box"><div class="wpn-craft-scan"></div>' +
      '<div class="wpn-craft-head"><span class="wpn-craft-title">WORKBENCH</span><span class="wpn-craft-skill"></span></div>' +
      '<div class="wpn-craft-tabs"></div>' +
      '<div class="wpn-craft-body"><ul class="wpn-craft-list"></ul><div class="wpn-craft-info"></div></div>' +
      '<div class="wpn-craft-msg"></div>' +
      '<div class="wpn-craft-foot"><b>E</b> BUILD / INSTALL &nbsp; <b>W/S</b> SELECT &nbsp; <b>A/D</b> TAB &nbsp; <b>ESC</b> EXIT</div></div>';
    root.appendChild(el);
    UI.el = el;
    UI.tabsEl = el.querySelector(".wpn-craft-tabs");
    UI.listEl = el.querySelector(".wpn-craft-list");
    UI.infoEl = el.querySelector(".wpn-craft-info");
    UI.msgEl = el.querySelector(".wpn-craft-msg");
    UI.skillEl = el.querySelector(".wpn-craft-skill");
    el.addEventListener("mousedown", (e) => {
      const t = e.target.closest
        ? e.target.closest("[data-tab],[data-row],[data-act]")
        : null;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      if (t.dataset.tab !== undefined) {
        UI.tab = +t.dataset.tab;
        UI.sel = 0;
        sfx("ui_tab", "ui_click");
        render();
      } else if (t.dataset.row !== undefined) {
        if (UI.sel === +t.dataset.row && e.detail > 1) act();
        else {
          UI.sel = +t.dataset.row;
          sfx("ui_hover", "ui_click", { volume: 0.3 });
          render();
        }
      } else if (t.dataset.act) act();
    });
  }
  function rowsFor(tab) {
    const rows = [];
    if (tab === 0) {
      for (const id of Object.keys(SCHEM))
        if (S.schem[id] > 0) rows.push({ type: "schem", id, entry: SCHEM[id] });
    } else if (tab === 1) {
      for (const e of WORKSHOP) rows.push({ type: "work", id: e.id, entry: e });
    } else {
      // every owned weapon that some mod fits: owned mods first, installed ones listed for reference
      const owned = invReal()
        ? G.inventory.list("weapon").map((x) => x.id)
        : [];
      for (const wid of owned) {
        for (const mid of Object.keys(P.MODS)) {
          const m = P.MODS[mid];
          if (m.fits.indexOf(wid) < 0) continue;
          const inst = P.modsOf(wid).indexOf(mid) >= 0;
          if (inst || count(mid) > 0)
            rows.push({ type: "mod", id: mid, wid, installed: inst });
        }
      }
    }
    return rows;
  }
  function partsHTML(entry) {
    return (
      '<ul class="wpn-craft-parts">' +
      entry.parts
        .map(([id, n]) => {
          const have = count(id);
          return (
            '<li class="' +
            (have >= n ? "ok" : "no") +
            '"><span>' +
            esc(itemName(id)) +
            "</span><i>" +
            Math.min(have, 99) +
            "/" +
            n +
            "</i></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }
  function statLine(def) {
    if (!def || !def.weapon) return "";
    const w = def.weapon;
    const cells = [];
    if (w.damage) cells.push("DAM " + Math.round(w.damage * (w.pellets || 1)));
    if (w.strReq > 1) cells.push("BRN " + w.strReq);
    cells.push("WG " + (def.weight || 0));
    cells.push("VAL " + (def.value || 0));
    return (
      '<div class="wpn-craft-stats">' +
      cells.map((c) => "<span>" + c + "</span>").join("") +
      "</div>"
    );
  }
