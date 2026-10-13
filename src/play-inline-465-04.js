// play-inline-465 04 — bone
// Lines 402-775 of readable/play-inline-465.pretty.js (statement-aligned).
  function buildStag(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.93, 1.07);
    const R = new L.Rig("quad");
    const bh = 1.0 * s;
    R.bone("hips", null, 0, bh, 0.45 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.42 * s, "torso");
    R.bone("chest", "spine", 0, 0.03 * s, -0.42 * s, "torso");
    // one long neck rising up & forward from the withers
    R.bone("neck", "chest", 0, 0.2 * s, -0.26 * s, "head");
    R.bone("head", "neck", 0, 0.38 * s, -0.17 * s, "head");
    R.bone("jaw", "head", 0, -0.04 * s, -0.07 * s, "head");
    R.bone("earL", "head", -0.06 * s, 0.06 * s, 0.02 * s, "head");
    R.bone("earR", "head", 0.06 * s, 0.06 * s, 0.02 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.16 * s, -0.1 * s, -0.08 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.38 * s, 0.035 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.44 * s, -0.01 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.15 * s, -0.08 * s, 0.14 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.38 * s, -0.13 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.46 * s, 0.11 * s, part);
    }
    R.bone("tail1", "hips", 0, 0.12 * s, 0.33 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.05 * s, 0.05 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.04 * s, 0.03 * s, "torso");
    R.softJoint("spine", 0.1 * s, 0.34 * s, [0, 0, -1]);
    R.softJoint("chest", 0.1 * s, 0.34 * s, [0, 0, -1]);
    R.softJoint("neck", 0.06 * s, 0.14 * s);
    for (const S of ["FL", "FR", "HL", "HR"]) {
      R.softJoint("upper" + S, 0.05 * s, 0.13 * s, [0, -1, 0]);
      R.softJoint("lower" + S, 0.03 * s, 0.06 * s, [0, -1, 0]);
    }

    // ---- hide: red-brown, white belly & rump flag, mangy bare patches, healed burn scars
    const hideC = rng.pick([0x7a5234, 0x86603c, 0x6e4a30]);
    const white = L.col(0xd8ccb4),
      bare = L.col(0xb08270),
      dark = L.col(0x3a2818);
    const ph = rng.range(0, 40);
    const hide = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.5 || (wz > 0.72 * s && wy > bh - 0.05 * s && nz > 0.3)) {
        mixTo(out, white, 0.8);
        return;
      } // belly, rump flag
      if (wy > bh + 0.18 * s && ny > 0.5) mixTo(out, dark, 0.35); // dorsal stripe
      const m =
        L.noise3((wx * 5) / s + ph, (wy * 5) / s, (wz * 5) / s) * 0.7 +
        L.noise3((wx * 17) / s, (wy * 17) / s + ph, (wz * 17) / s) * 0.3;
      if (m > 0.62) mixTo(out, bare, sm(0.62, 0.68, m)); // mange
      if (L.noise3((wx * 6) / s + 5, (wy * 6) / s, (wz * 6) / s + ph) > 0.78)
        mixTo(out, white, 0.45); // pale scar tissue
    };
    const skin = {
      color: hideC,
      region: "fur",
      rough: 0.85,
      noise: 0.14,
      paint: hide,
      grad: [0.82, 1.06],
    };
    // ---- body: slim barrel, high withers, tucked flank, round rump
    R.addW(
      "hips",
      bodyZ([
        { z: 0.86 * s, rx: 0.1 * s, ry: 0.14 * s, oy: bh + 0.1 * s },
        { z: 0.78 * s, rx: 0.21 * s, ry: 0.25 * s, oy: bh + 0.07 * s },
        { z: 0.6 * s, rx: 0.25 * s, ry: 0.28 * s, oy: bh + 0.05 * s },
        { z: 0.38 * s, rx: 0.24 * s, ry: 0.27 * s, oy: bh + 0.04 * s },
      ]),
      skin,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.42 * s, rx: 0.24 * s, ry: 0.27 * s, oy: bh + 0.04 * s },
        { z: 0.08 * s, rx: 0.26 * s, ry: 0.3 * s, oy: bh + 0.02 * s },
        { z: -0.25 * s, rx: 0.26 * s, ry: 0.33 * s, oy: bh + 0.03 * s },
      ]),
      skin,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.2 * s, rx: 0.26 * s, ry: 0.33 * s, oy: bh + 0.03 * s },
        { z: -0.45 * s, rx: 0.25 * s, ry: 0.34 * s, oy: bh + 0.05 * s },
        { z: -0.62 * s, rx: 0.2 * s, ry: 0.28 * s, oy: bh + 0.08 * s },
        { z: -0.72 * s, rx: 0.1 * s, ry: 0.15 * s, oy: bh + 0.14 * s },
      ]),
      skin,
    );
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.17 * s, 0.1 * s, 0.24 * s, 12, 8),
        0,
        bh + 0.28 * s,
        -0.42 * s,
      ),
      skin,
    ); // withers
    // ---- neck & head (one antler often snapped short)
    const antlerM = {
      color: 0xc8b490,
      rough: 0.6,
      noise: 0.14,
      grad: [0.55, 1.1],
    };
    const broken = rng.chance(0.4) ? (rng.chance(0.5) ? -1 : 1) : 0;
    for (const [N, Hd, J, sg, k] of [["neck", "head", "jaw", -1, 1]]) {
      const hp = R.bones[R.map[Hd]].pos;
      seg(R, N, hp, 0.12 * s * k, 0.075 * s * k, skin, { bulge: 0.012 * s });
      R.add(
        N,
        P.xf(
          P.sphere(0.14 * s, 0.14 * s, 0.14 * s, 10, 8),
          0,
          -0.02 * s,
          0.04 * s,
        ),
        skin,
      );
      // long deer skull tapering into a fine muzzle
      const hd = P.sphere(1, 1, 1, 14, 10);
      P.deform(hd, (v) => {
        let x = v.x * 0.075,
          y = v.y * 0.075,
          z = v.z * 0.16;
        if (v.z < 0) {
          const t = -v.z;
          x *= lerp(1, 0.55, t);
          y *= lerp(1, 0.66, t);
        }
        v.set(x * s * k, (y + 0.015) * s * k, (z - 0.09) * s * k);
      });
      const headT = Object.assign({}, skin, {
        paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
          hide(x, y, z, nx, ny, nz, out, wx, wy, wz);
          if (z < -0.19 * s * k) mixTo(out, dark, 0.6);
          if (ny < -0.4) mixTo(out, white, 0.5);
        },
      });
      R.add(Hd, hd, headT);
      R.add(
        Hd,
        P.xf(
          P.sphere(0.024 * s * k, 0.018 * s * k, 0.016 * s * k, 8, 6),
          0,
          0.0,
          -0.245 * s * k,
        ),
        { color: 0x151210, rough: 0.25, noise: 0.05 },
      ); // wet nose
      for (const n of [-1, 1]) {
        R.add(
          Hd,
          P.xf(
            P.sphere(0.017 * s * k, 0.019 * s * k, 0.015 * s * k, 8, 6),
            n * 0.058 * s * k,
            0.04 * s * k,
            -0.1 * s * k,
          ),
          { color: 0x0a0806, rough: 0.08, metal: 0.1 },
        ); // big dark eyes
        // ANTLERS: main beam out, up & back, then forward; brow tine + two upper tines
        const b0 = [n * 0.04 * s * k, 0.075 * s * k, -0.04 * s * k];
        const beam = [
          b0,
          [n * 0.11 * s * k, 0.17 * s * k, 0.0],
          [n * 0.17 * s * k, 0.29 * s * k, 0.02 * s * k],
          [n * 0.17 * s * k, 0.42 * s * k, -0.04 * s * k],
          [n * 0.13 * s * k, 0.52 * s * k, -0.12 * s * k],
        ];
        if (n === broken) {
          claw(R, Hd, beam.slice(0, 3), 0.022 * s * k, antlerM, 6);
          continue;
        } // snapped beam
        claw(R, Hd, beam, 0.02 * s * k, antlerM, 6);
        claw(
          R,
          Hd,
          [
            [n * 0.08 * s * k, 0.12 * s * k, -0.02 * s * k],
            [n * 0.1 * s * k, 0.16 * s * k, -0.11 * s * k],
            [n * 0.09 * s * k, 0.21 * s * k, -0.16 * s * k],
          ],
          0.012 * s * k,
          antlerM,
          5,
        );
        claw(
          R,
          Hd,
          [
            [n * 0.16 * s * k, 0.27 * s * k, 0.02 * s * k],
            [n * 0.2 * s * k, 0.36 * s * k, -0.02 * s * k],
            [n * 0.23 * s * k, 0.44 * s * k, -0.02 * s * k],
          ],
          0.011 * s * k,
          antlerM,
          5,
        );
        claw(
          R,
          Hd,
          [
            [n * 0.17 * s * k, 0.38 * s * k, -0.02 * s * k],
            [n * 0.2 * s * k, 0.45 * s * k, 0.05 * s * k],
            [n * 0.2 * s * k, 0.52 * s * k, 0.08 * s * k],
          ],
          0.009 * s * k,
          antlerM,
          5,
        );
      }
      R.add(
        J,
        P.xf(
          P.sphere(0.04 * s * k, 0.022 * s * k, 0.1 * s * k, 8, 6),
          0,
          -0.012 * s * k,
          -0.1 * s * k,
          0.08,
          0,
          0,
        ),
        Object.assign({}, skin, { paint: null, color: L.shade(hideC, 0.8) }),
      );
      void sg;
    }
    // ears on bones
    for (const [E, n] of [
      ["earL", -1],
      ["earR", 1],
    ])
      R.add(
        E,
        P.xf(
          P.sphere(0.07 * s, 0.022 * s, 0.045 * s, 8, 5),
          n * 0.03 * s,
          0.01 * s,
          0.01 * s,
          0,
          n * 0.4,
          -n * 0.6,
        ),
        Object.assign({}, skin, { paint: null, color: L.shade(hideC, 0.9) }),
      );
    // ---- legs: long, thin, knobbly joints, small cloven hooves
    const legM = Object.assign({}, skin, { grad: [0.7, 1.0] });
    const hoofM = {
      color: 0x1c1814,
      rough: 0.45,
      noise: 0.1,
      grad: [0.8, 1.1],
    };
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.1 : 0.14) * s, 0.055 * s, legM, {
        bulge: front ? 0.01 * s : 0.03 * s,
      });
      R.add(
        "lower" + S,
        P.xf(P.sphere(0.045 * s, 0.045 * s, 0.045 * s, 8, 6), 0, 0, 0),
        legM,
      );
      seg(R, "lower" + S, pw, 0.036 * s, 0.028 * s, legM);
      R.add(
        "paw" + S,
        P.xf(P.sphere(0.032 * s, 0.03 * s, 0.032 * s, 8, 6), 0, 0.012 * s, 0),
        legM,
      );
      for (const n of [-1, 1])
        R.add(
          "paw" + S,
          P.xf(
            P.cyl(0.014 * s, 0.022 * s, 0.07 * s, 7),
            n * 0.014 * s,
            -0.018 * s,
            -0.012 * s,
            -0.25,
            0,
            0,
          ),
          hoofM,
        );
    }
    // ---- short tail, white underside
    seg(R, "tail1", R.bones[R.map.tail2].pos, 0.04 * s, 0.035 * s, skin);
    R.add(
      "tail2",
      P.xf(
        P.sphere(0.035 * s, 0.06 * s, 0.025 * s, 7, 6),
        0,
        -0.03 * s,
        0.01 * s,
      ),
      { color: 0xd8ccb4, region: "fur", rough: 0.95, noise: 0.15 },
    );
    // ---- hit volumes etc.
    R.hitVol("head", "head", [0, 0.02 * s, 0], [0, 0, -0.24 * s], 0.08 * s);
    R.hitVol("head", "neck", [0, 0, 0], R.bones[R.map.head].pos, 0.09 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.05 * s, 0.4 * s],
      [0, 0.03 * s, -0.2 * s],
      0.28 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.05 * s, 0.2 * s],
      [0, 0.08 * s, -0.5 * s],
      0.3 * s,
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
        0.07 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.04 * s,
      );
    }
    R.marker("head", "head", 0, 0.0, -0.1 * s, 0.1 * s);
    R.marker("torso", "spine", 0, 0.05 * s, 0, 0.3 * s);
    R.marker("leftArm", "upperFL", 0, -0.28 * s, 0, 0.07 * s);
    R.marker("rightArm", "upperFR", 0, -0.28 * s, 0, 0.07 * s);
    R.marker("leftLeg", "upperHL", 0, -0.28 * s, 0, 0.07 * s);
    R.marker("rightLeg", "upperHR", 0, -0.28 * s, 0, 0.07 * s);
    R.socket("eyes", "head", 0, 0.04 * s, -0.1 * s);
    R.socket("mouth", "jaw", 0, 0, -0.16 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.3 * s,
      height: 1.95 * s,
      hipH: bh,
      dirt: [0.2, 0.5],
      blood: [0, 0.08],
      cut: {
        head: "neck",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: false, pant: false, tailUp: 0.1, stride: 0.9, graze: true },
    });
    return tpl;
  }
