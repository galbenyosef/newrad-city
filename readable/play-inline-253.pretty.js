/* src/poi_bridges/05_bridgekit.js */
/* =====================================================================
 * NEW RAD CITY — POI BRIDGES — 05_bridgekit.js
 * Structural steel & bridge-furniture helpers shared by the Queensboro
 * and Manhattan bridge builders (all geometry goes into a PF.batch):
 *   BK.laced(...)      built-up lattice column / strut (two channels +
 *                      zig-zag lacing on both faces) between two points
 *   BK.eyebars(...)    pin-connected eyebar chain (parallel flat bars)
 *   BK.deckSlab(...)   asphalt deck slab with curbs, lane paint, cracks
 *   BK.rail(...)       parapet railing with posts (+ colliders)
 *   BK.switchback(...) steel switch-back stair tower (step colliders)
 *   BK.lamp(...)       ornamental bridge lamp standard (+ glow)
 *   BK.sign(...)       enamel highway sign on a gantry
 *   BK.debris(...)     twisted hanging girders at a broken span end
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pbr) return;
  const PF = G._pbr;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const BK = (PF.bk = {});

  /**
   * Run fn() with geometry of batch b in a translated frame (ox,oy,oz) and every PF.col offset the same way,
   * so interiors can be authored in cell-local coordinates. Lib glows queued meanwhile are offset too.
   */
  BK.inFrame = function (b, ox, oy, oz, fn) {
    const prevM = b.M,
      prevOff = PF._off,
      g0 = PF.glows.length;
    b.frame(new THREE.Matrix4().makeTranslation(ox, oy, oz));
    PF._off = { x: ox, y: oy, z: oz };
    try {
      fn();
    } finally {
      b.frame(prevM);
      PF._off = prevOff;
      for (let i = g0; i < PF.glows.length; i++)
        PF.glows[i].pos.add(new THREE.Vector3(ox, oy, oz));
    }
  };

  /**
   * Built-up laced member between points a→c: two flange bars offset ±w/2 along `side`
   * (unit vector perpendicular to the member), depth d, with zig-zag lacing on both faces.
   * opts: {flange: thickness (0.22), lace: spacing (≈w), laceKey, noLace}
   */
  BK.laced = function (b, key, a, c, w, d, side, opts) {
    opts = opts || {};
    const ft = opts.flange || Math.max(0.16, w * 0.16);
    const dir = new THREE.Vector3().subVectors(c, a);
    const len = dir.length();
    if (len < 0.05) return;
    dir.normalize();
    const s = side.clone().normalize();
    const n = new THREE.Vector3().crossVectors(dir, s).normalize(); // face normal (depth direction)
    const off = (k) => s.clone().multiplyScalar(k);
    // flanges
    for (const sg of [-1, 1]) {
      const oa = a.clone().add(off(sg * (w / 2 - ft / 2))),
        oc = c.clone().add(off(sg * (w / 2 - ft / 2)));
      beamOriented(b, key, oa, oc, ft, d, s, 0.5);
    }
    if (opts.noLace || w < 0.35) return;
    const lk = opts.laceKey || key;
    const step = opts.lace || Math.max(0.6, w * 1.1);
    const nSeg = Math.max(1, Math.round(len / step));
    for (const face of [-1, 1]) {
      const fo = n.clone().multiplyScalar(face * (d / 2 - 0.03));
      let prev = null;
      for (let i = 0; i <= nSeg; i++) {
        const t = i / nSeg;
        const p = a
          .clone()
          .lerp(c, t)
          .add(off((i % 2 ? 1 : -1) * (w / 2 - ft)))
          .add(fo);
        if (prev) b.beam(lk, prev, p, 0.07, 0.07, { noAO: true, grime: 0.4 });
        prev = p;
      }
    }
  };
  // -------------------------------------------------------------------
  // Guastavino-style vaults (inward-facing parametric surfaces, tile UVs)
  // -------------------------------------------------------------------
  /**
   * Barrel vault along X (x0..x1) centred on zc, radius R (half-span), springing at ys, rise = R*sy.
   * Faces point down/inward. tile: metres per texture repeat.
   */
  BK.barrelX = function (b, key, x0, x1, zc, R, ys, sy, opts) {
    opts = opts || {};
    const tile = opts.tile || 2.4,
      len = x1 - x0,
      arc = Math.PI * R * (0.5 + 0.5 * (sy || 1));
    const g = PF.surface(
      (u, v, out) => {
        const a = u * Math.PI;
        out.set(
          x0 + v * len,
          ys + Math.sin(a) * R * (sy || 1),
          zc + Math.cos(a) * R,
        );
      },
      opts.nu || 14,
      Math.max(1, Math.round(len / 3)),
      {
        us: Math.max(1, Math.round(arc / tile)),
        vs: Math.max(1, Math.round(len / tile)),
      },
    );
    b.add(key, g, {
      uv: "keep",
      grime: opts.grime === undefined ? 0.25 : opts.grime,
      noAO: true,
    });
  };
  /** Barrel vault along Z (z0..z1) centred on xc. */
  BK.barrelZ = function (b, key, z0, z1, xc, R, ys, sy, opts) {
    opts = opts || {};
    const tile = opts.tile || 2.4,
      len = z1 - z0,
      arc = Math.PI * R * (0.5 + 0.5 * (sy || 1));
    const g = PF.surface(
      (u, v, out) => {
        const a = u * Math.PI;
        out.set(
          xc - Math.cos(a) * R,
          ys + Math.sin(a) * R * (sy || 1),
          z0 + v * len,
        );
      },
      opts.nu || 14,
      Math.max(1, Math.round(len / 3)),
      {
        us: Math.max(1, Math.round(arc / tile)),
        vs: Math.max(1, Math.round(len / tile)),
      },
    );
    b.add(key, g, {
      uv: "keep",
      grime: opts.grime === undefined ? 0.25 : opts.grime,
      noAO: true,
    });
  };
  /**
   * Groin vault over a rectangular bay (cx, cz, half sizes hx, hz): intersection of two barrels springing at ys,
   * crown at ys + rise. The diagonal groins read clearly with the herringbone tile.
   */
  BK.groin = function (b, key, cx, cz, hx, hz, ys, rise, opts) {
    opts = opts || {};
    const tile = opts.tile || 2.4,
      n = opts.n || 14;
    const g = PF.surface(
      (u, v, out) => {
        const a = 2 * u - 1,
          c = 2 * v - 1;
        const h = Math.max(
          Math.sqrt(Math.max(0, 1 - a * a)),
          Math.sqrt(Math.max(0, 1 - c * c)),
        );
        out.set(cx + a * hx, ys + rise * h, cz + c * hz);
      },
      n,
      n,
      {
        us: Math.max(1, Math.round((2 * hx) / tile)),
        vs: Math.max(1, Math.round((2 * hz) / tile)),
      },
    );
    b.add(key, g, {
      uv: "keep",
      grime: opts.grime === undefined ? 0.25 : opts.grime,
      noAO: true,
    });
  };
  /** Column with a flared tile capital (the Bridgemarket "mushroom" piers). */
  BK.vaultPier = function (b, key, capKey, x, z, ys, r, opts) {
    opts = opts || {};
    b.box(opts.baseKey || "granite_block", x, 0, z, r * 2.6, 0.6, r * 2.6, {
      seg: false,
      grime: 0.6,
    });
    b.cyl(key, x, 0.6, z, r, r * 1.08, ys - 1.8, 12, { hSeg: 2, grime: 0.5 });
    b.lathe(
      capKey,
      [
        [r, 0],
        [r * 1.25, 0.35],
        [r * 1.9, 0.9],
        [r * 2.6, 1.2],
      ],
      12,
      x,
      ys - 1.2,
      z,
      { grime: 0.3 },
    );
    if (opts.collide !== false)
      PF.col(x, z, r * 2.2, r * 2.2, 0, ys, 0, { walkable: false });
  };

  /** Box beam from a→c whose local X is aligned with `side` (w along side, d along side×dir). */
  const _q1 = new THREE.Quaternion(),
    _m = new THREE.Matrix4(),
    _bx = new THREE.Vector3(),
    _by = new THREE.Vector3(),
    _bz = new THREE.Vector3();
  function beamOriented(b, key, a, c, w, d, side, grime) {
    const dir = new THREE.Vector3().subVectors(c, a);
    const len = dir.length();
    if (len < 1e-4) return;
    _by.copy(dir).normalize();
    _bx.copy(side).addScaledVector(_by, -side.dot(_by)).normalize();
    _bz.crossVectors(_bx, _by).normalize();
    _m.makeBasis(_bx, _by, _bz);
    _q1.setFromRotationMatrix(_m);
    const geo = new THREE.BoxGeometry(w, len, d);
    geo.translate(0, len / 2, 0);
    const m = new THREE.Matrix4().compose(a, _q1, new THREE.Vector3(1, 1, 1));
    b.add(key, geo, { m, grime: grime === undefined ? 0.5 : grime });
  }
  BK.beamOriented = beamOriented;

  /** Eyebar chain a→c in the XY-ish plane: n parallel flat bars (height h, thickness t) spread along z by gap. */
  BK.eyebars = function (b, key, a, c, n, h, t, gap, zAxis) {
    const za = zAxis || V3(0, 0, 1);
    for (let i = 0; i < n; i++) {
      const o = (i - (n - 1) / 2) * gap;
      const oa = a.clone().addScaledVector(za, o),
        oc = c.clone().addScaledVector(za, o);
      beamOriented(b, key, oa, oc, h, t, perpUp(a, c, za), 0.45);
    }
  };
  /** In-plane "up" perpendicular for a member a→c lying in the plane normal to za. */
  function perpUp(a, c, za) {
    const d = new THREE.Vector3().subVectors(c, a).normalize();
    return new THREE.Vector3().crossVectors(za, d).normalize();
  }
  BK.perpUp = perpUp;

  /** Pin (short cylinder along z) at a panel point. */
  BK.pin = function (b, key, x, y, z, len, r) {
    b.cyl(
      key,
      x,
      y - (len || 1.6) / 2 + 0,
      z,
      r || 0.3,
      r || 0.3,
      len || 1.6,
      8,
      { hSeg: 1, rx: Math.PI / 2, m: null, grime: 0.4 },
    );
  };

  /**
   * Deck slab along X: x0..x1, z0..z1, top y. Asphalt top, concrete edge fascia, optional lane paint.
   * opts: {thick, lanes: [z...] dashed centre lines, collide (true), surface, fascia key}
   */
  BK.deckSlab = function (b, x0, x1, z0, z1, y, opts) {
    opts = opts || {};
    const th = opts.thick || 0.6;
    b.boxMM(opts.key || "asphalt", x0, y - th, z0, x1, y, z1, {
      grime: 0.6,
      segLen: 6,
    });
    if (opts.fascia !== false)
      for (const zz of [z0, z1])
        b.boxMM(
          opts.fascia || "concrete_dark",
          x0,
          y - th - 0.25,
          zz - 0.15,
          x1,
          y - th + 0.05,
          zz + 0.15,
          { grime: 0.7, segLen: 8 },
        );
    for (const lz of opts.lanes || []) {
      for (let x = x0 + 1; x < x1 - 3; x += 9)
        b.boxMM("stripe_cream", x, y, lz - 0.08, x + 3, y + 0.012, lz + 0.08, {
          grime: 0.7,
          noAO: true,
          seg: false,
        });
    }
    if (opts.collide !== false) {
      // split long slabs so the collider grid stays tidy
      const n = Math.max(1, Math.ceil((x1 - x0) / 40));
      for (let i = 0; i < n; i++) {
        const a = x0 + ((x1 - x0) * i) / n,
          c = x0 + ((x1 - x0) * (i + 1)) / n;
        PF.colMM(a, y - th, z0, c, y, z1, {
          surface: opts.surface || "concrete",
        });
      }
    }
  };

  /** Parapet railing between world points [[x,z,y],...] (y = walking surface): posts + two rails + collider. */
  BK.rail = function (b, pts, opts) {
    opts = opts || {};
    const key = opts.key || "iron",
      h = opts.h || 1.15;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const A = V3(a[0], a[2], a[1]),
        C = V3(c[0], c[2], c[1]);
      b.beam(
        key,
        A.clone().setY(A.y + h),
        C.clone().setY(C.y + h),
        0.09,
        0.09,
        { grime: 0.4 },
      );
      b.beam(
        key,
        A.clone().setY(A.y + h * 0.55),
        C.clone().setY(C.y + h * 0.55),
        0.06,
        0.06,
        { grime: 0.4 },
      );
      if (opts.lattice) {
        // Queensboro-style X lattice panels
        const len = A.distanceTo(C),
          n = Math.max(1, Math.round(len / 1.2));
        for (let k = 0; k < n; k++) {
          const p0 = A.clone().lerp(C, k / n),
            p1 = A.clone().lerp(C, (k + 1) / n);
          b.beam(
            key,
            p0.clone().setY(p0.y + 0.1),
            p1.clone().setY(p1.y + h - 0.05),
            0.04,
            0.04,
            { noAO: true, grime: 0.3 },
          );
          b.beam(
            key,
            p0.clone().setY(p0.y + h - 0.05),
            p1.clone().setY(p1.y + 0.1),
            0.04,
            0.04,
            { noAO: true, grime: 0.3 },
          );
        }
        b.beam(
          key,
          A.clone().setY(A.y + 0.1),
          C.clone().setY(C.y + 0.1),
          0.07,
          0.07,
          { grime: 0.4 },
        );
      }
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const n = Math.max(1, Math.round(len / (opts.post || 2.5)));
      for (let k = 0; k <= n; k++) {
        if (k === n && i < pts.length - 2) continue;
        const t = k / n;
        b.box(
          key,
          a[0] + (c[0] - a[0]) * t,
          a[2] + (c[2] - a[2]) * t,
          a[1] + (c[1] - a[1]) * t,
          0.12,
          h + 0.05,
          0.12,
          { seg: false, grime: 0.4 },
        );
      }
      if (opts.collide !== false)
        PF.colWall(
          a[0],
          a[1],
          c[0],
          c[1],
          0.3,
          Math.min(a[2], c[2]) - 1.2,
          Math.max(a[2], c[2]) + h,
          { walkable: false, surface: "metal" },
        );
    }
  };

  /**
   * Steel switch-back stair tower. Flights run along ±X between xA and xB (xA < xB) in alternating lanes
   * laneZ[0], laneZ[1] (centre z of each lane), width w. Climbs y0→y1 over nFlights flights starting in lane 0
   * at xA going +X. Landings at both ends (landing depth ld). Returns the top landing centre.
   */
  BK.switchback = function (b, key, xA, xB, laneZ, w, y0, y1, nFlights, opts) {
    opts = opts || {};
    const ld = opts.landing || 1.8;
    const rise = (y1 - y0) / nFlights;
    const run = xB - xA;
    const zMin = Math.min(laneZ[0], laneZ[1]) - w / 2,
      zMax = Math.max(laneZ[0], laneZ[1]) + w / 2;
    let y = y0;
    for (let f = 0; f < nFlights; f++) {
      const lane = laneZ[f % 2];
      const east = f % 2 === 0;
      const sx = east ? xA : xB;
      PF.stairs(
        b,
        key,
        sx,
        lane,
        east ? Math.PI / 2 : -Math.PI / 2,
        w,
        run,
        y,
        y + rise,
        {
          base: y + rise * 0 - 0.25 + 0,
          maxRise: 0.32,
          surface: "metal",
          grime: 0.5,
        },
      );
      y += rise;
      // landing at the far end (spans both lanes)
      const lx0 = east ? xB : xA - ld,
        lx1 = east ? xB + ld : xA;
      b.boxMM(key, lx0, y - 0.2, zMin, lx1, y, zMax, {
        grime: 0.5,
        seg: false,
      });
      PF.colMM(lx0, y - 0.3, zMin, lx1, y, zMax, { surface: "metal" });
      // landing railing (outer end)
      const ox = east ? lx1 : lx0;
      b.beam(
        "iron",
        V3(ox, y + 1.05, zMin),
        V3(ox, y + 1.05, zMax),
        0.06,
        0.06,
        {},
      );
      PF.colMM(ox - 0.1, y, zMin, ox + 0.1, y + 1.1, zMax, {
        walkable: false,
        surface: "metal",
      });
      // flight outer railings
      const railZ =
        f % 2 === 0
          ? laneZ[0] < laneZ[1]
            ? zMin
            : zMax
          : laneZ[1] < laneZ[0]
            ? zMin
            : zMax;
      const ya = y - rise,
        yb = y;
      const xa = east ? xA : xB,
        xb = east ? xB : xA;
      b.beam(
        "iron",
        V3(xa, ya + 1.0, railZ),
        V3(xb, yb + 1.0, railZ),
        0.06,
        0.06,
        {},
      );
      for (let k = 0; k <= 4; k++) {
        const t = k / 4;
        b.box(
          "iron",
          xa + (xb - xa) * t,
          ya + (yb - ya) * t,
          railZ,
          0.06,
          1.0,
          0.06,
          { seg: false },
        );
      }
      PF.colMM(
        Math.min(xa, xb),
        ya - 1,
        railZ - 0.08,
        Math.max(xa, xb),
        yb + 1.0,
        railZ + 0.08,
        { walkable: false, surface: "metal" },
      );
    }
    // corner posts of the tower frame
    for (const px of [xA - ld, xB + ld])
      for (const pz of [zMin, zMax])
        b.box(opts.frame || key, px, y0 - 0.5, pz, 0.25, y1 - y0 + 1.6, 0.25, {
          seg: false,
          grime: 0.5,
        });
    // central divider between the lanes (stringer wall)
    const midZ = (laneZ[0] + laneZ[1]) / 2;
    b.boxMM(opts.frame || key, xA, y0, midZ - 0.06, xB, y1, midZ + 0.06, {
      grime: 0.5,
    });
    PF.colMM(xA + 0.2, y0, midZ - 0.08, xB - 0.2, y1, midZ + 0.08, {
      walkable: false,
      surface: "metal",
    });
    return { x: nFlights % 2 ? xB + ld / 2 : xA - ld / 2, y: y1, z: midZ };
  };

  /** Ornamental cast-iron bridge lamp standard (fluted post, scrolled arm, globe). lit → emissive + glow sprite. */
  BK.lamp = function (b, x, y, z, ry, lit, parent) {
    b.cyl("iron", x, y, z, 0.2, 0.26, 0.9, 8, { hSeg: 1, grime: 0.5 });
    b.cyl("iron", x, y + 0.9, z, 0.09, 0.13, 4.6, 8, { hSeg: 2, grime: 0.4 });
    b.cyl("iron", x, y + 5.5, z, 0.16, 0.1, 0.3, 8, { hSeg: 1 });
    const c = Math.cos(ry),
      s = Math.sin(ry);
    const ax = x + s * 1.2,
      az = z + c * 1.2;
    b.beam("iron", V3(x, y + 5.6, z), V3(ax, y + 5.9, az), 0.08, 0.08, {});
    b.beam(
      "iron",
      V3(x, y + 5.1, z),
      V3(ax * 0.5 + x * 0.5, y + 5.75, az * 0.5 + z * 0.5),
      0.05,
      0.05,
      {},
    );
    b.cyl("iron", ax, y + 5.6, az, 0.26, 0.08, 0.3, 8, { hSeg: 1 });
    b.sphere(lit ? "lamp" : "glass_broken", ax, y + 5.42, az, 0.22, {
      ws: 8,
      hs: 6,
      noAO: true,
      grime: 0,
    });
    if (lit)
      PF.glow(V3(ax, y + 5.35, az), 0xffd9a0, 2.6, parent || null, {
        intensity: 1.1,
        dayFactor: 0.2,
      });
  };

  /** Enamel highway sign panel on a steel gantry spanning z0..z1 at x, sign facing ry. */
  BK.gantry = function (b, x, y, z0, z1, h, texKey, signW, signH, ry) {
    for (const zz of [z0, z1]) {
      b.box("steel", x, y, zz, 0.3, h + 0.4, 0.3, { seg: false, grime: 0.5 });
      PF.col(x, zz, 0.4, 0.4, y, y + h, 0, {
        walkable: false,
        surface: "metal",
      });
    }
    b.boxMM(
      "steel",
      x - 0.2,
      y + h,
      Math.min(z0, z1),
      x + 0.2,
      y + h + 0.35,
      Math.max(z0, z1),
      { grime: 0.5, seg: false },
    );
    b.boxMM(
      "steel",
      x - 0.2,
      y + h + signH * 0.8,
      Math.min(z0, z1),
      x + 0.2,
      y + h + signH * 0.8 + 0.25,
      Math.max(z0, z1),
      { grime: 0.5, seg: false },
    );
    b.quad(
      texKey,
      x + Math.sin(ry) * 0.25,
      y + h + signH / 2 + 0.1,
      (z0 + z1) / 2,
      signW,
      signH,
      { ry, grime: 0.25 },
    );
  };

  /** Twisted girders drooping from a broken span end at x (dir = +1 east end, -1 west end), over zs. */
  BK.debris = function (b, key, x, y, zs, dir, seed) {
    const r = PF.rng(seed || 91);
    for (const z of zs) {
      let p = V3(x, y, z);
      let ang = -0.3 - r() * 0.3;
      for (let k = 0; k < 4; k++) {
        const len = 2.5 + r() * 3;
        ang -= 0.2 + r() * 0.35;
        const q = V3(
          p.x + dir * Math.cos(ang) * len,
          p.y + Math.sin(ang) * len,
          p.z + (r() - 0.5) * 1.2,
        );
        b.beam(key, p, q, 0.5, 0.7, { grime: 0.7 });
        p = q;
      }
    }
    // rebar / cable strands
    for (let i = 0; i < 18; i++) {
      const z = zs[0] + r() * (zs[zs.length - 1] - zs[0]);
      const a = V3(x, y - 0.3, z);
      const c = V3(
        x + dir * (0.5 + r() * 2.5),
        y - 1 - r() * 5,
        z + (r() - 0.5) * 1.5,
      );
      b.beam("rust", a, c, 0.05, 0.05, { noAO: true });
    }
  };
})();
