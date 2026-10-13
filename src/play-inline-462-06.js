// play-inline-462 06 — out
// Lines 838-1192 of readable/play-inline-462.pretty.js (statement-aligned).
  function buildAshBear(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.95, 1.08);
    const R = new L.Rig("quad");
    const bh = 0.8 * s;
    R.bone("hips", null, 0, bh, 0.42 * s, "torso");
    R.bone("spine", "hips", 0, 0.04 * s, -0.4 * s, "torso");
    R.bone("chest", "spine", 0, 0.05 * s, -0.4 * s, "torso");
    R.bone("neck", "chest", 0, 0.0, -0.26 * s, "head");
    R.bone("head", "neck", 0, -0.02 * s, -0.2 * s, "head");
    R.bone("jaw", "head", 0, -0.07 * s, -0.08 * s, "head");
    R.bone("earL", "head", -0.1 * s, 0.1 * s, 0.03 * s, "head");
    R.bone("earR", "head", 0.1 * s, 0.1 * s, 0.03 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.17 * s, -0.12 * s, -0.04 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.34 * s, 0.03 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.3 * s, -0.01 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.16 * s, -0.06 * s, 0.05 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.33 * s, -0.1 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.3 * s, 0.07 * s, part);
    }
    R.bone("tail1", "hips", 0, 0.02 * s, 0.2 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.03 * s, 0.06 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.03 * s, 0.04 * s, "torso");
    const furC = rng.pick([0x9a948c, 0x8a857e, 0xa49e94, 0x7e7a74]);
    const skinC = 0x6a5a56,
      soot = L.col(0x1e1c1a),
      ash = L.col(0xb8b4ae);
    // ash-caked fur: pale ash on the back & shoulders, soot-black legs and face,
    // bald burn-scarred patches (glossy, pinkish-grey) with charred rims
    const mange = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const n = L.noise3((wx * 6) / s + 2, (wy * 6) / s, (wz * 6) / s),
        n2 = L.noise3((wx * 23) / s, (wy * 23) / s + 4, (wz * 23) / s);
      if (ny > 0.2) {
        const k = 0.6 * sm(0.2, 0.8, ny);
        out[0] = lerp(out[0], ash.r, k);
        out[1] = lerp(out[1], ash.g, k);
        out[2] = lerp(out[2], ash.b, k);
      }
      if (wy < bh * 0.6) {
        const k = 0.6 * (1 - wy / (bh * 0.6));
        out[0] = lerp(out[0], soot.r, k);
        out[1] = lerp(out[1], soot.g, k);
        out[2] = lerp(out[2], soot.b, k);
      }
      if (n > 0.68) {
        const c = L.col(skinC);
        const k = sm(0.68, 0.72, n);
        out[0] = lerp(out[0], c.r * (0.9 + n2 * 0.3), k);
        out[1] = lerp(out[1], c.g * (0.85 + n2 * 0.2), k);
        out[2] = lerp(out[2], c.b * (0.85 + n2 * 0.2), k);
      } else if (n > 0.64) {
        out[0] *= 0.35;
        out[1] *= 0.33;
        out[2] *= 0.32;
      } // charred rim
    };
    const fur = {
      color: furC,
      region: "fur",
      rough: 0.95,
      noise: 0.2,
      paint: mange,
      grad: [0.85, 1.1],
    };
    // body: heavy hindquarters, a big shoulder hump
    R.addW(
      "hips",
      bodyZ([
        { z: 0.66 * s, rx: 0.12 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: 0.58 * s, rx: 0.24 * s, ry: 0.26 * s, oy: bh + 0.03 * s },
        { z: 0.38 * s, rx: 0.27 * s, ry: 0.3 * s, oy: bh + 0.02 * s },
        { z: 0.16 * s, rx: 0.26 * s, ry: 0.3 * s, oy: bh + 0.0 * s },
      ]),
      fur,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.2 * s, rx: 0.26 * s, ry: 0.3 * s, oy: bh + 0.02 * s },
        { z: -0.05 * s, rx: 0.27 * s, ry: 0.32 * s, oy: bh + 0.02 * s },
        { z: -0.25 * s, rx: 0.29 * s, ry: 0.35 * s, oy: bh + 0.04 * s },
      ]),
      fur,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.22 * s, rx: 0.29 * s, ry: 0.35 * s, oy: bh + 0.05 * s },
        { z: -0.4 * s, rx: 0.3 * s, ry: 0.4 * s, oy: bh + 0.1 * s },
        { z: -0.58 * s, rx: 0.26 * s, ry: 0.34 * s, oy: bh + 0.04 * s },
        { z: -0.72 * s, rx: 0.16 * s, ry: 0.2 * s, oy: bh + 0.0 * s },
      ]),
      fur,
    );
    // neck & head: broad skull, short heavy muzzle, small round ears
    const nw = R.world("neck"),
      hw = R.world("head");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.28 * s, 0.17 * s, 0.14 * s, { seg: 12 }),
        nw[0],
        nw[1] + 0.05 * s,
        nw[2] + 0.14 * s,
        -1.45,
        0,
        0,
      ),
      fur,
    );
    R.addW(
      "head",
      P.xf(
        P.sphere(0.15 * s, 0.13 * s, 0.15 * s, 12, 10),
        hw[0],
        hw[1] + 0.03 * s,
        hw[2] + 0.02 * s,
      ),
      fur,
    );
    const mz = P.limb(0.16 * s, 0.085 * s, 0.055 * s, { seg: 10, flat: 0.85 });
    mz.rotateX(PI / 2 + 0.25);
    R.addW(
      "head",
      P.xf(mz, hw[0], hw[1] - 0.01 * s, hw[2] - 0.1 * s),
      Object.assign({}, fur, { color: L.shade(furC, 1.4) }),
    );
    R.addW(
      "head",
      P.xf(
        P.sphere(0.034 * s, 0.026 * s, 0.028 * s, 8, 6),
        hw[0],
        hw[1] - 0.03 * s,
        hw[2] - 0.27 * s,
      ),
      { color: 0x0e0c0a, rough: 0.25, noise: 0.05 },
    );
    for (const sg of [-1, 1]) {
      R.addW(
        "head",
        P.xf(
          P.sphere(0.016 * s, 0.014 * s, 0.011 * s, 8, 6),
          hw[0] + sg * 0.065 * s,
          hw[1] + 0.06 * s,
          hw[2] - 0.11 * s,
        ),
        { color: 0xff7a24, emis: 1.6, rough: 0.15, noise: 0.05, keepLod: true },
      );
      R.add(
        "ear" + (sg < 0 ? "L" : "R"),
        P.xf(P.sphere(0.045 * s, 0.045 * s, 0.018 * s, 8, 6), 0, 0.02 * s, 0),
        Object.assign({}, fur, { paint: null }),
      );
    }
    const jw = R.world("jaw");
    const lj = P.limb(0.17 * s, 0.06 * s, 0.035 * s, { seg: 8, flat: 0.6 });
    lj.rotateX(PI / 2 + 0.2);
    R.addW(
      "jaw",
      P.xf(lj, jw[0], jw[1], jw[2]),
      Object.assign({}, fur, { color: 0x2a1c14, paint: null }),
    );
    const tooth = { color: 0xd8ccaa, rough: 0.35, noise: 0.12 };
    for (const sg of [-1, 1]) {
      claw(
        R,
        "head",
        [
          [sg * 0.035 * s, -0.07 * s, -0.24 * s],
          [sg * 0.035 * s, -0.12 * s, -0.25 * s],
        ],
        0.012 * s,
        tooth,
        5,
      ); // upper fangs
      claw(
        R,
        "jaw",
        [
          [sg * 0.03 * s, 0.0, -0.15 * s],
          [sg * 0.03 * s, 0.05 * s, -0.16 * s],
        ],
        0.01 * s,
        tooth,
        5,
      );
    }
    R.addW(
      "jaw",
      P.xf(
        P.box(0.06 * s, 0.015 * s, 0.13 * s, 0.006),
        jw[0],
        jw[1] + 0.012 * s,
        jw[2] - 0.08 * s,
        0.25,
        0,
        0,
      ),
      { color: 0x8a3a3a, rough: 0.35, noise: 0.05 },
    );
    // charred bony growths breaking through the hump and spine
    const growth = {
      color: 0x2a2624,
      rough: 0.6,
      noise: 0.3,
      grad: [0.6, 1.2],
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        if (ny > 0.6) {
          out[0] = out[0] * 0.6 + 0.25;
          out[1] = out[1] * 0.6 + 0.24;
          out[2] = out[2] * 0.6 + 0.22;
        }
      },
    };
    for (const [bone, w, zs] of [
      ["chest", R.world("chest"), [-0.5, -0.38, -0.26]],
      ["spine", R.world("spine"), [-0.15, 0.0]],
      ["hips", R.world("hips"), [0.3]],
    ])
      for (const z of zs) {
        const ht = (bone === "chest" ? 0.13 : 0.09) * s * rng.range(0.8, 1.2);
        const bx = rng.range(-0.04, 0.04) * s,
          top = bh + (bone === "chest" ? 0.48 : 0.33) * s;
        R.addW(
          bone,
          P.sweep(
            [
              [bx, top - 0.04 * s, z * s],
              [bx * 1.4, top + ht * 0.6, z * s + 0.02 * s],
              [bx * 1.6, top + ht, z * s + 0.05 * s],
            ],
            (u) => (0.035 - u * 0.03) * s,
            { seg: 5, rs: 6 },
          ),
          growth,
        );
      }
    // legs: thick, plantigrade paws with long claws
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F",
        sg = S[1] === "L" ? -1 : 1;
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.13 : 0.16) * s, 0.09 * s, fur, {
        bulge: 0.03 * s,
      });
      seg(R, "lower" + S, pw, 0.085 * s, 0.07 * s, fur);
      R.add(
        "paw" + S,
        P.xf(
          P.box(0.14 * s, 0.07 * s, 0.2 * s, 0.03 * s),
          0,
          -0.03 * s,
          -0.04 * s,
        ),
        Object.assign({}, fur, { paint: null, color: L.shade(furC, 0.8) }),
      );
      const nc = front ? 5 : 4;
      for (let i = 0; i < nc; i++) {
        const x = (i - (nc - 1) / 2) * 0.026 * s;
        claw(
          R,
          "paw" + S,
          [
            [x, -0.03 * s, -0.13 * s],
            [x, -0.05 * s, -0.19 * s],
            [x + sg * 0.0, -0.08 * s, -0.23 * s],
          ],
          (front ? 0.011 : 0.008) * s,
          { color: 0x1c1814, rough: 0.3, noise: 0.08, grad: [1.3, 0.8] },
          5,
        );
      }
    }
    seg(R, "tail1", R.bones[R.map.tail2].pos, 0.05 * s, 0.04 * s, fur);
    seg(R, "tail2", R.bones[R.map.tail3].pos, 0.04 * s, 0.02 * s, fur);
    R.hitVol(
      "head",
      "head",
      [0, 0.02 * s, 0.02 * s],
      [0, -0.02 * s, -0.24 * s],
      0.13 * s,
    );
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.22 * s],
      [0, 0.02 * s, -0.2 * s],
      0.28 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.05 * s, 0.1 * s],
      [0, 0.05 * s, -0.6 * s],
      0.32 * s,
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
        0.11 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.08 * s,
      );
    }
    R.marker("head", "head", 0, 0.02 * s, -0.08 * s, 0.14 * s);
    R.marker("torso", "spine", 0, 0.05 * s, 0, 0.35 * s);
    R.marker("leftArm", "upperFL", 0, -0.25 * s, 0, 0.1 * s);
    R.marker("rightArm", "upperFR", 0, -0.25 * s, 0, 0.1 * s);
    R.marker("leftLeg", "upperHL", 0, -0.25 * s, 0, 0.1 * s);
    R.marker("rightLeg", "upperHR", 0, -0.25 * s, 0, 0.1 * s);
    R.socket("eyes", "head", 0, 0.06 * s, -0.12 * s);
    R.socket("mouth", "jaw", 0, 0, -0.16 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.3 * s,
      height: 1.3 * s,
      hipH: bh,
      dirt: [0.2, 0.5],
      blood: [0, 0.25],
      cut: {
        head: "head",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: false, pant: false, tailUp: 0, stride: 0.85, bear: true },
    });
    return tpl;
  }
