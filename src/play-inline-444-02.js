// play-inline-444 02 — size
// Lines 327-612 of readable/play-inline-444.pretty.js (statement-aligned).
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
