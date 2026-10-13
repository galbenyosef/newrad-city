/* src/crafting/20_logic.js */
/* =====================================================================
 * NEW RAD CITY — CRAFTING · 20_logic.js
 * Everything that isn't DOM:
 *   - item/weapon registration (our schematic weapons join the weapons
 *     module's registry so they equip, throw and show like any other gun)
 *   - the unified recipe list per station/tab: our recipes + the weapons
 *     module's schematics and workshop (built through G.weapons.craft)
 *   - crafting (skill gates, components, condition from schematic copies,
 *     XP), schematic learning for our two schematics
 *   - weapon mods (through G.weapons.installMod)
 *   - repair: duplicate cannibalising, "similar item" donors,
 *     the Gunsmith Kit (workbench or goggles inventory → Aid)
 *   - stations: props' workbenches (the `workbench` event) and campfires
 *     (one pooled "Cook" interactable that tracks the nearest fire)
 *   - harvestable ashbloom / knotroot plants (instanced, regrow
 *     after three game days), schematic pickups in the world
 * ===================================================================== */
(function () {
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
  X.findRecipe = function (key) {
    for (const st of Object.keys(X.TABS))
      for (const [tab] of X.TABS[st]) {
        if (tab === "modify" || tab === "repair") continue;
        const r = X.recipes(st, tab).find((x) => x.key === key);
        if (r) return Object.assign({ station: st, tab }, r);
      }
    return null;
  };

  /** First unmet skill gate → {skill, value} | null */
  X.unmetReq = function (row) {
    for (const k in row.req || {})
      if (X.skill(k) < row.req[k]) return { skill: k, value: row.req[k] };
    return null;
  };
  /** How many times the row can be built right now (0 = none), capped. */
  X.maxTimes = function (row, cap) {
    if (!X.invReal()) return 0;
    let m = cap || 10;
    for (const [id, n] of row.parts)
      m = Math.min(m, Math.floor(X.count(id) / Math.max(1, n)));
    return Math.max(0, m);
  };
  /** Why a row can't be built (string) or null. */
  X.blocker = function (row, times) {
    times = times || 1;
    if (!X.invReal()) return "No inventory.";
    if (row.kind === "schem" && !(row.copies > 0))
      return "You don't know this schematic.";
    const u = X.unmetReq(row);
    if (u)
      return (
        "Requires " + (X.SKILL_NAMES[u.skill] || u.skill) + " " + u.value + "."
      );
    for (const [id, n] of row.parts)
      if (X.count(id) < n * times) return "Missing components.";
    return null;
  };

  /**
   * Build a row `times` times. Returns {ok, made, n} | {ok:false, reason}.
   * Weapons-owned rows go through G.weapons.craft (it notifies, plays sound and gives XP itself).
   */
  X.WPN_BATCH = 10; // weapons-owned recipes build one unit per G.weapons.craft call
  X.craft = function (row, times, station) {
    times = Math.max(1, times | 0 || 1);
    const why = X.blocker(row, times);
    if (why) return { ok: false, reason: why };
    if (row.src === "wpn") {
      if (!X.wpnReal()) return { ok: false, reason: "Unavailable." };
      times = Math.min(times, X.WPN_BATCH);
      let made = 0,
        last = null,
        fail = null;
      // G.weapons.craft notifies and plays its own sounds once per unit: for a batch, mute those
      // (restored in finally) and post one summary + one set of bench sounds instead.
      const quiet = times > 1;
      const n0 = G.notify,
        sp = G.sfx && G.sfx.play;
      if (quiet) {
        G.notify = function () {
          return null;
        };
        if (sp)
          G.sfx.play = function () {
            return null;
          };
      }
      try {
        for (let i = 0; i < times; i++) {
          let res = null;
          try {
            res = G.weapons.craft(row.wpnId);
          } catch (e) {
            G.reportError("crafting:wpnCraft", e);
          }
          if (!res || !res.ok) {
            fail = (res && res.reason) || "Failed.";
            break;
          }
          made += res.n || 1;
          last = res;
        }
      } finally {
        if (quiet) {
          G.notify = n0;
          if (sp) G.sfx.play = sp;
        }
      }
      if (!made) return { ok: false, reason: fail || "Failed." };
      X.S.stats.crafted += made;
      if (quiet) {
        try {
          G.notify(
            X.name((last && last.made) || row.makes) +
              " (" +
              made +
              ") crafted.",
            { kind: "item", id: row.makes, count: made },
          );
        } catch (e) {
          /* ignore */
        }
      }
      X.craftFeedback(row, station || "workbench");
      return { ok: true, made: (last && last.made) || row.makes, n: made };
    }
    // our recipes: take the parts, then hand over the product
    for (const [id, n] of row.parts) {
      try {
        G.inventory.remove(id, n * times, { silent: true });
      } catch (e) {
        G.reportError("crafting:remove " + id, e);
        return { ok: false, reason: "Inventory error." };
      }
    }
    const total = (row.n || 1) * times;
    const def = X.def(row.makes);
    const st = station || row.station || "workbench";
    if (row.gives) {
      // break-down style recipe: several outputs
      for (const [id, n] of row.gives) {
        try {
          G.inventory.add(id, n * times, { silent: true });
        } catch (e) {
          G.reportError("crafting:add " + id, e);
        }
      }
      X.S.stats.brokenDown = (X.S.stats.brokenDown || 0) + times;
      try {
        G.notify(
          X.name(row.makes) +
            (times > 1 ? " (" + times + ")" : "") +
            " broken down.",
          { kind: "item", id: row.makes },
        );
      } catch (e) {
        /* ignore */
      }
      X.craftFeedback(row, st);
      G.events.emit("itemCrafted", row.makes, 0, {
        station: st,
        recipe: row.key,
        breakdown: times,
      });
      return { ok: true, made: row.makes, n: times, broken: true };
    }
    const opts = { silent: true };
    if (def && def.hasCondition)
      opts.cond = row.cond !== null && row.cond !== undefined ? row.cond : 1;
    try {
      G.inventory.add(row.makes, total, opts);
    } catch (e) {
      G.reportError("crafting:add " + row.makes, e);
    }
    X.addXP((row.xp || 0) * times, st === "campfire" ? "Cooking" : "Crafting");
    const S = X.S.stats;
    S.crafted += total;
    if (row.tab === "cooking" || (st === "campfire" && row.tab !== "remedies"))
      S.cooked += total;
    if (row.tab === "chemistry" || row.tab === "remedies") S.chems += total;
    if (st === "reloading") S.handloaded = (S.handloaded || 0) + total;
    try {
      G.notify(
        X.name(row.makes) +
          (total > 1 ? " (" + total + ")" : "") +
          (st === "campfire" && row.tab === "cooking"
            ? " cooked."
            : " crafted."),
        { kind: "item", id: row.makes, count: total },
      );
    } catch (e) {
      /* ignore */
    }
    X.craftFeedback(row, st);
    G.events.emit("itemCrafted", row.makes, total, {
      station: st,
      recipe: row.key,
    });
    return { ok: true, made: row.makes, n: total };
  };
  /** Station-specific sound: hammer & ratchet, sizzle, glassware. */
  X.craftFeedback = function (row, station) {
    if (station === "reloading") {
      // press stroke: primer seat, powder throw, bullet seat
      X.sfxSeq([
        [0, "reload", { volume: 0.45, pitch: 1.35 }],
        [0.16, "gear_rattle", { volume: 0.3, pitch: 1.4 }],
        [0.34, "machinery_clank", { volume: 0.35, pitch: 1.5 }],
      ]);
    } else if (station === "campfire") {
      X.sfxSeq([
        [0, "steam_hiss", { volume: 0.35, pitch: 0.6 }],
        [0.25, "fire_loop", { volume: 0.3 }],
        [0.55, row.tab === "remedies" ? "drink" : "eat", { volume: 0.35 }],
      ]);
    } else if (row.tab === "chemistry") {
      X.sfxSeq([
        [0, "drip", { volume: 0.5, pitch: 1.2 }],
        [0.18, "ui_select", { volume: 0.4, pitch: 0.8 }],
        [0.4, "hum_electric", { volume: 0.25, pitch: 1.6 }],
      ]);
    } else {
      X.sfxSeq([
        [0, "machinery_clank", { volume: 0.5 }],
        [0.2, "gear_rattle", { volume: 0.45 }],
        [0.45, "reload", { volume: 0.5, pitch: 0.75 }],
      ]);
    }
  };
  // looping recipes used as feedback (fire_loop / hum_electric) are stopped ~0.9 s later by X.tickSounds
  const loopHandles = [];
  const _play = X.sfx;
  X.sfx = function (name, o) {
    const h = _play(name, o);
    if (h && (name === "fire_loop" || name === "hum_electric"))
      loopHandles.push({ h, t: performance.now() + 900 });
    return h;
  };
  X.tickSounds = function () {
    if (!loopHandles.length) return;
    const now = performance.now();
    for (let i = loopHandles.length - 1; i >= 0; i--) {
      if (now >= loopHandles[i].t) {
        try {
          loopHandles[i].h.stop && loopHandles[i].h.stop(0.2);
        } catch (e) {
          /* ignore */
        }
        loopHandles.splice(i, 1);
      }
    }
  };

  // ------------------------------------------------------------------
  // Schematic learning (our two schematics; weapons learns its own)
  // ------------------------------------------------------------------
  X.onItemAdded = function (id, n) {
    const s = X.SCHEM[id];
    if (!s) return;
    const add = Math.max(1, n | 0 || 1);
    const before = X.S.schem[id] | 0;
    const now = Math.min(3, before + add);
    X.S.schem[id] = now;
    pendingLearn.push([id, add]);
    const what = X.name(s.makes);
    let msg;
    if (!before)
      msg = "Schematic learned: " + what + ". Build it at any workbench.";
    else if (now > before)
      msg =
        what +
        " schematic " +
        now +
        "/3: " +
        (s.perCopy === "count"
          ? "you now build " + now + " per batch."
          : "crafted condition improved.");
    else
      msg =
        "You already know everything this " +
        what +
        " schematic can teach you.";
    try {
      G.notify(msg, { kind: "skill", icon: "wrench" });
    } catch (e) {
      /* ignore */
    }
    X.sfx(X.hasSfx("ui_confirm") ? "ui_confirm" : "ui_select", { volume: 0.5 });
    G.events.emit("schematicLearned", id, now);
  };
  X.flushLearned = function () {
    if (!pendingLearn.length || !X.invReal()) return;
    const list = pendingLearn.splice(0);
    for (const [id, n] of list) {
      try {
        const c = X.count(id);
        if (c > 0) G.inventory.remove(id, Math.min(n, c), { silent: true });
      } catch (e) {
        /* ignore */
      }
    }
  };
  X.clearPending = () => {
    pendingLearn.length = 0;
  };

  // ------------------------------------------------------------------
  // Weapon mods
  // ------------------------------------------------------------------
  const modInfo = (id) => {
    const d = X.def(id);
    return d && d.mod && Array.isArray(d.mod.fits) ? d.mod : null;
  };
  X.modsOf = (wid) => {
    try {
      return X.wpnReal() && G.weapons.modsOf ? G.weapons.modsOf(wid) || [] : [];
    } catch (e) {
      return [];
    }
  };
  /** Rows: every (mod item you carry × owned weapon it fits) plus every installed mod on an owned weapon. */
  X.modRows = function () {
    const rows = [];
    if (!X.invReal()) return rows;
    let weapons = [],
      misc = [];
    try {
      weapons = G.inventory.list("weapon") || [];
      misc = G.inventory.list("misc") || [];
    } catch (e) {
      return rows;
    }
    const mods = misc.filter((e) => modInfo(e.id));
    for (const w of weapons) {
      const installed = X.modsOf(w.id);
      for (const mid of installed)
        rows.push({ modId: mid, wid: w.id, installed: true });
      for (const m of mods) {
        if (installed.indexOf(m.id) >= 0) continue;
        if (modInfo(m.id).fits.indexOf(w.id) < 0) continue;
        rows.push({ modId: m.id, wid: w.id, installed: false, have: m.count });
      }
    }
    rows.sort(
      (a, b) =>
        X.name(a.wid).localeCompare(X.name(b.wid)) ||
        (a.installed === b.installed ? 0 : a.installed ? 1 : -1),
    );
    return rows;
  };
  /**
   * "Modify" view: one row per carried weapon that takes mods.
   * {wid, def, mods:[{id, name, installed, have, can, why, craft}]}  craft = workshop row (build & install) or null
   */
  X.modWeaponRows = function () {
    const out = [];
    const P = X.wpnData();
    if (!X.invReal() || !P || !P.MODS) return out;
    let weapons = [];
    try {
      weapons = G.inventory.list("weapon") || [];
    } catch (e) {
      return out;
    }
    const shop = Array.isArray(P.WORKSHOP) ? P.WORKSHOP : [];
    for (const w of weapons) {
      const wd = w.def && w.def.weapon;
      if (
        !wd ||
        wd.reloadType === "throw" ||
        wd.reloadType === "melee" ||
        w.id === "unarmed"
      )
        continue;
      const fit = Object.keys(P.MODS).filter(
        (m) => P.MODS[m].fits && P.MODS[m].fits.indexOf(w.id) >= 0,
      );
      const installed = X.modsOf(w.id);
      const mods = fit.map((m) => {
        const inst = installed.indexOf(m) >= 0,
          have = X.count(m);
        let can = false;
        try {
          can = !inst && G.weapons.canInstallMod(w.id, m);
        } catch (e) {
          can = false;
        }
        const e = shop.find((x) => x.makes === m) || null;
        const craft = e
          ? X.recipes("workbench", "workshop").find((r) => r.key === e.id) ||
            null
          : null;
        let why = "";
        if (inst) why = "Installed.";
        else if (!can)
          why =
            "Another " +
            (P.MODS[m].kind === "scope"
              ? "scope"
              : P.MODS[m].kind === "extMag"
                ? "magazine"
                : "mod") +
            " already fills that slot.";
        else if (!have && !craft) why = "You don't have this mod.";
        else if (!have && X.blocker(craft, 1))
          why = "Not carried. Workshop: " + X.blocker(craft, 1);
        return {
          id: m,
          name: X.name(m),
          kind: P.MODS[m].kind,
          effect: P.MODS[m].effect || "",
          installed: inst,
          have,
          can: can && (have > 0 || (craft && !X.blocker(craft, 1))),
          why,
          craft,
        };
      });
      out.push({
        wid: w.id,
        def: w.def,
        count: w.count,
        equipped: !!w.equipped,
        mods,
        nInst: installed.length,
      });
    }
    // equipped first, then guns that take mods, then the rest
    out.sort(
      (a, b) =>
        b.equipped - a.equipped ||
        (b.mods.length > 0) - (a.mods.length > 0) ||
        a.def.name.localeCompare(b.def.name),
    );
    return out;
  };
  /** Weapon stat block as the player has it now, and with `modId` added (null = same). */
  X.modPreview = function (wid, modId) {
    const P = X.wpnData();
    let def = null;
    try {
      def = G.weapons.getDef(wid);
    } catch (e) {
      def = null;
    }
    if (!def || !def.weapon || !P) return null;
    let cur = def;
    try {
      if (P.moddedDef) cur = P.moddedDef(def) || def;
    } catch (e) {
      cur = def;
    }
    const now = Object.assign({}, cur.weapon);
    let next = null;
    if (modId && P.MODS[modId] && X.modsOf(wid).indexOf(modId) < 0) {
      next = Object.assign({}, now);
      try {
        P.MODS[modId].apply(next);
      } catch (e) {
        next = null;
      }
    }
    return { def, now, next, cond: X.weaponCond(wid) };
  };
  /**
   * How condition scales a gun: damage and spread. Prefers weapons' own numbers
   * (G.weapons.condStats(id, cond) → {damage, spread} multipliers) and falls back to the
   * current combat / weapons formulas.
   */
  X.condMults = function (wid, c) {
    try {
      if (X.wpnReal() && typeof G.weapons.condStats === "function") {
        const r = G.weapons.condStats(wid, c);
        if (r && isFinite(r.damage) && isFinite(r.spread))
          return { damage: r.damage, spread: r.spread };
      }
    } catch (e) {
      /* ignore */
    }
    return { damage: 0.6 + 0.4 * c, spread: 1 + (1 - c) * 1.2 };
  };
  X.weaponCond = (wid) => {
    try {
      if (X.wpnReal() && typeof G.weapons.condition === "function") {
        const c = G.weapons.condition(wid);
        if (isFinite(c)) return Math.max(0, Math.min(1, c));
      }
    } catch (e) {
      /* ignore */
    }
    const d = X.def(wid);
    return d && d.hasCondition ? X.condOf(wid) : 1;
  };
  /** Install a mod from the MODIFY view (builds it at the workshop first when not carried). */
  X.installModRow = function (wrow, m) {
    if (!wrow || !m) return { ok: false, reason: "Nothing selected." };
    if (m.installed) return { ok: false, reason: "Already installed." };
    if (!m.can) return { ok: false, reason: m.why || "Can't install that." };
    if (!(X.count(m.id) > 0) && m.craft) {
      const r = X.craft(m.craft, 1, "workbench");
      if (!r.ok) return r;
    }
    return X.installMod({ wid: wrow.wid, modId: m.id, installed: false });
  };
  X.canInstall = function (row) {
    if (!row || row.installed) return false;
    try {
      return (
        X.wpnReal() &&
        G.weapons.canInstallMod(row.wid, row.modId) &&
        X.count(row.modId) > 0
      );
    } catch (e) {
      return false;
    }
  };
  X.installMod = function (row) {
    if (!X.wpnReal() || typeof G.weapons.installMod !== "function")
      return { ok: false, reason: "Weapon mods unavailable." };
    let res;
    try {
      res = G.weapons.installMod(row.wid, row.modId);
    } catch (e) {
      G.reportError("crafting:installMod", e);
      res = { ok: false, reason: "Error." };
    }
    if (res && res.ok) {
      X.S.stats.modded++;
      X.sfxSeq([
        [0, "gear_rattle", { volume: 0.4 }],
        [0.3, "ui_equip", { volume: 0.5 }],
      ]);
    }
    return res || { ok: false, reason: "Failed." };
  };

  // ------------------------------------------------------------------
  // Repair
  // ------------------------------------------------------------------
  const KIT = "cr_weapon_repair_kit";
  const isThrown = (d) =>
    d && d.type === "weapon" && d.weapon && d.weapon.reloadType === "throw";
  X.condOf = (id) => {
    try {
      return X.invReal() ? G.inventory.condition(id) || 0 : 0;
    } catch (e) {
      return 0;
    }
  };
  X.repairCap = () => {
    try {
      return X.invReal() && G.inventory.repairCap ? G.inventory.repairCap() : 1;
    } catch (e) {
      return 1;
    }
  };
  /** Rows: weapons & apparel you carry that track condition. */
  X.repairRows = function () {
    const rows = [];
    if (!X.invReal()) return rows;
    let list = [];
    try {
      list = G.inventory.list(["weapon", "apparel"]) || [];
    } catch (e) {
      return rows;
    }
    for (const e of list) {
      const d = e.def;
      if (!d || !d.hasCondition || isThrown(d)) continue;
      rows.push({
        id: e.id,
        def: d,
        count: e.count,
        equipped: !!e.equipped,
        cond: X.condOf(e.id),
      });
    }
    rows.sort(
      (a, b) =>
        b.equipped - a.equipped ||
        (a.def.type === b.def.type ? 0 : a.def.type === "weapon" ? -1 : 1) ||
        a.cond - b.cond ||
        a.def.name.localeCompare(b.def.name),
    );
    return rows;
  };
  /** Kit gain (better with Mechanics). */
  X.kitGain = () => 0.2 + (X.skill("mechanics") / 100) * 0.25;
  /** Repair methods for one row: [{key, label, can, why, gain, donor?}] */
  X.repairMethods = function (row) {
    const out = [];
    if (!row) return out;
    const cur = X.condOf(row.id),
      cap = X.repairCap();
    // 1) cannibalise a spare of the same item
    let can = false,
      gain = 0,
      why = "";
    try {
      can = !!G.inventory.canRepair(row.id);
      gain = can && G.inventory.repairGain ? G.inventory.repairGain(row.id) : 0;
    } catch (e) {
      can = false;
    }
    if (!can)
      why =
        row.count < 2
          ? "Needs a second " + row.def.name + "."
          : cur >= cap - 0.01
            ? "Your Mechanics skill limits you to " +
              Math.round(cap * 100) +
              "%."
            : "Can't repair.";
    out.push({
      key: "dup",
      label: "Combine with a spare " + row.def.name,
      can,
      why,
      gain,
      donor: row.id,
    });
    // 2) similar weapons (same family) as donors
    if (
      row.def.type === "weapon" &&
      X.wpnReal() &&
      typeof G.weapons.canRepairWith === "function"
    ) {
      let weapons = [];
      try {
        weapons = G.inventory.list("weapon") || [];
      } catch (e) {
        weapons = [];
      }
      for (const w of weapons) {
        if (w.id === row.id || isThrown(w.def)) continue;
        let ok = false;
        try {
          ok = G.weapons.canRepairWith(row.id, w.id);
        } catch (e) {
          ok = false;
        }
        if (!ok) continue;
        const dc = X.condOf(w.id);
        const g = Math.max(
          0.05,
          dc * (0.25 + (0.6 * X.skill("mechanics")) / 100),
        );
        const capW = Math.min(1, 0.6 + (X.skill("mechanics") / 100) * 0.4);
        const real = Math.max(0, Math.min(capW, cur + g) - cur);
        out.push({
          key: "sim:" + w.id,
          label:
            "Cannibalise " + w.def.name + (w.equipped ? " (equipped)" : ""),
          can: real > 0.001 && !w.equipped,
          why: w.equipped
            ? "Unequip it first."
            : real <= 0.001
              ? "Your Mechanics skill limits you to " +
                Math.round(capW * 100) +
                "%."
              : "",
          gain: real,
          donor: w.id,
        });
      }
    }
    // 3) Gunsmith Kit
    if (row.def.type === "weapon") {
      const have = X.count(KIT);
      const g = Math.max(0, Math.min(1, cur + X.kitGain()) - cur);
      out.push({
        key: "kit",
        label: "Use a Gunsmith Kit" + (have ? " (" + have + ")" : ""),
        can: have > 0 && g > 0.001,
        why: !have
          ? "You have no Gunsmith Kits."
          : "Already in perfect condition.",
        gain: g,
      });
    }
    return out;
  };
  /** Apply a repair method. Returns {ok, gain, cond} | {ok:false, reason}. */
  X.repair = function (row, method) {
    if (!row || !method) return { ok: false, reason: "Nothing to repair." };
    if (!method.can)
      return { ok: false, reason: method.why || "Can't repair." };
    const before = X.condOf(row.id);
    let ok = false;
    try {
      if (method.key === "dup") ok = !!G.inventory.repair(row.id);
      else if (method.key.indexOf("sim:") === 0) {
        const r = G.weapons.repairWith(row.id, method.donor);
        ok = !!(r && r.ok);
        if (!ok)
          return { ok: false, reason: (r && r.reason) || "Can't repair." };
      } else if (method.key === "kit") ok = X.applyKit(row.id, true);
    } catch (e) {
      G.reportError("crafting:repair", e);
      ok = false;
    }
    if (!ok) return { ok: false, reason: "Can't repair." };
    const after = X.condOf(row.id);
    X.S.stats.repaired++;
    X.sfxSeq([
      [0, "machinery_clank", { volume: 0.4, pitch: 1.2 }],
      [0.25, "reload", { volume: 0.5, pitch: 0.7 }],
    ]);
    if (row.def.type === "weapon")
      G.events.emit("weaponRepaired", row.id, after);
    return { ok: true, gain: after - before, cond: after };
  };
  /** Gunsmith Kit on weapon `id`. consume=false when the inventory screen already used it up. */
  X.applyKit = function (id, consume) {
    const d = X.def(id);
    if (
      !d ||
      d.type !== "weapon" ||
      !d.hasCondition ||
      isThrown(d) ||
      X.count(id) <= 0
    )
      return false;
    const cur = X.condOf(id),
      next = Math.min(1, cur + X.kitGain());
    if (next <= cur + 0.001) return false;
    if (consume) {
      try {
        if (G.inventory.remove(KIT, 1, { silent: true }) < 1) return false;
      } catch (e) {
        return false;
      }
    }
    try {
      if (X.wpnReal() && typeof G.weapons.setCondition === "function")
        G.weapons.setCondition(id, next);
      else G.inventory.setCondition(id, next);
    } catch (e) {
      G.reportError("crafting:kit", e);
      return false;
    }
    return true;
  };
  /** Inventory "use" of a kit (already consumed): fix the equipped weapon, else refund. */
  X.onItemUsed = function (id) {
    if (id !== KIT) return;
    let wid = null;
    try {
      wid = G.inventory.equipped ? G.inventory.equipped("weapon") : null;
    } catch (e) {
      wid = null;
    }
    if (!wid) {
      try {
        const c = G.weapons.current && G.weapons.current();
        wid = c && c.id !== "unarmed" ? c.id : null;
      } catch (e) {
        wid = null;
      }
    }
    const before = wid ? X.condOf(wid) : 0;
    if (wid && X.applyKit(wid, false)) {
      const after = X.condOf(wid);
      X.S.stats.repaired++;
      try {
        G.notify(
          X.name(wid) +
            " repaired to " +
            Math.round(after * 100) +
            "% (+" +
            Math.round((after - before) * 100) +
            "%).",
          { kind: "item", icon: "wrench" },
        );
      } catch (e) {
        /* ignore */
      }
      G.events.emit("weaponRepaired", wid, after);
      return;
    }
    // nothing to fix: give the kit back
    try {
      G.inventory.add(KIT, 1, { silent: true });
    } catch (e) {
      /* ignore */
    }
    try {
      G.notify(
        wid
          ? "Your " + X.name(wid) + " is already in perfect condition."
          : "Equip the weapon you want to repair first.",
        { kind: "error" },
      );
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // Ground finding (downward ray must land near street/park level)
  // ------------------------------------------------------------------
  const _down = new THREE.Vector3(0, -1, 0),
    _o = new THREE.Vector3();
  /**
   * Walkable floor height at (x, z) or null. fromY: cast down from there instead of the sky (inside
   * walk-in buildings, under a roof); interior: an INTERIORS cell (no land / terrain test).
   */
  X.groundAt = function (x, z, maxY, fromY, interior) {
    const L = G.LAYOUT;
    if (!interior && L && L.isLand && !L.isLand(x, z)) return null;
    let hit = null;
    const y0 = fromY !== undefined ? fromY : 60;
    try {
      hit = G.world.raycast(
        _o.set(x, y0, z),
        _down,
        fromY !== undefined ? 6 : 90,
        { ignoreTags: ["actor", "foliage"] },
      );
    } catch (e) {
      hit = null;
    }
    const th = interior
      ? fromY !== undefined
        ? fromY - 2.2
        : 0
      : G.world.terrainHeight
        ? G.world.terrainHeight(x, z)
        : 0;
    if (fromY !== undefined && !hit && !interior && th < fromY - 6) return null;
    const y = hit ? hit.point.y : th;
    if (
      y > th + (maxY || 1.2) ||
      y < (G.world.waterLevel !== undefined ? G.world.waterLevel + 0.4 : -0.8)
    )
      return null;
    if (hit && hit.normal && hit.normal.y < 0.82) return null;
    let gy = y;
    try {
      if (G.world.groundHeight) gy = G.world.groundHeight(x, z, y + 0.8, 0.05);
    } catch (e) {
      gy = y;
    }
    if (!isFinite(gy) || Math.abs(gy - y) > 1.2) gy = y;
    return gy;
  };
  /** Ring search for open ground near (x,z). opts.clear = radius that must be free of colliders at waist height. */
  X.findSpot = function (x, z, radius, opts) {
    opts = opts || {};
    for (let ring = 0; ring <= 6; ring++) {
      const n = ring ? 8 + ring * 2 : 1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.7,
          r = (ring / 6) * radius;
        const px = x + Math.cos(a) * r,
          pz = z + Math.sin(a) * r;
        const gy = X.groundAt(px, pz);
        if (gy === null) continue;
        if (opts.clear && !clearAround(px, gy, pz, opts.clear)) continue;
        return { x: px, y: gy, z: pz };
      }
    }
    return null;
  };
  const _dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0.7071, 0.7071],
    [-0.7071, 0.7071],
    [0.7071, -0.7071],
    [-0.7071, -0.7071],
  ];
  const _d3 = new THREE.Vector3();
  function clearAround(x, y, z, r) {
    for (const [dx, dz] of _dirs) {
      _d3.set(dx, 0, dz);
      let h = null;
      try {
        h = G.world.raycast(_o.set(x, y + 0.6, z), _d3, r, {
          ignoreTags: ["actor", "foliage"],
        });
      } catch (e) {
        h = null;
      }
      if (h) return false;
    }
    return true;
  }

  // ------------------------------------------------------------------
  // Stations: campfires (one pooled interactable) & workbenches
  // ------------------------------------------------------------------
  X.fires = []; // Vector3 (label height) of every known campfire
  X.nearFire = null;
  X.propsList = function () {
    try {
      return real("props") && typeof G.props.list === "function"
        ? G.props.list() || []
        : [];
    } catch (e) {
      return [];
    }
  };
  X.scanStations = function () {
    const list = X.propsList();
    X.fires.length = 0;
    X.benchCount = 0;
    for (const p of list) {
      if (!p || !p.pos) continue;
      if (p.type === "campfire") {
        if (
          X.fires.some(
            (f) => Math.abs(f.x - p.pos.x) < 1 && Math.abs(f.z - p.pos.z) < 1,
          )
        )
          continue;
        X.fires.push(new THREE.Vector3(p.pos.x, p.pos.y + 0.45, p.pos.z));
      } else if (p.type === "workbench") X.benchCount++;
    }
    X.nearFire = null;
    return X.fires.length;
  };
  let fireInt = null,
    nearT = 0;
  X.setupCampfireInteract = function () {
    if (fireInt || !G.world || !G.world.addInteractable) return;
    fireInt = G.world.addInteractable({
      getPos: () => X.nearFire,
      radius: 0.85,
      range: 2.6,
      priority: 0.2,
      label: "Campfire",
      verb: "Cook",
      enabled: () => !!X.nearFire,
      onInteract: () => {
        C.open("campfire");
      },
    });
  };
  /** Keep X.nearFire = closest campfire within 14 m (no allocations). */
  X.updateNearFire = function (realDt) {
    nearT -= realDt;
    if (nearT > 0) return;
    nearT = 0.3;
    const p = G.player && G.player.pos;
    if (!p) return;
    let best = null,
      bd = 14 * 14;
    for (let i = 0; i < X.fires.length; i++) {
      const f = X.fires[i];
      const dx = f.x - p.x,
        dz = f.z - p.z,
        dy = f.y - p.y;
      const d2 = dx * dx + dz * dz + dy * dy * 4;
      if (d2 < bd) {
        bd = d2;
        best = f;
      }
    }
    X.nearFire = best;
  };
  /** Light our own camp fires / workbench where an area has none (persistent world props). */
  X.spawnStations = function () {
    if (!real("props") || typeof G.props.spawn !== "function") return;
    const list = X.propsList();
    const near = (type, x, z, r) =>
      list.some(
        (p) =>
          p.type === type && p.pos && Math.hypot(p.pos.x - x, p.pos.z - z) < r,
      );
    for (const [x, z, kind] of X.CAMPFIRES) {
      if (near("campfire", x, z, 40)) continue;
      const s = X.findSpot(x, z, 8, { clear: 1.2 });
      if (!s) continue;
      try {
        G.props.spawn("campfire", {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw: 0,
          pot: kind === "pot",
          spit: kind === "spit",
          id: "cr_fire_" + Math.round(x) + "_" + Math.round(z),
        });
      } catch (e) {
        G.reportError("crafting:campfire", e);
      }
    }
    for (const [x, z, yaw] of X.WORKBENCHES) {
      if (near("workbench", x, z, 40)) continue;
      const s = X.findSpot(x, z, 8, { clear: 1.4 });
      if (!s) continue;
      try {
        G.props.spawn("workbench", {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw,
          id: "cr_bench_" + Math.round(x) + "_" + Math.round(z),
        });
      } catch (e) {
        G.reportError("crafting:workbench", e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Schematic pickups in the world
  // ------------------------------------------------------------------
  let schemPlaced = false;
  X.placeSchematics = function () {
    if (
      schemPlaced ||
      !real("items") ||
      typeof G.items.spawnPickup !== "function"
    )
      return;
    schemPlaced = true;
    X.placed = [];
    for (const [id, x, z, radius, note] of X.SCHEM_PLACEMENTS) {
      try {
        const s = X.findSpot(x, z, radius);
        if (!s) {
          if (G.warnings)
            G.warnings.push("crafting: no spot for " + id + " (" + note + ")");
          continue;
        }
        s.y += 0.02;
        G.items.spawnPickup(id, 1, s, {
          yaw: (((x * 13 + z * 7) % 6.28) + 6.28) % 6.28,
          static: true,
          keepY: true,
        });
        X.placed.push({ id, x: s.x, y: s.y, z: s.z, note });
      } catch (e) {
        G.reportError("crafting:placeSchematic " + id, e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Harvestable plants (instanced per patch & species; LOD'd)
  // ------------------------------------------------------------------
  X.plants = []; // {key, species, pos (Vector3 label), mesh, index, matrix, harvested}
  let plantMat = null;
  const PLANT_GEO = {};
  function coloured(geo, hex) {
    return G.util.paint(geo, hex);
  }
  function buildPlantGeos() {
    if (PLANT_GEO.ashbloom) return;
    const U = G.util;
    const parts = [];
    // Ashbloom: three stems, rust-orange flower heads, a rosette of dusty leaves
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1,
        lean = 0.22;
      const h = 0.34 + i * 0.05;
      const stem = coloured(
        new THREE.CylinderGeometry(0.006, 0.009, h, 5, 1),
        0x5a6a2c,
      );
      parts.push(
        U.bake(
          stem,
          { x: Math.cos(a) * 0.04, y: h / 2, z: Math.sin(a) * 0.04 },
          a,
          1,
          Math.sin(a) * lean,
          Math.cos(a) * lean,
        ),
      );
      const tip = {
        x: Math.cos(a) * 0.04 + Math.cos(a) * h * Math.sin(lean) * 0.9,
        y: h * 0.97,
        z: Math.sin(a) * 0.04 + Math.sin(a) * h * Math.sin(lean) * 0.9,
      };
      parts.push(
        U.bake(
          coloured(
            new THREE.IcosahedronGeometry(0.045, 0),
            i === 1 ? 0xc0501e : 0xd2691e,
          ),
          tip,
          a,
          1,
        ),
      );
      parts.push(
        U.bake(
          coloured(new THREE.ConeGeometry(0.03, 0.05, 5), 0xe0a040),
          { x: tip.x, y: tip.y + 0.035, z: tip.z },
          a,
          1,
        ),
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3;
      const leaf = coloured(new THREE.ConeGeometry(0.035, 0.2, 3), 0x6a7a34);
      parts.push(
        U.bake(
          leaf,
          { x: Math.cos(a) * 0.08, y: 0.04, z: Math.sin(a) * 0.08 },
          -a,
          { x: 1, y: 1, z: 0.35 },
          0,
          Math.PI / 2 - 0.35,
        ),
      );
    }
    PLANT_GEO.ashbloom = U.mergeGeometries(parts);
    const xp = [];
    // Knotroot: a purple-brown crown half out of the soil + long ragged leaves
    xp.push(
      U.bake(
        coloured(new THREE.SphereGeometry(0.075, 7, 5), 0x6e3a58),
        { x: 0, y: 0.03, z: 0 },
        0,
        { x: 1, y: 0.7, z: 1 },
      ),
    );
    xp.push(
      U.bake(
        coloured(new THREE.SphereGeometry(0.05, 6, 4), 0x7a4662),
        { x: 0.07, y: 0.02, z: 0.03 },
        0,
        { x: 1, y: 0.6, z: 1 },
      ),
    );
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const h = 0.28 + (i % 3) * 0.06;
      const leaf = coloured(
        new THREE.ConeGeometry(0.03, h, 3),
        i % 2 ? 0x55702e : 0x4a6428,
      );
      xp.push(
        U.bake(
          leaf,
          { x: Math.cos(a) * 0.05, y: 0.06 + h * 0.45, z: Math.sin(a) * 0.05 },
          -a,
          { x: 1, y: 1, z: 0.3 },
          0,
          0.45,
        ),
      );
    }
    PLANT_GEO.knotroot = U.mergeGeometries(xp);
    plantMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0,
      side: THREE.DoubleSide,
    });
    plantMat.userData.shared = true;
  }
  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _s = new THREE.Vector3(),
    _p = new THREE.Vector3(),
    _e = new THREE.Euler();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  X.buildPlants = function () {
    if (X.plants.length || !G.scene) return;
    buildPlantGeos();
    const U = G.util;
    X.plantRoot = new THREE.Group();
    X.plantRoot.name = "crafting_plants";
    G.scene.add(X.plantRoot);
    X.PLANT_PATCHES.forEach(([cx, cz, radius, n, mix], pi) => {
      const rnd = U.rng(1000 + pi * 77);
      const spots = [];
      for (let tries = 0; tries < n * 6 && spots.length < n; tries++) {
        const a = rnd() * Math.PI * 2,
          r = Math.sqrt(rnd()) * radius;
        const x = cx + Math.cos(a) * r,
          z = cz + Math.sin(a) * r;
        if (spots.some((s) => Math.hypot(s.x - x, s.z - z) < 1.1)) continue;
        const y = X.groundAt(x, z, 1.0);
        if (y === null) continue;
        spots.push({
          x,
          y,
          z,
          sp: spots.length < Math.round(n * mix) ? "ashbloom" : "knotroot",
          rot: rnd() * 6.28,
          sc: 1.15 + rnd() * 0.45,
        });
      }
      if (!spots.length) return;
      for (const sp of ["ashbloom", "knotroot"]) {
        const mine = spots.filter((s) => s.sp === sp);
        if (!mine.length) continue;
        const mesh = new THREE.InstancedMesh(
          PLANT_GEO[sp],
          plantMat,
          mine.length,
        );
        mesh.name = "cr_plants_" + sp + "_" + pi;
        mesh.castShadow = false;
        mesh.receiveShadow = true;
        mine.forEach((s, i) => {
          _q.setFromEuler(_e.set(0, s.rot, 0));
          _m.compose(_p.set(s.x, s.y, s.z), _q, _s.set(s.sc, s.sc, s.sc));
          mesh.setMatrixAt(i, _m);
          const rec = {
            key: "p" + pi + "_" + sp + "_" + i,
            species: sp,
            pos: new THREE.Vector3(s.x, s.y + 0.22, s.z),
            mesh,
            index: i,
            matrix: _m.clone(),
            harvested: false,
            interactable: null,
          };
          rec.interactable = G.world.addInteractable({
            pos: rec.pos,
            radius: 0.4,
            range: 2.4,
            priority: 0.3,
            label: X.PLANT_SPECIES[sp].label,
            verb: "Harvest",
            enabled: () => !rec.harvested,
            onInteract: () => X.harvest(rec),
          });
          X.plants.push(rec);
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (typeof mesh.computeBoundingSphere === "function")
          mesh.computeBoundingSphere();
        else mesh.frustumCulled = false;
        X.plantRoot.add(mesh);
        if (G.world.addLOD)
          G.world.addLOD(mesh, 110, new THREE.Vector3(cx, 0, cz));
      }
    });
  };
  function setPlantVisible(rec, on) {
    rec.mesh.setMatrixAt(rec.index, on ? rec.matrix : ZERO);
    rec.mesh.instanceMatrix.needsUpdate = true;
  }
  X.harvest = function (rec) {
    if (!rec || rec.harvested) return false;
    const sp = X.PLANT_SPECIES[rec.species];
    const n = 1 + (X.skill("survival") >= 60 ? 1 : 0);
    rec.harvested = true;
    X.S.harvested[rec.key] = X.gameHours() + X.REGROW_HOURS;
    setPlantVisible(rec, false);
    try {
      if (X.invReal()) G.inventory.add(sp.item, n);
    } catch (e) {
      G.reportError("crafting:harvest", e);
    }
    X.S.stats.harvested += n;
    X.sfx("pickup", { pos: rec.pos, volume: 0.6 });
    G.events.emit("plantHarvested", sp.item, n);
    return true;
  };
  /** Apply X.S.harvested to the meshes (after load/reset) and regrow what's due. */
  X.syncPlants = function () {
    const now = X.gameHours();
    for (const rec of X.plants) {
      const until = X.S.harvested[rec.key];
      const h = until !== undefined && until > now;
      if (!h && until !== undefined) delete X.S.harvested[rec.key];
      if (h !== rec.harvested) {
        rec.harvested = h;
        setPlantVisible(rec, !h);
      }
    }
  };
})();
