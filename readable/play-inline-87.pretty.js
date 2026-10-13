/* src/map/41_fronts.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 41 BROADWAY FRONTS (polygon lots)
 * The generic city is planned on axis-aligned lots, so every block that
 * Broadway (a diagonal) or a roundabout cuts used to lose its corner lots
 * — leaving jagged empty triangles of sidewalk and buildings set back
 * metres from the kerb. Those blocks are claimed here instead:
 *   block rect − Broadway corridor − roundabout − sites/open spaces
 *   → convex pieces → sliced into 10–24 m building lots
 *   → polygon buildings flush with EVERY kerb (the diagonal Broadway
 *     façade included): storefront bays with dim shop interiors, the
 *     district's façade atlas on every edge (blank brick on party walls),
 *     cornices, parapets, roof tar, bulkheads & water towers, fire-gutted
 *     variants, wall-log entries for the decay/grime passes, per-edge wall
 *     colliders + solid interior slices, far impostors.
 * Wedge "flatiron" prows appear by themselves where Broadway meets a street.
 * ===================================================================== */
(function () {
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
  function storeEdge(e, gf, r, cx, cz, lot, pilMat, pilC, ruined, depthAvail) {
    const B = M._bld;
    const b = M.buf(pilMat, cx, cz);
    const bays = Math.max(1, Math.round(e.len / 4.8));
    const bw = e.len / bays;
    const P = (t, off) => [
      e.ax + e.ux * t + e.nx * off,
      e.az + e.uz * t + e.nz * off,
    ];
    for (let i = 0; i < bays; i++) {
      const t0 = i * bw,
        t1 = (i + 1) * bw,
        pw = 0.45;
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
      if (bayR - bayL < 1.2) continue;
      const roll = r();
      const kind = ruined
        ? roll < 0.25
          ? "boarded"
          : roll < 0.38
            ? "shutter"
            : roll < 0.75
              ? "open"
              : "glass"
        : roll < 0.3
          ? "boarded"
          : roll < 0.5
            ? "shutter"
            : roll < 0.63
              ? "open"
              : "glass";
      B.bay(
        b,
        P,
        bayL,
        bayR,
        gf - 1.3,
        e.nx,
        e.nz,
        kind,
        r,
        cx,
        cz,
        false,
        depthAvail,
      );
      if (r() < 0.75)
        B.shopSign(
          P,
          bayL + 0.1,
          bayR - 0.1,
          gf - 1.2,
          gf - 0.15,
          e.nx,
          e.nz,
          r,
          cx,
          cz,
        );
      if (r() < 0.4) B.awning(P, bayL, bayR, gf - 1.35, e.nx, e.nz, r, cx, cz);
    }
    M.storefronts.push({
      ax: e.ax,
      az: e.az,
      bx: e.bx,
      bz: e.bz,
      nx: e.nx,
      nz: e.nz,
      gf,
      lot,
    });
  }
  function buildCutLot(lot, r) {
    const B = M._bld,
      L = G.LAYOUT;
    const p = lot.poly,
      E = edges(p);
    const c = centroid(p),
      cx = c[0],
      cz = c[1];
    const ds = L.DISTRICT_STYLE[lot.district] || { minH: 15, maxH: 40 };
    let H = B.heightFor(lot, r);
    const area = Math.abs(M.polyArea(p)),
      th = thickness(p);
    // slender wedges stay low (real Broadway flatirons are 4–12 storeys); broad ones may rise
    H = Math.min(H, 14 + th * 4.2, lot.district === "midtown" ? 72 : 60);
    if (lot.district === "greenwich_village") H = Math.min(H, 26);
    H = Math.max(H, Math.min(ds.minH, 16));
    const style =
      lot.district === "greenwich_village"
        ? r() < 0.6
          ? "apartment"
          : "brownstone"
        : lot.district === "midtown" || lot.district === "financial_district"
          ? r() < 0.55
            ? "artdeco"
            : "office"
          : r() < 0.55
            ? "office"
            : "apartment";
    const fmat = "facade/" + style + "/" + B.chunkVariant(style, cx, cz);
    const tint = r.pick(B.TINTS[style]);
    const burnK = lot.burnt ? 0.52 : 1;
    const gf = 4.8;
    const kinds = E.map((e) =>
      edgeKind(e.ax, e.az, e.bx, e.bz, e.nx, e.nz, lot),
    );
    // ---- ground floor
    // (stone only: brick_red would add a material → a draw call per chunk)
    const pilMat = "stone_limestone",
      pilC = r() < 0.5 ? [0.9, 0.86, 0.8] : [0.78, 0.6, 0.5];
    const ruined = r() < 0.22;
    if (ruined) lot.ruined = true;
    E.forEach((e, i) => {
      if (kinds[i] === "f" && e.len >= 3.2)
        storeEdge(
          e,
          gf,
          r,
          cx,
          cz,
          lot,
          pilMat,
          pilC,
          ruined,
          Math.min(3.2, th * 1.3),
        );
      else
        M.wall(
          M.buf(pilMat, cx, cz),
          e.ax,
          e.az,
          e.bx,
          e.bz,
          0,
          gf,
          0,
          e.len / 3,
          0,
          gf / 3,
          M.mulc(pilC, 0.62 * burnK),
          M.mulc(pilC, burnK),
        );
    });
    // ---- upper storeys: façade atlas on street edges, blank brick on party walls, weathering gradient
    const tile = B.TILE();
    const hsh = M.hash(Math.round(cx * 3), Math.round(cz * 3), 17);
    const vBase = gf - Math.floor(hsh * M.FACADE.floors) * M.FACADE.floorH;
    const topC = M.mulc(tint, 0.92 * burnK),
      midC = M.mulc(tint, burnK),
      lowC = M.mulc(tint, 0.55 * burnK);
    const colAt = (y) =>
      y <= 7
        ? M.mixc(lowC, midC, M.clamp((y - 1) / 6, 0, 1))
        : y <= 20
          ? M.mixc(M.mulc(midC, 0.84), midC, (y - 7) / 13)
          : M.mixc(midC, topC, M.clamp((y - 20) / 60, 0, 1));
    const bf = M.buf(fmat, cx, cz),
      bb = M.buf("brick_brown", cx, cz);
    const cuts = [gf];
    for (const yc of [7, 20]) if (yc > gf + 0.5 && yc < H - 0.5) cuts.push(yc);
    cuts.push(H);
    E.forEach((e, i) => {
      M.wallLog.push({
        ax: e.ax,
        az: e.az,
        bx: e.bx,
        bz: e.bz,
        nx: e.nx,
        nz: e.nz,
        y0: gf,
        y1: H,
        f: kinds[i],
        lot,
        top: true,
      });
      if (kinds[i] === "f") {
        const uo =
          Math.floor(M.hash(e.ax, e.az, 23) * M.FACADE.bays) / M.FACADE.bays;
        for (let q = 0; q < cuts.length - 1; q++)
          M.wall(
            bf,
            e.ax,
            e.az,
            e.bx,
            e.bz,
            cuts[q],
            cuts[q + 1],
            uo,
            uo + e.len / tile.w,
            (cuts[q] - vBase) / tile.h,
            (cuts[q + 1] - vBase) / tile.h,
            colAt(cuts[q]),
            colAt(cuts[q + 1]),
          );
      } else {
        const s = M.sc("brick_brown");
        M.wall(
          bb,
          e.ax,
          e.az,
          e.bx,
          e.bz,
          gf,
          H,
          0,
          e.len / s,
          gf / s,
          H / s,
          M.mulc(tint, 0.7 * burnK),
          M.mulc(tint, 0.95 * burnK),
        );
      }
    });
    // ---- trims: belt course over the shops, cornice with a stepped profile, parapet, roof
    const trim = M.buf("stone_limestone", cx, cz),
      tc = M.mulc(B.TRIM_C, 0.9 * burnK);
    for (const e of E) {
      const yaw = Math.atan2(e.ux, e.uz),
        mx = (e.ax + e.bx) / 2,
        mz = (e.az + e.bz) / 2;
      M.obox(
        trim,
        mx + e.nx * 0.12,
        gf - 0.08,
        mz + e.nz * 0.12,
        0.24,
        0.42,
        e.len + 0.24,
        yaw,
        { s: 2, c: M.mulc(tc, 0.85) },
      );
      if (!ruined) {
        M.obox(
          trim,
          mx + e.nx * 0.2,
          H - 0.95,
          mz + e.nz * 0.2,
          0.4,
          0.5,
          e.len + 0.4,
          yaw,
          { s: 2, c: M.mulc(tc, 0.85) },
        );
        M.obox(
          trim,
          mx + e.nx * 0.45,
          H - 0.45,
          mz + e.nz * 0.45,
          0.9,
          0.55,
          e.len + 0.9,
          yaw,
          { s: 2, c: tc, cb: M.mulc(tc, 0.7) },
        );
      }
      M.obox(
        trim,
        mx - e.nx * 0.15,
        H + 0.45,
        mz - e.nz * 0.15,
        0.3,
        0.9,
        e.len,
        yaw,
        { s: 2, c: tc },
      );
    }
    M.poly(M.buf("roof_tar", cx, cz), p, H + 0.02, {
      s: 4,
      c: [0.85, 0.83, 0.8],
      convex: true,
    });
    // ruined crown: broken parapet chunks & a shell hole or two on the long street face
    if (ruined) {
      const longest = E.reduce(
        (a, e, i) => (kinds[i] === "f" && e.len > a.len ? e : a),
        { len: 0 },
      );
      if (longest.len > 6 && M.shellHole)
        M.shellHole(
          longest.ax,
          longest.az,
          longest.bx,
          longest.bz,
          r.range(0.3, 0.7),
          r.range(8, Math.max(9, H - 4)),
          r.range(2, 4),
          r.range(2, 3.5),
          longest.nx,
          longest.nz,
        );
      if (longest.len > 6)
        M.rubblePile(
          longest.ax + (longest.bx - longest.ax) * 0.5 + longest.nx * 2.5,
          longest.az + (longest.bz - longest.az) * 0.5 + longest.nz * 2.5,
          r.range(1.8, 3.2),
          r.range(0.6, 1.3),
          r,
        );
    }
    // ---- rooftop: stair bulkhead, water tower on bigger roofs, vents
    const inner = M.insetPoly(p, Math.min(2.2, th * 0.45));
    const ib = M.polyBBox(inner);
    if (th > 3.2 && area > 90) {
      const bx0 = cx - 1.5,
        bz0 = cz - 1.7;
      if (M.inPoly(bx0, bz0, inner) && M.inPoly(bx0 + 3, bz0 + 3.5, inner)) {
        M.box(
          M.buf("brick_brown", cx, cz),
          bx0,
          H,
          bz0,
          bx0 + 3,
          H + 3,
          bz0 + 3.5,
          { s: 2.5, c: [0.8, 0.75, 0.7] },
        );
        M.box(
          M.buf("stone_limestone", cx, cz),
          bx0 - 0.1,
          H + 3,
          bz0 - 0.1,
          bx0 + 3.1,
          H + 3.2,
          bz0 + 3.6,
          { s: 3, c: [0.5, 0.5, 0.48] },
        );
      }
      if (r() < 0.5 && M.waterTower && H < 60) {
        for (let k = 0; k < 6; k++) {
          const tx = r.range(ib.x0 + 2.2, ib.x1 - 2.2),
            tz = r.range(ib.z0 + 2.2, ib.z1 - 2.2);
          if (
            M.inPoly(tx, tz, inner) &&
            Math.hypot(tx - cx, tz - cz) > 3.5 &&
            M.distToPoly(tx, tz, p) > 2.4
          ) {
            M.waterTower(tx, H, tz, r.range(0.8, 1.05), r() < 0.12);
            break;
          }
        }
      }
      const vb = M.buf("metal_painted", cx, cz, "detail");
      for (let k = 0; k < 3; k++) {
        const vx = r.range(ib.x0 + 1, ib.x1 - 1),
          vz = r.range(ib.z0 + 1, ib.z1 - 1);
        if (M.inPoly(vx, vz, inner))
          M.box(
            vb,
            vx - 0.5,
            H,
            vz - 0.4,
            vx + 0.5,
            H + r.range(0.6, 1.4),
            vz + 0.4,
            { s: 1.5, c: [0.5, 0.5, 0.48] },
          );
      }
    }
    // ---- colliders: exact wall ring + solid interior slices (for LOS / the impostor)
    // (a party wall shared by two slices of the same block gets ONE collider, centred on the shared edge and
    //  as tall as the taller neighbour — the second lot extends the first instead of stacking a twin on it)
    for (const e of E) {
      const k = edgeKey(e);
      const prev = wallCols.get(k);
      if (prev) {
        if (H > prev.maxY) prev.maxY = H;
        prev.minY = 0;
        continue;
      }
      const shared = kinds[E.indexOf(e)] === "b";
      const off = shared ? 0 : 0.35,
        w = shared ? 1.2 : 0.7;
      const mx = (e.ax + e.bx) / 2 - e.nx * off,
        mz = (e.az + e.bz) / 2 - e.nz * off;
      const c = M.ocol(mx, mz, w, e.len, 0, H, Math.atan2(e.ux, e.uz), {
        tag: "building_wall",
        surface: "concrete",
        walkable: false,
      });
      wallCols.set(k, c);
    }
    // solid interior (LOS / "inside a building" tests): ≤4 oriented strips along the longest edge, each the
    // largest rectangle between the chords at its two ends (convex lot → the strip is fully inside)
    {
      const e0 = E.reduce((a, e) => (e.len > a.len ? e : a), E[0]);
      const ux = e0.ux,
        uz = e0.uz,
        wx = -e0.nx,
        wz = -e0.nz; // along the edge / inward
      const ox = e0.ax,
        oz = e0.az;
      let s1 = 0;
      for (const q of p) s1 = Math.max(s1, (q[0] - ox) * wx + (q[1] - oz) * wz);
      const chord = (sv) => {
        let t0 = 1e9,
          t1 = -1e9;
        const px = ox + wx * sv,
          pz = oz + wz * sv;
        for (let i = 0; i < p.length; i++) {
          const a = p[i],
            b = p[(i + 1) % p.length];
          const fa = (a[0] - px) * wx + (a[1] - pz) * wz,
            fb = (b[0] - px) * wx + (b[1] - pz) * wz;
          if (fa > 0 === fb > 0 || fa === fb) continue;
          const k = fa / (fa - fb),
            ix = a[0] + (b[0] - a[0]) * k,
            iz = a[1] + (b[1] - a[1]) * k;
          const t = (ix - ox) * ux + (iz - oz) * uz;
          if (t < t0) t0 = t;
          if (t > t1) t1 = t;
        }
        return [t0, t1];
      };
      const n = Math.max(1, Math.min(4, Math.ceil(s1 / 6)));
      for (let k = 0; k < n; k++) {
        const sa = (s1 * k) / n + (k === 0 ? 0.4 : 0),
          sb = (s1 * (k + 1)) / n - (k === n - 1 ? 0.4 : 0);
        if (sb - sa < 0.6) continue;
        const ca = chord(sa + 0.01),
          cb = chord(sb - 0.01);
        const t0 = Math.max(ca[0], cb[0]) + 0.3,
          t1 = Math.min(ca[1], cb[1]) - 0.3;
        if (t1 - t0 < 0.6) continue;
        const tm = (t0 + t1) / 2,
          sm = (sa + sb) / 2;
        M.ocol(
          ox + ux * tm + wx * sm,
          oz + uz * tm + wz * sm,
          t1 - t0,
          sb - sa,
          0,
          H,
          Math.atan2(-uz, ux),
          { tag: "building", surface: "concrete" },
        );
      }
    }
    // ---- far impostor (polygon prism in the imp layer)
    const imp = M.buf("my/farfacade", cx, cz, "imp");
    const it = M.mulc(B.IMP_TINT.commercial, 0.9 + M.hash(cx, cz, 7) * 0.2);
    for (const e of E)
      M.wall(
        imp,
        e.ax,
        e.az,
        e.bx,
        e.bz,
        0,
        H,
        0,
        e.len / tile.w,
        0,
        H / tile.h,
        M.mulc(it, 0.7),
        it,
      );
    M.poly(imp, p, H, { s: 100, c: M.mulc(it, 0.45), convex: true });
    return { h: H };
  }

  /** Build every claimed block's polygon lots (called at the end of M.buildCity). */
  M.buildCutBlocks = async function (yieldFn, sliceMs) {
    const lots = planPieces();
    M.cutLots = lots;
    let t = performance.now(),
      n = 0;
    for (const lot of lots) {
      if (yieldFn && performance.now() - t > (sliceMs || 120)) {
        await yieldFn(1);
        t = performance.now();
      }
      const r = M.rng(
        "cutlot" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      const rw = M.rng(
        "cutwx" + Math.round(lot.x0 * 10) + "," + Math.round(lot.z0 * 10),
      );
      lot.dirt = rw.range(0.7, 1.3);
      lot.burnt =
        rw() < 0.2 &&
        !M._bld.nearSettlement((lot.x0 + lot.x1) / 2, (lot.z0 + lot.z1) / 2);
      lot.shopSoot = lot.burnt || rw() < 0.3;
      M.curLot = lot;
      try {
        const res = buildCutLot(lot, r);
        lot.h = res.h;
        n++;
      } catch (e) {
        G.reportError("map:cutlot", e);
      }
      M.curLot = null;
    }
    // self-check: a polygon lot must never overlap a generic rect building (blocks are claimed whole)
    let overlap = 0;
    for (const lot of lots)
      for (const g of M.lots || []) {
        if (
          g.x1 <= lot.x0 ||
          g.x0 >= lot.x1 ||
          g.z1 <= lot.z0 ||
          g.z0 >= lot.z1
        )
          continue;
        const c = M.clipRect(lot.poly, g.x0, g.z0, g.x1, g.z1);
        if (c && Math.abs(M.polyArea(c)) > 1) overlap++;
      }
    if (overlap)
      console.warn("[map] cut lots overlapping generic lots:", overlap);
    return { wedge: n, cutBlocks: claimed.length, cutOverlapGeneric: overlap };
  };
})();
