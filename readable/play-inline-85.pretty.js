/* src/map/40_buildings.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 40 BUILDINGS
 * Generic city fabric on G.LAYOUT.blocks (+ the map's Upper East/West
 * Side sub-blocks): lot subdivision per district and five building
 * families — art-deco setback skyscrapers (spires, ziggurat crowns,
 * pyramids), commercial/office blocks, old-world apartment houses,
 * brownstone & tenement rows with stoops, Brooklyn warehouses — plus
 * ruin states: jagged broken tops with exposed girders, blown-out floors,
 * shell holes, leaning towers and collapsed lots. Colliders per building
 * footprint/tier. Enterable storefront shells: the building & shop front
 * here, the shop room + loot records in 40_buildings_interior.js (so are
 * the dim shop rooms behind open / display-glass storefront bays).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const SY = M.SIDEWALK_Y;

  // Facade style → variants available
  const FSTYLE = {
    artdeco: 4,
    office: 3,
    apartment: 4,
    brownstone: 3,
    warehouse: 2,
  };
  // Tints (vertex colour multipliers) per family
  // (22 years of soot, fire and dust: nothing is clean cream any more — tints lean grimy grey-brown)
  const TINTS = {
    artdeco: [
      [0.86, 0.82, 0.76],
      [0.8, 0.79, 0.76],
      [0.88, 0.82, 0.72],
      [0.74, 0.73, 0.7],
      [0.84, 0.78, 0.7],
      [0.66, 0.64, 0.6],
    ],
    office: [
      [0.82, 0.81, 0.78],
      [0.76, 0.77, 0.77],
      [0.86, 0.82, 0.76],
      [0.7, 0.69, 0.66],
    ],
    apartment: [
      [0.92, 0.85, 0.78],
      [0.86, 0.78, 0.7],
      [0.9, 0.87, 0.8],
      [0.8, 0.73, 0.67],
      [0.9, 0.82, 0.74],
      [0.7, 0.64, 0.58],
    ],
    brownstone: [
      [0.95, 0.88, 0.84],
      [0.84, 0.78, 0.74],
      [0.96, 0.9, 0.82],
      [0.88, 0.82, 0.8],
    ],
    warehouse: [
      [0.92, 0.86, 0.8],
      [0.84, 0.77, 0.72],
      [0.9, 0.88, 0.82],
    ],
  };
  const TRIM_C = [0.95, 0.93, 0.87];

  // -------------------------------------------------------------------
  // Lot planning
  // -------------------------------------------------------------------
  function subBlocks() {
    const L = G.LAYOUT;
    const out = [];
    const extra = M.roads.extraStreets;
    for (const b of L.blocks) {
      if (b.district === "brooklyn") {
        out.push({ x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, brooklyn: true });
        continue;
      }
      // cut by extra streets running through the block
      const cuts = extra
        .filter(
          (s) =>
            s.z - s.width / 2 > b.z0 &&
            s.z + s.width / 2 < b.z1 &&
            s.x1 > b.x0 &&
            s.x0 < b.x1,
        )
        .map((s) => s.z)
        .sort((p, q) => p - q);
      // where Broadway runs in an avenue slot (narrower corridor than the avenue) the block grows to its kerb line
      let bx0 = b.x0,
        bx1 = b.x1;
      const midZ = (b.z0 + b.z1) / 2,
        grow = (L.AVE_W - L.BROADWAY_W) / 2;
      const slotIsBroadway = (x) =>
        !M.roads.avenues.some(
          (a) => Math.abs(a.x - x) < 1 && midZ >= a.z0 && midZ <= a.z1,
        ) &&
        L.onBroadway(x, b.z0 + 1) &&
        L.onBroadway(x, b.z1 - 1);
      if (grow > 0 && slotIsBroadway(b.x0 - L.AVE_W / 2)) bx0 -= grow;
      if (grow > 0 && slotIsBroadway(b.x1 + L.AVE_W / 2)) bx1 += grow;
      let z = b.z0;
      for (const cz of cuts) {
        out.push({ x0: bx0, x1: bx1, z0: z, z1: cz - 7 });
        z = cz + 7;
      }
      out.push({ x0: bx0, x1: bx1, z0: z, z1: b.z1 });
    }
    return out;
  }
  function styleFor(cx, cz) {
    const L = G.LAYOUT;
    let d = L.districtAt(cx, cz);
    if (d === "water") return null;
    if (d === "central_park") return null;
    return d;
  }
  /** Is the rect fully on land & off the promenade band? */
  function lotOnLand(x0, z0, x1, z1) {
    const L = G.LAYOUT;
    const inset = (x, z) =>
      L.isBrooklyn(x, z)
        ? M.inPoly(x, z, M.bkInset)
        : M.inPoly(x, z, M.manInset);
    return (
      inset(x0 - 1, z0 - 1) &&
      inset(x1 + 1, z0 - 1) &&
      inset(x1 + 1, z1 + 1) &&
      inset(x0 - 1, z1 + 1) &&
      inset((x0 + x1) / 2, (z0 + z1) / 2)
    );
  }
  /**
   * Footprints kept free of filler buildings although no LAYOUT site covers them: the elevated High Line spur
   * (poi_chelsea) crossing the block east of the main line — a filler block sat on it (its "High Line Siding"
   * door target ended up inside that building).
   */
  const RESERVED = [
    { id: "high_line_spur", x0: -299, x1: -262, z0: 236.5, z1: 245.5 },
  ];
  M.RESERVED_LOTS = RESERVED;
  function lotValid(x0, z0, x1, z1) {
    const L = G.LAYOUT;
    for (const o of RESERVED)
      if (x1 > o.x0 - 1 && x0 < o.x1 + 1 && z1 > o.z0 - 1 && z0 < o.z1 + 1)
        return false;
    if (x1 - x0 < 4 || z1 - z0 < 4) return false;
    if (!lotOnLand(x0, z0, x1, z1)) return false;
    if (L.rectOverlapsSite(x0, z0, x1, z1, 1.5)) return false;
    if (L.inPark((x0 + x1) / 2, (z0 + z1) / 2)) return false;
    if (M.rectHitsCorridor(x0 + 0.3, z0 + 0.3, x1 - 0.3, z1 - 0.3))
      return false;
    for (const o of M.OPEN_SPACES)
      if (x1 > o.x0 && x0 < o.x1 && z1 > o.z0 && z0 < o.z1) return false;
    // old footprints of sites moved this round stay reserved until their owners refit (LAYOUT.PENDING_REFIT)
    for (const o of L.PENDING_REFIT || [])
      if (
        x1 > o.x0 - 1.5 &&
        x0 < o.x1 + 1.5 &&
        z1 > o.z0 - 1.5 &&
        z0 < o.z1 + 1.5
      )
        return false;
    return true;
  }
  /** Largest valid sub-rect reached by pulling back one or two sides (0.5 m steps, ≤ 60 % of the span). */
  function fitLot(x0, z0, x1, z1, minSize) {
    const W = x1 - x0,
      D = z1 - z0;
    let best = null,
      bestA = 0;
    const tryR = (a0, b0, a1, b1) => {
      if (a1 - a0 < minSize || b1 - b0 < minSize) return;
      const A = (a1 - a0) * (b1 - b0);
      if (A > bestA && lotValid(a0, b0, a1, b1)) {
        best = { x0: a0, z0: b0, x1: a1, z1: b1 };
        bestA = A;
      }
    };
    for (let k = 1; k <= 12; k++) {
      const dx = Math.min(W * 0.6, k * 0.5 * Math.max(1, W / 12)),
        dz = Math.min(D * 0.6, k * 0.5 * Math.max(1, D / 12));
      tryR(x0 + dx, z0, x1, z1);
      tryR(x0, z0, x1 - dx, z1);
      tryR(x0, z0 + dz, x1, z1);
      tryR(x0, z0, x1, z1 - dz);
      if (best) return best;
    }
    for (let k = 1; k <= 8; k++) {
      const dx = Math.min(W * 0.45, k * 0.5 * Math.max(1, W / 10)),
        dz = Math.min(D * 0.45, k * 0.5 * Math.max(1, D / 10));
      tryR(x0 + dx, z0 + dz, x1, z1);
      tryR(x0, z0 + dz, x1 - dx, z1);
      tryR(x0 + dx, z0, x1, z1 - dz);
      tryR(x0, z0, x1 - dx, z1 - dz);
      tryR(x0 + dx, z0, x1 - dx, z1);
      tryR(x0, z0 + dz, x1, z1 - dz);
      if (best) return best;
    }
    return null;
  }
  /** Split length len into parts with widths in [mn, mx]. */
  function splitLen(len, mn, mx, r) {
    const parts = [];
    let rem = len;
    while (rem > mx) {
      const w = r.range(mn, Math.min(mx, rem - mn));
      parts.push(w);
      rem -= w;
    }
    if (rem < mn * 0.6 && parts.length) parts[parts.length - 1] += rem;
    else parts.push(rem);
    return parts;
  }
  function planLots() {
    const lots = [];
    const blocks = subBlocks();
    for (const bl of blocks) {
      const cx = (bl.x0 + bl.x1) / 2,
        cz = (bl.z0 + bl.z1) / 2;
      // blocks cut by Broadway / a roundabout are filled with polygon lots flush to the kerb (41_fronts.js)
      if (M.claimCutBlock && M.claimCutBlock(bl)) continue;
      const r = M.rng("blk" + Math.round(bl.x0) + "," + Math.round(bl.z0));
      const W = bl.x1 - bl.x0,
        D = bl.z1 - bl.z0;
      const lot0 = lots.length;
      const d = bl.brooklyn ? "brooklyn" : styleFor(cx, cz);
      const mk = (x0, z0, x1, z1, kind, extra) => {
        const lcx = (x0 + x1) / 2,
          lcz = (z0 + z1) / 2;
        const dist = bl.brooklyn ? "brooklyn" : styleFor(lcx, lcz);
        if (!dist) return false;
        const lot = Object.assign(
          {
            x0,
            z0,
            x1,
            z1,
            kind,
            district: dist,
            block: bl,
            front: {
              n: Math.abs(z0 - bl.z0) < 0.01,
              s: Math.abs(z1 - bl.z1) < 0.01,
              w: Math.abs(x0 - bl.x0) < 0.01,
              e: Math.abs(x1 - bl.x1) < 0.01,
            },
          },
          extra || {},
        );
        if (lotValid(x0, z0, x1, z1)) {
          lots.push(lot);
          return true;
        } else if (kind !== "brownstone" && x1 - x0 > 14 && z1 - z0 > 14) {
          // pull back only the side(s) that hit something (shore, a landmark, an open space) so the
          // remaining street fronts stay flush with the kerb (round 1: was a 4 m shrink on all four sides)
          const fit = fitLot(x0, z0, x1, z1, 7);
          if (fit) {
            lot.front = {
              n: lot.front.n && fit.z0 === z0,
              s: lot.front.s && fit.z1 === z1,
              w: lot.front.w && fit.x0 === x0,
              e: lot.front.e && fit.x1 === x1,
            };
            if (fit.z0 !== z0) lot.faceN = false;
            if (fit.z1 !== z1) lot.faceS = false;
            lot.x0 = fit.x0;
            lot.x1 = fit.x1;
            lot.z0 = fit.z0;
            lot.z1 = fit.z1;
            lots.push(lot);
            return true;
          }
        }
        return false;
      };
      if (!d) {
        // shoreline blocks whose centre is in the water: sample a few land lots
        for (const [fx0, fx1] of [
          [0, 0.5],
          [0.5, 1],
        ])
          for (const [fz0, fz1] of [
            [0, 0.5],
            [0.5, 1],
          ]) {
            const x0 = bl.x0 + W * fx0,
              x1 = bl.x0 + W * fx1,
              z0 = bl.z0 + D * fz0,
              z1 = bl.z0 + D * fz1;
            const dd = styleFor((x0 + x1) / 2, (z0 + z1) / 2);
            if (!dd) continue;
            mk(x0, z0, x1, z1, kindFor(dd, r));
          }
        continue;
      }
      if (d === "midtown" || d === "financial_district") {
        const parts = splitLen(W, 18, 34, r);
        let x = bl.x0;
        for (const w of parts) {
          if (D > 48) {
            const dz = splitLen(D, 22, 36, r);
            let z = bl.z0;
            for (const h of dz) {
              mk(x, z, x + w, z + h, r() < 0.8 ? "tower" : "commercial");
              z += h;
            }
          } else
            mk(x, bl.z0, x + w, bl.z1, r() < 0.78 ? "tower" : "commercial");
          x += w;
        }
      } else if (d === "midtown_south") {
        const parts = splitLen(W, 14, 26, r);
        let x = bl.x0;
        for (const w of parts) {
          if (D > 26 && r() < 0.5) {
            const h = D * r.range(0.42, 0.58);
            mk(x, bl.z0, x + w, bl.z0 + h, "commercial");
            mk(
              x,
              bl.z0 + h,
              x + w,
              bl.z1,
              r() < 0.5 ? "commercial" : "tenement",
            );
          } else
            mk(x, bl.z0, x + w, bl.z1, r() < 0.25 ? "tower" : "commercial");
          x += w;
        }
      } else if (
        d === "upper_west_side" ||
        d === "upper_east_side" ||
        d === "greenwich_village"
      ) {
        const village = d === "greenwich_village";
        // corner buildings on the avenue ends, rowhouses in between on both street faces
        const endW = village ? r.range(10, 16) : r.range(16, 24);
        const hasW = W > 40,
          hasE = W > 40;
        let xa = bl.x0,
          xb = bl.x1;
        if (hasW) {
          mk(
            bl.x0,
            bl.z0,
            bl.x0 + endW,
            bl.z1,
            village ? (r() < 0.6 ? "tenement" : "commercial") : "apartment",
          );
          xa += endW;
        }
        if (hasE) {
          const ew = village ? r.range(10, 16) : r.range(16, 24);
          mk(
            bl.x1 - ew,
            bl.z0,
            bl.x1,
            bl.z1,
            village ? (r() < 0.6 ? "tenement" : "apartment") : "apartment",
          );
          xb -= ew;
        }
        if (D > 60 && !village) {
          // very deep blocks: a courtyard apartment block in the middle
          mk(xa + 2, bl.z0 + 16, xb - 2, bl.z1 - 16, "apartment", {
            courtyard: true,
          });
        }
        const rowD = Math.min(15, D / 2 - 1.5);
        let x = xa;
        const rowParts = splitLen(xb - xa, 5.8, 8.2, r);
        for (const w of rowParts) {
          const kind = village
            ? r() < 0.72
              ? "brownstone"
              : "tenement"
            : r() < 0.8
              ? "brownstone"
              : "tenement";
          mk(x, bl.z0, x + w, bl.z0 + rowD, kind, { faceN: true });
          x += w;
        }
        x = xa;
        for (const w of splitLen(xb - xa, 5.8, 8.2, r)) {
          const kind = village
            ? r() < 0.72
              ? "brownstone"
              : "tenement"
            : r() < 0.8
              ? "brownstone"
              : "tenement";
          mk(x, bl.z1 - rowD, x + w, bl.z1, kind, { faceS: true });
          x += w;
        }
      } else if (d === "brooklyn") {
        if (r() < 0.45)
          mk(bl.x0 + 1, bl.z0 + 1, bl.x1 - 1, bl.z1 - 1, "warehouse");
        else {
          const h = D * r.range(0.4, 0.6);
          mk(bl.x0 + 1, bl.z0 + 1, bl.x1 - 1, bl.z0 + h, "warehouse");
          mk(
            bl.x0 + 1,
            bl.z0 + h + 1,
            bl.x1 - 1,
            bl.z1 - 1,
            r() < 0.8 ? "warehouse" : "tenement",
          );
        }
      }
      if (d) fillFrontGaps(bl, lots, lot0, mk, d);
    }
    return lots;
  }
  /**
   * Round 2: close the holes in the street wall. The planners drop lots that clip a site / open space / the
   * shore (brownstone rows are dropped outright), which left bare paved strips along many kerbs. Walk each block
   * edge 1.5 m inside the building line; every uncovered run ≥ 6 m that is not a site / open space / park / water /
   * street gets an infill building flush to that kerb (depth 14 → 6 m until it fits), kind by district.
   * Deterministic, no draws from the block rng (hash-based kinds), so every existing building stays as it was.
   */
  function fillFrontGaps(bl, lots, lot0, mk, d) {
    const L = G.LAYOUT;
    const mine = () => lots.slice(lot0);
    const covered = (x, z) => {
      for (const l of mine())
        if (
          x > l.x0 - 0.4 &&
          x < l.x1 + 0.4 &&
          z > l.z0 - 0.4 &&
          z < l.z1 + 0.4
        )
          return true;
      return false;
    };
    const blocked = (x, z) => {
      if (L.rectOverlapsSite(x - 0.5, z - 0.5, x + 0.5, z + 0.5, 3))
        return true;
      if (!lotOnLand(x - 0.5, z - 0.5, x + 0.5, z + 0.5) || L.inPark(x, z))
        return true;
      if (M.rectHitsCorridor(x - 0.5, z - 0.5, x + 0.5, z + 0.5)) return true;
      for (const o of M.OPEN_SPACES)
        if (x > o.x0 - 1 && x < o.x1 + 1 && z > o.z0 - 1 && z < o.z1 + 1)
          return true;
      for (const o of RESERVED)
        if (
          x > o.x0 - 1.5 &&
          x < o.x1 + 1.5 &&
          z > o.z0 - 1.5 &&
          z < o.z1 + 1.5
        )
          return true;
      for (const o of L.PENDING_REFIT || [])
        if (x > o.x0 - 2 && x < o.x1 + 2 && z > o.z0 - 2 && z < o.z1 + 2)
          return true;
      // keep subway stairwells free-standing in the sidewalk (no shop front hard against their railings)
      for (const e of M.subwayEntrances || [])
        if (
          Math.abs(x - e.cx) < e.len / 2 + 4 &&
          Math.abs(z - e.cz) < e.w / 2 + 4
        )
          return true;
      return false;
    };
    const overlapsMine = (x0, z0, x1, z1) =>
      mine().some(
        (l) =>
          x1 > l.x0 + 0.05 &&
          x0 < l.x1 - 0.05 &&
          z1 > l.z0 + 0.05 &&
          z0 < l.z1 - 0.05,
      );
    const kindAt = (x, z) => {
      const h = M.hash(x, z, 91);
      if (d === "brooklyn") return h < 0.8 ? "warehouse" : "tenement";
      if (d === "midtown" || d === "financial_district") return "commercial"; // infill is ≤ 14 m deep: no setback towers
      if (d === "midtown_south") return h < 0.6 ? "commercial" : "tenement";
      if (d === "greenwich_village") return h < 0.7 ? "tenement" : "commercial";
      return h < 0.55 ? "tenement" : "apartment";
    };
    const W = bl.x1 - bl.x0,
      D = bl.z1 - bl.z0;
    const edges = [
      ["n", (t) => [bl.x0 + t, bl.z0 + 1.5], W],
      ["s", (t) => [bl.x0 + t, bl.z1 - 1.5], W],
      ["w", (t) => [bl.x0 + 1.5, bl.z0 + t], D],
      ["e", (t) => [bl.x1 - 1.5, bl.z0 + t], D],
    ];
    let added = 0;
    for (const [k, at, len] of edges) {
      const runs = [];
      let a = null;
      for (let t = 0.5; t <= len - 0.5; t += 1) {
        const [x, z] = at(t);
        const gap = !covered(x, z) && !blocked(x, z);
        if (gap) {
          if (a === null) a = t;
        } else if (a !== null) {
          runs.push([a, t - 1]);
          a = null;
        }
      }
      if (a !== null) runs.push([a, len - 0.5]);
      for (const [t0r, t1r] of runs) {
        const t0 = Math.max(0, t0r - 0.4),
          t1 = Math.min(len, t1r + 0.4);
        if (t1 - t0 < 6) continue;
        const alongX = k === "n" || k === "s";
        const maxD = Math.min(14, (alongX ? D : W) - 1);
        let ok = false;
        for (let dep = maxD; dep >= 6 && !ok; dep -= 2) {
          for (const trim of [0, 1, 2]) {
            const u0 = t0 + trim,
              u1 = t1 - trim;
            if (u1 - u0 < 6) break;
            let x0, z0, x1, z1;
            if (alongX) {
              x0 = bl.x0 + u0;
              x1 = bl.x0 + u1;
              if (k === "n") {
                z0 = bl.z0;
                z1 = bl.z0 + dep;
              } else {
                z1 = bl.z1;
                z0 = bl.z1 - dep;
              }
            } else {
              z0 = bl.z0 + u0;
              z1 = bl.z0 + u1;
              if (k === "w") {
                x0 = bl.x0;
                x1 = bl.x0 + dep;
              } else {
                x1 = bl.x1;
                x0 = bl.x1 - dep;
              }
            }
            if (overlapsMine(x0, z0, x1, z1) || !lotValid(x0, z0, x1, z1))
              continue;
            // wide runs: several storefront buildings rather than one long slab
            const span = alongX ? x1 - x0 : z1 - z0,
              parts = Math.max(1, Math.round(span / 16));
            for (let i = 0; i < parts; i++) {
              const pa = i / parts,
                pb = (i + 1) / parts;
              const X0 = alongX ? x0 + (x1 - x0) * pa : x0,
                X1 = alongX ? x0 + (x1 - x0) * pb : x1;
              const Z0 = alongX ? z0 : z0 + (z1 - z0) * pa,
                Z1 = alongX ? z1 : z0 + (z1 - z0) * pb;
              if (
                mk(X0, Z0, X1, Z1, kindAt((X0 + X1) / 2, (Z0 + Z1) / 2), {
                  infill: true,
                  faceN: k === "n" || undefined,
                  faceS: k === "s" || undefined,
                })
              )
                added++;
            }
            ok = true;
            break;
          }
        }
      }
    }
    M.infillLots = (M.infillLots || 0) + added;
    return added;
  }
  function kindFor(d, r) {
    if (d === "midtown" || d === "financial_district")
      return r() < 0.6 ? "tower" : "commercial";
    if (d === "midtown_south") return "commercial";
    if (d === "greenwich_village") return "tenement";
    if (d === "brooklyn") return "warehouse";
    return "apartment";
  }

  // -------------------------------------------------------------------
  // Shared emitters
  // -------------------------------------------------------------------
  const TILE = () => M.facadeTile();
  // Friendly settlements (only inhabited places are lit in the Ruins): façades around them keep lit windows at night.
  let SETTLE = null;
  function nearSettlement(x, z) {
    if (!SETTLE)
      SETTLE = (G.LAYOUT.LOCATIONS || []).filter(
        (l) => !l.hostile && l.type === "settlement",
      );
    for (const l of SETTLE)
      if (Math.hypot(x - l.x, z - l.z) < l.r + 35) return true;
    return false;
  }
  M.nearSettlement = nearSettlement;
  /** Façade variant (as material-key suffix) for a lot: one variant per style per chunk, '@lit' near settlements. */
  M.chunkVariant = (style, x, z) => chunkVariant(style, x, z);
  function chunkVariant(style, x, z, salt) {
    const n = FSTYLE[style];
    const ch = Math.floor(x / M.CHUNK) * 31 + Math.floor(z / M.CHUNK) * 17;
    const pair = ((ch % n) + n) % n;
    void salt; // one variant per style per chunk keeps draw calls down
    return 1 + pair + (nearSettlement(x, z) ? "@lit" : "");
  }
  /**
   * Walls of a box footprint with façade UVs. sides: which sides get façade
   * (others get blank brick 'party' walls or are skipped): o.face = {n,e,s,w} → 'f' façade, 'b' blank brick, 'x' skip.
   * vBase: y where the window grid starts. Grime band at the bottom when y0 < 6.
   */
  function facadeWalls(x0, z0, x1, z1, y0, y1, fmat, tint, o) {
    o = o || {};
    const tile = TILE();
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const bf = M.buf(fmat, cx, cz);
    const blank = o.blank || "brick_brown";
    // per-building window-grid offsets (whole bays / whole storeys) hide the atlas repetition
    const hsh = M.hash(Math.round(x0 * 3), Math.round(z0 * 3), 17);
    const vBase =
      (o.vBase === undefined ? 0 : o.vBase) -
      Math.floor(hsh * M.FACADE.floors) * M.FACADE.floorH;
    const face = o.face || { n: "f", e: "f", s: "f", w: "f" };
    const sides = [
      ["n", x0, z0, x1, z0],
      ["e", x1, z0, x1, z1],
      ["s", x1, z1, x0, z1],
      ["w", x0, z1, x0, z0],
    ];
    // fire-gutted buildings are soot-blackened all over; every building gets a darker, dirtier street level
    const lotNow = M.curLot || {};
    const burnK = lotNow.burnt ? 0.52 : 1;
    const topC = M.mulc(tint, (o.topDark || 0.92) * burnK),
      midC = M.mulc(tint, burnK),
      lowC = M.mulc(tint, 0.55 * burnK);
    for (const [k, ax, az, bx, bz] of sides) {
      const f = face[k] || "f";
      if (f === "x") continue;
      const len = Math.hypot(bx - ax, bz - az);
      if (!M.getXF() && len > 2)
        M.wallLog.push({
          ax,
          az,
          bx,
          bz,
          nx: (bz - az) / len,
          nz: -(bx - ax) / len,
          y0,
          y1,
          f,
          lot: M.curLot,
          top: o.top,
        });
      const uo =
        (o.uOff || 0) +
        Math.floor(M.hash(ax, az, 23) * M.FACADE.bays) / M.FACADE.bays;
      if (f === "f") {
        const trimStyle = /^facade\/(apartment|brownstone)\//.exec(fmat);
        if (trimStyle && !M.getXF() && o.trim !== false && lotNow.front) {
          const fr = {
            n: lotNow.front.n || !!lotNow.faceN,
            s: lotNow.front.s || !!lotNow.faceS,
            e: lotNow.front.e,
            w: lotNow.front.w,
          };
          if (fr[k])
            windowTrim(ax, az, bx, bz, y0, y1, vBase, uo, trimStyle[1]);
        }
        // vertical weathering gradient: soot-dark street level → grimy lower floors → sun-bleached upper storeys
        const cuts = [y0];
        for (const yc of [7, 20])
          if (yc > y0 + 0.5 && yc < y1 - 0.5) cuts.push(yc);
        cuts.push(y1);
        const colAt = (y) =>
          y <= 7
            ? M.mixc(lowC, midC, M.clamp((y - 1) / 6, 0, 1))
            : y <= 20
              ? M.mixc(M.mulc(midC, 0.84), midC, (y - 7) / 13)
              : M.mixc(midC, topC, M.clamp((y - 20) / 60, 0, 1));
        for (let q = 0; q < cuts.length - 1; q++) {
          const ya = cuts[q],
            yb = cuts[q + 1];
          M.wall(
            bf,
            ax,
            az,
            bx,
            bz,
            ya,
            yb,
            uo,
            uo + len / tile.w,
            (ya - vBase) / tile.h,
            (yb - vBase) / tile.h,
            colAt(ya),
            colAt(yb),
          );
        }
      } else {
        const bb = M.buf(blank, cx, cz);
        const s = M.sc(blank);
        M.wall(
          bb,
          ax,
          az,
          bx,
          bz,
          y0,
          y1,
          0,
          len / s,
          y0 / s,
          y1 / s,
          M.mulc(tint, y0 < 7 ? 0.7 : 0.95),
          M.mulc(tint, 0.9),
        );
      }
    }
  }
  M.facadeWalls = facadeWalls;
  /** Log an extra wall (stone bases, areaways…) for the decay pass (42_decay.js). */
  M.logWall = function (ax, az, bx, bz, y0, y1, f, top) {
    const len = Math.hypot(bx - ax, bz - az);
    if (M.getXF() || len < 2) return;
    M.wallLog.push({
      ax,
      az,
      bx,
      bz,
      nx: (bz - az) / len,
      nz: -(bx - ax) / len,
      y0,
      y1,
      f: f || "f",
      lot: M.curLot,
      top: top === undefined ? false : top,
    });
  };
  M.wallLog = [];
  /** Roof slab + parapet. */
  function roof(x0, z0, x1, z1, y, o) {
    o = o || {};
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const b = M.buf(o.mat || "roof_tar", cx, cz);
    const c = o.c || [0.85, 0.83, 0.8];
    M.box(b, x0, y - 0.05, z0, x1, y + 0.02, z1, {
      s: 4,
      c,
      skip: 8 + 1 + 2 + 16 + 32,
    });
    if (o.parapet !== false) {
      const p = o.parapet || 0.9,
        t = 0.3;
      const bt = M.buf(o.trim || "stone_limestone", cx, cz);
      const tc = o.trimC || M.mulc(TRIM_C, 0.9);
      M.box(bt, x0 - 0.05, y, z0 - 0.05, x1 + 0.05, y + p, z0 + t, {
        s: 2,
        c: tc,
      });
      M.box(bt, x0 - 0.05, y, z1 - t, x1 + 0.05, y + p, z1 + 0.05, {
        s: 2,
        c: tc,
      });
      M.box(bt, x0 - 0.05, y, z0 + t, x0 + t, y + p, z1 - t, { s: 2, c: tc });
      M.box(bt, x1 - t, y, z0 + t, x1 + 0.05, y + p, z1 - t, { s: 2, c: tc });
    }
  }
  M.roof = roof;
  /** Projecting cornice band around a footprint at height y. */
  function cornice(x0, z0, x1, z1, y, depth, h, mat, c, o) {
    o = o || {};
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const b = M.buf(mat || "stone_limestone", cx, cz);
    c = c || TRIM_C;
    const d = depth;
    // stepped profile: small fillet, big overhang, top cap
    M.box(
      b,
      x0 - d * 0.35,
      y,
      z0 - d * 0.35,
      x1 + d * 0.35,
      y + h * 0.35,
      z1 + d * 0.35,
      { s: 2, c: M.mulc(c, 0.85) },
    );
    M.box(b, x0 - d, y + h * 0.35, z0 - d, x1 + d, y + h, z1 + d, {
      s: 2,
      c,
      cb: M.mulc(c, 0.7),
    });
    if (o.brackets) {
      const bb = M.buf(mat || "stone_limestone", cx, cz, "detail");
      const step = 1.4;
      for (const [ax, az, bx, bz, nx, nz] of [
        [x0, z0, x1, z0, 0, -1],
        [x0, z1, x1, z1, 0, 1],
        [x0, z0, x0, z1, -1, 0],
        [x1, z0, x1, z1, 1, 0],
      ]) {
        if (
          o.sides &&
          !o.sides[nx < 0 ? "w" : nx > 0 ? "e" : nz < 0 ? "n" : "s"]
        )
          continue;
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.floor(len / step);
        for (let i = 1; i < n; i++) {
          const t = i / n,
            px = ax + (bx - ax) * t + nx * d * 0.5,
            pz = az + (bz - az) * t + nz * d * 0.5;
          M.box(
            bb,
            px - 0.12 - Math.abs(nz) * 0,
            y - 0.5,
            pz - 0.12,
            px + 0.12,
            y + h * 0.35,
            pz + 0.12,
            { s: 1, c: M.mulc(c, 0.8) },
          );
        }
      }
    }
  }
  M.cornice = cornice;
  /** Horizontal belt course (string course). */
  function belt(x0, z0, x1, z1, y, d, h, mat, c) {
    const b = M.buf(mat || "stone_limestone", (x0 + x1) / 2, (z0 + z1) / 2);
    M.box(b, x0 - d, y, z0 - d, x1 + d, y + h, z1 + d, {
      s: 2,
      c: c || TRIM_C,
    });
  }
  /** Corner piers (vertical strips) of a tier. */
  function piers(x0, z0, x1, z1, y0, y1, w, d, mat, c) {
    const b = M.buf(mat || "stone_limestone", (x0 + x1) / 2, (z0 + z1) / 2);
    for (const [px, pz] of [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ])
      M.box(
        b,
        px - w / 2 - d,
        y0,
        pz - w / 2 - d,
        px + w / 2 + d,
        y1,
        pz + w / 2 + d,
        { s: 2, c: c || TRIM_C, skip: 8 + 4 },
      );
  }

  /** Dark shell hole / blast damage on a wall (quad in front of the wall with scorch decal). */
  function shellHole(ax, az, bx, bz, t, y, w, h, nx, nz) {
    const px = ax + (bx - ax) * t + nx * 0.06,
      pz = az + (bz - az) * t + nz * 0.06;
    const ux = bx - ax,
      uz = bz - az,
      l = Math.hypot(ux, uz) || 1;
    const dx = ((ux / l) * w) / 2,
      dz = ((uz / l) * w) / 2;
    const b = M.buf("glass_dirty", px, pz);
    // irregular octagon-ish hole: two quads
    const c = [0.08, 0.08, 0.08];
    M.quad(
      b,
      [px - dx, y - h * 0.35, pz - dz],
      [px + dx, y - h * 0.45, pz + dz],
      [px + dx * 0.8, y + h * 0.5, pz + dz * 0.8],
      [px - dx * 0.9, y + h * 0.4, pz - dz * 0.9],
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 1, 0, 1],
      c,
    );
    M.quad(
      b,
      [px - dx * 0.5, y + h * 0.4, pz - dz * 0.5],
      [px + dx * 0.6, y + h * 0.45, pz + dz * 0.6],
      [px + dx * 0.2, y + h * 0.62, pz + dz * 0.2],
      [px - dx * 0.2, y + h * 0.6, pz - dz * 0.2],
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 1, 0, 1],
      c,
    );
    // scorch decal around
    const sb = M.buf("my/markings", px, pz, "detail");
    const k = 1.8,
      suv = M.markUV(M.MARK.SCORCH);
    M.quad(
      sb,
      [px - dx * k + nx * 0.02, y - h * k * 0.5, pz - dz * k + nz * 0.02],
      [px + dx * k + nx * 0.02, y - h * k * 0.5, pz + dz * k + nz * 0.02],
      [px + dx * k + nx * 0.02, y + h * k * 0.6, pz + dz * k + nz * 0.02],
      [px - dx * k + nx * 0.02, y + h * k * 0.6, pz - dz * k + nz * 0.02],
      [nx, 0, nz],
      [suv[0], suv[1], suv[2], suv[1], suv[2], suv[3], suv[0], suv[3]],
    );
    // twisted girder stubs poking out
    const gb = M.buf("rust", px, pz, "detail");
    for (let i = 0; i < 2; i++)
      M.beam(
        gb,
        px - dx * (0.5 - i),
        y - h * 0.2,
        pz - dz * (0.5 - i),
        px - dx * (0.5 - i) + nx * 1.5,
        y - h * 0.2 + (i ? 0.6 : -0.4),
        pz - dz * (0.5 - i) + nz * 1.5,
        0.15,
        0.25,
        { c: [0.8, 0.7, 0.6] },
      );
  }
  M.shellHole = shellHole;
  function randomHoles(x0, z0, x1, z1, yMin, yMax, n, r, face) {
    const sides = [
      ["n", x0, z0, x1, z0, 0, -1],
      ["e", x1, z0, x1, z1, 1, 0],
      ["s", x1, z1, x0, z1, 0, 1],
      ["w", x0, z1, x0, z0, -1, 0],
    ];
    for (let i = 0; i < n; i++) {
      const s = sides[r.int(0, 3)];
      if (face && face[s[0]] !== "f") continue;
      const len = Math.hypot(s[3] - s[1], s[4] - s[2]);
      if (len < 6) continue;
      shellHole(
        s[1],
        s[2],
        s[3],
        s[4],
        r.range(0.2, 0.8),
        r.range(yMin, yMax),
        r.range(2.5, 6),
        r.range(2.5, 5),
        s[5],
        s[6],
      );
    }
  }

  // -------------------------------------------------------------------
  // Ruined (jagged) top section: vertical strips with random tops, exposed
  // floor slabs & girders.
  // -------------------------------------------------------------------
  function jaggedTop(x0, z0, x1, z1, y0, y1, fmat, tint, r, o) {
    o = o || {};
    const tile = TILE();
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const bf = M.buf(fmat, cx, cz);
    const sides = [
      [x0, z0, x1, z0, 0, -1],
      [x1, z0, x1, z1, 1, 0],
      [x1, z1, x0, z1, 0, 1],
      [x0, z1, x0, z0, -1, 0],
    ];
    const drop = y1 - y0;
    const strip = 3;
    const tops = [];
    for (const [ax, az, bx, bz, nx, nz] of sides) {
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.max(1, Math.round(len / strip));
      let prevTop = y1 - r() * drop * 0.3;
      for (let i = 0; i < n; i++) {
        const t0 = i / n,
          t1 = (i + 1) / n;
        const top = M.clamp(prevTop + (r() - 0.5) * drop * 0.6, y0 + 1, y1);
        prevTop = top;
        const px = ax + (bx - ax) * t0,
          pz = az + (bz - az) * t0,
          qx = ax + (bx - ax) * t1,
          qz = az + (bz - az) * t1;
        M.wall(
          bf,
          px,
          pz,
          qx,
          qz,
          y0,
          top,
          (len * t0) / tile.w,
          (len * t1) / tile.w,
          (y0 - (o.vBase || 0)) / tile.h,
          (top - (o.vBase || 0)) / tile.h,
          tint,
          M.mulc(tint, 0.8),
        );
        // inner face (so the broken wall has thickness when seen from inside)
        const bi = M.buf("concrete_dark", cx, cz);
        M.wall(
          bi,
          qx - nx * 0.35,
          qz - nz * 0.35,
          px - nx * 0.35,
          pz - nz * 0.35,
          y0,
          top,
          0,
          1,
          0,
          1,
          [0.5, 0.48, 0.45],
        );
        // broken top edge cap
        M.quad(
          bi,
          [px, top, pz],
          [qx, top, qz],
          [qx - nx * 0.35, top, qz - nz * 0.35],
          [px - nx * 0.35, top, pz - nz * 0.35],
          [0, 1, 0],
          [0, 0, 1, 0, 1, 0.1, 0, 0.1],
          [0.55, 0.52, 0.5],
        );
        tops.push(top);
      }
    }
    // exposed floor slabs (some partially collapsed)
    const slabB = M.buf("concrete", cx, cz);
    const floorH = 3.6;
    for (let y = y0 + floorH; y < y1 - 1; y += floorH) {
      if (r() < 0.35) continue;
      const cut = r.range(0.3, 1);
      const sx1 = x0 + (x1 - x0) * cut;
      M.box(slabB, x0 + 0.3, y - 0.25, z0 + 0.3, sx1, y, z1 - 0.3, {
        s: 3,
        c: [0.62, 0.6, 0.57],
      });
      if (cut < 0.95 && r() < 0.5) {
        // slab snapped and hanging down
        M.obox(
          slabB,
          sx1 + 1.5,
          y - 1.2,
          (z0 + z1) / 2,
          3.2,
          0.25,
          (z1 - z0) * 0.8,
          0,
          { roll: -0.7, s: 3, c: [0.55, 0.53, 0.5] },
        );
      }
    }
    // roof deck over the lowest remaining part
    const bd = M.buf("rubble", cx, cz);
    M.box(bd, x0 + 0.3, y0 - 0.2, z0 + 0.3, x1 - 0.3, y0 + 0.4, z1 - 0.3, {
      s: 3,
      c: [0.7, 0.66, 0.6],
      skip: 8,
    });
    // girder columns sticking up at a regular grid, bent at random
    const gb = M.buf("rust", cx, cz, o.girderLayer || "main");
    const gx = Math.max(2, Math.round((x1 - x0) / 6)),
      gz = Math.max(2, Math.round((z1 - z0) / 6));
    for (let i = 0; i <= gx; i++)
      for (let j = 0; j <= gz; j++) {
        if (r() < 0.45) continue;
        const px = x0 + 0.6 + ((x1 - x0 - 1.2) * i) / gx,
          pz = z0 + 0.6 + ((z1 - z0 - 1.2) * j) / gz;
        const h = r.range(2, y1 - y0 + 6);
        const bend = r() < 0.3;
        M.beam(
          gb,
          px,
          y0,
          pz,
          px + (bend ? r.range(-2, 2) : 0),
          y0 + h,
          pz + (bend ? r.range(-2, 2) : 0),
          0.35,
          0.35,
          { c: [0.75, 0.62, 0.52] },
        );
        if (r() < 0.4 && i < gx)
          M.beam(
            gb,
            px,
            y0 + h * 0.7,
            pz,
            x0 + 0.6 + ((x1 - x0 - 1.2) * (i + 1)) / gx,
            y0 + h * 0.6 + r.range(-1, 1),
            pz,
            0.28,
            0.4,
            { c: [0.72, 0.6, 0.5] },
          );
      }
    // girders and snapped slabs dangling over the broken edge (the bombed-city ruin silhouette)
    const nh = r.int(1, 3);
    for (let i = 0; i < nh; i++) {
      const [ax, az, bx, bz, nx, nz] = sides[r.int(0, 3)];
      const t = r.range(0.15, 0.85),
        px = ax + (bx - ax) * t,
        pz = az + (bz - az) * t;
      const yA = y0 + (y1 - y0) * r.range(0.05, 0.35);
      const out = r.range(1.2, 3.2),
        drop = r.range(2, 6);
      if (r() < 0.6)
        M.beam(
          gb,
          px - nx * 1.2,
          yA,
          pz - nz * 1.2,
          px + nx * out,
          yA - drop,
          pz + nz * out,
          0.3,
          0.42,
          { c: [0.7, 0.56, 0.46] },
        );
      else
        M.obox(
          slabB,
          px + nx * out * 0.5,
          yA - drop * 0.45,
          pz + nz * out * 0.5,
          Math.abs(nz) > 0.5 ? r.range(3, 6) : 0.25,
          drop,
          Math.abs(nx) > 0.5 ? r.range(3, 6) : 0.25,
          0,
          { pitch: nz * 0.45, roll: -nx * 0.45, s: 3, c: [0.55, 0.53, 0.5] },
        );
      // rebar whiskers
      for (let k = 0; k < 4; k++)
        M.beam(
          gb,
          px + r.range(-1, 1) * Math.abs(nz),
          yA,
          pz + r.range(-1, 1) * Math.abs(nx),
          px + nx * r.range(0.4, 1.4) + r.range(-0.4, 0.4),
          yA - r.range(0.3, 1.6),
          pz + nz * r.range(0.4, 1.4) + r.range(-0.4, 0.4),
          0.035,
          0.035,
          { c: [0.62, 0.45, 0.36] },
        );
    }
    return tops;
  }
  M.jaggedTop = jaggedTop;

  /** Blown-out floor band: dark void with columns and ragged slab edges. */
  function blownBand(x0, z0, x1, z1, y0, y1) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const inset = 1.6;
    const bd = M.buf("concrete_dark", cx, cz);
    // interior dark box (recessed)
    const dk = [0.12, 0.12, 0.12];
    M.box(bd, x0 + inset, y0, z0 + inset, x1 - inset, y1, z1 - inset, {
      s: 3,
      c: dk,
      skip: 4 + 8,
    });
    // slabs at bottom & top of band protruding
    M.box(bd, x0 - 0.05, y0 - 0.35, z0 - 0.05, x1 + 0.05, y0, z1 + 0.05, {
      s: 3,
      c: [0.55, 0.53, 0.5],
    });
    M.box(bd, x0 - 0.05, y1, z0 - 0.05, x1 + 0.05, y1 + 0.35, z1 + 0.05, {
      s: 3,
      c: [0.55, 0.53, 0.5],
    });
    // columns
    const bc = M.buf("concrete", cx, cz);
    const nX = Math.max(2, Math.round((x1 - x0) / 5)),
      nZ = Math.max(2, Math.round((z1 - z0) / 5));
    for (let i = 0; i <= nX; i++)
      for (const z of [z0 + 0.3, z1 - 0.3]) {
        const x = x0 + 0.3 + ((x1 - x0 - 0.6) * i) / nX;
        M.box(bc, x - 0.3, y0, z - 0.3, x + 0.3, y1, z + 0.3, {
          s: 2,
          c: [0.65, 0.63, 0.6],
          skip: 12,
        });
      }
    for (let j = 1; j < nZ; j++)
      for (const x of [x0 + 0.3, x1 - 0.3]) {
        const z = z0 + 0.3 + ((z1 - z0 - 0.6) * j) / nZ;
        M.box(bc, x - 0.3, y0, z - 0.3, x + 0.3, y1, z + 0.3, {
          s: 2,
          c: [0.65, 0.63, 0.6],
          skip: 12,
        });
      }
    // rebar tangles
    const gb = M.buf("rust", cx, cz, "detail");
    const r = M.rng("blown" + Math.round(x0) + "," + Math.round(z0));
    for (let i = 0; i < 8; i++) {
      const side = r.int(0, 3);
      const t = r();
      const px = side < 2 ? x0 + (x1 - x0) * t : side === 2 ? x0 : x1,
        pz = side >= 2 ? z0 + (z1 - z0) * t : side === 0 ? z0 : z1;
      M.beam(
        gb,
        px,
        y1,
        pz,
        px + r.range(-1.5, 1.5),
        y1 - r.range(0.5, 2.2),
        pz + r.range(-1.5, 1.5),
        0.05,
        0.05,
        { c: [0.7, 0.5, 0.4] },
      );
    }
  }
  M.blownBand = blownBand;

  // -------------------------------------------------------------------
  // Building families
  // -------------------------------------------------------------------
  function heightFor(lot, r) {
    const L = G.LAYOUT;
    const ds = L.DISTRICT_STYLE[lot.district] || { minH: 15, maxH: 40 };
    const cx = (lot.x0 + lot.x1) / 2,
      cz = (lot.z0 + lot.z1) / 2;
    for (const c of M.HEIGHT_CAPS || [])
      if (cx > c.x0 && cx < c.x1 && cz > c.z0 && cz < c.z1)
        return Math.min(c.maxH, 10 + r() * (c.maxH - 10));
    // street-wall infill (thin lots): a proportionate walk-up, never a 6 m-deep slab tower
    if (lot.infill) {
      const mn = Math.min(lot.x1 - lot.x0, lot.z1 - lot.z0);
      return Math.min(ds.minH + r() * 14, 12 + mn * 2.2);
    }
    let t = Math.pow(r(), 1.6);
    if (lot.district === "midtown")
      t = Math.min(
        1,
        t * (0.7 + 0.9 * Math.exp(-Math.hypot(cx - 120, cz + 190) / 260)),
      );
    if (lot.district === "financial_district")
      t = Math.min(
        1,
        t * (0.75 + 0.8 * Math.exp(-Math.hypot(cx - 20, cz - 790) / 220)),
      );
    return ds.minH + (ds.maxH - ds.minH) * t;
  }

  /** Art-deco setback skyscraper. */
  function buildTower(lot, r) {
    const pad = {
      x0: lot.front.w ? 0 : 0.2,
      x1: lot.front.e ? 0 : 0.2,
      z0: lot.front.n ? 0 : 0.2,
      z1: lot.front.s ? 0 : 0.2,
    };
    let x0 = lot.x0 + pad.x0,
      x1 = lot.x1 - pad.x1,
      z0 = lot.z0 + pad.z0,
      z1 = lot.z1 - pad.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const H = Math.max(40, heightFor(lot, r));
    const style = r() < 0.72 ? "artdeco" : "office";
    const fmat =
      "facade/" + style + "/" + chunkVariant(style, cx, cz, r() < 0.5);
    const tint = r.pick(TINTS[style]);
    const trimMat = r() < 0.7 ? "stone_limestone" : "granite";
    const gf = 6;
    const ruined = r() < 0.34,
      leaning = !ruined && H < 110 && r() < 0.06;
    const colliders = [];
    if (leaning) {
      const ang = r.range(0.035, 0.075) * (r() < 0.5 ? 1 : -1);
      const axisZ = r() < 0.5;
      // rotate around the footprint edge at ground level
      const px = axisZ ? (ang > 0 ? x0 : x1) : cx,
        pz = axisZ ? cz : ang > 0 ? z1 : z0;
      const m = new THREE.Matrix4()
        .makeTranslation(px, 0, pz)
        .multiply(
          new THREE.Matrix4().makeRotationFromEuler(
            new THREE.Euler(axisZ ? 0 : ang, 0, axisZ ? ang : 0),
          ),
        )
        .multiply(new THREE.Matrix4().makeTranslation(-px, 0, -pz));
      M.pushXF(m);
    }
    if (ruined) lot.ruined = true;
    // ---- base podium ----
    const baseH = Math.min(H * 0.35, r.range(14, 26));
    storefrontBand(lot, x0, z0, x1, z1, gf, {
      style: "deco",
      r,
      trim: trimMat,
      ruined,
    });
    facadeWalls(x0, z0, x1, z1, gf, baseH, fmat, tint, { vBase: gf });
    belt(x0, z0, x1, z1, gf - 0.4, 0.25, 0.6, trimMat);
    piers(x0, z0, x1, z1, 0, baseH, 1.2, 0.2, trimMat);
    colliders.push([x0, z0, x1, z1, 0, baseH]);
    // ---- tiers ----
    let tx0 = x0,
      tx1 = x1,
      tz0 = z0,
      tz1 = z1,
      y = baseH;
    const nTiers = H > 90 ? r.int(2, 4) : H > 55 ? r.int(1, 3) : 1;
    let remaining = H - baseH;
    const tierTops = [];
    for (let t = 0; t < nTiers; t++) {
      // parapet/setback terrace at this level
      const inset = r.range(1.8, 4.5);
      const nx0 = tx0 + inset,
        nx1 = tx1 - inset,
        nz0 = tz0 + inset,
        nz1 = tz1 - inset;
      if (nx1 - nx0 < 9 || nz1 - nz0 < 9) break;
      roof(tx0, tz0, tx1, tz1, y, { parapet: 1.1, trim: trimMat });
      if (r() < 0.5) roofClutter(tx0, tz0, tx1, tz1, y, nx0, nz0, nx1, nz1, r);
      tx0 = nx0;
      tx1 = nx1;
      tz0 = nz0;
      tz1 = nz1;
      const th = t === nTiers - 1 ? remaining : remaining * r.range(0.45, 0.65);
      const isTop = t === nTiers - 1;
      if (isTop && ruined) {
        const keep = th * r.range(0.3, 0.7);
        facadeWalls(tx0, tz0, tx1, tz1, y, y + keep, fmat, tint, { vBase: gf });
        jaggedTop(tx0, tz0, tx1, tz1, y + keep, y + th, fmat, tint, r, {
          vBase: gf,
        });
        colliders.push([tx0, tz0, tx1, tz1, y, y + th * 0.8]);
        y += th;
        remaining -= th;
        tierTops.push(y);
        break;
      }
      // chamfered-corner shaft (art-deco slab towers) on some upper tiers
      const chamfer =
        style === "artdeco" &&
        t > 0 &&
        isTop &&
        Math.min(tx1 - tx0, tz1 - tz0) > 14 &&
        r() < 0.45;
      if (chamfer) {
        const c = Math.min(tx1 - tx0, tz1 - tz0) * 0.16;
        chamferShaft(tx0, tz0, tx1, tz1, c, y, y + th, fmat, tint, gf, trimMat);
        colliders.push([tx0, tz0, tx1, tz1, y, y + th]);
        y += th;
        remaining -= th;
        tierTops.push(y);
        tx0 += c * 0.5;
        tx1 -= c * 0.5;
        tz0 += c * 0.5;
        tz1 -= c * 0.5; // crown sits on the inscribed square
        continue;
      }
      // blown-out band?
      if (th > 20 && r() < 0.18) {
        const by0 = y + r.range(4, th - 12),
          by1 = by0 + 7;
        facadeWalls(tx0, tz0, tx1, tz1, y, by0, fmat, tint, { vBase: gf });
        blownBand(tx0, tz0, tx1, tz1, by0, by1);
        facadeWalls(tx0, tz0, tx1, tz1, by1 + 0.35, y + th, fmat, tint, {
          vBase: gf,
        });
      } else
        facadeWalls(tx0, tz0, tx1, tz1, y, y + th, fmat, tint, { vBase: gf });
      piers(tx0, tz0, tx1, tz1, y, y + th, 0.9, 0.15, trimMat);
      colliders.push([tx0, tz0, tx1, tz1, y, y + th]);
      y += th;
      remaining -= th;
      tierTops.push(y);
    }
    if (tierTops.length === 0) {
      // no room for setbacks: straight shaft
      const th = H - baseH;
      if (ruined) {
        facadeWalls(x0, z0, x1, z1, baseH, baseH + th * 0.5, fmat, tint, {
          vBase: gf,
        });
        jaggedTop(x0, z0, x1, z1, baseH + th * 0.5, H, fmat, tint, r, {
          vBase: gf,
        });
      } else facadeWalls(x0, z0, x1, z1, baseH, H, fmat, tint, { vBase: gf });
      colliders.push([x0, z0, x1, z1, baseH, H]);
      y = H;
    }
    // ---- crown ----
    if (!ruined) {
      crown(tx0, tz0, tx1, tz1, y, r, trimMat, fmat, tint, H);
      lot.crown = lastCrown;
    }
    if (r() < 0.55)
      randomHoles(
        x0,
        z0,
        x1,
        z1,
        8,
        Math.min(H - 5, 45),
        r.int(1, 3) + (ruined ? 1 : 0),
        r,
      );
    if (leaning) M.popXF();
    for (const c of colliders)
      M.box3(c[0], c[4], c[1], c[2], c[5], c[3], { tag: "building" });
    return { h: y, top: [tx0, tz0, tx1, tz1] };
  }

  /** Octagonal (chamfered-corner) shaft with façade walls, corner piers and a roof slab. */
  function chamferShaft(x0, z0, x1, z1, c, y0, y1, fmat, tint, vBase, trimMat) {
    const pts = [
      [x0 + c, z0],
      [x1 - c, z0],
      [x1, z0 + c],
      [x1, z1 - c],
      [x1 - c, z1],
      [x0 + c, z1],
      [x0, z1 - c],
      [x0, z0 + c],
    ];
    const tile = TILE();
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const bf = M.buf(fmat, cx, cz);
    const lowC = M.mulc(tint, 0.8),
      topC = M.mulc(tint, 0.92);
    let run = 0;
    for (let i = 0; i < 8; i++) {
      const a = pts[i],
        b = pts[(i + 1) % 8];
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      M.wall(
        bf,
        a[0],
        a[1],
        b[0],
        b[1],
        y0,
        y1,
        run / tile.w,
        (run + l) / tile.w,
        (y0 - vBase) / tile.h,
        (y1 - vBase) / tile.h,
        lowC,
        topC,
      );
      run += Math.round(l / M.FACADE.bayW) * M.FACADE.bayW;
      // limestone pier on every corner
      const pb = M.buf(trimMat, cx, cz);
      M.box(pb, a[0] - 0.4, y0, a[1] - 0.4, a[0] + 0.4, y1 + 0.6, a[1] + 0.4, {
        s: 2,
        c: TRIM_C,
        skip: 8,
      });
    }
    M.poly(M.buf("roof_tar", cx, cz), pts, y1, {
      s: 4,
      c: [0.8, 0.78, 0.75],
      convex: true,
    });
    M.polySides(M.buf(trimMat, cx, cz), pts, y1, y1 + 1.0, { s: 2, c: TRIM_C });
  }
  M.chamferShaft = chamferShaft;
  let lastCrown = null; // silhouette info for the far impostor
  /** Tower crowns: ziggurat + spire, pyramid, mast, penthouse + water tank. */
  function crown(x0, z0, x1, z1, y, r, trimMat, fmat, tint, H) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const w = x1 - x0,
      d = z1 - z0;
    const k = r();
    lastCrown = null;
    roof(x0, z0, x1, z1, y, { parapet: 1.2, trim: trimMat });
    if (k < 0.34) {
      // stepped ziggurat with a spire
      let ix0 = x0,
        ix1 = x1,
        iz0 = z0,
        iz1 = z1,
        yy = y;
      const bs = M.buf(trimMat, cx, cz);
      for (let i = 0; i < 3; i++) {
        const s = Math.min(w, d) * 0.12;
        ix0 += s;
        ix1 -= s;
        iz0 += s;
        iz1 -= s;
        if (ix1 - ix0 < 2) break;
        const hh = r.range(2.5, 4.5);
        M.box(bs, ix0, yy, iz0, ix1, yy + hh, iz1, {
          s: 2,
          c: M.mulc(TRIM_C, 0.95 - i * 0.05),
        });
        // vertical deco fins
        const fb = M.buf("chrome", cx, cz, "detail");
        for (const t of [0.25, 0.5, 0.75]) {
          M.box(
            fb,
            ix0 + (ix1 - ix0) * t - 0.1,
            yy,
            iz0 - 0.15,
            ix0 + (ix1 - ix0) * t + 0.1,
            yy + hh + 0.6,
            iz0,
            { s: 1 },
          );
          M.box(
            fb,
            ix0 + (ix1 - ix0) * t - 0.1,
            yy,
            iz1,
            ix0 + (ix1 - ix0) * t + 0.1,
            yy + hh + 0.6,
            iz1 + 0.15,
            { s: 1 },
          );
        }
        yy += hh;
      }
      const sp = M.buf("chrome", cx, cz);
      const sh = Math.min(28, H * r.range(0.1, 0.2));
      lastCrown = {
        kind: "spire",
        x: cx,
        z: cz,
        y: yy,
        h: sh,
        r: 0.9,
        base: [ix0, iz0, ix1, iz1],
        by: y,
      };
      M.cyl(sp, cx, yy, cz, 0.9, 0.05, sh, 8, { c: [0.8, 0.8, 0.78] });
      M.cyl(sp, cx, yy, cz, 1.4, 1.2, 1.2, 8, {
        c: [0.7, 0.7, 0.7],
        capTop: true,
      });
    } else if (k < 0.55) {
      // copper pyramid roof
      const bp = M.buf("metal_painted", cx, cz);
      const ph = Math.min(w, d) * r.range(0.35, 0.6);
      const c = [0.5, 0.78, 0.66];
      lastCrown = {
        kind: "pyramid",
        x: cx,
        z: cz,
        y: y + 1.2,
        h: ph,
        base: [x0, z0, x1, z1],
      };
      M.tri(
        bp,
        [x0, y + 1.2, z0],
        [x1, y + 1.2, z0],
        [cx, y + 1.2 + ph, cz],
        [0, 0.6, -0.8],
        [0, 0, 1, 0, 0.5, 1],
        c,
      );
      M.tri(
        bp,
        [x1, y + 1.2, z0],
        [x1, y + 1.2, z1],
        [cx, y + 1.2 + ph, cz],
        [0.8, 0.6, 0],
        [0, 0, 1, 0, 0.5, 1],
        M.mulc(c, 0.9),
      );
      M.tri(
        bp,
        [x1, y + 1.2, z1],
        [x0, y + 1.2, z1],
        [cx, y + 1.2 + ph, cz],
        [0, 0.6, 0.8],
        [0, 0, 1, 0, 0.5, 1],
        c,
      );
      M.tri(
        bp,
        [x0, y + 1.2, z1],
        [x0, y + 1.2, z0],
        [cx, y + 1.2 + ph, cz],
        [-0.8, 0.6, 0],
        [0, 0, 1, 0, 0.5, 1],
        M.mulc(c, 0.85),
      );
      M.cyl(M.buf("chrome", cx, cz), cx, y + 1.2 + ph, cz, 0.2, 0.05, 6, 6, {
        c: [0.6, 0.6, 0.6],
      });
    } else if (k < 0.75) {
      // mechanical penthouse + antenna mast (radio tower look)
      const bs = M.buf("concrete_dark", cx, cz);
      M.box(
        bs,
        cx - w * 0.3,
        y,
        cz - d * 0.3,
        cx + w * 0.3,
        y + 5,
        cz + d * 0.3,
        { s: 3, c: [0.7, 0.68, 0.65] },
      );
      const bm = M.buf("rust", cx, cz);
      const mh = r.range(12, 30);
      lastCrown = { kind: "mast", x: cx, z: cz, y: y + 5, h: mh, r: 0.8 };
      for (const [sx, sz] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ])
        M.beam(
          bm,
          cx + sx * 1.6,
          y + 5,
          cz + sz * 1.6,
          cx + sx * 0.25,
          y + 5 + mh,
          cz + sz * 0.25,
          0.18,
          0.18,
          { c: [0.8, 0.45, 0.35] },
        );
      for (let hh = 3; hh < mh; hh += 3.5) {
        const s = 1.6 * (1 - hh / mh) + 0.25;
        M.box(
          bm,
          cx - s,
          y + 5 + hh,
          cz - s,
          cx + s,
          y + 5 + hh + 0.15,
          cz + s,
          { s: 1, c: [0.8, 0.45, 0.35] },
        );
      }
      // aircraft warning light (red lamp)
      M.cyl(
        M.buf("neon_red@lampr", cx, cz, "main"),
        cx,
        y + 5 + mh,
        cz,
        0.3,
        0.3,
        0.5,
        6,
        { capTop: true },
      );
    } else {
      // enclosed water tank / penthouse with deco lantern
      const bs = M.buf(fmat, cx, cz);
      const pw = Math.min(w, d) * 0.45;
      facadeWalls(
        cx - pw / 2,
        cz - pw / 2,
        cx + pw / 2,
        cz + pw / 2,
        y,
        y + 8,
        fmat,
        M.mulc(tint, 0.95),
        { vBase: 0 },
      );
      roof(cx - pw / 2, cz - pw / 2, cx + pw / 2, cz + pw / 2, y + 8, {
        parapet: 0.8,
      });
      void bs;
      if (r() < 0.6) M.waterTower(cx, y + 8.8, cz, 0.9, r() < 0.2);
    }
  }

  /** Commercial / office block (midtown south etc.) */
  function buildCommercial(lot, r) {
    let x0 = lot.x0 + (lot.front.w ? 0 : 0.15),
      x1 = lot.x1 - (lot.front.e ? 0 : 0.15),
      z0 = lot.z0 + (lot.front.n ? 0 : 0.15),
      z1 = lot.z1 - (lot.front.s ? 0 : 0.15);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const dist = lot.district;
    let H = heightFor(lot, r);
    if (dist === "midtown" || dist === "financial_district")
      H = Math.min(H, 70);
    if (dist === "greenwich_village") H = Math.min(H * 1.4, 32);
    const style = r() < 0.55 ? "office" : "apartment";
    const fmat =
      "facade/" + style + "/" + chunkVariant(style, cx, cz, r() < 0.5);
    const tint = r.pick(TINTS[style]);
    const gf = 5;
    const face = partyFaces(lot);
    const ruined = r() < 0.27;
    if (ruined) lot.ruined = true;
    storefrontBand(lot, x0, z0, x1, z1, gf, { style: "shop", r, ruined });
    const setback = H > 45 && r() < 0.45;
    const h1 = setback ? H * r.range(0.6, 0.75) : H;
    if (ruined) {
      const keep = h1 * r.range(0.45, 0.8);
      facadeWalls(x0, z0, x1, z1, gf, keep, fmat, tint, { vBase: gf, face });
      jaggedTop(x0, z0, x1, z1, keep, h1, fmat, tint, r, { vBase: gf });
      M.box3(x0, 0, z0, x1, h1 * 0.85, z1, { tag: "building" });
      M.rubblePile(
        cx + r.range(-4, 4),
        lot.front.n ? z0 - 3 : z1 + 3,
        r.range(3, 6),
        r.range(1, 2.2),
        r,
      );
      return { h: h1 };
    }
    if (h1 > 22 && r() < 0.12) {
      const by0 = r.range(10, h1 - 10);
      facadeWalls(x0, z0, x1, z1, gf, by0, fmat, tint, { vBase: gf, face });
      blownBand(x0, z0, x1, z1, by0, by0 + 3.6);
      facadeWalls(x0, z0, x1, z1, by0 + 3.95, h1, fmat, tint, {
        vBase: gf,
        face,
      });
    } else facadeWalls(x0, z0, x1, z1, gf, h1, fmat, tint, { vBase: gf, face });
    belt(x0, z0, x1, z1, gf - 0.3, 0.2, 0.45, "stone_limestone");
    cornice(x0, z0, x1, z1, h1 - 1.2, 0.9, 1.3, "stone_limestone", TRIM_C, {
      brackets: h1 < 40,
      sides: frontSides(lot),
    });
    let topY = h1;
    let tb = [x0, z0, x1, z1];
    if (setback) {
      const s = r.range(3, 5);
      const nx0 = x0 + s,
        nx1 = x1 - s,
        nz0 = z0 + s,
        nz1 = z1 - s;
      if (nx1 - nx0 > 8 && nz1 - nz0 > 8) {
        roof(x0, z0, x1, z1, h1 + 0.1, { parapet: 0.9 });
        facadeWalls(nx0, nz0, nx1, nz1, h1, H, fmat, tint, { vBase: gf });
        cornice(nx0, nz0, nx1, nz1, H - 0.8, 0.6, 0.9);
        M.box3(nx0, h1, nz0, nx1, H, nz1, { tag: "building" });
        topY = H;
        tb = [nx0, nz0, nx1, nz1];
      }
    }
    roof(tb[0], tb[1], tb[2], tb[3], topY + 0.1, { parapet: 0.8 });
    rooftop(tb[0], tb[1], tb[2], tb[3], topY + 0.1, r, {
      tower: topY < 75 ? 0.65 : 0.25,
    });
    if (topY < 55 && r() < 0.45)
      fireEscapesFor(lot, x0, z0, x1, z1, gf + 0.5, h1 - 1.5, 3.6, r);
    if (r() < 0.5)
      randomHoles(
        x0,
        z0,
        x1,
        z1,
        6.5,
        Math.max(10, h1 - 4),
        r.int(1, 2),
        r,
        face,
      );
    M.box3(x0, 0, z0, x1, h1, z1, { tag: "building" });
    return { h: topY };
  }

  /** Old-world apartment house (UWS/UES & scattered). */
  function buildApartment(lot, r) {
    let x0 = lot.x0 + (lot.front.w ? 0 : 0.15),
      x1 = lot.x1 - (lot.front.e ? 0 : 0.15),
      z0 = lot.z0 + (lot.front.n ? 0 : 0.15),
      z1 = lot.z1 - (lot.front.s ? 0 : 0.15);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    let H = heightFor(lot, r);
    if (lot.district === "greenwich_village") H = Math.min(34, H * 1.6);
    if (lot.courtyard) H = Math.max(H, 30);
    const fmat =
      "facade/apartment/" + chunkVariant("apartment", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.apartment);
    const baseH = 7.2;
    const face = partyFaces(lot);
    const ruined = r() < 0.24;
    if (ruined) lot.ruined = true;
    // rusticated limestone base (2 floors)
    const bb = M.buf("stone_limestone", cx, cz);
    const baseC = M.mulc([0.92, 0.9, 0.84], 0.9 + r() * 0.1);
    const frP = frontSides(lot);
    const entK = frP.n ? "n" : frP.s ? "s" : frP.w ? "w" : frP.e ? "e" : null; // entranceCanopy's side (door at its centre)
    for (const [k, ax, az, bx, bz] of [
      ["n", x0, z0, x1, z0],
      ["e", x1, z0, x1, z1],
      ["s", x1, z1, x0, z1],
      ["w", x0, z1, x0, z0],
    ]) {
      if (face[k] === "x") continue;
      const len = Math.hypot(bx - ax, bz - az);
      if (k === entK && len > 7.5) {
        // the base wall opens round the entrance (the lobby behind it: entranceCanopy → lobbyEntrance)
        const ux = (bx - ax) / len,
          uz = (bz - az) / len,
          t0 = len / 2 - DOOR_HW,
          t1 = len / 2 + DOOR_HW;
        const A = [ax + ux * t0, az + uz * t0],
          B = [ax + ux * t1, az + uz * t1];
        M.wall(
          bb,
          ax,
          az,
          A[0],
          A[1],
          0,
          baseH,
          0,
          t0 / 3,
          0,
          baseH / 3,
          M.mulc(baseC, 0.7),
          baseC,
        );
        M.wall(
          bb,
          B[0],
          B[1],
          bx,
          bz,
          0,
          baseH,
          t1 / 3,
          len / 3,
          0,
          baseH / 3,
          M.mulc(baseC, 0.7),
          baseC,
        );
        M.wall(
          bb,
          A[0],
          A[1],
          B[0],
          B[1],
          DOOR_H,
          baseH,
          t0 / 3,
          t1 / 3,
          DOOR_H / 3,
          baseH / 3,
          M.mulc(baseC, 0.8),
          baseC,
        );
      } else
        M.wall(
          bb,
          ax,
          az,
          bx,
          bz,
          0,
          baseH,
          0,
          len / 3,
          0,
          baseH / 3,
          M.mulc(baseC, 0.7),
          baseC,
        );
      M.logWall(ax, az, bx, bz, 0, baseH, face[k], false);
      if (frP[k])
        M.graffitiWalls.push({
          ax,
          az,
          bx,
          bz,
          nx: k === "e" ? 1 : k === "w" ? -1 : 0,
          nz: k === "s" ? 1 : k === "n" ? -1 : 0,
          y0: 0.6,
          y1: 3.2,
        });
    }
    // windows in the base (dark recesses) + entrance on the main front
    baseWindows(lot, x0, z0, x1, z1, 1.2, baseH - 0.6, r);
    entranceCanopy(lot, x0, z0, x1, z1, r);
    belt(x0, z0, x1, z1, baseH, 0.3, 0.5, "stone_limestone");
    if (ruined) {
      const keep = baseH + (H - baseH) * r.range(0.35, 0.7);
      facadeWalls(x0, z0, x1, z1, baseH, keep, fmat, tint, {
        vBase: baseH,
        face,
      });
      jaggedTop(x0, z0, x1, z1, keep, H, fmat, tint, r, { vBase: baseH });
      M.box3(x0, 0, z0, x1, H * 0.8, z1, { tag: "building" });
      M.rubblePile(
        cx + r.range(-5, 5),
        lot.front.n ? z0 - 3.5 : z1 + 3.5,
        r.range(3, 7),
        r.range(1, 2.5),
        r,
      );
      return { h: H };
    }
    facadeWalls(x0, z0, x1, z1, baseH, H, fmat, tint, { vBase: baseH, face });
    // ornamental top: belt two floors below the cornice
    belt(x0, z0, x1, z1, H - 7.5, 0.2, 0.4, "stone_limestone");
    cornice(x0, z0, x1, z1, H - 1.4, 1.2, 1.6, "stone_limestone", TRIM_C, {
      brackets: true,
      sides: frontSides(lot),
    });
    roof(x0, z0, x1, z1, H + 0.2, { parapet: 0.7 });
    rooftop(x0, z0, x1, z1, H + 0.2, r, { tower: 0.8 });
    if (r() < 0.55)
      fireEscapesFor(lot, x0, z0, x1, z1, baseH + 0.5, H - 2, 3.5, r);
    if (r() < 0.42)
      randomHoles(x0, z0, x1, z1, 8.5, H - 4, r.int(1, 2), r, face);
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    return { h: H };
  }

  /** Brownstone / rowhouse with stoop. */
  function buildBrownstone(lot, r) {
    const x0 = lot.x0 + 0.08,
      x1 = lot.x1 - 0.08,
      z0 = lot.z0,
      z1 = lot.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const floors = r.int(3, 5);
    const flH = 3.4,
      pY = 1.5; // parlour floor raised
    const H = pY + floors * flH;
    const faceN = !!lot.faceN;
    const fz = faceN ? z0 : z1; // street facade z
    const nz = faceN ? -1 : 1;
    const setbackZ = faceN ? z0 + 0.0 : z1 - 0.0;
    void setbackZ;
    const brick = r() < 0.55;
    const fmat =
      "facade/brownstone/" + chunkVariant("brownstone", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.brownstone);
    const face = {
      n: faceN ? "f" : "f",
      s: faceN ? "f" : "f",
      e: lot.front.e ? "f" : "b",
      w: lot.front.w ? "f" : "b",
    };
    // basement/areaway band
    const bb = M.buf(brick ? "brick_red" : "stone_limestone", cx, cz);
    const bc = brick ? [0.9, 0.85, 0.8] : [0.78, 0.66, 0.56];
    M.box(bb, x0, 0, z0, x1, pY, z1, { s: 2.5, c: bc, skip: 8 + 4 });
    facadeWalls(x0, z0, x1, z1, pY, H, fmat, tint, {
      vBase: pY,
      face,
      blank: "brick_red",
    });
    // cornice with brackets on the street side only
    const sides = { n: faceN, s: !faceN, e: false, w: false };
    const cb = M.buf("metal_painted", cx, cz);
    const ccol = r.pick([
      [0.35, 0.3, 0.27],
      [0.5, 0.45, 0.38],
      [0.25, 0.27, 0.26],
      [0.6, 0.55, 0.48],
    ]);
    M.box(
      cb,
      x0 - 0.02,
      H - 0.9,
      fz - (faceN ? 0.7 : -0.0),
      x1 + 0.02,
      H - 0.2,
      fz + (faceN ? 0 : 0.7),
      { s: 1.5, c: ccol },
    );
    const bd = M.buf("metal_painted", cx, cz, "detail");
    for (let t = 0.12; t < 0.95; t += 0.25) {
      const px = x0 + (x1 - x0) * t;
      M.box(
        bd,
        px - 0.1,
        H - 1.5,
        fz + (faceN ? -0.55 : 0),
        px + 0.1,
        H - 0.9,
        fz + (faceN ? 0 : 0.55),
        { s: 1, c: M.mulc(ccol, 0.8) },
      );
    }
    void sides;
    roof(x0, z0, x1, z1, H, {
      parapet: 0.5,
      trim: "brick_red",
      trimC: [0.75, 0.6, 0.5],
    });
    // chimneys
    const ch = M.buf("brick_red", cx, cz, "detail");
    for (let i = 0; i < r.int(1, 2); i++) {
      const px = x0 + 0.6 + r() * (x1 - x0 - 1.8),
        pz = z0 + 1 + r() * (z1 - z0 - 3);
      M.box(ch, px, H, pz, px + 0.7, H + r.range(1.2, 2.2), pz + 1.1, {
        s: 2,
        c: [0.8, 0.7, 0.62],
      });
    }
    // stoop: stairs from sidewalk up to the parlour door on one side of the facade
    const doorLeft = r() < 0.5;
    const sw = 1.7;
    const sx0 = doorLeft ? x0 + 0.35 : x1 - 0.35 - sw,
      sx1 = sx0 + sw;
    const steps = 7,
      runD = 2.8;
    const sb = M.buf("stone_limestone", cx, cz);
    const stoopC = brick ? [0.75, 0.72, 0.68] : [0.62, 0.5, 0.42];
    // step i=0 is at the STREET end (lowest); the top step meets the parlour door at the facade
    for (let i = 0; i < steps; i++) {
      const y1 = (pY * (i + 1)) / steps;
      const d0 = (runD * i) / steps;
      if (faceN)
        M.box(
          sb,
          sx0,
          0,
          fz - runD + d0,
          sx1,
          y1,
          fz - runD + d0 + runD / steps + 0.02,
          { s: 1, c: stoopC },
        );
      else
        M.box(
          sb,
          sx0,
          0,
          fz + runD - d0 - runD / steps - 0.02,
          sx1,
          y1,
          fz + runD - d0,
          { s: 1, c: stoopC },
        );
    }
    // stoop landing & cheek walls
    if (faceN) {
      M.box(sb, sx0 - 0.25, 0, fz - runD, sx0, pY + 0.2, fz, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
      M.box(sb, sx1, 0, fz - runD, sx1 + 0.25, pY + 0.2, fz, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
    } else {
      M.box(sb, sx0 - 0.25, 0, fz, sx0, pY + 0.2, fz + runD, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
      M.box(sb, sx1, 0, fz, sx1 + 0.25, pY + 0.2, fz + runD, {
        s: 1,
        c: M.mulc(stoopC, 0.9),
      });
    }
    // iron handrails
    const hb = M.buf("metal_painted", cx, cz, "detail");
    for (const sx of [sx0 - 0.12, sx1 + 0.12])
      M.beam(hb, sx, pY + 1.1, fz, sx, 1.0, fz + nz * runD, 0.05, 0.05, {
        c: [0.2, 0.2, 0.2],
      });
    // door (dark recess with frame)
    const dx0 = sx0 + 0.25,
      dx1 = sx1 - 0.25;
    const db = M.buf("wood_planks", cx, cz);
    const dz0 = faceN ? fz - 0.07 : fz + 0.01,
      dz1 = faceN ? fz - 0.01 : fz + 0.07;
    M.box(db, dx0, pY, dz0, dx1, pY + 2.6, dz1, {
      s: 1.5,
      c: r() < 0.5 ? [0.4, 0.28, 0.2] : [0.25, 0.25, 0.3],
    });
    M.box(
      M.buf("stone_limestone", cx, cz),
      dx0 - 0.2,
      pY + 2.6,
      faceN ? fz - 0.25 : fz,
      dx1 + 0.2,
      pY + 3.0,
      faceN ? fz : fz + 0.25,
      { s: 1, c: TRIM_C },
    );
    // areaway fence in front of the basement
    const fb = M.buf("metal_painted", cx, cz, "detail");
    const ax0 = doorLeft ? sx1 + 0.3 : x0 + 0.2,
      ax1 = doorLeft ? x1 - 0.2 : sx0 - 0.3;
    if (ax1 - ax0 > 1) {
      const fzz = fz + nz * 1.4;
      M.beam(fb, ax0, 1.0, fzz, ax1, 1.0, fzz, 0.04, 0.04, {
        c: [0.2, 0.2, 0.2],
      });
      for (let px = ax0; px <= ax1; px += 0.3)
        M.vbar(fb, px, fzz, 0, 1.12, 0.03, 0, nz, [0.2, 0.2, 0.2], true);
      M.ocol((ax0 + ax1) / 2, fzz, ax1 - ax0, 0.1, 0, 1.1, 0, { tag: "fence" });
      // garbage cans / debris in the areaway
      if (r() < 0.5)
        M.cyl(
          M.buf("metal_panel", cx, cz, "detail"),
          ax0 + 0.5,
          0,
          fz + nz * 0.6,
          0.3,
          0.28,
          0.8,
          8,
          { c: [0.5, 0.5, 0.45], capTop: true },
        );
    }
    // stoop collider (walkable steps as boxes)
    for (let i = 0; i < steps; i++) {
      const y1 = (pY * (i + 1)) / steps; // lowest at the street, rising to the door
      const d0 = (runD * i) / steps,
        d1 = d0 + runD / steps;
      const zA = faceN ? fz - runD + d0 : fz + runD - d1,
        zB = faceN ? fz - runD + d1 : fz + runD - d0;
      M.box3(sx0, 0, zA, sx1, y1, zB, { tag: "stairs", surface: "concrete" });
    }
    if (r() < 0.12)
      fireEscapesFor(lot, x0, z0, x1, z1, pY + flH, H - 1, flH, r, true);
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    // occasional collapsed rowhouse
    return { h: H };
  }

  /** Walk-up tenement: storefront + 5-6 floors + fire escape. */
  function buildTenement(lot, r) {
    const x0 = lot.x0 + 0.1,
      x1 = lot.x1 - 0.1,
      z0 = lot.z0 + (lot.front.n || lot.faceN ? 0 : 0.1),
      z1 = lot.z1 - (lot.front.s || lot.faceS ? 0 : 0.1);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const floors = r.int(4, 6);
    const gf = 4.5,
      flH = 3.3;
    const H = gf + floors * flH;
    const fmat =
      "facade/apartment/" + chunkVariant("apartment", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.apartment);
    const face = partyFaces(lot);
    storefrontBand(lot, x0, z0, x1, z1, gf, {
      style: "shop",
      r,
      faceN: lot.faceN,
      faceS: lot.faceS,
    });
    facadeWalls(x0, z0, x1, z1, gf, H, fmat, tint, {
      vBase: gf,
      face,
      blank: "brick_red",
    });
    cornice(
      x0,
      z0,
      x1,
      z1,
      H - 0.9,
      0.7,
      0.9,
      "metal_painted",
      [0.45, 0.42, 0.38],
      { brackets: true, sides: frontSides(lot) },
    );
    roof(x0, z0, x1, z1, H, {
      parapet: 0.6,
      trim: "brick_red",
      trimC: [0.75, 0.6, 0.5],
    });
    rooftop(x0, z0, x1, z1, H, r, { tower: 0.35 });
    if (r() < 0.85)
      fireEscapesFor(lot, x0, z0, x1, z1, gf + 0.6, H - 1.2, flH, r, true);
    if (r() < 0.4) randomHoles(x0, z0, x1, z1, 6, H - 3, 1, r, face);
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    return { h: H };
  }

  /** Brooklyn warehouse: brick hulk, loading docks, sawtooth roofs, chimneys. */
  function buildWarehouse(lot, r) {
    const x0 = lot.x0,
      x1 = lot.x1,
      z0 = lot.z0,
      z1 = lot.z1;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const H = heightFor(lot, r);
    const fmat =
      "facade/warehouse/" + chunkVariant("warehouse", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.warehouse);
    const ruined = r() < 0.27;
    if (ruined) lot.ruined = true;
    const baseB = M.buf("concrete", cx, cz);
    M.box(baseB, x0 - 0.1, 0, z0 - 0.1, x1 + 0.1, 1.2, z1 + 0.1, {
      s: 3,
      c: [0.7, 0.68, 0.64],
      skip: 8 + 4,
    });
    if (ruined) {
      const keep = H * r.range(0.35, 0.7);
      facadeWalls(x0, z0, x1, z1, 1.2, keep, fmat, tint, { vBase: 1.2 });
      jaggedTop(x0, z0, x1, z1, keep, H, fmat, tint, r, { vBase: 1.2 });
      M.box3(x0, 0, z0, x1, H * 0.8, z1, { tag: "building" });
      M.rubblePile(cx, z1 + 3, r.range(4, 8), r.range(1.5, 3), r);
      return { h: H };
    }
    facadeWalls(x0, z0, x1, z1, 1.2, H, fmat, tint, { vBase: 1.2 });
    belt(x0, z0, x1, z1, H - 0.8, 0.15, 0.8, "brick_red", [0.7, 0.55, 0.45]);
    for (const [ax, az, bx, bz, nx, nz] of [
      [x0, z0, x1, z0, 0, -1],
      [x1, z0, x1, z1, 1, 0],
      [x1, z1, x0, z1, 0, 1],
      [x0, z1, x0, z0, -1, 0],
    ])
      M.graffitiWalls.push({ ax, az, bx, bz, nx, nz, y0: 1.4, y1: 4.5 });
    // loading dock on the longer street side with roll-up doors
    const side =
      x1 - x0 > z1 - z0 ? (r() < 0.5 ? "n" : "s") : r() < 0.5 ? "w" : "e";
    loadingDock(x0, z0, x1, z1, side, r);
    // roof: sawtooth or flat with water tower
    if (r() < 0.45 && x1 - x0 > 20) {
      const bs = M.buf("corrugated", cx, cz),
        bg = M.buf("glass_dirty", cx, cz);
      const teeth = Math.floor((x1 - x0) / 6);
      for (let i = 0; i < teeth; i++) {
        const tx0 = x0 + (i * (x1 - x0)) / teeth,
          tx1 = tx0 + (x1 - x0) / teeth;
        M.quad(
          bs,
          [tx0, H, z0 + 0.3],
          [tx0, H, z1 - 0.3],
          [tx1, H + 3, z1 - 0.3],
          [tx1, H + 3, z0 + 0.3],
          [-0.7, 0.7, 0],
          [0, 0, 6, 0, 6, 2, 0, 2],
          [0.75, 0.7, 0.62],
        );
        M.quad(
          bg,
          [tx1, H, z1 - 0.3],
          [tx1, H, z0 + 0.3],
          [tx1, H + 3, z0 + 0.3],
          [tx1, H + 3, z1 - 0.3],
          [1, 0, 0],
          [0, 0, 6, 0, 6, 1, 0, 1],
          [0.5, 0.55, 0.5],
        );
        M.tri(
          bs,
          [tx0, H, z0 + 0.3],
          [tx1, H + 3, z0 + 0.3],
          [tx1, H, z0 + 0.3],
          [0, 0, -1],
          [0, 0, 1, 1, 1, 0],
          [0.7, 0.65, 0.6],
        );
        M.tri(
          bs,
          [tx0, H, z1 - 0.3],
          [tx1, H, z1 - 0.3],
          [tx1, H + 3, z1 - 0.3],
          [0, 0, 1],
          [0, 0, 1, 0, 1, 1],
          [0.7, 0.65, 0.6],
        );
      }
      roof(x0, z0, x1, z1, H, { parapet: false });
    } else {
      roof(x0, z0, x1, z1, H, {
        parapet: 0.9,
        trim: "brick_red",
        trimC: [0.7, 0.55, 0.45],
      });
      rooftop(x0, z0, x1, z1, H, r, { tower: 0.5 });
    }
    // brick smokestack
    if (r() < 0.25) {
      const sx = x0 + 3 + r() * (x1 - x0 - 6),
        sz = z0 + 3 + r() * (z1 - z0 - 6);
      M.cyl(
        M.buf("brick_red", sx, sz),
        sx,
        H,
        sz,
        1.6,
        1.1,
        r.range(14, 26),
        12,
        { c: [0.85, 0.72, 0.62], s: 2.5 },
      );
    }
    M.box3(x0, 0, z0, x1, H, z1, { tag: "building" });
    return { h: H };
  }

  /** Collapsed lot: rubble mound with jagged wall stubs. */
  function buildCollapsed(lot, r) {
    const x0 = lot.x0 + 0.2,
      x1 = lot.x1 - 0.2,
      z0 = lot.z0 + 0.2,
      z1 = lot.z1 - 0.2;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const style =
      lot.district === "brooklyn"
        ? "warehouse"
        : r() < 0.5
          ? "apartment"
          : "office";
    const fmat = "facade/" + style + "/" + chunkVariant(style, cx, cz, false);
    const tint = M.mulc(r.pick(TINTS[style]), 0.85);
    const h = r.range(5, 16);
    jaggedTop(x0, z0, x1, z1, 0.2, h, fmat, tint, r, {});
    const mound = Math.min(x1 - x0, z1 - z0) * 0.45;
    M.rubblePile(cx, cz, mound, r.range(2, 4.5), r);
    M.box3(x0 + 1, 0, z0 + 1, x1 - 1, 1.2, z1 - 1, {
      tag: "rubble",
      surface: "rubble",
    });
    return { h };
  }

  // -------------------------------------------------------------------
  // Ground floor bands: storefronts, base windows, entrance canopies
  // -------------------------------------------------------------------
  function frontSides(lot) {
    return {
      n: lot.front.n || !!lot.faceN,
      s: lot.front.s || !!lot.faceS,
      e: lot.front.e,
      w: lot.front.w,
    };
  }
  function partyFaces(lot) {
    const f = frontSides(lot);
    // interior lot sides → blank brick party walls; rear (opposite a front) keeps windows
    const face = { n: "f", e: "f", s: "f", w: "f" };
    if (!f.e && !f.w) {
      face.e = "b";
      face.w = "b";
    } else if (!f.e) face.e = "b";
    else if (!f.w) face.w = "b";
    return face;
  }
  M.storefronts = [];
  M.graffitiWalls = [];
  /**
   * Storefront band along the street-facing sides (y 0..gf): pilasters,
   * bulkheads, recessed display glass, sign band with shop sign, awnings,
   * boarded / shuttered bays. Non-street sides get plain wall.
   */
  function storefrontBand(lot, x0, z0, x1, z1, gf, o) {
    const r = o.r;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const fr = frontSides(lot);
    const sides = [
      ["n", x0, z0, x1, z0, 0, -1],
      ["e", x1, z0, x1, z1, 1, 0],
      ["s", x1, z1, x0, z1, 0, 1],
      ["w", x0, z1, x0, z0, -1, 0],
    ];
    const deco = o.style === "deco";
    const pilMat = deco
      ? o.trim || "granite"
      : r() < 0.5
        ? "stone_limestone"
        : "brick_red";
    const pilC = deco ? [0.75, 0.72, 0.68] : [0.9, 0.86, 0.8];
    for (const [k, ax, az, bx, bz, nx, nz] of sides) {
      const len = Math.hypot(bx - ax, bz - az);
      const ux = (bx - ax) / (len || 1),
        uz = (bz - az) / (len || 1);
      if (!fr[k] || len < 4) {
        // plain ground-floor wall
        const b = M.buf(pilMat, cx, cz);
        M.wall(
          b,
          ax,
          az,
          bx,
          bz,
          0,
          gf,
          0,
          len / 3,
          0,
          gf / 3,
          M.mulc(pilC, 0.65),
          pilC,
        );
        continue;
      }
      const b = M.buf(pilMat, cx, cz);
      const bays = Math.max(1, Math.round(len / (deco ? 6 : 4.8)));
      const bw = len / bays;
      for (let i = 0; i < bays; i++) {
        const t0 = i * bw,
          t1 = (i + 1) * bw;
        const P = (t, off) => [ax + ux * t + nx * off, az + uz * t + nz * off];
        // pilaster at bay start (and final)
        const pw = 0.45;
        const pa = P(t0, 0),
          pb = P(t0 + pw, 0);
        M.wall(
          b,
          pa[0],
          pa[1],
          pb[0],
          pb[1],
          0,
          gf,
          0,
          0.2,
          0,
          gf / 3,
          M.mulc(pilC, 0.6),
          pilC,
        );
        const pc = P(t0, 0.12),
          pd = P(t0 + pw, 0.12);
        M.box(
          b,
          Math.min(pa[0], pb[0], pc[0], pd[0]),
          0,
          Math.min(pa[1], pb[1], pc[1], pd[1]),
          Math.max(pa[0], pb[0], pc[0], pd[0]),
          gf,
          Math.max(pa[1], pb[1], pc[1], pd[1]),
          { s: 2, c: pilC, skip: 8 },
        );
        if (i === bays - 1) {
          const pe = P(t1 - pw, 0),
            pf = P(t1, 0);
          M.wall(
            b,
            pe[0],
            pe[1],
            pf[0],
            pf[1],
            0,
            gf,
            0,
            0.2,
            0,
            gf / 3,
            M.mulc(pilC, 0.6),
            pilC,
          );
        }
        // sign band
        const sa = P(t0 + pw, 0),
          sb = P(t1 - (i === bays - 1 ? pw : 0), 0);
        M.wall(
          b,
          sa[0],
          sa[1],
          sb[0],
          sb[1],
          gf - 1.3,
          gf,
          0,
          (bw - pw) / 3,
          (gf - 1.3) / 3,
          gf / 3,
          M.mulc(pilC, 0.85),
          pilC,
        );
        const bayL = t0 + pw + 0.05,
          bayR = t1 - 0.05 - (i === bays - 1 ? pw : 0);
        const roll = r();
        const kind = o.ruined
          ? roll < 0.25
            ? "boarded"
            : roll < 0.38
              ? "shutter"
              : roll < 0.75
                ? "open"
                : "glass"
          : roll < 0.24
            ? "boarded"
            : roll < 0.42
              ? "shutter"
              : roll < 0.54
                ? "open"
                : "glass";
        const depthAvail = (k === "n" || k === "s" ? z1 - z0 : x1 - x0) - 1.2;
        bay(
          b,
          P,
          bayL,
          bayR,
          gf - 1.3,
          nx,
          nz,
          kind,
          r,
          cx,
          cz,
          deco,
          depthAvail,
        );
        // shop sign on the band (atlas)
        if (!deco && r() < 0.75)
          shopSign(
            P,
            bayL + 0.1,
            bayR - 0.1,
            gf - 1.2,
            gf - 0.15,
            nx,
            nz,
            r,
            cx,
            cz,
          );
        // awning
        if (!deco && r() < 0.42)
          awning(P, bayL, bayR, gf - 1.35, nx, nz, r, cx, cz);
      }
      // deco: marquee canopy over the main entrance at the middle of the longest front
      if (deco && (k === "n" || k === "s" || len > 20)) {
        const mid = len / 2;
        const P = (t, off) => [ax + ux * t + nx * off, az + uz * t + nz * off];
        const ca = P(mid - 3, 0),
          cb2 = P(mid + 3, 0),
          cc = P(mid + 3, 2.6),
          cd = P(mid - 3, 2.6);
        const mb = M.buf("chrome", cx, cz, "detail");
        const y0 = gf - 1.6;
        M.quad(
          mb,
          [ca[0], y0 + 0.5, ca[1]],
          [cb2[0], y0 + 0.5, cb2[1]],
          [cc[0], y0 + 0.5, cc[1]],
          [cd[0], y0 + 0.5, cd[1]],
          [0, 1, 0],
          [0, 0, 3, 0, 3, 1, 0, 1],
          [0.7, 0.7, 0.68],
        );
        M.quad(
          mb,
          [cd[0], y0, cd[1]],
          [cc[0], y0, cc[1]],
          [cc[0], y0 + 0.5, cc[1]],
          [cd[0], y0 + 0.5, cd[1]],
          [nx, 0, nz],
          [0, 0, 3, 0, 3, 0.3, 0, 0.3],
          [0.6, 0.55, 0.45],
        );
        M.quad(
          mb,
          [cb2[0], y0, cb2[1]],
          [ca[0], y0, ca[1]],
          [cd[0], y0, cd[1]],
          [cc[0], y0, cc[1]],
          [0, -1, 0],
          [0, 0, 3, 0, 3, 1, 0, 1],
          [0.4, 0.4, 0.38],
        );
      }
      M.storefronts.push({ ax, az, bx, bz, nx, nz, gf, lot });
      // steel cellar hatch set into the sidewalk in front of the shop (very New York)
      if (!deco && r() < 0.4 && len > 5) {
        const t = r.range(1.5, len - 2.5),
          hx = ax + ux * t + nx * 1.0,
          hz = az + uz * t + nz * 1.0;
        const hb = M.buf("metal_painted", hx, hz, "fine");
        const hc = r.pick([
          [0.45, 0.42, 0.38],
          [0.35, 0.33, 0.3],
          [0.5, 0.36, 0.28],
        ]);
        M.obox(hb, hx, SY + 0.012, hz, 1.6, 0.03, 1.1, Math.atan2(ux, uz), {
          skip: 8,
          s: 0.6,
          c: hc,
        });
        M.obox(hb, hx, SY + 0.03, hz, 0.06, 0.02, 1.1, Math.atan2(ux, uz), {
          skip: 8,
          c: M.mulc(hc, 0.6),
        });
      }
    }
  }
  function bay(b, P, tL, tR, topY, nx, nz, kind, r, cx, cz, deco, depthAvail) {
    const rec = 0.3;
    const A = P(tL, 0),
      B = P(tR, 0),
      Ai = P(tL, -rec),
      Bi = P(tR, -rec);
    // reveals (jambs)
    const bj = M.buf(deco ? "granite" : "concrete_dark", cx, cz);
    const jc = [0.5, 0.48, 0.45];
    const ul = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1,
      jux = (B[0] - A[0]) / ul,
      juz = (B[1] - A[1]) / ul;
    M.quad(
      bj,
      [A[0], 0, A[1]],
      [Ai[0], 0, Ai[1]],
      [Ai[0], topY, Ai[1]],
      [A[0], topY, A[1]],
      [jux, 0, juz],
      [0, 0, 0.1, 0, 0.1, 1, 0, 1],
      jc,
    );
    M.quad(
      bj,
      [Bi[0], 0, Bi[1]],
      [B[0], 0, B[1]],
      [B[0], topY, B[1]],
      [Bi[0], topY, Bi[1]],
      [-jux, 0, -juz],
      [0, 0, 0.1, 0, 0.1, 1, 0, 1],
      jc,
    );
    M.quad(
      bj,
      [Ai[0], topY, Ai[1]],
      [Bi[0], topY, Bi[1]],
      [B[0], topY, B[1]],
      [A[0], topY, A[1]],
      [0, -1, 0],
      [0, 0, 1, 0, 1, 0.1, 0, 0.1],
      jc,
    );
    const bulk = 0.65;
    if (kind === "open") {
      // gaping hole: a dim, looted shop interior behind it (not a black void)
      M.shopInterior(
        P,
        tL,
        tR,
        topY,
        nx,
        nz,
        r,
        cx,
        cz,
        Math.min(3.4, Math.max(1.6, depthAvail || 3)),
        "open",
      );
      return;
    }
    // bulkhead
    const bk = M.buf(deco ? "granite" : "metal_painted", cx, cz);
    M.quad(
      bk,
      [Ai[0], 0, Ai[1]],
      [Bi[0], 0, Bi[1]],
      [Bi[0], bulk, Bi[1]],
      [Ai[0], bulk, Ai[1]],
      [nx, 0, nz],
      [0, 0, (tR - tL) / 2, 0, (tR - tL) / 2, 0.3, 0, 0.3],
      deco
        ? [0.6, 0.58, 0.55]
        : r.pick([
            [0.35, 0.4, 0.38],
            [0.45, 0.3, 0.25],
            [0.3, 0.3, 0.35],
          ]),
    );
    if (kind === "boarded") {
      const bw = M.buf("wood_planks", cx, cz);
      M.quad(
        bw,
        [Ai[0] + nx * 0.2, bulk, Ai[1] + nz * 0.2],
        [Bi[0] + nx * 0.2, bulk, Bi[1] + nz * 0.2],
        [Bi[0] + nx * 0.2, topY, Bi[1] + nz * 0.2],
        [Ai[0] + nx * 0.2, topY, Ai[1] + nz * 0.2],
        [nx, 0, nz],
        [0, 0, (tR - tL) / 1.2, 0, (tR - tL) / 1.2, topY / 1.2, 0, topY / 1.2],
        [0.75, 0.68, 0.55],
      );
      // cross battens
      const bd = M.buf("wood_planks", cx, cz, "detail");
      M.beam(
        bd,
        Ai[0] + nx * 0.25,
        bulk + 0.3,
        Ai[1] + nz * 0.25,
        Bi[0] + nx * 0.25,
        topY - 0.4,
        Bi[1] + nz * 0.25,
        0.18,
        0.04,
        { c: [0.6, 0.52, 0.4] },
      );
    } else if (kind === "shutter") {
      const bs = M.buf("corrugated", cx, cz);
      const down = topY * r.range(0.35, 1);
      M.quad(
        bs,
        [Ai[0] + nx * 0.05, topY - down, Ai[1] + nz * 0.05],
        [Bi[0] + nx * 0.05, topY - down, Bi[1] + nz * 0.05],
        [Bi[0] + nx * 0.05, topY, Bi[1] + nz * 0.05],
        [Ai[0] + nx * 0.05, topY, Ai[1] + nz * 0.05],
        [nx, 0, nz],
        [0, 0, (tR - tL) / 2, 0, (tR - tL) / 2, down / 2, 0, down / 2],
        [0.7, 0.66, 0.6],
      );
      const gl = M.buf("glass_dirty", cx, cz);
      if (topY - down > bulk)
        M.quad(
          gl,
          [Ai[0], bulk, Ai[1]],
          [Bi[0], bulk, Bi[1]],
          [Bi[0], topY - down, Bi[1]],
          [Ai[0], topY - down, Ai[1]],
          [nx, 0, nz],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.15, 0.15, 0.15],
        );
    } else {
      const broken = r() < 0.62;
      // display window: the shop behind is visible — through dirty glass, or through the shattered pane
      M.shopInterior(
        P,
        tL,
        tR,
        topY,
        nx,
        nz,
        r,
        cx,
        cz,
        Math.min(3.4, Math.max(1.6, depthAvail || 3)),
        broken ? "broken" : "glass",
      );
      const gl = M.buf(
        broken ? "glass_dirty" : "glass_dirty@window",
        cx,
        cz,
        broken ? "detail" : "main",
      );
      if (broken) {
        // only jagged shards left in the frame
        const Pg = (t, y) => {
          const q = P(t, -rec + 0.02);
          return [q[0], y, q[1]];
        };
        for (let k = 0; k < 3; k++) {
          const t = tL + r() * (tR - tL - 0.5);
          M.tri(
            gl,
            Pg(t, bulk),
            Pg(t + 0.5, bulk),
            Pg(t + 0.2, bulk + r.range(0.3, 1.2)),
            [nx, 0, nz],
            [0, 0, 1, 0, 0.5, 1],
            [0.5, 0.55, 0.5],
          );
        }
        for (let k = 0; k < 2; k++) {
          const t = tL + r() * (tR - tL - 0.6);
          M.tri(
            gl,
            Pg(t, topY),
            Pg(t + 0.6, topY),
            Pg(t + 0.3, topY - r.range(0.3, 1)),
            [nx, 0, nz],
            [0, 0, 1, 0, 0.5, 1],
            [0.5, 0.55, 0.5],
          );
        }
      } else
        M.quad(
          gl,
          [Ai[0], bulk, Ai[1]],
          [Bi[0], bulk, Bi[1]],
          [Bi[0], topY, Bi[1]],
          [Ai[0], topY, Ai[1]],
          [nx, 0, nz],
          [
            0,
            0,
            (tR - tL) / 3,
            0,
            (tR - tL) / 3,
            (topY - bulk) / 3,
            0,
            (topY - bulk) / 3,
          ],
          [0.62, 0.66, 0.6],
        );
      // mullions
      const mb = M.buf("metal_painted", cx, cz, "detail");
      const tm = (tL + tR) / 2;
      const Mi = P(tm, -rec + 0.03);
      M.box(
        mb,
        Mi[0] - 0.04,
        bulk,
        Mi[1] - 0.04,
        Mi[0] + 0.04,
        topY,
        Mi[1] + 0.04,
        { s: 1, c: [0.25, 0.25, 0.25] },
      );
      const T0 = P(tL, -rec + 0.03),
        T1 = P(tR, -rec + 0.03);
      M.beam(
        mb,
        T0[0],
        topY - 0.9,
        T0[1],
        T1[0],
        topY - 0.9,
        T1[1],
        0.06,
        0.06,
        { c: [0.25, 0.25, 0.25] },
      );
    }
  }
  /**
   * 3-D stone sills & lintel hoods under/over the atlas windows of apartment & brownstone façades
   * (street fronts, the three lowest storeys of the window grid) — real relief at grazing angles.
   */
  function windowTrim(ax, az, bx, bz, y0, y1, vBase, uo, style) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 4) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      nx = uz,
      nz = -ux; // outward normal (M.wall convention)
    const F = M.FACADE,
      tile = TILE();
    const fh = F.floorH,
      bays = F.bays;
    const winW = F.bayW * (style === "brownstone" ? 0.5 : 0.46);
    const sillY = fh * 0.22,
      lintY = fh * 0.8;
    const cxm = (ax + bx) / 2,
      czm = (az + bz) / 2;
    const b = M.buf("stone_limestone", cxm, czm, "detail");
    const yaw = Math.atan2(ux, uz);
    const c = M.mulc(TRIM_C, 0.82);
    let k0 = Math.ceil((y0 - vBase) / fh - 1e-6),
      n = 0;
    for (let k = k0; n < 2; k++, n++) {
      const yb = vBase + k * fh;
      if (yb + lintY + 0.3 > y1) break;
      for (let j = -bays; j < bays * 40; j++) {
        const t = ((j + 0.5) / bays - uo) * tile.w;
        if (t < winW / 2 + 0.3) continue;
        if (t > len - winW / 2 - 0.3) break;
        const px = ax + ux * t + nx * 0.07,
          pz = az + uz * t + nz * 0.07;
        M.obox(b, px, yb + sillY - 0.05, pz, 0.14, 0.1, winW + 0.32, yaw, {
          s: 1,
          c,
          skip: 2 + 16 + 32,
        });
        if (n === 0)
          M.obox(
            b,
            px + nx * 0.02,
            yb + lintY + 0.09,
            pz + nz * 0.02,
            0.16,
            0.16,
            winW + 0.4,
            yaw,
            { s: 1, c: M.mulc(c, 1.05), skip: 2 + 16 + 32 },
          );
      }
    }
  }
  function shopSign(P, tL, tR, y0, y1, nx, nz, r, cx, cz) {
    const a = P(tL, 0.04),
      b = P(tR, 0.04);
    const i = r.int(0, M.SHOP_SIGN_COUNT - 1);
    const uv = M.cellUV(i, 2, 16);
    const bs = M.buf("my/shopsigns", cx, cz, "detail");
    // wall traversal a→b runs right-to-left as seen from outside → u runs b→a
    M.quad(
      bs,
      [a[0], y0, a[1]],
      [b[0], y0, b[1]],
      [b[0], y1, b[1]],
      [a[0], y1, a[1]],
      [nx, 0, nz],
      [uv[2], uv[1], uv[0], uv[1], uv[0], uv[3], uv[2], uv[3]],
      M.mulc([1, 1, 1], r.range(0.7, 1)),
    );
  }
  function awning(P, tL, tR, y, nx, nz, r, cx, cz) {
    const depth = r.range(1.3, 1.9),
      drop = 0.7;
    const torn = r() < 0.35;
    const cols = [
      [0.55, 0.18, 0.15],
      [0.2, 0.35, 0.25],
      [0.2, 0.25, 0.4],
      [0.6, 0.5, 0.25],
      [0.35, 0.3, 0.28],
    ];
    const c1 = r.pick(cols),
      c2 = r() < 0.5 ? [0.8, 0.76, 0.66] : c1;
    const b = M.buf("fabric@ds", cx, cz, "detail");
    const n = Math.max(2, Math.round((tR - tL) / 0.6));
    for (let i = 0; i < n; i++) {
      if (torn && r() < 0.3) continue;
      const t0 = tL + ((tR - tL) * i) / n,
        t1 = tL + ((tR - tL) * (i + 1)) / n;
      const dd = torn ? depth * r.range(0.4, 1) : depth;
      const A = P(t0, 0.05),
        B = P(t1, 0.05),
        C = P(t1, dd),
        D = P(t0, dd);
      const col = i % 2 ? c1 : c2;
      M.quad(
        b,
        [A[0], y, A[1]],
        [B[0], y, B[1]],
        [C[0], y - drop, C[1]],
        [D[0], y - drop, D[1]],
        [nx * 0.5, 0.85, nz * 0.5],
        [0, 0, 1, 0, 1, 1, 0, 1],
        col,
      );
      M.quad(
        b,
        [D[0], y - drop, D[1]],
        [C[0], y - drop, C[1]],
        [C[0], y - drop - 0.35, C[1]],
        [D[0], y - drop - 0.35, D[1]],
        [nx, 0, nz],
        [0, 0, 1, 0, 1, 0.3, 0, 0.3],
        M.mulc(col, 0.85),
      );
    }
    // frame
    const fb = M.buf("rust", cx, cz, "detail");
    const A = P(tL, depth),
      B = P(tR, depth);
    M.beam(fb, A[0], y - drop, A[1], B[0], y - drop, B[1], 0.04, 0.04, {
      c: [0.4, 0.35, 0.3],
    });
  }
  function baseWindows(lot, x0, z0, x1, z1, y0, y1, r) {
    const fr = frontSides(lot);
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const gl = M.buf("glass_dirty", cx, cz);
    const sides = [
      ["n", x0, z0, x1, z0, 0, -1],
      ["e", x1, z0, x1, z1, 1, 0],
      ["s", x1, z1, x0, z1, 0, 1],
      ["w", x0, z1, x0, z0, -1, 0],
    ];
    for (const [k, ax, az, bx, bz, nx, nz] of sides) {
      if (!fr[k]) continue;
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.floor(len / 3.2);
      const ux = (bx - ax) / len,
        uz = (bz - az) / len;
      for (let i = 0; i < n; i++) {
        const t = ((i + 0.5) * len) / n;
        if (Math.abs(t - len / 2) < 2) continue; // entrance
        const px = ax + ux * t + nx * 0.03,
          pz = az + uz * t + nz * 0.03;
        for (const [wy0, wy1] of [
          [y0, y0 + 2.0],
          [y0 + 3.4, y1],
        ]) {
          const c =
            r() < 0.4
              ? [0.06, 0.06, 0.06]
              : r() < 0.2
                ? [0.6, 0.5, 0.35]
                : [0.45, 0.47, 0.44];
          M.quad(
            gl,
            [px - ux * 0.7, wy0, pz - uz * 0.7],
            [px + ux * 0.7, wy0, pz + uz * 0.7],
            [px + ux * 0.7, wy1, pz + uz * 0.7],
            [px - ux * 0.7, wy1, pz - uz * 0.7],
            [nx, 0, nz],
            [0, 0, 1, 0, 1, 1, 0, 1],
            c,
          );
        }
      }
    }
  }
  const DOOR_HW = 1.3,
    DOOR_H = 3.4; // old-world entrance opening (half width, height)
  /**
   * Old-world apartment entrance behind the opening at (px,pz) in a façade with outward normal (nx,nz):
   * a 1 m stone vestibule, bronze-framed double doors at its back (one leaf swung in, panes broken)
   * with a transom, and a dim lobby — cracked hex-tile floor, dado, brass mailbox bank, the foot of the
   * stairs, a dead pendant lamp, drifted leaves and a daylight pool. Visual only (the building's
   * collider still closes the lot); own rng stream so the building's rng sequence is untouched.
   */
  function lobbyEntrance(px, pz, nx, nz, ux, uz, cx, cz) {
    const r = M.rng("lobby" + Math.round(px * 3) + "," + Math.round(pz * 3));
    const hw = DOOR_HW,
      H = DOOR_H,
      vd = 1.0,
      LD = 4.6,
      LW = 3.2;
    // local frame: t along the façade (ux,uz), d into the building (−n)
    const P = (t, d, y) => [px + ux * t - nx * d, y, pz + uz * t - nz * d];
    const Q = (b, t0, d0, t1, d1, y0, y1, n, c, cTop) =>
      M.quad(
        b,
        P(t0, d0, y0),
        P(t1, d1, y0),
        P(t1, d1, y1),
        P(t0, d0, y1),
        n,
        [0, 0, 1, 0, 1, 1, 0, 1],
        c,
        cTop || c,
      );
    const st = M.buf("stone_limestone", cx, cz),
      cn = M.buf("concrete", cx, cz);
    const inward = [-nx, 0, -nz];
    // vestibule: stone reveals, soffit, worn step
    Q(
      st,
      -hw,
      0,
      -hw,
      vd,
      0,
      H,
      [ux, 0, uz],
      [0.5, 0.48, 0.44],
      [0.62, 0.6, 0.55],
    );
    Q(
      st,
      hw,
      vd,
      hw,
      0,
      0,
      H,
      [-ux, 0, -uz],
      [0.5, 0.48, 0.44],
      [0.62, 0.6, 0.55],
    );
    M.quad(
      st,
      P(-hw, 0, H),
      P(hw, 0, H),
      P(hw, vd, H),
      P(-hw, vd, H),
      [0, -1, 0],
      [0, 0, 1, 0, 1, 0.3, 0, 0.3],
      [0.42, 0.4, 0.37],
    );
    M.quad(
      st,
      P(-hw, 0, 0.14),
      P(hw, 0, 0.14),
      P(hw, vd, 0.14),
      P(-hw, vd, 0.14),
      [0, 1, 0],
      [0, 0, 1, 0, 1, 0.3, 0, 0.3],
      [0.62, 0.6, 0.56],
    );
    M.quad(
      st,
      P(-hw, -0.02, 0),
      P(hw, -0.02, 0),
      P(hw, -0.02, 0.14),
      P(-hw, -0.02, 0.14),
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 0.05, 0, 0.05],
      [0.55, 0.53, 0.5],
    );
    // door wall at the back of the vestibule (above/around the doors), transom glass
    const bz = M.buf("metal_painted", cx, cz, "detail");
    const BR = [0.32, 0.26, 0.18];
    Q(st, -hw, vd, -hw + 0.08, vd, 0, H, [nx, 0, nz], [0.45, 0.43, 0.4]);
    Q(st, hw - 0.08, vd, hw, vd, 0, H, [nx, 0, nz], [0.45, 0.43, 0.4]);
    M.beam(
      bz,
      P(-hw, vd, 2.85)[0],
      2.85,
      P(-hw, vd, 2.85)[2],
      P(hw, vd, 2.85)[0],
      2.85,
      P(hw, vd, 2.85)[2],
      0.12,
      0.12,
      { c: BR },
    );
    M.quad(
      M.buf("glass_dirty", cx, cz),
      P(-hw + 0.08, vd + 0.02, 2.92),
      P(hw - 0.08, vd + 0.02, 2.92),
      P(hw - 0.08, vd + 0.02, H - 0.05),
      P(-hw + 0.08, vd + 0.02, H - 0.05),
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 0.3, 0, 0.3],
      [0.2, 0.22, 0.2],
    );
    // two door leaves (1.2 m each): left closed with a broken pane, right swung inward
    const leaf = (hx, hz, dirx, dirz, open) => {
      const w = hw - 0.1,
        h = 2.8;
      const a = open,
        ca = Math.cos(a),
        sa = Math.sin(a);
      // leaf runs from the hinge along (dirx,dirz) rotated by `open` towards the inside
      const ex = dirx * ca + -nx * sa,
        ez = dirz * ca + -nz * sa;
      const E = (t, y) => [hx + ex * t, y, hz + ez * t];
      const fr = (a0, a1, y0, y1) =>
        M.beam(
          bz,
          E(a0, y0)[0],
          y0,
          E(a0, y0)[2],
          E(a1, y1)[0],
          y1,
          E(a1, y1)[2],
          0.1,
          0.07,
          { c: BR },
        );
      fr(0.05, 0.05, 0, h);
      fr(w - 0.05, w - 0.05, 0, h);
      fr(0.05, w - 0.05, h - 0.05, h - 0.05);
      fr(0.05, w - 0.05, 0.9, 0.9);
      fr(0.05, w - 0.05, 0.05, 0.05);
      M.quad(
        bz,
        E(0.1, 0.1),
        E(w - 0.1, 0.1),
        E(w - 0.1, 0.85),
        E(0.1, 0.85),
        [-ez, 0, ex].map((v) => v * (dirx * nz - dirz * nx >= 0 ? 1 : -1)),
        [0, 0, 1, 0, 1, 1, 0, 1],
        M.mulc(BR, 1.2),
      );
      if (!open || r() < 0.6)
        M.quad(
          M.buf("glass_dirty", cx, cz, "detail"),
          E(0.1, 0.95),
          E(w - 0.1, 0.95),
          E(w - 0.1, h - 0.1),
          E(0.1, h - 0.1),
          [nx, 0, nz],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.35, 0.38, 0.36],
        );
    };
    const hl = P(-hw + 0.08, vd + 0.02, 0),
      hr = P(hw - 0.08, vd + 0.02, 0);
    leaf(hl[0], hl[2], ux, uz, r() < 0.3 ? 0.4 : 0);
    leaf(hr[0], hr[2], -ux, -uz, r.range(0.9, 1.4));
    // the lobby (dim): floor, walls with a dado, ceiling
    const lw = LW,
      d0 = vd + 0.05,
      d1 = vd + LD;
    const fl = M.buf("concrete", cx, cz);
    const FC = r.pick([
      [0.42, 0.4, 0.36],
      [0.38, 0.36, 0.34],
      [0.46, 0.42, 0.36],
    ]);
    M.quad(
      fl,
      P(-lw, d0, 0.02),
      P(lw, d0, 0.02),
      P(lw, d1, 0.02),
      P(-lw, d1, 0.02),
      [0, 1, 0],
      [0, 0, 2, 0, 2, 2, 0, 2],
      FC,
      M.mulc(FC, 0.7),
    );
    const WC = r.pick([
      [0.36, 0.33, 0.28],
      [0.3, 0.32, 0.3],
      [0.38, 0.32, 0.28],
    ]);
    Q(
      cn,
      -lw,
      d1,
      -lw,
      d0,
      0,
      4.2,
      [ux, 0, uz],
      M.mulc(WC, 0.7),
      M.mulc(WC, 0.5),
    );
    Q(
      cn,
      lw,
      d0,
      lw,
      d1,
      0,
      4.2,
      [-ux, 0, -uz],
      M.mulc(WC, 0.7),
      M.mulc(WC, 0.5),
    );
    Q(
      cn,
      -lw,
      d1,
      lw,
      d1,
      0,
      4.2,
      [nx, 0, nz],
      M.mulc(WC, 0.62),
      M.mulc(WC, 0.42),
    );
    M.quad(
      cn,
      P(-lw, d0, 4.2),
      P(-lw, d1, 4.2),
      P(lw, d1, 4.2),
      P(lw, d0, 4.2),
      [0, -1, 0],
      [0, 0, 1, 0, 1, 1, 0, 1],
      [0.2, 0.19, 0.18],
    );
    // dado rail & dark wood wainscot on the back wall
    const wd = M.buf("wood_rotten", cx, cz, "detail");
    Q(
      wd,
      -lw,
      d1 - 0.03,
      lw,
      d1 - 0.03,
      0,
      1.1,
      [nx, 0, nz],
      [0.26, 0.2, 0.16],
      [0.3, 0.24, 0.18],
    );
    // brass mailbox bank on the back wall
    const mbx = r() < 0.5 ? -lw + 0.4 : 0.3,
      rows = 4,
      colsN = 6;
    const myaw = Math.atan2(-uz, ux); // obox local X → the façade tangent
    for (let i = 0; i < rows; i++) {
      // one strip per row of little doors (a few sprung open: dark)
      const q = P(mbx + colsN * 0.15, d1 - 0.06, 0),
        y = 1.3 + i * 0.26;
      M.obox(bz, q[0], y + 0.11, q[2], colsN * 0.3, 0.22, 0.05, myaw, {
        c: M.mulc([0.5, 0.42, 0.24], 0.8 + r() * 0.3),
        s: 1,
        skip: 32,
      });
    }
    for (let j = 0; j <= colsN; j++) {
      const q = P(mbx + j * 0.3, d1 - 0.1, 0);
      M.box(
        bz,
        q[0] - 0.015,
        1.3,
        q[2] - 0.015,
        q[0] + 0.015,
        1.3 + rows * 0.26,
        q[2] + 0.015,
        { s: 1, c: [0.2, 0.16, 0.1], skip: 8 + 4 },
      );
    }
    // foot of the stairs on the far side
    const sx0 = mbx < 0 ? lw - 1.3 : -lw + 0.1;
    for (let i = 0; i < 6; i++) {
      const y1 = (i + 1) * 0.18,
        dd = d1 - 0.3 - i * 0.28;
      M.box(
        M.buf("stone_limestone", cx, cz, "detail"),
        Math.min(P(sx0, dd, 0)[0], P(sx0 + 1.2, dd - 0.28, 0)[0]),
        0,
        Math.min(P(sx0, dd, 0)[2], P(sx0 + 1.2, dd - 0.28, 0)[2]),
        Math.max(P(sx0, dd, 0)[0], P(sx0 + 1.2, dd - 0.28, 0)[0]),
        y1,
        Math.max(P(sx0, dd, 0)[2], P(sx0 + 1.2, dd - 0.28, 0)[2]),
        { s: 1, c: M.mulc([0.52, 0.5, 0.46], 1 - i * 0.05) },
      );
    }
    // dead pendant lamp, leaves & grime drifted in, a daylight pool from the open door
    const lp = P(0, (d0 + d1) / 2, 0);
    M.pipe(bz, lp[0], 4.2, lp[2], lp[0], 3.4, lp[2], 0.015, 3, {
      c: [0.2, 0.2, 0.2],
    });
    M.cyl(
      M.buf("glass_dirty", cx, cz, "detail"),
      lp[0],
      3.1,
      lp[2],
      0.12,
      0.28,
      0.3,
      8,
      { c: [0.4, 0.38, 0.3] },
    );
    const mk = M.buf("my/markings", cx, cz, "fine");
    for (let i = 0; i < 3; i++) {
      const q = P(r.range(-lw + 0.8, lw - 0.8), r.range(d0 + 0.5, d1 - 0.6), 0);
      M.decal(
        mk,
        q[0],
        0.04,
        q[2],
        r.range(1, 2),
        r.range(1, 2),
        r() * 6,
        r() < 0.6 ? M.MARK.LEAVES : M.MARK.DIRT,
      );
    }
    const pool = P(0.3, d0 + 1.1, 0);
    M.lightPool(
      M.buf("my/lightfx", cx, cz, "detail"),
      pool[0],
      0.05,
      pool[2],
      1.5,
      1.5,
      [0.11, 0.1, 0.08],
    );
    void inward;
  }
  function entranceCanopy(lot, x0, z0, x1, z1, r) {
    const fr = frontSides(lot);
    const k = fr.n ? "n" : fr.s ? "s" : fr.w ? "w" : fr.e ? "e" : null;
    if (!k) return;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const nx = k === "e" ? 1 : k === "w" ? -1 : 0,
      nz = k === "s" ? 1 : k === "n" ? -1 : 0;
    const px = k === "e" ? x1 : k === "w" ? x0 : cx,
      pz = k === "s" ? z1 : k === "n" ? z0 : cz;
    const ux = nz !== 0 ? 1 : 0,
      uz = nx !== 0 ? 1 : 0;
    // doorway: a recessed vestibule, bronze double doors (one ajar) and a dim lobby behind — not a black void
    const sideLen = nz !== 0 ? x1 - x0 : z1 - z0;
    if (sideLen > 7.5) lobbyEntrance(px, pz, nx, nz, ux, uz, cx, cz);
    else {
      const dk = M.buf("glass_dirty", cx, cz);
      M.quad(
        dk,
        [px - ux * 1.2 + nx * 0.04, 0, pz - uz * 1.2 + nz * 0.04],
        [px + ux * 1.2 + nx * 0.04, 0, pz + uz * 1.2 + nz * 0.04],
        [px + ux * 1.2 + nx * 0.04, 3.2, pz + uz * 1.2 + nz * 0.04],
        [px - ux * 1.2 + nx * 0.04, 3.2, pz - uz * 1.2 + nz * 0.04],
        [nx, 0, nz],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.05, 0.05, 0.05],
      );
    }
    const bs = M.buf("stone_limestone", cx, cz, "detail");
    M.box(
      bs,
      Math.min(px - ux * 1.7, px + ux * 1.7 + nx * 0.3),
      DOOR_H,
      Math.min(pz - uz * 1.7, pz + uz * 1.7 + nz * 0.3),
      Math.max(px - ux * 1.7, px + ux * 1.7 + nx * 0.3),
      DOOR_H + 0.6,
      Math.max(pz - uz * 1.7, pz + uz * 1.7 + nz * 0.3),
      { s: 1, c: TRIM_C },
    );
    // pilasters framing the door
    for (const sd of [-1, 1]) {
      const qx = px + ux * sd * (DOOR_HW + 0.2),
        qz = pz + uz * sd * (DOOR_HW + 0.2);
      M.box(
        bs,
        Math.min(qx - ux * 0.2, qx + ux * 0.2 + nx * 0.22),
        0,
        Math.min(qz - uz * 0.2, qz + uz * 0.2 + nz * 0.22),
        Math.max(qx - ux * 0.2, qx + ux * 0.2 + nx * 0.22),
        DOOR_H,
        Math.max(qz - uz * 0.2, qz + uz * 0.2 + nz * 0.22),
        { s: 1, c: M.mulc(TRIM_C, 0.9) },
      );
    }
    // NYC apartment canopy out to the curb (frame + tattered fabric)
    if (r() < 0.6) {
      const len = 5.5;
      const fb = M.buf("fabric@ds", cx, cz, "detail");
      const col = r.pick([
        [0.2, 0.28, 0.24],
        [0.45, 0.15, 0.13],
        [0.18, 0.2, 0.3],
      ]);
      const A = [px - ux * 1.3, pz - uz * 1.3],
        B = [px + ux * 1.3, pz + uz * 1.3];
      const torn = r() < 0.5 ? r.range(0.4, 0.9) : 1;
      M.quad(
        fb,
        [A[0], 3.3, A[1]],
        [B[0], 3.3, B[1]],
        [B[0] + nx * len * torn, 3.0, B[1] + nz * len * torn],
        [A[0] + nx * len * torn, 3.0, A[1] + nz * len * torn],
        [0, 1, 0],
        [0, 0, 1, 0, 1, 2, 0, 2],
        col,
      );
      const pb = M.buf("chrome", cx, cz, "detail");
      for (const S of [A, B]) {
        M.pipe(
          pb,
          S[0] + nx * len,
          0,
          S[1] + nz * len,
          S[0] + nx * len,
          3.0,
          S[1] + nz * len,
          0.04,
          5,
          { c: [0.6, 0.6, 0.58] },
        );
        M.pipe(
          pb,
          S[0],
          3.25,
          S[1],
          S[0] + nx * len,
          3.0,
          S[1] + nz * len,
          0.035,
          5,
          { c: [0.6, 0.6, 0.58] },
        );
      }
    }
  }
  function loadingDock(x0, z0, x1, z1, side, r) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const nx = side === "e" ? 1 : side === "w" ? -1 : 0,
      nz = side === "s" ? 1 : side === "n" ? -1 : 0;
    const ax = side === "e" ? x1 : x0,
      az = side === "s" ? z1 : z0;
    const len = nz !== 0 ? x1 - x0 : z1 - z0;
    const ux = nz !== 0 ? 1 : 0,
      uz = nx !== 0 ? 1 : 0;
    const pb = M.buf("concrete", cx, cz);
    // platform
    const d = 2.2;
    const P0 = [ax + nx * 0, az + nz * 0],
      P1 = [ax + ux * len + nx * d, az + uz * len + nz * d];
    M.box(
      pb,
      Math.min(P0[0], P1[0]),
      0,
      Math.min(P0[1], P1[1]),
      Math.max(P0[0], P1[0]),
      1.2,
      Math.max(P0[1], P1[1]),
      { s: 3, c: [0.72, 0.7, 0.66] },
    );
    M.box3(
      Math.min(P0[0], P1[0]),
      0,
      Math.min(P0[1], P1[1]),
      Math.max(P0[0], P1[0]),
      1.2,
      Math.max(P0[1], P1[1]),
      { tag: "dock", surface: "concrete" },
    );
    // roll-up doors
    const n = Math.max(1, Math.floor(len / 8));
    const bs = M.buf("corrugated", cx, cz),
      bdk = M.buf("glass_dirty", cx, cz);
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) * len) / n;
      const px = ax + ux * t + nx * 0.05,
        pz = az + uz * t + nz * 0.05;
      const open = r() < 0.3 ? r.range(0.3, 0.8) : 0;
      const top = 5.2,
        bot = 1.2 + (top - 1.2) * open;
      M.quad(
        bs,
        [px - ux * 2, bot, pz - uz * 2],
        [px + ux * 2, bot, pz + uz * 2],
        [px + ux * 2, top, pz + uz * 2],
        [px - ux * 2, top, pz - uz * 2],
        [nx, 0, nz],
        [0, 0, 2, 0, 2, 2, 0, 2],
        r.pick([
          [0.6, 0.62, 0.6],
          [0.55, 0.35, 0.28],
          [0.35, 0.45, 0.55],
        ]),
      );
      if (open)
        M.quad(
          bdk,
          [px - ux * 2 + nx * -0.01, 1.2, pz - uz * 2],
          [px + ux * 2, 1.2, pz + uz * 2],
          [px + ux * 2, bot, pz + uz * 2],
          [px - ux * 2, bot, pz - uz * 2],
          [nx, 0, nz],
          [0, 0, 1, 0, 1, 1, 0, 1],
          [0.03, 0.03, 0.03],
        );
    }
    // dock canopy
    const cb = M.buf("rust", cx, cz, "detail");
    M.quad(
      cb,
      [ax, 6, az],
      [ax + ux * len, 6, az + uz * len],
      [ax + ux * len + nx * 3, 5.6, az + uz * len + nz * 3],
      [ax + nx * 3, 5.6, az + nz * 3],
      [0, 1, 0],
      [0, 0, len / 3, 0, len / 3, 1, 0, 1],
      [0.7, 0.6, 0.5],
    );
  }

  // -------------------------------------------------------------------
  // Rooftop dressing (bulkheads, HVAC, water towers, antennas, skylights)
  // -------------------------------------------------------------------
  function rooftop(x0, z0, x1, z1, y, r, o) {
    o = o || {};
    const w = x1 - x0,
      d = z1 - z0;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    // stair bulkhead
    if (w > 6 && d > 6) {
      const bx = x0 + 1 + r() * (w - 5),
        bz = z0 + 1 + r() * (d - 5);
      M.box(M.buf("brick_brown", cx, cz), bx, y, bz, bx + 3, y + 3, bz + 3.5, {
        s: 2.5,
        c: [0.8, 0.75, 0.7],
      });
      M.box(
        M.buf("concrete_dark", cx, cz),
        bx - 0.1,
        y + 3,
        bz - 0.1,
        bx + 3.1,
        y + 3.2,
        bz + 3.6,
        { s: 3 },
      );
    }
    if (r() < (o.tower || 0) && w > 7 && d > 7) {
      const tx = x0 + 3 + r() * (w - 6),
        tz = z0 + 3 + r() * (d - 6);
      M.waterTower(tx, y, tz, r.range(0.85, 1.15), r() < 0.12);
    }
    roofClutter(x0, z0, x1, z1, y, null, null, null, null, r);
  }
  M.rooftop = rooftop;
  function roofClutter(x0, z0, x1, z1, y, ex0, ez0, ex1, ez1, r) {
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const b = M.buf("metal_panel", cx, cz, "detail");
    const n = r.int(1, 4);
    for (let i = 0; i < n; i++) {
      const s = r.range(0.8, 2.4);
      const px = x0 + 1 + r() * Math.max(0.1, x1 - x0 - 2 - s),
        pz = z0 + 1 + r() * Math.max(0.1, z1 - z0 - 2 - s);
      if (ex0 !== null && px > ex0 - s && px < ex1 && pz > ez0 - s && pz < ez1)
        continue;
      const k = r();
      if (k < 0.5)
        M.box(b, px, y, pz, px + s, y + s * 0.6, pz + s * 0.8, {
          s: 1.5,
          c: [0.62, 0.64, 0.6],
        }); // HVAC
      else if (k < 0.75) {
        M.cyl(b, px, y, pz, 0.25, 0.25, 1.2, 6, {
          c: [0.5, 0.5, 0.48],
          capTop: true,
        });
        M.cyl(b, px, y + 1.2, pz, 0.45, 0.1, 0.3, 6, { c: [0.45, 0.45, 0.42] });
      } // vent
      else {
        const bm = M.buf("rust", cx, cz, "detail");
        M.pipe(bm, px, y, pz, px, y + r.range(4, 9), pz, 0.05, 4, {
          c: [0.6, 0.5, 0.45],
        });
        M.beam(bm, px - 0.8, y + 3, pz, px + 0.8, y + 3, pz, 0.04, 0.04, {
          c: [0.6, 0.5, 0.45],
        });
      } // antenna
    }
  }

  // -------------------------------------------------------------------
  // Fire escapes on street façades
  // -------------------------------------------------------------------
  function fireEscapesFor(lot, x0, z0, x1, z1, yFrom, yTo, flH, r, single) {
    const fr = frontSides(lot);
    const cands = [];
    if (fr.n || lot.faceN) cands.push(["n", x0, z0, x1, z0, 0, -1]);
    if (fr.s || lot.faceS) cands.push(["s", x1, z1, x0, z1, 0, 1]);
    if (fr.e) cands.push(["e", x1, z0, x1, z1, 1, 0]);
    if (fr.w) cands.push(["w", x0, z1, x0, z0, -1, 0]);
    if (!cands.length) return;
    const n = single ? 1 : Math.min(cands.length, r.int(1, 2));
    for (let i = 0; i < n; i++) {
      const c = cands[i];
      const len = Math.hypot(c[3] - c[1], c[4] - c[2]);
      if (len < 5) continue;
      const w = Math.min(len - 1.5, r.range(4.5, 7));
      const t = r.range(0.5, Math.max(0.5, len - w - 0.5));
      M.fireEscape(
        c[1],
        c[2],
        c[3],
        c[4],
        c[5],
        c[6],
        t,
        w,
        yFrom,
        yTo,
        flH,
        r,
      );
    }
  }

  // -------------------------------------------------------------------
  // Enterable storefront shells
  // -------------------------------------------------------------------
  M.shells = []; // enterable shop registry (filled by M.buildShellInterior, 40_buildings_interior.js)
  /**
   * Enterable, looted corner shop. Built in a local frame: the shop front is
   * the local x axis at local z = 0, the room extends toward local +z and the
   * street is at local -z. For south-facing lots the frame is rotated by π.
   */
  function buildShell(lot, r) {
    const fr = frontSides(lot);
    const side = fr.n || lot.faceN ? "n" : fr.s || lot.faceS ? "s" : null;
    if (!side) return null;
    const x0 = lot.x0 + (lot.front.w ? 0 : 0.15),
      x1 = lot.x1 - (lot.front.e ? 0 : 0.15),
      z0 = lot.z0 + (fr.n ? 0 : 0.15),
      z1 = lot.z1 - (fr.s ? 0 : 0.15);
    const W = x1 - x0,
      D = z1 - z0;
    if (W < 7 || D < 9) return null;
    const cx = (x0 + x1) / 2,
      cz = (z0 + z1) / 2;
    const gf = 4.4,
      floors = r.int(3, 6),
      H = gf + floors * 3.4;
    const fmat =
      "facade/apartment/" + chunkVariant("apartment", cx, cz, r() < 0.5);
    const tint = r.pick(TINTS.apartment);
    const face = partyFaces(lot);
    // upper floors (world frame)
    facadeWalls(x0, z0, x1, z1, gf, H, fmat, tint, {
      vBase: gf,
      face,
      blank: "brick_red",
    });
    cornice(
      x0,
      z0,
      x1,
      z1,
      H - 0.9,
      0.7,
      0.9,
      "metal_painted",
      [0.45, 0.42, 0.38],
      { brackets: true, sides: frontSides(lot) },
    );
    roof(x0, z0, x1, z1, H, {
      parapet: 0.6,
      trim: "brick_red",
      trimC: [0.75, 0.6, 0.5],
    });
    rooftop(x0, z0, x1, z1, H, r, { tower: 0.4 });
    fireEscapesFor(lot, x0, z0, x1, z1, gf + 0.6, H - 1.2, 3.4, r, true);
    M.box3(x0, gf - 0.2, z0, x1, H, z1, { tag: "building" });
    // local frame
    const fz = side === "n" ? z0 : z1;
    const flip = side === "s";
    const toW = (lx, lz) => (flip ? [cx - lx, fz - lz] : [cx + lx, fz + lz]);
    const colL = (lx0, lz0, lx1, lz1, y0, y1, tag) => {
      const a = toW(lx0, lz0),
        b = toW(lx1, lz1);
      M.box3(
        Math.min(a[0], b[0]),
        y0,
        Math.min(a[1], b[1]),
        Math.max(a[0], b[0]),
        y1,
        Math.max(a[1], b[1]),
        { tag: tag || "building", surface: "concrete" },
      );
    };
    M.pushXF(M.mtx(cx, 0, fz, flip ? Math.PI : 0));
    const hw = W / 2,
      dep = D;
    const roomW = Math.min(W - 0.8, 16),
      roomD = Math.min(D - 1.2, 11);
    const rl = -roomW / 2,
      rr = roomW / 2;
    const T = 0.3; // wall thickness
    // ground-floor exterior walls (sides & back) in brick
    const gfB = M.buf("brick_red", cx, cz);
    const bc0 = [0.6, 0.55, 0.5],
      bc1 = [0.85, 0.8, 0.75];
    M.wall(gfB, hw, 0, hw, dep, 0, gf, 0, dep / 3, 0, gf / 3, bc0, bc1);
    M.wall(gfB, hw, dep, -hw, dep, 0, gf, 0, W / 3, 0, gf / 3, bc0, bc1);
    M.wall(gfB, -hw, dep, -hw, 0, 0, gf, 0, dep / 3, 0, gf / 3, bc0, bc1);
    // front: [-hw..winL] pier, [winR..doorL] pier, [doorR..hw] pier ; window opening winL..winR (sill), door doorL..doorR
    const doorL = 0.4,
      doorR = 2.8,
      winL = rl + 0.7,
      winR = -0.6;
    const fb = M.buf("stone_limestone", cx, cz);
    const fc0 = [0.62, 0.6, 0.56],
      fc1 = [0.9, 0.88, 0.82];
    const piersL = [
      [-hw, winL],
      [winR, doorL],
      [doorR, hw],
    ];
    for (const [a, b] of piersL) {
      if (b - a < 0.05) continue;
      // outer face (normal -z): traverse from +x to -x so M.wall's normal points -z
      M.wall(fb, a, 0, b, 0, 0, gf, 0, (b - a) / 3, 0, gf / 3, fc0, fc1);
      colL(a, 0, b, T, 0, gf);
    }
    // opening reveals & lintel
    for (const [a, b, bot] of [
      [winL, winR, 0.75],
      [doorL, doorR, 0],
    ]) {
      M.box(fb, a, 3.2, 0, b, gf, T, { s: 1.5, c: fc1, skip: 8 + 4 });
      M.quad(
        fb,
        [a, 3.2, 0],
        [b, 3.2, 0],
        [b, 3.2, T],
        [a, 3.2, T],
        [0, -1, 0],
        [0, 0, 1, 0, 1, 0.1, 0, 0.1],
        fc0,
      );
      for (const [x, n] of [
        [a, 1],
        [b, -1],
      ])
        M.quad(
          fb,
          [x, bot, 0],
          [x, bot, T],
          [x, 3.2, T],
          [x, 3.2, 0],
          [n, 0, 0],
          [0, 0, 0.1, 0, 0.1, 1, 0, 1],
          fc0,
        );
    }
    M.wall(
      fb,
      winL - 0.05,
      0,
      winR + 0.05,
      0,
      0,
      0.75,
      0,
      1,
      0,
      0.25,
      fc0,
      fc1,
    );
    M.box(fb, winL, 0.75, -0.05, winR, 0.82, T + 0.05, { s: 1, c: fc1 });
    colL(winL, 0, winR, T, 0, 0.8, "wall");
    // broken glass shards in the display window
    const gs = M.buf("glass_dirty", cx, cz, "detail");
    for (let i = 0; i < 4; i++) {
      const px = winL + r() * (winR - winL - 0.5);
      M.tri(
        gs,
        [px, 0.82, 0.12],
        [px + 0.5, 0.82, 0.12],
        [px + 0.2, 0.82 + r.range(0.4, 1.4), 0.12],
        [0, 0, -1],
        [0, 0, 1, 0, 0.5, 1],
        [0.5, 0.55, 0.5],
      );
    }
    for (let i = 0; i < 3; i++) {
      const px = winL + r() * (winR - winL - 0.6);
      M.tri(
        gs,
        [px, 3.2, 0.12],
        [px + 0.6, 3.2, 0.12],
        [px + 0.3, 3.2 - r.range(0.4, 1.2), 0.12],
        [0, 0, -1],
        [0, 0, 1, 0, 0.5, 1],
        [0.5, 0.55, 0.5],
      );
    }
    // sign band across the front (readable from the street: u runs +x → -x)
    const i = r.int(0, M.SHOP_SIGN_COUNT - 1),
      uv = M.cellUV(i, 2, 16);
    M.quad(
      M.buf("my/shopsigns", cx, cz, "detail"),
      [hw - 0.4, gf - 1.1, -0.05],
      [-hw + 0.4, gf - 1.1, -0.05],
      [-hw + 0.4, gf - 0.1, -0.05],
      [hw - 0.4, gf - 0.1, -0.05],
      [0, 0, -1],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    // the shop room (inner pier faces, walls, floor, ceiling, room colliders, dressing, loot records → M.shells):
    // 40_buildings_interior.js (called inside this local frame; same rng stream, same order)
    M.buildShellInterior({
      r,
      cx,
      cz,
      gf,
      hw,
      dep,
      roomW,
      roomD,
      rl,
      rr,
      T,
      doorL,
      doorR,
      piersL,
      toW,
      colL,
      flip,
    });
    M.popXF();
    return { h: H };
  }

  // -------------------------------------------------------------------
  // Far impostors (HLOD): simple textured boxes built from each lot's
  // building colliders, shown only when the full-detail chunk is hidden.
  // -------------------------------------------------------------------
  M.defineAtlas("farfacade", function () {
    const S = 256,
      cv = M.canvas(S, S),
      ctx = cv.getContext("2d");
    const r = M.rng("farfacade");
    ctx.fillStyle = "#b8b2a4";
    ctx.fillRect(0, 0, S, S);
    const cw = S / 4;
    for (let j = 0; j < 4; j++)
      for (let i = 0; i < 4; i++) {
        const x = i * cw + 16,
          y = j * cw + 14,
          w = cw - 32,
          h = cw - 26;
        const k = r();
        ctx.fillStyle = k < 0.15 ? "#5a4a38" : k < 0.55 ? "#16191a" : "#2c3334";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.fillRect(i * cw, j * cw + cw - 6, cw, 3);
      }
    for (let k = 0; k < 30; k++) {
      ctx.fillStyle = "rgba(30,26,20," + r() * 0.15 + ")";
      ctx.fillRect(r() * S, r() * S, 3 + r() * 5, 20 + r() * 80);
    }
    ctx.fillStyle = "#b8b2a4";
    ctx.fillRect(0, 0, 10, 10); // plain wall patch for roofs
    const t = M.finishTex(new THREE.CanvasTexture(cv));
    return { texture: t, roughness: 0.95 };
  });
  const IMP_TINT = {
    tower: [0.9, 0.86, 0.78],
    commercial: [0.78, 0.77, 0.74],
    apartment: [0.78, 0.62, 0.5],
    brownstone: [0.55, 0.42, 0.34],
    tenement: [0.68, 0.5, 0.4],
    warehouse: [0.66, 0.42, 0.33],
    collapsed: [0.5, 0.48, 0.45],
    shell: [0.68, 0.5, 0.4],
  };
  function emitImpostor(lot, c0) {
    const cx = (lot.x0 + lot.x1) / 2,
      cz = (lot.z0 + lot.z1) / 2;
    const b = M.buf("my/farfacade", cx, cz, "imp");
    const tint = M.mulc(
      IMP_TINT[lot.kind] || [0.7, 0.7, 0.68],
      0.9 + M.hash(cx, cz, 7) * 0.2,
    );
    const tile = M.facadeTile();
    const roofC = M.mulc(tint, 0.45);
    for (let i = c0; i < M.colliders.length; i++) {
      const c = M.colliders[i];
      if (c.tag !== "building" && c.tag !== "rubble") continue;
      const h = c.maxY - c.minY;
      if (h < 2.5) continue;
      const x0 = c.bb.x0,
        x1 = c.bb.x1,
        z0 = c.bb.z0,
        z1 = c.bb.z1;
      if ((x1 - x0) * (z1 - z0) < 6) continue;
      const y0 = c.minY,
        y1 = c.maxY;
      const sides = [
        [x0, z0, x1, z0],
        [x1, z0, x1, z1],
        [x1, z1, x0, z1],
        [x0, z1, x0, z0],
      ];
      for (const s of sides) {
        const l = Math.hypot(s[2] - s[0], s[3] - s[1]);
        M.wall(
          b,
          s[0],
          s[1],
          s[2],
          s[3],
          y0,
          y1,
          0,
          l / tile.w,
          y0 / tile.h,
          y1 / tile.h,
          M.mulc(tint, y0 < 5 ? 0.7 : 0.95),
          tint,
        );
      }
      M.quad(
        b,
        [x0, y1, z0],
        [x1, y1, z0],
        [x1, y1, z1],
        [x0, y1, z1],
        [0, 1, 0],
        [0.01, 0.01, 0.02, 0.01, 0.02, 0.02, 0.01, 0.02],
        roofC,
      );
    }
    // crown silhouette (spires, masts, pyramids read on the far skyline)
    const cr = lot.crown;
    if (cr) {
      const uv = [0.01, 0.01, 0.02, 0.01, 0.02, 0.02, 0.01, 0.02];
      if (cr.kind === "pyramid") {
        const [a0, b0, a1, b1] = cr.base,
          ap = [cr.x, cr.y + cr.h, cr.z];
        M.tri(
          b,
          [a0, cr.y, b0],
          [a1, cr.y, b0],
          ap,
          [0, 0.6, -0.8],
          uv,
          [0.4, 0.62, 0.52],
        );
        M.tri(
          b,
          [a1, cr.y, b0],
          [a1, cr.y, b1],
          ap,
          [0.8, 0.6, 0],
          uv,
          [0.36, 0.56, 0.47],
        );
        M.tri(
          b,
          [a1, cr.y, b1],
          [a0, cr.y, b1],
          ap,
          [0, 0.6, 0.8],
          uv,
          [0.4, 0.62, 0.52],
        );
        M.tri(
          b,
          [a0, cr.y, b1],
          [a0, cr.y, b0],
          ap,
          [-0.8, 0.6, 0],
          uv,
          [0.36, 0.56, 0.47],
        );
      } else {
        if (cr.base) {
          const [a0, b0, a1, b1] = cr.base;
          M.box(b, a0, cr.by, b0, a1, cr.y, b1, {
            s: 100,
            c: M.mulc(tint, 0.9),
            skip: 8,
          });
        }
        M.cyl(b, cr.x, cr.y, cr.z, cr.r, 0.05, cr.h, 4, {
          c: [0.6, 0.6, 0.58],
        });
      }
    }
  }
  M.emitImpostor = emitImpostor;
  // internals shared with 41_fronts.js (polygon lots along Broadway / roundabouts)
  M._bld = {
    TINTS,
    TRIM_C,
    bay,
    shopSign,
    awning,
    heightFor,
    chunkVariant,
    TILE,
    lotOnLand,
    nearSettlement,
    IMP_TINT,
  };

  // -------------------------------------------------------------------
  // City build entry point
  // -------------------------------------------------------------------
  /**
   * Build every lot. Async: yields to the browser every `sliceMs` of work so no single task runs for
   * seconds (headless runs / slow machines stay responsive, the loading screen keeps updating).
   */
  M.buildCity = async function (yieldFn, sliceMs) {
    const lots = planLots();
    M.lots = lots;
    if (M.planFallenTowers) M.planFallenTowers(lots);
    let shellQuota = 0;
    const stats = {
      tower: 0,
      commercial: 0,
      apartment: 0,
      brownstone: 0,
      tenement: 0,
      warehouse: 0,
      collapsed: 0,
      shell: 0,
    };
    let tSlice = performance.now();
    for (let i = 0; i < lots.length; i++) {
      if (yieldFn && performance.now() - tSlice > (sliceMs || 120)) {
        await yieldFn(i / lots.length);
        tSlice = performance.now();
      }
      const lot = lots[i];
      const r = M.rng(
        "lot" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      // weathering state (own rng stream so the building shapes stay as designed)
      const rw = M.rng(
        "wx" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      lot.dirt = rw.range(0.7, 1.3);
      lot.burnt =
        rw() <
          (lot.kind === "tower" || lot.kind === "commercial" ? 0.27 : 0.18) &&
        !nearSettlement((lot.x0 + lot.x1) / 2, (lot.z0 + lot.z1) / 2);
      lot.shopSoot = lot.burnt || rw() < 0.3;
      M.curLot = lot;
      let kind = lot.kind;
      if (r() < (kind === "brownstone" ? 0.035 : 0.06) && kind !== "tower")
        kind = "collapsed";
      if (lot.fallen) kind = "collapsed"; // its shaft lies across the avenue (49_ruins.js)
      const lcx = (lot.x0 + lot.x1) / 2,
        lcz = (lot.z0 + lot.z1) / 2;
      for (const c of M.HEIGHT_CAPS || [])
        if (
          lcx > c.x0 &&
          lcx < c.x1 &&
          lcz > c.z0 &&
          lcz < c.z1 &&
          (kind === "tower" || kind === "apartment")
        )
          kind = "commercial";
      shellQuota += kind === "tenement" || kind === "commercial" ? 1 : 0;
      const c0 = M.colliders.length;
      if (
        (kind === "tenement" || kind === "commercial") &&
        shellQuota % 5 === 2 &&
        M.shells.length < 34
      ) {
        const res = buildShell(lot, r);
        if (res) {
          lot.h = res.h;
          lot.kind = "shell";
          stats.shell++;
          emitImpostor(lot, c0);
          continue;
        }
      }
      let res;
      switch (kind) {
        case "tower":
          res = buildTower(lot, r);
          break;
        case "commercial":
          res = buildCommercial(lot, r);
          break;
        case "apartment":
          res = buildApartment(lot, r);
          break;
        case "brownstone":
          res = buildBrownstone(lot, r);
          break;
        case "tenement":
          res = buildTenement(lot, r);
          break;
        case "warehouse":
          res = buildWarehouse(lot, r);
          break;
        default:
          res = buildCollapsed(lot, r);
          kind = "collapsed";
      }
      M.setXF(null);
      lot.h = res ? res.h : 0;
      lot.kind = kind;
      if (kind === "collapsed") lot.ruined = true;
      stats[kind] = (stats[kind] || 0) + 1;
      emitImpostor(lot, c0);
    }
    M.curLot = null;
    if (M.buildCutBlocks)
      Object.assign(stats, await M.buildCutBlocks(yieldFn, sliceMs));
    stats.ruined = lots.filter((l) => l.ruined).length;
    stats.burnt = lots.filter((l) => l.burnt).length;
    M.cityStats = stats;
    return stats;
  };
})();
