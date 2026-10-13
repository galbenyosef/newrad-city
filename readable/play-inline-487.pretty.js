/* src/rpg/96_migrate_brands.js */
/* =====================================================================
 * NEW RAD CITY — RPG MODULE — save migration for the city's brand slate
 *
 * Old saves can still name packaged foods, the cleanser, the comic book
 * and the two prize tokens from before the city's brands were replaced.
 * On every load (G.save.migrations, run by core before any module reads
 * its data) this walks the whole save and:
 *   - renames every exact item-id string (inventory, equipped, containers,
 *     corpses, merchant stock, quick-slots / favourites, quest state …)
 *     and every object key holding one (count maps add up),
 *   - maps the retired deviled-egg tray to Mama Marinara's Instant Meatballs,
 *   - cashes the retired prize tokens in at TOKEN_SCRIP scrip apiece:
 *     [id, n, …] tuples become ['scrip', n·TOKEN_SCRIP, …] (the inventory
 *     sums duplicate stacks on load); a merchant's tokens go into its purse;
 *     loose strings (a favourite slot) are cleared,
 *   - re-keys taken static pickups ('p_<id>_x_z_y') so a shelf the player
 *     already emptied stays empty.
 * Idempotent: a migrated save contains none of the old ids.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;

  /** Scrip paid out for each retired prize token. */
  const TOKEN_SCRIP = 10;
  // old id → new id
  const RENAME = {
    meat_ration: "golden_plain_jerky",
    sweet_crunch: "freedom_flakes",
    lady_lee_cakes: "chocolate_zeppelin",
    macaroni_supreme: "mama_marinara_meatballs",
    spud_quick: "frank_in_a_bun",
    orchard_pride_apples: "astronaut_ice_cream",
    scrubbo_cleanser: "homeguard_cleanser",
    deviled_delight_eggs: "mama_marinara_meatballs",
    book_barbarian_bart: "book_super_sergeant",
  };
  // retired outright → scrip
  const TOKENS = { prairie_prize_token: 1, fizzo_prize_token: 1 };
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const isOld = (v) =>
    typeof v === "string" && (has(RENAME, v) || has(TOKENS, v));
  const STATIC_KEY = /^p_([a-z0-9_]+?)_(-?\d+_-?\d+_-?\d+)$/;
  let changes = 0;

  function walk(v, keyHint) {
    if (Array.isArray(v)) {
      // [id, count, …] tuple (inventory, containers, merchant stock, dropped pickups): rename / cash in
      if (v.length >= 2 && isOld(v[0]) && typeof v[1] === "number") {
        if (has(TOKENS, v[0])) {
          v[0] = "scrip";
          v[1] = v[1] > 0 ? Math.round(v[1] * TOKEN_SCRIP) : v[1];
        } else v[0] = RENAME[v[0]];
        changes++;
        for (let i = 2; i < v.length; i++) v[i] = walk(v[i]);
        return v;
      }
      for (let i = 0; i < v.length; i++) {
        const x = v[i];
        if (typeof x === "string" && keyHint === "taken") {
          const m = STATIC_KEY.exec(x);
          if (m && has(RENAME, m[1])) {
            v[i] = "p_" + RENAME[m[1]] + "_" + m[2];
            changes++;
            continue;
          }
        }
        v[i] = walk(x);
      }
      // a quick-slot list must not hold the same id twice after a merge
      if (keyHint === "favs") {
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
      for (const k of Object.keys(v)) {
        const val = walk(v[k], k);
        if (isOld(k)) {
          delete v[k];
          changes++;
          if (has(TOKENS, k)) continue; // a count map of tokens: dropped (the stacks were cashed in above)
          const nk = RENAME[k];
          if (v[nk] === undefined) v[nk] = val;
          else if (typeof v[nk] === "number" && typeof val === "number")
            v[nk] += val;
          else if (Array.isArray(v[nk]) && Array.isArray(val)) {
            for (const x of val) if (v[nk].indexOf(x) < 0) v[nk].push(x);
          }
        } else v[k] = val;
      }
      return v;
    }
    if (isOld(v)) {
      changes++;
      return has(TOKENS, v) ? null : RENAME[v];
    }
    return v;
  }

  /** Merchants: tokens in stock go into the purse instead of onto the counter. */
  function cashMerchants(merchants) {
    if (!merchants || typeof merchants !== "object") return;
    for (const k of Object.keys(merchants)) {
      const rec = merchants[k];
      if (!rec || !Array.isArray(rec.stock)) continue;
      let gain = 0;
      rec.stock = rec.stock.filter((e) => {
        if (Array.isArray(e) && has(TOKENS, e[0])) {
          gain += Math.max(0, Number(e[1]) || 0) * TOKEN_SCRIP;
          changes++;
          return false;
        }
        return true;
      });
      if (gain) rec.scrip = (Number(rec.scrip) || 0) + gain;
    }
  }

  /** Migrate a parsed save object in place. Returns it. */
  function migrateSave(data) {
    if (!data || typeof data !== "object" || !data.modules) return data;
    changes = 0;
    try {
      cashMerchants(data.modules.rpg && data.modules.rpg.merchants);
    } catch (e) {
      G.reportError("rpg:migrateBrands", e);
    }
    walk(data.modules);
    if (changes) {
      try {
        console.info(
          "[rpg] migrated " +
            changes +
            " retired brand item references in the save",
        );
      } catch (e) {
        /* ignore */
      }
    }
    return data;
  }
  if (G.items)
    G.items._migrateBrands = { RENAME, TOKENS, TOKEN_SCRIP, migrateSave };
  if (G.save && Array.isArray(G.save.migrations))
    G.save.migrations.push(migrateSave);
})();
