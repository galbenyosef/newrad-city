// play-inline-188 02 — pois
// Lines 16-341 of readable/play-inline-188.pretty.js (statement-aligned).
  const A = G.PMID,
    K = A.kit;

  // Shared namespace: ADD to it, never clobber other POI modules' entries.
  G.pois = G.pois && !G.pois.__stub ? G.pois : {};
  if (typeof G.pois.getAnchor !== "function") {
    /** Named anchor of any registered POI (by POI id or interior key) → fresh Vector3 (with .yaw) or null. */
    G.pois.getAnchor = function (idOrKey, name) {
      for (const k in G.pois) {
        const p = G.pois[k];
        if (!p || typeof p !== "object" || !p.anchors) continue;
        if (p.id !== idOrKey && p.interiorKey !== idOrKey && k !== idOrKey)
          continue;
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
  if (typeof G.pois.list !== "function") {
    G.pois.list = function () {
      return Object.keys(G.pois)
        .filter((k) => G.pois[k] && G.pois[k].root)
        .map((k) => G.pois[k]);
    };
  }

  // Interior "moods" for the atmosphere module (added only if it has none for our cells).
  const MOODS = {
    waldorf: {
      fog: "#16110b",
      fogD: 0.012,
      hemiS: "#e0c8a0",
      hemiG: "#8a7458",
      hemiI: 1.0,
      light: "#ffe0b0",
      lightI: 0.4,
      exp: 1.12,
    },
    msg: {
      fog: "#141210",
      fogD: 0.011,
      hemiS: "#c8b898",
      hemiG: "#7a6c54",
      hemiI: 1.0,
      light: "#ffe8c0",
      lightI: 0.42,
      exp: 1.12,
    },
    penn_station: {
      fog: "#141612",
      fogD: 0.009,
      hemiS: "#b8c0a8",
      hemiG: "#6c7060",
      hemiI: 0.95,
      light: "#e8ecd0",
      lightI: 0.4,
      exp: 1.15,
    },
    metlife_tower: {
      fog: "#121414",
      fogD: 0.016,
      hemiS: "#b0b8b4",
      hemiG: "#6a7270",
      hemiI: 0.95,
      light: "#e4ecec",
      lightI: 0.4,
      exp: 1.12,
    },
    bellevue: {
      fog: "#101410",
      fogD: 0.02,
      hemiS: "#a0b0a0",
      hemiG: "#566456",
      hemiI: 0.9,
      light: "#d8f0d8",
      lightI: 0.34,
      exp: 1.18,
    },
  };
  function installMoods() {
    try {
      const AT = G.atmos && G.atmos._;
      if (!AT || !AT.MOODS) return;
      for (const k in MOODS) {
        if (AT.MOODS[k]) continue;
        const m = Object.assign({}, MOODS[k]);
        for (const n of ["fog", "hemiS", "hemiG", "light"])
          m[n] = new THREE.Color(m[n]);
        AT.MOODS[k] = m;
      }
    } catch (e) {
      /* atmosphere absent or changed — interiors fall back to its default mood */
    }
  }

  /**
   * Combat places a hostile interior LOCATION's spawns via G.map.getAnchor(interiorKey, 'spawnN') (then random points
   * around the arrival door). Publish our authored spawn1..6 / boss / entrance there — add-only, never overwriting an
   * area the map module owns — so Continuity squads, Maniacs, robots and Brutes stand in the rooms built for them.
   */
  /** Perf: small exterior meshes / glow points (signage, lettering, trims, fences) hidden beyond ~330 m. */
  function detailLOD() {
    try {
      if (!G.world || typeof G.world.addLOD !== "function") return;
      for (const id in A.records) {
        const root = A.records[id].root;
        if (!root) continue;
        root.traverse((o) => {
          if (o === root || !(o.isMesh || o.isPoints) || !o.geometry) return;
          const g = o.geometry;
          if (!g.boundingSphere) g.computeBoundingSphere();
          const n = g.attributes.position ? g.attributes.position.count : 0;
          if (o.isPoints || n < 2500)
            G.world.addLOD(
              o,
              330 + g.boundingSphere.radius,
              g.boundingSphere.center.clone(),
            );
        });
      }
    } catch (e) {
      G.reportError("poi_midtown:detailLOD", e);
    }
  }
  function bridgeCombatAnchors() {
    try {
      if (
        G.isStub("map") ||
        !G.map ||
        !G.map.anchors ||
        typeof G.map.anchors !== "object"
      )
        return;
      for (const id in A.records) {
        const rec = A.records[id],
          key = rec.interiorKey;
        if (!key || G.map.anchors[key] || !rec.anchors) continue;
        const loc = (G.LAYOUT.LOCATIONS || []).find(
          (l) => l.interior === key && l.hostile,
        );
        if (!loc) continue;
        const out = {};
        for (const n of [
          "spawn1",
          "spawn2",
          "spawn3",
          "spawn4",
          "spawn5",
          "spawn6",
          "boss",
          "entrance",
        ])
          if (rec.anchors[n]) out[n] = rec.anchors[n];
        G.map.anchors[key] = out;
      }
    } catch (e) {
      G.reportError("poi_midtown:bridgeAnchors", e);
    }
  }

  async function init() {
    const t0 = performance.now();
    K.initAtlases();
    const defs = A.defs.slice().sort((a, b) => a.order - b.order);
    for (const d of defs) {
      const ts = performance.now();
      try {
        d.build(K);
      } catch (e) {
        G.reportError("init:poi_midtown/" + d.id, e);
      }
      A.timings = A.timings || {};
      A.timings[d.id] = Math.round(performance.now() - ts);
      if (G.events)
        G.events.emit(
          "loadingProgress",
          "Restoring " + ((G.LAYOUT.getSite(d.id) || {}).name || d.id) + "…",
          0.32,
        );
      await new Promise((r) => setTimeout(r, 0));
    }
    {
      const ts = performance.now();
      try {
        if (A.decay) A.decay();
      } catch (e) {
        G.reportError("poi_midtown:decay", e);
      }
      A.timings = A.timings || {};
      A.timings.decay = Math.round(performance.now() - ts);
    }
    for (const a of Object.values(K.atlases)) a.tex.needsUpdate = true;
    bridgeCombatAnchors();
    detailLOD();
    A.initMs = Math.round(performance.now() - t0);
  }

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------
  let readyDone = false;
  G.events.on("initDone", () => {
    installMoods();
    if (!readyDone) {
      readyDone = true;
      try {
        A.onInitDone();
      } catch (e) {
        G.reportError("poi_midtown:initDone", e);
      }
      try {
        if (G.poiVoidGuard) {
          const doors = (G.world.doors || []).reduce((a, d) => {
            const f = d.def || d;
            if (f.pos) a.push(f.pos);
            if (f.target) a.push(f.target);
            return a;
          }, []);
          for (const id in A.records) {
            const I = G.LAYOUT.INTERIORS[A.records[id].interiorKey];
            if (I)
              G.poiVoidGuard(I.origin.x, I.origin.z, {
                parent: A.records[id].interiorRoot,
                doors,
              });
          }
        }
      } catch (e) {
        G.reportError("poi_midtown:voidGuard", e);
      }
    } else A.registerAll();
  });
  G.events.on("reset", () => {
    A.clearNPCs();
    try {
      A.resetGates();
    } catch (e) {
      G.reportError("poi_midtown:gates", e);
    }
    for (const k in A.state) delete A.state[k];
    for (const fn of A.resets || []) {
      try {
        fn();
      } catch (e) {
        G.reportError("poi_midtown:reset", e);
      }
    }
  });
  G.events.on("newGame", () => {
    A.spawnNPCs();
    for (const fn of A.dynamic) {
      try {
        fn();
      } catch (e) {
        G.reportError("poi_midtown:newGame", e);
      }
    }
  });
  G.events.on("loaded", () => {
    try {
      A.restoreGates();
    } catch (e) {
      /* ignore */
    }
    A.spawnNPCs();
    for (const fn of A.dynamic) {
      try {
        fn();
      } catch (e) {
        G.reportError("poi_midtown:loaded", e);
      }
    }
  });
  if (G.save && G.save.register) {
    G.save.register("poi_midtown", {
      save: () => JSON.parse(JSON.stringify(A.state)),
      load: (d) => {
        for (const k in A.state) delete A.state[k];
        Object.assign(A.state, d || {});
      },
    });
  }

  // ------------------------------------------------------------------
  // Per-frame: interior visibility, exterior hiding, animation
  // ------------------------------------------------------------------
  let t = 0;
  const XMIN = G.LAYOUT.INTERIOR_X_MIN;
  function update(dt, realDt) {
    t += realDt;
    const cam = G.camera ? G.camera.position : null;
    if (cam) {
      const indoor = cam.x >= XMIN;
      for (const id in A.records) {
        const rec = A.records[id];
        const I = G.LAYOUT.INTERIORS[rec.interiorKey];
        if (I && rec.interiorRoot)
          rec.interiorRoot.visible =
            indoor &&
            Math.abs(cam.x - I.origin.x) < 170 &&
            Math.abs(cam.z - I.origin.z) < 170;
        if (rec.root) rec.root.visible = !indoor;
      }
    }
    const night = K.night();
    K.updateGlows(t, night);
    K.updateNightMats(night);
    if (K.flagMat) K.flagMat.userData.uTime.value = t;
    A.updateGates(realDt);
    for (const fn of A.animators) {
      try {
        fn(dt, t, night, realDt);
      } catch (e) {
        G.reportError("update:poi_midtown", e);
        A.animators.splice(A.animators.indexOf(fn), 1);
        break;
      }
    }
  }

  G.registerModule({ name: "poi_midtown", order: 26.5, init, update });
