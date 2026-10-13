// play-inline-457 02 — the
// Lines 21-378 of readable/play-inline-457.pretty.js (statement-aligned).
  const L = G.chars._lib;
  const P = L.prim,
    PAL = L.PAL;
  const lerp = L.lerp,
    clamp = L.clamp;
  const PI = Math.PI;
  const H = (L.human = {});

  // ------------------------------------------------------------------
  // Proportions
  // ------------------------------------------------------------------
  /**
   * @param gender 'm'|'f'; o: {scale, bulk (armour), muscle, thin, ...}
   */
  H.proportions = function (gender, o) {
    o = o || {};
    const f = gender === "f";
    const s = (o.scale || 1) * (f ? 0.94 : 1);
    const b = {
      gender: f ? "f" : "m",
      s,
      ankle: 0.07 * s,
      shin: 0.42 * s,
      thigh: 0.44 * s,
      hipDrop: 0.05 * s,
      hipW: (f ? 0.1 : 0.095) * s * (o.hipMul || 1),
      spine: 0.11 * s,
      chest: 0.2 * s,
      neckY: 0.22 * s,
      headY: 0.065 * s,
      shX: (f ? 0.168 : 0.19) * s * (o.shoulderMul || 1),
      shY: 0.19 * s,
      clav: 0.06 * s,
      upper: 0.29 * s,
      fore: 0.255 * s,
      hand: 0.18 * s,
      torsoW: (f ? 0.15 : 0.163) * s,
      torsoD: (f ? 0.11 : 0.115) * s,
      limbR: (o.thin ? 0.8 : 1) * (1 + (o.muscle || 0) * 0.35) * s,
      headS: s * (o.headMul || 1) * 1.07,
      bulk: o.bulk || 1,
      thin: !!o.thin,
      muscle: o.muscle || 0,
    };
    b.hipH = b.ankle + b.shin + b.thigh + b.hipDrop;
    b.legLen = b.ankle + b.shin + b.thigh;
    b.height = b.hipH + b.spine + b.chest + b.neckY + b.headY + 0.225 * b.headS;
    return b;
  };

  // ------------------------------------------------------------------
  // Skeleton (+ hit volumes, part markers, sockets)
  // ------------------------------------------------------------------
  H.skeleton = function (R, b, opts) {
    opts = opts || {};
    R.bone("hips", null, 0, b.hipH, 0, "torso");
    R.bone("spine", "hips", 0, b.spine, 0, "torso");
    R.bone("chest", "spine", 0, b.chest, 0, "torso");
    R.bone("neck", "chest", 0, b.neckY, opts.neckZ || 0, "torso");
    R.bone("head", "neck", 0, b.headY, opts.headZ || 0, "head");
    // anatomical jaw hinge (just in front of the ears): chin & lower-lip skin is
    // skinned to it by the face builder, so the whole lower face opens
    R.bone("jaw", "head", 0, 0.0873 * b.headS, -0.01 * b.headS, "head");
    for (const [S, sg, part, legPart] of [
      ["L", -1, "leftArm", "leftLeg"],
      ["R", 1, "rightArm", "rightLeg"],
    ]) {
      R.bone("shoulder" + S, "chest", sg * b.clav, b.shY, 0, "torso");
      R.bone("arm" + S, "shoulder" + S, sg * (b.shX - b.clav), 0, 0, part);
      R.bone("forearm" + S, "arm" + S, 0, -b.upper, 0, part);
      R.bone("hand" + S, "forearm" + S, 0, -b.fore, 0, part);
      R.bone("thigh" + S, "hips", sg * b.hipW, -b.hipDrop, 0, legPart);
      R.bone("shin" + S, "thigh" + S, 0, -b.thigh, 0, legPart);
      R.bone("foot" + S, "shin" + S, 0, -b.shin, 0, legPart);
    }
    // SOFT JOINTS: blend skin weights across shoulders, elbows, hips, knees,
    // ankles, waist and neck so limbs bend as one continuous surface.
    // (softK < 1 for rigid shells such as exo-rigs)
    const sk = opts.softK === undefined ? 1 : opts.softK,
      lrr = b.limbR * (b.hitBulk || b.bulk);
    if (sk > 0) {
      R.softJoint("spine", 0.05 * b.s * sk, 0.3 * b.s * b.bulk, [0, 1, 0]);
      R.softJoint("chest", 0.05 * b.s * sk, 0.3 * b.s * b.bulk, [0, 1, 0]);
      R.softJoint("neck", 0.03 * b.s * sk, 0.085 * b.s, [0, 1, 0]);
      R.softJoint("head", 0.025 * b.s * sk, 0.06 * b.headS, [0, 1, 0]);
      for (const S of ["L", "R"]) {
        R.softJoint("arm" + S, 0.045 * b.s * sk, 0.11 * lrr, [0, -1, 0]);
        R.softJoint("forearm" + S, 0.05 * b.s * sk, 0.085 * lrr, [0, -1, 0]);
        R.softJoint("thigh" + S, 0.06 * b.s * sk, 0.13 * lrr, [0, -1, 0]);
        R.softJoint("shin" + S, 0.055 * b.s * sk, 0.1 * lrr, [0, -1, 0]);
        R.softJoint("foot" + S, 0.03 * b.s * sk, 0.085 * b.s, [0, -1, 0]);
      }
    }
    // hit volumes (capsules in bone space)
    const hs = b.headS,
      lr = b.limbR,
      bk = b.hitBulk || b.bulk;
    R.hitVol(
      "head",
      "head",
      [0, 0.08 * hs, -0.01 * hs],
      [0, 0.14 * hs, -0.01 * hs],
      0.115 * hs * bk,
    );
    R.hitVol(
      "torso",
      "hips",
      [0, -0.05 * b.s, 0],
      [0, b.spine, 0],
      0.17 * b.s * bk,
    );
    R.hitVol("torso", "spine", [0, 0, 0], [0, b.chest, 0], 0.17 * b.s * bk);
    R.hitVol(
      "torso",
      "chest",
      [0, 0, 0],
      [0, b.neckY * 0.9, 0],
      0.19 * b.s * bk,
    );
    R.hitVol("torso", "neck", [0, 0, 0], [0, b.headY, 0], 0.06 * b.s * bk);
    for (const [S, arm, leg] of [
      ["L", "leftArm", "leftLeg"],
      ["R", "rightArm", "rightLeg"],
    ]) {
      R.hitVol(arm, "arm" + S, [0, 0, 0], [0, -b.upper, 0], 0.065 * lr * bk);
      R.hitVol(
        arm,
        "forearm" + S,
        [0, 0, 0],
        [0, -b.fore - b.hand * 0.6, 0],
        0.055 * lr * bk,
      );
      R.hitVol(leg, "thigh" + S, [0, 0, 0], [0, -b.thigh, 0], 0.085 * lr * bk);
      R.hitVol(
        leg,
        "shin" + S,
        [0, 0, 0],
        [0, -b.shin - b.ankle * 0.5, -0.04 * b.s],
        0.065 * lr * bk,
      );
    }
    R.marker("head", "head", 0, 0.105 * hs, -0.01 * hs, 0.12 * hs * bk);
    R.marker("torso", "chest", 0, 0.02 * b.s, 0, 0.24 * b.s * bk);
    R.marker("leftArm", "forearmL", 0, 0.02 * b.s, 0, 0.1 * lr * bk);
    R.marker("rightArm", "forearmR", 0, 0.02 * b.s, 0, 0.1 * lr * bk);
    R.marker("leftLeg", "shinL", 0, 0.05 * b.s, 0, 0.12 * lr * bk);
    R.marker("rightLeg", "shinR", 0, 0.05 * b.s, 0, 0.12 * lr * bk);
    // weapon grip in the right palm; weapon model: grip at origin, barrel -Z, up +Y
    R.socket("gripR", "handR", 0, -0.075 * b.s, -0.01 * b.s, -PI / 2, 0, 0);
    R.socket("gripL", "handL", 0, -0.075 * b.s, -0.01 * b.s, -PI / 2, 0, 0);
    R.socket("eyes", "head", 0, 0.12 * hs, -0.09 * hs);
    R.socket("back", "chest", 0, 0.1 * b.s, 0.16 * b.s * bk);
    R.meta.chestD =
      b.torsoD * (b.hitBulk || b.bulk) * 1.15 * (1 + b.muscle * 0.3);
    R.meta.hipH = b.hipH;
    R.meta.legLen = b.legLen;
    R.meta.height = b.height;
    R.meta.upper = b.upper;
    R.meta.fore = b.fore;
    R.meta.shX = b.shX;
    R.meta.shY = b.shY;
    R.meta.s = b.s;
  };

  // ------------------------------------------------------------------
  // Torso loft rings (pelvis / abdomen / chest) in bone-local space
  // ------------------------------------------------------------------
  H.torsoRings = function (b, mul) {
    mul = mul || 1;
    const f = b.gender === "f";
    const W = b.torsoW * mul * b.bulk,
      D = b.torsoD * mul * b.bulk;
    const mw = 1 + b.muscle * 0.3;
    const n = 2.3;
    const pelvis = [
      { y: -0.14 * b.s, rx: W * 0.35, rz: D * 0.55, n },
      { y: -0.1 * b.s, rx: W * (f ? 1.02 : 0.9), rz: D * 0.9, n },
      { y: -0.03 * b.s, rx: W * (f ? 1.1 : 0.97), rz: D * 0.98, n },
      { y: 0.05 * b.s, rx: W * (f ? 1.02 : 0.93), rz: D * 0.94, n },
      { y: b.spine + 0.02 * b.s, rx: W * (f ? 0.84 : 0.88), rz: D * 0.88, n },
    ];
    const abdomen = [
      { y: -0.03 * b.s, rx: W * (f ? 0.85 : 0.89), rz: D * 0.89, n },
      {
        y: b.chest * 0.45,
        rx: W * (f ? 0.78 : 0.88) * mw,
        rz: D * 0.9,
        oz: -0.004 * b.s,
        n,
      },
      {
        y: b.chest + 0.03 * b.s,
        rx: W * (f ? 0.9 : 0.96) * mw,
        rz: D * 0.96,
        oz: -0.004 * b.s,
        n,
      },
    ];
    const chest = [
      { y: -0.04 * b.s, rx: W * (f ? 0.88 : 0.96) * mw, rz: D * 0.96, n },
      {
        y: 0.05 * b.s,
        rx: W * (f ? 0.98 : 1.06) * mw,
        rz: D * (f ? 1.02 : 1.08),
        oz: -0.008 * b.s,
        n,
      },
      {
        y: 0.13 * b.s,
        rx: W * (f ? 1.02 : 1.12) * mw,
        rz: D * 1.07,
        oz: -0.006 * b.s,
        n,
      },
      // ACROMION SHELF: the torso reaches out over the shoulder joint so the
      // trapezius slopes straight down from the neck onto the deltoid (the arm
      // tube's dome tucks under it) — no "ball on a barrel" notch between them
      {
        y: 0.2 * b.s,
        rx: W * (f ? 1.13 : 1.17) * mw,
        rz: D * 0.9,
        oz: 0.004 * b.s,
        n: 2.9,
      },
      {
        y: 0.228 * b.s,
        rx: W * 0.8 * mw,
        rz: D * 0.72,
        oz: 0.004 * b.s,
        n: 2.5,
      },
      { y: 0.255 * b.s, rx: W * 0.42, rz: D * 0.55, oz: 0.004 * b.s, n },
    ];
    return { pelvis, abdomen, chest };
  };
  const scaleRings = (rings, k, kz, dy) =>
    rings.map((r) =>
      Object.assign({}, r, {
        rx: r.rx * k,
        rz: r.rz * (kz || k),
        oz: (r.oz || 0) * k,
        y: r.y + (dy || 0),
      }),
    );
  H.scaleRings = scaleRings;

  // ------------------------------------------------------------------
  // Body parts
  // ------------------------------------------------------------------
  const cloth = (c, extra) =>
    Object.assign({ color: c, region: "cloth", rough: 0.92 }, extra || {});
  const skinM = (c, extra) =>
    Object.assign(
      { color: c, region: "skin", rough: 0.62, noise: 0.07, grad: [0.9, 1.04] },
      extra || {},
    );
  const leatherM = (c, extra) =>
    Object.assign({ color: c, region: "leather", rough: 0.7 }, extra || {});
  const metalM = (c, extra) =>
    Object.assign(
      { color: c, region: "metal", rough: 0.45, metal: 0.65 },
      extra || {},
    );
  H.mat = { cloth, skin: skinM, leather: leatherM, metal: metalM };

  /**
   * Torso: look = {top, topRegion, bottom, bottomRegion, paintTop, paintBottom, mulTop}
   */
  H.torso = function (R, b, look) {
    const rings = H.torsoRings(b, look.mul || 1);
    const top =
      look.topMat ||
      cloth(look.top, {
        region: look.topRegion || "cloth",
        paint: look.paintTop,
      });
    const bot =
      look.bottomMat ||
      cloth(look.bottom, {
        region: look.bottomRegion || "cloth",
        paint: look.paintBottom,
      });
    R.add("hips", P.loft(rings.pelvis, { seg: 18, capBottom: true }), bot);
    R.add("spine", P.loft(rings.abdomen, { seg: 18 }), look.abdomenMat || top);
    R.add("chest", P.loft(rings.chest, { seg: 18, capTop: true }), top);
    if (b.gender === "f" && !look.flat) {
      // soft bust shaping blended into the chest surface (vertices pushed forward)
      const g = P.loft(
        rings.chest
          .slice(0, 4)
          .map((r) =>
            Object.assign({}, r, { rx: r.rx * 0.985, rz: r.rz * 0.985 }),
          ),
        { seg: 18, a0: -PI * 0.36, a1: PI * 0.36 },
      );
      P.deform(g, (v) => {
        const dy = (v.y - 0.08 * b.s) / (0.055 * b.s);
        for (const sg of [-1, 1]) {
          const dx = (v.x - sg * 0.062 * b.s) / (0.055 * b.s);
          const k = Math.exp(-(dx * dx + dy * dy));
          v.z -= k * 0.03 * b.s;
        }
      });
      R.add("chest", g, top);
    }
    return rings;
  };

  /** Neck (skin or collar colour). */
  H.neck = function (R, b, mat, r) {
    // lathe with a trapezius flare at the base that sinks into the collar line
    // (no hard neck-on-torso step) and a slight taper up under the jaw
    const k = b.headS * (r || 1) * (b.gender === "f" ? 1 : 1.06); // scales with the head (headS), so necks never read as stalks
    // (r2: upper neck ~7 % thicker & rounder in depth, and it leans forward
    //  under the skull — the old thin upright cylinder read as a stalk)
    const prof = [
      [0.082, -0.04],
      [0.071, -0.018],
      [0.063, 0.008],
      [0.061, 0.04],
      [0.0605, 0.075],
      [0.0595, 0.11],
    ];
    const g = P.lathe(
      prof.map(([rr, y]) => [rr * k, y * b.s]),
      14,
    );
    P.xf(g, 0, 0, 0.005 * b.s, 0, 0, 0, 1, 1, 0.98);
    P.deform(g, (v) => {
      v.z -= 0.012 * b.s * L.smooth(0.02 * b.s, 0.11 * b.s, v.y);
    });
    // occlusion under the jaw: the top of the neck (front & sides) sits in the
    // mandible's shadow, so the face's darker under-jaw plane continues into
    // the throat instead of ending in a hard line against a bright neck
    const p0 = mat && mat.paint,
      s0 = b.s;
    const paint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      if (p0) p0(x, y, z, nx, ny, nz, out, wx, wy, wz);
      const k =
        0.2 *
          L.smooth(0.015 * s0, 0.08 * s0, y) *
          (0.35 + 0.65 * Math.max(0, -nz)) +
        0.06 * L.smooth(0.03 * s0, -0.03 * s0, y);
      out[0] *= 1 - k;
      out[1] *= 1 - k * 1.05;
      out[2] *= 1 - k * 1.05;
    };
    R.add("neck", g, Object.assign({}, mat, { paint }));
  };

  /**
   * Continuous limb tube hanging from y = 0 down to y = −len (bone-local).
   * keys: [[along, radius], …] (along from the top, metres) interpolated
   * smoothly; opts: {rows, seg, flat (z scale), knee: {at, amt} (front bump),
   * elbow: {at, amt} (back bump), capT, capB (false = open end)}.
   * One surface across the joint (no overlapping end domes → no seam rings);
   * the joint bend comes from blended skin weights (see limbSkin).
   */
