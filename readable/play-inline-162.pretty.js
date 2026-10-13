/* src/poi_uptown/90_main.js */
/* =====================================================================
 * NEW RAD CITY — POI UPTOWN · 90 module registration
 * order 26. Builds every POI in init, spawns persistent props/pickups/
 * containers at initDone, runs lifecycle hooks and animates (fountain,
 * star show, concert lights). Interior-only work (interior root
 * visibility, void guard, decay pass, combat spawns → interior anchors)
 * lives in 90_main_interior.js and runs through the hook lists below.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pu) return;
  const P = G._pu;

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
  /** Give combat's raider-boss / spawn logic our anchors (G.landmarks.getAnchor(locId, name)), without clobbering. */
  function shareAnchors() {
    if (G.isStub("landmarks") || !G.landmarks) return;
    for (const id of [
      "amnh",
      "dakota",
      "plaza_hotel",
      "carnegie_hall",
      "tiffany",
    ]) {
      const p = G.pois && G.pois[id];
      if (!p || G.landmarks[id]) continue;
      G.landmarks[id] = { id, anchors: p.anchors, owner: "poi_uptown" };
    }
  }

  // --------------------------------------------------------------
  // Lifecycle
  // --------------------------------------------------------------
  const run = (list, where, arg) => {
    for (const fn of list) P.safe(where, () => fn(arg));
  };
  // hook lists filled by 90_main_interior.js (interior code lives in *_interior.js files)
  P.onBuilt = P.onBuilt || []; // init, after every builder ran
  P.onInitDone = P.onInitDone || []; // initDone, after spawnQueued/shareAnchors, before onReady
  P.preNewGame = P.preNewGame || []; // newGame, before onNewGame
  P.preUpdate = P.preUpdate || []; // update, before animators: fn(playerPos, dt, realDt)
  P.midUpdate = P.midUpdate || []; // update, after animators, before P.tick: fn(playerPos, dt, realDt)
  G.events.on("initDone", () => {
    run(P.onPreReady || [], "preReady");
    P.safe("spawnQueued", spawnQueued);
    P.safe("shareAnchors", shareAnchors);
    run(P.onInitDone, "initDone");
    run(P.onReady, "ready");
  });
  G.events.on("newGame", (opts) => {
    run(P.preNewGame, "preNewGame", opts || {});
    run(P.onNewGame, "newGame", opts || {});
  });
  G.events.on("reset", (info) => run(P.onReset, "reset", info || {}));
  G.events.on("loaded", (data) => run(P.onLoaded, "loaded", data));
  G.save.register("poi_uptown", {
    save() {
      const out = {};
      for (const k in P.saveHooks) {
        try {
          out[k] = P.saveHooks[k].save();
        } catch (e) {
          G.reportError("poi_uptown:save " + k, e);
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
          G.reportError("poi_uptown:load " + k, e);
        }
      }
    },
  });

  let t = 0;
  G.registerModule({
    name: "poi_uptown",
    order: 26,
    init() {
      P.builders.sort((a, b) => a.order - b.order);
      for (const bd of P.builders) {
        const t0 = performance.now();
        P.safe("build:" + bd.id, () => bd.fn());
        P.buildTimes = P.buildTimes || {};
        P.buildTimes[bd.id] = Math.round(performance.now() - t0);
      }
      // after-build passes (90_main_interior.js: clutter & decay over the interiors, interiors start hidden)
      run(P.onBuilt, "built");
    },
    update(dt, realDt) {
      t += realDt;
      const pp = G.player && G.player.pos;
      for (const fn of P.preUpdate) fn(pp, dt, realDt); // 90_main_interior.js: interior root visibility
      const cam = G.camera && G.camera.position;
      if (cam)
        for (const a of P.animators) {
          const dx = cam.x - a.c.x,
            dz = cam.z - a.c.z;
          if (dx * dx + dz * dz < a.r2)
            P.safe("anim", () => a.fn(t, dt, realDt));
        }
      for (const fn of P.midUpdate) fn(pp, dt, realDt); // 90_main_interior.js: combat spawns → interior anchors
      if (P.tick)
        for (const fn of P.tick) P.safe("tick", () => fn(dt, realDt, t));
    },
  });
})();
