/* src/map/90_module.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 90 MODULE REGISTRATION & RUNTIME
 * init: ground → terrain override → Central Park → streets → buildings →
 * billboards → Cryo Unit C-9 → subway → dungeons → chunk flush. update:
 * HLOD, city visibility. Everything about the interior cells (blast door
 * API, interior roots / visibility / fixtures, blast & sliding doors, loot
 * in shops / the cryo unit / subway / dungeons, newGame / loaded / save
 * hooks) lives in 90_module_interior.js and is called through M.* hooks.
 * Public API: see NOTES.md.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const MAP = G.map;

  function progress(txt, f) {
    try {
      G.events.emit("loadingProgress", "Map: " + txt, f);
    } catch (e) {
      /* */
    }
  }
  const sleep = () => new Promise((r) => setTimeout(r, 0));

  // -------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------
  MAP.terrainHeight = (x, z) => G.world.terrainHeight(x, z);
  /** Visual ground height (sidewalks are +0.12). Use for placing props. */
  MAP.groundY = (x, z) => G.world.terrainHeight(x, z);
  MAP.sidewalkY = M.SIDEWALK_Y;
  MAP.anchors = M.anchors = M.anchors || {};
  /** Named anchor in an area ('cryo_c9', 'subway') → Vector3 clone or null. */
  MAP.getAnchor = function (area, name) {
    const a = M.anchors[area];
    if (!a) return null;
    const v = a[name];
    return v ? v.clone() : null;
  };
  /** Surface type at (x,z): road | sidewalk | plaza | park | water | ... */
  MAP.surfaceType = function (x, z) {
    const c = M.rasterAt(x, z),
      RC = M.RC;
    return c === RC.WATER
      ? "water"
      : c === RC.ROAD
        ? "road"
        : c === RC.RAISED
          ? "sidewalk"
          : c === RC.PARK || c === 8
            ? "park"
            : c === RC.RAMP
              ? "ramp"
              : c === RC.GRASS
                ? "grass"
                : c === 9
                  ? "stairwell"
                  : "plaza";
  };
  MAP.isStreet = (x, z) =>
    M.rasterAt(x, z) === M.RC.ROAD && G.LAYOUT.isManhattan(x, z);
  MAP.isSidewalk = (x, z) => M.rasterAt(x, z) === M.RC.RAISED;
  /** Random point on a road (or sidewalk if side=true) — handy for spawns/props. */
  MAP.randomStreetPoint = function (rng, sidewalk) {
    rng = rng || Math.random;
    for (let i = 0; i < 60; i++) {
      const R = M.roads,
        useAve = rng() < 0.5;
      let x, z;
      if (useAve) {
        const a = R.avenues[Math.floor(rng() * R.avenues.length)];
        x = a.x + (rng() - 0.5) * (sidewalk ? a.width : a.road - 1);
        z = a.z0 + rng() * (a.z1 - a.z0);
      } else {
        const s = R.streets[Math.floor(rng() * R.streets.length)];
        x = s.x0 + rng() * (s.x1 - s.x0);
        z = s.z + (rng() - 0.5) * (sidewalk ? s.width : s.road - 1);
      }
      const c = M.rasterAt(x, z);
      if (sidewalk ? c === M.RC.RAISED : c === M.RC.ROAD)
        return { x, z, y: G.world.terrainHeight(x, z) };
    }
    return null;
  };
  MAP.getLandmarkTargets = function () {
    return G.LAYOUT.SITES.map((s) => ({
      id: s.id,
      name: s.name,
      x: (s.x0 + s.x1) / 2,
      z: (s.z0 + s.z1) / 2,
      height: s.height,
    }));
  };
  MAP.getStorefronts = () => M.shells || [];
  /** City root (Object3D) – hidden automatically while indoors. */
  MAP.getRoots = () => M.roots;

  // -------------------------------------------------------------------
  // Init
  // -------------------------------------------------------------------
  async function init() {
    const T = {};
    const tick = (k, t0) => {
      T[k] = Math.round(performance.now() - t0);
    };
    let t0 = performance.now();
    // pick up façade layout info from the textures module if it publishes one
    try {
      if (!G.isStub("tex") && G.tex.facadeInfo) {
        const fi =
          typeof G.tex.facadeInfo === "function"
            ? G.tex.facadeInfo("tenement")
            : G.tex.facadeInfo;
        if (fi && fi.floors && fi.bays)
          Object.assign(M.FACADE, {
            bays: fi.bays,
            floors: fi.floors,
            bayW: fi.bayW || M.FACADE.bayW,
            floorH: fi.floorH || M.FACADE.floorH,
          });
      }
    } catch (e) {
      /* */
    }
    progress("shoreline & streets", 0.05);
    M.buildGround();
    M.installTerrain();
    tick("ground", t0);
    t0 = performance.now();
    await sleep();
    progress("Central Park", 0.2);
    M.buildPark();
    tick("park", t0);
    t0 = performance.now();
    await sleep();
    progress("street details", 0.35);
    M.buildStreets();
    tick("streets", t0);
    t0 = performance.now();
    await sleep();
    progress("buildings", 0.45);
    // time-sliced: yields to the browser every ~120 ms of work (loading bar keeps moving, no multi-second task)
    await M.buildCity(async (f) => {
      progress("buildings", 0.45 + f * 0.2);
      await sleep();
    }, 120);
    tick("city", t0);
    t0 = performance.now();
    M.buildOpenSpaces();
    tick("openspaces", t0);
    t0 = performance.now();
    await sleep();
    M.buildRuins();
    if (M.buildQueensboro) M.buildQueensboro();
    tick("ruins", t0);
    t0 = performance.now();
    M.buildSignage();
    tick("signage", t0);
    t0 = performance.now();
    await sleep();
    progress("billboards", 0.66);
    M.buildBillboards();
    tick("billboards", t0);
    t0 = performance.now();
    await sleep();
    progress("twenty-two years of decay", 0.7);
    // blank party walls: ghost signs, downspouts, tie-rod anchors (needs the wall log + billboards; before decay clears the log)
    if (M.buildWallDressing) {
      try {
        M.buildWallDressing();
      } catch (e) {
        G.reportError("map:walls", e);
      }
    }
    if (M.buildDecay) {
      M.buildDecay();
      tick("decay", t0);
      t0 = performance.now();
    }
    await sleep();
    progress("Cryo Unit C-9", 0.8);
    M.buildCryo();
    tick("cryo", t0);
    t0 = performance.now();
    await sleep();
    progress("subway", 0.85);
    M.buildSubway();
    tick("subway", t0);
    t0 = performance.now();
    await sleep();
    progress("dungeons", 0.87);
    if (M.buildDungeons) {
      try {
        await M.buildDungeons(async (f) => {
          progress("dungeons", 0.87 + f * 0.03);
          await sleep();
        });
      } catch (e) {
        G.reportError("map:dungeons", e);
      }
      tick("dungeons", t0);
      t0 = performance.now();
    }
    await sleep();
    progress("meshes", 0.9);
    // Fallback water plane (only when the atmosphere module is missing)
    if (G.isStub("atmos")) {
      const W = G.LAYOUT.WORLD;
      const wb = M.buf("water@gloss", 0, 0, "far");
      M.quad(
        wb,
        [W.minX - 1500, G.world.waterLevel, W.maxZ + 1500],
        [W.maxX + 1500, G.world.waterLevel, W.maxZ + 1500],
        [W.maxX + 1500, G.world.waterLevel, W.minZ - 1500],
        [W.minX - 1500, G.world.waterLevel, W.minZ - 1500],
        [0, 1, 0],
        [0, 0, 300, 0, 300, 300, 0, 300],
        [0.55, 0.62, 0.5],
      );
    }
    const st = await M.flushAsync(sleep);
    tick("flush", t0);
    if (M.roots.city) G.scene.add(M.roots.city);
    if (M.addInteriorRoots) M.addInteriorRoots(); // cryo / subway / dungeon cells (90_module_interior.js)
    // flickering tubes in the subway, the cryo street-door bulb and dungeon fixtures get real (borrowed) light pools
    try {
      if (!G.isStub("atmos") && G.atmos.addFixtureLight) {
        if (M.addInteriorFixtures) M.addInteriorFixtures(); // subway tubes (90_module_interior.js)
        for (const f of M.extraFixtures || [])
          G.atmos.addFixtureLight(f.pos, f.color, f.opts);
      }
    } catch (e) {
      G.reportError("map:fixtures", e);
    }
    MAP.stats = Object.assign(
      {
        meshes: st.meshes,
        triangles: st.tris,
        lots: (M.lots || []).length,
        billboards: (M.billboards || []).length,
        shells: (M.shells || []).length,
        colliders: M.colliders.length,
        times: T,
        decay: M.decayStats || null,
      },
      M.cityStats || {},
    );
    // layout self-check (Broadway roadway inside a site / an unrefitted old footprint, overlapping footprints)
    try {
      if (G.LAYOUT.lintLayout) {
        MAP.stats.layoutLint = G.LAYOUT.lintLayout();
        if (MAP.stats.layoutLint.length)
          console.warn(
            "[map] layout lint",
            JSON.stringify(MAP.stats.layoutLint),
          );
      }
    } catch (e) {
      G.reportError("map:layoutLint", e);
    }
    // public data
    MAP.lots = M.lots;
    MAP.shells = M.shells;
    // storefront rooms for the props module's dressing ({x,z,yaw,w,d,y}; local -z faces the street)
    MAP.storefronts = M.shells;
    MAP.billboards = M.billboards;
    MAP.manholes = M.manholes;
    MAP.craters = M.craters;
    MAP.waterTowers = M.waterTowers;
    MAP.intersections = (M.intersections || []).map((q) => ({
      x: q.x,
      z: q.z,
      avenue: q.a.name,
      street: q.s.name,
    }));
    MAP.piers = M.piers;
    MAP.subwayEntrances = M.subwayEntrances;
    MAP.roads = M.roads;
    MAP.parkPaths = M.parkPaths;
    MAP.intrepid = M.intrepid;
    MAP.giantSign = M.giantSign;
    MAP.fallenTowers = M.fallenTowers || [];
    MAP.openSpaces = M.OPEN_SPACES;
    MAP.columbusCircle = M.columbusCircle;
    MAP.queensboro = M.queensboro;
    if (M.publishInteriorData) M.publishInteriorData(); // MAP.cryoAnchors, MAP.dungeons (90_module_interior.js)
    if (G.DEBUG) console.log("[map] stats", MAP.stats);
    // ?mapdebug=1 → hidden <pre> with map stats & dungeon entrances (for headless tooling)
    try {
      if (G.QS && G.QS.get && G.QS.get("mapdebug")) {
        const pre = document.createElement("pre");
        pre.id = "map-debug";
        pre.style.display = "none";
        pre.textContent =
          "MAPDBG" +
          JSON.stringify({
            stats: MAP.stats,
            dungeons: (M.dungeons || []).map((d) => ({
              key: d.key,
              outside: d.outside,
              entrance: d.entrance,
              loot: d.loot.length,
            })),
            flush: Object.entries(M.flushStats || {})
              .sort((p, q) => q[1] - p[1])
              .slice(0, 60)
              .map((e) => [e[0], Math.round(e[1])]),
            layers: Object.entries(M.flushStats || {}).reduce((acc, e) => {
              const l = e[0].split(":").pop();
              acc[l] = (acc[l] || 0) + Math.round(e[1]);
              return acc;
            }, {}),
            extra: {
              walls: M.wallDressStats,
              spills: M.facadeSpillCount,
              blockades: (M.blockades || []).length,
              park: M.parkCover,
            },
          }) +
          "ENDMAPDBG";
        document.body.appendChild(pre);
      }
    } catch (e) {
      /* */
    }
  }

  // -------------------------------------------------------------------
  // Runtime
  // -------------------------------------------------------------------
  let visTimer = 0,
    forceVis = 3,
    bowtieTimer = 1.5;
  function update(dt, realDt) {
    // one-shot bow-tie carriageway lint once every module has built (Times Square's X must stay open road)
    if (
      bowtieTimer > 0 &&
      (bowtieTimer -= realDt) <= 0 &&
      G.LAYOUT.lintBowties
    ) {
      try {
        MAP.stats.bowtieLint = G.LAYOUT.lintBowties(G.world);
        if (MAP.stats.bowtieLint.length)
          console.warn(
            "[map] bow-tie lint (BLOCKING for the owner):",
            JSON.stringify(MAP.stats.bowtieLint),
          );
      } catch (e) {
        G.reportError("map:bowtieLint", e);
      }
    }
    if (M.updateInteriors) M.updateInteriors(dt, realDt); // cog door, sliding doors, dungeon names (90_module_interior.js)
    visTimer -= realDt;
    if (visTimer <= 0 || forceVis > 0) {
      // (forced for a few frames after a teleport: the camera may only follow the player later in the frame)
      forceVis--;
      visTimer = 0.2;
      const cam = G.camera ? G.camera.position : G.player.pos;
      const indoor = cam.x >= G.LAYOUT.INTERIOR_X_MIN;
      if (!indoor && M.updateLOD) M.updateLOD(cam);
      if (M.roots.city) M.roots.city.visible = !indoor;
      if (M.interiorVisibility) M.interiorVisibility(cam, indoor); // interior cell roots (90_module_interior.js)
      if (G.QS && G.QS.get && G.QS.get("mapdebug") && G.camera) {
        try {
          debugVisible();
        } catch (e) {
          /* */
        }
      }
    }
  }

  /** ?mapdebug=1: hidden <pre id="map-vis"> with the map meshes in the camera frustum, grouped by material:layer (draw-call audit). */
  function debugVisible() {
    const cam = G.camera;
    cam.updateMatrixWorld();
    const fr = new THREE.Frustum(),
      m4 = new THREE.Matrix4();
    fr.setFromProjectionMatrix(
      m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse),
    );
    const by = {},
      tr = {};
    let n = 0,
      sh = 0;
    const walk = (o, vis) => {
      if (!o.visible || !vis) return;
      if (o.isMesh) {
        if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
        const sp = o.geometry.boundingSphere
          .clone()
          .applyMatrix4(o.matrixWorld);
        if (fr.intersectsSphere(sp)) {
          const k = o.name.replace(/^map:/, "");
          by[k] = (by[k] || 0) + 1;
          tr[k] =
            (tr[k] || 0) + (o.geometry.index ? o.geometry.index.count / 3 : 0);
          n++;
          if (o.castShadow) sh++;
        }
      }
      for (const c of o.children) walk(c, true);
    };
    if (M.roots.city) walk(M.roots.city, true);
    let pre = document.getElementById("map-vis");
    if (!pre) {
      pre = document.createElement("pre");
      pre.id = "map-vis";
      pre.style.display = "none";
      document.body.appendChild(pre);
    }
    pre.textContent =
      "MAPVIS" +
      JSON.stringify({
        n,
        casters: sh,
        cam: [cam.position.x, cam.position.z].map(Math.round),
        by: Object.entries(by).sort((p, q) => q[1] - p[1]),
        tris: Object.entries(tr)
          .map((e) => [e[0], Math.round(e[1])])
          .sort((p, q) => q[1] - p[1])
          .slice(0, 30),
      }) +
      "ENDMAPVIS";
  }

  // refresh visibility/LOD immediately after any teleport (doors, fast travel, loading)
  G.on("teleport", () => {
    visTimer = 0;
    forceVis = 3;
  });

  G.registerModule({ name: "map", order: 20, init, update });
})();
