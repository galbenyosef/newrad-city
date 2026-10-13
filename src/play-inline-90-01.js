// play-inline-90 01 — beam
// Lines 8-354 of readable/play-inline-90.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const M = G.map._;

  // -------------------------------------------------------------------
  // Water tower: steel stand, wooden stave tank with hoops, conical roof
  // -------------------------------------------------------------------
  M.waterTowers = [];
  M.waterTower = function (x, y, z, s, broken) {
    s = s || 1;
    const layer = "detail";
    const R = 2.3 * s,
      TH = 4.3 * s,
      LH = 3.2 * s;
    M.waterTowers.push({ x, y, z, s, broken: !!broken });
    // steel stand (visible from far: main layer so skyline keeps its towers)
    const bs = M.buf("rust", x, z, "main");
    const legC = [0.45, 0.4, 0.36];
    const nLeg = 6;
    for (let i = 0; i < nLeg; i++) {
      const a = (i / nLeg) * Math.PI * 2;
      const lx = x + Math.cos(a) * R * 0.85,
        lz = z + Math.sin(a) * R * 0.85;
      if (broken && i === 1) {
        M.beam(
          bs,
          lx,
          y,
          lz,
          lx + 1.5,
          y + LH * 0.5,
          lz + 0.6,
          0.22 * s,
          0.22 * s,
          { c: legC },
        );
        continue;
      }
      M.beam(bs, lx, y, lz, lx, y + LH, lz, 0.22 * s, 0.22 * s, { c: legC });
      const b2 = i + 1,
        a2 = (b2 / nLeg) * Math.PI * 2;
      const mx = x + Math.cos(a2) * R * 0.85,
        mz = z + Math.sin(a2) * R * 0.85;
      if (i % 2 === 0) {
        M.beam(
          M.buf("rust", x, z, layer),
          lx,
          y + 0.3,
          lz,
          mx,
          y + LH - 0.3,
          mz,
          0.06,
          0.06,
          { c: legC },
        );
        M.beam(
          M.buf("rust", x, z, layer),
          mx,
          y + 0.3,
          mz,
          lx,
          y + LH - 0.3,
          lz,
          0.06,
          0.06,
          { c: legC },
        );
      }
    }
    // platform (steel beams)
    M.beam(bs, x - R, y + LH, z, x + R, y + LH, z, 0.3 * s, 0.35 * s, {
      c: legC,
    });
    M.beam(bs, x, y + LH, z - R, x, y + LH, z + R, 0.3 * s, 0.35 * s, {
      c: legC,
    });
    M.disc(bs, x, y + LH + 0.18 * s, z, R * 1.08, 12, 1, [0.5, 0.45, 0.4], 2);
    // tank
    const tilt = broken ? 0.32 : 0;
    if (broken)
      M.pushXF(
        M.mtx(x, y + LH, z, 0.5, 0, tilt).multiply(M.mtx(-x, -(y + LH), -z, 0)),
      );
    const bw = M.buf("wood_rotten", x, z, "main");
    const woodC = [0.72, 0.62, 0.5],
      woodT = [0.82, 0.72, 0.58];
    M.cyl(bw, x, y + LH + 0.2, z, R, R * 0.97, TH, 14, {
      cb: M.mulc(woodC, 0.75),
      ct: woodT,
      s: 2.5,
    });
    // hoops
    const bh = M.buf("rust", x, z, layer);
    for (let k = 0; k < 3; k++) {
      const hy = y + LH + 0.7 + (k * TH) / 3.1;
      M.cyl(bh, x, hy, z, R + 0.05, R + 0.05, 0.1, 10, { c: [0.4, 0.3, 0.26] });
    }
    // conical roof + finial
    const br = M.buf("metal_painted", x, z, "main");
    M.cyl(br, x, y + LH + 0.2 + TH, z, R * 1.08, 0.1, 1.6 * s, 14, {
      c: [0.35, 0.33, 0.3],
    });
    M.cyl(br, x, y + LH + 0.2 + TH + 1.5 * s, z, 0.12, 0.05, 0.6 * s, 5, {
      c: [0.3, 0.3, 0.3],
    });
    // outlet pipe & ladder
    M.pipe(
      M.buf("rust", x, z, layer),
      x,
      y,
      z,
      x,
      y + LH + 0.2,
      z,
      0.18 * s,
      6,
      { c: [0.45, 0.38, 0.33] },
    );
    const lb = M.buf("rust", x, z, layer);
    const lx = x + R + 0.12,
      lz = z;
    for (const dz of [-0.25, 0.25])
      M.beam(
        lb,
        lx,
        y + LH,
        lz + dz,
        lx,
        y + LH + TH + 0.3,
        lz + dz,
        0.04,
        0.04,
        { c: [0.4, 0.35, 0.3] },
      );
    for (let yy = y + LH + 0.4; yy < y + LH + TH; yy += 0.7)
      M.beam(lb, lx, yy, lz - 0.25, lx, yy, lz + 0.25, 0.03, 0.03, {
        c: [0.4, 0.35, 0.3],
      });
    if (broken) M.popXF();
  };

  // -------------------------------------------------------------------
  // Fire escape along a wall a→b (outward normal nx,nz), starting at
  // distance t along the wall, width w, platforms every flH from yFrom..yTo
  // -------------------------------------------------------------------
  M.fireEscape = function (ax, az, bx, bz, nx, nz, t, w, yFrom, yTo, flH, r) {
    const len = Math.hypot(bx - ax, bz - az);
    if (len < 1) return;
    const ux = (bx - ax) / len,
      uz = (bz - az) / len;
    const P = (tt, off) => [ax + ux * tt + nx * off, az + uz * tt + nz * off];
    const cx = ax + ux * (t + w / 2),
      cz = az + uz * (t + w / 2);
    const b = M.buf("metal_painted", cx, cz, "detail");
    const col = r.pick([
      [0.24, 0.23, 0.22],
      [0.3, 0.27, 0.24],
      [0.35, 0.3, 0.25],
      [0.2, 0.24, 0.22],
    ]);
    const D = 1.15;
    let k = 0;
    const levels = [];
    for (let y = yFrom; y <= yTo; y += flH) levels.push(y);
    if (levels.length < 2) return;
    const brokenLevel = r() < 0.2 ? r.int(1, levels.length - 1) : -1;
    for (const y of levels) {
      const A = P(t, 0.05),
        B = P(t + w, 0.05),
        C = P(t + w, D),
        Dd = P(t, D);
      if (k === brokenLevel) {
        // twisted, sagging platform hanging off one bracket
        M.quad(
          b,
          [A[0], y, A[1]],
          [B[0], y - 1.2, B[1]],
          [C[0], y - 1.5, C[1]],
          [Dd[0], y - 0.2, Dd[1]],
          [0, 1, 0],
          [0, 0, 2, 0, 2, 0.5, 0, 0.5],
          col,
        );
        k++;
        continue;
      }
      // grating slab (top + bottom faces)
      M.quad(
        b,
        [A[0], y, A[1]],
        [B[0], y, B[1]],
        [C[0], y, C[1]],
        [Dd[0], y, Dd[1]],
        [0, 1, 0],
        [0, 0, w / 2, 0, w / 2, 0.5, 0, 0.5],
        col,
      );
      M.quad(
        b,
        [A[0], y - 0.06, A[1]],
        [B[0], y - 0.06, B[1]],
        [C[0], y - 0.06, C[1]],
        [Dd[0], y - 0.06, Dd[1]],
        [0, -1, 0],
        [0, 0, w / 2, 0, w / 2, 0.5, 0, 0.5],
        M.mulc(col, 0.7),
      );
      // front + side top rails, front mid rail
      M.beam(b, Dd[0], y + 0.95, Dd[1], C[0], y + 0.95, C[1], 0.04, 0.04, {
        c: col,
      });
      M.beam(b, Dd[0], y + 0.5, Dd[1], C[0], y + 0.5, C[1], 0.03, 0.03, {
        c: col,
      });
      M.beam(b, A[0], y + 0.95, A[1], Dd[0], y + 0.95, Dd[1], 0.04, 0.04, {
        c: col,
      });
      M.beam(b, B[0], y + 0.95, B[1], C[0], y + 0.95, C[1], 0.04, 0.04, {
        c: col,
      });
      // balusters on the front (cheap double-faced bars)
      const nb = Math.max(2, Math.round(w / 0.55));
      for (let i = 0; i <= nb; i++) {
        const tt = t + (w * i) / nb;
        const q = P(tt, D);
        M.vbar(b, q[0], q[1], y, y + 0.95, 0.035, nx, nz, col, true);
      }
      // bracket under the slab
      {
        const p = P(t + w / 2, 0.05),
          q = P(t + w / 2, D);
        M.beam(b, p[0], y - 0.7, p[1], q[0], y - 0.06, q[1], 0.04, 0.04, {
          c: col,
        });
      }
      // stair to the next level (alternating direction)
      if (k < levels.length - 1) {
        const up = k % 2 === 0;
        const s0 = up ? t + 0.3 : t + w - 0.3,
          s1 = up ? t + w - 1.2 : t + 1.2;
        const off = D * 0.55;
        const p = P(s0, off),
          q = P(s1, off);
        for (const o of [-0.28, 0.28]) {
          const p2 = P(s0, off + o),
            q2 = P(s1, off + o);
          M.beam(b, p2[0], y, p2[1], q2[0], y + flH, q2[1], 0.04, 0.12, {
            c: col,
          });
        }
        const nSteps = 5;
        for (let i = 1; i < nSteps; i++) {
          const f = i / nSteps;
          const sx = p[0] + (q[0] - p[0]) * f,
            sz = p[1] + (q[1] - p[1]) * f;
          M.beam(
            b,
            sx - nx * 0.28,
            y + flH * f,
            sz - nz * 0.28,
            sx + nx * 0.28,
            y + flH * f,
            sz + nz * 0.28,
            0.2,
            0.03,
            { c: col },
          );
        }
        const pr = P(s0, off + 0.3),
          qr = P(s1, off + 0.3);
        M.beam(
          b,
          pr[0],
          y + 0.9,
          pr[1],
          qr[0],
          y + flH + 0.9,
          qr[1],
          0.03,
          0.03,
          { c: col },
        );
      }
      k++;
    }
    // drop ladder from the lowest platform (sometimes hanging broken)
    const y0 = levels[0];
    const lp = P(t + w - 0.5, D - 0.2);
    const drop = r() < 0.3;
    for (const o of [-0.22, 0.22]) {
      const q = [lp[0] + ux * o, lp[1] + uz * o];
      M.beam(
        b,
        q[0],
        y0 - (drop ? 2.2 : 0.2),
        q[1],
        q[0],
        y0 + 1.6,
        q[1],
        0.03,
        0.03,
        { c: col },
      );
    }
    for (let yy = y0 - (drop ? 2.0 : 0); yy < y0 + 1.5; yy += 0.32)
      M.beam(
        b,
        lp[0] - ux * 0.22,
        yy,
        lp[1] - uz * 0.22,
        lp[0] + ux * 0.22,
        yy,
        lp[1] + uz * 0.22,
        0.025,
        0.025,
        { c: col },
      );
  };

  // -------------------------------------------------------------------
  // Rubble pile: mound + broken slabs/bricks + rebar
  // -------------------------------------------------------------------
  let moundGeo = null;
  function mound() {
    if (moundGeo) return moundGeo;
    const THREE = window.THREE;
    const g = new THREE.SphereGeometry(
      1,
      10,
      6,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2,
    );
    const p = g.attributes.position,
      r = M.rng("mound");
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i);
      const k = y > 0.02 ? 0.8 + r() * 0.35 : 1;
      p.setXYZ(i, p.getX(i) * k, y * (0.75 + r() * 0.4), p.getZ(i) * k);
    }
    g.computeVertexNormals();
    moundGeo = g;
    return g;
  }
