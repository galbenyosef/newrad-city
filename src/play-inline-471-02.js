// play-inline-471 02 — level
// Lines 363-465 of readable/play-inline-471.pretty.js (statement-aligned).
  function pickWeighted(entries, level, rnd) {
    let total = 0;
    const ok = [];
    for (const e of entries) {
      if (e.minLevel && level < e.minLevel) continue;
      if (e.maxLevel && level > e.maxLevel) continue;
      if (e.id && !get(e.id)) continue;
      const w = e.w === undefined ? 1 : e.w;
      if (w <= 0) continue;
      ok.push([e, w]);
      total += w;
    }
    if (!ok.length) return null;
    let r = rnd() * total;
    for (const p of ok) {
      r -= p[1];
      if (r <= 0) return p[0];
    }
    return ok[ok.length - 1][0];
  }

  function roll(tableId, level, rnd, out, depth) {
    if (depth > 6) return out;
    const t = typeof tableId === "object" ? tableId : lootTable(tableId);
    if (!t) return out;
    for (const r of t.rolls) {
      const ch = r.chance === undefined ? 1 : r.chance;
      if (rnd() > ch) continue;
      const picks = randN(r.picks || 1, rnd);
      for (let i = 0; i < picks; i++) {
        const e = pickWeighted(r.entries || [], level, rnd);
        if (e) resolveEntry(e, level, rnd, out, depth);
      }
    }
    return out;
  }

  /**
   * Roll a loot table. Returns [[id, n], ...] (weapons/apparel may carry a
   * third element: condition 0..1). Unknown item ids are skipped.
   * @param tableId string id (or table object)
   * @param level   effective level (defaults to the player's level)
   * @param seed    optional numeric seed for deterministic rolls
   */
  function rollLoot(tableId, level, seed) {
    if (level === undefined || level === null)
      level = (!G.isStub("rpg") && G.rpg.level) || 1;
    const rnd = seed !== undefined ? G.util.rng(seed) : Math.random;
    const out = [];
    try {
      roll(tableId, Math.max(1, level), rnd, out, 0);
    } catch (e) {
      G.reportError("rpg:rollLoot", e);
    }
    return out.filter((e) => e[1] > 0);
  }

  // ------------------------------------------------------------------
  // Formatting helpers (shared by UI modules)
  // ------------------------------------------------------------------
  function displayName(id, n) {
    const d = get(id);
    const nm = d ? d.name : titleCase(id);
    return n && n > 1 ? nm + " (" + n + ")" : nm;
  }

  /**
   * World's Fair medallion item id for a medallion key ('unisphere', 'monorail', 'tower_of_light'…) or item id.
   * The medallion defs (14_items_misc.js) carry `medallion: {key, index}`; this finds the one for a key.
   */
  function medallionId(key) {
    if (!key) return null;
    const k = String(key)
      .toLowerCase()
      .replace(/^medallion_/, "");
    for (const d of REG.values()) {
      const m = d.medallion;
      if (!m) continue;
      if (m.key === k || d.id === "medallion_" + k) return d.id;
    }
    return null;
  }

  G.items = {
    define,
    get,
    all,
    byType,
    byTag,
    exists: (id) => !!get(id),
    canonicalId: (id) => (get(id) ? get(id).id : id),
    defineLootTable,
    lootTable,
    lootTables,
    hasLootTable: (id) => !!lootTable(id),
    rollLoot,
    ammoFor,
    displayName,
    medallionId,
    TYPES,
    // spawnPickup / pickups() / removePickup are attached by 50_pickups.js
    _categories: categories,
  };
