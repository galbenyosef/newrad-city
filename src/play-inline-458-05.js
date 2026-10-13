// play-inline-458 05 — face
// Lines 681-1493 of readable/play-inline-458.pretty.js (statement-aligned).
  H.head = function (R, b, face) {
    const hs = b.headS;
    const C = [0, 0.105 * hs, -0.01 * hs];
    // (r2: skull 9 % narrower — 0.09 made a 19 cm wide head: faces read as wide
    //  potatoes with the eyes too close together for the face; hats & masks follow, see H.HEAD_X)
    const RX = 0.082 * hs,
      RY = 0.118 * hs,
      RZ = 0.103 * hs;
    const mutant = !!face.mutant,
      female = face.gender === "f",
      maniac = !!face.maniac;
    const K = (face._k = {
      mutant,
      female,
      maniac,
      gaunt: face.gaunt !== undefined ? face.gaunt : maniac ? 0.6 : 0,
      jawW: (face.jawW || (female ? 0.74 : 0.82)) * 0.97,
      browK: (face.brow || 1) * (female ? 0.7 : 1),
      nose: face.noseSize || 1,
      age: clamp(face.age || 0, 0, 1),
      mouthW: mutant ? 0.3 : female ? 0.235 : 0.25,
      socket: 0,
    });
    // per-seed skull & face proportions (templates differ in bone structure, not only colour)
    {
      const fr = L.rng(((face.seed || 7) * 2246822519 + 3266489917) >>> 0);
      const jw0 = face.jawW || (female ? 0.72 : 0.81);
      K.sw = (face.skullW || fr.range(0.955, 1.035)) * 1; // cranium breadth
      K.cw = K.sw * fr.range(0.975, 1.035) * (maniac ? 0.97 : 1); // cheek width
      K.gw =
        (female ? 0.9 : 1) *
        clamp(jw0 / (female ? 0.72 : 0.81), 0.86, 1.1) *
        (maniac ? 0.95 : 1) *
        (mutant ? 1.12 : 1); // jaw at the gonion
      K.chinW = female ? fr.range(0.82, 0.95) : fr.range(0.92, 1.12);
      K.chinF = mutant ? 1.3 : face.chinF || fr.range(0.6, 1.5); // chin projection
      K.chinL = fr.range(-0.6, 0.8); // chin length
      K.sq =
        face.sq !== undefined
          ? face.sq
          : female
            ? fr.range(-0.3, 0.1)
            : fr.range(-0.1, 0.45); // jaw squareness
      K.zyg = (face.zyg || fr.range(0.65, 1.4)) * (maniac ? 1.2 : 1); // cheekbones
      K.hump = female ? fr.range(-0.4, 0.3) : fr.range(-0.3, 1.0); // nasal hump
      K.noseL = fr.range(0.92, 1.1);
      if (!face.brow) K.browK *= fr.range(0.8, 1.25);
    }
    const at = (x, y, z) => [C[0] + x * RX, C[1] + y * RY, C[2] + z * RZ];
    const HW = R.world("head");
    const toUnitW = (wx, wy, wz, o) => {
      o[0] = (wx - HW[0] - C[0]) / RX;
      o[1] = (wy - HW[1] - C[1]) / RY;
      o[2] = (wz - HW[2] - C[2]) / RZ;
      return o;
    };
    const skinCol = face.skin;
    const skinPaint = face.skinPaint || null; // grime, scabs and burns on the face come from the face texture
    const skinBase = {
      color: skinCol,
      region: "skin",
      rough: 0.74,
      noise: maniac ? 0.06 : 0.03,
      grad: [0.94, 1.03],
      paint: skinPaint,
      cls: 2,
    };

    // ---- eye metrics (metres, head-local)
    const re = (mutant ? 0.0092 : 0.0118) * hs;
    K.socket = (re * (mutant ? 1.05 : 1.0)) / RZ;
    const eyePre = surfAt(face, 0.355, 0.125, { noSocket: true });
    const eyeC = at(0.355, 0.125, eyePre[2]);
    eyeC[2] += re * (mutant ? 1.25 : 1.0); // cornea apex level with the brow/cheek plane
    const eyeY = eyeC[1];

    // ---- face bones (children of head; jaw comes from the skeleton)
    const hasFaceBones = R.has("head") && !R.has("eyeL");
    const mouthPre = [];
    for (const sg of [-1, 1])
      mouthPre.push(surfAt(face, sg * K.mouthW, MOUTH_Y, { noRecess: true }));
    const mouthC = surfAt(face, 0, MOUTH_Y, { noRecess: true });
    const lipUc = surfAt(face, 0, MOUTH_Y + 0.07, { noRecess: true });
    if (hasFaceBones) {
      for (const [S, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        R.bone("eye" + S, "head", sg * eyeC[0], eyeC[1], eyeC[2], "head");
        R.bone("lid" + S, "head", sg * eyeC[0], eyeC[1], eyeC[2], "head");
        R.bone("lidLo" + S, "head", sg * eyeC[0], eyeC[1], eyeC[2], "head");
        const bp = surfAt(face, sg * 0.33, 0.3);
        R.bone(
          "brow" + S,
          "head",
          C[0] + bp[0] * RX,
          C[1] + bp[1] * RY,
          C[2] + bp[2] * RZ,
          "head",
        );
        const mp = mouthPre[sg < 0 ? 0 : 1];
        R.bone(
          "mouth" + S,
          "head",
          C[0] + mp[0] * RX,
          C[1] + mp[1] * RY,
          C[2] + mp[2] * RZ,
          "head",
        );
      }
      R.bone(
        "lipU",
        "head",
        C[0],
        C[1] + lipUc[1] * RY,
        C[2] + lipUc[2] * RZ,
        "head",
      );
    }
    const skinFn = (part) =>
      hasFaceBones
        ? (wx, wy, wz) => {
            const u = toUnitW(wx, wy, wz, [0, 0, 0]);
            return faceSkin(K, u[0], u[1], u[2], part);
          }
        : undefined;

    // ---- SKULL
    const g = headGrid(GRID_M, GRID_N);
    const posA = g.attributes.position,
      nV = posA.count;
    const vt = new Float32Array(nV * 3);
    const o6 = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < nV; i++) {
      sculpt(face, posA.getX(i), posA.getY(i), posA.getZ(i), o6);
      const shade = o6[3],
        warm = o6[4];
      vt[i * 3] = shade * (1 + warm * 0.06);
      vt[i * 3 + 1] = shade * (1 - warm * 0.025);
      vt[i * 3 + 2] = shade * (1 - warm * 0.035);
      posA.setXYZ(i, C[0] + o6[0] * RX, C[1] + o6[1] * RY, C[2] + o6[2] * RZ);
    }
    g.computeVertexNormals();
    weldNormals(g);
    R.add(
      "head",
      g,
      Object.assign({}, skinBase, {
        vtint: vt,
        faceUV: true,
        noDouble: true,
        skin: skinFn(null),
      }),
    );

    // ---- EYES
    const eyeWhite = maniac ? 0xe4b2a6 : mutant ? 0xd8c890 : 0xeae4da; // Maniacs: bloodshot
    const iris = face.eyeColor || 0x4a3422;
    const toUnitLocal = (ox, oy, oz) => (x, y, z, o) => {
      o[0] = (x + ox - C[0]) / RX;
      o[1] = (y + oy - C[1]) / RY;
      o[2] = (z + oz - C[2]) / RZ;
      return o;
    };
    const lidOpen = 0.3,
      lidLow = 0.44; // rest elevation of the upper / lower lid margins (radians)
    const rl = re * 1.085,
      rl2 = re * 1.07;
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const eb = hasFaceBones ? "eye" + S : "head";
      const ex = sg * eyeC[0];
      const off = hasFaceBones ? [0, 0, 0] : [ex, eyeC[1], eyeC[2]];
      // sclera: whiter toward the iris, pinker & darker toward the corners
      const scl = P.xf(P.sphere(re, re, re, 12, 9), off[0], off[1], off[2]);
      R.add(eb, scl, {
        color: eyeWhite,
        rough: 0.16,
        noise: 0.015,
        grad: [1, 1],
        rigid: true,
        cls: 0,
        paint: (x, y, z, nx, ny, nz, out) => {
          const k = Math.pow(clamp(-nz, 0, 1), 0.6);
          out[0] *= lerp(0.8, 1, k);
          out[1] *= lerp(0.64, 1, k);
          out[2] *= lerp(0.62, 1, k);
        },
      });
      // iris: a slightly domed cap sampling the painted iris swatch (fibres, limbal ring, pupil)
      const ia = mutant ? 0.62 : 0.52;
      const ir = P.sphere(
        re * 1.012,
        re * 1.012,
        re * 1.012,
        14,
        4,
        0,
        PI * 2,
        0,
        ia,
      );
      P.xf(ir, 0, 0, 0, -PI / 2, 0, 0);
      {
        const pa = ir.attributes.position,
          uvA = new Float32Array(pa.count * 2),
          rr = re * Math.sin(ia);
        for (let i = 0; i < pa.count; i++) {
          const u = pa.getX(i) / rr,
            v = pa.getY(i) / rr;
          uvA[i * 2] = (SW.iris[0] + SW.iris[2] * (0.5 + 0.47 * u)) / FT;
          uvA[i * 2 + 1] = (SW.iris[1] + SW.iris[3] * (0.5 - 0.47 * v)) / FT;
          // cornea bulge
          const d = Math.min(1, Math.hypot(u, v));
          pa.setZ(i, pa.getZ(i) - re * 0.07 * (1 - d * d));
        }
        ir.setAttribute("uv", new THREE.BufferAttribute(uvA, 2));
        ir.computeVertexNormals();
      }
      P.xf(ir, off[0], off[1], off[2]);
      R.add(eb, ir, {
        color: iris,
        rough: 0.06,
        noise: 0,
        grad: [1, 1],
        faceUV: true,
        rigid: true,
        cls: 0,
        noDouble: true,
      });
      // catchlight (fixed to the head: highlights don't roll with the eye)
      R.add(
        "head",
        P.xf(
          P.sphere(re * 0.075, re * 0.075, re * 0.03, 6, 4),
          ex - re * 0.28,
          eyeY + re * 0.3,
          eyeC[2] - re * 1.02,
        ),
        { color: 0xffffff, emis: 0.7, rough: 0.05, noise: 0, grad: [1, 1] },
      );

      // ---- lids (upper on lid bone, lower on lidLo bone; both pivot at the eye centre)
      // ALMOND aperture: the margins are curves on the eyeball sphere, highest
      // (upper) / lowest (lower) slightly off-centre, meeting at the medial &
      // lateral canthi well inside the eyeball silhouette (lateral canthus a
      // touch higher = positive canthal tilt). Beyond the canthi the two lids
      // overlap, so no sclera ever shows round the sides ("staring" look).
      const ub = hasFaceBones ? "lid" + S : "head",
        lb = hasFaceBones ? "lidLo" + S : "head";
      const lidM = Object.assign({}, skinBase, {
        faceUV: true,
        rough: 0.55,
        noDouble: true,
      }); // inner side only ever faces the eyeball
      const lat = (ph) => ph * sg > 0; // lateral half (toward the ear)
      const phC = (ph) => (lat(ph) ? 0.4 : 0.35) * PI;
      const eC = (ph) =>
        (lat(ph) ? 0.03 + (female ? 0.03 : 0) : -0.07) + (mutant ? -0.05 : 0);
      const upPeak = -sg * 0.06,
        loPeak = sg * 0.08; // upper peak a little medial, lower dip a little lateral
      const mU = (ph) => {
        const q = Math.abs(ph - upPeak) / phC(ph);
        const e0 = lidOpen * (mutant ? 0.7 : 1);
        return q <= 1
          ? lerp(e0, eC(ph), Math.pow(q, 2.3))
          : eC(ph) - (q - 1) * 1.1;
      };
      const mL = (ph) => {
        const q = Math.abs(ph - loPeak) / phC(ph);
        return q <= 1
          ? lerp(-lidLow, eC(ph), Math.pow(q, 1.7))
          : eC(ph) + (q - 1) * 1.1;
      };
      /** lid shell: rows from the margin curve m(ph) to elevation `far`, cols over ±PH */
      const lidShell = (r, m, far, WS, HS) => {
        const PH = PI * 0.62,
          pos = [],
          idx = [];
        for (let j = 0; j <= HS; j++) {
          const t = Math.pow(j / HS, 1.5);
          for (let i = 0; i <= WS; i++) {
            const ph = -PH + (2 * PH * i) / WS,
              e = lerp(m(ph), far, t);
            pos.push(
              r * Math.cos(e) * Math.sin(ph) + off[0],
              r * Math.sin(e) + off[1],
              -r * Math.cos(e) * Math.cos(ph) + off[2],
            );
          }
        }
        const W = WS + 1;
        for (let j = 0; j < HS; j++)
          for (let i = 0; i < WS; i++) {
            const a = j * W + i;
            idx.push(a, a + 1, a + W, a + 1, a + W + 1, a + W);
          }
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
        g.setIndex(idx);
        g.computeVertexNormals();
        // face outward (away from the eye centre)
        const nA = g.attributes.normal,
          k = Math.floor(W * (HS >> 1) + (WS >> 1));
        const ox = pos[k * 3] - off[0],
          oy = pos[k * 3 + 1] - off[1],
          oz = pos[k * 3 + 2] - off[2];
        if (nA.getX(k) * ox + nA.getY(k) * oy + nA.getZ(k) * oz < 0) {
          for (let q = 0; q < idx.length; q += 3) {
            const tq = idx[q + 1];
            idx[q + 1] = idx[q + 2];
            idx[q + 2] = tq;
          }
          g.setIndex(idx);
          g.computeVertexNormals();
        }
        return g;
      };
      const up = lidShell(rl, mU, PI * 0.5 + 0.3, 18, 6);
      projectUV(
        up,
        toUnitLocal(
          hasFaceBones ? ex : 0,
          hasFaceBones ? eyeC[1] : 0,
          hasFaceBones ? eyeC[2] : 0,
        ),
      );
      R.add(ub, up, lidM);
      const lo = lidShell(rl2, mL, -(PI * 0.5 + 0.2), 18, 5);
      projectUV(
        lo,
        toUnitLocal(
          hasFaceBones ? ex : 0,
          hasFaceBones ? eyeC[1] : 0,
          hasFaceBones ? eyeC[2] : 0,
        ),
      );
      R.add(lb, lo, lidM);
      // lid margins: dark lash line above, wet line below; upper lashes
      const rim = (r, m, a0, a1, n) => {
        const pts = [];
        for (let i = 0; i <= n; i++) {
          const ph = lerp(a0, a1, i / n),
            e = m(ph);
          pts.push([
            r * Math.cos(e) * Math.sin(ph) + off[0],
            r * Math.sin(e) + off[1],
            -r * Math.cos(e) * Math.cos(ph) + off[2],
          ]);
        }
        return pts;
      };
      const rimU = rim(
        rl * 1.004,
        mU,
        -phC(-0.01) * 1.02,
        phC(0.01) * 1.02,
        14,
      );
      R.add(ub, arcTube(rimU, re * 0.075), {
        color: maniac ? 0x3a1a12 : 0x1e130c,
        rough: 0.7,
        noise: 0.05,
        region: "fur",
        rigid: true,
        cls: 3,
      });
      if (!maniac && !mutant) {
        // lashes: a thin fringe curling out & up from the upper margin (longer toward the outer corner)
        const n = 14,
          lp = [],
          li = [];
        for (let i = 0; i <= n; i++) {
          const ph = lerp(-phC(-0.01) * 0.95, phC(0.01) * 0.95, i / n);
          const outer = lat(ph) ? 1.1 : 0.85;
          const len =
            (female ? 0.36 : 0.24) *
            re *
            (0.5 + 0.5 * Math.cos(ph * 1.15)) *
            outer;
          const e = mU(ph),
            ce = Math.cos(e),
            se = Math.sin(e);
          const bx = rl * ce * Math.sin(ph),
            by = rl * se,
            bz = -rl * ce * Math.cos(ph);
          const nx = Math.sin(ph),
            nz = -Math.cos(ph); // outward from the eye
          const tip = [
            bx + nx * len * 0.6,
            by + len * 0.62,
            bz + nz * len * 0.6,
          ];
          lp.push(
            bx + off[0],
            by + off[1],
            bz + off[2],
            tip[0] + off[0],
            tip[1] + off[1],
            tip[2] + off[2],
          );
        }
        for (let i = 0; i < n; i++) {
          const a = i * 2;
          li.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
        const lg = new THREE.BufferGeometry();
        lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
        lg.setIndex(li);
        lg.computeVertexNormals();
        R.add(ub, lg, {
          color: L.shade(face.hairColor || 0x2a1a10, 0.5),
          rough: 0.9,
          noise: 0,
          region: "fur",
          rigid: true,
          keepDark: true,
          cls: 3,
        });
      }
      const rimL = rim(
        rl2 * 1.002,
        mL,
        -phC(-0.01) * 0.97,
        phC(0.01) * 0.97,
        12,
      );
      R.add(lb, arcTube(rimL, re * 0.05), {
        color: maniac ? 0x8a3a2c : 0xb87a6e,
        rough: 0.12,
        noise: 0.03,
        rigid: true,
        cls: 0,
      });
      // caruncle: the small pink fold in the inner corner
      if (!mutant) {
        const ph = -sg * phC(-sg) * 0.97,
          e = eC(-sg) - 0.02,
          r3 = rl2 * 0.99;
        R.add(
          "head",
          P.xf(
            P.sphere(re * 0.16, re * 0.2, re * 0.13, 6, 5),
            ex + r3 * Math.cos(e) * Math.sin(ph),
            eyeC[1] + r3 * Math.sin(e),
            eyeC[2] - r3 * Math.cos(e) * Math.cos(ph),
          ),
          {
            color: maniac ? 0x9a4a3c : 0xc27f78,
            rough: 0.2,
            noise: 0.03,
            rigid: true,
            cls: 0,
          },
        );
      }
    }

    // ---- MOUTH: cavity, teeth, tongue, lips
    const mw = K.mouthW;
    const mY = C[1] + MOUTH_Y * RY; // lip contact line (head-local)
    const surfZ = (ux) => {
      const p = surfAt(face, ux, MOUTH_Y, { noRecess: true });
      return C[2] + p[2] * RZ;
    };
    const zc = surfZ(0);
    const jawW = R.world("jaw");
    const jawLocal = [jawW[0] - HW[0], jawW[1] - HW[1], jawW[2] - HW[2]];
    const onJaw = (geo) => P.xf(geo, -jawLocal[0], -jawLocal[1], -jawLocal[2]); // head-local → jaw-local
    // (the throat is the mouth recess itself: painted dark & wet, it stretches open with the jaw)
    // teeth: slightly yellowed, some chipped / missing on Maniacs and raiders
    const trng = L.rng((face.seed || 7) * 31 + 5);
    const toothCol = maniac ? 0xc4b078 : mutant ? 0xcfc08a : 0xdcd2b4;
    const missing = (i) =>
      (maniac && trng() < 0.14) || (face.paint === "raider" && trng() < 0.12);
    const archZ = (u) => zc + 0.0078 * hs + u * u * 0.012 * hs;
    for (let i = 0; i < 10; i++) {
      const u = (i - 4.5) / 5.2;
      if (missing(i)) continue;
      const wdt =
        (Math.abs(u) < 0.25 ? 0.0078 : Math.abs(u) < 0.6 ? 0.0068 : 0.0072) *
        hs;
      const hgt = (Math.abs(u) < 0.25 ? 0.0105 : 0.0095) * hs;
      const tg = P.box(wdt, hgt, 0.0055 * hs, 0.0015 * hs, 1);
      P.xf(
        tg,
        u * mw * RX * 0.84 +
          (face.toothGap ? Math.sign(u) * face.toothGap * 0.0018 * hs : 0),
        mY + hgt * 0.5 + 0.0012 * hs - Math.abs(u) * 0.001 * hs,
        archZ(u),
        0,
        -u * 0.9,
        0,
      );
      R.add("head", tg, {
        color: L.shade(toothCol, 0.92 + trng() * 0.14),
        rough: 0.3,
        noise: 0.08,
        grad: [0.85, 1.05],
        rigid: true,
        cls: 0,
      });
    }
    // gums above the upper teeth (only visible when lips are drawn back)
    R.add(
      "head",
      P.xf(
        P.box(mw * RX * 1.7, 0.006 * hs, 0.008 * hs, 0.003 * hs, 1),
        0,
        mY + 0.0135 * hs,
        archZ(0) + 0.002 * hs,
      ),
      { color: 0x9a4a48, rough: 0.3, noise: 0.12, rigid: true, cls: 0 },
    );
    for (let i = 0; i < 10; i++) {
      const u = (i - 4.5) / 5.2;
      if (missing(i)) continue;
      const wdt = 0.0064 * hs,
        hgt = 0.0088 * hs;
      const tg = P.box(wdt, hgt, 0.005 * hs, 0.0014 * hs, 1);
      P.xf(
        tg,
        u * mw * RX * 0.78,
        mY - hgt * 0.5 - 0.0024 * hs,
        archZ(u) + 0.0028 * hs,
        0,
        -u * 0.9,
        0,
      );
      R.add("jaw", onJaw(tg), {
        color: L.shade(toothCol, 0.88 + trng() * 0.12),
        rough: 0.3,
        noise: 0.08,
        grad: [1.05, 0.85],
        rigid: true,
        cls: 0,
      });
    }
    // tongue
    R.add(
      "jaw",
      onJaw(
        P.xf(
          P.sphere(mw * RX * 0.7, 0.0062 * hs, 0.012 * hs, 8, 6),
          0,
          mY - 0.0085 * hs,
          zc + 0.0165 * hs,
        ),
      ),
      {
        color: 0xa04a48,
        rough: 0.28,
        noise: 0.06,
        grad: [0.8, 1.05],
        rigid: true,
        cls: 0,
      },
    );
    // lips: upper (cupid's bow, slopes forward-down) on head/lipU/corners; fuller lower lip on the jaw
    {
      const lipCol =
        face.lipColor ||
        (maniac
          ? L.mix(skinCol, 0x7a4a44, 0.4)
          : L.mix(skinCol, female ? 0x9a3a3c : 0x8e4a44, female ? 0.55 : 0.34));
      // lip shading: the upper lip faces down (darker), the contact line and
      // the inner lip roll into the mouth (dark), the lower lip catches light
      const lipShade = (upperLip) => (x, y, z, nx, ny, nz, out) => {
        let k = upperLip
          ? lerp(0.7, 1.0, L.smooth(-0.7, 0.4, ny))
          : lerp(0.82, 1.06, L.smooth(-0.2, 0.8, ny));
        k *= lerp(1, 0.38, L.smooth(-0.1, 0.55, nz)); // rolls inward → into the mouth
        k *= lerp(
          1,
          0.55,
          L.smooth(upperLip ? -0.35 : 0.35, upperLip ? -0.85 : 0.85, ny) *
            L.smooth(0.2, -0.4, nz) *
            0.6,
        ); // contact line
        out[0] *= k;
        out[1] *= k * 0.98;
        out[2] *= k * 0.98;
      };
      const lipM = {
        color: lipCol,
        rough: 0.42,
        noise: 0.03,
        grad: [1, 1],
        faceUV: true,
        cls: 2,
        noDouble: true,
      };
      const thin = maniac ? 0.9 : mutant ? 1.25 : 1;
      const zs = [];
      for (let i = 0; i <= 28; i++) zs.push(surfZ((-1 + (2 * i) / 28) * mw));
      const zAt = (u) => {
        const f = (u + 1) * 14,
          i = Math.min(27, Math.floor(f));
        return lerp(zs[i], zs[i + 1], f - i);
      };
      const upper = lipTube(
        (u) => {
          const rv = 0.0037 * hs * thin * (female ? 1.08 : 1);
          return [
            u * mw * RX,
            mY + rv * 0.95 * Math.pow(1 - u * u, 0.4) + 0.0003 * hs,
            zAt(u) + (0.0036 + 0.0045 * u * u) * hs,
          ];
        }, // sits on the dental arch; corners tuck into the cheeks
        (u) => {
          const k = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.3)), 0.55);
          const bow =
            1 -
            0.14 * Math.exp(-Math.pow(u / 0.13, 2)) +
            0.08 * Math.exp(-Math.pow((Math.abs(u) - 0.24) / 0.12, 2));
          const rv = 0.0037 * hs * thin * (female ? 1.08 : 1) * k * bow;
          return [rv, rv * 0.95 + 0.0006 * hs * k];
        },
        (u) => 0.32,
        20,
        8,
        SW.lips,
      );
      R.add(
        "head",
        upper,
        Object.assign({}, lipM, {
          color: L.shade(lipCol, 0.93),
          paint: lipShade(true),
          skin: skinFn("upperLip"),
        }),
      );
      const lower = lipTube(
        (u) => {
          const rv =
            0.004 * hs * thin * (female ? 1.12 : 1) * (mutant ? 1.3 : 1);
          return [
            u * mw * RX * 0.95,
            mY - rv * 0.9 * Math.pow(1 - u * u, 0.4) - 0.0002 * hs,
            zAt(u) + (0.0056 + 0.0045 * u * u) * hs,
          ];
        }, // lower lip BEHIND the upper
        (u) => {
          const k = Math.pow(Math.max(0, 1 - Math.pow(Math.abs(u), 2.2)), 0.65);
          const rv =
            0.004 * hs * thin * (female ? 1.12 : 1) * (mutant ? 1.3 : 1) * k;
          return [rv, rv * 0.9 + 0.0004 * hs * k];
        },
        (u) => -0.25,
        20,
        8,
        [
          SW.lips[0],
          SW.lips[1] + SW.lips[3] * 0.5,
          SW.lips[2],
          SW.lips[3] * 0.5,
        ],
      );
      R.add(
        "jaw",
        onJaw(lower),
        Object.assign({}, lipM, {
          color: L.shade(lipCol, 1.06),
          paint: lipShade(false),
          skin: skinFn("lowerLip"),
        }),
      );
    }

    // ---- EARS: flattened shell with a hollowed concha and a rolled helix
    for (const sg of [-1, 1]) {
      const e = at(sg * 0.975, -0.02, 0.06);
      const ear = P.sphere(
        0.0085 * hs,
        0.029 * hs * (mutant ? 0.8 : 1),
        0.018 * hs,
        10,
        8,
      );
      P.deform(ear, (v) => {
        // concha: push the outward face in, leaving a rolled rim
        const ry = v.y / (0.031 * hs),
          rz = v.z / (0.02 * hs);
        const d = Math.hypot(ry * 1.15, rz * 1.2 + 0.15);
        if (v.x > 0) v.x -= 0.0075 * hs * Math.exp(-Math.pow(d / 0.6, 4));
        if (v.x < 0) v.x *= 0.5; // flat against the skull
      });
      if (sg < 0) P.mirrorX(ear);
      P.xf(ear, e[0] + sg * 0.001 * hs, e[1], e[2], 0, sg * 0.22, 0);
      projectUV(ear, (x, y, z, o) => {
        o[0] = (x - C[0]) / RX;
        o[1] = (y - C[1]) / RY;
        o[2] = (z - C[2]) / RZ;
        return o;
      });
      R.add(
        "head",
        ear,
        Object.assign({}, skinBase, { faceUV: true, noDouble: true }),
      );
    }

    // ---- hair / beard (stubble is painted into the face texture)
    const hc = face.hairColor || 0x3a2616;
    // hair shells CONFORM to the sculpted skull (flat-sided cranium, forehead
    // slope, temples) instead of a plain ellipsoid: no gap/"helmet" rim at
    // the hairline, the kept edge ring lands exactly on the scalp
    face._skull = (x, y, z, o) =>
      sculpt(face, x, y, z, o, { noSocket: true, noRecess: true });
    if (face.hair && face.hair !== "none" && face.hair !== "bald")
      H.hair(R, b, face.hair, hc, C, RX, RY, RZ, face);
    face._skull = null;
    if (face.beard && face.beard !== "stubble") {
      if (!mutant)
        sculptedBeard(
          R,
          b,
          face,
          face.beard,
          hc,
          C,
          RX,
          RY,
          RZ,
          hasFaceBones ? skinFn(null) : null,
        );
      else
        H.beard(
          R,
          b,
          face.beard,
          hc,
          C,
          RX,
          RY,
          RZ,
          hasFaceBones ? skinFn(null) : undefined,
        );
    }

    // ---- metadata for the face controller and the face texture
    if (hasFaceBones) {
      R.meta.faceRig = {
        hs,
        re,
        lidOpen,
        lidLow,
        mouthW: mw * RX,
        mutant,
        maniac,
        female,
        mood:
          face.mood ||
          (face.angry || mutant ? "angry" : maniac ? "maniac" : null),
      };
    }
    // ---- eyewear fit: outfits add glasses BEFORE the head is built, so they
    // are deferred (b._pendingGlasses) and placed on the sculpted face here.
    {
      const sp = [0, 0, 0, 0, 0, 0];
      sculpt(face, 0.995, 0.125, -0.1, sp);
      const back = [0, 0, 0, 0, 0, 0];
      sculpt(face, 0, 0.125, 0.995, back);
      b._eyeFit = {
        x: eyeC[0],
        y: eyeY,
        cornea: eyeC[2] - re * (mutant ? 1.25 : 1.0) - re,
        re,
        side: C[0] + Math.abs(sp[0]) * RX,
        sideZ: C[2] + sp[2] * RZ,
        back: C[2] + back[2] * RZ * 1.04,
        brow: C[2] + surfAt(face, 0.2, 0.28)[2] * RZ,
        nose: C[2] + surfAt(face, 0, 0.14)[2] * RZ,
      };
      const pend = b._pendingGlasses;
      b._pendingGlasses = null;
      if (pend) for (const kind of pend) H.glasses(R, b, kind);
    }
    R.meta.face = {
      skin: skinCol,
      gender: face.gender,
      hairColor: hc,
      hair: face.hair,
      beard: face.beard,
      age: K.age,
      maniac,
      mutant,
      paint: face.paint || null,
      paintSeed: face.paintSeed || 0,
      seed: face.seed || face.paintSeed || 1,
      scars: face.scars,
      dirt: face.dirt,
      freckles: face.freckles,
      makeup: face.makeup,
      burn: face.burn || null,
      pallor: face.pallor || 0,
      eyeColor: iris,
      hairKeep: face._hairKeep || null,
    };
    return { C, RX, RY, RZ };
  };

  /**
   * SCULPTED BEARD: a shell that grows out of the sculpted face (instead of a
   * scaled sphere floating over it — that read as a black bandana/mask).
   * Coverage comes from the same beard mask the face texture paints stubble
   * with (plus a style mask), with a noisy, thinning edge: the ring next to the
   * edge lies ON the skin, so the beard grows out of a painted shadow instead
   * of ending in a cliff. Longer on the chin; lips stay clean; skinned to the
   * jaw / mouth-corner bones so it opens with the mouth.
   */
