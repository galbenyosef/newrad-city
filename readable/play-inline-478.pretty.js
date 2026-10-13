/* src/rpg/40_inventory.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — PLAYER INVENTORY  (G.inventory)
 *
 * Stacks keyed by item id: {count, conds?}. Items with condition (weapons &
 * apparel, def.hasCondition) keep ONE condition per unit (`conds`, length ===
 * count, values 0..1). conds[0] is the "active" unit: the one worn/wielded when
 * the stack is equipped, and the one shown in the goggles. Picking up a
 * battered copy never touches the item you are wearing; field repair
 * cannibalises the worst spare to fix the active unit.
 *
 * Equipment slots: weapon, body, head, eyes, mouth, goggles.
 * Currency is ration scrip (item id 'scrip').
 * Weapons are equipped through G.weapons.equip (kept in sync both ways).
 *
 * Emits: inventoryChanged, itemAdded(id,n), itemRemoved(id,n),
 *        equipChanged(slot,id), itemUsed(id), noteRead(id), conditionChanged(id,v)
 * ===================================================================== */
(function () {
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
  function use(id) {
    const d = def(id);
    if (!d || !has(id)) return false;
    switch (d.type) {
      case "aid": {
        const P = G.player;
        if (P && P.alive === false) return false;
        if (G.state === "dead") {
          G.sfx.play("ui_error");
          return false;
        }
        // Apply first, consume only on success: a failing effect must never eat the item.
        try {
          G.rpg.applyAid(d);
        } catch (e) {
          G.reportError("rpg:useAid " + id, e);
          G.sfx.play("ui_error");
          return false;
        }
        remove(id, 1);
        G.sfx.play(
          d.sound ||
            (d.tags.indexOf("drink") >= 0
              ? "drink"
              : d.tags.indexOf("food") >= 0
                ? "eat"
                : "inject"),
        );
        // Leftovers: an empty bottle now and then (junk for crafting/selling).
        if (/^fizzo_/.test(d.id)) {
          if (def("empty_fizzo_bottle") && Math.random() < 0.5)
            add("empty_fizzo_bottle", 1, { silent: true });
        }
        G.events.emit("itemUsed", id);
        return true;
      }
      case "weapon":
        if (equipped.weapon === id) return unequip("weapon");
        return equip(id);
      case "apparel":
        if (isEquipped(id)) return unequip(id);
        return equip(id);
      case "note":
      case "tape":
        G.events.emit("noteRead", id, d);
        return true;
      default:
        if (d.book) {
          try {
            G.rpg.readBook(d);
          } catch (e) {
            G.reportError("rpg:readBook " + id, e);
            return false;
          }
          remove(id, 1);
          G.sfx.play("pickup_note");
          G.events.emit("itemUsed", id);
          return true;
        }
        return false;
    }
  }

  function canDrop(id) {
    const d = def(id);
    return !!(d && !d.quest && !d.medallion && d.slot !== "goggles");
  }

  /** Drop n items at the player's feet as a world pickup. */
  function drop(id, n) {
    const d = def(id);
    if (!has(id)) return false;
    if (d && (d.quest || d.medallion)) {
      G.notify("You can't drop quest items.");
      G.sfx.play("ui_error");
      return false;
    }
    n = Math.min(n === undefined ? 1 : Math.floor(n), count(id));
    if (!(n > 0)) return false;
    const outConds = [];
    remove(id, n, { outConds });
    const P = G.player;
    if (P && G.items.spawnPickup) {
      const f = P.forward || { x: 0, z: -1 };
      const len = Math.hypot(f.x, f.z) || 1;
      const at = () => ({
        x: P.pos.x + (f.x / len) * 1.1 + (Math.random() - 0.5) * 0.5,
        y: P.pos.y + 0.5,
        z: P.pos.z + (f.z / len) * 1.1 + (Math.random() - 0.5) * 0.5,
      });
      // Weapons/armour keep their own condition: a few are dropped as separate items, bigger
      // piles as one pickup carrying every unit's condition.
      if (outConds.length > 1 && outConds.length <= 4)
        for (const c of outConds)
          G.items.spawnPickup(id, 1, at(), { cond: c, dropped: true });
      else
        G.items.spawnPickup(id, n, at(), {
          cond: outConds.length
            ? outConds.length > 1
              ? outConds
              : outConds[0]
            : undefined,
          dropped: true,
        });
    }
    G.sfx.play("ui_back", { volume: 0.5 });
    return true;
  }

  // ------------------------------------------------------------------
  // Weight / scrip / condition / repair
  // ------------------------------------------------------------------
  /** Total carried weight (cached; the player queries encumbrance every frame). */
  /**
   * Hardcore: ammunition has weight. Per-round weights (lb) by calibre; a def may carry its
   * own `hcWeight`. Outside Hardcore ammo is weightless.
   */
  const HC_AMMO = [
    [/recoilless/, 8],
    [/missile|rocket/, 3],
    [/12ga|shell|20ga/, 0.05],
    [/308|50mg|\.50/, 0.05],
    [/44|45|357/, 0.035],
    [/556|5_56/, 0.02],
    [/10mm|9mm|32/, 0.015],
    [/5mm/, 0.01],
    [/gyrojet/, 0.04],
    [/dry_cell/, 0.6],
    [/flamer|fuel/, 0.02],
    [/rivet/, 0.05],
    [/bb$|_bb/, 0.001],
  ];
  function hcAmmoWeight(d) {
    if (typeof d.hcWeight === "number") return d.hcWeight;
    for (const e of HC_AMMO) if (e[0].test(d.id)) return e[1];
    return 0.02;
  }
  let weightCacheHC = false;
  function weight() {
    let hc = false;
    try {
      hc = !G.isStub("rpg") && !!(G.rpg.isHardcore && G.rpg.isHardcore());
    } catch (e) {
      hc = false;
    }
    if (weightCache !== null && weightCacheHC === hc) return weightCache;
    let w = 0;
    for (const [id, s] of stacks) {
      const d = def(id);
      if (!d) continue;
      if (d.weight) w += d.weight * s.count;
      else if (hc && d.type === "ammo") w += hcAmmoWeight(d) * s.count;
    }
    weightCache = Math.round(w * 10) / 10;
    weightCacheHC = hc;
    return weightCache;
  }
  function totalValue() {
    let v = 0;
    for (const [id, s] of stacks) {
      const d = def(id);
      if (d) v += (d.value || 0) * s.count;
    }
    return v;
  }
  function scrip() {
    return count(CURRENCY);
  }
  /**
   * Add (n > 0) or pay (n < 0) scrip. Paying more than you have removes NOTHING and returns 0
   * (so a barter/quest caller that forgets to check scrip() can't hand out goods for less);
   * pass {partial:true} to take whatever there is. Returns the signed amount moved.
   */
  function addScrip(n, opts) {
    n = Math.round(n || 0);
    if (n > 0) return add(CURRENCY, n, opts);
    if (n < 0) {
      if (scrip() < -n && !(opts && opts.partial)) return 0;
      return -remove(CURRENCY, -n);
    }
    return 0;
  }
  /** Condition 0..1 of the active unit (the one worn / wielded / shown). 0 if you have none. */
  function condition(id) {
    const s = stacks.get(id);
    return s ? activeCond(s) : 0;
  }
  /** Every unit's condition (best spare first after the active one). */
  function conditions(id) {
    const s = stacks.get(id);
    return s && s.conds ? s.conds.slice() : [];
  }
  function setCondition(id, v) {
    const s = stacks.get(id);
    if (!s) return;
    const d = def(id);
    if (d && !d.hasCondition) return;
    if (!s.conds) s.conds = condList(1, s.count);
    const nv = U.clamp(+v || 0, 0, 1);
    const before = s.conds[0];
    if (before === nv) return;
    s.conds[0] = nv;
    G.rpg._dirty();
    // weapons decay a little per shot → only emit on 5 % steps or large jumps
    emitCond(id, before, nv, Math.abs(nv - before) >= 0.05);
  }
  // conditionChanged is throttled for continuous wear: only when crossing a 5 % step (or forced).
  function emitCond(id, before, after, force) {
    if (force || Math.floor(before * 20) !== Math.floor(after * 20))
      G.events.emit("conditionChanged", id, after);
  }
  /** Armor wears as it absorbs hits (called by G.rpg.mitigate). Only the worn unit wears. */
  function wearArmor(amount) {
    if (!(amount > 0)) return;
    let any = false;
    for (const e of equippedApparel()) {
      if (!e.def.hasCondition) continue;
      const s = stacks.get(e.id);
      if (!s) continue;
      if (!s.conds) s.conds = condList(1, s.count);
      const before = s.conds[0];
      const after = Math.max(
        0,
        before - amount * 0.0006 * (e.slot === "body" ? 1 : 0.6),
      );
      if (after === before) continue;
      s.conds[0] = after;
      any = true;
      emitCond(e.id, before, after, false);
      if (before > 0.1 && after <= 0.1)
        G.notify("Your " + e.def.name + " is nearly broken.", {
          kind: "condition",
        });
      if (before > 0 && after <= 0)
        G.notify("Your " + e.def.name + " is broken!", { kind: "condition" });
    }
    if (any) G.rpg._dirty(); // DR scales with condition: recalc at once, not on the next throttle tick
  }
  /** Maximum condition the player can repair to (scales with Mechanics). */
  function repairCap() {
    return U.clamp(0.4 + (G.rpg.skill("mechanics") / 100) * 0.6, 0.4, 1);
  }
  function canRepair(id) {
    const d = def(id);
    const s = stacks.get(id);
    return !!(
      d &&
      d.hasCondition &&
      s &&
      s.count >= 2 &&
      activeCond(s) < repairCap() - 0.01
    );
  }
  /**
   * Field repair: cannibalise the WORST spare to fix the active unit. The gain comes from
   * the donor's condition scaled by Mechanics (a pristine donor at Mechanics 100 restores ~85 %),
   * capped by repairCap(). Returns the condition gained (0 = nothing done).
   */
  function repairGain(id) {
    const s = stacks.get(id);
    if (!s || !s.conds || s.conds.length < 2) return 0;
    const donor = s.conds[s.conds.length - 1];
    const cur = s.conds[0];
    const gain = Math.max(
      0.02,
      donor * (0.3 + (0.55 * G.rpg.skill("mechanics")) / 100),
    );
    return Math.max(0, Math.min(repairCap(), cur + gain) - cur);
  }
  function repair(id) {
    if (!canRepair(id)) return false;
    const s = stacks.get(id);
    settle(id, s);
    const g = repairGain(id);
    const before = s.conds[0];
    s.conds.pop(); // the donor is consumed
    s.count -= 1;
    s.conds[0] = Math.min(repairCap(), before + g);
    G.sfx.play("reload", { volume: 0.5 });
    if (G.rpg.practice) G.rpg.practice("mechanics", 3, "repair");
    G.rpg._dirty();
    emitCond(id, before, s.conds[0], true);
    changed();
    G.events.emit("itemRemoved", id, 1);
    return true;
  }

  // ------------------------------------------------------------------
  // Weapons module sync
  // ------------------------------------------------------------------
  G.events.on("weaponEquipped", (id) => {
    if (syncingWeapon) return;
    syncingWeapon = true;
    try {
      if (id && has(id)) {
        if (equipped.weapon !== id) {
          equipped.weapon = id;
          G.events.emit("equipChanged", "weapon", id);
          changed();
        }
      } else if (!id && equipped.weapon) {
        delete equipped.weapon;
        G.events.emit("equipChanged", "weapon", null);
        changed();
      }
    } finally {
      syncingWeapon = false;
    }
  });

  // ------------------------------------------------------------------
  // Save / reset
  // ------------------------------------------------------------------
  function serialize() {
    const items = [];
    for (const [id, s] of stacks) {
      if (!s.conds) {
        items.push([id, s.count]);
        continue;
      }
      // one number when every unit shares a condition, else the per-unit list
      const same = s.conds.every((c) => c === s.conds[0]);
      items.push([id, s.count, same ? r3(s.conds[0]) : s.conds.map(r3)]);
    }
    return { items, equipped: Object.assign({}, equipped) };
  }
  function deserialize(d) {
    stacks = new Map();
    equipped = {};
    if (!d) {
      changed();
      return;
    }
    for (const e of d.items || []) {
      if (!e || !e[0] || !(e[1] > 0)) continue;
      const iid = cid(e[0]);
      const s = { count: Math.floor(e[1]) };
      const idef = def(iid);
      if (e[2] !== undefined && e[2] !== null)
        s.conds = condList(e[2], s.count);
      else if (hasCond(idef)) s.conds = condList(1, s.count);
      const prev = stacks.get(iid);
      if (prev) {
        prev.count += s.count;
        if (prev.conds || s.conds)
          prev.conds = (prev.conds || condList(1, prev.count - s.count)).concat(
            s.conds || condList(1, s.count),
          );
      } else stacks.set(iid, s);
    }
    for (const k in d.equipped || {}) {
      const slot = k;
      const iid = cid(d.equipped[k]);
      if (stacks.has(iid)) equipped[slot] = iid;
    }
    changed();
  }
  function reset() {
    stacks = new Map();
    equipped = {};
    changed();
  }
  /** Re-apply the equipped weapon to the weapons module (after load / newGame). */
  function syncWeapon() {
    if (G.isStub("weapons")) return;
    const id = equipped.weapon || null;
    syncingWeapon = true;
    try {
      const cur = G.weapons.current && G.weapons.current();
      if (id && (!cur || cur.id !== id)) G.weapons.equip(id);
    } catch (e) {
      G.reportError("rpg:syncWeapon", e);
    }
    syncingWeapon = false;
  }

  // Public entry points take an item id first: resolve old ids (transition) before the stack lookup.
  const I = (fn) =>
    function (id) {
      const a = Array.prototype.slice.call(arguments);
      a[0] = cid(id);
      return fn.apply(null, a);
    };
  G.inventory = {
    SLOTS,
    CURRENCY,
    add: I(add),
    remove: I(remove),
    count: I(count),
    has: I(has),
    list,
    equip: I(equip),
    unequip: (x, o) => unequip(SLOTS.indexOf(x) >= 0 ? x : cid(x), o),
    isEquipped: I(isEquipped),
    equipped: (slot) => equippedIn(slot),
    equippedSlots: () => Object.assign({}, equipped),
    equippedApparel,
    slotFor,
    use: I(use),
    drop: I(drop),
    canDrop: I(canDrop),
    weight,
    totalValue,
    scrip,
    addScrip,
    condition: I(condition),
    conditions: I(conditions),
    setCondition: I(setCondition),
    wearArmor,
    repair: I(repair),
    canRepair: I(canRepair),
    repairCap,
    repairGain: I(repairGain),
    _serialize: serialize,
    _deserialize: deserialize,
    _reset: reset,
    _syncWeapon: syncWeapon,
    _invalidateWeight: () => {
      weightCache = null;
    },
  };
})();
