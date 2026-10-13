// play-inline-132 03 — opts
// Lines 334-608 of readable/play-inline-132.pretty.js (statement-aligned).
  K.polyWindows = function (b, poly, opts) {
    let A = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const r = LB.rng(opts.seed || 1);
    for (let i = 0; i < poly.length; i++) {
      if (opts.skipEdge && opts.skipEdge(i)) continue;
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      const dx = q[0] - p[0],
        dz = q[1] - p[1],
        len = Math.hypot(dx, dz);
      if (len < (opts.minEdge || 3)) continue;
      const ux = dx / len,
        uz = dz / len;
      const nx = uz * sgn,
        nz = -ux * sgn; // outward normal
      const ry = Math.atan2(nx, nz); // quad facing the normal
      const n = Math.max(
        1,
        Math.floor((len - (opts.margin || 1.5) * 2) / opts.spacing),
      );
      const start = (len - (n - 1) * opts.spacing) / 2;
      for (let f = 0; f < opts.floors; f++) {
        const y = opts.y0 + f * opts.floorH;
        for (let k = 0; k < n; k++) {
          const t = start + k * opts.spacing;
          const px = p[0] + ux * t + nx * (opts.inset || 0.03),
            pz = p[1] + uz * t + nz * (opts.inset || 0.03);
          const roll = r();
          let key = "glass_dark";
          if (roll < (opts.broken === undefined ? 0.25 : opts.broken))
            key = "glass_broken";
          else if (roll < (opts.broken || 0.25) + (opts.boarded || 0.05))
            key = "planks";
          else if (opts.lit && roll > 1 - opts.lit) key = "window_lit";
          b.quad(key, px, y + opts.h / 2, pz, opts.w, opts.h, {
            ry,
            uv: "box",
            grime: 0.1,
            noAO: true,
          });
          if (opts.sill !== false && opts.frameKey)
            b.box(
              opts.frameKey,
              px + nx * 0.1,
              y - 0.12,
              pz + nz * 0.1,
              opts.w + 0.25,
              0.12,
              0.22,
              { ry, seg: false, grime: 0.3 },
            );
          if (opts.lintel && opts.frameKey)
            b.box(
              opts.frameKey,
              px + nx * 0.08,
              y + opts.h,
              pz + nz * 0.08,
              opts.w + 0.25,
              0.2,
              0.16,
              { ry, seg: false, grime: 0.3 },
            );
        }
      }
      if (opts.piers) {
        const pd = opts.pierDepth || 0.35;
        for (let k = 0; k <= n; k++) {
          const t = start + (k - 0.5) * opts.spacing;
          const px = p[0] + ux * t + (nx * pd) / 2,
            pz = p[1] + uz * t + (nz * pd) / 2;
          b.box(
            opts.piers,
            px,
            opts.y0 - 0.5,
            pz,
            opts.pierW || 0.55,
            opts.floors * opts.floorH + 0.5,
            pd,
            { ry, grime: 0.5, segLen: 6 },
          );
        }
      }
    }
  };
  /**
   * Neo-Gothic skyscraper elevation (Woolworth / Cass Gilbert) on every non-skipped edge of a polygon: projecting
   * primary PIERS that run unbroken from their start to y1, slim MULLIONS splitting each bay into 2..n windows,
   * a recessed darker SPANDREL strip behind the glass (the vertical-strip read of the real building), a sill ledge
   * per floor, and every `band` floors (and on the top floor) a TRACERY storey of pointed lancets under a belt course
   * that stops short of the piers' face (so the piers stay unbroken). Everything merges into the batch (0 draw calls).
   * opts: {y0, y1, floorH 2.7, pair 4.4 (pier spacing), pierW 0.75, pierD 0.6, mullW, mullD, band 8, margin 1.2,
   *        key 'terracotta', spandrel (tint), broken, boarded, lit, seed, skipEdge(i),
   *        piersAt(i, len) → [t…] (custom pier positions along the edge), pierFrom(i, k, t) → y, bayFrom(i, k) → y}
   * Returns [{x, z, nx, nz, ry}] of the primary piers' outer faces (for parapet pinnacles).
   */
  K.gothicFacade = function (b, poly, opts) {
    const key = opts.key || "terracotta",
      fh = opts.floorH || 2.7,
      pair = opts.pair || 4.4;
    const PW = opts.pierW || 0.75,
      PD = opts.pierD || 0.6,
      MW = opts.mullW || 0.26,
      MD = opts.mullD || 0.24;
    const band = opts.band || 8,
      spC = opts.spandrel === undefined ? 0x8f836c : opts.spandrel;
    const y0 = opts.y0,
      y1 = opts.y1,
      nFl = Math.max(1, Math.floor((y1 - y0) / fh));
    const r = LB.rng(opts.seed || 3),
      tops = [];
    const brk = opts.broken === undefined ? 0.22 : opts.broken,
      brd = opts.boarded || 0.04,
      lit = opts.lit || 0;
    let A = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      A += p[0] * q[1] - q[0] * p[1];
    }
    const sgn = A > 0 ? 1 : -1;
    const pick = () => {
      const v = r();
      return v < brk
        ? "glass_broken"
        : v < brk + brd
          ? "planks"
          : lit && v > 1 - lit
            ? "window_lit"
            : "glass_dark";
    };
    const lancetGeo = (w, h) => {
      const sh = new THREE.Shape(),
        sp = h - w * 0.85;
      sh.moveTo(-w / 2, 0);
      sh.lineTo(w / 2, 0);
      sh.lineTo(w / 2, sp);
      sh.quadraticCurveTo(w / 2, h - w * 0.12, 0, h);
      sh.quadraticCurveTo(-w / 2, h - w * 0.12, -w / 2, sp);
      sh.closePath();
      return new THREE.ShapeGeometry(sh, 3);
    };
    for (let i = 0; i < poly.length; i++) {
      if (opts.skipEdge && opts.skipEdge(i)) continue;
      const p = poly[i],
        q = poly[(i + 1) % poly.length],
        dx = q[0] - p[0],
        dz = q[1] - p[1],
        len = Math.hypot(dx, dz);
      if (len < 2.5) continue;
      const ux = dx / len,
        uz = dz / len,
        nx = uz * sgn,
        nz = -ux * sgn,
        ry = Math.atan2(nx, nz);
      const at = (t, off) => [
        p[0] + ux * t + nx * off,
        p[1] + uz * t + nz * off,
      ];
      let ts = opts.piersAt ? opts.piersAt(i, len) : null;
      if (!ts) {
        const m = opts.margin === undefined ? 1.2 : opts.margin;
        const nP = Math.max(1, Math.floor((len - 2 * m - PW) / pair)),
          st = (len - nP * pair) / 2;
        ts = [];
        for (let k = 0; k <= nP; k++) ts.push(st + k * pair);
      }
      // primary piers (+ a chamfered cap step every band so they read as stacked terracotta shafts)
      for (let k = 0; k < ts.length; k++) {
        const py0 = opts.pierFrom ? opts.pierFrom(i, k, ts[k]) : y0;
        if (py0 >= y1 - 1) continue;
        const [x, z] = at(ts[k], PD / 2);
        b.box(key, x, py0 - 0.3, z, PW, y1 - py0 + 0.3, PD, {
          ry,
          segLen: 7,
          grime: 0.45,
        });
        const [x2, z2] = at(ts[k], PD + 0.06);
        b.box(key, x2, py0 - 0.3, z2, PW * 0.42, y1 - py0 + 0.3, 0.12, {
          ry,
          seg: false,
          grime: 0.3,
        }); // bead / roll moulding
        const [tx, tz] = at(ts[k], PD);
        tops.push({ x: tx, z: tz, nx, nz, ry });
      }
      // bays between consecutive piers
      for (let k = 0; k < ts.length - 1; k++) {
        const ta = ts[k] + PW / 2,
          tb = ts[k + 1] - PW / 2,
          iw = tb - ta;
        if (iw < 0.8) continue;
        const tc = (ta + tb) / 2,
          by0 = Math.max(y0, opts.bayFrom ? opts.bayFrom(i, k) : y0),
          bh = y1 - by0;
        if (bh < fh) continue;
        const nW = Math.max(1, Math.round(iw / 1.75)),
          ww = (iw - (nW - 1) * MW - 0.34) / nW;
        const [sx, sz] = at(tc, 0.03);
        b.quad(key, sx, by0 + bh / 2, sz, iw + 0.02, bh, {
          ry,
          uv: "box",
          c: spC,
          grime: 0.55,
          hSeg: Math.max(1, Math.round(bh / 6)),
          noAO: false,
        });
        for (let w = 1; w < nW; w++) {
          const [mx, mz] = at(ta + 0.17 + w * (ww + MW) - MW / 2, MD / 2);
          b.box(key, mx, by0, mz, MW, bh, MD, { ry, segLen: 9, grime: 0.35 });
        }
        const f0 = Math.ceil((by0 - y0) / fh - 1e-3);
        for (let f = f0; f < nFl; f++) {
          const fy = y0 + f * fh,
            tracery = f % band === band - 1 || f === nFl - 1;
          const [lx, lz] = at(tc, 0.14);
          b.box(key, lx, fy, lz, iw, 0.1, 0.22, { ry, seg: false, grime: 0.5 }); // sill ledge
          for (let w = 0; w < nW; w++) {
            const [wx, wz] = at(ta + 0.17 + ww / 2 + w * (ww + MW), 0.06),
              k2 = pick();
            if (tracery)
              b.add(k2, lancetGeo(ww, fh - 0.55), {
                m: LB.m4(wx, fy + 0.3, wz, ry),
                uv: "box",
                grime: 0.1,
                noAO: true,
              });
            else
              b.quad(k2, wx, fy + 0.42 + (fh - 0.9) / 2, wz, ww, fh - 0.9, {
                ry,
                uv: "box",
                grime: 0.1,
                noAO: true,
              });
          }
          if (tracery) {
            // belt course over the tracery storey, stopping short of the pier face
            const [bx, bz] = at(tc, 0.2);
            b.box(key, bx, fy + fh - 0.2, bz, iw + 0.02, 0.42, 0.4, {
              ry,
              seg: false,
              grime: 0.4,
            });
          }
        }
      }
    }
    return tops;
  };
  /** Wall colliders along a closed polygon (thickness t). */
  K.polyColliders = function (poly, y0, y1, t, opts) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i],
        q = poly[(i + 1) % poly.length];
      LB.colWall(
        p[0],
        p[1],
        q[0],
        q[1],
        t || 1,
        y0,
        y1,
        Object.assign({ walkable: false }, opts || {}),
      );
    }
  };
  /**
   * Natural rock cliff wrapped around a closed polygon: a noise-displaced skirt from y0 (flared out
   * at the bottom) up to y1 with a ragged top lip. opts: {amp, flare, step, seed}.
   */
