/* src/props/30_cars.js */
/* =====================================================================
 * props / 30_cars.js — OLD-WORLD AUTOMOBILES.
 * Rounded 1950s-future cars built from superellipse lofts: the Eagle Motors
 * Eagle Strato-Eight finned sedan and Eagle Royale jet-age coupe, the
 * Big Apple Motor Cab (yellow checker taxi), black-and-white police cruiser, delivery van, fishbowl city bus
 * and the Fizzo Cola delivery truck. Every model has a "stripped" wreck
 * variant (no tyres, sagging on rusted rims).
 *
 * Rendering: ONE material per car (X.carMaterial: paint tint mask +
 * per-vertex roughness/metalness + grime UV), three instanced LOD tiers
 * (near full detail / mid ~320 tris / far ~90 tris per chunk). Per-instance
 * control lets any car be shot, catch fire, EXPLODE (atomic battery pack!),
 * jump, and stay charred.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const U = G.util;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;

  const T = (o) => Object.assign({ uvFn: X.whiteUV }, o); // solid-colour trim (samples the atlas white texel)
  // windows live in the trim material too (dark, grimy) → 2 draw calls per car model instead of 3
  const GL = (o) =>
    Object.assign(
      {
        uvFn: X.whiteUV,
        color: 0x2e3a3a,
        ao: [1, 1],
        grime: 0.45,
        noiseScale: 4,
      },
      o,
    );

  // ------------------------------------------------------------------
  // Shared car parts
  // ------------------------------------------------------------------
  function wheel(k, x, y, z, r, side, stripped, w) {
    w = w || 0.24;
    if (!stripped) {
      k.cyl(
        "trim",
        r,
        r,
        w,
        x,
        y,
        z,
        T({ rz: PI / 2, seg: 10, color: C.rubber, grime: 0.3, ao: [1, 1] }),
      );
      k.cyl(
        "trim",
        r * 0.6,
        r * 0.6,
        0.03,
        x + side * (w / 2 + 0.005),
        y,
        z,
        T({ rz: PI / 2, seg: 9, color: 0xc8c4b8, ao: [1, 1], grime: 0.25 }),
      );
      k.cyl(
        "trim",
        r * 0.18,
        r * 0.3,
        0.05,
        x + side * (w / 2 + 0.03),
        y,
        z,
        T({ rz: (-side * PI) / 2, seg: 6, color: 0xd8d4c8, ao: [1, 1] }),
      );
    } else {
      // rusted steel rim sitting on the ground
      const rr = r * 0.62;
      k.cyl(
        "trim",
        rr,
        rr,
        w * 0.8,
        x,
        rr,
        z,
        T({ rz: PI / 2, seg: 10, color: C.rust, rust: 0.9, ao: [1, 1] }),
      );
    }
    // dark wheel well
    k.cyl(
      "trim",
      r + 0.06,
      r + 0.06,
      w + 0.04,
      x - side * 0.01,
      stripped ? r * 0.62 + 0.12 : y,
      z,
      T({
        rz: PI / 2,
        seg: 8,
        open: true,
        thetaStart: 0,
        thetaLength: PI,
        color: 0x121110,
        ao: [1, 1],
        grime: 0,
      }),
    );
  }
  function bumper(k, halfW, y, z, dagmars) {
    const L = halfW * 2 * 0.96;
    k.cyl(
      "trim",
      0.075,
      0.075,
      L,
      0,
      y,
      z,
      T({ rz: PI / 2, seg: 6, color: C.chrome, ao: [1, 1], grime: 0.2 }),
    );
    for (const s of [-1, 1])
      k.sphere(
        "trim",
        0.075,
        (s * L) / 2,
        y,
        z,
        T({ color: C.chrome, wseg: 5, hseg: 3, ao: [1, 1] }),
      );
    if (dagmars)
      for (const s of [-1, 1])
        k.cyl(
          "trim",
          0.0,
          0.08,
          0.2,
          s * halfW * 0.45,
          y + 0.08,
          z - Math.sign(-z) * 0.1 * 0 - (z < 0 ? 0.1 : -0.1),
          T({
            rx: z < 0 ? -PI / 2 : PI / 2,
            seg: 8,
            color: C.chrome,
            ao: [1, 1],
          }),
        );
  }
  function headlights(k, halfW, y, z) {
    for (const s of [-1, 1]) {
      k.cyl(
        "trim",
        0.14,
        0.15,
        0.08,
        s * halfW * 0.68,
        y,
        z,
        T({ rx: PI / 2, seg: 9, color: C.chrome, ao: [1, 1] }),
      );
      k.cyl(
        "trim",
        0.11,
        0.11,
        0.02,
        s * halfW * 0.68,
        y,
        z - 0.045,
        T({ rx: PI / 2, seg: 9, color: 0xd8d8b8, ao: [1, 1], grime: 0.3 }),
      );
    }
  }
  function grille(k, halfW, y, z, h) {
    k.box(
      "trim",
      halfW * 1.25,
      h,
      0.05,
      0,
      y,
      z,
      T({ color: 0x151412, ao: [1, 1] }),
    );
    for (let i = 0; i < 6; i++)
      k.box(
        "trim",
        0.03,
        h,
        0.07,
        -halfW * 0.6 + (i * halfW * 1.2) / 5,
        y,
        z - 0.01,
        T({ color: C.chrome, ao: [1, 1] }),
      );
    k.box(
      "trim",
      halfW * 1.3,
      0.04,
      0.08,
      0,
      y + h / 2,
      z - 0.01,
      T({ color: C.chrome, ao: [1, 1] }),
    );
  }
  function plate(k, y, z, rear) {
    k.quad("plate", 0.3, 0.15, 0, y, z, {
      mat: "trim",
      ry: rear ? 0 : PI,
      ao: [1, 1],
    });
  }
  function sideSpear(k, halfW, y, z0, z1) {
    for (const s of [-1, 1])
      k.box(
        "trim",
        0.02,
        0.035,
        z1 - z0,
        s * (halfW + 0.005),
        y,
        (z0 + z1) / 2,
        T({ color: C.chrome, ao: [1, 1] }),
      );
  }
  function mirror(k, halfW, y, z) {
    for (const s of [-1, 1]) {
      k.seg(
        "trim",
        [s * halfW * 0.92, y, z],
        [s * (halfW + 0.1), y + 0.1, z],
        0.012,
        T({ color: C.chrome }),
      );
      k.sphere(
        "trim",
        0.05,
        s * (halfW + 0.12),
        y + 0.12,
        z,
        T({ color: C.chrome, s: [0.6, 0.8, 1], wseg: 5, hseg: 3 }),
      );
    }
  }
  function roofFrom(stations, dy) {
    return stations
      .filter((s, i) => i > 0 && i < stations.length - 1)
      .map((s) => ({
        z: s.z,
        wb: s.wt + 0.015,
        wt: s.wt * 0.94,
        yb: s.yt - 0.05 + (dy || 0),
        yt: s.yt + 0.035 + (dy || 0),
        n: 4,
      }));
  }
  function shift(st, dy) {
    return st.map((s) =>
      Object.assign({}, s, { yb: s.yb + dy, yt: s.yt + dy }),
    );
  }

  /**
   * Gutted-wreck dressing (variant 2 of the sedans): bonnet propped open over a
   * rusted engine block, one door torn off (dark cavity + the door lying on the
   * ground beside the car), boot lid sprung. o: {hoodZ0, hoodZ1, hoodY, halfW,
   * doorZ0, doorZ1, trunkZ, trunkY, po (paint opts), dy}
   */
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
  D("car_pickup", (k, r, v) => {
    const stripped = v === 1,
      dy = stripped ? -0.14 : 0;
    const po = {
      tint: true,
      rust: 0.45 + r() * 0.25,
      color: 0xf0f0ec,
      seg: 16,
      ao: [0.55, 0.9],
    };
    k.loft("paint", shift(PICKUP_HOOD, dy), po);
    k.loft("paint", shift(PICKUP_CAB, dy), po);
    k.box("trim", 1.6, 0.6, 0.05, 0, 1.55 + dy, -0.98, GL({ rx: 0.1 }));
    for (const s of [-1, 1])
      k.box("trim", 0.05, 0.5, 0.9, s * 0.99, 1.55 + dy, -0.25, GL({}));
    // bed
    k.boxB("paint", 2.0, 0.08, 2.4, 0, 0.55 + dy, 1.65, po);
    for (const s of [-1, 1])
      k.boxB("paint", 0.07, 0.55, 2.4, s * 0.98, 0.6 + dy, 1.65, po);
    k.boxB("paint", 2.0, 0.55, 0.07, 0, 0.6 + dy, 2.84, po);
    // junk in the bed
    X.crate(k, r, (r() * 5) | 0, -0.4, 0.63 + dy, 1.5, r(), 0.8);
    k.torus(
      "trim",
      0.3,
      0.11,
      0.45,
      0.75 + dy,
      2.1,
      T({ rx: PI / 2, color: C.rubber, tseg: 12, rseg: 5 }),
    );
    headlights(k, 0.95, 0.9 + dy, -2.55);
    grille(k, 0.8, 0.75 + dy, -2.62, 0.25);
    bumper(k, 1.0, 0.5 + dy, -2.7, false);
    bumper(k, 1.0, 0.5 + dy, 2.92, false);
    for (const wz of [-1.75, 1.8])
      for (const s of [-1, 1]) wheel(k, s * 0.88, 0.4, wz, 0.4, s, stripped);
    k.meta.size = [2.05, 5.7, 1.95 + dy];
  });

  // ------------------------------------------------------------------
  // CAR MANAGER
  // ------------------------------------------------------------------
  const KINDS = {
    sedan: { proto: "car_sedan", hp: 70, radius: 7, dmg: 110 },
    coupe: { proto: "car_coupe", hp: 65, radius: 7, dmg: 110 },
    taxi: { proto: "car_taxi", hp: 70, radius: 7, dmg: 110 },
    police: { proto: "car_police", hp: 80, radius: 7, dmg: 110 },
    van: { proto: "car_van", hp: 90, radius: 7.5, dmg: 120 },
    bus: { proto: "car_bus", hp: 160, radius: 9, dmg: 150 },
    fizzo_truck: { proto: "car_fizzo_truck", hp: 140, radius: 9, dmg: 150 },
    pickup: { proto: "car_pickup", hp: 80, radius: 7, dmg: 110 },
  };
  X.CAR_KINDS = KINDS;
  /** Canonical car kind ('truck' → the delivery truck); unknown → null. */
  X.carKind = function (kind) {
    if (kind === "truck" || kind === "delivery") return "fizzo_truck";
    return KINDS[kind] ? kind : null;
  };
  const GUTTABLE = { sedan: 1, coupe: 1, taxi: 1, police: 1 };
  // far-LOD twins don't model the sag of a stripped wreck → drop them by the same amount
  const LO_DY = { bus: -0.2, fizzo_truck: -0.18 };
  // models whose livery is baked into vertex colours (instance tint only fades them)
  const LIVERY = { taxi: 1, police: 1, bus: 1, fizzo_truck: 1 };
  // faded 1950s paint colours
  const PAINTS = [
    0x7ab8b0, 0xa8c8a0, 0xe0d0a8, 0xd89080, 0xd8c070, 0x90a8c8, 0x8a3a3a,
    0xd8d4c8, 0x3a3a3a, 0xa84038, 0x6a7a5a, 0x5a6a8a, 0xc8a8c0, 0x4a7a7a,
  ];
  X.randomPaint = function (r) {
    const c = new THREE.Color(PAINTS[(r() * PAINTS.length) | 0]);
    const f = 0.72 + r() * 0.25;
    return c.multiplyScalar(f);
  };
  const BURNT_PAINT = new THREE.Color(0.11, 0.095, 0.085),
    BURNT_TRIM = new THREE.Color(0.24, 0.21, 0.19);
  const WHITE = new THREE.Color(1, 1, 1);
  const CHUNK = 400;

  const CARS = (X.CARS = {
    list: [],
    pools: new Map(),
    grid: new Map(),
    built: false,
    active: new Set(),
    byId: new Map(),
  });

  /** Queue a car during init (before build) or add a dynamic one after. */
  X.addCar = function (kind, x, z, yaw, o) {
    o = o || {};
    kind = X.carKind(kind) || "sedan";
    const K = KINDS[kind];
    // every model has a stripped-on-rims variant (1); the sedans also have a gutted wreck (2)
    const variant =
      o.wreck && GUTTABLE[kind] ? 2 : o.stripped || o.wreck ? 1 : 0;
    const pr = X.proto(K.proto, variant);
    const size = pr.meta.size || [2, 5, 1.5];
    const car = {
      id: o.id || "car_" + Math.round(x * 10) + "_" + Math.round(z * 10),
      kind,
      K,
      pr,
      x,
      z,
      y: o.y !== undefined ? o.y : X.ground(x, z),
      yaw: yaw || 0,
      pitch: o.pitch || 0,
      roll: o.roll || 0,
      paint: o.tint
        ? X.color(o.tint)
        : o.paint ||
          (LIVERY[kind]
            ? new THREE.Color(1, 1, 1).multiplyScalar(
                0.72 + U.hash2(x | 0, z | 0) * 0.25,
              )
            : X.randomPaint(U.rng(U.hashStr(kind + x + "," + z)))),
      hp: K.hp * (o.hpMul || 1),
      maxHp: K.hp,
      state: o.burnt ? "burnt" : "intact",
      size,
      fuse: 0,
      anim: null,
      fire: null,
      smoke: null,
      collider: null,
      far: null,
      near: null,
      persistent: !!o.persistent || !X._initDone,
      explodable: o.explodable !== false,
      startBurnt: !!o.burnt,
      baseRoll: o.roll || 0,
      basePitch: o.pitch || 0,
    };
    if (CARS.byId.has(car.id)) car.id += "_" + CARS.list.length;
    CARS.list.push(car);
    CARS.byId.set(car.id, car);
    // grid for damage lookups
    const gk = Math.floor(x / 20) + "," + Math.floor(z / 20);
    if (!CARS.grid.has(gk)) CARS.grid.set(gk, []);
    CARS.grid.get(gk).push(car);
    // collider (walkable roof)
    const cosy = Math.cos(car.yaw),
      siny = Math.sin(car.yaw);
    if (o.onSide) {
      // tipped onto its side: roll ±90° about the long axis, lifted by half the width;
      // the footprint shifts sideways by half the (old) height
      const sd = o.onSide > 0 ? 1 : -1;
      car.roll = car.baseRoll = (sd * Math.PI) / 2 + (car.roll || 0) * 0.3;
      car.y += size[0] / 2 - 0.04;
      const off = (-sd * size[2]) / 2;
      car.collider = G.world.addCollider(
        x + off * cosy,
        z - off * siny,
        size[2] * 0.95,
        size[1] * 0.96,
        car.y - size[0] / 2,
        car.y + size[0] / 2,
        car.yaw,
        { tag: "prop_car", surface: "metal", data: { car } },
      );
    } else {
      if (o.flipped) {
        car.roll = car.baseRoll = Math.PI + (car.roll || 0);
        car.y += size[2] * 0.97;
      }
      const cy0 = o.flipped ? car.y - size[2] : car.y;
      car.collider = G.world.addCollider(
        x,
        z,
        size[0] * 0.95,
        size[1] * 0.96,
        cy0,
        cy0 + size[2] * (car.roll && !o.flipped ? 0.85 : 1),
        car.yaw,
        { tag: "prop_car", surface: "metal", data: { car } },
      );
    }
    if (CARS.built) placeDynamic(car);
    return car;
  };

  const _m = new THREE.Matrix4(),
    _q = new THREE.Quaternion(),
    _e = new THREE.Euler(),
    _p = new THREE.Vector3(),
    _s = new THREE.Vector3(1, 1, 1);
  function carMatrix(car, extraY, extraRoll, extraPitch) {
    _e.set(
      (car.pitch || 0) + (extraPitch || 0),
      car.yaw,
      (car.roll || 0) + (extraRoll || 0),
      "YXZ",
    );
    _q.setFromEuler(_e);
    _p.set(car.x, car.y + (extraY || 0), car.z);
    return _m.compose(_p, _q, _s);
  }
  // ------------------------------------------------------------------
  // ONE material per car: paint + chrome + rubber + glass + livery decals
  // share a single draw call. Per-vertex attribute cm = (tintMask,
  // roughness, metalness); uvg = grime-texture UV for painted panels (the
  // atlas UV of painted verts points at the white texel). Instance colour
  // = paint colour; a NEGATIVE instance colour means "burnt": paint gets
  // |colour|, chrome/glass/rubber get darkened to charred grey.
  // ------------------------------------------------------------------
  let CAR_MAT = null;
  X.carMaterial = function () {
    if (CAR_MAT) return CAR_MAT;
    const m = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: X.atlasTexture(),
      roughness: 0.5,
      metalness: 0.3,
    });
    const grime = X.ownTex("grime");
    m.onBeforeCompile = (sh) => {
      sh.uniforms.grimeMap = { value: grime };
      sh.vertexShader =
        "attribute vec3 cm;\nattribute vec2 uvg;\nvarying vec3 vCm;\nvarying vec2 vUvG;\n" +
        sh.vertexShader.replace(
          "#include <color_vertex>",
          [
            "vColor = vec3(1.0);",
            "#ifdef USE_COLOR",
            " vColor *= color;",
            "#endif",
            "#ifdef USE_INSTANCING_COLOR",
            " vec3 icol = instanceColor.xyz; float trimK = 1.0;",
            " if (icol.r < 0.0) { icol = -icol; trimK = 0.22; }",
            " vColor.xyz *= mix(vec3(trimK), icol, cm.x);",
            "#endif",
            "vCm = cm; vUvG = uvg;",
          ].join("\n"),
        );
      sh.fragmentShader =
        "uniform sampler2D grimeMap;\nvarying vec3 vCm;\nvarying vec2 vUvG;\n" +
        sh.fragmentShader
          .replace(
            "#include <map_fragment>",
            "#include <map_fragment>\n{ vec3 gc = texture2D(grimeMap, vUvG).rgb; diffuseColor.rgb *= mix(vec3(1.0), gc * gc, vCm.x); }",
          )
          .replace(
            "#include <metalnessmap_fragment>",
            "#include <metalnessmap_fragment>\nroughnessFactor = vCm.y; metalnessFactor = vCm.z;",
          );
    };
    m.customProgramCacheKey = () => "props_car_v1";
    m.name = "props_car";
    m.userData.shared = true;
    CAR_MAT = m;
    return m;
  };
  /** PBR guess for trim vertices from their baked colour: chrome, rubber, glass, rust, lamps. */
  function trimPBR(r, g, b, atlasUV) {
    if (atlasUV) return [0.6, 0.12]; // printed livery / plates / signs
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b,
      mx = Math.max(r, g, b),
      mn = Math.min(r, g, b);
    const sat = mx > 0 ? (mx - mn) / mx : 0;
    if (lum < 0.011) return [0.92, 0.0]; // tyres, wheel wells, grille holes
    if (lum < 0.07 && sat < 0.45 && b >= r * 0.9) return [0.14, 0.35]; // dark window glass
    if (lum > 0.25 && sat < 0.18) return [0.26, 0.85]; // chrome
    if (r > g * 1.25 && g > b && lum < 0.2) return [0.88, 0.25]; // rust
    return [0.42, 0.2]; // lamps, lenses, misc paint
  }
  /** Merge a car prototype's parts into one geometry with cm/uvg attributes (cached on the proto). */
  function carGeo(pr) {
    if (pr._carGeo) return pr._carGeo;
    const W = X.atlasRegion("white"),
      wu = (W.u0 + W.u1) / 2,
      wv = (W.v0 + W.v1) / 2;
    let vc = 0,
      ic = 0;
    for (const part of pr.parts) {
      const g = part.geom;
      vc += g.attributes.position.count;
      ic += g.index ? g.index.count : g.attributes.position.count;
    }
    const pos = new Float32Array(vc * 3),
      nor = new Float32Array(vc * 3),
      uv = new Float32Array(vc * 2),
      col = new Float32Array(vc * 3);
    const cm = new Float32Array(vc * 3),
      uvg = new Float32Array(vc * 2),
      idx = new Uint32Array(ic);
    let vo = 0,
      io = 0;
    for (const part of pr.parts) {
      const g = part.geom,
        n = g.attributes.position.count,
        gu = g.attributes.uv,
        gc = g.attributes.color;
      pos.set(g.attributes.position.array, vo * 3);
      nor.set(g.attributes.normal.array, vo * 3);
      col.set(gc.array, vo * 3);
      const paint = part.mat === "paint",
        keepUV =
          part.mat === "trim" || part.mat === "atlas" || part.mat === "screen";
      for (let i = 0; i < n; i++) {
        const k = vo + i,
          u = gu.array[i * 2],
          v = gu.array[i * 2 + 1];
        if (paint) {
          uv[k * 2] = wu;
          uv[k * 2 + 1] = wv;
          uvg[k * 2] = u;
          uvg[k * 2 + 1] = v;
          cm[k * 3] = part.tint ? 1 : 0;
          cm[k * 3 + 1] = 0.52;
          cm[k * 3 + 2] = 0.3;
          continue;
        }
        const atl =
          keepUV && (Math.abs(u - wu) > 0.002 || Math.abs(v - wv) > 0.002);
        uv[k * 2] = keepUV ? u : wu;
        uv[k * 2 + 1] = keepUV ? v : wv;
        const pb = trimPBR(
          gc.array[i * 3],
          gc.array[i * 3 + 1],
          gc.array[i * 3 + 2],
          atl,
        );
        cm[k * 3] = 0;
        cm[k * 3 + 1] = pb[0];
        cm[k * 3 + 2] = pb[1];
      }
      if (g.index) {
        const ia = g.index.array;
        for (let i = 0; i < ia.length; i++) idx[io++] = ia[i] + vo;
      } else for (let i = 0; i < n; i++) idx[io++] = i + vo;
      vo += n;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("cm", new THREE.BufferAttribute(cm, 3));
    geo.setAttribute("uvg", new THREE.BufferAttribute(uvg, 2));
    geo.setIndex(
      new THREE.BufferAttribute(vc > 65535 ? idx : new Uint16Array(idx), 1),
    );
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    pr._carGeo = geo;
    return geo;
  }
  X.carGeo = carGeo;
  function makePool(pr, capacity, name) {
    const m = new THREE.InstancedMesh(carGeo(pr), X.carMaterial(), capacity);
    m.name = name;
    m.castShadow = true;
    m.receiveShadow = true;
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < capacity; i++) {
      m.setMatrixAt(i, ZERO);
      m.setColorAt(i, WHITE);
    }
    m.count = 0;
    return { pr, mesh: m, meshes: { car: m }, capacity, n: 0 };
  }
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const _burnt = new THREE.Color();
  function writeSlot(slot, m, car, hidden) {
    const mesh = slot.pool.mesh;
    mesh.setMatrixAt(slot.i, hidden ? ZERO : m);
    if (car.state === "burnt")
      mesh.setColorAt(
        slot.i,
        _burnt.setRGB(-BURNT_PAINT.r, -BURNT_PAINT.g, -BURNT_PAINT.b),
      );
    else mesh.setColorAt(slot.i, car.paint);
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
  /**
   * Two representations per car: a low-detail instance in its chunk pool
   * ("far") and — while within NEAR_R of the camera — a full-detail instance
   * in a small shared pool ("near"). Only one is visible at a time.
   */
  /**
   * Three representations per car, only one visible at a time:
   *   near (≤ NEAR_R): full-detail model in a small shared pool per prototype (+ shadows)
   *   mid  (≤ MID_R):  ~320-tri twin in a shared pool per kind
   *   far:             ~90-tri twin in its 400 m chunk pool (always allocated; zero-scaled while near/mid)
   * Pools are re-assigned 5×/s around the camera.
   */
  function writeInstance(car) {
    const a = car.anim;
    const m = carMatrix(car, a ? a.y : 0, a ? a.roll : 0, a ? a.pitch : 0);
    if (car.near) writeSlot(car.near, m, car, car.removed);
    if (car.loDy) m.elements[13] += car.loDy;
    if (car.mid) writeSlot(car.mid, m, car, car.removed);
    if (car.far)
      writeSlot(car.far, m, car, car.removed || !!car.near || !!car.mid);
    if (car.loDy) m.elements[13] -= car.loDy;
  }
  X.writeCar = writeInstance;
  function farProto(car) {
    return X.proto("carvlo_" + car.kind, 0);
  }

  /** Build instanced meshes for all queued cars (called once in init). */
  X.buildCars = function (parent) {
    const root = new THREE.Group();
    root.name = "props_cars";
    parent.add(root);
    CARS.root = root;
    const buckets = new Map();
    for (const car of CARS.list) {
      if (car.removed) continue; // towed away before the build (Army posts): no instance slot
      car.loDy = car.pr.variant >= 1 ? LO_DY[car.kind] || -0.14 : 0;
      const key =
        Math.floor(car.x / CHUNK) +
        "," +
        Math.floor(car.z / CHUNK) +
        "|" +
        car.kind;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(car);
    }
    const chunkGroups = new Map();
    for (const [key, cars] of buckets) {
      const ck = key.split("|")[0];
      let cg = chunkGroups.get(ck);
      if (!cg) {
        cg = new THREE.Group();
        cg.name = "props_cars_" + ck;
        root.add(cg);
        chunkGroups.set(ck, cg);
        const [cx, cz] = ck.split(",").map(Number);
        G.world.addLOD(
          cg,
          380 + CHUNK * 0.7,
          new THREE.Vector3((cx + 0.5) * CHUNK, 0, (cz + 0.5) * CHUNK),
        );
      }
      const pool = makePool(farProto(cars[0]), cars.length, "cars_" + key);
      for (const car of cars) car.far = { pool, i: pool.n++ };
      pool.mesh.count = pool.n;
      pool.mesh.castShadow = false;
      cg.add(pool.mesh);
      for (const car of cars) writeInstance(car);
      pool.mesh.computeBoundingSphere();
    }
    CARS.built = true;
    CARS.dynPools = new Map();
    CARS.nearPools = new Map();
    CARS.midPools = new Map();
  };
  function placeDynamic(car) {
    car.loDy = car.pr.variant >= 1 ? LO_DY[car.kind] || -0.14 : 0;
    const fp = farProto(car);
    let pool = CARS.dynPools.get(fp.id);
    if (!pool || pool.n >= pool.capacity) {
      pool = makePool(fp, 24, "cars_dyn_" + fp.id);
      pool.mesh.frustumCulled = false;
      pool.mesh.castShadow = false;
      CARS.root.add(pool.mesh);
      CARS.dynPools.set(fp.id, pool);
    }
    car.far = { pool, i: pool.n++ };
    pool.mesh.count = pool.n;
    writeInstance(car);
    CARS.nearDirty = true;
  }
  // ---------------- near / mid pool management ----------------
  const NEAR_R = 42,
    NEAR_CAP = 24,
    MID_R = 135,
    MID_CAP = 110;
  let nearTimer = 0;
  const _cp = new THREE.Vector3();
  function sharedPool(map, pr, cap, name, shadow) {
    let pool = map.get(pr.id);
    if (!pool) {
      pool = makePool(pr, cap, name + pr.id);
      pool.mesh.frustumCulled = false;
      pool.mesh.castShadow = shadow;
      CARS.root.add(pool.mesh);
      map.set(pr.id, pool);
    }
    return pool;
  }
  X.updateNearCars = function (realDt) {
    if (!CARS.built) return;
    nearTimer -= realDt;
    if (nearTimer > 0 && !CARS.nearDirty) return;
    nearTimer = 0.2;
    CARS.nearDirty = false;
    G.camera.getWorldPosition(_cp);
    const cand = [];
    const R = MID_R;
    const x0 = Math.floor((_cp.x - R) / 20),
      x1 = Math.floor((_cp.x + R) / 20),
      z0 = Math.floor((_cp.z - R) / 20),
      z1 = Math.floor((_cp.z + R) / 20);
    for (let gx = x0; gx <= x1; gx++)
      for (let gz = z0; gz <= z1; gz++) {
        const arr = CARS.grid.get(gx + "," + gz);
        if (!arr) continue;
        for (const car of arr) {
          if (car.removed) continue;
          const d = Math.hypot(car.x - _cp.x, car.z - _cp.z);
          if (d < R) cand.push({ car, d });
        }
      }
    cand.sort((a, b) => a.d - b.d);
    for (const pool of CARS.nearPools.values()) pool.n = 0;
    for (const pool of CARS.midPools.values()) pool.n = 0;
    const was = CARS.nearSet || new Set(),
      now = new Set();
    for (const { car, d } of cand) {
      car.near = null;
      car.mid = null;
      if (d < NEAR_R) {
        const pool = sharedPool(
          CARS.nearPools,
          car.pr,
          NEAR_CAP,
          "cars_near_",
          true,
        );
        if (pool.n < pool.capacity) {
          car.near = { pool, i: pool.n++ };
          now.add(car);
          continue;
        }
      }
      const pool = sharedPool(
        CARS.midPools,
        X.proto("carlo_" + car.kind, 0),
        MID_CAP,
        "cars_mid_",
        false,
      );
      if (pool.n < pool.capacity) {
        car.mid = { pool, i: pool.n++ };
        now.add(car);
      }
    }
    for (const car of was)
      if (!now.has(car)) {
        car.near = null;
        car.mid = null;
        writeInstance(car);
      }
    for (const car of now) writeInstance(car);
    for (const pool of CARS.nearPools.values()) pool.mesh.count = pool.n;
    for (const pool of CARS.midPools.values()) pool.mesh.count = pool.n;
    CARS.nearSet = now;
  };
  /** Hide a car (removes collider) — used for session-scoped spawned cars on reset. */
  X.removeCar = function (car) {
    if (car.collider) {
      G.world.removeCollider(car.collider);
      car.collider = null;
    }
    stopCarFx(car);
    car.removed = true;
    writeInstance(car);
    CARS.nearDirty = true;
    CARS.active.delete(car);
    const gk = Math.floor(car.x / 20) + "," + Math.floor(car.z / 20);
    const arr = CARS.grid.get(gk);
    if (arr) {
      const i = arr.indexOf(car);
      if (i >= 0) arr.splice(i, 1);
    }
    CARS.byId.delete(car.id);
  };

  /** Cars whose footprint is within r of p. */
  X.carsNear = function (p, r) {
    const out = [];
    const x0 = Math.floor((p.x - r - 6) / 20),
      x1 = Math.floor((p.x + r + 6) / 20),
      z0 = Math.floor((p.z - r - 6) / 20),
      z1 = Math.floor((p.z + r + 6) / 20);
    for (let gx = x0; gx <= x1; gx++)
      for (let gz = z0; gz <= z1; gz++) {
        const arr = CARS.grid.get(gx + "," + gz);
        if (!arr) continue;
        for (const car of arr) {
          if (car.removed) continue;
          // distance from p to the car's oriented footprint
          const dx = p.x - car.x,
            dz = p.z - car.z,
            c = Math.cos(-car.yaw),
            s = Math.sin(-car.yaw);
          const lx = dx * c - dz * s,
            lz = dx * s + dz * c;
          const qx = Math.max(0, Math.abs(lx) - car.size[0] / 2),
            qz = Math.max(0, Math.abs(lz) - car.size[1] / 2);
          const dy = Math.max(
            0,
            (p.y !== undefined ? p.y : car.y) - (car.y + car.size[2]),
            car.y - (p.y !== undefined ? p.y : car.y),
          );
          const d = Math.hypot(qx, qz, dy);
          if (d <= r) out.push({ car, d });
        }
      }
    return out;
  };

  // ------------------------------------------------------------------
  // Damage → fire → explosion
  // ------------------------------------------------------------------
  X.damageCar = function (car, dmg, info) {
    if (!car || car.removed || car.state === "burnt" || !car.explodable)
      return false;
    car.hp -= dmg;
    // hit feedback: sparks on metal
    if (car.state === "intact" && car.hp < car.maxHp * 0.5 && !car.smoke) {
      car.smoke = X.flames
        ? X.flames.add(
            car.x + Math.sin(car.yaw) * -car.size[1] * 0.35,
            car.y + car.size[2] * 0.7,
            car.z + Math.cos(car.yaw) * -car.size[1] * 0.35,
            0.6,
            { flames: 0, smokeCount: 5, smokeScale: 0.6 },
          )
        : null;
    }
    if (car.hp <= 0 && car.state === "intact") {
      car.state = "burning";
      car.fuse = info && info.instant ? 0.15 : 2.5 + Math.random() * 2.5;
      const fp = carPoint(car, 0, 0.75, -car.size[1] * 0.33);
      car.fire = X.flames
        ? X.flames.add(fp.x, fp.y, fp.z, 1.1, { flames: 10, smokeCount: 6 })
        : null;
      car.fireGlow = X.glow
        ? X.glow.add(fp.x, fp.y + 0.6, fp.z, 0xff8a3a, 6, 0.3)
        : -1;
      car.sound = X.sfx("fire_loop", { pos: fp, loop: true, volume: 0.8 });
      X.sfx("caution", { pos: fp, volume: 0.6 });
      CARS.active.add(car);
    }
    return true;
  };
  /** local (lx metres, lyFrac of height, lz metres; -z = front) → world */
  function carPoint(car, lx, ly, lz) {
    const c = Math.cos(car.yaw),
      s = Math.sin(car.yaw);
    return new THREE.Vector3(
      car.x + lx * c + lz * s,
      car.y + ly * car.size[2],
      car.z - lx * s + lz * c,
    );
  }
  X.carPoint = carPoint;
  function stopCarFx(car) {
    if (car.fire && car.fire.stop) car.fire.stop();
    if (car.smoke && car.smoke.stop) car.smoke.stop();
    if (car.fireGlow >= 0 && X.glow) X.glow.remove(car.fireGlow);
    if (car.sound && car.sound.stop)
      try {
        car.sound.stop();
      } catch (e) {
        /* ignore */
      }
    car.fire = car.smoke = car.sound = null;
    car.fireGlow = -1;
  }
  function explodeCar(car) {
    stopCarFx(car);
    car.state = "burnt";
    car.exploded = true;
    const c = new THREE.Vector3(car.x, car.y + car.size[2] * 0.6, car.z);
    const K = car.K;
    X.explosion(c, K.radius, K.dmg, {
      source: "car",
      kind: "normal",
      big: true,
    });
    // launch animation
    car.anim = {
      t: 0,
      vy: 5.5 + Math.random() * 2.5,
      y: 0,
      roll: 0,
      pitch: 0,
      vr: (Math.random() - 0.5) * 1.6,
      vp: (Math.random() - 0.5) * 1.2,
      restRoll: (Math.random() - 0.5) * 0.12,
      restPitch: (Math.random() - 0.5) * 0.08,
    };
    // lingering wreck fire + smoke column
    car.fire = X.flames
      ? X.flames.add(car.x, car.y + car.size[2] * 0.55, car.z, 1.5, {
          flames: 14,
          smokeCount: 8,
          smokeScale: 1.4,
          smokeHeight: 1.6,
          spread: 2.2,
        })
      : null;
    car.fireGlow = X.glow
      ? X.glow.add(car.x, car.y + car.size[2] + 0.5, car.z, 0xff7a2a, 9, 0.35)
      : -1;
    car.burnT = 22 + Math.random() * 10;
    car.sound = X.sfx("fire_loop", { pos: c, loop: true, volume: 0.9 });
    // lingering radiation from the ruptured micro-fusion cell
    car.radSrc = G.world.addRadSource({
      x: car.x,
      y: car.y + 1,
      z: car.z,
      radius: 7,
      strength: 2.2,
    });
    car.radT = 60;
    writeInstance(car);
    G.emit("propExploded", { type: "car", kind: car.kind, id: car.id, pos: c });
  }
  X.explodeCar = explodeCar;

  /** Per-frame car simulation (fuses, launch animation, wreck fires). */
  X.updateCars = function (dt) {
    if (!CARS.active.size) return;
    for (const car of Array.from(CARS.active)) {
      if (car.removed) {
        CARS.active.delete(car);
        continue;
      }
      if (car.state === "burning") {
        car.fuse -= dt;
        if (car.fuse <= 0) explodeCar(car);
        continue;
      }
      if (car.anim) {
        const a = car.anim;
        a.t += dt;
        a.vy -= 19 * dt;
        a.y += a.vy * dt;
        a.roll += a.vr * dt;
        a.pitch += a.vp * dt;
        if (a.y <= 0 && a.vy < 0) {
          if (Math.abs(a.vy) > 3) {
            a.vy = -a.vy * 0.25;
            a.vr *= 0.3;
            a.vp *= 0.3;
            X.sfx("land", {
              pos: new THREE.Vector3(car.x, car.y, car.z),
              volume: 1,
            });
          } else {
            a.y = 0;
            car.roll = (car.roll || 0) + a.restRoll;
            car.pitch = (car.pitch || 0) + a.restPitch;
            car.anim = null;
          }
        }
        writeInstance(car);
      }
      if (car.burnT !== undefined) {
        car.burnT -= dt;
        if (car.fire && car.burnT < 8 && car.fire.setScale)
          car.fire.setScale(Math.max(0.01, (1.5 * car.burnT) / 8));
        if (car.burnT <= 0) {
          stopCarFx(car);
          car.burnT = undefined;
        }
      }
      if (car.radSrc) {
        car.radT -= dt;
        if (car.radT <= 0) {
          G.world.removeRadSource(car.radSrc);
          car.radSrc = null;
        }
      }
      if (!car.anim && car.burnT === undefined && !car.radSrc)
        CARS.active.delete(car);
    }
  };
  /** Reset all cars (new game): un-burn, restore hp, stop fx. Burnt-at-start cars stay burnt. */
  X.resetCars = function () {
    for (const car of CARS.list) {
      if (car.removed) continue;
      stopCarFx(car);
      if (car.radSrc) {
        G.world.removeRadSource(car.radSrc);
        car.radSrc = null;
      }
      car.anim = null;
      car.burnT = undefined;
      car.state = car.startBurnt ? "burnt" : "intact";
      car.hp = car.maxHp;
      car.exploded = false;
      car.roll = car.baseRoll;
      car.pitch = car.basePitch;
      writeInstance(car);
    }
    CARS.active.clear();
  };
})();
