// play-inline-444 01 — the
// Lines 21-326 of readable/play-inline-444.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;

  const RUBBLE = [0x9a9486, 0x8a8478, 0xa8a292, 0x7a7468, 0xb4ae9c];
  const BRICK = [0x7a4a36, 0x8a5640, 0x6a3e2e, 0x93604a, 0x5e3a2c];
  const pick = (r, a) => a[(r() * a.length) | 0];

  // ------------------------------------------------------------------
  // FACADE COLLAPSE SPILL. Origin = foot of the facade; the heap spreads
  // toward -Z (the street). v0 small (5×3.4 m), v1 medium, v2 large.
  // ------------------------------------------------------------------
  const SPILL = [
    { W: 5.2, D: 3.4, H: 1.25 },
    { W: 7.2, D: 4.8, H: 1.8 },
    { W: 9.4, D: 6.2, H: 2.35 },
  ];
  X.SPILL_DIMS = SPILL;
  function spillProfile(S, u, t) {
    const across = Math.pow(
      Math.max(0, 1 - Math.pow(Math.min(1, Math.abs(u)), 2.3)),
      0.75,
    );
    return S.H * Math.pow(Math.max(0, 1 - t), 1.15) * across;
  }
  function makeSurf(S, seed) {
    // noise-displaced height at local (x,z); z in [-D, 0]
    return (x, z) => {
      const u = x / (S.W / 2),
        t = -z / S.D;
      if (Math.abs(u) > 1 || t < 0 || t > 1) return 0;
      const base = spillProfile(S, u, t);
      const n = X.noise3(x * 0.8 + seed, 0.3, z * 0.8 - seed) - 0.5;
      const n2 = X.noise3(x * 2.3 - seed, 1.7, z * 2.3 + seed) - 0.5;
      return Math.max(
        0,
        base * (1 + n * 0.45) + n2 * 0.12 * Math.min(1, base * 2),
      );
    };
  }
  function heapGeometry(S, surf, nx, nz) {
    const pos = [],
      idx = [];
    for (let j = 0; j <= nz; j++) {
      const t = j / nz;
      for (let i = 0; i <= nx; i++) {
        const u = (i / nx) * 2 - 1;
        const x = ((u * S.W) / 2) * (1 - 0.18 * t * t),
          z = -t * S.D; // slight taper toward the toe
        let y = surf(x, z);
        const edge = i === 0 || i === nx || j === nz;
        if (edge) y = -0.06;
        y -= 0.24 * t * t; // the toe runs off the kerb onto the lower roadway
        pos.push(
          x + (edge ? 0 : Math.sin(i * 7.1 + j * 3.3) * 0.08),
          y,
          z + (j === 0 || edge ? 0 : Math.cos(i * 5.3 + j * 2.9) * 0.08),
        );
      }
    }
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i,
          b = a + 1,
          c = a + nx + 1,
          d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  }
  function ibeam(k, len, x, y, z, ry, rz, o) {
    const s = new X.Kit(3);
    const co = Object.assign(
      { color: 0x4a3a2c, rust: 0.9, grime: 0.4 },
      o || {},
    );
    s.box("rust", len, 0.26, 0.022, 0, 0, 0, co);
    s.box("rust", len, 0.022, 0.15, 0, 0.13, 0, co);
    s.box("rust", len, 0.022, 0.15, 0, -0.13, 0, co);
    k.include(s, { x, y, z, ry, rz });
  }
  function fireEscape(k, r, x, y, z, ry, rx, rz) {
    const s = new X.Kit(5);
    const iron = { color: 0x24221f, rust: 0.55, grime: 0.3 };
    // landing: frame + slats + railing
    s.box("metal", 2.4, 0.05, 0.08, 0, 0, -0.45, iron);
    s.box("metal", 2.4, 0.05, 0.08, 0, 0, 0.45, iron);
    for (let i = 0; i < 9; i++)
      s.box("metal", 0.04, 0.03, 0.9, -1.15 + i * 0.29, 0.01, 0, iron);
    for (const e of [-1.18, 0, 1.18])
      s.seg(
        "metal",
        [e, 0, -0.45],
        [e + (r() - 0.5) * 0.2, 0.95, -0.45 + (r() - 0.5) * 0.1],
        0.018,
        iron,
      );
    s.seg(
      "metal",
      [-1.18, 0.95, -0.45],
      [1.18, 0.9 + r() * 0.1, -0.45],
      0.02,
      iron,
    );
    s.seg("metal", [-1.18, 0.5, -0.45], [0.6, 0.5, -0.45], 0.012, iron);
    // ladder hanging off it (bent)
    const lx = 0.8;
    for (const sd of [-0.22, 0.22])
      s.seg(
        "metal",
        [lx + sd, 0, 0.45],
        [lx + sd + 0.1, -0.2, 2.3],
        0.018,
        iron,
      );
    for (let i = 1; i < 8; i++) {
      const f = i / 8;
      s.seg(
        "metal",
        [lx - 0.22 + f * 0.1, -0.2 * f, 0.45 + f * 1.85],
        [lx + 0.22 + f * 0.1, -0.2 * f, 0.45 + f * 1.85],
        0.012,
        iron,
      );
    }
    k.include(s, { x, y, z, ry, rx, rz });
  }
  function cornice(k, r, x, y, z, ry, rz) {
    const s = new X.Kit(9);
    const lime = { color: 0xc4b89c, grime: 0.55, bevel: 0.04 };
    s.cbox("concrete", 1.7, 0.34, 0.55, 0, 0, 0, lime);
    s.cbox("concrete", 1.7, 0.12, 0.72, 0, 0.22, -0.06, lime);
    s.cyl(
      "concrete",
      0.1,
      0.1,
      1.7,
      0,
      -0.08,
      -0.3,
      Object.assign({ rz: PI / 2, seg: 6 }, lime),
    );
    for (let i = 0; i < 7; i++)
      s.box("concrete", 0.1, 0.1, 0.12, -0.72 + i * 0.24, -0.2, -0.24, lime);
    k.include(s, { x, y, z, ry, rz, rx: (r() - 0.5) * 0.4 });
  }
  function windowSash(k, r, x, y, z, ry, rx) {
    const s = new X.Kit(11);
    const w = { color: pick(r, [0x5a4a38, 0x6a5a44, 0x3e5a4a]), grime: 0.5 };
    s.box("wood", 1.0, 0.06, 0.07, 0, 0, -0.7, w);
    s.box("wood", 1.0, 0.06, 0.07, 0, 0, 0.7, w);
    s.box("wood", 1.0, 0.06, 0.05, 0, 0, 0, w);
    s.box("wood", 0.07, 0.06, 1.47, -0.47, 0, 0, w);
    s.box("wood", 0.07, 0.06, 1.47, 0.47, 0, 0, w);
    s.box("glass", 0.4, 0.01, 0.5, -0.2, 0.01, 0.35, { color: 0x3a4a48 });
    k.include(s, { x, y, z, ry, rx, rz: (r() - 0.5) * 0.3 });
  }
  /**
   * The rooftop WATER TOWER that came down with the facade — the NYC tell. A cedar-stave barrel lying on
   * its side, half buried in the talus: staves burst open at one end (some splayed out, some missing),
   * the steel hoop bands (one snapped and sprung), the floor boards at the far end, its conical roof
   * torn off and lying beside it with the finial, and a twisted steel leg frame still bolted to it.
   * Built from closed boxes so the burst end reads from inside too. Axis along local X, centred.
   */
  function waterTank(k, r, R, Lt, x, y, z, ry, rz) {
    const s = new X.Kit(23);
    const cedar = [0x5c4c3a, 0x665440, 0x534434, 0x6e5c46, 0x4c3e30];
    const iron = { color: 0x2c2622, rust: 0.8, grime: 0.35 };
    const N = 20,
      sw = ((X.TAU * R) / N) * 1.02;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * X.TAU;
      const burst = i % 7 === 3 || i % 7 === 4; // two runs of staves blown out
      if (burst && r() < 0.5) continue; // gone
      const len = Lt * (burst ? 0.45 + r() * 0.3 : 0.86 + r() * 0.14);
      const x0 = -Lt / 2 + len / 2; // staves anchored at the floor end
      const splay = burst ? 0.18 + r() * 0.3 : 0;
      const cy = Math.cos(a) * R,
        cz = Math.sin(a) * R;
      s.box(
        "wood",
        len,
        0.07,
        sw,
        x0 + splay * 0.3,
        cy + Math.cos(a) * splay * 0.4,
        cz + Math.sin(a) * splay * 0.4,
        { rx: a, color: cedar[(r() * cedar.length) | 0], grime: 0.55 },
      );
    }
    // floor boards at the far (-X) end + the dark inside of the tank
    s.cyl("wood", R * 0.99, R * 0.99, 0.08, -Lt / 2 + 0.04, 0, 0, {
      rz: PI / 2,
      seg: N,
      color: 0x3a3028,
      grime: 0.6,
    });
    s.cyl("plain", R * 0.9, R * 0.9, 0.02, -Lt / 2 + 0.1, 0, 0, {
      rz: PI / 2,
      seg: N,
      color: 0x1c1814,
    });
    // hoop bands: three intact, the one nearest the burst end snapped and sprung open
    for (let h = 0; h < 4; h++) {
      const hx = -Lt / 2 + Lt * (0.12 + h * 0.26);
      if (h === 3) {
        s.torus("rust", R + 0.05, 0.022, hx + 0.1, 0.1, 0.15, {
          ry: PI / 2,
          rx: 0.25,
          arc: X.TAU * 0.72,
          rseg: 4,
          tseg: 14,
          color: 0x3a2a20,
          rust: 0.9,
        });
        continue;
      }
      s.torus("rust", R + 0.045, 0.022, hx, 0, 0, {
        ry: PI / 2,
        rseg: 4,
        tseg: 18,
        color: 0x3a2a20,
        rust: 0.85,
      });
    }
    // the steel leg frame still bolted to the floor end: a square of I-section + two bent legs
    for (const sd of [-1, 1]) {
      s.box("rust", 0.14, R * 2.1, 0.12, -Lt / 2 - 0.1, 0, sd * R * 0.55, iron);
      s.seg(
        "rust",
        [-Lt / 2 - 0.12, R * 0.9, sd * R * 0.55],
        [
          -Lt / 2 - 1.3 - r() * 0.5,
          R * 1.2 + r() * 0.5,
          sd * (R * 0.7 + r() * 0.4),
        ],
        0.07,
        Object.assign({ seg: 5 }, iron),
      );
      s.seg(
        "rust",
        [-Lt / 2 - 0.12, -R * 0.9, sd * R * 0.55],
        [-Lt / 2 - 0.9 - r() * 0.4, -R * 0.4, sd * (R * 0.9 + r() * 0.3)],
        0.07,
        Object.assign({ seg: 5 }, iron),
      );
    }
    // loose staves spilled out of the burst end
    for (let i = 0; i < 5; i++)
      s.box(
        "wood",
        1.2 + r() * 1.2,
        0.06,
        0.14,
        Lt / 2 + 0.4 + r() * 1.2,
        -R + 0.1 + r() * 0.35,
        (r() - 0.5) * R * 2,
        {
          ry: (r() - 0.5) * 1.6,
          rz: (r() - 0.5) * 0.5,
          color: cedar[(r() * cedar.length) | 0],
          grime: 0.6,
        },
      );
    k.include(s, { x, y, z, ry, rz });
    // the conical roof, torn off and lying tipped beside the tank (+ finial ball)
    const c = new X.Kit(29);
    c.cyl("wood", 0.05, R * 1.08, R * 0.62, 0, R * 0.31, 0, {
      seg: 16,
      color: 0x4e4234,
      grime: 0.6,
    });
    c.cyl("rust", R * 1.08, R * 1.1, 0.06, 0, 0.02, 0, {
      seg: 16,
      color: 0x3a2a20,
      rust: 0.8,
    });
    c.sphere
      ? c.sphere("rust", 0.09, 0, R * 0.66, 0, { color: 0x3a2a20, rust: 0.8 })
      : c.cyl("rust", 0.08, 0.08, 0.16, 0, R * 0.66, 0, {
          seg: 6,
          color: 0x3a2a20,
        });
    const cx = Math.cos(ry),
      sn = Math.sin(ry),
      off = Lt / 2 + R * 0.9;
    k.include(c, {
      x: x + cx * off,
      y: Math.max(0.3, y - R * 0.55),
      z: z - sn * off,
      rz: 1.1 + r() * 0.5,
      ry: r() * PI * 2,
    });
  }
  X.waterTank = waterTank;

  // v % 3 = size (small / medium / large), (v / 3 | 0) = one of three differently seeded heaps per size
  // (the prototype key includes the variant, so every variant gets its own random layout).
  X.SPILL_VARIANTS = 9;
