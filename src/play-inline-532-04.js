// play-inline-532 04 — wid
// Lines 1031-1359 of readable/play-inline-532.pretty.js (statement-aligned).
  X.repair = function (row, method) {
    if (!row || !method) return { ok: false, reason: "Nothing to repair." };
    if (!method.can)
      return { ok: false, reason: method.why || "Can't repair." };
    const before = X.condOf(row.id);
    let ok = false;
    try {
      if (method.key === "dup") ok = !!G.inventory.repair(row.id);
      else if (method.key.indexOf("sim:") === 0) {
        const r = G.weapons.repairWith(row.id, method.donor);
        ok = !!(r && r.ok);
        if (!ok)
          return { ok: false, reason: (r && r.reason) || "Can't repair." };
      } else if (method.key === "kit") ok = X.applyKit(row.id, true);
    } catch (e) {
      G.reportError("crafting:repair", e);
      ok = false;
    }
    if (!ok) return { ok: false, reason: "Can't repair." };
    const after = X.condOf(row.id);
    X.S.stats.repaired++;
    X.sfxSeq([
      [0, "machinery_clank", { volume: 0.4, pitch: 1.2 }],
      [0.25, "reload", { volume: 0.5, pitch: 0.7 }],
    ]);
    if (row.def.type === "weapon")
      G.events.emit("weaponRepaired", row.id, after);
    return { ok: true, gain: after - before, cond: after };
  };
  /** Gunsmith Kit on weapon `id`. consume=false when the inventory screen already used it up. */
  X.applyKit = function (id, consume) {
    const d = X.def(id);
    if (
      !d ||
      d.type !== "weapon" ||
      !d.hasCondition ||
      isThrown(d) ||
      X.count(id) <= 0
    )
      return false;
    const cur = X.condOf(id),
      next = Math.min(1, cur + X.kitGain());
    if (next <= cur + 0.001) return false;
    if (consume) {
      try {
        if (G.inventory.remove(KIT, 1, { silent: true }) < 1) return false;
      } catch (e) {
        return false;
      }
    }
    try {
      if (X.wpnReal() && typeof G.weapons.setCondition === "function")
        G.weapons.setCondition(id, next);
      else G.inventory.setCondition(id, next);
    } catch (e) {
      G.reportError("crafting:kit", e);
      return false;
    }
    return true;
  };
  /** Inventory "use" of a kit (already consumed): fix the equipped weapon, else refund. */
  X.onItemUsed = function (id) {
    if (id !== KIT) return;
    let wid = null;
    try {
      wid = G.inventory.equipped ? G.inventory.equipped("weapon") : null;
    } catch (e) {
      wid = null;
    }
    if (!wid) {
      try {
        const c = G.weapons.current && G.weapons.current();
        wid = c && c.id !== "unarmed" ? c.id : null;
      } catch (e) {
        wid = null;
      }
    }
    const before = wid ? X.condOf(wid) : 0;
    if (wid && X.applyKit(wid, false)) {
      const after = X.condOf(wid);
      X.S.stats.repaired++;
      try {
        G.notify(
          X.name(wid) +
            " repaired to " +
            Math.round(after * 100) +
            "% (+" +
            Math.round((after - before) * 100) +
            "%).",
          { kind: "item", icon: "wrench" },
        );
      } catch (e) {
        /* ignore */
      }
      G.events.emit("weaponRepaired", wid, after);
      return;
    }
    // nothing to fix: give the kit back
    try {
      G.inventory.add(KIT, 1, { silent: true });
    } catch (e) {
      /* ignore */
    }
    try {
      G.notify(
        wid
          ? "Your " + X.name(wid) + " is already in perfect condition."
          : "Equip the weapon you want to repair first.",
        { kind: "error" },
      );
    } catch (e) {
      /* ignore */
    }
  };

  // ------------------------------------------------------------------
  // Ground finding (downward ray must land near street/park level)
  // ------------------------------------------------------------------
  const _down = new THREE.Vector3(0, -1, 0),
    _o = new THREE.Vector3();
  /**
   * Walkable floor height at (x, z) or null. fromY: cast down from there instead of the sky (inside
   * walk-in buildings, under a roof); interior: an INTERIORS cell (no land / terrain test).
   */
  X.groundAt = function (x, z, maxY, fromY, interior) {
    const L = G.LAYOUT;
    if (!interior && L && L.isLand && !L.isLand(x, z)) return null;
    let hit = null;
    const y0 = fromY !== undefined ? fromY : 60;
    try {
      hit = G.world.raycast(
        _o.set(x, y0, z),
        _down,
        fromY !== undefined ? 6 : 90,
        { ignoreTags: ["actor", "foliage"] },
      );
    } catch (e) {
      hit = null;
    }
    const th = interior
      ? fromY !== undefined
        ? fromY - 2.2
        : 0
      : G.world.terrainHeight
        ? G.world.terrainHeight(x, z)
        : 0;
    if (fromY !== undefined && !hit && !interior && th < fromY - 6) return null;
    const y = hit ? hit.point.y : th;
    if (
      y > th + (maxY || 1.2) ||
      y < (G.world.waterLevel !== undefined ? G.world.waterLevel + 0.4 : -0.8)
    )
      return null;
    if (hit && hit.normal && hit.normal.y < 0.82) return null;
    let gy = y;
    try {
      if (G.world.groundHeight) gy = G.world.groundHeight(x, z, y + 0.8, 0.05);
    } catch (e) {
      gy = y;
    }
    if (!isFinite(gy) || Math.abs(gy - y) > 1.2) gy = y;
    return gy;
  };
  /** Ring search for open ground near (x,z). opts.clear = radius that must be free of colliders at waist height. */
  X.findSpot = function (x, z, radius, opts) {
    opts = opts || {};
    for (let ring = 0; ring <= 6; ring++) {
      const n = ring ? 8 + ring * 2 : 1;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + ring * 0.7,
          r = (ring / 6) * radius;
        const px = x + Math.cos(a) * r,
          pz = z + Math.sin(a) * r;
        const gy = X.groundAt(px, pz);
        if (gy === null) continue;
        if (opts.clear && !clearAround(px, gy, pz, opts.clear)) continue;
        return { x: px, y: gy, z: pz };
      }
    }
    return null;
  };
  const _dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0.7071, 0.7071],
    [-0.7071, 0.7071],
    [0.7071, -0.7071],
    [-0.7071, -0.7071],
  ];
  const _d3 = new THREE.Vector3();
  function clearAround(x, y, z, r) {
    for (const [dx, dz] of _dirs) {
      _d3.set(dx, 0, dz);
      let h = null;
      try {
        h = G.world.raycast(_o.set(x, y + 0.6, z), _d3, r, {
          ignoreTags: ["actor", "foliage"],
        });
      } catch (e) {
        h = null;
      }
      if (h) return false;
    }
    return true;
  }

  // ------------------------------------------------------------------
  // Stations: campfires (one pooled interactable) & workbenches
  // ------------------------------------------------------------------
  X.fires = []; // Vector3 (label height) of every known campfire
  X.nearFire = null;
  X.propsList = function () {
    try {
      return real("props") && typeof G.props.list === "function"
        ? G.props.list() || []
        : [];
    } catch (e) {
      return [];
    }
  };
  X.scanStations = function () {
    const list = X.propsList();
    X.fires.length = 0;
    X.benchCount = 0;
    for (const p of list) {
      if (!p || !p.pos) continue;
      if (p.type === "campfire") {
        if (
          X.fires.some(
            (f) => Math.abs(f.x - p.pos.x) < 1 && Math.abs(f.z - p.pos.z) < 1,
          )
        )
          continue;
        X.fires.push(new THREE.Vector3(p.pos.x, p.pos.y + 0.45, p.pos.z));
      } else if (p.type === "workbench") X.benchCount++;
    }
    X.nearFire = null;
    return X.fires.length;
  };
  let fireInt = null,
    nearT = 0;
  X.setupCampfireInteract = function () {
    if (fireInt || !G.world || !G.world.addInteractable) return;
    fireInt = G.world.addInteractable({
      getPos: () => X.nearFire,
      radius: 0.85,
      range: 2.6,
      priority: 0.2,
      label: "Campfire",
      verb: "Cook",
      enabled: () => !!X.nearFire,
      onInteract: () => {
        C.open("campfire");
      },
    });
  };
  /** Keep X.nearFire = closest campfire within 14 m (no allocations). */
  X.updateNearFire = function (realDt) {
    nearT -= realDt;
    if (nearT > 0) return;
    nearT = 0.3;
    const p = G.player && G.player.pos;
    if (!p) return;
    let best = null,
      bd = 14 * 14;
    for (let i = 0; i < X.fires.length; i++) {
      const f = X.fires[i];
      const dx = f.x - p.x,
        dz = f.z - p.z,
        dy = f.y - p.y;
      const d2 = dx * dx + dz * dz + dy * dy * 4;
      if (d2 < bd) {
        bd = d2;
        best = f;
      }
    }
    X.nearFire = best;
  };
  /** Light our own camp fires / workbench where an area has none (persistent world props). */
  X.spawnStations = function () {
    if (!real("props") || typeof G.props.spawn !== "function") return;
    const list = X.propsList();
    const near = (type, x, z, r) =>
      list.some(
        (p) =>
          p.type === type && p.pos && Math.hypot(p.pos.x - x, p.pos.z - z) < r,
      );
    for (const [x, z, kind] of X.CAMPFIRES) {
      if (near("campfire", x, z, 40)) continue;
      const s = X.findSpot(x, z, 8, { clear: 1.2 });
      if (!s) continue;
      try {
        G.props.spawn("campfire", {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw: 0,
          pot: kind === "pot",
          spit: kind === "spit",
          id: "cr_fire_" + Math.round(x) + "_" + Math.round(z),
        });
      } catch (e) {
        G.reportError("crafting:campfire", e);
      }
    }
    for (const [x, z, yaw] of X.WORKBENCHES) {
      if (near("workbench", x, z, 40)) continue;
      const s = X.findSpot(x, z, 8, { clear: 1.4 });
      if (!s) continue;
      try {
        G.props.spawn("workbench", {
          x: s.x,
          y: s.y,
          z: s.z,
          yaw,
          id: "cr_bench_" + Math.round(x) + "_" + Math.round(z),
        });
      } catch (e) {
        G.reportError("crafting:workbench", e);
      }
    }
  };

  // ------------------------------------------------------------------
  // Schematic pickups in the world
  // ------------------------------------------------------------------
  let schemPlaced = false;
