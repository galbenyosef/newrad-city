// play-inline-341 02 — tint
// Lines 22-349 of readable/play-inline-341.pretty.js (statement-aligned).
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
