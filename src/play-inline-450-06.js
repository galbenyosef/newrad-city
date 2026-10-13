// play-inline-450 06 — rec
// Lines 1628-1797 of readable/play-inline-450.pretty.js (statement-aligned).
  X.processPendingShot = function () {
    if (!pendingShot) return;
    // the combat module resolves every shot itself and calls damageAt for world hits → never double-dip
    if (!G.isStub("combat") && typeof G.combat.fire === "function") {
      pendingShot = null;
      return;
    }
    if (++pendingShot.frames < 2) return;
    const s = pendingShot;
    pendingShot = null;
    if (lastExternalHit >= s.t - 0.001) return; // somebody already reported it
    _po.copy(G.player.eye);
    _pd.copy(G.player.forward).normalize();
    // do NOT ignore actors: an enemy standing in front of a car must stop the bullet
    const hit = G.world.raycast(_po, _pd, 300, {});
    if (!hit) return;
    const c = hit.collider;
    if (!c || c.actor || c.tag === "actor" || (c.data && c.data.actor)) return;
    if (c.tag === "prop_car" || c.tag === "prop" || c.tag === "prop_explosive")
      P.damageAt(hit.point, s.dmg, { _internal: true });
  };

  // ------------------------------------------------------------------
  // Lifecycle hooks (called from 70_module.js)
  // ------------------------------------------------------------------
  X.onReset = function () {
    firstResetDone = true;
    // remove session-scoped spawns, keep persistent (world) ones
    for (const rec of RECS.slice()) {
      if (!rec.persistent) {
        removeRec(rec, true);
        continue;
      }
      // persistent containers stay registered: rpg resets them to pristine on 'reset'
      if (rec.taken) restoreRec(rec);
      if (rec.exploded) {
        rec.exploded = false;
        (rec.opts.parent || X.spawnRoot || G.scene).add(rec.obj);
        const op = rec.obj.position;
        rec.colliders = X.addProtoColliders(
          rec.pr,
          op.x,
          op.y,
          op.z,
          rec.obj.rotation.y,
          rec.obj.scale.x,
          "prop",
          null,
        );
        rec.fx = X.addProtoFx(
          rec.pr,
          op.x,
          op.y,
          op.z,
          rec.obj.rotation.y,
          rec.obj.scale.x,
          true,
        );
        if (rec.cdef && !rec.container) makeContainer(rec);
        const T = TYPES[rec.type] || {};
        if (T.interact) setupInteract(rec, T.interact, T);
      }
      if (rec.turret) {
        const t = rec.turret;
        t.alive = true;
        t.hp = rec.opts.hp || 70;
        t.enabled = t.baseEnabled;
        t.hostileToPlayer = t.baseHostile;
        t.muzzleYaw = NaN;
        t.burst = 0;
        t.head.rotation.set(t.enabled ? 0 : 0.38, 0, 0);
        if (t.smoke) {
          t.smoke.stop();
          t.smoke = null;
        }
      }
    }
    for (const e of X.EXPLOSIVES) {
      if (e.fire && e.fire.stop) e.fire.stop();
      if (e.dead && e.restore) e.restore(e);
      if (e.rec && e.rec.removed) continue;
      e.dead = false;
      e.hp = e.maxHp;
      e.fuse = -1;
    }
    X.EXPLOSIVES = X.EXPLOSIVES.filter((e) => !(e.rec && e.rec.removed));
    X.EXPLODED_BARRELS.clear();
    X.TAKEN.clear();
    X.TIMERS.length = 0;
    X.resetCars();
  };
  /** (Re)create containers for every record + scattered world containers. */
  X.ensureContainers = function () {
    for (const rec of RECS)
      if (rec.cdef && !rec.container && !rec.removed) makeContainer(rec);
    if (X.ensureScatterContainers) X.ensureScatterContainers();
  };
  X.applySave = function (d) {
    if (!d) return;
    for (const id of d.taken || []) {
      const rec = RECS.find((r) => r.id === id);
      if (rec && !rec.taken) takeRec(rec);
    }
    for (const id of d.cars || []) {
      const car = X.CARS.byId.get(id);
      if (car && car.state !== "burnt") {
        car.state = "burnt";
        car.exploded = true;
        X.writeCar(car);
      }
    }
    for (const id of d.barrels || []) {
      const e = X.EXPLOSIVES.find((x) => (x.id || (x.rec && x.rec.id)) === id);
      if (e && !e.dead) {
        e.dead = true;
        if (e.rec) wreckRec(e.rec);
        if (e.onDestroy) e.onDestroy(e);
        X.EXPLODED_BARRELS.add(id);
      }
    }
  };
  X.collectSave = function () {
    return {
      taken: Array.from(X.TAKEN),
      cars: X.CARS.list
        .filter((c) => c.exploded && !c.removed)
        .map((c) => c.id),
      barrels: Array.from(X.EXPLODED_BARRELS).filter(Boolean),
    };
  };
  X.updateSpawn = function (dt, realDt) {
    // timers (explosion fx, chain reactions)
    if (X.TIMERS.length) {
      for (let i = X.TIMERS.length - 1; i >= 0; i--) {
        const t = X.TIMERS[i];
        t.t -= realDt;
        if (t.t <= 0) {
          X.TIMERS.splice(i, 1);
          try {
            t.fn();
          } catch (e) {
            G.reportError("props:timer", e);
          }
        }
      }
    }
    // explosive fuses
    for (const e of X.EXPLOSIVES)
      if (!e.dead && e.fuse >= 0) {
        e.fuse -= dt;
        if (e.fuse < 0) explodeExplosive(e);
      }
    updateTurrets(dt);
    X.processPendingShot();
  };

  // info helpers
  P.types = function () {
    return Object.keys(TYPES)
      .concat(X.protoNames().filter((n) => !TYPES[n]))
      .sort();
  };
  P.list = function () {
    return RECS.map((r) => ({
      type: r.type,
      id: r.id,
      pos: r.obj ? r.obj.position.clone() : null,
      container: !!r.container,
    }));
  };
