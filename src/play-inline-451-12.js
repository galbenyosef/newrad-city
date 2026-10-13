// play-inline-451 12 — safe
// Lines 3374-3716 of readable/play-inline-451.pretty.js (statement-aligned).
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
