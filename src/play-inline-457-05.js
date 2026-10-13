// play-inline-457 05 — face
// Lines 891-1298 of readable/play-inline-457.pretty.js (statement-aligned).
  H.head = function (R, b, face) {
    const hs = b.headS;
    const C = [0, 0.105 * hs, -0.01 * hs];
    const RX = 0.09 * hs,
      RY = 0.118 * hs,
      RZ = 0.103 * hs;
    const maniac = !!face.maniac;
    const jawW = face.jawW || (face.gender === "f" ? 0.78 : 0.86);
    const skinCol = face.skin;
    const skinPaint =
      face.skinPaint ||
      (maniac
        ? H.grimePaint(face)
        : face.paint === "raider"
          ? H.raiderPaint(face.paintSeed || 1)
          : face.age > 0.5
            ? H.agePaint
            : null);
    const skin = skinM(skinCol, {
      region: "skin",
      paint: skinPaint,
      noise: maniac ? 0.1 : 0.06,
    });
    const mutant = !!face.mutant;
    const female = face.gender === "f";
    const browK = (face.brow || 1) * (female ? 0.7 : 1);
    // ---- skull: a deformed sphere sculpted into brow ridge, eye sockets, nose
    // bridge, cheekbones, cheek hollows, nasolabial folds, lips, chin & jaw.
    // A per-vertex tint array bakes ambient occlusion (sockets, under the brow,
    // folds, under the jaw) and a little warmth on the cheeks/lips.
    const g = P.sphere(1, 1, 1, 26, 20);
    const nV = g.attributes.position.count;
    const vt = new Float32Array(nV * 3);
    const gau = (dx, dy, w) => Math.exp(-(dx * dx + dy * dy) / w);
    const sm = (a0, a1, x) => {
      const t = clamp((x - a0) / (a1 - a0), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const segD = (px, py, ax, ay, bx, by) => {
      const vx = bx - ax,
        vy = by - ay;
      const t = clamp(
        ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy),
        0,
        1,
      );
      return Math.hypot(px - ax - vx * t, py - ay - vy * t);
    };
    const stubble = !!face.stubble;
    P.deform(g, (v, i) => {
      let x = v.x,
        y = v.y,
        z = v.z;
      let shade = 1,
        warm = 0,
        blue = 0;
      // jaw taper & chin
      if (y < -0.25) {
        const t = (-y - 0.25) / 0.75;
        x *= lerp(1, jawW, Math.pow(t, 1.3));
        if (z < 0) z *= lerp(1, 1.05, t);
      }
      if (y < -0.55 && z < -0.4) {
        z -= 0.05 * (mutant ? 1.6 : 1);
      }
      // back of skull fuller, temples flatter
      if (z > 0) {
        z *= 1.07;
        y += z > 0.5 && y > 0 ? 0.03 : 0;
      }
      if (Math.abs(x) > 0.75 && y > -0.2 && y < 0.5) x *= 0.955;
      const f = sm(0.15, 0.7, -z); // front-facing weight
      if (f > 0) {
        // brow ridge
        const bw =
          Math.exp(-Math.pow((y - 0.29) / 0.085, 2)) *
          sm(0.8, 0.3, Math.abs(x));
        z -= (0.085 * browK + (mutant ? 0.1 : 0)) * bw * f;
        shade -=
          0.2 *
          Math.exp(-Math.pow((y - 0.19) / 0.055, 2)) *
          sm(0.7, 0.3, Math.abs(x)) *
          f; // shadow under the brow
        for (const sg of [-1, 1]) {
          // eye sockets
          const e = gau(x - sg * 0.36, y - 0.12, mutant ? 0.012 : 0.02);
          z += (mutant ? 0.14 : 0.13) * e * f;
          shade -= 0.46 * e * f;
          // cheekbones
          const cb = gau(x - sg * 0.52, y + 0.06, 0.03);
          z -= (maniac ? 0.02 : 0.05) * cb * f;
          x += sg * 0.035 * cb;
          warm += mutant ? 0 : cb * (female ? 0.7 : 0.35);
          // cheek hollows (gaunt on Maniacs)
          const hc = gau(x - sg * 0.48, y + 0.32, 0.03);
          z += (maniac ? 0.06 : 0.025) * hc * f;
          shade -= (maniac ? 0.14 : 0.06) * hc * f;
          // nasolabial folds
          const nd = segD(x, y, sg * 0.16, -0.2, sg * 0.31, -0.47);
          const nf = Math.exp(-Math.pow(nd / 0.035, 2)) * f;
          z += 0.022 * nf;
          shade -= 0.14 * nf * (face.age > 0.4 ? 1.4 : 1);
        }
        // nose bridge
        const nb =
          Math.exp(-(x * x) / 0.011) * sm(0.3, 0.12, y) * sm(-0.3, -0.08, y);
        z -= 0.13 * nb * f;
        shade += 0.06 * nb * f; // lit nose bridge
        // lips / muzzle
        const mo = gau(x * 0.8, y + 0.43, 0.03);
        z -= 0.05 * mo * f;
        warm += mutant ? 0 : mo * 0.6;
        shade -=
          0.22 *
          Math.exp(-Math.pow((y + 0.43) / 0.03, 2)) *
          sm(0.35, 0.2, Math.abs(x)) *
          f; // mouth line
        shade -= 0.08 * gau(x, y + 0.27, 0.004) * f; // under the nose
        // chin
        const cn = gau(x * (female ? 1.3 : 1), y + 0.72, 0.03);
        z -= (female ? 0.04 : 0.07) * cn * f;
        if (!female) x *= 1 + 0.08 * cn;
        shade -= 0.1 * gau(x, y + 0.58, 0.02) * f; // chin crease
        if (stubble && y < -0.28 && Math.abs(x) < 0.85)
          blue += 0.55 * sm(-0.28, -0.45, y);
      }
      // jaw angle: squarer on men
      if (y < -0.3 && y > -0.85 && Math.abs(x) > 0.4 && z > -0.6)
        x *= 1 + (female ? 0.02 : 0.08) * sm(-0.3, -0.6, y);
      if (mutant) {
        // lumpy cranium, heavy underbite, wide jaw
        if (y > 0.1) {
          const nn = L.noise3(x * 2.6 + 1.3, y * 2.6, z * 2.6) - 0.5;
          x *= 1 + nn * 0.12;
          y *= 1 + nn * 0.08;
          z *= 1 + nn * 0.12;
        }
        if (y < -0.4) {
          const k = sm(-0.4, -0.8, y);
          if (z < 0.2) z -= 0.11 * k;
          x *= 1 + 0.12 * k;
        }
      }
      // under-jaw & back-of-neck occlusion
      if (y < -0.62) shade -= 0.18 * sm(-0.62, -0.95, y);
      shade = clamp(shade, 0.38, 1.08);
      vt[i * 3] = shade * (1 + warm * 0.07 - blue * 0.1);
      vt[i * 3 + 1] = shade * (1 - warm * 0.03 - blue * 0.08);
      vt[i * 3 + 2] = shade * (1 - warm * 0.04 - blue * 0.02);
      v.set(C[0] + x * RX, C[1] + y * RY, C[2] + z * RZ);
    });
    R.add("head", g, Object.assign({}, skin, { vtint: vt }));
    const at = (x, y, z) => [C[0] + x * RX, C[1] + y * RY, C[2] + z * RZ];
    // eyes: white, iris, pupil, upper & lower lids
    const eyeWhite = maniac ? 0xe2b4a8 : mutant ? 0xd8c890 : 0xe8e2d8; // Maniacs: bloodshot
    const iris = face.eyeColor || 0x3a2a1a;
    const es = mutant ? 0.72 : 1.1;
    for (const sg of [-1, 1]) {
      const e = at(sg * 0.36, 0.13, -0.8);
      R.add(
        "head",
        P.xf(
          P.sphere(0.0158 * hs * es, 0.0145 * hs * es, 0.012 * hs * es, 10, 8),
          e[0],
          e[1],
          e[2],
        ),
        { color: eyeWhite, rough: 0.2, noise: 0.02, grad: [1, 1] },
      );
      R.add(
        "head",
        P.xf(
          P.sphere(0.0088 * hs * es, 0.0088 * hs * es, 0.0035 * hs, 10, 6),
          e[0],
          e[1],
          e[2] - 0.0108 * hs * es,
        ),
        { color: iris, rough: 0.15, noise: 0, grad: [1, 1] },
      );
      R.add(
        "head",
        P.xf(
          P.sphere(0.0042 * hs * es, 0.0042 * hs * es, 0.0015 * hs, 8, 4),
          e[0],
          e[1],
          e[2] - 0.0128 * hs * es,
        ),
        { color: 0x050403, rough: 0.05, noise: 0, grad: [1, 1] },
      );
      // upper lid (heavier & lower for mutants/angry)
      const lid = P.sphere(
        0.0172 * hs * es,
        0.0165 * hs * es,
        0.0138 * hs * es,
        10,
        6,
        0,
        PI * 2,
        0,
        PI * (face.angry || mutant ? 0.47 : 0.4),
      );
      P.xf(
        lid,
        e[0],
        e[1] + 0.0015 * hs,
        e[2] + 0.0005,
        -0.35,
        0,
        sg * (face.angry || mutant ? -0.18 : 0),
      );
      R.add("head", lid, skin);
      const llid = P.sphere(
        0.0168 * hs * es,
        0.016 * hs * es,
        0.0135 * hs * es,
        10,
        4,
        0,
        PI * 2,
        PI * 0.72,
        PI * 0.28,
      );
      P.xf(llid, e[0], e[1] - 0.001 * hs, e[2] + 0.0005, 0.2, 0, 0);
      R.add("head", llid, skin);
      // brows (thick for brutes)
      if (!maniac || face.brows !== false) {
        R.add(
          "head",
          P.xf(
            P.box(
              0.036 * hs,
              0.0095 * hs * (mutant ? 1.5 : 1),
              0.013 * hs,
              0.0035 * hs,
            ),
            e[0] + sg * 0.002,
            e[1] + 0.022 * hs,
            e[2] - 0.006 * hs,
            0.2,
            0,
            sg * -0.12 + (face.angry ? sg * 0.28 : 0),
          ),
          {
            color: L.shade(face.hairColor || 0x3a2616, 0.6),
            region: "fur",
            rough: 0.95,
            keepDark: true,
          },
        );
      }
    }
    // nose
    {
      const ns = face.noseSize || 1;
      // bridge wedge → rounded tip → flared wings with dark nostrils
      const n = P.sphere(
        0.0105 * hs * ns,
        0.026 * hs * ns,
        0.013 * hs * ns,
        9,
        7,
      );
      P.deform(n, (q) => {
        if (q.y < 0) {
          const k = 1 + 0.5 * (-q.y / (0.026 * hs * ns));
          q.x *= k;
          q.z *= 1 + 0.25 * (-q.y / (0.026 * hs * ns));
        }
      });
      const np = at(0, -0.1, -0.95);
      P.xf(n, np[0], np[1] + 0.002 * hs, np[2] - 0.004 * hs, -0.34, 0, 0);
      R.add("head", n, skin);
      R.add(
        "head",
        P.xf(
          P.sphere(0.0085 * hs * ns, 0.0078 * hs * ns, 0.0082 * hs * ns, 8, 6),
          np[0],
          np[1] - 0.013 * hs * ns,
          np[2] - 0.011 * hs * ns,
        ),
        skin,
      ); // tip
      for (const sg of [-1, 1]) {
        R.add(
          "head",
          P.xf(
            P.sphere(0.0078 * hs, 0.0068 * hs, 0.008 * hs, 7, 5),
            np[0] + sg * 0.0105 * hs * ns,
            np[1] - 0.016 * hs,
            np[2] + 0.0005 * hs,
          ),
          skin,
        );
        R.add(
          "head",
          P.xf(
            P.sphere(0.0034 * hs, 0.0022 * hs, 0.0032 * hs, 6, 4),
            np[0] + sg * 0.0055 * hs * ns,
            np[1] - 0.0205 * hs,
            np[2] - 0.005 * hs,
          ),
          { color: 0x1a0c08, rough: 1, noise: 0 },
        );
      }
    }
    // mouth & jaw (lower lip + teeth on jaw bone for talking / screaming)
    const lip =
      face.lipColor ||
      (maniac
        ? L.mix(skinCol, 0x7a4a44, 0.45)
        : L.mix(
            skinCol,
            face.gender === "f" ? 0x9a3a3c : 0x8a4a42,
            face.gender === "f" ? 0.6 : 0.38,
          ));
    const mp = at(0, -0.42, -0.94);
    {
      R.add(
        "head",
        P.xf(
          P.sphere(0.019 * hs, 0.0045 * hs, 0.007 * hs, 10, 6),
          mp[0],
          mp[1] + 0.0045 * hs,
          mp[2] + 0.001 * hs,
        ),
        { color: lip, rough: 0.5, noise: 0.05 },
      );
      R.add(
        "head",
        P.xf(
          P.box(0.03 * hs, 0.0014 * hs, 0.003 * hs, 0.0006),
          mp[0],
          mp[1],
          mp[2] - 0.0005,
        ),
        { color: 0x4a2a22, rough: 1, noise: 0 },
      );
    }
    // jaw bone: lower lip / lower teeth
    const jb = R.world("jaw"),
      hb = R.world("head");
    const jo = [
      mp[0] - (jb[0] - hb[0]),
      mp[1] - (jb[1] - hb[1]),
      mp[2] - (jb[2] - hb[2]),
    ];
    {
      R.add(
        "jaw",
        P.xf(
          P.sphere(0.02 * hs, 0.0062 * hs, 0.009 * hs, 10, 6),
          jo[0],
          jo[1] - 0.006 * hs,
          jo[2] + 0.001,
        ),
        { color: lip, rough: 0.5, noise: 0.05 },
      );
      if (face.mutant) {
        // brute underbite: a row of crooked, heavy lower teeth
        const tooth = {
          color: 0xcfc08a,
          rough: 0.45,
          noise: 0.25,
          grad: [0.7, 1.1],
        };
        for (let i = -2; i <= 2; i++)
          R.add(
            "jaw",
            P.xf(
              P.box(0.007 * hs, 0.009 * hs, 0.005 * hs, 0.0015 * hs),
              jo[0] + i * 0.0075 * hs,
              jo[1] - 0.001 * hs,
              jo[2] - 0.002 * hs + Math.abs(i) * 0.002 * hs,
              0,
              0,
              (i % 2) * 0.15,
            ),
            tooth,
          );
      }
    }
    // ears
    for (const sg of [-1, 1]) {
      const e = at(sg * 0.98, 0.0, 0.05);
      const ear = P.sphere(
        0.009 * hs,
        0.029 * hs * (face.mutant ? 0.8 : 1),
        0.019 * hs,
        8,
        7,
      );
      P.xf(ear, e[0] + sg * 0.003 * hs, e[1], e[2], 0, sg * 0.35, 0);
      R.add("head", ear, skin);
    }
    // hair / beard
    const hc = face.hairColor || 0x3a2616;
    if (face.hair && face.hair !== "none" && face.hair !== "bald")
      H.hair(R, b, face.hair, hc, C, RX, RY, RZ, face);
    if (face.beard) H.beard(R, b, face.beard, hc, C, RX, RY, RZ);
    return { C, RX, RY, RZ };
  };

  /**
   * Maniac skin (vertex paint) over an ordinary skin tone: ground-in dirt and
   * soot smudges, scabbed scratches and, on some, an old healed burn patch
   * (glossy pink-brown with a darker rim). Nothing mutant: just people who
   * stopped washing, eating and sleeping a long time ago.
   */
