// play-inline-622 03 — mask
// Lines 364-590 of readable/play-inline-622.pretty.js (statement-aligned).
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
