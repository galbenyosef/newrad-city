// play-inline-448 02 — seg
// Lines 270-531 of readable/play-inline-448.pretty.js (statement-aligned).
  function gutWreck(k, r, o) {
    const dy = o.dy,
      L = o.hoodZ1 - o.hoodZ0,
      th = 0.95 + r() * 0.35;
    const cz = (o.hoodZ0 + o.hoodZ1) / 2;
    // engine bay: dark cavity, rusted block, air cleaner, radiator
    k.box(
      "trim",
      o.halfW * 1.5,
      0.05,
      L * 0.9,
      0,
      o.hoodY + dy + 0.005,
      cz,
      T({ color: 0x14110e, ao: [1, 1], grime: 0 }),
    );
    k.cbox(
      "trim",
      0.62,
      0.3,
      L * 0.5,
      0,
      o.hoodY + dy + 0.1,
      cz + 0.08,
      T({ color: 0x5a3a22, rust: 0.95, bevel: 0.04 }),
    );
    k.cyl(
      "trim",
      0.2,
      0.2,
      0.08,
      0,
      o.hoodY + dy + 0.3,
      cz + 0.05,
      T({ seg: 10, color: C.chrome, rust: 0.6 }),
    );
    k.box(
      "trim",
      o.halfW * 1.2,
      0.3,
      0.06,
      0,
      o.hoodY + dy + 0.05,
      o.hoodZ0 + 0.2,
      T({ color: 0x3a3028, rust: 0.8 }),
    );
    // the raised bonnet, hinged at the windshield end
    k.cbox(
      "paint",
      o.halfW * 1.72,
      0.04,
      L,
      0,
      o.hoodY + dy + 0.02 + (Math.sin(th) * L) / 2,
      o.hoodZ1 - (Math.cos(th) * L) / 2,
      Object.assign({}, o.po, { rx: th, bevel: 0.015, seg: undefined }),
    );
    k.seg(
      "trim",
      [0.4, o.hoodY + dy, cz - L * 0.2],
      [
        0.4,
        o.hoodY + dy + Math.sin(th) * L * 0.55,
        o.hoodZ1 - Math.cos(th) * L * 0.55,
      ],
      0.01,
      T({ color: 0x3a3a34 }),
    );
    // missing door: dark cavity with a seat back peeking out, the door dumped beside the car
    const s = r() < 0.5 ? -1 : 1,
      dz = (o.doorZ0 + o.doorZ1) / 2,
      dl = o.doorZ1 - o.doorZ0;
    k.box(
      "trim",
      0.03,
      0.5,
      dl,
      s * (o.halfW + 0.012),
      0.68 + dy,
      dz,
      T({ color: 0x100e0c, ao: [1, 1], grime: 0 }),
    );
    k.box(
      "trim",
      0.04,
      0.34,
      dl * 0.7,
      s * (o.halfW + 0.02),
      0.78 + dy,
      dz + 0.1,
      T({ color: 0x5a2a22, grime: 0.5 }),
    ); // torn red vinyl seat
    k.cbox(
      "paint",
      dl,
      0.05,
      0.55,
      s * (o.halfW + 0.85),
      0.03,
      dz + (r() - 0.5) * 0.8,
      Object.assign({}, o.po, {
        ry: (r() - 0.5) * 0.8,
        rz: 0.06,
        bevel: 0.015,
        seg: undefined,
      }),
    );
    // sprung boot lid
    if (o.trunkZ !== undefined && r() < 0.6)
      k.cbox(
        "paint",
        o.halfW * 1.6,
        0.04,
        0.9,
        0,
        o.trunkY + dy + 0.12,
        o.trunkZ + 0.38,
        Object.assign({}, o.po, { rx: -0.32, bevel: 0.015, seg: undefined }),
      );
  }

  // ------------------------------------------------------------------
  // Eagle Strato-Eight (Eagle Motors): four-door sedan (fins!)
  // ------------------------------------------------------------------
  const SEDAN_BODY = [
    { z: -2.65, wb: 0.78, wt: 0.72, yb: 0.42, yt: 0.8, n: 3.2 },
    { z: -2.55, wb: 0.92, wt: 0.88, yb: 0.34, yt: 0.88, n: 4 },
    { z: -2.2, wb: 0.98, wt: 0.95, yb: 0.3, yt: 0.93, n: 5 },
    { z: -1.2, wb: 1.0, wt: 0.96, yb: 0.3, yt: 0.965, n: 5 },
    { z: -0.5, wb: 1.0, wt: 0.96, yb: 0.3, yt: 0.99, n: 5 },
    { z: 1.0, wb: 1.0, wt: 0.96, yb: 0.3, yt: 0.99, n: 5 },
    { z: 2.0, wb: 1.0, wt: 0.95, yb: 0.31, yt: 0.97, n: 5 },
    { z: 2.45, wb: 0.96, wt: 0.9, yb: 0.34, yt: 0.94, n: 4 },
    { z: 2.65, wb: 0.84, wt: 0.76, yb: 0.42, yt: 0.86, n: 3 },
  ];
  const SEDAN_CABIN = [
    { z: -0.62, wb: 0.9, wt: 0.72, yb: 0.97, yt: 1.0, n: 3 },
    { z: -0.2, wb: 0.9, wt: 0.72, yb: 0.97, yt: 1.46, n: 4 },
    { z: 0.85, wb: 0.9, wt: 0.72, yb: 0.97, yt: 1.48, n: 4 },
    { z: 1.3, wb: 0.9, wt: 0.72, yb: 0.97, yt: 1.4, n: 4 },
    { z: 1.6, wb: 0.9, wt: 0.74, yb: 0.97, yt: 1.0, n: 3 },
  ];
  function buildSedan(k, r, stripped, paintFn, wreck) {
    const dy = stripped ? -0.14 : 0;
    const po = {
      tint: true,
      rust: 0.35 + r() * 0.2,
      color: 0xf0f0ec,
      colorFn: paintFn,
      seg: 14,
      ao: [0.55, 0.9],
    };
    k.loft("paint", shift(SEDAN_BODY, dy), po);
    k.loft("trim", shift(SEDAN_CABIN, dy), GL({ seg: 14 }));
    k.loft(
      "paint",
      roofFrom(SEDAN_CABIN, dy),
      Object.assign({}, po, {
        seg: 14,
        colorFn: paintFn ? (x, y, z) => paintFn(x, 1.5, z) : undefined,
      }),
    );
    // pillars
    for (const s of [-1, 1]) {
      k.seg(
        "paint",
        [s * 0.86, 0.98 + dy, 0.35],
        [s * 0.74, 1.45 + dy, 0.33],
        0.04,
        Object.assign({}, po, { seg: 4 }),
      );
      k.seg(
        "paint",
        [s * 0.86, 0.98 + dy, 1.5],
        [s * 0.74, 1.42 + dy, 1.15],
        0.05,
        Object.assign({}, po, { seg: 4 }),
      );
    }
    // fins
    for (const s of [-1, 1]) {
      k.extrude(
        "paint",
        [
          [1.1, 0.96],
          [2.66, 0.92],
          [2.8, 1.3],
          [2.62, 1.33],
          [2.2, 1.12],
        ],
        0.1,
        Object.assign({}, po, { ry: -PI / 2, x: s * 0.88, y: dy, bevel: 0.02 }),
      );
      k.cyl(
        "trim",
        0.05,
        0.06,
        0.18,
        s * 0.88,
        1.16 + dy,
        2.75,
        T({ rx: PI / 2, seg: 8, color: 0xa01a14, ao: [1, 1] }),
      );
    }
    const fy = 0.62 + dy;
    grille(k, 1.0, fy, -2.63, 0.24);
    headlights(k, 1.0, 0.78 + dy, -2.56);
    bumper(k, 1.0, 0.44 + dy, -2.72, true);
    bumper(k, 1.0, 0.46 + dy, 2.72, false);
    plate(k, 0.62 + dy, 2.68, true);
    sideSpear(k, 1.0, 0.72 + dy, -1.9, 2.3);
    mirror(k, 1.0, 1.0 + dy, -0.55);
    k.cyl(
      "trim",
      0.0,
      0.05,
      0.3,
      0,
      0.99 + dy,
      -2.35,
      T({ rx: -PI / 2, seg: 6, color: C.chrome }),
    ); // hood ornament rocket
    for (const [wz, sd] of [
      [-1.62, 1],
      [1.55, 1],
    ])
      for (const s of [-1, 1]) wheel(k, s * 0.86, 0.36, wz, 0.36, s, stripped);
    if (wreck)
      gutWreck(k, r, {
        dy,
        halfW: 0.98,
        hoodZ0: -2.5,
        hoodZ1: -0.66,
        hoodY: 0.95,
        doorZ0: -0.55,
        doorZ1: 0.75,
        trunkZ: 1.65,
        trunkY: 0.95,
        po,
      });
    k.meta.size = [2.1, 5.5, 1.55 + dy];
  }
  // ------------------------------------------------------------------
  // Eagle Royale (Eagle Motors): jet-age two-door coupe
  // ------------------------------------------------------------------
  const COUPE_BODY = [
    { z: -2.45, wb: 0.55, wt: 0.5, yb: 0.45, yt: 0.78, n: 2.6 },
    { z: -2.3, wb: 0.85, wt: 0.8, yb: 0.36, yt: 0.88, n: 3.5 },
    { z: -1.9, wb: 0.97, wt: 0.92, yb: 0.3, yt: 0.92, n: 4 },
    { z: -0.6, wb: 1.0, wt: 0.94, yb: 0.3, yt: 0.95, n: 4.2 },
    { z: 0.8, wb: 1.0, wt: 0.94, yb: 0.3, yt: 0.95, n: 4.2 },
    { z: 1.9, wb: 0.97, wt: 0.9, yb: 0.32, yt: 0.93, n: 4 },
    { z: 2.35, wb: 0.86, wt: 0.78, yb: 0.38, yt: 0.86, n: 3.2 },
    { z: 2.47, wb: 0.7, wt: 0.6, yb: 0.45, yt: 0.8, n: 2.6 },
  ];
  const COUPE_CABIN = [
    { z: -0.55, wb: 0.9, wt: 0.75, yb: 0.93, yt: 0.97, n: 3 },
    { z: -0.2, wb: 0.9, wt: 0.68, yb: 0.93, yt: 1.42, n: 3 },
    { z: 0.6, wb: 0.9, wt: 0.66, yb: 0.93, yt: 1.46, n: 3 },
    { z: 1.1, wb: 0.9, wt: 0.7, yb: 0.93, yt: 1.36, n: 3 },
    { z: 1.45, wb: 0.9, wt: 0.75, yb: 0.93, yt: 0.97, n: 3 },
  ];
