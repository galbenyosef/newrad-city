// play-inline-450 04 — rec
// Lines 1039-1283 of readable/play-inline-450.pretty.js (statement-aligned).
  function collectMedallion(o) {
    // rpg owns the bonus: adding the medallion item to the inventory records it, applies it and notifies.
    const mid = medallionItem(o);
    try {
      if (mid && !G.isStub("inventory")) {
        X.sfx("pickup", {});
        G.inventory.add(mid, 1);
        G.emit("medallionCollected", mid);
        return;
      }
    } catch (e) {
      G.reportError("props:medallion", e);
    }
    // rpg absent (or no medallion for this key): just a souvenir
    X.sfx("pickup", {});
    G.notify("You pocket a bronze World's Fair medallion.");
    G.emit("medallionCollected", mid || medallionKey(o));
  }
  function sleep(rec, quality) {
    try {
      if (
        !G.isStub("combat") &&
        G.combat.detection &&
        G.combat.detection() === "danger"
      ) {
        G.notify("You cannot sleep when enemies are nearby.");
        X.sfx("ui_error");
        return;
      }
    } catch (e) {
      /* ignore */
    }
    G.fadeTransition(() => {
      if (!G.isStub("rpg") && typeof G.rpg.sleep === "function") {
        try {
          G.rpg.sleep(8, { owned: quality >= 1 && rec.opts.owned !== false });
          if (quality < 1)
            G.notify("You slept for 8 hours on a filthy mattress.");
          return;
        } catch (e) {
          G.reportError("props:sleep", e);
        }
      }
      const hours = 8;
      const nh = (G.time.hour + hours) % 24;
      if (G.time.hour + hours >= 24) G.time.day++;
      try {
        if (!G.isStub("atmos") && G.atmos.setHour) G.atmos.setHour(nh);
        else G.time.hour = nh;
      } catch (e) {
        G.time.hour = nh;
      }
      const p = G.player;
      p.heal(p.maxHp * quality);
      p.stamina = p.maxStamina;
      G.emit("slept", { hours, quality, bed: rec.id });
      G.notify(
        quality >= 1
          ? "You slept for 8 hours and feel well rested."
          : "You slept for 8 hours on a filthy mattress.",
      );
    }, 0.9);
  }

  // ------------------------------------------------------------------
  // Explosive drums
  // ------------------------------------------------------------------
  X.EXPLOSIVES = [];
  function registerExplosive(rec, def) {
    const p = rec.obj.position;
    const e = {
      rec,
      x: p.x,
      y: p.y + 0.5,
      z: p.z,
      hp: def.hp,
      maxHp: def.hp,
      radius: def.radius,
      damage: def.damage,
      dead: false,
      fuse: -1,
    };
    rec.explosive = e;
    X.EXPLOSIVES.push(e);
  }
  /** Register an explosive that is part of a static batch (no object3d) — hide via callback. */
  X.registerStaticExplosive = function (x, y, z, def, onDestroy, restore) {
    const e = {
      x,
      y: y + 0.5,
      z,
      hp: def.hp,
      maxHp: def.hp,
      radius: def.radius,
      damage: def.damage,
      dead: false,
      fuse: -1,
      onDestroy,
      restore,
      static: true,
      id: "barrel@" + x.toFixed(1) + "," + z.toFixed(1),
    };
    X.EXPLOSIVES.push(e);
    return e;
  };
  function damageExplosive(e, dmg) {
    if (e.dead || e.fuse >= 0) return;
    e.hp -= dmg;
    if (e.hp <= 0) {
      e.fuse = 0.12 + Math.random() * 0.2;
      if (X.flames)
        e.fire = X.flames.add(e.x, e.y + 0.4, e.z, 0.6, { smokeCount: 2 });
    }
  }
  function explodeExplosive(e) {
    e.dead = true;
    if (e.fire && e.fire.stop) e.fire.stop();
    const p = new THREE.Vector3(e.x, e.y, e.z);
    if (e.rec) wreckRec(e.rec);
    if (e.onDestroy) e.onDestroy(e);
    X.explosion(p, e.radius, e.damage, { source: "barrel", kind: "normal" });
    X.EXPLODED_BARRELS.add(e.id || (e.rec && e.rec.id));
    G.emit("propExploded", {
      type: e.rec ? e.rec.type : "barrel",
      kind: "barrel",
      id: e.id || (e.rec && e.rec.id),
      pos: p,
    });
  }
  /** Remove an exploded prop from the world: mesh, colliders, interactable, container AND its fx (fire / glow / radiation source). */
  function wreckRec(r) {
    if (r.obj.parent) r.obj.parent.remove(r.obj);
    for (const c of r.colliders) G.world.removeCollider(c);
    r.colliders = [];
    if (r.interactable) {
      G.world.removeInteractable(r.interactable);
      r.interactable = null;
    }
    destroyContainer(r);
    if (r.fx) {
      const dead = r.fx.fires.slice();
      X.removeProtoFx(r.fx);
      X.FIRE_SPOTS = X.FIRE_SPOTS.filter((f) => dead.indexOf(f.h) < 0);
    }
    r.exploded = true;
  }
  X.EXPLODED_BARRELS = new Set();

  // ------------------------------------------------------------------
  // Auto-turrets
  // ------------------------------------------------------------------
  X.TURRETS = [];
  function setupTurret(rec) {
    const o = rec.opts;
    const head = X.instantiate(X.proto("turret_head", o.continuity ? 1 : 0));
    head.position.set(0, 1.18, 0);
    rec.obj.add(head);
    const t = {
      rec,
      head,
      hp: o.hp || 70,
      alive: true,
      yaw: 0,
      burst: 0,
      cool: 1 + Math.random(),
      scan: Math.random() * 6,
      faction: o.faction || (o.hostile ? "raiders" : "covenant"),
      hostileToPlayer: o.hostile !== undefined ? !!o.hostile : null,
      range: o.range || 38,
      damage: o.damage || 5,
      enabled: o.enabled !== false,
      group: o.terminalId || o.group || null,
      baseHostile: o.hostile !== undefined ? !!o.hostile : null,
      baseEnabled: o.enabled !== false,
      muzzle: new THREE.Vector3(),
      muzzleYaw: NaN,
      xp: o.xp !== undefined ? o.xp : 10,
    };
    rec.turret = t;
    if (!t.enabled) head.rotation.x = 0.38;
    X.TURRETS.push(t);
  }
  /**
   * Terminal / script control of turrets. key = the turret's opts.terminalId, opts.group or its spawn id.
   * state: {enabled?:bool, hostile?:bool} or 'off' | 'on' | 'friendly' | 'hostile'. Returns the number affected.
   * e.g. terminal entry: {title:'Deactivate Turrets', action: () => G.props.setTurrets('ex_sec', 'off')}
   */
  P.setTurrets = function (key, state) {
    if (typeof state === "string")
      state =
        state === "off"
          ? { enabled: false }
          : state === "on"
            ? { enabled: true }
            : state === "friendly"
              ? { hostile: false, enabled: true }
              : state === "hostile"
                ? { hostile: true, enabled: true }
                : {};
    state = state || {};
    let n = 0;
    for (const t of X.TURRETS) {
      if (
        key !== undefined &&
        key !== null &&
        t.group !== key &&
        t.rec.id !== key
      )
        continue;
      if (state.enabled !== undefined) {
        t.enabled = !!state.enabled;
        t.burst = 0;
        t.head.rotation.x = t.enabled || !t.alive ? (t.alive ? 0 : 0.5) : 0.38;
      }
      if (state.hostile !== undefined) t.hostileToPlayer = !!state.hostile;
      n++;
    }
    if (n) X.sfx(state.enabled === false ? "terminal_beep" : "ui_click", {});
    return n;
  };
  P.turrets = function (key) {
    return X.TURRETS.filter(
      (t) => key === undefined || t.group === key || t.rec.id === key,
    ).map((t) => ({
      id: t.rec.id,
      group: t.group,
      alive: t.alive,
      enabled: t.enabled,
      hostile: turretHostileToPlayer(t),
      hp: t.hp,
      pos: t.rec.obj.position.clone(),
    }));
  };
  function turretHostileToPlayer(t) {
    if (t.hostileToPlayer !== null) return t.hostileToPlayer;
    try {
      if (!G.isStub("combat") && G.combat.relation)
        return G.combat.relation(t.faction, "player") === "hostile";
    } catch (e) {
      /* ignore */
    }
    return false;
  }
  const _tp = new THREE.Vector3(),
    _td = new THREE.Vector3();
