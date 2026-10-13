/* src/poi_penn/20_hotelpenn.js */
/* =====================================================================
 * NEW RAD CITY — poi_penn / 20_hotelpenn.js
 * HOTEL PENNSYLVANIA — Maniac dungeon ("2,200 rooms, 2,200 baths").
 *
 * EXTERIOR (site x 51..81, z −132..−106; the entrance faces WEST onto the
 *   avenue, looking across at Pennsylvania Station):
 *   four-storey rusticated limestone base with the recessed portico of four
 *   colossal Ionic columns and the brass revolving door, "HOTEL
 *   PENNSYLVANIA" carved in the frieze, shopfronts either side; the
 *   red-brown brick shaft (E-plan with a light court facing the avenue),
 *   limestone belt courses and quoins, the heavy crowning cornice and
 *   attic, and the rooftop steel-lattice neon sign with dead letters.
 *   A shell has blown a hole through the south wing's 15th floor.
 * INTERIOR (cell hotel_pennsylvania) → 21_hotelpenn_interior.js.
 * Content: Mabel Kowalczyk, the night operator still on shift at
 *   the PEnnsylvania 6-5000 switchboard (friendly, faction 'settlers'),
 *   the delivery end of "Neither Snow Nor Rain" (10_farley.js), the
 *   hotel passkey, the Maniac Bruiser on the Café Rouge bandstand.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._ppn;
  const K = PV.kit;
  const PI = Math.PI,
    HP = PI / 2;
  const rgba = K.rgba;

  const HO = (PV.ho = {
    X0: 51,
    X1: 81,
    Z0: -132,
    Z1: -106,
    BASE: 16,
    CORN: 64,
    TOP: 70,
    PX: 57.4, // portico back wall (doors) — 6.4 m deep recess: a clear walk between the columns and the revolving door
    PY: 0.9, // portico floor
    CZ0: -123,
    CZ1: -115,
    CX: 62, // light court (west side), recessed to x 62 above the base
  });
  // the street door's interact point stands just IN FRONT of the revolving drum (its collider starts at PX − 2.2), so the
  // focus ray is never occluded by the door's own collider
  HO.door = new THREE.Vector3(HO.PX - 2.3, HO.PY + 1.3, -119);

  // ------------------------------------------------------------------
  // Brick shaft façade texture: 4 bays × 4 storeys per repeat (12.8 m square),
  // paired sash windows with limestone sills/lintels; dark, broken, boarded,
  // curtains blowing out, soot above a few burnt rooms.
  // ------------------------------------------------------------------
  function paintBrick(x, S, r, dmg) {
    x.fillStyle = "#7a4634";
    x.fillRect(0, 0, S, S);
    // brick courses
    for (let j = 0; j < S; j += 5) {
      const off = (j / 5) % 2 ? 6 : 0;
      for (let i = -12; i < S; i += 12) {
        const v = 0.82 + r() * 0.3;
        x.fillStyle = rgba(122 * v, 68 * v, 50 * v, 1);
        x.fillRect(i + off + 1, j + 1, 10, 3.4);
      }
    }
    const n = 4,
      bw = S / n,
      sh = S / n;
    for (let j = 0; j < n; j++) {
      // limestone band at every floor line (thin)
      x.fillStyle = "rgba(190,180,160,0.25)";
      x.fillRect(0, j * sh + sh - 3, S, 2);
      for (let i = 0; i < n; i++) {
        for (const k of [0, 1]) {
          const W = bw * 0.26,
            H = sh * 0.58,
            X = i * bw + bw * 0.2 + k * bw * 0.34,
            Y = j * sh + sh * 0.18;
          const u = r();
          x.fillStyle = "#d0c6b0";
          x.fillRect(X - 4, Y - 7, W + 8, 6); // lintel
          x.fillStyle = "#d6ccb6";
          x.fillRect(X - 5, Y + H, W + 10, 5); // sill
          x.fillStyle = "#3a2a22";
          x.fillRect(X - 2, Y - 1, W + 4, H + 2); // reveal
          if (u < 0.12 + dmg * 0.1) {
            // broken: black void, shards, soot plume above
            x.fillStyle = "#0a0808";
            x.fillRect(X, Y, W, H);
            for (let q = 0; q < 3; q++) {
              x.fillStyle = "rgba(150,165,165,0.55)";
              x.beginPath();
              x.moveTo(X + r() * W, Y + H);
              x.lineTo(X + r() * W, Y + H - r() * H * 0.5);
              x.lineTo(X + r() * W, Y + H);
              x.fill();
            }
            if (r() < 0.5 + dmg) {
              const g = x.createLinearGradient(0, Y, 0, Y - sh * 0.8);
              g.addColorStop(0, "rgba(15,10,8,0.7)");
              g.addColorStop(1, "rgba(15,10,8,0)");
              x.fillStyle = g;
              x.beginPath();
              x.moveTo(X - 4, Y);
              x.lineTo(X + W + 4, Y);
              x.lineTo(X + W + 14, Y - sh * 0.8);
              x.lineTo(X - 14, Y - sh * 0.8);
              x.fill();
            }
          } else if (u < 0.2 + dmg * 0.1) {
            // boarded
            x.fillStyle = "#6a5642";
            x.fillRect(X, Y, W, H);
            x.fillStyle = "rgba(30,20,12,0.6)";
            for (let q = 0; q < 5; q++)
              x.fillRect(X, Y + (q * H) / 5 + 2, W, 2);
          } else {
            const g = x.createLinearGradient(X, Y, X + W, Y + H);
            g.addColorStop(0, "#263030");
            g.addColorStop(0.5, "#3c4846");
            g.addColorStop(1, "#1a1e1e");
            x.fillStyle = g;
            x.fillRect(X, Y, W, H);
            x.fillStyle = "rgba(200,215,210,0.10)";
            x.fillRect(X + W * 0.12, Y, W * 0.14, H);
            if (u > 0.8) {
              x.fillStyle =
                r() < 0.5 ? "rgba(200,190,160,0.75)" : "rgba(120,40,30,0.7)";
              x.fillRect(
                X + (r() < 0.5 ? 0 : W * 0.55),
                Y,
                W * 0.45,
                H * (0.6 + r() * 0.4),
              );
            } // drawn curtain
            if (u > 0.93) {
              x.fillStyle = "rgba(220,210,190,0.8)";
              x.beginPath();
              x.moveTo(X + W * 0.3, Y + H);
              x.quadraticCurveTo(
                X + W * 0.6,
                Y + H + sh * 0.3,
                X + W * 0.2,
                Y + H + sh * 0.45,
              );
              x.lineTo(X + W * 0.05, Y + H + sh * 0.3);
              x.fill();
            } // curtain blowing out
          }
          x.fillStyle = "#2a2420";
          x.fillRect(X, Y + H * 0.5, W, 3); // meeting rail
        }
      }
    }
    K.stains(x, 0, 0, S, S, 24, 991 + dmg * 10, 0.35, [30, 22, 16]);
    K.streaks(x, 0, 0, S, S, 70, 992, 0.3);
    K.grain(x, 0, 0, S, S, 22, 993);
  }
  K.customPaint.hotelbrick = (x, S, r) => paintBrick(x, S, r, 0);
  K.customPaint.hotelbrick2 = (x, S, r) => paintBrick(x, S, r, 0.35);
  K.MATDEF.hotelbrick = {
    custom: "hotelbrick",
    tile: [12.8, 12.8],
    rough: 0.92,
  };
  K.MATDEF.hotelbrick2 = {
    custom: "hotelbrick2",
    tile: [12.8, 12.8],
    rough: 0.92,
  };

  const LIME = [0.86, 0.83, 0.76];

  // ==================================================================
  // EXTERIOR
  // ==================================================================
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
  const WALT_LETTER =
    "Mabel —\n\nLeave came through! Home Sunday on the 6:10 into Penn Station, a block from you. I'll ring the board at eight like I promised, and when you hear \"PEnnsylvania 6-5000\" in my voice you better say yes, because I have a ring in my pocket that cost me three months of hazard pay and I am NOT carrying it back to Keflavík.\n\nWear the blue dress.\n\n— Walt\n\nP.S. Don't tell your mother.";
  function data() {
    K.defineItem({
      id: "ppn_hotel_passkey",
      type: "key",
      name: "Hotel Pennsylvania Passkey",
      weight: 0,
      value: 0,
      tags: ["key"],
      desc: 'A heavy brass master key on a red leather fob: HOTEL PENNSYLVANIA — HOUSEKEEPING — ALL FLOORS. Mabel kept it in her coffee can "for emergencies."',
    });
    K.defineItem({
      id: "ppn_walts_letter",
      type: "note",
      name: "Walt's Letter",
      title: "Walt's Letter (opened)",
      text: WALT_LETTER,
      weight: 0,
      value: 0,
      desc: 'Twenty-two years late. Mabel gave it back to you to keep, "so someone remembers it."',
    });
    K.defineItem({
      id: "ppn_baton",
      type: "misc",
      name: "Johnny Starr's Baton",
      weight: 0.2,
      value: 90,
      tags: ["valuable", "unique"],
      desc: 'An ebony conductor\'s baton with a silver ferrule engraved "J.S. — CAFÉ ROUGE — 1000 NIGHTS." It still sets a Geiger counter clicking.',
    });
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    const q = K.q;
    const sign = (how) => () => {
      K.take("ppn_special_letter", 1);
      if (!K.has("ppn_receipt")) K.give("ppn_receipt", 1);
      PV.setFlag("ho_delivered", how);
      if (q.active("ppn_rounds")) q.set("ppn_rounds", "receipt");
    };
    const D = "Mabel";
    G.dialogue.register("ppn_dlg_dottie", {
      start: () => {
        if (PV.flag("ho_delivered"))
          return PV.flag("ho_dottie_cruel") ? "after_cruel" : "after";
        if (K.has("ppn_special_letter")) return "hello_letter";
        return PV.flag("ho_met") ? "hello2" : "hello";
      },
      nodes: {
        hello: {
          speaker: D,
          onEnter: () => PV.setFlag("ho_met", true),
          text: "[A thin woman in a threadbare operator's uniform sits at the switchboard, headset clamped over grey pin curls. She doesn't turn around.] Hotel Pennsylvania, PEnnsylvania six, five-oh-oh-oh. How may I direct your call? ...Oh! A walk-in. We don't get a lot of walk-ins, hon.",
          responses: [
            { text: "Who are you?", next: "who" },
            { text: "What about all the Maniacs out there?", next: "guests" },
            { text: "You're... not one of them.", next: "notmaniac" },
            { text: "Sorry. Wrong number.", end: true },
          ],
        },
        hello2: {
          speaker: D,
          text: "Hotel Pennsylvania, how may I— oh, it's you, hon. Still no call. Line twelve's quiet. Line twelve's always quiet.",
          responses: [
            { text: "Who are you waiting for?", next: "waiting" },
            { text: "Tell me about the Café Rouge.", next: "rouge" },
            { text: "Take care, Mabel.", end: true },
          ],
        },
        who: {
          speaker: D,
          text: "Mabel. Mabel Kowalczyk, night operator, Hotel Pennsylvania switchboard, since nineteen fifty-eight. I'm on shift.",
          responses: [
            { text: "How long have you been on shift?", next: "long" },
            { text: "Who are you waiting for?", next: "waiting" },
          ],
        },
        long: {
          speaker: D,
          text: "What's today, hon? ...No, don't tell me. I stopped asking. I'm waiting on a call, that's all, and you don't leave the board when you're waiting on a call. That's the first thing they teach you.",
          responses: [{ text: "Whose call?", next: "waiting" }],
        },
        waiting: {
          speaker: D,
          text: "My Walter. Private Walter Nowak, First Infantry, Iceland garrison. He's got leave this weekend. He said he'd ring the hotel at eight sharp Sunday morning, end of my shift, and I'd better be on the board. [She smooths her skirt.] So I'm on the board.",
          responses: [
            {
              text: "Mabel... the war's over. It's been a long time.",
              next: "over",
            },
            { text: "I hope he calls.", next: "hope0" },
          ],
        },
        over: {
          speaker: D,
          text: "[She laughs, a dry rustle.] Oh, I know that, hon. I know it the way you know you're not twenty any more. But knowing and hanging up are two different things. Operators never hang up first. It's rude.",
          responses: [
            { text: "Tell me about the Café Rouge.", next: "rouge" },
            { text: "Goodbye, Mabel.", end: true },
          ],
        },
        hope0: {
          speaker: D,
          text: "So do I. Every morning at eight. [She checks a stopped clock.] Any minute now.",
          responses: [{ text: "Goodbye, Mabel.", end: true }],
        },
        guests: {
          speaker: D,
          text: "The guests? They don't come in here. Steel door, and they've forgotten how doors work. Just don't make any sudden moves in the Café Rouge, hon. The bandleader's got a temper, and he's the biggest of the lot.",
          responses: [
            { text: "The bandleader?", next: "rouge" },
            { text: "Who are you?", next: "who" },
          ],
        },
        notmaniac: {
          speaker: D,
          text: 'Neither are you, and nobody\'s giving you a medal for it. [She taps her headset.] Keeping busy helps. Routine. Plug in, plug out, "one moment please." The ones out there, they just... stopped being busy.',
          responses: [{ text: "Who are you waiting for?", next: "waiting" }],
        },
        rouge: {
          speaker: D,
          text: "Johnny Starr and his Stardust Orchestra, Saturday nights at the Café Rouge, and the Sunday-morning brunch hour on the radio. The whole city danced to that band. They were playing the brunch broadcast when the lights went — well. They never stopped, is the thing. Johnny's still up on the bandstand, waving his baton at nobody, big as a stevedore and screaming the count-in. Don't go up there without a lot of bullets and a little Prussian Blue.",
          responses: [{ text: "Thanks for the warning.", end: true }],
        },
        hello_letter: {
          speaker: D,
          text: "Hotel Pennsylvania, PEnnsylvania six, five-oh-oh-oh. How may I direct— [She turns, sees the envelope in your hand. Her hands stop on the cords.]",
          responses: [
            {
              text: "Special delivery for Miss Mabel Kowalczyk. From Iceland.",
              next: "letter",
            },
            { text: "Postage due on this one. Fifty scrip.", next: "due" },
          ],
        },
        due: {
          speaker: D,
          onEnter: () => {
            K.scrip(50);
            K.standing(-5, "Charged Mabel postage due");
          },
          text: "Postage due? [She fishes in a coffee can full of old-world coins and scrip and counts out fifty with shaking fingers.] Here. Robbery. Now give it here, hon, give it here.",
          responses: [{ text: "[Hand over the letter]", next: "letter" }],
        },
        letter: {
          speaker: D,
          text: "[She takes it in both hands. Turns it over. Over again. Her thumb finds the postmark.] Keflavík. March fourth. That's — that's a Saturday. He mailed it Friday. [A long, shaky breath.] My eyes aren't what they were. Would you read it to me, hon?",
          responses: [
            { text: "[Open it and read it aloud]", next: "read" },
            { text: "Are you sure you want to hear it?", next: "sure" },
          ],
        },
        sure: {
          speaker: D,
          text: "I have been sitting at this board for — for a long time, hon. I am sure.",
          responses: [{ text: "[Open it and read it aloud]", next: "read" }],
        },
        read: {
          speaker: D,
          text: "\"Mabel — Leave came through! Home Sunday on the 6:10 into Penn Station, a block from you. I'll ring the board at eight like I promised, and when you hear PEnnsylvania 6-5000 in my voice you better say yes, because I have a ring in my pocket that cost me three months of hazard pay and I am not carrying it back to Keflavík. Wear the blue dress. — Walt. P.S. Don't tell your mother.\"",
          responses: [{ text: "[Wait]", next: "after_read" }],
        },
        after_read: {
          speaker: D,
          text: "[A sound comes out of her that might be a laugh.] The six-ten. The six-ten Sunday morning. [Quiet.] The bombs were Sunday morning, hon. He was a block away. Twenty-two years I've had this board plugged into line twelve, waiting on a call that was never — [She stops.] He was going to ask me.",
          responses: [
            {
              text: "I'm so sorry, Mabel. He loved you. It's all over that letter.",
              next: "kind",
              action: sign("kind"),
            },
            {
              text: "[Persuasion 50] Maybe he made it to a shelter under the station. Maybe he's still out there.",
              check: { skill: "persuasion", value: 50 },
              next: "hope",
              failNext: "hope_fail",
            },
            {
              text: "He's dead. Everyone from back then is dead. Stop waiting.",
              next: "cruel",
              action: () => {
                sign("cruel")();
                PV.setFlag("ho_dottie_cruel", true);
                K.standing(-15, "Crushed Mabel");
              },
            },
          ],
        },
        kind: {
          speaker: D,
          onEnter: () => {
            K.standing(15, "Delivered Walt's letter");
            K.give("ppn_hotel_passkey", 1);
            K.give("ppn_walts_letter", 1, true);
          },
          text: "[She wipes her eyes with the back of a glove.] He did, didn't he. [She signs your green card — M-A-B-E-L — with the switchboard pencil.] Here. You tell that machine the mail went through. And take this. [A brass key on a red fob.] The passkey. Every room in the house. Management won't mind — management's been gone since '67. And keep the letter, would you? So somebody remembers it.",
          responses: [{ text: "What will you do now?", next: "now" }],
        },
        hope: {
          speaker: D,
          onEnter: () => {
            K.give("ppn_hotel_passkey", 1);
            K.xp(25, "Gave Mabel hope");
          },
          text: "[She looks at you a long time. Then she almost smiles.] ...The shelters under Penn Station. They say some folks down there go back to before the war. [She signs your card.] I'll keep line twelve open a little longer, then. Here — the passkey, hon. You'll get further in this old barn with it than without it.",
          responses: [
            {
              text: "Take care of yourself, Mabel.",
              end: true,
              action: sign("hope"),
            },
          ],
        },
        hope_fail: {
          speaker: D,
          text: "[She shakes her head, very gently.] Don't, hon. I'm old, I'm not stupid. [She signs your card anyway.] But thank you for trying.",
          responses: [
            { text: "I'm sorry.", next: "kind", action: sign("kind") },
          ],
        },
        cruel: {
          speaker: D,
          text: "[She pulls the headset off. Sets it on the desk, very carefully, like it might break.] ...Sign your card, carrier. [She signs.] Then get out of my exchange.",
          responses: [{ text: "[Leave]", end: true }],
        },
        now: {
          speaker: D,
          text: "Now? [She looks at the board. At line twelve.] Now I think I'll finally unplug it. [She pulls the cord. It's the smallest sound.] And then I think I'll go up and see the Café Rouge. I never got to go dancing there. Walt was going to take me.",
          responses: [{ text: "Goodbye, Mabel.", end: true }],
        },
        after: {
          speaker: D,
          text: "Hotel Pennsylvania... oh. Hello, hon. Line twelve's unplugged. It's strange, the quiet. Good strange.",
          responses: [{ text: "Goodbye, Mabel.", end: true }],
        },
        after_cruel: {
          speaker: D,
          text: "[She doesn't look up from the board.] We're closed.",
          responses: [{ text: "[Leave]", end: true }],
        },
      },
    });
  }

  // ==================================================================
  // SPAWN: Mabel (friendly settler, barricaded in her exchange)
  // ==================================================================
  function spawn(ctx) {
    const A = ctx.anchors;
    if (A.dottie)
      PV.spawnActor(ctx, {
        id: "ppn_dottie",
        type: "human",
        gender: "f",
        outfit: "settler",
        hat: "headphones",
        hatColor: 0x2a2a2a,
        name: "Mabel",
        faction: "settlers",
        level: 5,
        hostile: false,
        essential: true,
        pos: { x: A.dottie.x, y: A.dottie.y, z: A.dottie.z },
        yaw: -HP,
        ai: "sit",
        home: "here",
        homeR: 0.6,
        dialogue: "ppn_dlg_dottie",
        noRespawn: true,
        lookYaw: -HP,
        barks: [
          "Hotel Pennsylvania, one moment please.",
          "PEnnsylvania six, five-oh-oh-oh...",
          "Line twelve. Still quiet.",
          "Connecting you now, hon.",
        ],
      });
  }
  function update(dt, realDt, ctx) {
    if (PV.hoInteriorUpdate) PV.hoInteriorUpdate(dt, realDt, ctx);
  }

  PV.define({
    id: "hotel_pennsylvania",
    name: "Hotel Pennsylvania",
    interior: "hotel_pennsylvania",
    order: 20,
    build(ctx) {
      exterior(ctx);
      if (PV.hoInterior) PV.hoInterior(ctx);
    },
    data,
    spawn,
    update,
  });
})();
