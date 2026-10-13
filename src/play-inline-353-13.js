// play-inline-353 13 — math
// Lines 3413-3523 of readable/play-inline-353.pretty.js (statement-aligned).
  PF.bench = function (b, x, y, z, ry) {
    const c = Math.cos(ry),
      s = Math.sin(ry);
    for (let i = 0; i < 3; i++)
      b.box(
        "rotten",
        x + s * (i * 0.14 - 0.14),
        y + 0.45,
        z + c * (i * 0.14 - 0.14),
        1.8,
        0.04,
        0.12,
        { ry, seg: false },
      );
    for (let i = 0; i < 2; i++)
      b.box(
        "rotten",
        x - s * 0.24,
        y + 0.62 + i * 0.16,
        z - c * 0.24,
        1.8,
        0.1,
        0.03,
        { ry, seg: false },
      );
    for (const k of [-0.8, 0.8])
      b.box("iron", x + c * k, y, z - s * k, 0.06, 0.8, 0.5, {
        ry,
        seg: false,
      });
  };
  /** Human skeleton lying on the ground (cheap bones). */
  PF.skeleton = function (b, x, y, z, ry) {
    const M = PF.m4(x, y, z, ry);
    const add = (geo, m) =>
      b.add("bone", geo, {
        m: new THREE.Matrix4().multiplyMatrices(M, m),
        grime: 0.3,
      });
    add(new THREE.SphereGeometry(0.11, 7, 5), PF.m4(0, 0.1, -0.8));
    for (let i = 0; i < 5; i++)
      add(
        new THREE.TorusGeometry(0.13 - i * 0.008, 0.012, 3, 8, Math.PI),
        PF.m4(0, 0.06, -0.55 + i * 0.07, 0, Math.PI / 2),
      );
    add(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4),
      PF.m4(0, 0.04, -0.35, 0, Math.PI / 2),
    );
    add(new THREE.BoxGeometry(0.28, 0.08, 0.14), PF.m4(0, 0.05, 0));
    for (const sx of [-0.1, 0.1]) {
      add(
        new THREE.CylinderGeometry(0.022, 0.018, 0.85, 4),
        PF.m4(sx * 1.4, 0.03, 0.45, sx * 2, Math.PI / 2),
      );
      add(
        new THREE.CylinderGeometry(0.018, 0.015, 0.6, 4),
        PF.m4(sx * 3.2, 0.03, -0.35, sx * 6, Math.PI / 2),
      );
    }
  };
  /** Low chain/rail fence of iron posts with rails between points (closed=false). */
  PF.railing = function (b, pts, y, h, key, opts) {
    opts = opts || {};
    key = key || "iron";
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i],
        c = pts[i + 1];
      const ya = typeof a[2] === "number" ? a[2] : y,
        yc = typeof c[2] === "number" ? c[2] : y;
      b.beam(
        key,
        new THREE.Vector3(a[0], ya + h, a[1]),
        new THREE.Vector3(c[0], yc + h, c[1]),
        0.06,
        0.06,
        { grime: 0.2 },
      );
      b.beam(
        key,
        new THREE.Vector3(a[0], ya + h * 0.5, a[1]),
        new THREE.Vector3(c[0], yc + h * 0.5, c[1]),
        0.04,
        0.04,
        { grime: 0.2 },
      );
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const n = Math.max(1, Math.round(len / (opts.postStep || 2)));
      for (let k = 0; k < n; k++) {
        const t = k / n;
        const px = a[0] + (c[0] - a[0]) * t,
          pz = a[1] + (c[1] - a[1]) * t,
          py = ya + (yc - ya) * t;
        b.box(key, px, py, pz, 0.08, h + 0.05, 0.08, {
          seg: false,
          grime: 0.2,
        });
      }
      if (opts.collide)
        PF.colWall(
          a[0],
          a[1],
          c[0],
          c[1],
          0.2,
          Math.min(ya, yc) - 0.5,
          Math.max(ya, yc) + h,
          { walkable: false, surface: "metal" },
        );
    }
  };
