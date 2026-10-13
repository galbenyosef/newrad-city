// play-inline-505 03 — events
// Lines 705-871 of readable/play-inline-505.pretty.js (statement-aligned).
  G.events.on("newGame", (opts) => {
    applySkinTone(readPlayerTone(opts));
    if (!S.cur) W.equip(null, { fromInventory: true });
    // debug: ?wpn=<id> equips a weapon (and gives ammo when the inventory exists)
    const dbg = G.QS && G.QS.get("wpn");
    if (dbg && P.defs.get(dbg)) {
      const d = P.defs.get(dbg);
      if (P.invReal()) {
        try {
          G.inventory.add(dbg, d.weapon.reloadType === "throw" ? 5 : 1, {
            silent: true,
          });
          if (d.weapon.ammo && d.weapon.ammo !== dbg)
            G.inventory.add(d.weapon.ammo, 200, { silent: true });
        } catch (e) {
          /* ignore */
        }
      }
      W.equip(dbg);
    }
  });
  G.events.on("loaded", () => {
    const id = S._loadCur;
    S._loadCur = undefined;
    const ok =
      id && id !== "unarmed" && (!P.invReal() || G.inventory.count(id) > 0);
    S.cur = null;
    W.equip(ok ? id : null, { fromInventory: true });
    S.holstered = !!S._loadHolster;
  });
  G.events.on("itemAdded", (id) => {
    const def = P.defs.get(id);
    if (!def || def.type !== "weapon") return;
    autoFavorite(id);
    // first real weapon: draw it (players always want the gun they just got). Deferred to the
    // next frame in play: gifts usually hand over the gun and THEN its rounds in the same tick, and
    // drawing in between would pull an empty gun and play a reload as the very first animation.
    if (def.weapon.reloadType !== "throw" && (!S.cur || S.cur.id === "unarmed"))
      S._pendingDraw = id;
  });
  // ammo arriving for a gun that was drawn empty (see S._freshEmpty): load it silently
  G.events.on("itemAdded", (id) => {
    const c = S.cur;
    if (!c || S._freshEmpty !== c.id || c.mag > 0) return;
    const w = c.def.weapon;
    if (w.ammo !== id || (P.action && P.action.name === "reload")) return;
    const got = P.takeAmmo(w.ammo, Math.min(w.magSize, P.reserve(c.def)));
    if (got > 0) {
      c.mag = got;
      S.mags[c.id] = got;
      S.autoReloadT = -1;
      S._freshEmpty = null;
      G.events.emit("ammoChanged", W.current());
    }
  });
  G.events.on("reloaded", () => {
    S._freshEmpty = null;
  });
  G.events.on("weaponFired", () => {
    S._freshEmpty = null;
  });
  // (a pending draw is performed by the module update on the first frame back in 'play')
  G.events.on("reset", () => {
    S._pendingDraw = null;
  });
  G.events.on("inventoryChanged", () => {
    if (refunding || !P.invReal()) return;
    const c = S.cur;
    if (
      c &&
      c.id !== "unarmed" &&
      !(P.action && P.action.name === "throw") &&
      !(G.inventory.count(c.id) > 0)
    ) {
      // the equipped weapon left the inventory: unload it first, then fall back to fists
      const n = c.mag | 0,
        def = c.def;
      c.mag = 0;
      S.mags[c.id] = 0;
      W.equip(null, { noUnequip: true });
      delete S.mags[def.id];
      if (n > 0 && def.weapon.ammo && def.weapon.reloadType !== "throw") {
        refunding = true;
        try {
          G.inventory.add(def.weapon.ammo, n, { silent: true });
        } catch (e) {
          G.reportError("weapons:refund", e);
        } finally {
          refunding = false;
        }
      }
    }
    refundMags();
  });
  G.events.on("equipChanged", (slot, id) => {
    if (inEquip) return;
    const isWeaponSlot =
      slot === "weapon" ||
      (id && P.defs.get(id) && P.defs.get(id).type === "weapon");
    if (!isWeaponSlot) return;
    if (!id && P.action && P.action.name === "throw") return; // last grenade thrown: the throw's onEnd handles it
    if (id && P.defs.get(id)) {
      if (!S.cur || S.cur.id !== id) W.equip(id, { fromInventory: true });
    } else if (!id && S.cur && S.cur.id !== "unarmed")
      W.equip(null, { fromInventory: true });
  });
  G.events.on("land", (vy) => {
    V().landImpulse && V().landImpulse(vy);
  });
  G.events.on("sneak", () => {
    V().springs && (V().springs.land.v -= 0.12);
  });
  G.events.on("playerDied", () => {
    P.cancelAction();
    P.stopLoops();
  });
  G.events.on("state", (s) => {
    if (s !== "play") {
      P.stopLoops();
      const v = V();
      v.ads = false;
      v.blocking = false;
      v.triggerHeld = false;
      if (S.lastFov) {
        G.player.setFov(G.player.fovBase);
        S.lastFov = null;
      }
      if (P.action && P.action.name === "melee") P.cancelAction();
    }
  });

  // ------------------------------------------------------------------
  // Module
  // ------------------------------------------------------------------
  G.registerModule({
    name: "weapons",
    order: 45,
    init() {
      P.defineAll();
      V().build();
      // start with fists so the rig exists even before newGame
      if (!S.cur) W.equip(null, { fromInventory: true });
    },
    update(dt, realDt) {
      if (S._pendingDraw && G.state === "play") {
        const id = S._pendingDraw;
        S._pendingDraw = null;
        try {
          if (
            (!S.cur || S.cur.id === "unarmed") &&
            (!P.invReal() || G.inventory.count(id) > 0)
          )
            W.equip(id);
        } catch (e) {
          G.reportError("weapons:pendingDraw", e);
        }
      }
      P.logic(dt, realDt);
      P.updateProjectiles(dt);
      if (P.craftUpdate) P.craftUpdate(dt, realDt);
      V().update(dt, realDt);
    },
  });
  G.events.on("initDone", () => {
    P.defineAll();
    P.healSounds();
  });
