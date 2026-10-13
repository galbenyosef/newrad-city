// play-inline-503 06 — info
// Lines 1583-1936 of readable/play-inline-503.pretty.js (statement-aligned).
  function render() {
    if (!UI.el) return;
    UI.rows = rowsFor(UI.tab);
    if (UI.sel >= UI.rows.length) UI.sel = Math.max(0, UI.rows.length - 1);
    UI.skillEl.textContent = "REPAIR " + Math.round(repairSkill());
    UI.tabsEl.innerHTML = TABS.map(
      (t, i) =>
        '<b data-tab="' +
        i +
        '" class="' +
        (i === UI.tab ? "on" : "") +
        '">' +
        t +
        "</b>",
    ).join("");
    UI.listEl.innerHTML =
      UI.rows
        .map((r, i) => {
          let label,
            tag = "",
            dim = false;
          if (r.type === "schem") {
            label = itemName(r.entry.makes);
            tag =
              "<i>" +
              "&#9632;".repeat(S.schem[r.id]) +
              "&#9633;".repeat(3 - S.schem[r.id]) +
              "</i>";
            dim = !!blocker(r.entry);
          } else if (r.type === "work") {
            label =
              itemName(r.entry.makes) +
              ((r.entry.n || 1) > 1 ? " (" + r.entry.n + ")" : "");
            tag = "<i>" + r.entry.cat + "</i>";
            dim = !!blocker(r.entry);
          } else {
            label = itemName(r.id) + " &rarr; " + esc(itemName(r.wid));
            tag = r.installed
              ? "<i>INSTALLED</i>"
              : "<i>x" + count(r.id) + "</i>";
            dim = r.installed || !W.canInstallMod(r.wid, r.id);
          }
          return (
            '<li data-row="' +
            i +
            '" class="' +
            (i === UI.sel ? "sel " : "") +
            (dim ? "dim" : "") +
            '"><span>' +
            (r.type === "mod" ? label : esc(label)) +
            "</span>" +
            tag +
            "</li>"
          );
        })
        .join("") ||
      '<li class="empty">' +
        (UI.tab === 0
          ? "No schematics known.<br>Schematic diagrams are hidden all over the city: find them, then build here."
          : UI.tab === 2
            ? "No weapon mods for your weapons.<br>Build mods in the WORKSHOP tab or find them in the ruins."
            : "") +
        "</li>";
    const r = UI.rows[UI.sel];
    let info = "";
    if (r && (r.type === "schem" || r.type === "work")) {
      const e = r.entry,
        def =
          P.defs.get(e.makes) ||
          (G.items && G.items.get ? G.items.get(e.makes) : null);
      const why = blocker(e);
      info += "<h3>" + esc(itemName(e.makes)) + "</h3>";
      if (r.type === "schem")
        info += '<p class="wpn-craft-note">' + esc(e.text) + "</p>";
      else if (def && def.desc)
        info += '<p class="wpn-craft-note">' + esc(def.desc) + "</p>";
      info += statLine(def);
      if (
        r.type === "schem" &&
        def &&
        def.type === "weapon" &&
        def.weapon.reloadType !== "throw"
      ) {
        const c = Math.round(P.craftCondition(r.id) * 100);
        info +=
          '<div class="wpn-craft-cnd">CND <span class="bar"><i style="width:' +
          c +
          '%"></i></span> ' +
          c +
          "% <em>(" +
          S.schem[r.id] +
          "/3 schematics)</em></div>";
      }
      info += "<h4>COMPONENTS</h4>" + partsHTML(e);
      if (e.repair)
        info +=
          '<div class="wpn-craft-req ' +
          (repairSkill() >= e.repair ? "ok" : "no") +
          '">REQUIRES REPAIR ' +
          e.repair +
          "</div>";
      info +=
        '<button data-act="1" class="' +
        (why ? "off" : "") +
        '">' +
        (why ? esc(why.toUpperCase()) : "BUILD") +
        "</button>";
    } else if (r && r.type === "mod") {
      const m = P.MODS[r.id];
      info +=
        "<h3>" +
        esc(m.name) +
        '</h3><p class="wpn-craft-note">' +
        esc(m.desc) +
        "</p>";
      info +=
        '<div class="wpn-craft-stats"><span>' +
        esc(m.effect.toUpperCase()) +
        "</span></div>";
      const have = P.modsOf(r.wid)
        .map((x) => (P.MODS[x] || {}).name)
        .filter(Boolean);
      info +=
        "<h4>" +
        esc(itemName(r.wid).toUpperCase()) +
        '</h4><p class="wpn-craft-note">Installed: ' +
        (have.length ? esc(have.join(", ")) : "none") +
        "</p>";
      const ok =
        !r.installed && W.canInstallMod(r.wid, r.id) && count(r.id) > 0;
      info +=
        '<button data-act="1" class="' +
        (ok ? "" : "off") +
        '">' +
        (r.installed ? "INSTALLED" : ok ? "INSTALL" : "CAN'T INSTALL") +
        "</button>";
    }
    UI.infoEl.innerHTML = info;
    UI.msgEl.textContent = UI.msg;
    const selEl = UI.listEl.querySelector(".sel");
    if (selEl && selEl.scrollIntoView) {
      try {
        selEl.scrollIntoView({ block: "nearest" });
      } catch (e) {
        /* ignore */
      }
    }
  }
  function flash(msg) {
    UI.msg = msg;
    UI.msgT = 2.5;
    if (UI.msgEl) UI.msgEl.textContent = msg;
  }
  function act() {
    const r = UI.rows[UI.sel];
    if (!r) return;
    if (r.type === "mod") {
      if (r.installed) return;
      const res = W.installMod(r.wid, r.id);
      if (!res.ok) {
        flash(res.reason);
        sfx("ui_error", "empty_click");
      } else flash("Installed.");
    } else {
      const res = W.craft(r.type === "schem" ? r.id : r.entry.id);
      if (!res.ok) {
        flash(res.reason);
        sfx("ui_error", "empty_click");
      } else flash(itemName(res.made) + " built.");
    }
    render();
  }
  W.openWorkbench = function (bench) {
    buildUI();
    if (G.state !== "play" && G.state !== "container") return false;
    UI.bench = bench || null;
    UI.open = true;
    UI.msg = "";
    UI.tab = Object.keys(S.schem).some((k) => S.schem[k] > 0) ? 0 : 1;
    UI.sel = 0;
    if (G.state !== "container") G.setState("container");
    UI.el.classList.add("on");
    sfx("ui_open", "goggles_tab", { volume: 0.55 });
    render();
    return true;
  };
  W.closeWorkbench = function () {
    if (!UI.open) return;
    UI.open = false;
    if (UI.el) UI.el.classList.remove("on");
    try {
      const I = G.input;
      for (const k in I.pressed) I.pressed[k] = false;
    } catch (e) {
      /* ignore */
    }
    if (G.state === "container") G.setState("play");
    sfx("ui_back", "ui_click", { volume: 0.4 });
  };
  W.isWorkbenchOpen = () => UI.open;
  G.events.on("keydown", (code, e) => {
    if (!UI.open) return;
    const k = code || (e && e.key) || "";
    let used = true;
    if (k === "Escape" || k === "Tab" || k === "Backspace") W.closeWorkbench();
    else if (k === "ArrowUp" || k === "KeyW") {
      UI.sel = Math.max(0, UI.sel - 1);
      sfx("ui_scroll", "ui_click", { volume: 0.25 });
      render();
    } else if (k === "ArrowDown" || k === "KeyS") {
      UI.sel = Math.min(UI.rows.length - 1, UI.sel + 1);
      sfx("ui_scroll", "ui_click", { volume: 0.25 });
      render();
    } else if (k === "ArrowLeft" || k === "KeyA" || k === "KeyQ") {
      UI.tab = (UI.tab + TABS.length - 1) % TABS.length;
      UI.sel = 0;
      sfx("ui_tab", "ui_click");
      render();
    } else if (k === "ArrowRight" || k === "KeyD") {
      UI.tab = (UI.tab + 1) % TABS.length;
      UI.sel = 0;
      sfx("ui_tab", "ui_click");
      render();
    } else if (
      k === "Enter" ||
      k === "NumpadEnter" ||
      k === "KeyE" ||
      k === "Space"
    )
      act();
    else if (/^Digit[1-3]$/.test(k)) {
      UI.tab = +k.slice(5) - 1;
      UI.sel = 0;
      render();
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
  G.events.on("state", (s) => {
    if (UI.open && s !== "container") {
      UI.open = false;
      if (UI.el) UI.el.classList.remove("on");
    }
  });
  G.events.on("inventoryChanged", () => {
    if (UI.open) render();
  });
  // props: interacting with a workbench emits 'workbench' (and prints its own "lack the schematics"
  // line — swallowed for that one call, see initDone below)
  let suppressT = 0;
  G.events.on("workbench", (rec) => {
    if (W.openWorkbench(rec)) suppressT = performance.now() + 60;
  });

  // ------------------------------------------------------------------
  // Schematic diagrams in the world (static rpg pickups, placed once)
  // ------------------------------------------------------------------
  const PLACEMENTS = [
    // [schematic, x, z, search radius] — near workbenches / fitting landmarks
    ["schematic_rivet_gun", null, null, 14, "cryoExit"], // a dead ironworker near the cryo-lab exit
    ["schematic_third_rail_shoe", 146.8, 150.5, 8], // downtown workshop corner (workbench)
    ["schematic_siren_horn", 79.5, -333.5, 8], // Iron Covenant workbench, Rockefeller plaza
    ["schematic_molotov", -40, -238, 18], // The Neon, under the Fizzo Cola billboards
    ["schematic_third_rail_shoe", 240, -182, 14], // 2nd copy: Grand Central, by the old track-crew entrance
    ["schematic_third_rail_shoe", 80, -300, 14], // 3rd copy: Rockefeller checkpoint
    ["schematic_rivet_gun", 80, -207, 16], // 2nd copy: Bryant Park
    ["schematic_rivet_gun", -40, 930, 20], // 3rd copy: Battery Park
    ["schematic_siren_horn", 146, 170, 18], // 2nd copy: downtown
  ];
  const _down = new THREE.Vector3(0, -1, 0);
  /** Open ground near (x,z): a downward ray from 60 m must land near street level (not on a roof/in a building). */
  function findSpot(x, z, rad) {
    const L = G.LAYOUT;
    for (let ring = 0; ring <= 6; ring++) {
      const n = ring ? 8 + ring * 2 : 1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.7,
          r = (ring / 6) * rad;
        const px = x + Math.cos(a) * r,
          pz = z + Math.sin(a) * r;
        if (L && L.isLand && !L.isLand(px, pz)) continue;
        let hit = null;
        try {
          hit = G.world.raycast(new THREE.Vector3(px, 60, pz), _down, 80, {
            ignoreTags: ["actor", "foliage"],
          });
        } catch (e) {
          hit = null;
        }
        const y = hit
          ? hit.point.y
          : G.world.terrainHeight
            ? G.world.terrainHeight(px, pz)
            : 0;
        if (y > 1.4 || y < -0.8) continue;
        if (hit && hit.normal && hit.normal.y < 0.8) continue;
        // the vertical ray marches terrain in 1 m steps: settle on the exact walkable surface
        let gy = y;
        try {
          if (G.world.groundHeight)
            gy = G.world.groundHeight(px, pz, y + 0.8, 0.05);
        } catch (e) {
          gy = y;
        }
        if (!isFinite(gy) || Math.abs(gy - y) > 1.2) gy = y;
        return { x: px, y: gy + 0.02, z: pz };
      }
    }
    return null;
  }
  let placed = false;
  function placeSchematics() {
    if (
      placed ||
      G.isStub("items") ||
      typeof G.items.spawnPickup !== "function"
    )
      return;
    placed = true;
    for (const [id, x0, z0, rad, anchor] of PLACEMENTS) {
      try {
        let x = x0,
          z = z0;
        if (anchor === "cryoExit") {
          const v = G.LAYOUT && G.LAYOUT.cryoExit;
          if (!v) continue;
          x = v.x + 6;
          z = v.z + 7;
        }
        const p = findSpot(x, z, rad);
        if (!p) {
          G.warn && G.warn("weapons: no spot for " + id);
          continue;
        }
        G.items.spawnPickup(id, 1, p, {
          yaw: (x * 13 + z * 7) % 6.28,
          static: true,
          keepY: true,
        });
      } catch (e) {
        G.reportError("weapons:placeSchematic " + id, e);
      }
    }
  }

  // ------------------------------------------------------------------
  // Save / reset / update / wiring
  // ------------------------------------------------------------------
