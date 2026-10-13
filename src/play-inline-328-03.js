// play-inline-328 03 — hx0
// Lines 35-764 of readable/play-inline-328.pretty.js (statement-aligned).
  PF.addBuilder(
    "webster_hall",
    function (PF2, site, root) {
      const b = PF.batch("webster_ext");
      b.ground = 0;
      b.aoH = 5;
      const { HX0, HX1, Z0, Z1, H } = WH;
      const anchors = {};
      const zf = Z1; // façade plane (south)
      const xc = (HX0 + HX1) / 2; // 160
      // ---------------- main mass ----------------
      b.boxMM("brick_web", HX0, 0, Z0, HX1, H, zf, { segLen: 5, grime: 0.5 });
      PF.colMM(HX0, 0, Z0, HX1, H + 1.2, zf, { walkable: true });
      b.boxMM("tar", HX0 + 0.3, H, Z0 + 0.3, HX1 - 0.3, H + 0.1, zf - 0.3, {
        segLen: 8,
      });
      // ---------------- façade (south) ----------------
      const F = { base: 4.4, arcadeTop: 12.4, f4: 12.9, f5: 16.0 };
      // rusticated brick base: banded courses
      for (let y = 0.9; y < F.base; y += 0.45)
        b.boxMM("brick_web", HX0 - 0.1, y, zf, HX1 + 0.1, y + 0.3, zf + 0.12, {
          seg: false,
          c: 0xd8b8a8,
        });
      b.boxMM("granite_dark", HX0 - 0.2, 0, zf, HX1 + 0.2, 0.9, zf + 0.25, {
        seg: false,
      });
      b.boxMM(
        "terra",
        HX0 - 0.2,
        F.base,
        zf,
        HX1 + 0.2,
        F.base + 0.5,
        zf + 0.35,
        { seg: false },
      );
      // ground floor openings: entrance arch (centre), shop windows, side doors
      const bays = 9,
        bw = (HX1 - HX0) / bays;
      for (let i = 0; i < bays; i++) {
        const x = HX0 + (i + 0.5) * bw;
        const centre = i === 4;
        if (centre) continue;
        PF.archBay(b, x, 0.9, zf + 0.13, 0, 2.4, 3.3, {
          pane: i % 3 === 1 ? "planks" : "glass_dark",
          ring: "terra",
          key: "terra",
          sash: i % 3 !== 1,
        });
      }
      // grand entrance: stone surround, double doors (lit lobby behind), steps
      {
        b.boxMM("terra", xc - 3.0, 0, zf, xc + 3.0, F.base, zf + 0.5, {
          seg: false,
        });
        PF.archBay(b, xc, 0.3, zf + 0.52, 0, 3.4, 4.0, {
          pane: "window_lit",
          ring: "terra",
          key: "terra",
          sash: false,
        });
        for (const sx of [-1, 1]) {
          b.boxMM(
            "oak",
            xc + sx * 0.05,
            0.3,
            zf + 0.55,
            xc + sx * 1.55,
            2.9,
            zf + 0.62,
            { seg: false },
          );
          b.box("brass", xc + sx * 0.3, 1.5, zf + 0.66, 0.06, 0.4, 0.05, {
            seg: false,
          });
        }
        for (let k = 0; k < 2; k++)
          b.boxMM(
            "granite",
            xc - 3.2,
            0,
            zf + 0.5 + k * 0.4,
            xc + 3.2,
            0.3 - k * 0.15,
            zf + 0.9 + k * 0.4,
            { seg: false },
          );
        PF.colMM(xc - 3.2, 0, zf + 0.5, xc + 3.2, 0.3, zf + 0.9, {
          surface: "concrete",
        });
        PF.colMM(xc - 3.0, 0, zf, xc + 3.0, F.base, zf + 0.55, {
          walkable: false,
        });
        WH.door = V3(xc, 1.6, zf + 0.9);
        anchors.entrance = PF.anchor(xc, 0, zf + 3.2, 0);
        PF.glow(V3(xc, 2.2, zf + 1.1), 0xffc880, 3.2, null, {
          intensity: 1.1,
          dayFactor: 0.3,
        });
      }
      // giant arcade of the ballroom (F2+F3): 7 tall round arches between terracotta pilasters
      {
        const n = 7,
          aw = (HX1 - HX0 - 4) / n;
        for (let i = 0; i <= n; i++) {
          const x = HX0 + 2 + i * aw;
          b.boxMM(
            "terra",
            x - 0.45,
            F.base + 0.5,
            zf,
            x + 0.45,
            F.arcadeTop,
            zf + 0.4,
            { seg: false, grime: 0.5 },
          );
          b.boxMM(
            "terra",
            x - 0.6,
            F.arcadeTop - 0.6,
            zf,
            x + 0.6,
            F.arcadeTop,
            zf + 0.5,
            { seg: false },
          ); // capital block
        }
        for (let i = 0; i < n; i++) {
          const x = HX0 + 2 + (i + 0.5) * aw;
          PF.archBay(
            b,
            x,
            F.base + 0.9,
            zf + 0.07,
            0,
            aw - 1.3,
            F.arcadeTop - F.base - 1.3,
            {
              pane: i % 4 === 2 ? "glass_broken" : "window_lit",
              ring: "terra",
              key: "terra",
            },
          );
          // spandrel panel between floors (cast-iron, dark green) inside the arch
          b.boxMM(
            "steel_win",
            x - (aw - 1.3) / 2,
            F.base + 4.1,
            zf + 0.09,
            x + (aw - 1.3) / 2,
            F.base + 4.5,
            zf + 0.14,
            { seg: false },
          );
        }
        b.boxMM(
          "terra",
          HX0 - 0.2,
          F.arcadeTop,
          zf,
          HX1 + 0.2,
          F.arcadeTop + 0.45,
          zf + 0.4,
          { seg: false },
        );
      }
      // fourth floor: paired square windows; fifth: small arcaded attic windows
      for (let i = 0; i < 14; i++) {
        const x = HX0 + 1.8 + (i * (HX1 - HX0 - 3.6)) / 13;
        PF.segWindow(
          b,
          x,
          F.f4 + 0.5,
          zf + 0.06,
          0,
          1.4,
          1.9,
          i % 5 === 3 ? "glass_broken" : "glass_dark",
        );
        PF.archBay(b, x, F.f5 + 0.25, zf + 0.06, 0, 1.0, 1.6, {
          pane: i % 6 === 1 ? "glass_broken" : "glass_dark",
          ring: "terra",
          sash: false,
        });
      }
      b.boxMM(
        "terra",
        HX0 - 0.2,
        F.f5 - 0.2,
        zf,
        HX1 + 0.2,
        F.f5 + 0.1,
        zf + 0.35,
        { seg: false },
      );
      // bracketed cornice + parapet with the name block and date
      b.boxMM("terra", HX0 - 0.5, H - 0.6, zf, HX1 + 0.5, H - 0.2, zf + 0.9, {
        seg: false,
      });
      for (let x = HX0; x <= HX1; x += 1.1)
        b.box("terra", x, H - 1.25, zf + 0.45, 0.25, 0.65, 0.7, { seg: false });
      b.boxMM("brick_web", HX0, H - 0.2, zf - 0.3, HX1, H + 1.1, zf + 0.2, {
        seg: false,
      });
      b.boxMM(
        "terra",
        HX0 - 0.1,
        H + 1.1,
        zf - 0.35,
        HX1 + 0.1,
        H + 1.3,
        zf + 0.3,
        { seg: false },
      );
      b.boxMM(
        "brick_web",
        xc - 7,
        H + 1.1,
        zf - 0.3,
        xc + 7,
        H + 3.0,
        zf + 0.2,
        { seg: false },
      );
      b.boxMM(
        "terra",
        xc - 7.2,
        H + 3.0,
        zf - 0.35,
        xc + 7.2,
        H + 3.25,
        zf + 0.3,
        { seg: false },
      );
      const nameKey = PF.texMat(
        "wh_name",
        PF.signTex("wh_name", ["WEBSTER HALL"], "engraved", 1024, 128, {
          bg: "#d8c8a8",
        }),
        { rough: 0.9 },
      );
      b.quad(nameKey, xc, H + 2.05, zf + 0.22, 12.5, 1.5, {
        ry: 0,
        grime: 0.3,
      });
      const dateKey = PF.texMat(
        "wh_date",
        PF.signTex("wh_date", ["1886"], "engraved", 256, 128, {
          bg: "#d8c8a8",
        }),
        { rough: 0.9 },
      );
      b.quad(dateKey, xc, F.f5 + 1.1, zf + 0.37, 1.6, 0.8, {
        ry: 0,
        grime: 0.3,
      });
      // side and rear walls: plain brick with windows (east, west above the wings; north)
      for (const [x, ry] of [
        [HX0, -HP],
        [HX1, HP],
      ]) {
        for (let f = 0; f < 2; f++)
          for (let z = Z0 + 3; z < zf - 2; z += 4.2)
            PF.segWindow(
              b,
              x + (ry > 0 ? 0.06 : -0.06),
              13.4 + f * 3.0,
              z,
              ry,
              1.4,
              1.8,
              ((z + f) | 0) % 3 < 1 ? "glass_broken" : "glass_dark",
            );
        if (ry < 0)
          for (let f = 0; f < 2; f++)
            for (let z = Z0 + 14; z < zf - 2; z += 4.2)
              PF.segWindow(
                b,
                x - 0.06,
                5.4 + f * 4.0,
                z,
                ry,
                1.4,
                1.8,
                ((z + f) | 0) % 3 < 1 ? "glass_broken" : "glass_dark",
              );
      }
      for (let x = HX0 + 3; x < HX1 - 2; x += 4.4)
        for (const y of [5.4, 13.4])
          PF.segWindow(
            b,
            x,
            y,
            Z0 - 0.06,
            PI,
            1.6,
            2.0,
            ((x + y) | 0) % 3 < 1 ? "glass_broken" : "glass_dark",
          );
      // ghost sign on the east wall above the wing
      const gk = PF.ghostKey(
        "wh_ghost",
        ["WEBSTER HALL", "BALLS — BANQUETS — DANCING"],
        { w: 1024, h: 256 },
      );
      b.quad(gk, HX1 + 0.08, 16.2, (Z0 + zf) / 2, 18, 4.4, {
        ry: HP,
        grime: 0.1,
        noAO: true,
      });

      // ---------------- the marquee ----------------
      {
        const mx0 = xc - 9,
          mx1 = xc + 9,
          mz1 = zf + 4.2,
          my0 = 4.2,
          my1 = 5.2;
        b.boxMM("steel_win", mx0, my0, zf, mx1, my1, mz1, { seg: false });
        b.boxMM(
          "paint_cream",
          mx0 - 0.05,
          my0 - 0.05,
          mz1 - 0.05,
          mx1 + 0.05,
          my1 + 0.05,
          mz1 + 0.05,
          { seg: false },
        );
        // soffit bulbs (underside grid) + fascia bulbs
        for (let x = mx0 + 0.5; x < mx1; x += 0.9)
          for (let z = zf + 0.6; z < mz1; z += 1.0)
            b.sphere("bulb", x, my0 - 0.06, z, 0.07, {
              ws: 5,
              hs: 3,
              noAO: true,
              grime: 0,
            });
        for (let x = mx0 + 0.2; x <= mx1; x += 0.45)
          for (const y of [my0 + 0.12, my1 - 0.12])
            b.sphere("bulb", x, y, mz1 + 0.08, 0.055, {
              ws: 5,
              hs: 3,
              noAO: true,
              grime: 0,
            });
        for (const [sx, xx] of [
          [-1, mx0],
          [1, mx1],
        ])
          for (let z = zf + 0.4; z <= mz1; z += 0.45)
            b.sphere("bulb", xx + sx * 0.08, my0 + 0.5, z, 0.055, {
              ws: 5,
              hs: 3,
              noAO: true,
              grime: 0,
            });
        // tie rods back to the façade
        for (const x of [mx0 + 1, xc, mx1 - 1])
          b.beam(
            "iron",
            V3(x, my1, mz1 - 0.3),
            V3(x, 8.4, zf + 0.1),
            0.05,
            0.05,
            {},
          );
        // fascia letter board: "TONIGHT: THE RADIUM RHYTHM KINGS"
        const board = PF.texMat(
          "wh_board",
          PF.canvasTex(
            "pch_wh_board",
            1024,
            64,
            (ctx, w, h) => {
              ctx.fillStyle = "#f0e8d0";
              ctx.fillRect(0, 0, w, h);
              ctx.fillStyle = "#1a1a1a";
              ctx.font = 'bold 44px "Arial Narrow", Arial, sans-serif';
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(
                "TONITE  ✦  THE RADIUM RHYTHM KINGS  ✦  DANCING TIL DAWN",
                w / 2,
                h / 2 + 2,
              );
              ctx.fillStyle = "rgba(0,0,0,0.12)";
              for (let i = 0; i < 40; i++)
                ctx.fillRect(Math.random() * w, 0, 2, h);
            },
            { clamp: true },
          ),
          { rough: 0.7, emissive: 0.35 },
        );
        b.quad(board, xc, my0 + 0.5, mz1 + 0.07, 16.5, 0.62, {
          ry: 0,
          grime: 0.2,
          noAO: true,
        });
        for (const [sx, xx] of [
          [-1, mx0],
          [1, mx1],
        ])
          b.quad(board, xx + sx * 0.07, my0 + 0.5, (zf + mz1) / 2, 3.6, 0.62, {
            ry: sx * HP,
            grime: 0.2,
            noAO: true,
            uvRect: [0.25, 0, 0.75, 1],
          });
        PF.col(xc, (zf + mz1) / 2, mx1 - mx0, mz1 - zf, my0, my1, 0, {
          surface: "metal",
        });
        // supporting posts at the kerb (with gig posters)
        for (const x of [mx0 + 0.4, mx1 - 0.4]) {
          b.cyl("iron", x, 0, mz1 - 0.3, 0.1, 0.12, my0, 8, { hSeg: 1 });
          PF.col(x, mz1 - 0.3, 0.3, 0.3, 0, my0, 0, { walkable: false });
        }
        for (const g of [
          PF.glow(V3(xc, my0 - 0.4, zf + 2.2), 0xffe0a0, 5.5, null, {
            intensity: 1.0,
            dayFactor: 0.25,
          }),
        ])
          void g;
        for (const x of [mx0 + 2, mx1 - 2])
          PF.glow(V3(x, my0 - 0.3, zf + 2.2), 0xffe0a0, 3, null, {
            intensity: 0.9,
            dayFactor: 0.2,
          });
      }
      // neon letters on top of the marquee + the vertical blade sign
      const neonWH = PF.neonKey("wh_marquee", "Webster Hall", "#ff3a9a", {
        w: 1024,
        h: 256,
        italic: true,
        font: 'Georgia, "Times New Roman", serif',
      });
      const neonBlade = PF.neonKey("wh_blade", "WEBSTER", "#40b8ff", {
        w: 1024,
        h: 180,
      });
      {
        const q = new THREE.PlaneGeometry(13, 3.2);
        const m = new THREE.Mesh(q, PF.mat(neonWH));
        m.position.set(xc, 6.9, zf + 3.9);
        root.add(m);
        WH.neon.push(m);
        b.boxMM(
          "steel_win",
          xc - 6.3,
          5.2,
          zf + 3.85,
          xc + 6.3,
          5.5,
          zf + 4.0,
          { seg: false },
        );
        for (const x of [xc - 5.5, xc, xc + 5.5])
          b.box("steel_win", x, 5.2, zf + 3.9, 0.06, 2.2, 0.06, { seg: false });
        PF.glow(V3(xc, 6.9, zf + 4.3), 0xff4aa8, 7.5, null, {
          intensity: 1.2,
          dayFactor: 0.25,
          flicker: 0.05,
        });
        // blade sign: box with neon letters rotated vertically on both faces
        const bx = HX0 + 5,
          bz = zf + 1.2,
          by0 = 6,
          by1 = 15.5;
        b.boxMM("steel_win", bx - 0.2, by0, bz - 0.9, bx + 0.2, by1, bz + 0.9, {
          seg: false,
        });
        b.boxMM(
          "paint_red",
          bx - 0.22,
          by0 + 0.1,
          bz - 0.8,
          bx + 0.22,
          by1 - 0.1,
          bz + 0.8,
          { seg: false },
        );
        for (const sx of [-1, 1]) {
          const mm = new THREE.Mesh(
            new THREE.PlaneGeometry(9.2, 1.6),
            PF.mat(neonBlade),
          );
          mm.position.set(bx + sx * 0.24, (by0 + by1) / 2, bz);
          mm.rotation.set(0, sx * HP, sx * HP);
          root.add(mm);
          WH.neon.push(mm);
        }
        for (let y = by0 + 0.3; y < by1; y += 0.5)
          for (const sz of [-0.85, 0.85])
            b.sphere("bulb", bx, y, bz + sz, 0.05, {
              ws: 4,
              hs: 3,
              noAO: true,
              grime: 0,
            });
        for (const y of [by0 + 1, (by0 + by1) / 2, by1 - 1])
          b.beam(
            "iron",
            V3(bx, y, bz - 0.9),
            V3(bx, y + 0.8, zf + 0.05),
            0.05,
            0.05,
            {},
          );
        PF.glow(V3(bx + 0.8, (by0 + by1) / 2, bz), 0x40b8ff, 6, null, {
          intensity: 1.0,
          dayFactor: 0.25,
          flicker: 0.03,
        });
        PF.glow(V3(bx - 0.8, (by0 + by1) / 2, bz), 0x40b8ff, 6, null, {
          intensity: 1.0,
          dayFactor: 0.25,
          flicker: 0.03,
        });
      }
      // ---------------- settlement dressing at the door ----------------
      PF.sandbags(b, xc - 8, zf + 6.2, xc - 3, zf + 6.2, 3);
      PF.sandbags(b, xc + 3, zf + 6.2, xc + 8, zf + 6.2, 3);
      PF.scrapWall(b, HX0 - 0.5, zf + 5.5, xc - 9.5, zf + 5.5, 2.4, {
        seed: 301,
        noSpikes: true,
      });
      PF.scrapWall(b, xc + 9.5, zf + 5.5, HX1 + 0.5, zf + 5.5, 2.4, {
        seed: 302,
        noSpikes: true,
      });
      PF.barrel(b, xc - 4.2, 0, zf + 5.2, { fire: true });
      PF.barrel(b, xc + 4.2, 0, zf + 5.2, { fire: true });
      // chalkboard A-frame
      {
        const cx = xc + 2.4,
          cz = zf + 3.6;
        for (const s of [-1, 1])
          b.box("oak", cx, 0, cz + s * 0.18, 0.8, 1.2, 0.05, {
            rx: s * 0.15,
            seg: false,
          });
        const ck = PF.texMat(
          "wh_chalk",
          PF.signTex(
            "wh_chalk",
            [
              "TONIGHT",
              "RADIUM RHYTHM KINGS",
              "cover: 5 scrip",
              "NO GUNS ON THE FLOOR",
            ],
            "enamel",
            256,
            320,
            { bg: "#1e2a22", fg: "#e8e8d8" },
          ),
          {},
        );
        b.quad(ck, cx, 0.72, cz + 0.22, 0.72, 0.9, {
          ry: 0,
          rx: -0.15,
          grime: 0.3,
        });
      }
      // gig posters on the rusticated base
      const posters = [
        ["p1", "THE RADIUM|RHYTHM KINGS", "DANCING NIGHTLY", "#1c2a4a"],
        ["p2", "LULU|MONROE", "THE CANARY OF 11th ST", "#4a1c2a"],
        ["p3", "SWING|NIGHT", "EVERY SATURDAY", "#2a3a1c"],
        ["p4", "ATOMIC|JAMBOREE", "MAR 5 1967 — CANCELLED", "#3a2a1a"],
      ];
      posters.forEach(([k, t, s, bg], i) => {
        const pk = PF.texMat("wh_" + k, PF.posterTex(k, t, s, bg), {
          rough: 0.9,
        });
        for (const x of [HX0 + 3 + i * 1.3, HX1 - 3 - i * 1.3])
          b.quad(pk, x, 2.2 + (i % 2) * 0.1, zf + 0.14, 1.0, 1.5, {
            ry: 0,
            rz: (i - 1.5) * 0.04,
            grime: 0.3,
          });
      });
      // string lights from the marquee to the scrap walls
      PF.dress.stringLights(
        b,
        V3(xc - 9, 5.0, zf + 4.2),
        V3(HX0 + 1, 3.0, zf + 5.5),
        0.8,
        14,
        0xffd090,
      );
      PF.dress.stringLights(
        b,
        V3(xc + 9, 5.0, zf + 4.2),
        V3(HX1 - 1, 3.0, zf + 5.5),
        0.8,
        14,
        0xffd090,
      );
      anchors.guard = PF.anchor(xc + 1.6, 0, zf + 5.2, 0);
      anchors.guard2 = PF.anchor(xc - 6, 0, zf + 4.6, 0.3);

      // ---------------- flanking tenements ----------------
      // east: 3-storey walk-up with fire escape
      {
        const x0 = HX1,
          x1 = WH.X1,
          h = 12;
        b.boxMM("brick_brown", x0, 0, Z0 + 1, x1, h, zf - 0.4, {
          segLen: 4,
          grime: 0.6,
        });
        PF.colMM(x0, 0, Z0 + 1, x1, h, zf - 0.4, { walkable: true });
        for (let f = 0; f < 3; f++)
          for (const x of [x0 + 2, x0 + 5.5])
            PF.segWindow(
              b,
              x,
              1.2 + f * 3.8,
              zf - 0.34,
              0,
              1.3,
              1.9,
              ((x + f) | 0) % 3 < 1 ? "glass_broken" : "planks",
            );
        b.boxMM(
          "terra",
          x0 - 0.1,
          h - 0.4,
          zf - 0.4,
          x1 + 0.1,
          h + 0.3,
          zf + 0.1,
          { seg: false },
        );
        for (let f = 1; f < 3; f++) {
          b.boxMM(
            "steel_win",
            x0 + 0.8,
            1.2 + f * 3.8 - 0.15,
            zf - 0.4,
            x1 - 0.8,
            1.2 + f * 3.8 - 0.05,
            zf + 0.9,
            { seg: false },
          );
          PF.rail(
            b,
            x0 + 0.8,
            zf + 0.9,
            x1 - 0.8,
            zf + 0.9,
            1.2 + f * 3.8 - 0.05,
            { key: "steel_win", noCollide: true, h: 0.9 },
          );
        }
        const store = PF.texMat(
          "wh_store",
          PF.signTex("wh_store", ["CAFE BOHEMIA"], "enamel", 512, 96, {
            bg: "#2a4a3a",
          }),
          {},
        );
        b.quad(store, (x0 + x1) / 2, 3.4, zf - 0.33, 6, 0.9, {
          ry: 0,
          grime: 0.3,
        });
      }
      // west: collapsed tenement — two floors standing at the back, rubble cone at the front
      {
        const x0 = WH.X0,
          x1 = HX0;
        b.boxMM("brick_brown", x0, 0, Z0 + 1, x1, 9, Z0 + 12, {
          segLen: 4,
          grime: 0.7,
        });
        b.boxMM("brick_brown", x0, 0, Z0 + 12, x0 + 0.5, 6.5, zf - 2, {
          segLen: 4,
          grime: 0.7,
        });
        PF.colMM(x0, 0, Z0 + 1, x1, 9, Z0 + 12, { walkable: true });
        PF.colMM(x0, 0, Z0 + 12, x0 + 0.5, 6.5, zf - 2, { walkable: false });
        // exposed floor slabs hanging
        b.box("planks", (x0 + x1) / 2, 3.6, Z0 + 14, 7.4, 0.25, 4, {
          rx: 0.35,
          seg: false,
        });
        b.box("planks", (x0 + x1) / 2 - 1, 7.0, Z0 + 13.2, 6.5, 0.25, 2.6, {
          rx: -0.2,
          seg: false,
        });
        // exposed wallpaper on Webster Hall's party wall
        b.boxMM("wallpaper_g", HX0 - 0.05, 0.5, Z0 + 12, HX0, 8.5, zf - 3, {
          seg: false,
        });
        const rR = PF.rng("wh_rubble");
        b.rock("rubble", (x0 + x1) / 2, -1.2, zf - 6, 4.2, {
          flat: 0.55,
          rough: 0.5,
          seed: 11,
        });
        for (let i = 0; i < 16; i++)
          b.rock(
            rR() < 0.5 ? "brick_brown" : "rubble",
            x0 + rR() * 8,
            0,
            Z0 + 12 + rR() * 17,
            0.3 + rR() * 0.6,
            { flat: 0.6, detail: 0, seed: 20 + i },
          );
        for (let i = 0; i < 6; i++)
          b.beam(
            "planks",
            V3(x0 + 1 + rR() * 6, 0.2, zf - 8 + rR() * 6),
            V3(x0 + 1 + rR() * 6, 1.5 + rR() * 2, zf - 10 + rR() * 6),
            0.2,
            0.08,
            {},
          );
        PF.col((x0 + x1) / 2, zf - 6, 7, 8, 0, 1.4, 0, { surface: "rubble" });
      }
      b.build(root);
      PF.flushGlows(root);
      PF.flushFires();
      WH.anchors = anchors;
    },
    30,
  );
