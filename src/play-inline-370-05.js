// play-inline-370 05 — three
// Lines 819-1153 of readable/play-inline-370.pretty.js (statement-aligned).
  D.whale = function (b, x, y, z, ry, L) {
    const TK = [0, 0.06, 0.16, 0.3, 0.5, 0.66, 0.78, 0.88, 0.95, 1];
    const WK = [
      0.01, 0.016, 0.027, 0.048, 0.07, 0.074, 0.07, 0.06, 0.044, 0.014,
    ];
    const HK = [
      0.006, 0.013, 0.024, 0.047, 0.064, 0.064, 0.056, 0.04, 0.025, 0.008,
    ];
    const CK = [
      0.002, 0.001, 0, 0.003, 0.004, 0.002, -0.003, -0.008, -0.011, -0.012,
    ];
    const itp = (K, t) => {
      for (let i = 1; i < TK.length; i++)
        if (t <= TK[i]) {
          const f = (t - TK[i - 1]) / (TK[i] - TK[i - 1]),
            e = f * f * (3 - 2 * f);
          return (K[i - 1] + (K[i] - K[i - 1]) * e) * L;
        }
      return K[K.length - 1] * L;
    };
    const NT = 46,
      NU = 26,
      pos = [],
      uv = [],
      idx = [];
    for (let i = 0; i <= NT; i++) {
      const t = i / NT,
        w = itp(WK, t),
        h = itp(HK, t),
        c = itp(CK, t);
      const flat = t > 0.72 ? Math.min(1, (t - 0.72) / 0.22) * 0.5 : 0; // flat-topped head
      for (let j = 0; j <= NU; j++) {
        const th = (j / NU) * TAU,
          co = Math.cos(th),
          si = Math.sin(th);
        const py = si > 0 ? h * si * (1 - flat * si) : h * si * 0.92;
        const px = w * co * (si < 0 ? 1 - 0.08 * -si : 1);
        pos.push(px, c + py, (t - 0.5) * L);
        uv.push(j / NU, t);
      }
    }
    for (let i = 0; i < NT; i++)
      for (let j = 0; j < NU; j++) {
        const a0 = i * (NU + 1) + j,
          a1 = a0 + 1,
          b0 = a0 + NU + 1,
          b1 = b0 + 1;
        idx.push(a0, b0, a1, a1, b0, b1);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const M = P.m4(x, y, z, ry);
    b.geo("whale_skin", g, M, { noAO: true, grime: 0.08, uv: "keep" });
    const sub = (m) => M.clone().multiply(m);
    // flukes (broad, swept, notched)
    const fl = new THREE.Shape();
    fl.moveTo(0, 0.02 * L);
    fl.quadraticCurveTo(L * 0.07, 0, L * 0.125, -L * 0.055);
    fl.quadraticCurveTo(L * 0.06, -L * 0.04, L * 0.012, -L * 0.05);
    fl.lineTo(0, -L * 0.04);
    fl.lineTo(-L * 0.012, -L * 0.05);
    fl.quadraticCurveTo(-L * 0.06, -L * 0.04, -L * 0.125, -L * 0.055);
    fl.quadraticCurveTo(-L * 0.07, 0, 0, 0.02 * L);
    b.geo(
      "whale",
      new THREE.ExtrudeGeometry(fl, {
        depth: 0.12,
        bevelEnabled: true,
        bevelSize: 0.05,
        bevelThickness: 0.05,
        bevelSegments: 1,
      }).rotateX(HP),
      sub(P.m4(0, itp(CK, 0) + 0.06, -L / 2 + 0.25)),
      { noAO: true, grime: 0.1 },
    );
    // long pectoral flippers (swept back, drooping)
    const tf = 0.74,
      zf = (tf - 0.5) * L,
      wf = itp(WK, tf),
      hf = itp(HK, tf),
      cf = itp(CK, tf);
    for (const sd of [-1, 1]) {
      const fg = new THREE.SphereGeometry(1, 10, 6);
      fg.translate(1, 0, 0);
      fg.scale(L * 0.06, L * 0.006, L * 0.016);
      b.geo(
        "whale",
        fg,
        sub(
          P.m4(
            sd * wf * 0.82,
            cf - hf * 0.5,
            zf,
            sd > 0 ? -0.55 : PI + 0.55,
            0,
            sd * -0.45,
          ),
        ),
        { noAO: true, grime: 0.1 },
      );
    }
    // small dorsal fin far back
    const df = new THREE.Shape();
    df.moveTo(0, 0);
    df.lineTo(-L * 0.03, 0);
    df.quadraticCurveTo(-L * 0.028, L * 0.012, -L * 0.04, L * 0.018);
    df.quadraticCurveTo(-L * 0.01, L * 0.012, 0, 0);
    const td = 0.28;
    b.geo(
      "whale",
      new THREE.ExtrudeGeometry(df, { depth: 0.12, bevelEnabled: false })
        .translate(0, 0, -0.06)
        .rotateY(-HP),
      sub(P.m4(0, itp(CK, td) + itp(HK, td) * 0.94, (td - 0.5) * L + L * 0.02)),
      { noAO: true },
    );
    // eyes (just above the corner of the mouth) + blowholes
    const te = 0.86,
      we = itp(WK, te),
      he = itp(HK, te),
      ce = itp(CK, te);
    for (const sd of [-1, 1]) {
      b.geo(
        "glass_dark",
        new THREE.SphereGeometry(0.1, 6, 4),
        sub(P.m4(sd * we * 0.97, ce - he * 0.08, (te - 0.5) * L)),
        { noAO: true },
      );
      b.geo(
        "rubber",
        new THREE.SphereGeometry(0.12, 6, 4),
        sub(
          P.m4(
            sd * 0.14,
            itp(CK, 0.8) + itp(HK, 0.8) * 0.72,
            (0.8 - 0.5) * L,
            0,
            0,
            0,
            1,
            0.3,
            2,
          ),
        ),
        { noAO: true },
      );
    }
  };
  /** Stylised but anatomical human statue / mannequin (local +z forward).
   *  pose: 'stand'|'atlas'|'rider'|'pomona'|'arm'|'sit'|'dance'. */
  D.figure = function (b, key, x, y, z, ry, s, pose, o) {
    o = o || {};
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const gr = o.grime === undefined ? 0.35 : o.grime;
    const add = (g, m, k2) =>
      b.geo(k2 || key, g, m ? M.clone().multiply(m) : M.clone(), {
        noAO: true,
        grime: gr,
      });
    const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
    const limb = (A, B, r0, r1, k2) => {
      const a = V(A),
        c = V(B),
        d = new THREE.Vector3().subVectors(c, a),
        len = d.length();
      if (len < 1e-3) return;
      const g = new THREE.CylinderGeometry(r1, r0, len, 7, 1, true);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        d.normalize(),
      );
      add(g, new THREE.Matrix4().compose(a, q, new THREE.Vector3(1, 1, 1)), k2);
    };
    const ball = (p, r, sx, sy, sz, k2) =>
      add(
        new THREE.SphereGeometry(r, 7, 5),
        P.m4(p[0], p[1], p[2], 0, 0, 0, sx || 1, sy || 1, sz || 1),
        k2,
      );
    const kneel = false,
      sit = pose === "rider" || pose === "sit",
      atlas = pose === "atlas";
    const hy = sit ? 0.5 : atlas ? 0.9 : 0.95; // pelvis height
    const lean = atlas ? 0.06 : 0; // Atlas leans into the load
    // ---- legs ----
    for (const sd of [-1, 1]) {
      const hip = [sd * 0.1, hy - 0.02, 0];
      let knee, ank, toe;
      if (pose === "rider") {
        knee = [sd * 0.3, hy - 0.12, 0.3];
        ank = [sd * 0.33, hy - 0.55, 0.26];
        toe = [sd * 0.33, hy - 0.6, 0.4];
      } else if (sit) {
        knee = [sd * 0.12, hy + 0.02, 0.44];
        ank = [sd * 0.12, 0.08, 0.46];
        toe = [sd * 0.12, 0.03, 0.6];
      } else if (atlas) {
        const f = sd < 0 ? 0.16 : -0.1;
        knee = [sd * 0.16, 0.48, f + 0.08];
        ank = [sd * 0.17, 0.08, f];
        toe = [sd * 0.18, 0.03, f + 0.15];
      } else if (pose === "dance") {
        const f = sd < 0 ? 0.12 : -0.14;
        knee = [sd * 0.13, 0.5, f * 0.6];
        ank = [sd * 0.14, 0.08, f];
        toe = [sd * 0.14, 0.03, f + 0.14];
      } else {
        const f = sd < 0 ? 0.05 : -0.03;
        knee = [sd * 0.115, 0.5, f * 0.5 + 0.02];
        ank = [sd * 0.12, 0.08, f];
        toe = [sd * 0.12, 0.03, f + 0.14];
      }
      limb(hip, knee, 0.095, 0.06);
      ball(knee, 0.062);
      limb(knee, ank, 0.058, 0.04);
      ball(ank, 0.042);
      add(
        new THREE.BoxGeometry(0.09, 0.07, 0.22),
        P.m4(
          (ank[0] + toe[0]) / 2,
          0.035 + (ank[1] - 0.08),
          (ank[2] + toe[2]) / 2 + 0.02,
        ),
      );
    }
    // ---- pelvis, torso (lathe), chest, neck, head ----
    ball([0, hy, 0], 0.15, 1.15, 0.8, 0.8);
    const tor = new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.13, 0.02],
        [0.125, 0.14],
        [0.15, 0.3],
        [0.175, 0.42],
        [0.16, 0.5],
        [0.07, 0.56],
        [0.001, 0.57],
      ].map((p) => new THREE.Vector2(p[0], p[1])),
      10,
    );
    tor.scale(1.05, 1, 0.68);
    add(tor, P.m4(0, hy, lean * 0.3, 0, lean));
    const shY = hy + 0.5,
      fz = lean * 0.5;
    ball([0, shY - 0.14, 0.07 + fz], 0.1, 1.5, 0.75, 0.6); // pectorals
    limb(
      [0, shY + 0.02, fz],
      [0, shY + 0.14, fz + (atlas ? 0.05 : 0)],
      0.055,
      0.05,
    );
    const hz = fz + (atlas ? 0.09 : 0),
      hdy = shY + (atlas ? 0.2 : 0.25);
    ball([0, hdy, hz], 0.105, 0.9, 1.18, 1.0);
    add(new THREE.BoxGeometry(0.12, 0.08, 0.1), P.m4(0, hdy - 0.08, hz + 0.04)); // jaw
    add(
      new THREE.ConeGeometry(0.022, 0.06, 4).rotateX(HP),
      P.m4(0, hdy - 0.01, hz + 0.105),
    ); // nose
    if (o.hat) {
      add(
        new THREE.CylinderGeometry(0.2, 0.2, 0.015, 12),
        P.m4(0, hdy + 0.08, hz),
        o.hat,
      );
      add(
        new THREE.CylinderGeometry(0.1, 0.11, 0.12, 10),
        P.m4(0, hdy + 0.14, hz),
        o.hat,
      );
    }
    if (o.robe)
      add(
        new THREE.CylinderGeometry(
          0.19,
          0.34,
          sit ? 0.5 : 0.95,
          12,
          1,
          true,
        ).translate(0, (sit ? 0.5 : 0.95) / 2, 0),
        P.m4(0, sit ? hy - 0.3 : 0.02, 0),
        o.robe === true ? key : o.robe,
      );
    if (atlas)
      add(
        new THREE.CylinderGeometry(0.17, 0.2, 0.2, 10, 1, true),
        P.m4(0, hy - 0.08, 0),
      ); // loincloth
    // ---- arms ----
    const arm = (sd, el, wr) => {
      const sh = [sd * 0.2, shY - 0.04, fz];
      ball(sh, 0.075, 1, 0.9, 0.9);
      limb(sh, el, 0.062, 0.048);
      ball(el, 0.047);
      limb(el, wr, 0.045, 0.034);
      const hd = [
        wr[0] + (wr[0] - el[0]) * 0.18,
        wr[1] + (wr[1] - el[1]) * 0.18,
        wr[2] + (wr[2] - el[2]) * 0.18,
      ];
      ball(hd, 0.045, 0.8, 1.3, 0.55);
    };
    for (const sd of [-1, 1]) {
      if (atlas)
        arm(
          sd,
          [sd * 0.4, shY + 0.18, fz + 0.02],
          [sd * 0.26, shY + 0.46, fz + 0.04],
        );
      else if (pose === "pomona")
        arm(sd, [sd * 0.3, shY - 0.2, 0.14], [sd * 0.16, shY + 0.05, 0.3]);
      else if (pose === "arm" && sd > 0)
        arm(sd, [0.34, shY + 0.14, 0.12], [0.44, shY + 0.4, 0.3]);
      else if (pose === "dance")
        arm(
          sd,
          sd < 0 ? [-0.34, shY - 0.1, 0.12] : [0.3, shY - 0.18, 0.2],
          sd < 0 ? [-0.36, shY + 0.14, 0.3] : [0.1, shY - 0.14, 0.34],
        );
      else if (pose === "rider")
        arm(sd, [sd * 0.24, shY - 0.26, 0.12], [sd * 0.14, shY - 0.3, 0.36]);
      else if (sit)
        arm(sd, [sd * 0.24, shY - 0.28, 0.06], [sd * 0.16, shY - 0.4, 0.3]);
      else
        arm(sd, [sd * 0.25, shY - 0.3, -0.01], [sd * 0.26, shY - 0.56, 0.04]);
    }
    void kneel;
  };
  /** Horse (bronze equestrian / carousel). Local +z forward. */
