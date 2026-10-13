// play-inline-478 03 — count
// Lines 651-745 of readable/play-inline-478.pretty.js (statement-aligned).
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
