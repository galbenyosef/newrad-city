// play-inline-137 04 — grime
// Lines 388-982 of readable/play-inline-137.pretty.js (statement-aligned).
  function flatironSkin(b, P, doors, H) {
    const { H_BASE, H_RUST, H_SHAFT, H_TOP } = H;
    const K = LB.kit,
      r = LB.rng("flatiron_skin_r2");
    const PR = flatironProw(P, 2.0),
      Pr = PR.Pr,
      sgn = PR.sgn,
      RP = PR.RP;
    const S = 2.2,
      M = 1.5,
      GF = 0.35; // window pitch, edge margin, ground-floor wall face (gappedWall is 0.7 thick, centred on P)
    const gapsOf = [
      (doors[1] || []).map((g) => [g[0] + PR.shift0, g[1] + PR.shift0, g[2]]),
      doors[2] || [],
      doors[3] || [],
    ];
    const edges = [0, 1, 2].map((i) => {
      const p = Pr[i],
        q = Pr[i + 1],
        dx = q[0] - p[0],
        dz = q[1] - p[1],
        len = Math.hypot(dx, dz);
      const u = [dx / len, dz / len],
        n = [u[1] * sgn, -u[0] * sgn];
      const nC = Math.floor((len - 2 * M) / S) + 1,
        st = (len - (nC - 1) * S) / 2,
        cols = [],
        bnd = [];
      for (let k = 0; k < nC; k++) cols.push(st + k * S);
      for (let j = 0; j <= nC; j++) bnd.push(st - S / 2 + j * S);
      return {
        i,
        p,
        u,
        n,
        len,
        cols,
        bnd,
        gaps: gapsOf[i],
        ryF: Math.atan2(n[0], n[1]),
        at: (t, d) => [p[0] + u[0] * t + n[0] * d, p[1] + u[1] * t + n[1] * d],
      };
    });
    const bx = (E, key, t, d, y, w, h, dep, ex) => {
      const [x, z] = E.at(t, d);
      return b.box(
        key,
        x,
        y,
        z,
        w,
        h,
        dep,
        Object.assign({ ry: E.ryF, seg: false, grime: 0.35 }, ex || {}),
      );
    };
    const qd = (E, key, t, d, yc, w, h, ex) => {
      const [x, z] = E.at(t, d);
      return b.quad(
        key,
        x,
        yc,
        z,
        w,
        h,
        Object.assign(
          { ry: E.ryF, uv: "box", noAO: true, grime: 0.12 },
          ex || {},
        ),
      );
    };
    const colE = (E, t, d, w, dep, y0, y1) => {
      const [x, z] = E.at(t, d);
      LB.col(x, z, w, dep, y0, y1, E.ryF, { walkable: false });
    };
    const glass = (boarded, lit) => {
      const v = r();
      return v < 0.24
        ? "glass_broken"
        : v < 0.24 + boarded
          ? "planks"
          : v > 1 - (lit || 0)
            ? "window_lit"
            : "glass_dark";
    };
    const inGap = (E, t, pad) =>
      E.gaps.some((g) => t > g[0] - pad && t < g[1] + pad);
    const arcDir = (a) => [Math.cos(a), Math.sin(a)];
    const PROW_A = PR.a1 + PR.sw / 2; // the nose: one window column on its crown line
    const prowQuad = (key, d, yc, w, h, ex) => {
      const [dx, dz] = arcDir(PROW_A);
      b.quad(
        key,
        PR.c[0] + dx * (RP + d),
        yc,
        PR.c[1] + dz * (RP + d),
        w,
        h,
        Object.assign(
          { ry: Math.atan2(dx, dz), uv: "box", noAO: true, grime: 0.12 },
          ex || {},
        ),
      );
    };

    // ---------------- masses on the rounded footprint ----------------
    K.prismBands(b, "limestone", Pr, H_BASE, H_RUST, 4.5, { grime: 0.6 });
    for (let y = H_BASE + 1.0; y < H_RUST - 0.9; y += 1.0)
      K.prism(b, "granite_dark", K.offsetPoly(Pr, 0.04), y, y + 0.07, {
        grime: 0.2,
        noAO: true,
      }); // channelled joints
    K.prism(
      b,
      "limestone",
      K.offsetPoly(Pr, 0.22),
      H_RUST - 0.75,
      H_RUST - 0.45,
      { grime: 0.4 },
    );
    K.prism(
      b,
      "limestone",
      K.offsetPoly(Pr, 0.42),
      H_RUST - 0.45,
      H_RUST + 0.35,
      { grime: 0.45 },
    ); // base cornice
    K.prismBands(b, "terracotta", Pr, H_RUST + 0.35, H_SHAFT, 7.5, {
      grime: 0.5,
    });
    const Y0S = H_RUST + 0.35,
      FH = 3.0,
      NS = Math.floor((H_SHAFT - Y0S - 0.4) / FH);
    for (const f of [4, 8]) {
      const y = Y0S + f * FH - 0.2;
      K.prism(b, "terracotta", K.offsetPoly(Pr, 0.26), y, y + 0.3, {
        grime: 0.35,
      });
    }
    K.prism(b, "limestone", K.offsetPoly(Pr, 0.32), H_SHAFT, H_SHAFT + 0.6, {
      grime: 0.4,
    });
    K.prism(b, "terracotta", Pr, H_SHAFT + 0.6, H_TOP, { grime: 0.4 });
    K.prism(b, "limestone", K.offsetPoly(Pr, 0.35), H_TOP, H_TOP + 0.8, {
      grime: 0.5,
    }); // frieze
    K.prism(b, "limestone", K.offsetPoly(Pr, 0.7), H_TOP + 0.8, H_TOP + 1.1, {
      grime: 0.45,
    }); // bed mould
    K.prism(b, "limestone", K.offsetPoly(Pr, 1.6), H_TOP + 1.1, H_TOP + 1.75, {
      grime: 0.45,
    }); // corona (the big overhang)
    K.prism(b, "limestone", K.offsetPoly(Pr, 1.4), H_TOP + 1.75, H_TOP + 2.0, {
      grime: 0.35,
    }); // cymatium
    K.prism(b, "terracotta", K.offsetPoly(Pr, -0.3), H_TOP + 2.0, H_TOP + 3.1, {
      grime: 0.5,
    }); // attic storey = roof deck level
    // parapet ring round the roof deck (a ring, so the deck stays at H_TOP + 3.1)
    {
      const ring = K.offsetPoly(Pr, -0.5);
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i],
          q = ring[(i + 1) % ring.length],
          dx = q[0] - p[0],
          dz = q[1] - p[1],
          len = Math.hypot(dx, dz);
        if (len < 0.05) continue;
        b.box(
          "limestone",
          (p[0] + q[0]) / 2,
          H_TOP + 3.1,
          (p[1] + q[1]) / 2,
          len + 0.25,
          0.85,
          0.4,
          { ry: Math.atan2(-dz, dx), seg: false, grime: 0.55 },
        );
        LB.colWall(p[0], p[1], q[0], q[1], 0.4, H_TOP + 3.1, H_TOP + 4.0, {
          walkable: false,
        });
      }
    }

    // ---------------- ground floor: rounded nose, storefront bays, portals ----------------
    {
      const pie = [PR.c];
      for (let k = 0; k <= 12; k++) {
        const [dx, dz] = arcDir(PR.a1 + (PR.sw * k) / 12);
        pie.push([PR.c[0] + dx * (RP + GF), PR.c[1] + dz * (RP + GF)]);
      }
      K.prism(b, "limestone", pie, 0, H_BASE, { grime: 0.7 });
      K.prism(b, "granite_dark", K.offsetPoly(pie, 0.06), 0, 0.55, {
        grime: 0.8,
      });
      LB.fillPoly(pie, 0, 0, 0, 0, H_BASE, 0.5, { walkable: false });
      const E = edges[0]; // the Broadway wall's short return from the new tangent point to P1
      bx(E, "limestone", PR.shift0 / 2, 0, 0, PR.shift0 + 0.2, H_BASE, 0.7, {
        seg: true,
        grime: 0.65,
      });
      colE(E, PR.shift0 / 2, 0, PR.shift0 + 0.2, 0.7, 0, H_BASE);
      // the nose's own shop window (the old cigar store) + a lamp bracket
      prowQuad("planks", GF + 0.02, 2.0, 1.4, 2.4);
      prowQuad("iron", GF + 0.03, 3.45, 1.6, 0.12, { grime: 0 });
    }
    for (const E of edges) {
      // piers every second window column (+ both ends); none inside an opening
      const piers = [];
      for (let j = 0; j < E.bnd.length; j += 2) piers.push(E.bnd[j]);
      if ((E.bnd.length - 1) % 2) piers.push(E.bnd[E.bnd.length - 1]);
      const live = piers.filter((t) => !inGap(E, t, 0.7));
      for (const t of live) {
        bx(E, "limestone", t, GF + 0.15, 0, 0.8, H_BASE - 0.3, 0.3, {
          seg: true,
          grime: 0.7,
        });
        bx(E, "granite_dark", t, GF + 0.2, 0, 0.95, 0.5, 0.4, { grime: 0.8 }); // plinth
        bx(E, "limestone", t, GF + 0.22, H_BASE - 0.75, 0.95, 0.3, 0.44); // capital
        for (let y = 0.9; y < H_BASE - 0.9; y += 0.62)
          bx(E, "granite_dark", t, GF + 0.305, y, 0.82, 0.05, 0.02, {
            grime: 0.1,
          }); // rustication joints
        colE(E, t, GF + 0.2, 0.95, 0.4, 0, H_BASE - 0.3);
      }
      // storefronts in the bays between piers
      for (let k = 0; k < piers.length - 1; k++) {
        const ta = piers[k] + 0.4,
          tb = piers[k + 1] - 0.4,
          w = tb - ta,
          tc = (ta + tb) / 2;
        if (w < 1) continue;
        if (E.gaps.some((g) => g[1] > ta - 0.3 && g[0] < tb + 0.3)) continue;
        const g = glass(0.3, 0.02);
        bx(E, "granite_dark", tc, GF + 0.04, 0, w, 0.7, 0.08, { grime: 0.8 }); // stall riser
        qd(E, g, tc, GF + 0.02, 0.7 + 1.25, w, 2.5);
        if (g !== "planks") {
          qd(E, "iron", tc, GF + 0.03, 1.95, 0.07, 2.5, { grime: 0 });
          qd(E, "iron", tc, GF + 0.03, 1.95, w, 0.06, { grime: 0 });
        }
        bx(E, "iron", tc, GF + 0.04, 3.2, w, 0.14, 0.1, { grime: 0.3 }); // transom bar
        qd(E, glass(0.15), tc, GF + 0.02, 3.72, w, 0.9);
        bx(E, "limestone", tc, GF + 0.08, 0.64, w + 0.05, 0.08, 0.18); // sill
        if (r() < 0.3) {
          // a sagging awning frame / roll-down shutter half down
          if (r() < 0.5)
            bx(E, "rust", tc, GF + 0.06, 2.4 + r() * 0.6, w, 1.1, 0.06, {
              grime: 0.7,
            });
          else
            for (const s of [-1, 1]) {
              const [x0, z0] = E.at(tc + (s * w) / 2, GF + 0.05),
                [x1, z1] = E.at(tc + (s * w) / 2, GF + 1.1);
              b.beam(
                "rust",
                V(x0, 3.3, z0),
                V(x1, 3.0 - r() * 0.4, z1),
                0.04,
                0.04,
              );
            }
        }
      }
      // portals: flanking rusticated jambs, a lintel with keystone and a settlers' steel beam under it, caged lamp
      for (const gp of E.gaps) {
        const t0 = gp[0],
          t1 = gp[1],
          h = gp[2] || 3.4,
          w = t1 - t0,
          tc = (t0 + t1) / 2;
        for (const s of [t0 - 0.45, t1 + 0.45]) {
          bx(E, "limestone", s, GF + 0.2, 0, 0.9, h + 0.05, 0.4, {
            seg: true,
            grime: 0.65,
          });
          bx(E, "granite_dark", s, GF + 0.25, 0, 1.05, 0.55, 0.5, {
            grime: 0.85,
          });
          for (let y = 0.95; y < h - 0.3; y += 0.62)
            bx(E, "granite_dark", s, GF + 0.405, y, 0.92, 0.05, 0.02, {
              grime: 0.1,
            });
          colE(E, s, GF + 0.25, 1.05, 0.5, 0, h);
        }
        bx(E, "limestone", tc, GF + 0.2, h, w + 1.9, 0.62, 0.42, {
          grime: 0.55,
        }); // lintel
        bx(E, "limestone", tc, GF + 0.32, h - 0.08, 0.7, 0.85, 0.34, {
          grime: 0.45,
        }); // keystone
        bx(E, "limestone", tc, GF + 0.36, h + 0.62, w + 2.3, 0.18, 0.5, {
          grime: 0.4,
        }); // hood cornice
        bx(E, "rust", tc, GF + 0.07, h - 0.34, w + 0.5, 0.3, 0.14, {
          grime: 0.7,
        }); // settlers' I-beam
        for (const s of [t0 + 0.1, t1 - 0.1])
          bx(E, "rust", s, GF + 0.07, 0, 0.16, h - 0.34, 0.14, { grime: 0.7 }); // its props
        const [lx, lz] = E.at(tc, GF + 0.75);
        b.box("iron", lx, h + 0.95, lz, 0.28, 0.36, 0.28, { seg: false });
        if (w > 5)
          LB.glows.push({
            pos: V(lx, h + 1.05, lz),
            color: 0xffb060,
            size: 2.4,
          });
      }
      // continuous fascia + cornice over the ground floor (above every opening)
      const t0 = E.bnd[0] - 0.6,
        t1 = E.bnd[E.bnd.length - 1] + 0.6;
      bx(
        E,
        "limestone",
        (t0 + t1) / 2,
        GF + 0.12,
        H_BASE - 0.3,
        t1 - t0,
        0.5,
        0.26,
        { seg: true, grime: 0.5 },
      );
      bx(
        E,
        "limestone",
        (t0 + t1) / 2,
        GF + 0.25,
        H_BASE + 0.2,
        t1 - t0 + 0.4,
        0.22,
        0.52,
        { seg: true, grime: 0.45 },
      );
    }

    // ---------------- floors 2–4: architrave-framed windows in the rusticated base ----------------
    for (const E of edges) {
      for (let f = 0; f < 3; f++) {
        const y = H_BASE + 1.2 + f * 3.0,
          h = 1.9,
          w = 1.1;
        for (const t of E.cols) {
          const g = glass(0.12, 0.02);
          qd(E, g, t, 0.02, y + h / 2, w, h);
          if (g !== "planks") {
            qd(E, "iron", t, 0.03, y + h / 2, 0.05, h, { grime: 0 });
            qd(E, "iron", t, 0.03, y + h * 0.62, w, 0.05, { grime: 0 });
          }
          for (const s of [-1, 1])
            bx(
              E,
              "limestone",
              t + s * (w / 2 + 0.1),
              0.06,
              y - 0.05,
              0.2,
              h + 0.1,
              0.12,
            );
          bx(E, "limestone", t, 0.1, y - 0.2, w + 0.45, 0.16, 0.2);
          bx(E, "limestone", t, 0.09, y + h, w + 0.5, 0.26, 0.18);
          if (f === 1)
            bx(E, "limestone", t, 0.13, y + h - 0.06, 0.32, 0.44, 0.22);
        }
      }
    }
    for (let f = 0; f < 3; f++)
      prowQuad(glass(0.1), 0.02, H_BASE + 1.2 + f * 3.0 + 0.95, 0.9, 1.9);

    // ---------------- the shaft: pier-and-spandrel grid with deep reveals ----------------
    const ORIEL_W = 3 * S + 0.8,
      SAG = 0.85,
      OY0 = Y0S + FH - 0.25,
      OY1 = Y0S + (NS - 1) * FH - 0.1;
    const orielAt = [];
    for (const E of edges) {
      const span0 = E.bnd[0],
        span1 = E.bnd[E.bnd.length - 1],
        smid = (span0 + span1) / 2,
        span = span1 - span0;
      for (let j = 0; j < E.bnd.length; j++)
        bx(E, "terracotta", E.bnd[j], 0.08, Y0S, 1.1, H_SHAFT - Y0S, 0.16, {
          seg: true,
          segLen: 7,
          grime: 0.45,
        });
      for (let f = 0; f < NS; f++) {
        const y = Y0S + 0.6 + f * FH,
          h = 1.9;
        bx(E, "terracotta", smid, 0.04, y + h, span, FH - h, 0.08, {
          seg: true,
          segLen: 8,
          grime: 0.5,
          c: 0xb8a88c,
        }); // spandrel
        bx(E, "terracotta", smid, 0.13, y - 0.12, span, 0.1, 0.26, {
          seg: true,
          segLen: 8,
          grime: 0.4,
        }); // sill ledge
        for (const t of E.cols) {
          const g = glass(0.07, 0.03);
          qd(E, g, t, 0.02, y + h / 2, 1.0, h);
          if (g !== "planks")
            qd(E, "iron", t, 0.03, y + h / 2, 0.05, h, { grime: 0 });
          if (g === "glass_broken" && r() < 0.35)
            qd(E, "concrete_dark", t, 0.165, y + h + 0.9, 1.0, 1.6, {
              grime: 1,
              noAO: false,
            }); // soot from a burnt room
        }
      }
      // bowed oriels on Broadway (edge 0) and Fifth Avenue (edge 2), centred on window columns
      if (E.i === 1) continue;
      for (let k = 1; k <= 3; k++) {
        const tt = (E.len * k) / 4;
        let tc = E.cols[0];
        for (const t of E.cols)
          if (Math.abs(t - tt) < Math.abs(tc - tt)) tc = t;
        orielAt.push({ E, tc });
      }
    }
    const HW = ORIEL_W / 2,
      dOf = (s) => SAG * (1 - (s / HW) * (s / HW));
    for (const { E, tc } of orielAt) {
      const poly = [E.at(tc - HW, -0.1)];
      for (let k = 0; k <= 10; k++) {
        const s = -HW + (ORIEL_W * k) / 10;
        poly.push(E.at(tc + s, dOf(s)));
      }
      poly.push(E.at(tc + HW, -0.1));
      K.prismBands(b, "terracotta", poly, OY0, OY1, 7.5, { grime: 0.45 });
      K.prism(b, "terracotta", K.offsetPoly(poly, 0.14), OY0 - 0.45, OY0, {
        grime: 0.5,
      }); // corbel
      K.prism(b, "terracotta", K.offsetPoly(poly, 0.16), OY1, OY1 + 0.35, {
        grime: 0.4,
      }); // cap
      for (let f = 1; f < NS - 1; f++) {
        const y = Y0S + 0.6 + f * FH,
          h = 1.9;
        if (y < OY0 || y + h > OY1) continue;
        for (const s of [-S, 0, S]) {
          const d = dOf(s),
            slope = (-2 * SAG * s) / (HW * HW);
          let nx = E.n[0] - E.u[0] * slope,
            nz = E.n[1] - E.u[1] * slope;
          const nl = Math.hypot(nx, nz);
          nx /= nl;
          nz /= nl;
          const [x, z] = E.at(tc + s, d + 0.02),
            ry = Math.atan2(nx, nz),
            g = glass(0.06, 0.03);
          b.quad(g, x, y + h / 2, z, 1.0, h, {
            ry,
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
          b.box(
            "terracotta",
            x + nx * 0.1,
            y - 0.12,
            z + nz * 0.1,
            1.35,
            0.1,
            0.22,
            { ry, seg: false, grime: 0.35 },
          );
          b.box(
            "terracotta",
            x + nx * 0.06,
            y + h,
            z + nz * 0.06,
            1.25,
            0.2,
            0.14,
            { ry, seg: false, grime: 0.35 },
          );
        }
        for (const s of [-1.5 * S, -S / 2, S / 2, 1.5 * S]) {
          // mullion piers on the bow
          const d = dOf(s),
            slope = (-2 * SAG * s) / (HW * HW);
          let nx = E.n[0] - E.u[0] * slope,
            nz = E.n[1] - E.u[1] * slope;
          const nl = Math.hypot(nx, nz);
          nx /= nl;
          nz /= nl;
          const [x, z] = E.at(tc + s, d + 0.05);
          if (f === 1)
            b.box("terracotta", x, OY0, z, 0.5, OY1 - OY0, 0.14, {
              ry: Math.atan2(nx, nz),
              segLen: 7,
              grime: 0.4,
            });
        }
      }
    }
    for (let f = 0; f < NS; f++)
      prowQuad(glass(0.08, 0.03), 0.02, Y0S + 0.6 + f * FH + 0.95, 0.9, 1.9);

    // ---------------- the crown: round-arched windows between pilasters ----------------
    const CY = H_SHAFT + 1.0,
      CH = 3.0,
      CW = 1.2,
      RA = CW / 2;
    const ring = (() => {
      const sh = new THREE.Shape();
      sh.absarc(0, 0, RA + 0.2, 0, Math.PI, false);
      sh.lineTo(-RA, 0);
      sh.absarc(0, 0, RA, Math.PI, 0, true);
      sh.lineTo(RA + 0.2, 0);
      return sh;
    })();
    for (const E of edges) {
      for (const t of E.bnd) {
        bx(
          E,
          "limestone",
          t,
          0.12,
          H_SHAFT + 0.6,
          0.7,
          H_TOP - H_SHAFT - 0.6,
          0.24,
          { seg: true, grime: 0.45 },
        );
        bx(E, "limestone", t, 0.18, H_TOP - 0.55, 0.9, 0.35, 0.36);
      }
      for (const t of E.cols) {
        const g = glass(0.1, 0.02);
        qd(E, g, t, 0.02, CY + CH / 2, CW, CH);
        {
          const [x, z] = E.at(t, 0.02);
          b.add(g, new THREE.CircleGeometry(RA, 10, 0, Math.PI), {
            m: LB.m4(x, CY + CH, z, E.ryF),
            uv: "box",
            noAO: true,
            grime: 0.1,
          });
        }
        {
          const [x, z] = E.at(t, 0);
          b.add(
            "limestone",
            new THREE.ExtrudeGeometry(ring, {
              depth: 0.16,
              bevelEnabled: false,
              curveSegments: 6,
            }),
            { m: LB.m4(x, CY + CH, z, E.ryF), grime: 0.3 },
          );
        }
        for (const s of [-1, 1])
          bx(E, "limestone", t + s * (RA + 0.1), 0.06, CY, 0.2, CH, 0.14);
        bx(E, "limestone", t, 0.13, CY + CH + RA - 0.05, 0.3, 0.42, 0.24); // keystone
        bx(E, "limestone", t, 0.12, CY - 0.2, CW + 0.5, 0.18, 0.26); // sill
        if (g !== "planks") {
          qd(E, "iron", t, 0.03, CY + CH / 2, 0.05, CH, { grime: 0 });
          qd(E, "iron", t, 0.03, CY + CH * 0.66, CW, 0.05, { grime: 0 });
        }
      }
      // modillions under the corona + attic windows
      const t0 = E.bnd[0] - 1.2,
        t1 = E.bnd[E.bnd.length - 1] + 1.2;
      for (let t = t0; t <= t1; t += 0.9)
        bx(E, "limestone", t, 1.15, H_TOP + 0.75, 0.22, 0.36, 0.9, {
          grime: 0.3,
        });
      for (const t of E.cols)
        qd(E, glass(0.2), t, -0.28, H_TOP + 2.55, 0.8, 0.6);
    }
    prowQuad(glass(0.1), 0.02, CY + CH / 2, 0.9, CH);
    for (let k = 0; k <= 4; k++) {
      // modillions round the nose
      const a = PR.a1 + (PR.sw * k) / 4,
        [dx, dz] = arcDir(a);
      b.box(
        "limestone",
        PR.c[0] + dx * (RP + 1.15),
        H_TOP + 0.75,
        PR.c[1] + dz * (RP + 1.15),
        0.22,
        0.36,
        0.9,
        { ry: Math.atan2(dx, dz), seg: false, grime: 0.3 },
      );
    }
    return PR;
  }

  // =====================================================================
  // FLATIRON — "Flatiron Trading Post"
  // =====================================================================
