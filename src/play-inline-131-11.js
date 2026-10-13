// play-inline-131 11 — opts
// Lines 2837-3182 of readable/play-inline-131.pretty.js (statement-aligned).
  LB.fillPoly = function (poly, ox, oz, ry, y0, y1, step, opts) {
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
            const [wx, wz] = LB.rot(ox, oz, ry, cx, z);
            LB.col(wx, wz, x1 - x0 + dx, step + 0.05, y0, y1, ry, opts);
            n++;
          }
          start = null;
        }
      }
    }
    return n;
  };
  /** Local → world helper for a frame (ox,oz, ry) → returns [x,z]. */
  LB.rot = function (ox, oz, ry, lx, lz) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    return [ox + lx * c + lz * s, oz - lx * s + lz * c];
  };

  /**
   * Flight of stairs with matching step colliders (rise ≤ 0.34 m).
   * Starts at (x,z) at height y0 climbing toward local +Z (rotated by ry) to y1 over `run` metres.
   * key: material, width: stair width. opts.solid (default true) fills to y0-0.1; opts.sideWalls key for cheeks.
   */
  LB.stairs = function (b, key, x, z, ry, width, run, y0, y1, opts) {
    opts = opts || {};
    const rise = y1 - y0;
    const n = Math.max(1, Math.ceil(Math.abs(rise) / (opts.maxRise || 0.34)));
    const stepRun = run / n,
      stepH = rise / n;
    const base = opts.base === undefined ? y0 - 0.2 : opts.base;
    for (let i = 0; i < n; i++) {
      const top = y0 + stepH * (i + 1);
      const lz = stepRun * (i + 0.5);
      const [wx, wz] = LB.rot(x, z, ry, 0, lz);
      b.box(key, wx, base, wz, width, top - base, stepRun + 0.02, {
        ry,
        seg: false,
        grime: opts.grime,
        c: opts.c,
      });
      if (!opts.noCollide)
        LB.col(wx, wz, width, stepRun + 0.02, base, top, ry, {
          surface: opts.surface || "concrete",
        });
    }
    if (opts.cheeks) {
      for (const sgn of [-1, 1]) {
        const [cx, cz] = LB.rot(x, z, ry, sgn * (width / 2 + 0.25), run / 2);
        const hh = Math.max(y0, y1) + 0.9 - base;
        // sloped cheek wall approximated by a rotated box (visual) + stepped colliders
        const len = Math.hypot(run, rise);
        const g = new THREE.BoxGeometry(0.5, 0.9, len);
        const m = LB.m4(
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
          const [wx, wz] = LB.rot(
            x,
            z,
            ry,
            sgn * (width / 2 + 0.25),
            stepRun * (i + 1),
          );
          LB.col(wx, wz, 0.5, stepRun * 2, base, top, ry, { walkable: false });
        }
      }
    }
    return n;
  };
  /**
   * Walkable ramp made of thin step slabs (for bridge decks). Samples a height fn along local +Z.
   * heightAt(t) where t ∈ [0,1] → y. Each slab ≤ maxRise above the previous.
   */
  LB.stepPath = function (x, z, ry, width, len, heightAt, opts) {
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
      const [wx, wz] = LB.rot(x, z, ry, 0, ((t + t2) / 2) * len);
      const thick = opts.thick || 1.0;
      out.push(
        LB.col(
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
  /** Publish (or refresh) this module's entries into G.landmarks without clobbering others. */
  LB.publish = function () {
    if (!G.landmarks || G.landmarks.__stub) G.landmarks = {};
    const L = G.landmarks;
    for (const id in LB.entries) L[id] = LB.entries[id];
    if (typeof L.getAnchor !== "function") {
      // Only installed when landmarks_a (which loads first) did not define one. Returns a fresh Vector3 with .yaw.
      L.getAnchor = function (siteId, name) {
        const LL = G.landmarks;
        const cl = (v) => {
          const c = v.clone();
          c.yaw = v.yaw || 0;
          return c;
        };
        const e = siteId ? LL[siteId] : null;
        if (e && e.anchors && e.anchors[name]) return cl(e.anchors[name]);
        if (!e) {
          // unknown / null site: search every landmark for the anchor name
          for (const k in LL) {
            const o = LL[k];
            if (o && o.anchors && o.anchors[name]) return cl(o.anchors[name]);
          }
        }
        return null;
      };
    }
  };
  /** Anchor point (world) with a facing yaw (player/actor convention: forward = (-sin yaw, 0, -cos yaw)). */
  LB.anchor = function (x, y, z, yaw) {
    const v = new THREE.Vector3(x, y, z);
    v.yaw = yaw || 0;
    return v;
  };
  /** Yaw that faces from (x,z) toward (tx,tz), actor convention. */
  LB.yawTo = function (x, z, tx, tz) {
    return Math.atan2(-(tx - x), -(tz - z));
  };
  /** Register a finished landmark. aliases: extra ids (e.g. LOCATION ids) pointing at the same entry. */
  LB.register = function (id, root, anchors, aliases) {
    const e = { id, root, anchors: anchors || {}, owner: "landmarks_b" };
    LB.entries[id] = e;
    if (aliases) for (const a of aliases) LB.entries[a] = e;
    LB.publish();
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
  LB.lootId = function (id, fallback) {
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
    if (!LB._lootWarned) {
      LB._lootWarned = true;
      console.warn(
        '[landmarks_b] unknown loot table "' +
          id +
          '" — using the prop default',
      );
    }
    return undefined; // props falls back to the prop type's own table
  };
  /**
   * Every prop this module spawns (spec + live handle). Specs are spawned `persistent` with a stable id, so the props
   * module restores them on 'reset' (turrets revived, explosives re-armed) and rpg resets their containers to pristine;
   * LB.respawnMissing() (run on newGame / loaded) re-creates any handle that some other system removed anyway.
   */
  LB.spawned = LB.spawned || [];
  /** Safe G.props.spawn wrapper (props may be absent or half-built). */
  LB.spawnProp = function (type, opts, onRespawn) {
    opts = Object.assign({}, opts || {});
    if (opts.loot) {
      const l = LB.lootId(opts.loot, opts.lootFallback);
      if (l) opts.loot = l;
      else delete opts.loot;
    }
    delete opts.lootFallback;
    if (opts.persistent === undefined) opts.persistent = true;
    if (!opts.id)
      opts.id =
        "lb:" +
        type +
        "@" +
        (+opts.x || 0).toFixed(1) +
        "," +
        (+opts.y || 0).toFixed(1) +
        "," +
        (+opts.z || 0).toFixed(1);
    const rec = { type, opts, handle: null, onRespawn: onRespawn || null };
    rec.handle = spawnRaw(type, opts);
    LB.spawned.push(rec);
    return rec.handle;
  };
  function spawnRaw(type, opts) {
    try {
      if (G.isStub("props") || !G.props || typeof G.props.spawn !== "function")
        return null;
      return G.props.spawn(type, opts);
    } catch (e) {
      if (!LB._propWarned) {
        LB._propWarned = true;
        console.warn(
          "[landmarks_b] props.spawn failed for " +
            type +
            ": " +
            (e && e.message),
        );
      }
      return null;
    }
  }
  /** Re-create spawned props whose record was removed (by a reset elsewhere, or props rebuilding). Returns count. */
  LB.respawnMissing = function () {
    let n = 0;
    for (const rec of LB.spawned) {
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
  LB.plaque = function (pos, title, text, onRead) {
    try {
      G.world.addInteractable({
        pos,
        radius: 0.7,
        label: title,
        verb: "Read",
        range: 2.5,
        onInteract() {
          G.notify(title + " — " + text, { duration: 9 });
          G.sfx.play("ui_click");
          if (onRead) {
            try {
              onRead();
            } catch (e) {
              G.reportError && G.reportError("landmarks_b:plaque", e);
            }
          }
        },
      });
    } catch (e) {
      /* core missing */
    }
  };

  // Locks: keys / codes / passcodes (G.locks). While the locks module is absent the lock simply opens.
  /** Open a lock spec ({id, label, key?, code?, passcode?, hint?}), then run onOpen. */
  LB.openLock = function (spec, onOpen) {
    try {
      if (!G.isStub("locks") && G.locks && typeof G.locks.open === "function") {
        if (G.locks.isOpen && G.locks.isOpen(spec.id)) {
          onOpen();
          return;
        }
        G.locks.open(spec, onOpen);
        return;
      }
    } catch (e) {
      G.reportError && G.reportError("locks:" + spec.id, e);
    }
    onOpen();
  };
  /** Declare a lock for the audit (call from a build / initDone hook, never at script top level). */
