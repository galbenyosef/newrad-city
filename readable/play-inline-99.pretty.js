/* src/map/56_dungeons.js */
/* =====================================================================
 * NEW RAD CITY — MAP MODULE · 56 DUNGEONS — street side
 * The street doors of the six dungeons (56_dungeons_interior.js) on
 * generic buildings of the right district: M.pickDungeonEntrance(D, used)
 * picks a street face of a built lot near D.target (clear 1–5 m apron,
 * real sidewalk + street beyond, away from sites / subway stairs /
 * blockades), M.dungeonStreetDoor(D, E) builds the stone surround, door
 * leaves, name sign ('my/dngsigns', 55_dungeon_kit.js), caged lamp and
 * light pool, and returns {outside, doorPos, yawOut}. The door links, the
 * cells and the LOCATIONS live in 56_dungeons_interior.js.
 * ===================================================================== */
(function () {
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
  function streetDoor(D, E) {
    const { x, z, nx, nz } = E;
    const rx = nz,
      rz = -nx; // right-hand direction when facing the door from the street
    const y0 = G.world.terrainHeight(x + nx * 1.5, z + nz * 1.5);
    const fb = M.buf(D.frame || "stone_limestone", x, z);
    const W = D.metro ? 4.2 : 3.0,
      H = D.metro ? 3.6 : 3.4;
    const P = (t, off, y) => [x + rx * t + nx * off, y, z + rz * t + nz * off];
    // stone surround (covers whatever storefront bay was there)
    M.quad(
      fb,
      P(-W / 2, 0.05, y0),
      P(W / 2, 0.05, y0),
      P(W / 2, 0.05, y0 + H),
      P(-W / 2, 0.05, y0 + H),
      [nx, 0, nz],
      [0, 0, W / 2, 0, W / 2, H / 2, 0, H / 2],
      [0.55, 0.53, 0.5],
      [0.75, 0.72, 0.68],
    );
    for (const s of [-1, 1]) {
      const q = P(s * (W / 2 - 0.25), 0.2, y0);
      M.box(
        fb,
        q[0] - 0.25,
        y0,
        q[2] - 0.25,
        q[0] + 0.25,
        y0 + H,
        q[2] + 0.25,
        { s: 2, c: [0.72, 0.7, 0.66] },
      );
    }
    {
      const a = P(-W / 2 - 0.1, 0.1, y0 + H - 0.4),
        c = P(W / 2 + 0.1, 0.4, y0 + H);
      M.box(
        fb,
        Math.min(a[0], c[0]),
        a[1],
        Math.min(a[2], c[2]),
        Math.max(a[0], c[0]),
        c[1],
        Math.max(a[2], c[2]),
        { s: 2, c: [0.78, 0.76, 0.7] },
      );
    }
    // ---- doorway: projecting stone architrave (jambs, lintel, keystone), transom, panelled leaves, threshold.
    // The jambs project 0.36 m so the leaves read as set back in a reveal; the lamp + sign mark it from the street.
    const yawF = Math.atan2(nx, nz); // obox local +Z = outward normal, local +X = r
    const OB = (b, t, off, yc, sx, sy, sz, o) =>
      M.obox(
        b,
        x + rx * t + nx * off,
        yc,
        z + rz * t + nz * off,
        sx,
        sy,
        sz,
        yawF,
        o,
      );
    const dw = D.metro ? 3.0 : 1.9,
      dh = D.metro ? 2.8 : 2.55;
    const fc = [0.8, 0.77, 0.72],
      fcD = [0.55, 0.53, 0.5];
    if (!D.metro) {
      for (const sd of [-1, 1])
        OB(
          fb,
          sd * (dw / 2 + 0.2),
          0.18,
          y0 + (dh + 0.45) / 2,
          0.4,
          dh + 0.45,
          0.36,
          { s: 1.5, cb: fcD, ct: fc, skip: 8 },
        );
      OB(fb, 0, 0.3, y0 + H - 0.2, 0.46, 0.62, 0.5, {
        s: 1,
        c: [0.86, 0.83, 0.78],
        skip: 8,
      }); // keystone
      OB(fb, 0, 0.24, y0 + dh + 0.47, dw + 0.9, 0.06, 0.44, { s: 1, c: fcD }); // lintel soffit / impost line
    }
    // threshold slab (low enough to walk over)
    OB(M.buf("granite", x, z), 0, 0.3, y0 + 0.03, dw + 0.5, 0.06, 0.55, {
      s: 1.5,
      c: [0.62, 0.6, 0.57],
      skip: 8,
    });
    // dark reveal behind the leaves (the jambs' inner faces are the sides of the recess)
    const dk = M.buf(D.metro ? "rust" : "wood_planks", x, z);
    const lc =
      D.faction === "raiders"
        ? [0.45, 0.32, 0.25]
        : D.faction === "robots"
          ? [0.3, 0.26, 0.2]
          : [0.32, 0.3, 0.28];
    // transom light over the door (dusty glass on a dark backing, with a bar)
    const tg = M.buf("glass_dirty", x, z);
    M.quad(
      tg,
      P(-dw / 2, 0.07, y0 + dh + 0.05),
      P(dw / 2, 0.07, y0 + dh + 0.05),
      P(dw / 2, 0.07, y0 + dh + 0.44),
      P(-dw / 2, 0.07, y0 + dh + 0.44),
      [nx, 0, nz],
      [0, 0, 1, 0, 1, 0.25, 0, 0.25],
      [0.1, 0.1, 0.09],
      [0.16, 0.16, 0.15],
    );
    const db = M.buf("metal_painted", x, z, "detail");
    OB(db, 0, 0.1, y0 + dh + 0.025, dw + 0.02, 0.07, 0.08, {
      s: 1,
      c: [0.18, 0.17, 0.16],
    });
    for (const sd of [-1, 1])
      OB(db, (sd * dw) / 4, 0.1, y0 + dh + 0.25, 0.04, 0.4, 0.04, {
        s: 1,
        c: [0.18, 0.17, 0.16],
      });
    // two leaves: base sheet + raised panels + kick plate + pull handles; raiders plate one leaf with scrap
    for (const sd of [-1, 1]) {
      const t0 = sd < 0 ? -dw / 2 : 0.02,
        t1 = sd < 0 ? -0.02 : dw / 2,
        tm = (t0 + t1) / 2,
        lw = t1 - t0;
      M.quad(
        dk,
        P(t0, 0.09, y0),
        P(t1, 0.09, y0),
        P(t1, 0.09, y0 + dh),
        P(t0, 0.09, y0 + dh),
        [nx, 0, nz],
        [0, 0, lw, 0, lw, 2, 0, 2],
        M.mulc(lc, 0.7),
        lc,
      );
      if (D.metro) continue;
      for (const [ya, yb] of [
        [0.45, 1.25],
        [1.45, dh - 0.2],
      ])
        OB(dk, tm, 0.115, y0 + (ya + yb) / 2, lw - 0.26, yb - ya, 0.05, {
          s: 1,
          cb: M.mulc(lc, 0.8),
          ct: M.mulc(lc, 1.1),
          skip: 8,
        });
      OB(db, tm, 0.105, y0 + 0.18, lw - 0.1, 0.3, 0.03, {
        s: 1,
        c: [0.42, 0.38, 0.3],
      }); // kick plate
      OB(db, sd * 0.16, 0.17, y0 + 1.15, 0.04, 0.34, 0.05, {
        s: 1,
        c: [0.62, 0.55, 0.38],
      }); // pull
      if (D.faction === "raiders" && sd > 0)
        OB(
          M.buf("rust", x, z, "detail"),
          tm + 0.04,
          0.16,
          y0 + 1.35,
          lw * 0.9,
          1.3,
          0.03,
          { s: 1.2, c: [0.6, 0.45, 0.35], roll: 0.04 },
        );
    }
    // ---- faction dressing beside the doorway (never in the 1–5 m apron in front of the leaves)
    const side = (sd, off) => [
      x + rx * sd * (W / 2 + 0.95) + nx * off,
      z + rz * sd * (W / 2 + 0.95) + nz * off,
    ];
    if (D.faction === "raiders") {
      // sandbag breastwork on one side, a scrap-metal barrel on the other
      const sbb = M.buf("fabric", x, z, "detail");
      const q = side(-1, 0.75);
      for (let k = 0; k < 3; k++)
        for (let i = 0; i < 3 - k; i++) {
          const t = (i - (2 - k) / 2) * 0.62;
          M.obox(
            sbb,
            q[0] + rx * t,
            y0 + 0.14 + k * 0.26,
            q[1] + rz * t,
            0.6,
            0.28,
            0.42,
            yawF + (k % 2 ? 0.08 : -0.06),
            { s: 1, c: [0.55, 0.5, 0.38] },
          );
        }
      M.ocol(q[0], q[1], 1.9, 0.5, y0, y0 + 0.8, yawF, {
        tag: "barrier",
        surface: "fabric",
      });
      const q2 = side(1, 0.6);
      M.cyl(
        M.buf("rust", x, z, "detail"),
        q2[0],
        y0,
        q2[1],
        0.3,
        0.3,
        0.9,
        10,
        { c: [0.55, 0.38, 0.28], capTop: true },
      );
      M.box3(q2[0] - 0.3, y0, q2[1] - 0.3, q2[0] + 0.3, y0 + 0.9, q2[1] + 0.3, {
        tag: "barrel",
        surface: "metal",
      });
    } else if (D.faction === "robots") {
      // brass plaque on the pier + a dead security camera on a bracket
      const q = [
        x + rx * (W / 2 + 0.55) + nx * 0.06,
        z + rz * (W / 2 + 0.55) + nz * 0.06,
      ];
      M.obox(
        M.buf("metal_painted", x, z, "detail"),
        q[0],
        y0 + 1.6,
        q[1],
        0.7,
        0.5,
        0.03,
        yawF,
        { s: 1, c: [0.7, 0.58, 0.3] },
      );
      const c = P(-W / 2 - 0.2, 0.35, y0 + H + 0.2);
      M.obox(db, c[0], c[1], c[2], 0.18, 0.16, 0.36, yawF + 0.5, {
        s: 1,
        c: [0.32, 0.32, 0.3],
        pitch: 0.35,
      });
    } else if (D.key === "dng_chelsea") {
      // the hotel's tattered canopy (posts at the kerb side of the apron edge, clear of the walk-in line)
      const cb = M.buf("fabric@ds", x, z, "detail");
      const ya = y0 + H - 0.1,
        yb = y0 + H - 0.55,
        dep = 2.4,
        cw = dw + 1.4;
      M.quad(
        cb,
        P(-cw / 2, 0.45, ya),
        P(cw / 2, 0.45, ya),
        P(cw / 2, dep, yb),
        P(-cw / 2 + 0.6, dep * 0.7, yb + 0.1),
        [nx * 0.3, 0.95, nz * 0.3],
        [0, 0, 1, 0, 1, 1, 0, 1],
        [0.52, 0.2, 0.16],
      );
      const fr = M.buf("rust", x, z, "detail");
      for (const sd of [-1, 1]) {
        const a = P((sd * cw) / 2, dep, y0),
          c = P((sd * cw) / 2, 0.45, ya);
        M.beam(fr, a[0], yb, a[2], c[0], c[1], c[2], 0.04, 0.04, {
          c: [0.35, 0.3, 0.26],
        });
      }
    } else if (D.faction === "creatures") {
      // pump-house valve wheel + a green slick seeping from under the door
      const q = side(1, 0.2);
      M.cyl(M.buf("rust", x, z, "detail"), q[0], y0, q[1], 0.09, 0.09, 1.0, 6, {
        c: [0.45, 0.33, 0.25],
      });
      M.obox(
        M.buf("rust", x, z, "detail"),
        q[0],
        y0 + 1.05,
        q[1],
        0.55,
        0.55,
        0.05,
        yawF,
        { s: 1, c: [0.55, 0.2, 0.15] },
      );
      M.decal(
        M.buf("my/markings", x, z, "fine"),
        x + nx * 0.9,
        y0 + 0.016,
        z + nz * 0.9,
        1.4,
        2.2,
        Math.atan2(nx, nz),
        M.MARK.PUDDLE,
      );
    }
    // name sign above the door
    const i = Math.max(0, M.DSIGNS.indexOf(D.sign)),
      uv = M.cellUV(i, 2, 16);
    const sw = D.metro ? 3.2 : 2.6,
      sy = y0 + H + 0.45;
    M.quad(
      M.buf("my/dngsigns", x, z),
      P(-sw / 2, 0.42, sy - sw / 8),
      P(sw / 2, 0.42, sy - sw / 8),
      P(sw / 2, 0.42, sy + sw / 8),
      P(-sw / 2, 0.42, sy + sw / 8),
      [nx, 0, nz],
      [uv[0], uv[1], uv[2], uv[1], uv[2], uv[3], uv[0], uv[3]],
    );
    // caged lamp over the door (lit: someone lives here) + a pool of light on the sidewalk
    const lp = P(0, 0.5, y0 + H + 1.1);
    M.box(
      M.buf("emissive_window@lamp", x, z, "detail"),
      lp[0] - 0.12,
      lp[1] - 0.12,
      lp[2] - 0.12,
      lp[0] + 0.12,
      lp[1] + 0.12,
      lp[2] + 0.12,
      { s: 1 },
    );
    M.lightPool(
      M.buf("my/lightfx", x, z, "detail"),
      x + nx * 1.8,
      y0 + 0.05,
      z + nz * 1.8,
      2.2,
      2.2,
      [0.12, 0.1, 0.07],
    );
    if (D.metro) {
      // green globe lamps like every New York subway entrance
      for (const s of [-1, 1]) {
        const g = P(s * (W / 2 + 0.4), 0.6, y0);
        M.cyl(
          M.buf("metal_painted", x, z, "detail"),
          g[0],
          y0,
          g[2],
          0.09,
          0.07,
          2.4,
          6,
          { c: [0.2, 0.28, 0.22] },
        );
        M.cyl(
          M.buf("neon_green@lampg", x, z),
          g[0],
          y0 + 2.4,
          g[2],
          0.2,
          0.2,
          0.34,
          10,
          { capTop: true },
        );
      }
    }
    // doormat of debris & a worn path
    M.decal(
      M.buf("my/markings", x, z, "fine"),
      x + nx * 1.4,
      y0 + 0.014,
      z + nz * 1.4,
      2.4,
      1.6,
      Math.atan2(nx, nz),
      M.MARK.DIRT,
    );
    return {
      outside: new THREE.Vector3(x + nx * 1.6, y0, z + nz * 1.6),
      doorPos: new THREE.Vector3(x + nx * 0.6, y0 + 1.3, z + nz * 0.6),
      yawOut: Math.atan2(-nx, -nz) + PI,
    };
  }
  M.pickDungeonEntrance = pickEntrance;
  M.dungeonStreetDoor = streetDoor;
})();
