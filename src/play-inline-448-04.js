// play-inline-448 04 — box
// Lines 799-1112 of readable/play-inline-448.pretty.js (statement-aligned).
  const LOW = {
    sedan: {
      body: SEDAN_BODY,
      cabin: SEDAN_CABIN,
      fins: true,
      wheels: [
        [-1.62, 0.36],
        [1.55, 0.36],
      ],
      wx: 0.86,
    },
    coupe: {
      body: COUPE_BODY,
      cabin: COUPE_CABIN,
      wheels: [
        [-1.5, 0.35],
        [1.45, 0.35],
      ],
      wx: 0.86,
    },
    taxi: {
      body: SEDAN_BODY,
      cabin: SEDAN_CABIN,
      fins: true,
      fn: TAXI_FN,
      wheels: [
        [-1.62, 0.36],
        [1.55, 0.36],
      ],
      wx: 0.86,
      extra: (k) =>
        k.box("trim", 0.5, 0.2, 0.18, 0, 1.6, 0.4, T({ color: 0xe0b020 })),
    },
    police: {
      body: COUPE_BODY,
      cabin: COUPE_CABIN,
      fn: POLICE_FN,
      wheels: [
        [-1.5, 0.35],
        [1.45, 0.35],
      ],
      wx: 0.86,
      extra: (k) => {
        k.box(
          "trim",
          0.4,
          0.14,
          0.26,
          -0.3,
          1.52,
          0.35,
          T({ color: 0xc01a14 }),
        );
        k.box("trim", 0.4, 0.14, 0.26, 0.3, 1.52, 0.35, T({ color: 0x1a3ac0 }));
      },
    },
    van: {
      body: VAN_BODY,
      fn: VAN_FN,
      wheels: [
        [-1.5, 0.36],
        [1.5, 0.36],
      ],
      wx: 0.84,
      extra: (k) =>
        k.box("trim", 1.6, 0.55, 0.05, 0, 1.55, -2.2, GL({ rx: 0.35 })),
    },
    bus: {
      body: BUS_BODY,
      fn: BUS_FN,
      wheels: [
        [-3.6, 0.5],
        [3.4, 0.5],
      ],
      wx: 1.02,
      extra: (k) => {
        for (const s of [-1, 1])
          k.box("trim", 0.04, 0.72, 8.8, s * 1.215, 1.95, 0.1, GL({}));
        k.box("trim", 2.1, 0.9, 0.05, 0, 1.95, -5.47, GL({}));
      },
    },
    fizzo_truck: {
      body: TRUCK_CAB,
      fn: TRUCK_FN,
      wheels: [
        [-3.0, 0.46],
        [2.6, 0.46],
      ],
      wx: 1.0,
      extra: (k) => {
        k.boxB("trim", 2.36, 2.3, 5.2, 0, 0.95, 1.2, T({ color: 0xe8e0cc }));
        for (const s of [-1, 1])
          k.quad("fizzo_truck", 5.0, 1.56, s * 1.185, 2.1, 1.2, {
            mat: "trim",
            ry: (s * PI) / 2,
            ao: [1, 1],
          });
        k.box("trim", 1.7, 0.6, 0.05, 0, 2.05, -2.43, GL({ rx: 0.25 }));
      },
    },
    pickup: {
      body: PICKUP_HOOD,
      body2: PICKUP_CAB,
      wheels: [
        [-1.75, 0.4],
        [1.8, 0.4],
      ],
      wx: 0.88,
      extra: (k, po) => {
        k.boxB("paint", 2.0, 0.6, 2.4, 0, 0.55, 1.65, po);
        k.box("trim", 1.6, 0.6, 0.05, 0, 1.55, -0.98, GL({ rx: 0.1 }));
      },
    },
  };
  for (const kind of Object.keys(LOW))
    D("carlo_" + kind, (k) => lowCar(k, LOW[kind]));
  // VERY-LOW twins (~70-110 tris): 3-station lofts, no wheels — used for whole car chunks away from the camera
  function vloCar(k, spec) {
    const po = {
      tint: true,
      rust: 0.4,
      color: 0xf0f0ec,
      colorFn: spec.fn,
      seg: 6,
      ao: [0.55, 0.9],
    };
    const pick3 = (st) =>
      st.length <= 3 ? st : [st[0], st[(st.length / 2) | 0], st[st.length - 1]];
    k.loft("paint", pick3(spec.body), po);
    if (spec.body2) k.loft("paint", spec.body2, po);
    if (spec.cabin) k.loft("trim", pick3(spec.cabin), GL({ seg: 6 }));
    if (spec.extra) spec.extra(k, po);
    k.box(
      "trim",
      spec.wx * 2,
      spec.wheels[0][1] * 1.2,
      Math.abs(spec.wheels[1][0] - spec.wheels[0][0]) + 0.8,
      0,
      spec.wheels[0][1] * 0.6,
      (spec.wheels[0][0] + spec.wheels[1][0]) / 2,
      T({ color: C.rubber, ao: [1, 1] }),
    );
  }
  for (const kind of Object.keys(LOW))
    D("carvlo_" + kind, (k) => vloCar(k, LOW[kind]));

  // ------------------------------------------------------------------
  // Delivery van
  // ------------------------------------------------------------------
  D("car_van", (k, r, v) => {
    const stripped = v === 1,
      dy = stripped ? -0.14 : 0;
    const po = {
      tint: true,
      rust: 0.4 + r() * 0.2,
      color: 0xf0f0ec,
      colorFn: VAN_FN,
      seg: 18,
      ao: [0.55, 1.0],
    };
    k.loft("paint", shift(VAN_BODY, dy), po);
    // windshield & side windows
    k.box("trim", 1.6, 0.55, 0.05, 0, 1.55 + dy, -2.2, GL({ rx: 0.35 }));
    for (const s of [-1, 1])
      k.box("trim", 0.05, 0.5, 0.8, s * 0.945, 1.55 + dy, -1.5, GL({}));
    // side livery panel (Civil Defense / root beer / teleprinter / Liberty Jetliner / Silver Torch / Fizzo ads on some vans)
    const nAd = X.BUS_ADS || 3,
      ai = (r() * (nAd + 1)) | 0,
      ad = ai < nAd ? "bus_ad_" + ai : "fizzo_truck";
    for (const s of [-1, 1])
      k.quad(ad, 2.6, 0.55, s * 0.965, 1.35 + dy, 0.55, {
        mat: "trim",
        ry: (s * PI) / 2,
        ao: [1, 1],
      });
    headlights(k, 0.9, 0.78 + dy, -2.3);
    grille(k, 0.7, 0.62 + dy, -2.36, 0.2);
    bumper(k, 0.93, 0.44 + dy, -2.42, false);
    bumper(k, 0.93, 0.46 + dy, 2.4, false);
    plate(k, 0.6 + dy, 2.36, true);
    mirror(k, 0.95, 1.4 + dy, -1.95);
    for (const wz of [-1.5, 1.5])
      for (const s of [-1, 1]) wheel(k, s * 0.84, 0.36, wz, 0.36, s, stripped);
    k.meta.size = [2.0, 4.9, 2.1 + dy];
  });
  // ------------------------------------------------------------------
  // City bus ("fishbowl" style)
  // ------------------------------------------------------------------
  D("car_bus", (k, r, v) => {
    const stripped = v === 1,
      dy = stripped ? -0.2 : 0;
    const po = {
      tint: true,
      rust: 0.35 + r() * 0.2,
      color: 0xf0f0ec,
      colorFn: BUS_FN,
      seg: 20,
      ao: [0.6, 1.2],
    };
    k.loft("paint", shift(BUS_BODY, dy), po);
    // window band
    for (const s of [-1, 1])
      for (let i = 0; i < 9; i++) {
        const wz = -4.1 + i * 1.05;
        if (s < 0 && i === 0) continue; // door
        k.box("trim", 0.04, 0.72, 0.9, s * 1.215, 1.95 + dy, wz, GL({}));
      }
    k.box("trim", 2.1, 0.9, 0.05, 0, 1.95 + dy, -5.47, GL({ rx: -0.08 }));
    k.box(
      "trim",
      0.05,
      2.0,
      0.95,
      -1.23,
      1.45 + dy,
      -4.6,
      T({ color: 0x1a1a18 }),
    ); // front door
    k.quad("bus_dest", 1.5, 0.24, 0, 2.62 + dy, -5.5, {
      mat: "trim",
      ry: PI,
      ao: [1, 1],
    });
    const ad = "bus_ad_" + ((r() * (X.BUS_ADS || 3)) | 0);
    for (const s of [-1, 1])
      k.quad(ad, 4.2, 0.78, s * 1.25, 0.95 + dy, 0.8, {
        mat: "trim",
        ry: (s * PI) / 2,
        ao: [1, 1],
      });
    headlights(k, 1.1, 0.8 + dy, -5.5);
    bumper(k, 1.2, 0.5 + dy, -5.66, false);
    k.box("trim", 1.6, 0.6, 0.04, 0, 1.2 + dy, 5.62, T({ color: 0x2a2a28 })); // rear engine grille
    for (const s of [-1, 1])
      k.box(
        "trim",
        0.06,
        0.04,
        9.8,
        s * 1.235,
        1.12 + dy,
        0,
        T({ color: C.chrome, ao: [1, 1] }),
      );
    for (const wz of [-3.6, 3.3, 3.95])
      for (const s of [-1, 1])
        wheel(k, s * 1.02, 0.5, wz, 0.5, s, stripped, 0.3);
    k.meta.size = [2.5, 11.3, 3.0 + dy];
  });
  // ------------------------------------------------------------------
  // Fizzo Cola delivery truck
  // ------------------------------------------------------------------
  D("car_fizzo_truck", (k, r, v) => {
    const stripped = v === 1,
      dy = stripped ? -0.18 : 0;
    const po = {
      tint: true,
      rust: 0.35 + r() * 0.25,
      color: 0xf0f0ec,
      colorFn: TRUCK_FN,
      seg: 18,
      ao: [0.55, 1.1],
    };
    // rounded cab
    k.loft("paint", shift(TRUCK_CAB, dy), po);
    k.box("trim", 1.7, 0.6, 0.05, 0, 2.05 + dy, -2.43, GL({ rx: 0.25 }));
    for (const s of [-1, 1])
      k.box("trim", 0.05, 0.55, 0.6, s * 1.1, 2.0 + dy, -1.95, GL({}));
    // cargo box with Fizzo livery
    k.boxB(
      "trim",
      2.36,
      2.3,
      5.2,
      0,
      0.95 + dy,
      1.2,
      T({ color: 0xe8e0cc, rust: 0.2 }),
    );
    for (const s of [-1, 1])
      k.quad("fizzo_truck", 5.0, 1.56, s * 1.185, 2.1 + dy, 1.2, {
        mat: "trim",
        ry: (s * PI) / 2,
        ao: [1, 1],
      });
    k.quad("fizzo_front", 1.1, 2.0, 0, 2.1 + dy, 3.81, {
      mat: "trim",
      ao: [1, 1],
    });
    for (const s of [-1, 1])
      k.box(
        "trim",
        0.04,
        2.3,
        0.08,
        s * 1.18,
        2.1 + dy,
        3.8,
        T({ color: 0x8a8a80 }),
      );
    k.boxB("trim", 2.4, 0.18, 5.4, 0, 0.78 + dy, 1.2, T({ color: 0x2a2a28 })); // chassis rail
    headlights(k, 1.0, 0.95 + dy, -3.82);
    grille(k, 0.9, 0.85 + dy, -3.88, 0.3);
    bumper(k, 1.08, 0.58 + dy, -3.96, true);
    plate(k, 0.7 + dy, 3.83, true);
    mirror(k, 1.1, 2.0 + dy, -2.3);
    for (const wz of [-3.0, 2.2, 3.0])
      for (const s of [-1, 1])
        wheel(k, s * 1.0, 0.46, wz, 0.46, s, stripped, 0.3);
    k.meta.size = [2.4, 7.9, 3.25 + dy];
  });
  // ------------------------------------------------------------------
  // Pickup truck (for raider camps / Brooklyn)
  // ------------------------------------------------------------------
