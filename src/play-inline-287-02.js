// play-inline-287 02 — anchors
// Lines 16-298 of readable/play-inline-287.pretty.js (statement-aligned).
  const P = G._pt;
  const IDS = ["ed_sullivan", "lyceum_theatre", "port_authority"];

  // --------------------------------------------------------------
  // Queued world content (props / pickups / containers)
  // --------------------------------------------------------------
  function spawnQueued() {
    const haveProps = !G.isStub("props") && typeof G.props.spawn === "function";
    const haveItems =
      !G.isStub("items") && typeof G.items.spawnPickup === "function";
    const haveCont =
      !G.isStub("containers") && typeof G.containers.create === "function";
    for (const S of P.sites) {
      if (haveProps)
        for (const pr of S.props)
          P.safe("prop:" + pr.type, () => {
            pr.handle = G.props.spawn(pr.type, pr.opts);
            if (pr.opts.lock) P.lockContainer(pr.handle, pr.opts.lock);
          });
      if (haveItems)
        for (const pk of S.pickups)
          P.safe("pickup:" + pk.id, () => {
            if (G.items.get && !G.items.get(pk.id)) return;
            pk.handle = G.items.spawnPickup(
              pk.id,
              pk.n,
              pk.pos,
              Object.assign({ static: true, keepY: true }, pk.opts),
            );
          });
      if (haveCont)
        for (const c of S.containers)
          P.safe("container:" + c.name, () => {
            c.handle = G.containers.create(c);
            if (c.lock) P.lockContainer(c.handle, c.lock);
          });
    }
  }
  /** Publish interior anchors for combat: G.map.anchors[key] (spawnN) and G.landmarks[key] (boss) — add, never replace. */
  function shareAnchors() {
    for (const id of IDS) {
      const p = G.pois && G.pois[id];
      if (!p) continue;
      try {
        if (!G.isStub("map") && G.map.anchors && !G.map.anchors[p.interiorKey])
          G.map.anchors[p.interiorKey] = p.anchors;
      } catch (e) {
        /* optional */
      }
      try {
        if (G.landmarks && !G.landmarks.__stub && !G.landmarks[id]) {
          const a = {};
          for (const n in p.anchors)
            if (/^(boss|entrance|spawn\d|npc\d|merchant|guard\d)$/.test(n))
              a[n] = p.anchors[n];
          G.landmarks[id] = { id, anchors: a, owner: "poi_theater" };
        }
      } catch (e) {
        /* optional */
      }
    }
  }

  // --------------------------------------------------------------
  // Move combat's location spawns (random points near the arrival
  // door when no map anchor exists) onto the authored anchors.
  // --------------------------------------------------------------
  const RELOC = {
    ed_sullivan: {
      valet: ["spawn6", "spawn5"],
      patrolman: ["spawn3", "spawn1", "spawn5", "spawn4", "spawn2", "spawn6"],
      "*": ["spawn2", "spawn4", "spawn6"],
    },
    port_authority: {
      raider: ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"],
      "*": ["spawn2", "spawn4"],
    },
  };
  const relocCount = {};
  const FORCE = { ed_sullivan: { valet: "npc_showtime" } };
  const forced = {};
  function nearAnyAnchor(poi, pos, r) {
    const A = poi.anchors;
    for (const k in A) {
      const v = A[k];
      if (
        Math.abs(v.x - pos.x) < r &&
        Math.abs(v.z - pos.z) < r &&
        Math.abs(v.y - pos.y) < 2
      )
        return true;
    }
    return false;
  }
  function fixSpawns() {
    if (G.isStub("actors") || typeof G.actors.list !== "function") return;
    for (const key in RELOC) {
      if (!P.inCell(key)) continue;
      const poi = G.pois && G.pois[key];
      if (!poi) continue;
      for (const a of G.actors.list()) {
        if (!a || a.dead || a._ptPlaced || a.group !== key || !a.pos) continue;
        a._ptPlaced = true;
        const place = (an, r) => {
          a.pos.set(an.x, an.y + 0.05, an.z);
          if (a.char && a.char.root && a.char.root.position !== a.pos)
            a.char.root.position.copy(a.pos);
          a.home = { x: an.x, z: an.z, r: r || 5 };
          if (typeof an.yaw === "number") a.yaw = an.yaw;
        };
        const hooks = () => {
          if (P.onRelocated)
            for (const fn of P.onRelocated)
              P.safe("relocated", () => fn(key, a));
        };
        if (a.isBoss && poi.anchors.boss) {
          place(poi.anchors.boss, 5);
          hooks();
          continue;
        }
        // one actor of a given type always takes a named post (e.g. Mr. Showtime on the stage)
        const force = FORCE[key] && FORCE[key][a.type];
        const fk = key + ":" + a.type,
          prev = forced[fk];
        if (
          force &&
          (!prev || prev.dead || prev.removed) &&
          poi.anchors[force]
        ) {
          forced[fk] = a;
          a._ptForced = true;
          place(poi.anchors[force], 6);
          hooks();
          continue;
        }
        if (nearAnyAnchor(poi, a.pos, 1.5)) {
          hooks();
          continue;
        }
        const list = RELOC[key][a.type] || RELOC[key]["*"];
        const ck = key + ":" + (RELOC[key][a.type] ? a.type : "*");
        const n = (relocCount[ck] = (relocCount[ck] || 0) + 1);
        const an = poi.anchors[list[(n - 1) % list.length]];
        if (!an) continue;
        const jx = n > list.length ? (Math.random() - 0.5) * 3 : 0,
          jz = n > list.length ? (Math.random() - 0.5) * 3 : 0;
        a.pos.set(an.x + jx, an.y + 0.05, an.z + jz);
        if (a.char && a.char.root && a.char.root.position !== a.pos)
          a.char.root.position.copy(a.pos);
        a.home = { x: an.x, z: an.z, r: 7 };
        if (typeof an.yaw === "number") a.yaw = an.yaw;
        hooks();
      }
    }
  }

  // --------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------
  const run = (list, where, arg) => {
    for (const fn of list || []) P.safe(where, () => fn(arg));
  };
  G.events.on("initDone", () => {
    run(P.onPreReady, "preReady");
    P.safe("spawnQueued", spawnQueued);
    P.safe("shareAnchors", shareAnchors);
    run(P.onReady, "ready");
  });
  G.events.on("newGame", (opts) => {
    for (const k in relocCount) delete relocCount[k];
    for (const k in forced) delete forced[k];
    run(P.onNewGame, "newGame", opts || {});
  });
  G.events.on("reset", (info) => {
    for (const k in forced) delete forced[k];
    run(P.onReset, "reset", info || {});
  });
  G.events.on("loaded", (data) => run(P.onLoaded, "loaded", data));
  G.save.register("poi_theater", {
    save() {
      const out = {};
      for (const k in P.saveHooks) {
        try {
          out[k] = P.saveHooks[k].save();
        } catch (e) {
          G.reportError("poi_theater:save " + k, e);
        }
      }
      return out;
    },
    load(d) {
      d = d || {};
      for (const k in P.saveHooks) {
        try {
          P.saveHooks[k].load(d[k]);
        } catch (e) {
          G.reportError("poi_theater:load " + k, e);
        }
      }
    },
  });

  // --------------------------------------------------------------
  // Spawn-fix timing: combat streams a cell's group in ≤ ~1 s after the
  // player arrives (its population tick) — the relocation must happen
  // BEFORE those actors are ever drawn at their fallback spot. On every
  // door transition / teleport / cell change into one of our cells we run
  // fixSpawns at once and then every frame (lateUpdate — after combat's
  // update, before the render) for a short burst window; outside the
  // burst a 0.25 s timer still catches respawns and restores.
  // --------------------------------------------------------------
  let burst = 0;
  function ourCell() {
    for (const k in RELOC) if (P.inCell(k)) return k;
    return null;
  }
  function kick(why) {
    if (!ourCell()) return;
    burst = 4.0; // covers combat's 1 s pop tick + its 0.25 s streaming follow-ups
    P.safe("fixSpawns:" + why, fixSpawns);
  }
  G.events.on("doorTransition", () => kick("door"));
  G.events.on("teleport", () => kick("teleport"));
  G.events.on("atmosInterior", (inside) => {
    if (inside) kick("cell");
  });
  G.events.on("loaded", () => kick("loaded"));
  P.spawnFixBurst = () => burst;

  let fixT = 0,
    t = 0;
  G.registerModule({
    name: "poi_theater",
    order: 29,
    init() {
      P.builders.sort((a, b) => a.order - b.order);
      P.buildTimes = {};
      for (const bd of P.builders) {
        const t0 = performance.now();
        P.safe("build:" + bd.id, () => bd.fn());
        P.buildTimes[bd.id] = Math.round(performance.now() - t0);
      }
      for (const it of P.interiors) it.root.visible = false;
    },
    update(dt, realDt) {
      t += realDt;
      const pp = G.player && G.player.pos;
      if (pp)
        for (const it of P.interiors) {
          const vis =
            Math.abs(pp.x - it.ox) < 170 && Math.abs(pp.z - it.oz) < 170;
          if (it.root.visible !== vis) it.root.visible = vis;
        }
      const cam = G.camera && G.camera.position;
      if (cam)
        for (const a of P.animators) {
          const dx = cam.x - a.c.x,
            dz = cam.z - a.c.z;
          if (dx * dx + dz * dz < a.r2)
            P.safe("anim", () => a.fn(t, dt, realDt));
        }
      if (P.tick)
        for (const fn of P.tick) P.safe("tick", () => fn(dt, realDt, t));
    },
    lateUpdate(dt, realDt) {
      const pp = G.player && G.player.pos;
      if (!pp || pp.x < G.LAYOUT.INTERIOR_X_MIN) {
        burst = 0;
        return;
      }
      if (burst > 0) {
        burst -= realDt;
        P.safe("fixSpawns", fixSpawns);
        fixT = 0.25;
        return;
      }
      fixT -= realDt;
      if (fixT <= 0) {
        fixT = 0.25;
        P.safe("fixSpawns", fixSpawns);
      }
    },
  });
