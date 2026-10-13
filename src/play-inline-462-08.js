// play-inline-462 08 — out
// Lines 1221-1648 of readable/play-inline-462.pretty.js (statement-aligned).
  function buildLurcher(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.95, 1.06);
    const R = new L.Rig("quad");
    const bh = 0.68 * s;
    R.bone("hips", null, 0, bh, 0.3 * s, "torso");
    R.bone("spine", "hips", 0, 0.14 * s, -0.28 * s, "torso");
    R.bone("chest", "spine", 0, 0.2 * s, -0.28 * s, "torso");
    R.bone("neck", "chest", 0, 0.06 * s, -0.2 * s, "head");
    R.bone("head", "neck", 0, -0.06 * s, -0.22 * s, "head");
    R.bone("jaw", "head", 0, -0.03 * s, -0.36 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.2 * s, -0.04 * s, 0.0, part);
      R.bone(
        "lower" + S,
        "upper" + S,
        sg * 0.1 * s,
        -0.42 * s,
        -0.12 * s,
        part,
      ); // elbows bowed out
      R.bone("paw" + S, "lower" + S, -sg * 0.02 * s, -0.47 * s, 0.06 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.13 * s, -0.04 * s, 0.04 * s, part);
      R.bone(
        "lower" + S,
        "upper" + S,
        sg * 0.03 * s,
        -0.3 * s,
        -0.16 * s,
        part,
      );
      R.bone("paw" + S, "lower" + S, 0, -0.28 * s, 0.1 * s, part);
    }
    R.softJoint("spine", 0.08 * s, 0.2 * s, [0, 0.4, -1]);
    R.softJoint("chest", 0.08 * s, 0.22 * s, [0, 0.4, -1]);
    const skinC = rng.pick([0xb8b4ac, 0xa8a49c, 0xc0b8ae]);
    const bruise = L.col(0x5a5260),
      scar = L.col(0xc8a8a0),
      dark = L.col(0x3a3634);
    const ph = rng.range(0, 40);
    const fleshP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3((wx * 6) / s + ph, (wy * 6) / s, (wz * 6) / s),
        n2 = L.noise3((wx * 19) / s, (wy * 19) / s + ph, (wz * 19) / s);
      if (n < 0.34) {
        const k = sm(0.34, 0.24, n) * 0.6;
        out[0] = lerp(out[0], bruise.r, k);
        out[1] = lerp(out[1], bruise.g, k);
        out[2] = lerp(out[2], bruise.b, k);
      } // bruise mottling
      if (n > 0.7) {
        const k = 0.5;
        out[0] = lerp(out[0], scar.r, k);
        out[1] = lerp(out[1], scar.g, k);
        out[2] = lerp(out[2], scar.b, k);
      } // burn scarring
      if (
        Math.abs(Math.sin((wx * 50) / s + Math.sin((wz * 30) / s) * 2)) < 0.05
      ) {
        out[0] *= 0.7;
        out[1] *= 0.68;
        out[2] *= 0.74;
      } // veins
      if (wy < 0.25 * s || n2 > 0.82) {
        const k = wy < 0.25 * s ? 0.6 * (1 - wy / (0.25 * s)) : 0.4;
        out[0] = lerp(out[0], dark.r, k);
        out[1] = lerp(out[1], dark.g, k);
        out[2] = lerp(out[2], dark.b, k);
      } // filthy knuckles & feet
    };
    const fm = {
      color: skinC,
      region: "crackskin",
      rough: 0.45,
      noise: 0.16,
      paint: fleshP,
      grad: [0.8, 1.06],
    };
    // ---- body: deep narrow ribcage high at the front, sloping to a small pelvis ----
    const hw = R.world("hips"),
      sw = R.world("spine"),
      cw = R.world("chest");
    R.addW(
      "hips",
      P.xf(
        P.sphere(0.15 * s, 0.13 * s, 0.17 * s, 12, 9),
        0,
        hw[1] + 0.02 * s,
        hw[2] + 0.02 * s,
      ),
      fm,
    );
    const torso = P.limb(0.62 * s, 0.13 * s, 0.2 * s, {
      seg: 14,
      flat: 1.25,
      bulge: 0.02 * s,
      bulgeAt: 0.7,
    });
    const dir = new THREE.Vector3(
      0,
      cw[1] - hw[1] + 0.06 * s,
      cw[2] - hw[2] - 0.12 * s,
    ).normalize();
    torso.applyQuaternion(
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir,
      ),
    );
    // (split: rear half on the spine bone, front half on the chest bone)
    R.addW("spine", P.xf(torso, 0, hw[1] - 0.01 * s, hw[2] + 0.04 * s), fm);
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.2 * s, 0.24 * s, 0.22 * s, 14, 10),
        0,
        cw[1] - 0.06 * s,
        cw[2] + 0.02 * s,
      ),
      fm,
    );
    // ribs showing through the skin
    for (let i = 0; i < 5; i++)
      for (const sg of [-1, 1]) {
        const z = cw[2] + (0.12 - i * 0.05) * s,
          y = cw[1] - (0.02 + i * 0.03) * s;
        R.addW(
          "chest",
          P.sweep(
            [
              [sg * 0.04 * s, y + 0.18 * s, z],
              [sg * 0.2 * s, y + 0.02 * s, z - 0.01 * s],
              [sg * 0.15 * s, y - 0.17 * s, z - 0.06 * s],
            ],
            0.011 * s,
            { seg: 8, rs: 4 },
          ),
          fm,
        );
      }
    // spine knobs down the sloping back
    for (let i = 0; i < 9; i++) {
      const t = i / 8,
        x = 0,
        y = lerp(cw[1] + 0.22 * s, hw[1] + 0.13 * s, t),
        z = lerp(cw[2] + 0.04 * s, hw[2] + 0.05 * s, t);
      R.addW(
        t < 0.4 ? "chest" : "spine",
        P.xf(P.sphere(0.026 * s, 0.02 * s, 0.03 * s, 7, 5), x, y, z),
        fm,
      );
    }
    // ---- neck & eyeless head: a long ridged skull ending in a round lamprey mouth ----
    const nw = R.world("neck"),
      hdw = R.world("head");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.3 * s, 0.07 * s, 0.09 * s, { seg: 10 }),
        nw[0],
        nw[1] + 0.06 * s,
        nw[2] + 0.1 * s,
        -1.75,
        0,
        0,
      ),
      fm,
    );
    const sk = P.sphere(1, 1, 1, 16, 10);
    P.deform(sk, (v) => {
      const f = sm(0.6, -1, v.z); // 0 at the back → 1 at the front
      const x = v.x * lerp(0.1, 0.075, f),
        y = v.y * lerp(0.1, 0.075, f),
        z = v.z * 0.22;
      v.set(x * s, (y + (v.y > 0.6 ? 0.01 : 0)) * s, z * s - 0.14 * s);
    });
    R.add("head", sk, fm);
    R.add(
      "head",
      P.sweep(
        [
          [0, 0.09 * s, 0.03 * s],
          [0, 0.1 * s, -0.12 * s],
          [0, 0.075 * s, -0.3 * s],
        ],
        0.012 * s,
        { seg: 8, rs: 5 },
      ),
      Object.assign({}, fm, { color: L.shade(skinC, 0.85) }),
    ); // crest ridge
    for (const sg of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.sphere(0.03 * s, 0.012 * s, 0.05 * s, 8, 5),
          sg * 0.07 * s,
          0.04 * s,
          -0.12 * s,
        ),
        Object.assign({}, fm, { color: L.shade(skinC, 0.7) }),
      ); // sealed-over eye pits
    // the round mouth: a fleshy lip ring at the snout tip with hooked teeth around the rim, dark throat
    const lipM = {
      color: 0x8a5a58,
      region: "skin",
      rough: 0.3,
      noise: 0.1,
      grad: [0.8, 1.05],
    };
    const toothM = {
      color: 0xd8ccb0,
      rough: 0.3,
      noise: 0.1,
      grad: [0.7, 1.1],
    };
    R.add(
      "head",
      P.xf(P.torus(0.06 * s, 0.022 * s, 8, 18), 0, -0.01 * s, -0.36 * s),
      lipM,
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.045 * s, 0.03 * s, 0.03 * s, 14),
        0,
        -0.01 * s,
        -0.355 * s,
        PI / 2,
        0,
        0,
      ),
      { color: 0x1a0c0c, rough: 0.6, noise: 0.05 },
    );
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * PI * 2,
        cx = Math.cos(a) * 0.05 * s,
        cy = Math.sin(a) * 0.05 * s - 0.01 * s;
      claw(
        R,
        "head",
        [
          [cx, cy, -0.37 * s],
          [cx * 0.6, cy * 0.6 - 0.004 * s, -0.385 * s],
        ],
        0.007 * s,
        toothM,
        4,
      );
    }
    // jaw: a hinged lower flap with its own hooked teeth (opens for the spit & bite)
    R.add(
      "jaw",
      P.xf(P.sphere(0.055 * s, 0.02 * s, 0.05 * s, 10, 6), 0, -0.012 * s, 0.0),
      lipM,
    );
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.018 * s;
      claw(
        R,
        "jaw",
        [
          [x, -0.005 * s, -0.03 * s],
          [x * 0.8, 0.015 * s, -0.04 * s],
        ],
        0.006 * s,
        toothM,
        4,
      );
    }
    // ---- limbs: long crooked arms walking on the knuckles, short bent hind legs ----
    const handM = Object.assign({}, fm, { color: L.shade(skinC, 0.85) });
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F",
        sg = S[1] === "L" ? -1 : 1;
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.065 : 0.08) * s, 0.045 * s, fm, {
        bulge: 0.012 * s,
      });
      R.add("lower" + S, P.sphere(0.048 * s, 0.048 * s, 0.048 * s, 8, 6), fm);
      seg(R, "lower" + S, pw, 0.045 * s, 0.032 * s, fm, { bulge: 0.008 * s });
      if (front) {
        // knuckle-walking hand: curled fingers on the ground, long nails curling back
        R.add(
          "paw" + S,
          P.xf(
            P.box(0.08 * s, 0.06 * s, 0.09 * s, 0.02 * s),
            0,
            -0.03 * s,
            -0.01 * s,
          ),
          handM,
        );
        for (let i = 0; i < 4; i++) {
          const x = (i - 1.5) * 0.02 * s;
          claw(
            R,
            "paw" + S,
            [
              [x, -0.06 * s, -0.05 * s],
              [x, -0.075 * s, -0.02 * s],
              [x, -0.06 * s, 0.02 * s],
            ],
            0.01 * s,
            { color: 0x2a2420, rough: 0.4 },
            4,
          );
        }
        claw(
          R,
          "paw" + S,
          [
            [sg * 0.05 * s, -0.03 * s, -0.04 * s],
            [sg * 0.08 * s, -0.06 * s, -0.08 * s],
          ],
          0.012 * s,
          handM,
          4,
        ); // thumb
      } else {
        R.add(
          "paw" + S,
          P.xf(
            P.box(0.07 * s, 0.04 * s, 0.16 * s, 0.015 * s),
            0,
            -0.035 * s,
            -0.04 * s,
          ),
          handM,
        );
        for (let i = 0; i < 3; i++)
          claw(
            R,
            "paw" + S,
            [
              [(i - 1) * 0.022 * s, -0.045 * s, -0.11 * s],
              [(i - 1) * 0.026 * s, -0.055 * s, -0.15 * s],
            ],
            0.008 * s,
            { color: 0x2a2420, rough: 0.4 },
            4,
          );
      }
    }
    R.hitVol(
      "head",
      "head",
      [0, 0.0, 0.0],
      [0, -0.01 * s, -0.36 * s],
      0.09 * s,
    );
    R.hitVol(
      "head",
      "neck",
      [0, 0, 0.1 * s],
      [0, -0.04 * s, -0.2 * s],
      0.08 * s,
    );
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.1 * s],
      [0, 0.08 * s, -0.2 * s],
      0.15 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.0, 0.15 * s],
      [0, -0.06 * s, -0.08 * s],
      0.22 * s,
    );
    for (const [S, part] of [
      ["FL", "leftArm"],
      ["FR", "rightArm"],
      ["HL", "leftLeg"],
      ["HR", "rightLeg"],
    ]) {
      R.hitVol(
        part,
        "upper" + S,
        [0, 0, 0],
        R.bones[R.map["lower" + S]].pos,
        0.06 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.05 * s,
      );
    }
    R.marker("head", "head", 0, 0.0, -0.18 * s, 0.11 * s);
    R.marker("torso", "chest", 0, -0.05 * s, 0.05 * s, 0.24 * s);
    R.marker("leftArm", "upperFL", -0.04 * s, -0.2 * s, -0.05 * s, 0.07 * s);
    R.marker("rightArm", "upperFR", 0.04 * s, -0.2 * s, -0.05 * s, 0.07 * s);
    R.marker("leftLeg", "upperHL", 0, -0.15 * s, -0.05 * s, 0.07 * s);
    R.marker("rightLeg", "upperHR", 0, -0.15 * s, -0.05 * s, 0.07 * s);
    R.socket("eyes", "head", 0, 0.04 * s, -0.2 * s);
    R.socket("muzzle", "head", 0, -0.01 * s, -0.4 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.2 * s,
      height: 1.35 * s,
      hipH: bh,
      dirt: [0.25, 0.55],
      blood: [0.05, 0.25],
      cut: {
        head: "neck",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { ranged: true, pant: false, wag: false, tailUp: 0, stride: 0.75 },
    });
    return tpl;
  }
