// play-inline-85 01 — tryr
// Lines 16-217 of readable/play-inline-85.pretty.js (statement-aligned).
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
