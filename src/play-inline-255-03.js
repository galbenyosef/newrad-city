// play-inline-255 03 — batter
// Lines 315-420 of readable/play-inline-255.pretty.js (statement-aligned).
  function pier(b, T, yBase, opts) {
    opts = opts || {};
    const x0 = T - 4.5,
      x1 = T + 4.5,
      z0 = -441.8,
      z1 = -428.2,
      top = Q.lo;
    const batter = 0.9;
    // battered shaft in 3 courses
    const courses = [
      [yBase, 2.2, batter],
      [2.2, top - 1.4, batter * 0.4],
      [top - 1.4, top, 0],
    ];
    for (const [ya, yb, bt] of courses)
      b.boxMM("pier_stone", x0 - bt, ya, z0 - bt, x1 + bt, yb, z1 + bt, {
        grime: 0.6,
        segLen: 3,
      });
    // pointed cutwater (south, downstream) and rounded north nose
    const cw = new THREE.Shape();
    cw.moveTo(-4.5 - batter, 0);
    cw.lineTo(4.5 + batter, 0);
    cw.lineTo(0, 3.8);
    cw.closePath();
    const g = new THREE.ExtrudeGeometry(cw, {
      depth: 11.2 - yBase,
      bevelEnabled: false,
    });
    g.rotateX(-HP);
    g.rotateY(PI);
    b.add("pier_stone", g, { m: PF.m4(T, yBase, z1 + batter), grime: 0.55 });
    if (opts.northNose)
      b.cyl(
        "pier_stone",
        T,
        yBase,
        z0 - batter,
        4.5 + batter,
        4.5 + batter,
        10.2 - yBase,
        16,
        { thetaStart: HP, thetaLen: PI, hSeg: 2, sz: 0.5, grime: 0.55 },
      );
    // cornice + cap plate + bearing shoes
    b.boxMM(
      "granite_block",
      x0 - 0.5,
      top - 1.4,
      z0 - 0.5,
      x1 + 0.5,
      top - 0.9,
      z1 + 0.5,
      { grime: 0.5, seg: false },
    );
    b.boxMM(
      "granite_block",
      x0 - 0.2,
      top - 0.3,
      z0 - 0.2,
      x1 + 0.2,
      top,
      z1 + 0.2,
      { grime: 0.5, seg: false },
    );
    for (const zz of [Q.zN, Q.zS])
      for (const dx of [-1.6, 1.6])
        b.box("qb_steel_dk", T + dx, top - 0.05, zz, 2.2, 0.6, 2.4, {
          seg: false,
        });
    // blind arch panels on the long faces
    for (const zz of [z0 - batter * 0.4 - 0.05, z1 + batter * 0.4 + 0.05]) {
      b.boxMM("granite_block", T - 2.2, 4, zz - 0.15, T + 2.2, 9.5, zz + 0.15, {
        grime: 0.6,
        seg: false,
      });
    }
    PF.colMM(x0 - batter, yBase, z0 - batter, x1 + batter, top, z1 + batter, {
      surface: "concrete",
    });
    if (opts.cutwaterCol)
      PF.colMM(T - 3, yBase, z1, T + 3, 10, z1 + 3.2, { walkable: false });
  }

  // =================================================================
  // Bridgemarket masonry approach (exterior shell + lit "peek" bays)
  // =================================================================
  function archShape(w, spring, segs) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2, 0);
    s.lineTo(w / 2, 0);
    s.lineTo(w / 2, spring);
    s.absarc(0, spring, w / 2, 0, PI, false);
    s.lineTo(-w / 2, 0);
    void segs;
    return s;
  }
  function archPath(w, spring, cx) {
    const p = new THREE.Path();
    p.moveTo(cx - w / 2, 0.001);
    p.lineTo(cx + w / 2, 0.001);
    p.lineTo(cx + w / 2, spring);
    p.absarc(cx, spring, w / 2, 0, PI, false);
    p.lineTo(cx - w / 2, 0.001);
    return p;
  }
