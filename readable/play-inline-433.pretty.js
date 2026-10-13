/* src/poi_park/08_park.js */
/* =====================================================================
 * NEW RAD CITY — poi_park / 08_park.js
 * Construction helpers specific to the two Central Park POIs
 * (all local coords on a kit builder `b`):
 *   K.crenel       castellated parapet (corbel table + merlons) along a façade line
 *   K.octTower     octagonal brick tower with bands, slit windows and battlements
 *   K.rock         faceted artificial rockwork boulder (zoo enclosures, grottoes)
 *   K.bars         cage bars (round steel bars between rails, optional bent gap)
 *   K.critter      small bronze animal figure (Delacorte Clock band, reliefs)
 *   K.chandelier   crystal chandelier (brass rings, bulbs, crystal drops, baked light)
 *   K.lanternRun   string of paper/glass lanterns with sag (dark set + lit set)
 *   K.parkLamp     Central Park cast-iron lamp post with acorn globe
 *   K.wireFrame    rusted topiary wire armature (King Kong, elephant, rabbit)
 *   K.umbrella     patio umbrella over a café table
 *   K.nightGarden  painted "view through the glass" backdrop cell
 *   K.mural        WPA-style mural panel cell (Arsenal lobby)
 *   K.parkMapCell  top-down painted Central Park map (the Arsenal diorama)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
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
  K.bars = function (b, ax, az, bx, bz, y0, h, o) {
    o = o || {};
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.05) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const step = o.step || 0.13,
      rr = o.r || 0.018,
      mat = o.mat || "black_iron",
      tint = o.tint || [0.2, 0.19, 0.18];
    const n = Math.max(1, Math.round(len / step));
    for (const yy of [y0 + 0.08, y0 + h - 0.08])
      b.beam(mat, ax, yy, az, bx, yy, bz, 0.06, 0.06, { tint });
    if (h > 2.4)
      b.beam(mat, ax, y0 + h * 0.55, az, bx, y0 + h * 0.55, bz, 0.04, 0.05, {
        tint,
      });
    for (let i = 0; i <= n; i++) {
      const t = (len * i) / n,
        px = ax + ux * t,
        pz = az + uz * t;
      if (o.gap && Math.abs(t - o.gap.t) < o.gap.w / 2) continue;
      const bent = (o.bent || []).some((q) => Math.abs(q - t) < step * 0.6);
      if (bent) {
        const side = ((i * 7) % 2 ? 1 : -1) * 0.22;
        b.pipe(
          mat,
          px,
          y0,
          pz,
          px + uz * side,
          y0 + h * 0.5,
          pz - ux * side,
          rr,
          5,
          { tint },
        );
        b.pipe(
          mat,
          px + uz * side,
          y0 + h * 0.5,
          pz - ux * side,
          px,
          y0 + h,
          pz,
          rr,
          5,
          { tint },
        );
      } else b.pipe(mat, px, y0, pz, px, y0 + h, pz, rr, 5, { tint });
    }
    if (o.col !== false) {
      const seg = (t0, t1) => {
        K.lineCol(
          b,
          ax + ux * t0,
          az + uz * t0,
          ax + ux * t1,
          az + uz * t1,
          y0,
          y0 + h,
          0.1,
          { tag: "bars", walkable: false, surface: "metal" },
        );
      };
      if (o.gap) {
        const g0 = o.gap.t - o.gap.w / 2,
          g1 = o.gap.t + o.gap.w / 2;
        if (g0 > 0.05) seg(0, g0);
        if (g1 < len - 0.05) seg(g1, len);
      } else seg(0, len);
    }
  };

  // ------------------------------------------------------------------
  // Little bronze animals (Delacorte Clock band, reliefs, finials)
  // ------------------------------------------------------------------
  /** kind: bear|elephant|hippo|goat|kangaroo|penguin|monkey|lion|sheep. Stands at (x,y,z), faces local −z rotated by yaw. s = scale (≈ height m). */
  K.critter = function (b, kind, x, y, z, yaw, s, o) {
    o = o || {};
    const mat = o.mat || "bronze",
      t = o.tint || [0.42, 0.52, 0.42];
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    const L = (lx, ly, lz) => [
      x + (lx * c + lz * sn) * s,
      y + ly * s,
      z + (-lx * sn + lz * c) * s,
    ];
    const ell = (lx, ly, lz, rx, ry, rz, tt) => {
      const p = L(lx, ly, lz);
      b.geo(mat, K.sphereGeo(), {
        x: p[0],
        y: p[1],
        z: p[2],
        sx: rx * s,
        sy: ry * s,
        sz: rz * s,
        ry: yaw,
        tint: tt || t,
        grime: 0.3,
      });
    };
    const limb = (lx, ly, lz, ex, ey, ez, r) => {
      const p = L(lx, ly, lz),
        q = L(ex, ey, ez);
      b.pipe(mat, p[0], p[1], p[2], q[0], q[1], q[2], r * s, 5, {
        tint: t,
        grime: 0.3,
      });
    };
    const legs4 = (hx, hz, top, r) => {
      for (const [lx, lz] of [
        [-hx, -hz],
        [hx, -hz],
        [-hx, hz],
        [hx, hz],
      ])
        limb(lx, top, lz, lx, 0, lz, r);
    };
    const upright =
      kind === "bear" ||
      kind === "kangaroo" ||
      kind === "penguin" ||
      kind === "monkey";
    if (kind === "penguin") {
      ell(0, 0.42, 0, 0.2, 0.36, 0.18);
      ell(0, 0.86, -0.02, 0.13, 0.13, 0.13);
      const bk = L(0, 0.84, -0.16);
      b.cyl(mat, bk[0], bk[1], bk[2], 0.04 * s, 0.0, 0.1 * s, 5, {
        tint: [0.6, 0.5, 0.3],
      });
      for (const e of [-1, 1])
        limb(e * 0.2, 0.62, 0, e * 0.3, 0.3, 0.02, 0.035);
      if (o.drum !== false) {
        const d = L(0, 0.35, -0.24);
        b.cyl(mat, d[0], d[1], d[2], 0.13 * s, 0.13 * s, 0.14 * s, 10, {
          tint: [0.55, 0.45, 0.3],
        });
      }
      return;
    }
    if (upright) {
      const tall = kind === "kangaroo" ? 1.0 : kind === "monkey" ? 0.7 : 0.95;
      ell(0, 0.48 * tall, 0, 0.22, 0.34 * tall, 0.18);
      ell(0, 0.92 * tall, -0.03, 0.14, 0.14, 0.14);
      for (const e of [-1, 1]) {
        limb(e * 0.1, 0.25, 0, e * 0.12, 0, -0.04, 0.06);
        limb(e * 0.19, 0.72 * tall, -0.02, e * 0.26, 0.55 * tall, -0.22, 0.045);
      }
      if (kind === "bear") {
        for (const e of [-1, 1]) ell(e * 0.1, 1.03, -0.02, 0.05, 0.05, 0.03);
        const tb = L(0.28, 0.58, -0.26);
        b.geo(mat, new THREE.TorusGeometry(0.12 * s, 0.025 * s, 4, 10), {
          x: tb[0],
          y: tb[1],
          z: tb[2],
          ry: yaw,
          tint: [0.6, 0.5, 0.3],
        });
      }
      if (kind === "kangaroo") {
        for (const e of [-1, 1]) ell(e * 0.06, 1.1, 0, 0.03, 0.09, 0.03);
        limb(0, 0.3, 0.12, 0, 0.02, 0.6, 0.06);
        ell(0, 0.86, -0.14, 0.06, 0.05, 0.08);
        const h2 = L(0.1, 0.9, -0.25);
        b.cyl(mat, h2[0], h2[1], h2[2], 0.02 * s, 0.07 * s, 0.22 * s, 6, {
          tint: [0.6, 0.5, 0.3],
        });
      }
      if (kind === "monkey") {
        limb(0, 0.3, 0.12, 0.05, 0.7, 0.3, 0.025);
        for (const e of [-1, 1]) ell(e * 0.13, 0.66, -0.03, 0.04, 0.05, 0.02);
        const hm = L(0.3, 0.9, -0.1);
        b.box(mat, hm[0], hm[1], hm[2], 0.06 * s, 0.24 * s, 0.06 * s, {
          yaw,
          tint: [0.4, 0.3, 0.2],
        });
      }
      return;
    }
    // quadrupeds
    const big = kind === "elephant" ? 1.25 : kind === "hippo" ? 1.1 : 1;
    const bodyY =
      kind === "hippo"
        ? 0.42
        : kind === "goat" || kind === "sheep"
          ? 0.55
          : 0.62;
    ell(0, bodyY, 0.05, 0.26 * big, 0.22 * big, 0.42 * big);
    legs4(
      0.16 * big,
      0.26 * big,
      bodyY - 0.05,
      kind === "elephant" || kind === "hippo" ? 0.07 : 0.04,
    );
    const hz = -0.46 * big,
      hy = bodyY + (kind === "hippo" ? 0.05 : 0.18);
    ell(0, hy, hz, 0.15 * big, 0.14 * big, kind === "hippo" ? 0.22 : 0.16);
    if (kind === "elephant") {
      limb(0, hy - 0.05, hz - 0.12, 0, hy - 0.45, hz - 0.2, 0.05);
      for (const e of [-1, 1])
        ell(e * 0.17, hy + 0.02, hz + 0.05, 0.02, 0.17, 0.13);
    }
    if (kind === "goat" || kind === "sheep") {
      for (const e of [-1, 1])
        limb(
          e * 0.06,
          hy + 0.1,
          hz + 0.03,
          e * 0.14,
          hy + 0.22,
          hz + 0.14,
          0.02,
        );
      if (kind === "sheep")
        ell(0, bodyY + 0.05, 0.05, 0.3, 0.26, 0.46, [0.6, 0.62, 0.52]);
    }
    if (kind === "lion") {
      ell(0, hy + 0.02, hz + 0.04, 0.22, 0.22, 0.14);
      limb(0, bodyY, 0.44, 0.05, bodyY + 0.2, 0.66, 0.025);
    }
    if (kind === "hippo") {
      const v = L(0.25, 0.5, -0.25);
      b.box(mat, v[0], v[1], v[2], 0.05 * s, 0.35 * s, 0.1 * s, {
        yaw: yaw + 0.4,
        tint: [0.4, 0.3, 0.2],
      });
    }
  };

  // ------------------------------------------------------------------
  // Crystal chandelier
  // ------------------------------------------------------------------
  /**
   * Hangs from ceiling y `ceil` down to y (bottom ring). o: {lit (default true), color, intensity, radius, lightOpts, tiers, dead}
   * Lit bulbs go to `o.litB` builder if given (night-only group), otherwise into b.
   */
  K.chandelier = function (b, x, y, z, r, o) {
    o = o || {};
    const ceil = o.ceil !== undefined ? o.ceil : y + 1.2;
    const col = K.tint(o.color || [1, 0.82, 0.55]);
    const tiers = o.tiers || 2;
    const LB = o.litB || b;
    b.pipe("brass", x, y + 0.3, z, x, ceil, z, 0.018, 5, { grime: 0.2 });
    b.cyl("brass", x, ceil - 0.08, z, 0.18, 0.12, 0.08, 10, { grime: 0.2 });
    b.geo("brass", K.sphereGeo(), {
      x,
      y: y + 0.25,
      z,
      sx: 0.09,
      sy: 0.16,
      sz: 0.09,
      grime: 0.2,
    });
    for (let t = 0; t < tiers; t++) {
      const rr = r * (1 - t * 0.38),
        yy = y + t * 0.36;
      b.geo("brass", new THREE.TorusGeometry(rr, 0.02, 4, 18), {
        x,
        y: yy,
        z,
        rx: PI / 2,
        grime: 0.2,
      });
      const n = Math.max(6, Math.round(rr * 14));
      for (let i = 0; i < n; i++) {
        const a = (i / n) * PI * 2,
          px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        b.pipe("brass", x, yy + 0.2, z, px, yy, pz, 0.008, 3);
        // crystal drops (pale, catch the light)
        b.geo("glass_clear", K.octGeo(), {
          x: px,
          y: yy - 0.12,
          z: pz,
          sx: 0.025,
          sy: 0.06,
          sz: 0.025,
          tint: [0.9, 0.92, 0.95],
          grime: 0,
        });
        if (i % 2 === 0) {
          b.cyl("ceramic", px, yy, pz, 0.018, 0.018, 0.08, 5, {
            tint: [0.92, 0.9, 0.84],
          });
          if (!o.dead)
            LB.geo("lamp", K.octGeo(), {
              x: px,
              y: yy + 0.11,
              z: pz,
              s: 0.035,
              tint: col,
            });
          else
            b.geo("glass", K.octGeo(), {
              x: px,
              y: yy + 0.11,
              z: pz,
              s: 0.035,
              tint: [0.5, 0.48, 0.45],
            });
        }
      }
      // festoons of crystal beads between the rings
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * PI * 2 + 0.25;
        b.pipe(
          "glass_clear",
          x + Math.cos(a) * rr * 0.9,
          yy - 0.05,
          z + Math.sin(a) * rr * 0.9,
          x + Math.cos(a + 0.5) * rr * 0.9,
          yy - 0.05,
          z + Math.sin(a + 0.5) * rr * 0.9,
          0.012,
          3,
          { tint: [0.9, 0.92, 0.95] },
        );
      }
    }
    b.geo("glass_clear", K.octGeo(), {
      x,
      y: y - 0.25,
      z,
      sx: 0.07,
      sy: 0.18,
      sz: 0.07,
      tint: [0.9, 0.92, 0.95],
      grime: 0,
    });
    if (!o.dead) {
      if (o.intensity !== 0)
        b.light(
          x,
          y - 0.1,
          z,
          col,
          o.intensity || 1.2,
          o.radius || 8,
          o.lightOpts,
        );
      LB.glow(
        x,
        y + 0.1,
        z,
        [col[0] * 0.8, col[1] * 0.72, col[2] * 0.55],
        o.glowSize || r * 3.2,
      );
    }
  };
  let _oct = null,
    _cone = null,
    _lantLo = null;
  K.lanternLoGeo = function () {
    if (_lantLo) return _lantLo;
    const pts = [];
    for (let i = 0; i <= 5; i++) {
      const t = i / 5,
        a = (t - 0.5) * Math.PI;
      pts.push(
        new THREE.Vector2(
          Math.cos(a) * (0.7 + 0.3 * Math.cos(a)),
          Math.sin(a) * 0.8,
        ),
      );
    }
    return (_lantLo = new THREE.LatheGeometry(pts, 6));
  };
  K.octGeo = () => _oct || (_oct = new THREE.OctahedronGeometry(1, 0));
  K.coneGeo = () => _cone || (_cone = new THREE.ConeGeometry(1, 1, 8, 1, true));

  // ------------------------------------------------------------------
  // Lantern strings
  // ------------------------------------------------------------------
  /**
   * String of lanterns from A to B ([x,y,z]) with sag. Dark lanterns + cord go to b; lit lanterns to `lit` (may be null).
   * o: {n, sag, kind:'bulb'|'paper', color, glow, light:{i, r, box} (baked light into b, interior use)}
   */
  K.lanternRun = function (b, lit, A, B, o) {
    o = o || {};
    const n =
      o.n ||
      Math.max(3, Math.round(Math.hypot(B[0] - A[0], B[2] - A[2]) / 0.9));
    const sag = o.sag !== undefined ? o.sag : 0.6;
    const col = K.tint(o.color || [1, 0.74, 0.38]);
    const P = (t) => [
      A[0] + (B[0] - A[0]) * t,
      A[1] + (B[1] - A[1]) * t - Math.sin(t * PI) * sag,
      A[2] + (B[2] - A[2]) * t,
    ];
    for (let i = 0; i < n; i++) {
      const p = P(i / n),
        q = P((i + 1) / n);
      b.pipe("black_iron", p[0], p[1], p[2], q[0], q[1], q[2], 0.005, 3);
    }
    for (let i = 1; i < n; i++) {
      const p = P(i / n);
      if (o.kind === "paper") {
        const tt = [col[0] * 0.95, col[1] * 0.55, col[2] * 0.35];
        // paper lanterns in the Tavern's colours (ivory / red / amber), a dark wire cap and bottom ring on each
        const PAPER = [
          [0.9, 0.84, 0.68],
          [0.74, 0.2, 0.14],
          [0.86, 0.62, 0.3],
        ];
        b.geo("fabric", K.lanternLoGeo(), {
          x: p[0],
          y: p[1] - 0.2,
          z: p[2],
          s: 0.11,
          tint: PAPER[i % 3],
          grime: 0.12,
        });
        b.cyl("black_iron", p[0], p[1] - 0.11, p[2], 0.035, 0.035, 0.03, 6, {
          tint: [0.15, 0.14, 0.13],
        });
        b.pipe(
          "black_iron",
          p[0],
          p[1] - 0.1,
          p[2],
          p[0],
          p[1],
          p[2],
          0.004,
          3,
        );
        if (lit) {
          lit.geo("lamp", K.lanternLoGeo(), {
            x: p[0],
            y: p[1] - 0.2,
            z: p[2],
            s: 0.115,
            tint: tt,
          });
          lit.glow(
            p[0],
            p[1] - 0.2,
            p[2],
            [col[0] * 0.8, col[1] * 0.55, col[2] * 0.3],
            o.glow || 1.1,
          );
        }
      } else {
        b.geo("glass", K.octGeo(), {
          x: p[0],
          y: p[1] - 0.07,
          z: p[2],
          s: 0.05,
          tint: [0.55, 0.52, 0.45],
        });
        if (lit) {
          lit.geo("lamp", K.octGeo(), {
            x: p[0],
            y: p[1] - 0.07,
            z: p[2],
            s: 0.055,
            tint: col,
          });
          lit.glow(
            p[0],
            p[1] - 0.07,
            p[2],
            [col[0] * 0.75, col[1] * 0.62, col[2] * 0.35],
            o.glow || 0.8,
          );
        }
      }
      if (o.light && i % (o.light.every || 3) === 0)
        b.light(
          p[0],
          p[1] - 0.3,
          p[2],
          col,
          o.light.i || 0.35,
          o.light.r || 3.5,
          o.light.box ? { box: o.light.box } : undefined,
        );
    }
  };

  // ------------------------------------------------------------------
  // Central Park lamp post (cast iron, acorn globe)
  // ------------------------------------------------------------------
  K.parkLamp = function (b, lit, x, y, z, o) {
    o = o || {};
    const h = o.h || 3.6,
      t = [0.14, 0.15, 0.13];
    b.cyl("black_iron", x, y, z, 0.2, 0.16, 0.5, 8, { tint: t });
    b.cyl("black_iron", x, y + 0.5, z, 0.09, 0.06, h - 0.9, 8, { tint: t });
    for (let k = 0; k < 3; k++)
      b.cyl("black_iron", x, y + 0.9 + k * 0.9, z, 0.1, 0.1, 0.05, 8, {
        tint: t,
      });
    b.cyl("black_iron", x, y + h - 0.4, z, 0.07, 0.16, 0.15, 8, { tint: t });
    if (o.broken)
      b.cyl("glass", x, y + h - 0.25, z, 0.12, 0.05, 0.12, 8, {
        tint: [0.5, 0.52, 0.5],
      });
    else {
      b.geo("glass", K.sphereGeo(), {
        x,
        y: y + h - 0.02,
        z,
        sx: 0.2,
        sy: 0.27,
        sz: 0.2,
        tint: [0.62, 0.62, 0.56],
        grime: 0.4,
      });
      if (lit) {
        lit.geo("lamp", K.sphereGeo(), {
          x,
          y: y + h - 0.02,
          z,
          sx: 0.205,
          sy: 0.275,
          sz: 0.205,
          tint: o.color || [1, 0.8, 0.5],
        });
        lit.glow(x, y + h, z, [0.9, 0.66, 0.34], o.glow || 2.6);
      }
    }
    b.cyl("black_iron", x, y + h + 0.25, z, 0.05, 0.02, 0.18, 6, { tint: t });
    if (o.col !== false)
      b.col(x - 0.18, y, z - 0.18, x + 0.18, y + h, z + 0.18, {
        tag: "lamp",
        walkable: false,
        surface: "metal",
      });
  };

  // ------------------------------------------------------------------
  // Topiary wire armatures (the famous topiaries, 22 years later)
  // ------------------------------------------------------------------
  function ringPts(cx, cy, cz, rx, ry, plane, yaw, n) {
    const c = Math.cos(yaw),
      s = Math.sin(yaw),
      out = [];
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * PI * 2;
      let lx, ly, lz;
      if (plane === "xz") {
        lx = Math.cos(a) * rx;
        ly = 0;
        lz = Math.sin(a) * ry;
      } else if (plane === "yz") {
        lx = 0;
        ly = Math.sin(a) * ry;
        lz = Math.cos(a) * rx;
      } else {
        lx = Math.cos(a) * rx;
        ly = Math.sin(a) * ry;
        lz = 0;
      }
      out.push([cx + lx * c + lz * s, cy + ly, cz - lx * s + lz * c]);
    }
    return out;
  }
  K.wireFrame = function (b, kind, x, y, z, yaw, s, o) {
    o = o || {};
    const mat = "rust",
      t = o.tint || [0.5, 0.36, 0.26];
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    const W = (lx, ly, lz) => [
      x + (lx * c + lz * sn) * s,
      y + ly * s,
      z + (-lx * sn + lz * c) * s,
    ];
    const ring = (lx, ly, lz, rx, ry, plane) => {
      const p0 = W(lx, ly, lz);
      const pts = ringPts(p0[0], p0[1], p0[2], rx * s, ry * s, plane, yaw, 12);
      for (let i = 0; i < pts.length - 1; i++)
        b.pipe(
          mat,
          pts[i][0],
          pts[i][1],
          pts[i][2],
          pts[i + 1][0],
          pts[i + 1][1],
          pts[i + 1][2],
          0.012 * Math.max(1, s * 0.5),
          3,
          { tint: t, grime: 0.3 },
        );
    };
    const rod = (a, bb) => {
      const p = W(a[0], a[1], a[2]),
        q = W(bb[0], bb[1], bb[2]);
      b.pipe(
        mat,
        p[0],
        p[1],
        p[2],
        q[0],
        q[1],
        q[2],
        0.015 * Math.max(1, s * 0.5),
        3,
        { tint: t, grime: 0.3 },
      );
    };
    if (kind === "kong") {
      // King Kong beating his chest: legs, barrel body, raised fists, head
      for (const e of [-1, 1]) {
        for (let k = 0; k < 3; k++)
          ring(e * 0.28, 0.15 + k * 0.28, 0, 0.16, 0.14, "xz");
        rod([e * 0.28, 0, 0], [e * 0.3, 0.8, 0]);
      }
      for (let k = 0; k < 4; k++)
        ring(0, 0.9 + k * 0.28, 0, 0.5 - Math.abs(k - 1.5) * 0.06, 0.34, "xz");
      for (const e of [-1, 1]) {
        ring(e * 0.62, 1.55, -0.1, 0.12, 0.12, "xz");
        rod([e * 0.45, 1.65, 0], [e * 0.72, 1.9, -0.15]);
        rod([e * 0.72, 1.9, -0.15], [e * 0.6, 2.3, -0.2]);
        ring(e * 0.6, 2.35, -0.2, 0.13, 0.13, "xy");
      }
      ring(0, 2.05, -0.05, 0.22, 0.2, "xz");
      ring(0, 2.2, -0.05, 0.24, 0.22, "yz");
      ring(0, 2.2, -0.05, 0.2, 0.22, "xy");
      for (const e of [-1, 1]) rod([e * 0.4, 0.8, 0], [e * 0.45, 1.7, 0]);
      rod([0, 0.85, 0.34], [0, 1.9, 0.3]);
      rod([0, 0.85, -0.34], [0, 1.9, -0.3]);
    } else if (kind === "elephant") {
      for (let k = 0; k < 5; k++)
        ring(0, 1.1, -0.6 + k * 0.3, 0.42, 0.45, "xy");
      for (const [lx, lz] of [
        [-0.25, -0.5],
        [0.25, -0.5],
        [-0.25, 0.5],
        [0.25, 0.5],
      ]) {
        ring(lx, 0.3, lz, 0.12, 0.12, "xz");
        rod([lx, 0, lz], [lx, 0.8, lz]);
      }
      ring(0, 1.35, -0.95, 0.28, 0.3, "xy");
      for (const e of [-1, 1]) ring(e * 0.3, 1.35, -0.9, 0.22, 0.25, "yz");
      rod([0, 1.2, -1.15], [0, 0.8, -1.3]);
      rod([0, 0.8, -1.3], [0, 0.5, -1.2]);
      rod([-0.42, 1.1, -0.6], [-0.42, 1.1, 0.6]);
      rod([0.42, 1.1, -0.6], [0.42, 1.1, 0.6]);
      rod([0, 1.55, -0.6], [0, 1.55, 0.6]);
    } else {
      // rabbit
      for (let k = 0; k < 3; k++)
        ring(0, 0.3 + k * 0.2, 0, 0.3 - k * 0.04, 0.25, "xz");
      ring(0, 0.95, -0.05, 0.17, 0.17, "xz");
      for (const e of [-1, 1]) {
        ring(e * 0.07, 1.3, 0, 0.05, 0.2, "xy");
      }
    }
    if (o.base !== false)
      b.cyl("concrete", x, y - 0.02, z, 0.8 * s, 0.85 * s, 0.25, 10, {
        tint: [0.55, 0.5, 0.42],
      });
    // dead ivy strands clinging to the frame
    const r = K.rng((x * 17 + z * 5) | 0);
    for (let i = 0; i < 6; i++) {
      const a = r() * PI * 2,
        h0 = r() * 1.2;
      const p = [Math.cos(a) * 0.35, h0, Math.sin(a) * 0.35];
      rod(p, [
        p[0] + (r() - 0.5) * 0.3,
        h0 + 0.5 + r() * 0.5,
        p[2] + (r() - 0.5) * 0.3,
      ]);
    }
    if (o.col !== false) {
      const p = W(0, 0, 0);
      b.col(
        p[0] - 0.55 * s,
        y,
        p[2] - 0.55 * s,
        p[0] + 0.55 * s,
        y + 2 * s,
        p[2] + 0.55 * s,
        { tag: "topiary", walkable: false, surface: "metal" },
      );
    }
  };

  // ------------------------------------------------------------------
  // Patio umbrella
  // ------------------------------------------------------------------
  K.umbrella = function (b, x, y, z, r, o) {
    o = o || {};
    const tint = o.tint || [0.25, 0.42, 0.3],
      h = o.h || 2.3;
    b.pipe("steel", x, y, z, x, y + h + 0.1, z, 0.025, 5, {
      tint: [0.6, 0.6, 0.58],
    });
    const tilt = o.tilt || 0;
    b.geo("fabric", K.coneGeo(), {
      x: x + tilt * 0.3,
      y: y + h - 0.2,
      z,
      sx: r,
      sy: 0.55,
      sz: r,
      rz: tilt,
      tint,
      grime: 0.5,
    });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * PI * 2;
      b.pipe(
        "steel",
        x,
        y + h + 0.05,
        z,
        x + Math.cos(a) * r,
        y + h - 0.47,
        z + Math.sin(a) * r,
        0.008,
        3,
        { tint: [0.5, 0.5, 0.48] },
      );
    }
  };

  // ------------------------------------------------------------------
  // Painted cells
  // ------------------------------------------------------------------
  /** "Through the glass" backdrop: the lantern garden at night. */
  K.nightGarden = function (i, atlas) {
    return K.paint(
      atlas || "pics",
      "ppk_nightgarden_" + i,
      256,
      320,
      function (x, X, Y, W, H) {
        const r = K.rng("ng" + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#0a0f14");
        g.addColorStop(0.55, "#141c1c");
        g.addColorStop(1, "#1e2218");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // tree silhouettes
        x.strokeStyle = "#05080a";
        x.lineCap = "round";
        for (let k = 0; k < 3; k++) {
          const bx = X + W * (0.15 + k * 0.35 + (r() - 0.5) * 0.1),
            by = Y + H;
          const br = (px, py, a, len, w, d) => {
            const ex = px + Math.cos(a) * len,
              ey = py - Math.sin(a) * len;
            x.lineWidth = w;
            x.beginPath();
            x.moveTo(px, py);
            x.lineTo(ex, ey);
            x.stroke();
            if (d > 0) {
              br(
                ex,
                ey,
                a + 0.5 + (r() - 0.5) * 0.4,
                len * 0.7,
                w * 0.62,
                d - 1,
              );
              br(
                ex,
                ey,
                a - 0.5 + (r() - 0.5) * 0.4,
                len * 0.7,
                w * 0.62,
                d - 1,
              );
            }
          };
          br(bx, by, PI / 2 + (r() - 0.5) * 0.2, H * 0.32, 10, 4);
        }
        // string lights draped through the branches
        for (let k = 0; k < 5; k++) {
          const y0 = Y + H * (0.2 + r() * 0.4),
            sag = H * 0.06;
          for (let j = 0; j < 14; j++) {
            const t = j / 13,
              px = X + W * t,
              py = y0 + Math.sin(t * PI) * sag + (r() - 0.5) * 4;
            const gg = x.createRadialGradient(px, py, 0, px, py, 7);
            gg.addColorStop(0, "rgba(255,220,150,0.95)");
            gg.addColorStop(0.4, "rgba(255,170,80,0.35)");
            gg.addColorStop(1, "rgba(255,150,60,0)");
            x.fillStyle = gg;
            x.fillRect(px - 7, py - 7, 14, 14);
          }
        }
        // reflection haze on the glass
        const hz = x.createLinearGradient(X, Y, X + W, Y + H);
        hz.addColorStop(0, "rgba(255,255,255,0.06)");
        hz.addColorStop(0.5, "rgba(255,255,255,0)");
        hz.addColorStop(1, "rgba(255,255,255,0.04)");
        x.fillStyle = hz;
        x.fillRect(X, Y, W, H);
        K.stains(x, X, Y, W, H, 6, i + 3, 0.25, [60, 70, 50]);
      },
    );
  };

  /** WPA-style mural panel (sepia-green): i selects the scene. */
  const MURAL_SCENES = [
    "soldiers",
    "animals",
    "skaters",
    "builders",
    "parade",
    "sheep",
  ];
  K.mural = function (i, w, h) {
    w = w || 384;
    h = h || 192;
    const scene = MURAL_SCENES[i % MURAL_SCENES.length];
    return K.paint(
      "pics",
      "ppk_mural_" + i + "_" + w,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("mural" + i);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#b8b48e");
        g.addColorStop(0.62, "#8e9a6c");
        g.addColorStop(1, "#5c6844");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // distant skyline + park trees
        x.fillStyle = "rgba(80,90,90,0.55)";
        for (let k = 0; k < 16; k++) {
          const bw = W * (0.03 + r() * 0.05),
            bh = H * (0.15 + r() * 0.3);
          x.fillRect(X + r() * W, Y + H * 0.55 - bh, bw, bh);
        }
        x.fillStyle = "rgba(46,70,40,0.8)";
        for (let k = 0; k < 10; k++) {
          x.beginPath();
          x.arc(X + r() * W, Y + H * 0.58, H * (0.06 + r() * 0.08), 0, PI * 2);
          x.fill();
        }
        const fig = (fx, fy, s, col, pose) => {
          x.fillStyle = col;
          x.beginPath();
          x.arc(fx, fy - s * 0.9, s * 0.12, 0, PI * 2);
          x.fill();
          x.fillRect(fx - s * 0.12, fy - s * 0.78, s * 0.24, s * 0.45);
          x.fillRect(fx - s * 0.11, fy - s * 0.34, s * 0.09, s * 0.34);
          x.fillRect(fx + s * 0.02, fy - s * 0.34, s * 0.09, s * 0.34);
          x.save();
          x.translate(fx, fy - s * 0.72);
          x.rotate(pose);
          x.fillRect(-s * 0.2, 0, s * 0.07, s * 0.36);
          x.rotate(-pose * 2);
          x.fillRect(s * 0.13, 0, s * 0.07, s * 0.36);
          x.restore();
        };
        const cols = ["#3a2a20", "#5a3a28", "#2e3e4a", "#6a4a30", "#40382a"];
        if (scene === "animals" || scene === "sheep") {
          for (let k = 0; k < 7; k++) {
            const ax = X + W * (0.08 + k * 0.13),
              ay = Y + H * (0.82 + r() * 0.08),
              s = H * (0.12 + r() * 0.08);
            x.fillStyle =
              scene === "sheep"
                ? "#d8d4c0"
                : r.pick(["#6a5a48", "#8a7a5a", "#4a4038", "#d0ccb8"]);
            x.beginPath();
            x.ellipse(ax, ay - s * 0.5, s * 0.6, s * 0.35, 0, 0, PI * 2);
            x.fill();
            x.beginPath();
            x.ellipse(
              ax - s * 0.6,
              ay - s * 0.7,
              s * 0.2,
              s * 0.18,
              0,
              0,
              PI * 2,
            );
            x.fill();
            for (const e of [-0.4, -0.15, 0.2, 0.4])
              x.fillRect(ax + e * s, ay - s * 0.3, s * 0.08, s * 0.3);
          }
          fig(X + W * 0.9, Y + H * 0.92, H * 0.5, "#3a2a20", 0.3);
        } else if (scene === "skaters") {
          x.fillStyle = "rgba(220,230,235,0.8)";
          x.fillRect(X, Y + H * 0.7, W, H * 0.3);
          for (let k = 0; k < 8; k++)
            fig(
              X + W * (0.06 + k * 0.12),
              Y + H * (0.88 + r() * 0.06),
              H * (0.36 + r() * 0.1),
              cols[k % 5],
              0.6 + r() * 0.6,
            );
        } else {
          for (let k = 0; k < 9; k++)
            fig(
              X + W * (0.05 + k * 0.11),
              Y + H * (0.9 + r() * 0.05),
              H * (0.42 + r() * 0.12),
              cols[k % 5],
              scene === "parade" ? 1.2 : 0.2 + r() * 0.4,
            );
          if (scene === "soldiers") {
            x.strokeStyle = "#2a2018";
            x.lineWidth = 3;
            for (let k = 0; k < 9; k++) {
              const fx = X + W * (0.05 + k * 0.11);
              x.beginPath();
              x.moveTo(fx + H * 0.08, Y + H * 0.45);
              x.lineTo(fx + H * 0.14, Y + H * 0.85);
              x.stroke();
            }
          }
          if (scene === "builders") {
            x.fillStyle = "#6a5040";
            x.fillRect(X + W * 0.3, Y + H * 0.25, W * 0.4, H * 0.1);
            x.fillRect(X + W * 0.33, Y + H * 0.35, W * 0.03, H * 0.5);
            x.fillRect(X + W * 0.64, Y + H * 0.35, W * 0.03, H * 0.5);
          }
          if (scene === "parade") {
            x.fillStyle = "#a02a20";
            x.fillRect(X + W * 0.12, Y + H * 0.2, W * 0.12, H * 0.08);
            x.fillStyle = "#e8e0cc";
            x.fillRect(X + W * 0.12, Y + H * 0.28, W * 0.12, H * 0.04);
          }
        }
        // painted border + age
        x.strokeStyle = "#3a3020";
        x.lineWidth = 6;
        x.strokeRect(X + 3, Y + 3, W - 6, H - 6);
        x.fillStyle = "rgba(120,90,40,0.18)";
        x.fillRect(X, Y, W, H);
        K.stains(x, X, Y, W, H, 14, i * 7 + 1, 0.45, [50, 40, 20]);
        K.streaks(x, X, Y, W, H, 18, i + 5, 0.3);
        // flaking: pale plaster showing through
        for (let k = 0; k < 12; k++) {
          x.fillStyle = "rgba(210,200,180,0.8)";
          x.beginPath();
          x.ellipse(
            X + r() * W,
            Y + r() * H,
            4 + r() * 16,
            3 + r() * 9,
            r() * 3,
            0,
            PI * 2,
          );
          x.fill();
        }
      },
    );
  };

  /** Top-down Central Park map (for the Arsenal's diorama table); drawn from LAYOUT so it matches the world. */
  K.parkMapCell = function () {
    return K.paint("pics", "ppk_parkmap", 256, 680, function (x, X, Y, W, H) {
      const L = G.LAYOUT,
        P = L.PARK,
        F = L.PARK_FEATURES;
      const sx = W / (P.x1 - P.x0),
        sz = H / (P.z1 - P.z0);
      const M = (wx, wz) => [X + (wx - P.x0) * sx, Y + (P.z1 - wz) * sz]; // north (−z) at the top of the cell → v up
      x.fillStyle = "#6e7a4e";
      x.fillRect(X, Y, W, H);
      for (let i = 0; i < 400; i++) {
        x.fillStyle = "rgba(40,60,30,0.25)";
        x.fillRect(X + Math.random() * W, Y + Math.random() * H, 2, 2);
      }
      const rect = (r, col) => {
        const a = M(r.x0, r.z1),
          b = M(r.x1, r.z0);
        x.fillStyle = col;
        x.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
      };
      rect(F.sheepMeadow, "#8a9460");
      rect(F.reservoir, "#3a5a5a");
      rect(F.lake, "#3a5a54");
      // drive loop
      x.strokeStyle = "#3a3a36";
      x.lineWidth = 3;
      const D = [
        [-60, -421],
        [-80, -470],
        [-88, -560],
        [-92, -640],
        [-90, -700],
        [-88, -752],
        [-86, -768],
        [-90, -820],
        [-100, -905],
        [-86, -960],
        [-40, -985],
        [20, -985],
        [70, -962],
        [92, -900],
        [96, -815],
        [90, -768],
        [88, -752],
        [96, -700],
        [98, -640],
        [96, -560],
        [80, -470],
        [60, -421],
      ];
      x.beginPath();
      D.forEach((p, i) => {
        const q = M(p[0], p[1]);
        if (i) x.lineTo(q[0], q[1]);
        else x.moveTo(q[0], q[1]);
      });
      x.stroke();
      // the Mall + transverse
      x.strokeStyle = "#c8c0a8";
      x.lineWidth = 2;
      let a = M(0, -421),
        b2 = M(0, -539);
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.lineTo(b2[0], b2[1]);
      x.stroke();
      a = M(P.x0, -760);
      b2 = M(P.x1, -760);
      x.strokeStyle = "#3a3a36";
      x.beginPath();
      x.moveTo(a[0], a[1]);
      x.lineTo(b2[0], b2[1]);
      x.stroke();
      // landmark dots
      const dot = (wx, wz, col) => {
        const q = M(wx, wz);
        x.fillStyle = col;
        x.beginPath();
        x.arc(q[0], q[1], 4, 0, PI * 2);
        x.fill();
      };
      dot(F.bethesda.x, F.bethesda.z, "#e0d8c0");
      dot(F.belvedere.x, F.belvedere.z, "#e0d8c0");
      dot(81, -465, "#b04030");
      dot(-100, -560, "#2a6a3a");
      // tiny trees
      for (let i = 0; i < 260; i++) {
        const q = M(
          P.x0 + Math.random() * (P.x1 - P.x0),
          P.z0 + Math.random() * (P.z1 - P.z0),
        );
        x.fillStyle = "rgba(40,60,30,0.7)";
        x.beginPath();
        x.arc(q[0], q[1], 1.5 + Math.random() * 2, 0, PI * 2);
        x.fill();
      }
      x.strokeStyle = "#2a2a20";
      x.lineWidth = 4;
      x.strokeRect(X + 2, Y + 2, W - 4, H - 4);
      K.stains(x, X, Y, W, H, 10, 77, 0.35, [60, 50, 30]);
    });
  };
})();
