// play-inline-612 01 — live
// Lines 12-360 of readable/play-inline-612.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = (G._uix = G._uix || {});

  // ------------------------------------------------------------------
  // Defensive accessors to other modules
  // ------------------------------------------------------------------
  const live = (ns) => G[ns] && !G.isStub(ns);
  X.live = live;
  /**
   * Play a UI sound. `fallback` is used when the sound module has no recipe for `name` yet
   * (new ids land in sound/ later in the rebrand; the fallback keeps the screen audible meanwhile).
   */
  X.sfx = function (name, opts, fallback) {
    try {
      if (!live("sfx")) return null;
      if (fallback && typeof G.sfx.has === "function" && !G.sfx.has(name))
        name = fallback;
      return G.sfx.play(name, opts || {});
    } catch (e) {
      /* sound optional */
    }
    return null;
  };
  /** Scripted/debug runs (smoke, shot, ?debug) — the only time test hooks are attached. */
  X.testMode = () => !!(G.DEBUG || G.SMOKE || G.SHOT);
  X.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  X.gameName = () => G.GAME_NAME || "NEW RAD CITY";
  /** The hero's name (fixed protagonist, read from G.HERO). */
  X.heroName = () =>
    (G.HERO && G.HERO.name) || (G.player && G.player.name) || "Stranger";

  // ---- attributes & skills (§4) ------------------------------------------
  X.ATTR_NAMES = {
    brawn: "Brawn",
    reflex: "Reflex",
    grit: "Grit",
    wits: "Wits",
    senses: "Senses",
    presence: "Presence",
  };
  X.SKILL_NAMES = {
    firearms: "Firearms",
    melee: "Melee",
    explosives: "Explosives",
    medicine: "Medicine",
    mechanics: "Mechanics",
    electronics: "Electronics",
    stealth: "Stealth",
    persuasion: "Persuasion",
    trade: "Trade",
    survival: "Survival",
  };
  X.skillId = (id) => String(id || "").toLowerCase();
  X.attrId = (id) => String(id || "").toLowerCase();

  /** Attribute value (1-10). Defaults to 5 when rpg is missing. */
  X.attr = function (id) {
    id = X.attrId(id);
    try {
      if (live("rpg")) {
        if (typeof G.rpg.attr === "function") {
          const v = G.rpg.attr(id);
          if (typeof v === "number" && !isNaN(v)) return v;
        }
        const t = G.rpg.attributes || G.rpg.attrs;
        if (t && typeof t[id] === "number") return t[id];
      }
    } catch (e) {
      /* ignore */
    }
    return 5;
  };
  /** Skill value (0-100). Defaults to a sane novice value when rpg is missing. */
  X.skill = function (id) {
    const nid = X.skillId(id);
    try {
      if (live("rpg") && typeof G.rpg.skill === "function") {
        const v = G.rpg.skill(nid);
        if (typeof v === "number" && !isNaN(v)) return v;
      }
    } catch (e) {
      /* ignore */
    }
    return 25;
  };
  /** Count a skill use (rpg grows skills by use; Electronics by keypads/terminals). */
  X.useSkill = function (id, amount, reason) {
    try {
      if (live("rpg") && typeof G.rpg.useSkill === "function") {
        G.rpg.useSkill(X.skillId(id), amount || 1, reason || "");
        return;
      }
    } catch (e) {
      G.reportError("uix:useSkill", e);
      return;
    }
    G.events.emit("skillUsed", X.skillId(id), amount || 1, reason || ""); // only when rpg has no useSkill (never both)
  };
  /** Standing (reputation) change. */
  X.standing = function (n, reason) {
    if (!n || !live("rpg")) return;
    try {
      if (typeof G.rpg.addStanding === "function")
        G.rpg.addStanding(n, reason || "");
    } catch (e) {
      G.reportError("uix:standing", e);
    }
  };
  X.xp = function (n, reason) {
    try {
      if (n && live("rpg") && G.rpg.addXP) G.rpg.addXP(n, reason || "");
    } catch (e) {
      G.reportError("uix:xp", e);
    }
  };
  X.level = function () {
    try {
      if (live("rpg") && typeof G.rpg.level === "number") return G.rpg.level;
    } catch (e) {
      /* ignore */
    }
    return 1;
  };

  // ---- Items -------------------------------------------------------------
  function prettify(id) {
    return String(id)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  X.prettify = prettify;
  // Readable owner label for [STEAL] tags: an actor id resolves to that NPC's name, a faction id to a
  // faction label, anything else is prettified.
  const FACTION_LABEL = {
    settlers: "Settlers",
    continuity: "The Continuity",
    covenant: "The Iron Covenant",
    neon: "The Neon",
    raiders: "Raiders",
    glowkeepers: "The Glowkeepers",
    maniacs: "Maniacs",
    brutes: "Brutes",
    robots: "Robots",
    cryo: "Project Long Winter",
  };
  X.ownerName = function (owner) {
    if (!owner) return "";
    if (typeof owner === "object")
      return owner.name || prettify(owner.id || "someone");
    try {
      if (!G.isStub("actors") && G.actors.get) {
        const a = G.actors.get(owner);
        if (a && a.name) return a.name;
      }
    } catch (e) {
      /* ignore */
    }
    return FACTION_LABEL[owner] || prettify(owner);
  };

  // ---- currency: federal ration Scrip -----------------------------------
  X.CUR = "scrip";
  X.CUR_NAME = "Scrip";
  X.isCurrency = (id) => id === X.CUR;
  const curId = () => X.CUR;
  /** Read a merchant's / NPC's scrip purse (merchant.scrip). */
  X.purse = (m) => (m && typeof m.scrip === "number" ? m.scrip : undefined);
  X.setPurse = (m, v) => {
    if (m) m.scrip = v;
  };

  /** Item definition, or a harmless placeholder so UIs never crash on unknown ids. */
  X.itemDef = function (id) {
    let d = null;
    try {
      if (live("items") && G.items.get) d = G.items.get(id);
    } catch (e) {
      d = null;
    }
    if (d) return d;
    if (X.isCurrency(id))
      return {
        id,
        name: X.CUR_NAME,
        type: "misc",
        weight: 0,
        value: 1,
        _fake: true,
      };
    return {
      id,
      name: prettify(id),
      type: "misc",
      weight: 0,
      value: 1,
      _fake: true,
    };
  };
  X.itemName = (id) => {
    const d = X.itemDef(id);
    return (d && d.name) || prettify(id);
  };
  /** Line-art icon for an item (SVG markup) from ui_hud, or '' when the HUD is absent. */
  X.itemIconSVG = function (def) {
    if (!def || G.isStub("hud") || !G.hud) return "";
    try {
      const f = G.hud.itemIcon || (G.hud._ && G.hud._.itemIcon);
      return typeof f === "function" ? String(f(def) || "") : "";
    } catch (e) {
      return "";
    }
  };
  X.weaponBlock = function (def) {
    if (!def) return null;
    if (def.weapon) return def.weapon;
    try {
      if (live("weapons") && G.weapons.getDef) {
        const w = G.weapons.getDef(def.id);
        if (w) return w.weapon || w;
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  };
  X.invLive = () => live("inventory");
  X.invCount = function (id) {
    if (X.isCurrency(id)) return X.scrip();
    if (!live("inventory")) return X._fakeInv[id] || 0;
    try {
      return G.inventory.count(id) || 0;
    } catch (e) {
      return 0;
    }
  };
  X._fakeInv = { scrip: 120 }; // used only when rpg/inventory is a stub (demo / degraded mode)
  X.invAdd = function (id, n) {
    if (n <= 0) return;
    if (X.isCurrency(id)) {
      X.addScrip(n);
      return;
    }
    if (!live("inventory")) {
      X._fakeInv[id] = (X._fakeInv[id] || 0) + n;
      return;
    }
    try {
      G.inventory.add(id, n, { silent: true });
    } catch (e) {
      G.reportError("uix:invAdd", e);
    }
  };
  X.invRemove = function (id, n) {
    if (n <= 0) return;
    if (X.isCurrency(id)) {
      X.addScrip(-n);
      return;
    }
    if (!live("inventory")) {
      X._fakeInv[id] = Math.max(0, (X._fakeInv[id] || 0) - n);
      return;
    }
    try {
      G.inventory.remove(id, n);
    } catch (e) {
      G.reportError("uix:invRemove", e);
    }
  };
  /** Player's scrip. */
  X.scrip = function () {
    if (!live("inventory")) return X._fakeInv.scrip || 0;
    try {
      if (typeof G.inventory.scrip === "function")
        return G.inventory.scrip() || 0;
      return G.inventory.count(curId()) || 0;
    } catch (e) {
      return 0;
    }
  };
  X.addScrip = function (n) {
    if (!n) return;
    if (!live("inventory")) {
      X._fakeInv.scrip = Math.max(0, (X._fakeInv.scrip || 0) + n);
      return;
    }
    try {
      if (typeof G.inventory.addScrip === "function") {
        G.inventory.addScrip(n);
        return;
      }
      if (n > 0) G.inventory.add(curId(), n, { silent: true });
      else G.inventory.remove(curId(), -n);
    } catch (e) {
      G.reportError("uix:addScrip", e);
    }
  };
  /** Player inventory as [{id,count,def,equipped,condition}] (never throws). Currency is not listed. */
  X.invList = function () {
    if (!live("inventory")) {
      return Object.keys(X._fakeInv)
        .filter((k) => X._fakeInv[k] > 0 && !X.isCurrency(k))
        .map((k) => ({
          id: k,
          count: X._fakeInv[k],
          def: X.itemDef(k),
          equipped: false,
          condition: 1,
        }));
    }
    try {
      const l = G.inventory.list() || [];
      return l
        .filter((e) => !X.isCurrency(e.id))
        .map((e) => Object.assign({}, e, { def: e.def || X.itemDef(e.id) }));
    } catch (e) {
      return [];
    }
  };
  X.invWeight = function () {
    try {
      if (live("inventory") && G.inventory.weight)
        return G.inventory.weight() || 0;
    } catch (e) {
      /* ignore */
    }
    return 0;
  };
  X.carryMax = function () {
    try {
      if (live("rpg") && G.rpg.carryWeight) return G.rpg.carryWeight() || 200;
    } catch (e) {
      /* ignore */
    }
    return 200;
  };
  /** Items that belong to the hero's own kit and never trade/store (the goggles). */
  X.isKit = (id, def) =>
    /goggles/.test(String(id)) || !!(def && (def.kit || def.noDrop));

  /** Short type category for item lists. */
  X.CATS = [
    { id: "all", name: "ALL" },
    { id: "weapon", name: "WEAPONS" },
    { id: "apparel", name: "APPAREL" },
    { id: "aid", name: "AID" },
    { id: "misc", name: "MISC" },
    { id: "ammo", name: "AMMO" },
  ];
