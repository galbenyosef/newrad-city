// play-inline-243 03 — twr
// Lines 206-572 of readable/play-inline-243.pretty.js (statement-aligned).
  PR.addBuilder(
    "roosevelt_tramway",
    function (PR2, site, rootIn) {
      const root = rootIn || G.scene;
      const b = PR.batch("tramway");
      b.ground = 0;
      b.aoH = 3;
      const r = PR.rng("pr_tram");
      const anchors = {};

      // ---------------- lattice tower + crossarm with rope saddles ----------------
      lattice(b, TWR.x, TZ, TWR.top, 2.6, 1.8, 1.1, 0.8);
      b.beam(
        "tower_rust",
        V(TWR.x, TWR.top, TZ - 3.2),
        V(TWR.x, TWR.top, TZ + 3.2),
        0.5,
        0.7,
        { grime: 0.5 },
      );
      for (const s of [-1, 1]) {
        b.beam(
          "tower_rust",
          V(TWR.x - 1.1, TWR.top - 3, TZ + s * 0.8),
          V(TWR.x, TWR.top, TZ + s * 3),
          0.16,
          0.16,
        );
        b.cyl("iron", TWR.x, TWR.top + 0.35, TZ + s * 2.3, 0.5, 0.5, 0.2, 12, {
          rx: HP,
          ry: HP,
          hSeg: 1,
        }); // saddle sheaves
      }
      b.cyl("lamp_red", TWR.x, TWR.top + 0.4, TZ, 0.18, 0.18, 0.3, 8, {
        hSeg: 1,
      }); // aircraft warning lamp
      PR.glow(V(TWR.x, TWR.top + 0.6, TZ), 0xff3020, 1.6, null, {
        intensity: 1.2,
        dayFactor: 0.25,
      });
      // service ladder with cage
      for (let y = 0.6; y < TWR.top - 1; y += 0.4)
        b.beam(
          "iron",
          V(TWR.x + 2.1 - (1.4 * y) / TWR.top, y, TZ - 0.3),
          V(TWR.x + 2.1 - (1.4 * y) / TWR.top, y, TZ + 0.3),
          0.04,
          0.04,
        );

      // ---------------- station: piers, platform, canopy, bull wheel ----------------
      const { x0, x1, z0, z1, y: PY } = ST;
      for (const px of [x0 + 0.6, (x0 + x1) / 2, x1 - 0.6])
        for (const pz of [z0 + 0.6, z1 - 0.6]) {
          b.boxMM(
            "concrete",
            px - 0.45,
            0,
            pz - 0.45,
            px + 0.45,
            PY - 0.5,
            pz + 0.45,
            { grime: 0.6 },
          );
          PR.colMM(px - 0.45, 0, pz - 0.45, px + 0.45, PY - 0.5, pz + 0.45, {
            walkable: false,
          });
        }
      b.boxMM("concrete", x0, PY - 0.5, z0, x1, PY, z1, { grime: 0.5 });
      b.boxMM(
        "concrete_dark",
        x0 + 0.3,
        PY,
        z0 + 0.3,
        x1 - 0.3,
        PY + 0.02,
        z1 - 0.3,
        { seg: false, grime: 0.6 },
      );
      PR.colMM(x0, PY - 0.5, z0, x1, PY, z1, { surface: "concrete" });
      // yellow safety edge at the berth (west end, where the cabins docked)
      b.boxMM(
        "paint_orange",
        x0,
        PY,
        z0 + 0.3,
        x0 + 0.35,
        PY + 0.03,
        z1 - 0.3,
        { seg: false },
      );
      // canopy: steel columns, trusses, corrugated roof (a panel missing)
      for (const px of [x0 + 0.4, x0 + 6, x1 - 0.4])
        for (const pz of [z0 + 0.4, z1 - 0.4]) {
          b.box("steel", px, PY, pz, 0.25, 4.6, 0.25, {
            seg: false,
            c: 0x7a7a70,
          });
          PR.col(px, pz, 0.3, 0.3, PY, PY + 4.6, 0, { walkable: false });
        }
      for (const px of [x0 + 0.4, x0 + 6, x1 - 0.4]) {
        b.beam(
          "steel",
          V(px, PY + 4.6, z0),
          V(px, PY + 5.6, (z0 + z1) / 2),
          0.18,
          0.18,
          { c: 0x7a7a70 },
        );
        b.beam(
          "steel",
          V(px, PY + 5.6, (z0 + z1) / 2),
          V(px, PY + 4.6, z1),
          0.18,
          0.18,
          { c: 0x7a7a70 },
        );
      }
      for (const s of [-1, 1]) {
        const zc = (z0 + z1) / 2,
          zz = zc + (s * (z1 - z0)) / 4;
        const pitch = Math.atan2(1.0, (z1 - z0) / 2);
        b.box(
          "corrugated",
          (x0 + x1) / 2 + (s > 0 ? 0 : 1.5),
          PY + 5.1,
          zz,
          x1 - x0 + 0.6 - (s > 0 ? 0 : 3),
          0.06,
          (z1 - z0) / 2 + 0.8,
          { rx: s * pitch, seg: false, c: 0xa89888 },
        );
      }
      // fascia sign on the canopy (both long faces)
      const sk = PR.texMat(
        "pr_tram_sign",
        PR.signTex(
          "pr_tram_sign",
          ["WELFARE ISLAND AERIAL TRAMWAY"],
          "plain",
          1024,
          128,
          { bg: "#1e2a36", fg: "#e8403a" },
        ),
      );
      b.quad(sk, (x0 + x1) / 2, PY + 4.35, z1 + 0.05, 9, 0.9, {});
      b.quad(sk, (x0 + x1) / 2, PY + 4.35, z0 - 0.05, 9, 0.9, { ry: Math.PI });
      // bull wheel (horizontal return sheave) at the east end + machinery housing
      b.cyl("iron", x1 - 3, PY + 2.4, TZ, 2.4, 2.4, 0.35, 28, { hSeg: 1 });
      b.cyl("rust", x1 - 3, PY + 2.2, TZ, 0.4, 0.4, 0.8, 10, { hSeg: 1 });
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.beam(
          "iron",
          V(x1 - 3, PY + 2.55, TZ),
          V(x1 - 3 + Math.cos(a) * 2.3, PY + 2.55, TZ + Math.sin(a) * 2.3),
          0.1,
          0.08,
        );
      }
      b.boxMM("panel", x1 - 4.8, PY, TZ - 1.6, x1 - 1.2, PY + 2.1, TZ + 1.6, {
        grime: 0.7,
        c: 0x5a6a5a,
      });
      PR.colMM(x1 - 5.4, PY, TZ - 2.4, x1 - 0.6, PY + 2.8, TZ + 2.4, {
        walkable: false,
      });
      // platform railings (open at the berth) + the stair landing gap on the south side
      PR.railing(
        b,
        [
          [x0 + 0.4, z0 + 0.1],
          [x1 - 0.1, z0 + 0.1],
          [x1 - 0.1, z1 - 0.1],
          [396.4, z1 - 0.1],
        ],
        PY,
        1.05,
        "iron",
        { collide: true, postStep: 1.6 },
      );
      PR.railing(
        b,
        [
          [394.3, z1 - 0.1],
          [x0 + 0.4, z1 - 0.1],
        ],
        PY,
        1.05,
        "iron",
        { collide: true, postStep: 1.6 },
      );
      PR.colWall(x0 + 0.1, z0, x0 + 0.1, z1, 0.2, PY, PY + 1.1, {
        walkable: false,
      }); // invisible guard at the berth drop
      // stair (south side, climbing west) + landing
      PR.stairs(b, "concrete", 403.4, -455.9, -HP, 1.9, 7.2, 0, PY, {
        maxRise: 0.3,
      });
      b.boxMM("concrete", 394.3, PY - 0.4, -457, 396.4, PY, -454.9, {
        seg: false,
      });
      PR.colMM(394.3, PY - 0.4, -457, 396.4, PY, -454.9, {
        surface: "concrete",
      });
      PR.railing(
        b,
        [
          [403.6, -454.9, 0],
          [396.2, -454.9, PY],
          [394.3, -454.9, PY],
          [394.3, -457, PY],
        ],
        0,
        1.0,
        "iron",
        { collide: true, postStep: 1.5 },
      );
      // turnstiles & a bench with its last commuter on the platform
      for (const z of [-459.5, -458.2]) {
        b.cyl("chrome", 396.8, PY, z, 0.1, 0.1, 0.9, 8, { hSeg: 1 });
        b.beam(
          "chrome",
          V(396.8, PY + 0.85, z),
          V(396.3, PY + 0.85, z + 0.4),
          0.04,
          0.04,
        );
      }
      b.boxMM("planks", 398.5, PY + 0.45, -468.4, 401.5, PY + 0.52, -467.9, {
        seg: false,
      });
      b.boxMM("planks", 398.5, PY + 0.5, -468.7, 401.5, PY + 1.0, -468.6, {
        seg: false,
      });
      for (const x of [398.7, 401.3])
        b.boxMM("iron", x - 0.04, PY, -468.6, x + 0.04, PY + 0.45, -467.9, {
          seg: false,
        });
      PR.skeleton(b, 399.2, PY + 0.02, -466.2, 0.5); // the last commuter
      // ground level: ticket booth under the platform, dead neon, Civil Defense poster
      b.boxMM("panel", 397.2, 0, -466, 400.2, 2.6, -463.2, {
        grime: 0.6,
        c: 0x6a7a6a,
      });
      b.boxMM("glass_dark", 397.1, 1.0, -465.6, 397.2, 2.2, -463.6, {
        seg: false,
      });
      PR.colMM(397.2, 0, -466, 400.2, 2.6, -463.2, { walkable: false });
      const tk = PR.texMat(
        "pr_tram_tix",
        PR.signTex(
          "pr_tram_tix",
          ["TICKETS", "SERVICE SUSPENDED 03.05.67"],
          "enamel",
          512,
          192,
          { bg: "#1e2a36", fg: "#f0e0c0" },
        ),
      );
      b.quad(tk, 397.05, 2.9, -464.6, 2.2, 0.8, { ry: -HP });
      PR.prop("first_aid", { x: 399.9, y: 1.1, z: -464.6, yaw: HP });
      PR.prop("footlocker", {
        x: 398.7,
        y: 0,
        z: -465.5,
        yaw: HP,
        loot: "common",
      });

      // ---------------- ropes: tower → station (intact) ----------------
      for (const dz of [-1.9, -1.5, 1.5, 1.9])
        cable(
          b,
          V(TWR.x + 0.2, TWR.top + 0.4, TZ + dz * 1.2),
          V((TWR.x + x0) / 2 + 2, PY + 7, TZ + dz),
          V(x1 - 3, PY + 2.6, TZ + Math.sign(dz) * 2.3),
          0.045,
          8,
        );

      // ---------------- ropes west: snapped in the war ----------------
      // north pair: sag from the tower into the river (with cabin 1 still hanging on it)
      const A0 = V(TWR.x - 0.3, TWR.top + 0.4, TZ - 2.3),
        C0 = V(368, 30, TZ - 2.6),
        E0 = V(351, -2.2, TZ - 3.4);
      cable(b, A0, C0, E0, 0.06, 14);
      cable(
        b,
        V(A0.x, A0.y, A0.z + 0.35),
        V(C0.x, C0.y - 0.3, C0.z + 0.35),
        V(E0.x, E0.y, E0.z + 0.4),
        0.05,
        14,
      );
      // cabin 1: hanging at t≈0.42 (out over the channel), pitched down along the rope
      {
        const t = 0.42,
          p = bez(A0, C0, E0, t),
          p2 = bez(A0, C0, E0, t + 0.02);
        const slope = Math.atan2(
          p2.y - p.y,
          Math.hypot(p2.x - p.x, p2.z - p.z),
        );
        const hang = 3.4,
          H = 2.5;
        const M = PR.m4(
          p.x,
          p.y - hang - H - 0.25,
          p.z + 0.2,
          0,
          0,
          slope * 0.55 + 0.08,
        );
        cabin(b, M, { hang, no: 1, broken: true });
        anchors.tram_cabin = PR.anchor(p.x, p.y - hang - H, p.z, 0);
      }
      // south pair: snapped at the tower; the loose ends hang down the tower's west face
      for (const dz of [2.1, 2.5])
        cable(
          b,
          V(TWR.x - 0.3, TWR.top + 0.4, TZ + dz),
          V(TWR.x - 3.5, TWR.top - 12, TZ + dz + 0.6),
          V(TWR.x - 2.2, 0.2, TZ + dz + 1.4),
          0.05,
          12,
        );
      // cabin 2: nose-down in the river off the promenade, half sunk, rope draped over it
      {
        const M = PR.m4(361, -2.1, TZ + 2.8, 0.35, 0.1, -0.55);
        cabin(b, M, { hang: 2.2, no: 2, broken: true });
        cable(
          b,
          V(TWR.x - 2.2, 0.2, TZ + 3.9),
          V(372, -0.5, TZ + 4.5),
          V(362.5, 1.2, TZ + 3.2),
          0.05,
          8,
        );
        for (let k = 0; k < 5; k++)
          b.rock(
            "rock",
            358 + r() * 6,
            -1.6,
            TZ + 1 + r() * 4,
            0.4 + r() * 0.4,
            { flat: 0.6, grime: 0.7 },
          );
        anchors.tram_wreck = PR.anchor(361, 0, TZ + 2.8, 0);
      }

      // ---------------- plaque ----------------
      PR.plaque(
        V(402.6, 1.4, -456.6),
        "Tramway Notice",
        '"ATTENTION RIDERS: Due to the ongoing international situation, the Tramway will close at 2200 hours. Please proceed calmly to your designated shelter. Civil Defense thanks you for your patience." Below, in marker: "car 1 still up there. dont look."',
      );
      anchors.tram_station = PR.anchor(394, PY, -462, HP);
      anchors.tram_stair = PR.anchor(404.5, 0, -455.9, HP);

      b.build(root);
      const e = PR.entries && PR.entries.roosevelt_island;
      if (e && e.anchors) Object.assign(e.anchors, anchors);
    },
    6,
  );
