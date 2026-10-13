/* src/props/26_ruins.js */
/* =====================================================================
 * props / 26_ruins.js — LARGE RUIN SET PIECES & LIVED-IN RUINS.
 *   collapse_spill  — a building face that came down: a talus of concrete
 *                     dust and brick spilling from the facade across the
 *                     sidewalk into the parking lane, with snapped floor
 *                     slabs, protruding I-beams, rebar, a fallen fire-escape
 *                     landing & ladder, a limestone cornice chunk, window
 *                     sashes and pipe. Stepped colliders → climbable (FO3).
 *   army_truck      — olive-drab 2½-ton US Army cargo truck (canvas-covered /
 *                     stripped to the bows with crates / burnt out). Static,
 *                     batched; the cargo bed can be a container.
 *   squat_camp      — a survivor's lean-to against a wall: sagging tarp on
 *                     poles, bedroll, fire ring with a cook-pot tripod (lit or
 *                     cold), crate table with tins, a hand-painted sign.
 *   scav_sign       — hand-painted plank sign on a stake (6 texts).
 *   quarantine_sign — old-world Army "QUARANTINE ZONE" board + evac route plate.
 * Local frame as everywhere in props: y = 0 ground, the FRONT faces -Z.
 * ===================================================================== */
(function () {
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
  D("collapse_spill", (k, r, v) => {
    v = v % 9;
    const size = v % 3;
    const S = SPILL[size];
    const seed = r() * 50;
    const surf = makeSurf(S, seed);
    const at = (u, t) => {
      const x = ((u * S.W) / 2) * (1 - 0.18 * t * t),
        z = -t * S.D;
      return [x, surf(x, z) - 0.24 * t * t, z];
    };
    const brickHeavy = r() < 0.45;
    const dustA = X.color(brickHeavy ? 0x7a6456 : 0x96908a),
      dustB = X.color(brickHeavy ? 0x8c5c48 : 0xaaa498),
      tmp = new THREE.Color();
    k.addSmooth(
      "concrete",
      heapGeometry(S, surf, [10, 13, 16][size], [7, 9, 11][size]),
      {
        grime: 0.55,
        ao: [0.6, S.H * 0.8],
        aoY0: -0.2,
        colorFn: (x, y, z) =>
          tmp
            .copy(dustA)
            .lerp(
              dustB,
              X.clamp(X.noise3(x * 1.3, y, z * 1.3) * 1.6 - 0.3, 0, 1),
            )
            .getHex(),
      },
    );
    // broken floor slabs sliding down the heap (rebar stubs out of their snapped edges)
    for (let i = 0, n = [2, 3, 5][size]; i < n; i++) {
      const p = at((r() - 0.5) * 1.3, 0.12 + r() * 0.55);
      const sw = (0.9 + r() * 1.2) * (0.8 + size * 0.18),
        sd = 0.7 + r() * 0.8,
        th = 0.15 + r() * 0.08,
        ry = r() * PI,
        rx = -(0.25 + r() * 0.45),
        rz = (r() - 0.5) * 0.5;
      k.cbox("concrete", sw, th, sd, p[0], p[1] + 0.06, p[2], {
        ry,
        rx,
        rz,
        color: pick(r, RUBBLE),
        grime: 0.45,
        bevel: 0.03,
      });
      const cy = Math.cos(ry),
        sy = Math.sin(ry);
      for (let b = 0; b < 3 + ((r() * 3) | 0); b++) {
        const ox = (b / 3 - 0.4) * sw,
          ex = p[0] + ox * cy + (sd / 2) * sy,
          ez = p[2] - ox * sy + (sd / 2) * cy;
        k.seg(
          "rust",
          [ex, p[1] + 0.05, ez],
          [
            ex + (r() - 0.5) * 0.5,
            p[1] + 0.3 + r() * 0.6,
            ez + (r() - 0.2) * 0.6 * cy,
          ],
          0.011,
          { color: 0xa08070, seg: 4 },
        );
      }
    }
    // steel: I-beams jutting out of the heap
    for (
      let i = 0, n = [r() < 0.5 ? 1 : 0, 1 + (r() < 0.5 ? 1 : 0), 3][size];
      i < n;
      i++
    ) {
      const p = at((r() - 0.5) * 1.1, 0.1 + r() * 0.4),
        len = 2.2 + r() * 2.2 + size * 0.6;
      const tilt = 0.25 + r() * 0.55;
      ibeam(
        k,
        len,
        p[0],
        p[1] + Math.sin(tilt) * len * 0.22,
        p[2],
        r() * PI * 2,
        tilt,
      );
    }
    // concrete lumps and loose bricks all over
    for (let i = 0, n = [8, 13, 19][size]; i < n; i++) {
      const p = at((r() * 2 - 1) * 1.05, Math.pow(r(), 0.8) * 1.05),
        sz = 0.14 + r() * (0.25 + size * 0.1);
      const co = {
        ry: r() * 3,
        rx: (r() - 0.5) * 0.9,
        rz: (r() - 0.5) * 0.9,
        color: pick(r, RUBBLE),
        grime: 0.4,
        bevel: 0.03,
      };
      if (sz > 0.3)
        k.cbox(
          "concrete",
          sz * (1 + r()),
          sz * (0.5 + r() * 0.5),
          sz * (0.8 + r() * 0.6),
          p[0],
          p[1] + sz * 0.15,
          p[2],
          co,
        );
      else
        k.box(
          "concrete",
          sz * (1 + r()),
          sz * (0.5 + r() * 0.5),
          sz * (0.8 + r() * 0.6),
          p[0],
          p[1] + sz * 0.15,
          p[2],
          co,
        );
    }
    for (
      let i = 0, n = [12, 20, 30][size] + (brickHeavy ? 10 : 0);
      i < n;
      i++
    ) {
      const p = at((r() * 2 - 1) * 1.1, Math.pow(r(), 0.7) * 1.12);
      k.box("concrete", 0.21, 0.065, 0.1, p[0], p[1] + 0.03, p[2], {
        ry: r() * 3,
        rx: (r() - 0.5) * 0.8,
        rz: (r() - 0.5) * 0.8,
        color: pick(r, BRICK),
        grime: 0.3,
      });
    }
    // mortared brick clumps (a piece of wall that fell in one lump)
    for (let i = 0, n = 1 + size; i < n; i++) {
      const p = at((r() - 0.5) * 1.4, 0.2 + r() * 0.6);
      k.cbox(
        "concrete",
        0.7 + r() * 0.6,
        0.3 + r() * 0.2,
        0.25 + r() * 0.15,
        p[0],
        p[1] + 0.12,
        p[2],
        {
          ry: r() * 3,
          rx: (r() - 0.5) * 0.9,
          rz: (r() - 0.5) * 0.6,
          color: pick(r, BRICK),
          grime: 0.5,
          bevel: 0.02,
        },
      );
    }
    // a fallen fire-escape landing with its ladder (the NYC tell)
    if (size >= 1 && r() < 0.8) {
      const p = at((r() - 0.5) * 0.8, 0.3 + r() * 0.3);
      fireEscape(
        k,
        r,
        p[0],
        p[1] + 0.25,
        p[2],
        r() * PI * 2,
        -(0.2 + r() * 0.3),
        (r() - 0.5) * 0.4,
      );
    }
    // a limestone cornice chunk from the roofline
    if (size === 2 || r() < 0.4) {
      const p = at((r() - 0.5) * 1.2, 0.55 + r() * 0.35);
      cornice(k, r, p[0], p[1] + 0.2, p[2], r() * PI * 2, (r() - 0.5) * 0.5);
    }
    // window sashes, timber joists, a pipe
    for (let i = 0; i < 1 + (size >> 1); i++) {
      const p = at((r() - 0.5) * 1.5, 0.3 + r() * 0.5);
      windowSash(
        k,
        r,
        p[0],
        p[1] + 0.08,
        p[2],
        r() * PI * 2,
        -(0.1 + r() * 0.5),
      );
    }
    for (let i = 0; i < 1 + size; i++) {
      const p = at((r() - 0.5) * 1.3, 0.15 + r() * 0.6);
      k.box("wood", 1.6 + r() * 1.6, 0.14, 0.2, p[0], p[1] + 0.12, p[2], {
        ry: r() * 3,
        rz: (r() - 0.5) * 0.7,
        rx: (r() - 0.5) * 0.3,
        color: pick(r, [0x4a3a2a, 0x5a4a38, 0x3a3024]),
        grime: 0.5,
      });
    }
    if (r() < 0.7) {
      const p = at(r() - 0.5, 0.4 + r() * 0.4);
      k.cyl("rust", 0.09, 0.09, 2 + r() * 1.5, p[0], p[1] + 0.12, p[2], {
        rz: PI / 2 + (r() - 0.5) * 0.4,
        ry: r() * 3,
        seg: 7,
        color: 0x5a4030,
        rust: 0.8,
      });
    }
    // the rooftop water tower came down with it (one of the three layouts per size, medium & large heaps)
    if (size >= 1 && ((v / 3) | 0) === 2) {
      const R = size === 2 ? 1.35 : 1.1,
        Lt = size === 2 ? 2.9 : 2.4;
      const p = at((r() - 0.5) * 0.35, 0.38 + r() * 0.1);
      waterTank(
        k,
        r,
        R,
        Lt,
        p[0],
        p[1] + R * 0.4,
        p[2],
        (r() - 0.5) * 0.7,
        (r() - 0.5) * 0.15,
      );
      k.meta.tankCol = {
        w: Lt * 0.95,
        d: R * 1.7,
        h: p[1] + R * 1.3,
        cx: p[0],
        cz: p[2],
      };
    }
    // pale dust fan on the ground beyond the heap
    k.cyl("concrete", 1, 1, 0.02, 0, 0.012, -S.D * 0.52, {
      seg: 16,
      s: [S.W * 0.62, 1, S.D * 0.72],
      color: brickHeavy ? 0x7a6658 : 0x9c968a,
      grime: 0.6,
      ao: [1, 1],
    });
    // stepped colliders following the talus: every step ≤ 0.5 m → you can clamber up it
    const n = Math.max(2, Math.ceil(S.H / 0.46));
    const cols = [];
    for (let i = 0; i < n; i++) {
      const t0 = i / n,
        t1 = (i + 1) / n,
        tm = (t0 + t1) / 2;
      const h = spillProfile(S, 0, tm) * 0.88 - 0.24 * tm * tm;
      if (h < 0.2) continue;
      cols.push({
        w: S.W * (0.72 - 0.25 * tm),
        d: (t1 - t0) * S.D,
        h,
        cx: 0,
        cz: -tm * S.D,
      });
    }
    if (k.meta.tankCol) {
      cols.push(k.meta.tankCol);
      delete k.meta.tankCol;
    }
    k.meta.colliders = cols;
    k.meta.surface = "concrete";
    // tier is chosen at placement (large + shadows only for the biggest heaps)
    k.meta.tier = size === 2 ? "large" : "medium";
  });

  // ------------------------------------------------------------------
  // FACADE BREACH — the wound the collapse left in the building face, hung
  // on the facade above a collapse_spill. Origin = foot of the wall, the
  // wall plane is z = 0 and everything projects toward -Z (the street):
  // a ragged dark cavity (inverted-V tear, widest at the heap), a rim of
  // broken brick/stone chunks, snapped floor slabs jutting out at each
  // storey with rebar and ceiling plaster hanging off them, dangling joists,
  // pipes and wires, a fire-escape landing torn half off its brackets, and
  // a soot scorch licking up from the top of the tear.
  // v % 3 = size (matches collapse_spill), (v / 3 | 0) = layout seed.
  // No colliders: it all sits ≥ 2.5 m up or flat on the wall.
  // ------------------------------------------------------------------
  const BREACH = [
    { W: 4.4, H: 5.6 },
    { W: 6.2, H: 7.6 },
    { W: 8.0, H: 9.8 },
  ];
  X.BREACH_DIMS = BREACH;
  D("facade_breach", (k, r, v) => {
    v = v % 9;
    const size = v % 3,
      B = BREACH[size];
    const y0 = 0.35,
      Z = -0.06; // bottom hidden by the heap; card just proud of the wall
    // outline: half-width as a function of height (a tear that narrows upward), jittered
    const N = 11,
      left = [],
      right = [];
    const skew = (r() - 0.5) * 0.35; // the tear leans a little
    for (let i = 0; i <= N; i++) {
      const t = i / N,
        y = y0 + t * (B.H - y0);
      const hw =
        (B.W / 2) *
        (1 - 0.42 * Math.pow(t, 1.6)) *
        (0.86 + r() * 0.28) *
        (i === N ? 0.8 : 1);
      const cx = skew * t * B.W * 0.5;
      left.push([
        cx - hw - (i % 2 ? r() * 0.3 : 0),
        y + (r() - 0.5) * 0.25 * (i > 0 && i < N ? 1 : 0),
      ]);
      right.push([
        cx + hw + (i % 2 ? 0 : r() * 0.3),
        y + (r() - 0.5) * 0.25 * (i > 0 && i < N ? 1 : 0),
      ]);
    }
    // ragged top edge: a few broken lintel steps between the two sides
    const tops = [];
    for (let i = 1; i <= 3; i++) {
      const f = i / 4,
        xl = left[N][0],
        xr = right[N][0];
      tops.push([
        X.lerp(xr, xl, f),
        B.H + (r() - 0.3) * 0.6 * (i === 2 ? 1.4 : 1),
      ]);
    }
    const top = tops[1];
    const outline = [].concat(right, tops, left.slice().reverse());
    const halfAt = (y) => {
      // tear half-width & centre at height y
      const t = X.clamp((y - y0) / (B.H - y0), 0, 1),
        i = Math.min(N - 1, Math.floor(t * N)),
        f = t * N - i;
      const l = X.lerp(left[i][0], left[i + 1][0], f),
        rr = X.lerp(right[i][0], right[i + 1][0], f);
      return { l, r: rr, c: (l + rr) / 2, w: rr - l };
    };
    // the cavity: near-black at the core, a touch of dusty brown toward the torn edge
    const core = X.color(0x0f0d0b),
      edge = X.color(0x2c2620),
      tmp = new THREE.Color();
    k.extrude("plain", outline, 0.04, {
      z: Z,
      grime: 0,
      ao: [1, 1],
      colorFn: (x, y) => {
        const h = halfAt(y);
        const d = Math.abs(x - h.c) / Math.max(0.3, h.w / 2);
        return tmp
          .copy(core)
          .lerp(edge, X.clamp(d * d, 0, 1) * 0.8)
          .getHex();
      },
    });
    // back-lit interior hints: a partition wall edge and a doorway glimpsed inside (slightly lighter planes)
    {
      const h = halfAt(y0 + 1.6);
      k.box(
        "plain",
        0.18,
        2.4,
        0.03,
        h.c + h.w * (0.18 + r() * 0.12),
        y0 + 1.4,
        Z - 0.035,
        { color: 0x3a342c, grime: 0.4 },
      );
    }
    {
      const h = halfAt(y0 + 4.2);
      if (size > 0)
        k.box(
          "plain",
          h.w * 0.35,
          2.1,
          0.03,
          h.c - h.w * 0.2,
          y0 + 4.4,
          Z - 0.035,
          { color: 0x2e2a24, grime: 0.4 },
        );
    }
    // rim of broken masonry: brick or limestone chunks straddling the outline, poking out of the wall
    const brick = r() < 0.6;
    const RIM = brick
      ? [0x9a5a40, 0x8a4e38, 0xae6c50, 0x7a4432, 0xa89c88]
      : [0xc0b69e, 0xaea48c, 0xd0c6ac, 0x9a9280, 0x8a5a44];
    for (let i = 0; i < outline.length; i++) {
      const a = outline[i],
        b = outline[(i + 1) % outline.length];
      if (a[1] < y0 + 0.4 && b[1] < y0 + 0.4) continue; // not along the buried bottom
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]),
        n = Math.max(1, Math.round(L / 0.3));
      for (let j = 0; j < n; j++) {
        const f = (j + r() * 0.8) / n,
          x = X.lerp(a[0], b[0], f) + (r() - 0.5) * 0.25,
          y = X.lerp(a[1], b[1], f) + (r() - 0.5) * 0.25;
        const sz = 0.12 + r() * 0.22;
        // plain boxes for the small bits (12 tris), chamfered only for the bigger chunks
        k[sz > 0.24 ? "cbox" : "box"](
          "concrete",
          sz * (1 + r() * 0.8),
          sz * (0.55 + r() * 0.5),
          0.2 + r() * 0.35,
          x,
          y,
          Z - 0.1 - r() * 0.12,
          {
            rz: r() * PI,
            ry: (r() - 0.5) * 0.5,
            rx: (r() - 0.5) * 0.4,
            color: pick(r, RIM),
            grime: 0.35,
            bevel: 0.03,
          },
        );
      }
    }
    // snapped floor slabs at each storey: a concrete lip spanning the tear, broken off ragged, one drooping
    for (let yy = 3.4; yy < B.H - 0.6; yy += 3.3) {
      const h = halfAt(yy);
      const nPieces = 2 + ((r() * 2) | 0);
      for (let p = 0; p < nPieces; p++) {
        const x0 = h.l + (h.w * p) / nPieces,
          x1 = h.l + (h.w * (p + 1)) / nPieces - 0.08,
          pw = x1 - x0;
        const out = 0.35 + r() * 0.9,
          droop = p === 1 && r() < 0.6 ? 0.25 + r() * 0.4 : (r() - 0.5) * 0.08;
        const sl = new X.Kit(19 + p);
        sl.box("concrete", pw, 0.26, out, 0, 0, -out / 2, {
          color: pick(r, RUBBLE),
          grime: 0.5,
        });
        sl.box("plain", pw * 0.96, 0.02, out * 0.95, 0, -0.14, -out / 2, {
          color: 0x3a3630,
        }); // stained soffit
        sl.box("wood", pw * 0.9, 0.04, out * 0.5, 0, 0.15, -out * 0.3, {
          color: 0x4a3a2a,
          grime: 0.5,
        }); // floorboards on top
        // rebar & conduit hanging off the snapped edge
        for (let b = 0; b < 2 + ((r() * 3) | 0); b++) {
          const bx = (r() - 0.5) * pw * 0.9;
          sl.seg(
            "rust",
            [bx, -0.05, -out],
            [bx + (r() - 0.5) * 0.3, -0.35 - r() * 0.9, -out - 0.1 - r() * 0.3],
            0.012,
            { color: 0x8a6a58, seg: 4 },
          );
        }
        // a sheet of ceiling plaster / lath hanging down
        if (r() < 0.5)
          sl.box(
            "plain",
            pw * (0.3 + r() * 0.3),
            0.6 + r() * 0.6,
            0.02,
            (r() - 0.5) * pw * 0.4,
            -0.5,
            -out * 0.6,
            { rx: 0.25, rz: (r() - 0.5) * 0.3, color: 0xa89e88, grime: 0.5 },
          );
        k.include(sl, {
          x: (x0 + x1) / 2,
          y: yy,
          z: Z - 0.04,
          rx: droop,
          rz: (r() - 0.5) * 0.06,
        });
      }
      // wires & pipes dangling from the slab edge
      for (let w = 0; w < 2; w++) {
        const wx = h.l + r() * h.w;
        k.seg(
          "metal",
          [wx, yy - 0.1, Z - 0.3],
          [wx + (r() - 0.5) * 0.4, yy - 1.2 - r() * 1.4, Z - 0.5 - r() * 0.4],
          0.008,
          { color: 0x1a1a18, seg: 3 },
        );
      }
      if (r() < 0.6) {
        const px = h.l + h.w * (0.2 + r() * 0.6);
        k.seg(
          "rust",
          [px, yy + 0.3, Z - 0.15],
          [px + (r() - 0.5) * 0.8, yy - 1.4, Z - 0.9],
          0.05,
          { color: 0x5a4a3a, rust: 0.8, seg: 6 },
        );
      }
    }
    // timber joists jutting out at angles from the sides of the tear
    for (let j = 0; j < 2 + size; j++) {
      const yy = y0 + 1.8 + r() * (B.H - 3),
        h = halfAt(yy),
        sd = r() < 0.5 ? -1 : 1;
      const x0 = sd < 0 ? h.l + 0.15 : h.r - 0.15,
        len = 1.2 + r() * 1.6;
      k.seg(
        "wood",
        [x0, yy, Z - 0.05],
        [x0 - sd * len * 0.35, yy - len * (0.3 + r() * 0.5), Z - len * 0.6],
        0.07,
        { color: pick(r, [0x4a3a2a, 0x5a4632, 0x3a2e22]), grime: 0.5, seg: 4 },
      );
    }
    // a fire-escape landing torn half off its brackets, hanging by one corner (medium & large)
    if (size > 0 && r() < 0.85) {
      const yy = B.H * (0.55 + r() * 0.2),
        h = halfAt(yy),
        sd = r() < 0.5 ? -1 : 1;
      fireEscape(
        k,
        r,
        sd < 0 ? h.l - 0.6 : h.r + 0.6,
        yy,
        Z - 0.7,
        0,
        -0.2 - r() * 0.2,
        sd * (0.5 + r() * 0.4),
      );
      k.box(
        "metal",
        0.08,
        0.3,
        0.3,
        sd < 0 ? h.l - 1.6 : h.r + 1.6,
        yy + 0.2,
        Z - 0.15,
        { color: 0x24221f, rust: 0.6 },
      ); // bent bracket
    }
    // soot scorch licking up from the top of the tear (dark, tapering, ragged)
    {
      const pts = [],
        tx = top[0],
        ty = top[1] - 0.4,
        H2 = 1.6 + size * 0.7 + r() * 0.8,
        w0 = (right[N][0] - left[N][0]) * 0.55;
      const M = 7;
      for (let i = 0; i <= M; i++) {
        const t = i / M;
        pts.push([
          tx + w0 * (1 - t) * (0.8 + r() * 0.4) + Math.sin(t * 5 + r()) * 0.15,
          ty + t * H2,
        ]);
      }
      for (let i = M; i >= 0; i--) {
        const t = i / M;
        pts.push([
          tx - w0 * (1 - t) * (0.8 + r() * 0.4) + Math.sin(t * 4 + r()) * 0.15,
          ty + t * H2,
        ]);
      }
      const s0 = X.color(0x24211d),
        s1 = X.color(0x55514a);
      k.extrude("plain", pts, 0.02, {
        z: Z + 0.005,
        grime: 0,
        ao: [1, 1],
        colorFn: (x, y) =>
          tmp
            .copy(s0)
            .lerp(s1, X.clamp((y - ty) / H2, 0, 1))
            .getHex(),
      });
      k.meta.farScorch = { pts, ty, H2 };
    }
    k.meta.farOutline = outline;
    k.meta.collider = null;
    k.meta.tier = "medium";
    k.meta.surface = "concrete";
  });
  // Far stand-in for a facade_breach: just the dark cavity + soot, ~60 tris, in the long-range tier
  // (300 m chunks, ~700 m) so a breach doesn't pop out of the facade when the detailed one (medium
  // tier, ~190 m) is culled. It sits just behind the detailed cavity, which hides it up close.
  D("facade_breach_far", (k, r, v) => {
    const src = X.proto("facade_breach", v % 9).meta;
    const core = X.color(0x13110e),
      tmp = new THREE.Color();
    k.extrude("plain", src.farOutline, 0.01, {
      z: -0.03,
      grime: 0,
      ao: [1, 1],
      colorFn: () => core.getHex(),
    });
    const sc = src.farScorch;
    if (sc) {
      const s0 = X.color(0x24211d),
        s1 = X.color(0x55514a);
      k.extrude("plain", sc.pts, 0.01, {
        z: -0.022,
        grime: 0,
        ao: [1, 1],
        colorFn: (x, y) =>
          tmp
            .copy(s0)
            .lerp(s1, X.clamp((y - sc.ty) / sc.H2, 0, 1))
            .getHex(),
      });
    }
    k.meta.collider = null;
    k.meta.tier = "large";
    k.meta.surface = "concrete";
  });

  // ------------------------------------------------------------------
  // US ARMY 2½-TON CARGO TRUCK. v0 canvas on, v1 canvas torn off (bows,
  // crates in the bed), v2 burnt-out shell. Front faces -Z (like the cars).
  // ------------------------------------------------------------------
  D("army_truck", (k, r, v) => {
    v = v % 3;
    const burnt = v === 2;
    const OL = burnt ? 0x2a2622 : pick(r, [0x4a5236, 0x535a3c, 0x464c34]);
    const ol = { color: OL, rust: burnt ? 0.9 : 0.35, grime: 0.35 };
    const dark = { color: burnt ? 0x1a1816 : 0x22231e, rust: 0.4, grime: 0.2 };
    const dy = v >= 1 ? -0.08 : 0;
    // chassis & rails
    k.box("metal", 1.0, 0.24, 6.7, 0, 0.78 + dy, 0.2, dark);
    k.box(
      "metal",
      2.3,
      0.22,
      0.22,
      0,
      0.72 + dy,
      -3.6,
      Object.assign({}, ol, { color: burnt ? 0x2a2622 : 0x3a3e2c }),
    ); // bumper
    for (const s of [-1, 1])
      k.box("metal", 0.14, 0.14, 0.3, s * 0.8, 0.72 + dy, -3.82, dark); // tow hooks
    // bonnet with louvres, grille guard, headlamps on the fenders
    k.cbox(
      "metal",
      1.34,
      0.72,
      1.7,
      0,
      1.3 + dy,
      -2.65,
      Object.assign({ bevel: 0.05 }, ol),
    );
    for (let i = 0; i < 5; i++)
      for (const s of [-1, 1])
        k.box(
          "metal",
          0.02,
          0.05,
          0.5,
          s * 0.675,
          1.35 + dy + i * 0.06 - 0.12,
          -2.6,
          dark,
        );
    k.box("metal", 1.2, 0.72, 0.05, 0, 1.25 + dy, -3.52, dark);
    for (let i = 0; i < 7; i++)
      k.box("metal", 0.05, 0.72, 0.07, -0.51 + i * 0.17, 1.25 + dy, -3.56, ol);
    for (const s of [-1, 1]) {
      k.box(
        "metal",
        0.5,
        0.06,
        1.6,
        s * 0.93,
        1.02 + dy,
        -2.7,
        Object.assign({ rx: 0.05 }, ol),
      ); // flat army fenders
      k.box("metal", 0.06, 0.34, 1.5, s * 1.17, 0.86 + dy, -2.7, ol);
      k.cyl("metal", 0.11, 0.11, 0.12, s * 0.9, 1.2 + dy, -3.45, {
        rx: PI / 2,
        seg: 10,
        color: burnt ? 0x2a2620 : 0x8a8a78,
      });
      k.cyl("glass", 0.085, 0.085, 0.02, s * 0.9, 1.2 + dy, -3.52, {
        rx: PI / 2,
        seg: 10,
        color: burnt ? 0x141210 : 0x9a9a88,
      });
    }
    k.quad("army_star", 0.62, 0.62, 0, 1.67 + dy, -2.6, {
      mat: "trim",
      rx: -PI / 2,
      grime: 0.3,
    });
    // cab: open-sided with a canvas/steel roof, split windscreen
    k.box("metal", 2.1, 0.9, 1.35, 0, 1.4 + dy, -1.2, ol); // cab tub
    k.box(
      "metal",
      2.1,
      0.08,
      1.4,
      0,
      2.55 + dy,
      -1.25,
      burnt ? dark : { color: 0x5a5a44, grime: 0.4 },
    ); // roof
    for (const s of [-1, 1]) {
      k.seg(
        "metal",
        [s * 1.02, 1.85 + dy, -1.88],
        [s * 1.02, 2.52 + dy, -1.88],
        0.035,
        dark,
      );
      k.seg(
        "metal",
        [s * 1.02, 1.85 + dy, -0.55],
        [s * 1.02, 2.52 + dy, -0.55],
        0.035,
        dark,
      );
      k.quad("army_door", 0.9, 0.23, s * 1.056, 1.55 + dy, -1.2, {
        mat: "trim",
        ry: (s * PI) / 2,
        grime: 0.3,
      });
      k.box("metal", 0.04, 0.05, 0.3, s * 1.25, 2.1 + dy, -1.85, dark); // mirror arm
      k.box("glass", 0.03, 0.26, 0.18, s * 1.38, 2.1 + dy, -1.85, {
        color: 0x3a4040,
      });
    }
    k.box("metal", 2.0, 0.06, 0.06, 0, 1.87 + dy, -1.88, dark);
    for (const s of [-1, 1])
      if (!(burnt && s > 0))
        k.box("glass", 0.92, 0.6, 0.03, s * 0.49, 2.18 + dy, -1.88, {
          rx: 0.05,
          color: burnt ? 0x121210 : 0x2a3634,
        });
    k.box("fabric", 1.8, 0.55, 0.2, 0, 1.95 + dy, -0.7, {
      color: burnt ? 0x151412 : 0x3a3a2c,
    }); // seat back
    // cargo bed: wooden slat sides on steel, tailgate
    k.box("wood", 2.3, 0.12, 4.2, 0, 1.2 + dy, 1.55, {
      color: burnt ? 0x1c1a17 : 0x4a4234,
      grime: 0.4,
    });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++)
        k.box("wood", 0.06, 0.14, 4.2, s * 1.14, 1.38 + dy + i * 0.19, 1.55, {
          color: burnt ? 0x191713 : 0x4e5438,
          grime: 0.45,
        });
      for (let i = 0; i < 5; i++)
        k.box(
          "metal",
          0.07,
          0.62,
          0.07,
          s * 1.15,
          1.55 + dy,
          -0.45 + i * 1.0,
          dark,
        );
    }
    k.box("wood", 2.3, 0.6, 0.08, 0, 1.55 + dy, 3.63, {
      color: burnt ? 0x191713 : 0x4e5438,
      grime: 0.45,
    });
    k.quad("army_door", 1.3, 0.3, 0, 1.55 + dy, 3.68, {
      mat: "trim",
      grime: 0.35,
    });
    if (v === 0) {
      // canvas cover over bows: half-round shell + front cap + dark interior
      const cv = {
        color: pick(r, [0x5c5c44, 0x66624a, 0x55563e]),
        grime: 0.45,
        ao: [0.7, 1.2],
        aoY0: 1.2,
      };
      k.box("fabric", 2.28, 0.8, 4.1, 0, 2.12 + dy, 1.55, cv);
      k.cyl(
        "fabric",
        1.14,
        1.14,
        4.1,
        0,
        2.52 + dy,
        1.55,
        Object.assign(
          {
            rx: PI / 2,
            thetaStart: PI / 2,
            thetaLength: PI,
            seg: 10,
            s: [1, 1, 0.42],
            open: true,
          },
          cv,
        ),
      );
      k.box("fabric", 2.1, 0.9, 0.04, 0, 2.3 + dy, -0.44, cv);
      k.box("plain", 2.1, 1.1, 0.04, 0, 2.05 + dy, 3.5, {
        color: 0x121210,
        ao: [1, 1],
      }); // shadowed opening
      for (let i = 0; i < 3; i++)
        k.seg(
          "fabric",
          [-1.0 + i, 1.72 + dy, 3.6],
          [-0.9 + i + r() * 0.2, 1.4 + dy, 3.62],
          0.02,
          cv,
        ); // tie-down flaps
    } else {
      // bare bows (and tattered canvas rags on the torn one)
      for (let i = 0; i < 5; i++)
        k.torus("metal", 1.1, 0.025, 0, 1.75 + dy, -0.35 + i * 0.95, {
          arc: PI,
          s: [1, 0.72, 1],
          rseg: 4,
          tseg: 10,
          color: burnt ? 0x1a1816 : 0x3a3e2c,
          rz: (r() - 0.5) * (burnt ? 0.25 : 0.05),
        });
      if (!burnt) {
        for (let i = 0; i < 2; i++)
          k.box(
            "fabric",
            1.0 + r() * 0.6,
            0.02,
            0.9 + r() * 0.6,
            (r() - 0.5) * 1.0,
            2.45 + dy,
            0.2 + i * 2.2,
            {
              rz: (r() - 0.5) * 0.8,
              rx: (r() - 0.5) * 0.3,
              color: 0x5c5c44,
              grime: 0.5,
            },
          );
        // army crates & a jerrycan left in the bed
        for (let i = 0; i < 4; i++)
          k.abox(
            "crate_army",
            0.9,
            0.5,
            0.6,
            ((i % 2) - 0.5) * 1.1,
            1.52 + dy + (i > 2 ? 0.5 : 0),
            0.4 + ((i / 2) | 0) * 1.3,
            { ry: (r() - 0.5) * 0.3 },
          );
        k.boxB("metal", 0.35, 0.45, 0.16, 0.7, 1.26 + dy, 2.9, {
          color: 0x3a4028,
          rust: 0.4,
        });
      }
    }
    // spare wheel behind the cab, jerrycans on the running board
    k.torus("plain", 0.42, 0.14, 0, 1.95 + dy, -0.3, {
      rseg: 6,
      tseg: 12,
      color: burnt ? 0x121110 : C.rubber,
      grime: 0.2,
    });
    for (const s of [-1, 1])
      k.boxB("metal", 0.16, 0.45, 0.35, s * 1.18, 0.62 + dy, -0.2, {
        color: burnt ? 0x221f1c : 0x3e4430,
        rust: 0.4,
      });
    // wheels: front pair + tandem rear (big, knobbly; burnt → bare rims)
    for (const wz of [-2.7, 1.25, 2.55])
      for (const s of [-1, 1]) {
        if (burnt) {
          k.cyl("metal", 0.36, 0.36, 0.26, s * 1.0, 0.38, wz, {
            rz: PI / 2,
            seg: 10,
            color: 0x2a221c,
            rust: 1,
          });
          continue;
        }
        k.cyl("plain", 0.52, 0.52, 0.3, s * 1.0, 0.52 + dy, wz, {
          rz: PI / 2,
          seg: 12,
          color: C.rubber,
          grime: 0.25,
          ao: [1, 1],
        });
        k.cyl("metal", 0.26, 0.26, 0.32, s * 1.0, 0.52 + dy, wz, {
          rz: PI / 2,
          seg: 8,
          color: OL,
          rust: 0.6,
        });
      }
    k.meta.collider = { w: 2.4, d: 7.4, h: v === 0 ? 3.0 : 2.5, cz: 0 };
    k.meta.surface = "metal";
    // detail in the medium tier (no shadow pass); a ~70-tri stand-in in the long-range tier carries the
    // silhouette + shadow to 700 m (inside the detailed body, so it never shows up close)
    k.meta.tier = "medium";
    k.meta.farProxy = "army_truck_far";
    k.meta.color = OL;
    k.meta.container = burnt ? null : { name: "Army Truck", loot: "ammo_box" };
    k.meta.interactY = 1.3;
    k.meta.size = [2.4, 7.4, 3.0];
  });

  D("army_truck_far", (k, r, v) => {
    v = v % 3;
    const det = X.proto("army_truck", v).meta;
    const burnt = v === 2,
      dy = v >= 1 ? -0.08 : 0;
    const ol = {
      color: burnt ? 0x2a2622 : det.color,
      grime: 0.2,
      ao: [0.7, 1.4],
    };
    k.box("metal", 1.25, 0.66, 1.6, 0, 1.3 + dy, -2.65, ol); // bonnet
    k.box("metal", 2.0, 0.8, 1.25, 0, 1.4 + dy, -1.2, ol); // cab (below the open windows)
    k.box("metal", 2.2, 0.6, 4.0, 0, 1.5 + dy, 1.55, ol); // bed
    if (v === 0)
      k.box("metal", 2.1, 1.1, 3.9, 0, 2.35 + dy, 1.55, {
        color: 0x5c5c44,
        grime: 0.2,
      });
    k.box("metal", 1.9, 0.7, 6.4, 0, 0.5, 0.1, {
      color: 0x1c1c1a,
      grime: 0.1,
      ao: [1, 1],
    }); // running gear
    k.meta.collider = null;
    k.meta.tier = "large";
  });

  // ------------------------------------------------------------------
  // SQUATTER'S LEAN-TO. Back (+Z) against a wall, open toward -Z.
  // v % 6 → sign text, v % 3 === 2 → cold camp (no fire).
  // ------------------------------------------------------------------
  function tarpGeometry(w, z0, y0, z1, y1, sag, seed) {
    const nx = 5,
      nz = 3,
      pos = [],
      idx = [];
    for (let j = 0; j <= nz; j++)
      for (let i = 0; i <= nx; i++) {
        const u = i / nx,
          t = j / nz;
        const s =
          Math.sin(t * PI) * sag * (0.7 + 0.3 * Math.sin(u * PI)) +
          Math.sin(u * 9 + seed) * 0.03 * Math.sin(t * PI);
        const frayed =
          i === 0 || i === nx ? 0.08 * Math.sin(j * 2.3 + seed) : 0;
        pos.push(
          (u - 0.5) * w,
          X.lerp(y0, y1, t) - s - frayed,
          X.lerp(z0, z1, t),
        );
      }
    const N = (nx + 1) * (nz + 1);
    for (let k = 0; k < N; k++)
      pos.push(pos[k * 3], pos[k * 3 + 1] - 0.012, pos[k * 3 + 2]); // underside (reverse winding)
    for (let j = 0; j < nz; j++)
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i,
          b = a + 1,
          c = a + nx + 1,
          d = c + 1;
        idx.push(a, b, c, b, d, c, a + N, c + N, b + N, b + N, c + N, d + N);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    return g;
  }
  D("squat_camp", (k, r, v) => {
    const lit = v % 3 !== 2;
    const sign = v % (X.SCAV_SIGNS || 6);
    const wood = { color: 0x5a4a36, grime: 0.45 };
    const tarpC = pick(r, [0x4a5a66, 0x5c5a44, 0x6a5038, 0x55624e]);
    // poles + ridge; the tarp runs from the wall (high) to the front poles, sagging between
    for (const s of [-1, 1]) {
      k.seg(
        "wood",
        [s * 1.35, 0, -0.95],
        [s * 1.35 + (r() - 0.5) * 0.08, 1.72, -0.95],
        0.045,
        wood,
      );
      k.seg("wood", [s * 1.35, 1.7, -0.95], [s * 1.5, 0, -1.9], 0.012, {
        color: 0x8a7a60,
      }); // guy rope
      k.box("wood", 0.05, 0.25, 0.05, s * 1.5, 0.05, -1.9, wood);
    }
    k.seg("wood", [-1.5, 1.7, -0.95], [1.5, 1.72, -0.95], 0.04, wood);
    k.add("fabric", tarpGeometry(3.2, 0.9, 2.25, -1.05, 1.66, 0.22, r() * 6), {
      color: tarpC,
      grime: 0.55,
      ao: [0.75, 2.3],
    });
    // side curtain on one end (old blanket)
    k.box("fabric", 0.03, 1.4, 1.5, -1.36, 0.95, 0, {
      rz: 0.04,
      color: pick(r, [0x6a3a2a, 0x3a4a5a, 0x5a5040]),
      grime: 0.5,
    });
    // bedroll + rolled pillow + a dirty blanket
    k.box("fabric", 0.75, 0.09, 1.9, 0.45, 0.05, 0.05, {
      ry: PI / 2 + (r() - 0.5) * 0.2,
      color: 0x5a5444,
      grime: 0.5,
    });
    k.cyl("fabric", 0.12, 0.12, 0.7, 1.25, 0.16, 0.05, {
      rx: PI / 2,
      seg: 7,
      color: 0x6a6450,
    });
    k.box("fabric", 0.8, 0.07, 0.9, 0.7, 0.12, 0.1, {
      ry: 0.3,
      rz: 0.08,
      color: pick(r, [0x7a3a30, 0x3a5a4a, 0x6a6a5a]),
      grime: 0.5,
    });
    // fire ring with a cook-pot tripod in front of the shelter
    const fz = -1.75;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * X.TAU;
      k.cbox(
        "concrete",
        0.2,
        0.13,
        0.16,
        Math.cos(a) * 0.42,
        0.06,
        fz + Math.sin(a) * 0.42,
        { ry: a, color: pick(r, RUBBLE), bevel: 0.03, grime: 0.5 },
      );
    }
    k.cyl("concrete", 0.36, 0.36, 0.02, 0, 0.012, fz, {
      seg: 10,
      color: 0x1e1c1a,
      grime: 0.3,
    });
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1 + r();
      k.seg(
        "wood",
        [Math.cos(a) * 0.3, 0.04, fz + Math.sin(a) * 0.3],
        [-Math.cos(a) * 0.1, 0.12, fz - Math.sin(a) * 0.1],
        0.04,
        { color: lit ? 0x2a1c12 : 0x3a3430 },
      );
    }
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3;
      k.seg(
        "metal",
        [Math.cos(a) * 0.5, 0, fz + Math.sin(a) * 0.5],
        [0, 0.95, fz],
        0.013,
        { color: 0x2a2826 },
      );
    }
    k.seg("metal", [0, 0.95, fz], [0, 0.62, fz], 0.006, { color: 0x3a3836 });
    k.cyl("metal", 0.15, 0.12, 0.2, 0, 0.52, fz, {
      seg: 10,
      color: 0x3a3a38,
      rust: 0.6,
    });
    // crate table with tins & a bottle; a stack of salvaged plates of scrap
    k.abox("crate_plain", 0.6, 0.5, 0.45, -0.95, 0.25, -0.35, { ry: 0.2 });
    for (let i = 0; i < 3; i++)
      k.cyl(
        "metal",
        0.04,
        0.04,
        0.1,
        -1.05 + i * 0.1,
        0.55,
        -0.35 + (r() - 0.5) * 0.2,
        { seg: 6, color: pick(r, [0x8a2a22, 0x6a6a62, 0x9a8a50]), rust: 0.5 },
      );
    k.lathe(
      "glass",
      [
        [0, 0],
        [0.035, 0],
        [0.038, 0.14],
        [0.015, 0.22],
        [0, 0.22],
      ],
      -0.8,
      0.5,
      -0.4,
      { seg: 6, color: 0x2a3a24 },
    );
    k.box("metal", 0.9, 0.04, 0.6, 1.1, 0.35, 0.55, {
      rz: 1.1,
      color: 0x5a5448,
      rust: 0.8,
    }); // corrugated sheet leaning on the wall
    // hand-painted sign on a stake at the front corner
    k.seg("wood", [1.7, 0, -1.4], [1.72, 1.2, -1.4], 0.04, wood);
    k.box("wood", 1.02, 0.34, 0.03, 1.72, 1.0, -1.42, wood);
    k.quad("scav_sign_" + sign, 1.0, 0.31, 1.72, 1.0, -1.44, {
      mat: "trim",
      ry: PI,
      rz: (r() - 0.5) * 0.08,
    });
    if (lit) {
      k.meta.fires = [{ x: 0, y: 0.12, z: fz, scale: 0.45, smoke: true }];
      k.meta.glows = [
        { x: 0, y: 0.35, z: fz, color: 0xff9a40, size: 2.4, flicker: 0.5 },
      ];
    }
    k.meta.collider = { w: 0.6, d: 0.45, h: 0.5, cx: -0.95, cz: -0.35 };
    k.meta.surface = "wood";
    k.meta.tier = "medium";
  });

  // hand-painted plank sign on a stake
  D("scav_sign", (k, r, v) => {
    const wood = { color: 0x5a4a36, grime: 0.45 };
    const lean = (r() - 0.5) * 0.12;
    k.seg("wood", [0, 0, 0], [lean, 1.35, 0], 0.045, wood);
    k.box(
      "wood",
      1.02,
      0.34,
      0.03,
      lean,
      1.12,
      0.03,
      Object.assign({ rz: (r() - 0.5) * 0.1 }, wood),
    );
    k.quad(
      "scav_sign_" + (v % (X.SCAV_SIGNS || 6)),
      1.0,
      0.31,
      lean,
      1.12,
      0.01,
      { mat: "trim", ry: PI, rz: (r() - 0.5) * 0.1 },
    );
    k.meta.tier = "small";
  });

  // old-world US Army quarantine board (+ evacuation-route plate). v1 knocked askew.
  D("quarantine_sign", (k, r, v) => {
    const post = { color: 0x3a3e2c, rust: 0.6, grime: 0.3 };
    const tilt = v === 1 ? 0.28 : 0;
    const s = new X.Kit(13);
    for (const x of [-0.75, 0.75])
      s.box("metal", 0.08, 2.1, 0.08, x, 1.05, 0, post);
    s.box("metal", 1.72, 1.08, 0.04, 0, 1.55, 0.03, {
      color: 0xd8d0b8,
      grime: 0.3,
    });
    s.quad("quarantine", 1.66, 1.04, 0, 1.55, -0.001, { mat: "trim", ry: PI });
    s.quad("evac_route", 0.42, 0.42, 0.52, 0.72, -0.001, {
      mat: "trim",
      ry: PI,
    });
    s.box("metal", 0.44, 0.44, 0.03, 0.52, 0.72, 0.02, { color: 0x1d4f8a });
    k.include(s, { rz: tilt, x: tilt * 0.3 });
    // sandbag footing
    for (const x of [-0.75, 0.75])
      k.sphere("fabric", 0.24, x, 0.1, 0, {
        s: [1.3, 0.55, 0.9],
        color: 0x8a7a58,
        wseg: 7,
        hseg: 4,
        grime: 0.4,
      });
    k.meta.collider = { w: 1.8, d: 0.3, h: 2.1 };
    k.meta.tier = "medium";
  });
})();
