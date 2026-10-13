// play-inline-216 03 — the
// Lines 61-566 of readable/play-inline-216.pretty.js (statement-aligned).
  function buildDomino(root) {
    const b = PH.batch("domino_ext");
    b.aoH = 5;
    const anchors = {};
    const r = PH.rng("domino");
    // ---------------- brick blocks with arched window grids ----------------
    for (const [name, x0, z0, x1, z1, H, floors] of BLOCKS) {
      b.boxMM("brick", x0, 0, z0, x1, H, z1, {
        grime: 0.55,
        segLen: 5,
        c: 0xc49a86,
      });
      b.boxMM("concrete_dark", x0 - 0.2, 0, z0 - 0.2, x1 + 0.2, 1.4, z1 + 0.2, {
        grime: 0.8,
      });
      // corbelled cornice + parapet
      for (const [y, o, hh] of [
        [H - 1.4, 0.18, 0.3],
        [H - 1.1, 0.34, 0.3],
        [H - 0.8, 0.5, 0.35],
        [H - 0.45, 0.3, 1.2],
      ]) {
        b.boxMM("brick", x0 - o, y, z0 - o, x1 + o, y + hh, z1 + o, {
          seg: false,
          grime: 0.6,
        });
      }
      PH.colMM(x0, 0, z0, x1, H, z1, { walkable: false });
      const fh = (H - 3) / floors;
      const faces = [
        [Math.PI, (x0 + x1) / 2, z0 - 0.02, x1 - x0],
        [0, (x0 + x1) / 2, z1 + 0.02, x1 - x0],
        [-Math.PI / 2, x0 - 0.02, (z0 + z1) / 2, z1 - z0],
        [Math.PI / 2, x1 + 0.02, (z0 + z1) / 2, z1 - z0],
      ];
      for (const [ry, fx, fz, len] of faces) {
        const bays = Math.max(2, Math.floor(len / 4.2));
        const bw = len / bays;
        // brick pilasters between bays
        for (let i = 0; i <= bays; i++) {
          const [px, pz] = PH.rot(fx, fz, ry, -len / 2 + i * bw, 0.2);
          b.box("brick_dark", px, 1.4, pz, 0.7, H - 2.8, 0.4, {
            ry,
            seg: false,
            grime: 0.55,
            c: 0xd8b8a8,
          });
        }
        for (let f = 0; f < floors; f++) {
          const y0 = 2.6 + f * fh;
          // string course every floor
          const [cx, cz] = PH.rot(fx, fz, ry, 0, 0.12);
          b.box("brick", cx, y0 - 0.45, cz, len + 0.2, 0.22, 0.25, {
            ry,
            seg: false,
          });
          for (let i = 0; i < bays; i++) {
            const lx = -len / 2 + (i + 0.5) * bw;
            if (
              name === "pan" &&
              ry === Math.PI &&
              f === 0 &&
              Math.abs(lx + (fx - DOOR.x)) < 3
            )
              continue; // loading door bay
            const roll = r();
            factoryWindow(
              b,
              fx,
              fz,
              ry,
              lx,
              y0,
              bw * 0.52,
              fh * 0.62,
              roll < 0.5
                ? "dark"
                : roll < 0.85
                  ? "glass"
                  : roll < 0.9
                    ? "lit"
                    : "dark",
            );
          }
        }
      }
      // rooftop clutter: water tank, vents
      if (name !== "finish") {
        // NYC wooden water tank (kept clear of the neon sign's sight-lines on the Filter House)
        const tx = name === "filter" ? x1 - 5 : x0 + 4,
          tz = name === "filter" ? z1 - 6 : z0 + 5;
        b.cyl("rotten", tx, H + 3, tz, 2.2, 2.2, 3.4, 12, { hSeg: 1 });
        b.lathe(
          "rotten",
          [
            [2.4, 0],
            [1.2, 0.9],
            [0.1, 1.3],
          ],
          12,
          tx,
          H + 6.4,
          tz,
          {},
        );
        for (let k = 0; k < 3; k++)
          b.cyl("rust", tx, H + 3.4 + k * 1.1, tz, 2.26, 2.26, 0.08, 12, {
            hSeg: 1,
          });
        for (const [lx, lz] of [
          [-1.5, -1.5],
          [1.5, -1.5],
          [-1.5, 1.5],
          [1.5, 1.5],
        ])
          b.rod(
            "rust",
            PH.v3(tx + lx, H, tz + lz),
            PH.v3(tx + lx * 0.8, H + 3, tz + lz * 0.8),
            0.12,
            5,
          );
        for (let k = 0; k < 3; k++)
          b.box("corrugated", x1 - 12 - k * 5, H, z1 - 4, 2.4, 2.2, 2.4, {
            seg: false,
          });
      }
    }
    // stencilled painted signs on the brick (big faded letters, north face of the Filter House)
    const refK = PH.signMat(
      "domino_refinery",
      ["BROOKLYN SUGAR WORKS"],
      "stencil",
      1024,
      128,
      { bg: "#6a3a2c", fg: "#e8dcc0" },
    );
    b.quad(refK, 666, 34.6, 439.5, 28, 3.5, { ry: Math.PI });
    const asrK = PH.signMat(
      "domino_asr",
      ["BROOKLYN SUGAR WORKS CO. · EST. 1856"],
      "stencil",
      1024,
      96,
      { bg: "#5e3428", fg: "#dcd0b0" },
    );
    b.quad(asrK, 601.5, 17.5, 462, 20, 2.0, { ry: -Math.PI / 2 });

    // ---------------- loading dock & entrance (north face of the Pan House) ----------------
    b.boxMM("concrete", 622, 0, 436, 644, 1.2, 444, { grime: 0.7 });
    PH.colMM(622, 0, 436, 644, 1.2, 444, {});
    PH.stairs(b, "concrete", 626, 434.2, 0, 3, 1.8, 0, 1.2, {});
    b.boxMM("corrugated", 620, 5.2, 434.5, 646, 5.5, 444, { seg: false });
    for (const x of [621, 633, 645]) {
      b.cyl("rust", x, 1.2, 435, 0.12, 0.12, 4.0, 6, { hSeg: 1 });
      PH.col(x, 435, 0.3, 0.3, 0, 5.2, 0, { walkable: false });
    }
    b.boxMM("shadow", DOOR.x - 3, 1.2, 443.88, DOOR.x + 3, 5.4, 443.95, {
      noAO: true,
    });
    for (let k = 0; k < 9; k++)
      b.box("corrugated", DOOR.x - 3, 4.8 - k * 0.12, 443.8, 6.0, 0.1, 0.1, {
        seg: false,
      }); // half-raised roll-up door
    b.box("corrugated", DOOR.x, 3.9, 443.82, 6, 1.5, 0.08, { seg: false });
    const dockK = PH.signMat(
      "domino_dock",
      ["RAW SUGAR RECEIVING", "DOCK 3"],
      "stencil",
      512,
      192,
      { bg: "#2c3a44", fg: "#e8e0c8" },
    );
    b.quad(dockK, DOOR.x, 6.6, 443.7, 4.4, 1.6, { ry: Math.PI });

    // ---------------- the chimney stack ----------------
    {
      const cx = 688,
        cz = 486;
      b.boxMM("brick_dark", cx - 4, 0, cz - 4, cx + 4, 6, cz + 4, {
        grime: 0.7,
      });
      b.cyl("brick_dark", cx, 6, cz, 2.1, 3.0, 56, 16, {
        hSeg: 12,
        grime: 0.6,
        c: 0xb09080,
      });
      for (const y of [20, 38, 55])
        b.cyl(
          "brick",
          cx,
          6 + y,
          cz,
          2.9 - y * 0.015,
          2.95 - y * 0.015,
          0.8,
          16,
          { hSeg: 1 },
        );
      b.cyl("rust", cx, 61.2, cz, 2.3, 2.2, 1.0, 16, { hSeg: 1, open: true });
      const chK = PH.signMat(
        "domino_chimney",
        ["S", "U", "G", "A", "R"],
        "stencil",
        128,
        768,
        { bg: "#5a3226", fg: "#efe6d0", size: 100 },
      );
      b.quad(chK, cx - 2.6, 36, cz, 2.2, 22, { ry: -Math.PI / 2 - 0.1 });
      PH.col(cx, cz, 8, 8, 0, 60, 0, { walkable: false });
      PH.onReady.push(() =>
        PH.safe("smoke", () => {
          if (!G.isStub("fx") && G.fx.smoke)
            G.fx.smoke(PH.v3(cx, 62.5, cz), 2.5);
        }),
      );
    }

    // ---------------- concrete sugar silos (the Bin) ----------------
    for (const [x, z] of [
      [606, 490],
      [618, 491],
      [630, 490],
    ]) {
      b.cyl("concrete", x, 0, z, 5.2, 5.2, 30, 20, { hSeg: 6, grime: 0.6 });
      b.lathe(
        "concrete",
        [
          [5.3, 0],
          [4.2, 1.2],
          [1.0, 2.2],
          [0.4, 2.3],
        ],
        20,
        x,
        30,
        z,
        {},
      );
      PH.col(x, z, 9, 9, 0, 32, 0, { walkable: false });
    }
    b.boxMM("corrugated", 600, 30, 485, 636, 34, 496, { grime: 0.6 }); // headhouse gallery over the silos
    // conveyor gallery from the silo headhouse to the Pan House roof
    {
      const a = PH.v3(624, 31.5, 485),
        c = PH.v3(630, 30, 478);
      b.beam("corrugated", a, c, 3.2, 3.2);
      b.beam("rust", PH.v3(624, 29.6, 485), PH.v3(630, 28.2, 478), 0.4, 0.4);
    }

    // ---------------- gantry unloader crane (on rails along the north yard) ----------------
    {
      const gx = 668,
        gz = 428;
      for (const sx of [-6, 6])
        for (const sz of [-4, 4]) {
          b.beam(
            "paint_yellow",
            PH.v3(gx + sx, 0, gz + sz),
            PH.v3(gx + sx * 0.8, 24, gz + sz * 0.6),
            0.9,
            0.9,
            { c: 0xb09050 },
          );
          PH.col(gx + sx, gz + sz, 1, 1, 0, 24, 0, { walkable: false });
        }
      for (const sx of [-5.5, 5.5])
        for (let k = 0; k < 5; k++)
          b.beam(
            "paint_yellow",
            PH.v3(gx + sx, k * 5, gz - 4 + k * 0.2),
            PH.v3(gx + sx * 0.85, k * 5 + 5, gz + 4 - (k + 1) * 0.2),
            0.25,
            0.25,
            { c: 0xb09050 },
          );
      b.boxMM("paint_yellow", gx - 7, 24, gz - 3.5, gx + 7, 27, gz + 3.5, {
        c: 0xb09050,
      });
      b.boxMM("panel", gx - 3, 27, gz - 2.5, gx + 3, 31, gz + 2.5, {
        grime: 0.7,
      });
      b.boxMM("paint_yellow", gx - 2, 26, gz - 30, gx + 2, 28, gz + 6, {
        c: 0xb09050,
      }); // boom out over the old slip (north)
      for (let z = gz - 30; z < gz + 6; z += 3)
        b.beam(
          "rust",
          PH.v3(gx - 2, 26, z),
          PH.v3(gx + 2, 28, z + 3),
          0.15,
          0.15,
        );
      b.rod("black", PH.v3(gx, 26, gz - 22), PH.v3(gx, 12, gz - 22), 0.05, 4);
      b.box("rust", gx, 9, gz - 22, 3, 3, 3, { seg: false }); // grab bucket
      // meat bags & a strung-up skeleton hanging from the crane (brute decor)
      for (const [dx, len] of [
        [-4, 8],
        [3, 10],
        [5.5, 6],
      ]) {
        b.rod(
          "rope",
          PH.v3(gx + dx, 24, gz),
          PH.v3(gx + dx, 24 - len, gz),
          0.03,
          4,
        );
        b.sphere("leather", gx + dx, 23.2 - len, gz, 0.6, {
          sy: 1.4,
          c: 0x7a3a2a,
        });
      }
      // rails
      for (const z of [gz - 4, gz + 4])
        b.boxMM("rust", 600, 0, z - 0.1, 690, 0.18, z + 0.1, { seg: false });
      // elevated conveyor from the crane to the Filter House
      b.beam("corrugated", PH.v3(668, 25, 431.5), PH.v3(668, 30, 440), 3, 3);
    }

    // ---------------- SUGAR WORKS neon sign on its lattice ----------------
    // Stands on the Filter House roof, angled to face north-west: it reads from the
    // waterfront, the street approach and across the river from Manhattan.
    {
      const CX = 666,
        CZ = 460,
        RY = (-3 * Math.PI) / 4,
        Y0 = 40.4,
        LEN = 48,
        TOPY = 16.6;
      const P = (lx, lz) => PH.rot(CX, CZ, RY, lx, lz); // local +x = reading direction, +z = facing
      // steel lattice (posts, rakers to the roof, three chords, X-bracing)
      for (let lx = -LEN / 2; lx <= LEN / 2 + 0.01; lx += LEN / 14) {
        const [px, pz] = P(lx, -0.3),
          [bx, bz] = P(lx, -3.2);
        b.beam("rust", PH.v3(px, Y0, pz), PH.v3(px, Y0 + TOPY, pz), 0.26, 0.26);
        b.beam(
          "rust",
          PH.v3(bx, Y0, bz),
          PH.v3(px, Y0 + TOPY - 2, pz),
          0.18,
          0.18,
        );
      }
      for (const y of [Y0 + 0.5, Y0 + 3.6, Y0 + 10.6, Y0 + TOPY - 0.3]) {
        const [ax, az] = P(-LEN / 2, -0.3),
          [cx2, cz2] = P(LEN / 2, -0.3);
        b.beam("rust", PH.v3(ax, y, az), PH.v3(cx2, y, cz2), 0.2, 0.2);
      }
      for (let lx = -LEN / 2; lx < LEN / 2 - 0.1; lx += LEN / 14) {
        const [ax, az] = P(lx, -0.3),
          [cx2, cz2] = P(lx + LEN / 14, -0.3);
        b.beam(
          "rust",
          PH.v3(ax, Y0 + 0.5, az),
          PH.v3(cx2, Y0 + 3.6, cz2),
          0.08,
          0.08,
        );
        b.beam(
          "rust",
          PH.v3(ax, Y0 + 3.6, az),
          PH.v3(cx2, Y0 + 10.6, cz2),
          0.08,
          0.08,
        );
        b.beam(
          "rust",
          PH.v3(ax, Y0 + 10.6, az),
          PH.v3(cx2, Y0 + TOPY - 0.3, cz2),
          0.08,
          0.08,
        );
      }
      // letters: the one-line "SUGAR WORKS" in yellow channel letters (one atlas quad for the
      // faces + two darker stacked copies behind for the letter returns).  The "O" is dead.
      const TEXT = "SUGAR WORKS",
        DEAD = { 7: true };
      const LH = 5.8,
        LW = LEN - 1.0,
        LY = Y0 + 10.6 + LH * 0.5 - 0.3;
      const face = PH.neonLineMat("sugarworks", TEXT, DEAD, false);
      const side = PH.neonLineMat("sugarworks", TEXT, DEAD, true);
      for (const [dz, k] of [
        [0.34, face],
        [0.2, side],
        [0.06, side],
      ]) {
        const [qx, qz] = P(0, dz);
        b.quad(k, qx, LY, qz, LW, LH, { ry: RY });
      }
      // lower chord doubles as the letters' catwalk (grating + rail)
      {
        const [ax, az] = P(-LEN / 2, -0.9),
          [cx2, cz2] = P(LEN / 2, -0.9);
        b.beam(
          "rust",
          PH.v3(ax, Y0 + 10.2, az),
          PH.v3(cx2, Y0 + 10.2, cz2),
          1.2,
          0.08,
        );
      }
      const glows = [];
      for (let i = 0; i < TEXT.length; i++) {
        if (TEXT[i] === " " || DEAD[i]) continue;
        const [gx, gz] = P(-LW / 2 + ((i + 0.5) * LW) / TEXT.length, 1.2);
        glows.push([gx, LY, gz, LH]);
      }
      PH.onReady.push(() =>
        PH.safe("neon glow", () => {
          if (G.isStub("fx") || !G.fx.glowSprite) return;
          for (const [x, y, z, sz] of glows)
            G.fx.glowSprite(PH.v3(x, y, z), 0xffc21a, sz * 1.1, {
              intensity: 0.8,
              dayFactor: 0.08,
            });
        }),
      );
    }
    // Freedom Flakes billboard on the Finishing House roof, facing the street (north)
    {
      const bk = PH.brandMat("freedom_flakes");
      for (const x of [603.5, 614.5])
        b.box("rust", x, 22, 452, 0.3, 9, 0.3, { seg: false });
      b.box("rust", 609, 24.2, 452.2, 12.6, 6.6, 0.25, { seg: false });
      b.quad(bk, 609, 27.5, 451.95, 12, 6, { ry: Math.PI });
    }

    // ---------------- brute yard camp ----------------
    {
      PH.scrapWall(b, 600, 422, 626, 422, 3.0);
      PH.scrapWall(b, 640, 422, 690, 422, 3.0);
      for (const x of [626.4, 639.6]) {
        b.box("rust", x, 0, 422, 0.6, 4.6, 0.6, { seg: false });
        PH.col(x, 422, 0.6, 0.6, 0, 4.6, 0, { walkable: false });
      }
      const stK = PH.signMat(
        "domino_sweettooth",
        ["SWEET TOOTH'S", "CANDY FACTORY", "TINY HUMAN = CANDY"],
        "raider",
        768,
        384,
        { bg: "#5a4a3a", fg: "#e0c030" },
      );
      b.box("rust", 633, 4.0, 422, 13.2, 0.3, 0.3, { seg: false });
      b.quad(stK, 633, 5.6, 421.75, 6.4, 3.2, { ry: Math.PI });
      // gore bags, meat hooks, bonfire, piled sugar sacks, a cage
      for (let i = 0; i < 8; i++) {
        const x = 612 + r() * 40,
          z = 426 + r() * 8;
        b.sphere("leather", x, 0.5, z, 0.55, { sy: 0.8, c: 0x6a2a20 });
      }
      for (let i = 0; i < 22; i++) {
        const x = 645 + (i % 6) * 1.1,
          z = 426 + ((i / 6) | 0) * 0.8,
          y = ((i / 12) | 0) * 0.5;
        b.box("burlap", x, y, z, 1.0, 0.5, 0.7, {
          ry: (r() - 0.5) * 0.3,
          seg: false,
          c: 0xd0c0a0,
        });
      }
      PH.col(648, 427.5, 7, 3.4, 0, 1.0, 0, {});
      b.cyl("rust", 630, 0, 430, 0.9, 1.0, 0.6, 12, { hSeg: 1 });
      b.sphere("fire", 630, 0.6, 430, 0.7, { sy: 0.8, noAO: true });
      PH.onReady.push(() =>
        PH.safe("fire", () => {
          if (!G.isStub("fx") && G.fx.fire)
            G.fx.fire(PH.v3(630, 0.7, 430), 1.0);
        }),
      );
      PH.col(630, 430, 1.8, 1.8, 0, 0.6, 0, {});
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        b.rod(
          "iron",
          PH.v3(612 + Math.cos(a) * 1.3, 0, 432 + Math.sin(a) * 1.3),
          PH.v3(612 + Math.cos(a) * 1.3, 2.4, 432 + Math.sin(a) * 1.3),
          0.04,
          4,
        );
      }
      b.cyl("iron", 612, 2.4, 432, 1.4, 1.4, 0.1, 10, { hSeg: 1 });
      PH.skeleton(b, 612, 0, 432, 0.4, { sit: true });
      PH.col(612, 432, 2.6, 2.6, 0, 2.5, 0, { walkable: false });
      // spilled raw sugar drift around the dock (and a molasses slick)
      b.mound("rawsugar", 640, 0, 438, 5, 0.9, 3.5, { seed: 3 });
      b.mound("sugar", 614, 0, 440, 3.5, 0.6, 2.5, { seed: 5 });
      b.box("molasses", 628, 0.01, 431, 6, 0.03, 3, { seg: false, noAO: true });
    }
    anchors.entrance = PH.anchor(DOOR.x, 1.2, 441, 0);
    anchors.gate = PH.anchor(633, 0, 420, 0);
    anchors.spawn_out1 = PH.anchor(620, 0, 430, Math.PI);
    anchors.spawn_out2 = PH.anchor(650, 0, 432, Math.PI);

    const g = b.build(root);
    g.name = "domino_sugar";
    return anchors;
  }

  /**
   * One-line channel-letter sign atlas: painted yellow letter faces with a bright neon
   * tube down each stroke (dead letters faded, tubes broken).  `back` draws the darker
   * letter returns used for the stacked depth copies.  → material key.
   */
