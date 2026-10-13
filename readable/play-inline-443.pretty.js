/* src/props/25_clutter.js */
/* =====================================================================
 * props / 25_clutter.js — DEBRIS, CLUTTER & DEFENCES prototypes.
 * Garbage bags, paper litter, tires, oil drums (rusty / radioactive /
 * flammable / burning), sandbags, jersey barriers, police sawhorses,
 * traffic cones, raider scrap walls & skull pikes, Brute gore
 * bags, shopping carts, crates & pallets, chain-link fences, A-frame
 * boards, debris piles, shipping containers, dumpsters, mattresses,
 * baby prams, luggage, and the posable SKELETON builder.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;

  // ---------------- garbage bag piles ----------------
  function bag(k, r, x, y, z, s) {
    const col = [0x1c1c1a, 0x22261e, 0x2a2a28, 0x3a3a30, 0x4a4a3a][
      (r() * 5) | 0
    ];
    k.sphere("fabric", 0.3 * s, x, y + 0.2 * s, z, {
      s: [1.05 + r() * 0.2, 0.75 + r() * 0.2, 0.95],
      ry: r() * 6,
      color: col,
      wseg: 7,
      hseg: 5,
      grime: 0.1,
    });
    k.cyl("fabric", 0.02 * s, 0.07 * s, 0.14 * s, x + 0.05, y + 0.46 * s, z, {
      seg: 5,
      color: col,
      rz: (r() - 0.5) * 0.8,
    });
  }
  D("garbage_bags", (k, r, v) => {
    const n = 2 + v * 2 + ((r() * 2) | 0);
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * (0.3 + v * 0.25);
      bag(
        k,
        r,
        Math.cos(a) * d,
        i > 4 ? 0.25 : 0,
        Math.sin(a) * d * 0.7,
        0.8 + r() * 0.5,
      );
    }
    if (r() < 0.6)
      k.boxB("wood", 0.5, 0.35, 0.4, 0.5, 0, 0.1, {
        ry: r() * 2,
        color: 0x8a7050,
      }); // soggy cardboard box
    for (let i = 0; i < 3; i++)
      k.quad("paper", 0.18, 0.13, (r() - 0.5) * 1.6, 0.012, (r() - 0.5) * 1.2, {
        rx: -PI / 2,
        rz: r() * 3,
      });
    k.meta.tier = "small";
    k.meta.collider = v >= 2 ? { w: 1.2, d: 0.9, h: 0.6 } : null;
  });

  // ---------------- litter & small junk ----------------
  // Dirty, desaturated, clustered trash (not confetti): sun-bleached newspaper
  // sheets (some curled), crumpled paper balls, crushed cans, bottles, a
  // flattened carton and drifts of dead leaves, bunched toward one side the way
  // wind leaves it. v0 paper-heavy, v1 cans & bottles, v2 leaves + carton.
  const PAPER_TONES = [0x6a6454, 0x5c574a, 0x756c5a, 0x4e4a40, 0x635a48];
  const LEAF_TONES = [0x4a3a22, 0x5a4428, 0x3a3020, 0x66502e, 0x2e2a1c];
  const gauss = (r) => (r() + r() + r() - 1.5) / 1.5;
  function paperBall(k, r, x, z, s) {
    const g = new THREE.IcosahedronGeometry(0.055 * s, 0);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const f = 0.75 + r() * 0.5;
      p.setXYZ(i, p.getX(i) * f, p.getY(i) * f * 0.8, p.getZ(i) * f);
    }
    k.add("fabric", g, {
      x,
      y: 0.04 * s,
      z,
      ry: r() * 6,
      color: PAPER_TONES[(r() * PAPER_TONES.length) | 0],
      grime: 0.45,
      ao: [0.7, 0.1],
    });
  }
  X.paperBall = paperBall;
  function crushedCan(k, r, x, z) {
    k.cyl("metal", 0.034, 0.034, 0.11, x, 0.022, z, {
      rz: PI / 2,
      ry: r() * 6,
      s: [1, 1, 0.45],
      seg: 7,
      color: [0x8a2a22, 0x6a6a62, 0x3a5a3a, 0x9a8a50][(r() * 4) | 0],
      rust: 0.7,
      grime: 0.4,
    });
  }
  function bottle(k, r, x, z) {
    k.lathe(
      "glass",
      [
        [0, 0],
        [0.034, 0],
        [0.038, 0.12],
        [0.016, 0.19],
        [0.014, 0.24],
        [0, 0.24],
      ],
      x,
      0.037,
      z,
      {
        rz: PI / 2,
        ry: r() * 6,
        seg: 6,
        color: [0x4a1a10, 0x2a3a24, 0x5a4a2a][(r() * 3) | 0],
        grime: 0.3,
      },
    );
  }
  D("litter", (k, r, v) => {
    const bias = r() * X.TAU,
      bx = Math.cos(bias) * 0.5,
      bz = Math.sin(bias) * 0.4; // wind-banked cluster centre
    const at = (sp) => [bx + gauss(r) * sp, bz + gauss(r) * sp * 0.7];
    // newspaper sheets / flyers: 0.2-0.45 m, dull tones, some curled up at an edge
    const sheets = v === 0 ? 4 + ((r() * 3) | 0) : 1 + ((r() * 2) | 0);
    for (let i = 0; i < sheets; i++) {
      const [x, z] = at(0.9),
        w = 0.22 + r() * 0.22,
        h = 0.16 + r() * 0.16;
      k.quad("paper", w, h, x, 0.012 + i * 0.0015, z, {
        rx: -PI / 2 + (r() < 0.3 ? 0.25 + r() * 0.3 : (r() - 0.5) * 0.08),
        rz: r() * 6,
        color: PAPER_TONES[(r() * PAPER_TONES.length) | 0],
        grime: 0.55,
      });
    }
    // crumpled paper balls
    for (
      let i = 0, n = v === 0 ? 3 + ((r() * 3) | 0) : 1 + ((r() * 2) | 0);
      i < n;
      i++
    ) {
      const [x, z] = at(0.8);
      paperBall(k, r, x, z, 0.7 + r() * 0.8);
    }
    // cans & bottles
    for (
      let i = 0, n = v === 1 ? 4 + ((r() * 3) | 0) : 1 + ((r() * 2) | 0);
      i < n;
      i++
    ) {
      const [x, z] = at(0.9);
      if (r() < 0.6) crushedCan(k, r, x, z);
      else bottle(k, r, x, z);
    }
    // dead leaves drift
    if (v === 2 || r() < 0.4) {
      for (let i = 0, n = v === 2 ? 18 : 7; i < n; i++) {
        const [x, z] = at(v === 2 ? 0.6 : 0.4);
        k.add(
          "fabric",
          new THREE.PlaneGeometry(0.06 + r() * 0.05, 0.04 + r() * 0.03),
          {
            x,
            y: 0.006 + r() * 0.01,
            z,
            rx: -PI / 2 + (r() - 0.5) * 0.4,
            rz: r() * 6,
            color: LEAF_TONES[(r() * LEAF_TONES.length) | 0],
            grime: 0.3,
            ao: [1, 1],
          },
        );
      }
    }
    // a soggy, flattened carton
    if (v === 2 || r() < 0.25) {
      const [x, z] = at(0.6);
      k.boxB("wood", 0.5 + r() * 0.2, 0.015, 0.35 + r() * 0.15, x, 0, z, {
        ry: r() * 3,
        rz: (r() - 0.5) * 0.06,
        color: 0x6a5a42,
        grime: 0.5,
      });
    }
    k.meta.tier = "small";
  });

  // ---------------- crash debris (around wrecks & pile-ups) ----------------
  // Safety-glass crumbs, a hubcap, a torn-off chrome bumper or fender, a
  // headlight bezel, and a dark oil stain. v0 glass + stain, v1 + bumper,
  // v2 + fender panel & hubcap.
  D("car_debris", (k, r, v) => {
    k.cyl("glow", 0.8 + r() * 0.5, 0.9 + r() * 0.5, 0.004, 0, 0.004, 0, {
      seg: 10,
      color: 0x0e0c0a,
      s: [1, 1, 0.6],
    }); // oil / soot stain
    for (let i = 0; i < 14; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * 0.9;
      k.box(
        "glass",
        0.03 + r() * 0.04,
        0.006,
        0.03 + r() * 0.04,
        Math.cos(a) * d,
        0.006,
        Math.sin(a) * d,
        { ry: r() * 6, color: 0x7a9a98, grime: 0.2 },
      );
    }
    if (v >= 1) {
      k.cyl(
        "metal",
        0.07,
        0.07,
        1.4,
        (r() - 0.5) * 0.6,
        0.07,
        (r() - 0.5) * 0.4,
        { rz: PI / 2, ry: r() * 3, seg: 6, color: 0xb8b8b0, rust: 0.4 },
      );
      k.cyl("metal", 0.14, 0.15, 0.08, 0.5, 0.04, 0.3, {
        rx: PI / 2 - 0.1,
        seg: 9,
        color: 0xc0c0b8,
        rust: 0.3,
      }); // headlight bezel
    }
    if (v >= 2) {
      k.cyl("metal", 0.22, 0.22, 0.03, -0.5, 0.02, -0.4, {
        seg: 10,
        color: 0xc8c4b8,
        rust: 0.35,
      }); // hubcap
      k.cyl("metal", 0.08, 0.1, 0.02, -0.5, 0.045, -0.4, {
        seg: 8,
        color: 0xd8d4c8,
      });
      k.box("metal", 1.1, 0.03, 0.55, 0.1, 0.12, -0.2, {
        rz: 0.2,
        ry: r() * 3,
        color: [0x7ab8b0, 0xd89080, 0xd8c070, 0x8a3a3a][(r() * 4) | 0],
        rust: 0.6,
      }); // bent fender panel
    }
    k.meta.tier = "small";
  });

  // ---------------- rubble heaps (collapsed facade at a building base) ----------------
  // A dusty mound of broken concrete with bricks, slabs, twisted rebar and a
  // snapped wooden beam. v0 small (1.4 m), v1 medium (2.2 m), v2 large
  // spill (3.2 m, walkable collider), v3 brick-heavy (brownstone rubble).
  const RUBBLE_C = [0x8e887c, 0x7e786c, 0x9a9282, 0x6e685e];
  const BRICK_C = [0x7a3a28, 0x8a4a34, 0x6a3222, 0x9a5a40];
  function mound(k, r, R, H, color, ox, oz) {
    const g = new THREE.SphereGeometry(1, 9, 5, 0, X.TAU, 0, PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i),
        y = p.getY(i),
        z = p.getZ(i);
      const n = 0.72 + 0.5 * X.noise3(x * 2.3 + ox, y * 2.1, z * 2.3 + oz);
      p.setXYZ(
        i,
        x * R * (0.85 + 0.3 * n),
        Math.max(0, y * H * n),
        z * R * 0.8 * (0.85 + 0.3 * n),
      );
    }
    k.addSmooth("concrete", g, {
      x: 0,
      y: -0.02,
      z: 0,
      color,
      grime: 0.4,
      ao: [0.55, H * 0.8],
      noiseScale: 3,
    });
  }
  D("rubble", (k, r, v) => {
    const R = [0.7, 1.1, 1.6, 1.0][v % 4],
      H = [0.28, 0.45, 0.62, 0.38][v % 4];
    const brick = v === 3;
    mound(
      k,
      r,
      R,
      H,
      brick ? 0x6a5a4c : RUBBLE_C[(r() * RUBBLE_C.length) | 0],
      r() * 9,
      r() * 9,
    );
    // chunks on and around the mound
    const n = [7, 11, 16, 8][v % 4];
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * R * 1.05,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d * 0.8;
      const hy = Math.max(0, H * (1 - (d / R) * (d / R))) * 0.85;
      const sz = 0.12 + r() * (v >= 2 ? 0.45 : 0.3);
      const co = {
        ry: r() * 3,
        rx: (r() - 0.5) * 0.8,
        rz: (r() - 0.5) * 0.8,
        bevel: 0.03,
        color: RUBBLE_C[(r() * RUBBLE_C.length) | 0],
        grime: 0.35,
      };
      // only the big lumps get chamfered edges; small ones are plain boxes (12 tris)
      if (sz > 0.3)
        k.cbox(
          "concrete",
          sz * (1 + r()),
          sz * (0.4 + r() * 0.5),
          sz * (0.8 + r() * 0.6),
          x,
          hy + sz * 0.2,
          z,
          co,
        );
      else
        k.box(
          "concrete",
          sz * (1 + r()),
          sz * (0.4 + r() * 0.5),
          sz * (0.8 + r() * 0.6),
          x,
          hy + sz * 0.2,
          z,
          co,
        );
    }
    // bricks (loose and still-mortared clumps)
    for (let i = 0, nb = brick ? 14 : 4 + v; i < nb; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * R * 1.15,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d * 0.8;
      const hy = Math.max(0, H * (1 - (d / R) * (d / R))) * 0.9;
      k.box("concrete", 0.2, 0.06, 0.1, x, hy + 0.03, z, {
        ry: r() * 3,
        rx: (r() - 0.5) * 0.6,
        rz: (r() - 0.5) * 0.6,
        color: BRICK_C[(r() * BRICK_C.length) | 0],
        grime: 0.3,
      });
    }
    // a broken floor slab tilted into the heap, rebar sticking out
    if (v >= 1) {
      const sw = 0.9 + r() * 0.8,
        sa = r() * X.TAU;
      k.box(
        "concrete",
        sw,
        0.12,
        0.7 + r() * 0.5,
        Math.cos(sa) * R * 0.35,
        H * 0.6,
        Math.sin(sa) * R * 0.3,
        {
          ry: sa,
          rz: 0.35 + r() * 0.3,
          color: 0x9a9486,
          grime: 0.4,
          segs: [2, 1, 1],
        },
      );
    }
    for (let i = 0, nr = 2 + v; i < nr; i++) {
      const a = r() * X.TAU,
        d = r() * R * 0.6,
        x = Math.cos(a) * d,
        z = Math.sin(a) * d * 0.8;
      const y0 = H * 0.6,
        len = 0.5 + r() * 0.9;
      k.seg(
        "rust",
        [x, y0, z],
        [
          x + (r() - 0.5) * len,
          y0 + 0.25 + r() * len * 0.6,
          z + (r() - 0.5) * len,
        ],
        0.011,
        { color: 0xb09080, seg: 4 },
      );
      if (r() < 0.5)
        k.seg(
          "rust",
          [x, y0 + 0.2, z],
          [x + (r() - 0.5) * 0.5, y0 + 0.5 + r() * 0.3, z + (r() - 0.5) * 0.5],
          0.009,
          { color: 0xb09080, seg: 4 },
        );
    }
    // snapped timber / a bit of window frame
    if (r() < 0.6)
      k.box(
        "wood",
        1.0 + r() * 0.8,
        0.1,
        0.12,
        (r() - 0.5) * R,
        H * 0.5,
        (r() - 0.5) * R * 0.6,
        { ry: r() * 3, rz: (r() - 0.5) * 0.5, color: 0x5a4a38, grime: 0.5 },
      );
    // dust fan on the ground
    k.cyl("concrete", R * 1.35, R * 1.45, 0.02, 0, 0.01, 0, {
      seg: 12,
      color: brick ? 0x6a584a : 0x8a8476,
      grime: 0.5,
      s: [1, 1, 0.8],
      ao: [1, 1],
    });
    if (v === 2) k.meta.collider = { w: R * 1.3, d: R * 1.0, h: 0.42 };
    k.meta.surface = "concrete";
    k.meta.tier = v === 2 ? "medium" : "small";
  });

  // ---------------- tires ----------------
  D("tire", (k, r, v) => {
    const t = { color: C.rubber, grime: 0.25, rseg: 7, tseg: 14 };
    if (v === 0) {
      k.torus("plain", 0.3, 0.12, 0, 0.12, 0, Object.assign({ rx: PI / 2 }, t));
      k.cyl("metal", 0.2, 0.2, 0.1, 0, 0.12, 0, {
        seg: 10,
        color: 0x5a5a52,
        rust: 0.7,
      });
    } else if (v === 1) {
      // stack
      const n = 3 + ((r() * 3) | 0);
      for (let i = 0; i < n; i++)
        k.torus(
          "plain",
          0.3,
          0.12,
          (r() - 0.5) * 0.08,
          0.12 + i * 0.22,
          (r() - 0.5) * 0.08,
          Object.assign({ rx: PI / 2 }, t),
        );
      k.meta.collider = { w: 0.8, d: 0.8, h: n * 0.22 };
    } else {
      // leaning tire
      k.torus(
        "plain",
        0.33,
        0.12,
        0,
        0.4,
        0,
        Object.assign({ rx: 0.25, ry: r() * 3 }, t),
      );
    }
    k.meta.tier = "small";
  });

  // ---------------- oil drums ----------------
  // variants: 0 rusty, 1 radioactive (glowing leak), 2 red flammable, 3 burning (hobo barrel), 4 blue chem, 5 tipped rusty
  D("barrel", (k, r, v) => {
    const cols = [0x6a5a48, 0xc8a020, 0xa81a14, 0x4a4238, 0x2a4a7a, 0x6a5a48];
    const tipped = v === 5 || (v === 1 && r() < 0.3);
    const kk = tipped ? new X.Kit(33) : k;
    const o = {
      color: cols[v],
      rust: v === 3 ? 0.85 : 0.45 + r() * 0.3,
      flat: false,
    };
    kk.cyl(
      "metal",
      0.29,
      0.29,
      0.88,
      0,
      0.44,
      0,
      Object.assign({ seg: 14, open: v === 3 }, o),
    );
    for (const y of [0.3, 0.6])
      kk.torus(
        "metal",
        0.295,
        0.018,
        0,
        y,
        0,
        Object.assign({ rx: PI / 2, tseg: 14, rseg: 3 }, o),
      );
    kk.torus(
      "metal",
      0.285,
      0.02,
      0,
      0.875,
      0,
      Object.assign({ rx: PI / 2, tseg: 14, rseg: 3 }, o),
    );
    if (v !== 3)
      kk.cyl(
        "metal",
        0.27,
        0.27,
        0.02,
        0,
        0.87,
        0,
        Object.assign({ seg: 14 }, o),
      );
    else {
      kk.cyl(
        "metal",
        0.27,
        0.27,
        0.02,
        0,
        0.1,
        0,
        Object.assign({ seg: 14 }, o),
      );
      kk.box("wood", 0.4, 0.06, 0.06, 0.05, 0.84, 0.03, {
        rz: 0.4,
        color: 0x2a1a10,
      });
    }
    if (v === 1) kk.quad("rad_label", 0.32, 0.32, 0, 0.45, -0.292, { ry: PI });
    if (v === 2) kk.quad("flam_label", 0.32, 0.32, 0, 0.45, -0.292, { ry: PI });
    if (v === 3)
      for (let i = 0; i < 5; i++) {
        const a = r() * X.TAU;
        kk.cyl(
          "glow",
          0.03,
          0.03,
          0.02,
          Math.cos(a) * 0.29,
          0.2 + r() * 0.4,
          Math.sin(a) * 0.29,
          { rz: PI / 2, ry: -a, seg: 5, color: 0xff7a2a },
        );
      }
    if (tipped) k.include(kk, { y: 0.29, rx: PI / 2, ry: r() * 6 });
    if (v === 1) {
      // glowing green sludge puddle
      k.cyl(
        "glow",
        0.35 + r() * 0.3,
        0.4 + r() * 0.3,
        0.015,
        tipped ? 0.6 : 0.3,
        0.008,
        tipped ? 0.2 : -0.35,
        { seg: 12, color: 0x46c81e, s: [1, 1, 0.7], grime: 0.5, noiseScale: 6 },
      );
      k.meta.glows = [
        { x: 0.3, y: 0.25, z: -0.3, color: 0x50e028, size: 2.4, flicker: 0 },
      ];
      k.meta.radiation = { y: 0.5, radius: 5, strength: 3.5 };
    }
    if (v === 3) {
      k.meta.fires = [{ x: 0, y: 0.8, z: 0, scale: 0.75 }];
      k.meta.glows = [
        { x: 0, y: 1.1, z: 0, color: 0xff8a3a, size: 5, flicker: 0.25 },
      ];
    }
    if (v === 2) k.meta.explosive = { hp: 18, radius: 4.5, damage: 70 };
    k.meta.collider = tipped
      ? { w: 0.9, d: 0.6, h: 0.58 }
      : { w: 0.6, d: 0.6, h: 0.9 };
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ---------------- sandbags ----------------
  function sandbag(k, r, x, y, z, ry) {
    k.sphere("fabric", 0.32, x, y + 0.1, z, {
      s: [1, 0.34, 0.58],
      ry: ry + (r() - 0.5) * 0.15,
      color: [0xa89870, 0x9a8a62, 0x8a7c58][(r() * 3) | 0],
      wseg: 8,
      hseg: 5,
      grime: 0.25,
    });
  }
  // variant 0: straight 2 m x 3 rows, 1: curved quarter-circle, 2: low 2 rows, 3: tall 4 rows (bunker)
  D("sandbags", (k, r, v) => {
    const rows = v === 2 ? 3 : v === 3 ? 6 : 4;
    if (v === 1) {
      const R = 1.6;
      for (let row = 0; row < rows; row++)
        for (let i = 0; i < 6; i++) {
          const a = ((i + (row % 2) * 0.5) / 6) * (PI / 2);
          sandbag(
            k,
            r,
            Math.cos(a) * R - R / 2,
            row * 0.17,
            -Math.sin(a) * R + R / 2,
            -a + PI / 2,
          );
        }
      k.meta.collider = { w: 1.8, d: 1.8, h: rows * 0.17 + 0.1 };
    } else {
      for (let row = 0; row < rows; row++)
        for (let i = 0; i < 4; i++)
          sandbag(
            k,
            r,
            -0.75 + i * 0.52 - (row % 2) * 0.26 + 0.13,
            row * 0.19,
            (r() - 0.5) * 0.04,
            0,
          );
      for (let row = 0; row < Math.min(2, rows - 1); row++)
        for (let i = 0; i < 4; i++)
          sandbag(
            k,
            r,
            -0.75 + i * 0.52 - (row % 2) * 0.26 + 0.13,
            row * 0.19,
            0.32,
            0,
          );
      k.meta.collider = { w: 2.1, d: 0.75, h: rows * 0.19 + 0.1, cz: 0.12 };
    }
    k.meta.surface = "dirt";
    k.meta.tier = "medium";
  });

  // ---------------- jersey barrier ----------------
  const JERSEY = [
    [-0.3, 0],
    [0.3, 0],
    [0.3, 0.08],
    [0.2, 0.33],
    [0.1, 0.81],
    [-0.1, 0.81],
    [-0.2, 0.33],
    [-0.3, 0.08],
  ];
  D("jersey_barrier", (k, r, v) => {
    const L = 3;
    k.extrude("concrete", JERSEY, L, {
      ry: PI / 2,
      color: v === 1 ? 0xd8c8a0 : 0xbab4a6,
      grime: 0.3,
      uvScale: 0.8,
    });
    // chipped corners, rebar
    if (r() < 0.6)
      k.seg("rust", [L / 2 - 0.05, 0.4, 0], [L / 2 + 0.15, 0.55, 0.05], 0.012, {
        color: 0xffffff,
      });
    if (v === 1) {
      // orange-striped construction barrier
      for (let i = 0; i < 3; i++)
        k.box("plain", 0.3, 0.12, 0.62, -L / 2 + 0.5 + i * 1, 0.55, 0, {
          rz: 0.6,
          color: 0xc86a1a,
          s: [1, 1, 0.6],
          ao: [1, 1],
        });
    }
    if (v === 2)
      k.quad(
        "graffiti_" + ((r() * X.GRAFFITI) | 0),
        2.6,
        0.55,
        0,
        0.42,
        -0.24,
        { ry: PI, rx: 0.12, color: 0xffffff },
      );
    k.meta.collider = { w: L, d: 0.6, h: 0.82 };
    k.meta.tier = "medium";
  });

  // ---------------- police sawhorse / wooden barricade ----------------
  D("sawhorse", (k, r, v) => {
    const L = 2.2;
    for (const sx of [-1, 1]) {
      k.seg("wood", [sx * L * 0.42, 0, -0.35], [sx * L * 0.42, 1.0, 0], 0.04, {
        color: 0x8a8070,
      });
      k.seg("wood", [sx * L * 0.42, 0, 0.35], [sx * L * 0.42, 1.0, 0], 0.04, {
        color: 0x8a8070,
      });
    }
    // striped boards (orange/white or blue "POLICE LINE")
    const n = v === 1 ? 2 : 1;
    for (let i = 0; i < n; i++) {
      k.box("wood", L, 0.22, 0.04, 0, 0.9 - i * 0.35, -0.02, {
        color: 0xffffff,
        colorFn:
          v === 2
            ? () => 0x2a3a7a
            : (x) => (Math.floor((x + 5) * 2.5) % 2 ? 0xd8d0c0 : 0xc85a1a),
        rz: v === 2 ? 0 : (r() - 0.5) * 0.1,
      });
    }
    if (v === 2) k.quad("police_door", 1.2, 0.22, 0, 0.9, -0.05, { ry: PI });
    k.meta.collider = { w: L, d: 0.6, h: 1.0 };
    k.meta.tier = "small";
  });
  D("traffic_cone", (k, r, v) => {
    const tipped = v === 1;
    const kk = tipped ? new X.Kit(41) : k;
    kk.box("plain", 0.38, 0.03, 0.38, 0, 0.015, 0, { color: 0x2a2a2a });
    kk.cyl("plain", 0.03, 0.15, 0.68, 0, 0.36, 0, {
      seg: 10,
      color: 0xd8601a,
      colorFn: (x, y) => (y > 0.38 && y < 0.5 ? 0xe8e0d0 : 0xc8581a),
    });
    if (tipped) k.include(kk, { y: 0.15, rx: PI / 2 - 0.2, ry: r() * 6 });
    k.meta.tier = "small";
  });

  // ---------------- raider scrap wall & skull pikes ----------------
  D("raider_wall", (k, r, v) => {
    const W = 3.6,
      H = 2.4 + r() * 0.6;
    // posts
    for (const px of [-W / 2, 0, W / 2])
      k.seg(
        "wood",
        [px, 0, 0.1],
        [px + (r() - 0.5) * 0.2, H + 0.3, 0.1],
        0.08,
        { color: 0x5a4a38 },
      );
    // corrugated sheets + car doors + plywood
    let x = -W / 2;
    while (x < W / 2 - 0.1) {
      const w = 0.7 + r() * 0.7,
        h = H * (0.7 + r() * 0.35);
      const pick = r();
      const cx = Math.min(W / 2, x + w / 2);
      if (pick < 0.55)
        k.box("rust", w, h, 0.04, cx, h / 2 + 0.05, 0, {
          rz: (r() - 0.5) * 0.08,
          segs: [4, 1, 1],
          color: [0xffffff, 0xd8c8b8, 0xc0b0a0][(r() * 3) | 0],
          uvScale: 0.7,
        });
      else if (pick < 0.8)
        k.box("wood", w, h, 0.05, cx, h / 2 + 0.05, -0.03, {
          rz: (r() - 0.5) * 0.1,
          color: 0x8a7a60,
        });
      else
        k.cbox("paint", w, h * 0.5, 0.08, cx, h * 0.3, -0.04, {
          bevel: 0.05,
          color: [0x6a8a8a, 0xb08a6a, 0x8a4a3a][(r() * 3) | 0],
          rust: 0.6,
        }); // car door / hood
      x += w * 0.85;
    }
    // top spikes & barbed wire
    for (let i = 0; i < 7; i++) {
      const sx = -W / 2 + ((i + 0.5) * W) / 7;
      k.seg(
        "metal",
        [sx, H * 0.9, -0.02],
        [sx + (r() - 0.5) * 0.3, H + 0.35 + r() * 0.3, -0.05],
        0.02,
        { r2: 0.002, color: 0x5a5048, rust: 0.8 },
      );
    }
    for (let i = 0; i < 10; i++)
      k.torus("metal", 0.18, 0.006, -W / 2 + ((i + 0.5) * W) / 10, H + 0.1, 0, {
        ry: PI / 2 + 0.3,
        color: 0x5a5a52,
        rust: 0.6,
        tseg: 8,
        rseg: 3,
      });
    // painted warning / graffiti
    if (r() < 0.5)
      k.quad("sign_keepout", 0.8, 0.6, (r() - 0.5) * 1.5, 1.5, -0.08, {
        ry: PI,
        rz: (r() - 0.5) * 0.2,
      });
    else
      k.quad("graffiti_" + ((r() * X.GRAFFITI) | 0), 2.2, 1.1, 0, 1.2, -0.07, {
        ry: PI,
      });
    // tire at the base
    if (r() < 0.6)
      k.torus("plain", 0.3, 0.12, (r() - 0.5) * 2, 0.35, -0.3, {
        rx: 0.2,
        color: C.rubber,
        rseg: 6,
        tseg: 12,
      });
    k.meta.collider = { w: W + 0.2, d: 0.35, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });
  function skull(k, x, y, z, s, o) {
    o = o || {};
    const bone = { color: C.bone, grime: 0.35, wseg: 8, hseg: 6 };
    k.sphere(
      "plain",
      0.1 * s,
      x,
      y + 0.02 * s,
      z,
      Object.assign({ s: [0.9, 1, 1.12], ry: o.ry || 0, rx: o.rx || 0 }, bone),
    );
    k.box(
      "plain",
      0.12 * s,
      0.05 * s,
      0.1 * s,
      x,
      y - 0.07 * s,
      z - 0.04 * s,
      Object.assign({ ry: o.ry || 0 }, bone),
    );
    // eye sockets (dark)
    const fy = Math.cos(o.ry || 0),
      fx = Math.sin(o.ry || 0);
    for (const s2 of [-1, 1])
      k.sphere(
        "plain",
        0.025 * s,
        x - fx * 0.09 * s + fy * s2 * 0.035 * s,
        y + 0.01 * s,
        z - fy * 0.09 * s - fx * s2 * 0.035 * s,
        { color: 0x1a1410, wseg: 5, hseg: 4 },
      );
  }
  X.skull = skull;
  D("skull_pike", (k, r, v) => {
    k.seg(
      "wood",
      [0, 0, 0],
      [(r() - 0.5) * 0.2, 2.1, (r() - 0.5) * 0.2],
      0.035,
      { color: 0x5a4a38 },
    );
    skull(k, 0, 2.15, 0, 1.1, { ry: PI + (r() - 0.5) });
    if (r() < 0.6)
      k.box("fabric", 0.3, 0.6, 0.01, 0.05, 1.6, 0.05, {
        rz: 0.1,
        color: 0x6a5a48,
      }); // tattered rag
    k.meta.tier = "small";
  });
  // Brute "meat bag" hanging from a chain on a pole
  D("gore_bag", (k, r) => {
    k.seg("metal", [0, 0, 0], [0, 3.2, 0], 0.06, {
      color: 0x4a4038,
      rust: 0.8,
    });
    k.seg("metal", [0, 3.1, 0], [0, 3.1, -1.1], 0.04, {
      color: 0x4a4038,
      rust: 0.8,
    });
    for (let i = 0; i < 6; i++)
      k.torus("metal", 0.04, 0.008, 0, 3.05 - i * 0.07, -1.05, {
        ry: i % 2 ? PI / 2 : 0,
        color: 0x3a3430,
        rust: 0.8,
        tseg: 6,
        rseg: 3,
      });
    k.sphere("fabric", 0.35, 0, 2.2, -1.05, {
      s: [0.85, 1.4, 0.85],
      color: 0x6a3a28,
      wseg: 8,
      hseg: 7,
      grime: 0.5,
    });
    k.sphere("plain", 0.2, 0.08, 1.8, -1.05, {
      color: 0x5a1a14,
      wseg: 6,
      hseg: 5,
    });
    k.cyl("glow", 0.35, 0.35, 0.005, 0, 0.005, -1.05, {
      seg: 10,
      color: 0x3a0a08,
    }); // dark stain on ground
    k.meta.tier = "small";
  });

  // ---------------- shopping cart ----------------
  D("shopping_cart", (k, r, v) => {
    const kk = v === 1 ? new X.Kit(51) : k;
    const m = { color: 0x8a8a84, rust: 0.4 };
    // wire basket: chain-textured panels
    kk.box("chain", 0.9, 0.45, 0.02, 0, 0.72, -0.28, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.9, 0.45, 0.02, 0, 0.72, 0.28, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.02, 0.45, 0.56, -0.45, 0.72, 0, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.02, 0.45, 0.56, 0.45, 0.72, 0, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.box("chain", 0.9, 0.02, 0.56, 0, 0.5, 0, {
      color: 0xa0a098,
      uvScale: 3,
    });
    kk.seg("metal", [0.45, 0.95, -0.3], [0.62, 1.05, -0.3], 0.015, m);
    kk.seg("metal", [0.45, 0.95, 0.3], [0.62, 1.05, 0.3], 0.015, m);
    kk.seg("metal", [0.62, 1.05, -0.3], [0.62, 1.05, 0.3], 0.02, {
      color: 0xa02a1a,
    });
    for (const sx of [-0.38, 0.38])
      for (const sz of [-0.24, 0.24]) {
        kk.seg("metal", [sx, 0.5, sz], [sx, 0.08, sz], 0.012, m);
        kk.cyl("plain", 0.06, 0.06, 0.03, sx, 0.06, sz, {
          rx: PI / 2,
          seg: 8,
          color: 0x222222,
        });
      }
    // junk inside
    if (r() < 0.7) {
      kk.boxB("wood", 0.4, 0.3, 0.3, -0.1, 0.52, 0, {
        color: 0x8a7050,
        ry: r(),
      });
      kk.sphere("fabric", 0.18, 0.2, 0.7, 0.05, {
        color: 0x3a3a34,
        s: [1, 0.7, 1],
      });
    }
    if (v === 1) k.include(kk, { y: 0.3, x: 0.2, rz: PI / 2 - 0.1 });
    k.meta.tier = "small";
  });

  // ---------------- crates ----------------
  const CRATE_REG = [
    "crate_fizzo",
    "crate_teletype",
    "crate_army",
    "crate_longwinter",
    "crate_plain",
  ];
  const CRATE_SIZE = [
    [0.62, 0.45, 0.45],
    [0.8, 0.8, 0.8],
    [1.2, 0.45, 0.5],
    [0.9, 0.7, 0.7],
    [1.0, 1.0, 1.0],
  ];
  function crate(k, r, v, x, y, z, ry, s) {
    s = s || 1;
    const d = CRATE_SIZE[v % 5];
    k.abox(
      CRATE_REG[v % 5],
      d[0] * s,
      d[1] * s,
      d[2] * s,
      x,
      y + (d[1] * s) / 2,
      z,
      { ry, color: 0xffffff, grime: 0.15, ao: [0.75, 0.4] },
    );
    return d[1] * s;
  }
  X.crate = crate;
  D("crate", (k, r, v) => {
    crate(k, r, v, 0, 0, 0, 0);
    const d = CRATE_SIZE[v % 5];
    k.meta.collider = { w: d[0], d: d[2], h: d[1] };
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });
  D("crate_stack", (k, r, v) => {
    const n = 3 + v;
    let placed = 0;
    for (let i = 0; i < n; i++) {
      const cv = (r() * 5) | 0;
      const layer = i < 3 ? 0 : 1;
      const h = layer ? 0.8 : 0;
      crate(
        k,
        r,
        cv,
        -0.9 + (i % 3) * 0.95 + (r() - 0.5) * 0.1,
        layer ? h : 0,
        (r() - 0.5) * 0.2,
        (r() - 0.5) * 0.3,
        layer ? 0.8 : 1,
      );
      placed++;
    }
    k.meta.collider = { w: 2.8, d: 1.0, h: 1.4 };
    k.meta.surface = "wood";
    k.meta.tier = "medium";
  });

  // ---------------- pallets ----------------
  function pallet(k, r, x, y, z, ry) {
    const w = { color: 0x9a8260 };
    const P = new X.Kit(61);
    for (const sz of [-0.45, 0, 0.45])
      P.box("wood", 1.2, 0.09, 0.1, 0, 0.045, sz, w);
    for (let i = 0; i < 7; i++)
      if (r() > 0.1)
        P.box("wood", 0.12, 0.025, 1.0, -0.55 + i * 0.183, 0.1, 0, w);
    k.include(P, { x, y, z, ry });
  }
  D("pallet", (k, r, v) => {
    const n = v === 0 ? 1 : 3 + ((r() * 4) | 0);
    for (let i = 0; i < n; i++)
      pallet(
        k,
        r,
        (r() - 0.5) * 0.1,
        i * 0.115,
        (r() - 0.5) * 0.1,
        (r() - 0.5) * 0.12,
      );
    if (v === 2) pallet(k, r, 0.3, 0.55, 0.1, 0.3); // leaning
    k.meta.collider = n > 1 ? { w: 1.2, d: 1.0, h: n * 0.115 } : null;
    k.meta.tier = "small";
  });

  // ---------------- chain-link fence ----------------
  D("chainlink", (k, r, v) => {
    const L = 3,
      H = 2.2,
      steel = { color: 0x8a8a84, rust: 0.45 };
    for (const px of [-L / 2, L / 2])
      k.cyl(
        "metal",
        0.035,
        0.035,
        H + 0.1,
        px,
        (H + 0.1) / 2,
        0,
        Object.assign({ seg: 6 }, steel),
      );
    k.seg("metal", [-L / 2, H, 0], [L / 2, H, 0], 0.025, steel);
    const sag = v === 2 ? 0.6 : 0;
    k.box("chain", L, H - 0.1 - sag, 0.01, 0, (H - sag) / 2 + 0.05, 0, {
      color: 0xa8a8a0,
      uvScale: 2,
      rx: sag ? 0.25 : 0,
    });
    if (v === 1)
      for (let i = 0; i < 12; i++)
        k.torus(
          "metal",
          0.14,
          0.006,
          -L / 2 + ((i + 0.5) * L) / 12,
          H + 0.18,
          0,
          { ry: PI / 2 + 0.3, color: 0x6a6a62, rust: 0.5, tseg: 8, rseg: 3 },
        );
    k.meta.collider = { w: L, d: 0.12, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });

  // ---------------- A-frame sidewalk board ----------------
  D("sandwich_board", (k, r, v) => {
    const reg = "board_" + (v % 2);
    for (const s of [-1, 1]) {
      k.box("wood", 0.62, 0.95, 0.03, 0, 0.47, s * 0.13, {
        rx: s * 0.2,
        color: 0x6a5038,
      });
      k.quad(reg, 0.52, 0.82, 0, 0.5, s * 0.15, {
        rx: s * 0.2,
        ry: s > 0 ? 0 : PI,
      });
    }
    k.meta.tier = "small";
  });

  // ---------------- debris pile ----------------
  D("debris", (k, r, v) => {
    // concrete chunks, planks, pipes, a hub cap, bricks
    for (let i = 0; i < 6 + v * 3; i++) {
      const a = r() * X.TAU,
        d = r() * (0.8 + v * 0.5);
      const t = r();
      if (t < 0.4)
        k.cbox(
          "concrete",
          0.2 + r() * 0.5,
          0.12 + r() * 0.3,
          0.2 + r() * 0.4,
          Math.cos(a) * d,
          0.1,
          Math.sin(a) * d,
          {
            ry: r() * 3,
            rx: (r() - 0.5) * 0.5,
            bevel: 0.04,
            color: [0xb0aa9c, 0x9a948a, 0x8a5a44][(r() * 3) | 0],
          },
        );
      else if (t < 0.65)
        k.box(
          "wood",
          0.8 + r() * 1.2,
          0.04,
          0.14,
          Math.cos(a) * d,
          0.05 + r() * 0.2,
          Math.sin(a) * d,
          { ry: r() * 3, rz: (r() - 0.5) * 0.4, color: 0x7a6a50 },
        );
      else if (t < 0.85)
        k.seg(
          "rust",
          [Math.cos(a) * d, 0.05, Math.sin(a) * d],
          [
            Math.cos(a) * d + (r() - 0.5) * 2,
            0.05 + r() * 0.4,
            Math.sin(a) * d + (r() - 0.5) * 2,
          ],
          0.03 + r() * 0.03,
          { color: 0xffffff, seg: 6 },
        );
      else
        k.boxB(
          "concrete",
          0.2,
          0.06,
          0.1,
          Math.cos(a) * d,
          0,
          Math.sin(a) * d,
          { ry: r() * 3, color: 0x8a4a34 },
        );
    }
    k.meta.tier = "small";
  });

  // ---------------- shipping container (Brooklyn docks) ----------------
  D("shipping_container", (k, r, v) => {
    const L = 6.1,
      W = 2.44,
      H = 2.6;
    const cols = [0x2a5a7a, 0x8a3a2a, 0xa01418, 0xc86a20];
    const o = { color: cols[v % 4], rust: 0.45 + r() * 0.3 };
    k.boxB("paint", L, H, W, 0, 0, 0, o);
    // corrugation ribs on the long sides
    for (let i = 0; i < 22; i++)
      for (const s of [-1, 1])
        k.box(
          "paint",
          0.1,
          H - 0.2,
          0.04,
          -L / 2 + 0.2 + (i * (L - 0.4)) / 21,
          H / 2,
          s * (W / 2 + 0.02),
          o,
        );
    // corner castings & frame
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "metal",
          0.18,
          H,
          0.18,
          sx * (L / 2 - 0.09),
          0,
          sz * (W / 2 - 0.09),
          { color: 0x3a3a34, rust: 0.5 },
        );
    // livery on both sides
    k.quad(
      "container_" + (v % 4),
      L * 0.6,
      H * 0.6,
      0.3,
      H * 0.55,
      -(W / 2 + 0.05),
      { ry: PI },
    );
    k.quad(
      "container_" + (v % 4),
      L * 0.6,
      H * 0.6,
      -0.3,
      H * 0.55,
      W / 2 + 0.05,
      {},
    );
    // doors + locking bars at the +x end
    for (let i = 0; i < 4; i++)
      k.seg(
        "metal",
        [L / 2 + 0.03, 0.1, -0.9 + i * 0.6],
        [L / 2 + 0.03, H - 0.1, -0.9 + i * 0.6],
        0.02,
        { color: 0x5a5a52, rust: 0.6 },
      );
    k.meta.collider = { w: L, d: W, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "large";
  });

  // ---------------- dumpster ----------------
  D("dumpster", (k, r, v) => {
    const cols = [0x2e4a32, 0x3a4a6a, 0x6a5a2a];
    const o = { color: cols[v % 3], rust: 0.5 + r() * 0.3 };
    // trapezoid body: wider at the top toward the front (-z)
    k.loft(
      "metal",
      [
        { z: -0.8, wb: 0.95, wt: 0.95, yb: 0.12, yt: 1.2, n: 12 },
        { z: 0.75, wb: 0.95, wt: 0.95, yb: 0.12, yt: 1.2, n: 12 },
      ],
      Object.assign({ seg: 12 }, o),
    );
    k.box("metal", 1.94, 0.08, 0.12, 0, 1.2, -0.84, o); // lip
    // lids: one closed (plastic), one flipped open
    k.box("plain", 0.95, 0.05, 1.6, -0.48, 1.26, -0.02, {
      color: 0x1a1a1a,
      rz: 0.03,
    });
    if (v !== 1)
      k.box("plain", 0.95, 1.6, 0.05, 0.48, 2.02, 0.78, {
        color: 0x1a1a1a,
        rx: 0.18,
      });
    else
      k.box("plain", 0.95, 0.05, 1.6, 0.48, 1.26, -0.02, { color: 0x1a1a1a });
    // side fork pockets, wheels
    for (const s of [-1, 1])
      k.box("metal", 0.1, 0.18, 1.5, s * 1.0, 0.75, 0, o);
    for (const sx of [-0.8, 0.8])
      for (const sz of [-0.6, 0.6])
        k.cyl("plain", 0.07, 0.07, 0.05, sx, 0.07, sz, {
          rz: PI / 2,
          seg: 8,
          color: 0x1a1a1a,
        });
    // overflowing trash
    for (let i = 0; i < 3; i++)
      k.sphere("fabric", 0.3, (r() - 0.2) * 0.8, 1.25, (r() - 0.5) * 0.9, {
        s: [1, 0.55, 1],
        color: 0x22221e,
        wseg: 7,
        hseg: 5,
      });
    k.meta.collider = { w: 2.0, d: 1.65, h: 1.3 };
    k.meta.container = { name: "Dumpster", loot: "dumpster" };
    k.meta.surface = "metal";
    k.meta.tier = "medium";
  });

  // ---------------- mattress ----------------
  D("mattress", (k, r, v) => {
    const kk = v === 1 ? new X.Kit(71) : k;
    kk.cbox("fabric", 1.0, 0.2, 1.95, 0, 0.1, 0, {
      bevel: 0.07,
      color: 0xc8bca0,
      grime: 0.45,
      colorFn: (x, y, z) =>
        X.noise3(x * 3, 0, z * 3) > 0.62 ? 0x8a6a40 : 0xc8bca0,
    });
    if (v === 1) k.include(kk, { y: 0.95, z: 0.3, rx: -1.35 }); // leaning against a wall
    k.meta.tier = "small";
  });

  // ---------------- baby pram (a classic of the Ruins) ----------------
  D("pram", (k, r, v) => {
    const o = {
      color: [0x2a3a5a, 0x5a2a2a, 0x3a3a3a][(r() * 3) | 0],
      rust: 0.3,
    };
    const kk = v === 1 ? new X.Kit(81) : k;
    kk.sphere(
      "paint",
      0.42,
      0,
      0.62,
      0,
      Object.assign(
        {
          s: [0.55, 0.55, 1],
          phiStart: PI / 2,
          phiLength: PI / 2,
          wseg: 12,
          hseg: 5,
        },
        o,
      ),
    );
    kk.sphere(
      "fabric",
      0.4,
      0,
      0.65,
      0.18,
      Object.assign(
        {
          s: [0.55, 0.8, 0.6],
          phiLength: PI / 2,
          wseg: 10,
          hseg: 4,
          thetaStart: 0,
        },
        { color: 0x2a2a2a },
      ),
    );
    for (const sx of [-0.25, 0.25])
      for (const sz of [-0.3, 0.3]) {
        kk.torus("plain", 0.14, 0.02, sx, 0.15, sz, {
          ry: PI / 2,
          color: 0x1a1a1a,
          tseg: 12,
          rseg: 4,
        });
        kk.seg("metal", [sx, 0.15, sz], [sx * 0.8, 0.45, sz * 0.6], 0.012, {
          color: 0x8a8a84,
        });
      }
    kk.seg("metal", [0, 0.6, -0.4], [0, 1.0, -0.65], 0.015, {
      color: 0x8a8a84,
    });
    kk.seg("metal", [-0.2, 1.0, -0.65], [0.2, 1.0, -0.65], 0.015, {
      color: 0x8a8a84,
    });
    if (v === 1) k.include(kk, { y: 0.2, rz: PI / 2 - 0.2 });
    k.meta.tier = "small";
  });

  // ---------------- luggage (evacuation debris) ----------------
  D("luggage", (k, r, v) => {
    const n = 2 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const w = 0.5 + r() * 0.3,
        h = 0.18 + r() * 0.1,
        d = 0.35 + r() * 0.15;
      const col = [0x6a4a2a, 0x3a3a5a, 0x5a1a1a, 0xa89878, 0x2a4a3a][
        (r() * 5) | 0
      ];
      k.cbox(
        "fabric",
        w,
        h,
        d,
        (r() - 0.5) * 0.9,
        h / 2 + (i > 2 ? 0.25 : 0),
        (r() - 0.5) * 0.7,
        { ry: r() * 3, bevel: 0.03, color: col },
      );
    }
    if (r() < 0.5)
      k.cbox("fabric", 0.4, 0.5, 0.2, 0.6, 0.25, 0.3, {
        ry: 0.5,
        rz: 0.3,
        bevel: 0.04,
        color: 0x8a6a4a,
      });
    k.meta.tier = "small";
  });

  // =====================================================================
  // SKELETONS — posed from a joint table so the same builder produces
  // lying, sitting, slumped, curled, reaching and child skeletons.
  // Joint positions are in skeleton-local metres (y up, -z = facing).
  // =====================================================================
  const POSES = {
    // on its back, arms at sides, head toward -z
    lying: {
      head: [0, 0.1, -0.78],
      neck: [0, 0.08, -0.62],
      chest: [0, 0.12, -0.38],
      pelvis: [0, 0.1, 0.05],
      lSh: [-0.2, 0.1, -0.52],
      lEl: [-0.26, 0.06, -0.24],
      lHa: [-0.28, 0.05, 0.02],
      rSh: [0.2, 0.1, -0.52],
      rEl: [0.28, 0.06, -0.25],
      rHa: [0.35, 0.05, -0.05],
      lHi: [-0.12, 0.09, 0.08],
      lKn: [-0.16, 0.07, 0.5],
      lFo: [-0.2, 0.06, 0.92],
      rHi: [0.12, 0.09, 0.08],
      rKn: [0.2, 0.07, 0.48],
      rFo: [0.3, 0.05, 0.9],
    },
    // sitting against a wall at +z, legs forward toward -z, head slumped
    sitting: {
      head: [0.05, 0.78, -0.02],
      neck: [0.02, 0.7, 0.1],
      chest: [0, 0.52, 0.14],
      pelvis: [0, 0.12, 0.12],
      lSh: [-0.2, 0.62, 0.14],
      lEl: [-0.28, 0.35, 0.05],
      lHa: [-0.25, 0.1, -0.2],
      rSh: [0.2, 0.62, 0.14],
      rEl: [0.3, 0.35, 0.02],
      rHa: [0.2, 0.2, -0.15],
      lHi: [-0.12, 0.1, 0.08],
      lKn: [-0.18, 0.35, -0.3],
      lFo: [-0.2, 0.05, -0.7],
      rHi: [0.12, 0.1, 0.08],
      rKn: [0.16, 0.08, -0.42],
      rFo: [0.2, 0.05, -0.85],
    },
    // face down, one arm reaching forward
    reaching: {
      head: [0, 0.11, -0.8],
      neck: [0, 0.1, -0.64],
      chest: [0, 0.13, -0.4],
      pelvis: [0, 0.12, 0.05],
      lSh: [-0.2, 0.1, -0.54],
      lEl: [-0.3, 0.07, -0.85],
      lHa: [-0.3, 0.05, -1.15],
      rSh: [0.2, 0.1, -0.54],
      rEl: [0.35, 0.07, -0.35],
      rHa: [0.3, 0.05, -0.1],
      lHi: [-0.12, 0.1, 0.08],
      lKn: [-0.2, 0.08, 0.5],
      lFo: [-0.3, 0.05, 0.9],
      rHi: [0.12, 0.1, 0.08],
      rKn: [0.15, 0.07, 0.5],
      rFo: [0.12, 0.25, 0.8],
    },
    // curled on its side (fetal)
    curled: {
      head: [-0.05, 0.18, -0.55],
      neck: [0, 0.16, -0.42],
      chest: [0.02, 0.18, -0.22],
      pelvis: [0, 0.16, 0.12],
      lSh: [-0.05, 0.28, -0.35],
      lEl: [-0.1, 0.24, -0.6],
      lHa: [-0.05, 0.14, -0.72],
      rSh: [0.05, 0.08, -0.35],
      rEl: [0.1, 0.05, -0.55],
      rHa: [0.12, 0.04, -0.7],
      lHi: [-0.04, 0.24, 0.12],
      lKn: [-0.08, 0.26, -0.28],
      lFo: [-0.04, 0.2, 0.1],
      rHi: [0.04, 0.08, 0.12],
      rKn: [0.08, 0.06, -0.26],
      rFo: [0.1, 0.05, 0.12],
    },
    // seated on a bench/chair (seat 0.45), leaning back
    seated: {
      head: [0, 1.12, 0.06],
      neck: [0, 1.02, 0.14],
      chest: [0, 0.82, 0.18],
      pelvis: [0, 0.5, 0.12],
      lSh: [-0.2, 0.94, 0.18],
      lEl: [-0.26, 0.68, 0.14],
      lHa: [-0.22, 0.5, -0.1],
      rSh: [0.2, 0.94, 0.18],
      rEl: [0.3, 0.7, 0.14],
      rHa: [0.32, 0.5, -0.05],
      lHi: [-0.12, 0.48, 0.1],
      lKn: [-0.14, 0.5, -0.32],
      lFo: [-0.16, 0.04, -0.4],
      rHi: [0.12, 0.48, 0.1],
      rKn: [0.2, 0.48, -0.3],
      rFo: [0.26, 0.04, -0.36],
    },
  };
  /** Add a skeleton to kit k. pose name, transform {x,y,z,ry, s (scale), tilt}. */
  X.buildSkeleton = function (k, pose, t) {
    t = t || {};
    const J = POSES[pose] || POSES.lying;
    const S = new X.Kit(91);
    const bone = { color: C.bone, grime: 0.4, seg: 5, ao: [0.8, 0.3] };
    const sb = (a, b, r) => S.seg("plain", J[a], J[b], r, bone);
    // skull facing along neck->head direction
    const hd = J.head,
      nk = J.neck;
    const fx = hd[0] - nk[0],
      fz = hd[2] - nk[2];
    const face = pose === "lying" ? 0 : Math.atan2(-fx, -fz);
    const skr = { color: C.bone, grime: 0.35, wseg: 8, hseg: 6 };
    if (pose === "lying") {
      S.sphere(
        "plain",
        0.1,
        hd[0],
        hd[1],
        hd[2],
        Object.assign({ s: [0.9, 1.1, 1.0] }, skr),
      );
      S.box(
        "plain",
        0.11,
        0.1,
        0.05,
        hd[0],
        hd[1] - 0.03,
        hd[2] - 0.08,
        Object.assign({}, skr),
      );
      for (const s2 of [-1, 1])
        S.sphere(
          "plain",
          0.025,
          hd[0] + s2 * 0.035,
          hd[1] + 0.08,
          hd[2] - 0.03,
          { color: 0x1a1410, wseg: 5, hseg: 4 },
        );
    } else X.skull(S, hd[0], hd[1], hd[2], 1, { ry: face });
    sb("neck", "chest", 0.022);
    sb("chest", "pelvis", 0.024);
    // ribcage: a few arcs around the chest, oriented by the spine
    const ch = J.chest,
      pv = J.pelvis;
    const sp = new THREE.Vector3(
      nk[0] - pv[0],
      nk[1] - pv[1],
      nk[2] - pv[2],
    ).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      sp,
    );
    const eul = new THREE.Euler().setFromQuaternion(q, "YXZ");
    for (let i = 0; i < 4; i++) {
      const off = (i - 1.5) * 0.06;
      S.torus(
        "plain",
        0.13 - Math.abs(i - 1.2) * 0.012,
        0.012,
        ch[0] + sp.x * off,
        ch[1] + sp.y * off,
        ch[2] + sp.z * off,
        {
          color: C.bone,
          grime: 0.35,
          s: [1, 0.75, 1],
          rx: eul.x,
          ry: eul.y,
          rz: eul.z,
          arc: PI * 1.6,
          tseg: 10,
          rseg: 3,
        },
      );
    }
    // pelvis
    S.torus("plain", 0.1, 0.03, pv[0], pv[1], pv[2], {
      color: C.bone,
      grime: 0.35,
      rx: eul.x + (PI / 2) * 0,
      ry: eul.y,
      rz: eul.z,
      s: [1.2, 0.7, 1],
      tseg: 8,
      rseg: 4,
    });
    for (const side of ["l", "r"]) {
      sb(side + "Sh", side + "El", 0.018);
      sb(side + "El", side + "Ha", 0.014);
      sb(side + "Hi", side + "Kn", 0.024);
      sb(side + "Kn", side + "Fo", 0.02);
      S.box(
        "plain",
        0.08,
        0.02,
        0.1,
        J[side + "Ha"][0],
        J[side + "Ha"][1],
        J[side + "Ha"][2],
        { color: C.bone, grime: 0.4 },
      );
      S.box(
        "plain",
        0.08,
        0.04,
        0.18,
        J[side + "Fo"][0],
        J[side + "Fo"][1],
        J[side + "Fo"][2] - 0.05,
        { color: C.bone, grime: 0.4 },
      );
    }
    sb("lSh", "rSh", 0.015);
    // rotted cloth scraps
    if (t.clothes !== false)
      S.box(
        "fabric",
        0.36,
        0.02,
        0.4,
        pv[0],
        pv[1] + 0.02,
        (pv[2] + ch[2]) / 2,
        {
          color: t.cloth || 0x4a4238,
          rx: pose === "sitting" || pose === "seated" ? -1.2 : 0,
          grime: 0.5,
        },
      );
    k.include(S, {
      x: t.x || 0,
      y: t.y || 0,
      z: t.z || 0,
      ry: t.ry || 0,
      s: t.s || 1,
    });
  };
  // skeleton prototypes: variants map to poses (+ a child-sized one)
  const SK_VARIANTS = [
    ["lying"],
    ["sitting"],
    ["reaching"],
    ["curled"],
    ["seated"],
    ["lying", 0.7],
    ["curled", 0.62],
  ];
  D("skeleton", (k, r, v) => {
    const sv = SK_VARIANTS[v % SK_VARIANTS.length];
    X.buildSkeleton(k, sv[0], {
      s: sv[1] || 1,
      cloth: [0x4a4238, 0x2a3a5a, 0x5a3a2a, 0x3a4a3a][(r() * 4) | 0],
    });
    if (sv[0] !== "seated" && r() < 0.5)
      k.cyl("glow", 0.45, 0.5, 0.004, 0, 0.004, 0, {
        seg: 10,
        color: 0x241a12,
        s: [1, 1, 1.6],
      }); // dark stain
    k.meta.tier = "small";
  });
})();
