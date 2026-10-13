// play-inline-238 03 — opts
// Lines 331-569 of readable/play-inline-238.pretty.js (statement-aligned).
  K.polyWindows = function (b, poly, opts) {
    let A = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const r = PR.rng(opts.seed || 1);
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
      PR.colWall(
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
      m: PR.m4(x, y + 0.3, z),
      uv: "box",
      grime: 0.1,
      noAO: true,
    });
    // rim collider ring (low)
    for (let i = 0; i < 16; i++) {
      const a = ((i + 0.5) / 16) * TAU;
      PR.col(
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
