/* src/poi_harbor/31_navy_dress.js */
/* =====================================================================
 * POI_HARBOR — Navy Yard quay dressing
 * The raised granite quay around the graving dock was a bare concrete
 * plate.  This adds the working yard: oil stains & puddles, weeds in the
 * joints, stacked shipping containers, steel plate & pipe stacks, cable
 * reels, drum clusters, a wrecked forklift, lamp posts, and the Pirates'
 * quay camp (tents, mattresses, fire barrels, toll signs, skull pikes).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G,
    THREE = window.THREE;
  if (!G || !THREE || !G._pharbor) return;
  const PH = G._pharbor;
  const TAU = Math.PI * 2;

  function container(b, x, y, z, ry, color, opts) {
    opts = opts || {};
    const L = 6.1,
      W = 2.44,
      H = 2.6;
    b.box("corrugated", x, y, z, L, H, W, {
      ry,
      seg: false,
      c: color,
      grime: 0.7,
    });
    // corner castings & frame rails
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const [cx, cz] = PH.rot(
          x,
          z,
          ry,
          sx * (L / 2 - 0.08),
          sz * (W / 2 - 0.08),
        );
        b.box("rust", cx, y, cz, 0.2, H + 0.02, 0.2, { ry, seg: false });
      }
    for (const yy of [y, y + H - 0.12])
      for (const sz of [-1, 1]) {
        const [cx, cz] = PH.rot(x, z, ry, 0, sz * (W / 2 - 0.02));
        b.box("rust", cx, yy, cz, L, 0.14, 0.08, { ry, seg: false });
      }
    // door end: two leaves with locking bars
    const [dx, dz] = PH.rot(x, z, ry, L / 2 + 0.02, 0);
    b.box("panel", dx, y + 0.05, dz, 0.05, H - 0.1, W - 0.12, {
      ry,
      seg: false,
      c: color,
    });
    for (const s of [-0.75, -0.3, 0.3, 0.75]) {
      const [bx, bz] = PH.rot(x, z, ry, L / 2 + 0.07, s);
      b.box("iron", bx, y + 0.1, bz, 0.05, H - 0.2, 0.05, { ry, seg: false });
    }
    if (opts.open) {
      const [ox, oz] = PH.rot(x, z, ry, L / 2 + 0.6, W / 2 + 0.4);
      b.box("panel", ox, y + 0.05, oz, 0.05, H - 0.1, W / 2, {
        ry: ry + 1.1,
        seg: false,
        c: color,
      });
    }
    PH.col(x, z, L, W, y, y + H, ry, { walkable: true, surface: "metal" });
  }

  function build(root) {
    const N = PH.NAVY;
    if (!N) return {};
    const { QY, Q, PIT } = N;
    const b = PH.batch("navy_dress");
    b.ground = QY;
    b.aoH = 3;
    const r = PH.rng("navy_dress");
    const Y = QY;
    const anchors = {};

    // ---------------- stains, puddles, weeds on the quay top ----------------
    const strips = [
      [Q.x0 + 1, Q.z0 + 1, Q.x1 - 1, PIT.z0 - 0.5],
      [Q.x0 + 1, PIT.z1 + 0.5, Q.x1 - 1, Q.z1 - 1],
    ];
    for (const [x0, z0, x1, z1] of strips) {
      for (let i = 0; i < 26; i++) {
        const cx = x0 + 3 + r() * (x1 - x0 - 6),
          cz = z0 + 1.5 + r() * (z1 - z0 - 3),
          rx = 1.2 + r() * 4.5,
          rz = 0.8 + r() * 2.5;
        const pts = [];
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * TAU,
            q = 0.6 + r() * 0.5;
          pts.push([cx + Math.cos(a) * rx * q, cz + Math.sin(a) * rz * q]);
        }
        const key = i % 3 === 0 ? "asphalt" : "concrete_dark";
        PH.groundPoly(b, key, pts, Y + 0.012 + (i % 4) * 0.003, {
          grime: 0.7,
          c: key === "asphalt" ? (i % 5 === 0 ? 0x4a4642 : 0x7a7670) : 0xffffff,
        });
      }
      // weeds along the granite coping and in the expansion joints
      for (let i = 0; i < 80; i++) {
        const x = x0 + r() * (x1 - x0),
          z =
            r() < 0.5
              ? r() < 0.5
                ? z0 + r() * 0.8
                : z1 - r() * 0.8
              : z0 + (Math.floor(r() * 4) / 4) * (z1 - z0) + 0.3;
        PH.tuft(b, x, Y, z, 0.35 + r() * 0.45, i);
      }
    }

    // ---------------- cargo on the north quay (front row z 741..747.5, clear of the crane rails) ----------------
    container(b, 578, Y, 744.5, 0, 0x7a4a30);
    container(b, 578, Y + 2.6, 744.3, 0.04, 0x3a5a6a);
    container(b, 585.4, Y, 744.6, 0.02, 0x5a6a40, { open: true });
    container(b, 596, Y, 744.2, 0.12, 0x8a7a50);
    // steel plate stacks on dunnage
    for (const [x, z, n] of [
      [566.5, 743, 7],
      [566.5, 747, 4],
      [603, 743.5, 9],
    ]) {
      for (const dx of [-1.2, 0, 1.2])
        b.box("rotten", x + dx, Y, z, 0.2, 0.15, 3.0, { seg: false });
      for (let k = 0; k < n; k++)
        b.box(
          "rust",
          x + (r() - 0.5) * 0.15,
          Y + 0.15 + k * 0.08,
          z,
          3.6,
          0.07,
          2.8,
          { ry: (r() - 0.5) * 0.05, seg: false, grime: 0.8 },
        );
      PH.col(x, z, 3.6, 3.0, Y, Y + 0.15 + n * 0.08, 0, {
        walkable: true,
        surface: "metal",
      });
    }
    // oil drums (cola-red, olive, rust) clusters + a leaking one
    const drums = (x, z, n) => {
      for (let k = 0; k < n; k++) {
        const a = r() * TAU,
          d = r() * 1.3,
          px = x + Math.cos(a) * d,
          pz = z + Math.sin(a) * d;
        if (r() < 0.2) {
          b.cyl("metal", px, Y + 0.3, pz, 0.3, 0.3, 0.88, 12, {
            rz: Math.PI / 2,
            ry: r() * 3,
            hSeg: 1,
            c: 0x6a6a40,
          });
          continue;
        }
        b.cyl("metal", px, Y, pz, 0.3, 0.3, 0.88, 12, {
          hSeg: 1,
          c: [0x8a3a2a, 0x5a6038, 0x7a5a3a, 0x4a5a6a][k % 4],
        });
      }
      PH.col(x, z, 3, 3, Y, Y + 0.9, 0, { walkable: false });
    };
    drums(626, 743.5, 7);
    drums(672, 745, 5);
    drums(700, 811, 6);
    PH.groundPoly(
      b,
      "asphalt",
      [
        [623, 745.6],
        [627.5, 746.2],
        [628.5, 747.6],
        [624, 748],
        [622.4, 746.8],
      ],
      Y + 0.02,
      { grime: 0.2, c: 0x3a3632 },
    ); // oil leak
    // cable reels & pipe bundles
    for (const [x, z, s] of [
      [662, 744, 1.3],
      [666.5, 743.2, 1.0],
      [612, 807, 1.4],
    ]) {
      for (const d of [-0.45, 0.45])
        b.cyl("wood", x, Y + s, z + d * s, s, s, 0.12, 16, {
          rx: Math.PI / 2,
          hSeg: 1,
          c: 0x9a8060,
        });
      b.cyl("rubber", x, Y + s, z, s * 0.72, s * 0.72, 0.9 * s, 16, {
        rx: Math.PI / 2,
        hSeg: 1,
      });
      PH.col(x, z, 2 * s, s * 1.1, Y, Y + 2 * s, 0, { walkable: false });
    }
    for (const [x, z, n] of [
      [683, 744, 9],
      [640, 812, 12],
    ]) {
      for (let k = 0; k < n; k++) {
        const row = Math.floor(k / 4),
          col = k % 4;
        b.cyl(
          "rust",
          x,
          Y + 0.32 + row * 0.55,
          z - 0.9 + col * 0.6 + row * 0.3,
          0.28,
          0.28,
          8,
          10,
          { rz: Math.PI / 2, hSeg: 2, grime: 0.8 },
        );
      }
      PH.col(x, z, 8, 2.6, Y, Y + 0.6 + Math.ceil(n / 4) * 0.55, 0, {
        walkable: true,
        surface: "metal",
      });
    }
    // wrecked forklift
    {
      const x = 693,
        z = 745,
        ry = 0.5;
      const P = (lx, lz) => PH.rot(x, z, ry, lx, lz);
      let [px, pz] = P(0, 0);
      b.box("paint_yellow", px, Y + 0.35, pz, 1.2, 1.0, 2.2, {
        ry,
        seg: false,
        c: 0x9a8040,
      });
      [px, pz] = P(0, 0.7);
      b.box("rust", px, Y + 1.35, pz, 1.1, 0.5, 0.8, { ry, seg: false });
      for (const s of [-1, 1]) {
        [px, pz] = P(s * 0.5, 0);
        b.rod(
          "iron",
          PH.v3(px, Y + 1.35, pz),
          PH.v3(px, Y + 2.3, pz - 0.2 * Math.cos(ry)),
          0.04,
          4,
        );
        [px, pz] = P(s * 0.55, -1.3);
        b.box("rust", px, Y, pz, 0.1, 2.5, 0.12, { ry, seg: false });
        [px, pz] = P(s * 0.3, -1.9);
        b.box("rust", px, Y + 0.05, pz, 0.12, 0.06, 1.1, { ry, seg: false });
      }
      for (const [lx, lz] of [
        [-0.62, -0.6],
        [0.62, -0.6],
        [-0.62, 0.7],
        [0.62, 0.7],
      ]) {
        [px, pz] = P(lx, lz);
        b.cyl("rubber", px, Y + 0.3, pz, 0.3, 0.3, 0.2, 10, {
          rz: Math.PI / 2,
          ry,
          hSeg: 1,
        });
      }
      [px, pz] = P(0, 0);
      PH.col(px, pz, 1.4, 2.8, Y, Y + 1.8, ry, {
        walkable: false,
        surface: "metal",
      });
      PH.crates(b, 697.5, Y, 742.8, 0.1, 5, {});
    }

    // ---------------- south quay: containers, the Pirates' camp ----------------
    container(b, 590, Y, 814, Math.PI + 0.05, 0x3a4a5a);
    container(b, 596.6, Y, 813.4, Math.PI - 0.1, 0x7a3a2a);
    container(b, 593, Y + 2.6, 813.8, Math.PI, 0x6a6a4a, { open: false });
    {
      // camp: two canvas tents, mattresses, a cook fire, string lights between lamp poles
      const tent = (x, z, ry, w, d) => {
        const hgt = 1.9;
        for (const s of [-1, 1]) {
          const [tx, tz] = PH.rot(x, z, ry, (s * w) / 4, 0);
          b.box(
            "canvas",
            tx,
            Y + hgt / 2 - 0.05,
            tz,
            Math.hypot(w / 2, hgt) + 0.1,
            0.04,
            d,
            {
              ry,
              rz: s * -Math.atan2(hgt, w / 2),
              seg: false,
              c: [0xa89a78, 0x8a8a6a][(x | 0) % 2],
            },
          );
        }
        const [fx, fz] = PH.rot(x, z, ry, 0, d / 2);
        b.rod("rotten", PH.v3(fx, Y, fz), PH.v3(fx, Y + hgt, fz), 0.04, 4);
        const [gx, gz] = PH.rot(x, z, ry, 0, -d / 2);
        b.rod("rotten", PH.v3(gx, Y, gz), PH.v3(gx, Y + hgt, gz), 0.04, 4);
        b.rod(
          "rotten",
          PH.v3(fx, Y + hgt, fz),
          PH.v3(gx, Y + hgt, gz),
          0.03,
          4,
        );
        const [mx, mz] = PH.rot(x, z, ry, 0, 0);
        b.box("fabric", mx, Y, mz, w * 0.6, 0.22, d * 0.8, {
          ry,
          seg: false,
          c: 0x6a5a48,
        });
        PH.col(mx, mz, w, d, Y, Y + hgt, ry, { walkable: false });
      };
      tent(662, 814, 0.1, 3.2, 3.6);
      tent(668, 813.2, -0.15, 3.0, 3.4);
      tent(675.5, 814.2, 0.05, 3.4, 3.8);
      for (const [x, z, ry] of [
        [680, 808.5, 0.3],
        [683, 810, -0.2],
      ])
        b.box("fabric", x, Y, z, 2.0, 0.25, 1.3, {
          ry,
          seg: false,
          c: 0x7a6a50,
        });
      b.cyl("rust", 670, Y, 808.2, 0.34, 0.34, 0.9, 10, { hSeg: 1 });
      PH.col(670, 808.2, 0.7, 0.7, Y, Y + 0.9, 0, { walkable: false });
      PH.onReady.push(() =>
        PH.safe("quay fire", () => {
          if (!G.isStub("fx") && G.fx.fire)
            G.fx.fire(PH.v3(670, Y + 0.95, 808.2), 0.6);
        }),
      );
      for (let k = 0; k < 3; k++)
        b.box("rotten", 666.5 + k * 0.1, Y, 807 + k * 1.3, 1.6, 0.42, 0.3, {
          ry: 0.2 * k,
          seg: false,
        }); // benches of planks on crates
      // string lights between two poles
      const poles = [
        [658, 810.5],
        [686, 810.5],
      ];
      for (const [x, z] of poles) {
        b.rod("rotten", PH.v3(x, Y, z), PH.v3(x, Y + 4.2, z), 0.06, 5);
        PH.col(x, z, 0.2, 0.2, Y, Y + 4.2, 0, { walkable: false });
      }
      for (let k = 0; k <= 14; k++) {
        const t = k / 14,
          x = poles[0][0] + (poles[1][0] - poles[0][0]) * t,
          sag = Math.sin(t * Math.PI) * 1.1;
        if (k < 14) {
          const t2 = (k + 1) / 14;
          b.rod(
            "black",
            PH.v3(x, Y + 4 - sag, 810.5),
            PH.v3(
              poles[0][0] + (poles[1][0] - poles[0][0]) * t2,
              Y + 4 - Math.sin(t2 * Math.PI) * 1.1,
              810.5,
            ),
            0.01,
            3,
          );
        }
        if (k % 2 === 0)
          b.sphere(
            k % 4 ? "lamp" : "lamp_red",
            x,
            Y + 3.88 - sag,
            810.5,
            0.07,
            { ws: 6, hs: 4, noAO: true },
          );
      }
      // toll sign + skull pikes at the camp's edge
      const tollK = PH.signMat(
        "navy_toll2",
        ["PIRATE WATERS", "LOITERING: 50 SCRIP", "COMPLAINING: 100 SCRIP"],
        "raider",
        512,
        256,
        { bg: "#3a2a22", fg: "#e0c8a0" },
      );
      b.box("rotten", 656, Y, 806.4, 0.14, 2.6, 0.14, { seg: false });
      b.box("rotten", 659.2, Y, 806.4, 0.14, 2.6, 0.14, { seg: false });
      b.quad(tollK, 657.6, Y + 2.0, 806.3, 3.2, 1.6, { ry: Math.PI });
      for (const x of [652, 653.6, 686.5, 688]) {
        b.rod("rotten", PH.v3(x, Y, 806), PH.v3(x, Y + 2.2, 806), 0.035, 4);
        b.sphere("bone", x, Y + 2.3, 806, 0.12, { ws: 8, hs: 6, sy: 1.15 });
      }
      anchors.pirate_camp = PH.anchor(670, Y, 806.5, 0);
      PH.propAt("footlocker", 677.5, Y, 816.5, Math.PI, { loot: "raider" });
      PH.propAt("mattress", 684.5, Y, 815.5, 0.2, {});
    }

    // ---------------- lamp posts along the quay (a few still lit), one toppled ----------------
    for (let x = 575; x < 712; x += 22)
      for (const z of [741.2, 818.8]) {
        if (z < 780 && x > 632 && x < 650) continue; // keep the head of the yard stair clear
        if ((x + z) % 3 === 0 && z > 800) {
          b.rod(
            "iron",
            PH.v3(x, Y + 0.2, z),
            PH.v3(x + 3.8, Y + 0.3, z - 1.2),
            0.1,
            6,
          );
          continue;
        }
        b.cyl("iron", x, Y, z, 0.09, 0.14, 5.2, 6, { hSeg: 1 });
        b.rod(
          "iron",
          PH.v3(x, Y + 5.1, z),
          PH.v3(x, Y + 5.3, z + (z < 780 ? 1.2 : -1.2)),
          0.05,
          4,
        );
        const lit = ((x / 22) | 0) % 3 === 1;
        b.box(
          lit ? "lamp" : "metal",
          x,
          Y + 5.05,
          z + (z < 780 ? 1.2 : -1.2),
          0.5,
          0.18,
          0.3,
          { seg: false, noAO: true },
        );
        PH.col(x, z, 0.3, 0.3, Y, Y + 5, 0, { walkable: false });
        if (lit) {
          const lz = z + (z < 780 ? 1.2 : -1.2);
          PH.onReady.push(() =>
            PH.safe("quay glow", () => {
              if (!G.isStub("fx") && G.fx.glowSprite)
                G.fx.glowSprite(PH.v3(x, Y + 4.9, lz), 0xffd8a0, 1.6, {
                  intensity: 1.0,
                  dayFactor: 0.1,
                });
            }),
          );
        }
      }

    const g = b.build(root);
    g.name = "navy_dress";
    return anchors;
  }

  PH.addBuilder(
    "navy_dress",
    function () {
      const ext = PH.navyExt; // built by 30_navy_ext (order 30); 32_navy_int registers it with these anchors
      const root =
        ext && ext.root
          ? ext.root
          : (() => {
              const g = new THREE.Group();
              g.name = "poi_navy_dress";
              G.scene.add(g);
              return g;
            })();
      const anchors = build(root);
      if (ext && ext.anchors) Object.assign(ext.anchors, anchors);
    },
    31,
  );
})();
