// play-inline-361 03 — math
// Lines 57-1610 of readable/play-inline-361.pretty.js (statement-aligned).
  PF.addBuilder(
    "singer_building",
    function (PF2, site, root) {
      const b = PF.batch("singer_ext");
      b.ground = 0;
      b.aoH = 6;
      const r = PF.rng("singer");
      const anchors = {};
      const {
        X0,
        X1,
        Z0,
        Z1,
        TX0,
        TX1,
        TZ0,
        TZ1,
        BASE,
        MANS,
        TOP,
        DOME,
        LANT,
        FLAG,
        TXC,
        TZC,
      } = SG;

      // =================================================================
      // BASE BLOCK (Singer + Bourne buildings): west of / around the tower
      // =================================================================
      // Plan: an L around the tower → three boxes (west block full depth, north & south wings beside the tower)
      // [x0,z0,x1,z1, outer faces W,N,E,S] — the mansard collider steps in 2.4 m on the outer faces only
      const blocks = [
        [X0, Z0, TX0, Z1, 1, 1, 0, 1],
        [TX0, Z0, X1, TZ0, 0, 1, 1, 0],
        [TX0, TZ1, X1, Z1, 0, 0, 1, 1],
      ];
      for (const [x0, z0, x1, z1, oW, oN, oE, oS] of blocks) {
        b.boxMM("lime_ws", x0, 0, z0, x1, 7.0, z1, { segLen: 5, grime: 0.6 }); // rusticated limestone ground storeys
        b.boxMM(
          "brick_singer",
          x0 + 0.05,
          7.0,
          z0 + 0.05,
          x1 - 0.05,
          BASE,
          z1 - 0.05,
          { segLen: 5, grime: 0.55 },
        );
        PF.colMM(x0, 0, z0, x1, BASE, z1, { walkable: true });
        PF.colMM(
          x0 + oW * 2.4,
          BASE,
          z0 + oN * 2.4,
          x1 - oE * 2.4,
          MANS,
          z1 - oS * 2.4,
          { walkable: true },
        );
      }
      // rustication grooves on the ground storeys
      for (let y = 0.9; y < 7; y += 0.75) {
        b.boxMM("lime_ws", X0 - 0.06, y, Z0 - 0.06, TX0, y + 0.08, Z0 + 0.02, {
          seg: false,
          c: 0x9a9280,
        });
        b.boxMM("lime_ws", X0 - 0.06, y, Z1 - 0.02, TX0, y + 0.08, Z1 + 0.06, {
          seg: false,
          c: 0x9a9280,
        });
        b.boxMM("lime_ws", TX0, y, Z0 - 0.06, X1, y + 0.08, Z0 + 0.02, {
          seg: false,
          c: 0x9a9280,
        });
        b.boxMM("lime_ws", TX0, y, Z1 - 0.02, X1, y + 0.08, Z1 + 0.06, {
          seg: false,
          c: 0x9a9280,
        });
        b.boxMM("lime_ws", X0 - 0.06, y, Z0, X0 + 0.02, y + 0.08, Z1, {
          seg: false,
          c: 0x9a9280,
        });
      }
      // belt courses + main cornice
      const belt = (y, h, out, key) => {
        b.boxMM(key || "lime_ws", X0 - out, y, Z0 - out, TX0, y + h, Z1 + out, {
          seg: false,
          grime: 0.45,
        });
        b.boxMM(key || "lime_ws", TX0, y, Z0 - out, X1 + 0.02, y + h, TZ0, {
          seg: false,
          grime: 0.45,
        });
        b.boxMM(key || "lime_ws", TX0, y, TZ1, X1 + 0.02, y + h, Z1 + out, {
          seg: false,
          grime: 0.45,
        });
      };
      belt(7.0, 0.55, 0.3);
      belt(17.2, 0.3, 0.15);
      belt(BASE - 1.2, 0.7, 0.25);
      belt(BASE - 0.5, 0.5, 0.7);
      // modillions under the main cornice
      for (let x = X0 + 0.5; x < X1; x += 0.9)
        for (const z of [Z0 - 0.45, Z1 + 0.45]) {
          if (x > TX0 && z > TZ0 - 1 && z < TZ1 + 1) continue;
          b.box("lime_ws", x, BASE - 0.75, z, 0.18, 0.28, 0.4, { seg: false });
        }
      // copper-and-slate mansard on the base block, with dormers
      {
        const mh = MANS - BASE,
          inset = 2.4;
        const face = (x0, z0, x1, z1, nx, nz) => {
          const len = Math.hypot(x1 - x0, z1 - z0),
            ry = Math.atan2(nx, nz),
            ang = Math.atan2(inset, mh);
          const cx = (x0 + x1) / 2 - (nx * inset) / 2,
            cz = (z0 + z1) / 2 - (nz * inset) / 2;
          b.box(
            "slate_roof",
            cx,
            BASE + mh / 2 - 0.2,
            cz,
            len,
            0.3,
            Math.hypot(inset, mh),
            { ry, rx: HP - ang, seg: true, segLen: 4, grime: 0.6 },
          );
          const n = Math.floor(len / 4.2);
          for (let i = 0; i < n; i++) {
            const t = (i + 0.5) / n,
              px = x0 + (x1 - x0) * t - nx * 1.0,
              pz = z0 + (z1 - z0) * t - nz * 1.0;
            b.box("copper_ws", px, BASE + 0.5, pz, 1.6, 2.6, 1.6, {
              ry,
              seg: false,
              grime: 0.5,
            });
            b.cyl("copper_ws", px, BASE + 3.1, pz, 0.8, 0.8, 1.6, 8, {
              rx: HP,
              ry,
              thetaLen: PI,
              thetaStart: -HP,
              hSeg: 1,
            });
            const q = PF.rot(px, pz, ry, 0, 0.82);
            b.quad(
              r() < 0.3 ? "glass_broken" : "glass_dark",
              q[0],
              BASE + 1.9,
              q[1],
              0.9,
              1.6,
              { ry, noAO: true },
            );
          }
        };
        face(X0, Z0, TX0, Z0, 0, -1);
        face(TX0, Z0, X1, Z0, 0, -1);
        face(X0, Z1, TX0, Z1, 0, 1);
        face(TX0, Z1, X1, Z1, 0, 1);
        face(X0, Z0, X0, Z1, -1, 0);
        b.boxMM(
          "tar_ws",
          X0 + inset,
          MANS - 0.1,
          Z0 + inset,
          TX0,
          MANS + 0.05,
          Z1 - inset,
          { segLen: 8 },
        );
        b.boxMM(
          "tar_ws",
          TX0,
          MANS - 0.1,
          Z0 + inset,
          X1 - inset,
          MANS + 0.05,
          TZ0,
          { segLen: 8 },
        );
        b.boxMM(
          "tar_ws",
          TX0,
          MANS - 0.1,
          TZ1,
          X1 - inset,
          MANS + 0.05,
          Z1 - inset,
          { segLen: 8 },
        );
        // THE STITCHERS' ROOF CAMP on the base block deck (the view from the sniper nest): scrap shacks, plank
        // walkways, a sandbagged firing step on the avenue corner, laundry, dress-form totems, a fire barrel
        {
          const y = MANS + 0.05;
          const shack = (x0, z0, x1, z1, seed) => {
            PF.scrapWall(b, x0, z0, x1, z0, 2.3, { seed, y });
            PF.scrapWall(b, x1, z0, x1, z1, 2.3, { seed: seed + 1, y });
            PF.scrapWall(b, x0, z1, x0 + (x1 - x0) * 0.45, z1, 2.3, {
              seed: seed + 2,
              y,
            });
            PF.scrapWall(b, x0, z0, x0, z1, 2.3, { seed: seed + 3, y });
            b.boxMM(
              "corrugated",
              x0 - 0.3,
              y + 2.3,
              z0 - 0.3,
              x1 + 0.3,
              y + 2.45,
              z1 + 0.3,
              { seg: false, grime: 0.6, rz: 0.04 },
            );
          };
          shack(X0 + 5, Z1 - 11, X0 + 11, Z1 - 5.5, 501);
          shack(X0 + 20, Z0 + 4.5, X0 + 25.5, Z0 + 9.5, 505);
          for (const [x0, z0, x1, z1] of [
            [X0 + 11, Z1 - 8.6, TX0 - 0.5, Z1 - 7.4],
            [X0 + 25.5, Z0 + 6.4, TX0 - 0.5, Z0 + 7.6],
            [TX0 - 0.5, Z0 + 2.6, TX0 + 0.7, Z1 - 2.6],
          ])
            b.boxMM("planks", x0, y, z0, x1, y + 0.12, z1, {
              seg: false,
              grime: 0.6,
            });
          PF.sandbags(b, X1 - 3.2, Z0 + 2.8, X1 - 3.2, TZ0 - 1.0, 3, {
            y,
            noCollide: true,
          });
          PF.sandbags(b, X1 - 7.5, Z0 + 2.8, X1 - 3.4, Z0 + 2.8, 3, {
            y,
            noCollide: true,
          });
          D.chair(b, X1 - 4.4, y, Z0 + 4.2, -HP - 0.3, false, "iron");
          for (let k = 0; k < 10; k++)
            b.cyl(
              "brass_ws",
              X1 - 4 + r() * 0.8,
              y + 0.02,
              Z0 + 3.6 + r() * 1.4,
              0.012,
              0.012,
              0.07,
              4,
              { hSeg: 1, rz: HP, ry: r() * 3 },
            );
          const la = V3(X0 + 12, y + 2.4, Z0 + 14),
            lc = V3(X0 + 24, y + 2.2, Z0 + 12);
          b.beam("rope", la, lc, 0.012, 0.012, { noAO: true });
          for (const [x, z] of [
            [X0 + 12, Z0 + 14],
            [X0 + 24, Z0 + 12],
          ])
            b.box("rotten", x, y, z, 0.1, 2.5, 0.1, { seg: false });
          for (let k = 1; k < 6; k++) {
            const q = la.clone().lerp(lc, k / 6);
            b.box(
              k % 2 ? "canvas_ws" : "fabric",
              q.x,
              q.y - 0.75,
              q.z,
              0.55,
              0.7,
              0.02,
              {
                ry: Math.atan2(-(lc.z - la.z), lc.x - la.x),
                seg: false,
                c: [0xa08a70, 0x7a3a30, 0xc8c0a8, 0x5a5a48, 0x9a7a5a][k - 1],
              },
            );
          }
          for (const [x, z, g] of [
            [X0 + 3.4, Z0 + 3.4, true],
            [X0 + 3.4, Z1 - 3.4, false],
            [TX0 - 3, Z1 - 3.2, true],
            [X1 - 3.4, Z1 - 3.4, true],
          ])
            PF.dressForm(b, x, y, z, r() * TAU, { gore: g, skull: g });
          PF.barrel(b, X0 + 16, y, Z0 + 16, { fire: true });
          PF.glow(V3(X0 + 16, y + 1.3, Z0 + 16), 0xff9040, 2.4, null, {
            intensity: 1.0,
            flicker: 0.35,
            dayFactor: 0.2,
          });
          for (let k = 0; k < 3; k++)
            D.mattress(b, X0 + 7.2 + k * 1.2, y, Z1 - 8.2, 0.1 * k, 0x7a5a48);
        }
        // roof clutter: water tank on the base roof, vents
        b.cyl("rotten", X0 + 8, MANS + 3.5, Z0 + 8, 2.2, 2.2, 4.2, 12, {
          hSeg: 2,
        });
        b.cyl("tar_ws", X0 + 8, MANS + 7.7, Z0 + 8, 0.2, 2.5, 1.4, 12, {
          hSeg: 1,
        });
        for (const [sx, sz] of [
          [-1.4, -1.4],
          [1.4, -1.4],
          [-1.4, 1.4],
          [1.4, 1.4],
        ])
          b.box("iron", X0 + 8 + sx, MANS, Z0 + 8 + sz, 0.2, 3.5, 0.2, {
            seg: false,
          });
      }
      // Base block windows: paired windows between shallow brick piers (floors 3..9), limestone surrounds
      const baseFloors = [],
        fh = 3.3;
      for (let y = 8.0; y < BASE - 2; y += fh) baseFloors.push(y);
      const baseRun = (x0, z0, x1, z1, ry) => {
        const len = Math.hypot(x1 - x0, z1 - z0),
          n = Math.floor(len / 3.2);
        const ux = (x1 - x0) / len,
          uz = (z1 - z0) / len;
        const nx = Math.sin(ry),
          nz = Math.cos(ry);
        for (let i = 0; i < n; i++) {
          const t = ((i + 0.5) * len) / n,
            px = x0 + ux * t + nx * 0.02,
            pz = z0 + uz * t + nz * 0.02;
          baseFloors.forEach((y, f) => {
            const roll = r();
            const pane =
              roll < 0.22
                ? "glass_broken"
                : roll < 0.3
                  ? "planks"
                  : roll > 0.985
                    ? "window_amber"
                    : "glass_dark";
            PF.classicWindow(b, px, y, pz, ry, 1.35, 2.2, {
              pane,
              frame: "lime_ws",
              head: f === 2 || f === 5 ? "pediment" : "cornice",
              keystone: f % 3 === 1,
            });
          });
          // iron balconette on the 4th floor
          b.box(
            "iron_green",
            px + nx * 0.35,
            baseFloors[3] - 0.25,
            pz + nz * 0.35,
            1.8,
            0.12,
            0.7,
            { ry, seg: false },
          );
          b.box(
            "iron_green",
            px + nx * 0.68,
            baseFloors[3] - 0.13,
            pz + nz * 0.68,
            1.8,
            0.95,
            0.05,
            { ry, seg: false },
          );
        }
        // shallow brick piers between the window columns
        for (let i = 0; i <= n; i++) {
          const t = (i * len) / n,
            px = x0 + ux * t + nx * 0.15,
            pz = z0 + uz * t + nz * 0.15;
          b.box(
            "brick_singer",
            px,
            7.55,
            pz,
            uz !== 0 ? 0.3 : 0.7,
            BASE - 1.2 - 7.55,
            uz !== 0 ? 0.7 : 0.3,
            { seg: false, grime: 0.5 },
          );
        }
      };
      baseRun(X0, Z0, TX0 - 0.5, Z0, PI);
      baseRun(TX0 + 0.5, Z0, X1 - 0.5, Z0, PI);
      baseRun(X0, Z1, TX0 - 0.5, Z1, 0);
      baseRun(TX0 + 0.5, Z1, X1 - 0.5, Z1, 0);
      baseRun(X0, Z0 + 0.5, X0, Z1 - 0.5, -HP);
      // east ends of the wings on the avenue (x = X1): windows too
      baseRun(X1, Z0 + 0.8, X1, TZ0 - 0.5, HP);
      baseRun(X1, TZ1 + 0.5, X1, Z1 - 0.8, HP);
      // ground storey: round-arched shopfronts (2 storeys tall) — boarded, broken, some with raider junk
      const shopRun = (x0, z0, x1, z1, ry) => {
        const len = Math.hypot(x1 - x0, z1 - z0),
          n = Math.floor(len / 4.6);
        const ux = (x1 - x0) / len,
          uz = (z1 - z0) / len;
        for (let i = 0; i < n; i++) {
          const t = ((i + 0.5) * len) / n,
            px = x0 + ux * t,
            pz = z0 + uz * t;
          const roll = r();
          PF.archBay(b, px, 0.5, pz, ry, 3.0, 5.6, {
            pane:
              roll < 0.3
                ? "planks"
                : roll < 0.55
                  ? "glass_broken"
                  : "glass_dark",
            ring: "lime_ws",
            key: "lime_ws",
            sash: roll >= 0.3,
            sashKey: "iron_green",
            ringW: 0.36,
          });
        }
      };
      shopRun(X0 + 1, Z0 - 0.02, TX0 - 1, Z0 - 0.02, PI);
      shopRun(TX0 + 0.8, Z0 - 0.02, X1 - 0.8, Z0 - 0.02, PI);
      shopRun(X0 + 1, Z1 + 0.02, TX0 - 1, Z1 + 0.02, 0);
      shopRun(TX0 + 0.8, Z1 + 0.02, X1 - 0.8, Z1 + 0.02, 0);
      shopRun(X0 - 0.02, Z0 + 1, X0 - 0.02, Z1 - 1, -HP);
      shopRun(X1 + 0.02, Z0 + 1, X1 + 0.02, TZ0 - 0.6, HP);
      shopRun(X1 + 0.02, TZ1 + 0.6, X1 + 0.02, Z1 - 1, HP);

      // =================================================================
      // THE TOWER
      // =================================================================
      const TW = TX1 - TX0,
        pier = 3.2;
      // tower mass; the ground storey is carved around the portal recess (x > X1 - 2.3, |z - TZC| < 3, y < 8.6)
      b.boxMM("brick_singer", TX0, 8.6, TZ0, TX1, TOP, TZ1, {
        segLen: 6,
        grime: 0.5,
      });
      b.boxMM("lime_ws", TX0, 0, TZ0, TX1 - 2.3, 8.6, TZ1, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("lime_ws", TX1 - 2.3, 0, TZ0, TX1, 8.6, TZC - 3.0, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("lime_ws", TX1 - 2.3, 0, TZC + 3.0, TX1, 8.6, TZ1, {
        segLen: 5,
        grime: 0.55,
      });
      // tower collider: the ground storey leaves the portal recess (x > X1 - 2.3, |z - TZC| < 3) open
      PF.colMM(TX0, 0, TZ0, TX1 - 2.3, 8.6, TZ1, { walkable: false });
      PF.colMM(TX1 - 2.3, 0, TZ0, TX1, 8.6, TZC - 3.0, { walkable: false });
      PF.colMM(TX1 - 2.3, 0, TZC + 3.0, TX1, 8.6, TZ1, { walkable: false });
      PF.colMM(TX0, 8.6, TZ0, TX1, TOP + 1.2, TZ1, { walkable: true });
      // each face: banded corner piers, recessed central bay with iron spandrels
      const faces = [
        { nx: 1, nz: 0, ry: HP },
        { nx: -1, nz: 0, ry: -HP },
        { nx: 0, nz: 1, ry: 0 },
        { nx: 0, nz: -1, ry: PI },
      ];
      for (const F of faces) {
        const cx = TXC + (F.nx * TW) / 2,
          cz = TZC + (F.nz * TW) / 2;
        const ux = -F.nz,
          uz = F.nx; // along-face direction
        const y0 = F.nx === -1 ? MANS : 7.0; // west face rises above the base roof
        // corner piers proud of the wall, limestone bands every 2.6 m
        for (const sg of [-1, 1]) {
          const off = sg * (TW / 2 - pier / 2);
          const px = cx + ux * off + F.nx * 0.3,
            pz = cz + uz * off + F.nz * 0.3;
          b.box(
            "brick_singer",
            px,
            0,
            pz,
            Math.abs(ux) > 0 ? pier : 0.6,
            TOP - 0.5,
            Math.abs(uz) > 0 ? pier : 0.6,
            { segLen: 6, grime: 0.5 },
          );
          for (let y = 7.5; y < TOP - 3; y += 2.6)
            b.box(
              "lime_ws",
              px + F.nx * 0.05,
              y,
              pz + F.nz * 0.05,
              Math.abs(ux) > 0 ? pier + 0.08 : 0.7,
              0.45,
              Math.abs(uz) > 0 ? pier + 0.08 : 0.7,
              { seg: false, grime: 0.35 },
            );
        }
        // central bay: windows in threes per floor, green cast-iron mullions & spandrels, balconies every 6 floors
        const bayW = TW - pier * 2 - 0.6;
        for (let y = Math.max(8.2, y0 + 1); y < TOP - 14; y += 3.2) {
          const floorIdx = Math.round((y - 8.2) / 3.2);
          for (let k = -1; k <= 1; k++) {
            const off = (k * bayW) / 3;
            const px = cx + ux * off + F.nx * 0.03,
              pz = cz + uz * off + F.nz * 0.03;
            const roll = r();
            b.quad(
              roll < 0.18
                ? "glass_broken"
                : roll < 0.25
                  ? "planks"
                  : roll > 0.99
                    ? "window_amber"
                    : "glass_dark",
              px,
              y + 1.1,
              pz,
              bayW / 3 - 0.45,
              2.2,
              { ry: F.ry, noAO: true, grime: 0.1 },
            );
            // bronze cartouche on the spandrel under each light
            b.box(
              "bronze_door",
              px + F.nx * 0.13,
              y - 0.78,
              pz + F.nz * 0.13,
              Math.abs(ux) > 0 ? 0.55 : 0.08,
              0.45,
              Math.abs(uz) > 0 ? 0.55 : 0.08,
              { seg: false, grime: 0.35 },
            );
          }
          // spandrel panel below the windows (cast iron, verdigris) + limestone sill course
          b.box(
            "iron_green",
            cx + F.nx * 0.08,
            y - 0.95,
            cz + F.nz * 0.08,
            Math.abs(ux) > 0 ? bayW : 0.12,
            0.9,
            Math.abs(uz) > 0 ? bayW : 0.12,
            { seg: false, grime: 0.4 },
          );
          b.box(
            "lime_ws",
            cx + F.nx * 0.12,
            y - 0.08,
            cz + F.nz * 0.12,
            Math.abs(ux) > 0 ? bayW + 0.1 : 0.2,
            0.12,
            Math.abs(uz) > 0 ? bayW + 0.1 : 0.2,
            { seg: false, grime: 0.45 },
          );
          if (floorIdx % 6 === 3) {
            // iron balcony across the bay
            b.box(
              "iron_green",
              cx + F.nx * 0.55,
              y - 0.2,
              cz + F.nz * 0.55,
              Math.abs(ux) > 0 ? bayW + 0.4 : 1.0,
              0.12,
              Math.abs(uz) > 0 ? bayW + 0.4 : 1.0,
              { seg: false },
            );
            b.box(
              "iron_green",
              cx + F.nx * 1.02,
              y - 0.08,
              cz + F.nz * 1.02,
              Math.abs(ux) > 0 ? bayW + 0.4 : 0.05,
              1.0,
              Math.abs(uz) > 0 ? bayW + 0.4 : 0.05,
              { seg: false },
            );
          }
        }
        // mullions (vertical iron strips) running the full bay
        for (const k of [-0.5, 0.5]) {
          const off = (k * bayW) / 3;
          b.box(
            "iron_green",
            cx + ux * off + F.nx * 0.1,
            Math.max(7.5, y0),
            cz + uz * off + F.nz * 0.1,
            Math.abs(ux) > 0 ? 0.3 : 0.2,
            TOP - 14 - Math.max(7.5, y0),
            Math.abs(uz) > 0 ? 0.3 : 0.2,
            { seg: false, grime: 0.3 },
          );
        }
        // the great arched window at the top of each bay (+ limestone arch & keystone)
        PF.archBay(
          b,
          cx + F.nx * 0.04,
          TOP - 13.2,
          cz + F.nz * 0.04,
          F.ry,
          bayW - 0.6,
          9.2,
          {
            pane: F.nx === 1 ? "glass_broken" : "glass_dark",
            ring: "lime_ws",
            key: "lime_ws",
            sash: true,
            sashKey: "iron_green",
            ringW: 0.5,
            n: 15,
          },
        );
        // cartouche + garland above the arch
        b.box(
          "lime_ws",
          cx + F.nx * 0.2,
          TOP - 3.5,
          cz + F.nz * 0.2,
          Math.abs(ux) > 0 ? 2.6 : 0.4,
          1.6,
          Math.abs(uz) > 0 ? 2.6 : 0.4,
          { seg: false },
        );
        b.sphere(
          "gilt_matte",
          cx + F.nx * 0.45,
          TOP - 2.7,
          cz + F.nz * 0.45,
          0.45,
          { ws: 8, hs: 6, sx: 1, sy: 1.3 },
        );
      }
      // SHELL HOLES punched through the brick piers: black void, broken brick rim, a floor slab edge, bent rebar
      for (const [F, sg, y, seed] of [
        [faces[2], -1, 57, 1],
        [faces[2], 1, 72, 3],
        [faces[0], 1, 88, 2],
      ]) {
        // sunlit south & east faces
        const ux = -F.nz,
          uz = F.nx,
          off = sg * (TW / 2 - pier / 2);
        const px = TXC + F.nx * (TW / 2 + 0.61) + ux * off,
          pz = TZC + F.nz * (TW / 2 + 0.61) + uz * off;
        const rr = PF.rng("sghole" + seed);
        const hs = new THREE.Shape();
        const N = 11;
        for (let k = 0; k < N; k++) {
          const a = (k / N) * TAU,
            rad = 0.95 + rr() * 0.45;
          const hx = Math.cos(a) * rad * 1.1,
            hy = Math.sin(a) * rad * 0.95;
          if (k === 0) hs.moveTo(hx, hy);
          else hs.lineTo(hx, hy);
        }
        hs.closePath();
        // fresh-broken brick & mortar ring (pale, catches the light) behind the black void — the hole reads even in shade
        const rim = new THREE.Shape();
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * TAU,
            rad = 1.45 + rr() * 0.55;
          const hx = Math.cos(a) * rad * 1.15,
            hy = Math.sin(a) * rad;
          if (k === 0) rim.moveTo(hx, hy);
          else rim.lineTo(hx, hy);
        }
        rim.closePath();
        b.add("rubble", PF.shapeGeo(rim, 1), {
          m: PF.m4(px + F.nx * 0.005, y, pz + F.nz * 0.005, F.ry),
          uv: "box",
          noAO: true,
          grime: 0.2,
          c: 0xe8b890,
        });
        b.add("glass_broken", PF.shapeGeo(hs, 1), {
          m: PF.m4(px + F.nx * 0.015, y, pz + F.nz * 0.015, F.ry),
          uv: "box",
          noAO: true,
          grime: 0,
        });
        for (let k = 0; k < 9; k++) {
          const a = (k / 9) * TAU + rr() * 0.3,
            rad = 1.55 + rr() * 0.3;
          b.rock(
            "brick_singer",
            px + ux * Math.cos(a) * rad * 1.1 + F.nx * 0.1,
            y + Math.sin(a) * rad * 0.95,
            pz + uz * Math.cos(a) * rad * 1.1 + F.nz * 0.1,
            0.24 + rr() * 0.2,
            { flat: 0.6, detail: 0, seed: seed * 10 + k, c: 0xf0c0a0 },
          );
        }
        b.box(
          "concrete",
          px + F.nx * 0.05,
          y - 0.35,
          pz + F.nz * 0.05,
          Math.abs(ux) > 0 ? 2.0 : 0.7,
          0.28,
          Math.abs(uz) > 0 ? 2.0 : 0.7,
          {
            rz: Math.abs(ux) > 0 ? 0.06 : 0,
            rx: Math.abs(uz) > 0 ? 0.06 : 0,
            seg: false,
            grime: 0.7,
          },
        );
        for (let k = 0; k < 5; k++) {
          const lo = (k - 2) * 0.35;
          const a0 = V3(px + ux * lo, y - 0.25, pz + uz * lo),
            a1 = V3(
              px + ux * (lo + (rr() - 0.5) * 0.4) + F.nx * (0.6 + rr() * 0.5),
              y - 0.25 - rr() * 0.6,
              pz + uz * (lo + (rr() - 0.5) * 0.4) + F.nz * (0.6 + rr() * 0.5),
            );
          b.beam("rust", a0, a1, 0.03, 0.03, { noAO: true });
        }
        for (let k = 0; k < 6; k++)
          b.box(
            "tar_ws",
            px + ux * (rr() - 0.5) * 2.2 + F.nx * 0.02,
            y + 0.9 + rr() * 0.6,
            pz + uz * (rr() - 0.5) * 2.2 + F.nz * 0.02,
            Math.abs(ux) > 0 ? 0.3 + rr() * 0.3 : 0.02,
            1.2 + rr() * 2,
            Math.abs(uz) > 0 ? 0.3 + rr() * 0.3 : 0.02,
            { seg: false, noAO: true, grime: 0.1 },
          ); // soot above
      }
      // top cornice + balustrade around the dome base
      b.boxMM(
        "lime_ws",
        TX0 - 0.6,
        TOP - 1.0,
        TZ0 - 0.6,
        TX1 + 0.6,
        TOP,
        TZ1 + 0.6,
        { seg: false, grime: 0.4 },
      );
      b.boxMM(
        "lime_ws",
        TX0 - 0.9,
        TOP,
        TZ0 - 0.9,
        TX1 + 0.9,
        TOP + 0.4,
        TZ1 + 0.9,
        { seg: false, grime: 0.4 },
      );
      K.balustrade(
        b,
        "lime_ws",
        [
          [TXC + 1.8, TZ0 - 0.6],
          [TX1 + 0.6, TZ0 - 0.6],
          [TX1 + 0.6, TZ1 + 0.6],
          [TX0 - 0.6, TZ1 + 0.6],
          [TX0 - 0.6, TZ0 - 0.6],
          [TXC - 4.2, TZ0 - 0.6],
        ],
        TOP + 0.4,
        1.0,
        { urns: true, seg: 4 },
      ); // 112 m up: 4-sided balusters
      // the lost run: two stumps and a fallen baluster on the cornice
      for (const x of [TXC - 3.9, TXC + 1.5])
        b.box("lime_ws", x, TOP + 0.4, TZ0 - 0.6, 0.3, 0.5, 0.3, {
          seg: false,
          grime: 0.6,
          rz: (x - TXC) * 0.05,
        });
      b.cyl("lime_ws", TXC - 1.2, TOP + 0.55, TZ0 - 0.4, 0.12, 0.15, 0.8, 8, {
        rz: HP,
        ry: 0.4,
        hSeg: 1,
        grime: 0.6,
      });
      // the Singer Tower name band over the entrance
      const AT = PF.atlas("singer", [
        [
          "name",
          PF.signTex("sg_name", ["SINGER BUILDING"], "engraved", 1024, 128, {
            bg: "#d8ccb0",
          }),
        ],
        [
          "warn",
          PF.signTex(
            "sg_warn",
            ["STITCHERS", "TRESPASSERS GET", "SEWN UP"],
            "raider",
            512,
            256,
            {},
          ),
        ],
      ]);
      const GA = PF.atlas(
        "singer_graf",
        [
          [
            "g1",
            PF.graffitiTex("sg_g1", ["STITCHERS"], 512, 256, {
              color: "#c8281e",
            }),
          ],
          [
            "g2",
            PF.graffitiTex(
              "sg_g2",
              ["NEEDLE & THREAD", "BLOOD & LEAD"],
              512,
              256,
              { color: "#e0d0b0" },
            ),
          ],
          [
            "g3",
            PF.graffitiTex("sg_g3", ["PINCUSHION", "← THIS WAY"], 512, 256, {
              color: "#c8281e",
            }),
          ],
        ],
        { transparent: true, rough: 0.9 },
      );

      // =================================================================
      // THE DOME: rounded-square bulbous mansard (red copper with gilt ribs)
      // =================================================================
      {
        const H = TW / 2 + 0.2;
        const prof = [
          [H, 0],
          [H + 0.9, 1.2],
          [H + 1.3, 3.2],
          [H + 1.1, 6.0],
          [H + 0.2, 9.0],
          [H - 1.8, 12.5],
          [H - 3.9, 15.5],
          [H - 5.5, 18.2],
          [H - 6.3, 20.0],
          [0.001, 20.2],
        ];
        const pts = prof.map((p) => new THREE.Vector2(p[0], p[1]));
        // the sheathing is torn off near the south-east corner (between y 9 and 15.5): the dome is built as the
        // full shell minus that window, plus the rows above and below the tear
        const sqd = (v) => {
          const a = Math.atan2(v.z, v.x);
          const f = sq(a, 7);
          v.x *= f;
          v.z *= f;
        };
        const gap0 = HP - 0.77,
          gapW = 0.27; // lathe phi → atan2(z,x) = π/2 − phi ≈ 0.5..0.77
        const geo = new THREE.LatheGeometry(pts, 44, gap0 + gapW, TAU - gapW);
        PF.deform(geo, sqd);
        b.add("dome_red", geo, { m: PF.m4(TXC, TOP + 0.4, TZC), grime: 0.45 });
        for (const part of [pts.slice(0, 5), pts.slice(6)]) {
          const g2 = new THREE.LatheGeometry(part, 4, gap0, gapW);
          PF.deform(g2, sqd);
          b.add("dome_red", g2, { m: PF.m4(TXC, TOP + 0.4, TZC), grime: 0.5 });
        }
        {
          // dark inner shell behind the tear, the steel ribs & purlins, sheets curling away
          const inner = new THREE.LatheGeometry(
            pts.slice(3, 8).map((p) => new THREE.Vector2(p.x * 0.86, p.y)),
            4,
            gap0 - 0.06,
            gapW + 0.12,
          );
          PF.deform(inner, sqd);
          b.add("vault_dk", inner, {
            m: PF.m4(TXC, TOP + 0.4, TZC),
            grime: 0.1,
            noAO: true,
            c: 0x1e1e1e,
          });
          const at = (a, y, inset) => {
            let rr = 0;
            for (let i = 0; i < prof.length - 1; i++) {
              if (y >= prof[i][1] && y <= prof[i + 1][1]) {
                const t = (y - prof[i][1]) / (prof[i + 1][1] - prof[i][1]);
                rr = prof[i][0] + (prof[i + 1][0] - prof[i][0]) * t;
                break;
              }
            }
            rr = rr * sq(a, 7) - inset;
            return V3(
              TXC + Math.cos(a) * rr,
              TOP + 0.4 + y,
              TZC + Math.sin(a) * rr,
            );
          };
          for (const a of [0.55, 0.66, 0.74]) {
            let prev = null;
            for (let y = 8.6; y <= 16; y += 1.1) {
              const q = at(a, y, 0.25);
              if (prev)
                b.beam("rust", prev, q, 0.2, 0.24, {
                  noAO: true,
                  grime: 0.3,
                  c: 0xd8a080,
                });
              prev = q;
            }
          }
          for (const y of [10.2, 12.0, 13.8])
            b.beam("rust", at(0.52, y, 0.3), at(0.76, y, 0.3), 0.14, 0.14, {
              noAO: true,
              grime: 0.3,
              c: 0xd8a080,
            });
          // what is left of the timber sheathing: pale boards across the ribs, some snapped
          for (const [y, a0, a1] of [
            [9.6, 0.5, 0.64],
            [10.9, 0.58, 0.77],
            [11.6, 0.5, 0.6],
            [13.1, 0.62, 0.77],
            [14.4, 0.5, 0.7],
            [15.1, 0.66, 0.77],
          ])
            b.beam(
              "planks",
              at(a0, y, 0.12),
              at(a1, y + 0.1, 0.12),
              0.3,
              0.06,
              { noAO: true, grime: 0.4, c: 0xe8d0b0 },
            );
          for (const [a, y, rz] of [
            [0.6, 9.2, 0.8],
            [0.7, 15.3, -0.6],
          ]) {
            const q = at(a, y, -0.1);
            b.box("dome_red", q.x, q.y - 0.9, q.z, 0.9, 1.4, 0.04, {
              ry: -a + HP,
              rx: 0.5,
              rz,
              seg: false,
              grime: 0.6,
            });
          }
        }
        // gilt ribs on the four corners and the face centres
        const ribAt = (a, key, w) => {
          let prev = null;
          for (let i = 0; i < prof.length - 1; i++) {
            const f = sq(a, 7),
              rr = prof[i][0] * f + 0.08;
            const p = V3(
              TXC + Math.cos(a) * rr,
              TOP + 0.4 + prof[i][1],
              TZC + Math.sin(a) * rr,
            );
            if (prev) b.beam(key, prev, p, w, w, { noAO: true, grime: 0.2 });
            prev = p;
          }
        };
        for (let i = 0; i < 4; i++) {
          ribAt(PI / 4 + i * HP, "gilt_matte", 0.35);
          ribAt(i * HP, "gilt_matte", 0.2);
        }
        // gilt garland band
        b.lathe(
          "gilt_matte",
          [
            [H + 1.36, 2.9],
            [H + 1.48, 3.2],
            [H + 1.36, 3.5],
          ],
          48,
          TXC,
          TOP + 0.4,
          TZC,
          {
            deform: (v) => {
              const a = Math.atan2(v.z, v.x);
              const f = sq(a, 7);
              v.x *= f;
              v.z *= f;
            },
          },
        );
        // four giant oeil-de-boeuf dormers (round windows in ornate limestone frames) + small upper dormers
        for (const F of faces) {
          const cx = TXC + F.nx * (H + 1.1),
            cz = TZC + F.nz * (H + 1.1);
          const yb = TOP + 0.4 + 4.6;
          b.box(
            "lime_ws",
            cx,
            yb - 2.2,
            cz,
            Math.abs(F.nz) > 0 ? 4.6 : 1.2,
            4.8,
            Math.abs(F.nx) > 0 ? 4.6 : 1.2,
            { seg: false, grime: 0.4 },
          );
          const og = new THREE.CylinderGeometry(1.5, 1.5, 0.3, 20);
          og.rotateX(HP);
          b.add("lime_ws", og, {
            m: PF.m4(cx + F.nx * 0.55, yb, cz + F.nz * 0.55, F.ry),
            grime: 0.3,
          });
          const ogp = new THREE.CircleGeometry(1.15, 20);
          b.add(F.nz === -1 ? "window_amber" : "glass_dark", ogp, {
            m: PF.m4(cx + F.nx * 0.72, yb, cz + F.nz * 0.72, F.ry),
            uv: "box",
            noAO: true,
            grime: 0,
          });
          if (F.nz === -1)
            PF.glow(
              V3(cx + F.nx * 0.2, yb, cz + F.nz * 0.2),
              0xffa040,
              1.8,
              null,
              { intensity: 0.6, flicker: 0.15, dayFactor: 0.1 },
            );
          b.sphere(
            "gilt_matte",
            cx + F.nx * 0.8,
            yb + 1.9,
            cz + F.nz * 0.8,
            0.4,
            { ws: 8, hs: 6 },
          );
          // pediment-crowned dormer high on the dome
          const ux = -F.nz,
            uz = F.nx;
          for (const sg of [-1, 1]) {
            const dx = TXC + F.nx * (H - 1.6) + ux * sg * 3.0,
              dz = TZC + F.nz * (H - 1.6) + uz * sg * 3.0;
            b.box(
              "lime_ws",
              dx,
              TOP + 0.4 + 11.2,
              dz,
              Math.abs(F.nz) > 0 ? 1.3 : 1.4,
              2.0,
              Math.abs(F.nx) > 0 ? 1.3 : 1.4,
              { seg: false },
            );
            const dl = (F.nx === 1 && sg > 0) || (F.nz === 1 && sg < 0); // raider lamps in two of the dome dormers
            b.quad(
              dl ? "window_amber" : "glass_dark",
              dx + F.nx * 0.72,
              TOP + 0.4 + 12.1,
              dz + F.nz * 0.72,
              0.8,
              1.3,
              { ry: F.ry, noAO: true },
            );
            K.pediment(
              b,
              "lime_ws",
              dx + F.nx * 0.2,
              TOP + 0.4 + 13.2,
              dz + F.nz * 0.2,
              1.6,
              0.6,
              1.2,
              F.ry,
              {},
            );
          }
        }
        // dome colliders (stepped, not walkable except the gallery)
        for (let i = 0; i < prof.length - 2; i++) {
          const hh = prof[i][0],
            y0 = TOP + 0.4 + prof[i][1],
            y1 = TOP + 0.4 + prof[i + 1][1];
          PF.colMM(TXC - hh, y0, TZC - hh, TXC + hh, y1, TZC + hh, {
            walkable: false,
          });
        }
      }

      // =================================================================
      // LANTERN + walkable gallery (the sniper nest) + cupola + flagpole
      // =================================================================
      {
        const L = 2.4,
          gy = DOME; // lantern half-size, gallery floor
        // gallery ring floor (iron plate on brackets) + railing
        const G0 = 4.4;
        b.boxMM(
          "iron_green",
          TXC - G0,
          gy - 0.25,
          TZC - G0,
          TXC + G0,
          gy,
          TZC + G0,
          { seg: false, grime: 0.4 },
        );
        PF.colMM(TXC - G0, gy - 0.6, TZC - G0, TXC + G0, gy, TZC + G0, {
          surface: "metal",
        });
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          b.beam(
            "iron_green",
            V3(TXC + Math.cos(a) * 3.0, gy - 2.2, TZC + Math.sin(a) * 3.0),
            V3(
              TXC + Math.cos(a) * (G0 - 0.2),
              gy - 0.2,
              TZC + Math.sin(a) * (G0 - 0.2),
            ),
            0.1,
            0.1,
          );
        }
        const rl = [
          [TXC - G0, TZC - G0],
          [TXC + G0, TZC - G0],
          [TXC + G0, TZC + G0],
          [TXC - G0, TZC + G0],
        ];
        for (let i = 0; i < 4; i++) {
          const a = rl[i],
            c = rl[(i + 1) % 4];
          PF.rail(b, a[0], a[1], c[0], c[1], gy, { key: "iron_green", h: 1.1 });
        }
        // lantern: four gilded piers, arched openings (glazed, one broken) between them
        b.boxMM("dome_red", TXC - L, gy, TZC - L, TXC + L, gy + 0.3, TZC + L, {
          seg: false,
        });
        for (const sx of [-1, 1])
          for (const sz of [-1, 1]) {
            b.box(
              "lime_ws",
              TXC + sx * (L - 0.4),
              gy,
              TZC + sz * (L - 0.4),
              0.8,
              5.2,
              0.8,
              { seg: false, grime: 0.4 },
            );
            b.box(
              "gilt_matte",
              TXC + sx * (L - 0.4),
              gy + 5.2,
              TZC + sz * (L - 0.4),
              0.95,
              0.3,
              0.95,
              { seg: false },
            );
          }
        for (const F of faces) {
          const cx = TXC + F.nx * (L - 0.1),
            cz = TZC + F.nz * (L - 0.1);
          if (F.nx === 1) {
            // the east opening is the door out of the interior lantern — open, with the raiders' sandbags
            PF.archBay(b, cx, gy + 0.3, cz, F.ry, 2.4, 4.4, {
              pane: "glass_broken",
              ring: "gilt_matte",
              ringW: 0.22,
              n: 9,
            });
          } else
            PF.archBay(b, cx, gy + 0.3, cz, F.ry, 2.4, 4.4, {
              pane: F.nz === 1 ? "glass_broken" : "glass_dark",
              ring: "gilt_matte",
              ringW: 0.22,
              n: 9,
              sash: true,
              sashKey: "iron_green",
            });
          const ux = -F.nz,
            uz = F.nx;
          for (const sg of [-1, 1])
            b.box(
              "dome_red",
              cx + ux * sg * 1.55,
              gy + 0.3,
              cz + uz * sg * 1.55,
              Math.abs(ux) > 0 ? 0.7 : 0.25,
              4.9,
              Math.abs(uz) > 0 ? 0.7 : 0.25,
              { seg: false },
            );
          b.box(
            "dome_red",
            cx,
            gy + 4.3,
            cz,
            Math.abs(ux) > 0 ? 2.6 : 0.25,
            0.9,
            Math.abs(uz) > 0 ? 2.6 : 0.25,
            { seg: false },
          );
        }
        PF.colMM(TXC - L, gy, TZC - L, TXC + L, gy + 5.4, TZC + L, {
          walkable: false,
        });
        b.boxMM(
          "lime_ws",
          TXC - L - 0.4,
          gy + 5.2,
          TZC - L - 0.4,
          TXC + L + 0.4,
          gy + 5.8,
          TZC + L + 0.4,
          { seg: false },
        );
        // cupola (small rounded-square dome) + gilt ball + flagpole with a tattered Stitchers flag
        const cup = new THREE.LatheGeometry(
          [
            [L + 0.2, 0],
            [L + 0.1, 0.8],
            [L - 0.7, 2.0],
            [1.0, 2.8],
            [0.3, 3.2],
            [0.001, 3.3],
          ].map((p) => new THREE.Vector2(p[0], p[1])),
          32,
        );
        PF.deform(cup, (v) => {
          const a = Math.atan2(v.z, v.x);
          const f = sq(a, 6);
          v.x *= f;
          v.z *= f;
        });
        b.add("dome_red", cup, { m: PF.m4(TXC, gy + 5.8, TZC), grime: 0.4 });
        for (let i = 0; i < 4; i++) {
          const a = PI / 4 + i * HP;
          b.beam(
            "gilt_matte",
            V3(
              TXC + Math.cos(a) * (L + 0.5),
              gy + 5.8,
              TZC + Math.sin(a) * (L + 0.5),
            ),
            V3(TXC + Math.cos(a) * 0.4, gy + 9.0, TZC + Math.sin(a) * 0.4),
            0.14,
            0.14,
          );
        }
        b.sphere("gilt_matte", TXC, gy + 9.4, TZC, 0.5, { ws: 10, hs: 8 });
        b.cyl("iron", TXC, gy + 9.8, TZC, 0.07, 0.1, FLAG - gy - 9.8, 6, {
          hSeg: 2,
        });
        const flagKey = PF.texMat(
          "sg_flag",
          PF.graffitiTex("sg_flag", ["STITCHERS"], 256, 128, {
            color: "#e8d8c0",
            tag: "skull",
          }),
          { transparent: true, side: THREE.DoubleSide, noShadow: true },
        );
        b.box("rotten", TXC + 1.4, FLAG - 2.2, TZC, 2.8, 1.5, 0.03, {
          seg: false,
          c: 0x3a1a18,
        });
        b.quad(flagKey, TXC + 1.4, FLAG - 1.45, TZC + 0.03, 2.6, 1.3, {
          ry: 0,
          grime: 0.2,
        });
        b.quad(flagKey, TXC + 1.4, FLAG - 1.45, TZC - 0.03, 2.6, 1.3, {
          ry: PI,
          grime: 0.2,
        });
        // sniper-nest dressing on the gallery: sandbags, a scope glint, spent brass, a lookout chair
        PF.sandbags(b, TXC + 3.3, TZC + 1.3, TXC + 3.3, TZC + 3.9, 2, {
          y: gy,
          noCollide: true,
        });
        D.chair(b, TXC + 2.9, gy, TZC - 3.2, -HP);
        D.papers(b, TXC + 3.4, gy, TZC + 2.6, 0.6, 8, 91);
        PF.glow(V3(TXC + 3.6, gy + 1.1, TZC + 0.4), 0xffe0a0, 0.6, null, {
          intensity: 1.5,
          flicker: 0.6,
        });
        // the nest has to read from the street at night: a fire basket, a raider searchlight, a red-lit trophy cage
        b.cyl("iron", TXC + 0.6, gy, TZC - 3.5, 0.05, 0.05, 1.0, 5, {
          hSeg: 1,
        });
        b.cyl("iron", TXC + 0.6, gy + 1.0, TZC - 3.5, 0.4, 0.22, 0.45, 8, {
          hSeg: 1,
          open: true,
        });
        b.cyl("fire", TXC + 0.6, gy + 1.1, TZC - 3.5, 0.3, 0.2, 0.3, 8, {
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
        PF.fires.push(V3(TXC + 0.6, gy + 1.5, TZC - 3.5));
        PF.glow(V3(TXC + 0.6, gy + 1.6, TZC - 3.5), 0xff9040, 3.4, null, {
          intensity: 1.2,
          flicker: 0.35,
          dayFactor: 0.2,
        });
        b.box("iron", TXC - 3.4, gy, TZC + 3.4, 0.5, 1.0, 0.5, { seg: false });
        b.cyl("chrome", TXC - 3.2, gy + 1.2, TZC + 3.4, 0.35, 0.3, 0.6, 12, {
          rz: -HP + 0.25,
          hSeg: 1,
        });
        b.cyl(
          "glass_dark",
          TXC - 2.9,
          gy + 1.28,
          TZC + 3.4,
          0.28,
          0.28,
          0.02,
          12,
          { rz: -HP + 0.25, hSeg: 1, noAO: true, grime: 0 },
        );
        PF.glow(V3(TXC - 2.6, gy + 1.35, TZC + 3.4), 0xfff0d0, 2.2, null, {
          intensity: 1.0,
          dayFactor: 0,
        });
        {
          const cx = TXC - 3.5,
            cz = TZC - 3.4;
          b.beam(
            "iron",
            V3(cx, gy + 3.0, cz),
            V3(cx, gy + 2.3, cz),
            0.03,
            0.03,
          );
          b.beam(
            "iron",
            V3(cx, gy + 3.0, cz),
            V3(TXC - L + 0.2, gy + 5.0, TZC - L + 0.2),
            0.04,
            0.04,
          );
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * TAU;
            b.beam(
              "iron",
              V3(cx + Math.cos(a) * 0.4, gy + 2.3, cz + Math.sin(a) * 0.4),
              V3(cx + Math.cos(a) * 0.4, gy + 0.6, cz + Math.sin(a) * 0.4),
              0.025,
              0.025,
            );
          }
          b.cyl("iron", cx, gy + 0.55, cz, 0.45, 0.45, 0.05, 8, { hSeg: 1 });
          b.sphere("bone", cx, gy + 1.8, cz, 0.11, { ws: 7, hs: 5 });
          b.box("bone", cx, gy + 0.9, cz, 0.25, 0.75, 0.15, { seg: false });
          b.sphere("lamp_red", cx, gy + 2.25, cz, 0.1, {
            ws: 6,
            hs: 4,
            noAO: true,
            grime: 0,
          });
          PF.glow(V3(cx, gy + 2.1, cz), 0xff2a1a, 2.2, null, {
            intensity: 1.2,
            flicker: 0.3,
            dayFactor: 0.2,
          });
        }
        anchors.gallery = PF.anchor(SG.gallery.x, gy + 0.05, SG.gallery.z, -HP);
        anchors.sniper = PF.anchor(TXC + 2.75, gy + 0.05, TZC + 2.6, -HP);
        anchors.lantern_door = PF.anchor(TXC + L + 0.3, gy + 1.6, TZC, -HP);
      }

      // =================================================================
      // MAIN PORTAL (east, on the avenue): recessed 2-storey arch, bronze doors,
      // iron-and-glass marquee — and the Stitchers' welcome
      // =================================================================
      {
        const ex = X1,
          ez = TZC;
        // recess: frame piers of rusticated limestone
        for (const sg of [-1, 1])
          b.box("lime_ws", ex - 0.2, 0, ez + sg * 3.6, 1.2, 8.6, 1.4, {
            seg: false,
            grime: 0.55,
          });
        PF.archBay(b, ex - 1.95, 0.25, ez, HP, 4.6, 7.6, {
          pane: "window_amber",
          ring: "lime_ws",
          key: "lime_ws",
          sash: true,
          sashKey: "iron_green",
          ringW: 0.55,
          n: 13,
          jambs: true,
        });
        b.boxMM("lime_ws", ex - 2.2, 7.9, ez - 3.0, ex - 0.1, 8.6, ez + 3.0, {
          seg: false,
        });
        b.boxMM("lime_ws", ex - 2.3, 0, ez - 3.0, ex - 2.0, 7.9, ez + 3.0, {
          seg: false,
        });
        b.boxMM("lime_ws", ex - 2.3, 0, ez - 3.0, ex - 0.1, 0.25, ez + 3.0, {
          seg: false,
        });
        PF.colMM(ex - 2.3, 0, ez - 3.0, ex - 0.1, 0.25, ez + 3.0, {
          surface: "concrete",
        });
        // bronze revolving door drum + side doors (one blown off)
        b.cyl("bronze_door", ex - 2.0, 0.25, ez, 1.1, 1.1, 2.7, 14, {
          hSeg: 1,
          open: true,
          thetaStart: 0.4,
          thetaLen: 2.2,
        });
        b.cyl("bronze_door", ex - 2.0, 2.95, ez, 1.2, 1.2, 0.3, 14, {
          hSeg: 1,
        });
        for (const sg of [-1, 1])
          b.boxMM(
            "bronze_door",
            ex - 2.1,
            0.25,
            ez + sg * 1.25,
            ex - 2.0,
            2.9,
            ez + sg * 2.4,
            { seg: false },
          );
        b.box("bronze_door", ex - 0.9, 0.25, ez + 2.4, 1.1, 0.08, 2.4, {
          ry: 0.3,
          rz: 0.05,
          seg: false,
        });
        b.quad(AT.key, ex + 0.12, 9.3, ez, 10.5, 1.3, {
          ry: HP,
          grime: 0.4,
          uvRect: AT.rect("name"),
        });
        // iron-and-glass marquee on chains, hung with the raiders' trophies
        b.boxMM(
          "iron_green",
          ex + 0.1,
          5.2,
          ez - 3.4,
          ex + 3.2,
          5.45,
          ez + 3.4,
          { seg: false },
        );
        for (let k = 0; k < 6; k++)
          b.quad(
            k === 2 ? "glass_broken" : "glass_dark",
            ex + 1.65,
            5.47,
            ez - 2.8 + k * 1.12,
            2.9,
            1.0,
            { rx: -HP, noAO: true },
          );
        for (const sg of [-1, 1])
          b.beam(
            "iron",
            V3(ex + 3.1, 5.4, ez + sg * 3.2),
            V3(ex + 0.05, 8.2, ez + sg * 3.2),
            0.05,
            0.05,
          );
        // hanging cage with a skeleton, a dress form on a rope
        b.beam(
          "iron",
          V3(ex + 2.2, 5.2, ez - 1.2),
          V3(ex + 2.2, 3.9, ez - 1.2),
          0.03,
          0.03,
        );
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          b.beam(
            "iron",
            V3(
              ex + 2.2 + Math.cos(a) * 0.45,
              3.9,
              ez - 1.2 + Math.sin(a) * 0.45,
            ),
            V3(
              ex + 2.2 + Math.cos(a) * 0.45,
              2.1,
              ez - 1.2 + Math.sin(a) * 0.45,
            ),
            0.025,
            0.025,
          );
        }
        b.cyl("iron", ex + 2.2, 2.05, ez - 1.2, 0.5, 0.5, 0.06, 8, { hSeg: 1 });
        b.sphere("bone", ex + 2.2, 3.4, ez - 1.2, 0.11, { ws: 7, hs: 5 });
        b.box("bone", ex + 2.2, 2.4, ez - 1.2, 0.25, 0.7, 0.15, { seg: false });
        b.beam(
          "rope",
          V3(ex + 2.4, 5.2, ez + 1.5),
          V3(ex + 2.4, 3.2, ez + 1.5),
          0.02,
          0.02,
        );
        PF.dressForm(b, ex + 2.4, 1.3, ez + 1.5, 0.4, {
          gore: true,
          skull: true,
        });
        // Stitchers barricade in front of the portal: sewing machines, dress forms, scrap, sandbags
        PF.scrapWall(b, ex - 0.4, ez - 3.2, ex - 0.4, ez - 1.6, 1.8, {
          seed: 71,
        });
        PF.scrapWall(b, ex - 0.4, ez + 1.6, ex - 0.4, ez + 3.2, 1.8, {
          seed: 72,
        });
        for (let k = 0; k < 4; k++)
          PF.sewingMachine(
            b,
            ex - 1.1 + 0.15 * (k % 2),
            0.25,
            ez + (k < 2 ? -2.3 : 2.3) + (k % 2) * 0.4,
            HP + (r() - 0.5) * 0.4,
            { noStand: k % 2 === 1, tipped: k === 3 },
          );
        for (const [dz, gore] of [
          [-4.6, true],
          [4.6, false],
          [-5.8, false],
          [5.8, true],
        ])
          PF.dressForm(b, ex + 0.6, 0.12, ez + dz, -HP + (r() - 0.5) * 0.6, {
            gore,
            skull: gore,
            lean: (r() - 0.5) * 0.2,
          });
        PF.barrel(b, ex + 1.2, 0.12, ez - 5.2, { fire: true });
        b.quad(AT.key, ex + 0.02, 3.2, ez - 6.3, 2.6, 1.3, {
          ry: HP,
          grime: 0.3,
          uvRect: AT.rect("warn"),
        });
        SG.door = V3(ex - 2.0, 1.6, ez);
        anchors.entrance = PF.anchor(ex + 3.0, 0.12, ez, -HP);
        anchors.exterior_entrance = anchors.entrance;
        PF.glow(V3(ex - 1.2, 2.2, ez), 0xffb070, 3.0, null, {
          intensity: 1.0,
          dayFactor: 0.3,
        });
      }
      // Stitchers graffiti along the base
      [
        [X0 + 12, Z1 + 0.08, 0],
        [X0 + 30, Z0 - 0.08, PI],
        [X0 - 0.08, (Z0 + Z1) / 2, -HP],
      ].forEach(([x, z, ry], i) => {
        b.quad(GA.key, x, 2.4, z, 5, 2.5, {
          ry,
          grime: 0.1,
          uvRect: GA.rect("g" + (i + 1)),
        });
      });
      // rubble & a fallen balcony at the Liberty St corner
      D.rubble(b, X0 + 20, 0.1, Z1 + 1.6, 1.4, 8, 31);
      b.box("iron_green", X0 + 22, 0.1, Z1 + 1.4, 1.8, 0.12, 0.7, {
        ry: 0.4,
        rz: 0.2,
        seg: false,
      });

      anchors.guard = PF.anchor(X1 + 2.0, 0.12, TZC + 4.2, -HP);
      SG.anchors = anchors;
      PF.flushFires();
      b.build(root);
      PF.flushGlows(root);
    },
    20,
  );
