/* src/poi_village/20_vanguard.js */
/* =====================================================================
 * NEW RAD CITY — poi_village / 20_vanguard.js
 * VILLAGE VANGUARD (Seventh Avenue South) — friendly jazz-club settlement.
 *
 * EXTERIOR (site x -110..-50, z 317..348): the little wedge-shaped
 *   building with the red awning over the door on Seventh Avenue, script
 *   neon, show-bill cases, a painted ghost sign on the long wall, and a
 *   scrap-walled settlement yard (tents, cook fire, water pump).
 * INTERIOR (cell village_vanguard): a steep narrow stair down into the
 *   low, triangular, red club room — banquettes, candle-lit tables, the bar,
 *   walls of musicians' photographs, and the bandstand in the point of the
 *   wedge where the Tin Man Trio (three Ardent Robotics Valet units) plays LIVE
 *   procedural jazz (WebAudio, positional, only while you're inside).
 *   Staff door → green room → stairs down → cellar (generator, workbench,
 *   Mags's reserve) → service tunnel (giant roaches) → ladder → backstage →
 *   the stage door out onto the bandstand: a full loop.
 * QUEST "Send a Salami": Mags wants the Katz's pastrami brine ledger so
 *   the Vanguard kitchen can serve real deli again. Optional: clear the
 *   roaches out of the cellar tunnel.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE) return;
  const PV = G._pv;
  const K = PV.kit;

  // ---- locks (G.locks): both combinations are on the management teletype in the office ----
  const LK = {
    safe: K.regLock({
      id: "pv_lk_vv_safe",
      label: "Vanguard Club Safe",
      kind: "safe",
      code: "1935",
      hint: "The management teletype in the office lists the combination.",
      learnedFrom: "Vanguard management teletype",
    }),
    reserve: K.regLock({
      id: "pv_lk_vv_reserve",
      label: "Mags's Reserve Chest",
      kind: "container",
      code: "0529",
      hint: "Mags's notes on the management teletype give the reserve chest's combination.",
      learnedFrom: "Vanguard management teletype (Mags's notes)",
    }),
  };
  const PI = Math.PI,
    HP = PI / 2;

  // exterior wedge (world)
  const A = [-51, 320],
    B = [-51, 347],
    C = [-78, 347];
  const H = 8.6;
  const DOOR_Z = 324.2;
  // interior (local)
  const FY = -4.2,
    CY = -1.2; // club floor / ceiling
  const WL = [
    [-9, -10],
    [-2.5, -28],
  ]; // left wall A→B
  const WR = [
    [9, -10],
    [2.5, -28],
  ]; // right wall
  const CELLAR = -7.6;
  const STAGE_Y = FY + 0.35;

  // ==================================================================
  // EXTERIOR
  // ==================================================================
  function exterior(ctx) {
    const b = K.builder({ name: "vanguard_ext", grime: 0.55 });
    const r = K.rng("vv_ext");
    const brick = [0.78, 0.6, 0.5],
      cream = [0.86, 0.8, 0.66];
    // walls: east (Seventh Ave), south, and the long hypotenuse (yard side)
    const wall = (p0, p1, n, tint, mat) => {
      b.quadGrid(
        mat || "brick_brown",
        ...K.orient(
          [p0[0], 0, p0[1]],
          [p1[0], 0, p1[1]],
          [p1[0], 3.4, p1[1]],
          [p0[0], 3.4, p0[1]],
          n[0],
          n[1],
        ),
        { tint: cream, uv: "side", seg: 4 },
      );
      b.quadGrid(
        mat || "brick_brown",
        ...K.orient(
          [p0[0], 3.4, p0[1]],
          [p1[0], 3.4, p1[1]],
          [p1[0], H, p1[1]],
          [p0[0], H, p0[1]],
          n[0],
          n[1],
        ),
        { tint, uv: "side", seg: 4 },
      );
    };
    wall(A, B, [1, 0], brick);
    wall(B, C, [0, 1], brick);
    const hl = Math.hypot(A[0] - C[0], A[1] - C[1]),
      hn = [-(A[1] - C[1]) / hl, (A[0] - C[0]) / hl]; // (dz,−dx)… pick NW-facing
    const hN = hn[0] < 0 ? hn : [-hn[0], -hn[1]];
    wall(C, A, hN, brick);
    // painted band / stucco line, parapet & coping
    for (const [p0, p1, n] of [
      [A, B, [1, 0]],
      [B, C, [0, 1]],
      [C, A, hN],
    ]) {
      const dx = p1[0] - p0[0],
        dz = p1[1] - p0[1],
        L = Math.hypot(dx, dz),
        ux = dx / L,
        uz = dz / L;
      b.beam(
        "limestone",
        p0[0] + n[0] * 0.08,
        3.45,
        p0[1] + n[1] * 0.08,
        p1[0] + n[0] * 0.08,
        3.45,
        p1[1] + n[1] * 0.08,
        0.18,
        0.2,
        { tint: [0.8, 0.76, 0.66] },
      );
      b.beam(
        "limestone",
        p0[0] + n[0] * 0.1,
        H + 0.1,
        p0[1] + n[1] * 0.1,
        p1[0] + n[0] * 0.1,
        H + 0.1,
        p1[1] + n[1] * 0.1,
        0.35,
        0.22,
        { tint: [0.7, 0.66, 0.6] },
      );
      // upper windows
      const nWin = Math.floor(L / 4.2);
      for (let k = 0; k < nWin; k++) {
        const t = ((k + 0.5) * L) / nWin;
        const wx = p0[0] + ux * t,
          wz = p0[1] + uz * t;
        if (Math.abs(wz - DOOR_Z) < 2.5 && n[0] > 0.9) continue;
        K.window(b, wx, 5.9, wz, n[0], n[1], 1.1, 1.9, {
          state: r() < 0.5 ? "boarded" : r() < 0.5 ? "broken" : "glass",
          lintel: 0.18,
          reveal: "brick_brown",
          trimTint: [0.8, 0.76, 0.66],
        });
      }
    }
    // roof (triangle) + parapet collider slices
    b.quadN(
      "concrete_dark",
      [C[0], H, C[1]],
      [B[0], H, B[1]],
      [A[0], H, A[1]],
      [A[0], H, A[1]],
      [0, 1, 0],
      { tint: [0.5, 0.48, 0.46] },
    );
    for (let k = 0; k < 6; k++) {
      const z0 = A[1] + (k * (B[1] - A[1])) / 6,
        z1 = z0 + (B[1] - A[1]) / 6;
      const w = (C[0] - A[0]) * ((z1 - A[1]) / (B[1] - A[1])); // negative width to the west
      b.col(A[0] + w * 0.92, 0, z0, A[0], H, z1, { tag: "building" });
    }
    // ---- ground floor, Seventh Ave side: door, awning, neon, show bills ----
    const dx = A[0] + 0.02;
    b.boxMM("paint_red", dx, 0, DOOR_Z - 0.85, dx + 0.14, 2.7, DOOR_Z + 0.85, {
      tint: [0.55, 0.12, 0.1],
    });
    b.plate("wood_dark", dx + 0.15, 1.2, DOOR_Z, 1, 0, 1.2, 2.3, null, {
      tint: [0.35, 0.12, 0.1],
    });
    b.plate("glass_dark", dx + 0.16, 1.9, DOOR_Z, 1, 0, 0.5, 0.6, null, {
      tint: [0.9, 0.5, 0.3],
    });
    b.cyl("brass", dx + 0.2, 1.05, DOOR_Z - 0.45, 0.04, 0.04, 0.06, 6);
    b.glow(dx + 0.35, 1.9, DOOR_Z, [1, 0.45, 0.2], 1.2);
    // THE red awning: long and narrow, out over the sidewalk to the curb on two iron poles,
    // VILLAGE VANGUARD in white on the valance and down both sides
    const aw0 = DOOR_Z - 1.7,
      aw1 = DOOR_Z + 1.7,
      ax1 = dx + 4.5, // poles stand just inside the 7th Ave kerb (x −46)
      ayH = 3.6,
      ayL = 2.95;
    b.quadN(
      "cloth_red",
      [dx, ayH, aw0],
      [dx, ayH, aw1],
      [ax1, ayL, aw1],
      [ax1, ayL, aw0],
      [0.15, 1, 0],
      { tint: [0.85, 0.12, 0.08], grime: 0.25 },
    );
    b.quadN(
      "cloth_red",
      [dx, ayH - 0.03, aw0],
      [dx, ayH - 0.03, aw1],
      [ax1, ayL - 0.03, aw1],
      [ax1, ayL - 0.03, aw0],
      [-0.15, -1, 0],
      { tint: [0.5, 0.08, 0.05] },
    );
    const val = K.signCell("vv_awning", "VILLAGE VANGUARD", 512, 72, {
      bg: "#b01810",
      fg: "#f8f4ea",
      font: "Georgia, serif",
      weather: true,
    });
    b.plate("art", ax1, ayL - 0.25, DOOR_Z, 1, 0, aw1 - aw0, 0.5, val, {
      off: 0.01,
    });
    const side = K.signCell("vv_aw_side2", "VILLAGE VANGUARD", 512, 64, {
      bg: "#b01810",
      fg: "#f8f4ea",
      font: "Georgia, serif",
    });
    for (const [z, nz] of [
      [aw0, -1],
      [aw1, 1],
    ]) {
      b.quadN(
        "cloth_red",
        [dx, ayH, z],
        [ax1, ayL, z],
        [ax1, ayL - 0.5, z],
        [dx, ayH - 0.5, z],
        [0, 0, nz],
        { tint: [0.8, 0.12, 0.08] },
      );
      b.plate(
        "art",
        (dx + ax1) / 2,
        (ayH + ayL) / 2 - 0.25,
        z,
        0,
        nz,
        ax1 - dx - 0.2,
        0.42,
        side,
        { off: 0.012 },
      );
      b.pipe("black_iron", dx, ayH, z, ax1, ayL, z, 0.025, 4);
      b.pipe("black_iron", ax1, ayL, z, ax1, 0, z, 0.035, 5); // curb poles
      b.col(ax1 - 0.08, 0, z - 0.08, ax1 + 0.08, ayL, z + 0.08, {
        walkable: false,
      });
    }
    b.plate("art", ax1, ayL - 0.25, DOOR_Z, -1, 0, aw1 - aw0, 0.5, val, {
      off: 0.01,
    });
    // bulbs under the awning spill warm light on the stair door
    for (let k = 0; k < 3; k++)
      b.glow(
        dx + 1.0 + k * 1.6,
        ayH - 0.45 - k * 0.2,
        DOOR_Z,
        [1, 0.6, 0.35],
        1.4,
      );
    b.glow(dx + 2.4, 1.2, DOOR_Z, [0.8, 0.25, 0.15], 4.5);
    // script neon above the awning (bigger), plus a vertical blade on the wedge point
    const neon = K.neonCell("vv_neon", "Village Vanguard", 512, 110, {
      color: "#ff3a4a",
      font: "Brush Script MT, cursive",
      italic: true,
      weight: "normal",
    });
    b.plate("paint_black", dx + 0.05, 5.0, DOOR_Z + 0.4, 1, 0, 6.4, 1.5, null, {
      tint: [0.3, 0.3, 0.3],
    });
    b.plate("neon", dx + 0.1, 5.0, DOOR_Z + 0.4, 1, 0, 6.1, 1.3, neon);
    b.glow(dx + 1.0, 5.0, DOOR_Z + 0.4, [1, 0.2, 0.25], 6.0);
    {
      const bx = A[0] + 0.7,
        bz = A[1] + 0.9;
      b.boxMM(
        "paint_black",
        bx - 0.12,
        3.9,
        bz - 0.2,
        bx + 1.3,
        8.2,
        bz + 0.2,
        {},
      );
      const vt = K.neonCell("vv_vert", "JAZZ", 128, 512, {
        color: "#40d0ff",
        vertical: true,
        font: "Arial Black, sans-serif",
      });
      for (const nz of [-1, 1]) {
        b.plate("neon", bx + 0.6, 6.05, bz + nz * 0.21, 0, nz, 1.1, 4.0, vt, {
          off: 0.01,
        });
        b.glow(bx + 0.6, 6.05, bz + nz * 0.9, [0.25, 0.7, 1.0], 3.2);
      }
    }
    // show-bill cases
    const bills = [
      ["TONIGHT\nTHE TIN MAN TRIO", "#1a1a1a", "#f0e0b0"],
      ["SUNDAYS\nMATINEE — NO MANIACS", "#2a1a14", "#e8d0a0"],
    ];
    bills.forEach(([t, bg, fg], k) => {
      const z = DOOR_Z + (k ? 1.6 : -1.6) * 1.0 + (k ? 0.6 : -0.6);
      b.boxMM("black_iron", dx, 1.0, z - 0.45, dx + 0.1, 2.3, z + 0.45, {});
      b.plate(
        "art",
        dx + 0.11,
        1.65,
        z,
        1,
        0,
        0.8,
        1.2,
        K.signCell("vv_bill" + k, t, 192, 288, {
          bg,
          fg,
          font: "Georgia, serif",
        }),
      );
    });
    // ghost sign on the long wall (yard side)
    const gs = K.signCell(
      "vv_ghost",
      "VILLAGE VANGUARD\nJAZZ SINCE 1935",
      768,
      256,
      {
        bg: null,
        fg: "rgba(235,225,200,0.75)",
        font: "Georgia, serif",
        weather: true,
      },
    );
    const mx = (A[0] + C[0]) / 2,
      mz = (A[1] + C[1]) / 2;
    b.plate(
      "decal",
      mx + hN[0] * 0.03,
      6.2,
      mz + hN[1] * 0.03,
      hN[0],
      hN[1],
      14,
      4.4,
      gs,
      { off: 0.01 },
    );
    b.burn(C[0] + 3, 1, C[1], 5, 0.6);

    // ---- settlement yard (NW) ----
    const fence = (x0, z0, x1, z1, gap) => {
      const L = Math.hypot(x1 - x0, z1 - z0),
        n = Math.ceil(L / 2.2);
      for (let k = 0; k < n; k++) {
        const t0 = k / n,
          t1 = (k + 1) / n,
          px0 = x0 + (x1 - x0) * t0,
          pz0 = z0 + (z1 - z0) * t0,
          px1 = x0 + (x1 - x0) * t1,
          pz1 = z0 + (z1 - z0) * t1;
        const mid = [(px0 + px1) / 2, (pz0 + pz1) / 2];
        if (gap && Math.hypot(mid[0] - gap[0], mid[1] - gap[1]) < gap[2])
          continue;
        const h = 2.2 + r() * 0.6;
        b.quadGrid(
          r() < 0.6 ? "corrugated" : "rust",
          [px0, 0, pz0],
          [px1, 0, pz1],
          [px1, h, pz1],
          [px0, h, pz0],
          {
            tint: r.pick([
              [0.8, 0.7, 0.6],
              [0.6, 0.5, 0.4],
              [0.7, 0.4, 0.3],
            ]),
            seg: 3,
          },
        );
        b.beam("wood_rotten", px0, 0, pz0, px0, h + 0.3, pz0, 0.12, 0.12);
        b.ocol(
          mid[0],
          mid[1],
          Math.hypot(px1 - px0, pz1 - pz0),
          0.2,
          0,
          h,
          Math.atan2(-(pz1 - pz0), px1 - px0),
          { tag: "fence", walkable: false },
        );
      }
    };
    fence(-109.5, 318.5, -53, 318.5, [-86, 318.5, 2.4]);
    fence(-109.5, 318.5, -109.5, 347.5);
    fence(-109.5, 347.5, -78.5, 347.5);
    // gate posts + sign
    for (const s of [-1, 1])
      b.beam(
        "wood",
        -86 + s * 2.3,
        0,
        318.5,
        -86 + s * 2.3,
        3.4,
        318.5,
        0.2,
        0.2,
      );
    b.beam("wood", -88.3, 3.3, 318.5, -83.7, 3.3, 318.5, 0.15, 0.3);
    b.plate(
      "art",
      -86,
      3.05,
      318.35,
      0,
      -1,
      3.4,
      0.7,
      K.signCell("vv_gate", "THE VANGUARD — DRINKS · MUSIC · PEACE", 512, 96, {
        bg: "#4a3a2a",
        fg: "#e8dcc0",
        font: "Georgia, serif",
      }),
    );
    // tents, cook fire, pump, tables
    for (const [tx, tz, yaw] of [
      [-102, 326, 0.3],
      [-100, 339, -0.4],
      [-92, 342, 0.1],
    ]) {
      const c = Math.cos(yaw),
        s = Math.sin(yaw);
      const P = (lx, ly, lz) => [
        tx + lx * c + lz * s,
        ly,
        tz - lx * s + lz * c,
      ];
      b.quadN(
        "fabric",
        P(-1.4, 0, -1.6),
        P(-1.4, 0, 1.6),
        P(0, 1.9, 1.6),
        P(0, 1.9, -1.6),
        [-c, 0.5, s],
        { tint: [0.6, 0.55, 0.4] },
      );
      b.quadN(
        "fabric",
        P(1.4, 0, -1.6),
        P(1.4, 0, 1.6),
        P(0, 1.9, 1.6),
        P(0, 1.9, -1.6),
        [c, 0.5, -s],
        { tint: [0.55, 0.5, 0.36] },
      );
      b.ocol(tx, tz, 2.8, 3.2, 0, 1.8, yaw, { tag: "tent", walkable: false });
    }
    b.hplate("dirt", -92, 0.02, 330, 26, 22, 0, null, {
      tint: [0.7, 0.6, 0.5],
      rect: [0, 0, 6, 5],
    });
    K.table(b, -95, 0, 331, 2.0, 0.9, { mat: "wood_rotten", yaw: 0.2 });
    b.cyl("metal", -106, 0, 344.5, 0.25, 0.25, 1.1, 8, {
      tint: [0.4, 0.5, 0.45],
    }); // pump
    b.beam("metal", -106, 1.0, 344.5, -105.4, 1.25, 344.5, 0.06, 0.06);
    b.col(-106.3, 0, 344.2, -105.7, 1.1, 344.8, {});
    yardSettlement(b, r, hN);
    ctx.extRoot = b.finish(null);
    ctx.extRoot.name = "poi_vanguard_ext";

    K.anchor(ctx, "door", A[0] + 1.5, 0, DOOR_Z, false);
    K.anchor(ctx, "yard", -94, 0, 334, false);
    K.loot(ctx, "campfire", -90, 0, 336, 0, {
      world: true,
      pot: true,
      container: false,
    });
    K.loot(ctx, "barrel", -104, 0, 321, 0, { world: true, container: false });
    K.loot(ctx, "crate", -107, 0, 336, 0.3, {
      world: true,
      loot: "crate",
      owner: "settlers",
    });
    K.loot(ctx, "mattress", -102, 0, 326.2, 0.3, {
      world: true,
      container: false,
    });
  }

  /**
   * Loop round 2 — the yard reads as a lived-in Ruins settlement instead of three tents on dirt:
   * a scrap-market row along the club's long wall (three stalls with patched awnings, goods, hand-painted boards;
   * Midge trades at the middle one), a corrugated lean-to shack on the west fence, a gate watch-platform with
   * sandbags and a searchlight, a rain-catcher tank on stilts, potato and bean planters, laundry, and strings of
   * bulbs zig-zagging from the gate to the club wall (glow sprites — no runtime lights). Everything goes into the
   * exterior builder's existing per-material meshes (no new draw calls); the gate → yard → club-door paths stay open.
   */
  function yardSettlement(b, r, hN) {
    const ux = C[0] - A[0],
      uz = C[1] - A[1],
      uL = Math.hypot(ux, uz);
    const u = [ux / uL, uz / uL]; // along the long wall, A → C
    const scrapTint = () =>
      r.pick([
        [0.78, 0.7, 0.6],
        [0.62, 0.52, 0.42],
        [0.72, 0.46, 0.34],
        [0.55, 0.6, 0.55],
      ]);
    // ---- market row along the club's long wall ----
    const yawStall = Math.atan2(-hN[0], -hN[1]) + Math.PI; // local +z = hN (customers' side)
    const stalls = [
      {
        t: 9.5,
        sign: "WATER · PURIFIED\n5 SCRIP",
        bg: "#2c4a5a",
        fg: "#e8f0e8",
        cloth: [0.3, 0.45, 0.55],
        goods: "jug",
      },
      {
        t: 17.0,
        sign: "HATTIE'S\nSCRAP & SUNDRIES",
        bg: "#5a3a1a",
        fg: "#f0dca8",
        cloth: [0.75, 0.55, 0.22],
        goods: "scrap",
      },
      {
        t: 24.5,
        sign: "SMOKES · RAGS\nRECORDS",
        bg: "#3a1a1a",
        fg: "#f0d0c0",
        cloth: [0.62, 0.18, 0.14],
        goods: "rags",
      },
    ];
    const out = [];
    for (const st of stalls) {
      const sx = A[0] + u[0] * st.t + hN[0] * 2.6,
        sz = A[1] + u[1] * st.t + hN[1] * 2.6;
      const c = Math.cos(yawStall),
        sn = Math.sin(yawStall);
      const P = (lx, ly, lz) => [
        sx + lx * c + lz * sn,
        ly,
        sz - lx * sn + lz * c,
      ];
      // counter: crates + a plank top
      b.box("wood_rotten", sx, 0, sz, 2.6, 0.95, 0.7, {
        yaw: yawStall,
        tint: [0.62, 0.5, 0.38],
      });
      b.box("wood", sx, 0.95, sz, 2.8, 0.06, 0.85, {
        yaw: yawStall,
        tint: [0.55, 0.42, 0.3],
      });
      b.ocol(sx, sz, 2.8, 0.85, 0, 1.0, yawStall, {
        tag: "stall",
        surface: "wood",
      });
      // posts + sloped patched awning (front 2.3 m, back 2.7 m)
      const posts = [
        [-1.4, 0.45, 2.3],
        [1.4, 0.45, 2.3],
        [-1.4, -1.7, 2.7],
        [1.4, -1.7, 2.7],
      ];
      for (const [lx, lz, h] of posts) {
        const q = P(lx, 0, lz);
        b.beam("wood_rotten", q[0], 0, q[2], q[0], h, q[2], 0.1, 0.1, {
          tint: [0.5, 0.4, 0.3],
        });
      }
      b.quadN(
        "fabric",
        P(-1.6, 2.3, 0.8),
        P(1.6, 2.3, 0.8),
        P(1.6, 2.72, -1.9),
        P(-1.6, 2.72, -1.9),
        [0, 1, 0],
        { tint: st.cloth, grime: 0.3 },
      );
      b.quadN(
        "fabric",
        P(-1.6, 2.29, 0.8),
        P(1.6, 2.29, 0.8),
        P(1.6, 2.71, -1.9),
        P(-1.6, 2.71, -1.9),
        [0, -1, 0],
        { tint: st.cloth.map((v) => v * 0.6) },
      );
      for (let k = 0; k < 3; k++) {
        const q = P(-1.1 + k * 1.1, 2.33, 0.2 - k * 0.4);
        b.hplate(
          "fabric",
          q[0],
          q[1] + k * 0.05,
          q[2],
          0.9,
          0.7,
          yawStall + (r() - 0.5) * 0.4,
          null,
          { tint: scrapTint() },
        );
      } // patches
      // valance board with the stall's sign
      const q0 = P(0, 1.95, 0.82);
      b.plate(
        "art",
        q0[0],
        q0[1],
        q0[2],
        hN[0],
        hN[1],
        2.6,
        0.62,
        K.signCell("vv_stall" + st.t, st.sign, 384, 96, {
          bg: st.bg,
          fg: st.fg,
          font: "Georgia, serif",
          weather: true,
        }),
        { off: 0.02 },
      );
      // goods on the counter
      for (let k = 0; k < 6; k++) {
        const q = P(-1.1 + k * 0.44, 1.01, (r() - 0.5) * 0.3);
        if (st.goods === "jug")
          b.cyl("glass", q[0], q[1], q[2], 0.1, 0.08, 0.32, 8, {
            tint: [0.55, 0.7, 0.75],
          });
        else if (st.goods === "scrap") {
          if (k % 2)
            b.cyl("rust", q[0], q[1], q[2], 0.09, 0.09, 0.14, 6, {
              tint: [0.7, 0.55, 0.4],
            });
          else
            b.box("metal", q[0], q[1], q[2], 0.26, 0.12, 0.2, {
              yaw: r() * 3,
              tint: [0.55, 0.55, 0.5],
            });
        } else
          b.box("fabric", q[0], q[1], q[2], 0.3, 0.08 + r() * 0.1, 0.24, {
            yaw: r() * 3,
            tint: scrapTint(),
          });
      }
      // hanging goods from the awning front + a bare bulb
      for (let k = 0; k < 4; k++) {
        const q = P(-1.2 + k * 0.8, 2.3, 0.7);
        b.pipe("black_iron", q[0], 2.3, q[2], q[0], 1.85, q[2], 0.01, 3);
        b.box(
          st.goods === "rags" ? "fabric" : "rust",
          q[0],
          1.55,
          q[2],
          0.18,
          0.3,
          0.18,
          { tint: scrapTint() },
        );
      }
      const lb = P(0, 2.2, -0.4);
      b.glow(lb[0], lb[1], lb[2], [1, 0.72, 0.4], 1.6);
      // back shelf against the wall
      const sh = P(0, 0, -1.55);
      b.box("wood_rotten", sh[0], 0, sh[2], 2.4, 1.6, 0.35, {
        yaw: yawStall,
        tint: [0.5, 0.4, 0.3],
      });
      b.ocol(sh[0], sh[2], 2.4, 0.35, 0, 1.6, yawStall, { tag: "stall" });
      out.push({ keeper: P(0, 0, -0.9), front: P(0, 0, 1.6) });
    }
    VANGUARD_STALLS.length = 0;
    VANGUARD_STALLS.push(...out);

    // ---- corrugated lean-to shack on the west fence (open to the east) ----
    {
      const x0 = -109.2,
        x1 = -105.4,
        z0 = 327.8,
        z1 = 333.8,
        hW = 2.9,
        hE = 2.4;
      b.quadGrid(
        "corrugated",
        [x0 + 0.05, 0, z0],
        [x0 + 0.05, 0, z1],
        [x0 + 0.05, hW, z1],
        [x0 + 0.05, hW, z0],
        { tint: scrapTint(), seg: 2 },
      );
      for (const [z, nz] of [
        [z0, -1],
        [z1, 1],
      ])
        b.quadN(
          r() < 0.5 ? "corrugated" : "rust",
          [x0, 0, z],
          [x1, 0, z],
          [x1, hE, z],
          [x0, hW, z],
          [0, 0, nz],
          { tint: scrapTint() },
        );
      b.quadN(
        "corrugated",
        [x0 - 0.2, hW + 0.05, z0 - 0.3],
        [x0 - 0.2, hW + 0.05, z1 + 0.3],
        [x1 + 0.4, hE - 0.05, z1 + 0.3],
        [x1 + 0.4, hE - 0.05, z0 - 0.3],
        [0.2, 1, 0],
        { tint: [0.6, 0.5, 0.4] },
      );
      b.quadN(
        "corrugated",
        [x0 - 0.2, hW, z0 - 0.3],
        [x0 - 0.2, hW, z1 + 0.3],
        [x1 + 0.4, hE - 0.1, z1 + 0.3],
        [x1 + 0.4, hE - 0.1, z0 - 0.3],
        [-0.2, -1, 0],
        { tint: [0.35, 0.3, 0.26] },
      );
      b.col(x0 - 0.1, 0, z0 - 0.08, x1, hW, z0 + 0.08, { tag: "shack" });
      b.col(x0 - 0.1, 0, z1 - 0.08, x1, hW, z1 + 0.08, { tag: "shack" });
      for (const z of [z0, z1])
        b.beam("wood_rotten", x1, 0, z, x1, hE, z, 0.12, 0.12);
      b.box("fabric", -107.8, 0, 331.6, 1.9, 0.25, 0.9, {
        tint: [0.55, 0.5, 0.4],
      }); // bedroll
      b.box("wood_rotten", -108.6, 0, 329.0, 0.6, 0.6, 0.6, {
        tint: [0.6, 0.48, 0.36],
      }); // crate stool
      b.glow(-107.2, 2.2, 330.8, [1, 0.7, 0.4], 1.1);
      b.plate(
        "decal",
        x1 + 0.02,
        1.8,
        z0 + 0.4,
        1,
        0,
        0.8,
        0.5,
        K.tag("KEEP OUT", "#d8d0c0", 256, 96),
        { off: 0.01 },
      );
    }
    // ---- gate watch platform (inside the fence, east of the gate) ----
    {
      const px = -80.5,
        pz = 321.2,
        hw = 1.3,
        py = 3.1;
      for (const [ox, oz] of [
        [-hw, -hw],
        [hw, -hw],
        [-hw, hw],
        [hw, hw],
      ]) {
        b.beam(
          "wood_rotten",
          px + ox,
          0,
          pz + oz,
          px + ox,
          py + 1.1,
          pz + oz,
          0.16,
          0.16,
          { tint: [0.5, 0.4, 0.3] },
        );
        b.col(
          px + ox - 0.1,
          0,
          pz + oz - 0.1,
          px + ox + 0.1,
          py,
          pz + oz + 0.1,
          { walkable: false },
        );
      }
      for (const d of [-1, 1]) {
        b.beam(
          "wood_rotten",
          px - hw,
          0.3,
          pz + d * hw,
          px + hw,
          py - 0.2,
          pz + d * hw,
          0.08,
          0.08,
        );
        b.beam(
          "wood_rotten",
          px + d * hw,
          0.3,
          pz - hw,
          px + d * hw,
          py - 0.2,
          pz + hw,
          0.08,
          0.08,
        );
      } // cross bracing
      b.boxMM(
        "wood",
        px - hw - 0.2,
        py,
        pz - hw - 0.2,
        px + hw + 0.2,
        py + 0.15,
        pz + hw + 0.2,
        { tint: [0.55, 0.45, 0.33] },
      );
      for (let k = 0; k < 10; k++) {
        const a = (k / 10) * Math.PI * 2;
        b.box(
          "fabric",
          px + Math.cos(a) * 1.25,
          py + 0.15,
          pz + Math.sin(a) * 1.25,
          0.7,
          0.32,
          0.4,
          { yaw: -a, tint: [0.62, 0.56, 0.42] },
        );
      } // sandbags
      for (let k = 0; k < 9; k++)
        b.beam(
          "wood_rotten",
          px + hw + 0.35,
          0.35 * k,
          pz,
          px + hw + 0.35,
          0.35 * k + 0.05,
          pz + 0.6,
          0.04,
          0.04,
        ); // ladder rungs
      for (const oz of [0, 0.6])
        b.beam(
          "wood_rotten",
          px + hw + 0.35,
          0,
          pz + oz,
          px + hw + 0.35,
          py + 0.2,
          pz + oz,
          0.06,
          0.06,
        );
      b.cyl("metal", px - 0.4, py + 0.15, pz - 0.4, 0.06, 0.06, 1.0, 6, {
        tint: [0.4, 0.4, 0.38],
      }); // searchlight
      b.cyl("metal", px - 0.4, py + 1.1, pz - 0.6, 0.28, 0.32, 0.4, 10, {
        tint: [0.45, 0.45, 0.42],
      });
      b.glow(px - 0.4, py + 1.3, pz - 0.95, [1, 0.95, 0.8], 2.2);
    }
    // ---- rain catcher on stilts ----
    {
      const tx = -107.6,
        tz = 340.2;
      for (const [ox, oz] of [
        [-0.9, -0.9],
        [0.9, -0.9],
        [-0.9, 0.9],
        [0.9, 0.9],
      ]) {
        b.beam(
          "rust",
          tx + ox,
          0,
          tz + oz,
          tx + ox * 0.8,
          3.0,
          tz + oz * 0.8,
          0.12,
          0.12,
        );
        b.col(
          tx + ox - 0.08,
          0,
          tz + oz - 0.08,
          tx + ox + 0.08,
          3.0,
          tz + oz + 0.08,
          { walkable: false },
        );
      }
      b.cyl("rust", tx, 3.0, tz, 1.15, 1.15, 1.7, 12, {
        tint: [0.55, 0.5, 0.45],
      });
      b.cyl("corrugated", tx, 4.7, tz, 1.5, 0.3, 0.5, 12, {
        tint: [0.6, 0.55, 0.5],
      }); // funnel
      b.pipe("rust", tx + 0.8, 3.1, tz + 0.8, -106, 1.1, 344.4, 0.05, 5); // feeds the pump
    }
    // ---- planters (potatoes, beans) along the north fence, west of the gate path ----
    for (const [gx, gz] of [
      [-98, 320.8],
      [-98, 323.2],
    ]) {
      b.boxMM("wood_rotten", gx - 2, 0, gz - 0.5, gx + 2, 0.5, gz + 0.5, {
        tint: [0.55, 0.45, 0.35],
      });
      b.boxMM("dirt", gx - 1.9, 0.5, gz - 0.4, gx + 1.9, 0.52, gz + 0.4, {});
      for (let p = 0; p < 7; p++)
        b.cyl(
          "cloth_green",
          gx - 1.6 + p * 0.53,
          0.5,
          gz + (r() - 0.5) * 0.3,
          0.05,
          0.14,
          0.35 + r() * 0.35,
          5,
          { tint: [0.42, 0.52, 0.22] },
        );
      b.col(gx - 2, 0, gz - 0.5, gx + 2, 0.5, gz + 0.5, { tag: "planter" });
    }
    // ---- laundry between the tents ----
    b.pipe("black_iron", -101.3, 2.1, 330.5, -95.5, 2.1, 341.0, 0.008, 3);
    for (let k = 0; k < 6; k++) {
      const t = 0.12 + k * 0.14,
        x = -101.3 + 5.8 * t,
        z = 330.5 + 10.5 * t;
      b.box("fabric", x, 1.45, z, 0.6, 0.62, 0.02, {
        yaw: Math.atan2(10.5, -5.8) + Math.PI / 2,
        tint: scrapTint(),
      });
    }
    // ---- strings of bulbs: gate → club wall, zig-zag over the yard ----
    const strands = [
      [
        [-83.7, 3.3, 318.6],
        [-66, 4.2, 330.5],
      ],
      [
        [-88.3, 3.3, 318.6],
        [-96, 3.0, 333],
      ],
      [
        [-96, 3.0, 333],
        [-74, 4.4, 340.5],
      ],
      [
        [-66, 4.2, 330.5],
        [-74, 4.4, 340.5],
      ],
    ];
    for (const [a, c2] of strands) {
      const L = Math.hypot(c2[0] - a[0], c2[2] - a[2]),
        n = Math.max(4, Math.round(L / 1.6));
      let prev = a;
      for (let k = 1; k <= n; k++) {
        const t = k / n,
          sag = Math.sin(t * Math.PI) * 0.6;
        const q = [
          a[0] + (c2[0] - a[0]) * t,
          a[1] + (c2[1] - a[1]) * t - sag,
          a[2] + (c2[2] - a[2]) * t,
        ];
        b.pipe(
          "black_iron",
          prev[0],
          prev[1],
          prev[2],
          q[0],
          q[1],
          q[2],
          0.008,
          3,
        );
        if (k < n)
          b.glow(
            q[0],
            q[1] - 0.1,
            q[2],
            k % 3 ? [1, 0.75, 0.42] : [1, 0.45, 0.35],
            0.75,
          );
        prev = q;
      }
    }
    for (const q of [
      [-96, 3.0, 333],
      [-74, 4.4, 340.5],
      [-66, 4.2, 330.5],
    ]) {
      b.beam("wood_rotten", q[0], 0, q[2], q[0], q[1] + 0.2, q[2], 0.1, 0.1);
      b.col(q[0] - 0.08, 0, q[2] - 0.08, q[0] + 0.08, q[1], q[2] + 0.08, {
        walkable: false,
      });
    }
  }
  const VANGUARD_STALLS = [];

  // ==================================================================
  // INTERIOR
  // ==================================================================
  function interior(ctx) {
    const O = ctx.O;
    const b = K.builder({
      name: "vanguard_int",
      off: O,
      lit: true,
      amb: [0.1, 0.055, 0.05],
      floors: [0, FY, STAGE_Y, CELLAR],
      grime: 0.4,
    });
    const r = K.rng("vv_int");
    const red = [0.62, 0.16, 0.13];
    const ROOM = [-9.2, FY - 0.3, -28.2, 9.2, CY + 0.2, -9.8];

    // ---------------- entry vestibule + the steep stair down ----------------
    const SX0 = -7.6,
      SX1 = -6.2;
    K.room(b, ctx, {
      x0: SX0,
      z0: -1.4,
      x1: SX1,
      z1: 0,
      y: 0,
      h: 2.6,
      floor: "wood",
      fc: [0.5, 0.35, 0.28],
      wall: "plaster",
      wc: red,
      ceil: "plaster",
      cc: [0.4, 0.2, 0.18],
      open: { n: true },
    });
    K.stairs(b, SX0, -10, SX1, -1.4, FY, 0, "+z", {
      mat: "wood",
      tint: [0.45, 0.3, 0.22],
      rail: "l",
      railMat: "black_iron",
      handMat: "black_iron",
      nosing: "brass",
    });
    // shaft walls & sloped ceiling
    for (const [x, s] of [
      [SX0, 1],
      [SX1, -1],
    ])
      K.segWall(b, x, -10, x, -1.4, FY, 2.6, s, {
        mat: "plaster",
        tint: red,
        trim: false,
      });
    b.quadN(
      "plaster",
      [SX0, 2.6, -1.4],
      [SX1, 2.6, -1.4],
      [SX1, CY, -10],
      [SX0, CY, -10],
      [0, -1, 0],
      { tint: [0.35, 0.16, 0.14] },
    );
    for (let k = 0; k < 5; k++) {
      // posters & photos on the way down
      const z = -2.4 - k * 1.6,
        y = 1.6 - (k + 0.5) * 0.8;
      K.framed(b, SX0 + 0.12, y, z, 1, 0, 0.5, 0.65, K.photo("jazz", k), {
        frame: "black_iron",
        fw: 0.03,
      });
      b.plate(
        "art",
        SX1 - 0.11,
        y + 0.1,
        z - 0.6,
        -1,
        0,
        0.55,
        0.8,
        K.signCell(
          "vv_poster" + k,
          [
            "TIN MAN TRIO",
            "BLUE MONDAYS",
            "NO GUNS\nON THE\nBANDSTAND",
            "SAX-O-MATIC\nLIVE",
            "MIND THE\nSTEPS",
          ][k],
          160,
          240,
          {
            bg: ["#2a1a14", "#16243a", "#3a1a10", "#1a2a1a", "#e8d8b0"][k],
            fg: k === 4 ? "#8a1a10" : "#e8d8b0",
            font: "Georgia, serif",
          },
        ),
      );
    }
    K.lamp(b, -6.9, 1.9, -1.8, "bulb", [1, 0.35, 0.25], 0.9, 5, {
      ceil: 2.6,
      lightOpts: { box: [SX0 - 0.1, FY - 0.3, -10.2, SX1 + 0.1, 3, 0.1] },
    });
    K.lamp(b, -6.9, -1.6, -8.2, "bulb", [1, 0.55, 0.3], 0.8, 5, {
      ceil: -0.8,
      lightOpts: { box: [SX0 - 0.1, FY - 0.3, -10.4, SX1 + 0.1, 3, 0.1] },
    });
    b.light(-6.9, 1.2, -0.4, [0.7, 0.75, 0.85], 0.5, 3.5); // street light from the door
    b.plate("wood_dark", -6.9, 1.2, -0.12, 0, -1, 1.2, 2.3, null, {
      tint: [0.4, 0.14, 0.1],
    });

    // ---------------- the club room ----------------
    // floor & ceiling (trapezoid)
    b.quadGrid(
      "carpet",
      [WL[0][0], FY, WL[0][1]],
      [WR[0][0], FY, WR[0][1]],
      [WR[1][0], FY, WR[1][1]],
      [WL[1][0], FY, WL[1][1]],
      { tint: [0.55, 0.22, 0.2], uv: "top" },
    );
    b.col(-9.2, FY - 0.3, -28.2, 9.2, FY, -10, {
      tag: "floor",
      surface: "carpet",
    });
    b.quadGrid(
      "tin",
      [WL[1][0], CY, WL[1][1]],
      [WR[1][0], CY, WR[1][1]],
      [WR[0][0], CY, WR[0][1]],
      [WL[0][0], CY, WL[0][1]],
      { tint: [0.35, 0.2, 0.18], uv: "top", grime: 0.3 },
    );
    // walls
    K.segWall(b, WL[0][0], WL[0][1], WL[1][0], WL[1][1], FY, CY, -1, {
      mat: "plaster",
      tint: red,
      wain: "wood_dark",
      wainC: [0.3, 0.16, 0.12],
      wainH: 0.9,
    });
    K.segWall(b, WR[0][0], WR[0][1], WR[1][0], WR[1][1], FY, CY, 1, {
      mat: "plaster",
      tint: red,
      wain: "wood_dark",
      wainC: [0.3, 0.16, 0.12],
      wainH: 0.9,
    });
    // back wall z=-10 (x -9..9): stair opening, staff door (x −2.5), kitchen door (x 5)
    K.segWall(b, -9, -10, 9, -10, FY, CY, 1, {
      mat: "plaster",
      tint: red,
      gaps: [
        { t: (SX0 + SX1) / 2 + 9, w: SX1 - SX0, y1: CY },
        { t: 6.5, w: 1.0 },
        { t: 14, w: 1.0 },
      ],
      wain: "wood_dark",
      wainC: [0.3, 0.16, 0.12],
      wainH: 0.9,
    });
    // stage wall z=-28 (x -2.5..2.5) with the stage door (x 1.8)
    K.segWall(b, -2.5, -28, 2.5, -28, FY, CY, -1, {
      mat: "velvet",
      tint: [0.6, 0.12, 0.1],
      gaps: [{ t: 4.3, w: 0.9, y0: STAGE_Y, y1: STAGE_Y + 2.1 }],
    });
    // curtain folds
    for (let x = -2.4; x < 2.4; x += 0.22) {
      if (x > 1.2 && x < 2.3) continue;
      b.box("velvet", x, STAGE_Y, -27.85, 0.12, CY - STAGE_Y - 0.05, 0.12, {
        tint: [0.55, 0.1, 0.08],
      });
    }
    b.beam("brass", -2.5, CY - 0.1, -27.8, 2.5, CY - 0.1, -27.8, 0.04, 0.04);
    // stage platform
    b.boxMM("wood_dark", -4.4, FY, -28, 4.4, STAGE_Y, -24.6, {
      tint: [0.4, 0.26, 0.18],
    });
    b.col(-4.4, FY, -28, 4.4, STAGE_Y, -24.6, {
      tag: "stage",
      surface: "wood",
    });
    b.beam("brass", -3.7, STAGE_Y, -24.58, 3.7, STAGE_Y, -24.58, 0.04, 0.04);
    // the neon on the stage wall (script, small)
    b.plate(
      "neon",
      0,
      CY - 0.55,
      -27.7,
      0,
      1,
      2.4,
      0.5,
      K.neonCell("vv_neon_in", "Village Vanguard", 512, 110, {
        color: "#ff4060",
        font: "Brush Script MT, cursive",
        italic: true,
        weight: "normal",
      }),
      { off: 0.02 },
    );
    b.glow(0, CY - 0.55, -27.4, [0.9, 0.2, 0.3], 2.5);
    // instruments: drum kit (left), upright piano (right), double bass (centre)
    drumKit(b, -1.9, STAGE_Y, -26.3);
    piano(b, 2.1, STAGE_Y, -26.2);
    bass(b, 0.2, STAGE_Y, -27.0);
    // stage lights (amber + blue), candle tables, bar back-light
    b.light(-1.2, CY - 0.2, -25.2, [1.0, 0.62, 0.3], 1.8, 6, { box: ROOM });
    b.light(1.4, CY - 0.2, -25.6, [0.45, 0.55, 1.0], 1.3, 5.5, { box: ROOM });
    for (const [x, c] of [
      [-1.2, [1, 0.62, 0.3]],
      [1.4, [0.45, 0.55, 1.0]],
    ]) {
      b.cyl("black_iron", x, CY - 0.35, -24.3, 0.12, 0.16, 0.3, 8, {
        bottom: true,
      });
      b.glow(x, CY - 0.4, -24.5, c, 1.2);
    }
    // warm wall-washers along both long walls (picture lights over the photo gallery)
    for (let t = 0.1; t < 0.95; t += 0.18)
      for (const W of [WL, WR]) {
        const x = W[0][0] + (W[1][0] - W[0][0]) * t,
          z = W[0][1] + (W[1][1] - W[0][1]) * t;
        b.light(x * 0.86, CY - 0.3, z, [1, 0.6, 0.4], 0.75, 4.2, { box: ROOM });
        b.glow(x * 0.9, CY - 0.25, z, [0.8, 0.45, 0.3], 0.5);
      }
    // banquettes along the slanted walls + photo walls
    for (const [W, s] of [
      [WL, 1],
      [WR, -1],
    ]) {
      const ax = W[0][0],
        az = W[0][1],
        bx = W[1][0],
        bz = W[1][1];
      const L = Math.hypot(bx - ax, bz - az),
        ux = (bx - ax) / L,
        uz = (bz - az) / L;
      // robust inward normal: towards the room centre line x=0
      let ix = uz,
        iz = -ux;
      if (ix * (0 - ax) + iz * (-19 - az) < 0) {
        ix = -ix;
        iz = -iz;
      }
      const yaw = Math.atan2(-ix, -iz);
      for (let t = 1.2; t < L - 3.6; t += 2.3) {
        const px = ax + ux * t + ix * 0.42,
          pz = az + uz * t + iz * 0.42;
        K.sofa(b, px, FY, pz, 2.1, yaw, {
          mat: "leather_red",
          tint: [0.9, 0.3, 0.25],
          d: 0.62,
          backH: 0.55,
          arms: false,
        });
        // small table + candle in front
        const tx = px + ix * 1.0,
          tz = pz + iz * 1.0;
        K.roundTable(b, tx, FY, tz, 0.34, { mat: "wood_dark", h: 0.72 });
        b.cyl("glass", tx, FY + 0.72, tz, 0.035, 0.035, 0.08, 6, {
          tint: [0.9, 0.3, 0.2],
        });
        b.light(tx, FY + 0.95, tz, [1, 0.55, 0.25], 0.55, 2.4, { box: ROOM });
        b.glow(tx, FY + 0.82, tz, [1, 0.5, 0.2], 0.35);
        K.chair(b, tx + ix * 0.6, FY, tz + iz * 0.6, yaw + PI, {
          mat: "wood_dark",
        });
      }
      // photographs
      for (let t = 0.8; t < L - 0.5; t += 0.95) {
        const px = ax + ux * t + ix * 0.1,
          pz = az + uz * t + iz * 0.1;
        const hy = FY + 1.6 + (Math.floor(t / 0.95) % 2) * 0.55;
        K.framed(
          b,
          px,
          hy,
          pz,
          ix,
          iz,
          0.42,
          0.52,
          K.photo("jazz", (((t * 7) | 0) % 16) + (s > 0 ? 0 : 16)),
          { frame: "paint_black", fw: 0.03 },
        );
      }
    }
    // centre tables
    for (const [tx, tz] of [
      [-2.5, -15],
      [0.5, -17.5],
      [-1, -20.5],
      [2.2, -14],
      [1.6, -21.5],
      [-3.8, -18.2],
    ]) {
      K.roundTable(b, tx, FY, tz, 0.36, { mat: "wood_dark", h: 0.72 });
      b.cyl("glass", tx, FY + 0.72, tz, 0.035, 0.035, 0.08, 6, {
        tint: [0.9, 0.3, 0.2],
      });
      b.light(tx, FY + 0.95, tz, [1, 0.55, 0.25], 0.5, 2.3, { box: ROOM });
      b.glow(tx, FY + 0.82, tz, [1, 0.5, 0.2], 0.35);
      for (let k = 0; k < 3; k++) {
        const a = k * 2.1 + tx;
        K.chair(
          b,
          tx + Math.cos(a) * 0.62,
          FY,
          tz + Math.sin(a) * 0.62,
          Math.atan2(Math.cos(a), Math.sin(a)),
          { mat: "wood_dark" },
        );
      }
    }
    // the bar (back wall, right)
    b.boxMM("mahogany", 1.4, FY, -11.7, 7.4, FY + 1.08, -11.1, {
      tint: [0.55, 0.25, 0.18],
    });
    b.boxMM("brass", 1.35, FY + 1.08, -11.75, 7.45, FY + 1.12, -11.05, {});
    b.beam("brass", 1.4, FY + 0.2, -11.78, 7.4, FY + 0.2, -11.78, 0.04, 0.04); // foot rail
    b.col(1.35, FY, -11.75, 7.45, FY + 1.12, -11.05, {
      tag: "counter",
      surface: "wood",
    });
    K.shelf(b, 4.5, FY + 0.9, -10.25, PI, 3.6, {
      mat: "wood_dark",
      items: ["bottle", "bottle", "bottle", "jar"],
      h: 1.4,
      levels: 3,
      d: 0.3,
      seed: 77,
      col: false,
    });
    b.plate("lamp", 4.5, FY + 1.65, -10.13, 0, 1, 3.6, 1.3, null, {
      tint: [0.35, 0.2, 0.08],
    }); // back-lit mirror glow
    b.light(4.5, FY + 1.5, -10.6, [1, 0.62, 0.3], 1.1, 5, { box: ROOM });
    for (let x = 1.9; x < 7.2; x += 0.9) {
      b.cyl("chrome", x, FY, -12.3, 0.2, 0.18, 0.05, 8);
      b.cyl("chrome", x, FY, -12.3, 0.04, 0.04, 0.72, 6);
      b.cyl("leather_red", x, FY + 0.72, -12.3, 0.2, 0.2, 0.08, 10);
    }
    for (let k = 0; k < 6; k++)
      b.cyl("glass", 2 + k * 0.9, FY + 1.12, -11.4, 0.04, 0.035, 0.12, 6, {
        tint: [0.8, 0.7, 0.5],
      });
    K.lamp(b, 4.5, CY - 0.4, -11.6, "pendant", [1, 0.6, 0.3], 0.6, 4, {
      ceil: CY,
      shade: "paint_red",
      lightOpts: { box: ROOM },
    });
    K.lamp(b, -4, CY - 0.3, -13, "bulb", [1, 0.3, 0.2], 0.5, 6, {
      ceil: CY,
      lightOpts: { box: ROOM },
    });
    K.lamp(b, 0, CY - 0.3, -19, "bulb", [1, 0.3, 0.2], 0.5, 6, {
      ceil: CY,
      lightOpts: { box: ROOM },
    });
    K.anchor(ctx, "bartender", 4.2, FY, -10.6);
    K.loot(ctx, "cash_register", 6.6, FY + 1.12, -11.4, PI, {
      container: false,
    });
    K.loot(ctx, "fizzo_machine", -8.1, FY, -11.2, -0.3, {
      loot: "fizzo_machine",
    });

    // ---------------- green room (x −6.2..1, z −10..−4) + stair down ----------------
    const GR = { x0: -6.2, z0: -10, x1: 1, z1: -4 };
    K.gap(ctx, -2.5, -10, 1.0, FY, 2.2);
    K.gap(ctx, 5, -10, 1.0, FY, 2.2);
    K.room(b, ctx, {
      x0: GR.x0,
      z0: GR.z0,
      x1: GR.x1,
      z1: GR.z1,
      y: FY,
      h: 3.0,
      floor: "wood",
      fc: [0.5, 0.36, 0.28],
      wall: "wallpaper_green",
      wc: [0.55, 0.5, 0.4],
      ceil: "plaster",
      cc: [0.45, 0.42, 0.38],
      noFloor: true,
      surface: "wood",
    });
    b.face("wood", GR.x0, FY, -5.3, 1, 0, 0, 0, 0, -1, GR.x1 - GR.x0, 4.7, {
      uv: "top",
      tint: [0.5, 0.36, 0.28],
    });
    b.col(GR.x0, FY - 0.3, -10, GR.x1, FY, -5.3, {
      tag: "floor",
      surface: "wood",
    });
    b.face("wood", 0.5, FY, -4, 1, 0, 0, 0, 0, -1, 0.5, 1.3, {
      uv: "top",
      tint: [0.5, 0.36, 0.28],
    });
    b.col(0.5, FY - 0.3, -5.3, 1, FY, -4, { tag: "floor" });
    K.stairs(b, -6, -5.3, 0.5, -4.1, CELLAR, FY, "-x", {
      mat: "wood",
      tint: [0.45, 0.32, 0.24],
      rail: "l",
      railMat: "black_iron",
      handMat: "wood_dark",
    });
    K.railing(b, -6, -5.3, 0.5, -5.3, FY, { h: 1.0 });
    // vanity mirror with bulbs, costume rack, couch, instrument cases
    b.plate("glass", -3.6, FY + 1.6, -9.88, 0, 1, 1.6, 0.9, null, {
      tint: [0.5, 0.52, 0.5],
    });
    for (let k = 0; k < 7; k++) {
      const bx = -4.45 + k * 0.28;
      b.geo("lamp", K.sphereGeo(), {
        x: bx,
        y: FY + 2.1,
        z: -9.85,
        s: 0.04,
        tint: [1, 0.85, 0.6],
      });
    }
    b.light(-3.6, FY + 2.0, -9.4, [1, 0.8, 0.55], 1.0, 4.5, {
      box: [
        GR.x0 - 0.1,
        FY - 0.2,
        GR.z0 - 0.1,
        GR.x1 + 0.1,
        FY + 3.2,
        GR.z1 + 0.1,
      ],
    });
    b.glow(-3.6, FY + 2.1, -9.7, [0.9, 0.7, 0.5], 1.4);
    K.table(b, -3.6, FY, -9.55, 1.8, 0.5, { mat: "wood_dark", h: 0.78 });
    K.sofa(b, -0.2, FY, -8.4, 1.9, -HP, {
      mat: "velvet",
      tint: [0.4, 0.3, 0.5],
    });
    b.pipe("chrome", -5.9, FY + 1.7, -9.6, -5.9, FY + 1.7, -7.2, 0.02, 4);
    for (let k = 0; k < 5; k++)
      b.box("fabric", -5.9, FY + 0.7, -9.3 + k * 0.45, 0.05, 0.95, 0.4, {
        tint: r.pick([
          [0.8, 0.7, 0.3],
          [0.2, 0.2, 0.25],
          [0.7, 0.2, 0.3],
          [0.3, 0.4, 0.6],
        ]),
      });
    b.box("leather", -2.2, FY, -7.4, 0.5, 1.3, 0.25, {
      yaw: 0.4,
      tint: [0.3, 0.2, 0.12],
    }); // bass case
    b.box("leather", -1.4, FY, -7.8, 0.3, 0.2, 0.9, {
      yaw: -0.3,
      tint: [0.25, 0.15, 0.1],
    }); // horn case
    K.lamp(b, -2.6, FY + 2.6, -7.2, "bulb", [1, 0.8, 0.55], 0.6, 5, {
      ceil: FY + 3.0,
      lightOpts: {
        box: [
          GR.x0 - 0.1,
          FY - 0.2,
          GR.z0 - 0.1,
          GR.x1 + 0.1,
          FY + 3.2,
          GR.z1 + 0.1,
        ],
      },
    });
    b.plate(
      "art",
      -2.5,
      FY + 2.3,
      -4.12,
      0,
      -1,
      1.1,
      0.4,
      K.signCell("vv_staff", "STAFF ONLY", 256, 80, {
        bg: "#2a1a14",
        fg: "#e8d8b0",
      }),
    );
    K.loot(ctx, "locker", 0.6, FY, -9.6, -HP, {
      loot: "locker",
      owner: "settlers",
      name: "Band Locker",
    });
    // (the room's south side: back wall line z=−4 of the club back row is the office/kitchen … close it)

    // ---------------- kitchen (x 1..9, z −10..−4) ----------------
    K.gap(ctx, 1, -7, 1.0, FY, 2.2);
    K.gap(ctx, 5, -4, 1.0, FY, 2.2);
    const KB = [0.9, FY - 0.2, -10.1, 9.1, FY + 3.2, -3.9];
    K.room(b, ctx, {
      x0: 1,
      z0: -10,
      x1: 9,
      z1: -4,
      y: FY,
      h: 3.0,
      floor: "checker",
      fc: [0.7, 0.68, 0.64],
      wall: "tile",
      wc: [0.8, 0.8, 0.74],
      ceil: "plaster",
      cc: [0.6, 0.6, 0.56],
    });
    b.boxMM("metal", 7.8, FY, -9.9, 8.9, FY + 0.9, -6.8, {
      tint: [0.5, 0.5, 0.48],
    }); // range
    for (let k = 0; k < 4; k++)
      b.cyl("black_iron", 8.35, FY + 0.9, -9.4 + k * 0.7, 0.16, 0.16, 0.02, 10);
    b.boxMM("metal", 7.9, FY + 1.9, -9.9, 8.95, FY + 2.6, -6.8, {
      tint: [0.45, 0.45, 0.42],
    }); // hood
    b.col(7.8, FY, -9.9, 8.9, FY + 0.9, -6.8, { tag: "counter" });
    b.boxMM("steel", 3.2, FY, -7.6, 6.2, FY + 0.9, -6.6, {
      tint: [0.7, 0.72, 0.72],
    }); // prep table
    b.col(3.2, FY, -7.6, 6.2, FY + 0.9, -6.6, { tag: "counter" });
    b.box("wood", 4.2, FY + 0.9, -7.1, 0.5, 0.05, 0.35, {});
    b.box("steel", 4.2, FY + 0.95, -7.1, 0.3, 0.02, 0.05, {});
    b.pipe("black_iron", 3.4, FY + 2.2, -7.1, 6.0, FY + 2.2, -7.1, 0.02, 4);
    for (let k = 0; k < 5; k++)
      b.cyl("steel", 3.7 + k * 0.55, FY + 1.7, -7.1, 0.14, 0.12, 0.14, 8, {
        tint: [0.6, 0.62, 0.6],
      });
    K.shelf(b, 1.25, FY, -8.2, HP, 3.0, {
      mat: "metal",
      items: ["can", "jar", "box", "can"],
      seed: 88,
    });
    b.boxMM("ceramic", 5.8, FY + 0.8, -9.95, 7.2, FY + 0.95, -9.3, {
      tint: [0.85, 0.85, 0.82],
    });
    // Mags's chalkboard menu (quest hook)
    b.plate(
      "art",
      3.6,
      FY + 1.8,
      -9.88,
      0,
      1,
      1.4,
      1.0,
      K.signCell(
        "vv_menu",
        "MENU\nROACH SKEWER 4 SCRIP\nPOTATO MASH 3 SCRIP\nPASTRAMI ON RYE ???",
        256,
        192,
        {
          bg: "#1c241e",
          fg: "#e8e8d8",
          font: "Comic Sans MS, cursive",
          weight: "normal",
        },
      ),
    );
    K.lamp(b, 5, FY + 2.8, -7, "tube", [0.9, 0.95, 1.0], 1.0, 7, {
      ceil: FY + 3.0,
      len: 1.4,
      lightOpts: { box: KB },
    });
    K.loot(ctx, "fridge", 1.5, FY, -5.0, HP, {
      loot: "fridge",
      owner: "settlers",
    });

    // ---------------- office (x 1..9, z −4..0) ----------------
    const OB = [0.9, FY - 0.2, -4.1, 9.1, FY + 3.2, 0.1];
    K.room(b, ctx, {
      x0: 1,
      z0: -4,
      x1: 9,
      z1: 0,
      y: FY,
      h: 3.0,
      floor: "wood",
      fc: [0.5, 0.38, 0.3],
      wall: "wallpaper",
      wc: [0.6, 0.45, 0.4],
      wain: "wood_dark",
      wainC: [0.4, 0.26, 0.2],
      ceil: "plaster",
      cc: [0.5, 0.46, 0.42],
      surface: "wood",
    });
    const dt = K.table(b, 6.5, FY, -1.3, 1.7, 0.85, { mat: "mahogany" });
    K.chair(b, 6.5, FY, -0.5, PI, { mat: "leather" });
    K.terminal(
      ctx,
      "pv_term_vanguard",
      6.9,
      dt,
      -1.45,
      0,
      termOffice(),
      "bare",
    );
    K.lamp(b, 5.9, dt + 0.35, -1.5, "pendant", [1, 0.85, 0.6], 0.8, 4.5, {
      ceil: dt + 0.45,
      shade: "paint_green",
      lightOpts: { box: OB },
    });
    b.box("brass", 5.9, dt, -1.5, 0.15, 0.4, 0.15, {});
    K.salonWall(
      b,
      1.4,
      8.6,
      FY + 1.1,
      FY + 2.8,
      -0.12,
      0,
      -1,
      "vv_office_photos",
      { density: 0.95, photos: "jazz" },
    );
    for (let k = 0; k < 4; k++) {
      b.boxMM(
        "wood",
        1.2 + k * 0.62,
        FY,
        -3.9,
        1.75 + k * 0.62,
        FY + 0.45,
        -3.4,
        { tint: [0.5, 0.4, 0.3] },
      );
      for (let j = 0; j < 8; j++)
        b.box(
          "flat",
          1.25 + k * 0.62 + j * 0.06,
          FY + 0.45,
          -3.65,
          0.01,
          0.32,
          0.32,
          {
            tint: r.pick([
              [0.1, 0.1, 0.1],
              [0.7, 0.2, 0.2],
              [0.2, 0.3, 0.6],
              [0.8, 0.7, 0.4],
            ]),
          },
        );
    }
    b.col(1.2, FY, -3.9, 3.7, FY + 0.45, -3.4, { tag: "furniture" });
    b.boxMM("wood_dark", 1.2, FY, -2.2, 1.9, FY + 0.8, -1.4, {
      tint: [0.45, 0.3, 0.2],
    });
    b.cyl("paint_black", 1.55, FY + 0.8, -1.8, 0.28, 0.28, 0.02, 16);
    b.cyl("brass", 1.55, FY + 0.8, -1.8, 0.03, 0.05, 0.35, 6, {});
    b.col(1.2, FY, -2.2, 1.9, FY + 0.8, -1.4, { tag: "furniture" });
    K.lamp(b, 5, FY + 2.7, -2, "bulb", [1, 0.8, 0.55], 0.6, 5, {
      ceil: FY + 3.0,
      lightOpts: { box: OB },
    });
    K.loot(ctx, "safe", 8.8, FY, -3.4, -HP, {
      loot: "safe",
      lock: LK.safe,
      name: "Club Safe",
      tag: "safe",
      owner: "settlers",
    });
    K.loot(ctx, "file_cabinet", 8.6, FY, -0.5, -HP, {
      loot: "file_cabinet",
      owner: "settlers",
    });

    // ---------------- cellar (x −6.2..9, z −10..−3.9) at y −7.6 ----------------
    const CB = [-6.3, CELLAR - 0.2, -10.1, 9.1, FY, -3.8];
    K.gap(ctx, 0, -10, 1.8, CELLAR, 2.3);
    K.room(b, ctx, {
      x0: -6.2,
      z0: -10,
      x1: 9,
      z1: -3.9,
      y: CELLAR,
      h: 3.1,
      floor: "concrete",
      fc: [0.55, 0.53, 0.5],
      wall: "brick_red",
      wc: [0.6, 0.5, 0.44],
      ceil: "concrete",
      cc: [0.4, 0.4, 0.38],
      noCeil: true,
      trim: false,
    });
    b.face("concrete", -6.2, CELLAR + 3.1, -10, 1, 0, 0, 0, 0, 1, 15.2, 4.7, {
      uv: "top",
      tint: [0.4, 0.4, 0.38],
    });
    b.face("concrete", 0.5, CELLAR + 3.1, -5.3, 1, 0, 0, 0, 0, 1, 8.5, 1.4, {
      uv: "top",
      tint: [0.4, 0.4, 0.38],
    });
    for (let x = -5; x < 9; x += 2.5)
      b.beam("rust", x, CELLAR + 2.95, -10, x, CELLAR + 2.95, -3.9, 0.2, 0.3, {
        tint: [0.5, 0.4, 0.32],
      });
    // generator + workbench + kegs + crates
    b.boxMM("paint_yellow", 5.8, CELLAR, -9.6, 8.6, CELLAR + 1.4, -8.2, {
      tint: [0.55, 0.45, 0.15],
    });
    b.cyl("metal_dark", 7.2, CELLAR + 1.4, -8.9, 0.35, 0.35, 0.5, 10);
    b.pipe("rust", 8.4, CELLAR + 1.2, -8.9, 8.4, CELLAR + 3.1, -8.9, 0.1, 6);
    b.col(5.8, CELLAR, -9.6, 8.6, CELLAR + 1.4, -8.2, {
      tag: "machine",
      surface: "metal",
    });
    b.glow(6.2, CELLAR + 1.1, -8.15, [0.3, 1, 0.3], 0.3);
    for (let k = 0; k < 5; k++) {
      b.cyl(
        "wood",
        -5.4 + (k % 3) * 0.75,
        CELLAR,
        -9.4 + Math.floor(k / 3) * 0.8,
        0.33,
        0.33,
        0.9,
        10,
        { tint: [0.55, 0.4, 0.28] },
      );
      b.cyl(
        "rust",
        -5.4 + (k % 3) * 0.75,
        CELLAR + 0.2,
        -9.4 + Math.floor(k / 3) * 0.8,
        0.34,
        0.34,
        0.06,
        10,
        { top: false },
      );
    }
    b.col(-5.8, CELLAR, -9.8, -3.6, CELLAR + 0.9, -8.2, {});
    K.shelf(b, 8.75, CELLAR, -5.5, -HP, 2.6, {
      mat: "metal",
      items: ["box", "bottle", "jar", "can"],
      seed: 99,
    });
    K.lamp(b, 2, CELLAR + 2.6, -7, "cage", [1, 0.75, 0.45], 0.9, 7, {
      ceil: CELLAR + 3.1,
      lightOpts: { box: CB },
    });
    K.lamp(b, 7, CELLAR + 2.6, -5, "cage", [1, 0.75, 0.45], 0.6, 5, {
      ceil: CELLAR + 3.1,
      lightOpts: { box: CB },
    });
    K.loot(ctx, "workbench", 3.6, CELLAR, -9.5, 0, { container: false });
    K.loot(ctx, "footlocker", -5.6, CELLAR, -4.6, HP, {
      loot: "drinks",
      lock: LK.reserve,
      name: "Mags's Reserve (1938)",
      owner: "settlers",
    });
    K.loot(ctx, "crate", 8.2, CELLAR, -4.6, 0.2, {
      loot: "crate",
      owner: "settlers",
    });
    K.skel(ctx, 1.2, CELLAR, -4.6, 0.8, "sitting");
    b.boxMM("paint_black", 0.6, CELLAR, -4.3, 1.8, CELLAR + 0.9, -3.95, {
      tint: [0.25, 0.25, 0.25],
    }); // tape machine
    for (const s of [-1, 1])
      b.cyl("metal", 1.2 + s * 0.3, CELLAR + 0.9, -4.12, 0.18, 0.18, 0.03, 12);
    K.note(ctx, "pv_reel_lastset", 1.3, CELLAR + 0.92, -4.3, {
      type: "tape",
      name: "Tape Reel: The Last Set (Mar. '67)",
      title: "Live at the Vanguard — the last set",
      text: '[Applause. Glasses. A piano vamps.]\n\nMC: "Ladies and gentlemen, it\'s getting late and the radio says the Russians are getting closer, so we\'re gonna play slower. Make it last."\n\n[A trio plays for eleven minutes. Somebody requests a song the band doesn\'t know. They play it anyway.]\n\nMC: "Tip your bartender. Tomorrow\'s a big day. Everybody says so."\n\n[Applause. The tape runs on in silence for forty minutes. Then, very faintly, the engineer, to himself: "...Worth it."]',
    });

    // ---------------- service tunnel (x −1..1, z −31..−10) ----------------
    const TB = [-1.2, CELLAR - 0.2, -31.2, 1.2, CELLAR + 2.8, -9.9];
    K.room(b, ctx, {
      x0: -1,
      z0: -31,
      x1: 1,
      z1: -10,
      y: CELLAR,
      h: 2.5,
      floor: "concrete",
      fc: [0.45, 0.44, 0.42],
      wall: "brick_brown",
      wc: [0.55, 0.45, 0.4],
      ceil: "concrete",
      cc: [0.35, 0.34, 0.32],
      trim: false,
    });
    b.pipe("rust", 0.8, CELLAR + 2.2, -10, 0.8, CELLAR + 2.2, -31, 0.08, 6, {
      tint: [0.5, 0.4, 0.32],
    });
    b.pipe("metal", -0.8, CELLAR + 2.1, -10, -0.8, CELLAR + 2.1, -31, 0.05, 5, {
      tint: [0.35, 0.4, 0.35],
    });
    for (let k = 0; k < 6; k++)
      b.hplate(
        "decal",
        (r() - 0.5) * 1.2,
        CELLAR + 0.013 + k * 0.001,
        -12 - k * 3.2,
        1.2,
        1.6,
        r() * 3,
        K.decal(k % 2 ? "puddle" : "roach", k),
      );
    for (const z of [-14, -22, -29])
      K.lamp(b, 0, CELLAR + 2.25, z, "cage", [0.9, 0.7, 0.4], 0.55, 4.5, {
        ceil: CELLAR + 2.5,
        lightOpts: { box: TB },
      });
    b.hplate(
      "decal",
      0,
      CELLAR + 0.02,
      -26,
      1.8,
      2.4,
      0.3,
      K.decal("roach", 7),
    );
    // ladder to the backstage hatch
    for (let k = 0; k < 11; k++)
      b.beam(
        "black_iron",
        -0.45,
        CELLAR + 0.3 + k * 0.3,
        -30.85,
        0.45,
        CELLAR + 0.3 + k * 0.3,
        -30.85,
        0.03,
        0.03,
      );
    for (const s of [-1, 1])
      b.beam(
        "black_iron",
        s * 0.45,
        CELLAR,
        -30.85,
        s * 0.45,
        CELLAR + 2.5,
        -30.85,
        0.05,
        0.05,
      );
    b.plate(
      "art",
      0,
      CELLAR + 2.05,
      -30.88,
      0,
      1,
      0.8,
      0.26,
      K.signCell("vv_hatch", "STAGE ↑", 256, 80, {
        bg: "#2a2a1a",
        fg: "#e0d8a0",
      }),
    );

    // ---------------- backstage (x −2.5..2.5, z −32..−28) ----------------
    const BB = [-2.6, FY - 0.2, -32.1, 2.6, FY + 3.2, -27.9];
    K.gap(ctx, 1.8, -28, 0.9, STAGE_Y, 2.1);
    K.room(b, ctx, {
      x0: -2.5,
      z0: -32,
      x1: 2.5,
      z1: -28,
      y: STAGE_Y,
      h: 2.6,
      floor: "wood",
      fc: [0.45, 0.32, 0.24],
      wall: "brick_red",
      wc: [0.5, 0.36, 0.3],
      ceil: "plaster",
      cc: [0.35, 0.3, 0.28],
      surface: "wood",
    });
    b.col(-2.5, FY, -32, 2.5, STAGE_Y, -28, { tag: "floor", surface: "wood" });
    b.boxMM("metal", -2.3, STAGE_Y, -31.9, -0.9, STAGE_Y + 1.8, -31.3, {
      tint: [0.45, 0.5, 0.45],
    }); // robot charging dock
    b.glow(-1.6, STAGE_Y + 1.5, -31.25, [0.3, 1, 0.4], 0.4);
    b.col(-2.3, STAGE_Y, -31.9, -0.9, STAGE_Y + 1.8, -31.3, {});
    b.hplate("metal_dark", 0.8, STAGE_Y + 0.012, -30.8, 1.0, 1.0, 0, null, {
      tint: [0.4, 0.4, 0.4],
    }); // trapdoor
    for (let k = 0; k < 3; k++)
      b.box("leather", 2.0, STAGE_Y + k * 0.32, -31.2, 0.9, 0.3, 0.6, {
        tint: [0.3, 0.2, 0.14],
      });
    K.lamp(b, 0, STAGE_Y + 2.3, -30, "bulb", [1, 0.75, 0.5], 0.6, 4, {
      ceil: STAGE_Y + 2.6,
      lightOpts: { box: BB },
    });

    // ---------------- doors ----------------
    const OX = O.x,
      OY = O.y,
      OZ = O.z;
    K.door(ctx, {
      id: "pv_vanguard_in",
      pos: new THREE.Vector3(A[0] + 0.3, 1.3, DOOR_Z),
      label: "Village Vanguard",
      verb: "Enter",
      target: { x: OX - 6.9, y: OY, z: OZ - 1.0, yaw: 0 },
      onEnter: () => K.safe("disc", () => G.discover("village_vanguard")),
    });
    K.door(ctx, {
      id: "pv_vanguard_out",
      pos: new THREE.Vector3(OX - 6.9, OY + 1.3, OZ - 0.3),
      label: "Seventh Avenue South",
      verb: "Leave",
      target: { x: A[0] + 1.8, y: 0, z: DOOR_Z, yaw: -HP },
    });
    K.door(ctx, {
      id: "pv_vanguard_hatch_up",
      pos: new THREE.Vector3(OX, OY + CELLAR + 1.3, OZ - 30.6),
      label: "Ladder — Backstage",
      verb: "Climb",
      sound: "footstep_metal",
      target: { x: OX + 1.2, y: OY + STAGE_Y, z: OZ - 29.5, yaw: -2.8 },
    }); // up through the trapdoor, facing the curtain gap to the stage
    K.door(ctx, {
      id: "pv_vanguard_hatch_down",
      pos: new THREE.Vector3(OX + 0.8, OY + STAGE_Y + 0.3, OZ - 30.8),
      label: "Trapdoor — Service Tunnel",
      verb: "Climb down",
      sound: "footstep_metal",
      target: { x: OX, y: OY + CELLAR, z: OZ - 29.8, yaw: PI },
    }); // foot of the ladder, facing down the tunnel

    // ---------------- anchors ----------------
    K.anchor(ctx, "entrance", -6.9, 0, -1.0);
    K.anchor(ctx, "drums", -1.9, STAGE_Y, -25.6);
    K.anchor(ctx, "piano_bot", 2.4, STAGE_Y, -25.3);
    K.anchor(ctx, "bass_bot", 0.4, STAGE_Y, -26.3);
    K.anchor(ctx, "stage", 0, STAGE_Y, -26);
    K.anchor(ctx, "npc1", -5.2, FY, -14.5);
    K.anchor(ctx, "npc2", 3.6, FY, -16.5);
    K.anchor(ctx, "npc3", 4.6, FY, -12.6);
    K.anchor(ctx, "merchant", 4.2, FY, -10.6);
    K.anchor(ctx, "roach1", 0, CELLAR, -18);
    K.anchor(ctx, "roach2", 0.3, CELLAR, -24);
    K.anchor(ctx, "roach3", -0.3, CELLAR, -27.5);
    const sp = [
      [-5, FY, -13],
      [5, FY, -15],
      [0, FY, -20],
      [0, CELLAR, -20],
      [2, CELLAR, -7],
      [-2, FY, -7],
    ];
    sp.forEach((p, i) => K.anchor(ctx, "spawn" + (i + 1), p[0], p[1], p[2]));
    K.anchor(ctx, "loot1", 8.8, FY, -3.4);
    K.anchor(ctx, "loot2", -5.2, CELLAR, -6.2);
    ctx.intRoot = b.finish(null);
    ctx.intRoot.name = "poi_vanguard_int";
  }

  function drumKit(b, x, y, z) {
    b.cyl("paint_white", x, y + 0.36, z - 0.25, 0.36, 0.36, 0.34, 14, {
      tint: [0.8, 0.15, 0.12],
      bottom: true,
    }); // (bass drum as a vertical short drum, reads fine)
    b.cyl("chrome", x + 0.45, y + 0.55, z + 0.1, 0.2, 0.2, 0.15, 12, {
      bottom: true,
    }); // snare
    b.cyl("chrome", x + 0.45, y, z + 0.1, 0.02, 0.02, 0.55, 5);
    b.cyl("paint_white", x - 0.1, y + 0.78, z - 0.1, 0.16, 0.16, 0.18, 12, {
      tint: [0.8, 0.15, 0.12],
      bottom: true,
    }); // rack tom
    b.cyl("paint_white", x - 0.55, y, z + 0.1, 0.22, 0.22, 0.45, 12, {
      tint: [0.8, 0.15, 0.12],
    }); // floor tom
    for (const [cx, cz, h] of [
      [x + 0.7, z - 0.35, 1.25],
      [x - 0.6, z - 0.45, 1.35],
      [x + 0.75, z + 0.35, 0.95],
    ]) {
      b.cyl("chrome", cx, y, cz, 0.018, 0.018, h, 5);
      b.cyl("brass", cx, y + h, cz, 0.28, 0.02, 0.03, 14, {
        bottom: true,
        tint: [0.9, 0.7, 0.3],
      });
    }
    b.col(x - 0.8, y, z - 0.6, x + 0.9, y + 0.9, z + 0.4, {
      tag: "instrument",
      walkable: false,
    });
  }
  function piano(b, x, y, z) {
    b.boxMM("paint_black", x - 0.75, y, z - 0.35, x + 0.75, y + 1.3, z + 0.1, {
      tint: [0.14, 0.1, 0.08],
    });
    b.boxMM(
      "paint_black",
      x - 0.75,
      y + 0.68,
      z + 0.1,
      x + 0.75,
      y + 0.74,
      z + 0.4,
      { tint: [0.14, 0.1, 0.08] },
    );
    b.boxMM(
      "ceramic",
      x - 0.7,
      y + 0.74,
      z + 0.12,
      x + 0.7,
      y + 0.77,
      z + 0.34,
      { tint: [0.92, 0.9, 0.84] },
    );
    for (let k = 0; k < 20; k++)
      b.boxMM(
        "paint_black",
        x - 0.68 + k * 0.07,
        y + 0.77,
        z + 0.12,
        x - 0.64 + k * 0.07,
        y + 0.8,
        z + 0.25,
        {},
      );
    b.box("wood_dark", x, y, z + 0.8, 0.6, 0.48, 0.35, {}); // bench
    b.col(x - 0.75, y, z - 0.35, x + 0.75, y + 1.3, z + 0.4, {
      tag: "instrument",
      walkable: false,
    });
  }
  function bass(b, x, y, z) {
    b.geo("wood", K.sphereGeo(), {
      x,
      y: y + 0.55,
      z,
      sx: 0.32,
      sy: 0.5,
      sz: 0.14,
      tint: [0.6, 0.32, 0.16],
    });
    b.geo("wood", K.sphereGeo(), {
      x,
      y: y + 0.95,
      z,
      sx: 0.24,
      sy: 0.3,
      sz: 0.13,
      tint: [0.6, 0.32, 0.16],
    });
    b.beam(
      "paint_black",
      x,
      y + 1.0,
      z + 0.1,
      x,
      y + 1.85,
      z + 0.05,
      0.05,
      0.04,
    );
    b.cyl("paint_black", x, y + 1.85, z + 0.05, 0.03, 0.02, 0.15, 5);
    b.cyl("chrome", x, y, z, 0.01, 0.01, 0.1, 4);
  }

  function termOffice() {
    return {
      title: "VILLAGE VANGUARD — MANAGEMENT",
      header:
        "KESTREL TELETYPE CORP. — MODEL 40 LINE TERMINAL\n-Booking & Payroll-",
      entries: [
        {
          title: "Booking Calendar — Mar. 1967",
          text: 'Mon — Trio (house)\nTue — Trio (house)\nFri — "LAST SET BEFORE THE END OF THE WORLD" (promoter\'s title, not mine. Sells tickets though.)\nSat — Big band night. 16 players, 1 stage. Pray.\nSun — ',
        },
        {
          title: "Memo: The Robots",
          text: 'Bought three used Ardent Robotics Valet units from a bankrupt hotel. Programmed them to TIDY UP between sets.\n\nThey have learned to play. I did not teach them. Nobody taught them. The drummer one keeps time better than any human I have ever paid.\n\nI am not paying the robots. Legal says I "should probably start."',
        },
        {
          title: "1989 — Mags's Notes",
          learn: LK.reserve.id,
          text: () => {
            K.learn(LK.reserve.id);
            return "Takings this week: 311 scrip, 2 bottles of Fizzo Blue, a working toaster.\nThe Trio has played every night for twenty-two years. Sir Hi-Hat says they will stop \"when the audience stops.\" The audience has never stopped.\nKitchen: still no meat worth serving. Katz's had a family brine ledger — the real pastrami recipe. Basement office. Roaches. Big ones.\nReserve chest in the cellar: 0-5-2-9. Mama's birthday. If a bottle's missing I WILL know.";
          },
        },
        {
          title: "Club Safe — Combination",
          learn: LK.safe.id,
          text: () => {
            K.learn(LK.safe.id);
            return "Office safe: 1-9-3-5, the year Max opened the room. Payroll Fridays only.";
          },
        },
        {
          title: "Open Club Safe",
          text: "The safe clicks open.",
          action: () => {
            PV.unlockTagged("vanguard", "safe");
            K.notify("The club safe is unlocked.");
          },
        },
      ],
    };
  }

  // ==================================================================
  // DATA
  // ==================================================================
  function data() {
    K.defineItem({
      id: "pv_pastrami_sandwich",
      type: "aid",
      name: "Pastrami on Rye",
      weight: 0.5,
      value: 30,
      tags: ["food"],
      mesh: "meat_stick",
      sound: "eat",
      effects: { hpOverTime: [60, 10], attrs: { brawn: 1 }, duration: 300 },
      desc: "Hand-cut, brined for eleven days, smoked, steamed, stacked so high the bread gives up. Old-world recipe, roach-free (mostly). +1 Brawn while it lasts.",
    });
    K.defineItem({
      id: "pv_egg_cream",
      type: "aid",
      name: "Egg Cream",
      weight: 0.5,
      value: 12,
      tags: ["drink"],
      mesh: "bottle_milk",
      sound: "drink",
      effects: { hpOverTime: [15, 6] },
      desc: "Contains neither egg nor cream. Contains chocolate syrup, seltzer and something from a pack ox. A New York miracle.",
    });
    if (!G.isStub("quests") && G.quests.define) {
      G.quests.define({
        id: "pv_what_shes_having",
        name: "Send a Salami",
        giver: "Mags Kowalczyk",
        location: "Village Vanguard",
        desc: "Mags, who runs the bar at the Village Vanguard, wants to put real food back on the menu. Katz's Delicatessen on Houston Street kept a family brine ledger — the pastrami recipe — in the basement office. The basement is now a giant roach kingdom.",
        stages: [
          {
            id: "ledger",
            text: "Recover the brine ledger from the basement office of Katz's Delicatessen.",
            markers: [
              () => {
                const a = PV.anchor("katz", "ledger");
                return a
                  ? { x: a.x, z: a.z, y: a.y, label: "Brine Ledger" }
                  : null;
              },
            ],
          },
          {
            id: "wh_queen",
            text: "(Optional) Kill the Roach Queen nesting in Katz's basement.",
            sideObjective: true,
            optional: true,
            showIf: () => K.q.active("pv_what_shes_having"),
            doneIf: () => !!PV.flag("queen_dead"),
          },
          {
            id: "wh_cellar",
            text: "(Optional) Clear the giant roaches out of the Vanguard's service tunnel.",
            sideObjective: true,
            optional: true,
            showIf: () => !!PV.flag("vv_roach_asked"),
            doneIf: () => !!PV.flag("vv_roaches_clear"),
          },
          {
            id: "return",
            text: "Bring the brine ledger to Mags at the Village Vanguard.",
            markers: [{ npc: "pv_dot", label: "Mags" }],
          },
        ],
        rewards: { xp: 250 },
      });
    }
    if (G.isStub("dialogue") || !G.dialogue.register) return;
    G.dialogue.register("pv_dlg_dot", {
      start: () =>
        K.has("pv_q_brine_ledger") && K.q.active("pv_what_shes_having")
          ? "ledger"
          : K.q.done("pv_what_shes_having")
            ? "after"
            : PV.flag("met_dot")
              ? "again"
              : "hello",
      nodes: {
        hello: {
          speaker: "Mags Kowalczyk",
          onEnter: () => PV.setFlag("met_dot", true),
          text: "Welcome to the Vanguard, hon. Two-drink minimum, no guns on the bandstand, and if you talk during the piano solo the robots take it personal. What'll it be?",
          responses: [
            { text: "Show me what you're pouring.", barter: true, end: true },
            { text: "Robots? Playing jazz?", next: "robots" },
            { text: "Any work going?", next: "work" },
            {
              text: "Something wrong in the cellar?",
              next: "cellar",
              cond: () => !PV.flag("vv_roaches_clear"),
            },
            {
              text: "Carmen Medina says the drinks are on you now.",
              next: "rosa",
              cond: () =>
                PV.flag("tombs_prisoners") === "freed" &&
                !PV.flag("rosa_drinks"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Mags Kowalczyk",
          text: "Back again. Sit anywhere, they're all bad seats in a triangle.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "About that recipe...",
              next: "work",
              cond: () => !K.q.started("pv_what_shes_having"),
            },
            {
              text: "Something wrong in the cellar?",
              next: "cellar",
              cond: () =>
                !PV.flag("vv_roaches_clear") && !PV.flag("vv_roach_asked"),
            },
            {
              text: "The tunnel's clear. No more roaches.",
              next: "cellar_done",
              cond: () =>
                !!PV.flag("vv_roaches_clear") && !PV.flag("vv_roach_paid"),
            },
            {
              text: "Carmen Medina says the drinks are on you now.",
              next: "rosa",
              cond: () =>
                PV.flag("tombs_prisoners") === "freed" &&
                !PV.flag("rosa_drinks"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        robots: {
          speaker: "Mags Kowalczyk",
          text: "The Tin Man Trio. Sir Hi-Hat on drums, Ivory on the keys, Low Tide on bass. Old Max bought 'em to sweep up; they taught themselves the book. They've played every night since the bombs. Nobody's had the heart to tell 'em the audience changed.",
          responses: [
            { text: "Any work going?", next: "work" },
            { text: "Goodbye.", end: true },
          ],
        },
        work: {
          speaker: "Mags Kowalczyk",
          text: "You know what this city's missing? Pastrami. Real pastrami, like Katz's on Houston. Old Katz family kept a brine ledger — the recipe, eleven days of it — in the basement office. Bring it here and I'll open a kitchen people cross the river for. Fair warning: the roaches in that basement have a queen. A big one.",
          responses: [
            {
              text: "I'll get your recipe.",
              next: "accept",
              action: () => K.q.start("pv_what_shes_having"),
            },
            {
              text: "[Presence 6] What's in it for me?",
              check: { attr: "presence", value: 6 },
              next: "pay",
              failNext: "pay_fail",
            },
            { text: "Not my kind of job.", end: true },
          ],
        },
        pay: {
          speaker: "Mags Kowalczyk",
          text: "Two hundred scrip, a sandwich with your name on it — the first three, actually — and free drinks till the robots quit. Which is never.",
          onEnter: () => PV.setFlag("dot_bonus", 50),
          responses: [
            {
              text: "Deal.",
              next: "accept",
              action: () => K.q.start("pv_what_shes_having"),
            },
          ],
        },
        pay_fail: {
          speaker: "Mags Kowalczyk",
          text: "Sandwiches, hon. That's what's in it for you. You look like you could use one.",
          responses: [
            {
              text: "Fine. I'll do it.",
              next: "accept",
              action: () => K.q.start("pv_what_shes_having"),
            },
            { text: "Maybe later.", end: true },
          ],
        },
        accept: {
          speaker: "Mags Kowalczyk",
          text: "Katz's is on Houston, east side, the corner with the big sign. The office is in the basement past the freezer. And whatever you do, don't order the roach.",
          responses: [{ text: "I'll be back.", end: true }],
        },
        cellar: {
          speaker: "Mags Kowalczyk",
          text: "Something's chewing the wires in the service tunnel under the club. Every time the lights flicker, Ivory drops a chord. Clear it out and I'll owe you fifty scrip. Tunnel's through the staff door, down the stairs.",
          onEnter: () => PV.setFlag("vv_roach_asked", true),
          responses: [{ text: "I'll take a look.", end: true }],
        },
        cellar_done: {
          speaker: "Mags Kowalczyk",
          text: "I heard. Well — Ivory hasn't missed a chord all night. Here. Fifty scrip and a drink on the house.",
          onEnter: () => {
            PV.setFlag("vv_roach_paid", true);
            K.scrip(50);
            K.give("pv_egg_cream", 1);
            K.xp(60, "Pest control");
          },
          responses: [{ text: "Thanks, Mags.", end: true }],
        },
        ledger: {
          speaker: "Mags Kowalczyk",
          text: "Is that — oh, look at that handwriting. \"Eleven days. Don't rush the brisket, don't rush the customer.\" Hon, you just saved New York's lunch.",
          responses: [
            {
              text: "Enjoy it, Mags.",
              next: "after",
              action: () => finishLedger(),
            },
          ],
        },
        after: {
          speaker: "Mags Kowalczyk",
          text: "Kitchen's open! Well — it will be, in eleven days. Take these. And come back hungry: first sandwich is always on the house for you.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "Carmen Medina says the drinks are on you now.",
              next: "rosa",
              cond: () =>
                PV.flag("tombs_prisoners") === "freed" &&
                !PV.flag("rosa_drinks"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        // round 2: the Jailbreak pay-off — Carmen sings here again (the freed prisoners settle in the Vanguard yard)
        rosa: {
          speaker: "Mags Kowalczyk",
          text: "You're the one who walked Carmen out of the Tombs? Hon, she's been back on that bandstand every night since, and the robots finally have somebody to follow. Drinks are on the house. Forever. That's not a figure of speech.",
          onEnter: () => {
            PV.setFlag("rosa_drinks", true);
            if (K.itemExists("whiskey")) K.give("whiskey", 2);
            K.give("pv_egg_cream", 2);
            K.scrip(75);
            K.xp(50, "A song for the Tombs");
            K.standing(10, "Carmen is singing again");
          },
          responses: [{ text: "Tell her to sing the happy one.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_hattie", {
      start: () => (PV.flag("met_hattie") ? "again" : "hello"),
      nodes: {
        hello: {
          speaker: "Midge Sparks",
          onEnter: () => PV.setFlag("met_hattie", true),
          text: "Midge Sparks, scrap and sundries. If it's got a screw in it, I'll buy it. If it's got a screw loose, Mags'll hire it. What do you need?",
          responses: [
            { text: "Let's see what you've got.", barter: true, end: true },
            {
              text: "How did the Vanguard end up a settlement?",
              next: "history",
            },
            {
              text: "[Mechanics 40] Your fuse box is sparking. Want me to look?",
              check: { skill: "mechanics", value: 40 },
              next: "fix",
              failNext: "fix_fail",
              cond: () => !PV.flag("hattie_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        again: {
          speaker: "Midge Sparks",
          text: "Back for more junk? Good. Junk's the only thing this city makes any more.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            {
              text: "[Mechanics 40] That fuse box still sparking?",
              check: { skill: "mechanics", value: 40 },
              next: "fix",
              failNext: "fix_fail",
              cond: () => !PV.flag("hattie_fixed"),
            },
            { text: "Goodbye.", end: true },
          ],
        },
        history: {
          speaker: "Midge Sparks",
          text: "Music. Folks followed the sound down Seventh Avenue — three robots playing to nobody. Mags put up a fence to keep the Maniacs from following it too. Then somebody sold water, somebody sold smokes, and now we're a town. Don't tell the raiders.",
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        fix: {
          speaker: "Midge Sparks",
          text: "Huh. You rewired it with a paper clip and a bad attitude. That's my kind of engineering. Here — on the house, and I'll knock a little off your next haul.",
          onEnter: () => {
            PV.setFlag("hattie_fixed", true);
            if (K.itemExists("scrap_electronics"))
              K.give("scrap_electronics", 2);
            K.scrip(40);
            K.xp(40, "Fixed Midge's fuse box");
          },
          responses: [
            { text: "Let's trade.", barter: true, end: true },
            { text: "Goodbye.", end: true },
          ],
        },
        fix_fail: {
          speaker: "Midge Sparks",
          text: "Whoa, whoa — hands OFF. That one bites. Come back when you know which wire's the angry one.",
          responses: [{ text: "Fair enough.", end: true }],
        },
      },
    });
    G.dialogue.register("pv_dlg_hihat", {
      start: "hello",
      nodes: {
        hello: {
          speaker: "Sir Hi-Hat",
          text: "Good evening, sir! The Tin Man Trio thanks you for your patronage. We are currently in our forty-nine-thousandth consecutive set. Requests are welcome. Requests are ignored, but welcome.",
          responses: [
            { text: "How long have you been playing?", next: "long" },
            { text: "Play something happy.", next: "happy" },
            { text: "Goodbye.", end: true },
          ],
        },
        long: {
          speaker: "Sir Hi-Hat",
          text: 'Since a Friday night in March 1967, at 9:04 PM. Management said "one more set." Management has not yet said "that\'s enough." I am a patient machine, but I confess the cymbals are getting thin.',
          responses: [{ text: "Keep swinging.", end: true }],
        },
        happy: {
          speaker: "Sir Hi-Hat",
          text: "Sir, this IS the happy one. You should hear the sad one. Actually, you should not. Ivory cried oil for a week.",
          responses: [{ text: "Goodbye.", end: true }],
        },
      },
    });
  }
  function finishLedger() {
    if (!K.has("pv_q_brine_ledger")) return;
    K.take("pv_q_brine_ledger", 1);
    K.scrip(200 + (PV.flag("dot_bonus") || 0));
    K.give("pv_pastrami_sandwich", 3);
    PV.setFlag("ledger_done", true);
    K.q.complete("pv_what_shes_having");
  }

  // ==================================================================
  // SPAWN
  // ==================================================================
  function spawn(ctx) {
    const A2 = ctx.anchors;
    const stock = K.stock(
      [
        ["beer", 6],
        ["whiskey", 4],
        ["scotch", 2],
        ["vodka", 3],
        ["wine", 2],
        ["fizzo_cola", 5],
        ["purified_water", 4],
        ["pv_egg_cream", 4],
      ].concat(PV.flag("ledger_done") ? [["pv_pastrami_sandwich", 4]] : []),
      "merchant_food",
      4,
    );
    PV.spawnActor(ctx, {
      id: "pv_dot",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Mags Kowalczyk",
      faction: "settlers",
      level: 7,
      essential: true,
      pos: v(A2.bartender),
      yaw: PI,
      ai: "merchant",
      home: "here",
      homeR: 1.8,
      dialogue: "pv_dlg_dot",
      merchant: { scrip: 380, stock, restock: 2 },
      barks: [
        "What'll it be, hon?",
        "Shh — piano solo.",
        "Tip the robots. They don't need it. Tip 'em anyway.",
      ],
    });
    const bots = [
      ["pv_hihat", "Sir Hi-Hat", A2.drums, "pv_dlg_hihat"],
      ["pv_ivory", "Ivory", A2.piano_bot, null],
      ["pv_lowtide", "Low Tide", A2.bass_bot, null],
    ];
    for (const [id, name, p, dlg] of bots) {
      PV.spawnActor(ctx, {
        id,
        type: "valet",
        name,
        faction: "settlers",
        level: 8,
        essential: true,
        hostile: false,
        pos: v(p),
        yaw: 0,
        ai: "static",
        home: "here",
        homeR: 0.2,
        dialogue: dlg || undefined,
        voice: "robot",
        barks: [
          "One, two, one two three four!",
          "Thank you, you've been a lovely audience for twenty-two years.",
          "Bum-ba-dum, tsss.",
        ],
      });
    }
    PV.spawnActor(ctx, {
      id: "pv_vv_patron1",
      type: "human",
      gender: "m",
      outfit: "survivor",
      name: "Regular",
      faction: "settlers",
      level: 3,
      pos: v(A2.npc1),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: [
        "Shh.",
        "Best seat in the house. Every seat is the best seat. Triangle.",
      ],
    });
    PV.spawnActor(ctx, {
      id: "pv_vv_patron2",
      type: "human",
      gender: "f",
      outfit: "settler",
      name: "Jazz Fan",
      faction: "settlers",
      level: 3,
      pos: v(A2.npc2),
      ai: "sit",
      home: "here",
      homeR: 0.5,
      barks: ["That drummer is a genius. A genius with a vacuum attachment."],
    });
    PV.spawnActor(ctx, {
      id: "pv_vv_bouncer",
      type: "human",
      gender: "m",
      outfit: "leather_armor",
      name: "Vanguard Bouncer",
      faction: "settlers",
      level: 7,
      pos: v(A2.npc3),
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("lead_pipe") ? "lead_pipe" : undefined,
      barks: ["No guns on the bandstand.", "Keep it down during the solos."],
    });
    const door = A2.door;
    PV.spawnActor(ctx, {
      id: "pv_vv_doorman",
      type: "human",
      gender: "f",
      outfit: "combat_armor",
      name: "Vanguard Guard",
      faction: "settlers",
      level: 8,
      pos: { x: door.x + 1.5, y: 0, z: door.z + 3.2 },
      yaw: -HP,
      ai: "guard",
      home: "here",
      homeR: 1.5,
      weapon: K.itemExists("hunting_rifle") ? "hunting_rifle" : undefined,
      barks: [
        "Band's on. Go on down.",
        "Watch the stairs. Steepest in the Village.",
      ],
    });
    // Midge keeps the scrap stall in the yard market (round 2)
    const hs = VANGUARD_STALLS[1];
    if (hs) {
      const hstock = K.stock(
        [
          ["scrap_metal", 6],
          ["duct_tape", 2],
          ["tuff_bond", 1],
          ["rally_tonic", 2],
          ["ammo_10mm", 40],
          ["ammo_556", 20],
          ["purified_water", 3],
        ],
        "merchant_general",
        4,
      );
      PV.spawnActor(ctx, {
        id: "pv_vv_hattie",
        type: "human",
        gender: "f",
        outfit: "survivor",
        name: "Midge Sparks",
        faction: "settlers",
        level: 6,
        essential: true,
        pos: { x: hs.keeper[0], y: 0, z: hs.keeper[2] },
        lookYaw: Math.atan2(
          hs.front[0] - hs.keeper[0],
          hs.front[2] - hs.keeper[2],
        ),
        ai: "merchant",
        home: "here",
        homeR: 0.8,
        dialogue: "pv_dlg_hattie",
        merchant: { scrip: 260, stock: hstock, restock: 3 },
        barks: [
          "Scrap in, scrip out. Simple.",
          "Don't touch the fuses unless you're buying the fuses.",
          "Mags's robots? I built Low Tide's new elbow. Ask him.",
        ],
      });
    }
    const yard = A2.yard;
    PV.spawnActor(ctx, {
      id: "pv_vv_settler",
      type: "human",
      gender: "m",
      outfit: "settler",
      name: "Vanguard Settler",
      faction: "settlers",
      level: 3,
      pos: v(yard),
      ai: "wander",
      home: "here",
      homeR: 6,
    });
    // cellar tunnel roaches (until cleared)
    if (!PV.flag("vv_roaches_clear")) {
      ["roach1", "roach2", "roach3"].forEach((n, i) => {
        PV.spawnActor(ctx, {
          id: "pv_vv_" + n,
          type: "giant_roach",
          name: "Giant Roach",
          faction: "creatures",
          level: 2,
          hostile: true,
          pos: v(A2[n]),
          ai: "wander",
          home: "here",
          homeR: 3,
          noRespawn: true,
          onDeath: () => {
            const alive = ["roach1", "roach2", "roach3"].some((m) => {
              const a = G.actors.get && G.actors.get("pv_vv_" + m);
              return a && !a.dead;
            });
            if (!alive) {
              PV.setFlag("vv_roaches_clear", true);
              if (PV.flag("vv_roach_asked"))
                K.notify("The Vanguard's service tunnel is clear.");
            }
          },
        });
      });
    }
  }
  function v(a) {
    return { x: a.x, y: a.y, z: a.z };
  }

  // ==================================================================
  // LIVE MUSIC — a small procedural jazz combo (WebAudio)
  // ==================================================================
  const M = {
    on: false,
    t: 0,
    beat: 0,
    next: 0,
    gain: null,
    ctx: null,
    chord: 0,
  };
  const PROG = [
    [53, 57, 60, 64],
    [48, 52, 55, 58],
    [53, 57, 60, 64],
    [53, 57, 60, 64],
    [57, 60, 64, 67],
    [50, 54, 57, 60],
    [55, 58, 62, 65],
    [48, 52, 55, 58],
  ]; // F: Fmaj7 C7 F F Am7 D7 Gm7 C7
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  function audio() {
    const S = G._snd;
    const ac = S && S.ctx;
    if (!ac || ac.state !== "running") return null;
    if (M.ctx !== ac) {
      M.ctx = ac;
      M.gain = ac.createGain();
      M.gain.gain.value = 0;
      const dest =
        (S.bus && (S.bus.world || S.bus.sfx || S.bus.master)) || ac.destination;
      M.lp = ac.createBiquadFilter();
      M.lp.type = "lowpass";
      M.lp.frequency.value = 5000;
      M.gain.connect(M.lp);
      M.lp.connect(dest);
      M.noise = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate);
      const d = M.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      M.next = ac.currentTime + 0.1;
    }
    return ac;
  }
  function note(ac, t, f, dur, type, vol, attack) {
    const o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(M.gain);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function hit(ac, t, dur, vol, freq, type) {
    const s = ac.createBufferSource();
    s.buffer = M.noise;
    const f = ac.createBiquadFilter();
    f.type = type || "highpass";
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(M.gain);
    s.start(t);
    s.stop(t + dur + 0.02);
  }
  function schedule(ac) {
    const spb = 60 / 128; // 128 bpm swing
    while (M.next < ac.currentTime + 0.25) {
      const t = M.next,
        beat = M.beat,
        bar = Math.floor(beat / 4) % PROG.length,
        bb = beat % 4;
      const ch = PROG[bar];
      // walking bass (quarter notes)
      const bn =
        bb === 0
          ? ch[0]
          : bb === 2
            ? ch[2] - 12 + 12 * (Math.random() < 0.3 ? 1 : 0)
            : ch[(bb * 3 + ((Math.random() * 3) | 0)) % 4] - 12;
      note(ac, t, mtof(bn - 12), spb * 0.9, "triangle", 0.22, 0.01);
      // ride: ding ding-a ding
      hit(ac, t, 0.25, 0.05, 7000);
      if (bb % 2 === 1) hit(ac, t + spb * 0.66, 0.15, 0.035, 7500);
      // hi-hat foot on 2 & 4, brushes
      if (bb % 2 === 1) hit(ac, t, 0.06, 0.05, 4000);
      hit(ac, t, spb * 0.8, 0.012, 2500, "bandpass");
      // piano comping (Charleston-ish)
      if (
        bb === 0 ||
        (bb === 1 && Math.random() < 0.6) ||
        (bb === 2 && Math.random() < 0.3)
      ) {
        const off = bb === 1 ? spb * 0.66 : 0;
        for (const n of ch)
          note(ac, t + off, mtof(n + 12), 0.5, "triangle", 0.045, 0.005);
      }
      // piano right hand melody fragments
      if (Math.random() < 0.45) {
        const n =
          ch[(Math.random() * 4) | 0] + 24 + (Math.random() < 0.3 ? 2 : 0);
        note(
          ac,
          t + (Math.random() < 0.5 ? spb * 0.66 : 0),
          mtof(n),
          0.35,
          "sine",
          0.05,
          0.005,
        );
      }
      M.next += spb;
      M.beat++;
    }
  }
  // round 1b: the Tin Man Trio plays — sway & bob on the 128 bpm swing, the drummer strikes on 2 and 4,
  // Ivory 'comps' every other bar, Low Tide leans into the walking bass (arm one-shots + body motion).
  const BAND = { t: 0, last: -1 };
  function band(dt, ctx) {
    if (!dt || G.isStub("actors") || !G.actors.get) return;
    BAND.t += dt;
    const beatF = (BAND.t * 128) / 60,
      beat = Math.floor(beatF),
      ph = beatF - beat;
    const bots = [
      ["pv_hihat", 0.07, 0],
      ["pv_ivory", 0.04, 0.5],
      ["pv_lowtide", 0.06, 0.25],
    ];
    for (let i = 0; i < bots.length; i++) {
      const a = G.actors.get(bots[i][0]);
      if (!a || a.dead || !a.char || !a.char.root) continue;
      if (a.inCombat || (a.hostile && a.hostile())) {
        a.char.root.rotation.x = 0;
        a.char.root.rotation.z = 0;
        continue;
      }
      const sw = Math.sin((beatF / 2 + bots[i][2]) * Math.PI);
      a.char.root.rotation.z = sw * bots[i][1];
      a.char.root.rotation.x =
        Math.max(0, Math.sin(ph * Math.PI)) * bots[i][1] * 0.6;
      if (beat !== BAND.last) {
        const hit =
          (i === 0 && beat % 2 === 1) ||
          (i === 1 && beat % 8 === 2) ||
          (i === 2 && beat % 4 === 0);
        if (hit && Math.random() < 0.85) {
          try {
            a.oneShot("attack_melee");
          } catch (e) {
            /* */
          }
        }
      }
    }
    BAND.last = beat;
  }
  function update(dt, realDt, ctx) {
    const p = G.player && G.player.pos;
    if (!p) return;
    const inside = ctx.inside && G.state !== "title";
    if (inside) band(dt, ctx);
    const ac = inside ? audio() : M.ctx || null;
    if (!ac) return;
    const st = ctx.anchors.stage;
    const d = st ? Math.hypot(p.x - st.x, (p.y - st.y) * 1.5, p.z - st.z) : 99;
    // loud in the club, muffled up the stairs / in the back rooms, silent outside
    let vol = inside ? K.clamp(1.2 - d / 26, 0, 1) * 0.55 : 0;
    const inClub = inside && p.y < ctx.O.y - 3.5 && p.z - ctx.O.z < -10;
    try {
      M.lp.frequency.setTargetAtTime(inClub ? 6000 : 900, ac.currentTime, 0.2);
      M.gain.gain.setTargetAtTime(
        G.worldRunning && !G.worldRunning() ? vol * 0.3 : vol,
        ac.currentTime,
        0.3,
      );
    } catch (e) {
      /* */
    }
    if (vol > 0.01) schedule(ac);
    else M.next = ac.currentTime + 0.1;
  }

  PV.define({
    id: "vanguard",
    name: "Village Vanguard",
    interior: "village_vanguard",
    order: 20,
    build(ctx) {
      exterior(ctx);
      interior(ctx);
    },
    data,
    spawn,
    update,
  });
})();
