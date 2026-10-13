// play-inline-482 02 — rec
// Lines 355-614 of readable/play-inline-482.pretty.js (statement-aligned).
  function track(a) {
    if (!a || !a.merchant || a.dead || a.removed) return;
    let rec = recOf(a);
    if (!rec) {
      rec = newRec(a);
      const k = rec.id;
      if (k) {
        // saved state from a loaded game waiting for this vendor?
        const p = pending && pending[k];
        if (p) {
          if (p.base) {
            const pb = p.base.scrip;
            rec.base = {
              scrip: typeof pb === "number" ? pb : rec.base.scrip,
              stock: copyStock(p.base.stock),
            };
          }
          absorbQuestAdditions(rec, normStock(a.merchant)); // new quest stock since the save
          rec.day = p.day || day();
          rec.extras = Array.isArray(p.extras) ? p.extras.slice() : [];
          rec.sold =
            p.sold && typeof p.sold === "object"
              ? Object.assign({}, p.sold)
              : {};
          if (p.cat) rec.cat = p.cat;
          writeState(a, p);
          delete pending[k];
        }
        RECS.set(k, rec);
      } else TEMP.set(a, rec);
      rec.actor = a;
      return;
    }
    if (rec.actor !== a) {
      // same named vendor, new actor object (quest respawn): carry the live state over
      const prev = rec.actor && rec.actor.merchant;
      absorbQuestAdditions(rec, normStock(a.merchant));
      if (prev && prev !== a.merchant)
        writeState(a, {
          scrip: purse(prev),
          stock: normStock(prev),
          conds: prev.conds,
        });
      rec.actor = a;
    }
    if (day() - rec.day >= rec.every && !barterWith(a)) restock(rec, a);
  }

  function actors() {
    if (!live("actors") || !G.actors.list) return [];
    try {
      return G.actors.list() || [];
    } catch (e) {
      return [];
    }
  }
  function sweep() {
    for (const a of actors())
      if (a && a.merchant) {
        try {
          track(a);
        } catch (e) {
          G.reportError("rpg:merchants", e);
        }
      }
  }

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------
  G.events.on("barterOpened", (a) => {
    if (a && a.merchant) {
      try {
        track(a);
      } catch (e) {
        G.reportError("rpg:merchants", e);
      }
      a._rpgBarterOpen = true;
    }
  });
  G.events.on("barterClosed", (a) => {
    if (a) a._rpgBarterOpen = false;
  });
  G.events.on("barterDone", (a, info) => {
    const rec = a && recOf(a);
    if (!rec || !info) return;
    for (const e of info.sold || [])
      if (Array.isArray(e))
        rec.sold[e[0]] = (rec.sold[e[0]] || 0) + (Number(e[1]) || 0);
  });
  G.events.on("reset", () => {
    RECS.clear();
    pending = null;
    sweepT = 0;
  });
  G.events.on("loaded", () => {
    sweepT = 0.2;
  });

  // ------------------------------------------------------------------
  // Save / load (called from 90_module's rpg save block)
  // ------------------------------------------------------------------
  function serialize() {
    const out = {};
    for (const [k, rec] of RECS) {
      const m = rec.actor && rec.actor.merchant;
      if (!m) continue;
      out[k] = {
        scrip: purse(m),
        stock: copyStock(normStock(m)),
        conds: m.conds || null,
        day: rec.day,
        extras: rec.extras,
        sold: rec.sold,
        base: rec.base,
        cat: rec.cat,
      };
    }
    // vendors not spawned this session keep their saved state
    if (pending) for (const k in pending) if (!out[k]) out[k] = pending[k];
    return out;
  }
  function deserialize(d) {
    RECS.clear();
    pending = d && typeof d === "object" ? Object.assign({}, d) : null;
    // vendors already alive (not respawned by the load) get their state right away
    for (const a of actors()) {
      if (!a || !a.merchant) continue;
      const k = keyOf(a);
      if (k && pending && pending[k]) {
        try {
          track(a);
        } catch (e) {
          G.reportError("rpg:merchants", e);
        }
      }
    }
  }

  function update(realDt) {
    sweepT -= realDt;
    if (sweepT > 0) return;
    sweepT = 2;
    sweep();
  }

  // ------------------------------------------------------------------
  // Vendor repair service: traders fix your gear for scrip, but only up to
  // their own Mechanics skill. merchant.repairSkill overrides the
  // default by trade (arms / tech dealers are the best mechanics).
  // ------------------------------------------------------------------
  const REPAIR_BY_CAT = {
    weapon: 80,
    tech: 85,
    ammo: 65,
    apparel: 60,
    general: 55,
    junk: 60,
    valuables: 45,
  };
  function vendorRepairSkill(a) {
    const m = a && (a.merchant || a);
    if (m && typeof m.repairSkill === "number")
      return Math.max(0, Math.min(100, m.repairSkill));
    if (!a || !a.merchant) return 50;
    let cat = "general";
    try {
      const rec = recOf(a);
      cat = rec ? rec.cat : classify(normStock(a.merchant), a.merchant);
    } catch (e) {
      /* ignore */
    }
    return REPAIR_BY_CAT[cat] || 35;
  }
  /** {id, name, cond, to, cost, skill} for fixing the player's active unit of `id`, or null if they can't improve it. */
  function repairQuote(id, a) {
    const d = G.items.get(id);
    if (!d || !d.hasCondition || !G.inventory.has(id)) return null;
    const cond = G.inventory.condition(id);
    const skill = vendorRepairSkill(a);
    const to = Math.max(cond, Math.min(1, skill / 100));
    if (to - cond < 0.02) return null;
    const R = G.rpg;
    const t = R.barterFactor ? R.barterFactor() : 0.15;
    const att = R.vendorAttitude ? R.vendorAttitude(a).buy : 1;
    const delta = R.itemValue(d, to) - R.itemValue(d, cond);
    const cost = Math.max(1, Math.round(delta * (1.4 - 0.4 * t) * att));
    return { id, name: d.name, cond, to, cost, skill };
  }
  /** Everything the player carries that this vendor could fix, worst first. */
  function repairables(a) {
    const out = [];
    for (const e of G.inventory.list()) {
      if (!e.def || !e.def.hasCondition) continue;
      const q = repairQuote(e.id, a);
      if (q) {
        q.equipped = !!e.equipped;
        out.push(q);
      }
    }
    return out.sort((p, q) => p.cond - q.cond);
  }
  /** Pay and repair. Returns the quote on success, null if refused / too poor. */
  function repairService(id, a) {
    const q = repairQuote(id, a);
    if (!q) return null;
    if (G.inventory.scrip() < q.cost) {
      G.notify("You can't afford that.", { kind: "barter" });
      return null;
    }
    if (!G.inventory.addScrip(-q.cost)) return null;
    if (a && a.merchant && typeof purse(a.merchant) === "number")
      setPurse(a.merchant, purse(a.merchant) + q.cost);
    G.inventory.setCondition(id, q.to);
    G.rpg.bumpStat("vendorRepairs");
    G.sfx.play("barter_trade", { volume: 0.8 });
    G.events.emit("vendorRepaired", a, id, q);
    G.events.emit("inventoryChanged");
    return q;
  }

  G.rpg.merchants = {
    /** Force a vendor reset now (debug / quests). */
    restockNow(a) {
      if (!a || !a.merchant) return false;
      track(a);
      const rec = recOf(a);
      if (!rec) return false;
      restock(rec, a);
      return true;
    },
    /** {cat, every, day, nextDay, daysLeft, baseScrip, extras} for a vendor, or null. */
    info(a) {
      if (!a || !a.merchant) return null;
      track(a);
      const rec = recOf(a);
      if (!rec) return null;
      const next = rec.day + rec.every;
      return {
        cat: rec.cat,
        every: rec.every,
        day: rec.day,
        nextDay: next,
        daysLeft: Math.max(0, next - day()),
        baseScrip: rec.base.scrip,
        extras: rec.extras.slice(),
      };
    },
    list() {
      return Array.from(RECS.keys());
    },
    classify,
    repairSkill: vendorRepairSkill,
    repairQuote,
    repairables,
    repair: repairService,
    _serialize: serialize,
    _deserialize: deserialize,
    _update: update,
  };
