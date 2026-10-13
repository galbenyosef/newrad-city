// play-inline-2 06 — pad
// Lines 3100-3450 of readable/play-inline-2.pretty.js (statement-aligned).
  const PLAYER_START = { x: 4000, y: 0, z: 0, yaw: Math.PI }; // map overrides via G.LAYOUT.playerStart
  const CRYO_EXIT = { x: 157, y: 0, z: 623, yaw: Math.PI / 2 };

  // ---------------------------------------------------------------
  // Brands for billboards/posters (textures module provides G.tex.billboard(id))
  // ---------------------------------------------------------------
  // (ids = the textures module's brand registry, G.tex.brands())
  const BRANDS = [
    "fizzo_cola",
    "fizzo_blue",
    "long_winter",
    "prairie_root_beer",
    "liberty_jetliner",
    "first_journal",
    "pizza_galaxy",
    "empire_brew",
    "silver_torch",
    "burger_brigade",
    "excalibur_gardens",
    "junior_rocketeer",
    "miracle_mane",
    "big_apple_cab",
    "mama_marinara",
    "hi_octane",
    "vigil",
    "freedom_flakes",
    "chocolate_zeppelin",
    "golden_plain",
    "homeguard",
    "lonly_tv",
    "eagle_motors",
    "super_sergeant",
    "american_automaton",
    "forever_franks",
    "sky_patrol",
    "worlds_fair",
  ];

  // ---------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------
  function pointInPoly(x, z, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0],
        zi = poly[i][1],
        xj = poly[j][0],
        zj = poly[j][1];
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
        inside = !inside;
    }
    return inside;
  }
  function inCircle(x, z, c) {
    const dx = x - c.x,
      dz = z - c.z;
    return dx * dx + dz * dz <= c.r * c.r;
  }
  function inRect(x, z, r, pad) {
    pad = pad || 0;
    return (
      x >= r.x0 - pad && x <= r.x1 + pad && z >= r.z0 - pad && z <= r.z1 + pad
    );
  }
  function distToSeg(px, pz, ax, az, bx, bz) {
    const dx = bx - ax,
      dz = bz - az;
    const l2 = dx * dx + dz * dz;
    let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx,
      cz = az + t * dz;
    return Math.hypot(px - cx, pz - cz);
  }

  const L = {
    WORLD,
    WATER_LEVEL,
    MANHATTAN,
    BROOKLYN,
    LIBERTY,
    ELLIS,
    ROOSEVELT,
    AVE_W,
    AVE_ROAD,
    ST_W,
    ST_ROAD,
    BROADWAY_W,
    BROADWAY_ROAD,
    AVENUE_DEFS,
    STREET_Z0,
    STREET_STEP,
    STREET_COUNT,
    STREET_NAMES,
    BROADWAY,
    CIRCLES,
    AVENUE_OVERRIDES,
    STREET_CUTS,
    BOWTIES,
    PARK,
    PARK_FEATURES,
    SITES,
    LOCATIONS,
    INTERIORS,
    INTERIOR_X_MIN,
    playerStart: PLAYER_START,
    cryoExit: CRYO_EXIT,
    BRANDS,
    pointInPoly,
    distToSeg,
  };

  L.isManhattan = (x, z) => pointInPoly(x, z, MANHATTAN);
  L.isBrooklyn = (x, z) => pointInPoly(x, z, BROOKLYN);
  L.isIsland = (x, z) =>
    inCircle(x, z, LIBERTY) ||
    inCircle(x, z, ELLIS) ||
    pointInPoly(x, z, ROOSEVELT);
  L.isRoosevelt = (x, z) => pointInPoly(x, z, ROOSEVELT);
  L.isLand = (x, z) =>
    x >= INTERIOR_X_MIN ||
    L.isManhattan(x, z) ||
    L.isBrooklyn(x, z) ||
    L.isIsland(x, z);
  L.isWater = (x, z) => !L.isLand(x, z);
  L.isInterior = (x) => (typeof x === "object" ? x.x : x) >= INTERIOR_X_MIN;
  L.inPark = (x, z) => inRect(x, z, PARK);
  L.inRect = inRect;

  /** Street names for x/z, used by HUD. */
  // (x only: nearest avenue definition; with z: the actual segment name there — 'Broadway', 'Bowery', 'LaGuardia Place', …)
  L.avenueNameAt = (x, z) => {
    if (typeof z === "number") {
      const ci = L.circleAt ? L.circleAt(x, z) : null;
      if (ci && ci.part !== "walk") return ci.circle.name;
      if (L.onBroadway && L.onBroadway(x, z)) return "Broadway";
      for (const a of L.avenues || [])
        if (z >= a.z0 && z <= a.z1 && Math.abs(x - a.x) <= a.width / 2)
          return a.name;
      return null;
    }
    let best = null,
      bd = 1e9;
    for (const a of AVENUE_DEFS) {
      const d = Math.abs(a.x - x);
      if (d < bd) {
        bd = d;
        best = a;
      }
    }
    return bd < AVE_W ? best.name : null;
  };
  /** Name of the E-W street at z (within its corridor), or null. */
  L.streetNameAt = (x, z) => {
    for (const s of L.streets || [])
      if (x >= s.x0 && x <= s.x1 && Math.abs(z - s.z) <= s.width / 2)
        return s.name;
    return null;
  };

  /** Landmark site containing (x,z) (with optional padding), or null. */
  L.siteAt = (x, z, pad) => {
    for (const s of SITES) if (inRect(x, z, s, pad)) return s;
    return null;
  };
  L.getSite = (id) => SITES.find((s) => s.id === id) || null;
  L.getLocation = (id) => LOCATIONS.find((l) => l.id === id) || null;
  L.rectOverlapsSite = (x0, z0, x1, z1, pad) => {
    pad = pad || 0;
    for (const s of SITES)
      if (
        x1 > s.x0 - pad &&
        x0 < s.x1 + pad &&
        z1 > s.z0 - pad &&
        z0 < s.z1 + pad
      )
        return s;
    return null;
  };

  /** Precomputed road segments (land-clipped, park- and closed-site-aware). */
  const avenues = [],
    streets = [];
  // Sites moved by the round-1 layout pass keep their OLD footprint reserved (roads closed there if the site closes
  // streets; the map keeps generic lots out) until the owner module has refitted its build to the new record.
  // Owners: once refitted, the city_layout segment deletes the `movedRound1` marker (see src/map/NOTES.md).
  L.PENDING_REFIT = SITES.filter((s) => s.movedRound1).map((s) =>
    Object.assign(
      { id: s.id, owner: s.owner, closesStreets: !!s.closesStreets },
      s.movedRound1.from,
    ),
  );
  function closedAt(x, z) {
    const s = L.siteAt(x, z);
    if (s && s.closesStreets) return true;
    for (const p of L.PENDING_REFIT)
      if (p.closesStreets && inRect(x, z, p)) return true;
    return false;
  }
  function roadAllowed(x, z) {
    return L.isManhattan(x, z) && !L.inPark(x, z) && !closedAt(x, z);
  }
  for (const a of AVENUE_DEFS) {
    let start = null;
    for (let z = WORLD.minZ; z <= WORLD.maxZ + 1; z += 1) {
      const ok = z <= WORLD.maxZ && roadAllowed(a.x, z);
      if (ok && start === null) start = z;
      if (!ok && start !== null) {
        if (z - start > 20)
          avenues.push({
            x: a.x,
            z0: start,
            z1: z - 1,
            width: AVE_W,
            road: AVE_ROAD,
            name: a.name,
          });
        start = null;
      }
    }
  }
  for (let i = 0; i < STREET_COUNT; i++) {
    const z = STREET_Z0 + i * STREET_STEP;
    let start = null;
    for (let x = WORLD.minX; x <= WORLD.maxX + 1; x += 1) {
      const ok = x <= WORLD.maxX && roadAllowed(x, z);
      if (ok && start === null) start = x;
      if (!ok && start !== null) {
        if (x - start > 20)
          streets.push({
            z,
            x0: start,
            x1: x - 1,
            width: ST_W,
            road: ST_ROAD,
            name: STREET_NAMES[z],
          });
        start = null;
      }
    }
  }
  // Round 1: Broadway takes over avenue slots / renamed stretches (see AVENUE_OVERRIDES), street stubs cut.
  (function applyOverrides() {
    for (const ov of AVENUE_OVERRIDES) {
      for (let i = avenues.length - 1; i >= 0; i--) {
        const a = avenues[i];
        if (a.x !== ov.x) continue;
        avenues.splice(i, 1);
        for (const k of ov.keep) {
          const z0 = Math.max(a.z0, k.z0 === undefined ? -1e9 : k.z0),
            z1 = Math.min(a.z1, k.z1 === undefined ? 1e9 : k.z1);
          if (z1 - z0 > 20)
            avenues.splice(
              i,
              0,
              Object.assign({}, a, { z0, z1, name: k.name }),
            );
        }
      }
    }
    for (const c of STREET_CUTS) {
      for (let i = streets.length - 1; i >= 0; i--) {
        const s = streets[i];
        if (s.z !== c.z || s.x1 <= c.x0 || s.x0 >= c.x1) continue;
        streets.splice(i, 1);
        if (c.x0 - s.x0 > 20)
          streets.splice(i, 0, Object.assign({}, s, { x1: c.x0 }));
        if (s.x1 - c.x1 > 20)
          streets.splice(i, 0, Object.assign({}, s, { x0: c.x1 }));
      }
    }
  })();
  // Central Park transverse road (the 79th St transverse), sunken but at y=0 here
  streets.push({
    z: -760,
    x0: -110,
    x1: 110,
    width: 12,
    road: 8,
    name: "79th Street Transverse",
    park: true,
  });
  L.avenues = avenues;
  L.streets = streets;

  /** Roundabout at (x,z): 'island' | 'ring' (carriageway) | 'walk' (ring sidewalk, 3.5 m) | null. */
  L.circleAt = (x, z) => {
    for (const c of CIRCLES) {
      const d = Math.hypot(x - c.x, z - c.z);
      if (d <= c.rIsland) return { circle: c, part: "island", d };
      if (d <= c.rOuter) return { circle: c, part: "ring", d };
      if (d <= c.rOuter + 3.5) return { circle: c, part: "walk", d };
    }
    return null;
  };
  /** Is (x,z) inside any road corridor (incl. sidewalks)? roadOnly=true excludes sidewalks. */
  L.isRoad = (x, z, roadOnly) => {
    const ci = CIRCLES.length ? L.circleAt(x, z) : null;
    if (ci) {
      if (ci.part === "island") return false;
      if (ci.part === "ring") return true;
      if (!roadOnly) return true;
    }
    for (const a of avenues)
      if (
        z >= a.z0 &&
        z <= a.z1 &&
        Math.abs(x - a.x) <= (roadOnly ? a.road : a.width) / 2
      )
        return true;
    for (const s of streets)
      if (
        x >= s.x0 &&
        x <= s.x1 &&
        Math.abs(z - s.z) <= (roadOnly ? s.road : s.width) / 2
      )
        return true;
    if (L.onBroadway(x, z, roadOnly)) return true;
    return false;
  };
  L.onBroadway = (x, z, roadOnly) => {
    const hw = (roadOnly ? BROADWAY_ROAD : BROADWAY_W) / 2;
    for (let i = 0; i < BROADWAY.length - 1; i++) {
      const a = BROADWAY[i],
        b = BROADWAY[i + 1];
      if (distToSeg(x, z, a[0], a[1], b[0], b[1]) <= hw) return !L.inPark(x, z);
    }
    return false;
  };
  /** Exact footprint polygon of a site ([x,z] list): its `poly` when it has one (e.g. the Flatiron wedge), else its rect. */
  L.sitePoly = (s) =>
    (s && s.poly) ||
    (s
      ? [
          [s.x0, s.z0],
          [s.x1, s.z0],
          [s.x1, s.z1],
          [s.x0, s.z1],
        ]
      : null);
  /** Is (x,z) inside the site's exact footprint (poly-aware)? */
  L.inSite = (s, x, z) =>
    !!s && inRect(x, z, s) && (!s.poly || pointInPoly(x, z, s.poly));
  /** Site whose EXACT footprint contains (x,z) (poly-aware variant of siteAt, no padding), or null. */
  L.siteShapeAt = (x, z) => {
    for (const s of SITES) if (L.inSite(s, x, z)) return s;
    return null;
  };

  // ---- Bow-ties: pedestrian islands between Broadway and the crossing avenue (computed from the road geometry)
  /** Broadway centre x at z along the polyline segment covering z nearest to xNear (or null) + horizontal half-widths. */
