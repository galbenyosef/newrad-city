/* src/ui_hud/40_menus.js */
/* =====================================================================
 * NEW RAD CITY — UI_HUD : MENUS
 *   TITLE  (state 'title'): camera flies over the ruined skyline under an
 *          original "NEW RAD CITY" title treatment (G.GAME_NAME), Continue /
 *          New Game / Load / Settings / Credits.  New Game goes straight to
 *          the opening (there is no character creation).
 *   PAUSE  (state 'paused'): Resume / Save / Load / Settings / Help /
 *          Quit to Main Menu — a mainframe-style readout.
 *   DEATH  (state 'dead'): flatline, a line of epitaph, Load Last Save /
 *          Load / Main Menu.
 *   LOADING: replaces the core loader with a goggles boot readout + tips.
 * Menus are stacks of "panels" (list + optional side detail) with full
 * keyboard (W/S/↑/↓, Enter, Esc/Backspace, A/D/←/→ for settings) and mouse.
 * ===================================================================== */
(function () {
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

  function pct(v) {
    return Math.round(v * 100) + "%";
  }
  function bar(v) {
    return (
      '<span class="menu-slider"><i style="width:' +
      (H.clamp(v, 0, 1) * 100).toFixed(0) +
      '%"></i></span>'
    );
  }
  function cycle(list, cur, d) {
    const i = list.indexOf(cur);
    return list[(i + d + list.length) % list.length];
  }
  const titleCase = (s) =>
    String(s)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  function settingsPanel(host) {
    const S = H.settings;
    const set = (k, v) => {
      S[k] = v;
      H.saveSettings();
      H.applySettings();
    };
    const slider = (label, k, min, max, step, fmt, desc) => ({
      label,
      desc,
      right: () =>
        bar((S[k] - min) / (max - min)) +
        '<span class="menu-val">' +
        (fmt ? fmt(S[k]) : S[k]) +
        "</span>",
      adjust: (d) =>
        set(k, Math.round(H.clamp(S[k] + d * step, min, max) / step) * step),
    });
    const choice = (label, k, opts, names, desc) => ({
      label,
      desc,
      right: () =>
        '<span class="menu-val">' +
        H.up(names ? names[Math.max(0, opts.indexOf(S[k]))] : S[k]) +
        "</span>",
      adjust: (d) => set(k, cycle(opts, S[k], d)),
    });
    const toggle = (label, k, desc) => ({
      label,
      desc,
      right: () =>
        '<span class="menu-val">' + (S[k] ? "ON" : "OFF") + "</span>",
      adjust: () => set(k, !S[k]),
    });
    // settings owned (and persisted) by the atmosphere module: read the live value from it
    const hasAtmos = () =>
      !G.isStub("atmos") && G.atmos && typeof G.atmos.setQuality === "function";
    const atmosChoice = (label, opts, names, get, put, desc) => ({
      label,
      desc,
      disabled: !hasAtmos(),
      right: () => {
        let v = "high";
        try {
          v = hasAtmos() ? get() || "high" : "n/a";
        } catch (e) {
          v = "high";
        }
        const i = opts.indexOf(v);
        return (
          '<span class="menu-val">' +
          H.up(i >= 0 ? names[i] : String(v)) +
          "</span>"
        );
      },
      adjust: (d) => {
        if (!hasAtmos()) return;
        try {
          put(cycle(opts, get() || "high", d));
        } catch (e) {
          H.warnOnce("atmos.quality", e);
        }
      },
    });
    const atmosToggle = (label, get, put, desc) => ({
      label,
      desc,
      disabled: !hasAtmos(),
      right: () => {
        let v = false;
        try {
          v = hasAtmos() && !!get();
        } catch (e) {
          v = false;
        }
        return (
          '<span class="menu-val">' +
          (hasAtmos() ? (v ? "ON" : "OFF") : "N/A") +
          "</span>"
        );
      },
      adjust: () => {
        if (!hasAtmos()) return;
        try {
          put(!get());
        } catch (e) {
          H.warnOnce("atmos.postfx", e);
        }
      },
    });
    const items = [
      { label: "Audio", disabled: true, cls: "menu-sep" },
      slider("Master volume", "master", 0, 1, 0.05, pct, "Overall loudness."),
      slider(
        "Music volume",
        "music",
        0,
        1,
        0.05,
        pct,
        "Score and radio music.",
      ),
      slider(
        "Effects volume",
        "sfx",
        0,
        1,
        0.05,
        pct,
        "Gunfire, footsteps, the Geiger counter and everything else.",
      ),
      { label: "Controls", disabled: true, cls: "menu-sep" },
      slider(
        "Mouse sensitivity",
        "sensitivity",
        0.2,
        3,
        0.1,
        (v) => v.toFixed(1) + "x",
        "Look speed.",
      ),
      toggle("Invert Y axis", "invertY", "Flip vertical mouse look."),
      { label: "Display", disabled: true, cls: "menu-sep" },
      slider(
        "Field of view",
        "fov",
        55,
        100,
        1,
        (v) => v + "°",
        "Horizontal breadth of vision.",
      ),
      atmosChoice(
        "Graphics quality",
        ["low", "medium", "high"],
        ["Low", "Medium", "High"],
        () => G.atmos.quality,
        (v) => G.atmos.setQuality(v),
        "Shadow resolution, particles, anti-aliasing and effect density. Low is kindest to older machines.",
      ),
      atmosToggle(
        "Post-processing",
        () => G.atmos.isPostFX(),
        (v) => G.atmos.setPostFX(v),
        "Bloom, film grain, the teal colour grade and the screen effects for injury and radiation.",
      ),
      slider(
        "Resolution scale",
        "resScale",
        0.5,
        1.5,
        0.1,
        pct,
        "Lower for more frames per second, higher for sharper edges.",
      ),
    ];
    items.push(
      { label: "Goggles", disabled: true, cls: "menu-sep" },
      slider(
        "HUD opacity",
        "hudOpacity",
        0.3,
        1,
        0.05,
        pct,
        "Transparency of the HUD.",
      ),
      toggle("Crosshair", "crosshair", "Show the aiming reticle."),
      toggle(
        "Minimap places",
        "minimapLocations",
        "Show nearby places on the ring minimap.",
      ),
      {
        label: "Restore defaults",
        action: () =>
          confirmPanel(host, "Restore default settings?", () => {
            H.settings = Object.assign({}, H.DEFAULT_SETTINGS);
            H.saveSettings();
            H.applySettings();
            host.stack.pop();
            settingsPanel(host);
          }),
      },
    );
    host.push({
      title: "Settings",
      cls: "menu-settings",
      items,
      side: (it) =>
        '<div class="menu-side-gl">' +
        H.glyph("goggles") +
        '</div><div class="menu-side-s">' +
        H.esc((it && it.desc) || "") +
        "</div>",
      footer: "<b>&#9664; &#9654;</b> ADJUST &nbsp; <b>ESC</b> BACK",
    });
    host.top().sel = 1;
    host.refresh();
  }
  H.settingsPanel = settingsPanel;
  const CONTROLS = [
    ["W A S D", "Move"],
    ["Mouse", "Look"],
    ["Space", "Jump"],
    ["Shift", "Sprint"],
    ["C", "Crouch / sneak"],
    ["E", "Use / take / talk"],
    ["Left mouse", "Fire / attack"],
    ["Right mouse", "Aim"],
    ["R", "Reload"],
    ["G", "Throw grenade"],
    ["H", "Holster weapon"],
    ["F / Wheel", "1st / 3rd person view"],
    ["Tab / I", "VIGIL goggles"],
    ["M", "City map"],
    ["J", "Quests"],
    ["L", "Goggle lamp"],
    ["1 - 8", "Quick slots"],
    ["F5 / F9", "Quicksave / quickload"],
    ["T", "Wait"],
    ["Esc", "Pause"],
  ];
  function helpPanel(host) {
    host.push({
      title: "Help",
      cls: "menu-help",
      items: [{ label: "Back", action: () => host.pop() }],
      header:
        '<div class="menu-controls">' +
        CONTROLS.map(
          (c) =>
            "<div><b>" +
            H.esc(H.up(c[0])) +
            "</b><span>" +
            H.esc(H.up(c[1])) +
            "</span></div>",
        ).join("") +
        "</div>" +
        '<div class="menu-tip">' +
        H.esc(H.randomTip()) +
        "</div>",
    });
  }
  function creditsPanel(host) {
    host.push({
      title: "Credits",
      cls: "menu-credits",
      items: [{ label: "Back", action: () => host.pop() }],
      header:
        '<div class="menu-credits-roll">' +
        credits()
          .map((c) =>
            c[0]
              ? '<div class="cr-h">' +
                H.esc(H.up(c[0])) +
                "</div>" +
                (c[1] ? '<div class="cr-n">' + H.esc(c[1]) + "</div>" : "")
              : "<br>",
          )
          .join("") +
        "</div>",
    });
  }
  function credits() {
    return [
      [H.gameName(), ""],
      ["Created by", "Chris First"],
      ["Contact", "its@chrisfirst.com"],
      ["X", "@chrisfirst"],
      ["Instagram", "@chrisfirstt"],
      ["", ""],
      ["", "All content original."],
    ];
  }

  // ------------------------------------------------------------------
  // Loading tips (original lore)
  // ------------------------------------------------------------------
  const TIPS = [
    "Rally Tonic heals over a few seconds and mends crippled limbs. Drink it before the fight turns, from Goggles > Status > Vitals or a quick slot.",
    "Crouch to move quietly. The bracket above your crosshair says whether anyone has noticed you.",
    "Radiation adds up. Prussian Blue capsules flush it out over a minute; iodine tabs help you shrug it off for a while.",
    "Federal ration scrip is the only money anyone trusts. Nobody prints it any more, which is exactly why.",
    "Keypad codes turn up in notes, on tape reels, on terminals and scrawled on walls. Every code you find is logged under Goggles > Notes > Codes.",
    "You can always try a keypad code you have not found. The lock does not know how you learned it.",
    "The ring minimap turns with you. Red dots are trouble; the amber diamond is where you are going.",
    "Skills grow by doing. Shoot to get better at shooting, haggle to get better at haggling.",
    "Every second promotion brings an attribute point, and every promotion a new talent.",
    "Weapons in poor condition jam and hit softer. A duplicate and a little Mechanics will fix that.",
    "The Neon in Times Square trades in everything. Prices depend on your Presence and how you have treated people.",
    "The Continuity still broadcasts from somewhere. They believe it is 1967. Do not tell them otherwise on air.",
    "The Iron Covenant collects old-world machines. They are polite to strangers in the way a locked door is polite.",
    "The Glowkeepers call the bomb a sacrament. They will offer you a sun disc. It is not a medal.",
    "Carrying too much slows you down and stops fast travel. Drop the typewriters.",
    "Quicksave with F5 before doing anything brave. Quickload with F9 after doing anything foolish.",
    "Wrecked cars and old fuel drums burn. Stand somewhere else first.",
    "Your goggle lamp (L) helps in the subway. It also helps whatever lives in the subway find you.",
    "Rocky Delgado on Radio Free Manhattan talks about the things you do. Some of it is even true.",
    "Ripjaws are fast, armoured on top and soft underneath. Aim low, or leave.",
    "Shellbacks are plated in front. Flank them, or find something heavier.",
    "World's Fair medallions from 1964 are scattered across the city. The Fair's last curator still buys them back on Grand Central's east balcony.",
    "Sleeping in a bed you own restores health and leaves you well rested.",
    "The water in the East River glows for a reason. Do not drink the East River.",
  ];
  H.randomTip = () => TIPS[Math.floor(Math.random() * TIPS.length)];
  H.TIPS = TIPS;

  // ------------------------------------------------------------------
  // Screens
  // ------------------------------------------------------------------
  const SCR = {};
  H.SCR = SCR;
  // Loading = split checklist: the title logo on the left, a systems checklist on the right that
  // ticks off as each group of modules initialises (red = in progress), a bar and a rotating tip.
  const LOAD_STEPS = [
    [
      "RAISING THE CITY GRID",
      /^(core|textures|sound|atmosphere|render_lighting|map)$/,
    ],
    ["LAYING STREETS AND LANDMARKS", /^(landmarks_|poi_|landmark_interiors)/],
    ["POPULATING THE AVENUES", /^(props|characters|ambient_life|combat)$/],
    ["STOCKING THE SHELVES", /^(rpg|weapons|crafting|arcade)$/],
    ["WRITING THE STORIES", /^(quests|quests_extra|lair)$/],
    ["CALIBRATING VIGIL OPTICS", /^(ui_hud|ui_interact|render_perf)$/],
  ];
  // Friendly loading-screen labels for the raw boot messages ("Initializing poi_harbor…", "Map: subway").
  const LOAD_LABELS = {
    textures: "Painting the city",
    sound: "Tuning the city's sounds",
    atmosphere: "Setting the sky & weather",
    render_lighting: "Hanging the streetlights",
    map: "Laying out Manhattan",
    landmarks_a: "Midtown landmarks",
    landmarks_b: "Downtown & park landmarks",
    poi_uptown: "Central Park West & 57th Street",
    poi_midtown: "Midtown locations",
    poi_village: "The Village & Chinatown",
    poi_financial: "Financial District",
    poi_harbor: "Harbor & Ellis Island",
    poi_roosevelt: "Blackwell's Island",
    poi_bridges: "The East River bridges",
    poi_ues: "Upper East Side",
    poi_theater: "Theater District",
    poi_eastside: "Tudor City & the East Side",
    poi_herald: "Herald Square",
    poi_chelsea: "Chelsea",
    poi_eastvillage: "East Village",
    poi_civic: "Civic Center",
    poi_wallst: "Wall Street",
    poi_midtown3: "Park Avenue",
    poi_penn: "Penn Station & the Post Office",
    poi_village3: "Greenwich Village",
    poi_fidi3: "Lower Manhattan",
    poi_harbor2: "The ferry piers",
    poi_park: "Central Park locations",
    poi_uws: "Upper West Side",
    poi_midtown2: "Midtown museums & hotels",
    landmark_interiors: "Furnishing landmark interiors",
    props: "Dressing the streets",
    characters: "Casting New Yorkers",
    rpg: "Stocking the shelves",
    weapons: "Oiling the armory",
    combat: "Letting the dangers loose",
    ambient_life: "Filling the streets with life",
    crafting: "Setting up the workbenches",
    arcade: "Plugging in the arcade cabinets",
    poi_sandbox: "Finishing touches",
    quests: "Writing the main story",
    quests_extra: "Writing the side stories",
    lair: "Keeping a few secrets",
    ui_interact: "Wiring doors, safes & terminals",
    ui_hud: "Calibrating VIGIL optics",
    core_thirdperson: "Adjusting the camera",
    render_perf: "Warming up the graphics",
    cheats: "Final checks",
  };
  const MAP_LABELS = {
    "shoreline & streets": "Paving the streets",
    "Central Park": "Planting Central Park",
    "street details": "Placing street details",
    buildings: "Raising the skyline",
    billboards: "Pasting up the billboards",
    "twenty-two years of decay": "Adding twenty-two years of decay",
    "Cryo Unit C-9": "Sealing Cryo Unit C-9",
    subway: "Digging the subway",
    dungeons: "Opening the cellars & hideouts",
    meshes: "Assembling the city",
  };
  function loadLabel(text) {
    const t = String(text);
    let m = /^Initializing (\S+?)…?$/.exec(t);
    if (m) return LOAD_LABELS[m[1]] || "Preparing the city";
    m = /^Map: (.+)$/.exec(t);
    if (m) return MAP_LABELS[m[1]] || m[1];
    m = /^Furnishing (.+?)…?$/.exec(t);
    if (m)
      return (
        "Furnishing " + m[1].replace(/\b\w/g, (c) => c.toUpperCase()) + "…"
      );
    return t; // "Raising the Empire State Building…", "Restoring …", "Ready." are already readable
  }
  function buildLoading() {
    const l = H.el("div", "menu-loading", document.body);
    // the logo gets its own SVG ids so its filters never resolve to the (hidden) title-screen copy
    const art = logoHTML()
      .replace(/id="nl/g, 'id="nlL')
      .replace(/url\(#nl/g, "url(#nlL");
    // The radar ping, sweep and triangle glow are plain HTML layers animated with transform/opacity only,
    // so the compositor keeps them moving smoothly while module init blocks the main thread.
    const fx =
      '<i class="ml-disc"></i><i class="ml-sweep"></i><i class="ml-ping"></i><i class="ml-ping p2"></i><i class="ml-glow"><b></b></i>';
    l.innerHTML =
      '<div class="menu-loading-logo">' +
      fx +
      art +
      '</div><div class="menu-loading-div"></div>' +
      '<div class="menu-loading-side"><div class="menu-loading-h">SYSTEMS</div>' +
      '<div class="menu-loading-chk">' +
      LOAD_STEPS.map(
        (st) =>
          '<div class="wait"><span>' +
          st[0] +
          "</span><b>&middot;&middot;&middot;</b></div>",
      ).join("") +
      "</div>" +
      '<div class="menu-loading-dest"><small>TRAVELLING TO</small><div class="menu-loading-dname"></div></div>' +
      '<div class="menu-loading-bar"><i></i></div><div class="menu-loading-text"></div>' +
      '<div class="menu-loading-tip"></div></div><div class="menu-loading-scan"></div>';
    return {
      el: l,
      tip: l.querySelector(".menu-loading-tip"),
      bar: l.querySelector(".menu-loading-bar i"),
      text: l.querySelector(".menu-loading-text"),
      rows: Array.from(l.querySelectorAll(".menu-loading-chk > div")),
      dname: l.querySelector(".menu-loading-dname"),
      dhead: l.querySelector(".menu-loading-dest small"),
      step: 0,
    };
  }
  function setLoadingStep(L, k, done) {
    L.step = Math.max(L.step, k);
    L.rows.forEach((r, i) => {
      const st = done || i < L.step ? "ok" : i === L.step ? "now" : "wait";
      if (r.className !== st) {
        r.className = st;
        r.lastChild.textContent =
          st === "ok" ? "OK" : st === "now" ? ">>" : "···";
      }
    });
  }
  function buildScreens() {
    // ---- TITLE ----
    const t = H.el("div", "menu-screen menu-title", H.uiRoot);
    t.innerHTML =
      '<div class="menu-letterbox top"></div><div class="menu-letterbox bot"></div>' +
      '<div class="menu-grain"></div><div class="menu-title-shade"></div><div class="menu-title-scan"></div>' +
      '<div class="menu-logo">' +
      logoHTML() +
      "</div>" +
      '<div class="menu-press">[ PRESS ANY KEY ]</div>' +
      '<div class="menu-title-menu"></div>' +
      '<div class="menu-title-foot"><span>V' +
      H.esc(G.VERSION || "0.1") +
      "</span></div>";
    SCR.title = {
      el: t,
      host: H.menuHost(t.querySelector(".menu-title-menu")),
      press: t.querySelector(".menu-press"),
    };
    t.addEventListener("mousedown", () => {
      if (SCR.title.waiting) titleProceed();
    });
    // ---- PAUSE ----
    const p = H.el("div", "menu-screen menu-pause", H.uiRoot);
    p.innerHTML =
      '<div class="menu-pause-bg"></div><div class="menu-crt"><i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i><div class="menu-crt-in"></div><div class="menu-crt-fx"></div></div>';
    SCR.pause = { el: p, host: H.menuHost(p.querySelector(".menu-crt-in")) };
    // ---- DEATH ----
    const d = H.el("div", "menu-screen menu-death", H.uiRoot);
    d.innerHTML =
      '<div class="menu-death-fade"></div><div class="menu-death-body"><svg class="menu-death-line" viewBox="0 0 600 80" preserveAspectRatio="none"><path d="M0 40 H220 L238 14 L256 66 L272 30 L284 40 H600"/></svg>' +
      '<div class="menu-death-title">SIGNAL LOST</div><div class="menu-death-quote"></div><div class="menu-death-menu"></div></div>';
    SCR.dead = { el: d, host: H.menuHost(d.querySelector(".menu-death-menu")) };
    // ---- LOADING ----
    SCR.loading = buildLoading();
    for (const k of ["title", "pause", "dead"])
      SCR[k].el.style.display = "none";
  }
  function hideAllScreens() {
    for (const k of ["title", "pause", "dead"])
      if (SCR[k]) {
        SCR[k].el.style.display = "none";
        SCR[k].host.clear();
      }
  }

  /**
   * Title logo: civil-defense siren rings with a slow sonar ping and sweep, the red CD triangle behind
   * the name, in the VIGIL palette with a CRT finish (bloom, colour fringing, flicker, noise).
   */
  function logoHTML() {
    const name = H.esc(H.up(H.gameName()));
    let rings = "";
    for (let i = 1; i < 5; i++)
      rings +=
        '<circle class="nl-ring" cx="800" cy="450" r="' +
        (170 + i * 150) +
        '" stroke-width="2"/>';
    return (
      '<svg class="nrc-logo" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
      name +
      '">' +
      '<defs><filter id="nlBloom" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '<filter id="nlNoise"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .8  0 0 0 0 .93  0 0 0 0 .98  0 0 0 1.2 -.35"/></filter>' +
      '<radialGradient id="nlSweep" cx="0" cy="0" r="1"><stop offset="0" stop-color="#cfeefa" stop-opacity=".18"/><stop offset="1" stop-color="#cfeefa" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="nlBand" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#04080b" stop-opacity="0"/><stop offset=".18" stop-color="#04080b" stop-opacity=".92"/><stop offset=".82" stop-color="#04080b" stop-opacity=".92"/><stop offset="1" stop-color="#04080b" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="nlRule" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#cfeefa" stop-opacity="0"/><stop offset=".2" stop-color="#cfeefa" stop-opacity=".55"/><stop offset=".8" stop-color="#cfeefa" stop-opacity=".55"/><stop offset="1" stop-color="#cfeefa" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="nlDisc" cx=".5" cy=".5" r=".5"><stop offset=".45" stop-color="#04080b" stop-opacity=".78"/><stop offset="1" stop-color="#04080b" stop-opacity="0"/></radialGradient></defs>' +
      '<ellipse cx="800" cy="450" rx="900" ry="520" fill="url(#nlDisc)"/>' +
      "<g>" +
      rings +
      "</g>" +
      '<g class="nl-sweep"><path d="M800,450 L1800,450 A1000,1000 0 0 0 1666,-50 Z" fill="url(#nlSweep)"/></g>' +
      '<circle class="nl-ping" cx="800" cy="450" r="820"/><circle class="nl-ping p2" cx="800" cy="450" r="820"/>' +
      '<g class="nl-tri"><polygon points="800,150 1080,640 520,640" fill="rgba(255,90,74,.16)" stroke="#ff5a4a" stroke-width="10" stroke-linejoin="round"/>' +
      "</g>" +
      '<rect x="150" y="384" width="1300" height="150" fill="url(#nlBand)"/>' +
      '<rect x="150" y="383" width="1300" height="2" fill="url(#nlRule)"/><rect x="150" y="533" width="1300" height="2" fill="url(#nlRule)"/>' +
      '<g font-size="96" text-anchor="middle"><text class="nl-t nl-fr" x="800" y="494">' +
      name +
      '</text><text class="nl-t nl-fb" x="800" y="494">' +
      name +
      "</text>" +
      '<text class="nl-t nl-glow" x="800" y="494">' +
      name +
      "</text></g>" +
      '<rect width="1600" height="900" filter="url(#nlNoise)" class="nl-noise"/>' +
      "</svg>"
    );
  }

  // ---------------- TITLE ----------------
  function showTitle() {
    hideAllScreens();
    const T = SCR.title;
    T.el.style.display = "";
    T.el.classList.remove("menu-open");
    T.waiting = !(G.SHOT || G.SMOKE || H.titleSeen);
    if (!T.waiting) titleMenu();
    else {
      T.press.style.display = "";
    }
    try {
      if (G.music && G.music.setMood) G.music.setMood("title");
    } catch (e) {
      /* stub */
    }
    H.titleCam.start();
  }
  function titleProceed() {
    const T = SCR.title;
    if (!T.waiting) return;
    T.waiting = false;
    H.titleSeen = true;
    H.sfx("ui_select");
    try {
      if (G.music && G.music.play) G.music.play("title");
    } catch (e) {
      /* stub */
    }
    titleMenu();
  }
  function titleMenu() {
    const T = SCR.title;
    T.press.style.display = "none";
    T.el.classList.add("menu-open");
    T.host.clear();
    const hasSave = G.save.hasAny();
    T.host.push({
      cls: "menu-main",
      items: [
        {
          label: "Continue",
          disabled: !hasSave,
          action: () => {
            const s = G.save.listSlots()[0];
            if (s) doLoad(s.slot);
          },
        },
        { label: "New game", action: newGame },
        { label: "Load", disabled: !hasSave, action: () => loadPanel(T.host) },
        { label: "Settings", action: () => settingsPanel(T.host) },
        { label: "Credits", action: () => creditsPanel(T.host) },
      ],
      onBack: () => true,
    });
  }
  /** New game: straight into the opening (no character creation). */
  function newGame() {
    const go = () => {
      hideAllScreens();
      H.titleCam.stop();
      if (G.intro && typeof G.intro.start === "function") {
        G.intro.start();
        return;
      }
      // the opening sequence currently lives in the 'chargen' state of ui_interact
      if (!G.isStub("dialogue") && !G.isStub("ui")) G.setState("chargen");
      else G.newGame({ name: H.heroName() });
    };
    if (G.save.hasAny())
      confirmPanel(
        SCR.title.host,
        "Start a new game?",
        go,
        "New game",
        "Cancel",
      );
    else go();
  }
  // Remove core's fallback "click to start" overlay if it was created
  function killCoreFallback() {
    for (const d of Array.from(document.body.children)) {
      if (
        d.tagName === "DIV" &&
        /core fallback title/.test(d.textContent || "") &&
        d.id !== "ui-root"
      )
        d.remove();
    }
  }

  // ---------------- TITLE CAMERA (flyover) ----------------
  // Fixed order: the bridge opens the loop, then Times Square, Liberty, then the rest.
  const SHOTS = [
    {
      from: [470, 28, 540],
      to: [430, 34, 590],
      look0: [330, 45, 640],
      look1: [300, 50, 640],
      dur: 15,
    }, // East River: Brooklyn Bridge towers
    {
      from: [-150, 95, -330],
      to: [-80, 80, -250],
      look0: [80, 110, -72],
      look1: [90, 100, -72],
      dur: 16,
    }, // over Times Square toward the Empire State
    {
      from: [-260, 30, 1120],
      to: [-300, 40, 1170],
      look0: [-420, 70, 1250],
      look1: [-420, 75, 1250],
      dur: 15,
    }, // Statue of Liberty from the bay
    {
      from: [-40, 170, 520],
      to: [30, 150, 420],
      look0: [70, 70, -150],
      look1: [80, 60, -200],
      dur: 17,
    }, // aerial skyline from the south
    {
      from: [60, 110, -380],
      to: [10, 90, -500],
      look0: [-20, 10, -720],
      look1: [-40, 10, -760],
      dur: 16,
    }, // over Central Park, north toward the blast
  ];
  const TC = { on: false, t: 0, i: 0, fade: null };
  H.titleCam = TC;
  TC.start = function () {
    TC.on = true;
    TC.t = 0;
    TC.i = 0;
    if (G.SHOT) {
      // review hook: ?state=title&titleShot=i&titleT=seconds
      TC.i = H.clamp(
        Number((G.QS && G.QS.get("titleShot")) || 3) | 0,
        0,
        SHOTS.length - 1,
      );
      TC.t = H.clamp(
        Number((G.QS && G.QS.get("titleT")) || 0),
        0,
        SHOTS[TC.i].dur - 2.5,
      );
    }
    if (G.player) G.player.camOverride = true;
    try {
      if (G.atmos && !G.isStub("atmos") && G.atmos.setHour)
        G.atmos.setHour(17.6);
      else if (G.time) G.time.hour = 17.6;
    } catch (e) {
      /* ignore */
    }
    if (!TC.fade) {
      TC.fade = H.el("div", "menu-title-fade", SCR.title.el);
    }
  };
  TC.stop = function () {
    TC.on = false;
    if (G.player) G.player.camOverride = false;
    if (G.camera) {
      G.camera.fov = G.player.fovCurrent || 72;
      G.camera.updateProjectionMatrix();
    }
  };
  const _a = THREE ? new THREE.Vector3() : null,
    _b = THREE ? new THREE.Vector3() : null;
  TC.update = function (realDt) {
    if (!TC.on || !G.camera || !THREE) return;
    TC.t += realDt;
    let s = SHOTS[TC.i];
    if (TC.t > s.dur) {
      TC.t = 0;
      TC.i = (TC.i + 1) % SHOTS.length;
      s = SHOTS[TC.i];
    }
    const u = G.util.smoothstep(0, 1, TC.t / s.dur);
    _a.set(
      H.lerp(s.from[0], s.to[0], u),
      H.lerp(s.from[1], s.to[1], u),
      H.lerp(s.from[2], s.to[2], u),
    );
    _b.set(
      H.lerp(s.look0[0], s.look1[0], u),
      H.lerp(s.look0[1], s.look1[1], u),
      H.lerp(s.look0[2], s.look1[2], u),
    );
    const cam = G.camera;
    cam.position.copy(_a);
    cam.up.set(0, 1, 0);
    cam.lookAt(_b);
    if (Math.abs(cam.fov - 55) > 0.01) {
      cam.fov = 55;
      cam.updateProjectionMatrix();
    }
    G.player.pos.set(_a.x, 0, _a.z); // keep shadow camera, LOD and ambience near the shot
    const edge = Math.min(TC.t, s.dur - TC.t);
    if (TC.fade)
      TC.fade.style.opacity = String(H.clamp(1 - edge / 1.1, 0, 1).toFixed(2));
  };

  // ---------------- PAUSE ----------------
  function showPause() {
    hideAllScreens();
    const P = SCR.pause;
    P.el.style.display = "";
    P.opened = H.stateAge;
    P.host.push({
      title: "Paused",
      cls: "menu-pausemain",
      header:
        '<div class="menu-pause-info">' +
        H.esc(H.up(H.heroName())) +
        " &middot; " +
        H.esc(H.up(H.placeName())) +
        " &middot; " +
        H.gameDate() +
        " " +
        H.gameClock() +
        "</div>",
      items: [
        { label: "Resume", action: resume },
        {
          label: "Save",
          disabled: !G.player.alive,
          action: () => savePanel(P.host),
        },
        { label: "Load", action: () => loadPanel(P.host) },
        { label: "Settings", action: () => settingsPanel(P.host) },
        { label: "Help", action: () => helpPanel(P.host) },
        {
          label: "Quit to main menu",
          action: () =>
            confirmPanel(
              P.host,
              "Quit to the main menu? Unsaved progress will be lost.",
              quitToTitle,
              "Quit",
              "Cancel",
            ),
        },
      ],
      side: () =>
        '<div class="menu-side-gl">' +
        H.glyph("hint") +
        '</div><div class="menu-side-s">' +
        H.esc(H.randomTip()) +
        "</div>",
      onBack: () => {
        resume();
        return true;
      },
    });
  }
  function resume() {
    hideAllScreens();
    G.setState("play");
  }
  /**
   * Quit to the main menu.  Core has no quit API, so the UI emits 'reset'
   * ({loading:false, toTitle:true}) itself.  Every overlay of ours is closed and
   * the time scale restored before the emit.
   */
  function quitToTitle() {
    hideAllScreens();
    try {
      if (H.END && H.END.on && H.END.cleanup) H.END.cleanup();
    } catch (e) {
      /* ignore */
    }
    try {
      if (H.LV && H.LV.open && H.LV.close) {
        H.LV.pending = false;
        H.LV.close();
      }
    } catch (e) {
      /* ignore */
    }
    try {
      if (H.WAIT && H.WAIT.open && H.WAIT.hide) H.WAIT.hide();
    } catch (e) {
      /* ignore */
    }
    G.timeScale = 1;
    H.hudForcedHidden = false;
    G.events.emit("reset", { loading: false, toTitle: true });
    G.setState("title");
  }
  H.quitToTitle = quitToTitle;

  // ---------------- DEATH ----------------
  const DEATH_QUOTES = [
    "Twenty-two years asleep, and the city still got the last word.",
    "The Office of Civil Defense regrets that your volunteer contract has been concluded.",
    "Somewhere a giant roach is telling the others about you.",
    'The goggles logged it under "lessons".',
    "Manhattan takes another tenant. Rent was always too high here.",
    "Death is only a setback if you forgot to save.",
    "They will name a crater after you. A small one.",
    "Lady Liberty has seen worse. Not much worse, though.",
  ];
  function showDeath() {
    hideAllScreens();
    const D = SCR.dead;
    D.el.style.display = "";
    D.el.classList.remove("in");
    void D.el.offsetWidth;
    D.el.classList.add("in");
    D.el.querySelector(".menu-death-quote").textContent =
      DEATH_QUOTES[Math.floor(Math.random() * DEATH_QUOTES.length)];
    const last = G.save.listSlots()[0];
    D.host.push({
      cls: "menu-deathmenu",
      items: [
        {
          label: "Load last save",
          disabled: !last,
          action: () => last && doLoad(last.slot),
        },
        {
          label: "Load game",
          disabled: !last,
          action: () => loadPanel(D.host),
        },
        { label: "Main menu", action: quitToTitle },
      ],
      onBack: () => true,
    });
    try {
      if (G.music && G.music.stop) G.music.stop();
    } catch (e) {
      /* stub */
    }
  }

  // ---------------- LOADING ----------------
  let loadingShown = false,
    tipT = 0;
  H.showLoading = function (text, frac, quick) {
    const L = SCR.loading;
    if (!L) return;
    if (!loadingShown) {
      loadingShown = true;
      L.el.classList.add("on");
      L.el.classList.toggle("quick", !!quick);
      L.tip.textContent = H.randomTip();
      tipT = 0;
    }
    if (text !== undefined) {
      L.text.textContent = H.up(loadLabel(text));
      const m = /^Initializing (\S+?)…?$/.exec(String(text));
      if (m) {
        const k = LOAD_STEPS.findIndex((st) => st[1].test(m[1]));
        if (k >= 0) setLoadingStep(L, k);
      }
    }
    if (frac !== undefined) {
      L.bar.style.width = Math.round(H.clamp(frac, 0, 1) * 100) + "%";
      if (frac >= 1 && !quick) setLoadingStep(L, LOAD_STEPS.length - 1, true);
    }
  };
  H.hideLoading = function () {
    if (!SCR.loading) return;
    loadingShown = false;
    SCR.loading.el.classList.remove("on");
  };
  /** Quick-mode loading card ("TRAVELLING TO" / "RETURNING TO" + a place name). */
  H.setLoadingDest = function (head, name) {
    if (!SCR.loading) return;
    SCR.loading.dhead.textContent = H.up(head);
    SCR.loading.dname.textContent = H.up(name || "");
  };
  G.savePlace = () => H.placeName(); // stored with each save so loading it can say where you're going
  H.showTravel = function (name) {
    H.setLoadingDest("TRAVELLING TO", name);
    H.showLoading("Travelling to " + name + "...", 1, true);
    setTimeout(H.hideLoading, 1400);
  };

  // ------------------------------------------------------------------
  // Autosave — rotating slots auto1..auto3 (the oldest is overwritten).
  // Triggers: door transitions (>= 90 s apart), main-quest start/completion,
  // location discovered (>= 3 min apart), fast-travel arrival, closing the Wait
  // dialog, closing the level-up screen, and every 8 min of actual play.
  // A request is only *armed*; the save itself happens once the player is in
  // 'play', alive, out of combat and settled.
  // ------------------------------------------------------------------
  const AUTO_SLOTS = ["auto1", "auto2", "auto3"];
  const AS = {
    pending: null,
    playT: 0,
    lastAt: -1e9,
    lastDisc: -1e9,
    lastDoor: -1e9,
    busy: false,
  };
  const AUTO_PERIOD = 8 * 60;
  const AUTO_MIN_GAP = 30;
  H.isAutoSlot = (slot) => /^auto\d*$/.test(String(slot || ""));
  function nextAutoSlot() {
    const times = {};
    try {
      for (const s of G.save.listSlots()) times[s.slot] = s.time || 0;
    } catch (e) {
      /* ignore */
    }
    let best = AUTO_SLOTS[0],
      bt = Infinity;
    for (const k of AUTO_SLOTS) {
      const t = times[k] === undefined ? -1 : times[k];
      if (t < bt) {
        bt = t;
        best = k;
      }
    }
    return best;
  }
  function autosaveAllowed() {
    return (
      !G.SMOKE &&
      !G.SHOT &&
      G.state === "play" &&
      G.player &&
      G.player.alive &&
      !H.combatActive() &&
      !H.hudForcedHidden &&
      !(H.waitOpen && H.waitOpen())
    );
  }
  function requestAutosave(reason, delay) {
    if (G.SMOKE || G.SHOT) return;
    const d = delay === undefined ? 1.2 : delay;
    if (G.state === "title" || G.state === "loading") return;
    if (AS.pending) {
      AS.pending.delay = Math.max(AS.pending.delay, d);
      AS.pending.reason += "+" + reason;
      return;
    }
    AS.pending = { reason: String(reason || "auto"), delay: d, age: 0 };
  }
  H.requestAutosave = requestAutosave;
  function doAutosave() {
    const slot = nextAutoSlot();
    AS.pending = null;
    AS.lastAt = performance.now() / 1000;
    AS.playT = 0;
    G.notify("Autosaving…", { kind: "autosave" });
    const H2 = H.HUD;
    if (H2) H2.autosaving = true;
    let ok = false;
    try {
      ok = G.save.saveGame(slot, saveLabel());
    } catch (e) {
      ok = false;
    }
    if (H2) H2.autosaving = false;
    if (!ok) G.notify("Autosave failed.", { color: "red" });
    return ok;
  }
  function wireAutosave() {
    const on = G.events.on;
    const now = () => performance.now() / 1000;
    const isMain = (q) => {
      if (!q) return false;
      if (q.main) return true;
      const id = typeof q === "string" ? q : q.id;
      const d =
        typeof q === "string" ? H.call("quests", "get", [q], null) : null;
      return !!(d && d.main) || /^mq\d/.test(String(id || ""));
    };
    on("doorTransition", () => {
      if (now() - AS.lastDoor < 90) return;
      AS.lastDoor = now();
      requestAutosave("door", 1.0);
    });
    on("questStarted", (q) => {
      if (isMain(q)) requestAutosave("mainQuestStarted", 1.5);
    });
    on("questCompleted", (q) => {
      if (isMain(q)) requestAutosave("mainQuestCompleted", 1.5);
    });
    on("locationDiscovered", () => {
      if (G.state === "title" || G.state === "loading" || G.state === "chargen")
        return;
      if (now() - AS.lastDisc < 180) return;
      AS.lastDisc = now();
      requestAutosave("discovered", 2.0);
    });
    on("fastTravel", () => requestAutosave("fastTravel", 1.6));
    on("reset", () => {
      AS.pending = null;
      AS.playT = 0;
    });
    on("newGame", () => {
      AS.pending = null;
      AS.playT = 0;
      AS.lastDisc = now();
      AS.lastAt = now();
    });
    on("loaded", () => {
      AS.pending = null;
      AS.playT = 0;
      AS.lastDisc = now();
      AS.lastAt = now();
    });
  }
  function updateAutosave(realDt) {
    if (G.SMOKE || G.SHOT) return;
    const inPlay = G.state === "play" && G.player && G.player.alive;
    if (inPlay) {
      AS.playT += realDt;
      if (AS.playT >= AUTO_PERIOD && !AS.pending) requestAutosave("timer", 0.5);
    }
    const p = AS.pending;
    if (!p) return;
    if (!inPlay) {
      p.settle = 0;
      return;
    }
    p.settle = (p.settle || 0) + realDt;
    if (p.settle < p.delay || H.stateAge < p.delay) return;
    if (!autosaveAllowed()) return;
    if (performance.now() / 1000 - AS.lastAt < AUTO_MIN_GAP) {
      if (p.reason === "timer") AS.pending = null;
      return;
    }
    doAutosave();
  }

  // ------------------------------------------------------------------
  // Keyboard routing
  // ------------------------------------------------------------------
  function onKey(code, e) {
    const I = G.input;
    let host = null;
    if (G.state === "title" && SCR.title.el.style.display !== "none") {
      if (SCR.title.waiting) {
        titleProceed();
        I.consume(code);
        return;
      }
      host = SCR.title.host;
    } else if (G.state === "paused" && SCR.pause.el.style.display !== "none") {
      if (code === "Escape" && SCR.pause.host.stack.length === 1) {
        if (H.stateAge < 0.35) {
          I.consume(code);
          return;
        } // ignore the key that opened the menu
        resume();
        I.consume(code);
        return;
      }
      host = SCR.pause.host;
    } else if (G.state === "dead" && SCR.dead.el.style.display !== "none")
      host = SCR.dead.host;
    if (host && host.onKey(code, e)) I.consume(code);
  }

  // ------------------------------------------------------------------
  // Part
  // ------------------------------------------------------------------
  H.part({
    name: "menus",
    order: 50,
    init() {
      buildScreens();
      G.events.on("keydown", onKey);
      G.events.on("state", (s, prev, data) => {
        const waiting =
          s === "paused" &&
          ((data && data.wait) || (H.waitOpen && H.waitOpen()));
        if (s === "title") {
          showTitle();
          setTimeout(killCoreFallback, 0);
        } else if (prev === "title") {
          TC.stop();
          if (s !== "paused") hideAllScreens();
        }
        if (s === "paused" && !waiting) showPause();
        else if (prev === "paused" && SCR.pause.el.style.display !== "none")
          hideAllScreens();
        if (prev === "dead" && s !== "dead") hideAllScreens();
      });
      G.events.on("initDone", () => {
        H.hideLoading();
      });
      G.events.on("loaded", () => {
        H.hideLoading();
        hideAllScreens();
        TC.stop();
      });
      G.events.on("newGame", () => {
        hideAllScreens();
        TC.stop();
      });
      wireAutosave();
      if (G.state === "title") showTitle();
    },
    update(dt, realDt) {
      const s = G.state;
      if (s === "play" && H.prevState === "play") {
        if (G.input.actionPressed("pause")) {
          G.input.consumeAction("pause");
          G.setState("paused");
        }
      }
      updateAutosave(realDt);
      if (s === "title" && SCR.title.el.style.display === "none") showTitle();
      if (
        s === "dead" &&
        SCR.dead.el.style.display === "none" &&
        (H.stateAge > 0.9 || G.SHOT)
      )
        showDeath();
      if (
        s === "paused" &&
        SCR.pause.el.style.display === "none" &&
        !(H.waitOpen && H.waitOpen())
      )
        showPause();
      if (loadingShown) {
        tipT += realDt;
        if (tipT > 7) {
          tipT = 0;
          SCR.loading.tip.textContent = H.randomTip();
        }
      }
    },
    lateUpdate(dt, realDt) {
      if (G.state === "title") TC.update(realDt);
    },
  });

  // The loading screen hooks up before init (core emits loadingProgress during boot)
  let firstProgress = true;
  G.events.on("loadingProgress", (text, frac) => {
    if (!SCR.loading) {
      try {
        SCR.loading = buildLoading();
        SCR.loading.early = true;
      } catch (e) {
        return;
      }
    }
    if (firstProgress) {
      firstProgress = false;
      const c = document.getElementById("core-loading");
      if (c) c.style.visibility = "hidden";
    }
    H.showLoading(text, frac);
  });
  // buildScreens() must reuse the early loading screen if it exists
  const _build = buildScreens;
  buildScreens = function () {
    // eslint-disable-line no-func-assign
    const early = SCR.loading;
    _build();
    if (early && early.early) {
      SCR.loading.el.remove();
      SCR.loading = early;
    }
  };

  Object.assign(G.hud, {
    showTitle,
    showPause,
    showDeath,
    showLoading: (t, f) => H.showLoading(t, f),
    hideLoading: () => H.hideLoading(),
    openSettings() {
      if (G.state === "paused") settingsPanel(SCR.pause.host);
      else if (G.state === "title") settingsPanel(SCR.title.host);
    },
    tips: () => TIPS.slice(),
  });
})();
