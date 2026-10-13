/* src/render_perf/00_core.js */
/* =====================================================================
 * RENDER_PERF — core: namespace, settings, the cull-unit registry.
 *
 * Module `render_perf` (order 95: runs after every world module has built its
 * static geometry). Namespace `G.renderPerf`.
 *
 * How objects are hidden: NEVER through `object.visible` (owners toggle that for
 * their own LOD / interior logic and we must not fight them). A culled mesh gets
 * camera layer 0 cleared (`mesh.layers.mask & ~1`); three.js skips it in the main
 * pass, the shadow passes and raycasts, and the owner's `visible` flag stays
 * untouched. Everything is restored when a reason goes away or the module is
 * switched off (`G.renderPerf.setEnabled(false)`, `?rp=0`).
 *
 * A "unit" is a set of static meshes culled together with one world AABB:
 * every top-level scene root is split recursively until a part is ≤ UNIT_MAX m
 * (a POI's façade group, a props chunk, one merged map-chunk mesh…). Actors,
 * pickups, particles, the sky/water and anything with frustumCulled=false are
 * never touched. A time-sliced validation sweep notices meshes that move,
 * get detached or change geometry and re-fits (or permanently frees) the unit.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.registerModule) return;

  const RP = (G.renderPerf = { __module: "render_perf" });
  const QS = G.QS || new URLSearchParams(location.search);

  // hide reasons (bitmask per unit)
  const HIDE = { OCC: 1, SIZE: 2, INT: 4, DIST: 8 };

  const R = (RP._ = {
    HIDE,
    QS,
    enabled: QS.get("rp") !== "0" && !G.SURVEY, // survey renders from its own cameras → never cull there
    opts: {
      occlusion: QS.get("rpocc") !== "0",
      sizeCull: QS.get("rpsize") !== "0",
      interiorCull: QS.get("rpint") !== "0",
      prewarm: QS.get("rpwarm") !== "0",
      debug: QS.get("rpdebug") === "1",
    },
    UNIT_MAX: 90, // max AABB extent (m) of a group unit before it is split into its children
    units: [],
    adopted: [],
    unitsReady: false,
    rootsSeen: new WeakSet(),
    pendingRoots: new Map(), // root → time first seen (roots added after the first scan are adopted after a grace period)
    stats: {
      units: 0,
      meshes: 0,
      hidden: { occ: 0, size: 0, int: 0, dist: 0 },
      hiddenMeshes: 0,
      cullMs: 0,
      occMs: 0,
      occluders: 0,
      rasterOccluders: 0,
      sweepFixes: 0,
      frozen: 0,
    },
    // quality-driven knobs (50_quality.js sets them)
    q: { sizePx: 1.6, drawDist: Infinity, drawDistMaxR: 0, occlusion: true },
    systems: [],
  });
  R.addSystem = (s) => {
    R.systems.push(s);
    R.systems.sort((a, b) => (a.order || 50) - (b.order || 50));
  };

  // --------------------------------------------------------------------
  // Exclusions: dynamic / special roots and meshes that must never be culled here
  // --------------------------------------------------------------------
  const EXCLUDE_ROOT =
    /^(atmos|rl_|char|amb|fx|weap|vm_|view|player|tp_|goggles|vigil|ht_|holo|arcade|q_|qx_|crafting|combat|actor|npc|corpse|proj|decal|pickup|item|loot|rp_)/i;
  function excludedRoot(o) {
    if (!o || o === G.camera || o.isCamera || o.isLight) return true;
    const ud = o.userData || {};
    if (
      ud.rpNoCull ||
      ud.actor ||
      ud.isActor ||
      ud.npc ||
      ud.dynamic ||
      ud.item ||
      ud.pickup
    )
      return true;
    if (o.name && EXCLUDE_ROOT.test(o.name)) return true;
    // unnamed pickup wrappers: Group → Mesh named "item:<id>"
    if (
      !o.name &&
      o.children.length &&
      o.children[0].name &&
      /^item:/.test(o.children[0].name)
    )
      return true;
    if (o.isSprite || o.isPoints) return true;
    return false;
  }
  function eligibleMesh(o) {
    if (!o.isMesh || o.isSkinnedMesh) return false;
    if (o.frustumCulled === false) return false;
    const g = o.geometry;
    if (!g || !g.attributes || !g.attributes.position) return false;
    if (
      g.morphAttributes &&
      g.morphAttributes.position &&
      g.morphAttributes.position.length
    )
      return false;
    const ud = o.userData;
    if (ud && (ud.rpNoCull || ud.actor || ud.isActor || ud.dynamic))
      return false;
    if (o.isInstancedMesh && typeof o.computeBoundingBox !== "function")
      return false;
    return true;
  }

  // --------------------------------------------------------------------
  // World AABB of one mesh (geometry / instanced bounds × matrixWorld)
  // --------------------------------------------------------------------
  const _b = new THREE.Box3();
  function meshWorldBox(m, out) {
    let lb;
    if (m.isInstancedMesh) {
      if (!m.count) return false;
      m.computeBoundingBox();
      lb = m.boundingBox;
    } else {
      const g = m.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      lb = g.boundingBox;
    }
    if (!lb || lb.isEmpty() || !isFinite(lb.min.x) || !isFinite(lb.max.y))
      return false;
    _b.copy(lb).applyMatrix4(m.matrixWorld);
    out.union(_b);
    return true;
  }
  R.meshWorldBox = meshWorldBox;

  // --------------------------------------------------------------------
  // Interior cells (LAYOUT.INTERIORS origins, ±170 m)
  // --------------------------------------------------------------------
  let cellList = null;
  function cells() {
    if (cellList) return cellList;
    cellList = [];
    const I = G.LAYOUT && G.LAYOUT.INTERIORS;
    if (I)
      for (const k in I) {
        const o = I[k] && I[k].origin;
        if (o && isFinite(o.x) && isFinite(o.z))
          cellList.push({ key: k, x: o.x, z: o.z });
      }
    return cellList;
  }
  /** Interior cell key at (x,z) (nearest origin within 175 m on both axes), else null. */
  R.cellAt = function (x, z) {
    const XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    if (x < XMIN) return null;
    let best = null,
      bd = 1e18;
    for (const c of cells()) {
      const dx = Math.abs(x - c.x),
        dz = Math.abs(z - c.z);
      if (dx > 175 || dz > 175) continue;
      const d = dx * dx + dz * dz;
      if (d < bd) {
        bd = d;
        best = c.key;
      }
    }
    return best;
  };

  // --------------------------------------------------------------------
  // Units
  // --------------------------------------------------------------------
  let _uid = 0;
  const knownMesh = new WeakSet();
  function makeUnit(root, obj, meshes, box) {
    for (const m of meshes) knownMesh.add(m);
    const u = {
      id: _uid++,
      root,
      obj,
      meshes,
      x0: box.min.x,
      y0: box.min.y,
      z0: box.min.z,
      x1: box.max.x,
      y1: box.max.y,
      z1: box.max.z,
      cx: 0,
      cy: 0,
      cz: 0,
      r: 0,
      shadow: false,
      mask: 0,
      applied: 0,
      occN: 0,
      dyn: 0,
      frozen: false,
      cell: null,
      interior: false,
      snaps: null,
      geos: null,
      iver: null,
    };
    fitUnit(u);
    snapUnit(u);
    const XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    if (u.x0 >= XMIN) {
      u.cell = R.cellAt(u.cx, u.cz);
      u.interior = !!u.cell;
    }
    for (const m of meshes)
      if (m.castShadow) {
        u.shadow = true;
        break;
      }
    return u;
  }
  function fitUnit(u) {
    u.cx = (u.x0 + u.x1) / 2;
    u.cy = (u.y0 + u.y1) / 2;
    u.cz = (u.z0 + u.z1) / 2;
    const ex = u.x1 - u.x0,
      ey = u.y1 - u.y0,
      ez = u.z1 - u.z0;
    u.r = 0.5 * Math.sqrt(ex * ex + ey * ey + ez * ez);
  }
  function snapUnit(u) {
    const n = u.meshes.length;
    u.snaps = new Float64Array(n * 4);
    u.geos = new Array(n);
    u.iver = new Int32Array(n);
    for (let i = 0; i < n; i++) {
      const m = u.meshes[i],
        e = m.matrixWorld.elements;
      u.snaps[i * 4] = e[12];
      u.snaps[i * 4 + 1] = e[13];
      u.snaps[i * 4 + 2] = e[14];
      u.snaps[i * 4 + 3] = e[0] + e[5] * 1.37 + e[10] * 1.91 + e[4] * 0.61;
      u.geos[i] = m.geometry;
      u.iver[i] = m.isInstancedMesh ? m.instanceMatrix.version : 0;
    }
  }

  /** Split a root into units of ≤ UNIT_MAX extent. */
  const _box = new THREE.Box3();
  function collectMeshes(obj, out) {
    obj.traverse((o) => {
      if (o !== obj && o.userData && o.userData.rpNoCull) return;
      if (eligibleMesh(o)) out.push(o);
    });
    return out;
  }
  function buildUnits(root, obj, depth, out) {
    const meshes = collectMeshes(obj, []);
    if (!meshes.length) return;
    const box = new THREE.Box3();
    const ok = [];
    for (const m of meshes) if (meshWorldBox(m, box)) ok.push(m);
    if (!ok.length || box.isEmpty()) return;
    const ext = Math.max(
      box.max.x - box.min.x,
      box.max.y - box.min.y,
      box.max.z - box.min.z,
    );
    if (
      ext <= R.UNIT_MAX ||
      ok.length === 1 ||
      depth > 12 ||
      !obj.children.length
    ) {
      out.push(makeUnit(root, obj, ok, box));
      return;
    }
    // too big: the object's own mesh (if any) becomes a unit, children are split further
    if (eligibleMesh(obj)) {
      const b2 = new THREE.Box3();
      if (meshWorldBox(obj, b2)) out.push(makeUnit(root, obj, [obj], b2));
    }
    for (const c of obj.children) {
      if (c.userData && c.userData.rpNoCull) continue;
      buildUnits(root, c, depth + 1, out);
    }
  }

  /**
   * Adopted roots can grow after init (props spawns its interactable props on newGame, quests add set
   * pieces to POI groups…). Units for the NEW meshes: each is grouped under its highest ancestor that
   * holds no already-known mesh, then split like a fresh root.
   */
  R.rescanRoot = function (root) {
    if (!root || root.parent !== G.scene) return 0;
    const fresh = [];
    root.traverse((o) => {
      if (o.userData && o.userData.rpNoCull) return;
      if (eligibleMesh(o) && !knownMesh.has(o)) fresh.push(o);
    });
    if (!fresh.length) return 0;
    const memo = new Map();
    const hasKnown = (obj) => {
      let v = memo.get(obj);
      if (v === undefined) {
        v = false;
        obj.traverse((o) => {
          if (!v && knownMesh.has(o)) v = true;
        });
        memo.set(obj, v);
      }
      return v;
    };
    const tops = new Set();
    for (const m of fresh) {
      let a = m;
      while (
        a.parent &&
        a.parent !== root &&
        a.parent !== G.scene &&
        !hasKnown(a.parent)
      )
        a = a.parent;
      tops.add(a);
    }
    const out = [];
    for (const a of tops) {
      try {
        buildUnits(root, a, 0, out);
      } catch (e) {
        /* ignore */
      }
    }
    for (const u of out) R.units.push(u);
    if (out.length) R.listsDirty = true;
    if (out.length) {
      R.stats.units = R.units.length;
      R.stats.meshes += out.reduce((n, u) => n + u.meshes.length, 0);
    }
    return out.length;
  };
  let rescanIdx = 0;
  /** Round-robin: re-check a few adopted roots for new meshes / new freezable objects. */
  R.rescanSome = function (n) {
    const A = R.adopted;
    if (!A.length) return;
    for (let k = 0; k < n && k < A.length; k++) {
      if (rescanIdx >= A.length) rescanIdx = 0;
      const root = A[rescanIdx++];
      if (root.parent !== G.scene) continue;
      R.rescanRoot(root);
      if (R.freezeAdopt) {
        R.freezeAdopt(root);
        R.freezeEvalSkip(root);
      }
    }
  };

  /** Scan scene roots and create units. `all` = adopt every root now (init), else only roots older than the grace period. */
  R.scan = function (all) {
    if (!G.scene) return 0;
    const now = performance.now();
    let added = 0;
    if (all) G.scene.updateMatrixWorld();
    for (const root of G.scene.children) {
      if (R.rootsSeen.has(root)) continue;
      if (excludedRoot(root)) {
        R.rootsSeen.add(root);
        continue;
      }
      if (!all) {
        const t = R.pendingRoots.get(root);
        if (t === undefined) {
          R.pendingRoots.set(root, now);
          continue;
        }
        if (now - t < 6000) continue; // brand-new roots may still be moving/building
        R.pendingRoots.delete(root);
      }
      R.rootsSeen.add(root);
      R.adopted.push(root);
      if (!all) root.updateMatrixWorld(true);
      const out = [];
      try {
        buildUnits(root, root, 0, out);
      } catch (e) {
        G.reportError("render_perf:scan", e);
        continue;
      }
      for (const u of out) R.units.push(u);
      added += out.length;
      if (out.length) R.listsDirty = true;
      if (R.freezeAdopt) {
        try {
          R.freezeAdopt(root);
        } catch (e) {
          G.reportError("render_perf:freeze", e);
        }
      }
    }
    // forget pending roots that left the scene
    for (const k of R.pendingRoots.keys())
      if (k.parent !== G.scene) R.pendingRoots.delete(k);
    R.stats.units = R.units.length;
    let n = 0;
    for (const u of R.units) n += u.meshes.length;
    R.stats.meshes = n;
    return added;
  };

  // --------------------------------------------------------------------
  // Applying a unit's hide mask to its meshes (camera layer 0 bit)
  // --------------------------------------------------------------------
  // Layer bits: 0 = main camera, 1 = "shadow only". Every shadow-casting light's shadow camera tests
  // layers 0|1, so an object hidden ONLY by occlusion keeps casting its shadow into the view (a tall
  // building behind the one in front still shades its roof), while size / draw-distance / interior
  // culls remove it from every pass.
  // HLOD (25_hlod.js): while the unit's cell draws its distant proxy (`u.hf`), the meshes baked into it
  // (`u.hb[i]` = 1) leave every pass; the unit's other meshes follow the normal state.
  R.apply = function (u) {
    const live = R.enabled && !u.frozen;
    const st0 = !live || u.mask === 0 ? 0 : u.mask === HIDE.OCC ? 2 : 1;
    const hb =
      live && u.hf && u.hb && u.hb.length === u.meshes.length ? u.hb : null;
    const st = st0 + (hb ? 4 : 0);
    if (st === u.applied) return;
    u.applied = st;
    const ms = u.meshes;
    for (let i = 0; i < ms.length; i++) {
      const m = ms[i];
      if (hb && hb[i]) m.layers.mask &= ~3;
      else if (st0 === 0) m.layers.mask = (m.layers.mask | 1) & ~2;
      else if (st0 === 2) m.layers.mask = (m.layers.mask & ~1) | 2;
      else m.layers.mask &= ~3;
    }
  };
  /** Make every shadow camera also render layer 1 (occlusion-culled casters). Cheap; re-run now and then. */
  R.shadowLayers = function () {
    if (!G.scene) return;
    for (const o of G.scene.children) {
      if (
        o.isLight &&
        o.shadow &&
        o.shadow.camera &&
        !(o.shadow.camera.layers.mask & 2)
      )
        o.shadow.camera.layers.enable(1);
    }
  };
  R.setMask = function (u, bit, on) {
    const m = on ? u.mask | bit : u.mask & ~bit;
    if (m !== u.mask) {
      u.mask = m;
      R.apply(u);
    }
  };
  /** Outdoor units + per-interior-cell lists (the cull pass only walks the list the camera is in). */
  R.lists = function () {
    if (!R.listsDirty && R._out) return;
    R.listsDirty = false;
    const out = [],
      cellsMap = new Map();
    for (const u of R.units) {
      if (u.interior) {
        let a = cellsMap.get(u.cell);
        if (!a) cellsMap.set(u.cell, (a = []));
        a.push(u);
      } else out.push(u);
    }
    R._out = out;
    R._cells = cellsMap;
    R._intKey = undefined; // force the interior masks to be re-applied
  };
  R.showAll = function () {
    for (const u of R.units) {
      u.mask = 0;
      u.occN = 0;
      R.apply(u);
    }
  };

  // --------------------------------------------------------------------
  // Validation sweep: movement / detachment / geometry swaps (time-sliced)
  // --------------------------------------------------------------------
  let sweepIdx = 0;
  const _nb = new THREE.Box3();
  function refit(u) {
    if ((u.hb || u.hcell) && R.hlodInvalidate) R.hlodInvalidate(u); // its baked proxy copy is stale now
    _nb.makeEmpty();
    const keep = [];
    for (const m of u.meshes)
      if (m.parent && meshWorldBox(m, _nb)) keep.push(m);
    if (!keep.length || _nb.isEmpty()) {
      u.frozen = true;
      u.mask = 0;
      R.apply(u);
      return false;
    }
    const moved = Math.max(
      Math.abs(_nb.min.x - u.x0),
      Math.abs(_nb.min.y - u.y0),
      Math.abs(_nb.min.z - u.z0),
      Math.abs(_nb.max.x - u.x1),
      Math.abs(_nb.max.y - u.y1),
      Math.abs(_nb.max.z - u.z1),
    );
    if (keep.length !== u.meshes.length) {
      // meshes that left the unit: make sure they are not left hidden
      for (const m of u.meshes)
        if (keep.indexOf(m) < 0) m.layers.mask = (m.layers.mask | 1) & ~2;
      u.meshes = keep;
    }
    u.x0 = _nb.min.x;
    u.y0 = _nb.min.y;
    u.z0 = _nb.min.z;
    u.x1 = _nb.max.x;
    u.y1 = _nb.max.y;
    u.z1 = _nb.max.z;
    fitUnit(u);
    snapUnit(u);
    if (moved > 1.5) {
      u.dyn++;
      R.stats.sweepFixes++;
      if (u.dyn >= 3) {
        // keeps moving: never cull it again
        u.frozen = true;
        R.stats.frozen++;
        u.mask = 0;
        u.applied = 0;
        for (const m of u.meshes) m.layers.mask = (m.layers.mask | 1) & ~2;
      }
    }
    return true;
  }
  R.sweep = function (budget) {
    const U = R.units;
    if (!U.length) return;
    let n = Math.min(budget, U.length);
    while (n-- > 0) {
      if (sweepIdx >= U.length) sweepIdx = 0;
      const u = U[sweepIdx++];
      if (u.frozen) continue;
      if (u.root.parent !== G.scene) {
        // whole root removed from the scene
        for (const m of u.meshes) m.layers.mask = (m.layers.mask | 1) & ~2;
        u.frozen = true;
        u.dead = true;
        continue;
      }
      const ms = u.meshes,
        s = u.snaps;
      let changed = false;
      for (let i = 0; i < ms.length; i++) {
        const m = ms[i];
        if (!m.parent || m.geometry !== u.geos[i]) {
          changed = true;
          break;
        }
        const e = m.matrixWorld.elements;
        if (
          Math.abs(e[12] - s[i * 4]) > 0.05 ||
          Math.abs(e[13] - s[i * 4 + 1]) > 0.05 ||
          Math.abs(e[14] - s[i * 4 + 2]) > 0.05 ||
          Math.abs(
            e[0] + e[5] * 1.37 + e[10] * 1.91 + e[4] * 0.61 - s[i * 4 + 3],
          ) > 1e-3
        ) {
          changed = true;
          break;
        }
        if (m.isInstancedMesh && m.instanceMatrix.version !== u.iver[i]) {
          changed = true;
          break;
        }
      }
      if (changed) refit(u);
    }
    // compact dead units now and then
    if (sweepIdx === 0 || (G.time && G.time.frame % 600 === 0)) {
      R.units = R.units.filter((u) => !u.dead);
      R.listsDirty = true;
    }
  };

  R.excludedRoot = excludedRoot;
  R.eligibleMesh = eligibleMesh;
})();
