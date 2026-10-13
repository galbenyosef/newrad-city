/* src/characters/34_pack_ox.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: the PACK OX
 * Owned by: characters.
 *
 * A heavy one-headed working ox (quad body plan): deep barrel body with a
 * shoulder hump and a hanging dewlap, a dun / grey / black hide marked by
 * pale healed SCARS (old burns, claw rakes, rope galls), wide forward-curving
 * horns (one sometimes snapped off), cloven hooves and a switch tail.
 * Optional trade pack (opts.pack: true) — saddle blanket, slatted crates,
 * saddlebags, girth straps, bedroll, tarp bundle, cook pot & jerry can;
 * blanket colour from opts.variant (0 oxblood / 1 navy / 2 olive).
 *
 * Gets everything a G.chars creature gets: character shader, per-instance
 * tint & grime, body parts (Head / Torso / four legs), hit capsules,
 * dismemberment, gore 'red', LOD, death falls.
 *   G.chars.create('pack_ox', {seed, variant: 0..2, pack: true})
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.creatureKit) return;
  const L = G.chars._lib,
    H = L.human,
    P = L.prim,
    M = H.mat;
  const K = L.creatureKit,
    seg = K.seg,
    claw = K.claw,
    bodyZ = K.bodyZ;
  const lerp = L.lerp,
    clamp = L.clamp,
    PI = Math.PI;
  const sm = (a, b, x) => {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };

  const PACKS = [
    { blanket: 0x7a2a22, stripe: 0xd8c8a0 }, // oxblood
    { blanket: 0x2c4a6a, stripe: 0xe0d0a0 }, // faded navy
    { blanket: 0x5a6a2a, stripe: 0xc8a040 }, // olive
  ];

  function buildPackOx(opts, seed) {
    const rng = L.rng(seed);
    const s = (opts.scale || 1) * rng.range(0.94, 1.06);
    const R = new L.Rig("quad");
    const bh = 1.0 * s;
    // ---- skeleton ----
    R.bone("hips", null, 0, bh, 0.55 * s, "torso");
    R.bone("spine", "hips", 0, 0.02 * s, -0.5 * s, "torso");
    R.bone("chest", "spine", 0, 0.03 * s, -0.5 * s, "torso");
    // one thick neck carried low and forward from the shoulders
    R.bone("neck", "chest", 0, 0.22 * s, -0.45 * s, "head");
    R.bone("head", "neck", 0, 0.1 * s, -0.42 * s, "head");
    R.bone("jaw", "head", 0, -0.06 * s, -0.08 * s, "head");
    for (const [S, sg, part] of [
      ["FL", -1, "leftArm"],
      ["FR", 1, "rightArm"],
    ]) {
      R.bone("upper" + S, "chest", sg * 0.27 * s, -0.12 * s, -0.12 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.42 * s, 0.03 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.4 * s, -0.01 * s, part);
    }
    for (const [S, sg, part] of [
      ["HL", -1, "leftLeg"],
      ["HR", 1, "rightLeg"],
    ]) {
      R.bone("upper" + S, "hips", sg * 0.26 * s, -0.1 * s, 0.25 * s, part);
      R.bone("lower" + S, "upper" + S, 0, -0.42 * s, -0.1 * s, part);
      R.bone("paw" + S, "lower" + S, 0, -0.42 * s, 0.1 * s, part);
    }
    R.bone("tail1", "hips", 0, 0.3 * s, 0.5 * s, "torso");
    R.bone("tail2", "tail1", 0, -0.28 * s, 0.05 * s, "torso");
    R.bone("tail3", "tail2", 0, -0.28 * s, 0.02 * s, "torso");
    // soft joints: the barrel bends as one hide, necks flow into the shoulders
    R.softJoint("spine", 0.14 * s, 0.62 * s, [0, 0, -1]);
    R.softJoint("chest", 0.14 * s, 0.62 * s, [0, 0, -1]);
    R.softJoint("neck", 0.08 * s, 0.24 * s);
    for (const S of ["FL", "FR", "HL", "HR"]) {
      R.softJoint("upper" + S, 0.06 * s, 0.2 * s, [0, -1, 0]);
      R.softJoint("lower" + S, 0.04 * s, 0.1 * s, [0, -1, 0]);
    }

    // ---- hide: dun / grey / black with pale healed scars (burns, claw rakes, rope galls) ----
    const hideC = rng.pick([0x8a7058, 0x6e6a62, 0x3a322c, 0x9a8466, 0x5a4a3c]);
    const darkC = L.col(L.shade(hideC, 0.6)),
      scarC = L.col(0xb8a898);
    const ph = rng.range(0, 50),
      scarA = rng.range(0, PI);
    const hide = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      const f = L.noise3((wx * 1.6) / s + ph, (wy * 1.6) / s, (wz * 1.6) / s);
      if (f > 0.6) {
        const k = sm(0.6, 0.7, f) * 0.6;
        out[0] = lerp(out[0], darkC.r, k);
        out[1] = lerp(out[1], darkC.g, k);
        out[2] = lerp(out[2], darkC.b, k);
      } // darker saddle & points
      // scars: thin pale streaks (parallel claw rakes) and a few broad burn patches
      const u = (wx * Math.cos(scarA) + wz * Math.sin(scarA)) / s,
        v = wy / s;
      const rake =
        Math.abs(Math.sin(u * 38 + v * 6)) < 0.06 &&
        L.noise3((wx * 3) / s + 5, (wy * 3) / s, (wz * 3) / s + ph) > 0.62;
      const burn =
        L.noise3((wx * 4) / s + 9, (wy * 4) / s + ph, (wz * 4) / s) > 0.74;
      if (rake || burn) {
        const k = rake ? 0.7 : 0.45;
        out[0] = lerp(out[0], scarC.r, k);
        out[1] = lerp(out[1], scarC.g, k);
        out[2] = lerp(out[2], scarC.b, k);
      }
      if (ny < -0.45) {
        out[0] *= 0.82;
        out[1] *= 0.8;
        out[2] *= 0.8;
      } // shadowed belly
    };
    const skin = {
      color: hideC,
      region: "skin",
      rough: 0.7,
      noise: 0.16,
      paint: hide,
      grad: [0.8, 1.06],
    };
    // ---- body: rump → barrel → shoulder hump → brisket ----
    R.addW(
      "hips",
      bodyZ([
        { z: 1.08 * s, rx: 0.16 * s, ry: 0.2 * s, oy: bh + 0.16 * s },
        { z: 1.0 * s, rx: 0.36 * s, ry: 0.4 * s, oy: bh + 0.1 * s },
        { z: 0.78 * s, rx: 0.45 * s, ry: 0.46 * s, oy: bh + 0.08 * s },
        { z: 0.45 * s, rx: 0.47 * s, ry: 0.48 * s, oy: bh + 0.06 * s },
      ]),
      skin,
    );
    R.addW(
      "spine",
      bodyZ([
        { z: 0.5 * s, rx: 0.47 * s, ry: 0.48 * s, oy: bh + 0.06 * s },
        { z: 0.12 * s, rx: 0.49 * s, ry: 0.52 * s, oy: bh + 0.02 * s },
        { z: -0.25 * s, rx: 0.48 * s, ry: 0.52 * s, oy: bh + 0.05 * s },
      ]),
      skin,
    );
    R.addW(
      "chest",
      bodyZ([
        { z: -0.2 * s, rx: 0.48 * s, ry: 0.52 * s, oy: bh + 0.06 * s },
        { z: -0.5 * s, rx: 0.47 * s, ry: 0.52 * s, oy: bh + 0.12 * s },
        { z: -0.8 * s, rx: 0.4 * s, ry: 0.45 * s, oy: bh + 0.12 * s },
        { z: -0.98 * s, rx: 0.24 * s, ry: 0.3 * s, oy: bh + 0.2 * s },
      ]),
      skin,
    );
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.32 * s, 0.2 * s, 0.34 * s, 14, 10),
        0,
        bh + 0.5 * s,
        -0.5 * s,
      ),
      skin,
    ); // shoulder hump
    R.addW(
      "chest",
      P.xf(
        P.sphere(0.18 * s, 0.26 * s, 0.14 * s, 10, 8),
        0,
        bh - 0.22 * s,
        -0.86 * s,
      ),
      skin,
    ); // dewlap / brisket
    // ---- legs: straight, knobbly knees & hocks, cloven hooves with dewclaws ----
    const legSk = Object.assign({}, skin, { grad: [0.7, 1.0] });
    const hoofM = {
      color: 0x231d19,
      rough: 0.5,
      noise: 0.12,
      grad: [0.8, 1.1],
    };
    for (const S of ["FL", "FR", "HL", "HR"]) {
      const front = S[0] === "F";
      const lo = R.bones[R.map["lower" + S]].pos,
        pw = R.bones[R.map["paw" + S]].pos;
      seg(R, "upper" + S, lo, (front ? 0.16 : 0.2) * s, 0.085 * s, legSk, {
        bulge: 0.03 * s,
      });
      R.add(
        "lower" + S,
        P.xf(
          P.sphere(0.078 * s, 0.07 * s, 0.078 * s, 8, 6),
          0,
          0,
          front ? -0.005 * s : 0.01 * s,
        ),
        legSk,
      ); // knee / hock
      seg(R, "lower" + S, pw, 0.075 * s, 0.062 * s, legSk);
      R.add(
        "paw" + S,
        P.xf(P.sphere(0.06 * s, 0.05 * s, 0.06 * s, 8, 6), 0, 0.01 * s, 0),
        legSk,
      ); // fetlock
      for (const sg of [-1, 1]) {
        // two toes of the cloven hoof
        R.add(
          "paw" + S,
          P.xf(
            P.cyl(0.033 * s, 0.042 * s, 0.1 * s, 8),
            sg * 0.028 * s,
            -0.01 * s,
            -0.012 * s,
            -0.12,
            0,
            0,
          ),
          hoofM,
        );
        claw(
          R,
          "paw" + S,
          [
            [sg * 0.03 * s, 0.03 * s, 0.045 * s],
            [sg * 0.034 * s, 0.0, 0.07 * s],
          ],
          0.012 * s,
          hoofM,
          4,
        ); // dewclaw
      }
    }
    // ---- neck & head ----
    const tone = (k) => Object.assign({}, skin, { color: L.shade(hideC, k) });
    const hornM = {
      color: 0xd6c8a4,
      rough: 0.45,
      noise: 0.1,
      grad: [0.55, 1.15],
    };
    const snapped = rng.chance(0.3) ? (rng.chance(0.5) ? -1 : 1) : 0;
    {
      const hp = R.bones[R.map.head].pos;
      seg(R, "neck", hp, 0.22 * s, 0.15 * s, skin, { bulge: 0.03 * s });
      R.add(
        "neck",
        P.xf(
          P.sphere(0.24 * s, 0.24 * s, 0.24 * s, 10, 8),
          0,
          -0.02 * s,
          0.04 * s,
        ),
        skin,
      ); // neck root
      R.add(
        "neck",
        P.xf(
          P.sphere(0.06 * s, 0.2 * s, 0.22 * s, 8, 6),
          0,
          -0.2 * s,
          -0.12 * s,
        ),
        skin,
      ); // dewlap fold
      // skull: broad flat poll, long face, dark wet muzzle
      const hd = P.sphere(1, 1, 1, 14, 10);
      P.deform(hd, (v) => {
        let x = v.x * 0.15,
          y = v.y * 0.135,
          z = v.z * 0.24;
        if (v.z < 0) {
          const t = -v.z;
          x *= lerp(1, 0.78, t);
          y *= lerp(1, 0.85, t);
        }
        if (v.y > 0.6 && v.z > -0.2) y -= 0.02;
        v.set(x * s, (y + 0.02) * s, (z - 0.12) * s);
      });
      R.add("head", hd, tone(1.0));
      R.add(
        "head",
        P.xf(
          P.sphere(0.12 * s, 0.1 * s, 0.11 * s, 10, 8),
          0,
          -0.04 * s,
          -0.33 * s,
          0.25,
          0,
          0,
        ),
        {
          color: 0x2e2622,
          region: "skin",
          rough: 0.35,
          noise: 0.1,
          grad: [0.9, 1.05],
        },
      ); // muzzle
      R.add(
        "head",
        P.xf(
          P.sphere(0.13 * s, 0.05 * s, 0.07 * s, 8, 6),
          0,
          0.12 * s,
          -0.02 * s,
        ),
        tone(0.8),
      ); // poll ridge
      for (const n of [-1, 1]) {
        R.add(
          "head",
          P.xf(
            P.sphere(0.018 * s, 0.014 * s, 0.012 * s, 6, 5),
            n * 0.045 * s,
            -0.02 * s,
            -0.44 * s,
          ),
          { color: 0x120c0a, rough: 0.3 },
        ); // nostril
        R.add(
          "head",
          P.xf(
            P.sphere(0.022 * s, 0.022 * s, 0.018 * s, 8, 6),
            n * 0.13 * s,
            0.05 * s,
            -0.14 * s,
          ),
          { color: 0x0c0808, rough: 0.12, metal: 0.1 },
        ); // eye
        R.add(
          "head",
          P.xf(
            P.sphere(0.03 * s, 0.012 * s, 0.026 * s, 8, 5),
            n * 0.13 * s,
            0.075 * s,
            -0.14 * s,
          ),
          tone(0.85),
        ); // heavy lid
        R.add(
          "head",
          P.xf(
            P.sphere(0.075 * s, 0.022 * s, 0.045 * s, 8, 5),
            n * 0.17 * s,
            0.05 * s,
            -0.01 * s,
            0,
            n * 0.4,
            -n * 0.3,
          ),
          tone(0.92),
        ); // ear
        // horn: wide, out then forward and up (or a snapped stump)
        const pts =
          n === snapped
            ? [
                [n * 0.1 * s, 0.11 * s, -0.02 * s],
                [n * 0.2 * s, 0.13 * s, -0.03 * s],
              ]
            : [
                [n * 0.1 * s, 0.11 * s, -0.02 * s],
                [n * 0.26 * s, 0.13 * s, -0.02 * s],
                [n * 0.38 * s, 0.17 * s, -0.1 * s],
                [n * 0.42 * s, 0.26 * s, -0.2 * s],
              ];
        claw(R, "head", pts, 0.035 * s, hornM, 7);
      }
      R.add(
        "jaw",
        P.xf(
          P.sphere(0.09 * s, 0.04 * s, 0.15 * s, 8, 6),
          0,
          -0.02 * s,
          -0.14 * s,
          0.1,
          0,
          0,
        ),
        tone(0.8),
      ); // lower jaw
    }
    // ---- tail with a switch ----
    seg(R, "tail1", R.bones[R.map.tail2].pos, 0.03 * s, 0.024 * s, skin);
    seg(R, "tail2", R.bones[R.map.tail3].pos, 0.024 * s, 0.018 * s, skin);
    R.add(
      "tail3",
      P.xf(P.sphere(0.05 * s, 0.13 * s, 0.05 * s, 7, 6), 0, -0.12 * s, 0),
      { color: 0x3a2a22, region: "fur", rough: 0.95, noise: 0.2 },
    );
    // ---- trade pack ----
    if (opts.pack) {
      const vi =
        (typeof opts.variant === "number" ? opts.variant : rng.int(0, 2)) %
        PACKS.length;
      const pk = PACKS[(vi + PACKS.length) % PACKS.length];
      const cl = (c, e) =>
        Object.assign(
          { color: c, region: "cloth", rough: 0.9, noise: 0.12 },
          e || {},
        );
      const wood = (c) => ({
        color: c,
        region: "wood",
        rough: 0.85,
        noise: 0.14,
        rigid: true,
      });
      const strap = {
        color: 0x2c2018,
        region: "leather",
        rough: 0.75,
        noise: 0.1,
      };
      const topY = bh + 0.56 * s,
        sw = R.world("spine");
      const B = (bone, w, h, d, x, y, z, m, rx, ry, rz) =>
        R.addW(
          bone,
          P.xf(
            P.box(w * s, h * s, d * s, Math.min(w, h, d) * 0.12 * s),
            x * s,
            y,
            z * s,
            rx || 0,
            ry || 0,
            rz || 0,
          ),
          m,
        );
      // saddle blanket draped over the back (loft segment) + stripes
      const bt = PI * 0.38,
        cy = sw[1] + 0.03 * s;
      R.addW(
        "spine",
        P.xf(
          P.sphere(0.525 * s, 0.56 * s, 0.63 * s, 18, 8, 0, PI * 2, 0, bt),
          0,
          cy,
          sw[2],
        ),
        cl(pk.blanket),
      );
      R.addW(
        "spine",
        P.xf(
          P.torus(1, 0.032 * s, 4, 28),
          0,
          cy + 0.56 * s * Math.cos(bt) - 0.01 * s,
          sw[2],
          PI / 2,
          0,
          0,
          0.525 * s * Math.sin(bt) + 0.006 * s,
          0.63 * s * Math.sin(bt) + 0.006 * s,
          1,
        ),
        cl(pk.stripe),
      );
      for (const sx of [-1, 1]) {
        // crates with slats either side
        B(
          "spine",
          0.27,
          0.4,
          0.5,
          sx * 0.72,
          bh + 0.28 * s,
          -0.12,
          wood(0x7a5a3a),
        );
        for (const y of [0.14, 0.28, 0.42])
          B(
            "spine",
            0.285,
            0.035,
            0.52,
            sx * 0.72,
            bh + y * s,
            -0.12,
            wood(0x5a4028),
          );
        // saddlebags
        B(
          "hips",
          0.2,
          0.3,
          0.3,
          sx * 0.64,
          bh + 0.24 * s,
          0.5,
          Object.assign({}, strap, { color: 0x4a3322 }),
          0,
          0,
          sx * 0.08,
        );
        B(
          "hips",
          0.21,
          0.08,
          0.31,
          sx * 0.645,
          bh + 0.41 * s,
          0.5,
          strap,
          0,
          0,
          sx * 0.08,
        );
      }
      // girth straps round the barrel
      for (const z of [-0.3, 0.36])
        R.addW(
          "spine",
          P.xf(
            P.torus(0.53 * s, 0.018 * s, 4, 22),
            0,
            bh + 0.05 * s,
            z * s,
            0,
            PI / 2,
            0,
            1,
            1.02,
            0.6,
          ),
          strap,
        );
      // bedroll, tarp bundle, pot & jerry can
      R.addW(
        "hips",
        P.xf(
          P.cyl(0.13 * s, 0.13 * s, 0.86 * s, 10),
          0,
          topY + 0.12 * s,
          0.3 * s,
          0,
          0,
          PI / 2,
        ),
        cl(0x6b6a4e),
      );
      for (const x of [-0.25, 0.25])
        R.addW(
          "hips",
          P.xf(
            P.cyl(0.137 * s, 0.137 * s, 0.04 * s, 10),
            x * s,
            topY + 0.12 * s,
            0.3 * s,
            0,
            0,
            PI / 2,
          ),
          strap,
        );
      B(
        "chest",
        0.62,
        0.18,
        0.36,
        0,
        topY + 0.08 * s,
        -0.28,
        cl(0x8a7d5c),
        0.05,
      );
      R.addW(
        "spine",
        P.xf(
          P.cyl(0.11 * s, 0.09 * s, 0.14 * s, 10),
          0.9 * s,
          bh + 0.08 * s,
          0.3 * s,
        ),
        M.metal(0x6d6d68, { rough: 0.5 }),
      );
      R.addW(
        "spine",
        P.xf(
          P.box(0.1 * s, 0.3 * s, 0.22 * s, 0.015 * s),
          -0.9 * s,
          bh + 0.22 * s,
          -0.14 * s,
        ),
        { color: 0x55622e, region: "metal", rough: 0.55, metal: 0.4 },
      );
    }
    // ---- hit volumes, markers, sockets ----
    R.hitVol(
      "head",
      "head",
      [0, 0.02 * s, 0],
      [0, -0.03 * s, -0.36 * s],
      0.13 * s,
    );
    R.hitVol("head", "neck", [0, 0, 0], R.bones[R.map.head].pos, 0.13 * s);
    R.hitVol(
      "torso",
      "hips",
      [0, 0.08 * s, 0.45 * s],
      [0, 0.06 * s, -0.2 * s],
      0.47 * s,
    );
    R.hitVol(
      "torso",
      "chest",
      [0, 0.1 * s, 0.2 * s],
      [0, 0.12 * s, -0.5 * s],
      0.48 * s,
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
        0.07 * s,
      );
    }
    R.marker("head", "head", 0, 0.0, -0.15 * s, 0.15 * s);
    R.marker("torso", "spine", 0, 0.06 * s, 0, 0.5 * s);
    R.marker("leftArm", "upperFL", 0, -0.3 * s, 0, 0.1 * s);
    R.marker("rightArm", "upperFR", 0, -0.3 * s, 0, 0.1 * s);
    R.marker("leftLeg", "upperHL", 0, -0.3 * s, 0, 0.1 * s);
    R.marker("rightLeg", "upperHR", 0, -0.3 * s, 0, 0.1 * s);
    R.socket("eyes", "head", 0, 0.05 * s, -0.14 * s);
    R.socket("mouth", "jaw", 0, 0, -0.2 * s);
    const tpl = R.build();
    Object.assign(tpl.meta, {
      s,
      bodyH: bh,
      bodyThick: 0.48 * s,
      height: 1.75 * s,
      hipH: bh,
      dirt: [0.25, 0.6],
      blood: [0, 0.1],
      cut: {
        head: "neck",
        leftArm: "lowerFL",
        rightArm: "lowerFR",
        leftLeg: "lowerHL",
        rightLeg: "lowerHR",
      },
      style: {
        wag: false,
        pant: false,
        tailUp: -0.15,
        stride: 0.8,
        graze: true,
      },
    });
    return tpl;
  }
  L.infos.pack_ox = {
    kind: "quad",
    height: 1.75,
    radius: 1.0,
    gore: "red",
    isCreature: true,
    parts: ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
    labels: {
      head: "Head",
      torso: "Torso",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Hind Leg",
      rightLeg: "Right Hind Leg",
    },
    gait: { walkStep: 0.95, runStep: 1.7, walkSpeed: 1.3, runSpeed: 5.2 },
    style: { stride: 0.8, pant: false, wag: false, tailUp: -0.15, graze: true },
    variants: 6,
    build: buildPackOx,
  };
})();
