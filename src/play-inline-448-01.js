// play-inline-448 01 — halfw
// Lines 17-269 of readable/play-inline-448.pretty.js (statement-aligned).
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
