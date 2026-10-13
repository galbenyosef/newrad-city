/* src/landmarks_b/60_centralpark.js */
/* =====================================================================
 * LANDMARKS B — CENTRAL PARK FEATURES
 *  • Bethesda Terrace: raised upper terrace with the Minton-tile arcade
 *    beneath, twin grand staircases, lower plaza, the Angel of the Waters
 *    fountain (bronze angel with spread wings over a toxic pool), lake
 *    balustrade and boat landing.
 *  • Bow Bridge: cast-iron arched footbridge over The Lake with the
 *    interlocking-ring railing, urn planters, walkable step colliders.
 *  • Belvedere Castle: Vista Rock outcrop, stair up, castle hall shell
 *    (the walk-in weather station inside is 60_centralpark_interior.js),
 *    tower with turret & flag, pavilion, terrace.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // encaustic Minton tile ceiling texture for the arcade
  function mintonTex() {
    return LB.canvasTex("lb_minton", 256, 256, (ctx, w, h) => {
      const n = 4,
        s = w / n;
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++) {
          const x = i * s,
            y = j * s;
          ctx.fillStyle = (i + j) % 2 ? "#b8894a" : "#c9a468";
          ctx.fillRect(x, y, s, s);
          ctx.fillStyle = "#7a2e22";
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.36, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#1f4a5a";
          for (let k = 0; k < 4; k++) {
            const a = (k * Math.PI) / 2;
            ctx.beginPath();
            ctx.ellipse(
              x + s / 2 + Math.cos(a) * s * 0.2,
              y + s / 2 + Math.sin(a) * s * 0.2,
              s * 0.12,
              s * 0.07,
              a,
              0,
              TAU,
            );
            ctx.fill();
          }
          ctx.fillStyle = "#e8d8a8";
          ctx.beginPath();
          ctx.arc(x + s / 2, y + s / 2, s * 0.07, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#3a2a1a";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, s, s);
        }
      const r = G.util.rng(5);
      for (let i = 0; i < 60; i++) {
        ctx.fillStyle = "rgba(40,30,20," + r() * 0.35 + ")";
        ctx.fillRect(r() * w, r() * h, 4 + r() * 30, 4 + r() * 30);
      }
    });
  }

  // =====================================================================
  // BETHESDA TERRACE + ANGEL OF THE WATERS
  // =====================================================================
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
  LB.addBuilder(
    "bow_bridge",
    function (LB, site, root) {
      // Calvert Vaux's cast-iron Bow Bridge: a shallow bowed iron span (cream paint, flaking to rust) between granite
      // abutments, fascia of stacked rings between the arch rib and the deck, the interlaced-ring railing with its
      // urn planters. The lake here is wider than the real one, so granite causeways carry the approaches and the
      // iron bow keeps its real, readable proportion (≈38 m span, 2.6 m rise).
      const b = LB.batch("bow_bridge");
      const anchors = {};
      const X = -20,
        ZA = -582,
        ZB = -648,
        W = 3.6,
        RISE = 2.6;
      const hA = LB.terrain(X, ZA + 2),
        hB = LB.terrain(X, ZB - 2);
      const zS = ZA - 13,
        zN = ZB + 13; // abutment faces (south / north)
      const hS = Math.max(hA, hB, -0.2) + 0.55; // springing deck level
      b.ground = -1.2;
      b.aoH = 2;
      const deckAt = (z) => {
        if (z >= zS)
          return hA + (hS - hA) * LB.smooth(0, 1, (ZA - z) / (ZA - zS)) + 0.05;
        if (z <= zN)
          return hB + (hS - hB) * LB.smooth(0, 1, (z - ZB) / (zN - ZB)) + 0.05;
        return hS + RISE * Math.sin((Math.PI * (zS - z)) / (zS - zN)) + 0.05;
      };
      const ribAt = (z) =>
        hS - 1.8 + (RISE + 1.0) * Math.sin((Math.PI * (zS - z)) / (zS - zN));
      const inSpan = (z) => z < zS && z > zN;
      const L = ZA - ZB,
        N = 60,
        dz = L / N;
      const cream = "paint_cream";
      const r = LB.rng("bow_bridge");
      for (let i = 0; i < N; i++) {
        const z0 = ZA - dz * i,
          z1 = z0 - dz,
          zm = (z0 + z1) / 2;
        const y0 = deckAt(z0),
          y1 = deckAt(z1),
          ym = (y0 + y1) / 2;
        const ang = Math.atan2(y1 - y0, z0 - z1);
        b.add("planks", new THREE.BoxGeometry(W, 0.16, dz + 0.02), {
          m: LB.m4(X, ym - 0.08, zm, 0, ang),
          grime: 0.5,
          noAO: true,
        });
        if (inSpan(zm)) {
          for (const s of [-1, 1]) {
            // deck fascia girder + the bowed arch rib below it
            b.add(cream, new THREE.BoxGeometry(0.22, 0.62, dz + 0.02), {
              m: LB.m4(X + s * (W / 2 + 0.05), ym - 0.42, zm, 0, ang),
              grime: 0.55,
              noAO: true,
            });
            const ra = ribAt(Math.min(z0, zS)),
              rb = ribAt(Math.max(z1, zN));
            b.beam(
              cream,
              V(X + s * (W / 2 - 0.05), ra, Math.min(z0, zS)),
              V(X + s * (W / 2 - 0.05), rb, Math.max(z1, zN)),
              0.26,
              0.34,
              { noAO: true, grime: 0.6 },
            );
          }
          // cross girders under the deck
          if (i % 3 === 0)
            b.box("iron", X, ribAt(zm) + 0.1, zm, W - 0.2, 0.16, 0.16, {
              seg: false,
            });
        } else {
          // granite causeway under the approach deck
          const top = Math.min(y0, y1) - 0.17;
          b.boxMM(
            "granite",
            X - W / 2 - 0.55,
            -3,
            Math.min(z0, z1),
            X + W / 2 + 0.55,
            top,
            Math.max(z0, z1),
            { grime: 0.75, seg: false },
          );
          LB.colMM(
            X - W / 2 - 0.55,
            -3,
            Math.min(z0, z1),
            X + W / 2 + 0.55,
            top,
            Math.max(z0, z1),
            { walkable: false },
          );
          for (const s of [-1, 1])
            b.add("granite", new THREE.BoxGeometry(0.4, 0.3, dz + 0.02), {
              m: LB.m4(X + s * (W / 2 + 0.45), ym - 0.2, zm, 0, ang),
              grime: 0.6,
            });
        }
        // walkable deck slab (≤ 0.1 m rise per piece)
        LB.col(X, zm, W, dz + 0.05, Math.max(y0, y1) - 0.8, ym, 0, {
          surface: inSpan(zm) ? "metal" : "concrete",
        });
      }
      // fascia: stacked rings filling the spandrel between the arch rib and the deck girder (the bridge's signature)
      for (const s of [-1, 1]) {
        let z = zS - 0.2;
        while (z > zN + 0.2) {
          const gap = deckAt(z) - 0.73 - ribAt(z) - 0.17;
          const rr = Math.min(0.55, gap * 0.46);
          if (rr < 0.12) {
            z -= 0.4;
            continue;
          }
          const yc = ribAt(z) + 0.17 + gap / 2;
          b.add(cream, new THREE.TorusGeometry(rr, 0.045, 3, 12), {
            m: LB.m4(X + s * (W / 2 + 0.05), yc, z - rr, Math.PI / 2),
            grime: 0.5,
            noAO: true,
          });
          z -= rr * 2 + 0.06;
        }
      }
      // granite abutments at the springing (pier blocks with coping, cutwater nosing into the lake)
      for (const [zf, dir] of [
        [zS, 1],
        [zN, -1],
      ]) {
        b.boxMM(
          "granite",
          X - W / 2 - 1.1,
          -3,
          Math.min(zf, zf + dir * 2.4),
          X + W / 2 + 1.1,
          hS - 0.12,
          Math.max(zf, zf + dir * 2.4),
          { grime: 0.7 },
        );
        LB.colMM(
          X - W / 2 - 1.1,
          -3,
          Math.min(zf, zf + dir * 2.4),
          X + W / 2 + 1.1,
          hS - 0.12,
          Math.max(zf, zf + dir * 2.4),
          { walkable: false },
        );
        for (const s of [-1, 1]) {
          b.box(
            "granite",
            X + s * (W / 2 + 0.75),
            -3,
            zf + dir * 1.2,
            1.3,
            hS + 3 + 0.2,
            2.2,
            { seg: false, grime: 0.7 },
          );
          b.box(
            "granite",
            X + s * (W / 2 + 0.75),
            hS + 0.2,
            zf + dir * 1.2,
            1.5,
            0.22,
            2.4,
            { seg: false, grime: 0.5 },
          );
          // urn planter on the pier (dead shrub)
          b.lathe(
            cream,
            [
              [0.12, 0],
              [0.35, 0.12],
              [0.5, 0.5],
              [0.34, 0.72],
              [0.56, 0.84],
              [0.5, 0.9],
            ],
            10,
            X + s * (W / 2 + 0.75),
            hS + 0.42,
            zf + dir * 1.2,
            { grime: 0.6 },
          );
          b.rock(
            "dirt",
            X + s * (W / 2 + 0.75),
            hS + 1.22,
            zf + dir * 1.2,
            0.4,
            { flat: 0.4 },
          );
          for (let k = 0; k < 3; k++)
            b.rod(
              "bark",
              V(X + s * (W / 2 + 0.75), hS + 1.25, zf + dir * 1.2),
              V(
                X + s * (W / 2 + 0.75) + (r() - 0.5) * 0.8,
                hS + 1.9 + r() * 0.5,
                zf + dir * 1.2 + (r() - 0.5) * 0.8,
              ),
              0.03,
              4,
              { r2: 0.01 },
            );
          LB.col(
            X + s * (W / 2 + 0.75),
            zf + dir * 1.2,
            1.3,
            2.2,
            -3,
            hS + 1.4,
            0,
            { walkable: false },
          );
        }
      }
      // railings: posts with ball finials, top & bottom rails, interlaced rings between (cream paint over rust)
      for (const s of [-1, 1]) {
        const xs = X + s * (W / 2 + 0.05);
        const RN = Math.round(L / 0.44);
        for (let i = 0; i < RN; i++) {
          const za = ZA - (L * i) / RN,
            zb = ZA - (L * (i + 1)) / RN;
          const ya = deckAt(za),
            yb = deckAt(zb);
          b.beam(cream, V(xs, ya + 1.0, za), V(xs, yb + 1.0, zb), 0.08, 0.1, {
            noAO: true,
            grime: 0.5,
          });
          b.beam(
            cream,
            V(xs, ya + 0.14, za),
            V(xs, yb + 0.14, zb),
            0.06,
            0.06,
            { noAO: true, grime: 0.6 },
          );
          // two overlapping ring rows → the interlaced pattern
          const zm = (za + zb) / 2,
            ym = (ya + yb) / 2;
          if (!(r() < 0.04))
            b.add(cream, new THREE.TorusGeometry(0.3, 0.022, 3, 10), {
              m: LB.m4(xs, ym + 0.57, zm, Math.PI / 2),
              grime: 0.45,
              noAO: true,
            });
          if (i % 5 === 0) {
            b.box(cream, xs, ya, za, 0.12, 1.12, 0.12, {
              seg: false,
              grime: 0.5,
            });
            b.sphere(cream, xs, ya + 1.2, za, 0.08, { ws: 6, hs: 4 });
          }
        }
        // railing colliders (per deck piece)
        for (let i = 0; i < N; i++) {
          const z0 = ZA - dz * i,
            z1 = z0 - dz,
            y0 = deckAt(z0),
            y1 = deckAt(z1);
          LB.col(
            xs,
            (z0 + z1) / 2,
            0.25,
            dz + 0.05,
            Math.min(y0, y1) - 0.3,
            Math.max(y0, y1) + 1.05,
            0,
            { walkable: false },
          );
        }
        // end posts with urn planters on the banks
        for (const [z, y] of [
          [ZA, deckAt(ZA)],
          [ZB, deckAt(ZB)],
        ]) {
          b.box(cream, xs, y - 0.1, z, 0.5, 1.3, 0.5, {
            seg: false,
            grime: 0.6,
          });
          b.lathe(
            cream,
            [
              [0.1, 0],
              [0.35, 0.15],
              [0.45, 0.5],
              [0.3, 0.7],
              [0.5, 0.8],
            ],
            10,
            xs,
            y + 1.2,
            z,
            { grime: 0.6 },
          );
          b.rock("dirt", xs, y + 1.9, z, 0.35, { flat: 0.5 });
        }
      }
      // stone landings at both ends
      for (const [z, h] of [
        [ZA + 1.5, hA],
        [ZB - 1.5, hB],
      ]) {
        b.boxMM(
          "granite",
          X - W / 2 - 1,
          -3,
          z - 2,
          X + W / 2 + 1,
          h + 0.05,
          z + 2,
          { grime: 0.7, ground: -1.2 },
        );
        LB.colMM(X - W / 2 - 1, -3, z - 2, X + W / 2 + 1, h + 0.05, z + 2);
      }
      anchors.north_end = V(X, hB, ZB - 3);
      anchors.south_end = V(X, hA, ZA + 3);
      anchors.center = V(X, deckAt((ZA + ZB) / 2), (ZA + ZB) / 2);
      anchors.entrance = anchors.south_end.clone();
      const g = b.build(root, { noLOD: true });
      g.name = "bow_bridge";
      LB.register("bow_bridge", g, anchors);
    },
    61,
  );

  // =====================================================================
  // BELVEDERE CASTLE
  // =====================================================================
  LB.addBuilder(
    "belvedere",
    function (LB, site, root) {
      const K = LB.kit;
      const b = LB.batch("belvedere");
      const anchors = {};
      const h = Math.max(
        LB.terrain(-20, -700),
        LB.terrain(-30, -700),
        LB.terrain(-10, -700),
        LB.terrain(-20, -690),
        LB.terrain(-20, -712),
      );
      const T = h + 6; // plateau top
      b.ground = h;
      b.aoH = 3;
      // ---- Vista Rock: plateau polygon + rock boulders dressing the sides
      const plate = [
        [-37, -712],
        [-30, -716.5],
        [-12, -716.5],
        [-2.5, -709],
        [-2, -690],
        [-8, -685.5],
        [-30, -685.5],
        [-36.5, -692],
      ];
      K.prism(b, "rock", K.offsetPoly(plate, -1.6), h - 2, T - 0.3, {
        grime: 0.5,
      });
      K.prism(b, "schist", K.offsetPoly(plate, -0.2), T - 0.3, T, {
        grime: 0.5,
        noAO: true,
        uvScale: 2.5,
      });
      LB.fillPoly(plate, 0, 0, 0, h - 2, T, 1.5, { surface: "concrete" });
      K.cliff(b, "rock", plate, h - 1.2, T - 0.1, {
        amp: 1.3,
        flare: 3.0,
        seed: 4.2,
        step: 0.8,
      });
      const r = LB.rng("vista_rock");
      for (let i = 0; i < plate.length; i++) {
        const p = plate[i],
          q = plate[(i + 1) % plate.length];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const n = Math.max(1, Math.round(len / 6));
        for (let k = 0; k < n; k++) {
          const t = (k + r()) / n,
            x = p[0] + (q[0] - p[0]) * t,
            z = p[1] + (q[1] - p[1]) * t;
          const cx = (x + 20) * 0.22,
            cz = (z + 700) * 0.22;
          if (x < -35 && z > -697 && z < -689) continue; // keep the stair clear
          b.rock("rock", x + cx, h + 0.2, z + cz, 0.8 + r() * 1.1, {
            sy: 0.6 + r() * 0.3,
            seed: i * 11 + k,
            rough: 0.7,
            detail: 0,
          });
        }
      }
      // ---- stair up the west face (from the west lawn side)
      LB.stairs(b, "schist", -45.5, -693, Math.PI / 2, 3.2, 9, h, T, {
        base: h - 1,
        cheeks: "schist",
      });
      // ---- terrace walls (crenellated) along the south & east edges
      const wallH = 1.3;
      LB.crenels(b, "schist", -30, -685.8, -8, -685.8, T, 0.6, wallH, 0.8, 0.6);
      LB.crenels(b, "schist", -8, -685.8, -2.3, -690, T, 0.6, wallH, 0.8, 0.6);
      LB.crenels(b, "schist", -2.3, -690, -2.8, -709, T, 0.6, wallH, 0.8, 0.6);
      LB.crenels(
        b,
        "schist",
        -36.3,
        -692,
        -30,
        -685.8,
        T,
        0.6,
        wallH,
        0.8,
        0.6,
      );
      for (const [a, c] of [
        [
          [-30, -685.8],
          [-8, -685.8],
        ],
        [
          [-8, -685.8],
          [-2.3, -690],
        ],
        [
          [-2.3, -690],
          [-2.8, -709],
        ],
        [
          [-36.3, -692],
          [-30, -685.8],
        ],
      ])
        LB.colWall(a[0], a[1], c[0], c[1], 0.6, T - 0.2, T + wallH, {
          walkable: false,
        });
      // ---- the castle hall (walk-in weather station)
      const H0 = T,
        HX0 = -31,
        HX1 = -15,
        HZ0 = -712,
        HZ1 = -701;
      K.room(
        b,
        "schist",
        HX0,
        HZ0,
        HX1,
        HZ1,
        H0,
        H0 + 6.5,
        0.8,
        [{ side: "s", c: -23, w: 1.8, h: 2.8 }],
        { grime: 0.55 },
      );
      b.boxMM(
        "granite",
        HX0 - 0.2,
        H0 + 6.5,
        HZ0 - 0.2,
        HX1 + 0.2,
        H0 + 7.0,
        HZ1 + 0.2,
        { seg: false, grime: 0.4 },
      );
      LB.colMM(HX0, H0 + 6.5, HZ0, HX1, H0 + 7.0, HZ1, { walkable: false });
      for (const [a, c] of [
        [
          [HX0, HZ1],
          [HX1, HZ1],
        ],
        [
          [HX1, HZ1],
          [HX1, HZ0],
        ],
        [
          [HX1, HZ0],
          [HX0, HZ0],
        ],
        [
          [HX0, HZ0],
          [HX0, HZ1],
        ],
      ])
        LB.crenels(
          b,
          "schist",
          a[0],
          a[1],
          c[0],
          c[1],
          H0 + 7.0,
          0.5,
          1.2,
          0.7,
          0.5,
        );
      for (const x of [-28, -18])
        K.lancet(
          b,
          "glass_dark",
          "granite",
          x,
          H0 + 2.2,
          HZ1 + 0.03,
          1.1,
          2.6,
          0,
        );
      for (const x of [-27, -19])
        K.lancet(
          b,
          "glass_broken",
          "granite",
          x,
          H0 + 2.2,
          HZ0 - 0.03,
          1.1,
          2.6,
          Math.PI,
        );
      K.lancet(
        b,
        "glass_dark",
        "granite",
        HX1 + 0.03,
        H0 + 2.2,
        -706.5,
        1.1,
        2.6,
        Math.PI / 2,
      );
      b.quad("rotten", -23, H0 + 1.4, HZ1 + 0.45, 1.7, 2.7, {
        rx: 0,
        ry: 0.9,
        uv: "box",
      }); // door ajar
      // interior: the weather-station hall (instruments, desk, bunk, giant-roach mess, hall anchors) — 60_centralpark_interior.js
      const ix = { anchors, H0, b };
      LB.interiorPart("belvedere", "hall", ix);
      const wbK = LB.texMat(
        "belv_sign",
        LB.signTex(
          "belv_sign",
          ["U.S. WEATHER BUREAU", "CENTRAL PARK STATION"],
          "enamel",
          512,
          160,
          { bg: "#2d3b4a" },
        ),
      );
      b.quad(wbK, -23, H0 + 3.6, HZ1 + 0.44, 2.6, 0.8, {});
      // ---- the tower (west end) + octagonal turret + flag
      const TX0 = -36.2,
        TX1 = -30.2,
        TZ0 = -711.5,
        TZ1 = -705.5,
        TH = H0 + 15;
      b.boxMM("schist", TX0, h + 1, TZ0, TX1, TH, TZ1, {
        grime: 0.5,
        segLen: 3,
      });
      for (const [a, c] of [
        [
          [TX0, TZ1],
          [TX1, TZ1],
        ],
        [
          [TX1, TZ1],
          [TX1, TZ0],
        ],
        [
          [TX1, TZ0],
          [TX0, TZ0],
        ],
        [
          [TX0, TZ0],
          [TX0, TZ1],
        ],
      ])
        LB.crenels(b, "schist", a[0], a[1], c[0], c[1], TH, 0.5, 1.3, 0.7, 0.5);
      b.boxMM(
        "granite",
        TX0 - 0.25,
        TH - 0.4,
        TZ0 - 0.25,
        TX1 + 0.25,
        TH,
        TZ1 + 0.25,
        { seg: false },
      );
      for (const y of [H0 + 3, H0 + 7.5, H0 + 11]) {
        K.lancet(
          b,
          "glass_dark",
          "granite",
          (TX0 + TX1) / 2,
          y,
          TZ1 + 0.03,
          0.8,
          2.2,
          0,
        );
        K.lancet(
          b,
          "glass_broken",
          "granite",
          TX0 - 0.03,
          y,
          (TZ0 + TZ1) / 2,
          0.8,
          2.2,
          -Math.PI / 2,
        );
      }
      LB.colMM(TX0, h + 1, TZ0, TX1, TH + 1.3, TZ1, { walkable: false });
      b.cyl("schist", TX0 + 0.2, TH - 5, TZ1 - 0.2, 1.1, 1.1, 7, 8, {
        hSeg: 2,
      });
      b.cyl("copper_roof", TX0 + 0.2, TH + 2, TZ1 - 0.2, 0.05, 1.35, 2.2, 8, {
        hSeg: 1,
      });
      b.cyl("iron", (TX0 + TX1) / 2, TH, (TZ0 + TZ1) / 2, 0.06, 0.08, 7, 6, {
        hSeg: 1,
      });
      const flag = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 3.2, 1.8) : null;
      if (flag) {
        flag.position.set((TX0 + TX1) / 2, TH + 6.9, (TZ0 + TZ1) / 2);
        root.add(flag);
        LB.animate(flag.position, 300, (t) => flag.userData.wave(t));
      }
      // weather vane / anemometer on the hall roof (spins)
      const vane = new THREE.Group();
      {
        const vb = LB.batch("belv_vane");
        for (let i = 0; i < 3; i++) {
          const a = (i / 3) * TAU;
          vb.beam(
            "iron",
            V(0, 0, 0),
            V(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8),
            0.04,
          );
          vb.sphere("chrome", Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8, 0.14, {
            phiLen: Math.PI / 2,
          });
        }
        vb.build(vane);
        vane.position.set(-17, H0 + 9.2, -703);
        root.add(vane);
        b.cyl("iron", -17, H0 + 7, -703, 0.04, 0.05, 2.2, 5, { hSeg: 1 });
        LB.animate(vane.position, 250, (t) => {
          vane.rotation.y = t * 2.2;
        });
      }
      // ---- open pavilion (east end): timber posts, pointed roof
      const PX = -8.5,
        PZ = -702;
      for (const [dx, dz] of [
        [-2.5, -2.5],
        [2.5, -2.5],
        [-2.5, 2.5],
        [2.5, 2.5],
      ]) {
        b.box("rotten", PX + dx, T, PZ + dz, 0.3, 3.4, 0.3, { seg: false });
        LB.col(PX + dx, PZ + dz, 0.35, 0.35, T, T + 3.4, 0, {
          walkable: false,
        });
      }
      const roof = new THREE.ConeGeometry(4.4, 3.2, 4, 1);
      roof.rotateY(Math.PI / 4);
      b.add("rotten", roof, { m: LB.m4(PX, T + 3.4 + 1.6, PZ), grime: 0.5 });
      b.cyl("iron", PX, T + 6.6, PZ, 0.02, 0.05, 1.0, 4, { hSeg: 1 });
      LB.railing(
        b,
        [
          [PX - 2.5, PZ - 2.5],
          [PX + 2.5, PZ - 2.5],
          [PX + 2.5, PZ + 2.5],
        ],
        T,
        0.9,
        "rotten",
        { postStep: 1.2 },
      );
      LB.bench(b, PX - 1, T, PZ + 1.5, Math.PI);
      // terrace clutter: telescope, skeleton, sandbags from an old last stand
      b.cyl("iron", -14, T, -688.5, 0.05, 0.08, 1.2, 5, { hSeg: 1 });
      b.cyl("chrome", -14, T + 1.2, -688.4, 0.14, 0.18, 0.9, 8, {
        hSeg: 1,
        rx: 1.1,
      });
      LB.skeleton(b, -20, T + 0.05, -690, 0.8);
      LB.sandbags(b, -27, -689, -22, -689, 2, { y: T });
      anchors.entrance = V(-47, h, -693);
      anchors.terrace = V(-18, T, -692);
      anchors.tower = V(-33, T, -703);
      anchors.pavilion = V(PX, T, PZ);
      anchors.spawn1 = V(-22, T, -694);
      anchors.spawn2 = V(-10, T, -706);
      LB.interiorPart("belvedere", "spawn", ix); // spawn3 inside the hall
      anchors.spawn4 = V(-44, h, -700);
      LB.interiorPart("belvedere", "finish", ix); // boss / note / loot anchors in the hall, its props at initDone
      const g = b.build(root);
      g.name = "belvedere";
      LB.register("belvedere", g, anchors);
      LB.plaque(
        V(-44.5, h + 1.3, -695.2),
        "Belvedere Castle",
        '"A Victorian folly built to be admired rather than used (1869). Later home of the U.S. Weather Bureau. Today\'s forecast: ash, with a chance of giant roaches."',
      );
    },
    62,
  );
})();
