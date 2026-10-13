/* src/landmarks_b/40_parks.js */
/* =====================================================================
 * LANDMARKS B — WASHINGTON SQUARE PARK (arch + fountain) and
 * BATTERY PARK (Castle Clinton, promenade, piers, Staten Island ferry
 * wreck, Bowling Green fence, shellback nests, skiff ferry ↔ Liberty).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !THREE || !G._lb) return;
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
  LB.addBuilder(
    "washington_square",
    function (LB, site, root) {
      const K = LB.kit,
        D = LB.dress;
      const b = LB.batch("washington_square");
      b.ground = 0;
      b.aoH = 2.5;
      const anchors = {};
      // Round 1 refit: the square now sits on the Fifth Avenue axis (site x 86…154, z 407…458). The Arch closes the
      // vista down Fifth Ave at the north edge; the fountain sits on the arch axis (the 2009 realignment) and eight
      // paths radiate from its plaza to the arch, the four corners and the middle of the other three sides — the real
      // park's star plan. Lawns are the wedges between the paths (low hoop fences), corners open into small plazas.
      const SX0 = site.x0,
        SX1 = site.x1,
        SZ0 = site.z0,
        SZ1 = site.z1;
      const CX = site.arch ? site.arch.x : (SX0 + SX1) / 2;
      const AZ = site.arch ? site.arch.z : SZ0 + 4;
      const CZ = Math.min(SZ1 - 17, AZ + 25);
      const PR = 14.5,
        PW = 2.3,
        EDGE = 2.8; // fountain plaza radius, path half-width, perimeter walk
      const RX0 = SX0 + EDGE,
        RX1 = SX1 - EDGE,
        RZ0 = SZ0 + EDGE,
        RZ1 = SZ1 - EDGE;
      // ---- ground: granite-kerbed paving over the whole square
      b.boxMM("sidewalk", SX0, 0, SZ0, SX1, 0.06, SZ1, {
        grime: 0.6,
        noAO: true,
        uvScale: 4,
      });
      for (const [x0, z0, x1, z1] of [
        [SX0, SZ0, SX1, SZ0 + 0.35],
        [SX0, SZ1 - 0.35, SX1, SZ1],
        [SX0, SZ0, SX0 + 0.35, SZ1],
        [SX1 - 0.35, SZ0, SX1, SZ1],
      ])
        b.boxMM("granite", x0, 0.06, z0, x1, 0.16, z1, {
          seg: false,
          grime: 0.5,
        });
      // plaza ring: a slightly darker granite band + kerb round the fountain plaza
      b.lathe(
        "granite",
        [
          [PR - 0.9, 0.06],
          [PR + 0.35, 0.06],
          [PR + 0.35, 0.2],
          [PR - 0.9, 0.09],
        ],
        48,
        CX,
        0,
        CZ,
        { grime: 0.5, noAO: true },
      );
      // ---- the eight radial paths (targets) and the lawn wedges between them
      const targets = [
        [CX, SZ0],
        [SX1, SZ0],
        [SX1, CZ],
        [SX1, SZ1],
        [CX, SZ1],
        [SX0, SZ1],
        [SX0, CZ],
        [SX0, SZ0],
      ];
      const rays = targets
        .map(([x, z]) => {
          const dx = x - CX,
            dz = z - CZ,
            l = Math.hypot(dx, dz);
          return {
            ux: dx / l,
            uz: dz / l,
            a: Math.atan2(dz, dx),
            tx: x,
            tz: z,
          };
        })
        .sort((p, q) => p.a - q.a);
      const cross = (ux, uz, x, z) => ux * (z - CZ) - uz * (x - CX);
      // convex clip (Sutherland–Hodgman) against f(p) >= 0
      const clip = (poly, f) => {
        const out = [];
        for (let i = 0; i < poly.length; i++) {
          const p = poly[i],
            q = poly[(i + 1) % poly.length],
            fp = f(p[0], p[1]),
            fq = f(q[0], q[1]);
          if (fp >= 0) out.push(p);
          if (fp >= 0 !== fq >= 0) {
            const t = fp / (fp - fq);
            out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
          }
        }
        return out;
      };
      // corner plazas (the SW one is the chess plaza): cut each corner at distance d along the diagonal
      const corners = [
        [RX0, RZ0, 8],
        [RX1, RZ0, 8],
        [RX1, RZ1, 8],
        [RX0, RZ1, 15],
      ];
      const cornerCut = corners.map(([x, z, d]) => {
        const dx = CX - x,
          dz = CZ - z,
          l = Math.hypot(dx, dz);
        return (px, pz) => ((px - x) * dx) / l + ((pz - z) * dz) / l - d;
      });
      const lawns = [];
      for (let i = 0; i < rays.length; i++) {
        const r1 = rays[i],
          r2 = rays[(i + 1) % rays.length];
        let poly = [
          [RX0, RZ0],
          [RX1, RZ0],
          [RX1, RZ1],
          [RX0, RZ1],
        ];
        poly = clip(poly, (x, z) => cross(r1.ux, r1.uz, x, z) - PW);
        poly = clip(poly, (x, z) => -cross(r2.ux, r2.uz, x, z) - PW);
        for (const f of cornerCut) poly = clip(poly, f);
        if (poly.length < 3) continue;
        // cut the plaza circle out (the wedge apex lies inside it, so the boundary crosses it exactly twice)
        const RC = PR + 0.9,
          out = (p) => Math.hypot(p[0] - CX, p[1] - CZ) > RC;
        const n = poly.length;
        let s = -1;
        for (let k = 0; k < n; k++)
          if (!out(poly[k]) && out(poly[(k + 1) % n])) {
            s = k;
            break;
          }
        if (s < 0) {
          lawns.push(poly);
          continue;
        }
        const hit = (p, q) => {
          // circle crossing on segment p→q
          let lo = 0,
            hi = 1;
          const ip = out(p);
          for (let it = 0; it < 30; it++) {
            const m = (lo + hi) / 2,
              x = p[0] + (q[0] - p[0]) * m,
              z = p[1] + (q[1] - p[1]) * m;
            if (out([x, z]) === ip) lo = m;
            else hi = m;
          }
          return [p[0] + (q[0] - p[0]) * hi, p[1] + (q[1] - p[1]) * hi];
        };
        const res = [hit(poly[s], poly[(s + 1) % n])];
        let k = (s + 1) % n;
        while (out(poly[k])) {
          res.push(poly[k]);
          if (!out(poly[(k + 1) % n])) break;
          k = (k + 1) % n;
        }
        const e2 = hit(poly[k], poly[(k + 1) % n]);
        res.push(e2);
        const a0 = Math.atan2(e2[1] - CZ, e2[0] - CX),
          a1 = Math.atan2(res[0][1] - CZ, res[0][0] - CX);
        let da = a1 - a0;
        while (da > Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        const steps = Math.max(2, Math.ceil(Math.abs(da) / 0.12));
        for (let j = 1; j < steps; j++) {
          const a = a0 + (da * j) / steps;
          res.push([CX + Math.cos(a) * RC, CZ + Math.sin(a) * RC]);
        }
        lawns.push(res);
      }
      const inLawn = (x, z, pad) =>
        lawns.some((p) =>
          G.LAYOUT.pointInPoly(x, z, pad ? K.offsetPoly(p, -pad) : p),
        );
      lawns.forEach((p, li) => {
        K.prism(b, "grass", p, 0.06, 0.13, {
          grime: 0.6,
          noAO: true,
          c: [0xffffff, 0xd6cdb4, 0xece6d0, 0xc4bca4][li % 4],
        }); // per-wedge tone
        const f = K.offsetPoly(p, -0.3);
        LB.railing(b, f.concat([f[0]]), 0.13, 0.42, "iron", { postStep: 1.6 });
      });
      // ---- central fountain (large, dry, toxic puddle) on the arch axis
      K.fountain(b, CX, 0.06, CZ, 9.5, { key: "granite", water: false });
      b.cyl("goo", CX + 1.6, 0.12, CZ + 1.2, 5.2, 5.2, 0.05, 24, { hSeg: 1 });
      b.cyl("granite", CX, 0.06, CZ, 1.1, 1.4, 0.8, 12, { hSeg: 1 });
      b.cyl("granite", CX, 0.86, CZ, 0.45, 0.6, 0.9, 10, { hSeg: 1 });
      b.cyl("rust", CX, 1.76, CZ, 0.12, 0.16, 0.5, 8, { hSeg: 1 });
      LB.col(CX, CZ, 2.4, 2.4, 0, 1.8, 0, { walkable: false });
      try {
        G.world.addRadSource({
          x: CX + 1.6,
          y: 0.3,
          z: CZ + 1.2,
          radius: 5.5,
          strength: 1.2,
        });
      } catch (e) {
        /* */
      }
      // ---- the Arch (north end, closing the vista down Fifth Avenue)
      const AW = 12.4,
        AH = 13.2,
        AD = 3.6,
        OW = 5.6,
        SPR = 6.2;
      const sh = new THREE.Shape();
      sh.moveTo(-AW / 2, 0);
      sh.lineTo(AW / 2, 0);
      sh.lineTo(AW / 2, AH);
      sh.lineTo(-AW / 2, AH);
      sh.closePath();
      const hole = new THREE.Path();
      hole.moveTo(-OW / 2, 0);
      hole.lineTo(OW / 2, 0);
      hole.lineTo(OW / 2, SPR);
      hole.absarc(0, SPR, OW / 2, 0, Math.PI, false);
      hole.lineTo(-OW / 2, 0);
      sh.holes.push(hole);
      const ag = new THREE.ExtrudeGeometry(sh, {
        depth: AD,
        bevelEnabled: false,
        curveSegments: 16,
      });
      b.add("marble", ag, {
        m: LB.m4(CX, 0.06, AZ - AD / 2),
        grime: 0.55,
        aoH: 4,
      });
      for (const face of [-1, 1]) {
        const fz = face < 0 ? AZ - AD / 2 - 0.12 : AZ + AD / 2 + 0.12;
        for (const sx of [-1, 1])
          b.box("marble", CX + sx * (OW / 2 + 1.7), 0.06, fz, 2.6, SPR, 0.25, {
            seg: false,
            grime: 0.5,
          });
        for (let i = 0; i <= 14; i++) {
          const a = (i / 14) * Math.PI;
          const px = CX + Math.cos(a) * (OW / 2 + 0.45),
            py = 0.06 + SPR + Math.sin(a) * (OW / 2 + 0.45);
          b.box("marble", px, py - 0.35, fz, 0.9, 0.7, 0.3, {
            rz: a - Math.PI / 2,
            seg: false,
            grime: 0.3,
          });
        }
        b.box(
          "marble",
          CX,
          SPR + OW / 2 + 0.2,
          fz + face * 0.1,
          0.7,
          1.0,
          0.4,
          { seg: false },
        ); // keystone
        for (const sx of [-1, 1]) {
          // winged Victory in low relief in each spandrel
          const vs = new THREE.Shape();
          vs.moveTo(0, 0);
          vs.quadraticCurveTo(0.9, 0.2, 1.9, 0.9);
          vs.lineTo(2.2, 1.35);
          vs.quadraticCurveTo(2.0, 1.55, 1.75, 1.3);
          vs.lineTo(1.5, 1.2);
          vs.quadraticCurveTo(1.4, 2.4, 0.4, 2.9);
          vs.quadraticCurveTo(0.9, 2.0, 0.9, 1.1);
          vs.quadraticCurveTo(0.4, 0.8, -0.2, 0.35);
          vs.closePath();
          const vg = new THREE.ExtrudeGeometry(vs, {
            depth: 0.18,
            bevelEnabled: true,
            bevelSize: 0.05,
            bevelThickness: 0.05,
            bevelSegments: 1,
            curveSegments: 5,
          });
          const vry = sx > 0 ? 0 : Math.PI;
          const vz =
            face > 0 ? (sx > 0 ? fz : fz + 0.2) : sx > 0 ? fz - 0.2 : fz;
          b.add("marble", vg, {
            m: LB.m4(CX + sx * 2.9, 8.9, vz, vry),
            grime: 0.35,
          });
        }
        // eagle-and-rosette frieze band under the cornice
        for (let k = 0; k < 9; k++)
          b.cyl(
            "marble",
            CX - AW / 2 + 0.9 + (k * (AW - 1.8)) / 8,
            AH - 2.1,
            fz + face * 0.05,
            0.28,
            0.28,
            0.12,
            8,
            { hSeg: 1, rx: Math.PI / 2 },
          );
      }
      b.boxMM(
        "marble",
        CX - AW / 2 - 0.3,
        AH - 1.4,
        AZ - AD / 2 - 0.3,
        CX + AW / 2 + 0.3,
        AH - 0.8,
        AZ + AD / 2 + 0.3,
        { seg: false },
      );
      b.boxMM(
        "marble",
        CX - AW / 2 - 0.5,
        AH,
        AZ - AD / 2 - 0.5,
        CX + AW / 2 + 0.5,
        AH + 0.6,
        AZ + AD / 2 + 0.5,
        { seg: false },
      );
      b.boxMM(
        "marble",
        CX - AW / 2 + 0.2,
        AH + 0.6,
        AZ - AD / 2 + 0.2,
        CX + AW / 2 - 0.2,
        AH + 2.9,
        AZ + AD / 2 - 0.2,
        { seg: false, grime: 0.45 },
      );
      // a chunk of the attic blown off the NE corner, lying at the pier foot
      b.rock("marble", CX + AW / 2 - 0.4, 0.3, AZ + AD / 2 + 1.6, 0.9, {
        flat: 0.6,
        rough: 0.2,
        seed: 7,
      });
      b.rock("marble", CX + AW / 2 + 1.1, 0.2, AZ + AD / 2 + 0.9, 0.55, {
        flat: 0.6,
        rough: 0.2,
        seed: 9,
      });
      const insK = LB.texMat(
        "wsq_ins",
        LB.signTex("wsq_ins", ["WASHINGTON"], "engraved", 1024, 128, {
          bg: "#cfc7b4",
          size: 84,
        }),
      );
      b.quad(insK, CX, AH + 1.75, AZ - AD / 2 + 0.17, 9, 1.1, { ry: Math.PI });
      const ins2 = LB.texMat(
        "wsq_ins2",
        LB.signTex(
          "wsq_ins2",
          ["MDCCLXXXIX · MDCCCLXXXIX"],
          "engraved",
          1024,
          128,
          { bg: "#cfc7b4", size: 60 },
        ),
      );
      b.quad(ins2, CX, AH + 1.75, AZ + AD / 2 - 0.17, 9, 1.1, {});
      // Washington statues on the north pier faces (at War / at Peace)
      for (const sx of [-1, 1]) {
        const px = CX + sx * (OW / 2 + 1.7),
          pz = AZ - AD / 2 - 0.95;
        b.box("marble", px, 0.06, pz, 2.2, 1.8, 1.5, { seg: false });
        b.cyl("marble", px, 1.86, pz, 0.45, 0.6, 2.2, 10, { hSeg: 2 });
        b.sphere("marble", px, 4.3, pz, 0.28, {});
        b.box("marble", px, 3.5, pz, 1.1, 0.5, 0.5, { seg: false });
        b.cyl("marble", px - sx * 0.6, 2.4, pz - 0.2, 0.4, 0.2, 1.6, 6, {
          hSeg: 1,
          rz: sx * 0.2,
        });
        if (sx < 0)
          b.beam(
            "marble",
            V(px + 0.5, 3.6, pz),
            V(px + 0.6, 2.2, pz - 0.4),
            0.08,
          );
        else
          b.box("marble", px + 0.5, 3.4, pz - 0.25, 0.4, 0.5, 0.08, {
            seg: false,
          });
        LB.col(px, pz, 2.2, 1.5, 0, 4.6, 0, { walkable: false });
      }
      LB.colMM(CX - AW / 2, 0, AZ - AD / 2, CX - OW / 2, AH + 3, AZ + AD / 2, {
        walkable: false,
      });
      LB.colMM(CX + OW / 2, 0, AZ - AD / 2, CX + AW / 2, AH + 3, AZ + AD / 2, {
        walkable: false,
      });
      LB.colMM(
        CX - OW / 2,
        SPR + OW / 2,
        AZ - AD / 2,
        CX + OW / 2,
        AH + 3,
        AZ + AD / 2,
        { walkable: false },
      );
      const grK = LB.texMat(
        "wsq_graf",
        LB.signTex(
          "wsq_graf",
          ["WE WATCHED", "THE WRONG SKY"],
          "raider",
          512,
          256,
          { bg: "#c8c0ac", fg: "#6a2a24" },
        ),
      );
      b.quad(grK, CX + OW / 2 + 1.7, 2.6, AZ + AD / 2 + 0.26, 2.4, 1.2, {});
      // ---- furniture: benches round the fountain plaza (between the path mouths), lamps along every path
      const pathAt = (x, z, pad) =>
        rays.some((r) => {
          const t = (x - CX) * r.ux + (z - CZ) * r.uz;
          return t > 0 && Math.abs(cross(r.ux, r.uz, x, z)) < PW + (pad || 0);
        });
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2,
          x = CX + Math.cos(a) * (PR - 1.6),
          z = CZ + Math.sin(a) * (PR - 1.6);
        if (pathAt(x, z, 1.4) || i % 2) continue;
        LB.bench(b, x, 0.06, z, Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI);
      }
      for (const r of rays) {
        const len = Math.hypot(r.tx - CX, r.tz - CZ);
        for (let t = PR + 4, k = 0; t < len - 3; t += 11, k++) {
          const side = k % 2 ? 1 : -1,
            px = -r.uz * side,
            pz = r.ux * side;
          const x = CX + r.ux * t + px * (PW - 0.35),
            z = CZ + r.uz * t + pz * (PW - 0.35);
          LB.lampPost(b, x, 0.06, z, false);
          if (k % 2 === 0 && t + 5 < len - 3)
            LB.bench(
              b,
              CX + r.ux * (t + 5) - px * (PW - 0.5),
              0.06,
              CZ + r.uz * (t + 5) - pz * (PW - 0.5),
              Math.atan2(r.ux, r.uz) + (side > 0 ? -Math.PI / 2 : Math.PI / 2),
            );
        }
      }
      // ---- trees: dead elms in the lawns (collider trunks); the Hangman's Elm in the NW corner
      const r = LB.rng("wsq2");
      const trees = [];
      for (const p of lawns) {
        let minX = 1e9,
          maxX = -1e9,
          minZ = 1e9,
          maxZ = -1e9;
        for (const q of p) {
          minX = Math.min(minX, q[0]);
          maxX = Math.max(maxX, q[0]);
          minZ = Math.min(minZ, q[1]);
          maxZ = Math.max(maxZ, q[1]);
        }
        let placed = 0;
        for (let tries = 0; tries < 40 && placed < 3; tries++) {
          const x = minX + r() * (maxX - minX),
            z = minZ + r() * (maxZ - minZ);
          if (!G.LAYOUT.pointInPoly(x, z, K.offsetPoly(p, -1.6))) continue;
          if (trees.some((t) => Math.hypot(t[0] - x, t[1] - z) < 7)) continue;
          trees.push([x, z]);
          placed++;
          const kind = LB.treeMix(r, [0.6, 0.2, 0.12, 0.08, 0]); // mostly vase elms, as in the real square
          LB.parkTree(b, x, z, {
            kind,
            h: 8 + r() * 6,
            lean: r() < 0.3 ? 0.06 + r() * 0.14 : r() * 0.04,
            seed: Math.round(x * 7 + z),
          });
          if (kind !== "stump")
            LB.col(x, z, 0.7, 0.7, 0, 4, 0, {
              walkable: false,
              surface: "wood",
            });
        }
      }
      // ---- lawn ground variety (round 1 revise): trampled bare patches, straw-pale dead grass, tufts, a glowing puddle,
      // rubble and burrow-rat spoil so no two wedges read as the same flat brown polygon
      lawns.forEach((p, li) => {
        let cx = 0,
          cz = 0;
        for (const q of p) {
          cx += q[0];
          cz += q[1];
        }
        cx /= p.length;
        cz /= p.length;
        const inner = K.offsetPoly(p, -0.8),
          inside = (x, z) => G.LAYOUT.pointInPoly(x, z, inner);
        let minR = 1e9;
        for (let i = 0; i < p.length; i++) {
          const a = p[i],
            c = p[(i + 1) % p.length];
          const ex = c[0] - a[0],
            ez = c[1] - a[1],
            l = Math.hypot(ex, ez) || 1;
          minR = Math.min(
            minR,
            Math.abs(((cx - a[0]) * ez - (cz - a[1]) * ex) / l),
          );
        }
        const R = Math.max(1.5, minR - 1.0);
        LB.blob(
          b,
          "grass",
          cx + (r() - 0.5) * R * 0.5,
          cz + (r() - 0.5) * R * 0.5,
          R * 0.95,
          R * 0.7,
          0.133,
          { ry: r() * 3, c: 0xd8c898, seed: li * 17 + 3, grime: 0.3 },
        );
        LB.blob(
          b,
          "dirt",
          cx + (r() - 0.5) * R * 0.6,
          cz + (r() - 0.5) * R * 0.6,
          R * 0.45,
          R * 0.3,
          0.136,
          { ry: r() * 3, c: 0x7a6650, seed: li * 17 + 5, amp: 0.35 },
        );
        LB.tufts(
          b,
          cx,
          cz,
          R * 1.6,
          Math.round(R * 4),
          li * 31 + 7,
          inside,
          0.09,
        );
        if (li % 3 === 1)
          LB.puddle(
            b,
            cx + (r() - 0.5) * R * 0.5,
            cz + (r() - 0.5) * R * 0.5,
            0.9 + r() * 0.6,
            0.6 + r() * 0.4,
            li * 7 + 1,
            0.085,
          );
        for (let k = 0; k < 3; k++) {
          const a = r() * TAU,
            d = r() * R * 0.9,
            x = cx + Math.cos(a) * d,
            z = cz + Math.sin(a) * d;
          if (inside(x, z))
            b.rock(
              k ? "rubble" : "dirt",
              x,
              0.1,
              z,
              k ? 0.25 + r() * 0.3 : 0.8,
              { flat: k ? 0.6 : 0.35, seed: li * 13 + k },
            );
        }
      });
      // path litter: paper drifts and junk against the bench backs, a toppled lamp, an abandoned shopping cart
      for (const rr of rays) {
        const t = PR + 7 + r() * 8;
        D.papers(
          b,
          CX + rr.ux * t,
          0.07,
          CZ + rr.uz * t,
          2.2,
          6,
          Math.round(t * 13 + rr.a * 100),
        );
      }
      {
        const rr = rays[2],
          t = PR + 12,
          x = CX + rr.ux * t - rr.uz * 1.2,
          z = CZ + rr.uz * t + rr.ux * 1.2;
        b.beam(
          "iron",
          V(x, 0.12, z),
          V(x + rr.ux * 3.8, 0.35, z + rr.uz * 3.8),
          0.1,
          0.1,
          { grime: 0.5 },
        );
        b.cyl(
          "glass_broken",
          x + rr.ux * 4,
          0.3,
          z + rr.uz * 4,
          0.2,
          0.2,
          0.45,
          6,
          { hSeg: 1, rz: 1.5 },
        );
      }
      {
        // Hangman's Elm: a huge gnarled survivor with one long horizontal limb and a frayed rope
        const hx = RX0 + 5.5,
          hz = RZ0 + 4.5;
        b.rod("bark", V(hx, -0.3, hz), V(hx + 0.4, 6.5, hz + 0.3), 0.75, 8, {
          r2: 0.5,
          grime: 0.3,
        });
        b.rod(
          "bark",
          V(hx + 0.4, 6.2, hz + 0.3),
          V(hx + 6.5, 7.6, hz + 1.4),
          0.36,
          6,
          { r2: 0.16, grime: 0.2 },
        );
        b.rod(
          "bark",
          V(hx + 0.4, 6.4, hz + 0.3),
          V(hx - 2.2, 11.5, hz - 1.8),
          0.4,
          6,
          { r2: 0.18, grime: 0.2 },
        );
        b.rod(
          "bark",
          V(hx + 0.4, 6.4, hz + 0.3),
          V(hx + 1.6, 12.5, hz + 2.4),
          0.36,
          6,
          { r2: 0.14, grime: 0.2 },
        );
        for (let i = 0; i < 4; i++) {
          const a = i * 1.7;
          b.rod(
            "bark",
            V(hx, 0.2, hz),
            V(hx + Math.cos(a) * 1.8, -0.2, hz + Math.sin(a) * 1.8),
            0.28,
            5,
            { r2: 0.1 },
          );
        }
        b.rod(
          "fabric",
          V(hx + 5.2, 7.35, hz + 1.15),
          V(hx + 5.2, 4.6, hz + 1.15),
          0.025,
          4,
          { c: 0x8a7a58 },
        );
        b.add("fabric", new THREE.TorusGeometry(0.16, 0.025, 4, 10), {
          m: LB.m4(hx + 5.2, 4.45, hz + 1.15),
          c: 0x8a7a58,
        });
        LB.col(hx, hz, 1.6, 1.6, 0, 6, 0, { walkable: false, surface: "wood" });
        LB.plaque(
          V(hx + 1.6, 1.2, hz + 1.2),
          "Hangman's Elm",
          '"Oldest tree in Manhattan (c. 1679). Tradition holds that no one was ever hanged here." [Scratched into the bronze underneath, in three different hands: 1971. 1974. 1983.]',
        );
      }
      // ---- the chess plaza (SW corner, Chess Charlie's tables)
      {
        const cx0 = RX0,
          cz0 = RZ1,
          dl = Math.hypot(CX - cx0, CZ - cz0),
          dx = (CX - cx0) / dl,
          dz = (CZ - cz0) / dl;
        let first = null,
          n = 0;
        for (const t of [4.5, 9])
          for (const s of [-9, -5.5, 5.5]) {
            const x = cx0 + dx * t - dz * s,
              z = cz0 + dz * t + dx * s;
            if (x < RX0 - 1.2 || z > RZ1 + 1.2 || n >= 5) continue;
            n++;
            if (!first) first = [x, z];
            b.cyl("granite", x, 0.06, z, 0.25, 0.35, 0.72, 8, { hSeg: 1 });
            b.box("granite", x, 0.78, z, 1.1, 0.1, 1.1, { seg: false });
            b.box("paint_cream", x, 0.88, z, 0.7, 0.01, 0.7, { seg: false });
            for (const d of [-1, 1])
              b.cyl("granite", x + d * 1.0, 0.06, z, 0.22, 0.22, 0.45, 8, {
                hSeg: 1,
              });
            LB.col(x, z, 1.1, 1.1, 0, 0.9, 0, { walkable: false });
          }
        const chessK = LB.texMat(
          "wsq_chess",
          LB.signTex(
            "wsq_chess",
            ["CHESS · 1 SCRIP", "NO RAIDERS NO REFUNDS"],
            "enamel",
            512,
            160,
            { bg: "#2b3a2e", fg: "#e8d8a0" },
          ),
        );
        b.box("iron", cx0 + 1.2, 0.06, cz0 - 1.2, 0.08, 2.4, 0.08, {
          seg: false,
        });
        b.quad(chessK, cx0 + 1.2, 2.2, cz0 - 1.14, 1.8, 0.56, {
          ry: Math.atan2(dx, dz),
        });
        anchors.chess = V(first[0] + 1.0, 0, first[1]);
        anchors.chess.yaw = -Math.PI / 2;
      }
      // ---- squatters' camp in the NE corner plaza (tarp lean-tos, fire barrel, mattresses, shopping cart)
      {
        const x0 = RX1 - 6,
          z0 = RZ0 + 5;
        for (const [dx, dz, ry] of [
          [0, 0, 0.3],
          [-4.2, 1.5, -0.4],
        ]) {
          const x = x0 + dx,
            z = z0 + dz,
            c = Math.cos(ry),
            s = Math.sin(ry);
          for (const k of [-1.3, 1.3])
            b.box("rotten", x + c * k, 0.06, z - s * k, 0.1, 1.9, 0.1, {
              seg: false,
            });
          b.box(
            dx ? "corrugated" : "awning_green",
            x + s * 0.8,
            1.35,
            z + c * 0.8,
            3.0,
            0.05,
            2.0,
            { ry, rx: 0.5, seg: false, grime: 0.6 },
          );
          D.mattress(
            b,
            x + s * 0.9,
            0.06,
            z + c * 0.9,
            ry + Math.PI / 2,
            0xa89878,
          );
        }
        LB.barrel(b, x0 - 2, 0.06, z0 + 3.4, { fire: true });
        D.crates(b, x0 + 2.2, 0.06, z0 + 2.4, 2, 77);
        b.box("chrome", x0 - 1.2, 0.35, z0 + 5.6, 0.9, 0.55, 0.6, {
          ry: 0.6,
          seg: false,
          grime: 0.7,
        });
        anchors.camp = V(x0 - 2, 0, z0 + 4.6);
      }
      // ---- burnt-out bus on the south walk, burrow-rat holes, skeletons, billboard
      b.box("paint_orange", CX + 11.5, 0.3, RZ1 - 0.2, 11, 3.0, 2.6, {
        ry: 0.12,
        seg: false,
        grime: 0.85,
        c: 0x6a4a36,
      });
      LB.col(CX + 11.5, RZ1 - 0.2, 11, 2.6, 0, 3.3, 0.12, { surface: "metal" }); // between the S and SE walks (no radial blocked)
      for (let i = 0; i < 6; i++) {
        let x,
          z,
          g = 0;
        do {
          x = RX0 + r() * (RX1 - RX0);
          z = RZ0 + r() * (RZ1 - RZ0);
        } while (!inLawn(x, z, 1.5) && ++g < 30);
        b.rock("dirt", x, -0.4, z, 1.1 + r() * 0.4, {
          flat: 0.4,
          seed: i * 13 + 5,
        });
      }
      for (let i = 0; i < 4; i++)
        LB.skeleton(
          b,
          RX0 + 4 + r() * (RX1 - RX0 - 8),
          0.1,
          RZ0 + 4 + r() * (RZ1 - RZ0 - 8),
          r() * 6,
        );
      LB.billboard(
        b,
        "freedom_flakes",
        CX + 16,
        0.06,
        SZ1 - 1.2,
        Math.PI,
        13,
        5.6,
        4.5,
      );
      D.papers(b, CX, 0.08, CZ - PR - 3, 5, 18, 91);
      // ---- anchors
      anchors.arch = V(CX, 0, AZ + AD / 2 + 3);
      anchors.fountain = V(CX, 0, CZ + PR - 2.5);
      anchors.entrance = V(CX, 0, AZ - AD / 2 - 5);
      anchors.plaza = V(CX, 0, CZ - PR + 2);
      const sp = [];
      for (const p of lawns) {
        let x = 0,
          z = 0;
        for (const q of p) {
          x += q[0];
          z += q[1];
        }
        sp.push(V(x / p.length, 0, z / p.length));
      }
      for (let i = 0; i < 4; i++)
        anchors["spawn" + (i + 1)] =
          sp[(i * 2 + 1) % sp.length] || V(CX + (i - 1.5) * 8, 0, CZ + 10);
      const g = b.build(root);
      g.name = "washington_square";
      LB.register("washington_square", g, anchors);
      LB.plaque(
        V(CX - 3, 1.3, AZ + AD / 2 + 0.3),
        "Arch Dedication",
        '"Erected by the people of New York to commemorate the centennial of Washington\'s inauguration. Minor pitting on the east pier is the result of the Bleecker Street riot of 1966 and is considered historic."',
      );
    },
    40,
  );

  // =====================================================================
  // BATTERY PARK
  // =====================================================================
  LB.addBuilder(
    "battery_park",
    function (LB, site, root) {
      const K = LB.kit;
      const L = G.LAYOUT;
      const b = LB.batch("battery_park");
      b.ground = 0;
      b.aoH = 2.5;
      const anchors = {};
      // --- shoreline promenade: railing + lamp posts along the Manhattan polygon inside the site
      const shore = [];
      const M = L.MANHATTAN;
      for (let i = 0; i < M.length; i++) {
        const p = M[i],
          q = M[(i + 1) % M.length];
        const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
        const n = Math.ceil(len / 4);
        for (let k = 0; k < n; k++) {
          const t = k / n,
            x = p[0] + (q[0] - p[0]) * t,
            z = p[1] + (q[1] - p[1]) * t;
          if (x > site.x0 - 10 && x < site.x1 + 40 && z > site.z0 - 20)
            shore.push([x, z]);
        }
      }
      // inset 2.5 m toward land; the polygon is clockwise → inward = toward the centroid-ish (north here)
      const promenade = shore.map((p, i) => {
        const a = shore[Math.max(0, i - 1)],
          c = shore[Math.min(shore.length - 1, i + 1)];
        let nx = -(c[1] - a[1]),
          nz = c[0] - a[0];
        const l = Math.hypot(nx, nz) || 1;
        nx /= l;
        nz /= l;
        if (!L.isManhattan(p[0] + nx * 3, p[1] + nz * 3)) {
          nx = -nx;
          nz = -nz;
        }
        return [p[0] + nx * 2.0, p[1] + nz * 2.0, nx, nz];
      });
      const isPier = (x) =>
        Math.abs(x + 100) < 4 || Math.abs(x - 60) < 8 || Math.abs(x + 58) < 4;
      let run = [];
      const flush = () => {
        if (run.length > 1)
          LB.railing(b, run, 0.06, 1.05, "iron", {
            collide: true,
            postStep: 2,
          });
        run = [];
      };
      for (const p of promenade) {
        if (isPier(p[0])) {
          flush();
          continue;
        }
        run.push([p[0], p[1]]);
      }
      flush();
      for (let i = 0; i < promenade.length; i += 4) {
        const p = promenade[i];
        if (isPier(p[0])) continue;
        b.boxMM(
          "sidewalk",
          p[0] - 2.5,
          0,
          p[1] - 2.5,
          p[0] + 2.5,
          0.07,
          p[1] + 2.5,
          { grime: 0.5, noAO: true },
        );
        if (i % 8 === 0)
          LB.lampPost(
            b,
            p[0] + p[2] * 1.5,
            0.07,
            p[1] + p[3] * 1.5,
            i % 24 === 0,
          );
        if (i % 12 === 6)
          LB.bench(
            b,
            p[0] + p[2] * 2.2,
            0.07,
            p[1] + p[3] * 2.2,
            Math.atan2(p[2], p[3]),
          );
      }
      const r = LB.rng("battery");
      // --- Castle Clinton (circular sandstone fort, open courtyard)
      const CCX = -128,
        CCZ = 948,
        CR = 16,
        CT = 2.4,
        CH = 8;
      const gateA = Math.atan2(0, 1); // gate faces east (+x)
      const segN = 40;
      for (let i = 0; i < segN; i++) {
        const a = ((i + 0.5) / segN) * TAU;
        const da = Math.abs(
          Math.atan2(Math.sin(a - gateA), Math.cos(a - gateA)),
        );
        const len = 2 * CR * Math.sin(Math.PI / segN) + 0.15;
        const x = CCX + Math.cos(a) * CR,
          z = CCZ + Math.sin(a) * CR;
        const ry = -a + Math.PI / 2;
        if (da < 0.13) {
          // gate opening: lintel only
          b.box("sandstone", x, 4.6, z, len, CH - 4.6, CT, { ry, grime: 0.6 });
          LB.col(x, z, len, CT, 4.6, CH, ry, { walkable: false });
          continue;
        }
        b.box("sandstone", x, 0, z, len, CH, CT, {
          ry,
          grime: 0.65,
          segLen: 3,
        });
        b.box(
          "sandstone",
          Math.cos(a) * (CR + 0.1) + CCX,
          CH - 0.5,
          Math.sin(a) * (CR + 0.1) + CCZ,
          len + 0.05,
          0.5,
          CT + 0.5,
          { ry, seg: false },
        );
        LB.col(x, z, len, CT, 0, CH, ry, { walkable: false });
        // battered granite plinth, string course, and the openings: splayed gun embrasures (upper tier, every bay)
        // and narrow barred windows (lower tier, every other bay) — dark voids in dressed sandstone frames
        const ox = Math.cos(a),
          oz = Math.sin(a),
          fr = Math.atan2(ox, oz),
          R2 = CR + CT / 2;
        b.box(
          "granite_dark",
          CCX + ox * (R2 - 0.9),
          0,
          CCZ + oz * (R2 - 0.9),
          len + 0.12,
          0.95,
          2.2,
          { ry, seg: false, grime: 0.8, rx: 0 },
        );
        b.box(
          "sandstone",
          CCX + ox * (R2 - 0.9),
          3.9,
          CCZ + oz * (R2 - 0.9),
          len + 0.1,
          0.28,
          2.1,
          { ry, seg: false, grime: 0.5 },
        );
        const opening = (y, w, h, bars) => {
          const px = CCX + ox * (R2 + 0.02),
            pz = CCZ + oz * (R2 + 0.02);
          b.quad("granite_dark", px, y, pz, w, h, {
            ry: fr,
            c: 0x15110d,
            grime: 0,
            noAO: true,
          });
          const jx = (d) => [
            CCX + ox * (R2 + 0.08) - oz * d,
            CCZ + oz * (R2 + 0.08) + ox * d,
          ];
          for (const d of [-(w / 2 + 0.12), w / 2 + 0.12]) {
            const [x2, z2] = jx(d);
            b.box("sandstone", x2, y - h / 2, z2, 0.24, h, 0.2, {
              ry,
              seg: false,
              grime: 0.4,
            });
          }
          {
            const [x2, z2] = jx(0);
            b.box("sandstone", x2, y + h / 2, z2, w + 0.6, 0.32, 0.24, {
              ry,
              seg: false,
              grime: 0.45,
            });
            b.box("sandstone", x2, y - h / 2 - 0.18, z2, w + 0.5, 0.18, 0.3, {
              ry,
              seg: false,
              grime: 0.55,
            });
          }
          if (bars)
            for (const d of [-w / 4, 0, w / 4]) {
              const [x2, z2] = jx(d - 0.04 * 0);
              b.box("iron", x2, y - h / 2, z2, 0.04, h, 0.04, {
                ry,
                seg: false,
                grime: 0.3,
              });
            }
        };
        opening(5.6, 0.9, 1.0, false);
        if (i % 2 === 0) opening(2.3, 0.55, 1.5, true);
      }
      // round-arched gate: voussoir ring on the portal
      {
        const sh = new THREE.Shape();
        sh.absarc(0, 0, 2.55, 0, Math.PI, false);
        sh.lineTo(-1.9, 0);
        sh.absarc(0, 0, 1.9, Math.PI, 0, true);
        sh.lineTo(2.55, 0);
        b.add(
          "sandstone",
          new THREE.ExtrudeGeometry(sh, {
            depth: 0.5,
            bevelEnabled: false,
            curveSegments: 9,
          }),
          {
            m: LB.m4(CCX + CR + CT / 2 + 0.05, 2.7, CCZ, Math.PI / 2),
            grime: 0.5,
          },
        );
        for (let k = 0; k < 11; k++) {
          const t = (k / 10) * Math.PI;
          b.box(
            "granite_dark",
            CCX + CR + CT / 2 + 0.56,
            2.7 + Math.sin(t) * 2.22 - 0.03,
            CCZ - Math.cos(t) * 2.22,
            0.02,
            0.06,
            0.66,
            { rx: t, seg: false, grime: 0.2 },
          );
        }
      }
      // gate portal with pilasters and a sign
      const gx = CCX + CR + CT / 2 + 0.3;
      for (const dz of [-2.4, 2.4])
        b.box("sandstone", gx, 0, CCZ + dz, 0.6, 5.4, 1.0, { seg: false });
      b.box("sandstone", gx, 4.6, CCZ, 0.7, 1.0, 5.8, { seg: false });
      const ccK = LB.texMat(
        "castle_clinton",
        LB.signTex("castle_clinton", ["CASTLE CLINTON"], "engraved", 512, 96, {
          bg: "#a8826a",
        }),
      );
      b.quad(ccK, gx + 0.36, 5.1, CCZ, 4.4, 0.8, { ry: Math.PI / 2 });
      // courtyard: dirt, ruined ticket kiosks, shellback nests, flag pole
      const cyard = new THREE.CircleGeometry(CR - CT / 2, 32);
      cyard.rotateX(-Math.PI / 2);
      b.add("dirt", cyard, {
        m: LB.m4(CCX, 0.05, CCZ),
        grime: 0.5,
        noAO: true,
      });
      LB.shellbackNest(b, CCX - 5, CCZ + 4, 1.2);
      LB.shellbackNest(b, CCX - 2, CCZ - 7, 1.0);
      b.boxMM("corrugated", CCX + 4, 0, CCZ - 9, CCX + 8, 2.6, CCZ - 6, {
        grime: 0.7,
      });
      LB.colMM(CCX + 4, 0, CCZ - 9, CCX + 8, 2.6, CCZ - 6, { walkable: false });
      b.cyl("iron", CCX, 0, CCZ, 0.08, 0.12, 12, 6, { hSeg: 2 });
      const flag = LB.makeFlag ? LB.makeFlag(LB.flagTex(1), 3.4, 1.9) : null;
      if (flag) {
        flag.position.set(CCX, 11.8, CCZ);
        root.add(flag);
        LB.animate(flag.position, 240, (t) => flag.userData.wave(t));
      }
      anchors.castle = V(CCX + 3, 0, CCZ + 2);
      anchors.castle_gate = V(gx + 3, 0, CCZ);
      anchors.nest1 = V(CCX - 5, 0, CCZ + 4);
      anchors.nest2 = V(-30, 0, 1000);
      // --- piers: ferry skiff pier (to Liberty), fishing pier, Whitehall ferry slip + wreck
      const pier = (x, z0, z1, w) => {
        b.boxMM("planks", x - w / 2, 0.15, z0, x + w / 2, 0.45, z1, {
          grime: 0.6,
          ground: -1.2,
        });
        for (let z = z0 + 1.5; z < z1; z += 3)
          for (const s of [-1, 1])
            b.cyl("rotten", x + s * (w / 2 - 0.2), -5, z, 0.2, 0.22, 5.4, 6, {
              hSeg: 2,
              ground: -1.2,
            });
        LB.colMM(x - w / 2, -3, z0, x + w / 2, 0.45, z1, { surface: "wood" });
        LB.railing(
          b,
          [
            [x - w / 2 + 0.1, z0 + 1],
            [x - w / 2 + 0.1, z1 - 0.1],
          ],
          0.45,
          1.0,
          "iron",
          { collide: true },
        );
        LB.railing(
          b,
          [
            [x + w / 2 - 0.1, z0 + 1],
            [x + w / 2 - 0.1, z1 - 0.1],
          ],
          0.45,
          1.0,
          "iron",
          { collide: true },
        );
      };
      const shoreZ = (x) => {
        for (let z = 900; z < 1100; z += 0.5)
          if (!L.isManhattan(x, z)) return z;
        return 1000;
      };
      const skZ = shoreZ(-100);
      pier(-100, skZ - 4, skZ + 20, 5);
      pier(-58, shoreZ(-58) - 4, shoreZ(-58) + 14, 4);
      // skiff moored + booth + sign
      if (LB.buildSkiff) LB.buildSkiff(b, LB.m4(-96.6, -1.0, skZ + 16, 0.05));
      b.boxMM("panel", -104, 0.45, skZ + 1, -102, 2.9, skZ + 3, { grime: 0.6 });
      b.box("paint_teal", -103, 2.9, skZ + 2, 2.6, 0.2, 2.6, { seg: false });
      const skK = LB.texMat(
        "battery_skiff",
        LB.signTex(
          "battery_skiff",
          ["HARBOR SKIFF", "LIBERTY ISLAND  ▸"],
          "enamel",
          512,
          192,
          { bg: "#1c3c52" },
        ),
      );
      b.quad(skK, -103, 3.6, skZ + 3.35, 2.4, 0.9, {});
      b.box("rotten", -103, 2.9, skZ + 3.2, 0.12, 1.4, 0.12, { seg: false });
      anchors.skiff = V(-100, 0.45, skZ + 14);
      const arriveB = { x: -100, y: 0.5, z: skZ + 8, yaw: 0 };
      LB.batteryArrive = arriveB;
      // Whitehall slip + the wrecked ferry, half sunk and listing
      const wx = 60,
        wz0 = shoreZ(60);
      b.boxMM("concrete", wx - 9, -3, wz0 - 3, wx + 9, 0.5, wz0 + 12, {
        grime: 0.8,
        ground: -1.2,
      });
      LB.colMM(wx - 9, -3, wz0 - 3, wx + 9, 0.5, wz0 + 12);
      for (const s of [-1, 1])
        for (let k = 0; k < 6; k++)
          b.cyl(
            "rotten",
            wx + s * 11,
            -4,
            wz0 + 10 + k * 4,
            0.35,
            0.4,
            6.5,
            6,
            { hSeg: 2, ground: -1.2 },
          );
      buildFerryWreck(b, LB.m4(wx + 2, -2.4, wz0 + 34, 0.12, 0.05, -0.16));
      LB.col(wx + 2, wz0 + 34, 12, 40, -3, 5, 0.12, { surface: "metal" });
      try {
        G.world.addRadSource({
          x: wx + 2,
          y: 0,
          z: wz0 + 40,
          radius: 18,
          strength: 3.5,
        });
      } catch (e) {
        /* */
      }
      anchors.ferry_wreck = V(wx, 0.5, wz0 + 8);
      // Bowling Green oval iron fence (1771) at the foot of Broadway (round 1: Broadway now ends at x 40 — follow it)
      const BW = G.LAYOUT.BROADWAY[G.LAYOUT.BROADWAY.length - 1],
        BGX = BW[0],
        BGZ = Math.max(BW[1] + 29, site.z0 + 21);
      {
        // the 1771 fence: 1.9 m cast-iron pickets with spear tips between moulded rails, posts every ~3 m carrying the crown
        // finials (the originals were sawn off in 1776 — these are the replacements, half of them looted again), gaps at
        // the north and south tips; a cobbled apron and a ring of wrecked benches outside it.
        const RX = 6.5,
          RZ = 11.5,
          N = 64,
          oval = (a, k) => [
            BGX + Math.cos(a) * RX * k,
            BGZ + Math.sin(a) * RZ * k,
          ];
        const gap = (a) => {
          const s2 = Math.sin(a);
          return s2 > 0.985 || s2 < -0.985;
        };
        const apron = new THREE.RingGeometry(1, 1.28, 48, 1);
        apron.rotateX(-Math.PI / 2);
        b.add("granite_block", apron, {
          m: LB.m4(BGX, 0.065, BGZ, 0, 0, 0, RX, 1, RZ),
          grime: 0.7,
          noAO: true,
          uvScale: 1.2,
        });
        const bgl = new THREE.CircleGeometry(1, 32);
        bgl.rotateX(-Math.PI / 2);
        b.add("grass", bgl, {
          m: LB.m4(BGX, 0.06, BGZ, 0, 0, 0, RX - 0.2, 1, RZ - 0.2),
          grime: 0.45,
          noAO: true,
        });
        LB.tufts(
          b,
          BGX,
          BGZ,
          5.5,
          26,
          71,
          (x, z) =>
            Math.hypot((x - BGX) / (RX - 0.6), (z - BGZ) / (RZ - 0.6)) < 1 &&
            Math.hypot(x - BGX, z - BGZ) > 4.2,
        );
        const rf = LB.rng("bgfence");
        for (let i = 0; i < N; i++) {
          const a0 = (i / N) * TAU,
            a1 = ((i + 1) / N) * TAU;
          if (gap((a0 + a1) / 2)) continue;
          const [x0, z0] = oval(a0, 1),
            [x1, z1] = oval(a1, 1);
          for (const y of [0.18, 1.62])
            b.beam("iron", V(x0, y, z0), V(x1, y, z1), 0.07, 0.09, {
              grime: 0.3,
            });
          const len = Math.hypot(x1 - x0, z1 - z0),
            np = Math.max(2, Math.round(len / 0.24));
          for (let k = 0; k < np; k++) {
            if (rf() < 0.06) continue; // missing picket
            const t = k / np,
              x = x0 + (x1 - x0) * t,
              z = z0 + (z1 - z0) * t,
              bent = rf() < 0.05 ? (rf() - 0.5) * 0.6 : 0;
            b.box("iron", x, 0.05, z, 0.035, 1.8, 0.035, {
              seg: false,
              rx: bent,
              grime: 0.2,
            });
            const tip = new THREE.ConeGeometry(0.045, 0.16, 4, 1);
            b.add("iron", tip, { m: LB.m4(x, 1.93, z), grime: 0.2 });
          }
          if (i % 3 === 0) {
            // post + crown finial
            b.box("iron", x0, 0.05, z0, 0.13, 1.9, 0.13, { seg: false });
            if (rf() < 0.55) {
              b.cyl("gilt", x0, 1.95, z0, 0.1, 0.07, 0.14, 6, { hSeg: 1 });
              for (let q = 0; q < 4; q++) {
                const qa = (q / 4) * TAU;
                b.add("gilt", new THREE.ConeGeometry(0.03, 0.14, 3, 1), {
                  m: LB.m4(
                    x0 + Math.cos(qa) * 0.08,
                    2.14,
                    z0 + Math.sin(qa) * 0.08,
                  ),
                });
              }
              b.sphere("gilt", x0, 2.2, z0, 0.045, { ws: 6, hs: 4 });
            } else
              b.box("iron", x0, 1.95, z0, 0.06, 0.05 + rf() * 0.08, 0.06, {
                seg: false,
              }); // sawn-off stub
          }
          LB.colWall(x0, z0, x1, z1, 0.15, 0, 2.0, {
            walkable: false,
            surface: "metal",
          });
        }
        for (let i = 0; i < 6; i++) {
          // wrecked benches round the apron (one toppled)
          const a = ((i + 0.5) / 6) * TAU,
            [x, z] = oval(a, 1.45);
          if (i === 2) b.frame(LB.m4(x, 0.07, z, a + Math.PI / 2, 0, 1.45));
          else
            b.frame(LB.m4(x, 0.07, z, a + Math.PI / 2 + (i === 4 ? 0.3 : 0)));
          LB.bench(b, 0, 0, 0, 0);
          b.frame(null);
        }
      }
      K.fountain(b, BGX, 0.06, BGZ, 3.2, { key: "granite", water: false });
      b.cyl("goo", BGX + 0.4, 0.12, BGZ - 0.3, 1.9, 1.9, 0.04, 16, { hSeg: 1 });
      LB.puddle(b, BGX - 1.5, BGZ + 6, 1.2, 0.8, 77);
      // the Charging Bull (raider-era guerrilla bronze) at the north tip of the Green, charging up Broadway. Real proportions: 4.9 m
      // long, 3.4 m to the horn tips, sitting on cobbles at grade. Lofted body (superellipse sections along the spine
      // with the head dropped and turned, a massive shoulder hump and a deep chest), thick short legs in a charging
      // stance (near fore leg reaching, off fore leg planted, hind legs driving), forward-hooking horns and the whipped-up
      // S tail. Bronze with the rubbed-gold nose and horn tips of a century of tourists.
      {
        const bx = BGX,
          bz = BGZ - 15.2,
          Y = 0.07;
        b.boxMM(
          "granite_block",
          bx - 2.2,
          0.0,
          bz - 3.6,
          bx + 2.2,
          Y,
          bz + 3.3,
          { grime: 0.7, noAO: true, uvScale: 1.4 },
        );
        const ST = [
          // [z, centre y, half width, half height, x shift (head turned to its left)]
          [-2.62, 0.92, 0.05, 0.05, -0.2],
          [-2.55, 0.9, 0.24, 0.22, -0.2],
          [-2.38, 0.98, 0.33, 0.33, -0.19],
          [-2.05, 1.22, 0.4, 0.44, -0.16],
          [-1.72, 1.48, 0.5, 0.56, -0.11],
          [-1.38, 1.72, 0.74, 0.8, -0.05],
          [-0.95, 1.96, 0.96, 0.98, 0],
          [-0.35, 1.92, 0.99, 0.9, 0],
          [0.35, 1.86, 0.95, 0.82, 0.02],
          [1.05, 1.9, 0.9, 0.76, 0.03],
          [1.6, 1.98, 0.8, 0.7, 0.03],
          [1.98, 1.98, 0.58, 0.56, 0.02],
          [2.16, 1.98, 0.2, 0.22, 0.02],
          [2.2, 1.98, 0.04, 0.04, 0.02],
        ];
        const stAt = (z) => {
          let i = 0;
          while (i < ST.length - 2 && ST[i + 1][0] < z) i++;
          const p = ST[i],
            q = ST[i + 1],
            t = LB.smooth(p[0], q[0], z);
          return [
            p[1] + (q[1] - p[1]) * t,
            p[2] + (q[2] - p[2]) * t,
            p[3] + (q[3] - p[3]) * t,
            p[4] + (q[4] - p[4]) * t,
          ];
        };
        const bodyPt = (z, a, out) => {
          const [yc, hw, hh, xs] = stAt(z),
            ca = Math.cos(a),
            sa = Math.sin(a),
            e = 0.72; // squarish, broad-sided sections
          let x = hw * Math.sign(ca) * Math.pow(Math.abs(ca), e),
            y = hh * Math.sign(sa) * Math.pow(Math.abs(sa), e);
          if (sa < 0) y *= 0.8; // flatter belly
          const hump =
            Math.max(0, sa) * Math.exp(-Math.pow((z + 1.05) / 0.4, 2)) * 0.2; // shoulder hump
          const dew =
            Math.max(0, -sa) * Math.exp(-Math.pow((z + 1.45) / 0.35, 2)) * 0.28; // dewlap
          const brow =
            Math.max(0, sa) * Math.exp(-Math.pow((z + 1.95) / 0.18, 2)) * 0.08; // heavy brow over the eyes
          const flank = Math.abs(ca) > 0.6 ? Math.sin(z * 9 + a) * 0.012 : 0; // muscle ripple
          out.set(
            bx + xs + x * (1 + flank),
            Y + yc + y + hump + brow - dew,
            bz + z,
          );
          return 0.72 + 0.28 * Math.max(0, sa);
        };
        const loft = (z0, z1, nv, key) => {
          const g = LB.surface(
            (u, v, out) => bodyPt(z0 + (z1 - z0) * v, u * TAU, out),
            26,
            nv,
            { wrap: true, us: 2, vs: 3 },
          );
          b.add(key, g, { grime: 0.15, uv: "keep" });
        };
        loft(-2.62, -2.36, 3, "gilt"); // rubbed nose
        loft(-2.36, 2.2, 40, "bronze");
        const tube = (pts, thick, key, radial) =>
          b.add(
            key || "bronze",
            LB.organicTube(
              pts.map((p) => V(bx + p[0], Y + p[1], bz + p[2])),
              thick,
              { radial: radial || 10, seg: 12 },
            ),
            { grime: 0.15, uv: "keep" },
          );
        const legR = (r0, r1, r2, r3) => (t) =>
          t < 0.35
            ? r0 + (r1 - r0) * LB.smooth(0, 0.35, t)
            : t < 0.8
              ? r1 + (r2 - r1) * LB.smooth(0.35, 0.8, t)
              : r2 + (r3 - r2) * LB.smooth(0.8, 1, t);
        // fore legs: near (left, −x) reaching forward, off (right) planted under the chest
        tube(
          [
            [-0.5, 1.75, -0.95],
            [-0.62, 1.12, -1.28],
            [-0.6, 0.62, -1.62],
            [-0.56, 0.2, -1.95],
            [-0.55, 0.08, -2.02],
          ],
          legR(0.46, 0.25, 0.17, 0.2),
        );
        tube(
          [
            [0.52, 1.75, -0.85],
            [0.64, 1.05, -1.02],
            [0.62, 0.58, -1.08],
            [0.6, 0.2, -1.3],
            [0.6, 0.08, -1.36],
          ],
          legR(0.46, 0.25, 0.17, 0.2),
        );
        // hind legs: thigh down-forward to the stifle, back up to a high hock, cannon down-back to the hoof (driving)
        for (const [sx, dz] of [
          [-1, 0.1],
          [1, -0.15],
        ])
          tube(
            [
              [sx * 0.48, 2.0, 1.35],
              [sx * 0.6, 1.35, 1.12 + dz],
              [sx * 0.58, 0.82, 1.78 + dz],
              [sx * 0.54, 0.3, 2.02 + dz],
              [sx * 0.54, 0.08, 2.1 + dz],
            ],
            legR(0.55, 0.28, 0.16, 0.2),
          );
        for (const [x, z] of [
          [-0.55, -2.02],
          [0.6, -1.36],
          [-0.54, 2.2],
          [0.54, 1.95],
        ])
          b.cyl("iron", bx + x, Y, bz + z, 0.17, 0.2, 0.16, 8, {
            hSeg: 1,
            grime: 0.3,
          }); // cloven hooves
        // horns: out from the poll, then hooking FORWARD and slightly up, gold-rubbed tips
        for (const sx of [-1, 1]) {
          const hx = -0.14 + sx * 0.36;
          tube(
            [
              [hx, 1.72, -1.9],
              [hx + sx * 0.38, 1.76, -1.96],
              [hx + sx * 0.7, 1.86, -2.12],
              [hx + sx * 0.86, 1.98, -2.4],
            ],
            (t) => 0.15 - 0.08 * t,
          );
          tube(
            [
              [hx + sx * 0.86, 1.98, -2.4],
              [hx + sx * 0.88, 2.06, -2.62],
              [hx + sx * 0.78, 2.14, -2.86],
            ],
            (t) => 0.07 - 0.06 * t,
            "gilt",
            6,
          );
          b.sphere("bronze", bx + hx + sx * 0.12, Y + 1.46, bz - 1.78, 0.17, {
            sx: 1.5,
            sy: 0.45,
            sz: 0.8,
            ry: sx * 0.5,
            ws: 8,
            hs: 5,
          }); // ears
          b.sphere("iron", bx - 0.14 + sx * 0.36, Y + 1.36, bz - 2.1, 0.06, {
            ws: 6,
            hs: 4,
          }); // eyes
          b.sphere("iron", bx - 0.2 + sx * 0.12, Y + 0.9, bz - 2.6, 0.045, {
            ws: 6,
            hs: 4,
          }); // flared nostrils
        }
        // tail whipped up in an S over the rump, with a tuft
        tube(
          [
            [0.02, 2.5, 2.1],
            [0.12, 2.9, 2.38],
            [0.34, 3.12, 2.2],
            [0.52, 2.95, 1.92],
            [0.6, 2.66, 1.98],
            [0.66, 2.5, 2.2],
          ],
          (t) => 0.1 - 0.05 * t,
          "bronze",
          7,
        );
        b.sphere("bronze", bx + 0.66, Y + 2.44, bz + 2.24, 0.1, {
          sx: 1,
          sy: 1.5,
          sz: 1,
          ws: 7,
          hs: 5,
        });
        // "BEAR MARKET" spray tag wrapped onto the right flank (a bent strip that follows the body)
        {
          const bullK = LB.texMat(
            "bull_graf",
            LB.graffitiTex("bull", ["BEAR MARKET"], 1024, 192, {
              color: "#c83a2a",
            }),
            { transparent: true },
          );
          const tag = new THREE.PlaneGeometry(1.75, 0.34, 10, 1),
            tp = tag.attributes.position,
            o = new THREE.Vector3();
          for (let i = 0; i < tp.count; i++) {
            const z = 0.35 - tp.getX(i),
              y = tp.getY(i);
            const [yc, hw] = stAt(z);
            bodyPt(z, Math.asin(Math.max(-1, Math.min(1, y / 0.8))), o);
            o.x += 0.03;
            tp.setXYZ(i, o.x, Y + yc + y, o.z);
          }
          tag.computeVertexNormals();
          b.add(bullK, tag, { grime: 0, noAO: true, uv: "keep" });
        }
        LB.col(bx, bz - 0.1, 2.0, 4.9, 0, 3.0, 0, {
          walkable: false,
          surface: "metal",
        });
        LB.plaque(
          V(bx - 1.6, 1.0, bz + 2.8),
          "Charging Bull",
          '"Guerrilla art, hauled here on a flatbed by persons unknown one night in the winter of 1966. Tolerated ever since. The Parks Department reminds visitors that rubbing the bull for luck has not, historically, worked."',
        );
        anchors.charging_bull = V(bx, 0, bz - 4);
      }
      // shellback nests along the shore, skeletons, a flag pole, Fizzo kiosk
      for (const [x, z] of [
        [-30, 1000],
        [20, 998],
        [-150, 930],
        [95, 978],
        [-75, 998],
      ]) {
        LB.shellbackNest(b, x, z, 0.9 + ((x * 7) % 3) * 0.1);
      }
      for (let i = 0; i < 6; i++)
        LB.skeleton(b, -120 + r() * 220, 0.08, 930 + r() * 60, r() * 6);
      b.box("paint_red", 5, 0.05, 935, 2.4, 2.6, 2.0, {
        seg: false,
        grime: 0.6,
      });
      b.quad(LB.brandMat("fizzo_cola"), 5, 1.8, 936.02, 2.2, 1.1, {});
      LB.col(5, 935, 2.4, 2.0, 0, 2.6, 0, {
        walkable: false,
        surface: "metal",
      });
      anchors.soda_kiosk = V(5, 0, 937.5);
      // big harbor billboard facing the water (two-sided: television ad and the Civil Defense sleep program)
      {
        const BX = 110,
          BZ = 965,
          BR = -0.8;
        const nx = Math.sin(BR),
          nz = Math.cos(BR),
          ux = Math.cos(BR),
          uz = -Math.sin(BR);
        for (const d of [-6.3, 6.3]) {
          b.box("rust", BX + ux * d, 0, BZ + uz * d, 0.35, 12, 0.35, {
            ry: BR,
            seg: false,
          });
          LB.col(BX + ux * d, BZ + uz * d, 0.5, 0.5, 0, 12, 0, {
            walkable: false,
          });
        }
        b.box("rust", BX, 5.5, BZ, 14.6, 6.8, 0.3, {
          ry: BR,
          seg: false,
          grime: 0.6,
        });
        b.quad(
          LB.brandMat("lonly_tv"),
          BX + nx * 0.17,
          8.9,
          BZ + nz * 0.17,
          14,
          6.4,
          { ry: BR, grime: 0.25 },
        );
        b.quad(
          LB.brandMat("long_winter"),
          BX - nx * 0.17,
          8.9,
          BZ - nz * 0.17,
          14,
          6.4,
          { ry: BR + Math.PI, grime: 0.25 },
        );
      }
      // --- East Coast Memorial: two rows of tall granite stelae + bronze eagle on a plinth
      for (const zz of [958, 972])
        for (let k = 0; k < 4; k++) {
          const x = 42 + k * 6.5;
          b.box("granite", x, 0.05, zz, 1.4, 6.2, 3.6, { grime: 0.5 });
          for (let n = 0; n < 7; n++)
            b.box(
              "granite_dark",
              x + 0.72,
              0.9 + n * 0.7,
              zz,
              0.02,
              0.08,
              2.6,
              { seg: false },
            );
          LB.col(x, zz, 1.4, 3.6, 0, 6.2, 0, { walkable: false });
        }
      b.box("granite", 52, 0.05, 986, 3.4, 1.8, 2.2, { seg: false });
      LB.col(52, 986, 3.4, 2.2, 0, 1.9, 0, { walkable: false });
      b.sphere("bronze", 52, 2.6, 986, 0.55, { sx: 1.1, sy: 0.9, sz: 1.5 });
      b.sphere("bronze", 52, 3.25, 985.3, 0.26, {});
      for (const s2 of [-1, 1]) {
        const wing = new THREE.Shape();
        wing.moveTo(0, 0);
        wing.quadraticCurveTo(1.2, 0.6, 2.1, 1.9);
        wing.quadraticCurveTo(1.3, 1.3, 0.1, 0.5);
        wing.closePath();
        b.add(
          "bronze",
          new THREE.ExtrudeGeometry(wing, { depth: 0.08, bevelEnabled: false }),
          {
            m: LB.m4(52 + s2 * 0.3, 2.6, 986, s2 > 0 ? 0 : Math.PI),
            grime: 0.2,
          },
        );
      }
      anchors.memorial = V(58, 0, 965);
      // --- the '67 evacuation point: army trucks, sandbag checkpoint, ferry queue rails, signage
      const truck = (x, z, ry, burnt) => {
        const M = LB.m4(x, 0, z, ry);
        const add = (key, geo, m) =>
          b.add(key, geo, {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: burnt ? 0.9 : 0.6,
            c: burnt ? 0x5a4a40 : 0xffffff,
          });
        add("army", new THREE.BoxGeometry(2.4, 1.3, 2.2), LB.m4(0, 1.45, 2.6));
        add("army", new THREE.BoxGeometry(2.3, 1.0, 1.6), LB.m4(0, 2.4, 2.4));
        add(
          "glass_broken",
          new THREE.BoxGeometry(2.0, 0.6, 0.05),
          LB.m4(0, 2.5, 3.22),
        );
        add("army", new THREE.BoxGeometry(2.5, 0.5, 5.2), LB.m4(0, 1.05, -1.2));
        add(
          "tent",
          new THREE.CylinderGeometry(1.3, 1.3, 5.0, 10, 1, false, 0, Math.PI),
          LB.m4(0, 1.3, -1.2, 0, Math.PI / 2, 0, 1, 1.1, 1),
        );
        for (const wz of [2.4, -0.6, -2.6])
          for (const s3 of [-1, 1]) {
            const w = new THREE.CylinderGeometry(0.48, 0.48, 0.35, 10);
            w.rotateZ(Math.PI / 2);
            add("tire", w, LB.m4(s3 * 1.15, 0.48, wz));
          }
        const st = new THREE.CircleGeometry(0.45, 5);
        add("paint_cream", st, LB.m4(1.26, 2.4, 2.4, Math.PI / 2));
        LB.col(x, z, 2.6, 8.0, 0, 3.0, ry, { surface: "metal" });
      };
      truck(-84, 972, 0.2, false);
      truck(-70, 968, -0.4, true);
      truck(-128, 985, 1.1, false);
      LB.sandbags(b, -96, 978, -88, 978, 3);
      LB.sandbags(b, -112, 978, -104, 978, 3);
      LB.sandbags(b, -96, 978, -96, 983, 3);
      LB.sandbags(b, -104, 978, -104, 983, 3);
      for (let k = 0; k < 5; k++)
        LB.railing(
          b,
          [
            [-104 + k * 2, 984],
            [-104 + k * 2, skZ - 3],
          ],
          0.05,
          1.0,
          "iron",
          { postStep: 2.5 },
        );
      const evK = LB.texMat(
        "battery_evac",
        LB.signTex(
          "battery_evac",
          [
            "U.S. ARMY EVACUATION POINT",
            "LIBERTY FERRY — WOMEN, CHILDREN & SHELTER CARD HOLDERS",
          ],
          "enamel",
          1024,
          192,
          { bg: "#2f3a28", fg: "#e8e0c0" },
        ),
      );
      for (const x of [-108.5, -91.5])
        b.box("army", x, 0, 979, 0.3, 5.2, 0.3, { seg: false });
      b.box("army", -100, 4.2, 979, 17.5, 1.9, 0.25, { seg: false });
      b.quad(evK, -100, 5.15, 978.85, 17, 1.7, { ry: Math.PI });
      const noK = LB.texMat(
        "battery_noferry",
        LB.signTex(
          "battery_noferry",
          ["NO MORE FERRIES", "SWIM"],
          "raider",
          512,
          256,
        ),
      );
      b.quad(noK, -100, 2.3, 978.7, 2.6, 1.3, { ry: Math.PI });
      for (let i = 0; i < 6; i++)
        LB.skeleton(b, -106 + i * 2.4, 0.08, 986 + (i % 3) * 1.6, i * 1.1);
      for (let i = 0; i < 5; i++)
        b.box("fabric", -118 + i * 1.2, 0.05, 970 + (i % 2), 0.6, 0.45, 0.9, {
          seg: false,
          ry: i,
          c: [0x8a6a4a, 0x5a6a7a, 0x9a8a6a][i % 3],
        }); // abandoned luggage
      anchors.evac = V(-100, 0, 975);
      // --- landscape: curving walks (granite-edged), organic dead lawns, a varied tree set, ground clutter
      // Keep-out zones for dressing (features built above/below).
      const KEEP = [
        [-128, 948, 23],
        [-15, 942, 10],
        [5, 935, 3],
        [110, 965, 8],
        [-84, 972, 6],
        [-70, 968, 6],
        [-128, 985, 6],
        [BGX, BGZ - 3, 16],
      ];
      const KEEPR = [
        [36, 952, 72, 992],
        [-121, 964, -84, 994],
        [-106, 978, -94, 1010],
      ];
      const free = (x, z, pad) =>
        L.isManhattan(x, z + 6) &&
        !KEEP.some(
          ([kx, kz, kr]) => Math.hypot(x - kx, z - kz) < kr + (pad || 0),
        ) &&
        !KEEPR.some(
          ([x0, z0, x1, z1]) =>
            x > x0 - (pad || 0) &&
            x < x1 + (pad || 0) &&
            z > z0 - (pad || 0) &&
            z < z1 + (pad || 0),
        );
      const ribbon = (key, pts, w, y, opts) => {
        // flat strip along a Catmull-Rom path
        const c = new THREE.CatmullRomCurve3(pts.map((p) => V(p[0], 0, p[1]))),
          n = Math.max(4, Math.round(c.getLength() / 1.5));
        const pos = [];
        for (let i = 0; i <= n; i++) {
          const p = c.getPointAt(i / n),
            t = c.getTangentAt(i / n),
            nx = -t.z,
            nz = t.x;
          pos.push([
            p.x + (nx * w) / 2,
            p.z + (nz * w) / 2,
            p.x - (nx * w) / 2,
            p.z - (nz * w) / 2,
          ]);
        }
        const arr = [];
        for (let i = 0; i < n; i++) {
          const A = pos[i],
            B = pos[i + 1];
          arr.push(
            A[0],
            y,
            A[1],
            B[0],
            y,
            B[1],
            A[2],
            y,
            A[3],
            A[2],
            y,
            A[3],
            B[0],
            y,
            B[1],
            B[2],
            y,
            B[3],
          );
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
        g.computeVertexNormals();
        if (g.attributes.normal.getY(0) < 0) {
          const idx = [];
          for (let i = 0; i < arr.length / 3; i += 3) idx.push(i, i + 2, i + 1);
          g.setIndex(idx);
          g.computeVertexNormals();
        }
        b.add(key, g, Object.assign({ grime: 0.6, noAO: true }, opts || {}));
        return c;
      };
      const walk = (pts, w) => {
        const c = ribbon("sidewalk", pts, w, 0.075, { uvScale: 3 });
        ribbon(
          "granite",
          pts.map((p) => p),
          w + 0.5,
          0.06,
          { c: 0x9a948a },
        );
        return c;
      };
      const WALKS = [
        [
          [BGX - 2, 938],
          [18, 944],
          [-2, 947],
          [-24, 951],
          [-52, 955],
          [-80, 952],
          [-104, 948],
        ], // Bowling Green → Castle Clinton
        [
          [-15, 908],
          [-16, 924],
          [-15, 932],
        ], // State St → the Globe plaza
        [
          [-15, 952],
          [-30, 964],
          [-58, 974],
          [-84, 978],
        ], // Globe → evacuation point
        [
          [20, 947],
          [34, 956],
          [38, 966],
        ], // → East Coast Memorial
        [
          [-104, 952],
          [-110, 972],
          [-104, 990],
          [-100, skZ - 5],
        ], // castle → skiff pier
      ];
      const walkCurves = WALKS.map((w) => walk(w, 4.2));
      // the Globe plaza: granite disc, the damaged bronze Harbor Globe on its fountain base, flagpoles
      {
        const sx = -15,
          sz = 942;
        b.cyl("granite_block", sx, 0, sz, 9, 9, 0.08, 40, {
          hSeg: 1,
          grime: 0.6,
          noAO: true,
        });
        b.cyl("granite", sx, 0.08, sz, 3.4, 3.6, 0.7, 24, {
          hSeg: 1,
          grime: 0.6,
        });
        b.cyl("goo", sx, 0.62, sz, 3.25, 3.25, 0.05, 24, { hSeg: 1 });
        const sph = new THREE.SphereGeometry(2.3, 20, 14);
        LB.deform(sph, (v) => {
          const n = G.util.fbm2(v.x * 0.9 + 3, v.y * 0.9 + v.z * 0.7, 3);
          const dent = Math.max(0, v.x * 0.6 + v.y * 0.5 - 1.1) * 0.35;
          v.multiplyScalar(1 + (n - 0.5) * 0.12 - dent);
          if (Math.abs(v.y) < 0.45) v.multiplyScalar(0.94);
        });
        b.add("bronze", sph, {
          m: LB.m4(sx, 3.3, sz, 0.4, 0.15, 0.1),
          grime: 0.35,
        });
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * TAU;
          b.rod(
            "bronze",
            V(sx + Math.cos(a) * 0.9, 0.65, sz + Math.sin(a) * 0.9),
            V(sx + Math.cos(a) * 0.6, 1.4, sz + Math.sin(a) * 0.6),
            0.14,
            6,
          );
        }
        b.cyl("bronze", sx, 0.65, sz, 0.55, 0.8, 0.95, 12, { hSeg: 1 });
        LB.col(sx, sz, 7.0, 7.0, 0, 0.75, 0, { walkable: true });
        LB.col(sx, sz, 4.2, 4.2, 0.7, 5.6, 0, {
          walkable: false,
          surface: "metal",
        });
        for (const [dx, dz] of [
          [-6.5, -5],
          [6.5, -5],
          [0, 7.8],
        ]) {
          // flagpoles, one with a tattered flag
          b.cyl("iron", sx + dx, 0.08, sz + dz, 0.05, 0.1, 11, 6, { hSeg: 2 });
          b.sphere("gilt", sx + dx, 11.15, sz + dz, 0.14, { ws: 6, hs: 4 });
          LB.col(sx + dx, sz + dz, 0.3, 0.3, 0, 11, 0, { walkable: false });
        }
        const fl = LB.makeFlag ? LB.makeFlag(LB.flagTex(0), 2.6, 1.4) : null;
        if (fl) {
          fl.position.set(sx - 6.5, 10.2, sz - 5);
          root.add(fl);
          LB.animate(fl.position, 200, (t) => fl.userData.wave(t));
        }
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * TAU + 0.4;
          LB.bench(
            b,
            sx + Math.cos(a) * 7.4,
            0.08,
            sz + Math.sin(a) * 7.4,
            a + Math.PI / 2,
          );
        }
        const spK = LB.texMat(
          "battery_globe",
          LB.signTex(
            "battery_globe",
            [
              "THE HARBOR GLOBE",
              "World's Fair gift, 1964 · Damaged 1967 · Still here",
            ],
            "engraved",
            512,
            160,
            { bg: "#8a867e" },
          ),
        );
        b.quad(spK, sx, 0.45, sz - 3.62, 1.6, 0.5, { ry: Math.PI });
        anchors.sphere = V(sx, 0, sz - 8);
      }
      // organic lawns in the gaps between the walks, each with a mud rim, dead-grass tufts and the odd puddle
      const onWalk = (x, z, pad) =>
        walkCurves.some((c) => {
          for (let i = 0; i <= 40; i++) {
            const p = c.getPointAt(i / 40);
            if (Math.hypot(p.x - x, p.z - z) < 2.1 + pad) return true;
          }
          return false;
        });
      for (const [x, z, rx, rz, ry] of [
        [-60, 930, 20, 11, 0.1],
        [-78, 965, 9, 6, -0.3],
        [-35, 972, 12, 7, 0.25],
        [8, 922, 13, 7, -0.1],
        [-2, 965, 14, 9, 0.2],
        [22, 985, 11, 7, 0.4],
        [85, 940, 16, 12, -0.2],
        [-150, 925, 10, 8, 0.3],
        [-45, 992, 12, 5, 0.05],
      ]) {
        if (!L.isManhattan(x, z)) continue;
        LB.blob(b, "dirt", x, z, rx + 1.4, rz + 1.2, 0.035, {
          ry,
          seed: Math.round(x * 3 + z),
          c: 0x6e5c46,
        });
        LB.blob(b, "grass", x, z, rx, rz, 0.045, {
          ry,
          seed: Math.round(x * 5 - z),
          amp: 0.18,
        });
        LB.tufts(
          b,
          x,
          z,
          Math.min(rx, rz) * 1.1,
          Math.round((rx * rz) / 9),
          Math.round(x * 11 + z),
          (tx, tz) => !onWalk(tx, tz, 0.5),
        );
        if (r() < 0.6)
          LB.puddle(
            b,
            x + (r() - 0.5) * rx,
            z + (r() - 0.5) * rz * 0.6,
            1.2 + r() * 1.4,
            0.8 + r(),
            Math.round(x + z),
          );
      }
      // trees: lining the walks (irregular spacing, mixed species, some leaning) + clumps on the lawns
      {
        let n = 0;
        walkCurves.forEach((c, ci) => {
          const len = c.getLength();
          let t = 3 + r() * 4;
          while (t < len - 2) {
            const p = c.getPointAt(t / len),
              tg = c.getTangentAt(t / len);
            for (const sd of [-1, 1]) {
              if (r() < 0.25) continue;
              const x = p.x - tg.z * sd * (4.2 + r() * 1.6),
                z = p.z + tg.x * sd * (4.2 + r() * 1.6);
              if (!free(x, z, 1.5) || onWalk(x, z, 1.2)) continue;
              const kind = LB.treeMix(r, [0.45, 0.3, 0.12, 0.1, 0.03]);
              LB.parkTree(b, x, z, {
                kind,
                h: 6 + r() * 5.5,
                lean: r() < 0.3 ? 0.08 + r() * 0.18 : r() * 0.05,
                seed: ci * 100 + n++,
                collide: kind !== "stump",
              });
            }
            t += 8 + r() * 7;
          }
        });
        for (let i = 0; i < 26; i++) {
          const x = -165 + r() * 290,
            z = 912 + r() * 85;
          if (!free(x, z, 2) || onWalk(x, z, 2)) continue;
          const kind = LB.treeMix(r);
          LB.parkTree(b, x, z, {
            kind,
            h: 5 + r() * 7,
            lean: r() < 0.35 ? 0.1 + r() * 0.25 : r() * 0.06,
            seed: 500 + i,
            collide: kind !== "stump",
          });
        }
      }
      // lamp posts along the main walk (a few still lit), wrecked benches, debris
      walkCurves[0] &&
        (() => {
          const c = walkCurves[0],
            len = c.getLength();
          let k = 0;
          for (let t = 6; t < len; t += 14) {
            const p = c.getPointAt(t / len),
              tg = c.getTangentAt(t / len),
              sd = k % 2 ? 1 : -1;
            const x = p.x - tg.z * sd * 2.6,
              z = p.z + tg.x * sd * 2.6;
            if (!free(x, z, 0.5)) {
              k++;
              continue;
            }
            LB.lampPost(b, x, 0.07, z, k % 3 === 1);
            if (k % 2 === 0)
              LB.bench(
                b,
                x + tg.x * 3,
                0.07,
                z + tg.z * 3,
                Math.atan2(tg.z * sd, -tg.x * sd) + (k % 4 ? 0 : 0.5),
              );
            k++;
          }
        })();
      // shellback mud flats along the shore: dark wet mud, glowing puddles, scattered shell fragments
      for (const [x, z] of [
        [-30, 1000],
        [20, 998],
        [-150, 930],
        [95, 978],
        [-75, 998],
      ]) {
        LB.blob(b, "dirt", x, z, 6.5, 4.2, 0.04, {
          seed: Math.round(x * 7 + z),
          c: 0x40362a,
          amp: 0.35,
        });
        LB.puddle(b, x + 3, z - 1.5, 1.6, 1.0, Math.round(x - z));
        for (let i = 0; i < 5; i++) {
          const a = r() * TAU,
            d = 2 + r() * 3;
          b.sphere(
            "bone",
            x + Math.cos(a) * d,
            0.08,
            z + Math.sin(a) * d,
            0.35 + r() * 0.2,
            { sy: 0.25, c: 0x8a7a5a, grime: 0.4, ws: 6, hs: 4, ry: r() * 6 },
          );
        }
      }
      // wreckage: a beached skiff hull, a toppled lamp, a crashed news-stand, drifts of trash
      {
        const hx = -45,
          hz = 996;
        if (L.isManhattan(hx, hz - 2)) {
          const hull = new THREE.CylinderGeometry(
            1.3,
            1.3,
            6.5,
            10,
            1,
            false,
            0,
            Math.PI,
          );
          hull.rotateX(Math.PI / 2);
          hull.rotateZ(Math.PI);
          b.add("paint_teal", hull, {
            m: LB.m4(hx, 0.9, hz, 0.7, 0, 0.35),
            grime: 0.85,
            c: 0x8a9a90,
          });
          LB.col(hx, hz, 2.8, 6.5, 0, 1.4, 0.7, { surface: "wood" });
        }
      }
      b.beam("iron", V(-58, 0.15, 958.5), V(-55, 0.4, 962.8), 0.12, 0.12, {
        grime: 0.5,
      });
      b.cyl("glass_broken", -54.8, 0.25, 963, 0.2, 0.2, 0.45, 6, {
        hSeg: 1,
        rz: 1.4,
      });
      b.box("paint_red", 28, 0.05, 941, 2.2, 2.2, 1.4, {
        ry: 0.3,
        rz: 0.12,
        seg: false,
        grime: 0.8,
        c: 0x9a8a80,
      });
      LB.col(28, 941, 2.2, 1.4, 0, 2.2, 0.3, {
        walkable: false,
        surface: "metal",
      });
      if (LB.dress && LB.dress.papers) {
        LB.dress.papers(b, -10, 0.08, 948, 7, 16, 301);
        LB.dress.papers(b, 30, 0.08, 944, 5, 10, 302);
      }
      for (let i = 0; i < 18; i++) {
        const x = -150 + r() * 250,
          z = 915 + r() * 80;
        if (free(x, z, 1))
          b.rock(r() < 0.5 ? "rubble" : "concrete", x, 0, z, 0.3 + r() * 0.5, {
            flat: 0.5,
            seed: i * 7,
          });
      }
      // scavengers' camp by the castle wall: lean-to, lit fire barrel, bedroll, string of bulbs
      {
        const cx = -104,
          cz = 930;
        b.box("corrugated", cx, 1.2, cz, 3.6, 0.06, 2.4, {
          rx: 0.45,
          seg: false,
          grime: 0.7,
        });
        for (const dx of [-1.6, 1.6])
          b.box("rotten", cx + dx, 0, cz + 1.0, 0.1, 1.7, 0.1, { seg: false });
        if (LB.dress && LB.dress.mattress)
          LB.dress.mattress(b, cx, 0.05, cz - 0.2, 0, 0x8a7a60);
        LB.barrel(b, cx + 3.2, 0.05, cz + 1.8, { fire: true });
        if (LB.dress && LB.dress.crates)
          LB.dress.crates(b, cx - 3.0, 0.05, cz + 1.2, 2, 331);
        anchors.scav_camp = V(cx + 2, 0, cz + 3);
      }
      anchors.spawn1 = V(-40, 0, 990);
      anchors.spawn2 = V(10, 0, 992);
      anchors.spawn3 = V(-120, 0, 952);
      anchors.spawn4 = V(80, 0, 975);
      anchors.entrance = V(-20, 0, 912);
      anchors.promenade = V(-10, 0, 1000);
      const g = b.build(root);
      g.name = "battery_park";
      LB.register("battery_park", g, anchors);
      LB.plaque(
        V(gx + 0.5, 1.4, CCZ + 3.2),
        "Castle Clinton Plaque",
        '"West Battery, 1811. Since serving as fort, opera house, immigration depot and aquarium, the castle has been reclaimed by its most persistent tenants: shellbacks. Do not feed the shellbacks. Do not be fed to the shellbacks."',
      );

      // --- skiff ferry doors (Battery ↔ Liberty)
      const lib = LB.libertyArrive,
        lp = LB.ferryLiberty;
      try {
        if (lib)
          G.world.addDoor({
            pos: V(-97.5, 1.0, skZ + 16),
            label: "Harbor Skiff to Liberty Island",
            verb: "Ride",
            radius: 1.6,
            target: { x: lib.x, y: lib.y, z: lib.z, yaw: lib.yaw },
            sound: "door_open",
            onEnter: () =>
              G.notify("The skiff sputters across the irradiated harbor..."),
          });
        // Return trip: the quests module runs "Ossie's Ferry" from the same Liberty dock, so this door only exists as the
        // fallback when quests is a stub (no doubled prompt). The outbound door above is gated by quests (Ossie's fare).
        if (lp) {
          const back = G.world.addDoor({
            pos: lp.pos,
            label: "Harbor Skiff to Battery Park",
            verb: "Ride",
            radius: 1.6,
            target: {
              x: arriveB.x,
              y: arriveB.y,
              z: arriveB.z,
              yaw: arriveB.yaw,
            },
            sound: "door_open",
            onEnter: () => G.notify("You arrive back at Battery Park."),
          });
          if (back) back.enabled = () => G.isStub("quests");
        }
      } catch (e) {
        G.reportError("init:landmarks_b", e);
      }
    },
    41,
  );

  // Staten Island ferry (orange double-ender) — local frame, length along Z
  function buildFerryWreck(b, M) {
    const add = (key, geo, m, o) =>
      b.add(
        key,
        geo,
        Object.assign(
          {
            m: new THREE.Matrix4().multiplyMatrices(M, m),
            grime: 0.75,
            ground: -1.2,
          },
          o || {},
        ),
      );
    const hull = new THREE.CapsuleGeometry(5, 30, 4, 12);
    hull.rotateX(Math.PI / 2);
    hull.scale(1.15, 0.7, 1);
    add("paint_orange", hull, LB.m4(0, 1.5, 0));
    add("rust", new THREE.BoxGeometry(11.8, 0.4, 36), LB.m4(0, 4.8, 0));
    add("paint_orange", new THREE.BoxGeometry(10.5, 3.2, 28), LB.m4(0, 6.6, 0));
    add("paint_cream", new THREE.BoxGeometry(8, 2.6, 18), LB.m4(0, 9.5, 0));
    for (const zz of [-10, 10])
      add("paint_cream", new THREE.BoxGeometry(4, 2.2, 3), LB.m4(0, 12.0, zz));
    add("rust", new THREE.CylinderGeometry(0.9, 1.1, 5, 10), LB.m4(0, 12.5, 0));
    for (let k = 0; k < 12; k++)
      for (const s of [-1, 1])
        add(
          "glass_broken",
          new THREE.PlaneGeometry(1.4, 1.2),
          LB.m4(s * 5.27, 6.8, -12.5 + k * 2.3, (s * Math.PI) / 2),
          { uv: "keep", noAO: true },
        );
    const nameK = LB.texMat(
      "ferry_name",
      LB.signTex("ferry_name", ["STATEN ISLAND FERRY"], "enamel", 1024, 128, {
        bg: "#c8702c",
        fg: "#1a1a1a",
      }),
    );
    for (const s of [-1, 1])
      add(
        nameK,
        new THREE.PlaneGeometry(16, 1.3),
        LB.m4(s * 5.29, 8.6, 0, (s * Math.PI) / 2),
        { uv: "keep", grime: 0.3 },
      );
  }
})();
