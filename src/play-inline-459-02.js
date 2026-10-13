// play-inline-459 02 — add
// Lines 20-328 of readable/play-inline-459.pretty.js (statement-aligned).
  const L = G.chars._lib,
    H = L.human,
    P = L.prim;
  const lerp = L.lerp,
    clamp = L.clamp;
  const PI = Math.PI;
  const OUT = H.outfits;
  const { cloth, leather: leatherM, metal: metalM, skin: skinM } = H.mat;
  const scaleRings = H.scaleRings;
  const HC = (b) => [0, 0.105 * b.headS, -0.01 * b.headS];
  const GILT = 0xd8a848,
    BRASS = 0xb8964a,
    WAX = 0xe6dcc2,
    OCHRE = 0xa8844e,
    RED = 0xb8322a;
  const giltM = (c) => metalM(c || GILT, { metal: 0.9, rough: 0.3 });

  // ------------------------------------------------------------------
  // Shared pieces
  // ------------------------------------------------------------------
  /** Skirt halves on the thighs, scaled k around the hips (layered robes). gap = front opening (0 closed). */
  function skirt(R, b, mat, len, flare, gap, k) {
    const rings = H.torsoRings(b).pelvis;
    const W = rings[2].rx * 1.12 * k,
      D = rings[2].rz * 1.16 * k,
      L_ = b.legLen * len;
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const ox = -sg * b.hipW,
        rs = [];
      for (let i = 0; i <= 5; i++) {
        const t = i / 5;
        rs.push({
          y: b.hipDrop + 0.1 * b.s - t * (L_ + 0.1 * b.s),
          rx: W * (1 + flare * t),
          rz: D * (1 + flare * t * 0.9),
          ox,
          n: 2.2,
        });
      }
      rs.reverse();
      const a0 = sg < 0 ? PI + 0.02 : gap * PI,
        a1 = sg < 0 ? PI * (2 - gap) : PI - 0.02;
      const g = P.loft(rs, { seg: 10, a0, a1 });
      P.deform(g, (v) => {
        if (v.y < b.hipDrop - L_ * 0.95)
          v.y += (L.hash3(v.x * 300, 1, v.z * 300) - 0.5) * 0.04 * b.s;
      });
      R.add("thigh" + S, g, mat);
    }
  }
  /** Torso shell (chest/spine/hips) scaled k; gap = half-angle of the front opening (0 = closed). */
  function shell(R, b, mat, k, gap, hipsFrom) {
    const rings = H.torsoRings(b),
      lo = gap > 0 ? { seg: 16, a0: gap, a1: PI * 2 - gap } : { seg: 16 };
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), k * 0.98), lo),
      mat,
    );
    R.add("spine", P.loft(scaleRings(rings.abdomen, k * 1.02), lo), mat);
    R.add(
      "hips",
      P.loft(
        scaleRings(
          rings.pelvis.slice(hipsFrom === undefined ? 2 : hipsFrom),
          k * 1.04,
        ),
        lo,
      ),
      mat,
    );
    return rings;
  }
  /** Front z of the chest surface at ring i, pushed out by k. */
  const frontZ = (rings, i, k) =>
    -rings.chest[i].rz * k + (rings.chest[i].oz || 0);
  /** Twelve-ray sun: disc + 12 tapered rays, facing -Z (front) or +Z (back: face = 1). */
  function sun12(R, bone, x, y, z, r, mat, face, rayK) {
    const back = face === 1,
      rz = back ? PI : 0;
    R.add(
      bone,
      P.xf(P.cyl(r * 0.5, r * 0.5, r * 0.12, 18), x, y, z, PI / 2, 0, 0),
      mat,
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2,
        rl = r * (rayK || 0.55);
      const g = P.cone(r * 0.13, rl, 4);
      P.xf(
        g,
        Math.cos(a) * (r * 0.5 + rl * 0.5),
        Math.sin(a) * (r * 0.5 + rl * 0.5),
        0,
        0,
        0,
        a - PI / 2,
        1,
        1,
        0.35,
      );
      if (back) P.xf(g, 0, 0, 0, 0, rz, 0);
      R.add(bone, P.xf(g, x, y, z), mat);
    }
  }
  /** Small brass twelve-ray pendant on a cord at the throat. */
  function pendant(R, b, rings, y, r, cordC) {
    const s = b.s,
      z = frontZ(rings, 2, 1.12) - 0.004 * s;
    R.add(
      "chest",
      P.sweep(
        [
          [-0.055 * s, 0.25 * s, -0.01 * s],
          [-0.06 * s, 0.17 * s, z * 0.85],
          [0, y + r * 0.6, z],
          [0.06 * s, 0.17 * s, z * 0.85],
          [0.055 * s, 0.25 * s, -0.01 * s],
        ],
        0.0022 * s,
        { seg: 14, rs: 3 },
      ),
      leatherM(cordC || 0x3a2a1a),
    );
    sun12(
      R,
      "chest",
      0,
      y,
      z - 0.004 * s,
      r,
      metalM(BRASS, { metal: 0.85, rough: 0.35 }),
    );
  }
  /** Peaked (visor) cap: crown, band, visor. */
  function peakedCap(R, b, color, band, visor) {
    const hs = b.headS,
      C = HC(b),
      top = C[1] + 0.07 * hs;
    R.add(
      "head",
      P.xf(
        P.cyl(0.118 * hs, 0.1 * hs, 0.05 * hs, 20),
        C[0],
        top + 0.01 * hs,
        C[2] + 0.004 * hs,
        -0.08,
        0,
        0,
        1,
        1,
        1.08,
      ),
      cloth(color),
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.103 * hs, 0.103 * hs, 0.026 * hs, 20, true),
        C[0],
        top - 0.022 * hs,
        C[2] + 0.004 * hs,
        -0.08,
        0,
        0,
        1,
        1,
        1.08,
      ),
      cloth(band || L.shade(color, 0.6)),
    );
    const v = P.sphere(
      0.1 * hs,
      0.012 * hs,
      0.07 * hs,
      14,
      4,
      0,
      PI * 2,
      0,
      PI / 2,
    );
    R.add(
      "head",
      P.xf(v, C[0], top - 0.034 * hs, C[2] - 0.085 * hs, 0.22, 0, 0),
      leatherM(visor || 0x141210, { rough: 0.25 }),
    );
  }
  /** Neckerchief: a knotted cloth ring round the neck with a point down the front. */
  function neckerchief(R, b, rings, color) {
    const s = b.s,
      m = cloth(color, { region: "rags" });
    R.add(
      "chest",
      P.xf(
        P.torus(0.068 * s, 0.021 * s, 6, 16),
        0,
        0.26 * s,
        0.004 * s,
        PI / 2 + 0.22,
        0,
        0,
        1.22,
        1.08,
        1,
      ),
      m,
    );
    const tri = P.extrude(
      [
        [-0.032 * s, 0],
        [0.032 * s, 0],
        [0.004 * s, -0.06 * s],
      ],
      0.005 * s,
    );
    R.add(
      "chest",
      P.xf(
        tri,
        0.012 * s,
        0.235 * s,
        frontZ(rings, 3, 1.02) - 0.006 * s,
        0.5,
        0,
        0.18,
      ),
      m,
    );
    R.add(
      "chest",
      P.xf(
        P.sphere(0.012 * s, 0.01 * s, 0.009 * s, 8, 6),
        0.012 * s,
        0.238 * s,
        frontZ(rings, 3, 1.05) - 0.008 * s,
      ),
      m,
    ); // knot
  }
  /** Band round the upper arm (armband) or the wrist (cuff). */
  function armband(R, b, S, mat, at, len, k) {
    const lr = b.limbR * 0.93 * (k || 1);
    R.add(
      "arm" + S,
      P.xf(
        P.cyl(0.059 * lr, 0.057 * lr, len * b.s, 14, true),
        0,
        -b.upper * at,
        0,
        0,
        0,
        0,
        1,
        1,
        0.94,
      ),
      mat,
    );
  }
  function wristCuff(R, b, S, mat, len) {
    const lr = b.limbR * 0.93;
    R.add(
      "forearm" + S,
      P.xf(
        P.cyl(0.044 * lr, 0.042 * lr, (len || 0.06) * b.s, 14, true),
        0,
        -b.fore + 0.045 * b.s,
        0,
        0,
        0,
        0,
        1,
        1,
        0.95,
      ),
      mat,
    );
  }
  /** Wax drips: flattened blobs + short runs (candle wax on robes). */
  function wax(R, rng, bone, n, area) {
    for (let i = 0; i < n; i++) {
      const x = lerp(area[0], area[1], rng()),
        y = lerp(area[2], area[3], rng()),
        z = area[4](x, y);
      const r = 0.006 + rng() * 0.008;
      R.add(bone, P.xf(P.sphere(r, r * 1.2, r * 0.35, 8, 5), x, y, z), {
        color: WAX,
        rough: 0.35,
        noise: 0.05,
        region: "rags",
      });
      if (rng() < 0.6)
        R.add(
          bone,
          P.xf(
            P.box(r * 0.55, r * (2 + rng() * 3), r * 0.4, r * 0.2),
            x + (rng() - 0.5) * r,
            y - r * 2,
            z,
          ),
          { color: WAX, rough: 0.35, noise: 0.05, region: "rags" },
        );
    }
  }
  /** Gathered hood lying on the upper back (hood down). */
