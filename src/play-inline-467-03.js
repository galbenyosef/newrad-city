// play-inline-467 03 — add
// Lines 104-621 of readable/play-inline-467.pretty.js (statement-aligned).
  function buildThinker(opts, seed) {
    const rng = L.rng(seed);
    const b = H.proportions("m", { scale: 1.0, shoulderMul: 1.2 });
    b.hipH = 0.5;
    b.spine = 0.08;
    b.chest = 0.3;
    b.neckY = 0.42;
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const s = b.s;
    for (const [S, part] of [
      ["L", "leftArm"],
      ["R", "rightArm"],
    ])
      R.bone("pincer" + S, "hand" + S, 0, -0.035 * s, 0.028 * s, part);
    const cabC = rng.pick([0x8c8a7a, 0x7d8478, 0x9a9282]);
    const cab = paint(cabC, { rough: 0.5 }),
      dark = metal(0x262624, { rough: 0.6 }),
      trim = metal(0x6a6a62),
      chrome = metal(0xb8b8b0, { rough: 0.25, metal: 0.85 });
    const tread = { color: 0x1a1a18, region: "tire", rough: 0.9, noise: 0.1 };
    // ---- tread base (on the hips: it doesn't swing) ----
    const hy = -b.hipH;
    for (const sg of [-1, 1]) {
      const x = sg * 0.2 * s;
      R.add(
        "hips",
        P.xf(
          P.box(0.12 * s, 0.22 * s, 0.66 * s, 0.1 * s),
          x,
          hy + 0.12 * s,
          0.0,
        ),
        tread,
      );
      for (let i = 0; i < 3; i++)
        R.add(
          "hips",
          P.xf(
            P.cyl(0.075 * s, 0.075 * s, 0.13 * s, 12),
            x,
            hy + 0.1 * s,
            (-0.2 + i * 0.2) * s,
            0,
            0,
            PI / 2,
          ),
          trim,
        );
    }
    R.add(
      "hips",
      P.xf(P.box(0.32 * s, 0.16 * s, 0.5 * s, 0.04 * s), 0, hy + 0.3 * s, 0),
      dark,
    );
    R.add(
      "hips",
      P.xf(P.box(0.5 * s, 0.08 * s, 0.4 * s, 0.03 * s), 0, -0.04 * s, 0),
      trim,
    ); // plinth
    // ---- cabinet (spine + chest): tall mainframe box ----
    R.add(
      "spine",
      P.xf(
        P.box(0.46 * s, b.spine + 0.02 * s, 0.34 * s, 0.02 * s),
        0,
        b.spine * 0.5,
        0,
      ),
      dark,
    );
    const cabG = P.box(0.5 * s, 0.68 * s, 0.36 * s, 0.03 * s, 3);
    R.add("chest", P.xf(cabG, 0, 0.12 * s, 0), cab);
    // front panel: two tape-reel windows, lamp matrix, card slot, maker plate, emitter dish
    R.add(
      "chest",
      P.xf(
        P.box(0.42 * s, 0.24 * s, 0.02 * s, 0.01 * s),
        0,
        0.3 * s,
        -0.18 * s,
      ),
      dark,
    );
    for (const sg of [-1, 1]) {
      const cx = sg * 0.1 * s,
        cy = 0.3 * s;
      R.add(
        "chest",
        P.xf(
          P.cyl(0.085 * s, 0.085 * s, 0.012 * s, 22),
          cx,
          cy,
          -0.19 * s,
          PI / 2,
          0,
          0,
        ),
        metal(0x14181a, { rough: 0.08, metal: 0.4 }),
      );
      R.add(
        "chest",
        P.xf(P.torus(0.086 * s, 0.008 * s, 5, 22), cx, cy, -0.196 * s),
        chrome,
      );
      R.add(
        "chest",
        P.xf(
          P.cyl(0.065 * s, 0.065 * s, 0.006 * s, 18),
          cx,
          cy,
          -0.199 * s,
          PI / 2,
          0,
          0,
        ),
        metal(0x8a8a84, { rough: 0.3, metal: 0.7 }),
      ); // reel flange
      R.add(
        "chest",
        P.xf(
          P.cyl(0.018 * s, 0.018 * s, 0.01 * s, 10),
          cx,
          cy,
          -0.204 * s,
          PI / 2,
          0,
          0,
        ),
        dark,
      );
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * PI * 2 + (sg > 0 ? 0.5 : 0);
        R.add(
          "chest",
          P.xf(
            P.box(0.022 * s, 0.022 * s, 0.006 * s, 0.006 * s),
            cx + Math.cos(a) * 0.04 * s,
            cy + Math.sin(a) * 0.04 * s,
            -0.204 * s,
          ),
          dark,
        );
      } // reel holes
    }
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 2; j++) {
        const lit = L.hash3(i * 3.1, j * 7.7, seed % 97) > 0.4;
        R.add(
          "chest",
          P.xf(
            P.cyl(0.011 * s, 0.011 * s, 0.01 * s, 8),
            (-0.175 + i * 0.05) * s,
            (0.12 - j * 0.035) * s,
            -0.185 * s,
            PI / 2,
            0,
            0,
          ),
          lit ? light(j ? 0xffb040 : i % 3 ? 0xff5030 : 0x70e070, 1.6) : dark,
        );
      }
    R.add(
      "chest",
      P.xf(
        P.box(0.2 * s, 0.014 * s, 0.01 * s, 0.003 * s),
        0,
        0.04 * s,
        -0.183 * s,
      ),
      { color: 0x0a0a0a, rough: 0.9 },
    ); // punch-card slot
    R.decal(
      "chest",
      "maker",
      0.18 * s,
      0.05 * s,
      0,
      -0.04 * s,
      -0.182 * s,
      0,
      0,
      0,
    );
    // emitter dish on the lower front
    R.add(
      "chest",
      P.xf(
        P.cyl(0.02 * s, 0.03 * s, 0.06 * s, 10),
        0,
        -0.13 * s,
        -0.2 * s,
        PI / 2,
        0,
        0,
      ),
      dark,
    );
    R.add(
      "chest",
      P.xf(
        P.lathe(
          [
            [0.001, 0],
            [0.05, 0.005],
            [0.075, 0.025],
            [0.07, 0.03],
            [0.045, 0.012],
            [0.001, 0.008],
          ].map((q) => [q[0] * s, q[1] * s]),
          18,
        ),
        0,
        -0.13 * s,
        -0.23 * s,
        -PI / 2,
        0,
        0,
      ),
      chrome,
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.006 * s, 0.006 * s, 0.05 * s, 6),
        0,
        -0.13 * s,
        -0.25 * s,
        PI / 2,
        0,
        0,
      ),
      chrome,
    );
    R.add(
      "chest",
      P.xf(
        P.sphere(0.012 * s, 0.012 * s, 0.012 * s, 8, 6),
        0,
        -0.13 * s,
        -0.276 * s,
      ),
      light(0x9ae0ff, 2.4),
    );
    // side vents + back cable bundle
    for (const sg of [-1, 1])
      for (let i = 0; i < 6; i++)
        R.add(
          "chest",
          P.xf(
            P.box(0.01 * s, 0.012 * s, 0.24 * s, 0.003 * s),
            sg * 0.252 * s,
            (-0.05 + i * 0.05) * s,
            0,
          ),
          dark,
        );
    for (let i = 0; i < 3; i++)
      R.add(
        "chest",
        P.sweep(
          [
            [(-0.08 + i * 0.08) * s, 0.4 * s, 0.17 * s],
            [(-0.08 + i * 0.08) * s, 0.1 * s, 0.24 * s],
            [(-0.06 + i * 0.06) * s, -0.3 * s, 0.2 * s],
          ],
          0.014 * s,
          { seg: 8, rs: 5 },
        ),
        { color: 0x2a2018, rough: 0.7 },
      );
    // ---- head: a flat-topped VALVE RACK — two rows of glowing vacuum tubes standing in an
    //      open rectangular steel frame on a square chassis plate, a louvred hood over the back ----
    R.add(
      "neck",
      P.xf(P.box(0.4 * s, 0.05 * s, 0.3 * s, 0.01 * s), 0, -0.02 * s, 0),
      trim,
    );
    const hs = s;
    R.add(
      "head",
      P.xf(P.box(0.46 * hs, 0.045 * hs, 0.32 * hs, 0.012 * hs), 0, 0.0, 0),
      dark,
    );
    const tubeGlass = {
      color: 0xd8c8a8,
      rough: 0.08,
      metal: 0.1,
      emis: 0.35,
      noise: 0.02,
      grad: [0.9, 1.15],
    };
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 5; i++) {
        const x = (-0.16 + i * 0.08) * hs,
          z = (row ? 0.05 : -0.07) * hs,
          h = (row ? 0.15 : 0.12) * hs;
        R.add(
          "head",
          P.xf(P.cyl(0.022 * hs, 0.024 * hs, 0.02 * hs, 8), x, 0.03 * hs, z),
          dark,
        ); // tube socket
        R.add(
          "head",
          P.xf(P.cyl(0.018 * hs, 0.02 * hs, h, 10), x, 0.04 * hs + h / 2, z),
          tubeGlass,
        ); // glass envelope
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.018 * hs,
              0.012 * hs,
              0.018 * hs,
              8,
              4,
              0,
              PI * 2,
              0,
              PI / 2,
            ),
            x,
            0.04 * hs + h,
            z,
          ),
          tubeGlass,
        ); // tip
        R.add(
          "head",
          P.xf(
            P.cyl(0.008 * hs, 0.008 * hs, h * 0.55, 6),
            x,
            0.04 * hs + h * 0.45,
            z,
          ),
          light(0xff8a30, 2.4),
        ); // glowing filament
      }
    // open frame: four corner posts, flat top rails (square, not a dome)
    const fx = 0.215 * hs,
      fz = 0.145 * hs,
      ft = 0.22 * hs;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        R.add(
          "head",
          P.xf(
            P.box(0.016 * hs, ft, 0.016 * hs, 0.003 * hs),
            sx * fx,
            ft / 2,
            sz * fz,
          ),
          chrome,
        );
    for (const sz of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.box(fx * 2 + 0.016 * hs, 0.014 * hs, 0.014 * hs, 0.003 * hs),
          0,
          ft,
          sz * fz,
        ),
        chrome,
      );
    for (const sx of [-1, 1])
      R.add(
        "head",
        P.xf(P.box(0.014 * hs, 0.014 * hs, fz * 2, 0.003 * hs), sx * fx, ft, 0),
        chrome,
      );
    // louvred hood over the back row (sheet-steel shade with slots)
    R.add(
      "head",
      P.xf(
        P.box(fx * 2, 0.012 * hs, 0.13 * hs, 0.004 * hs),
        0,
        ft + 0.012 * hs,
        0.08 * hs,
        -0.12,
        0,
        0,
      ),
      cab,
    );
    for (let i = 0; i < 4; i++)
      R.add(
        "head",
        P.xf(
          P.box(fx * 1.8, 0.004 * hs, 0.012 * hs, 0.001),
          0,
          ft + 0.02 * hs,
          (0.035 + i * 0.03) * hs,
          -0.12,
          0,
          0,
        ),
        dark,
      );
    // a front gauge strip with a needle
    R.add(
      "head",
      P.xf(
        P.box(0.3 * hs, 0.03 * hs, 0.01 * hs, 0.004 * hs),
        0,
        0.0,
        -0.165 * hs,
      ),
      metal(0x14181a, { rough: 0.1, metal: 0.4 }),
    );
    R.add(
      "head",
      P.xf(
        P.box(0.004 * hs, 0.024 * hs, 0.004 * hs, 0.001),
        0.05 * hs,
        0.0,
        -0.172 * hs,
        0,
        0,
        0.5,
      ),
      light(0xffb040, 1.6),
    );
    // ---- arms: telescoping tubes from the cabinet shoulders, clamp pincers ----
    for (const [S] of [["L"], ["R"]]) {
      R.add(
        "arm" + S,
        P.xf(P.box(0.1 * s, 0.1 * s, 0.12 * s, 0.025 * s), 0, 0, 0),
        cab,
      );
      seg(R, "arm" + S, [0, -b.upper, 0], 0.035 * s, 0.03 * s, chrome);
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.045 * s, 0.045 * s, 0.07 * s, 10), 0, 0, 0, 0, 0, PI / 2),
        dark,
      );
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.042 * s, 0.05 * s, b.fore * 0.8, 10), 0, -b.fore * 0.5, 0),
        cab,
      );
      R.add(
        "hand" + S,
        P.xf(P.cyl(0.04 * s, 0.033 * s, 0.05 * s, 10), 0, -0.02 * s, 0),
        trim,
      );
      R.add(
        "hand" + S,
        P.sweep(
          [
            [0, -0.03 * s, -0.022 * s],
            [0, -0.09 * s, -0.045 * s],
            [0, -0.14 * s, -0.014 * s],
          ],
          (t) => (0.016 - t * 0.009) * s,
          { seg: 6, rs: 6 },
        ),
        chrome,
      );
      R.add(
        "pincer" + S,
        P.sweep(
          [
            [0, 0, 0],
            [0, -0.06 * s, 0.02 * s],
            [0, -0.11 * s, -0.012 * s],
          ],
          (t) => (0.016 - t * 0.009) * s,
          { seg: 6, rs: 6 },
        ),
        chrome,
      );
    }
    R.socket("muzzle", "chest", 0, -0.13 * s, -0.28 * s);
    R.socket("eyes", "chest", 0, 0.3 * s, -0.2 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.22 * s,
      noFootIK: true,
      dirt: [0.2, 0.5],
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: null,
        rightLeg: null,
      },
    });
    tpl.markers.leftLeg = {
      bone: 0,
      pos: [-0.2 * s, -b.hipH + 0.12 * s, 0],
      r: 0.12 * s,
    };
    tpl.markers.rightLeg = {
      bone: 0,
      pos: [0.2 * s, -b.hipH + 0.12 * s, 0],
      r: 0.12 * s,
    };
    tpl.hit = tpl.hit.filter(
      (h) => h.part !== "leftLeg" && h.part !== "rightLeg",
    );
    tpl.hit.push({
      part: "leftLeg",
      bone: 0,
      a: [-0.2 * s, -b.hipH + 0.12 * s, -0.28 * s],
      b: [-0.2 * s, -b.hipH + 0.12 * s, 0.28 * s],
      r: 0.11 * s,
    });
    tpl.hit.push({
      part: "rightLeg",
      bone: 0,
      a: [0.2 * s, -b.hipH + 0.12 * s, -0.28 * s],
      b: [0.2 * s, -b.hipH + 0.12 * s, 0.28 * s],
      r: 0.11 * s,
    });
    return tpl;
  }
