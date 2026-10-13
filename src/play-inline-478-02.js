// play-inline-478 02 — conds
// Lines 325-650 of readable/play-inline-478.pretty.js (statement-aligned).
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
