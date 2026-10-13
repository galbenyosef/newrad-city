// play-inline-448 03 — spec
// Lines 532-798 of readable/play-inline-448.pretty.js (statement-aligned).
  function buildCoupe(k, r, stripped, paintFn, roofFn, wreck) {
    const dy = stripped ? -0.14 : 0;
    const po = {
      tint: true,
      rust: 0.35 + r() * 0.2,
      color: 0xf0f0ec,
      colorFn: paintFn,
      seg: 14,
      ao: [0.55, 0.9],
    };
    k.loft("paint", shift(COUPE_BODY, dy), po);
    k.loft("trim", shift(COUPE_CABIN, dy), GL({ seg: 14 }));
    k.loft(
      "paint",
      roofFrom(COUPE_CABIN, dy),
      Object.assign({}, po, { seg: 14, colorFn: roofFn || paintFn }),
    );
    for (const s of [-1, 1])
      k.seg(
        "paint",
        [s * 0.85, 0.95 + dy, 1.3],
        [s * 0.68, 1.4 + dy, 0.95],
        0.06,
        Object.assign({}, po, { seg: 4, colorFn: roofFn || paintFn }),
      );
    // chrome nose cone + jet-exhaust tail lights + small fins
    k.cyl(
      "trim",
      0.0,
      0.16,
      0.35,
      0,
      0.62 + dy,
      -2.55,
      T({ rx: -PI / 2, seg: 12, color: C.chrome, ao: [1, 1] }),
    );
    for (const s of [-1, 1]) {
      k.cyl(
        "trim",
        0.12,
        0.1,
        0.16,
        s * 0.55,
        0.68 + dy,
        2.47,
        T({ rx: PI / 2, seg: 12, color: C.chrome, ao: [1, 1] }),
      );
      k.cyl(
        "trim",
        0.085,
        0.085,
        0.02,
        s * 0.55,
        0.68 + dy,
        2.56,
        T({ rx: PI / 2, seg: 10, color: 0xb01a14, ao: [1, 1] }),
      );
      k.extrude(
        "paint",
        [
          [1.4, 0.9],
          [2.4, 0.86],
          [2.5, 1.08],
          [2.3, 1.1],
        ],
        0.08,
        Object.assign({}, po, {
          ry: -PI / 2,
          x: s * 0.84,
          y: dy,
          bevel: 0.015,
        }),
      );
    }
    headlights(k, 0.95, 0.76 + dy, -2.3);
    grille(k, 0.8, 0.52 + dy, -2.4, 0.16);
    bumper(k, 0.95, 0.42 + dy, -2.5, false);
    bumper(k, 0.95, 0.44 + dy, 2.54, false);
    plate(k, 0.5 + dy, 2.52, true);
    sideSpear(k, 1.0, 0.66 + dy, -1.6, 2.0);
    mirror(k, 1.0, 0.96 + dy, -0.45);
    for (const wz of [-1.5, 1.45])
      for (const s of [-1, 1]) wheel(k, s * 0.86, 0.35, wz, 0.35, s, stripped);
    if (wreck)
      gutWreck(k, r, {
        dy,
        halfW: 0.96,
        hoodZ0: -2.2,
        hoodZ1: -0.6,
        hoodY: 0.92,
        doorZ0: -0.5,
        doorZ1: 0.7,
        trunkZ: 1.5,
        trunkY: 0.92,
        po,
      });
    k.meta.size = [2.05, 5.1, 1.5 + dy];
  }

  // variants: 0 = on (flat, perished) tyres, 1 = stripped on rusted rims, 2 = gutted (rims + bonnet up + door gone)
  D("car_sedan", (k, r, v) => buildSedan(k, r, v >= 1, null, v === 2));
  D("car_coupe", (k, r, v) => buildCoupe(k, r, v >= 1, null, null, v === 2));
  D("car_taxi", (k, r, v) => {
    buildSedan(k, r, v >= 1, TAXI_FN, v === 2);
    const dy = v >= 1 ? -0.14 : 0;
    // Big Apple Motor Cab livery: checker stripe, door panel (name + slogan), BIG APPLE roof sign
    for (const s of [-1, 1])
      k.quad("taxi_stripe", 3.4, 0.1, s * 1.012, 0.82 + dy, 0.2, {
        mat: "trim",
        ry: (s * PI) / 2,
        ao: [1, 1],
      });
    for (const s of [-1, 1])
      k.quad("taxi_door", 1.3, 0.3, s * 1.012, 0.6 + dy, 0.25, {
        mat: "trim",
        ry: (s * PI) / 2,
        ao: [1, 1],
      });
    k.box("trim", 0.5, 0.2, 0.18, 0, 1.6 + dy, 0.4, T({ color: 0xe0b020 }));
    k.quad("taxi_sign", 0.46, 0.17, 0, 1.6 + dy, 0.3, {
      mat: "trim",
      ry: PI,
      ao: [1, 1],
    });
    k.quad("taxi_sign", 0.46, 0.17, 0, 1.6 + dy, 0.5, {
      mat: "trim",
      ao: [1, 1],
    });
  });
  D("car_police", (k, r, v) => {
    buildCoupe(k, r, v >= 1, POLICE_FN, () => 0xe8e4dc, v === 2);
    const dy = v >= 1 ? -0.14 : 0;
    for (const s of [-1, 1])
      k.quad("police_door", 1.2, 0.42, s * 1.004, 0.7 + dy, 0.05, {
        mat: "trim",
        ry: (s * PI) / 2,
        ao: [1, 1],
      });
    // light bar: red / blue domes + siren
    k.box("trim", 1.1, 0.1, 0.26, 0, 1.52 + dy, 0.35, T({ color: 0x2a2a2a }));
    k.sphere(
      "trim",
      0.12,
      -0.36,
      1.58 + dy,
      0.35,
      T({ color: 0xc01a14, s: [1.3, 0.8, 1], wseg: 8, hseg: 5 }),
    );
    k.sphere(
      "trim",
      0.12,
      0.36,
      1.58 + dy,
      0.35,
      T({ color: 0x1a3ac0, s: [1.3, 0.8, 1], wseg: 8, hseg: 5 }),
    );
    k.cyl(
      "trim",
      0.08,
      0.1,
      0.14,
      0,
      1.63 + dy,
      0.35,
      T({ seg: 8, color: C.chrome }),
    );
    k.cyl(
      "trim",
      0.08,
      0.08,
      0.18,
      -0.95,
      1.05 + dy,
      -0.45,
      T({ rx: PI / 2, seg: 8, color: C.chrome }),
    ); // spotlight
  });
  const VAN_BODY = [
    { z: -2.35, wb: 0.8, wt: 0.72, yb: 0.42, yt: 1.3, n: 3 },
    { z: -2.2, wb: 0.93, wt: 0.84, yb: 0.36, yt: 1.85, n: 3.5 },
    { z: -1.8, wb: 0.96, wt: 0.88, yb: 0.34, yt: 2.08, n: 4 },
    { z: 1.9, wb: 0.96, wt: 0.88, yb: 0.34, yt: 2.1, n: 4.2 },
    { z: 2.32, wb: 0.9, wt: 0.82, yb: 0.38, yt: 2.02, n: 3.5 },
  ];
  const BUS_BODY = [
    { z: -5.6, wb: 1.05, wt: 0.95, yb: 0.52, yt: 2.7, n: 4 },
    { z: -5.42, wb: 1.24, wt: 1.14, yb: 0.44, yt: 2.95, n: 6 },
    { z: 5.4, wb: 1.24, wt: 1.14, yb: 0.44, yt: 2.97, n: 6 },
    { z: 5.6, wb: 1.1, wt: 1.0, yb: 0.5, yt: 2.8, n: 4 },
  ];
  const TRUCK_CAB = [
    { z: -3.9, wb: 0.85, wt: 0.75, yb: 0.55, yt: 1.35, n: 3 },
    { z: -3.75, wb: 1.0, wt: 0.9, yb: 0.48, yt: 1.6, n: 3.5 },
    { z: -3.0, wb: 1.08, wt: 0.96, yb: 0.45, yt: 1.7, n: 4 },
    { z: -2.4, wb: 1.1, wt: 0.96, yb: 0.45, yt: 2.55, n: 4 },
    { z: -1.55, wb: 1.1, wt: 0.96, yb: 0.45, yt: 2.6, n: 4 },
    { z: -1.45, wb: 1.05, wt: 0.92, yb: 0.5, yt: 2.5, n: 3.5 },
  ];
  const PICKUP_HOOD = [
    { z: -2.6, wb: 0.8, wt: 0.72, yb: 0.45, yt: 0.95, n: 3 },
    { z: -2.45, wb: 0.95, wt: 0.88, yb: 0.4, yt: 1.08, n: 4 },
    { z: -1.0, wb: 1.0, wt: 0.92, yb: 0.4, yt: 1.12, n: 4.5 },
    { z: -0.9, wb: 1.0, wt: 0.92, yb: 0.4, yt: 1.12, n: 4.5 },
  ];
  const PICKUP_CAB = [
    { z: -0.95, wb: 1.0, wt: 0.9, yb: 0.4, yt: 1.95, n: 4 },
    { z: 0.4, wb: 1.0, wt: 0.9, yb: 0.4, yt: 1.95, n: 4 },
  ];
  const TAXI_FN = () => 0xe0b020;
  const POLICE_FN = (x, y, z) =>
    y > 0.5 && y < 0.93 && z > -1.25 && z < 1.35 ? 0xe8e4dc : 0x1a1a1c;
  const VAN_FN = (x, y) => (y > 1.25 ? 0xe8e0cc : 0xf0f0ec);
  const BUS_FN = (x, y) =>
    y > 1.32 ? 0xe8dcc0 : y > 1.12 ? 0xc8a020 : 0x3a6a4a;
  const TRUCK_FN = (x, y) => (y > 1.5 && y < 1.62 ? 0xf0e8d8 : 0xb8161a);

  // ------------------------------------------------------------------
  // LOW-DETAIL models (~300 tris) used for every car farther than ~90 m.
  // Same silhouettes/colours, no chrome details.
  // ------------------------------------------------------------------
  function lowCar(k, spec) {
    const po = {
      tint: true,
      rust: 0.4,
      color: 0xf0f0ec,
      colorFn: spec.fn,
      seg: 8,
      ao: [0.55, 0.9],
    };
    const body = spec.body.filter(
      (st, i) =>
        i === 0 ||
        i === spec.body.length - 1 ||
        i % 2 === 1 ||
        spec.body.length <= 4,
    );
    k.loft("paint", body, po);
    if (spec.body2) k.loft("paint", spec.body2, po);
    if (spec.cabin) k.loft("trim", spec.cabin, GL({ seg: 8 }));
    if (spec.fins)
      for (const s of [-1, 1])
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
          Object.assign({}, po, { ry: -PI / 2, x: s * 0.88 }),
        );
    if (spec.extra) spec.extra(k, po);
    for (const [wz, wr] of spec.wheels)
      for (const s of [-1, 1])
        k.cyl(
          "trim",
          wr,
          wr,
          0.24,
          s * spec.wx,
          wr,
          wz,
          T({ rz: PI / 2, seg: 7, color: C.rubber, ao: [1, 1] }),
        );
  }
