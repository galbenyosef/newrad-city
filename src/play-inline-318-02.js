// play-inline-318 02 — ctx
// Lines 20-366 of readable/play-inline-318.pretty.js (statement-aligned).
  const PH = G._ph;
  const K = PH.kit;

  // ------------------------------------------------------------------
  // Locks (read by the site builders in init). Every unlock is placed in this module:
  //   ph_ny_elev          key ph_ny_elev_key (Bell Captain's Lockbox / Security Locker) — or the front-desk teletype override
  //   ph_ny_stairs        code 3300   the bellhop roster note (staff room)
  //   ph_ny_lockbox       code 1930   the bellhop roster note
  //   ph_ny_term_desk     passcode MOONBALL  the bellhop roster note
  //   ph_ny_term_security passcode PIGEONPOST  Mr. Voorhees's complaint letter (lobby)
  //   ph_ny_sec_locker    code 7633   the floor-33 security teletype
  //   ph_ny_term_lab      passcode SMILJAN  the floor-33 security teletype
  //   ph_ny_exhibit_safe  code 0710   the lab teletype
  //   ph_dn_strongbox     code 2204   Spiro's order pad (diner kitchen)
  // ------------------------------------------------------------------
  PH.LOCKS = {
    ny_elev: {
      id: "ph_ny_elev",
      label: "Elevator Car 3 — 33rd Floor",
      kind: "door",
      key: "ph_ny_elev_key",
      hint: "The bell captain's lockbox in the lobby; or restore car 3 from the front-desk teletype.",
    },
    ny_stairs: {
      id: "ph_ny_stairs",
      label: "Stair B — 33rd Floor",
      kind: "door",
      code: "3300",
      hint: "The bellhop roster in the staff room.",
    },
    ny_lockbox: {
      id: "ph_ny_lockbox",
      label: "Bell Captain's Lockbox",
      kind: "safe",
      code: "1930",
      hint: "The bellhop roster in the staff room.",
    },
    ny_term_desk: {
      id: "ph_ny_term_desk",
      label: "Hotel New Yorker Front Desk",
      kind: "terminal",
      passcode: "MOONBALL",
      hint: "The bellhop roster in the staff room.",
    },
    ny_term_security: {
      id: "ph_ny_term_security",
      label: "Meridian Security — Floor 33",
      kind: "terminal",
      passcode: "PIGEONPOST",
      hint: "Mr. Voorhees's complaint letter in the lobby.",
    },
    ny_sec_locker: {
      id: "ph_ny_sec_locker",
      label: "Security Locker",
      kind: "container",
      code: "7633",
      hint: "The floor-33 security teletype.",
    },
    ny_term_lab: {
      id: "ph_ny_term_lab",
      label: "Project Teleforce — Control",
      kind: "terminal",
      passcode: "SMILJAN",
      hint: "The floor-33 security teletype.",
    },
    ny_exhibit_safe: {
      id: "ph_ny_exhibit_safe",
      label: "Exhibit Safe",
      kind: "safe",
      code: "0710",
      hint: "The coil-room teletype.",
    },
    dn_strongbox: {
      id: "ph_dn_strongbox",
      label: "Spiro's Strongbox",
      kind: "container",
      code: "2204",
      hint: "Spiro's order pad in the diner kitchen.",
    },
  };
  for (const k in PH.LOCKS) PH.lockReg(PH.LOCKS[k]);

  const CTX = []; // built POI contexts
  PH.ctxs = CTX;
  PH.state = {}; // saved state (flags per POI)
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
  PH.anchor = function (poiId, name) {
    const c = CTX.find((q) => q.id === poiId);
    const a = c && c.anchors[name];
    return a ? a.clone() : null;
  };

  // ------------------------------------------------------------------
  // Build
  // ------------------------------------------------------------------
  function buildAll() {
    const reg = registry();
    const defs = PH.defs
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    for (const def of defs) {
      const t0 = performance.now();
      const ctx = K.ctx(def.id, def.interior);
      ctx.def = def;
      // Interior cells stand on the core's interior "terrain" at y 0 (terrainHeight = 0 for x ≥ INTERIOR_X_MIN), so
      // groundHeight can never return a floor below 0: cells with a cellar are lifted by def.lift metres (as poi_civic does).
      if (def.lift) ctx.O.y += def.lift;
      try {
        def.build(ctx);
      } catch (e) {
        G.reportError("poi_herald:build " + def.id, e);
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
        G.reportError("poi_herald:data " + ctx.id, e);
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
          o.id = "ph_" + ctx.id + "_" + i + "_" + l.type;
          o.persistent = false;
          const h = G.props.spawn(l.type, o);
          if (h && l.lock) PH.lockContainer(h, l.lock);
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
        G.reportError("poi_herald:spawn " + ctx.id, e);
      }
    }
  }
  PH.unlockTagged = function (poiId, tag) {
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
  PH.spawnActor = function (ctx, def) {
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
        // exterior: hidden indoors, and beyond its LOD radius (small buildings) — checked with the visibility tick
        let vis = !inside;
        if (vis && ctx.def.lod) {
          const sc = ctx.siteC || (ctx.siteC = siteCentre(ctx.def.id));
          if (sc) vis = Math.hypot(cam.x - sc.x, cam.z - sc.z) < ctx.def.lod;
        }
        ctx.extRoot.visible = vis;
      }
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
          G.reportError("poi_herald:update " + ctx.id, e);
        }
      }
    }
    if (force) visT = 0.5;
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
