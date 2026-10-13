// play-inline-144 05 — math
// Lines 1014-1398 of readable/play-inline-144.pretty.js (statement-aligned).
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
