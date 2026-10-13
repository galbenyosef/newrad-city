// play-inline-87 01 — out
// Lines 19-367 of readable/play-inline-87.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;

  const CORR_PAD = 0.0; // lots end exactly at the corridor edge (= back of sidewalk)
  const SITE_PAD = 1.5; // same clearance generic lots keep from landmark sites
  M.cutLots = [];
  const claimed = [];
  const wallCols = new Map(); // shared-edge key → collider (party-wall dedupe)
  const edgeKey = (e) => {
    const a = Math.round(e.ax * 5) + "," + Math.round(e.az * 5),
      b = Math.round(e.bx * 5) + "," + Math.round(e.bz * 5);
    return a < b ? a + "|" + b : b + "|" + a;
  };

  // ---------------------------------------------------------------- geometry helpers
  function ccw(p) {
    return M.polyArea(p) > 0 ? p : p.slice().reverse();
  }
  function rectPoly(x0, z0, x1, z1) {
    return [
      [x0, z0],
      [x1, z0],
      [x1, z1],
      [x0, z1],
    ];
  }
  function thickness(p) {
    let per = 0;
    for (let i = 0; i < p.length; i++) {
      const a = p[i],
        b = p[(i + 1) % p.length];
      per += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    return per > 0 ? Math.abs(M.polyArea(p)) / (per / 2) : 0; // inradius-ish
  }
  function centroid(p) {
    let x = 0,
      z = 0;
    for (const q of p) {
      x += q[0];
      z += q[1];
    }
    return [x / p.length, z / p.length];
  }
  /** Drop near-duplicate consecutive vertices and collinear points. */
  function clean(p) {
    const out = [];
    for (const q of p) {
      const l = out[out.length - 1];
      if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 0.05) out.push(q);
    }
    if (
      out.length > 2 &&
      Math.hypot(
        out[0][0] - out[out.length - 1][0],
        out[0][1] - out[out.length - 1][1],
      ) < 0.05
    )
      out.pop();
    for (let i = 0; i < out.length && out.length > 3;) {
      const a = out[(i + out.length - 1) % out.length],
        b = out[i],
        c = out[(i + 1) % out.length];
      const cr = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
      if (Math.abs(cr) < 0.02) out.splice(i, 1);
      else i++;
    }
    return out;
  }
  /** Broadway corridor quads (full width incl. sidewalks), ends extended to cover the bends. */
  let CUTTERS = null;
  function cutters() {
    if (CUTTERS) return CUTTERS;
    const L = G.LAYOUT,
      B = L.BROADWAY,
      hw = L.BROADWAY_W / 2 + CORR_PAD;
    CUTTERS = [];
    for (let i = 0; i < B.length - 1; i++) {
      const a = B[i],
        b = B[i + 1];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        l = Math.hypot(dx, dz),
        ux = dx / l,
        uz = dz / l,
        nx = -uz,
        nz = ux;
      const e = hw * 1.2;
      const q = [
        [a[0] - ux * e - nx * hw, a[1] - uz * e - nz * hw],
        [b[0] + ux * e - nx * hw, b[1] + uz * e - nz * hw],
        [b[0] + ux * e + nx * hw, b[1] + uz * e + nz * hw],
        [a[0] - ux * e + nx * hw, a[1] - uz * e + nz * hw],
      ];
      CUTTERS.push({ q, bb: M.polyBBox(q), dir: [ux, uz], broadway: true });
    }
    for (const c of L.CIRCLES || []) {
      const q = M.circlePoly(c.x, c.z, c.rOuter + 3.5, 16);
      CUTTERS.push({ q, bb: M.polyBBox(q), circle: c });
    }
    return CUTTERS;
  }
  function bbHit(bb, x0, z0, x1, z1) {
    return !(bb.x1 < x0 || bb.x0 > x1 || bb.z1 < z0 || bb.z0 > z1);
  }
  function polyHitsRect(q, x0, z0, x1, z1) {
    const c = M.clipRect(q, x0, z0, x1, z1);
    return !!(c && Math.abs(M.polyArea(c)) > 0.5);
  }

  /** Called by planLots for every block: claim it when Broadway or a roundabout cuts it. */
  M.claimCutBlock = function (bl) {
    if (bl.brooklyn) return false;
    const hits = cutters().filter(
      (c) =>
        bbHit(c.bb, bl.x0, bl.z0, bl.x1, bl.z1) &&
        polyHitsRect(c.q, bl.x0, bl.z0, bl.x1, bl.z1),
    );
    if (!hits.length) return false;
    claimed.push({ bl, hits });
    return true;
  };

  // ---------------------------------------------------------------- planning
  function exclusions() {
    const L = G.LAYOUT,
      out = [];
    for (const s of L.SITES) {
      // exact wedge footprints (the Flatiron): subtract the padded polygon, not its bbox (Broadway's side is road)
      if (s.poly) {
        const q = M.insetPoly(ccw(s.poly), -SITE_PAD),
          bb = M.polyBBox(q);
        out.push([bb.x0, bb.z0, bb.x1, bb.z1, q]);
        continue;
      }
      out.push([
        s.x0 - SITE_PAD,
        s.z0 - SITE_PAD,
        s.x1 + SITE_PAD,
        s.z1 + SITE_PAD,
      ]);
    }
    for (const s of L.PENDING_REFIT || [])
      out.push([
        s.x0 - SITE_PAD,
        s.z0 - SITE_PAD,
        s.x1 + SITE_PAD,
        s.z1 + SITE_PAD,
      ]);
    for (const o of M.OPEN_SPACES || [])
      out.push(
        o.poly
          ? [o.x0, o.z0, o.x1, o.z1, ccw(o.poly)]
          : [o.x0, o.z0, o.x1, o.z1],
      ); // convex polys (Worth / Madison)
    return out;
  }
  function onLand(p) {
    const B = M._bld;
    const bb = M.polyBBox(p);
    if (!B.lotOnLand(bb.x0 + 0.5, bb.z0 + 0.5, bb.x1 - 0.5, bb.z1 - 0.5)) {
      // corners of the bbox may be off the promenade inset while the polygon itself is fine
      return p.every((q) => M.inPoly(q[0], q[1], M.manInset));
    }
    return true;
  }
  /** Split convex polygon p with the line through (px,pz) perpendicular to u → [before, after]. */
  function splitAt(p, px, pz, ux, uz) {
    // half-plane keeps points where (b-a)×(q-a)*sign >= 0 with a→b along the cut line (direction (-uz, ux))
    const ax = px,
      az = pz,
      bx = px - uz,
      bz = pz + ux;
    return [
      M.clipHalf(p, ax, az, bx, bz, 1),
      M.clipHalf(p, ax, az, bx, bz, -1),
    ];
  }
  function planPieces() {
    const L = G.LAYOUT,
      ex = exclusions();
    const lots = [];
    for (const { bl, hits } of claimed) {
      let pieces = [rectPoly(bl.x0, bl.z0, bl.x1, bl.z1)];
      for (const c of hits) {
        const n = [];
        for (const p of pieces) n.push(...M.subtractConvex(p, c.q));
        pieces = n;
      }
      for (const e of ex) {
        if (e[2] < bl.x0 || e[0] > bl.x1 || e[3] < bl.z0 || e[1] > bl.z1)
          continue;
        const q = e[4] || rectPoly(e[0], e[1], e[2], e[3]);
        const n = [];
        for (const p of pieces) {
          if (polyHitsRect(p, e[0], e[1], e[2], e[3]))
            n.push(...M.subtractConvex(p, q));
          else n.push(p);
        }
        pieces = n;
      }
      pieces = pieces
        .map((p) => ccw(clean(p)))
        .filter(
          (p) =>
            p.length >= 3 &&
            Math.abs(M.polyArea(p)) > 30 &&
            thickness(p) > 2.6 &&
            onLand(p),
        );
      const bw = hits.find((h) => h.broadway);
      for (const p of pieces) {
        const cz = centroid(p);
        if (L.inPark(cz[0], cz[1])) continue;
        const district = L.districtAt(cz[0], cz[1]);
        if (district === "water" || district === "central_park") continue;
        // slice along the Broadway direction (or the longer block axis): cuts perpendicular to it
        let ux, uz;
        if (bw) {
          ux = bw.dir[0];
          uz = bw.dir[1];
        } else {
          const bb = M.polyBBox(p);
          if (bb.x1 - bb.x0 >= bb.z1 - bb.z0) {
            ux = 1;
            uz = 0;
          } else {
            ux = 0;
            uz = 1;
          }
        }
        let t0 = 1e9,
          t1 = -1e9;
        for (const q of p) {
          const t = q[0] * ux + q[1] * uz;
          if (t < t0) t0 = t;
          if (t > t1) t1 = t;
        }
        const r = M.rng(
          "cut" + Math.round(cz[0] * 10) + "," + Math.round(cz[1] * 10),
        );
        const tall =
          district === "midtown" || district === "financial_district";
        const mn = district === "greenwich_village" ? 8 : tall ? 14 : 11,
          mx = tall ? 26 : 20;
        let rest = p,
          t = t0;
        const parts = [];
        while (t1 - t > mx + mn * 0.6) {
          t += r.range(mn, mx);
          const [a, b] = splitAt(rest, ux * t, uz * t, ux, uz);
          if (a.length >= 3 && Math.abs(M.polyArea(a)) > 12) parts.push(a);
          rest = b;
          if (rest.length < 3) break;
        }
        if (rest.length >= 3) parts.push(rest);
        for (const part of parts) {
          const pp = ccw(clean(part));
          if (
            pp.length < 3 ||
            Math.abs(M.polyArea(pp)) < 22 ||
            thickness(pp) < 2.2
          )
            continue;
          const bb = M.polyBBox(pp);
          lots.push({
            poly: pp,
            x0: bb.x0,
            z0: bb.z0,
            x1: bb.x1,
            z1: bb.z1,
            district,
            kind: "wedge",
            block: bl,
            front: { n: true, s: true, e: true, w: true },
            cut: true,
          });
        }
      }
    }
    return lots;
  }

  // ---------------------------------------------------------------- building
  /** Edge classification: 'f' façade + storefront (faces a road/sidewalk/plaza), 'b' blank party wall. */
  function edgeKind(ax, az, bx, bz, nx, nz, self) {
    const L = G.LAYOUT;
    let open = 0;
    for (const t of [0.25, 0.5, 0.75]) {
      const sx = ax + (bx - ax) * t + nx * 1.6,
        sz = az + (bz - az) * t + nz * 1.6;
      if (inAnyLot(sx, sz, self)) continue;
      if (
        M.isCorridor(sx, sz) ||
        L.siteAt(sx, sz) ||
        (M.OPEN_SPACES || []).some(
          (o) =>
            sx > o.x0 &&
            sx < o.x1 &&
            sz > o.z0 &&
            sz < o.z1 &&
            (!o.poly || M.inPoly(sx, sz, o.poly)),
        )
      )
        open++;
    }
    return open >= 2 ? "f" : "b";
  }
  function inAnyLot(x, z, self) {
    for (const l of M.lots || [])
      if (x > l.x0 && x < l.x1 && z > l.z0 && z < l.z1) return true;
    for (const l of M.cutLots)
      if (
        l !== self &&
        x > l.x0 &&
        x < l.x1 &&
        z > l.z0 &&
        z < l.z1 &&
        M.inPoly(x, z, l.poly)
      )
        return true;
    return false;
  }
  function edges(p) {
    const out = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i],
        b = p[(i + 1) % p.length];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        len = Math.hypot(dx, dz);
      if (len < 0.3) continue;
      // CCW polygon (x→z shoelace > 0): outward normal (dz, −dx)
      out.push({
        ax: a[0],
        az: a[1],
        bx: b[0],
        bz: b[1],
        len,
        ux: dx / len,
        uz: dz / len,
        nx: dz / len,
        nz: -dx / len,
      });
    }
    return out;
  }
  /** Storefront bays along one street edge (same kit as the rect buildings). */
