// play-inline-325 03 — mez
// Lines 198-1632 of readable/play-inline-325.pretty.js (statement-aligned).
  PF.addBuilder(
    "high_line_int",
    function () {
      const cell = PF.cell(KEY);
      const root = cell.root;
      const b = PF.batch("hl_int");
      b.ground = 0;
      b.aoH = 2.5;

      // ------- baked light plan -------
      const L = [];
      const light = (x, y, z, color, r, i) =>
        L.push({ x: X(x), y, z: Z(z), color, r, i });
      // skylight shafts over the track hall (cool daylight)
      for (const x of [-18, -8, 2])
        for (const z of [-16, -4, 8]) light(x, ROOF - 3, z, 0xb8c8c8, 14, 0.7);
      // raider fires + string lights (warm)
      light(-14, PLAT + 1.2, -6, 0xff8a3a, 9, 0.9);
      light(0, PLAT + 1.2, 6, 0xff8a3a, 9, 0.9);
      light(10, PLAT + 2.5, -10, 0xffc070, 10, 0.7);
      light(21, PLAT + 2.2, -18, 0xfff0c8, 7, 0.55); // freight office
      light(21, PLAT + 2.2, 5, 0xffb060, 7, 0.6); // mess
      // docks: caged bulbs + daylight at the truck doors + red emergency lamps in cold storage
      for (const [x, z] of [
        [-4, -14],
        [8, -14],
        [-4, 2],
        [8, 2],
        [16, 14],
        [-2, 15],
      ])
        light(x, 5.8, z, 0xffd090, 8, 0.6);
      for (const x of [-12, 0, 12]) light(x, 2.5, ZS - 1.5, 0xc8d0d0, 7, 0.55);
      for (const x of [-22, -16.5, -11.5])
        light(x, 3.2, -15, 0xff3a28, 7, 0.75);
      light(-20, 3, 4, 0xffc080, 6, 0.5); // west stair
      light(19, 3, -3, 0xffc080, 6, 0.5); // east stair
      // mezzanine
      light(21, MEZ + 2.4, -17, 0xffc070, 8, 0.8); // superintendent
      light(21, MEZ + 2.4, -5, 0xe8f0ff, 7, 0.5); // records
      light(21, MEZ + 2.4, 5, 0x80ff90, 6, 0.55); // radio room (green dials)
      light(21, MEZ + 2.4, 16, 0xffd090, 6, 0.5); // armory
      light(-5, MEZ + 1.5, -22.5, 0xb8c8c8, 9, 0.45); // catwalk under the clerestory
      b.setLights(L, 0x8a8478, 0.2);

      const box = (k, x, y, z, w, h, d, o) =>
        b.box(k, X(x), y, Z(z), w, h, d, o);
      const bmm = (k, x0, y0, z0, x1, y1, z1, o) =>
        b.boxMM(k, X(x0), y0, Z(z0), X(x1), y1, Z(z1), o);
      const solid = (k, x0, y0, z0, x1, y1, z1, o) => {
        bmm(k, x0, y0, z0, x1, y1, z1, o);
        PF.colMM(X(x0), y0, Z(z0), X(x1), y1, Z(z1), {
          walkable: !!(o && o.walk),
          surface: (o && o.surface) || "concrete",
        });
      };
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

      // =====================================================================
      // SHELL
      // =====================================================================
      // perimeter walls (brick, full height), openings: north portal (tracks), south truck doors + man door
      wall("brick_nab", "x", XW, XE, ZN - 0.6, ZN, 0, ROOF, [
        { c: -14, w: 17, y0: TRK, h: 6.2 },
        { c: 8, w: 3, y0: MEZ + 1.2, h: 2.2 },
        { c: 16, w: 3, y0: MEZ + 1.2, h: 2.2 },
      ]);
      wall("brick_nab", "x", XW, XE, ZS, ZS + 0.6, 0, ROOF, [
        { c: -12, w: 4.4, y0: 0, h: 4.4 },
        { c: 12, w: 4.4, y0: 0, h: 4.4 },
        { c: 0, w: 1.6, y0: 0, h: 2.6 },
      ]);
      wall("brick_nab", "z", ZN, ZS, XW - 0.6, XW, 0, ROOF, [
        { c: -12, w: 3, y0: TRK + 3, h: 3 },
        { c: 0, w: 3, y0: TRK + 3, h: 3 },
        { c: 12, w: 3, y0: TRK + 3, h: 3 },
      ]);
      wall("brick_nab", "z", ZN, ZS, XE, XE + 0.6, 0, ROOF, [
        { c: -17, w: 2.6, y0: MEZ + 1, h: 2.2 },
        { c: 16, w: 2.6, y0: MEZ + 1, h: 2.2 },
      ]);
      // daylight in the high west windows + portal glow
      for (const z of [-12, 0, 12]) {
        quad("window_lit", XW - 0.3, TRK + 4.5, z, 3, 3, {
          ry: HP,
          noAO: true,
          grime: 0.2,
        });
        PF.glow(P(XW + 0.4, TRK + 4.5, z), 0xc8d8e0, 3.2, root, {
          intensity: 0.8,
        });
      }
      // portal: the dark gap where the Line enters is blocked by a jammed roll door with daylight slits
      bmm("corrugated", -22.5, TRK + 2.2, ZN - 0.5, -5.5, TRK + 6.2, ZN - 0.3, {
        seg: false,
        grime: 0.8,
      });
      quad("window_lit", -14, TRK + 1.1, ZN - 0.45, 17, 2.2, {
        ry: 0,
        noAO: true,
        grime: 0.3,
      });
      col(-22.5, TRK, ZN - 0.6, -5.5, TRK + 6.2, ZN - 0.2);
      PF.glow(P(-14, TRK + 1.1, ZN + 0.2), 0xd8e0e0, 6, root, {
        intensity: 0.7,
      });
      // roof: sawtooth north-light monitors over the hall, flat over the offices
      slab("tar", XW, ZN, XE, ZS, ROOF + 0.4, 0.4, { noCollide: true });
      for (let z = ZN + 2; z < ZS - 2; z += 8) {
        // each tooth: sloped roof + vertical glazing (half broken)
        const g = new THREE.BoxGeometry(32, 0.15, 7.2);
        g.rotateX(-0.42);
        b.add("corrugated", g, { m: PF.m4(X(-10), ROOF + 1.4, Z(z + 3.6)) });
        quad(
          z % 16 === 0 ? "glass_broken" : "glass_dark",
          -10,
          ROOF + 1.4,
          z + 0.2,
          32,
          2.8,
          { ry: PI, noAO: true, grime: 0.1 },
        );
      }
      // light shafts under the skylights (additive-looking pale planes are glows; add a few big soft glows)
      for (const x of [-18, -8, 2])
        for (const z of [-16, -4, 8])
          PF.glow(P(x, ROOF - 1, z), 0xc8d8d8, 4.5, root, { intensity: 0.45 });
      // trusses spanning the hall
      for (let z = ZN + 4; z < ZS; z += 8) {
        bmm("steel", XW, ROOF - 0.5, z - 0.15, 16, ROOF - 0.2, z + 0.15, {
          seg: false,
        });
        bmm("steel", XW, ROOF - 2.3, z - 0.12, 16, ROOF - 2.1, z + 0.12, {
          seg: false,
        });
        for (let x = XW + 2; x < 16; x += 4)
          b.beam(
            "steel",
            P(x, ROOF - 2.2, z),
            P(x + 2, ROOF - 0.4, z),
            0.12,
            0.12,
            {},
          );
        for (let x = XW + 4; x < 16; x += 4)
          b.beam(
            "steel",
            P(x, ROOF - 2.2, z),
            P(x - 2, ROOF - 0.4, z),
            0.12,
            0.12,
            {},
          );
      }
      // column grid (steel, both levels)
      const colsX = [-24, -14, -4, 6, 16],
        colsZ = [-16, -6, 4, 14];
      for (const x of colsX)
        for (const z of colsZ) {
          if (x === -14 && (z === -6 || z === 4)) {
            /* island platform columns */
          }
          solid("hl_steel", x - 0.3, 0, z - 0.3, x + 0.3, ROOF - 0.5, z + 0.3, {
            seg: false,
          });
          box("hl_steel", x, TRK - 0.9, z, 1.1, 0.6, 1.1, { seg: false }); // capital under the track slab
        }

      // =====================================================================
      // DOCK LEVEL (y 0 .. 6.7)
      // =====================================================================
      slab("concrete", XW, ZN, XE, ZS, 0.02, 0.3, {});
      // track-level slab (underside = dock ceiling) with steel beams; holes: west stair, east stair

      const slabRect = (x0, z0, x1, z1) => {
        bmm("concrete_dark", x0, TRK - 0.35, z0, x1, TRK, z1, { segLen: 8 });
        col(x0, TRK - 0.35, z0, x1, TRK, z1, { walkable: true });
      };
      // cut the slab around the holes (row strips)
      slabRect(XW, ZN, XE, -10);
      slabRect(XW, -10, 16.2, -2);
      slabRect(22.4, -10, XE, 1);
      slabRect(-21.5, -2, 16.2, 1);
      slabRect(-21.5, 1, XE, 9);
      slabRect(XW, 9, XE, 15);
      slabRect(-13, 15, XE, ZS);
      for (let z = ZN + 2; z < ZS; z += 4)
        bmm("hl_steel_dk", XW, TRK - 0.85, z - 0.15, XE, TRK - 0.35, z + 0.15, {
          seg: false,
        });
      // --- truck bays (south) ---
      for (const x of [-12, 12]) {
        bmm("corrugated", x - 2.2, 1.6, ZS + 0.05, x + 2.2, 4.4, ZS + 0.2, {
          seg: false,
          grime: 0.8,
        }); // roll door, jammed at 1.6 m
        quad("window_lit", x, 0.8, ZS + 0.3, 4.4, 1.6, {
          ry: PI,
          noAO: true,
          grime: 0.4,
        });
        col(x - 2.2, 0, ZS, x + 2.2, 4.4, ZS + 0.4);
        PF.glow(P(x, 0.8, ZS - 0.4), 0xd0d8d8, 3.5, root, { intensity: 0.6 });
      }
      // two wrecked delivery trucks backed in (box body + cab)
      const truck = (x, z, ry, paint) => {
        const M = PF.m4(X(x), 0, Z(z), ry);
        const add = (k, g, m) =>
          b.add(k, g, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.7,
          });
        add(paint, new THREE.BoxGeometry(2.5, 2.6, 6), PF.m4(0, 2.4, 1.2));
        add(
          "hl_steel_dk",
          new THREE.BoxGeometry(2.3, 0.4, 8.6),
          PF.m4(0, 0.9, 0),
        );
        const cab = new THREE.CapsuleGeometry(0.9, 1.0, 3, 8);
        cab.rotateZ(HP);
        cab.scale(1.1, 1.1, 1);
        add(paint, cab, PF.m4(0, 1.9, -3.2));
        add(
          "glass_broken",
          new THREE.BoxGeometry(2.0, 0.6, 0.1),
          PF.m4(0, 2.3, -4.05),
        );
        for (const wx of [-1.1, 1.1])
          for (const wz of [-3.2, 2.2, 3.4]) {
            const w = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 10);
            w.rotateZ(HP);
            add("tire", w, PF.m4(wx, 0.5, wz));
          }
        PF.col(X(x), Z(z), 2.6, 8.8, 0, 3.8, ry, { surface: "metal" });
      };
      truck(-12, 16, 0, "paint_cream");
      truck(12, 16.5, 0.05, "paint_red");
      const cakeSide = PF.brandMat("chocolate_zeppelin");
      quad(cakeSide, 13.28, 2.4, 17.7, 5.5, 2.3, { ry: HP, grime: 0.3 });
      quad(cakeSide, 10.72, 2.4, 17.4, 5.5, 2.3, { ry: -HP, grime: 0.3 });
      // man door to the street
      bmm("panel", -0.8, 0, ZS + 0.05, 0.8, 2.6, ZS + 0.15, { seg: false });
      const exitKey = PF.texMat(
        "hl_exit",
        PF.signTex("hl_exit", ["EXIT", "TO 14TH STREET"], "enamel", 256, 128, {
          bg: "#7a1a14",
        }),
        {},
      );
      quad(exitKey, 0, 3.0, ZS - 0.05, 1.2, 0.6, { ry: PI, grime: 0.2 });
      // --- cold storage lockers (west): three insulated meat lockers along the north ---
      const CS = [
        { x0: -26, x1: -19 },
        { x0: -19, x1: -14 },
        { x0: -14, x1: -9 },
      ];
      const csZ0 = ZN,
        csZ1 = -9,
        csH = 4.2;
      for (let i = 0; i < CS.length; i++) {
        const c = CS[i];
        const doorC = (c.x0 + c.x1) / 2;
        // front wall (south) with a heavy door opening, side walls, ceiling
        wall("ice", "x", c.x0, c.x1, csZ1 - 0.35, csZ1, 0, csH, [
          { c: doorC, w: 1.6, y0: 0, h: 2.4 },
        ]);
        if (i > 0)
          wall("ice", "z", csZ0, csZ1, c.x0 - 0.15, c.x0 + 0.15, 0, csH, []);
        bmm("ice", c.x0, csH, csZ0, c.x1, csH + 0.3, csZ1, { seg: false });
        // insulated door (swung open), latch outside, stencil
        const open = i !== 2;
        box(
          "ice",
          doorC + (open ? -1.1 : 0),
          0,
          csZ1 + (open ? 0.9 : -0.15),
          open ? 0.12 : 1.6,
          2.35,
          open ? 1.6 : 0.2,
          { seg: false, c: 0xb8c0c4 },
        );
        box("chrome", doorC + 0.6, 1.2, csZ1 + 0.1, 0.08, 0.1, 0.35, {
          seg: false,
        });
        const csKey = PF.texMat(
          "hl_cs" + i,
          PF.signTex(
            "hl_cs" + i,
            ["COLD STORAGE " + (i + 1), "PROP DOOR OPEN"],
            "enamel",
            256,
            128,
            { bg: "#1e3a5a" },
          ),
          {},
        );
        quad(csKey, doorC, 2.9, csZ1 + 0.02, 1.4, 0.7, { ry: 0, grime: 0.3 });
        // red emergency lamp over each door
        box("lamp_red", doorC, 3.3, csZ1 + 0.1, 0.25, 0.2, 0.15, {
          seg: false,
          noAO: true,
          grime: 0,
        });
        PF.glow(P(doorC, 3.4, csZ1 + 0.3), 0xff3020, 1.2, root, {
          intensity: 1.1,
          flicker: 0.15,
        });
        // meat rails and hooks
        for (const z of [-20, -16, -12.5]) {
          bmm(
            "rail",
            c.x0 + 0.4,
            csH - 0.3,
            z - 0.04,
            c.x1 - 0.4,
            csH - 0.2,
            z + 0.04,
            { seg: false },
          );
          for (let x = c.x0 + 0.9; x < c.x1 - 0.6; x += 1.1) {
            b.beam(
              "chrome",
              P(x, csH - 0.3, z),
              P(x, csH - 1.0, z),
              0.03,
              0.03,
              {},
            );
            if (((x * 7 + z * 3) | 0) % 3 === 0)
              b.sphere(i === 0 ? "meat" : "bone", X(x), csH - 1.6, Z(z), 0.3, {
                sx: 0.8,
                sy: 1.8,
                ws: 6,
                hs: 5,
                grime: 0.6,
              });
          }
        }
      }
      // cage in locker 3 (Lulu) — bars; the door leaf is a separate collider removed when opened
      {
        const cx0 = -13.4,
          cx1 = -9.6,
          cz0 = -22.8,
          cz1 = -17.5;
        for (let x = cx0; x <= cx1 + 0.01; x += 0.38)
          b.beam("iron", P(x, 0, cz1), P(x, 2.6, cz1), 0.04, 0.04, {});
        for (let z = cz0; z <= cz1; z += 0.38)
          b.beam("iron", P(cx0, 0, z), P(cx0, 2.6, z), 0.04, 0.04, {});
        bmm("iron", cx0, 2.6, cz0, cx1, 2.7, cz1, { seg: false });
        col(cx0 - 0.1, 0, cz0, cx0 + 0.1, 2.7, cz1);
        col(cx0, 0, cz1 - 0.1, cx0 + 1.4, 2.7, cz1 + 0.1);
        col(cx1 - 1.2, 0, cz1 - 0.1, cx1, 2.7, cz1 + 0.1);
        PF.dress.mattress(b, X(-11.2), 0.02, Z(-21.4), HP, 0x9a8a78);
        box("rust", -10.2, 0, -19, 0.4, 0.35, 0.4, { seg: false }); // bucket
        PF.hl.cageDoorPos = P(cx0 + 1.9, 1.2, cz1);
        PF.hl.cageCollider = [
          X(cx0 + 1.4),
          Z(cz1 - 0.1),
          X(cx1 - 1.2),
          Z(cz1 + 0.1),
        ];
        // the door leaf (visual, hidden when opened)
        const leaf = new THREE.Group();
        for (let x = cx0 + 1.45; x < cx1 - 1.2; x += 0.3) {
          const m = PF.mesh("iron", new THREE.BoxGeometry(0.04, 2.6, 0.04));
          m.position.set(X(x), 1.3, Z(cz1));
          leaf.add(m);
        }
        const bar = PF.mesh("iron", new THREE.BoxGeometry(1.2, 0.06, 0.06));
        bar.position.set(X(cx0 + 2), 1.3, Z(cz1));
        leaf.add(bar);
        root.add(leaf);
        PF.hl.cageLeaf = leaf;
      }
      // butcher's corner outside the lockers: block table, cleavers, blood, and the Conductors' "menu"
      solid("planks", -21, 0, -6.2, -18.5, 0.95, -5.0, { seg: false });
      box("meat", -20, 0.95, -5.6, 0.7, 0.18, 0.45, { seg: false });
      const menuKey = PF.texMat(
        "hl_menu",
        PF.signTex(
          "hl_menu",
          ["TODAY:", "BURROW RAT. AGAIN.", "TOLL DODGER."],
          "raider",
          512,
          256,
        ),
        {},
      );
      quad(menuKey, -22.5, 2.2, csZ1 + 0.02 - 0.36, 1.6, 0.8, {
        ry: 0,
        grime: 0.3,
      });
      // loading floor clutter: pallets, crates, forklift, hand trucks, raider bunks
      const rD = PF.rng("hl_dock");
      for (let i = 0; i < 14; i++) {
        const x = -6 + rD() * 28,
          z = -20 + rD() * 26;
        if (x > 14.5 && x < 23 && z > -9 && z < 2) continue;
        if (rD() < 0.5) {
          box("tie_wood", x, 0, z, 1.2, 0.14, 1.0, { ry: rD(), seg: false });
          PF.dress.crates(b, X(x), 0.14, Z(z), 1 + ((rD() * 3) | 0), 900 + i);
        } else {
          box("carton", x, 0, z, 1.1, 0.9 + rD() * 0.6, 1.1, {
            ry: rD(),
            seg: false,
            grime: 0.6,
          });
          col(x - 0.55, 0, z - 0.55, x + 0.55, 1.4, z + 0.55);
        }
      }
      // forklift
      {
        const fx = 2,
          fz = 8,
          M = PF.m4(X(fx), 0, Z(fz), 0.6);
        const add = (k, g, m) =>
          b.add(k, g, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.6,
          });
        add(
          "boxcar_yel",
          new THREE.BoxGeometry(1.3, 1.1, 2.2),
          PF.m4(0, 0.85, 0),
        );
        add(
          "boxcar_yel",
          new THREE.BoxGeometry(1.2, 0.08, 1.6),
          PF.m4(0, 2.3, 0.1),
        );
        for (const sx of [-0.55, 0.55])
          add(
            "steel",
            new THREE.BoxGeometry(0.08, 2.3, 0.08),
            PF.m4(sx, 1.15, -0.8),
          );
        for (const sx of [-0.35, 0.35])
          add(
            "steel",
            new THREE.BoxGeometry(0.12, 0.05, 1.1),
            PF.m4(sx, 0.35, -1.5),
          );
        for (const wx of [-0.6, 0.6])
          for (const wz of [-0.7, 0.7]) {
            const w = new THREE.CylinderGeometry(0.3, 0.3, 0.25, 10);
            w.rotateZ(HP);
            add("tire", w, PF.m4(wx, 0.3, wz));
          }
        PF.col(X(fx), Z(fz), 1.4, 3.0, 0, 2.3, 0.6, { surface: "metal" });
      }
      for (const [x, z, r] of [
        [4, -18, 0.3],
        [6, -16, 1.4],
        [-2, 12, 0.2],
      ])
        PF.dress.mattress(b, X(x), 0.02, Z(z), r);
      PF.barrel(b, X(5), 0, Z(-14), { fire: true });
      PF.dress.stringLights(
        b,
        P(-6, 5.5, -17),
        P(14, 5.6, -17),
        0.6,
        18,
        0xffc070,
      );
      PF.skeleton(b, X(8), 0.02, Z(-4), 1.2);
      PF.dress.rubble(b, X(-19), 0, Z(18), 1.8, 10, 55); // debris under the collapsed slab corner
      PF.dress.rubble(b, X(-23), 0, Z(20), 1.3, 8, 56);
      // radioactive barrels by the Civil Defense boxcar's leak (dripped through the slab)
      for (const [x, z] of [
        [-17.5, -1],
        [-16.8, 0.2],
      ])
        box("lamp_green", x, 0.01, z, 1.6, 0.02, 1.2, {
          seg: false,
          noAO: true,
          grime: 0.5,
        });
      PF.glow(P(-17, 0.3, -0.5), 0x70ff60, 1.6, root, { intensity: 0.8 });
      PF.onInitDone.push(() => {
        try {
          G.world.addRadSource({
            x: X(-17),
            y: 0.5,
            z: Z(-0.5),
            radius: 2.5,
            strength: 3,
          });
        } catch (e) {
          /* core */
        }
      });

      // --- west stair (dock ↔ track level) in its hole x -26..-21.5, z -2..9 ---
      PF.steelStair(b, X(-23.6), Z(-1.6), 0, 3.4, 23 * 0.33, 0.02, TRK, {
        key: "hl_steel",
        railKey: "iron",
      });
      slab("diamond", -26, 5.9, -21.5, 9, TRK, 0.2, { surface: "metal" });
      PF.rail(b, X(-21.5), Z(-2), X(-21.5), Z(5.9), TRK, { key: "iron" });
      PF.rail(b, X(-26), Z(-2), X(-21.5), Z(-2), TRK, { key: "iron" });
      // --- east stair (dock → PLAT → mezzanine) in hole x 16.2..22.4, z -10..1 ---
      // flight 1: dock → landing at PLAT (east half, climbing north)
      PF.steelStair(b, X(20.8), Z(0.8), PI, 2.8, 27 * 0.33, 0.02, PLAT, {
        key: "hl_steel",
        railKey: "iron",
      });
      slab("diamond", 16.2, -10, 22.4, -8.1, PLAT, 0.2, { surface: "metal" });
      // flight 2: PLAT → MEZ from the landing (west half, climbing south)
      PF.steelStair(b, X(17.3), Z(-8.1), 0, 2.0, 15 * 0.33, PLAT, MEZ, {
        key: "hl_steel",
        railKey: "iron",
      });
      PF.rail(b, X(16.2), Z(-8.1), X(16.2), Z(1), PLAT, { key: "iron" });
      PF.rail(b, X(18.3), Z(-8.1), X(19.4), Z(-8.1), PLAT, { key: "iron" });
      PF.rail(b, X(16.2), Z(1), X(22.4), Z(1), PLAT, { key: "iron" });

      // =====================================================================
      // TRACK LEVEL (y 7)
      // =====================================================================
      // tracks A and B from the portal to the bumpers, ties + rails
      for (const tx of [TA, TB]) {
        for (let z = ZN + 0.4; z < 13; z += 0.62)
          box("tie_wood", tx, TRK, z, 2.5, 0.16, 0.22, {
            seg: false,
            grime: 0.6,
          });
        for (const sx of [-0.72, 0.72])
          bmm(
            "rail",
            tx + sx - 0.04,
            TRK + 0.16,
            ZN,
            tx + sx + 0.04,
            TRK + 0.32,
            13,
            { seg: false },
          );
        // bumper block
        solid("rust", tx - 1.3, TRK, 13, tx + 1.3, TRK + 1.2, 14, {
          seg: false,
        });
        box("paint_red", tx, TRK + 1.2, 13.5, 2.6, 0.2, 1.0, { seg: false });
      }
      // platform P1 (island) and P2 (freight house floor), 1.1 m high with steps at their north ends
      solid("concrete", -15.6, TRK, -20, -12.4, PLAT, 12, {
        walk: true,
        segLen: 6,
      });
      box("hl_steel_dk", -15.6, PLAT - 0.1, -4, 0.2, 0.1, 32, { seg: false });
      box("hl_steel_dk", -12.4, PLAT - 0.1, -4, 0.2, 0.1, 32, { seg: false });
      PF.stairs(b, "concrete", X(-14), Z(-21.6), 0, 3.2, 1.6, TRK, PLAT, {});
      solid("concrete", -5.6, TRK, -18, 16.2, PLAT, 15, {
        walk: true,
        segLen: 6,
      });
      solid("concrete", 16.2, TRK, 1, XE, PLAT, 15, { walk: true, segLen: 6 });
      solid("concrete", 16.2, TRK, ZN, XE, PLAT, -10, {
        walk: true,
        segLen: 6,
      });
      PF.stairs(b, "concrete", X(-1), Z(-19.6), 0, 5, 1.6, TRK, PLAT, {});
      // freight-house floor edge bumpers (yellow)
      bmm("boxcar_yel", -5.7, PLAT - 0.02, -18, -5.5, PLAT + 0.02, 15, {
        seg: false,
        noAO: true,
      });
      // --- the boxcars ---
      PF.boxcar(b, X(TA), TRK + 0.32, Z(-12), 0, {
        num: 174022,
        mark: "NYC",
        doorOpen: 1,
      });
      PF.boxcar(b, X(TA), TRK + 0.32, Z(1.5), 0, { num: 174387 });
      PF.boxcar(b, X(TB), TRK + 0.32, Z(4), 0, { flat: true });
      for (const [x, z, h] of [
        [TA, -12, 4.6],
        [TA, 1.5, 4.6],
        [TB, 4, 1.6],
      ])
        col(x - 1.55, TRK, z - 6.3, x + 1.55, TRK + h, z + 6.3);
      // the sealed Civil Defense consignment inside the open boxcar: a stencilled crate, green leak
      box("panel", TA + 0.2, TRK + 1.5, -12, 1.8, 1.4, 2.4, {
        seg: false,
        grime: 0.5,
      });
      const ocdKey = PF.texMat(
        "hl_ocd",
        PF.signTex(
          "hl_ocd",
          ["OFFICE OF CIVIL DEFENSE", "CONSIGNMENT — SEALED"],
          "enamel",
          512,
          192,
          { bg: "#4a4e52", fg: "#f0a040" },
        ),
        {},
      );
      quad(ocdKey, TA + 1.12, TRK + 2.2, -12, 1.8, 0.7, { ry: HP, grime: 0.3 });
      box("lamp_green", TA + 0.4, TRK + 1.46, -10.5, 1.2, 0.02, 0.9, {
        seg: false,
        noAO: true,
      });
      // flatcar load: army crates under a tarp
      for (let i = 0; i < 4; i++)
        box(
          "army",
          TB + (i % 2 ? 0.6 : -0.6),
          TRK + 1.7,
          1 + i * 1.6,
          1.1,
          0.9,
          1.3,
          { ry: 0.1 * i, seg: false, grime: 0.5 },
        );
      box("tent", TB, TRK + 2.7, 2.4, 2.8, 0.05, 4.6, { rz: 0.06, seg: false });
      // island platform: raider camp (mattresses, cookfire, loot)
      PF.dress.mattress(b, X(-14.8), PLAT, Z(-9), 0);
      PF.dress.mattress(b, X(-13.2), PLAT, Z(-2), 0, 0x8a7060);
      PF.barrel(b, X(-14), PLAT, Z(-6), { fire: true });
      PF.dress.crates(b, X(-13.4), PLAT, Z(6), 2, 77);
      // freight-house floor: sorting tables, scales, hand trucks, parcels, the Conductors' "station"
      for (const [x, z] of [
        [2, -12],
        [2, -4],
        [8, -12],
        [8, -4],
      ]) {
        solid("planks", x - 1.6, PLAT, z - 0.7, x + 1.6, PLAT + 0.9, z + 0.7, {
          seg: false,
        });
        for (let k = 0; k < 4; k++)
          box(
            "carton",
            x - 1.2 + k * 0.8,
            PLAT + 0.9,
            z + (k % 2 ? 0.2 : -0.2),
            0.5,
            0.35,
            0.4,
            { ry: k * 0.4, seg: false },
          );
      }
      // platform scale with brass beam
      solid("iron", 11.4, PLAT, 5, 13.6, PLAT + 0.15, 7, {
        walk: true,
        seg: false,
      });
      box("iron", 13.5, PLAT, 7.2, 0.2, 1.6, 0.2, { seg: false });
      box("brass", 12.5, PLAT + 1.6, 7.2, 2.2, 0.08, 0.08, { seg: false });
      PF.dress.stringLights(
        b,
        P(-4, PLAT + 3.4, -16),
        P(14, PLAT + 3.6, -16),
        0.7,
        16,
        0xffc070,
      );
      PF.dress.stringLights(
        b,
        P(-4, PLAT + 3.4, 12),
        P(14, PLAT + 3.4, -16),
        1.0,
        22,
        0xffc070,
      );
      PF.barrel(b, X(0), PLAT, Z(6), { fire: true });
      for (const [x, z, r] of [
        [-3, 8, 0.4],
        [-2, 11, -0.3],
        [4, 12, 1.2],
      ])
        PF.dress.mattress(b, X(x), PLAT, Z(z), r);
      PF.dress.chair(b, X(1.5), PLAT, Z(8), 2.2);
      PF.dress.chair(b, X(-1.5), PLAT, Z(4.8), 0.5, true);
      // raider trophies: hanging tolls sign, graffiti, a boxcar door turned into a scoreboard
      const graf = PF.texMat(
        "hl_igraf",
        PF.graffitiTex("hl_igraf", ["ALL ABOARD", "THE CONDUCTORS"], 512, 200, {
          color: "#e8d040",
          outline: "#1a0e08",
        }),
        { transparent: true, noShadow: true },
      );
      quad(graf, 6, TRK + 4.5, ZN + 0.05, 8, 3, {
        ry: 0,
        noAO: true,
        grime: 0,
      });
      const graf2 = PF.texMat(
        "hl_igraf2",
        PF.graffitiTex("hl_igraf2", ["NEXT STOP:", "YOUR FUNERAL"], 512, 200, {
          color: "#d8302a",
          outline: "#1a0e08",
          tag: "skull",
        }),
        { transparent: true, noShadow: true },
      );
      quad(graf2, XW + 0.05, TRK + 2.2, -8, 6, 2.2, {
        ry: HP,
        noAO: true,
        grime: 0,
      });
      // collapsed SW corner: broken slab edge + dangling rebar over the hole (x -26..-13, z 15..22)
      for (let i = 0; i < 10; i++)
        b.beam(
          "rust",
          P(-13 - i * 1.2, TRK - 0.2, 15),
          P(-13.3 - i * 1.2, TRK - 1.2 - (i % 3) * 0.5, 15.8),
          0.03,
          0.03,
          {},
        );
      PF.rail(b, X(-26), Z(14.9), X(-13), Z(14.9), TRK, {
        key: "rust",
        noCollide: true,
      }); // (no rail visually, collider below)
      col(XW, TRK, 14.7, -13, TRK + 1.2, 15.1);
      col(-13.2, TRK, 15, -12.8, TRK + 1.2, ZS);
      // --- offices along the east wall at PLAT level: freight office, washroom, (stair), mess, elevator ---
      const OFF_X0 = 16.2;
      wall("plaster", "z", ZN, ZS, OFF_X0, OFF_X0 + 0.25, PLAT, MEZ - 0.3, [
        { c: -16, w: 1.4, y0: PLAT, h: 2.3 },
        { c: -20, w: 3.5, y0: PLAT + 1.1, h: 1.4 },
        { c: 6, w: 1.6, y0: PLAT, h: 2.3 },
        { c: 12.5, w: 2.4, y0: PLAT, h: 2.8 },
        { c: -9.05, w: 1.9, y0: PLAT, h: 2.6 },
        { c: -3.5, w: 7.0, y0: PLAT + 1.2, h: 1.6 },
      ]);
      wall("plaster", "x", OFF_X0, XE, -12, -11.75, PLAT, MEZ - 0.3, [
        { c: 21, w: 1.2, y0: PLAT, h: 2.3 },
      ]);
      wall("plaster", "x", OFF_X0, XE, -10.25, -10, PLAT, MEZ - 0.3, []);
      wall("plaster", "x", 22.4, XE, 1, 1.25, PLAT, MEZ - 0.3, []);
      wall("plaster", "x", OFF_X0, XE, 9.75, 10, PLAT, MEZ - 0.3, []);
      // freight office: counter window, desks, cabinets, terminal
      solid("oak", 16.6, PLAT, -21, 17.2, PLAT + 1.1, -19, { seg: false });
      for (const [x, z] of [
        [20, -21],
        [23.5, -21],
        [20, -15.5],
      ]) {
        solid("oak", x - 0.8, PLAT, z - 0.45, x + 0.8, PLAT + 0.78, z + 0.45, {
          seg: false,
        });
        PF.dress.monitor(b, X(x), PLAT + 0.78, Z(z - 0.1), 0, false);
      }
      PF.dress.papers(b, X(21), PLAT, Z(-18), 2.5, 30, 81);
      const tariffKey = PF.texMat(
        "hl_tariff",
        PF.signTex(
          "hl_tariff",
          ["FREIGHT OFFICE", "WAYBILLS — CLAIMS — TARIFFS"],
          "enamel",
          512,
          160,
          { bg: "#2a3a2a" },
        ),
        {},
      );
      quad(tariffKey, 16.05, PLAT + 2.7, -18, 2.4, 0.75, {
        ry: -HP,
        grime: 0.3,
      });
      // washroom
      for (const x of [24, 25.2]) {
        box("tile_white", x, PLAT, -11.3, 0.5, 0.85, 0.6, { seg: false });
      }
      box("mirror", 24.6, PLAT + 1.4, -11.68, 1.6, 0.9, 0.05, { seg: false });
      // mess / raider kitchen: tables, cooking pot on a barrel stove, lockers
      for (const [x, z] of [
        [20, 4],
        [23.5, 7],
      ]) {
        solid("planks", x - 1, PLAT, z - 0.6, x + 1, PLAT + 0.8, z + 0.6, {
          seg: false,
        });
        PF.dress.chair(b, X(x - 1.3), PLAT, Z(z), HP);
        PF.dress.chair(b, X(x + 1.3), PLAT, Z(z), -HP, x > 21);
      }
      PF.barrel(b, X(24.8), PLAT, Z(3), {});
      b.cyl("iron", X(24.8), PLAT + 0.9, Z(3), 0.35, 0.3, 0.4, 10, { hSeg: 1 });
      // freight elevator: open shaft, car stuck at the dock level, cables
      bmm("hl_steel", 16.3, 0, 10.2, 22.4, 0.5, 15.8, { seg: false });
      for (const x of [16.6, 22.1])
        bmm("hl_steel_dk", x - 0.1, 0, 10.2, x + 0.1, ROOF - 1, 10.4, {
          seg: false,
        });
      b.beam("iron", P(19.3, 0.6, 13), P(19.3, ROOF - 1, 13), 0.04, 0.04, {});
      b.beam(
        "iron",
        P(19.6, 0.6, 13.2),
        P(19.6, ROOF - 1, 13.2),
        0.04,
        0.04,
        {},
      );
      // elevator gate at PLAT (closed, warning)
      for (let x = 16.5; x < 22.3; x += 0.4)
        b.beam(
          "iron",
          P(x, PLAT, 10.05),
          P(x, PLAT + 2.2, 10.05),
          0.03,
          0.03,
          {},
        );
      col(16.3, PLAT, 9.8, 22.4, PLAT + 2.4, 10.2);
      col(16.3, 0, 10.2, 16.6, MEZ, 15.8);
      col(22.1, 0, 10.2, 22.4, MEZ, 15.8);

      // =====================================================================
      // MEZZANINE (y 12.5) over the east offices + north catwalk
      // =====================================================================
      // floor with the stair-head opening (x 16.2..18.3, z -8.1..-3.1)
      slab("planks", OFF_X0, ZN, XE, -8.1, MEZ, 0.3, { surface: "wood" });
      slab("planks", 18.3, -8.1, XE, -3.1, MEZ, 0.3, { surface: "wood" });
      slab("planks", OFF_X0, -3.1, XE, ZS, MEZ, 0.3, { surface: "wood" });
      PF.rail(b, X(18.35), Z(-8.1), X(18.35), Z(-3.5), MEZ, { key: "iron" });
      PF.rail(b, X(16.2), Z(-8.1), X(18.35), Z(-8.1), MEZ, { key: "iron" });
      // west wall of the mezzanine (over the hall): office window + catwalk door
      wall("plaster", "z", ZN, ZS, OFF_X0 - 0.25, OFF_X0, MEZ, ROOF - 0.5, [
        { c: -16.5, w: 6, y0: MEZ + 1.0, h: 1.6 },
        { c: -22.9, w: 1.4, y0: MEZ, h: 2.3 },
      ]);
      // cross walls: office | stair hall + records | radio | armory
      wall("plaster", "x", OFF_X0, XE, -10, -9.75, MEZ, ROOF - 0.5, [
        { c: 17.4, w: 1.3, y0: MEZ, h: 2.3 },
      ]);
      wall("plaster", "x", OFF_X0, XE, 0, 0.25, MEZ, ROOF - 0.5, [
        { c: 17.8, w: 1.3, y0: MEZ, h: 2.3 },
      ]);
      wall("plaster", "x", OFF_X0, XE, 10, 10.25, MEZ, ROOF - 0.5, [
        { c: 21, w: 1.4, y0: MEZ, h: 2.3 },
      ]);
      // stair hall / records partition
      wall("plaster", "z", -9.75, 0, 19.4, 19.65, MEZ, ROOF - 0.5, [
        { c: -5, w: 1.2, y0: MEZ, h: 2.3 },
      ]);
      const doorSign = PF.texMat(
        "hl_supt",
        PF.signTex(
          "hl_supt",
          ["SUPERINTENDENT", "(NOW: THE CONDUCTOR)"],
          "enamel",
          512,
          160,
          { bg: "#2a2a2a" },
        ),
        {},
      );
      quad(doorSign, 17.4, MEZ + 2.6, -9.7, 1.3, 0.42, { ry: 0, grime: 0.3 });
      // superintendent's office (z -24..-10): window over the hall, desk, safe, terminal, trophy wall
      solid("mahogany", 20.4, MEZ, -19.2, 23.6, MEZ + 0.8, -18, { seg: false });
      PF.dress.chair(b, X(22), MEZ, Z(-17.2), PI, false, "mahogany");
      b.box("lamp_warm", X(23.1), MEZ + 0.8, Z(-18.8), 0.25, 0.35, 0.25, {
        seg: false,
      });
      PF.glow(P(23.1, MEZ + 1.3, -18.8), 0xffc070, 1.2, root, {
        intensity: 1.1,
      });
      box("velvet", 24, MEZ, -13, 1.6, 0.5, 3.5, { seg: false });
      box("velvet", 25.2, MEZ + 0.5, -13, 0.4, 0.6, 3.5, { seg: false }); // sofa
      col(23.2, MEZ, -14.8, 25.8, MEZ + 1.0, -11.2);
      const wallKey = PF.texMat(
        "hl_map",
        PF.signTex(
          "hl_map",
          ["NYC WEST SIDE LINE", "30th ST — 14th ST — ST. JOHN'S PARK"],
          "enamel",
          512,
          256,
          { bg: "#e8dcc0", fg: "#2a2a3a" },
        ),
        {},
      );
      quad(wallKey, 25.9, MEZ + 2.0, -18.5, 3.4, 1.7, { ry: -HP, grime: 0.3 });
      // trophy rack: switch lanterns, a conductor's cap on a hook, license plates
      for (let i = 0; i < 4; i++) {
        b.cyl(
          i % 2 ? "lamp_red" : "rust",
          X(24 - i * 0.9),
          MEZ + 2.5,
          Z(-23.3),
          0.14,
          0.16,
          0.35,
          8,
          { hSeg: 1 },
        );
      }
      box("boxcar_yel", 21.5, MEZ + 2.2, -23.35, 0.6, 0.3, 0.05, {
        seg: false,
      });
      box("paint_teal", 20.7, MEZ + 2.3, -23.35, 0.6, 0.3, 0.05, {
        seg: false,
      });
      // records room (z -10..0): file cabinets rows, ledger
      for (const z of [-8.6, -6.6])
        for (let x = 20.4; x < 25.5; x += 0.8)
          box("steel", x, MEZ, z, 0.7, 1.4, 0.6, { seg: false, grime: 0.5 });
      col(20, MEZ, -9, 25.8, MEZ + 1.4, -6.2);
      PF.dress.papers(b, X(21.5), MEZ, Z(-2), 2, 26, 83);
      // radio room (z 0..10): ham radio bench, antenna cables, a mic on a stand
      solid("oak", 22.5, MEZ, 2, 25.6, MEZ + 0.8, 3.2, { seg: false });
      for (let i = 0; i < 3; i++) {
        box("army", 23 + i * 0.95, MEZ + 0.8, 2.6, 0.8, 0.5, 0.5, {
          seg: false,
        });
        quad("screen", 23 + i * 0.95, MEZ + 1.05, 2.33, 0.5, 0.25, {
          ry: PI,
          noAO: true,
        });
      }
      PF.dress.cable(
        b,
        [P(24, MEZ + 1.3, 2.4), P(25.8, ROOF - 0.6, 5), P(25.8, ROOF - 0.6, 9)],
        0.4,
      );
      // armory (z 10..22): steel cage with gate (lock 50 / terminal) — weapon racks
      for (let x = 18.8; x < 25.9; x += 0.35)
        b.beam("iron", P(x, MEZ, 14), P(x, MEZ + 2.6, 14), 0.03, 0.03, {});
      col(18.6, MEZ, 13.9, 20.8, MEZ + 2.8, 14.1);
      col(22.2, MEZ, 13.9, XE, MEZ + 2.8, 14.1);
      PF.hl.armoryGatePos = P(21.5, MEZ + 1.2, 14);
      PF.hl.armoryCol = [X(20.8), Z(13.9), X(22.2), Z(14.1)];
      for (const z of [17, 20]) {
        bmm("planks", 24.8, MEZ + 1.0, z - 1, 25.8, MEZ + 1.1, z + 1, {
          seg: false,
        });
        for (let k = 0; k < 4; k++)
          box("iron", 25.3, MEZ + 1.1, z - 0.75 + k * 0.5, 0.12, 0.9, 0.06, {
            rz: 0.1,
            seg: false,
          });
      }
      // mezzanine windows over the hall (office) with glass shards
      quad("glass_broken", OFF_X0 - 0.3, MEZ + 1.8, -17, 6, 1.6, {
        ry: -HP,
        noAO: true,
        grime: 0,
      });
      // north catwalk: from the mezzanine corridor west along the north wall to the NW stair
      const CW0 = ZN,
        CW1 = ZN + 2.2;
      bmm("diamond", XW + 1, MEZ - 0.08, CW0, OFF_X0, MEZ, CW1, { seg: false });
      PF.colMM(X(XW + 1), MEZ - 0.3, Z(CW0), X(OFF_X0), MEZ, Z(CW1), {
        surface: "metal",
      });
      for (let x = XW + 2; x < OFF_X0; x += 4)
        b.beam(
          "hl_steel",
          P(x, MEZ - 0.1, CW1),
          P(x, MEZ + 2.6, ZN + 0.05),
          0.08,
          0.08,
          {},
        ); // hangers
      PF.rail(b, X(XW + 4.4), Z(CW1), X(OFF_X0 - 0.2), Z(CW1), MEZ, {
        key: "iron",
      });
      // gap in the office wall (x 16.2) at z -21.2 already cut above as a door; the catwalk runs into it
      // NW stair down to the track level right beside the entrance (loop back)
      PF.steelStair(b, X(-24.4), Z(ZN + 2.3), 0, 2.6, 19 * 0.33, MEZ, TRK, {
        key: "hl_steel",
        railKey: "iron",
      });
      bmm("diamond", XW + 0.2, MEZ - 0.08, CW0, XW + 4.4, MEZ, CW1 + 0.1, {
        seg: false,
      });
      // clerestory windows on the north wall light the catwalk (daylight)
      for (const x of [8, 16])
        quad("window_lit", x, MEZ + 2.3, ZN - 0.35, 3, 2.2, {
          ry: 0,
          noAO: true,
          grime: 0.2,
        });

      // =====================================================================
      // environmental storytelling & set dressing
      // =====================================================================
      PF.skeleton(b, X(-11.5), 0.03, Z(-13.8), PI * 0.8); // the clerk who recorded the tape reel (Cold Storage 3)
      PF.skeleton(b, X(22), PLAT + 0.02, Z(-14), 0.3); // clerk under the desk
      PF.skeleton(b, X(-3.5), PLAT + 0.02, Z(13), 1.9); // toll dodger, recently
      D_rubbleLine(b);
      b.build(root, { lodDistInt: 400 });
      PF.flushGlows(root);
      PF.fires.splice(0); // interior barrels: fake glow only
      for (const [x, y, z] of [
        [-14, PLAT + 1, -6],
        [0, PLAT + 1, 6],
        [5, 1, -14],
      ])
        PF.glow(P(x, y, z), 0xff7a2a, 1.6, root, {
          intensity: 1.4,
          flicker: 0.5,
        });

      // =====================================================================
      // anchors, doors, props, NPCs
      // =====================================================================
      const A = {
        entrance: PF.anchor(X(-14), TRK + 0.05, Z(-22.6), PI),
        street_exit: PF.anchor(X(0), 0.05, Z(ZS - 1.6), 0),
        spawn1: PF.anchor(X(-14), PLAT, Z(-4), PI),
        spawn2: PF.anchor(X(4), PLAT, Z(0), PI),
        spawn3: PF.anchor(X(4), 0.05, Z(-12), 0),
        spawn4: PF.anchor(X(-4), 0.05, Z(10), 0),
        spawn5: PF.anchor(X(20), PLAT, Z(5), -HP),
        spawn6: PF.anchor(X(17.2), MEZ, Z(8), PI),
        boss: PF.anchor(X(22), MEZ, Z(-15.5), 0),
        cage: PF.anchor(X(-11.4), 0.05, Z(-20.5), 0),
        loot1: PF.anchor(X(TA + 0.8), TRK + 1.3, Z(-9.5), -HP),
        loot2: PF.anchor(X(24.5), MEZ, Z(-21.5), -HP),
        loot3: PF.anchor(X(24), MEZ, Z(18.5), -HP),
        loot4: PF.anchor(X(-20), 0.05, Z(-4), 0),
        loot5: PF.anchor(X(21), PLAT, Z(-21.5), PI),
      };
      PF.hl.int = A;
      const HLX = PF.HL;
      const hh = HLX.hh || {
        portal: V3(-305.5, HLX.DY, 272.6),
        dock: V3(-305, 1.2, 290.6),
      };
      PF.door({
        id: "pch_hl_in",
        pos: V3(hh.portal.x, hh.portal.y + 1.3, hh.portal.z),
        label: "St. John's Park Freight Terminal",
        verb: "Enter",
        radius: 1.4,
        target: { x: A.entrance.x, y: A.entrance.y, z: A.entrance.z, yaw: PI },
        sound: "door_open",
      });
      PF.door({
        id: "pch_hl_out",
        pos: P(-14, TRK + 1.3, ZN + 0.4),
        label: "The High Line",
        verb: "Exit",
        radius: 1.6,
        target: { x: -305.5, y: HLX.DY + 0.05, z: 270, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pch_hl_dock_in",
        pos: V3(hh.dock.x, 2.4, hh.dock.z),
        label: "Freight Terminal — Receiving",
        verb: "Enter",
        radius: 1.1,
        target: { x: A.street_exit.x, y: 0.05, z: A.street_exit.z, yaw: 0 },
        sound: "door_open",
      });
      PF.door({
        id: "pch_hl_dock_out",
        pos: P(0, 1.3, ZS - 0.2),
        label: "14th Street",
        verb: "Exit",
        radius: 1.1,
        target: { x: -305, y: 0.12, z: 295.2, yaw: PI },
        sound: "door_open",
      }); // B2: street level at the foot of the dock steps, facing away (was on the dock lip, facing the 1.2 m drop)

      // containers & terminals
      PF.prop("terminal", {
        x: X(20),
        y: PLAT + 0.78,
        z: Z(-15.3),
        yaw: PI,
        terminalId: "pch_hl_dispatch",
        mount: "bare",
        id: "pch_hl_term_dispatch",
      });
      PF.prop("terminal", {
        x: X(21.2),
        y: MEZ + 0.8,
        z: Z(-18.6),
        yaw: PI,
        terminalId: "pch_hl_conductor",
        mount: "bare",
        id: "pch_hl_term_boss",
      });
      PF.prop("safe", {
        x: X(25.5),
        y: MEZ,
        z: Z(-22.4),
        yaw: -HP,
        lock: LK_SAFE,
        items: [
          ["scrip", 340],
          ["old_dollars", 12],
          ["pch_note_ransom", 1],
          ["rally_tonic", 2],
          ["ammo_12ga", 18],
        ],
        id: "pch_hl_safe",
        name: "Conductor's Safe",
      });
      PF.prop("ammo_box", {
        x: X(25.2),
        y: MEZ,
        z: Z(16),
        yaw: -HP,
        large: true,
        loot: "ammo_box",
        id: "pch_hl_armory1",
      });
      PF.prop("ammo_box", {
        x: X(25.2),
        y: MEZ,
        z: Z(21),
        yaw: -HP,
        loot: "weapon_crate",
        id: "pch_hl_armory2",
      });
      PF.prop("footlocker", {
        x: X(-13.2),
        y: PLAT,
        z: Z(-11.5),
        yaw: HP,
        loot: "raider_stash",
        id: "pch_hl_foot1",
      });
      PF.prop("footlocker", {
        x: X(3.5),
        y: 0.02,
        z: Z(-19.5),
        yaw: 0,
        loot: "raider_stash",
        id: "pch_hl_foot2",
      });
      PF.prop("first_aid", {
        x: X(25.8),
        y: PLAT + 1.2,
        z: Z(-10.2),
        yaw: -HP,
        id: "pch_hl_aid1",
      });
      PF.prop("cash_register", {
        x: X(16.9),
        y: PLAT + 1.1,
        z: Z(-20),
        yaw: -HP,
        id: "pch_hl_register",
        loot: "cash_register",
      });
      PF.prop("file_cabinet", {
        x: X(19.4),
        y: PLAT,
        z: Z(-23.3),
        yaw: 0,
        id: "pch_hl_files1",
      });
      PF.prop("locker", {
        x: X(25.6),
        y: PLAT,
        z: Z(8.5),
        yaw: -HP,
        count: 3,
        loot: "locker",
        id: "pch_hl_lockers",
      });
      PF.prop("toolbox", {
        x: X(8),
        y: 0.02,
        z: Z(6),
        yaw: 0.4,
        id: "pch_hl_tools",
        loot: "toolbox",
      });
      PF.prop("crate", {
        x: X(TB),
        y: TRK + 1.45,
        z: Z(6.4),
        yaw: 0,
        kind: "military",
        id: "pch_hl_flatcrate",
        loot: "weapon_crate",
      });
      PF.prop("barrel", {
        x: X(-17.3),
        y: 0.02,
        z: Z(0.8),
        yaw: 0,
        radioactive: true,
        id: "pch_hl_radbarrel",
      });
      PF.prop("barrel", {
        x: X(10),
        y: PLAT,
        z: Z(-8),
        yaw: 0,
        explosive: true,
        id: "pch_hl_boom1",
      });
      PF.prop("barrel", {
        x: X(-4.5),
        y: 0.02,
        z: Z(-6),
        yaw: 0,
        explosive: true,
        id: "pch_hl_boom2",
      });
      PF.prop("radio", {
        x: X(24),
        y: MEZ + 1.3,
        z: Z(2.6),
        yaw: PI,
        id: "pch_hl_radio",
      });
      PF.pickup("pch_note_toll", 1, P(21.4, MEZ + 0.02, -3.2));
      PF.pickup("pch_reel_freezer", 1, P(-11.2, 0.05, -13.4));
      PF.pickup("pch_reel_conductor", 1, P(24.2, MEZ + 0.82, 2.5));
      PF.pickup("pch_switchman", 1, P(25.3, MEZ + 1.25, -13));
      PF.pickup("chocolate_zeppelin", 2, P(-13.4, PLAT + 0.05, -8));
      PF.pickup("beer", 3, P(20, PLAT + 0.82, 4));

      // cage door (Lulu) and armory gate interactables
      const CC = PF.hl.cageCollider,
        AC = PF.hl.armoryCol;
      let cageCol = null,
        armCol = null;
      PF.hl.applyGates = function () {
        const open = !!PF.flag("hl_cage_open"),
          aopen = !!PF.flag("hl_armory_open");
        if (PF.hl.cageLeaf) PF.hl.cageLeaf.visible = !open;
        if (PF.hl.armoryLeaf) PF.hl.armoryLeaf.visible = !aopen;
        try {
          if (open && cageCol) {
            G.world.removeCollider(cageCol);
            cageCol = null;
          }
          if (!open && !cageCol)
            cageCol = PF.colMM(CC[0], 0, CC[1], CC[2], 2.7, CC[3], {
              walkable: false,
            });
          if (aopen && armCol) {
            G.world.removeCollider(armCol);
            armCol = null;
          }
          if (!aopen && !armCol)
            armCol = PF.colMM(AC[0], MEZ, AC[1], AC[2], MEZ + 2.8, AC[3], {
              walkable: false,
            });
        } catch (e) {
          /* core */
        }
      };
      PF.hl.applyGates();
      // armory gate leaf mesh
      {
        const leaf = new THREE.Group();
        for (let x = 20.9; x < 22.2; x += 0.3) {
          const m = PF.mesh("iron", new THREE.BoxGeometry(0.04, 2.6, 0.04));
          m.position.set(X(x), MEZ + 1.3, Z(14));
          leaf.add(m);
        }
        root.add(leaf);
        PF.hl.armoryLeaf = leaf;
      }
      PF.use({
        pos: PF.hl.cageDoorPos,
        radius: 0.9,
        range: 2.6,
        label: "Holding Cage",
        verb: () => (PF.flag("hl_cage_open") ? "Open" : "Unlock"),
        enabled: () => !PF.flag("hl_cage_open"),
        locked: () =>
          PF.flag("hl_cage_open") || PF.inv.count("pch_cage_key")
            ? null
            : "Locked — the Conductor has the key",
        onInteract() {
          PF.lockOpen(LK_CAGE, () => openCage());
        },
      });
      function openCage() {
        PF.setFlag("hl_cage_open", true);
        PF.sfx("door_open", PF.hl.cageDoorPos);
        PF.hl.applyGates();
        PF.q.advance("pch_encore", ["talk", "find"], "free");
        PF.say(
          "pch_lulu_cage",
          "Oh thank God. Is Dizzy with you? No? Doesn't matter. Talk to me — quick, before they come back.",
          5,
        );
      }
      PF.use({
        pos: PF.hl.armoryGatePos,
        radius: 0.8,
        range: 2.6,
        label: "Armory Cage",
        verb: "Unlock",
        enabled: () => !PF.flag("hl_armory_open"),
        locked: () => "Combination padlock",
        onInteract() {
          PF.lockOpen(LK_ARMORY, () => {
            PF.setFlag("hl_armory_open", true);
            PF.hl.applyGates();
            PF.sfx("door_open", PF.hl.armoryGatePos);
          });
        },
      });
      PF.flagWatch.push((k) => {
        if (k === "*" || k === "hl_cage_open" || k === "hl_armory_open")
          PF.hl.applyGates();
      });

      // NPCs: the Conductors (hostile), the boss, and Lulu in the cage
      const pos = (a) => ({ x: a.x, y: a.y, z: a.z });
      const dead = (id) => () => !PF.flag("dead_" + id);
      const raiders = [
        ["pch_hl_r1", "Conductor Brakeman", A.spawn1, "hunting_rifle"],
        ["pch_hl_r2", "Conductor Fireman", A.spawn2, "pistol_10mm"],
        [
          "pch_hl_r3",
          "Conductor Butcher",
          V3(X(-20), 0.05, Z(-7)),
          "combat_knife",
        ],
        ["pch_hl_r4", "Conductor Switchman", A.spawn4, "smg_10mm"],
        ["pch_hl_r5", "Conductor Porter", A.spawn5, "sawed_off_shotgun"],
      ];
      raiders.forEach(([id, nm, a, wpn], i) =>
        PF.npc({
          id,
          type: "raider",
          name: nm,
          faction: "raiders",
          level: 4 + (i % 3),
          pos: pos(a),
          yaw: a.yaw || 0,
          ai: "guard",
          home: { x: a.x, z: a.z, r: 6 },
          weapon: wpn,
          loot: "raider",
          seed: 7100 + i,
          when: dead(id),
        }),
      );
      PF.npc({
        id: "pch_hl_boss",
        type: "raider",
        name: "The Conductor",
        outfit: "raider_heavy",
        faction: "raiders",
        level: 9,
        pos: pos(A.boss),
        yaw: 0,
        ai: "guard",
        home: { x: A.boss.x, z: A.boss.z, r: 5 },
        weapon: "combat_shotgun",
        hp: 240,
        dr: 12,
        loot: "raider_boss",
        inventory: [
          ["pch_cage_key", 1],
          ["scrip", 60],
          ["ammo_12ga", 12],
        ],
        seed: 7200,
        when: dead("pch_hl_boss"),
        barks: [
          "Tickets, please!",
          "End of the line, pal!",
          "All aboard the pain train!",
        ],
      });
      PF.npc({
        id: "pch_lulu_cage",
        type: "human",
        name: "Lulu Monroe",
        outfit: "settler",
        gender: "f",
        faction: "settlers",
        level: 3,
        pos: pos(A.cage),
        yaw: 0,
        ai: "guard",
        home: { x: A.cage.x, z: A.cage.z, r: 0.8 },
        dialogue: "pch_dlg_lulu",
        essential: true,
        weapon: "none",
        seed: 7300,
        when: () => !PF.flag("lulu_freed"),
        barks: [
          "[She hums something slow and sad under her breath.]",
          "Somebody? Anybody? I take requests!",
          "Dizzy's gonna kill me for missing the Saturday show.",
        ],
      });
      PF.onInitDone.push(() => PF.hl.applyGates());
      PF.onLoaded.push(() => PF.hl.applyGates());
      PF.onReset.push(() => PF.hl.applyGates());
      PF.onNewGame.push(() => PF.hl.applyGates());

      // register the POI (exterior root + interior)
      const ext = HLX.anchors || {};
      PF.register(
        "high_line",
        PF.HL.root || PF.root || null,
        Object.assign({}, ext, A, { exterior_entrance: ext.entrance }),
        { interiorRoot: root, interiorKey: KEY },
      );
    },
    12,
  );

