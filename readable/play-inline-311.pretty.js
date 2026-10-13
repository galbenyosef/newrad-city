/* src/poi_eastside/90_main.js */
/* =====================================================================
 * NEW RAD CITY — POI EASTSIDE · 90 module registration
 * order 29 (POI wave 2). Builds the three POIs in init, spawns queued
 * props / pickups / containers at initDone, runs lifecycle hooks, shows
 * interior roots only while the player is inside their cell (±170 m),
 * hides the exterior roots while indoors, runs the animators (globe,
 * presses, neon), shares interior anchors with the map / landmarks
 * registries (combat reads spawnN / boss from there) and places combat's
 * location spawns on the authored anchors.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pe) return;
  const P = G._pe;
  const IDS = ["journal_bldg", "tudor_city", "new_york_life"];

  // --------------------------------------------------------------
  // Queued world content
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
  /** Share anchors: G.map.anchors[interiorKey] (combat's interior spawnN) and G.landmarks[id] (boss / npc anchors). */
  function shareAnchors() {
    for (const id of IDS) {
      const p = G.pois && G.pois[id];
      if (!p) continue;
      try {
        if (!G.isStub("map") && G.map.anchors && !G.map.anchors[p.interiorKey])
          G.map.anchors[p.interiorKey] = p.interiorAnchors || p.anchors;
      } catch (e) {
        /* optional */
      }
      try {
        if (!G.isStub("landmarks") && G.landmarks && !G.landmarks[id])
          G.landmarks[id] = {
            id,
            anchors: p.interiorAnchors || p.anchors,
            owner: "poi_eastside",
          };
      } catch (e) {
        /* optional */
      }
    }
  }

  // --------------------------------------------------------------
  // Place combat's location spawns onto authored anchors (fallback
  // when combat scattered them around the arrival point).
  // --------------------------------------------------------------
  const RELOC = {
    tudor_city: {
      raider: ["spawn1", "spawn2", "spawn3", "spawn4", "spawn5", "spawn6"],
      "*": ["spawn3", "spawn5"],
    },
    new_york_life: {
      ash_bear: ["spawn1", "spawn3", "spawn5", "spawn2", "spawn4", "spawn6"],
      "*": ["spawn2", "spawn4"],
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
        if (!a || a.dead || a._pePlaced || !a.pos) continue;
        const grp = a.group || a._group;
        if (grp !== key) continue;
        a._pePlaced = true;
        if (P.onSpawnPlaced)
          P.safe("spawnPlaced", () => P.onSpawnPlaced(key, a));
        if (nearAnyAnchor(poi, a.pos, 1.5)) continue;
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
  G.save.register("poi_eastside", {
    save() {
      const out = {};
      for (const k in P.saveHooks) {
        try {
          out[k] = P.saveHooks[k].save();
        } catch (e) {
          G.reportError("poi_eastside:save " + k, e);
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
          G.reportError("poi_eastside:load " + k, e);
        }
      }
    },
  });

  let fixT = 0,
    t = 0;
  G.registerModule({
    name: "poi_eastside",
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
      if (pp) {
        for (const it of P.interiors) {
          const vis =
            Math.abs(pp.x - it.ox) < 170 && Math.abs(pp.z - it.oz) < 170;
          if (it.root.visible !== vis) it.root.visible = vis;
        }
        // exterior roots are pointless while indoors
        const indoors = pp.x >= G.LAYOUT.INTERIOR_X_MIN;
        for (const id of IDS) {
          const p = G.pois && G.pois[id];
          if (p && p.root && p.root.visible === indoors)
            p.root.visible = !indoors;
        }
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
