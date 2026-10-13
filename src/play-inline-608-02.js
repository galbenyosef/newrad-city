// play-inline-608 02 — label
// Lines 366-710 of readable/play-inline-608.pretty.js (statement-aligned).
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
