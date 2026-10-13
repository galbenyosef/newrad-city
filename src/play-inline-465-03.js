// play-inline-465 03 — bone
// Lines 65-401 of readable/play-inline-465.pretty.js (statement-aligned).
  function buildCoyote(opts, seed) {
    const rng = L.rng(seed);
    const dark =
      opts.variant === "dark" ||
      (opts.variant === undefined && rng.chance(0.3));
    const s = (opts.scale || 1) * rng.range(1.08, 1.2);
    const R = new L.Rig("quad");
    const bh = 0.6 * s;
    R.bone("hips", null, 0, bh, 0.3 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.28 * s, "torso");
    R.bone("chest", "spine", 0, 0.01 * s, -0.27 * s, "torso");
    R.bone("neck", "chest", 0, 0.06 * s, -0.13 * s, "head");
    R.bone("head", "neck", 0, 0.13 * s, -0.1 * s, "head");
    R.bone("jaw", "head", 0, -0.035 * s, -0.05 * s, "head");
    R.bone("earL", "head", -0.05 * s, 0.055 * s, 0.03 * s, "head");
    R.bone("earR", "head", 0.05 * s, 0.055 * s, 0.03 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.085 * s, -0.04 * s, -0.02 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.25 * s, 0.045 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.23 * s, -0.012 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.08 * s, -0.03 * s, 0.02 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.23 * s, -0.1 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.25 * s, 0.08 * s, part);
    }
    // bushy tail, carried low
    R.bone("tail1", "hips", 0, 0.03 * s, 0.13 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.08 * s, 0.17 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.07 * s, 0.15 * s, "torso");
    R.softJoint("spine", 0.06 * s, 0.16 * s, [0, 0, -1]);
    R.softJoint("chest", 0.06 * s, 0.16 * s, [0, 0, -1]);
    R.softJoint("neck", 0.04 * s, 0.1 * s);
    for (const S of ["FL", "FR", "HL", "HR"])
      R.softJoint("upper" + S, 0.03 * s, 0.07 * s, [0, -1, 0]);

    // ---- coat: coyote tan (or night grey) with a darker saddle, pale belly & throat,
    // mangy bare patches and old scars (rangy city scavengers)
    const base = dark
      ? rng.pick([0x7a7266, 0x6e685e])
      : rng.pick([0xa88a62, 0x9c7e58, 0xb0926a]);
    const saddle = L.col(dark ? 0x3a3630 : 0x5a4632),
      belly = L.col(dark ? 0x9a9488 : 0xd2c0a0),
      bare = L.col(0x8a6a5e);
    const ph = rng.range(0, 40);
    const fur = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.45) {
        mixTo(out, belly, 0.8);
        return;
      }
      if (wy > bh + 0.05 * s && ny > 0.35) mixTo(out, saddle, 0.45);
      if (L.noise3((wx * 20) / s, (wy * 20) / s, (wz * 20) / s) > 0.74) {
        out[0] *= 0.8;
        out[1] *= 0.76;
        out[2] *= 0.72;
      } // grizzle
      if (L.noise3((wx * 5) / s + ph, (wy * 5) / s, (wz * 5) / s) > 0.76)
        mixTo(out, bare, 0.7); // mange
      if (
        Math.abs(Math.sin(((wx + wz * 0.3) * 60) / s)) < 0.05 &&
        L.noise3((wx * 3) / s, (wy * 3) / s + ph, (wz * 3) / s) > 0.6
      )
        mixTo(out, belly, 0.5); // scar lines
    };
    const coat = {
      color: base,
      region: "fur",
      rough: 0.9,
      noise: 0.16,
      paint: fur,
      grad: [0.88, 1.08],
    };
    // ---- body: lean coyote, deep chest, tucked waist
    R.addW(
      "hips",
      bodyZ([
        { z: 0.47 * s, rx: 0.06 * s, ry: 0.07 * s, oy: bh + 0.03 * s },
        { z: 0.41 * s, rx: 0.1 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: 0.26 * s, rx: 0.11 * s, ry: 0.13 * s, oy: bh + 0.02 * s },
        { z: 0.1 * s, rx: 0.095 * s, ry: 0.11 * s, oy: bh + 0.03 * s },
      ]),
      coat,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.14 * s, rx: 0.095 * s, ry: 0.11 * s, oy: bh + 0.03 * s },
        { z: -0.05 * s, rx: 0.1 * s, ry: 0.12 * s, oy: bh + 0.02 * s },
        { z: -0.18 * s, rx: 0.12 * s, ry: 0.16 * s, oy: bh - 0.005 * s },
      ]),
      coat,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.14 * s, rx: 0.12 * s, ry: 0.16 * s, oy: bh - 0.005 * s },
        { z: -0.3 * s, rx: 0.13 * s, ry: 0.19 * s, oy: bh - 0.02 * s },
        { z: -0.41 * s, rx: 0.115 * s, ry: 0.17 * s, oy: bh + 0.02 * s },
        { z: -0.49 * s, rx: 0.07 * s, ry: 0.1 * s, oy: bh + 0.07 * s },
      ]),
      coat,
    );
    // ruff of rough fur over the shoulders
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.11 * s, 0.075 * s, 0.12 * s, 12, 8),
        0,
        bh + 0.07 * s,
        -0.36 * s,
      ),
      Object.assign({}, coat, { color: L.shade(base, 0.9) }),
    );
    // ---- neck & head: narrow pointed muzzle, big upright ears, amber eyes
    const nw = R.world("neck"),
      hw = R.world("head"),
      jw = R.world("jaw");
    R.addW(
      "neck",
      P.xf(
        P.limb(0.22 * s, 0.07 * s, 0.09 * s, { seg: 12 }),
        nw[0],
        nw[1] + 0.17 * s,
        nw[2] - 0.08 * s,
        -0.8,
        0,
        0,
      ),
      coat,
    );
    const headM = Object.assign({}, coat, {
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        if (ny < -0.2) mixTo(out, belly, 0.6);
      },
    });
    const sk = P.sphere(1, 1, 1, 14, 10);
    P.deform(sk, (v) => {
      let x = v.x * 0.075,
        y = v.y * 0.07,
        z = v.z * 0.1;
      if (v.y > 0.4) y *= 0.9;
      v.set(x * s, y * s + 0.01 * s, z * s - 0.02 * s);
    });
    R.addW("head", P.xf(sk, hw[0], hw[1], hw[2]), headM);
    const mz = P.limb(0.13 * s, 0.042 * s, 0.018 * s, { seg: 10, flat: 0.8 });
    mz.rotateX(PI / 2 + 0.12);
    R.addW("head", P.xf(mz, hw[0], hw[1] - 0.008 * s, hw[2] - 0.09 * s), headM);
    R.addW(
      "head",
      P.xf(
        P.sphere(0.015 * s, 0.012 * s, 0.013 * s, 8, 6),
        hw[0],
        hw[1] - 0.008 * s,
        hw[2] - 0.225 * s,
      ),
      { color: 0x151210, rough: 0.3, noise: 0.05 },
    );
    const eyeM = {
      color: dark ? 0xd8b030 : 0xd8a028,
      rough: 0.08,
      noise: 0,
      emis: 0.3,
      keepLod: true,
    };
    const toothM = {
      color: 0xe8e0c8,
      rough: 0.3,
      noise: 0.05,
      grad: [0.9, 1.05],
    };
    for (const sg of [-1, 1]) {
      R.addW(
        "head",
        P.xf(
          P.sphere(0.013 * s, 0.011 * s, 0.012 * s, 8, 6),
          hw[0] + sg * 0.042 * s,
          hw[1] + 0.025 * s,
          hw[2] - 0.085 * s,
          0,
          sg * 0.4,
          0,
        ),
        eyeM,
      );
      claw(
        R,
        "head",
        [
          [sg * 0.018 * s, -0.022 * s, -0.19 * s],
          [sg * 0.019 * s, -0.04 * s, -0.185 * s],
        ],
        0.005 * s,
        toothM,
        4,
      ); // canines
      const ear = P.cone(0.032 * s, 0.09 * s, 6);
      ear.scale(1, 1, 0.4);
      R.add(
        "ear" + (sg < 0 ? "L" : "R"),
        P.xf(ear, sg * 0.006 * s, 0.04 * s, 0.0, 0.15, 0, -sg * 0.2),
        Object.assign({}, coat, { paint: null, color: L.shade(base, 0.8) }),
      );
    }
    const lj = P.limb(0.13 * s, 0.03 * s, 0.014 * s, { seg: 8, flat: 0.6 });
    lj.rotateX(PI / 2 + 0.04);
    R.addW(
      "jaw",
      P.xf(lj, jw[0], jw[1], jw[2] - 0.02 * s),
      Object.assign({}, headM, { paint: null, color: L.shade(base, 0.85) }),
    );
    // ---- legs: long & lean, dark socks
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      const up = R.bones[R.map["lower" + S]].pos,
        lo = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, up, (front ? 0.05 : 0.07) * s, 0.034 * s, coat, {
        bulge: front ? 0.004 * s : 0.018 * s,
      });
      seg(
        R,
        "lower" + S,
        lo,
        0.03 * s,
        0.022 * s,
        Object.assign({}, coat, { color: L.shade(base, 0.8) }),
      );
      R.add(
        "paw" + S,
        P.xf(
          P.sphere(0.03 * s, 0.024 * s, 0.042 * s, 8, 6),
          0,
          -0.018 * s,
          -0.02 * s,
        ),
        Object.assign({}, coat, { color: L.shade(base, 0.55), paint: null }),
      );
      for (let i = -1; i <= 1; i++)
        claw(
          R,
          "paw" + S,
          [
            [i * 0.012 * s, -0.025 * s, -0.052 * s],
            [i * 0.014 * s, -0.04 * s, -0.07 * s],
          ],
          0.004 * s,
          { color: 0x1a1612, rough: 0.4 },
          4,
        );
    }
    // ---- bushy tail with a dark tip
    const tp = (b) => R.bones[R.map[b]].pos;
    seg(R, "tail1", tp("tail2"), 0.045 * s, 0.06 * s, coat, {
      bulge: 0.01 * s,
    });
    seg(R, "tail2", tp("tail3"), 0.06 * s, 0.05 * s, coat);
    R.add(
      "tail3",
      P.xf(
        P.sphere(0.045 * s, 0.11 * s, 0.045 * s, 8, 6),
        0,
        -0.06 * s,
        0.05 * s,
        -0.5,
        0,
        0,
      ),
      Object.assign({}, coat, { paint: null, color: L.shade(base, 0.45) }),
    );
    // ---- hit volumes, markers, sockets
    R.hitVol("head", "head", [0, 0.01 * s, 0], [0, 0, -0.22 * s], 0.07 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.14 * s],
      [0, 0.02 * s, -0.12 * s],
      0.13 * s,
    );
    R.hitVol("torso", "chest", [0, 0, 0.1 * s], [0, 0, -0.22 * s], 0.16 * s);
    for (const [S, part] of [
      ["FL", "leftArm"],
      ["FR", "rightArm"],
      ["HL", "leftLeg"],
      ["HR", "rightLeg"],
    ]) {
      R.hitVol(part, "upper" + S, [0, 0, 0], tp("lower" + S), 0.05 * s);
      R.hitVol(part, "lower" + S, [0, 0, 0], tp("paw" + S), 0.035 * s);
    }
    R.marker("head", "head", 0, 0.01 * s, -0.08 * s, 0.08 * s);
    R.marker("torso", "spine", 0, 0, 0, 0.18 * s);
    R.marker("leftArm", "upperFL", 0, -0.16 * s, 0, 0.06 * s);
    R.marker("rightArm", "upperFR", 0, -0.16 * s, 0, 0.06 * s);
    R.marker("leftLeg", "upperHL", 0, -0.16 * s, 0, 0.06 * s);
    R.marker("rightLeg", "upperHR", 0, -0.16 * s, 0, 0.06 * s);
    R.socket("eyes", "head", 0, 0.03 * s, -0.08 * s);
    R.socket("mouth", "jaw", 0, 0, -0.14 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.13 * s,
      height: 0.9 * s,
      hipH: bh,
      dirt: [0.2, 0.5],
      cut: {
        head: "head",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { wag: false, pant: true, tailUp: -0.25, stride: 1.05 },
    });
    return tpl;
  }
  L.infos.coyote = {
    kind: "quad",
    height: 0.95,
    radius: 0.5,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: QLBL,
    gait: { walkStep: 0.5, runStep: 1.35, walkSpeed: 1.6, runSpeed: 8.6 },
    style: { stride: 1.05, wag: false, pant: true, tailUp: -0.25 },
    variants: 4,
    build: buildCoyote,
  };

  // ==================================================================
  // STAG
  // ==================================================================
