// play-inline-196 02 — ctx
// Lines 19-367 of readable/play-inline-196.pretty.js (statement-aligned).
  const PV = G._pv;
  const K = PV.kit;

  const CTX = []; // built POI contexts
  PV.ctxs = CTX;
  PV.state = {}; // saved state (flags per POI)
  const DEFAULT_STATE = () => ({ v: 1 });
  let spawnedLoot = []; // prop handles
  let dataDone = false;

  // ------------------------------------------------------------------
  // Registry (shared namespace: add, never clobber)
  // ------------------------------------------------------------------
  function registry() {
    if (!G.pois || G.pois.__stub || G.isStub("pois")) G.pois = {};
    if (typeof G.pois.getAnchor !== "function") {
      G.pois.getAnchor = function (idOrKey, name) {
        for (const k in G.pois) {
          const p = G.pois[k];
          if (!p || typeof p !== "object" || !p.anchors) continue;
          if (p.id !== idOrKey && p.interiorKey !== idOrKey && k !== idOrKey)
            continue;
          const a = p.anchors[name];
          if (a && typeof a.x === "number")
            return a.clone ? a.clone() : new THREE.Vector3(a.x, a.y || 0, a.z);
        }
        return null;
      };
    }
    return G.pois;
  }
  PV.anchor = function (poiId, name) {
    const c = CTX.find((q) => q.id === poiId);
    const a = c && c.anchors[name];
    return a ? a.clone() : null;
  };

  // ------------------------------------------------------------------
  // Build
  // ------------------------------------------------------------------
  function buildAll() {
    const reg = registry();
    const defs = PV.defs
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const def of defs) {
      const t0 = performance.now();
      const ctx = K.ctx(def.id, def.interior);
      ctx.def = def;
      try {
        def.build(ctx);
      } catch (e) {
        G.reportError("poi_village:build " + def.id, e);
      }
      if (ctx.extRoot && !ctx.extRoot.parent) G.scene.add(ctx.extRoot);
      if (ctx.intRoot && !ctx.intRoot.parent) G.scene.add(ctx.intRoot);
      if (ctx.intRoot) ctx.intRoot.visible = false;
      CTX.push(ctx);
      reg[def.id] = {
        id: def.id,
        root: ctx.extRoot || null,
        interiorRoot: ctx.intRoot || null,
        interiorKey: def.interior,
        anchors: ctx.anchors,
        name: def.name,
      };
      // also reachable by its LAYOUT site / interior key (chelsea_hotel, village_vanguard, katz_deli) — non-enumerable
      // so registry walkers (G.pois.list, getAnchor) still see each POI once
      if (def.interior && def.interior !== def.id && !(def.interior in reg)) {
        try {
          Object.defineProperty(reg, def.interior, {
            value: reg[def.id],
            enumerable: false,
            configurable: true,
            writable: true,
          });
        } catch (e) {
          /* ignore */
        }
      }
      ctx.buildMs = Math.round(performance.now() - t0);
    }
    // clutter & decay pass over the finished interiors (96_decay.js → G.poiClutter)
    {
      const t0 = performance.now();
      K.safe("decay", () => PV.decay && PV.decay(CTX));
      PV.decayMs = Math.round(performance.now() - t0);
    }
    K.refreshAtlases();
    bridgeCombatAnchors();
    detailLOD();
  }
  /**
   * Combat currently places interior LOCATIONS spawns via G.map.getAnchor(interiorKey, 'spawnN') only
   * (G.pois.getAnchor is not consulted yet). Expose our authored spots there too — add-only, never
   * overwriting an area the map module owns — so Katz's / Chinatown / Tombs hostiles appear in the rooms
   * we built for them instead of around the arrival door.
   */
  /**
   * Distance culling for the street exteriors (perf budget): small merged meshes (signage, neon, trims, props,
   * glow points) are hidden beyond ~330 m (the root itself is toggled by update() for indoors/outdoors).
   */
  function detailLOD() {
    K.safe("detailLOD", () => {
      if (!G.world || typeof G.world.addLOD !== "function") return;
      for (const ctx of CTX) {
        const root = ctx.extRoot;
        if (!root) continue;
        root.traverse((o) => {
          if (o === root || !(o.isMesh || o.isPoints) || !o.geometry) return;
          const g = o.geometry;
          if (!g.boundingSphere) g.computeBoundingSphere();
          const n = g.attributes.position ? g.attributes.position.count : 0;
          if (o.isPoints || n < 2500)
            G.world.addLOD(
              o,
              330 + g.boundingSphere.radius,
              g.boundingSphere.center.clone(),
            );
        });
      }
    });
  }
  function bridgeCombatAnchors() {
    K.safe("bridgeAnchors", () => {
      if (
        G.isStub("map") ||
        !G.map ||
        !G.map.anchors ||
        typeof G.map.anchors !== "object"
      )
        return;
      for (const ctx of CTX) {
        const key = ctx.def.interior;
        if (!key || G.map.anchors[key]) continue;
        const loc = (G.LAYOUT.LOCATIONS || []).find(
          (l) => l.interior === key && l.hostile,
        );
        if (!loc) continue;
        const out = {};
        for (const n of [
          "spawn1",
          "spawn2",
          "spawn3",
          "spawn4",
          "spawn5",
          "spawn6",
          "boss",
          "entrance",
        ])
          if (ctx.anchors[n]) out[n] = ctx.anchors[n];
        G.map.anchors[key] = out;
      }
    });
  }

  // ------------------------------------------------------------------
  // Data (items / terminals / dialogues / quests) — after every module's init
  // ------------------------------------------------------------------
  function initData() {
    if (dataDone) return;
    dataDone = true;
    for (const ctx of CTX) {
      try {
        if (ctx.def.data) ctx.def.data(ctx);
      } catch (e) {
        G.reportError("poi_village:data " + ctx.id, e);
      }
      for (const t of ctx.terminals)
        K.safe("terminal " + t.id, () => {
          if (!G.isStub("terminals") && G.terminals.register)
            G.terminals.register(t.id, t.def);
        });
      for (const n of ctx.notes) {
        K.safe("note " + n.id, () => {
          if (G.isStub("items") || !G.items.define) return;
          K.defineItem({
            id: n.id,
            type: n.type || "note",
            name: n.name,
            title: n.title || n.name,
            text: n.text,
            weight: 0,
            value: n.value || 0,
            desc: n.desc,
            learn: n.learn,
          });
          if (n.learn) [].concat(n.learn).forEach((lk) => K.learnOn(n.id, lk));
          if (G.items.spawnPickup)
            G.items.spawnPickup(
              n.id,
              1,
              new THREE.Vector3(n.x, n.y + 0.02, n.z),
              { static: true, keepY: true, yaw: n.yaw || 0.3 },
            );
        });
      }
    }
  }

  // ------------------------------------------------------------------
  // Dynamic content
  // ------------------------------------------------------------------
  function spawnLoot() {
    clearLoot();
    if (G.isStub("props") || !G.props.spawn) return;
    for (const ctx of CTX) {
      ctx.loot.forEach((l, i) => {
        if (l.cond && !K.safe("lootcond", l.cond)) return;
        K.safe("loot " + ctx.id + " " + l.type, () => {
          const o = Object.assign({}, l);
          delete o.cond;
          delete o.world;
          delete o.tag;
          o.id = "pv_" + ctx.id + "_" + i + "_" + l.type;
          o.persistent = false;
          const h = G.props.spawn(l.type, o);
          if (h) {
            spawnedLoot.push(h);
            if (l.tag) (ctx.tagged[l.tag] = ctx.tagged[l.tag] || []).push(h);
          }
        });
      });
    }
  }
  function clearLoot() {
    for (const h of spawnedLoot)
      K.safe("unloot", () => {
        if (h.remove) h.remove();
        else if (h.object3d && h.object3d.parent)
          h.object3d.parent.remove(h.object3d);
      });
    spawnedLoot = [];
    for (const ctx of CTX) ctx.tagged = {};
  }
  function spawnDynamic() {
    spawnLoot();
    for (const ctx of CTX) {
      try {
        if (ctx.def.spawn) ctx.def.spawn(ctx);
      } catch (e) {
        G.reportError("poi_village:spawn " + ctx.id, e);
      }
    }
  }
  PV.unlockTagged = function (poiId, tag) {
    const ctx = CTX.find((c) => c.id === poiId);
    if (!ctx) return 0;
    let n = 0;
    for (const h of (ctx.tagged && ctx.tagged[tag]) || []) {
      K.safe("unlock", () => {
        if (h.container) {
          h.container.locked = 0;
          n++;
        }
        if (h.record && h.record.cdef) h.record.cdef.locked = 0;
      });
    }
    // containers declare a G.locks spec: mark it open in the shared registry too (saved by the locks module)
    for (const l of ctx.loot)
      if (l.tag === tag && l.lock && l.lock.id) K.lockUnlock(l.lock.id);
    return n;
  };
  /** Spawn an actor with a stable id (combat restores saved state for stable ids). */
  PV.spawnActor = function (ctx, def) {
    if (G.isStub("actors") || !G.actors.spawn) return null;
    return K.safe("actor " + def.id, () => {
      const ex = G.actors.get && G.actors.get(def.id);
      if (ex && !ex.removed && !ex._removed) return ex;
      const d = Object.assign({}, def);
      if (d.home === "here")
        d.home = { x: d.pos.x, z: d.pos.z, r: d.homeR || 3 };
      const a = G.actors.spawn(d);
      if (a) {
        (ctx.actors = ctx.actors || []).push(a);
        if (def.lookYaw !== undefined) a.yaw = def.lookYaw;
      }
      return a;
    });
  };

  // ------------------------------------------------------------------
  // Update: visibility + per-POI animation
  // ------------------------------------------------------------------
  const _cam = new THREE.Vector3();
  let visT = 0;
  function update(dt, realDt) {
    const cam = G.camera
      ? G.camera.getWorldPosition(_cam)
      : G.player && G.player.pos;
    if (!cam) return;
    const inside = cam.x >= G.LAYOUT.INTERIOR_X_MIN;
    visT -= realDt;
    const force = visT <= 0;
    for (const ctx of CTX) {
      if (ctx.extRoot) ctx.extRoot.visible = !inside;
      if (ctx.intRoot) {
        const vis =
          inside &&
          Math.abs(cam.x - ctx.O.x) < 170 &&
          Math.abs(cam.z - ctx.O.z) < 170;
        if (vis !== ctx.intRoot.visible || force) ctx.intRoot.visible = vis;
        ctx.inside = vis;
      }
      if (ctx.def.update) {
        try {
          ctx.def.update(dt, realDt, ctx);
        } catch (e) {
          G.reportError("poi_village:update " + ctx.id, e);
        }
      }
    }
    if (force) visT = 0.5;
  }

  // ------------------------------------------------------------------
  // Events & save
  // ------------------------------------------------------------------
  G.events.on("initDone", () => {
    K.safe("initData", initData);
    K.safe("voidGuard", () => {
      if (!G.poiVoidGuard) return;
      const doors = (G.world.doors || []).reduce((a, d) => {
        const f = d.def || d;
        if (f.pos) a.push(f.pos);
        if (f.target) a.push(f.target);
        return a;
      }, []);
      for (const ctx of CTX)
        if (ctx.key && G.LAYOUT.INTERIORS[ctx.key]) {
          const o = G.LAYOUT.INTERIORS[ctx.key].origin;
          G.poiVoidGuard(o.x, o.z, { parent: ctx.intRoot, doors });
        }
    });
  });
  G.events.on("newGame", () => {
    K.safe("spawn", spawnDynamic);
  });
  G.events.on("loaded", () => {
    K.safe("spawn", spawnDynamic);
  });
  G.events.on("reset", () => {
    clearLoot();
    PV.state = DEFAULT_STATE();
    for (const ctx of CTX) {
      ctx.actors = [];
      if (ctx.def.reset) K.safe("reset " + ctx.id, () => ctx.def.reset(ctx));
    }
  });
