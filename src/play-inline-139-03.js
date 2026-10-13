// play-inline-139 03 — math
// Lines 337-1167 of readable/play-inline-139.pretty.js (statement-aligned).
  LB.addBuilder(
    "washington_square",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("washington_square");
      b.ground = 0;
      b.aoH = 2.5;
      const anchors = {};
      // Round 1 refit: the square now sits on the Fifth Avenue axis (site x 86…154, z 407…458). The Arch closes the
      // vista down Fifth Ave at the north edge; the fountain sits on the arch axis (the 2009 realignment) and eight
      // paths radiate from its plaza to the arch, the four corners and the middle of the other three sides — the real
      // park's star plan. Lawns are the wedges between the paths (low hoop fences), corners open into small plazas.
      const SX0 = site.x0,
        SX1 = site.x1,
        SZ0 = site.z0,
        SZ1 = site.z1;
      const CX = site.arch ? site.arch.x : (SX0 + SX1) / 2;
      const AZ = site.arch ? site.arch.z : SZ0 + 4;
      const CZ = Math.min(SZ1 - 17, AZ + 25);
      const PR = 14.5,
        PW = 2.3,
        EDGE = 2.8; // fountain plaza radius, path half-width, perimeter walk
      const RX0 = SX0 + EDGE,
        RX1 = SX1 - EDGE,
        RZ0 = SZ0 + EDGE,
        RZ1 = SZ1 - EDGE;
      // ---- ground: granite-kerbed paving over the whole square
      b.boxMM("sidewalk", SX0, 0, SZ0, SX1, 0.06, SZ1, {
        grime: 0.6,
        noAO: true,
        uvScale: 4,
      });
      for (const [x0, z0, x1, z1] of [
        [SX0, SZ0, SX1, SZ0 + 0.35],
        [SX0, SZ1 - 0.35, SX1, SZ1],
        [SX0, SZ0, SX0 + 0.35, SZ1],
        [SX1 - 0.35, SZ0, SX1, SZ1],
      ])
        b.boxMM("granite", x0, 0.06, z0, x1, 0.16, z1, {
          seg: false,
          grime: 0.5,
        });
      // plaza ring: a slightly darker granite band + kerb round the fountain plaza
      b.lathe(
        "granite",
        [
          [PR - 0.9, 0.06],
          [PR + 0.35, 0.06],
          [PR + 0.35, 0.2],
          [PR - 0.9, 0.09],
        ],
        48,
        CX,
        0,
        CZ,
        { grime: 0.5, noAO: true },
      );
      // ---- the eight radial paths (targets) and the lawn wedges between them
      const targets = [
        [CX, SZ0],
        [SX1, SZ0],
        [SX1, CZ],
        [SX1, SZ1],
        [CX, SZ1],
        [SX0, SZ1],
        [SX0, CZ],
        [SX0, SZ0],
      ];
      const rays = targets
        .map(([x, z]) => {
          const dx = x - CX,
            dz = z - CZ,
            l = Math.hypot(dx, dz);
          return {
            ux: dx / l,
            uz: dz / l,
            a: Math.atan2(dz, dx),
            tx: x,
            tz: z,
          };
        })
        .sort((p, q) => p.a - q.a);
      const cross = (ux, uz, x, z) => ux * (z - CZ) - uz * (x - CX);
      // convex clip (Sutherland–Hodgman) against f(p) >= 0
      const clip = (poly, f) => {
        const out = [];
        for (let i = 0; i < poly.length; i++) {
          const p = poly[i],
            q = poly[(i + 1) % poly.length],
            fp = f(p[0], p[1]),
            fq = f(q[0], q[1]);
          if (fp >= 0) out.push(p);
          if (fp >= 0 !== fq >= 0) {
            const t = fp / (fp - fq);
            out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
          }
        }
        return out;
      };
      // corner plazas (the SW one is the chess plaza): cut each corner at distance d along the diagonal
      const corners = [
        [RX0, RZ0, 8],
        [RX1, RZ0, 8],
        [RX1, RZ1, 8],
        [RX0, RZ1, 15],
      ];
      const cornerCut = corners.map(([x, z, d]) => {
        const dx = CX - x,
          dz = CZ - z,
          l = Math.hypot(dx, dz);
        return (px, pz) => ((px - x) * dx) / l + ((pz - z) * dz) / l - d;
      });
      const lawns = [];
      for (let i = 0; i < rays.length; i++) {
        const r1 = rays[i],
          r2 = rays[(i + 1) % rays.length];
        let poly = [
          [RX0, RZ0],
          [RX1, RZ0],
          [RX1, RZ1],
          [RX0, RZ1],
        ];
        poly = clip(poly, (x, z) => cross(r1.ux, r1.uz, x, z) - PW);
        poly = clip(poly, (x, z) => -cross(r2.ux, r2.uz, x, z) - PW);
        for (const f of cornerCut) poly = clip(poly, f);
        if (poly.length < 3) continue;
        // cut the plaza circle out (the wedge apex lies inside it, so the boundary crosses it exactly twice)
        const RC = PR + 0.9,
          out = (p) => Math.hypot(p[0] - CX, p[1] - CZ) > RC;
        const n = poly.length;
        let s = -1;
        for (let k = 0; k < n; k++)
          if (!out(poly[k]) && out(poly[(k + 1) % n])) {
            s = k;
            break;
          }
        if (s < 0) {
          lawns.push(poly);
          continue;
        }
        const hit = (p, q) => {
          // circle crossing on segment p→q
          let lo = 0,
            hi = 1;
          const ip = out(p);
          for (let it = 0; it < 30; it++) {
            const m = (lo + hi) / 2,
              x = p[0] + (q[0] - p[0]) * m,
              z = p[1] + (q[1] - p[1]) * m;
            if (out([x, z]) === ip) lo = m;
            else hi = m;
          }
          return [p[0] + (q[0] - p[0]) * hi, p[1] + (q[1] - p[1]) * hi];
        };
        const res = [hit(poly[s], poly[(s + 1) % n])];
        let k = (s + 1) % n;
        while (out(poly[k])) {
          res.push(poly[k]);
          if (!out(poly[(k + 1) % n])) break;
          k = (k + 1) % n;
        }
        const e2 = hit(poly[k], poly[(k + 1) % n]);
        res.push(e2);
        const a0 = Math.atan2(e2[1] - CZ, e2[0] - CX),
          a1 = Math.atan2(res[0][1] - CZ, res[0][0] - CX);
        let da = a1 - a0;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        const steps = Math.max(2, Math.ceil(Math.abs(da) / 0.12));
        for (let j = 1; j < steps; j++) {
          const a = a0 + (da * j) / steps;
          res.push([CX + Math.cos(a) * RC, CZ + Math.sin(a) * RC]);
        }
        lawns.push(res);
      }
      const inLawn = (x, z, pad) =>
        lawns.some((p) =>
          G.LAYOUT.pointInPoly(x, z, pad ? K.offsetPoly(p, -pad) : p),
        );
      lawns.forEach((p, li) => {
        K.prism(b, "grass", p, 0.06, 0.13, {
          grime: 0.6,
          noAO: true,
          c: [0xffffff, 0xd6cdb4, 0xece6d0, 0xc4bca4][li % 4],
        }); // per-wedge tone
        const f = K.offsetPoly(p, -0.3);
        LB.railing(b, f.concat([f[0]]), 0.13, 0.42, "iron", { postStep: 1.6 });
      });
      // ---- central fountain (large, dry, toxic puddle) on the arch axis
      K.fountain(b, CX, 0.06, CZ, 9.5, { key: "granite", water: false });
      b.cyl("goo", CX + 1.6, 0.12, CZ + 1.2, 5.2, 5.2, 0.05, 24, { hSeg: 1 });
      b.cyl("granite", CX, 0.06, CZ, 1.1, 1.4, 0.8, 12, { hSeg: 1 });
      b.cyl("granite", CX, 0.86, CZ, 0.45, 0.6, 0.9, 10, { hSeg: 1 });
      b.cyl("rust", CX, 1.76, CZ, 0.12, 0.16, 0.5, 8, { hSeg: 1 });
      LB.col(CX, CZ, 2.4, 2.4, 0, 1.8, 0, { walkable: false });
      try {
        G.world.addRadSource({
          x: CX + 1.6,
          y: 0.3,
          z: CZ + 1.2,
          radius: 5.5,
          strength: 1.2,
        });
      } catch (e) {
        /* */
      }
      // ---- the Arch (north end, closing the vista down Fifth Avenue)
      const AW = 12.4,
        AH = 13.2,
        AD = 3.6,
        OW = 5.6,
        SPR = 6.2;
      const sh = new THREE.Shape();
      sh.moveTo(-AW / 2, 0);
      sh.lineTo(AW / 2, 0);
      sh.lineTo(AW / 2, AH);
      sh.lineTo(-AW / 2, AH);
      sh.closePath();
      const hole = new THREE.Path();
      hole.moveTo(-OW / 2, 0);
      hole.lineTo(OW / 2, 0);
      hole.lineTo(OW / 2, SPR);
      hole.absarc(0, SPR, OW / 2, 0, Math.PI, false);
      hole.lineTo(-OW / 2, 0);
      sh.holes.push(hole);
      const ag = new THREE.ExtrudeGeometry(sh, {
        depth: AD,
        bevelEnabled: false,
        curveSegments: 16,
      });
      b.add("marble", ag, {
        m: LB.m4(CX, 0.06, AZ - AD / 2),
        grime: 0.55,
        aoH: 4,
      });
      for (const face of [-1, 1]) {
        const fz = face < 0 ? AZ - AD / 2 - 0.12 : AZ + AD / 2 + 0.12;
        for (const sx of [-1, 1])
          b.box("marble", CX + sx * (OW / 2 + 1.7), 0.06, fz, 2.6, SPR, 0.25, {
            seg: false,
            grime: 0.5,
          });
        for (let i = 0; i <= 14; i++) {
          const a = (i / 14) * Math.PI;
          const px = CX + Math.cos(a) * (OW / 2 + 0.45),
            py = 0.06 + SPR + Math.sin(a) * (OW / 2 + 0.45);
          b.box("marble", px, py - 0.35, fz, 0.9, 0.7, 0.3, {
            rz: a - Math.PI / 2,
            seg: false,
            grime: 0.3,
          });
        }
        b.box(
          "marble",
          CX,
          SPR + OW / 2 + 0.2,
          fz + face * 0.1,
          0.7,
          1.0,
          0.4,
          { seg: false },
        ); // keystone
        for (const sx of [-1, 1]) {
          // winged Victory in low relief in each spandrel
          const vs = new THREE.Shape();
          vs.moveTo(0, 0);
          vs.quadraticCurveTo(0.9, 0.2, 1.9, 0.9);
          vs.lineTo(2.2, 1.35);
          vs.quadraticCurveTo(2.0, 1.55, 1.75, 1.3);
          vs.lineTo(1.5, 1.2);
          vs.quadraticCurveTo(1.4, 2.4, 0.4, 2.9);
          vs.quadraticCurveTo(0.9, 2.0, 0.9, 1.1);
          vs.quadraticCurveTo(0.4, 0.8, -0.2, 0.35);
          vs.closePath();
          const vg = new THREE.ExtrudeGeometry(vs, {
            depth: 0.18,
            bevelEnabled: true,
            bevelSize: 0.05,
            bevelThickness: 0.05,
            bevelSegments: 1,
            curveSegments: 5,
          });
          const vry = sx > 0 ? 0 : Math.PI;
          const vz =
            face > 0 ? (sx > 0 ? fz : fz + 0.2) : sx > 0 ? fz - 0.2 : fz;
          b.add("marble", vg, {
            m: LB.m4(CX + sx * 2.9, 8.9, vz, vry),
            grime: 0.35,
          });
        }
        // eagle-and-rosette frieze band under the cornice
        for (let k = 0; k < 9; k++)
          b.cyl(
            "marble",
            CX - AW / 2 + 0.9 + (k * (AW - 1.8)) / 8,
            AH - 2.1,
            fz + face * 0.05,
            0.28,
            0.28,
            0.12,
            8,
            { hSeg: 1, rx: Math.PI / 2 },
          );
      }
      b.boxMM(
        "marble",
        CX - AW / 2 - 0.3,
        AH - 1.4,
        AZ - AD / 2 - 0.3,
        CX + AW / 2 + 0.3,
        AH - 0.8,
        AZ + AD / 2 + 0.3,
        { seg: false },
      );
      b.boxMM(
        "marble",
        CX - AW / 2 - 0.5,
        AH,
        AZ - AD / 2 - 0.5,
        CX + AW / 2 + 0.5,
        AH + 0.6,
        AZ + AD / 2 + 0.5,
        { seg: false },
      );
      b.boxMM(
        "marble",
        CX - AW / 2 + 0.2,
        AH + 0.6,
        AZ - AD / 2 + 0.2,
        CX + AW / 2 - 0.2,
        AH + 2.9,
        AZ + AD / 2 - 0.2,
        { seg: false, grime: 0.45 },
      );
      // a chunk of the attic blown off the NE corner, lying at the pier foot
      b.rock("marble", CX + AW / 2 - 0.4, 0.3, AZ + AD / 2 + 1.6, 0.9, {
        flat: 0.6,
        rough: 0.2,
        seed: 7,
      });
      b.rock("marble", CX + AW / 2 + 1.1, 0.2, AZ + AD / 2 + 0.9, 0.55, {
        flat: 0.6,
        rough: 0.2,
        seed: 9,
      });
      const insK = LB.texMat(
        "wsq_ins",
        LB.signTex("wsq_ins", ["WASHINGTON"], "engraved", 1024, 128, {
          bg: "#cfc7b4",
          size: 84,
        }),
      );
      b.quad(insK, CX, AH + 1.75, AZ - AD / 2 + 0.17, 9, 1.1, { ry: Math.PI });
      const ins2 = LB.texMat(
        "wsq_ins2",
        LB.signTex(
          "wsq_ins2",
          ["MDCCLXXXIX · MDCCCLXXXIX"],
          "engraved",
          1024,
          128,
          { bg: "#cfc7b4", size: 60 },
        ),
      );
      b.quad(ins2, CX, AH + 1.75, AZ + AD / 2 - 0.17, 9, 1.1, {});
      // Washington statues on the north pier faces (at War / at Peace)
      for (const sx of [-1, 1]) {
        const px = CX + sx * (OW / 2 + 1.7),
          pz = AZ - AD / 2 - 0.95;
        b.box("marble", px, 0.06, pz, 2.2, 1.8, 1.5, { seg: false });
        b.cyl("marble", px, 1.86, pz, 0.45, 0.6, 2.2, 10, { hSeg: 2 });
        b.sphere("marble", px, 4.3, pz, 0.28, {});
        b.box("marble", px, 3.5, pz, 1.1, 0.5, 0.5, { seg: false });
        b.cyl("marble", px - sx * 0.6, 2.4, pz - 0.2, 0.4, 0.2, 1.6, 6, {
          hSeg: 1,
          rz: sx * 0.2,
        });
        if (sx < 0)
          b.beam(
            "marble",
            V(px + 0.5, 3.6, pz),
            V(px + 0.6, 2.2, pz - 0.4),
            0.08,
          );
        else
          b.box("marble", px + 0.5, 3.4, pz - 0.25, 0.4, 0.5, 0.08, {
            seg: false,
          });
        LB.col(px, pz, 2.2, 1.5, 0, 4.6, 0, { walkable: false });
      }
      LB.colMM(CX - AW / 2, 0, AZ - AD / 2, CX - OW / 2, AH + 3, AZ + AD / 2, {
        walkable: false,
      });
      LB.colMM(CX + OW / 2, 0, AZ - AD / 2, CX + AW / 2, AH + 3, AZ + AD / 2, {
        walkable: false,
      });
      LB.colMM(
        CX - OW / 2,
        SPR + OW / 2,
        AZ - AD / 2,
        CX + OW / 2,
        AH + 3,
        AZ + AD / 2,
        { walkable: false },
      );
      const grK = LB.texMat(
        "wsq_graf",
        LB.signTex(
          "wsq_graf",
          ["WE WATCHED", "THE WRONG SKY"],
          "raider",
          512,
          256,
          { bg: "#c8c0ac", fg: "#6a2a24" },
        ),
      );
      b.quad(grK, CX + OW / 2 + 1.7, 2.6, AZ + AD / 2 + 0.26, 2.4, 1.2, {});
      // ---- furniture: benches round the fountain plaza (between the path mouths), lamps along every path
      const pathAt = (x, z, pad) =>
        rays.some((r) => {
          const t = (x - CX) * r.ux + (z - CZ) * r.uz;
          return t > 0 && Math.abs(cross(r.ux, r.uz, x, z)) < PW + (pad || 0);
        });
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2,
          x = CX + Math.cos(a) * (PR - 1.6),
          z = CZ + Math.sin(a) * (PR - 1.6);
        if (pathAt(x, z, 1.4) || i % 2) continue;
        LB.bench(b, x, 0.06, z, Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI);
      }
      for (const r of rays) {
        const len = Math.hypot(r.tx - CX, r.tz - CZ);
        for (let t = PR + 4, k = 0; t < len - 3; t += 11, k++) {
          const side = k % 2 ? 1 : -1,
            px = -r.uz * side,
            pz = r.ux * side;
          const x = CX + r.ux * t + px * (PW - 0.35),
            z = CZ + r.uz * t + pz * (PW - 0.35);
          LB.lampPost(b, x, 0.06, z, false);
          if (k % 2 === 0 && t + 5 < len - 3)
            LB.bench(
              b,
              CX + r.ux * (t + 5) - px * (PW - 0.5),
              0.06,
              CZ + r.uz * (t + 5) - pz * (PW - 0.5),
              Math.atan2(r.ux, r.uz) + (side > 0 ? -Math.PI / 2 : Math.PI / 2),
            );
        }
      }
      // ---- trees: dead elms in the lawns (collider trunks); the Hangman's Elm in the NW corner
      const r = LB.rng("wsq2");
      const trees = [];
      for (const p of lawns) {
        let minX = 1e9,
          maxX = -1e9,
          minZ = 1e9,
          maxZ = -1e9;
        for (const q of p) {
          minX = Math.min(minX, q[0]);
          maxX = Math.max(maxX, q[0]);
          minZ = Math.min(minZ, q[1]);
          maxZ = Math.max(maxZ, q[1]);
        }
        let placed = 0;
        for (let tries = 0; tries < 40 && placed < 3; tries++) {
          const x = minX + r() * (maxX - minX),
            z = minZ + r() * (maxZ - minZ);
          if (!G.LAYOUT.pointInPoly(x, z, K.offsetPoly(p, -1.6))) continue;
          if (trees.some((t) => Math.hypot(t[0] - x, t[1] - z) < 7)) continue;
          trees.push([x, z]);
          placed++;
          const kind = LB.treeMix(r, [0.6, 0.2, 0.12, 0.08, 0]); // mostly vase elms, as in the real square
          LB.parkTree(b, x, z, {
            kind,
            h: 8 + r() * 6,
            lean: r() < 0.3 ? 0.06 + r() * 0.14 : r() * 0.04,
            seed: Math.round(x * 7 + z),
          });
          if (kind !== "stump")
            LB.col(x, z, 0.7, 0.7, 0, 4, 0, {
              walkable: false,
              surface: "wood",
            });
        }
      }
      // ---- lawn ground variety (round 1 revise): trampled bare patches, straw-pale dead grass, tufts, a glowing puddle,
      // rubble and burrow-rat spoil so no two wedges read as the same flat brown polygon
      lawns.forEach((p, li) => {
        let cx = 0,
          cz = 0;
        for (const q of p) {
          cx += q[0];
          cz += q[1];
        }
        cx /= p.length;
        cz /= p.length;
        const inner = K.offsetPoly(p, -0.8),
          inside = (x, z) => G.LAYOUT.pointInPoly(x, z, inner);
        let minR = 1e9;
        for (let i = 0; i < p.length; i++) {
          const a = p[i],
            c = p[(i + 1) % p.length];
          const ex = c[0] - a[0],
            ez = c[1] - a[1],
            l = Math.hypot(ex, ez) || 1;
          minR = Math.min(
            minR,
            Math.abs(((cx - a[0]) * ez - (cz - a[1]) * ex) / l),
          );
        }
        const R = Math.max(1.5, minR - 1.0);
        LB.blob(
          b,
          "grass",
          cx + (r() - 0.5) * R * 0.5,
          cz + (r() - 0.5) * R * 0.5,
          R * 0.95,
          R * 0.7,
          0.133,
          { ry: r() * 3, c: 0xd8c898, seed: li * 17 + 3, grime: 0.3 },
        );
        LB.blob(
          b,
          "dirt",
          cx + (r() - 0.5) * R * 0.6,
          cz + (r() - 0.5) * R * 0.6,
          R * 0.45,
          R * 0.3,
          0.136,
          { ry: r() * 3, c: 0x7a6650, seed: li * 17 + 5, amp: 0.35 },
        );
        LB.tufts(
          b,
          cx,
          cz,
          R * 1.6,
          Math.round(R * 4),
          li * 31 + 7,
          inside,
          0.09,
        );
        if (li % 3 === 1)
          LB.puddle(
            b,
            cx + (r() - 0.5) * R * 0.5,
            cz + (r() - 0.5) * R * 0.5,
            0.9 + r() * 0.6,
            0.6 + r() * 0.4,
            li * 7 + 1,
            0.085,
          );
        for (let k = 0; k < 3; k++) {
          const a = r() * TAU,
            d = r() * R * 0.9,
            x = cx + Math.cos(a) * d,
            z = cz + Math.sin(a) * d;
          if (inside(x, z))
            b.rock(
              k ? "rubble" : "dirt",
              x,
              0.1,
              z,
              k ? 0.25 + r() * 0.3 : 0.8,
              { flat: k ? 0.6 : 0.35, seed: li * 13 + k },
            );
        }
      });
      // path litter: paper drifts and junk against the bench backs, a toppled lamp, an abandoned shopping cart
      for (const rr of rays) {
        const t = PR + 7 + r() * 8;
        D.papers(
          b,
          CX + rr.ux * t,
          0.07,
          CZ + rr.uz * t,
          2.2,
          6,
          Math.round(t * 13 + rr.a * 100),
        );
      }
      {
        const rr = rays[2],
          t = PR + 12,
          x = CX + rr.ux * t - rr.uz * 1.2,
          z = CZ + rr.uz * t + rr.ux * 1.2;
        b.beam(
          "iron",
          V(x, 0.12, z),
          V(x + rr.ux * 3.8, 0.35, z + rr.uz * 3.8),
          0.1,
          0.1,
          { grime: 0.5 },
        );
        b.cyl(
          "glass_broken",
          x + rr.ux * 4,
          0.3,
          z + rr.uz * 4,
          0.2,
          0.2,
          0.45,
          6,
          { hSeg: 1, rz: 1.5 },
        );
      }
      {
        // Hangman's Elm: a huge gnarled survivor with one long horizontal limb and a frayed rope
        const hx = RX0 + 5.5,
          hz = RZ0 + 4.5;
        b.rod("bark", V(hx, -0.3, hz), V(hx + 0.4, 6.5, hz + 0.3), 0.75, 8, {
          r2: 0.5,
          grime: 0.3,
        });
        b.rod(
          "bark",
          V(hx + 0.4, 6.2, hz + 0.3),
          V(hx + 6.5, 7.6, hz + 1.4),
          0.36,
          6,
          { r2: 0.16, grime: 0.2 },
        );
        b.rod(
          "bark",
          V(hx + 0.4, 6.4, hz + 0.3),
          V(hx - 2.2, 11.5, hz - 1.8),
          0.4,
          6,
          { r2: 0.18, grime: 0.2 },
        );
        b.rod(
          "bark",
          V(hx + 0.4, 6.4, hz + 0.3),
          V(hx + 1.6, 12.5, hz + 2.4),
          0.36,
          6,
          { r2: 0.14, grime: 0.2 },
        );
        for (let i = 0; i < 4; i++) {
          const a = i * 1.7;
          b.rod(
            "bark",
            V(hx, 0.2, hz),
            V(hx + Math.cos(a) * 1.8, -0.2, hz + Math.sin(a) * 1.8),
            0.28,
            5,
            { r2: 0.1 },
          );
        }
        b.rod(
          "fabric",
          V(hx + 5.2, 7.35, hz + 1.15),
          V(hx + 5.2, 4.6, hz + 1.15),
          0.025,
          4,
          { c: 0x8a7a58 },
        );
        b.add("fabric", new THREE.TorusGeometry(0.16, 0.025, 4, 10), {
          m: LB.m4(hx + 5.2, 4.45, hz + 1.15),
          c: 0x8a7a58,
        });
        LB.col(hx, hz, 1.6, 1.6, 0, 6, 0, { walkable: false, surface: "wood" });
        LB.plaque(
          V(hx + 1.6, 1.2, hz + 1.2),
          "Hangman's Elm",
          '"Oldest tree in Manhattan (c. 1679). Tradition holds that no one was ever hanged here." [Scratched into the bronze underneath, in three different hands: 1971. 1974. 1983.]',
        );
      }
      // ---- the chess plaza (SW corner, Chess Charlie's tables)
      {
        const cx0 = RX0,
          cz0 = RZ1,
          dl = Math.hypot(CX - cx0, CZ - cz0),
          dx = (CX - cx0) / dl,
          dz = (CZ - cz0) / dl;
        let first = null,
          n = 0;
        for (const t of [4.5, 9])
          for (const s of [-9, -5.5, 5.5]) {
            const x = cx0 + dx * t - dz * s,
              z = cz0 + dz * t + dx * s;
            if (x < RX0 - 1.2 || z > RZ1 + 1.2 || n >= 5) continue;
            n++;
            if (!first) first = [x, z];
            b.cyl("granite", x, 0.06, z, 0.25, 0.35, 0.72, 8, { hSeg: 1 });
            b.box("granite", x, 0.78, z, 1.1, 0.1, 1.1, { seg: false });
            b.box("paint_cream", x, 0.88, z, 0.7, 0.01, 0.7, { seg: false });
            for (const d of [-1, 1])
              b.cyl("granite", x + d * 1.0, 0.06, z, 0.22, 0.22, 0.45, 8, {
                hSeg: 1,
              });
            LB.col(x, z, 1.1, 1.1, 0, 0.9, 0, { walkable: false });
          }
        const chessK = LB.texMat(
          "wsq_chess",
          LB.signTex(
            "wsq_chess",
            ["CHESS · 1 SCRIP", "NO RAIDERS NO REFUNDS"],
            "enamel",
            512,
            160,
            { bg: "#2b3a2e", fg: "#e8d8a0" },
          ),
        );
        b.box("iron", cx0 + 1.2, 0.06, cz0 - 1.2, 0.08, 2.4, 0.08, {
          seg: false,
        });
        b.quad(chessK, cx0 + 1.2, 2.2, cz0 - 1.14, 1.8, 0.56, {
          ry: Math.atan2(dx, dz),
        });
        anchors.chess = V(first[0] + 1.0, 0, first[1]);
        anchors.chess.yaw = -Math.PI / 2;
      }
      // ---- squatters' camp in the NE corner plaza (tarp lean-tos, fire barrel, mattresses, shopping cart)
      {
        const x0 = RX1 - 6,
          z0 = RZ0 + 5;
        for (const [dx, dz, ry] of [
          [0, 0, 0.3],
          [-4.2, 1.5, -0.4],
        ]) {
          const x = x0 + dx,
            z = z0 + dz,
            c = Math.cos(ry),
            s = Math.sin(ry);
          for (const k of [-1.3, 1.3])
            b.box("rotten", x + c * k, 0.06, z - s * k, 0.1, 1.9, 0.1, {
              seg: false,
            });
          b.box(
            dx ? "corrugated" : "awning_green",
            x + s * 0.8,
            1.35,
            z + c * 0.8,
            3.0,
            0.05,
            2.0,
            { ry, rx: 0.5, seg: false, grime: 0.6 },
          );
          D.mattress(
            b,
            x + s * 0.9,
            0.06,
            z + c * 0.9,
            ry + Math.PI / 2,
            0xa89878,
          );
        }
        LB.barrel(b, x0 - 2, 0.06, z0 + 3.4, { fire: true });
        D.crates(b, x0 + 2.2, 0.06, z0 + 2.4, 2, 77);
        b.box("chrome", x0 - 1.2, 0.35, z0 + 5.6, 0.9, 0.55, 0.6, {
          ry: 0.6,
          seg: false,
          grime: 0.7,
        });
        anchors.camp = V(x0 - 2, 0, z0 + 4.6);
      }
      // ---- burnt-out bus on the south walk, burrow-rat holes, skeletons, billboard
      b.box("paint_orange", CX + 11.5, 0.3, RZ1 - 0.2, 11, 3.0, 2.6, {
        ry: 0.12,
        seg: false,
        grime: 0.85,
        c: 0x6a4a36,
      });
      LB.col(CX + 11.5, RZ1 - 0.2, 11, 2.6, 0, 3.3, 0.12, { surface: "metal" }); // between the S and SE walks (no radial blocked)
      for (let i = 0; i < 6; i++) {
        let x,
          z,
          g = 0;
        do {
          x = RX0 + r() * (RX1 - RX0);
          z = RZ0 + r() * (RZ1 - RZ0);
        } while (!inLawn(x, z, 1.5) && ++g < 30);
        b.rock("dirt", x, -0.4, z, 1.1 + r() * 0.4, {
          flat: 0.4,
          seed: i * 13 + 5,
        });
      }
      for (let i = 0; i < 4; i++)
        LB.skeleton(
          b,
          RX0 + 4 + r() * (RX1 - RX0 - 8),
          0.1,
          RZ0 + 4 + r() * (RZ1 - RZ0 - 8),
          r() * 6,
        );
      LB.billboard(
        b,
        "freedom_flakes",
        CX + 16,
        0.06,
        SZ1 - 1.2,
        Math.PI,
        13,
        5.6,
        4.5,
      );
      D.papers(b, CX, 0.08, CZ - PR - 3, 5, 18, 91);
      // ---- anchors
      anchors.arch = V(CX, 0, AZ + AD / 2 + 3);
      anchors.fountain = V(CX, 0, CZ + PR - 2.5);
      anchors.entrance = V(CX, 0, AZ - AD / 2 - 5);
      anchors.plaza = V(CX, 0, CZ - PR + 2);
      const sp = [];
      for (const p of lawns) {
        let x = 0,
          z = 0;
        for (const q of p) {
          x += q[0];
          z += q[1];
        }
        sp.push(V(x / p.length, 0, z / p.length));
      }
      for (let i = 0; i < 4; i++)
        anchors["spawn" + (i + 1)] =
          sp[(i * 2 + 1) % sp.length] || V(CX + (i - 1.5) * 8, 0, CZ + 10);
      const g = b.build(root);
      g.name = "washington_square";
      LB.register("washington_square", g, anchors);
      LB.plaque(
        V(CX - 3, 1.3, AZ + AD / 2 + 0.3),
        "Arch Dedication",
        '"Erected by the people of New York to commemorate the centennial of Washington\'s inauguration. Minor pitting on the east pier is the result of the Bleecker Street riot of 1966 and is considered historic."',
      );
    },
    40,
  );

  // =====================================================================
  // BATTERY PARK
  // =====================================================================
