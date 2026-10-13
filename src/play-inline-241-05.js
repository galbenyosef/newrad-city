// play-inline-241 05 — opts
// Lines 902-1134 of readable/play-inline-241.pretty.js (statement-aligned).
  PR.spiral = function (
    b,
    key,
    cx,
    cz,
    y0,
    rIn,
    rOut,
    a0,
    turns,
    rise,
    perTurn,
    opts,
  ) {
    opts = opts || {};
    const dir = opts.dir || 1;
    const n = Math.round(turns * perTurn),
      da = (TAU / perTurn) * dir,
      dy = rise / perTurn,
      th = opts.thick || 0.16;
    const rm = (rIn + rOut) / 2;
    for (let i = 0; i < n; i++) {
      const a = a0 + da * (i + 0.5),
        top = y0 + dy * (i + 1);
      if (opts.noVisual) {
        // colliders only (the caller builds its own treads)
        const arc = Math.abs(da) * rOut + 0.1;
        PR.col(
          cx + Math.cos(a) * rm,
          cz + Math.sin(a) * rm,
          rOut - rIn,
          arc,
          top - 0.35,
          top,
          -a,
          { surface: opts.surface || "concrete" },
        );
        if (opts.rail && !opts.noRailCol) {
          const rx = cx + Math.cos(a) * (rIn + 0.08),
            rz = cz + Math.sin(a) * (rIn + 0.08);
          PR.col(
            rx,
            rz,
            0.1,
            Math.abs(da) * rIn + 0.1,
            top - 0.2,
            top + (opts.railH || 1.0),
            -a,
            { walkable: false, surface: "metal" },
          );
        }
        continue;
      }
      const sh = new THREE.Shape();
      const aA = -Math.abs(da) / 2 - 0.02,
        aB = Math.abs(da) / 2 + 0.02;
      sh.moveTo(Math.cos(aA) * rIn, Math.sin(aA) * rIn);
      sh.lineTo(Math.cos(aA) * rOut, Math.sin(aA) * rOut);
      sh.absarc(0, 0, rOut, aA, aB, false);
      sh.lineTo(Math.cos(aB) * rIn, Math.sin(aB) * rIn);
      sh.absarc(0, 0, rIn, aB, aA, true);
      const g = new THREE.ExtrudeGeometry(sh, {
        depth: th,
        bevelEnabled: false,
        curveSegments: 3,
      });
      // shape XY → world XZ: rotate so shape +Y maps to world +Z, extrusion to +Y
      g.rotateX(HP);
      g.translate(0, th, 0);
      // rotateX(+90°) maps shape y → z; extrusion (z) → -y, translated up by th
      b.add(key, g, {
        m: PR.m4(cx, top - th, cz, -a),
        grime: opts.grime === undefined ? 0.35 : opts.grime,
      });
      if (opts.under)
        b.box(
          opts.under,
          cx + Math.cos(a) * rm,
          top - th - 0.22,
          cz + Math.sin(a) * rm,
          rOut - rIn - 0.1,
          0.22,
          0.25,
          { ry: -a, seg: false },
        );
      if (!opts.noCollide) {
        const arc = Math.abs(da) * rOut + 0.1;
        PR.col(
          cx + Math.cos(a) * rm,
          cz + Math.sin(a) * rm,
          rOut - rIn,
          arc,
          top - 0.35,
          top,
          -a,
          { surface: opts.surface || "concrete" },
        );
      }
      if (opts.rail) {
        const rx = cx + Math.cos(a) * (rIn + 0.08),
          rz = cz + Math.sin(a) * (rIn + 0.08);
        b.box(opts.rail, rx, top, rz, 0.035, opts.railH || 1.0, 0.035, {
          seg: false,
          grime: 0.2,
        });
        const a2 = a + da,
          rx2 = cx + Math.cos(a2) * (rIn + 0.08),
          rz2 = cz + Math.sin(a2) * (rIn + 0.08);
        b.beam(
          opts.rail,
          V3(rx, top + (opts.railH || 1.0), rz),
          V3(rx2, top + dy + (opts.railH || 1.0), rz2),
          0.05,
          0.05,
        );
        if (!opts.noCollide && !opts.noRailCol)
          PR.col(
            rx,
            rz,
            0.1,
            Math.abs(da) * rIn + 0.1,
            top - 0.2,
            top + (opts.railH || 1.0),
            -a,
            { walkable: false, surface: "metal" },
          );
      }
    }
    return { n, endAngle: a0 + da * n, endY: y0 + dy * n };
  };

  /** Soft vertical light shaft (additive cone), parented; returns mesh. */
  PR.shaftMat = null;
  PR.lightShaft = function (parent, x, y, z, rTop, rBot, h, color, opacity) {
    const mat = new THREE.MeshBasicMaterial({
      color: color || 0xd8f0c0,
      transparent: true,
      opacity: opacity || 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, 16, 1, true);
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y - h / 2, z);
    m.renderOrder = 5;
    m.castShadow = false;
    m.receiveShadow = false;
    parent.add(m);
    return m;
  };

  /** Iron hospital bed (frame, mattress, optional skeleton), local facing ry (head toward -Z local). */
  PR.bed = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PR.m4(x, y, z, ry);
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.5,
      });
    const L2 = 1.0,
      W2 = 0.46;
    for (const sx of [-W2, W2])
      for (const sz of [-L2, L2])
        add(
          "iron",
          new THREE.BoxGeometry(0.04, sz < 0 ? 1.05 : 0.8, 0.04),
          PR.m4(sx, sz < 0 ? 0.525 : 0.4, sz),
        );
    add("iron", new THREE.BoxGeometry(0.96, 0.04, 0.04), PR.m4(0, 1.0, -L2));
    add("iron", new THREE.BoxGeometry(0.96, 0.04, 0.04), PR.m4(0, 0.75, L2));
    for (let i = 1; i < 5; i++)
      add(
        "iron",
        new THREE.BoxGeometry(0.02, 0.45, 0.02),
        PR.m4(-W2 + i * 0.184, 0.78, -L2),
      );
    for (const sx of [-W2, W2])
      add("iron", new THREE.BoxGeometry(0.04, 0.04, 2.0), PR.m4(sx, 0.4, 0));
    if (opts.mattress !== false)
      add(
        opts.sheet || "canvas_w",
        new THREE.BoxGeometry(0.88, 0.14, 1.9),
        PR.m4(0, 0.49, 0, 0, (opts.tilt || 0) * 0.1, 0),
      );
    if (opts.straps)
      for (const sz of [-0.5, 0.3])
        add(
          "fabric",
          new THREE.BoxGeometry(0.98, 0.03, 0.08),
          PR.m4(0, 0.58, sz),
        );
    if (opts.skeleton) {
      add("bone", new THREE.SphereGeometry(0.1, 7, 5), PR.m4(0, 0.66, -0.75));
      for (let i = 0; i < 5; i++)
        add(
          "bone",
          new THREE.TorusGeometry(0.12 - i * 0.008, 0.012, 3, 8, Math.PI),
          PR.m4(0, 0.6, -0.5 + i * 0.07, 0, Math.PI / 2),
        );
      for (const sx of [-0.1, 0.1])
        add(
          "bone",
          new THREE.CylinderGeometry(0.02, 0.016, 0.85, 4),
          PR.m4(sx, 0.6, 0.45, 0, Math.PI / 2),
        );
    }
    if (opts.collide !== false)
      PR.col(x, z, 1.0, 2.1, y, y + 0.62, ry, { surface: "metal" });
  };
  /** Wheelchair (optionally tipped). */
  PR.wheelchair = function (b, x, y, z, ry, tipped) {
    const M = PR.m4(x, y + (tipped ? 0.32 : 0), z, ry, 0, tipped ? 1.45 : 0);
    const add = (key, geo, m) =>
      b.add(key, geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.4,
      });
    for (const sx of [-0.32, 0.32]) {
      const w = new THREE.TorusGeometry(0.3, 0.02, 4, 14);
      w.rotateY(Math.PI / 2);
      add("chrome", w, PR.m4(sx, 0.32, 0.05));
    }
    add("fabric", new THREE.BoxGeometry(0.5, 0.05, 0.45), PR.m4(0, 0.5, 0));
    add("fabric", new THREE.BoxGeometry(0.5, 0.5, 0.05), PR.m4(0, 0.78, 0.24));
    add(
      "chrome",
      new THREE.BoxGeometry(0.55, 0.03, 0.03),
      PR.m4(0, 1.02, 0.28),
    );
  };
