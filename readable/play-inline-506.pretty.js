/* src/weapons/95_migrate.js */
/* =====================================================================
 * NEW RAD CITY — WEAPONS: save migration for the retired roster
 *
 * Old saves can still name weapons, ammo, schematics and mods that were
 * replaced by the 1960s roster (gyrojets, recoilless rifle, rivet gun,
 * siren horn …). On every load (G.save.migrations, run by core before any
 * module reads its data) this walks the whole save and:
 *   - renames every exact id string (inventory, containers, pickups,
 *     merchant stock, equipped slot, favourites, quest state …),
 *   - renames object keys (weapon condition, schematic copies, mods,
 *     pending brass …), merging collisions,
 *   - scales ammo counts in [id, count, …] tuples where one old round is
 *     worth a different number of new ones, and turns ammo with no
 *     replacement into a little scrip,
 *   - drops the loaded-magazine count of a replaced weapon (the new gun
 *     loads itself from the reserve on its first draw).
 * Idempotent: a migrated save contains none of the old ids.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const P = G.weapons._;

  // old id → new id (weapons, thrown, schematics, mods)
  const RENAME = {
    piston_fist: "spud_wrench",
    pile_hammer: "fire_axe",
    torchblade: "third_rail_shoe",
    scrapshot_launcher: "siren_horn",
    spikedriver: "rivet_gun",
    stinger_dart_gun: "rivet_gun",
    starfall_pistol: "gemini",
    bottle_bomb: "molotov",
    mortar_launcher: "recoilless_rifle",
    ray_gatling: "belt_fed_mg",
    ray_pistol: "gyrojet_pistol",
    ray_carbine: "gyrojet_carbine",
    arc_pistol: "gyrojet_pistol",
    arc_rifle: "gyrojet_carbine",
    arc_grenade: "riot_gas_grenade",
    manhattan_project: "ticker_tape",
    pipe_rifle: "bolt_rifle_32",
    continental_rifle: "mat49_smg",
    schematic_torchblade: "schematic_third_rail_shoe",
    schematic_scrapshot: "schematic_siren_horn",
    schematic_dart_gun: "schematic_rivet_gun",
    schematic_spikedriver: "schematic_rivet_gun",
    schematic_bottle_bomb: "schematic_molotov",
    mod_ray_focus: "mod_gyro_venturi",
    cr_ripjaw_gauntlet: "brass_knuckles",
  };
  // old ammo / ammo by-products → [new id, units per old unit]; new id 'scrip' = sold off
  const AMMO = {
    ammo_light_cell: ["ammo_dry_cell", 0.25],
    ammo_power_pack: ["ammo_gyrojet", 0.6],
    ammo_arc_drum: ["ammo_308", 0.5],
    ammo_starfall_cell: ["ammo_gyrojet", 1],
    ammo_mortar_shell: ["ammo_recoilless", 1],
    ammo_rail_spike: ["ammo_rivet", 1],
    ammo_dart: ["ammo_rivet", 1],
    cr_drained_light_cell: ["cr_drained_dry_cell", 0.25],
    cr_drained_power_pack: ["scrip", 0.5],
    cr_drained_arc_drum: ["scrip", 0.5],
    schematic_cr_ripjaw_gauntlet: ["scrip", 50],
  };
  const MAP = Object.assign({}, RENAME);
  for (const k in AMMO) MAP[k] = AMMO[k][0];
  P.MIGRATE = { RENAME, AMMO, MAP };

  const isOld = (v) =>
    typeof v === "string" && Object.prototype.hasOwnProperty.call(MAP, v);
  let changes = 0;

  function walk(v, keyHint) {
    if (Array.isArray(v)) {
      // [id, count, …] tuple: rename + rescale the count
      if (v.length >= 2 && isOld(v[0]) && typeof v[1] === "number") {
        const old = v[0];
        if (AMMO[old]) {
          const n = v[1];
          v[0] = AMMO[old][0];
          v[1] = n > 0 ? Math.max(1, Math.round(n * AMMO[old][1])) : n;
          v.length = Math.min(v.length, 2);
        } else v[0] = RENAME[old];
        changes++;
        for (let i = 2; i < v.length; i++) v[i] = walk(v[i]);
        return v;
      }
      for (let i = 0; i < v.length; i++) v[i] = walk(v[i]);
      // favourites / mod lists may now hold duplicates
      if (keyHint === "favs" || keyHint === "mods") {
        const seen = new Set();
        for (let i = 0; i < v.length; i++) {
          const x = v[i];
          if (typeof x === "string") {
            if (seen.has(x)) v[i] = keyHint === "favs" ? null : undefined;
            else seen.add(x);
          }
        }
        if (keyHint === "mods") {
          const keep = v.filter((x) => x !== undefined);
          v.length = 0;
          v.push(...keep);
        }
      }
      return v;
    }
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        const val = walk(v[k], k);
        if (isOld(k)) {
          const nk = MAP[k];
          delete v[k];
          changes++;
          if (nk === "scrip") continue; // by-products with no replacement: dropped
          let nv = val;
          if (AMMO[k] && typeof nv === "number" && nv > 0)
            nv = Math.max(1, Math.round(nv * AMMO[k][1]));
          // condition / schematic-copy maps keep the best value; count maps add up
          const keepMax =
            keyHint === "cond" ||
            keyHint === "schem" ||
            k.indexOf("schematic_") === 0;
          if (v[nk] === undefined) v[nk] = nv;
          else if (typeof v[nk] === "number" && typeof nv === "number")
            v[nk] = keepMax ? Math.max(v[nk], nv) : v[nk] + nv;
          else if (Array.isArray(v[nk]) && Array.isArray(nv)) {
            for (const x of nv) if (v[nk].indexOf(x) < 0) v[nk].push(x);
          }
        } else v[k] = val;
      }
      return v;
    }
    if (isOld(v)) {
      changes++;
      return MAP[v] === "scrip" ? null : MAP[v];
    }
    return v;
  }

  /** Migrate a parsed save object in place. Returns it. */
  P.migrateSave = function (data) {
    if (!data || typeof data !== "object" || !data.modules) return data;
    changes = 0;
    // a replaced weapon's loaded magazine doesn't fit the new gun: let it load fresh
    const wm = data.modules.weapons;
    if (wm && wm.mags && typeof wm.mags === "object")
      for (const k of Object.keys(wm.mags))
        if (isOld(k)) {
          delete wm.mags[k];
          changes++;
        }
    walk(data.modules);
    // mods that don't fit the replacement weapon go back into the pack as items
    const wc = data.modules.weapons_craft,
      inv = data.modules.rpg && data.modules.rpg.inv;
    if (wc && wc.mods && typeof wc.mods === "object" && P.MODS) {
      for (const wid of Object.keys(wc.mods)) {
        const list = Array.isArray(wc.mods[wid]) ? wc.mods[wid] : [];
        const keep = [];
        for (const m of list) {
          if (!P.MODS[m] || P.MODS[m].fits.indexOf(wid) >= 0) {
            if (keep.indexOf(m) < 0) keep.push(m);
            continue;
          }
          if (inv && Array.isArray(inv.items)) inv.items.push([m, 1]);
          changes++;
        }
        wc.mods[wid] = keep;
      }
    }
    // scrip tuples produced above merge with an existing scrip stack when the inventory loads (deserialize sums duplicates)
    if (changes) {
      try {
        console.info(
          "[weapons] migrated " +
            changes +
            " retired weapon/ammo references in the save",
        );
      } catch (e) {
        /* ignore */
      }
    }
    return data;
  };
  if (G.save && Array.isArray(G.save.migrations))
    G.save.migrations.push(P.migrateSave);
})();
