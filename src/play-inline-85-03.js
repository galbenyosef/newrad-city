// play-inline-85 03 — math
// Lines 424-768 of readable/play-inline-85.pretty.js (statement-aligned).
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
