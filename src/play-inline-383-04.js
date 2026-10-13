// play-inline-383 04 — box
// Lines 604-670 of readable/play-inline-383.pretty.js (statement-aligned).
  K.statueFigure = function (b, x, y, z, yaw, o) {
    o = o || {};
    const s = o.scale || 1,
      mat = o.mat || "bronze",
      t = o.tint || [0.45, 0.5, 0.4];
    const c = Math.cos(yaw),
      sn = Math.sin(yaw);
    const L = (lx, ly, lz) => [
      x + lx * c + lz * sn,
      y + ly,
      z - lx * sn + lz * c,
    ];
    const box = (lx, ly, lz, w, h, d, extra) => {
      const p = L(lx, ly, lz);
      b.box(
        mat,
        p[0],
        p[1],
        p[2],
        w * s,
        h * s,
        d * s,
        Object.assign({ yaw, tint: t }, extra || {}),
      );
    };
    const sph = (lx, ly, lz, sx, sy, sz) => {
      const p = L(lx, ly, lz);
      b.geo(mat, K.sphereGeo(), {
        x: p[0],
        y: p[1],
        z: p[2],
        sx: sx * s,
        sy: sy * s,
        sz: sz * s,
        ry: yaw,
        tint: t,
      });
    };
    if (o.seated) {
      // chair
      box(0, 0, 0.1 * s, 1.0, 0.55, 0.9, { tint: t.map((v) => v * 0.85) });
      box(0, 0.55 * s, 0.5 * s, 1.0, 1.1, 0.14, {
        tint: t.map((v) => v * 0.85),
      });
      // legs & robe
      box(0, 0.55 * s, -0.05 * s, 0.8, 0.28, 0.9);
      for (const e of [-1, 1]) {
        box(e * 0.2 * s, 0, -0.55 * s, 0.24, 0.6, 0.28);
        box(e * 0.2 * s, 0, -0.68 * s, 0.26, 0.08, 0.36);
      }
      // torso, coat, head (with beard)
      box(0, 0.8 * s, 0.15 * s, 0.66, 0.8, 0.42);
      box(0, 0.75 * s, 0.1 * s, 0.76, 0.4, 0.55);
      sph(0, 1.78 * s, 0.1 * s, 0.14, 0.17, 0.15);
      sph(0, 1.66 * s, 0.01 * s, 0.12, 0.1, 0.08); // beard
      for (const e of [-1, 1]) {
        box(e * 0.38 * s, 1.1 * s, 0.05 * s, 0.14, 0.5, 0.16);
        box(e * 0.38 * s, 0.9 * s, -0.2 * s, 0.14, 0.14, 0.45);
      }
      box(0.38 * s, 0.97 * s, -0.42 * s, 0.22, 0.1, 0.3); // book / papers in hand
    } else {
      for (const e of [-1, 1]) box(e * 0.13 * s, 0, 0, 0.2, 0.9, 0.24);
      box(0, 0.9 * s, 0, 0.5, 0.7, 0.3);
      sph(0, 1.78 * s, 0, 0.12, 0.15, 0.13);
      for (const e of [-1, 1]) box(e * 0.33 * s, 0.95 * s, 0, 0.12, 0.62, 0.14);
    }
  };
