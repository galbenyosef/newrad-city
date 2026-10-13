// play-inline-301 08 — array
// Lines 1850-1876 of readable/play-inline-301.pretty.js (statement-aligned).
  P.flipGeo = function (geo) {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const p = g.attributes.position,
      n = g.attributes.normal,
      uv = g.attributes.uv;
    for (let i = 0; i < p.count; i += 3) {
      for (const a of [p, n, uv]) {
        if (!a) continue;
        const s = a.itemSize;
        for (let k = 0; k < s; k++) {
          const t = a.array[(i + 1) * s + k];
          a.array[(i + 1) * s + k] = a.array[(i + 2) * s + k];
          a.array[(i + 2) * s + k] = t;
        }
      }
    }
    if (n) for (let i = 0; i < n.array.length; i++) n.array[i] = -n.array[i];
    return g;
  };

  // ===================================================================
  // Site builder context
  // ===================================================================
  /**
   * S = P.site(id, {ox,oy,oz, lit, ambient, ambI, interiorKey})
   * All coordinates passed to S.* are LOCAL (origin = ox,oy,oz).
   */
