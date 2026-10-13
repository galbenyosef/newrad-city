// play-inline-96 01 — math
// Lines 28-353 of readable/play-inline-96.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const M = G.map._;

  const LAYER = "cryo";
  let O = { x: 4000, y: 0, z: 0 };
  const A = (M.cryoAnchors = M.cryoAnchors || {}); // anchors (local coords, converted to world at the end; ext_* are world)
  M.anchors = M.anchors || {};
  const slideDoors = [];
  M.slideDoors = slideDoors;
  const LOCK_ID = "q_cryo_blast_door";
  M.CRYO_LOCK_ID = LOCK_ID;

  // Materials / colours: painted concrete, steel, enamel; cool light, orange hazard accents
  const WALL = "cryo_wall",
    FLOOR = "tile_cryo",
    CEIL = "metal_panel";
  const C_WALL = [0.98, 1.02, 1.06],
    C_WALL_LOW = [0.5, 0.56, 0.6],
    C_FLOOR = [0.62, 0.66, 0.68],
    C_CEIL = [0.55, 0.58, 0.62];
  const C_ORANGE = [1.25, 0.55, 0.22],
    C_STEEL = [0.62, 0.64, 0.66],
    C_DARK = [0.22, 0.24, 0.26],
    C_FROST = [0.74, 0.8, 0.86];

  const b = (key) => M.buf(key, 0, 0, LAYER);
  /** Collider in local cell coordinates. */
  function CB(x0, y0, z0, x1, y1, z1, opts) {
    return M.box3(
      O.x + Math.min(x0, x1),
      (O.y || 0) + y0,
      O.z + Math.min(z0, z1),
      O.x + Math.max(x0, x1),
      (O.y || 0) + y1,
      O.z + Math.max(z0, z1),
      Object.assign({ tag: "cryo", surface: "metal" }, opts || {}),
    );
  }
  const sign = (t, x, y, z, nx, nz, w) =>
    M.cryoSign(t, x, y, z, nx, nz, w, LAYER);
  const logo = (x, y, z, nx, ny, nz, s) =>
    M.cryoLogo(x, y, z, nx, ny, nz, s, LAYER);

  // -------------------------------------------------------------------
  // Room builder (local coords). doors: [{side, a, b, h, y, frame}]
  // (a/b along x for n/s walls, along z for e/w walls)
  // -------------------------------------------------------------------
  function room(x0, z0, x1, z1, y0, h, o) {
    o = o || {};
    const doors = o.doors || [];
    const wall = o.wall || WALL,
      floor = o.floor || FLOOR,
      ceil = o.ceil || CEIL;
    const sW = M.sc(wall);
    if (o.noFloor !== true) {
      M.quad(
        b(floor),
        [x0, y0, z1],
        [x1, y0, z1],
        [x1, y0, z0],
        [x0, y0, z0],
        [0, 1, 0],
        [x0 / 2, z1 / 2, x1 / 2, z1 / 2, x1 / 2, z0 / 2, x0 / 2, z0 / 2],
        o.floorC || C_FLOOR,
      );
      if (y0 > 0.01) CB(x0, y0 - 0.3, z0, x1, y0, z1, { surface: "concrete" });
    }
    if (o.noCeil !== true)
      M.quad(
        b(ceil),
        [x0, y0 + h, z0],
        [x1, y0 + h, z0],
        [x1, y0 + h, z1],
        [x0, y0 + h, z1],
        [0, -1, 0],
        [
          x0 / 2.5,
          z0 / 2.5,
          x1 / 2.5,
          z0 / 2.5,
          x1 / 2.5,
          z1 / 2.5,
          x0 / 2.5,
          z1 / 2.5,
        ],
        o.ceilC || C_CEIL,
      );
    const sides = {
      n: [x0, z0, x1, z0, 0, 1],
      s: [x1, z1, x0, z1, 0, -1],
      w: [x0, z1, x0, z0, 1, 0],
      e: [x1, z0, x1, z1, -1, 0],
    };
    for (const k of ["n", "s", "w", "e"]) {
      if (o.skip && o.skip.includes(k)) continue;
      const [ax, az, bx, bz, nx, nz] = sides[k];
      const len = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / len,
        uz = (bz - az) / len;
      const gaps = doors
        .filter((d) => d.side === k)
        .map((d) => {
          const ta =
            k === "n"
              ? d.a - x0
              : k === "s"
                ? x1 - d.b
                : k === "w"
                  ? z1 - d.b
                  : d.a - z0;
          return {
            t0: ta,
            t1: ta + (d.b - d.a),
            h: d.h || 2.6,
            y: d.y || y0,
            frame: d.frame !== false,
          };
        })
        .sort((p, q) => p.t0 - q.t0);
      let t = 0;
      const segs = [];
      for (const g of gaps) {
        if (g.t0 > t) segs.push([t, g.t0, y0, y0 + h]);
        if (g.y > y0) segs.push([g.t0, g.t1, y0, g.y]);
        if (g.y + g.h < y0 + h) segs.push([g.t0, g.t1, g.y + g.h, y0 + h]);
        t = g.t1;
      }
      if (t < len) segs.push([t, len, y0, y0 + h]);
      const wb = b(wall);
      for (const [s0, s1, ya, yb] of segs) {
        const px = ax + ux * s0,
          pz = az + uz * s0,
          qx = ax + ux * s1,
          qz = az + uz * s1;
        const dx = qx - px,
          dz = qz - pz;
        const fl = dz * nx + -dx * nz;
        const cL = ya <= y0 + 0.01 ? C_WALL_LOW : C_WALL;
        if (fl > 0)
          M.wall(
            wb,
            px,
            pz,
            qx,
            qz,
            ya,
            yb,
            s0 / sW,
            s1 / sW,
            (ya - y0) / sW,
            (yb - y0) / sW,
            cL,
            C_WALL,
          );
        else
          M.wall(
            wb,
            qx,
            qz,
            px,
            pz,
            ya,
            yb,
            s1 / sW,
            s0 / sW,
            (ya - y0) / sW,
            (yb - y0) / sW,
            cL,
            C_WALL,
          );
        const cx0 = Math.min(px, qx) - (nx > 0 ? 0.3 : 0),
          cx1 = Math.max(px, qx) + (nx < 0 ? 0.3 : 0);
        const cz0 = Math.min(pz, qz) - (nz > 0 ? 0.3 : 0),
          cz1 = Math.max(pz, qz) + (nz < 0 ? 0.3 : 0);
        if (!o.noColl) CB(cx0, ya, cz0, cx1, yb, cz1, { surface: "concrete" });
        if (ya <= y0 + 0.01) {
          // dark wainscot band + kick plate (1960s institutional two-tone)
          const bb = b("metal_painted");
          M.quad(
            bb,
            [px + nx * 0.05, y0, pz + nz * 0.05],
            [qx + nx * 0.05, y0, qz + nz * 0.05],
            [qx + nx * 0.05, y0 + 0.2, qz + nz * 0.05],
            [px + nx * 0.05, y0 + 0.2, pz + nz * 0.05],
            [nx, 0, nz],
            [0, 0, (s1 - s0) / 2, 0, (s1 - s0) / 2, 0.1, 0, 0.1],
            C_DARK,
          );
          M.quad(
            bb,
            [px + nx * 0.05, y0 + 0.2, pz + nz * 0.05],
            [qx + nx * 0.05, y0 + 0.2, qz + nz * 0.05],
            [qx, y0 + 0.2, qz],
            [px, y0 + 0.2, pz],
            [0, 1, 0],
            [0, 0, 1, 0, 1, 0.05, 0, 0.05],
            C_DARK,
          );
          const stripe = Math.min(yb, y0 + 1.25);
          M.quad(
            b("metal_painted"),
            [px + nx * 0.02, stripe - 0.08, pz + nz * 0.02],
            [qx + nx * 0.02, stripe - 0.08, qz + nz * 0.02],
            [qx + nx * 0.02, stripe, qz + nz * 0.02],
            [px + nx * 0.02, stripe, pz + nz * 0.02],
            [nx, 0, nz],
            [0, 0, 1, 0, 1, 1, 0, 1],
            C_ORANGE,
          );
          if (!o.noRibs)
            for (
              let rt = Math.ceil(s0 / 3.6) * 3.6 + 1.8;
              rt < s1 - 0.3;
              rt += 3.6
            ) {
              const rx = ax + ux * rt,
                rz = az + uz * rt;
              M.box(bb, rx - 0.12, y0, rz - 0.12, rx + 0.12, yb, rz + 0.12, {
                s: 1,
                c: [0.5, 0.54, 0.58],
                skip: 8,
              });
            }
        }
      }
      for (const g of gaps) {
        if (!g.frame) continue;
        const fb = b("metal_painted");
        const pA = [ax + ux * g.t0, az + uz * g.t0],
          pB = [ax + ux * g.t1, az + uz * g.t1];
        const th = 0.28;
        for (const P of [pA, pB]) {
          M.box(
            fb,
            P[0] - th / 2,
            g.y,
            P[1] - th / 2,
            P[0] + th / 2,
            g.y + g.h + 0.25,
            P[1] + th / 2,
            { s: 1, c: C_STEEL },
          );
          M.box(
            fb,
            P[0] - th / 2 - 0.02,
            g.y + 0.15,
            P[1] - th / 2 - 0.02,
            P[0] + th / 2 + 0.02,
            g.y + 0.45,
            P[1] + th / 2 + 0.02,
            { s: 1, c: C_ORANGE },
          );
        }
        M.box(
          fb,
          Math.min(pA[0], pB[0]) - th / 2,
          g.y + g.h,
          Math.min(pA[1], pB[1]) - th / 2,
          Math.max(pA[0], pB[0]) + th / 2,
          g.y + g.h + 0.3,
          Math.max(pA[1], pB[1]) + th / 2,
          { s: 1, c: C_STEEL },
        );
      }
    }
    // ceiling tubes — a dying facility: a share of them are dead (dark housings only)
    if (!o.noLights && o.noCeil !== true) {
      const rr = M.rng("c9lights" + x0 + "," + z0);
      const step = o.lightStep || 4;
      for (let x = x0 + step / 2; x < x1; x += step)
        for (let z = z0 + step / 2; z < z1; z += step) {
          if (x1 - x0 < 5 && Math.abs(x - (x0 + x1) / 2) > 0.5) continue;
          const dead =
            rr() < (o.deadLights === undefined ? 0.35 : o.deadLights);
          if (!dead)
            M.box(
              b("emissive_window@lampw"),
              x - 0.6,
              y0 + h - 0.08,
              z - 0.12,
              x + 0.6,
              y0 + h - 0.01,
              z + 0.12,
              { s: 1, skip: 4 },
            );
          M.box(
            b("metal_painted"),
            x - 0.7,
            y0 + h - 0.05,
            z - 0.2,
            x + 0.7,
            y0 + h,
            z + 0.2,
            { s: 1, c: C_DARK, skip: 4 + 8 },
          );
        }
    }
    if (o.pipes) {
      const pb = b("metal_painted");
      const L1 = x1 - x0 > z1 - z0;
      for (const k of [0, 1]) {
        const off = 0.22 + k * 0.2,
          yy = y0 + h - 0.28 - k * 0.18;
        const col = k ? C_ORANGE : C_STEEL;
        if (L1) {
          M.pipe(pb, x0, yy, z0 + off, x1, yy, z0 + off, 0.07, 6, { c: col });
          M.pipe(pb, x0, yy, z1 - off, x1, yy, z1 - off, 0.07, 6, {
            c: k ? [0.55, 0.72, 0.85] : C_STEEL,
          });
        } else {
          M.pipe(pb, x0 + off, yy, z0, x0 + off, yy, z1, 0.07, 6, { c: col });
          M.pipe(pb, x1 - off, yy, z0, x1 - off, yy, z1, 0.07, 6, {
            c: k ? [0.55, 0.72, 0.85] : C_STEEL,
          });
        }
      }
    }
  }
  M.cryoRoom = room;

  // -------------------------------------------------------------------
  // Sliding doors (separate meshes, animated in update; open for the
  // player and for actors)
  // -------------------------------------------------------------------
