// play-inline-532 01 — def
// Lines 20-365 of readable/play-inline-532.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const C = G.crafting;
  const X = C._;

  // ------------------------------------------------------------------
  // Defensive wrappers around other modules (always resolved at call time)
  // ------------------------------------------------------------------
  const real = (ns) => !G.isStub(ns) && !!G[ns];
  X.invReal = () =>
    real("inventory") && typeof G.inventory.count === "function";
  X.count = (id) => {
    try {
      return X.invReal() ? G.inventory.count(id) || 0 : 0;
    } catch (e) {
      return 0;
    }
  };
  X.def = (id) => {
    try {
      return real("items") && G.items.get ? G.items.get(id) : null;
    } catch (e) {
      return null;
    }
  };
  X.name = (id) => {
    const d = X.def(id);
    return (d && d.name) || String(id || "").replace(/_/g, " ");
  };
  X.testSkill = null; // test override (?crafttest) — never set in normal play
  X.skill = function (id) {
    if (X.testSkill !== null) return X.testSkill;
    try {
      return real("rpg") && typeof G.rpg.skill === "function"
        ? G.rpg.skill(id) || 0
        : 50;
    } catch (e) {
      return 50;
    }
  };
  X.addXP = (n, reason) => {
    try {
      if (n > 0 && real("rpg") && G.rpg.addXP)
        G.rpg.addXP(n, reason || "Crafting");
    } catch (e) {
      /* ignore */
    }
  };
  X.sfx = (name, opts) => {
    try {
      if (real("sfx")) return G.sfx.play(name, opts || {});
    } catch (e) {
      /* ignore */
    }
    return null;
  };
  X.hasSfx = (name) => {
    try {
      return real("sfx") && typeof G.sfx.has === "function" && G.sfx.has(name);
    } catch (e) {
      return false;
    }
  };
  /** Staggered little sound sequence (craft hammering, cooking sizzle). Uses real time. */
  X.sfxSeq = function (seq) {
    for (const [t, name, o] of seq) {
      if (!t) X.sfx(name, o);
      else
        setTimeout(() => {
          if (X.ui && X.ui.open) X.sfx(name, o);
        }, t * 1000);
    }
  };
  X.wpnReal = () => real("weapons") && typeof G.weapons.craft === "function";
  X.wpnData = () => {
    try {
      return real("weapons") && G.weapons._ ? G.weapons._ : null;
    } catch (e) {
      return null;
    }
  };
  X.gameHours = () => (G.time.day || 1) * 24 + (G.time.hour || 0);

  // ------------------------------------------------------------------
  // State (dynamic → reset on 'reset', saved)
  // ------------------------------------------------------------------
  X.S = null;
  X.freshState = () => ({
    schem: {},
    harvested: {},
    tips: {},
    stats: {
      crafted: 0,
      cooked: 0,
      chems: 0,
      repaired: 0,
      harvested: 0,
      modded: 0,
      handloaded: 0,
      brokenDown: 0,
    },
  });
  X.S = X.freshState();
  const pendingLearn = [];

  // ------------------------------------------------------------------
  // Registration of our items & schematic weapons
  // ------------------------------------------------------------------
  X.registerItems = function () {
    if (!real("items") || typeof G.items.define !== "function") return false;
    for (const d of X.ITEM_DEFS) {
      const def = Object.assign({}, d);
      if (X.SCHEM[d.id])
        def.desc =
          X.SCHEM[d.id].text +
          " (Teaches a workbench recipe. Extra copies improve what you build.)";
      try {
        G.items.define(def);
      } catch (e) {
        G.reportError("crafting:define " + d.id, e);
      }
    }
    X.registerWeapons();
    return true;
  };
  /** Weapon defs join the weapons registry (public `define` if it ever exists, else its registry map) and G.items. */
  X.registerWeapons = function () {
    const P = X.wpnData();
    const BASE = (P && P.BASE) || {};
    for (const w of X.WEAPON_DEFS) {
      const block = Object.assign({}, BASE, w.w);
      block.soundFb = {
        name: block.sound,
        pitch: block.sfxPitch || 1,
        volume: block.sfxVolume || 1,
      };
      block.weight = w.weight;
      block.value = w.value;
      const def = {
        id: w.id,
        name: w.name,
        type: "weapon",
        weight: w.weight,
        value: w.value,
        desc: w.desc,
        icon: "weapon_" + block.viewmodel,
        unique: true,
        crafted: true,
        noLoot: true,
        weapon: block,
        tags: [block.skill, block.damageType, "crafted"],
      };
      if (block.reloadType === "throw") {
        def.stackable = true;
        def.tags.push(block.mine ? "mine" : "grenade");
      }
      if (block.reloadType === "melee")
        def.tags.push(
          block.unarmed ||
            block.viewmodel === "fists" ||
            block.viewmodel === "brass_knuckles"
            ? "unarmed"
            : "melee",
        );
      try {
        if (real("weapons") && typeof G.weapons.define === "function")
          G.weapons.define(def);
        else if (
          P &&
          P.defs &&
          typeof P.defs.set === "function" &&
          !P.defs.has(w.id)
        )
          P.defs.set(w.id, def);
      } catch (e) {
        G.reportError("crafting:weaponDef " + w.id, e);
      }
      try {
        if (real("items")) G.items.define(def);
      } catch (e) {
        G.reportError("crafting:itemDef " + w.id, e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Recipe validation (items that some other module failed to define hide the recipe)
  // ------------------------------------------------------------------
  X.missingIds = [];
  X.validate = function () {
    X.missingIds = [];
    if (!real("items")) return;
    const need = new Set();
    for (const r of X.RECIPES) {
      need.add(r.makes);
      for (const p of r.parts) need.add(p[0]);
      for (const p of r.gives || []) need.add(p[0]);
    }
    for (const k in X.SCHEM) for (const p of X.SCHEM[k].parts) need.add(p[0]);
    for (const id of need) if (!X.def(id)) X.missingIds.push(id);
    for (const r of X.RECIPES)
      r.invalid =
        !X.def(r.makes) ||
        r.parts.some((p) => !X.def(p[0])) ||
        (r.gives || []).some((p) => !X.def(p[0]));
    if (X.missingIds.length && G.warnings)
      G.warnings.push(
        "crafting: undefined items hide recipes: " + X.missingIds.join(", "),
      );
  };

  // ------------------------------------------------------------------
  // Unified recipe list
  // ------------------------------------------------------------------
  const schemCond = (copies) =>
    Math.min(
      1,
      [0, 0.55, 0.8, 1][Math.min(3, Math.max(1, copies | 0))] +
        X.skill("mechanics") / 1000,
    );
  X.schemCond = schemCond;
  function wpnKnown() {
    const out = {};
    try {
      if (X.wpnReal() && G.weapons.knownSchematics)
        for (const k of G.weapons.knownSchematics() || [])
          out[k.id] = k.copies || 1;
    } catch (e) {
      /* ignore */
    }
    return out;
  }
  /** Rows for a station tab (not modify/repair). Each row: {key, src, kind, makes, n, parts, req, xp, art, text, copies?, wpnId?} */
  X.recipes = function (station, tab) {
    const rows = [];
    if (station === "workbench" && tab === "schematics") {
      for (const id in X.SCHEM) {
        const s = X.SCHEM[id],
          c = X.S.schem[id] | 0;
        if (c <= 0) continue;
        rows.push({
          key: id,
          src: "cr",
          kind: "schem",
          makes: s.makes,
          n: s.perCopy === "count" ? c : 1,
          parts: s.parts,
          req: {},
          xp: 25,
          art: s.art,
          text: s.text,
          copies: c,
          cond: s.perCopy === "condition" ? schemCond(c) : null,
          name: X.name(s.makes),
        });
      }
      const P = X.wpnData(),
        known = wpnKnown();
      if (P && P.SCHEM)
        for (const id in P.SCHEM) {
          if (!(known[id] > 0)) continue;
          const s = P.SCHEM[id];
          const def = X.def(s.makes);
          const isGun =
            def &&
            def.type === "weapon" &&
            def.weapon &&
            def.weapon.reloadType !== "throw";
          rows.push({
            key: id,
            src: "wpn",
            kind: "schem",
            wpnId: id,
            makes: s.makes,
            n: s.n || 1,
            parts: s.parts || [],
            req: s.repair ? { mechanics: s.repair } : {},
            xp: 0,
            art: X.artFor(s.makes),
            text: s.text,
            copies: known[id],
            cond: isGun
              ? P.craftCondition
                ? P.craftCondition(id)
                : schemCond(known[id])
              : null,
            name: X.name(s.makes),
          });
        }
      rows.sort((a, b) => a.name.localeCompare(b.name));
      return rows;
    }
    if (station === "workbench" && tab === "workshop") {
      const P = X.wpnData();
      if (P && Array.isArray(P.WORKSHOP))
        for (const e of P.WORKSHOP) {
          if (!X.def(e.makes)) continue;
          rows.push({
            key: e.id,
            src: "wpn",
            kind: "recipe",
            wpnId: e.id,
            makes: e.makes,
            n: e.n || 1,
            parts: e.parts || [],
            req: e.repair ? { mechanics: e.repair } : {},
            xp: 0,
            art: X.artFor(e.makes, e.cat === "AMMO" ? "rounds" : "generic"),
            cat: e.cat,
            name: X.name(e.makes),
          });
        }
    }
    for (const r of X.RECIPES) {
      if (r.station !== station || r.tab !== tab || r.invalid) continue;
      if (r.breakdown && !(X.count(r.makes) > 0)) continue; // only offer what you carry
      rows.push({
        key: r.id,
        src: "cr",
        kind: "recipe",
        makes: r.makes,
        n: r.n,
        parts: r.parts,
        gives: r.gives || null,
        breakdown: !!r.breakdown,
        req: r.req,
        xp: r.xp,
        art: r.art,
        text: r.note,
        name: r.label || X.name(r.makes),
      });
    }
    if (tab === "workshop" || tab === "breakdown")
      rows.sort((a, b) => a.name.localeCompare(b.name));
    else
      rows.sort(
        (a, b) => reqMax(a) - reqMax(b) || a.name.localeCompare(b.name),
      );
    return rows;
  };
  const reqMax = (r) => {
    let m = 0;
    for (const k in r.req) m = Math.max(m, r.req[k]);
    return m;
  };
