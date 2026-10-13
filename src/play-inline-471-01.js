// play-inline-471 01 — rnd
// Lines 22-362 of readable/play-inline-471.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;

  const REG = new Map(); // id -> def
  const LOOT = new Map(); // tableId -> table
  let catCache = null; // cached per-category sorted lists (invalidated on define)

  const TYPES = [
    "weapon",
    "apparel",
    "aid",
    "misc",
    "ammo",
    "note",
    "tape",
    "key",
    "junk",
  ];

  function titleCase(id) {
    return String(id)
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** Default goggles icon id by type/tags (ui_hud maps these to its vector glyphs). */
  function defaultIcon(d) {
    if (d.type === "weapon") return "weapon";
    if (d.type === "ammo") return "ammo";
    if (d.type === "apparel")
      return d.exoRig
        ? "exo_rig"
        : d.slot === "head"
          ? "helmet"
          : d.slot === "eyes"
            ? "glasses"
            : "apparel";
    if (d.type === "aid") {
      if (d.tags.indexOf("chem") >= 0) return "chem";
      if (d.tags.indexOf("drink") >= 0) return "drink";
      if (d.tags.indexOf("food") >= 0) return "food";
      return "medical";
    }
    if (d.type === "note") return "note";
    if (d.type === "tape") return "tape";
    if (d.type === "key") return "key";
    if (d.id === "scrip") return "scrip";
    return "misc";
  }

  /** Normalise and register an item definition. Re-defining an id merges. */
  function define(def) {
    if (!def || !def.id) return null;
    const id = def.id;
    const prev = REG.get(id);
    const d = Object.assign({}, prev || {}, def);
    d.id = id;
    d.type = TYPES.indexOf(d.type) >= 0 ? d.type : "misc";
    d.name = d.name || titleCase(d.id);
    if (d.weapon && typeof d.weapon === "object") {
      if (def.weight === undefined && d.weapon.weight !== undefined)
        d.weight = d.weapon.weight;
      if (def.value === undefined && d.weapon.value !== undefined)
        d.value = d.weapon.value;
    }
    d.weight = Number(d.weight) || 0;
    d.value = Number(d.value) || 0;
    d.tags = Array.isArray(d.tags) ? d.tags.slice() : [];
    if (d.type === "apparel" && !d.slot) d.slot = "body";
    if (!d.icon) d.icon = defaultIcon(d);
    d.desc = d.desc || "";
    // condition-tracked item types (weapons and apparel degrade)
    const thrown =
      d.type === "weapon" &&
      (d.stackable || (d.weapon && d.weapon.reloadType === "throw"));
    d.hasCondition =
      d.hasCondition !== undefined
        ? d.hasCondition
        : (d.type === "weapon" && !thrown) ||
          (d.type === "apparel" && d.slot !== "goggles" && !d.noCondition);
    REG.set(d.id, d);
    catCache = null;
    // a (re)definition may change the weight of something already carried
    try {
      if (G.inventory && G.inventory._invalidateWeight)
        G.inventory._invalidateWeight();
    } catch (e) {
      /* stub */
    }
    return d;
  }

  function get(id) {
    return (id && REG.get(id)) || null;
  }
  function all() {
    return Array.from(REG.values());
  }
  function byType(t) {
    return all().filter((d) => d.type === t);
  }
  function byTag(tag) {
    return all().filter((d) => d.tags.indexOf(tag) >= 0);
  }

  // ------------------------------------------------------------------
  // Category lists for dynamic loot (built lazily, cached until define())
  // ------------------------------------------------------------------
  function categories() {
    if (catCache) return catCache;
    const c = { ammo: [], weapon: [], grenade: [], mine: [], tag: {} };
    for (const d of REG.values()) {
      if (d.noLoot || d.unique || d.quest || d.id === "unarmed") continue;
      if ((d.type === "weapon" || d.type === "apparel") && d.value <= 0)
        continue;
      if (d.type === "ammo") c.ammo.push(d);
      else if (d.type === "weapon") {
        const w = d.weapon || {};
        if (w.projectile === "grenade" || d.tags.indexOf("grenade") >= 0)
          c.grenade.push(d);
        else if (d.tags.indexOf("mine") >= 0 || w.mine) c.mine.push(d);
        else c.weapon.push(d);
      }
      for (const t of d.tags) (c.tag[t] = c.tag[t] || []).push(d);
    }
    const byVal = (a, b) => a.value - b.value;
    c.ammo.sort(byVal);
    c.weapon.sort(byVal);
    c.grenade.sort(byVal);
    c.mine.sort(byVal);
    for (const t in c.tag) c.tag[t].sort(byVal);
    catCache = c;
    return c;
  }

  /**
   * Level-aware pick from a value-sorted list: at low level only the cheap
   * end of the list is eligible; cheap items stay more likely throughout.
   */
  function levelPick(list, level, rnd, base) {
    if (!list || !list.length) return null;
    const frac = Math.min(1, (base !== undefined ? base : 0.3) + level / 22);
    const n = Math.max(1, Math.ceil(list.length * frac));
    let total = 0;
    const ws = [];
    for (let i = 0; i < n; i++) {
      const w = (1 / (1 + (i / n) * 2.5)) * (list[i].lootWeight || 1);
      ws.push(w);
      total += w;
    }
    let r = rnd() * total;
    for (let i = 0; i < n; i++) {
      r -= ws[i];
      if (r <= 0) return list[i];
    }
    return list[n - 1];
  }

  // ------------------------------------------------------------------
  // Loot tables
  // ------------------------------------------------------------------
  /**
   * table: { rolls: [ { chance=1, picks=[1,1], entries:[entry...] } ] }
   * entry: {id, w=1, n=[a,b]|n, minLevel?, maxLevel?, cond?:[a,b]}
   *      | {tag:'food', w, n}          — random registered item carrying the tag (level-weighted)
   *      | {cat:'ammo'|'weapon'|'grenade'|'mine', skill?, w, n, withAmmo?}
   *      | {scrip:[a,b], w}            — ration scrip (scaled by level; Talent bonus)
   *      | {table:'junk', w}           — nested table roll
   *      | {none:true, w}              — nothing
   */
  function defineLootTable(id, table) {
    if (!id || !table) return;
    table.id = id;
    table.rolls = table.rolls || [];
    LOOT.set(id, table);
  }
  function lootTable(id) {
    return LOOT.get(id) || null;
  }
  function lootTables() {
    return Array.from(LOOT.keys());
  }

  function randN(n, rnd) {
    if (Array.isArray(n)) return n[0] + Math.floor(rnd() * (n[1] - n[0] + 1));
    return n === undefined ? 1 : n;
  }

  function pushOut(out, id, n, cond) {
    if (!id || n <= 0) return;
    // merge with existing stack
    for (const e of out)
      if (e[0] === id && e[2] === undefined && cond === undefined) {
        e[1] += n;
        return;
      }
    if (cond !== undefined) out.push([id, n, cond]);
    else out.push([id, n]);
  }

  function scripMult() {
    let m = 1;
    try {
      if (!G.isStub("rpg") && G.rpg.lootScripMult) m = G.rpg.lootScripMult();
    } catch (e) {
      /* ignore */
    }
    return m;
  }
  function ammoMult() {
    let m = 1;
    try {
      if (!G.isStub("rpg") && G.rpg.lootAmmoMult) m = G.rpg.lootAmmoMult();
    } catch (e) {
      /* ignore */
    }
    return m;
  }

  /** Ammo item id used by a weapon def (weapon block .ammo), or null. */
  function ammoFor(weaponDef) {
    if (!weaponDef) return null;
    const w = weaponDef.weapon || weaponDef;
    const a = w && w.ammo;
    return a && get(a) ? a : null;
  }

  function resolveEntry(e, level, rnd, out, depth) {
    if (e.none) return;
    if (e.table) {
      roll(e.table, level, rnd, out, depth + 1);
      return;
    }
    const scrip = e.scrip;
    if (scrip) {
      const n = Math.round(
        randN(scrip, rnd) * (1 + level * 0.06) * scripMult(),
      );
      pushOut(out, "scrip", n);
      return;
    }
    if (e.id) {
      if (!get(e.id)) return; // not defined (module missing) → skip silently
      const d = get(e.id);
      const n = randN(e.n, rnd);
      const cond = d.hasCondition ? randCond(e.cond, rnd) : undefined;
      pushOut(
        out,
        d.id,
        d.type === "ammo" ? Math.max(1, Math.round(n * ammoMult())) : n,
        cond,
      );
      if (e.withAmmo && d.type === "weapon") {
        const a = ammoFor(d);
        if (a) pushOut(out, a, Math.round(randN(e.withAmmo, rnd) * ammoMult()));
      }
      return;
    }
    if (e.tag) {
      const list = categories().tag[e.tag];
      const d = levelPick(list, level, rnd, 0.6);
      if (d)
        pushOut(
          out,
          d.id,
          randN(e.n, rnd),
          d.hasCondition ? randCond(e.cond, rnd) : undefined,
        );
      return;
    }
    if (e.cat) {
      const C = categories();
      if (e.cat === "ammo") {
        let list = C.ammo;
        if (e.forWeapons) {
          // prefer ammo for weapons the player owns (Scrounger feel)
          const owned = [];
          try {
            if (!G.isStub("inventory"))
              for (const s of G.inventory.list("weapon")) {
                const a = ammoFor(s.def);
                if (a) owned.push(get(a));
              }
          } catch (err) {
            /* ignore */
          }
          if (owned.length && rnd() < 0.6) list = owned;
        }
        const d = levelPick(list, level, rnd, 0.4);
        if (!d) return;
        // cheap ammo drops in bigger piles
        const base = randN(e.n || [4, 14], rnd);
        const scale =
          d.value <= 1
            ? 1.4
            : d.value <= 3
              ? 1
              : d.value <= 10
                ? 0.6
                : d.value <= 60
                  ? 0.25
                  : 0.08;
        pushOut(out, d.id, Math.max(1, Math.round(base * scale * ammoMult())));
        return;
      }
      let list =
        e.cat === "grenade" ? C.grenade : e.cat === "mine" ? C.mine : C.weapon;
      if (e.skill) {
        const sk = Array.isArray(e.skill) ? e.skill : [e.skill];
        list = list.filter((d) => d.weapon && sk.indexOf(d.weapon.skill) >= 0);
      }
      if (e.maxValue) list = list.filter((d) => d.value <= e.maxValue);
      const d = levelPick(list, level, rnd, 0.25);
      if (!d) return;
      pushOut(
        out,
        d.id,
        e.cat === "weapon" ? 1 : randN(e.n || [1, 2], rnd),
        d.hasCondition ? randCond(e.cond, rnd) : undefined,
      );
      if (e.cat === "weapon" && e.withAmmo !== false) {
        const a = ammoFor(d);
        if (a)
          pushOut(
            out,
            a,
            Math.max(
              1,
              Math.round(randN(e.withAmmo || [6, 18], rnd) * ammoMult()),
            ),
          );
      }
    }
  }

  function randCond(c, rnd) {
    const lo = c ? c[0] : 0.25,
      hi = c ? c[1] : 0.75;
    return Math.round((lo + (hi - lo) * rnd()) * 100) / 100;
  }

