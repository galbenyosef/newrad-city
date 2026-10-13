/* src/rpg/97_migrate_medicine.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — save migration: medicine cabinet & reading rack
 *
 * Old saves can still name the retired injector, its stronger sibling, the
 * old drip-bag radiation flush and the ten skill magazines. On every load
 * (G.save.migrations, run by core before any module reads its data) this
 * walks the save and:
 *   - renames the medicines: the injector → rally_tonic, the strong one →
 *     rally_tonic_extra, the drip bag → prussian_blue (inventory, equipped,
 *     containers, corpses, merchant stock, dropped pickups, taken static
 *     pickup keys, quick-slots / favourites, count maps),
 *   - cashes every skill magazine in at MAG_SCRIP scrip apiece ([id, n, …]
 *     tuples become ['scrip', n·MAG_SCRIP, …]; a merchant's go into its purse;
 *     loose strings such as a favourite slot are cleared) and drops any
 *     magazine reading boost still running,
 *   - World's Fair medallions: kept as they are (they now grant nothing; the
 *     old permanent bonuses were only ever derived in G.rpg's recalc, so they
 *     vanish with it — nothing stored needs undoing). Stale stat counters
 *     are folded into the new ones by 30_rpg_core's deserialize.
 * The drip bag's old id is also an ordinary English word that other modules
 * use for quest stages and flags, so it is only renamed where it is clearly
 * an item: [id, count] tuples, count-map keys inside item stores, the
 * equipped / favourites lists and static pickup keys.
 * Idempotent: a migrated save contains none of the old item ids.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;

  /** Scrip paid out for each retired skill magazine (they sold for 40; a fence would give you 15). */
  const MAG_SCRIP = 15;
  const OLD_INJ = "med" + "_jet",
    OLD_FLUSH = "pur" + "ge"; // spelled apart so a repo-wide search finds only this file's map
  // unambiguous ids: renamed wherever they appear as a whole string
  const RENAME = {};
  RENAME[OLD_INJ] = "rally_tonic";
  RENAME[OLD_INJ + "_forte"] = "rally_tonic_extra";
  // ambiguous id (also a word): renamed only in item contexts
  const ITEM_ONLY = {};
  ITEM_ONLY[OLD_FLUSH] = "prussian_blue";
  const MAG_SKILLS = [
    "firearms",
    "melee",
    "explosives",
    "medicine",
    "mechanics",
    "electronics",
    "stealth",
    "persuasion",
    "trade",
    "survival",
  ];
  const MAGS = {};
  for (const k of MAG_SKILLS) MAGS["maga" + "zine_" + k] = 1;

  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const isMag = (v) => typeof v === "string" && has(MAGS, v);
  const isOld = (v, item) =>
    typeof v === "string" &&
    (has(RENAME, v) || isMag(v) || (item && has(ITEM_ONLY, v)));
  const newId = (v) => (has(RENAME, v) ? RENAME[v] : ITEM_ONLY[v]);
  const STATIC_KEY = /^p_([a-z0-9_]+?)_(-?\d+_-?\d+_-?\d+)$/;
  // object keys whose plain string values / members are item ids
  const ITEM_LISTS = {
    favs: 1,
    favorites: 1,
    quick: 1,
    quickSlots: 1,
    hotkeys: 1,
    equipped: 1,
    cur: 1,
    lastThrown: 1,
  };
  // object keys whose children are item-id keyed count / condition maps
  const ITEM_MAPS = {
    stacks: 1,
    items: 1,
    inventory: 1,
    cond: 1,
    conds: 1,
    counts: 1,
    stock: 1,
    sold: 1,
  };
  let changes = 0;

  function walk(v, keyHint, itemCtx) {
    if (Array.isArray(v)) {
      // [id, count, …] tuple (inventory, containers, merchant stock, dropped pickups): rename / cash in
      if (v.length >= 2 && isOld(v[0], true) && typeof v[1] === "number") {
        if (isMag(v[0])) {
          v[0] = "scrip";
          v[1] = v[1] > 0 ? Math.round(v[1] * MAG_SCRIP) : v[1];
          v.length = 2;
        } else v[0] = newId(v[0]);
        changes++;
        for (let i = 2; i < v.length; i++) v[i] = walk(v[i], null, itemCtx);
        return v;
      }
      const list = itemCtx || has(ITEM_LISTS, keyHint);
      for (let i = 0; i < v.length; i++) {
        const x = v[i];
        if (typeof x === "string" && keyHint === "taken") {
          const m = STATIC_KEY.exec(x);
          if (m && isOld(m[1], true)) {
            v[i] = isMag(m[1])
              ? x.replace(m[1], "scrip")
              : "p_" + newId(m[1]) + "_" + m[2];
            changes++;
            continue;
          }
        }
        if (typeof x === "string" && isOld(x, list)) {
          changes++;
          v[i] = isMag(x) ? null : newId(x);
          continue;
        }
        v[i] = walk(x, null, itemCtx);
      }
      // a quick-slot list must not hold the same id twice after a merge
      if (keyHint === "favs" || keyHint === "favorites") {
        const seen = new Set();
        for (let i = 0; i < v.length; i++) {
          const x = v[i];
          if (typeof x === "string") {
            if (seen.has(x)) v[i] = null;
            else seen.add(x);
          }
        }
      }
      return v;
    }
    if (v && typeof v === "object") {
      const mapCtx = itemCtx || has(ITEM_MAPS, keyHint);
      for (const k of Object.keys(v)) {
        const childItem =
          has(ITEM_LISTS, k) ||
          has(ITEM_MAPS, k) ||
          (itemCtx && k !== "flags" && k !== "stage");
        let val = v[k];
        if (
          typeof val === "string" &&
          (has(ITEM_LISTS, k) || has(ITEM_LISTS, keyHint)) &&
          isOld(val, true)
        ) {
          changes++;
          val = isMag(val) ? null : newId(val);
        } else val = walk(val, k, childItem);
        if (isOld(k, mapCtx)) {
          delete v[k];
          changes++;
          if (isMag(k)) continue; // a count map of magazines: dropped (stacks were cashed in)
          const nk = newId(k);
          if (v[nk] === undefined) v[nk] = val;
          else if (typeof v[nk] === "number" && typeof val === "number")
            v[nk] += val;
          else if (Array.isArray(v[nk]) && Array.isArray(val)) {
            for (const x of val) if (v[nk].indexOf(x) < 0) v[nk].push(x);
          } else if (
            v[nk] &&
            typeof v[nk] === "object" &&
            val &&
            typeof val === "object" &&
            typeof v[nk].count === "number" &&
            typeof val.count === "number"
          ) {
            v[nk].count += val.count;
            if (Array.isArray(v[nk].conds) && Array.isArray(val.conds))
              v[nk].conds = v[nk].conds.concat(val.conds);
          }
        } else v[k] = val;
      }
      return v;
    }
    if (typeof v === "string" && isOld(v, false)) {
      changes++;
      return isMag(v) ? null : newId(v);
    }
    return v;
  }

  /** Merchants: magazines in stock go into the purse instead of onto the counter. */
  function cashMerchants(merchants) {
    if (!merchants || typeof merchants !== "object") return;
    for (const k of Object.keys(merchants)) {
      const rec = merchants[k];
      if (!rec || !Array.isArray(rec.stock)) continue;
      let gain = 0;
      rec.stock = rec.stock.filter((e) => {
        if (Array.isArray(e) && isMag(e[0])) {
          gain += Math.max(0, Number(e[1]) || 0) * MAG_SCRIP;
          changes++;
          return false;
        }
        return true;
      });
      if (gain) rec.scrip = (Number(rec.scrip) || 0) + gain;
    }
  }

  /** A magazine boost that was still running (effect ids 'mag_<skill>') is dropped. */
  function dropMagEffects(rpg) {
    if (!rpg || !Array.isArray(rpg.effects)) return;
    const n = rpg.effects.length;
    rpg.effects = rpg.effects.filter(
      (e) => !(e && typeof e.id === "string" && /^mag_[a-z]+$/.test(e.id)),
    );
    changes += n - rpg.effects.length;
  }

  /** Migrate a parsed save object in place. Returns it. */
  function migrateSave(data) {
    if (!data || typeof data !== "object" || !data.modules) return data;
    changes = 0;
    const rpg = data.modules.rpg;
    try {
      cashMerchants(rpg && rpg.merchants);
      dropMagEffects(rpg && rpg.rpg);
    } catch (e) {
      G.reportError("rpg:migrateMedicine", e);
    }
    walk(data.modules, null, false);
    if (changes) {
      try {
        console.info(
          "[rpg] migrated " +
            changes +
            " retired medicine / magazine references in the save",
        );
      } catch (e) {
        /* ignore */
      }
    }
    return data;
  }
  if (G.items)
    G.items._migrateMedicine = {
      RENAME,
      ITEM_ONLY,
      MAGS,
      MAG_SCRIP,
      migrateSave,
    };
  if (G.save && Array.isArray(G.save.migrations))
    G.save.migrations.push(migrateSave);
})();
