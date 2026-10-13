// play-inline-457 22 — add
// Lines 5345-5980 of readable/play-inline-457.pretty.js (statement-aligned).
  H.exoRig = function (R, b, rng, o) {
    const mk2 = o.variant === "mk2" || o.variant === 1 || o.variant === "1";
    const base = mk2 ? 0x8c8f8c : 0x4c5054,
      trim = mk2 ? 0x5a5d5c : 0x2e3032,
      heraldry = PAL.covRed;
    const s = b.s;
    const armor = (c, extra) =>
      metalM(
        c,
        Object.assign(
          {
            metal: 0.65,
            rough: mk2 ? 0.38 : 0.52,
            noise: 0.15,
            region: "metal",
            rigid: true,
          },
          extra || {},
        ),
      );
    const A = armor(base),
      T = armor(trim),
      RED = armor(heraldry, { metal: 0.3, rough: 0.6 }),
      CH = armor(0xc0c2c0, { metal: 0.9, rough: 0.22 });
    const rub = { color: 0x24221e, region: "rubber", rough: 0.85 };
    const rings = H.torsoRings(b);
    const rivets = (bone, pts, r) => {
      for (const p of pts)
        R.add(
          bone,
          P.xf(
            P.sphere(r, r, r * 0.6, 5, 3),
            p[0],
            p[1],
            p[2],
            0,
            p[3] || 0,
            0,
          ),
          T,
        );
    };
    /** hydraulic piston: housing cylinder + chrome rod between two points (bone-local) */
    const piston = (bone, a, c, r) => {
      const ax = c[0] - a[0],
        ay = c[1] - a[1],
        az = c[2] - a[2],
        len = Math.hypot(ax, ay, az);
      const g1 = P.cyl(r, r, len * 0.55, 8),
        g2 = P.cyl(r * 0.45, r * 0.45, len * 0.5, 6);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(ax / len, ay / len, az / len),
      );
      g1.translate(0, len * 0.275, 0);
      g1.applyQuaternion(q);
      g1.translate(a[0], a[1], a[2]);
      g2.translate(0, len * 0.75, 0);
      g2.applyQuaternion(q);
      g2.translate(a[0], a[1], a[2]);
      R.add(bone, g1, T);
      R.add(bone, g2, CH);
    };
    // --- undersuit & torso plates ---
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis, 1.42, 1.45), {
        seg: 16,
        capBottom: true,
      }),
      rub,
    );
    for (const sg of [-1, 1])
      R.add(
        "hips",
        P.xf(
          P.box(0.16 * s, 0.2 * s, 0.05 * s, 0.015 * s),
          sg * 0.13 * s,
          -0.08 * s,
          -rings.pelvis[2].rz * 1.4,
          0.08,
          sg * 0.25,
          0,
        ),
        A,
      ); // tassets
    R.add(
      "hips",
      P.xf(
        P.box(0.14 * s, 0.14 * s, 0.05 * s, 0.015 * s),
        0,
        -0.05 * s,
        -rings.pelvis[2].rz * 1.5,
      ),
      T,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.45, 1.45), { seg: 16 }),
      rub,
    );
    for (let i = 0; i < 3; i++)
      R.add(
        "spine",
        P.loft(
          scaleRings(
            [
              {
                y: 0.015 * s + i * 0.068 * s,
                rx: rings.abdomen[1].rx,
                rz: rings.abdomen[1].rz,
                n: 2.6,
              },
              {
                y: 0.07 * s + i * 0.068 * s,
                rx: rings.abdomen[1].rx * 1.04,
                rz: rings.abdomen[1].rz * 1.04,
                n: 2.6,
              },
            ],
            1.6,
            1.62,
          ),
          { seg: 16, a0: -PI * 0.5, a1: PI * 0.5 },
        ),
        i % 2 ? T : A,
      ); // lames
    // breastplate: a faceted keel (ridge down the middle), layered upper plate
    const chestR = scaleRings(rings.chest.slice(0, 5), 1.72, 1.78, 0.01 * s);
    const bp = P.loft(chestR, { seg: 20, capTop: true });
    P.deform(bp, (v) => {
      if (v.z < 0) v.z -= 0.03 * s * Math.exp(-Math.pow(v.x / (0.05 * s), 2));
    }); // keel
    R.add("chest", bp, A);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(2, 5), 1.84, 1.9, 0.012 * s), {
        seg: 18,
        a0: -PI * 0.42,
        a1: PI * 0.42,
      }),
      mk2 ? A : T,
    ); // upper plate
    rivets(
      "chest",
      [-0.16, -0.08, 0.08, 0.16].map((x) => [
        x * s,
        0.205 * s,
        -chestR[3].rz - 0.005 * s,
      ]),
      0.008 * s,
    );
    R.decal(
      "chest",
      "covenant",
      0.1 * s,
      0.1 * s,
      -0.11 * s,
      0.11 * s,
      -chestR[2].rz - 0.012 * s,
      0.05,
      -0.32,
      0,
    );
    // gorget: stacked collar rings the helm sits in
    for (let i = 0; i < 2; i++)
      R.add(
        "chest",
        P.xf(
          P.torus(0.12 * s - i * 0.012 * s, 0.03 * s, 6, 18),
          0,
          0.25 * s + i * 0.035 * s,
          0.01 * s,
          PI / 2,
          0,
          0,
        ),
        i ? A : T,
      );
    // back frame: A-frame tubes + rig battery box, cable runs, a heraldic banner plate
    const bz = chestR[2].rz + 0.06 * s;
    R.add(
      "chest",
      P.xf(
        P.box(0.32 * s, 0.34 * s, 0.16 * s, 0.03 * s),
        0,
        0.08 * s,
        bz + 0.04 * s,
      ),
      T,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.2 * s, 0.12 * s, 0.02 * s, 0.01 * s),
        0,
        0.12 * s,
        bz + 0.125 * s,
      ),
      RED,
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.035 * s, 0.035 * s, 0.02 * s, 12),
        0.1 * s,
        -0.04 * s,
        bz + 0.125 * s,
        PI / 2,
        0,
        0,
      ),
      {
        color: mk2 ? 0xd8f0ff : 0xffb040,
        emis: 1.6,
        rough: 0.2,
        noise: 0,
        keepLod: true,
      },
    );
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.cyl(0.018 * s, 0.018 * s, 0.6 * s, 8),
          sg * 0.19 * s,
          0.1 * s,
          bz + 0.06 * s,
          0,
          0,
          sg * 0.12,
        ),
        CH,
      ); // frame rails
      R.add(
        "chest",
        P.sweep(
          [
            [sg * 0.12 * s, 0.2 * s, bz + 0.12 * s],
            [sg * 0.2 * s, 0.05 * s, bz + 0.1 * s],
            [sg * 0.17 * s, -0.12 * s, bz],
          ],
          0.012 * s,
          { seg: 8, rs: 5 },
        ),
        rub,
      ); // cables
    }
    // --- arms ---
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      // layered pauldron: three overlapping lames + a rim
      for (let i = 0; i < 3; i++) {
        const pl = P.sphere(
          (0.17 - i * 0.012) * s,
          0.12 * s,
          (0.17 - i * 0.012) * s,
          14,
          8,
          0,
          PI * 2,
          0,
          PI * 0.55,
        );
        R.add(
          "arm" + S,
          P.xf(
            pl,
            sg * 0.03 * s,
            (0.05 - i * 0.05) * s,
            0,
            0,
            0,
            sg * -0.3 - sg * i * 0.12,
          ),
          i === 0 ? A : i === 1 ? T : A,
        );
      }
      if (S === "R")
        R.decal(
          "arm" + S,
          "covenant",
          0.09 * s,
          0.09 * s,
          sg * 0.185 * s,
          0.01 * s,
          0,
          0,
          (sg * -PI) / 2,
          0,
        );
      else
        R.add(
          "arm" + S,
          P.xf(
            P.box(0.02 * s, 0.1 * s, 0.14 * s, 0.006 * s),
            sg * 0.18 * s,
            -0.01 * s,
            0,
            0,
            0,
            sg * 0.3,
          ),
          RED,
        );
      R.add("arm" + S, P.limb(b.upper, 0.082 * s, 0.075 * s, { seg: 10 }), rub);
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.15 * s, b.upper * 0.5, 0.15 * s, 0.03 * s),
          0,
          -b.upper * 0.55,
          0,
        ),
        A,
      );
      piston(
        "arm" + S,
        [0, -b.upper * 0.35, 0.085 * s],
        [0, -b.upper - 0.07 * s, 0.07 * s],
        0.016 * s,
      ); // elbow piston (behind)
      R.add(
        "forearm" + S,
        P.limb(b.fore, 0.075 * s, 0.064 * s, { seg: 10 }),
        rub,
      );
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.07 * s, 0.07 * s, 0.13 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        T,
      ); // hinge drum
      const vb = P.box(0.15 * s, b.fore * 0.72, 0.15 * s, 0.035 * s);
      P.deform(vb, (v) => {
        if (v.y < 0) {
          v.x *= 0.92;
          v.z *= 0.92;
        }
      });
      R.add("forearm" + S, P.xf(vb, 0, -b.fore * 0.52, 0), A);
      rivets(
        "forearm" + S,
        [
          [sg * 0.077 * s, -b.fore * 0.3, 0, PI / 2],
          [sg * 0.077 * s, -b.fore * 0.7, 0, PI / 2],
        ],
        0.008 * s,
      );
      R.add(
        "hand" + S,
        P.xf(P.box(0.06 * s, 0.1 * s, 0.1 * s, 0.02 * s), 0, -0.05 * s, 0),
        T,
      );
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.05 * s, 0.07 * s, 0.095 * s, 0.018 * s),
          -sg * 0.015 * s,
          -0.12 * s,
          0,
          0,
          0,
          -sg * 0.5,
        ),
        A,
      );
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.035 * s, 0.06 * s, 0.035 * s, 0.01 * s),
          -sg * 0.03 * s,
          -0.05 * s,
          -0.06 * s,
        ),
        A,
      );
      // legs: thigh plate, exposed knee hinge + twin pistons, greave, sabaton
      R.add("thigh" + S, P.limb(b.thigh, 0.118 * s, 0.1 * s, { seg: 12 }), rub);
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.22 * s, b.thigh * 0.62, 0.22 * s, 0.05 * s),
          0,
          -b.thigh * 0.38,
          -0.01 * s,
        ),
        A,
      );
      R.add(
        "shin" + S,
        P.xf(P.cyl(0.085 * s, 0.085 * s, 0.2 * s, 12), 0, 0.0, 0, 0, 0, PI / 2),
        T,
      ); // knee hinge drum
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.13 * s, 0.11 * s, 0.05 * s, 0.02 * s),
          0,
          0.0,
          -0.09 * s,
          -0.15,
          0,
          0,
        ),
        mk2 ? A : RED,
      ); // knee cop
      for (const px of [-1, 1])
        piston(
          "thigh" + S,
          [px * 0.1 * s, -b.thigh * 0.3, 0.05 * s],
          [px * 0.1 * s, -b.thigh - 0.12 * s, 0.035 * s],
          0.014 * s,
        );
      R.add("shin" + S, P.limb(b.shin, 0.098 * s, 0.088 * s, { seg: 10 }), rub);
      const gr = P.box(0.2 * s, b.shin * 0.72, 0.21 * s, 0.05 * s);
      P.deform(gr, (v) => {
        if (v.y < 0) {
          v.x *= 1.06;
          v.z *= 1.06;
        }
      });
      R.add("shin" + S, P.xf(gr, 0, -b.shin * 0.56, -0.005 * s), A);
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.19 * s, b.ankle + 0.07 * s, 0.34 * s, 0.045 * s),
          0,
          -b.ankle / 2 + 0.025 * s,
          -0.07 * s,
        ),
        T,
      );
      for (let i = 0; i < 2; i++)
        R.add(
          "foot" + S,
          P.xf(
            P.box(0.18 * s, 0.04 * s, 0.1 * s, 0.015 * s),
            0,
            -b.ankle / 2 + 0.06 * s - i * 0.03 * s,
            -0.2 * s + i * 0.06 * s,
          ),
          A,
        ); // sabaton lames
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.2 * s, 0.03 * s, 0.35 * s, 0.01 * s),
          0,
          -b.ankle + 0.015 * s,
          -0.07 * s,
        ),
        rub,
      );
    }
    // --- helm: rounded war-helm, a single narrow visor slit, perforated face plate ---
    const hs = b.headS,
      C = [0, 0.1 * hs, 0];
    const ring = (y, rx, rz, n, oz) => ({
      y: C[1] + y * hs,
      rx: rx * hs,
      rz: rz * hs,
      oz: C[2] + (oz || 0) * hs,
      n,
    });
    const helm = mk2
      ? [
          ring(-0.15, 0.1, 0.11, 2.3, 0.01),
          ring(-0.11, 0.122, 0.14, 2.4),
          ring(-0.02, 0.13, 0.152, 2.5, -0.01),
          ring(0.07, 0.128, 0.148, 2.4, -0.005),
          ring(0.14, 0.108, 0.125, 2.2),
          ring(0.185, 0.065, 0.075, 2.1),
          ring(0.2, 0.01, 0.01, 2),
        ]
      : [
          ring(-0.15, 0.105, 0.115, 2.2, 0.01),
          ring(-0.11, 0.128, 0.142, 2.3),
          ring(-0.02, 0.136, 0.152, 2.3, -0.008),
          ring(0.07, 0.132, 0.146, 2.3),
          ring(0.14, 0.11, 0.122, 2.1),
          ring(0.18, 0.07, 0.08, 2.0),
          ring(0.195, 0.01, 0.01, 2),
        ];
    const hg = P.loft(helm, { seg: 24 });
    P.deform(hg, (v) => {
      if (v.z < C[2] - 0.06 * hs && v.y < C[1] + 0.05 * hs)
        v.z -= 0.025 * hs * Math.exp(-Math.pow(v.x / (0.05 * hs), 2));
    }); // face keel (no snout: a shallow prow)
    R.add("head", hg, A);
    // the slit: a recessed dark band across the face with a thin glowing line
    const slitY = C[1] + 0.035 * hs;
    const band = P.box(0.21 * hs, 0.03 * hs, 0.05 * hs, 0.008 * hs);
    P.deform(band, (v) => {
      v.z += ((v.x * v.x) / (0.11 * hs)) * 1.1;
    });
    R.add("head", P.xf(band, C[0], slitY, C[2] - 0.135 * hs), T);
    const slit = P.box(0.18 * hs, 0.009 * hs, 0.02 * hs, 0.003 * hs);
    P.deform(slit, (v) => {
      v.z += ((v.x * v.x) / (0.11 * hs)) * 1.1;
    });
    const glowC = mk2 ? 0xd8eeff : 0xffa030;
    R.add("head", P.xf(slit, C[0], slitY, C[2] - 0.157 * hs), {
      color: glowC,
      emis: 2.4,
      rough: 0.08,
      noise: 0.03,
      keepLod: true,
    });
    if (mk2) {
      // second (brow) visor bar + raised crest
      const s2 = P.box(0.12 * hs, 0.006 * hs, 0.02 * hs, 0.002 * hs);
      P.deform(s2, (v) => {
        v.z += ((v.x * v.x) / (0.1 * hs)) * 1.1;
      });
      R.add(
        "head",
        P.xf(
          P.box(0.14 * hs, 0.02 * hs, 0.04 * hs, 0.006 * hs),
          C[0],
          slitY + 0.04 * hs,
          C[2] - 0.135 * hs,
        ),
        T,
      );
      R.add("head", P.xf(s2, C[0], slitY + 0.04 * hs, C[2] - 0.153 * hs), {
        color: glowC,
        emis: 2.0,
        rough: 0.08,
        noise: 0.03,
        keepLod: true,
      });
      const crest = P.extrude(
        [
          [-0.12, 0],
          [0.13, 0],
          [0.12, 0.035],
          [0.02, 0.05],
          [-0.1, 0.03],
        ].map((q) => [q[0] * hs, q[1] * hs]),
        0.014 * hs,
        0.003 * hs,
      );
      crest.rotateY(PI / 2);
      R.add("head", P.xf(crest, C[0], C[1] + 0.175 * hs, C[2] + 0.0), RED);
    } else {
      R.add(
        "head",
        P.sweep(
          [
            [0, C[1] + 0.12 * hs, C[2] - 0.14 * hs],
            [0, C[1] + 0.2 * hs, C[2] - 0.03 * hs],
            [0, C[1] + 0.18 * hs, C[2] + 0.1 * hs],
            [0, C[1] + 0.08 * hs, C[2] + 0.16 * hs],
          ],
          0.012 * hs,
          { seg: 14, rs: 4 },
        ),
        T,
      );
    }
    // breathing perforations: two short columns of small holes below the slit (flush, no grille box)
    for (const sg of [-1, 1])
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 2; j++)
          R.add(
            "head",
            P.xf(
              P.cyl(0.0045 * hs, 0.0045 * hs, 0.004 * hs, 6),
              C[0] + sg * (0.03 + j * 0.016) * hs,
              C[1] - (0.03 + i * 0.022) * hs,
              C[2] - 0.158 * hs + j * 0.004 * hs + i * 0.003 * hs,
              PI / 2 - 0.2,
              0,
              0,
            ),
            { color: 0x0c0c0c, rough: 1, noise: 0 },
          );
    // cheek guards & aventail lames at the back of the neck
    for (const sg of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.box(0.02 * hs, 0.1 * hs, 0.12 * hs, 0.008 * hs),
          C[0] + sg * 0.128 * hs,
          C[1] - 0.06 * hs,
          C[2] - 0.035 * hs,
          0,
          0,
          sg * 0.1,
        ),
        T,
      );
    for (let i = 0; i < 3; i++)
      R.add(
        "head",
        P.xf(
          P.shell(
            (0.14 - i * 0.006) * hs,
            0.03 * hs,
            (0.15 - i * 0.006) * hs,
            14,
            3,
            PI * 1.1,
          ),
          C[0],
          C[1] - (0.13 + i * 0.03) * hs,
          C[2] + 0.01 * hs,
          0,
          PI,
          0,
        ),
        i % 2 ? A : T,
      );
    rivets(
      "head",
      [
        [-0.13, -0.0],
        [0.13, -0.0],
        [-0.12, 0.09],
        [0.12, 0.09],
      ].map((p) => [
        C[0] + p[0] * hs,
        C[1] + p[1] * hs,
        C[2] - 0.04 * hs,
        p[0] < 0 ? -0.6 : 0.6,
      ]),
      0.007 * hs,
    );
  };

  /**
   * The Continuity's field rig: a GREY service uniform with light armour
   * over it — grey steel breastplate and shoulder boards, a lightweight leg
   * frame, and a grey steel helmet with a full-face respirator (two round
   * lenses, a centre filter). Insignia: the capitol dome in a circle.
   */
