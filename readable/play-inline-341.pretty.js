/* src/poi_civic/06_arch.js */
/* =====================================================================
 * NEW RAD CITY — poi_civic / 06_arch.js
 * Classical & Gothic architecture helpers shared by the three Civic
 * Center POIs (all work on a kit builder `b`, in its local coords):
 *   K.column      Corinthian-ish column (plinth, torus base, tapered
 *                 fluted shaft, leafy capital, abacus)
 *   K.balustrade  rail + turned balusters + pedestals (+ collider)
 *   K.pediment    triangular pediment with raking cornices
 *   K.archWin     round-headed window (rect + semicircular head, voussoirs)
 *   K.lancet      Gothic pointed window (glass / tracery / stained glass)
 *   K.dome        hemispherical / ribbed dome
 *   K.urn         balustrade urn / finial
 *   K.facing      yaw helper: three.js ry that turns +z to (nx,nz)
 *   K.doorway     readable double door (frame, glazed leaves, transom, light through, EXIT sign, lamps)
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const K = G._pc.kit;
  const PI = Math.PI,
    HP = PI / 2;

  K.facing = (nx, nz) => Math.atan2(nx, nz);

  let _half = null,
    _hemi = {},
    _pt = {};
  const halfDisc = () =>
    _half || (_half = new THREE.CircleGeometry(0.5, 14, 0, PI));
  /** Hemisphere (y up, radius 1, base at y=0). */
  K.hemiGeo = (seg, rows) => {
    const k = (seg || 20) + "x" + (rows || 8);
    return (
      _hemi[k] ||
      (_hemi[k] = new THREE.SphereGeometry(
        1,
        seg || 20,
        rows || 8,
        0,
        PI * 2,
        0,
        HP,
      ))
    );
  };
  /**
   * Gothic (equilateral) pointed-arch curve, right half, unit width, apex height 1:
   * t = 0 → spring (0.5, 0); t = 1 → apex (0, 1). Returns [u, v].
   */
  const RHO = 1.0,
    A_END = Math.acos((RHO - 0.5) / RHO),
    APEX = RHO * Math.sin(A_END);
  K.ptArc = function (t) {
    const a = t * A_END;
    return [0.5 - RHO + RHO * Math.cos(a), (RHO * Math.sin(a)) / APEX];
  };
  /** Pointed (Gothic) arch outline as a flat shape, width 1, spring at y=0, apex at y=h (+ optional rect below). */
  K.pointedGeo = function (h, rect) {
    const k = h.toFixed(2) + (rect || 0);
    if (_pt[k]) return _pt[k];
    const s = new THREE.Shape();
    const n = 10;
    s.moveTo(-0.5, -(rect || 0));
    s.lineTo(0.5, -(rect || 0));
    s.lineTo(0.5, 0);
    for (let i = 1; i <= n; i++) {
      const p = K.ptArc(i / n);
      s.lineTo(p[0], p[1] * h);
    }
    for (let i = n - 1; i >= 0; i--) {
      const p = K.ptArc(i / n);
      s.lineTo(-p[0], p[1] * h);
    }
    s.lineTo(-0.5, -(rect || 0));
    const g = new THREE.ShapeGeometry(s);
    const p = g.attributes.position,
      uv = g.attributes.uv;
    const y0 = -(rect || 0),
      y1 = h;
    for (let i = 0; i < p.count; i++)
      uv.setXY(i, p.getX(i) + 0.5, (p.getY(i) - y0) / (y1 - y0));
    return (_pt[k] = g);
  };

  /**
   * Column standing at (x, y0, z), total height h (incl. base & capital), shaft radius r.
   * o: {mat, capMat, tint, capTint, order:'corinthian'|'doric'|'ionic', fluted, plinth(true), seg}
   */
  K.column = function (b, x, y0, z, h, r, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      tint = o.tint || [0.9, 0.87, 0.8];
    const cm = o.capMat || mat,
      ct = o.capTint || tint,
      seg = o.seg || 12;
    let y = y0;
    if (o.plinth !== false) {
      b.box(mat, x, y, z, r * 2.7, r * 0.55, r * 2.7, { tint });
      y += r * 0.55;
    }
    b.cyl(mat, x, y, z, r * 1.25, r * 1.12, r * 0.22, seg, { tint });
    y += r * 0.22; // torus-ish base
    b.cyl(mat, x, y, z, r * 1.1, r * 1.02, r * 0.14, seg, { tint });
    y += r * 0.14;
    const capH =
      o.order === "doric" ? r * 0.6 : o.order === "ionic" ? r * 0.8 : r * 2.2;
    const shaftH = y0 + h - y - capH;
    b.cyl(mat, x, y, z, r, r * 0.88, shaftH, seg, { tint, top: false });
    if (o.fluted)
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * PI * 2;
        b.beam(
          "paint_black",
          x + Math.cos(a) * r * 0.97,
          y + 0.3,
          z + Math.sin(a) * r * 0.97,
          x + Math.cos(a) * r * 0.86,
          y + shaftH - 0.2,
          z + Math.sin(a) * r * 0.86,
          0.03,
          0.03,
          { tint: [0.25, 0.23, 0.2] },
        );
      }
    y += shaftH;
    b.cyl(cm, x, y - 0.02, z, r * 0.95, r * 0.95, r * 0.12, seg, { tint: ct }); // astragal
    if (o.order === "doric") {
      b.cyl(cm, x, y, z, r * 0.95, r * 1.25, capH * 0.5, seg, { tint: ct });
      b.box(cm, x, y + capH * 0.5, z, r * 2.6, capH * 0.5, r * 2.6, {
        tint: ct,
      });
      return y0 + h;
    }
    if (o.order === "ionic") {
      b.box(cm, x, y, z, r * 2.3, capH * 0.55, r * 1.6, { tint: ct });
      for (const s of [-1, 1])
        b.cyl(
          cm,
          x + s * r * 1.1,
          y + capH * 0.3,
          z - r * 0.8,
          r * 0.32,
          r * 0.32,
          r * 1.6,
          8,
          { tint: ct },
        );
      b.box(cm, x, y + capH * 0.55, z, r * 2.5, capH * 0.45, r * 2.5, {
        tint: ct,
      });
      return y0 + h;
    }
    // corinthian: bell + two rings of acanthus leaves + volutes + abacus
    b.cyl(cm, x, y, z, r * 0.92, r * 1.35, capH * 0.78, seg, {
      tint: ct,
      top: false,
    });
    for (let ring = 0; ring < 2; ring++) {
      const n = 8,
        ly = y + capH * (0.08 + ring * 0.28),
        lh = capH * 0.34;
      for (let k = 0; k < n; k++) {
        const a = ((k + ring * 0.5) / n) * PI * 2,
          rr = r * (1.0 + ring * 0.14);
        const px = x + Math.cos(a) * rr,
          pz = z + Math.sin(a) * rr;
        b.beam(
          cm,
          px,
          ly,
          pz,
          px + Math.cos(a) * r * 0.22,
          ly + lh,
          pz + Math.sin(a) * r * 0.22,
          r * 0.34,
          r * 0.12,
          { tint: [ct[0] * 0.92, ct[1] * 0.92, ct[2] * 0.9] },
        );
      }
    }
    for (let k = 0; k < 4; k++) {
      const a = k * HP + PI / 4;
      b.box(
        cm,
        x + Math.cos(a) * r * 1.25,
        y + capH * 0.62,
        z + Math.sin(a) * r * 1.25,
        r * 0.36,
        r * 0.36,
        r * 0.36,
        { tint: ct, yaw: -a },
      );
    }
    b.box(cm, x, y + capH * 0.78, z, r * 2.8, capH * 0.22, r * 2.8, {
      tint: ct,
    });
    return y0 + h;
  };

  /**
   * Balustrade along A→B at floor y. o: {h (1.0), mat, tint, step (0.3), ped (every n metres, 0 = ends only), col (true), faces (both)}
   */
  K.balustrade = function (b, ax, az, bx, bz, y, o) {
    o = o || {};
    const h = o.h || 1.0,
      mat = o.mat || "limestone",
      tint = o.tint || [0.86, 0.83, 0.76];
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 0.2) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const yaw = Math.atan2(-uz, ux);
    const mid = (t, yy, hh, w, d) =>
      b.box(mat, ax + ux * t, yy, az + uz * t, w, hh, d, { yaw, tint });
    mid(len / 2, y, h * 0.16, len, 0.34); // plinth rail
    mid(len / 2, y + h - 0.14, 0.14, len + 0.04, 0.4); // coping
    const step = o.step || 0.3;
    const pedEvery = o.ped || 0;
    const n = Math.max(1, Math.floor(len / step));
    for (let i = 0; i < n; i++) {
      const t = ((i + 0.5) * len) / n;
      if (
        pedEvery &&
        Math.abs(((t + pedEvery / 2) % pedEvery) - pedEvery / 2) < step * 0.8
      )
        continue;
      const px = ax + ux * t,
        pz = az + uz * t;
      b.cyl(mat, px, y + h * 0.16, pz, 0.07, 0.11, (h - 0.3) * 0.45, 6, {
        tint,
        top: false,
      });
      b.cyl(
        mat,
        px,
        y + h * 0.16 + (h - 0.3) * 0.45,
        pz,
        0.11,
        0.06,
        (h - 0.3) * 0.55,
        6,
        { tint, top: false },
      );
    }
    const peds = [0, len];
    if (pedEvery)
      for (let t = pedEvery; t < len - pedEvery * 0.5; t += pedEvery)
        peds.push(t);
    for (const t of peds) mid(t, y, h, 0.42, 0.42);
    if (o.col !== false)
      b.ocol((ax + bx) / 2, (az + bz) / 2, len, 0.36, y, y + h, yaw, {
        tag: "rail",
        walkable: false,
      });
  };

  /** Urn / finial on top of a pedestal. */
  K.urn = function (b, x, y, z, s, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      tint = o.tint || [0.86, 0.83, 0.76];
    b.cyl(mat, x, y, z, 0.16 * s, 0.1 * s, 0.14 * s, 8, { tint });
    b.geo(mat, K.sphereGeo(), {
      x,
      y: y + 0.36 * s,
      z,
      sx: 0.26 * s,
      sy: 0.24 * s,
      sz: 0.26 * s,
      tint,
    });
    b.cyl(mat, x, y + 0.55 * s, z, 0.14 * s, 0.03 * s, 0.25 * s, 8, { tint });
  };

  /**
   * Pediment: base centre (cx, y, cz), width w, height h, facing (nx,nz), depth d.
   * o: {mat, tint, tympanum (atlas rect or null), tympMat}
   */
  K.pediment = function (b, cx, y, cz, w, h, nx, nz, d, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      tint = o.tint || [0.88, 0.85, 0.78];
    const rx = nz,
      rz = -nx; // right, seen from the front
    const P = (u, v, dd) => [
      cx + rx * u + nx * dd,
      y + v,
      cz + rz * u + nz * dd,
    ];
    // tympanum (front, recessed)
    b.quadN(
      o.tympMat || mat,
      P(-w / 2 + 0.3, 0, d - 0.25),
      P(w / 2 - 0.3, 0, d - 0.25),
      P(0, h - 0.25, d - 0.25),
      P(0, h - 0.25, d - 0.25),
      [nx, 0, nz],
      { tint: o.tympTint || [tint[0] * 0.92, tint[1] * 0.92, tint[2] * 0.9] },
    );
    if (o.tympanum)
      b.quadN(
        "art",
        P(-w * 0.3, 0.15, d - 0.2),
        P(w * 0.3, 0.15, d - 0.2),
        P(w * 0.3, h * 0.62, d - 0.2),
        P(-w * 0.3, h * 0.62, d - 0.2),
        [nx, 0, nz],
        { rect: o.tympanum, grime: 0, tint: [0.9, 0.88, 0.82] },
      );
    // back fill (so it reads solid from the sides/behind)
    b.quadN(
      mat,
      P(-w / 2, 0, 0),
      P(w / 2, 0, 0),
      P(0, h, 0),
      P(0, h, 0),
      [-nx, 0, -nz],
      { tint },
    );
    // raking cornices (both slopes) + horizontal cornice
    const sl = Math.hypot(w / 2, h),
      ang = Math.atan2(h, w / 2);
    for (const s of [-1, 1]) {
      const a = P(s * (w / 2 + 0.2), -0.05, d * 0.5),
        c = P(0, h + 0.18, d * 0.5);
      b.beam(mat, a[0], a[1], a[2], c[0], c[1], c[2], d + 0.3, 0.5, { tint });
      // side slope roof (top face of the gable)
      const e0 = P(s * (w / 2), 0, 0),
        e1 = P(0, h, 0),
        e2 = P(0, h, d),
        e3 = P(s * (w / 2), 0, d);
      b.quadN(o.roof || mat, e0, e1, e2, e3, [0, 1, 0], { tint });
      void sl;
      void ang;
    }
    const L = P(-w / 2 - 0.3, 0, d * 0.5),
      R = P(w / 2 + 0.3, 0, d * 0.5);
    b.beam(mat, L[0], y - 0.2, L[2], R[0], y - 0.2, R[2], d + 0.4, 0.4, {
      tint,
    });
  };

  /**
   * Round-headed window: wall surface point (x,y = sill-to-spring centre, z), facing (nx,nz).
   * w wide, h = total height incl. the semicircular head. o: {state, surround, surroundTint, keystone, frame, glassTint}
   */
  K.archWin = function (b, x, y0, z, nx, nz, w, h, o) {
    o = o || {};
    const rectH = Math.max(0.3, h - w / 2);
    K.window(
      b,
      x,
      y0 + rectH / 2,
      z,
      nx,
      nz,
      w,
      rectH,
      Object.assign({ lintel: 0.001, sill: o.sill }, o, { lintel: undefined }),
    );
    const ry = K.facing(nx, nz);
    const st = o.state || "glass";
    const back =
      st === "glass"
        ? "glass"
        : st === "lit"
          ? "lamp"
          : st === "boarded"
            ? "wood_rotten"
            : "paint_black";
    const tint =
      st === "glass"
        ? o.glassTint || [0.5, 0.56, 0.55]
        : st === "lit"
          ? [0.95, 0.66, 0.36]
          : st === "boarded"
            ? [0.55, 0.47, 0.4]
            : [0.04, 0.04, 0.04];
    b.geo(back, halfDisc(), {
      x: x + nx * 0.012,
      y: y0 + rectH,
      z: z + nz * 0.012,
      ry,
      sx: w,
      sy: w,
      sz: 1,
      tint,
      grime: 0.2,
    });
    // voussoirs
    const fm = o.surround || "limestone",
      ft = o.surroundTint || [0.85, 0.82, 0.74];
    const n = 9,
      R = w / 2 + 0.12,
      rx = nz,
      rz = -nx;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * PI,
        cx = x + rx * Math.cos(a) * R + nx * 0.08,
        cz = z + rz * Math.cos(a) * R + nz * 0.08,
        cy = y0 + rectH + Math.sin(a) * R;
      const key = i === Math.round(n / 2) && o.keystone !== false;
      b.box(
        fm,
        cx,
        cy - (key ? 0.26 : 0.16),
        cz,
        key ? 0.34 : 0.24,
        key ? 0.52 : 0.32,
        0.18,
        { yaw: ry + (a - HP) * 0, tint: ft },
      );
    }
  };

  /**
   * Gothic lancet window: centre bottom (x, y0, z) on the wall, facing (nx,nz), w wide, h tall (to the apex).
   * o: {rect (stained-glass atlas cell → 'art' or 'neon' material), mat ('art'|'neon'|'glass'|'paint_black'), tracery (true), frame, frameTint, inset}
   */
  K.lancet = function (b, x, y0, z, nx, nz, w, h, o) {
    o = o || {};
    const archH = w * 0.95,
      rectH = h - archH;
    const ry = K.facing(nx, nz);
    const g = K.pointedGeo(archH / w, rectH / w);
    const mat = o.mat || (o.rect ? "art" : "glass");
    const d = o.inset !== undefined ? o.inset : 0.02;
    const geoOpts = {
      x: x + nx * d,
      y: y0 + rectH,
      z: z + nz * d,
      ry,
      sx: w,
      sy: w,
      sz: 1,
      tint: o.tint || (mat === "glass" ? [0.45, 0.5, 0.5] : [1, 1, 1]),
      grime: 0,
    };
    if (o.rect) {
      geoOpts.uv = "rect";
      geoOpts.rect = o.rect;
    }
    b.geo(o.rect ? K.atlasMat(mat, o.rect) : mat, g, geoOpts);
    if (o.tracery !== false) {
      const fm = o.frame || "limestone",
        ft = o.frameTint || [0.8, 0.76, 0.68];
      const rx = nz,
        rz = -nx;
      const P = (u, v) => [
        x + rx * u + nx * (d + 0.03),
        y0 + v,
        z + rz * u + nz * (d + 0.03),
      ];
      // mullion + transom + outer frame (approximate arch with 6 beams per side)
      const m0 = P(0, 0),
        m1 = P(0, rectH + archH * 0.55);
      b.beam(fm, m0[0], m0[1], m0[2], m1[0], m1[1], m1[2], 0.07, 0.07, {
        tint: ft,
      });
      const t0 = P(-w / 2, rectH * 0.5),
        t1 = P(w / 2, rectH * 0.5);
      b.beam(fm, t0[0], t0[1], t0[2], t1[0], t1[1], t1[2], 0.06, 0.06, {
        tint: ft,
      });
      let prev = null;
      for (let i = 0; i <= 12; i++) {
        const s = i < 6.5 ? -1 : 1,
          t = s < 0 ? i / 6 : (12 - i) / 6;
        const q = K.ptArc(t);
        const u = s * q[0] * w,
          v = rectH + archH * q[1];
        const p = P(u, v);
        if (prev)
          b.beam(fm, prev[0], prev[1], prev[2], p[0], p[1], p[2], 0.12, 0.1, {
            tint: ft,
          });
        prev = p;
      }
      const l0 = P(-w / 2, 0),
        l1 = P(-w / 2, rectH),
        r0 = P(w / 2, 0),
        r1 = P(w / 2, rectH);
      b.beam(fm, l0[0], l0[1], l0[2], l1[0], l1[1], l1[2], 0.12, 0.1, {
        tint: ft,
      });
      b.beam(fm, r0[0], r0[1], r0[2], r1[0], r1[1], r1[2], 0.12, 0.1, {
        tint: ft,
      });
      // small quatrefoil ring in the head
      const qc = P(0, rectH + archH * 0.5);
      b.geo(fm, new THREE.TorusGeometry(w * 0.16, 0.035, 4, 10), {
        x: qc[0],
        y: qc[1],
        z: qc[2],
        ry,
        tint: ft,
      });
      if (o.sill !== false) {
        const s0 = P(0, -0.08);
        b.box(fm, s0[0], s0[1], s0[2], w + 0.3, 0.12, 0.22, {
          yaw: ry,
          tint: ft,
        });
      }
    }
  };

  /**
   * Inward-facing vault with continuous texture (planar strips, arc-length V coordinate).
   * o: {axis:'z'|'x' (run direction), from, to (along the axis), c (centre across), r (half span), y (spring), h (rise),
   *     mat, tint, seg, pointed (Gothic two-centred arch instead of a semicircle)}
   */
  K.vault = function (b, o) {
    const seg = o.seg || 12,
      pts = [];
    if (o.pointed) {
      for (let i = 0; i <= seg / 2; i++) {
        const q = K.ptArc(i / (seg / 2));
        pts.push([q[0] * 2 * o.r, q[1] * o.h]);
      }
      for (let i = seg / 2 - 1; i >= 0; i--) {
        const q = K.ptArc(i / (seg / 2));
        pts.push([-q[0] * 2 * o.r, q[1] * o.h]);
      }
    } else
      for (let i = 0; i <= seg; i++) {
        const a = (i / seg) * PI;
        pts.push([Math.cos(a) * o.r, Math.sin(a) * o.h]);
      }
    let vo = 0;
    const len = o.to - o.from;
    for (let i = 0; i < pts.length - 1; i++) {
      const [u0, v0] = pts[i],
        [u1, v1] = pts[i + 1];
      const dl = Math.hypot(u1 - u0, v1 - v0),
        du = (u1 - u0) / dl,
        dv = (v1 - v0) / dl;
      if (o.axis === "x")
        b.face(o.mat, o.to, o.y + v0, o.c + u0, -1, 0, 0, 0, dv, du, len, dl, {
          uv: "plane",
          vo,
          tint: o.tint,
        });
      else
        b.face(o.mat, o.c + u0, o.y + v0, o.from, 0, 0, 1, du, dv, 0, len, dl, {
          uv: "plane",
          vo,
          tint: o.tint,
        });
      vo += dl;
    }
  };

  /** Inward-facing dome (seen from inside): base centre (cx,y,cz), radius r, height h. o: {mat, tint, seg, rows, oculus (radius)} */
  K.domeIn = function (b, cx, y, cz, r, h, o) {
    o = o || {};
    const seg = o.seg || 16,
      rows = o.rows || 6,
      mat = o.mat || "coffer",
      tint = o.tint || [0.8, 0.76, 0.68];
    const top = o.oculus ? Math.acos(Math.min(1, o.oculus / r)) : HP;
    const P = (i, j) => {
      const a = (i / seg) * PI * 2,
        t = (j / rows) * top;
      return [
        cx + Math.cos(a) * Math.cos(t) * r,
        y + Math.sin(t) * h,
        cz + Math.sin(a) * Math.cos(t) * r,
      ];
    };
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < seg; i++) {
        const p0 = P(i, j),
          p1 = P(i + 1, j),
          p2 = P(i + 1, j + 1),
          p3 = P(i, j + 1);
        const mx = (p0[0] + p2[0]) / 2 - cx,
          my = (p0[1] + p2[1]) / 2 - y,
          mz = (p0[2] + p2[2]) / 2 - cz;
        b.quadN(mat, p0, p1, p2, p3, [-mx, -my * (r / Math.max(h, 0.1)), -mz], {
          tint,
        });
      }
    if (o.ribs)
      for (let i = 0; i < seg; i += Math.max(1, Math.round(seg / o.ribs))) {
        let prev = null;
        for (let j = 0; j <= rows; j++) {
          const p = P(i, j);
          const q = [
            cx + (p[0] - cx) * 0.97,
            p[1] - 0.05,
            cz + (p[2] - cz) * 0.97,
          ];
          if (prev)
            b.beam(
              o.ribMat || "plaster",
              prev[0],
              prev[1],
              prev[2],
              q[0],
              q[1],
              q[2],
              0.25,
              0.2,
              { tint: o.ribTint || tint },
            );
          prev = q;
        }
      }
    if (o.oculus) {
      const oc = P(0, rows);
      b.geo(
        o.ringMat || "plaster",
        new THREE.TorusGeometry(o.oculus, 0.18, 5, seg),
        { x: cx, y: oc[1], z: cz, rx: HP, tint },
      );
    }
  };
  /** Regular n-gon floor (or ceiling with up=false) centred (cx,cz) at y, circumradius R, first vertex at angle a0. */
  K.ngonFloor = function (b, cx, y, cz, R, n, a0, mat, tint, up) {
    const g = new THREE.CircleGeometry(R, n, a0 || 0);
    b.geo(mat, g, { x: cx, y, z: cz, rx: up === false ? HP : -HP, tint });
  };

  /** Dome: base centre (cx,y,cz), radius r, height h. o: {mat, tint, ribs (n), ribMat, seg} */
  K.dome = function (b, cx, y, cz, r, h, o) {
    o = o || {};
    const mat = o.mat || "patina";
    b.geo(mat, K.hemiGeo(o.seg || 24, o.rows || 9), {
      x: cx,
      y,
      z: cz,
      sx: r,
      sy: h,
      sz: r,
      tint: o.tint || [0.9, 0.95, 0.92],
    });
    if (o.ribs) {
      const rm = o.ribMat || mat,
        rt = o.ribTint || [0.75, 0.8, 0.76];
      for (let k = 0; k < o.ribs; k++) {
        const a = (k / o.ribs) * PI * 2;
        let prev = null;
        for (let i = 0; i <= 8; i++) {
          const t = (i / 8) * HP * 0.97,
            rr = Math.cos(t) * (r + 0.06),
            yy = y + Math.sin(t) * (h + 0.06);
          const p = [cx + Math.cos(a) * rr, yy, cz + Math.sin(a) * rr];
          if (prev)
            b.beam(
              rm,
              prev[0],
              prev[1],
              prev[2],
              p[0],
              p[1],
              p[2],
              0.22,
              0.14,
              { tint: rt },
            );
          prev = p;
        }
      }
    }
  };
  /**
   * K.doorway — a readable double door on a wall plane (round 2: doors must be obvious from both sides).
   * (x,y,z): centre of the doorway at floor level ON the wall face; (nx,nz): wall normal toward the viewer.
   * Two leaves with stiles/rails, glazed upper panes behind a grille, raised lower panels, push bars and kick
   * plates; a moulded frame; a glazed transom with a bronze grille; optional light spilling through the glass
   * (`glow`: daylight for an exit), a lit EXIT sign (`exit`: text), wall lamps either side (`lamps`).
   * o: {w 2.6, h 3.2, transom 0.8 (0 = none), mat 'bronze', tint, frame 'limestone', frameTint, frameW 0.26,
   *     glass true, glow [r,g,b] | null, glowI 0.7, exit text | null, exitY, lamps false, lampsDead, lampCol, lightBox, proud 0.14,
   *     handles 'bar'|'ring'|false, straps n (iron strap hinges), kick mat}
   */
  K.doorway = function (b, x, y, z, nx, nz, o) {
    o = o || {};
    const w = o.w || 2.6,
      h = o.h || 3.2,
      th = o.transom === undefined ? 0.8 : o.transom,
      fw = o.frameW || 0.26;
    const rx = nz,
      rz = -nx,
      yaw = Math.atan2(nx, nz);
    const mat = o.mat || "bronze",
      T = o.tint || [0.85, 0.76, 0.6],
      TD = [T[0] * 0.62, T[1] * 0.62, T[2] * 0.62];
    const fm = o.frame || "limestone",
      FT = o.frameTint || [0.82, 0.8, 0.74];
    const P = (u, v) => [x + rx * u + nx * v, z + rz * u + nz * v];
    const box = (m, u, y0, v, bw, bh, bd, tint) => {
      const p = P(u, v);
      b.box(m, p[0], y0, p[1], bw, bh, bd, { yaw, tint });
    };
    const glowC = o.glow || null;
    // the door itself stands proud of the wall plane by `vb` (the wall behind it is usually solid), inside the frame
    const vb = o.proud !== undefined ? o.proud : 0.14;
    const Pd = (u, v) => P(u, v + vb);
    const boxd = (m, u, y0, v, bw, bh, bd, tint) =>
      box(m, u, y0, v + vb, bw, bh, bd, tint);
    // frame: jambs with a plinth block, head with a small cornice
    const top = h + (th > 0 ? th + 0.12 : 0);
    for (const s of [-1, 1]) {
      box(fm, s * (w / 2 + fw / 2), y, 0.06, fw, top + 0.02, 0.2, FT);
      box(fm, s * (w / 2 + fw / 2), y, 0.1, fw + 0.08, 0.34, 0.24, [
        FT[0] * 0.9,
        FT[1] * 0.9,
        FT[2] * 0.9,
      ]);
    }
    box(fm, 0, y + top, 0.06, w + fw * 2, 0.28, 0.2, FT);
    box(fm, 0, y + top + 0.28, 0.1, w + fw * 2 + 0.2, 0.1, 0.3, FT);
    // transom: glass (lit from behind when glow) + grille
    if (th > 0) {
      boxd(mat, 0, y + h, -0.03, w, 0.12, 0.1, T); // transom bar
      const gy = y + h + 0.12,
        gh = th;
      const p = Pd(0, -0.08);
      if (glowC)
        b.plate(
          "lamp",
          p[0],
          gy + gh / 2,
          p[1],
          nx,
          nz,
          w - 0.04,
          gh - 0.02,
          null,
          { tint: [glowC[0] * 0.55, glowC[1] * 0.55, glowC[2] * 0.55], off: 0 },
        );
      else
        b.plate(
          "glass_dark",
          p[0],
          gy + gh / 2,
          p[1],
          nx,
          nz,
          w - 0.04,
          gh - 0.02,
          null,
          { off: 0 },
        );
      const n = Math.max(3, Math.round(w / 0.32));
      for (let k = 1; k < n; k++)
        boxd(mat, -w / 2 + (k * w) / n, gy, -0.04, 0.035, gh, 0.04, TD);
      boxd(mat, 0, gy + gh * 0.5 - 0.02, -0.04, w, 0.04, 0.04, TD);
    }
    // leaves
    const lw = w / 2 - 0.015;
    for (const s of [-1, 1]) {
      const cu = s * (w / 4);
      boxd(mat, cu, y, -0.12, lw, h, 0.03, TD); // leaf back board
      const st = 0.14,
        rt = 0.16,
        lr = 0.22,
        kr = 0.3;
      for (const e of [-1, 1])
        boxd(mat, cu + e * (lw / 2 - st / 2), y, -0.05, st, h, 0.04, T); // stiles
      boxd(mat, cu, y + h - rt, -0.05, lw - st * 2, rt, 0.04, T); // top rail
      boxd(mat, cu, y + 1.0, -0.05, lw - st * 2, lr, 0.04, T); // lock rail
      boxd(mat, cu, y, -0.05, lw - st * 2, kr, 0.04, T); // bottom rail
      boxd(
        o.kick || "brass",
        cu,
        y + 0.02,
        -0.03,
        lw - 0.06,
        0.26,
        0.012,
        [0.8, 0.66, 0.4],
      ); // kick plate
      // lower raised panel
      boxd(
        mat,
        cu,
        y + kr + 0.08,
        -0.06,
        lw - st * 2 - 0.16,
        1.0 - kr - 0.16,
        0.03,
        [T[0] * 0.9, T[1] * 0.9, T[2] * 0.9],
      );
      // upper glazing behind a grille
      const gy0 = y + 1.0 + lr,
        gy1 = y + h - rt,
        gw = lw - st * 2;
      if (o.glass !== false) {
        const p = Pd(cu, -0.09);
        if (glowC)
          b.plate(
            "lamp",
            p[0],
            (gy0 + gy1) / 2,
            p[1],
            nx,
            nz,
            gw,
            gy1 - gy0,
            null,
            {
              tint: [glowC[0] * 0.42, glowC[1] * 0.42, glowC[2] * 0.42],
              off: 0,
            },
          );
        else
          b.plate(
            "glass_dark",
            p[0],
            (gy0 + gy1) / 2,
            p[1],
            nx,
            nz,
            gw,
            gy1 - gy0,
            null,
            { off: 0 },
          );
        for (const f of [1 / 3, 2 / 3])
          boxd(
            mat,
            cu - gw / 2 + gw * f,
            gy0,
            -0.055,
            0.03,
            gy1 - gy0,
            0.03,
            TD,
          );
        for (const f of [0.25, 0.5, 0.75])
          boxd(mat, cu, gy0 + (gy1 - gy0) * f, -0.055, gw, 0.03, 0.03, TD);
      } else
        boxd(mat, cu, gy0 + 0.1, -0.06, gw - 0.16, gy1 - gy0 - 0.2, 0.03, [
          T[0] * 0.9,
          T[1] * 0.9,
          T[2] * 0.9,
        ]);
      if (o.handles === "ring") {
        // wrought-iron ring pull by the meeting stiles
        const rp = Pd(s * 0.3, -0.005);
        b.geo("black_iron", new THREE.TorusGeometry(0.15, 0.022, 4, 12), {
          x: rp[0],
          y: y + 1.45,
          z: rp[1],
          ry: yaw,
          tint: [0.3, 0.29, 0.27],
        });
        b.cyl("black_iron", rp[0], y + 1.58, rp[1], 0.05, 0.05, 0.06, 6, {
          tint: [0.3, 0.29, 0.27],
        });
      } else if (o.handles !== false) {
        // push bar on standoffs
        const a = Pd(cu - lw * 0.36, 0.02),
          c = Pd(cu + lw * 0.36, 0.02);
        b.pipe("brass", a[0], y + 1.1, a[1], c[0], y + 1.1, c[1], 0.022, 6, {
          tint: [0.9, 0.75, 0.45],
        });
        for (const e of [-0.36, 0.36]) {
          const q0 = Pd(cu + lw * e, -0.03),
            q1 = Pd(cu + lw * e, 0.02);
          b.pipe(
            "brass",
            q0[0],
            y + 1.1,
            q0[1],
            q1[0],
            y + 1.1,
            q1[1],
            0.015,
            4,
            { tint: [0.9, 0.75, 0.45] },
          );
        }
      }
      if (o.straps)
        for (let k = 0; k < o.straps; k++)
          boxd(
            "black_iron",
            cu,
            y + 0.5 + (k * (h - 0.9)) / Math.max(1, o.straps - 1),
            -0.02,
            lw - 0.1,
            0.07,
            0.025,
            [0.22, 0.21, 0.2],
          );
    }
    boxd("paint_black", 0, y, -0.035, 0.03, h, 0.02, [0.05, 0.05, 0.05]); // meeting line
    // light coming through (baked) — makes the way out read from across the room
    if (glowC) {
      const q = P(0, 1.4);
      b.light(q[0], y + h * 0.7, q[1], glowC, o.glowI || 0.7, o.glowR || 6, {
        box: o.lightBox,
      });
      const g = P(0, 0.05);
      if (th > 0)
        b.glow(
          g[0],
          y + h + 0.12 + th / 2,
          g[1],
          [glowC[0] * 0.5, glowC[1] * 0.5, glowC[2] * 0.5],
          w * 0.9,
        );
    }
    // lit EXIT sign over the frame
    if (o.exit) {
      const sy = o.exitY !== undefined ? y + o.exitY : y + top + 0.7,
        sw = Math.min(1.8, 0.5 + String(o.exit).length * 0.16);
      box(
        "metal_dark",
        0,
        sy - 0.27,
        0.08,
        sw + 0.12,
        0.54,
        0.14,
        [0.3, 0.3, 0.3],
      );
      box("lamp", 0, sy - 0.25, 0.155, sw + 0.02, 0.03, 0.02, [0.9, 0.2, 0.14]); // red edge-lit strip
      const p = P(0, 0.155);
      b.plate(
        "neon",
        p[0],
        sy,
        p[1],
        nx,
        nz,
        sw,
        0.42,
        K.neonCell(
          "pc_exit_" + String(o.exit).replace(/\W+/g, "_"),
          o.exit,
          64 + String(o.exit).length * 26,
          64,
          { color: "#ff3a2a" },
        ),
        { off: 0.005 },
      );
      const gq = P(0, 0.35);
      b.glow(gq[0], sy, gq[1], [0.9, 0.18, 0.12], 1.6);
      b.light(gq[0], sy - 0.3, gq[1], [1, 0.25, 0.18], 0.25, 3, {
        box: o.lightBox,
      });
    }
    // wall lamps either side
    if (o.lamps) {
      const lc = o.lampCol || [1, 0.8, 0.52];
      for (const s of [-1, 1]) {
        const u = s * (w / 2 + fw + 0.45),
          ly = y + Math.min(h * 0.82, 2.8);
        box(
          "black_iron",
          u,
          ly - 0.25,
          0.06,
          0.14,
          0.34,
          0.12,
          [0.5, 0.48, 0.45],
        );
        const a = P(u, 0.08),
          c = P(u, 0.36);
        b.pipe("black_iron", a[0], ly, a[1], c[0], ly, c[1], 0.02, 4);
        const q = P(u, 0.36);
        b.cyl("black_iron", q[0], ly + 0.3, q[1], 0.1, 0.16, 0.08, 8);
        if (o.lampsDead)
          b.geo("glass", K.sphereGeo(), {
            x: q[0],
            y: ly + 0.14,
            z: q[1],
            s: 0.15,
            tint: [0.4, 0.42, 0.38],
          });
        else {
          b.geo("lamp", K.sphereGeo(), {
            x: q[0],
            y: ly + 0.14,
            z: q[1],
            s: 0.15,
            tint: lc,
          });
          b.glow(
            q[0],
            ly + 0.14,
            q[1],
            [lc[0] * 0.7, lc[1] * 0.7, lc[2] * 0.7],
            1.3,
          );
          b.light(q[0], ly, q[1], lc, o.lampI || 0.55, 5, { box: o.lightBox });
        }
      }
    }
  };
})();
