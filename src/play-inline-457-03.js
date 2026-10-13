// play-inline-457 03 — math
// Lines 379-701 of readable/play-inline-457.pretty.js (statement-aligned).
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
