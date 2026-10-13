// play-inline-457 15 — size
// Lines 3664-3782 of readable/play-inline-457.pretty.js (statement-aligned).
  H.signPlate = function (R, bone, kind, size, x, y, z, rx, ry, rz) {
    const shape = (k) => {
      if (kind === "stop") {
        const pts = [];
        for (let i = 0; i < 8; i++) {
          const a = ((i + 0.5) / 8) * PI * 2;
          pts.push([Math.cos(a) * k, Math.sin(a) * k]);
        }
        return pts;
      }
      if (kind === "warn")
        return [
          [0, k],
          [k, 0],
          [0, -k],
          [-k, 0],
        ];
      if (kind === "oneway")
        return [
          [-k * 1.3, -k * 0.45],
          [k * 1.3, -k * 0.45],
          [k * 1.3, k * 0.45],
          [-k * 1.3, k * 0.45],
        ];
      return [
        [-k * 0.75, -k],
        [k * 0.75, -k],
        [k * 0.75, k],
        [-k * 0.75, k],
      ];
    };
    const face =
      { stop: 0x9a2418, warn: 0xc49a1c, speed: 0xc8c4b4, oneway: 0x1e1e1c }[
        kind
      ] || 0xc8c4b4;
    const rim =
      { stop: 0xd8d4c8, warn: 0x1a1a18, speed: 0x1a1a18, oneway: 0xd8d4c8 }[
        kind
      ] || 0x1a1a18;
    const paint = {
      region: "raidpaint",
      rough: 0.6,
      metal: 0.35,
      noise: 0.25,
      cls: 0,
    };
    const place = (g, dz) => {
      g.rotateY(PI);
      g.translate(0, 0, -dz);
      P.xf(g, x, y, z, rx || 0, ry || 0, rz || 0);
      return g;
    };
    R.add(
      bone,
      place(P.extrude(shape(size), 0.006, 0.0015), 0),
      Object.assign({ color: rim }, paint),
    );
    R.add(
      bone,
      place(P.extrude(shape(size * 0.84), 0.004, 0), 0.004),
      Object.assign({ color: face }, paint),
    );
    if (kind === "oneway")
      R.add(
        bone,
        place(
          P.extrude(
            [
              [-size, -0.12 * size],
              [size * 0.5, -0.12 * size],
              [size * 0.5, -0.3 * size],
              [size, 0],
              [size * 0.5, 0.3 * size],
              [size * 0.5, 0.12 * size],
              [-size, 0.12 * size],
            ],
            0.003,
            0,
          ),
          0.007,
        ),
        Object.assign({ color: 0xd8d4c8 }, paint),
      );
    if (kind === "warn")
      R.add(
        bone,
        place(
          P.extrude(
            [
              [-0.05 * size, -0.3 * size],
              [0.05 * size, -0.3 * size],
              [0.07 * size, 0.35 * size],
              [-0.07 * size, 0.35 * size],
            ],
            0.003,
            0,
          ),
          0.007,
        ),
        Object.assign({ color: 0x1a1a18 }, paint),
      );
    for (const [bx, by] of [
      [-0.55, 0.55],
      [0.55, 0.55],
      [-0.55, -0.55],
      [0.55, -0.55],
    ]) {
      // bolt heads at the corners
      R.add(
        bone,
        place(
          P.xf(P.sphere(0.0065, 0.0065, 0.004, 5, 3), bx * size, by * size, 0),
          0.008,
        ),
        metalM(0x9a9a90, { rough: 0.4 }),
      );
    }
  };

