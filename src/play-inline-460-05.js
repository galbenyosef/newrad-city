// play-inline-460 05 — ring
// Lines 796-1262 of readable/play-inline-460.pretty.js (statement-aligned).
  function buildRipjaw(opts, seed) {
    const rng = L.rng(seed);
    const s =
      opts.variant === "alpha"
        ? 1.15
        : opts.variant === "young"
          ? 0.75
          : rng.range(0.96, 1.04);
    const R = new L.Rig("quad");
    const bh = 0.6 * s;
    R.bone("hips", null, 0, bh, 0.5 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.52 * s, "torso");
    R.bone("chest", "spine", 0, 0.02 * s, -0.5 * s, "torso");
    R.bone("neck", "chest", 0, 0.03 * s, -0.36 * s, "head");
    R.bone("head", "neck", 0, 0.02 * s, -0.26 * s, "head");
    R.bone("jaw", "head", 0, -0.06 * s, 0.02 * s, "head");
    const legDef = [
      ["FL", -1, "chest", "leftArm", -0.06],
      ["FR", 1, "chest", "rightArm", -0.06],
      ["ML", -1, "spine", "leftLeg", 0.0],
      ["MR", 1, "spine", "rightLeg", 0.0],
      ["HL", -1, "hips", "leftLeg", 0.04],
      ["HR", 1, "hips", "rightLeg", 0.04],
    ];
    for (const [S, sg, par, part, dz] of legDef) {
      R.bone("upper" + S, par, sg * 0.2 * s, -0.06 * s, dz * s, part);
      R.bone("lower" + S, "upper" + S, sg * 0.3 * s, -0.1 * s, 0.0, part); // sprawled out to the side
      R.bone("paw" + S, "lower" + S, sg * 0.05 * s, -0.38 * s, -0.04 * s, part);
    }
    R.bone("tail1", "hips", 0, -0.02 * s, 0.32 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.06 * s, 0.48 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.07 * s, 0.46 * s, "torso");
    R.bone("tail4", "tail3", 0, -0.04 * s, 0.42 * s, "torso");
    const albino = opts.variant === "albino";
    const hideC = albino ? 0xb8b2a4 : rng.pick([0x4a4d46, 0x51503f, 0x43473f]);
    const bellyC = albino ? 0xdcd4c4 : 0x9a8e72;
    const bandC = L.col(albino ? 0xa89880 : 0x6e5634);
    const hideP = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (ny < -0.35) {
        const c = L.col(bellyC);
        const k = smoothstep(-0.35, -0.75, ny);
        out[0] = lerp(out[0], c.r, k);
        out[1] = lerp(out[1], c.g, k);
        out[2] = lerp(out[2], c.b, k);
      }
      const band = Math.sin(
        (wz * 3.2) / s + L.noise3(wx * 2, wy * 2, wz * 2) * 2,
      );
      if (band > 0.75 && ny > -0.2) {
        out[0] = lerp(out[0], bandC.r, 0.45);
        out[1] = lerp(out[1], bandC.g, 0.45);
        out[2] = lerp(out[2], bandC.b, 0.45);
      } // rusty cross-bands
      const n = L.noise3(wx * 7, wy * 7, wz * 7);
      if (n > 0.62) {
        out[0] *= 0.82;
        out[1] *= 0.8;
        out[2] *= 0.78;
      }
    };
    const hm = {
      color: hideC,
      region: "scales",
      rough: 0.62,
      noise: 0.18,
      paint: hideP,
      grad: [0.8, 1.1],
    };
    const scuteC = albino ? 0x9a9488 : L.shade(hideC, 0.72);
    const scute = {
      color: scuteC,
      region: "shell",
      rough: 0.7,
      noise: 0.25,
      grad: [0.75, 1.15],
      rigid: true,
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        if (L.noise3(wx * 13, wy * 13, wz * 13) > 0.6) {
          out[0] = out[0] * 0.7 + 0.12;
          out[1] = out[1] * 0.7 + 0.1;
          out[2] = out[2] * 0.7 + 0.07;
        } // worn ochre ridges
      },
    };
    const tooth = {
      color: 0xd8ceb2,
      rough: 0.35,
      noise: 0.1,
      grad: [0.6, 1.1],
      region: "grime",
    };
    const bw = (n) => R.world(n);
    // ---- body: one long low loft split over hips / spine / chest ----
    const hw = bw("hips"),
      sw = bw("spine"),
      cw = bw("chest");
    const ring = (z, rx, ry, oy) => ({
      z,
      rx: rx * s,
      ry: ry * s,
      oy: (oy || 0) * s,
      n: 2.3,
    });
    R.addW(
      "hips",
      P.xf(
        bodyZ([
          ring(0.42, 0.2, 0.17, -0.02),
          ring(0.25, 0.3, 0.22),
          ring(0.0, 0.36, 0.25),
          ring(-0.28, 0.38, 0.26),
        ]),
        0,
        hw[1],
        hw[2],
      ),
      hm,
    );
    R.addW(
      "spine",
      P.xf(
        bodyZ([
          ring(0.24, 0.38, 0.26),
          ring(0.0, 0.4, 0.27),
          ring(-0.26, 0.39, 0.27),
        ]),
        0,
        sw[1],
        sw[2],
      ),
      hm,
    );
    R.addW(
      "chest",
      P.xf(
        bodyZ([
          ring(0.24, 0.39, 0.27),
          ring(0.0, 0.36, 0.26),
          ring(-0.22, 0.27, 0.21, 0.01),
          ring(-0.36, 0.2, 0.17, 0.02),
        ]),
        0,
        cw[1],
        cw[2],
      ),
      hm,
    );
    // neck + head: broad flat skull, raised eye turrets, very long narrow snout
    const nw = bw("neck");
    R.addW(
      "neck",
      P.xf(
        bodyZ([
          ring(0.14, 0.2, 0.17, 0.0),
          ring(-0.06, 0.17, 0.14, 0.01),
          ring(-0.24, 0.15, 0.12, 0.01),
        ]),
        0,
        nw[1],
        nw[2],
      ),
      hm,
    );
    const skullG = bodyZ(
      [
        ring(0.06, 0.15, 0.12, 0.0),
        ring(-0.06, 0.16, 0.1, 0.02),
        ring(-0.16, 0.11, 0.07, 0.0),
        ring(-0.3, 0.075, 0.05, -0.01),
        ring(-0.62, 0.06, 0.04, -0.01),
        ring(-0.82, 0.055, 0.04, -0.01),
        ring(-0.88, 0.07, 0.045, -0.01),
        ring(-0.93, 0.045, 0.03, -0.01),
      ],
      { seg: 14 },
    );
    R.add("head", skullG, hm);
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.sphere(0.04 * s, 0.035 * s, 0.045 * s, 10, 7),
          sg * 0.08 * s,
          0.1 * s,
          -0.08 * s,
        ),
        hm,
      ); // eye turret
      R.add(
        "head",
        P.xf(
          P.sphere(0.02 * s, 0.017 * s, 0.02 * s, 8, 6),
          sg * 0.1 * s,
          0.11 * s,
          -0.1 * s,
        ),
        { color: 0xe0a020, emis: 0.9, rough: 0.15, noise: 0.05 },
      );
      R.add(
        "head",
        P.xf(
          P.box(0.05 * s, 0.012 * s, 0.03 * s, 0.006 * s),
          sg * 0.09 * s,
          0.13 * s,
          -0.1 * s,
          0.2,
          sg * 0.2,
          0,
        ),
        scute,
      ); // brow scute
      R.add(
        "head",
        P.xf(
          P.sphere(0.012 * s, 0.008 * s, 0.01 * s, 6, 4),
          sg * 0.025 * s,
          0.045 * s,
          -0.9 * s,
        ),
        { color: 0x151008, rough: 1 },
      ); // nostrils
    }
    // upper teeth: long interlocking row along both sides of the snout
    for (let i = 0; i < 16; i++) {
      const z = (-0.2 - i * 0.046) * s,
        sg = i % 2 ? 1 : -1,
        x = sg * lerp(0.07, 0.045, i / 15) * s,
        len = (i % 3 === 0 ? 0.05 : 0.035) * s;
      claw(
        R,
        "head",
        [
          [x, -0.02 * s, z],
          [x * 1.15, -0.02 * s - len, z],
        ],
        0.008 * s,
        tooth,
        4,
      );
    }
    // lower jaw: long narrow, on the jaw bone (hinged at the back of the skull)
    const jawG = bodyZ(
      [
        ring(0.0, 0.12, 0.05, -0.02),
        ring(-0.14, 0.085, 0.04, -0.01),
        ring(-0.4, 0.055, 0.03, 0.0),
        ring(-0.8, 0.05, 0.03, 0.0),
        ring(-0.88, 0.035, 0.02, 0.0),
      ],
      { seg: 12 },
    );
    R.add("jaw", P.xf(jawG, 0, -0.005 * s, -0.08 * s), hm);
    for (let i = 0; i < 14; i++) {
      const z = (-0.26 - i * 0.046) * s,
        sg = i % 2 ? -1 : 1,
        x = sg * lerp(0.06, 0.04, i / 13) * s,
        len = (i % 3 === 1 ? 0.05 : 0.034) * s;
      claw(
        R,
        "jaw",
        [
          [x, 0.015 * s, z],
          [x * 1.18, 0.015 * s + len, z],
        ],
        0.008 * s,
        tooth,
        4,
      );
    }
    // ---- armoured back: overlapping keeled scutes in three rows, nape → tail ----
    const scuteAt = (bone, x, y, z, w, l, h, rx, rz) => {
      const g = P.box(w, h, l, Math.min(w, h, l) * 0.35, 2);
      P.deform(g, (v) => {
        if (v.y > 0) v.y += (1 - Math.abs(v.x) / (w * 0.5)) * h * 0.9;
        if (v.z > 0) v.y -= (v.z / l) * h * 0.6;
      }); // keel ridge, overlap step
      R.addW(bone, P.xf(g, x, y, z, rx || 0, 0, rz || 0), scute);
    };
    const backRows = [
      ["chest", cw, [-0.3, -0.15, 0.0, 0.15], 0.27],
      ["spine", sw, [-0.2, -0.05, 0.1, 0.24], 0.28],
      ["hips", hw, [-0.22, -0.08, 0.06, 0.2, 0.34], 0.26],
    ];
    for (const [bone, w, zs, top] of backRows)
      for (const dz of zs)
        for (const col of [-1, 0, 1]) {
          const wide = col === 0 ? 0.17 : 0.14;
          scuteAt(
            bone,
            col * 0.17 * s,
            w[1] + (top - Math.abs(col) * 0.045) * s,
            w[2] + dz * s,
            wide * s,
            0.17 * s,
            0.035 * s,
            0,
            -col * 0.35,
          );
        }
    for (const dz of [0.1, -0.06, -0.2])
      for (const col of [-1, 1])
        scuteAt(
          "neck",
          col * 0.08 * s,
          nw[1] + 0.15 * s,
          nw[2] + dz * s,
          0.1 * s,
          0.13 * s,
          0.03 * s,
          0,
          -col * 0.3,
        );
    // ---- tail: tapering, with a double crest of tall scutes ----
    const tr = [0.2, 0.15, 0.1, 0.065, 0.03];
    const tlen = [0.48, 0.46, 0.42, 0.38];
    for (let i = 1; i <= 4; i++) {
      const len = tlen[i - 1] * s;
      const g = P.limb(len, tr[i - 1] * s, tr[i] * s, { seg: 10, flat: 1.0 });
      g.scale(1, 1, 1);
      g.rotateX(-PI / 2);
      R.add("tail" + i, P.xf(g, 0, 0, 0, 0, 0, 0, 1.15, 0.9, 1), hm);
      for (let j = 0; j < 3; j++)
        for (const sg of [-1, 1]) {
          const z = ((j + 0.5) / 3) * len,
            r = lerp(tr[i - 1], tr[i], (j + 0.5) / 3) * s;
          const h = (0.06 - i * 0.008) * s;
          const g2 = P.box(0.02 * s, h, 0.1 * s, 0.006 * s);
          P.deform(g2, (v) => {
            if (v.y > 0) v.z -= (v.y / h) * 0.03 * s;
          });
          R.add(
            "tail" + i,
            P.xf(g2, sg * r * 0.35, r * 0.8 + h * 0.4, z, 0, 0, -sg * 0.25),
            scute,
          );
        }
    }
    // ---- legs: thick sprawled limbs, wide five-clawed feet ----
    for (const [S, sg] of legDef.map((d) => [d[0], d[1]])) {
      const lp = R.bones[R.map["lower" + S]].pos,
        pp = R.bones[R.map["paw" + S]].pos;
      const rear = S[0] === "H",
        mid = S[0] === "M";
      const k = rear ? 1.15 : mid ? 1.0 : 0.95;
      seg(R, "upper" + S, lp, 0.14 * s * k, 0.1 * s * k, hm, {
        bulge: 0.03 * s,
      });
      R.add(
        "lower" + S,
        P.xf(
          P.sphere(0.085 * s * k, 0.08 * s * k, 0.085 * s * k, 10, 7),
          0,
          0,
          0,
        ),
        hm,
      );
      seg(R, "lower" + S, pp, 0.095 * s * k, 0.07 * s * k, hm, {
        bulge: 0.015 * s,
      });
      R.add(
        "lower" + S,
        P.xf(
          P.box(0.07 * s, 0.14 * s, 0.03 * s, 0.01 * s),
          sg * 0.035 * s,
          -0.12 * s,
          0.03 * s,
          0,
          0,
          sg * 0.15,
        ),
        scute,
      ); // forearm scute
      const foot = P.box(0.13 * s * k, 0.05 * s, 0.16 * s * k, 0.025 * s);
      R.add("paw" + S, P.xf(foot, 0, -0.02 * s, -0.04 * s), hm);
      for (let i = 0; i < 5; i++) {
        const fx = (i - 2) * 0.03 * s * k,
          a = (i - 2) * 0.25;
        claw(
          R,
          "paw" + S,
          [
            [fx, -0.03 * s, -0.1 * s],
            [fx + Math.sin(a) * 0.05 * s, -0.04 * s, -0.16 * s],
            [fx + Math.sin(a) * 0.07 * s, -0.06 * s, -0.2 * s],
          ],
          0.014 * s,
          { color: 0x2a2620, rough: 0.4, noise: 0.1 },
          4,
        );
      }
    }
    // hit volumes / markers / sockets
    R.hitVol("head", "head", [0, 0.02 * s, 0], [0, 0, -0.7 * s], 0.11 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.02 * s, 0.3 * s],
      [0, 0.02 * s, -0.2 * s],
      0.28 * s,
    );
    R.hitVol(
      "torso",
      "spine",
      [0, 0.02 * s, 0.2 * s],
      [0, 0.02 * s, -0.2 * s],
      0.3 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.02 * s, 0.2 * s],
      [0, 0.02 * s, -0.3 * s],
      0.29 * s,
    );
    R.hitVol("torso", "neck", [0, 0, 0.1 * s], [0, 0, -0.2 * s], 0.17 * s);
    for (const [S, part] of [
      ["FL", "leftArm"],
      ["FR", "rightArm"],
      ["ML", "leftLeg"],
      ["MR", "rightLeg"],
      ["HL", "leftLeg"],
      ["HR", "rightLeg"],
    ]) {
      R.hitVol(
        part,
        "upper" + S,
        [0, 0, 0],
        R.bones[R.map["lower" + S]].pos,
        0.09 * s,
      );
      R.hitVol(
        part,
        "lower" + S,
        [0, 0, 0],
        R.bones[R.map["paw" + S]].pos,
        0.07 * s,
      );
    }
    R.marker("head", "head", 0, 0.03 * s, -0.25 * s, 0.16 * s);
    R.marker("torso", "spine", 0, 0.05 * s, 0, 0.4 * s);
    R.marker("leftArm", "upperFL", -0.15 * s, -0.1 * s, 0, 0.1 * s);
    R.marker("rightArm", "upperFR", 0.15 * s, -0.1 * s, 0, 0.1 * s);
    R.marker("leftLeg", "upperHL", -0.15 * s, -0.1 * s, 0, 0.1 * s);
    R.marker("rightLeg", "upperHR", 0.15 * s, -0.1 * s, 0, 0.1 * s);
    R.socket("eyes", "head", 0, 0.1 * s, -0.12 * s);
    R.socket("muzzle", "head", 0, -0.02 * s, -0.9 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.3 * s,
      height: 1.0 * s,
      hipH: bh,
      gore: "red",
      dirt: [0.2, 0.5],
      cut: {
        head: "head",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: { tailUp: -0.05, wag: false, pant: false, stride: 0.8 },
    });
    return tpl;
  }
