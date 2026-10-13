/* src/poi_civic/90_main.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 90_main.js
 * Module registration (order 29, POI wave 2) + lifecycle for the three
 * Civic Center POIs: Police Headquarters, the Manhattan Municipal
 * Building and Old St. Patrick's Cathedral (+ catacombs).
 *
 * Each POI is assembled from PARTS registered with PC.part(id, {...}):
 *   exterior files  (10_/20_/30_)          → ext(ctx)   street building
 *   interior files  (*_interior.js)        → int(ctx)   interior cell, doors,
 *                                              props, anchors, interior NPCs
 *   content file    (80_content.js)        → data / spawn / update / reset
 * so the exterior and interior streams can own separate files later.
 *
 *   init      → ext() + int() for every POI, doors, colliders
 *   initDone  → items (notes, tape reels, uniques), terminals, dialogues, quests
 *   newGame / loaded → props & containers, named NPCs
 *   reset     → clear everything dynamic, state back to defaults
 *   update    → interior-root visibility, per-POI animation
 * Registry: G.pois[id] = {id, root, interiorRoot, interiorKey, anchors}
 *           G.pois.getAnchor(idOrInteriorKey, name) → Vector3|null
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PC = G._pc;
  const K = PC.kit;

  const CTX = []; // built POI contexts
  PC.ctxs = CTX;
  PC.state = {}; // saved state (flags)
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
    // Sub-basement C-9 (the new-game cryo facility) ↔ Municipal Building service corridor (21_municipal_interior.js)
    if (typeof G.pois.setCryoAccessTarget !== "function")
      G.pois.setCryoAccessTarget = (t) =>
        PC.setCryoAccessTarget ? PC.setCryoAccessTarget(t) : null;
    return G.pois;
  }
  PC.anchor = function (poiId, name) {
    const c = CTX.find((q) => q.id === poiId);
    const a = c && c.anchors[name];
    return a ? a.clone() : null;
  };
  PC.ctx = (poiId) => CTX.find((c) => c.id === poiId) || null;

  /** Call every registered part function `fn` of a POI (in registration order). */
  function each(ctx, fn, ...args) {
    for (const p of ctx.parts) {
      if (typeof p[fn] !== "function") continue;
      try {
        p[fn](ctx, ...args);
      } catch (e) {
        G.reportError("poi_civic:" + fn + " " + ctx.id, e);
      }
    }
  }

  // ------------------------------------------------------------------
  // Build
  // ------------------------------------------------------------------
  function buildAll() {
    const reg = registry();
    const defs = PC.defs
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const def of defs) {
      const t0 = performance.now();
      const ctx = K.ctx(def.id, def.interior);
      ctx.def = def;
      // Interior cells stand on the core's interior "terrain" at y 0 (map: terrainHeight = 0 for x ≥ INTERIOR_X_MIN),
      // so groundHeight can never return a floor below 0: cells with basements are lifted by def.lift metres.
      if (def.lift) ctx.O.y += def.lift;
      ctx.parts = (PC.parts[def.id] || []).slice();
      each(ctx, "ext");
      buildFar(ctx);
      each(ctx, "int");
      if (ctx.dyn && ctx.intRoot) ctx.intRoot.add(ctx.dyn);
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
      // combat resolves interior LOCATION spawns through G.map.getAnchor(interiorKey, 'spawnN'):
      // publish our anchors there too (only if the map has nothing for this cell).
      try {
        if (
          !G.isStub("map") &&
          G.map.anchors &&
          def.interior &&
          !G.map.anchors[def.interior]
        )
          G.map.anchors[def.interior] = ctx.anchors;
      } catch (e) {
        /* optional */
      }
      ctx.buildMs = Math.round(performance.now() - t0);
    }
    K.refreshAtlases();
  }

  /**
   * Distance LOD: a part may provide far(ctx) → a low-poly proxy group. The full exterior becomes
   * ctx.extNear (drawn inside def.detail metres of the site centre), the proxy ctx.extFar (beyond it),
   * both under one ctx.extRoot so the registry / lod gate keep working unchanged.
   */
  function buildFar(ctx) {
    if (!ctx.extRoot || !ctx.def.detail) return;
    let far = null;
    for (const p of ctx.parts)
      if (typeof p.far === "function") {
        try {
          far = p.far(ctx);
        } catch (e) {
          G.reportError("poi_civic:far " + ctx.id, e);
        }
      }
    if (!far) return;
    const root = new THREE.Group();
    root.name = ctx.extRoot.name + "_lod";
    ctx.extNear = ctx.extRoot;
    ctx.extFar = far;
    far.name = ctx.extRoot.name + "_far";
    far.visible = false;
    root.add(ctx.extNear);
    root.add(far);
    ctx.extRoot = root;
  }

  // ------------------------------------------------------------------
  // Data (items / terminals / dialogues / quests) — after every module's init
  // ------------------------------------------------------------------
  function initData() {
    if (dataDone) return;
    dataDone = true;
    for (const ctx of CTX) {
      each(ctx, "data");
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
          o.id = "pc_" + ctx.id + "_" + i + "_" + l.type;
          o.persistent = false;
          const h = G.props.spawn(l.type, o);
          if (h) {
            spawnedLoot.push(h);
            if (l.tag) (ctx.tagged[l.tag] = ctx.tagged[l.tag] || []).push(h);
            reachable(h, l);
          }
        });
      });
    }
  }
  /**
   * Desks and safes: rpg puts a container's "Search" point at 60 % of the mesh height, i.e. INSIDE the prop's
   * own collider (desk top 0.8 m, point 0.56 m), and the core focus test only accepts an occluded point within
   * 1.2 m of the eye — so a desk could only be opened while pressed against its long side, and a wall safe not at
   * all (verified with 95_probe.js). Move the point onto the desk top / the safe's door face.
   */
  function reachable(h, l) {
    if (l.type !== "desk" && l.type !== "safe") return;
    K.safe("reach " + l.type, () => {
      const c = h.container,
        col = h.collider;
      if (!c || !c.pos || !col) return;
      if (l.type === "desk") {
        c.pos.set(col.cx, col.maxY + 0.04, col.cz);
        return;
      }
      const yaw = l.yaw || 0,
        fx = Math.sin(yaw),
        fz = Math.cos(yaw),
        half = Math.min(col.hx, col.hz);
      c.pos.set(
        col.cx + fx * (half + 0.04),
        (col.minY + col.maxY) / 2,
        col.cz + fz * (half + 0.04),
      );
    });
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
    for (const ctx of CTX) K.safe("gates", () => K.gatesSync(ctx));
    for (const ctx of CTX)
      K.safe("traps", () => K.trapsSync && K.trapsSync(ctx));
    for (const ctx of CTX) each(ctx, "spawn");
  }
  /** Spawn an actor with a stable id (combat restores saved state for stable ids). */
  PC.spawnActor = function (ctx, def) {
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
      if (ctx.extRoot) {
        // exterior: hidden indoors, and beyond its LOD radius
        let vis = !inside,
          d = 0;
        const sc = ctx.siteC || (ctx.siteC = siteCentre(ctx.def.id));
        if (sc) d = Math.hypot(cam.x - sc.x, cam.z - sc.z);
        if (vis && ctx.def.lod && sc) vis = d < ctx.def.lod;
        ctx.extRoot.visible = vis;
        if (ctx.extFar && ctx.extNear) {
          // 8 m hysteresis so a camera parked on the threshold does not flicker between the two
          const near =
            !sc ||
            (ctx.extNear.visible
              ? d < ctx.def.detail + 8
              : d < ctx.def.detail - 8);
          ctx.extNear.visible = vis && near;
          ctx.extFar.visible = vis && !near;
        }
      }
      if (ctx.intRoot) {
        const vis =
          inside &&
          Math.abs(cam.x - ctx.O.x) < 170 &&
          Math.abs(cam.z - ctx.O.z) < 170;
        if (vis !== ctx.intRoot.visible || force) ctx.intRoot.visible = vis;
        ctx.inside = vis;
      }
      for (const p of ctx.parts) {
        if (typeof p.update !== "function") continue;
        try {
          p.update(ctx, dt, realDt);
        } catch (e) {
          G.reportError("poi_civic:update " + ctx.id, e);
        }
      }
    }
    if (force) visT = 0.5;
    if (PC.trapsUpdate) {
      try {
        PC.trapsUpdate(dt);
      } catch (e) {
        G.reportError("poi_civic:traps", e);
      }
    }
  }

  function siteCentre(id) {
    const st = G.LAYOUT.getSite && G.LAYOUT.getSite(id);
    return st ? { x: (st.x0 + st.x1) / 2, z: (st.z0 + st.z1) / 2 } : null;
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
    PC.state = DEFAULT_STATE();
    for (const ctx of CTX) {
      ctx.actors = [];
      each(ctx, "reset");
      K.safe("traps", () => K.trapsSync && K.trapsSync(ctx));
    }
  });
  G.save.register("poi_civic", {
    save: () => JSON.parse(JSON.stringify(PC.state)),
    load: (d) => {
      PC.state = Object.assign(DEFAULT_STATE(), d || {});
      for (const ctx of CTX) each(ctx, "loaded");
    },
  });
  PC.state = DEFAULT_STATE();
  /** Persistent flag helpers. */
  PC.flag = (k) => PC.state[k];
  PC.setFlag = (k, v) => {
    PC.state[k] = v;
  };

  G.registerModule({
    name: "poi_civic",
    order: 29,
    init() {
      const t0 = performance.now();
      buildAll();
      PC.initMs = Math.round(performance.now() - t0);
    },
    update,
  });
})();
