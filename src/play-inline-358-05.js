// play-inline-358 05 — add
// Lines 930-1225 of readable/play-inline-358.pretty.js (statement-aligned).
  PF.standingFigure = function (b, key, x, y, z, ry, variant, s, opts) {
    opts = opts || {};
    s = s || 1;
    const M = PF.m4(x, y, z, ry, 0, 0, s, s, s);
    const gr = opts.grime === undefined ? 0.7 : opts.grime;
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: gr,
      });
    const lathe = (prof, seg) =>
      new THREE.LatheGeometry(
        prof.map((p) => new THREE.Vector2(Math.max(0.001, p[0]), p[1])),
        Math.min(seg || 9, 10),
      );
    const limb = (a, c, r0) => {
      const A = V3(a[0], a[1], a[2]),
        C = V3(c[0], c[1], c[2]),
        d = C.clone().sub(A),
        len = d.length();
      const g = new THREE.CapsuleGeometry(r0, Math.max(0.01, len), 1, 6);
      g.translate(0, len / 2, 0);
      add(
        g,
        new THREE.Matrix4().compose(
          A,
          new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), d.normalize()),
          V3(1, 1, 1),
        ),
      );
    };
    const hip = (variant % 2 ? -1 : 1) * 0.07; // contrapposto
    // plinth
    add(new THREE.BoxGeometry(0.9, 0.18, 0.75), PF.m4(0, 0.09, 0));
    // robe: long chiton with deep vertical folds, weight-leg knee pushing through
    const robe = lathe(
      [
        [0.001, 0.18],
        [0.44, 0.18],
        [0.4, 0.5],
        [0.33, 0.95],
        [0.29, 1.3],
        [0.26, 1.42],
        [0.001, 1.44],
      ],
      16,
    );
    PF.deform(robe, (v) => {
      const a = Math.atan2(v.z, v.x);
      const t = Math.max(0, (1.4 - v.y) / 1.2);
      const f = 1 + 0.12 * t * Math.sin(a * 9 + v.y * 2.2);
      v.x = v.x * f + hip * (v.y - 0.18);
      v.z *= f * 0.78;
      if (v.z > 0.1 && v.y > 0.6 && v.y < 1.0 && v.x * Math.sign(hip) > 0)
        v.z += 0.05;
    });
    add(robe, PF.m4(0, 0, 0));
    // torso + himation (mantle) slung across the body
    const torso = lathe(
      [
        [0.001, 0],
        [0.27, 0],
        [0.24, 0.2],
        [0.27, 0.42],
        [0.28, 0.55],
        [0.22, 0.66],
        [0.08, 0.72],
        [0.001, 0.73],
      ],
      12,
    );
    torso.scale(1.15, 1, 0.75);
    add(torso, PF.m4(hip * 1.25, 1.36, 0, 0, 0, -hip * 0.6));
    const mantle = new THREE.CylinderGeometry(
      0.33,
      0.4,
      0.62,
      8,
      1,
      true,
      -HP * 0.2,
      PI * 1.25,
    );
    PF.deform(mantle, (v) => {
      const a = Math.atan2(v.z, v.x);
      const f = 1 + 0.07 * Math.sin(a * 6 + v.y * 4);
      v.x *= f;
      v.z *= f * 0.8;
    });
    add(mantle, PF.m4(hip, 1.25, 0.0, 0.5, 0, 0.3));
    for (const sx of [-1, 1])
      add(
        new THREE.SphereGeometry(0.12, 6, 4),
        PF.m4(hip * 1.3 + sx * 0.27, 1.95, 0, 0, 0, 0, 1, 0.85, 1),
      );
    // head
    const hx = hip * 1.4,
      hy = 2.2;
    if (!opts.broken) {
      add(
        new THREE.CylinderGeometry(0.06, 0.075, 0.16, 7),
        PF.m4(hx, 2.02, 0.01),
      );
      add(
        new THREE.SphereGeometry(0.125, 8, 6),
        PF.m4(hx, hy, 0.02, 0, 0.08, 0, 0.86, 1.08, 1),
      );
      add(new THREE.BoxGeometry(0.07, 0.05, 0.05), PF.m4(hx, hy - 0.01, 0.13));
      if (variant === 3)
        add(
          lathe(
            [
              [0.14, 0],
              [0.15, 0.12],
              [0.11, 0.22],
              [0.02, 0.3],
            ],
            10,
          ),
          PF.m4(hx, hy - 0.02, 0),
        ); // helmet
      else {
        add(
          new THREE.SphereGeometry(0.13, 7, 4, 0, TAU, 0, PI * 0.55),
          PF.m4(hx, hy + 0.02, -0.02, 0, -0.3, 0, 1, 1, 1.05),
        );
        add(new THREE.SphereGeometry(0.07, 5, 4), PF.m4(hx, hy - 0.02, -0.14));
      }
    } else {
      add(
        new THREE.CylinderGeometry(0.05, 0.075, 0.08, 7),
        PF.m4(hx, 2.0, 0.01, 0, 0.3, 0.2),
      ); // snapped neck
    }
    const sh = (sx) => [hip * 1.3 + sx * 0.3, 1.93, 0];
    // per-variant arms and attributes
    if (variant === 0) {
      // Commerce by sea: the steering oar
      limb(sh(1), [0.42, 1.55, 0.12], 0.07);
      limb([0.42, 1.55, 0.12], [0.36, 1.3, 0.3], 0.06);
      limb(sh(-1), [-0.4, 1.5, 0.05], 0.07);
      limb([-0.4, 1.5, 0.05], [-0.36, 1.2, 0.12], 0.06);
      add(
        new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6),
        PF.m4(0.38, 1.25, 0.32, 0, 0.1, 0.12),
      );
      add(
        new THREE.BoxGeometry(0.22, 0.6, 0.05),
        PF.m4(0.28, 0.35, 0.36, 0, 0.1, 0.12),
      );
    } else if (variant === 1) {
      // Mercury's caduceus
      limb(sh(1), [0.4, 1.95, 0.1], 0.07);
      limb([0.4, 1.95, 0.1], [0.42, 2.35, 0.14], 0.06);
      add(
        new THREE.CylinderGeometry(0.025, 0.025, 1.1, 6),
        PF.m4(0.43, 2.4, 0.15),
      );
      for (let k = 0; k < 3; k++)
        add(
          new THREE.TorusGeometry(0.06, 0.018, 4, 8),
          PF.m4(0.43, 2.2 + k * 0.14, 0.15, k * 1.2, HP),
        );
      for (const sx of [-1, 1])
        add(
          new THREE.BoxGeometry(0.14, 0.03, 0.06),
          PF.m4(0.43 + sx * 0.08, 2.92, 0.15, 0, 0, sx * 0.5),
        );
      limb(sh(-1), [-0.36, 1.45, 0.02], 0.07);
      limb([-0.36, 1.45, 0.02], [-0.3, 1.18, 0.1], 0.06);
    } else if (variant === 2) {
      // Abundance: the cornucopia
      limb(sh(-1), [-0.4, 1.55, 0.12], 0.07);
      limb([-0.4, 1.55, 0.12], [-0.12, 1.5, 0.3], 0.06);
      const horn = new THREE.ConeGeometry(0.2, 0.9, 10, 4, true);
      PF.deform(horn, (v) => {
        const t = (v.y + 0.45) / 0.9;
        v.x += Math.sin(t * PI) * 0.18;
      });
      add(horn, PF.m4(-0.28, 1.72, 0.3, 0, -0.5, 0.9));
      for (let k = 0; k < 5; k++)
        add(
          new THREE.SphereGeometry(0.07, 6, 5),
          PF.m4(
            -0.02 + (k % 3) * 0.08,
            2.0 + (k > 2 ? 0.08 : 0),
            0.36 + (k % 2) * 0.05,
          ),
        );
      limb(sh(1), [0.38, 1.5, 0.0], 0.07);
      limb([0.38, 1.5, 0.0], [0.34, 1.2, 0.1], 0.06);
    } else if (variant === 3) {
      // Defence: spear and round shield
      limb(sh(1), [0.42, 1.85, 0.1], 0.07);
      limb([0.42, 1.85, 0.1], [0.44, 2.2, 0.14], 0.06);
      add(
        new THREE.CylinderGeometry(0.025, 0.025, 2.8, 6),
        PF.m4(0.45, 1.6, 0.15),
      );
      add(new THREE.ConeGeometry(0.05, 0.22, 5), PF.m4(0.45, 3.1, 0.15));
      limb(sh(-1), [-0.38, 1.55, 0.1], 0.07);
      limb([-0.38, 1.55, 0.1], [-0.32, 1.3, 0.3], 0.06);
      add(
        new THREE.CylinderGeometry(0.4, 0.4, 0.06, 16),
        PF.m4(-0.42, 1.2, 0.3, 0, HP, 0.2),
      );
    } else if (variant === 4) {
      // the Port: an anchor at her side
      limb(sh(1), [0.4, 1.5, 0.05], 0.07);
      limb([0.4, 1.5, 0.05], [0.44, 1.2, 0.18], 0.06);
      add(
        new THREE.CylinderGeometry(0.035, 0.035, 1.2, 6),
        PF.m4(0.5, 0.82, 0.22),
      );
      add(
        new THREE.TorusGeometry(0.28, 0.04, 5, 10, PI),
        PF.m4(0.5, 0.52, 0.22, 0, 0, PI),
      );
      add(new THREE.BoxGeometry(0.5, 0.05, 0.05), PF.m4(0.5, 1.28, 0.22));
      limb(sh(-1), [-0.3, 1.55, 0.15], 0.07);
      limb([-0.3, 1.55, 0.15], [0.0, 1.62, 0.3], 0.06);
    } else {
      // Learning: book and lamp
      limb(sh(1), [0.4, 1.7, 0.12], 0.07);
      limb([0.4, 1.7, 0.12], [0.36, 2.05, 0.24], 0.06);
      add(
        lathe(
          [
            [0.001, 0],
            [0.06, 0.03],
            [0.1, 0.1],
            [0.04, 0.14],
            [0.02, 0.22],
          ],
          8,
        ),
        PF.m4(0.36, 2.08, 0.26),
      );
      limb(sh(-1), [-0.36, 1.5, 0.12], 0.07);
      limb([-0.36, 1.5, 0.12], [-0.12, 1.42, 0.3], 0.06);
      add(
        new THREE.BoxGeometry(0.3, 0.06, 0.24),
        PF.m4(-0.12, 1.45, 0.34, 0, 0.3, 0.2),
      );
    }
  };

  // -------------------------------------------------------------------
  // Carved skull (statue attribute / ossuary): cranium, brow, sockets, nose, jaw, teeth row
  // -------------------------------------------------------------------
  PF.skull = function (b, key, sockKey, x, y, z, s, ry, rx, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry || 0, rx || 0, 0, s, s, s);
    const add = (g, m, k) =>
      b.add(k || key, g, {
        m: new THREE.Matrix4().multiplyMatrices(
          opts.M ? new THREE.Matrix4().multiplyMatrices(opts.M, M) : M,
          m,
        ),
        grime: opts.grime === undefined ? 0.5 : opts.grime,
      });
    add(
      new THREE.SphereGeometry(0.1, 8, 6),
      PF.m4(0, 0.1, -0.015, 0, 0, 0, 0.92, 0.9, 1.12),
    ); // cranium
    add(new THREE.BoxGeometry(0.15, 0.035, 0.05), PF.m4(0, 0.1, 0.075)); // brow ridge
    add(new THREE.BoxGeometry(0.13, 0.08, 0.09), PF.m4(0, 0.04, 0.05)); // maxilla / cheekbones
    for (const sx of [-1, 1])
      add(
        new THREE.SphereGeometry(0.03, 5, 4),
        PF.m4(sx * 0.037, 0.075, 0.093, 0, 0, 0, 1, 0.9, 0.5),
        sockKey,
      ); // orbits
    add(
      new THREE.ConeGeometry(0.016, 0.03, 3),
      PF.m4(0, 0.035, 0.098, 0, HP * 0.1, PI),
      sockKey,
    ); // nasal aperture
    add(
      new THREE.BoxGeometry(0.1, 0.035, 0.07),
      PF.m4(0, -0.005, 0.045, 0, -0.15),
    ); // jaw
    add(
      new THREE.BoxGeometry(0.085, 0.012, 0.012),
      PF.m4(0, 0.012, 0.092),
      sockKey,
    ); // teeth line
  };

  // -------------------------------------------------------------------
  // Office dressing
  // -------------------------------------------------------------------
  /**
   * Desk-top clutter centred at (x, y = desk top, z), rotated ry (front of desk toward +z local):
   * blotter, typewriter or ledger, telephone, banker's lamp (optionally lit), ashtray, pen stand, papers.
   */
