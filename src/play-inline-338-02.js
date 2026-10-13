// play-inline-338 02 — ctx
// Lines 20-340 of readable/play-inline-338.pretty.js (statement-aligned).
  const PV = G._pev;
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

  /**
   * Compat for combat's interior population: it reads G.map.getAnchor(interiorKey, 'spawnN') and
   * G.landmarks.getAnchor(locId, 'boss') (raider gang boss). Add (never replace) entries for our keys.
   */
  function compatAnchors(def, ctx) {
    const key = def.interior;
    if (!key) return;
    const spawnOnly = {};
    for (const n in ctx.anchors)
      if (/^(spawn\d|entrance)$/.test(n)) spawnOnly[n] = ctx.anchors[n];
    try {
      if (!G.isStub("map") && G.map.anchors && !G.map.anchors[key])
        G.map.anchors[key] = spawnOnly;
    } catch (e) {
      /* optional */
    }
    try {
      if (
        ctx.combatBoss &&
        G.LAYOUT.getLocation(key) &&
        G.landmarks &&
        !G.landmarks.__stub &&
        !G.landmarks[key]
      ) {
        G.landmarks[key] = {
          id: key,
          anchors: Object.assign({ boss: ctx.combatBoss.clone() }, spawnOnly),
          owner: "poi_eastvillage",
        };
      }
    } catch (e) {
      /* optional */
    }
  }

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
      // Interior cells stand on the core's interior "terrain" at y 0 (map: terrainHeight = 0 for x ≥ INTERIOR_X_MIN),
      // so groundHeight can never return a floor below 0: cells with cellars/basements are lifted by def.lift metres.
      if (def.lift) ctx.O.y += def.lift;
      try {
        def.build(ctx);
      } catch (e) {
        G.reportError("poi_eastvillage:build " + def.id, e);
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
        safeRooms: ctx.safeRooms || null,
        name: def.name,
        owner: "poi_eastvillage",
      };
      compatAnchors(def, ctx);
      ctx.buildMs = Math.round(performance.now() - t0);
    }
    K.refreshAtlases();
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
        G.reportError("poi_eastvillage:data " + ctx.id, e);
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
          o.id = "pev_" + ctx.id + "_" + i + "_" + l.type;
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
        G.reportError("poi_eastvillage:spawn " + ctx.id, e);
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
    // G.locks-registered container locks with this tag (opened from a terminal entry)
    for (const l of ctx.loot || [])
      if (l.tag === tag && l.lock && l.lock.id)
        K.safe("unlock lock", () => {
          if (!G.isStub("locks") && G.locks.unlock) {
            G.locks.unlock(l.lock.id);
            n++;
          }
        });
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
          G.reportError("poi_eastvillage:update " + ctx.id, e);
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
  G.save.register("poi_eastvillage", {
    save: () => JSON.parse(JSON.stringify(PV.state)),
    load: (d) => {
      PV.state = Object.assign(DEFAULT_STATE(), d || {});
      for (const ctx of CTX)
        if (ctx.def.loaded) K.safe("load " + ctx.id, () => ctx.def.loaded(ctx));
    },
  });
  PV.state = DEFAULT_STATE();
  /** Per-POI persistent flag helpers. */
  PV.flag = (k) => PV.state[k];
  PV.setFlag = (k, v) => {
    PV.state[k] = v;
  };

  G.registerModule({
    name: "poi_eastvillage",
    order: 29,
    init() {
      const t0 = performance.now();
      buildAll();
      PV.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
