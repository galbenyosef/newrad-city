// play-inline-357 07 — opts
// Lines 1559-1715 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.coffers = function (b, key, x0, z0, x1, z1, y, cell, opts) {
    opts = opts || {};
    const bw = opts.beam || 0.35,
      depth = opts.depth || 0.5;
    b.boxMM(opts.panel || key, x0, y, z0, x1, y + 0.15, z1, {
      segLen: 8,
      noAO: true,
    });
    const nx = Math.max(1, Math.round((x1 - x0) / cell)),
      nz = Math.max(1, Math.round((z1 - z0) / cell));
    for (let i = 0; i <= nx; i++) {
      const x = x0 + ((x1 - x0) * i) / nx;
      b.boxMM(key, x - bw / 2, y - depth, z0, x + bw / 2, y, z1, {
        seg: false,
        noAO: true,
        grime: 0.2,
      });
    }
    for (let j = 0; j <= nz; j++) {
      const z = z0 + ((z1 - z0) * j) / nz;
      b.boxMM(key, x0, y - depth, z - bw / 2, x1, y, z + bw / 2, {
        seg: false,
        noAO: true,
        grime: 0.2,
      });
    }
    if (opts.rosette)
      for (let i = 0; i < nx; i++)
        for (let j = 0; j < nz; j++) {
          const cx = x0 + ((x1 - x0) * (i + 0.5)) / nx,
            cz = z0 + ((z1 - z0) * (j + 0.5)) / nz;
          b.cyl(opts.rosette, cx, y - 0.12, cz, 0.18, 0.12, 0.12, 8, {
            hSeg: 1,
            noAO: true,
            grime: 0.1,
          });
        }
  };
  /** 1900s Singer treadle sewing machine on its iron stand (black enamel, gilt decals). */
  PF.sewingMachine = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry, 0, opts.tipped ? 1.3 : 0);
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.4,
      });
    if (!opts.noStand) {
      add("oak_ws", new THREE.BoxGeometry(1.0, 0.05, 0.45), PF.m4(0, 0.76, 0));
      for (const sx of [-0.42, 0.42]) {
        add(
          "iron",
          new THREE.BoxGeometry(0.05, 0.74, 0.38),
          PF.m4(sx, 0.37, 0),
        );
        const wg = new THREE.TorusGeometry(0.16, 0.02, 4, 12);
        wg.rotateY(HP);
        if (sx > 0) add("iron", wg, PF.m4(sx - 0.06, 0.34, 0));
      }
      add(
        "iron",
        new THREE.BoxGeometry(0.8, 0.04, 0.3),
        PF.m4(0, 0.1, 0.02, 0, 0.2),
      ); // treadle
    }
    const top = opts.noStand ? 0 : 0.78;
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.5, 0.05, 0.2),
      PF.m4(0, top + 0.025, 0),
    );
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.1, 0.24, 0.12),
      PF.m4(0.2, top + 0.17, 0),
    ); // pillar
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.42, 0.09, 0.11),
      PF.m4(0.02, top + 0.3, 0),
    ); // arm
    add(
      "black_enamel",
      new THREE.BoxGeometry(0.08, 0.16, 0.09),
      PF.m4(-0.18, top + 0.2, 0),
    ); // head
    add(
      "chrome",
      new THREE.CylinderGeometry(0.008, 0.008, 0.12, 4),
      PF.m4(-0.18, top + 0.07, 0.02),
    );
    const hw = new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12);
    hw.rotateZ(HP);
    add("chrome", hw, PF.m4(0.27, top + 0.3, 0)); // hand wheel
    add(
      "gold_leaf",
      new THREE.BoxGeometry(0.2, 0.03, 0.112),
      PF.m4(0.02, top + 0.3, 0),
    ); // gilt decal band
  };
  /** Dressmaker's form (dress form) on a tripod stand; raiders dress some in gore and scrap. */
  PF.dressForm = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry, opts.tilt || 0, opts.lean || 0);
    const add = (k, g, m) =>
      b.add(k, g, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * TAU;
      add(
        "iron",
        new THREE.BoxGeometry(0.04, 0.03, 0.36),
        PF.m4(Math.cos(a) * 0.15, 0.02, Math.sin(a) * 0.15, -a + HP),
      );
    }
    add(
      "oak_ws",
      new THREE.CylinderGeometry(0.02, 0.025, 0.9, 5),
      PF.m4(0, 0.45, 0),
    );
    const torso = new THREE.LatheGeometry(
      [
        [0.001, 0],
        [0.16, 0.02],
        [0.2, 0.18],
        [0.15, 0.38],
        [0.2, 0.55],
        [0.17, 0.68],
        [0.07, 0.74],
        [0.05, 0.8],
        [0.001, 0.82],
      ].map((p) => new THREE.Vector2(p[0], p[1])),
      10,
    );
    torso.scale(1.15, 1, 0.8);
    add(opts.gore ? "gore" : "dressform", torso, PF.m4(0, 0.9, 0));
    if (opts.gore)
      add(
        "rust",
        new THREE.BoxGeometry(0.44, 0.24, 0.3),
        PF.m4(0, 1.3, 0.02, 0, 0, 0.2),
      ); // scrap pauldron
    if (opts.skull)
      add("bone", new THREE.SphereGeometry(0.1, 7, 5), PF.m4(0, 1.8, 0));
  };
  /**
   * Seated allegorical figure (Four Continents): throne block, robed seated body, head, arm gesture
   * and one attribute per continent. (x,y,z) = pedestal top centre, faces ry (+Z local = forward).
   */
  /**
   * Daniel Chester French-style seated allegorical figure (the Custom House FOUR CONTINENTS): a heavily draped
   * woman enthroned, legs and knees modelled under a robe that spills in folds over the throne front, a mantle
   * down the back, shaped torso/shoulders/neck/head with hair, and per-kind attributes & companions.
   * Local frame: faces +z, seat top at y 0.95, figure ~2.7 m tall at s = 1.
   */
