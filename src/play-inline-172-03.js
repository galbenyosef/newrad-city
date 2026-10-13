// play-inline-172 03 — tint
// Lines 361-649 of readable/play-inline-172.pretty.js (statement-aligned).
  K.block = function (b, mat, x0, z0, x1, z1, y0, y1, o) {
    o = o || {};
    b.box(mat, (x0 + x1) / 2, y0, (z0 + z1) / 2, x1 - x0, y1 - y0, z1 - z0, {
      faces: o.faces || "nsew",
      tint: o.tint,
      grime: o.grime,
      seg: o.seg || 7,
    });
    if (o.roof !== false)
      b.box(
        o.roof || "concrete_dark",
        (x0 + x1) / 2,
        y1,
        (z0 + z1) / 2,
        x1 - x0,
        0.01,
        z1 - z0,
        { faces: "t", tint: o.roofTint },
      );
    if (o.cornice) {
      const c = o.cornice,
        m = o.corniceMat || "limestone";
      b.box(
        m,
        (x0 + x1) / 2,
        y1 - c.h,
        (z0 + z1) / 2,
        x1 - x0 + c.d * 2,
        c.h,
        z1 - z0 + c.d * 2,
        { faces: "nsewtb", tint: o.corniceTint },
      );
    }
    if (o.col !== false)
      K.colBox(x0, y0, z0, x1, y1, z1, { surface: "concrete" });
  };
  /**
   * 3D window surrounds for a K.block that uses a K.facade material: the painted window grid gets a real
   * projecting stone sill, a lintel / hood (optionally with a keystone), and two jamb strips, so the façade
   * reads with depth and casts contact shadows instead of looking like wallpaper. Positions are derived from
   * the façade spec exactly the way BP.face lays out its UVs (u from each face's start corner, v = world y),
   * so every surround frames its painted window. Everything merges into the builder's existing batches
   * (no new draw calls; ~30 tris per window).
   * o: {faces:'nsew', mat, tint, maxY, minY, proj, keystone, jambs=true, hood:'flat'|'cornice',
   *     skip(x, z, yBottom, face) → true to leave a window bare (doors, portals),
   *     piers:{mat, tint, w, d, y0, y1} → pilasters on the bay boundaries (never across a window)}
   */
  K.reveals = function (b, key, x0, z0, x1, z1, y0, y1, o) {
    const s = K.facadeSpecs && K.facadeSpecs[key];
    if (!s) return 0;
    o = o || {};
    const w = s.win || { x0: 0.25, x1: 0.75, y0: 0.2, y1: 0.8 };
    const bw = s.bayW,
      fh = s.floorH;
    const mat = o.mat || "limestone",
      tint = o.tint === undefined ? 0xd4c8b0 : o.tint;
    const pr = o.proj || 0.14;
    const yMax = Math.min(y1, o.maxY === undefined ? 36 : o.maxY),
      yMin = Math.max(y0, o.minY || 0);
    const hw = ((w.x1 - w.x0) * bw) / 2,
      cu = ((w.x0 + w.x1) / 2) * bw;
    const FD = {
      s: { ox: x0, oz: z1, ux: 1, uz: 0, nx: 0, nz: 1, L: x1 - x0, back: "n" },
      n: {
        ox: x1,
        oz: z0,
        ux: -1,
        uz: 0,
        nx: 0,
        nz: -1,
        L: x1 - x0,
        back: "s",
      },
      e: { ox: x1, oz: z1, ux: 0, uz: -1, nx: 1, nz: 0, L: z1 - z0, back: "w" },
      w: { ox: x0, oz: z0, ux: 0, uz: 1, nx: -1, nz: 0, L: z1 - z0, back: "e" },
    };
    const all = "nsewtb";
    const without = (str, ch) =>
      str
        .split("")
        .filter((c) => ch.indexOf(c) < 0)
        .join("");
    // box helper: centre on the face at along-distance a, height y..y+h, length len along the face, depth d out of the wall
    const put = (F, m, a, y, h, len, d, faces, tn) => {
      const cx = F.ox + F.ux * a + (F.nx * d) / 2,
        cz = F.oz + F.uz * a + (F.nz * d) / 2;
      if (F.nx === 0) b.box(m, cx, y, cz, len, h, d, { faces, tint: tn });
      else b.box(m, cx, y, cz, d, h, len, { faces, tint: tn });
    };
    let n = 0;
    for (const f of o.faces || "nsew") {
      const F = FD[f];
      if (!F) continue;
      const fb = without(all, F.back);
      for (let k = Math.floor(yMin / fh); k * fh < yMax; k++) {
        const wb = k * fh + fh * w.y0,
          wt = k * fh + fh * w.y1;
        if (wb < yMin - 0.01 || wt > yMax + 0.01) continue;
        for (let a = cu; a + hw <= F.L - 0.25; a += bw) {
          if (a - hw < 0.25) continue;
          const wx = F.ox + F.ux * a,
            wz = F.oz + F.uz * a;
          if (o.skip && o.skip(wx, wz, wb, f)) continue;
          // sill: deeper than the rest, slight drip overhang
          put(F, mat, a, wb - 0.13, 0.13, hw * 2 + 0.34, pr + 0.08, fb, tint);
          // lintel / hood
          if (o.hood === "cornice") {
            put(F, mat, a, wt, 0.12, hw * 2 + 0.3, pr, fb, tint);
            put(F, mat, a, wt + 0.12, 0.1, hw * 2 + 0.46, pr + 0.07, fb, tint);
          } else put(F, mat, a, wt, 0.2, hw * 2 + 0.24, pr, fb, tint);
          if (o.keystone)
            put(F, mat, a, wt - 0.08, 0.36, 0.3, pr + 0.05, fb, tint);
          if (o.jambs !== false)
            for (const sg of [-1, 1])
              put(
                F,
                mat,
                a + sg * (hw + 0.05),
                wb,
                wt - wb,
                0.1,
                pr * 0.6,
                without(fb, "tb"),
                tint,
              );
          n++;
        }
      }
      // pilasters on the bay boundaries (between windows), full height of the band
      if (o.piers) {
        const P = o.piers,
          py0 = P.y0 === undefined ? y0 : P.y0,
          py1 = P.y1 === undefined ? y1 : P.y1;
        for (let a = bw; a < F.L - 0.3; a += bw) {
          const wx = F.ox + F.ux * a,
            wz = F.oz + F.uz * a;
          if (P.skip && P.skip(wx, wz, f)) continue;
          put(
            F,
            P.mat || mat,
            a,
            py0,
            py1 - py0,
            P.w || 0.5,
            P.d || 0.3,
            without(fb, "b"),
            P.tint === undefined ? tint : P.tint,
          );
        }
      }
    }
    return n;
  };
  /**
   * Hipped roof over a rectangle (ridge along the longer side unless o.axis 'x'|'z'), eaves at y, ridge at y+h.
   * o: {eave (overhang, m), tint, grime, tile} — tiled UVs (the roof texture keeps its texel density).
   */
  K.hipRoof = function (b, mat, x0, z0, x1, z1, y, h, o) {
    o = o || {};
    const ev = o.eave || 0;
    x0 -= ev;
    z0 -= ev;
    x1 += ev;
    z1 += ev;
    const axis = o.axis || (x1 - x0 >= z1 - z0 ? "x" : "z");
    const tile = o.tile || K.tile(mat)[0];
    // work in (u along ridge, v across); P maps back to world
    const U0 = axis === "x" ? x0 : z0,
      U1 = axis === "x" ? x1 : z1,
      V0 = axis === "x" ? z0 : x0,
      V1 = axis === "x" ? z1 : x1;
    const half = (V1 - V0) / 2,
      vc = (V0 + V1) / 2,
      Y = y + h;
    let r0 = U0 + half,
      r1 = U1 - half;
    if (r0 > r1) r0 = r1 = (U0 + U1) / 2; // forced short-axis ridge → pyramid
    const P = (u, yy, v) => (axis === "x" ? [u, yy, v] : [v, yy, u]);
    const slope = Math.hypot(half, h);
    const q = (a, bq, c, d, len) => {
      // keep CCW-from-outside winding in world space: the x↔z swap mirrors, so flip the order for axis 'z'
      const rect = [0, 0, len / tile, slope / tile];
      if (axis === "x")
        b.quad(mat, a, bq, c, d, {
          rect,
          tint: o.tint,
          grime: o.grime === undefined ? 0.5 : o.grime,
        });
      else
        b.quad(mat, bq, a, d, c, {
          rect,
          tint: o.tint,
          grime: o.grime === undefined ? 0.5 : o.grime,
        });
    };
    q(P(U0, y, V1), P(U1, y, V1), P(r1, Y, vc), P(r0, Y, vc), U1 - U0); // +v slope
    q(P(U1, y, V0), P(U0, y, V0), P(r0, Y, vc), P(r1, Y, vc), U1 - U0); // -v slope
    q(P(U1, y, V1), P(U1, y, V0), P(r1, Y, vc), P(r1, Y, vc), V1 - V0); // +u hip
    q(P(U0, y, V0), P(U0, y, V1), P(r0, Y, vc), P(r0, Y, vc), V1 - V0); // -u hip
    return { ridgeY: Y, r0, r1, vc, axis };
  };
  /**
   * NYC rooftop water tank: cedar-stave tub on a riveted steel stand, iron hoops, conical cap with a finial,
   * access ladder. (x,y,z) = roof point under the tank centre. o: {r, lean, broken}
   */
  K.waterTower = function (b, x, y, z, o) {
    o = o || {};
    const r = o.r || 2.1,
      legH = 3.2,
      tankH = 3.8,
      lean = o.lean || 0;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2,
        lx = x + Math.cos(a) * r * 0.85,
        lz = z + Math.sin(a) * r * 0.85;
      b.beam("rust", lx, y, lz, lx + lean * 0.5, y + legH, lz, 0.16);
    }
    for (let i = 0; i < 6; i++) {
      // cross bracing
      const a0 = (i / 6) * PI * 2,
        a1 = ((i + 1) / 6) * PI * 2,
        R0 = r * 0.85;
      b.beam(
        "rust",
        x + Math.cos(a0) * R0,
        y + 0.3,
        z + Math.sin(a0) * R0,
        x + Math.cos(a1) * R0 + lean * 0.45,
        y + legH - 0.3,
        z + Math.sin(a1) * R0,
        0.05,
      );
    }
    b.cyl(
      "rust",
      x + lean * 0.5,
      y + legH - 0.2,
      z,
      r + 0.15,
      r + 0.15,
      0.25,
      12,
      { top: true, tint: 0x6a5a4a },
    );
    const tx = x + lean * 0.5,
      ty = y + legH;
    b.cyl("wood_rotten", tx, ty, z, r, r * 0.94, tankH, 16, {
      tint: 0x7a6450,
      bottom: true,
    });
    for (let k = 0; k < 5; k++)
      b.cyl(
        "black_metal",
        tx,
        ty + 0.35 + (k * (tankH - 0.6)) / 4,
        z,
        r * (1.012 - k * 0.012) + 0.03,
        r * (1.012 - k * 0.012) + 0.03,
        0.08,
        16,
        { grime: 0.3 },
      );
    b.cyl("wood_dark", tx, ty + tankH, z, r * 1.02, 0.12, 1.5, 12, {
      tint: 0x5a4a3a,
    });
    b.geo("rust", T.sphereLo, { x: tx, y: ty + tankH + 1.55, z, s: 0.14 });
    // ladder up the stand and the tub
    const lx = tx + r + 0.12;
    for (const dz of [-0.22, 0.22])
      b.beam("black_metal", lx, y, z + dz, lx, ty + tankH + 0.3, z + dz, 0.04);
    for (let h = 0.4; h < legH + tankH; h += 0.4)
      b.beam("black_metal", lx, y + h, z - 0.22, lx, y + h, z + 0.22, 0.03);
    if (o.broken) {
      // a burst stave and a rust streak
      b.box("black", tx, ty + 0.9, z + r * 0.97, 0.5, 1.6, 0.02, {
        faces: "s",
        grime: 0,
      });
      b.box("wood_rotten", tx + 0.6, y, z + r + 0.6, 0.18, 0.05, 2.2, {
        yaw: 0.7,
        tint: 0x6a5642,
      });
    }
  };
  /**
   * Ruin-dense rooftop dressing inside a rectangle at roof height y: HVAC housings, vent stacks with
   * rain hoods, a stair bulkhead, skylight frame with broken panes, tar patches, a satellite of junk.
   * Deterministic by seed; stays `margin` metres from the edges. o: {tower:true|false, bulkhead, n}
   */
