/* src/render_perf/30_cull.js */
/* =====================================================================
 * RENDER_PERF — the per-frame cull pass (runs in lateUpdate, i.e. after
 * every module has placed the camera for this frame, right before render).
 *
 * Reasons a unit is hidden (bitmask, see 00_core.js):
 *  INT  — interior-cell leak: static meshes that live in an interior cell
 *         (x ≥ INTERIOR_X_MIN) while the camera is outdoors or in another cell
 *         (owners already hide their cell roots; this catches loose objects such
 *         as containers or a landmark part parented to the scene).
 *  SIZE — projected size below `q.sizePx` pixels (hysteresis ×1.3). At High this
 *         is 1.6 px: a unit whose whole bounding sphere covers < 1.6 px, 100+ m
 *         into the haze, contributes nothing visible.
 *  DIST — draw-distance limit for small/medium units on the Low/Medium presets.
 *  OCC  — software occlusion (20_occlusion.js), evaluated with this frame's final
 *         camera: hidden and revealed in the same frame, never a frame late.
 *         Occlusion only removes a unit from the MAIN camera: it moves to layer 1,
 *         which every shadow camera also renders, so hidden casters keep shading
 *         what the player sees (e.g. a tall tower behind the building in front).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.renderPerf || !G.renderPerf._) return;
  const R = G.renderPerf._,
    HIDE = R.HIDE;

  const _m = new THREE.Matrix4(),
    _fr = new THREE.Frustum();
  let lastSig = null,
    idleFrames = 0;

  function camSignature(cam) {
    const a = cam.matrixWorld.elements,
      b = cam.projectionMatrix.elements;
    return (
      a[0] +
      a[1] * 3 +
      a[2] * 7 +
      a[4] * 11 +
      a[5] * 13 +
      a[6] * 17 +
      a[8] * 19 +
      a[9] * 23 +
      a[10] * 29 +
      a[12] * 31 +
      a[13] * 37 +
      a[14] * 41 +
      b[0] * 43 +
      b[5] * 47 +
      b[10] * 53
    );
  }

  function inFrustum(planes, x0, y0, z0, x1, y1, z1) {
    for (let i = 0; i < 6; i++) {
      const p = planes[i],
        n = p.normal;
      const x = n.x > 0 ? x1 : x0,
        y = n.y > 0 ? y1 : y0,
        z = n.z > 0 ? z1 : z0;
      if (n.x * x + n.y * y + n.z * z + p.constant < 0) return false;
    }
    return true;
  }

  R.cullPass = function () {
    const cam = G.camera;
    if (!cam || !R.unitsReady) return;
    const t0 = performance.now();
    cam.updateMatrixWorld();
    cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
    // static camera (menus, dialogue, paused): nothing can change — re-run only every 30 frames
    const sig = camSignature(cam);
    if (sig === lastSig) {
      if (++idleFrames > 1 && idleFrames < 30 && !R.force) return;
    } else idleFrames = 0;
    if (idleFrames >= 30) idleFrames = 1;
    lastSig = sig;
    R.force = false;
    if ((R._slT = (R._slT || 0) - 1) <= 0) {
      R._slT = 60;
      R.shadowLayers();
    }

    _m.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    _fr.setFromProjectionMatrix(_m);
    const planes = _fr.planes;
    const cx = cam.matrixWorld.elements[12],
      cy = cam.matrixWorld.elements[13],
      cz = cam.matrixWorld.elements[14];
    const XMIN = (G.LAYOUT && G.LAYOUT.INTERIOR_X_MIN) || 2500;
    const indoors = cx >= XMIN;
    const camCell = indoors ? R.cellAt(cx, cz) : null;
    // (indoors between cells — no cell found — nothing is interior-culled and no list is walked)
    const O = R.occ;
    const tOcc = performance.now();
    const occOn = !!(
      R.opts.occlusion &&
      R.q.occlusion &&
      O &&
      !indoors &&
      O.frame(cam)
    );
    R.stats.occMs = performance.now() - tOcc;
    // distant proxies (25_hlod.js): switch cells before the units are tested
    if (R.hlod) {
      const th = performance.now();
      R.hlod.frame(cam, planes, occOn, O, cx, cy, cz, indoors);
      R.stats.hlodMs = performance.now() - th;
    }

    // full-resolution pixels per radian (vertical) for the size tiers
    const r = G.renderer;
    let hPx = (r && r.domElement && r.domElement.height) || 720;
    try {
      if (G.atmos && G.atmos.renderScale) hPx *= G.atmos.renderScale() || 1;
    } catch (e) {
      /* ignore */
    }
    const pxr =
      ((hPx * 0.5) / Math.tan((((cam.fov || 60) * Math.PI) / 180) * 0.5)) *
      (cam.zoom || 1);
    const sizeOn = R.opts.sizeCull && R.q.sizePx > 0;
    const sizeT = R.q.sizePx,
      sizeT2 = sizeT * 1.3;
    const dd = R.q.drawDist,
      ddR = R.q.drawDistMaxR;
    const intOn = R.opts.interiorCull;

    let nOcc = 0,
      nSize = 0,
      nInt = 0,
      nDist = 0,
      hiddenMeshes = 0;
    R.lists();
    // interior cells: masks change only when the camera changes cell (or goes in/out)
    const intKey = !intOn ? "off" : indoors ? camCell || "?" : "out";
    if (intKey !== R._intKey) {
      R._intKey = intKey;
      for (const [key, list] of R._cells) {
        const hide = intOn && (!indoors || (camCell && key !== camCell));
        for (const u of list) {
          const m = hide ? HIDE.INT : u.mask & ~HIDE.INT;
          if (m !== u.mask) {
            u.mask = m;
            R.apply(u);
          }
        }
      }
    }
    for (const [key, list] of R._cells)
      if (list.length && list[0].mask & HIDE.INT) {
        nInt += list.length;
      }
    // the list the camera is in: outdoor units outdoors, the current cell's units indoors
    const U = indoors ? (camCell ? R._cells.get(camCell) || [] : []) : R._out;
    for (let i = 0; i < U.length; i++) {
      const u = U[i];
      if (u.frozen) continue;
      if (u.hf && u.hbAll && u.hb) {
        if (u.mask) hiddenMeshes += u.meshes.length;
        continue;
      } // wholly inside its cell's distant proxy
      let mask = 0;
      {
        const dx = u.x0 > cx ? u.x0 - cx : cx > u.x1 ? cx - u.x1 : 0;
        const dy = u.y0 > cy ? u.y0 - cy : cy > u.y1 ? cy - u.y1 : 0;
        const dz = u.z0 > cz ? u.z0 - cz : cz > u.z1 ? cz - u.z1 : 0;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (sizeOn && d > 1) {
          const px = ((2 * u.r) / d) * pxr;
          if (px < (u.mask & HIDE.SIZE ? sizeT2 : sizeT)) mask |= HIDE.SIZE;
        }
        if (d > dd && u.r <= ddR) mask |= HIDE.DIST;
        if (!mask && occOn && d > 8) {
          if (inFrustum(planes, u.x0, u.y0, u.z0, u.x1, u.y1, u.z1)) {
            if (O.boxOccluded(u.x0, u.y0, u.z0, u.x1, u.y1, u.z1))
              mask |= HIDE.OCC;
          } else mask |= u.mask & HIDE.OCC; // off-screen: keep the last verdict (re-tested when it enters the view; still casts shadows)
        }
      }
      if (mask !== u.mask) {
        u.mask = mask;
        R.apply(u);
      }
      if (mask) {
        hiddenMeshes += u.meshes.length;
        if (mask & HIDE.OCC) nOcc++;
        else if (mask & HIDE.SIZE) nSize++;
        else nDist++;
      }
    }
    const s = R.stats;
    s.hidden.occ = nOcc;
    s.hidden.size = nSize;
    s.hidden.int = nInt;
    s.hidden.dist = nDist;
    s.hiddenMeshes = hiddenMeshes;
    s.cullMs = performance.now() - t0;
    s.cullAvg = s.cullAvg ? s.cullAvg * 0.95 + s.cullMs * 0.05 : s.cullMs;
  };
})();
