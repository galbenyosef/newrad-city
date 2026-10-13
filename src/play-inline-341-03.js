// play-inline-341 03 — tint
// Lines 350-679 of readable/play-inline-341.pretty.js (statement-aligned).
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
