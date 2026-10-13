// play-inline-2 07 — math
// Lines 3451-3758 of readable/play-inline-2.pretty.js (statement-aligned).
  function broadwayXAt(z, xNear) {
    let best = null;
    for (let i = 0; i < BROADWAY.length - 1; i++) {
      const a = BROADWAY[i],
        b = BROADWAY[i + 1];
      if (
        Math.abs(b[1] - a[1]) < 1e-6 ||
        z < Math.min(a[1], b[1]) ||
        z > Math.max(a[1], b[1])
      )
        continue;
      const k = (b[0] - a[0]) / (b[1] - a[1]),
        x = a[0] + (z - a[1]) * k;
      const f = Math.sqrt(1 + k * k);
      if (!best || Math.abs(x - xNear) < Math.abs(best.x - xNear))
        best = { x, road: (BROADWAY_ROAD / 2) * f, walk: (BROADWAY_W / 2) * f };
    }
    return best;
  }
  for (const bt of BOWTIES) {
    bt.islands = [];
    const aHalf = AVE_ROAD / 2;
    let cur = null;
    const flush = () => {
      if (cur && cur.l.length >= 2)
        bt.islands.push({
          side: cur.side,
          poly: cur.l.concat(cur.r.slice().reverse()),
        });
      cur = null;
    };
    for (let z = bt.northZ; z <= bt.southZ + 1e-6; z += 0.5) {
      const bw = broadwayXAt(z, bt.avenueX);
      const inStreet = bt.streets.some((sz) => Math.abs(z - sz) <= ST_ROAD / 2);
      let seg = null;
      if (bw && !inStreet) {
        if (bw.x < bt.avenueX) {
          const x0 = bw.x + bw.road,
            x1 = bt.avenueX - aHalf;
          if (x1 - x0 > 0.6) seg = ["north", x0, x1];
        } else {
          const x0 = bt.avenueX + aHalf,
            x1 = bw.x - bw.road;
          if (x1 - x0 > 0.6) seg = ["south", x0, x1];
        }
      }
      if (!seg || (cur && cur.side !== seg[0])) flush();
      if (seg) {
        if (!cur) cur = { side: seg[0], l: [], r: [] };
        cur.l.push([seg[1], z]);
        cur.r.push([seg[2], z]);
      }
    }
    flush();
  }
  /** Inside a bow-tie site: { bowtie, part: 'carriageway' | 'island' | 'walk' } (walk = building-front pavement), else null. */
  L.bowtieAt = (x, z) => {
    for (const bt of BOWTIES) {
      const s = L.getSite(bt.site);
      if (!s || !inRect(x, z, s)) continue;
      if (L.isRoad(x, z, true)) return { bowtie: bt, part: "carriageway" };
      for (const is of bt.islands)
        if (pointInPoly(x, z, is.poly))
          return { bowtie: bt, part: "island", island: is };
      return { bowtie: bt, part: "walk" };
    }
    return null;
  };

  /**
   * Layout self-check (cheap, deterministic). Returns a list of issues:
   *  - 'broadway_in_site': Broadway ROADWAY area (m², 1 m samples) inside a site's exact footprint (plaza/bow-tie sites exempt)
   *  - 'broadway_in_pending': Broadway roadway inside an old footprint whose owner has not refitted yet (PENDING_REFIT)
   *  - 'site_overlap' / 'site_on_pending': two footprints overlapping (m²)
   * Used by the map (G.map.stats.layoutLint) and the layout tools.
   */
  L.lintLayout = () => {
    const out = [];
    const bwHits = new Map();
    for (let i = 0; i < BROADWAY.length - 1; i++) {
      const a = BROADWAY[i],
        b = BROADWAY[i + 1];
      const x0 = Math.min(a[0], b[0]) - 6,
        x1 = Math.max(a[0], b[0]) + 6,
        z0 = Math.min(a[1], b[1]) - 6,
        z1 = Math.max(a[1], b[1]) + 6;
      const cands = SITES.filter(
        (s) => !s.plaza && s.x1 > x0 && s.x0 < x1 && s.z1 > z0 && s.z0 < z1,
      )
        .map((s) => ["site", s])
        .concat(
          (L.PENDING_REFIT || [])
            .filter((s) => s.x1 > x0 && s.x0 < x1 && s.z1 > z0 && s.z0 < z1)
            .map((s) => ["pending", s]),
        );
      if (!cands.length) continue;
      for (const [kind, s] of cands) {
        let n = 0;
        for (let x = Math.max(x0, s.x0) + 0.5; x < Math.min(x1, s.x1); x += 1)
          for (
            let z = Math.max(z0, s.z0) + 0.5;
            z < Math.min(z1, s.z1);
            z += 1
          ) {
            if (distToSeg(x, z, a[0], a[1], b[0], b[1]) > BROADWAY_ROAD / 2)
              continue;
            if (kind === "site" ? L.inSite(s, x, z) : inRect(x, z, s)) n++;
          }
        if (n) {
          const key = kind + ":" + s.id;
          bwHits.set(key, (bwHits.get(key) || 0) + n);
        }
      }
    }
    for (const [key, n] of bwHits) {
      const [kind, id] = key.split(":");
      out.push({
        type: kind === "site" ? "broadway_in_site" : "broadway_in_pending",
        id,
        m2: n,
      });
    }
    const ov = (a, b) =>
      Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
      Math.max(0, Math.min(a.z1, b.z1) - Math.max(a.z0, b.z0));
    for (let i = 0; i < SITES.length; i++)
      for (let j = i + 1; j < SITES.length; j++) {
        const m2 = ov(SITES[i], SITES[j]);
        if (m2 > 1)
          out.push({
            type: "site_overlap",
            id: SITES[i].id,
            other: SITES[j].id,
            m2: Math.round(m2),
          });
      }
    for (const p of L.PENDING_REFIT || [])
      for (const s of SITES) {
        if (s.id === p.id) continue;
        const m2 = ov(p, s);
        if (m2 > 1)
          out.push({
            type: "site_on_pending",
            id: s.id,
            other: p.id + "(old)",
            m2: Math.round(m2),
          });
      }
    return out;
  };

  /**
   * Bow-tie carriageway check against the LIVE world (call after every module has built): for each bow-tie,
   * 1 m samples on its open carriageways (isRoad roadOnly) that sit inside a solid collider between kerb height
   * and 4.9 m (wrecked vehicles / actors exempt), plus the walkable ground height at the crossing centre (must be
   * street level ≈ 0: a canopy / market roof over the X would lift it). → [{type, id, owner, ...}] (empty = clean).
   */
  L.lintBowties = (W) => {
    W = W || G.world;
    const out = [];
    if (!W || !W.query || !W.pointInCollider) return out;
    for (const bt of BOWTIES) {
      const s = L.getSite(bt.site);
      if (!s) continue;
      let n = 0;
      const at = [];
      for (let x = s.x0 + 0.5; x < s.x1; x += 1)
        for (let z = s.z0 + 0.5; z < s.z1; z += 1) {
          if (!L.isRoad(x, z, true)) continue;
          for (const c of W.query(x - 0.01, z - 0.01, x + 0.01, z + 0.01)) {
            if (
              /actor|car|vehicle|bus|truck|wreck/.test(c.tag || "") ||
              c.minY >= 4.9 ||
              c.maxY <= 0.35 ||
              !W.pointInCollider(c, x, z, 0)
            )
              continue;
            n++;
            if (at.length < 12)
              at.push([x, z, c.tag || "", +c.maxY.toFixed(1)]);
            break;
          }
        }
      if (n)
        out.push({
          type: "bowtie_blocked",
          id: bt.id,
          owner: s.owner,
          m2: n,
          at,
        });
      const gy = W.groundHeight
        ? W.groundHeight(bt.crossing.x, bt.crossing.z, 60)
        : 0;
      if (typeof gy === "number" && Math.abs(gy) > 0.4)
        out.push({
          type: "bowtie_raised",
          id: bt.id,
          owner: s.owner,
          groundY: +gy.toFixed(2),
        });
    }
    return out;
  };

  /** Does rect touch a road corridor? (samples edges + interior) */
  L.rectHitsRoad = (x0, z0, x1, z1) => {
    const nx = Math.max(2, Math.ceil((x1 - x0) / 4)),
      nz = Math.max(2, Math.ceil((z1 - z0) / 4));
    for (let i = 0; i <= nx; i++)
      for (let j = 0; j <= nz; j++) {
        if (L.isRoad(x0 + ((x1 - x0) * i) / nx, z0 + ((z1 - z0) * j) / nz))
          return true;
      }
    return false;
  };

  /**
   * City blocks for generic buildings: rectangles between road corridors,
   * clipped to Manhattan, excluding the park. May overlap landmark sites —
   * callers must test L.rectOverlapsSite() per lot, and L.isLand() per lot corner.
   * Also includes blocks west of 10th Ave / east of Lexington up to the shore.
   */
  const blocks = [];
  (function buildBlocks() {
    const xs = [-420].concat(AVENUE_DEFS.map((a) => a.x)).concat([420]);
    for (let i = 0; i < xs.length - 1; i++) {
      const bx0 = xs[i] + (i === 0 ? 0 : AVE_W / 2),
        bx1 = xs[i + 1] - (i === xs.length - 2 ? 0 : AVE_W / 2);
      for (let k = -1; k < STREET_COUNT; k++) {
        const zA = k < 0 ? -1000 : STREET_Z0 + k * STREET_STEP;
        const zB =
          k + 1 >= STREET_COUNT ? 1010 : STREET_Z0 + (k + 1) * STREET_STEP;
        const bz0 = zA + (k < 0 ? 0 : ST_W / 2),
          bz1 = zB - (k + 1 >= STREET_COUNT ? 0 : ST_W / 2);
        const cx = (bx0 + bx1) / 2,
          cz = (bz0 + bz1) / 2;
        // keep if any sample point is on Manhattan and not in park
        let land = 0;
        for (let a = 0; a <= 4; a++)
          for (let b = 0; b <= 4; b++) {
            const px = bx0 + ((bx1 - bx0) * a) / 4,
              pz = bz0 + ((bz1 - bz0) * b) / 4;
            if (L.isManhattan(px, pz) && !L.inPark(px, pz)) land++;
          }
        if (land === 0) continue;
        blocks.push({
          x0: bx0,
          x1: bx1,
          z0: bz0,
          z1: bz1,
          cx,
          cz,
          district: null,
        });
      }
    }
    // Brooklyn: coarse warehouse blocks
    for (let x = 480; x < 800; x += 70)
      for (let z = 400; z < 980; z += 60) {
        const b = { x0: x + 7, x1: x + 63, z0: z + 7, z1: z + 53 };
        b.cx = (b.x0 + b.x1) / 2;
        b.cz = (b.z0 + b.z1) / 2;
        if (L.isBrooklyn(b.cx, b.cz)) blocks.push(b);
      }
  })();

  /** District name + style hint at (x,z). */
  L.districtAt = (x, z) => {
    if (x >= INTERIOR_X_MIN) return "interior";
    if (L.isBrooklyn(x, z)) return "brooklyn";
    if (L.isIsland(x, z)) return "harbor";
    if (!L.isManhattan(x, z)) return "water";
    if (L.inPark(x, z)) return "central_park";
    if (z < -420) return x < 0 ? "upper_west_side" : "upper_east_side";
    if (z < -140) return "midtown";
    if (z < 170) return "midtown_south";
    if (z < 520) return "greenwich_village";
    return "financial_district";
  };
  // Style hints for generic buildings per district (map module may refine)
  L.DISTRICT_STYLE = {
    upper_west_side: { minH: 18, maxH: 60, style: "apartment_block" },
    upper_east_side: { minH: 18, maxH: 60, style: "apartment_block" },
    midtown: { minH: 40, maxH: 150, style: "art_deco_skyscraper" },
    midtown_south: { minH: 25, maxH: 90, style: "commercial" },
    greenwich_village: { minH: 10, maxH: 30, style: "brownstone" },
    financial_district: { minH: 40, maxH: 140, style: "art_deco_skyscraper" },
    brooklyn: { minH: 8, maxH: 25, style: "warehouse" },
  };
  for (const b of blocks) b.district = L.districtAt(b.cx, b.cz);
  L.blocks = blocks;

  /** Location containing (x,z), nearest-first. */
  L.locationAt = (x, z) => {
    let best = null,
      bd = 1e9;
    for (const l of LOCATIONS) {
      const d = Math.hypot(x - l.x, z - l.z);
      if (d <= l.r && d < bd) {
        bd = d;
        best = l;
      }
    }
    return best;
  };

  G.LAYOUT = L;
