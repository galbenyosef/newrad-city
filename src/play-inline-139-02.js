// play-inline-139 02 — math
// Lines 12-336 of readable/play-inline-139.pretty.js (statement-aligned).
  const LB = G._lb;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  /** Shellback nest: mud mound + clutch of pale eggs. */
  LB.shellbackNest = function (b, x, z, s) {
    s = s || 1;
    b.rock("dirt", x, -0.3, z, 2.2 * s, {
      flat: 0.35,
      rough: 0.4,
      seed: x + z,
    });
    b.rock("dirt", x + 1.4 * s, -0.2, z + 0.8 * s, 1.3 * s, {
      flat: 0.4,
      rough: 0.4,
      seed: x - z,
    });
    const r = LB.rng(Math.round(x * 13 + z * 7));
    for (let i = 0; i < 7; i++) {
      const a = r() * TAU,
        d = r() * 1.2 * s;
      b.sphere(
        "bone",
        x + Math.cos(a) * d,
        0.35 * s + r() * 0.2,
        z + Math.sin(a) * d,
        0.28 * s,
        { sx: 1, sy: 1.35, sz: 1, c: 0xd8d8b0, grime: 0.2 },
      );
    }
  };

  // ---------------------------------------------------------------------
  // Park set-dressing kit (shared by Washington Square & Battery Park): irregular ground patches, dead-grass tufts,
  // irradiated puddles, and a varied dead-tree set (vase elms, spreading oaks, snags, stumps, windfalls) with lean.
  // ---------------------------------------------------------------------
  /** Irregular flat patch (noisy ellipse) at height y. opts {ry, amp, n, seed, c, grime}. Returns the outline (world). */
  LB.blob = function (b, key, x, z, rx, rz, y, opts) {
    opts = opts || {};
    const r = LB.rng(opts.seed || Math.round(x * 7.1 + z * 13.3)),
      n = opts.n || 18,
      rot = opts.ry || 0,
      amp = opts.amp === undefined ? 0.22 : opts.amp;
    const ph = r() * 10,
      c = Math.cos(rot),
      s = Math.sin(rot),
      pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU,
        k = 1 + amp * (Math.sin(a * 3 + ph) * 0.5 + (r() - 0.5));
      const lx = Math.cos(a) * rx * k,
        lz = Math.sin(a) * rz * k;
      pts.push([lx * c + lz * s, -lx * s + lz * c]);
    }
    const sh = new THREE.Shape();
    sh.moveTo(pts[0][0], -pts[0][1]);
    for (let i = 1; i < n; i++) sh.lineTo(pts[i][0], -pts[i][1]);
    sh.closePath();
    const g = new THREE.ShapeGeometry(sh);
    g.rotateX(-Math.PI / 2);
    b.add(key, g, {
      m: LB.m4(x, y, z),
      grime: opts.grime === undefined ? 0.5 : opts.grime,
      noAO: true,
      c: opts.c,
    });
    return pts.map((p) => [p[0] + x, p[1] + z]);
  };
  /** Clumps of dead grass (thin 3-sided blades, straw-tinted) scattered in a radius. */
  LB.tufts = function (b, x, z, radius, n, seed, inside, y0) {
    y0 = y0 || 0;
    const r = LB.rng(seed || Math.round(x * 3 + z * 5));
    for (let i = 0; i < n; i++) {
      const a = r() * TAU,
        d = Math.sqrt(r()) * radius,
        tx = x + Math.cos(a) * d,
        tz = z + Math.sin(a) * d;
      if (inside && !inside(tx, tz)) continue;
      const blades = 4 + Math.floor(r() * 4),
        tint = [0xb8a878, 0x9a8c5c, 0x8a8a58, 0xc0aa7a][i % 4];
      for (let k = 0; k < blades; k++) {
        const h = 0.25 + r() * 0.45,
          g = new THREE.ConeGeometry(0.03 + r() * 0.02, h, 3, 1);
        g.translate(0, h / 2, 0);
        b.add("grass", g, {
          m: LB.m4(
            tx + (r() - 0.5) * 0.25,
            0.04 + y0,
            tz + (r() - 0.5) * 0.25,
            r() * TAU,
            (r() - 0.3) * 0.6,
            (r() - 0.5) * 0.6,
          ),
          c: tint,
          grime: 0.1,
          noAO: true,
        });
      }
    }
  };
  /** Glowing irradiated puddle (+ a darker wet-mud rim). */
  LB.puddle = function (b, x, z, rx, rz, seed, y0) {
    y0 = y0 || 0;
    LB.blob(b, "dirt", x, z, rx * 1.35, rz * 1.35, 0.052 + y0, {
      seed,
      c: 0x6a5a48,
      amp: 0.3,
    });
    LB.blob(b, "water", x, z, rx, rz, 0.058 + y0, {
      seed: (seed || 1) + 7,
      amp: 0.35,
      grime: 0,
    });
  };
  /**
   * Varied dead tree. o: {kind: 'elm' (vase: steep limbs) | 'oak' (low, spreading, gnarled) | 'snag' (broken-topped)
   * | 'stump' | 'fallen' (windfall log with root plate), h, lean (radians), leanDir, seed, collide}.
   */
  LB.parkTree = function (b, x, z, o) {
    o = o || {};
    const r = LB.rng(o.seed || Math.round(x * 31 + z * 17)),
      kind = o.kind || "elm",
      h = o.h || 8;
    const ld = o.leanDir === undefined ? r() * TAU : o.leanDir,
      lean = o.lean || 0;
    const P = (px, py, pz) => new THREE.Vector3(px, py, pz);
    if (kind === "fallen") {
      b.frame(LB.m4(x, 0, z, ld));
      const L = h * 0.8,
        rt = 0.28 + h * 0.018;
      b.rod("bark", P(0, rt * 0.9, 0), P(0, rt * 0.7 + 0.15, L), rt, 7, {
        r2: rt * 0.45,
        grime: 0.3,
      });
      b.rock("dirt", 0, rt, -0.3, rt * 3.2, {
        flat: 0.9,
        sz: 0.35,
        rough: 0.7,
        seed: x + z,
      }); // torn-up root plate
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * TAU;
        b.rod(
          "bark",
          P(0, rt, -0.2),
          P(
            Math.cos(a) * rt * 3,
            rt + Math.sin(a) * rt * 2.6,
            -0.5 - r() * 0.4,
          ),
          0.07,
          4,
          { r2: 0.02 },
        );
      }
      for (let i = 0; i < 4; i++) {
        const zz = L * (0.35 + i * 0.16),
          s2 = i % 2 ? 1 : -1;
        b.rod(
          "bark",
          P(0, rt, zz),
          P(s2 * (1 + r()), rt + 0.4 + r() * 1.2, zz + 0.8),
          0.09,
          4,
          { r2: 0.03 },
        );
      }
      b.frame(null);
      if (o.collide !== false) {
        const c = Math.cos(ld),
          s = Math.sin(ld);
        LB.col(x + (s * L) / 2, z + (c * L) / 2, rt * 2, L, 0, rt * 2, ld, {
          surface: "wood",
        });
      }
      return;
    }
    b.frame(LB.m4(x, 0, z, ld, lean, 0));
    const trunk = (y0, y1, r0, r1) => {
      const mid = P((r() - 0.5) * 0.5, (y0 + y1) / 2, (r() - 0.5) * 0.5),
        top = P((r() - 0.5) * 0.7, y1, (r() - 0.5) * 0.7);
      b.rod("bark", P(0, y0, 0), mid, r0, 7, {
        r2: (r0 + r1) / 2,
        grime: 0.25,
      });
      b.rod("bark", mid, top, (r0 + r1) / 2, 6, { r2: r1, grime: 0.2 });
      return top;
    };
    const flare = (rt) => {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * TAU + r();
        b.rod(
          "bark",
          P(0, 0.9, 0),
          P(Math.cos(a) * rt * 2.6, -0.15, Math.sin(a) * rt * 2.6),
          rt * 0.55,
          5,
          { r2: rt * 0.2 },
        );
      }
    };
    const branch = (from, dir, len, thick, depth, steep) => {
      const to = from.clone().addScaledVector(dir, len);
      b.rod("bark", from, to, thick, depth ? 4 : 5, {
        r2: thick * 0.6,
        grime: 0.1,
      });
      if (depth >= 2 || len < 0.6) return;
      const n = depth ? 2 : 3;
      for (let i = 0; i < n; i++) {
        const a = r() * TAU,
          d2 = dir
            .clone()
            .multiplyScalar(1.4)
            .add(P(Math.cos(a), steep * (0.4 + r() * 0.6), Math.sin(a)))
            .normalize();
        branch(
          to,
          d2,
          len * (0.55 + r() * 0.15),
          thick * 0.55,
          depth + 1,
          steep,
        );
      }
    };
    const rt = 0.2 + h * 0.018;
    if (kind === "stump") {
      const sh = 0.5 + r() * 0.9;
      trunk(-0.2, sh, rt * 1.4, rt * 1.2);
      flare(rt * 1.2);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * TAU;
        const cg = new THREE.ConeGeometry(rt * 0.45, 0.25 + r() * 0.4, 3, 1);
        b.add("bark", cg, {
          m: LB.m4(
            Math.cos(a) * rt * 0.8,
            sh + 0.12,
            Math.sin(a) * rt * 0.8,
            a,
            0,
            0,
          ),
        });
      }
    } else if (kind === "snag") {
      const top = trunk(-0.3, h * (0.55 + r() * 0.2), rt * 1.1, rt * 0.7);
      flare(rt);
      for (let i = 0; i < 3; i++) {
        const cg = new THREE.ConeGeometry(rt * 0.5, 0.6 + r() * 0.8, 3, 1);
        b.add("bark", cg, {
          m: LB.m4(
            top.x + (r() - 0.5) * rt,
            top.y + 0.2,
            top.z + (r() - 0.5) * rt,
            r() * TAU,
            (r() - 0.5) * 0.4,
            0,
          ),
        });
      }
      for (let i = 0; i < 2; i++) {
        const a = r() * TAU;
        branch(
          P(0, h * (0.3 + i * 0.15), 0),
          P(Math.cos(a), 0.5, Math.sin(a)).normalize(),
          h * 0.18,
          rt * 0.4,
          1,
          0.5,
        );
      }
    } else if (kind === "oak") {
      const top = trunk(-0.3, h * 0.32, rt * 1.35, rt * 0.95);
      flare(rt * 1.1);
      const n = 4 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + r() * 0.6;
        branch(
          top,
          P(Math.cos(a), 0.35 + r() * 0.35, Math.sin(a)).normalize(),
          h * (0.34 + r() * 0.1),
          rt * 0.55,
          0,
          0.25,
        );
      }
    } else {
      // elm: tall vase
      const top = trunk(-0.3, h * 0.42, rt, rt * 0.75);
      flare(rt * 0.8);
      const n = 3 + Math.floor(r() * 2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + r() * 0.5;
        branch(
          top,
          P(Math.cos(a) * 0.45, 1, Math.sin(a) * 0.45).normalize(),
          h * (0.3 + r() * 0.08),
          rt * 0.5,
          0,
          0.9,
        );
      }
    }
    b.frame(null);
    if (o.collide)
      LB.col(x, z, rt * 2.2, rt * 2.2, 0, 3, 0, {
        walkable: false,
        surface: "wood",
      });
  };
  /** Random tree kind mix for a park (weights: elm, oak, snag, stump, fallen). */
  LB.treeMix = function (r, w) {
    w = w || [0.4, 0.3, 0.15, 0.1, 0.05];
    let v = r();
    const k = ["elm", "oak", "snag", "stump", "fallen"];
    for (let i = 0; i < 5; i++) {
      if ((v -= w[i]) < 0) return k[i];
    }
    return "elm";
  };

  // =====================================================================
  // WASHINGTON SQUARE
  // =====================================================================
