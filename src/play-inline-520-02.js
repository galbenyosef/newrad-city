// play-inline-520 02 — three
// Lines 78-457 of readable/play-inline-520.pretty.js (statement-aligned).
  function buildGeometry() {
    const sph = (w, h) => new THREE.SphereGeometry(1, w || 16, h || 12);
    // ---- body (torso, withers, rump, belly, chest, hip points) ----
    const body = G.util.mergeGeometries([
      S(sph(18, 14), [0, 1.05, 0], [0.56, 0.52, 1.02]),
      S(sph(), [0, 1.27, -0.52], [0.46, 0.36, 0.44]), // withers
      S(sph(), [0, 1.12, 0.6], [0.51, 0.46, 0.46]), // rump
      S(sph(), [0, 0.85, 0.02], [0.46, 0.37, 0.72]), // belly
      S(sph(10, 8), [0, 1.16, -0.96], [0.35, 0.35, 0.25]), // chest / neck root
      S(sph(10, 8), [0, 0.86, -0.82], [0.21, 0.21, 0.16]), // brisket
      S(sph(8, 6), [0.36, 1.37, 0.56], [0.1, 0.08, 0.1]), // hip points
      S(sph(8, 6), [-0.36, 1.37, 0.56], [0.1, 0.08, 0.1]),
    ]);
    K.lump(body, 0.03, 3.0, 11);
    paintHide(body, 4.2);

    // ---- leg (hip at origin, hoof at y = -1.0) ----
    const leg = K.merge([
      K.part(
        new THREE.CylinderGeometry(0.16, 0.105, 0.54, 9),
        0x7e5e46,
        [0, -0.25, 0],
        null,
        null,
        0.12,
        5,
      ),
      K.part(new THREE.SphereGeometry(0.11, 8, 6), 0x6e523e, [0, -0.52, 0.015]),
      K.part(
        new THREE.CylinderGeometry(0.092, 0.08, 0.36, 8),
        0x5e4636,
        [0, -0.7, 0],
        null,
        null,
        0.1,
        6,
      ),
      K.part(new THREE.SphereGeometry(0.09, 7, 5), 0x4e3a2e, [0, -0.87, 0]),
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0x3a2a20,
        [0, -0.83, 0.05],
        null,
        [0.075, 0.05, 0.06],
      ), // dewclaw tuft
      K.part(
        new THREE.CylinderGeometry(0.09, 0.108, 0.12, 9),
        0x231d19,
        [0, -0.94, -0.015],
      ),
      K.part(
        new THREE.BoxGeometry(0.02, 0.1, 0.12),
        0x120e0c,
        [0, -0.945, -0.08],
      ), // cloven split
    ]);

    // ---- neck + head (neck base at origin, looking -Z) ----
    const nd = -Math.PI / 2 + 0.55; // neck axis: forward & a little up
    const hornCurve = (sx) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(sx * 0.09, 0.42, -0.47),
        new THREE.Vector3(sx * 0.27, 0.45, -0.46),
        new THREE.Vector3(sx * 0.43, 0.52, -0.53),
        new THREE.Vector3(sx * 0.5, 0.65, -0.64),
      ]);
    const halter = new THREE.TorusGeometry(0.115, 0.013, 5, 14);
    halter.rotateY(Math.PI / 2);
    halter.rotateZ(Math.PI / 2);
    const collar = new THREE.TorusGeometry(0.21, 0.03, 6, 16);
    collar.rotateX(Math.PI / 2 - 0.55);
    const headParts = [
      K.part(
        new THREE.CylinderGeometry(0.17, 0.21, 0.52, 10),
        0x86664c,
        [0, 0.12, -0.22],
        [nd, 0, 0],
        null,
        0.14,
        7,
      ),
      K.part(
        new THREE.SphereGeometry(1, 12, 10),
        0x8a684e,
        [0, 0.29, -0.55],
        [0.45, 0, 0],
        [0.14, 0.15, 0.24],
        0.12,
        8,
      ),
      K.part(
        new THREE.SphereGeometry(1, 10, 8),
        0x5a463e,
        [0, 0.18, -0.75],
        [0.35, 0, 0],
        [0.11, 0.095, 0.12],
        0.08,
        9,
      ), // dark muzzle
      K.part(
        new THREE.SphereGeometry(1, 8, 6),
        0x6a4e3c,
        [0, 0.12, -0.66],
        [0.2, 0, 0],
        [0.08, 0.04, 0.11],
      ), // lower jaw
      K.part(
        new THREE.SphereGeometry(1, 9, 7),
        0x7a5a44,
        [0, 0.0, -0.36],
        [0.3, 0, 0],
        [0.08, 0.13, 0.15],
        0.15,
        12,
      ), // dewlap
      K.part(
        new THREE.SphereGeometry(1, 7, 6),
        0x5e4434,
        [0, 0.43, -0.45],
        null,
        [0.13, 0.045, 0.09],
        0.2,
        14,
      ), // poll
      K.part(
        new THREE.SphereGeometry(1, 6, 4),
        0xc4a898,
        [0.06, 0.36, -0.66],
        [0, 0, 0.6],
        [0.015, 0.07, 0.012],
      ), // old scar across the face
      K.part(
        new THREE.SphereGeometry(0.02, 6, 4),
        0x1a1210,
        [0.04, 0.18, -0.86],
      ),
      K.part(
        new THREE.SphereGeometry(0.02, 6, 4),
        0x1a1210,
        [-0.04, 0.18, -0.86],
      ),
      K.part(
        new THREE.SphereGeometry(0.023, 6, 5),
        0x0c0808,
        [0.11, 0.33, -0.58],
      ),
      K.part(
        new THREE.SphereGeometry(0.023, 6, 5),
        0x0c0808,
        [-0.11, 0.33, -0.58],
      ),
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0x7a5a44,
        [0.18, 0.36, -0.47],
        [0, 0.2, -0.2],
        [0.09, 0.025, 0.05],
      ), // ears
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0x7a5a44,
        [-0.18, 0.36, -0.47],
        [0, -0.2, 0.2],
        [0.09, 0.025, 0.05],
      ),
      K.paint(
        new THREE.TubeGeometry(hornCurve(1), 10, 0.046, 7, false),
        0xd8cba8,
        0.12,
        3,
      ),
      K.paint(
        new THREE.TubeGeometry(hornCurve(-1), 10, 0.046, 7, false),
        0xd8cba8,
        0.12,
        4,
      ),
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0xb0a080,
        [0.09, 0.42, -0.47],
        null,
        [0.065, 0.055, 0.065],
      ), // horn bases
      K.part(
        new THREE.SphereGeometry(1, 7, 5),
        0xb0a080,
        [-0.09, 0.42, -0.47],
        null,
        [0.065, 0.055, 0.065],
      ),
      K.part(
        new THREE.ConeGeometry(0.044, 0.1, 7),
        0x3a342a,
        [0.505, 0.69, -0.665],
        [-0.7, 0, -0.3],
      ), // dark horn tips
      K.part(
        new THREE.ConeGeometry(0.044, 0.1, 7),
        0x3a342a,
        [-0.505, 0.69, -0.665],
        [-0.7, 0, 0.3],
      ),
      K.part(halter, 0x3a2416, [0, 0.19, -0.72], [0.35, 0, 0]), // leather halter
      K.part(new THREE.BoxGeometry(0.3, 0.02, 0.03), 0x3a2416, [0, 0.44, -0.5]), // halter poll strap
      K.part(collar, 0x4a2c18, [0, 0.06, -0.14]), // neck collar
      K.part(
        new THREE.CylinderGeometry(0.035, 0.06, 0.11, 8),
        0xb08a3a,
        [0, -0.17, -0.2],
        null,
        null,
        0.1,
        15,
      ), // brass bell
    ];
    const head = G.util.mergeGeometries(headParts);

    // ---- tail ----
    const tail = K.merge([
      K.part(
        new THREE.CylinderGeometry(0.028, 0.016, 0.62, 6),
        0x6e5240,
        [0, -0.31, 0],
      ),
      K.part(
        new THREE.SphereGeometry(1, 6, 5),
        0x2e221a,
        [0, -0.64, 0],
        null,
        [0.05, 0.11, 0.05],
        0.2,
        2,
      ),
    ]);

    // ---- pack variants (sawbuck pack saddle) ----
    const packs = PACKS.map((pk, vi) => {
      const pp = [];
      const B = (w, h, d, c, pos, rot, n) =>
        pp.push(
          K.part(
            new THREE.BoxGeometry(w, h, d),
            c,
            pos,
            rot,
            null,
            n === undefined ? 0.12 : n,
            vi * 5 + pp.length,
          ),
        );
      B(1.1, 0.05, 1.12, pk.blanket, [0, 1.555, 0.04]);
      for (const sx of [-1, 1]) {
        B(
          0.04,
          0.44,
          1.04,
          new THREE.Color(pk.blanket).multiplyScalar(0.8).getHex(),
          [sx * 0.54, 1.34, 0.04],
        );
        B(0.045, 0.06, 1.05, pk.stripe, [sx * 0.545, 1.2, 0.04], null, 0.05);
        B(0.045, 0.03, 1.05, pk.stripe, [sx * 0.545, 1.45, 0.04], null, 0.05);
        // sawbuck: two crossed wooden bucks, front and back, plus side bars
        for (const z of [-0.36, 0.42])
          B(
            0.06,
            0.46,
            0.07,
            0x8a6a42,
            [sx * 0.1, 1.72, z],
            [0, 0, sx * 0.62],
            0.08,
          );
        B(0.07, 0.07, 0.95, 0x7a5a36, [sx * 0.3, 1.6, 0.03], null, 0.08);
        // crates with slats
        B(0.27, 0.4, 0.5, 0x7a5a3a, [sx * 0.72, 1.27, -0.12]);
        for (const y of [1.13, 1.27, 1.41])
          B(0.285, 0.035, 0.52, 0x5a4028, [sx * 0.72, y, -0.12], null, 0.05);
        B(0.29, 0.42, 0.04, 0x4e3824, [sx * 0.72, 1.27, -0.37], null, 0.05);
        B(0.29, 0.42, 0.04, 0x4e3824, [sx * 0.72, 1.27, 0.13], null, 0.05);
        // saddlebags
        B(0.2, 0.3, 0.3, 0x4a3322, [sx * 0.66, 1.23, 0.5], [0, 0, sx * 0.08]);
        B(
          0.21,
          0.08,
          0.31,
          0x3a2618,
          [sx * 0.665, 1.4, 0.5],
          [0, 0, sx * 0.08],
        );
        // girth straps
        B(
          0.03,
          0.82,
          0.07,
          0x2c2018,
          [sx * 0.5, 1.14, -0.3],
          [0, 0, sx * 0.1],
          0.05,
        );
        B(
          0.03,
          0.82,
          0.07,
          0x2c2018,
          [sx * 0.5, 1.14, 0.36],
          [0, 0, sx * 0.1],
          0.05,
        );
        // breeching strap round the rump
        B(
          0.03,
          0.06,
          0.62,
          0x2c2018,
          [sx * 0.5, 1.02, 0.78],
          [0, sx * 0.35, 0],
          0.05,
        );
      }
      B(0.62, 0.035, 0.07, 0x2c2018, [0, 0.565, -0.3], null, 0.05);
      B(0.62, 0.035, 0.07, 0x2c2018, [0, 0.565, 0.36], null, 0.05);
      B(0.86, 0.07, 0.04, 0x3a2618, [0, 1.06, -1.16], null, 0.05); // breast strap
      // bedroll + straps
      pp.push(
        K.part(
          new THREE.CylinderGeometry(0.13, 0.13, 0.86, 10),
          0x6b6a4e,
          [0, 1.74, 0.62],
          [0, 0, Math.PI / 2],
          null,
          0.15,
          vi,
        ),
      );
      for (const x of [-0.25, 0.25])
        pp.push(
          K.part(
            new THREE.CylinderGeometry(0.137, 0.137, 0.04, 10),
            0x2c2018,
            [x, 1.74, 0.62],
            [0, 0, Math.PI / 2],
          ),
        );
      // tarp bundle between the bucks, pots & jerry can
      B(0.5, 0.18, 0.5, 0x8a7d5c, [0, 1.68, 0.03], [0.05, 0, 0], 0.2);
      pp.push(
        K.part(
          new THREE.CylinderGeometry(0.11, 0.09, 0.14, 9),
          0x6d6d68,
          [0.9, 1.07, 0.3],
          null,
          null,
          0.2,
          2,
        ),
      );
      pp.push(
        K.part(
          new THREE.CylinderGeometry(0.08, 0.08, 0.1, 9),
          0x7a4a30,
          [0.9, 1.07, 0.08],
          null,
          null,
          0.25,
          3,
        ),
      );
      B(0.1, 0.3, 0.22, 0x55622e, [-0.9, 1.21, -0.14], null, 0.1);
      B(0.04, 0.05, 0.06, 0x2a2a2a, [-0.9, 1.39, -0.2], null, 0);
      const pg = G.util.mergeGeometries(pp);
      pg.scale(1.08, 1, 1);
      return pg;
    });
    GEO = { body, leg, head, tail, packs };
  }

  // ------------------------------------------------------------------
  // Model instance
  // ------------------------------------------------------------------
