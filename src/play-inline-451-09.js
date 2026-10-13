// play-inline-451 09 — side
// Lines 2546-2847 of readable/play-inline-451.pretty.js (statement-aligned).
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
