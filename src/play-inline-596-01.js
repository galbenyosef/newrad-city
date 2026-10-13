// play-inline-596 01 — the
// Lines 17-361 of readable/play-inline-596.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  // ------------------------------------------------------------------
  // Shared internal object
  // ------------------------------------------------------------------
  const H = {
    parts: [],
    root: null, // #hud-layer container (inside #ui-root)
    settings: null,
    inCombat: false,
    stateAge: 0, // seconds spent in the current G.state
    prevState: null, // state at the end of the previous frame
    stats: {
      kills: 0,
      locations: 0,
      questsDone: 0,
      tonics: 0,
      scrip: 0,
      deaths: 0,
      headshots: 0,
      playSeconds: 0,
      crits: 0,
      flushes: 0,
    },
  };

  /** Register a sub-part: {name, order, init(), update(dt, realDt), lateUpdate(dt, realDt)} */
  H.part = function (p) {
    H.parts.push(p);
    H.parts.sort((a, b) => (a.order || 0) - (b.order || 0));
    return p;
  };

  // ------------------------------------------------------------------
  // DOM helpers
  // ------------------------------------------------------------------
  /** Create element: H.el('div', 'hud-x hud-y', parent, 'inner html') */
  H.el = function (tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined && html !== null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  H.esc = function (s) {
    return String(s === undefined || s === null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  };
  /** Set textContent only when changed (cheap per-frame DOM updates). */
  H.setText = function (el, t) {
    t = String(t);
    if (el._t !== t) {
      el._t = t;
      el.textContent = t;
    }
  };
  H.setHTML = function (el, t) {
    if (el._h !== t) {
      el._h = t;
      el.innerHTML = t;
    }
  };
  H.setStyle = function (el, prop, v) {
    const k = "_s_" + prop;
    if (el[k] !== v) {
      el[k] = v;
      if (prop.charCodeAt(0) === 45) el.style.setProperty(prop, v);
      else el.style[prop] = v;
    }
  };
  H.toggle = function (el, cls, on) {
    on = !!on;
    const k = "_c_" + cls;
    if (el[k] !== on) {
      el[k] = on;
      el.classList.toggle(cls, on);
    }
  };
  H.show = function (el, on) {
    H.setStyle(el, "display", on ? "" : "none");
  };

  H.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  H.lerp = (a, b, t) => a + (b - a) * t;
  H.pct = (v, max) => (max > 0 ? H.clamp(v / max, 0, 1) : 0);
  /** "Field Medicine" → "F I E L D  M E D I C I N E"-style tracking is done in CSS; this only uppercases. */
  H.up = (s) => String(s === undefined || s === null ? "" : s).toUpperCase();

  /** Call into another module defensively; returns fallback on stub/missing/throw. */
  H.call = function (ns, fn, args, fallback) {
    try {
      const o = G[ns];
      if (!o || o.__stub || typeof o[fn] !== "function") return fallback;
      const r = o[fn].apply(o, args || []);
      return r === undefined ? fallback : r;
    } catch (e) {
      H.warnOnce(ns + "." + fn, e);
      return fallback;
    }
  };
  /** First function of `names` that exists on G[ns] → its result (else fallback). */
  H.callAny = function (ns, names, args, fallback) {
    const o = G[ns];
    if (!o || o.__stub) return fallback;
    for (const n of names)
      if (typeof o[n] === "function") return H.call(ns, n, args, fallback);
    return fallback;
  };
  H.has = function (ns, fn) {
    const o = G[ns];
    return !!(o && !o.__stub && (!fn || typeof o[fn] === "function"));
  };
  const warned = new Set();
  H.warnOnce = function (key, e) {
    if (warned.has(key)) return;
    warned.add(key);
    console.warn(
      "[ui_hud] " + key + " failed:",
      e && e.message ? e.message : e,
    );
  };

  /** Play a UI sound (no-op when sound module absent or the id is unknown to it). */
  H.sfx = function (name, opts) {
    try {
      if (G.sfx && G.sfx.play) G.sfx.play(name, opts || { volume: 0.7 });
    } catch (e) {
      /* ignore */
    }
  };

  /** Item display name. */
  H.itemName = function (id) {
    const d = H.call("items", "get", [id], null);
    return (
      (d && d.name) ||
      String(id || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    );
  };

  /** The fixed protagonist's name (never hard-coded). */
  H.heroName = function () {
    return (G.HERO && G.HERO.name) || (G.player && G.player.name) || "Stranger";
  };
  /** The game's title. */
  H.gameName = function () {
    return G.GAME_NAME || "New Rad City";
  };

  /** In-game date, 1989 calendar.  Day 1 = the morning the hero wakes. */
  const DAY1 = (G.CALENDAR && G.CALENDAR.start) || [1989, 3, 2]; // [year, monthIndex, day] → 04.02.1989
  H.gameDate = function () {
    const t = G.time || { day: 1, hour: 9.5 };
    const base = new Date(Date.UTC(DAY1[0], DAY1[1], DAY1[2]));
    base.setUTCDate(base.getUTCDate() + Math.max(0, (t.day || 1) - 1));
    const mm = String(base.getUTCMonth() + 1).padStart(2, "0"),
      dd = String(base.getUTCDate()).padStart(2, "0");
    return mm + "." + dd + "." + base.getUTCFullYear();
  };
  H.gameClock = function () {
    const h = ((G.time && G.time.hour) || 0) % 24;
    const hh = Math.floor(h),
      mm = Math.floor((h - hh) * 60);
    return String(hh).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
  };

  /** Radiation dose stored on an object (default: the player's accumulated dose). */
  H.radsOf = (o) => {
    o = o === undefined ? G.player : o;
    return Number(o && o.rads) || 0;
  };

  /** Current location / district name for save labels & HUD. */
  H.placeName = function () {
    const L = G.LAYOUT,
      p = G.player && G.player.pos;
    if (!L || !p) return "The Ruins";
    if (L.isInterior(p.x)) {
      let best = null,
        bd = 1e9;
      for (const k in L.INTERIORS) {
        const o = L.INTERIORS[k].origin;
        const d = Math.hypot(p.x - o.x, p.z - o.z);
        if (d < bd) {
          bd = d;
          best = L.INTERIORS[k];
        }
      }
      return best && bd < 220
        ? best.name.replace(/^\(.*\)$/, "Interior")
        : "Interior";
    }
    const loc = L.locationAt(p.x, p.z);
    if (loc) return loc.name;
    const d = L.districtAt(p.x, p.z);
    return H.DISTRICT_NAMES[d] || "Manhattan Ruins";
  };
  H.DISTRICT_NAMES = {
    upper_west_side: "Upper West Side",
    upper_east_side: "Upper East Side",
    midtown: "Midtown Ruins",
    midtown_south: "Midtown South",
    greenwich_village: "Greenwich Village",
    financial_district: "Financial District",
    brooklyn: "Brooklyn Waterfront",
    harbor: "Upper Bay",
    water: "East River",
    central_park: "Central Park",
    interior: "Interior",
  };

  // ------------------------------------------------------------------
  // Settings (persisted in localStorage; applied at init)
  // ------------------------------------------------------------------
  const SETTINGS_KEY = "nrc_settings";
  H.DEFAULT_SETTINGS = {
    master: 0.9,
    music: 0.7,
    sfx: 0.9,
    sensitivity: 1.0,
    invertY: false,
    fov: 72,
    resScale: 1.0,
    grading: null,
    tint: "cyan",
    hudOpacity: 1.0,
    minimapLocations: true,
    subtitles: true,
    crosshair: true,
  };
  /**
   * The one VIGIL palette (no player-selectable tint): c = text, glow = bloom, dim = hairlines,
   * bg = panel black; accent red H.RED (the title-logo triangle) for alerts/highlights.
   */
  H.TINTS = {
    cyan: {
      c: "#cfeefa",
      dim: "rgba(150,220,240,0.35)",
      glow: "rgba(160,225,250,0.55)",
      deep: "#5e94ab",
      bg: "rgba(4,10,16,0.86)",
    },
  };
  H.AMBER = "#ffb347";
  H.RED = "#ff5a4a";
  H.loadSettings = function () {
    let s = {};
    try {
      s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") || {};
    } catch (e) {
      s = {};
    }
    H.settings = Object.assign({}, H.DEFAULT_SETTINGS, s);
    H.settings.tint = "cyan"; // fixed palette
    delete H.settings.lensCurve; // retired lens-bend option
    return H.settings;
  };
  H.saveSettings = function () {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(H.settings));
    } catch (e) {
      /* ignore */
    }
  };
  /** Current tint record. */
  H.tint = function () {
    return H.TINTS[(H.settings && H.settings.tint) || "cyan"] || H.TINTS.cyan;
  };
  H.applyColors = function () {
    const s = H.settings,
      rs = document.documentElement.style,
      t = H.tint();
    rs.setProperty("--gg-c", t.c);
    rs.setProperty("--gg-dim", t.dim);
    rs.setProperty("--gg-glow", t.glow);
    rs.setProperty("--gg-deep", t.deep);
    rs.setProperty("--gg-bg", t.bg);
    rs.setProperty("--gg-amber", H.AMBER);
    rs.setProperty("--gg-red", H.RED);
    rs.setProperty("--gg-op", String(s.hudOpacity));
    // shared tint for other modules' stylesheets (quests_extra, POI panels)
    rs.setProperty("--hud-c", t.c);
    rs.setProperty("--hud-dim", t.deep);
    rs.setProperty("--hud-glow", t.glow);
  };
  /** Push settings into the other modules (safe to call repeatedly). */
  H.applySettings = function () {
    const s = H.settings;
    H.applyColors();
    try {
      if (G.sfx && G.sfx.setMasterVolume) G.sfx.setMasterVolume(s.master);
    } catch (e) {
      /* stub */
    }
    try {
      if (G.sfx && G.sfx.setMusicVolume) G.sfx.setMusicVolume(s.music);
    } catch (e) {
      /* stub */
    }
    try {
      if (G.sfx && G.sfx.setSfxVolume) G.sfx.setSfxVolume(s.sfx);
    } catch (e) {
      /* stub */
    }
    if (G.input) {
      G.input.sensitivity = 0.0022 * s.sensitivity;
      G.input.invertY = !!s.invertY;
    }
    if (G.player) {
      const wasBase = G.player.fovBase;
      G.player.fovBase = s.fov;
      if (Math.abs(G.player.fovTarget - wasBase) < 0.01)
        G.player.fovTarget = s.fov; // not currently zoomed
    }
    if (G.renderer) {
      const pr = Math.min(window.devicePixelRatio || 1, 1.5) * s.resScale;
      // Only touch the renderer when our scale actually differs from what core set, and then
      // broadcast 'resize' so post-FX render targets / cameras follow the new drawing-buffer size.
      if (Math.abs(G.renderer.getPixelRatio() - pr) > 0.01) {
        G.renderer.setPixelRatio(pr);
        G.renderer.setSize(window.innerWidth, window.innerHeight);
        try {
          G.events.emit("resize", window.innerWidth, window.innerHeight);
        } catch (e) {
          /* ignore */
        }
      }
    }
    // colour grade: fixed to teal by atmosphere (no player setting)
  };
  H.loadSettings();

  // Blocky wide monospace for the big readouts (Share Tech Mono is already loaded by the page).
