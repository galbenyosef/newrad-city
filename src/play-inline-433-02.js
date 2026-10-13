// play-inline-433 02 — tint
// Lines 25-324 of readable/play-inline-433.pretty.js (statement-aligned).
  const PK = G._ppk;
  const K = PK.kit;
  const PI = Math.PI;

  // ------------------------------------------------------------------
  // Castellated parapet
  // ------------------------------------------------------------------
  /**
   * Battlements on the wall-surface line A→B whose top of wall is y, projecting toward (nx,nz).
   * o: {mat, tint, trim (corbel mat), trimTint, thick, wallH (solid parapet height), merlonH, merlonW, pitch, corbels (bool)}
   */
  K.crenel = function (b, ax, az, bx, bz, y, nx, nz, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.2) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const yaw = Math.atan2(-uz, ux);
    const mat = o.mat || "brick_red",
      tint = o.tint || [0.66, 0.36, 0.28];
    const trim = o.trim || "brownstone",
      tt = o.trimTint || [0.72, 0.56, 0.44];
    const th = o.thick || 0.45,
      wH = o.wallH !== undefined ? o.wallH : 0.75,
      mH = o.merlonH || 0.75,
      mW = o.merlonW || 0.8,
      pitch = o.pitch || 1.6;
    const off = th / 2 - 0.05;
    const C = (t, d) => [ax + ux * t + nx * d, az + uz * t + nz * d];
    // corbel table: a projecting course with little brackets below it
    const cc = C(len / 2, 0.12);
    b.box(trim, cc[0], y - 0.32, cc[1], len + 0.3, 0.28, 0.34, {
      yaw,
      tint: tt,
      faces: "nsewtb",
    });
    if (o.corbels !== false) {
      const n = Math.max(1, Math.floor(len / 0.6));
      for (let i = 0; i <= n; i++) {
        const p = C((len * i) / n, 0.1);
        b.box(trim, p[0], y - 0.62, p[1], 0.16, 0.3, 0.22, { yaw, tint: tt });
      }
    }
    // solid parapet
    const pc = C(len / 2, off);
    b.box(mat, pc[0], y, pc[1], len + th * 0.5, wH, th, {
      yaw,
      tint,
      faces: "nsewt",
    });
    // merlons + stone coping
    const nm = Math.max(1, Math.floor((len + 0.2) / pitch));
    const step = len / nm;
    for (let i = 0; i < nm; i++) {
      const p = C(step * (i + 0.5), off);
      b.box(mat, p[0], y + wH, p[1], Math.min(mW, step * 0.62), mH, th, {
        yaw,
        tint,
        faces: "nsewt",
      });
      b.box(
        trim,
        p[0],
        y + wH + mH,
        p[1],
        Math.min(mW, step * 0.62) + 0.08,
        0.1,
        th + 0.08,
        { yaw, tint: tt, faces: "nsewt" },
      );
    }
  };

  // ------------------------------------------------------------------
  // Octagonal tower
  // ------------------------------------------------------------------
  /**
   * o: {mat, tint, trim, trimTint, bands:[y...], slits:[{y, h, faces:[k...]}], battlement (default true),
   *     col (default true), cap (flat roof mat), capY}
   * Face k faces the direction angle k·45° (0 = +x, 90° = −z, i.e. counter-clockwise seen from above).
   */
  K.octTower = function (b, cx, cz, r, y0, h, o) {
    o = o || {};
    const mat = o.mat || "brick_red",
      tint = o.tint || [0.66, 0.36, 0.28];
    const trim = o.trim || "brownstone",
      tt = o.trimTint || [0.72, 0.56, 0.44];
    const y1 = y0 + h;
    const V = (k, rr, y) => {
      const a = PI / 8 + (k * PI) / 4;
      return [cx + Math.cos(a) * rr, y, cz - Math.sin(a) * rr];
    };
    for (let k = 0; k < 8; k++) {
      const a = (k * PI) / 4,
        nx = Math.cos(a),
        nz = -Math.sin(a);
      b.quadN(
        mat,
        V(k - 1, r, y0),
        V(k, r, y0),
        V(k, r, y1),
        V(k - 1, r, y1),
        [nx, 0, nz],
        { tint },
      );
    }
    // stone bands (slightly proud rings)
    const ring = (y, hh, rr, m, t) => {
      for (let k = 0; k < 8; k++) {
        const a = (k * PI) / 4,
          nx = Math.cos(a),
          nz = -Math.sin(a);
        b.quadN(
          m,
          V(k - 1, rr, y),
          V(k, rr, y),
          V(k, rr, y + hh),
          V(k - 1, rr, y + hh),
          [nx, 0, nz],
          { tint: t },
        );
        b.quadN(
          m,
          V(k - 1, r, y + hh),
          V(k, r, y + hh),
          V(k, rr, y + hh),
          V(k - 1, rr, y + hh),
          [0, 1, 0],
          { tint: t },
        );
        b.quadN(
          m,
          V(k - 1, rr, y),
          V(k, rr, y),
          V(k, r, y),
          V(k - 1, r, y),
          [0, -1, 0],
          { tint: t },
        );
      }
    };
    for (const y of o.bands || []) ring(y, 0.22, r + 0.07, trim, tt);
    // arrow-slit / lancet windows
    for (const s of o.slits || []) {
      for (const k of s.faces) {
        const a = (k * PI) / 4,
          nx = Math.cos(a),
          nz = -Math.sin(a);
        const ap = r * Math.cos(PI / 8);
        K.lancet(
          b,
          cx + nx * ap,
          y0 + s.y,
          cz + nz * ap,
          nx,
          nz,
          s.w || 0.42,
          s.h || 1.4,
          {
            state: s.state || "dark",
            surround: trim,
            tintA: tt,
            tintB: [0.55, 0.3, 0.24],
            fw: 0.1,
            depth: 0.08,
            mullion: false,
            rose: false,
            sill: true,
          },
        );
      }
    }
    // top: corbelled ring, parapet + merlons, flat roof
    const R2 = r + 0.25;
    ring(y1 - 0.35, 0.35, r + 0.18, trim, tt);
    if (o.battlement !== false) {
      for (let k = 0; k < 8; k++) {
        const a = (k * PI) / 4,
          nx = Math.cos(a),
          nz = -Math.sin(a);
        b.quadN(
          mat,
          V(k - 1, R2, y1),
          V(k, R2, y1),
          V(k, R2, y1 + 0.7),
          V(k - 1, R2, y1 + 0.7),
          [nx, 0, nz],
          { tint },
        );
        b.quadN(
          mat,
          V(k, R2 - 0.35, y1),
          V(k - 1, R2 - 0.35, y1),
          V(k - 1, R2 - 0.35, y1 + 0.7),
          V(k, R2 - 0.35, y1 + 0.7),
          [-nx, 0, -nz],
          { tint: tint.map((v) => v * 0.8) },
        );
        b.quadN(
          trim,
          V(k - 1, R2, y1 + 0.7),
          V(k, R2, y1 + 0.7),
          V(k, R2 - 0.35, y1 + 0.7),
          V(k - 1, R2 - 0.35, y1 + 0.7),
          [0, 1, 0],
          { tint: tt },
        );
        const m = V(k - 0.5, R2 * Math.cos(PI / 8) - 0.17, y1 + 0.7);
        b.box(mat, m[0], y1 + 0.7, m[2], R2 * 0.55, 0.62, 0.36, {
          yaw: a + PI / 2,
          tint,
        });
        b.box(trim, m[0], y1 + 1.32, m[2], R2 * 0.55 + 0.06, 0.08, 0.42, {
          yaw: a + PI / 2,
          tint: tt,
        });
      }
    }
    const top = [];
    for (let k = 0; k < 8; k++) top.push(V(k, r, y1));
    for (let k = 1; k < 7; k++)
      b.quadN(
        o.cap || "concrete_dark",
        top[0],
        top[k],
        top[k + 1],
        top[k + 1],
        [0, 1, 0],
        { tint: [0.35, 0.33, 0.31] },
      );
    if (o.col !== false)
      b.col(
        cx - r * 0.92,
        y0,
        cz - r * 0.92,
        cx + r * 0.92,
        y1 + 0.7,
        cz + r * 0.92,
        { tag: "building" },
      );
  };

  // ------------------------------------------------------------------
  // Faceted artificial rockwork
  // ------------------------------------------------------------------
  const ROCKS = {};
  function rockGeo(seed) {
    const k = (((seed | 0) % 6) + 6) % 6;
    if (ROCKS[k]) return ROCKS[k];
    const g = new THREE.IcosahedronGeometry(1, 2);
    const p = g.attributes.position;
    const U = G.util;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const n =
        U.noise2(x * 1.7 + k * 3.1, z * 1.7 + y * 1.3) * 0.55 +
        U.noise2(x * 4.1 - y * 2, z * 4.3 + k) * 0.22;
      const s = 0.72 + n;
      x *= s;
      y *= s * 0.9;
      z *= s;
      if (y < -0.25) y = -0.25 + (y + 0.25) * 0.15; // flattish bottom
      p.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return (ROCKS[k] = g);
  }
  /** Rock boulder: centre (x, y = base, z), radii sx/sy/sz. o: {mat, tint, yaw, col (default true), seed} */
  K.rock = function (b, x, y, z, sx, sy, sz, o) {
    o = o || {};
    const seed = o.seed !== undefined ? o.seed : (x * 13 + z * 7) | 0;
    b.geo(o.mat || "granite", rockGeo(seed), {
      x,
      y: y + sy * 0.22,
      z,
      sx,
      sy,
      sz,
      ry: o.yaw || seed * 0.7,
      tint: o.tint || [0.62, 0.6, 0.56],
      grime: o.grime !== undefined ? o.grime : 0.55,
    });
    if (o.col !== false)
      b.col(
        x - sx * 0.72,
        y,
        z - sz * 0.72,
        x + sx * 0.72,
        y + sy * 0.95,
        z + sz * 0.72,
        { tag: "rock", surface: "concrete", walkable: o.walk !== false },
      );
  };

  // ------------------------------------------------------------------
  // Cage bars
  // ------------------------------------------------------------------
  /** Bars from A to B, y0..y0+h. o: {step, r, mat, tint, bent:[t...] (bent bar positions m), gap:{t,w}, col} */
