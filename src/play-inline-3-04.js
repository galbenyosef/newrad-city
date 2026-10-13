// play-inline-3 04 — def
// Lines 963-1308 of readable/play-inline-3.pretty.js (statement-aligned).
  W.raycast = function (origin, dir, maxDist, opts) {
    opts = opts || {};
    const ignore = opts.ignoreTags ? new Set(opts.ignoreTags) : null;
    let best = maxDist,
      hit = null,
      hitN = null;
    const step = CELL;
    stamp++;
    const myStamp = stamp;
    const nSteps = Math.ceil(maxDist / step) + 1;
    for (let s = 0; s <= nSteps; s++) {
      const t0 = s * step;
      if (t0 > best + step) break;
      const px = origin.x + dir.x * t0,
        pz = origin.z + dir.z * t0;
      const px2 = origin.x + dir.x * Math.min(t0 + step, maxDist),
        pz2 = origin.z + dir.z * Math.min(t0 + step, maxDist);
      for (
        let cx = Math.floor(Math.min(px, px2) / CELL) - 0;
        cx <= Math.floor(Math.max(px, px2) / CELL);
        cx++
      ) {
        for (
          let cz = Math.floor(Math.min(pz, pz2) / CELL);
          cz <= Math.floor(Math.max(pz, pz2) / CELL);
          cz++
        ) {
          const arr = W.grid.get(cellKey(cx, cz));
          if (!arr) continue;
          for (const c of arr) {
            if (c._stamp === myStamp) continue;
            c._stamp = myStamp;
            if (ignore && ignore.has(c.tag)) continue;
            // slab test in collider local frame
            const lo = toLocal(c, origin.x, origin.z);
            const ldx = dir.x * c.cos - dir.z * c.sin,
              ldz = dir.x * c.sin + dir.z * c.cos;
            let tmin = 0,
              tmax = best,
              nAxis = -1,
              nSign = 0;
            const slabs = [
              [lo[0], ldx, -c.hx, c.hx, 0],
              [origin.y, dir.y, c.minY, c.maxY, 1],
              [lo[1], ldz, -c.hz, c.hz, 2],
            ];
            let ok = true;
            for (const sl of slabs) {
              const o = sl[0],
                d = sl[1];
              if (Math.abs(d) < 1e-9) {
                if (o < sl[2] || o > sl[3]) {
                  ok = false;
                  break;
                }
                continue;
              }
              let t1 = (sl[2] - o) / d,
                t2 = (sl[3] - o) / d,
                sg = -1;
              if (t1 > t2) {
                const tt = t1;
                t1 = t2;
                t2 = tt;
                sg = 1;
              }
              if (t1 > tmin) {
                tmin = t1;
                nAxis = sl[4];
                nSign = sg;
              }
              if (t2 < tmax) tmax = t2;
              if (tmin > tmax) {
                ok = false;
                break;
              }
            }
            if (!ok || tmin >= best || nAxis < 0) continue;
            best = tmin;
            hit = c;
            if (nAxis === 1) hitN = [0, nSign, 0];
            else {
              const wd =
                nAxis === 0 ? toWorldDir(c, nSign, 0) : toWorldDir(c, 0, nSign);
              hitN = [wd[0], 0, wd[1]];
            }
          }
        }
      }
    }
    // terrain / water
    if (dir.y < -1e-4) {
      const tStep = 1.0;
      for (let t = 0; t < best; t += tStep) {
        const x = origin.x + dir.x * t,
          y = origin.y + dir.y * t,
          z = origin.z + dir.z * t;
        let gh = W.terrainHeight(x, z);
        if (opts.includeWater && gh < W.waterLevel) gh = W.waterLevel;
        if (y <= gh) {
          best = Math.max(0, t - tStep * 0.5);
          hit = null;
          hitN = [0, 1, 0];
          break;
        }
      }
    }
    if (!hitN) return null;
    return {
      dist: best,
      point: new THREE.Vector3(
        origin.x + dir.x * best,
        origin.y + dir.y * best,
        origin.z + dir.z * best,
      ),
      normal: new THREE.Vector3(hitN[0], hitN[1], hitN[2]),
      collider: hit,
      surface: hit
        ? hit.surface
        : G.LAYOUT &&
            G.LAYOUT.inPark(origin.x + dir.x * best, origin.z + dir.z * best)
          ? "grass"
          : "concrete",
    };
  };
  W.lineOfSight = function (a, b, opts) {
    _v.subVectors(b, a);
    const d = _v.length();
    if (d < 1e-3) return true;
    _v.divideScalar(d);
    const h = W.raycast(a, _v, d, opts);
    return !h || h.dist >= d - 0.3;
  };

  // ---- Interactables ------------------------------------------------
  /**
   * Register something the player can activate with E.
   * def: {pos:Vector3 | getPos():Vector3, radius=0.8, label:string|fn, verb:'Open'|'Talk'|'Take'|..., enabled?():bool,
   *       onInteract(), object3d?, priority=0, range?}
   */
  // Broad phase: the ~1,100 interactables are culled to a short candidate list near the eye, rebuilt 4x/s
  // (or when the eye moves > 2 m / the list changes). A generous pad covers items moving between rebuilds.
  let _cand = [],
    _candDirty = true,
    _candT = 0;
  const _candEye = new THREE.Vector3(1e9, 0, 0),
    CAND_PAD = 6;
  W.addInteractable = function (def) {
    def.radius = def.radius || 0.8;
    def.id = def.id || U.randomId("int");
    W.interactables.push(def);
    _candDirty = true;
    return def;
  };
  W.removeInteractable = function (def) {
    const i = W.interactables.indexOf(def);
    if (i >= 0) W.interactables.splice(i, 1);
    const j = _cand.indexOf(def);
    if (j >= 0) _cand.splice(j, 1);
    if (W.focus === def) {
      W.focus = null;
      G.events.emit("focus", null);
    }
  };
  function rebuildCandidates(eye) {
    _cand = [];
    for (const it of W.interactables) {
      let p;
      try {
        p = it.getPos ? it.getPos() : it.pos;
      } catch (e) {
        p = null;
      }
      if (!p) {
        if (it.getPos) _cand.push(it);
        continue;
      } // position unknown right now: keep testing it
      const r = (it.range || W.interactRange) + (it.radius || 0.8) + CAND_PAD;
      const dx = p.x - eye.x,
        dy = (p.y || 0) - eye.y,
        dz = p.z - eye.z;
      if (dx * dx + dy * dy + dz * dz < r * r) _cand.push(it);
    }
    _candEye.copy(eye);
    _candDirty = false;
    _candT = 0.25;
  }
  const _fwd = new THREE.Vector3(),
    _to = new THREE.Vector3(),
    _eye = new THREE.Vector3();
  function updateFocus() {
    let best = null,
      bestScore = -1e9;
    if (G.player && G.player.thirdPersonActive) {
      _eye.copy(G.player.eye);
      _fwd.copy(G.player.forward);
    } // camera is behind the player
    else {
      G.camera.getWorldPosition(_eye);
      G.camera.getWorldDirection(_fwd);
    }
    _candT -= G.realDt || 0.016;
    if (_candDirty || _candT <= 0 || _eye.distanceToSquared(_candEye) > 4)
      rebuildCandidates(_eye);
    for (const it of _cand) {
      if (it.enabled && !it.enabled()) continue;
      const p = it.getPos ? it.getPos() : it.pos;
      if (!p) continue;
      _to.subVectors(p, _eye);
      const dist = _to.length();
      const range = (it.range || W.interactRange) + it.radius;
      if (dist > range) continue;
      _to.divideScalar(dist || 1);
      const dot = _to.dot(_fwd);
      const angTol = Math.atan2(it.radius, Math.max(dist, 0.1));
      const ang = Math.acos(U.clamp(dot, -1, 1));
      if (ang > angTol + 0.12) continue;
      const score = -ang * 3 - dist * 0.1 + (it.priority || 0);
      if (score > bestScore) {
        bestScore = score;
        best = it;
      }
    }
    if (best) {
      // occlusion check
      const p = best.getPos ? best.getPos() : best.pos;
      if (
        !W.lineOfSight(_eye, p, { ignoreTags: ["interactable_self", "actor"] })
      ) {
        const d = _eye.distanceTo(p);
        if (d > 1.2) best = null;
      }
    }
    if (best !== W.focus) {
      W.focus = best;
      G.events.emit("focus", best);
    }
  }
  W.getFocusLabel = function () {
    const f = W.focus;
    if (!f) return null;
    return {
      verb: typeof f.verb === "function" ? f.verb() : f.verb || "Activate",
      label: typeof f.label === "function" ? f.label() : f.label || "",
      locked: f.locked
        ? typeof f.locked === "function"
          ? f.locked()
          : f.locked
        : null,
    };
  };

  // ---- Doors / teleports ---------------------------------------------
  /**
   * def: {pos:Vector3, label:'Records Room', verb:'Enter', target:{x,y,z,yaw}, lock?:{id, key?, code?, passcode?} (G.locks),
   *       sound?:'door_open'|…, radius?, onEnter?()}   (locked?: truthy = a script-held door that only scripts open)
   */
  W.addDoor = function (def) {
    const door = W.addInteractable({
      pos: def.pos,
      radius: def.radius || 1.2,
      label: def.label,
      verb: def.verb || "Enter",
      priority: 1,
      locked: () =>
        def.lock
          ? G.locks &&
            G.locks.isOpen &&
            !G.isStub("locks") &&
            !G.locks.isOpen(def.lock.id)
            ? "Locked"
            : null
          : door._locked
            ? "Locked"
            : null,
      onInteract() {
        if (
          def.lock &&
          G.locks &&
          !G.isStub("locks") &&
          G.locks.open &&
          !G.locks.isOpen(def.lock.id)
        ) {
          G.locks.open(
            def.lock,
            () => door.def && door.onInteract && door.onInteract(),
          );
          return;
        }
        if (door._locked) {
          G.sfx.play("door_locked");
          G.notify("This door is locked.");
          return;
        }
        G.sfx.play(def.sound || "door_open");
        G.fadeTransition(() => {
          G.player.teleport(
            def.target.x,
            def.target.y || 0,
            def.target.z,
            def.target.yaw || 0,
          );
          if (def.onEnter) def.onEnter();
          G.events.emit("doorTransition", def);
        });
      },
    });
    door._locked = def.locked || 0;
    door.def = def;
    W.doors.push(door);
    return door;
  };
  /** Stable key for a door's lock state in saves (explicit def.id, else its rounded position). */
  function doorKey(d) {
    if (d.def && d.def.id) return String(d.def.id);
    const p = d.pos || (d.def && d.def.pos);
    if (!p) return null;
    return (
      Math.round(p.x * 10) +
      "," +
      Math.round((p.y || 0) * 10) +
      "," +
      Math.round(p.z * 10)
    );
  }
  /** Script-held doors opened this playthrough (locked by definition, now open). */
  W.unlockedDoorKeys = function () {
    const out = [];
    for (const d of W.doors)
      if (d.def && d.def.locked > 0 && !d._locked) {
        const k = doorKey(d);
        if (k) out.push(k);
      }
    return out;
  };
  /** Restore every door to its defined lock, then re-open the given keys (save data). */
  W.restoreDoorLocks = function (unlocked) {
    const set = new Set(unlocked || []);
    for (const d of W.doors) {
      if (!d.def) continue;
      d._locked = set.has(doorKey(d)) ? 0 : d.def.locked || 0;
    }
  };

  // ---- Distance LOD / culling ---------------------------------------
  /** Hide obj when camera farther than maxDist (checked 4×/s). */
