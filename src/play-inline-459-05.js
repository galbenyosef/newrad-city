// play-inline-459 05 — add
// Lines 848-1192 of readable/play-inline-459.pretty.js (statement-aligned).
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
