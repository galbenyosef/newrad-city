// play-inline-144 03 — math
// Lines 72-680 of readable/play-inline-144.pretty.js (statement-aligned).
  LB.addBuilder(
    "bethesda",
    function (LB, site, root) {
      const K = LB.kit;
      const b = LB.batch("bethesda");
      const anchors = {};
      const h0 = Math.max(
        LB.terrain(0, -560),
        LB.terrain(0, -575),
        LB.terrain(0, -545),
      );
      b.ground = h0;
      b.aoH = 2.5;
      const UP = h0 + 3.0; // upper terrace level
      const ZS = -536,
        ZT0 = -540.5,
        ZT1 = -553,
        ZL = -557,
        ZLAKE = -582;
      // ---- south steps up to the upper terrace
      LB.stairs(b, "buffstone", 0, ZS + 0.5, Math.PI, 18, 4.5, h0, UP, {
        base: h0 - 1,
      });
      // ---- upper terrace platform (three pieces around the stair wells) + arcade hollow
      const plat = (x0, z0, x1, z1) => {
        b.boxMM("buffstone", x0, h0 - 1, z0, x1, UP, z1, {
          grime: 0.55,
          segLen: 3,
        });
        LB.colMM(x0, h0 - 1, z0, x1, UP, z1);
      };
      plat(-25, ZT1, -16, ZT0);
      plat(16, ZT1, 25, ZT0);
      plat(-16, -545, 16, ZT0); // over the stair heads / arcade roof
      plat(-9, ZT1, -7, -545);
      plat(7, ZT1, 9, -545);
      // arcade: roof slab + back wall; hollow x -7..7, z -553..-545, ceiling at UP-0.5
      b.boxMM("buffstone", -7, UP - 0.5, ZT1, 7, UP, -545, { seg: false });
      LB.colMM(-7, UP - 0.5, ZT1, 7, UP, -545);
      b.boxMM("buffstone", -7, h0, -545.6, 7, UP - 0.5, -545, { seg: false });
      const minK = LB.texMat("minton", mintonTex(), { rough: 0.5 });
      const ceil = new THREE.PlaneGeometry(14, 8, 1, 1);
      ceil.rotateX(Math.PI / 2);
      b.add(minK, ceil, {
        m: LB.m4(0, UP - 0.52, (ZT1 - 545) / 2),
        uv: "keep",
        us: 5,
        vs: 3,
        grime: 0.2,
      });
      // arcade facade: 3 round arches facing the plaza (north) + piers
      for (const x of [-7, -2.5, 2.5, 7]) {
        b.box("buffstone", x, h0, ZT1 - 0.2, 1.4, UP - h0, 0.9, {
          seg: false,
          grime: 0.5,
        });
        LB.col(x, ZT1 - 0.2, 1.4, 0.9, h0, UP, 0, { walkable: false });
      }
      for (const x of [-4.75, 0, 4.75]) {
        b.add(
          "buffstone",
          new THREE.RingGeometry(1.55, 2.0, 12, 1, 0, Math.PI),
          { m: LB.m4(x, h0 + 1.0, ZT1 - 0.66, Math.PI), grime: 0.4 },
        );
        b.boxMM(
          "buffstone",
          x - 2.0,
          h0 + 1.0 + 1.55,
          ZT1 - 0.65,
          x + 2.0,
          UP - 0.5,
          ZT1 + 0.2,
          { seg: false },
        );
      }
      // the arcade is lived in: lanterns hung in each arch and a squatters' fire, so the arches read from the plaza
      for (const x of [-4.75, 0, 4.75]) {
        b.cyl("iron", x, UP - 1.5, ZT1 - 0.4, 0.015, 0.015, 1.0, 4, {
          hSeg: 1,
        });
        b.cyl("iron", x, UP - 1.95, ZT1 - 0.4, 0.14, 0.17, 0.45, 6, {
          hSeg: 1,
        });
        b.sphere("lamp", x, UP - 1.72, ZT1 - 0.4, 0.1, {
          ws: 6,
          hs: 4,
          noAO: true,
          grime: 0,
        });
        LB.glows.push({
          pos: V(x, UP - 1.72, ZT1 - 0.5),
          color: 0xffc070,
          size: 2.2,
        });
      }
      LB.barrel(b, -3.2, h0 + 0.05, -549.5, { fire: true });
      // balustrade along the terrace edge (overlooking the plaza) — with openings at the stair heads
      K.balustrade(
        b,
        "buffstone",
        [
          [-25, ZT1 + 0.25],
          [-16, ZT1 + 0.25],
        ],
        UP,
        1.0,
        { urns: true, collide: true },
      );
      K.balustrade(
        b,
        "buffstone",
        [
          [16, ZT1 + 0.25],
          [25, ZT1 + 0.25],
        ],
        UP,
        1.0,
        { urns: true, collide: true },
      );
      K.balustrade(
        b,
        "buffstone",
        [
          [-9, ZT1 + 0.25],
          [9, ZT1 + 0.25],
        ],
        UP,
        1.0,
        { urns: true, collide: true },
      );
      K.balustrade(
        b,
        "buffstone",
        [
          [-25, ZT1],
          [-25, ZT0],
        ],
        UP,
        1.0,
        { collide: true },
      );
      K.balustrade(
        b,
        "buffstone",
        [
          [25, ZT1],
          [25, ZT0],
        ],
        UP,
        1.0,
        { collide: true },
      );
      // grand staircases (north, down to the plaza) with carved cheek walls
      LB.stairs(b, "buffstone", -12.5, -545.2, Math.PI, 7, 11.8, UP, h0, {
        base: h0 - 1,
        maxRise: 0.3,
      });
      LB.stairs(b, "buffstone", 12.5, -545.2, Math.PI, 7, 11.8, UP, h0, {
        base: h0 - 1,
        maxRise: 0.3,
      });
      for (const x of [-16.2, -8.8, 8.8, 16.2]) {
        const g = new THREE.BoxGeometry(0.7, 1.1, Math.hypot(11.8, UP - h0));
        b.add("buffstone", g, {
          m: LB.m4(
            x,
            (UP + h0) / 2 + 0.5,
            -551.1,
            0,
            -Math.atan2(UP - h0, 11.8),
          ),
          grime: 0.5,
        });
        LB.colWall(x, -545, x, -557, 0.7, h0 - 1, UP + 1, { walkable: false });
      }
      // ---- lower plaza paving + the Angel of the Waters
      b.boxMM("sidewalk", -25, h0 - 0.5, ZLAKE + 2, 25, h0 + 0.05, ZL, {
        grime: 0.55,
        noAO: true,
        uvScale: 3,
      });
      LB.colMM(-25, h0 - 0.5, ZLAKE + 2, 25, h0 + 0.05, ZL);
      const FX = 0,
        FZ = -568.5;
      K.fountain(b, FX, h0 + 0.05, FZ, 8.5, { key: "granite" });
      b.cyl("goo", FX, h0 + 0.25, FZ, 7.9, 7.9, 0.12, 40, { hSeg: 1 });
      // the pool: tide-mark staining on the inner rim, a crust of scum along the edge, floating junk
      b.lathe(
        "granite",
        [
          [7.935, 0.66],
          [7.935, 0.3],
        ],
        48,
        FX,
        h0 + 0.05,
        FZ,
        { c: 0x5a6a3a, grime: 0.9, noAO: true },
      );
      {
        const scumT = LB.canvasTex(
          "lb_scum2",
          512,
          64,
          (ctx, w, h) => {
            const r = G.util.rng(77);
            ctx.clearRect(0, 0, w, h);
            // a crust of fine froth thickening toward the rim (v = 1), olive-brown with a few pale bubbles
            for (let i = 0; i < 2600; i++) {
              const y = h * Math.pow(r(), 0.45),
                rr = 0.6 + r() * 2.2 * (0.4 + y / h);
              if (r() > 0.15 + 0.85 * Math.pow(y / h, 2.2)) continue;
              const pale = r() < 0.12;
              ctx.fillStyle = pale
                ? "rgba(190,196,140,0.9)"
                : "rgba(" +
                  ((88 + r() * 40) | 0) +
                  "," +
                  ((92 + r() * 36) | 0) +
                  "," +
                  ((40 + r() * 20) | 0) +
                  ",0.95)";
              ctx.beginPath();
              ctx.ellipse(r() * w, y, rr * 1.5, rr, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          },
          {},
        );
        const scumK = LB.texMat("beth_scum", scumT, {
          transparent: true,
          rough: 0.9,
          emissive: 0.05,
        });
        const rg = new THREE.RingGeometry(6.9, 7.93, 48, 1);
        // ring uv: u around, v across (outer edge = v 1 → the dense crust hugs the rim)
        const P = rg.attributes.position,
          UV = rg.attributes.uv;
        for (let i = 0; i < P.count; i++) {
          const x = P.getX(i),
            y = P.getY(i);
          UV.setXY(
            i,
            (Math.atan2(y, x) / (Math.PI * 2) + 0.5) * 10,
            (Math.hypot(x, y) - 6.9) / 1.03,
          );
        }
        rg.rotateX(-Math.PI / 2);
        b.add(scumK, rg, {
          m: LB.m4(FX, h0 + 0.375, FZ),
          uv: "keep",
          grime: 0.2,
          noAO: true,
        });
        const rd = LB.rng("beth_debris");
        for (let i = 0; i < 7; i++) {
          const a = rd() * Math.PI * 2,
            rr = 4.2 + rd() * 3.2,
            x = FX + Math.cos(a) * rr,
            z = FZ + Math.sin(a) * rr,
            y = h0 + 0.37;
          const kind = i % 4;
          if (kind === 0)
            b.box("rotten", x, y - 0.06, z, 1.4 + rd(), 0.1, 0.22, {
              ry: rd() * 3,
              rx: 0.05,
              seg: false,
              grime: 0.6,
            });
          else if (kind === 1) {
            const tg = new THREE.TorusGeometry(0.32, 0.12, 5, 10);
            tg.rotateX(Math.PI / 2 + 0.2);
            b.add("tire", tg, { m: LB.m4(x, y + 0.02, z), noAO: true });
          } else if (kind === 2) {
            b.cyl("paint_red", x, y - 0.3, z, 0.3, 0.3, 0.9, 10, {
              hSeg: 1,
              rz: Math.PI / 2 - 0.1,
              ry: rd() * 3,
              grime: 0.8,
            });
          } else b.sphere("bone", x, y, z, 0.13, { sx: 1, sy: 1.1, sz: 1.2 });
        }
      }
      try {
        G.world.addRadSource({
          x: FX,
          y: h0 + 0.5,
          z: FZ,
          radius: 9,
          strength: 2.0,
        });
      } catch (e) {
        /* */
      }
      // pedestal column + lower & upper basins
      b.lathe(
        "granite",
        [
          [1.6, 0],
          [1.3, 0.5],
          [0.9, 1.0],
          [0.95, 2.3],
          [1.2, 2.6],
        ],
        16,
        FX,
        h0 + 0.05,
        FZ,
        { grime: 0.5 },
      );
      b.lathe(
        "bronze_patina",
        [
          [0.8, 0],
          [3.4, 0.35],
          [3.6, 0.7],
          [3.1, 0.75],
          [0.8, 0.5],
        ],
        24,
        FX,
        h0 + 2.6,
        FZ,
        { grime: 0.25 },
      );
      b.lathe(
        "bronze_patina",
        [
          [0.4, 0],
          [1.2, 0.8],
          [1.0, 1.8],
          [1.9, 2.1],
          [2.0, 2.4],
          [1.6, 2.45],
          [0.4, 2.3],
        ],
        20,
        FX,
        h0 + 3.3,
        FZ,
        { grime: 0.25 },
      );
      // four cherubs around the pedestal
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4,
          cx = FX + Math.cos(a) * 1.2,
          cz = FZ + Math.sin(a) * 1.2;
        b.sphere("bronze_patina", cx, h0 + 1.5, cz, 0.35, { sy: 1.2 });
        b.sphere("bronze_patina", cx, h0 + 2.1, cz, 0.22, {});
        b.sphere(
          "bronze_patina",
          cx + Math.cos(a) * 0.1,
          h0 + 1.9,
          cz + Math.sin(a) * 0.1,
          0.12,
          { sx: 2.4, sy: 0.6, sz: 1.2, ry: -a },
        );
      }
      // the Angel of the Waters: a sculpted robe (parametric, folded), head with hair knot, the blessing right arm
      // stretched over the pool, the lily in the left hand and two great feathered wings swept up and back
      const AY = h0 + 5.75,
        AO = { grime: 0.12, uv: "keep" };
      const sm = LB.smooth;
      const robe = LB.surface(
        (u, v, out) => {
          const th = u * TAU,
            y = v * 2.2;
          const r =
            0.58 -
            0.22 * sm(0, 1.2, y) +
            0.08 * Math.exp(-((y - 1.65) ** 2) * 14) -
            0.2 * sm(1.85, 2.2, y);
          const folds =
            (0.06 * Math.sin(th * 9 + y * 1.3) + 0.03 * Math.sin(th * 15 - y)) *
            (1 - sm(1.0, 1.8, y));
          const k = r + folds;
          out.set(
            FX + Math.sin(th) * k * 1.0,
            AY + y,
            FZ +
              Math.cos(th) * k * 0.82 +
              (y < 0.7 ? (0.7 - y) * 0.25 * (Math.cos(th) < 0 ? -1 : 0.3) : 0),
          );
          return 0.7 + 0.3 * sm(-0.05, 0.05, folds);
        },
        40,
        22,
        { wrap: true, us: 2, vs: 1 },
      );
      b.add("bronze_patina", robe, AO);
      b.sphere("bronze_patina", FX, AY + 2.42, FZ + 0.04, 0.2, {
        sy: 1.15,
        ws: 14,
        hs: 10,
      });
      b.sphere("bronze_patina", FX, AY + 2.4, FZ - 0.14, 0.12, {
        sx: 1.2,
        ws: 10,
        hs: 8,
      }); // hair knot
      b.add(
        "bronze_patina",
        LB.organicTube(
          [
            V(FX - 0.25, AY + 2.05, FZ),
            V(FX - 0.6, AY + 2.25, FZ + 0.2),
            V(FX - 1.0, AY + 2.3, FZ + 0.45),
          ],
          (t) => 0.085 - t * 0.03,
          { radial: 8, seg: 8 },
        ),
        AO,
      );
      b.sphere("bronze_patina", FX - 1.05, AY + 2.3, FZ + 0.48, 0.07, {
        sy: 1.3,
        ws: 8,
        hs: 6,
      }); // blessing hand
      b.add(
        "bronze_patina",
        LB.organicTube(
          [
            V(FX + 0.25, AY + 2.0, FZ + 0.05),
            V(FX + 0.38, AY + 1.72, FZ + 0.25),
            V(FX + 0.3, AY + 1.62, FZ + 0.45),
          ],
          (t) => 0.08 - t * 0.02,
          { radial: 8, seg: 8 },
        ),
        AO,
      );
      b.beam(
        "bronze_patina",
        V(FX + 0.3, AY + 1.5, FZ + 0.48),
        V(FX + 0.5, AY + 2.5, FZ + 0.55),
        0.025,
        0.025,
      ); // lily stem
      for (let i = 0; i < 3; i++)
        b.sphere(
          "bronze_patina",
          FX + 0.5 + Math.cos(i * 2.1) * 0.07,
          AY + 2.55,
          FZ + 0.55 + Math.sin(i * 2.1) * 0.07,
          0.07,
          { sy: 1.6, ws: 6, hs: 5 },
        );
      // feathered wings: an extruded silhouette with scalloped primaries, rooted at the shoulder blades
      const wingShape = () => {
        const w = new THREE.Shape();
        w.moveTo(0, 0);
        w.quadraticCurveTo(0.35, 0.55, 0.9, 1.05);
        w.quadraticCurveTo(1.35, 1.45, 1.95, 1.85); // leading edge up to the tip
        const tips = [
          [1.95, 1.85],
          [1.72, 1.35],
          [1.5, 1.0],
          [1.25, 0.7],
          [1.0, 0.42],
          [0.72, 0.2],
          [0.42, 0.05],
        ];
        for (let i = 1; i < tips.length; i++) {
          const a = tips[i - 1],
            c = tips[i];
          w.quadraticCurveTo(
            (a[0] + c[0]) / 2 - 0.12,
            (a[1] + c[1]) / 2 - 0.12,
            c[0],
            c[1],
          );
        } // feather scallops
        w.quadraticCurveTo(0.2, -0.05, 0, 0);
        return w;
      };
      // wings: a covert panel plus eight long, separately tapered primaries fanned up & back — a crisp, feathered
      // silhouette against the sky instead of a single leaf shape
      const feather = (L, W) => {
        const f = new THREE.Shape();
        f.moveTo(0, 0);
        f.quadraticCurveTo(W, L * 0.35, W * 0.55, L * 0.9);
        f.lineTo(0, L);
        f.lineTo(-W * 0.35, L * 0.85);
        f.quadraticCurveTo(-W * 0.5, L * 0.3, 0, 0);
        return f;
      };
      for (const s of [-1, 1]) {
        const WM = LB.m4(
          FX + s * 0.14,
          AY + 1.8,
          FZ - 0.22,
          s > 0 ? 0.45 : Math.PI - 0.45,
          0.15,
        );
        const addW = (geo, lm) =>
          b.add("bronze_patina", geo, {
            m: new THREE.Matrix4().multiplyMatrices(WM, lm),
            grime: 0.15,
          });
        const cov = new THREE.ExtrudeGeometry(wingShape(), {
          depth: 0.07,
          bevelEnabled: true,
          bevelSize: 0.02,
          bevelThickness: 0.02,
          bevelSegments: 1,
          curveSegments: 5,
        });
        LB.deform(cov, (v) => {
          v.z += 0.12 * Math.sin(v.x * 1.4);
        });
        addW(cov, LB.m4(0, 0, 0, 0, 0, 0, 0.8, 0.8, 1));
        for (let k = 0; k < 8; k++) {
          const L = 0.95 + k * 0.16,
            ang = -0.95 + k * 0.13; // outer primaries longest & most upright
          const fg = new THREE.ExtrudeGeometry(feather(L, 0.15 + k * 0.006), {
            depth: 0.035,
            bevelEnabled: false,
            curveSegments: 4,
          });
          LB.deform(fg, (v) => {
            v.z += 0.05 * v.y * v.y;
          }); // feathers curl back at the tips
          addW(
            fg,
            LB.m4(0.55 + k * 0.1, 0.35 + k * 0.1, -0.02 - k * 0.012, 0, 0, ang),
          );
        }
      }
      LB.col(FX, FZ, 3.2, 3.2, h0, AY + 3, 0, { walkable: false });
      // plaza details: planters with dead shrubs, lamp posts, benches, skeletons
      for (const [x, z] of [
        [-18, -560],
        [18, -560],
        [-18, -576],
        [18, -576],
      ]) {
        b.box("buffstone", x, h0, z, 2.6, 0.9, 2.6, { seg: false });
        b.rock("dirt", x, h0 + 0.6, z, 0.9, { flat: 0.4 });
        LB.deadTree(b, x, h0 + 0.8, z, 3.5, x * z);
        LB.col(x, z, 2.6, 2.6, h0, h0 + 0.9, 0);
      }
      for (const [x, z] of [
        [-11, -562],
        [11, -562],
        [-11, -577],
        [11, -577],
      ])
        LB.lampPost(b, x, h0 + 0.05, z, false);
      for (const [x, z, ry] of [
        [-22, -568, Math.PI / 2],
        [22, -568, -Math.PI / 2],
      ])
        LB.bench(b, x, h0 + 0.05, z, ry);
      LB.skeleton(b, 6, h0 + 0.1, -575, 2.3);
      LB.skeleton(b, -3, h0 + 0.1, -562, 0.4);
      b.rock("dirt", -14, h0 - 0.3, -571, 1.3, { flat: 0.35 }); // burrow-rat hole
      // lake balustrade with a boat landing gap in the centre + landing steps
      K.balustrade(
        b,
        "buffstone",
        [
          [-16, ZLAKE + 2.2],
          [-4, ZLAKE + 2.2],
        ],
        h0 + 0.05,
        1.0,
        { urns: true, collide: true },
      ); // west end left open for the Bow Bridge path
      K.balustrade(
        b,
        "buffstone",
        [
          [4, ZLAKE + 2.2],
          [25, ZLAKE + 2.2],
        ],
        h0 + 0.05,
        1.0,
        { urns: true, collide: true },
      );
      LB.stairs(b, "buffstone", 0, ZLAKE + 2, Math.PI, 8, 2.4, h0, h0 - 1.0, {
        base: -3,
      });
      // rowboat wreck on the lake edge
      if (LB.buildSkiff)
        LB.buildSkiff(b, LB.m4(-6, -1.5, ZLAKE - 3.5, 1.2, 0.15, 0.3));
      anchors.fountain = V(FX + 9.5, h0, FZ);
      anchors.arcade = V(0, h0, -549);
      anchors.dog = LB.anchor(-5.5, h0, -551, Math.PI); // a stray sheltering in the arcade (quests: Biscuit)
      anchors.terrace = V(0, UP, -542.5);
      anchors.entrance = V(0, h0, ZS + 2);
      anchors.spawn1 = V(-15, h0, -566);
      anchors.spawn2 = V(15, h0, -572);
      anchors.spawn3 = V(0, h0, -549);
      anchors.spawn4 = V(-20, UP, -547);
      const g = b.build(root);
      g.name = "bethesda";
      LB.register("bethesda", g, anchors);
      LB.plaque(
        V(3, h0 + 1.2, FZ + 9.2),
        "Angel of the Waters",
        '"Commemorating the purity of the city\'s water supply (1873). The Department of Sanitation reminds visitors that the fountain is decorative and that the glow is not a lighting feature."',
      );
    },
    60,
  );

  // =====================================================================
  // BOW BRIDGE
  // =====================================================================
