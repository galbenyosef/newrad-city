/* src/poi_village/30_katz.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 30_katz.js
 * KATZ'S DELICATESSEN (East Houston Street) — giant roach infestation.
 *
 * EXTERIOR (site x 210..270, z 406..438, façade on Houston St facing
 *   south, corner to the east): two-storey brick corner deli, the long
 *   KATZ'S DELICATESSEN sign band, the vertical corner KATZ'S neon blade,
 *   neon meats in the windows, the SEND A SALAMI ghost ad on the side wall.
 * INTERIOR (cell katz_deli):
 *   dining hall (ticket turnstile & cashier, the long carving counter with
 *   sneeze guards, menu boards, salamis hanging over it, rows of tables,
 *   a wall of celebrity photos, the famous hanging table sign) →
 *   kitchen (steamers, brine tubs, slicer) → walk-in freezer (frozen cook) →
 *   back stairs down → BASEMENT (pickle barrels, brine room, the manager's
 *   office with the brine ledger) → the NEST (egg sacs, slime, a radioactive
 *   sewer breach, the ROACH QUEEN) → west stairs back up into the hall.
 * Quest item for "Send a Salami" (20_vanguard.js): the brine ledger.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pv;
  const K = PV.kit;

  // ---- locks (G.locks) ----
  const LK = {
    safe: K.regLock({
      id: "pv_lk_katz_safe",
      label: "Katz Family Safe",
      kind: "safe",
      code: "1888",
      hint: "The office teletype's brisket schedule gives the year over the door.",
      learnedFrom: "Katz's office teletype (Brisket Schedule)",
    }),
  };
  const PI = Math.PI,
    HP = PI / 2;

  // building (front at Z1 on Houston St, facing +z). Loop round 1: flush with the site's building lines
  // (Bowery x 210, corner x 270, 8th St z 407, Houston z 438) — it used to stand 1–4 m back on bare lot.
  const X0 = 210,
    X1 = 270,
    Z0 = 407,
    Z1 = 438; // (8th St sidewalk ends at z 407)
  const GH = 4.4,
    H2 = 10.2;
  const DOOR_X = 261.5;
  const BY = -3.8; // basement floor (local)
  const HALL_H = 4.2;

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "katz_ext", grime: 0.6 });
    const r = K.rng("katz_ext");
    const brick = [0.8, 0.62, 0.52];
    // body faces
    b.face("brick_brown", X0, 0, Z1, 1, 0, 0, 0, 1, 0, X1 - X0, H2, {
      tint: brick,
    }); // front (normal +z)
    b.face("brick_brown", X1, 0, Z1, 0, 0, -1, 0, 1, 0, Z1 - Z0, H2, {
      tint: brick,
    }); // east (normal +x)
    b.face("brick_brown", X0, 0, Z0, 0, 0, 1, 0, 1, 0, Z1 - Z0, H2 - 2.5, {
      tint: [0.7, 0.55, 0.46],
    }); // west (−x)
    b.face("brick_brown", X1, 0, Z0, -1, 0, 0, 0, 1, 0, X1 - X0, H2, {
      tint: [0.7, 0.55, 0.46],
    }); // back (−z)
    b.face("concrete_dark", X0, H2, Z1, 1, 0, 0, 0, 0, -1, X1 - X0, Z1 - Z0, {
      uv: "top",
      tint: [0.5, 0.48, 0.45],
    });
    b.col(X0, 0, Z0, X1, H2, Z1, { tag: "building" });
    // ground-floor storefront: dark base, big windows with neon meats, door
    b.boxMM("granite", X0, 0, Z1, X1, 0.7, Z1 + 0.15, {
      tint: [0.35, 0.3, 0.28],
    });
    b.boxMM("granite", X1, 0, Z0 + 14, X1 + 0.15, 0.7, Z1 + 0.15, {
      tint: [0.35, 0.3, 0.28],
    });
    const neonMeats = [
      ["PASTRAMI", "#ff3a2a"],
      ["CORNED BEEF", "#ffd040"],
      ["HOT DOGS", "#40c8ff"],
      ["SALAMI", "#ff4a8a"],
      ["KNISHES", "#80ff60"],
      ["BRISKET", "#ff8030"],
    ];
    const winXs = [219, 227, 235, 243, 251];
    winXs.forEach((wx, k) => {
      K.window(b, wx, 2.4, Z1, 0, 1, 6.6, 3.1, {
        state: k === 1 ? "broken" : k === 3 ? "boarded" : "glass",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.5, 0.12, 0.1],
        inset: 0.18,
      });
      if (k !== 3) {
        const [txt, col] = neonMeats[k];
        b.plate(
          "neon",
          wx,
          2.9,
          Z1 + 0.05,
          0,
          1,
          3.4,
          0.8,
          K.neonCell("katz_nm" + k, txt, 384, 96, {
            color: col,
            font: "Arial Black, sans-serif",
          }),
          { tint: k === 1 ? [0.35, 0.35, 0.35] : [1, 1, 1] },
        );
        b.glow(
          wx,
          2.9,
          Z1 + 0.6,
          K.tint(col).map((c) => c * 0.6),
          2.6,
        );
      }
    });
    // east window + door near the corner
    K.window(b, 257, 2.4, Z1, 0, 1, 4.0, 3.1, {
      state: "glass",
      sill: false,
      frame: "paint_red",
      surround: "paint_red",
      surroundTint: [0.5, 0.12, 0.1],
      inset: 0.18,
    });
    b.plate(
      "neon",
      257,
      2.9,
      Z1 + 0.05,
      0,
      1,
      3.2,
      0.8,
      K.neonCell("katz_nm5", "SANDWICHES", 384, 96, {
        color: "#ff3a2a",
        font: "Arial Black, sans-serif",
      }),
    );
    // corner window (the building now runs to the corner at x 270)
    K.window(b, 266.4, 2.4, Z1, 0, 1, 4.4, 3.1, {
      state: "glass",
      sill: false,
      frame: "paint_red",
      surround: "paint_red",
      surroundTint: [0.5, 0.12, 0.1],
      inset: 0.18,
    });
    b.plate(
      "neon",
      266.4,
      2.9,
      Z1 + 0.05,
      0,
      1,
      2.6,
      0.8,
      K.neonCell("katz_nm7", "DELI", 256, 96, {
        color: "#40c8ff",
        font: "Arial Black, sans-serif",
      }),
    );
    b.glow(266.4, 2.9, Z1 + 0.6, [0.25, 0.5, 0.65], 2.4);
    b.boxMM("paint_red", DOOR_X - 1.2, 0, Z1, DOOR_X + 1.2, 3.3, Z1 + 0.12, {
      tint: [0.5, 0.12, 0.1],
    });
    b.plate("glass_dark", DOOR_X, 1.6, Z1 + 0.13, 0, 1, 1.8, 2.8, null, {
      tint: [0.3, 0.3, 0.28],
    });
    b.beam(
      "chrome",
      DOOR_X - 0.8,
      1.1,
      Z1 + 0.2,
      DOOR_X + 0.8,
      1.1,
      Z1 + 0.2,
      0.05,
      0.05,
    );
    b.plate(
      "art",
      DOOR_X,
      3.05,
      Z1 + 0.14,
      0,
      1,
      2.0,
      0.35,
      K.signCell("katz_door", "ENTRANCE — TAKE A TICKET", 384, 64, {
        bg: "#e8e0c0",
        fg: "#8a1a10",
        font: "Arial, sans-serif",
      }),
    );
    // corner windows on the east side
    for (const wz of [428, 421])
      K.window(b, X1, 2.4, wz, 1, 0, 5.0, 3.1, {
        state: wz === 421 ? "boarded" : "glass",
        sill: false,
        frame: "paint_red",
        surround: "paint_red",
        surroundTint: [0.5, 0.12, 0.1],
        inset: 0.18,
      });
    b.plate(
      "neon",
      X1 + 0.05,
      2.9,
      428,
      1,
      0,
      3.4,
      0.8,
      K.neonCell("katz_nm6", "CORNED BEEF", 384, 96, {
        color: "#ffd040",
        font: "Arial Black, sans-serif",
      }),
    );
    // the long sign band (front + east return)
    const band = K.paint(
      "art",
      "katz_band",
      1024,
      96,
      function (x, X, Y, W, Hh) {
        x.fillStyle = "#f0e2a8";
        x.fillRect(X, Y, W, Hh);
        x.strokeStyle = "#b01c12";
        x.lineWidth = 6;
        x.strokeRect(X + 5, Y + 5, W - 10, Hh - 10);
        x.fillStyle = "#b01c12";
        x.font = "bold 64px Arial Black, Arial, sans-serif";
        x.textAlign = "center";
        x.textBaseline = "middle";
        x.fillText(
          "KATZ'S  DELICATESSEN",
          X + W * 0.42,
          Y + Hh / 2 + 3,
          W * 0.7,
        );
        x.font = "italic bold 30px Georgia, serif";
        x.fillText("Since 1888", X + W * 0.88, Y + Hh / 2, W * 0.2);
        K.stains(x, X, Y, W, Hh, 14, 5, 0.4);
        K.streaks(x, X, Y, W, Hh, 20, 6, 0.3);
      },
    );
    b.boxMM("paint_red", X0 + 1, GH - 0.1, Z1, X1, GH + 1.5, Z1 + 0.35, {
      tint: [0.45, 0.1, 0.08],
    });
    b.plate(
      "art",
      (X0 + 1 + X1) / 2,
      GH + 0.7,
      Z1 + 0.36,
      0,
      1,
      X1 - X0 - 2,
      1.3,
      band,
      { off: 0.01 },
    );
    b.boxMM(
      "paint_red",
      X1,
      GH - 0.1,
      Z0 + 12,
      X1 + 0.35,
      GH + 1.5,
      Z1 + 0.35,
      { tint: [0.45, 0.1, 0.08] },
    );
    b.plate(
      "art",
      X1 + 0.36,
      GH + 0.7,
      (Z0 + 12 + Z1) / 2,
      1,
      0,
      Z1 - Z0 - 12,
      1.3,
      K.signCell("katz_band_e", "KATZ'S — THAT'S ALL!", 768, 96, {
        bg: "#f0e2a8",
        fg: "#b01c12",
        font: "Arial Black, sans-serif",
      }),
      { off: 0.01 },
    );
    // bulbs along the band
    for (let x = X0 + 2; x < X1; x += 1.6)
      b.glow(x, GH + 1.55, Z1 + 0.4, [1, 0.85, 0.55], 0.7);
    // the vertical corner blade
    {
      const cx = X1 + 0.9,
        cz = Z1 + 0.9,
        yaw = PI / 4;
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      b.box("paint_yellow", cx, 5.6, cz, 1.4, 5.4, 0.35, {
        yaw,
        tint: [0.95, 0.8, 0.35],
      });
      b.box("paint_red", cx, 5.45, cz, 1.55, 0.15, 0.4, { yaw });
      b.box("paint_red", cx, 11.0, cz, 1.55, 0.2, 0.4, { yaw });
      const vt = K.neonCell("katz_vert", "KATZ'S", 128, 640, {
        color: "#ff2a1a",
        vertical: true,
        font: "Arial Black, sans-serif",
      });
      for (const sd of [-1, 1]) {
        const nx = s * sd,
          nz = c * sd; // box local ±z
        b.plate(
          "neon",
          cx + nx * 0.18,
          8.3,
          cz + nz * 0.18,
          nx,
          nz,
          1.2,
          5.1,
          vt,
          { off: 0.01 },
        );
        b.glow(cx + nx * 0.8, 8.3, cz + nz * 0.8, [1, 0.25, 0.15], 4.5);
      }
      for (const y of [6, 10])
        b.beam(
          "black_iron",
          cx - 0.5 * c,
          y,
          cz + 0.5 * s,
          X1 - 0.02,
          y,
          Z1 - 0.02,
          0.07,
          0.07,
        );
    }
    // upper floor windows, cornice
    for (let x = X0 + 3; x < X1 - 1; x += 4.2) {
      const u = r();
      K.window(b, x, GH + 3.2, Z1, 0, 1, 1.3, 2.2, {
        state: u < 0.3 ? "boarded" : u < 0.55 ? "broken" : "glass",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
        reveal: "brick_brown",
      });
    }
    for (let z = Z0 + 3; z < Z1 - 1; z += 4.2)
      K.window(b, X1, GH + 3.2, z, 1, 0, 1.3, 2.2, {
        state: r() < 0.4 ? "boarded" : "glass",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
      });
    b.boxMM("metal", X0 - 0.2, H2 - 0.4, Z1, X1 + 0.5, H2 + 0.25, Z1 + 0.6, {
      tint: [0.35, 0.3, 0.26],
    });
    b.boxMM("metal", X1, H2 - 0.4, Z0, X1 + 0.6, H2 + 0.25, Z1 + 0.5, {
      tint: [0.35, 0.3, 0.26],
    });
    // the SEND A SALAMI ghost ad on the east wall (upper)
    const salami = K.signCell(
      "katz_salami",
      "SEND A SALAMI\nTO YOUR BOY IN THE ARMY",
      768,
      256,
      {
        bg: null,
        fg: "rgba(240,225,190,0.8)",
        font: "Georgia, serif",
        weather: true,
      },
    );
    b.plate("decal", X1 + 0.02, 8.2, Z0 + 7, 1, 0, 11, 3.6, salami);
    // west (Bowery) & rear elevations: tenement sash windows, a fire escape, the painted pickle ad
    for (let z = Z0 + 4; z < Z1 - 2; z += 4.4) {
      K.window(b, X0, GH + 2.2, z, -1, 0, 1.2, 1.9, {
        state: r() < 0.35 ? "boarded" : r() < 0.5 ? "broken" : "glass",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
        reveal: "brick_brown",
      });
      if (z > Z0 + 12)
        K.window(b, X0, 2.2, z, -1, 0, 1.6, 2.6, {
          state: "boarded",
          sill: true,
          trimTint: [0.6, 0.56, 0.5],
          reveal: "brick_brown",
        });
    }
    K.fireEscape(b, X0, Z0 + 15, -1, 0, 5.4, [GH + 0.1], { seed: 31 });
    K.ghostSign(
      b,
      X0,
      2.4,
      Z0 + 5.5,
      -1,
      0,
      8.5,
      3.6,
      ["PICKLES", "SOUR · HALF-SOUR · BARREL CURED", "ASK FOR KATZ'S"],
      {
        key: "katz_ghost_pickles",
        fg: "rgba(235,225,190,0.8)",
        bg: "rgba(40,70,40,0.45)",
      },
    );
    for (let x = X0 + 4; x < X1 - 2; x += 4.6) {
      K.window(b, x, GH + 3.2, Z0, 0, -1, 1.3, 2.2, {
        state: r() < 0.4 ? "boarded" : "dark",
        lintel: 0.2,
        trimTint: [0.8, 0.76, 0.66],
        reveal: "brick_brown",
      });
      K.window(b, x, 2.2, Z0, 0, -1, 1.4, 2.2, {
        state: r() < 0.6 ? "boarded" : "dark",
        sill: true,
        trimTint: [0.6, 0.56, 0.5],
        reveal: "brick_brown",
      });
    }
    // collapse on the west end: broken top, rubble, girders
    for (let k = 0; k < 6; k++)
      b.box(
        "brick_brown",
        X0 + 0.5 + k * 1.3,
        H2 - 2.5,
        Z0 + 6 + r() * 16,
        1.2,
        0.5 + r() * 1.2,
        1.0,
        { tint: brick },
      );
    K.rubble(b, X0 - 1.5, 0, Z1 + 2, 2.6, 1.3, { seed: 3 });
    b.burn(X0 + 3, 6, Z1, 6, 0.7);
    // egg sacs & slime oozing out of a basement grate by the door
    b.hplate(
      "decal",
      DOOR_X - 4,
      0.02,
      Z1 + 1.4,
      2.2,
      1.6,
      0.3,
      K.decal("roach", 1),
    );
    b.hplate("decal", 232, 0.02, Z1 + 1.2, 1.6, 1.2, 1.1, K.decal("roach", 2));
    b.plate(
      "decal",
      244,
      1.2,
      Z1 + 0.02,
      0,
      1,
      3.4,
      1.2,
      K.tag("ROACHES INSIDE!", "#e8e040", 256, 96, { rot: 0.04 }),
    );
    katzRoof(b, r);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_katz_ext";
    K.anchor(ctx, "door", DOOR_X, 0, Z1 + 1.4, false);
    K.loot(ctx, "fizzo_machine", 253.8, 0, Z1 + 0.8, PI, {
      world: true,
      loot: "fizzo_machine",
    });
    K.loot(ctx, "trash_can", 224, 0, Z1 + 1.2, 0, {
      world: true,
      loot: "trash_can",
    });
    K.loot(ctx, "mailbox", 266, 0, Z1 + 1.6, PI, {
      world: true,
      loot: "newspaper_box",
      name: "Newspaper Box",
    });
  }

  /**
   * Loop round 2 — the roof was one flat 60 × 31 m slab in every aerial. Now: a brick parapet with coping, tar
   * patches, the kitchen's big extract hoods and ducts over the back, HVAC boxes, a timber water tank on a steel
   * stand, a stair bulkhead, a skylight row over the dining hall and the collapsed west end open to the sky.
   * All in the existing merged meshes; colliders only for the solid pieces (the roof is not reachable in play).
   */
  function katzRoof(b, r) {
    const Y = H2,
      brick = [0.72, 0.56, 0.47];
    // parapet + coping (front, east, back; the west end is the broken one)
    for (const [x0, z0, x1, z1] of [
      [X0 + 7, Z1 - 0.35, X1, Z1],
      [X1 - 0.35, Z0, X1, Z1],
      [X0 + 7, Z0, X1, Z0 + 0.35],
    ]) {
      b.boxMM("brick_brown", x0, Y, z0, x1, Y + 0.9, z1, { tint: brick });
      b.boxMM(
        "limestone",
        x0 - 0.05,
        Y + 0.9,
        z0 - 0.05,
        x1 + 0.05,
        Y + 1.0,
        z1 + 0.05,
        { tint: [0.6, 0.58, 0.54] },
      );
    }
    // tar patches & puddles
    for (let k = 0; k < 9; k++)
      b.hplate(
        "decal",
        X0 + 10 + r() * 46,
        Y + 0.02 + k * 0.001,
        Z0 + 3 + r() * 25,
        3 + r() * 4,
        2 + r() * 3,
        r() * 3,
        K.decal(k % 3 ? "grime" : "puddle", k % 4),
      );
    // skylights over the dining hall
    for (let k = 0; k < 4; k++) {
      const sx = X0 + 22 + k * 8,
        sz = Z1 - 9;
      b.boxMM("metal", sx - 1.6, Y, sz - 1.1, sx + 1.6, Y + 0.45, sz + 1.1, {
        tint: [0.4, 0.38, 0.35],
      });
      b.quadN(
        "glass_dark",
        [sx - 1.5, Y + 0.45, sz + 1.0],
        [sx + 1.5, Y + 0.45, sz + 1.0],
        [sx + 1.5, Y + 1.2, sz],
        [sx - 1.5, Y + 1.2, sz],
        [0, 0.8, 0.6],
        { tint: k === 2 ? [0.1, 0.1, 0.1] : [0.35, 0.4, 0.4] },
      );
      b.quadN(
        "glass_dark",
        [sx + 1.5, Y + 0.45, sz - 1.0],
        [sx - 1.5, Y + 0.45, sz - 1.0],
        [sx - 1.5, Y + 1.2, sz],
        [sx + 1.5, Y + 1.2, sz],
        [0, 0.8, -0.6],
        { tint: [0.3, 0.35, 0.35] },
      );
    }
    // kitchen extract hoods + ducts (over the back / kitchen)
    for (const [hx, hz] of [
      [X1 - 12, Z0 + 6],
      [X1 - 22, Z0 + 5],
    ]) {
      b.boxMM("metal", hx - 1.4, Y, hz - 1.4, hx + 1.4, Y + 1.6, hz + 1.4, {
        tint: [0.55, 0.55, 0.52],
      });
      b.cyl("metal", hx, Y + 1.6, hz, 0.7, 0.7, 1.4, 10, {
        tint: [0.5, 0.5, 0.48],
      });
      b.cyl("rust", hx, Y + 3.0, hz, 1.0, 0.2, 0.5, 10, {
        tint: [0.55, 0.45, 0.38],
      });
      b.col(hx - 1.4, Y, hz - 1.4, hx + 1.4, Y + 3.0, hz + 1.4, {
        tag: "roof_kit",
        walkable: false,
      });
    }
    b.pipe(
      "metal",
      X1 - 22,
      Y + 1.0,
      Z0 + 5,
      X1 - 12,
      Y + 1.0,
      Z0 + 6,
      0.35,
      8,
      { tint: [0.5, 0.5, 0.48] },
    );
    // HVAC boxes
    for (const [ax, az, w, d] of [
      [X0 + 30, Z0 + 5, 3.2, 2.2],
      [X0 + 38, Z0 + 5.5, 2.4, 2.0],
    ]) {
      b.boxMM(
        "metal_dark",
        ax - w / 2,
        Y,
        az - d / 2,
        ax + w / 2,
        Y + 1.5,
        az + d / 2,
        { tint: [0.6, 0.62, 0.6] },
      );
      b.cyl("black_iron", ax, Y + 1.5, az, 0.6, 0.6, 0.08, 12, { top: true });
      b.col(ax - w / 2, Y, az - d / 2, ax + w / 2, Y + 1.5, az + d / 2, {
        tag: "roof_kit",
        walkable: false,
      });
    }
    // stair bulkhead
    b.boxMM("brick_brown", X1 - 8, Y, Z0 + 12, X1 - 4, Y + 2.8, Z0 + 16, {
      tint: brick,
    });
    b.boxMM(
      "metal",
      X1 - 8.2,
      Y + 2.8,
      Z0 + 11.8,
      X1 - 3.8,
      Y + 3.0,
      Z0 + 16.2,
      { tint: [0.35, 0.33, 0.3] },
    );
    b.plate("wood_dark", X1 - 6, Y + 1.1, Z0 + 16.02, 0, 1, 1.0, 2.1, null, {
      tint: [0.4, 0.2, 0.15],
    });
    b.col(X1 - 8, Y, Z0 + 12, X1 - 4, Y + 3.0, Z0 + 16, { tag: "roof_kit" });
    // water tank on a steel stand (the NYC signature)
    {
      const wx = X1 - 16,
        wz = Z0 + 20,
        top = Y + 3.6;
      for (const [ox, oz] of [
        [-1.3, -1.3],
        [1.3, -1.3],
        [-1.3, 1.3],
        [1.3, 1.3],
      ])
        b.beam(
          "rust",
          wx + ox,
          Y,
          wz + oz,
          wx + ox * 0.85,
          top,
          wz + oz * 0.85,
          0.18,
          0.18,
        );
      for (const d of [-1, 1])
        b.beam(
          "rust",
          wx - 1.2,
          Y + 0.6,
          wz + d * 1.2,
          wx + 1.2,
          top - 0.4,
          wz + d * 1.2,
          0.06,
          0.06,
        );
      b.boxMM(
        "rust",
        wx - 1.5,
        top,
        wz - 1.5,
        wx + 1.5,
        top + 0.2,
        wz + 1.5,
        {},
      );
      b.cyl("wood_rotten", wx, top + 0.2, wz, 1.7, 1.7, 3.6, 14, {
        tint: [0.55, 0.45, 0.36],
      });
      for (let k = 0; k < 4; k++)
        b.cyl("rust", wx, top + 0.5 + k * 0.85, wz, 1.73, 1.73, 0.07, 14, {
          top: false,
        });
      b.cyl("wood_rotten", wx, top + 3.8, wz, 1.8, 0.15, 1.3, 14, {
        tint: [0.4, 0.35, 0.3],
      });
      b.col(wx - 1.7, Y, wz - 1.7, wx + 1.7, top + 3.8, wz + 1.7, {
        tag: "roof_kit",
        walkable: false,
      });
    }
    // vent stacks & an old antenna
    for (let k = 0; k < 6; k++)
      b.cyl(
        "rust",
        X0 + 12 + k * 7.5,
        Y,
        Z0 + 1.5 + (k % 2) * 1.2,
        0.12,
        0.12,
        0.9 + r() * 0.6,
        6,
        { tint: [0.5, 0.42, 0.36] },
      );
    b.pipe("black_iron", X1 - 3, Y, Z1 - 3, X1 - 3, Y + 6.5, Z1 - 3, 0.04, 4);
    for (let k = 0; k < 3; k++)
      b.pipe(
        "black_iron",
        X1 - 3.9 + k * 0.1,
        Y + 4.5 + k * 0.8,
        Z1 - 3,
        X1 - 2.1 - k * 0.1,
        Y + 4.5 + k * 0.8,
        Z1 - 3,
        0.015,
        3,
      );
  }

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "katz_int",
      off: O,
      lit: true,
      amb: [0.09, 0.085, 0.075],
      floors: [0, BY],
      grime: 0.5,
    });
    const r = K.rng("katz_int");
    const cream = [0.86, 0.8, 0.66],
      panel = [0.5, 0.32, 0.22];
    const HALL = [-14.1, -0.3, -18.1, 14.1, HALL_H + 0.2, 0.1];

    // ---------------- dining hall (x −14..14, z −18..0) ----------------
    K.gap(ctx, 10, 0, 2.2, 0, 2.9); // street doors
    K.gap(ctx, 12.5, -18, 1.3, 0, 2.3); // counter → kitchen
    K.gap(ctx, 4, -18, 1.4, 0, 2.3); // swing door → kitchen
    K.room(b, ctx, {
      x0: -14,
      z0: -18,
      x1: 14,
      z1: 0,
      y: 0,
      h: HALL_H,
      floor: "hextile",
      fc: [0.86, 0.84, 0.8],
      wall: "plaster",
      wc: cream,
      wain: "wood_dark",
      wainC: panel,
      wainH: 1.3,
      ceil: "tin",
      cc: [0.7, 0.66, 0.56],
      noFloor: true,
      cornice: true,
    });
    // floor with the west stair hole (x −13.6..−12, z −11..−3)
    b.face("hextile", -12, 0, 0, 1, 0, 0, 0, 0, -1, 26, 18, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.face("hextile", -14, 0, 0, 1, 0, 0, 0, 0, -1, 2, 3, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.face("hextile", -14, 0, -11, 1, 0, 0, 0, 0, -1, 2, 7, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.face("hextile", -14, 0, -3, 1, 0, 0, 0, 0, -1, 0.4, 8, {
      uv: "top",
      tint: [0.86, 0.84, 0.8],
    });
    b.col(-12, -0.3, -18, 14, 0, 0, { tag: "floor", surface: "concrete" });
    b.col(-14, -0.3, -3, -12, 0, 0, { tag: "floor" });
    b.col(-14, -0.3, -18, -12, 0, -11, { tag: "floor" });
    b.col(-14, -0.3, -11, -13.6, 0, -3, { tag: "floor" });
    K.railing(b, -12, -11, -12, -3, 0, {
      h: 1.0,
      mat: "chrome",
      handMat: "chrome",
    });
    K.railing(b, -13.6, -11, -12, -11, 0, {
      h: 1.0,
      mat: "chrome",
      handMat: "chrome",
    });
    b.plate(
      "art",
      -12.9,
      2.6,
      -17.88,
      0,
      1,
      1.6,
      0.4,
      K.signCell("katz_rest", "RESTROOMS & CELLAR ↓", 384, 96, {
        bg: "#1a1a1a",
        fg: "#e8d8b0",
        font: "Arial, sans-serif",
      }),
    );
    // entrance: turnstile, ticket machine, cashier booth
    b.boxMM("chrome", 8.6, 0, -1.8, 8.75, 1.0, -0.3, {});
    b.boxMM("chrome", 11.25, 0, -1.8, 11.4, 1.0, -0.3, {});
    b.col(8.6, 0, -1.8, 8.75, 1.0, -0.3, { walkable: false });
    b.col(11.25, 0, -1.8, 11.4, 1.0, -0.3, { walkable: false });
    b.boxMM("paint_red", 8.9, 0, -1.4, 9.3, 1.2, -1.0, {
      tint: [0.7, 0.15, 0.1],
    }); // ticket machine
    b.plate(
      "art",
      9.1,
      1.6,
      -1.42,
      0,
      1,
      0.7,
      0.4,
      K.signCell("katz_ticket", "TAKE A TICKET", 256, 128, {
        bg: "#e8e0c0",
        fg: "#b01c12",
        font: "Arial Black, sans-serif",
      }),
    );
    b.boxMM("wood_dark", 5.4, 0, -3.2, 7.9, 1.1, -0.2, { tint: panel }); // cashier
    b.boxMM("glass_clear", 5.4, 1.1, -3.2, 5.45, 2.2, -0.2, {
      tint: [0.7, 0.75, 0.75],
    });
    b.col(5.4, 0, -3.2, 7.9, 1.1, -0.2, { tag: "counter" });
    b.plate(
      "art",
      6.65,
      2.7,
      -3.25,
      0,
      -1,
      2.2,
      0.6,
      K.signCell(
        "katz_lost",
        "LOST TICKET = $50\nNO EXCEPTIONS. NOT EVEN THE END OF THE WORLD.",
        512,
        140,
        { bg: "#f0e8c8", fg: "#8a1a10", font: "Arial, sans-serif" },
      ),
    );
    // the long counter along the east side (x 10.2..11.2, z −17..−3)
    b.boxMM("wood_dark", 10.2, 0, -17, 11.2, 1.05, -4.5, { tint: panel });
    b.boxMM("ceramic", 10.1, 1.05, -17.05, 11.3, 1.12, -4.45, {
      tint: [0.85, 0.85, 0.8],
    });
    b.col(10.1, 0, -17.05, 11.3, 1.12, -4.45, {
      tag: "counter",
      surface: "wood",
    });
    for (let z = -16; z < -5; z += 2.6) {
      // carving station: sneeze guard, cutting board, a steaming brisket
      b.quad(
        "glass_clear",
        [10.25, 1.12, z - 1.1],
        [10.25, 1.12, z + 1.1],
        [10.4, 1.6, z + 1.1],
        [10.4, 1.6, z - 1.1],
        { tint: [0.6, 0.66, 0.66] },
      );
      b.boxMM("wood", 10.5, 1.12, z - 0.7, 11.1, 1.17, z + 0.7, {
        tint: [0.7, 0.55, 0.4],
      });
      b.geo("meat", K.sphereGeo(), {
        x: 10.8,
        y: 1.22,
        z,
        sx: 0.25,
        sy: 0.1,
        sz: 0.4,
        tint: [0.55, 0.22, 0.16],
      });
      b.boxMM("steel", 11.25, 1.12, z - 0.9, 11.9, 1.35, z + 0.9, {
        tint: [0.6, 0.62, 0.62],
      }); // steam table
      b.glow(11.5, 1.6, z, [0.4, 0.4, 0.38], 1.2);
    }
    // hanging salamis over the counter
    for (let z = -16.8; z < -4.8; z += 0.35) {
      const len = 0.5 + r() * 0.4,
        x = 10.6 + (r() - 0.5) * 0.4;
      b.pipe("fabric", x, 3.2, z, x, HALL_H, z, 0.006, 3, {
        tint: [0.7, 0.66, 0.55],
      });
      b.cyl("salami", x, 3.2 - len, z, 0.06, 0.05, len, 6, {
        tint: [0.9, 0.55, 0.45],
      });
    }
    b.beam(
      "steel",
      10.6,
      HALL_H - 0.4,
      -17,
      10.6,
      HALL_H - 0.4,
      -4.6,
      0.04,
      0.04,
    );
    // menu boards over the carving line (east wall)
    const menu = K.paint(
      "art",
      "katz_menu",
      512,
      384,
      function (x, X, Y, W, Hh) {
        x.fillStyle = "#16140f";
        x.fillRect(X, Y, W, Hh);
        x.fillStyle = "#f0e0a0";
        x.font = "bold 34px Arial Black, sans-serif";
        x.textAlign = "center";
        x.fillText("KATZ'S", X + W / 2, Y + 40);
        const items = [
          ["PASTRAMI ON RYE", "$1.45"],
          ["CORNED BEEF", "$1.35"],
          ["BRISKET", "$1.25"],
          ["TONGUE", "$1.15"],
          ["HOT DOG", "35¢"],
          ["KNISH", "40¢"],
          ["MATZO BALL SOUP", "50¢"],
          ["EGG CREAM", "20¢"],
          ["ROACH (NOT SERVED)", "—"],
        ];
        x.font = "22px Arial, sans-serif";
        x.textAlign = "left";
        items.forEach(([n, p], i) => {
          x.fillStyle = i === 8 ? "#ff6050" : "#e8e4d8";
          x.fillText(n, X + 20, Y + 80 + i * 32);
          x.textAlign = "right";
          x.fillText(p, X + W - 20, Y + 80 + i * 32);
          x.textAlign = "left";
        });
        K.stains(x, X, Y, W, Hh, 8, 11, 0.4, [60, 50, 30]);
      },
    );
    for (const z of [-15, -10, -5.5]) {
      b.boxMM("paint_black", 13.85, 2.2, z - 1.6, 13.95, 4.0, z + 1.6, {});
      b.plate("art", 13.84, 3.1, z, -1, 0, 3.0, 1.7, menu);
      b.light(12.8, 3.9, z, [1, 0.9, 0.7], 0.7, 4, { box: HALL });
    }
    // tables: long rows
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 5; k++) {
        const tx = -9.5 + k * 3.8,
          tz = -3.8 - row * 3.4;
        if (tx > 7 && tz > -5) continue;
        const kicked = r() < 0.15;
        K.table(b, tx, 0, tz, 1.6, 0.8, {
          mat: "wood",
          tint: [0.75, 0.6, 0.45],
          legMat: "chrome",
        });
        for (const s of [-1, 1])
          for (const dx of [-0.4, 0.4])
            K.chair(b, tx + dx, 0, tz + s * 0.7, s > 0 ? 0 : PI, {
              mat: "chrome",
              seatMat: "wood",
              fallen: kicked && r() < 0.5,
            });
        if (r() < 0.6) {
          b.cyl("glass", tx - 0.4, 0.76, tz, 0.04, 0.035, 0.14, 6, {
            tint: [0.7, 0.6, 0.45],
          });
          b.cyl("ceramic", tx + 0.3, 0.76, tz, 0.16, 0.14, 0.02, 10);
        }
        if (r() < 0.3)
          b.cyl("glass", tx + 0.1, 0.76, tz + 0.2, 0.05, 0.05, 0.02, 8, {
            tint: [0.8, 0.2, 0.15],
          }); // ketchup? mustard? something.
      }
    }
    // THE table, with its hanging sign
    K.table(b, -6, 0, -14, 1.6, 0.8, {
      mat: "wood",
      tint: [0.75, 0.6, 0.45],
      legMat: "chrome",
    });
    b.pipe("black_iron", -6.5, 2.7, -14, -6.5, HALL_H, -14, 0.008, 3);
    b.pipe("black_iron", -5.5, 2.7, -14, -5.5, HALL_H, -14, 0.008, 3);
    const she = K.signCell(
      "katz_she",
      "SEND A SALAMI TO YOUR BOY IN THE ARMY\n(the roach ate the salami)",
      512,
      128,
      { bg: "#f0e8c8", fg: "#b01c12", font: "Georgia, serif" },
    );
    b.plate("art", -6, 2.45, -13.98, 0, 1, 1.9, 0.5, she, { off: 0.01 });
    b.plate("art", -6, 2.45, -14.02, 0, -1, 1.9, 0.5, she, { off: 0.01 });
    K.skel(ctx, -6.1, 0, -14.9, PI, "seated");
    K.note(ctx, "pv_note_katz_table", -5.8, 0.77, -14.1, {
      name: "Napkin Note (Table 40)",
      title: "Written on a Katz's napkin",
      text: "Harold —\n\nYou told the counterman to send a salami to our boy in the army. We have no boy in the army. Everyone laughed anyway. It was our anniversary and you have made that joke at this table for forty-one years.\n\nThen the sirens.\n\nI'm not angry. We're at Katz's. If this is it, at least the pastrami was good.\n\n— M.\n\n(below, in a different hand: \"Send a salami.\" — H.)",
    });
    // wall of fame: photos everywhere (west, north, south walls)
    K.salonWall(b, -13.8, -1.4, 1.5, 3.9, -0.12, 0, -1, "katz_s", {
      density: 0.95,
      photos: "deli",
    });
    K.salonWall(b, -17.8, -11.5, 1.5, 3.9, -13.88, 1, 0, "katz_w1", {
      density: 0.95,
      photos: "deli",
    });
    K.salonWall(b, -2.8, -0.2, 1.5, 3.9, -13.88, 1, 0, "katz_w2", {
      density: 0.95,
      photos: "deli",
    });
    K.salonWall(b, -11.5, 2.8, 1.5, 3.9, -17.88, 0, 1, "katz_n", {
      density: 0.9,
      photos: "deli",
    });
    for (let k = 0; k < 18; k++) {
      const x = -13 + (k % 9) * 1.5,
        z = k < 9 ? -0.13 : -17.87;
      K.framed(
        b,
        x,
        1.9 + (k % 2) * 0.2,
        z,
        0,
        k < 9 ? -1 : 1,
        0.34,
        0.42,
        K.photo("deli", k),
        { frame: "paint_black", fw: 0.025 },
      );
    }
    // light: rows of globe pendants + neon spill from the windows
    for (let x = -10; x <= 8; x += 4.5)
      for (const z of [-4.5, -10, -15])
        K.lamp(
          b,
          x,
          3.2,
          z,
          "globe",
          [1, 0.85, 0.6],
          z === -10 && x === -1 ? 0 : 0.75,
          6.5,
          {
            ceil: HALL_H,
            size: 0.2,
            dead: r() < 0.25,
            lightOpts: { box: HALL },
          },
        );
    for (const [x, c] of [
      [-9, [1, 0.25, 0.15]],
      [-1, [1, 0.8, 0.25]],
      [7, [0.3, 0.8, 1]],
    ]) {
      b.light(x, 2.6, -0.6, c, 0.9, 5, { box: HALL });
      b.plate("lamp", x, 2.4, -0.12, 0, -1, 5.2, 2.6, null, {
        tint: [0.28, 0.28, 0.26],
      });
      b.plate(
        "neon",
        x,
        2.9,
        -0.16,
        0,
        -1,
        3.2,
        0.75,
        K.neonCell(
          "katz_nb" + x,
          x === -9 ? "IMARTSAP" : x === -1 ? "FEEB DENROC" : "SGOD TOH",
          384,
          96,
          {
            color: x === -9 ? "#ff3a2a" : x === -1 ? "#ffd040" : "#40c8ff",
            font: "Arial Black, sans-serif",
          },
        ),
        { tint: [0.55, 0.55, 0.55] },
      );
    }
    b.light(10, 2.4, -0.8, [0.7, 0.75, 0.85], 0.6, 4, { box: HALL });
    // roach damage in the hall: slime trails, egg clusters, bones
    for (let k = 0; k < 7; k++)
      b.hplate(
        "decal",
        -12 + r() * 22,
        0.012 + k * 0.0005,
        -16 + r() * 14,
        1 + r(),
        1 + r(),
        r() * 6,
        K.decal(k % 3 ? "roach" : "grime", k),
      );
    K.litter(b, -13.5, -17.5, 9.5, -1, 0, 26, 71);

    // ---------------- kitchen (x 2..14, z −26..−18) ----------------
    const KB = [1.9, -0.2, -26.1, 14.1, 3.8, -17.9];
    K.gap(ctx, 2, -22, 1.4, 0, 2.3); // → freezer
    K.gap(ctx, 12.5, -26, 1.2, 0, 2.3); // → back stairs
    K.room(b, ctx, {
      x0: 2,
      z0: -26,
      x1: 14,
      z1: -18,
      y: 0,
      h: 3.6,
      floor: "checker",
      fc: [0.7, 0.68, 0.62],
      wall: "tile",
      wc: [0.82, 0.82, 0.76],
      ceil: "plaster",
      cc: [0.55, 0.54, 0.5],
    });
    // brine tubs (the heart of Katz's)
    for (const [vx, vz] of [
      [3.4, -24.6],
      [5.2, -24.6],
      [7.0, -24.6],
    ]) {
      b.cyl("wood", vx, 0, vz, 0.8, 0.8, 1.3, 14, { tint: [0.55, 0.4, 0.28] });
      for (const y of [0.2, 0.7, 1.15])
        b.cyl("rust", vx, y, vz, 0.82, 0.82, 0.07, 14, { top: false });
      b.cyl("flat", vx, 1.22, vz, 0.74, 0.74, 0.02, 14, {
        tint: [0.45, 0.4, 0.2],
      }); // brine surface
      b.col(vx - 0.75, 0, vz - 0.75, vx + 0.75, 1.3, vz + 0.75, {
        tag: "furniture",
      });
    }
    b.boxMM("steel", 9.2, 0, -25.9, 13.9, 0.95, -24.9, {
      tint: [0.6, 0.62, 0.62],
    }); // steamers
    for (let k = 0; k < 4; k++) {
      b.cyl("steel", 9.8 + k * 1.1, 0.95, -25.4, 0.4, 0.4, 0.5, 12, {
        tint: [0.6, 0.62, 0.62],
      });
      b.glow(9.8 + k * 1.1, 1.6, -25.4, [0.35, 0.35, 0.33], 1.4);
    }
    b.col(9.2, 0, -25.9, 13.9, 1.45, -24.9, { tag: "counter" });
    b.boxMM("steel", 5, 0, -21.6, 10, 0.92, -20.4, {
      tint: [0.65, 0.67, 0.67],
    }); // prep island
    b.col(5, 0, -21.6, 10, 0.92, -20.4, { tag: "counter" });
    b.cyl("steel", 7.2, 0.92, -21, 0.18, 0.18, 0.08, 12);
    b.box("paint_red", 7.9, 0.92, -21, 0.4, 0.3, 0.3, {
      tint: [0.7, 0.2, 0.15],
    }); // slicer
    b.geo("meat", K.sphereGeo(), {
      x: 6,
      y: 1.02,
      z: -21,
      sx: 0.4,
      sy: 0.12,
      sz: 0.28,
      tint: [0.6, 0.25, 0.18],
    });
    b.pipe("steel", 5.2, 2.3, -21, 9.8, 2.3, -21, 0.02, 4);
    for (let k = 0; k < 8; k++) {
      const x = 5.5 + k * 0.55;
      b.pipe("steel", x, 2.3, -21, x, 1.9, -21, 0.008, 3);
      b.cyl("meat", x, 1.35, -21, 0.14, 0.1, 0.55, 6, {
        tint: [0.65, 0.3, 0.22],
      });
    }
    K.shelf(b, 13.75, 0, -21, -HP, 3.0, {
      mat: "metal",
      items: ["can", "jar", "box", "jar"],
      seed: 12,
    });
    K.lamp(b, 7, 3.4, -22, "tube", [0.9, 0.95, 1.0], 1.0, 8, {
      ceil: 3.6,
      len: 1.6,
      lightOpts: { box: KB },
    });
    K.lamp(b, 11, 3.4, -20, "tube", [0.9, 0.95, 1.0], 0, 0, {
      ceil: 3.6,
      len: 1.6,
      dead: true,
    });
    for (let k = 0; k < 5; k++)
      b.hplate(
        "decal",
        3 + r() * 10,
        0.012 + k * 0.0005,
        -25 + r() * 6,
        1.2,
        1.2,
        r() * 6,
        K.decal(k % 2 ? "blood" : "roach", k + 10),
      );
    K.loot(ctx, "fridge", 13.5, 0, -18.6, -HP, { loot: "fridge" });
    K.loot(ctx, "toolbox", 2.6, 0, -18.6, HP, { loot: "toolbox" });
    K.note(ctx, "pv_note_katz_orders", 6.8, 0.93, -20.8, {
      name: "Order Ticket #1,044,977",
      title: "Katz's order ticket (smudged)",
      text: 'TABLE 12 — pastrami on rye, pickles, cel-ray\nTABLE 13 — "Same as him"\nTABLE 14 — "Same as THEM" (pointing at 13)\nTABLE 15 — "Whatever everybody\'s having"\nTABLE 16 — "Send a salami to my boy in the army" (a soldier\'s mother, Sunday regular)\n\nNote to kitchen: EVERYONE is having the pastrami. Nobody is having anything else. It is the end of the world and they want pastrami. Brine the whole walk-in. — Irv',
    });

    // ---------------- walk-in freezer (x −6..2, z −26..−18) ----------------
    const FB = [-6.1, -0.2, -26.1, 2.1, 3.2, -17.9];
    K.room(b, ctx, {
      x0: -6,
      z0: -26,
      x1: 2,
      z1: -18,
      y: 0,
      h: 3.0,
      floor: "metal",
      fc: [0.72, 0.78, 0.82],
      wall: "metal",
      wc: [0.75, 0.82, 0.86],
      ceil: "metal",
      cc: [0.6, 0.66, 0.7],
      trim: false,
      surface: "metal",
    });
    b.boxMM("steel", 1.8, 0, -22.9, 2.3, 2.4, -21.1, {
      tint: [0.7, 0.75, 0.78],
    }); // heavy door frame (kitchen side)
    for (let x = -5.2; x < 1.4; x += 1.3) {
      b.pipe("steel", x, 2.9, -24.5, x, 2.9, -19.5, 0.03, 4);
      for (let z = -24; z < -19.5; z += 1.5) {
        b.pipe("steel", x, 2.9, z, x, 2.5, z, 0.01, 3);
        b.geo("meat", K.sphereGeo(), {
          x,
          y: 1.75,
          z,
          sx: 0.32,
          sy: 0.75,
          sz: 0.25,
          tint: [0.75, 0.6, 0.58],
        });
      }
    }
    for (let k = 0; k < 8; k++)
      b.hplate(
        "decal",
        -5.5 + r() * 7,
        0.012 + k * 0.0005,
        -25.5 + r() * 7,
        1.4,
        1.4,
        r() * 6,
        K.decal("grime", k + 20),
        { tint: [0.8, 0.9, 1.0] },
      );
    b.light(-2, 2.7, -22, [0.55, 0.75, 1.0], 1.1, 7, { box: FB });
    b.glow(-2, 2.9, -22, [0.35, 0.5, 0.65], 1.8);
    K.skel(ctx, -5.2, 0, -25.2, 0.7, "curled");
    K.loot(ctx, "fridge", -5.5, 0, -19, HP, {
      loot: "food_oldworld",
      name: "Frozen Stock",
    });
    K.note(ctx, "pv_note_katz_freezer", -4.9, 0.05, -24.8, {
      name: "Note (frozen stiff)",
      title: "Scratched on the back of a menu",
      text: "Locked myself in the walk-in when the flash came. Thick walls, I figured. Cold keeps things fresh, I figured.\n\nDay 3. It is very fresh in here.\n\nIf you find me, tell Irv the brisket order is short two cases and it WASN'T me.\n— Sol, grill",
    });

    // ---------------- back stairs (x 11.8..13.2, z −36..−26) down to the basement ----------------
    const SB = [11.6, BY - 0.2, -36.1, 14.1, 3.8, -25.9];
    K.room(b, ctx, {
      x0: 11.6,
      z0: -36,
      x1: 14,
      z1: -26,
      y: BY,
      h: 3.8 - BY,
      floor: "concrete",
      fc: [0.5, 0.48, 0.45],
      wall: "brick_brown",
      wc: [0.6, 0.48, 0.4],
      ceil: "concrete",
      cc: [0.4, 0.38, 0.36],
      trim: false,
    });
    b.boxMM("concrete", 11.6, -0.3, -27.4, 14, 0, -26, {
      tint: [0.55, 0.53, 0.5],
    });
    b.col(11.6, -0.3, -27.4, 14, 0, -26, { tag: "floor" });
    K.stairs(b, 11.8, -34.2, 13.8, -27.4, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.55, 0.53, 0.5],
      rail: "l",
      railMat: "rust",
      handMat: "rust",
    });
    K.lamp(b, 12.8, 2.6, -27, "cage", [1, 0.7, 0.4], 0.7, 6, {
      ceil: 3.8,
      lightOpts: { box: SB },
    });
    K.lamp(b, 12.8, BY + 2.6, -35, "cage", [1, 0.7, 0.4], 0.5, 5, {
      ceil: BY + 3.6,
      lightOpts: { box: SB },
    });
    b.plate(
      "decal",
      11.72,
      1.2,
      -31,
      1,
      0,
      2.4,
      0.9,
      K.tag("TURN BACK", "#e04030", 256, 96),
    );

    // ---------------- basement ----------------
    const BB = [-14.1, BY - 0.2, -36.1, 11.7, -0.2, -5.9];
    K.gap(ctx, 11.6, -35.1, 1.6, BY, 2.4); // stair room → basement
    K.gap(ctx, -12.8, -6, 1.6, BY, 3.8); // basement → west stairs up to the hall
    K.gap(ctx, 6, -12, 1.2, BY, 2.3); // → office
    K.room(b, ctx, {
      x0: -14,
      z0: -36,
      x1: 11.6,
      z1: -6,
      y: BY,
      h: 3.5,
      floor: "concrete",
      fc: [0.52, 0.5, 0.46],
      wall: "brick_brown",
      wc: [0.58, 0.46, 0.38],
      ceil: "concrete",
      cc: [0.36, 0.35, 0.33],
      noCeil: true,
      trim: false,
    });
    // ceiling with the west stair hole
    b.face("concrete", -12, -0.3, -36, 1, 0, 0, 0, 0, 1, 23.6, 30, {
      uv: "top",
      tint: [0.36, 0.35, 0.33],
    });
    b.face("concrete", -14, -0.3, -36, 1, 0, 0, 0, 0, 1, 2, 25, {
      uv: "top",
      tint: [0.36, 0.35, 0.33],
    });
    b.face("concrete", -14, -0.3, -11, 1, 0, 0, 0, 0, 1, 0.4, 5, {
      uv: "top",
      tint: [0.36, 0.35, 0.33],
    });
    // west stairs back up (x −13.6..−12, rising +z from z −11 to −3)
    K.stairs(b, -13.6, -11, -12, -3, BY, 0, "+z", {
      mat: "concrete",
      tint: [0.5, 0.48, 0.45],
      rail: "r",
      railMat: "rust",
      handMat: "rust",
      solid: false,
      thick: 0.4,
    });
    b.col(-14, BY, -11, -13.6, 0, -3, { tag: "wall" });
    K.segWall(b, -12, -6, -12, -3, BY, -0.3, 1, {
      mat: "brick_brown",
      tint: [0.5, 0.4, 0.34],
      trim: false,
    });
    K.segWall(b, -13.6, -6, -13.6, -3, BY, -0.3, -1, {
      mat: "brick_brown",
      tint: [0.5, 0.4, 0.34],
      trim: false,
      col: false,
    });
    b.face("concrete", -13.6, -0.3, -6, 1, 0, 0, 0, 0, 1, 1.6, 0.01, {
      uv: "top",
    });
    // columns + beams
    for (let x = -8; x <= 8; x += 8)
      for (let z = -30; z <= -12; z += 9) {
        b.boxMM("concrete", x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {
          tint: [0.5, 0.48, 0.45],
        });
        b.col(x - 0.3, BY, z - 0.3, x + 0.3, -0.3, z + 0.3, {});
      }
    for (let z = -33; z <= -9; z += 4.5)
      b.beam("rust", -14, -0.5, z, 11.6, -0.5, z, 0.2, 0.3, {
        tint: [0.5, 0.4, 0.32],
      });
    b.pipe("rust", -13.8, -0.9, -36, -13.8, -0.9, -6, 0.1, 6);
    b.pipe("metal", 11.4, -0.8, -36, 11.4, -0.8, -12, 0.06, 6, {
      tint: [0.4, 0.45, 0.4],
    });
    // storage: pickle barrels, crates, cured meats
    for (let k = 0; k < 14; k++) {
      const x = -3 + (k % 7) * 0.8,
        z = -34.8 + Math.floor(k / 7) * 0.8;
      b.cyl("wood", x, BY, z, 0.34, 0.34, 0.95, 10, {
        tint: [0.55, 0.42, 0.3],
      });
      b.cyl("rust", x, BY + 0.25, z, 0.35, 0.35, 0.05, 10, { top: false });
      b.cyl("rust", x, BY + 0.7, z, 0.35, 0.35, 0.05, 10, { top: false });
    }
    b.col(-3.4, BY, -35.2, 2.2, BY + 0.95, -33.6, {});
    b.plate(
      "art",
      -0.2,
      BY + 1.9,
      -35.88,
      0,
      1,
      1.4,
      0.4,
      K.signCell("katz_pickles", "FULL SOURS · HALF SOURS", 384, 96, {
        bg: "#20301c",
        fg: "#e8e0b0",
        font: "Arial, sans-serif",
      }),
    );
    K.shelf(b, 4.5, BY, -35.6, 0, 3.4, {
      mat: "wood",
      items: ["jar", "jar", "jar", "can"],
      seed: 31,
    });
    K.shelf(b, 8.5, BY, -35.6, 0, 3.4, {
      mat: "wood",
      items: ["box", "jar", "can"],
      seed: 32,
    });
    for (let x = 3; x < 10.5; x += 0.45) {
      b.pipe("fabric", x, -0.5, -32.5, x, -1.0, -32.5, 0.005, 3);
      b.cyl("salami", x, -1.6 - r() * 0.3, -32.5, 0.06, 0.06, 0.6, 6, {
        tint: [0.8, 0.5, 0.4],
      });
    }
    // brine room: three giant tanks
    for (const tx of [3.5, 6.5, 9.5]) {
      b.cyl("steel", tx, BY, -27, 1.1, 1.1, 2.6, 16, {
        tint: [0.5, 0.55, 0.52],
      });
      b.col(tx - 1.0, BY, -28, tx + 1.0, BY + 2.6, -26, {});
      b.pipe("rust", tx, BY + 2.6, -27, tx, -0.4, -27, 0.07, 5);
    }
    // lights (flickery bulbs)
    for (const [x, z, i] of [
      [5, -30, 0.8],
      [5, -18, 0.7],
      [-5, -18, 0.5],
      [0, -33, 0.6],
      [9, -8, 0.6],
    ])
      K.lamp(b, x, -1.0, z, "bulb", [1, 0.72, 0.4], i, 7, {
        ceil: -0.3,
        lightOpts: { box: BB },
      });
    // the NEST (west half): egg sacs, slime, bones, the sewer breach
    for (let k = 0; k < 22; k++)
      b.hplate(
        "decal",
        -13.5 + r() * 10,
        BY + 0.012 + k * 0.0004,
        -35 + r() * 26,
        1.4 + r() * 1.4,
        1.4 + r() * 1.4,
        r() * 6,
        K.decal(k % 4 === 0 ? "blood" : "roach", k + 30),
      );
    for (let k = 0; k < 28; k++) {
      // egg clusters on walls & floor
      const x = -13.4 + r() * 8,
        z = -35 + r() * 22,
        y = BY + (r() < 0.5 ? 0 : r() * 2);
      b.geo("flat", K.sphereGeo(), {
        x,
        y: y + 0.12,
        z,
        sx: 0.14 + r() * 0.1,
        sy: 0.1,
        sz: 0.12,
        tint: [0.8, 0.74, 0.5],
      });
    }
    // the queen's throne: a mound of salami ends, rags and resin, crowned with glowing egg sacs
    for (let k = 0; k < 16; k++) {
      const a = r() * PI * 2,
        d = r() * 2.2;
      b.geo("flat", K.sphereGeo(), {
        x: -11 + Math.cos(a) * d,
        y: BY - 0.1,
        z: -30.5 + Math.sin(a) * d,
        sx: 0.7 + r() * 0.6,
        sy: 0.35 + r() * 0.4 * (1 - d / 2.4),
        sz: 0.6 + r() * 0.5,
        tint: [0.35, 0.3, 0.2],
      });
    }
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9,
        x = -11 + Math.cos(a) * 1.1,
        z = -30.5 + Math.sin(a) * 1.1;
      b.geo("lamp", K.sphereGeo(), {
        x,
        y: BY + 0.55,
        z,
        sx: 0.22,
        sy: 0.3,
        sz: 0.2,
        tint: [0.55, 0.6, 0.25],
      });
      b.glow(x, BY + 0.6, z, [0.45, 0.6, 0.2], 0.7);
    }
    for (let k = 0; k < 8; k++) {
      const x = -12 + r() * 3,
        z = -32 + r() * 3;
      b.cyl("salami", x, BY + 0.2 + r() * 0.4, z, 0.06, 0.06, 0.5, 6, {
        tint: [0.6, 0.35, 0.3],
      });
    }
    b.col(-12.6, BY, -32, -9.4, BY + 0.5, -29, {
      tag: "rubble",
      surface: "rubble",
    });
    b.light(-11, BY + 1.2, -30.5, [0.6, 0.8, 0.3], 0.8, 5, { box: BB });
    for (let k = 0; k < 10; k++)
      b.pipe(
        "bone",
        -12 + r() * 6,
        BY + 0.05,
        -30 + r() * 12,
        -12 + r() * 6,
        BY + 0.05,
        -30 + r() * 12,
        0.03,
        4,
      );
    K.rubble(b, -12.6, BY, -34.2, 2.6, 1.6, { seed: 5 });
    b.boxMM("paint_black", -13.95, BY, -31, -13.9, BY + 2.2, -28.4, {
      tint: [0.03, 0.03, 0.03],
      faces: "e",
    }); // breach into the sewer
    b.hplate(
      "decal",
      -12.4,
      BY + 0.02,
      -29.7,
      3.2,
      3.6,
      0.3,
      K.decal("hotspot", 1),
    );
    b.light(-12.6, BY + 0.6, -29.7, [0.35, 1.0, 0.3], 1.4, 7, { box: BB });
    b.glow(-12.6, BY + 0.4, -29.7, [0.3, 0.9, 0.25], 3.2);
    b.light(-10, BY + 2.4, -24, [1, 0.6, 0.3], 0.35, 6, { box: BB });
    K.skel(ctx, -9.5, BY, -31.5, 2.2, "reaching");
    K.skel(ctx, -11.8, BY, -26.6, 0.4, "lying");
    K.note(ctx, "pv_reel_exterminator", -9.2, BY + 0.03, -31.1, {
      type: "tape",
      name: "Tape Reel: Exterminator's Log",
      title: "Big Apple Pest Control — Job #4471 (Katz's)",
      text: "Day 1: Standard infestation. Giant roaches in the sub-basement. Big ones, but I've seen big ones.\n\nDay 2: Found the egg sacs. Hundreds. Something is laying them, and it isn't a regular roach. There's a trail as wide as my arm.\n\nDay 3: Saw her. She's the size of a Checker cab. The little ones bring her salami. They BRING her salami.\n\nDay 3, later: Out of spray. Out of luck. If you're hearing this, aim for the head and don't let them get behind you. And for God's sake don't eat anything down here.",
    });
    // office (x 1..11.6, z −12..−6)
    const OB = [0.9, BY - 0.2, -12.1, 11.7, -0.2, -5.9];
    K.room(b, ctx, {
      x0: 1,
      z0: -12,
      x1: 11.6,
      z1: -6,
      y: BY + 0.03,
      h: 3.25,
      floor: "wood",
      fc: [0.5, 0.4, 0.32],
      wall: "wallpaper_green",
      wc: [0.6, 0.62, 0.5],
      wain: "wood_dark",
      wainC: panel,
      ceil: "plaster",
      cc: [0.45, 0.44, 0.4],
      surface: "wood",
    });
    const dt = K.table(b, 8.4, BY, -9.8, 1.8, 0.9, { mat: "mahogany" });
    K.chair(b, 8.4, BY, -8.9, 0, { mat: "leather" });
    K.terminal(ctx, "pv_term_katz", 8.9, dt, -10.0, 0, termOffice(), "bare");
    K.lamp(b, 7.8, dt + 0.35, -10.0, "pendant", [1, 0.85, 0.6], 0.8, 4.5, {
      ceil: dt + 0.45,
      shade: "paint_green",
      lightOpts: { box: OB },
    });
    b.box("brass", 7.8, dt, -10.0, 0.15, 0.4, 0.15, {});
    K.shelf(b, 11.35, BY, -9, -HP, 2.6, {
      mat: "wood_dark",
      items: ["book", "box", "book"],
      h: 2.2,
      seed: 41,
    });
    K.framed(
      b,
      4,
      BY + 2.0,
      -11.88,
      0,
      1,
      1.4,
      1.0,
      K.photo("deli", 20, 192, 144),
      { frame: "gold" },
    );
    K.salonWall(b, 1.2, 5.2, BY + 1.3, BY + 3.0, -6.12, 0, -1, "katz_office", {
      photos: "deli",
      density: 1,
    });
    K.lamp(b, 5, BY + 3.0, -9, "bulb", [1, 0.8, 0.55], 0.6, 5, {
      ceil: BY + 3.3,
      lightOpts: { box: OB },
    });
    K.anchor(ctx, "ledger", 8.0, dt + 0.02, -9.6);
    K.loot(ctx, "safe", 1.2, BY, -7, HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Katz Family Safe",
      tag: "safe",
    });
    K.loot(ctx, "file_cabinet", 1.3, BY, -10.9, HP, { loot: "file_cabinet" });
    K.loot(ctx, "desk", 4.2, BY, -11.4, 0, { loot: "desk" });

    // ---------------- doors & anchors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_katz_in",
      pos: new THREE.Vector3(DOOR_X, 1.3, Z1 + 0.35),
      label: "Katz's Delicatessen",
      verb: "Enter",
      target: { x: OX + 10, y: OY, z: OZ - 1.2, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("katz_deli")),
    });
    K.door(ctx, {
      id: "pv_katz_out",
      pos: new THREE.Vector3(OX + 10, OY + 1.3, OZ - 0.35),
      label: "East Houston Street",
      verb: "Leave",
      target: { x: DOOR_X, y: 0, z: Z1 + 1.8, yaw: PI },
    });
    K.anchor(ctx, "entrance", 10, 0, -1.2);
    K.anchor(ctx, "queen", -9.5, BY, -28);
    K.anchor(ctx, "boss", -9.5, BY, -28);
    const roaches = [
      [-6, BY, -24],
      [-4, BY, -32],
      [-11, BY, -20],
      [-0.7, BY, -30.2],
      [3, BY, -15],
    ];
    roaches.forEach((p, i) =>
      K.anchor(ctx, "roach" + (i + 1), p[0], p[1], p[2]),
    );
    const sp = [
      [-4, 0, -9],
      [4, 0, -14],
      [8, 0, -22],
      [-2, 0, -22],
      [2, BY, -20],
      [-6, BY, -14],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 1.2, BY, -7);
    K.anchor(ctx, "loot2", -5.5, 0, -19);
    K.anchor(ctx, "hoard", -12.2, BY, -32.5);
    K.loot(ctx, "ammo_box", -12.2, BY, -32.5, 0.4, {
      loot: "ammo_box",
      name: "Exterminator's Kit",
    });
    K.loot(ctx, "duffle_bag", -10.4, BY, -33.4, 1.2, {
      loot: "skeleton",
      name: "Exterminator's Bag",
    });
    K.loot(ctx, "cash_register", 7.2, 1.1, -1.6, PI, {
      loot: "cash_register",
      name: "Cashier's Register",
    });
    K.loot(ctx, "first_aid", 13.9, 1.3, -23, -HP, { loot: "first_aid" });
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_katz_int";
  }

  function termOffice() {
    return {
      // the office teletype was never given a password: Irv did not believe in them
      title: "KATZ'S DELICATESSEN — OFFICE",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-Inventory Management-",
      entries: [
        {
          title: "Brisket Schedule",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "Brine: 11 days. Smoke: 3 days. Steam: 3 hours. Hand-cut: ALWAYS.\nMachine slicing is for people who have given up on life.\n\nThe family ledger with the brine recipe stays in the desk. Not the safe — the safe is for money. The desk is for things that matter.\n\n(Safe combination is the year over the door, 1-8-8-8. If you forget it, look up.)";
          },
        },
        {
          title: 'Memo: "Send a Salami"',
          text: 'Per the Department of the Army, salami shipments to troops in West Germany are SUSPENDED "for the duration."\n\nThe duration of what, they did not say. We are sending them anyway. Our boys deserve cured meat.',
        },
        {
          title: "Memo: Lost Tickets",
          text: "I don't care that the sirens are going. I don't care that the sky is a funny color. Lost ticket is fifty dollars. Rules are rules. That is how you know it is still Katz's. — Irv",
        },
        {
          title: "Pest Control Invoice",
          text: 'Big Apple Pest Control — Job #4471\nStatus: TECHNICIAN MISSING\nAmount due: $0.00 ("we\'ll call it even")',
        },
        {
          title: "Open Family Safe",
          text: "The safe's bolts retract with a thunk.",
          action: () => {
            PV.unlockTagged("katz", "safe");
            K.notify("The Katz family safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA & SPAWN
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pv_q_brine_ledger",
      type: "misc",
      name: "Katz's Brine Ledger",
      weight: 1,
      value: 0,
      quest: true,
      desc: "A grease-stained family ledger, 1888–1967. Eleven days of brining, in four generations of handwriting. Page one: \"DON'T RUSH THE BRISKET. DON'T RUSH THE CUSTOMER.\"",
    });
    K.defineItem({
      id: "pv_katz_ticket",
      type: "misc",
      name: "Katz's Ticket #0000001",
      weight: 0,
      value: 150,
      desc: "The very first ticket, framed. Lost ticket fee: fifty dollars. This one is worth considerably more.",
    });
    K.defineItem({
      id: "pv_queen_gland",
      type: "misc",
      name: "Roach Queen Pheromone Gland",
      weight: 1,
      value: 90,
      desc: "Squishy, glowing faintly, smells like old salami. Somebody will pay for this. Probably the Glowkeepers.",
    });
  }
  function spawn(ctx) {
    const A = ctx.anchors;
    // the ledger waits in the office (until delivered)
    if (!PV.flag("ledger_done") && !K.has("pv_q_brine_ledger")) {
      K.safe("ledger", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup("pv_q_brine_ledger", 1, v(A.ledger), {
            static: false,
            keepY: true,
            noSave: true,
          });
      });
    }
    if (!PV.flag("ticket_taken"))
      K.safe("ticket", () => {
        if (!G.isStub("items") && G.items.spawnPickup)
          G.items.spawnPickup(
            "pv_katz_ticket",
            1,
            { x: A.hoard.x + 0.6, y: A.hoard.y + 0.02, z: A.hoard.z + 0.5 },
            { static: false, keepY: true, noSave: true },
          );
      });
    // the queen and her court
    if (!PV.flag("queen_dead")) {
      const q = PV.spawnActor(ctx, {
        id: "pv_katz_queen",
        type: "giant_roach",
        name: "Roach Queen",
        faction: "creatures",
        level: 7,
        hostile: true,
        hp: 220,
        dr: 12,
        damage: 3.2,
        speed: 4.5,
        pos: v(A.queen),
        yaw: 0.5,
        ai: "guard",
        home: "here",
        homeR: 7,
        noRespawn: true,
        aggroRange: 18,
        xp: 120,
        inventory: [["pv_queen_gland", 1]],
        onDeath: () => {
          PV.setFlag("queen_dead", true);
          K.notify("The Roach Queen is dead.");
        },
      });
      if (q && q.char && q.char.root) {
        q.char.root.scale.setScalar(3.2);
        q.radius = Math.max(q.radius || 0.35, 0.9);
      }
    }
    for (let i = 1; i <= 5; i++) {
      if (PV.flag("queen_dead") && i > 3) break;
      PV.spawnActor(ctx, {
        id: "pv_katz_roach" + i,
        type: "giant_roach",
        name: i === 1 ? "Royal Guard Roach" : "Giant Roach",
        faction: "creatures",
        level: i === 1 ? 4 : 2,
        hostile: true,
        pos: v(A["roach" + i]),
        yaw: i,
        ai: "wander",
        home: "here",
        homeR: 5,
        noRespawn: true,
      });
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }
  G.events.on("itemAdded", (id) => {
    if (id === "pv_katz_ticket") PV.setFlag("ticket_taken", true);
    if (
      id === "pv_q_brine_ledger" &&
      K.q.active("pv_what_shes_having") &&
      K.q.stage("pv_what_shes_having") === "ledger"
    )
      K.q.set("pv_what_shes_having", "return");
    if (id === "pv_q_brine_ledger" && !K.q.started("pv_what_shes_having"))
      K.q.start("pv_what_shes_having", { stage: "return" });
  });

  PV.define({
    id: "katz",
    name: "Katz's Delicatessen",
    interior: "katz_deli",
    order: 30,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
  });
})();
