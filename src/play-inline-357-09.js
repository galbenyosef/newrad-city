// play-inline-357 09 — add
// Lines 2096-2240 of readable/play-inline-357.pretty.js (statement-aligned).
  PF.wagon = function (b, x, y, z, ry, opts) {
    opts = opts || {};
    const M = PF.m4(x, y, z, ry);
    const add = (k, g, m, o) =>
      b.add(
        k,
        g,
        Object.assign(
          { m: new THREE.Matrix4().multiplyMatrices(M, m), grime: 0.55 },
          o || {},
        ),
      );
    add("planks", new THREE.BoxGeometry(1.7, 0.12, 3.6), PF.m4(0, 0.75, 0));
    for (const sx of [-0.85, 0.85])
      add("planks", new THREE.BoxGeometry(0.06, 0.5, 3.6), PF.m4(sx, 1.0, 0));
    for (const sz of [-1.8, 1.8])
      add("planks", new THREE.BoxGeometry(1.7, 0.5, 0.06), PF.m4(0, 1.0, sz));
    for (const sx of [-0.95, 0.95])
      for (const sz of [-1.2, 1.2]) {
        const w = new THREE.TorusGeometry(0.45, 0.05, 4, 14);
        w.rotateY(HP);
        add("rotten", w, PF.m4(sx, 0.48, sz));
        for (let k = 0; k < 4; k++)
          add(
            "rotten",
            new THREE.BoxGeometry(0.04, 0.88, 0.05),
            PF.m4(sx, 0.48, sz, 0, (k * PI) / 4),
          );
      }
    add(
      "rust",
      new THREE.CylinderGeometry(0.04, 0.04, 2.1, 5),
      PF.m4(0, 0.48, -1.2, 0, 0, HP),
    );
    add(
      "rust",
      new THREE.CylinderGeometry(0.04, 0.04, 2.1, 5),
      PF.m4(0, 0.48, 1.2, 0, 0, HP),
    );
    add(
      "rotten",
      new THREE.BoxGeometry(0.1, 0.1, 2.0),
      PF.m4(0, 0.6, -2.7, 0, -0.15),
    );
    if (opts.cover !== false) {
      for (let k = 0; k < 4; k++) {
        const hz = -1.5 + k;
        const hoop = new THREE.TorusGeometry(0.88, 0.03, 3, 10, PI);
        add("rotten", hoop, PF.m4(0, 1.2, hz), {});
      }
      const cov = new THREE.CylinderGeometry(
        0.9,
        0.9,
        3.3,
        12,
        1,
        true,
        -HP,
        PI,
      );
      cov.rotateX(HP);
      add(opts.canvas || "canvas_ws", cov, PF.m4(0, 1.2, 0), { grime: 0.7 });
    }
    for (let k = 0; k < 3; k++)
      add(
        "crate",
        new THREE.BoxGeometry(0.55, 0.45, 0.55),
        PF.m4(-0.4 + (k % 2) * 0.8, 1.05, 0.9 - k * 0.7, 0.2 * k),
      );
    PF.col(x, z, 2.1, 4.2, y, y + 2.2, ry, {
      walkable: false,
      surface: "wood",
    });
  };
  /** Iron ceiling / wall lamp in a cage + glow (for interiors). */
  PF.cageLamp = function (b, x, y, z, color, parent) {
    b.cyl("iron", x, y + 0.2, z, 0.02, 0.02, 0.6, 4, { hSeg: 1 });
    b.cyl("iron", x, y, z, 0.18, 0.12, 0.2, 8, { hSeg: 1, open: true });
    b.sphere("bulb_ws", x, y - 0.05, z, 0.08, {
      ws: 6,
      hs: 4,
      noAO: true,
      grime: 0,
    });
    PF.glow(V3(x, y - 0.1, z), color || 0xffd8a0, 1.3, parent, {
      intensity: 1.1,
    });
  };
  /** Headstone (slate slab with texture on the front) — small, cheap, leaning. */
  /** Colonial headstone outline: shoulders + round tympanum (bottom-centre origin, from y = yb up to h). */
  function stoneShape(w, h, yb, style) {
    const sh = new THREE.Shape();
    const rc = w * (style === 1 ? 0.5 : 0.34),
      hs = h - rc,
      sw = w / 2 - rc;
    sh.moveTo(-w / 2, yb);
    sh.lineTo(w / 2, yb);
    sh.lineTo(w / 2, hs);
    if (style === 1) {
      sh.absarc(0, hs, rc, 0, PI, false);
    } // plain round top
    else {
      sh.quadraticCurveTo(w / 2 - sw / 2, hs + sw * 1.1, rc, hs); // right shoulder lobe
      sh.absarc(0, hs, rc, 0, PI, false); // tympanum
      sh.quadraticCurveTo(-w / 2 + sw / 2, hs + sw * 1.1, -w / 2, hs); // left shoulder lobe
    }
    sh.lineTo(-w / 2, yb);
    return sh;
  }
  PF.headstone = function (b, x, z, ry, v, opts) {
    opts = opts || {};
    const r = PF.rng("hsx" + x.toFixed(1) + z.toFixed(1));
    const h = (opts.h || 1.0) * (0.75 + r() * 0.5),
      w = 0.55 + r() * 0.3,
      tilt = (r() - 0.5) * 0.22,
      lean = (r() - 0.5) * 0.1;
    const y0 = opts.y || 0,
      style = v % 5 === 3 ? 1 : 0,
      T = 0.1;
    const m = PF.m4(x, y0, z, ry, tilt, lean);
    const g = new THREE.ExtrudeGeometry(stoneShape(w, h, -0.18, style), {
      depth: T,
      bevelEnabled: false,
      curveSegments: 5,
    });
    g.translate(0, 0, -T / 2);
    b.add(v % 2 ? "slate" : "brown_sp", g, { m, grime: 0.6 });
    // carved face: the same outline, UVs normalised to the stone so the tympanum art sits in the arch
    const f = new THREE.ShapeGeometry(
      stoneShape(w * 0.97, h * 0.985, 0.02, style),
      5,
    );
    const uv = f.attributes.uv,
      pos = f.attributes.position;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(i, (pos.getX(i) + w / 2) / w, pos.getY(i) / h);
    f.translate(0, 0, T / 2 + 0.004);
    const at = PF.hsAtlas; // St. Paul's exterior packs the headstone faces into its sign atlas (one draw call)
    b.add(at ? at.key : PF.headstoneKey(v), f, {
      m,
      uv: "keep",
      uvRect: at ? at.rect("hs" + (v % 4)) : undefined,
      grime: 0.3,
    });
  };
