// play-inline-357 08 — add
// Lines 1716-2095 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.seatedFigure = function (b, key, x, y, z, ry, kind, s, opts) {
    s = s || 1;
    opts = opts || {};
    const M = PF.m4(x, y, z, ry, 0, 0, s, s, s);
    const gr = opts.grime === undefined ? 0.55 : opts.grime;
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: gr,
      });
    const lathe = (prof, seg) =>
      new THREE.LatheGeometry(
        prof.map((p) => new THREE.Vector2(Math.max(0.001, p[0]), p[1])),
        seg || 14,
      );
    /** capsule limb from a to c (local), radius r0 */
    const limb = (a, c, r0) => {
      const A = V3(a[0], a[1], a[2]),
        C = V3(c[0], c[1], c[2]),
        d = C.clone().sub(A),
        len = d.length();
      const g = new THREE.CapsuleGeometry(r0, Math.max(0.01, len), 3, 8);
      g.translate(0, len / 2, 0);
      const q = new THREE.Quaternion().setFromUnitVectors(
        V3(0, 1, 0),
        d.normalize(),
      );
      add(g, new THREE.Matrix4().compose(A, q, V3(1, 1, 1)));
    };
    const folds = (g, n, amp, y0, y1) =>
      PF.deform(g, (v) => {
        const a = Math.atan2(v.z, v.x),
          t = Math.min(1, Math.max(0, (y1 - v.y) / (y1 - y0)));
        const f = 1 + amp * t * Math.sin(a * n + v.y * 1.7);
        v.x *= f;
        v.z *= f;
      });
    // --- the throne: stepped block with a moulded seat, carved side panels and a high back ---
    add(new THREE.BoxGeometry(1.7, 0.2, 1.55), PF.m4(0, 0.1, -0.2));
    add(new THREE.BoxGeometry(1.5, 0.75, 1.3), PF.m4(0, 0.575, -0.25));
    add(new THREE.BoxGeometry(1.62, 0.12, 1.42), PF.m4(0, 0.97, -0.25));
    for (const sx of [-1, 1]) {
      add(
        new THREE.BoxGeometry(0.06, 0.5, 0.95),
        PF.m4(sx * 0.77, 0.55, -0.25),
      ); // side panel
      add(new THREE.BoxGeometry(0.16, 0.5, 0.16), PF.m4(sx * 0.72, 1.25, 0.28)); // arm-rest post
      add(new THREE.BoxGeometry(0.2, 0.1, 1.0), PF.m4(sx * 0.72, 1.5, -0.2)); // arm-rest
      add(new THREE.SphereGeometry(0.11, 8, 6), PF.m4(sx * 0.72, 1.56, 0.32)); // scroll end
    }
    add(new THREE.BoxGeometry(1.4, 1.35, 0.18), PF.m4(0, 1.62, -0.86)); // high back
    add(new THREE.BoxGeometry(1.52, 0.14, 0.26), PF.m4(0, 2.33, -0.86));
    // --- legs under the drapery: thighs forward, knees, shins down to sandalled feet ---
    const kx = kind === "africa" ? 0.28 : 0.24;
    for (const sx of [-1, 1]) {
      limb([sx * 0.2, 1.12, -0.35], [sx * kx, 1.16, 0.42], 0.2);
      limb(
        [sx * kx, 1.12, 0.46],
        [
          sx * (kx + 0.02),
          0.2,
          0.62 + (sx > 0 && kind === "europe" ? 0.12 : 0),
        ],
        0.13,
      );
      add(
        new THREE.BoxGeometry(0.16, 0.1, 0.32),
        PF.m4(sx * (kx + 0.02), 0.07, 0.74),
      ); // foot
    }
    // --- robe: lap drape over the knees spilling in vertical folds to the plinth, and the skirt at the sides ---
    const skirt = lathe(
      [
        [0.001, 1.36],
        [0.4, 1.33],
        [0.56, 1.2],
        [0.58, 0.95],
        [0.6, 0.6],
        [0.66, 0.25],
        [0.74, 0.04],
        [0.001, 0],
      ].reverse(),
      20,
    );
    folds(skirt, 9, 0.09, 0, 1.3);
    skirt.scale(1.02, 1, 0.62);
    add(skirt, PF.m4(0, 0, 0.36));
    const lap = new THREE.CapsuleGeometry(0.34, 0.8, 3, 10);
    lap.rotateX(HP);
    lap.scale(1.35, 0.55, 1);
    add(lap, PF.m4(0, 1.2, 0.02));
    // --- torso: hips, waist, bust, shoulders; a mantle down the back and over one shoulder ---
    const torso = lathe(
      [
        [0.001, 0],
        [0.42, 0],
        [0.4, 0.18],
        [0.3, 0.42],
        [0.34, 0.62],
        [0.36, 0.78],
        [0.3, 0.92],
        [0.12, 1.0],
        [0.001, 1.02],
      ],
      16,
    );
    torso.scale(1.18, 1, 0.78);
    const lean =
      kind === "asia"
        ? 0.12
        : kind === "africa"
          ? 0.2
          : kind === "america"
            ? -0.06
            : 0;
    add(torso, PF.m4(0, 1.15, -0.3, 0, lean));
    for (const sx of [-1, 1])
      add(
        new THREE.SphereGeometry(0.16, 10, 8),
        PF.m4(sx * 0.36, 2.02, -0.3 + lean * 0.9, 0, 0, 0, 1, 0.85, 1),
      ); // shoulders
    const mantle = lathe(
      [
        [0.001, 1.25],
        [0.34, 1.18],
        [0.48, 0.8],
        [0.58, 0.35],
        [0.66, 0.02],
        [0.001, 0],
      ].reverse(),
      16,
    );
    folds(mantle, 7, 0.08, 0, 1.2);
    mantle.scale(1.15, 1, 0.5);
    add(mantle, PF.m4(0, 0.95, -0.62, 0, 0.05));
    // neck, head, hair
    const hy = 2.28,
      hz = -0.3 + lean * 1.1;
    const tilt =
      kind === "asia"
        ? 0.25
        : kind === "africa"
          ? 0.45
          : kind === "america"
            ? -0.12
            : 0.05;
    if (opts.broken) {
      // head lost (shrapnel): a snapped neck stump; the head lies on the plinth at her feet
      add(
        new THREE.CylinderGeometry(0.07, 0.09, 0.1, 8),
        PF.m4(0, hy - 0.24, hz, 0, 0.35, 0.2),
      );
      add(
        new THREE.SphereGeometry(0.155, 12, 10),
        PF.m4(0.42, 0.17, 0.95, 0.6, 1.2, 0.4, 0.88, 1.08, 1),
      );
      add(
        new THREE.SphereGeometry(0.16, 10, 8, 0, TAU, 0, PI * 0.55),
        PF.m4(0.42, 0.19, 0.95, 0.6, 1.2 - 0.3, 0.4, 0.95, 1, 1.05),
      );
    } else {
      add(
        new THREE.CylinderGeometry(0.075, 0.09, 0.2, 8),
        PF.m4(0, hy - 0.2, hz),
      );
      add(
        new THREE.SphereGeometry(0.155, 12, 10),
        PF.m4(
          0,
          hy,
          hz + 0.02,
          0,
          tilt,
          kind === "africa" ? 0.35 : 0,
          0.88,
          1.08,
          1,
        ),
      );
      add(
        new THREE.BoxGeometry(0.1, 0.06, 0.05),
        PF.m4(0, hy - 0.02, hz + 0.16, 0, tilt),
      ); // nose / brow line
      add(
        new THREE.SphereGeometry(0.16, 10, 8, 0, TAU, 0, PI * 0.55),
        PF.m4(0, hy + 0.03, hz - 0.03, 0, tilt - 0.3, 0, 0.95, 1, 1.05),
      ); // hair cap
      add(
        new THREE.SphereGeometry(0.08, 8, 6),
        PF.m4(0, hy + 0.02, hz - 0.17, 0, tilt),
      ); // chignon
    }
    const sh = (sx) => [sx * 0.38, 2.0, -0.3 + lean * 0.9];
    // --- per-kind arms, attributes and companions ---
    if (kind === "america") {
      // alert and forward-looking: the torch of Liberty raised high, maize on the lap, the eagle behind her
      limb(sh(1), [0.52, 2.35, -0.05], 0.1);
      limb([0.52, 2.35, -0.05], [0.56, 2.85, 0.02], 0.085);
      add(
        new THREE.CylinderGeometry(0.05, 0.035, 0.6, 8),
        PF.m4(0.56, 2.95, 0.03),
      );
      add(
        lathe(
          [
            [0.001, 0],
            [0.1, 0.02],
            [0.13, 0.12],
            [0.07, 0.3],
            [0.001, 0.42],
          ],
          8,
        ),
        PF.m4(0.56, 3.25, 0.03),
      ); // flame (stone)
      limb(sh(-1), [-0.45, 1.55, -0.05], 0.1);
      limb([-0.45, 1.55, -0.05], [-0.18, 1.42, 0.38], 0.085);
      for (let k = 0; k < 5; k++)
        add(
          new THREE.CylinderGeometry(0.03, 0.05, 0.62, 6),
          PF.m4(-0.1 + k * 0.05, 1.45, 0.3, k * 0.4, HP * 0.9, 0.15 - k * 0.07),
        ); // maize sheaf
      // the eagle perched on the throne back, wings half-spread
      add(
        new THREE.SphereGeometry(0.2, 10, 8),
        PF.m4(-0.5, 2.6, -0.8, 0, 0.3, 0, 0.8, 1.2, 0.9),
      );
      add(new THREE.SphereGeometry(0.1, 8, 6), PF.m4(-0.5, 2.88, -0.68));
      add(
        new THREE.ConeGeometry(0.04, 0.12, 5),
        PF.m4(-0.5, 2.86, -0.58, 0, HP),
      );
      for (const sx of [-1, 1]) {
        const w = new THREE.BoxGeometry(0.62, 0.06, 0.34);
        w.translate(sx * 0.31, 0, 0);
        add(w, PF.m4(-0.5 + sx * 0.08, 2.7, -0.82, 0, 0.1, sx * 0.55));
      }
    } else if (kind === "asia") {
      // meditative, eyes lowered, hands folded around a Buddha idol on her lap; the lotus crown; the throne on skulls
      limb(sh(1), [0.3, 1.6, 0.05], 0.1);
      limb([0.3, 1.6, 0.05], [0.08, 1.45, 0.34], 0.085);
      limb(sh(-1), [-0.3, 1.6, 0.05], 0.1);
      limb([-0.3, 1.6, 0.05], [-0.08, 1.45, 0.34], 0.085);
      add(
        new THREE.SphereGeometry(0.11, 8, 6),
        PF.m4(0, 1.5, 0.38, 0, 0, 0, 1.1, 0.8, 1),
      );
      add(new THREE.SphereGeometry(0.07, 8, 6), PF.m4(0, 1.64, 0.38));
      add(new THREE.SphereGeometry(0.035, 6, 4), PF.m4(0, 1.73, 0.38));
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * TAU;
        add(
          new THREE.ConeGeometry(0.06, 0.18, 4),
          PF.m4(
            Math.cos(a) * 0.1,
            hy + 0.2,
            hz + Math.sin(a) * 0.1,
            0,
            Math.sin(a) * 0.3,
            -Math.cos(a) * 0.3,
          ),
        );
      }
      // the heap of skulls under her feet: carved crania with orbits, nasal aperture, jaw and teeth
      for (let k = 0; k < 5; k++)
        PF.skull(
          b,
          key,
          opts.sockKey || "granite_dark",
          -0.56 + k * 0.28,
          0.02 + (k % 2) * 0.03,
          0.97,
          1.25,
          (k - 2) * 0.35,
          (k % 2) * -0.2,
          { M, grime: gr },
        );
      for (let k = 0; k < 2; k++)
        PF.skull(
          b,
          key,
          opts.sockKey || "granite_dark",
          -0.42 + k * 0.56,
          0.2,
          0.86,
          1.1,
          k ? -0.4 : 0.4,
          0.1,
          { M, grime: gr },
        );
    } else if (kind === "europe") {
      // regal, crowned, the right hand on a globe, the left on a book of law; the prow of a ship beside her
      limb(sh(1), [0.55, 1.6, 0.0], 0.1);
      limb([0.55, 1.6, 0.0], [0.74, 1.35, 0.3], 0.085);
      add(new THREE.SphereGeometry(0.3, 14, 10), PF.m4(0.82, 1.02, 0.34));
      add(
        new THREE.TorusGeometry(0.31, 0.015, 4, 20),
        PF.m4(0.82, 1.02, 0.34, 0.4, 0.3),
      );
      add(
        new THREE.TorusGeometry(0.31, 0.015, 4, 20),
        PF.m4(0.82, 1.02, 0.34, 0, HP),
      );
      limb(sh(-1), [-0.48, 1.62, 0.05], 0.1);
      limb([-0.48, 1.62, 0.05], [-0.28, 1.45, 0.34], 0.085);
      add(
        new THREE.BoxGeometry(0.34, 0.08, 0.44),
        PF.m4(-0.3, 1.46, 0.36, 0.2, 0.2),
      );
      if (!opts.broken) {
        add(
          lathe(
            [
              [0.18, 0],
              [0.19, 0.08],
              [0.17, 0.14],
            ],
            12,
          ),
          PF.m4(0, hy + 0.12, hz),
        );
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * TAU;
          add(
            new THREE.ConeGeometry(0.035, 0.12, 4),
            PF.m4(Math.cos(a) * 0.17, hy + 0.3, hz + Math.sin(a) * 0.17),
          );
        }
      }
      const prow = new THREE.Shape();
      prow.moveTo(0, 0);
      prow.quadraticCurveTo(0.9, 0.2, 1.2, 1.4);
      prow.lineTo(0.95, 1.45);
      prow.quadraticCurveTo(0.5, 0.5, 0, 0.35);
      prow.closePath();
      const pg = new THREE.ExtrudeGeometry(prow, {
        depth: 0.28,
        bevelEnabled: false,
      });
      pg.translate(0, 0, -0.14);
      add(pg, PF.m4(-0.95, 0.2, -0.45, -HP));
    } else {
      // Africa: asleep, her head resting on her arm across the head of a sphinx; a lion crouched at her side
      limb(sh(-1), [-0.62, 1.9, -0.05], 0.1);
      limb([-0.62, 1.9, -0.05], [-0.2, 2.12, -0.12], 0.085);
      limb(sh(1), [0.42, 1.55, 0.05], 0.1);
      limb([0.42, 1.55, 0.05], [0.3, 1.3, 0.42], 0.085);
      // sphinx head (nemes headdress) on a block at her left
      add(new THREE.BoxGeometry(0.5, 0.6, 0.6), PF.m4(-0.85, 1.2, -0.25));
      add(
        new THREE.SphereGeometry(0.2, 10, 8),
        PF.m4(-0.85, 1.72, -0.18, 0, 0, 0, 0.9, 1.1, 0.9),
      );
      const nemes = new THREE.CylinderGeometry(0.12, 0.34, 0.5, 4, 1, true);
      nemes.rotateY(PI / 4);
      add(nemes, PF.m4(-0.85, 1.72, -0.24));
      // the lion: body, haunch, maned head, forepaws
      const body = new THREE.CapsuleGeometry(0.26, 0.7, 3, 10);
      body.rotateX(HP);
      add(body, PF.m4(1.0, 0.36, -0.05));
      add(
        new THREE.SphereGeometry(0.28, 10, 8),
        PF.m4(1.0, 0.42, -0.5, 0, 0, 0, 1, 1, 1.1),
      );
      add(
        new THREE.SphereGeometry(0.3, 12, 9),
        PF.m4(1.0, 0.58, 0.45, 0, 0, 0, 1.05, 1, 0.85),
      ); // mane
      add(
        new THREE.SphereGeometry(0.17, 10, 8),
        PF.m4(1.0, 0.56, 0.66, 0, 0, 0, 0.9, 0.9, 1.1),
      ); // muzzle
      for (const sx of [-1, 1])
        add(
          new THREE.CapsuleGeometry(0.07, 0.3, 2, 6),
          PF.m4(1.0 + sx * 0.14, 0.12, 0.6, 0, HP),
        );
    }
  };
  /** Convoy wagon: plank bed on four spoked wheels, hoop-and-canvas cover, tongue, crates. */
