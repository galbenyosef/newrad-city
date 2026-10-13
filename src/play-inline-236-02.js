// play-inline-236 02 — anchors
// Lines 15-348 of readable/play-inline-236.pretty.js (statement-aligned).
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
