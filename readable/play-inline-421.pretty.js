/* src/poi_harbor2/08_harbor.js */
/* =====================================================================
 * NEW RAD CITY — poi_harbor2 / 08_harbor.js
 * Waterfront construction helpers (local coords on a kit builder `b`):
 *   K.frame / K.xfBuilder  rotated local frame for a whole exterior (Whitehall
 *                  sits at 47° along the Battery shore): geometry is built
 *                  axis-aligned, the finished group is rotated, colliders and
 *                  gameplay points are transformed explicitly
 *   K.hull         lofted ship hull (double-ended ferry or bow/transom boat)
 *                  with a painted boot-top, deck, rub rail and end cappings
 *   K.piles        timber pile clusters (algae-dark below the tide line)
 *   K.bollard, K.cleat, K.lifebuoy, K.ladder, K.tireFender
 *   K.lattice      riveted steel lattice tower (ferry-slip apron gantries)
 *   K.stall        tarp-roofed trader's stall with counter and goods
 *   K.wagon        covered caravan wagon (canvas hoops, wooden wheels)
 *   K.fence        scrap-sheet fence run (pens, barricades) + collider
 *   K.stringLights catenary of bulbs between posts (baked light + glows)
 *   K.crates, K.sandbags, K.nest (shellback nest with eggs), K.waterPlate
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ph2;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;

  // ------------------------------------------------------------------
  // Rotated frame
  // ------------------------------------------------------------------
  /**
   * Local frame at world (px,pz) rotated by three.js yaw `yaw` (local −z = forward).
   * F.w(lx,ly,lz) → world Vector3;  F.xz(lx,lz) → [x,z];  F.pyaw(localPlayerYaw) → world player yaw.
   */
  K.frame = function (px, pz, yaw) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw);
    const F = { px, pz, yaw, c, s };
    F.xz = (lx, lz) => [px + lx * c + lz * s, pz - lx * s + lz * c];
    F.w = (lx, ly, lz) => {
      const p = F.xz(lx, lz);
      return new THREE.Vector3(p[0], ly, p[1]);
    };
    F.pyaw = (ly) => yaw + (ly || 0);
    /** world → local */
    F.local = (x, z) => {
      const dx = x - px,
        dz = z - pz;
      return [dx * c - dz * s, dx * s + dz * c];
    };
    return F;
  };
  /** Builder whose colliders follow frame F (geometry is rotated by K.finishXF). */
  K.xfBuilder = function (o, F) {
    const b = K.builder(o);
    b.F = F;
    b.col = function (x0, y0, z0, x1, y1, z1, oo) {
      const cx = (x0 + x1) / 2,
        cz = (z0 + z1) / 2,
        p = F.xz(cx, cz);
      const c = G.world.addCollider(
        p[0],
        p[1],
        Math.abs(x1 - x0),
        Math.abs(z1 - z0),
        Math.min(y0, y1),
        Math.max(y0, y1),
        -F.yaw,
        Object.assign({ tag: "poi_harbor2", surface: "concrete" }, oo || {}),
      );
      this.colliders.push(c);
      return c;
    };
    b.ocol = function (cx, cz, w, d, y0, y1, yaw, oo) {
      const p = F.xz(cx, cz);
      const c = G.world.addCollider(
        p[0],
        p[1],
        w,
        d,
        y0,
        y1,
        -(F.yaw + (yaw || 0)),
        Object.assign({ tag: "poi_harbor2", surface: "concrete" }, oo || {}),
      );
      this.colliders.push(c);
      return c;
    };
    return b;
  };
  /** Finish a frame builder: merged meshes in a group placed/rotated by its frame. */
  K.finishXF = function (b, parent) {
    const g = b.finish(null);
    if (b.F) {
      g.position.set(b.F.px, 0, b.F.pz);
      g.rotation.y = b.F.yaw;
      g.updateMatrix();
      g.updateMatrixWorld(true);
    }
    if (parent) parent.add(g);
    return g;
  };

  // ------------------------------------------------------------------
  // Ship hull
  // ------------------------------------------------------------------
  /**
   * Lofted hull along local z (bow at +z for kind 'bow'; both ends alike for 'double').
   * o: {cx, cz, len, beam, deck, keel, sheer, kind, nu, nv, boot (y of boot-top), bootTint, tint, rub (rub-rail mat), deckMat, noDeck}
   * Returns {edge(t, side) → [x,y,z] deck edge point, wf}
   */
  K.hull = function (b, mat, o) {
    const cx = o.cx || 0,
      cz = o.cz || 0,
      L = o.len,
      B = o.beam,
      dk = o.deck,
      kl = o.keel,
      sh = o.sheer || 0.6;
    const kind = o.kind || "double",
      nu = o.nu || 12,
      nv = o.nv || 24;
    const wf = (t) => {
      if (kind === "double") {
        const e = Math.abs(2 * t - 1);
        return 0.1 + 0.9 * Math.sqrt(Math.max(0, 1 - Math.pow(e, 3.2)));
      }
      if (t > 0.6)
        return Math.max(0.02, Math.pow(Math.cos(((t - 0.6) / 0.4) * HP), 0.75));
      if (t < 0.08) return 0.78 + 0.22 * (t / 0.08);
      return 1;
    };
    const endE = (t) =>
      kind === "double"
        ? Math.abs(2 * t - 1)
        : t > 0.5
          ? (t - 0.5) * 2
          : (0.5 - t) * 0.6;
    const sheerY = (t) => dk + sh * Math.pow(endE(t), 2);
    const keelY = (t) => kl + (dk - kl) * 0.45 * Math.pow(endE(t), 3);
    const P = [];
    for (let i = 0; i <= nv; i++) {
      const t = i / nv,
        z = cz - L / 2 + L * t,
        w = (wf(t) * B) / 2,
        sy = sheerY(t),
        ky = keelY(t);
      const row = [];
      for (let j = 0; j <= nu; j++) {
        const s = -1 + (2 * j) / nu,
          th = s * HP;
        const y = sy - (sy - ky) * Math.pow(Math.abs(Math.cos(th)), 0.32);
        row.push([cx + w * Math.sin(th), y, z]);
      }
      P.push(row);
    }
    const bk = b._b(mat);
    const base = bk.vc,
      tile = K.tileOf(mat),
      tint = K.tint(o.tint),
      boot = o.boot !== undefined ? o.boot : -0.9;
    const bootT = K.tint(o.bootTint || [0.32, 0.16, 0.12]);
    for (let i = 0; i <= nv; i++)
      for (let j = 0; j <= nu; j++) {
        const p = P[i][j];
        const pi0 = P[Math.max(0, i - 1)][j],
          pi1 = P[Math.min(nv, i + 1)][j],
          pj0 = P[i][Math.max(0, j - 1)],
          pj1 = P[i][Math.min(nu, j + 1)];
        const ax = pi1[0] - pi0[0],
          ay = pi1[1] - pi0[1],
          az = pi1[2] - pi0[2];
        const bx = pj1[0] - pj0[0],
          by = pj1[1] - pj0[1],
          bz = pj1[2] - pj0[2];
        let nx = ay * bz - az * by,
          ny = az * bx - ax * bz,
          nz = ax * by - ay * bx;
        // orient outward (away from the centre line)
        const ox = p[0] - cx,
          oy = p[1] - (dk + kl) / 2;
        if (nx * ox + ny * oy * 0.3 < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }
        const nl = Math.hypot(nx, ny, nz) || 1;
        const tn = p[1] < boot ? bootT : tint;
        b._v(
          bk,
          p[0],
          p[1],
          p[2],
          nx / nl,
          ny / nl,
          nz / nl,
          p[2] / tile[0],
          p[1] / tile[1],
          tn,
          o.grime !== undefined ? o.grime : 0.35,
        );
      }
    const row = nu + 1;
    for (let i = 0; i < nv; i++)
      for (let j = 0; j < nu; j++) {
        const a = base + i * row + j;
        // j runs port deck edge → keel → starboard deck edge, i runs along +z: this winding faces outward
        bk.i.push(a, a + 1, a + row + 1, a, a + row + 1, a + row);
      }
    // end cappings (transom / blunt ends): fan from the deck-centre
    const cap = (i, sgn) => {
      const r0 = P[i],
        cyy = (r0[0][1] + r0[nu][1]) / 2,
        zc = r0[0][2];
      for (let j = 0; j < nu; j++) {
        const A = r0[j],
          Bp = r0[j + 1],
          C = [cx, cyy, zc];
        b.quadN(mat, A, Bp, C, C, [0, 0, sgn], {
          tint: A[1] < boot ? bootT : tint,
          grime: 0.35,
        });
      }
    };
    cap(0, -1);
    cap(nv, 1);
    // deck
    if (!o.noDeck) {
      const dm = o.deckMat || "deck";
      for (let i = 0; i < nv; i++) {
        const a = P[i][0],
          c = P[i][nu],
          d = P[i + 1][nu],
          e = P[i + 1][0];
        b.quadN(
          dm,
          [a[0], a[1] - 0.02, a[2]],
          [c[0], c[1] - 0.02, c[2]],
          [d[0], d[1] - 0.02, d[2]],
          [e[0], e[1] - 0.02, e[2]],
          [0, 1, 0],
          { tint: o.deckTint, grime: 0.5 },
        );
      }
    }
    // rub rail (fender band) along the sheer
    const rm = o.rub || "rubber";
    for (let i = 0; i < nv; i++)
      for (const j of [0, nu]) {
        const a = P[i][j],
          c = P[i + 1][j];
        b.beam(
          rm,
          a[0],
          a[1] - 0.25,
          a[2],
          c[0],
          c[1] - 0.25,
          c[2],
          0.28,
          0.3,
          { grime: 0.4 },
        );
      }
    return {
      wf,
      sheerY,
      edge: (t, side) => {
        const i = Math.round(t * nv);
        const r = P[Math.max(0, Math.min(nv, i))];
        return side < 0 ? r[0] : r[nu];
      },
      P,
    };
  };

  // ------------------------------------------------------------------
  // Marine hardware
  // ------------------------------------------------------------------
  /** Pile: timber post from the river bed to `top`; dark algae band under the tide line. */
  K.pile = function (b, x, z, top, r, o) {
    o = o || {};
    r = r || 0.22;
    b.cyl(o.mat || "wood_rotten", x, -1.0, z, r, r * 0.95, top + 1.0, 7, {
      tint: o.tint || [0.62, 0.56, 0.48],
      top: true,
    });
    b.cyl("slime", x, -6, z, r * 1.06, r * 1.06, 5.2, 7, {
      top: false,
      tint: [0.7, 0.8, 0.6],
    });
    if (o.cap) b.cyl("black_iron", x, top - 0.02, z, r * 1.1, r * 1.1, 0.06, 7);
  };
  /** Pile grid under a deck rect (x0..x1, z0..z1) with spacing; skip the inner rows when `edgeOnly`. */
  K.piles = function (b, x0, z0, x1, z1, top, step, o) {
    o = o || {};
    const r = K.rng(o.seed || (x0 * 7 + z0 * 3) | 0);
    for (let x = x0 + 0.3; x <= x1 - 0.3 + 1e-3; x += step)
      for (let z = z0 + 0.3; z <= z1 - 0.3 + 1e-3; z += step) {
        const edge =
          x - x0 < step * 0.9 ||
          x1 - x < step * 0.9 ||
          z - z0 < step * 0.9 ||
          z1 - z < step * 0.9;
        if (o.edgeOnly && !edge) continue;
        if (o.skip && o.skip(x, z)) continue;
        K.pile(
          b,
          x + (r() - 0.5) * 0.15,
          z + (r() - 0.5) * 0.15,
          top - (o.under || 0.3),
          o.r || 0.2,
          { tint: [0.55 + r() * 0.15, 0.5, 0.42] },
        );
      }
  };
  K.bollard = function (b, x, y, z) {
    b.cyl("cast_iron", x, y, z, 0.2, 0.17, 0.45, 9, {
      tint: [0.35, 0.33, 0.3],
    });
    b.cyl("cast_iron", x, y + 0.45, z, 0.26, 0.22, 0.12, 9, {
      tint: [0.35, 0.33, 0.3],
    });
  };
  K.cleat = function (b, x, y, z, yaw) {
    b.box("cast_iron", x, y, z, 0.12, 0.1, 0.12, { yaw });
    b.box("cast_iron", x, y + 0.1, z, 0.5, 0.06, 0.1, { yaw });
  };
  let _torus = null;
  K.torusGeo = () =>
    _torus || (_torus = new THREE.TorusGeometry(1, 0.22, 6, 14));
  /** Ring life-buoy hung on a wall facing (nx,nz), with its little rack. */
  K.lifebuoy = function (b, x, y, z, nx, nz) {
    const ry = Math.atan2(nx, nz);
    b.geo("flat", K.torusGeo(), {
      x: x + nx * 0.12,
      y,
      z: z + nz * 0.12,
      s: 0.34,
      ry,
      tint: [0.92, 0.5, 0.2],
    });
    for (let k = 0; k < 4; k++) {
      const a = k * HP + PI / 4,
        ux = nz,
        uz = -nx;
      b.box(
        "flat",
        x + nx * 0.13 + ux * Math.cos(a) * 0.34,
        y + Math.sin(a) * 0.34 - 0.04,
        z + nz * 0.13 + uz * Math.cos(a) * 0.34,
        0.1,
        0.08,
        0.1,
        { yaw: ry, tint: [0.92, 0.9, 0.85] },
      );
    }
    b.box(
      "black_iron",
      x + nx * 0.04,
      y + 0.3,
      z + nz * 0.04,
      0.06,
      0.1,
      0.08,
      { yaw: ry },
    );
  };
  K.tireFender = function (b, x, y, z, nx, nz) {
    const ry = Math.atan2(nx, nz);
    b.geo("rubber", K.torusGeo(), {
      x: x + nx * 0.2,
      y,
      z: z + nz * 0.2,
      sx: 0.4,
      sy: 0.4,
      sz: 0.55,
      ry,
      tint: [0.12, 0.12, 0.12],
    });
    b.pipe(
      "rope",
      x,
      y + 0.35,
      z,
      x + nx * 0.2,
      y + 0.45,
      z + nz * 0.2,
      0.02,
      4,
    );
  };
  /** Iron ladder on a wall face (nx,nz) from y0 to y1. */
  K.ladder = function (b, x, z, y0, y1, nx, nz, o) {
    o = o || {};
    const ux = nz,
      uz = -nx,
      w = o.w || 0.45,
      off = 0.12;
    for (const e of [-1, 1])
      b.beam(
        o.mat || "rust",
        x + (ux * e * w) / 2 + nx * off,
        y0,
        z + (uz * e * w) / 2 + nz * off,
        x + (ux * e * w) / 2 + nx * off,
        y1 + (o.hoop ? 0.9 : 0),
        z + (uz * e * w) / 2 + nz * off,
        0.05,
        0.05,
      );
    for (let y = y0 + 0.25; y < y1; y += 0.3)
      b.beam(
        o.mat || "rust",
        x - (ux * w) / 2 + nx * off,
        y,
        z - (uz * w) / 2 + nz * off,
        x + (ux * w) / 2 + nx * off,
        y,
        z + (uz * w) / 2 + nz * off,
        0.03,
        0.03,
      );
  };

  /** Riveted steel lattice tower (w × d footprint, 4 legs, X-bracing each face every `bay` m). */
  K.lattice = function (b, x, z, w, d, y0, h, o) {
    o = o || {};
    const mat = o.mat || "rust",
      bay = o.bay || 2.2,
      t = o.t || 0.16;
    const leg = [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ];
    for (const [lx, lz] of leg)
      b.box(mat, x + lx, y0, z + lz, t, h, t, { tint: o.tint });
    const n = Math.max(1, Math.round(h / bay));
    for (let k = 0; k <= n; k++) {
      const y = y0 + (h * k) / n;
      for (let i = 0; i < 4; i++) {
        const A = leg[i],
          Bq = leg[(i + 1) % 4];
        b.beam(
          mat,
          x + A[0],
          y,
          z + A[1],
          x + Bq[0],
          y,
          z + Bq[1],
          t * 0.6,
          t * 0.6,
          { tint: o.tint },
        );
      }
      if (k < n) {
        const y1 = y0 + (h * (k + 1)) / n;
        for (let i = 0; i < 4; i++) {
          const A = leg[i],
            Bq = leg[(i + 1) % 4];
          b.beam(
            mat,
            x + A[0],
            y,
            z + A[1],
            x + Bq[0],
            y1,
            z + Bq[1],
            t * 0.4,
            t * 0.4,
            { tint: o.tint },
          );
          b.beam(
            mat,
            x + Bq[0],
            y,
            z + Bq[1],
            x + A[0],
            y1,
            z + A[1],
            t * 0.4,
            t * 0.4,
            { tint: o.tint },
          );
        }
      }
    }
    if (o.col !== false)
      b.col(x - w / 2, y0, z - d / 2, x + w / 2, y0 + h, z + d / 2, {
        tag: "structure",
        surface: "metal",
        walkable: false,
      });
  };

  // ------------------------------------------------------------------
  // Settlement dressing
  // ------------------------------------------------------------------
  const GOODS = [
    [0.62, 0.48, 0.3],
    [0.5, 0.52, 0.4],
    [0.7, 0.3, 0.22],
    [0.35, 0.42, 0.5],
    [0.75, 0.68, 0.5],
  ];
  /** Trader's stall: 4 posts, sloping tarp, counter of planks on crates, goods on it. Faces local −z at yaw 0. */
  K.stall = function (b, x, y, z, yaw, w, d, o) {
    o = o || {};
    const r = K.rng(o.seed || (x * 13 + z * 5) | 0),
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const hF = o.h || 2.4,
      hB = hF + 0.5;
    for (const [lx, lz, h] of [
      [-w / 2, -d / 2, hF],
      [w / 2, -d / 2, hF],
      [-w / 2, d / 2, hB],
      [w / 2, d / 2, hB],
    ]) {
      const p = L(lx, lz);
      b.box("wood_rotten", p[0], y, p[1], 0.1, h, 0.1, {
        yaw,
        tint: [0.6, 0.5, 0.4],
      });
    }
    const tarp = o.tarp || "canvas_tarp";
    const p0 = L(-w / 2 - 0.2, -d / 2 - 0.35),
      p1 = L(w / 2 + 0.2, -d / 2 - 0.35),
      p2 = L(w / 2 + 0.2, d / 2 + 0.1),
      p3 = L(-w / 2 - 0.2, d / 2 + 0.1);
    b.quadN(
      tarp,
      [p0[0], y + hF - 0.12, p0[1]],
      [p1[0], y + hF - 0.12, p1[1]],
      [p2[0], y + hB + 0.05, p2[1]],
      [p3[0], y + hB + 0.05, p3[1]],
      [0, 1, 0],
      { tint: o.tarpTint, grime: 0.5 },
    );
    b.quadN(
      tarp,
      [p0[0], y + hF - 0.14, p0[1]],
      [p1[0], y + hF - 0.14, p1[1]],
      [p2[0], y + hB + 0.03, p2[1]],
      [p3[0], y + hB + 0.03, p3[1]],
      [0, -1, 0],
      {
        tint: (o.tarpTint || [0.66, 0.59, 0.43]).map
          ? (o.tarpTint || [0.66, 0.59, 0.43]).map((v) => v * 0.6)
          : o.tarpTint,
        grime: 0.3,
      },
    );
    // scalloped front valance
    for (let k = 0; k < 6; k++) {
      const a = L(-w / 2 - 0.2 + ((w + 0.4) * k) / 6, -d / 2 - 0.36),
        e = L(-w / 2 - 0.2 + ((w + 0.4) * (k + 1)) / 6, -d / 2 - 0.36);
      b.quadN(
        tarp,
        [a[0], y + hF - 0.45, a[1]],
        [e[0], y + hF - 0.45, e[1]],
        [e[0], y + hF - 0.12, e[1]],
        [a[0], y + hF - 0.12, a[1]],
        [-s, 0, -c],
        {
          tint: k % 2 ? o.tarpTint : o.tarpTint2 || [0.8, 0.76, 0.66],
          grime: 0.4,
        },
      );
    }
    // counter: plank top on two crates
    const cp = L(0, -d / 2 + 0.35);
    b.box("wood", cp[0], y + 0.9, cp[1], w - 0.2, 0.07, 0.6, {
      yaw,
      tint: [0.6, 0.48, 0.36],
      faces: "nsewtb",
    });
    for (const e of [-1, 1]) {
      const q = L(e * (w / 2 - 0.45), -d / 2 + 0.35);
      b.box("wood", q[0], y, q[1], 0.6, 0.9, 0.55, {
        yaw,
        tint: [0.5, 0.42, 0.3],
      });
    }
    // goods
    for (let k = 0; k < 7; k++) {
      const q = L(-w / 2 + 0.3 + r() * (w - 0.6), -d / 2 + 0.2 + r() * 0.3),
        kk = r();
      if (kk < 0.35)
        b.cyl("rust", q[0], y + 0.97, q[1], 0.05, 0.05, 0.13, 6, {
          tint: r.pick(GOODS),
        });
      else if (kk < 0.6)
        b.cyl("glass", q[0], y + 0.97, q[1], 0.04, 0.04, 0.24, 6, {
          tint: r.pick([
            [0.3, 0.5, 0.3],
            [0.5, 0.3, 0.15],
            [0.8, 0.8, 0.7],
          ]),
        });
      else if (kk < 0.8)
        b.box("fabric", q[0], y + 0.97, q[1], 0.25, 0.12 + r() * 0.1, 0.2, {
          yaw: yaw + r() * 0.6,
          tint: r.pick(GOODS),
        });
      else
        b.box("metal_dark", q[0], y + 0.97, q[1], 0.35, 0.08, 0.12, {
          yaw: yaw + r() * 0.4,
          tint: [0.4, 0.4, 0.38],
        });
    }
    // back shelf of stock
    const sp = L(0, d / 2 - 0.25);
    K.shelf(b, sp[0], y, sp[1], yaw, w - 0.4, {
      h: 1.6,
      d: 0.35,
      levels: 3,
      mat: "wood_rotten",
      col: false,
      items: o.items || ["can", "jar", "bottle", "box"],
      seed: (x * 7 + z) | 0,
    });
    if (o.sign) {
      const q = L(0, -d / 2 - 0.37);
      b.plate(
        "art",
        q[0],
        y + hF - 0.05,
        q[1],
        -s,
        -c,
        Math.min(w, 2.2),
        0.5,
        o.sign,
        { off: 0.02 },
      );
    }
    if (o.col !== false)
      b.ocol(cp[0], cp[1], w, 0.7, y, y + 1.0, yaw, {
        tag: "furniture",
        surface: "wood",
      });
    if (o.lamp !== false) {
      const q = L(0, -d / 2 + 0.2);
      K.lamp(b, q[0], y + hF - 0.35, q[1], "cage", [1, 0.75, 0.45], 0, 0, {
        ceil: y + hF - 0.12,
        glowSize: 1.2,
      });
    }
  };

  /** Covered caravan wagon: bed, 4 wheels, canvas hoops, shafts toward local −z. */
  K.wagon = function (b, x, y, z, yaw, o) {
    o = o || {};
    const c = Math.cos(yaw),
      s = Math.sin(yaw),
      L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const W = 1.7,
      Lb = 3.4,
      bedY = y + 0.75;
    const bc = L(0, 0);
    b.box("wood", bc[0], bedY, bc[1], W, 0.12, Lb, {
      yaw,
      tint: [0.55, 0.42, 0.3],
      faces: "nsewtb",
    });
    for (const e of [-1, 1]) {
      const p = L((e * W) / 2, 0);
      b.box("wood", p[0], bedY + 0.12, p[1], 0.06, 0.45, Lb, {
        yaw,
        tint: [0.5, 0.38, 0.26],
      });
    }
    const wheel = (lx, lz, r) => {
      const p = L(lx, lz);
      b.geo("wood_dark", K.unitCyl(12), {
        x: p[0],
        y: y + r,
        z: p[1],
        sx: r,
        sy: 0.08,
        sz: r,
        rz: HP,
        ry: yaw,
        tint: [0.45, 0.34, 0.24],
      });
      b.geo("black_iron", K.torusGeo(), {
        x: p[0],
        y: y + r,
        z: p[1],
        sx: r * 0.95,
        sy: r * 0.95,
        sz: 0.25,
        ry: yaw + HP,
      });
    };
    for (const e of [-1, 1]) {
      wheel(e * (W / 2 + 0.08), -1.1, 0.5);
      wheel(e * (W / 2 + 0.08), 1.1, 0.62);
    }
    // canvas cover: half-cylinder along the bed
    const n = 8,
      R = W / 2 + 0.05,
      ct = o.canvas || [0.78, 0.72, 0.58];
    for (let k = 0; k < n; k++) {
      const a0 = (PI * k) / n,
        a1 = (PI * (k + 1)) / n;
      const q0 = L(Math.cos(a0) * R, -Lb / 2 + 0.2),
        q1 = L(Math.cos(a1) * R, -Lb / 2 + 0.2),
        q2 = L(Math.cos(a1) * R, Lb / 2 - 0.2),
        q3 = L(Math.cos(a0) * R, Lb / 2 - 0.2);
      const y0 = bedY + 0.55 + Math.sin(a0) * 1.0,
        y1 = bedY + 0.55 + Math.sin(a1) * 1.0;
      const am = (a0 + a1) / 2,
        nxl = Math.cos(am),
        nyl = Math.sin(am);
      b.quadN(
        "canvas_tarp",
        [q0[0], y0, q0[1]],
        [q1[0], y1, q1[1]],
        [q2[0], y1, q2[1]],
        [q3[0], y0, q3[1]],
        [nxl * c, nyl, -nxl * s],
        { tint: ct, grime: 0.55 },
      );
    }
    for (const lz of [-Lb / 2 + 0.2, 0, Lb / 2 - 0.2])
      for (let k = 0; k < n; k++) {
        const a0 = (PI * k) / n,
          a1 = (PI * (k + 1)) / n,
          p0 = L(Math.cos(a0) * (R + 0.02), lz),
          p1 = L(Math.cos(a1) * (R + 0.02), lz);
        b.beam(
          "wood_dark",
          p0[0],
          bedY + 0.55 + Math.sin(a0),
          p0[1],
          p1[0],
          bedY + 0.55 + Math.sin(a1),
          p1[1],
          0.05,
          0.05,
        );
      }
    // shafts
    for (const e of [-1, 1]) {
      const a = L(e * 0.45, -Lb / 2),
        q = L(e * 0.35, -Lb / 2 - 2.2);
      b.beam("wood_dark", a[0], bedY, a[1], q[0], y + 0.5, q[1], 0.07, 0.07);
    }
    // cargo peeking out the back
    const cb = L(0, Lb / 2 - 0.5);
    b.box("wood", cb[0], bedY + 0.12, cb[1], 0.8, 0.5, 0.6, {
      yaw,
      tint: [0.6, 0.5, 0.36],
    });
    b.ocol(bc[0], bc[1], W + 0.3, Lb, y, bedY + 1.5, yaw, {
      tag: "wagon",
      surface: "wood",
      walkable: false,
    });
  };

  /** Scrap-sheet fence from A to B at floor y (corrugated + plywood panels, posts), with a collider. */
  K.fence = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.5,
      len = Math.hypot(bx - ax, bz - az);
    if (len < 0.2) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      n = Math.max(1, Math.ceil(len / 1.6)),
      r = K.rng(o.seed || (ax * 3 + az * 7) | 0);
    for (let k = 0; k < n; k++) {
      const t0 = (len * k) / n,
        t1 = (len * (k + 1)) / n;
      const p0 = [ax + ux * t0, az + uz * t0],
        p1 = [ax + ux * t1, az + uz * t1];
      const mat = r() < 0.6 ? "corrugated" : r() < 0.5 ? "wood_rotten" : "rust";
      const hh = h * (0.8 + r() * 0.3),
        lean = (r() - 0.5) * 0.15;
      const nx = -uz,
        nz = ux;
      b.quadN(
        mat,
        [p0[0], y, p0[1]],
        [p1[0], y, p1[1]],
        [p1[0] + nx * lean, y + hh, p1[1] + nz * lean],
        [p0[0] + nx * lean, y + hh, p0[1] + nz * lean],
        [nx, 0, nz],
        { tint: [0.7 + r() * 0.2, 0.62, 0.5] },
      );
      b.quadN(
        mat,
        [p1[0], y, p1[1]],
        [p0[0], y, p0[1]],
        [p0[0] + nx * lean, y + hh, p0[1] + nz * lean],
        [p1[0] + nx * lean, y + hh, p1[1] + nz * lean],
        [-nx, 0, -nz],
        { tint: [0.55, 0.5, 0.42] },
      );
      b.box("wood_rotten", p0[0], y, p0[1], 0.1, h + 0.2, 0.1, {
        tint: [0.5, 0.42, 0.34],
      });
    }
    b.box("wood_rotten", bx, y, bz, 0.1, h + 0.2, 0.1, {
      tint: [0.5, 0.42, 0.34],
    });
    if (o.col !== false)
      b.ocol(
        (ax + bx) / 2,
        (az + bz) / 2,
        len,
        0.2,
        y,
        y + h,
        Math.atan2(-uz, ux),
        { tag: "fence", surface: "metal", walkable: false },
      );
  };

  /** Catenary string of bulbs through points [[x,y,z],…]. */
  K.stringLights = function (b, pts, o) {
    o = o || {};
    const col = K.tint(o.color || [1, 0.78, 0.45]),
      sag = o.sag || 0.5,
      step = o.step || 0.9;
    for (let i = 0; i < pts.length - 1; i++) {
      const A = pts[i],
        B = pts[i + 1],
        len = Math.hypot(B[0] - A[0], B[2] - A[2]),
        n = Math.max(2, Math.ceil(len / step));
      let prev = A;
      for (let k = 1; k <= n; k++) {
        const t = k / n,
          y = A[1] + (B[1] - A[1]) * t - sag * 4 * t * (1 - t);
        const p = [A[0] + (B[0] - A[0]) * t, y, A[2] + (B[2] - A[2]) * t];
        b.pipe(
          "black_iron",
          prev[0],
          prev[1],
          prev[2],
          p[0],
          p[1],
          p[2],
          0.008,
          3,
        );
        if (k < n) {
          const dead = o.deadEvery && k % o.deadEvery === 0;
          b.geo(dead ? "glass" : "lamp", K.sphereGeo(), {
            x: p[0],
            y: p[1] - 0.07,
            z: p[2],
            s: 0.045,
            tint: dead ? [0.3, 0.3, 0.3] : col,
          });
          if (!dead && k % 2 === 0)
            b.glow(
              p[0],
              p[1] - 0.07,
              p[2],
              col.map((v) => v * 0.55),
              o.glow || 0.7,
            );
          if (!dead && o.light && k % 4 === 0)
            b.light(p[0], p[1] - 0.3, p[2], col, o.light, o.radius || 5);
        }
        prev = p;
      }
    }
  };
  /** Stack of crates / boxes (no collider unless o.col). */
  K.crates = function (b, x, y, z, yaw, n, o) {
    o = o || {};
    const r = K.rng(o.seed || (x * 11 + z * 13) | 0),
      c = Math.cos(yaw),
      s = Math.sin(yaw);
    let h = 0;
    for (let k = 0; k < n; k++) {
      const w = 0.6 + r() * 0.35,
        lx = (r() - 0.5) * 0.4,
        lz = (r() - 0.5) * 0.4,
        hh = 0.45 + r() * 0.3;
      b.box(
        o.mat || "wood",
        x + lx * c + lz * s,
        y + h,
        z - lx * s + lz * c,
        w,
        hh,
        w * (0.8 + r() * 0.3),
        {
          yaw: yaw + (r() - 0.5) * 0.4,
          tint: r.pick([
            [0.62, 0.5, 0.36],
            [0.55, 0.45, 0.32],
            [0.7, 0.6, 0.45],
          ]),
        },
      );
      h += hh;
      if (r() < 0.35) break;
    }
    if (o.col)
      b.ocol(x, z, 0.9, 0.9, y, y + h, yaw, { tag: "crate", surface: "wood" });
    return h;
  };
  /** Sandbag wall A→B (courses of lumpy bags) + collider. */
  K.sandbags = function (b, ax, az, bx, bz, y, h, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.2) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len,
      yaw = Math.atan2(-uz, ux),
      r = K.rng(o.seed || (ax * 5 + bz * 9) | 0);
    const rows = Math.max(1, Math.round((h || 1.1) / 0.22));
    for (let j = 0; j < rows; j++) {
      const off = (j % 2) * 0.3,
        n = Math.floor((len - off) / 0.6);
      for (let k = 0; k < n; k++) {
        const t = off + 0.3 + k * 0.6;
        b.geo("canvas_tarp", K.sphereGeo(), {
          x: ax + ux * t,
          y: y + 0.11 + j * 0.21,
          z: az + uz * t,
          sx: 0.3,
          sy: 0.12,
          sz: 0.22,
          ry: yaw + (r() - 0.5) * 0.2,
          tint: [0.62 + r() * 0.1, 0.56, 0.42],
        });
      }
    }
    if (o.col !== false)
      b.ocol(
        (ax + bx) / 2,
        (az + bz) / 2,
        len,
        0.5,
        y,
        y + rows * 0.21 + 0.1,
        yaw,
        { tag: "sandbags", surface: "dirt" },
      );
  };
  /** Shellback nest: a slimy mound with a clutch of eggs, shell fragments and bones (glow optional). */
  K.nest = function (b, x, y, z, rad, eggs, o) {
    o = o || {};
    const r = K.rng(o.seed || (x * 7 + z * 3) | 0);
    b.geo("slime", K.sphereGeo(), {
      x,
      y: y - rad * 0.25,
      z,
      sx: rad,
      sy: rad * 0.45,
      sz: rad * 0.9,
      ry: r() * 3,
      tint: [0.8, 0.85, 0.7],
    });
    for (let k = 0; k < 4; k++) {
      const a = r() * TAU,
        d = rad * (0.6 + r() * 0.5);
      b.geo("slime", K.sphereGeo(), {
        x: x + Math.cos(a) * d,
        y: y - 0.05,
        z: z + Math.sin(a) * d,
        sx: rad * 0.4,
        sy: 0.15,
        sz: rad * 0.3,
        ry: r() * 3,
      });
    }
    for (let k = 0; k < eggs; k++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * rad * 0.7;
      b.geo("egg", K.sphereGeo(), {
        x: x + Math.cos(a) * d,
        y: y + 0.12 + (1 - d / rad) * rad * 0.2,
        z: z + Math.sin(a) * d,
        sx: 0.15,
        sy: 0.19,
        sz: 0.15,
        ry: r() * 3,
        tint: [0.85 + r() * 0.1, 0.82, 0.62],
      });
    }
    for (let k = 0; k < 5; k++) {
      const a = r() * TAU,
        d = rad * (0.8 + r() * 0.6);
      b.box(
        "shell",
        x + Math.cos(a) * d,
        y,
        z + Math.sin(a) * d,
        0.35 + r() * 0.3,
        0.06,
        0.25,
        { yaw: r() * 3, tint: [0.55, 0.4, 0.28] },
      );
    }
    for (let k = 0; k < 4; k++) {
      const a = r() * TAU,
        d = rad * (0.9 + r() * 0.5);
      b.pipe(
        "bone_old",
        x + Math.cos(a) * d,
        y + 0.03,
        z + Math.sin(a) * d,
        x + Math.cos(a) * d + (r() - 0.5) * 0.5,
        y + 0.05,
        z + Math.sin(a) * d + (r() - 0.5) * 0.5,
        0.025,
        4,
      );
    }
    b.hplate(
      "decal",
      x,
      y + 0.013,
      z,
      rad * 3.2,
      rad * 3.2,
      r() * 3,
      K.decal("roach", 3),
    );
    if (o.glow !== false) {
      b.glow(x, y + 0.3, z, [0.35, 0.55, 0.22], rad * 1.6);
      if (b.lit) b.light(x, y + 0.6, z, [0.5, 0.8, 0.3], 0.5, rad * 3);
    }
  };
  /** Interior flood-water sheet at height y over a rect. */
  K.waterPlate = function (b, x0, z0, x1, z1, y) {
    b.face("water_int", x0, y, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
      uv: "top",
      grime: 0,
      tint: [0.75, 0.85, 0.8],
    });
  };
  /** Painted harbour view for an interior window (water + far skyline). */
  /**
   * Lamplit ROOM seen through a street window / open doorway (round 2): a one-point-perspective painting of the
   * interior on black, in the ADDITIVE 'neon' atlas so it glows like a lit room day and night (the lamp-quad panes
   * read as blank lightboxes). kind: 'hall' (the ferry waiting room: gallery, kiosk, pews, pendants) | 'market'
   * (brick warehouse: timber posts, lanterns, stalls, string lights). variant shifts the vanishing point so
   * neighbouring windows don't repeat. Returns an atlas rect for b.plate / b.quad('neon', …, {rect}).
   */
  K.roomView = function (kind, variant, w, h) {
    w = w || 256;
    h = h || 384;
    variant = variant || 0;
    return K.paint(
      "neon",
      "ph2_room_" + kind + "_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("rv" + kind + variant);
        const hall = kind === "hall";
        const vx = X + W * (0.5 + (variant - 1) * 0.22),
          vy = Y + H * (hall ? 0.52 : 0.5);
        const bw = W * 0.42,
          bh = H * (hall ? 0.4 : 0.34); // back wall
        const bx0 = vx - bw / 2,
          bx1 = vx + bw / 2,
          by0 = vy - bh * 0.62,
          by1 = vy + bh * 0.38;
        const col = (c, k) =>
          "rgb(" + c.map((v) => Math.round(v * (k || 1))).join(",") + ")";
        const wall = hall ? [120, 112, 84] : [96, 54, 38],
          floor = hall ? [92, 86, 70] : [84, 64, 44],
          ceil = hall ? [30, 44, 36] : [34, 24, 16];
        x.fillStyle = "#000";
        x.fillRect(X, Y, W, H);
        const poly = (pts, fill) => {
          x.fillStyle = fill;
          x.beginPath();
          x.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
          x.closePath();
          x.fill();
        };
        // floor, ceiling, side walls (gradients darken toward the viewer = light falls off from the room's lamps)
        let g = x.createLinearGradient(0, by1, 0, Y + H);
        g.addColorStop(0, col(floor, 1.1));
        g.addColorStop(1, col(floor, 0.45));
        poly(
          [
            [bx0, by1],
            [bx1, by1],
            [X + W, Y + H],
            [X, Y + H],
          ],
          g,
        );
        g = x.createLinearGradient(0, Y, 0, by0);
        g.addColorStop(0, col(ceil, 0.5));
        g.addColorStop(1, col(ceil, 1.2));
        poly(
          [
            [X, Y],
            [X + W, Y],
            [bx1, by0],
            [bx0, by0],
          ],
          g,
        );
        g = x.createLinearGradient(X, 0, bx0, 0);
        g.addColorStop(0, col(wall, 0.45));
        g.addColorStop(1, col(wall, 0.9));
        poly(
          [
            [X, Y],
            [bx0, by0],
            [bx0, by1],
            [X, Y + H],
          ],
          g,
        );
        g = x.createLinearGradient(X + W, 0, bx1, 0);
        g.addColorStop(0, col(wall, 0.45));
        g.addColorStop(1, col(wall, 0.9));
        poly(
          [
            [X + W, Y],
            [bx1, by0],
            [bx1, by1],
            [X + W, Y + H],
          ],
          g,
        );
        x.fillStyle = col(wall, 1.05);
        x.fillRect(bx0, by0, bw, bh);
        // floor boards / terrazzo joints converging on the vanishing point
        x.strokeStyle = hall ? "rgba(40,36,28,0.5)" : "rgba(30,20,12,0.55)";
        x.lineWidth = 1;
        for (let k = -8; k <= 8; k++) {
          x.beginPath();
          x.moveTo(vx + (k * bw) / 16, by1);
          x.lineTo(vx + (k * W) / 5, Y + H);
          x.stroke();
        }
        if (hall) {
          // back wall: slip gates (dark arches) + the departures board
          for (const k of [-1, 0, 1]) {
            const ax = vx + k * bw * 0.33;
            x.fillStyle = col([20, 24, 20]);
            x.fillRect(ax - bw * 0.1, by1 - bh * 0.5, bw * 0.2, bh * 0.5);
            x.beginPath();
            x.arc(ax, by1 - bh * 0.5, bw * 0.1, Math.PI, 0);
            x.fill();
          }
          x.fillStyle = "rgb(18,16,12)";
          x.fillRect(vx - bw * 0.3, by0 + bh * 0.08, bw * 0.6, bh * 0.16);
          x.fillStyle = "rgba(210,170,70,0.8)";
          for (let k = 0; k < 4; k++)
            x.fillRect(
              vx - bw * 0.27,
              by0 + bh * (0.11 + k * 0.03),
              bw * (0.3 + r() * 0.2),
              1.5,
            );
          // gallery: slab + railing running round the room at ~40 % height
          const gy = by0 + bh * 0.32;
          x.fillStyle = "rgb(26,34,28)";
          poly(
            [
              [X, Y + H * 0.2],
              [bx0, gy],
              [bx1, gy],
              [X + W, Y + H * 0.2],
              [X + W, Y + H * 0.24],
              [bx1, gy + 4],
              [bx0, gy + 4],
              [X, Y + H * 0.24],
            ],
            "rgb(26,34,28)",
          );
          x.strokeStyle = "rgba(60,80,64,0.9)";
          x.lineWidth = 1.2;
          for (let k = 0; k <= 12; k++) {
            const t = k / 12,
              px = X + (bx0 - X) * t,
              py = Y + H * 0.2 + (gy - Y - H * 0.2) * t;
            x.beginPath();
            x.moveTo(px, py);
            x.lineTo(px, py - (1 - t) * H * 0.08 - 6);
            x.stroke();
            const qx = X + W - (X + W - bx1) * t;
            x.beginPath();
            x.moveTo(qx, py);
            x.lineTo(qx, py - (1 - t) * H * 0.08 - 6);
            x.stroke();
          }
          // iron columns under the gallery
          x.fillStyle = "rgb(20,28,22)";
          for (let k = 1; k < 4; k++) {
            const t = k / 4,
              cx = X + (bx0 - X) * t,
              cw = 7 * (1 - t) + 2;
            x.fillRect(
              cx - cw / 2,
              Y + H * 0.24 + (gy - Y - H * 0.24) * t,
              cw,
              Y +
                H -
                (Y + H - by1) * t -
                (Y + H * 0.24 + (gy - Y - H * 0.24) * t),
            );
            const qx = X + W - (X + W - bx1) * t;
            x.fillRect(
              qx - cw / 2,
              Y + H * 0.24 + (gy - Y - H * 0.24) * t,
              cw,
              Y +
                H -
                (Y + H - by1) * t -
                (Y + H * 0.24 + (gy - Y - H * 0.24) * t),
            );
          }
          // pews in rows
          x.fillStyle = "rgb(34,24,16)";
          for (let k = 0; k < 5; k++) {
            const t = 0.25 + k * 0.15,
              py = by1 + (Y + H - by1) * t,
              pw = bw * (0.5 + t * 1.3);
            x.fillRect(
              vx - pw / 2 - (k % 2 ? pw * 0.1 : 0),
              py - 5 - t * 8,
              pw * 0.42,
              4 + t * 10,
            );
            x.fillRect(vx + pw * 0.08, py - 5 - t * 8, pw * 0.42, 4 + t * 10);
          }
          // the information kiosk: dark drum + brass clock glow
          const ky = by1 + (Y + H - by1) * 0.12;
          x.fillStyle = "rgb(22,16,12)";
          x.fillRect(vx - bw * 0.16, ky - bh * 0.28, bw * 0.32, bh * 0.28);
          x.fillRect(vx - bw * 0.2, ky - bh * 0.34, bw * 0.4, bh * 0.05);
          x.fillStyle = "rgba(230,220,180,0.85)";
          x.beginPath();
          x.arc(vx, ky - bh * 0.42, bw * 0.05, 0, 6.3);
          x.fill();
        } else {
          // brick coursing on the walls
          x.fillStyle = "rgba(30,16,10,0.35)";
          for (let yy = by0; yy < by1; yy += 3) x.fillRect(bx0, yy, bw, 1);
          // timber posts in two rows receding to the back
          for (let k = 0; k < 5; k++) {
            const t = k / 5,
              py0 = Y + H * 0.05 + (by0 - Y - H * 0.05) * t,
              py1 = Y + H - (Y + H - by1) * t,
              cw = 10 * (1 - t) + 2;
            for (const e of [-1, 1]) {
              const px = vx + e * (W * 0.34 * (1 - t) + bw * 0.28 * t);
              x.fillStyle = "rgb(28,18,10)";
              x.fillRect(px - cw / 2, py0, cw, py1 - py0);
            }
            x.fillStyle = "rgba(28,18,10,0.9)";
            x.fillRect(X, py0 - 2, W, 3 * (1 - t) + 1);
          }
          // stalls: counters with striped awnings (muted), goods glinting
          for (let k = 0; k < 4; k++) {
            const t = 0.2 + k * 0.18,
              e = k % 2 ? 1 : -1,
              sx = vx + e * (bw * 0.3 + W * 0.3 * (1 - t)),
              sy = by1 + (Y + H - by1) * (1 - t) * 0.5,
              sw = 26 * (1 - t) + 10,
              sh = 20 * (1 - t) + 8;
            x.fillStyle = "rgb(40,26,16)";
            x.fillRect(sx - sw / 2, sy - sh * 0.5, sw, sh * 0.5);
            for (let q = 0; q < 5; q++) {
              x.fillStyle = q % 2 ? "rgb(120,40,30)" : "rgb(140,120,90)";
              x.fillRect(
                sx - sw / 2 + (q * sw) / 5,
                sy - sh * 1.1,
                sw / 5 + 0.5,
                sh * 0.3,
              );
            }
            x.fillStyle = "rgba(220,180,110,0.8)";
            for (let q = 0; q < 4; q++)
              x.fillRect(
                sx - sw / 2 + 2 + r() * (sw - 4),
                sy - sh * 0.62,
                2,
                2,
              );
          }
          // a couple of shoppers in silhouette
          for (let k = 0; k < 3; k++) {
            const t = 0.3 + r() * 0.5,
              px = vx + (r() - 0.5) * bw * 1.4,
              py = by1 + (Y + H - by1) * t * 0.6,
              s = 16 * (0.4 + t);
            x.fillStyle = "rgb(12,9,6)";
            x.fillRect(px - s * 0.18, py - s, s * 0.36, s);
            x.beginPath();
            x.arc(px, py - s - s * 0.12, s * 0.13, 0, 6.3);
            x.fill();
          }
        }
        // lamps: pendant glows along the ceiling (both kinds) + string lights in the market
        for (let k = 0; k < 6; k++) {
          const t = k / 6,
            ly = Y + H * 0.1 + (by0 - Y - H * 0.1) * t + 8,
            lx = vx + (k % 2 ? 1 : -1) * (W * 0.25 * (1 - t) + bw * 0.2 * t),
            rr = 26 * (1 - t) + 8;
          const lg = x.createRadialGradient(lx, ly, 0, lx, ly, rr);
          lg.addColorStop(0, "rgba(255,214,150,0.95)");
          lg.addColorStop(0.25, "rgba(230,160,80,0.45)");
          lg.addColorStop(1, "rgba(200,120,50,0)");
          x.fillStyle = lg;
          x.fillRect(lx - rr, ly - rr, rr * 2, rr * 2);
        }
        if (!hall)
          for (let k = 0; k < 24; k++) {
            const t = k / 24,
              px = X + W * t,
              py = Y + H * 0.16 + Math.sin(t * Math.PI) * H * 0.1;
            x.fillStyle = "rgba(255,200,120,0.9)";
            x.fillRect(px, py, 2, 2);
          }
        // window grime: darker edges + a dirt band at the bottom (it's seen through old glass / a dim doorway)
        const vg = x.createRadialGradient(
          X + W / 2,
          Y + H * 0.5,
          W * 0.2,
          X + W / 2,
          Y + H * 0.5,
          W * 0.85,
        );
        vg.addColorStop(0, "rgba(0,0,0,0)");
        vg.addColorStop(1, "rgba(0,0,0,0.7)");
        x.fillStyle = vg;
        x.fillRect(X, Y, W, H);
        K.stains && K.stains(x, X, Y, W, H, 6, 811 + variant, 0.25, [0, 0, 0]);
      },
    );
  };

  K.harborView = function (variant, w, h) {
    w = w || 512;
    h = h || 192;
    return K.paint(
      "pics",
      "ph2_harborview_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("hv" + variant);
        const g = x.createLinearGradient(0, Y, 0, Y + H * 0.6);
        g.addColorStop(0, "#8e9a86");
        g.addColorStop(1, "#c8c4a4");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H * 0.6);
        // far shore / skyline
        x.fillStyle = "#5e6456";
        let px = X;
        while (px < X + W) {
          const bw = 6 + r() * 26,
            bh = H * (0.04 + r() * (variant === 1 ? 0.3 : 0.12));
          x.fillRect(px, Y + H * 0.6 - bh, bw, bh);
          px += bw + r() * 4;
        }
        const w2 = x.createLinearGradient(0, Y + H * 0.6, 0, Y + H);
        w2.addColorStop(0, "#5e6a58");
        w2.addColorStop(1, "#2c3a30");
        x.fillStyle = w2;
        x.fillRect(X, Y + H * 0.6, W, H * 0.4);
        x.strokeStyle = "rgba(210,220,190,0.25)";
        x.lineWidth = 1;
        for (let k = 0; k < 60; k++) {
          const yy = Y + H * (0.62 + r() * 0.36),
            xx = X + r() * W,
            ww = 6 + r() * 30;
          x.beginPath();
          x.moveTo(xx, yy);
          x.lineTo(xx + ww, yy);
          x.stroke();
        }
        K.grain(x, X, Y, W, H, 20, 900 + variant);
      },
    );
  };
})();
