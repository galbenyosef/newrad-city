/* src/characters/30_creatures.js */
/* =====================================================================
 * NEW RAD CITY — CHARACTERS: big creatures
 * Owned by: characters.
 *
 * brute, colossus (hunched grey-violet giants with bone plates),
 * ripjaw (low six-legged armoured predator with a long jaw),
 * shellback (+ shellback_stalker, shellback_spawn, shellback_matriarch:
 * horseshoe-crab-like domed shells). Also exports L.creatureKit.
 * Each registers L.infos[type] = {kind, height, radius, gore, parts,
 * labels, gait, style, build(opts, seed) → template}.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  if (!G || !G.chars || !G.chars._lib || !G.chars._lib.human) return;
  const L = G.chars._lib,
    H = L.human;
  const P = L.prim,
    PAL = L.PAL,
    M = H.mat;
  const lerp = L.lerp,
    clamp = L.clamp;
  const PI = Math.PI;
  const ALL6 = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"];
  const LBL = {
    head: "Head",
    torso: "Torso",
    leftArm: "Left Arm",
    rightArm: "Right Arm",
    leftLeg: "Left Leg",
    rightLeg: "Right Leg",
  };

  // ------------------------------------------------------------------
  // helpers
  // ------------------------------------------------------------------
  const _qa = new THREE.Quaternion(),
    _va = new THREE.Vector3(),
    _vb = new THREE.Vector3(0, -1, 0);
  /** Tapered limb from the bone origin to `to` (bone-local), oriented along it. */
  function seg(R, bone, to, r0, r1, mat, o) {
    o = o || {};
    _va.set(to[0], to[1], to[2]);
    const len = _va.length();
    const g = P.limb(len, r0, r1, {
      seg: o.seg || 10,
      bulge: o.bulge || 0,
      bulgeAt: o.bulgeAt,
      flat: o.flat,
      wide: o.wide,
    });
    _qa.setFromUnitVectors(_vb, _va.normalize());
    g.applyQuaternion(_qa);
    if (o.offset) g.translate(o.offset[0], o.offset[1], o.offset[2]);
    return R.add(bone, g, mat);
  }
  /** Curved claw/horn/tooth: from base along a path given as offsets; tapered to a point. */
  function claw(R, bone, pts, r, mat, rs) {
    return R.add(
      bone,
      P.sweep(pts, (t) => r * Math.pow(1 - t, 0.8) + 0.0015, {
        seg: r < 0.012 ? 4 : r < 0.03 ? 6 : 8,
        rs: rs || 6,
      }),
      mat,
    );
  }
  /** Loft along +Z (for horizontal bodies): rings {z, rx, ry, oy} front→back order irrelevant. */
  function bodyZ(rings, o) {
    const rs = rings
      .slice()
      .sort((a, b) => b.z - a.z)
      .map((r) => ({
        y: -r.z,
        rx: r.rx,
        rz: r.ry,
        oz: r.oy || 0,
        ox: r.ox || 0,
        n: r.n || 2.2,
      }));
    const g = P.loft(
      rs,
      Object.assign({ seg: 16, capTop: true, capBottom: true }, o || {}),
    );
    // loft y → -z , loft z → +y   (rotate -90° about X)
    g.rotateX(-PI / 2);
    return g;
  }
  const skinMat = (c, extra) =>
    Object.assign(
      { color: c, region: "skin", rough: 0.6, noise: 0.14, grad: [0.85, 1.05] },
      extra || {},
    );

  // ==================================================================
  // BRUTE & COLOSSUS — hunched grey-violet giants with bone plates
  // growing through the skin, crude scrap armour; the Colossus is the
  // huge variant swinging a steel I-beam.
  // ==================================================================
  function brutePaint(dark) {
    return function (x, y, z, nx, ny, nz, out, wx, wy, wz) {
      const n = L.noise3(wx * 5, wy * 5, wz * 5),
        v = L.noise3(wx * 22, wy * 22, wz * 22);
      if (n > 0.6) {
        out[0] *= 0.8;
        out[1] *= 0.76;
        out[2] *= 0.86;
      } // bruise-violet mottling
      if (v > 0.78) {
        out[0] *= 0.66;
        out[1] *= 0.6;
        out[2] *= 0.74;
      } // dark veins
      const sc = Math.abs(
        Math.sin(wx * 31 + wy * 17 + L.noise3(wx * 9, wy * 9, wz * 9) * 4),
      );
      if (sc < 0.025 && n < 0.45) {
        out[0] = out[0] * 0.5 + 0.38;
        out[1] = out[1] * 0.5 + 0.33;
        out[2] = out[2] * 0.5 + 0.36;
      } // pale scar seams
      if (nz < -0.5 && ny < 0.3) {
        out[0] *= 1.06;
        out[1] *= 1.04;
        out[2] *= 1.06;
      }
      if (dark) {
        out[0] *= 0.85;
        out[1] *= 0.82;
        out[2] *= 0.88;
      }
    };
  }
  const boneMat = (extra) =>
    Object.assign(
      {
        color: 0xbdb5a2,
        rough: 0.5,
        noise: 0.28,
        grad: [0.72, 1.08],
        rigid: true,
        paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
          const g = Math.abs(
            Math.sin(wx * 140 + L.noise3(wx * 20, wy * 20, wz * 20) * 3),
          );
          if (g < 0.12) {
            out[0] *= 0.7;
            out[1] *= 0.66;
            out[2] *= 0.6;
          } // growth lines
          if (ny < -0.3) {
            out[0] *= 0.78;
            out[1] *= 0.74;
            out[2] *= 0.72;
          } // dirty undersides
        },
      },
      extra || {},
    );
  /** A curved bone plate: a shallow shell patch (rx×ry, thickness t) facing `dir` (-Z = forward) on a bone. */
  function bonePlate(R, bone, x, y, z, rx, ry, t, rot, mat) {
    const g = P.sphere(rx, ry, t, 10, 7, 0, PI * 2, 0, PI * 0.5);
    g.rotateX(-PI / 2); // dome faces -Z
    P.deform(g, (v) => {
      v.z += Math.abs(v.x / rx) * Math.abs(v.x / rx) * t * 0.6;
    });
    R.add(bone, P.xf(g, x, y, z, rot[0], rot[1], rot[2]), mat);
  }
  /** Row of knobbed bone spurs along a path (spine ridge, forearm crest). */
  function spurRow(R, bone, pts, h, r, mat, back) {
    for (const p of pts) {
      const d = back ? [0, h * 0.55, h] : [0, h, 0];
      R.add(
        bone,
        P.sweep(
          [
            [p[0], p[1], p[2]],
            [p[0] + d[0] * 0.5, p[1] + d[1] * 0.55, p[2] + d[2] * 0.5],
            [p[0] + d[0], p[1] + d[1], p[2] + d[2]],
          ],
          (u) => r * (1 - u * 0.8) + 0.002,
          { seg: 4, rs: 6 },
        ),
        mat,
      );
    }
  }
  /** Steel I-beam club (Colossus): flanges + web, rivets, rust, a chain wrap at the grip. */
  function girderClub(R, bone, k, gripY, tilt) {
    const rust = {
      color: 0x58524c,
      region: "metal",
      rough: 0.75,
      metal: 0.4,
      noise: 0.3,
      grad: [0.7, 1.1],
      paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
        const n = L.noise3(wx * 9, wy * 9, wz * 9);
        if (n > 0.6) {
          out[0] = out[0] * 0.5 + 0.22;
          out[1] = out[1] * 0.5 + 0.1;
          out[2] = out[2] * 0.5 + 0.04;
        } else if (n < 0.3) {
          out[0] = out[0] * 0.6 + 0.12;
          out[1] = out[1] * 0.6 + 0.12;
          out[2] = out[2] * 0.6 + 0.12;
        } // mill-scale grey
      },
    };
    const parts = [];
    const L0 = 1.15 * k,
      W = 0.11 * k,
      Hh = 0.16 * k,
      T = 0.016 * k;
    parts.push(P.xf(P.box(W, T, L0, T * 0.3), 0, Hh / 2, -L0 / 2)); // top flange
    parts.push(P.xf(P.box(W, T, L0, T * 0.3), 0, -Hh / 2, -L0 / 2)); // bottom flange
    parts.push(P.xf(P.box(T * 0.8, Hh, L0, T * 0.2), 0, 0, -L0 / 2)); // web
    for (let i = 0; i < 9; i++)
      for (const sy of [-1, 1])
        parts.push(
          P.xf(
            P.cyl(0.008 * k, 0.008 * k, 0.012 * k, 6),
            0,
            sy * (Hh / 2 + T * 0.6),
            -0.12 * k - i * 0.12 * k,
          ),
        );
    for (const g of parts) {
      g.rotateX(tilt);
      g.translate(0, gripY, 0);
      R.add(bone, g, rust);
    }
    const chain = M.metal(0x5a5650, { rough: 0.45, metal: 0.8 });
    for (let i = 0; i < 6; i++) {
      const g = P.torus(0.07 * k, 0.012 * k, 4, 10);
      g.rotateY(i % 2 ? PI / 2 : 0);
      g.rotateX(PI / 2);
      g.translate(0, 0, -0.04 * k - i * 0.045 * k);
      g.rotateX(tilt);
      g.translate(0, gripY, 0);
      R.add(bone, g, chain);
    }
  }
  /** Colossus foot: broad padded sole, heel, five splayed toes with thick nails. */
  function bigFoot(R, bone, b, mat, sg) {
    const s = b.s,
      ah = b.ankle;
    const sole = P.box(0.15 * s, ah + 0.02 * s, 0.25 * s, 0.045 * s);
    P.deform(sole, (v) => {
      if (v.z < -0.05 * s) v.x *= 1 + ((-v.z - 0.05 * s) * 3) / s;
      if (v.y > 0) v.x *= 0.85;
    });
    R.add(bone, P.xf(sole, 0, -ah / 2 + 0.006 * s, -0.045 * s), mat);
    R.add(
      bone,
      P.xf(
        P.sphere(0.07 * s, 0.06 * s, 0.07 * s, 9, 7),
        0,
        -ah * 0.55,
        0.05 * s,
      ),
      mat,
    );
    for (let i = 0; i < 5; i++) {
      const t = i / 4 - 0.5,
        big = i === (sg < 0 ? 4 : 0) ? 1.35 : 1;
      const x = t * 0.15 * s,
        len = (0.05 - Math.abs(t) * 0.02) * s * big;
      const bx = x * 1.05,
        by = -ah * 0.62,
        bz = -0.17 * s - Math.cos(t * 2) * 0.01 * s;
      R.add(
        bone,
        P.sweep(
          [
            [bx, by, bz],
            [bx * 1.12, by - 0.006 * s, bz - len * 0.6],
            [bx * 1.2, by - 0.018 * s, bz - len],
          ],
          (u) => (0.024 - u * 0.006) * s * big,
          { seg: 4, rs: 6 },
        ),
        mat,
      );
      R.add(
        bone,
        P.xf(
          P.sphere(0.014 * s * big, 0.006 * s, 0.013 * s * big, 6, 4),
          bx * 1.2,
          by - 0.005 * s,
          bz - len - 0.004 * s,
        ),
        { color: 0x8a8070, rough: 0.5, noise: 0.3 },
      );
    }
  }
  function buildBrute(opts, seed, colossus) {
    const rng = L.rng(seed);
    const sc = colossus ? 2.45 : rng.range(1.26, 1.34);
    const b = H.proportions("m", {
      scale: sc,
      muscle: colossus ? 1.55 : 1.3,
      shoulderMul: colossus ? 1.55 : 1.48,
      headMul: colossus ? 0.72 : 0.8,
      hipMul: 1.05,
    });
    b.torsoW *= 1.55;
    b.torsoD *= colossus ? 1.45 : 1.3;
    // short thick legs, long heavy forearms, small low head, almost no neck
    b.upper *= colossus ? 1.18 : 1.1;
    b.fore *= colossus ? 1.42 : 1.32;
    b.neckY *= colossus ? 0.8 : 0.6;
    b.chest *= 1.12;
    b.thigh *= colossus ? 0.82 : 0.86;
    b.shin *= colossus ? 0.78 : 0.82;
    b.hipH = b.ankle + b.shin + b.thigh + b.hipDrop;
    b.legLen = b.ankle + b.shin + b.thigh;
    b.height = b.hipH + b.spine + b.chest + b.neckY + b.headY + 0.225 * b.headS;
    const R = new L.Rig("biped");
    H.skeleton(R, b, {
      neckZ: (colossus ? -0.15 : -0.11) * b.s,
      headZ: (colossus ? -0.05 : -0.04) * b.s,
    });
    const s = b.s;
    const skin = colossus
      ? 0x544a5e
      : rng.pick([0x6c5f78, 0x635870, 0x76667e, 0x5f566a]);
    const bp = brutePaint(colossus);
    const sm = skinMat(skin, { paint: bp, rough: 0.6 });
    const variant =
      opts.variant !== undefined ? Number(opts.variant) || 0 : rng.int(0, 2);
    const bone = boneMat();
    const wrap = rng.pick([0x3a3026, 0x2e2c28, 0x4a3a28]);
    const look = {
      skin,
      topMat: sm,
      abdomenMat: sm,
      bottomMat: M.leather(wrap, { region: "leather" }),
      sleeve: "none",
      boot: skin,
      bootMat: sm,
      bootH: 0,
      laces: false,
    };
    H.torso(R, b, look);
    H.neck(R, b, sm, 2.1);
    // asymmetric arms: the right one is grossly overgrown
    H.arm(R, b, "L", {
      sleeve: "none",
      skin,
      skinPaint: bp,
      glove: null,
      mul: 1.0,
    });
    H.arm(R, b, "R", {
      sleeve: "none",
      skin,
      skinPaint: bp,
      glove: null,
      mul: 1.32,
    });
    for (const S of ["L", "R"])
      H.leg(R, b, S, {
        pantsMat: M.cloth(wrap, { region: "rags" }),
        boot: skin,
        bootMat: sm,
        bootH: 0.02,
        laces: false,
        skin,
        barefoot: true,
        mul: 1.18,
      });
    // massive shoulder yoke (wide, tapering into the narrow waist), pecs, lats
    const tk = colossus ? 1.0 : 1.12;
    R.add(
      "chest",
      P.xf(
        P.sphere(0.27 * s * tk, 0.1 * s * tk, 0.15 * s * tk, 16, 9),
        0,
        0.22 * s,
        0.02 * s,
      ),
      sm,
    );
    for (const sg of [-1, 1]) {
      R.add(
        "chest",
        P.xf(
          P.sphere(0.11 * s, 0.085 * s, 0.065 * s, 10, 7),
          sg * 0.085 * s,
          0.12 * s,
          -b.torsoD * 0.92,
        ),
        sm,
      );
      R.add(
        "chest",
        P.xf(
          P.sphere(0.075 * s, 0.17 * s, 0.11 * s, 9, 7),
          sg * b.torsoW * 0.98,
          0.04 * s,
          0.02 * s,
          0,
          0,
          sg * 0.28,
        ),
        sm,
      );
      R.add(
        "arm" + (sg < 0 ? "L" : "R"),
        P.xf(
          P.sphere(
            0.085 * s * (sg > 0 ? 1.3 : 1),
            0.08 * s,
            0.085 * s * (sg > 0 ? 1.3 : 1),
            10,
            8,
          ),
          0,
          -0.02 * s,
          0,
        ),
        sm,
      ); // deltoid knot
    }
    // ---- bone plates through the skin ----
    // shoulders: layered plates (bigger on the overgrown right side)
    for (const [S, sg, k] of [
      ["L", -1, 1],
      ["R", 1, 1.35],
    ]) {
      for (let i = 0; i < 3; i++)
        bonePlate(
          R,
          "arm" + S,
          sg * 0.04 * s * k,
          (0.06 - i * 0.06) * s * k,
          0,
          0.12 * s * k * (1 - i * 0.12),
          0.085 * s * k,
          0.04 * s * k,
          [0.25, (sg * PI) / 2, 0],
          bone,
        );
      // forearm crest: overlapping plates down the outside of the forearm
      const fx = sg * 0.05 * s * k;
      for (let i = 0; i < 4; i++)
        bonePlate(
          R,
          "forearm" + S,
          fx,
          -(0.05 + i * b.fore * 0.19),
          0,
          0.055 * s * k,
          0.085 * s * k,
          0.026 * s * k,
          [0.2, (sg * PI) / 2, 0],
          bone,
        );
      // knuckle plates
      R.add(
        "hand" + S,
        P.xf(
          P.box(0.1 * s * k, 0.03 * s, 0.05 * s, 0.012 * s),
          0,
          -0.08 * s * k,
          -0.02 * s,
        ),
        bone,
      );
    }
    // spine ridge: knobbed spurs down the back
    const back = H.torsoRings(b).chest[2].rz;
    spurRow(
      R,
      "chest",
      [
        [0, 0.3 * s, back * 0.8],
        [0, 0.22 * s, back * 1.0],
        [0, 0.13 * s, back * 1.05],
        [0, 0.04 * s, back * 1.02],
      ],
      (colossus ? 0.11 : 0.07) * s,
      (colossus ? 0.04 : 0.025) * s,
      bone,
      true,
    );
    spurRow(
      R,
      "spine",
      [
        [0, 0.1 * s, b.torsoD * 0.95],
        [0, 0.0, b.torsoD * 0.9],
      ],
      0.05 * s,
      0.02 * s,
      bone,
      true,
    );
    // sternum / collar plate breaking through the chest
    bonePlate(
      R,
      "chest",
      0.0,
      0.2 * s,
      -b.torsoD * 1.0,
      0.07 * s,
      0.05 * s,
      0.025 * s,
      [0.3, 0, 0],
      bone,
    );
    // ---- crude scrap armour ----
    const scrap = (c) =>
      M.metal(c, {
        rough: 0.75,
        metal: 0.45,
        region: "metal",
        paint: (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
          if (L.noise3(wx * 10, wy * 10, wz * 10) > 0.62) {
            out[0] = out[0] * 0.5 + 0.2;
            out[1] = out[1] * 0.5 + 0.09;
            out[2] = out[2] * 0.5 + 0.04;
          }
        },
      });
    const strap = M.leather(0x2a1c12);
    const rings = H.torsoRings(b);
    // a car-door / sheet-metal plate strapped across the left chest
    if (variant >= 1 || colossus) {
      const door = P.box(0.32 * s, 0.26 * s, 0.02 * s, 0.03 * s);
      P.deform(door, (v) => {
        v.z += ((v.x * v.x) / (0.4 * s)) * 1.6;
      }); // bent round the chest
      R.add(
        "chest",
        P.xf(door, -0.07 * s, 0.1 * s, -b.torsoD * 1.12, 0.05, 0.12, 0.08),
        scrap(rng.pick([0x5a6a72, 0x7a3a26, 0x6a6458])),
      );
      R.add(
        "chest",
        P.xf(
          P.box(0.12 * s, 0.03 * s, 0.025 * s, 0.01 * s),
          -0.12 * s,
          0.17 * s,
          -b.torsoD * 1.15,
          0.05,
          0.12,
          0.08,
        ),
        M.metal(0xb8b8b0, { rough: 0.3, metal: 0.85 }),
      ); // chrome handle
    }
    H.strap(R, b, 0x2a1c12, [-0.95, 0.2], [0.75, -0.03], 1.8, false);
    H.strap(R, b, 0x2a1c12, [0.95, 0.2], [-0.75, -0.03], 1.4, false);
    if (variant >= 2) {
      H.pauldron(R, b, "L", 0x5a5248, 2, 1.25);
      for (const S of ["L", "R"])
        R.add(
          "shin" + S,
          P.xf(
            P.box(0.13 * s, 0.22 * s, 0.03 * s, 0.01 * s),
            0,
            -0.1 * s,
            -0.08 * s,
          ),
          scrap(0x5a5a50),
        );
      H.signPlate(
        R,
        "spine",
        rng.pick(["stop", "warn", "speed"]),
        0.11 * s,
        0,
        0.02 * s,
        -b.torsoD * 1.15,
        0.1,
        0,
        0,
      );
    }
    // waist: wrapped hide kilt + a heavy chain belt
    for (const z of [-1, 1])
      R.add(
        "hips",
        P.xf(
          P.box(0.26 * s, 0.24 * s, 0.014 * s, 0.004),
          0,
          -0.15 * s,
          z * rings.pelvis[2].rz * 1.04,
          z * 0.1,
          0,
          0,
        ),
        M.leather(wrap, { region: "rags" }),
      );
    const chainM = M.metal(0x4e4a44, { rough: 0.5, metal: 0.8 });
    const pr = rings.pelvis[2];
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * PI * 2;
      const g = P.torus(0.022 * s, 0.006 * s, 4, 8);
      g.rotateY(-a + (i % 2 ? PI / 2 : 0));
      R.add(
        "hips",
        P.xf(
          g,
          Math.sin(a) * pr.rx * 1.08,
          0.04 * s,
          -Math.cos(a) * pr.rz * 1.08,
        ),
        chainM,
      );
    }
    // ---- head: small, low, bony crest & cheek plates ----
    const headPaint = (x, y, z, nx, ny, nz, out, wx, wy, wz) => {
      bp(x, y, z, nx, ny, nz, out, wx, wy, wz);
      if (y > 0.13 * b.headS && nz < 0.2) {
        out[0] *= 0.86;
        out[1] *= 0.82;
        out[2] *= 0.9;
      }
    };
    H.head(R, b, {
      skin,
      gender: "m",
      mutant: true,
      brow: 2.8,
      jawW: 1.1,
      hair: "bald",
      eyeColor: 0xa8b8c0,
      noseSize: 1.1,
      lipColor: L.shade(skin, 0.55),
      angry: true,
      skinPaint: headPaint,
    });
    const hs = b.headS;
    // bony crest from the brow ridge back over the skull
    R.add(
      "head",
      P.sweep(
        [
          [0, 0.17 * hs, -0.1 * hs],
          [0, 0.235 * hs, -0.03 * hs],
          [0, 0.24 * hs, 0.05 * hs],
          [0, 0.2 * hs, 0.12 * hs],
        ],
        (u) => (0.022 + 0.01 * Math.sin(u * PI)) * hs * (colossus ? 1.4 : 1),
        { seg: 10, rs: 6 },
      ),
      bone,
    );
    for (const sg of [-1, 1]) {
      bonePlate(
        R,
        "head",
        sg * 0.075 * hs,
        0.1 * hs,
        -0.06 * hs,
        0.035 * hs,
        0.025 * hs,
        0.014 * hs,
        [0, sg * 0.9, 0],
        bone,
      ); // cheek plates
      R.add(
        "head",
        P.sweep(
          [
            [sg * 0.06 * hs, 0.16 * hs, -0.09 * hs],
            [sg * 0.085 * hs, 0.17 * hs, -0.06 * hs],
            [sg * 0.1 * hs, 0.16 * hs, -0.02 * hs],
          ],
          0.012 * hs,
          { seg: 5, rs: 5 },
        ),
        bone,
      ); // brow horns (stubby)
    }
    if (colossus) {
      girderClub(R, "handR", s * 0.62, -0.06 * s, -0.55);
      // shackles & chain stubs on both wrists, bone plate armour down the back
      for (const S of ["L", "R"]) {
        R.add(
          "forearm" + S,
          P.xf(
            P.cyl(0.075 * s, 0.075 * s, 0.07 * s, 12, true),
            0,
            -b.fore + 0.05 * s,
            0,
          ),
          M.metal(0x3a3632, { rough: 0.5, metal: 0.7 }),
        );
        for (let i = 0; i < 4; i++) {
          const g = P.torus(0.03 * s, 0.008 * s, 4, 8);
          g.rotateY(i % 2 ? PI / 2 : 0);
          R.add(
            "forearm" + S,
            P.xf(g, 0, -b.fore + 0.02 * s - i * 0.05 * s, 0.07 * s),
            chainM,
          );
        }
      }
      for (let i = 0; i < 4; i++)
        for (const sg of [-1, 1])
          bonePlate(
            R,
            "chest",
            sg * 0.12 * s,
            (0.26 - i * 0.08) * s,
            back * 0.98,
            0.09 * s,
            0.06 * s,
            0.03 * s,
            [0, PI + sg * 0.5, 0],
            bone,
          );
      H.signPlate(
        R,
        "chest",
        "oneway",
        0.09 * s,
        0.1 * s,
        0.05 * s,
        -b.torsoD * 1.15,
        0.05,
        -0.2,
        0.15,
      );
      for (const S of ["L", "R"])
        bigFoot(R, "foot" + S, b, sm, S === "L" ? -1 : 1);
    }
    const tpl = R.build();
    tpl.meta.bodyThick = 0.16 * s;
    tpl.meta.gore = "violet";
    tpl.meta.weaponScale = colossus ? 2 : 1.3;
    return tpl;
  }
  L.infos.brute = {
    kind: "biped",
    height: 2.3,
    radius: 0.6,
    gore: "violet",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 0.88, runStep: 1.5, walkSpeed: 1.6, runSpeed: 4.9 },
    // hunched, head low and forward, long heavy forearms swinging in front
    style: {
      hunch: 0.72,
      crouch: 0.34,
      armOut: 0.2,
      armFwd: 0.55,
      elbow: 0.42,
      stride: 1.0,
      armSwing: 0.9,
      shrug: 0.2,
    },
    variants: 6,
    dirt: [0.3, 0.6],
    build: (o, s) => buildBrute(o, s, false),
  };
  L.infos.colossus = {
    kind: "biped",
    height: 4.6,
    radius: 1.4,
    gore: "violet",
    isCreature: true,
    parts: ALL6,
    labels: LBL,
    gait: { walkStep: 1.6, runStep: 2.5, walkSpeed: 2.1, runSpeed: 5.4 },
    style: {
      hunch: 0.85,
      crouch: 0.6,
      armOut: 0.24,
      armFwd: 0.7,
      elbow: 0.32,
      stride: 0.95,
      armSwing: 0.6,
      heavy: true,
      club: true,
      shrug: 0.24,
      lookLimit: 0.9,
    },
    variants: 1,
    build: (o, s) => buildBrute(o, s, true),
  };

  // ==================================================================
  // RIPJAW — a low, six-legged armoured predator: sprawling crocodilian
  // limbs, overlapping bony scutes from the nape to the tail tip, and a
  // very long narrow jaw lined with interlocking teeth.
  // Quad plan + a middle leg pair (ML/MR) that the gait drives too.
  // ==================================================================
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
  L.infos.ripjaw = {
    kind: "quad",
    height: 1.0,
    radius: 0.85,
    gore: "red",
    isCreature: true,
    parts: ALL6,
    labels: {
      head: "Jaws",
      torso: "Armoured Back",
      leftArm: "Left Foreleg",
      rightArm: "Right Foreleg",
      leftLeg: "Left Legs",
      rightLeg: "Right Legs",
    },
    gait: { walkStep: 0.75, runStep: 1.7, walkSpeed: 1.8, runSpeed: 8.5 },
    style: { stride: 0.8, tailUp: -0.05, lookLimit: 0.9 },
    variants: 3,
    build: buildRipjaw,
  };

  // ==================================================================
  // shared six-legged insect rig (roaches, ants)
  // ==================================================================
  function sixLegRig(R, s, bodyH, legSpan, legs, partMap) {
    R.bone("body", null, 0, bodyH, 0, "torso");
    R.bone("head", "body", 0, 0.01 * s, -legs.headZ * s, "head");
    R.bone("antL", "head", -0.02 * s, 0.03 * s, -0.04 * s, "head");
    R.bone("antR", "head", 0.02 * s, 0.03 * s, -0.04 * s, "head");
    R.bone("mandL", "head", -0.02 * s, -0.02 * s, -0.05 * s, "head");
    R.bone("mandR", "head", 0.02 * s, -0.02 * s, -0.05 * s, "head");
    R.bone("abdomen", "body", 0, 0, legs.abdZ * s, "torso");
    const rows = [
      ["1", -legs.z1],
      ["2", 0],
      ["3", legs.z3],
    ];
    for (const [n, z] of rows) {
      for (const [side, sg] of [
        ["L", -1],
        ["R", 1],
      ]) {
        const S = side + n;
        R.bone(
          "leg" + S,
          "body",
          sg * legs.hipX * s,
          -0.01 * s,
          z * s,
          partMap[S] || "torso",
        );
        R.bone(
          "foot" + S,
          "leg" + S,
          sg * legSpan[0] * s,
          legSpan[1] * s,
          (z === 0 ? 0 : Math.sign(z)) * legSpan[2] * s,
          partMap[S] || "torso",
        );
      }
    }
  }
  // ==================================================================
  // SHELLBACK — horseshoe-crab-like: a broad, low DOMED head shield with
  // a keel and compound eyes, a hinged spiny rear shell, a long spike
  // tail, four pairs of walking legs mostly hidden under the dome rim and
  // two short pincer arms at the front. Variants: normal, 'stalker'
  // (high-legged, dark, fast), 'spawn' (small pale juvenile), 'matriarch'
  // (huge, rim spines, barnacles, egg clusters). Insect plan.
  // ==================================================================
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
  const SHELL_LBL = {
    head: "Head Shield",
    torso: "Shell",
    leftArm: "Left Pincer",
    rightArm: "Right Pincer",
    leftLeg: "Left Legs",
    rightLeg: "Right Legs",
  };
  L.infos.shellback = {
    kind: "insect",
    height: 0.72,
    radius: 0.72,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 0.42, runStep: 0.75, walkSpeed: 1.4, runSpeed: 4.8 },
    style: {},
    variants: 4,
    dirt: [0.15, 0.4],
    build: (o, sd) => buildShellback(o, sd, "normal"),
  };
  L.infos.shellback_stalker = {
    kind: "insect",
    height: 1.1,
    radius: 0.75,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 0.6, runStep: 1.2, walkSpeed: 1.8, runSpeed: 7.2 },
    style: {},
    variants: 2,
    build: (o, sd) => buildShellback(o, sd, "stalker"),
  };
  L.infos.shellback_spawn = {
    kind: "insect",
    height: 0.24,
    radius: 0.24,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 0.16, runStep: 0.3, walkSpeed: 1.0, runSpeed: 4.2 },
    style: {},
    variants: 2,
    build: (o, sd) => buildShellback(o, sd, "spawn"),
  };
  L.infos.shellback_matriarch = {
    kind: "insect",
    height: 2.3,
    radius: 2.2,
    gore: "blue",
    isCreature: true,
    parts: ALL6,
    labels: SHELL_LBL,
    gait: { walkStep: 1.2, runStep: 2.0, walkSpeed: 1.8, runSpeed: 4.6 },
    style: { big: true },
    variants: 1,
    build: (o, sd) => buildShellback(o, sd, "matriarch"),
  };
  function smoothstep(a, b, x) {
    const t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }
  // shared builder helpers for the other creature files
  L.creatureKit = {
    seg,
    claw,
    bodyZ,
    skinMat,
    sixLegRig,
    smoothstep,
    ALL6,
    LBL,
  };
})();
