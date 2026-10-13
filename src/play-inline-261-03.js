// play-inline-261 03 — three
// Lines 266-568 of readable/play-inline-261.pretty.js (statement-aligned).
  D.skeleton = function (b, spec) {
    const key = spec.key || "bone";
    const curve = new THREE.CatmullRomCurve3(
      spec.pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
    );
    const N = spec.n || 40,
      v = spec.v || 0.15;
    const at = (t) => curve.getPointAt(Math.max(0, Math.min(1, t)));
    const tan = (t) => curve.getTangentAt(Math.max(0, Math.min(1, t)));
    const scaleAt = (t) =>
      spec.taper
        ? spec.taper(t)
        : 0.35 + 0.65 * Math.sin(Math.min(1, t * 1.2) * PI * 0.5);
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < N; i++) {
      const t = (i + 0.5) / N,
        p = at(t),
        d = tan(t),
        s = v * scaleAt(t);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        d,
      );
      const m = new THREE.Matrix4().compose(p, q, new THREE.Vector3(1, 1, 1));
      b.geo(
        key,
        new THREE.CylinderGeometry(
          s * 0.8,
          s,
          (curve.getLength() / N) * 0.72,
          6,
        ),
        m,
        { grime: 0.3, noAO: true },
      );
      // neural spine (dorsal) + transverse processes
      const side = new THREE.Vector3().crossVectors(d, up).normalize();
      const dors = new THREE.Vector3().crossVectors(side, d).normalize();
      const sp = spec.spine === undefined ? 1.8 : spec.spine;
      if (s > 0.02) {
        b.rod(key, p, p.clone().addScaledVector(dors, s * sp), s * 0.22, 4, {
          noAO: true,
          grime: 0.3,
        });
        if (t > 0.2) {
          b.rod(
            key,
            p.clone().addScaledVector(side, -s * 1.2),
            p.clone().addScaledVector(side, s * 1.2),
            s * 0.15,
            4,
            { noAO: true },
          );
        }
      }
      // ribs
      if (
        spec.ribs &&
        t >= spec.ribs[0] &&
        t <= spec.ribs[1] &&
        i % (spec.ribStep || 1) === 0
      ) {
        const f = (t - spec.ribs[0]) / (spec.ribs[1] - spec.ribs[0]);
        const L =
          (spec.ribLen || 1) *
          Math.sin(0.25 + f * 2.6) *
          (spec.ribScale ? spec.ribScale(f) : 1);
        for (const sg of [-1, 1]) {
          const a = p.clone(),
            b1 = p
              .clone()
              .addScaledVector(side, sg * L * 0.45)
              .addScaledVector(dors, -L * 0.1),
            c = p
              .clone()
              .addScaledVector(side, sg * L * 0.55)
              .addScaledVector(dors, -L * 0.6),
            e = p
              .clone()
              .addScaledVector(side, sg * L * 0.3)
              .addScaledVector(dors, -L * 1.0);
          b.rod(key, a, b1, s * 0.24, 4, { noAO: true });
          b.rod(key, b1, c, s * 0.2, 4, { noAO: true });
          b.rod(key, c, e, s * 0.14, 4, { noAO: true });
        }
      }
    }
    // legs
    const floorY = spec.floor || 0;
    for (const L of spec.legs || []) {
      const hip = at(L.t),
        d = tan(L.t),
        side = new THREE.Vector3().crossVectors(d, up).normalize();
      const fwd = new THREE.Vector3(d.x, 0, d.z)
        .normalize()
        .multiplyScalar(L.fwd === undefined ? 1 : L.fwd);
      for (const sg of [-1, 1]) {
        const h0 = hip.clone().addScaledVector(side, sg * (L.spread || 0.4));
        const pose = (L.pose && L.pose[sg < 0 ? 0 : 1]) || [0, 0];
        const knee = h0
          .clone()
          .addScaledVector(fwd, L.femur * (0.35 + pose[0]))
          .add(new THREE.Vector3(0, -L.femur * 0.9, 0));
        let ankle = knee
          .clone()
          .addScaledVector(fwd, -L.tibia * (0.35 - pose[1]))
          .add(new THREE.Vector3(0, -L.tibia * 0.92, 0));
        if (L.plant !== false)
          ankle.y = Math.max(floorY + (L.meta || 0.3) * 0.6, ankle.y);
        const foot = ankle.clone().addScaledVector(fwd, (L.meta || 0.3) * 0.8);
        foot.y = floorY + 0.06;
        const r0 = L.r || 0.12;
        b.rod(key, h0, knee, r0, 6, { noAO: true, grime: 0.3 });
        b.sphere(key, knee.x, knee.y, knee.z, r0 * 1.3, {
          ws: 6,
          hs: 4,
          noAO: true,
        });
        b.rod(key, knee, ankle, r0 * 0.8, 6, { noAO: true });
        b.rod(key, ankle, foot, r0 * 0.6, 5, { noAO: true });
        for (let k = -1; k <= 1; k++) {
          const toe = foot
            .clone()
            .addScaledVector(fwd, (L.meta || 0.3) * 0.5)
            .addScaledVector(side, k * r0 * 1.2);
          toe.y = floorY + 0.03;
          b.rod(key, foot, toe, r0 * 0.3, 4, { noAO: true });
        }
      }
      // pelvis plate
      b.sphere(key, hip.x, hip.y - 0.1, hip.z, (L.spread || 0.4) * 1.1, {
        sx: 1,
        sy: 0.6,
        sz: 1,
        ws: 8,
        hs: 5,
        noAO: true,
      });
    }
    for (const A of spec.arms || []) {
      const sh = at(A.t),
        d = tan(A.t),
        side = new THREE.Vector3().crossVectors(d, up).normalize();
      const fwd = new THREE.Vector3(d.x, 0, d.z).normalize();
      for (const sg of [-1, 1]) {
        const s0 = sh
          .clone()
          .addScaledVector(side, sg * (A.spread || 0.3))
          .add(new THREE.Vector3(0, -0.1, 0));
        const el = s0
          .clone()
          .addScaledVector(fwd, A.upper * (A.reach || 0.5))
          .addScaledVector(side, sg * A.upper * 0.3)
          .add(new THREE.Vector3(0, -A.upper * (A.drop || 0.7), 0));
        const wr = el
          .clone()
          .addScaledVector(fwd, A.lower * 0.8)
          .add(new THREE.Vector3(0, (A.raise || 0) * A.lower, 0));
        b.rod(key, s0, el, A.r || 0.06, 5, { noAO: true });
        b.rod(key, el, wr, (A.r || 0.06) * 0.8, 5, { noAO: true });
        const nc = A.claws || 3;
        for (let k = 0; k < nc; k++) {
          const cl = wr
            .clone()
            .addScaledVector(fwd, A.hand || 0.2)
            .addScaledVector(side, (k - (nc - 1) / 2) * 0.05)
            .add(new THREE.Vector3(0, -(A.hand || 0.2) * 0.6, 0));
          b.rod(key, wr, cl, (A.r || 0.06) * 0.35, 4, {
            noAO: true,
            rTop: 0.004,
          });
        }
      }
    }
    // skull at the head end
    if (spec.skull) {
      const S = spec.skull,
        p = at(1),
        d = tan(1);
      const yaw = Math.atan2(d.x, d.z),
        pitch = -Math.asin(Math.max(-1, Math.min(1, d.y))) + (S.pitch || 0);
      const m = new THREE.Matrix4().compose(
        p,
        new THREE.Quaternion().setFromEuler(
          new THREE.Euler(pitch, yaw, 0, "YXZ"),
        ),
        new THREE.Vector3(1, 1, 1),
      );
      const L = S.len,
        H = S.h,
        Wd = S.w;
      // cranium + tapering snout
      b.geo(
        key,
        new THREE.CylinderGeometry(Wd * 0.28, Wd * 0.5, L, 7, 2)
          .rotateX(HP)
          .translate(0, 0, L * 0.5),
        m,
        { noAO: true, grime: 0.35 },
      );
      b.geo(
        key,
        new THREE.BoxGeometry(Wd * 0.9, H * 0.7, L * 0.45).translate(
          0,
          H * 0.1,
          L * 0.22,
        ),
        m,
        { noAO: true },
      );
      // eye sockets (dark)
      for (const sg of [-1, 1])
        b.geo(
          "iron",
          new THREE.SphereGeometry(Wd * 0.14, 6, 4).translate(
            sg * Wd * 0.42,
            H * 0.22,
            L * 0.28,
          ),
          m,
          { noAO: true },
        );
      // lower jaw
      const jm = m.clone().multiply(P.m4(0, -H * 0.3, 0, 0, S.open || 0.25));
      b.geo(
        key,
        new THREE.CylinderGeometry(Wd * 0.2, Wd * 0.38, L * 0.95, 6, 1)
          .rotateX(HP)
          .translate(0, -H * 0.15, L * 0.47),
        jm,
        { noAO: true },
      );
      // teeth
      const nT = S.teeth || 10;
      for (let k = 0; k < nT; k++) {
        const zz = L * (0.35 + (0.6 * k) / nT);
        for (const sg of [-1, 1]) {
          b.geo(
            key,
            new THREE.ConeGeometry(0.018 * L, 0.09 * L, 4)
              .rotateX(PI)
              .translate(sg * Wd * (0.36 - (0.18 * k) / nT), -0.02, zz),
            m,
            { noAO: true },
          );
          b.geo(
            key,
            new THREE.ConeGeometry(0.016 * L, 0.08 * L, 4).translate(
              sg * Wd * (0.3 - (0.14 * k) / nT),
              -H * 0.05,
              zz,
            ),
            jm,
            { noAO: true },
          );
        }
      }
      if (S.horns)
        for (const hn of S.horns)
          b.geo(
            key,
            new THREE.ConeGeometry(hn.r, hn.l, 6)
              .rotateX(hn.rx || -0.6)
              .rotateZ(hn.rz || 0)
              .translate(hn.x, hn.y, hn.z),
            m,
            { noAO: true },
          );
      if (S.frill)
        b.geo(
          key,
          new THREE.CylinderGeometry(
            S.frill,
            S.frill * 0.9,
            0.08,
            14,
            1,
            false,
            -HP * 1.2,
            PI * 1.2,
          )
            .rotateX(-0.9)
            .translate(0, H * 0.4, -L * 0.05),
          m,
          { noAO: true },
        );
    }
    // museum mount: steel rods to the floor + label
    if (spec.mount !== false) {
      for (const t of spec.mountT || [0.35, 0.65]) {
        const p = at(t);
        b.rod("iron", [p.x, floorY, p.z], [p.x, p.y, p.z], 0.035, 5, {
          noAO: true,
        });
      }
    }
    return curve;
  };

  // ---------------------------------------------------------------
  // Taxidermy / sculpture creatures (diorama animals)
  // ---------------------------------------------------------------
  /** Four-legged mount. o: {len, h, key, head:'cat'|'horse'|'antelope'|'bear', mane, horns, tail, neck (0..1 raise)} */
