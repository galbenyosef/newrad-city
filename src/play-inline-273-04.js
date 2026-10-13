// play-inline-273 04 — ctx
// Lines 430-771 of readable/play-inline-273.pretty.js (statement-aligned).
  X.paintSkyline = function (ctx, w, h) {
    const r = P.rng("skyline");
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#2c3a2e");
    g.addColorStop(0.35, "#6a7a52");
    g.addColorStop(0.62, "#c8b878");
    g.addColorStop(0.75, "#8a7a50");
    g.addColorStop(1, "#2a2418");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // clouds
    for (let i = 0; i < 60; i++) {
      const x = r() * w,
        y = h * (0.08 + r() * 0.4),
        rr = 40 + r() * 140;
      const cg = ctx.createRadialGradient(x, y, 0, x, y, rr);
      cg.addColorStop(0, "rgba(210,200,150," + (0.05 + r() * 0.08) + ")");
      cg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = cg;
      ctx.fillRect(x - rr, y - rr * 0.4, rr * 2, rr * 0.8);
    }
    // sun disc behind haze
    const sg = ctx.createRadialGradient(
      w * 0.7,
      h * 0.52,
      0,
      w * 0.7,
      h * 0.52,
      90,
    );
    sg.addColorStop(0, "rgba(255,240,190,0.9)");
    sg.addColorStop(0.2, "rgba(255,220,150,0.5)");
    sg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(w * 0.7 - 90, h * 0.52 - 90, 180, 180);
    // far skyline (midtown) — silhouettes with a few spires
    const hz = h * 0.66;
    for (let layer = 0; layer < 3; layer++) {
      const c = [70, 50, 34][layer];
      ctx.fillStyle =
        "rgb(" + ((c * 0.95) | 0) + "," + c + "," + ((c * 0.8) | 0) + ")";
      let x = 0;
      while (x < w) {
        const bw = 18 + r() * (50 - layer * 8),
          bh = (20 + r() * (layer === 0 ? 140 : 90)) * (1 - layer * 0.25);
        const y0 = hz - bh + layer * 16;
        ctx.fillRect(x, y0, bw, h - y0);
        if (r() < 0.12) {
          ctx.beginPath();
          ctx.moveTo(x + bw * 0.2, y0);
          ctx.lineTo(x + bw / 2, y0 - bh * 0.4);
          ctx.lineTo(x + bw * 0.8, y0);
          ctx.fill();
        }
        if (r() < 0.2) {
          ctx.fillRect(x + bw * 0.45, y0 - 30, 2, 30);
        }
        if (r() < 0.25) {
          ctx.fillStyle = "rgba(0,0,0,0.25)";
          ctx.fillRect(x + bw * 0.6, y0, bw * 0.4, 8 + r() * 30);
          ctx.fillStyle =
            "rgb(" + ((c * 0.95) | 0) + "," + c + "," + ((c * 0.8) | 0) + ")";
        }
        // a few lit windows (settlements)
        if (layer < 2)
          for (let k = 0; k < 5; k++)
            if (r() < 0.35) {
              ctx.fillStyle = "rgba(255,200,110," + (0.4 + r() * 0.5) + ")";
              ctx.fillRect(x + r() * bw, y0 + r() * bh * 0.8, 2, 2);
              ctx.fillStyle =
                "rgb(" +
                ((c * 0.95) | 0) +
                "," +
                c +
                "," +
                ((c * 0.8) | 0) +
                ")";
            }
        x += bw + r() * 6;
      }
    }
    // the park: a dark mass of dead trees and the reservoir sheen
    ctx.fillStyle = "#1e1c14";
    ctx.fillRect(0, h * 0.78, w, h * 0.22);
    for (let i = 0; i < 900; i++) {
      const x = r() * w,
        y = h * 0.74 + r() * h * 0.1;
      ctx.strokeStyle = "rgba(30,26,18,0.8)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, h * 0.8);
      ctx.lineTo(x + (r() - 0.5) * 8, y);
      ctx.stroke();
    }
    const rg = ctx.createLinearGradient(0, h * 0.82, 0, h * 0.86);
    rg.addColorStop(0, "rgba(150,170,120,0.0)");
    rg.addColorStop(0.5, "rgba(150,170,120,0.35)");
    rg.addColorStop(1, "rgba(150,170,120,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(w * 0.2, h * 0.82, w * 0.5, h * 0.04);
    // haze
    const hg = ctx.createLinearGradient(0, h * 0.5, 0, h * 0.8);
    hg.addColorStop(0, "rgba(180,170,110,0)");
    hg.addColorStop(1, "rgba(180,170,110,0.25)");
    ctx.fillStyle = hg;
    ctx.fillRect(0, h * 0.5, w, h * 0.3);
  };

  // ------------------------------------------------------------------
  // Geometry helpers
  // ------------------------------------------------------------------
  /** Annular sector shape (XY) from angle aS to aE (rad), radii r0..r1. */
  X.sector = function (r0, r1, aS, aE) {
    const sh = new THREE.Shape();
    sh.moveTo(Math.cos(aS) * r1, Math.sin(aS) * r1);
    sh.absarc(0, 0, r1, aS, aE, false);
    sh.lineTo(Math.cos(aE) * r0, Math.sin(aE) * r0);
    sh.absarc(0, 0, r0, aE, aS, true);
    sh.closePath();
    return sh;
  };
  /** Flat annular sector slab: top at y, thickness t, around local centre (cx,cz). World angle a = atan2(z, x). */
  X.sectorSlab = function (b, key, cx, cz, r0, r1, aS, aE, y, t, o) {
    const g = new THREE.ExtrudeGeometry(X.sector(r0, r1, aS, aE), {
      depth: t,
      bevelEnabled: false,
      curveSegments: Math.max(3, Math.ceil((aE - aS) / 0.12)),
    });
    return b.geo(
      key,
      g,
      P.m4(cx, y, cz, 0, HP),
      Object.assign({ uv: "box" }, o || {}),
    );
  };
  /** Colliders approximating an annular sector (walkable top at y). */
  X.sectorCol = function (S, cx, cz, r0, r1, aS, aE, y, t, co) {
    const n = Math.max(1, Math.ceil((aE - aS) / 0.35));
    const da = (aE - aS) / n;
    for (let i = 0; i < n; i++) {
      const a = aS + (i + 0.5) * da;
      // two radial pieces so the outer part is wide enough
      const rm = (r0 + r1) / 2,
        rOuter = r1 - (r1 - r0) * 0.25;
      S.colR(
        cx + Math.cos(a) * rm,
        cz + Math.sin(a) * rm,
        r1 - r0,
        Math.max(0.4, rm * da * 1.15),
        y - (t || 0.3),
        y,
        -a,
        co,
      );
      S.colR(
        cx + Math.cos(a) * rOuter,
        cz + Math.sin(a) * rOuter,
        (r1 - r0) * 0.5,
        Math.max(0.4, r1 * da * 1.12),
        y - (t || 0.3),
        y,
        -a,
        co,
      );
    }
  };

  /**
   * The Ansonia-style open-well spiral stair. levels: [y0, y1, ...]; landing centred on angle a0 spanning `land` rad.
   * o: {rIn, rOut, steps (per floor), key (tread), soffit, rail (key), newel}
   * Treads rise counter-clockwise (increasing world angle) from each landing to the next.
   */
  X.spiralStair = function (S, cx, cz, levels, o) {
    o = o || {};
    const b = S.b;
    const rIn = o.rIn || 1.8,
      rOut = o.rOut || 5,
      land = o.land || PI / 3,
      a0 = o.a0 || 0,
      n = o.steps || 15;
    const key = o.key || "marble",
      rail = o.rail || "iron";
    const railPts = [];
    for (let li = 0; li < levels.length; li++) {
      const y = levels[li];
      const aS = a0 - land / 2,
        aE = a0 + land / 2;
      // landing
      if (li > 0) {
        X.sectorSlab(b, key, cx, cz, rIn, rOut, aS, aE, y, 0.3, { grime: 0.3 });
        X.sectorCol(S, cx, cz, rIn, rOut, aS, aE, y, 0.3, {
          surface: "concrete",
        });
      }
      railPts.push([aS, y]);
      railPts.push([aE, y]);
      if (li === levels.length - 1) break;
      const y1 = levels[li + 1];
      const rise = (y1 - y) / (n + 1),
        dA = (TAU - land) / n;
      for (let k = 0; k < n; k++) {
        const ta = aE + k * dA,
          tb = ta + dA,
          top = y + (k + 1) * rise,
          ac = (ta + tb) / 2;
        // tread (marble slab) + iron soffit plate + riser
        X.sectorSlab(b, key, cx, cz, rIn, rOut, ta, tb + 0.01, top, 0.1, {
          grime: 0.25,
        });
        X.sectorSlab(
          b,
          o.soffit || "iron",
          cx,
          cz,
          rIn + 0.05,
          rOut,
          ta,
          tb,
          top - 0.1,
          0.16,
          { grime: 0.4, noAO: true },
        );
        // colliders: inner and outer pieces
        const rm = (rIn + rOut) / 2,
          ro = rOut - 0.8;
        S.colR(
          cx + Math.cos(ac) * rm,
          cz + Math.sin(ac) * rm,
          rOut - rIn,
          Math.max(0.5, rm * dA * 1.2),
          top - 0.3,
          top,
          -ac,
          { surface: "concrete" },
        );
        S.colR(
          cx + Math.cos(ac) * ro,
          cz + Math.sin(ac) * ro,
          1.6,
          Math.max(0.5, rOut * dA * 1.15),
          top - 0.3,
          top,
          -ac,
          { surface: "concrete" },
        );
        // inner baluster + rail collider
        const bx = cx + Math.cos(ac) * (rIn + 0.08),
          bz = cz + Math.sin(ac) * (rIn + 0.08);
        b.rod(rail, [bx, top, bz], [bx, top + 0.95, bz], 0.018, 4, {
          noAO: true,
        });
        if (k % 3 === 1)
          b.lathe(
            rail,
            [
              [0.001, 0],
              [0.04, 0.02],
              [0.02, 0.2],
              [0.035, 0.45],
              [0.02, 0.7],
              [0.03, 0.95],
              [0.001, 0.96],
            ],
            6,
            bx,
            top,
            bz,
            { noAO: true },
          );
        S.colR(
          bx,
          bz,
          0.14,
          Math.max(0.4, rIn * dA * 1.4),
          top,
          top + 1.0,
          -ac,
          { walkable: false, tag: "rail" },
        );
        railPts.push([ac, top]);
      }
    }
    // helical handrail (brass cap over iron) along the inner edge
    railPts.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
    let prev = null;
    let unwrap = 0;
    for (const [a, y] of railPts) {
      const pa = [
        cx + Math.cos(a) * (rIn + 0.08),
        y + 0.97,
        cz + Math.sin(a) * (rIn + 0.08),
      ];
      if (prev && Math.abs(y - prev[1]) < 0.7)
        b.rod(
          o.cap || "brass",
          [prev[0][0], prev[0][1], prev[0][2]],
          pa,
          0.035,
          5,
          { noAO: true },
        );
      prev = [pa, y];
      void unwrap;
    }
    // landing rails (inner edge)
    for (let li = 1; li < levels.length; li++) {
      const y = levels[li];
      const aS = a0 - land / 2,
        aE = a0 + land / 2,
        m = 5;
      for (let i = 0; i <= m; i++) {
        const a = aS + ((aE - aS) * i) / m,
          px = cx + Math.cos(a) * (rIn + 0.08),
          pz = cz + Math.sin(a) * (rIn + 0.08);
        b.rod(rail, [px, y, pz], [px, y + 0.95, pz], 0.02, 4, { noAO: true });
        if (i < m) {
          const a2 = aS + ((aE - aS) * (i + 1)) / m;
          b.rod(
            o.cap || "brass",
            [px, y + 0.97, pz],
            [
              cx + Math.cos(a2) * (rIn + 0.08),
              y + 0.97,
              cz + Math.sin(a2) * (rIn + 0.08),
            ],
            0.035,
            5,
            { noAO: true },
          );
        }
      }
      X.sectorCol(S, cx, cz, rIn - 0.05, rIn + 0.12, aS, aE, y + 1.0, 1.0, {
        walkable: false,
        tag: "rail",
      });
    }
  };

  /**
   * Round (n-gon) wall around (cx,cz), radius R, from y0 to y1, thickness t.
   * doors: [{a (angle), w, y, h}] cut from the panel nearest angle a. o.key, o.inside (key for inner skin), o.pilasters
   */
