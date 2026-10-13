// play-inline-242 05 — deck_y
// Lines 924-1164 of readable/play-inline-242.pretty.js (statement-aligned).
  function buildStairTower(b, anchors) {
    const T = TOWER;
    const RISE = DECK_Y / 8; // 8 flights
    const lanes = [T.x0 + 0.4, T.x0 + 3.6]; // west lane x0+0.4..+2.4, east lane x0+3.6..+5.6
    const LW = 2.0;
    const zN = T.z0 + 1.6,
      zS = T.z1 - 1.6; // flight ends (landings beyond)
    const run = zS - zN;
    // steel frame: 4 corner columns + girts + X bracing
    for (const x of [T.x0, T.x1])
      for (const z of [T.z0, T.z1]) {
        b.box("rust", x, 0, z, 0.3, DECK_Y + 1.4, 0.3, {
          seg: false,
          grime: 0.6,
          segLen: 6,
        });
        b.box("concrete", x, 0, z, 0.8, 0.5, 0.8, { seg: false });
      }
    for (let k = 1; k <= 8; k++) {
      const y = k * RISE;
      for (const [a, c] of [
        [
          [T.x0, T.z0],
          [T.x1, T.z0],
        ],
        [
          [T.x0, T.z1],
          [T.x1, T.z1],
        ],
        [
          [T.x0, T.z0],
          [T.x0, T.z1],
        ],
        [
          [T.x1, T.z0],
          [T.x1, T.z1],
        ],
      ])
        b.beam("rust", V3(a[0], y, a[1]), V3(c[0], y, c[1]), 0.18, 0.18);
      if (k < 8) {
        // cross bracing on the west, east and south faces (north face stays open at the base for the entrance)
        const y0 = (k - 1) * RISE + 0.2;
        b.beam("rust", V3(T.x0, y0, T.z0), V3(T.x0, y, T.z1), 0.08, 0.08);
        b.beam("rust", V3(T.x0, y0, T.z1), V3(T.x0, y, T.z0), 0.08, 0.08);
        b.beam("rust", V3(T.x1, y0, T.z0), V3(T.x1, y, T.z1), 0.08, 0.08);
        b.beam("rust", V3(T.x1, y0, T.z1), V3(T.x1, y, T.z0), 0.08, 0.08);
        b.beam("rust", V3(T.x0, y0, T.z1), V3(T.x1, y, T.z1), 0.08, 0.08);
        b.beam("rust", V3(T.x1, y0, T.z1), V3(T.x0, y, T.z1), 0.08, 0.08);
      }
    }
    // outer safety colliders (mesh screen) — full height on W/E/S, north face open at ground (entrance) and at the top
    PR.colMM(T.x0 - 0.2, 0, T.z0, T.x0 + 0.05, DECK_Y + 1.2, T.z1, {
      walkable: false,
      surface: "metal",
    });
    PR.colMM(T.x1 - 0.05, 0, T.z0, T.x1 + 0.2, DECK_Y + 1.2, T.z1, {
      walkable: false,
      surface: "metal",
    });
    PR.colMM(T.x0, 0, T.z1 - 0.05, T.x1, DECK_Y + 1.2, T.z1 + 0.2, {
      walkable: false,
      surface: "metal",
    });
    PR.colMM(T.x0, 2.6, T.z0 - 0.2, T.x1, DECK_Y - 0.1, T.z0 + 0.05, {
      walkable: false,
      surface: "metal",
    });
    PR.colMM(T.x0 + 2.4, 0, T.z0 - 0.2, T.x1, 2.6, T.z0 + 0.05, {
      walkable: false,
      surface: "metal",
    });
    const chain = PR.chainKey();
    for (const [x, rot] of [
      [T.x0 - 0.02, HP],
      [T.x1 + 0.02, -HP],
    ])
      for (let y = 0; y < DECK_Y; y += 5.5)
        b.quad(chain, x, y + 2.75 + 0.4, (T.z0 + T.z1) / 2, T.z1 - T.z0, 5.5, {
          ry: rot,
          us: (T.z1 - T.z0) / 1.2,
          vs: 5.5 / 1.2,
        });
    for (let y = 0; y < DECK_Y; y += 5.5)
      b.quad(
        chain,
        (T.x0 + T.x1) / 2,
        y + 2.75 + 0.4,
        T.z1 + 0.02,
        T.x1 - T.x0,
        5.5,
        { us: (T.x1 - T.x0) / 1.2, vs: 5.5 / 1.2 },
      );
    // flights + landings
    for (let k = 1; k <= 8; k++) {
      const y0 = (k - 1) * RISE,
        y1 = k * RISE;
      const odd = k % 2 === 1;
      const lx = odd ? lanes[0] + LW / 2 : lanes[1] + LW / 2;
      if (odd)
        PR.treads(b, "diamond", lx, zN, 0, LW, run, y0, y1, {
          maxRise: 0.24,
          surface: "metal",
        });
      else
        PR.treads(b, "diamond", lx, zS, PI, LW, run, y0, y1, {
          maxRise: 0.24,
          surface: "metal",
        });
      // stringers
      for (const sx of [-LW / 2, LW / 2])
        b.beam(
          "rust",
          V3(lx + sx, y0 - 0.2, odd ? zN : zS),
          V3(lx + sx, y1 - 0.2, odd ? zS : zN),
          0.08,
          0.3,
        );
      // handrail on the well side (visual) + stepped colliders
      const wx = odd ? lanes[0] + LW + 0.05 : lanes[1] - 0.05;
      b.beam(
        "iron",
        V3(wx, y0 + 1.0, odd ? zN : zS),
        V3(wx, y1 + 1.0, odd ? zS : zN),
        0.05,
        0.05,
      );
      for (let s = 0; s < 4; s++) {
        const t = (s + 0.5) / 4,
          zz = odd ? zN + run * t : zS - run * t,
          yy = y0 + (y1 - y0) * t;
        PR.col(wx, zz, 0.12, run / 4, yy - 0.2, yy + 1.0, 0, {
          walkable: false,
          surface: "metal",
        });
        b.box("iron", wx, yy, zz, 0.04, 1.0, 0.04, { seg: false });
      }
      // landing at the arrival end
      const lz0 = odd ? zS : T.z0,
        lz1 = odd ? T.z1 : zN;
      b.boxMM("diamond", T.x0 + 0.2, y1 - 0.18, lz0, T.x1 - 0.2, y1, lz1, {
        seg: false,
        grime: 0.5,
      });
      PR.colMM(T.x0 + 0.2, y1 - 0.25, lz0, T.x1 - 0.2, y1, lz1, {
        surface: "metal",
      });
    }
    // top: catwalk across onto the bridge deck (x0+0.2..x1-0.2)
    const cz0 = T.z0 - 5.5;
    b.boxMM(
      "diamond",
      T.x0 + 0.4,
      DECK_Y - 0.2,
      cz0,
      T.x1 - 0.4,
      DECK_Y,
      T.z0,
      { seg: false },
    );
    PR.colMM(T.x0 + 0.4, DECK_Y - 0.3, cz0, T.x1 - 0.4, DECK_Y, T.z0, {
      surface: "metal",
    });
    PR.railing(
      b,
      [
        [T.x0 + 0.45, T.z0],
        [T.x0 + 0.45, cz0 + 2.5],
      ],
      DECK_Y,
      1.0,
      "iron",
      { collide: true, postStep: 1.5 },
    );
    PR.railing(
      b,
      [
        [T.x1 - 0.45, T.z0],
        [T.x1 - 0.45, cz0 + 2.5],
      ],
      DECK_Y,
      1.0,
      "iron",
      { collide: true, postStep: 1.5 },
    );
    b.beam(
      "rust",
      V3(T.x0 + 0.5, DECK_Y - 0.25, cz0),
      V3(T.x0 + 0.5, DECK_Y - 3.2, T.z0),
      0.12,
      0.12,
    );
    b.beam(
      "rust",
      V3(T.x1 - 0.5, DECK_Y - 0.25, cz0),
      V3(T.x1 - 0.5, DECK_Y - 3.2, T.z0),
      0.12,
      0.12,
    );
    // roof canopy + signage
    b.boxMM(
      "corrugated",
      T.x0 - 0.4,
      DECK_Y + 2.6,
      T.z0 - 0.4,
      T.x1 + 0.4,
      DECK_Y + 2.7,
      T.z1 + 0.4,
      { seg: false, grime: 0.8, rx: 0.02 },
    );
    const signK = PR.texMat(
      "pr_qb_stair",
      PR.signTex(
        "pr_qb_stair",
        ["QUEENSBORO BRIDGE", "PEDESTRIAN STAIR", "WELFARE ISLAND"],
        "enamel",
        512,
        256,
        { bg: "#20402c", fg: "#e8e0c0" },
      ),
    );
    b.quad(signK, (T.x0 + T.x1) / 2, 3.2, T.z0 - 0.12, 3.2, 1.6, { ry: PI });
    b.quad(signK, (T.x0 + T.x1) / 2, DECK_Y + 1.8, cz0 - 0.05, 2.4, 1.2, {
      ry: PI,
    });
    b.box("iron", (T.x0 + T.x1) / 2, DECK_Y + 1.1, cz0 + 0.05, 2.6, 1.5, 0.05, {
      seg: false,
    });
    D.rubble(b, T.x1 + 1.2, 0, T.z0 + 2, 1.2, 5, 77);
    PR.skeleton(b, T.x0 + 1.4, 11.02, T.z0 + 0.8, 1.2);
    anchors.stair_bottom = PR.anchor(T.x0 + 1.4, 0, T.z0 - 1.5, PI);
    anchors.stair_top = PR.anchor((T.x0 + T.x1) / 2, DECK_Y, cz0 + 1, 0);
    PR.plaque(
      V3(T.x0 + 1.4, 1.5, T.z0 - 0.2),
      "Stair Notice",
      "PEDESTRIANS ONLY. NO LOITERING ON LANDINGS. ELEVATOR OUT OF SERVICE — DEPT. OF PLANT & STRUCTURES, 1966.",
    );
  }

  // ===================================================================
  // BLACKWELL HOUSE (1796) + ASYLUM BURIAL GROUND
  // ===================================================================
