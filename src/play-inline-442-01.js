// play-inline-442 01 — assign
// Lines 13-346 of readable/play-inline-442.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;

  // ---------------- fire hydrant ----------------
  D("hydrant", (k, r, v) => {
    const col = v === 1 ? C.hydrantYellow : v === 2 ? 0x8a8a84 : C.hydrantRed;
    const o = { color: col, rust: 0.35 + r() * 0.3, flat: false };
    k.cyl(
      "metal",
      0.17,
      0.19,
      0.07,
      0,
      0.035,
      0,
      Object.assign({ seg: 12 }, o),
    );
    k.cyl(
      "metal",
      0.125,
      0.135,
      0.5,
      0,
      0.32,
      0,
      Object.assign({ seg: 12 }, o),
    );
    k.cyl(
      "metal",
      0.145,
      0.145,
      0.05,
      0,
      0.58,
      0,
      Object.assign({ seg: 12 }, o),
    );
    k.sphere(
      "metal",
      0.13,
      0,
      0.6,
      0,
      Object.assign({ phiLength: PI / 2, wseg: 12, hseg: 5 }, o),
    );
    k.cyl(
      "metal",
      0.035,
      0.045,
      0.08,
      0,
      0.76,
      0,
      Object.assign({ seg: 5 }, o),
    );
    // side hose nozzles + covers (chains hang off them)
    for (const s of [-1, 1]) {
      k.cyl(
        "metal",
        0.05,
        0.05,
        0.12,
        s * 0.16,
        0.44,
        0,
        Object.assign({ rz: PI / 2, seg: 8 }, o),
      );
      k.cyl(
        "metal",
        0.058,
        0.058,
        0.04,
        s * 0.23,
        0.44,
        0,
        Object.assign({ rz: PI / 2, seg: 6 }, o),
      );
    }
    // big pumper nozzle facing the street
    k.cyl(
      "metal",
      0.075,
      0.075,
      0.12,
      0,
      0.42,
      -0.16,
      Object.assign({ rx: PI / 2, seg: 8 }, o),
    );
    k.cyl(
      "metal",
      0.085,
      0.085,
      0.05,
      0,
      0.42,
      -0.24,
      Object.assign({ rx: PI / 2, seg: 6 }, o),
    );
    k.meta.collider = { w: 0.36, d: 0.36, h: 0.8 };
    k.meta.tier = "small";
  });

  // ---------------- lamp post (NYC cobra-head / "bishop crook") ----------------
  // variant 0 dead, 1 lit (flicker), 2 bent & dead, 3 lit steady (settlement)
  D("lamp_post", (k, r, v) => {
    const col = C.lampGreen,
      o = { color: col, rust: 0.25 + r() * 0.3, flat: false };
    // fluted cast-iron base
    k.cyl("metal", 0.2, 0.26, 0.35, 0, 0.175, 0, Object.assign({ seg: 10 }, o));
    k.cyl("metal", 0.16, 0.2, 0.9, 0, 0.8, 0, Object.assign({ seg: 10 }, o));
    k.torus(
      "metal",
      0.17,
      0.035,
      0,
      1.25,
      0,
      Object.assign({ rx: PI / 2, tseg: 10, rseg: 4 }, o),
    );
    const bent = v === 2;
    // pole shaft (tapered); bent variant kinks at 3.5 m
    if (!bent) {
      k.cyl(
        "metal",
        0.075,
        0.12,
        6.2,
        0,
        4.35,
        0,
        Object.assign({ seg: 8 }, o),
      );
    } else {
      k.cyl("metal", 0.1, 0.12, 2.4, 0, 2.45, 0, Object.assign({ seg: 8 }, o));
      k.seg(
        "metal",
        [0, 3.6, 0],
        [0.4, 5.6, -2.4],
        0.09,
        Object.assign({ seg: 8 }, o),
      );
    }
    // arm over the road (toward -z)
    const top = bent ? [0.4, 5.6, -2.4] : [0, 7.4, 0];
    const armPts = bent
      ? [
          [0.4, 5.6, -2.4],
          [0.5, 5.2, -3.2],
          [0.55, 4.5, -3.6],
        ]
      : [
          [0, 7.3, 0],
          [0, 7.7, -0.4],
          [0, 7.85, -1.1],
          [0, 7.8, -1.8],
        ];
    for (let i = 0; i < armPts.length - 1; i++)
      k.seg(
        "metal",
        armPts[i],
        armPts[i + 1],
        0.055,
        Object.assign({ seg: 6 }, o),
      );
    const hp = armPts[armPts.length - 1];
    // cobra head luminaire
    k.sphere(
      "metal",
      0.34,
      hp[0],
      hp[1] - 0.02,
      hp[2] - 0.22,
      Object.assign({ s: [0.7, 0.32, 1.25], wseg: 10, hseg: 6 }, o),
    );
    const lit = v === 1 || v === 3;
    k.sphere(lit ? "glow" : "glass", 0.2, hp[0], hp[1] - 0.1, hp[2] - 0.24, {
      s: [0.9, 0.35, 1.3],
      color: lit ? C.bulbWarm : 0x5a6058,
      wseg: 8,
      hseg: 4,
      ao: [1, 1],
      grime: lit ? 0 : 0.2,
    });
    if (lit)
      (k.meta.glows = k.meta.glows || []).push({
        x: hp[0],
        y: hp[1] - 0.25,
        z: hp[2] - 0.24,
        color: 0xffcf80,
        size: 5,
        flicker: v === 1 ? 0.7 : 0,
      });
    // little decorative finial on top of the pole
    k.sphere(
      "metal",
      0.08,
      top[0],
      top[1] + 0.1,
      top[2],
      Object.assign({ wseg: 6, hseg: 4 }, o),
    );
    // posted flyer + "no parking" sign on the pole
    if (r() < 0.6)
      k.quad(
        r() < 0.5 ? "no_parking" : X.POSTERS[(r() * X.POSTERS.length) | 0],
        0.32,
        0.46,
        0,
        2.2,
        -0.13,
        { ry: PI, color: 0xdddddd },
      );
    k.meta.collider = { w: 0.5, d: 0.5, h: 3 };
    k.meta.tier = "medium";
  });

  // ---------------- traffic signal ----------------
  function signalHead(k, x, y, z, ry, o) {
    const oo = Object.assign({ ry }, o);
    const h = new X.Kit(3);
    h.cbox(
      "metal",
      0.36,
      1.05,
      0.28,
      0,
      0,
      0,
      Object.assign({ bevel: 0.04 }, o),
    );
    const cols = [0x5a1810, 0x5a4a10, 0x10401a];
    for (let i = 0; i < 3; i++) {
      h.cyl("plain", 0.11, 0.11, 0.04, 0, 0.32 - i * 0.32, -0.15, {
        rx: PI / 2,
        seg: 10,
        color: cols[i],
        ao: [1, 1],
        grime: 0.05,
      });
      h.cyl(
        "metal",
        0.14,
        0.14,
        0.18,
        0,
        0.36 - i * 0.32,
        -0.2,
        Object.assign(
          {
            rx: PI / 2,
            seg: 8,
            open: true,
            thetaStart: -PI / 2,
            thetaLength: PI,
          },
          o,
        ),
      );
    }
    k.include(h, oo.ry !== undefined ? { x, y, z, ry: oo.ry } : { x, y, z });
  }
  D("traffic_light", (k, r, v) => {
    const o = { color: 0x3a3e30, rust: 0.3 + r() * 0.3 };
    const fallen = v === 1;
    const kk = fallen ? new X.Kit(9) : k;
    kk.cyl("metal", 0.14, 0.18, 0.5, 0, 0.25, 0, Object.assign({ seg: 10 }, o));
    kk.cyl("metal", 0.1, 0.13, 6, 0, 3.2, 0, Object.assign({ seg: 8 }, o));
    // mast arm toward the road with a hanging signal head
    kk.seg(
      "metal",
      [0, 5.8, 0],
      [0, 6.0, -5.5],
      0.07,
      Object.assign({ seg: 6 }, o),
    );
    kk.seg(
      "metal",
      [0, 5.2, 0],
      [0, 5.9, -2.2],
      0.04,
      Object.assign({ seg: 5 }, o),
    );
    signalHead(kk, 0, 5.3, -5.2, 0, o);
    signalHead(kk, 0, 5.4, -2.6, 0, o);
    // pole-mounted pedestrian signal + street box
    kk.cbox(
      "metal",
      0.3,
      0.35,
      0.22,
      0.2,
      2.6,
      0,
      Object.assign({ bevel: 0.03, ry: 0.4 }, o),
    );
    kk.quad("dark", 0.2, 0.2, 0.2 + Math.sin(0.4) * -0.12, 2.6, -0.12, {
      ry: 0.4 + PI,
      color: 0x884422,
    });
    kk.cbox(
      "metal",
      0.35,
      0.5,
      0.25,
      -0.2,
      1.1,
      0.05,
      Object.assign({ bevel: 0.03 }, o),
    );
    if (fallen) {
      // lying across the sidewalk/road, base snapped off
      k.include(kk, { x: -0.2, y: 0.2, z: 0, rz: PI / 2 - 0.02 });
      k.cyl(
        "metal",
        0.14,
        0.18,
        0.3,
        0.3,
        0.15,
        0,
        Object.assign({ seg: 10 }, o),
      );
      k.meta.collider = { w: 6, d: 0.6, h: 0.5, cx: -3 };
    } else k.meta.collider = { w: 0.4, d: 0.4, h: 3 };
    k.meta.tier = "medium";
  });

  // ---------------- U.S. mail drop box ----------------
