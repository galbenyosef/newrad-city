// play-inline-478 01 — conds
// Lines 20-324 of readable/play-inline-478.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const U = G.util;

  const SLOTS = ["weapon", "body", "head", "eyes", "mouth", "goggles"];
  const CURRENCY = "scrip";
  // Transition: old ids / slot names resolve through src/core/compat.js (phase 2 drops this).
  const cid = (id) =>
    typeof id === "string" && G.items && G.items.canonicalId
      ? G.items.canonicalId(id)
      : id;
  let stacks = new Map(); // id -> {count, conds?: number[]}
  let equipped = {}; // slot -> id
  let syncingWeapon = false;

  const def = (id) => G.items.get(id);
  const nameOf = (id) => {
    const d = def(id);
    return d ? d.name : id;
  };
  const hasCond = (d) => !!(d && d.hasCondition);
  const r3 = (v) => Math.round(v * 1000) / 1000;

  let weightCache = null; // total carried weight, recomputed lazily after any change
  function changed() {
    weightCache = null;
    if (!G.isStub("rpg")) G.rpg._dirty();
    G.events.emit("inventoryChanged");
  }

  // ------------------------------------------------------------------
  // Per-unit condition helpers
  // ------------------------------------------------------------------
  /** Normalise a condition argument (number | number[] | undefined) into n unit conditions. */
  function condList(c, n) {
    const out = new Array(n);
    if (Array.isArray(c)) {
      const avg = c.length
        ? c.reduce((a, b) => a + (+b || 0), 0) / c.length
        : 1;
      for (let i = 0; i < n; i++)
        out[i] = U.clamp(i < c.length && isFinite(c[i]) ? +c[i] : avg, 0, 1);
    } else {
      const v = typeof c === "number" && isFinite(c) ? U.clamp(c, 0, 1) : 1;
      for (let i = 0; i < n; i++) out[i] = v;
    }
    return out;
  }
  const desc = (a, b) => b - a;
  /**
   * Keep the unit order meaningful: when the stack is equipped the active unit (conds[0]) stays
   * put and the spares are sorted best-first; otherwise the best unit becomes the active one.
   */
  function settle(id, s) {
    if (!s || !s.conds) return;
    if (s.conds.length > s.count) s.conds.length = s.count;
    while (s.conds.length < s.count)
      s.conds.push(s.conds.length ? s.conds[s.conds.length - 1] : 1);
    if (s.conds.length < 2) return;
    if (isEquipped(id)) {
      const head = s.conds[0];
      const rest = s.conds.slice(1).sort(desc);
      s.conds = [head].concat(rest);
    } else s.conds.sort(desc);
  }
  const activeCond = (s) => (s && s.conds && s.conds.length ? s.conds[0] : 1);

  // ------------------------------------------------------------------
  // Core stack operations
  // ------------------------------------------------------------------
  /**
   * Add items. opts: {silent, cond (0..1 | array of per-unit 0..1), conds (array), noCollect}
   * Returns number added.
   */
  function add(id, n, opts) {
    if (!id) return 0;
    n = n === undefined ? 1 : Math.floor(n);
    if (!(n > 0)) return 0;
    opts = opts || {};
    const d = def(id);
    if (!d)
      console.warn(
        '[rpg] inventory.add: undefined item "' + id + '" (kept anyway)',
      );
    // World's Fair medallions: a collection (one of each ever); the curator at Grand Central buys them
    if (d && d.medallion) {
      if (G.rpg.hasMedallion && G.rpg.hasMedallion(id)) {
        if (!opts.silent) G.notify("You already have this medallion.");
        return 0;
      }
      stacks.set(id, { count: 1 });
      if (!opts.noCollect) G.rpg.collectMedallion(d);
      changed();
      G.events.emit("itemAdded", id, 1);
      return 1;
    }
    let s = stacks.get(id);
    if (!s) {
      s = { count: 0 };
      stacks.set(id, s);
    }
    if (hasCond(d)) {
      if (!s.conds) s.conds = condList(1, s.count);
      const incoming = condList(
        opts.conds !== undefined ? opts.conds : opts.cond,
        n,
      );
      for (const c of incoming) s.conds.push(c);
    }
    s.count += n;
    settle(id, s);
    if (id === CURRENCY && !G.isStub("rpg")) G.rpg.bumpStat("scripFound", n);
    if (!opts.silent)
      G.notify(
        n > 1 ? nameOf(id) + " (" + n + ") added." : nameOf(id) + " added.",
        { kind: "item", id, count: n },
      );
    changed();
    G.events.emit("itemAdded", id, n);
    return n;
  }

  /**
   * Remove up to n items. opts: {notify, outConds: [] (receives the removed units' conditions),
   * best: true (take the best units instead of the worst spares)}. Returns number removed.
   * By default the worst spare units go first and the active (worn/wielded) unit goes last.
   */
  function remove(id, n, opts) {
    const s = stacks.get(id);
    if (!s) return 0;
    n = n === undefined ? 1 : Math.floor(n);
    const k = Math.min(n, s.count);
    if (!(k > 0)) return 0;
    if (s.conds) {
      settle(id, s);
      let taken;
      if (opts && opts.best && !isEquipped(id)) taken = s.conds.splice(0, k);
      else if (k >= s.conds.length) taken = s.conds.splice(0, s.conds.length);
      else taken = s.conds.splice(s.conds.length - k, k);
      if (opts && Array.isArray(opts.outConds))
        for (const c of taken) opts.outConds.push(c);
    }
    s.count -= k;
    if (s.count <= 0) {
      stacks.delete(id);
      // the item is gone: clear its slot unconditionally (force — even the goggles slot)
      for (const slot of SLOTS)
        if (equipped[slot] === id) unequip(slot, { silent: true, force: true });
    }
    if (opts && opts.notify)
      G.notify(
        k > 1 ? nameOf(id) + " (" + k + ") removed." : nameOf(id) + " removed.",
        { kind: "item_removed", id, count: k },
      );
    changed();
    G.events.emit("itemRemoved", id, k);
    return k;
  }

  function count(id) {
    const s = stacks.get(id);
    return s ? s.count : 0;
  }
  function has(id, n) {
    return count(id) >= (n || 1);
  }

  function list(filterType) {
    let types = null;
    if (filterType)
      types = Array.isArray(filterType)
        ? filterType
        : String(filterType).split(",");
    const out = [];
    for (const [id, s] of stacks) {
      const d = def(id);
      const type = d ? d.type : "misc";
      if (types && types.indexOf(type) < 0) continue;
      out.push({
        id,
        count: s.count,
        def: d,
        equipped: isEquipped(id),
        condition: s.conds ? s.conds[0] : undefined,
        conditions: s.conds ? s.conds.slice() : undefined,
        value: d ? d.value : 0,
        weight: d ? d.weight : 0,
      });
    }
    out.sort((a, b) =>
      (a.def ? a.def.name : a.id).localeCompare(b.def ? b.def.name : b.id),
    );
    return out;
  }

  // ------------------------------------------------------------------
  // Equipment
  // ------------------------------------------------------------------
  function slotFor(d) {
    if (!d) return null;
    if (d.type === "weapon") return "weapon";
    if (d.type === "apparel")
      return SLOTS.indexOf(d.slot) >= 0 ? d.slot : "body";
    return null;
  }
  function isEquipped(id) {
    for (const s of SLOTS) if (equipped[s] === id) return true;
    return false;
  }
  function equippedIn(slot) {
    return equipped[slot] || null;
  }

  function equip(id, opts) {
    opts = opts || {};
    const d = def(id);
    if (!d || !has(id)) return false;
    const slot = slotFor(d);
    if (!slot) return false;
    // not yet equipped → settle() puts the best unit of the stack in the active position
    if (!isEquipped(id)) settle(id, stacks.get(id));
    if (d.exoRig && !G.rpg.hasTalent("rig_certified")) {
      if (!opts.silent) {
        G.notify("You aren't certified to operate an exo-rig.", {
          kind: "error",
        });
        G.sfx.play("ui_error");
      }
      return false;
    }
    if (slot === "weapon") {
      equipped.weapon = id;
      G.events.emit("equipChanged", "weapon", id);
      if (!syncingWeapon && !G.isStub("weapons")) {
        syncingWeapon = true;
        try {
          const cur = G.weapons.current && G.weapons.current();
          if (!cur || cur.id !== id) G.weapons.equip(id);
        } catch (e) {
          G.reportError("rpg:equipWeapon", e);
        }
        syncingWeapon = false;
      }
      changed();
      return true;
    }
    if (equipped[slot] === id) return true;
    // an exo-rig body forces off conflicting body armour automatically (slot replace)
    equipped[slot] = id;
    if (!opts.silent)
      G.sfx.play(
        d.tags.indexOf("armor_heavy") >= 0 || d.exoRig
          ? "pickup_armor"
          : "ui_select",
        { volume: 0.6 },
      );
    G.events.emit("equipChanged", slot, id);
    changed();
    return true;
  }

  function unequip(idOrSlot, opts) {
    opts = opts || {};
    let slot = SLOTS.indexOf(idOrSlot) >= 0 ? idOrSlot : null;
    if (!slot) for (const s of SLOTS) if (equipped[s] === idOrSlot) slot = s;
    if (!slot || !equipped[slot]) return false;
    if (slot === "goggles" && !opts.force) {
      if (!opts.silent) G.notify("The VIGIL goggles stay with you.");
      return false;
    }
    const was = equipped[slot];
    delete equipped[slot];
    settle(was, stacks.get(was));
    G.events.emit("equipChanged", slot, null);
    if (slot === "weapon" && !syncingWeapon && !G.isStub("weapons")) {
      syncingWeapon = true;
      try {
        const cur = G.weapons.current && G.weapons.current();
        if (cur && cur.id) G.weapons.equip(null);
      } catch (e) {
        G.reportError("rpg:unequipWeapon", e);
      }
      syncingWeapon = false;
    }
    changed();
    return true;
  }

  /** [{id, def, condition, slot}] of equipped apparel (used by G.rpg.recalc). */
  function equippedApparel() {
    const out = [];
    for (const s of SLOTS) {
      if (s === "weapon" || !equipped[s]) continue;
      const id = equipped[s];
      const d = def(id);
      if (!d) continue;
      const st = stacks.get(id);
      out.push({ id, def: d, slot: s, condition: activeCond(st) });
    }
    return out;
  }

  // ------------------------------------------------------------------
  // Use / drop
  // ------------------------------------------------------------------
