// play-inline-481 04 — pos
// Lines 850-1202 of readable/play-inline-481.pretty.js (statement-aligned).
  function geoFor(kind) {
    const mk = modelKind(kind);
    if (MODEL_GEO.has(mk)) return MODEL_GEO.get(mk);
    let g = null;
    try {
      const k = G.items._art.kit();
      BUILD[mk](k);
      g = k.build();
    } catch (e) {
      G.reportError("rpg:containerModel:" + mk, e);
      g = new THREE.BoxGeometry(0.6, 0.5, 0.5);
      g.translate(0, 0.25, 0);
    }
    MODEL_GEO.set(mk, g);
    return g;
  }
  function createModel(kind) {
    if (!modelMat) {
      const atlas = G.items._art ? G.items._art.texture() : null;
      modelMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.72,
        metalness: 0.28,
        map: atlas || null,
      });
      modelMat.userData.shared = true;
    }
    const m = new THREE.Mesh(geoFor(kind || "crate"), modelMat);
    const mk = modelKind(kind);
    // only big pieces cast shadows (budget: no shadows on small props)
    m.castShadow =
      /fridge|locker|desk|file_cabinet|dresser|dumpster|mailbox|safe|trash/.test(
        mk,
      );
    m.receiveShadow = true;
    m.name = "container:" + mk;
    return m;
  }

  // ------------------------------------------------------------------
  // Creation / registry
  // ------------------------------------------------------------------
  /**
   * Stable container id. Owners should pass `id` (props passes its site/prop id). Without one the id
   * is derived from what the container IS and WHERE: kind + position (10 cm) + facing, so the same
   * container gets the same id whatever order things stream in. A clash is reported, then suffixed.
   */
  const warnedIds = new Set();
  function makeId(opts, pos) {
    let base = opts.id;
    if (!base) {
      const kind = String(opts.kind || opts.loot || opts.name || "box").replace(
        /\W+/g,
        "_",
      );
      const h =
        U.hashStr(
          kind +
            "|" +
            Math.round(pos.x * 10) +
            "|" +
            Math.round(pos.y * 10) +
            "|" +
            Math.round(pos.z * 10) +
            "|" +
            Math.round((opts.yaw || 0) * 100),
        ) >>> 0;
      base =
        "c_" +
        kind +
        "_" +
        Math.round(pos.x) +
        "_" +
        Math.round(pos.z) +
        "_" +
        h.toString(36);
    }
    let id = base,
      n = 1;
    if (usedIds.has(id) && !warnedIds.has(base)) {
      warnedIds.add(base);
      console.warn(
        '[rpg] containers: duplicate container id "' +
          base +
          '" — pass a unique opts.id so saved contents map to the right container',
      );
    }
    while (usedIds.has(id)) id = base + "_" + ++n;
    usedIds.add(id);
    return id;
  }

  function create(opts) {
    opts = opts || {};
    const c = makeContainer(opts);
    // position: explicit pos, else the object's bounding box centre
    let obj = opts.object3d || null;
    if (!obj && opts.model !== false && opts.pos && G.scene) {
      obj = createModel(opts.kind || opts.loot || "crate");
      obj.position.set(
        opts.pos.x,
        opts.pos.y !== undefined
          ? opts.pos.y
          : G.world.groundHeight(opts.pos.x, opts.pos.z, 2),
        opts.pos.z,
      );
      if (opts.yaw) obj.rotation.y = opts.yaw;
      G.scene.add(obj);
      c.ownsModel = true;
      if (
        opts.collider !== false &&
        /locker|safe|desk|file_cabinet|dresser|fridge|dumpster|mailbox|trash_can/.test(
          modelKind(opts.kind || opts.loot),
        )
      ) {
        try {
          c.collider = G.world.addFromObject(obj, {
            tag: "container",
            surface: "metal",
          });
        } catch (e) {
          /* ignore */
        }
      }
    }
    c.object3d = obj;
    if (obj) {
      obj.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(obj);
      if (!box.isEmpty()) {
        box.getCenter(c.pos);
        c.pos.y = Math.min(
          box.max.y - 0.05,
          box.min.y + Math.max(0.3, (box.max.y - box.min.y) * 0.6),
        );
      } else obj.getWorldPosition(c.pos);
    }
    if (opts.pos && (!obj || opts.object3d)) {
      if (!obj)
        c.pos.set(
          opts.pos.x,
          opts.pos.y !== undefined ? opts.pos.y + 0.4 : 0.4,
          opts.pos.z,
        );
    }
    c.id = makeId(opts, c.pos);
    if (!c.isCorpse) c._pristine = stateOf(c); // untouched state (loot not yet rolled) for new games
    // saved state for this container?
    if (pendingState[c.id]) {
      applyState(c, pendingState[c.id]);
      delete pendingState[c.id];
    }
    if (opts.interact !== false && !c.isCorpse) {
      c.interactable = G.world.addInteractable({
        getPos: () => c.pos,
        radius: opts.radius || 0.6,
        priority: 0.3,
        range: 2.6,
        label: () => c.name,
        verb: () => (c.isOwned() ? "Steal from" : c.verb),
        locked: () => (isLocked(c) ? "Locked" : null),
        stealing: () => c.isOwned(),
        container: c,
        onInteract: () => open(c),
      });
    }
    registry.set(c.id, c);
    return c;
  }

  /** Unregister a container (props stream them in/out). Touched state is kept so re-creating it restores contents. */
  function remove(c) {
    if (!c) return;
    if (!c.isCorpse && c.touched && registry.get(c.id) === c)
      pendingState[c.id] = stateOf(c);
    if (c.interactable) G.world.removeInteractable(c.interactable);
    if (c.ownsModel && c.object3d && c.object3d.parent)
      c.object3d.parent.remove(c.object3d);
    if (c.collider) G.world.removeCollider(c.collider);
    registry.delete(c.id);
    usedIds.delete(c.id);
  }

  // ------------------------------------------------------------------
  // Opening / locks
  // ------------------------------------------------------------------
  function unlock(c, how) {
    c.locked = 0;
    c.touched = true;
    const sp = lockSpec(c);
    try {
      if (sp && !G.isStub("locks") && G.locks.unlock)
        G.locks.unlock(sp.id, how);
    } catch (e) {
      /* ignore */
    }
    G.events.emit("containerUnlocked", c, how);
  }
  function open(c) {
    if (!c) return false;
    // The container screen (ui_interact) routes locks through G.locks itself; without it, do it here.
    const uiOpens = !G.isStub("ui") && G.ui.openContainer;
    if (!uiOpens && isLocked(c)) {
      const sp = lockSpec(c);
      if (!G.isStub("locks") && G.locks.open) {
        G.locks.open(
          Object.assign({ kind: "container", label: c.name }, sp),
          () => {
            unlock(c, "lock");
            setTimeout(() => open(c), 50);
          },
        );
        return false;
      }
      if (sp.key && G.inventory.has(sp.key)) {
        unlock(c, "key");
        G.notify("Unlocked with " + nameOf(sp.key) + ".");
      } else {
        G.sfx.play("door_locked");
        G.notify("It's locked.");
        return false;
      }
    }
    ensureRolled(c);
    // respawn: non-player containers restock after a few days; the old contents are replaced
    // by a fresh roll (never piled on top).
    // A container the player has used as a stash is left alone.
    if (c.respawn && c.loot && !c.playerStored && G.time.day - c.day >= 3) {
      c.day = G.time.day;
      c._items = new Map();
      c.conds = new Map();
      const out = G.items.rollLoot(c.loot, rollLevel(c));
      for (const e of out) addItem(c, e[0], e[1], e[2]);
    }
    c.touched = true;
    G.sfx.play("container_open", { pos: c.pos, volume: 0.8 });
    if (c.onOpen) {
      try {
        c.onOpen(c);
      } catch (e) {
        G.reportError("rpg:container.onOpen", e);
      }
    }
    G.events.emit("containerOpened", c);
    if (!G.isStub("ui") && G.ui.openContainer) {
      G.ui.openContainer(c);
      return true;
    }
    // Fallback without the container UI: take everything
    if (c.items.size === 0) {
      G.notify(c.isCorpse ? "There is nothing on the body." : "It's empty.");
      return true;
    }
    c.takeAll();
    return true;
  }

  // ------------------------------------------------------------------
  // Stealing
  // ------------------------------------------------------------------
  /** Evaluate a theft from `owner` worth `value` scrip. Returns true if the player was caught. */
  function stealCheck(owner, value, info) {
    info = info || {};
    if (!isOwnedByOther(owner)) return false;
    G.rpg.bumpStat("itemsStolen", Math.max(1, info.count || 1));
    const P = G.player;
    let caught = false,
      witness = null;
    try {
      if (!G.isStub("actors") && G.actors.list) {
        const hidden =
          !G.isStub("combat") &&
          G.combat.detection &&
          G.combat.detection() === "hidden";
        const stealthed = G.rpg.isStealthed();
        const eye = new THREE.Vector3();
        for (const a of G.actors.list()) {
          if (!a || a.dead || a.faction !== owner) continue;
          if (a.hostile && a.hostile()) continue;
          const d = Math.hypot(a.pos.x - P.pos.x, a.pos.z - P.pos.z);
          if (d > 22) continue;
          // facing check (~120° view cone), skipped when very close
          if (d > 3) {
            const fx = -Math.sin(a.yaw || 0),
              fz = -Math.cos(a.yaw || 0);
            const tx = (P.pos.x - a.pos.x) / d,
              tz = (P.pos.z - a.pos.z) / d;
            if (fx * tx + fz * tz < -0.3) continue;
          }
          eye.set(a.pos.x, a.pos.y + 1.6, a.pos.z);
          const target = new THREE.Vector3(P.pos.x, P.pos.y + 1.2, P.pos.z);
          if (
            !G.world.lineOfSight(eye, target, {
              ignoreTags: ["actor", "interactable_self", "container"],
            })
          )
            continue;
          // sneaking: Stealth skill vs distance
          if ((P.sneaking && hidden) || stealthed) {
            const chance = Math.max(
              0.05,
              0.9 - G.rpg.sneakBonus() / 120 - d / 40,
            );
            if (Math.random() > chance) continue;
          }
          caught = true;
          witness = a;
          break;
        }
      }
    } catch (e) {
      G.reportError("rpg:stealCheck", e);
    }
    const standingLoss = Math.max(
      1,
      Math.min(10, Math.round((value || 1) / 20)),
    );
    if (caught) {
      G.notify("You were caught stealing!", { kind: "crime" });
      G.sfx.play("sneak_detected");
      G.rpg.addStanding(-Math.max(5, standingLoss * 2), "stealing");
      try {
        if (witness && !witness.essential && witness.setHostile)
          witness.setHostile(true);
        if (witness && witness.say)
          witness.say(
            [
              "Thief!",
              "Hey! That's not yours!",
              "Put that back, sleeper!",
              "Guards! We got a thief!",
            ][Math.floor(Math.random() * 4)],
          );
      } catch (e) {
        /* ignore */
      }
      G.events.emit("crime", { type: "theft", owner, value, witness, info });
    } else {
      G.rpg.addStanding(-standingLoss, "stealing");
      G.events.emit("crime", {
        type: "theft",
        owner,
        value,
        witness: null,
        info,
      });
    }
    return caught;
  }

  // ------------------------------------------------------------------
  // Corpse loot
  // ------------------------------------------------------------------
