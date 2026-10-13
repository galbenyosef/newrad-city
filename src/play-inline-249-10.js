// play-inline-249 10 — opts
// Lines 2670-3004 of readable/play-inline-249.pretty.js (statement-aligned).
  PF.colWall = function (x0, z0, x1, z1, t, y0, y1, opts) {
    const dx = x1 - x0,
      dz = z1 - z0,
      len = Math.hypot(dx, dz);
    if (len < 0.01) return null;
    const ry = Math.atan2(-dz, dx); // local X along the wall
    return PF.col((x0 + x1) / 2, (z0 + z1) / 2, len, t, y0, y1, ry, opts);
  };
  /**
   * Fill a (local-space) polygon with run-length box colliders.  poly: [[x,z],...] in the
   * frame (ox, oz, ry).  Rows every `step` metres along local Z.
   */
  PF.fillPoly = function (poly, ox, oz, ry, y0, y1, step, opts) {
    step = step || 1.5;
    let minX = 1e9,
      maxX = -1e9,
      minZ = 1e9,
      maxZ = -1e9;
    for (const p of poly) {
      minX = Math.min(minX, p[0]);
      maxX = Math.max(maxX, p[0]);
      minZ = Math.min(minZ, p[1]);
      maxZ = Math.max(maxZ, p[1]);
    }
    const dx = Math.min(0.5, step / 2);
    let n = 0;
    for (let z = minZ + step / 2; z < maxZ; z += step) {
      let start = null;
      for (let x = minX; x <= maxX + dx; x += dx) {
        const inside = x <= maxX && G.LAYOUT.pointInPoly(x, z, poly);
        if (inside && start === null) start = x;
        if (!inside && start !== null) {
          const x0 = start,
            x1 = x - dx;
          const cx = (x0 + x1) / 2;
          if (x1 - x0 > 0.2) {
            const [wx, wz] = PF.rot(ox, oz, ry, cx, z);
            PF.col(wx, wz, x1 - x0 + dx, step + 0.05, y0, y1, ry, opts);
            n++;
          }
          start = null;
        }
      }
    }
    return n;
  };
  /** Local → world helper for a frame (ox,oz, ry) → returns [x,z]. */
  PF.rot = function (ox, oz, ry, lx, lz) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    return [ox + lx * c + lz * s, oz - lx * s + lz * c];
  };

  /**
   * Flight of stairs with matching step colliders (rise ≤ 0.34 m).
   * Starts at (x,z) at height y0 climbing toward local +Z (rotated by ry) to y1 over `run` metres.
   * key: material, width: stair width. opts.solid (default true) fills to y0-0.1; opts.sideWalls key for cheeks.
   */
  PF.stairs = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (opts.maxRise || 0.34)));
    const stepRun = run / n,
      stepH = rise / n;
    const base = opts.base === undefined ? y0 - 0.2 : opts.base;
    for (let i = 0; i < n; i++) {
      const top = y0 + stepH * (i + 1);
      const lz = stepRun * (i + 0.5);
      const [wx, wz] = PF.rot(x, z, ry, 0, lz);
      b.box(key, wx, base, wz, width, top - base, stepRun + 0.02, {
        ry,
        seg: false,
        grime: opts.grime,
        c: opts.c,
      });
      if (!opts.noCollide)
        PF.col(wx, wz, width, stepRun + 0.02, base, top, ry, {
          surface: opts.surface || "concrete",
        });
    }
    if (opts.cheeks) {
      for (const sgn of [-1, 1]) {
        const [cx, cz] = PF.rot(x, z, ry, sgn * (width / 2 + 0.25), run / 2);
        const hh = Math.max(y0, y1) + 0.9 - base;
        // sloped cheek wall approximated by a rotated box (visual) + stepped colliders
        const len = Math.hypot(run, rise);
        const g = new THREE.BoxGeometry(0.5, 0.9, len);
        const m = PF.m4(
          cx,
          (y0 + y1) / 2 + 0.45,
          cz,
          ry,
          -Math.atan2(rise, run),
          0,
        );
        b.add(opts.cheeks, g, { m });
        void hh;
        for (let i = 0; i < n; i += 2) {
          const top = y0 + stepH * (i + 1) + 0.9;
          const [wx, wz] = PF.rot(
            x,
            z,
            ry,
            sgn * (width / 2 + 0.25),
            stepRun * (i + 1),
          );
          PF.col(wx, wz, 0.5, stepRun * 2, base, top, ry, { walkable: false });
        }
      }
    }
    return n;
  };
  /**
   * Walkable ramp made of thin step slabs (for bridge decks). Samples a height fn along local +Z.
   * heightAt(t) where t ∈ [0,1] → y. Each slab ≤ maxRise above the previous.
   */
  PF.stepPath = function (x, z, ry, width, len, heightAt, opts) {
    opts = opts || {};
    const maxRise = opts.maxRise || 0.3;
    let t = 0;
    const out = [];
    const dt = Math.min(0.02, 1 / Math.max(1, len));
    while (t < 1) {
      const yA = heightAt(t);
      let t2 = t; // advance until height changes by maxRise or segment length hits maxLen
      const maxLen = (opts.maxLen || 3) / len;
      while (t2 < 1 && Math.abs(heightAt(t2) - yA) < maxRise && t2 - t < maxLen)
        t2 += dt;
      t2 = Math.min(1, t2);
      const top =
        Math.max(heightAt(t), heightAt(t2)) * 0.5 +
        Math.min(heightAt(t), heightAt(t2)) * 0.5;
      const [wx, wz] = PF.rot(x, z, ry, 0, ((t + t2) / 2) * len);
      const thick = opts.thick || 1.0;
      out.push(
        PF.col(
          wx,
          wz,
          width,
          (t2 - t) * len + 0.05,
          opts.solid ? opts.base || 0 : top - thick,
          top,
          ry,
          { surface: opts.surface || "concrete" },
        ),
      );
      t = t2;
    }
    return out;
  };

  // -------------------------------------------------------------------
  // Anchors / registry / interactables
  // -------------------------------------------------------------------
  /** Publish this module's entries into the shared G.pois registry (add, never clobber). */
  PF.publish = function () {
    if (!G.pois || G.pois.__stub) G.pois = {};
    const P = G.pois;
    for (const id in PF.entries) P[id] = PF.entries[id];
    if (typeof P.getAnchor !== "function") {
      // Installed only if no other POI module defined it first. Searches every registered POI
      // by id or interiorKey; returns a fresh Vector3 carrying .yaw.
      P.getAnchor = function (idOrKey, name) {
        const R = G.pois;
        const cl = (v) => {
          const c = new THREE.Vector3(v.x, v.y, v.z);
          c.yaw = v.yaw || 0;
          return c;
        };
        let e = idOrKey ? R[idOrKey] : null;
        if (!e || !e.anchors) {
          for (const k in R) {
            const o = R[k];
            if (o && o.interiorKey === idOrKey && o.anchors) {
              e = o;
              break;
            }
          }
        }
        if (e && e.anchors && e.anchors[name]) return cl(e.anchors[name]);
        if (!idOrKey) {
          for (const k in R) {
            const o = R[k];
            if (o && o.anchors && o.anchors[name]) return cl(o.anchors[name]);
          }
        }
        return null;
      };
    }
  };
  /** Anchor point (world) with a facing yaw (player/actor convention: forward = (-sin yaw, 0, -cos yaw)). */
  PF.anchor = function (x, y, z, yaw) {
    const v = new THREE.Vector3(x, y, z);
    v.yaw = yaw || 0;
    return v;
  };
  /** Yaw that faces from (x,z) toward (tx,tz), actor convention. */
  PF.yawTo = function (x, z, tx, tz) {
    return Math.atan2(-(tx - x), -(tz - z));
  };
  /**
   * Register a finished POI: {id, root, interiorRoot, interiorKey, anchors}. aliases: extra ids
   * (e.g. the interior key) pointing at the same entry.
   */
  PF.register = function (id, root, anchors, opts) {
    opts = opts || {};
    const e = {
      id,
      root,
      interiorRoot: opts.interiorRoot || null,
      interiorKey: opts.interiorKey || null,
      anchors: anchors || {},
      owner: "poi_bridges",
    };
    PF.entries[id] = e;
    PF.publish();
    return e;
  };
  // Loot-table ids we used historically / convenience names → real rpg tables (rpg/20_loot_tables.js).
  const LOOT_FIX = {
    museum: "wall_safe",
    common: "footlocker",
    continuity: "continuity_crate",
    raider: "raider_stash",
    ammo: "ammo_box",
    military: "weapon_crate",
  };
  /** Resolve a loot-table id against the live item registry (unknown ids → mapped alias → fallback → undefined). */
  PF.lootId = function (id, fallback) {
    if (!id) return id;
    let has = null;
    try {
      if (
        !G.isStub("items") &&
        G.items &&
        typeof G.items.hasLootTable === "function"
      )
        has = G.items.hasLootTable;
    } catch (e) {
      has = null;
    }
    if (!has) return LOOT_FIX[id] || id; // rpg absent: props uses its own fallback tables
    if (has(id)) return id;
    if (LOOT_FIX[id] && has(LOOT_FIX[id])) return LOOT_FIX[id];
    if (fallback && has(fallback)) return fallback;
    if (!PF._lootWarned) {
      PF._lootWarned = true;
      console.warn(
        '[poi_bridges] unknown loot table "' +
          id +
          '" — using the prop default',
      );
    }
    return undefined; // props falls back to the prop type's own table
  };
  /**
   * Every prop this module spawns (spec + live handle). Specs are spawned `persistent` with a stable id, so the props
   * module restores them on 'reset' (turrets revived, explosives re-armed) and rpg resets their containers to pristine;
   * PF.respawnMissing() (run on newGame / loaded) re-creates any handle that some other system removed anyway.
   */
  PF.spawned = PF.spawned || [];
  /** Safe G.props.spawn wrapper (props may be absent or half-built). */
  PF.spawnProp = function (type, opts, onRespawn) {
    opts = Object.assign({}, opts || {});
    if (opts.loot) {
      const l = PF.lootId(opts.loot, opts.lootFallback);
      if (l) opts.loot = l;
      else delete opts.loot;
    }
    delete opts.lootFallback;
    if (opts.persistent === undefined) opts.persistent = true;
    if (!opts.id)
      opts.id =
        "pbr:" +
        type +
        "@" +
        (+opts.x || 0).toFixed(1) +
        "," +
        (+opts.y || 0).toFixed(1) +
        "," +
        (+opts.z || 0).toFixed(1);
    const rec = { type, opts, handle: null, onRespawn: onRespawn || null };
    rec.handle = spawnRaw(type, opts);
    if (opts.lock) PF.lockContainer(rec.handle, opts.lock);
    PF.spawned.push(rec);
    return rec.handle;
  };
  function spawnRaw(type, opts) {
    try {
      if (G.isStub("props") || !G.props || typeof G.props.spawn !== "function")
        return null;
      return G.props.spawn(type, opts);
    } catch (e) {
      if (!PF._propWarned) {
        PF._propWarned = true;
        console.warn(
          "[poi_bridges] props.spawn failed for " +
            type +
            ": " +
            (e && e.message),
        );
      }
      return null;
    }
  }
  /** Re-create spawned props whose record was removed (by a reset elsewhere, or props rebuilding). Returns count. */
  PF.respawnMissing = function () {
    let n = 0;
    for (const rec of PF.spawned) {
      const h = rec.handle,
        r = h && h.record;
      const gone = h
        ? !!(r && r.removed)
        : !G.isStub("props") && G.props && typeof G.props.spawn === "function";
      if (!gone) continue;
      if (h && typeof h.remove === "function") {
        try {
          h.remove();
        } catch (e) {
          /* already gone */
        }
      }
      rec.handle = spawnRaw(rec.type, rec.opts);
      if (rec.onRespawn && rec.handle) {
        try {
          rec.onRespawn(rec.handle);
        } catch (e) {
          /* optional */
        }
      }
      n++;
    }
    return n;
  };
  /** Read-able plaque/interactable ('Read' → notify text). */
