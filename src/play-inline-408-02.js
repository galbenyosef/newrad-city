// play-inline-408 02 — tint
// Lines 21-337 of readable/play-inline-408.pretty.js (statement-aligned).
  const PV = G._pf3;
  const K = PV.kit;
  const PI = Math.PI;

  /**
   * Elliptical dome (or any lathe) centred (cx, y0, cz): radius R at the base, rising H, open top radius rTop.
   * Built from rings of quads with u = around × uRep, v = up × vRep. inward=true: faces the centre.
   */
  K.dome = function (b, mat, cx, y0, cz, R, H, rTop, segs, rings, inward, o) {
    o = o || {};
    const bk = b._b(mat);
    const tint = K.tint(o.tint),
      grime = o.grime !== undefined ? o.grime : b.grime * 0.5;
    const uRep = o.uRep || 16,
      vRep = o.vRep || 5;
    // elevation parameter: r = R cos(t), y = H sin(t), t from 0 to tMax where R cos(tMax) = rTop
    const tMax = Math.acos(Math.max(-1, Math.min(1, (rTop || 0) / R)));
    const base = bk.vc;
    for (let j = 0; j <= rings; j++) {
      const t = (tMax * j) / rings,
        r = R * Math.cos(t),
        y = y0 + H * Math.sin(t);
      // ellipse normal (outward): (cos t / R, sin t / H) direction in (r, y)
      let nr = Math.cos(t) / R,
        ny = Math.sin(t) / H;
      const nl = Math.hypot(nr, ny) || 1;
      nr /= nl;
      ny /= nl;
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * PI * 2,
          ca = Math.cos(a),
          sa = Math.sin(a);
        const s = inward ? -1 : 1;
        b._v(
          bk,
          cx + ca * r,
          y,
          cz - sa * r,
          s * ca * nr,
          s * ny,
          -s * sa * nr,
          (i / segs) * uRep,
          (j / rings) * vRep * (tMax / (PI / 2)),
          tint,
          grime,
        );
      }
    }
    const row = segs + 1;
    for (let j = 0; j < rings; j++)
      for (let i = 0; i < segs; i++) {
        const a = base + j * row + i;
        if (inward) bk.i.push(a, a + row, a + row + 1, a, a + row + 1, a + 1);
        else bk.i.push(a, a + row + 1, a + row, a, a + 1, a + row + 1);
      }
    return b;
  };

  /** Flat horizontal ring between r0 and r1 at height y; up=true faces up, else down. */
  K.annulus = function (b, mat, cx, y, cz, r0, r1, segs, up, o) {
    o = o || {};
    const a0 = o.a0 || 0,
      arc = o.arc || PI * 2;
    for (let i = 0; i < segs; i++) {
      const t0 = a0 + (arc * i) / segs,
        t1 = a0 + (arc * (i + 1)) / segs;
      const P = (r, t) => [cx + Math.cos(t) * r, y, cz - Math.sin(t) * r];
      b.quadN(
        mat,
        P(r0, t0),
        P(r1, t0),
        P(r1, t1),
        P(r0, t1),
        [0, up ? 1 : -1, 0],
        { tint: o.tint, grime: o.grime },
      );
    }
    return b;
  };

  /**
   * Vertical wall face from A to B (floor-plan points), y0 up h, whose normal points to (nx, nz).
   * Textured along the wall (u = metres from the western/northern end so neighbouring runs line up).
   */
  K.fwall = function (b, mat, ax, az, bx, bz, y0, h, nx, nz, o) {
    o = o || {};
    let ux = bx - ax,
      uz = bz - az;
    const len = Math.hypot(ux, uz);
    if (len < 1e-3 || h <= 0) return b;
    ux /= len;
    uz /= len;
    // normal of (U × Y) = (-uz, 0, ux)
    if (-uz * nx + ux * nz < 0) {
      const tx = ax,
        tz = az;
      ax = bx;
      az = bz;
      bx = tx;
      bz = tz;
      ux = -ux;
      uz = -uz;
    }
    b.face(
      mat,
      ax,
      y0,
      az,
      ux,
      0,
      uz,
      0,
      1,
      0,
      len,
      h,
      Object.assign(
        {
          uo:
            o.uo !== undefined
              ? o.uo
              : Math.abs(ux) > 0.5
                ? ax * Math.sign(ux)
                : az * Math.sign(uz),
        },
        o,
      ),
    );
    return b;
  };

  /** Triangle with forced normal n (degenerate quad → one visible triangle). */
  K.tri = function (b, mat, p0, p1, p2, n, o) {
    return b.quadN(mat, p0, p1, p2, p2, n, o);
  };

  /**
   * Greek pediment on a façade line z = fz, from x0 to x1, base at y, apex height h, facing nz (±1).
   * o: {mat, tint, corniceMat, depth (roof depth behind, for the raking soffit), recess}
   */
  K.gable = function (b, x0, x1, fz, y, h, nz, o) {
    o = o || {};
    const mat = o.mat || "limestone",
      cm = o.corniceMat || mat,
      tint = o.tint;
    const xm = (x0 + x1) / 2,
      rec = o.recess !== undefined ? o.recess : 0.45;
    // tympanum (set back)
    K.tri(
      b,
      mat,
      [x0 + 0.3, y, fz - nz * rec],
      [x1 - 0.3, y, fz - nz * rec],
      [xm, y + h - 0.05, fz - nz * rec],
      [0, 0, nz],
      { tint: tint ? tint.map((v) => v * 0.93) : [0.86, 0.84, 0.78] },
    );
    // horizontal cornice (the pediment floor)
    b.boxMM(cm, x0, y - 0.1, fz - nz * rec, x1, y + 0.3, fz + nz * 0.25, {
      tint,
      faces: "nsewtb",
    });
    // raking cornices
    const slope = Math.atan2(h, xm - x0);
    const L = Math.hypot(xm - x0, h);
    for (const s of [-1, 1]) {
      const ax = s < 0 ? x0 - 0.2 : x1 + 0.2,
        bx = xm;
      b.beam(
        cm,
        ax,
        y + 0.15,
        fz - (nz * (rec - 0.35)) / 2,
        bx,
        y + h + 0.15,
        fz - (nz * (rec - 0.35)) / 2,
        rec + 0.35,
        0.8,
        { tint },
      );
    }
    void slope;
    void L;
  };

  // ------------------------------------------------------------------
  // Statues & dressing
  // ------------------------------------------------------------------
  /**
   * Standing George Washington in bronze (J.Q.A. Ward pose): right hand extended palm-down, left hand on a cane,
   * cloak over the shoulders, frock coat with tails. Feet at (x,y,z), facing -z (north) rotated by yaw.
   */
  K.washington = function (b, x, y, z, yaw, s, o) {
    o = o || {};
    const mat = o.mat || "patina",
      t = o.tint || [1, 1, 1];
    const c = Math.cos(yaw || 0),
      sn = Math.sin(yaw || 0);
    const L = (lx, ly, lz) => [
      x + lx * c + lz * sn,
      y + ly,
      z - lx * sn + lz * c,
    ];
    const box = (lx, ly, lz, w, h, d, extra) => {
      const p = L(lx * s, ly * s, lz * s);
      b.box(
        mat,
        p[0],
        p[1],
        p[2],
        w * s,
        h * s,
        d * s,
        Object.assign({ yaw: yaw || 0, tint: t, faces: "nsewtb" }, extra || {}),
      );
    };
    const sph = (lx, ly, lz, sx, sy, sz, m) => {
      const p = L(lx * s, ly * s, lz * s);
      b.geo(m || mat, K.sphereGeo(), {
        x: p[0],
        y: p[1],
        z: p[2],
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
        ry: yaw || 0,
        tint: t,
      });
    };
    const limb = (a, bb, r, m) => {
      const p = L(a[0] * s, a[1] * s, a[2] * s),
        q = L(bb[0] * s, bb[1] * s, bb[2] * s);
      b.pipe(m || mat, p[0], p[1], p[2], q[0], q[1], q[2], r * s, 10, {
        tint: t,
      });
    };
    // boots
    for (const e of [-1, 1]) {
      box(e * 0.12, 0, -0.03, 0.14, 0.42, 0.3);
      box(e * 0.12, 0, -0.1, 0.13, 0.1, 0.18);
    }
    // stockinged legs & breeches
    for (const e of [-1, 1]) {
      limb([e * 0.12, 0.4, 0], [e * 0.12, 0.72, 0], 0.075);
      limb([e * 0.12, 0.7, 0], [e * 0.11, 1.0, 0], 0.095);
    }
    // frock coat: flared skirt (open at the front) + torso + waistcoat
    const p0 = L(0, 0.58 * s, 0.02 * s);
    b.cyl(mat, p0[0], p0[1], p0[2], 0.36 * s, 0.24 * s, 0.52 * s, 16, {
      tint: t,
      arc0: PI / 2 + 0.55 + (yaw || 0),
      arc: PI * 2 - 1.1,
      top: false,
    });
    box(0, 1.0, 0.02, 0.44, 0.52, 0.27);
    box(0, 1.0, -0.12, 0.2, 0.46, 0.04, { tint: t.map((v) => v * 1.08) }); // waistcoat front
    for (let k = 0; k < 5; k++)
      sph(0, 1.06 + k * 0.08, -0.145, 0.012, 0.012, 0.01); // buttons
    // lapels / cravat
    box(0, 1.44, -0.1, 0.16, 0.08, 0.06);
    // shoulders + cloak (half cone at the back, draped over the left shoulder)
    sph(0, 1.48, 0.02, 0.26, 0.08, 0.16);
    const pc = L(0, 0.4 * s, 0.05 * s);
    b.cyl(mat, pc[0], pc[1], pc[2], 0.52 * s, 0.28 * s, 1.12 * s, 16, {
      tint: t.map((v) => v * 0.92),
      arc0: PI + (yaw || 0) - 0.35,
      arc: PI + 0.7,
      top: false,
    });
    box(-0.26, 0.55, -0.06, 0.1, 0.95, 0.24, { tint: t.map((v) => v * 0.9) }); // cloak fold falling off the left arm
    // head: face, powdered hair with the queue and side rolls
    limb([0, 1.5, 0.01], [0, 1.58, 0.01], 0.06);
    sph(0, 1.68, -0.005, 0.1, 0.125, 0.11);
    sph(0, 1.64, -0.1, 0.03, 0.035, 0.03); // nose
    sph(0, 1.72, 0.03, 0.105, 0.1, 0.1); // hair mass
    for (const e of [-1, 1]) sph(e * 0.095, 1.66, 0.02, 0.03, 0.05, 0.05); // side rolls
    limb([0, 1.66, 0.1], [0, 1.52, 0.16], 0.03); // queue
    // right arm (+x): extended forward, palm down — the gesture of the oath
    limb([0.24, 1.44, 0.01], [0.33, 1.2, -0.14], 0.07);
    limb([0.33, 1.2, -0.14], [0.36, 1.12, -0.48], 0.06);
    box(0.36, 1.08, -0.6, 0.1, 0.04, 0.16);
    // left arm: down, hand on the cane
    limb([-0.24, 1.44, 0.01], [-0.3, 1.12, -0.02], 0.07);
    limb([-0.3, 1.12, -0.02], [-0.32, 0.88, -0.14], 0.06);
    sph(-0.32, 0.86, -0.16, 0.045, 0.04, 0.05);
    limb([-0.32, 0.88, -0.16], [-0.36, 0.0, -0.3], 0.018);
  };

  /** Small bust on a plinth (x,y,z floor), facing (fx,fz). */
  K.bust = function (b, x, y, z, yaw, o) {
    o = o || {};
    const m = o.mat || "marble_white",
      pm = o.plinth || "marble_black";
    b.box(pm, x, y, z, 0.5, 1.15, 0.5, { yaw });
    b.box(pm, x, y + 1.15, z, 0.62, 0.08, 0.62, { yaw });
    b.geo(m, K.sphereGeo(), {
      x,
      y: y + 1.35,
      z,
      sx: 0.26,
      sy: 0.14,
      sz: 0.16,
      ry: yaw,
    });
    b.geo(m, K.sphereGeo(), {
      x,
      y: y + 1.62,
      z,
      sx: 0.11,
      sy: 0.14,
      sz: 0.12,
      ry: yaw,
    });
    b.cyl(m, x, y + 1.23, z, 0.08, 0.06, 0.12, 8);
  };

  /** Crystal chandelier hanging from the ceiling at `ceil`, body at y. Baked light + glows. */
