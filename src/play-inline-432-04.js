// play-inline-432 04 — math
// Lines 676-755 of readable/play-inline-432.pretty.js (statement-aligned).
  K.deadTree = function (b, x, y, z, h, seed) {
    const r = K.rng(seed || (x * 31 + z * 17) | 0);
    const t = [0.3, 0.26, 0.22];
    b.cyl("wood_rotten", x, y, z, 0.2, 0.12, h * 0.55, 7, { tint: t });
    const branch = (px, py, pz, len, a, pitch, depth) => {
      const ex = px + Math.cos(a) * Math.cos(pitch) * len,
        ey = py + Math.sin(pitch) * len,
        ez = pz + Math.sin(a) * Math.cos(pitch) * len;
      b.pipe(
        "wood_rotten",
        px,
        py,
        pz,
        ex,
        ey,
        ez,
        0.1 * Math.pow(0.6, 3 - depth),
        4,
        { tint: t },
      );
      if (depth > 0)
        for (let k = 0; k < 2; k++)
          branch(
            ex,
            ey,
            ez,
            len * 0.62,
            a + (r() - 0.5) * 1.6,
            pitch + (r() - 0.4) * 0.5,
            depth - 1,
          );
    };
    for (let k = 0; k < 4; k++)
      branch(
        x,
        y + h * (0.45 + r() * 0.12),
        z,
        h * 0.3,
        r() * PI * 2,
        0.6 + r() * 0.5,
        2,
      );
    b.col(x - 0.2, y, z - 0.2, x + 0.2, y + h * 0.5, z + 0.2, {
      tag: "tree",
      walkable: false,
      surface: "wood",
    });
  };

  /** Toothed gear disc, axle along x (a vertical wheel seen from ±x). */
  K.gearWheel = function (b, x, y, z, r, th, teeth, o) {
    o = o || {};
    const mat = o.mat || "brass",
      t = o.tint;
    b.geo(mat, new THREE.CylinderGeometry(r, r, th, Math.max(12, teeth)), {
      x,
      y,
      z,
      rz: PI / 2,
      tint: t,
    });
    for (let k = 0; k < teeth; k++) {
      const a = (k / teeth) * PI * 2;
      b.box(
        mat,
        x,
        y + Math.sin(a) * (r + 0.03) - 0.04,
        z + Math.cos(a) * (r + 0.03),
        th,
        0.08,
        0.08,
        { tint: t },
      );
    }
    b.geo(
      o.hub || "steel",
      new THREE.CylinderGeometry(r * 0.18, r * 0.18, th * 1.8, 8),
      { x, y, z, rz: PI / 2 },
    );
  };
