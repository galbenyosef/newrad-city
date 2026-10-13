// play-inline-370 04 — bodyr
// Lines 569-818 of readable/play-inline-370.pretty.js (statement-aligned).
  D.animal = function (b, x, y, z, ry, o) {
    o = o || {};
    const L = o.len || 2,
      H = o.h || 1.2,
      k = o.key || "hide_tan";
    const M = P.m4(x, y, z, ry);
    const add = (geo, m, key) =>
      b.geo(key || k, geo, M.clone().multiply(m || new THREE.Matrix4()), {
        grime: 0.2,
        noAO: true,
      });
    const bodyR = H * 0.28;
    add(
      new THREE.SphereGeometry(1, 10, 7),
      P.m4(
        0,
        H * 0.72,
        0,
        0,
        0,
        0,
        bodyR * (o.girth || 1),
        bodyR * 1.05,
        L * 0.5,
      ),
    );
    // legs
    for (const [lx, lz] of [
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ]) {
      const px = lx * bodyR * 0.6,
        pz = lz * L * 0.32;
      add(
        new THREE.CylinderGeometry(
          bodyR * 0.22,
          bodyR * 0.14,
          H * 0.62,
          6,
        ).translate(0, H * 0.31, 0),
        P.m4(px, 0.02, pz, 0, o.walk ? lz * 0.15 * (lx > 0 ? 1 : -1) : 0),
      );
      add(
        new THREE.CylinderGeometry(bodyR * 0.16, bodyR * 0.18, 0.08, 6),
        P.m4(px, 0.0, pz),
        o.hoof || k,
      );
    }
    // neck + head
    const nr = o.neck === undefined ? 0.5 : o.neck;
    const neckBase = [0, H * 0.82, L * 0.42],
      headP = [0, H * (0.85 + nr * 0.45), L * (0.5 + 0.2 * (1 - nr))];
    b.rod(
      k,
      [
        x + Math.sin(ry) * neckBase[2],
        y + neckBase[1],
        z + Math.cos(ry) * neckBase[2],
      ],
      [x + Math.sin(ry) * headP[2], y + headP[1], z + Math.cos(ry) * headP[2]],
      bodyR * 0.45,
      7,
      { rTop: bodyR * 0.3, noAO: true },
    );
    const hs =
      o.head === "cat"
        ? [0.7, 0.62, 0.8]
        : o.head === "bear"
          ? [0.6, 0.6, 0.9]
          : [0.45, 0.5, 1.1];
    add(
      new THREE.SphereGeometry(bodyR * 0.6, 8, 6),
      P.m4(0, headP[1], headP[2] + bodyR * 0.3, 0, 0.2, 0, hs[0], hs[1], hs[2]),
    );
    if (o.head !== "cat" && o.head !== "bear")
      add(
        new THREE.CylinderGeometry(
          bodyR * 0.18,
          bodyR * 0.24,
          bodyR * 0.7,
          6,
        ).rotateX(HP + 0.4),
        P.m4(0, headP[1] - bodyR * 0.12, headP[2] + bodyR * 0.75),
      );
    for (const s of [-1, 1])
      add(
        new THREE.ConeGeometry(bodyR * 0.12, bodyR * 0.3, 4),
        P.m4(
          s * bodyR * 0.22,
          headP[1] + bodyR * 0.36,
          headP[2] + bodyR * 0.1,
          0,
          -0.2,
          s * 0.3,
        ),
      );
    if (o.mane)
      add(
        new THREE.SphereGeometry(bodyR * 0.95, 8, 6),
        P.m4(
          0,
          headP[1] - 0.05,
          headP[2] + bodyR * 0.05,
          0,
          0,
          0,
          1,
          1.05,
          0.85,
        ),
        o.mane,
      );
    if (o.horns)
      for (const s of [-1, 1])
        b.geo(
          "bone_dark",
          new THREE.ConeGeometry(bodyR * 0.06, bodyR * (o.hornL || 1.4), 5)
            .rotateX(-0.5)
            .rotateZ(s * 0.25)
            .translate(s * bodyR * 0.15, headP[1] + bodyR * 0.8, headP[2]),
          M,
          { noAO: true },
        );
    // tail
    if (o.tail !== false)
      add(
        new THREE.CylinderGeometry(bodyR * 0.05, bodyR * 0.08, L * 0.35, 4)
          .rotateX(0.5)
          .translate(0, H * 0.55, -L * 0.62),
      );
    // eyes (glass)
    for (const s of [-1, 1])
      b.geo(
        "glass_dark",
        new THREE.SphereGeometry(bodyR * 0.07, 5, 4).translate(
          s * bodyR * 0.26,
          headP[1] + bodyR * 0.12,
          headP[2] + bodyR * 0.55,
        ),
        M,
        { noAO: true },
      );
  };
  /** Upright ape (gorilla) mount. */
  D.ape = function (b, x, y, z, ry, s) {
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const k = "hide_dark";
    const add = (g, m) =>
      b.geo(k, g, M.clone().multiply(m), { noAO: true, grime: 0.2 });
    add(
      new THREE.SphereGeometry(0.5, 9, 7),
      P.m4(0, 1.15, 0, 0, 0.35, 0, 1.1, 1.2, 0.8),
    );
    add(
      new THREE.SphereGeometry(0.26, 8, 6),
      P.m4(0, 1.75, 0.22, 0, 0, 0, 1, 1.05, 1),
    );
    add(new THREE.BoxGeometry(0.34, 0.12, 0.1), P.m4(0, 1.82, 0.4));
    for (const sd of [-1, 1]) {
      add(
        new THREE.CylinderGeometry(0.13, 0.1, 1.05, 6),
        P.m4(sd * 0.55, 0.95, 0.2, 0, -0.35, sd * 0.25),
      );
      add(
        new THREE.CylinderGeometry(0.15, 0.12, 0.7, 6),
        P.m4(sd * 0.25, 0.35, -0.1, 0, 0.2, 0),
      );
    }
  };
  /** African elephant (Akeley group). */
  D.elephant = function (b, x, y, z, ry, s, o) {
    o = o || {};
    s = s || 1;
    const M = P.m4(x, y, z, ry, 0, 0, s);
    const k = "hide_grey";
    const add = (g, m, key) =>
      b.geo(key || k, g, M.clone().multiply(m), { noAO: true, grime: 0.25 });
    add(
      new THREE.SphereGeometry(1, 12, 9),
      P.m4(0, 2.35, 0, 0, 0, 0, 1.2, 1.25, 2.1),
    );
    for (const [lx, lz] of [
      [-1, 1],
      [1, 1],
      [-1, -1],
      [1, -1],
    ])
      add(
        new THREE.CylinderGeometry(0.36, 0.33, 2.0, 8).translate(0, 1.0, 0),
        P.m4(lx * 0.62, 0, lz * 1.25, 0, o.charge && lz > 0 ? -0.12 : 0),
      );
    // head, ears, trunk, tusks
    const hy = 2.9 + (o.raise ? 0.35 : 0);
    add(
      new THREE.SphereGeometry(0.75, 10, 8),
      P.m4(0, hy, 2.05, 0, 0.3, 0, 1, 1.05, 0.95),
    );
    for (const sd of [-1, 1])
      add(
        new THREE.SphereGeometry(0.85, 8, 6),
        P.m4(
          sd * 0.8,
          hy - 0.05,
          1.8,
          sd * (o.flare ? 0.9 : 0.4),
          0,
          sd * 0.15,
          1.05,
          1.25,
          0.12,
        ),
      );
    const trunk = [
      [0, hy - 0.2, 2.6],
      [0, hy - 0.9, 2.95],
      [0, hy - 1.6, 3.0],
      [0, hy - (o.raise ? 0.3 : 2.1), o.raise ? 3.5 : 2.85],
    ];
    if (o.raise) {
      trunk[2] = [0, hy + 0.1, 3.3];
    }
    for (const sd of [-1, 1])
      add(
        new THREE.ConeGeometry(0.08, 1.3, 6)
          .rotateX(-2.1)
          .translate(sd * 0.32, hy - 0.8, 2.75),
        new THREE.Matrix4(),
        "bone",
      );
    add(
      new THREE.CylinderGeometry(0.03, 0.06, 1.0, 4)
        .rotateX(0.3)
        .translate(0, 2.0, -2.1),
      new THREE.Matrix4(),
    );
    // trunk: rods through the group matrix
    for (let i = 0; i < trunk.length - 1; i++) {
      const a = new THREE.Vector3().fromArray(trunk[i]).applyMatrix4(M),
        c = new THREE.Vector3().fromArray(trunk[i + 1]).applyMatrix4(M);
      b.rod(k, [a.x, a.y, a.z], [c.x, c.y, c.z], (0.22 - i * 0.05) * s, 7, {
        rTop: (0.18 - i * 0.05) * s,
        noAO: true,
      });
    }
  };
  /** Blue whale (hanging model), length L along +z (snout +z) at local (x,y,z), yaw ry.
   *  Parametric hull: flat U-shaped rostrum, deep chest, slim tail stock; painted hide with throat pleats. */
