// play-inline-326 03 — grime
// Lines 289-947 of readable/play-inline-326.pretty.js (statement-aligned).
  PF.addBuilder(
    "nabisco_factory",
    function (PF2, site, root) {
      const b = PF.batch("nabisco_ext");
      b.ground = 0;
      b.aoH = 5;
      const { X0, X1, Z0, Z1, XT, HA, HT } = NB;
      const anchors = {};
      // ---------------- masses (brick shells + parapets) ----------------
      b.boxMM("brick_nab", X0, 0, Z0, XT, HA + 0.9, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("brick_nab", XT, 0, Z0, X1, HT + 0.9, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      PF.colMM(X0, 0, Z0, XT, HA + 0.9, Z1, { walkable: true });
      PF.colMM(XT, 0, Z0, X1, HT + 0.9, Z1, { walkable: true });
      // roofs (tar) slightly inside the parapets
      b.boxMM(
        "tar",
        X0 + 0.4,
        HA + 0.9,
        Z0 + 0.4,
        XT - 0.2,
        HA + 1.0,
        Z1 - 0.4,
        { segLen: 8 },
      );
      b.boxMM(
        "tar",
        XT + 0.4,
        HT + 0.9,
        Z0 + 0.4,
        X1 - 0.4,
        HT + 1.0,
        Z1 - 0.4,
        { segLen: 8 },
      );
      // ---------------- façades ----------------
      const floorsA = 6,
        floorsT = 8;
      const entranceX = -240; // south portal (door) on the bakery block
      const dockX0 = -258,
        dockX1 = -244;
      facade(b, "s", X0, XT, Z1, floorsA, HA, {
        skipGround: (t) =>
          Math.abs(t - entranceX) < 3 || (t > dockX0 && t < dockX1),
      });
      facade(b, "s", XT, X1, Z1, floorsT, HT, {
        courses: [NB.F[1], NB.F[2], NB.F[6]],
      });
      facade(b, "n", X0, XT, Z0, floorsA, HA, {});
      facade(b, "n", XT, X1, Z0, floorsT, HT, {
        courses: [NB.F[1], NB.F[2], NB.F[6]],
      });
      facade(b, "w", Z0, Z1, X0, floorsA, HA, {
        skipUpper: (t, f) => t > 234 && t < 248 && (f === 2 || f === 3),
        skipGround: () => false,
      });
      facade(b, "e", Z0, Z1, X1, floorsT, HT, {
        courses: [NB.F[1], NB.F[2], NB.F[6]],
        skipUpper: (t, f) => f >= 3 && f <= 5 && t > 232 && t < 254,
      });
      for (const f of [6, 7])
        for (let z = Z0 + 3; z < Z1 - 2; z += 4.4)
          segWindow(
            b,
            XT - 0.07,
            NB.F[f] + 0.8,
            z,
            -HP,
            2.2,
            2.0,
            (z * 7 + f) % 3 < 1 ? "glass_broken" : "glass_dark",
          );
      for (const [a, c] of [[Z0, Z1]]) {
        b.boxMM("brick_nab_dk", XT - 0.5, HT - 0.3, a, XT, HT + 0.9, c, {
          seg: false,
        });
        b.boxMM("limestone", XT - 0.6, HT + 0.9, a, XT + 0.1, HT + 1.08, c, {
          seg: false,
        });
      }
      // ---------------- south portal: NATIONAL BISCUIT COMPANY ----------------
      {
        const x = entranceX,
          z = Z1;
        b.boxMM("limestone", x - 2.6, 0, z, x + 2.6, 6.2, z + 0.7, {
          seg: false,
          grime: 0.5,
        });
        // arched doorway cut: dark recess + steel doors
        archBay(b, x, 0.02, z + 0.72, 0, 3.0, 4.6, {
          pane: "glass_broken",
          ring: "limestone",
          key: "limestone",
          sash: false,
        });
        b.boxMM("panel", x - 1.45, 0, z + 0.6, x - 0.05, 3.1, z + 0.75, {
          seg: false,
          grime: 0.8,
        });
        b.box("panel", x + 1.0, 0, z + 1.3, 1.4, 3.1, 0.12, {
          ry: -0.9,
          seg: false,
          grime: 0.8,
        }); // one leaf hanging open
        const nk = PF.texMat(
          "nb_portal",
          PF.signTex(
            "nb_portal",
            ["NATIONAL BISCUIT COMPANY"],
            "engraved",
            1024,
            110,
          ),
          { rough: 0.9 },
        );
        b.quad(nk, x, 5.55, z + 0.72, 5.0, 0.54, { ry: 0, grime: 0.3 });
        // the NBC emblem roundel above (the "cross with antennae" seal, stylised)
        const emb = PF.texMat(
          "nb_emblem",
          PF.canvasTex(
            "pch_nbc_emblem",
            256,
            256,
            (ctx, w, h) => {
              ctx.fillStyle = "#c8bca0";
              ctx.fillRect(0, 0, w, h);
              ctx.strokeStyle = "#5a4a38";
              ctx.lineWidth = 10;
              ctx.beginPath();
              ctx.ellipse(w / 2, h / 2, 110, 110, 0, 0, TAU);
              ctx.stroke();
              ctx.lineWidth = 12;
              ctx.beginPath();
              ctx.moveTo(w / 2, 50);
              ctx.lineTo(w / 2, 150);
              ctx.moveTo(w / 2 - 55, 150);
              ctx.lineTo(w / 2 + 55, 150);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(w / 2, 90, 26, 0, TAU);
              ctx.stroke();
              ctx.fillStyle = "#5a4a38";
              ctx.font = "bold 34px Georgia, serif";
              ctx.textAlign = "center";
              ctx.fillText("N B C", w / 2, 200);
            },
            { clamp: true },
          ),
          { rough: 0.8 },
        );
        b.cyl("limestone", x, 6.2, z + 0.4, 1.0, 1.0, 0.3, 20, {
          rx: HP,
          hSeg: 1,
        });
        b.quad(emb, x, 6.2, z + 0.58, 1.8, 1.8, { ry: 0, grime: 0.3 });
        b.box("limestone", x, 5.9, z + 0.55, 5.6, 0.25, 0.5, { seg: false });
        PF.colMM(x - 2.6, 0, z, x + 2.6, 6.2, z + 0.75, { walkable: false });
        anchors.entrance = PF.anchor(x, 0, z + 2.6, 0);
        NB.door = V3(x, 1.6, z + 0.9);
      }
      // ---------------- loading dock + canopy (south, bakery block) ----------------
      {
        const z = Z1;
        b.boxMM("concrete", dockX0, 0, z, dockX1, 1.2, z + 3.0, {
          seg: false,
          grime: 0.7,
        });
        PF.colMM(dockX0, 0, z, dockX1, 1.2, z + 3.0, { surface: "concrete" });
        for (let x = dockX0 + 0.3; x < dockX1; x += 1.2)
          b.box("tire", x, 0.35, z + 3.05, 0.5, 0.5, 0.18, { seg: false }); // dock bumpers
        // steel canopy on tie rods
        b.boxMM(
          "corrugated",
          dockX0 - 0.5,
          4.3,
          z,
          dockX1 + 0.5,
          4.45,
          z + 4.6,
          { seg: false, rx: -0.05 },
        );
        b.boxMM(
          "steel",
          dockX0 - 0.5,
          4.1,
          z + 4.4,
          dockX1 + 0.5,
          4.35,
          z + 4.7,
          { seg: false },
        );
        for (let x = dockX0; x <= dockX1; x += 3.5)
          b.beam(
            "iron",
            V3(x, 4.4, z + 4.5),
            V3(x, 7.2, z + 0.3),
            0.05,
            0.05,
            {},
          );
        // roll-up doors in the dock bays (overriding the arches visually with steel)
        for (let i = 0; i < 7; i++) {
          const x = X0 + ((i + 0.5) * (XT - X0)) / 7;
          if (x < dockX0 || x > dockX1) continue;
          b.boxMM("corrugated", x - 1.5, 1.2, z + 0.03, x + 1.5, 3.9, z + 0.2, {
            seg: false,
            grime: 0.8,
          });
          b.boxMM("limestone", x - 1.7, 3.9, z + 0.03, x + 1.7, 4.2, z + 0.3, {
            seg: false,
          });
        }
        // Chocolate Zeppelin delivery truck backed up to the dock
        const tx = -251.5,
          tz = z + 8.2;
        const M = PF.m4(tx, 0, tz, 0.04);
        const add = (k, g, m) =>
          b.add(k, g, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.6,
          });
        add(
          "paint_cream",
          new THREE.BoxGeometry(2.6, 2.7, 6.0),
          PF.m4(0, 2.45, -1.2),
        );
        add(
          "hl_steel_dk",
          new THREE.BoxGeometry(2.3, 0.4, 8.8),
          PF.m4(0, 0.9, 0),
        );
        add(
          "paint_red",
          new THREE.BoxGeometry(2.3, 1.5, 2.0),
          PF.m4(0, 1.85, 3.0),
        );
        add(
          "paint_red",
          new THREE.BoxGeometry(2.25, 0.9, 1.1),
          PF.m4(0, 1.5, 4.3, 0, -0.25),
        );
        const roof = new THREE.CylinderGeometry(
          1.15,
          1.15,
          2.0,
          12,
          1,
          false,
          0,
          PI,
        );
        roof.rotateX(HP);
        roof.rotateY(HP);
        roof.scale(1, 0.35, 1);
        add("paint_red", roof, PF.m4(0, 2.6, 3.0, HP));
        add(
          "glass_broken",
          new THREE.BoxGeometry(2.0, 0.6, 0.1),
          PF.m4(0, 2.35, 4.02),
        );
        add(
          "chrome",
          new THREE.BoxGeometry(2.4, 0.3, 0.2),
          PF.m4(0, 0.8, 4.35),
        );
        for (const wx of [-1.12, 1.12])
          for (const wz of [-3.2, -2.0, 3.0]) {
            const w = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 10);
            w.rotateZ(HP);
            add("tire", w, PF.m4(wx, 0.5, wz));
          }
        const fl = PF.brandMat("chocolate_zeppelin");
        for (const sx of [-1, 1])
          b.quad(fl, tx + sx * 1.32, 2.5, tz - 1.2, 5.2, 2.2, {
            ry: sx * HP,
            grime: 0.3,
          });
        PF.col(tx, tz, 2.7, 8.9, 0, 3.8, 0.04, { surface: "metal" });
        anchors.dock = PF.anchor(-251.5, 1.2, z + 1.5, 0);
      }
      // ---------------- High Line siding portal (west façade, floor 3) ----------------
      {
        const x = X0,
          zc = PF.HL ? (PF.HL.SPUR_Z0 + PF.HL.SPUR_Z1) / 2 : 241,
          y = 7.5;
        b.boxMM(
          "concrete_dark",
          x - 0.02,
          y - 0.3,
          zc - 3.2,
          x + 0.1,
          y + 5.2,
          zc + 3.2,
          { seg: false },
        );
        b.boxMM(
          "corrugated",
          x - 0.2,
          y + 2.6,
          zc - 3,
          x - 0.05,
          y + 5,
          zc + 3,
          { seg: false, grime: 0.8 },
        );
        b.quad("glass_broken", x - 0.12, y + 1.3, zc, 6, 2.6, {
          ry: -HP,
          noAO: true,
          grime: 0,
        });
        b.boxMM("steel", x - 0.5, y + 5, zc - 3.6, x + 0.2, y + 5.5, zc + 3.6, {
          seg: false,
        });
        for (const dz of [-3.4, 3.4])
          b.boxMM(
            "steel",
            x - 0.5,
            y - 0.3,
            zc + dz - 0.2,
            x + 0.1,
            y + 5.2,
            zc + dz + 0.2,
            { seg: false },
          );
        const fk = PF.texMat(
          "nb_siding",
          PF.signTex(
            "nb_siding",
            ["RECEIVING — FLOOR 3", "NO SMOKING — FLOUR DUST"],
            "enamel",
            512,
            160,
            { bg: "#6a2420" },
          ),
          {},
        );
        b.quad(fk, x - 0.55, y + 6.1, zc, 3.4, 1.06, { ry: -HP, grime: 0.3 });
        // ants got here too: dirt streaks + eggshell litter on the bridge end
        for (let i = 0; i < 8; i++)
          b.rock(
            "nest",
            x - 1 - Math.random() * 3,
            y - 0.1,
            zc + (Math.random() - 0.5) * 4,
            0.3 + Math.random() * 0.4,
            { flat: 0.3, detail: 0, seed: i + 70 },
          );
        NB.sidingDoor = V3(x - 0.6, y + 1.4, zc);
        anchors.siding = PF.anchor(x - 2.5, y, zc, -HP);
      }
      // ---------------- painted ghost signs ----------------
      {
        const big = PF.ghostKey("nbc_big", ["NATIONAL BISCUIT COMPANY"], {
          w: 1024,
          h: 128,
        });
        b.quad(big, (XT + X1) / 2 + 0.2, HT - 3.2, Z0 - 0.08, 13.2, 1.7, {
          ry: PI,
          grime: 0.1,
          noAO: true,
        });
        b.quad(big, X1 + 0.08, NB.F[6] + 3.5, (Z0 + Z1) / 2, 28, 3.4, {
          ry: HP,
          grime: 0.1,
          noAO: true,
        });
        const fl = PF.ghostKey(
          "nbc_zeppelin",
          ["Chocolate Zeppelin", "LIGHTER THAN AIR — BAKED FRESH IN CHELSEA"],
          {
            w: 1024,
            h: 320,
            colors: ["rgba(214,220,228,0.92)", "rgba(236,226,200,0.9)"],
            bg: "rgba(60,34,22,0.6)",
          },
        );
        b.quad(fl, X1 + 0.08, NB.F[3] + 3.0, (Z0 + Z1) / 2 + 1, 20, 6.2, {
          ry: HP,
          grime: 0.1,
          noAO: true,
        });
        const w2 = PF.ghostKey("nbc_west", ["N.B.C.  BAKERY No. 1"], {
          w: 1024,
          h: 128,
        });
        b.quad(w2, X0 - 0.08, HA - 3.2, (Z0 + Z1) / 2, 18, 2.2, {
          ry: -HP,
          grime: 0.1,
          noAO: true,
        });
      }
      // ---------------- rooftop: water tank, smokestack, penthouse, skylights ----------------
      {
        // water tank on the tower (cedar staves on a steel stand)
        const tx = -225,
          tz = 236,
          ty = HT + 1.0;
        for (const [dx, dz] of [
          [-1.6, -1.6],
          [1.6, -1.6],
          [-1.6, 1.6],
          [1.6, 1.6],
        ])
          b.box("hl_steel_dk", tx + dx, ty, tz + dz, 0.22, 4.0, 0.22, {
            seg: false,
          });
        for (const dx of [-1.6, 1.6]) {
          b.beam(
            "hl_steel_dk",
            V3(tx + dx, ty + 0.4, tz - 1.6),
            V3(tx + dx, ty + 3.6, tz + 1.6),
            0.06,
            0.06,
            {},
          );
          b.beam(
            "hl_steel_dk",
            V3(tx - 1.6, ty + 0.4, tz + dx),
            V3(tx + 1.6, ty + 3.6, tz + dx),
            0.06,
            0.06,
            {},
          );
        }
        b.box("planks", tx, ty + 4.0, tz, 4.4, 0.25, 4.4, { seg: false });
        b.cyl("rotten", tx, ty + 4.25, tz, 2.3, 2.3, 4.6, 20, {
          hSeg: 3,
          grime: 0.6,
        });
        for (let k = 0; k < 4; k++)
          b.cyl("iron", tx, ty + 4.6 + k * 1.1, tz, 2.33, 2.33, 0.08, 20, {
            hSeg: 1,
          });
        b.lathe(
          "rotten",
          [
            [2.4, 0],
            [1.4, 0.9],
            [0.2, 1.5],
            [0.05, 1.6],
          ],
          20,
          tx,
          ty + 8.85,
          tz,
          {},
        );
        // smokestack on the bakery block
        const sx = -249,
          sz = 236;
        b.box("brick_nab_dk", sx, HA + 0.9, sz, 3.4, 1.4, 3.4, { seg: false });
        b.cyl("brick_nab", sx, HA + 2.3, sz, 1.05, 1.45, 13, 16, {
          hSeg: 5,
          grime: 0.7,
        });
        for (const y of [HA + 6, HA + 11])
          b.cyl("iron", sx, y, sz, 1.32, 1.32, 0.15, 16, { hSeg: 1 });
        b.cyl("brick_nab_dk", sx, HA + 15.3, sz, 1.25, 1.1, 0.8, 16, {
          hSeg: 1,
        });
        PF.onInitDone.push(() => {
          try {
            if (PF.live("fx") && G.fx.smoke)
              G.fx.smoke(V3(sx, HA + 16.5, sz), 0.8, { dark: true });
          } catch (e) {
            /* optional */
          }
        });
        // stair/elevator penthouse + sawtooth skylights on the bakery roof
        b.boxMM("brick_nab", -236.5, HA + 0.9, 229, -232.3, HA + 4.4, 234, {
          seg: false,
        });
        for (let x = X0 + 3; x < -238; x += 5) {
          const g = new THREE.BoxGeometry(4.4, 0.12, 8);
          g.rotateZ(-0.35);
          b.add("corrugated", g, { m: PF.m4(x + 2, HA + 1.9, 247) });
          b.quad(
            x % 10 ? "glass_broken" : "glass_dark",
            x - 0.2,
            HA + 1.9,
            247,
            8,
            1.6,
            { ry: -HP, noAO: true, grime: 0.1 },
          );
        }
        // rooftop billboard (Chocolate Zeppelin) on the bakery block facing 10th Ave traffic
        PF.billboard(
          b,
          "chocolate_zeppelin",
          -258,
          HA + 1.0,
          250,
          -HP,
          10,
          4.6,
          2.0,
        );
      }
      // ---------------- fire escapes (north façade) ----------------
      for (const x of [-252, -238]) {
        for (let f = 2; f < 6; f++) {
          const y = NB.F[f] + 0.05;
          b.boxMM("steel_win", x - 2, y - 0.05, Z0 - 1.3, x + 2, y + 0.05, Z0, {
            seg: false,
          });
          PF.rail(b, x - 2, Z0 - 1.3, x + 2, Z0 - 1.3, y, {
            key: "steel_win",
            noCollide: true,
            h: 0.95,
          });
          b.beam(
            "steel_win",
            V3(x - 1.6, y, Z0 - 0.8),
            V3(x + 1.6, NB.F[f + 1] || y + 3.5, Z0 - 0.8),
            0.5,
            0.06,
            {},
          );
        }
      }
      // ---------------- ant infestation outside: mound at the SE corner, husks, sugar trail ----------------
      {
        const mx = -222.6,
          mz = 260.2;
        b.rock("nest", mx, -0.7, mz, 2.5, { flat: 0.5, rough: 0.45, seed: 91 });
        b.rock("nest_dk", mx - 1.2, -0.3, mz - 0.6, 1.5, {
          flat: 0.55,
          rough: 0.5,
          seed: 92,
        });
        b.rock("nest", mx + 0.4, -0.2, mz + 1.3, 1.1, { flat: 0.5, seed: 93 });
        // tunnel mouth facing east: dark ring
        b.cyl("nest_dk", mx + 1.9, 0.35, mz + 0.1, 0.9, 1.1, 0.5, 12, {
          rz: 1.0,
          hSeg: 1,
          open: true,
        });
        b.sphere("glass_broken", mx + 1.6, 0.55, mz + 0.1, 0.8, {
          sx: 0.6,
          ws: 10,
          hs: 6,
        });
        // cracked sidewalk slabs heaved up
        for (let i = 0; i < 7; i++) {
          const a = (i / 7) * TAU;
          b.box(
            "sidewalk",
            mx + Math.cos(a) * 2.9,
            0.05,
            mz + Math.sin(a) * 2.2,
            1.3,
            0.18,
            1.1,
            { ry: a, rx: 0.3, seg: false, grime: 0.7 },
          );
        }
        // husks of dead ants (bulbous segments) and egg shells
        for (const [x, z, ry] of [
          [-228, 261.5, 0.5],
          [-233.5, 260.4, 2.2],
        ]) {
          const M = PF.m4(x, 0.25, z, ry, 0, 0.3);
          const add = (g, m) =>
            b.add("resin", g, {
              m: new THREE.Matrix4().multiplyMatrices(M, m),
              grime: 0.6,
            });
          add(new THREE.SphereGeometry(0.35, 8, 6), PF.m4(0, 0, -0.5));
          add(new THREE.SphereGeometry(0.28, 8, 6), PF.m4(0, 0.05, 0));
          add(
            new THREE.SphereGeometry(0.5, 8, 6).scale(1, 0.85, 1.3),
            PF.m4(0, 0.1, 0.7),
          );
          for (let k = 0; k < 6; k++)
            add(
              new THREE.CylinderGeometry(0.03, 0.02, 0.9, 4),
              PF.m4(
                k % 2 ? 0.45 : -0.45,
                -0.1,
                -0.3 + (k >> 1) * 0.3,
                0,
                0,
                (k % 2 ? -1 : 1) * 1.1,
              ),
            );
        }
        const rE = PF.rng("nb_eggs");
        for (let i = 0; i < 9; i++)
          b.sphere(
            "ant_egg",
            mx - 2 + rE() * 4,
            0.12,
            mz - 1.5 + rE() * 3,
            0.14,
            {
              sy: 1.4,
              ws: 6,
              hs: 4,
              deform: (v) => {
                if (v.y > 0.05) v.y *= 0.4;
              },
            },
          );
        // warning sign stuck in the dirt
        b.box("rotten", mx - 3.2, 0, mz - 1.2, 0.08, 1.4, 0.08, { seg: false });
        const wk = PF.texMat(
          "nb_warn",
          PF.signTex(
            "nb_warn",
            ["ANTS!!", "BIG ONES. DONT"],
            "raider",
            256,
            128,
            { fg: "#e8d040" },
          ),
          {},
        );
        b.quad(wk, mx - 3.2, 1.35, mz - 1.15, 1.0, 0.5, {
          ry: 0.3,
          grime: 0.3,
        });
        PF.col(mx - 0.3, mz, 4.0, 3.6, 0, 1.2, 0, { surface: "dirt" });
        NB.moundDoor = V3(mx + 2.3, 0.8, mz + 0.1);
        anchors.ant_mound = PF.anchor(mx + 3.8, 0, mz + 0.1, -HP);
        // a sugar trail from the mound to a burst ground-floor arch (ants carrying off the stock)
        for (let i = 0; i < 26; i++) {
          const t = i / 25;
          b.box(
            "flour",
            mx - 2 - t * 10,
            0.01,
            mz - 1.2 + Math.sin(i) * 0.2,
            0.35,
            0.03,
            0.25,
            { ry: rE() * 3, seg: false, noAO: true, grime: 0.3 },
          );
        }
      }
      // sidewalk clutter, sandbag remains, skeleton of a delivery man, cars
      PF.skeleton(b, -236, 0.02, 262, 1.1);
      PF.car(b, -265.5, 0, 232, 0.05, { seed: 51, paint: "paint_teal" });
      PF.barrel(b, -259.6, 1.2, Z1 + 1.5, {});
      PF.dress.crates(b, -245, 1.2, Z1 + 1.5, 2, 52);
      PF.lampPost(b, -262.5, 0, 262, false);

      b.build(root);
      PF.flushGlows(root);
      PF.flushFires();
      NB.anchors = anchors;
    },
    20,
  );
