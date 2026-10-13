// play-inline-466 07 — add
// Lines 1501-1868 of readable/play-inline-466.pretty.js (statement-aligned).
  function buildBulwark(opts, seed) {
    const b = H.proportions("m", { scale: 1.25, shoulderMul: 1.35 });
    b.hipH = 0.5 * b.s;
    b.chest = 0.13 * b.s;
    const R = new L.Rig("biped");
    H.skeleton(R, b);
    const s = b.s;
    const hull = paint(0x56593f, { rough: 0.55 }),
      dark = metal(0x232422, { rough: 0.6 }),
      trim = metal(0x67675e);
    const hy = -b.hipH;
    // ---- running gear: two long treads with road wheels, sprocket, idler ----
    for (const sg of [-1, 1]) {
      const x = sg * 0.33 * s;
      const tr = P.box(0.2 * s, 0.34 * s, 1.15 * s, 0.15 * s, 3);
      R.add("hips", P.xf(tr, x, hy + 0.18 * s, 0.02 * s), rubber);
      for (let i = 0; i < 5; i++)
        R.add(
          "hips",
          P.xf(
            P.cyl(0.09 * s, 0.09 * s, 0.21 * s, 14),
            x,
            hy + 0.13 * s,
            (-0.38 + i * 0.19) * s,
            0,
            0,
            PI / 2,
          ),
          trim,
        );
      R.add(
        "hips",
        P.xf(
          P.cyl(0.12 * s, 0.12 * s, 0.215 * s, 12),
          x,
          hy + 0.24 * s,
          -0.47 * s,
          0,
          0,
          PI / 2,
        ),
        dark,
      ); // drive sprocket
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * PI * 2;
        R.add(
          "hips",
          P.xf(
            P.box(0.22 * s, 0.03 * s, 0.03 * s, 0.006 * s),
            x,
            hy + 0.24 * s + Math.cos(a) * 0.12 * s,
            -0.47 * s + Math.sin(a) * 0.12 * s,
            a,
            0,
            0,
          ),
          dark,
        );
      }
      R.add(
        "hips",
        P.xf(
          P.box(0.03 * s, 0.16 * s, 1.05 * s, 0.01 * s),
          x + sg * 0.115 * s,
          hy + 0.29 * s,
          0.02 * s,
        ),
        hull,
      ); // side skirt
      for (let i = 0; i < 4; i++)
        R.add(
          "hips",
          P.xf(
            P.cyl(0.012 * s, 0.012 * s, 0.01 * s, 6),
            x + sg * 0.132 * s,
            hy + 0.33 * s,
            (-0.33 + i * 0.22) * s,
            0,
            0,
            PI / 2,
          ),
          trim,
        );
    }
    // ---- hull: squat armoured box with a sloped glacis, headlights, tow hooks ----
    const hullG = P.box(0.5 * s, 0.26 * s, 1.0 * s, 0.05 * s, 3);
    P.deform(hullG, (v) => {
      if (v.z < -0.25 * s && v.y > 0) v.y -= (-v.z - 0.25 * s) * 0.6;
    });
    R.add("hips", P.xf(hullG, 0, hy + 0.42 * s, 0.02 * s), hull);
    R.decal(
      "hips",
      "hazard",
      0.36 * s,
      0.05 * s,
      0,
      hy + 0.36 * s,
      -0.485 * s,
      0,
      0,
      0,
    );
    for (const sg of [-1, 1]) {
      R.add(
        "hips",
        P.xf(
          P.cyl(0.035 * s, 0.04 * s, 0.04 * s, 12),
          sg * 0.17 * s,
          hy + 0.43 * s,
          -0.47 * s,
          PI / 2,
          0,
          0,
        ),
        dark,
      );
      R.add(
        "hips",
        P.xf(
          P.cyl(0.03 * s, 0.03 * s, 0.006 * s, 12),
          sg * 0.17 * s,
          hy + 0.43 * s,
          -0.492 * s,
          PI / 2,
          0,
          0,
        ),
        light(0xfff0c0, 1.6),
      );
    }
    R.add(
      "hips",
      P.xf(P.cyl(0.18 * s, 0.22 * s, 0.1 * s, 20), 0, -0.02 * s, 0),
      trim,
    ); // turret ring
    // ---- turret (spine + chest): faceted, low, wide ----
    R.add(
      "spine",
      P.xf(
        P.cyl(0.2 * s, 0.22 * s, b.spine + 0.04 * s, 18),
        0,
        b.spine * 0.5,
        0,
      ),
      dark,
    );
    const tur = P.loft(
      [
        { y: -0.12 * s, rx: 0.36 * s, rz: 0.4 * s, n: 3.2 },
        { y: 0.06 * s, rx: 0.42 * s, rz: 0.46 * s, n: 3.4 },
        { y: 0.2 * s, rx: 0.36 * s, rz: 0.4 * s, n: 3.2 },
        { y: 0.26 * s, rx: 0.26 * s, rz: 0.3 * s, n: 2.8 },
      ],
      { seg: 24, capTop: true, capBottom: true },
    );
    P.deform(tur, (v) => {
      if (v.z < 0) v.z *= 1.12;
    });
    R.add("chest", P.xf(tur, 0, 0.0, 0.03 * s), hull);
    R.decal(
      "chest",
      "maker",
      0.22 * s,
      0.06 * s,
      0,
      0.05 * s,
      -0.505 * s,
      0.1,
      0,
      0,
    );
    for (let i = 0; i < 6; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.32 * s, 0.014 * s, 0.03 * s, 0.004 * s),
          0,
          (-0.05 + i * 0.04) * s,
          0.47 * s,
          0.5,
          0,
          0,
        ),
        dark,
      ); // rear vents
    R.add(
      "chest",
      P.xf(P.box(0.2 * s, 0.14 * s, 0.14 * s, 0.03 * s), 0, 0.02 * s, 0.5 * s),
      dark,
    ); // bustle / battery
    R.add(
      "chest",
      P.xf(
        P.cyl(0.03 * s, 0.03 * s, 0.01 * s, 10),
        0,
        0.02 * s,
        0.575 * s,
        PI / 2,
        0,
        0,
      ),
      light(0xff8030, 1.4),
    );
    // ---- head: periscope / commander's sensor block on the turret roof ----
    R.add(
      "neck",
      P.xf(P.cyl(0.07 * s, 0.08 * s, 0.1 * s, 12), 0, 0.0, 0),
      dark,
    );
    R.add(
      "head",
      P.xf(P.box(0.2 * s, 0.12 * s, 0.18 * s, 0.03 * s), 0, 0.04 * s, 0),
      hull,
    );
    R.add(
      "head",
      P.xf(
        P.box(0.16 * s, 0.04 * s, 0.02 * s, 0.008 * s),
        0,
        0.05 * s,
        -0.09 * s,
      ),
      dark,
    );
    R.add(
      "head",
      P.xf(
        P.box(0.14 * s, 0.018 * s, 0.01 * s, 0.004 * s),
        0,
        0.05 * s,
        -0.1 * s,
      ),
      light(0xff3a1a, 2.6),
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.02 * s, 0.02 * s, 0.18 * s, 8),
        0.07 * s,
        0.18 * s,
        0.05 * s,
      ),
      trim,
    ); // periscope mast
    R.add(
      "head",
      P.xf(
        P.box(0.06 * s, 0.05 * s, 0.07 * s, 0.01 * s),
        0.07 * s,
        0.28 * s,
        0.04 * s,
      ),
      dark,
    );
    R.add(
      "head",
      P.xf(
        P.box(0.045 * s, 0.022 * s, 0.01 * s, 0.004 * s),
        0.07 * s,
        0.28 * s,
        0.003 * s,
      ),
      light(0x6ad0ff, 1.8),
    );
    // ---- weapons (arms held forward): twin cannon (L), rocket box (R) ----
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      R.add(
        "arm" + S,
        P.xf(P.cyl(0.11 * s, 0.11 * s, 0.16 * s, 14), 0, 0, 0, 0, 0, PI / 2),
        trim,
      ); // trunnion
      R.add(
        "arm" + S,
        P.xf(P.box(0.15 * s, b.upper, 0.17 * s, 0.03 * s), 0, -b.upper / 2, 0),
        hull,
      );
      R.add(
        "forearm" + S,
        P.xf(P.box(0.17 * s, b.fore, 0.19 * s, 0.03 * s), 0, -b.fore / 2, 0),
        dark,
      );
    }
    for (const dx of [-0.04, 0.04]) {
      R.add(
        "handL",
        P.xf(P.cyl(0.026 * s, 0.03 * s, 0.5 * s, 10), dx * s, -0.25 * s, 0),
        metal(0x34352f, { rough: 0.35 }),
      );
      R.add(
        "handL",
        P.xf(P.cyl(0.036 * s, 0.036 * s, 0.07 * s, 10), dx * s, -0.47 * s, 0),
        trim,
      ); // muzzle brakes
    }
    R.add(
      "handR",
      P.xf(P.box(0.26 * s, 0.3 * s, 0.26 * s, 0.03 * s), 0, -0.15 * s, 0),
      hull,
    );
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++)
        R.add(
          "handR",
          P.xf(
            P.cyl(0.032 * s, 0.032 * s, 0.02 * s, 10),
            (i - 1) * 0.075 * s,
            -0.305 * s,
            (j - 1) * 0.075 * s,
          ),
          { color: 0x101010, rough: 0.9 },
        );
    R.socket("muzzle", "handL", 0, -0.52 * s, 0, -PI / 2, 0, 0);
    R.socket("eyes", "head", 0, 0.05 * s, -0.1 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      gore: "oil",
      bodyThick: 0.34 * s,
      hitScale: 1.6,
      noFootIK: true,
      dirt: [0.25, 0.55],
      cut: {
        head: "head",
        leftArm: "forearmL",
        rightArm: "forearmR",
        leftLeg: null,
        rightLeg: null,
      },
    });
    // the legs carry no geometry: tread hit volumes & markers replace them
    tpl.markers.leftLeg = {
      bone: 0,
      pos: [-0.33 * s, hy + 0.18 * s, 0],
      r: 0.2 * s,
    };
    tpl.markers.rightLeg = {
      bone: 0,
      pos: [0.33 * s, hy + 0.18 * s, 0],
      r: 0.2 * s,
    };
    tpl.hit = tpl.hit.filter(
      (h) => h.part !== "leftLeg" && h.part !== "rightLeg",
    );
    tpl.hit.push({
      part: "leftLeg",
      bone: 0,
      a: [-0.33 * s, hy + 0.18 * s, -0.45 * s],
      b: [-0.33 * s, hy + 0.18 * s, 0.45 * s],
      r: 0.17 * s,
    });
    tpl.hit.push({
      part: "rightLeg",
      bone: 0,
      a: [0.33 * s, hy + 0.18 * s, -0.45 * s],
      b: [0.33 * s, hy + 0.18 * s, 0.45 * s],
      r: 0.17 * s,
    });
    tpl.hit.push({
      part: "torso",
      bone: 0,
      a: [0, hy + 0.42 * s, -0.4 * s],
      b: [0, hy + 0.42 * s, 0.4 * s],
      r: 0.25 * s,
    });
    return tpl;
  }
