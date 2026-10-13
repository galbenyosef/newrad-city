// play-inline-192 03 — the
// Lines 75-513 of readable/play-inline-192.pretty.js (statement-aligned).
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
