/* src/characters/24_cast.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: the STORY CAST (named presets + cult ranks)
 * Owned by: characters.
 *
 * Every preset id is a character TYPE: G.chars.create('sister_dawn'),
 * G.actors.spawn({type: 'rose', ...}). 50_character.js resolves the id
 * through L.castOpts() into a human with a fixed outfit / face / hair / kit;
 * H.build applies `face` and `body` overrides and runs `kit` after the head.
 * Named presets always build the same face (fixed seed); ranked presets
 * (`ranked: true`) take the caller's seed for variety. `variant` = story
 * state flags ('masked', 'brand,slung', ...). Table: NOTES.md (top).
 *
 * The Glowkeeper sun is always TWELVE-RAYED.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.human) return;
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
  function hoodDown(R, b, rings, color) {
    const s = b.s,
      m = cloth(color, { region: "rags" }),
      cr = rings.chest;
    const g = P.loft(
      [
        {
          y: cr[3].y - 0.06 * s,
          rx: cr[3].rx * 0.55,
          rz: 0.03 * s,
          oz: cr[3].rz * 0.95,
          n: 2,
        },
        {
          y: cr[4].y + 0.02 * s,
          rx: cr[4].rx * 1.1,
          rz: 0.05 * s,
          oz: cr[4].rz * 1.15,
          n: 2,
        },
        {
          y: cr[5].y + 0.05 * s,
          rx: cr[5].rx * 1.6,
          rz: 0.045 * s,
          oz: cr[5].rz * 1.4,
          n: 2,
        },
      ],
      { seg: 12, a0: PI * 0.5, a1: PI * 1.5, capTop: true },
    );
    R.add("chest", g, m);
    R.add(
      "chest",
      P.xf(
        P.torus(0.072 * s, 0.02 * s, 6, 16),
        0,
        0.262 * s,
        0.006 * s,
        PI / 2 + 0.2,
        0,
        0,
        1.2,
        1.1,
        1,
      ),
      m,
    );
  }
  /** Mantle: a short shoulder cape to the elbows, open at the front; trim band at the hem. */
  function mantle(R, b, rings, color, trim, back) {
    const s = b.s,
      cr = rings.chest,
      m = cloth(color, { region: "rags", rough: 0.95 });
    const rs = [
      {
        y: -0.14 * s,
        rx: cr[2].rx * 1.62,
        rz: cr[2].rz * 1.62,
        oz: cr[2].oz,
        n: 2.1,
      },
      {
        y: -0.02 * s,
        rx: cr[2].rx * 1.52,
        rz: cr[2].rz * 1.5,
        oz: cr[2].oz,
        n: 2.2,
      },
      {
        y: cr[2].y,
        rx: cr[2].rx * 1.42,
        rz: cr[2].rz * 1.36,
        oz: cr[2].oz,
        n: 2.5,
      },
      {
        y: cr[3].y + 0.012 * s,
        rx: cr[3].rx * 1.24,
        rz: cr[3].rz * 1.4,
        oz: cr[3].oz,
        n: 2.6,
      },
      {
        y: cr[4].y + 0.02 * s,
        rx: cr[4].rx * 1.18,
        rz: cr[4].rz * 1.36,
        oz: cr[4].oz,
        n: 2.3,
      },
      {
        y: cr[5].y + 0.03 * s,
        rx: cr[5].rx * 1.55,
        rz: cr[5].rz * 1.6,
        oz: cr[5].oz,
        n: 2.1,
      },
    ];
    const g = P.loft(rs, { seg: 22, a0: 0.5, a1: PI * 2 - 0.5 });
    P.deform(g, (v) => {
      if (v.y < -0.1 * s) v.y += Math.sin(Math.atan2(v.x, v.z) * 9) * 0.008 * s;
    }); // soft folds at the hem
    R.add("chest", g, m);
    if (trim) {
      const tb = P.loft(
        [
          {
            y: -0.142 * s,
            rx: cr[2].rx * 1.64,
            rz: cr[2].rz * 1.64,
            oz: cr[2].oz,
            n: 2.1,
          },
          {
            y: -0.115 * s,
            rx: cr[2].rx * 1.61,
            rz: cr[2].rz * 1.61,
            oz: cr[2].oz,
            n: 2.1,
          },
        ],
        { seg: 22, a0: 0.5, a1: PI * 2 - 0.5 },
      );
      R.add(
        "chest",
        tb,
        cloth(trim, { region: "rags", rough: 0.55, metal: 0.25 }),
      );
      // trim down both front edges
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.sweep(
            [
              [
                sg * Math.sin(0.5) * cr[2].rx * 1.6,
                -0.13 * s,
                -Math.cos(0.5) * cr[2].rz * 1.62 + (cr[2].oz || 0),
              ],
              [
                sg * Math.sin(0.5) * cr[2].rx * 1.42,
                cr[2].y,
                -Math.cos(0.5) * cr[2].rz * 1.38 + (cr[2].oz || 0),
              ],
              [
                sg * Math.sin(0.5) * cr[4].rx * 1.2,
                cr[4].y + 0.02 * s,
                -Math.cos(0.5) * cr[4].rz * 1.38,
              ],
            ],
            0.008 * s,
            { seg: 8, rs: 4 },
          ),
          cloth(trim, { region: "rags", rough: 0.55, metal: 0.25 }),
        );
    }
    if (back)
      sun12(
        R,
        "chest",
        0,
        0.02 * s,
        cr[2].rz * 1.5 + 0.012 * s,
        0.075 * s,
        giltM(back),
        1,
        0.7,
      );
  }

  // ------------------------------------------------------------------
  // Glowkeeper robes (parametrised): ranks, Brothers & Sisters, the Keeper, the Dawn
  // p: {under, outer, open, len, underLen, flare, bell, stole, belt, sun ('decal'|'disc'|null), sunR, pendant,
  //     hood ('up'|'down'|null), hoodColor, mantle, mantleTrim, mantleSun, apron, boot, collar}
  // ------------------------------------------------------------------
  function robes(R, b, rng, look, p) {
    const s = b.s,
      under = p.under,
      outer = p.outer || p.under;
    Object.assign(
      look,
      {
        top: under,
        topRegion: p.region || "rags",
        bottom: under,
        bottomRegion: p.region || "rags",
        sleeve: "long",
        sleeveColor: outer,
        sleeveRegion: p.region || "rags",
        boot: p.boot || 0x2e2218,
        bootH: p.bootH || 0.15,
        laces: false,
      },
      p.look || {},
    );
    H.body(R, b, look);
    const reg = p.region || "rags",
      mo = cloth(outer, { region: reg, paint: p.paint }),
      mu = cloth(under, { region: reg });
    const rings = shell(R, b, mo, 1.08, p.open ? 0.4 : 0, 1);
    if (p.open) {
      // the under-robe shows down the front
      skirt(R, b, mu, p.underLen || 0.98, 0.42, 0, 1);
      skirt(R, b, mo, p.len || 0.9, (p.flare || 0.5) + 0.04, 0.09, 1.06);
    } else skirt(R, b, mo, p.len || 0.95, p.flare || 0.5, 0, 1);
    if (p.bell !== false)
      for (const S of ["L", "R"])
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.075 * s, 0.105 * s, b.fore * 0.62, 12, true),
            0,
            -b.fore * 0.55,
            0,
          ),
          mo,
        );
    if (p.stole)
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.xf(
            P.box(0.045 * s, 0.42 * s, 0.008 * s, 0.003 * s),
            sg * 0.062 * s,
            0.02 * s,
            frontZ(rings, 2, 1.1),
            0.06,
            0,
            sg * 0.04,
          ),
          cloth(p.stole, { region: "rags", rough: 0.7 }),
        );
    const pr = rings.pelvis[3];
    if (p.belt === "rope" || p.belt === "cord")
      R.add(
        "hips",
        P.xf(
          P.torus(1, (p.belt === "rope" ? 0.012 : 0.009) * s, 5, 22),
          0,
          pr.y + 0.03 * s,
          0,
          PI / 2,
          0,
          0,
          pr.rx * 1.17,
          pr.rz * 1.22,
          1,
        ),
        { color: p.beltC || 0x8a7a5a, region: "rags", rough: 1 },
      );
    else if (p.belt === "leather")
      H.belt(R, b, p.beltC || 0x3a2616, BRASS, p.pouches || 0);
    if (p.belt === "rope" || p.belt === "cord") {
      // knotted cord ends hanging
      R.add(
        "hips",
        P.xf(
          P.cyl(0.006 * s, 0.006 * s, 0.22 * s, 5),
          -0.06 * s,
          pr.y - 0.08 * s,
          -pr.rz * 1.24,
          0.05,
          0,
          0.04,
        ),
        { color: p.beltC || 0x8a7a5a, region: "rags", rough: 1 },
      );
      R.add(
        "hips",
        P.xf(
          P.sphere(0.012 * s, 0.012 * s, 0.012 * s, 6, 4),
          -0.06 * s,
          pr.y - 0.19 * s,
          -pr.rz * 1.25,
        ),
        { color: p.beltC || 0x8a7a5a, region: "rags", rough: 1 },
      );
    }
    if (p.apron) {
      const s2 = b.s,
        a = P.loft(
          [
            {
              y: -0.44 * s2,
              rx: pr.rx * 1.2,
              rz: pr.rz * 1.45,
              oz: -0.04 * s2,
              n: 2.2,
            },
            {
              y: -0.12 * s2,
              rx: pr.rx * 1.14,
              rz: pr.rz * 1.24,
              oz: -0.012 * s2,
              n: 2.3,
            },
            { y: 0.075 * s2, rx: pr.rx * 1.12, rz: pr.rz * 1.18, n: 2.3 },
          ],
          { seg: 14, a0: -PI * 0.42, a1: PI * 0.42 },
        );
      R.add("hips", a, leatherM(p.apron));
      R.add(
        "chest",
        P.loft(
          [
            {
              y: -0.05 * s2,
              rx: rings.chest[0].rx * 0.62,
              rz: rings.chest[0].rz * 1.14,
              n: 2.3,
            },
            {
              y: 0.15 * s2,
              rx: rings.chest[2].rx * 0.54,
              rz: rings.chest[2].rz * 1.14,
              oz: rings.chest[2].oz,
              n: 2.3,
            },
          ],
          { seg: 10, a0: -PI * 0.3, a1: PI * 0.3 },
        ),
        leatherM(p.apron),
      );
      H.strap(R, b, L.shade(p.apron, 0.7), [-0.38, 0.15], [-0.26, 0.27], 0.6);
      H.strap(R, b, L.shade(p.apron, 0.7), [0.38, 0.15], [0.26, 0.27], 0.6);
      R.decal(
        "hips",
        "sundisc",
        0.11 * s2,
        0.11 * s2,
        0,
        -0.12 * s2,
        -pr.rz * 1.27 - 0.003,
        0,
        0,
        0,
        { emis: 0.15, color: 0xc8b8a0 },
      );
    }
    if (p.sun === "decal")
      R.decal(
        "chest",
        "sundisc",
        (p.sunR || 0.15) * s,
        (p.sunR || 0.15) * s,
        0,
        0.1 * s,
        frontZ(rings, 2, 1.1) - 0.006,
        0,
        0,
        0,
        { emis: 0.7 },
      );
    else if (p.sun === "disc")
      sun12(
        R,
        "chest",
        0,
        0.11 * s,
        frontZ(rings, 2, 1.12) - 0.006 * s,
        (p.sunR || 0.05) * s,
        giltM(p.sunC),
      );
    if (p.pendant) pendant(R, b, rings, -0.03 * s, 0.022 * s);
    if (p.collar) {
      // tall standing collar (the Keeper's vestment)
      const m = cloth(p.collar, { region: "rags", rough: 0.6, metal: 0.2 });
      R.add(
        "chest",
        P.xf(
          P.cyl(0.082 * s, 0.092 * s, 0.07 * s, 18, true),
          0,
          0.272 * s,
          0.006 * s,
          0.18,
          0,
          0,
          1.12,
          1,
          1.05,
        ),
        m,
      );
    }
    if (p.mantle) mantle(R, b, rings, p.mantle, p.mantleTrim, p.mantleSun);
    if (p.hood === "up") H.hat(R, b, "hood", p.hoodColor || outer);
    else if (p.hood === "down") hoodDown(R, b, rings, p.hoodColor || outer);
    return rings;
  }
  OUT.cast_robes = function (R, b, rng, look, o) {
    const pr = o.preset && L.CAST[o.preset];
    robes(R, b, rng, look, (pr && pr.robe) || { under: OCHRE });
  };

  // ------------------------------------------------------------------
  // Coats (Sol's greatcoat, Ruby's green coat, Wren's long coat, Unkindled layers)
  // p: {shirt, pants, coat, open (gap angle), len, flare, collar, buttons (rows), pockets, boot, bootH, glove, region}
  // ------------------------------------------------------------------
  function coat(R, b, rng, look, p) {
    const s = b.s;
    Object.assign(
      look,
      {
        top: p.shirt,
        topRegion: p.shirtRegion || "rags",
        bottom: p.pants,
        bottomRegion: p.pantsRegion || "rags",
        sleeve: "long",
        sleeveColor: p.coat,
        sleeveRegion: p.region || "rags",
        boot: p.boot || 0x2a2018,
        bootH: p.bootH || 0.3,
        laces: !!p.laces,
        glove: p.glove || null,
      },
      p.look || {},
    );
    H.body(R, b, look);
    const m = cloth(p.coat, { region: p.region || "rags", paint: p.paint });
    const gap = p.open === undefined ? 0.42 : p.open;
    const rings = shell(R, b, m, p.k || 1.08, gap);
    if (p.len)
      H.coatTails(
        R,
        b,
        m,
        p.len,
        p.flare === undefined ? 0.25 : p.flare,
        gap === 0,
      );
    if (p.collar)
      R.add(
        "chest",
        P.xf(
          P.torus(0.072 * s, 0.018 * s, 6, 18),
          0,
          0.252 * s,
          0.006 * s,
          PI / 2 + 0.3,
          0,
          0,
          1.18,
          1.05,
          1,
        ),
        cloth(p.collarC || L.shade(p.coat, 0.92), {
          region: p.region || "rags",
        }),
      );
    if (p.buttons) {
      const bm = metalM(p.buttonC || BRASS, { metal: 0.85, rough: 0.3 }),
        k = (p.k || 1.08) * 1.03;
      const cols = p.buttons === 2 ? [-0.05, 0.05] : [0];
      for (const cx of cols) {
        for (const [y, ri] of [
          [0.14, 2],
          [0.07, 1],
          [0.0, 0],
        ])
          R.add(
            "chest",
            P.xf(
              P.sphere(0.008 * s, 0.008 * s, 0.005 * s, 8, 5),
              cx * s,
              y * s,
              frontZ(rings, ri, k) - 0.002 * s,
            ),
            bm,
          );
        R.add(
          "spine",
          P.xf(
            P.sphere(0.008 * s, 0.008 * s, 0.005 * s, 8, 5),
            cx * s,
            rings.abdomen[1].y,
            -rings.abdomen[1].rz * k * 1.02 +
              (rings.abdomen[1].oz || 0) -
              0.002 * s,
          ),
          bm,
        );
      }
    }
    if (p.pockets)
      for (const sg of [-1, 1])
        R.add(
          "hips",
          P.xf(
            P.box(0.085 * s, 0.075 * s, 0.012 * s, 0.004 * s),
            sg * 0.1 * s,
            -0.01 * s,
            -rings.pelvis[2].rz * 1.15,
            0,
            sg * 0.2,
            0,
          ),
          cloth(L.shade(p.coat, 0.88), { region: p.region || "rags" }),
        );
    return rings;
  }
  OUT.cast_coat = function (R, b, rng, look, o) {
    const pr = o.preset && L.CAST[o.preset];
    coat(
      R,
      b,
      rng,
      look,
      (pr && pr.coat) || {
        shirt: 0x8a8274,
        pants: 0x4a463f,
        coat: 0x5a554c,
        len: 0.6,
      },
    );
  };

  // ------------------------------------------------------------------
  // Kits (run after the head, so the face fit is known)
  // ------------------------------------------------------------------
  /** Burned-skin mottling on the neck's left side / the left hand (old fire burn, healed shiny). */
  const burnPaint = (side) => (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
    if (side && nx * side < 0.15) return;
    const h = L.hash3(wx * 160, wy * 160, wz * 160),
      h2 = L.hash3(wx * 47, wy * 47 + 3, wz * 47);
    const k = clamp((Math.abs(nx) - 0.15) * 2.2, 0, 1) * (side ? 1 : 0.8);
    out[0] *= 1 + 0.12 * k;
    out[1] *= 1 - 0.16 * k;
    out[2] *= 1 - 0.16 * k; // the reddened graft sheet
    if (h2 > 0.35) {
      out[0] *= 1 + 0.12 * k;
      out[1] *= 1 - 0.18 * k;
      out[2] *= 1 - 0.14 * k;
    } // pink islands
    else if (h2 < 0.15) {
      out[0] *= 1 - 0.25 * k;
      out[1] *= 1 - 0.32 * k;
      out[2] *= 1 - 0.32 * k;
    } // darker puckers
    if (h > 0.7) {
      out[0] *= 1 + 0.16 * k;
      out[1] *= 1 + 0.12 * k;
      out[2] *= 1 + 0.12 * k;
    } // pale ridges
  };

  /** The gilt twelve-ray sun mask of the Dawn (variant 'masked'). */
  function sunMask(R, b) {
    const hs = b.headS,
      C = HC(b),
      E = b._eyeFit;
    const eyeY = E ? E.y : C[1] + 0.014 * hs;
    const g = P.sphere(
      0.093 * hs,
      0.132 * hs,
      0.155 * hs,
      22,
      16,
      PI * 1.5 - 1.15,
      2.3,
      0.42,
      1.95,
    );
    P.deform(g, (v) => {
      if (v.z < -0.13 * hs) v.z = -0.13 * hs + (v.z + 0.13 * hs) * 0.5;
    }); // flattened, serene face plate
    const mat = giltM();
    R.add("head", P.xf(g, C[0], C[1] - 0.004 * hs, C[2] + 0.002 * hs), mat);
    const fz = C[2] - 0.134 * hs;
    // eye slits, brow line and a closed, calm mouth line in dark
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.box(0.03 * hs, 0.0065 * hs, 0.006 * hs, 0.002 * hs),
          sg * (E ? E.x : 0.033 * hs),
          eyeY - 0.002 * hs,
          fz - 0.002 * hs,
          0,
          sg * 0.22,
          sg * 0.1,
        ),
        { color: 0x0a0806, rough: 0.9, keepDark: true, rigid: true },
      );
      R.add(
        "head",
        P.xf(
          P.box(0.034 * hs, 0.004 * hs, 0.006 * hs, 0.0015 * hs),
          sg * 0.034 * hs,
          eyeY + 0.02 * hs,
          fz - 0.003 * hs,
          0,
          sg * 0.22,
          sg * -0.08,
        ),
        metalM(0xb88a30, { metal: 0.9, rough: 0.35 }),
      );
    }
    R.add(
      "head",
      P.xf(
        P.box(0.03 * hs, 0.0035 * hs, 0.006 * hs, 0.0015 * hs),
        0,
        C[1] - 0.075 * hs,
        fz + 0.008 * hs,
      ),
      { color: 0x2a1c0a, rough: 0.8, rigid: true },
    );
    R.add(
      "head",
      P.xf(
        P.box(0.012 * hs, 0.04 * hs, 0.012 * hs, 0.005 * hs),
        0,
        eyeY - 0.03 * hs,
        fz - 0.008 * hs,
        -0.25,
        0,
        0,
      ),
      mat,
    ); // nose ridge
    // twelve rays round the face, in a plane just behind the plate's rim
    const cy = C[1] - 0.004 * hs,
      rz0 = C[2] - 0.035 * hs;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2 + PI / 2,
        len = (i % 2 ? 0.055 : 0.07) * hs;
      const rx0 = 0.106 * hs,
        ry0 = 0.14 * hs;
      const ex = Math.cos(a) * rx0,
        ey = Math.sin(a) * ry0;
      const ray = P.cone(0.024 * hs, len, 4);
      P.xf(ray, 0, len / 2, 0, 0, 0, 0, 1, 1, 0.32);
      P.xf(ray, 0, 0, 0, 0, 0, a - PI / 2);
      R.add("head", P.xf(ray, C[0] + ex, cy + ey, rz0), mat);
    }
    R.add(
      "head",
      P.xf(
        P.torus(0.118 * hs, 0.006 * hs, 4, 28),
        C[0],
        cy,
        rz0 + 0.004 * hs,
        0,
        0,
        0,
        0.92,
        1.2,
        1,
      ),
      mat,
    ); // the ring the rays spring from
  }
  /** The Dawn's Key A on a chain, the brass key hanging below the sun disc. */
  function keyOnChain(R, b, rings) {
    const s = b.s,
      z = frontZ(rings, 2, 1.13) - 0.006 * s;
    const chainM = metalM(0x8a7a5a, { metal: 0.85, rough: 0.4 });
    R.add(
      "chest",
      P.sweep(
        [
          [-0.05 * s, 0.26 * s, -0.012 * s],
          [-0.07 * s, 0.17 * s, z * 0.82],
          [-0.03 * s, 0.0, z * 1.01],
          [0, -0.035 * s, z],
          [0.03 * s, 0.0, z * 1.01],
          [0.07 * s, 0.17 * s, z * 0.82],
          [0.05 * s, 0.26 * s, -0.012 * s],
        ],
        0.0018 * s,
        { seg: 18, rs: 3 },
      ),
      chainM,
    );
    const km = metalM(BRASS, { metal: 0.9, rough: 0.3 });
    const ky = -0.05 * s;
    R.add(
      "chest",
      P.xf(P.torus(0.011 * s, 0.003 * s, 4, 12), 0, ky, z - 0.002 * s),
      km,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.006 * s, 0.05 * s, 0.004 * s, 0.001 * s),
        0,
        ky - 0.035 * s,
        z - 0.002 * s,
      ),
      km,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.014 * s, 0.006 * s, 0.004 * s, 0.001 * s),
        0.008 * s,
        ky - 0.052 * s,
        z - 0.002 * s,
      ),
      km,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.01 * s, 0.006 * s, 0.004 * s, 0.001 * s),
        0.006 * s,
        ky - 0.042 * s,
        z - 0.002 * s,
      ),
      km,
    );
  }
  /** The twelve-ray brand inside a wrist (raised scar tissue). */
  function brand(R, b, S, skin) {
    const lr = b.limbR * 0.93,
      y = -b.fore + 0.06 * b.s,
      x = (S === "L" ? 1 : -1) * 0.041 * lr,
      m = skinM(L.shade(skin, 0.78), { rough: 0.35 });
    const gm = P.cyl(0.006 * b.s, 0.006 * b.s, 0.002 * b.s, 10);
    const place = (g) =>
      P.xf(g, x, y, -0.006 * b.s, 0, 0, ((S === "L" ? -1 : 1) * PI) / 2);
    R.add("forearm" + S, place(P.xf(gm, 0, 0, 0, 0, 0, 0)), m);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2,
        g = P.box(0.0016 * b.s, 0.007 * b.s, 0.0016 * b.s, 0.0005 * b.s);
      P.xf(
        g,
        Math.cos(a) * 0.01 * b.s,
        0,
        Math.sin(a) * 0.01 * b.s,
        0,
        -a,
        PI / 2,
      );
      R.add("forearm" + S, place(g), m);
    }
  }
  /** Scoped bolt rifle slung diagonally across the back (Rose, variant 'slung'). */
  function slungRifle(R, b, rings) {
    const s = b.s,
      z = rings.chest[2].rz * 1.2 + 0.03 * s;
    const wood = leatherM(0x5a3a22, { region: "wood", rough: 0.6 }),
      steel = metalM(0x2a2a2c, { metal: 0.8, rough: 0.35 });
    const ang = 0.72,
      place = (g, along, off) =>
        P.xf(
          g,
          Math.sin(ang) * along + off[0],
          -Math.cos(ang) * along + 0.08 * s + off[1],
          z + off[2],
          0,
          0,
          ang,
        );
    R.add(
      "chest",
      place(P.box(0.03 * s, 0.34 * s, 0.05 * s, 0.01 * s), -0.2 * s, [0, 0, 0]),
      wood,
    ); // stock + fore-end
    R.add(
      "chest",
      place(P.cyl(0.008 * s, 0.009 * s, 0.5 * s, 8), 0.2 * s, [
        0,
        0,
        0.002 * s,
      ]),
      steel,
    ); // barrel
    R.add(
      "chest",
      place(P.box(0.026 * s, 0.14 * s, 0.03 * s, 0.006 * s), 0.0, [
        0,
        0,
        0.004 * s,
      ]),
      steel,
    ); // receiver
    R.add(
      "chest",
      place(P.cyl(0.012 * s, 0.012 * s, 0.16 * s, 10), 0.0, [0, 0, 0.034 * s]),
      steel,
    ); // scope
    for (const k of [-1, 1])
      R.add(
        "chest",
        place(P.cyl(0.016 * s, 0.014 * s, 0.025 * s, 10), k * 0.085 * s, [
          0,
          0,
          0.034 * s,
        ]),
        steel,
      );
    R.add(
      "chest",
      place(P.box(0.03 * s, 0.075 * s, 0.035 * s, 0.01 * s), -0.4 * s, [
        0,
        0,
        -0.004 * s,
      ]),
      wood,
    ); // butt
    H.strap(R, b, 0x3a2616, [-0.85, -0.12], [0.85, 0.24], 0.8, false); // sling across the chest
  }
  /** Lantern hanging at the hip (Brother Taper). */
  function hipLantern(R, b, rings) {
    const s = b.s,
      pr = rings.pelvis[3],
      x = pr.rx * 1.18,
      y = pr.y - 0.1 * s;
    const fm = metalM(0x3a3630, { metal: 0.7, rough: 0.5 });
    R.add(
      "hips",
      P.xf(P.box(0.06 * s, 0.085 * s, 0.06 * s, 0.006 * s), x, y, -0.02 * s),
      { color: 0xffcf7a, emis: 1.4, rough: 0.2, region: "white", rigid: true },
    );
    for (const yy of [0.045, -0.045])
      R.add(
        "hips",
        P.xf(
          P.box(0.072 * s, 0.01 * s, 0.072 * s, 0.003 * s),
          x,
          y + yy * s,
          -0.02 * s,
        ),
        fm,
      );
    R.add(
      "hips",
      P.xf(
        P.torus(0.018 * s, 0.003 * s, 4, 10, PI),
        x,
        y + 0.06 * s,
        -0.02 * s,
      ),
      fm,
    );
  }
  /** Bandolier of candle stubs. */
  function candleBandolier(R, b) {
    H.strap(R, b, 0x4a3422, [0.85, 0.24], [-0.8, -0.05], 1.2, false);
    const s = b.s,
      rings = H.torsoRings(b),
      D = rings.chest[2].rz * 1.1,
      W = rings.chest[2].rx * 1.05;
    for (let i = 1; i < 6; i++) {
      const t = i / 6,
        x = lerp(0.85, -0.8, t) * W,
        y = lerp(0.24, -0.05, t) * s,
        zf = -Math.sqrt(Math.max(0, 1 - Math.pow(x / (W * 1.05), 2))) * D;
      R.add(
        "chest",
        P.xf(
          P.cyl(0.007 * s, 0.007 * s, 0.03 * s, 6),
          x,
          y + 0.012 * s,
          zf - 0.016 * s,
        ),
        { color: WAX, rough: 0.5, region: "rags" },
      );
    }
  }

  // ------------------------------------------------------------------
  // ROSE: practical scavenged gear, red accent, bandolier, cuff (brand under it)
  // ------------------------------------------------------------------
  OUT.cast_rose = function (R, b, rng, look, o) {
    const s = b.s,
      jacket = 0x7a7450,
      shirt = 0x5e6670,
      pants = 0x5e5644;
    Object.assign(look, {
      top: shirt,
      topRegion: "cloth",
      bottom: pants,
      bottomRegion: "rags",
      sleeve: "long",
      sleeveColor: jacket,
      sleeveRegion: "rags",
      boot: 0x2a1c12,
      bootH: 0.55,
      laces: true,
      glove: 0x2c2018,
    });
    H.body(R, b, look);
    const wax2 = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const h = L.hash3(wx * 60, wy * 60, wz * 60);
      if (h > 0.8) {
        out[0] *= 0.86;
        out[1] *= 0.86;
        out[2] *= 0.84;
      }
    }; // waxed canvas
    const m = cloth(jacket, { region: "rags", paint: wax2, rough: 0.75 });
    const rings = shell(R, b, m, 1.07, 0.36);
    H.coatTails(R, b, m, 0.17, 0.12, false);
    R.add(
      "chest",
      P.xf(
        P.torus(0.072 * s, 0.02 * s, 6, 18),
        0,
        0.252 * s,
        0.01 * s,
        PI / 2 + 0.42,
        0,
        0,
        1.2,
        1.05,
        1,
      ),
      m,
    ); // turned-up collar
    for (const sg of [-1, 1]) {
      // chest pockets with flaps, hip pockets
      R.add(
        "chest",
        P.xf(
          P.box(0.06 * s, 0.065 * s, 0.014 * s, 0.004 * s),
          sg * 0.075 * s,
          0.09 * s,
          frontZ(rings, 1, 1.1),
          0,
          sg * 0.18,
          0,
        ),
        cloth(L.shade(jacket, 0.9), { region: "rags" }),
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.064 * s, 0.022 * s, 0.018 * s, 0.004 * s),
          sg * 0.075 * s,
          0.125 * s,
          frontZ(rings, 1, 1.12),
          0.2,
          sg * 0.18,
          0,
        ),
        cloth(L.shade(jacket, 0.82), { region: "rags" }),
      );
      R.add(
        "hips",
        P.xf(
          P.box(0.08 * s, 0.07 * s, 0.014 * s, 0.004 * s),
          sg * 0.1 * s,
          -0.02 * s,
          -rings.pelvis[2].rz * 1.14,
          0,
          sg * 0.22,
          0,
        ),
        cloth(L.shade(jacket, 0.9), { region: "rags" }),
      );
    }
    for (const S of ["L", "R"])
      R.add(
        "forearm" + S,
        P.xf(
          P.sphere(0.04 * s, 0.05 * s, 0.026 * s, 8, 6),
          0,
          -0.02 * s,
          0.034 * s,
        ),
        leatherM(0x4a3020),
      ); // leather elbow patches
    neckerchief(R, b, rings, RED);
    armband(R, b, "L", cloth(RED, { region: "cloth" }), 0.32, 0.075, 1.06);
    H.strap(R, b, 0x3a2616, [0.85, 0.22], [-0.8, -0.05], 1.5, true); // cartridge bandolier
    H.belt(R, b, 0x2a1c12, 0x8a8a7a, 3);
  };
  function roseKit(R, b, rng, look, o, f) {
    const rings = H.torsoRings(b),
      s = b.s;
    if (f.brand) brand(R, b, "L", look.skin);
    else wristCuff(R, b, "L", leatherM(0x5a3820, { rough: 0.55 }), 0.075);
    // flint & steel striker on a cord at the throat ('no candles, sparks only')
    const z = frontZ(rings, 3, 1.25) - 0.006 * s;
    R.add(
      "chest",
      P.xf(
        P.torus(0.012 * s, 0.0025 * s, 4, 10, PI * 1.6),
        0.02 * s,
        0.205 * s,
        z,
        0,
        0,
        PI * 0.7,
      ),
      metalM(0x2a2a28, { metal: 0.8, rough: 0.4 }),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.01 * s, 0.018 * s, 0.006 * s, 0.002 * s),
        0.02 * s,
        0.19 * s,
        z - 0.002 * s,
      ),
      { color: 0x8a8478, rough: 0.6, region: "metal" },
    );
    if (f.slung) slungRifle(R, b, rings);
  }

  // ------------------------------------------------------------------
  // SISTER DAWN (Nicole Mead): layered pale robes, mantle with the gilt sun, wax, Key A
  // ------------------------------------------------------------------
  function dawnKit(R, b, rng, look, o, f) {
    const rings = H.torsoRings(b),
      s = b.s;
    keyOnChain(R, b, rings);
    // candle wax down the sleeves & the front of the outer robe
    const zf = (x, y) => frontZ(rings, 1, 1.1) - 0.004 * s;
    wax(R, rng, "chest", 6, [-0.1 * s, 0.1 * s, -0.04 * s, 0.06 * s, zf]);
    for (const S of ["L", "R"])
      wax(R, rng, "forearm" + S, 4, [
        -0.06 * s,
        0.06 * s,
        -b.fore * 0.75,
        -b.fore * 0.35,
        () => -0.095 * s,
      ]);
    // the burned left hand under a loose linen wrap
    const lr = b.limbR * 0.93;
    R.add(
      "handL",
      P.xf(
        P.cyl(0.042 * lr, 0.046 * lr, 0.06 * s, 12, true),
        0,
        -0.03 * s,
        0,
        0,
        0,
        0,
        1.05,
        1,
        0.72,
      ),
      cloth(0xd8d0bc, { region: "rags", rough: 1 }),
    );
    if (f.masked) sunMask(R, b);
  }

  // ------------------------------------------------------------------
  // Other named kits
  // ------------------------------------------------------------------
  function keeperKit(R, b) {
    const rings = H.torsoRings(b);
    sun12(
      R,
      "chest",
      0,
      0.02 * b.s,
      rings.chest[2].rz * 1.15 + 0.01 * b.s,
      0.09 * b.s,
      giltM(),
      1,
      0.75,
    );
  }
  function taperKit(R, b) {
    const rings = H.torsoRings(b);
    hipLantern(R, b, rings);
    candleBandolier(R, b);
  }
  function tinderKit(R, b) {
    H.glasses(R, b, "weldup");
  }
  function teagueKit(R, b) {
    const rings = H.torsoRings(b);
    pendant(R, b, rings, 0.2 * b.s, 0.012 * b.s, 0x2a2420);
  }
  function keelKit(R, b) {
    const rings = H.torsoRings(b),
      s = b.s;
    peakedCap(R, b, 0x4a4e52, 0x2a2c30);
    const z = frontZ(rings, 2, 1.07) - 0.004 * s;
    [0x8a2a2a, 0x2a4a8a, 0xb8a050].forEach((c, i) =>
      R.add(
        "chest",
        P.xf(
          P.box(0.016 * s, 0.009 * s, 0.004 * s, 0.001 * s),
          0.07 * s + (i - 1) * 0.017 * s,
          0.17 * s,
          z,
        ),
        cloth(c),
      ),
    );
    for (const S of ["L", "R"])
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.022 * b.s, 0.006 * b.s, 0.02 * b.s, 0.002 * b.s),
          0,
          0.052 * b.s,
          0,
        ),
        metalM(GILT),
      ); // major's oak-leaf pips
  }
  function callowayKit(R, b) {
    // Long Winter ID badge on the lapel, a cardigan-grey shawl
    const rings = H.torsoRings(b),
      s = b.s,
      z = frontZ(rings, 2, 1.1) - 0.004 * s;
    R.add(
      "chest",
      P.xf(
        P.box(0.04 * s, 0.055 * s, 0.004 * s, 0.002 * s),
        0.085 * s,
        0.1 * s,
        z,
      ),
      { color: 0xe8e4d8, rough: 0.4, region: "white" },
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.04 * s, 0.012 * s, 0.005 * s, 0.001 * s),
        0.085 * s,
        0.12 * s,
        z - 0.001 * s,
      ),
      cloth(0xc86a2a),
    );
  }
  function ilseKit(R, b) {
    // interpreter headphones round the neck, Continuity armband
    const s = b.s,
      rings = H.torsoRings(b);
    R.add(
      "chest",
      P.xf(
        P.torus(0.088 * s, 0.006 * s, 5, 18, PI),
        0,
        0.262 * s,
        0.006 * s,
        PI / 2 + 0.25,
        0,
        0,
        1,
        1.15,
        1,
      ),
      metalM(0x2a2a2a, { metal: 0.4 }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.cyl(0.03 * s, 0.03 * s, 0.022 * s, 12),
          sg * 0.092 * s,
          0.25 * s,
          frontZ(rings, 4, 0.9),
          0,
          0.35 * sg,
          PI / 2,
        ),
        leatherM(0x1a1a1a),
      );
    void rings;
    armband(R, b, "L", cloth(0x5a5e62), 0.35, 0.06);
    R.decal(
      "armL",
      "continuity",
      0.05 * s,
      0.025 * s,
      -0.062 * b.limbR,
      -b.upper * 0.35,
      0,
      0,
      PI / 2,
      0,
    );
  }
  function wrenKit(R, b) {
    H.cowl(R, b, 0x6a5a4a, { tail: 0.7, drape: 0 });
  }
  function solKit(R, b) {
    const s = b.s,
      rings = H.torsoRings(b);
    peakedCap(R, b, 0x5a2626, 0xa88a3a);
    H.cowl(R, b, 0x3c6e6a, { tail: 0, drape: 0.3 });
    // gold braid aiguillette from the right shoulder
    R.add(
      "chest",
      P.sweep(
        [
          [0.14 * s, 0.2 * s, -0.02 * s],
          [0.13 * s, 0.12 * s, frontZ(rings, 2, 1.12)],
          [0.07 * s, 0.07 * s, frontZ(rings, 1, 1.14)],
          [0.03 * s, 0.14 * s, frontZ(rings, 2, 1.13)],
        ],
        0.004 * s,
        { seg: 12, rs: 4 },
      ),
      metalM(0xb8963a, { metal: 0.7, rough: 0.45 }),
    );
    for (const S of ["L", "R"])
      R.add(
        "arm" + S,
        P.xf(P.box(0.09 * s, 0.014 * s, 0.06 * s, 0.004 * s), 0, 0.045 * s, 0),
        metalM(0xa88a3a, { metal: 0.6, rough: 0.5 }),
      );
  }
  function rubyKit(R, b) {
    const s = b.s,
      rings = H.torsoRings(b);
    H.cowl(R, b, 0x9a7a3e, { tail: 0, drape: 0 });
    // tape measure hanging round the neck
    const tm = { color: 0xd8b840, rough: 0.6, region: "rags" };
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.sweep(
          [
            [sg * 0.06 * s, 0.27 * s, 0.0],
            [sg * 0.075 * s, 0.18 * s, frontZ(rings, 3, 1.2)],
            [sg * 0.065 * s, 0.02 * s, frontZ(rings, 1, 1.18)],
          ],
          0.006 * s,
          { seg: 8, rs: 3 },
        ),
        tm,
      );
    R.add(
      "forearmL",
      P.xf(
        P.sphere(0.022 * s, 0.016 * s, 0.022 * s, 8, 6),
        0.045 * s,
        -b.fore + 0.06 * s,
        0,
      ),
      cloth(0xa02a2a),
    ); // pincushion
  }
  /** Unkindled: a scrap of Rose's red on every one, cut-down ochre robe pieces. */
  function unkindledKit(R, b, rng, look, o, f, face, who) {
    const s = b.s,
      rings = H.torsoRings(b);
    const red = cloth(RED, { region: "rags" }),
      ochre = cloth(OCHRE, { region: "rags" });
    if (who === "jory") {
      neckerchief(R, b, rings, RED);
      H.accessories(R, b, ["satchel"], rng);
    } else if (who === "pockets") {
      armband(R, b, "R", red, 0.38, 0.045);
      for (let i = 0; i < 6; i++)
        R.add(
          i < 4 ? "chest" : "spine",
          P.xf(
            P.box(0.05 * s, 0.05 * s, 0.022 * s, 0.006 * s),
            (i % 2 ? 1 : -1) * 0.07 * s,
            i < 4 ? (0.12 - (i >> 1) * 0.08) * s : 0.08 * s,
            i < 4
              ? frontZ(rings, i < 2 ? 2 : 1, 1.16)
              : -rings.abdomen[1].rz * 1.2,
          ),
          cloth(0x8a7a54, { region: "rags" }),
        );
    } else if (who === "beanie") {
      R.add(
        "chest",
        P.xf(
          P.box(0.02 * s, 0.12 * s, 0.006 * s, 0.002 * s),
          -0.06 * s,
          0.1 * s,
          frontZ(rings, 2, 1.12),
          0,
          0,
          0.3,
        ),
        red,
      );
    } // red ribbon pinned on
    else if (who === "ash") {
      armband(R, b, "L", red, 0.3, 0.04);
    }
    // a strip of ochre robe worn as a sash
    H.strap(R, b, OCHRE, [-0.85, 0.24], [0.8, -0.06], 1.9, false);
    void ochre;
  }

  // ------------------------------------------------------------------
  // PRESETS
  // ------------------------------------------------------------------
  const ROBE_DAWN = {
    region: "cloth",
    under: 0xe0dacb,
    outer: 0x9a968e,
    open: true,
    len: 0.88,
    underLen: 1.0,
    flare: 0.45,
    stole: null,
    belt: "cord",
    beltC: 0xb8a070,
    sun: "disc",
    sunR: 0.05,
    mantle: 0x5e5a56,
    mantleTrim: 0xb8903a,
    mantleSun: GILT,
    bootH: 0.12,
    boot: 0x3a3026,
  };
  const CAST = (L.CAST = {
    sister_dawn: {
      name: "Nicole Mead / Sister Dawn",
      desc: "50, Glowkeeper founder: layered pale robes, grey mantle with the gilt twelve-ray sun, Key A, burn scar, grey-streaked dark hair",
      variants: ["masked"],
      outfit: "cast_robes",
      robe: ROBE_DAWN,
      seed: 41,
      opts: {
        gender: "f",
        skinTone: 0xd6c0b2,
        hair: "long",
        hairColor: 0x342c26,
        beard: null,
        age: 0.5,
      },
      body: { thin: true, muscle: 0, scale: 1.0 },
      face: {
        seed: 4417,
        hairStreak: 0.85,
        streakColor: 0xd6d2ca,
        eyeColor: 0x56664e,
        zyg: 1.55,
        gaunt: 0.32,
        sq: -0.05,
        chinF: 1.0,
        toothGap: 1,
        burn: "L",
        pallor: 0.85,
        scars: false,
        makeup: false,
        freckles: false,
        dirt: 0.2,
        noseSize: 0.95,
        jawW: 0.7,
      },
      kit: dawnKit,
      look: { neckBurn: -1, handBurn: "L" },
      wear: [[0.05, 0.16], 0.3],
    },
    rose: {
      name: 'Rose Mead ("Flint")',
      desc: "21, sharpshooter: cropped dark hair, olive field jacket, cartridge bandolier, red neckerchief + armband, leather cuff on the left wrist",
      variants: ["brand", "slung"],
      outfit: "cast_rose",
      seed: 23,
      opts: {
        gender: "f",
        skinTone: "fair",
        hair: "short",
        hairColor: 0x2e2118,
        beard: null,
        age: 0.08,
      },
      body: { muscle: 0.25, scale: 1.0 },
      face: {
        seed: 2391,
        eyeColor: 0x56664e,
        zyg: 1.25,
        sq: 0.1,
        chinF: 1.35,
        scars: false,
        makeup: false,
        freckles: false,
        dirt: 0.7,
        jawW: 0.74,
      },
      kit: roseKit,
    },
    keeper_hollowell: {
      name: "Keeper Ezra Hollowell",
      desc: "public Keeper: elder, white beard, gold-and-ivory vestments, tall collar, big twelve-ray sun on the back",
      outfit: "cast_robes",
      seed: 7,
      robe: {
        region: "cloth",
        under: 0xe0d8c4,
        outer: 0xc8a660,
        open: true,
        len: 0.9,
        underLen: 1.0,
        flare: 0.55,
        stole: 0xe8c060,
        belt: "cord",
        beltC: 0xd8b860,
        sun: "disc",
        sunR: 0.055,
        collar: 0xd8b860,
        bootH: 0.12,
      },
      opts: {
        gender: "m",
        skinTone: "tan",
        hair: "balding",
        hairColor: 0xd8d4cc,
        beard: "full",
        age: 0.92,
      },
      body: { muscle: 0.1, scale: 1.02 },
      face: { seed: 707, scars: false, dirt: 0.15, brow: 1.2 },
      kit: keeperKit,
    },
    sister_noonday: {
      name: "Sister Noonday",
      desc: "ochre robe, gold stole, head veil, middle-aged",
      outfit: "cast_robes",
      seed: 19,
      robe: {
        under: 0xb08a50,
        belt: "cord",
        stole: 0xe0b050,
        sun: "decal",
        hood: "up",
        hoodColor: 0xe0d8c4,
        bootH: 0.12,
      },
      opts: {
        gender: "f",
        skinTone: "brown",
        hair: "bun",
        hairColor: 0x1c1611,
        beard: null,
        age: 0.5,
      },
      face: { seed: 1919, scars: false, makeup: false },
    },
    brother_taper: {
      name: "Brother Taper",
      desc: "watcher / messenger: tall, lean, hooded grey-ochre travelling robe, candle-lantern at the hip, candle-stub bandolier",
      outfit: "cast_robes",
      seed: 31,
      robe: {
        under: 0x8a7a5a,
        outer: 0x7a7060,
        len: 0.78,
        flare: 0.35,
        belt: "rope",
        hood: "up",
        pendant: true,
        bell: false,
        bootH: 0.34,
        boot: 0x2a2018,
      },
      opts: {
        gender: "m",
        skinTone: "olive",
        hair: "short",
        hairColor: 0x3a2616,
        beard: "stubble",
        age: 0.45,
      },
      body: { thin: true, scale: 1.08 },
      face: { seed: 3131, scars: false },
      kit: taperKit,
    },
    brother_tinder: {
      name: "Brother Tinder",
      desc: "Second Sun engineer: stocky, beard, rust robe under a leather work apron with the sun, welding goggles up, heavy gloves",
      outfit: "cast_robes",
      seed: 37,
      robe: {
        under: 0x7a5038,
        len: 0.6,
        flare: 0.3,
        belt: "leather",
        beltC: 0x2a1c12,
        pouches: 4,
        apron: 0x4a3322,
        hood: "down",
        bell: false,
        bootH: 0.45,
        boot: 0x241a12,
        look: { sleeve: "rolled", glove: 0x3a2a1a },
      },
      opts: {
        gender: "m",
        skinTone: "fair",
        hair: "buzz",
        hairColor: 0x6c2b18,
        beard: "full",
        age: 0.5,
      },
      body: { muscle: 0.5, scale: 0.98 },
      face: { seed: 3737, dirt: 1 },
      kit: tinderKit,
    },
    sol_abramowitz: {
      name: "Sol Abramowitz",
      desc: "old Tudor City doorman, ~70: faded maroon greatcoat, brass buttons, gold shoulder cord, peaked cap, teal cowl",
      outfit: "cast_coat",
      seed: 43,
      coat: {
        shirt: 0x8a8274,
        pants: 0x3a3430,
        coat: 0x6a2e2a,
        open: 0,
        len: 0.62,
        flare: 0.22,
        collar: true,
        buttons: 2,
        bootH: 0.2,
        boot: 0x1a1612,
        k: 1.1,
      },
      opts: {
        gender: "m",
        crowdPlain: true,
        skinTone: "olive",
        hair: "balding",
        hairColor: 0xb8b2a8,
        beard: "moustache",
        age: 0.92,
      },
      body: { scale: 0.98 },
      face: { seed: 4343, burn: "R" },
      kit: solKit,
    },
    ruby_kehoe: {
      name: "Ruby Kehoe",
      desc: "grey-haired Neon seamstress, sixties, in Nicole's old bottle-green coat, tape measure round her neck",
      outfit: "cast_coat",
      seed: 47,
      coat: {
        shirt: 0x8a8274,
        pants: 0x4a463f,
        coat: 0x2e5a3e,
        open: 0.3,
        len: 0.55,
        flare: 0.2,
        collar: true,
        collarC: 0x24482f,
        buttons: 1,
        pockets: true,
        bootH: 0.25,
        region: "cloth",
      },
      opts: {
        gender: "f",
        crowdPlain: true,
        skinTone: "fair",
        hair: "bob",
        hairColor: 0x9a968e,
        beard: null,
        age: 0.7,
        hat: "wrap",
        hatColor: 0x8e4e34,
      },
      face: { seed: 4747 },
      kit: rubyKit,
    },
    ilse_moravec: {
      name: "Ilse Moravec",
      desc: "Nicole's UN booth partner, Continuity translator: silver bob, glasses, charcoal suit, interpreter headphones round the neck",
      outfit: "director_suit",
      seed: 53,
      opts: {
        gender: "f",
        skinTone: "fair",
        hair: "bob",
        hairColor: 0xb8b4ac,
        beard: null,
        age: 0.72,
        glasses: "square",
        outfitColor: 0x3a3c44,
      },
      face: { seed: 5353, scars: false, makeup: true },
      kit: ilseKit,
    },
    private_teague: {
      name: "Private Teague",
      desc: "young Continuity private, grey service uniform, no cap, hidden brass twelve-ray pendant",
      outfit: "continuity_uniform",
      seed: 59,
      opts: {
        gender: "m",
        skinTone: "pale",
        hair: "buzz",
        hairColor: 0x8a6a3c,
        beard: null,
        age: 0.08,
        noCap: true,
      },
      face: { seed: 5959, scars: false, freckles: true },
      kit: teagueKit,
    },
    major_keel: {
      name: "Major Adelaide Keel",
      desc: "Continuity officer, ~47: steel-grey bun, officer tunic, peaked cap, ribbon bar",
      outfit: "continuity_uniform",
      seed: 61,
      opts: {
        gender: "f",
        skinTone: "fair",
        hair: "bun",
        hairColor: 0x8a8680,
        beard: null,
        age: 0.55,
        noCap: true,
      },
      face: { seed: 6161, scars: false, makeup: false, sq: 0.05 },
      kit: keelKit,
    },
    director_calloway: {
      name: "Director Ruth Calloway",
      desc: "C-9 Facility Director, ~62: grey bun, horn-rim glasses, worn charcoal suit, Long Winter ID badge",
      outfit: "director_suit",
      seed: 67,
      opts: {
        gender: "f",
        skinTone: "fair",
        hair: "bun",
        hairColor: 0xc8c3b8,
        beard: null,
        age: 0.85,
        glasses: "square",
        outfitColor: 0x40424a,
      },
      face: { seed: 6767, scars: false, makeup: false, dirt: 0.8 },
      kit: callowayKit,
    },
    sister_agnes: {
      name: "Sister Agnes",
      desc: "old nun of Old St. Patrick's churchyard, ~71: plain black habit, black veil over a white coif, white collar, wooden cross on a cord",
      outfit: "cast_robes",
      seed: 53,
      robe: {
        region: "cloth",
        under: 0x1d1c21,
        len: 0.98,
        flare: 0.38,
        belt: "cord",
        beltC: 0x24232a,
        hood: "up",
        hoodColor: 0x18171c,
        bootH: 0.14,
        boot: 0x1a1612,
      },
      opts: {
        gender: "f",
        crowdPlain: true,
        hair: "bun",
        hairColor: 0x8a8680,
        beard: null,
        age: 0.8,
      },
      face: { seed: 5353, makeup: false },
      kit: nunKit,
    },
    tobias_wren: {
      name: "Tobias Wren",
      desc: "keeper of the Register: old man, white beard, round spectacles, long patched coat, the Register at his hip",
      outfit: "cast_coat",
      seed: 71,
      coat: {
        shirt: 0x8a7e68,
        pants: 0x4a4236,
        coat: 0x55503f,
        open: 0.4,
        len: 0.7,
        flare: 0.25,
        collar: true,
        pockets: true,
        bootH: 0.3,
      },
      opts: {
        gender: "m",
        skinTone: "tan",
        hair: "balding",
        hairColor: 0xd0ccc4,
        beard: "full",
        age: 1,
        glasses: "round",
        hat: "knit",
        hatColor: 0x5a4a3a,
        acc: "ledger,satchel",
      },
      body: { scale: 0.95 },
      face: { seed: 7171 },
      kit: wrenKit,
    },
    // --- the Unkindled (Rose's crew of cult runaways)
    unkindled_jory: {
      name: "Jory",
      desc: "Unkindled runaway, red neckerchief, satchel, ochre robe sash",
      outfit: "cast_coat",
      seed: 73,
      coat: {
        shirt: 0x8a8274,
        pants: 0x5a6070,
        coat: 0x6a6a52,
        open: 0.4,
        len: 0.2,
        bootH: 0.3,
      },
      opts: {
        gender: "m",
        skinTone: "brown",
        hair: "wild",
        hairColor: 0x1c1611,
        beard: null,
        age: 0,
      },
      body: { scale: 0.92, thin: true },
      face: { seed: 7373, scars: false, dirt: 0.9 },
      kit: (R, b, rng, look, o, f, face) =>
        unkindledKit(R, b, rng, look, o, f, face, "jory"),
    },
    unkindled_pockets: {
      name: "Pockets",
      desc: "Unkindled runaway, many-pocket vest, red armband",
      outfit: "cast_coat",
      seed: 79,
      coat: {
        shirt: 0x8a8a90,
        pants: 0x5e5644,
        coat: 0x9a8a5a,
        open: 0.5,
        bootH: 0.3,
        look: { sleeve: "long", sleeveColor: 0x8a8a90 },
      },
      opts: {
        gender: "f",
        skinTone: "fair",
        hair: "ponytail",
        hairColor: 0x5b3b20,
        beard: null,
        age: 0,
      },
      body: { scale: 0.9, thin: true },
      face: {
        seed: 7979,
        freckles: true,
        makeup: false,
        scars: false,
        dirt: 0.9,
      },
      kit: (R, b, rng, look, o, f, face) =>
        unkindledKit(R, b, rng, look, o, f, face, "pockets"),
    },
    unkindled_beanie: {
      name: "Beanie",
      desc: "Unkindled runaway, the youngest: red knit cap, oversized coat",
      outfit: "cast_coat",
      seed: 83,
      coat: {
        shirt: 0x7a7266,
        pants: 0x4e4a40,
        coat: 0x6e5a40,
        open: 0.3,
        len: 0.45,
        flare: 0.3,
        k: 1.14,
        bootH: 0.25,
      },
      opts: {
        gender: "m",
        skinTone: "tan",
        hair: "short",
        hairColor: 0x3a2616,
        beard: null,
        age: 0,
        hat: "knit",
        hatColor: RED,
      },
      body: { scale: 0.84, thin: true },
      face: { seed: 8383, scars: false, dirt: 1 },
      kit: (R, b, rng, look, o, f, face) =>
        unkindledKit(R, b, rng, look, o, f, face, "beanie"),
    },
    unkindled_ash: {
      name: "Ash",
      desc: "Unkindled runaway, soot-dark hood, red armband",
      outfit: "cast_robes",
      seed: 89,
      robe: {
        under: 0x3a3634,
        outer: 0x2e2a28,
        len: 0.4,
        flare: 0.25,
        bell: false,
        belt: "rope",
        beltC: OCHRE,
        hood: "up",
        hoodColor: 0x2a2624,
        bootH: 0.34,
        look: { bottom: 0x3e3a32 },
      },
      opts: {
        gender: "f",
        skinTone: "olive",
        hair: "short",
        hairColor: 0x1c1611,
        beard: null,
        age: 0.02,
      },
      body: { scale: 0.92, thin: true },
      face: { seed: 8989, scars: false, makeup: false, dirt: 1 },
      kit: (R, b, rng, look, o, f, face) =>
        unkindledKit(R, b, rng, look, o, f, face, "ash"),
    },
    // --- RANKS (caller seed = variety)
    glowkeeper_acolyte: {
      name: "Glowkeeper Acolyte",
      desc: "undyed oatmeal robe, hood, rope belt, wooden twelve-ray sun token",
      outfit: "cast_robes",
      ranked: true,
      robe: {
        under: 0xa89878,
        len: 0.92,
        belt: "rope",
        hood: "up",
        pendant: true,
        bootH: 0.15,
      },
      opts: { hair: "short" },
    },
    glowkeeper_zealot: {
      name: "Glowkeeper Zealot",
      desc: "rust-red robe, hood + face wrap, padded leather chest guard with the sun, wrapped forearms",
      outfit: "cast_robes",
      ranked: true,
      robe: {
        under: 0x7a3424,
        len: 0.7,
        flare: 0.3,
        bell: false,
        belt: "leather",
        beltC: 0x2a1c12,
        pouches: 2,
        hood: "up",
        hoodColor: 0x6a2a1e,
        bootH: 0.42,
        boot: 0x221810,
      },
      opts: { hair: "buzz" },
      kit: zealotKit,
    },
    glowkeeper_brother: {
      name: "Glowkeeper Brother",
      desc: "ordained: ivory robe, gold stole, twelve-ray sun disc, hood down",
      outfit: "cast_robes",
      ranked: true,
      robe: {
        region: "cloth",
        under: 0xd8d0bc,
        len: 0.95,
        belt: "cord",
        stole: 0xe0b050,
        sun: "decal",
        hood: "down",
        bootH: 0.12,
      },
      opts: { gender: "m" },
      lock: ["gender"],
    },
    glowkeeper_sister: {
      name: "Glowkeeper Sister",
      desc: "ordained: ivory robe, gold stole, twelve-ray sun disc, veil",
      outfit: "cast_robes",
      ranked: true,
      robe: {
        region: "cloth",
        under: 0xd8d0bc,
        len: 0.95,
        belt: "cord",
        stole: 0xe0b050,
        sun: "decal",
        hood: "up",
        hoodColor: 0xe8e2d4,
        bootH: 0.12,
      },
      opts: { gender: "f", hair: "bun" },
      lock: ["gender"],
    },
    unkindled: {
      name: "Unkindled",
      desc: "generic cult runaway (random cut of the named four)",
      outfit: "cast_coat",
      ranked: true,
      coat: {
        shirt: 0x8a8274,
        pants: 0x5a5a5e,
        coat: 0x6a6450,
        open: 0.4,
        len: 0.25,
        bootH: 0.3,
      },
      opts: { age: 0 },
      body: { scale: 0.9, thin: true },
      kit: (R, b, rng, look, o, f, face) =>
        unkindledKit(
          R,
          b,
          rng,
          look,
          o,
          f,
          face,
          rng.pick(["jory", "pockets", "beanie", "ash"]),
        ),
    },
  });
  /** A plain nun's habit: white coif framing the face under the black veil, white collar, wooden cross on a cord. */
  function nunKit(R, b) {
    const s = b.s,
      hs = b.headS,
      C = HC(b),
      rings = H.torsoRings(b),
      white = cloth(0xe6e2d8, { region: "cloth", rough: 0.8 });
    const coif = [
      {
        y: C[1] - 0.15 * hs,
        rx: 0.124 * hs,
        rz: 0.122 * hs,
        oz: C[2] + 0.026 * hs,
        n: 2,
      },
      {
        y: C[1] - 0.05 * hs,
        rx: 0.1 * hs,
        rz: 0.117 * hs,
        oz: C[2] + 0.013 * hs,
        n: 2,
      },
      {
        y: C[1] + 0.06 * hs,
        rx: 0.099 * hs,
        rz: 0.113 * hs,
        oz: C[2] + 0.01 * hs,
        n: 2,
      },
      {
        y: C[1] + 0.112 * hs,
        rx: 0.074 * hs,
        rz: 0.088 * hs,
        oz: C[2] + 0.018 * hs,
        n: 2,
      },
    ];
    R.add(
      "head",
      P.loft(coif, { seg: 18, a0: PI * 0.16, a1: PI * 1.84 }),
      white,
    ); // the hood (veil) sits over it; its rim frames the face
    R.add(
      "chest",
      P.xf(
        P.cyl(0.084 * s, 0.15 * s, 0.085 * s, 20, true),
        0,
        0.235 * s,
        0.006 * s,
        0.1,
        0,
        0,
        1.12,
        1,
        1.05,
      ),
      white,
    ); // collar
    const z = frontZ(rings, 2, 1.13) - 0.006 * s,
      wood = leatherM(0x5a3a22),
      y = 0.06 * s;
    R.add(
      "chest",
      P.sweep(
        [
          [-0.06 * s, 0.24 * s, -0.01 * s],
          [-0.06 * s, 0.16 * s, z * 0.85],
          [0, y + 0.05 * s, z],
          [0.06 * s, 0.16 * s, z * 0.85],
          [0.06 * s, 0.24 * s, -0.01 * s],
        ],
        0.002 * s,
        { seg: 14, rs: 3 },
      ),
      leatherM(0x2a2018),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.011 * s, 0.075 * s, 0.008 * s, 0.002 * s),
        0,
        y + 0.012 * s,
        z - 0.002 * s,
      ),
      wood,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.046 * s, 0.011 * s, 0.008 * s, 0.002 * s),
        0,
        y + 0.03 * s,
        z - 0.003 * s,
      ),
      wood,
    );
  }
  function zealotKit(R, b, rng) {
    const s = b.s,
      rings = H.torsoRings(b);
    // padded leather chest guard with the sun painted on
    const cg = P.loft(scaleRings(rings.chest.slice(0, 4), 1.16, 1.2), {
      seg: 16,
      a0: -PI * 0.42,
      a1: PI * 0.42,
    });
    R.add("chest", cg, leatherM(0x4a3020));
    R.decal(
      "chest",
      "sundisc",
      0.12 * s,
      0.12 * s,
      0,
      0.09 * s,
      frontZ(rings, 2, 1.22) - 0.004,
      0,
      0,
      0,
      { emis: 0.35 },
    );
    H.wraps(R, b, 0xb8ae98, "arms", { armTop: 0.35 });
    H.mask(R, b, "scarf", 0x6a2a1e, 0x8a3a2a);
    void rng;
  }

  // ------------------------------------------------------------------
  // Resolution: L.castOpts(id, callerOpts) → human opts (used by 50_character resolveId)
  // ------------------------------------------------------------------
  const FORCE = [
    "outfit",
    "gender",
    "skinTone",
    "hair",
    "hairColor",
    "beard",
    "burn",
    "scars",
    "hat",
    "hatColor",
    "glasses",
    "age",
    "acc",
    "outfitColor",
    "scale",
    "color",
    "crowdPlain",
    "noCap",
  ];
  const RANK_KEEP = ["gender", "skinTone", "hair", "hairColor", "beard"];
  L.castFlags = function (v) {
    const f = {};
    if (typeof v === "string")
      for (const k of v.split(/[,+ ]+/)) if (k) f[k] = true;
    return f;
  };
  L.castOpts = function (id, caller) {
    const c = CAST[id],
      o = Object.assign({}, caller || {});
    for (const k of FORCE) delete o[k];
    Object.assign(o, c.opts || {});
    if (c.ranked) {
      for (const k of RANK_KEEP)
        if (
          (c.lock || []).indexOf(k) < 0 &&
          caller &&
          caller[k] !== undefined &&
          caller[k] !== null
        )
          o[k] = caller[k];
    } else o.seed = c.seed;
    o.outfit = c.outfit;
    o.preset = id;
    const f = L.castFlags(caller && caller.variant),
      ok = Object.keys(f)
        .filter((k) => (c.variants || []).indexOf(k) >= 0)
        .sort();
    if (ok.length) o.variant = ok.join(",");
    else delete o.variant;
    return o;
  };
  // per-preset look hooks the outfits read (neck / hand burns for the Dawn)
  const _robe = OUT.cast_robes;
  OUT.cast_robes = function (R, b, rng, look, o) {
    const pr = o.preset && CAST[o.preset];
    if (pr && pr.look && pr.look.neckBurn) {
      look.neckMat = skinM(look.skin, {
        paint: burnPaint(pr.look.neckBurn),
        region: "skin",
      });
      look.skinPaintL = burnPaint(0);
    }
    return _robe(R, b, rng, look, o);
  };
})();
