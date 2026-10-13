// play-inline-207 04 — grime
// Lines 875-1589 of readable/play-inline-207.pretty.js (statement-aligned).
  function courtyardSettlement(b, site, anchors, CZ1) {
    const r = PF.rng("ft_market");
    /** position-keyed lumpy displacement for PF deform (duplicated seam vertices move together). */
    const lump = (k) => (v) => {
      v.multiplyScalar(
        1 +
          k *
            0.5 *
            Math.sin(v.x * 13.1 + v.y * 7.7 + v.z * 5.3) *
            Math.cos(v.x * 4.3 - v.z * 9.1),
      );
    };
    // ---- the gate arch over the south gate (x 76..81) ----
    {
      const gx0 = 75.55,
        gx1 = 81.45,
        gz = CZ1,
        top = 5.4;
      for (const x of [gx0, gx1]) {
        b.box("rust", x, 0, gz, 0.34, top, 0.34, { seg: false, grime: 0.6 }); // I-beam posts
        b.box("iron", x, 0, gz, 0.12, top + 0.25, 0.42, { seg: false });
        PF.col(x, gz, 0.5, 0.5, 0, top, 0, {
          walkable: false,
          surface: "metal",
        });
        b.beam(
          "rust",
          V3(x, top - 1.2, gz),
          V3(x + (x < 78 ? 0.9 : -0.9), top - 0.35, gz),
          0.1,
          0.1,
          {},
        ); // knee braces
      }
      b.box(
        "rust",
        (gx0 + gx1) / 2,
        top - 0.35,
        gz,
        gx1 - gx0 + 0.6,
        0.3,
        0.3,
        { seg: false, grime: 0.6 },
      );
      const outK = PF.texMat(
        "ft_gate_out",
        PF.signTex("ft_gate_out", ["FRAUNCES MARKET"], "raider", 1024, 176, {
          bg: "#5a5a4e",
          fg: "#e8d8a8",
        }),
        { rough: 0.8 },
      );
      const inK = PF.texMat(
        "ft_gate_in",
        PF.signTex(
          "ft_gate_in",
          ["NO FIGHTING · NO SLAVERS", "COME BACK SOON"],
          "raider",
          1024,
          176,
          { bg: "#4e5448", fg: "#d8c890" },
        ),
        { rough: 0.8 },
      );
      const cx = (gx0 + gx1) / 2,
        sy = top - 1.25;
      b.box("corrugated", cx, sy - 0.05, gz, 5.4, 1.0, 0.08, {
        rz: 0.03,
        seg: false,
        grime: 0.7,
      });
      b.quad(outK, cx, sy + 0.45, gz + 0.05, 5.2, 0.9, {
        ry: 0,
        rz: 0.03,
        grime: 0.2,
      });
      b.quad(inK, cx, sy + 0.45, gz - 0.05, 5.2, 0.9, {
        ry: PI,
        rz: -0.03,
        grime: 0.2,
      });
      for (const sg of [-1, 1])
        b.beam(
          "iron",
          V3(cx + sg * 2.4, sy + 0.95, gz),
          V3(cx + sg * 2.4, top - 0.35, gz),
          0.03,
          0.03,
          {},
        );
      // bulbs along the top of the sign, a few dead
      for (let i = 0; i < 11; i++) {
        const x = cx - 2.5 + i * 0.5;
        b.sphere(
          i % 4 === 2 ? "glass_broken" : "lamp_warm",
          x,
          sy + 1.0,
          gz + 0.1,
          0.07,
          { ws: 6, hs: 4, noAO: true, grime: 0 },
        );
      }
      PF.glow(V3(cx - 1.2, sy + 1.0, gz + 0.3), 0xffc070, 1.2, null, {
        intensity: 1.0,
        flicker: 0.15,
      });
      PF.glow(V3(cx + 1.3, sy + 1.0, gz + 0.3), 0xffc070, 1.2, null, {
        intensity: 1.0,
        flicker: 0.15,
      });
      // a stack of tyres inside the gate
      for (let i = 0; i < 3; i++)
        b.add("tire", new THREE.TorusGeometry(0.34, 0.13, 6, 12), {
          m: PF.m4(74.5, 0.13 + i * 0.25, gz - 1.0, 0, HP, 0),
        });
    }

    // ---- NE watchtower (platform y 4.4) with a plank stair along the east wall ----
    {
      const x0 = 105.9,
        x1 = 109.4,
        z0 = 884.6,
        z1 = 888.25,
        py = 4.4;
      for (const [x, z] of [
        [x0 + 0.15, z0 + 0.15],
        [x1 - 0.15, z0 + 0.15],
        [x0 + 0.15, z1 - 0.15],
        [x1 - 0.15, z1 - 0.15],
      ]) {
        b.box("rotten", x, 0, z, 0.22, py + 2.5, 0.22, {
          seg: false,
          grime: 0.6,
        });
        PF.col(x, z, 0.26, 0.26, 0, py + 2.4, 0, {
          walkable: false,
          surface: "wood",
        });
      }
      // X-bracing on the two outer faces
      for (const [a, c] of [
        [
          [x0 + 0.15, z1 - 0.15],
          [x1 - 0.15, z1 - 0.15],
        ],
        [
          [x0 + 0.15, z0 + 0.15],
          [x0 + 0.15, z1 - 0.15],
        ],
      ]) {
        b.beam(
          "rotten",
          V3(a[0], 0.3, a[1]),
          V3(c[0], py - 0.2, c[1]),
          0.1,
          0.1,
          {},
        );
        b.beam(
          "rotten",
          V3(c[0], 0.3, c[1]),
          V3(a[0], py - 0.2, a[1]),
          0.1,
          0.1,
          {},
        );
      }
      b.boxMM("planks", x0, py - 0.16, z0, x1, py, z1, { grime: 0.6 });
      PF.colMM(x0, py - 0.16, z0, x1, py, z1, { surface: "wood" });
      // parapet of scrap sheet (open at the stair head, NE corner)
      PF.scrapWall(b, x0 + 0.05, z1 - 0.05, x1 - 0.05, z1 - 0.05, 1.15, {
        y: py,
        seed: 71,
        noSpikes: true,
      });
      PF.scrapWall(b, x0 + 0.05, z0 + 0.05, x0 + 0.05, z1 - 0.05, 1.15, {
        y: py,
        seed: 72,
        noSpikes: true,
      });
      PF.scrapWall(b, x0 + 0.05, z0 + 0.05, x1 - 1.35, z0 + 0.05, 1.15, {
        y: py,
        seed: 73,
        noSpikes: true,
      });
      PF.sandbags(b, x0 + 0.5, z1 - 0.45, x1 - 0.4, z1 - 0.45, 2, {
        y: py,
        noCollide: true,
      });
      // tin roof on the posts
      b.box(
        "corrugated",
        (x0 + x1) / 2,
        py + 2.45,
        (z0 + z1) / 2,
        x1 - x0 + 0.9,
        0.06,
        z1 - z0 + 0.9,
        { rx: -0.12, seg: false, grime: 0.7 },
      );
      // searchlight on a pivot, aimed out over Pearl Street
      {
        const sx = x0 + 0.8,
          sz = z1 - 0.9,
          sY = py + 1.35;
        b.cyl("iron", sx, py, sz, 0.05, 0.1, 1.0, 6, { hSeg: 1 });
        const ry = 0.55,
          rx = HP - 0.22;
        const M = PF.m4(sx, sY, sz, ry, rx, 0);
        b.add("steel", new THREE.CylinderGeometry(0.34, 0.4, 0.7, 12, 1), {
          m: M,
          grime: 0.4,
        });
        const lens = new THREE.CircleGeometry(0.31, 14);
        lens.rotateX(-HP);
        lens.translate(0, 0.351, 0);
        b.add("lamp", lens, { m: M, noAO: true, grime: 0 });
        const d = V3(0, 1, 0).applyEuler(new THREE.Euler(rx, ry, 0, "YXZ"));
        PF.glow(
          V3(sx + d.x * 0.5, sY + d.y * 0.5, sz + d.z * 0.5),
          0xfff0c8,
          2.2,
          null,
          { intensity: 1.3 },
        );
      }
      // settlement flag on a pipe mast at the corner
      b.beam(
        "iron",
        V3(x1 - 0.15, py + 2.4, z1 - 0.15),
        V3(x1 - 0.15, py + 5.2, z1 - 0.15),
        0.06,
        0.06,
        {},
      );
      const flagK = PF.texMat("ft_flag", PF.flagTex(0), {
        rough: 0.9,
        side: THREE.DoubleSide,
      });
      b.quad(flagK, x1 - 0.15 - 0.8, py + 4.6, z1 - 0.15, 1.6, 0.95, {
        ry: 0.3,
        rz: -0.08,
        grime: 0.3,
      });
      // the stair: treads on two stringers climbing north → south along the east wall, a rope handrail
      const sx0 = 108.2,
        sx1 = 109.35,
        zs = 877.0,
        run = z0 - zs,
        n = 14,
        rise = py / n,
        step = run / n;
      for (let i = 0; i < n; i++) {
        const top = rise * (i + 1),
          zc = zs + step * (i + 0.5);
        b.boxMM(
          "planks",
          sx0,
          top - 0.07,
          zc - step / 2 - 0.02,
          sx1,
          top,
          zc + step / 2 + 0.02,
          { seg: false, grime: 0.55 },
        );
        PF.colMM(sx0, 0, zc - step / 2, sx1, top, zc + step / 2, {
          surface: "wood",
        });
      }
      for (const x of [sx0 + 0.05, sx1 - 0.05])
        b.beam("rotten", V3(x, -0.1, zs), V3(x, py - 0.1, z0), 0.08, 0.26, {});
      b.box("rotten", sx0 + 0.05, 0, zs + run * 0.5, 0.14, py * 0.5, 0.14, {
        seg: false,
      });
      b.beam(
        "rope",
        V3(sx0 + 0.02, 1.0, zs + 0.2),
        V3(sx0 + 0.02, py + 1.0, z0 - 0.1),
        0.03,
        0.03,
        {},
      );
      for (const t of [0.1, 0.5, 0.9])
        b.beam(
          "rotten",
          V3(sx0 + 0.02, py * t, zs + run * t),
          V3(sx0 + 0.02, py * t + 1.0, zs + run * t),
          0.05,
          0.05,
          {},
        );
      anchors.tower = PF.anchor(107.3, py, 887.2, PI);
      anchors.tower_foot = PF.anchor(108.8, 0, 876.2, 0);
    }

    // ---- bunk shacks against the row-house backs (x 73.4..79.4 and 80.6..88.6, z 872.1..875.7) ----
    const shack = (x0, x1, doorX, sign, seed) => {
      const zb = TZ1 + 0.1,
        zf = TZ1 + 3.6,
        hB = 2.9,
        hF = 2.35;
      PF.scrapWall(b, x0, zb, x0, zf, hF, { seed: seed, noSpikes: true });
      PF.scrapWall(b, x1, zb, x1, zf, hF, { seed: seed + 1, noSpikes: true });
      PF.scrapWall(b, x0, zf, doorX - 0.55, zf, hF, {
        seed: seed + 2,
        noSpikes: true,
      });
      PF.scrapWall(b, doorX + 0.55, zf, x1, zf, hF, {
        seed: seed + 3,
        noSpikes: true,
      });
      // lintel + sheet above the door, hanging blanket
      b.box("rust", doorX, 2.0, zf, 1.3, 0.35, 0.1, { seg: false, grime: 0.7 });
      b.box("fabric", doorX - 0.25, 0.25, zf + 0.06, 0.55, 1.75, 0.03, {
        rz: 0.05,
        seg: false,
        c: 0x6a5a48,
        grime: 0.7,
      });
      // sloping roof: corrugated sheets with overhang, weighted with tyres & bricks
      const len = zf - zb + 0.6,
        ang = Math.atan2(hB - hF, zf - zb);
      for (let x = x0 - 0.2; x < x1 + 0.1; x += 1.25) {
        b.box(
          r() < 0.3 ? "rust" : "corrugated",
          Math.min(x + 0.65, x1 + 0.2 - 0.62),
          (hB + hF) / 2 - 0.02,
          (zb + zf) / 2 + 0.2,
          1.35,
          0.05,
          len,
          { rx: ang, seg: false, grime: 0.7 },
        );
      }
      b.add("tire", new THREE.TorusGeometry(0.33, 0.12, 6, 12), {
        m: PF.m4(
          (x0 + x1) / 2 - 1,
          (hB + hF) / 2 + 0.1,
          (zb + zf) / 2,
          0,
          HP - ang,
          0,
        ),
      });
      b.box(
        "brick_fed",
        (x0 + x1) / 2 + 1.2,
        (hB + hF) / 2 + 0.02,
        (zb + zf) / 2 + 0.3,
        0.4,
        0.14,
        0.2,
        { rx: ang, seg: false },
      );
      // stovepipe
      b.cyl("iron", x1 - 0.6, hB - 0.6, zb + 0.6, 0.1, 0.1, 1.8, 6, {
        hSeg: 1,
      });
      // inside: two mattresses, a crate table, a lamp
      D.mattress(
        b,
        x0 + 0.75,
        0.06,
        (zb + zf) / 2,
        0,
        [0x8a7a5a, 0x6a6a5a][seed % 2],
      );
      D.mattress(b, x1 - 0.75, 0.06, (zb + zf) / 2, 0, 0x7a6a50);
      b.box("crate", (x0 + x1) / 2 + 0.3, 0.06, zb + 0.7, 0.6, 0.55, 0.6, {
        ry: 0.2,
        seg: false,
      });
      b.sphere("lamp_warm", (x0 + x1) / 2 + 0.3, 0.75, zb + 0.7, 0.08, {
        ws: 6,
        hs: 4,
        noAO: true,
      });
      PF.glow(V3((x0 + x1) / 2 + 0.3, 0.9, zb + 0.7), 0xffb060, 0.9, null, {
        intensity: 0.8,
        flicker: 0.3,
      });
      const sk = PF.texMat(
        "ft_shack_" + seed,
        PF.signTex("ft_shack_" + seed, sign, "raider", 512, 160, {
          bg: "#b8ae94",
          fg: "#3a2a1a",
          outline: false,
        }),
        { rough: 0.9 },
      );
      b.quad(sk, doorX + 1.4, 1.75, zf + 0.07, 1.2, 0.38, { ry: 0, rz: -0.04 });
    };
    shack(73.4, 79.4, 75.2, ["BUNKS 5 SCRIP"], 11);
    shack(80.6, 88.6, 82.3, ["FAMILIES ONLY"], 12);

    // ---- potato & plum garden (SW), watered from the purifier ----
    {
      for (const bx of [52.2, 54.5, 56.8]) {
        b.boxMM("planks", bx - 0.8, 0, 880.2, bx + 0.8, 0.42, 887.6, {
          seg: false,
          grime: 0.7,
        });
        b.boxMM("dirt", bx - 0.7, 0.42, 880.3, bx + 0.7, 0.46, 887.5, {
          seg: false,
          grime: 0.3,
        });
        PF.colMM(bx - 0.8, 0, 880.2, bx + 0.8, 0.46, 887.6, {
          surface: "dirt",
        });
        for (let z = 880.9; z < 887.2; z += 0.85) {
          const px = bx + (r() - 0.5) * 0.3,
            pz = z + (r() - 0.5) * 0.2;
          if (bx !== 54.5) {
            // potato: a low clump of broad leaves with a knobbly tuber showing
            for (let k = 0; k < 4; k++) {
              const a = (k / 4) * TAU + r();
              b.sphere(
                "moss",
                px + Math.cos(a) * 0.14,
                0.62,
                pz + Math.sin(a) * 0.14,
                0.18,
                { ws: 6, hs: 4, sx: 1.3, sy: 0.35, sz: 0.7, ry: a, grime: 0.2 },
              );
            }
            b.cyl("bark", px, 0.46, pz, 0.02, 0.04, 0.35, 5, { hSeg: 1 });
            if (r() < 0.6)
              b.sphere("paint_orange", px + 0.12, 0.5, pz - 0.1, 0.07, {
                ws: 5,
                hs: 4,
                deform: lump(0.3),
                grime: 0.6,
              });
          } else {
            // plum: a crooked sapling, a leaf canopy, purple fruit
            const h = 1.2 + r() * 0.5,
              lean = (r() - 0.5) * 0.3;
            b.beam(
              "bark",
              V3(px, 0.44, pz),
              V3(px + lean, 0.44 + h, pz),
              0.06,
              0.06,
              {},
            );
            b.sphere("moss", px + lean, 0.44 + h + 0.1, pz, 0.42, {
              ws: 7,
              hs: 5,
              sy: 0.6,
              deform: lump(0.25),
              grime: 0.3,
            });
            for (let k = 0; k < 3; k++)
              b.sphere(
                "velvet",
                px + lean + (r() - 0.5) * 0.6,
                0.3 + h,
                pz + (r() - 0.5) * 0.6,
                0.07,
                { ws: 5, hs: 4 },
              );
          }
        }
      }
      // irrigation: pipe from the purifier, drip hoses along each bed
      b.beam("iron", V3(58.7, 0.35, 885), V3(57.8, 0.35, 885), 0.08, 0.08, {});
      b.beam(
        "iron",
        V3(57.8, 0.5, 879.7),
        V3(51.4, 0.5, 879.7),
        0.06,
        0.06,
        {},
      );
      b.beam("iron", V3(57.8, 0.35, 885), V3(57.8, 0.5, 879.7), 0.08, 0.08, {});
      for (const bx of [52.2, 54.5, 56.8])
        b.beam("tire", V3(bx, 0.5, 879.7), V3(bx, 0.48, 887.4), 0.03, 0.03, {});
      // watering can, spade, sign
      b.cyl("steel", 58.1, 0, 881.2, 0.14, 0.16, 0.3, 8, { hSeg: 1 });
      b.beam(
        "steel",
        V3(58.1, 0.2, 881.35),
        V3(58.1, 0.42, 881.75),
        0.03,
        0.03,
        {},
      );
      b.beam(
        "rotten",
        V3(58.2, 0, 882.6),
        V3(58.35, 1.3, 882.8),
        0.04,
        0.04,
        {},
      );
      b.box("steel", 58.2, 0, 882.55, 0.22, 0.3, 0.03, {
        rx: -0.1,
        seg: false,
      });
      const gK = PF.texMat(
        "ft_garden",
        PF.signTex(
          "ft_garden",
          ["DON'T PICK", "THE SPUDS", "— DILLY"],
          "raider",
          256,
          192,
          { bg: "#c8bea4", fg: "#6a2a1a", outline: false },
        ),
        { rough: 0.9 },
      );
      b.box("rotten", 55.6, 0, 879.5, 0.06, 1.2, 0.06, { seg: false });
      b.quad(gK, 55.6, 1.25, 879.45, 0.7, 0.52, { ry: PI, rz: 0.05 });
      anchors.garden = PF.anchor(55.6, 0, 879.0, PI);
    }

    // ---- cook-fire with a roasting spit (centre of the yard) ----
    {
      const fx = 88.6,
        fz = 881.3;
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU;
        b.rock(
          "rubble",
          fx + Math.cos(a) * 0.62,
          0,
          fz + Math.sin(a) * 0.62,
          0.2,
          { flat: 0.7, detail: 0 },
        );
      }
      for (let k = 0; k < 4; k++)
        b.box("bark", fx, 0.08, fz, 0.12, 0.12, 0.9, {
          ry: k * 0.8,
          rx: 0.12,
          seg: false,
        });
      b.box("fire", fx, 0.05, fz, 0.5, 0.18, 0.5, {
        seg: false,
        noAO: true,
        grime: 0,
      });
      for (const sg of [-1, 1]) {
        b.beam(
          "iron",
          V3(fx + sg * 0.85, 0, fz),
          V3(fx + sg * 0.85, 1.05, fz),
          0.05,
          0.05,
          {},
        );
        b.beam(
          "iron",
          V3(fx + sg * 0.85, 1.05, fz),
          V3(fx + sg * 0.95, 1.25, fz),
          0.04,
          0.04,
          {},
        );
      }
      b.rod("iron", V3(fx - 1.05, 1.02, fz), V3(fx + 1.15, 1.02, fz), 0.02, 5);
      b.beam(
        "iron",
        V3(fx + 1.15, 1.02, fz),
        V3(fx + 1.15, 0.8, fz),
        0.03,
        0.03,
        {},
      ); // crank
      // the roast: an ox haunch, charred
      b.sphere("bark", fx, 1.0, fz, 0.32, {
        ws: 9,
        hs: 6,
        sx: 1.7,
        sy: 0.85,
        sz: 0.9,
        deform: lump(0.2),
        grime: 0.8,
      });
      b.sphere("bone", fx + 0.62, 1.02, fz, 0.07, { ws: 5, hs: 4, sx: 1.6 });
      PF.fires.push(V3(fx, 0.25, fz));
      PF.col(fx, fz, 1.9, 1.3, 0, 1.1, 0, { walkable: false });
      // stools + a butcher block + a cooking pot on the embers
      for (const [x, z] of [
        [fx - 1.6, fz - 0.8],
        [fx + 1.6, fz - 0.9],
        [fx - 1.4, fz + 1.2],
      ]) {
        b.cyl("rotten", x, 0, z, 0.2, 0.22, 0.45, 8, { hSeg: 1 });
      }
      b.box("oak", fx + 1.9, 0, fz + 0.9, 0.9, 0.85, 0.7, {
        seg: false,
        grime: 0.7,
      });
      b.box("steel", fx + 1.85, 0.85, fz + 0.9, 0.3, 0.02, 0.06, {
        ry: 0.4,
        seg: false,
      });
      PF.col(fx + 1.9, fz + 0.9, 0.9, 0.7, 0, 0.85, 0, {
        walkable: false,
        surface: "wood",
      });
      anchors.cook_fire = PF.anchor(fx, 0, fz - 1.4, PI);
    }

    // ---- jobs board by the gate ----
    {
      const bx = 83.2,
        bz = CZ1 - 0.45;
      for (const sg of [-1, 1])
        b.box("rotten", bx + sg * 0.85, 0, bz, 0.1, 2.2, 0.1, { seg: false });
      b.box("planks", bx, 0.9, bz, 1.9, 1.2, 0.06, { seg: false, grime: 0.6 });
      b.box("corrugated", bx, 2.15, bz + 0.05, 2.1, 0.05, 0.5, {
        rx: 0.25,
        seg: false,
      });
      const jobK = PF.texMat(
        "ft_jobs",
        PF.canvasTex(
          "pf_ft_jobs",
          512,
          320,
          (ctx, w, h) => {
            ctx.fillStyle = "#5a4a36";
            ctx.fillRect(0, 0, w, h);
            const notes = [
              ["HELP WANTED", "Lottie Brennan", "missing @ Seaport"],
              ["REV. PENHALLOW", "needs a steady", "hand. Trinity"],
              ["BUYING", "SHELLBACK EGGS", "20 SCRIP — NAN"],
              ["DISCREET", "PROFESSIONAL", "ask for Mr. Vane"],
              ["LOST DOG", '"PATCHES"', "no reward sorry"],
              ["NO CHEMS", "IN THE YARD", "— Birdie"],
            ];
            notes.forEach((n, i) => {
              const x = 14 + (i % 3) * 166,
                y = 14 + Math.floor(i / 3) * 152,
                a = Math.sin(i * 7.3) * 0.06;
              ctx.save();
              ctx.translate(x + 74, y + 66);
              ctx.rotate(a);
              ctx.fillStyle = ["#e0d6b8", "#d8cfa8", "#cfc6a0"][i % 3];
              ctx.fillRect(-72, -64, 144, 130);
              ctx.fillStyle = "#a02a1a";
              ctx.beginPath();
              ctx.arc(0, -56, 5, 0, TAU);
              ctx.fill();
              ctx.fillStyle = "#2a2018";
              ctx.textAlign = "center";
              ctx.font = 'bold 19px "Courier New", monospace';
              n.forEach((t, k) => ctx.fillText(t, 0, -24 + k * 30));
              ctx.restore();
            });
          },
          { clamp: true },
        ),
        { rough: 0.9 },
      );
      b.quad(jobK, bx, 1.5, bz - 0.04, 1.8, 1.12, { ry: PI, grime: 0.2 });
      PF.col(bx, bz, 1.9, 0.2, 0, 2.2, 0, { walkable: false, surface: "wood" });
      anchors.jobs_board = PF.anchor(bx, 0, bz - 1.2, PI);
    }

    // ---- NYC wooden water tower on the tallest row house (x 73..83, h 18.5) ----
    {
      const wx = 79.5,
        wz = 866.5,
        wy = 18.5;
      for (const [dx, dz] of [
        [-1.2, -1.2],
        [1.2, -1.2],
        [-1.2, 1.2],
        [1.2, 1.2],
      ])
        b.box("iron", wx + dx, wy, wz + dz, 0.16, 2.6, 0.16, { seg: false });
      b.boxMM(
        "iron",
        wx - 1.6,
        wy + 2.5,
        wz - 1.6,
        wx + 1.6,
        wy + 2.62,
        wz + 1.6,
        { seg: false },
      );
      b.cyl("rotten", wx, wy + 2.62, wz, 1.55, 1.65, 3.6, 16, {
        hSeg: 1,
        grime: 0.7,
      });
      for (const y of [0.5, 1.6, 2.7, 3.4])
        b.cyl(
          "iron",
          wx,
          wy + 2.62 + y,
          wz,
          1.6 + (3.6 - y) * 0.028,
          1.6 + (3.6 - y) * 0.028,
          0.06,
          16,
          { hSeg: 1 },
        );
      b.cyl("tar", wx, wy + 6.2, wz, 0.1, 1.75, 1.1, 16, { hSeg: 1 });
      b.beam(
        "iron",
        V3(wx + 1.6, wy + 2.6, wz),
        V3(wx + 1.6, wy + 6.2, wz),
        0.05,
        0.05,
        {},
      );
    }
  }

  // ===================================================================
  // INTERIOR
  // ===================================================================
