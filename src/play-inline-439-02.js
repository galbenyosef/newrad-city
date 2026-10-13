// play-inline-439 02 — ctx
// Lines 20-332 of readable/play-inline-439.pretty.js (statement-aligned).
  const PK = G._ppk;
  const K = PK.kit;

  const CTX = []; // built POI contexts
  PK.ctxs = CTX;
  PK.state = {}; // saved state (flags per POI)
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
  PK.anchor = function (poiId, name) {
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
          owner: "poi_park",
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
    const defs = PK.defs
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const def of defs) {
      const t0 = performance.now();
      const ctx = K.ctx(def.id, def.interior);
      ctx.def = def;
      // Interior cells have an invisible walkable plane at y 0 (terrainHeight() returns 0 for every x >= INTERIOR_X_MIN),
      // so nothing walkable may sit below 0: lift the whole cell so its lowest floor (the Ark / the cellar) is above it.
      if (def.lift) ctx.O.y += def.lift;
      try {
        def.build(ctx);
      } catch (e) {
        G.reportError("poi_park:build " + def.id, e);
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
        owner: "poi_park",
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
        G.reportError("poi_park:data " + ctx.id, e);
      }
      for (const t of ctx.terminals)
        K.safe("terminal " + t.id, () => {
          const def = t.def || (PK.TERMINALS && PK.TERMINALS[t.id]);
          if (def && !G.isStub("terminals") && G.terminals.register)
            G.terminals.register(t.id, def);
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
          o.id = "ppk_" + ctx.id + "_" + i + "_" + l.type;
          o.persistent = false;
          const h = G.props.spawn(l.type, o);
          if (h && l.lock) PK.lockContainer(h, l.lock);
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
        G.reportError("poi_park:spawn " + ctx.id, e);
      }
    }
  }
  PK.unlockTagged = function (poiId, tag) {
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
    return n;
  };
  /** Spawn an actor with a stable id (combat restores saved state for stable ids). */
  PK.spawnActor = function (ctx, def) {
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
          G.reportError("poi_park:update " + ctx.id, e);
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
    PK.state = DEFAULT_STATE();
    for (const ctx of CTX) {
      ctx.actors = [];
      if (ctx.def.reset) K.safe("reset " + ctx.id, () => ctx.def.reset(ctx));
    }
  });
  G.save.register("poi_park", {
    save: () => JSON.parse(JSON.stringify(PK.state)),
    load: (d) => {
      PK.state = Object.assign(DEFAULT_STATE(), d || {});
      for (const ctx of CTX)
        if (ctx.def.loaded) K.safe("load " + ctx.id, () => ctx.def.loaded(ctx));
    },
  });
  PK.state = DEFAULT_STATE();
  /** Per-POI persistent flag helpers. */
  PK.flag = (k) => PK.state[k];
  PK.setFlag = (k, v) => {
    PK.state[k] = v;
  };

  G.registerModule({
    name: "poi_park",
    order: 29,
    init() {
      const t0 = performance.now();
      buildAll();
      PK.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
