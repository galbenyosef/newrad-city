// play-inline-242 04 — mpier
// Lines 652-923 of readable/play-inline-242.pretty.js (statement-aligned).
  function buildKeeperCamp(b, anchors) {
    const cx = 397,
      cz = -706;
    // lean-to of scrap against a stub of old wall
    b.boxMM("gneiss_dk", cx - 4.2, 0, cz - 3.6, cx + 2.4, 1.6, cz - 3.0, {
      grime: 0.7,
    });
    PR.colMM(cx - 4.2, 0, cz - 3.6, cx + 2.4, 1.6, cz - 3.0, {
      walkable: false,
    });
    PR.scrapWall(b, cx - 4.2, cz - 3.3, cx - 4.2, cz + 1.5, 2.3, {
      seed: 51,
      noSpikes: true,
    });
    for (const [px, pz] of [
      [cx + 2.3, cz + 1.4],
      [cx - 1, cz + 1.4],
    ])
      b.box("rotten", px, 0, pz, 0.14, 2.3, 0.14, { seg: false });
    b.box("corrugated", cx - 1, 2.35, cz - 1.0, 6.8, 0.06, 5.2, {
      rx: 0.18,
      seg: false,
      grime: 0.8,
    });
    b.box("tent", cx - 0.8, 1.9, cz + 1.45, 5.8, 0.6, 0.04, {
      rx: 0.1,
      seg: false,
    });
    // bedroll, table, chairs, stove, crates, fishing gear
    D.mattress(b, cx - 3.2, 0.03, cz - 1.4, HP, 0x9a8a70);
    b.box("rotten", cx + 0.4, 0, cz - 1.8, 1.4, 0.8, 0.8, { seg: false });
    PR.col(cx + 0.4, cz - 1.8, 1.4, 0.8, 0, 0.8, 0, { walkable: false });
    D.chair(b, cx + 0.4, 0, cz - 0.9, PI, false, "rotten");
    PR.barrel(b, cx + 2.8, 0, cz + 2.9, { fire: true });
    D.crates(b, cx - 3.3, 0, cz + 0.6, 2, 61, true);
    for (let k = 0; k < 3; k++)
      b.beam(
        "rotten",
        V3(cx + 3.2 + k * 0.25, 0, cz - 2.6),
        V3(cx + 3.5 + k * 0.5, 3.4, cz - 2.2 + k * 0.2),
        0.03,
        0.03,
      ); // fishing rods
    // drying fish on a line + string of bulbs to the lighthouse
    D.stringLights(
      b,
      V3(cx - 1, 2.3, cz + 1.4),
      V3(LH.x - 2.3, 3.0, LH.z + 0.5),
      0.5,
      8,
      0xffd8a0,
    );
    for (let k = 0; k < 5; k++)
      b.box("leaf_dead", cx - 3.5 + k * 0.5, 1.4, cz + 1.3, 0.12, 0.35, 0.04, {
        seg: false,
      });
    // the beacon transmitter: a jury-rigged radio rack + mast wired to the lighthouse
    const tx = cx + 1.6,
      tz = cz - 2.6;
    b.boxMM("army", tx - 0.6, 0, tz - 0.3, tx + 0.6, 1.3, tz + 0.3, {
      grime: 0.6,
    });
    D.monitor(b, tx - 0.25, 1.3, tz, 0, true);
    b.box("iron", tx + 0.35, 1.3, tz, 0.3, 0.22, 0.25, { seg: false });
    b.sphere("lamp_red", tx + 0.35, 1.58, tz + 0.1, 0.04, { ws: 5, hs: 4 });
    b.cyl("iron", tx + 0.1, 1.3, tz + 0.18, 0.02, 0.02, 0.35, 4, { hSeg: 1 }); // mic stand
    b.sphere("iron", tx + 0.1, 1.7, tz + 0.18, 0.06, { ws: 6, hs: 4 });
    PR.col(tx, tz, 1.2, 0.6, 0, 1.3, 0, { walkable: false });
    b.beam(
      "rust",
      V3(tx - 0.4, 1.3, tz - 0.25),
      V3(tx - 0.4, 9, tz - 0.25),
      0.07,
      0.07,
    ); // mast
    for (let k = 0; k < 4; k++)
      b.beam(
        "iron",
        V3(tx - 0.4, 8.6 - k * 0.5, tz - 0.25),
        V3(tx - 0.4 + (k % 2 ? 0.8 : -0.8), 8.6 - k * 0.5, tz - 0.25),
        0.02,
        0.02,
      );
    D.cable(b, [V3(tx - 0.4, 8.8, tz - 0.25), V3(LH.x - 1.4, 13.6, LH.z)], 0.8);
    PR.glow(V3(tx - 0.25, 1.7, tz + 0.2), 0x60ff90, 0.9, null, {
      intensity: 0.8,
      flicker: 0.2,
    });
    const sk = PR.texMat(
      "pr_keeper_sign",
      PR.signTex(
        "pr_keeper_sign",
        ["LIGHT KEEPER", "TRADE — NO SHOOTING", "MAC"],
        "raider",
        512,
        256,
        { color: "#e8e0c8" },
      ),
      { transparent: false },
    );
    b.quad(sk, cx + 2.35, 1.6, cz + 1.2, 1.2, 0.6, { ry: HP });
    anchors.keeper = PR.anchor(cx + 0.4, 0, cz - 0.6, PI);
    anchors.transmitter = PR.anchor(tx, 0, tz + 0.7, PI);
    PR.transmitterPos = V3(tx, 1.2, tz + 0.2);
  }

  // ===================================================================
  // SKIFF CROSSING
  // ===================================================================
  function pier(b, x0, x1, zc, w, id) {
    const z0 = zc - w / 2,
      z1 = zc + w / 2;
    // deck boards + stringers + pilings
    const n = Math.round(w / 0.27);
    for (let i = 0; i < n; i++) {
      const z = z0 + ((i + 0.5) * w) / n;
      const r = PR.rng(id + i);
      b.box(
        "deck_wood",
        (x0 + x1) / 2 + (r() - 0.5) * 0.3,
        -0.02,
        z,
        x1 - x0 - r() * 0.6,
        0.1,
        w / n - 0.03,
        { seg: false, grime: 0.6, ry: (r() - 0.5) * 0.01 },
      );
    }
    for (const z of [z0 + 0.2, z1 - 0.2])
      b.box("rotten", (x0 + x1) / 2, -0.35, z, x1 - x0, 0.3, 0.2, {
        seg: false,
      });
    for (let x = x0 + 0.3; x <= x1; x += 2.2)
      for (const z of [z0 + 0.15, z1 - 0.15])
        b.cyl("rotten", x, -6, z, 0.16, 0.18, 6.6, 7, { hSeg: 2, grime: 0.8 });
    PR.colMM(x0, -0.5, z0, x1, 0.08, z1, { surface: "wood" });
  }
  function buildCrossing(b, anchors) {
    // island dock (west shore)
    pier(b, DOCK.x0, I.x0 - 0.5, DOCK.z, 3, "pr_dock");
    b.cyl("iron", DOCK.x0 + 0.6, 0.08, DOCK.z + 1.2, 0.14, 0.18, 0.55, 8, {
      hSeg: 1,
    });
    b.cyl("iron", DOCK.x0 + 0.6, 0.08, DOCK.z - 1.2, 0.14, 0.18, 0.55, 8, {
      hSeg: 1,
    });
    // stone water stairs beside the dock (a way out of the river)
    for (let i = 0; i < 7; i++) {
      const top = -0.12 - i * 0.34,
        xA = I.x0 - 0.6 - i * 0.55;
      b.boxMM(
        "granite_block",
        xA - 0.55,
        -6.5,
        DOCK.z - 7.5,
        xA,
        top,
        DOCK.z - 5.0,
        { grime: 0.6 + i * 0.05, seg: false },
      );
      PR.colMM(xA - 0.55, -6.5, DOCK.z - 7.5, xA, top, DOCK.z - 5.0, {
        surface: "concrete",
      });
    }
    PR.skiff(b, DOCK.x0 + 2.6, -1.3, DOCK.z + 2.3, HP, {
      paint: "paint_teal",
      water: true,
    });
    const sign = PR.texMat(
      "pr_ferry_i",
      PR.signTex(
        "pr_ferry_i",
        ["WELFARE ISLAND", "FERRY LANDING", "MANHATTAN — E. 60s"],
        "enamel",
        512,
        256,
        { bg: "#1e3a44", fg: "#e8e0c8" },
      ),
    );
    b.box("iron", I.x0 + 1.2, 0, DOCK.z - 2.1, 0.1, 2.6, 0.1, { seg: false });
    b.quad(sign, I.x0 + 1.2, 2.2, DOCK.z - 2.03, 1.4, 0.7, {});
    PR.col(I.x0 + 1.2, DOCK.z - 2.1, 0.3, 0.3, 0, 2.6, 0, { walkable: false });
    // Manhattan ferry pier (east shore of Manhattan, E. 60s)
    pier(b, MPIER.x0, MPIER.x1, MPIER.z, 3, "pr_mpier");
    PR.skiff(b, MPIER.x1 - 2.4, -1.3, MPIER.z + 2.3, -HP, {
      paint: "paint_red",
      water: true,
    });
    b.box("rotten", MPIER.x1 - 0.4, 0, MPIER.z - 1.3, 0.2, 2.8, 0.2, {
      seg: false,
    });
    b.box("rotten", MPIER.x1 - 0.4, 2.8, MPIER.z - 1.0, 0.1, 0.1, 0.8, {
      seg: false,
    });
    b.lathe(
      "brass",
      [
        [0.02, 0],
        [0.12, 0.05],
        [0.2, 0.25],
        [0.24, 0.4],
        [0.02, 0.42],
      ],
      10,
      MPIER.x1 - 0.4,
      2.35,
      MPIER.z - 0.65,
      { rx: PI },
    ); // ferry bell
    const msign = PR.texMat(
      "pr_ferry_m",
      PR.signTex(
        "pr_ferry_m",
        ["BLACKWELL'S ISLAND", "SKIFF - ROW YOURSELF", "BRING IT BACK - MAC"],
        "raider",
        512,
        256,
        { color: "#e8d8b0" },
      ),
    );
    b.box("rotten", MPIER.x0 + 3.2, 0, MPIER.z - 1.7, 0.12, 2.4, 0.12, {
      seg: false,
    });
    b.box("planks", MPIER.x0 + 3.2, 1.6, MPIER.z - 1.7, 1.6, 0.8, 0.05, {
      seg: false,
      grime: 0.7,
    });
    b.quad(msign, MPIER.x0 + 3.2, 2.0, MPIER.z - 1.66, 1.5, 0.75, {});
    PR.col(MPIER.x0 + 3.2, MPIER.z - 1.7, 0.3, 0.3, 0, 2.4, 0, {
      walkable: false,
    });
    for (let k = 0; k < 3; k++)
      PR.barrel(b, MPIER.x0 + 1.1 + k * 0.7, 0.06, MPIER.z + 1.0, {
        noCollide: k !== 1,
      });
    // rope ferry line across the channel
    D.cable(
      b,
      [
        V3(MPIER.x1 - 0.4, 2.7, MPIER.z - 1.0),
        V3(DOCK.x0 + 0.6, 0.7, DOCK.z - 1.2),
      ],
      1.6,
    );
    // load doors (fade + teleport)
    // (hot-spots sit on the deck edge beside each moored skiff — the boats themselves float over open water —
    //  and each crossing lands the player a few steps up the far pier, facing the shore)
    PR.door({
      id: "pr_skiff_out",
      pos: V3(DOCK.x0 + 2.6, 0.2, DOCK.z + 1.1),
      radius: 1.6,
      label: "Skiff to Manhattan (East 60s)",
      verb: "Row",
      sound: "footstep_water",
      target: { x: MPIER.x1 - 4.2, y: 0.15, z: MPIER.z, yaw: HP },
    });
    PR.door({
      id: "pr_skiff_in",
      pos: V3(MPIER.x1 - 2.4, 0.2, MPIER.z + 1.1),
      radius: 1.6,
      label: "Skiff to Blackwell's Island",
      verb: "Row",
      sound: "footstep_water",
      target: { x: DOCK.x0 + 5.0, y: 0.15, z: DOCK.z, yaw: -HP },
    });
    anchors.dock = PR.anchor(DOCK.x0 + 4, 0.1, DOCK.z, -HP);
    anchors.manhattan_pier = PR.anchor(MPIER.x0 + 5, 0.1, MPIER.z, -HP);
  }

  // ===================================================================
  // QUEENSBORO STAIR TOWER
  // ===================================================================
