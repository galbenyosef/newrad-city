// play-inline-99 01 — lot
// Lines 14-149 of readable/play-inline-99.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;
  const PI = Math.PI;

  // ===================================================================
  // Street entrances on generic buildings
  // ===================================================================
  const ENTRY_KINDS = {
    commercial: 1,
    tenement: 1,
    apartment: 1,
    warehouse: 1,
    tower: 1,
    brownstone: 0.5,
  };
  /** Anything solid (rubble slabs, wrecks, barricades) in the 1–5 m in front of a candidate door? */
  function apronBlocked(x, z, nx, nz) {
    const rx = nz,
      rz = -nx;
    const cs = G.world.query(x - 7, z - 7, x + 7, z + 7);
    for (const c of cs) {
      if (c.maxY < 0.6 || c.minY > 2.2) continue; // sidewalks, kerbs, overhead signs
      for (const o of [1, 2.5, 4, 5])
        for (const u of [-1.2, 0, 1.2]) {
          if (
            G.world.pointInCollider(
              c,
              x + nx * o + rx * u,
              z + nz * o + rz * u,
              0.25,
            )
          )
            return true;
        }
    }
    return false;
  }
  /** Pick a street face of a built lot near target[] for the dungeon's front door. */
  function pickEntrance(D, used) {
    const L = G.LAYOUT;
    let best = null,
      bd = 1e9;
    for (const lot of M.lots || []) {
      if (
        !ENTRY_KINDS[lot.kind] ||
        lot.ruined ||
        lot.fallen ||
        lot.kind === "collapsed" ||
        lot.kind === "shell"
      )
        continue;
      if (D.district.indexOf(lot.district) < 0) continue;
      const fr = {
        n: lot.front.n || !!lot.faceN,
        s: lot.front.s || !!lot.faceS,
        e: lot.front.e,
        w: lot.front.w,
      };
      for (const k of ["n", "s", "e", "w"]) {
        const alongX = k === "n" || k === "s";
        if (!fr[k]) {
          // lots without flagged fronts (Brooklyn warehouses): accept a side that opens onto a street / sidewalk
          const tx = alongX
              ? (lot.x0 + lot.x1) / 2
              : k === "e"
                ? lot.x1 + 3
                : lot.x0 - 3,
            tz = alongX
              ? k === "s"
                ? lot.z1 + 3
                : lot.z0 - 3
              : (lot.z0 + lot.z1) / 2;
          const c = M.rasterAt(tx, tz);
          if (c !== M.RC.ROAD && c !== M.RC.RAISED) continue;
        }
        const span = alongX ? lot.x1 - lot.x0 : lot.z1 - lot.z0;
        if (span < 8) continue;
        const nx = k === "e" ? 1 : k === "w" ? -1 : 0,
          nz = k === "s" ? 1 : k === "n" ? -1 : 0;
        const x = alongX ? (lot.x0 + lot.x1) / 2 : k === "e" ? lot.x1 : lot.x0;
        const z = alongX
          ? k === "s"
            ? lot.z1
            : lot.z0
          : (lot.z0 + lot.z1) / 2;
        const ox = x + nx * 4,
          oz = z + nz * 4;
        // the door must open onto a real sidewalk with the street beyond (not a neighbouring lot / courtyard)
        const c4 = M.rasterAt(ox, oz),
          c9 = M.rasterAt(x + nx * 9, z + nz * 9);
        if (c4 !== M.RC.RAISED && c4 !== M.RC.ROAD) continue;
        if (c9 !== M.RC.ROAD && c9 !== M.RC.RAISED && c9 !== M.RC.PLAZA)
          continue;
        if (
          M.lots.some(
            (o) =>
              o !== lot &&
              ox > o.x0 - 0.5 &&
              ox < o.x1 + 0.5 &&
              oz > o.z0 - 0.5 &&
              oz < o.z1 + 0.5,
          )
        )
          continue;
        if (!L.isManhattan(ox, oz) && !L.isBrooklyn(ox, oz)) continue;
        if (L.siteAt(ox, oz, 20) || L.locationAt(ox, oz)) continue;
        if (
          (M.subwayEntrances || []).some(
            (e) => Math.hypot(e.cx - x, e.cz - z) < 25,
          )
        )
          continue;
        if (used.some((u) => Math.hypot(u.x - x, u.z - z) < 60)) continue;
        if (
          (M.blockades || []).some(
            (bk) => Math.hypot(bk.x - ox, bk.z - oz) < 22,
          )
        )
          continue;
        if (G.world.terrainHeight(ox, oz) < -0.5) continue;
        // strongly prefer a door whose apron is clear (a neighbour's façade spill / rubble heap must not bury it)
        const d =
          Math.hypot(x - D.target[0], z - D.target[1]) +
          (lot.kind === "brownstone" ? 20 : 0) +
          (apronBlocked(x, z, nx, nz) ? 400 : 0);
        if (d < bd) {
          bd = d;
          best = { lot, side: k, x, z, nx, nz };
        }
      }
    }
    return best;
  }
  /** Street door visuals: surround, door leaves, name sign, lamp. World coords, 'main'/'detail' layers. */
