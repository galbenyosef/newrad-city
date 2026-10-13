// play-inline-460 02 — out
// Lines 18-298 of readable/play-inline-460.pretty.js (statement-aligned).
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
