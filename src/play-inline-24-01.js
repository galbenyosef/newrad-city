// play-inline-24 01 — key
// Lines 9-104 of readable/play-inline-24.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const S = G._snd;

  // ------------------------------------------------------------------
  // Sound ids. S.alias (00_core) maps an alias to its recipe.
  // ------------------------------------------------------------------
  /** Recipe name for `name`: itself or its alias target. */
  S.resolve = function (name) {
    if (S.R[name]) return name;
    return S.alias[name] || name;
  };

  /** Is the goggle menu (or a goggle sub-screen) up? */
  S.inGoggles = () => G.state === "goggles";

  // Creature / robot kinds by actor type (substring match)
  const KIND_RE = [
    ["brute", /brute|colossus/],
    ["maniac", /maniac/],
    ["ripjaw", /ripjaw/],
    ["shellback", /shellback/],
    ["skyeye", /skyeye|sky_eye/],
    ["raider", /raider/],
  ];
  /** 'brute' | 'maniac' | 'ripjaw' | 'shellback' | 'skyeye' | 'raider' | null for an actor type id. */
  S.kindOf = function (type) {
    const t = String(type || "").toLowerCase();
    for (const [k, re] of KIND_RE) if (re.test(t)) return k;
    return null;
  };

  // ------------------------------------------------------------------
  // The start interior (Cryo Unit C-9): whichever LAYOUT.INTERIORS cell holds
  // LAYOUT.playerStart, so the key's spelling never matters.
  // ------------------------------------------------------------------
  let startKey;
  S.startLabKey = function () {
    if (startKey !== undefined) return startKey;
    const L = G.LAYOUT,
      p = L && L.playerStart,
      I = L && L.INTERIORS;
    if (!p || !I) return null;
    let best = null,
      bd = 160;
    for (const k in I) {
      const o = I[k] && I[k].origin;
      if (!o) continue;
      const d = Math.hypot(p.x - o.x, p.z - o.z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    startKey = best;
    return best;
  };
  /** Is this interior key / location id the cryo facility the hero wakes in? */
  S.isStartLab = function (id) {
    if (!id) return false;
    if (id === S.startLabKey() || /^cryo_?(unit_?)?c_?9/.test(id)) return true;
    const loc =
      G.LAYOUT && (G.LAYOUT.LOCATIONS || []).find((l) => l && l.id === id);
    return !!(loc && /cryo unit c-9/i.test(loc.name || ""));
  };
  G.events.on("newGame", () => {
    startKey = undefined;
  });

  // ------------------------------------------------------------------
  // Storage keys: 'nrc_' prefix.
  // ------------------------------------------------------------------
  S.lsGet = function (key) {
    try {
      return localStorage.getItem("nrc_" + key);
    } catch (e) {
      return null;
    }
  };
  S.lsSet = function (key, v) {
    try {
      localStorage.setItem("nrc_" + key, v);
    } catch (e) {
      /* storage blocked */
    }
  };
  S.lsRemove = function (key) {
    try {
      localStorage.removeItem("nrc_" + key);
    } catch (e) {
      /* */
    }
  };
  /** The hero's name (fixed protagonist; never hard-coded). */
  S.heroName = () =>
    (G.HERO && G.HERO.name) || (G.player && G.player.name) || "the sleeper";
