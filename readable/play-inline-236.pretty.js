/* src/landmark_interiors/90_main.js */
/* =====================================================================
 * NEW RAD CITY — landmark_interiors / 90_main.js
 * Module registration (order 29.8): builds every interior cell owned by
 * 'landmark_interiors' + the small world-side additions (entrance doors,
 * signage, the 30 Rock observation-deck railing), registers G.pois
 * entries/anchors, spawns props/pickups/terminals at initDone, named
 * NPCs on newGame/loaded, toggles interior visibility, animates, saves.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._li) return;
  const LI = G._li;

  // Interior moods (atmosphere reads MOODS[interiorKey]; we only ADD our own keys, defensively).
  const MOODS = {
    un_assembly: {
      fog: "#141618",
      fogD: 0.006,
      hemiS: "#b8b0a0",
      hemiG: "#3a342c",
      hemiI: 0.55,
      light: "#ffe2b8",
      lightI: 0.25,
      exp: 1.1,
    },
    rockefeller_30rock: {
      fog: "#15120e",
      fogD: 0.008,
      hemiS: "#c8b494",
      hemiG: "#3a3024",
      hemiI: 0.55,
      light: "#ffd8a8",
      lightI: 0.25,
      exp: 1.1,
    },
    nyse_floor: {
      fog: "#16120c",
      fogD: 0.007,
      hemiS: "#c0a888",
      hemiG: "#3a2e22",
      hemiI: 0.5,
      light: "#ffcf98",
      lightI: 0.25,
      exp: 1.12,
    },
    woolworth_lobby: {
      fog: "#161208",
      fogD: 0.008,
      hemiS: "#d0b890",
      hemiG: "#3e3222",
      hemiI: 0.55,
      light: "#ffdcaa",
      lightI: 0.25,
      exp: 1.1,
    },
    city_hall_rotunda: {
      fog: "#14130f",
      fogD: 0.008,
      hemiS: "#c8c0ac",
      hemiG: "#3a362c",
      hemiI: 0.55,
      light: "#fff0d0",
      lightI: 0.25,
      exp: 1.1,
    },
    flatiron_interior: {
      fog: "#15120d",
      fogD: 0.01,
      hemiS: "#c8b090",
      hemiG: "#3a2e20",
      hemiI: 0.55,
      light: "#ffd8a0",
      lightI: 0.25,
      exp: 1.1,
    },
  };
  function installMoods() {
    try {
      const A = G.atmos && !G.atmos.__stub ? G.atmos._ : null;
      const M = A && A.MOODS;
      if (!M) return;
      for (const k in MOODS) {
        if (M[k]) continue;
        const m = Object.assign({}, MOODS[k]);
        for (const n of ["fog", "hemiS", "hemiG", "light"])
          m[n] = new THREE.Color(m[n]);
        M[k] = m;
      }
    } catch (e) {
      /* atmosphere absent or changed: default mood */
    }
  }

  // ------------------------------------------------------------------
  // Registry (CONTRACT: G.pois shared namespace + getAnchor over every POI)
  // ------------------------------------------------------------------
  function registerPois() {
    G.pois = G.pois && !G.pois.__stub ? G.pois : {};
    if (typeof G.pois.getAnchor !== "function") {
      G.pois.getAnchor = function (idOrKey, name) {
        for (const k in G.pois) {
          const p = G.pois[k];
          if (!p || typeof p !== "object" || !p.anchors) continue;
          if (p.id !== idOrKey && p.interiorKey !== idOrKey) continue;
          const v = p.anchors[name];
          if (v) {
            const c = v.clone();
            c.yaw = v.yaw || 0;
            return c;
          }
        }
        return null;
      };
    }
    for (const C of LI.cells) {
      const id = C.poiId || C.key;
      G.pois[id] = {
        id,
        name: C.def ? C.def.name : id,
        root: C.worldRoot || null,
        interiorRoot: C.root,
        interiorKey: C.key,
        anchors: C.anchors,
        owner: "landmark_interiors",
        site: C.site || null,
      };
      // compat: combat's interior population reads G.map.getAnchor(interiorKey, 'spawnN'); raider bosses use
      // G.landmarks.getAnchor(locId, 'boss'). Add (never replace) entries for our keys.
      try {
        if (!G.isStub("map") && G.map.anchors && !G.map.anchors[C.key])
          G.map.anchors[C.key] = C.anchors;
      } catch (e) {
        /* optional */
      }
      try {
        if (
          G.LAYOUT.getLocation(C.key) &&
          G.landmarks &&
          !G.landmarks.__stub &&
          !G.landmarks[C.key]
        ) {
          // boss/entrance/spawnN + the main story's anchors (the quests' L.anchor treats a G.landmarks entry as authoritative).
          // Never names props' anchorContainers() turns into containers (loot*, *desk*, *safe*, *locker* …).
          const a = {};
          for (const n in C.anchors)
            if (
              /^(boss|entrance|spawn\d|booth_four|booth_four_console|records|ledger|strongroom|security_council|sky_eye_room|officer|rostrum|booths|scope_room|war_room|dalca)$/.test(
                n,
              )
            )
              a[n] = C.anchors[n];
          G.landmarks[C.key] = {
            id: C.key,
            anchors: a,
            owner: "landmark_interiors",
          };
        }
        // the main story looks the Sky-Eye monitor desk up on the UN Plaza site (un_hq, landmarks_a): lend it ours
        if (
          C.anchors.sky_eye_room &&
          G.landmarks &&
          G.landmarks.un_hq &&
          G.landmarks.un_hq.anchors &&
          !G.landmarks.un_hq.anchors.sky_eye_room
        ) {
          G.landmarks.un_hq.anchors.sky_eye_room = C.anchors.sky_eye_room;
        }
      } catch (e) {
        /* optional */
      }
    }
  }

  // ------------------------------------------------------------------
  // Init: build cells
  // ------------------------------------------------------------------
  function init() {
    const t0 = performance.now();
    installMoods();
    LI.timings = {};
    LI.deferBake = true; // cells are lit in the background after init (finished at once when entered)
    const list = LI.builders.slice().sort((a, b) => a.order - b.order);
    for (const bd of list) {
      const ts = performance.now();
      try {
        bd.build(LI);
      } catch (e) {
        G.reportError("init:landmark_interiors/" + bd.key, e);
      }
      LI.timings[bd.key] = Math.round(performance.now() - ts);
      try {
        G.events.emit(
          "loadingProgress",
          "Furnishing " + bd.key.replace(/_/g, " ") + "…",
          0.35,
        );
      } catch (e) {
        /* */
      }
    }
    for (const C of LI.cells) {
      C.root.visible = false;
      for (const d of C.doors) {
        try {
          d._door = G.world.addDoor(d);
        } catch (e) {
          G.reportError("landmark_interiors:door " + C.key, e);
        }
      }
    }
    for (const C of LI.worldCells || [])
      for (const d of C.doors) {
        try {
          d._door = G.world.addDoor(d);
        } catch (e) {
          G.reportError("landmark_interiors:door", e);
        }
      }
    registerPois();
    LI.initMs = Math.round(performance.now() - t0);
  }

  // ------------------------------------------------------------------
  // initDone: items, terminals, dialogues, quests, then props & pickups
  // ------------------------------------------------------------------
  let readyDone = false;
  function spawnStatic(C) {
    const haveProps = !G.isStub("props") && typeof G.props.spawn === "function";
    C.handles = C.handles || {};
    for (const p of C.props) {
      if (!haveProps) break;
      try {
        const o = Object.assign(
          {
            x: C.O.x + p.x,
            y: (C.O.y || 0) + p.y,
            z: C.O.z + p.z,
            yaw: p.yaw,
            persistent: true,
            id:
              "li:" +
              C.key +
              ":" +
              (p.o.handle || p.type) +
              "@" +
              p.x.toFixed(1) +
              "," +
              p.z.toFixed(1),
          },
          p.o,
        );
        delete o.handle;
        delete o.onSpawn;
        const h = G.props.spawn(p.type, o);
        if (p.o.handle) C.handles[p.o.handle] = h;
        if (p.o.onSpawn) p.o.onSpawn(h);
      } catch (e) {
        G.reportError("landmark_interiors:prop " + p.type, e);
      }
    }
    if (!G.isStub("items") && G.items.spawnPickup) {
      for (const k of C.pickups) {
        try {
          if (G.items.get && !G.items.get(k.id)) continue;
          G.items.spawnPickup(
            k.id,
            k.n,
            new THREE.Vector3(C.O.x + k.x, (C.O.y || 0) + k.y, C.O.z + k.z),
            { yaw: k.yaw, static: true, keepY: true },
          );
        } catch (e) {
          G.reportError("landmark_interiors:pickup " + k.id, e);
        }
      }
    }
    for (const g of C.glows) {
      try {
        const pos = new THREE.Vector3(
          C.O.x + g.x,
          (C.O.y || 0) + g.y,
          C.O.z + g.z,
        );
        if (g.o.fixture && !G.isStub("atmos") && G.atmos.addFixtureLight)
          G.atmos.addFixtureLight(
            pos,
            g.color,
            Object.assign({ glowSize: g.size }, g.o),
          );
        else if (!G.isStub("fx") && G.fx.glowSprite)
          G.fx.glowSprite(
            pos,
            g.color,
            g.size,
            Object.assign({ dayFactor: 1 }, g.o),
          );
      } catch (e) {
        /* optional */
      }
    }
  }
  function onReady() {
    if (readyDone) return;
    readyDone = true;
    for (const fn of LI.readyFns) {
      try {
        fn();
      } catch (e) {
        G.reportError("landmark_interiors:ready", e);
      }
    }
    for (const C of LI.cells.concat(LI.worldCells || [])) spawnStatic(C);
  }

  // ------------------------------------------------------------------
  // Dynamic lifecycle (named NPCs etc.)
  // ------------------------------------------------------------------
  function spawnDynamic(opts) {
    for (const fn of LI.spawnFns) {
      try {
        fn(opts || {});
      } catch (e) {
        G.reportError("landmark_interiors:spawn", e);
      }
    }
  }
  G.events.on("initDone", onReady);
  G.events.on("reset", () => {
    for (const fn of LI.resetFns) {
      try {
        fn();
      } catch (e) {
        G.reportError("landmark_interiors:reset", e);
      }
    }
  });
  G.events.on("newGame", (o) => {
    if (!readyDone) onReady();
    spawnDynamic(Object.assign({ newGame: true }, o || {}));
  });
  G.events.on("loaded", () => {
    if (!readyDone) onReady();
    spawnDynamic({ loaded: true });
  });

  // Save state: each interior contributes through LI.saveHooks[key] = {save(), load(d), reset()}
  try {
    if (G.save && typeof G.save.register === "function") {
      G.save.register("landmark_interiors", {
        save() {
          const o = {};
          for (const k in LI.saveHooks) {
            try {
              o[k] = LI.saveHooks[k].save();
            } catch (e) {
              /* */
            }
          }
          return o;
        },
        load(d) {
          d = d || {};
          for (const k in LI.saveHooks) {
            try {
              LI.saveHooks[k].load(d[k]);
            } catch (e) {
              G.reportError("landmark_interiors:load " + k, e);
            }
          }
        },
      });
    }
  } catch (e) {
    /* core without save */
  }
  LI.resetFns.push(() => {
    for (const k in LI.saveHooks) {
      try {
        if (LI.saveHooks[k].reset) LI.saveHooks[k].reset();
      } catch (e) {
        /* */
      }
    }
  });

  // ------------------------------------------------------------------
  // Per-frame: interior visibility (only the cell the player/camera is in) + animators
  // ------------------------------------------------------------------
  const _cp = new THREE.Vector3();
  let t = 0,
    bakeT = 0,
    bakeNext = null,
    bakeD = 1e9,
    shaftT = 0;
  /** Doors whose target lies in one of our cells (world entrances, elevators, loops): {pos, C}. */
  let doorsInto = null;
  function nearestUnlit() {
    if (!doorsInto) {
      doorsInto = [];
      for (const D of LI.cells.concat(LI.worldCells || []))
        for (const d of D.doors) {
          const tg = d.target;
          if (!tg || !d.pos) continue;
          const C = LI.cells.find(
            (c) => Math.abs(tg.x - c.O.x) < 170 && Math.abs(tg.z - c.O.z) < 170,
          );
          if (C) doorsInto.push({ pos: d.pos, C });
        }
    }
    const P = G.player && G.player.pos;
    let best = null;
    bakeD = 1e9;
    for (const e of doorsInto) {
      if (e.C.lit) continue;
      const d = P
        ? Math.hypot(P.x - e.pos.x, P.z - e.pos.z) +
          Math.abs(P.y - e.pos.y) * 0.5
        : 0;
      if (d < bakeD) {
        bakeD = d;
        best = e.C;
      }
    }
    if (!best) best = LI.cells.find((c) => !c.lit) || null;
    return best;
  }
  function update(dt, realDt) {
    t += realDt;
    const P = G.player && G.player.pos;
    if (G.camera) G.camera.getWorldPosition(_cp);
    for (const C of LI.cells) {
      const inP =
        P && Math.abs(P.x - C.O.x) < 170 && Math.abs(P.z - C.O.z) < 170;
      const inC =
        Math.abs(_cp.x - C.O.x) < 170 && Math.abs(_cp.z - C.O.z) < 170;
      const vis = !!(inP || inC);
      if (vis && !C.lit) C.lit = LI.bakeCell(C); // entering an unlit cell: finish its bake now
      if (C.root.visible !== vis) C.root.visible = vis;
      C.active = vis;
    }
    // background baking, nearest cell first: the unlit cell with a door (into it) closest to the player gets the
    // slice; approaching such a door (or aiming at it) raises the budget so the bake is done before the fade ends
    bakeT -= realDt;
    if (bakeT <= 0 || !bakeNext || bakeNext.lit) {
      bakeT = 0.5;
      bakeNext = nearestUnlit();
    }
    if (bakeNext) {
      const f = G.world && G.world.focus,
        fd = f && f.def && f.def.target;
      const focusIn =
        fd &&
        Math.abs(fd.x - bakeNext.O.x) < 170 &&
        Math.abs(fd.z - bakeNext.O.z) < 170;
      bakeNext.lit = LI.bakeCell(bakeNext, focusIn ? 14 : bakeD < 18 ? 8 : 3);
    }
    if (LI.dustTick) LI.dustTick(t);
    shaftT -= realDt;
    if (shaftT <= 0 && LI.shaftTick) {
      shaftT = 0.25;
      try {
        LI.shaftTick();
      } catch (e) {
        /* optional */
      }
    }
    for (const a of LI.animators) {
      if (a.cell && !a.cell.active) continue;
      try {
        a.fn(dt, t, realDt);
      } catch (e) {
        G.reportError("update:landmark_interiors", e);
        LI.animators.splice(LI.animators.indexOf(a), 1);
        break;
      }
    }
  }

  G.registerModule({ name: "landmark_interiors", order: 29.8, init, update });
})();
