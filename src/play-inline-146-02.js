// play-inline-146 02 — math
// Lines 23-364 of readable/play-inline-146.pretty.js (statement-aligned).
  const LB = G._lb;
  const C = { x: 6, z: -950 }; // the wreck's centre (same as the quests' stand-in)

  LB.addBuilder(
    "north_woods",
    function (LB, site, root) {
      const b = LB.batch("sirocco_wreck");
      const T = (dx, dz) => LB.terrain(C.x + dx, C.z + dz);
      const y0 = T(0, 0);
      b.ground = y0;
      b.aoH = 2.0;
      const anchors = {};
      const X = (dx) => C.x + dx,
        Z = (dz) => C.z + dz;

      // ---- scorched, churned ground and a few blast-snapped trees around the impact ----
      if (LB.blob) {
        LB.blob(b, "dirt", X(1), Z(1), 15, 9, y0 + 0.03, {
          seed: 1967,
          c: 0x3a3226,
        });
        LB.blob(b, "rubble", X(-6), Z(0.5), 4, 3, y0 + 0.05, {
          seed: 1968,
          c: 0x2a2620,
        });
      }
      if (LB.parkTree && Math.abs(y0) < 0.3) {
        // (parkTree builds at ground 0)
        for (const [dx, dz, kind, h] of [
          [-12, -6, "snag", 7],
          [9, -8, "snag", 6],
          [-3, 9, "fallen", 7],
          [14, 3, "stump", 2],
          [-15, 5, "snag", 8],
        ])
          LB.parkTree(b, X(dx), Z(dz), {
            kind,
            h,
            seed: 3000 + dx * 7 + dz,
            collide: kind !== "fallen",
          });
      }

      // ---- forward fuselage, nose ploughed in (east–west), cockpit glazing smashed ----
      const HULL = "gunmetal",
        DARK = "rust";
      b.cyl(HULL, X(-2.6), y0 + 0.9 - 4.5, Z(0), 1.35, 1.6, 9, 16, {
        rz: Math.PI / 2 + 0.07,
        hSeg: 3,
        grime: 0.85,
        open: true,
      });
      b.sphere(HULL, X(-7.05), y0 + 0.62, Z(0), 1.36, {
        ws: 14,
        hs: 8,
        phiLen: Math.PI / 2,
        rz: Math.PI / 2,
        grime: 0.9,
      });
      for (let k = 0; k < 5; k++)
        b.quad(
          "glass_broken",
          X(-6.8 + (k % 2) * 0.3),
          y0 + 1.35 + (k % 3) * 0.12,
          Z(-0.7 + k * 0.35),
          0.45,
          0.3,
          { ry: -Math.PI / 2 + 0.3, rx: -0.6 },
        );
      // the cockpit hatch thrown open, an ejection seat that never fired
      b.box(HULL, X(-5.6), y0 + 2.0, Z(0.9), 1.3, 0.08, 0.9, {
        rx: -0.9,
        seg: false,
        grime: 0.8,
      });
      b.box("iron", X(-6.3), y0 + 0.6, Z(0.1), 0.6, 0.9, 0.6, {
        seg: false,
        grime: 0.7,
      });
      LB.skeleton(b, X(-6.35), y0 + 1.15, Z(0.35), Math.PI / 2);
      // snapped frames sticking out of the break
      for (let k = 0; k < 7; k++) {
        const a = (k / 7) * Math.PI * 2;
        b.rod(
          "rust",
          new THREE.Vector3(
            X(1.9),
            y0 + 0.9 + Math.sin(a) * 1.45,
            Z(Math.cos(a) * 1.45),
          ),
          new THREE.Vector3(
            X(2.5 + (k % 3) * 0.3),
            y0 + 0.9 + Math.sin(a) * 1.6,
            Z(Math.cos(a) * 1.7),
          ),
          0.05,
          4,
        );
      }

      // ---- the tail section, broken off and twisted, with its fin code ----
      b.cyl(HULL, X(6.6), y0 + 1.0 - 3.5, Z(-0.9), 1.5, 0.9, 7, 14, {
        ry: 0.32,
        rz: Math.PI / 2 - 0.05,
        hSeg: 2,
        grime: 0.85,
        open: true,
      });
      b.box(HULL, X(9.4), y0 + 1.0, Z(-1.9), 2.2, 2.8, 0.18, {
        ry: 0.32,
        rz: 0.12,
        seg: false,
        grime: 0.8,
      });
      b.box(HULL, X(9.0), y0 + 1.2, Z(-1.6), 2.6, 0.12, 3.4, {
        ry: 0.32,
        rx: 0.15,
        seg: false,
        grime: 0.8,
      }); // tailplane
      const code = LB.texMat(
        "lb_sirocco_code",
        LB.canvasTex("lb_sirocco_code", 256, 128, (ctx, w, h) => {
          ctx.fillStyle = "#4b4f4a";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = "#d8d0b8";
          ctx.font = 'bold 64px "Arial Black", sans-serif';
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("S-2", w / 2, h * 0.45);
          ctx.font = "bold 18px monospace";
          ctx.fillText("SIROCCO", w / 2, h * 0.85);
          for (let i = 0; i < 300; i++) {
            ctx.fillStyle = "rgba(20,16,12," + Math.random() * 0.5 + ")";
            ctx.fillRect(Math.random() * w, Math.random() * h, 3, 2);
          }
        }),
        {},
      );
      {
        const fx = X(9.4) + Math.sin(0.32 + Math.PI / 2) * 0.1,
          fz = Z(-1.9) + Math.cos(0.32 + Math.PI / 2) * 0.1;
        b.quad(code, fx, y0 + 2.5, fz, 1.6, 0.8, {
          ry: 0.32 + Math.PI / 2,
          rz: 0.12,
        });
      }

      // ---- wings: one snapped and lying flat, the other a burnt stub; a jet nacelle torn off ----
      b.box(HULL, X(-1.0), y0 + 0.13, Z(-1.0), 2.8, 0.22, 12, {
        ry: 0.12,
        rz: -0.06,
        rx: 0.05,
        seg: false,
        grime: 0.85,
      });
      b.box(DARK, X(-0.4), y0 + 0.05, Z(6.2), 1.8, 0.2, 4, {
        ry: -0.4,
        rx: 0.2,
        rz: 0.1,
        seg: false,
        grime: 0.95,
      });
      b.cyl(HULL, X(-1.6), y0 + 0.55 - 1.6, Z(-4.6), 0.55, 0.45, 3.2, 12, {
        rz: Math.PI / 2,
        ry: 0.2,
        hSeg: 1,
        grime: 0.9,
        open: true,
      });
      b.cyl("iron", X(-3.2), y0 + 0.55 - 0.05, Z(-4.9), 0.4, 0.4, 0.1, 12, {
        rz: Math.PI / 2,
        ry: 0.2,
        hSeg: 1,
      });

      // ---- the belly split open over the EMPTY bomb cradle: a steel U, the shackles hanging, the weapon plate riveted on ----
      for (const dz of [1.7, 3.3])
        b.box("iron", X(2.4), y0 + 0.7, Z(dz), 3.2, 0.12, 0.12, {
          seg: false,
          grime: 0.8,
        });
      for (const dx of [0.9, 3.9])
        b.box("iron", X(dx), y0, Z(2.5), 0.12, 0.8, 1.7, {
          seg: false,
          grime: 0.8,
        });
      for (const dx of [1.6, 3.2]) {
        b.box("iron", X(dx), y0 + 0.35, Z(2.5), 0.08, 0.35, 0.08, {
          seg: false,
        });
        b.box("rust", X(dx), y0 + 0.28, Z(2.5), 0.2, 0.08, 0.3, { seg: false });
      }
      const plate = LB.texMat(
        "lb_sirocco_plate",
        LB.canvasTex("lb_sirocco_plate", 256, 160, (ctx, w, h) => {
          ctx.fillStyle = "#a8833a";
          ctx.fillRect(0, 0, w, h);
          ctx.strokeStyle = "#5a4418";
          ctx.lineWidth = 6;
          ctx.strokeRect(4, 4, w - 8, h - 8);
          for (const [x, y] of [
            [14, 14],
            [w - 14, 14],
            [14, h - 14],
            [w - 14, h - 14],
          ]) {
            ctx.fillStyle = "#6a5020";
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 7);
            ctx.fill();
          }
          ctx.fillStyle = "#2a1e08";
          ctx.textAlign = "center";
          ctx.font = "bold 18px monospace";
          [
            "ARME SPÉCIALE — S2",
            "CLÉ A · CLÉ B",
            "ROUE DE CHIFFRE",
            "ALIM. 28 V",
          ].forEach((t, i) => ctx.fillText(t, w / 2, 40 + i * 30));
        }),
        {},
      );
      b.quad(plate, X(2.4), y0 + 0.95, Z(3.37), 0.55, 0.36, {});
      anchors.sirocco_plate = LB.anchor(X(2.4), y0, Z(4.4), 0);

      // ---- drag furrows from the cradle to the slab, and the slab itself: a panel of the bomber's skin set upright ----
      const ins = { x: X(15), z: Z(14) },
        iy = LB.terrain(ins.x, ins.z);
      const ang = Math.atan2(ins.x - X(2.4), ins.z - Z(4.8));
      for (let i = 0; i < 12; i++)
        for (const off of [-0.7, 0.7]) {
          const t = (i + 0.2) / 12,
            x = X(2.4) + (ins.x - X(2.4)) * t + Math.cos(ang) * off,
            z = Z(3.8) + (ins.z - Z(4.8)) * t - Math.sin(ang) * off;
          const g = new THREE.PlaneGeometry(0.34, 1.35);
          g.rotateX(-Math.PI / 2);
          b.add("dirt", g, {
            m: LB.m4(x, LB.terrain(x, z) + 0.05, z, ang),
            grime: 0.9,
            c: 0x241e16,
            noAO: true,
          });
        }
      b.box(HULL, ins.x, iy, ins.z, 1.3, 1.7, 0.16, {
        ry: 0.6,
        seg: false,
        grime: 0.7,
      });
      b.cyl(
        "gold",
        ins.x + Math.sin(0.6) * 0.09,
        iy + 1.35 - 0.02,
        ins.z + Math.cos(0.6) * 0.09,
        0.2,
        0.2,
        0.04,
        14,
        { rx: Math.PI / 2, ry: 0.6, hSeg: 1 },
      );
      for (let i = 0; i < 12; i++) {
        const a = (i * Math.PI) / 6,
          r0 = 0.24,
          r1 = 0.34;
        const p0 = new THREE.Vector3(Math.cos(a) * r0, Math.sin(a) * r0, 0.1),
          p1 = new THREE.Vector3(Math.cos(a) * r1, Math.sin(a) * r1, 0.1);
        const M = LB.m4(ins.x, iy + 1.35, ins.z, 0.6);
        b.rod("gold", p0.applyMatrix4(M), p1.applyMatrix4(M), 0.015, 4);
      }
      const ink = LB.texMat(
        "lb_sirocco_inscr",
        LB.canvasTex("lb_sirocco_inscr", 256, 128, (ctx, w, h) => {
          ctx.clearRect(0, 0, w, h);
          ctx.fillStyle = "rgba(236,228,206,0.9)";
          ctx.textAlign = "center";
          ctx.font = "bold 19px Georgia, serif";
          ctx.fillText("HERE THE SECOND SUN", w / 2, 40);
          ctx.fillText("CAME DOWN TO SLEEP.", w / 2, 68);
          ctx.font = "italic bold 24px Georgia, serif";
          ctx.fillText("D.", w / 2, 104);
        }),
        {},
      );
      b.quad(
        ink,
        ins.x + Math.sin(0.6) * 0.085,
        iy + 0.72,
        ins.z + Math.cos(0.6) * 0.085,
        1.1,
        0.55,
        { ry: 0.6 },
      );
      // candle stubs at its foot: the March pilgrimages
      for (let k = 0; k < 9; k++)
        b.cyl(
          "bone",
          ins.x + Math.sin(0.6) * 0.5 + ((k % 3) - 1) * 0.18,
          iy,
          ins.z + Math.cos(0.6) * 0.5 + (Math.floor(k / 3) - 1) * 0.16,
          0.035,
          0.045,
          0.05 + (k % 4) * 0.03,
          6,
          { hSeg: 1, grime: 0.6 },
        );

      // ---- colliders (hull, tail, slab, cradle uprights) ----
      LB.col(X(-2.6), Z(0), 9, 3.0, y0 - 0.5, y0 + 2.4, 0, {
        walkable: false,
        surface: "metal",
      });
      LB.col(X(6.6), Z(-0.9), 7, 2.8, y0 - 0.5, y0 + 2.4, 0.32, {
        walkable: false,
        surface: "metal",
      });
      LB.col(ins.x, ins.z, 1.3, 0.3, iy, iy + 1.7, 0.6, {
        walkable: false,
        surface: "metal",
      });
      for (const dx of [0.9, 3.9])
        LB.col(X(dx), Z(2.5), 0.15, 1.7, y0, y0 + 0.8, 0, {
          walkable: false,
          surface: "metal",
        });

      anchors.sirocco_wreck = LB.anchor(X(0), y0, Z(0), 0);
      anchors.sirocco_zeke = LB.anchor(X(0.2), y0, Z(5.4), 0);
      anchors.sirocco_rose = LB.anchor(X(3.5), y0, Z(5.2), 0);
      anchors.sirocco_slab = LB.anchor(
        ins.x - Math.sin(0.6) * 1.4,
        iy,
        ins.z - Math.cos(0.6) * 1.4,
        0,
      );
      anchors.cockpit = LB.anchor(X(-6.4), y0, Z(1.8), Math.PI);
      const g = b.build(root);
      g.name = "sirocco_wreck";
      LB.register("north_woods", g, anchors);
    },
    60,
  );
