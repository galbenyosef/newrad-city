// play-inline-324 04 — seg
// Lines 380-1339 of readable/play-inline-324.pretty.js (statement-aligned).
  PF.addBuilder(
    "high_line",
    function (PF2, site, root) {
      HL.root = root;
      const b = PF.batch("high_line_ext");
      b.ground = 0;
      b.aoH = 4;
      const DY = HL.DY;
      const anchors = {};

      // ---------------- columns ----------------
      // free (non-street) intervals along the deck; columns at their ends and ≤ 10.5 m apart inside
      const colZ = [];
      {
        let z = HL.ZN + 1.5;
        const end = HL.ZS - 1;
        let run = [];
        for (let t = HL.ZN; t <= end; t += 0.5) {
          const free = !inStreet(t, 1.2);
          if (free) run.push(t);
          if ((!free || t >= end) && run.length) {
            const a = run[0] + 0.8,
              c = run[run.length - 1] - 0.8;
            if (c - a > 2) {
              const n = Math.max(1, Math.ceil((c - a) / 10.5));
              for (let k = 0; k <= n; k++) colZ.push(a + ((c - a) * k) / n);
            } else colZ.push((a + c) / 2);
            run = [];
          }
        }
        void z;
      }
      HL.colZ = colZ;
      const GIR_B = DY - 2.45; // girder bottom
      for (const z of colZ) {
        for (const x of [HL.GW, HL.GE]) {
          // concrete footing + riveted base plate
          b.box("concrete", x, -0.2, z, 1.3, 0.55, 1.3, {
            seg: false,
            grime: 0.7,
          });
          b.box("hl_steel_dk", x, 0.35, z, 0.95, 0.12, 0.95, { seg: false });
          // built-up column: core + four angle flanges
          b.box("hl_steel", x, 0.45, z, 0.46, GIR_B - 0.45, 0.46, {
            seg: false,
            grime: 0.55,
          });
          for (const [dx, dz] of [
            [-0.24, -0.24],
            [0.24, -0.24],
            [-0.24, 0.24],
            [0.24, 0.24],
          ])
            b.box("hl_steel", x + dx, 0.45, z + dz, 0.1, GIR_B - 0.45, 0.1, {
              seg: false,
              grime: 0.55,
            });
          // lattice lacing on the column faces
          for (let y = 1.2; y < GIR_B - 0.8; y += 0.9)
            for (const sx of [-1, 1])
              b.beam(
                "hl_steel",
                V3(x + sx * 0.25, y, z - 0.22),
                V3(x + sx * 0.25, y + 0.9, z + 0.22),
                0.05,
                0.02,
                {},
              );
          // knee braces up to the girder
          for (const sz of [-1, 1])
            b.beam(
              "hl_steel",
              V3(x, GIR_B - 1.6, z + sz * 0.25),
              V3(x, GIR_B, z + sz * 1.7),
              0.14,
              0.14,
              {},
            );
          PF.col(x, z, 0.75, 0.75, 0, GIR_B, 0, {
            walkable: false,
            surface: "metal",
          });
        }
        // transverse strut + X-bracing between the column pair
        b.box(
          "hl_steel",
          (HL.GW + HL.GE) / 2,
          GIR_B - 0.55,
          z,
          HL.GE - HL.GW,
          0.45,
          0.3,
          { seg: false },
        );
        b.beam(
          "hl_steel",
          V3(HL.GW + 0.3, GIR_B - 2.6, z),
          V3(HL.GE - 0.3, GIR_B - 0.6, z),
          0.1,
          0.1,
          {},
        );
        b.beam(
          "hl_steel",
          V3(HL.GE - 0.3, GIR_B - 2.6, z),
          V3(HL.GW + 0.3, GIR_B - 0.6, z),
          0.1,
          0.1,
          {},
        );
      }

      // ---------------- girders, deck, fascia ----------------
      const segs = [];
      for (let z = HL.ZN; z < HL.ZS; z += 22)
        segs.push([z, Math.min(HL.ZS, z + 22)]);
      for (const [za, zb] of segs) {
        const len = zb - za,
          zc = (za + zb) / 2;
        for (const x of [HL.GW, HL.GE]) {
          b.box("hl_steel", x, GIR_B, zc, 0.14, 1.95, len, {
            seg: false,
            grime: 0.6,
          }); // web
          b.box("hl_steel", x, GIR_B - 0.05, zc, 0.7, 0.12, len, {
            seg: false,
          }); // bottom flange
          b.box("hl_steel", x, GIR_B + 1.9, zc, 0.7, 0.12, len, { seg: false }); // top flange
          for (let k = 0; k <= len; k += 1.6)
            for (const sx of [-1, 1])
              b.box(
                "hl_steel",
                x + sx * 0.12,
                GIR_B + 0.05,
                za + k,
                0.1,
                1.85,
                0.22,
                { seg: false },
              ); // stiffeners
        }
        // outer fascia plates (the High Line's deep riveted edge beam) with cornice lip
        for (const [x, sx] of [
          [HL.X0, -1],
          [HL.X1, 1],
        ]) {
          b.box("hl_steel", x + sx * 0.05, DY - 1.35, zc, 0.12, 1.2, len, {
            seg: false,
            grime: 0.7,
          });
          b.box("hl_steel_dk", x + sx * 0.12, DY - 0.18, zc, 0.3, 0.2, len, {
            seg: false,
          });
          b.box("hl_steel_dk", x + sx * 0.12, DY - 1.42, zc, 0.26, 0.12, len, {
            seg: false,
          });
        }
        // floor beams + concrete deck + ballast
        for (let k = 0; k < len; k += 2.2)
          b.box(
            "hl_steel_dk",
            (HL.X0 + HL.X1) / 2,
            DY - 1.0,
            za + k + 1.1,
            HL.X1 - HL.X0 - 0.2,
            0.5,
            0.25,
            { seg: false },
          );
        b.boxMM("concrete_dark", HL.X0, DY - 0.55, za, HL.X1, DY - 0.28, zb, {
          segLen: 8,
          grime: 0.8,
        });
        b.boxMM("ballast", HL.X0 + 0.25, DY - 0.28, za, HL.X1 - 0.25, DY, zb, {
          segLen: 8,
          grime: 0.4,
        });
        PF.colMM(HL.X0, DY - 0.6, za, HL.X1, DY, zb, { surface: "rubble" });
      }
      // painted "NEW YORK CENTRAL" lettering on the fascia over every street crossing (both faces)
      const nycKey = PF.ghostKey("nyc_fascia", ["NEW YORK CENTRAL SYSTEM"], {
        w: 1024,
        h: 96,
        bg: "rgba(0,0,0,0)",
        fg: "rgba(230,222,200,0.9)",
      });
      for (const s of STREETS) {
        if (s < HL.ZN + 4 || s > HL.ZS - 4) continue;
        b.quad(nycKey, HL.X1 + 0.12, DY - 0.95, s, 11, 1.0, {
          ry: HP,
          grime: 0.1,
          noAO: true,
        });
        b.quad(nycKey, HL.X0 - 0.12, DY - 0.95, s, 11, 1.0, {
          ry: -HP,
          grime: 0.1,
          noAO: true,
        });
      }
      // north end: bumper post + fence, crossing south: headhouse wall
      b.box(
        "hl_steel_dk",
        (HL.X0 + HL.X1) / 2,
        DY - 1.4,
        HL.ZN - 0.1,
        HL.X1 - HL.X0,
        1.4,
        0.2,
        { seg: false },
      );
      for (const tx of [HL.TW, HL.TE]) {
        b.box("rust", tx, DY, HL.ZN + 1.0, 2.2, 0.9, 0.5, {
          seg: false,
          grime: 0.7,
        });
        b.box("paint_red", tx, DY + 0.9, HL.ZN + 1.0, 2.2, 0.12, 0.5, {
          seg: false,
        });
        PF.col(tx, HL.ZN + 1.0, 2.2, 0.5, DY, DY + 1.0, 0, {
          walkable: false,
          surface: "metal",
        });
      }

      // ---------------- tracks ----------------
      const rT = PF.rng("hl_ties");
      for (const tx of [HL.TW, HL.TE]) {
        for (let z = HL.ZN + 2.5; z < HL.ZS - 0.5; z += 0.62) {
          if (rT() < 0.08) continue; // missing tie
          b.box(
            "tie_wood",
            tx + (rT() - 0.5) * 0.1,
            DY - 0.08,
            z,
            2.5,
            0.2,
            0.22,
            { ry: (rT() - 0.5) * 0.08, seg: false, grime: 0.6 },
          );
        }
        for (const sx of [-0.72, 0.72]) {
          for (let z = HL.ZN + 2.5; z < HL.ZS - 0.5; z += 12) {
            const z2 = Math.min(HL.ZS - 0.5, z + 12);
            if (rT() < 0.06) continue; // pulled rail length (scavenged)
            b.boxMM(
              "rail",
              tx + sx - 0.04,
              DY + 0.1,
              z,
              tx + sx + 0.04,
              DY + 0.28,
              z2 - 0.05,
              { seg: false, grime: 0.3 },
            );
            b.boxMM(
              "rail",
              tx + sx - 0.07,
              DY + 0.1,
              z,
              tx + sx + 0.07,
              DY + 0.14,
              z2 - 0.05,
              { seg: false, grime: 0.3 },
            );
          }
        }
      }

      // ---------------- Art Deco railings (both edges) ----------------
      const gapsE = [
        [-31.2, -27.4],
        [HL.SPUR_Z0, HL.SPUR_Z1],
        [194.0, 197.8],
      ]; // stair landings + spur
      const inGap = (z, gaps) =>
        gaps.some((g) => z > g[0] - 0.05 && z < g[1] + 0.05);
      for (const [x, gaps] of [
        [HL.X0 + 0.15, []],
        [HL.X1 - 0.15, gapsE],
      ]) {
        for (let z = HL.ZN; z < HL.ZS - 0.1; z += 2) {
          const z2 = Math.min(HL.ZS, z + 2);
          if (inGap((z + z2) / 2, gaps)) continue;
          // bent rail: posts, top and bottom rails, sunburst diagonals, centre ring
          b.box("hl_steel_dk", x, DY, z, 0.1, 1.25, 0.1, {
            seg: false,
            grime: 0.3,
          });
          b.box("hl_steel_dk", x, DY + 1.18, (z + z2) / 2, 0.12, 0.08, z2 - z, {
            seg: false,
          });
          b.box("hl_steel_dk", x, DY + 0.18, (z + z2) / 2, 0.08, 0.06, z2 - z, {
            seg: false,
          });
          const zm = (z + z2) / 2;
          b.beam(
            "hl_steel_dk",
            V3(x, DY + 0.2, z + 0.1),
            V3(x, DY + 1.15, zm),
            0.035,
            0.035,
            {},
          );
          b.beam(
            "hl_steel_dk",
            V3(x, DY + 0.2, z2 - 0.1),
            V3(x, DY + 1.15, zm),
            0.035,
            0.035,
            {},
          );
          b.beam(
            "hl_steel_dk",
            V3(x, DY + 0.2, zm),
            V3(x, DY + 1.15, zm),
            0.035,
            0.035,
            {},
          );
          const ring = new THREE.TorusGeometry(0.2, 0.025, 3, 10);
          ring.rotateY(HP);
          b.add("hl_steel_dk", ring, {
            m: PF.m4(x, DY + 0.68, zm),
            grime: 0.3,
          });
        }
        // colliders in long runs between gaps
        let za = HL.ZN;
        const cuts = gaps.slice().sort((p, q) => p[0] - q[0]);
        for (const g of cuts.concat([[HL.ZS, HL.ZS]])) {
          if (g[0] - za > 0.5)
            PF.colMM(x - 0.12, DY - 0.2, za, x + 0.12, DY + 1.4, g[0], {
              walkable: false,
              surface: "metal",
            });
          za = g[1];
        }
      }

      // ---------------- overgrowth: meadow beds, shrubs, trees, vines ----------------
      const rG = PF.rng("hl_green");
      for (let z = HL.ZN + 3; z < HL.ZS - 3; z += 6) {
        // edge planting strips between the rails and the railings, and patches over the tracks
        // grassy soil beds (low mounds textured with dead grass) under the blades: the Line's self-sown meadow
        b.rock("weeds", (HL.X0 + HL.TW - 1.1) / 2, DY - 0.12, z + 3, 1, {
          ry: 0.001,
          sx: 1.25,
          sy: 0.22,
          sz: 3.4,
          rough: 0.35,
          detail: 1,
          seed: z * 3 + 1,
          grime: 0.25,
        });
        b.rock("weeds", (HL.TE + 1.1 + HL.X1) / 2, DY - 0.12, z + 3, 1, {
          ry: 0.001,
          sx: 1.25,
          sy: 0.22,
          sz: 3.4,
          rough: 0.35,
          detail: 1,
          seed: z * 3 + 2,
          grime: 0.25,
        });
        if (rG() < 0.5)
          b.rock("weeds", (HL.TW + HL.TE) / 2, DY - 0.15, z + 3, 1, {
            ry: 0.001,
            sx: 1.6,
            sy: 0.2,
            sz: 2.2 + rG() * 1.6,
            rough: 0.4,
            detail: 1,
            seed: z * 3 + 3,
            grime: 0.3,
          });
        if (rG() < 0.3)
          b.rock("weeds", HL.TW + (rG() - 0.5) * 1.2, DY - 0.12, z + 3, 1, {
            ry: 0.001,
            sx: 1.3,
            sy: 0.24,
            sz: 2.4,
            rough: 0.4,
            detail: 1,
            seed: z * 3 + 4,
            grime: 0.3,
          });
        if (rG() < 0.3)
          b.rock("weeds", HL.TE + (rG() - 0.5) * 1.2, DY - 0.12, z + 3, 1, {
            ry: 0.001,
            sx: 1.3,
            sy: 0.24,
            sz: 2.4,
            rough: 0.4,
            detail: 1,
            seed: z * 3 + 5,
            grime: 0.3,
          });
        meadow(b, HL.X0 + 0.3, z, HL.TW - 1.4, z + 6, DY, 1.0, "m" + z);
        meadow(b, HL.TE + 1.4, z, HL.X1 - 0.3, z + 6, DY, 1.0, "n" + z);
        if (rG() < 0.55)
          meadow(b, HL.TW - 1.5, z, HL.TE + 1.5, z + 6, DY, 0.6, "c" + z);
        if (rG() < 0.35)
          b.rock(
            "nest",
            HL.X0 + 1 + rG() * 11,
            DY - 0.18,
            z + rG() * 6,
            1.3 + rG(),
            { flat: 0.18, rough: 0.3, detail: 1, seed: z },
          );
        if (rG() < 0.7)
          shrub(
            b,
            HL.X0 + 0.9 + rG() * 1.2,
            DY,
            z + rG() * 5,
            0.9 + rG() * 0.9,
            3000 + z,
          );
        if (rG() < 0.7)
          shrub(
            b,
            HL.X1 - 0.9 - rG() * 1.2,
            DY,
            z + rG() * 5,
            0.9 + rG() * 0.9,
            4000 + z,
          );
      }
      for (let i = 0; i < 26; i++) {
        const z = HL.ZN + 6 + i * 11.5 + rG() * 5;
        if (z > HL.ZS - 6) break;
        if (z > 104 && z < 128) continue; // toll gate clearing
        tree(
          b,
          rG() < 0.5 ? HL.X0 + 1.2 : HL.X1 - 1.2,
          DY,
          z,
          3.2 + rG() * 2.8,
          500 + i,
        );
      }
      for (let i = 0; i < 70; i++) {
        // vines trailing over the fascia
        const z = HL.ZN + 2 + rG() * (HL.ZS - HL.ZN - 4);
        const x = rG() < 0.5 ? HL.X0 - 0.18 : HL.X1 + 0.18;
        const L = 0.8 + rG() * 3.2;
        for (let k = 0; k < 3; k++)
          b.beam(
            "leaf",
            V3(x, DY + 0.2, z + k * 0.25),
            V3(
              x + (rG() - 0.5) * 0.2,
              DY - L * (0.6 + rG() * 0.4),
              z + k * 0.25 + (rG() - 0.5) * 0.4,
            ),
            0.06,
            0.03,
            { noAO: true, grime: 0.1 },
          );
      }

      // ---------------- stranded freight cars ----------------
      boxcar(b, HL.TW, HL.RAIL, 64, 0, { num: 174022, doorOpen: 1 });
      boxcar(b, HL.TW, HL.RAIL, 77.4, 0, { num: 174387 });
      boxcar(b, HL.TE, HL.RAIL, 150, 0, { flat: true });
      D_crates(b, HL.TE, HL.RAIL + 1.35, 150);
      boxcar(b, HL.TE - 0.6, HL.RAIL + 0.35, 212, 0.06, {
        num: 170911,
        tipped: 0.22,
        mat: "rust",
      });
      boxcar(b, HL.TW, HL.RAIL, 252, 0, {
        num: 88,
        mark: "NBC",
        mat: "boxcar_yel",
        doorOpen: 1,
      });
      for (const [x, z, w, l] of [
        [HL.TW, 64, 3.1, 12.6],
        [HL.TW, 77.4, 3.1, 12.6],
        [HL.TE, 150, 3.1, 12.6],
        [HL.TE - 0.6, 212, 3.2, 12.6],
        [HL.TW, 252, 3.1, 12.6],
      ]) {
        PF.col(x, z, w, l, DY, z === 150 ? DY + 1.6 : DY + 4.6, 0, {
          surface: "metal",
        });
      }
      // Chocolate Zeppelin reefer car sign
      const reeferKey = PF.ghostKey(
        "reefer_nbc",
        ["Chocolate Zeppelin", "LIGHTER THAN AIR"],
        { w: 1024, h: 256, bg: "rgba(0,0,0,0)", fg: "rgba(84,46,28,0.95)" },
      );
      b.quad(reeferKey, HL.TW + 1.58, HL.RAIL + 3.0, 249.5, 5.2, 1.3, {
        ry: HP,
        grime: 0.2,
        noAO: true,
      });
      b.quad(reeferKey, HL.TW - 1.58, HL.RAIL + 3.0, 254.5, 5.2, 1.3, {
        ry: -HP,
        grime: 0.2,
        noAO: true,
      });

      // ---------------- raider toll gate (z ≈ 116) ----------------
      const TZ = 116;
      PF.scrapWall(b, HL.X0 + 0.3, TZ, -306.4, TZ, 2.9, { y: DY, seed: 71 });
      PF.scrapWall(b, -303.4, TZ, HL.X1 - 0.3, TZ, 2.9, { y: DY, seed: 72 });
      // gate frame with a hanging sign + chained skeleton
      for (const x of [-306.3, -303.5])
        b.box("rust", x, DY, TZ, 0.25, 4.2, 0.25, { seg: false });
      b.box("rust", -304.9, DY + 4.0, TZ, 3.4, 0.25, 0.3, { seg: false });
      const tollKey = PF.texMat(
        "hl_toll",
        PF.signTex(
          "hl_toll",
          ["HIGH LINE TOLL", "20 SCRIP OR WALK DOWN"],
          "raider",
          512,
          192,
        ),
        { rough: 0.9 },
      );
      b.quad(tollKey, -304.9, DY + 3.35, TZ + 0.2, 2.8, 1.05, {
        ry: 0,
        grime: 0.3,
      });
      b.quad(tollKey, -304.9, DY + 3.35, TZ - 0.2, 2.8, 1.05, {
        ry: PI,
        grime: 0.3,
      });
      // watch platform on scaffold
      const WX = -310.2,
        WZ = TZ + 3.2;
      for (const [dx, dz] of [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ])
        b.box("rust", WX + dx * 0.9, DY, WZ + dz * 0.9, 0.12, 3.2, 0.12, {
          seg: false,
        });
      b.box("planks", WX, DY + 3.0, WZ, 2.2, 0.12, 2.2, { seg: false });
      PF.col(WX, WZ, 2.2, 2.2, DY + 2.9, DY + 3.12, 0, { surface: "wood" });
      for (let k = 0; k < 9; k++)
        b.box(
          "rust",
          WX + 1.02,
          DY + 0.3 + k * 0.33,
          WZ - 0.6 + 0 * k,
          0.05,
          0.05,
          0.5,
          { seg: false },
        ); // ladder rungs
      PF.stairs(b, "rust", WX + 1.4, WZ + 1.2, PI, 0.6, 2.4, DY, DY + 3.0, {
        noCollide: false,
        base: DY - 0.05,
      });
      PF.sandbags(b, WX - 1.1, WZ - 1.1, WX + 1.1, WZ - 1.1, 2, {
        y: DY + 3.12,
        noCollide: true,
      });
      // barrels, fire, sandbag nest, mattresses, graffiti
      PF.barrel(b, -306.9, DY, TZ - 1.4, { fire: true });
      PF.barrel(b, -302.6, DY, TZ + 1.5, { fire: true });
      PF.sandbags(b, -307.4, TZ - 3.2, -305.6, TZ - 3.2, 3, { y: DY });
      PF.sandbags(b, -304.0, TZ - 3.2, -302.2, TZ - 3.2, 3, { y: DY });
      PF.dress.mattress(b, -310.8, DY, TZ + 7, 0.2);
      PF.dress.mattress(b, -309.4, DY, TZ + 8.6, -0.1, 0x8a7060);
      PF.dress.crates(b, -300.5, DY, TZ + 6, 2, 11);
      // hanging skeleton on the fascia (warning to toll dodgers)
      {
        const x = HL.X1 + 0.4,
          z = TZ - 6,
          top = DY + 1.2;
        b.beam(
          "rope",
          V3(x - 0.3, top, z),
          V3(x, top - 1.6, z),
          0.03,
          0.03,
          {},
        );
        const M = PF.m4(x, top - 3.4, z, HP);
        const add = (geo, m) =>
          b.add("bone", geo, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.3,
          });
        add(new THREE.SphereGeometry(0.11, 7, 5), PF.m4(0, 1.62, 0));
        for (let i = 0; i < 5; i++)
          add(
            new THREE.TorusGeometry(0.13 - i * 0.008, 0.012, 3, 8, PI),
            PF.m4(0, 1.35 - i * 0.07, 0, 0, HP),
          );
        add(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), PF.m4(0, 1.15, 0));
        add(new THREE.BoxGeometry(0.28, 0.1, 0.14), PF.m4(0, 0.85, 0));
        for (const sx of [-1, 1]) {
          add(
            new THREE.CylinderGeometry(0.022, 0.018, 0.85, 4),
            PF.m4(sx * 0.1, 0.4, 0),
          );
          add(
            new THREE.CylinderGeometry(0.018, 0.015, 0.6, 4),
            PF.m4(sx * 0.22, 1.1, 0, 0, 0, sx * 0.2),
          );
        }
        const dodger = PF.texMat(
          "hl_dodger",
          PF.signTex("hl_dodger", ["DIDNT PAY"], "raider", 256, 96),
          {},
        );
        b.quad(dodger, x + 0.16, top - 2.3, z, 0.8, 0.3, {
          ry: HP,
          grime: 0.3,
        });
      }
      // raider graffiti on the girder web at the gate and on columns
      const graf1 = PF.texMat(
        "hl_graf1",
        PF.graffitiTex("hl_graf1", ["CONDUCTORS"], 512, 160, {
          color: "#d8302a",
          outline: "#1a0e08",
          tag: "skull",
        }),
        { transparent: true, noShadow: true },
      );
      const graf2 = PF.texMat(
        "hl_graf2",
        PF.graffitiTex("hl_graf2", ["ALL ABOARD", "OR ELSE"], 512, 200, {
          color: "#e8d040",
          outline: "#1a0e08",
        }),
        { transparent: true, noShadow: true },
      );
      b.quad(graf1, HL.X1 + 0.2, DY - 1.0, 100, 4, 1.25, {
        ry: HP,
        noAO: true,
        grime: 0,
      });
      b.quad(graf2, HL.X0 - 0.2, DY - 1.0, 128, 4, 1.5, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      b.quad(graf1, HL.TW - 1.58 + 0.03, HL.RAIL + 2.3, 80, 3.2, 1.0, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      anchors.toll_gate = PF.anchor(-304.9, DY, TZ + 2, 0);
      anchors.sniper = PF.anchor(WX, DY + 3.12, WZ, PI);

      // raider camp near the south end: lean-to under a tarp, cook fire, loot
      {
        const cz = 262;
        for (const [x, z] of [
          [-310.8, cz - 3],
          [-306.8, cz - 3],
          [-310.8, cz + 3],
          [-306.8, cz + 3],
        ])
          b.box("rust", x, DY, z, 0.12, 2.6, 0.12, { seg: false });
        b.box("tent", -308.8, DY + 2.5, cz, 4.4, 0.06, 6.4, {
          rz: 0.08,
          seg: false,
          grime: 0.7,
        });
        PF.dress.mattress(b, -310, DY, cz - 1, 0);
        PF.dress.mattress(b, -307.6, DY, cz + 1.2, 0.1, 0x9a7a60);
        PF.barrel(b, -304.3, DY, cz - 1.6, { fire: true });
        PF.dress.crates(b, -300.6, DY, cz + 4.5, 3, 31);
        anchors.camp = PF.anchor(-306, DY, cz, PI);
      }

      // ---------------- access stairs (north + south) ----------------
      const stair = (zBase, dir, landZ0, landZ1) => {
        const sx = -297.6,
          w = 2.3;
        // steel stair climbing in +Z (dir=1) or -Z (dir=-1)
        const run = 25 * 0.34;
        PF.steelStair(b, sx, zBase, dir > 0 ? 0 : PI, w, run, 0.02, DY, {
          key: "hl_steel",
          tread: "diamond",
          railKey: "hl_steel_dk",
        });
        // support posts under the stringers
        for (let k = 1; k <= 3; k++) {
          const t = k / 4;
          for (const ox of [-w / 2, w / 2])
            b.box(
              "hl_steel",
              sx + ox,
              0,
              zBase + dir * run * t,
              0.14,
              DY * t - 0.1,
              0.14,
              { seg: false },
            );
        }
        // landing to the deck
        b.boxMM("diamond", -299.2, DY - 0.08, landZ0, -296.3, DY, landZ1, {
          seg: false,
        });
        b.boxMM(
          "hl_steel",
          -299.2,
          DY - 0.45,
          landZ0,
          -296.3,
          DY - 0.08,
          landZ1,
          { seg: false },
        );
        PF.colMM(-299.2, DY - 0.5, landZ0, -296.3, DY, landZ1, {
          surface: "metal",
        });
        for (const x of [-296.4])
          PF.rail(b, x, landZ0, x, landZ1, DY, { key: "hl_steel_dk" });
        PF.rail(
          b,
          -296.4,
          dir > 0 ? landZ1 : landZ0,
          -299.2,
          dir > 0 ? landZ1 : landZ0,
          DY,
          { key: "hl_steel_dk" },
        );
        for (const z of [landZ0, landZ1])
          b.box("hl_steel", -296.5, 0, z, 0.16, DY - 0.45, 0.16, {
            seg: false,
          });
        // street-level gate (raider chain across, sign)
        const gz = zBase - dir * 0.6;
        for (const ox of [-1.35, 1.35])
          b.box("rust", sx + ox, 0, gz, 0.14, 2.2, 0.14, { seg: false });
        b.box("rust", sx, 2.1, gz, 2.9, 0.16, 0.16, { seg: false });
        const sk = PF.texMat(
          "hl_stair_sign",
          PF.signTex(
            "hl_stair_sign",
            ["HIGH LINE", "STAIR — TRACK LEVEL"],
            "enamel",
            512,
            192,
            { bg: "#1e3a2a" },
          ),
          {},
        );
        b.quad(sk, sx, 2.65, gz - dir * 0.1, 1.9, 0.72, {
          ry: dir > 0 ? PI : 0,
          grime: 0.3,
        });
        b.box("rust", sx, 2.2, gz, 0.1, 0.1, 0.1, { seg: false });
      };
      // north: base at z = -39.6 climbing south to z = -31.1, landing -31.1 .. -27.6
      stair(-39.6, 1, -31.2, -27.4);
      // south: base at z = 185.6 climbing south to 194.1, landing 194.0 .. 197.8
      stair(185.6, 1, 194.0, 197.8);
      anchors.stair_north = PF.anchor(-297.6, 0, -41, PI);
      anchors.stair_south = PF.anchor(-297.6, 0, 184, PI);
      anchors.deck_north = PF.anchor(-305.5, DY, -30, PI);
      anchors.deck_south = PF.anchor(-305.5, DY, 266, 0);

      // ---------------- spur truss into the Nabisco factory ----------------
      {
        const z0 = HL.SPUR_Z0,
          z1 = HL.SPUR_Z1,
          xa = HL.X1,
          xb = HL.SPUR_X1,
          zc = (z0 + z1) / 2;
        b.boxMM(
          "concrete_dark",
          xa,
          DY - 0.55,
          z0 + 0.4,
          xb,
          DY - 0.28,
          z1 - 0.4,
          { segLen: 8 },
        );
        b.boxMM("ballast", xa, DY - 0.28, z0 + 0.6, xb, DY, z1 - 0.6, {
          segLen: 8,
        });
        PF.colMM(xa - 0.5, DY - 0.6, z0 + 0.4, xb, DY, z1 - 0.4, {
          surface: "rubble",
        });
        // single track curving off the east main track
        for (let x = xa + 0.4; x < xb - 0.3; x += 0.62)
          b.box("tie_wood", x, DY - 0.08, zc, 0.22, 0.2, 2.5, {
            seg: false,
            grime: 0.6,
          });
        for (const sz of [-0.72, 0.72])
          b.boxMM(
            "rail",
            xa - 2,
            DY + 0.1,
            zc + sz - 0.04,
            xb - 0.2,
            DY + 0.28,
            zc + sz + 0.04,
            { seg: false },
          );
        // Warren through-truss: bottom chords, top chords, diagonals, portal bracing
        const TH = 4.6;
        for (const z of [z0 + 0.3, z1 - 0.3]) {
          b.boxMM("hl_steel", xa, DY - 1.4, z - 0.2, xb, DY + 0.35, z + 0.2, {
            segLen: 6,
          });
          b.boxMM(
            "hl_steel",
            xa + 3,
            DY + TH - 0.35,
            z - 0.25,
            xb - 3,
            DY + TH,
            z + 0.25,
            { segLen: 6 },
          );
          const n = 6,
            dx = (xb - xa) / n;
          for (let i = 0; i < n; i++) {
            const x0 = xa + i * dx,
              x1 = x0 + dx;
            const up =
              i === 0 ? V3(x0 + 3, DY + TH - 0.2, z) : V3(x0, DY + TH - 0.2, z);
            b.beam(
              "hl_steel",
              V3(x0, DY + 0.3, z),
              i === 0 ? up : V3(x0, DY + TH - 0.2, z),
              0.28,
              0.32,
              {},
            );
            b.beam(
              "hl_steel",
              V3(i === 0 ? x0 + 3 : x0, DY + TH - 0.2, z),
              V3(x1, DY + 0.3, z),
              0.22,
              0.28,
              {},
            );
            if (i === n - 1)
              b.beam(
                "hl_steel",
                V3(x1, DY + 0.3, z),
                V3(x1 - 3, DY + TH - 0.2, z),
                0.28,
                0.32,
                {},
              );
          }
          PF.colMM(xa, DY, z - 0.25, xb, DY + 1.3, z + 0.25, {
            walkable: false,
            surface: "metal",
          });
        }
        for (let x = xa + 4; x < xb - 3; x += 5.2) {
          b.boxMM(
            "hl_steel",
            x - 0.12,
            DY + TH - 0.3,
            z0 + 0.3,
            x + 0.12,
            DY + TH,
            z1 - 0.3,
            { seg: false },
          );
          b.beam(
            "hl_steel",
            V3(x, DY + TH - 0.3, z0 + 0.4),
            V3(x + 2.6, DY + TH - 0.3, z1 - 0.4),
            0.08,
            0.08,
            {},
          );
        }
        // portal sign over the spur
        const spurKey = PF.texMat(
          "hl_spur",
          PF.signTex(
            "hl_spur",
            ["NATIONAL BISCUIT CO.", "PRIVATE SIDING — CLEARANCE 15 FT"],
            "enamel",
            768,
            160,
            { bg: "#2a2e2a" },
          ),
          {},
        );
        b.quad(spurKey, xa - 3 + 0.2 + 3.5, DY + TH + 0.55, zc, 7.5, 1.55, {
          ry: -HP,
          grime: 0.3,
        });
        // under-bridge girder supports at the building end + the deck side column
        for (const zz of [z0 + 1, z1 - 1]) {
          b.box("hl_steel", xb - 1.6, 0, zz, 0.5, DY - 1.4, 0.5, {
            seg: false,
          });
          PF.col(xb - 1.6, zz, 0.6, 0.6, 0, DY - 1.4, 0, {
            walkable: false,
            surface: "metal",
          });
        }
        anchors.spur = PF.anchor(xb + 3, DY, zc, -HP);
        // the vines love the truss
        for (let i = 0; i < 18; i++) {
          const x = xa + 2 + rG() * (xb - xa - 4),
            z = rG() < 0.5 ? z0 + 0.3 : z1 - 0.3;
          b.beam(
            "leaf",
            V3(x, DY + TH - 0.2, z),
            V3(x + (rG() - 0.5) * 0.4, DY + TH - 1.5 - rG() * 2.5, z),
            0.07,
            0.04,
            { noAO: true, grime: 0.1 },
          );
        }
      }

      // ---------------- headhouse: St. John's Park Freight Terminal ----------------
      const hh = buildHeadhouse(b, anchors);

      // street-level clutter beneath the viaduct (between the columns, off the roads)
      const rS = PF.rng("hl_street");
      for (let i = 0; i < 12; i++) {
        const z = HL.ZN + 6 + rS() * (HL.ZS - HL.ZN - 12);
        if (inStreet(z, 3)) continue;
        const x = -305 + (rS() - 0.5) * 8;
        const k = rS();
        if (k < 0.3) PF.car(b, x, 0, z, (rS() - 0.5) * 0.5, { seed: i + 9 });
        else if (k < 0.6)
          PF.dress.rubble(b, x, 0, z, 0.9 + rS() * 0.8, 6, 100 + i);
        else if (k < 0.8) PF.barrel(b, x, 0, z, {});
        else PF.dress.crates(b, x, 0, z, 1 + ((rS() * 2) | 0), 200 + i);
      }
      PF.skeleton(b, -304.2, 0.02, 30, 0.6);
      PF.skeleton(b, -307.4, DY + 0.02, 172, 2.1);
      // a pair of lovers' skeletons on a bench looking out over the river (the High Line was a view, even then)
      PF.bench(b, HL.X0 + 0.8, DY, 40, HP);
      PF.skeleton(b, HL.X0 + 1.4, DY + 0.02, 41.4, HP + 0.3);

      b.build(root);
      PF.flushGlows(root);
      PF.flushFires();

      // ---------------- doors ----------------
      HL.anchors = anchors;
      HL.hh = hh;
    },
    10,
  );

  /** A few crates on the flatcar. */
