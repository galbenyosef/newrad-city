// play-inline-72 03 — the
// Lines 374-694 of readable/play-inline-72.pretty.js (statement-aligned).
  function late(dt, realDt) {
    const sun = sunLight();
    const C = U.nrcCsm.value;
    const indoors = R.interior();
    U.nrcHzL.value.w = indoors || !R.patched || R.skylineOff ? 0 : 1;
    if (!sun) return;
    if (!near) {
      applyWeather(indoors ? 0 : R.overcast());
      C.x = 0;
      C.z = indoors || !R.patched ? 0 : 0.86;
      return;
    }
    applyTier(false);
    S.frame++;
    checkOrder(sun);
    measure();
    headroom(realDt);
    if (indoors) {
      lateInterior(sun);
      return;
    }
    if (S.inMode) leaveInterior();
    applyWeather(R.overcast());
    const want =
      RL.cascades && S.orderOk && G.renderer.shadowMap.enabled && TIERS[S.tier];
    if (!want || !place(sun)) {
      // everything back to atmosphere's single map (+ the skyline beyond it)
      C.x = 0;
      C.z = 0.86;
      near.shadow.autoUpdate = false;
      near.shadow.needsUpdate = false;
      sun.shadow.autoUpdate = true;
      S.active = false;
      S.lastKind = "";
      setNearCast(false);
      return;
    }
    const first = !S.active || !near.shadow.map;
    S.active = true;
    C.x = 1;
    C.y = 0.8;
    C.z = 0.86;
    // far map every 4th frame while the view moves / turns, every 8th while it is still; the near map
    // on all other frames (and on the far frame too when there is frame-rate headroom)
    const cam = G.camera;
    cam.getWorldDirection(_fd);
    const still =
      S.farCam &&
      cam.position.distanceToSquared(S.farCam) < 2.25 &&
      _fd.dot(S.farDir) > 0.99;
    const farMissing = !sun.shadow.map;
    S.sinceFar = (S.sinceFar === undefined ? RL._parity | 0 : S.sinceFar) + 1;
    const farNow =
      first || farMissing || S.sinceFar >= (still ? CYCLE_STILL : CYCLE);
    const nearNow = !farNow || first || S.both;
    if (farNow) {
      S.sinceFar = 0;
      if (!S.farCam) {
        S.farCam = new THREE.Vector3();
        S.farDir = new THREE.Vector3();
      }
      S.farCam.copy(cam.position);
      S.farDir.copy(_fd);
    }
    near.shadow.autoUpdate = nearNow;
    sun.shadow.autoUpdate = farNow;
    near.shadow.needsUpdate = false;
    S.lastKind = farNow && nearNow ? "both" : farNow ? "far" : "near";
    S.nFar += farNow ? 1 : 0;
    S.nNear += nearNow ? 1 : 0;
    // clutter casts only into the near map (on a 'both' frame it also lands in the far one — only with
    // headroom), only on the full tier, nearest-first under the live triangle budget
    const clutter = S.tier === 0 && nearNow && (!farNow || S.both);
    if (clutter) selectClutter();
    setNearCast(clutter);
  }

  /** frame-rate headroom → near map on every frame (no shadow lag at all); hysteresis + cool-down */
  function headroom(realDt) {
    const d = realDt > 0 && realDt < 0.5 ? realDt : 0.033;
    S.avgDt = S.avgDt ? S.avgDt * 0.95 + d * 0.05 : d;
    const now = performance.now() / 1000;
    if (G.SHOT || G.SMOKE || G.SURVEY) {
      S.both = false;
      return;
    }
    if (S.both) {
      if (S.avgDt > 1 / 42) {
        S.both = false;
        S.bothCool = now + 15;
        S.fastT = 0;
      }
    } else if (S.avgDt < 1 / 50 && now > (S.bothCool || 0)) {
      S.fastT = (S.fastT || 0) + d;
      if (S.fastT > 2) S.both = true;
    } else S.fastT = 0;
  }

  // ------------------------------------------------------------------
  // INTERIOR overhead shadow
  // ------------------------------------------------------------------
  const inCasters = []; // {o, box: Box3 (world), tris, on}
  let inKey = null,
    inActive = [];
  const _ib = new THREE.Box3();
  function cellKeyAt(x, z) {
    const I = G.LAYOUT && G.LAYOUT.INTERIORS;
    if (!I) return "x" + Math.round(x / 300) + "_" + Math.round(z / 300);
    let best = null,
      bd = 1e18;
    for (const k in I) {
      const o = I[k] && I[k].origin;
      if (!o) continue;
      const d = (o.x - x) * (o.x - x) + (o.z - z) * (o.z - z);
      if (d < bd) {
        bd = d;
        best = k;
      }
    }
    return best && bd < 230 * 230
      ? best
      : "x" + Math.round(x / 300) + "_" + Math.round(z / 300);
  }
  function isLamp(m) {
    if (!m.emissive || !m.emissive.isColor) return false;
    const e = m.emissive,
      k = m.emissiveIntensity === undefined ? 1 : m.emissiveIntensity;
    return (
      (0.2126 * e.r + 0.7152 * e.g + 0.0722 * e.b) * k >= 0.5 && !m.emissiveMap
    );
  }
  function inEligible(o) {
    if (
      !o.isMesh ||
      o.isSkinnedMesh ||
      o.castShadow ||
      !o.geometry ||
      !o.geometry.attributes.position
    )
      return false;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) {
      if (
        !m ||
        m.transparent ||
        m.isMeshBasicMaterial ||
        m.isShaderMaterial ||
        m.isRawShaderMaterial ||
        m.isSpriteMaterial
      )
        return false;
      if (m.opacity !== undefined && m.opacity < 0.9) return false;
      if (isLamp(m)) return false;
    }
    for (let p = o; p; p = p.parent) {
      const u = p.userData;
      if (u && (u.rlNoShadow || u.rlNoNearShadow)) return false;
      if (p.name && /^(atmos|rl_)/.test(p.name)) return false;
    }
    return true;
  }
  // Interior builders skip faces nobody sees (box bottoms, the undersides of table tops…); the shadow
  // pass draws BACK faces by default, so seen from above such furniture would cast nothing. While the
  // overhead shadow is on, the materials of the cell's casters render DOUBLE-SIDED into the map (a
  // shadow-pass-only setting: no program change) and get their own value back on the way out.
  const sideSaved = new Map(); // material → original shadowSide
  function dblSide(o) {
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms)
      if (m && !sideSaved.has(m)) {
        sideSaved.set(m, m.shadowSide);
        m.shadowSide = THREE.DoubleSide;
      }
  }
  function restoreSides() {
    for (const [m, v] of sideSaved) m.shadowSide = v;
    sideSaved.clear();
  }
  /** the interior cell's meshes (one traversal per cell, again ~2 s later for late builders) */
  function collectInterior(ox, oz) {
    restoreInterior();
    inCasters.length = 0;
    const HALF = 220;
    G.scene.updateMatrixWorld();
    G.scene.traverse((o) => {
      if (
        o.isMesh &&
        o.castShadow &&
        !o.isSkinnedMesh &&
        o.geometry &&
        o.material
      ) {
        // the cell's own casters (map / POI builders): double-sided for the overhead pass
        let b = o.geometry.boundingSphere;
        if (!b) {
          o.geometry.computeBoundingSphere();
          b = o.geometry.boundingSphere;
        }
        if (b) {
          _ib.min.copy(b.center).applyMatrix4(o.matrixWorld);
          if (
            Math.abs(_ib.min.x - ox) < HALF + b.radius &&
            Math.abs(_ib.min.z - oz) < HALF + b.radius
          )
            dblSide(o);
        }
        return;
      }
      if (!inEligible(o)) return;
      let b;
      if (o.isInstancedMesh) {
        if (!o.boundingBox && o.computeBoundingBox) o.computeBoundingBox();
        if (!o.boundingBox) return;
        b = o.boundingBox;
      } else {
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
        b = o.geometry.boundingBox;
      }
      _ib.copy(b).applyMatrix4(o.matrixWorld);
      if (!isFinite(_ib.min.x) || !isFinite(_ib.max.y)) return;
      const cx = (_ib.min.x + _ib.max.x) * 0.5,
        cz = (_ib.min.z + _ib.max.z) * 0.5;
      if (Math.abs(cx - ox) > HALF || Math.abs(cz - oz) > HALF) return;
      const sx = _ib.max.x - _ib.min.x,
        sy = _ib.max.y - _ib.min.y,
        sz = _ib.max.z - _ib.min.z;
      if (sy < 0.5 && sx > 10 && sz > 10) return; // floor / ceiling slab: never shades anything below the cut
      let tris = trisOf(o.geometry);
      if (o.isInstancedMesh) tris *= Math.max(1, o.count | 0);
      inCasters.push({ o, box: _ib.clone(), tris, on: false });
    });
    S.inCollected = inCasters.length;
    S.selIn = null;
  }
  function restoreInterior() {
    for (const e of inActive)
      if (e.on) {
        e.o.castShadow = false;
        e.on = false;
      }
    inActive = [];
    restoreSides();
  }
  function selectInterior(cx, cz, E, floor, cut) {
    const now = performance.now();
    const sel = S.selIn;
    if (
      sel &&
      Math.abs(cx - sel.x) + Math.abs(cz - sel.z) < 2 &&
      Math.abs(floor - sel.f) < 0.3 &&
      now - sel.t < 700
    )
      return;
    S.selIn = { x: cx, z: cz, f: floor, t: now };
    const y0 = floor - IN_BELOW,
      M = E + 0.5;
    const cand = [];
    const cam = G.camera.position;
    for (const e of inCasters) {
      const b = e.box;
      if (
        b.max.x < cx - M ||
        b.min.x > cx + M ||
        b.max.z < cz - M ||
        b.min.z > cz + M
      )
        continue;
      if (b.min.y > cut || b.max.y < y0) continue;
      if (!e.o.parent) continue;
      e.d = Math.hypot(
        Math.max(0, b.min.x - cam.x, cam.x - b.max.x),
        Math.max(0, b.min.z - cam.z, cam.z - b.max.z),
      );
      cand.push(e);
    }
    cand.sort((a, b) => a.d - b.d);
    let n = 0,
      tris = 0;
    const next = [];
    for (const e of cand) {
      if (n >= IN_MAXC || tris + e.tris > IN_MAXT) continue;
      next.push(e);
      n++;
      tris += e.tris;
    }
    for (const e of inActive) e.keep = false;
    for (const e of next) {
      e.keep = true;
      if (!e.on) {
        e.o.castShadow = true;
        e.on = true;
        dblSide(e.o);
      }
    }
    for (const e of inActive)
      if (!e.keep && e.on) {
        e.o.castShadow = false;
        e.on = false;
      }
    inActive = next;
    S.inCasters = n;
    S.inTris = tris;
    S.inCand = cand.length;
  }
  function leaveInterior() {
    restoreInterior();
    inKey = null;
    S.inMode = false;
    S.inFrames = 0;
    U.nrcCsm3.value.w = 0;
    near.shadow.camera.up.set(0, 1, 0);
    const cam = near.shadow.camera;
    cam.near = 1;
    cam.far = DIST + BEHIND;
    cam.updateProjectionMatrix();
    S.range = cam.far - cam.near;
    if (S.texelW) U.nrcCsm3.value.x = S.texelW / S.range;
    S.sinceFar = undefined;
    S.active = false; // outdoors again: both maps render on the next frame
    qfSet = false;
  }
