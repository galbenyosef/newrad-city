/* src/poi_bridges/01_kit.js */
/* =====================================================================
 * LANDMARKS B — architecture kit (classical & gothic parts)
 * Columns, colonnades, pediments, balustrades, hollow rooms with door
 * gaps (+colliders), gothic pinnacles, pointed-arch windows, polygon
 * extrusions with setbacks, window bands along polygon edges.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pbr) return;
  const PF = G._pbr;
  const TAU = Math.PI * 2;
  const K = (PF.kit = {});

  /** Classical column (base, fluted-look shaft via many segments, capital, abacus). */
  K.column = function (b, key, x, y, z, h, r, opts) {
    opts = opts || {};
    const capKey = opts.capKey || key;
    b.box(key, x, y, z, r * 2.6, r * 0.5, r * 2.6, { seg: false, grime: 0.5 }); // plinth
    b.cyl(key, x, y + r * 0.5, z, r * 1.15, r * 1.25, r * 0.35, 16, {
      hSeg: 1,
    }); // torus-ish base
    const shaftH = h - r * 0.85 - r * 1.1;
    b.cyl(key, x, y + r * 0.85, z, r * 0.88, r, shaftH, opts.flutes || 18, {
      hSeg: Math.max(2, Math.round(shaftH / 3)),
      grime: 0.45,
    });
    b.cyl(
      capKey,
      x,
      y + r * 0.85 + shaftH,
      z,
      r * 1.35,
      r * 0.9,
      r * 0.75,
      12,
      { hSeg: 1 },
    ); // capital bell
    b.box(capKey, x, y + h - r * 0.35, z, r * 2.9, r * 0.35, r * 2.9, {
      seg: false,
    }); // abacus
    if (opts.collide !== false)
      PF.col(x, z, r * 2.2, r * 2.2, y, y + h, 0, { walkable: false });
  };
  /** Row of columns between (x0,z0) and (x1,z1), n columns. */
  K.colonnade = function (b, key, x0, z0, x1, z1, y, h, n, r, opts) {
    for (let i = 0; i < n; i++) {
      const t = n === 1 ? 0.5 : i / (n - 1);
      K.column(b, key, x0 + (x1 - x0) * t, y, z0 + (z1 - z0) * t, h, r, opts);
    }
  };
  /** Triangular pediment with cornice; (cx, y, cz) = centre of the base, width w, height h, depth d, facing ry. */
  K.pediment = function (b, key, cx, y, cz, w, h, d, ry, opts) {
    opts = opts || {};
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(0, h);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    b.add(key, g, { m: PF.m4(cx, y, cz, ry), grime: 0.5 });
    // raking cornices
    const ang = Math.atan2(h, w / 2),
      len = Math.hypot(w / 2, h) + 0.4;
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (const sg of [-1, 1]) {
      const lx = (sg * w) / 4,
        ly = h / 2;
      const px = cx + lx * c + (d / 2 + 0.1) * s * 0,
        pz = cz - lx * s;
      b.add(opts.corniceKey || key, new THREE.BoxGeometry(len, 0.45, d + 0.5), {
        m: PF.m4(px, y + ly + 0.1, pz, ry, 0, -sg * ang),
        grime: 0.4,
      });
    }
    b.add(
      opts.corniceKey || key,
      new THREE.BoxGeometry(w + 0.8, 0.5, d + 0.5),
      { m: PF.m4(cx, y - 0.25, cz, ry), grime: 0.4 },
    );
    // tympanum sculpture group suggestion: low relief blobs
    if (opts.relief) {
      const r = PF.rng(cx * 3 + cz);
      for (let i = 0; i < opts.relief; i++) {
        const t = (i + 0.5) / opts.relief - 0.5;
        const hh = (1 - Math.abs(t) * 2) * h * 0.75;
        if (hh < 0.4) continue;
        const lx = t * w * 0.85;
        b.add(
          opts.reliefKey || key,
          new THREE.CapsuleGeometry(0.35, Math.max(0.1, hh - 0.8), 2, 6),
          {
            m: PF.m4(
              cx + lx * c + (d / 2) * s,
              y + hh / 2 + 0.2,
              cz - lx * s + (d / 2) * c,
              ry,
              0,
              (r() - 0.5) * 0.5,
            ),
            grime: 0.5,
          },
        );
      }
    }
  };
  /** Balustrade along points (array of [x,z]) at height y. */
  K.balustrade = function (b, key, pts, y, h, opts) {
    opts = opts || {};
    h = h || 1.0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]),
        ry = Math.atan2(-(c[1] - a[1]), c[0] - a[0]);
      const mx = (a[0] + c[0]) / 2,
        mz = (a[1] + c[1]) / 2;
      b.box(key, mx, y, mz, len, 0.15, 0.45, { ry, seg: false });
      b.box(key, mx, y + h - 0.16, mz, len + 0.1, 0.16, 0.5, {
        ry,
        seg: false,
      });
      const n = Math.floor(len / 0.45);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        const px = a[0] + (c[0] - a[0]) * t,
          pz = a[1] + (c[1] - a[1]) * t;
        b.lathe(
          key,
          [
            [0.06, 0],
            [0.12, 0.1],
            [0.09, (h - 0.3) * 0.5],
            [0.14, (h - 0.3) * 0.75],
            [0.07, h - 0.3],
          ],
          6,
          px,
          y + 0.15,
          pz,
          { grime: 0.3 },
        );
      }
      if (opts.urns)
        for (const p of [a, c]) {
          b.box(key, p[0], y, p[1], 0.6, h, 0.6, { seg: false });
          b.lathe(
            key,
            [
              [0.05, 0],
              [0.25, 0.1],
              [0.35, 0.45],
              [0.2, 0.7],
              [0.28, 0.8],
              [0.02, 0.95],
            ],
            8,
            p[0],
            y + h,
            p[1],
            {},
          );
        }
      if (opts.collide)
        PF.colWall(a[0], a[1], c[0], c[1], 0.5, y - 0.2, y + h, {
          walkable: false,
        });
    }
  };
  /**
   * Hollow rectangular room: 4 walls (thickness t) from y0 to y1 with door gaps.
   * doors: [{side:'n'|'s'|'e'|'w', c: centre coordinate along the wall, w: width, h: height}]
   * Adds colliders. Returns nothing.
   */
  K.room = function (b, key, x0, z0, x1, z1, y0, y1, t, doors, opts) {
    opts = opts || {};
    doors = doors || [];
    const sides = {
      n: { a: x0, bb: x1, fixed: z0, horiz: true },
      s: { a: x0, bb: x1, fixed: z1, horiz: true },
      w: { a: z0, bb: z1, fixed: x0, horiz: false },
      e: { a: z0, bb: z1, fixed: x1, horiz: false },
    };
    for (const k in sides) {
      const sd = sides[k];
      const ds = doors.filter((d) => d.side === k).sort((p, q) => p.c - q.c);
      let cur = sd.a;
      const seg = (from, to, ya, yb) => {
        if (to - from < 0.05 || yb - ya < 0.05) return;
        if (sd.horiz) {
          const zc = k === "n" ? z0 + t / 2 : z1 - t / 2;
          b.boxMM(key, from, ya, zc - t / 2, to, yb, zc + t / 2, {
            grime: opts.grime,
            segLen: 4,
          });
          if (!opts.noCollide)
            PF.colMM(from, ya, zc - t / 2, to, yb, zc + t / 2, {
              walkable: false,
            });
        } else {
          const xc = k === "w" ? x0 + t / 2 : x1 - t / 2;
          b.boxMM(key, xc - t / 2, ya, from, xc + t / 2, yb, to, {
            grime: opts.grime,
            segLen: 4,
          });
          if (!opts.noCollide)
            PF.colMM(xc - t / 2, ya, from, xc + t / 2, yb, to, {
              walkable: false,
            });
        }
      };
      for (const d of ds) {
        seg(cur, d.c - d.w / 2, y0, y1);
        seg(d.c - d.w / 2, d.c + d.w / 2, y0 + d.h, y1); // lintel wall above the door
        cur = d.c + d.w / 2;
      }
      seg(cur, sd.bb, y0, y1);
    }
  };
  /** Gothic pinnacle: square shaft + crockets + pyramid spire. */
  K.pinnacle = function (b, key, x, y, z, w, h, opts) {
    opts = opts || {};
    b.box(key, x, y, z, w, h * 0.55, w, { seg: false, grime: 0.4 });
    b.box(key, x, y + h * 0.55, z, w * 1.15, h * 0.05, w * 1.15, {
      seg: false,
    });
    const sp = new THREE.ConeGeometry(w * 0.62, h * 0.42, 4, 1);
    sp.rotateY(Math.PI / 4);
    b.add(opts.spireKey || key, sp, {
      m: PF.m4(x, y + h * 0.6 + h * 0.21, z),
      grime: 0.3,
    });
    if (opts.finial !== false)
      b.sphere(opts.spireKey || key, x, y + h * 1.02, z, w * 0.12, {});
  };
  /** Pointed (lancet) arch window quad-with-frame on a wall facing ry. */
  K.lancet = function (b, key, frameKey, x, y, z, w, h, ry) {
    const sh = new THREE.Shape();
    const spring = h - w * 0.8;
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(w / 2, spring);
    sh.quadraticCurveTo(w / 2, h - w * 0.15, 0, h);
    sh.quadraticCurveTo(-w / 2, h - w * 0.15, -w / 2, spring);
    sh.closePath();
    const g = new THREE.ShapeGeometry(sh, 4);
    b.add(key, g, { m: PF.m4(x, y, z, ry), uv: "box", grime: 0.1, noAO: true });
    if (frameKey) {
      const c = Math.cos(ry),
        s = Math.sin(ry);
      b.box(
        frameKey,
        x - (w / 2 + 0.1) * c + 0.06 * s,
        y,
        z + (w / 2 + 0.1) * s + 0.06 * c,
        0.2,
        spring,
        0.2,
        { ry, seg: false },
      );
      b.box(
        frameKey,
        x + (w / 2 + 0.1) * c + 0.06 * s,
        y,
        z - (w / 2 + 0.1) * s + 0.06 * c,
        0.2,
        spring,
        0.2,
        { ry, seg: false },
      );
    }
  };
  /** Offset a closed polygon (CCW or CW) by d (positive = outward for CW in x/z with our conventions). */
  K.offsetPoly = function (poly, d) {
    // compute signed area to know orientation
    let A = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p0 = poly[(i - 1 + poly.length) % poly.length],
        p1 = poly[i],
        p2 = poly[(i + 1) % poly.length];
      const n1 = norm([(p1[1] - p0[1]) * sgn, -(p1[0] - p0[0]) * sgn]);
      const n2 = norm([(p2[1] - p1[1]) * sgn, -(p2[0] - p1[0]) * sgn]);
      const bis = norm([n1[0] + n2[0], n1[1] + n2[1]]);
      const cosH = Math.max(0.25, bis[0] * n1[0] + bis[1] * n1[1]);
      out.push([p1[0] + (bis[0] * d) / cosH, p1[1] + (bis[1] * d) / cosH]);
    }
    return out;
  };
  function norm(v) {
    const l = Math.hypot(v[0], v[1]) || 1;
    return [v[0] / l, v[1] / l];
  }
  /** Extrude a world-space XZ polygon from y0 to y1 (walls + end faces). */
  K.prism = function (b, key, poly, y0, y1, opts) {
    opts = opts || {};
    const sh = new THREE.Shape();
    sh.moveTo(poly[0][0], -poly[0][1]);
    for (let i = 1; i < poly.length; i++) sh.lineTo(poly[i][0], -poly[i][1]);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, {
      depth: y1 - y0,
      bevelEnabled: false,
      curveSegments: opts.curveSegments || 6,
    });
    g.rotateX(-Math.PI / 2);
    g.translate(0, y0, 0);
    // subdivide? walls get grime by height through vertex count; add horizontal cuts via stacked prisms if tall
    return b.add(key, g, Object.assign({ grime: 0.55 }, opts));
  };
  /** Tall prism split into bands so vertex-colour grime reads on tall walls. */
  K.prismBands = function (b, key, poly, y0, y1, band, opts) {
    band = band || 8;
    for (let y = y0; y < y1 - 0.01; y += band)
      K.prism(b, key, poly, y, Math.min(y1, y + band), opts);
  };
  /**
   * Windows along every edge of a polygon (outward-facing). opts: {y0, floors, floorH, w, h, spacing, inset (0.02),
   * frameKey, sill, broken, boarded, lit, skipEdge(i), piers: key (vertical ribs between windows), pierDepth}
   */
  K.polyWindows = function (b, poly, opts) {
    let A = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const r = PF.rng(opts.seed || 1);
    for (let i = 0; i < poly.length; i++) {
      if (opts.skipEdge && opts.skipEdge(i)) continue;
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      const dx = q[0] - p[0],
        dz = q[1] - p[1],
        len = Math.hypot(dx, dz);
      if (len < (opts.minEdge || 3)) continue;
      const ux = dx / len,
        uz = dz / len;
      const nx = uz * sgn,
        nz = -ux * sgn; // outward normal
      const ry = Math.atan2(nx, nz); // quad facing the normal
      const n = Math.max(
        1,
        Math.floor((len - (opts.margin || 1.5) * 2) / opts.spacing),
      );
      const start = (len - (n - 1) * opts.spacing) / 2;
      for (let f = 0; f < opts.floors; f++) {
        const y = opts.y0 + f * opts.floorH;
        for (let k = 0; k < n; k++) {
          const t = start + k * opts.spacing;
          const px = p[0] + ux * t + nx * (opts.inset || 0.03),
            pz = p[1] + uz * t + nz * (opts.inset || 0.03);
          const roll = r();
          let key = "glass_dark";
          if (roll < (opts.broken === undefined ? 0.25 : opts.broken))
            key = "glass_broken";
          else if (roll < (opts.broken || 0.25) + (opts.boarded || 0.05))
            key = "planks";
          else if (opts.lit && roll > 1 - opts.lit) key = "window_lit";
          b.quad(key, px, y + opts.h / 2, pz, opts.w, opts.h, {
            ry,
            uv: "box",
            grime: 0.1,
            noAO: true,
          });
          if (opts.sill !== false && opts.frameKey)
            b.box(
              opts.frameKey,
              px + nx * 0.1,
              y - 0.12,
              pz + nz * 0.1,
              opts.w + 0.25,
              0.12,
              0.22,
              { ry, seg: false, grime: 0.3 },
            );
          if (opts.lintel && opts.frameKey)
            b.box(
              opts.frameKey,
              px + nx * 0.08,
              y + opts.h,
              pz + nz * 0.08,
              opts.w + 0.25,
              0.2,
              0.16,
              { ry, seg: false, grime: 0.3 },
            );
        }
      }
      if (opts.piers) {
        const pd = opts.pierDepth || 0.35;
        for (let k = 0; k <= n; k++) {
          const t = start + (k - 0.5) * opts.spacing;
          const px = p[0] + ux * t + (nx * pd) / 2,
            pz = p[1] + uz * t + (nz * pd) / 2;
          b.box(
            opts.piers,
            px,
            opts.y0 - 0.5,
            pz,
            opts.pierW || 0.55,
            opts.floors * opts.floorH + 0.5,
            pd,
            { ry, grime: 0.5, segLen: 6 },
          );
        }
      }
    }
  };
  /** Wall colliders along a closed polygon (thickness t). */
  K.polyColliders = function (poly, y0, y1, t, opts) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      PF.colWall(
        p[0],
        p[1],
        q[0],
        q[1],
        t || 1,
        y0,
        y1,
        Object.assign({ walkable: false }, opts || {}),
      );
    }
  };
  /**
   * Natural rock cliff wrapped around a closed polygon: a noise-displaced skirt from y0 (flared out
   * at the bottom) up to y1 with a ragged top lip. opts: {amp, flare, step, seed}.
   */
  K.cliff = function (b, key, poly, y0, y1, opts) {
    opts = opts || {};
    const amp = opts.amp || 1.2,
      flare = opts.flare || 2.5,
      step = opts.step || 1.1,
      seed = opts.seed || 3.7;
    const U = G.util;
    let A = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    // resample the perimeter
    const ring = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const n = Math.max(1, Math.round(len / step));
      const nx = ((q[1] - p[1]) / len) * sgn,
        nz = (-(q[0] - p[0]) / len) * sgn;
      for (let k = 0; k < n; k++) {
        const t = k / n;
        ring.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, nx, nz]);
      }
    }
    // smooth normals
    const N = ring.length;
    const nrm = ring.map((r, i) => {
      const a = ring[(i - 1 + N) % N],
        c = ring[(i + 1) % N];
      const x = a[2] + r[2] * 2 + c[2],
        z = a[3] + r[3] * 2 + c[3];
      const l = Math.hypot(x, z) || 1;
      return [x / l, z / l];
    });
    const rows = Math.max(3, Math.round((y1 - y0) / 0.8));
    const pos = [],
      idx = [];
    for (let j = 0; j <= rows; j++) {
      const v = j / rows;
      for (let i = 0; i <= N; i++) {
        const ii = i % N,
          r = ring[ii],
          n = nrm[ii];
        const s = (i / N) * 97.0;
        const ns =
          U.fbm2(s * 0.8 + seed, v * 4.5 + seed * 0.3, 4) -
          0.5 +
          (U.noise2(s * 2.6, v * 9 + seed) - 0.5) * 0.35;
        const ledge = Math.floor(v * 5 + U.noise2(s * 0.2, seed) * 2) / 5; // stratified ledges (schist layers)
        const out =
          ns * amp * 2 + (1 - v) * (1 - v) * flare + (v - ledge) * amp * 0.6;
        let y = y0 + (y1 - y0) * v;
        if (j === rows) y += (U.noise2(s * 0.7, seed + 9) - 0.5) * 0.35;
        pos.push(r[0] + n[0] * out, y, r[1] + n[1] * out);
      }
    }
    const W = N + 1;
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < N; i++) {
        const a = j * W + i,
          c = a + 1,
          d = a + W,
          e = d + 1;
        if (sgn > 0) idx.push(a, d, c, c, d, e);
        else idx.push(a, c, d, c, e, d);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return b.add(
      key,
      g,
      Object.assign({ grime: 0.45, aoH: (y1 - y0) * 0.6 }, opts),
    );
  };
  /** Circular fountain basin with rim; water surface at y + depth*0.4. */
  K.fountain = function (b, x, y, z, R, opts) {
    opts = opts || {};
    const ring = [];
    for (let i = 0; i <= 32; i++) {
      const a = (i / 32) * TAU;
      ring.push([x + Math.cos(a) * R, z + Math.sin(a) * R]);
    }
    b.lathe(
      opts.key || "granite",
      [
        [R - 0.5, 0],
        [R + 0.1, 0],
        [R + 0.15, 0.55],
        [R - 0.05, 0.7],
        [R - 0.55, 0.7],
        [R - 0.55, 0.1],
      ],
      40,
      x,
      y,
      z,
      { grime: 0.5 },
    );
    const w = new THREE.CircleGeometry(R - 0.5, 32);
    w.rotateX(-Math.PI / 2);
    b.add(opts.water === false ? "dirt" : "water", w, {
      m: PF.m4(x, y + 0.3, z),
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    // rim collider ring (low)
    for (let i = 0; i < 16; i++) {
      const a = ((i + 0.5) / 16) * TAU;
      PF.col(
        x + Math.cos(a) * (R - 0.2),
        z + Math.sin(a) * (R - 0.2),
        2 * R * Math.sin(Math.PI / 16) + 0.3,
        0.7,
        y,
        y + 0.7,
        -a + Math.PI / 2,
        { surface: "concrete" },
      );
    }
    return ring;
  };
})();
