// play-inline-92 04 — the
// Lines 897-1921 of readable/play-inline-92.pretty.js (statement-aligned).
  function unionSquare() {
    const L = G.LAYOUT,
      S = L.getSite && L.getSite("union_square");
    if (!S) return;
    const r = M.rng("union_square");
    const o = { x0: S.x0, x1: S.x1, z0: S.z0, z1: S.z1 };
    const cx = (o.x0 + o.x1) / 2,
      y = 0;
    // park area (between the north market plaza and the south plaza); centre = the flagpole
    const P = { x0: o.x0 + 4, x1: o.x1 - 4, z0: o.z0 + 16, z1: o.z1 - 22 };
    const pcz = (P.z0 + P.z1) / 2,
      pcx = cx;
    // paving over the whole square with a granite kerb band
    const pv = M.buf("sidewalk", cx, pcz);
    M.quad(
      pv,
      [o.x0, y + 0.04, o.z1],
      [o.x1, y + 0.04, o.z1],
      [o.x1, y + 0.04, o.z0],
      [o.x0, y + 0.04, o.z0],
      [0, 1, 0],
      [
        o.x0 / 3,
        o.z1 / 3,
        o.x1 / 3,
        o.z1 / 3,
        o.x1 / 3,
        o.z0 / 3,
        o.x0 / 3,
        o.z0 / 3,
      ],
      [0.8, 0.78, 0.72],
    );
    const gr = M.buf("granite", cx, pcz);
    // ---- lawns: the park rect cut by both diagonals and the N-S axis path, apexes cut by the central oval
    const H = 2.2; // path half width
    const rect = [
      [P.x0, P.z0],
      [P.x1, P.z0],
      [P.x1, P.z1],
      [P.x0, P.z1],
    ];
    const cen = (p) => [
      p.reduce((a, q) => a + q[0], 0) / p.length,
      p.reduce((a, q) => a + q[1], 0) / p.length,
    ];
    /** keep the part of polygon p where a*x + b*z + c >= 0 */
    const clipF = (p, a, b, c) => {
      const out = [];
      for (let i = 0; i < p.length; i++) {
        const P1 = p[i],
          P2 = p[(i + 1) % p.length],
          f1 = a * P1[0] + b * P1[1] + c,
          f2 = a * P2[0] + b * P2[1] + c;
        if (f1 >= 0) out.push(P1);
        if (f1 >= 0 !== f2 >= 0) {
          const t = f1 / (f1 - f2);
          out.push([P1[0] + (P2[0] - P1[0]) * t, P1[1] + (P2[1] - P1[1]) * t]);
        }
      }
      return out;
    };
    // diagonal lines through the centre (NW→SE and SW→NE), unit normals
    const dg = [
      [P.x1 - P.x0, P.z1 - P.z0],
      [P.x1 - P.x0, P.z0 - P.z1],
    ].map((d) => {
      const l = Math.hypot(d[0], d[1]);
      return [-d[1] / l, d[0] / l];
    });
    const fD = (k, x, z) => dg[k][0] * (x - pcx) + dg[k][1] * (z - pcz);
    const wedgeAt = (mx, mz) => {
      let p = rect;
      for (let k = 0; k < 2 && p.length >= 3; k++) {
        const sg = Math.sign(fD(k, mx, mz)) || 1;
        p = clipF(
          p,
          sg * dg[k][0],
          sg * dg[k][1],
          -sg * (dg[k][0] * pcx + dg[k][1] * pcz) - H,
        );
      }
      return p;
    };
    const lawns = [];
    const APEX = 9.5;
    const addLawn = (p) => {
      if (p.length >= 3 && Math.abs(M.polyArea(p)) > 20)
        lawns.push(M.polyArea(p) > 0 ? p : p.slice().reverse());
    };
    // north & south wedges, each split by the N-S axis path; the west wedge whole; the east wedge = the raider camp
    const wn = clipF(wedgeAt(pcx, P.z0), 0, -1, pcz - APEX),
      ws = clipF(wedgeAt(pcx, P.z1), 0, 1, -(pcz + APEX));
    for (const w of [wn, ws])
      if (w.length >= 3) {
        addLawn(clipF(w, -1, 0, pcx - H));
        addLawn(clipF(w, 1, 0, -(pcx + H)));
      }
    addLawn(clipF(wedgeAt(P.x0, pcz), -1, 0, pcx - APEX));
    const campLawn = (() => {
      const p = clipF(wedgeAt(P.x1, pcz), 1, 0, -(pcx + APEX));
      return p.length >= 3 ? p : null;
    })();
    const lb = M.buf("grass_dead", cx, pcz);
    for (const q of lawns) {
      const qq = M.polyArea(q) > 0 ? q : q.slice().reverse();
      M.polySides(gr, qq, y, y + 0.2, { s: 2, c: [0.62, 0.6, 0.56] });
      M.poly(lb, qq, y + 0.2, { s: 4, c: [0.7, 0.64, 0.46], convex: true });
      polyFence(M.insetPoly(qq, 0.5), y + 0.2, "us", false, 3);
      // dead London planes & shrubs inside
      const bb = M.polyBBox(qq);
      for (let i = 0, n = 0; i < 20 && n < 3; i++) {
        const tx = r.range(bb.x0 + 2, bb.x1 - 2),
          tz = r.range(bb.z0 + 2, bb.z1 - 2);
        if (!M.inPoly(tx, tz, M.insetPoly(qq, 2))) continue;
        M.placeTree(
          tx,
          tz,
          n === 2 ? r.pick(M.TREE_KINDS.shrubs) : r.pick(M.TREE_KINDS.standing),
          r() * 6,
          r.range(1.0, 1.4),
        );
        n++;
      }
      for (let i = 0; i < 4; i++) {
        const tx = r.range(bb.x0, bb.x1),
          tz = r.range(bb.z0, bb.z1);
        if (M.inPoly(tx, tz, qq))
          M.decal(
            M.buf("my/markings", tx, tz, "fine"),
            tx,
            y + 0.215,
            tz,
            r.range(2, 4),
            r.range(2, 4),
            r() * 6,
            r.pick([M.MARK.LEAVES, M.MARK.DIRT]),
          );
      }
    }
    // ---- central oval: granite ring & the Independence Flagpole (tattered flag), benches around it
    M.cyl(gr, pcx, y, pcz, 7.2, 7.2, 0.06, 36, {
      capTop: true,
      c: [0.66, 0.64, 0.6],
    });
    M.cyl(gr, pcx, y, pcz, 2.6, 2.9, 1.1, 16, {
      capTop: true,
      c: [0.72, 0.7, 0.66],
    });
    M.cyl(
      M.buf("metal_painted", pcx, pcz, "detail"),
      pcx,
      y + 1.1,
      pcz,
      0.16,
      0.09,
      16,
      8,
      { c: [0.3, 0.3, 0.28] },
    );
    {
      const fb = M.buf("fabric", pcx, pcz, "detail"),
        fc = [0.55, 0.22, 0.2];
      M.quad(
        fb,
        [pcx, y + 14.6, pcz],
        [pcx + 3.2, y + 14.3, pcz + 0.4],
        [pcx + 2.4, y + 12.6, pcz + 0.6],
        [pcx, y + 12.8, pcz],
        [0, 0, 1],
        [0, 0, 1, 0, 1, 1, 0, 1],
        fc,
        fc,
      );
      M.quad(
        fb,
        [pcx + 3.2, y + 14.3, pcz + 0.4],
        [pcx, y + 14.6, pcz],
        [pcx, y + 12.8, pcz],
        [pcx + 2.4, y + 12.6, pcz + 0.6],
        [0, 0, -1],
        [0, 0, 1, 0, 1, 1, 0, 1],
        fc,
        fc,
      );
    }
    M.ocol(pcx, pcz, 5.6, 5.6, 0, y + 1.1, 0, {
      tag: "monument",
      surface: "concrete",
    });
    M.box3(pcx - 0.2, 0, pcz - 0.2, pcx + 0.2, 17, pcz + 0.2, {
      tag: "monument",
      surface: "metal",
    });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2 + 0.26;
      M.parkBench(
        pcx + Math.cos(a) * 5.4,
        pcz + Math.sin(a) * 5.4,
        -a + Math.PI / 2,
        r() < 0.3,
      );
    }
    // ---- Lincoln (north lawn edge, on the axis path, facing south)
    {
      const lx = pcx - 4.5,
        lz = P.z0 + 3.5;
      const gb = M.buf("granite", lx, lz),
        bz = M.buf("metal_painted", lx, lz);
      M.box(gb, lx - 1.2, y, lz - 1.2, lx + 1.2, y + 2.3, lz + 1.2, {
        s: 2,
        c: [0.7, 0.68, 0.64],
      });
      M.cyl(bz, lx, y + 2.3, lz, 0.42, 0.34, 1.6, 10, {
        c: [0.32, 0.44, 0.38],
      });
      M.cyl(bz, lx, y + 3.9, lz, 0.2, 0.18, 0.4, 8, {
        c: [0.32, 0.44, 0.38],
        capTop: true,
      });
      M.ocol(lx, lz, 2.4, 2.4, 0, y + 4.3, 0, { tag: "monument" });
    }
    // ---- the pavilion (north end of the park): granite podium, cast-iron colonnade, canopy half collapsed,
    //      a raider lookout (plank deck, sandbags, a rusted searchlight) on the surviving half
    {
      const px = pcx,
        pz = P.z0 - 1,
        w = 16,
        d = 7;
      const pb = M.buf("stone_limestone", px, pz),
        ib = M.buf("metal_painted", px, pz),
        cc = [0.24, 0.3, 0.27];
      M.box(pb, px - w / 2, y, pz - d / 2, px + w / 2, y + 0.6, pz + d / 2, {
        s: 2,
        c: [0.74, 0.72, 0.67],
      });
      for (let k = 0; k < 3; k++)
        M.box(
          pb,
          px - 2.5,
          y + k * 0.2,
          pz + d / 2 + 0.9 - k * 0.3,
          px + 2.5,
          y + 0.2 + k * 0.2,
          pz + d / 2 + 1.2 - k * 0.3,
          { s: 2, c: [0.72, 0.7, 0.66] },
        );
      M.ocol(px, pz, w, d, 0, y + 0.6, 0, {
        tag: "pavilion",
        surface: "concrete",
        walkable: true,
      });
      const cols = [];
      for (let k = 0; k < 6; k++)
        for (const sd of [-1, 1])
          cols.push([
            px - w / 2 + 0.8 + (k * (w - 1.6)) / 5,
            pz + sd * (d / 2 - 0.6),
          ]);
      for (const [x, z] of cols) {
        const fallen = x > px + 3 && z > pz; // the SE columns buckled
        if (fallen) {
          M.beam(ib, x, y + 0.6, z, x + 1.6, y + 0.9, z + 2.8, 0.22, 0.22, {
            c: cc,
          });
          continue;
        }
        M.cyl(ib, x, y + 0.6, z, 0.18, 0.14, 4.2, 8, { c: cc });
        M.cyl(ib, x, y + 4.6, z, 0.14, 0.3, 0.35, 8, { c: cc });
        M.box3(x - 0.2, y, z - 0.2, x + 0.2, y + 4.9, z + 0.2, {
          tag: "pavilion",
          surface: "metal",
        });
      }
      // canopy: west half flat, east half tilted down onto the buckled columns
      M.box(
        ib,
        px - w / 2 - 0.6,
        y + 4.95,
        pz - d / 2 - 0.6,
        px + 1,
        y + 5.3,
        pz + d / 2 + 0.6,
        { s: 2, c: [0.28, 0.33, 0.3] },
      );
      M.obox(
        ib,
        px + w / 4 + 0.6,
        y + 3.5,
        pz + 0.4,
        w / 2 + 0.8,
        0.3,
        d + 1.2,
        0,
        { roll: 0.32, s: 2, c: [0.26, 0.3, 0.28] },
      );
      M.box3(
        px - w / 2 - 0.6,
        y + 4.95,
        pz - d / 2 - 0.6,
        px + 1,
        y + 5.3,
        pz + d / 2 + 0.6,
        { tag: "pavilion", surface: "metal", walkable: true },
      );
      // lookout on the roof: plank deck, sandbag ring, searchlight, a ladder of planks up the west end
      const wb = M.buf("wood_planks", px, pz, "detail"),
        sb = M.buf("fabric", px, pz, "detail");
      M.box(wb, px - 6.5, y + 5.3, pz - 2.6, px - 1, y + 5.42, pz + 2.6, {
        s: 1,
        c: [0.6, 0.5, 0.4],
      });
      for (let k = 0; k < 9; k++) {
        const a = (k / 9) * Math.PI * 1.6 + 0.5,
          sx = px - 3.6 + Math.cos(a) * 2.3,
          sz = pz + Math.sin(a) * 2.1;
        M.pipe(
          sb,
          sx - Math.sin(a) * 0.4,
          y + 5.6,
          sz + Math.cos(a) * 0.4,
          sx + Math.sin(a) * 0.4,
          y + 5.6,
          sz - Math.cos(a) * 0.4,
          0.22,
          6,
          { c: [0.52, 0.48, 0.36] },
        );
      }
      const lb2 = M.buf("rust", px, pz, "detail");
      M.cyl(lb2, px - 3.6, y + 5.42, pz, 0.12, 0.12, 1.0, 6, {
        c: [0.4, 0.34, 0.3],
      });
      M.obox(lb2, px - 3.6, y + 6.6, pz - 0.2, 0.9, 0.8, 0.9, 0.3, {
        pitch: 0.3,
        c: [0.42, 0.36, 0.3],
      });
      for (let k = 0; k < 7; k++)
        M.box(
          wb,
          px - w / 2 - 1.3,
          y + 0.5 + k * 0.7,
          pz - 0.6,
          px - w / 2 - 0.9,
          y + 0.6 + k * 0.7,
          pz + 0.6,
          { s: 1, c: [0.55, 0.45, 0.36] },
        );
      for (const dz of [-0.6, 0.6])
        M.beam(
          wb,
          px - w / 2 - 1.1,
          y,
          pz + dz,
          px - w / 2 - 1.1,
          y + 5.4,
          pz + dz,
          0.1,
          0.1,
          { c: [0.5, 0.42, 0.34] },
        );
      // boarded infill on the north side (the raiders' store room)
      for (let k = 0; k < 3; k++)
        M.box(
          wb,
          px - w / 2 + 0.9 + k * 2.6,
          y + 0.6,
          pz - d / 2 + 0.45,
          px - w / 2 + 3.3 + k * 2.6,
          y + 3.6,
          pz - d / 2 + 0.6,
          { s: 1, c: [0.5, 0.42, 0.34] },
        );
      M.box3(
        px - w / 2 + 0.9,
        y,
        pz - d / 2 + 0.4,
        px - w / 2 + 8.6,
        y + 3.6,
        pz - d / 2 + 0.65,
        { tag: "wall", surface: "wood" },
      );
    }
    // ---- Greenmarket (north plaza): two rows of collapsed stalls, torn striped awnings, crates, a toppled table
    {
      const fb = M.buf("fabric", cx, o.z0 + 6),
        wb = M.buf("wood_planks", cx, o.z0 + 6, "detail"),
        mb = M.buf("metal_painted", cx, o.z0 + 6, "detail");
      const awn = [
        [0.62, 0.24, 0.2],
        [0.3, 0.42, 0.3],
        [0.7, 0.62, 0.42],
        [0.32, 0.36, 0.5],
      ];
      let n = 0;
      for (const zr of [o.z0 + 4.5, o.z0 + 11])
        for (let x = o.x0 + 6; x < o.x1 - 5; x += 8.5) {
          if (Math.abs(x - cx) < 4) continue; // keep the axis walk open
          const k = n++,
            collapsed = k % 3 === 1,
            c = awn[k % awn.length],
            face = zr < o.z0 + 8 ? 1 : -1;
          const w = 4.2,
            d = 2.6,
            h = 2.3;
          // frame posts
          for (const [dx, dz] of [
            [-w / 2, -d / 2],
            [w / 2, -d / 2],
            [-w / 2, d / 2],
            [w / 2, d / 2],
          ]) {
            if (collapsed && dx > 0) continue;
            M.cyl(
              mb,
              x + dx,
              y,
              zr + dz,
              0.05,
              0.05,
              h + (dz * face > 0 ? 0 : 0.4),
              5,
              { c: [0.3, 0.3, 0.28] },
            );
          }
          // awning (sagging / slumped when collapsed) — both faces
          const y0 = y + h + 0.4,
            y1 = y + h,
            zA = zr - (d / 2) * face,
            zB = zr + (d / 2) * face;
          const xs = collapsed
            ? [x - w / 2, x + w / 2 - 0.3]
            : [x - w / 2, x + w / 2];
          const yR = collapsed ? y + 0.5 : y1;
          M.quad(
            fb,
            [xs[0], y0, zA],
            [xs[1], collapsed ? y + 0.9 : y0, zA],
            [xs[1], yR, zB + face * 0.3],
            [xs[0], y1, zB + face * 0.3],
            [0, 1, 0],
            [0, 0, 1, 0, 1, 1, 0, 1],
            c,
            M.mulc(c, 0.8),
          );
          M.quad(
            fb,
            [xs[1], collapsed ? y + 0.9 : y0, zA],
            [xs[0], y0, zA],
            [xs[0], y1, zB + face * 0.3],
            [xs[1], yR, zB + face * 0.3],
            [0, -1, 0],
            [0, 0, 1, 0, 1, 1, 0, 1],
            M.mulc(c, 0.6),
            M.mulc(c, 0.5),
          );
          // counter + crates
          if (!collapsed)
            M.box(
              wb,
              x - w / 2 + 0.2,
              y + 0.8,
              zr + face * (d / 2 - 0.5),
              x + w / 2 - 0.2,
              y + 0.9,
              zr + face * (d / 2 - 0.1),
              { s: 1, c: [0.55, 0.45, 0.35] },
            );
          else
            M.obox(wb, x + 0.5, y + 0.45, zr, 3.2, 0.08, 0.9, 0.2, {
              roll: 1.2,
              s: 1,
              c: [0.5, 0.42, 0.33],
            });
          for (let i = 0; i < 3; i++) {
            if (r() < 0.35) continue;
            const bx = x + r.range(-w / 2, w / 2),
              bz = zr - face * r.range(0.3, 1.2),
              sz = r.range(0.45, 0.65);
            M.obox(
              wb,
              bx,
              y + sz / 2 + (i === 2 ? sz : 0),
              bz,
              sz * 1.3,
              sz,
              sz,
              r() * 0.6,
              { s: 1, c: [0.58, 0.47, 0.33] },
            );
          }
          M.ocol(x, zr, w + 0.2, d + 0.2, 0, y + 1.0, 0, {
            tag: "stall",
            surface: "wood",
          });
        }
      for (let i = 0; i < 14; i++)
        M.decal(
          M.buf("my/markings", cx, o.z0 + 8, "fine"),
          r.range(o.x0 + 3, o.x1 - 3),
          y + 0.05,
          r.range(o.z0 + 2, o.z0 + 14),
          r.range(1.5, 3.5),
          r.range(1.5, 3.5),
          r() * 6,
          r.pick([M.MARK.LITTER, M.MARK.STAIN, M.MARK.DIRT, M.MARK.LEAVES]),
        );
    }
    // ---- raider camp in the east wedge: dirt ground, scrap-sheet walls & two car hulks as a barricade ring,
    //      lean-to tents, mattresses, burn barrels, a caged skeleton, a spike with a warning sign
    if (campLawn) {
      const q0 =
        M.polyArea(campLawn) > 0 ? campLawn : campLawn.slice().reverse();
      const q = M.insetPoly(q0, 0.2);
      const c = cen(q),
        bb = M.polyBBox(q);
      M.poly(M.buf("dirt", c[0], c[1]), q, y + 0.06, {
        s: 3,
        c: [0.52, 0.45, 0.35],
        convex: true,
      });
      const cor = M.buf("corrugated", c[0], c[1]),
        wb = M.buf("wood_planks", c[0], c[1], "detail"),
        rb = M.buf("rust", c[0], c[1], "detail");
      // scrap walls along the wedge edges (gap at the apex = the camp gate)
      for (let i = 0; i < q.length; i++) {
        const a = q[i],
          d = q[(i + 1) % q.length],
          len = Math.hypot(d[0] - a[0], d[1] - a[1]);
        if (len < 3) continue;
        const ux = (d[0] - a[0]) / len,
          uz = (d[1] - a[1]) / len;
        const isOuter = Math.abs(ux) < 0.2; // the east side (on the avenue) is the solid back wall
        for (let t = 0.3; t < len - 1.2; t += 2.1) {
          // gates: the middle of every edge — the diagonal ones into the square, the outer one onto 4th Ave (Park Ave S)
          // so the camp reads as a settlement with entrances, not a blank wall along the avenue
          const mid = t + 1.05;
          if (Math.abs(mid - len / 2) < 2.2) continue;
          const x0 = a[0] + ux * t,
            z0 = a[1] + uz * t,
            x1 = a[0] + ux * (t + 2.1),
            z1 = a[1] + uz * (t + 2.1);
          const hh = r.range(1.9, 2.6),
            lean = r.range(-0.12, 0.12);
          const nx = uz * lean,
            nz = -ux * lean;
          M.quad(
            cor,
            [x0, y, z0],
            [x1, y, z1],
            [x1 + nx, y + hh, z1 + nz],
            [x0 + nx, y + hh * r.range(0.85, 1), z0 + nz],
            [uz, 0, -ux],
            [0, 0, 1, 0, 1, 1.4, 0, 1.4],
            [0.55, 0.42, 0.34],
            [0.62, 0.5, 0.4],
          );
          M.quad(
            cor,
            [x1, y, z1],
            [x0, y, z0],
            [x0 + nx, y + hh * 0.95, z0 + nz],
            [x1 + nx, y + hh, z1 + nz],
            [-uz, 0, ux],
            [0, 0, 1, 0, 1, 1.4, 0, 1.4],
            [0.45, 0.35, 0.3],
            [0.52, 0.42, 0.36],
          );
          M.beam(wb, x0, y, z0, x0 + nx, y + hh + 0.2, z0 + nz, 0.1, 0.1, {
            c: [0.45, 0.38, 0.3],
          });
          M.ocol(
            (x0 + x1) / 2,
            (z0 + z1) / 2,
            2.1,
            0.2,
            0,
            y + hh,
            Math.atan2(-uz, ux),
            { tag: "wall", surface: "metal" },
          );
        }
      }
      // the avenue gate: two timber posts, a lintel with a hand-painted sign plank, one scrap leaf swung open
      for (let i = 0; i < q.length; i++) {
        const a = q[i],
          d = q[(i + 1) % q.length],
          len = Math.hypot(d[0] - a[0], d[1] - a[1]);
        const ux = (d[0] - a[0]) / len,
          uz = (d[1] - a[1]) / len;
        if (len < 6 || Math.abs(ux) >= 0.2) continue;
        const gx = a[0] + (ux * len) / 2,
          gz = a[1] + (uz * len) / 2;
        for (const sgn of [-1, 1]) {
          const px = gx + ux * sgn * 2.1,
            pz = gz + uz * sgn * 2.1;
          M.beam(wb, px, y, pz, px, y + 3.2, pz, 0.18, 0.18, {
            c: [0.4, 0.33, 0.26],
          });
          M.ocol(px, pz, 0.3, 0.3, 0, y + 3.2, 0, {
            tag: "post",
            surface: "wood",
          });
        }
        M.beam(
          wb,
          gx - ux * 2.4,
          y + 3.1,
          gz - uz * 2.4,
          gx + ux * 2.4,
          y + 3.1,
          gz + uz * 2.4,
          0.16,
          0.22,
          { c: [0.4, 0.33, 0.26] },
        );
        M.obox(
          wb,
          gx + uz * 0.12,
          y + 2.6,
          gz - ux * 0.12,
          3.2,
          0.55,
          0.06,
          Math.atan2(-uz, ux),
          { s: 1, c: [0.62, 0.52, 0.4] },
        );
        // open leaf: hinged on the north post, swung out towards the avenue
        const hx = gx - ux * 2.0,
          hz = gz - uz * 2.0,
          oa = 1.1,
          lx = hx + (ux * Math.cos(oa) + uz * Math.sin(oa)) * 1.9,
          lz = hz + (uz * Math.cos(oa) - ux * Math.sin(oa)) * 1.9;
        M.quad(
          cor,
          [hx, y + 0.1, hz],
          [lx, y + 0.1, lz],
          [lx, y + 2.2, lz],
          [hx, y + 2.2, hz],
          [1, 0, 0],
          [0, 0, 1, 0, 1, 1.4, 0, 1.4],
          [0.55, 0.42, 0.34],
          [0.62, 0.5, 0.4],
        );
        M.quad(
          cor,
          [lx, y + 0.1, lz],
          [hx, y + 0.1, hz],
          [hx, y + 2.2, hz],
          [lx, y + 2.2, lz],
          [-1, 0, 0],
          [0, 0, 1, 0, 1, 1.4, 0, 1.4],
          [0.45, 0.35, 0.3],
          [0.52, 0.42, 0.36],
        );
        M.ocol(
          (hx + lx) / 2,
          (hz + lz) / 2,
          1.9,
          0.15,
          0,
          y + 2.2,
          Math.atan2(-(lz - hz), lx - hx),
          { tag: "wall", surface: "metal" },
        );
      }
      if (M.carHulk) {
        M.carHulk(bb.x1 - 2.2, 0, c[1] - 7, 0.1 + Math.PI / 2, r, {
          burnt: true,
        });
        /* clear of the avenue gate */ M.carHulk(
          c[0] + 1.5,
          0,
          bb.z1 - 3.2,
          2.9,
          r,
          { burnt: true, roll: Math.PI / 2 },
        );
      }
      // tents: tarp lean-tos against the back wall
      const fb = M.buf("fabric", c[0], c[1], "detail");
      for (const [tx, tz, tc] of [
        [bb.x1 - 3.2, c[1] + 6.5, [0.42, 0.44, 0.32]],
        [c[0] + 3, bb.z0 + 4.5, [0.5, 0.36, 0.26]],
      ]) {
        M.quad(
          fb,
          [tx - 1.6, y + 2.0, tz - 1.4],
          [tx - 1.6, y + 2.0, tz + 1.4],
          [tx + 1.2, y + 0.05, tz + 1.5],
          [tx + 1.2, y + 0.05, tz - 1.5],
          [-0.6, 0.8, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          tc,
          M.mulc(tc, 0.75),
        );
        M.quad(
          fb,
          [tx - 1.6, y + 2.0, tz + 1.4],
          [tx - 1.6, y + 2.0, tz - 1.4],
          [tx + 1.2, y + 0.05, tz - 1.5],
          [tx + 1.2, y + 0.05, tz + 1.5],
          [0.6, -0.8, 0],
          [0, 0, 1, 0, 1, 1, 0, 1],
          M.mulc(tc, 0.5),
          M.mulc(tc, 0.4),
        );
        M.beam(
          wb,
          tx - 1.6,
          y,
          tz - 1.4,
          tx - 1.6,
          y + 2.05,
          tz - 1.4,
          0.08,
          0.08,
          { c: [0.45, 0.38, 0.3] },
        );
        M.beam(
          wb,
          tx - 1.6,
          y,
          tz + 1.4,
          tx - 1.6,
          y + 2.05,
          tz + 1.4,
          0.08,
          0.08,
          { c: [0.45, 0.38, 0.3] },
        );
        M.box(fb, tx - 1.3, y + 0.06, tz - 0.9, tx + 0.6, y + 0.24, tz + 0.9, {
          s: 1,
          c: [0.55, 0.5, 0.42],
        }); // mattress
        M.ocol(tx - 0.2, tz, 2.8, 3.0, 0, y + 1.2, 0, {
          tag: "tent",
          surface: "fabric",
        });
      }
      // burn barrels (charred rims, soot inside) + a crude table of planks on crates
      for (const [bx, bz] of [
        [c[0] - 1, c[1]],
        [c[0] + 2.5, c[1] - 4],
      ]) {
        M.cyl(rb, bx, y, bz, 0.34, 0.32, 0.95, 10, { c: [0.42, 0.3, 0.24] });
        M.cyl(
          M.buf("rubble", bx, bz, "detail"),
          bx,
          y + 0.9,
          bz,
          0.3,
          0.3,
          0.02,
          10,
          { capTop: true, c: [0.12, 0.1, 0.09] },
        );
        M.ocol(bx, bz, 0.7, 0.7, 0, y + 0.95, 0, {
          tag: "barrel",
          surface: "metal",
        });
      }
      M.box(
        wb,
        c[0] + 1.2,
        y + 0.75,
        c[1] + 2,
        c[0] + 3.2,
        y + 0.82,
        c[1] + 3,
        { s: 1, c: [0.55, 0.45, 0.35] },
      );
      for (const dx of [1.4, 3.0])
        M.box(
          wb,
          c[0] + dx - 0.25,
          y,
          c[1] + 2.25,
          c[0] + dx + 0.25,
          y + 0.75,
          c[1] + 2.75,
          { s: 1, c: [0.58, 0.47, 0.33] },
        );
      M.ocol(c[0] + 2.2, c[1] + 2.5, 2.0, 1.0, 0, y + 0.82, 0, {
        tag: "table",
        surface: "wood",
      });
      // hanging cage on a gallows beam with bones inside
      {
        const gx = bb.x1 - 2,
          gz = bb.z0 + 3;
        M.beam(wb, gx, y, gz, gx, y + 4.2, gz, 0.18, 0.18, {
          c: [0.42, 0.35, 0.28],
        });
        M.beam(wb, gx, y + 4.1, gz, gx - 2.2, y + 4.1, gz, 0.14, 0.14, {
          c: [0.42, 0.35, 0.28],
        });
        M.beam(rb, gx - 2.1, y + 4.1, gz, gx - 2.1, y + 3.2, gz, 0.02, 0.02, {
          c: [0.3, 0.26, 0.22],
        });
        for (let k = 0; k < 8; k++) {
          const a = (k / 8) * Math.PI * 2;
          M.beam(
            rb,
            gx - 2.1 + Math.cos(a) * 0.45,
            y + 1.3,
            gz + Math.sin(a) * 0.45,
            gx - 2.1 + Math.cos(a) * 0.4,
            y + 3.2,
            gz + Math.sin(a) * 0.4,
            0.03,
            0.03,
            { c: [0.35, 0.28, 0.24] },
          );
        }
        M.cyl(rb, gx - 2.1, y + 1.28, gz, 0.46, 0.46, 0.05, 10, {
          capTop: true,
          c: [0.35, 0.28, 0.24],
        });
        const bn = M.buf("stone_limestone", gx, gz, "detail");
        M.cyl(bn, gx - 2.1, y + 1.33, gz, 0.18, 0.16, 0.5, 6, {
          c: [0.85, 0.82, 0.72],
        });
        M.cyl(bn, gx - 2.05, y + 1.9, gz + 0.05, 0.12, 0.12, 0.22, 6, {
          c: [0.88, 0.85, 0.76],
          capTop: true,
        });
        M.box3(gx - 0.2, 0, gz - 0.2, gx + 0.2, y + 4.2, gz + 0.2, {
          tag: "post",
          surface: "wood",
        });
      }
      M.rubblePile(c[0] - 3, c[1] + 4, 1.4, 0.6, r, { noCollide: true });
    }
    // ---- south plaza: granite seat-steps across the park's south edge (gap on the axis), Washington on horseback
    {
      const sz = P.z1 + 1.5,
        gb = M.buf("granite", cx, sz);
      for (const [xa, xb] of [
        [o.x0 + 3, cx - 5],
        [cx + 5, o.x1 - 3],
      ]) {
        for (let k = 0; k < 3; k++) {
          const z0 = sz - 1.4 + k * 0.9;
          M.box(gb, xa, y, z0 - 0.9, xb, y + 0.45 * (3 - k), z0, {
            s: 2,
            c: M.mulc([0.74, 0.72, 0.67], 0.92 + k * 0.03),
          });
        }
        M.ocol((xa + xb) / 2, sz - 1.5, xb - xa, 1.8, 0, y + 1.35, 0, {
          tag: "steps",
          surface: "concrete",
          walkable: true,
        });
        M.ocol((xa + xb) / 2, sz - 0.45, xb - xa, 0.9, 0, y + 0.9, 0, {
          tag: "steps",
          surface: "concrete",
          walkable: true,
        });
        M.ocol((xa + xb) / 2, sz + 0.45, xb - xa, 0.9, 0, y + 0.45, 0, {
          tag: "steps",
          surface: "concrete",
          walkable: true,
        });
      }
      const ex = cx,
        ez = o.z1 - 9;
      const eb = M.buf("granite", ex, ez);
      M.box(eb, ex - 3.2, y, ez - 2.2, ex + 3.2, y + 0.5, ez + 2.2, {
        s: 2,
        c: [0.7, 0.68, 0.64],
      });
      M.box(eb, ex - 2.6, y + 0.5, ez - 1.6, ex + 2.6, y + 3.6, ez + 1.6, {
        s: 2,
        c: [0.74, 0.72, 0.67],
      });
      M.box(eb, ex - 2.8, y + 3.6, ez - 1.8, ex + 2.8, y + 3.9, ez + 1.8, {
        s: 2,
        c: [0.78, 0.76, 0.7],
      });
      const hb = M.buf("metal_painted", ex, ez),
        hc = { c: [0.3, 0.42, 0.36] };
      M.obox(hb, ex, y + 5.5, ez, 1.1, 1.3, 3.0, 0, hc); // horse barrel
      M.beam(hb, ex, y + 6.0, ez + 1.4, ex, y + 7.2, ez + 2.1, 0.55, 0.7, hc); // neck
      M.obox(hb, ex, y + 7.3, ez + 2.5, 0.45, 0.55, 1.1, 0, hc); // head
      for (const [dx, dz, lift] of [
        [-0.4, -1.1, 0],
        [0.4, -1.1, 0],
        [-0.4, 1.1, 0],
        [0.4, 1.1, 0.7],
      ])
        M.beam(
          hb,
          ex + dx,
          y + 4.9,
          ez + dz,
          ex + dx,
          y + 3.9 + lift,
          ez + dz + lift * 0.6,
          0.22,
          0.22,
          hc,
        ); // legs (one raised)
      M.obox(hb, ex, y + 6.9, ez - 0.1, 0.6, 1.3, 0.55, 0, hc); // rider
      M.cyl(hb, ex, y + 7.55, ez - 0.1, 0.18, 0.16, 0.35, 8, {
        c: hc.c,
        capTop: true,
      });
      M.beam(
        hb,
        ex + 0.3,
        y + 7.2,
        ez,
        ex + 0.9,
        y + 8.1,
        ez + 0.6,
        0.12,
        0.12,
        hc,
      ); // outstretched arm
      M.ocol(ex, ez, 6.4, 4.4, 0, y + 8.2, 0, { tag: "monument" });
      // raider paint on the pedestal + a sandbag nest at its foot
      const sb = M.buf("fabric", ex, ez, "detail");
      for (let k = 0; k < 7; k++) {
        const a = Math.PI * 0.2 + (k / 6) * Math.PI * 0.6,
          px2 = ex + Math.cos(a) * 4.2,
          pz2 = ez + Math.sin(a) * 3.4;
        M.pipe(
          sb,
          px2 - Math.sin(a) * 0.45,
          y + 0.22 + (k % 2) * 0.02,
          pz2 + Math.cos(a) * 0.45,
          px2 + Math.sin(a) * 0.45,
          y + 0.22,
          pz2 - Math.cos(a) * 0.45,
          0.22,
          6,
          { c: [0.52, 0.48, 0.36] },
        );
      }
      M.ocol(ex, ez + 3.6, 6.0, 1.0, 0, y + 0.5, 0, {
        tag: "sandbags",
        surface: "fabric",
      });
    }
    // subway kiosks at both south corners, benches along the axis walk, lamps, rubble, leaves
    for (const kx of [o.x0 + 5, o.x1 - 5]) {
      const kz = o.z1 - 5,
        kb = M.buf("metal_painted", kx, kz);
      M.box(kb, kx - 1.6, y, kz - 2.4, kx + 1.6, y + 1.1, kz + 2.4, {
        s: 1.5,
        c: [0.24, 0.32, 0.26],
      });
      for (const dz of [-2.4, 2.4]) {
        M.cyl(kb, kx, y + 1.1, kz + dz, 0.05, 0.05, 1.4, 6, {
          c: [0.2, 0.26, 0.22],
        });
        M.cyl(
          M.buf("glass_dirty", kx, kz),
          kx,
          y + 2.6,
          kz + dz,
          0.22,
          0.22,
          0.3,
          10,
          { c: [0.35, 0.55, 0.35], capTop: true },
        );
      }
      M.box3(kx - 1.6, 0, kz - 2.4, kx + 1.6, y + 1.1, kz + 2.4, {
        tag: "kiosk",
      });
    }
    for (const bz of [P.z0 + 6, P.z1 - 6])
      for (const sd of [-1, 1])
        M.parkBench(
          cx + sd * 3.4,
          bz,
          sd > 0 ? -Math.PI / 2 : Math.PI / 2,
          r() < 0.3,
        );
    for (const [x, z] of [
      [o.x0 + 2, o.z0 + 2],
      [o.x1 - 2, o.z0 + 2],
      [o.x0 + 2, o.z1 - 2],
      [o.x1 - 2, o.z1 - 2],
      [P.x0 + 1, P.z0 + 1],
      [P.x1 - 1, P.z1 - 1],
      [P.x0 + 1, P.z1 - 1],
    ])
      M.parkLamp(x, z, r() < 0.3);
    M.rubblePile(
      r.range(o.x0 + 6, cx - 8),
      r.range(P.z1 + 4, o.z1 - 14),
      2.2,
      0.9,
      r,
    );
    for (let i = 0; i < 26; i++)
      M.decal(
        M.buf("my/markings", cx, pcz, "fine"),
        r.range(o.x0 + 2, o.x1 - 2),
        y + 0.055,
        r.range(o.z0 + 2, o.z1 - 2),
        r.range(2, 5),
        r.range(2, 5),
        r() * 6,
        r.pick([M.MARK.LEAVES, M.MARK.DIRT, M.MARK.LITTER, M.MARK.CRACKS]),
      );
    M.unionSquare = {
      x: cx,
      z: pcz,
      statue: { x: cx, z: o.z1 - 9 },
      pavilion: { x: pcx, z: P.z0 - 1 },
      flagpole: { x: pcx, z: pcz },
      camp: campLawn ? cen(campLawn) : null,
      lawns: lawns.length,
    };
  }

  /**
   * A landmark's street forecourt (kind 'forecourt'): plain sidewalk apron between a building's front steps and the
   * avenue, granite-paved in front of the steps. The approach (o.clear, a z-span across the full width) gets only flat
   * paving + litter decals; the two ends get a street tree in a granite pit, a bench, newspaper litter and a little rubble.
   */
