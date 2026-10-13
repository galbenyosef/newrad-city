// play-inline-535 01 — schem
// Lines 20-240 of readable/play-inline-535.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const C = G.crafting;
  const X = C._;

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------
  C.recipes = (station, tab) => X.recipes(station, tab);
  C.craft = function (key, times) {
    const r = X.findRecipe(key);
    if (!r) return { ok: false, reason: "Unknown recipe." };
    return X.craft(r, times || 1, r.station);
  };
  C.knownSchematics = function () {
    const out = [];
    for (const id in X.S.schem)
      if (X.S.schem[id] > 0)
        out.push({
          id,
          copies: X.S.schem[id],
          makes: X.SCHEM[id] && X.SCHEM[id].makes,
          owner: "crafting",
        });
    try {
      if (X.wpnReal() && G.weapons.knownSchematics)
        for (const k of G.weapons.knownSchematics() || [])
          out.push(Object.assign({ owner: "weapons" }, k));
    } catch (e) {
      /* ignore */
    }
    return out;
  };
  C.repairRows = () => X.repairRows();
  C.repairMethods = (id) => {
    const row = X.repairRows().find((r) => r.id === id);
    return row ? X.repairMethods(row) : [];
  };
  C.repair = function (id, methodKey) {
    const row = X.repairRows().find((r) => r.id === id);
    if (!row) return { ok: false, reason: "You don't have that." };
    const ms = X.repairMethods(row);
    const m = methodKey
      ? ms.find((x) => x.key === methodKey)
      : ms.filter((x) => x.can).sort((a, b) => b.gain - a.gain)[0];
    return X.repair(row, m || ms[0]);
  };
  C.modRows = () => X.modRows();
  C.modWeaponRows = () =>
    X.modWeaponRows().map((r) => ({
      wid: r.wid,
      installed: r.nInst,
      mods: r.mods.map((m) => ({
        id: m.id,
        installed: m.installed,
        have: m.have,
        can: m.can,
      })),
    }));
  C.modPreview = (wid, modId) => X.modPreview(wid, modId || null);
  C.reloadBenches = () =>
    X.reloadBenches.map((b) => ({
      x: b.x,
      y: b.y,
      z: b.z,
      yaw: b.yaw,
      note: b.note,
      anchor: b.anchor,
      supplies: b.container ? b.container.id : null,
    }));
  C.ammoParts = () => JSON.parse(JSON.stringify(X.AMMO_PARTS));
  C.installMod = (wid, modId) => X.installMod({ wid, modId, installed: false });
  C.plants = () =>
    X.plants.map((p) => ({
      key: p.key,
      item: X.PLANT_SPECIES[p.species].item,
      x: p.pos.x,
      y: p.pos.y,
      z: p.pos.z,
      harvested: p.harvested,
    }));
  C.harvest = (key) => X.harvest(X.plants.find((p) => p.key === key));
  C.stations = () => ({
    campfires: X.fires.length,
    nearCampfire: X.nearFire
      ? { x: X.nearFire.x, y: X.nearFire.y, z: X.nearFire.z }
      : null,
  });
  C.stats = () => Object.assign({}, X.S.stats);

  // ------------------------------------------------------------------
  // Workbench hand-off: props emits `workbench`; weapons (loaded earlier) opens
  // its own screen through G.weapons.openWorkbench — route that to ours so
  // exactly one screen comes up. Weapons' schematics/workshop/mods are all
  // shown and built here through its public craft/installMod API.
  // ------------------------------------------------------------------
  function hookWeaponsWorkbench() {
    if (G.isStub("weapons")) return;
    const W = G.weapons;
    if (typeof W.openWorkbench !== "function" || W.openWorkbench.__crafting)
      return;
    X.legacyWorkbench = W.openWorkbench;
    const fn = function (bench) {
      return C.open("workbench", { bench });
    };
    fn.__crafting = true;
    W.openWorkbench = fn;
  }
  G.events.on("workbench", (rec) => {
    C.open("workbench", { bench: rec || null });
  });

  // ------------------------------------------------------------------
  // Events
  // ------------------------------------------------------------------
  G.events.on("itemAdded", (id, n) => {
    if (X.SCHEM[id]) X.onItemAdded(id, n);
  });
  G.events.on("itemUsed", (id) => {
    if (id === "cr_weapon_repair_kit") X.onItemUsed(id);
  });
  let rescan = false;
  G.events.on("reset", () => {
    X.S = X.freshState();
    X.clearPending();
    X.syncPlants();
    if (C.isOpen()) X.hide();
  });
  G.events.on("newGame", () => {
    rescan = true;
  });
  G.events.on("loaded", () => {
    X.syncPlants();
    rescan = true;
  });
  G.events.on("initDone", () => {
    hookWeaponsWorkbench();
    X.validate();
    X.spawnStations();
    try {
      X.spawnReloadBenches();
    } catch (e) {
      G.reportError("crafting:reloadBenches", e);
    }
    X.placeSchematics();
    X.scanStations();
  });

  G.save.register("crafting", {
    // brass: spent cases collected in the last second before the save (not yet in the inventory)
    save: () => ({
      v: 1,
      schem: Object.assign({}, X.S.schem),
      harvested: Object.assign({}, X.S.harvested),
      stats: Object.assign({}, X.S.stats),
      tips: Object.assign({}, X.S.tips || {}),
      brass: X.pendingBrass ? X.pendingBrass() : {},
    }),
    load: (d) => {
      const f = X.freshState();
      if (d && typeof d === "object") {
        for (const k in d.schem || {}) {
          const id = k;
          if (X.SCHEM[id])
            f.schem[id] = Math.max(
              f.schem[id] | 0,
              Math.max(0, Math.min(3, d.schem[k] | 0)),
            );
        }
        for (const k in d.harvested || {})
          if (isFinite(d.harvested[k])) f.harvested[k] = +d.harvested[k];
        Object.assign(f.stats, d.stats || {});
        for (const k in d.tips || {}) f.tips[k] = 1;
      }
      X.S = f;
      if (X.restoreBrass) X.restoreBrass(d && d.brass);
      X.syncPlants();
    },
  });

  // ------------------------------------------------------------------
  // Module
  // ------------------------------------------------------------------
  let regrowT = 0;
  G.registerModule({
    name: "crafting",
    order: 56,
    init() {
      X.registerItems();
      try {
        X.buildPlants();
      } catch (e) {
        G.reportError("crafting:plants", e);
      }
      X.setupCampfireInteract();
      hookWeaponsWorkbench();
    },
    update(dt, realDt) {
      X.flushLearned();
      X.flushBrass(realDt);
      if (X.benchTick) X.benchTick(realDt);
      X.tickSounds();
      X.uiUpdate(realDt);
      if (G.state === "play") {
        if (rescan) {
          rescan = false;
          X.scanStations();
        }
        X.updateNearFire(realDt);
        regrowT -= realDt;
        if (regrowT <= 0) {
          regrowT = 4;
          for (const k in X.S.harvested) {
            X.syncPlants();
            break;
          }
        }
      }
      if (X.testTick) X.testTick(realDt);
    },
  });
