// play-inline-533 03 — res
// Lines 710-1052 of readable/play-inline-533.pretty.js (statement-aligned).
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
