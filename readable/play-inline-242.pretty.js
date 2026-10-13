/* src/poi_roosevelt/05_island.js */
/* =====================================================================
 * NEW RAD CITY — POI ROOSEVELT — 05_island.js
 * Blackwell's (Welfare / Roosevelt) Island itself, from G.LAYOUT.ROOSEVELT:
 *  - ground plate (dead grass, dirt patches) + walkable slab colliders
 *    (the map module rasterised this strip of the East River as water)
 *  - granite sea wall with coping, algae line, riprap rocks, iron railing
 *  - promenades, dirt paths, dead trees, Victorian lamps, benches
 *  - the 1872 Blackwell Island Light on the rocky north tip + the Keeper's
 *    scrap camp and his jury-rigged beacon transmitter (quest hook)
 *  - skiff crossing: timber dock on the island ↔ ferry pier on the Manhattan
 *    shore (x≈335, z≈-650), with a rope line across the river
 *  - steel stair tower from the island up to the Queensboro Bridge deck
 *    (y 22) — self-contained landing so it works with or without poi_bridges
 *  - Blackwell House (1796 farmhouse ruin), the asylum burial ground
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._pr) return;
  const PR = G._pr;
  const K = PR.kit,
    D = PR.dress;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const PI = Math.PI,
    HP = PI / 2,
    TAU = PI * 2;
  const U = G.util;

  // Island rectangle (layout) — kept in sync with G.LAYOUT.ROOSEVELT at build time
  const I = { x0: 378, x1: 434, z0: -720, z1: -356 };
  const DECK_Y = 22; // Queensboro deck (layout SITES.queensboro_bridge.deckY)
  const TOWER = { x0: 385, x1: 391, z0: -422, z1: -414 };
  const LH = { x: 406, z: -711 }; // Blackwell Island Light
  const DOCK = { z: -648, x0: 366.5 }; // island skiff dock (west shore)
  const MPIER = { z: -650, x0: 333, x1: 347 }; // Manhattan ferry pier

  PR.ISLAND = I;
  PR.flagDefaults.beacon_used = false;

  function readLayout() {
    const R = G.LAYOUT && G.LAYOUT.ROOSEVELT;
    if (!R || !R.length) return;
    let x0 = 1e9,
      x1 = -1e9,
      z0 = 1e9,
      z1 = -1e9;
    for (const p of R) {
      x0 = Math.min(x0, p[0]);
      x1 = Math.max(x1, p[0]);
      z0 = Math.min(z0, p[1]);
      z1 = Math.max(z1, p[1]);
    }
    I.x0 = x0;
    I.x1 = x1;
    I.z0 = z0;
    I.z1 = z1;
    const q = G.LAYOUT.getSite && G.LAYOUT.getSite("queensboro_bridge");
    if (q) {
      TOWER.z1 = q.z1 + 10;
      TOWER.z0 = q.z1 + 2;
    }
  }

  // ===================================================================
  // GROUND, SEA WALL, SHORE
  // ===================================================================
  function buildGround(b) {
    const W = I.x1 - I.x0,
      Dp = I.z1 - I.z0;
    const cx = (I.x0 + I.x1) / 2,
      cz = (I.z0 + I.z1) / 2;
    // dead-grass plate, gently undulating (always ≤ 0 so feet never sink)
    const g = new THREE.PlaneGeometry(
      W,
      Dp,
      Math.round(W / 2),
      Math.round(Dp / 2),
    );
    g.rotateX(-HP);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) + cx,
        z = p.getZ(i) + cz;
      const edge = Math.min(x - I.x0, I.x1 - x, z - I.z0, I.z1 - z);
      const n = U.fbm2(x * 0.05, z * 0.05, 3);
      p.setY(i, -0.02 - n * 0.07 * PR.smooth(0, 3, edge));
    }
    g.computeVertexNormals();
    b.add("grass", g, { m: PR.m4(cx, 0, cz), grime: 0.35 });
    // dirt / mud patches
    const r = PR.rng("pr_island_ground");
    for (let k = 0; k < 46; k++) {
      const x = I.x0 + 4 + r() * (W - 8),
        z = I.z0 + 6 + r() * (Dp - 12);
      const rad = 1.5 + r() * 4.5;
      const c = new THREE.CircleGeometry(rad, 12);
      c.rotateX(-HP);
      PR.deform(c, (v) => {
        const a = Math.atan2(v.z, v.x);
        const k2 =
          0.7 + 0.5 * U.noise2(Math.cos(a) * 2 + x, Math.sin(a) * 2 + z);
        v.x *= k2;
        v.z *= k2;
      });
      b.add(r() < 0.7 ? "dirt" : "leaf_dead", c, {
        m: PR.m4(x, 0.012 + k * 0.0003, z),
        grime: 0.3,
      });
    }
    // walkable slab (the map module's raster thinks this is river)
    PR.colMM(I.x0 - 0.6, -6, I.z0 - 0.6, I.x1 + 0.6, 0, I.z1 + 0.6, {
      surface: "grass",
    });
  }

  function buildSeaWall(b) {
    const r = PR.rng("pr_seawall");
    const segs = [
      [I.x0 - 0.6, I.z0 - 0.6, I.x0 + 0.6, I.z1 + 0.6], // west
      [I.x1 - 0.6, I.z0 - 0.6, I.x1 + 0.6, I.z1 + 0.6], // east
      [I.x0 - 0.6, I.z0 - 0.6, I.x1 + 0.6, I.z0 + 0.6], // north
      [I.x0 - 0.6, I.z1 - 0.6, I.x1 + 0.6, I.z1 + 0.6], // south
    ];
    for (const s of segs) {
      b.boxMM("granite_block", s[0], -6.5, s[1], s[2], 0.18, s[3], {
        grime: 0.6,
        segLen: 6,
      });
      // algae / tide line
      b.boxMM(
        "moss",
        s[0] - 0.03,
        -1.95,
        s[1] - 0.03,
        s[2] + 0.03,
        -0.95,
        s[3] + 0.03,
        { grime: 0.8, segLen: 6 },
      );
      // coping cap stones (slightly proud)
      b.boxMM(
        "granite",
        s[0] - 0.08,
        0.18,
        s[1] - 0.08,
        s[2] + 0.08,
        0.3,
        s[3] + 0.08,
        { grime: 0.35, segLen: 3 },
      );
      PR.colMM(s[0] - 0.08, -0.5, s[1] - 0.08, s[2] + 0.08, 0.3, s[3] + 0.08, {
        surface: "concrete",
      });
    }
    // riprap boulders at the waterline
    const rockAlong = (x0, z0, x1, z1, nx, nz, step, big) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const TINT = [0xffffff, 0xd8d4cc, 0xb8b4aa, 0xe8e0d0, 0xa8a49a];
      let t = r() * step;
      let i = 0;
      while (t < len) {
        // clusters of 1..4 boulders of mixed size, some half-drowned, some stacked against the wall
        const nC = 1 + Math.floor(r() * 3.2);
        for (let k = 0; k < nC; k++) {
          const tt = Math.min(len, t + (r() - 0.5) * 2.2) / len;
          const out = 0.6 + r() * r() * 3.4;
          const x = x0 + (x1 - x0) * tt + nx * out,
            z = z0 + (z1 - z0) * tt + nz * out;
          const rad = (0.4 + r() * r() * 1.5) * (big || 1);
          b.rock("rock", x, -1.9 + r() * 0.9 + (out < 1.2 ? 0.3 : 0), z, rad, {
            seed: i * 7.3 + x,
            flat: 0.55 + r() * 0.35,
            grime: 0.55,
            sx: 0.8 + r() * 0.5,
            c: TINT[i % 5],
          });
          i++;
        }
        t += step * (0.5 + r() * 1.1);
      }
    };
    rockAlong(I.x0, I.z0, I.x0, I.z1, -1, 0, 3.4);
    rockAlong(I.x1, I.z0, I.x1, I.z1, 1, 0, 3.4);
    rockAlong(I.x0, I.z1, I.x1, I.z1, 0, 1, 2.6, 1.2);
    // rocky north point under the lighthouse: a tumble of big boulders out into the river
    for (let k = 0; k < 34; k++) {
      const a = PI * (1.1 + r() * 0.8),
        d = 3 + r() * 16;
      const x = LH.x + Math.cos(a) * d * 1.3,
        z = I.z0 - 1 + Math.sin(a) * d * 0.7;
      if (z > I.z0 - 0.8) continue;
      b.rock("rock", x, -1.8 + r() * 1.4, z, 1.0 + r() * 1.6, {
        seed: 300 + k,
        flat: 0.75,
        grime: 0.55,
      });
    }
    // railing along the promenade edges (gaps at the dock and the water steps)
    const RY = 0.3;
    const west = [
      [
        [I.x0 + 0.35, I.z0 + 1.5],
        [I.x0 + 0.35, DOCK.z - 8.5],
      ],
      [
        [I.x0 + 0.35, DOCK.z + 4.5],
        [I.x0 + 0.35, I.z1 - 1.5],
      ],
    ];
    for (const seg of west)
      PR.railing(b, seg, RY, 1.0, "iron", { collide: true, postStep: 2.4 });
    PR.railing(
      b,
      [
        [I.x1 - 0.35, I.z0 + 1.5],
        [I.x1 - 0.35, I.z1 - 1.5],
      ],
      RY,
      1.0,
      "iron",
      { collide: true, postStep: 2.4 },
    );
    PR.railing(
      b,
      [
        [I.x0 + 1.5, I.z1 - 0.35],
        [I.x1 - 1.5, I.z1 - 0.35],
      ],
      RY,
      1.0,
      "iron",
      { collide: true, postStep: 2.4 },
    );
    PR.railing(
      b,
      [
        [I.x0 + 1.5, I.z0 + 0.35],
        [LH.x - 9, I.z0 + 0.35],
      ],
      RY,
      1.0,
      "iron",
      { collide: true, postStep: 2.4 },
    );
    PR.railing(
      b,
      [
        [LH.x + 9, I.z0 + 0.35],
        [I.x1 - 1.5, I.z0 + 0.35],
      ],
      RY,
      1.0,
      "iron",
      { collide: true, postStep: 2.4 },
    );
    // bent / missing railing sections (storm damage) — visual kinks
    for (const z of [-600, -505, -470])
      b.beam(
        "rust",
        V3(I.x1 - 0.35, 1.3, z),
        V3(I.x1 + 0.4, 0.7, z + 2.2),
        0.06,
        0.06,
      );
  }

  function buildPaths(b) {
    const r = PR.rng("pr_paths");
    // promenades (worn hexagonal-paver look via the sidewalk texture)
    b.boxMM(
      "sidewalk",
      I.x0 + 0.6,
      -0.1,
      I.z0 + 0.6,
      I.x0 + 4.2,
      0.035,
      I.z1 - 0.6,
      { grime: 0.55, segLen: 8 },
    );
    b.boxMM(
      "sidewalk",
      I.x1 - 4.2,
      -0.1,
      I.z0 + 0.6,
      I.x1 - 0.6,
      0.035,
      I.z1 - 0.6,
      { grime: 0.55, segLen: 8 },
    );
    b.boxMM(
      "sidewalk",
      I.x0 + 0.6,
      -0.1,
      I.z1 - 4.2,
      I.x1 - 0.6,
      0.035,
      I.z1 - 0.6,
      { grime: 0.55, segLen: 8 },
    );
    b.boxMM(
      "sidewalk",
      I.x0 + 0.6,
      -0.1,
      I.z0 + 0.6,
      I.x1 - 0.6,
      0.035,
      I.z0 + 4.2,
      { grime: 0.55, segLen: 8 },
    );
    // cracked slabs heaved up by roots
    for (let k = 0; k < 30; k++) {
      const west = r() < 0.5,
        z = I.z0 + 10 + r() * (I.z1 - I.z0 - 20);
      b.box(
        "sidewalk",
        west ? I.x0 + 1 + r() * 2.6 : I.x1 - 1 - r() * 2.6,
        -0.05,
        z,
        0.9 + r() * 0.6,
        0.12,
        0.9 + r() * 0.6,
        {
          ry: r() * 3,
          rx: (r() - 0.5) * 0.18,
          rz: (r() - 0.5) * 0.18,
          seg: false,
          grime: 0.6,
        },
      );
    }
    // dirt footpath: lighthouse → west of the Octagon → down the spine → Renwick
    const pts = [
      [LH.x - 2, -703],
      [392, -698],
      [391, -672],
      [392, -640],
      [402, -620],
      [406, -590],
      [408, -540],
      [405, -490],
      [406, -452],
      [406, -426],
      [404, -410],
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const ry = Math.atan2(c[0] - a[0], c[1] - a[1]);
      b.box(
        "dirt",
        (a[0] + c[0]) / 2,
        -0.06,
        (a[1] + c[1]) / 2,
        2.6,
        0.1,
        len + 1.2,
        { ry, seg: false, grime: 0.3, c: 0xe8d8b8 },
      );
    }
    // spur to the dock
    b.box("dirt", (I.x0 + 392) / 2, -0.055, DOCK.z, 392 - I.x0, 0.1, 2.2, {
      seg: false,
      grime: 0.4,
    });
  }

  function buildGreenery(b, avoid) {
    const r = PR.rng("pr_trees");
    let n = 0;
    for (let k = 0; k < 400 && n < 34; k++) {
      const x = I.x0 + 6 + r() * (I.x1 - I.x0 - 12),
        z = I.z0 + 16 + r() * (I.z1 - I.z0 - 24);
      if (avoid.some((a) => x > a[0] && x < a[1] && z > a[2] && z < a[3]))
        continue;
      if (Math.abs(x - 406) < 3 && z > -640) continue; // spine path
      const h = 5 + r() * 5;
      PR.deadTree(b, x, 0, z, h, 911 + k);
      PR.col(x, z, 0.55, 0.55, 0, h * 0.5, 0, {
        walkable: false,
        surface: "wood",
      });
      // leaf litter / root flare
      const c = new THREE.CircleGeometry(1.4 + r(), 10);
      c.rotateX(-HP);
      b.add("leaf_dead", c, { m: PR.m4(x, 0.02, z), grime: 0.4 });
      n++;
    }
    // dead-grass tufts, weeds and stones scattered over the lawns
    const tr = PR.rng("pr_tufts");
    for (let k = 0; k < 420; k++) {
      const x = I.x0 + 5 + tr() * (I.x1 - I.x0 - 10),
        z = I.z0 + 6 + tr() * (I.z1 - I.z0 - 12);
      if (avoid.some((a) => x > a[0] && x < a[1] && z > a[2] && z < a[3]))
        continue;
      if (tr() < 0.8) {
        const h = 0.25 + tr() * 0.45,
          n = 3 + ((tr() * 3) | 0);
        for (let q = 0; q < n; q++) {
          const a = tr() * TAU;
          b.add(
            tr() < 0.5 ? "straw" : "leaf_dead",
            new THREE.ConeGeometry(0.035, h * (0.6 + tr() * 0.6), 3),
            {
              m: PR.m4(
                x + Math.cos(a) * 0.12,
                h * 0.3,
                z + Math.sin(a) * 0.12,
                a,
                (tr() - 0.5) * 0.7,
                (tr() - 0.5) * 0.7,
              ),
              grime: 0.2,
              noAO: true,
            },
          );
        }
      } else
        b.rock("rock", x, -0.05, z, 0.12 + tr() * 0.25, {
          flat: 0.6,
          detail: 0,
          seed: k,
        });
    }
    // lamp posts along the west promenade (Victorian cast iron), benches between
    let li = 0;
    for (let z = I.z0 + 22; z < I.z1 - 10; z += 28) {
      const lit = li % 4 === 1;
      PR.lampPost(b, I.x0 + 3.7, 0.03, z, lit);
      PR.col(I.x0 + 3.7, z, 0.35, 0.35, 0, 4, 0, {
        walkable: false,
        surface: "metal",
      });
      if (Math.abs(z - DOCK.z) > 8) PR.bench(b, I.x0 + 3.2, 0.03, z + 12, -HP);
      li++;
    }
    for (let z = I.z0 + 36; z < I.z1 - 10; z += 34) {
      PR.lampPost(b, I.x1 - 3.7, 0.03, z, false);
      PR.col(I.x1 - 3.7, z, 0.35, 0.35, 0, 4, 0, { walkable: false });
    }
  }

  // ===================================================================
  // LIGHTHOUSE + KEEPER'S CAMP
  // ===================================================================
  function buildLighthouse(b, anchors) {
    const x = LH.x,
      z = LH.z;
    // rock plinth
    b.rock("rock", x, -0.6, z, 4.2, { flat: 0.35, seed: 71, grime: 0.6 });
    b.cyl("gneiss_dk", x, 0, z, 3.0, 3.3, 0.9, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    // octagonal tapering shaft of rough-cut gneiss
    for (let y = 0.9, i = 0; y < 13.2; y += 2.05, i++) {
      const t0 = (y - 0.9) / 12.3,
        t1 = Math.min(1, (y + 2.05 - 0.9) / 12.3);
      const r0 = 2.55 - t0 * 0.75,
        r1 = 2.55 - t1 * 0.75;
      b.cyl("gneiss", x, y, z, r1, r0, Math.min(2.05, 13.2 - y), 8, {
        hSeg: 1,
        thetaStart: PI / 8,
        grime: 0.55,
      });
    }
    // corner quoins (lighter dressed stone)
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      for (let y = 1.0, j = 0; y < 13; y += 0.55, j++) {
        const rr = 2.55 - ((y - 0.9) / 12.3) * 0.75 + 0.02;
        b.box(
          "limestone",
          x + Math.cos(a) * rr,
          y,
          z + Math.sin(a) * rr,
          j % 2 ? 0.55 : 0.35,
          0.5,
          0.3,
          { ry: -a + HP, seg: false, grime: 0.4 },
        );
      }
    }
    // Gothic doorway (south) with a pointed hood and lancet slits up the shaft
    const dz = z + 2.42;
    PR.lancetWindow(b, x, 0.9, dz + 0.02, 0, 1.1, 2.4, {
      glass: "glass_broken",
      frame: "limestone",
      frameW: 0.2,
      sill: false,
    });
    b.box("oak", x + 0.3, 0.9, dz - 0.3, 0.08, 2.0, 0.9, {
      ry: 0.9,
      seg: false,
    }); // door hanging open
    for (let i = 0; i < 4; i++) {
      const a = [HP, -HP, 0, PI][i] + (i % 2) * 0.4,
        y = 3.4 + i * 2.3;
      const rr = (2.55 - ((y - 0.9) / 12.3) * 0.75) * 0.924;
      const wx = x + Math.sin(a) * (rr + 0.03),
        wz = z + Math.cos(a) * (rr + 0.03);
      PR.lancetWindow(b, wx, y, wz, a, 0.35, 1.0, {
        glass: "glass_broken",
        frame: "limestone",
        frameW: 0.1,
        sill: false,
      });
    }
    // corbelled gallery
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * TAU;
      b.box(
        "limestone",
        x + Math.cos(a) * 1.9,
        12.6,
        z + Math.sin(a) * 1.9,
        0.3,
        0.6,
        0.55,
        { ry: -a + HP, seg: false },
      );
    }
    b.cyl("granite", x, 13.2, z, 2.45, 2.2, 0.3, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    const rail = [];
    for (let k = 0; k <= 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      rail.push([x + Math.cos(a) * 2.3, z + Math.sin(a) * 2.3]);
    }
    PR.railing(b, rail, 13.5, 0.95, "iron", { postStep: 0.6 });
    // lantern room: 8 iron mullions, cracked glazing, the lamp, domed cap + ventilator ball
    b.cyl("iron", x, 13.5, z, 1.45, 1.45, 0.6, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
    });
    b.cyl("glass_dark", x, 14.1, z, 1.35, 1.35, 1.9, 8, {
      hSeg: 1,
      thetaStart: PI / 8,
      open: true,
    });
    for (let k = 0; k < 8; k++) {
      const a = PI / 8 + (k * PI) / 4;
      b.box(
        "iron",
        x + Math.cos(a) * 1.4,
        14.1,
        z + Math.sin(a) * 1.4,
        0.08,
        1.9,
        0.08,
        { ry: -a, seg: false },
      );
    }
    b.cyl("brass", x, 14.1, z, 0.35, 0.45, 0.5, 8, { hSeg: 1 });
    b.sphere("beacon", x, 14.95, z, 0.42, { ws: 10, hs: 8 });
    b.lathe(
      "iron",
      [
        [1.6, 0],
        [1.5, 0.35],
        [1.1, 0.9],
        [0.5, 1.3],
        [0.2, 1.45],
        [0.01, 1.5],
      ],
      8,
      x,
      16.0,
      z,
      { phiStart: PI / 8 },
    );
    b.sphere("iron", x, 17.6, z, 0.22, {});
    b.beam("iron", V3(x, 17.7, z), V3(x, 18.8, z), 0.04, 0.04);
    b.box("iron", x, 18.5, z, 0.7, 0.06, 0.04, { ry: 0.6, seg: false }); // weather vane
    PR.col(x, z, 5.2, 5.2, 0, 13.4, 0, { walkable: false });
    // inscription tablet
    const tabK = PR.texMat(
      "pr_lh_tab",
      PR.signTex(
        "pr_lh_tab",
        [
          "BLACKWELL ISLAND LIGHT",
          "ERECTED 1872",
          "RAISED FROM THE BOTTOM TO THE TOP",
          "BY ONE WHO WAS NOT WELL",
        ],
        "engraved",
        512,
        256,
      ),
      { rough: 0.9 },
    );
    b.box("gneiss_dk", x - 2.6, 0, z + 3.9, 1.5, 1.1, 0.4, {
      seg: false,
      ry: 0.3,
    });
    PR.col(x - 2.6, z + 3.9, 1.5, 0.4, 0, 1.1, 0.3, { walkable: false });
    b.quad(
      tabK,
      x - 2.6 + Math.sin(0.3) * 0.21,
      0.62,
      z + 3.9 + Math.cos(0.3) * 0.21,
      1.3,
      0.65,
      { ry: 0.3, rx: -0.15 },
    );
    PR.readable(
      V3(x - 2.6, 0.9, z + 4.2),
      "Weathered Tablet",
      'The tablet says a patient of the asylum, John McCarthy, raised this light "from the bottom to the top" and asks all who pass to pray for his soul. Someone has scratched underneath: "STILL HERE. — MAC"',
    );
    // rotating beam at night (additive) — animated in update
    const beamGroup = new THREE.Group();
    beamGroup.position.set(x, 14.95, z);
    const bm = new THREE.MeshBasicMaterial({
      color: 0xfff2c0,
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: true,
    });
    for (const sgn of [1, -1]) {
      const cone = new THREE.CylinderGeometry(0.3, 5.5, 70, 12, 1, true);
      cone.rotateZ(sgn * HP);
      cone.translate(sgn * 35, 0, 0);
      const m = new THREE.Mesh(cone, bm);
      m.renderOrder = 6;
      beamGroup.add(m);
    }
    beamGroup.visible = false;
    PR.root.add(beamGroup);
    PR.animate(V3(x, 15, z), 1400, (t) => {
      const night = PR.isNight();
      beamGroup.visible = night && !!PR.flag("beacon_lit");
      if (beamGroup.visible) beamGroup.rotation.y = t * 0.6;
    });
    PR.flagDefaults.beacon_lit = true;
    anchors.lighthouse = PR.anchor(x, 0, z + 3.2, 0);
    anchors.lighthouse_top = PR.anchor(x, 13.5, z, 0);
    PR.glow(V3(x, 14.95, z), 0xfff0b0, 3.4, null, {
      intensity: 1.3,
      flicker: 0.05,
    });
  }

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
})();
