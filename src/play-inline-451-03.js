// play-inline-451 03 — rng
// Lines 452-791 of readable/play-inline-451.pretty.js (statement-aligned).
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
