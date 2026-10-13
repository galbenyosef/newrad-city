// play-inline-451 01 — math
// Lines 18-357 of readable/play-inline-451.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;
  const P = G.props;
  const X = P._;
  const PI = Math.PI;

  let L,
    rng,
    B = {},
    stats = {};
  const OCC = new Map();
  X.SC_CONTAINERS = [];

  // ------------------------------------------------------------------
  // placement helpers
  // ------------------------------------------------------------------
  // Street doors that already exist when props dresses the city (map's dungeon entrances, landmark doors):
  // keep a clear apron in front of them so scaffolding / vending machines / wrecks never block a way in.
  let DOOR_PTS = null;
  const DOOR_CLEAR = 4.5;
  function doorClear(x, z) {
    if (!DOOR_PTS) {
      DOOR_PTS = [];
      try {
        for (const d of G.world.doors || []) {
          const p = d.pos || (d.def && d.def.pos);
          if (p && p.x < L.INTERIOR_X_MIN) DOOR_PTS.push(p.x, p.z);
        }
      } catch (e) {
        /* optional */
      }
    }
    for (let i = 0; i < DOOR_PTS.length; i += 2) {
      const dx = x - DOOR_PTS[i],
        dz = z - DOOR_PTS[i + 1];
      if (dx * dx + dz * dz < DOOR_CLEAR * DOOR_CLEAR) return false;
    }
    return true;
  }
  const ok = (x, z) =>
    L.isLand(x, z) &&
    x < L.INTERIOR_X_MIN &&
    !L.inPark(x, z) &&
    !L.siteAt(x, z, 1.5) &&
    (L.isManhattan(x, z) || L.isBrooklyn(x, z)) &&
    doorClear(x, z);
  function occFree(x, z, r) {
    const r2 = r * r;
    for (let ix = Math.floor(x - r); ix <= Math.floor(x + r); ix++)
      for (let iz = Math.floor(z - r); iz <= Math.floor(z + r); iz++) {
        const dx = ix + 0.5 - x,
          dz = iz + 0.5 - z;
        if (dx * dx + dz * dz <= r2 + 0.5 && OCC.has(ix * 100003 + iz))
          return false;
      }
    return true;
  }
  function occMark(x, z, r) {
    const r2 = r * r;
    for (let ix = Math.floor(x - r); ix <= Math.floor(x + r); ix++)
      for (let iz = Math.floor(z - r); iz <= Math.floor(z + r); iz++) {
        const dx = ix + 0.5 - x,
          dz = iz + 0.5 - z;
        if (dx * dx + dz * dz <= r2 + 0.5) OCC.set(ix * 100003 + iz, 1);
      }
  }
  /** Solid colliders owned by other modules (buildings, landmarks, subway entrances...). */
  function blocked(x, z, r) {
    const cs = G.world.query(x - r, z - r, x + r, z + r);
    for (const c of cs) {
      if (c.tag && typeof c.tag === "string" && c.tag.indexOf("prop") === 0)
        continue;
      if (c.maxY < 0.45 || c.minY > 2.6) continue;
      if (G.world.pointInCollider(c, x, z, r)) return true;
    }
    return false;
  }
  /** Walkable ground at x,z: terrain or a low slab (sidewalk/curb collider) from the map. */
  function groundAt(x, z) {
    let y = X.ground(x, z);
    const cs = G.world.query(x - 0.1, z - 0.1, x + 0.1, z + 0.1);
    for (const c of cs)
      if (
        c.walkable &&
        c.maxY <= 0.45 &&
        c.maxY > y &&
        G.world.pointInCollider(c, x, z, 0)
      )
        y = c.maxY;
    return y;
  }
  X.groundAt = groundAt;
  function batcherFor(pr, tier) {
    return B[tier || pr.meta.tier || "small"] || B.small;
  }
  // Searchable junk piles (FO4-style scrap in the street heaps): a share of the garbage-bag piles and
  // rubble heaps get a pos-only container. Own RNG stream so it never shifts any placement.
  const JUNK_PILES = { garbage_bags: 0.07, rubble: 0.05, debris: 0.06 };
  let junkRng = null;
  /**
   * Place a static prop. o: {r (occupancy radius), noCollide, tint, rx, rz, s, y, force, tier (batcher override),
   * container:{...}|false, id}
   * Returns the placed info or null.
   */
  function put(name, variant, x, z, yaw, o) {
    o = o || {};
    const rej =
      stats.rejected || (stats.rejected = { land: 0, occupied: 0, blocked: 0 });
    const rb = stats.rejectedBy || (stats.rejectedBy = {});
    const miss = (why) => {
      rej[why]++;
      const e = rb[name] || (rb[name] = { land: 0, occupied: 0, blocked: 0 });
      e[why]++;
      return null;
    };
    if (!o.force && !ok(x, z)) return miss("land");
    const r = o.r !== undefined ? o.r : 0.5;
    if (r > 0 && !occFree(x, z, r)) return miss("occupied");
    // small clutter may tuck right up against a facade: only its core has to be clear
    if (
      !o.force &&
      blocked(x, z, r < 0.8 ? Math.min(r, 0.25) : Math.min(r, 0.6))
    )
      return miss("blocked");
    let pr;
    try {
      pr = X.proto(name, variant);
    } catch (e) {
      G.reportError("props:proto:" + name, e);
      return null;
    }
    const y = o.y !== undefined ? o.y : groundAt(x, z);
    // every placed static prop keeps a small record (batched vertex ranges, colliders, fx, container)
    // so the door guard (65_doorguard.js) can take it out again if a door turns up behind it later
    const rec = {
      name,
      variant,
      x,
      y,
      z,
      yaw,
      s: o.s || 1,
      mirror: !!o.mirror,
      pr,
      cols: null,
      fx: null,
      sc: null,
      pair: null,
      hidden: false,
    };
    batcherFor(pr, o.tier).add(pr, x, y, z, yaw, {
      tint: o.tint,
      rx: o.rx,
      rz: o.rz,
      s: o.s,
      mirror: o.mirror,
      rec,
    });
    if (r > 0) occMark(x, z, r);
    if (!o.noCollide)
      rec.cols = X.addProtoColliders(pr, x, y, z, yaw, o.s || 1, "prop", null);
    rec.fx = X.addProtoFx(pr, x, y, z, yaw, o.s || 1, true);
    X.PLACED.push(rec);
    stats[name] = (stats[name] || 0) + 1;
    // a far stand-in carries the silhouette (and the shadow) beyond the detail's LOD; goes with it everywhere
    if (pr.meta.farProxy && !o.tier) {
      const far = put(pr.meta.farProxy, variant, x, z, yaw, {
        force: true,
        r: 0,
        noCollide: true,
        container: false,
        y,
        s: o.s,
        rx: o.rx,
        rz: o.rz,
      });
      if (far) (rec.pair = rec.pair || []).push(far.rec);
    }
    // lootable?
    const md = pr.meta.container;
    if (
      md &&
      o.container !== false &&
      (o.container || rng() < (o.lootChance !== undefined ? o.lootChance : 1))
    ) {
      const cd = Object.assign({}, md, o.container || {});
      const iy =
        pr.meta.interactY !== undefined
          ? pr.meta.interactY
          : Math.min(1.0, pr.box.max.y * 0.6);
      const iz = pr.meta.interactZ || 0; // local z offset of the loot spot (e.g. the booth's counter window)
      X.SC_CONTAINERS.push(
        (rec.sc = {
          id: "props:sc:" + name + "@" + x.toFixed(1) + "," + z.toFixed(1),
          pos: new THREE.Vector3(
            x + Math.sin(yaw) * iz,
            y + iy,
            z + Math.cos(yaw) * iz,
          ),
          name: cd.name,
          loot: cd.loot,
          defLoot: cd.defLoot,
          lock: cd.lock,
          owner: cd.owner,
          container: null,
        }),
      );
    } else if (
      !md &&
      JUNK_PILES[name] &&
      junkRng &&
      o.junk !== false &&
      (variant === 1 || variant === 3 || name !== "rubble") &&
      junkRng() < JUNK_PILES[name]
    ) {
      X.SC_CONTAINERS.push(
        (rec.sc = {
          id: "props:sc:junk@" + x.toFixed(1) + "," + z.toFixed(1),
          pos: new THREE.Vector3(x, y + 0.45, z),
          name: "Junk Pile",
          loot: "junk_common",
          defLoot: "trash_can",
          container: null,
        }),
      );
      stats.junk_pile = (stats.junk_pile || 0) + 1;
    }
    return { pr, x, y, z, yaw, rec };
  }
  X.put = put;
  X.PLACED = [];
  /** Dynamic (spawned, destroyable) props that must not go into static batches. */
  function spawnDyn(type, o) {
    if (
      !ok(o.x, o.z) ||
      !occFree(o.x, o.z, o.r || 0.5) ||
      blocked(o.x, o.z, 0.4)
    )
      return null;
    occMark(o.x, o.z, o.r || 0.5);
    stats[type + "*"] = (stats[type + "*"] || 0) + 1;
    return P.spawn(
      type,
      Object.assign({ y: groundAt(o.x, o.z), persistent: true, _sc: true }, o),
    );
  }
  // Lanes other modules asked us to keep free of random street cars
  // (landmarks_b: Exchange gates, Flatiron market lane, Brooklyn Bridge ramps / toll gap).
  const NO_CARS = [
    [16, 800, 21, 808],
    [-2, 811, 2, 816],
    [124, 125, 165, 135],
    [140, 628, 600, 652],
  ];
  // + lanes our own set pieces reserve (a tent in the parking lane keeps the far lane open)
  let CLEAR = [];
  const inRects = (list, x, z, pad) =>
    list.some(
      (r) =>
        x > r[0] - pad && x < r[2] + pad && z > r[1] - pad && z < r[3] + pad,
    );
  const noCarZone = (x, z, pad) =>
    inRects(NO_CARS, x, z, pad) || inRects(CLEAR, x, z, pad);
  let trunkRng = null;
  // car placement with occupancy along the car footprint
  function putCar(kind, x, z, yaw, o) {
    o = o || {};
    if (!ok(x, z)) return null;
    if (!o.force && noCarZone(x, z, kind === "bus" ? 6 : 3.5)) return null;
    const K = X.CAR_KINDS[kind];
    const len = kind === "bus" ? 11.4 : kind === "fizzo_truck" ? 8 : 5.6;
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw);
    const n = Math.max(2, Math.round(len / 2.2));
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1) - 0.5) * (len - 1.6);
      const px = x + fx * t,
        pz = z + fz * t;
      if (!ok(px, pz) || !occFree(px, pz, 1.05) || blocked(px, pz, 1.0))
        return null;
    }
    for (let i = 0; i < n; i++) {
      const t = (i / (n - 1) - 0.5) * (len - 1.6);
      occMark(x + fx * t, z + fz * t, 1.1);
    }
    // 200 years on: most wrecks sit on rusted rims, a good share are gutted (bonnet up, door gone)
    const stripped = o.stripped !== undefined ? o.stripped : rng() < 0.72;
    const wreck = o.wreck !== undefined ? o.wreck : stripped && rng() < 0.32;
    const burnt = o.burnt !== undefined ? o.burnt : rng() < 0.24;
    const car = X.addCar(kind, x, z, yaw, {
      y: groundAt(x, z),
      stripped,
      wreck,
      burnt,
      flipped: o.flipped,
      onSide: o.onSide,
      roll:
        o.roll !== undefined
          ? o.roll
          : stripped
            ? (rng() - 0.5) * 0.09
            : (rng() - 0.5) * 0.03,
      pitch:
        o.pitch !== undefined ? o.pitch : stripped ? (rng() - 0.5) * 0.06 : 0,
      tint: o.tint,
      persistent: true,
    });
    car.sc = true;
    stats["car_" + kind] = (stats["car_" + kind] || 0) + 1;
    // a parked wreck's boot can still hold someone's luggage (own RNG stream: never shifts placements)
    if (
      o.trunk &&
      trunkRng &&
      !o.flipped &&
      !o.onSide &&
      !burnt &&
      kind !== "bus" &&
      kind !== "fizzo_truck" &&
      trunkRng() < 0.08
    ) {
      const back = len / 2 - 0.35,
        ty = groundAt(x, z) + 0.85;
      X.SC_CONTAINERS.push(
        (car.trunkSc = {
          id: "props:sc:trunk@" + x.toFixed(1) + "," + z.toFixed(1),
          pos: new THREE.Vector3(x - fx * back, ty, z - fz * back),
          name: kind === "police" ? "Police Cruiser Trunk" : "Car Trunk",
          loot: kind === "police" ? "ammo_box" : "props_car_trunk",
          defLoot: "luggage",
          container: null,
        }),
      );
      trunkRng(); // (a draw kept so the trunk stream stays where it was: trunks are never locked)
      stats.car_trunk = (stats.car_trunk || 0) + 1;
    }
    return car;
  }
  /** Static (batched) US Army cargo truck with the same footprint rules as putCar. v: 0 canvas, 1 bows+crates, 2 burnt. */
