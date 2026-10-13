// play-inline-365 03 — grime
// Lines 50-1337 of readable/play-inline-365.pretty.js (statement-aligned).
  PF.addBuilder(
    "custom_house",
    function (PF2, site, root) {
      const b = PF.batch("customhouse_ext");
      b.ground = 0;
      b.aoH = 5;
      const r = PF.rng("customhouse");
      const anchors = {};
      const {
        X0,
        X1,
        ZN,
        ZF,
        ZP,
        ZS,
        PW,
        PE,
        MAIN,
        ORDER,
        ENT,
        ATTIC,
        ROOF,
        XC,
        GX0,
        GX1,
      } = CH;
      const inGap = (x) => x > GX0 - 0.2 && x < GX1 + 0.2;
      // one atlas for every exterior sign (continent labels, banner, convoy post, frieze): one draw call
      const AT = PF.atlas("customhouse", [
        [
          "asia",
          PF.signTex("ch_cont_asia", ["ASIA"], "engraved", 256, 64, {
            bg: "#8e8a82",
          }),
        ],
        [
          "america",
          PF.signTex("ch_cont_america", ["AMERICA"], "engraved", 256, 64, {
            bg: "#8e8a82",
          }),
        ],
        [
          "europe",
          PF.signTex("ch_cont_europe", ["EUROPE"], "engraved", 256, 64, {
            bg: "#8e8a82",
          }),
        ],
        [
          "africa",
          PF.signTex("ch_cont_africa", ["AFRICA"], "engraved", 256, 64, {
            bg: "#8e8a82",
          }),
        ],
        [
          "banner",
          PF.signTex(
            "ch_banner",
            ["CUSTOM HOUSE", "TRADING POST", "CONVOYS WELCOME · FAIR SCALES"],
            "banner",
            512,
            640,
            { bg: "#2a3a5a", fg: "#e8d8a8", size: 64 },
          ),
        ],
        [
          "post",
          PF.signTex(
            "ch_post",
            ["CONVOY STOP", "GRAND CENTRAL · 34 ST · BATTERY"],
            "enamel",
            512,
            160,
            { bg: "#5a2a1a", fg: "#e8d8b0" },
          ),
        ],
        [
          "frieze",
          PF.signTex(
            "ch_frieze",
            ["UNITED STATES CUSTOM HOUSE"],
            "engraved",
            1024,
            96,
            { bg: "#a6a29a" },
          ),
        ],
        [
          "water",
          PF.signTex("ch_water", ["WATER 2c / OXEN FREE"], "raider", 512, 96, {
            bg: "#d8ccb0",
            fg: "#2a3a5a",
            outline: false,
          }),
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

      // =================================================================
      // MASS + colliders
      // =================================================================
      // main block (behind the colonnade line) and the two projecting end pavilions
      b.boxMM("granite_ch", X0, 0, ZN, X1, ATTIC, ZF, {
        segLen: 5,
        grime: 0.5,
      });
      PF.colMM(X0, 0, ZN, X1, ATTIC, ZF, { walkable: true });
      for (const [x0, x1] of [
        [X0, PW],
        [PE, X1],
      ]) {
        b.boxMM("granite_ch", x0, 0, ZF, x1, ATTIC, ZP, {
          segLen: 5,
          grime: 0.5,
        });
        PF.colMM(x0, 0, ZF, x1, ATTIC, ZP, { walkable: true });
      }
      // rusticated basement grooves (all faces)
      for (let y = 0.7; y < MAIN - 0.2; y += 0.6) {
        b.boxMM(
          "granite_ch",
          X0 - 0.06,
          y,
          ZN - 0.06,
          X1 + 0.06,
          y + 0.07,
          ZN + 0.1,
          { seg: false, c: 0x807c74 },
        );
        b.boxMM("granite_ch", X0 - 0.06, y, ZN, X0 + 0.1, y + 0.07, ZP + 0.06, {
          seg: false,
          c: 0x807c74,
        });
        b.boxMM("granite_ch", X1 - 0.1, y, ZN, X1 + 0.06, y + 0.07, ZP + 0.06, {
          seg: false,
          c: 0x807c74,
        });
        b.boxMM(
          "granite_ch",
          X0 - 0.06,
          y,
          ZP - 0.1,
          PW + 0.06,
          y + 0.07,
          ZP + 0.06,
          { seg: false, c: 0x807c74 },
        );
        b.boxMM(
          "granite_ch",
          PE - 0.06,
          y,
          ZP - 0.1,
          X1 + 0.06,
          y + 0.07,
          ZP + 0.06,
          { seg: false, c: 0x807c74 },
        );
        b.boxMM("granite_ch", PW, y, ZF - 0.1, PE, y + 0.07, ZF + 0.06, {
          seg: false,
          c: 0x807c74,
        });
      }
      b.boxMM("granite_dark", X0 - 0.3, 0, ZN - 0.3, X1 + 0.3, 0.7, ZP + 0.3, {
        seg: false,
        grime: 0.6,
      });
      // main-floor string course
      b.boxMM(
        "granite_ch",
        X0 - 0.4,
        MAIN - 0.3,
        ZN - 0.4,
        X1 + 0.4,
        MAIN + 0.2,
        ZP + 0.4,
        { seg: false, grime: 0.45 },
      );

      // =================================================================
      // SOUTH FRONT: forecourt, grand stair, colonnade, portal, arms of the U.S.
      // =================================================================
      // forecourt (granite paving, raised a step) with a low balustrade on Bridge St, broken at the stair
      b.boxMM("flagstone", X0, 0, ZP, X1, 0.25, ZS, { segLen: 3, grime: 0.55 });
      PF.colMM(X0, 0, ZP, X1, 0.25, ZS, { surface: "concrete" });
      K.balustrade(
        b,
        "granite_ch",
        [
          [X0, ZS - 0.25],
          [XC - 7.8, ZS - 0.25],
        ],
        0.25,
        1.0,
        { urns: true, collide: true },
      );
      K.balustrade(
        b,
        "granite_ch",
        [
          [XC + 7.8, ZS - 0.25],
          [X1, ZS - 0.25],
        ],
        0.25,
        1.0,
        { urns: true, collide: true },
      );
      // grand stair: from the forecourt up to the portal landing (main floor)
      const stairW = 12,
        landZ = ZF + 1.6;
      b.boxMM(
        "granite_ch",
        XC - stairW / 2 - 0.8,
        0,
        ZF,
        XC + stairW / 2 + 0.8,
        MAIN,
        landZ,
        { seg: false, grime: 0.5 },
      );
      PF.colMM(XC - stairW / 2, 0, ZF, XC + stairW / 2, MAIN, landZ, {
        surface: "concrete",
      });
      PF.stairs(
        b,
        "granite_ch",
        XC,
        ZS - 0.2,
        PI,
        stairW,
        ZS - 0.2 - landZ,
        0.25,
        MAIN,
        { base: 0, grime: 0.5 },
      );
      // stair cheek walls with lamp standards
      for (const sg of [-1, 1]) {
        const x = XC + sg * (stairW / 2 + 0.45);
        const len = ZS - landZ,
          rise = MAIN - 0.25;
        b.box(
          "granite_ch",
          x,
          (MAIN + 0.25) / 2 - 0.4 + 0.45,
          (ZS + landZ) / 2,
          0.9,
          1.2,
          Math.hypot(len, rise),
          { rx: Math.atan2(rise, len), seg: false, grime: 0.5 },
        );
        b.boxMM("granite_ch", x - 0.45, 0, ZS - 1.2, x + 0.45, 1.3, ZS - 0.1, {
          seg: false,
        });
        PF.colWall(x, ZS - 0.2, x, landZ, 0.9, 0, MAIN + 1.0, {
          walkable: false,
        });
        // bronze lamp standard on the cheek end (one lit by the traders)
        b.cyl("bronze_door", x, 1.3, ZS - 0.65, 0.12, 0.2, 2.6, 8, { hSeg: 1 });
        b.cyl(
          sg < 0 ? "lamp_ws" : "glass_broken",
          x,
          3.9,
          ZS - 0.65,
          0.28,
          0.2,
          0.6,
          8,
          { hSeg: 1, noAO: true, grime: 0 },
        );
        b.cyl("bronze_door", x, 4.5, ZS - 0.65, 0.04, 0.34, 0.2, 8, {
          hSeg: 1,
        });
        if (sg < 0)
          PF.glow(V3(x, 4.2, ZS - 0.65), 0xffd090, 2.0, null, {
            intensity: 1.0,
            flicker: 0.1,
            dayFactor: 0.25,
          });
      }
      // THE FOUR CONTINENTS on pedestals at street level (west → east: Asia, America, Europe, Africa)
      // pedestals stand clear of the pavilion colonnades (z 883.4..887.0, outer pair at XC ± 16.5)
      [
        ["asia", XC - 16.5],
        ["america", XC - 10.6],
        ["europe", XC + 10.6],
        ["africa", XC + 16.5],
      ].forEach(([kind, x]) => {
        const z = ZS - 2.6,
          hd = 1.8;
        b.boxMM("granite_ch", x - 1.6, 0.25, z - hd, x + 1.6, 2.1, z + hd, {
          seg: false,
          grime: 0.7,
        });
        b.boxMM(
          "granite_ch",
          x - 1.75,
          2.1,
          z - hd - 0.12,
          x + 1.75,
          2.35,
          z + hd + 0.12,
          { seg: false, grime: 0.6 },
        );
        b.boxMM(
          "granite_dark",
          x - 1.75,
          0.25,
          z - hd - 0.12,
          x + 1.75,
          0.55,
          z + hd + 0.12,
          { seg: false, grime: 0.6 },
        );
        PF.colMM(x - 1.6, 0, z - hd, x + 1.6, 4.8, z + hd, { walkable: false });
        // weathered, soot-streaked marble; Europe lost her head to shrapnel (it lies on the plinth)
        PF.seatedFigure(b, "statue_ws", x, 2.35, z + 0.1, 0, kind, 1.25, {
          grime: 0.85,
          broken: kind === "europe",
        });
        atq(kind, x, 1.4, z + hd + 0.02, 2.0, 0.5, { ry: 0, grime: 0.3 });
        anchors["continent_" + kind] = V3(x, 2.35, z);
      });
      // colonnade: columns across the recessed centre, paired columns on the pavilions
      const ordH = ORDER - MAIN - 0.2,
        colR = 0.62;
      const centreCols = 8;
      for (let i = 0; i < centreCols; i++) {
        const x = PW + 1.6 + (i * (PE - PW - 3.2)) / (centreCols - 1);
        if (inGap(x)) {
          // the column under the shell-broken cornice: snapped at two-thirds, its drums across the forecourt
          const y0 = MAIN + 0.2,
            sh = ordH * 0.58;
          b.box(
            "granite_ch",
            x,
            y0,
            ZF + 0.62,
            colR * 2.7,
            colR * 0.45,
            colR * 2.7,
            { seg: false, grime: 0.6 },
          );
          b.cyl(
            "granite_ch",
            x,
            y0 + colR * 0.45,
            ZF + 0.62,
            colR * 0.9,
            colR,
            sh,
            20,
            { hSeg: 3, grime: 0.6 },
          );
          b.rock(
            "granite_ch",
            x,
            y0 + colR * 0.45 + sh,
            ZF + 0.62,
            colR * 0.9,
            { flat: 0.45, rough: 0.7, seed: 51 },
          );
          PF.col(x, ZF + 0.62, colR * 2.2, colR * 2.2, y0, y0 + sh, 0, {
            walkable: false,
          });
          for (const [dx, dz, ry, len] of [
            [-2.2, 1.7, 0.3, 2.2],
            [1.4, 2.0, -0.5, 1.8],
            [-0.4, 1.2, 1.2, 1.4],
          ]) {
            b.cyl(
              "granite_ch",
              x + dx,
              0.25 + colR * 0.85,
              ZF + dz,
              colR * 0.85,
              colR * 0.88,
              len,
              20,
              { rz: HP, ry, hSeg: 1, grime: 0.7 },
            );
            PF.col(
              x + dx,
              ZF + dz,
              len,
              colR * 1.8,
              0.25,
              0.25 + colR * 1.7,
              ry,
              { walkable: false },
            );
          }
          // the Corinthian capital landed upside down
          b.cyl(
            "granite_ch",
            x - 3.4,
            0.25,
            ZF + 1.3,
            colR * 1.25,
            colR * 0.88,
            colR * 2.2,
            12,
            { hSeg: 1, rx: PI, grime: 0.7 },
          );
          D.rubble(b, x - 0.8, 0.25, ZF + 1.2, 0.9, 10, 79);
          continue;
        }
        PF.corinthian(b, "granite_ch", x, MAIN + 0.2, ZF + 0.62, ordH, colR, {
          cheap: false,
        });
      }
      for (const [x0, x1] of [
        [X0, PW],
        [PE, X1],
      ]) {
        const xm = (x0 + x1) / 2;
        for (const dx of [-3.7, -2.3, 2.3, 3.7])
          PF.corinthian(
            b,
            "granite_ch",
            xm + dx,
            MAIN + 0.2,
            ZP + 0.55,
            ordH,
            colR * 0.9,
            { cheap: true },
          );
        // pavilion niche with a window and a sculpted keystone/cartouche
        PF.archBay(b, xm, MAIN + 1.2, ZP + 0.02, 0, 2.2, 6.6, {
          pane: r() < 0.5 ? "glass_dark" : "glass_broken",
          ring: "granite_ch",
          key: "granite_ch",
          sash: true,
          sashKey: "bronze_door",
          ringW: 0.4,
        });
        PF.classicWindow(b, xm, 11.8, ZP + 0.02, 0, 1.8, 3.2, {
          pane: "glass_dark",
          frame: "granite_ch",
          head: "pediment",
        });
        // basement arched window
        PF.archBay(b, xm, 0.9, ZP + 0.02, 0, 2.0, 2.9, {
          pane: "glass_dark",
          ring: "granite_ch",
          ringW: 0.34,
        });
      }
      // windows between the centre columns: main floor tall windows (bronze frames) + upper windows
      for (let i = 0; i < centreCols - 1; i++) {
        const x = PW + 1.6 + ((i + 0.5) * (PE - PW - 3.2)) / (centreCols - 1);
        if (Math.abs(x - XC) < 1.5) continue; // the portal bay
        const roll = r();
        const lit = i === 1 || i === 2 || i === 5; // the traders' lamps behind the main-floor windows
        PF.classicWindow(b, x, MAIN + 1.0, ZF + 0.02, 0, 2.2, 5.0, {
          pane: lit
            ? "window_amber"
            : roll < 0.25
              ? "glass_broken"
              : roll < 0.35
                ? "planks"
                : "glass_dark",
          frame: "granite_ch",
          head: i % 2 ? "cornice" : "pediment",
          frameW: 0.22,
          muntins: [2, 4],
          muntinKey: "bronze_door",
        });
        if (lit)
          PF.glow(V3(x, MAIN + 3.2, ZF + 0.4), 0xffb060, 2.4, null, {
            intensity: 0.7,
            flicker: 0.1,
            dayFactor: 0.1,
          });
        PF.classicWindow(b, x, 11.9, ZF + 0.02, 0, 2.0, 3.0, {
          pane: r() < 0.3 ? "glass_broken" : "glass_dark",
          frame: "granite_ch",
          muntins: [2, 3],
          muntinKey: "bronze_door",
        });
        // basement windows under the stair flanks (outside the stair width)
        if (Math.abs(x - XC) > stairW / 2 + 1.2)
          PF.archBay(b, x, 0.9, ZF + 0.02, 0, 1.8, 2.7, {
            pane: "glass_dark",
            ring: "granite_ch",
            ringW: 0.3,
          });
      }
      // the portal: arched doorway in the centre bay, bronze doors, the arms of the United States above
      {
        const pz = ZF + 0.02;
        PF.archBay(b, XC, MAIN + 0.1, pz, 0, 3.2, 7.2, {
          pane: "window_amber",
          ring: "granite_ch",
          key: "granite_ch",
          ringW: 0.5,
          n: 13,
          jambs: true,
          sash: true,
          sashKey: "bronze_door",
        });
        for (const sg of [-1, 1]) {
          b.boxMM(
            "bronze_door",
            XC + sg * 0.04,
            MAIN + 0.1,
            pz,
            XC + sg * 1.55,
            MAIN + 3.6,
            pz + 0.1,
            { seg: false },
          );
          for (let k = 0; k < 3; k++)
            b.boxMM(
              "bronze_door",
              XC + sg * 0.25,
              MAIN + 0.4 + k * 1.05,
              pz + 0.1,
              XC + sg * 1.35,
              MAIN + 1.2 + k * 1.05,
              pz + 0.14,
              { seg: false, c: 0xc0a880 },
            );
        }
        // Karl Bitter's cartouche: the ARMS OF THE UNITED STATES carved in stone — oval ground, shield, spread eagle
        b.boxMM("granite_ch", XC - 2.3, 12.0, pz, XC + 2.3, 16.4, pz + 0.5, {
          seg: false,
          grime: 0.5,
        });
        {
          const ez = pz + 0.5,
            cy = 14.2,
            st = "statue_ws",
            eo = { grime: 0.75 };
          b.cyl("granite_ch", XC, cy, ez + 0.12, 1.55, 1.55, 0.24, 24, {
            rx: HP,
            hSeg: 1,
            sz: 1.22,
            grime: 0.6,
          });
          const ring = new THREE.TorusGeometry(1.55, 0.09, 5, 28);
          ring.scale(1, 1.22, 1);
          b.add(st, ring, { m: PF.m4(XC, cy, ez + 0.25), grime: 0.7 });
          // heater shield: chief + pales in relief
          const shp = new THREE.Shape();
          shp.moveTo(-0.55, 0.62);
          shp.lineTo(0.55, 0.62);
          shp.lineTo(0.55, -0.1);
          shp.quadraticCurveTo(0.5, -0.6, 0, -0.85);
          shp.quadraticCurveTo(-0.5, -0.6, -0.55, -0.1);
          shp.closePath();
          b.extrude(
            st,
            shp,
            0.16,
            Object.assign({ m: PF.m4(XC, cy - 0.15, ez + 0.28) }, eo),
          );
          b.box(st, XC, cy + 0.2, ez + 0.47, 1.1, 0.26, 0.04, {
            seg: false,
            grime: 0.7,
          });
          for (let k = 0; k < 7; k++)
            b.box(
              st,
              XC - 0.47 + k * 0.157,
              cy - 0.85,
              ez + 0.46,
              0.07,
              1.0 - Math.abs(k - 3) * 0.08,
              0.035,
              { seg: false, grime: 0.7 },
            );
          // the eagle: body behind the shield, head turned toward the olive branch, wings spread high
          b.sphere(st, XC, cy + 0.72, ez + 0.3, 0.3, {
            ws: 10,
            hs: 8,
            sx: 1,
            sy: 1.3,
            sz: 0.8,
            grime: 0.7,
          });
          b.sphere(st, XC - 0.08, cy + 1.2, ez + 0.36, 0.17, {
            ws: 10,
            hs: 8,
            grime: 0.7,
          });
          b.cyl(st, XC - 0.24, cy + 1.17, ez + 0.38, 0.001, 0.06, 0.18, 6, {
            rz: HP,
            hSeg: 1,
            grime: 0.7,
          });
          for (const sg of [-1, 1]) {
            const w = new THREE.Shape();
            w.moveTo(0, 0);
            w.quadraticCurveTo(sg * 0.7, 0.55, sg * 1.25, 1.25);
            w.lineTo(sg * 1.38, 0.9);
            for (let k = 0; k < 5; k++) {
              const t0 = k / 5;
              w.lineTo(sg * (1.38 - t0 * 1.1), 0.9 - t0 * 1.05 - 0.14);
              w.lineTo(
                sg * (1.3 - (t0 + 0.2) * 1.1),
                0.9 - (t0 + 0.2) * 1.05 + 0.02,
              );
            }
            w.lineTo(sg * 0.2, -0.25);
            w.closePath();
            b.extrude(
              st,
              w,
              0.12,
              Object.assign(
                { m: PF.m4(XC + sg * 0.12, cy + 0.55, ez + 0.26) },
                eo,
              ),
            );
            for (let k = 0; k < 4; k++)
              b.box(
                st,
                XC + sg * (0.55 + k * 0.2),
                cy + 0.62 + k * 0.2,
                ez + 0.4,
                0.05,
                0.4,
                0.04,
                { rz: -sg * 0.6, seg: false, grime: 0.7 },
              ); // feather ridges
          }
          // talons: olive branch (left) and a sheaf of arrows (right)
          b.beam(
            st,
            V3(XC - 0.35, cy - 0.7, ez + 0.4),
            V3(XC - 1.05, cy - 0.95, ez + 0.4),
            0.05,
            0.05,
            eo,
          );
          for (let k = 0; k < 5; k++)
            b.sphere(
              st,
              XC - 0.5 - k * 0.12,
              cy - 0.74 - k * 0.05 + (k % 2) * 0.08,
              ez + 0.42,
              0.06,
              { ws: 6, hs: 4, sy: 0.6, grime: 0.7 },
            );
          for (let k = 0; k < 3; k++)
            b.beam(
              st,
              V3(XC + 0.35, cy - 0.72, ez + 0.4),
              V3(XC + 1.05, cy - 0.98 + k * 0.1, ez + 0.4),
              0.025,
              0.025,
              eo,
            );
          b.sphere("granite_dark", XC + 0.35, cy + 0.1, ez + 0.47, 0.12, {
            ws: 6,
            hs: 4,
            sz: 0.4,
            grime: 0.4,
          }); // a bullet-chipped scar
        }
        for (const sg of [-1, 1])
          b.cyl("granite_ch", XC + sg * 2.1, 12.2, pz + 0.3, 0.3, 0.5, 4.0, 8, {
            hSeg: 2,
          });
        b.box("granite_ch", XC, 16.2, pz + 0.3, 5.2, 0.6, 0.8, { seg: false });
        anchors.portal = V3(XC, MAIN, pz + 1.0);
      }
      // entablature: architrave, frieze with the name, cornice with modillions
      // (the front of the entablature, cornice and attic is split around GX0..GX1, where a shell took a bite out of it)
      const split = (x0, y0, z0, x1, y1, z1, o) => {
        b.boxMM("granite_ch", x0, y0, z0, GX0, y1, z1, o);
        b.boxMM("granite_ch", GX1, y0, z0, x1, y1, z1, o);
      };
      split(X0 - 0.3, ORDER - 0.2, ZF - 0.1, X1 + 0.3, ORDER + 0.6, ZF + 1.4, {
        seg: false,
        grime: 0.55,
      });
      b.boxMM(
        "granite_ch",
        X0 - 0.3,
        ORDER - 0.2,
        ZP - 0.1,
        PW,
        ORDER + 0.6,
        ZP + 1.35,
        { seg: false, grime: 0.55 },
      );
      b.boxMM(
        "granite_ch",
        PE,
        ORDER - 0.2,
        ZP - 0.1,
        X1 + 0.3,
        ORDER + 0.6,
        ZP + 1.35,
        { seg: false, grime: 0.55 },
      );
      b.boxMM(
        "granite_ch",
        X0 - 0.5,
        ORDER + 0.6,
        ZN - 0.5,
        X1 + 0.5,
        ENT - 0.5,
        ZF - 1.0,
        { seg: false, grime: 0.55 },
      );
      split(X0 - 0.5, ORDER + 0.6, ZF - 1.0, X1 + 0.5, ENT - 0.5, ZP + 1.2, {
        seg: false,
        grime: 0.55,
      });
      b.boxMM(
        "granite_ch",
        X0 - 0.9,
        ENT - 0.5,
        ZN - 0.9,
        X1 + 0.9,
        ENT,
        ZF - 1.0,
        { seg: false, grime: 0.5 },
      );
      split(X0 - 0.9, ENT - 0.5, ZF - 1.0, X1 + 0.9, ENT, ZP + 1.6, {
        seg: false,
        grime: 0.5,
      });
      for (let x = X0 - 0.4; x < X1 + 0.4; x += 0.8)
        if (!inGap(x))
          b.box("granite_ch", x, ENT - 0.85, ZP + 1.35, 0.2, 0.35, 0.5, {
            seg: false,
          });
      atq("frieze", XC - 1, ORDER + 1.3, ZF + 1.42, 24, 1.1, {
        ry: 0,
        grime: 0.35,
      });
      // the breach: ragged block ends, a sagging steel beam, a black hole into the attic, soot above it
      for (const [x, sg] of [
        [GX0, 1],
        [GX1, -1],
      ])
        for (let k = 0; k < 4; k++)
          b.box(
            "granite_ch",
            x + sg * (0.25 + r() * 0.4),
            ORDER + 0.2 + k * 0.95,
            ZF + 0.2 + r() * 0.8,
            0.7 + r() * 0.5,
            0.7,
            0.9,
            { ry: r() * 0.4, rz: (r() - 0.5) * 0.6, seg: false, grime: 0.7 },
          );
      b.box(
        "rust",
        (GX0 + GX1) / 2 - 0.6,
        ENT - 0.9,
        ZF + 0.2,
        4.6,
        0.35,
        0.22,
        { rz: -0.14, seg: false, grime: 0.6 },
      );
      b.box("rust", GX0 + 1.5, ORDER + 1.0, ZF + 0.25, 0.22, 0.35, 1.6, {
        rx: 0.35,
        seg: false,
        grime: 0.6,
      });
      const hole = new THREE.Shape();
      hole.moveTo(-2.2, -1.2);
      hole.lineTo(-1.2, -1.6);
      hole.lineTo(0.4, -1.3);
      hole.lineTo(1.9, -1.7);
      hole.lineTo(2.3, 0.2);
      hole.lineTo(1.4, 1.5);
      hole.lineTo(-0.3, 1.1);
      hole.lineTo(-1.9, 1.6);
      hole.lineTo(-2.4, 0.1);
      hole.closePath();
      b.add("glass_broken", PF.shapeGeo(hole, 1), {
        m: PF.m4((GX0 + GX1) / 2, ENT + 0.6, ZF + 0.03),
        uv: "box",
        noAO: true,
        grime: 0,
      });
      for (let k = 0; k < 6; k++)
        b.box(
          "tar_ws",
          (GX0 + GX1) / 2 + (r() - 0.5) * 5,
          ENT + 2.0 + r() * 1.2,
          ZF + 0.04,
          0.3 + r() * 0.5,
          1.4 + r() * 1.2,
          0.02,
          { seg: false, noAO: true, grime: 0.2 },
        );
      // attic storey + its row of standing figures (the trading nations) over the columns
      b.boxMM(
        "granite_ch",
        X0 - 0.2,
        ENT,
        ZN - 0.2,
        X1 + 0.2,
        ATTIC,
        ZF - 1.0,
        { seg: false, grime: 0.55 },
      );
      split(X0 - 0.2, ENT, ZF - 1.0, X1 + 0.2, ATTIC, ZF + 0.4, {
        seg: false,
        grime: 0.55,
      });
      for (let k = 0; k < 5; k++)
        b.box(
          "granite_ch",
          GX0 + 0.5 + k * 1.3,
          ENT - 0.1,
          ZF - 0.6 + r() * 0.5,
          1.0 + r() * 0.4,
          0.4 + r() * 1.3,
          0.9,
          { ry: (r() - 0.5) * 0.3, seg: false, grime: 0.7 },
        );
      b.boxMM("granite_ch", X0 - 0.2, ENT, ZF, PW, ATTIC, ZP + 0.6, {
        seg: false,
        grime: 0.5,
      });
      b.boxMM("granite_ch", PE, ENT, ZF, X1 + 0.2, ATTIC, ZP + 0.6, {
        seg: false,
        grime: 0.5,
      });
      for (let x = X0 + 2; x < X1 - 1; x += 3.4)
        if (!inGap(x))
          b.quad(
            r() < 0.2 ? "glass_broken" : "glass_dark",
            x,
            ENT + 1.4,
            ZF + 0.42,
            1.2,
            1.2,
            { ry: 0, noAO: true },
          );
      const figXs = [];
      for (let i = 0; i < centreCols; i++)
        figXs.push(PW + 1.6 + (i * (PE - PW - 3.2)) / (centreCols - 1));
      for (const [x0, x1] of [
        [X0, PW],
        [PE, X1],
      ]) {
        const xm = (x0 + x1) / 2;
        figXs.push(xm - 3, xm + 3);
      }
      // the attic figures — the great trading nations — as standing draped statues with their attributes
      figXs.forEach((x, i) => {
        const zf = x > PW && x < PE ? ZF + 0.9 : ZP + 0.9;
        if (inGap(x)) return; // went down with the cornice
        if (i === 3) {
          D.rubble(b, x, ENT, zf, 0.5, 3, 77);
          return;
        } // one figure has fallen (its rubble lies on the steps)
        b.box("granite_ch", x, ENT, zf, 1.0, 0.5, 0.9, {
          seg: false,
          grime: 0.6,
        });
        PF.standingFigure(
          b,
          "statue_ws",
          x,
          ENT + 0.5,
          zf,
          (x - XC) * -0.006,
          i % 6,
          1.05,
          { grime: 0.85, broken: i === 9 },
        );
      });
      D.rubble(b, XC + 5, MAIN, ZF + 1.3, 0.6, 5, 78);
      // shrapnel scorch streaks above a few windows
      for (const x of [XC - 13.6, XC - 3.3, XC + 8.2])
        for (let k = 0; k < 3; k++)
          b.box(
            "tar_ws",
            x + (k - 1) * 0.5 + (r() - 0.5) * 0.3,
            MAIN + 6.4 + r() * 0.4,
            ZF + 0.05,
            0.25 + r() * 0.3,
            2.2 + r() * 2.4,
            0.02,
            { seg: false, noAO: true, grime: 0.1 },
          );
      // copper mansard with dormers + cresting
      {
        const mh = ROOF - ATTIC,
          inset = 2.2;
        const face = (x0, z0, x1, z1, nx, nz) => {
          const len = Math.hypot(x1 - x0, z1 - z0),
            ry = Math.atan2(nx, nz),
            ang = Math.atan2(inset, mh);
          const cx = (x0 + x1) / 2 - (nx * inset) / 2,
            cz = (z0 + z1) / 2 - (nz * inset) / 2;
          b.box(
            "copper_dull",
            cx,
            ATTIC + mh / 2 - 0.2,
            cz,
            len,
            0.3,
            Math.hypot(inset, mh),
            { ry, rx: HP - ang, seg: true, segLen: 3, grime: 0.9, c: 0xb8c4b8 },
          );
          const n = Math.floor(len / 5);
          for (let i = 0; i < n; i++) {
            const t = (i + 0.5) / n,
              px = x0 + (x1 - x0) * t - nx * 0.9,
              pz = z0 + (z1 - z0) * t - nz * 0.9;
            if (nz > 0 && px > GX0 - 1 && px < GX1 + 1) continue;
            b.box("granite_ch", px, ATTIC + 0.2, pz, 1.7, 2.6, 1.5, {
              ry,
              seg: false,
              grime: 0.55,
            });
            K.pediment(
              b,
              "granite_ch",
              px + nx * 0.1,
              ATTIC + 2.8,
              pz + nz * 0.1,
              2.0,
              0.6,
              1.6,
              ry,
              {},
            );
            const q = PF.rot(px, pz, ry, 0, 0.77);
            b.quad(
              r() < 0.35 ? "glass_broken" : "glass_dark",
              q[0],
              ATTIC + 1.5,
              q[1],
              0.9,
              1.7,
              { ry, noAO: true },
            );
          }
          // oxidation streaks down the copper (thin strips lying on the slope, pale verdigris runs from the cresting)
          const nS = Math.floor(len / 1.7),
            sl = Math.hypot(inset, mh);
          for (let k = 0; k < nS; k++) {
            const t = (k + r()) / nS,
              L = sl * (0.45 + r() * 0.5),
              dd = (sl - L) / 2;
            const ax = x0 + (x1 - x0) * t - (nx * inset) / 2,
              az = z0 + (z1 - z0) * t - (nz * inset) / 2;
            const sx = -nx * dd * Math.sin(ang),
              sz = -nz * dd * Math.sin(ang),
              sy = dd * Math.cos(ang); // runs start at the ridge
            b.box(
              "copper_ws",
              ax + sx,
              ATTIC + mh / 2 - 0.05 - 0.17 + sy,
              az + sz,
              0.2 + r() * 0.35,
              0.34,
              L,
              {
                ry,
                rx: HP - ang,
                seg: false,
                noAO: true,
                grime: 0.25,
                c: 0xe0f4e8,
              },
            );
          }
        };
        face(X0, ZN, X1, ZN, 0, -1);
        face(X0, ZP + 0.6, X1, ZP + 0.6, 0, 1);
        face(X0, ZN, X0, ZP, -1, 0);
        face(X1, ZN, X1, ZP, 1, 0);
        b.boxMM(
          "tar_ws",
          X0 + inset,
          ROOF - 0.1,
          ZN + inset,
          X1 - inset,
          ROOF + 0.1,
          ZP + 0.6 - inset,
          { segLen: 8, grime: 0.7 },
        );
        // convoy lookout on the roof: plank deck, sandbags, a lantern pole, the water tank
        {
          const lx = XC + 12,
            lz = ZP - 3.2;
          b.boxMM(
            "planks",
            lx - 2,
            ROOF + 0.1,
            lz - 1.6,
            lx + 2,
            ROOF + 0.3,
            lz + 1.6,
            { seg: false, grime: 0.6 },
          );
          PF.sandbags(b, lx - 1.8, lz + 1.4, lx + 1.8, lz + 1.4, 2, {
            y: ROOF + 0.3,
            noCollide: true,
          });
          b.box("rotten", lx + 1.7, ROOF + 0.3, lz - 1.3, 0.12, 3.0, 0.12, {
            seg: false,
          });
          b.box("lamp_ws", lx + 1.7, ROOF + 3.3, lz - 1.3, 0.22, 0.3, 0.22, {
            seg: false,
            noAO: true,
            grime: 0,
          });
          PF.glow(V3(lx + 1.7, ROOF + 3.45, lz - 1.3), 0xffc070, 1.8, null, {
            intensity: 1.0,
            flicker: 0.2,
            dayFactor: 0.15,
          });
          const wx = X0 + 9,
            wz = ZN + 8;
          b.cyl("rotten", wx, ROOF + 3.4, wz, 2.0, 2.0, 3.8, 12, { hSeg: 2 });
          b.cyl("tar_ws", wx, ROOF + 7.2, wz, 0.2, 2.3, 1.3, 12, { hSeg: 1 });
          for (const [sx, sz] of [
            [-1.3, -1.3],
            [1.3, -1.3],
            [-1.3, 1.3],
            [1.3, 1.3],
          ])
            b.box("iron", wx + sx, ROOF, wz + sz, 0.2, 3.4, 0.2, {
              seg: false,
            });
        }
        // the skylight of the rotunda (a glass lantern on the roof)
        b.cyl("copper_dull", XC, ROOF, (ZN + ZF) / 2, 5.5, 6.2, 1.4, 20, {
          hSeg: 1,
        });
        b.cyl("glass_dark", XC, ROOF + 1.4, (ZN + ZF) / 2, 1.0, 5.4, 2.4, 20, {
          hSeg: 2,
        });
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          b.beam(
            "copper_dull",
            V3(
              XC + Math.cos(a) * 5.4,
              ROOF + 1.4,
              (ZN + ZF) / 2 + Math.sin(a) * 5.4,
            ),
            V3(
              XC + Math.cos(a) * 1.0,
              ROOF + 3.8,
              (ZN + ZF) / 2 + Math.sin(a) * 1.0,
            ),
            0.1,
            0.1,
          );
        }
        // cresting along the ridge line
        for (let x = X0 + inset; x <= X1 - inset; x += 0.6)
          if (r() > 0.12)
            b.cyl(
              "copper_dull",
              x,
              ROOF + 0.1,
              ZN + inset,
              0.02,
              0.05,
              0.6,
              4,
              { hSeg: 1 },
            );
      }
      // other faces: granite with two tiers of windows between flat pilasters
      const sideFace = (ax, az, cx, cz, ry, nx, nz) => {
        const len = Math.hypot(cx - ax, cz - az),
          n = Math.max(1, Math.round(len / 4.2));
        const ux = (cx - ax) / len,
          uz = (cz - az) / len;
        for (let i = 0; i < n; i++) {
          const t = ((i + 0.5) * len) / n,
            px = ax + ux * t + nx * 0.02,
            pz = az + uz * t + nz * 0.02;
          PF.archBay(b, px, 0.9, pz, ry, 1.8, 2.7, {
            pane: "glass_dark",
            ring: "granite_ch",
            ringW: 0.3,
          });
          PF.classicWindow(b, px, MAIN + 1.2, pz, ry, 2.0, 4.2, {
            pane: r() < 0.25 ? "glass_broken" : "glass_dark",
            frame: "granite_ch",
            head: i % 2 ? "cornice" : "pediment",
            muntins: [2, 4],
            muntinKey: "bronze_door",
          });
          PF.classicWindow(b, px, 11.8, pz, ry, 1.8, 3.0, {
            pane: r() < 0.25 ? "glass_broken" : "glass_dark",
            frame: "granite_ch",
          });
        }
        for (let i = 0; i <= n; i++) {
          const t = (i * len) / n,
            px = ax + ux * t + nx * 0.2,
            pz = az + uz * t + nz * 0.2;
          b.box(
            "granite_ch",
            px,
            MAIN + 0.2,
            pz,
            Math.abs(ux) > 0 ? 0.8 : 0.4,
            ORDER - MAIN - 0.2,
            Math.abs(uz) > 0 ? 0.8 : 0.4,
            { seg: false, grime: 0.45 },
          );
        }
      };
      sideFace(X0, ZN, X1, ZN, PI, 0, -1);
      sideFace(X1, ZN, X1, ZP, HP, 1, 0);
      sideFace(X0, ZP, X0, ZN, -HP, -1, 0);

      // =================================================================
      // THE TRADING POST: banner, wagons, hitching rails, hay, trough, guards
      // =================================================================
      {
        for (const x of [XC - 7.4, XC + 7.4]) {
          atq("banner", x, 10.5, ZF + 1.35, 2.6, 3.25 * 1.0, {
            ry: 0,
            grime: 0.3,
          });
          b.box("rotten", x, 12.2, ZF + 1.3, 2.9, 0.08, 0.08, { seg: false });
        }
        // wagons in the forecourt corners
        PF.wagon(b, X0 + 4.2, 0.25, ZS - 2.4, HP + 0.1, {
          canvas: "canvas_ws",
        });
        PF.wagon(b, X1 - 4.2, 0.25, ZS - 2.4, -HP - 0.08, {});
        // hitching rails + water troughs on the Bridge St kerb (in front of the pavilion balustrades), hay by the wagons
        for (const x0 of [X0 + 1.4, X1 - 9.4]) {
          const kz = ZS + 0.85;
          for (const x of [x0, x0 + 3.9, x0 + 7.8])
            b.box("rotten", x, 0, kz, 0.16, 1.15, 0.16, {
              seg: false,
              grime: 0.6,
            });
          b.box("rotten", x0 + 3.9, 1.05, kz, 7.9, 0.12, 0.12, {
            seg: false,
            grime: 0.6,
          });
          PF.colWall(x0, kz, x0 + 7.8, kz, 0.2, 0, 1.2, { walkable: false });
          b.boxMM("rotten", x0 + 1.0, 0, kz - 0.75, x0 + 3.0, 0.62, kz - 0.2, {
            seg: false,
            grime: 0.6,
          });
          b.boxMM(
            "water",
            x0 + 1.1,
            0.52,
            kz - 0.68,
            x0 + 2.9,
            0.56,
            kz - 0.27,
            { seg: false, noAO: true },
          );
          PF.colMM(x0 + 1.0, 0, kz - 0.75, x0 + 3.0, 0.62, kz - 0.2, {
            walkable: false,
          });
          b.beam(
            "rope",
            V3(x0 + 5.2, 1.0, kz),
            V3(x0 + 5.5, 0.35, kz - 0.4),
            0.02,
            0.02,
            {},
          ); // a lead rope left tied
        }
        atq("water", X0 + 3.4, 1.4, ZS + 0.93, 1.8, 0.34, {
          ry: 0,
          grime: 0.3,
        });
        for (const [x, k0] of [
          [X0 + 4.2, 0],
          [X1 - 4.2, 3],
        ])
          for (let k = 0; k < 3; k++)
            b.box(
              "hay",
              x - 1.2 + k * 1.15,
              0.25 + (k === 1 ? 0.45 : 0),
              ZS - 0.85 - (k === 1 ? 0.05 : 0),
              1.0,
              0.45,
              0.55,
              { ry: (k + k0) * 0.07, seg: false, grime: 0.35 },
            );
        // a convoy sign post at the kerb
        b.box("rotten", XC - 9.4, 0.25, ZS - 0.6, 0.14, 3.2, 0.14, {
          seg: false,
        });
        atq("post", XC - 9.4, 3.0, ZS - 0.52, 2.2, 0.69, { ry: 0, grime: 0.3 });
        // lanterns on the landing, crates of trade goods
        for (const x of [XC - 5.4, XC + 5.4]) {
          b.box("iron", x, MAIN, landZ - 0.4, 0.08, 1.6, 0.08, { seg: false });
          b.box("lamp_ws", x, MAIN + 1.6, landZ - 0.4, 0.2, 0.3, 0.2, {
            seg: false,
            noAO: true,
            grime: 0,
          });
          PF.glow(V3(x, MAIN + 1.8, landZ - 0.4), 0xffc070, 1.4, null, {
            intensity: 0.9,
            flicker: 0.15,
            dayFactor: 0.2,
          });
        }
        D.crates(b, X0 + 8.2, 0.25, ZS - 2.0, 2, 41);
        D.crates(b, X1 - 8.4, 0.25, ZS - 1.6, 3, 42);
        // the hub is lit at night: fire barrels on the landing & the forecourt corners, string lights
        // between the centre columns, a convoy campfire beside the west wagon
        PF.barrel(b, X1 - 9.6, 0.25, ZS - 3.2, { fire: true });
        PF.barrel(b, X0 + 9.2, 0.25, ZS - 1.6, { fire: true });
        for (const x of [XC - 7.6, XC + 7.6])
          PF.barrel(b, x, 0.25, ZS - 1.6, { fire: true });
        for (let i = 1; i < centreCols - 2; i++) {
          const xa = PW + 1.6 + (i * (PE - PW - 3.2)) / (centreCols - 1),
            xb = PW + 1.6 + ((i + 1) * (PE - PW - 3.2)) / (centreCols - 1);
          if (Math.abs((xa + xb) / 2 - XC) < 1.5) continue;
          D.stringLights(
            b,
            V3(xa, MAIN + 5.6, ZF + 1.3),
            V3(xb, MAIN + 5.6, ZF + 1.3),
            0.7,
            8,
            0xffc070,
          );
        }
        {
          const fx = XC - 13.55,
            fz = ZS - 2.2; // between the Asia and America pedestals
          for (let i = 0; i < 7; i++) {
            const a = (i / 7) * TAU;
            b.rock(
              "rubble",
              fx + Math.cos(a) * 0.6,
              0.35,
              fz + Math.sin(a) * 0.5,
              0.18,
              { flat: 0.6, detail: 0 },
            );
          }
          b.cyl("fire", fx, 0.28, fz, 0.28, 0.36, 0.22, 8, {
            hSeg: 1,
            noAO: true,
            grime: 0,
          });
          PF.fires.push(V3(fx, 0.5, fz));
          PF.glow(V3(fx, 0.9, fz), 0xff9a40, 2.6, null, {
            intensity: 1.0,
            flicker: 0.35,
            dayFactor: 0.2,
          });
          b.box("rotten", fx, 0.25, fz - 1.25, 1.6, 0.35, 0.35, {
            ry: 0.1,
            seg: false,
          }); // log bench
        }
      }

      // =================================================================
      // anchors
      // =================================================================
      anchors.entrance = PF.anchor(XC, 0.25, ZS + 2.5, PI);
      anchors.exterior_entrance = anchors.entrance;
      anchors.landing = PF.anchor(XC, MAIN, landZ - 0.8, 0);
      anchors.guard1 = PF.anchor(XC - 4.6, MAIN, landZ - 0.9, PI);
      anchors.guard2 = PF.anchor(XC + 6.0, 0.25, ZS - 1.6, PI);
      anchors.convoy1 = PF.anchor(X0 + 6.8, 0.25, ZS - 2.0, -HP);
      anchors.convoy2 = PF.anchor(X1 - 6.6, 0.25, ZS - 3.6, HP);
      CH.anchors = anchors;
      CH.door = V3(XC, MAIN + 1.6, ZF + 0.35);
      PF.flushFires();
      b.build(root);
      PF.flushGlows(root);
    },
    40,
  );
