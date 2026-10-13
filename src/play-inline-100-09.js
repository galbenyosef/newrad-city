// play-inline-100 09 — key
// Lines 3521-3852 of readable/play-inline-100.pretty.js (statement-aligned).
  M.dungeons = [];
  /** step(frac)? is awaited after each dungeon so boot can yield (keeps the loading screen animating). */
  M.buildDungeons = async function (step) {
    const L = G.LAYOUT;
    const used = [];
    let di = 0;
    for (const D of DUNGEONS) {
      if (step && di++) await step((di - 1) / DUNGEONS.length);
      try {
        // interior cell registration (owner: map)
        if (!L.INTERIORS[D.key])
          L.INTERIORS[D.key] = {
            owner: "map",
            origin: D.origin,
            name: D.name,
            hostile: true,
            type: "dungeon",
          };
        const O = L.INTERIORS[D.key].origin;
        const K = M.dungeonKit(D.key, O, 1);
        D.build(K);
        K.finish();
        // anchors → world
        const W = {};
        for (const k in K.anchors) {
          const a = K.anchors[k];
          const v = new THREE.Vector3(
            O.x + a[0],
            (O.y || 0) + a[1],
            O.z + a[2],
          );
          v.yaw = a[3] || 0;
          W[k] = v;
        }
        M.anchors[D.key] = W;
        // street entrance
        const E = M.pickDungeonEntrance(D, used); // street face (56_dungeons.js)
        let outside = null,
          doorPos = null,
          yawOut = 0;
        if (E) {
          used.push(E);
          const sd = M.dungeonStreetDoor(D, E); // street door visuals (56_dungeons.js)
          outside = sd.outside;
          doorPos = sd.doorPos;
          yawOut = Math.atan2(-E.nx, -E.nz);
          E.lot.dungeon = D.key;
        }
        const rec = {
          key: D.key,
          name: D.name,
          def: D,
          origin: O,
          anchors: W,
          loot: K.lootList.map((l) =>
            Object.assign({}, l, {
              x: O.x + l.x,
              y: (O.y || 0) + l.y,
              z: O.z + l.z,
            }),
          ),
          notes: K.notes.map((n) =>
            Object.assign({}, n, {
              x: O.x + n.x,
              y: (O.y || 0) + n.y,
              z: O.z + n.z,
            }),
          ),
          terminals: K.terminals,
          outside,
          doorPos,
          entrance: E ? { x: E.x, z: E.z, nx: E.nx, nz: E.nz } : null,
        };
        M.dungeons.push(rec);
        // fixtures (borrowed real lights when the player is near)
        M.extraFixtures = M.extraFixtures || [];
        for (const f of K.fixtures)
          M.extraFixtures.push({
            pos: new THREE.Vector3(
              O.x + f.p[0],
              (O.y || 0) + f.p[1],
              O.z + f.p[2],
            ),
            color: f.color,
            opts: f.opts,
          });
        if (!E) {
          G.reportError &&
            console.warn("[map] dungeon " + D.key + ": no entrance lot found");
          continue;
        }
        // doors: street → arrival, exit → street
        const A = W.arrival,
          X = W.exit;
        G.world.addDoor({
          pos: doorPos,
          label: D.name,
          verb: "Enter",
          radius: 1.3,
          lock: D.lock || undefined,
          target: { x: A.x, y: A.y, z: A.z, yaw: A.yaw || 0 },
          sound: "door_open",
          onEnter: () => {
            try {
              G.discover(D.key);
            } catch (e) {
              /* */
            }
          },
        });
        G.world.addDoor({
          pos: new THREE.Vector3(X.x, X.y, X.z),
          label: "Exit to the street",
          verb: "Leave",
          radius: 1.4,
          target: { x: outside.x, y: outside.y, z: outside.z, yaw: yawOut },
          sound: "door_open",
        });
        // the code for a locked street door lies on the sidewalk outside it (a note: learn → G.locks)
        if (D.doorNote)
          rec.notes.push(
            Object.assign({}, D.doorNote, {
              x: outside.x + E.nx * 0.9 + E.nz * 1.1,
              y: outside.y || 0,
              z: outside.z + E.nz * 0.9 - E.nx * 1.1,
            }),
          );
        // LOCATIONS: outdoor marker (goggles map, discovery, "Cleared") + interior entry (combat population)
        const mx = outside.x + E.nx * 2.5,
          mz = outside.z + E.nz * 2.5;
        const extId = D.key,
          intId = D.key + "_int";
        if (!L.getLocation(extId))
          L.LOCATIONS.push({
            id: extId,
            name: D.name,
            x: mx,
            z: mz,
            r: 12,
            type: "dungeon",
            faction: D.faction,
            hostile: true,
            level: D.level,
            dungeon: D.key,
            baseName: D.name,
          });
        if (!L.getLocation(intId))
          L.LOCATIONS.push({
            id: intId,
            name: D.name,
            x: mx,
            z: mz,
            r: 8,
            type: "dungeon",
            faction: D.faction,
            hostile: true,
            level: D.level,
            interior: D.key,
            spawns: D.spawns.slice(),
            dungeon: D.key,
          });
        rec.extId = extId;
        rec.intId = intId;
        // boss anchor for combat's raider-boss logic (G.landmarks.getAnchor(locId, 'boss'))
        try {
          if (!G.landmarks || G.landmarks.__stub)
            G.landmarks = {
              getAnchor: (id, n) =>
                G.landmarks[id] &&
                G.landmarks[id].anchors &&
                G.landmarks[id].anchors[n]
                  ? G.landmarks[id].anchors[n].clone()
                  : null,
            };
          if (W.boss)
            G.landmarks[intId] = {
              id: intId,
              anchors: { boss: W.boss, entrance: outside },
            };
        } catch (e) {
          /* optional */
        }
      } catch (e) {
        G.reportError("map:dungeon " + D.key, e);
      }
    }
    registerLocks();
    return M.dungeons.length;
  };

  // ===================================================================
  // Runtime: containers / skeletons / terminals / notes; "Cleared" names
  // ===================================================================
  const spawned = new Map(); // key → [{rec, handle}]
  function unlockLoot(key, tag) {
    const list = spawned.get(key) || [];
    let n = 0;
    for (const s of list) {
      if (s.rec.tag !== tag || !s.h) continue;
      try {
        const c = s.h.container;
        if (c) {
          c.locked = 0;
          n++;
        }
        if (s.h.record && s.h.record.cdef) s.h.record.cdef.locked = 0;
      } catch (e) {
        /* */
      }
      if (s.rec.lock) unlockLock(s.rec.lock.id);
    }
    if (n) {
      try {
        G.sfx && G.sfx.play && G.sfx.play("door_open");
      } catch (e) {
        /* */
      }
    }
    return n;
  }
  M.unlockDungeonLoot = unlockLoot;
  M.spawnDungeonLoot = function () {
    M.clearDungeonLoot();
    if (G.isStub("props") || !G.props.spawn) return;
    for (const D of M.dungeons) {
      const list = [];
      D.loot.forEach((l, i) => {
        try {
          const o = {
            x: l.x,
            y: l.y,
            z: l.z,
            yaw: l.yaw,
            id: D.key + "_" + i + "_" + l.type,
            persistent: false,
          };
          if (l.loot) o.loot = l.loot;
          for (const k of [
            "name",
            "wall",
            "large",
            "chest",
            "kind",
            "pose",
            "terminalId",
            "mount",
            "floor",
          ])
            if (l[k] !== undefined) o[k] = l[k];
          if (l.lock) {
            o.lock = l.lock;
            o.locked = 0;
          }
          if (l.noContainer) o.container = false;
          const h = G.props.spawn(l.type, o);
          // the container UI opens locked containers through G.locks (container.lock)
          if (h && l.lock) {
            try {
              if (h.container) h.container.lock = l.lock;
              if (h.record && h.record.cdef) h.record.cdef.lock = l.lock;
            } catch (e) {
              /* */
            }
          }
          if (h) list.push({ rec: l, h });
        } catch (e) {
          G.reportError("map:dungeon loot " + D.key, e);
        }
      });
      spawned.set(D.key, list);
    }
  };
  M.clearDungeonLoot = function () {
    for (const list of spawned.values())
      for (const s of list) {
        try {
          if (s.h.remove) s.h.remove();
          else if (s.h.object3d && s.h.object3d.parent)
            s.h.object3d.parent.remove(s.h.object3d);
        } catch (e) {
          /* */
        }
      }
    spawned.clear();
  };
  /** Notes (static pickups, persisted by rpg) and terminals — once all modules are initialised. */
  M.initDungeonData = function () {
    registerLocks();
    defineKeys();
    for (const D of M.dungeons) {
      for (const t of D.terminals) {
        try {
          if (!G.isStub("terminals") && G.terminals.register)
            G.terminals.register(t.id, t.def);
        } catch (e) {
          G.reportError("map:terminal " + t.id, e);
        }
      }
      for (const n of D.notes) {
        try {
          if (G.isStub("items") || !G.items.define) continue;
          if (!n.isKey && !(G.items.get && G.items.get(n.id))) {
            const def = {
              id: n.id,
              type: "note",
              name: n.name,
              title: n.title,
              text: n.text,
              weight: 0,
              value: 0,
            };
            // a note that carries a code / passcode teaches it (G.locks: item `learn`, plus onRead for readers that call it)
            if (n.learn) {
              def.learn = n.learn;
              def.onRead = () => learnLock(n.learn, n.name);
            }
            G.items.define(def);
          }
          if (G.items.spawnPickup)
            G.items.spawnPickup(
              n.id,
              1,
              new THREE.Vector3(n.x, n.y + 0.02, n.z),
              { static: true, keepY: true, yaw: 0.3 },
            );
        } catch (e) {
          G.reportError("map:note " + n.id, e);
        }
      }
    }
  };
  /** Goggles map: mark cleared dungeons ("Name [Cleared]") — polled, so it survives saves & reloads. */
