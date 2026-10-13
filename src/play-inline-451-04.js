// play-inline-451 04 — rng
// Lines 792-1095 of readable/play-inline-451.pretty.js (statement-aligned).
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
