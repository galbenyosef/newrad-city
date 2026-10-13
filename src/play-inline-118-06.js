// play-inline-118 06 — kind
// Lines 1337-1499 of readable/play-inline-118.pretty.js (statement-aligned).
  function spawnWorldBits() {
    for (const l of LOCKS) K.lockReg(l);
    for (const d of INNER_ITEMS) defineItem(d);
    if (!G.isStub("containers") && G.containers && G.containers.create) {
      for (const c of CONTAINERS) {
        if (c.made) continue;
        c.made = true;
        // (owner: the shared faction id of the Neon's townsfolk, the settlers)
        try {
          G.containers.create({
            id: c.id,
            name: c.name,
            kind: c.kind,
            loot: c.loot,
            items: c.items,
            locked: 0,
            lock: c.lock || null,
            owner: c.owner === undefined ? "settlers" : c.owner,
            pos: { x: c.x, y: c.y - 0.4, z: c.z },
            model: false,
            radius: c.r || 0.7,
          });
        } catch (e) {
          G.reportError("landmarks_a:neon_container", e);
        }
      }
    }
    for (const s of STORY) {
      if (s.made) continue;
      try {
        if (s.kind === "terminal") {
          if (G.isStub("props") || !G.props.spawn) continue;
          if (!G.isStub("terminals") && G.terminals.register)
            G.terminals.register(s.tid, s.def);
          // (props models face local −z, i.e. the player-yaw convention: our three.js facing yaw + π)
          G.props.spawn("terminal", {
            x: s.x,
            y: s.y,
            z: s.z,
            yaw: s.yaw + PI,
            terminalId: s.tid,
            mount: "bare",
            id: "lma:" + s.tid,
            persistent: true,
          });
        } else if (s.kind === "workbench" || s.kind === "radio") {
          if (G.isStub("props") || !G.props.spawn) continue;
          G.props.spawn(s.kind, {
            x: s.x,
            y: s.y,
            z: s.z,
            yaw: s.yaw + PI,
            id: "lma:" + s.id,
            persistent: true,
          });
        } else if (s.kind === "note" || s.kind === "tape" || s.kind === "key") {
          if (G.isStub("items") || !G.items.define || !G.items.spawnPickup)
            continue;
          const base =
            s.kind === "key"
              ? {
                  type: "key",
                  weight: 0,
                  value: 0,
                  tags: ["key"],
                  mesh: "key",
                  noLoot: true,
                }
              : { type: s.kind, weight: 0, value: 0 };
          if (!G.items.get(s.item.id))
            G.items.define(Object.assign(base, s.item));
          G.items.spawnPickup(
            s.item.id,
            1,
            { x: s.x, y: s.y, z: s.z },
            { static: true, yaw: s.yaw || 0 },
          );
        }
        s.made = true;
      } catch (e) {
        s.made = true;
        G.reportError(
          "landmarks_a:neon_story_" + (s.tid || s.id || (s.item && s.item.id)),
          e,
        );
      }
    }
  }
  if (G.events) {
    G.events.on("initDone", spawnWorldBits);
    G.events.on("newGame", spawnWorldBits);
    G.events.on("loaded", spawnWorldBits);
  }
  /** Terminal on one of our desks (world coords; y = desk top; yaw = the direction the screen faces, three.js). */
  function terminal(tid, x, y, z, yaw, def) {
    STORY.push({ kind: "terminal", tid, x, y, z, yaw, def });
  }
  function note(id, x, y, z, item, kind) {
    STORY.push({
      kind: kind || "note",
      x,
      y,
      z,
      item: Object.assign({ id }, item),
    });
  }
  /** A key item lying on our furniture. */
  function keyItem(id, x, y, z, item) {
    STORY.push({ kind: "key", x, y, z, item: Object.assign({ id }, item) });
  }

  // ------------------------------------------------------------------
  // Doors (street façade ↔ room entrance)
  // ------------------------------------------------------------------
  function doors(rec, r, e, label, o) {
    o = o || {};
    const nx = Math.sin(e.f),
      nz = Math.cos(e.f);
    // arrival inside: 1.5 m in from the door on the entrance landing, facing into the room (r.entryYaw); back on the street:
    // 1.7 m out from the façade door, facing away from it (the exact spot is validated by DOOR_AUDIT in shot/smoke runs)
    const inT = { x: r.doorX, y: r.entryY, z: r.z1 - 1.5, yaw: r.entryYaw };
    const outT = {
      x: e.x + nx * (e.out || 1.7),
      y: 0,
      z: e.z + nz * (e.out || 1.7),
      yaw: AY(e.f),
    };
    const def = {
      pos: new THREE.Vector3(e.x + nx * 0.35, 1.5, e.z + nz * 0.35),
      radius: 1.3,
      label,
      verb: "Enter",
      target: inT,
      sound: o.sound || "door_open",
    };
    if (o.lock) {
      def.lock = lock(o.lock);
      def.id = o.lock.id;
    }
    G.world.addDoor(def);
    G.world.addDoor({
      pos: new THREE.Vector3(r.doorX, r.entryY + 1.5, r.z1 - 0.35),
      radius: 1.3,
      label: o.exitLabel || "Times Square",
      verb: "Exit to",
      target: outT,
      sound: o.sound || "door_open",
    });
    rec.anchor(r.key + "_entrance", inT.x, inT.y, inT.z, inT.yaw);
    DOOR_AUDIT.push({
      key: r.key,
      label,
      room: r,
      street: { x: e.x, z: e.z, f: e.f },
      inT,
      outT,
    });
  }
  const DOOR_AUDIT = [];

  // ------------------------------------------------------------------
  // THE PLACES
  // ------------------------------------------------------------------
