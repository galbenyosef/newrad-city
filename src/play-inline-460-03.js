// play-inline-460 03 — colossus
// Lines 299-739 of readable/play-inline-460.pretty.js (statement-aligned).
  function buildBrute(opts, seed, colossus) {
    const rng = L.rng(seed);
    const sc = colossus ? 2.45 : rng.range(1.26, 1.34);
    const b = H.proportions("m", {
      scale: sc,
      muscle: colossus ? 1.55 : 1.3,
      shoulderMul: colossus ? 1.55 : 1.48,
      headMul: colossus ? 0.72 : 0.8,
      hipMul: 1.05,
    });
    b.torsoW *= 1.55;
    b.torsoD *= colossus ? 1.45 : 1.3;
    // short thick legs, long heavy forearms, small low head, almost no neck
    b.upper *= colossus ? 1.18 : 1.1;
    b.fore *= colossus ? 1.42 : 1.32;
    b.neckY *= colossus ? 0.8 : 0.6;
    b.chest *= 1.12;
    b.thigh *= colossus ? 0.82 : 0.86;
    b.shin *= colossus ? 0.78 : 0.82;
    b.hipH = b.ankle + b.shin + b.thigh + b.hipDrop;
    b.legLen = b.ankle + b.shin + b.thigh;
    b.height = b.hipH + b.spine + b.chest + b.neckY + b.headY + 0.225 * b.headS;
    const R = new L.Rig("biped");
    H.skeleton(R, b, {
      neckZ: (colossus ? -0.15 : -0.11) * b.s,
      headZ: (colossus ? -0.05 : -0.04) * b.s,
    });
    const s = b.s;
    const skin = colossus
      ? 0x544a5e
      : rng.pick([0x6c5f78, 0x635870, 0x76667e, 0x5f566a]);
    const bp = brutePaint(colossus);
    const sm = skinMat(skin, { paint: bp, rough: 0.6 });
    const variant =
      opts.variant !== undefined ? Number(opts.variant) || 0 : rng.int(0, 2);
    const bone = boneMat();
    const wrap = rng.pick([0x3a3026, 0x2e2c28, 0x4a3a28]);
    const look = {
      skin,
      topMat: sm,
      abdomenMat: sm,
      bottomMat: M.leather(wrap, { region: "leather" }),
      sleeve: "none",
      boot: skin,
      bootMat: sm,
      bootH: 0,
      laces: false,
    };
    H.torso(R, b, look);
    H.neck(R, b, sm, 2.1);
    // asymmetric arms: the right one is grossly overgrown
    H.arm(R, b, "L", {
      sleeve: "none",
      skin,
      skinPaint: bp,
      glove: null,
      mul: 1.0,
    });
    H.arm(R, b, "R", {
      sleeve: "none",
      skin,
      skinPaint: bp,
      glove: null,
      mul: 1.32,
    });
    for (const S of ["L", "R"])
      H.leg(R, b, S, {
        pantsMat: M.cloth(wrap, { region: "rags" }),
        boot: skin,
        bootMat: sm,
        bootH: 0.02,
        laces: false,
        skin,
        barefoot: true,
        mul: 1.18,
      });
    // massive shoulder yoke (wide, tapering into the narrow waist), pecs, lats
    const tk = colossus ? 1.0 : 1.12;
    R.add(
      "chest",
      P.xf(
        P.sphere(0.27 * s * tk, 0.1 * s * tk, 0.15 * s * tk, 16, 9),
        0,
        0.22 * s,
        0.02 * s,
      ),
      sm,
    );
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.sphere(0.11 * s, 0.085 * s, 0.065 * s, 10, 7),
          sg * 0.085 * s,
          0.12 * s,
          -b.torsoD * 0.92,
        ),
        sm,
      );
      R.add(
        "chest",
        P.xf(
          P.sphere(0.075 * s, 0.17 * s, 0.11 * s, 9, 7),
          sg * b.torsoW * 0.98,
          0.04 * s,
          0.02 * s,
          0,
          0,
          sg * 0.28,
        ),
        sm,
      );
      R.add(
        "arm" + (sg < 0 ? "L" : "R"),
        P.xf(
          P.sphere(
            0.085 * s * (sg > 0 ? 1.3 : 1),
            0.08 * s,
            0.085 * s * (sg > 0 ? 1.3 : 1),
            10,
            8,
          ),
          0,
          -0.02 * s,
          0,
        ),
        sm,
      ); // deltoid knot
    }
    // ---- bone plates through the skin ----
    // shoulders: layered plates (bigger on the overgrown right side)
    for (const [S, sg, k] of [
      ["L", -1, 1],
      ["R", 1, 1.35],
    ]) {
      for (let i = 0; i < 3; i++)
        bonePlate(
          R,
          "arm" + S,
          sg * 0.04 * s * k,
          (0.06 - i * 0.06) * s * k,
          0,
          0.12 * s * k * (1 - i * 0.12),
          0.085 * s * k,
          0.04 * s * k,
          [0.25, (sg * PI) / 2, 0],
          bone,
        );
      // forearm crest: overlapping plates down the outside of the forearm
      const fx = sg * 0.05 * s * k;
      for (let i = 0; i < 4; i++)
        bonePlate(
          R,
          "forearm" + S,
          fx,
          -(0.05 + i * b.fore * 0.19),
          0,
          0.055 * s * k,
          0.085 * s * k,
          0.026 * s * k,
          [0.2, (sg * PI) / 2, 0],
          bone,
        );
      // knuckle plates
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.1 * s * k, 0.03 * s, 0.05 * s, 0.012 * s),
          0,
          -0.08 * s * k,
          -0.02 * s,
        ),
        bone,
      );
    }
    // spine ridge: knobbed spurs down the back
    const back = H.torsoRings(b).chest[2].rz;
    spurRow(
      R,
      "chest",
      [
        [0, 0.3 * s, back * 0.8],
        [0, 0.22 * s, back * 1.0],
        [0, 0.13 * s, back * 1.05],
        [0, 0.04 * s, back * 1.02],
      ],
      (colossus ? 0.11 : 0.07) * s,
      (colossus ? 0.04 : 0.025) * s,
      bone,
      true,
    );
    spurRow(
      R,
      "spine",
      [
        [0, 0.1 * s, b.torsoD * 0.95],
        [0, 0.0, b.torsoD * 0.9],
      ],
      0.05 * s,
      0.02 * s,
      bone,
      true,
    );
    // sternum / collar plate breaking through the chest
    bonePlate(
      R,
      "chest",
      0.0,
      0.2 * s,
      -b.torsoD * 1.0,
      0.07 * s,
      0.05 * s,
      0.025 * s,
      [0.3, 0, 0],
      bone,
    );
    // ---- crude scrap armour ----
    const scrap = (c) =>
      M.metal(c, {
        rough: 0.75,
        metal: 0.45,
        region: "metal",
        paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
          if (L.noise3(wx * 10, wy * 10, wz * 10) > 0.62) {
            out[0] = out[0] * 0.5 + 0.2;
            out[1] = out[1] * 0.5 + 0.09;
            out[2] = out[2] * 0.5 + 0.04;
          }
        },
      });
    const strap = M.leather(0x2a1c12);
    const rings = H.torsoRings(b);
    // a car-door / sheet-metal plate strapped across the left chest
    if (variant >= 1 || colossus) {
      const door = P.box(0.32 * s, 0.26 * s, 0.02 * s, 0.03 * s);
      P.deform(door, (v) => {
        v.z += ((v.x * v.x) / (0.4 * s)) * 1.6;
      }); // bent round the chest
      R.add(
        "chest",
        P.xf(door, -0.07 * s, 0.1 * s, -b.torsoD * 1.12, 0.05, 0.12, 0.08),
        scrap(rng.pick([0x5a6a72, 0x7a3a26, 0x6a6458])),
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.12 * s, 0.03 * s, 0.025 * s, 0.01 * s),
          -0.12 * s,
          0.17 * s,
          -b.torsoD * 1.15,
          0.05,
          0.12,
          0.08,
        ),
        M.metal(0xb8b8b0, { rough: 0.3, metal: 0.85 }),
      ); // chrome handle
    }
    H.strap(R, b, 0x2a1c12, [-0.95, 0.2], [0.75, -0.03], 1.8, false);
    H.strap(R, b, 0x2a1c12, [0.95, 0.2], [-0.75, -0.03], 1.4, false);
    if (variant >= 2) {
      H.pauldron(R, b, "L", 0x5a5248, 2, 1.25);
      for (const S of ["L", "R"])
        R.add(
          "shin" + S,
          P.xf(
            P.box(0.13 * s, 0.22 * s, 0.03 * s, 0.01 * s),
            0,
            -0.1 * s,
            -0.08 * s,
          ),
          scrap(0x5a5a50),
        );
      H.signPlate(
        R,
        "spine",
        rng.pick(["stop", "warn", "speed"]),
        0.11 * s,
        0,
        0.02 * s,
        -b.torsoD * 1.15,
        0.1,
        0,
        0,
      );
    }
    // waist: wrapped hide kilt + a heavy chain belt
    for (const z of [-1, 1])
      R.add(
        "hips",
        P.xf(
          P.box(0.26 * s, 0.24 * s, 0.014 * s, 0.004),
          0,
          -0.15 * s,
          z * rings.pelvis[2].rz * 1.04,
          z * 0.1,
          0,
          0,
        ),
        M.leather(wrap, { region: "rags" }),
      );
    const chainM = M.metal(0x4e4a44, { rough: 0.5, metal: 0.8 });
    const pr = rings.pelvis[2];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * PI * 2;
      const g = P.torus(0.022 * s, 0.006 * s, 4, 8);
      g.rotateY(-a + (i % 2 ? PI / 2 : 0));
      R.add(
        "hips",
        P.xf(
          g,
          Math.sin(a) * pr.rx * 1.08,
          0.04 * s,
          -Math.cos(a) * pr.rz * 1.08,
        ),
        chainM,
      );
    }
    // ---- head: small, low, bony crest & cheek plates ----
    const headPaint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      bp(x, y, z, nx, ny, nz, out, wx, wy, wz);
      if (y > 0.13 * b.headS && nz < 0.2) {
        out[0] *= 0.86;
        out[1] *= 0.82;
        out[2] *= 0.9;
      }
    };
    H.head(R, b, {
      skin,
      gender: "m",
      mutant: true,
      brow: 2.8,
      jawW: 1.1,
      hair: "bald",
      eyeColor: 0xa8b8c0,
      noseSize: 1.1,
      lipColor: L.shade(skin, 0.55),
      angry: true,
      skinPaint: headPaint,
    });
    const hs = b.headS;
    // bony crest from the brow ridge back over the skull
    R.add(
      "head",
      P.sweep(
        [
          [0, 0.17 * hs, -0.1 * hs],
          [0, 0.235 * hs, -0.03 * hs],
          [0, 0.24 * hs, 0.05 * hs],
          [0, 0.2 * hs, 0.12 * hs],
        ],
        (u) => (0.022 + 0.01 * Math.sin(u * PI)) * hs * (colossus ? 1.4 : 1),
        { seg: 10, rs: 6 },
      ),
      bone,
    );
    for (const sg of [-1, 1]) {
      bonePlate(
        R,
        "head",
        sg * 0.075 * hs,
        0.1 * hs,
        -0.06 * hs,
        0.035 * hs,
        0.025 * hs,
        0.014 * hs,
        [0, sg * 0.9, 0],
        bone,
      ); // cheek plates
      R.add(
        "head",
        P.sweep(
          [
            [sg * 0.06 * hs, 0.16 * hs, -0.09 * hs],
            [sg * 0.085 * hs, 0.17 * hs, -0.06 * hs],
            [sg * 0.1 * hs, 0.16 * hs, -0.02 * hs],
          ],
          0.012 * hs,
          { seg: 5, rs: 5 },
        ),
        bone,
      ); // brow horns (stubby)
    }
    if (colossus) {
      girderClub(R, "handR", s * 0.62, -0.06 * s, -0.55);
      // shackles & chain stubs on both wrists, bone plate armour down the back
      for (const S of ["L", "R"]) {
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.075 * s, 0.075 * s, 0.07 * s, 12, true),
            0,
            -b.fore + 0.05 * s,
            0,
          ),
          M.metal(0x3a3632, { rough: 0.5, metal: 0.7 }),
        );
        for (let i = 0; i < 4; i++) {
          const g = P.torus(0.03 * s, 0.008 * s, 4, 8);
          g.rotateY(i % 2 ? PI / 2 : 0);
          R.add(
            "forearm" + S,
            P.xf(g, 0, -b.fore + 0.02 * s - i * 0.05 * s, 0.07 * s),
            chainM,
          );
        }
      }
      for (let i = 0; i < 4; i++)
        for (const sg of [-1, 1])
          bonePlate(
            R,
            "chest",
            sg * 0.12 * s,
            (0.26 - i * 0.08) * s,
            back * 0.98,
            0.09 * s,
            0.06 * s,
            0.03 * s,
            [0, PI + sg * 0.5, 0],
            bone,
          );
      H.signPlate(
        R,
        "chest",
        "oneway",
        0.09 * s,
        0.1 * s,
        0.05 * s,
        -b.torsoD * 1.15,
        0.05,
        -0.2,
        0.15,
      );
      for (const S of ["L", "R"])
        bigFoot(R, "foot" + S, b, sm, S === "L" ? -1 : 1);
    }
    const tpl = R.build();
    tpl.meta.bodyThick = 0.16 * s;
    tpl.meta.gore = "violet";
    tpl.meta.weaponScale = colossus ? 2 : 1.3;
    return tpl;
  }
