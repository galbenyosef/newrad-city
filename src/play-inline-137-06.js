// play-inline-137 06 — the
// Lines 1173-2059 of readable/play-inline-137.pretty.js (statement-aligned).
  LB.addBuilder(
    "woolworth",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("woolworth");
      b.ground = 0;
      b.aoH = 4;
      const anchors = {};
      // Round 1 refit: Broadway now runs along the EAST edge of the block (x≈32…48), so — as in NYC — the Cathedral of
      // Commerce fills the block and fronts Broadway (City Hall Park across the avenue), its tower rising sheer from the
      // Broadway front. The raiders hold a walled forecourt (x 22…30) between the portal and the Broadway sidewalk.
      const X0 = site.x0 + 1,
        X1 = site.x1 - 8,
        Z0 = site.z0 + 1,
        Z1 = site.z1 - 1;
      const ZC = (Z0 + Z1) / 2;
      const BASE_H = 40,
        GF = 6; // base block height, ground-floor (storefront) height
      const TW = 18,
        T = { x0: X1 - TW, x1: X1, z0: ZC - TW / 2, z1: ZC + TW / 2 },
        TCX = (T.x0 + T.x1) / 2,
        TCZ = ZC;
      const CZ0 = ZC - 5.5,
        CZ1 = ZC + 5.5; // light court (open to the west above the low rear range)
      // ---- base block: U round the light court, closed at the back by a lower rear range
      const basePoly = [
        [X0, Z0],
        [X1, Z0],
        [X1, Z1],
        [X0, Z1],
        [X0, CZ1],
        [T.x0, CZ1],
        [T.x0, CZ0],
        [X0, CZ0],
      ];
      const rearPoly = [
        [X0, CZ0],
        [X0 + 7, CZ0],
        [X0 + 7, CZ1],
        [X0, CZ1],
      ];
      // The storefront skin and the cornice band stand proud of the wall plane; both are NOTCHED at the Broadway portal
      // (edge 1, x = X1) so the boarded bronze doors, the pried gap (landmark_interiors, placed from anchors.door) and
      // the tympanum tracery read inside the arch instead of being papered over by limestone.
      const PORTAL_HW = 2.2;
      const notched = (d) => {
        const o = K.offsetPoly(basePoly, d);
        o.splice(
          2,
          0,
          [X1 + d, ZC - PORTAL_HW],
          [X1 - 0.3, ZC - PORTAL_HW],
          [X1 - 0.3, ZC + PORTAL_HW],
          [X1 + d, ZC + PORTAL_HW],
        );
        return o;
      };
      K.prism(b, "limestone", notched(0.12), 0, GF, { grime: 0.75 });
      K.prismBands(b, "terracotta", basePoly, GF, BASE_H, 8, { grime: 0.45 });
      K.prism(b, "limestone", notched(0.35), GF - 0.2, GF + 0.6, {});
      K.prism(b, "limestone", rearPoly, 0, GF, { grime: 0.75 });
      K.prismBands(b, "terracotta", rearPoly, GF, 24, 8, { grime: 0.5 });
      K.prism(b, "terracotta", K.offsetPoly(rearPoly, 0.3), 24, 24.9, {});
      const EB = 1; // basePoly edge 1 = the Broadway face (tower in its middle, handled separately)
      // Cass Gilbert's elevation: continuous terracotta piers every bay pair, recessed darker spandrels, a tracery storey
      // every 6 floors and at the top, belt courses stopping short of the piers (K.gothicFacade — all merged).
      const baseFac = {
        y0: GF + 0.6,
        y1: BASE_H - 0.6,
        floorH: 2.7,
        pair: 4.4,
        pierW: 0.7,
        pierD: 0.55,
        band: 6,
        margin: 1.0,
        broken: 0.28,
        boarded: 0.06,
        lit: 0.015,
      };
      const baseTops = K.gothicFacade(
        b,
        basePoly,
        Object.assign({}, baseFac, { seed: 11, skipEdge: (i) => i === EB }),
      );
      K.gothicFacade(
        b,
        rearPoly,
        Object.assign({}, baseFac, {
          y1: 23.6,
          seed: 12,
          margin: 0.8,
          skipEdge: (i) => i !== 1 && i !== 3,
        }),
      );
      // the two short Broadway stretches of the base either side of the tower
      for (const [za, zb] of [
        [Z0, T.z0],
        [T.z1, Z1],
      ]) {
        K.gothicFacade(
          b,
          [
            [X1, za],
            [X1, zb],
            [X1 - 1, zb],
            [X1 - 1, za],
          ],
          Object.assign({}, baseFac, {
            seed: 13 + za,
            margin: 0.5,
            skipEdge: (i) => i !== 0,
          }),
        );
      }
      // gothic arcade band (pointed lancets between the piers) + cornice + pinnacled parapet on the base roofline
      const lancetRow = (poly, y, w, h, spacing, skip, key) => {
        let A = 0;
        for (let i = 0; i < poly.length; i++) {
          const p = poly[i],
            q = poly[(i + 1) % poly.length];
          A += p[0] * q[1] - q[0] * p[1];
        }
        const sgn = A > 0 ? 1 : -1;
        for (let i = 0; i < poly.length; i++) {
          if (skip && skip(i)) continue;
          const p = poly[i],
            q = poly[(i + 1) % poly.length],
            dx = q[0] - p[0],
            dz = q[1] - p[1],
            len = Math.hypot(dx, dz);
          if (len < 3) continue;
          const ux = dx / len,
            uz = dz / len,
            nx = uz * sgn,
            nz = -ux * sgn,
            ry = Math.atan2(nx, nz);
          const n = Math.max(1, Math.floor((len - 2) / spacing)),
            st = (len - (n - 1) * spacing) / 2;
          for (let k = 0; k < n; k++) {
            const t = st + k * spacing;
            K.lancet(
              b,
              key || "glass_dark",
              "terracotta",
              p[0] + ux * t + nx * 0.06,
              y,
              p[1] + uz * t + nz * 0.06,
              w,
              h,
              ry,
            );
          }
        }
      };
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(basePoly, 0.5),
        BASE_H - 0.6,
        BASE_H + 0.3,
        {},
      );
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(basePoly, 0.2),
        BASE_H + 0.3,
        BASE_H + 1.2,
        {},
      );
      for (let i = 0; i < baseTops.length; i++) {
        // pinnacles crown every second pier head (every pier on the short faces)
        const t = baseTops[i];
        if (i % 2 && baseTops.length > 12) continue;
        if (t.x > T.x0 - 0.5 && t.z > T.z0 - 0.5 && t.z < T.z1 + 0.5) continue;
        K.pinnacle(
          b,
          "terracotta",
          t.x - t.nx * 0.3,
          BASE_H + 1.2,
          t.z - t.nz * 0.3,
          0.7,
          3.6,
          { spireKey: "copper_roof" },
        );
      }
      for (const [cx, cz] of [
        [X0, Z0],
        [X1, Z0],
        [X1, Z1],
        [X0, Z1],
      ])
        K.pinnacle(b, "terracotta", cx, BASE_H + 1.2, cz, 1.0, 5.0, {
          spireKey: "copper_roof",
        });
      LB.fillPoly(basePoly, 0, 0, 0, 0, BASE_H + 1.2, 2.0, { walkable: false });
      LB.colMM(X0, 0, CZ0, X0 + 7, 24.9, CZ1, { walkable: false });
      // ---- ground floor: pointed shop arches on every street face (glass / boarded / smashed)
      {
        const r = LB.rng("wool_gf");
        const faces = [
          [
            [X0, Z0],
            [X1, Z0],
          ],
          [
            [X1, Z1],
            [X0, Z1],
          ],
          [
            [X1, Z0],
            [X1, T.z0],
          ],
          [
            [X1, T.z1],
            [X1, Z1],
          ],
          [
            [X0, Z1],
            [X0, CZ1],
          ],
          [
            [X0, CZ0],
            [X0, Z0],
          ],
        ];
        for (const [p, q] of faces) {
          const dx = q[0] - p[0],
            dz = q[1] - p[1],
            len = Math.hypot(dx, dz),
            ux = dx / len,
            uz = dz / len;
          let A = 0;
          for (let i = 0; i < basePoly.length; i++) {
            const a = basePoly[i],
              c = basePoly[(i + 1) % basePoly.length];
            A += a[0] * c[1] - c[0] * a[1];
          }
          const sgn = A > 0 ? 1 : -1,
            nx = uz * sgn,
            nz = -ux * sgn,
            ry = Math.atan2(nx, nz);
          const n = Math.max(1, Math.floor((len - 1.6) / 4.4)),
            st = (len - (n - 1) * 4.4) / 2;
          for (let k = 0; k < n; k++) {
            const t = st + k * 4.4,
              x = p[0] + ux * t + nx * 0.16,
              z = p[1] + uz * t + nz * 0.16,
              roll = r();
            K.lancet(
              b,
              roll < 0.3
                ? "glass_broken"
                : roll < 0.6
                  ? "planks"
                  : "glass_dark",
              "limestone",
              x,
              0.5,
              z,
              3.0,
              4.6,
              ry,
            );
            b.box(
              "limestone",
              x - ux * 2.2 + nx * 0.2,
              0,
              z - uz * 2.2 + nz * 0.2,
              0.7,
              GF - 0.2,
              0.4,
              { ry, seg: false, grime: 0.6 },
            );
          }
        }
      }
      // ---- the tower (flush with Broadway, rising sheer from the sidewalk). Lower shaft 18 m square to the shoulder
      // setback at SH (≈2/3 of the shaft), upper shaft inset 1 m to TH1; corner turrets on both stages.
      const TH1 = 80,
        TH2 = 89,
        PY0 = 94,
        PY1 = 104,
        SH = 58;
      const towerPoly = [
        [T.x0, T.z0],
        [T.x1, T.z0],
        [T.x1, T.z1],
        [T.x0, T.z1],
      ];
      const uPoly = K.offsetPoly(towerPoly, -1.0);
      const TE = 1; // towerPoly edge 1 = Broadway face
      K.prism(b, "limestone", K.offsetPoly(towerPoly, 0.1), 0, GF, {
        grime: 0.75,
        noAO: false,
      });
      K.prismBands(b, "terracotta", towerPoly, GF, SH + 0.9, 9, { grime: 0.4 });
      K.prismBands(b, "terracotta", uPoly, SH + 0.9, TH1, 9, { grime: 0.35 });
      const towFac = {
        floorH: 2.7,
        pair: 4.0,
        pierW: 0.75,
        pierD: 0.65,
        band: 8,
        margin: 1.6,
        broken: 0.22,
        lit: 0.02,
      };
      // Broadway face: the outer piers run from the storefront cornice, the inner pair springs off the portal's apex
      K.gothicFacade(
        b,
        towerPoly,
        Object.assign({}, towFac, {
          y0: GF + 0.6,
          y1: SH,
          seed: 18,
          skipEdge: (i) => i !== TE,
          pierFrom: (i, k) => (k === 1 || k === 2 ? 10.9 : GF + 0.3),
          bayFrom: (i, k) => (k === 1 ? 11.4 : GF + 0.6),
        }),
      );
      K.gothicFacade(
        b,
        towerPoly,
        Object.assign({}, towFac, {
          y0: BASE_H + 1.8,
          y1: SH,
          seed: 17,
          skipEdge: (i) => i === TE,
        }),
      );
      const towTops = K.gothicFacade(
        b,
        uPoly,
        Object.assign({}, towFac, {
          y0: SH + 1.5,
          y1: TH1 - 0.2,
          margin: 1.4,
          seed: 19,
        }),
      );
      // shoulder: cornice + pinnacles on the lower shaft's pier heads
      K.prism(b, "terracotta", K.offsetPoly(towerPoly, 0.75), SH, SH + 0.5, {});
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(towerPoly, 0.35),
        SH + 0.5,
        SH + 1.3,
        {},
      );
      for (let i = 0; i < 4; i++) {
        const p = towerPoly[i],
          q = towerPoly[(i + 1) % 4];
        for (let k = 1; k < 4; k++) {
          const t = k / 4;
          K.pinnacle(
            b,
            "terracotta",
            p[0] + (q[0] - p[0]) * t,
            SH + 1.3,
            p[1] + (q[1] - p[1]) * t,
            0.55,
            3.0,
            { spireKey: "copper_roof", finial: false },
          );
        }
      }
      // octagonal corner turrets: lower pair to the shoulder, upper pair to above the crown's parapet
      for (const [cx, cz] of towerPoly) {
        const ty0 = cx > T.x1 - 1 ? GF : BASE_H + 1.2;
        b.cyl("terracotta", cx, ty0, cz, 1.35, 1.5, SH + 2.5 - ty0, 8, {
          hSeg: 6,
          grime: 0.4,
        });
        for (let y = ty0 + 8; y < SH; y += 8)
          b.cyl("terracotta", cx, y, cz, 1.62, 1.62, 0.45, 8, { hSeg: 1 });
        K.pinnacle(b, "terracotta", cx, SH + 2.5, cz, 1.5, 6.0, {
          spireKey: "copper_roof",
        });
      }
      for (const [cx, cz] of uPoly) {
        b.cyl(
          "terracotta",
          cx,
          SH + 1.3,
          cz,
          1.2,
          1.35,
          TH1 + 4 - SH - 1.3,
          8,
          { hSeg: 5, grime: 0.35 },
        );
        for (let y = SH + 8; y < TH1; y += 8)
          b.cyl("terracotta", cx, y, cz, 1.45, 1.45, 0.4, 8, { hSeg: 1 });
        K.pinnacle(b, "terracotta", cx, TH1 + 4, cz, 1.5, 7.0, {
          spireKey: "copper_roof",
        });
      }
      K.prism(b, "terracotta", K.offsetPoly(uPoly, 0.75), TH1, TH1 + 1.4, {});
      for (const t of towTops)
        K.pinnacle(
          b,
          "terracotta",
          t.x - t.nx * 0.2,
          TH1 + 1.4,
          t.z - t.nz * 0.2,
          0.6,
          3.6,
          { spireKey: "copper_roof" },
        );
      // crown stage 1 (inset) with tall tracery windows and corner pinnacles, flying buttresses to the turrets
      const T2 = {
        x0: T.x0 + 2.4,
        x1: T.x1 - 2.4,
        z0: T.z0 + 2.4,
        z1: T.z1 - 2.4,
      };
      const t2Poly = [
        [T2.x0, T2.z0],
        [T2.x1, T2.z0],
        [T2.x1, T2.z1],
        [T2.x0, T2.z1],
      ];
      K.prism(b, "terracotta", t2Poly, TH1 + 1.4, TH2, { grime: 0.35 });
      lancetRow(t2Poly, TH1 + 2.4, 1.2, 5.0, 2.2, null);
      K.prism(b, "terracotta", K.offsetPoly(t2Poly, 0.4), TH2, TH2 + 0.8, {});
      for (let i = 0; i < 4; i++) {
        const [cx, cz] = uPoly[i],
          [ix, iz] = t2Poly[i];
        K.pinnacle(b, "terracotta", ix, TH2 + 0.8, iz, 1.1, 5.4, {
          spireKey: "copper_roof",
        });
        b.beam(
          "terracotta",
          V(cx, TH1 + 6.2, cz),
          V(ix, TH2 - 1, iz),
          0.4,
          0.5,
          { grime: 0.3 },
        );
      }
      // crown stage 2 (smaller) under the copper pyramid
      const T3 = {
        x0: T2.x0 + 1.6,
        x1: T2.x1 - 1.6,
        z0: T2.z0 + 1.6,
        z1: T2.z1 - 1.6,
      };
      const t3Poly = [
        [T3.x0, T3.z0],
        [T3.x1, T3.z0],
        [T3.x1, T3.z1],
        [T3.x0, T3.z1],
      ];
      K.prism(b, "terracotta", t3Poly, TH2 + 0.8, PY0, { grime: 0.35 });
      lancetRow(t3Poly, TH2 + 1.3, 0.9, 2.6, 1.8, null);
      for (const [cx, cz] of t3Poly)
        K.pinnacle(b, "terracotta", cx, PY0 - 1.5, cz, 0.9, 4.6, {
          spireKey: "copper_roof",
        });
      K.prism(
        b,
        "terracotta",
        K.offsetPoly(t3Poly, 0.35),
        PY0 - 0.2,
        PY0 + 0.4,
        {},
      );
      // copper pyramid roof with two tiers of dormers, lantern, spire and a still-blinking aircraft beacon
      const PH = (T3.x1 - T3.x0) / 2 + 0.3;
      const pyr = new THREE.ConeGeometry(Math.SQRT2 * PH, PY1 - PY0, 4, 4);
      pyr.rotateY(Math.PI / 4);
      b.add("copper_roof", pyr, {
        m: LB.m4(TCX, PY0 + 0.4 + (PY1 - PY0) / 2, TCZ),
        grime: 0.3,
        aoH: 1,
      });
      for (let f = 0; f < 4; f++) {
        const ry = (f * Math.PI) / 2,
          s = Math.sin(ry),
          c = Math.cos(ry);
        for (const dy of [1.6, 4.4]) {
          const off = PH - 0.2 - (dy * PH) / (PY1 - PY0);
          const dx = TCX + s * off,
            dz = TCZ + c * off,
            sc = dy > 2 ? 0.75 : 1;
          b.box("copper_roof", dx, PY0 + dy, dz, 1.3 * sc, 1.5 * sc, 1.1, {
            ry,
            seg: false,
          });
          const dp = new THREE.ConeGeometry(0.95 * sc, 1.0 * sc, 4, 1);
          dp.rotateY(Math.PI / 4);
          b.add("copper_roof", dp, {
            m: LB.m4(
              dx,
              PY0 + dy + 1.5 * sc + 0.5 * sc,
              dz,
              ry,
              0,
              0,
              1,
              1,
              0.8,
            ),
          });
          b.quad(
            "glass_dark",
            dx + s * 0.57,
            PY0 + dy + 0.75 * sc,
            dz + c * 0.57,
            0.6 * sc,
            0.95 * sc,
            { ry },
          );
        }
      }
      b.cyl("copper_roof", TCX, PY1 - 0.6, TCZ, 1.0, 1.3, 2.6, 8, { hSeg: 1 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU;
        b.cyl(
          "copper_roof",
          TCX + Math.cos(a) * 1.1,
          PY1 + 2.0,
          TCZ + Math.sin(a) * 1.1,
          0.08,
          0.08,
          1.6,
          4,
          { hSeg: 1 },
        );
      }
      b.cyl("copper_roof", TCX, PY1 + 3.6, TCZ, 0.05, 1.25, 4.2, 8, {
        hSeg: 2,
      });
      b.cyl("iron", TCX, PY1 + 7.6, TCZ, 0.03, 0.06, 3, 4, { hSeg: 1 });
      b.sphere("lamp_red", TCX, PY1 + 10.6, TCZ, 0.18, {
        noAO: true,
        grime: 0,
      });
      LB.glows.push({
        pos: V(TCX, PY1 + 10.6, TCZ),
        color: 0xff3020,
        size: 3,
        opts: { dayFactor: 0.2 },
      });
      LB.colMM(T.x0, BASE_H, T.z0, T.x1, SH + 1.3, T.z1, { walkable: false });
      LB.colMM(T.x0 + 1, SH + 1.3, T.z0 + 1, T.x1 - 1, TH1 + 1.4, T.z1 - 1, {
        walkable: false,
      });
      LB.colMM(T2.x0, TH1 + 1.4, T2.z0, T2.x1, PY1, T2.z1, { walkable: false });
      // ---- the Broadway portal: a three-storey pointed arch with tracery tympanum, the pried-open bronze doors
      const OW = 4.4,
        OH = 8.2,
        FW = 8.2,
        FH = 10.6,
        FD = 0.9;
      {
        const sh = new THREE.Shape();
        sh.moveTo(-FW / 2, 0);
        sh.lineTo(FW / 2, 0);
        sh.lineTo(FW / 2, FH - 1.6);
        sh.lineTo(0, FH);
        sh.lineTo(-FW / 2, FH - 1.6);
        sh.closePath();
        const spring = OH - OW * 0.8,
          hl = new THREE.Path();
        hl.moveTo(-OW / 2, 0);
        hl.lineTo(OW / 2, 0);
        hl.lineTo(OW / 2, spring);
        hl.quadraticCurveTo(OW / 2, OH - OW * 0.15, 0, OH);
        hl.quadraticCurveTo(-OW / 2, OH - OW * 0.15, -OW / 2, spring);
        hl.lineTo(-OW / 2, 0);
        sh.holes.push(hl);
        b.add(
          "limestone",
          new THREE.ExtrudeGeometry(sh, {
            depth: FD,
            bevelEnabled: false,
            curveSegments: 10,
          }),
          { m: LB.m4(X1, 0, ZC, Math.PI / 2), grime: 0.55, aoH: 3 },
        );
        // recessed archivolt rings
        for (let k = 1; k <= 3; k++) {
          const w = OW + k * 0.5,
            h = OH + k * 0.45;
          const ring = new THREE.Shape();
          const sp2 = h - w * 0.8;
          ring.moveTo(-w / 2, sp2);
          ring.quadraticCurveTo(-w / 2, h - w * 0.15, 0, h);
          ring.quadraticCurveTo(w / 2, h - w * 0.15, w / 2, sp2);
          ring.lineTo(w / 2 - 0.18, sp2);
          ring.quadraticCurveTo(w / 2 - 0.18, h - 0.18 - w * 0.15, 0, h - 0.18);
          ring.quadraticCurveTo(
            -w / 2 + 0.18,
            h - 0.18 - w * 0.15,
            -w / 2 + 0.18,
            sp2,
          );
          ring.closePath();
          b.add(
            "terracotta",
            new THREE.ExtrudeGeometry(ring, {
              depth: 0.14,
              bevelEnabled: false,
              curveSegments: 8,
            }),
            { m: LB.m4(X1 + FD, 0, ZC, Math.PI / 2), grime: 0.4 },
          );
        }
        for (const s of [-1, 1]) {
          // clustered colonnettes on the jambs + crocketed pinnacles on the frame shoulders
          for (let k = 0; k < 3; k++)
            b.cyl(
              "limestone",
              X1 + FD + 0.05,
              0,
              ZC + s * (OW / 2 + 0.25 + k * 0.28),
              0.12,
              0.14,
              OH - OW * 0.8,
              8,
              { hSeg: 2 },
            );
          K.pinnacle(
            b,
            "terracotta",
            X1 + FD / 2,
            FH - 1.6,
            ZC + s * (FW / 2 - 0.4),
            0.8,
            3.6,
            { spireKey: "copper_roof" },
          );
        }
        LB.colMM(X1, 0, ZC - FW / 2, X1 + FD, FH, ZC - OW / 2, {
          walkable: false,
        });
        LB.colMM(X1, 0, ZC + OW / 2, X1 + FD, FH, ZC + FW / 2, {
          walkable: false,
        });
        // tympanum: glass tracery above a transom, the doors below (boarded — the raiders pried a gap, see landmark_interiors)
        K.lancet(
          b,
          "glass_dark",
          null,
          X1 + 0.04,
          3.4,
          ZC,
          OW,
          OH - 3.4,
          Math.PI / 2,
        );
        b.box("bronze", X1 + 0.1, 3.2, ZC, 0.16, 0.25, OW, { seg: false });
        for (const dz of [-1.1, 0, 1.1])
          b.box(
            "bronze",
            X1 + 0.08,
            3.4,
            ZC + dz,
            0.08,
            OH - 3.6 - Math.abs(dz) * 0.8,
            0.09,
            { seg: false },
          );
        b.quad("planks", X1 + 0.03, 1.6, ZC, OW - 0.2, 3.2, {
          ry: Math.PI / 2,
          uv: "box",
        });
        const wwK = LB.texMat(
          "wool_name",
          LB.signTex(
            "wool_name",
            ["WOOLWORTH BUILDING"],
            "engraved",
            1024,
            96,
            { bg: "#d8ceb4", size: 60 },
          ),
        );
        b.quad(wwK, X1 + 0.08, GF - 0.45, ZC + 6.6, 3.8, 0.42, {
          ry: Math.PI / 2,
        });
        b.quad(wwK, X1 + 0.08, GF - 0.45, ZC - 6.6, 3.8, 0.42, {
          ry: Math.PI / 2,
        });
      }
      for (const s of [-1, 1]) {
        // shop arches either side of the portal on the tower's Broadway face
        K.lancet(
          b,
          s < 0 ? "glass_broken" : "planks",
          "limestone",
          X1 + 0.16,
          0.5,
          ZC + s * 6.6,
          3.0,
          4.6,
          Math.PI / 2,
        );
      }
      anchors.door = LB.anchor(X1 + 0.06, 0, ZC, -Math.PI / 2);
      anchors.door.w = OW - 0.4;
      anchors.door.h = 3.2;

      // ---- raider camp "Five & Dime of Death": a walled forecourt between the portal and the Broadway sidewalk ----
      const FX = site.x1 - 0.4; // outer wall line (just inside the lot, sidewalk stays clear)
      // The gate is opened wider than the portal frame and the wall either side drops to chest height, so from the
      // Broadway sidewalk (and City Hall Park) the three-storey arch — lit by the raiders' fire barrels — is the focal point.
      const GW = FW / 2 + 1.2; // gate half-width (> the arch frame's)
      LB.scrapWall(b, FX, Z0 + 0.6, FX, ZC - GW - 2.6, 2.8, { seed: 33 });
      LB.scrapWall(b, FX, ZC - GW - 2.6, FX, ZC - GW, 1.9, { seed: 38 });
      LB.scrapWall(b, FX, ZC + GW, FX, ZC + GW + 2.6, 1.9, { seed: 39 });
      LB.scrapWall(b, FX, ZC + GW + 2.6, FX, Z1 - 0.6, 2.8, { seed: 34 });
      LB.scrapWall(b, X1 + 0.3, Z0 + 0.6, FX, Z0 + 0.6, 2.8, { seed: 35 });
      LB.scrapWall(b, X1 + 0.3, Z1 - 0.6, FX, Z1 - 0.6, 2.8, { seed: 36 });
      // gate: two skull-topped posts (no crossbar — nothing crosses the arch in the approach view)
      for (const s of [-1, 1]) {
        b.box("rust", FX, 0, ZC + s * GW, 0.3, 3.6, 0.3, { seg: false });
        b.sphere("bone", FX, 3.75, ZC + s * GW, 0.16, {
          sx: 1,
          sy: 1.1,
          sz: 1.2,
        });
        for (let k = 0; k < 3; k++)
          b.rod(
            "iron",
            V(FX + 0.16, 3.3 - k * 0.5, ZC + s * GW),
            V(FX + 0.16, 2.9 - k * 0.5, ZC + s * GW + s * 0.08),
            0.02,
            4,
          );
      }
      // the raider sign rides the tall north stretch of the wall on its own posts, facing Broadway
      {
        const sz = (Z0 + 0.6 + ZC - GW - 2.6) / 2;
        for (const d of [-1.9, 1.9])
          b.box("rust", FX - 0.1, 0, sz + d, 0.16, 4.9, 0.16, { seg: false });
        const woolK = LB.texMat(
          "wool_raider",
          LB.signTex(
            "wool_raider",
            ["FIVE & DIME", "OF DEATH"],
            "raider",
            512,
            192,
          ),
        );
        b.quad(woolK, FX + 0.02, 3.9, sz, 4.4, 1.65, { ry: Math.PI / 2 });
        b.quad(woolK, FX - 0.22, 3.9, sz, 4.4, 1.65, { ry: -Math.PI / 2 });
      }
      LB.sandbags(b, FX - 1.2, ZC - GW - 2.4, FX - 1.2, ZC - GW - 0.4, 2);
      LB.sandbags(b, FX - 1.2, ZC + GW + 0.4, FX - 1.2, ZC + GW + 2.4, 2);
      // fire barrels flank the portal; their glow washes the tympanum
      LB.barrel(b, X1 + 2.0, 0, ZC - FW / 2 - 0.2, { fire: true });
      LB.barrel(b, X1 + 2.0, 0, ZC + FW / 2 + 0.2, { fire: true });
      LB.glows.push({ pos: V(X1 + 1.6, 5.6, ZC), color: 0xff9a50, size: 7.5 });
      LB.barrel(b, X1 + 2.2, 0, Z1 - 2.6, { fire: true });
      for (let i = 0; i < 3; i++)
        D.mattress(
          b,
          X1 + 1.4 + (i % 2) * 0.2,
          0,
          Z0 + 2.4 + i * 1.3,
          Math.PI / 2 + 0.15 * i,
          0xa89878,
        );
      // cage + skeleton, meat hooks on the portal
      {
        const cx = X1 + 4.2,
          cz = ZC + 6.6;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          b.box(
            "iron",
            cx + Math.cos(a) * 0.9,
            0,
            cz + Math.sin(a) * 0.9,
            0.05,
            2.2,
            0.05,
            { seg: false },
          );
        }
        b.cyl("iron", cx, 2.2, cz, 1.0, 1.0, 0.08, 8, { hSeg: 1 });
        LB.col(cx, cz, 1.9, 1.9, 0, 2.3, 0, { walkable: false });
        LB.skeleton(b, cx, 0.05, cz - 0.1, 1.2);
      }
      for (const dz of [-1.6, -0.8, 0.9]) {
        b.rod(
          "iron",
          V(X1 + FD + 0.2, 6.2, ZC + dz),
          V(X1 + FD + 0.2, 5.2 - Math.abs(dz) * 0.3, ZC + dz),
          0.015,
          4,
        );
        b.add(
          "iron",
          new THREE.TorusGeometry(0.09, 0.015, 3, 8, Math.PI * 1.4),
          {
            m: LB.m4(
              X1 + FD + 0.2,
              5.1 - Math.abs(dz) * 0.3,
              ZC + dz,
              Math.PI / 2,
            ),
          },
        );
      }
      // lookout tower in the forecourt's south corner
      {
        const x = X1 + 4.4,
          z = Z1 - 3.4;
        for (const [dx, dz] of [
          [-1.3, -1.3],
          [1.3, -1.3],
          [-1.3, 1.3],
          [1.3, 1.3],
        ])
          b.box("rust", x + dx, 0, z + dz, 0.2, 6.5, 0.2, { seg: false });
        for (let y = 1.2; y < 6; y += 1.8) {
          b.beam(
            "rust",
            V(x - 1.3, y, z - 1.3),
            V(x + 1.3, y + 1.3, z - 1.3),
            0.08,
          );
          b.beam(
            "rust",
            V(x - 1.3, y, z + 1.3),
            V(x - 1.3, y + 1.3, z - 1.3),
            0.08,
          );
        }
        b.boxMM("planks", x - 1.7, 6.5, z - 1.7, x + 1.7, 6.7, z + 1.7, {
          seg: false,
        });
        LB.scrapWall(b, x + 1.7, z - 1.7, x + 1.7, z + 1.7, 1.2, {
          y: 6.7,
          noCollide: true,
          seed: 37,
        });
        b.box("corrugated", x, 8.4, z, 3.8, 0.12, 3.8, {
          seg: false,
          rx: -0.1,
        });
        LB.colMM(x - 1.7, 0, z - 1.7, x + 1.7, 6.7, z + 1.7, {
          surface: "wood",
        });
        anchors.lookout = LB.anchor(x, 6.7, z, -Math.PI / 2);
      }
      anchors.entrance = LB.anchor(FX + 2.2, 0, ZC, Math.PI / 2);
      anchors.boss = LB.anchor(X1 + 2.6, 0, ZC + 1.2, -Math.PI / 2);
      anchors.spawn1 = LB.anchor(X1 + 4.0, 0, ZC + 2.8);
      anchors.spawn2 = LB.anchor(X1 + 2.6, 0, ZC - 7.5);
      anchors.spawn3 = LB.anchor(FX - 2.2, 0, ZC - 2.4);
      anchors.spawn4 = LB.anchor(X1 + 1.8, 0, Z1 - 7);
      anchors.rooftop = LB.anchor(X0 + 12, BASE_H + 1.2, Z0 + 4);
      anchors.footlocker = LB.anchor(X1 + 1.0, 0, Z0 + 6.4, -Math.PI / 2);
      anchors.loot = anchors.footlocker.clone();
      const g = b.build(root);
      g.name = "woolworth";
      LB.register("woolworth", g, anchors);
      LB.plaque(
        V(X1 + 0.9, 1.4, ZC - FW / 2 - 0.8),
        "Woolworth Building Plaque",
        "\"The Cathedral of Commerce, 1913. Paid for entirely in nickels and dimes. Management regrets that the five-and-dime has been converted to a raider 'Five & Dime of Death'. Prices unchanged.\"",
      );
      LB.onReady.push(() => {
        LB.spawnProp("footlocker", {
          x: anchors.footlocker.x,
          y: 0,
          z: anchors.footlocker.z,
          yaw: -Math.PI / 2,
          loot: "raider_stash",
          owner: "raiders",
        });
      });
    },
    31,
  );

  // =====================================================================
  // CITY HALL + City Hall Park
  // =====================================================================
