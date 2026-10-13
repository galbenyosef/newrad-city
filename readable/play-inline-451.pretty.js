/* src/props/60_scatter.js */
/* =====================================================================
 * props / 60_scatter.js — CITY-WIDE SET DRESSING.
 * Walks every avenue, street and Broadway segment of G.LAYOUT and dresses
 * it like a street 22 years after the bombs: parked & jammed wrecks,
 * crash pile-ups in intersections, lamp posts (a few still flickering),
 * traffic signals (some fallen), hydrants, parking meters, dead street
 * trees, mailboxes, newspaper boxes, phone booths, bus stops, sidewalk
 * sheds & scaffolding, garbage bag piles, litter, dumpsters, Fizzo Cola
 * machines, Civil Defense kiosks, skeletons, freestanding billboards; faction
 * dressing around LAYOUT.LOCATIONS (raider barricades, Iron Covenant sandbag
 * lines, Brute gore, Glowkeeper radiation barrels, settlement junk
 * walls & lights); old-world evacuation checkpoints; environmental-
 * storytelling vignettes; Brooklyn dockyards; and 150+ lootable containers.
 * Static props are merged per chunk (Batcher); cars are instanced.
 * ===================================================================== */
(function () {
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
  function putTruck(v, x, z, yaw, o) {
    o = o || {};
    if (!ok(x, z) || noCarZone(x, z, 4)) return null;
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw),
      len = 7.4;
    for (let i = 0; i < 4; i++) {
      const t = (i / 3 - 0.5) * (len - 1.6),
        px = x + fx * t,
        pz = z + fz * t;
      if (!ok(px, pz) || !occFree(px, pz, 1.15) || blocked(px, pz, 1.0))
        return null;
    }
    const placed = put("army_truck", v, x, z, yaw, {
      force: true,
      r: 0,
      lootChance: o.lootChance !== undefined ? o.lootChance : 0.5,
      rz: v === 2 ? (rng() - 0.5) * 0.05 : 0,
    });
    if (placed)
      for (let i = 0; i < 4; i++) {
        const t = (i / 3 - 0.5) * (len - 1.6);
        occMark(x + fx * t, z + fz * t, 1.2);
      }
    return placed;
  }
  function pickCarKind(district, lane) {
    const t = rng();
    const taxiP =
      district === "midtown" || district === "midtown_south" ? 0.2 : 0.08;
    if (lane === "traffic" && t < 0.05) return "bus";
    if (t < taxiP) return "taxi";
    const u = rng();
    if (u < 0.36) return "sedan";
    if (u < 0.68) return "coupe";
    if (u < 0.78) return "van";
    if (u < 0.86) return "pickup";
    if (u < 0.92) return "police";
    return lane === "parking" && rng() < 0.6 ? "fizzo_truck" : "sedan";
  }
  /** Is (x,z) inside some OTHER corridor (intersection zone)? pad in metres. */
  function inCrossing(x, z, self, pad) {
    pad = pad || 0;
    for (const s of L.streets)
      if (
        s !== self &&
        x >= s.x0 - pad &&
        x <= s.x1 + pad &&
        Math.abs(z - s.z) <= s.width / 2 + pad
      )
        return true;
    for (const a of L.avenues)
      if (
        a !== self &&
        z >= a.z0 - pad &&
        z <= a.z1 + pad &&
        Math.abs(x - a.x) <= a.width / 2 + pad
      )
        return true;
    return false;
  }
  function nearLocation(x, z, pad, pred) {
    for (const l of L.LOCATIONS) {
      if (l.interior) continue;
      if (pred && !pred(l)) continue;
      if (Math.hypot(x - l.x, z - l.z) < l.r + pad) return l;
    }
    return null;
  }
  /** Per-instance shade of old enamel for the tintable Patrolman shells. */
  const robotTint = () =>
    [0xffffff, 0xf4ecd8, 0xece2c2, 0xe0d8c8, 0xfff2d0, 0xd8ccb0][
      (rng() * 6) | 0
    ];
  /** A location's faction id. */
  const fac = (l) => l.faction;
  /** Trade towns that greet travellers with FRIENDLY / TRADE boards (the Neon and its sister towns). */
  const GREETING_TOWNS = new Set([
    "times_square",
    "chelsea_hotel",
    "ellis_island",
    "gracie_mansion",
    "lyceum_theatre",
  ]);
  const isSettlement = (l) =>
    !l.hostile &&
    (l.type === "settlement" || fac(l) === "settlers" || fac(l) === "covenant");

  // ------------------------------------------------------------------
  // A generic sidewalk dresser. Works in corridor-local coordinates:
  //   along = distance along the corridor, across = signed offset from the
  //   corridor centre line. frame(along, across) → {x, z}; faceYaw(side)
  //   gives the yaw that makes a prop's front (-z) face the roadway.
  // ------------------------------------------------------------------
  function dressSidewalks(C) {
    const { len, road, width, frame, faceYaw, alongYaw, self, district } = C;
    const curb = road / 2 + 0.6,
      wall = width / 2 - 0.55,
      mid = (road / 2 + width / 2) / 2,
      walk = width / 2 - road / 2;
    for (const side of [-1, 1]) {
      const fy = faceYaw(side);
      const onSidewalk = (a, off) => {
        const p = frame(a, side * off);
        return !inCrossingRoad(p.x, p.z, self) ? p : null;
      };
      // --- lamp posts: every ~32 m at the curb ---
      const lampPhase = rng() * 30;
      for (let a = 6 + lampPhase; a < len - 6; a += 42 + rng() * 10) {
        const p = onSidewalk(a, curb + 0.1);
        if (!p) continue;
        const nearSet = nearLocation(p.x, p.z, 60, isSettlement);
        const lit = nearSet
          ? rng() < 0.55
            ? 3
            : rng() < 0.5
              ? 1
              : 0
          : rng() < 0.08
            ? 1
            : 0;
        const v = !nearSet && rng() < 0.12 ? 2 : lit;
        put("lamp_post", v, p.x, p.z, fy, { r: 0.45 });
      }
      // --- street trees (avenues and some streets) ---
      if (C.trees) {
        for (let a = 10 + rng() * 6; a < len - 8; a += 16 + rng() * 8) {
          if (rng() < 0.5) continue;
          const p = onSidewalk(a, curb + 0.3);
          if (!p) continue;
          put("planter", rng() < 0.85 ? 1 : 2, p.x, p.z, rng() * 6, { r: 0.7 });
        }
      }
      // --- parking meters in stretches ---
      if (rng() < 0.55) {
        const a0 = rng() * len * 0.5,
          a1 = a0 + 20 + rng() * 40;
        for (let a = a0; a < Math.min(len - 4, a1); a += 6.5) {
          const p = onSidewalk(a, curb - 0.05);
          if (p)
            put(
              "parking_meter",
              rng() < 0.2 ? 1 : 0,
              p.x,
              p.z,
              fy + (rng() - 0.5) * 0.2,
              { r: 0.2, rz: rng() < 0.15 ? (rng() - 0.5) * 0.3 : 0 },
            );
        }
      }
      // --- corner furniture near both ends of each block edge ---
      const corners = [];
      // find block edges: runs of sidewalk not interrupted by crossings
      let runStart = null;
      for (let a = 0; a <= len; a += 2) {
        const p = frame(a, side * mid);
        const okp = !inCrossingRoad(p.x, p.z, self) && ok(p.x, p.z);
        if (okp && runStart === null) runStart = a;
        if ((!okp || a >= len - 1) && runStart !== null) {
          if (a - runStart > 12) corners.push([runStart, a - 2]);
          runStart = null;
        }
      }
      for (const [b0, b1] of corners) {
        const blen = b1 - b0;
        for (const end of [0, 1]) {
          const aE = end ? b1 - 2.5 : b0 + 2.5,
            dir = end ? -1 : 1;
          // hydrant close to the corner
          if (rng() < 0.33) {
            const p = frame(aE + dir * (2 + rng() * 3), side * (curb - 0.1));
            put(
              "hydrant",
              rng() < 0.15 ? 1 : rng() < 0.1 ? 2 : 0,
              p.x,
              p.z,
              fy + rng() * 0.6,
              { r: 0.35 },
            );
          }
          // mailbox (lootable) on alternate corners
          if (rng() < 0.2) {
            const p = frame(aE + dir * (4 + rng() * 2), side * (curb + 0.4));
            put(
              "mailbox",
              rng() < 0.15 ? 1 : 0,
              p.x,
              p.z,
              fy + (rng() - 0.5) * 0.3,
              { r: 0.55, lootChance: 1 },
            );
          }
          // newspaper boxes cluster
          if (rng() < 0.2) {
            const n = 1 + ((rng() * 3) | 0),
              a1 = aE + dir * (6.5 + rng() * 2);
            for (let i = 0; i < n; i++) {
              const p = frame(a1 + dir * i * 0.55, side * (curb + 0.3));
              put(
                "newsbox",
                (rng() * 3) | 0,
                p.x,
                p.z,
                fy + (rng() - 0.5) * 0.25,
                { r: 0.28, rz: rng() < 0.1 ? 0.2 : 0 },
              );
            }
          }
          // litter basket
          if (rng() < 0.3) {
            const p = frame(aE + dir * (1.2 + rng()), side * (curb + 0.2));
            const tip = rng() < 0.2;
            put(
              "trash_can",
              tip ? 2 : rng() < 0.7 ? 0 : 1,
              p.x,
              p.z,
              rng() * 6,
              { r: 0.4, lootChance: 0.2 },
            );
          }
          // traffic signal pole at the corner (occasionally fallen)
          if (C.signals && rng() < 0.4) {
            const p = frame(aE + dir * 0.5, side * (curb - 0.2));
            const fallen = rng() < 0.18;
            put(
              "traffic_light",
              fallen ? 1 : 0,
              p.x,
              p.z,
              fy + (fallen ? (rng() - 0.5) * 0.8 : 0),
              { r: fallen ? 0 : 0.35 },
            );
          }
        }
        // --- mid-block features ---
        if (blen > 30) {
          const am = b0 + blen * (0.3 + rng() * 0.4);
          const t = rng();
          if (t < 0.12) {
            const p = frame(am, side * (curb + 0.9));
            put("phone_booth", rng() < 0.4 ? 1 : 0, p.x, p.z, fy, { r: 0.8 });
          } else if (t < 0.22 && C.busStops) {
            const p = frame(am, side * (curb + (walk > 3.5 ? 1.3 : 0.9)));
            put("bus_stop", walk > 3.5 && rng() < 0.6 ? 1 : 0, p.x, p.z, fy, {
              r: walk > 3.5 ? 1.7 : 0.3,
            });
          } else if (t < 0.26) {
            const p = frame(am, side * mid);
            put("street_clock", 0, p.x, p.z, fy, { r: 0.4 });
          } else if (t < 0.33) {
            const p = frame(am, side * (wall - 0.2));
            put("ocd_kiosk", 0, p.x, p.z, fy, { r: 0.7 });
          }
          // sidewalk shed along part of the block (very New York)
          if (rng() < 0.18) {
            const modules = 2 + ((rng() * 5) | 0);
            const a0 = b0 + 3 + rng() * Math.max(1, blen - modules * 3 - 6);
            const depthVar = walk > 3.5 ? 1 : 0;
            const collapseAt = rng() < 0.3 ? (rng() * modules) | 0 : -1;
            for (let i = 0; i < modules; i++) {
              const a = a0 + i * 3 + 1.5;
              if (a > b1 - 2) break;
              const p = frame(a, side * (road / 2 + walk / 2));
              put(
                "sidewalk_shed",
                depthVar + (i === collapseAt ? 2 : 0),
                p.x,
                p.z,
                fy,
                { r: 0, noCollide: true },
              );
            }
          } else if (rng() < 0.08) {
            const p = frame(b0 + blen * 0.5, side * (wall - 0.6));
            put("scaffold_tower", (rng() * 6) | 0, p.x, p.z, fy + PI, {
              r: 0,
              noCollide: true,
              force: false,
            });
          }
        }
        // --- rubble spilling from the facades: every 10-20 m on most blocks ---
        if (rng() < 0.8)
          for (let a = b0 + 4 + rng() * 8; a < b1 - 3; a += 10 + rng() * 12) {
            if (rng() < 0.3) continue;
            const v = rng() < 0.12 ? 2 : rng() < 0.3 ? 3 : rng() < 0.55 ? 1 : 0;
            const R = [0.7, 1.1, 1.6, 1.0][v];
            const p = frame(a, side * (wall + 0.35 - R * 0.55));
            put("rubble", v, p.x, p.z, rng() * 6, { r: R * 0.8 });
          }
        // --- wall-side clutter along the block ---
        for (let a = b0 + 2 + rng() * 4; a < b1 - 2; a += 4 + rng() * 6) {
          const p = frame(a, side * (wall - 0.1));
          const t = rng();
          if (t < 0.28)
            put("garbage_bags", (rng() * 3) | 0, p.x, p.z, rng() * 6, {
              r: 0.7,
            });
          else if (t < 0.34) {
            const q = frame(a, side * (wall - 0.8));
            put(
              "dumpster",
              (rng() * 3) | 0,
              q.x,
              q.z,
              fy + (rng() - 0.5) * 0.15,
              { r: 1.1, lootChance: 0.45 },
            );
          } else if (t < 0.43) {
            const q = frame(a, side * (wall - 0.35));
            put(
              "fizzo_machine",
              rng() < 0.12 ? 2 : rng() < 0.5 ? 1 : 0,
              q.x,
              q.z,
              fy + (rng() - 0.5) * 0.08,
              { r: 0.65, lootChance: 0.5 },
            );
          } else if (t < 0.5)
            put(
              "crate_stack",
              (rng() * 2) | 0,
              p.x,
              p.z,
              alongYaw + (rng() - 0.5) * 0.3,
              { r: 1.2 },
            );
          else if (t < 0.55)
            put("crate", (rng() * 5) | 0, p.x, p.z, rng() * 6, { r: 0.5 });
          else if (t < 0.6)
            put("pallet", (rng() * 3) | 0, p.x, p.z, rng() * 6, { r: 0.8 });
          else if (t < 0.64)
            put(
              "mattress",
              1,
              frame(a, side * (wall + 0.05)).x,
              frame(a, side * (wall + 0.05)).z,
              fy,
              { r: 0.6 },
            );
          else if (t < 0.69)
            put(
              "sandwich_board",
              (rng() * 2) | 0,
              frame(a, side * (wall - 0.9)).x,
              frame(a, side * (wall - 0.9)).z,
              fy + (rng() - 0.5) * 0.5,
              { r: 0.45 },
            );
          else if (t < 0.74) {
            const q = frame(a, side * (wall - 0.5));
            put("skeleton", 1, q.x, q.z, fy, { r: 0.6 });
          } else if (t < 0.78)
            put(
              "poster_board",
              0,
              frame(a, side * (wall + 0.1)).x,
              frame(a, side * (wall + 0.1)).z,
              fy,
              { r: 1.3 },
            );
          else if (t < 0.83)
            put("debris", (rng() * 3) | 0, p.x, p.z, rng() * 6, { r: 0.9 });
          else if (t < 0.86)
            put("tire", (rng() * 3) | 0, p.x, p.z, rng() * 6, { r: 0.45 });
          else if (t < 0.88)
            put("barrel", rng() < 0.5 ? 0 : 5, p.x, p.z, rng() * 6, {
              r: 0.45,
            });
          else if (t < 0.9)
            put(
              "bench",
              rng() < 0.3 ? 1 : 0,
              frame(a, side * (wall - 0.4)).x,
              frame(a, side * (wall - 0.4)).z,
              fy,
              { r: 1.0 },
            );
          else if (t < 0.96)
            put("litter", (rng() * 3) | 0, p.x, p.z, rng() * 6, {
              r: 0,
              noCollide: true,
            });
          else
            put(
              "shopping_cart",
              rng() < 0.4 ? 1 : 0,
              frame(a, side * (wall - 0.6)).x,
              frame(a, side * (wall - 0.6)).z,
              rng() * 6,
              { r: 0.6 },
            );
        }
      }
      // --- litter & grates everywhere on the sidewalk ---
      for (let a = rng() * 6; a < len; a += 5 + rng() * 7) {
        const off = road / 2 + 0.8 + rng() * (walk - 1.2);
        const p = onSidewalk(a, off);
        if (!p) continue;
        put("litter", (rng() * 3) | 0, p.x, p.z, rng() * 6, {
          r: 0,
          noCollide: true,
        });
      }
      for (let a = 20 + rng() * 40; a < len - 5; a += 45 + rng() * 60) {
        const p = onSidewalk(a, mid);
        if (p) put("grate", 0, p.x, p.z, alongYaw, { r: 1.1, noCollide: true });
      }
      // --- gutter drift: litter, bags and the odd tire washed against the curb (road side) ---
      for (let a = 3 + rng() * 6; a < len - 4; a += 6 + rng() * 8) {
        const p = onSidewalk(a, road / 2 - 0.45);
        if (!p) continue;
        const t = rng();
        if (t < 0.55)
          put(
            "litter",
            (rng() * 3) | 0,
            p.x,
            p.z,
            alongYaw + (rng() - 0.5) * 0.4,
            { r: 0, noCollide: true },
          );
        else if (t < 0.7)
          put("garbage_bags", 0, p.x, p.z, rng() * 6, { r: 0.5 });
        else if (t < 0.8)
          put("tire", (rng() * 3) | 0, p.x, p.z, rng() * 6, { r: 0.45 });
        else if (t < 0.92)
          put("debris", 0, p.x, p.z, rng() * 6, { r: 0.6, noCollide: true });
        else put("rubble", 0, p.x, p.z, rng() * 6, { r: 0.6 });
      }
    }
  }
  /** Block edges along one side of a corridor: runs of sidewalk not interrupted by crossings → [[a0, a1], ...]. */
  function blockRuns(C, side, minLen) {
    const { len, road, width, frame, self } = C;
    const mid = (road / 2 + width / 2) / 2,
      runs = [];
    let runStart = null;
    for (let a = 0; a <= len; a += 2) {
      const p = frame(a, side * mid);
      const okp = !inCrossingRoad(p.x, p.z, self) && ok(p.x, p.z);
      if (okp && runStart === null) runStart = a;
      if ((!okp || a >= len - 1) && runStart !== null) {
        if (a - runStart > minLen) runs.push([runStart, a - 2]);
        runStart = null;
      }
    }
    return runs;
  }
  // ------------------------------------------------------------------
  // Street furniture pass (round 1): FDNY call boxes, Forever Franks carts,
  // green newsstands and souvenir tables. Runs after the sidewalks on its
  // own RNG stream per corridor, so it only fills what is still free.
  // ------------------------------------------------------------------
  function dressFurniture(C) {
    const { road, width, frame, faceYaw, alongYaw, district } = C;
    const curb = road / 2 + 0.6,
      walk = width / 2 - road / 2;
    const midtown = district === "midtown" || district === "midtown_south";
    for (const side of [-1, 1]) {
      const fy = faceYaw(side);
      for (const [b0, b1] of blockRuns(C, side, 12)) {
        const blen = b1 - b0;
        for (const end of [0, 1]) {
          const aE = end ? b1 - 2.5 : b0 + 2.5,
            dir = end ? -1 : 1;
          // FDNY fire-alarm call box on the avenue corners (a few knocked flat)
          if (C.signals && rng() < 0.2) {
            const p = frame(
                aE + dir * (3.2 + rng() * 1.5),
                side * (curb + 0.1),
              ),
              kn = rng() < 0.2;
            put(
              "call_box",
              kn ? 1 : 0,
              p.x,
              p.z,
              kn ? fy + (rng() < 0.5 ? PI / 2 : -PI / 2) : fy,
              { r: kn ? 1.0 : 0.3 },
            );
          }
          // a street vendor's cart that never went home (midtown gets more)
          if (rng() < (midtown ? 0.1 : 0.05)) {
            for (let t = 0; t < 3; t++) {
              const p = frame(
                aE + dir * (4.5 + t * 2.5 + rng() * 1.5),
                side * (curb + 0.55),
              );
              if (!storefrontDoorClear(p.x, p.z, 2.5)) continue;
              if (
                put(
                  "food_cart",
                  rng() < 0.4 ? 1 : 0,
                  p.x,
                  p.z,
                  alongYaw + (rng() < 0.5 ? PI : 0) + (rng() - 0.5) * 0.35,
                  { r: 1.15, lootChance: 0.6 },
                )
              )
                break;
            }
          }
        }
        // NYC newsstand mid-block on the wide sidewalks (avenues & Broadway), back to the traffic, window to
        // the walkway; the rest of the sidewalk (≥ 1.2 m, 1.6 m on the avenues) stays walkable.
        if (
          (C.kind === "ave" || C.kind === "bway") &&
          blen > 22 &&
          rng() < (midtown ? 0.2 : 0.12)
        ) {
          const across = C.kind === "ave" ? road / 2 + 1.6 : road / 2 + 1.0;
          const keep = C.kind === "ave" ? road / 2 + 3.2 : road / 2 + 2.4;
          for (const off of [0, 4, -4, 8, -8]) {
            const a = (b0 + b1) / 2 + off + (rng() - 0.5) * 2;
            if (a < b0 + 5 || a > b1 - 5) continue;
            const p = frame(a, side * across);
            let free = storefrontDoorClear(p.x, p.z, 3.5);
            for (const da of [-1.2, 0, 1.2])
              for (const dc of [-0.45, 0.45]) {
                if (!free) break;
                const q = frame(a + da, side * (across + dc));
                if (!occFree(q.x, q.z, 0.35) || blocked(q.x, q.z, 0.3))
                  free = false;
              }
            for (const da of [-1.5, 0, 1.5]) {
              if (!free) break;
              const q = frame(a + da, side * keep);
              if (!occFree(q.x, q.z, 0.3) || blocked(q.x, q.z, 0.3))
                free = false;
            }
            if (!free) continue;
            const shutStand = rng() < 0.55;
            if (
              put("newsstand", shutStand ? 0 : 1, p.x, p.z, fy + PI, {
                r: 0,
                force: true,
                lootChance: shutStand ? 0.85 : 0.7,
              })
            ) {
              for (const da of [-1.4, -0.5, 0.5, 1.4]) {
                const q = frame(a + da, side * across);
                occMark(q.x, q.z, 0.9);
              }
              for (const da of [-1.5, 0, 1.5]) {
                const q = frame(a + da, side * keep);
                occMark(q.x, q.z, 0.4);
              } // keep the walkway clear
              break;
            }
          }
        }
        // a souvenir seller's folding table at the curb (midtown, Broadway)
        if (
          blen > 20 &&
          rng() < (midtown ? 0.07 : C.kind === "bway" ? 0.05 : 0.02) &&
          walk >= 3
        ) {
          const a = b0 + blen * (0.25 + rng() * 0.5),
            p = frame(a, side * (curb + (walk >= 3.5 ? 1.1 : 0.8)));
          if (storefrontDoorClear(p.x, p.z, 2.5))
            put(
              "vendor_table",
              rng() < 0.35 ? 1 : 0,
              p.x,
              p.z,
              fy + PI + (rng() - 0.5) * 0.15,
              { r: 1.1, lootChance: 0.7 },
            );
        }
      }
    }
  }
  /** Is (x,z) on the ROADWAY of a corridor other than self (i.e. a crossing)? */
  function inCrossingRoad(x, z, self) {
    for (const s of L.streets)
      if (
        s !== self &&
        x >= s.x0 &&
        x <= s.x1 &&
        Math.abs(z - s.z) <= s.width / 2 + 0.3
      )
        return true;
    for (const a of L.avenues)
      if (
        a !== self &&
        z >= a.z0 &&
        z <= a.z1 &&
        Math.abs(x - a.x) <= a.width / 2 + 0.3
      )
        return true;
    if (self && !self.broadway && L.onBroadway(x, z, false)) return true;
    return false;
  }

  // ------------------------------------------------------------------
  // Cars along a corridor: parking lanes (both curbs) + traffic jams
  // ------------------------------------------------------------------
  function dressRoad(C) {
    const { len, road, frame, self, district, oneWayYaw, lanes } = C;
    const curbLane = road / 2 - 1.3;
    // --- parking lanes: long rows of abandoned cars, a few double-parked or slewed ---
    for (const side of [-1, 1]) {
      const density = C.parkDensity !== undefined ? C.parkDensity : 0.5;
      let a = 2 + rng() * 5;
      while (a < len - 3) {
        const kind = pickCarKind(district, "parking");
        const L2 = kind === "fizzo_truck" ? 8 : 5.6;
        const p = frame(a, side * curbLane);
        if (rng() < density && !inCrossing(p.x, p.z, self, 4)) {
          const slew = rng() < 0.12 ? (rng() - 0.5) * 0.9 : (rng() - 0.5) * 0.1;
          const cp = frame(
            a + L2 / 2,
            side *
              (curbLane +
                (rng() - 0.5) * 0.3 +
                (Math.abs(slew) > 0.2 ? -0.5 : 0)),
          );
          if (!inCrossing(cp.x, cp.z, self, 4))
            putCar(
              kind,
              cp.x,
              cp.z,
              oneWayYaw + slew + (rng() < 0.1 ? PI : 0),
              { trunk: true },
            );
          // double-parked delivery van / cab beside it
          if (rng() < 0.06 && !C.narrow) {
            const dp = frame(a + L2 / 2 + 1, side * (curbLane - 2.4));
            putCar(
              rng() < 0.5 ? "van" : "taxi",
              dp.x,
              dp.z,
              oneWayYaw + (rng() - 0.5) * 0.15,
            );
          }
        }
        a += L2 + 0.5 + rng() * 2.4;
      }
    }
    // --- traffic jams: the evacuation gridlock frozen in place. Bumper-to-bumper
    // runs of 4-8 cars, slewed and crumpled into each other, some shunted onto
    // the kerb, tipped on their sides or roofs. At any point at least one lane
    // (or the sidewalk) stays passable.
    for (let a = 6 + rng() * 20; a < len - 10;) {
      if (rng() < (C.jam || 0.35)) {
        const li = (rng() * lanes.length) | 0,
          lane = lanes[li];
        const other = lanes.length > 1 ? lanes[1 - li] : null;
        const n = 4 + ((rng() * 5) | 0);
        let aa = a,
          pileUp = rng() < 0.3; // a pile-up has one violent crash in the middle of the run
        const crashAt = pileUp ? 1 + ((rng() * (n - 2)) | 0) : -1;
        for (let i = 0; i < n && aa < len - 6; i++) {
          const kind = pickCarKind(district, "traffic");
          const L2 = kind === "bus" ? 11.4 : kind === "fizzo_truck" ? 8 : 5.6;
          const crash = i === crashAt || rng() < 0.08;
          let off = lane + (rng() - 0.5) * 0.7,
            yawJ = (rng() - 0.5) * 0.3,
            o = {};
          if (crash) {
            yawJ = (rng() < 0.5 ? -1 : 1) * (0.5 + rng() * 0.7);
            const t = rng();
            if (t < 0.22) o.onSide = rng() < 0.5 ? 1 : -1;
            else if (t < 0.34) o.flipped = true;
            o.burnt = rng() < 0.55;
          } else if (!C.narrow && rng() < 0.1) {
            // swerved onto the kerb, nose on the sidewalk
            const sd = Math.sign(lane || 1);
            off = sd * (road / 2 - 0.9);
            yawJ = sd * (0.35 + rng() * 0.25) * (oneWayYaw === 0 ? -1 : 1);
            o.roll = sd * 0.05;
          }
          const p = frame(aa + L2 / 2, off);
          let laneOk = !inCrossing(p.x, p.z, self, 2);
          if (laneOk && C.narrow) {
            // narrow street: keep one parking lane free beside the jammed car
            const pl = frame(aa + L2 / 2, -curbLane),
              pr = frame(aa + L2 / 2, curbLane);
            if (!occFree(pl.x, pl.z, 1.0) && !occFree(pr.x, pr.z, 1.0))
              laneOk = false;
          }
          if (laneOk) putCar(kind, p.x, p.z, oneWayYaw + yawJ, o);
          // cars side by side in the second lane for part of the run (avenues)
          if (other !== null && rng() < 0.45) {
            const q = frame(
              aa + L2 / 2 + (rng() - 0.5) * 2,
              other + (rng() - 0.5) * 0.6,
            );
            if (!inCrossing(q.x, q.z, self, 2))
              putCar(
                pickCarKind(district, "traffic"),
                q.x,
                q.z,
                oneWayYaw + (rng() - 0.5) * 0.35,
              );
          }
          aa += L2 + 0.2 + rng() * 1.4 + (crash ? 1.2 : 0);
        }
        // glass, a lost hubcap/bumper, a tyre and litter strewn around the run
        for (let k = 0; k < 2 + (n >> 1); k++) {
          const q = frame(a + rng() * (aa - a), lane + (rng() - 0.5) * 4.5);
          const t = rng();
          if (t < 0.45)
            put("car_debris", (rng() * 3) | 0, q.x, q.z, rng() * 6, {
              r: 0.4,
              noCollide: true,
            });
          else if (t < 0.65)
            put("tire", rng() < 0.7 ? 0 : 2, q.x, q.z, rng() * 6, { r: 0.4 });
          else
            put("litter", (rng() * 3) | 0, q.x, q.z, rng() * 6, {
              r: 0,
              noCollide: true,
            });
        }
        a = aa + 4 + rng() * 22;
      } else a += 14 + rng() * 24;
    }
    // --- lone abandoned cars stopped mid-lane between jams ---
    for (let a = 10 + rng() * 40; a < len - 10; a += 35 + rng() * 60) {
      if (rng() > (C.jam || 0.35) * 0.8) continue;
      const lane = lanes[(rng() * lanes.length) | 0],
        p = frame(a, lane + (rng() - 0.5));
      if (!inCrossing(p.x, p.z, self, 3))
        putCar(
          pickCarKind(district, "traffic"),
          p.x,
          p.z,
          oneWayYaw + (rng() - 0.5) * 0.6,
        );
    }
  }

  // ------------------------------------------------------------------
  // Intersection pile-ups and old-world checkpoints
  // ------------------------------------------------------------------
  function dressIntersections() {
    for (const a of L.avenues)
      for (const s of L.streets) {
        if (s.park) continue;
        if (a.x < s.x0 || a.x > s.x1 || s.z < a.z0 || s.z > a.z1) continue;
        const cx = a.x,
          cz = s.z;
        if (!ok(cx, cz)) continue;
        const t = rng();
        if (t < 0.24) {
          // crash pile-up: 3-5 cars smashed together at angles, a gap left on one side
          const n = 3 + ((rng() * 3) | 0);
          const gapSide = rng() < 0.5 ? -1 : 1;
          for (let i = 0; i < n; i++) {
            const ox = (rng() - 0.5) * 7 - gapSide * 2.5,
              oz = (rng() - 0.5) * 7;
            const u = rng();
            putCar(
              pickCarKind(L.districtAt(cx, cz), "traffic"),
              cx + ox,
              cz + oz,
              rng() * PI * 2,
              {
                burnt: rng() < 0.55,
                flipped: u < 0.1,
                onSide: u > 0.1 && u < 0.24 ? (rng() < 0.5 ? 1 : -1) : 0,
              },
            );
          }
          put(
            "debris",
            2,
            cx + gapSide * -3,
            cz + (rng() - 0.5) * 4,
            rng() * 6,
            { r: 0.8 },
          );
          for (let i = 0; i < 3; i++)
            put(
              "car_debris",
              (rng() * 3) | 0,
              cx + (rng() - 0.5) * 9,
              cz + (rng() - 0.5) * 9,
              rng() * 6,
              { r: 0.3, noCollide: true },
            );
        } else if (t < 0.3 && !nearLocation(cx, cz, 30)) {
          // abandoned army checkpoint: jersey barriers + sandbags + crates, a gap for traffic
          CHECKPOINTS.push({ a, s, cx, cz }); // (the Army post pass dresses its approaches later, own stream)
          const along = rng() < 0.5; // barrier line across the avenue (E-W) or across the street (N-S)
          for (let i = -2; i <= 2; i++) {
            if (i === (rng() < 0.5 ? -1 : 1)) continue;
            const bx = along ? cx + i * 3.1 : cx,
              bz = along ? cz : cz + i * 3.1;
            put(
              "jersey_barrier",
              rng() < 0.3 ? 2 : 0,
              bx,
              bz,
              along ? 0 : PI / 2,
              { r: 1.2 },
            );
          }
          put("sandbags", 1, cx + 7, cz + 7, PI, { r: 1.2 });
          put("crate", 2, cx + 7.5, cz - 7, rng() * 6, { r: 0.7 });
          put("sawhorse", 2, cx - 7, cz + 7.5, PI / 4, { r: 1.2 });
          put("skeleton", 0, cx - 6.5, cz - 6, rng() * 6, { r: 0.7 });
          spawnDyn("ammo_box", {
            x: cx + 7.8,
            z: cz - 5.8,
            yaw: rng() * 6,
            r: 0.4,
          });
          // the police Patrolman posted here, run down where it stood guard
          if (rng() < 0.5)
            put(
              "robot_wreck",
              rng() < 0.6 ? 6 : 7,
              cx + (rng() < 0.5 ? -1 : 1) * (4.5 + rng() * 2),
              cz + (rng() < 0.5 ? -1 : 1) * (4.5 + rng() * 2),
              rng() * 6,
              { r: 1.3, lootChance: 0.85 },
            );
          // the Army truck that brought them, and the board that kept the crowds back
          {
            const ty = along ? PI / 2 : 0,
              off = (rng() < 0.5 ? -1 : 1) * 7.5;
            putTruck(
              rng() < 0.45 ? 0 : rng() < 0.6 ? 1 : 2,
              along ? cx + (rng() - 0.5) * 3 : cx + off * 0.45,
              along ? cz + off * 0.45 : cz + (rng() - 0.5) * 3,
              ty + (rng() < 0.5 ? PI : 0) + (rng() - 0.5) * 0.2,
            );
            const qs = along
              ? { x: cx + 5, z: cz + 2.2 }
              : { x: cx + 2.2, z: cz + 5 };
            put(
              "quarantine_sign",
              rng() < 0.3 ? 1 : 0,
              qs.x,
              qs.z,
              along ? 0 : PI / 2,
              { r: 1.0 },
            );
          }
        }
      }
  }

  // ------------------------------------------------------------------
  // ARMY POSTS (round 2, own RNG stream, runs after every other pass so it
  // moves nothing): the intersection checkpoints get their guard booth and
  // boom on an avenue approach (the far lane stays open), a searchlight on
  // the kerb, often a tank parked on the other approach and an MG nest in
  // the parking lane; plus a handful of tanks abandoned mid-avenue where a
  // unit made a stand (sandbags, skeletons, an ammo can). Tanks, booths and
  // nests sit in the parking lane / near lane only — 6 m of carriageway and
  // both sidewalks always stay clear.
  // ------------------------------------------------------------------
  let CHECKPOINTS = [];
  const TANK_HALF_W = 1.7,
    TANK_LEN = 7.0;
  // The Army cleared its own lane: parked street wrecks in a post's footprint are towed (removed with
  // their trunk container) — but never a static prop, a scene's car or another module's collider.
  let PLACED_IDX = null;
  const PCELL = 8;
  function placedIndex() {
    if (PLACED_IDX) return PLACED_IDX;
    PLACED_IDX = new Map();
    for (const rec of X.PLACED) {
      const k = Math.floor(rec.x / PCELL) * 100003 + Math.floor(rec.z / PCELL);
      let a = PLACED_IDX.get(k);
      if (!a) PLACED_IDX.set(k, (a = []));
      a.push(rec);
    }
    return PLACED_IDX;
  }
  const FLAT_OK = new Set([
    "litter",
    "car_debris",
    "grate",
    "skeleton",
    "tire",
  ]);
  /** Is the ground round each pt (radius r) free of static props (flat litter aside)? Collects the scatter cars to tow. */
  function armyClear(pts, r, tow) {
    const idx = placedIndex();
    for (const [px, pz] of pts) {
      if (!ok(px, pz) || blocked(px, pz, Math.min(r, 1.4))) return false;
      for (
        let gx = Math.floor((px - r - 6) / PCELL);
        gx <= Math.floor((px + r + 6) / PCELL);
        gx++
      )
        for (
          let gz = Math.floor((pz - r - 6) / PCELL);
          gz <= Math.floor((pz + r + 6) / PCELL);
          gz++
        ) {
          for (const rec of idx.get(gx * 100003 + gz) || []) {
            if (rec.hidden || FLAT_OK.has(rec.name) || rec.pr.box.max.y < 0.3)
              continue;
            const b = rec.pr.box,
              rr =
                Math.max(b.max.x - b.min.x, b.max.z - b.min.z) *
                0.5 *
                (rec.s || 1);
            if (Math.hypot(rec.x - px, rec.z - pz) < r + rr * 0.8) return false;
          }
        }
      if (X.carsNear)
        for (const { car } of X.carsNear({ x: px, z: pz }, r)) {
          if (car.removed) continue;
          if (!car.sc || car.scene) return false;
          if (tow.indexOf(car) < 0) tow.push(car);
        }
    }
    return true;
  }
  function towCars(tow) {
    for (const car of tow) {
      X.removeCar(car);
      if (car.trunkSc) {
        const i = X.SC_CONTAINERS.indexOf(car.trunkSc);
        if (i >= 0) X.SC_CONTAINERS.splice(i, 1);
        car.trunkSc = null;
      }
      stats.armyTowed = (stats.armyTowed || 0) + 1;
    }
  }
  /** Footprint points for a tank centred at x,z with yaw (turret lying at local +x for v1). */
  function tankPts(v, x, z, yaw) {
    const fx = -Math.sin(yaw),
      fz = -Math.cos(yaw),
      rx = Math.cos(yaw),
      rz = -Math.sin(yaw);
    const pts = [];
    for (let i = 0; i < 4; i++) {
      const t = (i / 3 - 0.5) * (TANK_LEN - 2.4);
      pts.push([x + fx * t, z + fz * t]);
    }
    if (v === 1) pts.push([x + rx * 3.2 - fx * 1.4, z + rz * 3.2 - fz * 1.4]);
    return pts;
  }
  function putTank(v, x, z, yaw, o) {
    const pts = tankPts(v, x, z, yaw),
      tow = [];
    if (!armyClear(pts, TANK_HALF_W, tow)) return null;
    towCars(tow);
    const placed = put(
      "army_tank",
      v,
      x,
      z,
      yaw,
      Object.assign({ force: true, r: 0, lootChance: 0.7 }, o || {}),
    );
    if (placed) {
      for (const [px, pz] of pts) occMark(px, pz, TANK_HALF_W + 0.2);
      PLACED_IDX = null;
    }
    return placed;
  }
  // ------------------------------------------------------------------
  // Hi-Octane Harry's filling stations (29_filling_station.js) on open ground off the corridors:
  // the West Village waterfront corner of 10th Ave × 11th St (facing 11th St) and the East River
  // side between 14th and 11th St east of Lexington (facing 11th St). Each anchor is searched
  // outward in 2 m steps until the whole pad is land, off every road/sidewalk, clear of sites,
  // locations, doors and other modules' colliders. Runs first so later passes flow around it.
  // ------------------------------------------------------------------
  const FILLING_STATIONS = [
    {
      id: "west_village",
      x: -309,
      z: 373,
      yaw: 0,
      v: 0,
      car: { lx: 2.0, lz: -5.8, kind: "sedan" },
    },
    {
      id: "east_village",
      x: 303,
      z: 334,
      yaw: PI,
      v: 1,
      car: { lx: -1.0, lz: -5.8, kind: "coupe" },
    },
  ];
  X.FILLING_STATIONS = [];
  function dressFillingStations() {
    const S = X.FILLING_STATION_SIZE || { w: 22, d: 16 };
    const toW = (cx, cz, yaw, lx, lz) => {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      return [cx + lx * c + lz * s, cz - lx * s + lz * c];
    };
    const padFree = (cx, cz, yaw) => {
      for (let lx = -S.w / 2; lx <= S.w / 2 + 0.01; lx += 2)
        for (let lz = -S.d / 2; lz <= S.d / 2 + 0.01; lz += 2) {
          const [x, z] = toW(cx, cz, yaw, lx, lz);
          if (
            !ok(x, z) ||
            L.isRoad(x, z) ||
            (L.locationAt && L.locationAt(x, z)) ||
            !occFree(x, z, 0.8) ||
            blocked(x, z, 0.5)
          )
            return false;
        }
      return true;
    };
    for (const st of FILLING_STATIONS) {
      let at = null;
      for (let ring = 0; ring <= 7 && !at; ring++) {
        for (let i = -ring; i <= ring && !at; i++)
          for (let j = -ring; j <= ring && !at; j++) {
            if (Math.max(Math.abs(i), Math.abs(j)) !== ring) continue;
            if (padFree(st.x + i * 2, st.z + j * 2, st.yaw))
              at = [st.x + i * 2, st.z + j * 2];
          }
      }
      if (!at) {
        stats.fillingStationMissed = (stats.fillingStationMissed || 0) + 1;
        continue;
      }
      const [cx, cz] = at;
      // the wreck by the pumps first (its own footprint checks), then the station claims the whole pad
      if (st.car) {
        const [x, z] = toW(cx, cz, st.yaw, st.car.lx, st.car.lz);
        putCar(st.car.kind, x, z, st.yaw + PI / 2 + (rng() - 0.5) * 0.2, {
          force: true,
          stripped: true,
          wreck: false,
          burnt: false,
        });
      }
      const placed = put("filling_station", st.v, cx, cz, st.yaw, {
        force: true,
        r: 0,
        container: {},
      });
      if (!placed) continue;
      for (let lx = -S.w / 2; lx <= S.w / 2 + 0.01; lx += 1.5)
        for (let lz = -S.d / 2; lz <= S.d / 2 + 0.01; lz += 1.5) {
          const [x, z] = toW(cx, cz, st.yaw, lx, lz);
          occMark(x, z, 0.8);
        }
      CLEAR.push([cx - S.w / 2, cz - S.w / 2, cx + S.w / 2, cz + S.w / 2]); // no parked cars nosed into the forecourt
      X.FILLING_STATIONS.push({
        id: st.id,
        x: cx,
        y: placed.y,
        z: cz,
        yaw: st.yaw,
      });
    }
  }

  function dressArmyPosts() {
    let booths = 0,
      tanks = 0,
      nests = 0,
      lights = 0;
    const SITES = [];
    const tankV = () => {
      const t = rng();
      return t < 0.45 ? 0 : t < 0.75 ? 1 : 2;
    };
    for (const cp of CHECKPOINTS) {
      const { a, s, cx, cz } = cp;
      const half = s.width / 2;
      // guard booth + boom: front toward the traffic coming in, boom reaching over the near lane to the centre line
      const opts = [
        [-1, -1],
        [1, 1],
      ];
      if (rng() < 0.5) opts.reverse();
      let boothDir = 0;
      for (const [dir, sgn] of opts) {
        const z = cz + dir * (half + 5 + rng() * 4),
          x = a.x + sgn * 4.9,
          yaw = dir < 0 ? 0 : PI;
        if (z < a.z0 + 4 || z > a.z1 - 4) continue;
        const pts = [[x, z]],
          tow = [];
        for (let t = 1.6; t <= 5.2; t += 0.9) pts.push([x - sgn * t, z]);
        if (!armyClear(pts, 1.4, tow)) continue;
        towCars(tow);
        if (
          !put(
            "army_checkpoint",
            rng() < 0.6 ? 0 : 1,
            x,
            z,
            yaw + (rng() - 0.5) * 0.04,
            { r: 0, force: true, lootChance: 0.45 },
          )
        )
          continue;
        PLACED_IDX = null;
        occMark(x, z, 1.4);
        for (let t = 1.6; t <= 5.2; t += 0.9) occMark(x - sgn * t, z, 0.5);
        booths++;
        boothDir = dir;
        SITES.push(["booth", +x.toFixed(1), +z.toFixed(1)]);
        // searchlight on the kerb beside the booth, aimed at the sky (or knocked flat)
        const sx = a.x + sgn * (a.road / 2 + 0.7),
          sz = z + dir * 2.6;
        if (
          put(
            "searchlight",
            rng() < 0.7 ? 0 : 1,
            sx,
            sz,
            yaw + (rng() - 0.5) * 1.2,
            { r: 0.6 },
          )
        )
          lights++;
        break;
      }
      // a tank on the opposite approach, parked along the kerb with its gun on the crossing
      if (rng() < 0.6) {
        const dir = boothDir ? -boothDir : rng() < 0.5 ? -1 : 1;
        for (const sgn of rng() < 0.5 ? [-1, 1] : [1, -1]) {
          const z = cz + dir * (half + TANK_LEN / 2 + 2 + rng() * 3),
            x = a.x + sgn * 4.2;
          const yaw = (dir > 0 ? 0 : PI) + (rng() - 0.5) * 0.06; // nose (and gun) toward the crossing
          if (z < a.z0 + 5 || z > a.z1 - 5) continue;
          if (putTank(tankV(), x, z, yaw)) {
            tanks++;
            SITES.push(["cp_tank", +x.toFixed(1), +z.toFixed(1)]);
            break;
          }
        }
      }
      // an MG nest in the parking lane covering the crossing
      if (rng() < 0.55) {
        const dir = rng() < 0.5 ? -1 : 1,
          sgn = rng() < 0.5 ? -1 : 1;
        const x = a.x + sgn * 4.6,
          z = cz + dir * (half + 2.5 + rng() * 2);
        const tow = [];
        if (
          z > a.z0 + 3 &&
          z < a.z1 - 3 &&
          armyClear([[x, z]], 1.8, tow) &&
          (towCars(tow), true) &&
          put("mg_nest", rng() < 0.7 ? 0 : 1, x, z, dir < 0 ? PI : 0, {
            r: 0,
            force: true,
            lootChance: 0.5,
          })
        ) {
          nests++;
          PLACED_IDX = null;
          occMark(x, z, 1.8);
          put(
            "skeleton",
            1,
            x + (rng() - 0.5) * 0.8,
            z - dir * 0.5,
            dir < 0 ? PI : 0,
            { r: 0, noCollide: true, force: true },
          );
        }
      }
    }
    // last stands along the avenues: a tank, sandbags, the crew
    let want = 10,
      tries = 0;
    const stands = [];
    while (want > 0 && tries++ < 600) {
      const a = L.avenues[(rng() * L.avenues.length) | 0];
      const z = a.z0 + 15 + rng() * (a.z1 - a.z0 - 30);
      const sgn = rng() < 0.5 ? -1 : 1,
        x = a.x + sgn * 4.2;
      const yaw = (sgn > 0 ? PI : 0) + (rng() - 0.5) * 0.1;
      if (
        inCrossingRoad(x, z, a) ||
        inCrossingRoad(x, z - 5, a) ||
        inCrossingRoad(x, z + 5, a) ||
        nearLocation(x, z, 20, (l) => !l.hostile)
      )
        continue;
      if (stands.some((p) => Math.hypot(p[0] - x, p[1] - z) < 160)) continue; // spread across the city
      const v = tankV();
      if (!putTank(v, x, z, yaw)) continue;
      stands.push([x, z]);
      tanks++;
      want--;
      SITES.push(["tank_" + v, +x.toFixed(1), +z.toFixed(1)]);
      const fz = yaw === 0 || Math.abs(yaw) < 0.2 ? -1 : 1; // tank front along z
      const ex = a.x + sgn * (a.road / 2 - 0.9);
      put("sandbags", 0, ex, z + fz * (TANK_LEN / 2 + 1.6), PI / 2, { r: 1.1 });
      put(
        "skeleton",
        rng() < 0.5 ? 0 : 2,
        a.x + sgn * 1.4,
        z + (rng() - 0.5) * 5,
        rng() * 6,
        { r: 0.6 },
      );
      if (rng() < 0.6)
        put("skeleton", 1, ex, z - fz * (TANK_LEN / 2 + 1.2), yaw, { r: 0.5 });
      if (rng() < 0.7)
        spawnDyn("ammo_box", {
          x: ex,
          z: z - fz * (TANK_LEN / 2 + 2.2),
          yaw: rng() * 6,
          r: 0.4,
          name: "Army Ammo Box",
        });
      for (let k = 0; k < 3; k++)
        put(
          "car_debris",
          (rng() * 3) | 0,
          a.x + sgn * (1 + rng() * 3),
          z + (rng() - 0.5) * 9,
          rng() * 6,
          { r: 0.3, noCollide: true },
        );
    }
    stats.armyPosts = {
      checkpoints: CHECKPOINTS.length,
      booths,
      tanks,
      nests,
      lights,
      sites: SITES,
    };
  }

  // ------------------------------------------------------------------
  // Freestanding billboards
  // ------------------------------------------------------------------
  let brandIdx = 0;
  X.BILLBOARDS = [];
  function putBillboard(variant, x, z, yaw, brand) {
    const placed = put("billboard_frame", variant, x, z, yaw, {
      r: variant === 1 ? 3 : 1.5,
    });
    if (!placed) return null;
    const pr = placed.pr,
      f = pr.meta.face;
    brand = brand || L.BRANDS[brandIdx++ % L.BRANDS.length];
    const mat = X.billboardMaterial(brand);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(f.w, f.h), mat);
    // face toward local -z → plane (faces +z) rotated by PI
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const lz = f.z - 0.08;
    m.position.set(x + lz * s, placed.y + f.y, z + lz * c);
    m.rotation.set(0, yaw + PI, 0, "YXZ");
    m.rotateX(-(f.rx || 0));
    m.receiveShadow = true;
    m.name = "props_billboard_" + brand;
    X.billboardRoot.add(m);
    G.world.addLOD(m, variant === 1 ? 900 : 480, m.position.clone());
    X.BILLBOARDS.push({ brand, x, z, mesh: m });
    // lamps under a few big ones glow at night
    if (variant === 1 && X.glow)
      for (let i = 0; i < 4; i++) {
        const lx = -f.w / 2 + ((i + 0.5) * f.w) / 4;
        X.glow.add(
          x + lx * c + -1.1 * s,
          placed.y + f.y - f.h / 2 - 0.4,
          z - lx * s + -1.1 * c,
          0xffe0a0,
          4,
          rng() < 0.3 ? 0.6 : 0,
        );
      }
    return m;
  }
  function dressBillboards() {
    // (a) street-end vistas: big billboards where a street meets the waterfront
    let n = 0;
    for (const s of L.streets) {
      if (s.park) continue;
      for (const end of [0, 1]) {
        const x = end ? s.x1 - 7 : s.x0 + 7;
        const beyond = end ? s.x1 + 10 : s.x0 - 10;
        if (L.isLand(beyond, s.z)) continue; // not a waterfront end
        if (rng() < 0.45) continue;
        if (putBillboard(1, x, s.z, end ? PI / 2 : -PI / 2)) n++;
      }
    }
    // (b) intersection corners: small twin-pole boards angled at the crossing
    for (const a of L.avenues)
      for (const s of L.streets) {
        if (s.park || a.x < s.x0 || a.x > s.x1 || s.z < a.z0 || s.z > a.z1)
          continue;
        if (rng() > 0.1) continue;
        const sx = rng() < 0.5 ? -1 : 1,
          sz = rng() < 0.5 ? -1 : 1;
        const x = a.x + sx * (a.width / 2 - 1.2),
          z = s.z + sz * (s.width / 2 - 1.2);
        // face diagonally toward the intersection centre
        const yaw = Math.atan2(sx, sz); // forward (-sin, -cos) points back toward the centre
        putBillboard(rng() < 0.2 ? 2 : 0, x, z, yaw);
      }
    // (c) Brooklyn waterfront, facing Manhattan across the East River
    for (const z of [430, 545, 760, 870, 950]) {
      let x = 470;
      while (x < 560 && !L.isBrooklyn(x, z)) x += 2;
      putBillboard(1, x + 5, z, PI / 2);
    }
    stats.billboards = X.BILLBOARDS.length;
  }

  // ------------------------------------------------------------------
  // Faction / location dressing
  // ------------------------------------------------------------------
  function approachPoints(l) {
    const pts = [];
    const d = l.r + 10;
    for (const a of L.avenues) {
      if (Math.abs(a.x - l.x) > l.r + 25) continue;
      for (const sg of [-1, 1]) {
        const z = l.z + sg * d;
        if (z >= a.z0 && z <= a.z1)
          pts.push({ x: a.x, z, along: "ns", corr: a });
      }
    }
    for (const s of L.streets) {
      if (s.park || Math.abs(s.z - l.z) > l.r + 25) continue;
      for (const sg of [-1, 1]) {
        const x = l.x + sg * d;
        if (x >= s.x0 && x <= s.x1)
          pts.push({ x, z: s.z, along: "ew", corr: s });
      }
    }
    return pts.filter((p) => ok(p.x, p.z) && !inCrossing(p.x, p.z, p.corr, 3));
  }
  /** Barricade line across a corridor at p. style: raider|brute|covenant|continuity|settler. */
  function barricade(p, style, l) {
    const w = p.corr.width,
      across = p.along === "ns" ? 0 : PI / 2; // yaw so the prop's local x runs across the road
    const dirx = p.along === "ns" ? 1 : 0,
      dirz = p.along === "ns" ? 0 : 1;
    const gap = (rng() - 0.5) * (w * 0.4);
    const pos = (t) => ({ x: p.x + dirx * t, z: p.z + dirz * t });
    for (
      let t = -w / 2 + 1.5;
      t < w / 2 - 1;
      t +=
        style === "raider" || style === "settler"
          ? 3.4
          : style === "brute"
            ? 5.5
            : 3.0
    ) {
      if (Math.abs(t - gap) < 2.2) continue;
      const q = pos(t);
      if (style === "raider" || style === "settler") {
        if (rng() < 0.3)
          putCar(
            pickCarKind("x", "traffic"),
            q.x,
            q.z,
            across + PI / 2 + (rng() - 0.5) * 0.3,
            { burnt: true, stripped: true },
          );
        else
          put(
            "raider_wall",
            (rng() * 4) | 0,
            q.x,
            q.z,
            across + (rng() - 0.5) * 0.12,
            { r: 1.2 },
          );
      } else if (style === "brute") {
        putCar(
          pickCarKind("x", "traffic"),
          q.x,
          q.z,
          across + PI / 2 + (rng() - 0.5) * 0.5,
          { burnt: true, stripped: true },
        );
      } else if (style === "covenant") {
        put(
          rng() < 0.6 ? "sandbags" : "jersey_barrier",
          rng() < 0.3 ? 3 : 0,
          q.x,
          q.z,
          across,
          { r: 1.2 },
        );
      } else {
        put("jersey_barrier", 0, q.x, q.z, across, { r: 1.2 });
      }
    }
    // decoration on both sides of the line
    const sideSpot = (k) => {
      const t = (rng() - 0.5) * (w - 3);
      const s2 = rng() < 0.5 ? -1 : 1;
      return {
        x: p.x + dirx * t + (p.along === "ew" ? s2 * k : 0),
        z: p.z + dirz * t + (p.along === "ns" ? s2 * k : 0),
      };
    };
    if (style === "raider") {
      for (let i = 0; i < 2; i++) {
        const q = sideSpot(3 + rng() * 3);
        put("skull_pike", 0, q.x, q.z, rng() * 6, { r: 0.3 });
      }
      {
        const q = sideSpot(4);
        spawnDyn("barrel", { x: q.x, z: q.z, burning: true, r: 0.5 });
      }
      {
        const q = sideSpot(5);
        put("mattress", 0, q.x, q.z, rng() * 6, { r: 1.0 });
      }
      {
        const q = sideSpot(4.5);
        put("tire", 1, q.x, q.z, 0, { r: 0.5 });
      }
      {
        const q = sideSpot(6);
        spawnDyn(rng() < 0.5 ? "footlocker" : "ammo_box", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.5,
          owner: "raiders",
        });
      }
      if (rng() < 0.5) {
        const q = sideSpot(7);
        spawnDyn("barrel", { x: q.x, z: q.z, explosive: true, r: 0.5 });
      }
    } else if (style === "brute") {
      for (let i = 0; i < 3; i++) {
        const q = sideSpot(3 + rng() * 5);
        put("gore_bag", 0, q.x, q.z, rng() * 6, { r: 0.4 });
      }
      for (let i = 0; i < 2; i++) {
        const q = sideSpot(4 + rng() * 4);
        put("skeleton", (rng() * 4) | 0, q.x, q.z, rng() * 6, { r: 0.6 });
      }
      {
        const q = sideSpot(5);
        spawnDyn("barrel", { x: q.x, z: q.z, burning: true, r: 0.5 });
      }
      {
        const q = sideSpot(6);
        spawnDyn("footlocker", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.5,
          owner: "brutes",
        });
      }
    } else if (style === "covenant") {
      {
        const q = sideSpot(4);
        put("crate", 2, q.x, q.z, rng() * 6, { r: 0.8 });
      }
      {
        const q = sideSpot(5);
        spawnDyn("ammo_box", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.4,
          owner: "covenant",
        });
      }
      {
        const q = sideSpot(3.5);
        spawnDyn("turret", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.8,
          faction: "covenant",
          hostile: false,
        });
      }
      {
        const q = sideSpot(6);
        put("lamp_post", 3, q.x, q.z, rng() * 6, { r: 0.5 });
      }
      {
        const q = sideSpot(2.5);
        put("poster_board", 0, q.x, q.z, across, { r: 1.2 });
      }
    } else if (style === "continuity") {
      {
        const q = sideSpot(3.5);
        spawnDyn("turret", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.8,
          faction: "continuity",
          hostile: true,
          continuity: true,
        });
      }
      {
        const q = sideSpot(5);
        put("crate", 2, q.x, q.z, rng() * 6, { r: 0.8 });
      }
      {
        const q = sideSpot(5);
        spawnDyn("ammo_box", {
          x: q.x,
          z: q.z,
          yaw: rng() * 6,
          r: 0.4,
          large: true,
          owner: "continuity",
        });
      }
    } else if (style === "settler") {
      {
        const q = sideSpot(3);
        spawnDyn("barrel", { x: q.x, z: q.z, burning: true, r: 0.5 });
      }
      {
        const q = sideSpot(4);
        put("lamp", 3, q.x, q.z, rng() * 6, { r: 0.4 });
      }
      {
        const q = sideSpot(5);
        put("sandwich_board", 1, q.x, q.z, rng() * 6, { r: 0.4 });
      }
    }
    // hand-painted signs facing whoever approaches (away from the location)
    if (l && (style === "raider" || style === "settler")) {
      const outYaw = (q) =>
        Math.atan2(-(q.x - l.x), -(q.z - l.z)) + (rng() - 0.5) * 0.3;
      const texts =
        style === "raider"
          ? [0, 0]
          : GREETING_TOWNS.has(l.id)
            ? [5, 2]
            : [2, rng() < 0.5 ? 1 : 5];
      for (const t of texts) {
        const q = sideSpot(2 + rng() * 3);
        put("scav_sign", t, q.x, q.z, outYaw(q), { r: 0.3 });
      }
      // settlers warn travellers away from raider turf further out
      if (style === "raider") {
        const q = { x: p.x + (p.x - l.x) * 0.35, z: p.z + (p.z - l.z) * 0.35 };
        if (ok(q.x, q.z) && !L.isRoad(q.x, q.z))
          put("scav_sign", 3, q.x, q.z, outYaw(q), { r: 0.3 });
      }
    }
  }
  function dressLocations() {
    for (const l of L.LOCATIONS) {
      if (l.interior || l.id === "cryo_c9") continue;
      const pts = approachPoints(l);
      if (!pts.length) continue;
      let style = null;
      const f = fac(l);
      if (f === "raiders") style = "raider";
      else if (f === "brutes") style = "brute";
      else if (f === "covenant") style = "covenant";
      else if (f === "continuity") style = "continuity";
      else if (f === "settlers") style = "settler";
      if (style) {
        const n = Math.min(pts.length, style === "settler" ? 2 : 3);
        // pick spread-out approach points
        const chosen = pts.sort(() => rng() - 0.5).slice(0, n);
        for (const p of chosen) barricade(p, style, l);
      }
      // faction flavour scattered around the location
      if (f === "glowkeepers") {
        for (let i = 0; i < 7; i++) {
          const a = rng() * PI * 2,
            d = l.r + 4 + rng() * 14;
          const x = l.x + Math.cos(a) * d,
            z = l.z + Math.sin(a) * d;
          if (L.isRoad(x, z)) put("barrel", 1, x, z, rng() * 6, { r: 0.8 });
        }
      }
      if (f === "maniacs") {
        for (let i = 0; i < 6; i++) {
          const a = rng() * PI * 2,
            d = l.r + 3 + rng() * 15;
          const x = l.x + Math.cos(a) * d,
            z = l.z + Math.sin(a) * d;
          if (L.isRoad(x, z))
            put("skeleton", (rng() * 4) | 0, x, z, rng() * 6, { r: 0.6 });
        }
        const p = pts[0];
        if (p)
          for (let i = -1; i <= 1; i++)
            put(
              "sawhorse",
              i === 0 ? 2 : 0,
              p.x + (p.along === "ns" ? i * 2.5 : 0),
              p.z + (p.along === "ew" ? i * 2.5 : 0),
              p.along === "ns" ? 0 : PI / 2,
              { r: 1.1 },
            );
      }
    }
  }

  // ------------------------------------------------------------------
  // Environmental storytelling vignettes (on sidewalks/roads)
  // ------------------------------------------------------------------
  const VIGNETTES = {
    // a survivor's lean-to against the wall: bedroll, fire, a footlocker of their things
    squat(x, z, yaw, wp, self) {
      if (!wp) return false;
      const bx = Math.sin(yaw),
        bz = Math.cos(yaw); // toward the wall
      const ox = wp.x - bx * 0.95,
        oz = wp.z - bz * 0.95;
      const fire = { x: ox - bx * 1.75, z: oz - bz * 1.75 };
      if (
        !ok(ox, oz) ||
        !ok(fire.x, fire.z) ||
        inCrossingRoad(fire.x, fire.z, self) ||
        !storefrontDoorClear(ox, oz, 3) ||
        !occFree(ox, oz, 1.6) ||
        !occFree(fire.x, fire.z, 0.7) ||
        blocked(fire.x, fire.z, 0.5) ||
        blocked(ox - bx * 0.4, oz - bz * 0.4, 0.4)
      )
        return false;
      const v = (rng() * 6) | 0;
      if (!put("squat_camp", v, ox, oz, yaw, { force: true, r: 0 }))
        return false;
      occMark(ox, oz, 1.6);
      occMark(fire.x, fire.z, 0.7);
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      P.spawn(rng() < 0.5 ? "footlocker" : "duffle_bag", {
        x: ox - 0.8 * c + 0.5 * s,
        y: groundAt(ox, oz),
        z: oz + 0.8 * s + 0.5 * c,
        yaw: yaw + (rng() - 0.5) * 0.3,
        persistent: true,
        name: rng() < 0.5 ? "Squatter's Footlocker" : undefined,
      });
      if (rng() < 0.6)
        put(
          "shopping_cart",
          rng() < 0.5 ? 1 : 0,
          ox + 2.2 * c - 0.6 * s,
          oz - 2.2 * s - 0.6 * c,
          yaw + 1.2,
          { r: 0.6 },
        );
      if (rng() < 0.35)
        put("skeleton", 1, ox - 0.5 * c, oz + 0.5 * s, yaw + PI, {
          r: 0,
          noCollide: true,
          force: true,
        }); // didn't make it
      return true;
    },
    // old-world Army convoy stopped dead in the traffic lane: trucks nose to tail, a jeep-less crew of skeletons
    convoy(x, z, yaw, wp, self) {
      const ty = yaw + PI / 2,
        fx = -Math.sin(ty),
        fz = -Math.cos(ty);
      const n = 2 + (rng() < 0.5 ? 1 : 0);
      let placed = 0;
      for (let i = 0; i < n; i++) {
        const t = i * 8.4 + (rng() - 0.5) * 0.8;
        if (
          putTruck(
            rng() < 0.35 ? 0 : rng() < 0.55 ? 1 : 2,
            x + fx * t,
            z + fz * t,
            ty + (rng() - 0.5) * 0.18,
            { lootChance: 0.6 },
          )
        )
          placed++;
      }
      if (!placed) return false;
      if (self && self.x !== undefined) {
        // keep the far lane of the avenue open past the convoy
        const farLane = self.x - (Math.sign(x - self.x) || 1) * 2.2,
          zEnd = z + fz * (n - 1) * 8.4;
        CLEAR.push([
          farLane - 1.5,
          Math.min(z, zEnd) - 6,
          farLane + 1.5,
          Math.max(z, zEnd) + 6,
        ]);
      }
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        mid = n * 4.2;
      put(
        "quarantine_sign",
        1,
        x + fx * mid + 2.8 * s,
        z + fz * mid + 2.8 * c,
        yaw,
        { r: 1.0 },
      );
      put(
        "skeleton",
        0,
        x + fx * (mid - 2) - 2.2 * s,
        z + fz * (mid - 2) - 2.2 * c,
        rng() * 6,
        { r: 0.6 },
      );
      put(
        "skeleton",
        2,
        x + fx * (mid + 5) + 1.9 * s,
        z + fz * (mid + 5) + 1.9 * c,
        rng() * 6,
        { r: 0.6 },
      );
      put("jersey_barrier", 0, x - fx * 6, z - fz * 6, ty + PI / 2, { r: 1.2 });
      spawnDyn("ammo_box", {
        x: x + fx * (mid + 1) - 2.3 * s,
        z: z + fz * (mid + 1) - 2.3 * c,
        yaw: rng() * 6,
        r: 0.4,
        name: "Army Ammo Box",
      });
      for (let k = 0; k < 3; k++)
        put(
          "car_debris",
          (rng() * 3) | 0,
          x + fx * rng() * mid * 2 + (rng() - 0.5) * 4 * s,
          z + fz * rng() * mid * 2 + (rng() - 0.5) * 4 * c,
          rng() * 6,
          { r: 0.3, noCollide: true },
        );
      return true;
    },
    // a cordon: quarantine board, sawhorses, and the people it held back
    quarantine(x, z, yaw) {
      if (!put("quarantine_sign", rng() < 0.4 ? 1 : 0, x, z, yaw, { r: 1.1 }))
        return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (const d of [-2.6, 2.6])
        put(
          "sawhorse",
          rng() < 0.3 ? 2 : 0,
          x + d * c,
          z - d * s,
          yaw + (rng() - 0.5) * 0.3,
          { r: 1.0 },
        );
      put(
        "skeleton",
        rng() < 0.5 ? 0 : 3,
        x - 1.8 * s + (rng() - 0.5) * 2 * c,
        z - 1.8 * c,
        rng() * 6,
        { r: 0.6 },
      );
      put(
        "luggage",
        0,
        x - 2.6 * s + 1.4 * c,
        z - 2.6 * c - 1.4 * s,
        rng() * 6,
        { r: 0.5 },
      );
      if (rng() < 0.5)
        put(
          "pram",
          1,
          x - 2.2 * s - 1.6 * c,
          z - 2.2 * c + 1.6 * s,
          rng() * 6,
          { r: 0.6 },
        );
      return true;
    },
    // a Patrolman that ran down on its beat: slumped against the wall (visor still flickering) or face-down on the pavement
    robot_down(x, z, yaw, wp) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      if (wp && rng() < 0.65) {
        const bx = Math.sin(yaw),
          bz = Math.cos(yaw);
        const ox = wp.x - bx * 0.55,
          oz = wp.z - bz * 0.55;
        if (
          !ok(ox, oz) ||
          !storefrontDoorClear(ox, oz, 2.5) ||
          blocked(ox - bx * 0.3, oz - bz * 0.3, 0.35)
        )
          return false;
        if (
          !put(
            "robot_wreck",
            rng() < 0.6 ? 0 : 3,
            ox,
            oz,
            yaw + (rng() - 0.5) * 0.3,
            { r: 0.9, force: true, lootChance: 0.85, tint: robotTint() },
          )
        )
          return false;
      } else {
        // out in the open: face-down, kneeling where it powered down, or sitting hunched over its knees
        const t = rng(),
          v = t < 0.45 ? 1 : t < 0.75 ? 4 : 5;
        if (
          !put(
            "robot_wreck",
            v,
            x,
            z,
            v === 1
              ? yaw + PI / 2 + (rng() - 0.5) * 1.2
              : yaw + (rng() - 0.5) * 1.4,
            { r: 1.3, lootChance: 0.85, tint: robotTint() },
          )
        )
          return false;
      }
      // what it was guarding: a police cordon, or a citizen it had just "protected"
      if (rng() < 0.5)
        put(
          "sawhorse",
          rng() < 0.5 ? 0 : 2,
          x - 2.2 * c,
          z + 2.2 * s,
          yaw + (rng() - 0.5) * 0.4,
          { r: 1.0 },
        );
      if (rng() < 0.5)
        put(
          "skeleton",
          rng() < 0.5 ? 0 : 2,
          x + 1.8 * c - 0.8 * s,
          z - 1.8 * s - 0.8 * c,
          rng() * 6,
          { r: 0.6 },
        );
      for (let i = 0; i < 2; i++)
        put(
          "car_debris",
          0,
          x + (rng() - 0.5) * 3,
          z + (rng() - 0.5) * 3,
          rng() * 6,
          { r: 0, noCollide: true },
        );
      return true;
    },
    // a Valet that ran its errand into the street and tipped over: shopping everywhere
    valet_crash(x, z, yaw) {
      if (!put("robot_wreck", 2, x, z, rng() * 6, { r: 1.0, lootChance: 0.85 }))
        return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("shopping_cart", 1, x + 1.6 * c, z - 1.6 * s, yaw + 1.9, { r: 0.6 });
      put(
        "luggage",
        0,
        x - 1.4 * c - 0.6 * s,
        z + 1.4 * s - 0.6 * c,
        rng() * 6,
        { r: 0.5 },
      );
      put("litter", 2, x - 0.4 * s, z - 0.4 * c, rng() * 6, {
        r: 0,
        noCollide: true,
      });
      spawnDyn(rng() < 0.5 ? "fizzo_cola" : "duffle_bag", {
        x: x + 0.9 * c - 1.1 * s,
        z: z - 0.9 * s - 1.1 * c,
        yaw: rng() * 6,
        r: 0.3,
      });
      return true;
    },
    // an Army aid station pitched in the parking lane: a triage tent of cots and body bags, the overflow lined up on the kerb
    triage(x, z, yaw, wp, self) {
      if (!self || self.x === undefined) return false; // avenues only
      const rx = -Math.sin(yaw),
        rz = -Math.cos(yaw); // toward the roadway
      // tent centre 1.5 m inside the kerb: walls span the parking lane + the near half of the near lane,
      // sandbag weights on the kerb side; the far lane is reserved (no wrecks) so the avenue stays passable
      const across = self.road / 2 - 1.5,
        sideSign = Math.sign(x - self.x) || 1;
      const tx = self.x + sideSign * across,
        tz = z,
        ty = yaw + PI / 2; // tent long axis along the road
      const ax = Math.sin(ty),
        az = Math.cos(ty); // tent-local +z (back) in world
      for (const u of [-1, 0, 1])
        for (const t of [-1, 0, 1]) {
          const qx = tx + u * 2.1 * az + t * 2.6 * ax,
            qz = tz - u * 2.1 * ax + t * 2.6 * az;
          if (
            !ok(qx, qz) ||
            inCrossingRoad(qx, qz, self) ||
            !occFree(qx, qz, 1.0) ||
            blocked(qx, qz, 0.5) ||
            noCarZone(qx, qz, 1)
          )
            return false;
        }
      if (
        !put("triage_tent", rng() < 0.5 ? 1 : 0, tx, tz, ty, {
          r: 0,
          force: true,
        })
      )
        return false;
      for (const u of [-1, 0, 1])
        for (const t of [-1, 0, 1])
          occMark(
            tx + u * 2.1 * az + t * 2.6 * ax,
            tz - u * 2.1 * ax + t * 2.6 * az,
            1.4,
          );
      {
        const farLane = self.x - sideSign * 2.2;
        CLEAR.push([farLane - 1.5, tz - 10, farLane + 1.5, tz + 10]);
      }
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      // the overflow: body bags lined up along the building wall behind the tent
      if (wp) {
        const bx = Math.sin(yaw),
          bz = Math.cos(yaw); // toward the wall
        const wx = wp.x - bx * 1.35,
          wz = wp.z - bz * 1.35;
        put(
          "body_bag",
          2,
          wx + 1.2 * c,
          wz - 1.2 * s,
          yaw + (rng() - 0.5) * 0.08,
          { r: 0.5 },
        );
        if (rng() < 0.7)
          put(
            "body_bag",
            rng() < 0.5 ? 1 : 0,
            wx - 1.6 * c,
            wz + 1.6 * s,
            yaw + (rng() - 0.5) * 0.25,
            { r: 0.45 },
          );
      }
      put("sandbags", 0, tx - ax * 3.6, tz - az * 3.6, ty + PI / 2, { r: 1.2 });
      put("quarantine_sign", 0, x + 3.8 * c, z - 3.8 * s, yaw, { r: 0.9 });
      // tent-local (lx, lz) → world: local x = road direction (rx, rz), local z = (ax, az)
      const at = (lx, lz) => ({
        x: tx + rx * lx + ax * lz,
        z: tz + rz * lx + az * lz,
      });
      {
        const q = at(0.2, -1.95);
        P.spawn("first_aid", {
          x: q.x,
          y: groundAt(q.x, q.z),
          z: q.z,
          yaw: ty,
          persistent: true,
          name: "Army Medical Kit",
        });
      }
      if (rng() < 0.6) {
        const q = at(-0.42, -0.8);
        P.spawn("footlocker", {
          x: q.x,
          y: groundAt(q.x, q.z),
          z: q.z,
          yaw: ty + PI / 2,
          persistent: true,
          name: "Medical Supplies",
          loot: "medical_cabinet",
        });
      }
      return true;
    },
    // a sidewalk souvenir seller who stayed at his table
    vendor(x, z, yaw, wp, self) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw),
        rx = -Math.sin(yaw),
        rz = -Math.cos(yaw);
      const tx = x + rx * 0.6,
        tz = z + rz * 0.6; // toward the kerb
      if (
        !storefrontDoorClear(tx, tz, 2.5) ||
        !put(
          "vendor_table",
          rng() < 0.3 ? 1 : 0,
          tx,
          tz,
          yaw + PI + (rng() - 0.5) * 0.15,
          { r: 1.2, lootChance: 0.8 },
        )
      )
        return false;
      if (rng() < 0.6)
        put(
          "skeleton",
          4,
          tx + rx * 1.0 + 0.55 * c,
          tz + rz * 1.0 - 0.55 * s,
          yaw,
          { r: 0, noCollide: true, force: true },
        ); // still in his lawn chair
      put("litter", (rng() * 3) | 0, tx - rx * 1.2, tz - rz * 1.2, rng() * 6, {
        r: 0,
        noCollide: true,
      });
      return true;
    },
    bench_couple(x, z, yaw) {
      if (!put("bench", 0, x, z, yaw, { r: 1.2 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("skeleton", 4, x - 0.45 * c, z + 0.45 * s, yaw, {
        r: 0,
        noCollide: true,
        force: true,
      });
      put("skeleton", 4, x + 0.45 * c, z - 0.45 * s, yaw + 0.1, {
        r: 0,
        noCollide: true,
        force: true,
      });
      return true;
    },
    phone_call(x, z, yaw) {
      if (!put("phone_booth", 0, x, z, yaw, { r: 0.9 })) return false;
      put("skeleton", 1, x, z, yaw + PI, {
        r: 0,
        noCollide: true,
        force: true,
      });
      return true;
    },
    mother_child(x, z, yaw) {
      if (!put("skeleton", 3, x, z, yaw, { r: 0.8 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("skeleton", 6, x + 0.35 * c, z - 0.35 * s, yaw + 0.3, {
        r: 0,
        noCollide: true,
        force: true,
      });
      put("pram", 1, x - 1.4 * c + 0.6 * s, z + 1.4 * s + 0.6 * c, yaw + 1.2, {
        r: 0.6,
      });
      spawnDyn("teddy_bear", {
        x: x + 0.9 * c,
        z: z - 0.9 * s,
        yaw: yaw + 2,
        r: 0.2,
      });
      return true;
    },
    evacuation(x, z, yaw) {
      if (!put("bus_stop", 1, x, z, yaw, { r: 1.8 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (let i = 0; i < 3; i++)
        put(
          "luggage",
          0,
          x + (-2 + i * 2) * c - 1.2 * s,
          z - (-2 + i * 2) * s - 1.2 * c,
          rng() * 6,
          { r: 0.6 },
        );
      put("skeleton", 4, x - 0.6 * c, z + 0.6 * s, yaw, {
        r: 0,
        noCollide: true,
        force: true,
      });
      put(
        "skeleton",
        0,
        x + 2.6 * c - 2.2 * s,
        z - 2.6 * s - 2.2 * c,
        yaw + 1.3,
        { r: 0.6 },
      );
      spawnDyn("duffle_bag", {
        x: x + 1.2 * c - 1.4 * s,
        z: z - 1.2 * s - 1.4 * c,
        yaw: rng() * 6,
        r: 0.4,
      });
      return true;
    },
    hobo_camp(x, z, yaw) {
      if (!spawnDyn("barrel", { x, z, burning: true, r: 0.6 })) return false;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("mattress", 0, x + 1.5 * s, z + 1.5 * c, yaw + 0.3, { r: 0.8 });
      put("shopping_cart", 0, x - 1.4 * c, z + 1.4 * s, yaw + 0.7, { r: 0.6 });
      put("garbage_bags", 2, x + 1.6 * c + 0.8 * s, z - 1.6 * s + 0.8 * c, 0, {
        r: 0.8,
      });
      put("skeleton", 1, x - 1.0 * c + 1.2 * s, z + 1.0 * s + 1.2 * c, yaw, {
        r: 0.5,
      });
      spawnDyn("scrip_stash", {
        x: x + 0.9 * s - 0.4 * c,
        z: z + 0.9 * c + 0.4 * s,
        yaw: rng() * 6,
        r: 0.3,
      });
      return true;
    },
    rad_dump(x, z, yaw) {
      if (!put("barrel", 1, x, z, yaw, { r: 0.6 })) return false;
      for (let i = 0; i < 4; i++)
        put(
          "barrel",
          rng() < 0.7 ? 1 : 5,
          x + (rng() - 0.5) * 3,
          z + (rng() - 0.5) * 3,
          rng() * 6,
          { r: 0.45 },
        );
      put("skeleton", 3, x + 1.8, z + 1.2, rng() * 6, { r: 0.6 });
      put("sawhorse", 0, x - 2.2, z, yaw, { r: 1.1 });
      return true;
    },
    last_stand(x, z, yaw) {
      const car = putCar("police", x, z, yaw + PI / 2, {
        burnt: false,
        stripped: true,
      });
      if (!car) return false;
      car.scene = true;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      put("sandbags", 0, x - 2.8 * s, z - 2.8 * c, yaw, { r: 1.2 });
      put(
        "skeleton",
        1,
        x - 1.6 * s + 1.2 * c,
        z - 1.6 * c - 1.2 * s,
        yaw + PI,
        { r: 0.5 },
      );
      put("skeleton", 2, x - 4.5 * s, z - 4.5 * c, yaw, { r: 0.6 });
      spawnDyn("ammo_box", {
        x: x - 1.8 * s - 1.2 * c,
        z: z - 1.8 * c + 1.2 * s,
        yaw,
        r: 0.4,
      });
      return true;
    },
    fizzo_spill(x, z, yaw) {
      const car = putCar("fizzo_truck", x, z, yaw, {
        burnt: rng() < 0.5,
        stripped: true,
        roll: 0.05,
      });
      if (!car) return false;
      car.scene = true;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      for (let i = 0; i < 5; i++)
        put(
          "crate",
          0,
          x + (2.5 + rng() * 2) * c + (rng() - 0.5) * 5 * s,
          z - (2.5 + rng() * 2) * s + (rng() - 0.5) * 5 * c,
          rng() * 6,
          { r: 0.5, rx: rng() < 0.4 ? PI / 2 : 0 },
        );
      spawnDyn("fizzo_cola", {
        x: x + 3 * c,
        z: z - 3 * s,
        yaw: rng() * 6,
        r: 0.2,
      });
      return true;
    },
  };
  function dressVignettes(only, wantN) {
    const keys = only || Object.keys(VIGNETTES);
    let placed = 0,
      tries = 0;
    const want = wantN || 60,
      fails = {};
    while (placed < want && tries < want * 15) {
      tries++;
      const useAve = rng() < 0.5;
      let x,
        z,
        yaw,
        wp = null,
        self;
      if (useAve) {
        const a = L.avenues[(rng() * L.avenues.length) | 0];
        self = a;
        z = a.z0 + 10 + rng() * (a.z1 - a.z0 - 20);
        const side = rng() < 0.5 ? -1 : 1;
        x = a.x + side * (a.road / 2 + (a.width - a.road) / 4 + 0.3);
        yaw = (side * PI) / 2;
        wp = { x: a.x + side * (a.width / 2 - 0.05), z };
      } else {
        const s = L.streets[(rng() * L.streets.length) | 0];
        if (s.park) continue;
        self = s;
        x = s.x0 + 10 + rng() * (s.x1 - s.x0 - 20);
        const side = rng() < 0.5 ? -1 : 1;
        z = s.z + side * (s.road / 2 + (s.width - s.road) / 4 + 0.2);
        yaw = side > 0 ? 0 : PI;
        wp = { x, z: s.z + side * (s.width / 2 - 0.05) };
      }
      // the scene's own corridor is `self`: only OTHER corridors count as crossings (passing null here
      // used to reject every spot, because the sidewalk is always inside its own corridor)
      if (
        !ok(x, z) ||
        inCrossingRoad(x, z, self) ||
        nearLocation(x, z, 25, (l) => !l.hostile)
      )
        continue;
      // balanced: the least-placed scene type that fits this spot (the Army ones only on avenues);
      // a type that keeps failing (no room anywhere) drops out after 60 attempts
      let k = null,
        best = 1e9;
      for (const kk of keys) {
        if ((kk === "convoy" || kk === "triage") && !useAve) continue;
        if ((fails[kk] || 0) > 60) continue;
        const n =
          (stats["vignette_" + kk] || 0) * 100 + (fails[kk] || 0) + rng();
        if (n < best) {
          best = n;
          k = kk;
        }
      }
      if (!k) continue;
      // car-based vignettes go on the road (parking lane)
      if (k === "last_stand" || k === "fizzo_spill" || k === "convoy") {
        x = x - Math.sin(yaw) * 3.6;
        z = z - Math.cos(yaw) * 3.6;
      }
      try {
        if (VIGNETTES[k](x, z, yaw, wp, self)) {
          placed++;
          stats["vignette_" + k] = (stats["vignette_" + k] || 0) + 1;
        } else fails[k] = (fails[k] || 0) + 1;
      } catch (e) {
        G.reportError("props:vignette:" + k, e);
        fails[k] = 1e9;
      }
    }
    if (only) {
      stats.robotsExtra = placed;
      return;
    }
    stats.vignettes = placed;
    stats.vignetteFails = fails;
  }

  // ------------------------------------------------------------------
  // Facade collapses: a building face that came down, its talus of dust,
  // brick, slabs and steel spilling across the sidewalk into the parking
  // lane (never past it — one traffic lane always stays open). Only where
  // a building actually stands behind, clear of doors, storefront
  // entrances, crossings, sites and settlements. Placed before cars and
  // sidewalk furniture so those flow around it (lamp posts get buried).
  // ------------------------------------------------------------------
  let SF_DOORS = null;
  function storefrontDoorClear(x, z, rr) {
    if (!SF_DOORS) {
      SF_DOORS = [];
      try {
        const list = !G.isStub("map")
          ? typeof G.map.getStorefronts === "function"
            ? G.map.getStorefronts()
            : G.map.storefronts
          : null;
        if (Array.isArray(list))
          for (const sf of list) {
            if (!sf) continue;
            const d = sf.door && typeof sf.door.x === "number" ? sf.door : sf;
            if (typeof d.x === "number") SF_DOORS.push(d.x, d.z);
          }
      } catch (e) {
        /* optional */
      }
    }
    for (let i = 0; i < SF_DOORS.length; i += 2) {
      const dx = x - SF_DOORS[i],
        dz = z - SF_DOORS[i + 1];
      if (dx * dx + dz * dz < rr * rr) return false;
    }
    return true;
  }
  /** Facade plane behind sidewalk point (a, side): distance of the building face from the corridor centre,
   *  its top height, or null when no building face stands there up to `needH` metres. */
  const _ro = new THREE.Vector3(),
    _rd = new THREE.Vector3();
  function facadeAt(C, a, side, needH) {
    const inner = C.width / 2 - 1.0,
      p = C.frame(a, side * inner),
      q = C.frame(a, side * (inner + 1));
    _rd.set(q.x - p.x, 0, q.z - p.z).normalize();
    const IGN = ["prop", "prop_car"];
    let d0 = null,
      top = 0;
    for (const y of [2.2, needH * 0.55, needH]) {
      _ro.set(p.x, y, p.z);
      const h = G.world.raycast(_ro, _rd, 5, { ignoreTags: IGN });
      if (!h || !h.collider) return null;
      if (d0 === null) {
        d0 = h.dist;
        top = h.collider.maxY;
      } else if (Math.abs(h.dist - d0) > 0.6) return null; // setback / gap
      top = Math.max(top, h.collider.maxY);
    }
    return { across: inner + d0, top };
  }
  function dressCollapses(C) {
    const { road, width, frame, faceYaw, self } = C;
    const walk = width / 2 - road / 2;
    const dims = X.SPILL_DIMS,
      bdims = X.BREACH_DIMS;
    if (!dims) return;
    for (const side of [-1, 1]) {
      for (const [b0, b1] of blockRuns(C, side, 16)) {
        const blen = b1 - b0;
        const pm = frame((b0 + b1) / 2, side * (road / 2 + walk / 2));
        if (nearLocation(pm.x, pm.z, 25, isSettlement)) continue; // settlers cleared their streets
        const hostile = nearLocation(pm.x, pm.z, 60, (l) => l.hostile);
        if (rng() > (C.collapse || 0.1) + (hostile ? 0.1 : 0)) continue;
        // biggest heap that stays out of the traffic lane and fits the block
        const maxD = walk + (C.narrow ? 1.7 : 2.4);
        let size = 2;
        while (size > 0 && (dims[size].D > maxD || dims[size].W > blen - 8))
          size--;
        if (dims[size].D > maxD + 0.3 || dims[size].W > blen - 5) continue;
        if (size > 0 && rng() < 0.35) size--;
        const sc = 0.92 + rng() * 0.12; // a little size variety per heap
        // own stream (never shifts other placements): wider scale range and left/right mirroring,
        // so the 9 heap/breach layouts read as ~36 different ones down the avenues
        const vr = U.rng(
          U.hashStr("collapse_var:" + pm.x.toFixed(1) + "," + pm.z.toFixed(1)),
        );
        const sc2 = (0.9 + vr() * 0.2) / sc,
          mirror = vr() < 0.5;
        const seedV = 3 * ((rng() * 3) | 0);
        for (let attempt = 0; attempt < 3; attempt++) {
          const a =
            b0 +
            4 +
            (dims[size].W * sc) / 2 +
            rng() * Math.max(0.1, blen - 8 - dims[size].W * sc);
          // a building face must stand behind it, tall enough to have lost the storeys that are now the heap
          // (a low building gets a smaller heap)
          let fac = null,
            sz = size;
          for (; sz >= 0 && !fac; sz--)
            fac = facadeAt(C, a, side, bdims ? bdims[sz].H + 1.5 : 6);
          sz++;
          if (
            !fac ||
            fac.across > width / 2 + 0.8 ||
            fac.across < width / 2 - 0.6
          )
            continue;
          const S = { W: dims[sz].W * sc, D: dims[sz].D * sc },
            variant = sz + seedV;
          const wallA = fac.across;
          let good = true;
          const pts = [];
          for (const u of [-0.8, -0.4, 0, 0.4, 0.8])
            for (const t of [0.15, 0.4, 0.65, 0.9]) {
              const q = frame(
                a + ((u * S.W) / 2) * (1 - 0.18 * t * t),
                side * (width / 2 - 0.05 - t * S.D),
              );
              if (
                !ok(q.x, q.z) ||
                inCrossingRoad(q.x, q.z, self) ||
                !occFree(q.x, q.z, 0.45) ||
                !storefrontDoorClear(q.x, q.z, 3.5) ||
                (t > 0.3 && blocked(q.x, q.z, 0.3))
              ) {
                good = false;
                break;
              }
              pts.push(q);
            }
          if (!good) continue;
          const o = frame(a, side * (width / 2 - 0.05));
          // the footprint was checked at scale sc; a heap may only grow if the block and parking lane allow it
          const fs = Math.min(
            sc * sc2,
            sc *
              Math.min(
                (maxD + 0.2) / (dims[sz].D * sc),
                (blen - 5) / (dims[sz].W * sc),
                1.06,
              ),
          );
          const placed = put(
            "collapse_spill",
            variant,
            o.x,
            o.z,
            faceYaw(side),
            { force: true, r: 0, s: fs, mirror },
          );
          if (!placed) break;
          for (const q of pts) occMark(q.x, q.z, 0.9);
          // the wound in the facade above it (+ a cheap far card in the long-range tier, so the hole
          // doesn't pop out of the facade beyond the medium tier's ~190 m)
          if (bdims) {
            const w = frame(
              a + (rng() - 0.5) * S.W * 0.15,
              side * (wallA - 0.12),
            );
            const br = put("facade_breach", variant, w.x, w.z, faceYaw(side), {
              force: true,
              r: 0,
              noCollide: true,
              s: fs,
              mirror,
            });
            const bf = put(
              "facade_breach_far",
              variant,
              w.x,
              w.z,
              faceYaw(side),
              { force: true, r: 0, noCollide: true, s: fs, mirror },
            );
            if (br) {
              placed.rec.pair = [br.rec];
              if (bf) placed.rec.pair.push(bf.rec);
            }
          }
          // what the heap caught: a half-buried body reaching out, sometimes their bag
          if (rng() < 0.4) {
            const q = frame(
              a + (rng() - 0.5) * S.W * 0.5,
              side * (width / 2 - S.D * 0.92),
            );
            put(
              "skeleton",
              2,
              q.x,
              q.z,
              faceYaw(side) + PI + (rng() - 0.5) * 0.8,
              { r: 0, noCollide: true, force: true },
            );
          }
          if (rng() < 0.3) {
            const q = frame(
              a + (rng() - 0.5) * S.W * 0.3,
              side * (width / 2 - S.D * 0.55),
            );
            P.spawn(rng() < 0.6 ? "duffle_bag" : "first_aid", {
              x: q.x,
              y: G.world.groundHeight(q.x, q.z, 10),
              z: q.z,
              yaw: rng() * 6,
              persistent: true,
            });
          }
          stats.collapse = (stats.collapse || 0) + 1;
          (stats.collapseSites || (stats.collapseSites = [])).push([
            +o.x.toFixed(1),
            +o.z.toFixed(1),
            +faceYaw(side).toFixed(2),
            variant,
            mirror ? 1 : 0,
          ]);
          break;
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Brooklyn dockyards
  // ------------------------------------------------------------------
  function dressBrooklyn() {
    const xs = [550, 620, 690, 760],
      zs = [460, 520, 580, 640, 700, 760, 820, 880, 940];
    // lanes between warehouse blocks: cars, trucks, clutter
    for (const x of xs)
      for (let z = 400; z < 980; z += 7 + rng() * 10) {
        if (!L.isBrooklyn(x, z)) continue;
        const t = rng();
        if (t < 0.08)
          putCar(
            rng() < 0.3 ? "fizzo_truck" : rng() < 0.5 ? "pickup" : "van",
            x + (rng() < 0.5 ? -3.5 : 3.5),
            z,
            (rng() < 0.5 ? 0 : PI) + (rng() - 0.5) * 0.2,
          );
        else if (t < 0.3)
          put(
            "barrel",
            rng() < 0.15 ? 1 : rng() < 0.5 ? 0 : 5,
            x + (rng() - 0.5) * 10,
            z,
            rng() * 6,
            { r: 0.5 },
          );
        else if (t < 0.4)
          put("pallet", (rng() * 3) | 0, x + (rng() - 0.5) * 10, z, rng() * 6, {
            r: 0.9,
          });
        else if (t < 0.47)
          put(
            "crate_stack",
            (rng() * 2) | 0,
            x + (rng() < 0.5 ? -5 : 5),
            z,
            PI / 2,
            { r: 1.6 },
          );
        else if (t < 0.52)
          put("garbage_bags", 1, x + (rng() - 0.5) * 10, z, rng() * 6, {
            r: 0.8,
          });
        else if (t < 0.55)
          put("litter", 1, x + (rng() - 0.5) * 8, z, rng() * 6, {
            r: 0,
            noCollide: true,
          });
      }
    for (const z of zs)
      for (let x = 480; x < 800; x += 8 + rng() * 12) {
        if (!L.isBrooklyn(x, z)) continue;
        const t = rng();
        if (t < 0.22)
          put(
            "shipping_container",
            (rng() * 4) | 0,
            x,
            z + (rng() < 0.5 ? -3 : 3),
            (rng() - 0.5) * 0.1,
            { r: 3.2 },
          );
        else if (t < 0.27)
          putCar(
            pickCarKind("brooklyn", "parking"),
            x,
            z + (rng() < 0.5 ? -3.5 : 3.5),
            (rng() < 0.5 ? PI / 2 : -PI / 2) + (rng() - 0.5) * 0.2,
          );
        else if (t < 0.4)
          put("chainlink", rng() < 0.5 ? 1 : 2, x, z + 6.5, 0, { r: 1.6 });
        else if (t < 0.46)
          put(
            "dumpster",
            (rng() * 3) | 0,
            x,
            z + (rng() < 0.5 ? -5.5 : 5.5),
            (PI / 2) * (rng() < 0.5 ? 1 : -1),
            { r: 1.2, lootChance: 1 },
          );
        else if (t < 0.52)
          put("crate", (rng() * 5) | 0, x, z + (rng() - 0.5) * 8, rng() * 6, {
            r: 0.6,
          });
        else if (t < 0.56)
          put("tire", 1, x, z + (rng() - 0.5) * 8, 0, { r: 0.5 });
      }
    // stacked containers (two-high) near the navy yard
    for (let i = 0; i < 6; i++) {
      const x = 700 + rng() * 80,
        z = 640 + rng() * 120;
      if (!L.isBrooklyn(x, z)) continue;
      const yaw = rng() < 0.5 ? 0 : PI / 2;
      if (put("shipping_container", (rng() * 4) | 0, x, z, yaw, { r: 3.4 }))
        put(
          "shipping_container",
          (rng() * 4) | 0,
          x,
          z,
          yaw + (rng() - 0.5) * 0.08,
          { r: 0, y: groundAt(x, z) + 2.6, force: true, noCollide: false },
        );
    }
  }

  // ------------------------------------------------------------------
  // Landmark anchors & map storefronts → containers
  // ------------------------------------------------------------------
  function anchorContainers() {
    const LM = G.landmarks;
    if (!LM || G.isStub("landmarks")) return;
    let n = 0;
    for (const id of Object.keys(LM)) {
      const lm = LM[id];
      if (!lm || typeof lm !== "object" || !lm.anchors) continue;
      for (const name of Object.keys(lm.anchors)) {
        const p = lm.anchors[name];
        if (!p || typeof p.x !== "number") continue;
        const nm = name.toLowerCase();
        let type = null,
          extra = {};
        if (/safe/.test(nm)) type = "safe";
        else if (/ammo/.test(nm)) type = "ammo_box";
        else if (/locker/.test(nm)) type = "locker";
        else if (/first_?aid|medkit|medic/.test(nm)) {
          type = "first_aid";
          extra.floor = true;
        } else if (/stash/.test(nm)) type = "scrip_stash";
        else if (/fridge/.test(nm)) type = "fridge";
        else if (/desk/.test(nm)) type = "desk";
        else if (/loot|container|cache|chest|crate|footlocker/.test(nm))
          type =
            n % 3 === 0 ? "footlocker" : n % 3 === 1 ? "toolbox" : "duffle_bag";
        if (!type) continue;
        P.spawn(
          type,
          Object.assign(
            {
              x: p.x,
              y: p.y !== undefined ? p.y : undefined,
              z: p.z,
              yaw: p.yaw !== undefined ? p.yaw : rng() * 6,
              persistent: true,
              id: "lm:" + id + ":" + name,
            },
            extra,
          ),
        );
        n++;
      }
    }
    stats.anchorContainers = n;
  }
  /**
   * Furnish the map's enterable storefront shells (G.map.getStorefronts():
   * {id,x,z,yaw,w,d,y,door,loot}). The frame is derived from the door point so
   * it doesn't depend on the map's yaw convention: v+ runs toward the street
   * door, u is lateral. The map spawns its own loot spots (back-corner safe /
   * cabinet, a container behind the counter, maybe a Fizzo machine on the back
   * wall); the counter goes on the same side as the behind-counter loot so the
   * clerk area reads right, shelves line the opposite wall, and everything
   * keeps clear of the map's loot points and the doorway.
   * Static furniture goes into the chunk batches (a shell costs no extra draw
   * calls); the cash register becomes a scatter container.
   */
  function storefrontDressing() {
    let list = null;
    try {
      if (!G.isStub("map")) {
        if (typeof G.map.getStorefronts === "function")
          list = G.map.getStorefronts();
        else if (Array.isArray(G.map.storefronts)) list = G.map.storefronts;
      }
    } catch (e) {
      list = null;
    }
    if (!Array.isArray(list)) {
      stats.storefronts = 0;
      return;
    }
    let n = 0;
    for (const sf of list) {
      if (!sf || typeof sf.x !== "number" || typeof sf.z !== "number") continue;
      if (sf.dressed) continue; // the map furnished it itself
      X.safe(() => {
        if (dressShell(sf)) n++;
      }, "shell");
      if (n > 80) break;
    }
    stats.storefronts = n;
  }
  function dressShell(sf) {
    const w = Math.max(3, sf.w || 6),
      d = Math.max(3, sf.d || 6);
    const hw = w / 2,
      hd = d / 2;
    // forward (toward door/street) and lateral axes
    let fx, fz;
    if (sf.door && typeof sf.door.x === "number") {
      fx = sf.door.x - sf.x;
      fz = sf.door.z - sf.z;
    } else {
      const yw = sf.yaw || 0;
      fx = Math.sin(yw);
      fz = Math.cos(yw);
    }
    // the door may sit off-centre: snap the street direction to the room's axes (yaw ± k·90°)
    {
      const base = sf.yaw || 0,
        a = Math.atan2(fx, fz);
      const k = Math.round((a - base) / (PI / 2));
      const snapped = base + k * (PI / 2);
      fx = Math.sin(snapped);
      fz = Math.cos(snapped);
    }
    const lx = -fz,
      lz = fx;
    const at = (u, v) => ({
      x: sf.x + lx * u + fx * v,
      z: sf.z + lz * u + fz * v,
    });
    const toUV = (p) => {
      const dx = p.x - sf.x,
        dz = p.z - sf.z;
      return { u: dx * lx + dz * lz, v: dx * fx + dz * fz };
    };
    const yawFacing = (dx, dz) => Math.atan2(-dx, -dz);
    const faceStreet = yawFacing(fx, fz),
      faceBack = faceStreet + PI;
    const floorY =
      sf.floorY !== undefined
        ? sf.floorY
        : sf.y !== undefined
          ? sf.y
          : groundAt(sf.x, sf.z);
    const loot = (Array.isArray(sf.loot) ? sf.loot : [])
      .filter((l) => l && typeof l.x === "number")
      .map(toUV);
    const taken = loot.map((p) => ({ u: p.u, v: p.v, r: 0.9 }));
    const doorUV = sf.door ? toUV(sf.door) : { u: 0, v: hd + 1 };
    taken.push({ u: doorUV.u, v: hd - 0.6, r: 1.4 }); // keep the doorway clear
    const free = (u, v, r) => {
      if (Math.abs(u) > hw - 0.25 || Math.abs(v) > hd - 0.25) return false;
      for (const t of taken)
        if (Math.hypot(t.u - u, t.v - v) < t.r + r) return false;
      return true;
    };
    const take = (u, v, r) => taken.push({ u, v, r });
    const log = ((X.shellLog = X.shellLog || {})[sf.id || "shell"] = []);
    const place = (name, variant, u, v, yaw, o) => {
      const p = at(u, v);
      log.push([name, +p.x.toFixed(1), +p.z.toFixed(1), +yaw.toFixed(2)]);
      return put(
        name,
        variant,
        p.x,
        p.z,
        yaw,
        Object.assign({ force: true, r: 0, y: floorY }, o || {}),
      );
    };
    // counter side = lateral side of the map's behind-counter loot (2nd spot), else random
    const s = loot.length > 1 ? (loot[1].u < 0 ? -1 : 1) : rng() < 0.5 ? -1 : 1;
    const cLen = Math.min(0.5 * w, w - 2.2);
    const cv = [2.0, 2.6, 3.2, 3.8].reduce(
      (bi, L, i, arr) =>
        Math.abs(L - cLen) < Math.abs(arr[bi] - cLen) ? i : bi,
      0,
    );
    const CL = [2.0, 2.6, 3.2, 3.8][cv];
    const cu = s * (hw - 0.8 - CL / 2),
      cvv = Math.min(0.3, hd - 1.8);
    // counter faces the street; its local +x (display-case end) is the +u direction
    const cYaw = faceStreet;
    if (CL + 1.2 < w && hd > 1.8) {
      place("shop_counter", cv, cu, cvv, cYaw, { r: 0 });
      take(cu, cvv, CL / 2);
      // cash register on the countertop (lootable)
      const caseW = Math.min(1.1, CL * 0.38),
        bodyW = CL - caseW;
      const ru = cu - CL / 2 + bodyW * 0.62;
      // keys toward the clerk (behind the counter)
      place(
        "cash_register",
        0,
        ru,
        cvv + 0.02,
        faceBack + (rng() - 0.5) * 0.3,
        { y: floorY + 1.0, noCollide: true },
      );
      // a stool or overturned chair behind the counter
      if (rng() < 0.6)
        place(
          "chair",
          rng() < 0.5 ? 0 : 1,
          cu + (rng() - 0.5) * CL * 0.5,
          cvv - 0.9,
          faceStreet + (rng() - 0.5) * 1.2,
          { r: 0, rz: rng() < 0.3 ? PI / 2 : 0 },
        );
    }
    const shelfV = () => {
      const t = rng();
      return t < 0.58 ? 0 : t < 0.94 ? 1 : 2;
    };
    // shelving along the opposite wall (fronts facing the room), toppled now and then
    const su = -s * (hw - 0.3);
    const sideYaw = yawFacing(lx * s, lz * s); // face toward the counter side (room centre)
    for (let v = hd - 1.3; v > -hd + 1.0; v -= 1.95) {
      if (!free(su, v, 0.7)) continue;
      const topple = rng() < 0.15;
      if (topple) {
        place("shelf", 1, su + s * 0.9, v, sideYaw, {
          rx: -PI / 2 + 0.05,
          y: floorY + 0.28,
        });
        place("floor_goods", 1, su + s * 1.9, v, rng() * 6, {
          noCollide: true,
        });
      } else {
        place("shelf", shelfV(), su, v, sideYaw + (rng() - 0.5) * 0.05);
        if (rng() < 0.55)
          place(
            "floor_goods",
            0,
            su + s * 0.95,
            v + (rng() - 0.5) * 0.8,
            rng() * 6,
            { noCollide: true },
          );
      }
      take(su, v, 0.9);
    }
    // a centre gondola (two shelves back to back) in wider shops
    if (w > 7.5) {
      const gu = -s * (hw * 0.15),
        gv = hd * 0.05;
      if (free(gu, gv, 0.9)) {
        place("shelf", shelfV(), gu, gv + 0.26, faceStreet);
        place("shelf", shelfV(), gu, gv - 0.26, faceBack); // back to back, fronts outward
        take(gu, gv, 1.0);
        if (rng() < 0.6) {
          const fv = gv - 1.0;
          if (free(gu, fv, 0.5)) {
            place("floor_goods", (rng() * 2) | 0, gu, fv, rng() * 6, {
              noCollide: true,
            });
            take(gu, fv, 0.5);
          }
        }
      }
    }
    // back-wall shelf on the counter side, if the map left it free
    const bu = s * (hw - 1.2),
      bv = -hd + 0.35;
    if (free(bu, bv, 0.6)) {
      place("shelf", shelfV(), bu, bv, faceStreet);
      take(bu, bv, 0.9);
    }
    // signage: CHECKOUT above the till on the back wall, sale / price / poster sheets on the walls
    place("wall_sign", 0, cu, -hd + 0.02, faceStreet, { noCollide: true });
    for (let i = 0, n = 1 + ((rng() * 3) | 0); i < n; i++) {
      const wv = (rng() - 0.5) * (d - 2),
        wsg = rng() < 0.5 ? -1 : 1;
      place(
        "wall_sign",
        1 + ((rng() * (X.WALL_SIGNS - 1)) | 0),
        wsg * (hw - 0.02),
        wv,
        yawFacing(lx * -wsg, lz * -wsg),
        { noCollide: true },
      );
    }
    // pendant lamp over the till (most still glow faintly — somebody keeps the generator ticking) + one mid-room
    place("shop_lamp", rng() < 0.75 ? 1 : 2, cu, cvv - 0.2, 0, {
      noCollide: true,
    });
    if (d > 5 && rng() < 0.6)
      place("shop_lamp", rng() < 0.5 ? 0 : 2, -s * hw * 0.3, -hd * 0.2, 0, {
        noCollide: true,
      });
    // a Fizzo Cola machine or Civil Defense kiosk against the front wall, beside the door
    {
      const nu = doorUV.u > 0 ? doorUV.u - 1.9 : doorUV.u + 1.9,
        nv = hd - 0.45;
      if (Math.abs(nu) < hw - 0.5 && free(nu, nv, 0.5)) {
        if (rng() < 0.7)
          place(
            "fizzo_machine",
            rng() < 0.15 ? 2 : rng() < 0.5 ? 1 : 0,
            nu,
            nv,
            faceBack,
            { lootChance: 0.6 },
          );
        else place("ocd_kiosk", 0, nu, nv, faceBack);
        take(nu, nv, 0.7);
      }
    }
    // clutter: litter, a garbage pile, a fallen crate, spilled goods, maybe a skeleton by the till
    for (let i = 0, nc = 6 + (((w * d) / 22) | 0); i < nc; i++) {
      const u = (rng() - 0.5) * (w - 1.2),
        v = (rng() - 0.5) * (d - 1.2);
      if (!free(u, v, 0.4)) continue;
      const t = rng();
      if (t < 0.38)
        place("litter", (rng() * 3) | 0, u, v, rng() * 6, { noCollide: true });
      else if (t < 0.52)
        place("floor_goods", (rng() * 2) | 0, u, v, rng() * 6, {
          noCollide: true,
        });
      else if (t < 0.64)
        place("garbage_bags", (rng() * 2) | 0, u, v, rng() * 6);
      else if (t < 0.76)
        place("crate", (rng() * 3) | 0, u, v, rng() * 6, { container: false });
      else if (t < 0.84) {
        const tip = rng() < 0.5;
        place("trash_can", 0, u, v, rng() * 6, {
          rx: tip ? PI / 2 : 0,
          y: floorY + (tip ? 0.28 : 0),
        });
      } else if (t < 0.92)
        place("debris", 0, u, v, rng() * 6, { noCollide: true });
      else place("rubble", 0, u, v, rng() * 6, { noCollide: true });
      take(u, v, 0.5);
    }
    if (rng() < 0.35) {
      const u = cu + (rng() - 0.5) * 0.8,
        v = cvv + 0.9;
      if (free(u, v, 0.5)) {
        place("skeleton", rng() < 0.5 ? 0 : 3, u, v, rng() * 6, {
          noCollide: true,
        });
        take(u, v, 0.6);
      }
    }
    return true;
  }

  // ------------------------------------------------------------------
  // Scatter containers lifecycle (created once G.containers exists)
  // ------------------------------------------------------------------
  // Loot tables for props' own set pieces, registered with rpg's public G.items API the first time the
  // containers are made (rpg loads after props). If rpg lacks the API, each container falls back to its
  // defLoot (a stock rpg table). rpg is welcome to take these over (see NOTES.md).
  let lootDefined = false;
  function defineOwnLoot() {
    if (lootDefined) return;
    try {
      if (
        G.isStub("items") ||
        typeof G.items.defineLootTable !== "function" ||
        typeof G.items.hasLootTable !== "function"
      )
        return;
      lootDefined = true;
      const T = (id, t) => {
        if (!G.items.hasLootTable(id)) G.items.defineLootTable(id, t);
      };
      const R = (chance, picks, entries) => ({ chance, picks, entries });
      // an open, picked-over newsstand: paper, smokes, candy, a little scrip — no training manuals
      T("props_newsstand", {
        rolls: [
          R(
            0.85,
            [1, 2],
            [
              { id: "old_world_book", w: 3 },
              { id: "ruined_book", w: 4 },
              { id: "cigarettes", w: 2 },
              { id: "bubblegum", w: 1.5 },
              { id: "licorice_twists", w: 1 },
              { id: "fizzo_cola", w: 1 },
              { id: "old_dollars", w: 1 },
            ],
          ),
          R(0.35, 1, [{ scrip: [2, 9] }]),
        ],
      });
      // the shuttered ones were never looted: more of the same, a carton, and the only newsstand manuals (~8%)
      T("props_newsstand_shut", {
        rolls: [
          R(1, [1, 3], [{ table: "props_newsstand" }]),
          R(0.6, 1, [{ scrip: [4, 18] }, { id: "cigarette_carton", w: 0.6 }]),
          R(0.08, 1, [{ tag: "skill_book" }]),
        ],
      });
      T("props_vendor", {
        rolls: [
          R(
            0.9,
            [1, 2],
            [
              { id: "souvenir_paperweight", w: 1 },
              { id: "souvenir_statue", w: 2 },
              { id: "sunglasses", w: 1.5 },
              { id: "baseball_cap", w: 1 },
              { id: "toy_car", w: 1 },
              { id: "cigarettes", w: 1 },
            ],
          ),
          R(0.4, 1, [{ scrip: [3, 15] }, { id: "old_dollars", w: 1 }]),
        ],
      });
      T("props_car_trunk", {
        rolls: [
          R(
            0.8,
            [1, 2],
            [
              { table: "luggage", w: 3 },
              { table: "junk_household", w: 2 },
              { id: "tin_can", w: 1 },
              { id: "scrap_metal", w: 1.5 },
              { id: "duct_tape", w: 0.6 },
            ],
          ),
          R(0.2, 1, [
            { id: "dry_cell", w: 1 },
            { id: "gas_igniter", w: 0.6 },
            { table: "toolbox", w: 1 },
          ]),
        ],
      });
    } catch (e) {
      G.reportError("props:loot", e);
    }
  }
  X.ensureScatterContainers = function () {
    defineOwnLoot();
    for (const sc of X.SC_CONTAINERS) {
      if (sc.container || sc.fallback) {
        if (sc.container || G.isStub("containers")) continue;
      }
      const rec = {
        cdef: {
          id: sc.id,
          name: sc.name,
          loot: sc.loot,
          defLoot: sc.defLoot || sc.loot,
          lock: sc.lock,
          owner: sc.owner,
        },
        ipos: sc.pos,
        obj: null,
        container: null,
      };
      X.makeContainer(rec);
      sc.container = rec.container;
      sc.fallback = rec.fallbackInteract;
      sc.rec = rec;
    }
  };
  X.destroyScatterContainers = function () {
    for (const sc of X.SC_CONTAINERS) {
      if (sc.rec) X.destroyContainer(sc.rec);
      sc.container = null;
      sc.fallback = null;
      sc.rec = null;
    }
  };

  // ------------------------------------------------------------------
  // MAIN
  // ------------------------------------------------------------------
  // Every pass draws from its own seeded stream (and each corridor pass from its own), so adding or changing
  // one pass never reshuffles the others. Container / car ids are position-keyed ('props:sc:name@x,z',
  // 'car_x_z'), so stable placements keep saves (looted / exploded state) valid across revisions.
  function withRng(seed, fn) {
    const prev = rng;
    rng = U.rng(seed);
    try {
      return fn();
    } finally {
      rng = prev;
    }
  }

  X.scatterCity = function (root) {
    L = G.LAYOUT;
    rng = U.rng(2100);
    stats = {};
    CLEAR = [];
    CHECKPOINTS = [];
    PLACED_IDX = null;
    junkRng = U.rng(2110);
    trunkRng = U.rng(2111);
    B.small = new X.Batcher("small", 100, 105, { castShadow: false });
    // shadows only from the large tier (containers, stacked crates...): medium clutter isn't worth a shadow pass
    B.medium = new X.Batcher("medium", 160, 190, { castShadow: false });
    B.large = new X.Batcher("large", 300, 700, { castShadow: true });
    X.billboardRoot = new THREE.Group();
    X.billboardRoot.name = "props_billboards";
    root.add(X.billboardRoot);
    const t0 = performance.now();

    // corridors: avenues, streets, Broadway (diagonal)
    const CORR = [];
    const trees = U.rng(2120);
    let dir = 1;
    for (const a of L.avenues) {
      const len = a.z1 - a.z0;
      CORR.push({
        kind: "ave",
        self: a,
        len,
        road: a.road,
        width: a.width,
        district: L.districtAt(a.x, (a.z0 + a.z1) / 2),
        frame: (al, ac) => ({ x: a.x + ac, z: a.z1 - al }), // along runs north (-z)
        faceYaw: (side) => (side * PI) / 2,
        alongYaw: 0,
        oneWayYaw: dir > 0 ? 0 : PI,
        lanes: [-2.2, 2.2],
        trees: true,
        signals: true,
        busStops: true,
        parkDensity: 0.78,
        jam: 0.9,
        collapse: 0.1,
      });
      dir = -dir;
    }
    for (const s of L.streets) {
      if (s.park) continue;
      const len = s.x1 - s.x0;
      CORR.push({
        kind: "st",
        self: s,
        len,
        road: s.road,
        width: s.width,
        district: L.districtAt((s.x0 + s.x1) / 2, s.z),
        frame: (al, ac) => ({ x: s.x0 + al, z: s.z + ac }),
        faceYaw: (side) => (side > 0 ? 0 : PI),
        alongYaw: PI / 2,
        oneWayYaw:
          Math.round((s.z - L.STREET_Z0) / L.STREET_STEP) % 2
            ? PI / 2
            : -PI / 2,
        lanes: [0],
        trees: trees() < 0.4,
        signals: false,
        busStops: false,
        parkDensity: 0.6,
        jam: 0.45,
        narrow: true,
        collapse: 0.08,
      });
    }
    const BW = L.BROADWAY;
    for (let i = 0; i < BW.length - 1; i++) {
      const [ax, az] = BW[i],
        [bx, bz] = BW[i + 1];
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const nx = -uz,
        nz = ux; // left normal
      const yawAlong = Math.atan2(-ux, -uz);
      const self = { broadway: true };
      CORR.push({
        kind: "bway",
        self,
        len,
        road: L.BROADWAY_ROAD,
        width: L.BROADWAY_W,
        district: L.districtAt((ax + bx) / 2, (az + bz) / 2),
        frame: (al, ac) => ({
          x: ax + ux * al + nx * ac,
          z: az + uz * al + nz * ac,
        }),
        // side +1 = left normal; the road is toward -normal → forward should be (-nx*side, -nz*side)
        faceYaw: (side) => Math.atan2(nx * side, nz * side),
        alongYaw: yawAlong,
        oneWayYaw: yawAlong,
        lanes: [-2.2, 2.2],
        trees: true,
        signals: false,
        busStops: true,
        parkDensity: 0.6,
        jam: 0.7,
        collapse: 0.1,
      });
    }
    // stable per-corridor seed (layout-derived, so inserting a corridor doesn't reseed the others)
    const cSeed = (C) =>
      U.hashStr(
        C.kind +
          ":" +
          (C.kind === "ave"
            ? C.self.x + "," + C.self.z0
            : C.kind === "st"
              ? C.self.z + "," + C.self.x0
              : C.frame(0, 0).x.toFixed(1) + "," + C.frame(0, 0).z.toFixed(1)),
      );

    // 0) Hi-Octane Harry's filling stations (own stream; they claim their pads before anything else)
    X.FILLING_STATIONS.length = 0;
    X.safe(() => withRng(2099, dressFillingStations), "filling_stations");
    // 1) faction dressing first (so barricades get priority on the road)
    X.safe(() => withRng(2100, dressLocations), "locations");
    // 2) vignettes
    X.safe(() => withRng(2101, dressVignettes), "vignettes");
    // 3) intersections
    X.safe(() => withRng(2102, dressIntersections), "intersections");
    // 4a) facade collapses first, so cars and furniture flow around the heaps
    for (const C of CORR)
      X.safe(
        () => withRng(cSeed(C) ^ 0x51, () => dressCollapses(C)),
        "collapse:" + C.kind,
      );
    // 4b) roads (parked cars, gridlock) and sidewalks
    for (const C of CORR) {
      X.safe(
        () => withRng(cSeed(C) ^ 0x52, () => dressRoad(C)),
        "road:" + C.kind,
      );
      X.safe(
        () => withRng(cSeed(C) ^ 0x53, () => dressSidewalks(C)),
        "walk:" + C.kind,
      );
    }
    // 4c) street furniture into what is left (call boxes, carts, newsstands, souvenir tables)
    for (const C of CORR)
      X.safe(
        () => withRng(cSeed(C) ^ 0x54, () => dressFurniture(C)),
        "furniture:" + C.kind,
      );
    // 5) billboards, Brooklyn, anchors, storefronts
    X.safe(() => withRng(2103, dressBillboards), "billboards");
    X.safe(() => withRng(2104, dressBrooklyn), "brooklyn");
    X.safe(() => withRng(2105, anchorContainers), "anchors");
    X.safe(() => withRng(2106, storefrontDressing), "storefronts");
    // 6) more dead robots on the beat (the city's robot patrols died where they stood):
    //     a second, robot-only scene round into what is left — own stream, runs last so it moves nothing
    X.safe(
      () =>
        withRng(2108, () =>
          dressVignettes(["robot_down", "robot_down", "valet_crash"], 34),
        ),
      "robots",
    );
    // 7) Army posts: checkpoint booths, tanks, MG nests, searchlights (own stream, last → moves nothing)
    X.safe(() => withRng(2109, dressArmyPosts), "army");
    // QA only (screenshot / ?debug runs): ?propshow=x,z[,yaw][,set][;...] lines the set-piece prototypes up
    // northward from x,z for tools/shot.py. Never active in normal play.
    if (G.SHOT || G.DEBUG)
      X.safe(() => {
        const q =
          typeof location !== "undefined" &&
          new URLSearchParams(location.search).get("propshow");
        if (!q) return;
        const SETS = [
          [
            ["robot_wreck", 0],
            ["robot_wreck", 1],
            ["robot_wreck", 2],
            ["robot_wreck", 4],
            ["robot_wreck", 5],
            ["robot_wreck", 7],
            ["food_cart", 0],
            ["food_cart", 1],
            ["call_box", 0],
            ["body_bag", 2],
          ],
          [
            ["newsstand", 0],
            ["newsstand", 1],
            ["triage_tent", 0],
            ["army_truck", 1],
            ["squat_camp", 0],
            ["vendor_table", 0],
            ["vendor_table", 1],
          ],
          [
            ["collapse_spill", 8],
            ["collapse_spill", 7],
            ["collapse_spill", 5],
          ],
          [
            ["food_cart", 0],
            ["food_cart", 1],
            ["vendor_table", 0],
            ["vendor_table", 1],
          ],
          [
            ["army_tank", 0],
            ["army_tank", 1],
            ["army_tank", 2],
            ["army_checkpoint", 0],
            ["army_checkpoint", 1],
            ["mg_nest", 0],
            ["mg_nest", 1],
            ["searchlight", 0],
            ["searchlight", 1],
          ],
          [
            ["terminal", 0],
            ["terminal", 1],
            ["terminal", 2],
            ["first_aid", 0],
            ["safe", 0],
            ["locker", 1],
            ["file_cabinet", 0],
            ["fridge", 0],
          ],
          [
            ["fizzo_machine", 0],
            ["fizzo_machine", 1],
            ["fizzo_machine", 2],
            ["ocd_kiosk", 0],
            ["scrip_stash", 0],
            ["scrip_stash", 1],
            ["tape_reel", 0],
            ["medallion", 0],
            ["medallion", 1],
            ["medallion", 2],
            ["medallion", 3],
            ["fizzo_bottle", 0],
            ["fizzo_blue", 0],
            ["shelf", 0],
            ["vendor_table", 0],
          ],
        ];
        for (const part of q.split(";")) {
          const a = part.split(",").map(Number),
            sx = a[0],
            sz = a[1],
            yaw = a[2] || 0;
          let z = sz;
          for (const [n, v] of SETS[a[3] | 0] || SETS[0]) {
            const pr = X.proto(n, v),
              d = Math.max(
                pr.box.max.z - pr.box.min.z,
                pr.box.max.x - pr.box.min.x,
              );
            z -= d / 2 + 0.8;
            const y = groundAt(sx, z);
            batcherFor(pr).add(
              pr,
              sx,
              y,
              z,
              yaw,
              n === "robot_wreck" ? { tint: 0xf4ecd8 } : {},
            );
            X.addProtoFx(pr, sx, y, z, yaw, 1, true);
            if (n === "collapse_spill") {
              const bp = X.proto("facade_breach", v);
              batcherFor(bp).add(bp, sx, y, z + 0.3, yaw, {});
            }
            stats.propshown = (stats.propshown || 0) + 1;
            z -= d / 2 + 0.8;
          }
        }
      }, "propshow");

    // build batches
    const built = {};
    for (const k of Object.keys(B)) {
      built[k] = { props: B[k].count, tris: B[k].tris };
      B[k].build(root);
      built[k].chunks = B[k].groups.length;
    }
    stats.batches = built;
    stats.containers = X.SC_CONTAINERS.length;
    stats.ms = Math.round(performance.now() - t0);
    X.scatterStats = stats;
    return stats;
  };
})();
