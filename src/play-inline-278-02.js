// play-inline-278 02 — pos
// Lines 14-213 of readable/play-inline-278.pretty.js (statement-aligned).
  const P = G._uw;
  P.onPreReady = P.onPreReady || [];
  P.tick = P.tick || [];
  const IDS = ["ansonia", "san_remo", "bellamys"];

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
  /** Let combat's boss / sniper logic find our anchors through G.landmarks.getAnchor(locId, name). */
  function shareAnchors() {
    if (G.isStub("landmarks") || !G.landmarks) return;
    for (const id of IDS) {
      const p = G.pois && G.pois[id];
      if (!p || G.landmarks[id]) continue;
      try {
        G.landmarks[id] = { id, anchors: p.anchors, owner: "poi_uws" };
      } catch (e) {
        /* frozen namespace */
      }
    }
  }

  // --------------------------------------------------------------
  // Combat scatters interior spawns round the player's arrival point:
  // move them onto the authored anchors (once per actor).
  // --------------------------------------------------------------
  const RELOC = {
    // first entries fill first: Herman's den (2A, unique bat) and 1B's nest are guarded even by a small group
    ansonia: {
      maniac: ["spawn6", "spawn5", "spawn1", "spawn4", "spawn2", "spawn3"],
      maniac_bruiser: ["spawn2"],
      "*": ["spawn6", "spawn3"],
    },
    // the reward floor (3: Toby's cage, the office, the boss) fills first — spawn4/spawn5 are on L3
    bellamys: {
      raider: ["spawn4", "spawn1", "spawn5", "spawn2", "spawn3", "spawn6"],
      "*": ["spawn5", "spawn2"],
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
        if (!a || a.dead || a._uwPlaced || a.group !== key || !a.pos) continue;
        a._uwPlaced = true;
        if (a.isBoss && poi.anchors.boss && key === "bellamys") {
          P.content &&
            P.content.onBoss &&
            P.safe("boss", () => P.content.onBoss(key, a));
          continue;
        }
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
    for (const fn of list) P.safe(where, () => fn(arg));
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
  G.save.register("poi_uws", {
    save() {
      const out = {};
      for (const k in P.saveHooks) {
        try {
          out[k] = P.saveHooks[k].save();
        } catch (e) {
          G.reportError("poi_uws:save " + k, e);
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
          G.reportError("poi_uws:load " + k, e);
        }
      }
    },
  });

  let fixT = 0,
    t = 0;
  G.registerModule({
    name: "poi_uws",
    order: 29.3,
    init() {
      P.builders.sort((a, b) => a.order - b.order);
      for (const bd of P.builders) {
        const t0 = performance.now();
        P.safe("build:" + bd.id, () => bd.fn());
        P.buildTimes = P.buildTimes || {};
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
      for (const fn of P.tick) P.safe("tick", () => fn(dt, realDt, t));
    },
  });
