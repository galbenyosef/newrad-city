// play-inline-192 04 — tint
// Lines 514-1014 of readable/play-inline-192.pretty.js (statement-aligned).
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
