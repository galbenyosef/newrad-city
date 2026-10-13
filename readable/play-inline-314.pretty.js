/* src/poi_herald/10_newyorker.js */
/* =====================================================================
 * NEW RAD CITY — poi_herald / 10_newyorker.js
 * HOTEL NEW YORKER (8th Avenue & 34th Street, 1930) — robot-held dungeon.
 *
 * EXTERIOR (site x −190..−130, z −89..−56; main entrance on 8th Avenue,
 *   facing east): buff-brick art-deco slab with limestone base, continuous
 *   vertical piers and chevron spandrels, three stepped setbacks with
 *   ziggurat parapets, a chamfered central tower with fluted crown, and
 *   the huge red NEW YORKER letters on a steel lattice on the roof (neon
 *   at night, some letters dead). Deco marquee over the 8th Ave doors,
 *   "A RADIO IN EVERY ROOM" ghost sign, blown-out upper corner with
 *   exposed girders, scorch, a dead Patrolman at the door.
 * INTERIOR (cell hotel_new_yorker, origin 8600,0,800):
 *   LOBBY (marble & bronze, front desk + key wall, elevator bank,
 *   grand staircase) → MEZZANINE → GRAND BALLROOM (Shamrock Ball,
 *   Mar. 5 1967; stage, skeleton band, dancers) → service corridor →
 *   emergency stairs → 33rd FLOOR corridor (rooms 3321–3335) →
 *   ROOM 3327, the Tesla Suite (pigeon cages, exhibit ropes) → behind the
 *   wardrobe: TESLA'S LABORATORY (three arcing Tesla coils, dynamos,
 *   catwalk + control booth, Faraday cage with the TELEFORCE) →
 *   freight elevator back down to the lobby (loop).
 *   Shortcut: restore elevator car 3 from the front-desk terminal (or the
 *   bell captain's key) → straight up to 33.
 * Quest "The Pigeon Man of Room 3327" (given by Pembroke at the Automat).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PH = G._ph;
  const K = PH.kit;
  const PI = Math.PI,
    HP = PI / 2;

  // ---- exterior footprint (world) ----
  const X0 = -188,
    X1 = -132,
    Z0 = -87,
    Z1 = -58;
  const BASE_H = 9.6; // limestone base (ground floor + mezzanine)
  const BODY_H = 72; // full-footprint slab
  const T1 = { x0: -185, x1: -135, z0: -84, z1: -61, h: 90 }; // first setback
  const T2 = { x0: -179, x1: -141, z0: -81, z1: -64, h: 106 }; // second setback
  const TW = { x0: -171, x1: -149, z0: -78.5, z1: -66.5, h: 122 }; // tower
  const DOOR_Z = -72.5; // 8th Ave entrance (east face x = X1)

  // ---- interior levels (local) ----
  const MEZ_Y = 5.2; // mezzanine & ballroom floor
  const LOBBY_H = 8.4;

  // ==================================================================
  // shared art cells
  // ==================================================================
  function lettersCell() {
    return K.paint("art", "ny_letters", 1024, 160, function (x, X, Y, W, H) {
      x.clearRect(X, Y, W, H);
      x.font = 'bold 132px "Arial Black", Impact, sans-serif';
      x.textAlign = "center";
      x.textBaseline = "middle";
      const txt = "NEW YORKER";
      // measure per-letter to draw bulbs along strokes
      x.lineWidth = 10;
      x.strokeStyle = "#3a0806";
      x.strokeText(txt, X + W / 2, Y + H / 2 + 6, W * 0.98);
      x.fillStyle = "#c8201a";
      x.fillText(txt, X + W / 2, Y + H / 2 + 6, W * 0.98);
      // weathering: rust blooms & missing paint
      const r = K.rng("ny_letters");
      for (let k = 0; k < 120; k++) {
        x.fillStyle =
          "rgba(" +
          (r() < 0.5 ? "90,40,20" : "60,20,15") +
          "," +
          (0.2 + r() * 0.4).toFixed(2) +
          ")";
        x.fillRect(X + r() * W, Y + r() * H, 3 + r() * 10, 2 + r() * 6);
      }
      // bulb dots (only where letters are): sample the painted alpha
      const img = x.getImageData(X, Y, W, H).data;
      x.fillStyle = "rgba(255,236,200,0.85)";
      for (let yy = 14; yy < H - 8; yy += 16)
        for (let xx = 8; xx < W - 8; xx += 16) {
          const a = img[(yy * W + xx) * 4 + 3],
            rr = img[(yy * W + xx) * 4];
          if (a > 200 && rr > 120 && r() < 0.75) {
            x.beginPath();
            x.arc(X + xx, Y + yy, 3, 0, 6.3);
            x.fill();
          }
        }
    });
  }
  function lettersNeon() {
    return K.neonCell("ny_letters_neon", "NEW YORKER", 1024, 160, {
      color: "#ff2418",
      font: '"Arial Black", Impact, sans-serif',
      size: 132,
      broken: 2,
    });
  }

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "ny_ext", grime: 0.55, seg: 6 });
    const r = K.rng("ny_ext");
    const buff = [1.0, 0.97, 0.92],
      lime = [0.86, 0.82, 0.74];

    // ---------- a slab of façade: deco_bays texture + protruding piers ----------
    /** walls of an axis-aligned block from y0 to y1; pier every `pier` metres. */
    function block(x0, z0, x1, z1, y0, y1, o) {
      o = o || {};
      const tint = o.tint || buff;
      const uvo = o.uvo || 0;
      // faces (normals outward)
      b.face("deco_bays", x0, y0, z1, 1, 0, 0, 0, 1, 0, x1 - x0, y1 - y0, {
        tint,
        uo: uvo,
      }); // south (+z)
      b.face("deco_bays", x1, y0, z0, -1, 0, 0, 0, 1, 0, x1 - x0, y1 - y0, {
        tint,
        uo: uvo + 1.3,
      }); // north (−z)
      b.face("deco_bays", x1, y0, z1, 0, 0, -1, 0, 1, 0, z1 - z0, y1 - y0, {
        tint,
        uo: uvo + 2.6,
      }); // east (+x)
      b.face("deco_bays", x0, y0, z0, 0, 0, 1, 0, 1, 0, z1 - z0, y1 - y0, {
        tint,
        uo: uvo + 3.9,
      }); // west (−x)
      // piers (continuous verticals — the deco signature)
      const pier = o.pier || 5.2,
        pw = 0.55,
        pd = 0.35;
      const pierTint = [0.95, 0.9, 0.8];
      for (let x = x0 + pier; x < x1 - 0.5; x += pier) {
        b.box("brick_tan", x, y0, z1 + pd / 2, pw, y1 - y0 + 0.4, pd, {
          tint: pierTint,
          faces: "sewt",
        });
        b.box("brick_tan", x, y0, z0 - pd / 2, pw, y1 - y0 + 0.4, pd, {
          tint: pierTint,
          faces: "newt",
        });
      }
      for (let z = z0 + pier; z < z1 - 0.5; z += pier) {
        b.box("brick_tan", x1 + pd / 2, y0, z, pd, y1 - y0 + 0.4, pw, {
          tint: pierTint,
          faces: "nset",
        });
        b.box("brick_tan", x0 - pd / 2, y0, z, pd, y1 - y0 + 0.4, pw, {
          tint: pierTint,
          faces: "nswt",
        });
      }
      // corner piers (chunkier)
      for (const [cx, cz] of [
        [x0, z0],
        [x1, z0],
        [x0, z1],
        [x1, z1],
      ])
        b.box("brick_tan", cx, y0, cz, 1.1, y1 - y0 + 0.9, 1.1, {
          tint: pierTint,
        });
      // roof slab
      b.face("concrete_dark", x0, y1, z1, 1, 0, 0, 0, 0, -1, x1 - x0, z1 - z0, {
        uv: "top",
        tint: [0.55, 0.52, 0.48],
      });
      // ziggurat parapet (stepped deco crenellations)
      if (o.parapet !== false) parapet(x0, z0, x1, z1, y1);
      b.col(x0, y0, z0, x1, y1, z1, { tag: "building" });
    }
    function parapet(x0, z0, x1, z1, y) {
      const t = 0.5,
        h = 1.2;
      b.boxMM("limestone", x0 - 0.2, y, z0 - 0.2, x1 + 0.2, y + h, z0 + t, {
        tint: lime,
      });
      b.boxMM("limestone", x0 - 0.2, y, z1 - t, x1 + 0.2, y + h, z1 + 0.2, {
        tint: lime,
      });
      b.boxMM("limestone", x0 - 0.2, y, z0, x0 + t, y + h, z1, { tint: lime });
      b.boxMM("limestone", x1 - t, y, z0, x1 + 0.2, y + h, z1, { tint: lime });
      // stepped merlons every 5.2 m
      const step = (ax, az, bx, bz, nx, nz) => {
        const len = Math.hypot(bx - ax, bz - az),
          n = Math.floor(len / 5.2);
        for (let k = 1; k < n; k++) {
          const t2 = k / n,
            px = ax + (bx - ax) * t2,
            pz = az + (bz - az) * t2;
          const alongX = Math.abs(bx - ax) > Math.abs(bz - az);
          for (let s = 0; s < 3; s++) {
            const w = 1.6 - s * 0.45,
              hh = 0.55;
            b.box(
              "limestone",
              px + nx * 0.05,
              y + h + s * hh,
              pz + nz * 0.05,
              alongX ? w : 0.6,
              hh,
              alongX ? 0.6 : w,
              { tint: lime },
            );
          }
        }
      };
      step(x0, z0, x1, z0, 0, -1);
      step(x0, z1, x1, z1, 0, 1);
      step(x0, z0, x0, z1, -1, 0);
      step(x1, z0, x1, z1, 1, 0);
    }

    // ---------- limestone base (ground floor + mezzanine) ----------
    const bz0 = Z0,
      bz1 = Z1,
      bx0 = X0,
      bx1 = X1;
    b.face("limestone", bx0, 0, bz1, 1, 0, 0, 0, 1, 0, bx1 - bx0, BASE_H, {
      tint: lime,
    });
    b.face("limestone", bx1, 0, bz0, -1, 0, 0, 0, 1, 0, bx1 - bx0, BASE_H, {
      tint: lime,
    });
    b.face("limestone", bx1, 0, bz1, 0, 0, -1, 0, 1, 0, bz1 - bz0, BASE_H, {
      tint: lime,
    });
    b.face("limestone", bx0, 0, bz0, 0, 0, 1, 0, 1, 0, bz1 - bz0, BASE_H, {
      tint: lime,
    });
    b.col(bx0, 0, bz0, bx1, BASE_H, bz1, { tag: "building" });
    // polished granite plinth
    b.boxMM("granite", bx0 - 0.25, 0, bz0 - 0.25, bx1 + 0.25, 0.9, bz1 + 0.25, {
      tint: [0.3, 0.28, 0.3],
    });
    // shop windows on 34th St (south) + 8th Ave (east) with bronze frames
    const shopW = (x, y, z, nx, nz, w, h, st) =>
      K.window(b, x, y, z, nx, nz, w, h, {
        state: st,
        sill: false,
        frame: "bronze",
        surround: "bronze",
        surroundTint: [0.55, 0.42, 0.25],
        inset: 0.2,
        fw: 0.14,
      });
    for (let x = bx0 + 4; x < bx1 - 3; x += 6.2)
      shopW(
        x,
        2.9,
        bz1,
        0,
        1,
        4.6,
        3.6,
        r() < 0.35 ? "boarded" : r() < 0.6 ? "broken" : "glass",
      );
    for (let x = bx0 + 4; x < bx1 - 3; x += 6.2)
      shopW(x, 2.9, bz0, 0, -1, 4.6, 3.6, r() < 0.5 ? "boarded" : "broken");
    for (let z = bz0 + 4; z < bz1 - 2; z += 6.2)
      if (Math.abs(z - DOOR_Z) > 5)
        shopW(bx1, 2.9, z, 1, 0, 4.6, 3.6, r() < 0.4 ? "boarded" : "glass");
    for (let z = bz0 + 4; z < bz1 - 2; z += 6.2)
      shopW(bx0, 2.9, z, -1, 0, 4.6, 3.6, "boarded");
    // mezzanine windows (smaller, deco grilles)
    for (let x = bx0 + 3; x < bx1 - 1; x += 3.1) {
      K.window(b, x, 7.4, bz1, 0, 1, 1.9, 2.0, {
        state: r() < 0.3 ? "broken" : "glass",
        sill: false,
        frame: "bronze",
        surround: "limestone",
        surroundTint: lime,
        inset: 0.18,
        lintel: 0.18,
        trimTint: lime,
      });
    }
    for (let z = bz0 + 3; z < bz1 - 1; z += 3.1)
      K.window(b, bx1, 7.4, z, 1, 0, 1.9, 2.0, {
        state: r() < 0.3 ? "broken" : "glass",
        sill: false,
        frame: "bronze",
        surround: "limestone",
        surroundTint: lime,
        inset: 0.18,
        lintel: 0.18,
        trimTint: lime,
      });
    // cornice band between base and brick shaft (with a fluted deco frieze)
    b.boxMM(
      "limestone",
      bx0 - 0.5,
      BASE_H - 0.6,
      bz0 - 0.5,
      bx1 + 0.5,
      BASE_H + 0.3,
      bz1 + 0.5,
      { tint: [0.9, 0.86, 0.78] },
    );
    for (let x = bx0; x <= bx1; x += 0.9) {
      b.box("limestone", x, BASE_H - 1.3, bz1 + 0.35, 0.3, 0.7, 0.3, {
        tint: [0.78, 0.74, 0.66],
      });
    }
    for (let z = bz0; z <= bz1; z += 0.9) {
      b.box("limestone", bx1 + 0.35, BASE_H - 1.3, z, 0.3, 0.7, 0.3, {
        tint: [0.78, 0.74, 0.66],
      });
    }

    // ---------- the brick shaft & setbacks ----------
    block(X0, Z0, X1, Z1, BASE_H + 0.3, BODY_H, { parapet: true });
    block(T1.x0, T1.z0, T1.x1, T1.z1, BODY_H, T1.h, { uvo: 0.7 });
    block(T2.x0, T2.z0, T2.x1, T2.z1, T1.h, T2.h, { uvo: 1.9 });
    // tower: chamfered corners (draw as block + corner fillets)
    block(TW.x0, TW.z0, TW.x1, TW.z1, T2.h, TW.h, { uvo: 3.1, pier: 3.66 });
    // fluted crown: vertical fins stepping up
    const cy0 = TW.h + 1.2;
    const cx = (TW.x0 + TW.x1) / 2,
      cz = (TW.z0 + TW.z1) / 2;
    b.boxMM(
      "limestone",
      TW.x0 + 1.5,
      cy0,
      TW.z0 + 1.5,
      TW.x1 - 1.5,
      cy0 + 5.5,
      TW.z1 - 1.5,
      { tint: lime },
    );
    for (let x = TW.x0 + 2.2; x <= TW.x1 - 2.2; x += 1.45) {
      const hh = 5.5 + 2.5 * (1 - Math.abs(x - cx) / ((TW.x1 - TW.x0) / 2));
      b.box("limestone", x, cy0, TW.z0 + 1.2, 0.45, hh, 0.9, {
        tint: [0.92, 0.88, 0.8],
      });
      b.box("limestone", x, cy0, TW.z1 - 1.2, 0.45, hh, 0.9, {
        tint: [0.92, 0.88, 0.8],
      });
    }
    b.col(TW.x0 + 1.5, cy0, TW.z0 + 1.5, TW.x1 - 1.5, cy0 + 5.5, TW.z1 - 1.5, {
      tag: "building",
    });
    // rooftop water tank (the classic NYC wood tank) on the east setback roof
    {
      const tx = T1.x1 - 5,
        tz = T1.z0 + 5,
        ty = T1.h + 1.2;
      for (const [lx, lz] of [
        [-1.4, -1.4],
        [1.4, -1.4],
        [-1.4, 1.4],
        [1.4, 1.4],
      ])
        b.beam(
          "rust",
          tx + lx,
          ty,
          tz + lz,
          tx + lx * 0.9,
          ty + 3.2,
          tz + lz * 0.9,
          0.18,
          0.18,
        );
      b.cyl("wood_rotten", tx, ty + 3.2, tz, 2.2, 2.1, 4.2, 16, {
        tint: [0.6, 0.48, 0.36],
      });
      for (const y of [0.6, 1.8, 3.0, 4.0])
        b.cyl("rust", tx, ty + 3.2 + y, tz, 2.24, 2.24, 0.12, 16, {
          top: false,
        });
      b.cyl("wood_rotten", tx, ty + 7.4, tz, 2.3, 0.2, 1.3, 16, {
        tint: [0.45, 0.38, 0.3],
      });
    }

    // ---------- blown-out NW corner: missing brick, exposed floors & girders ----------
    {
      const hx0 = X0,
        hx1 = X0 + 9,
        hz0 = Z0,
        hz1 = Z0 + 7,
        hy0 = 48,
        hy1 = BODY_H;
      // dark void cutting the corner (drawn proud of the façade so it hides the brick behind)
      b.boxMM("paint_black", hx0 - 0.5, hy0, hz0 - 0.5, hx1, hy1 + 0.4, hz1, {
        tint: [0.05, 0.045, 0.04],
        faces: "nwt",
      });
      for (let y = hy0 + 3.3; y < hy1; y += 3.3) {
        b.boxMM(
          "concrete",
          hx0 - 0.4,
          y - 0.3,
          hz0 - 0.4,
          hx1 - 1 - r() * 2,
          y,
          hz1 - 1 - r() * 2,
          { tint: [0.6, 0.57, 0.52], faces: "nwtb" },
        );
        b.beam(
          "rust",
          hx0 - 0.3,
          y - 0.45,
          hz0 + 2,
          hx1 + 1.5,
          y - 0.45,
          hz0 + 2,
          0.3,
          0.4,
          { tint: [0.55, 0.38, 0.26] },
        );
        if (r() < 0.6)
          b.beam(
            "rust",
            hx0 + 3,
            y - 0.45,
            hz0 - 0.5,
            hx0 + 3 + r(),
            y - 1.8 - r() * 2,
            hz0 - 2.5,
            0.25,
            0.3,
            { tint: [0.5, 0.35, 0.24] },
          );
      }
      for (let k = 0; k < 4; k++)
        b.beam(
          "rust",
          hx0 + 1 + k * 2.2,
          hy0,
          hz0 - 0.3,
          hx0 + 1 + k * 2.2,
          hy1 - r() * 6,
          hz0 - 0.3,
          0.35,
          0.35,
          { tint: [0.45, 0.32, 0.22] },
        );
      b.burn(hx0 + 4, hy0 + 4, hz0, 14, 0.8);
      b.burn(X1 - 10, 40, Z1, 8, 0.6);
      b.burn(TW.x1, TW.h - 6, TW.z1, 6, 0.5);
      // fallen masonry piled at the foot of the west wall
      K.rubble(b, X0 + 4, 0, Z0 - 0.5, 3.2, 1.6, { seed: 7, col: false });
      K.rubble(b, X0 - 0.2, 0, Z0 + 5, 2.4, 1.2, { seed: 8, col: false });
    }

    // ---------- 8th Avenue entrance: deco portal, bronze doors, marquee ----------
    {
      const x = X1,
        z = DOOR_Z;
      // tall stepped portal (limestone) with a bronze sunburst transom
      b.boxMM("limestone", x, 0, z - 4.2, x + 0.6, 8.4, z + 4.2, {
        tint: [0.92, 0.88, 0.8],
      });
      b.boxMM("limestone", x + 0.6, 0, z - 3.4, x + 1.0, 7.6, z + 3.4, {
        tint: [0.95, 0.92, 0.84],
      });
      b.plate("paint_black", x + 1.02, 2.0, z, 1, 0, 5.6, 4.0, null, {
        tint: [0.06, 0.05, 0.04],
      });
      // three bronze door leaves with glass
      for (const dz of [-1.9, 0, 1.9]) {
        b.boxMM(
          "bronze",
          x + 1.0,
          0,
          z + dz - 0.85,
          x + 1.1,
          3.4,
          z + dz + 0.85,
          { tint: [0.55, 0.4, 0.22] },
        );
        b.plate("glass_dark", x + 1.11, 1.9, z + dz, 1, 0, 1.2, 2.4, null, {
          tint: [0.25, 0.28, 0.27],
        });
        b.beam(
          "chrome",
          x + 1.18,
          1.1,
          z + dz - 0.5,
          x + 1.18,
          1.1,
          z + dz + 0.5,
          0.05,
          0.05,
        );
      }
      const sun = sunburstCell();
      b.plate("art", x + 1.03, 5.4, z, 1, 0, 5.6, 2.6, sun, {
        tint: [0.9, 0.8, 0.6],
      });
      // marquee canopy with bulbs + the name band
      b.boxMM("bronze", x + 0.6, 8.4, z - 5.2, x + 4.4, 9.1, z + 5.2, {
        tint: [0.35, 0.26, 0.16],
      });
      b.boxMM("paint_black", x + 0.6, 8.25, z - 5.1, x + 4.3, 8.4, z + 5.1, {
        tint: [0.1, 0.09, 0.08],
      });
      const band = K.signCell("ny_marquee", "HOTEL NEW YORKER", 1024, 128, {
        bg: "#2a0e0c",
        fg: "#f0dcb0",
        font: '"Arial Black", Impact, sans-serif',
        border: "#c8a050",
      });
      b.plate("art", x + 4.42, 8.75, z, 1, 0, 10.2, 0.7, band, { off: 0.01 });
      b.plate(
        "art",
        x + 2.5,
        8.75,
        z - 5.22,
        0,
        -1,
        3.6,
        0.7,
        K.signCell("ny_marquee_s", "NEW YORKER", 512, 100, {
          bg: "#2a0e0c",
          fg: "#f0dcb0",
          font: '"Arial Black", Impact, sans-serif',
          border: "#c8a050",
        }),
        { off: 0.01 },
      );
      b.plate(
        "art",
        x + 2.5,
        8.75,
        z + 5.22,
        0,
        1,
        3.6,
        0.7,
        K.signCell("ny_marquee_s", "NEW YORKER", 512, 100, {
          bg: "#2a0e0c",
          fg: "#f0dcb0",
          font: '"Arial Black", Impact, sans-serif',
          border: "#c8a050",
        }),
        { off: 0.01 },
      );
      for (let dz = -4.9; dz <= 4.9; dz += 0.7) {
        b.glow(x + 4.35, 8.2, z + dz, [1, 0.8, 0.5], r() < 0.3 ? 0.2 : 0.55);
      }
      for (const dz of [-4.8, 4.8])
        b.beam(
          "black_iron",
          x + 4.2,
          9.0,
          z + dz,
          x + 0.3,
          12.5,
          z + dz,
          0.07,
          0.07,
        ); // tie rods
      b.col(x, 0, z - 4.2, x + 1.0, 8.4, z - 2.8, {});
      b.col(x, 0, z + 2.8, x + 1.0, 8.4, z + 4.2, {});
      // steps
      b.boxMM("granite", x, 0, z - 3.2, x + 2.2, 0.16, z + 3.2, {
        tint: [0.4, 0.38, 0.4],
      });
      // hanging blade sign at the corner of 8th & 34th: vertical HOTEL
      const bx = X1 + 1.1,
        bzz = Z1 - 1.2;
      b.box("paint_red", bx, 12, bzz, 0.4, 9.5, 1.5, {
        tint: [0.55, 0.1, 0.08],
      });
      const vt = K.neonCell("ny_hotel_vert", "HOTEL", 128, 640, {
        color: "#ff3a20",
        vertical: true,
        font: '"Arial Black", sans-serif',
      });
      b.plate("neon", bx + 0.21, 16.75, bzz, 1, 0, 1.3, 9.0, vt, { off: 0.01 });
      b.plate("neon", bx - 0.21, 16.75, bzz, -1, 0, 1.3, 9.0, vt, {
        off: 0.01,
      });
      b.glow(bx + 0.9, 16.8, bzz, [1, 0.25, 0.15], 6);
      for (const y of [13, 20.5])
        b.beam("black_iron", bx, y, bzz, X1 - 0.05, y, bzz, 0.08, 0.08);
    }

    // ---------- "A RADIO IN EVERY ROOM" ghost sign on the south shaft ----------
    const radio = K.signCell(
      "ny_radio_ghost",
      "HOTEL NEW YORKER\n2,500 ROOMS · A RADIO IN EVERY ROOM",
      1024,
      256,
      {
        bg: null,
        fg: "rgba(235,220,190,0.75)",
        font: '"Arial Black", Impact, sans-serif',
        weather: true,
      },
    );
    b.plate(
      "decal",
      (X0 + X1) / 2 - 8,
      BASE_H + 9,
      Z1 + 0.05,
      0,
      1,
      24,
      6,
      radio,
    );
    b.plate(
      "decal",
      X0 - 0.05,
      BASE_H + 12,
      (Z0 + Z1) / 2,
      -1,
      0,
      20,
      5,
      radio,
    );
    // graffiti on the base
    b.plate(
      "decal",
      X1 + 0.03,
      1.6,
      DOOR_Z - 9,
      1,
      0,
      4,
      1.5,
      K.tag("ROBOTS INSIDE", "#e03a2a", 256, 96),
    );
    b.plate(
      "decal",
      X1 + 0.03,
      1.4,
      DOOR_Z + 9.5,
      1,
      0,
      3,
      1.2,
      K.tag("NO VACANCY", "#e8e040", 256, 96, { rot: 0.06 }),
    );

    // ---------- the NEW YORKER roof sign: steel lattice + red letters ----------
    {
      const sy = TW.h + 1.2; // lattice foot (tower roof)
      const LX = 26,
        LZ = 16,
        SH = 4.6,
        lift = 7.0;
      const sx0 = cx - LX / 2,
        sx1 = cx + LX / 2,
        sz0 = cz - LZ / 2,
        sz1 = cz + LZ / 2;
      const y0 = sy + lift,
        y1 = y0 + SH;
      // lattice legs & bracing
      for (const lx of [sx0, sx0 + LX / 3, sx0 + (2 * LX) / 3, sx1])
        for (const lz of [sz0, sz1]) {
          b.beam("rust", lx, sy - 0.2, lz, lx, y1 + 0.3, lz, 0.28, 0.28, {
            tint: [0.45, 0.32, 0.25],
          });
        }
      for (const lz of [sz0, sz1]) {
        for (let k = 0; k < 3; k++) {
          const a = sx0 + (k * LX) / 3,
            c2 = a + LX / 3;
          b.beam("rust", a, sy, lz, c2, y0, lz, 0.14, 0.14, {
            tint: [0.42, 0.3, 0.24],
          });
          b.beam("rust", c2, sy, lz, a, y0, lz, 0.14, 0.14, {
            tint: [0.42, 0.3, 0.24],
          });
        }
        for (const yy of [y0, y1, (y0 + y1) / 2])
          b.beam("rust", sx0, yy, lz, sx1, yy, lz, 0.16, 0.16, {
            tint: [0.45, 0.32, 0.25],
          });
      }
      for (const lx of [sx0, sx1])
        for (const yy of [sy + 1, y0, y1])
          b.beam("rust", lx, yy, sz0, lx, yy, sz1, 0.16, 0.16, {
            tint: [0.45, 0.32, 0.25],
          });
      // catwalk under the letters
      b.boxMM(
        "metal_dark",
        sx0 - 0.4,
        y0 - 0.25,
        sz0 - 1.2,
        sx1 + 0.4,
        y0 - 0.1,
        sz0 + 0.2,
        { tint: [0.3, 0.3, 0.3] },
      );
      b.boxMM(
        "metal_dark",
        sx0 - 0.4,
        y0 - 0.25,
        sz1 - 0.2,
        sx1 + 0.4,
        y0 - 0.1,
        sz1 + 1.2,
        { tint: [0.3, 0.3, 0.3] },
      );
      // letters: physical red plate (art, alpha) + neon overlay, on all four faces
      const L = lettersCell(),
        N = lettersNeon();
      const face = (px, pz, nx, nz, w) => {
        b.plate("art", px, (y0 + y1) / 2, pz, nx, nz, w, SH, L, {
          off: 0.25,
          tint: [1, 1, 1],
        });
        b.plate("art", px, (y0 + y1) / 2, pz, -nx, -nz, w, SH, L, {
          off: -0.05,
          tint: [0.55, 0.5, 0.45],
        }); // back of the letters
        b.plate("neon", px, (y0 + y1) / 2, pz, nx, nz, w, SH, N, {
          off: 0.32,
          tint: [0.9, 0.9, 0.9],
        });
        b.glow(px + nx * 2.5, (y0 + y1) / 2, pz + nz * 2.5, [1, 0.18, 0.1], 14);
      };
      face(cx, sz1, 0, 1, LX - 0.6);
      face(cx, sz0, 0, -1, LX - 0.6);
      face(sx1, cz, 1, 0, LZ - 0.4);
      face(sx0, cz, -1, 0, LZ - 0.4);
      // aircraft warning beacon
      b.pipe("rust", cx, y1, cz, cx, y1 + 5, cz, 0.12, 6);
      b.geo("lamp", K.sphereGeo(), {
        x: cx,
        y: y1 + 5.2,
        z: cz,
        s: 0.3,
        tint: [1, 0.2, 0.1],
      });
      b.glow(cx, y1 + 5.2, cz, [1, 0.15, 0.08], 5);
    }

    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_newyorker_ext";

    // anchors & street loot
    K.anchor(ctx, "door", X1 + 2.4, 0, DOOR_Z, false);
    K.anchor(ctx, "rooftop", cx, TW.h + 1.2, cz, false);
    K.skel(ctx, X1 + 3.2, 0, DOOR_Z + 3.4, 2.2, "sitting", { world: true });
    K.loot(ctx, "mailbox", X1 + 3.4, 0, DOOR_Z - 6.2, -HP, {
      world: true,
      loot: "mailbox",
    });
    K.loot(ctx, "trash_can", X1 + 3.0, 0, Z1 - 3, 0, {
      world: true,
      loot: "trash_can",
    });
  }

  function sunburstCell() {
    return K.paint("art", "ny_sunburst", 512, 256, function (x, X, Y, W, H) {
      x.fillStyle = "#2a1a0c";
      x.fillRect(X, Y, W, H);
      const cx = X + W / 2,
        cy = Y + H;
      for (let k = 0; k < 24; k++) {
        const a0 = Math.PI + (k * Math.PI) / 24,
          a1 = a0 + Math.PI / 48;
        x.fillStyle = k % 2 ? "#c8a050" : "#8a6a30";
        x.beginPath();
        x.moveTo(cx, cy);
        x.arc(cx, cy, H * 0.98, a0, a1);
        x.closePath();
        x.fill();
      }
      x.fillStyle = "#e0c070";
      x.beginPath();
      x.arc(cx, cy, H * 0.3, Math.PI, 0);
      x.fill();
      x.strokeStyle = "#2a1a0c";
      x.lineWidth = 6;
      for (const rr of [0.3, 0.55, 0.8]) {
        x.beginPath();
        x.arc(cx, cy, H * rr, Math.PI, 0);
        x.stroke();
      }
      K.stains(x, X, Y, W, H, 12, 77, 0.45, [30, 40, 20]);
    });
  }

  // ==================================================================
  // INTERIOR — built in 11_newyorker_int.js (PH.nyInterior)
  // ==================================================================
  PH.ny = { X0, X1, Z0, Z1, DOOR_Z, MEZ_Y, LOBBY_H, sunburstCell, lettersCell };
  PH.nyExterior = exterior;
})();
