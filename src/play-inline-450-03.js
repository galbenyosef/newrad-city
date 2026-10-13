// play-inline-450 03 — rec
// Lines 700-1038 of readable/play-inline-450.pretty.js (statement-aligned).
  function tableKnown(t) {
    try {
      if (typeof G.items.hasLootTable === "function")
        return !!G.items.hasLootTable(t);
      if (G.items.lootTables && typeof G.items.lootTables === "object")
        return !!G.items.lootTables[t];
    } catch (e) {
      /* ignore */
    }
    return null; // unknown
  }
  function makeContainer(rec) {
    if (!rec.cdef || rec.container || rec.removed || rec.taken) return;
    if (
      !G.isStub("containers") &&
      typeof G.containers.create === "function" &&
      !X.containersReady
    )
      return; // created at initDone
    if (G.isStub("containers") || typeof G.containers.create !== "function") {
      // fallback until rpg exists (or forever, if it never does)
      if (!rec.fallbackInteract) {
        rec.fallbackInteract = G.world.addInteractable({
          pos: rec.ipos,
          radius: 0.7,
          label: rec.cdef.name,
          verb: "Search",
          enabled: () => G.isStub("containers") || !rec.container,
          onInteract() {
            X.sfx("container_open", { pos: rec.ipos });
            G.notify("The " + rec.cdef.name.toLowerCase() + " is empty.");
          },
        });
      }
      return;
    }
    const d = rec.cdef;
    const def = {
      pos: rec.ipos.clone(),
      name: d.name,
      id: d.id,
      kind: d.kind || d.loot,
    };
    if (d.lock) {
      def.lock = d.lock;
      registerLock(d.lock);
    }
    if (d.locked) def.locked = d.locked;
    if (rec.obj) def.object3d = rec.obj;
    else {
      def.model = false;
      def.pos.y -= 0.4;
    } // rpg lifts pos-only containers by 0.4
    if (d.owner) def.owner = d.owner;
    if (d.respawn !== undefined) def.respawn = d.respawn;
    if (d.items) def.items = d.items;
    else if (d.loot) {
      const known = tableKnown(d.loot);
      if (known !== false) def.loot = d.loot;
      else if (d.defLoot && tableKnown(d.defLoot) !== false)
        def.loot = d.defLoot; // unknown table → the prop's own default
      else def.items = fallbackItems(d.loot, U.hashStr(d.id));
    }
    try {
      rec.container = G.containers.create(def) || null;
    } catch (e) {
      G.reportError("props:container", e);
      rec.container = null;
    }
    if (rec.fallbackInteract) {
      G.world.removeInteractable(rec.fallbackInteract);
      rec.fallbackInteract = null;
    }
  }
  function destroyContainer(rec) {
    if (rec.fallbackInteract) {
      G.world.removeInteractable(rec.fallbackInteract);
      rec.fallbackInteract = null;
    }
    const c = rec.container;
    if (!c) return;
    try {
      if (!G.isStub("containers") && typeof G.containers.remove === "function")
        G.containers.remove(c);
      else if (typeof G.containers.destroy === "function")
        G.containers.destroy(c);
      else if (typeof c.remove === "function") c.remove();
      else if (typeof c.dispose === "function") c.dispose();
      if (c.interactable) G.world.removeInteractable(c.interactable);
    } catch (e) {
      /* ignore */
    }
    rec.container = null;
  }
  X.makeContainer = makeContainer;
  X.destroyContainer = destroyContainer;

  // ------------------------------------------------------------------
  // Interactions
  // ------------------------------------------------------------------
  // World's Fair medallions: spawn('medallion', {medallion: key|itemId}) — `stat` (an attribute / skill key, any
  // spelling rpg understands) is accepted too. rpg owns the set (G.items.medallionId); the curator in src/quests/55_medallions.js buys them.
  function medallionKey(o) {
    return o.medallion || o.itemId || o.stat || null;
  }
  function medallionItem(o) {
    const key = medallionKey(o);
    if (!key) return null;
    try {
      if (G.isStub("items")) return null;
      const d = G.items.get(key);
      if (d && d.medallion) return d.id;
      if (typeof G.items.medallionId === "function") {
        const id = G.items.medallionId(key);
        if (id && G.items.get(id)) return id;
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }
  function medallionIndex(o) {
    if (typeof o.index === "number") return o.index;
    return (
      U.hashStr(String(medallionItem(o) || medallionKey(o) || "medallion")) % 20
    );
  }
  function itemName(id) {
    try {
      const d = !G.isStub("items") && G.items.get(id);
      if (d && d.name) return d.name;
    } catch (e) {
      /* ignore */
    }
    return id.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  }
  function giveItem(id, n) {
    if (!G.isStub("inventory") && typeof G.inventory.add === "function") {
      try {
        G.inventory.add(id, n || 1);
        return true;
      } catch (e) {
        G.reportError("props:give", e);
      }
    }
    G.notify(itemName(id) + " added.");
    return false;
  }
  function setupInteract(rec, kind, T) {
    const o = rec.opts;
    const base = { pos: rec.ipos, radius: 0.6, priority: 0 };
    let def = null;
    switch (kind) {
      case "terminal":
        def = Object.assign(base, {
          label: o.name || o.label || "Teletype Terminal",
          verb: "Access",
          radius: 0.55,
          onInteract() {
            X.sfx("terminal_boot", { pos: rec.ipos });
            if (
              !G.isStub("terminals") &&
              typeof G.terminals.open === "function" &&
              o.terminalId
            )
              G.terminals.open(o.terminalId);
            else
              G.notify(
                o.terminalId
                  ? "The terminal flickers but will not boot."
                  : "The screen is dead.",
              );
          },
        });
        break;
      case "bed":
      case "bed_floor":
        def = Object.assign(base, {
          label: o.name || (kind === "bed" ? "Bed" : "Dirty Mattress"),
          verb: "Sleep",
          radius: 0.9,
          onInteract() {
            sleep(rec, kind === "bed" ? 1 : 0.6);
          },
        });
        break;
      case "radio":
        def = Object.assign(base, {
          label: o.name || "Radio",
          verb: () => (thisRadioOn(rec) ? "Turn Off" : "Turn On"),
          radius: 0.4,
          onInteract() {
            if (G.isStub("radio")) {
              G.notify("Only static...");
              X.sfx("ui_click", { pos: rec.ipos });
              return;
            }
            try {
              // the set itself plays the station (positional, small-speaker tone): G.radio.tune(id, {pos})
              if (thisRadioOn(rec)) G.radio.tune(null);
              else {
                const st = G.radio.stations() || [];
                let pick = o.station;
                if (!pick) {
                  try {
                    pick = G.radio.current && G.radio.current();
                  } catch (e) {
                    pick = null;
                  }
                }
                if (!pick)
                  pick = (st.find((s) => s.id === "rfm") || st[0] || {}).id;
                if (pick)
                  G.radio.tune(pick, {
                    pos: { x: rec.ipos.x, y: rec.ipos.y, z: rec.ipos.z },
                  });
              }
            } catch (e) {
              G.reportError("props:radio", e);
            }
          },
        });
        break;
      case "workbench":
        def = Object.assign(base, {
          label: o.name || "Workbench",
          verb: "Use",
          radius: 0.9,
          onInteract() {
            if (o.onInteract) o.onInteract(rec);
            else {
              G.emit("workbench", rec);
              // weapons owns the crafting screen; only fall back to the flavour line when it isn't loaded
              const crafting =
                !G.isStub("weapons") &&
                typeof G.weapons.openWorkbench === "function";
              if (!crafting)
                G.notify(
                  "You tinker with the workbench, but lack the schematics to build anything.",
                );
            }
          },
        });
        break;
      case "pickup": {
        const id = T.item ? T.item(o) : o.itemId;
        def = Object.assign(base, {
          label: o.name || o.label || itemName(id),
          verb: "Take",
          radius: 0.35,
          priority: 1,
          onInteract() {
            X.sfx("pickup", { pos: rec.ipos });
            giveItem(id, o.count || 1);
            takeRec(rec);
            if (o.onTake) o.onTake(rec);
          },
        });
        break;
      }
      case "medallion": {
        const mid = medallionItem(o);
        def = Object.assign(base, {
          label: o.name || (mid ? itemName(mid) : "World's Fair Medallion"),
          verb: "Take",
          radius: 0.3,
          priority: 2,
          onInteract() {
            collectMedallion(o);
            takeRec(rec);
            if (o.onTake) o.onTake(rec);
          },
        });
        break;
      }
      case "custom":
        def = Object.assign(base, {
          label: o.label || o.name || rec.type,
          verb: o.verb || "Use",
          onInteract() {
            o.onInteract(rec);
          },
        });
        break;
    }
    if (def) {
      def.object3d = rec.obj;
      def.enabled = () => !rec.taken && !rec.removed;
      rec.interactable = G.world.addInteractable(def);
    }
  }
  /** True when the world radio emitter is this set. */
  function thisRadioOn(rec) {
    if (!radioOn()) return false;
    try {
      const e = G.radio.emitter ? G.radio.emitter() : null;
      return !!e && Math.hypot(e.x - rec.ipos.x, e.z - rec.ipos.z) < 0.6;
    } catch (err) {
      return false;
    }
  }
  function radioOn() {
    try {
      return !G.isStub("radio") && G.radio.isOn && G.radio.isOn();
    } catch (e) {
      return false;
    }
  }
  function takeRec(rec) {
    rec.taken = true;
    rec.obj.visible = false;
    if (rec.lod) rec.lod._hidden = true;
    if (rec.obj.parent) rec.obj.parent.remove(rec.obj);
    X.removeProtoFx(rec.fx);
    if (rec.interactable) {
      G.world.removeInteractable(rec.interactable);
      rec.interactable = null;
    }
    X.TAKEN.add(rec.id);
  }
  X.TAKEN = new Set();
  function restoreRec(rec) {
    if (!rec.taken || rec.removed) return;
    rec.taken = false;
    (rec.opts.parent || X.spawnRoot || G.scene).add(rec.obj);
    rec.obj.visible = true;
    rec.fx = X.addProtoFx(
      rec.pr,
      rec.obj.position.x,
      rec.obj.position.y,
      rec.obj.position.z,
      rec.obj.rotation.y,
      rec.obj.scale.x,
      false,
    );
    const T = TYPES[rec.type] || {};
    if (T.interact) setupInteract(rec, T.interact, T);
    X.TAKEN.delete(rec.id);
  }
