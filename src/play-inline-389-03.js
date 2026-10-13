// play-inline-389 03 — tint
// Lines 178-1000 of readable/play-inline-389.pretty.js (statement-aligned).
  function exterior(ctx) {
    const b = K.builder({ name: "ho_ext", grime: 0.45 });
    const r = K.rng("ho_ext");
    const { X0, X1, Z0, Z1, BASE, CORN, TOP, PX, PY, CZ0, CZ1, CX } = HO;

    // ---------------- limestone base (0..16) ----------------
    // west face: shopfronts either side of the portico recess
    for (const [za, zb] of [
      [Z0, CZ0],
      [CZ1, Z1],
    ]) {
      K.fwall(b, "limestone", X0, za, X0, zb, 0, BASE, -1, 0, { tint: LIME });
      for (let k = 0; k < 9; k++)
        b.boxMM(
          "limestone",
          X0 - 0.03,
          0.6 + k * 0.62,
          za,
          X0,
          0.64 + k * 0.62,
          zb,
          { tint: LIME.map((v) => v * 0.7), faces: "w" },
        ); // rustication
      const n = 3;
      for (let k = 0; k < n; k++) {
        const wz = za + ((zb - za) * (k + 0.5)) / n;
        // round 2: a real storefront bay (bronze bulkhead, display window over a dark shop with its goods, mullions,
        // prism transom, tattered awning) instead of a black plate
        const names =
          za === Z0
            ? ["HABERDASHER", "NEWS & TOBACCO", "BARBER"]
            : ["FLORIST", "TRAVEL AGENT", "FIZZO COLA BAR"];
        const SHOP =
          za === Z0
            ? [
                {
                  goods: "hats",
                  state: "glass",
                  glassName: "Wm. Knox Hats",
                  awning: ["#3e5a3e", "#d8ceb4"],
                },
                { goods: "news", state: "boarded", tag: "CLOSED 4 EVER" },
                {
                  goods: "barber",
                  state: "broken",
                  awning: ["#8e2a22", "#e0d8c0"],
                  sag: 0.35,
                },
              ]
            : [
                {
                  goods: "flowers",
                  state: "broken",
                  awning: ["#6a4a2a", "#d8c8a0"],
                  sag: 0.2,
                },
                { goods: "travel", state: "glass", glassName: "Bermuda Tours" },
                {
                  goods: "fizzo",
                  state: "dark",
                  awning: ["#8e2a22", "#e0d8c0"],
                },
              ];
        const sp = SHOP[k];
        K.shopfront(
          b,
          X0,
          wz,
          -1,
          0,
          2.4,
          Object.assign(
            { seed: k + (za === Z0 ? 0 : 3), awningKey: names[k].slice(0, 4) },
            sp,
          ),
        );
        b.plate(
          "art",
          X0 - 0.14,
          4.35,
          wz,
          -1,
          0,
          2.3,
          0.45,
          K.signCell("ppn_shop" + names[k], names[k], 320, 60, {
            bg: "#1c1a14",
            fg: "#d8b860",
            font: "Georgia, serif",
          }),
          { off: 0 },
        );
        if (sp.goods === "barber") K.barberPole(b, X0, 1.4, wz + 1.45, -1, 0);
        // storeys 2-4: tall windows
        for (let s = 0; s < 3; s++)
          K.window(b, X0, 7.0 + s * 3.4, wz, -1, 0, 1.3, 2.2, {
            state: r() < 0.25 ? "broken" : r() < 0.2 ? "boarded" : "dark",
            surround: "limestone",
            surroundTint: LIME,
            lintel: 0.3,
            sillMat: "limestone",
          });
      }
    }
    // north / south / east faces of the base
    for (const [zf, nz] of [
      [Z0, -1],
      [Z1, 1],
    ]) {
      K.fwall(b, "limestone", X0, zf, X1, zf, 0, BASE, 0, nz, {
        tint: LIME.map((v) => v * 0.95),
      });
      for (let k = 0; k < 9; k++)
        b.boxMM(
          "limestone",
          X0,
          0.6 + k * 0.62,
          zf,
          X1,
          0.64 + k * 0.62,
          zf + nz * 0.03,
          { tint: LIME.map((v) => v * 0.7), faces: nz < 0 ? "n" : "s" },
        );
      for (let k = 0; k < 8; k++) {
        const wx = X0 + 2 + k * 3.7;
        for (let s = 0; s < 4; s++)
          K.window(b, wx, 2.4 + s * 3.4, zf, 0, nz, 1.2, 2.1, {
            state: s === 0 ? "boarded" : r() < 0.25 ? "broken" : "dark",
            surround: "limestone",
            surroundTint: LIME,
            sillMat: "limestone",
          });
      }
    }
    K.fwall(b, "limestone", X1, Z0, X1, Z1, 0, BASE, 1, 0, {
      tint: LIME.map((v) => v * 0.9),
    });
    b.col(X0, 0, Z0, X1, BASE, CZ0, { tag: "building" });
    b.col(X0, 0, CZ1, X1, BASE, Z1, { tag: "building" });
    b.col(PX, 0, CZ0, X1, BASE, CZ1, { tag: "building" });
    // belt cornice over the base
    K.cornice(b, X0, Z0 - 0.2, X0, Z1 + 0.2, BASE, -1, 0, {
      mat: "limestone",
      tint: LIME,
      depth: 0.8,
      h: 0.8,
      brackets: 0,
    });
    for (const [zf, nz] of [
      [Z0, -1],
      [Z1, 1],
    ])
      K.cornice(b, X0, zf, X1, zf, BASE, 0, nz, {
        mat: "limestone",
        tint: LIME,
        depth: 0.8,
        h: 0.8,
        brackets: 0,
      });

    // ---------------- the portico: steps, four colossal Ionic columns, frieze, doors ----------------
    {
      const n = 3;
      for (let i = 0; i < n; i++) {
        const xa = X0 + i * 0.4,
          top = (PY * (i + 1)) / n;
        b.boxMM("granite_pale", xa, 0, CZ0, xa + 0.4, top, CZ1, {
          tint: i % 2 ? [0.82, 0.8, 0.76] : [0.9, 0.88, 0.84],
          faces: "wt",
        });
        b.col(xa, 0, CZ0, xa + 0.4, top, CZ1, { tag: "stairs" });
      }
      b.boxMM("marble", X0 + 1.2, PY - 0.02, CZ0, PX, PY, CZ1, {
        tint: [0.8, 0.78, 0.72],
        faces: "t",
      });
      b.col(X0 + 1.2, 0, CZ0, PX, PY, CZ1, { tag: "floor" });
      // recess side walls
      for (const [zz, nz] of [
        [CZ0, 1],
        [CZ1, -1],
      ])
        K.fwall(b, "limestone", X0, zz, PX, zz, 0, 12.5, 0, nz, {
          tint: LIME.map((v) => v * 0.8),
        });
      // columns
      const cz = [-122.1, -120.0, -118.0, -115.9];
      for (const z of cz) {
        K.column(b, X0 + 1.9, PY, z, 0.45, 10.6, {
          kind: "ionic",
          mat: "limestone",
          tint: LIME.map((v) => v * (0.95 + r() * 0.06)),
          flutes: true,
        });
        b.col(X0 + 1.45, PY, z - 0.45, X0 + 2.35, 11.5, z + 0.45, {
          tag: "column",
          walkable: false,
        });
      }
      // entablature over the recess with the carved name
      b.boxMM("limestone", X0 - 0.1, 11.5, CZ0 - 0.4, PX, 13.8, CZ1 + 0.4, {
        tint: LIME,
        faces: "wnsb",
      });
      b.plate(
        "art",
        X0 - 0.11,
        12.75,
        -119,
        -1,
        0,
        7.6,
        0.95,
        K.friezeCell("ho_name", "HOTEL  PENNSYLVANIA", 1024, 110, {
          bg: "#d4ccb8",
        }),
        { off: 0.0 },
      );
      K.cornice(b, X0 - 0.1, CZ0 - 0.6, X0 - 0.1, CZ1 + 0.6, 13.8, -1, 0, {
        mat: "limestone",
        tint: LIME,
        depth: 0.7,
        h: 0.7,
        brackets: 0.8,
      });
      // back wall: revolving door (brass drum) + two side doors + big window over
      K.fwall(b, "marble", PX, CZ0, PX, CZ1, PY, 11.5 - PY, -1, 0, {
        tint: [0.72, 0.7, 0.64],
      });
      {
        const dz = -119;
        b.cyl("brass", PX - 1.05, PY, dz, 1.1, 1.1, 0.15, 16, {
          tint: [0.6, 0.48, 0.28],
        });
        b.cyl("brass", PX - 1.05, PY + 2.5, dz, 1.15, 1.15, 0.35, 16, {
          tint: [0.6, 0.48, 0.28],
        });
        K.ringWall(
          b,
          "glass",
          PX - 1.05,
          dz,
          1.08,
          PY + 0.15,
          PY + 2.5,
          PI * 0.35,
          PI * 0.65,
          6,
          false,
          { col: false },
        );
        K.ringWall(
          b,
          "glass",
          PX - 1.05,
          dz,
          1.08,
          PY + 0.15,
          PY + 2.5,
          -PI * 0.35,
          -PI * 0.65,
          6,
          false,
          { col: false },
        );
        for (let k = 0; k < 4; k++) {
          const a = PI / 4 + k * HP;
          b.box(
            "glass",
            PX - 1.05 + Math.cos(a) * 0.52,
            PY + 0.15,
            dz - Math.sin(a) * 0.52,
            1.02,
            2.3,
            0.05,
            { yaw: a, tint: [0.4, 0.44, 0.42] },
          );
          b.beam(
            "brass",
            PX - 1.05,
            PY + 1.0,
            dz,
            PX - 1.05 + Math.cos(a) * 1.0,
            PY + 1.0,
            dz - Math.sin(a) * 1.0,
            0.04,
            0.04,
          );
        }
        b.pipe("brass", PX - 1.05, PY, dz, PX - 1.05, PY + 2.5, dz, 0.05, 6);
        b.col(PX - 2.2, PY, dz - 1.15, PX, PY + 2.8, dz + 1.15, {
          tag: "door",
        });
        for (const s of [-1, 1]) {
          b.boxMM(
            "bronze",
            PX - 0.06,
            PY,
            dz + s * 2.2 - 0.6,
            PX,
            PY + 2.6,
            dz + s * 2.2 + 0.6,
            { tint: [0.4, 0.4, 0.32] },
          );
          b.boxMM(
            "wood_rotten",
            PX - 0.12,
            PY + 0.2,
            dz + s * 2.2 - 0.7,
            PX - 0.08,
            PY + 2.4,
            dz + s * 2.2 + 0.7,
            { tint: [0.6, 0.5, 0.4] },
          );
        }
        // the great lobby window over the doors: the chandelier inside still burns — a dim amber wash behind the grille
        b.plate("lamp", PX - 0.02, PY + 6.5, dz, -1, 0, 6.4, 6.0, null, {
          tint: [0.2, 0.15, 0.09],
          off: 0,
        });
        b.plate("paint_black", PX - 0.03, PY + 4.6, dz, -1, 0, 6.4, 2.2, null, {
          tint: [0.05, 0.05, 0.05],
          off: 0,
        });
        for (const gz of [-2.2, 0, 2.2])
          b.glow(PX - 0.6, PY + 7.2, dz + gz, [0.3, 0.2, 0.1], 3.0);
        // revolving door drum: warm light behind the glass leaves
        b.plate("lamp", PX - 0.04, PY + 1.3, dz, -1, 0, 1.9, 2.3, null, {
          tint: [0.16, 0.12, 0.07],
          off: 0,
        });
        b.glow(PX - 1.05, PY + 1.6, dz, [0.22, 0.15, 0.08], 2.2);
        for (let q = 0; q <= 8; q++)
          b.beam(
            "bronze",
            PX - 0.06,
            PY + 3.5,
            dz - 3.2 + q * 0.8,
            PX - 0.06,
            PY + 9.5,
            dz - 3.2 + q * 0.8,
            0.06,
            0.06,
            { tint: [0.34, 0.34, 0.28] },
          );
        for (let q = 0; q < 5; q++)
          b.beam(
            "bronze",
            PX - 0.06,
            PY + 3.5 + q * 1.5,
            dz - 3.2,
            PX - 0.06,
            PY + 3.5 + q * 1.5,
            dz + 3.2,
            0.05,
            0.05,
            { tint: [0.34, 0.34, 0.28] },
          );
        b.plate(
          "neon",
          PX - 0.1,
          PY + 3.05,
          dz,
          -1,
          0,
          3.8,
          0.55,
          K.neonCell("ppn_ho_65000", "PEnnsylvania 6-5000", 768, 110, {
            color: "#ffb040",
            broken: 1,
            font: "Georgia, serif",
            italic: true,
          }),
          { off: 0.0 },
        );
      }
      // brass marquee lamps on the columns' pedestals (dead) and flagpoles over the entablature
      for (const s of [-1, 1]) {
        const fz = -119 + s * 3.2;
        b.pipe("steel", X0 + 0.2, 13.8, fz, X0 - 3.4, 16.8, fz, 0.05, 5, {
          tint: [0.6, 0.6, 0.58],
        });
        b.quad(
          "art",
          [X0 - 1.8, 15.6, fz],
          [X0 - 3.3, 16.7, fz],
          [X0 - 3.3, 15.4, fz + 0.05],
          [X0 - 1.8, 14.3, fz + 0.05],
          { rect: K.flagCell("us"), grime: 0 },
        );
      }
      // graffiti & warnings: the place is known
      b.plate(
        "decal",
        PX - 0.03,
        PY + 1.9,
        -121.7,
        -1,
        0,
        1.2,
        0.9,
        K.tag("MANIACS", "#c83020", 256, 96, {}),
        { off: 0 },
      );
      b.plate(
        "decal",
        X0 - 0.04,
        2.2,
        -125.5,
        -1,
        0,
        3.4,
        1.0,
        K.tag("DON'T GO IN", "#e0d8c0", 384, 96, {}),
        { off: 0 },
      );
      b.plate(
        "decal",
        X0 - 0.04,
        2.4,
        -110.8,
        -1,
        0,
        3.0,
        1.0,
        K.tag("NO VACANCY", "#c83020", 384, 96, { rot: 0.06 }),
        { off: 0 },
      );
      b.plate(
        "art",
        X0 - 0.02,
        5.8,
        -125.9,
        -1,
        0,
        0.9,
        1.2,
        K.posterCell("rooms"),
        { off: 0.01 },
      );
      b.plate(
        "art",
        X0 - 0.02,
        5.8,
        -112.1,
        -1,
        0,
        0.9,
        1.2,
        K.posterCell("band"),
        { off: 0.01 },
      );
    }

    // ---------------- brick shaft (16..64): E-plan with the light court facing west ----------------
    const SH0 = BASE,
      SH1 = CORN;
    // west faces of the two wings + the court back wall + court sides
    K.fwall(b, "hotelbrick", X0, Z0, X0, CZ0, SH0, SH1 - SH0, -1, 0, {});
    K.fwall(b, "hotelbrick2", X0, CZ1, X0, Z1, SH0, SH1 - SH0, -1, 0, {});
    K.fwall(b, "hotelbrick", CX, CZ0, CX, CZ1, SH0, SH1 - SH0, -1, 0, {
      tint: [0.85, 0.85, 0.85],
    });
    K.fwall(b, "hotelbrick", X0, CZ0, CX, CZ0, SH0, SH1 - SH0, 0, 1, {
      tint: [0.8, 0.8, 0.8],
    });
    K.fwall(b, "hotelbrick2", X0, CZ1, CX, CZ1, SH0, SH1 - SH0, 0, -1, {
      tint: [0.8, 0.8, 0.8],
    });
    b.face(
      "concrete_dark",
      X0,
      BASE + 0.8,
      CZ1,
      1,
      0,
      0,
      0,
      0,
      -1,
      CX - X0,
      CZ1 - CZ0,
      { uv: "top", tint: [0.45, 0.43, 0.4] },
    ); // court floor (roof of the base)
    // north / south / east
    K.fwall(b, "hotelbrick", X0, Z0, X1, Z0, SH0, SH1 - SH0, 0, -1, {
      tint: [0.92, 0.92, 0.92],
    });
    K.fwall(b, "hotelbrick2", X0, Z1, X1, Z1, SH0, SH1 - SH0, 0, 1, {
      tint: [0.95, 0.95, 0.95],
    });
    K.fwall(b, "hotelbrick", X1, Z0, X1, Z1, SH0, SH1 - SH0, 1, 0, {
      tint: [0.8, 0.8, 0.8],
    });
    b.col(X0, SH0, Z0, X1, CORN + 6, CZ0, { tag: "building" });
    b.col(X0, SH0, CZ1, X1, CORN + 6, Z1, { tag: "building" });
    b.col(CX, SH0, CZ0, X1, CORN + 6, CZ1, { tag: "building" });
    // limestone quoins on every outer corner of the wings + belt courses at the 5th and 18th floors
    const corners = [
      [X0, Z0, -1, -1],
      [X0, CZ0, -1, 1],
      [X0, CZ1, -1, -1],
      [X0, Z1, -1, 1],
      [X1, Z0, 1, -1],
      [X1, Z1, 1, 1],
    ];
    for (const [cx, cz, sx, sz] of corners)
      for (let y = SH0; y < SH1 - 0.5; y += 1.6) {
        const long = ((y - SH0) / 1.6) % 2 < 1;
        b.boxMM(
          "limestone",
          cx + (sx < 0 ? -0.06 : -(long ? 0.9 : 0.5)),
          y,
          cz + (sz < 0 ? -0.06 : -(long ? 0.5 : 0.9)),
          cx + (sx < 0 ? (long ? 0.9 : 0.5) : 0.06),
          y + 0.72,
          cz + (sz < 0 ? (long ? 0.5 : 0.9) : 0.06),
          { tint: LIME, faces: "nsewtb" },
        );
      }
    for (const by of [BASE + 3.2 * 4, BASE + 3.2 * 13]) {
      b.boxMM(
        "limestone",
        X0 - 0.15,
        by,
        Z0 - 0.15,
        X1 + 0.15,
        by + 0.4,
        CZ0 + 0.15,
        { tint: LIME, faces: "nsewtb" },
      );
      b.boxMM(
        "limestone",
        X0 - 0.15,
        by,
        CZ1 - 0.15,
        X1 + 0.15,
        by + 0.4,
        Z1 + 0.15,
        { tint: LIME, faces: "nsewtb" },
      );
      b.boxMM("limestone", CX - 0.15, by, CZ0, CX + 0.1, by + 0.4, CZ1, {
        tint: LIME,
        faces: "wtb",
      });
    }
    // the shell hole in the south wing (15th floor): torn brick lip, exposed floor slabs, rebar, a dangling bed frame
    {
      const hx = 70,
        hy = BASE + 3.2 * 10,
        hw = 5.0,
        hh = 5.6,
        zf = Z1;
      b.boxMM(
        "paint_black",
        hx - hw / 2,
        hy,
        zf - 3,
        hx + hw / 2,
        hy + hh,
        zf - 2.9,
        { tint: [0.03, 0.03, 0.03], faces: "s" },
      );
      for (const s of [-1, 1])
        b.boxMM(
          "paint_black",
          hx + (s * hw) / 2 - (s > 0 ? 0.1 : 0),
          hy,
          zf - 3,
          hx + (s * hw) / 2 + (s > 0 ? 0 : 0.1),
          hy + hh,
          zf + 0.01,
          { tint: [0.04, 0.04, 0.04], faces: s > 0 ? "w" : "e" },
        );
      b.plate("paint_black", hx, hy + hh / 2, zf + 0.012, 0, 1, hw, hh, null, {
        tint: [0.03, 0.03, 0.03],
        off: 0.0,
      });
      for (const fy of [hy + 0.2, hy + 3.4]) {
        b.boxMM(
          "concrete",
          hx - hw / 2,
          fy - 0.25,
          zf - 3,
          hx + hw / 2 - 0.8,
          fy,
          zf + 0.25,
          { tint: [0.55, 0.52, 0.48], faces: "nsewtb" },
        );
        for (let k = 0; k < 6; k++)
          b.pipe(
            "rust",
            hx - hw / 2 + 0.4 + k * 0.7,
            fy - 0.12,
            zf + 0.2,
            hx - hw / 2 + 0.5 + k * 0.7 + r() * 0.3,
            fy - 0.3 - r() * 0.6,
            zf + 0.6 + r() * 0.4,
            0.015,
            3,
          );
      }
      b.box("black_iron", hx + 0.8, hy + 0.3, zf + 0.6, 1.4, 0.05, 1.9, {
        yaw: 0.3,
        tint: [0.3, 0.28, 0.26],
      });
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * PI * 2;
        b.box(
          "hotelbrick2",
          hx + Math.cos(a) * (hw / 2 + 0.2),
          hy + hh / 2 + Math.sin(a) * (hh / 2 + 0.2),
          zf + 0.05,
          0.6 + r() * 0.5,
          0.4 + r() * 0.4,
          0.25,
          { yaw: 0, tint: [0.7, 0.6, 0.55] },
        );
      }
      b.burn(hx, hy + hh / 2, zf, 6.5, 0.6);
    }

    // ---------------- crowning cornice, attic, balustrade ----------------
    for (const [ax, az, bx, bz, nx, nz] of [
      [X0, Z0, X0, CZ0, -1, 0],
      [X0, CZ1, X0, Z1, -1, 0],
      [CX, CZ0, CX, CZ1, -1, 0],
      [X0, Z0, X1, Z0, 0, -1],
      [X0, Z1, X1, Z1, 0, 1],
      [X1, Z0, X1, Z1, 1, 0],
    ]) {
      K.cornice(b, ax, az, bx, bz, CORN - 1.2, nx, nz, {
        mat: "limestone",
        tint: LIME,
        depth: 1.3,
        h: 1.2,
        brackets: 0.9,
      });
      K.fwall(b, "limestone", ax, az, bx, bz, CORN, TOP - CORN, nx, nz, {
        tint: LIME.map((v) => v * 0.92),
      });
      b.boxMM(
        "limestone",
        Math.min(ax, bx) + (nx > 0 ? 0 : nx < 0 ? -0.2 : 0),
        TOP,
        Math.min(az, bz) + (nz < 0 ? -0.2 : 0),
        Math.max(ax, bx) + (nx > 0 ? 0.2 : 0),
        TOP + 0.35,
        Math.max(az, bz) + (nz > 0 ? 0.2 : 0),
        { tint: LIME, faces: "nsewt" },
      );
      const len = Math.hypot(bx - ax, bz - az),
        n = Math.floor(len / 2.4);
      for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n;
        K.window(
          b,
          ax + (bx - ax) * t,
          CORN + 3.0,
          az + (bz - az) * t,
          nx,
          nz,
          0.9,
          1.4,
          {
            state: r() < 0.3 ? "broken" : "dark",
            surround: "limestone",
            surroundTint: LIME,
            sill: false,
          },
        );
      }
    }
    b.face("concrete_dark", X0, TOP, Z1, 1, 0, 0, 0, 0, -1, X1 - X0, Z1 - Z0, {
      uv: "top",
      tint: [0.5, 0.48, 0.45],
    });

    // ---------------- rooftop: the neon sign on its steel lattice, water tanks, bulkheads ----------------
    {
      const sx = 66,
        sy = TOP + 0.3,
        z0s = -129,
        z1s = -109,
        H = 5.2;
      for (let k = 0; k <= 8; k++) {
        const z = z0s + (k * (z1s - z0s)) / 8;
        b.beam("rust", sx, sy, z, sx, sy + H, z, 0.12, 0.12, {
          tint: [0.4, 0.3, 0.24],
        });
        b.beam("rust", sx + 2.2, sy, z, sx, sy + H, z, 0.08, 0.08, {
          tint: [0.4, 0.3, 0.24],
        });
        if (k < 8) {
          const z2 = z0s + ((k + 1) * (z1s - z0s)) / 8;
          b.beam("rust", sx, sy, z, sx, sy + H, z2, 0.05, 0.05, {
            tint: [0.4, 0.3, 0.24],
          });
        }
      }
      for (const yy of [sy + 0.3, sy + H - 0.1])
        b.beam("rust", sx, yy, z0s, sx, yy, z1s, 0.1, 0.1, {
          tint: [0.4, 0.3, 0.24],
        });
      b.plate(
        "neon",
        sx - 0.15,
        sy + 3.2,
        (z0s + z1s) / 2,
        -1,
        0,
        19.5,
        3.0,
        K.neonCell("ppn_ho_roof", "HOTEL PENNSYLVANIA", 2048, 256, {
          color: "#ff3a24",
          broken: 2,
          font: 'Georgia, "Times New Roman", serif',
        }),
        { off: 0 },
      );
      b.plate(
        "paint_black",
        sx - 0.05,
        sy + 3.2,
        (z0s + z1s) / 2,
        -1,
        0,
        19.6,
        3.1,
        null,
        { tint: [0.06, 0.05, 0.05], off: 0 },
      );
      b.plate(
        "art",
        sx - 0.12,
        sy + 1.0,
        (z0s + z1s) / 2,
        -1,
        0,
        7.5,
        0.8,
        K.signCell("ppn_ho_rooms", "2,200 ROOMS · 2,200 BATHS", 512, 56, {
          bg: "#1c1a14",
          fg: "#d8b860",
          font: "Georgia, serif",
        }),
        { off: 0 },
      );
      for (const [tx, tz] of [
        [75, -127],
        [77, -112],
      ]) {
        for (const [u, v] of [
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ])
          b.beam(
            "rust",
            tx + u * 0.9,
            TOP,
            tz + v * 0.9,
            tx + u * 0.8,
            TOP + 2.6,
            tz + v * 0.8,
            0.1,
            0.1,
          );
        b.cyl("wood_rotten", tx, TOP + 2.6, tz, 1.3, 1.3, 2.8, 14, {
          tint: [0.52, 0.42, 0.32],
        });
        b.cyl("rust", tx, TOP + 5.4, tz, 1.4, 0.1, 0.9, 14, {
          tint: [0.45, 0.32, 0.24],
        });
      }
      b.boxMM("limestone", 72, TOP, -121, 78, TOP + 3.4, -117, {
        tint: LIME.map((v) => v * 0.85),
      }); // elevator bulkhead
    }

    // ---------------- street level dressing ----------------
    K.litter(b, X0 - 0.2 + 0.4, Z0 + 0.5, X0 + 1.2, Z1 - 0.5, 0.02, 12, 1201);
    b.hplate(
      "decal",
      X0 + 2.5,
      PY + 0.013,
      -118.4,
      2.6,
      2.2,
      0.5,
      K.decal("blood", 21),
    );
    b.hplate(
      "decal",
      X0 + 0.6,
      0.03,
      -113.2,
      2.2,
      2.0,
      0.2,
      K.decal("grime", 22),
    );

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_hotelpenn_ext";

    K.anchor(ctx, "door", PX - 3.0, PY, -119, false);
    K.skel(ctx, X0 + 2.8, PY, -121.2, 0.8, "curled", { world: true });
    K.skel(ctx, X0 - 0.8, 0.02, -109.2, 2.0, "lying", { world: true });
    K.loot(ctx, "sandbags", X0 + 2.8, PY, -116.6, HP, {
      world: true,
      low: true,
    });
    K.loot(ctx, "barrel", X0 + 3.6, PY, -122.4, 0, {
      world: true,
      tipped: true,
    });
  }

  // ==================================================================
  // DATA: items, notes, Mabel's dialogue
  // ==================================================================
