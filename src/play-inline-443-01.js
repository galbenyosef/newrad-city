// play-inline-443 01 — color
// Lines 12-289 of readable/play-inline-443.pretty.js (statement-aligned).
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
