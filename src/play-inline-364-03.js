// play-inline-364 03 — hall
// Lines 46-2064 of readable/play-inline-364.pretty.js (statement-aligned).
  PF.addBuilder(
    "fortywall_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("fw_int");
      b.ground = VAULT;
      b.aoH = 2.4;
      const r = PF.rng("fw_int");

      const L = [];
      const light = (x, y, z, color, rad, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r: rad, i });
      for (const z of [-12, -4, 4])
        for (const x of [-13, 13])
          light(x * 0.95, HALL + 5, z, 0xc8d0c0, 11, 0.4); // windows (grimy)
      for (const [x, z] of [
        [-13, -8],
        [13, -8],
      ])
        light(x, HALL + 7, z, 0xff3020, 7, 0.45); // emergency strobes
      for (const [x, z] of [
        [-6, -9],
        [6, -9],
        [-6, -1],
        [6, -1],
      ])
        light(x, HALL + 6.5, z, 0xffc070, 10, 0.55); // chandeliers (emergency amber)
      light(0, HALL + 2.5, 5.5, 0xff4030, 6, 0.6); // alarm by the gate
      light(0, HALL + 2.6, -18, 0xd0d8c8, 7, 0.8); // vestibule daylight
      light(-10, HALL + 2.4, 7, 0x90c0a0, 7, 0.8); // security office monitors
      light(10, HALL + 2.4, 7, 0xffd090, 7, 0.8); // president's office
      light(0, HALL - 1, 7, 0xffe0b0, 7, 0.5); // stair hall
      light(0, VAULT + 3.2, 15, 0xe8f0ff, 11, 0.7);
      light(0, VAULT + 2.2, 18.8, 0xff3020, 5, 0.9); // antechamber (+ red alarm)
      for (const z of [24, 30]) light(0, VAULT + 3, z, 0xe8f0ff, 10, 0.6); // safe-deposit vault
      light(0, VAULT + 2.6, 35.6, 0xffe0b0, 7, 1.4);
      light(0, VAULT + 2.6, 38.4, 0xffe0b0, 7, 1.4);
      light(0, VAULT + 1.0, 36.8, 0xffc860, 5, 1.0); // director's vault (gold glow)
      light(-12.5, VAULT + 3.2, 23, 0xe8f0ff, 8, 0.9);
      light(-12.5, VAULT + 3.2, 28, 0xe8f0ff, 8, 0.8); // coin room (caged work lamps)
      light(-15, VAULT + 3.5, 16, 0xd8e0e8, 7, 0.5); // service stair
      b.setLights(L, 0x908a84, 0.12);

      const box = (k, x, y, z, w, h, d, o) =>
        b.box(k, X(x), y, Z(z), w, h, d, o);
      const bmm = (k, x0, y0, z0, x1, y1, z1, o) =>
        b.boxMM(k, X(x0), y0, Z(z0), X(x1), y1, Z(z1), o);
      const col = (x0, y0, z0, x1, y1, z1, o) =>
        PF.colMM(
          X(x0),
          y0,
          Z(z0),
          X(x1),
          y1,
          Z(z1),
          Object.assign({ walkable: false }, o || {}),
        );
      const solid = (k, x0, y0, z0, x1, y1, z1, o) => {
        bmm(k, x0, y0, z0, x1, y1, z1, o);
        col(x0, y0, z0, x1, y1, z1, {
          walkable: !!(o && o.walk),
          surface: (o && o.surface) || "concrete",
        });
      };
      const slab = (k, x0, z0, x1, z1, y, t, o) =>
        PF.slab(b, k, X(x0), Z(z0), X(x1), Z(z1), y, t, o);
      const wall = (k, axis, a0, a1, f0, f1, y0, y1, gaps, o) => {
        const off = axis === "x" ? OX : OZ,
          foff = axis === "x" ? OZ : OX;
        PF.wall(
          b,
          k,
          axis,
          a0 + off,
          a1 + off,
          f0 + foff,
          f1 + foff,
          y0,
          y1,
          (gaps || []).map((g) => ({ c: g.c + off, w: g.w, y0: g.y0, h: g.h })),
          o,
        );
      };
      const quad = (k, x, y, z, w, h, o) => b.quad(k, X(x), y, Z(z), w, h, o);
      const A = {};

      // =====================================================================
      // VESTIBULE + BANKING HALL (HALL level)
      // =====================================================================
      // everything at HALL level stands on a solid podium (the vault level is its own excavated box further south)
      solid("lime_ws", -16.5, VAULT, -20, 16.5, HALL - 0.35, 3, {
        seg: false,
        walk: true,
      });
      slab("fw_terrazzo", -4, -20, 4, -16, HALL, 0.35, {});
      slab("fw_terrazzo", -14, -16, 14, 3, HALL, 0.35, {});
      // vestibule
      wall("marble_soft", "z", -20, -16, -4.4, -4, HALL, HALL + 5, []);
      wall("marble_soft", "z", -20, -16, 4, 4.4, HALL, HALL + 5, []);
      wall("marble_soft", "x", -4.4, 4.4, -20.4, -20, HALL, HALL + 5, []);
      bmm("sp_white", -4, HALL + 4.8, -20, 4, HALL + 5, -16, {
        seg: false,
        noAO: true,
      });
      for (const sg of [-1, 1])
        bmm(
          "bronze_door",
          sg * 0.05,
          HALL,
          -19.98,
          sg * 1.5,
          HALL + 3.4,
          -19.9,
          { seg: false },
        );
      quad("sky_view", 0, HALL + 4.1, -19.92, 3.0, 1.2, {
        ry: 0,
        noAO: true,
        uvRect: PF.skyRect(r, 3.0, 1.2),
      });
      // turnstile-like brass rails and the "OPEN" sign still switched on
      for (const x of [-2.6, 2.6]) {
        bmm("brass_ws", x - 0.04, HALL, -17.2, x + 0.04, HALL + 1.0, -16.2, {
          seg: false,
        });
        col(x - 0.1, HALL, -17.2, x + 0.1, HALL + 1.0, -16.2);
      }
      const open = PF.texMat(
        "fw_open",
        PF.signTex(
          "fw_open",
          ["OPEN", "BANKING HOURS 9 — 3"],
          "neon",
          256,
          128,
          { fg: "#ff4a2a" },
        ),
        { emissive: 1.4 },
      );
      quad(open, 0, HALL + 3.9, -16.2, 1.6, 0.8, { ry: PI, grime: 0 });
      // hall shell
      wall("marble_soft", "x", -14, 14, -16.4, -16, HALL, HCEIL, [
        { c: 0, w: 8, y0: HALL, h: 5 },
      ]);
      wall("marble_soft", "z", -16, 3, -14.4, -14, HALL, HCEIL, []);
      wall("marble_soft", "z", -16, 3, 14, 14.4, HALL, HCEIL, []);
      // coffered ceiling + cornice
      PF.coffers(b, "sp_white", X(-14), Z(-16), X(14), Z(3), HCEIL, 2.4, {
        panel: "gold_leaf",
        beam: 0.4,
        depth: 0.6,
        rosette: "gilt",
      });
      bmm("lime_ws", -14, HCEIL - 1.2, -16, -13.6, HCEIL - 0.6, 3, {
        seg: false,
      });
      bmm("lime_ws", 13.6, HCEIL - 1.2, -16, 14, HCEIL - 0.6, 3, {
        seg: false,
      });
      // colossal pilasters + tall windows (daylight, some shattered, a few boarded) on the long walls
      for (const [xw, ry, sgn] of [
        [-14, HP, 1],
        [14, -HP, -1],
      ]) {
        for (let z = -14; z <= 2; z += 4) {
          bmm(
            "lime_ws",
            xw + (sgn > 0 ? 0 : -0.35),
            HALL,
            z - 0.45,
            xw + (sgn > 0 ? 0.35 : 0),
            HCEIL - 1.2,
            z + 0.45,
            { seg: false },
          );
          bmm(
            "bronze_door",
            xw + (sgn > 0 ? 0 : -0.45),
            HCEIL - 1.9,
            z - 0.55,
            xw + (sgn > 0 ? 0.45 : 0),
            HCEIL - 1.2,
            z + 0.55,
            { seg: false },
          );
        }
        for (let z = -12; z <= 0; z += 4) {
          const bk = r() < 0.2;
          quad(
            bk ? "planks" : "sky_view",
            xw + sgn * 0.03,
            HALL + 5.8,
            z,
            2.6,
            7.2,
            {
              ry,
              noAO: true,
              uvRect: bk ? undefined : PF.skyRect(r, 2.6, 7.2),
            },
          );
          for (let k = 1; k < 6; k++)
            box(
              "bronze_door",
              xw + sgn * 0.06,
              HALL + 2.2 + k * 1.2,
              z,
              0.05,
              0.06,
              2.6,
              { seg: false },
            );
          box("bronze_door", xw + sgn * 0.06, HALL + 2.2, z, 0.05, 7.2, 0.06, {
            seg: false,
          });
        }
      }
      // bronze chandeliers (lit on emergency power: amber)
      for (const [x, z] of [
        [-6, -9],
        [6, -9],
        [-6, -1],
        [6, -1],
      ]) {
        b.beam(
          "bronze_door",
          P(x, HCEIL - 0.6, z),
          P(x, HALL + 7.2, z),
          0.04,
          0.04,
          { noAO: true },
        );
        b.lathe(
          "bronze_door",
          [
            [0.05, 0],
            [1.1, 0.15],
            [1.2, 0.45],
            [0.8, 0.6],
            [0.1, 1.0],
          ],
          12,
          X(x),
          HALL + 6.2,
          Z(z),
          {},
        );
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * TAU;
          b.sphere(
            "lamp_ws",
            X(x + Math.cos(a) * 1.05),
            HALL + 6.6,
            Z(z + Math.sin(a) * 1.05),
            0.1,
            { ws: 6, hs: 4, noAO: true },
          );
        }
        PF.glow(P(x, HALL + 6.5, z), 0xffb060, 2.8, root, { intensity: 0.8 });
      }
      // check-writing desks (marble tops on bronze legs), deposit slips everywhere
      for (const [x, z] of [
        [-5, -10],
        [5, -10],
        [-5, -3],
        [5, -3],
      ]) {
        solid(
          "marble_ws",
          x - 1.6,
          HALL + 1.0,
          z - 0.5,
          x + 1.6,
          HALL + 1.12,
          z + 0.5,
          { seg: false },
        );
        for (const sx of [-1.3, 1.3])
          bmm(
            "bronze_door",
            x + sx - 0.08,
            HALL,
            z - 0.08,
            x + sx + 0.08,
            HALL + 1.0,
            z + 0.08,
            { seg: false },
          );
        col(x - 1.6, HALL, z - 0.5, x + 1.6, HALL + 1.12, z + 0.5);
        bmm(
          "brass_ws",
          x - 0.2,
          HALL + 1.12,
          z - 0.1,
          x + 0.2,
          HALL + 1.3,
          z + 0.1,
          { seg: false },
        );
      }
      D.papers(b, X(0), HALL, Z(-7), 8, 60, 301);
      // two more check desks by the windows; brass banker's lamps (green shades) on every desk
      for (const [x, z] of [
        [-10.5, -7],
        [10.5, -7],
      ]) {
        solid(
          "marble_ws",
          x - 1.6,
          HALL + 1.0,
          z - 0.5,
          x + 1.6,
          HALL + 1.12,
          z + 0.5,
          { seg: false },
        );
        for (const sx of [-1.3, 1.3])
          bmm(
            "bronze_door",
            x + sx - 0.08,
            HALL,
            z - 0.08,
            x + sx + 0.08,
            HALL + 1.0,
            z + 0.08,
            { seg: false },
          );
        col(x - 1.6, HALL, z - 0.5, x + 1.6, HALL + 1.12, z + 0.5);
      }
      for (const [x, z] of [
        [-5, -10],
        [5, -10],
        [-5, -3],
        [5, -3],
        [-10.5, -7],
        [10.5, -7],
      ]) {
        b.cyl("brass_ws", X(x + 0.9), HALL + 1.12, Z(z), 0.07, 0.08, 0.03, 8, {
          hSeg: 1,
        });
        b.cyl(
          "brass_ws",
          X(x + 0.9),
          HALL + 1.15,
          Z(z),
          0.012,
          0.012,
          0.32,
          5,
          { hSeg: 1 },
        );
        b.cyl(
          "paint_teal",
          X(x + 0.9),
          HALL + 1.47,
          Z(z),
          0.11,
          0.11,
          0.26,
          10,
          { hSeg: 1, rz: HP, thetaLen: PI, thetaStart: 0 },
        );
        for (let k = 0; k < 3; k++)
          b.box(
            "paper",
            X(x - 0.8 + k * 0.35),
            HALL + 1.125,
            Z(z + (r() - 0.5) * 0.4),
            0.2,
            0.004,
            0.28,
            { ry: r(), seg: false, noAO: true },
          );
      }
      // velvet waiting benches along the walls; chairs knocked flat; plaster & debris; a collapsed coffer
      for (const sx of [-1, 1]) {
        const x = sx * 12.9;
        bmm("mahog_ws", x - 0.35, HALL, -10.3, x + 0.35, HALL + 0.45, -7.7, {
          seg: false,
        });
        bmm(
          "velvet",
          x - 0.33,
          HALL + 0.45,
          -10.25,
          x + 0.33,
          HALL + 0.55,
          -7.75,
          { seg: false },
        );
        bmm(
          "mahog_ws",
          x + sx * 0.25,
          HALL + 0.45,
          -10.3,
          x + sx * 0.35,
          HALL + 1.1,
          -7.7,
          { seg: false },
        );
        col(x - 0.35, HALL, -10.3, x + 0.35, HALL + 1.1, -7.7);
      }
      for (const [x, z, ry] of [
        [-7.8, -11.8, 0.6],
        [3.2, -12.6, 2.2],
        [8.6, -4.4, -1.1],
        [-2.4, -2.8, 1.9],
      ])
        D.chair(b, X(x), HALL, Z(z), ry, true, "mahog_ws");
      for (const [x, z, rr, sd] of [
        [-9, -13, 1.2, 351],
        [11.2, -1.5, 0.6, 352],
        [-12.5, 0.5, 0.5, 353],
      ])
        D.rubble(b, X(x), HALL, Z(z), rr, 7, sd);
      {
        // part of the coffered ceiling came down: a black hole into the floor above, lath strips, a fallen coffer
        const hx = -9,
          hz = -13;
        const hs = new THREE.Shape();
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * TAU,
            rad = 1.6 + r() * 0.7;
          if (k === 0) hs.moveTo(Math.cos(a) * rad, Math.sin(a) * rad);
          else hs.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
        }
        hs.closePath();
        const hg = PF.shapeGeo(hs, 1);
        hg.rotateX(HP);
        b.add("glass_broken", hg, {
          m: PF.m4(X(hx), HCEIL - 0.62, Z(hz)),
          uv: "box",
          noAO: true,
          grime: 0,
        });
        for (let k = 0; k < 7; k++)
          b.box(
            "rotten",
            X(hx - 1.4 + k * 0.45),
            HCEIL - 0.8 - r() * 1.4,
            Z(hz + (r() - 0.5) * 2),
            0.05,
            0.8 + r() * 1.2,
            0.03,
            { rz: (r() - 0.5) * 0.6, seg: false, noAO: true },
          );
        b.box("sp_white", X(hx + 0.5), HALL, Z(hz + 0.6), 2.4, 0.5, 2.4, {
          ry: 0.4,
          rz: 0.2,
          seg: false,
          grime: 0.6,
        });
        b.box(
          "gold_leaf",
          X(hx + 0.5),
          HALL + 0.3,
          Z(hz + 0.6),
          1.9,
          0.12,
          1.9,
          { ry: 0.4, rz: 0.2, seg: false, grime: 0.5 },
        );
        PF.decal(b, 7, X(hx), HALL, Z(hz), 5.0, 5.0, 0, { floor: true });
      }
      // the robots' work: scorch marks, laser-pocked marble, spent casings from the looters' last stand
      for (const [x, z, s2] of [
        [-3, -12, 2.2],
        [6.5, -5.5, 1.8],
        [-6.5, -0.2, 1.6],
        [2.4, 0.9, 1.4],
      ])
        PF.decal(b, 4, X(x), HALL, Z(z), s2, s2, 0, { floor: true });
      for (const [x, y, z, ry, k] of [
        [-13.95, HALL + 2.4, -6.1, HP, 0],
        [13.95, HALL + 1.8, -9.8, -HP, 1],
        [-5.2, HALL + 2.2, -15.95, 0, 4],
        [7.0, HALL + 3.0, -15.95, 0, 0],
      ])
        PF.decal(b, k, X(x), y, Z(z), 1.8, 1.8, ry, { rz: r() * 3 });
      for (let k = 0; k < 26; k++)
        b.cyl(
          "brass_ws",
          X(-4 + r() * 8),
          HALL + 0.012,
          Z(-14 + r() * 5),
          0.01,
          0.01,
          0.05,
          4,
          { hSeg: 1, rz: HP, ry: r() * 3, noAO: true },
        );
      for (const [x, z] of [
        [-13.8, -8],
        [13.8, -8],
      ])
        PF.glow(P(x, HALL + 7, z), 0xff2a1a, 1.6, root, {
          intensity: 0.9,
          flicker: 0.6,
        });
      // the queue: brass stanchions & red velvet ropes zig-zagging to the teller line — and the customers who
      // are still waiting their turn (FO-style gag: nobody leaves the line)
      {
        const posts = [
          [-7.4, -1.0],
          [-2.4, -1.0],
          [2.4, -1.0],
          [7.4, -1.0],
          [-7.4, 0.6],
          [-2.4, 0.6],
          [2.4, 0.6],
          [7.4, 0.6],
        ];
        const tipped = new Set([5]);
        posts.forEach(([x, z], i) => {
          if (tipped.has(i)) {
            // knocked over: post on the floor, rope slack
            b.cyl(
              "brass_ws",
              X(x + 0.45),
              HALL + 0.08,
              Z(z),
              0.035,
              0.035,
              0.95,
              6,
              { hSeg: 1, rz: HP },
            );
            b.cyl("brass_ws", X(x), HALL + 0.1, Z(z), 0.16, 0.16, 0.05, 10, {
              hSeg: 1,
              rx: 0.4,
            });
            return;
          }
          b.cyl("brass_ws", X(x), HALL, Z(z), 0.18, 0.2, 0.05, 10, { hSeg: 1 });
          b.cyl("brass_ws", X(x), HALL + 0.05, Z(z), 0.03, 0.03, 0.9, 6, {
            hSeg: 1,
          });
          b.sphere("brass_ws", X(x), HALL + 0.98, Z(z), 0.06, { ws: 6, hs: 4 });
        });
        const rope = (a, c, sag) => {
          const m = P((a[0] + c[0]) / 2, HALL + 0.88 - sag, (a[1] + c[1]) / 2);
          b.beam("carpet_red", P(a[0], HALL + 0.9, a[1]), m, 0.03, 0.03, {
            noAO: true,
          });
          b.beam("carpet_red", m, P(c[0], HALL + 0.9, c[1]), 0.03, 0.03, {
            noAO: true,
          });
        };
        rope(posts[0], posts[1], 0.22);
        rope(posts[2], posts[3], 0.22);
        rope(posts[4], posts[5 - 0], 0.0);
        rope(posts[6], posts[7], 0.22);
        rope(posts[1], posts[2], 0.25);
        // slack rope from the tipped post
        b.beam(
          "carpet_red",
          P(-7.4, HALL + 0.9, 0.6),
          P(-4.8, HALL + 0.06, 0.9),
          0.03,
          0.03,
          { noAO: true },
        );
        b.beam(
          "carpet_red",
          P(-4.8, HALL + 0.06, 0.9),
          P(-2.0, HALL + 0.06, 0.5),
          0.03,
          0.03,
          { noAO: true },
        );
        // the patient customers: skeletons slumped along the ropes, a briefcase, a hat, a handbag, a deposit slip
        PF.skeleton(b, X(-6.2), HALL, Z(-0.2), 0.2);
        PF.skeleton(b, X(-3.6), HALL, Z(-0.1), -0.3);
        PF.skeleton(b, X(4.8), HALL, Z(-0.3), 2.9);
        box("mahog_ws", -5.5, HALL, 0.1, 0.45, 0.32, 0.12, {
          ry: 0.4,
          seg: false,
          c: 0x3a2418,
        }); // briefcase
        b.cyl("fabric", X(-3.1), HALL + 0.02, Z(0.3), 0.19, 0.2, 0.1, 10, {
          hSeg: 1,
          c: 0x2a2a2a,
        }); // fedora crown
        b.cyl("fabric", X(-3.1), HALL + 0.01, Z(0.3), 0.3, 0.3, 0.015, 12, {
          hSeg: 1,
          c: 0x2a2a2a,
        }); // brim
        box("carpet_red", 5.4, HALL, -0.6, 0.3, 0.22, 0.1, {
          ry: -0.7,
          seg: false,
        }); // handbag
        const slip = PF.texMat(
          "fw_qsign",
          PF.signTex(
            "fw_qsign",
            ["PLEASE WAIT", "TO BE CALLED"],
            "enamel",
            256,
            128,
            { bg: "#1a2a1a", fg: "#e0d0a0" },
          ),
          {},
        );
        b.cyl("brass_ws", X(-8.4), HALL, Z(-1.0), 0.2, 0.22, 0.05, 10, {
          hSeg: 1,
        });
        b.cyl("brass_ws", X(-8.4), HALL + 0.05, Z(-1.0), 0.03, 0.03, 1.35, 6, {
          hSeg: 1,
        });
        quad(slip, -8.4, HALL + 1.6, -1.04, 0.6, 0.3, { ry: PI, grime: 0.2 });
        quad(slip, -8.4, HALL + 1.6, -0.96, 0.6, 0.3, { ry: 0, grime: 0.2 });
      }
      // a chandelier that came down: the stub of chain above, the bronze wreck in a starburst of glass & plaster
      {
        const cx = 0,
          cz = -6.2;
        b.beam(
          "bronze_door",
          P(cx, HCEIL - 0.6, cz),
          P(cx + 0.1, HCEIL - 2.2, cz + 0.05),
          0.04,
          0.04,
          { noAO: true },
        );
        // the wreck lies canted on its side: crushed crown, central stem, the ring and its bent arms, candle cups
        const tilt = 0.5,
          ax = (a, d, h) =>
            P(
              cx + Math.cos(a) * d,
              HALL +
                0.25 +
                h * Math.cos(tilt) +
                Math.sin(a) * d * Math.sin(tilt) * 0.6,
              cz + Math.sin(a) * d * Math.cos(tilt),
            );
        b.beam(
          "brass_ws",
          P(cx, HALL + 0.1, cz),
          P(cx + 0.2, HALL + 1.1, cz - 0.5),
          0.07,
          0.07,
          {},
        );
        b.lathe(
          "brass_ws",
          [
            [0.02, 0],
            [0.34, 0.1],
            [0.4, 0.3],
            [0.2, 0.45],
            [0.02, 0.55],
          ],
          10,
          X(cx + 0.2),
          HALL + 0.95,
          Z(cz - 0.55),
          { rx: -0.9 },
        );
        let prev = null;
        for (let i = 0; i <= 16; i++) {
          const a = (i / 16) * TAU,
            p = ax(a, 1.15, 0);
          if (prev && i !== 5 && i !== 6)
            b.beam("brass_ws", prev, p, 0.045, 0.045, {}); // ring (one section torn away)
          prev = p;
          if (i % 2 === 0 && i < 16) {
            const bend = i === 4 ? 0.5 : i === 10 ? -0.4 : 0;
            b.beam(
              "brass_ws",
              P(cx, HALL + 0.3, cz),
              ax(a + bend * 0.2, 1.15, 0.05),
              0.03,
              0.03,
              {},
            );
            const cup = ax(a, 1.15, 0.12);
            b.cyl("brass_ws", cup.x, cup.y - 0.05, cup.z, 0.06, 0.04, 0.1, 6, {
              hSeg: 1,
            });
            if (i % 4 === 0)
              b.sphere("glass_broken", cup.x, cup.y + 0.1, cup.z, 0.08, {
                ws: 6,
                hs: 4,
                noAO: true,
              });
          }
        }
        // crystal drops strewn about (small bright prisms)
        for (let i = 0; i < 14; i++) {
          const a = r() * TAU,
            d = 0.4 + r() * 2.2;
          b.box(
            "chrome",
            X(cx + Math.cos(a) * d),
            HALL + 0.01,
            Z(cz + Math.sin(a) * d),
            0.05,
            0.1,
            0.05,
            { rz: HP, ry: r() * 3, seg: false, noAO: true },
          );
        }
        for (let i = 0; i < 26; i++) {
          const a = r() * TAU,
            d = 0.8 + r() * 2.6;
          b.box(
            r() < 0.6 ? "glass_broken" : "sp_white",
            X(cx + Math.cos(a) * d),
            HALL + 0.01,
            Z(cz + Math.sin(a) * d),
            0.05 + r() * 0.18,
            0.02,
            0.05 + r() * 0.14,
            { ry: r() * 3, seg: false, noAO: true },
          );
        }
        D.rubble(b, X(cx + 0.8), HALL, Z(cz - 0.9), 0.7, 5, 331);
        col(cx - 1.1, HALL, cz - 1.1, cx + 1.1, HALL + 0.9, cz + 1.1);
        PF.readable(
          P(cx, HALL + 0.6, cz + 1.3),
          "Fallen Chandelier",
          'Four hundred pounds of bronze and crystal, and under it, very flat, a Patrolman still wearing a "MAY I HELP YOU?" sash. It may not.',
        );
      }
      // the teller line: marble counter wall with brass cages, a gate in the middle
      {
        const zc = 2.0;
        for (const [x0, x1] of [
          [-14, -1.2],
          [1.2, 14],
        ]) {
          solid("marble_ws", x0, HALL, zc - 0.4, x1, HALL + 1.15, zc + 0.4, {
            seg: false,
          });
          bmm(
            "marble_ws",
            x0,
            HALL + 1.15,
            zc - 0.5,
            x1,
            HALL + 1.25,
            zc + 0.5,
            { seg: false },
          );
          for (let x = x0; x <= x1 + 0.01; x += 0.12)
            box("brass_ws", x, HALL + 1.25, zc, 0.02, 1.4, 0.02, {
              seg: false,
            });
          bmm(
            "brass_ws",
            x0,
            HALL + 2.62,
            zc - 0.05,
            x1,
            HALL + 2.72,
            zc + 0.05,
            { seg: false },
          );
          col(x0, HALL, zc - 0.3, x1, HALL + 2.7, zc + 0.3);
          for (let x = x0 + 1.6; x < x1 - 0.5; x += 3.2) {
            bmm(
              "glass_dark",
              x - 0.4,
              HALL + 1.3,
              zc - 0.03,
              x + 0.4,
              HALL + 1.9,
              zc + 0.03,
              { seg: false },
            );
            const n = PF.texMat(
              "fw_teller" + Math.round(x),
              PF.signTex(
                "fw_teller" + Math.round(x),
                ["TELLER " + (Math.round((x + 14) / 3.2) + 1)],
                "enamel",
                256,
                64,
                { bg: "#1a2a1a", fg: "#e0d0a0" },
              ),
              {},
            );
            quad(n, x, HALL + 2.35, zc - 0.07, 0.9, 0.22, {
              ry: PI,
              grime: 0.2,
            });
          }
        }
        // the gate (bronze, swung open, a dead guard behind)
        bmm("bronze_door", -1.2, HALL, zc - 0.05, -1.1, HALL + 2.7, zc + 0.05, {
          seg: false,
        });
        box("bronze_door", 0.2, HALL, zc + 0.9, 1.2, 1.8, 0.06, {
          ry: 1.1,
          seg: false,
        });
        PF.skeleton(b, X(2.5), HALL, Z(4.4), 1.3);
        b.box("red_alarm", X(0), HALL + 2.8, Z(zc + 0.1), 0.2, 0.2, 0.2, {
          seg: false,
          noAO: true,
        });
      }
      // back-office partition (z 3): walls at HALL level separating the security office, stair hall and the president's office
      wall("marble_soft", "x", -16.5, 16.5, 3, 3.3, HALL, HALL + 4.5, [
        { c: -9, w: 1.4, y0: HALL, h: 2.6 },
        { c: 0, w: 5.0, y0: HALL, h: 3.6 },
        { c: 9, w: 1.4, y0: HALL, h: 2.6 },
      ]);
      bmm("marble_soft", -14, HALL + 4.5, 3, 14, HCEIL, 3.3, { seg: false });
      // floors of the back offices (HALL level) — the stair hall is open down to the vault
      slab("tile_floor", -16.5, 3.3, -3, 11.7, HALL, 0.35, {});
      slab("tile_floor", -13.7, 11.7, -3, 12.5, HALL, 0.35, {});
      slab("parquet_ws", 3, 3.3, 16.5, 12.5, HALL, 0.35, {});
      slab("fw_terrazzo", -3, 3.3, 3, 4.0, HALL, 0.35, {});
      solid("lime_ws", -16.5, VAULT, 3.3, -3, HALL - 0.35, 11, { seg: false });
      solid("lime_ws", 3, VAULT, 3.3, 16.5, HALL - 0.35, 12.5, { seg: false });
      wall("marble_soft", "z", 3.3, 12.5, -3.3, -3, VAULT, HALL + 4.2, []);
      wall("marble_soft", "z", 3.3, 12.5, 3, 3.3, VAULT, HALL + 4.2, []);
      wall("marble_soft", "x", -16.5, 16.5, 12.5, 12.8, HALL, HALL + 4.2, [
        { c: -15, w: 2.0, y0: HALL, h: 2.6 },
      ]);
      wall("marble_soft", "z", 3.3, 12.5, -16.8, -16.5, HALL, HALL + 4.2, []);
      wall("marble_soft", "z", 3.3, 12.5, 16.5, 16.8, HALL, HALL + 4.2, []);
      bmm("sp_white", -16.5, HALL + 4.2, 3.3, 16.5, HALL + 4.4, 12.8, {
        seg: false,
        noAO: true,
      });

      // SECURITY OFFICE (x -16.5..-3.3): monitor wall, turret & vault control terminal, lockers, the service-stair door
      {
        for (let k = 0; k < 6; k++)
          D.monitor(
            b,
            X(-12.2 + k * 0.9),
            HALL + 1.0,
            Z(12.1),
            PI,
            k % 2 === 0,
          );
        solid("steel", -12.8, HALL, 11.2, -6.8, HALL + 1.0, 12.3, {
          seg: false,
        });
        D.chair(b, X(-10), HALL, Z(10.4), PI, false, "iron");
        for (let k = 0; k < 4; k++)
          bmm(
            "panel",
            -16.3,
            HALL,
            4.0 + k * 0.7,
            -15.8,
            HALL + 1.9,
            4.6 + k * 0.7,
            { seg: false },
          );
        col(-16.3, HALL, 4, -15.8, HALL + 1.9, 6.8);
        const sk = PF.texMat(
          "fw_sec",
          PF.signTex(
            "fw_sec",
            ["SECURITY", "AUTHORIZED PERSONNEL ONLY"],
            "enamel",
            512,
            128,
            { bg: "#7a1a14", fg: "#f0e0c0" },
          ),
          {},
        );
        quad(sk, -9, HALL + 3.0, 3.32, 1.6, 0.4, { ry: 0, grime: 0.2 });
        PF.skeleton(b, X(-11.5), HALL, Z(7.2), 0.4);
        D.papers(b, X(-11), HALL, Z(8), 1.5, 14, 311);
        PF.deskClutter(b, X(-8.0), HALL + 1.0, Z(11.75), PI, "sec", {
          typewriter: false,
        });
        b.box("panel", X(-6.0), HALL, Z(8.2), 1.35, 0.5, 0.6, {
          ry: 0.3,
          seg: false,
          grime: 0.6,
        }); // filing cabinet on its side
        D.papers(b, X(-6.0), HALL, Z(7.4), 1.0, 12, 312);
        PF.poster(b, 3, X(-3.35), HALL + 2.0, Z(6.0), 0.7, 1.4, -HP, 0.05);
        const ro = PF.texMat(
          "fw_roster",
          PF.signTex(
            "fw_roster",
            [
              "DUTY ROSTER — MAR 1967",
              "MON  PATROLMAN 2, 4",
              "TUE  PATROLMAN 1, 3",
              'WED  "COL. BURR" (again)',
              "THU  COL. BURR",
              "FRI  COL. BURR (insists)",
            ],
            "enamel",
            256,
            256,
            { bg: "#e8e0c8", fg: "#2a2a2a" },
          ),
          {},
        );
        quad(ro, -16.46, HALL + 1.8, 9.5, 0.9, 0.9, { ry: HP, grime: 0.3 });
        PF.decal(b, 0, X(-16.45), HALL + 1.4, Z(5.4), 1.2, 1.2, HP);
        A.sec = PF.anchor(X(-10), HALL + 0.05, Z(9.4), PI);
      }
      // PRESIDENT'S OFFICE (x 3.3..16.5): walnut & leather, portraits, the model of the tower, safe, terminal
      {
        PF.rug(b, X(11), HALL, Z(8.4), 5.6, 3.8, 0, 0);
        PF.rug(b, X(6.2), HALL, Z(5.8), 2.6, 1.9, 0.3, 1);
        // walnut dado & rail (the south run breaks for the door at x 8.3..9.7)
        for (const [x0, z0, x1, z1] of [
          [3.35, 3.35, 8.2, 3.45],
          [9.8, 3.35, 16.45, 3.45],
          [3.35, 12.35, 16.45, 12.45],
          [16.35, 3.35, 16.45, 12.45],
          [3.35, 3.35, 3.45, 12.45],
        ]) {
          bmm("walnut", x0, HALL, z0, x1, HALL + 1.2, z1, {
            seg: false,
            noAO: true,
          });
          bmm(
            "walnut",
            x0 - 0.02,
            HALL + 1.2,
            z0 - 0.03,
            x1 + 0.02,
            HALL + 1.28,
            z1 + 0.03,
            { seg: false, noAO: true },
          );
        }
        solid("mahog_ws", 10.2, HALL, 9.4, 13.8, HALL + 0.85, 10.6, {
          seg: false,
        });
        PF.deskClutter(b, X(11.0), HALL + 0.85, Z(10.0), PI, "pres", {
          typewriter: false,
          lit: true,
          parent: root,
        });
        PF.clubChair(b, X(8.4), HALL, Z(7.2), 0.5);
        PF.clubChair(b, X(8.8), HALL, Z(9.4), 2.4, undefined, true);
        b.cyl("mahog_ws", X(7.9), HALL, Z(8.3), 0.3, 0.3, 0.55, 10, {
          hSeg: 1,
        });
        b.cyl("glass_dark", X(7.85), HALL + 0.55, Z(8.3), 0.04, 0.05, 0.28, 6, {
          hSeg: 1,
        }); // the decanter
        b.box("panel", X(15.2), HALL, Z(11.3), 0.6, 1.3, 0.6, {
          rz: 0.35,
          seg: false,
          grime: 0.5,
        });
        D.chair(b, X(12), HALL, Z(11.4), PI, false, "mahog_ws");
        for (const z of [5, 7])
          D.chair(
            b,
            X(12 + (z - 6) * 0.6),
            HALL,
            Z(8.2),
            0,
            z === 7,
            "mahog_ws",
          );
        D.painting(b, 1, X(16.43), HALL + 2.3, Z(6.2), 1.4, 1.1, -HP);
        D.painting(b, 5, X(16.43), HALL + 2.3, Z(9.8), 1.4, 1.1, -HP);
        for (let k = 0; k < 3; k++)
          PF.bookcase(b, X(4.6 + k * 1.7), HALL, Z(12.1), PI, 1.5, 5, 320 + k);
        // the building model: "THE RACE TO THE SKY" — 40 Wall vs. the Chrysler
        solid("oak_ws", 5.2, HALL, 5.0, 7.2, HALL + 0.9, 6.6, { seg: false });
        b.box("lime_ws", X(6.0), HALL + 0.9, Z(5.8), 0.5, 0.9, 0.5, {
          seg: false,
        });
        b.box("buff_brick", X(6.0), HALL + 1.8, Z(5.8), 0.3, 1.1, 0.3, {
          seg: false,
        });
        b.cyl("copper_ws", X(6.0), HALL + 2.9, Z(5.8), 0.001, 0.25, 0.45, 4, {
          thetaStart: PI / 4,
          hSeg: 1,
        });
        b.cyl("chrome", X(6.6), HALL + 0.9, Z(5.6), 0.001, 0.15, 3.2, 8, {
          hSeg: 2,
        }); // the Chrysler's cheating spire
        PF.readable(
          P(6.2, HALL + 1.0, 6.7),
          "The Race to the Sky",
          'A brass plaque on the model: "BANK OF THE MANHATTAN CO. — 927 FEET. TALLEST IN THE WORLD, 1930." Someone has added, in pencil: "for 11 days."',
        );
        A.president = PF.anchor(X(12), HALL + 0.05, Z(8.2), PI);
      }

      // =====================================================================
      // THE GRAND VAULT STAIR (x -3..3): HALL → VAULT, climbing north
      // =====================================================================
      {
        PF.stairs(b, "marble_ws", X(0), Z(11.8), PI, 5.4, 7.6, VAULT, HALL, {
          base: VAULT,
          grime: 0.4,
        });
        for (const sx of [-2.85, 2.85]) {
          b.beam(
            "bronze_door",
            P(sx, VAULT + 1.0, 11.8),
            P(sx, HALL + 1.0, 4.2),
            0.07,
            0.07,
            {},
          );
          for (let k = 0; k <= 8; k++) {
            const t = k / 8;
            b.beam(
              "bronze_door",
              P(sx, VAULT + (HALL - VAULT) * t, 11.8 - 7.6 * t),
              P(sx, VAULT + (HALL - VAULT) * t + 1.0, 11.8 - 7.6 * t),
              0.035,
              0.035,
              {},
            );
          }
        }
        bmm("sp_white", -3, HALL + 4.2, 3.3, 3, HALL + 4.4, 12.8, {
          seg: false,
          noAO: true,
        });
        const vk = PF.texMat(
          "fw_tovault",
          PF.signTex(
            "fw_tovault",
            ["SAFE DEPOSIT VAULT", "↓"],
            "bronze",
            512,
            160,
          ),
          {},
        );
        quad(vk, 0, HALL + 3.2, 3.33, 2.4, 0.75, { ry: 0, grime: 0.2 });
      }

      // =====================================================================
      // VAULT LEVEL: antechamber, round vault door, safe-deposit vault, director's
      // vault, coin room, service stair
      // =====================================================================
      // antechamber: z 11.8..20, x -8..8
      slab("fw_terrazzo", -8, 11.8, 8, 20, VAULT + 0.05, 0.3, {});
      wall("vault_dk", "z", 11.8, 20, -8.4, -8, VAULT, 4.4, []);
      wall("vault_dk", "z", 11.8, 20, 8, 8.4, VAULT, 4.4, []);
      wall("marble_soft", "x", -8, -3, 12.5, 12.8, VAULT, HALL - 0.35, []);
      wall("marble_soft", "x", 3, 8, 12.5, 12.8, VAULT, HALL - 0.35, []);
      bmm("vault_dk", -8, 4.4, 12.8, 8, 4.6, 20, { seg: false, noAO: true });
      for (let x = -7; x <= 7; x += 2) {
        bmm("lamp_ws", x - 0.5, 4.28, 15.9, x + 0.5, 4.36, 16.1, {
          seg: false,
          noAO: true,
        });
      }
      // security desk + the dead heist crew's last stand
      solid("steel", 4.6, VAULT + 0.05, 13.4, 7.6, VAULT + 1.05, 14.2, {
        seg: false,
      });
      D.monitor(b, X(6.1), VAULT + 1.05, Z(13.8), PI, true);
      PF.sandbags(b, X(-6), Z(14.6), X(-2.4), Z(14.6), 2, { y: VAULT + 0.05 });
      PF.skeleton(b, X(-4.5), VAULT + 0.05, Z(15.6), 2.4);
      PF.skeleton(b, X(-1.4), VAULT + 0.05, Z(17.6), -0.8);
      b.box("fabric", X(-3.2), VAULT + 0.05, Z(16.2), 0.9, 0.35, 0.45, {
        ry: 0.3,
        seg: false,
        c: 0x4a4a3a,
      });
      D.papers(b, X(-2.5), VAULT + 0.05, Z(16.5), 1.4, 16, 330);
      for (let k = 0; k < 6; k++)
        b.box(
          "gore",
          X(-3 + r() * 5),
          VAULT + 0.06,
          Z(15 + r() * 3.5),
          0.4 + r() * 0.4,
          0.005,
          0.3 + r() * 0.3,
          { ry: r() * 3, seg: false, noAO: true },
        );
      // the vault-door wall (z 20) with the round opening (radius 2.1, centre y 2.3)
      {
        const R = 2.1,
          cy = VAULT + 2.35;
        const sh = new THREE.Shape();
        sh.moveTo(-8, 0);
        sh.lineTo(8, 0);
        sh.lineTo(8, 4.6);
        sh.lineTo(-8, 4.6);
        sh.closePath();
        const hole = new THREE.Path();
        hole.absarc(0, cy, R, 0, TAU, true);
        sh.holes.push(hole);
        const g = new THREE.ExtrudeGeometry(sh, {
          depth: 1.4,
          bevelEnabled: false,
          curveSegments: 32,
        });
        b.add("vault_ws", g, { m: PF.m4(X(0), 0, Z(20)), grime: 0.3 });
        col(-8, VAULT, 20, -R, 4.6, 21.4);
        col(R, VAULT, 20, 8, 4.6, 21.4);
        col(-R, cy + R - 0.2, 20, R, 4.6, 21.4);
        col(-R, VAULT, 20, R, VAULT + 0.25, 21.4, { walkable: true });
        // the bolt ring around the opening
        const rg = new THREE.TorusGeometry(R + 0.25, 0.14, 6, 32);
        b.add("vault_ws", rg, { m: PF.m4(X(0), cy, Z(19.95)), grime: 0.2 });
        // floor plate (bridge) into the vault
        bmm("vault_ws", -1.6, VAULT, 19.6, 1.6, VAULT + 0.25, 21.6, {
          seg: false,
        });
        const vk = PF.texMat(
          "fw_mosler",
          PF.signTex(
            "fw_mosler",
            ["MOSLER SAFE CO.", "HAMILTON, OHIO"],
            "bronze",
            512,
            96,
          ),
          {},
        );
        quad(vk, 0, cy + R + 0.65, 19.93, 2.4, 0.45, { ry: PI, grime: 0.2 });
        A.vault_door = P(0, cy, 19.8);
        PF.fw = PF.fw || {};
        PF.fw.doorCenter = P(0, cy, 19.3);
        PF.fw.doorR = R;
        PF.fw.doorHinge = P(R + 0.1, cy, 19.2);
        // alarm beacon over the door
        b.cyl("red_alarm", X(0), cy + R + 1.25, Z(19.7), 0.18, 0.2, 0.3, 8, {
          hSeg: 1,
          noAO: true,
        });
        PF.glow(P(0, cy + R + 1.4, 19.6), 0xff3020, 1.6, root, {
          intensity: 1.0,
          flicker: 0.4,
        });
      }
      // SAFE-DEPOSIT VAULT: z 21.4..34, x -9..9 — walls of boxes, two island walls, coupon booths east
      {
        const zv0 = 21.4,
          zv1 = 34;
        slab("vault_ws", -9, zv0, 9, zv1, VAULT + 0.05, 0.3, {
          surface: "metal",
        });
        wall("vault_dk", "z", zv0, zv1, -9.4, -9, VAULT, 4.0, [
          { c: 26, w: 1.6, y0: VAULT, h: 2.6 },
        ]);
        wall("vault_dk", "z", zv0, zv1, 9, 9.4, VAULT, 4.0, []);
        wall("vault_dk", "x", -9, 9, zv1, zv1 + 0.4, VAULT, 4.0, [
          { c: 0, w: 2.4, y0: VAULT, h: 2.6 },
        ]);
        bmm("vault_dk", -9, 4.0, 20, 9, 4.2, zv1, { seg: false, noAO: true });
        for (let z = 23; z < zv1; z += 3)
          bmm("lamp_ws", -0.6, 3.88, z - 0.1, 0.6, 3.96, z + 0.1, {
            seg: false,
            noAO: true,
          });
        const bx = PF.boxesKey();
        // perimeter box walls (west wall, south wall halves) + two islands
        for (let z = zv0 + 1.2; z < zv1 - 0.8; z += 2.2)
          quad(bx, -8.97, 1.9, z, 2.1, 3.6, {
            ry: HP,
            grime: 0.15,
            noAO: true,
          });
        for (const x of [-6, -3.2, 3.2, 6])
          quad(bx, x, 1.9, zv1 - 0.03, 2.4, 3.6, {
            ry: PI,
            grime: 0.15,
            noAO: true,
          });
        for (const xi of [-4.2, 2.6]) {
          solid("vault_ws", xi - 0.5, VAULT + 0.05, 23.4, xi + 0.5, 3.1, 31.6, {
            seg: false,
            surface: "metal",
          });
          for (let z = 24.4; z < 31; z += 2) {
            quad(bx, xi - 0.52, 1.6, z, 2.0, 3.0, {
              ry: -HP,
              grime: 0.15,
              noAO: true,
            });
            quad(bx, xi + 0.52, 1.6, z, 2.0, 3.0, {
              ry: HP,
              grime: 0.15,
              noAO: true,
            });
          }
        }
        // pulled-out boxes and spilled contents on the floor (the robots never let the looters leave)
        for (let k = 0; k < 10; k++) {
          const x = -8 + r() * 16,
            z = 23 + r() * 10;
          box("brass_ws", x, VAULT + 0.06, z, 0.5, 0.15, 0.3, {
            ry: r() * 3,
            seg: false,
          });
        }
        D.papers(b, X(0), VAULT + 0.05, Z(28), 5, 40, 340);
        // coupon booths (east side): three cubicles with tables, curtain rails
        for (let k = 0; k < 3; k++) {
          const z0 = 22.4 + k * 3.6,
            z1 = z0 + 3.2;
          wall("mahog_ws", "x", 6, 9, z0 - 0.1, z0, VAULT, 2.4, []);
          solid(
            "mahog_ws",
            7.0,
            VAULT + 0.05,
            z0 + 0.8,
            8.8,
            VAULT + 0.85,
            z0 + 2.4,
            { seg: false },
          );
          D.chair(
            b,
            X(6.6),
            VAULT + 0.05,
            Z(z0 + 1.6),
            -HP,
            k === 1,
            "mahog_ws",
          );
          b.beam("brass_ws", P(6, 2.3, z0), P(6, 2.3, z1), 0.03, 0.03, {});
          if (k !== 1)
            box("velvet", 6.0, VAULT + 0.3, z0 + 0.3, 0.04, 2.0, 0.8, {
              seg: false,
            });
        }
        // BOX No. 1804 (west island, highlighted by a pried-open neighbour) — quest
        A.box1804 = P(-4.72, 1.35, 27.2);
        quad("brass_ws", -4.73, 1.35, 27.2, 0.42, 0.3, { ry: -HP, noAO: true });
        const nk = PF.texMat(
          "fw_1804",
          PF.signTex("fw_1804", ["1804"], "engraved", 128, 64, {
            bg: "#c8a860",
          }),
          {},
        );
        quad(nk, -4.74, 1.55, 27.2, 0.2, 0.1, { ry: -HP, noAO: true });
        A.safedep = PF.anchor(X(0), VAULT + 0.1, Z(28), 0);
        A.burr = PF.anchor(X(0.5), VAULT + 0.1, Z(31.5), 0);
      }
      // DIRECTOR'S PRIVATE VAULT (z 34.4..40, x -4..4): barred gate (lock 75), gold, bonds, the reward
      {
        slab("vault_ws", -4, 34.4, 4, 40, VAULT + 0.05, 0.3, {
          surface: "metal",
        });
        wall("vault_ws", "z", 34.4, 40, -4.4, -4, VAULT, 3.2, []);
        wall("vault_ws", "z", 34.4, 40, 4, 4.4, VAULT, 3.2, []);
        wall("vault_ws", "x", -4.4, 4.4, 40, 40.4, VAULT, 3.2, []);
        for (const z of [35.6, 38.4])
          PF.cageLamp(b, X(0), VAULT + 2.9, Z(z), 0xffd8a0, root);
        bmm("vault_dk", -4.4, 3.2, 34, 4.4, 3.4, 40.4, {
          seg: false,
          noAO: true,
        });
        for (let k = 0; k < 12; k++)
          box(
            "bronze_door",
            -1.1 + k * 0.2,
            VAULT + 0.05,
            34.2,
            0.05,
            2.55,
            0.05,
            { seg: false },
          );
        bmm(
          "bronze_door",
          -1.2,
          VAULT + 2.55,
          34.15,
          1.2,
          VAULT + 2.65,
          34.25,
          { seg: false },
        );
        for (const y of [0.6, 1.5])
          bmm(
            "bronze_door",
            -1.2,
            VAULT + y,
            34.16,
            1.2,
            VAULT + y + 0.06,
            34.24,
            { seg: false },
          );
        // the payoff: bullion racks both sides, strapped cash, bearer-bond boxes, the Director at his desk
        PF.bullionShelf(b, X(-3.55), VAULT + 0.05, Z(37.1), HP, 4.4, 4, 1, {
          cash: true,
        });
        PF.bullionShelf(b, X(3.55), VAULT + 0.05, Z(37.1), -HP, 4.4, 4, 2, {});
        for (let k = 0; k < 4; k++) {
          box(
            "bronze_door",
            -2.6 + k * 0.1,
            VAULT + 0.05 + k * 0.22,
            39.55,
            0.9,
            0.22,
            0.6,
            { ry: k * 0.05, seg: false, c: 0x8a6a40 },
          );
        } // bearer-bond boxes
        const bb = PF.texMat(
          "fw_bonds",
          PF.signTex(
            "fw_bonds",
            ["BEARER BONDS", "SERIES 1967 · $10,000"],
            "engraved",
            256,
            96,
            { bg: "#c8b890" },
          ),
          {},
        );
        quad(bb, -2.45, VAULT + 0.55, 39.24, 0.7, 0.26, { ry: PI, grime: 0.3 });
        for (let k = 0; k < 8; k++)
          box(
            "money",
            1.6 + r() * 0.8,
            VAULT + 0.06,
            35.2 + r() * 1.2,
            0.16,
            0.06,
            0.07,
            { ry: r() * 3, seg: false },
          );
        solid("mahog_ws", -1.2, VAULT + 0.05, 38.4, 1.2, VAULT + 0.85, 39.4, {
          seg: false,
        });
        D.chair(b, X(0.2), VAULT + 0.05, Z(37.8), 0.4, false, "leather_ws");
        PF.skeleton(b, X(1.0), VAULT + 0.05, Z(37.3), 2.1); // slid out of the chair
        b.box("iron", X(1.5), VAULT + 0.06, Z(36.5), 0.24, 0.05, 0.08, {
          ry: 0.6,
          seg: false,
        }); // the revolver
        b.cyl("iron", X(1.58), VAULT + 0.08, Z(36.4), 0.02, 0.02, 0.18, 6, {
          rz: HP,
          ry: 0.6,
          hSeg: 1,
        });
        for (let k = 0; k < 3; k++)
          b.cyl(
            "brass_ws",
            X(1.2 + k * 0.1),
            VAULT + 0.06,
            Z(36.2 + k * 0.08),
            0.008,
            0.008,
            0.03,
            4,
            { hSeg: 1, rz: HP },
          );
        PF.readable(
          P(0.6, VAULT + 0.9, 38.7),
          "Note on the Director's Desk",
          '"March 1967, day ten. The Colonel will not open the time lock for anyone, including me. It is almost funny. Forty million in gold and I cannot buy a glass of water. I have the revolver and one good idea left. To whoever opens this: the bonds are worthless now. The gold was always worthless. Take the chair. It is a very good chair. — E. Vandermeer, Director."',
        );
        PF.glow(P(0, VAULT + 1.6, 37), 0xffd070, 2.2, root, { intensity: 0.9 });
        PF.glow(P(-3.3, VAULT + 1.1, 37.1), 0xffc050, 1.4, root, {
          intensity: 0.7,
        });
        PF.glow(P(3.3, VAULT + 1.1, 37.1), 0xffc050, 1.4, root, {
          intensity: 0.7,
        });
        PF.fw.gatePos = P(0, VAULT + 1.3, 34.0);
        A.director = PF.anchor(X(0), VAULT + 0.1, Z(37), 0);
      }
      // COIN ROOM (x -16..-9.4, z 22..30): counting machines, money carts, sacks → the service stair (x -16..-14, north)
      {
        slab("vault_ws", -16, 20.4, -9.4, 30, VAULT + 0.05, 0.3, {
          surface: "metal",
        });
        wall("vault_dk", "z", 20.4, 30, -16.4, -16, VAULT, 4.0, []);
        wall("vault_dk", "x", -16.4, -9, 30, 30.4, VAULT, 4.0, []);
        wall("vault_dk", "x", -14, -9, 20.0, 20.4, VAULT, 4.0, []);
        bmm("vault_dk", -16.4, 4.0, 20.4, -9, 4.2, 30.4, {
          seg: false,
          noAO: true,
        });
        for (let k = 0; k < 3; k++) {
          solid(
            "panel",
            -15.6,
            VAULT + 0.05,
            22.4 + k * 2.4,
            -14.4,
            VAULT + 1.2,
            23.6 + k * 2.4,
            { seg: false, surface: "metal" },
          );
          b.box(
            "glass_dark",
            X(-14.38),
            VAULT + 0.8,
            Z(23 + k * 2.4),
            0.04,
            0.3,
            0.5,
            { seg: false },
          );
        }
        for (let k = 0; k < 3; k++) {
          solid(
            "steel",
            -12.6 + (k % 2) * 1.6,
            VAULT + 0.05,
            24 + k * 1.8,
            -11.4 + (k % 2) * 1.6,
            VAULT + 0.9,
            25.1 + k * 1.8,
            { seg: false, surface: "metal" },
          );
          for (let s2 = 0; s2 < 4; s2++)
            b.box(
              "money",
              X(-12 + (k % 2) * 1.6 + (s2 - 1.5) * 0.25),
              VAULT + 0.9,
              Z(24.55 + k * 1.8),
              0.2,
              0.12,
              0.45,
              { seg: false },
            );
        }
        for (let k = 0; k < 4; k++)
          PF.coinSack(b, X(-10.4), VAULT + 0.05, Z(28.8 - k * 0.6), false, k);
        PF.coinSack(b, X(-11.2), VAULT + 0.05, Z(26.2), true, 11);
        PF.coinSack(b, X(-13.2), VAULT + 0.05, Z(28.6), true, 12);
        PF.moneyCart(b, X(-14.6), VAULT + 0.05, Z(29.0), 0.2, 1);
        PF.moneyCart(b, X(-12.4), VAULT + 0.05, Z(21.6), 1.8, 2, true);
        for (const x of [-14.2, -11.2])
          PF.cageLamp(b, X(x), 3.6, Z(25), 0xe8f0ff, root);
        const ck = PF.texMat(
          "fw_coin",
          PF.signTex(
            "fw_coin",
            ["COIN & CURRENCY", "Count twice. Sign once."],
            "enamel",
            512,
            128,
            { bg: "#1a2a1a", fg: "#e0d0a0" },
          ),
          {},
        );
        quad(ck, -12.6, 3.0, 29.95, 2.4, 0.6, { ry: PI, grime: 0.2 });
        A.coin = PF.anchor(X(-12.5), VAULT + 0.1, Z(26), HP);
      }
      // SERVICE STAIR (x -16..-14, z 12..20.4): VAULT → HALL climbing north, into the security office
      {
        slab("vault_ws", -16, 19.2, -14, 20.4, VAULT + 0.05, 0.3, {
          surface: "metal",
        });
        wall("vault_dk", "z", 11, 20.4, -16.4, -16, VAULT, HALL + 3, []);
        wall("vault_dk", "z", 12.5, 20.4, -14, -13.7, VAULT, HALL + 3, []);
        PF.steelStair(b, X(-15), Z(19.3), PI, 1.8, 7.6, VAULT + 0.05, HALL, {
          key: "iron",
          tread: "diamond",
          railKey: "iron",
          rails: false,
        });
        // the stair lands in the security office's south-west corner (gap in the office's south wall)
        bmm("vault_dk", -16.4, HALL + 3, 12.5, -13.7, HALL + 3.2, 20.4, {
          seg: false,
          noAO: true,
        });
        const sk2 = PF.texMat(
          "fw_svc",
          PF.signTex(
            "fw_svc",
            ["SERVICE STAIR", "VAULT LEVEL ↓"],
            "enamel",
            256,
            96,
            { bg: "#2a2a2a", fg: "#e0d0a0" },
          ),
          {},
        );
        quad(sk2, -15, HALL + 3.0, 12.48, 1.4, 0.52, { ry: PI, grime: 0.2 });
      }

      PF.flushGlows(root);
      PF.flushFires();
      b.build(root, { lodDistInt: 400 });

      // =====================================================================
      // THE ROUND VAULT DOOR (separate animated object): 90 tons of Mosler steel
      // =====================================================================
      {
        const R = PF.fw.doorR;
        const pivot = new THREE.Group();
        pivot.position.copy(PF.fw.doorHinge);
        root.add(pivot);
        const disc = PF.mesh(
          "vault_ws",
          new THREE.CylinderGeometry(R - 0.05, R - 0.05, 1.3, 32),
        );
        disc.rotation.x = HP;
        disc.position.set(-(R + 0.1), 0, -0.05);
        pivot.add(disc);
        const face = PF.mesh(
          "vault_dk",
          new THREE.CylinderGeometry(R - 0.5, R - 0.5, 0.1, 32),
        );
        face.rotation.x = HP;
        face.position.set(-(R + 0.1), 0, -0.72);
        pivot.add(face);
        const wheel = PF.mesh(
          "chrome",
          new THREE.TorusGeometry(0.55, 0.06, 6, 20),
        );
        wheel.position.set(-(R + 0.1), 0, -0.85);
        pivot.add(wheel);
        for (let i = 0; i < 3; i++) {
          const sp = PF.mesh("chrome", new THREE.BoxGeometry(1.1, 0.06, 0.06));
          sp.rotation.z = (i * PI) / 3;
          sp.position.set(-(R + 0.1), 0, -0.85);
          pivot.add(sp);
        }
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * TAU;
          const bolt = PF.mesh(
            "chrome",
            new THREE.CylinderGeometry(0.1, 0.1, 0.4, 8),
          );
          bolt.rotation.z = a;
          bolt.position.set(
            -(R + 0.1) + Math.cos(a) * (R - 0.05),
            Math.sin(a) * (R - 0.05),
            0,
          );
          pivot.add(bolt);
        }
        const hinge = PF.mesh(
          "vault_dk",
          new THREE.CylinderGeometry(0.35, 0.35, 2.6, 12),
        );
        hinge.position.set(0, 0, 0);
        pivot.add(hinge);
        pivot.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = false;
            o.receiveShadow = true;
          }
        });
        PF.fw.pivot = pivot;
        const c = PF.fw.doorCenter;
        const dCol = PF.colMM(
          c.x - R,
          VAULT,
          c.z - 0.9,
          c.x + R,
          VAULT + 4.6,
          c.z + 0.6,
          { walkable: false },
        );
        PF.fw.doorCol = dCol;
        let ang = 0,
          target = 0;
        const apply = () => {
          pivot.rotation.y = ang;
        };
        const setOpen = (o, instant) => {
          target = o ? -1.85 : 0;
          if (instant) {
            ang = target;
            apply();
          }
          if (dCol) {
            dCol.minY = o ? -99 : VAULT;
            dCol.maxY = o ? -98 : VAULT + 4.6;
          }
        };
        PF.fw.setOpen = setOpen;
        PF.flagWatch.push((k) => {
          if (k === "fw_vault_open" || k === "*")
            setOpen(!!PF.flag("fw_vault_open"), k === "*");
        });
        PF.onReset.push(() => setOpen(false, true));
        PF.animate(PF.fw.doorCenter, 80, (t, dt) => {
          if (Math.abs(ang - target) < 1e-3) return;
          const step =
            Math.sign(target - ang) *
            Math.min(Math.abs(target - ang), dt * 0.35);
          ang += step;
          apply();
        });
      }
      // director's vault gate (the Director's key on Colonel Burr) — opens in place
      {
        const gCol = PF.colMM(
          X(-1.2),
          VAULT,
          Z(34.0),
          X(1.2),
          VAULT + 2.6,
          Z(34.35),
          { walkable: false },
        );
        const setGate = (o) => {
          if (gCol) {
            gCol.minY = o ? -99 : VAULT;
            gCol.maxY = o ? -98 : VAULT + 2.6;
          }
        };
        PF.use({
          pos: PF.fw.gatePos,
          radius: 0.9,
          range: 2.6,
          label: () =>
            PF.flag("fw_gate_open")
              ? "Director's Vault (open)"
              : "Director's Vault Gate",
          verb: () => (PF.flag("fw_gate_open") ? "Look" : "Open"),
          locked: () =>
            PF.flag("fw_gate_open") || PF.inv.count("pws_director_key") > 0
              ? null
              : "Locked — needs the Director's key",
          onInteract() {
            if (PF.flag("fw_gate_open")) {
              G.notify(
                "Bullion, bearer bonds, and a leather chair nobody has sat in for twenty-two years.",
              );
              return;
            }
            const ok = (msg) => {
              PF.setFlag("fw_gate_open", true);
              G.notify(msg);
              PF.sfx("door_open", PF.fw.gatePos);
            };
            PF.lockOpen("pws_lk_fw_director", () =>
              ok("The Director's key turns with a satisfying clunk."),
            );
          },
        });
        PF.flagWatch.push((k) => {
          if (k === "fw_gate_open" || k === "*")
            setGate(!!PF.flag("fw_gate_open"));
        });
        PF.onReset.push(() => setGate(false));
      }
      // the vault-door control panel (a keycard reader) beside the door
      PF.use({
        pos: P(-2.9, VAULT + 1.4, 19.7),
        radius: 0.6,
        range: 2.4,
        label: () =>
          PF.flag("fw_vault_open")
            ? "Vault Door Control (OPEN)"
            : "Vault Door Control (TIME LOCK)",
        verb: () => (PF.flag("fw_vault_open") ? "Close" : "Use"),
        onInteract() {
          if (PF.flag("fw_vault_open")) {
            PF.setFlag("fw_vault_open", false);
            PF.sfx("cryo_door", PF.fw.doorCenter);
            return;
          }
          if (
            PF.inv.count("pws_override_card") > 0 ||
            PF.lockIsOpen("pws_lk_fw_vault")
          ) {
            PF.lockOpen("pws_lk_fw_vault", () =>
              PF.openFortyVault(
                'The reader chirps: "OVERRIDE ACCEPTED. HAVE A PROSPEROUS DAY." Ninety tons of steel begin to swing.',
              ),
            );
            return;
          }
          G.notify(
            'TIME LOCK ENGAGED — "The vault will open at 9:00 AM Monday." An override card, or the security office terminal, might change its mind.',
          );
          PF.sfx("ui_error");
        },
      });
      PF.openFortyVault = function (msg) {
        if (PF.flag("fw_vault_open")) return;
        PF.setFlag("fw_vault_open", true);
        if (msg) G.notify(msg);
        PF.sfx("cryo_door", PF.fw.doorCenter);
        PF.sfx("alarm", PF.fw.doorCenter);
        if (PF.q.active("pws_deposit"))
          PF.q.advance("pws_deposit", ["enter", "vault"], "box");
      };

      // =====================================================================
      // anchors, doors, props, NPCs
      // =====================================================================
      Object.assign(A, {
        entrance: PF.anchor(X(0), HALL + 0.05, Z(-17.4), PI),
        hall: PF.anchor(X(0), HALL + 0.05, Z(-6), PI),
        ante: PF.anchor(X(0), VAULT + 0.1, Z(15.5), PI),
      });
      Object.assign(A, {
        spawn1: PF.anchor(X(-5), HALL + 0.05, Z(-7), PI),
        spawn2: PF.anchor(X(6), HALL + 0.05, Z(-12), PI),
        spawn3: A.ante,
        spawn4: A.safedep,
        spawn5: A.coin,
        spawn6: A.president,
        boss: A.burr,
        loot1: A.director,
        loot2: A.sec,
        loot3: A.president,
      });
      PF.fw.int = A;
      const FWX = PF.FW;
      const door0 = FWX.door;
      PF.door({
        id: "pws_fw_in",
        pos: door0,
        label: "40 Wall Street (Bank of the Manhattan Company)",
        verb: "Enter",
        radius: 1.6,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: PI },
        sound: "door_open",
      });
      PF.door({
        id: "pws_fw_out",
        pos: P(0, HALL + 1.5, -19.7),
        label: "Wall Street",
        verb: "Exit",
        radius: 1.5,
        target: { x: FWX.XC, y: 0.25, z: FWX.Z0 - 2.4, yaw: 0 },
        sound: "door_open",
      });
      // terminals & containers
      PF.prop("terminal", {
        x: X(-9.8),
        y: HALL + 1.0,
        z: Z(11.8),
        yaw: PI,
        terminalId: "pws_fw_security",
        mount: "bare",
        id: "pws_fw_term_sec",
      });
      PF.prop("terminal", {
        x: X(12),
        y: HALL + 0.85,
        z: Z(10.0),
        yaw: PI,
        terminalId: "pws_fw_president",
        mount: "bare",
        id: "pws_fw_term_pres",
      });
      PF.prop("safe", {
        x: X(16.1),
        y: HALL,
        z: Z(4.2),
        yaw: -HP,
        lock: PF.lockSpec("pws_lk_fw_pres_safe"),
        loot: "wall_safe",
        id: "pws_fw_pres_safe",
        name: "President's Safe",
      });
      PF.prop("file_cabinet", {
        x: X(4.2),
        y: HALL,
        z: Z(4.0),
        yaw: 0,
        loot: "file_cabinet",
        id: "pws_fw_files",
      });
      PF.prop("locker", {
        x: X(-15.9),
        y: HALL,
        z: Z(7.2),
        yaw: HP,
        loot: "locker",
        id: "pws_fw_seclocker",
        count: 2,
      });
      PF.prop("cash_register", {
        x: X(-9.2),
        y: HALL + 1.25,
        z: Z(2.0),
        yaw: PI,
        loot: "cash_register",
        id: "pws_fw_till1",
      });
      PF.prop("cash_register", {
        x: X(6.4),
        y: HALL + 1.25,
        z: Z(2.0),
        yaw: PI,
        loot: "cash_register",
        id: "pws_fw_till2",
      });
      PF.prop("footlocker", {
        x: X(0),
        y: VAULT + 0.85,
        z: Z(38.9),
        yaw: PI,
        items: [
          ["gold_bar", 3],
          ["old_dollars", 20],
          ["pws_manhattan_pistol", 1],
          ["ammo_10mm", 36],
          ["pws_note_director", 1],
        ],
        id: "pws_fw_director_box",
        name: "Director's Strongbox",
      });
      PF.prop("duffle_bag", {
        x: X(-3.2),
        y: VAULT + 0.05,
        z: Z(16.2),
        yaw: 0.3,
        loot: "duffle_bag",
        id: "pws_fw_heist_bag",
      });
      PF.prop("ammo_box", {
        x: X(-6.4),
        y: VAULT + 0.05,
        z: Z(13.4),
        yaw: 0,
        loot: "ammo_box",
        id: "pws_fw_ammo",
      });
      PF.prop("first_aid", {
        x: X(7.95),
        y: VAULT + 1.4,
        z: Z(13.0),
        yaw: -HP,
        id: "pws_fw_aid",
      });
      // security turrets in the banking hall (controlled from the security terminal)
      PF.prop("turret", {
        x: X(-12.8),
        y: HALL,
        z: Z(-14.6),
        yaw: -2.4,
        hostile: true,
        faction: "robots",
        terminalId: "pws_fw_turrets",
        id: "pws_fw_turret1",
        damage: 4,
      });
      PF.prop("turret", {
        x: X(12.8),
        y: HALL,
        z: Z(0.6),
        yaw: -0.8,
        hostile: true,
        faction: "robots",
        terminalId: "pws_fw_turrets",
        id: "pws_fw_turret2",
        damage: 4,
      });
      PF.pickup("pws_reel_heist", 1, P(-2.9, VAULT + 0.45, 16.1));
      PF.pickup("pws_note_teller", 1, P(-5.1, HALL + 1.13, -3.1));
      PF.pickup("pws_note_president", 1, P(11.3, HALL + 0.87, 9.8));
      for (const [id, n, x, y, z] of [
        ["old_dollars", 2, 5.4, HALL + 1.13, -10.1],
        ["pencil", 1, -4.4, HALL + 1.13, -9.9],
        ["clipboard", 1, -12.2, HALL + 1.02, 11.6],
        ["rally_tonic", 1, -15.9, HALL + 1.0, 4.8],
        ["cigarettes", 1, 12.6, HALL + 0.87, 9.7],
        ["scotch", 1, 7.85, HALL + 0.56, 8.5],
        ["ammo_10mm", 24, -5.6, VAULT + 0.1, 15.2],
        ["old_dollars", 3, -12.0, VAULT + 0.95, 24.6],
        ["duct_tape", 1, 7.8, VAULT + 0.9, 23.9],
        ["gold_bar", 1, -12.8, VAULT + 0.1, 28.2],
        ["typewriter", 1, 13.2, HALL + 0.87, 9.6],
      ])
        PF.pickup(id, n, P(x, y, z));
      // LASER TRIPWIRES in the vault (bank security still armed; the security terminal can drop the grid)
      let lockdowns = 0;
      const lockdown = (x, z) => () => {
        lockdowns++;
        PF.spawnNpc({
          id: "pws_fw_lockdown" + lockdowns,
          type: "patrolman",
          name: "Vault Security Patrolman",
          faction: "robots",
          hostile: true,
          level: 8,
          pos: { x: X(x), y: VAULT + 0.1, z: Z(z) },
          yaw: 0,
          ai: "guard",
          home: { x: X(x), z: Z(z), r: 8 },
          loot: "robot",
          seed: 7520 + lockdowns,
          voice: "robot",
          barks: [
            "VAULT LOCKDOWN. PLEASE REMAIN WHERE YOU ARE.",
            "Your business is important to us.",
          ],
        });
        PF.sfx("robot_voice", P(x, VAULT + 1, z));
      };
      PF.trap({
        id: "fw_laser1",
        kind: "laser",
        parent: root,
        floorY: VAULT + 0.05,
        a: P(-1.6, VAULT + 0.95, 22.6),
        c: P(1.6, VAULT + 0.95, 22.6),
        offFlag: "fw_lasers_off",
        skill: 40,
        onTrip: lockdown(0, 16),
      });
      PF.trap({
        id: "fw_laser2",
        kind: "laser",
        parent: root,
        floorY: VAULT + 0.05,
        a: P(-8.6, VAULT + 0.95, 25.15),
        c: P(-8.6, VAULT + 0.95, 26.85),
        offFlag: "fw_lasers_off",
        skill: 40,
        onTrip: lockdown(-12.5, 24),
      });
      PF.trap({
        id: "fw_laser3",
        kind: "laser",
        parent: root,
        floorY: VAULT + 0.05,
        a: P(-1.2, VAULT + 0.5, 33.6),
        c: P(1.2, VAULT + 0.5, 33.6),
        offFlag: "fw_lasers_off",
        skill: 50,
        onTrip: lockdown(3, 30),
      });
      // box No. 1804 — the quest box
      PF.use({
        pos: A.box1804,
        radius: 0.5,
        range: 2.2,
        label: () =>
          PF.flag("fw_1804_open")
            ? "Safe-Deposit Box No. 1804 (empty)"
            : "Safe-Deposit Box No. 1804",
        verb: "Open",
        onInteract() {
          if (PF.flag("fw_1804_open")) {
            G.notify("Empty, but for a faint smell of cedar.");
            return;
          }
          if (PF.inv.count("pws_claim_ticket") < 1) {
            G.notify(
              "The box has two locks: the bank's, long since sprung, and the renter's. The renter's key would be on the claim ticket, wherever that is.",
            );
            PF.sfx("door_locked");
            return;
          }
          PF.lockOpen("pws_lk_fw_1804", open1804);
        },
      });
      function open1804() {
        if (PF.flag("fw_1804_open")) return;
        PF.setFlag("fw_1804_open", true);
        PF.inv.add("pws_charter", 1);
        PF.inv.add("old_dollars", 4);
        G.notify(
          "The claim ticket's little brass key fits. Inside, wrapped in oilcloth: a rolled parchment and a few old banknotes.",
        );
        PF.sfx("container_open", A.box1804);
        if (PF.q.started("pws_deposit")) {
          if (!PF.q.active("pws_deposit")) {
            /* completed already */
          } else PF.q.set("pws_deposit", "return");
        } else {
          PF.q.start("pws_deposit");
          PF.q.set("pws_deposit", "return");
        }
      }

      // ---------- hostile named robot: Colonel Burr (Valet-M with a dueling fixation) ----------
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      PF.npc({
        id: "pws_fw_burr",
        type: "valet_m",
        name: "Colonel Burr",
        faction: "robots",
        hostile: true,
        level: 10,
        pos: pos(A.burr),
        yaw: A.burr.yaw,
        ai: "guard",
        home: { x: A.burr.x, z: A.burr.z, r: 6 },
        inventory: [
          ["pws_override_card", 1],
          ["pws_director_key", 1],
          ["ammo_dry_cell", 3],
        ],
        loot: "robot",
        hp: 220,
        dr: 18,
        aggroRange: 30,
        seed: 7501,
        voice: "robot",
        barks: [
          "You have impugned the honour of this institution!",
          "Pistols at ten paces — I shall count to one!",
          "Banking hours are CLOSED, sir!",
          "A Hamilton man, are you? Have at thee!",
        ],
        when: () => !PF.flag("dead_pws_fw_burr"),
        onDeath: () => {
          PF.setFlag("dead_pws_fw_burr", true);
          PF.news(
            'A strange one from Wall Street: the old Bank of the Manhattan Company\'s robot "Colonel Burr" has fought his last duel. The vault, they say, is open for business.',
          );
        },
      });

      PF.register(
        "forty_wall",
        PF.root || null,
        Object.assign({}, FWX.anchors || {}, A, {
          exterior_entrance: (FWX.anchors || {}).entrance,
        }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    32,
  );
