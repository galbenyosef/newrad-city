// play-inline-242 06 — seg
// Lines 1165-1473 of readable/play-inline-242.pretty.js (statement-aligned).
  function buildBlackwellHouse(b, anchors) {
    const x0 = 414,
      x1 = 424,
      z0 = -566,
      z1 = -558;
    b.boxMM("gneiss_dk", x0 - 0.2, -0.2, z0 - 0.2, x1 + 0.2, 0.45, z1 + 0.2, {
      grime: 0.6,
    }); // fieldstone foundation
    b.boxMM("planks", x0, 0.3, z0, x1, 0.45, z1, { seg: false, grime: 0.6 });
    PR.colMM(x0, 0, z0, x1, 0.45, z1, { surface: "wood" });
    K.room(b, "planks", x0, z0, x1, z1, 0.45, 5.6, 0.18, [
      { side: "w", c: (z0 + z1) / 2, w: 1.3, h: 2.3 },
    ]);
    // clapboard lines (tinted white paint peeling)
    for (let y = 0.8; y < 5.5; y += 0.32) {
      b.boxMM(
        "paint_cream",
        x0 - 0.04,
        y,
        z0 - 0.04,
        x1 + 0.04,
        y + 0.2,
        z0 + 0.02,
        { seg: false, grime: 0.8 },
      );
      b.boxMM(
        "paint_cream",
        x0 - 0.04,
        y,
        z1 - 0.02,
        x1 + 0.04,
        y + 0.2,
        z1 + 0.04,
        { seg: false, grime: 0.8 },
      );
    }
    // sash windows (quads) + shutters
    for (const [wx, wz, ry] of [
      [x0 + 2.2, z0 - 0.06, PI],
      [x0 + 5, z0 - 0.06, PI],
      [x0 + 7.8, z0 - 0.06, PI],
      [x0 + 2.2, z1 + 0.06, 0],
      [x0 + 5, z1 + 0.06, 0],
      [x0 + 7.8, z1 + 0.06, 0],
    ]) {
      for (const wy of [1.9, 4.3]) {
        b.quad(
          wy > 3 && wx > 420 ? "planks" : "glass_broken",
          wx,
          wy,
          wz,
          0.9,
          1.3,
          { ry, noAO: true },
        );
        b.box("paint_teal", wx - 0.7, wy - 0.65, wz, 0.4, 1.3, 0.05, {
          seg: false,
          grime: 0.7,
          ry: ry + 0.1,
        });
      }
    }
    // gable roof, partly fallen in (south slope missing its eastern half)
    const pitch = 0.62,
      rl = (z1 - z0) / 2 / Math.cos(pitch) + 0.4;
    b.box(
      "slate",
      (x0 + x1) / 2,
      5.6 + (Math.sin(pitch) * rl) / 2 - 0.1,
      z0 + (z1 - z0) / 4,
      x1 - x0 + 0.8,
      0.12,
      rl,
      { rx: -pitch, seg: false, grime: 0.6 },
    );
    b.box(
      "slate",
      x0 + (x1 - x0) * 0.28,
      5.6 + (Math.sin(pitch) * rl) / 2 - 0.1,
      z1 - (z1 - z0) / 4,
      (x1 - x0) * 0.56 + 0.4,
      0.12,
      rl,
      { rx: pitch, seg: false, grime: 0.6 },
    );
    for (let x = x0 + (x1 - x0) * 0.58; x < x1; x += 0.6)
      b.beam(
        "char",
        V3(x, 5.6, z1),
        V3(
          x + 0.1,
          5.6 + ((z1 - z0) / 2) * Math.tan(pitch) - 0.3,
          (z0 + z1) / 2,
        ),
        0.1,
        0.14,
      ); // bare rafters
    // gable-end walls
    for (const gx of [x0, x1 - 0.18]) {
      const sh = new THREE.Shape();
      sh.moveTo(z0, 0);
      sh.lineTo(z1, 0);
      sh.lineTo((z0 + z1) / 2, ((z1 - z0) / 2) * Math.tan(pitch));
      sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: 0.18,
        bevelEnabled: false,
      });
      g.rotateY(-HP);
      b.add("planks", g, { m: PR.m4(gx + 0.18, 5.6, 0), grime: 0.6 });
    }
    b.box("brick", x1 + 0.45, 0, (z0 + z1) / 2 + 1.6, 0.9, 8.4, 1.2, {
      seg: false,
      grime: 0.7,
    }); // chimney
    PR.col(x1 + 0.45, (z0 + z1) / 2 + 1.6, 0.9, 1.2, 0, 8.4, 0, {
      walkable: false,
    });
    // porch (west)
    b.boxMM("rotten", x0 - 2.4, 0.2, z0 + 1.2, x0, 0.35, z1 - 1.2, {
      seg: false,
      grime: 0.7,
    });
    PR.colMM(x0 - 2.4, 0, z0 + 1.2, x0, 0.35, z1 - 1.2, { surface: "wood" });
    for (const pz of [z0 + 1.4, z1 - 1.4])
      b.box("paint_cream", x0 - 2.2, 0.35, pz, 0.14, 2.6, 0.14, { seg: false });
    b.box("slate", x0 - 1.2, 3.0, (z0 + z1) / 2, 2.8, 0.1, z1 - z0 - 2.0, {
      rz: 0.25,
      seg: false,
    });
    // inside: hearth, rocking chair with its last occupant, table, footlocker (spawned prop)
    b.boxMM(
      "brick",
      x1 - 2.0,
      0.45,
      (z0 + z1) / 2 + 0.9,
      x1 - 0.2,
      2.2,
      (z0 + z1) / 2 + 2.4,
      { grime: 0.8 },
    );
    b.boxMM(
      "char",
      x1 - 1.6,
      0.45,
      (z0 + z1) / 2 + 1.2,
      x1 - 0.3,
      1.2,
      (z0 + z1) / 2 + 2.1,
      { seg: false },
    );
    D.chair(b, x1 - 3.2, 0.45, (z0 + z1) / 2 + 1.5, -HP + 0.3, false, "rotten");
    PR.skeleton(b, x1 - 3.4, 0.9, (z0 + z1) / 2 + 1.5, -HP);
    b.box("rotten", x0 + 3, 0.45, (z0 + z1) / 2 - 1.5, 1.6, 0.75, 0.9, {
      seg: false,
    });
    D.papers(b, x0 + 3, 1.21, (z0 + z1) / 2 - 1.5, 0.6, 4, 17);
    const pl = PR.texMat(
      "pr_bw_plaque",
      PR.signTex(
        "pr_bw_plaque",
        ["BLACKWELL HOUSE", "c. 1796", "FARMHOUSE OF THE BLACKWELL FAMILY"],
        "bronze",
        512,
        256,
      ),
    );
    b.quad(pl, x0 - 0.1, 1.8, z0 + 0.7, 0.9, 0.45, { ry: -HP });
    anchors.blackwell_house = PR.anchor(x0 + 3, 0.45, (z0 + z1) / 2, HP);
    anchors.blackwell_locker = PR.anchor(x0 + 1.0, 0.45, z0 + 1.0, 0);
  }
  function buildCemetery(b, anchors) {
    const x0 = 414,
      x1 = 430,
      z0 = -634,
      z1 = -616;
    const r = PR.rng("pr_cem");
    PR.railing(
      b,
      [
        [x0, z0],
        [x1, z0],
        [x1, z1],
        [x0 + 6, z1],
      ],
      0.02,
      0.9,
      "iron",
      { postStep: 1.2 },
    );
    PR.railing(
      b,
      [
        [x0 + 3.5, z1],
        [x0, z1],
        [x0, z0],
      ],
      0.02,
      0.9,
      "iron",
      { postStep: 1.2 },
    );
    for (let i = 0; i < 5; i++)
      for (let j = 0; j < 3; j++) {
        const x = x0 + 2.5 + i * 2.8 + (r() - 0.5) * 0.4,
          z = z0 + 3 + j * 5 + (r() - 0.5) * 0.5;
        const fallen = r() < 0.25;
        const lean = (r() - 0.5) * 0.3;
        if (fallen) {
          b.box("rotten", x, 0.03, z, 0.12, 0.08, 1.2, {
            ry: r() * 3,
            seg: false,
          });
          continue;
        }
        b.box("rotten", x, 0, z, 0.1, 1.2, 0.08, {
          rz: lean,
          seg: false,
          grime: 0.5,
        });
        b.box("rotten", x, 0.75, z, 0.55, 0.08, 0.08, { rz: lean, seg: false });
        // mound
        const m = new THREE.SphereGeometry(1, 8, 4, 0, TAU, 0, HP);
        m.scale(0.5, 0.18, 1.0);
        b.add("dirt", m, { m: PR.m4(x, 0, z + 1.0), grime: 0.4 });
      }
    const sk = PR.texMat(
      "pr_cem_sign",
      PR.signTex(
        "pr_cem_sign",
        ["PATIENTS' BURIAL GROUND", "NUMBERS, NOT NAMES"],
        "engraved",
        512,
        160,
      ),
    );
    b.box("iron", x0 + 4.75, 0, z1 + 0.3, 0.06, 1.8, 0.06, { seg: false });
    b.quad(sk, x0 + 4.75, 1.8, z1 + 0.34, 1.4, 0.44, {});
    anchors.cemetery = PR.anchor((x0 + x1) / 2, 0, (z0 + z1) / 2, 0);
  }

  // ===================================================================
  // BUILDER
  // ===================================================================
  PR.addBuilder(
    "roosevelt_island",
    function (PR2, site, root) {
      readLayout();
      const b = PR.batch("island");
      b.ground = 0;
      b.aoH = 2.5;
      const anchors = {};
      buildGround(b);
      buildSeaWall(b);
      buildPaths(b);
      const oct = G.LAYOUT.getSite("roosevelt_octagon") || {
        x0: 384,
        x1: 428,
        z0: -700,
        z1: -640,
      };
      const ren = G.LAYOUT.getSite("smallpox_hospital") || {
        x0: 384,
        x1: 428,
        z0: -400,
        z1: -366,
      };
      const q = G.LAYOUT.getSite("queensboro_bridge") || { z0: -446, z1: -424 };
      buildGreenery(b, [
        [oct.x0 - 3, oct.x1 + 3, oct.z0 - 3, oct.z1 + 3],
        [ren.x0 - 4, ren.x1 + 4, ren.z0 - 4, ren.z1 + 4],
        [380, 434, q.z0 - 4, TOWER.z1 + 3],
        [LH.x - 14, LH.x + 8, I.z0, LH.z + 8],
        [382, 406, -474, -451],
        [412, 426, -568, -556],
        [412, 432, -636, -614],
        [I.x0, 386, DOCK.z - 9, DOCK.z + 5],
      ]);
      buildLighthouse(b, anchors);
      buildKeeperCamp(b, anchors);
      buildCrossing(b, anchors);
      buildStairTower(b, anchors);
      buildBlackwellHouse(b, anchors);
      buildCemetery(b, anchors);
      // scattered storytelling on the island
      const r = PR.rng("pr_isle_story");
      for (const [x, z, a] of [
        [396, -612, 0.5],
        [420, -505, 2.2],
        [383.2, -540, -1.2],
        [409, -470, 1.9],
      ])
        PR.skeleton(b, x, 0.03, z, a);
      PR.wheelchair(b, 395, 0, -616, 0.8, true);
      PR.car(b, 416, 0, -452, 0.3, { seed: 5, paint: "rust" });
      PR.car(b, 417, 0, -478, 2.2, { seed: 9, flipped: true }); // (moved off the tram station footprint)
      D.rubble(b, 418, 0, -440, 1.6, 8, 12);
      D.rubble(b, 395, 0, -432, 1.2, 6, 13);
      for (let k = 0; k < 6; k++)
        PR.barrel(b, 424 + (r() - 0.5) * 3, 0, -482 + k * 0.9, {
          noCollide: k % 2 === 1,
        });
      b.build(root);
      // registry
      PR.register("roosevelt_island", root, anchors, {});
      // keeper's transmitter (quest hook) — handled in 80_content via PR.transmitterPos
    },
    5,
  );
