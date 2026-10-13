// play-inline-363 03 — seg
// Lines 45-1178 of readable/play-inline-363.pretty.js (statement-aligned).
  PF.addBuilder(
    "forty_wall",
    function (PF2, site, root) {
      const b = PF.batch("fortywall_ext");
      b.ground = 0;
      b.aoH = 6;
      const r = PF.rng("fortywall");
      const anchors = {};
      const { X0, X1, Z0, Z1, BASE, MID, TWR, TOP, PYR, SPIRE, XC, ZC } = FW;

      /**
       * Skyscraper shaft between y0..y1 on rect (x0,z0,x1,z1): continuous brick piers, recessed window
       * strips with dark spandrels, limestone trim at the top. opts: {key, bay, floorH, pierW, lit}
       */
      function shaft(x0, z0, x1, z1, y0, y1, opts) {
        opts = opts || {};
        // Severance's buff-brick tower: deep continuous piers (0.5 m proud) casting vertical shadow lines, punched
        // windows about half the bay, recessed darker-brick spandrels, limestone sill course; limestone band under
        // each setback coping and a darker brick band below it
        const key = opts.key || "buff_brick",
          bay = opts.bay || 2.3,
          fh = opts.floorH || 3.4,
          pw = opts.pierW || 0.9,
          pd = 0.5;
        b.boxMM(key, x0, y0, z0, x1, y1, z1, { segLen: 6, grime: 0.55 });
        const sides = [
          [x0, z0, x1, z0, PI, 0, -1],
          [x1, z0, x1, z1, HP, 1, 0],
          [x1, z1, x0, z1, 0, 0, 1],
          [x0, z1, x0, z0, -HP, -1, 0],
        ];
        for (const [ax, az, cx, cz, ry, nx, nz] of sides) {
          const len = Math.hypot(cx - ax, cz - az),
            n = Math.max(1, Math.round(len / bay)),
            bw = len / n;
          const ux = (cx - ax) / len,
            uz = (cz - az) / len,
            along = Math.abs(ux) > 0;
          for (let i = 0; i <= n; i++) {
            const t = i * bw,
              px = ax + ux * t + (nx * pd) / 2,
              pz = az + uz * t + (nz * pd) / 2;
            b.box(
              key,
              px,
              y0,
              pz,
              along ? pw : pd,
              (opts.pierTop || y1 - 1.9) - y0,
              along ? pd : pw,
              { segLen: 8, grime: 0.55 },
            );
          }
          const ww = bw * 0.5,
            mx = (ax + cx) / 2,
            mz = (az + cz) / 2;
          for (let y = y0 + 0.9; y < (opts.winTop || y1 - 2.6); y += fh) {
            for (let i = 0; i < n; i++) {
              const t = (i + 0.5) * bw,
                px = ax + ux * t + nx * 0.03,
                pz = az + uz * t + nz * 0.03;
              const roll = r();
              b.quad(
                roll < 0.16
                  ? "glass_broken"
                  : roll > 1 - (opts.lit || 0.003)
                    ? "window_amber"
                    : "glass_dark",
                px,
                y + 1.05,
                pz,
                ww,
                2.1,
                { ry, noAO: true, grime: 0.1 },
              );
            }
            // one darker-brick spandrel course and one limestone sill course per floor (the piers stand in front)
            b.box(
              key,
              mx + nx * 0.02,
              y - 0.95,
              mz + nz * 0.02,
              along ? len : 0.06,
              0.9,
              along ? 0.06 : len,
              { seg: false, grime: 0.6, c: 0x9a8468 },
            );
            b.box(
              "lime_ws",
              mx + nx * 0.06,
              y - 0.08,
              mz + nz * 0.06,
              along ? len : 0.12,
              0.1,
              along ? 0.12 : len,
              { seg: false, grime: 0.5 },
            );
          }
        }
        // setback crown: darker brick band, limestone band, coping
        b.boxMM(
          key,
          x0 - 0.08,
          y1 - 2.4,
          z0 - 0.08,
          x1 + 0.08,
          y1 - 1.6,
          z1 + 0.08,
          { seg: false, grime: 0.6, c: 0x8a7458 },
        );
        b.boxMM(
          "lime_ws",
          x0 - 0.12,
          y1 - 1.6,
          z0 - 0.12,
          x1 + 0.12,
          y1 - 0.6,
          z1 + 0.12,
          { seg: false, grime: 0.45 },
        );
        b.boxMM(
          "lime_ws",
          x0 - 0.3,
          y1 - 0.6,
          z0 - 0.3,
          x1 + 0.3,
          y1,
          z1 + 0.3,
          { seg: false, grime: 0.4 },
        );
        PF.colMM(x0, y0, z0, x1, y1, z1, { walkable: true });
      }

      // =================================================================
      // BASE: rusticated ground storey + colossal pilaster order (Indiana limestone)
      // =================================================================
      // base mass in four pieces around the portal recess (x XC±3.2, z Z0..Z0+2.4, y 0..11.5)
      b.boxMM("lime_ws", X0, 0, Z0, XC - 3.2, BASE, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("lime_ws", XC + 3.2, 0, Z0, X1, BASE, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("lime_ws", XC - 3.2, 0, Z0 + 2.4, XC + 3.2, BASE, Z1, {
        segLen: 5,
        grime: 0.55,
      });
      b.boxMM("lime_ws", XC - 3.2, 11.5, Z0, XC + 3.2, BASE, Z0 + 2.4, {
        segLen: 5,
        grime: 0.55,
      });
      // colliders leave the portal recess open (north face, x XC±3.6, z Z0..Z0+2.4)
      PF.colMM(X0, 0, Z0 + 2.4, X1, BASE, Z1, { walkable: true });
      PF.colMM(X0, 0, Z0, XC - 3.6, BASE, Z0 + 2.4, { walkable: false });
      PF.colMM(XC + 3.6, 0, Z0, X1, BASE, Z0 + 2.4, { walkable: false });
      PF.colMM(XC - 3.6, 11.5, Z0, XC + 3.6, BASE, Z0 + 2.4, {
        walkable: false,
      });
      for (let y = 0.8; y < 7.0; y += 0.7) {
        b.boxMM(
          "lime_ws",
          X0 - 0.07,
          y,
          Z0 - 0.07,
          X1 + 0.07,
          y + 0.07,
          Z0 + 0.1,
          { seg: false, c: 0x9a927e },
        );
        b.boxMM("lime_ws", X1 - 0.1, y, Z0, X1 + 0.07, y + 0.07, Z1, {
          seg: false,
          c: 0x9a927e,
        });
        b.boxMM(
          "lime_ws",
          X0 - 0.07,
          y,
          Z1 - 0.1,
          X1 + 0.07,
          y + 0.07,
          Z1 + 0.07,
          { seg: false, c: 0x9a927e },
        );
        b.boxMM("lime_ws", X0 - 0.07, y, Z0, X0 + 0.1, y + 0.07, Z1, {
          seg: false,
          c: 0x9a927e,
        });
      }
      b.boxMM("granite_dark", X0 - 0.3, 0, Z0 - 0.3, X1 + 0.3, 0.8, Z1 + 0.3, {
        seg: false,
        grime: 0.6,
      });
      b.boxMM("lime_ws", X0 - 0.35, 7.0, Z0 - 0.35, X1 + 0.35, 7.6, Z1 + 0.35, {
        seg: false,
        grime: 0.45,
      });
      // ground-storey windows (tall, iron-grilled) & the colossal order above
      const baseFace = (ax, az, cx, cz, ry, nx, nz, skip) => {
        const len = Math.hypot(cx - ax, cz - az),
          n = Math.max(1, Math.round(len / 4.4));
        const ux = (cx - ax) / len,
          uz = (cz - az) / len;
        for (let i = 0; i < n; i++) {
          const t = ((i + 0.5) * len) / n,
            px = ax + ux * t,
            pz = az + uz * t;
          if (skip && skip(px, pz)) continue;
          PF.classicWindow(
            b,
            px + nx * 0.01,
            1.4,
            pz + nz * 0.01,
            ry,
            2.2,
            4.4,
            {
              pane: r() < 0.3 ? "glass_broken" : "glass_dark",
              frame: "lime_ws",
              head: "cornice",
              keystone: true,
              frameW: 0.24,
            },
          );
          for (let k = 0; k < 7; k++) {
            const lx = -0.9 + k * 0.3;
            b.box(
              "iron",
              px + ux * lx + nx * 0.18,
              1.4,
              pz + uz * lx + nz * 0.18,
              0.04,
              4.4,
              0.04,
              { seg: false },
            );
          }
          // colossal-order bay: three storeys of windows between pilasters
          for (let f = 0; f < 4; f++) {
            const y = 8.8 + f * 3.3;
            b.quad(
              r() < 0.2 ? "glass_broken" : "glass_dark",
              px + nx * 0.02,
              y + 1.1,
              pz + nz * 0.02,
              2.4,
              2.2,
              { ry, noAO: true, grime: 0.1 },
            );
            b.box(
              "bronze_door",
              px + nx * 0.06,
              y - 0.8,
              pz + nz * 0.06,
              Math.abs(ux) > 0 ? 2.5 : 0.08,
              0.75,
              Math.abs(uz) > 0 ? 2.5 : 0.08,
              { seg: false, grime: 0.4 },
            );
          }
        }
        for (let i = 0; i <= n; i++) {
          const t = (i * len) / n,
            px = ax + ux * t + nx * 0.3,
            pz = az + uz * t + nz * 0.3;
          if (skip && i > 0 && i < n && skip(px, pz, true)) continue;
          b.box(
            "lime_ws",
            px,
            7.6,
            pz,
            Math.abs(ux) > 0 ? 0.95 : 0.6,
            13.4,
            Math.abs(uz) > 0 ? 0.95 : 0.6,
            { seg: false, grime: 0.45 },
          );
          b.box(
            "lime_ws",
            px,
            21.0,
            pz,
            Math.abs(ux) > 0 ? 1.25 : 0.8,
            0.7,
            Math.abs(uz) > 0 ? 1.25 : 0.8,
            { seg: false },
          );
        }
      };
      const portalSkip = (px, pz) => Math.abs(px - XC) < 4.5 && pz < Z0 + 1;
      baseFace(X0, Z0, X1, Z0, PI, 0, -1, portalSkip);
      baseFace(X1, Z0, X1, Z1, HP, 1, 0);
      baseFace(X1, Z1, X0, Z1, 0, 0, 1);
      baseFace(X0, Z1, X0, Z0, -HP, -1, 0);
      // entablature + cornice of the base
      b.boxMM("lime_ws", X0 - 0.4, 21.7, Z0 - 0.4, X1 + 0.4, 23.2, Z1 + 0.4, {
        seg: false,
        grime: 0.4,
      });
      b.boxMM("lime_ws", X0 - 0.8, 23.2, Z0 - 0.8, X1 + 0.8, 23.7, Z1 + 0.8, {
        seg: false,
        grime: 0.4,
      });
      b.boxMM(
        "lime_ws",
        X0 - 0.2,
        23.7,
        Z0 - 0.2,
        X1 + 0.2,
        BASE + 0.9,
        Z1 + 0.2,
        { seg: false, grime: 0.5 },
      );
      const AT = PF.atlas("fortywall", [
        [
          "band",
          PF.signTex(
            "fw_band",
            ["BANK OF THE MANHATTAN COMPANY"],
            "engraved",
            1024,
            96,
            { bg: "#cfc6ae" },
          ),
        ],
        [
          "band2",
          PF.signTex("fw_band2", ["FORTY WALL STREET"], "engraved", 1024, 96, {
            bg: "#cfc6ae",
          }),
        ],
        [
          "warn",
          PF.signTex(
            "fw_warn",
            [
              "BANK OF THE MANHATTAN CO.",
              "AUTOMATED SECURITY IN EFFECT",
              "LOITERING WILL BE MET WITH",
              "LETHAL FORCE",
              "HAVE A NICE DAY!",
            ],
            "enamel",
            512,
            320,
            { bg: "#e8e0c8", fg: "#8a1a14" },
          ),
        ],
        [
          "crew",
          PF.signTex(
            "fw_crew",
            ["DONT GO IN", "THE ROBOTS", "DONT TAKE SCRIP"],
            "raider",
            512,
            256,
            { bg: "#b8b0a0", fg: "#7a1a14", outline: false },
          ),
        ],
      ]);
      const atq = (name, x, y, z, w, h, o) =>
        b.quad(
          AT.key,
          x,
          y,
          z,
          w,
          h,
          Object.assign({ uvRect: AT.rect(name) }, o),
        );
      atq("band", XC, 22.45, Z0 - 0.42, 30, 1.25, { ry: PI, grime: 0.3 });
      atq("band2", X1 + 0.42, 22.45, ZC, 18, 1.25, { ry: HP, grime: 0.3 });

      // =================================================================
      // THE WALL STREET PORTAL: 3-storey recessed arch, bronze-and-glass screen,
      // eagle keystone, flagpoles, the alarm beacon
      // =================================================================
      {
        const pz = Z0,
          px = XC;
        for (const sg of [-1, 1]) {
          b.boxMM(
            "lime_ws",
            px + sg * 3.6 - 0.55,
            0,
            pz - 0.5,
            px + sg * 3.6 + 0.55,
            12.2,
            pz + 0.1,
            { seg: false, grime: 0.5 },
          );
          for (let y = 1; y < 12; y += 1.1)
            b.boxMM(
              "lime_ws",
              px + sg * 3.6 - 0.65,
              y,
              pz - 0.6,
              px + sg * 3.6 + 0.65,
              y + 0.12,
              pz - 0.45,
              { seg: false, c: 0x9a927e },
            );
        }
        PF.archBay(b, px, 0.2, pz + 2.2, PI, 6.0, 11.0, {
          pane: "glass_dark",
          ring: "lime_ws",
          key: "lime_ws",
          ringW: 0.6,
          n: 15,
          jambs: true,
        });
        b.boxMM("lime_ws", px - 3.2, 0, pz + 2.2, px + 3.2, 11.5, pz + 2.5, {
          seg: false,
        });
        b.boxMM("lime_ws", px - 3.1, 11.5, pz - 0.5, px + 3.1, 12.2, pz + 2.5, {
          seg: false,
        });
        b.boxMM("lime_ws", px - 3.2, 0, pz, px - 3.0, 11.5, pz + 2.4, {
          seg: false,
        });
        b.boxMM("lime_ws", px + 3.0, 0, pz, px + 3.2, 11.5, pz + 2.4, {
          seg: false,
        });
        b.boxMM("granite_dark", px - 3.0, 0, pz, px + 3.0, 0.2, pz + 2.4, {
          seg: false,
        });
        PF.colMM(px - 3.0, 0, pz, px + 3.0, 0.2, pz + 2.4, {
          surface: "concrete",
        });
        // bronze screen: doors below, grille above, eagle over the doors
        for (let k = -2; k <= 2; k++)
          b.boxMM(
            "bronze_door",
            px + k * 1.15 - 0.06,
            0.2,
            pz + 2.1,
            px + k * 1.15 + 0.06,
            8.2,
            pz + 2.18,
            { seg: false },
          );
        for (let y = 3.2; y < 8.2; y += 0.8)
          b.boxMM(
            "bronze_door",
            px - 2.9,
            y,
            pz + 2.1,
            px + 2.9,
            y + 0.08,
            pz + 2.18,
            { seg: false },
          );
        b.quad("glass_dark", px, 5.7, pz + 2.16, 5.6, 4.8, {
          ry: PI,
          noAO: true,
          grime: 0.3,
        });
        b.quad("window_amber", px, 1.6, pz + 2.17, 2.1, 2.7, {
          ry: PI,
          noAO: true,
          grime: 0.2,
        }); // the lobby lamps behind the doors
        PF.glow(V3(px, 2.2, pz + 2.6), 0xffb060, 2.4, null, {
          intensity: 0.7,
          flicker: 0.05,
          dayFactor: 0.15,
        });
        // deep dark soffit + reveal shading, bronze lantern brackets either side of the arch
        b.boxMM(
          "granite_dark",
          px - 3.0,
          11.2,
          pz - 0.4,
          px + 3.0,
          11.5,
          pz + 2.2,
          { seg: false, grime: 0.6, c: 0x6a665e },
        );
        for (const sg of [-1, 1]) {
          b.boxMM(
            "lime_ws",
            px + sg * 3.05 - 0.05,
            0.2,
            pz + 0.2,
            px + sg * 3.05 + 0.05,
            11.2,
            pz + 2.1,
            { seg: false, grime: 0.7, c: 0x8a8272 },
          );
          const lx = px + sg * 5.0,
            lz = pz - 0.9;
          b.box("bronze_door", lx, 5.2, lz + 0.5, 0.16, 0.16, 1.0, {
            seg: false,
          });
          b.lathe(
            "bronze_door",
            [
              [0.05, 0],
              [0.26, 0.1],
              [0.3, 0.7],
              [0.18, 1.1],
              [0.06, 1.35],
            ],
            8,
            lx,
            4.5,
            lz,
            {},
          );
          b.cyl(
            sg < 0 ? "window_amber" : "glass_broken",
            lx,
            4.62,
            lz,
            0.22,
            0.22,
            0.55,
            8,
            { hSeg: 1, noAO: true, grime: 0 },
          );
        }
        PF.glow(V3(px - 5.0, 4.9, pz - 0.9), 0xffb060, 1.4, null, {
          intensity: 0.8,
          flicker: 0.1,
          dayFactor: 0.2,
        });
        for (const sg of [-1, 1])
          b.boxMM(
            "bronze_door",
            px + sg * 0.05,
            0.2,
            pz + 2.0,
            px + sg * 1.1,
            2.9,
            pz + 2.1,
            { seg: false },
          );
        b.boxMM(
          "bronze_door",
          px - 2.4,
          2.9,
          pz + 2.0,
          px + 2.4,
          3.2,
          pz + 2.12,
          { seg: false },
        );
        // eagle keystone (spread wings) over the arch
        b.box("lime_ws", px, 11.2, pz - 0.35, 1.0, 1.3, 0.5, { seg: false });
        for (const sg of [-1, 1])
          b.box("lime_ws", px + sg * 0.9, 11.6, pz - 0.35, 1.4, 0.5, 0.3, {
            rz: sg * -0.35,
            seg: false,
          });
        // the alarm beacon: red light cage over the door (animated below)
        b.box("iron", px, 9.4, pz + 1.6, 0.5, 0.35, 0.5, { seg: false });
        b.cyl("red_alarm", px, 9.75, pz + 1.6, 0.18, 0.2, 0.35, 8, {
          hSeg: 1,
          noAO: true,
          grime: 0,
        });
        anchors.beacon = V3(px, 9.95, pz + 1.6);
        // flagpoles flanking the portal (one broken)
        for (const sg of [-1, 1]) {
          b.box("bronze_door", px + sg * 5.3, 12.4, pz - 0.9, 0.6, 0.5, 0.9, {
            seg: false,
          });
          if (sg < 0)
            b.cyl("iron", px + sg * 5.3, 12.9, pz - 1.1, 0.05, 0.07, 7, 6, {
              hSeg: 2,
              rx: -0.8,
            });
          else
            b.cyl("iron", px + sg * 5.3, 12.9, pz - 1.1, 0.05, 0.07, 2.1, 6, {
              hSeg: 1,
              rx: -0.8,
            });
        }
        FW.door = V3(px, 1.6, pz + 1.9);
        anchors.entrance = PF.anchor(px, 0.12, pz - 3.2, PI);
        anchors.exterior_entrance = anchors.entrance;
      }

      // =================================================================
      // SHAFT + SETBACKS + TOWER
      // =================================================================
      shaft(X0 + 4, Z0 + 1.5, X1 - 4, Z1 - 1.5, BASE + 0.9, MID, { bay: 2.4 });
      // mid setback: pinnacle-like corner urns
      for (const [x, z] of [
        [X0 + 4, Z0 + 1.5],
        [X1 - 4, Z0 + 1.5],
        [X0 + 4, Z1 - 1.5],
        [X1 - 4, Z1 - 1.5],
      ])
        b.lathe(
          "lime_ws",
          [
            [0.1, 0],
            [0.6, 0.1],
            [0.7, 0.8],
            [0.4, 1.4],
            [0.5, 1.6],
            [0.05, 2.2],
          ],
          8,
          x,
          MID,
          z,
          {},
        );
      shaft(XC - 13, ZC - 12, XC + 13, ZC + 12, MID, TWR, { bay: 2.2 });
      shaft(XC - 11, ZC - 10, XC + 11, ZC + 10, TWR, TOP, {
        bay: 2.2,
        lit: 0.01,
        winTop: TOP - 7.8,
        pierTop: TOP - 5.0,
      });
      // tower crown band: limestone arcade below the pyramid
      for (const [ax, az, cx, cz, ry] of [
        [XC - 11, ZC - 10, XC + 11, ZC - 10, PI],
        [XC + 11, ZC - 10, XC + 11, ZC + 10, HP],
        [XC + 11, ZC + 10, XC - 11, ZC + 10, 0],
        [XC - 11, ZC + 10, XC - 11, ZC - 10, -HP],
      ]) {
        const len = Math.hypot(cx - ax, cz - az),
          n = 6,
          ux = (cx - ax) / len,
          uz = (cz - az) / len,
          nx = Math.sin(ry),
          nz = Math.cos(ry);
        for (let i = 0; i < n; i++) {
          const t = ((i + 0.5) * len) / n;
          PF.archBay(
            b,
            ax + ux * t + nx * 0.25,
            TOP - 4.6,
            az + uz * t + nz * 0.25,
            ry,
            2.0,
            3.8,
            { pane: "glass_dark", ring: "lime_ws", ringW: 0.26, n: 7 },
          );
        }
      }

      // =================================================================
      // THE PYRAMID: steep green-copper roof built face by face (so one face can be torn open), four tiers of
      // big gabled dormers, a two-stage open gothic lantern and the spire. The east face lost its copper:
      // the steel lattice shows through, sheets hang bent off the frame.
      // =================================================================
      {
        const hx = 11.4,
          hz = 10.4,
          ph = PYR - TOP,
          TT = 0.82; // truncated at 82 % → lantern base
        const faces = [
          [0, -1, PI],
          [1, 0, HP],
          [0, 1, 0],
          [-1, 0, -HP],
        ];
        const corner = (t, sx, sz) =>
          V3(XC + sx * hx * (1 - t), TOP + ph * t, ZC + sz * hz * (1 - t));
        const quadGeo = (A, B, C, D) => {
          const g = new THREE.BufferGeometry();
          g.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(
              [
                A.x,
                A.y,
                A.z,
                B.x,
                B.y,
                B.z,
                C.x,
                C.y,
                C.z,
                A.x,
                A.y,
                A.z,
                C.x,
                C.y,
                C.z,
                D.x,
                D.y,
                D.z,
              ],
              3,
            ),
          );
          g.computeVertexNormals();
          return g;
        };
        const faceCorners = {
          "0,-1": [
            [1, -1],
            [-1, -1],
          ],
          "1,0": [
            [1, 1],
            [1, -1],
          ],
          "0,1": [
            [-1, 1],
            [1, 1],
          ],
          "-1,0": [
            [-1, -1],
            [-1, 1],
          ],
        }; // outward CCW
        const NT = 8,
          HOLE = { t0: 3, t1: 6, u0: 0.28, u1: 0.72 };
        for (const [nx, nz] of faces) {
          const [[ax, az], [cx2, cz2]] = faceCorners[nx + "," + nz];
          const torn = nx === 1;
          for (let k = 0; k < NT; k++) {
            const t0 = (k / NT) * TT,
              t1 = ((k + 1) / NT) * TT;
            const A0 = corner(t0, ax, az),
              B0 = corner(t0, cx2, cz2),
              A1 = corner(t1, ax, az),
              B1 = corner(t1, cx2, cz2);
            const lerp = (P, Q, u) => P.clone().lerp(Q, u);
            if (torn && k >= HOLE.t0 && k < HOLE.t1) {
              // leave a ragged hole in the middle of the strip
              const j0 = HOLE.u0 + ((k * 37) % 7) * 0.012,
                j1 = HOLE.u1 - ((k * 53) % 5) * 0.015;
              b.add(
                "copper_ws",
                quadGeo(A0, lerp(A0, B0, j0), lerp(A1, B1, j0 + 0.03), A1),
                { grime: 0.6 },
              );
              b.add(
                "copper_ws",
                quadGeo(lerp(A0, B0, j1), B0, B1, lerp(A1, B1, j1 - 0.03)),
                { grime: 0.6 },
              );
            } else b.add("copper_ws", quadGeo(A0, B0, B1, A1), { grime: 0.55 });
          }
        }
        // dark inner core so the tear reads as a void, the steel lattice in the tear, bent sheets hanging off it
        {
          const core = new THREE.ConeGeometry(1, ph * TT, 4, 1, true);
          core.rotateY(PI / 4);
          core.scale((hx - 1.2) * Math.SQRT2, 1, (hz - 1.2) * Math.SQRT2);
          b.add("vault_dk", core, {
            m: PF.m4(XC, TOP + (ph * TT) / 2 - 0.6, ZC, 0, 0, 0),
            grime: 0.2,
            noAO: true,
            c: 0x222222,
          });
          const t0 = (HOLE.t0 / NT) * TT,
            t1 = (HOLE.t1 / NT) * TT;
          for (let k = 0; k <= 5; k++) {
            // rafters along the slope
            const u = HOLE.u0 - 0.04 + (k * (HOLE.u1 - HOLE.u0 + 0.08)) / 5,
              zz = (u - 0.5) * 2;
            b.beam(
              "iron",
              V3(
                XC + hx * (1 - t0) - 0.25,
                TOP + ph * t0,
                ZC + zz * hz * (1 - t0),
              ),
              V3(
                XC + hx * (1 - t1) - 0.25,
                TOP + ph * t1,
                ZC + zz * hz * (1 - t1),
              ),
              0.22,
              0.3,
              { grime: 0.5 },
            );
          }
          for (let k = 0; k <= 3; k++) {
            // purlins across
            const t = t0 + ((t1 - t0) * k) / 3,
              x = XC + hx * (1 - t) - 0.3,
              hw = hz * (1 - t) * (HOLE.u1 - HOLE.u0 + 0.06);
            b.beam(
              "iron",
              V3(x, TOP + ph * t, ZC - hw),
              V3(x, TOP + ph * t, ZC + hw),
              0.18,
              0.18,
              { grime: 0.5 },
            );
            b.beam(
              "rust",
              V3(x, TOP + ph * t, ZC - hw),
              V3(
                XC + hx * (1 - t - 0.1) - 0.3,
                TOP + ph * (t + 0.1),
                ZC + hw * 0.4,
              ),
              0.1,
              0.1,
              { grime: 0.5 },
            ); // diagonal bracing
          }
          for (const [u, t, rz, len] of [
            [0.36, 0.44, 0.5, 2.6],
            [0.62, 0.52, -0.4, 2.0],
            [0.47, 0.36, 0.9, 1.6],
          ]) {
            const zz = (u - 0.5) * 2 * hz * (1 - t),
              x = XC + hx * (1 - t) + 0.3;
            b.box("copper_ws", x, TOP + ph * t - len, ZC + zz, 0.05, len, 1.4, {
              rz: -rz * 0.35,
              rx: rz,
              seg: false,
              grime: 0.6,
            });
          }
        }
        // hip ribs
        for (const [sx, sz] of [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
        ])
          b.beam(
            "copper_ws",
            corner(0, sx, sz),
            corner(TT, sx, sz),
            0.34,
            0.34,
            { grime: 0.4, c: 0x9ac0b0 },
          );
        // dormers: four tiers (4/3/2/1 per face), big gabled hoods, some tier-3 windows amber-lit
        for (const [nx, nz, ry] of faces) {
          const half = nx !== 0 ? hz : hx,
            depth = nx !== 0 ? hx : hz,
            torn = nx === 1;
          for (let tier = 0; tier < 4; tier++) {
            const t = 0.08 + tier * 0.18,
              y = TOP + ph * t,
              n = 4 - tier,
              span = half * (1 - t) * 0.62;
            for (let k = 0; k < n; k++) {
              const off = n === 1 ? 0 : -span + k * ((2 * span) / (n - 1));
              if (
                torn &&
                tier >= 1 &&
                tier <= 2 &&
                Math.abs(off) < half * (1 - t) * 0.5
              )
                continue; // lost with the copper
              const ux = -nz,
                uz = nx;
              const w = 3.1 - tier * 0.45,
                h = 3.8 - tier * 0.5,
                dd = 2.4;
              const out = depth * (1 - t) - dd / 2 + 0.9;
              const dx = XC + nx * out + ux * off,
                dz = ZC + nz * out + uz * off;
              b.box(
                "copper_ws",
                dx,
                y,
                dz,
                nx !== 0 ? dd : w,
                h,
                nx !== 0 ? w : dd,
                { seg: false, grime: 0.55 },
              );
              K.pediment(
                b,
                "copper_ws",
                dx + nx * 0.15,
                y + h,
                dz + nz * 0.15,
                w + 0.4,
                1.4 - tier * 0.2,
                dd + 0.3,
                ry,
                {},
              );
              for (const sg of [-1, 1])
                b.box(
                  "copper_ws",
                  dx + nx * (dd / 2 + 0.05) + ux * sg * (w / 2 - 0.12),
                  y,
                  dz + nz * (dd / 2 + 0.05) + uz * sg * (w / 2 - 0.12),
                  nx !== 0 ? 0.2 : 0.24,
                  h,
                  nx !== 0 ? 0.24 : 0.2,
                  { seg: false, grime: 0.4, c: 0x9ac0b0 },
                );
              const lit = tier === 2 && (k === 0 || (k === 1 && nz === -1));
              PF.archBay(
                b,
                dx + nx * (dd / 2 + 0.02),
                y + 0.3,
                dz + nz * (dd / 2 + 0.02),
                ry,
                w * 0.55,
                h * 0.78,
                {
                  pane: lit
                    ? "window_amber"
                    : (k + tier) % 3 === 0
                      ? "glass_broken"
                      : "glass_dark",
                  ring: "copper_ws",
                  ringW: 0.14,
                  n: 7,
                },
              );
            }
          }
        }
        // pyramid collider (stepped)
        for (let i = 0; i < 6; i++) {
          const t0 = (i / 6) * TT,
            s2 = 1 - t0;
          PF.colMM(
            XC - hx * s2,
            TOP + ph * t0,
            ZC - hz * s2,
            XC + hx * s2,
            TOP + ph * (t0 + TT / 6),
            ZC + hz * s2,
            { walkable: false },
          );
        }
        // two-stage open gothic lantern (lancet openings, pinnacles), then the spire and its mast
        const yL = TOP + ph * TT,
          hl = hx * (1 - TT) + 0.1;
        const stage = (y0, hh, H, nOpen) => {
          b.boxMM(
            "copper_ws",
            XC - hh - 0.2,
            y0,
            ZC - hh - 0.2,
            XC + hh + 0.2,
            y0 + 0.35,
            ZC + hh + 0.2,
            { seg: false, grime: 0.4 },
          );
          for (const sx of [-1, 1])
            for (const sz of [-1, 1]) {
              b.box(
                "copper_ws",
                XC + sx * (hh - 0.22),
                y0 + 0.35,
                ZC + sz * (hh - 0.22),
                0.44,
                H,
                0.44,
                { seg: false, grime: 0.4, c: 0x9ac0b0 },
              );
              b.cyl(
                "copper_ws",
                XC + sx * (hh - 0.22),
                y0 + 0.35 + H,
                ZC + sz * (hh - 0.22),
                0.001,
                0.26,
                1.1,
                4,
                { hSeg: 1, thetaStart: PI / 4 },
              );
            }
          b.boxMM(
            "vault_dk",
            XC - hh + 0.5,
            y0 + 0.35,
            ZC - hh + 0.5,
            XC + hh - 0.5,
            y0 + H,
            ZC + hh - 0.5,
            { seg: false, grime: 0.1, c: 0x2a2a2a },
          ); // dark inner drum
          for (const [nx, nz, ry] of faces) {
            const ux = -nz,
              uz = nx;
            for (let k = 0; k < nOpen; k++) {
              const off =
                nOpen === 1
                  ? 0
                  : ((k - (nOpen - 1) / 2) * (2 * hh - 0.5)) / nOpen;
              PF.archBay(
                b,
                XC + nx * (hh - 0.05) + ux * off,
                y0 + 0.5,
                ZC + nz * (hh - 0.05) + uz * off,
                ry,
                (2 * hh - 1.0) / nOpen - 0.3,
                H - 0.5,
                { pane: "glass_broken", ring: "copper_ws", ringW: 0.16, n: 7 },
              );
            }
            b.box(
              "copper_ws",
              XC + nx * (hh - 0.02),
              y0 + 0.35 + H - 0.3,
              ZC + nz * (hh - 0.02),
              nx !== 0 ? 0.12 : 2 * hh,
              0.3,
              nx !== 0 ? 2 * hh : 0.12,
              { seg: false },
            );
          }
        };
        stage(yL, hl, 3.4, 2);
        const yL2 = yL + 3.75 + 0.3,
          hl2 = hl * 0.7;
        stage(yL2, hl2, 2.6, 1);
        const yS = yL2 + 2.95 + 0.2;
        const sp = new THREE.ConeGeometry(hl2 * 0.95, SPIRE - yS, 4, 3);
        sp.rotateY(PI / 4);
        b.add("copper_ws", sp, {
          m: PF.m4(XC, yS + (SPIRE - yS) / 2, ZC),
          grime: 0.4,
        });
        b.cyl("iron", XC, SPIRE, ZC, 0.04, 0.06, 3.5, 5, { hSeg: 1 });
        PF.colMM(
          XC - hl - 0.2,
          yL,
          ZC - hl - 0.2,
          XC + hl + 0.2,
          yS,
          ZC + hl + 0.2,
          { walkable: false },
        );
        anchors.spire = V3(XC, SPIRE + 3.5, ZC);
      }
      // roof clutter on the lower setbacks: water tanks, vents, a crashed rotorcraft-rotor fragment on the base roof
      b.cyl("rotten", X0 + 2.2, BASE + 0.9 + 3, Z1 - 2, 1.4, 1.4, 3.2, 10, {
        hSeg: 1,
      });
      b.cyl("tar_ws", X0 + 2.2, BASE + 0.9 + 6.2, Z1 - 2, 0.15, 1.6, 1.0, 10, {
        hSeg: 1,
      });
      for (const [sx, sz] of [
        [-0.9, -0.9],
        [0.9, -0.9],
        [-0.9, 0.9],
        [0.9, 0.9],
      ])
        b.box("iron", X0 + 2.2 + sx, BASE + 0.9, Z1 - 2 + sz, 0.15, 3, 0.15, {
          seg: false,
        });
      b.box("panel", X1 - 2.2, BASE + 0.9, Z0 + 1, 1.2, 1.2, 1.8, {
        seg: false,
      });

      // =================================================================
      // STREET: the robots' "banking hours" — warning signs, heist crew remains,
      // a patrolman charging pod by the door, sandbags shot to rags
      // =================================================================
      {
        const zf = Z0 - 1.2;
        for (const sx of [-6.6, 6.6]) {
          b.box("iron", XC + sx, 0.12, zf + 0.2, 0.08, 2.2, 0.08, {
            seg: false,
          });
          atq("warn", XC + sx, 2.4, zf + 0.15, 1.6, 1.0, {
            ry: PI,
            grime: 0.3,
          });
        }
        // a scrap-plank warning the heist crew's survivors left for the next fools
        b.box("rotten", XC + 11.5, 0.12, Z0 - 2.6, 0.1, 1.4, 0.1, {
          seg: false,
        });
        atq("crew", XC + 11.5, 1.6, Z0 - 2.66, 1.3, 0.65, {
          ry: PI,
          grime: 0.3,
          rz: 0.08,
        });
        // patrolman charging pod (glass tube on a base) against the base, left of the portal
        const podX = XC - 8.4,
          podZ = Z0 - 0.7;
        b.cyl("vault_dk", podX, 0, podZ, 0.75, 0.8, 0.35, 12, { hSeg: 1 });
        b.cyl("glass_dark", podX, 0.35, podZ, 0.65, 0.65, 2.3, 12, {
          hSeg: 1,
          open: true,
          thetaStart: 0.4,
          thetaLen: PI * 1.6,
        });
        b.cyl("vault_dk", podX, 2.65, podZ, 0.75, 0.7, 0.4, 12, { hSeg: 1 });
        b.box("lamp_green", podX, 2.75, podZ - 0.72, 0.4, 0.1, 0.05, {
          seg: false,
          noAO: true,
        });
        PF.col(podX, podZ, 1.6, 1.6, 0, 3, 0, { walkable: false });
        // a dead heist crew: skeletons, dropped duffles, scorch & sandbags
        PF.sandbags(b, XC - 12, Z0 - 3.4, XC - 7, Z0 - 4.6, 2, { y: 0.12 });
        PF.skeleton(b, XC - 9.5, 0.12, Z0 - 2.4, 0.8);
        PF.skeleton(b, XC + 3.8, 0.12, Z0 - 2.0, -2.2);
        PF.skeleton(b, XC + 9.0, 0.12, Z0 - 4.2, 2.6);
        D.papers(b, XC + 5, 0.12, Z0 - 2.5, 2.4, 22, 12);
        b.box("fabric", XC + 4.6, 0.12, Z0 - 3.1, 0.9, 0.35, 0.45, {
          ry: 0.5,
          seg: false,
          c: 0x5a5a48,
        });
        for (let k = 0; k < 5; k++)
          b.cyl(
            "bronze_door",
            XC - 1 + r() * 4,
            0.13,
            Z0 - 1.5 - r() * 2,
            0.012,
            0.012,
            0.06,
            4,
            { hSeg: 1, rz: HP },
          );
        anchors.heist = PF.anchor(XC + 4.6, 0.12, Z0 - 3.1, 0);
      }

      // alarm beacon animation: slow red pulse (shared material)
      const alarmMat = PF.mat("red_alarm");
      PF.animate(V3(XC, 5, Z0), 260, (t) => {
        alarmMat.emissiveIntensity = 0.4 + 2.4 * Math.max(0, Math.sin(t * 3.2));
      });
      PF.glow(anchors.beacon, 0xff3020, 2.0, null, {
        intensity: 1.2,
        flicker: 0.4,
      });

      FW.anchors = anchors;
      PF.flushFires();
      b.build(root);
      PF.flushGlows(root);
    },
    30,
  );
