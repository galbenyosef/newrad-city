// play-inline-420 02 — math
// Lines 19-368 of readable/play-inline-420.pretty.js (statement-aligned).
  const PV = G._ph2;
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
  // Dressing
  // ------------------------------------------------------------------
  K.chandelier = function (b, x, y, z, ceil, o) {
    o = o || {};
    const col = K.tint(o.color || [1, 0.82, 0.55]),
      R = o.r || 0.9;
    b.pipe("brass", x, y + 0.3, z, x, ceil, z, 0.02, 4);
    b.cyl("brass", x, y - 0.05, z, 0.12, 0.2, 0.35, 8, { bottom: true });
    b.cyl("brass", x, y + 0.05, z, R, R, 0.04, 16, { top: true });
    const n = o.arms || 8;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * PI * 2,
        px = x + Math.cos(a) * R,
        pz = z - Math.sin(a) * R;
      b.pipe("brass", x, y + 0.02, z, px, y + 0.1, pz, 0.012, 3);
      b.cyl("brass", px, y + 0.1, pz, 0.05, 0.04, 0.06, 6);
      if (!o.dead) {
        b.geo("lamp", K.sphereGeo(), {
          x: px,
          y: y + 0.2,
          z: pz,
          s: 0.04,
          tint: col,
        });
        b.glow(
          px,
          y + 0.2,
          pz,
          col.map((v) => v * 0.5),
          0.5,
        );
      }
      // crystal drops
      for (let d = 0; d < 3; d++)
        b.geo("crystal", K.sphereGeo(), {
          x: x + Math.cos(a + 0.2) * R * (0.4 + d * 0.3),
          y: y - 0.12 - d * 0.06,
          z: z - Math.sin(a + 0.2) * R * (0.4 + d * 0.3),
          sx: 0.02,
          sy: 0.05,
          sz: 0.02,
          tint: o.dead ? [0.35, 0.35, 0.38] : [0.55, 0.5, 0.42],
        });
    }
    for (let k = 0; k < 8; k++)
      b.geo("crystal", K.sphereGeo(), {
        x,
        y: y - 0.3 - k * 0.07,
        z,
        sx: 0.035,
        sy: 0.04,
        sz: 0.035,
        tint: o.dead ? [0.35, 0.35, 0.38] : [0.6, 0.55, 0.45],
      });
    if (!o.dead) {
      b.light(
        x,
        y - 0.2,
        z,
        col,
        o.intensity || 1.2,
        o.radius || 9,
        o.lightOpts,
      );
      b.glow(
        x,
        y,
        z,
        col.map((v) => v * 0.6),
        o.glowSize || 2.2,
      );
    }
  };

  /** Silver cloche on a plate (dining). */
  /** Ruined Manhattan skyline panorama (for window plates in high rooms). variant = seed. */
  K.skyline = function (variant, w, h) {
    w = w || 512;
    h = h || 256;
    return K.paint(
      "pics",
      "ph2_skyline_" + variant,
      w,
      h,
      function (x, X, Y, W, H) {
        const r = K.rng("sky" + variant);
        const g = x.createLinearGradient(0, Y, 0, Y + H);
        g.addColorStop(0, "#8e9a78");
        g.addColorStop(0.55, "#c4b98c");
        g.addColorStop(0.8, "#a89a70");
        g.addColorStop(1, "#5a5444");
        x.fillStyle = g;
        x.fillRect(X, Y, W, H);
        // sun haze
        const sg = x.createRadialGradient(
          X + W * 0.7,
          Y + H * 0.35,
          0,
          X + W * 0.7,
          Y + H * 0.35,
          H * 0.5,
        );
        sg.addColorStop(0, "rgba(255,240,190,0.55)");
        sg.addColorStop(1, "rgba(255,240,190,0)");
        x.fillStyle = sg;
        x.fillRect(X, Y, W, H);
        // three layers of towers, far → near (darker, taller, more broken)
        for (let layer = 0; layer < 3; layer++) {
          const base = Y + H * (0.62 + layer * 0.12),
            shade = 150 - layer * 45;
          let px = X - 10;
          while (px < X + W) {
            const bw = 10 + r() * (18 + layer * 10),
              bh = H * (0.12 + r() * (0.3 + layer * 0.12));
            x.fillStyle =
              "rgb(" +
              ((shade * 0.85) | 0) +
              "," +
              ((shade * 0.88) | 0) +
              "," +
              ((shade * 0.78) | 0) +
              ")";
            x.beginPath();
            x.moveTo(px, base);
            x.lineTo(px, base - bh);
            if (r() < 0.35) {
              const k = r() * bw;
              x.lineTo(px + k, base - bh - r() * 12);
              x.lineTo(px + k + 3, base - bh + r() * 20);
            } // broken top
            else if (r() < 0.2) {
              x.lineTo(px + bw / 2, base - bh - bh * 0.25);
            } // spire
            x.lineTo(px + bw, base - bh);
            x.lineTo(px + bw, base);
            x.fill();
            if (layer === 2) {
              x.fillStyle = "rgba(20,20,15,0.5)";
              for (let k = 0; k < 6; k++)
                x.fillRect(
                  px + 2 + r() * (bw - 4),
                  base - bh + 4 + r() * (bh - 8),
                  2,
                  3,
                );
            }
            px += bw + r() * 4;
          }
        }
        // dust & smoke columns
        for (let k = 0; k < 3; k++) {
          const sx = X + r() * W;
          const sg2 = x.createLinearGradient(sx, Y + H * 0.2, sx, Y + H * 0.7);
          sg2.addColorStop(0, "rgba(70,65,55,0)");
          sg2.addColorStop(1, "rgba(70,65,55,0.35)");
          x.fillStyle = sg2;
          x.fillRect(sx - 12, Y + H * 0.2, 24, H * 0.5);
        }
        K.grain(x, X, Y, W, H, 25, 700 + variant);
      },
    );
  };

  /** Tattered flag / banner with alpha holes. kind: 'us' | 'us_upside' | 'raider' */
