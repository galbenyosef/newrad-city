/* src/poi_ues/90_main.js */
/* =====================================================================
 * NEW RAD CITY — POI UPPER EAST SIDE · 90 module registration
 * order 29. Builds the four POIs in init, spawns persistent props /
 * pickups / containers at initDone, runs lifecycle hooks, hides each
 * interior root unless the player is inside its cell (±170 m), runs the
 * animators (fountains, flicker, flags) and makes sure combat's location
 * spawns land on this module's authored interior anchors (spawn1..6):
 *   - publishes them as G.map.anchors[interiorKey] (combat reads
 *     G.map.getAnchor(interior, 'spawnN') for interior locations) when
 *     the map module exposes that table and has no entry of its own;
 *   - and, as a fallback, relocates any group member that spawned away
 *     from every anchor (same approach as poi_uptown).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._ues) return;
  const P = G._ues;
  const IDS = ["frick", "cooper_hewitt", "gracie_mansion", "park_ave_armory"];

  // --------------------------------------------------------------
  // Spawn queued world content (props / pickups / containers)
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
  /** Share anchors with combat (boss placement reads G.landmarks.getAnchor(locId,'boss')) and the map's interior anchor table. */
  function shareAnchors() {
    if (!G.isStub("landmarks") && G.landmarks) {
      for (const id of IDS) {
        const p = G.pois && G.pois[id];
        if (!p || G.landmarks[id]) continue;
        const an = Object.assign({}, p.anchors);
        if (p.noCombatBoss) delete an.boss;
        G.landmarks[id] = { id, anchors: an, owner: "poi_ues" };
      }
    }
    if (
      !G.isStub("map") &&
      G.map &&
      G.map.anchors &&
      typeof G.map.anchors === "object"
    ) {
      for (const id of IDS) {
        const p = G.pois && G.pois[id];
        if (!p || !p.interiorKey || G.map.anchors[p.interiorKey]) continue;
        const out = {};
        for (let i = 1; i <= 6; i++) {
          const v = p.anchors["spawn" + i];
          if (v) out["spawn" + i] = v.clone();
        }
        if (Object.keys(out).length) G.map.anchors[p.interiorKey] = out;
      }
    }
  }

  // --------------------------------------------------------------
  // Fallback: move location spawns that landed off-anchor onto anchors
  // --------------------------------------------------------------
  const RELOC = {
    frick: {
      "*": ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"],
    },
    cooper_hewitt: {
      "*": ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"],
    },
    park_ave_armory: {
      "*": ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"],
    },
  };
  const relocCount = {};
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
        if (!a || a.dead || a._uesPlaced || a.group !== key || !a.pos) continue;
        a._uesPlaced = true;
        if (nearAnyAnchor(poi, a.pos, 2.5)) continue;
        const list = RELOC[key][a.type] || RELOC[key]["*"];
        const n = (relocCount[key] = (relocCount[key] || 0) + 1);
        const an = poi.anchors[list[(n - 1) % list.length]];
        if (!an) continue;
        const jx = n > list.length ? (Math.random() - 0.5) * 3 : 0,
          jz = n > list.length ? (Math.random() - 0.5) * 3 : 0;
        a.pos.set(an.x + jx, an.y + 0.05, an.z + jz);
        if (a.char && a.char.root && a.char.root.position !== a.pos)
          a.char.root.position.copy(a.pos);
        a.home = { x: an.x, z: an.z, r: 7 };
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
    run(P.onNewGame, "newGame", opts || {});
  });
  G.events.on("reset", (info) => run(P.onReset, "reset", info || {}));
  G.events.on("loaded", (data) => run(P.onLoaded, "loaded", data));
  if (G.save && typeof G.save.register === "function") {
    G.save.register("poi_ues", {
      save() {
        const out = {};
        for (const k in P.saveHooks) {
          try {
            out[k] = P.saveHooks[k].save();
          } catch (e) {
            G.reportError("poi_ues:save " + k, e);
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
            G.reportError("poi_ues:load " + k, e);
          }
        }
      },
    });
  }

  let fixT = 0,
    t = 0;
  G.registerModule({
    name: "poi_ues",
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
      fixT -= realDt;
      if (fixT <= 0) {
        fixT = 0.25;
        if (pp && pp.x >= G.LAYOUT.INTERIOR_X_MIN)
          P.safe("fixSpawns", fixSpawns);
      }
      if (P.tick)
        for (const fn of P.tick) P.safe("tick", () => fn(dt, realDt, t));
    },
  });
})();
