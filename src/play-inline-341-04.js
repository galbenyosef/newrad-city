// play-inline-341 04 — boxd
// Lines 680-998 of readable/play-inline-341.pretty.js (statement-aligned).
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
