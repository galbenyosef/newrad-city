// play-inline-117 03 — boxmm
// Lines 19-599 of readable/play-inline-117.pretty.js (statement-aligned).
  K.defineInterior("times_square:rad_room", function (ctx) {
    const { rec, P, RR, PI } = ctx;
    // ---- THE RAD ROOM (walk-in ground floor of B1 west): lounge bar, stage with the singer's mic, tables, jukebox ----
    // Everything inside is built with lamp-lit twins of the base materials (albedo × vertex colour emissive lift,
    // K.litTwin) in its own builder that is LOD-culled 60 m from the room, so it costs nothing from the street.
    {
      const X0 = RR.x0 + 0.5,
        X1 = RR.x1 - 0.5,
        Z0 = RR.z0 + 0.5,
        Z1 = RR.z1 - 0.5,
        H = RR.GF - 0.2;
      const WARM = 0xffb070;
      K.litTwin("wood", "rr_wood", WARM, 0.34);
      K.litTwin("wood_rotten", "rr_wood_rotten", WARM, 0.3);
      K.litTwin("metal", "rr_metal", WARM, 0.28);
      K.litTwin("metal_dark", "rr_metal_dark", WARM, 0.4);
      K.litTwin("fabric", "rr_fabric", WARM, 0.36);
      K.litTwin("brass_base", "rr_brass", 0xffc880, 0.5);
      K.litTwin("steel", "rr_steel", WARM, 0.3);
      K.litTwin("plaster_base", "rr_plaster", WARM, 0.25);
      const rr = K.builder("ts_rr", {
        grime: 0.35,
        remap: {
          wood: "rr_wood",
          wood_rotten: "rr_wood_rotten",
          metal: "rr_metal",
          metal_dark: "rr_metal_dark",
          fabric: "rr_fabric",
          brass_base: "rr_brass",
          steel: "rr_steel",
          plaster_base: "rr_plaster",
        },
      });
      const iglow = K.glowSet("ts_radroom"),
        ispill = K.spillSet("ts_radroom");
      // lounge surfaces carry a little baked lamp-light (emissive maps) so the room reads at night like a warm old-world lounge
      if (!K.MATDEF.rr_wall) {
        const tex = (w, h, draw) => {
          const c = K.canvas(w, h),
            x = c.getContext("2d");
          draw(x, w, h);
          return K.texFromCanvas(c);
        };
        const wall = tex(256, 256, (x, W, H2) => {
          x.fillStyle = "#5a2420";
          x.fillRect(0, 0, W, H2);
          x.fillStyle = "rgba(150,70,50,0.35)"; // damask diamonds
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
              const cx = i * 64 + (j % 2) * 32 + 16,
                cy = j * 64 + 32;
              x.beginPath();
              x.moveTo(cx, cy - 22);
              x.lineTo(cx + 12, cy);
              x.lineTo(cx, cy + 22);
              x.lineTo(cx - 12, cy);
              x.fill();
              x.beginPath();
              x.arc(cx, cy, 4, 0, 7);
              x.fill();
            }
          K.stains(x, W, H2, 8, 811, 0.5);
          K.grain(x, W, H2, 18, 812);
        });
        const floor = tex(256, 256, (x, W, H2) => {
          for (let i = 0; i < 8; i++)
            for (let j = 0; j < 8; j++) {
              x.fillStyle = (i + j) % 2 ? "#1c1a18" : "#b8ab90";
              x.fillRect(i * 32, j * 32, 32, 32);
            }
          K.stains(x, W, H2, 14, 813, 0.6);
          K.grain(x, W, H2, 26, 814);
        });
        const ceil = tex(128, 128, (x, W, H2) => {
          x.fillStyle = "#3a3430";
          x.fillRect(0, 0, W, H2);
          x.strokeStyle = "rgba(200,180,140,0.25)";
          x.lineWidth = 3;
          for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++) {
              x.strokeRect(i * 32 + 4, j * 32 + 4, 24, 24);
              x.beginPath();
              x.arc(i * 32 + 16, j * 32 + 16, 6, 0, 7);
              x.stroke();
            }
          K.stains(x, W, H2, 6, 815, 0.5);
        });
        // stage curtain: deep red velvet folds, washed warm from the footlights (bright at the hem, dark at the top)
        const curtain = tex(256, 256, (x, W, H2) => {
          for (let i = 0; i < W; i++) {
            const f =
              0.5 +
              0.5 *
                Math.sin((i / W) * Math.PI * 2 * 9 + Math.sin(i * 0.05) * 0.6);
            const r = Math.round(70 + 90 * f),
              g = Math.round(10 + 16 * f),
              bl = Math.round(12 + 14 * f);
            x.fillStyle = "rgb(" + r + "," + g + "," + bl + ")";
            x.fillRect(i, 0, 1, H2);
          }
          const gr = x.createLinearGradient(0, 0, 0, H2);
          gr.addColorStop(0, "rgba(0,0,0,0.6)");
          gr.addColorStop(0.55, "rgba(0,0,0,0.1)");
          gr.addColorStop(1, "rgba(255,190,110,0.35)");
          x.fillStyle = gr;
          x.fillRect(0, 0, W, H2);
          K.stains(x, W, H2, 6, 816, 0.35);
          K.grain(x, W, H2, 14, 817);
        });
        K.defineMat("rr_wall", {
          color: 0xffffff,
          map: wall,
          emissiveMap: wall,
          emissiveColor: 0xffb890,
          emissiveIntensity: 0.32,
          rough: 0.8,
          custom: true,
          tile: [2.4, 2.4],
        });
        K.defineMat("rr_floor", {
          color: 0xffffff,
          map: floor,
          emissiveMap: floor,
          emissiveColor: 0xffc8a0,
          emissiveIntensity: 0.16,
          rough: 0.35,
          custom: true,
          tile: [2.4, 2.4],
        });
        K.defineMat("rr_ceiling", {
          color: 0xffffff,
          map: ceil,
          emissiveMap: ceil,
          emissiveColor: 0xffc890,
          emissiveIntensity: 0.25,
          rough: 0.6,
          custom: true,
          tile: [1.6, 1.6],
        });
        K.defineMat("rr_curtain", {
          color: 0xffffff,
          map: curtain,
          emissiveMap: curtain,
          emissiveColor: 0xffd0a0,
          emissiveIntensity: 0.75,
          rough: 0.95,
          custom: true,
          tile: [9, 4.4],
          side: THREE.DoubleSide,
        });
      }
      rr.boxMM("rr_floor", X0, 0, Z0, X1, 0.03, Z1, { faces: "t", grime: 0.4 });
      rr.boxMM("rr_ceiling", X0, H, Z0, X1, H + 0.2, Z1, {
        faces: "b",
        grime: 0.3,
      });
      // lining: damask over a wood dado with a brass rail and a picture rail (door gap in the west wall)
      const line = (x0, z0, x1, z1, f) => {
        rr.boxMM("rr_wall", x0, 1.1, z0, x1, H, z1, { faces: f, grime: 0.35 });
        rr.boxMM("wood_dark", x0, 0, z0, x1, 1.1, z1, { faces: f, grime: 0.5 });
        rr.boxMM("brass", x0, 1.08, z0, x1, 1.16, z1, { faces: f });
        rr.boxMM("wood_dark", x0, H - 0.35, z0, x1, H - 0.25, z1, { faces: f });
      };
      line(X0, Z0, X0 + 0.04, RR.door - 1.25, "e");
      line(X0, RR.door + 1.25, X0 + 0.04, Z1, "e");
      rr.boxMM(
        "rr_wall",
        X0,
        3.1,
        RR.door - 1.25,
        X0 + 0.04,
        H,
        RR.door + 1.25,
        { faces: "e" },
      );
      line(X1 - 0.04, Z0, X1, Z1, "w");
      line(X0, Z0, X1, Z0 + 0.04, "s");
      line(X0, Z1 - 0.04, X1, Z1, "n");
      // wall sconces (brass cups, warm up-wash)
      for (const sc of [
        [X0 + 0.1, -305.5, "e"],
        [X0 + 0.1, -289.0, "e"],
        [-17.5, Z1 - 0.1, "n"],
        [-12.5, Z1 - 0.1, "n"],
        [-17.2, Z0 + 0.1, "s"],
        [-12.4, Z0 + 0.1, "s"],
      ]) {
        const nx = sc[2] === "e" ? 1 : 0,
          nz = sc[2] === "n" ? -1 : sc[2] === "s" ? 1 : 0;
        if (sc[2] === "s" && sc[0] < -10.8) {
          /* above the stage: the curtain hangs there */
        }
        rr.cyl(
          "brass",
          sc[0] + nx * 0.12,
          2.55,
          sc[1] + nz * 0.12,
          0.09,
          0.16,
          0.22,
          8,
          {},
        );
        rr.geo("lit_warm", K.T.sphereLo, {
          x: sc[0] + nx * 0.12,
          y: 2.82,
          z: sc[1] + nz * 0.12,
          s: 0.1,
          tint: 0xffd9a0,
        });
        iglow.add(sc[0] + nx * 0.25, 2.85, sc[1] + nz * 0.25, 0xffc080, "m");
      }
      // ---- the bar: panelled counter with a zinc top, brass nosing + foot rail, stools; back bar with a backlit bottle wall ----
      const BZ0 = -305.5,
        BZ1 = -289.5,
        BX = -9.8;
      rr.boxMM("wood_dark", BX, 0.12, BZ0, -8.9, 1.1, BZ1, { grime: 0.35 });
      rr.boxMM("black_metal", BX + 0.08, 0, BZ0, -8.9, 0.12, BZ1, {}); // recessed kick
      rr.boxMM("wood_dark", BX, 0.12, BZ1, -5.0, 1.1, -288.7, { grime: 0.35 }); // return to the wall
      for (let z = BZ0 + 0.8; z < BZ1 - 0.3; z += 1.6) {
        rr.boxMM("wood", BX - 0.05, 0.2, z - 0.62, BX, 0.95, z + 0.62, {
          tint: 0x7a5238,
          grime: 0.3,
        });
        rr.boxMM("brass", BX - 0.07, 0.16, z + 0.74, BX, 1.0, z + 0.8, {});
      }
      rr.boxMM("metal", BX - 0.15, 1.1, BZ0 - 0.1, -8.75, 1.15, BZ1 + 0.1, {
        tint: 0xb8b0a0,
        grime: 0.15,
      }); // zinc top
      rr.boxMM("metal", BX - 0.15, 1.1, BZ1 - 0.1, -4.9, 1.15, -288.6, {
        tint: 0xb8b0a0,
        grime: 0.15,
      });
      rr.beam(
        "brass",
        BX - 0.15,
        1.13,
        BZ0 - 0.1,
        BX - 0.15,
        1.13,
        BZ1 + 0.1,
        0.035,
        { round: 6 },
      ); // nosing
      rr.beam(
        "brass",
        BX - 0.3,
        0.22,
        BZ0 + 0.2,
        BX - 0.3,
        0.22,
        BZ1 - 0.2,
        0.03,
        { round: 6 },
      ); // foot rail
      for (let z = BZ0 + 0.6; z < BZ1; z += 2.4)
        rr.beam("brass", BX - 0.3, 0.22, z, BX, 0.3, z, 0.018);
      rr.box(
        "lit_warm",
        BX - 0.12,
        1.02,
        (BZ0 + BZ1) / 2,
        0.03,
        0.03,
        BZ1 - BZ0 - 0.4,
        { tint: 0xa06030 },
      ); // under-nosing glow strip
      K.colBox(BX, 0, BZ0, -8.9, 1.15, BZ1, { surface: "wood" });
      K.colBox(BX, 0, BZ1, -5.0, 1.15, -288.7, { surface: "wood" });
      for (let z = BZ0 + 0.9; z <= BZ1 - 0.4; z += 1.8) {
        rr.cyl("chrome", -10.6, 0, z, 0.2, 0.2, 0.03, 10, {});
        rr.cyl("chrome", -10.6, 0, z, 0.045, 0.045, 0.74, 6, {});
        rr.cyl("carpet", -10.6, 0.74, z, 0.23, 0.22, 0.1, 12, {
          tint: 0xd04040,
        });
        rr.cyl("chrome", -10.6, 0.3, z, 0.17, 0.17, 0.02, 10, { top: false });
      }
      for (let z = BZ0 + 1; z < BZ1; z += 2.2)
        ispill.add(-10.4, z, 0xffa860, 1.5, { y: 0.05, i: 0.32 });
      // pendants over the counter (green enamel shades) pooling light on the zinc and the floor either side
      for (const z of [-303.2, -299.2, -295.2, -291.4]) {
        rr.beam("black_metal", -9.35, H, z, -9.35, 2.7, z, 0.012);
        rr.cyl("paint_green", -9.35, 2.45, z, 0.32, 0.08, 0.26, 10, {
          top: true,
          bottom: false,
        });
        rr.geo("lit_warm", K.T.sphereLo, { x: -9.35, y: 2.42, z, s: 0.12 });
        iglow.add(-9.35, 2.36, z, 0xffc070, "m");
        ispill.add(-9.35, z, 0xffb060, 1.4, { y: 1.17, i: 0.55 });
        ispill.add(-9.9, z, 0xffb060, 2.4, { y: 0.05, i: 0.3 });
      }
      // back bar: cabinet, three shelves over a backlit amber panel, bottles glowing against it, a smoky mirror
      const BB = X1 - 0.75;
      rr.boxMM("wood_dark", BB, 0, -305, X1, 1.0, -291, { grime: 0.4 });
      rr.boxMM("metal", BB - 0.05, 1.0, -305.05, X1, 1.04, -290.95, {
        tint: 0xb8b0a0,
      });
      rr.boxMM("lit_warm", X1 - 0.08, 1.1, -304.8, X1 - 0.04, 2.95, -291.2, {
        faces: "w",
        tint: 0x6a3e1c,
      }); // backlight
      for (const y of [1.3, 1.9, 2.5]) {
        rr.boxMM(
          "wood_dark",
          X1 - 0.5,
          y - 0.05,
          -304.9,
          X1 - 0.04,
          y,
          -291.1,
          {},
        );
        rr.boxMM(
          "brass",
          X1 - 0.52,
          y - 0.05,
          -304.9,
          X1 - 0.49,
          y + 0.02,
          -291.1,
          {},
        );
      }
      for (const z of [-305, -298, -291])
        rr.boxMM("wood_dark", X1 - 0.55, 1.0, z - 0.08, X1, 3.05, z + 0.08, {});
      rr.boxMM("wood_dark", X1 - 0.6, 2.95, -305.1, X1, 3.1, -290.9, {});
      const BOT = [
        0xc06a1a, 0x3a8a3a, 0xd8d0b0, 0x9a2a1a, 0x3a5ab0, 0xb08a2a, 0x6aa06a,
      ];
      for (let s = 0; s < 3; s++)
        for (let k = 0; k < 22; k++) {
          const z = -304.5 + k * 0.62 + (s % 2) * 0.2;
          if (z > -291.3 || (k * 7 + s * 3) % 9 === 0) continue;
          const h = 0.24 + ((k + s) % 3) * 0.06,
            y0 = 1.3 + s * 0.6;
          rr.cyl("lit_warm", X1 - 0.28, y0, z, 0.045, 0.05, h, 6, {
            tint: BOT[(k + s * 2) % BOT.length],
          });
          rr.cyl("lit_warm", X1 - 0.28, y0 + h, z, 0.02, 0.045, 0.1, 6, {
            tint: BOT[(k + s * 2) % BOT.length],
          });
        }
      for (let z = -304; z < -291; z += 3)
        iglow.add(X1 - 0.3, 2.1, z, 0xffa850, "m");
      ispill.add(X1 - 1.2, -298, 0xffa050, 3.2, {
        y: 0.05,
        i: 0.4,
        sx: 2.0,
        sz: 13,
      });
      K.colBox(BB, 0, -305, X1, 3.1, -291, { surface: "wood" });
      rr.panel("glass", X1 - 0.05, 3.6, -298, 13, 1.0, -PI / 2, { grime: 0.7 });
      rr.panel("atlas_neon", X1 - 0.1, 3.7, -298, 5.0, 0.84, -PI / 2, {
        rect: K.atlases.neon.slots.ts_radroom.rect,
      });
      iglow.add(X1 - 0.6, 3.7, -298, 0x6ac8ff, "l");
      // cash register, taps, glasses on the counter
      rr.boxMM("metal_dark", -9.6, 1.15, -304.9, -9.05, 1.5, -304.2, {
        tint: 0x6a6a5a,
      });
      rr.boxMM("brass", -9.62, 1.3, -304.95, -9.1, 1.52, -304.6, {});
      for (let k = 0; k < 4; k++)
        rr.cyl(
          "chrome",
          -9.2,
          1.15,
          -296.8 + k * 0.28,
          0.03,
          0.03,
          0.42,
          6,
          {},
        );
      for (let k = 0; k < 9; k++)
        rr.cyl(
          "lit_warm",
          -9.5 + (k % 2) * 0.25,
          1.15,
          -302.5 + k * 1.3,
          0.04,
          0.035,
          0.11,
          6,
          { tint: k % 3 ? 0x8a7a50 : 0xb06a1a },
        );
      // ---- the stage (north end): boards, lit red curtain + valance, standing mic in a spot, upright piano, footlights ----
      rr.boxMM("wood", X0, 0, Z0, -10.8, 0.5, -307.2, { grime: 0.45 });
      K.colBox(X0, 0, Z0, -10.8, 0.5, -307.2, { surface: "wood" });
      rr.boxMM("black_metal", X0, 0, -307.3, -10.8, 0.5, -307.2, {
        faces: "s",
      });
      rr.boxMM("brass", X0, 0.47, -307.34, -10.8, 0.52, -307.2, {});
      rr.boxMM("rr_curtain", X0, 0.5, Z0 + 0.02, -10.8, H, Z0 + 0.1, {
        faces: "s",
        grime: 0,
      });
      for (let k = 0; k < 10; k++)
        rr.geo("rr_curtain", K.T.cyl6 || K.T.box, {
          x: X0 + 0.35 + k * 0.92,
          y: 0.5 + (H - 0.5) / 2,
          z: Z0 + 0.2,
          sx: 0.14,
          sy: H - 0.5,
          sz: 0.14,
          grime: 0,
        });
      rr.boxMM("carpet", X0, H - 0.75, Z0 + 0.1, -10.8, H, Z0 + 0.4, {
        tint: 0x9a2020,
        grime: 0.2,
      }); // valance
      rr.boxMM("gold", X0, H - 0.82, Z0 + 0.38, -10.8, H - 0.74, Z0 + 0.44, {}); // fringe
      for (const sx of [X0 + 0.3, -11.3])
        rr.boxMM(
          "carpet",
          sx - 0.3,
          0.5,
          Z0 + 0.1,
          sx + 0.3,
          H - 0.7,
          Z0 + 0.9,
          { tint: 0x6a1010, grime: 0.2 },
        ); // legs
      rr.beam("black_metal", -15.2, 0.5, -309.2, -15.2, 2.0, -309.2, 0.02);
      rr.cyl("black_metal", -15.2, 0.5, -309.2, 0.18, 0.2, 0.03, 8, {});
      rr.geo("chrome", K.T.sphereLo, { x: -15.2, y: 2.05, z: -309.2, s: 0.07 });
      rr.boxMM("black_metal", -18.9, 0.5, -310.9, -17.4, 1.8, -310.2, {
        grime: 0.3,
      });
      rr.boxMM("paint_white", -18.85, 1.2, -310.25, -17.45, 1.26, -310.1, {});
      rr.boxMM("black_metal", -18.9, 1.26, -310.25, -17.4, 1.3, -310.0, {});
      rr.boxMM("black_metal", -18.5, 0.5, -309.9, -17.8, 0.95, -309.5, {}); // lid lip + bench
      rr.cyl("lit_warm", -18.7, 1.8, -310.5, 0.05, 0.05, 0.12, 6, {
        tint: 0xffa040,
      });
      iglow.add(-18.7, 1.95, -310.5, 0xffa040, "s"); // candle on the piano
      for (let k = 0; k < 8; k++) {
        const x = X0 + 0.5 + k * 1.1;
        rr.box("black_metal", x, 0.5, -307.1, 0.28, 0.1, 0.16, {});
        rr.geo("lit_warm", K.T.sphereLo, {
          x,
          y: 0.63,
          z: -307.12,
          s: 0.07,
          tint: 0xffb070,
        });
        if (k % 2 === 0) iglow.add(x, 0.66, -307.3, 0xffb070, "s");
      }
      ispill.add((X0 - 10.8) / 2, Z0 + 1.0, 0xffa060, 5.0, {
        y: 0.55,
        i: 0.5,
        sx: 8.5,
        sz: 2.4,
      }); // footlight wash on the boards
      rr.beam("black_metal", -15.2, H, -306.4, -15.2, H - 0.45, -306.4, 0.02);
      rr.cyl("black_metal", -15.2, H - 0.8, -306.4, 0.16, 0.24, 0.4, 8, {
        top: true,
      }); // spot can
      iglow.add(-15.2, H - 0.85, -306.4, 0xffe0b0, "l");
      ispill.add(-15.2, -309.2, 0xffe0b0, 2.4, { y: 0.55, i: 0.7 });
      rec.anchor("singer", -15.2, 0.5, -309.8, 0);
      rec.anchor("stage_bar", -15.2, 0.5, -309.8, 0);
      // tables with candle jars under pendant lamps (aisle from the door to the bar kept clear at z -295..-291)
      for (const t of [
        [-16.6, -302.8],
        [-13.0, -302.8],
        [-16.6, -298.4],
        [-13.0, -298.4],
        [-16.6, -288.2],
        [-13.0, -286.0],
      ]) {
        P.table(rr, t[0], 0, t[1], 0.2, { w: 1.1, d: 1.1 });
        rr.box("carpet", t[0], 0.77, t[1], 1.18, 0.012, 1.18, {
          yaw: 0.2 + 0.785,
          tint: 0xe0d8c0,
          grime: 0.3,
        }); // tablecloth (diamond)
        P.chair(rr, t[0] - 1.0, 0, t[1], PI / 2);
        P.chair(rr, t[0] + 1.0, 0, t[1], -PI / 2, { fallen: t[1] === -286.0 });
        rr.cyl("lit_warm", t[0], 0.78, t[1], 0.05, 0.045, 0.1, 6, {
          tint: 0xff9a40,
        });
        rr.beam("black_metal", t[0], H, t[1], t[0], 2.85, t[1], 0.012);
        rr.cyl("paint_red", t[0], 2.62, t[1], 0.3, 0.1, 0.24, 10, {
          top: true,
        });
        rr.geo("lit_warm", K.T.sphereLo, {
          x: t[0],
          y: 2.62,
          z: t[1],
          s: 0.1,
          tint: 0xffc890,
        });
        iglow.add(t[0], 2.55, t[1], 0xffc890, "s");
        iglow.add(t[0], 0.95, t[1], 0xff9a40, "s");
        ispill.add(t[0], t[1], 0xffb070, 1.5, { y: 0.8, i: 0.5 });
        ispill.add(t[0], t[1], 0xffb070, 2.4, { y: 0.05, i: 0.36 });
      }
      // jukebox (SE corner): lit arch, bubble tubes, a warm pool
      rr.boxMM("wood_dark", -7.0, 0, Z1 - 0.8, -5.9, 1.55, Z1 - 0.15, {
        grime: 0.3,
      });
      rr.panel("lit_warm", -6.45, 1.05, Z1 - 0.82, 0.9, 0.7, PI, {
        tint: 0xffa040,
      });
      rr.geo("lit_warm", K.T.cyl12, {
        x: -6.45,
        y: 1.55,
        z: Z1 - 0.48,
        rx: PI / 2,
        sx: 0.55,
        sy: 0.6,
        sz: 0.55,
        tint: 0xff7a40,
      });
      for (const s of [-1, 1])
        rr.cyl(
          "lit_warm",
          -6.45 + s * 0.47,
          0.2,
          Z1 - 0.82,
          0.04,
          0.04,
          1.3,
          6,
          { tint: s < 0 ? 0xff50a0 : 0x50c0ff },
        );
      K.colBox(-7.0, 0, Z1 - 0.8, -5.9, 1.55, Z1 - 0.15, {});
      iglow.add(-6.45, 1.2, Z1 - 1.2, 0xffa040, "m");
      ispill.add(-6.45, Z1 - 1.8, 0xff9040, 2.4, { y: 0.05, i: 0.55 });
      const nk = K.atlases.neon.slots.ts_fizzo;
      rr.panel(
        "atlas_neon",
        X0 + 0.07,
        3.2,
        -300.6,
        3.6,
        (3.6 * nk.h) / nk.w,
        PI / 2,
        { rect: nk.rect },
      );
      iglow.add(X0 + 0.6, 3.2, -300.6, 0xff3030, "m");
      ispill.add(X0 + 1.2, -300.6, 0xff3030, 2.2, { y: 0.05, i: 0.25 });
      // the Ruins' wear: a toppled stool, broken glass, empties, a sleeping drunk's bones by the jukebox
      rr.geo("chrome", K.T.box, {
        x: -11.6,
        y: 0.2,
        z: -293.3,
        rx: PI / 2,
        ry: 0.6,
        sx: 0.09,
        sy: 0.74,
        sz: 0.09,
      });
      for (let k = 0; k < 7; k++)
        rr.cyl(
          "lit_warm",
          -12.2 + k * 0.9,
          0.03,
          -291.8 - (k % 3) * 0.5,
          0.045,
          0.05,
          0.26,
          6,
          { tint: BOT[k % BOT.length] },
        );
      P.skeleton(rr, -8.2, 0.03, Z1 - 0.9, PI * 0.6);
      rec.anchor("bar", -7.3, 0, -297.5, -PI / 2);
      rec.anchor("bar_patron", -10.6, 0, -298.5, PI / 2);
      rec.anchor("lounge", -14.8, 0, -300.6, 0);
      rec.anchor("rad_room", -12, 0, -293.5, PI / 2);
      rr.finish(rec.root, { lod: 60, cast: false });
      iglow.finish(rec.root, {
        dayOpacity: 0.85,
        nightOpacity: 1,
        interior: true,
        lod: 60,
      });
      ispill.finish(rec.root, { day: 0.8, night: 1, lod: 60 });
    }
  });
