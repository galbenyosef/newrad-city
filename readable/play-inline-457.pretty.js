/* src/characters/20_humans.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: humans (and humanoid bodies)
 * Owned by: characters.
 *
 * Biped skeleton + parametric body (lofted torso, tapered limbs, hands,
 * boots), faces (deformed skull, eyes/lids/brows/nose/lips/ears, hair
 * styles via hairline shells, beards), scars, old burns and Maniac grime, and
 * every outfit in the contract:
 *   cryo_suit, director_suit, raider, raider_heavy, settler, drifter,
 *   merchant, doctor, lab_coat, glowkeeper_robes, combat_armor, leather_armor,
 *   survivor_layers, dj, covenant_exo_rig (Mk I / Mk II), continuity_exo_rig, continuity_uniform.
 * The shared biped skeleton/body helpers are exported on L.human for the
 * creature builders (brutes, Maniacs, patrolmen…).
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib) return;
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
  function limbTube(len, keys, opts) {
    opts = opts || {};
    const g = limbTube0(len, keys, opts);
    if (opts.mirrorU) {
      const uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i));
    } // left limbs: patches/seams land elsewhere
    return g;
  }
  function limbTube0(len, keys, opts) {
    const rows = opts.rows || Math.max(9, Math.round(len / 0.03)),
      seg = opts.seg || 12;
    const rAt = (a) => {
      if (a <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) {
        if (a <= keys[i][0]) {
          const k0 = keys[i - 1],
            k1 = keys[i];
          const t = (a - k0[0]) / Math.max(1e-6, k1[0] - k0[0]);
          const u = t * t * (3 - 2 * t);
          return k0[1] + (k1[1] - k0[1]) * u;
        }
      }
      return keys[keys.length - 1][1];
    };
    const pts = [];
    const rB = rAt(len),
      rT = rAt(0);
    const capB = opts.capB === false ? 0 : opts.capB || rB * 0.8,
      capT = opts.capT === false ? 0 : opts.capT || rT * 0.85;
    if (capB)
      for (let i = 0; i < 3; i++) {
        const a = ((i / 3) * Math.PI) / 2;
        pts.push([Math.sin(a) * rB, -len - Math.cos(a) * capB * 0.9]);
      }
    for (let j = rows; j >= 0; j--) {
      const a = (len * j) / rows;
      pts.push([rAt(a), -a]);
    }
    if (capT)
      for (let i = 1; i <= 3; i++) {
        const a = ((1 - i / 3) * Math.PI) / 2;
        pts.push([Math.sin(a) * rT, Math.cos(a) * capT * 0.9]);
      }
    if (capB) pts[0][0] = 0;
    if (capT) pts[pts.length - 1][0] = 0;
    const g = P.lathe(pts, seg);
    P.deform(g, (v) => {
      const a = -v.y;
      if (opts.knee && v.z < 0) {
        const k = Math.exp(-Math.pow((a - opts.knee.at) / 0.045, 2));
        v.z -=
          opts.knee.amt * k * Math.pow(Math.max(0, -v.z) / (rAt(a) || 1), 2);
      }
      if (opts.elbow && v.z > 0) {
        const k = Math.exp(-Math.pow((a - opts.elbow.at) / 0.03, 2));
        v.z +=
          opts.elbow.amt * k * Math.pow(Math.max(0, v.z) / (rAt(a) || 1), 3);
      }
      if (opts.flat) v.z *= opts.flat;
    });
    return g;
  }
  H.limbTube = limbTube;
  /**
   * Skin weights for a tube on bone `top` crossing into `mid` at `joint`
   * (distance below `top`'s origin), blended into `parent` at the top and
   * `end` at `len`.
   */
  function limbSkin(R, top, mid, parent, end, joint, len, s) {
    const tw = R.world(top);
    return (wx, wy, wz) => {
      const a = tw[1] - wy;
      const out = [];
      const wm = L.smooth(joint - 0.04 * s, joint + 0.055 * s, a);
      if (wm > 0) out.push([mid, wm]);
      const wp = 0.5 * (1 - L.smooth(-0.015 * s, 0.075 * s, a));
      if (wp > 0 && parent) out.push([parent, wp]);
      const we = 0.45 * L.smooth(len - 0.04 * s, len + 0.01 * s, a);
      if (we > 0 && end) out.push([end, we]);
      return out;
    };
  }
  H.limbSkin = limbSkin;

  /**
   * Arm: o = {sleeve: 'long'|'short'|'none'|'rolled', sleeveColor, sleeveRegion, skin, glove (color|null), cuff, mul}
   * One continuous shoulder→wrist tube (deltoid, biceps, elbow, forearm
   * swell, wrist) skinned across the elbow; sleeves are tubes over it.
   */
  H.arm = function (R, b, S, o) {
    const lr = b.limbR * (o.mul || 1) * 0.93; // (was 7% thicker than a real arm: puffy action-figure look)
    const skin = skinM(o.skin, {
      paint: o.skinPaint,
      region: o.skinRegion || "skin",
      emis: o.skinEmis || 0,
    });
    const slv =
      o.sleeveMat ||
      cloth(o.sleeveColor, {
        region: o.sleeveRegion || "cloth",
        paint: o.paintSleeve,
      });
    const U = b.upper,
      F = b.fore,
      len = U + F;
    const sk = limbSkin(
      R,
      "arm" + S,
      "forearm" + S,
      "shoulder" + S,
      "hand" + S,
      U,
      len,
      b.s,
    );
    const keys = [
      [0, 0.05 * lr],
      [0.05 * b.s, 0.055 * lr],
      [0.1 * b.s, 0.054 * lr],
      [U * 0.42, 0.058 * lr + 0.004 * lr],
      [U - 0.03 * b.s, 0.045 * lr],
      [U, 0.043 * lr],
      [U + 0.04 * b.s, 0.047 * lr],
      [U + F * 0.28, 0.049 * lr],
      [U + F * 0.7, 0.04 * lr],
      [len, 0.034 * lr],
    ];
    const tube = (k, cut, mat, extra) => {
      const g = limbTube(
        cut,
        k,
        Object.assign(
          {
            elbow: { at: U, amt: 0.008 * lr },
            flat: 0.93,
            capT: k[0][1] * 0.32,
            mirrorU: S === "L",
          },
          extra || {},
        ),
      );
      return R.add("arm" + S, g, Object.assign({}, mat, { skin: sk }));
    };
    if (o.sleeve === "long") tube(keys, len, slv);
    else {
      tube(keys, len, skin);
      if (o.sleeve === "short" || o.sleeve === "rolled") {
        const cut = o.sleeve === "short" ? U * 0.48 : U * 1.02;
        const sk2 = keys
          .filter((k) => k[0] < cut)
          .map((k) => [k[0], k[1] * 1.13 + 0.003 * b.s])
          .concat([[cut, 0.052 * lr * 1.1]]);
        tube(sk2, cut, slv, { capB: false, elbow: null });
        if (o.sleeve === "rolled")
          R.add(
            "arm" + S,
            P.xf(
              P.torus(0.05 * lr, 0.011 * lr, 5, 12),
              0,
              -cut + 0.008 * b.s,
              0,
              PI / 2,
              0,
              0,
              1,
              1,
              0.93,
            ),
            Object.assign({}, slv, { skin: sk }),
          );
      }
    }
    if (o.cuff)
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.04 * lr, 0.041 * lr, 0.045 * b.s, 12, true),
          0,
          -F + 0.028 * b.s,
          0,
          0,
          0,
          0,
          1,
          1,
          0.95,
        ),
        cloth(o.cuff),
      );
    H.hand(
      R,
      b,
      S,
      o.glove ? leatherM(o.glove, { region: "leather" }) : skin,
      lr,
    );
  };

  /**
   * Hand: palm with knuckle ridge, four separate three-jointed fingers curled
   * into a relaxed grip (they close around a weapon grip at the socket) and an
   * opposed thumb. Palm faces the body (−x·side); fingers spread along z.
   */
  H.hand = function (R, b, S, mat, lr) {
    const sg = S === "L" ? -1 : 1,
      s = b.s * Math.max(0.9, lr / b.s);
    const bone = "hand" + S;
    // palm: slightly cupped, wider at the knuckles
    const palm = P.box(0.03 * s, 0.08 * s, 0.078 * s, 0.012 * s);
    P.deform(palm, (v) => {
      const t = clamp((-v.y + 0.04 * s) / (0.08 * s), 0, 1);
      v.z *= 0.9 + 0.12 * t;
      if (v.x * sg < 0)
        v.x *= 1 - 0.25 * Math.exp(-(v.z * v.z) / (0.0008 * s * s));
    });
    R.add(bone, P.xf(palm, 0, -0.045 * s, -0.002 * s), mat);
    // knuckle ridge
    R.add(
      bone,
      P.xf(
        P.sphere(0.0125 * s, 0.012 * s, 0.041 * s, 8, 6),
        sg * 0.001 * s,
        -0.081 * s,
        -0.001 * s,
      ),
      mat,
    );
    // fingers (index at the front, next to the thumb); lengths & curl vary slightly.
    // Two finger bones per hand drive all four fingers: fing1 at the knuckles
    // (proximal phalanges) and fing2 at the middle joints, so hands can open
    // (talk gestures, cower), close into a fist (unarmed, melee, hands on hips)
    // or keep the relaxed grip (bind pose = holding a weapon). Skin weights
    // blend across both joints so the fingers bend instead of breaking.
    const kY = -0.084 * s,
      mY = kY - 0.034 * s;
    const fingers = R.has("hand" + S) && !R.has("fing1" + S) && R.bone && R.map;
    if (fingers) {
      R.bone("fing1" + S, bone, 0, kY, 0);
      R.bone("fing2" + S, "fing1" + S, -sg * 0.001 * s, mY - kY, 0);
      // the INDEX finger has its own pair (trigger finger, pointing); animations
      // drive it with the others unless they override it
      R.bone("fingI1" + S, bone, 0, kY, -0.027 * s);
      R.bone("fingI2" + S, "fingI1" + S, -sg * 0.001 * s, mY - kY, 0);
    }
    const hw = R.world(bone);
    const fSkinFor = (b1, b2) =>
      R.has(b2)
        ? (wx, wy, wz) => {
            const lx = wx - hw[0],
              ly = wy - hw[1];
            const d = Math.hypot(lx - sg * 0.001 * s, ly - kY); // from the knuckle
            const w1 = clamp((kY + 0.004 * s - ly) / (0.01 * s), 0, 1); // past the knuckle → finger
            const w2 = clamp((d - 0.028 * s) / (0.012 * s), 0, 1); // past the middle joint → fing2
            return [
              [b1, w1 * (1 - w2)],
              [b2, w1 * w2],
            ];
          }
        : null;
    const fSkinO = fSkinFor("fing1" + S, "fing2" + S);
    const fSkinI = R.has("fingI2" + S)
      ? fSkinFor("fingI1" + S, "fingI2" + S)
      : fSkinO;
    const F = [
      [-0.027, 0.95, 1.0],
      [-0.009, 1.05, 1.02],
      [0.009, 1.0, 1.05],
      [0.026, 0.82, 1.12],
    ];
    for (const [z, len, curl] of F) {
      const fSkin = z < -0.02 ? fSkinI : fSkinO;
      const k = len * s,
        zz = z * s;
      const pts = [
        [sg * 0.002 * s, -0.084 * s, zz],
        [-sg * 0.001 * s, -0.084 * s - 0.034 * k, zz * 1.02],
        [-sg * 0.022 * s * curl, -0.084 * s - 0.054 * k, zz * 1.03],
        [
          -sg * 0.04 * s * curl,
          -0.084 * s - 0.046 * k * (curl > 1.06 ? 0.85 : 1),
          zz * 1.03,
        ],
      ];
      R.add(
        bone,
        P.sweep(pts, (t) => (0.0098 - t * 0.0026) * s * (len < 0.9 ? 0.9 : 1), {
          seg: 6,
          rs: 6,
        }),
        fSkin ? Object.assign({}, mat, { skin: fSkin }) : mat,
      );
    }
    // thumb: thenar pad + two-segment thumb opposing the fingers
    R.add(
      bone,
      P.xf(
        P.sphere(0.018 * s, 0.028 * s, 0.018 * s, 7, 6),
        -sg * 0.01 * s,
        -0.035 * s,
        -0.03 * s,
      ),
      mat,
    );
    R.add(
      bone,
      P.sweep(
        [
          [-sg * 0.012 * s, -0.03 * s, -0.036 * s],
          [-sg * 0.024 * s, -0.058 * s, -0.05 * s],
          [-sg * 0.036 * s, -0.082 * s, -0.044 * s],
          [-sg * 0.042 * s, -0.098 * s, -0.03 * s],
        ],
        (t) => (0.012 - t * 0.003) * s,
        { seg: 6, rs: 6 },
      ),
      mat,
    );
  };

  /**
   * Leg: o = {pants, pantsRegion, skin (for shorts), shorts, boot, bootH (0..1 of shin), bootRegion, paint, kneePad}
   */
  H.leg = function (R, b, S, o) {
    const lr = b.limbR * (o.mul || 1);
    // blue-ish work trousers are jeans: twill denim with double-stitched seams
    const jeans =
      !o.pantsRegion &&
      typeof o.pants === "number" &&
      o.pants !== PAL.cryoGrey &&
      (() => {
        const c = L.col(o.pants);
        return c.b > c.r * 1.12 && c.b > c.g * 0.95;
      })();
    const pm =
      o.pantsMat ||
      cloth(o.pants, {
        region: o.pantsRegion || (jeans ? "denim" : "cloth"),
        paint: o.paint,
      });
    const skin = skinM(o.skin || 0xc08d68, {
      paint: o.skinPaint,
      region: o.skinRegion || "skin",
      emis: o.skinEmis || 0,
    });
    // one continuous hip→ankle tube (no knee cap / segment seams), skinned across the knee
    const T = b.thigh,
      Sh = b.shin,
      len = T + Sh + b.ankle * 0.4,
      fem = b.gender === "f" ? 1.04 : 1;
    const sk = limbSkin(
      R,
      "thigh" + S,
      "shin" + S,
      "hips",
      "foot" + S,
      T,
      T + Sh,
      b.s,
    );
    const keys = [
      [0, 0.09 * lr * fem],
      [T * 0.3, 0.092 * lr * fem + 0.004 * lr],
      [T * 0.75, 0.071 * lr],
      [T - 0.02 * b.s, 0.062 * lr],
      [T + 0.03 * b.s, 0.06 * lr],
      [T + Sh * 0.26, 0.066 * lr + 0.005 * lr],
      [T + Sh * 0.6, 0.052 * lr],
      [T + Sh, 0.043 * lr],
      [len, 0.042 * lr],
    ];
    const knee = { at: T + 0.005 * b.s, amt: 0.011 * lr };
    if (o.shorts) {
      R.add(
        "thigh" + S,
        limbTube(len, keys, { knee, flat: 0.95, mirrorU: S === "L" }),
        Object.assign({}, skin, { skin: sk }),
      );
      const cut = T + Sh * 0.1;
      const k2 = keys
        .filter((k) => k[0] < cut)
        .map((k) => [k[0], k[1] * 1.1 + 0.004 * b.s])
        .concat([[cut, 0.07 * lr]]);
      R.add(
        "thigh" + S,
        limbTube(cut, k2, { flat: 0.95, capB: false }),
        Object.assign({}, pm, { skin: sk }),
      );
    } else {
      R.add(
        "thigh" + S,
        limbTube(len, keys, { knee, flat: 0.95, mirrorU: S === "L" }),
        Object.assign({}, pm, { skin: sk }),
      );
    }
    H.boot(R, b, S, o);
  };

  /** Foot/boot on the foot bone (ankle joint), plus a boot shaft on the shin. */
  H.boot = function (R, b, S, o) {
    const s = b.s * (o.bootMul || 1);
    const bm =
      o.bootMat ||
      leatherM(o.boot || PAL.leatherDark, {
        region: o.bootRegion || "leather",
      });
    const sole = { color: 0x1c1a18, region: "rubber", rough: 0.9 };
    const foot = "foot" + S;
    const ah = b.ankle;
    // main foot volume heel→toe
    if (o.barefoot) {
      // bony bare foot: heel, arch and toes
      R.add(
        foot,
        P.xf(
          P.box(0.075 * s, ah + 0.01 * s, 0.22 * s, 0.03 * s),
          0,
          -ah / 2,
          -0.06 * s,
        ),
        bm,
      );
      R.add(
        foot,
        P.xf(
          P.sphere(0.04 * s, 0.025 * s, 0.05 * s, 8, 6),
          0,
          -ah * 0.7,
          -0.15 * s,
        ),
        bm,
      );
      return;
    }
    R.add(
      foot,
      P.xf(
        P.box(0.1 * s, ah + 0.035 * s, 0.25 * s, 0.03 * s),
        0,
        -ah / 2 + 0.012 * s,
        -0.06 * s,
      ),
      bm,
    );
    R.add(
      foot,
      P.xf(
        P.sphere(0.05 * s, 0.035 * s, 0.05 * s, 10, 7, 0, PI * 2, 0, PI / 2),
        0,
        -ah * 0.6 + 0.01 * s,
        -0.17 * s,
      ),
      bm,
    );
    if (o.barefoot) return;
    R.add(
      foot,
      P.xf(
        P.box(0.105 * s, 0.022 * s, 0.26 * s, 0.008 * s),
        0,
        -ah + 0.011 * s,
        -0.062 * s,
      ),
      sole,
    );
    // shaft
    const bh = o.bootH === undefined ? 0.35 : o.bootH;
    if (bh > 0.05) {
      const len = b.shin * bh;
      const g = P.limb(len, 0.058 * s, 0.056 * s, {
        seg: 10,
        capT: 0.002,
        capB: 0.02 * s,
      });
      P.xf(g, 0, -b.shin + len + 0.01 * s, 0.004 * s);
      R.add("shin" + S, g, bm);
      R.add(
        "shin" + S,
        P.xf(
          P.torus(0.057 * s, 0.008 * s, 4, 12),
          0,
          -b.shin + len + 0.01 * s,
          0.004 * s,
          PI / 2,
          0,
          0,
        ),
        bm,
      );
      // laces
      if (o.laces !== false)
        for (let i = 0; i < 3; i++)
          R.add(
            "shin" + S,
            P.xf(
              P.box(0.03 * s, 0.006 * s, 0.01 * s, 0.002),
              0,
              -b.shin + len * (0.25 + i * 0.25),
              -0.054 * s,
            ),
            { color: 0x2a2520, rough: 0.9 },
          );
    }
  };

  // ------------------------------------------------------------------
  // HEAD & FACE
  // ------------------------------------------------------------------
  /**
   * face: {skin, gender, hair, hairColor, beard, eyeColor, maniac, age (0..1),
   *        paint ('raider'|null), noseSize, jawW, brow, mutant, lipColor}
   */
  H.head = function (R, b, face) {
    const hs = b.headS;
    const C = [0, 0.105 * hs, -0.01 * hs];
    const RX = 0.09 * hs,
      RY = 0.118 * hs,
      RZ = 0.103 * hs;
    const maniac = !!face.maniac;
    const jawW = face.jawW || (face.gender === "f" ? 0.78 : 0.86);
    const skinCol = face.skin;
    const skinPaint =
      face.skinPaint ||
      (maniac
        ? H.grimePaint(face)
        : face.paint === "raider"
          ? H.raiderPaint(face.paintSeed || 1)
          : face.age > 0.5
            ? H.agePaint
            : null);
    const skin = skinM(skinCol, {
      region: "skin",
      paint: skinPaint,
      noise: maniac ? 0.1 : 0.06,
    });
    const mutant = !!face.mutant;
    const female = face.gender === "f";
    const browK = (face.brow || 1) * (female ? 0.7 : 1);
    // ---- skull: a deformed sphere sculpted into brow ridge, eye sockets, nose
    // bridge, cheekbones, cheek hollows, nasolabial folds, lips, chin & jaw.
    // A per-vertex tint array bakes ambient occlusion (sockets, under the brow,
    // folds, under the jaw) and a little warmth on the cheeks/lips.
    const g = P.sphere(1, 1, 1, 26, 20);
    const nV = g.attributes.position.count;
    const vt = new Float32Array(nV * 3);
    const gau = (dx, dy, w) => Math.exp(-(dx * dx + dy * dy) / w);
    const sm = (a0, a1, x) => {
      const t = clamp((x - a0) / (a1 - a0), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const segD = (px, py, ax, ay, bx, by) => {
      const vx = bx - ax,
        vy = by - ay;
      const t = clamp(
        ((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy),
        0,
        1,
      );
      return Math.hypot(px - ax - vx * t, py - ay - vy * t);
    };
    const stubble = !!face.stubble;
    P.deform(g, (v, i) => {
      let x = v.x,
        y = v.y,
        z = v.z;
      let shade = 1,
        warm = 0,
        blue = 0;
      // jaw taper & chin
      if (y < -0.25) {
        const t = (-y - 0.25) / 0.75;
        x *= lerp(1, jawW, Math.pow(t, 1.3));
        if (z < 0) z *= lerp(1, 1.05, t);
      }
      if (y < -0.55 && z < -0.4) {
        z -= 0.05 * (mutant ? 1.6 : 1);
      }
      // back of skull fuller, temples flatter
      if (z > 0) {
        z *= 1.07;
        y += z > 0.5 && y > 0 ? 0.03 : 0;
      }
      if (Math.abs(x) > 0.75 && y > -0.2 && y < 0.5) x *= 0.955;
      const f = sm(0.15, 0.7, -z); // front-facing weight
      if (f > 0) {
        // brow ridge
        const bw =
          Math.exp(-Math.pow((y - 0.29) / 0.085, 2)) *
          sm(0.8, 0.3, Math.abs(x));
        z -= (0.085 * browK + (mutant ? 0.1 : 0)) * bw * f;
        shade -=
          0.2 *
          Math.exp(-Math.pow((y - 0.19) / 0.055, 2)) *
          sm(0.7, 0.3, Math.abs(x)) *
          f; // shadow under the brow
        for (const sg of [-1, 1]) {
          // eye sockets
          const e = gau(x - sg * 0.36, y - 0.12, mutant ? 0.012 : 0.02);
          z += (mutant ? 0.14 : 0.13) * e * f;
          shade -= 0.46 * e * f;
          // cheekbones
          const cb = gau(x - sg * 0.52, y + 0.06, 0.03);
          z -= (maniac ? 0.02 : 0.05) * cb * f;
          x += sg * 0.035 * cb;
          warm += mutant ? 0 : cb * (female ? 0.7 : 0.35);
          // cheek hollows (gaunt on Maniacs)
          const hc = gau(x - sg * 0.48, y + 0.32, 0.03);
          z += (maniac ? 0.06 : 0.025) * hc * f;
          shade -= (maniac ? 0.14 : 0.06) * hc * f;
          // nasolabial folds
          const nd = segD(x, y, sg * 0.16, -0.2, sg * 0.31, -0.47);
          const nf = Math.exp(-Math.pow(nd / 0.035, 2)) * f;
          z += 0.022 * nf;
          shade -= 0.14 * nf * (face.age > 0.4 ? 1.4 : 1);
        }
        // nose bridge
        const nb =
          Math.exp(-(x * x) / 0.011) * sm(0.3, 0.12, y) * sm(-0.3, -0.08, y);
        z -= 0.13 * nb * f;
        shade += 0.06 * nb * f; // lit nose bridge
        // lips / muzzle
        const mo = gau(x * 0.8, y + 0.43, 0.03);
        z -= 0.05 * mo * f;
        warm += mutant ? 0 : mo * 0.6;
        shade -=
          0.22 *
          Math.exp(-Math.pow((y + 0.43) / 0.03, 2)) *
          sm(0.35, 0.2, Math.abs(x)) *
          f; // mouth line
        shade -= 0.08 * gau(x, y + 0.27, 0.004) * f; // under the nose
        // chin
        const cn = gau(x * (female ? 1.3 : 1), y + 0.72, 0.03);
        z -= (female ? 0.04 : 0.07) * cn * f;
        if (!female) x *= 1 + 0.08 * cn;
        shade -= 0.1 * gau(x, y + 0.58, 0.02) * f; // chin crease
        if (stubble && y < -0.28 && Math.abs(x) < 0.85)
          blue += 0.55 * sm(-0.28, -0.45, y);
      }
      // jaw angle: squarer on men
      if (y < -0.3 && y > -0.85 && Math.abs(x) > 0.4 && z > -0.6)
        x *= 1 + (female ? 0.02 : 0.08) * sm(-0.3, -0.6, y);
      if (mutant) {
        // lumpy cranium, heavy underbite, wide jaw
        if (y > 0.1) {
          const nn = L.noise3(x * 2.6 + 1.3, y * 2.6, z * 2.6) - 0.5;
          x *= 1 + nn * 0.12;
          y *= 1 + nn * 0.08;
          z *= 1 + nn * 0.12;
        }
        if (y < -0.4) {
          const k = sm(-0.4, -0.8, y);
          if (z < 0.2) z -= 0.11 * k;
          x *= 1 + 0.12 * k;
        }
      }
      // under-jaw & back-of-neck occlusion
      if (y < -0.62) shade -= 0.18 * sm(-0.62, -0.95, y);
      shade = clamp(shade, 0.38, 1.08);
      vt[i * 3] = shade * (1 + warm * 0.07 - blue * 0.1);
      vt[i * 3 + 1] = shade * (1 - warm * 0.03 - blue * 0.08);
      vt[i * 3 + 2] = shade * (1 - warm * 0.04 - blue * 0.02);
      v.set(C[0] + x * RX, C[1] + y * RY, C[2] + z * RZ);
    });
    R.add("head", g, Object.assign({}, skin, { vtint: vt }));
    const at = (x, y, z) => [C[0] + x * RX, C[1] + y * RY, C[2] + z * RZ];
    // eyes: white, iris, pupil, upper & lower lids
    const eyeWhite = maniac ? 0xe2b4a8 : mutant ? 0xd8c890 : 0xe8e2d8; // Maniacs: bloodshot
    const iris = face.eyeColor || 0x3a2a1a;
    const es = mutant ? 0.72 : 1.1;
    for (const sg of [-1, 1]) {
      const e = at(sg * 0.36, 0.13, -0.8);
      R.add(
        "head",
        P.xf(
          P.sphere(0.0158 * hs * es, 0.0145 * hs * es, 0.012 * hs * es, 10, 8),
          e[0],
          e[1],
          e[2],
        ),
        { color: eyeWhite, rough: 0.2, noise: 0.02, grad: [1, 1] },
      );
      R.add(
        "head",
        P.xf(
          P.sphere(0.0088 * hs * es, 0.0088 * hs * es, 0.0035 * hs, 10, 6),
          e[0],
          e[1],
          e[2] - 0.0108 * hs * es,
        ),
        { color: iris, rough: 0.15, noise: 0, grad: [1, 1] },
      );
      R.add(
        "head",
        P.xf(
          P.sphere(0.0042 * hs * es, 0.0042 * hs * es, 0.0015 * hs, 8, 4),
          e[0],
          e[1],
          e[2] - 0.0128 * hs * es,
        ),
        { color: 0x050403, rough: 0.05, noise: 0, grad: [1, 1] },
      );
      // upper lid (heavier & lower for mutants/angry)
      const lid = P.sphere(
        0.0172 * hs * es,
        0.0165 * hs * es,
        0.0138 * hs * es,
        10,
        6,
        0,
        PI * 2,
        0,
        PI * (face.angry || mutant ? 0.47 : 0.4),
      );
      P.xf(
        lid,
        e[0],
        e[1] + 0.0015 * hs,
        e[2] + 0.0005,
        -0.35,
        0,
        sg * (face.angry || mutant ? -0.18 : 0),
      );
      R.add("head", lid, skin);
      const llid = P.sphere(
        0.0168 * hs * es,
        0.016 * hs * es,
        0.0135 * hs * es,
        10,
        4,
        0,
        PI * 2,
        PI * 0.72,
        PI * 0.28,
      );
      P.xf(llid, e[0], e[1] - 0.001 * hs, e[2] + 0.0005, 0.2, 0, 0);
      R.add("head", llid, skin);
      // brows (thick for brutes)
      if (!maniac || face.brows !== false) {
        R.add(
          "head",
          P.xf(
            P.box(
              0.036 * hs,
              0.0095 * hs * (mutant ? 1.5 : 1),
              0.013 * hs,
              0.0035 * hs,
            ),
            e[0] + sg * 0.002,
            e[1] + 0.022 * hs,
            e[2] - 0.006 * hs,
            0.2,
            0,
            sg * -0.12 + (face.angry ? sg * 0.28 : 0),
          ),
          {
            color: L.shade(face.hairColor || 0x3a2616, 0.6),
            region: "fur",
            rough: 0.95,
            keepDark: true,
          },
        );
      }
    }
    // nose
    {
      const ns = face.noseSize || 1;
      // bridge wedge → rounded tip → flared wings with dark nostrils
      const n = P.sphere(
        0.0105 * hs * ns,
        0.026 * hs * ns,
        0.013 * hs * ns,
        9,
        7,
      );
      P.deform(n, (q) => {
        if (q.y < 0) {
          const k = 1 + 0.5 * (-q.y / (0.026 * hs * ns));
          q.x *= k;
          q.z *= 1 + 0.25 * (-q.y / (0.026 * hs * ns));
        }
      });
      const np = at(0, -0.1, -0.95);
      P.xf(n, np[0], np[1] + 0.002 * hs, np[2] - 0.004 * hs, -0.34, 0, 0);
      R.add("head", n, skin);
      R.add(
        "head",
        P.xf(
          P.sphere(0.0085 * hs * ns, 0.0078 * hs * ns, 0.0082 * hs * ns, 8, 6),
          np[0],
          np[1] - 0.013 * hs * ns,
          np[2] - 0.011 * hs * ns,
        ),
        skin,
      ); // tip
      for (const sg of [-1, 1]) {
        R.add(
          "head",
          P.xf(
            P.sphere(0.0078 * hs, 0.0068 * hs, 0.008 * hs, 7, 5),
            np[0] + sg * 0.0105 * hs * ns,
            np[1] - 0.016 * hs,
            np[2] + 0.0005 * hs,
          ),
          skin,
        );
        R.add(
          "head",
          P.xf(
            P.sphere(0.0034 * hs, 0.0022 * hs, 0.0032 * hs, 6, 4),
            np[0] + sg * 0.0055 * hs * ns,
            np[1] - 0.0205 * hs,
            np[2] - 0.005 * hs,
          ),
          { color: 0x1a0c08, rough: 1, noise: 0 },
        );
      }
    }
    // mouth & jaw (lower lip + teeth on jaw bone for talking / screaming)
    const lip =
      face.lipColor ||
      (maniac
        ? L.mix(skinCol, 0x7a4a44, 0.45)
        : L.mix(
            skinCol,
            face.gender === "f" ? 0x9a3a3c : 0x8a4a42,
            face.gender === "f" ? 0.6 : 0.38,
          ));
    const mp = at(0, -0.42, -0.94);
    {
      R.add(
        "head",
        P.xf(
          P.sphere(0.019 * hs, 0.0045 * hs, 0.007 * hs, 10, 6),
          mp[0],
          mp[1] + 0.0045 * hs,
          mp[2] + 0.001 * hs,
        ),
        { color: lip, rough: 0.5, noise: 0.05 },
      );
      R.add(
        "head",
        P.xf(
          P.box(0.03 * hs, 0.0014 * hs, 0.003 * hs, 0.0006),
          mp[0],
          mp[1],
          mp[2] - 0.0005,
        ),
        { color: 0x4a2a22, rough: 1, noise: 0 },
      );
    }
    // jaw bone: lower lip / lower teeth
    const jb = R.world("jaw"),
      hb = R.world("head");
    const jo = [
      mp[0] - (jb[0] - hb[0]),
      mp[1] - (jb[1] - hb[1]),
      mp[2] - (jb[2] - hb[2]),
    ];
    {
      R.add(
        "jaw",
        P.xf(
          P.sphere(0.02 * hs, 0.0062 * hs, 0.009 * hs, 10, 6),
          jo[0],
          jo[1] - 0.006 * hs,
          jo[2] + 0.001,
        ),
        { color: lip, rough: 0.5, noise: 0.05 },
      );
      if (face.mutant) {
        // brute underbite: a row of crooked, heavy lower teeth
        const tooth = {
          color: 0xcfc08a,
          rough: 0.45,
          noise: 0.25,
          grad: [0.7, 1.1],
        };
        for (let i = -2; i <= 2; i++)
          R.add(
            "jaw",
            P.xf(
              P.box(0.007 * hs, 0.009 * hs, 0.005 * hs, 0.0015 * hs),
              jo[0] + i * 0.0075 * hs,
              jo[1] - 0.001 * hs,
              jo[2] - 0.002 * hs + Math.abs(i) * 0.002 * hs,
              0,
              0,
              (i % 2) * 0.15,
            ),
            tooth,
          );
      }
    }
    // ears
    for (const sg of [-1, 1]) {
      const e = at(sg * 0.98, 0.0, 0.05);
      const ear = P.sphere(
        0.009 * hs,
        0.029 * hs * (face.mutant ? 0.8 : 1),
        0.019 * hs,
        8,
        7,
      );
      P.xf(ear, e[0] + sg * 0.003 * hs, e[1], e[2], 0, sg * 0.35, 0);
      R.add("head", ear, skin);
    }
    // hair / beard
    const hc = face.hairColor || 0x3a2616;
    if (face.hair && face.hair !== "none" && face.hair !== "bald")
      H.hair(R, b, face.hair, hc, C, RX, RY, RZ, face);
    if (face.beard) H.beard(R, b, face.beard, hc, C, RX, RY, RZ);
    return { C, RX, RY, RZ };
  };

  /**
   * Maniac skin (vertex paint) over an ordinary skin tone: ground-in dirt and
   * soot smudges, scabbed scratches and, on some, an old healed burn patch
   * (glossy pink-brown with a darker rim). Nothing mutant: just people who
   * stopped washing, eating and sleeping a long time ago.
   */
  H.grimePaint = function (face) {
    const burnSide = face.burn === "R" ? 1 : face.burn === "L" ? -1 : 0;
    const k = face.noScab ? 0.6 : 1;
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const n1 = L.noise3(wx * 9, wy * 9, wz * 9),
        n2 = L.noise3(wx * 27 + 7, wy * 27, wz * 27);
      if (n1 > 0.66) {
        const g = 1 - 0.18 * k;
        out[0] *= g;
        out[1] *= g * 0.97;
        out[2] *= g * 0.94;
      } // ground-in dirt
      else if (n1 < 0.26) {
        out[0] *= 0.95;
        out[1] *= 0.93;
        out[2] *= 0.91;
      } // grey-brown dust
      if (n2 > 0.84 && !face.noScab) {
        out[0] = out[0] * 0.7 + 0.12;
        out[1] *= 0.62;
        out[2] *= 0.6;
      } // scabbed scratches
      if (
        burnSide &&
        x * burnSide > 0.02 &&
        L.noise3(wx * 5 + 3, wy * 5, wz * 5) > 0.5
      ) {
        out[0] = out[0] * 0.75 + 0.2;
        out[1] = out[1] * 0.7 + 0.08;
        out[2] = out[2] * 0.7 + 0.07;
      } // old burn
    };
  };
  H.raiderPaint = function (seed) {
    const mode = seed % 3;
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      // war paint: black band across the eyes, or red handprint streaks
      if (nz < -0.3) {
        if (mode === 0 && Math.abs(y - 0.12) < 0.018) {
          out[0] *= 0.18;
          out[1] *= 0.16;
          out[2] *= 0.16;
        }
        if (mode === 1 && Math.sin(x * 160) > 0.3 && y < 0.14 && y > 0.02) {
          out[0] = 0.45;
          out[1] *= 0.2;
          out[2] *= 0.18;
        }
        if (mode === 2 && Math.abs(x) < 0.012) {
          out[0] *= 0.2;
          out[1] *= 0.2;
          out[2] *= 0.2;
        }
      }
    };
  };
  H.agePaint = function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
    if (L.noise3(wx * 40, wy * 40, wz * 40) > 0.7) {
      out[0] *= 0.9;
      out[1] *= 0.86;
      out[2] *= 0.84;
    }
  };

  /**
   * Hair via "hairline shells": an inflated skull sphere whose vertices
   * below a style-specific hairline collapse inside the skull.
   */
  H.hair = function (R, b, style, color, C, RX, RY, RZ, face) {
    const hs = b.headS;
    const mat = {
      color,
      region: "fur",
      rough: 0.9,
      noise: 0.15,
      grad: [0.85, 1.1],
    };
    if (face && face.hairStreak) {
      // grey through dark hair + one white streak from the left temple (story cast: Sister Dawn)
      const gc = L.col(face.streakColor || 0x9a968e),
        amt = face.hairStreak;
      mat.paint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        const fa = Math.atan2(-(x - C[0]), -(z - C[2])); // 0 = front, + toward the character's left
        let t =
          amt * (L.hash3(wx * 400, wy * 400, wz * 400) > 0.6 ? 0.4 : 0.06); // a little salt & pepper
        // the streak: a broad band swept back from the left temple (plateau, soft edges), down the hanging hair too
        const da = Math.abs(fa - 0.55),
          band = da < 0.26 ? 1 : Math.max(0, 1 - (da - 0.26) / 0.24);
        if (band > 0)
          t = Math.max(
            t,
            Math.min(1, amt * 1.2) * band * (y - C[1] > -0.06 * hs ? 1 : 0.85),
          );
        t = Math.min(1, t);
        out[0] = lerp(out[0], gc.r, t);
        out[1] = lerp(out[1], gc.g, t);
        out[2] = lerp(out[2], gc.b, t);
      };
    }
    // Shell over the skull. Vertices outside the style's hairline collapse
    // inside the skull; the kept ring next to the hairline is pulled down
    // onto the scalp (and the next ring half way), so the hair THINS OUT to a
    // natural hairline instead of ending in a helmet-like cliff.
    const shell = (inflate, keep, ws, hsg, vol, covK) => {
      vol = vol === undefined ? 0.04 : vol; // extra loft on the crown (real hair has volume on top, not a painted-on cap)
      ws = ws || 28;
      hsg = hsg || 20;
      covK = covK === undefined ? 1 : covK;
      if (face && !face._hairKeep && covK >= 1) face._hairKeep = keep; // the face texture paints a matching soft hairline under it
      const g = P.sphere(1, 1, 1, ws, hsg);
      const pos = g.attributes.position,
        n = pos.count,
        W = ws + 1;
      const ok = new Uint8Array(n);
      for (let i = 0; i < n; i++)
        ok[i] = keep(pos.getX(i), pos.getY(i), pos.getZ(i)) ? 1 : 0;
      // distance (in grid steps, ≤2) from the nearest collapsed vertex
      const edge = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        if (!ok[i]) continue;
        const r = Math.floor(i / W),
          c = i % W;
        let d = 3;
        for (let dr = -2; dr <= 2; dr++)
          for (let dc = -2; dc <= 2; dc++) {
            const rr = r + dr;
            if (rr < 0 || rr > hsg) continue;
            const cc = (((c + dc) % ws) + ws) % ws; // wrap round the seam
            if (!ok[rr * W + cc])
              d = Math.min(d, Math.max(Math.abs(dr), Math.abs(dc)));
          }
        edge[i] = d;
      }
      // the first ring OUTSIDE the hairline lies on the scalp too (coverage 0):
      // the fringe fades out over it instead of stopping at a polygon edge
      const out1 = new Uint8Array(n);
      for (let i = 0; i < n; i++) {
        if (ok[i]) continue;
        const r = Math.floor(i / W),
          c = i % W;
        for (let dr = -1; dr <= 1 && !out1[i]; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr;
            if (rr < 0 || rr > hsg) continue;
            if (ok[rr * W + ((((c + dc) % ws) + ws) % ws)]) {
              out1[i] = 1;
              break;
            }
          }
      }
      const cov = new Float32Array(n);
      const skull = face && face._skull,
        so = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < n; i++) {
        let x = pos.getX(i),
          y = pos.getY(i),
          z = pos.getZ(i);
        const e = edge[i],
          thin = e === 1 ? 0.12 : e === 2 ? 0.55 : 1;
        let k = ok[i] ? lerp(0.975, inflate, thin) : 0.88;
        cov[i] = (ok[i] ? (e === 1 ? 0.34 : e === 2 ? 0.78 : 1) : 0) * covK;
        if (skull) {
          // follow the sculpted skull surface; the edge ring sits ON the scalp
          // (+1.5 mm) and the shell thickens to `inflate` two rings in
          skull(x, y, z, so);
          x = so[0];
          y = so[1];
          z = so[2];
          if (ok[i])
            k = lerp(
              1.012,
              inflate + 0.01 + vol * Math.max(0, y) * Math.max(0, y),
              thin,
            );
          else if (out1[i] && covK >= 1) k = 1.006;
        } else if (z > 0) z *= 1.07;
        pos.setXYZ(
          i,
          C[0] + x * RX * k,
          C[1] + y * RY * k + (ok[i] && !skull ? 0.004 * hs * thin : 0),
          C[2] + z * RZ * k,
        );
      }
      g.computeVertexNormals();
      g.userData.hairCov = cov;
      return g;
    };
    // FUZZ: a second, sparser shell a few mm out (coverage ≈ 0.5) — strand
    // gaps break the helmet-smooth silhouette into loose hair; only on the
    // close-up LOD budget (≈1.1k tris)
    const fuzz = (inflate, keep, vol, k) =>
      R.add(
        "head",
        shell(inflate + 0.04, keep, 28, 20, vol, k === undefined ? 0.5 : k),
        Object.assign({}, mat, { rough: Math.min(1, mat.rough + 0.05) }),
      );
    // hairline: front at y>front (receding at the temples, a slight widow's
    // peak), sides above the ears, back down to the nape
    const fem = !!(face && face.gender === "f");
    const hairline = (front, side, back) => (x, y, z) => {
      const fz = clamp((-z + 1) / 2, 0, 1); // 1 at front, 0 at back
      const ax = Math.abs(x);
      // men: temple recession + slight widow's peak; women: a rounded arch (no recession — it read as a flat cap line)
      const shape = fem
        ? fz *
          fz *
          (0.035 * Math.exp(-(x * x) / 0.03) - 0.03 * L.smooth(0.2, 0.55, ax))
        : fz *
          fz *
          (0.09 * L.smooth(0.12, 0.42, ax) * (1 - L.smooth(0.55, 0.8, ax)) -
            0.035 * Math.exp(-(x * x) / 0.01));
      const lim =
        lerp(back, front, fz) +
        shape +
        (L.noise3(x * 9 + 1, y * 9, z * 9) - 0.5) * 0.03;
      const sideLim = ax > 0.7 ? Math.max(lim, side) : lim;
      return y > sideLim;
    };
    const thinning = face && face.maniac && face.hair === "patchy";
    const patchy = (fn) =>
      thinning
        ? (x, y, z) => fn(x, y, z) && L.noise3(x * 4 + 3, y * 4, z * 4) > 0.55
        : fn;
    switch (style) {
      case "buzz":
        R.add(
          "head",
          shell(1.02, patchy(hairline(0.62, 0.1, -0.35)), 0, 0, 0.01),
          mat,
        );
        break;
      case "short":
        R.add("head", shell(1.05, patchy(hairline(0.6, 0.08, -0.45))), mat);
        fuzz(1.05, patchy(hairline(0.6, 0.08, -0.45)));
        break;
      case "balding": {
        const kb = (x, y, z) =>
          hairline(0.5, 0.02, -0.45)(x, y, z) && !(y > 0.55 && z < 0.4);
        R.add("head", shell(1.035, kb, 0, 0, 0.01), mat);
        fuzz(1.02, kb, 0.01, 0.4);
        break;
      }
      case "slick": // 50s slicked-back
        R.add(
          "head",
          shell(1.06, hairline(0.63, 0.1, -0.4)),
          Object.assign({}, mat, { rough: 0.35 }),
        );
        break;
      case "pompadour": {
        R.add(
          "head",
          shell(1.06, hairline(0.63, 0.1, -0.4)),
          Object.assign({}, mat, { rough: 0.4 }),
        );
        const q = P.sphere(0.07 * hs, 0.042 * hs, 0.065 * hs, 12, 8);
        P.xf(q, C[0], C[1] + 0.1 * hs, C[2] - 0.04 * hs, -0.35, 0, 0);
        R.add("head", q, Object.assign({}, mat, { rough: 0.4 }));
        break;
      }
      case "mohawk": {
        // centre strip only: from the top of the forehead over the crown to the nape
        const strip = hairline(0.62, -0.2, -0.3);
        R.add(
          "head",
          shell(1.02, (x, y, z) => Math.abs(x) < 0.22 && strip(x, y, z)),
          mat,
        );
        for (let i = 0; i < 7; i++) {
          const a = lerp(-0.45, 1.75, i / 6); // front (−Z) → back (+Z) over the crown
          const px = 0,
            py = Math.cos(a) * RY * 1.02,
            pz = Math.sin(a) * RZ * 1.05;
          const tip = [
            px,
            py + Math.cos(a) * 0.075 * hs,
            pz + Math.sin(a) * 0.075 * hs,
          ];
          R.add(
            "head",
            P.sweep(
              [
                [px + C[0], py + C[1], pz + C[2]],
                [tip[0] + C[0], tip[1] + C[1], tip[2] + C[2]],
              ],
              (t) => (1 - t) * 0.016 * hs + 0.002,
              { seg: 3, rs: 5 },
            ),
            mat,
          );
        }
        break;
      }
      case "long":
      case "bob": {
        R.add(
          "head",
          shell(
            1.085,
            hairline(0.6, style === "bob" ? -0.45 : -0.6, -0.8),
            0,
            0,
            0.07,
          ),
          mat,
        );
        fuzz(
          1.085,
          hairline(0.6, style === "bob" ? -0.45 : -0.6, -0.8),
          0.07,
          0.55,
        );
        if (style === "long") {
          const rings = [];
          for (let i = 0; i <= 5; i++) {
            const t = i / 5;
            rings.push({
              y: C[1] - 0.02 * hs - t * 0.2 * hs,
              rx: lerp(0.088, 0.075, t) * hs,
              rz: lerp(0.07, 0.035, t) * hs,
              oz: C[2] + lerp(0.035, 0.07, t) * hs,
              n: 2,
            });
          }
          rings.reverse();
          R.add(
            "head",
            P.loft(rings, {
              seg: 14,
              a0: PI * 0.45,
              a1: PI * 1.55,
              capBottom: false,
            }),
            mat,
          );
        }
        break;
      }
      case "ponytail":
      case "bun": {
        R.add("head", shell(1.075, hairline(0.6, 0.0, -0.5), 0, 0, 0.07), mat);
        fuzz(1.075, hairline(0.6, 0.0, -0.5), 0.07, 0.45);
        if (style === "bun")
          R.add(
            "head",
            P.xf(
              P.sphere(0.042 * hs, 0.04 * hs, 0.04 * hs, 10, 8),
              C[0],
              C[1] + 0.07 * hs,
              C[2] + 0.1 * hs,
            ),
            mat,
          );
        else
          R.add(
            "head",
            P.sweep(
              [
                [C[0], C[1] + 0.04 * hs, C[2] + 0.1 * hs],
                [C[0], C[1] - 0.04 * hs, C[2] + 0.14 * hs],
                [C[0], C[1] - 0.16 * hs, C[2] + 0.12 * hs],
              ],
              (t) => (0.026 - t * 0.018) * hs,
              { seg: 6, rs: 7 },
            ),
            mat,
          );
        break;
      }
      case "afro":
        R.add(
          "head",
          shell(1.28, hairline(0.58, 0.1, -0.35)),
          Object.assign({}, mat, { rough: 1 }),
        );
        fuzz(1.29, hairline(0.58, 0.1, -0.35), 0.04, 0.6);
        break;
      case "wild": {
        // matted, unkempt hair
        const g = shell(1.12, hairline(0.56, -0.1, -0.7));
        P.deform(g, (v) => {
          const n = L.noise3(v.x * 60, v.y * 60, v.z * 60);
          v.x += (n - 0.5) * 0.02 * hs;
          v.y += (n - 0.5) * 0.015 * hs;
        });
        R.add("head", g, mat);
        fuzz(1.13, hairline(0.56, -0.1, -0.7), 0.04, 0.6);
        break;
      }
      case "patchy": {
        // thin hair in tufts: only inside a normal hairline (never across the face)
        const hl = hairline(0.6, 0.05, -0.5),
          kp = (x, y, z) =>
            hl(x, y, z) && L.noise3(x * 4 + 3, y * 4, z * 4) > 0.5;
        R.add("head", shell(1.035, kp, 0, 0, 0.02), mat);
        fuzz(1.04, kp, 0.02, 0.5);
        break;
      }
      default:
        R.add("head", shell(1.05, hairline(0.6, 0.08, -0.45)), mat);
        fuzz(1.05, hairline(0.6, 0.08, -0.45));
    }
  };

  H.beard = function (R, b, style, color, C, RX, RY, RZ) {
    const hs = b.headS;
    const mat = {
      color: L.shade(color, 0.9),
      region: "fur",
      rough: 0.95,
      noise: 0.18,
    };
    const g = P.sphere(1, 1, 1, 22, 16);
    P.deform(g, (v) => {
      const front = v.z < 0.15;
      let keep = front && v.y < -0.2 && Math.abs(v.x) < 0.95;
      if (style === "stubble") keep = keep && v.y < -0.3;
      if (style === "moustache")
        keep = v.z < -0.8 && v.y < -0.25 && v.y > -0.45 && Math.abs(v.x) < 0.38;
      // leave the mouth free
      if (
        keep &&
        style !== "moustache" &&
        v.z < -0.6 &&
        v.y > -0.55 &&
        v.y < -0.33 &&
        Math.abs(v.x) < 0.26
      )
        keep = false;
      const k = keep
        ? style === "full"
          ? 1.1
          : style === "stubble"
            ? 1.012
            : 1.05
        : 0.85;
      let x = v.x,
        y = v.y,
        z = v.z;
      if (y < -0.15) {
        const t = (-y - 0.15) / 0.85;
        x *= lerp(1, 0.8, Math.pow(t, 0.8));
        if (z < 0) z *= lerp(1, 1.06, t);
      }
      if (keep && style === "full" && y < -0.6) y -= 0.25;
      v.set(C[0] + x * RX * k, C[1] + y * RY * k, C[2] + z * RZ * k);
    });
    R.add("head", g, mat);
    if (style === "full" || style === "goatee") {
      R.add(
        "head",
        P.xf(
          P.sphere(0.024 * hs, 0.006 * hs, 0.01 * hs, 8, 5),
          C[0],
          C[1] - 0.046 * hs,
          C[2] - 0.095 * hs,
        ),
        mat,
      );
    }
  };

  // ------------------------------------------------------------------
  // HEADWEAR & ACCESSORIES (on head bone unless noted)
  // ------------------------------------------------------------------
  const HC = (b) => [0, 0.105 * b.headS, -0.01 * b.headS];
  H.hat = function (R, b, kind, color, color2) {
    const hs = b.headS,
      C = HC(b);
    const top = C[1] + 0.07 * hs;
    switch (kind) {
      case "fedora": {
        R.add(
          "head",
          P.xf(P.cyl(0.155 * hs, 0.16 * hs, 0.012 * hs, 18), C[0], top, C[2]),
          cloth(color, { region: "leather", rough: 0.9 }),
        );
        const crown = P.lathe(
          [
            [0.001, 0.105],
            [0.06, 0.1],
            [0.085, 0.085],
            [0.095, 0.03],
            [0.1, 0],
          ].map((p) => [p[0] * hs, p[1] * hs]),
          16,
        );
        P.deform(crown, (v) => {
          if (v.y > 0.08 * hs && Math.abs(v.x) < 0.03 * hs) v.y -= 0.02 * hs;
        }); // pinch
        R.add(
          "head",
          P.xf(crown, C[0], top, C[2]),
          cloth(color, { region: "leather" }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(0.101 * hs, 0.101 * hs, 0.02 * hs, 16, true),
            C[0],
            top + 0.018 * hs,
            C[2],
          ),
          cloth(color2 || 0x1a1612),
        );
        break;
      }
      case "cowboy": {
        const brim = P.lathe(
          [
            [0.19, 0.03],
            [0.15, 0.0],
            [0.09, 0.005],
          ].map((p) => [p[0] * hs, p[1] * hs]),
          20,
        );
        R.add(
          "head",
          P.xf(brim, C[0], top - 0.005 * hs, C[2]),
          leatherM(color),
        );
        R.add(
          "head",
          P.xf(
            P.lathe(
              [
                [0.001, 0.11],
                [0.07, 0.1],
                [0.095, 0.02],
                [0.1, 0],
              ].map((p) => [p[0] * hs, p[1] * hs]),
              16,
            ),
            C[0],
            top,
            C[2],
          ),
          leatherM(color),
        );
        break;
      }
      case "cap": {
        // newsboy / work cap
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.105 * hs,
              0.06 * hs,
              0.11 * hs,
              14,
              8,
              0,
              PI * 2,
              0,
              PI / 2,
            ),
            C[0],
            top - 0.02 * hs,
            C[2] + 0.005 * hs,
          ),
          cloth(color),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.13 * hs, 0.01 * hs, 0.075 * hs, 0.004 * hs),
            C[0],
            top - 0.02 * hs,
            C[2] - 0.12 * hs,
            -0.18,
            0,
            0,
          ),
          cloth(L.shade(color, 0.8)),
        );
        break;
      }
      case "hardhat": {
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.112 * hs,
              0.085 * hs,
              0.12 * hs,
              16,
              8,
              0,
              PI * 2,
              0,
              PI / 2,
            ),
            C[0],
            top - 0.03 * hs,
            C[2],
          ),
          { color: color || 0xd8a820, rough: 0.5, noise: 0.15 },
        );
        R.add(
          "head",
          P.xf(
            P.cyl(0.14 * hs, 0.14 * hs, 0.01 * hs, 18),
            C[0],
            top - 0.03 * hs,
            C[2] - 0.005 * hs,
          ),
          { color: color || 0xd8a820, rough: 0.5 },
        );
        break;
      }
      case "beret": {
        R.add(
          "head",
          P.xf(
            P.sphere(0.11 * hs, 0.035 * hs, 0.11 * hs, 14, 6),
            C[0] + 0.02 * hs,
            top + 0.01 * hs,
            C[2],
            0,
            0,
            -0.2,
          ),
          cloth(color || 0x2a2a30),
        );
        break;
      }
      case "helmet": {
        // army / combat helmet
        const g = P.sphere(
          0.12 * hs,
          0.1 * hs,
          0.128 * hs,
          18,
          10,
          0,
          PI * 2,
          0,
          PI * 0.55,
        );
        R.add(
          "head",
          P.xf(g, C[0], C[1] + 0.012 * hs, C[2]),
          metalM(color || PAL.olive, { metal: 0.3, rough: 0.6 }),
        );
        R.add(
          "head",
          P.xf(
            P.torus(0.121 * hs, 0.008 * hs, 4, 20),
            C[0],
            C[1] + 0.0 * hs,
            C[2],
            PI / 2,
            0,
            0,
            1,
            1.06,
            1,
          ),
          metalM(L.shade(color || PAL.olive, 0.7), { metal: 0.3 }),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.02 * hs, 0.06 * hs, 0.01 * hs, 0.003),
            C[0] - 0.1 * hs,
            C[1] - 0.04 * hs,
            C[2] + 0.01 * hs,
          ),
          leatherM(0x2a2016),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.02 * hs, 0.06 * hs, 0.01 * hs, 0.003),
            C[0] + 0.1 * hs,
            C[1] - 0.04 * hs,
            C[2] + 0.01 * hs,
          ),
          leatherM(0x2a2016),
        );
        break;
      }
      case "bandana": {
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.097 * hs,
              0.088 * hs,
              0.108 * hs,
              16,
              8,
              0,
              PI * 2,
              0,
              PI * 0.5,
            ),
            C[0],
            C[1] + 0.02 * hs,
            C[2] + 0.004 * hs,
          ),
          cloth(color || 0x8e1d17, { paint: dotPaint }),
        );
        R.add(
          "head",
          P.sweep(
            [
              [0, C[1] + 0.02 * hs, C[2] + 0.1 * hs],
              [0.02 * hs, C[1] - 0.03 * hs, C[2] + 0.13 * hs],
              [0.04 * hs, C[1] - 0.07 * hs, C[2] + 0.12 * hs],
            ],
            0.012 * hs,
            { seg: 4, rs: 5 },
          ),
          cloth(color || 0x8e1d17),
        );
        break;
      }
      case "hood": {
        const rings = [
          {
            y: C[1] - 0.16 * hs,
            rx: 0.15 * hs,
            rz: 0.14 * hs,
            oz: C[2] + 0.03 * hs,
            n: 2,
          },
          {
            y: C[1] - 0.05 * hs,
            rx: 0.115 * hs,
            rz: 0.13 * hs,
            oz: C[2] + 0.015 * hs,
            n: 2,
          },
          {
            y: C[1] + 0.06 * hs,
            rx: 0.112 * hs,
            rz: 0.125 * hs,
            oz: C[2] + 0.012 * hs,
            n: 2,
          },
          {
            y: C[1] + 0.12 * hs,
            rx: 0.085 * hs,
            rz: 0.1 * hs,
            oz: C[2] + 0.02 * hs,
            n: 2,
          },
          {
            y: C[1] + 0.145 * hs,
            rx: 0.03 * hs,
            rz: 0.04 * hs,
            oz: C[2] + 0.04 * hs,
            n: 2,
          },
        ];
        R.add(
          "head",
          P.loft(rings, {
            seg: 18,
            a0: PI * 0.22,
            a1: PI * 1.78,
            capTop: true,
          }),
          cloth(color),
        );
        break;
      }
      case "knit": {
        // close-fitting knit watch cap with a folded cuff
        const rib = (x, y, z, nx, ny, nz, out) => {
          if (Math.abs(Math.sin(Math.atan2(x, z) * 28)) < 0.3) {
            out[0] *= 0.82;
            out[1] *= 0.82;
            out[2] *= 0.82;
          }
        };
        const crown = P.sphere(
          0.098 * hs,
          0.1 * hs,
          0.11 * hs,
          18,
          10,
          0,
          PI * 2,
          0,
          PI * 0.54,
        );
        P.deform(crown, (v) => {
          if (v.y > 0.06 * hs) v.y += (v.y - 0.06 * hs) * 0.3;
        }); // a slightly peaked, slouchy top
        R.add(
          "head",
          P.xf(crown, C[0], C[1] + 0.05 * hs, C[2] + 0.01 * hs),
          cloth(color, { region: "rags", paint: rib }),
        );
        const cuff = P.cyl(0.1 * hs, 0.102 * hs, 0.03 * hs, 20, true);
        cuff.scale(1, 1, 1.1);
        R.add(
          "head",
          P.xf(cuff, C[0], C[1] + 0.062 * hs, C[2] + 0.008 * hs, -0.12, 0, 0),
          cloth(L.shade(color, 0.86), { region: "rags", paint: rib }),
        );
        break;
      }
      case "wrap": {
        // cloth head wrap: a wound band round the brow over a cloth cap, knot at the back
        R.add(
          "head",
          P.xf(
            P.sphere(
              0.098 * hs,
              0.1 * hs,
              0.11 * hs,
              16,
              8,
              0,
              PI * 2,
              0,
              PI * 0.52,
            ),
            C[0],
            C[1] + 0.05 * hs,
            C[2] + 0.008 * hs,
          ),
          cloth(color, { region: "rags" }),
        );
        for (let i = 0; i < 3; i++) {
          const band = P.torus(0.1 * hs, 0.011 * hs, 5, 22);
          band.scale(1, 1, 1.1);
          R.add(
            "head",
            P.xf(
              band,
              C[0],
              C[1] + (0.06 + i * 0.019) * hs,
              C[2] + 0.008 * hs,
              PI / 2 - 0.14 + i * 0.08,
              0,
              (i - 1) * 0.05,
            ),
            cloth(L.shade(color, 0.9 + i * 0.06), { region: "rags" }),
          );
        }
        R.add(
          "head",
          P.xf(
            P.sphere(0.03 * hs, 0.026 * hs, 0.024 * hs, 8, 6),
            C[0] + 0.02 * hs,
            C[1] + 0.03 * hs,
            C[2] + 0.118 * hs,
          ),
          cloth(L.shade(color, 0.85), { region: "rags" }),
        );
        R.add(
          "head",
          P.xf(
            P.box(0.03 * hs, 0.09 * hs, 0.008 * hs, 0.003 * hs),
            C[0] + 0.03 * hs,
            C[1] - 0.025 * hs,
            C[2] + 0.125 * hs,
            -0.15,
            0,
            0.12,
          ),
          cloth(color, { region: "rags" }),
        );
        break;
      }
      case "headphones": {
        R.add(
          "head",
          P.xf(
            P.torus(0.108 * hs, 0.009 * hs, 5, 18, PI),
            C[0],
            C[1] + 0.005 * hs,
            C[2] + 0.005 * hs,
            0,
            PI / 2,
            0,
          ),
          metalM(0x2a2a2a, { metal: 0.3 }),
        );
        for (const sg of [-1, 1])
          R.add(
            "head",
            P.xf(
              P.cyl(0.035 * hs, 0.035 * hs, 0.028 * hs, 12),
              C[0] + sg * 0.1 * hs,
              C[1] - 0.005 * hs,
              C[2] + 0.005 * hs,
              0,
              0,
              PI / 2,
            ),
            leatherM(0x1a1a1a),
          );
        R.add(
          "head",
          P.sweep(
            [
              [-0.11 * hs, C[1] - 0.02 * hs, C[2]],
              [-0.09 * hs, C[1] - 0.06 * hs, C[2] - 0.07 * hs],
              [-0.03 * hs, C[1] - 0.06 * hs, C[2] - 0.11 * hs],
            ],
            0.004 * hs,
            { seg: 6, rs: 4 },
          ),
          metalM(0x303030),
        );
        R.add(
          "head",
          P.xf(
            P.sphere(0.012 * hs, 0.012 * hs, 0.012 * hs, 8, 6),
            -0.03 * hs,
            C[1] - 0.06 * hs,
            C[2] - 0.11 * hs,
          ),
          leatherM(0x111111),
        );
        break;
      }
    }
  };
  function dotPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    if (Math.sin(wx * 150) * Math.sin(wy * 150) * Math.sin(wz * 150) > 0.35) {
      out[0] = out[0] * 0.3 + 0.55;
      out[1] = out[1] * 0.3 + 0.52;
      out[2] = out[2] * 0.3 + 0.48;
    }
  }

  // Hats & masks were sized for the old 0.09-wide skull; the sculpted head is
  // now 0.082 (22_face.js), so every head piece they add is narrowed in x to
  // match (brims, crowns, mask shells, straps, headphone cups…).
  H.HEAD_X = 0.082 / 0.09;
  const narrowHead = (fn) =>
    function (R) {
      const own = Object.prototype.hasOwnProperty.call(R, "add"),
        add0 = R.add;
      R.add = function (bn, g, m) {
        if (bn === "head" && g && typeof g.scale === "function")
          g.scale(H.HEAD_X, 1, 1);
        return add0.call(this, bn, g, m);
      };
      try {
        return fn.apply(this, arguments);
      } finally {
        if (own) R.add = add0;
        else delete R.add;
      }
    };
  H.glasses = function (R, b, kind) {
    // fitted to the sculpted face (22_face.js stores b._eyeFit); outfits call
    // this before the head exists, so the request is deferred until then
    const E = b._eyeFit;
    if (!E) {
      (b._pendingGlasses = b._pendingGlasses || []).push(kind);
      return;
    }
    const hs = b.headS;
    // 'weld' = round welding/work goggles (dark rubber cups, smoked green lenses);
    // 'weldup' = the same pushed up onto the forehead
    const weld = kind === "weld" || kind === "weldup",
      up = kind === "weldup";
    const gog = kind === "goggles" || weld;
    const lr =
      (weld ? 0.0215 : gog ? 0.0205 : kind === "sun" ? 0.0175 : 0.0155) * hs; // lens radius
    const lx = Math.max(E.x, lr + (gog ? 0.012 : 0.009) * hs); // lens centre (bridge clears the nose)
    const ly = E.y + (kind === "sun" ? 0.002 : 0) * hs + (up ? 0.052 * hs : 0);
    const lz =
      Math.min(E.cornea - (gog ? 0.013 : 0.011) * hs, E.nose - 0.004 * hs) +
      (up ? 0.004 * hs : 0); // in front of the cornea and the nose bridge
    const frame =
      kind === "sun"
        ? { color: 0x141210, rough: 0.35, metal: 0.4 }
        : metalM(kind === "square" ? 0x2a2420 : 0x6a5634, { rough: 0.35 });
    const side = E.side + (gog ? 0.006 : 0.003) * hs;
    for (const sg of [-1, 1]) {
      const cx = sg * lx;
      if (weld) {
        // dark rubber cups, a screw-on steel rim, smoked green lens
        const tilt = up ? -0.35 : 0;
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 1.0, lr * 1.16, 0.02 * hs, 14, true),
            cx,
            ly,
            lz + 0.007 * hs,
            PI / 2 + tilt,
            sg * 0.18,
            0,
          ),
          { color: 0x2a2826, region: "rubber", rough: 0.85 },
        );
        R.add(
          "head",
          P.xf(
            P.torus(lr * 1.02, 0.0045 * hs, 5, 16),
            cx,
            ly,
            lz - 0.003 * hs,
            tilt,
            sg * 0.18,
            0,
          ),
          metalM(0x8a8a84, { rough: 0.4 }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 0.92, lr * 0.92, 0.002 * hs, 14),
            cx,
            ly,
            lz - 0.002 * hs,
            PI / 2 + tilt,
            sg * 0.18,
            0,
          ),
          { color: 0x1c3026, rough: 0.05, metal: 0.55, emis: 0.03, cls: 0 },
        );
      } else if (gog) {
        // riveted brass cups with a leather gasket, tinted glass lens
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 1.02, lr * 1.12, 0.017 * hs, 14, true),
            cx,
            ly,
            lz + 0.006 * hs,
            PI / 2,
            sg * 0.18,
            0,
          ),
          metalM(0x6a5a3a, { rough: 0.5 }),
        );
        R.add(
          "head",
          P.xf(
            P.torus(lr * 1.05, 0.0035 * hs, 5, 16),
            cx,
            ly,
            lz - 0.002 * hs,
            0,
            sg * 0.18,
            0,
          ),
          metalM(0x7a6440, { rough: 0.4 }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 0.9, lr * 0.9, 0.002 * hs, 14),
            cx,
            ly,
            lz - 0.001 * hs,
            PI / 2,
            sg * 0.18,
            0,
          ),
          { color: 0x6a8070, rough: 0.05, metal: 0.5, emis: 0.05, cls: 0 },
        );
      } else {
        const shape = kind === "square" ? 1.25 : 1;
        R.add(
          "head",
          P.xf(
            P.torus(lr, 0.0016 * hs * (kind === "sun" ? 1.6 : 1), 4, 18),
            cx,
            ly,
            lz,
            0,
            sg * 0.1,
            0,
            shape,
            1,
            1,
          ),
          frame,
        );
        R.add(
          "head",
          P.xf(
            P.cyl(lr * 0.97, lr * 0.97, 0.0015 * hs, 16),
            cx,
            ly,
            lz,
            PI / 2,
            sg * 0.1,
            0,
            shape,
            1,
            1,
          ),
          kind === "sun"
            ? { color: 0x0a0a0a, rough: 0.08, metal: 0.35, cls: 0 }
            : {
                color: 0x3a4644,
                rough: 0.04,
                metal: 0.75,
                noise: 0,
                grad: [1, 1],
                cls: 0,
              },
        );
        // temple arm: from the lens' outer rim along the side of the head to behind the ear
        const ox = sg * (lx + lr * shape);
        R.add(
          "head",
          P.sweep(
            [
              [ox, ly + 0.002 * hs, lz + 0.002 * hs],
              [sg * side, ly + 0.003 * hs, lz + 0.022 * hs],
              [sg * (side + 0.001 * hs), ly + 0.001 * hs, E.sideZ + 0.01 * hs],
              [sg * (side - 0.004 * hs), ly - 0.016 * hs, E.sideZ + 0.03 * hs],
            ],
            0.0017 * hs * (kind === "sun" ? 1.4 : 1),
            { seg: 8, rs: 4 },
          ),
          frame,
        );
      }
    }
    if (gog) {
      // leather strap round the head at eye level (front ends at the cups)
      const pts = [],
        rzb = E.back - E.sideZ;
      for (let i = 0; i <= 10; i++) {
        const a = -PI / 2 + (PI * i) / 10;
        pts.push([
          Math.sin(a) * side * 1.02,
          ly + 0.004 * hs,
          E.sideZ + Math.cos(a) * rzb,
        ]);
      }
      pts.unshift([-(lx + lr), ly, lz + 0.008 * hs]);
      pts.push([lx + lr, ly, lz + 0.008 * hs]);
      R.add(
        "head",
        P.sweep(pts, (t) => (weld ? 0.006 : 0.0045) * hs, { seg: 24, rs: 4 }),
        weld
          ? { color: 0x26241f, region: "rubber", rough: 0.85 }
          : Object.assign(leatherM(0x2a2016), { rough: 0.8 }),
      );
      R.add(
        "head",
        P.xf(
          P.box(0.012 * hs, 0.006 * hs, 0.008 * hs, 0.001),
          0,
          ly,
          lz + 0.004 * hs,
        ),
        metalM(weld ? 0x5a5a56 : 0x6a5a3a),
      );
    } else {
      // bridge arching over the nose
      R.add(
        "head",
        P.sweep(
          [
            [-(lx - lr), ly + 0.002 * hs, lz],
            [0, ly + 0.006 * hs, lz - 0.002 * hs],
            [lx - lr, ly + 0.002 * hs, lz],
          ],
          0.0016 * hs,
          { seg: 6, rs: 4 },
        ),
        frame,
      );
    }
  };

  /** Gas mask / hockey mask / bandit bandana / respirator — raider & street faces. */
  const color2Side = (v) => (v === -1 ? -1 : 1);
  H.mask = function (R, b, kind, color, color2) {
    const hs = b.headS,
      C = HC(b);
    if (kind === "hockey") {
      const g = P.shell(
        0.097 * hs,
        0.12 * hs,
        0.104 * hs,
        16,
        12,
        PI * 0.78,
        PI * 0.12,
        PI * 0.62,
      );
      P.xf(g, C[0], C[1] - 0.005 * hs, C[2] - 0.008 * hs);
      R.add("head", g, {
        color: color || 0xd8d2c0,
        rough: 0.4,
        noise: 0.25,
        paint: (x, y, z, nx, ny, nz, out) => {
          if (
            Math.abs(y - C[1] - 0.012 * hs) < 0.012 * hs &&
            Math.abs(Math.abs(x) - 0.033 * hs) < 0.017 * hs
          ) {
            out[0] = out[1] = out[2] = 0.02;
          }
          if (L.hash3(x * 900, y * 900, z * 900) > 0.93) {
            out[0] *= 0.2;
            out[1] *= 0.2;
            out[2] *= 0.2;
          }
          if (Math.abs(x + 0.02 * hs) < 0.005 * hs && y < C[1]) {
            out[0] = 0.5;
            out[1] = 0.08;
            out[2] = 0.05;
          }
        },
      });
    } else if (kind === "gasmask") {
      const g = P.shell(
        0.099 * hs,
        0.112 * hs,
        0.108 * hs,
        18,
        12,
        PI * 0.95,
        PI * 0.2,
        PI * 0.62,
      );
      P.xf(g, C[0], C[1] - 0.01 * hs, C[2] - 0.004 * hs);
      R.add("head", g, {
        color: 0x2e3029,
        region: "rubber",
        rough: 0.8,
        noise: 0.1,
      });
      // head straps
      for (const yy of [0.03, -0.045])
        R.add(
          "head",
          P.xf(
            P.torus(0.101 * hs, 0.005 * hs, 4, 20, PI * 1.1),
            C[0],
            C[1] + yy * hs,
            C[2] + 0.004 * hs,
            PI / 2,
            0,
            PI * 0.95 + PI,
          ),
          { color: 0x262622, region: "rubber", rough: 0.85 },
        );
      for (const sg of [-1, 1])
        R.add(
          "head",
          P.xf(
            P.cyl(0.024 * hs, 0.024 * hs, 0.012 * hs, 14),
            sg * 0.036 * hs,
            C[1] + 0.014 * hs,
            C[2] - 0.1 * hs,
            PI / 2,
            0,
            0,
          ),
          { color: 0x7a8a70, rough: 0.05, metal: 0.4, emis: 0.05 },
        );
      R.add(
        "head",
        P.xf(
          P.cyl(0.03 * hs, 0.036 * hs, 0.05 * hs, 12),
          0,
          C[1] - 0.06 * hs,
          C[2] - 0.11 * hs,
          PI / 2 + 0.3,
          0,
          0,
        ),
        metalM(0x4a4a44),
      );
      R.add(
        "head",
        P.xf(
          P.cyl(0.037 * hs, 0.037 * hs, 0.006 * hs, 12),
          0,
          C[1] - 0.068 * hs,
          C[2] - 0.135 * hs,
          PI / 2 + 0.3,
          0,
          0,
        ),
        { color: 0x151515, region: "grille" },
      );
    } else if (kind === "respirator") {
      // industrial half-mask: rubber cup over nose & mouth, two small side cartridges, one strap
      const g = P.shell(
        0.1 * hs,
        0.07 * hs,
        0.11 * hs,
        16,
        8,
        PI * 0.75,
        PI * 0.58,
        PI * 0.3,
      );
      P.xf(g, C[0], C[1] - 0.03 * hs, C[2] - 0.006 * hs);
      R.add("head", g, {
        color: color || 0x3a3632,
        region: "rubber",
        rough: 0.75,
        noise: 0.12,
      });
      for (const sg of [-1, 1]) {
        R.add(
          "head",
          P.xf(
            P.cyl(0.022 * hs, 0.022 * hs, 0.022 * hs, 12),
            sg * 0.05 * hs,
            C[1] - 0.06 * hs,
            C[2] - 0.085 * hs,
            PI / 2,
            sg * 0.6,
            0,
          ),
          metalM(0x8a7a5a, { rough: 0.5, metal: 0.4 }),
        );
        R.add(
          "head",
          P.xf(
            P.cyl(0.018 * hs, 0.018 * hs, 0.004 * hs, 12),
            sg * 0.058 * hs,
            C[1] - 0.06 * hs,
            C[2] - 0.096 * hs,
            PI / 2,
            sg * 0.6,
            0,
          ),
          { color: 0xd8d0b8, region: "rags", rough: 0.95 },
        );
      }
      R.add(
        "head",
        P.xf(
          P.torus(0.102 * hs, 0.005 * hs, 4, 20, PI * 1.1),
          C[0],
          C[1] - 0.04 * hs,
          C[2] + 0.004 * hs,
          PI / 2,
          0,
          PI * 0.95 + PI,
        ),
        { color: 0x262622, region: "rubber", rough: 0.85 },
      );
    } else if (kind === "bandit") {
      const g = P.shell(
        0.101 * hs,
        0.085 * hs,
        0.112 * hs,
        16,
        8,
        PI * 1.05,
        PI * 0.55,
        PI * 0.36,
      );
      P.xf(g, C[0], C[1] - 0.012 * hs, C[2] - 0.002 * hs);
      R.add("head", g, cloth(color || 0x6a2a20, { paint: dotPaint }));
      R.add(
        "head",
        P.xf(
          P.cone(0.05 * hs, 0.08 * hs, 8),
          0,
          C[1] - 0.105 * hs,
          C[2] - 0.085 * hs,
          PI,
          0,
          0,
          1,
          1,
          0.4,
        ),
        cloth(color || 0x6a2a20),
      );
    } else if (kind === "scarf") {
      // cloth scarf wound round the neck and pulled up over the nose & mouth (plain weave, coloured bands)
      const band = (x, y, z, nx, ny, nz, out) => {
        if (Math.abs(Math.sin(((y - C[1]) / hs) * 160)) < 0.22) {
          out[0] *= 0.8;
          out[1] *= 0.8;
          out[2] *= 0.8;
        }
      };
      const g = P.shell(
        0.104 * hs,
        0.1 * hs,
        0.118 * hs,
        18,
        9,
        PI * 2,
        PI * 0.54,
        PI * 0.42,
      );
      P.deform(g, (v) => {
        const f = Math.max(0, -v.z / (0.118 * hs));
        v.z -= f * 0.008 * hs;
        v.x *= 1 + (L.noise3(v.x * 90, v.y * 90, v.z * 90) - 0.5) * 0.06;
      });
      P.xf(g, C[0], C[1] - 0.004 * hs, C[2] + 0.002 * hs);
      R.add(
        "head",
        g,
        cloth(color || 0x8e4e34, { region: "rags", paint: band }),
      );
      R.add(
        "head",
        P.xf(
          P.torus(0.098 * hs, 0.018 * hs, 6, 18),
          C[0],
          C[1] - 0.105 * hs,
          C[2] + 0.006 * hs,
          PI / 2 + 0.12,
          0,
          0,
          1,
          1.14,
          1,
        ),
        cloth(L.shade(color || 0x8e4e34, 0.9), { region: "rags" }),
      );
    } else if (kind === "bandage") {
      // linen bandage strips wound across the face: brow band, one diagonal over an eye, one under the jaw
      const lin = cloth(color || 0xcfc6b0, { region: "rags", rough: 1 });
      const strip = (t0, tl, rz, dy) => {
        const g = P.shell(
          0.099 * hs,
          0.121 * hs,
          0.116 * hs,
          18,
          2,
          PI * 1.25,
          t0,
          tl,
        );
        P.xf(g, 0, 0, 0, 0, 0, rz);
        P.xf(g, C[0], C[1] + (dy || 0) * hs, C[2] - 0.002 * hs);
        R.add("head", g, lin);
      };
      strip(PI * 0.3, PI * 0.075, 0.04);
      strip(PI * 0.42, PI * 0.07, color2Side(color2) * 0.42, 0.004);
      strip(PI * 0.63, PI * 0.085, -0.06);
      for (const sg of [-1, 1])
        R.add(
          "head",
          P.xf(
            P.box(0.02 * hs, 0.05 * hs, 0.006 * hs, 0.002 * hs),
            sg * 0.07 * hs,
            C[1] - 0.02 * hs,
            C[2] - 0.06 * hs,
            0,
            sg * 0.9,
            sg * 0.3,
          ),
          lin,
        ); // loose ends
    } else if (kind === "sack") {
      const g = P.sphere(0.104 * hs, 0.132 * hs, 0.112 * hs, 14, 10);
      P.deform(g, (v) => {
        v.x += (L.noise3(v.x * 90, v.y * 90, v.z * 90) - 0.5) * 0.008 * hs;
      });
      P.xf(g, C[0], C[1], C[2]);
      R.add(
        "head",
        g,
        cloth(0x9a8a64, {
          region: "rags",
          paint: (x, y, z, nx, ny, nz, out) => {
            if (
              nz < -0.5 &&
              Math.abs(y - C[1] - 0.012 * hs) < 0.013 * hs &&
              Math.abs(Math.abs(x) - 0.035 * hs) < 0.013 * hs
            ) {
              out[0] = out[1] = out[2] = 0.02;
            }
          },
        }),
      );
    }
  };

  H.hat = narrowHead(H.hat);
  H.mask = narrowHead(H.mask);

  /** Belt with buckle and optional pouches (on hips bone). */
  H.belt = function (R, b, color, buckle, pouches) {
    const rings = H.torsoRings(b).pelvis;
    const r = rings[3];
    const y = r.y + 0.02 * b.s;
    const g = P.loft(
      [
        { y: y - 0.024 * b.s, rx: r.rx * 1.05, rz: r.rz * 1.06, n: 2.3 },
        { y: y + 0.024 * b.s, rx: r.rx * 1.03, rz: r.rz * 1.04, n: 2.3 },
      ],
      { seg: 20 },
    );
    R.add("hips", g, leatherM(color || PAL.leather));
    R.add(
      "hips",
      P.xf(
        P.box(0.05 * b.s, 0.04 * b.s, 0.012 * b.s, 0.004 * b.s),
        0,
        y,
        -r.rz * 1.07,
      ),
      metalM(buckle || 0xb8a060, { metal: 0.8, rough: 0.35 }),
    );
    const ps = pouches || 0;
    for (let i = 0; i < ps; i++) {
      const a = (i % 2 ? 1 : -1) * (0.7 + Math.floor(i / 2) * 0.55);
      const x = Math.sin(a) * r.rx * 1.08,
        z = -Math.cos(a) * r.rz * 1.1;
      R.add(
        "hips",
        P.xf(
          P.box(0.06 * b.s, 0.07 * b.s, 0.035 * b.s, 0.008 * b.s),
          x,
          y - 0.03 * b.s,
          z,
          0,
          -a,
          0,
        ),
        leatherM(L.shade(color || PAL.leather, 1.15)),
      );
    }
    return y;
  };

  /** Coat skirt halves on the thighs (lab coat, duster, robe). len = fraction of leg length. */
  H.coatTails = function (R, b, mat, len, flare, closed) {
    const rings = H.torsoRings(b).pelvis;
    const W = rings[2].rx * 1.12,
      D = rings[2].rz * 1.16;
    const L_ = b.legLen * len;
    for (const [S, sg] of [
      ["L", -1],
      ["R", 1],
    ]) {
      const ox = -sg * b.hipW;
      const rs = [];
      const N = 5;
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        rs.push({
          y: b.hipDrop + 0.1 * b.s - t * (L_ + 0.1 * b.s),
          rx: W * (1 + flare * t),
          rz: D * (1 + flare * t * 0.9),
          ox,
          n: 2.2,
        });
      }
      rs.reverse();
      const gap = closed ? 0.0 : 0.07;
      const a0 = sg < 0 ? PI + 0.02 : gap * PI,
        a1 = sg < 0 ? PI * (2 - gap) : PI - 0.02;
      const g = P.loft(rs, { seg: 10, a0, a1 });
      // ragged hem
      P.deform(g, (v) => {
        if (v.y < b.hipDrop - L_ * 0.95)
          v.y += (L.hash3(v.x * 300, 1, v.z * 300) - 0.5) * 0.05 * b.s;
      });
      R.add("thigh" + S, g, mat);
    }
  };

  /** Backpack (on chest bone). */
  H.backpack = function (R, b, color, big) {
    const s = b.s * b.bulk;
    const z = H.torsoRings(b).chest[2].rz + 0.06 * s;
    R.add(
      "chest",
      P.xf(
        P.box(0.28 * s, 0.34 * s * (big ? 1.3 : 1), 0.14 * s, 0.04 * s),
        0,
        0.06 * s,
        z,
      ),
      cloth(color || 0x5a5038, { region: "rags" }),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.22 * s, 0.1 * s, 0.07 * s, 0.02 * s),
        0,
        -0.03 * s,
        z + 0.09 * s,
      ),
      cloth(L.shade(color || 0x5a5038, 0.85)),
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.07 * s, 0.07 * s, 0.34 * s, 10),
        0,
        0.26 * s * (big ? 1.2 : 1),
        z + 0.01 * s,
        0,
        0,
        PI / 2,
      ),
      cloth(0x6a3a2a, { region: "rags" }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.035 * s, 0.3 * s, 0.01 * s, 0.004),
          sg * 0.09 * s,
          0.1 * s,
          -H.torsoRings(b).chest[2].rz * 1.02,
        ),
        leatherM(0x3a2616),
      );
    if (big) {
      // trader's pots & pans
      R.add(
        "chest",
        P.xf(
          P.cyl(0.08 * s, 0.07 * s, 0.1 * s, 12),
          0.1 * s,
          -0.06 * s,
          z + 0.12 * s,
          PI / 2,
          0,
          0,
        ),
        metalM(0x6a6a60),
      );
      R.add(
        "chest",
        P.xf(
          P.cyl(0.06 * s, 0.06 * s, 0.018 * s, 12),
          -0.13 * s,
          0.1 * s,
          z + 0.1 * s,
          0,
          0,
          PI / 2,
        ),
        metalM(0x4a4a44),
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.018 * s, 0.1 * s, 0.018 * s, 0.004),
          -0.13 * s,
          0.0,
          z + 0.1 * s,
        ),
        leatherM(0x3a2616),
      );
    }
  };

  /**
   * Bulky cowl scarf (winter survivor wear, readable at a distance): a thick wound
   * collar round the neck, a drape over the shoulders and one long tail down
   * the front. Knit bands across it. o: {tail (0..1), drape (0..1), torn}
   */
  H.cowl = function (R, b, color, o) {
    o = o || {};
    const s = b.s,
      rings = H.torsoRings(b),
      cr = rings.chest;
    const knit = (x, y, z, nx, ny, nz, out) => {
      const k = Math.abs(Math.sin((y / s) * 95));
      if (k < 0.18) {
        out[0] *= 0.78;
        out[1] *= 0.78;
        out[2] *= 0.78;
      }
    };
    const m = cloth(color, { region: "rags", paint: knit });
    const drape = o.drape === undefined ? 1 : o.drape;
    if (drape > 0) {
      const g = P.loft(
        [
          {
            y: cr[2].y - 0.04 * s * drape,
            rx: cr[2].rx * 1.07,
            rz: cr[2].rz * 1.1,
            oz: cr[2].oz,
            n: 2.4,
          },
          {
            y: cr[3].y,
            rx: cr[3].rx * 1.06,
            rz: cr[3].rz * 1.16,
            oz: cr[3].oz,
            n: 2.6,
          },
          {
            y: cr[4].y + 0.012 * s,
            rx: cr[4].rx * 1.12,
            rz: cr[4].rz * 1.26,
            oz: cr[4].oz,
            n: 2.4,
          },
          {
            y: cr[5].y + 0.02 * s,
            rx: cr[5].rx * 1.5,
            rz: cr[5].rz * 1.55,
            oz: cr[5].oz,
            n: 2.2,
          },
        ],
        { seg: 18 },
      );
      if (o.torn)
        P.deform(g, (v) => {
          if (v.y < cr[3].y)
            v.y += (L.hash3(v.x * 300, 5, v.z * 300) - 0.5) * 0.05 * s;
        });
      R.add("chest", g, m);
    }
    // the wound roll round the neck
    R.add(
      "chest",
      P.xf(
        P.torus(0.074 * s, 0.03 * s, 7, 18),
        0,
        0.262 * s,
        0.006 * s,
        PI / 2 + 0.18,
        0,
        0,
        1.22,
        1.08,
        1,
      ),
      m,
    );
    R.add(
      "chest",
      P.xf(
        P.torus(0.07 * s, 0.022 * s, 6, 16),
        0,
        0.29 * s,
        0.006 * s,
        PI / 2 + 0.24,
        0,
        0.3,
        1.12,
        1.05,
        1,
      ),
      cloth(L.shade(color, 0.88), { region: "rags", paint: knit }),
    );
    const tail = o.tail === undefined ? 1 : o.tail;
    if (tail > 0) {
      const z0 = -cr[2].rz * 1.16 + (cr[2].oz || 0);
      const g = P.box(0.075 * s, 0.32 * s * tail, 0.016 * s, 0.006 * s, 3);
      P.deform(g, (v) => {
        v.z -=
          Math.sin(((0.16 * s * tail - v.y) / (0.32 * s * tail)) * PI) *
          0.012 *
          s;
        if (v.y < -0.15 * s * tail)
          v.y += (L.hash3(v.x * 500, 2, 1) - 0.5) * 0.03 * s;
      });
      R.add(
        "chest",
        P.xf(
          g,
          -0.055 * s,
          0.24 * s - 0.16 * s * tail,
          z0 - 0.004 * s,
          0.1,
          0,
          0.06,
        ),
        m,
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.08 * s, 0.022 * s, 0.02 * s, 0.006 * s),
          -0.055 * s,
          0.24 * s - 0.32 * s * tail + 0.01 * s,
          z0 - 0.012 * s,
          0.1,
          0,
          0.06,
        ),
        cloth(L.shade(color, 0.75), { region: "rags" }),
      ); // fringe hem
    }
  };
  /**
   * Bandage / cloth wraps wound round forearms ('arms') and shins ('legs'):
   * a spiral-banded open tube a little proud of the limb.
   */
  H.wraps = function (R, b, color, where, opts) {
    opts = opts || {};
    const lr = b.limbR * 0.93,
      s = b.s;
    const spiral = (x, y, z, nx, ny, nz, out) => {
      const a = Math.atan2(x, z);
      const k = Math.abs(Math.sin((y / s) * 70 + a));
      if (k < 0.2) {
        out[0] *= 0.68;
        out[1] *= 0.66;
        out[2] *= 0.64;
      } else if (k > 0.9) {
        out[0] *= 1.05;
        out[1] *= 1.05;
        out[2] *= 1.04;
      }
    };
    const m = cloth(color, { region: "rags", paint: spiral, rough: 1 });
    const fray = (g, y0) =>
      P.deform(g, (v) => {
        if (Math.abs(v.y - y0) < 0.004 * s)
          v.y += (L.hash3(v.x * 400, 7, v.z * 400) - 0.5) * 0.02 * s;
      });
    for (const S of ["L", "R"]) {
      if (where.indexOf("arms") >= 0 && (!opts.one || S === opts.one)) {
        const F = b.fore,
          top = opts.armTop === undefined ? 0.3 : opts.armTop,
          len = F * (0.97 - top);
        const g = P.cyl(0.05 * lr * 1.12, 0.036 * lr * 1.2, len, 12, true);
        fray(g, len / 2);
        R.add(
          "forearm" + S,
          P.xf(g, 0, -F * top - len / 2, 0, 0, 0, 0, 1, 1, 0.94),
          m,
        );
      }
      if (where.indexOf("legs") >= 0) {
        const Sh = b.shin,
          len = Sh * 0.52,
          k = b.limbR;
        const g = P.cyl(0.066 * k * 1.07, 0.046 * k * 1.14, len, 12, true);
        fray(g, len / 2);
        R.add(
          "shin" + S,
          P.xf(g, 0, -Sh * 0.4 - len / 2, 0, 0, 0, 0, 1, 1, 0.97),
          m,
        );
      }
    }
  };

  /** Straps crossing the chest (bandolier / harness). */
  H.strap = function (R, b, color, from, to, width, withRounds) {
    const s = b.s;
    const rings = H.torsoRings(b);
    const D = rings.chest[2].rz * 1.1,
      W = rings.chest[2].rx * 1.05;
    // straps across the front surface: sample points & push out onto the ellipse
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const t = i / 6;
      const x = lerp(from[0], to[0], t) * W,
        y = lerp(from[1], to[1], t) * s;
      const zf = -Math.sqrt(Math.max(0, 1 - Math.pow(x / (W * 1.05), 2))) * D;
      pts.push([x, y, zf - 0.006 * s]);
    }
    const g = P.sweep(pts, 0.012 * s * (width || 1), { seg: 12, rs: 4 });
    g.scale(1, 1, 1);
    R.add("chest", g, leatherM(color || PAL.leatherDark));
    if (withRounds)
      for (let i = 1; i < 6; i++) {
        const p = pts[i];
        R.add(
          "chest",
          P.xf(
            P.cyl(0.006 * s, 0.006 * s, 0.035 * s, 6),
            p[0],
            p[1],
            p[2] - 0.01 * s,
            0,
            0,
            Math.atan2(to[1] - from[1], ((to[0] - from[0]) * W) / s) + PI / 2,
          ),
          metalM(0xb8a050, { metal: 0.8 }),
        );
      }
  };

  /** Spiked shoulder pauldron (on arm bone). */
  H.pauldron = function (R, b, S, color, spikes, scale) {
    const sg = S === "L" ? -1 : 1,
      s = b.s * (scale || 1);
    if (color === "tire") {
      const g = P.sphere(
        0.095 * s,
        0.075 * s,
        0.1 * s,
        12,
        8,
        0,
        PI * 2,
        0,
        PI * 0.55,
      );
      P.xf(g, sg * 0.01 * s, 0.015 * s, 0, 0, 0, sg * -0.35);
      R.add("arm" + S, g, { color: 0x1e1e1e, region: "tire", rough: 0.9 });
    } else {
      // articulated SPAULDER (scavenged plate): a low domed cap over the
      // shoulder + three overlapping lames stepping down the upper arm, each
      // flaring at its lower edge, riveted — instead of one smooth half-egg
      const m = metalM(color || PAL.rust, { rough: 0.7, metal: 0.4 });
      const cap = P.sphere(
        0.09 * s,
        0.05 * s,
        0.095 * s,
        12,
        6,
        0,
        PI * 2,
        0,
        PI * 0.5,
      );
      P.xf(cap, sg * 0.012 * s, 0.022 * s, 0, 0, 0, sg * -0.3);
      R.add("arm" + S, cap, m);
      const arc = PI * 1.25,
        th0 = (sg > 0 ? PI / 2 : -PI / 2) - arc / 2;
      for (let i = 0; i < 3; i++) {
        const r0 = (0.083 - i * 0.004) * s,
          r1 = r0 + 0.012 * s,
          h = 0.042 * s;
        const band = new THREE.CylinderGeometry(
          r0,
          r1,
          h,
          12,
          1,
          true,
          th0,
          arc,
        );
        const tx = sg * (0.018 - i * 0.004) * s,
          ty = (-0.004 - i * 0.034) * s,
          rz = sg * (-0.26 + i * 0.07);
        P.xf(band, tx, ty, 0, 0, 0, rz);
        R.add("arm" + S, band, Object.assign({}, m, { grad: [0.72, 1.08] })); // lower edge lit, upper edge in the lame above's shadow
        const ra = sg > 0 ? PI / 2 : -PI / 2; // rivets on the outer face
        for (const da of [-0.5, 0.5])
          R.add(
            "arm" + S,
            P.xf(
              P.xf(
                P.sphere(0.006 * s, 0.006 * s, 0.006 * s, 5, 4),
                Math.sin(ra + da) * (r0 + 0.009 * s),
                0,
                Math.cos(ra + da) * (r0 + 0.009 * s),
              ),
              tx,
              ty,
              0,
              0,
              0,
              rz,
            ),
            metalM(0x8a8478, { rough: 0.4, metal: 0.8 }),
          );
      }
    }
    for (let i = 0; i < (spikes || 0); i++) {
      const a = (i / Math.max(1, spikes - 1) - 0.5) * 1.6;
      const base = [
        sg * 0.03 * s + Math.sin(a) * 0.03 * s * sg,
        0.07 * s,
        Math.sin(a) * 0.06 * s,
      ];
      R.add(
        "arm" + S,
        P.sweep(
          [base, [base[0] + sg * 0.03 * s, base[1] + 0.08 * s, base[2] * 1.2]],
          (t) => (1 - t) * 0.014 * s + 0.001,
          { seg: 3, rs: 5 },
        ),
        metalM(0x8a8a86, { rough: 0.35, metal: 0.8 }),
      );
    }
  };

  // ------------------------------------------------------------------
  // Standard clothed body (everything except exo-rigs)
  // ------------------------------------------------------------------
  /** look: {skin, top, bottom, sleeve, sleeveColor, glove, boot, bootH, ...} */
  H.body = function (R, b, look) {
    H.torso(R, b, look);
    const skinPaint = look.grime ? H.grimePaint({}) : null;
    const skinRegion = "skin";
    // grimy necks: lighter than the limbs (no scabs: on a 12-sided tube they read as a dark band under the jaw)
    const neckPaint = look.grime ? H.grimePaint({ noScab: true }) : null;
    H.neck(
      R,
      b,
      look.neckMat || skinM(look.skin, { paint: neckPaint, region: "skin" }),
    );
    for (const S of ["L", "R"]) {
      H.arm(R, b, S, {
        sleeve: look.sleeve || "long",
        sleeveColor: look.sleeveColor || look.top,
        sleeveRegion: look.sleeveRegion || look.topRegion,
        paintSleeve: look.paintSleeve || look.paintTop,
        sleeveMat: look.sleeveMat,
        skin: look.skin,
        skinPaint: look["skinPaint" + S] || skinPaint,
        skinRegion,
        skinEmis: look.glow ? 0.5 : 0,
        glove: look["glove" + S] !== undefined ? look["glove" + S] : look.glove,
        cuff: look.cuff,
        mul: look.armMul,
      });
      H.leg(R, b, S, {
        pants: look.bottom,
        pantsRegion: look.bottomRegion,
        pantsMat: look.pantsMat,
        paint: look.paintBottom,
        boot: look.boot,
        bootH: look.bootH,
        bootMat: look.bootMat,
        barefoot: look.barefoot,
        shorts: look.shorts,
        skin: look.skin,
        skinPaint,
        skinRegion,
        skinEmis: look.glow ? 0.5 : 0,
        laces: look.laces,
        mul: look.legMul,
      });
    }
  };

  // Paint helpers for clothing patterns
  H.plaid = function (c2, scale) {
    const k = scale || 38;
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const a = Math.sin(wx * k + wz * k * 0.7) > 0.55,
        bb = Math.sin(wy * k) > 0.55;
      if (a || bb) {
        const m = a && bb ? 0.55 : 0.75;
        const c = L.col(c2);
        out[0] = lerp(out[0], c.r, 1 - m);
        out[1] = lerp(out[1], c.g, 1 - m);
        out[2] = lerp(out[2], c.b, 1 - m);
      }
    };
  };
  H.stripeV = function (c2, halfW) {
    // vertical stripe down the front centre (zip placket)
    const c = L.col(c2);
    return function (x, y, z, nx, ny, nz, out) {
      if (Math.abs(x) < halfW && nz < -0.2) {
        out[0] = c.r;
        out[1] = c.g;
        out[2] = c.b;
      }
    };
  };

  // ==================================================================
  //  OUTFITS
  // ==================================================================
  const OUT = (H.outfits = {});

  /**
   * Project Long Winter cryo suit: grey-white PADDED suit — quilted torso &
   * limbs (stitched channels, puffed panels), a raised ORANGE collar ring,
   * grey boots & gloves, a darker zip placket, the C-9 unit patch on the
   * back and the Long Winter crystal on the left chest.
   */
  const quiltPaint = (pitch, k) => (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
    const q = Math.abs(Math.sin(wy * pitch)),
      d = Math.abs(Math.sin((wx + wz) * pitch * 0.7));
    if (q < 0.12) {
      out[0] *= 1 - k;
      out[1] *= 1 - k;
      out[2] *= 1 - k * 0.9;
    } // stitched channel
    else if (q > 0.85) {
      out[0] *= 1.05;
      out[1] *= 1.05;
      out[2] *= 1.04;
    } // puffed ridge catches light
    if (d < 0.05) {
      out[0] *= 1 - k * 0.5;
      out[1] *= 1 - k * 0.5;
      out[2] *= 1 - k * 0.45;
    } // diamond cross-stitch
  };
  OUT.cryo_suit = function (R, b, rng, look, o) {
    const grey = PAL.cryoGrey,
      orange = PAL.cryoOrange,
      trimC = PAL.cryoGreyDark;
    const qp = quiltPaint(58 / b.s, 0.2);
    Object.assign(look, {
      top: grey,
      bottom: grey,
      paintTop: qp,
      paintBottom: qp,
      paintSleeve: qp,
      sleeve: o.sleeve || "long",
      cuff: trimC,
      boot: 0x4a4c4a,
      bootH: 0.34,
      laces: false,
      glove: 0x5a5d5b,
      armMul: 1.06,
      legMul: 1.05,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // padded panels: puffed bands round chest, belly and hips
    for (const [bone, rs, k] of [
      ["chest", rings.chest.slice(0, 3), 1.03],
      ["spine", rings.abdomen, 1.035],
    ])
      R.add(
        bone,
        P.loft(scaleRings(rs, k, k + 0.01), { seg: 18 }),
        cloth(grey, { paint: qp }),
      );
    // zip placket down the front
    const placket = (rs, bone, a) =>
      R.add(
        bone,
        P.loft(scaleRings(rs, 1.045), { seg: 2, a0: -a, a1: a }),
        cloth(trimC, { noise: 0.06 }),
      );
    placket(rings.chest.slice(0, 5), "chest", 0.04);
    placket(rings.abdomen, "spine", 0.04);
    placket(rings.pelvis.slice(1), "hips", 0.04);
    // the raised orange collar ring (padded), with a grey neck seal inside
    R.add(
      "chest",
      P.xf(
        P.torus(0.07 * b.s, 0.022 * b.s, 8, 20),
        0,
        0.245 * b.s,
        0.004 * b.s,
        PI / 2 + 0.22,
        0,
        0,
        1.18,
        1,
        1.05,
      ),
      cloth(orange, { rough: 0.55, noise: 0.06 }),
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.058 * b.s, 0.066 * b.s, 0.035 * b.s, 16, true),
        0,
        0.255 * b.s,
        0.004 * b.s,
        0.22,
        0,
        0,
        1.15,
        1,
        1,
      ),
      cloth(trimC),
    );
    // elbow / knee pads
    for (const S of ["L", "R"]) {
      R.add(
        "forearm" + S,
        P.xf(
          P.sphere(0.05 * b.s, 0.05 * b.s, 0.045 * b.s, 10, 7),
          0,
          0.005 * b.s,
          0.015 * b.s,
        ),
        cloth(trimC, { paint: qp }),
      );
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(0.058 * b.s, 0.06 * b.s, 0.04 * b.s, 10, 7),
          0,
          0.0,
          -0.035 * b.s,
        ),
        cloth(trimC, { paint: qp }),
      );
    }
    R.decal(
      "chest",
      "longwinter",
      0.07 * b.s,
      0.07 * b.s,
      -0.075 * b.s,
      0.14 * b.s,
      -rings.chest[2].rz * 1.07 - 0.004,
      0,
      0,
      0,
    );
    R.decal(
      "chest",
      "unitpatch",
      0.15 * b.s,
      0.075 * b.s,
      0,
      0.12 * b.s,
      rings.chest[2].rz * 1.06 + 0.004,
      0,
      PI,
      0,
      { rough: 0.9 },
    );
    H.belt(R, b, 0x3c3e3c, 0x9a9c98, o.utility ? 4 : 2);
    if (o.security) {
      // facility guard: grey chest plate + riot helmet with visor
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 4), 1.1, 1.14), {
          seg: 14,
          a0: -PI * 0.42,
          a1: PI * 0.42,
        }),
        metalM(0x5a5e60, { metal: 0.3, rough: 0.6 }),
      );
      H.hat(R, b, "helmet", 0x5a5e60);
      R.add(
        "head",
        P.xf(
          P.shell(
            0.13 * b.headS,
            0.12 * b.headS,
            0.135 * b.headS,
            16,
            8,
            PI * 0.85,
            PI * 0.33,
            PI * 0.3,
          ),
          0,
          0.105 * b.headS,
          -0.004 * b.headS,
        ),
        { color: 0x7a90a0, rough: 0.05, metal: 0.35, emis: 0.03 },
      );
      R.add(
        "head",
        P.xf(
          P.box(
            0.2 * b.headS,
            0.016 * b.headS,
            0.03 * b.headS,
            0.006 * b.headS,
          ),
          0,
          0.17 * b.headS,
          -0.12 * b.headS,
        ),
        metalM(orange, { metal: 0.3 }),
      );
    }
  };

  /** Facility Director: white shirt & narrow tie under a charcoal tailored jacket, grey slacks, Long Winter pin. */
  OUT.director_suit = function (R, b, rng, look, o) {
    const shirt = 0xd8d6d0,
      jacket = 0x36383c,
      slacks = 0x4a4c50,
      tie = 0x7a2e1e;
    Object.assign(look, {
      top: shirt,
      bottom: slacks,
      sleeve: "long",
      sleeveColor: jacket,
      cuff: shirt,
      boot: 0x1a1816,
      bootH: 0.12,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // open jacket: torso panels left/right of the shirt front, lapels, skirt over the hips
    for (const [bone, rs, k] of [
      ["chest", rings.chest.slice(0, 5), 1.04],
      ["spine", rings.abdomen, 1.05],
      ["hips", rings.pelvis.slice(2), 1.07],
    ])
      R.add(
        bone,
        P.loft(scaleRings(rs, k), { seg: 16, a0: 0.32, a1: PI * 2 - 0.32 }),
        cloth(jacket),
      );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.05 * b.s, 0.19 * b.s, 0.012 * b.s, 0.004),
          sg * 0.05 * b.s,
          0.11 * b.s,
          -rings.chest[2].rz * 1.07,
          0.1,
          sg * 0.3,
          sg * 0.25,
        ),
        cloth(0x2a2c30),
      );
    R.add(
      "chest",
      P.xf(
        P.box(0.03 * b.s, 0.24 * b.s, 0.008 * b.s, 0.003),
        0,
        0.07 * b.s,
        -rings.chest[2].rz * 1.05,
        0.08,
        0,
        0,
      ),
      cloth(tie),
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.032 * b.s, 0.022 * b.s, 0.014 * b.s, 0.004),
        0,
        0.2 * b.s,
        -rings.chest[2].rz * 1.0,
        0.1,
        0,
        0,
      ),
      cloth(tie),
    ); // knot
    R.add(
      "chest",
      P.xf(
        P.torus(0.06 * b.s, 0.012 * b.s, 6, 16),
        0,
        0.245 * b.s,
        0.004 * b.s,
        PI / 2 + 0.25,
        0,
        0,
        1.15,
        1,
        1,
      ),
      cloth(shirt),
    );
    R.decal(
      "chest",
      "longwinter",
      0.04 * b.s,
      0.04 * b.s,
      -0.085 * b.s,
      0.15 * b.s,
      -rings.chest[2].rz * 1.09 - 0.003,
      0,
      0,
      0,
    );
    H.belt(R, b, 0x151515, 0x9a9c98, 0);
  };

  /**
   * Scavenged road sign plate (raider armour): 'stop' red octagon, 'warn'
   * yellow diamond, 'speed' white rectangle, 'oneway' black arrow sign —
   * a border plate with the painted face plate on top, bolted at the corners.
   * Built facing -Z at the origin, then placed with (x,y,z, rx,ry,rz).
   */
  H.signPlate = function (R, bone, kind, size, x, y, z, rx, ry, rz) {
    const shape = (k) => {
      if (kind === "stop") {
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a = ((i + 0.5) / 8) * PI * 2;
          pts.push([Math.cos(a) * k, Math.sin(a) * k]);
        }
        return pts;
      }
      if (kind === "warn")
        return [
          [0, k],
          [k, 0],
          [0, -k],
          [-k, 0],
        ];
      if (kind === "oneway")
        return [
          [-k * 1.3, -k * 0.45],
          [k * 1.3, -k * 0.45],
          [k * 1.3, k * 0.45],
          [-k * 1.3, k * 0.45],
        ];
      return [
        [-k * 0.75, -k],
        [k * 0.75, -k],
        [k * 0.75, k],
        [-k * 0.75, k],
      ];
    };
    const face =
      { stop: 0x9a2418, warn: 0xc49a1c, speed: 0xc8c4b4, oneway: 0x1e1e1c }[
        kind
      ] || 0xc8c4b4;
    const rim =
      { stop: 0xd8d4c8, warn: 0x1a1a18, speed: 0x1a1a18, oneway: 0xd8d4c8 }[
        kind
      ] || 0x1a1a18;
    const paint = {
      region: "raidpaint",
      rough: 0.6,
      metal: 0.35,
      noise: 0.25,
      cls: 0,
    };
    const place = (g, dz) => {
      g.rotateY(PI);
      g.translate(0, 0, -dz);
      P.xf(g, x, y, z, rx || 0, ry || 0, rz || 0);
      return g;
    };
    R.add(
      bone,
      place(P.extrude(shape(size), 0.006, 0.0015), 0),
      Object.assign({ color: rim }, paint),
    );
    R.add(
      bone,
      place(P.extrude(shape(size * 0.84), 0.004, 0), 0.004),
      Object.assign({ color: face }, paint),
    );
    if (kind === "oneway")
      R.add(
        bone,
        place(
          P.extrude(
            [
              [-size, -0.12 * size],
              [size * 0.5, -0.12 * size],
              [size * 0.5, -0.3 * size],
              [size, 0],
              [size * 0.5, 0.3 * size],
              [size * 0.5, 0.12 * size],
              [-size, 0.12 * size],
            ],
            0.003,
            0,
          ),
          0.007,
        ),
        Object.assign({ color: 0xd8d4c8 }, paint),
      );
    if (kind === "warn")
      R.add(
        bone,
        place(
          P.extrude(
            [
              [-0.05 * size, -0.3 * size],
              [0.05 * size, -0.3 * size],
              [0.07 * size, 0.35 * size],
              [-0.07 * size, 0.35 * size],
            ],
            0.003,
            0,
          ),
          0.007,
        ),
        Object.assign({ color: 0x1a1a18 }, paint),
      );
    for (const [bx, by] of [
      [-0.55, 0.55],
      [0.55, 0.55],
      [-0.55, -0.55],
      [0.55, -0.55],
    ]) {
      // bolt heads at the corners
      R.add(
        bone,
        place(
          P.xf(P.sphere(0.0065, 0.0065, 0.004, 5, 3), bx * size, by * size, 0),
          0.008,
        ),
        metalM(0x9a9a90, { rough: 0.4 }),
      );
    }
  };

  OUT.raider = function (R, b, rng, look, o) {
    const v = o.variant !== undefined ? o.variant : rng.int(0, 3);
    // sun-baked, mismatched scavenged materials: browns, rust, faded khaki & denim
    const leather = rng.pick([
      PAL.leather,
      0x6a4a2e,
      0x4e3422,
      PAL.leatherLight,
      0x5a4030,
    ]);
    const pants = rng.pick([0x4a5a6c, 0x5a4a36, 0x6a5e44, 0x4e463a, 0x5a5448]);
    const sign = rng.pick(["stop", "warn", "speed", "oneway", null]);
    const rings = H.torsoRings(b);
    const fz = rings.chest[2].rz;
    if (v === 0) {
      // strapped bare chest (women get a leather tube top)
      const fem = b.gender === "f";
      Object.assign(look, {
        topMat: fem
          ? leatherM(leather)
          : skinM(look.skin, { paint: H.raiderTattoo(rng.int(0, 9)) }),
        abdomenMat: skinM(look.skin),
        bottom: pants,
        sleeve: "none",
        boot: 0x3a2a1c,
        bootH: 0.45,
        glove: rng.chance(0.5) ? 0x3a2a1a : null,
      });
      H.body(R, b, look);
      H.strap(R, b, leather, [-0.95, 0.19], [0.8, -0.02], 1.4, rng.chance(0.5));
      H.strap(
        R,
        b,
        L.shade(leather, 0.8),
        [0.95, 0.19],
        [-0.8, -0.02],
        1.4,
        false,
      );
      H.pauldron(R, b, "L", rng.chance(0.5) ? "tire" : PAL.rust, rng.int(2, 4));
      // leather harness ring where the straps cross
      R.add(
        "chest",
        P.xf(
          P.torus(0.018 * b.s, 0.005 * b.s, 4, 10),
          0.01 * b.s,
          0.1 * b.s,
          -fz * 1.12,
        ),
        metalM(0xa09880, { rough: 0.35 }),
      );
    } else if (v === 1) {
      // leather vest over bare arms + tyre pauldron
      Object.assign(look, {
        top: leather,
        topRegion: "leather",
        topMat: leatherM(leather, { paint: H.raiderPaintCloth }),
        bottom: pants,
        sleeve: "none",
        boot: 0x3a2a1c,
        bootH: 0.4,
        glove: 0x2e2218,
      });
      H.body(R, b, look);
      H.pauldron(R, b, "R", "tire", 0);
      H.pauldron(R, b, "L", PAL.steelDark, 3);
      H.strap(R, b, 0x3a2616, [-0.9, 0.2], [0.7, -0.03], 1.2, true);
      // open vest front shows a dirty undershirt
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(1, 5), 1.012), {
          seg: 4,
          a0: -PI * 0.08,
          a1: PI * 0.08,
        }),
        cloth(0x9a8e70, { region: "rags" }),
      );
    } else if (v === 2) {
      // scrap plate chest on a torn shirt
      Object.assign(look, {
        top: rng.pick([PAL.rag1, PAL.rag3, 0x7a3a28, 0x6a6a48]),
        topRegion: "rags",
        bottom: pants,
        sleeve: "short",
        boot: 0x3a2a1c,
        bootH: 0.45,
      });
      H.body(R, b, look);
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 4), 1.1, 1.15), {
          seg: 10,
          a0: -PI * 0.38,
          a1: PI * 0.38,
        }),
        metalM(rng.pick([0x8a4a22, 0x7a7a6a, 0x9a8a3a]), {
          rough: 0.8,
          metal: 0.4,
          region: "raidpaint",
        }),
      );
      H.pauldron(R, b, rng.chance(0.5) ? "L" : "R", PAL.rust, rng.int(1, 3));
    } else {
      // spiked leather biker jacket with red paint slashes
      const jk = rng.pick([0x4a3a2e, 0x5a4230, 0x44403a]);
      Object.assign(look, {
        top: jk,
        topRegion: "leather",
        topMat: leatherM(jk, { paint: H.raiderPaintCloth }),
        sleeve: "long",
        sleeveMat: leatherM(jk),
        bottom: pants,
        boot: 0x2e241a,
        bootH: 0.5,
        glove: 0x2a2018,
      });
      H.body(R, b, look);
      H.pauldron(R, b, "L", 0x5a5a56, 4, 0.9);
      H.pauldron(R, b, "R", 0x5a5a56, 4, 0.9);
      // popped collar
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.xf(
            P.box(0.06 * b.s, 0.05 * b.s, 0.012 * b.s, 0.004),
            sg * 0.05 * b.s,
            0.24 * b.s,
            -0.03 * b.s,
            -0.35,
            sg * 0.5,
            0,
          ),
          leatherM(jk),
        );
    }
    // asymmetric scavenged plate: road sign on the chest, back or thigh
    if (sign && v !== 2) {
      const where = rng.int(0, 2);
      if (where === 0)
        H.signPlate(
          R,
          "chest",
          sign,
          0.085 * b.s,
          (rng.chance(0.5) ? -1 : 1) * 0.07 * b.s,
          0.1 * b.s,
          -fz * 1.12,
          0.1,
          rng.range(-0.3, 0.3),
          rng.range(-0.4, 0.4),
        );
      else if (where === 1)
        H.signPlate(
          R,
          "chest",
          sign,
          0.12 * b.s,
          0,
          0.1 * b.s,
          fz * 1.14,
          -0.05,
          PI,
          rng.range(-0.3, 0.3),
        );
      else {
        const S = rng.chance(0.5) ? "L" : "R";
        H.signPlate(
          R,
          "thigh" + S,
          sign,
          0.07 * b.s,
          (S === "L" ? -1 : 1) * 0.02 * b.s,
          -0.16 * b.s,
          -0.09 * b.s,
          0.05,
          0,
          rng.range(-0.5, 0.5),
        );
      }
    }
    // knee pads (steel or tyre rubber), bracers, rag wraps
    for (const S of ["L", "R"]) {
      if (rng.chance(0.6))
        R.add(
          "shin" + S,
          P.xf(
            P.sphere(
              0.06 * b.s,
              0.065 * b.s,
              0.045 * b.s,
              10,
              7,
              0,
              PI * 2,
              0,
              PI * 0.6,
            ),
            0,
            -0.01 * b.s,
            -0.035 * b.s,
            -PI / 2,
            0,
            0,
          ),
          rng.chance(0.4)
            ? { color: 0x2a2a28, region: "tire", rough: 0.9 }
            : metalM(rng.pick([PAL.rust, 0x6a6a64]), { rough: 0.8 }),
        );
      if (rng.chance(0.5))
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.05 * b.s, 0.045 * b.s, 0.12 * b.s, 10),
            0,
            -b.fore * 0.6,
            0,
          ),
          leatherM(L.shade(leather, 0.85)),
        );
      else if (rng.chance(0.4))
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.048 * b.s, 0.043 * b.s, 0.09 * b.s, 10),
            0,
            -b.fore * 0.72,
            0,
          ),
          cloth(0xb0a68a, { region: "rags" }),
        );
    }
    H.belt(R, b, 0x3a2616, 0xc8c0a0, rng.int(1, 3));
    // head
    const hw = rng.int(0, 5);
    if (hw === 0) H.mask(R, b, "hockey");
    else if (hw === 1) H.mask(R, b, "gasmask");
    else if (hw === 2)
      H.mask(R, b, "bandit", rng.pick([0x8a2a20, 0x5a4a3a, 0x5a6a3a]));
    else if (hw === 3 && rng.chance(0.4)) H.mask(R, b, "sack");
    if (rng.chance(0.25)) H.glasses(R, b, "goggles");
  };
  H.raiderTattoo = function (seed) {
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const k = Math.sin(wx * 60 + seed) * Math.cos(wy * 45 + seed * 2);
      if (k > 0.82 && nz < 0.2) {
        out[0] *= 0.35;
        out[1] *= 0.38;
        out[2] *= 0.5;
      }
      if (L.noise3(wx * 20, wy * 20, wz * 20) > 0.74) {
        out[0] *= 0.7;
        out[1] *= 0.65;
        out[2] *= 0.6;
      } // grime
    };
  };
  H.raiderPaintCloth = function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
    if (nz > 0.3 && Math.abs(Math.sin(wx * 25 + wy * 10)) < 0.12) {
      out[0] = 0.4;
      out[1] = 0.05;
      out[2] = 0.04;
    }
  };

  OUT.raider_heavy = function (R, b, rng, look, o) {
    const hl = rng.pick([0x4a3526, 0x5a4030, 0x3e3a30]);
    Object.assign(look, {
      top: hl,
      topRegion: "leather",
      bottom: rng.pick([0x4a5a6c, 0x4e4436, 0x5a5040]),
      sleeve: "long",
      sleeveColor: hl,
      sleeveRegion: "leather",
      glove: 0x2a2018,
      boot: 0x2e241a,
      bootH: 0.55,
    });
    b.bulk = 1.06;
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const plate = (c) =>
      metalM(c, {
        rough: 0.75,
        metal: 0.45,
        region: rng.chance(0.5) ? "raidpaint" : "metal",
      });
    // road sign breastplate + car-door back plate
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.12, 1.18), {
        seg: 12,
        a0: -PI * 0.45,
        a1: PI * 0.45,
      }),
      plate(rng.pick([0xa88a2a, 0x8a3a22, 0x5a6a4a, 0x7a7a70])),
    );
    if (rng.chance(0.6))
      H.signPlate(
        R,
        "chest",
        rng.pick(["stop", "warn", "oneway"]),
        0.1 * b.s,
        rng.range(-0.05, 0.05) * b.s,
        0.09 * b.s,
        -rings.chest[2].rz * 1.22,
        0.12,
        rng.range(-0.2, 0.2),
        rng.range(-0.35, 0.35),
      );
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.12, 1.18), {
        seg: 12,
        a0: PI * 0.6,
        a1: PI * 1.4,
      }),
      plate(0x6e6e68),
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.12, 1.15), {
        seg: 12,
        a0: -PI * 0.4,
        a1: PI * 0.4,
      }),
      plate(0x7a5a34),
    );
    for (let i = 0; i < 8; i++) {
      const a = (i / 7 - 0.5) * PI * 0.8;
      R.add(
        "chest",
        P.xf(
          P.sphere(0.009 * b.s, 0.009 * b.s, 0.009 * b.s, 5, 4),
          Math.sin(a) * rings.chest[2].rx * 1.1,
          0.19 * b.s,
          -Math.cos(a) * rings.chest[2].rz * 1.17,
        ),
        metalM(0x9a9a90),
      );
    }
    H.pauldron(R, b, "L", PAL.rust, 5, 1.15);
    H.pauldron(R, b, "R", PAL.steelDark, 3, 1.1);
    for (const S of ["L", "R"]) {
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.1 * b.s, 0.26 * b.s, 0.03 * b.s, 0.01 * b.s),
          0,
          -0.13 * b.s,
          -0.06 * b.s,
        ),
        plate(0x7a6a56),
      );
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.056 * b.s, 0.05 * b.s, 0.18 * b.s, 10),
          0,
          -b.fore * 0.55,
          0,
        ),
        plate(0x5a4a3a),
      );
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.12 * b.s, 0.2 * b.s, 0.025 * b.s, 0.01 * b.s),
          0,
          -0.15 * b.s,
          -0.085 * b.s,
          0.05,
          0,
          0,
        ),
        S === "L"
          ? { color: 0x2a2a28, region: "tire", rough: 0.9 }
          : plate(0x5e5e52),
      );
    }
    H.belt(R, b, 0x3a2616, 0xc8c0a0, 3);
    // helmet with face cage
    H.hat(R, b, "helmet", rng.pick([0x6a6a60, 0x8a4a22, 0x7a6a3a]));
    const hs = b.headS,
      C = HC(b);
    for (let i = 0; i < 4; i++)
      R.add(
        "head",
        P.xf(
          P.cyl(0.004 * hs, 0.004 * hs, 0.13 * hs, 5),
          -0.045 * hs + i * 0.03 * hs,
          C[1] - 0.02 * hs,
          C[2] - 0.115 * hs,
        ),
        metalM(0x7a7a70),
      );
    R.add(
      "head",
      P.xf(
        P.torus(0.07 * hs, 0.005 * hs, 4, 12, PI),
        0,
        C[1] - 0.02 * hs,
        C[2] - 0.05 * hs,
        PI / 2,
        0,
        PI,
      ),
      metalM(0x7a7a70),
    );
  };

  OUT.settler = function (R, b, rng, look, o) {
    const shirt = rng.pick([
      0x8a3a2a, 0x3a5a7a, 0x6a6a3a, 0x7a5a3a, 0x5a3a5a, 0xa08a5a,
    ]);
    const plaid = rng.chance(0.55);
    Object.assign(look, {
      top: shirt,
      paintTop: plaid ? H.plaid(L.shade(shirt, 0.45)) : null,
      bottom: rng.pick([PAL.denim, PAL.khaki, 0x4a4030, 0x3a3a3a]),
      sleeve: rng.pick(["long", "rolled", "rolled", "short"]),
      boot: rng.pick([0x3a2616, 0x2a2018, 0x4a3420]),
      bootH: rng.range(0.2, 0.4),
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    if (rng.chance(0.45)) {
      // overalls bib / apron
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 4), 1.02), {
          seg: 8,
          a0: -PI * 0.25,
          a1: PI * 0.25,
        }),
        cloth(look.bottom),
      );
      for (const sg of [-1, 1])
        R.add(
          "chest",
          P.xf(
            P.box(0.03 * b.s, 0.2 * b.s, 0.01 * b.s, 0.003),
            sg * 0.07 * b.s,
            0.12 * b.s,
            -rings.chest[2].rz * 1.05,
            0.2,
            0,
            0,
          ),
          cloth(look.bottom),
        );
    }
    H.belt(R, b, PAL.leather, 0xa08a50, rng.int(0, 2));
    if (rng.chance(0.3))
      H.strap(R, b, PAL.leatherDark, [-0.9, 0.2], [0.8, -0.05], 1, false);
  };

  OUT.drifter = function (R, b, rng, look, o) {
    const coat = rng.pick([0x6a5a40, 0x5a4a38, 0x4a4234, 0x7a6a4a]);
    Object.assign(look, {
      top: rng.pick([PAL.rag1, PAL.rag3, 0x5a5448]),
      topRegion: "rags",
      bottom: rng.pick([PAL.khaki, PAL.rag2, PAL.denim]),
      bottomRegion: "rags",
      sleeve: "long",
      sleeveColor: coat,
      sleeveRegion: "leather",
      glove: rng.chance(0.6) ? 0x3a2a1a : null,
      boot: 0x3a2616,
      bootH: 0.5,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // duster coat: upper panels + long tails
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.07), {
        seg: 16,
        a0: PI * 0.08,
        a1: PI * 1.92,
      }),
      leatherM(coat),
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.1), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(coat),
    );
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(2), 1.12), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(coat),
    );
    H.coatTails(R, b, leatherM(coat), 0.72, 0.35);
    // scarf
    // scarf: a cowl draped over the trapezius slope up around the neck (follows
    // the collar line instead of floating as a ring), plus a hanging knot tail
    {
      const s = b.s,
        c3 = rings.chest[3],
        c4 = rings.chest[4],
        c5 = rings.chest[5];
      const cowl = [
        {
          y: c4.y + 0.004 * s,
          rx: c4.rx * 0.95 + 0.007 * s,
          rz: c4.rz * 0.97 + 0.009 * s,
          oz: -0.004 * s,
          n: 2.4,
        },
        {
          y: c5.y - 0.002 * s,
          rx: c5.rx * 1.12 + 0.01 * s,
          rz: c5.rz * 1.18 + 0.01 * s,
          oz: -0.006 * s,
          n: 2.2,
        },
        { y: 0.278 * s, rx: 0.068 * s, rz: 0.066 * s, oz: -0.002 * s, n: 2.1 },
        { y: 0.3 * s, rx: 0.061 * s, rz: 0.06 * s, oz: 0.002 * s, n: 2 },
      ];
      const sm = cloth(rng.pick([0x7a3a2a, 0x4a5a4a, 0x8a7a5a]), {
        region: "rags",
      });
      R.add("chest", P.loft(cowl, { seg: 16 }), sm);
      const tail = P.box(0.042 * s, 0.1 * s, 0.012 * s, 0.004 * s);
      R.add(
        "chest",
        P.xf(
          tail,
          0.022 * s,
          c3.y + 0.005 * s,
          -(c3.rz + (c3.oz || 0) * -1) - 0.006 * s,
          -0.12,
          0,
          0.18,
        ),
        sm,
      );
    }
    H.belt(R, b, PAL.leatherDark, 0x8a8a80, 2);
    if (rng.chance(0.5)) H.glasses(R, b, "goggles");
  };

  OUT.merchant = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: rng.pick([0xb8a888, 0x9a8a6a, 0x7a8a9a]),
      bottom: rng.pick([PAL.khaki, 0x5a4a3a]),
      sleeve: "rolled",
      boot: 0x3a2616,
      bootH: 0.45,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const vest = rng.pick([0x3a2a1a, 0x4a3a2a, 0x2a3a2a]);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.05), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(vest),
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.06), {
        seg: 16,
        a0: PI * 0.1,
        a1: PI * 1.9,
      }),
      leatherM(vest),
    );
    for (let i = 0; i < 2; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.06 * b.s, 0.05 * b.s, 0.02 * b.s, 0.006),
          (i ? 0.08 : -0.08) * b.s,
          0.03 * b.s,
          -rings.chest[1].rz * 1.1,
        ),
        leatherM(L.shade(vest, 1.2)),
      );
    H.strap(R, b, PAL.leatherDark, [0.9, 0.2], [-0.8, -0.03], 1.2, true);
    H.backpack(R, b, 0x6a5a3a, true);
    H.belt(R, b, PAL.leather, 0xb8a060, 3);
    H.hat(
      R,
      b,
      look.layers
        ? rng.pick(["knit", "cap", "wrap"])
        : rng.pick(["cowboy", "fedora", "cap"]),
      rng.pick([0x5a4028, 0x3a3a3a, 0x6a5a40]),
    );
  };

  OUT.doctor = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: 0x7a8a9a,
      bottom: 0x3a3a40,
      sleeve: "long",
      sleeveColor: PAL.labWhite,
      glove: rng.chance(0.4) ? 0x9ab0b8 : null,
      boot: 0x222222,
      bootH: 0.15,
    });
    H.body(R, b, look);
    labCoat(R, b, PAL.labWhite);
    // red cross armband (left upper arm) + stethoscope
    R.add(
      "armL",
      P.xf(
        P.cyl(0.066 * b.limbR, 0.066 * b.limbR, 0.06 * b.s, 12, true),
        0,
        -b.upper * 0.35,
        0,
      ),
      { color: 0xffffff, region: "redcross", rough: 0.9, noise: 0.03 },
    );
    const rings = H.torsoRings(b);
    R.add(
      "chest",
      P.sweep(
        [
          [-0.06 * b.s, 0.24 * b.s, -0.02 * b.s],
          [-0.09 * b.s, 0.12 * b.s, -rings.chest[1].rz * 1.12],
          [-0.03 * b.s, 0.02 * b.s, -rings.chest[1].rz * 1.14],
          [0.03 * b.s, 0.02 * b.s, -rings.chest[1].rz * 1.14],
          [0.09 * b.s, 0.12 * b.s, -rings.chest[1].rz * 1.12],
          [0.06 * b.s, 0.24 * b.s, -0.02 * b.s],
        ],
        0.005 * b.s,
        { seg: 20, rs: 4 },
      ),
      { color: 0x222222, rough: 0.5 },
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.016 * b.s, 0.016 * b.s, 0.008 * b.s, 10),
        0,
        0.0,
        -rings.chest[1].rz * 1.16,
        PI / 2,
        0,
        0,
      ),
      metalM(0xc0c0c0),
    );
    H.glasses(R, b, "round");
  };
  function labCoat(R, b, color) {
    const rings = H.torsoRings(b);
    const m = cloth(color, { rough: 0.85, grad: [0.85, 1.05] });
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.06), {
        seg: 18,
        a0: PI * 0.07,
        a1: PI * 1.93,
      }),
      m,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.08), {
        seg: 18,
        a0: PI * 0.07,
        a1: PI * 1.93,
      }),
      m,
    );
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(2), 1.1), {
        seg: 18,
        a0: PI * 0.07,
        a1: PI * 1.93,
      }),
      m,
    );
    H.coatTails(R, b, m, 0.55, 0.15);
    // lapels + pockets
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.box(0.045 * b.s, 0.16 * b.s, 0.01 * b.s, 0.003),
          sg * 0.06 * b.s,
          0.14 * b.s,
          -rings.chest[2].rz * 1.08,
          0.15,
          sg * 0.3,
          sg * 0.25,
        ),
        m,
      );
      R.add(
        "hips",
        P.xf(
          P.box(0.08 * b.s, 0.07 * b.s, 0.01 * b.s, 0.003),
          sg * 0.1 * b.s,
          0.0,
          -rings.pelvis[2].rz * 1.13,
        ),
        cloth(L.shade(color, 0.93)),
      );
    }
    R.add(
      "chest",
      P.xf(
        P.box(0.06 * b.s, 0.06 * b.s, 0.008 * b.s, 0.002),
        -0.09 * b.s,
        0.09 * b.s,
        -rings.chest[2].rz * 1.09,
      ),
      cloth(L.shade(color, 0.93)),
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.004 * b.s, 0.004 * b.s, 0.06 * b.s, 5),
        -0.1 * b.s,
        0.12 * b.s,
        -rings.chest[2].rz * 1.1,
      ),
      metalM(0x2a4a8a),
    );
  }
  H.labCoat = labCoat;

  OUT.lab_coat = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: rng.pick([0xc8c8c0, 0x9ab0c8]),
      bottom: rng.pick([0x3a3a40, 0x5a4a3a]),
      sleeve: "long",
      sleeveColor: PAL.labWhite,
      boot: 0x1a1a1a,
      bootH: 0.12,
      laces: false,
    });
    H.body(R, b, look);
    labCoat(R, b, PAL.labWhite);
    // tie
    const rings = H.torsoRings(b);
    R.add(
      "chest",
      P.xf(
        P.box(0.03 * b.s, 0.16 * b.s, 0.008 * b.s, 0.003),
        0,
        0.13 * b.s,
        -rings.chest[2].rz * 1.06,
        0.12,
        0,
        0,
      ),
      cloth(rng.pick([0x7a1a1a, 0x1a2a5a, 0x2a4a2a])),
    );
    H.glasses(R, b, rng.chance(0.5) ? "round" : "square");
  };

  /** Glowkeepers: bleached linen / ochre robes, a golden stole, a big twelve-ray sun disc on the chest and a twelve-ray sun pendant. */
  OUT.glowkeeper_robes = function (R, b, rng, look, o) {
    const robe = rng.pick([0xa89878, 0x8a6a3a, 0x9a8a6a, 0x6e4e3a]),
      gold = PAL.sunGold;
    Object.assign(look, {
      top: robe,
      topRegion: "rags",
      bottom: robe,
      bottomRegion: "rags",
      sleeve: "long",
      boot: 0x3a2a1a,
      bootH: 0.15,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const m = cloth(robe, { region: "rags" });
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.06), { seg: 16 }),
      m,
    );
    R.add("spine", P.loft(scaleRings(rings.abdomen, 1.1), { seg: 16 }), m);
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(1), 1.14), { seg: 16 }),
      m,
    );
    H.coatTails(R, b, m, 0.95, 0.5, true);
    for (const S of ["L", "R"])
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.075 * b.s, 0.1 * b.s, b.fore * 0.62, 12, true),
          0,
          -b.fore * 0.55,
          0,
        ),
        m,
      ); // bell sleeves
    // golden stole hanging from the shoulders down the front
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.045 * b.s, 0.42 * b.s, 0.008 * b.s, 0.003 * b.s),
          sg * 0.06 * b.s,
          0.02 * b.s,
          -rings.chest[2].rz * 1.09,
          0.06,
          0,
          sg * 0.04,
        ),
        cloth(gold, { region: "rags", rough: 0.7 }),
      );
    R.add(
      "spine",
      P.xf(
        P.torus(rings.abdomen[0].rx * 1.14, 0.014 * b.s, 5, 18),
        0,
        0.0,
        0,
        PI / 2,
        0,
        0,
        1,
        rings.abdomen[0].rz / rings.abdomen[0].rx,
        1,
      ),
      cloth(0x7a5a2a, { region: "rags" }),
    ); // cord belt
    R.decal(
      "chest",
      "sundisc",
      0.15 * b.s,
      0.15 * b.s,
      0,
      0.1 * b.s,
      -rings.chest[2].rz * 1.1 - 0.004,
      0,
      0,
      0,
      { emis: 0.9 },
    );
    // pendant: a beaten-brass sun disc with short rays on a cord
    const pz = -rings.chest[2].rz * 1.14;
    R.add(
      "chest",
      P.xf(
        P.cyl(0.03 * b.s, 0.03 * b.s, 0.006 * b.s, 16),
        0,
        -0.04 * b.s,
        pz - 0.006 * b.s,
        PI / 2,
        0,
        0,
      ),
      metalM(0xc8962a, { rough: 0.35, metal: 0.9 }),
    );
    for (let i = 0; i < 12; i++) {
      const a2 = (i / 12) * PI * 2;
      R.add(
        "chest",
        P.xf(
          P.cone(0.006 * b.s, 0.018 * b.s, 4),
          Math.cos(a2) * 0.04 * b.s,
          -0.04 * b.s + Math.sin(a2) * 0.04 * b.s,
          pz - 0.006 * b.s,
          0,
          0,
          a2 - PI / 2,
        ),
        metalM(0xc8962a, { rough: 0.35, metal: 0.9 }),
      );
    }
    H.hat(R, b, "hood", robe);
  };

  OUT.combat_armor = function (R, b, rng, look, o) {
    const plate = o.color || rng.pick([0x50543f, 0x484a44, 0x5c5a46]);
    Object.assign(look, {
      top: 0x5a5a42,
      bottom: 0x5a5a42,
      paintBottom: camoPaint,
      sleeve: "long",
      paintSleeve: camoPaint,
      glove: 0x2a2820,
      boot: 0x2a241c,
      bootH: 0.55,
    });
    b.bulk = 1.04;
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const pm = metalM(plate, { metal: 0.2, rough: 0.55, region: "grime" });
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.1, 1.14), {
        seg: 16,
        capTop: false,
      }),
      pm,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.08, 1.1), {
        seg: 14,
        a0: -PI * 0.4,
        a1: PI * 0.4,
      }),
      pm,
    );
    for (let i = 0; i < 3; i++)
      R.add(
        "spine",
        P.xf(
          P.box(0.16 * b.s, 0.012 * b.s, 0.01 * b.s, 0.003),
          0,
          0.04 * b.s + i * 0.05 * b.s,
          -rings.abdomen[1].rz * 1.14,
        ),
        metalM(L.shade(plate, 0.7), { metal: 0.2 }),
      );
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      R.add(
        "arm" + S,
        P.xf(
          P.sphere(
            0.085 * b.s,
            0.07 * b.s,
            0.09 * b.s,
            12,
            7,
            0,
            PI * 2,
            0,
            PI * 0.55,
          ),
          sg * 0.005,
          0.01 * b.s,
          0,
          0,
          0,
          sg * -0.3,
        ),
        pm,
      );
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.054 * b.s, 0.048 * b.s, 0.16 * b.s, 10),
          0,
          -b.fore * 0.5,
          -0.004,
        ),
        pm,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.sphere(
            0.06 * b.s,
            0.07 * b.s,
            0.05 * b.s,
            10,
            7,
            0,
            PI * 2,
            0,
            PI * 0.6,
          ),
          0,
          -0.005 * b.s,
          -0.04 * b.s,
          -PI / 2,
          0,
          0,
        ),
        pm,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.09 * b.s, 0.18 * b.s, 0.025 * b.s, 0.01 * b.s),
          0,
          -0.14 * b.s,
          -0.055 * b.s,
        ),
        pm,
      );
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.13 * b.s, 0.18 * b.s, 0.03 * b.s, 0.01 * b.s),
          0,
          -0.14 * b.s,
          -0.085 * b.s,
        ),
        pm,
      );
    }
    H.belt(R, b, 0x3a3628, 0x8a8a78, 4);
    H.hat(R, b, "helmet", plate);
    if (rng.chance(0.6)) H.glasses(R, b, "goggles");
  };
  function camoPaint(x, y, z, nx, ny, nz, out, wx, wy, wz) {
    const n = L.noise3(wx * 7, wy * 7, wz * 7);
    if (n > 0.62) {
      out[0] *= 0.6;
      out[1] *= 0.62;
      out[2] *= 0.5;
    } else if (n < 0.35) {
      out[0] *= 1.25;
      out[1] *= 1.2;
      out[2] *= 1.05;
    }
  }
  H.camoPaint = camoPaint;

  OUT.leather_armor = function (R, b, rng, look, o) {
    const lc = rng.pick([PAL.leather, 0x4a3020, 0x5a4028]);
    Object.assign(look, {
      top: 0x5a5040,
      bottom: rng.pick([0x3a3226, PAL.denim]),
      sleeve: "long",
      sleeveColor: 0x4a4234,
      glove: 0x2a1a10,
      boot: 0x2a1a10,
      bootH: 0.5,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const lm = leatherM(lc);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.08, 1.12), { seg: 16 }),
      lm,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.07, 1.1), { seg: 14 }),
      lm,
    );
    for (let i = 0; i < 4; i++)
      R.add(
        "chest",
        P.xf(
          P.box(0.012 * b.s, 0.012 * b.s, 0.012 * b.s, 0.003),
          0.05 * b.s,
          (0.02 + i * 0.05) * b.s,
          -rings.chest[2].rz * 1.13,
        ),
        metalM(0xa09060),
      );
    H.pauldron(R, b, "L", lc, 0, 1.05);
    for (const S of ["L", "R"]) {
      R.add(
        "forearm" + S,
        P.xf(
          P.cyl(0.052 * b.s, 0.046 * b.s, 0.15 * b.s, 10),
          0,
          -b.fore * 0.55,
          0,
        ),
        lm,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.08 * b.s, 0.14 * b.s, 0.02 * b.s, 0.008 * b.s),
          0,
          -0.08 * b.s,
          -0.06 * b.s,
        ),
        lm,
      );
    }
    H.strap(R, b, PAL.leatherDark, [0.9, 0.2], [-0.8, -0.03], 1.1, false);
    H.belt(R, b, PAL.leatherDark, 0x9a9a8a, 3);
  };

  /**
   * Survivor layers — the city's winter street wear (readable at 10–30 m):
   * muted oatmeal / slate / charcoal-brown cloth under faded RUST, TEAL or
   * MUSTARD accents; a bulky cowl scarf, cloth or bandage wraps on the
   * forearms, and knit watch hats / head wraps / work goggles / respirators. Four
   * cuts: 'layers' (long coat over a knit pullover), 'worker' (coveralls +
   * work apron), 'wrapped' (poncho shawl, wrapped shins, rope belt),
   * 'quilted' (quilted vest over a shirt).
   */
  H.SURVIVOR_ACCENTS = [
    0x8e4e34, 0x3c6e6a, 0xa8853a, 0x7a4436, 0x56807a, 0x9a7a3e, 0x6a4a5a,
  ];
  H.SURVIVOR_BASE = [
    0x6e675c, 0x5a554c, 0x4a463f, 0x7a7266, 0x5e5a56, 0x645a4c,
  ];
  const LINEN = [0xcfc6b0, 0xbdb39c, 0xd8d0bc, 0xa89e88];
  /** Survivor headwear / face kit (knit caps, head wraps, work goggles, respirators, scarves). */
  H.survivorHead = function (R, b, rng, acc, o) {
    o = o || {};
    const hat =
      o.hat !== undefined
        ? o.hat
        : rng.pick([
            "knit",
            "knit",
            "knit",
            "wrap",
            "wrap",
            "cap",
            "hood",
            null,
          ]);
    const hatC = rng.chance(0.5)
      ? acc
      : rng.pick([0x4a463f, 0x5e5a56, 0x6e675c, 0x3a3836]);
    if (hat === "hood")
      H.hat(R, b, "hood", L.shade(rng.pick(H.SURVIVOR_BASE), 0.9));
    else if (hat)
      H.hat(
        R,
        b,
        hat,
        hat === "wrap" ? rng.pick([acc, rng.pick(LINEN)]) : hatC,
      );
    const face =
      o.face !== undefined
        ? o.face
        : rng.pick([
            "weldup",
            "weldup",
            "weld",
            "respirator",
            "scarf",
            null,
            null,
            null,
          ]);
    if (face === "respirator") H.mask(R, b, "respirator", 0x3a3632);
    else if (face === "scarf") H.mask(R, b, "scarf", acc);
    else if (face === "bandage")
      H.mask(R, b, "bandage", rng.pick(LINEN), rng.chance(0.5) ? -1 : 1);
    else if (face) H.glasses(R, b, face);
  };
  OUT.survivor_layers = function (R, b, rng, look, o) {
    const kind = rng.pick(["layers", "layers", "worker", "wrapped", "quilted"]);
    const rings = H.torsoRings(b);
    const acc = rng.pick(H.SURVIVOR_ACCENTS),
      acc2 = rng.pick(H.SURVIVOR_ACCENTS.filter((c) => c !== acc));
    const base = rng.pick(H.SURVIVOR_BASE),
      linen = rng.pick(LINEN);
    const torn = (seedK, amt) => (v) => {
      if (v.y < 0)
        v.y += (L.hash3(v.x * 300 + seedK, 3, v.z * 300) - 0.5) * amt;
    };
    if (kind === "worker") {
      Object.assign(look, {
        top: base,
        topRegion: "rags",
        bottom: base,
        bottomRegion: "rags",
        sleeve: "rolled",
        sleeveColor: base,
        sleeveRegion: "rags",
        boot: 0x2a2018,
        bootH: 0.34,
        laces: true,
        glove: rng.chance(0.5) ? 0x4a3a2a : null,
      });
      H.body(R, b, look);
      // heavy canvas / leather work apron with a bib
      const apC = rng.pick([0x5a4030, 0x6a5a44, acc]);
      const pr = rings.pelvis[3],
        s = b.s;
      R.add(
        "hips",
        P.loft(
          [
            {
              y: -0.42 * s,
              rx: pr.rx * 1.14,
              rz: pr.rz * 1.36,
              oz: -0.035 * s,
              n: 2.2,
            },
            {
              y: -0.12 * s,
              rx: pr.rx * 1.08,
              rz: pr.rz * 1.16,
              oz: -0.012 * s,
              n: 2.3,
            },
            { y: 0.075 * s, rx: pr.rx * 1.05, rz: pr.rz * 1.07, n: 2.3 },
          ],
          { seg: 14, a0: -PI * 0.42, a1: PI * 0.42 },
        ),
        apC === acc ? cloth(apC, { region: "rags" }) : leatherM(apC),
      );
      R.add(
        "chest",
        P.loft(
          [
            {
              y: -0.05 * s,
              rx: rings.chest[0].rx * 0.6,
              rz: rings.chest[0].rz * 1.06,
              n: 2.3,
            },
            {
              y: 0.15 * s,
              rx: rings.chest[2].rx * 0.52,
              rz: rings.chest[2].rz * 1.06,
              oz: rings.chest[2].oz,
              n: 2.3,
            },
          ],
          { seg: 10, a0: -PI * 0.3, a1: PI * 0.3 },
        ),
        apC === acc ? cloth(apC, { region: "rags" }) : leatherM(apC),
      );
      H.belt(R, b, 0x2a2018, 0x8a8a7a, 2);
      H.cowl(R, b, acc2, { tail: 0, drape: 0.4 });
      H.wraps(R, b, linen, "arms", { armTop: 0.45 });
      H.survivorHead(R, b, rng, acc, {
        face: rng.pick(["weldup", "weldup", "respirator", "weld"]),
        hat: rng.pick(["knit", "knit", "hardhat", "cap"]),
      });
      return;
    }
    if (kind === "wrapped") {
      Object.assign(look, {
        top: linen,
        topRegion: "rags",
        bottom: base,
        bottomRegion: "rags",
        sleeve: "long",
        sleeveColor: L.shade(linen, 0.85),
        sleeveRegion: "rags",
        boot: 0x2a241e,
        bootH: 0.15,
        laces: false,
      });
      H.body(R, b, look);
      // poncho shawl: a wide drape from the shoulders to the hips, ragged hem
      const s = b.s,
        cr = rings.chest;
      const po = P.loft(
        [
          {
            y: -0.17 * s,
            rx: cr[2].rx * 1.5,
            rz: cr[2].rz * 1.5,
            oz: cr[2].oz,
            n: 2.0,
          },
          {
            y: 0.0,
            rx: cr[2].rx * 1.36,
            rz: cr[2].rz * 1.34,
            oz: cr[2].oz,
            n: 2.1,
          },
          {
            y: cr[2].y,
            rx: cr[2].rx * 1.24,
            rz: cr[2].rz * 1.2,
            oz: cr[2].oz,
            n: 2.6,
          },
          {
            y: cr[3].y + 0.006 * s,
            rx: cr[3].rx * 1.16,
            rz: cr[3].rz * 1.26,
            oz: cr[3].oz,
            n: 2.7,
          },
          {
            y: cr[4].y + 0.016 * s,
            rx: cr[4].rx * 1.12,
            rz: cr[4].rz * 1.28,
            oz: cr[4].oz,
            n: 2.4,
          },
        ],
        { seg: 20 },
      );
      P.deform(po, torn(seed0(rng), 0.08 * s));
      const stripe = (x, y, z, nx, ny, nz, out) => {
        const k = (y / s + 0.2) * 9;
        if (Math.abs(k - Math.round(k)) < 0.09 && k > 0.5 && k < 2.6) {
          const c = L.col(acc2);
          out[0] = c.r;
          out[1] = c.g;
          out[2] = c.b;
        }
      };
      R.add("chest", po, cloth(acc, { region: "rags", paint: stripe }));
      // rope belt over the tunic
      const pr = rings.pelvis[3];
      R.add(
        "hips",
        P.xf(
          P.torus(1, 0.011 * s, 5, 22),
          0,
          pr.y + 0.03 * s,
          0,
          PI / 2,
          0,
          0,
          pr.rx * 1.1,
          pr.rz * 1.14,
          1,
        ),
        { color: 0x8a7a5a, region: "rags", rough: 1 },
      );
      H.wraps(R, b, linen, rng.chance(0.6) ? "arms,legs" : "legs");
      H.survivorHead(R, b, rng, acc, {
        hat: rng.pick(["wrap", "wrap", "hood", "knit"]),
        face: rng.pick(["scarf", "scarf", "weldup", null]),
      });
      return;
    }
    if (kind === "quilted") {
      const shirt = rng.pick([linen, 0x7a7266, 0x8a8274]);
      Object.assign(look, {
        top: shirt,
        topRegion: "rags",
        bottom: base,
        bottomRegion: "rags",
        sleeve: "long",
        sleeveColor: shirt,
        sleeveRegion: "rags",
        boot: 0x2a2018,
        bootH: 0.3,
        laces: true,
      });
      H.body(R, b, look);
      const qp = (x, y, z, nx, ny, nz, out) => {
        if (Math.abs(Math.sin((y / b.s) * 60)) < 0.14) {
          out[0] *= 0.75;
          out[1] *= 0.75;
          out[2] *= 0.75;
        }
      };
      const vm = cloth(acc, { region: "rags", paint: qp });
      R.add(
        "chest",
        P.loft(scaleRings(rings.chest.slice(0, 5), 1.1, 1.12), {
          seg: 16,
          a0: PI * 0.07,
          a1: PI * 1.93,
        }),
        vm,
      );
      R.add(
        "spine",
        P.loft(scaleRings(rings.abdomen, 1.1, 1.12), {
          seg: 16,
          a0: PI * 0.07,
          a1: PI * 1.93,
        }),
        vm,
      );
      R.add(
        "hips",
        P.loft(scaleRings(rings.pelvis.slice(2), 1.1, 1.12), {
          seg: 16,
          a0: PI * 0.07,
          a1: PI * 1.93,
        }),
        vm,
      );
      H.cowl(R, b, acc2, { tail: rng.chance(0.5) ? 0.7 : 0, drape: 0 });
      H.wraps(R, b, linen, "arms", {
        one: rng.chance(0.5) ? "L" : "R",
        armTop: 0.5,
      });
      H.belt(R, b, 0x2a2018, 0x8a8a7a, 1);
      H.survivorHead(R, b, rng, acc2);
      return;
    }
    // 'layers': long coat (open) over a knit pullover, cowl scarf, wrapped forearms
    const coat = base,
      knitC = rng.pick([0x8a8274, linen, 0x6a6458]);
    Object.assign(look, {
      top: knitC,
      topRegion: "rags",
      bottom: L.shade(base, 0.8),
      bottomRegion: "rags",
      sleeve: "long",
      sleeveColor: coat,
      sleeveRegion: "rags",
      boot: 0x221c16,
      bootH: 0.3,
      laces: false,
    });
    H.body(R, b, look);
    const m = cloth(coat, { region: "rags" });
    for (const [bone, rs, k] of [
      ["chest", rings.chest.slice(0, 5), 1.08],
      ["spine", rings.abdomen, 1.09],
      ["hips", rings.pelvis.slice(2), 1.1],
    ])
      R.add(
        bone,
        P.loft(scaleRings(rs, k), { seg: 16, a0: 0.42, a1: PI * 2 - 0.42 }),
        m,
      );
    H.coatTails(R, b, m, rng.range(0.55, 0.85), 0.3);
    // patched elbows in the second accent
    for (const S of ["L", "R"])
      if (rng.chance(0.6))
        R.add(
          "forearm" + S,
          P.xf(
            P.sphere(0.042 * b.s, 0.05 * b.s, 0.03 * b.s, 8, 6),
            0,
            -0.02 * b.s,
            0.035 * b.s,
          ),
          cloth(acc2, { region: "rags" }),
        );
    H.cowl(R, b, acc, { tail: rng.range(0.6, 1), torn: true });
    H.wraps(R, b, linen, "arms", { armTop: 0.62 });
    H.belt(R, b, 0x2a2018, 0x8a8a7a, rng.int(0, 2));
    H.survivorHead(R, b, rng, acc);
  };
  const seed0 = (rng) => (rng() * 997) | 0;

  /** Continuity officer: grey service tunic & trousers, Sam-Browne belt, peaked cap, dome insignia. */
  OUT.continuity_uniform = function (R, b, rng, look, o) {
    const grey = 0x6a6e70,
      dark = 0x3e4246;
    Object.assign(look, {
      top: grey,
      bottom: grey,
      sleeve: "long",
      cuff: dark,
      boot: 0x141414,
      bootH: 0.42,
      laces: false,
      glove: rng.chance(0.5) ? 0x1e1e1e : null,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const m = cloth(grey);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.04), { seg: 16 }),
      m,
    );
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis.slice(2), 1.07), { seg: 16 }),
      m,
    ); // tunic skirt
    for (let i = 0; i < 4; i++)
      R.add(
        "chest",
        P.xf(
          P.sphere(0.008 * b.s, 0.008 * b.s, 0.005 * b.s, 6, 4),
          0,
          (0.0 + i * 0.06) * b.s,
          -rings.chest[2].rz * 1.06,
        ),
        metalM(0xb8b8b0),
      ); // buttons
    for (const S of ["L", "R"])
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.1 * b.s, 0.012 * b.s, 0.06 * b.s, 0.004),
          0,
          0.045 * b.s,
          0,
        ),
        cloth(dark),
      ); // shoulder boards
    R.decal(
      "chest",
      "continuity",
      0.05 * b.s,
      0.05 * b.s,
      -0.085 * b.s,
      0.15 * b.s,
      -rings.chest[2].rz * 1.07 - 0.003,
      0,
      0,
      0,
    );
    H.belt(R, b, 0x1a1a1a, 0xb8b8b0, 1);
    H.strap(R, b, 0x1a1a1a, [-0.9, 0.22], [0.75, -0.04], 0.7, false);
    if (!o.noCap) H.hat(R, b, "cap", dark);
  };

  OUT.dj = function (R, b, rng, look, o) {
    Object.assign(look, {
      top: 0x1a1a1a,
      topRegion: "leather",
      topMat: leatherM(0x2e2826),
      sleeve: "long",
      sleeveMat: leatherM(0x2e2826),
      bottom: 0x3a4458,
      boot: 0x1e1a18,
      bootH: 0.3,
    });
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    // open collar shirt with 50s bowling-style stripe
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(1, 5), 1.015), {
        seg: 6,
        a0: -PI * 0.14,
        a1: PI * 0.14,
      }),
      cloth(0xc8b060, {
        paint: (x, y, z, nx, ny, nz, out) => {
          if (Math.abs(x) < 0.012) {
            out[0] = 0.5;
            out[1] = 0.1;
            out[2] = 0.08;
          }
        },
      }),
    );
    for (const sg of [-1, 1])
      R.add(
        "chest",
        P.xf(
          P.box(0.055 * b.s, 0.14 * b.s, 0.012 * b.s, 0.004),
          sg * 0.07 * b.s,
          0.15 * b.s,
          -rings.chest[2].rz * 1.05,
          0.1,
          sg * 0.35,
          sg * 0.28,
        ),
        leatherM(0x262222),
      );
    H.hat(R, b, "headphones");
    H.glasses(R, b, "sun");
    H.belt(R, b, 0x0e0e0e, 0xd0d0d0, 0);
  };

  // ----------------------------- EXO-RIGS -------------------------
  /**
   * Iron Covenant EXO-RIG (Mk I / Mk II): an armoured walking frame built
   * over a padded undersuit — layered riveted plates, EXPOSED hydraulic
   * pistons at knees and elbows, a back frame carrying the rig battery, and
   * a rounded war-helm with ONE narrow glowing visor slit (no snout). Mk I:
   * gunmetal, heavier, amber slit. Mk II: brushed steel, sleeker plates, a
   * second (brow) visor bar and a raised crest; cold white slits.
   * Insignia: anvil-in-a-ring on the left breast and the right pauldron.
   */
  H.exoRig = function (R, b, rng, o) {
    const mk2 = o.variant === "mk2" || o.variant === 1 || o.variant === "1";
    const base = mk2 ? 0x8c8f8c : 0x4c5054,
      trim = mk2 ? 0x5a5d5c : 0x2e3032,
      heraldry = PAL.covRed;
    const s = b.s;
    const armor = (c, extra) =>
      metalM(
        c,
        Object.assign(
          {
            metal: 0.65,
            rough: mk2 ? 0.38 : 0.52,
            noise: 0.15,
            region: "metal",
            rigid: true,
          },
          extra || {},
        ),
      );
    const A = armor(base),
      T = armor(trim),
      RED = armor(heraldry, { metal: 0.3, rough: 0.6 }),
      CH = armor(0xc0c2c0, { metal: 0.9, rough: 0.22 });
    const rub = { color: 0x24221e, region: "rubber", rough: 0.85 };
    const rings = H.torsoRings(b);
    const rivets = (bone, pts, r) => {
      for (const p of pts)
        R.add(
          bone,
          P.xf(
            P.sphere(r, r, r * 0.6, 5, 3),
            p[0],
            p[1],
            p[2],
            0,
            p[3] || 0,
            0,
          ),
          T,
        );
    };
    /** hydraulic piston: housing cylinder + chrome rod between two points (bone-local) */
    const piston = (bone, a, c, r) => {
      const ax = c[0] - a[0],
        ay = c[1] - a[1],
        az = c[2] - a[2],
        len = Math.hypot(ax, ay, az);
      const g1 = P.cyl(r, r, len * 0.55, 8),
        g2 = P.cyl(r * 0.45, r * 0.45, len * 0.5, 6);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(ax / len, ay / len, az / len),
      );
      g1.translate(0, len * 0.275, 0);
      g1.applyQuaternion(q);
      g1.translate(a[0], a[1], a[2]);
      g2.translate(0, len * 0.75, 0);
      g2.applyQuaternion(q);
      g2.translate(a[0], a[1], a[2]);
      R.add(bone, g1, T);
      R.add(bone, g2, CH);
    };
    // --- undersuit & torso plates ---
    R.add(
      "hips",
      P.loft(scaleRings(rings.pelvis, 1.42, 1.45), {
        seg: 16,
        capBottom: true,
      }),
      rub,
    );
    for (const sg of [-1, 1])
      R.add(
        "hips",
        P.xf(
          P.box(0.16 * s, 0.2 * s, 0.05 * s, 0.015 * s),
          sg * 0.13 * s,
          -0.08 * s,
          -rings.pelvis[2].rz * 1.4,
          0.08,
          sg * 0.25,
          0,
        ),
        A,
      ); // tassets
    R.add(
      "hips",
      P.xf(
        P.box(0.14 * s, 0.14 * s, 0.05 * s, 0.015 * s),
        0,
        -0.05 * s,
        -rings.pelvis[2].rz * 1.5,
      ),
      T,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.45, 1.45), { seg: 16 }),
      rub,
    );
    for (let i = 0; i < 3; i++)
      R.add(
        "spine",
        P.loft(
          scaleRings(
            [
              {
                y: 0.015 * s + i * 0.068 * s,
                rx: rings.abdomen[1].rx,
                rz: rings.abdomen[1].rz,
                n: 2.6,
              },
              {
                y: 0.07 * s + i * 0.068 * s,
                rx: rings.abdomen[1].rx * 1.04,
                rz: rings.abdomen[1].rz * 1.04,
                n: 2.6,
              },
            ],
            1.6,
            1.62,
          ),
          { seg: 16, a0: -PI * 0.5, a1: PI * 0.5 },
        ),
        i % 2 ? T : A,
      ); // lames
    // breastplate: a faceted keel (ridge down the middle), layered upper plate
    const chestR = scaleRings(rings.chest.slice(0, 5), 1.72, 1.78, 0.01 * s);
    const bp = P.loft(chestR, { seg: 20, capTop: true });
    P.deform(bp, (v) => {
      if (v.z < 0) v.z -= 0.03 * s * Math.exp(-Math.pow(v.x / (0.05 * s), 2));
    }); // keel
    R.add("chest", bp, A);
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(2, 5), 1.84, 1.9, 0.012 * s), {
        seg: 18,
        a0: -PI * 0.42,
        a1: PI * 0.42,
      }),
      mk2 ? A : T,
    ); // upper plate
    rivets(
      "chest",
      [-0.16, -0.08, 0.08, 0.16].map((x) => [
        x * s,
        0.205 * s,
        -chestR[3].rz - 0.005 * s,
      ]),
      0.008 * s,
    );
    R.decal(
      "chest",
      "covenant",
      0.1 * s,
      0.1 * s,
      -0.11 * s,
      0.11 * s,
      -chestR[2].rz - 0.012 * s,
      0.05,
      -0.32,
      0,
    );
    // gorget: stacked collar rings the helm sits in
    for (let i = 0; i < 2; i++)
      R.add(
        "chest",
        P.xf(
          P.torus(0.12 * s - i * 0.012 * s, 0.03 * s, 6, 18),
          0,
          0.25 * s + i * 0.035 * s,
          0.01 * s,
          PI / 2,
          0,
          0,
        ),
        i ? A : T,
      );
    // back frame: A-frame tubes + rig battery box, cable runs, a heraldic banner plate
    const bz = chestR[2].rz + 0.06 * s;
    R.add(
      "chest",
      P.xf(
        P.box(0.32 * s, 0.34 * s, 0.16 * s, 0.03 * s),
        0,
        0.08 * s,
        bz + 0.04 * s,
      ),
      T,
    );
    R.add(
      "chest",
      P.xf(
        P.box(0.2 * s, 0.12 * s, 0.02 * s, 0.01 * s),
        0,
        0.12 * s,
        bz + 0.125 * s,
      ),
      RED,
    );
    R.add(
      "chest",
      P.xf(
        P.cyl(0.035 * s, 0.035 * s, 0.02 * s, 12),
        0.1 * s,
        -0.04 * s,
        bz + 0.125 * s,
        PI / 2,
        0,
        0,
      ),
      {
        color: mk2 ? 0xd8f0ff : 0xffb040,
        emis: 1.6,
        rough: 0.2,
        noise: 0,
        keepLod: true,
      },
    );
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.cyl(0.018 * s, 0.018 * s, 0.6 * s, 8),
          sg * 0.19 * s,
          0.1 * s,
          bz + 0.06 * s,
          0,
          0,
          sg * 0.12,
        ),
        CH,
      ); // frame rails
      R.add(
        "chest",
        P.sweep(
          [
            [sg * 0.12 * s, 0.2 * s, bz + 0.12 * s],
            [sg * 0.2 * s, 0.05 * s, bz + 0.1 * s],
            [sg * 0.17 * s, -0.12 * s, bz],
          ],
          0.012 * s,
          { seg: 8, rs: 5 },
        ),
        rub,
      ); // cables
    }
    // --- arms ---
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      // layered pauldron: three overlapping lames + a rim
      for (let i = 0; i < 3; i++) {
        const pl = P.sphere(
          (0.17 - i * 0.012) * s,
          0.12 * s,
          (0.17 - i * 0.012) * s,
          14,
          8,
          0,
          PI * 2,
          0,
          PI * 0.55,
        );
        R.add(
          "arm" + S,
          P.xf(
            pl,
            sg * 0.03 * s,
            (0.05 - i * 0.05) * s,
            0,
            0,
            0,
            sg * -0.3 - sg * i * 0.12,
          ),
          i === 0 ? A : i === 1 ? T : A,
        );
      }
      if (S === "R")
        R.decal(
          "arm" + S,
          "covenant",
          0.09 * s,
          0.09 * s,
          sg * 0.185 * s,
          0.01 * s,
          0,
          0,
          (sg * -PI) / 2,
          0,
        );
      else
        R.add(
          "arm" + S,
          P.xf(
            P.box(0.02 * s, 0.1 * s, 0.14 * s, 0.006 * s),
            sg * 0.18 * s,
            -0.01 * s,
            0,
            0,
            0,
            sg * 0.3,
          ),
          RED,
        );
      R.add("arm" + S, P.limb(b.upper, 0.082 * s, 0.075 * s, { seg: 10 }), rub);
      R.add(
        "arm" + S,
        P.xf(
          P.box(0.15 * s, b.upper * 0.5, 0.15 * s, 0.03 * s),
          0,
          -b.upper * 0.55,
          0,
        ),
        A,
      );
      piston(
        "arm" + S,
        [0, -b.upper * 0.35, 0.085 * s],
        [0, -b.upper - 0.07 * s, 0.07 * s],
        0.016 * s,
      ); // elbow piston (behind)
      R.add(
        "forearm" + S,
        P.limb(b.fore, 0.075 * s, 0.064 * s, { seg: 10 }),
        rub,
      );
      R.add(
        "forearm" + S,
        P.xf(P.cyl(0.07 * s, 0.07 * s, 0.13 * s, 12), 0, 0, 0, 0, 0, PI / 2),
        T,
      ); // hinge drum
      const vb = P.box(0.15 * s, b.fore * 0.72, 0.15 * s, 0.035 * s);
      P.deform(vb, (v) => {
        if (v.y < 0) {
          v.x *= 0.92;
          v.z *= 0.92;
        }
      });
      R.add("forearm" + S, P.xf(vb, 0, -b.fore * 0.52, 0), A);
      rivets(
        "forearm" + S,
        [
          [sg * 0.077 * s, -b.fore * 0.3, 0, PI / 2],
          [sg * 0.077 * s, -b.fore * 0.7, 0, PI / 2],
        ],
        0.008 * s,
      );
      R.add(
        "hand" + S,
        P.xf(P.box(0.06 * s, 0.1 * s, 0.1 * s, 0.02 * s), 0, -0.05 * s, 0),
        T,
      );
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.05 * s, 0.07 * s, 0.095 * s, 0.018 * s),
          -sg * 0.015 * s,
          -0.12 * s,
          0,
          0,
          0,
          -sg * 0.5,
        ),
        A,
      );
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.035 * s, 0.06 * s, 0.035 * s, 0.01 * s),
          -sg * 0.03 * s,
          -0.05 * s,
          -0.06 * s,
        ),
        A,
      );
      // legs: thigh plate, exposed knee hinge + twin pistons, greave, sabaton
      R.add("thigh" + S, P.limb(b.thigh, 0.118 * s, 0.1 * s, { seg: 12 }), rub);
      R.add(
        "thigh" + S,
        P.xf(
          P.box(0.22 * s, b.thigh * 0.62, 0.22 * s, 0.05 * s),
          0,
          -b.thigh * 0.38,
          -0.01 * s,
        ),
        A,
      );
      R.add(
        "shin" + S,
        P.xf(P.cyl(0.085 * s, 0.085 * s, 0.2 * s, 12), 0, 0.0, 0, 0, 0, PI / 2),
        T,
      ); // knee hinge drum
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.13 * s, 0.11 * s, 0.05 * s, 0.02 * s),
          0,
          0.0,
          -0.09 * s,
          -0.15,
          0,
          0,
        ),
        mk2 ? A : RED,
      ); // knee cop
      for (const px of [-1, 1])
        piston(
          "thigh" + S,
          [px * 0.1 * s, -b.thigh * 0.3, 0.05 * s],
          [px * 0.1 * s, -b.thigh - 0.12 * s, 0.035 * s],
          0.014 * s,
        );
      R.add("shin" + S, P.limb(b.shin, 0.098 * s, 0.088 * s, { seg: 10 }), rub);
      const gr = P.box(0.2 * s, b.shin * 0.72, 0.21 * s, 0.05 * s);
      P.deform(gr, (v) => {
        if (v.y < 0) {
          v.x *= 1.06;
          v.z *= 1.06;
        }
      });
      R.add("shin" + S, P.xf(gr, 0, -b.shin * 0.56, -0.005 * s), A);
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.19 * s, b.ankle + 0.07 * s, 0.34 * s, 0.045 * s),
          0,
          -b.ankle / 2 + 0.025 * s,
          -0.07 * s,
        ),
        T,
      );
      for (let i = 0; i < 2; i++)
        R.add(
          "foot" + S,
          P.xf(
            P.box(0.18 * s, 0.04 * s, 0.1 * s, 0.015 * s),
            0,
            -b.ankle / 2 + 0.06 * s - i * 0.03 * s,
            -0.2 * s + i * 0.06 * s,
          ),
          A,
        ); // sabaton lames
      R.add(
        "foot" + S,
        P.xf(
          P.box(0.2 * s, 0.03 * s, 0.35 * s, 0.01 * s),
          0,
          -b.ankle + 0.015 * s,
          -0.07 * s,
        ),
        rub,
      );
    }
    // --- helm: rounded war-helm, a single narrow visor slit, perforated face plate ---
    const hs = b.headS,
      C = [0, 0.1 * hs, 0];
    const ring = (y, rx, rz, n, oz) => ({
      y: C[1] + y * hs,
      rx: rx * hs,
      rz: rz * hs,
      oz: C[2] + (oz || 0) * hs,
      n,
    });
    const helm = mk2
      ? [
          ring(-0.15, 0.1, 0.11, 2.3, 0.01),
          ring(-0.11, 0.122, 0.14, 2.4),
          ring(-0.02, 0.13, 0.152, 2.5, -0.01),
          ring(0.07, 0.128, 0.148, 2.4, -0.005),
          ring(0.14, 0.108, 0.125, 2.2),
          ring(0.185, 0.065, 0.075, 2.1),
          ring(0.2, 0.01, 0.01, 2),
        ]
      : [
          ring(-0.15, 0.105, 0.115, 2.2, 0.01),
          ring(-0.11, 0.128, 0.142, 2.3),
          ring(-0.02, 0.136, 0.152, 2.3, -0.008),
          ring(0.07, 0.132, 0.146, 2.3),
          ring(0.14, 0.11, 0.122, 2.1),
          ring(0.18, 0.07, 0.08, 2.0),
          ring(0.195, 0.01, 0.01, 2),
        ];
    const hg = P.loft(helm, { seg: 24 });
    P.deform(hg, (v) => {
      if (v.z < C[2] - 0.06 * hs && v.y < C[1] + 0.05 * hs)
        v.z -= 0.025 * hs * Math.exp(-Math.pow(v.x / (0.05 * hs), 2));
    }); // face keel (no snout: a shallow prow)
    R.add("head", hg, A);
    // the slit: a recessed dark band across the face with a thin glowing line
    const slitY = C[1] + 0.035 * hs;
    const band = P.box(0.21 * hs, 0.03 * hs, 0.05 * hs, 0.008 * hs);
    P.deform(band, (v) => {
      v.z += ((v.x * v.x) / (0.11 * hs)) * 1.1;
    });
    R.add("head", P.xf(band, C[0], slitY, C[2] - 0.135 * hs), T);
    const slit = P.box(0.18 * hs, 0.009 * hs, 0.02 * hs, 0.003 * hs);
    P.deform(slit, (v) => {
      v.z += ((v.x * v.x) / (0.11 * hs)) * 1.1;
    });
    const glowC = mk2 ? 0xd8eeff : 0xffa030;
    R.add("head", P.xf(slit, C[0], slitY, C[2] - 0.157 * hs), {
      color: glowC,
      emis: 2.4,
      rough: 0.08,
      noise: 0.03,
      keepLod: true,
    });
    if (mk2) {
      // second (brow) visor bar + raised crest
      const s2 = P.box(0.12 * hs, 0.006 * hs, 0.02 * hs, 0.002 * hs);
      P.deform(s2, (v) => {
        v.z += ((v.x * v.x) / (0.1 * hs)) * 1.1;
      });
      R.add(
        "head",
        P.xf(
          P.box(0.14 * hs, 0.02 * hs, 0.04 * hs, 0.006 * hs),
          C[0],
          slitY + 0.04 * hs,
          C[2] - 0.135 * hs,
        ),
        T,
      );
      R.add("head", P.xf(s2, C[0], slitY + 0.04 * hs, C[2] - 0.153 * hs), {
        color: glowC,
        emis: 2.0,
        rough: 0.08,
        noise: 0.03,
        keepLod: true,
      });
      const crest = P.extrude(
        [
          [-0.12, 0],
          [0.13, 0],
          [0.12, 0.035],
          [0.02, 0.05],
          [-0.1, 0.03],
        ].map((q) => [q[0] * hs, q[1] * hs]),
        0.014 * hs,
        0.003 * hs,
      );
      crest.rotateY(PI / 2);
      R.add("head", P.xf(crest, C[0], C[1] + 0.175 * hs, C[2] + 0.0), RED);
    } else {
      R.add(
        "head",
        P.sweep(
          [
            [0, C[1] + 0.12 * hs, C[2] - 0.14 * hs],
            [0, C[1] + 0.2 * hs, C[2] - 0.03 * hs],
            [0, C[1] + 0.18 * hs, C[2] + 0.1 * hs],
            [0, C[1] + 0.08 * hs, C[2] + 0.16 * hs],
          ],
          0.012 * hs,
          { seg: 14, rs: 4 },
        ),
        T,
      );
    }
    // breathing perforations: two short columns of small holes below the slit (flush, no grille box)
    for (const sg of [-1, 1])
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 2; j++)
          R.add(
            "head",
            P.xf(
              P.cyl(0.0045 * hs, 0.0045 * hs, 0.004 * hs, 6),
              C[0] + sg * (0.03 + j * 0.016) * hs,
              C[1] - (0.03 + i * 0.022) * hs,
              C[2] - 0.158 * hs + j * 0.004 * hs + i * 0.003 * hs,
              PI / 2 - 0.2,
              0,
              0,
            ),
            { color: 0x0c0c0c, rough: 1, noise: 0 },
          );
    // cheek guards & aventail lames at the back of the neck
    for (const sg of [-1, 1])
      R.add(
        "head",
        P.xf(
          P.box(0.02 * hs, 0.1 * hs, 0.12 * hs, 0.008 * hs),
          C[0] + sg * 0.128 * hs,
          C[1] - 0.06 * hs,
          C[2] - 0.035 * hs,
          0,
          0,
          sg * 0.1,
        ),
        T,
      );
    for (let i = 0; i < 3; i++)
      R.add(
        "head",
        P.xf(
          P.shell(
            (0.14 - i * 0.006) * hs,
            0.03 * hs,
            (0.15 - i * 0.006) * hs,
            14,
            3,
            PI * 1.1,
          ),
          C[0],
          C[1] - (0.13 + i * 0.03) * hs,
          C[2] + 0.01 * hs,
          0,
          PI,
          0,
        ),
        i % 2 ? A : T,
      );
    rivets(
      "head",
      [
        [-0.13, -0.0],
        [0.13, -0.0],
        [-0.12, 0.09],
        [0.12, 0.09],
      ].map((p) => [
        C[0] + p[0] * hs,
        C[1] + p[1] * hs,
        C[2] - 0.04 * hs,
        p[0] < 0 ? -0.6 : 0.6,
      ]),
      0.007 * hs,
    );
  };

  /**
   * The Continuity's field rig: a GREY service uniform with light armour
   * over it — grey steel breastplate and shoulder boards, a lightweight leg
   * frame, and a grey steel helmet with a full-face respirator (two round
   * lenses, a centre filter). Insignia: the capitol dome in a circle.
   */
  H.continuityRig = function (R, b, rng, o) {
    const s = b.s,
      uni = 0x6a6e70,
      uniDark = 0x4a4e52,
      steel = 0x8a8e90;
    const look = {
      top: uni,
      bottom: uni,
      sleeve: "long",
      cuff: uniDark,
      boot: 0x1e1e1e,
      bootH: 0.36,
      laces: true,
      glove: 0x2a2a2a,
      armMul: 1.15,
      legMul: 1.1,
    };
    H.body(R, b, look);
    const rings = H.torsoRings(b);
    const armor = (c, extra) =>
      metalM(
        c,
        Object.assign(
          {
            metal: 0.5,
            rough: 0.48,
            noise: 0.12,
            region: "metal",
            rigid: true,
          },
          extra || {},
        ),
      );
    const A = armor(steel),
      D = armor(uniDark, { metal: 0.3, rough: 0.6 });
    // breastplate + back plate, webbing, pouches
    R.add(
      "chest",
      P.loft(scaleRings(rings.chest.slice(0, 5), 1.22, 1.28), {
        seg: 18,
        capTop: false,
      }),
      A,
    );
    R.add(
      "spine",
      P.loft(scaleRings(rings.abdomen, 1.2, 1.24), {
        seg: 16,
        a0: -PI * 0.45,
        a1: PI * 0.45,
      }),
      D,
    );
    H.belt(R, b, 0x2a2c2e, 0x9a9c98, 3);
    H.strap(R, b, 0x2a2c2e, [-0.5, 0.26], [-0.45, -0.05], 1.0);
    H.strap(R, b, 0x2a2c2e, [0.5, 0.26], [0.45, -0.05], 1.0);
    R.decal(
      "chest",
      "continuity",
      0.09 * s,
      0.09 * s,
      -0.09 * s,
      0.13 * s,
      -rings.chest[2].rz * 1.29 - 0.004,
      0.05,
      -0.2,
      0,
    );
    for (const S of ["L", "R"]) {
      const sg = S === "L" ? -1 : 1;
      R.add(
        "arm" + S,
        P.xf(
          P.sphere(
            0.09 * s,
            0.07 * s,
            0.095 * s,
            12,
            7,
            0,
            PI * 2,
            0,
            PI * 0.55,
          ),
          sg * 0.005 * s,
          0.01 * s,
          0,
          0,
          0,
          sg * -0.3,
        ),
        A,
      ); // shoulder cap
      if (S === "L")
        R.decal(
          "arm" + S,
          "continuity",
          0.06 * s,
          0.06 * s,
          sg * 0.072 * s,
          -0.06 * s,
          0,
          0,
          (sg * -PI) / 2,
          0,
        );
      // light leg frame: thin struts with a knee hinge
      R.add(
        "thigh" + S,
        P.xf(
          P.cyl(0.012 * s, 0.012 * s, b.thigh * 0.85, 6),
          sg * 0.075 * s,
          -b.thigh * 0.5,
          0,
        ),
        A,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.cyl(0.04 * s, 0.04 * s, 0.05 * s, 10),
          sg * 0.075 * s,
          0,
          0,
          0,
          0,
          PI / 2,
        ),
        D,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.cyl(0.012 * s, 0.012 * s, b.shin * 0.85, 6),
          sg * 0.075 * s,
          -b.shin * 0.5,
          0,
        ),
        A,
      );
      R.add(
        "shin" + S,
        P.xf(
          P.box(0.1 * s, 0.11 * s, 0.04 * s, 0.015 * s),
          0,
          0,
          -0.07 * s,
          -0.1,
          0,
          0,
        ),
        A,
      ); // knee plate
    }
    // helmet (steel pot with a short brim) + full-face respirator
    const hs = b.headS,
      C = [0, 0.1 * hs, 0];
    const pot = P.sphere(
      0.135 * hs,
      0.12 * hs,
      0.148 * hs,
      20,
      12,
      0,
      PI * 2,
      0,
      PI * 0.55,
    );
    R.add("head", P.xf(pot, C[0], C[1] + 0.06 * hs, C[2] + 0.005 * hs), A);
    R.add(
      "head",
      P.xf(
        P.torus(0.14 * hs, 0.008 * hs, 4, 22),
        C[0],
        C[1] + 0.06 * hs,
        C[2] + 0.005 * hs,
        PI / 2,
        0,
        0,
        1,
        1.08,
        1,
      ),
      A,
    );
    const mask = P.sphere(
      0.115 * hs,
      0.12 * hs,
      0.12 * hs,
      18,
      12,
      PI * 0.95,
      PI * 1.1,
      PI * 0.18,
      PI * 0.62,
    );
    R.add("head", P.xf(mask, C[0], C[1] - 0.005 * hs, C[2] - 0.012 * hs), {
      color: 0x2a2c2e,
      region: "rubber",
      rough: 0.7,
    });
    for (const sg of [-1, 1]) {
      R.add(
        "head",
        P.xf(
          P.cyl(0.032 * hs, 0.034 * hs, 0.02 * hs, 16),
          C[0] + sg * 0.045 * hs,
          C[1] + 0.02 * hs,
          C[2] - 0.12 * hs,
          PI / 2,
          0,
          0,
        ),
        D,
      );
      R.add(
        "head",
        P.xf(
          P.cyl(0.027 * hs, 0.027 * hs, 0.006 * hs, 16),
          C[0] + sg * 0.045 * hs,
          C[1] + 0.02 * hs,
          C[2] - 0.131 * hs,
          PI / 2,
          0,
          0,
        ),
        { color: 0x30383a, rough: 0.05, metal: 0.5, emis: 0.12, keepLod: true },
      );
    }
    R.add(
      "head",
      P.xf(
        P.cyl(0.036 * hs, 0.04 * hs, 0.05 * hs, 14),
        C[0],
        C[1] - 0.07 * hs,
        C[2] - 0.13 * hs,
        PI / 2 - 0.4,
        0,
        0,
      ),
      D,
    );
    R.add(
      "head",
      P.xf(
        P.cyl(0.032 * hs, 0.032 * hs, 0.006 * hs, 14),
        C[0],
        C[1] - 0.081 * hs,
        C[2] - 0.153 * hs,
        PI / 2 - 0.4,
        0,
        0,
      ),
      { color: 0xffffff, region: "grille", rough: 0.6, metal: 0.4 },
    );
    R.decal(
      "head",
      "continuity",
      0.05 * hs,
      0.05 * hs,
      C[0],
      C[1] + 0.13 * hs,
      C[2] - 0.115 * hs,
      -0.5,
      0,
      0,
    );
  };

  /**
   * Role accessories for crowds (G.chars.crowdLook): 'apron' (trader /
   * bartender / grill cook), 'satchel' (shoulder bag across the body),
   * 'bandolier' (ammo belt), 'rag' (bar towel over the shoulder), 'ledger'
   * (account book at the hip), 'pack' (small backpack), 'bigpack' (trader's
   * pack with pots). Stacked in any combination.
   */
  H.accessories = function (R, b, list, rng) {
    const s = b.s,
      rings = H.torsoRings(b),
      pr = rings.pelvis[3];
    for (const a of list) {
      if (a === "apron") {
        const col = rng.pick([
          0x5a4030, 0x6a5a44, 0x8a8270, 0x4a3a2c, 0x7a6a58,
        ]);
        const ap = P.loft(
          [
            {
              y: -0.36 * s,
              rx: pr.rx * 1.12,
              rz: pr.rz * 1.34,
              oz: -0.035 * s,
              n: 2.2,
            },
            {
              y: -0.12 * s,
              rx: pr.rx * 1.08,
              rz: pr.rz * 1.16,
              oz: -0.012 * s,
              n: 2.3,
            },
            { y: 0.075 * s, rx: pr.rx * 1.05, rz: pr.rz * 1.07, n: 2.3 },
          ],
          { seg: 14, a0: -PI * 0.4, a1: PI * 0.4 },
        );
        R.add(
          "hips",
          ap,
          col === 0x5a4030 || col === 0x4a3a2c
            ? leatherM(col)
            : cloth(col, { region: "rags" }),
        );
        // bib up the chest + neck strap
        const cr = rings.chest;
        R.add(
          "chest",
          P.loft(
            [
              {
                y: -0.05 * s,
                rx: cr[0].rx * 0.55,
                rz: cr[0].rz * 1.05,
                n: 2.3,
              },
              {
                y: 0.14 * s,
                rx: cr[2].rx * 0.5,
                rz: cr[2].rz * 1.05,
                oz: cr[2].oz,
                n: 2.3,
              },
            ],
            { seg: 10, a0: -PI * 0.28, a1: PI * 0.28 },
          ),
          cloth(col, { region: "rags" }),
        );
        H.strap(R, b, L.shade(col, 0.7), [-0.35, 0.14], [-0.25, 0.26], 0.6);
        H.strap(R, b, L.shade(col, 0.7), [0.35, 0.14], [0.25, 0.26], 0.6);
      } else if (a === "satchel") {
        const col = rng.pick([0x4a3322, 0x5a4a30, 0x3a3a2a, 0x6a5038]);
        H.strap(R, b, L.shade(col, 0.8), [-0.85, 0.22], [0.75, -0.06], 1.2);
        R.add(
          "hips",
          P.xf(
            P.box(0.2 * s, 0.17 * s, 0.07 * s, 0.02 * s),
            pr.rx * 1.02,
            -0.04 * s,
            -0.03 * s,
            0,
            PI / 2 - 0.35,
            0.05,
          ),
          leatherM(col),
        );
        R.add(
          "hips",
          P.xf(
            P.box(0.205 * s, 0.07 * s, 0.075 * s, 0.015 * s),
            pr.rx * 1.03,
            0.04 * s,
            -0.03 * s,
            0,
            PI / 2 - 0.35,
            0.05,
          ),
          leatherM(L.shade(col, 0.85)),
        );
      } else if (a === "bandolier") {
        H.strap(R, b, 0x3a2616, [0.85, 0.22], [-0.8, -0.04], 1.5, true);
      } else if (a === "rag") {
        const col = rng.pick([0xc8c0a8, 0xa8a090, 0x9a4a3a, 0x6a7a8a]);
        R.add(
          "chest",
          P.xf(
            P.box(0.09 * s, 0.2 * s, 0.012 * s, 0.004 * s),
            -rings.chest[3].rx * 0.55,
            0.12 * s,
            -rings.chest[2].rz * 1.02,
            0.08,
            0,
            0.12,
          ),
          cloth(col, { region: "rags" }),
        );
        R.add(
          "chest",
          P.xf(
            P.box(0.09 * s, 0.14 * s, 0.012 * s, 0.004 * s),
            -rings.chest[3].rx * 0.55,
            0.16 * s,
            rings.chest[2].rz * 0.95,
            -0.1,
            0,
            0.1,
          ),
          cloth(col, { region: "rags" }),
        );
      } else if (a === "ledger") {
        R.add(
          "hips",
          P.xf(
            P.box(0.03 * s, 0.2 * s, 0.15 * s, 0.006 * s),
            -pr.rx * 1.09,
            -0.08 * s,
            -0.02 * s,
            0,
            0,
            0.05,
          ),
          leatherM(0x3a2418),
        );
        R.add(
          "hips",
          P.xf(
            P.box(0.022 * s, 0.19 * s, 0.14 * s, 0.003 * s),
            -pr.rx * 1.075,
            -0.08 * s,
            -0.02 * s,
            0,
            0,
            0.05,
          ),
          cloth(0xd8d0b0),
        );
      } else if (a === "pack" || a === "bigpack") {
        H.backpack(
          R,
          b,
          rng.pick([0x5a5038, 0x4a4a38, 0x6a5a40]),
          a === "bigpack",
        );
      }
    }
  };
  /**
   * Re-dye the cloth of a finished outfit (template option outfitColor):
   * keeps each vertex's shading/pattern (luminance) and moves its hue &
   * saturation toward the dye — colour variants of every outfit for crowds.
   */
  H.dye = function (R, hex) {
    const d = L.col(hex),
      dl = Math.max(0.02, d.r * 0.2126 + d.g * 0.7152 + d.b * 0.0722);
    for (const p of R.prims) {
      const g = p.geo,
        cl = g.attributes.mcls,
        co = g.attributes.color;
      if (!cl || !co || cl.array[0] !== 1) continue;
      const a = co.array;
      for (let i = 0; i < a.length; i += 3) {
        // faded dye: 70 % of the dye's chroma (sun-bleached, never neon).
        // Brightness is pulled toward the dye's own (k = (l/dl)^0.5, ≤ 1.3, keeps the
        // pattern's light/dark order) so a light shirt dyed brown turns brown,
        // not a pale peach that reads as bare skin.
        const l = a[i] * 0.2126 + a[i + 1] * 0.7152 + a[i + 2] * 0.0722,
          k = Math.min(1.3, Math.pow(Math.max(1e-4, l / dl), 0.5));
        const lk = dl * k; // target luminance
        a[i] = lerp(a[i], lerp(lk, d.r * k, 0.7), 0.75);
        a[i + 1] = lerp(a[i + 1], lerp(lk, d.g * k, 0.7), 0.75);
        a[i + 2] = lerp(a[i + 2], lerp(lk, d.b * k, 0.7), 0.75);
      }
      co.needsUpdate = true;
    }
  };

  // ==================================================================
  //  HUMAN BUILDER (registered type 'human' + aliases)
  // ==================================================================
  const HAIR_M = [
    "short",
    "short",
    "buzz",
    "slick",
    "pompadour",
    "balding",
    "wild",
    "bald",
  ];
  const HAIR_F = ["bob", "long", "ponytail", "bun", "short", "long", "wild"];
  const OUTFIT_GENDER = { raider: null, raider_heavy: null };
  /** outfit → [[dirtMin, dirtMax], tint strength, [bloodMin, bloodMax]?] */
  const OUTFIT_WEAR = {
    cryo_suit: [[0.0, 0.15], 0.35],
    director_suit: [[0.0, 0.08], 0.3],
    raider: [[0.3, 0.65], 1, [0.0, 0.25]],
    raider_heavy: [[0.3, 0.65], 0.9, [0.0, 0.2]],
    settler: [[0.3, 0.6], 1],
    drifter: [[0.5, 0.85], 1],
    merchant: [[0.3, 0.6], 1],
    doctor: [[0.1, 0.3], 0.6],
    lab_coat: [[0.05, 0.25], 0.6],
    glowkeeper_robes: [[0.4, 0.7], 0.9],
    combat_armor: [[0.25, 0.5], 0.7],
    leather_armor: [[0.35, 0.7], 1],
    survivor_layers: [[0.35, 0.65], 1],
    dj: [[0.1, 0.3], 0.6],
    covenant_exo_rig: [[0.2, 0.45], 0.45],
    continuity_exo_rig: [[0.1, 0.3], 0.35],
    continuity_uniform: [[0.05, 0.2], 0.4],
  };

  /** opts: {outfit, gender, skinTone, hair, hairColor, beard, burn ('L'|'R'), scars, seed, variant, hat, scale} */
  H.build = function (opts, seed) {
    const rng = L.rng(seed);
    const outfit = opts.outfit || "settler";
    const gender =
      opts.gender ||
      (outfit === "covenant_exo_rig" ||
      outfit === "continuity_exo_rig" ||
      outfit === "raider_heavy"
        ? rng.chance(0.15)
          ? "f"
          : "m"
        : rng.chance(0.42)
          ? "f"
          : "m");
    const power =
      outfit === "covenant_exo_rig" || outfit === "continuity_exo_rig";
    const cast = opts.preset && L.CAST ? L.CAST[opts.preset] : null; // story cast preset (24_cast.js)
    const bo = (cast && cast.body) || {};
    const b = H.proportions(gender, {
      scale:
        (opts.scale || 1) * (power ? 1.1 : bo.scale || rng.range(0.96, 1.04)),
      muscle: power
        ? 0.4
        : bo.muscle !== undefined
          ? bo.muscle
          : rng.range(0, 0.4) * (gender === "f" ? 0.5 : 1),
      shoulderMul: power ? 1.2 : bo.shoulderMul || 1,
      hipMul: bo.hipMul,
      headMul: bo.headMul,
      thin: bo.thin,
    });
    const R = new L.Rig("biped");
    if (power) {
      b.hitBulk = 1.7;
      b.neckY *= 1.3;
      b.height += (b.neckY * 0.3) / 1.3;
    }
    H.skeleton(R, b, power ? { softK: 0.55 } : {});
    const tones = Object.keys(L.SKIN);
    let skin =
      typeof opts.skinTone === "number"
        ? opts.skinTone
        : L.SKIN[opts.skinTone] || L.SKIN[rng.pick(tones)];
    const hairColor =
      opts.hairColor !== undefined
        ? opts.hairColor
        : outfit === "director_suit"
          ? rng.pick([0x9a9690, 0xc8c3b8, 0x5a5048])
          : rng.pick(L.HAIR);
    let hair =
      opts.hair || (gender === "f" ? rng.pick(HAIR_F) : rng.pick(HAIR_M));
    if (outfit === "raider" && !opts.hair && rng.chance(0.45)) hair = "mohawk";
    if (outfit === "dj" && !opts.hair) hair = "pompadour";
    const beard =
      opts.beard !== undefined
        ? opts.beard
        : gender === "m" && rng.chance(0.35)
          ? rng.pick(["stubble", "stubble", "full", "moustache", "goatee"])
          : null;
    const age =
      typeof opts.age === "number"
        ? clamp(opts.age, 0, 1)
        : outfit === "director_suit"
          ? 0.8
          : rng() * 0.6;
    const face = {
      skin,
      gender,
      hair,
      hairColor:
        outfit === "raider" && hair === "mohawk"
          ? rng.pick([0xa02018, 0x20a040, 0x1a1a1a, 0xd0c040])
          : hairColor,
      beard,
      age,
      paint: outfit === "raider" && rng.chance(0.6) ? "raider" : null,
      paintSeed: rng.int(0, 9),
      noseSize: rng.range(0.85, 1.2),
      jawW: gender === "f" ? rng.range(0.68, 0.76) : rng.range(0.76, 0.86),
      angry: outfit === "raider" || outfit === "raider_heavy",
      seed: ((((seed >>> 0) ^ 0x9e3779b9) >>> 0) % 1000003) + 1,
    };
    if (cast && cast.face) Object.assign(face, cast.face);
    if (opts.burn) face.burn = opts.burn; // an old burn scar down one side (March '67)
    if (opts.scars !== undefined) face.scars = opts.scars;
    const look = { skin };
    if (power) {
      if (outfit === "continuity_exo_rig") H.continuityRig(R, b, rng, opts);
      else H.exoRig(R, b, rng, opts);
      if ((opts.glasses || opts.hat) && G.DEBUG && !H._warnedPA) {
        H._warnedPA = true;
        console.warn(
          "[characters] exo-rigs ignore opts.glasses / opts.hat (the helmet replaces them)",
        );
      }
    } else {
      const fn = OUT[outfit] || OUT.settler;
      fn(R, b, rng, look, opts);
      H.head(R, b, face);
      // Hats/hair: helmets/hoods already added by outfits; optional extra hat
      let hat = opts.hat !== undefined ? opts.hat : null;
      if (hat) H.hat(R, b, hat, opts.hatColor || 0x4a3a2a);
      if (opts.glasses)
        H.glasses(R, b, opts.glasses === true ? "specs" : opts.glasses);
      // eyewear is placed on the sculpted face by 22_face.js's H.head; if that
      // head never ran (fallback head / error), fit it to the generic skull so
      // requested glasses never silently vanish
      if (b._pendingGlasses && b._pendingGlasses.length) {
        const hs = b.headS,
          C = HC(b),
          z = C[2] - 0.103 * hs;
        b._eyeFit = {
          x: 0.033 * hs,
          y: C[1] + 0.014 * hs,
          cornea: z + 0.004 * hs,
          re: 0.012 * hs,
          side: 0.085 * hs,
          sideZ: z + 0.06 * hs,
          back: C[2] + 0.1 * hs,
          brow: z,
          nose: z + 0.004 * hs,
        };
        const pend = b._pendingGlasses;
        b._pendingGlasses = null;
        if (G.DEBUG)
          console.warn(
            "[characters] eyewear placed with the fallback fit (sculpted head unavailable)",
          );
        for (const k of pend) H.glasses(R, b, k);
      }
    }
    if (cast && cast.kit && !power)
      cast.kit(
        R,
        b,
        L.rng(seed * 17 + 11),
        look,
        opts,
        L.castFlags(opts.variant),
        face,
      );
    if (!power && opts.acc)
      H.accessories(R, b, String(opts.acc).split(","), rng);
    if (!power && typeof opts.outfitColor === "number")
      H.dye(R, opts.outfitColor);
    const tpl = R.build();
    tpl.meta.bulk = b.bulk;
    tpl.meta.gender = gender;
    tpl.meta.power = power;
    // wear & variety (per-instance tint strength, grime range, starting blood)
    const W = (cast && cast.wear) || OUTFIT_WEAR[outfit] || OUTFIT_WEAR.settler;
    tpl.meta.dirt = W[0];
    tpl.meta.tintAmt = W[1];
    if (W[2]) tpl.meta.blood = W[2];
    return tpl;
  };
  void OUTFIT_GENDER;
})();
