// play-inline-460 07 — out
// Lines 1333-1798 of readable/play-inline-460.pretty.js (statement-aligned).
  function buildShellback(opts, seed, kind) {
    kind = kind || (typeof opts.variant === "string" ? opts.variant : "normal");
    const rng = L.rng(seed);
    const big = kind === "matriarch",
      stalker = kind === "stalker",
      spawn = kind === "spawn";
    const s =
      (opts.scale || 1) *
      (big ? 3.1 : spawn ? 0.32 : stalker ? 1.05 : rng.range(0.92, 1.06));
    const R = new L.Rig("insect");
    const bh = (stalker ? 0.78 : big ? 0.3 : 0.4) * s; // shell height above ground (stalkers stand tall)
    R.bone("body", null, 0, bh, 0, "torso");
    R.bone("head", "body", 0, 0.02 * s, -0.42 * s, "head");
    R.bone("abdomen", "body", 0, -0.02 * s, 0.42 * s, "torso");
    R.bone("tail1", "abdomen", 0, 0.0, 0.34 * s, "torso");
    R.bone("tail2", "tail1", 0, 0.0, 0.32 * s, "torso");
    R.bone("tail3", "tail2", 0, 0.0, 0.3 * s, "torso");
    const legZ = [-0.3, -0.1, 0.1, 0.28];
    const reach = stalker ? 0.62 : 0.5,
      drop = bh - 0.02 * s;
    for (let n = 1; n <= 4; n++)
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + n,
          part =
            n >= 3
              ? sg < 0
                ? "leftLeg"
                : "rightLeg"
              : sg < 0
                ? "leftLeg"
                : "rightLeg";
        R.bone(
          "leg" + S,
          "body",
          sg * 0.14 * s,
          -0.06 * s,
          legZ[n - 1] * s,
          part,
        );
        R.bone(
          "foot" + S,
          "leg" + S,
          sg * reach * 0.62 * s,
          (stalker ? 0.12 : -0.02) * s,
          legZ[n - 1] * 0.25 * s,
          part,
        );
      }
    for (const [S, sg, part] of [
      ["L", -1, "leftArm"],
      ["R", 1, "rightArm"],
    ]) {
      R.bone("claw" + S, "body", sg * 0.16 * s, -0.12 * s, -0.36 * s, part);
      R.bone(
        "pincer" + S,
        "claw" + S,
        sg * 0.06 * s,
        -0.04 * s,
        -0.24 * s,
        part,
      );
    }
    const shellC = big
      ? 0x4a4232
      : stalker
        ? 0x2c322e
        : spawn
          ? 0xc4b496
          : rng.pick([0x5c4f36, 0x54503a, 0x63543a]);
    const bellyC = spawn ? 0xe0d4b8 : 0xb8a888;
    const spots = L.col(L.shade(shellC, 0.62));
    const shellP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.25) {
        const c = L.col(bellyC);
        out[0] = lerp(out[0], c.r, 0.75);
        out[1] = lerp(out[1], c.g, 0.75);
        out[2] = lerp(out[2], c.b, 0.75);
        return;
      }
      const n = L.noise3((wx * 9) / s, (wy * 9) / s, (wz * 9) / s);
      if (n > 0.62) {
        out[0] = lerp(out[0], spots.r, 0.7);
        out[1] = lerp(out[1], spots.g, 0.7);
        out[2] = lerp(out[2], spots.b, 0.7);
      } // mottling
      if (ny > 0.85) {
        out[0] *= 1.08;
        out[1] *= 1.06;
        out[2] *= 1.02;
      } // sun-bleached crown
    };
    const shell = {
      color: shellC,
      region: "shell",
      rough: spawn ? 0.3 : 0.38,
      metal: 0.05,
      noise: 0.16,
      grad: [0.75, 1.12],
      paint: shellP,
    };
    const under = {
      color: L.shade(bellyC, 0.75),
      region: "shell",
      rough: 0.55,
      noise: 0.2,
      grad: [0.8, 1],
    };
    const spike = {
      color: big ? 0xcfc2a0 : L.shade(shellC, 1.25),
      rough: 0.4,
      noise: 0.15,
      grad: [0.6, 1.1],
    };
    const eyeM = {
      color: 0x0e0e0c,
      rough: 0.08,
      metal: 0.2,
      emis: stalker ? 0.5 : 0.08,
      noise: 0.03,
    };
    // ---- head shield (prosoma): a horseshoe dome with a central keel and two side ridges ----
    const dome = P.sphere(
      0.66 * s,
      0.3 * s,
      0.56 * s,
      30,
      14,
      0,
      PI * 2,
      0,
      PI / 2,
    );
    P.deform(dome, (v) => {
      const ax = Math.abs(v.x) / (0.66 * s);
      if (v.z > 0.18 * s) {
        v.z = 0.18 * s + (v.z - 0.18 * s) * 0.45;
      } // squared-off back edge (hinge)
      v.y +=
        0.035 *
        s *
        Math.exp(-Math.pow(v.x / (0.05 * s), 2)) *
        (v.y > 0.05 * s ? 1 : 0); // keel
      v.y +=
        0.02 *
        s *
        Math.exp(-Math.pow((ax - 0.42) / 0.06, 2)) *
        (v.y > 0.05 * s ? 1 : 0); // side ridges
      v.y *= 1 - 0.18 * ax * ax; // flatter brim
    });
    R.add("body", P.xf(dome, 0, -0.03 * s, -0.08 * s), shell);
    // brim lip and dark underside plate (hides the inside of the dome)
    const brim = P.torus(0.6 * s, 0.025 * s, 5, 32);
    brim.rotateX(PI / 2);
    brim.scale(1.1, 1, 0.93);
    P.deform(brim, (v) => {
      if (v.z > 0.18 * s) v.z = 0.18 * s + (v.z - 0.18 * s) * 0.45;
    });
    R.add("body", P.xf(brim, 0, -0.03 * s, -0.08 * s), shell);
    R.add(
      "body",
      P.xf(
        P.cyl(0.6 * s, 0.6 * s, 0.03 * s, 28),
        0,
        -0.05 * s,
        -0.08 * s,
        0,
        0,
        0,
        1.08,
        1,
        0.9,
      ),
      under,
    );
    // compound eyes (kidney-shaped, on the side ridges) + two median eyes up front
    for (const sg of [-1, 1]) {
      R.add(
        "body",
        P.xf(
          P.sphere(0.045 * s, 0.022 * s, 0.075 * s, 10, 6),
          sg * 0.28 * s,
          0.2 * s,
          -0.12 * s,
          0,
          sg * 0.25,
          sg * 0.35,
        ),
        eyeM,
      );
      R.add(
        "head",
        P.xf(
          P.sphere(0.007 * s, 0.005 * s, 0.007 * s, 6, 4),
          sg * 0.025 * s,
          0.215 * s,
          0.03 * s,
        ),
        eyeM,
      );
    }
    // ---- rear shell (opisthosoma): a hexagonal plate with edge spines ----
    const rear = P.sphere(
      0.42 * s,
      0.18 * s,
      0.32 * s,
      18,
      8,
      0,
      PI * 2,
      0,
      PI / 2,
    );
    P.deform(rear, (v) => {
      const ax = Math.abs(v.x) / (0.42 * s);
      v.x *= 1 - 0.35 * Math.max(0, v.z / (0.32 * s));
      v.y += 0.02 * s * Math.exp(-Math.pow(v.x / (0.04 * s), 2));
      v.y *= 1 - 0.15 * ax;
    });
    R.add("abdomen", P.xf(rear, 0, -0.03 * s, 0.12 * s), shell);
    R.add(
      "abdomen",
      P.xf(
        P.cyl(0.36 * s, 0.26 * s, 0.03 * s, 6),
        0,
        -0.04 * s,
        0.12 * s,
        0,
        PI / 6,
        0,
        1,
        1,
        0.8,
      ),
      under,
    );
    for (let i = 0; i < 5; i++)
      for (const sg of [-1, 1]) {
        const z = (-0.05 + i * 0.09) * s,
          x = sg * (0.4 - i * 0.05) * s;
        claw(
          R,
          "abdomen",
          [
            [x, -0.02 * s, z + 0.12 * s],
            [x + sg * 0.07 * s, -0.03 * s, z + 0.16 * s],
          ],
          (big ? 0.016 : 0.012) * s,
          spike,
        );
      }
    // ---- telson: long, keeled spike tail ----
    const tl = [0.34, 0.32, 0.3],
      tr = [0.05, 0.035, 0.022, 0.004];
    for (let i = 1; i <= 3; i++) {
      const g = P.limb(tl[i - 1] * s, tr[i - 1] * s, tr[i] * s, { seg: 6 });
      g.rotateX(-PI / 2);
      g.scale(1, 0.8, 1);
      R.add("tail" + i, g, shell);
      R.add(
        "tail" + i,
        P.xf(
          P.box(0.008 * s, tr[i - 1] * s * 0.9, tl[i - 1] * s * 0.9, 0.003 * s),
          0,
          tr[i - 1] * s * 0.7,
          tl[i - 1] * s * 0.5,
        ),
        spike,
      ); // dorsal keel
    }
    // ---- legs: jointed, slim, ending in small claws, poking out under the rim ----
    for (let n = 1; n <= 4; n++)
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + n;
        const fp = R.bones[R.map["foot" + S]].pos;
        const lk = big ? 1.5 : 1;
        seg(R, "leg" + S, fp, 0.04 * s * lk, 0.032 * s * lk, shell);
        R.add(
          "foot" + S,
          P.xf(P.sphere(0.034 * s, 0.034 * s, 0.034 * s, 8, 6), 0, 0, 0),
          shell,
        );
        const tib = [
          sg * (stalker ? 0.12 : 0.1) * s,
          -(bh - 0.06 * s + (stalker ? 0.12 : -0.02) * s),
          legZ[n - 1] * 0.15 * s,
        ];
        seg(
          R,
          "foot" + S,
          tib,
          0.03 * s * lk,
          0.012 * s * lk,
          Object.assign({}, shell, {
            paint: null,
            color: L.shade(shellC, 0.8),
          }),
        );
        claw(
          R,
          "foot" + S,
          [
            [tib[0], tib[1], tib[2]],
            [tib[0] + sg * 0.03 * s, tib[1] - 0.005 * s, tib[2] - 0.03 * s],
          ],
          0.008 * s,
          spike,
          4,
        );
      }
    // ---- pincer arms ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const pp = R.bones[R.map["pincer" + S]].pos;
      seg(R, "claw" + S, pp, 0.035 * s, 0.03 * s, shell);
      R.add(
        "pincer" + S,
        P.xf(P.sphere(0.045 * s, 0.04 * s, 0.08 * s, 10, 7), 0, 0, -0.05 * s),
        shell,
      );
      claw(
        R,
        "pincer" + S,
        [
          [0, 0.015 * s, -0.11 * s],
          [sg * 0.02 * s, 0.02 * s, -0.17 * s],
          [-sg * 0.01 * s, 0.01 * s, -0.22 * s],
        ],
        0.018 * s,
        spike,
      );
      claw(
        R,
        "pincer" + S,
        [
          [0, -0.015 * s, -0.11 * s],
          [sg * 0.015 * s, -0.025 * s, -0.16 * s],
          [-sg * 0.01 * s, -0.015 * s, -0.2 * s],
        ],
        0.014 * s,
        spike,
      );
    }
    // ---- matriarch extras: rim spines, barnacles, egg clusters ----
    if (big) {
      for (let i = 0; i < 14; i++) {
        const a = -PI * 0.85 + (i / 13) * PI * 1.7,
          x = Math.sin(a) * 0.68 * s,
          z = -Math.cos(a) * 0.58 * s - 0.08 * s;
        if (z > 0.15 * s) continue;
        claw(
          R,
          "body",
          [
            [x, -0.03 * s, z],
            [x * 1.12, 0.0, z * 1.1 - 0.02 * s],
          ],
          0.02 * s,
          spike,
        );
      }
      const barn = {
        color: 0xd8d2c0,
        rough: 0.7,
        noise: 0.35,
        grad: [0.7, 1.1],
      };
      for (let i = 0; i < 22; i++) {
        const a = rng() * PI * 2,
          r = Math.sqrt(rng()) * 0.5;
        const x = Math.sin(a) * r * 0.6 * s,
          z = -Math.cos(a) * r * 0.5 * s - 0.08 * s;
        const y = 0.27 * s * Math.sqrt(Math.max(0, 1 - r * r)) - 0.03 * s;
        R.add(
          "body",
          P.xf(P.cyl(0.006 * s, 0.014 * s, 0.014 * s, 6), x, y + 0.004 * s, z),
          barn,
        );
      }
      const egg = {
        color: 0x5a8a7a,
        rough: 0.15,
        noise: 0.1,
        emis: 0.15,
        grad: [0.85, 1.1],
      };
      for (let i = 0; i < 26; i++) {
        const x = (rng() - 0.5) * 0.4 * s,
          z = (0.05 + rng() * 0.3) * s;
        R.add(
          "abdomen",
          P.xf(
            P.sphere(0.022 * s, 0.022 * s, 0.022 * s, 6, 5),
            x,
            -0.07 * s - rng() * 0.02 * s,
            z,
          ),
          egg,
        );
      }
    }
    // hit volumes / markers / sockets
    R.hitVol(
      "head",
      "head",
      [0, 0.12 * s, 0.05 * s],
      [0, 0.05 * s, -0.12 * s],
      0.18 * s,
    );
    R.hitVol(
      "torso",
      "body",
      [-0.35 * s, 0.05 * s, -0.05 * s],
      [0.35 * s, 0.05 * s, -0.05 * s],
      0.3 * s,
    );
    R.hitVol("torso", "abdomen", [0, 0, 0.0], [0, 0, 0.3 * s], 0.24 * s);
    R.hitVol("leftArm", "clawL", [0, 0, 0], [0, 0, -0.45 * s], 0.06 * s);
    R.hitVol("rightArm", "clawR", [0, 0, 0], [0, 0, -0.45 * s], 0.06 * s);
    for (let n = 1; n <= 4; n++)
      for (const [side, part] of [
        ["L", "leftLeg"],
        ["R", "rightLeg"],
      ])
        R.hitVol(
          part,
          "leg" + side + n,
          [0, 0, 0],
          R.bones[R.map["foot" + side + n]].pos,
          0.05 * s,
        );
    R.marker("head", "head", 0, 0.1 * s, -0.05 * s, 0.18 * s);
    R.marker("torso", "body", 0, 0.15 * s, 0, 0.45 * s);
    R.marker("leftArm", "pincerL", 0, 0, -0.1 * s, 0.07 * s);
    R.marker("rightArm", "pincerR", 0, 0, -0.1 * s, 0.07 * s);
    R.marker("leftLeg", "legL2", -0.3 * s, -0.05 * s, 0, 0.08 * s);
    R.marker("rightLeg", "legR2", 0.3 * s, -0.05 * s, 0, 0.08 * s);
    R.socket("eyes", "head", 0, 0.2 * s, 0.0);
    R.socket("muzzle", "head", 0, -0.06 * s, -0.12 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.22 * s,
      height: bh + 0.3 * s,
      hipH: bh,
      gore: "blue",
      dirt: [0.15, 0.4],
      cut: {
        head: "head",
        leftArm: "pincerL",
        rightArm: "pincerR",
        leftLeg: "footL2",
        rightLeg: "footR2",
      },
      style: { big },
    });
    return tpl;
  }
