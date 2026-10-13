// play-inline-242 02 — math
// Lines 22-369 of readable/play-inline-242.pretty.js (statement-aligned).
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

