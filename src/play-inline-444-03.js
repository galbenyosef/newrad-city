// play-inline-444 03 — the
// Lines 613-938 of readable/play-inline-444.pretty.js (statement-aligned).
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
