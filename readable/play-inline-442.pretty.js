/* src/props/20_street.js */
/* =====================================================================
 * props / 20_street.js — STREET FURNITURE prototypes.
 * Hydrants, NYC cobra-head lamp posts, traffic signals, U.S. mail boxes,
 * newspaper boxes, phone booths, benches, litter baskets, parking meters,
 * bus stops, sidewalk sheds & pipe scaffolding, sidewalk clocks, planters
 * with dead trees, grates, Fizzo Cola machines, Civil Defense kiosks,
 * billboard frames.
 * Convention: prop-local, y = 0 ground, local -Z = "front" (the side that
 * faces the street when placed on a sidewalk).
 * ===================================================================== */
(function () {
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
  D("mailbox", (k, r, v) => {
    const o = { color: C.mailBlue, rust: 0.2 + r() * 0.3 };
    const kk = v === 1 ? new X.Kit(5) : k;
    kk.boxB("metal", 0.54, 0.86, 0.5, 0, 0.18, 0, o);
    kk.cyl(
      "metal",
      0.25,
      0.25,
      0.54,
      0,
      1.04,
      0,
      Object.assign({ rz: PI / 2, seg: 12, thetaLength: PI, thetaStart: 0 }, o),
    );
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        kk.boxB("metal", 0.06, 0.18, 0.06, sx * 0.22, 0, sz * 0.2, o);
    kk.quad("mailbox", 0.46, 0.46, 0, 0.72, -0.253, { ry: PI });
    kk.box("metal", 0.36, 0.08, 0.08, 0, 1.0, -0.26, { color: 0x2a3a50 }); // pull-down chute handle
    kk.quad("mailbox", 0.4, 0.4, 0.273, 0.72, 0, { ry: PI / 2 });
    kk.quad("mailbox", 0.4, 0.4, -0.273, 0.72, 0, { ry: -PI / 2 });
    if (v === 1) {
      // knocked over, letters spilled
      k.include(kk, { y: 0.27, z: 0.2, rx: -PI / 2 });
      for (let i = 0; i < 7; i++)
        k.quad("paper", 0.14, 0.1, (r() - 0.5) * 0.9, 0.012, -0.9 - r() * 0.7, {
          rx: -PI / 2,
          rz: r() * 3,
          color: 0xe8e0d0,
        });
      k.meta.collider = { w: 0.6, d: 1.3, h: 0.55, cz: -0.35 };
    } else k.meta.collider = { w: 0.56, d: 0.52, h: 1.3 };
    k.meta.container = { name: "Mailbox", loot: "mailbox" };
    k.meta.tier = "small";
  });

  // ---------------- newspaper vending boxes ----------------
  D("newsbox", (k, r, v) => {
    const cols = [0xc8b048, 0x3a6ab0, 0xb03a2a];
    const o = { color: cols[v % 3], rust: 0.25 };
    k.boxB("metal", 0.1, 0.36, 0.1, 0, 0, 0, { color: 0x333333 });
    k.cbox(
      "metal",
      0.46,
      0.72,
      0.42,
      0,
      0.72,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.quad("news_" + (v % 3), 0.44, 0.56, 0, 0.72, -0.214, { ry: PI });
    k.box("metal", 0.48, 0.04, 0.44, 0, 1.1, 0, o);
    k.meta.tier = "small";
    k.meta.collider = { w: 0.46, d: 0.42, h: 1.1 };
  });

  // ---------------- phone booth ----------------
  D("phone_booth", (k, r, v) => {
    const o = { color: 0x8a8a80, rust: 0.35 };
    const W = 0.9,
      H = 2.25;
    k.boxB("concrete", W + 0.1, 0.08, W + 0.1, 0, 0, 0, { color: 0x9a968c });
    // corner posts
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB("metal", 0.07, H, 0.07, (sx * W) / 2, 0.08, (sz * W) / 2, o);
    // roof with sign band
    k.boxB("metal", W + 0.08, 0.3, W + 0.08, 0, H + 0.08, 0, o);
    k.cbox(
      "metal",
      W + 0.14,
      0.08,
      W + 0.14,
      0,
      H + 0.42,
      0,
      Object.assign({ bevel: 0.03 }, o),
    );
    for (let s = 0; s < 4; s++) {
      const a = (s * PI) / 2;
      k.quad(
        "phone_sign",
        W,
        0.16,
        -Math.sin(a) * (W / 2 + 0.045),
        H + 0.23,
        -Math.cos(a) * (W / 2 + 0.045),
        { ry: a + PI },
      );
    }
    // back wall panel + phone unit
    k.boxB("metal", W - 0.04, H - 0.1, 0.04, 0, 0.1, W / 2 - 0.02, o);
    k.cbox("metal", 0.26, 0.42, 0.14, 0, 1.35, W / 2 - 0.1, {
      color: 0x2a2a2a,
      bevel: 0.03,
    });
    k.box("plain", 0.2, 0.06, 0.06, 0.02, 1.12, W / 2 - 0.2, {
      color: 0x151515,
      rz: 0.4,
    }); // dangling handset
    k.seg("plain", [0, 1.2, W / 2 - 0.12], [0.02, 1.12, W / 2 - 0.2], 0.008, {
      color: 0x111111,
    });
    k.box("metal", 0.5, 0.03, 0.22, 0, 1.0, W / 2 - 0.12, o); // shelf / phone book
    // glass (some panes smashed)
    const panes = [
      [W / 2, 0, PI / 2],
      [-W / 2, 0, -PI / 2],
      [0, -W / 2, 0],
    ];
    for (const [px, pz, ry] of panes) {
      for (let i = 0; i < 3; i++) {
        if (r() < (v === 1 ? 0.6 : 0.25)) continue;
        const y = 0.5 + i * 0.6;
        k.box("glass", W - 0.1, 0.56, 0.02, px * 0.98, y + 0.28, pz * 0.98, {
          ry,
          color: 0x7a8a88,
          ao: [1, 1],
        });
      }
      for (let i = 0; i <= 3; i++)
        k.box(
          "metal",
          W - 0.06,
          0.04,
          0.05,
          px,
          0.48 + i * 0.6,
          pz,
          Object.assign({ ry }, o),
        );
    }
    k.meta.collider = { w: W + 0.1, d: W + 0.1, h: H + 0.5 };
    k.meta.tier = "medium";
  });

  // ---------------- bench ----------------
  D("bench", (k, r, v) => {
    const L = 1.8,
      broken = v === 1;
    const iron = { color: 0x2a2c28, rust: 0.4 };
    for (const sx of [-0.75, 0.75]) {
      k.seg("metal", [sx, 0, -0.25], [sx, 0.45, -0.18], 0.03, iron);
      k.seg("metal", [sx, 0, 0.22], [sx, 0.45, 0.18], 0.03, iron);
      k.seg("metal", [sx, 0.45, -0.22], [sx, 0.45, 0.22], 0.03, iron);
      k.seg("metal", [sx, 0.45, 0.2], [sx, 0.9, 0.34], 0.03, iron);
      k.seg("metal", [sx, 0.62, -0.26], [sx, 0.62, 0.1], 0.025, iron); // armrest
    }
    for (let i = 0; i < 5; i++) {
      if (broken && r() < 0.4) continue;
      k.box("wood", L, 0.035, 0.08, 0, 0.47, -0.18 + i * 0.09, {
        color: 0xb09878,
        rust: 0,
      });
    }
    for (let i = 0; i < 3; i++) {
      if (broken && r() < 0.5) continue;
      k.box("wood", L, 0.08, 0.03, 0, 0.6 + i * 0.12, 0.23 + i * 0.03, {
        rx: -0.25,
        color: 0xb09878,
      });
    }
    k.meta.collider = { w: L, d: 0.5, h: 0.5 };
    k.meta.tier = "small";
  });

  // ---------------- litter basket (NYC wire basket) / metal can ----------------
  D("trash_can", (k, r, v) => {
    if (v === 0 || v === 2) {
      const tip = v === 2;
      const kk = tip ? new X.Kit(11) : k;
      kk.cyl("chain", 0.3, 0.24, 0.85, 0, 0.47, 0, {
        seg: 12,
        open: true,
        color: 0x6a6e60,
        uvScale: 2.2,
      });
      kk.torus("metal", 0.3, 0.02, 0, 0.9, 0, {
        rx: PI / 2,
        tseg: 14,
        rseg: 4,
        color: 0x4a4e44,
      });
      kk.torus("metal", 0.26, 0.015, 0, 0.45, 0, {
        rx: PI / 2,
        tseg: 14,
        rseg: 4,
        color: 0x4a4e44,
      });
      kk.cyl("metal", 0.24, 0.24, 0.03, 0, 0.06, 0, {
        seg: 12,
        color: 0x3a3a34,
      });
      for (let i = 0; i < 4; i++) {
        const a = (i * PI) / 2;
        kk.seg(
          "metal",
          [Math.cos(a) * 0.24, 0, Math.sin(a) * 0.24],
          [Math.cos(a) * 0.3, 0.9, Math.sin(a) * 0.3],
          0.012,
          { color: 0x3a3a34 },
        );
      }
      // garbage inside
      kk.sphere("fabric", 0.22, 0, 0.75, 0, {
        s: [1, 0.6, 1],
        color: 0x2a2a28,
        wseg: 8,
        hseg: 5,
      });
      if (tip) {
        k.include(kk, { y: 0.3, rx: PI / 2 - 0.1, ry: r() * 6 });
        for (let i = 0; i < 6; i++)
          k.sphere(
            "fabric",
            0.08 + r() * 0.1,
            (r() - 0.5) * 0.8,
            0.05,
            0.6 + r() * 0.6,
            {
              s: [1, 0.5, 1],
              color: [0x2a2a28, 0x6a5a40, 0xb0a890][i % 3],
              wseg: 6,
              hseg: 4,
            },
          );
        for (let i = 0; i < 4; i++)
          k.quad(
            "paper",
            0.18,
            0.13,
            (r() - 0.5) * 1.2,
            0.012,
            0.4 + r() * 1.2,
            { rx: -PI / 2, rz: r() * 3 },
          );
      }
    } else {
      // dented municipal can with lid
      const o = {
        color: [0x4a5a40, 0x606058, 0x3a4a5a][(r() * 3) | 0],
        rust: 0.5,
      };
      k.cyl("metal", 0.28, 0.25, 0.8, 0, 0.4, 0, Object.assign({ seg: 12 }, o));
      for (const y of [0.15, 0.4, 0.65])
        k.torus(
          "metal",
          0.27,
          0.015,
          0,
          y,
          0,
          Object.assign({ rx: PI / 2, tseg: 12, rseg: 3 }, o),
        );
      k.cyl(
        "metal",
        0.3,
        0.3,
        0.05,
        0.03,
        0.84,
        0.02,
        Object.assign({ seg: 12, rz: 0.12 }, o),
      );
      k.seg("metal", [-0.08, 0.9, 0.02], [0.1, 0.9, 0.02], 0.015, o);
    }
    k.meta.collider = v === 2 ? null : { w: 0.55, d: 0.55, h: 0.9 };
    k.meta.container = { name: "Trash Can", loot: "trash" };
    k.meta.tier = "small";
  });

  // ---------------- parking meter ----------------
  D("parking_meter", (k, r, v) => {
    const o = { color: 0x5a5e58, rust: 0.45 };
    k.cyl("metal", 0.035, 0.04, 1.1, 0, 0.55, 0, Object.assign({ seg: 6 }, o));
    if (v === 1) {
      k.seg("metal", [0, 1.1, 0], [0.12, 1.22, -0.1], 0.03, o);
      return;
    } // head snapped off
    k.cbox(
      "metal",
      0.2,
      0.3,
      0.14,
      0,
      1.25,
      0,
      Object.assign({ bevel: 0.05 }, o),
    );
    k.sphere("glass", 0.08, 0, 1.3, -0.06, { s: [1, 1, 0.5], color: 0x9aa098 });
    k.box("plain", 0.08, 0.02, 0.02, 0, 1.43, 0, { color: 0x222222 });
    k.meta.tier = "small";
  });

  // ---------------- bus stop (sign / shelter) ----------------
  D("bus_stop", (k, r, v) => {
    if (v === 0) {
      k.cyl("metal", 0.03, 0.035, 2.6, 0, 1.3, 0, {
        color: 0x6a6a60,
        rust: 0.4,
        seg: 6,
      });
      k.quad("bus_stop", 0.34, 0.45, 0, 2.3, -0.035, { ry: PI });
      k.quad("bus_stop", 0.34, 0.45, 0, 2.3, 0.035, {});
      k.meta.tier = "small";
      return;
    }
    // glass shelter, open toward -z (the street)
    const o = { color: 0x4a5048, rust: 0.4 };
    const W = 3.2,
      Dp = 1.3,
      H = 2.4;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB("metal", 0.08, H, 0.08, (sx * W) / 2, 0, (sz * Dp) / 2, o);
    k.cbox(
      "metal",
      W + 0.3,
      0.1,
      Dp + 0.3,
      0,
      H + 0.05,
      0.05,
      Object.assign({ bevel: 0.04 }, o),
    );
    for (let i = 0; i < 3; i++)
      if (r() > 0.3)
        k.box(
          "glass",
          W / 3 - 0.06,
          1.8,
          0.02,
          -W / 3 + (i * W) / 3,
          1.25,
          Dp / 2,
          { color: 0x6a7a78 },
        );
    if (r() > 0.3)
      k.box("glass", 0.02, 1.8, Dp - 0.1, -W / 2, 1.25, 0, { color: 0x6a7a78 });
    // ad panel on the right end
    k.boxB("metal", 0.1, 1.9, Dp - 0.1, W / 2, 0.2, 0, o);
    k.quad(
      X.POSTERS[(r() * X.POSTERS.length) | 0],
      0.9,
      1.35,
      W / 2 - 0.06,
      1.15,
      0,
      { ry: -PI / 2 },
    );
    k.quad(
      X.POSTERS[(r() * X.POSTERS.length) | 0],
      0.9,
      1.35,
      W / 2 + 0.06,
      1.15,
      0,
      { ry: PI / 2 },
    );
    // bench
    k.boxB("metal", W - 0.8, 0.05, 0.4, -0.2, 0.44, Dp / 2 - 0.3, o);
    for (const sx of [-1.2, 0.8])
      k.boxB("metal", 0.05, 0.44, 0.35, sx, 0, Dp / 2 - 0.3, o);
    k.meta.collider = { w: W, d: 0.2, h: H, cz: Dp / 2 };
    k.meta.tier = "medium";
  });

  // ---------------- sidewalk shed (NYC scaffolding over the sidewalk) ----------------
  // local: runs along X (length 3 m module), depth along Z: wall side at +z, curb side at -z
  // variant: 0 = 3 m deep, 1 = 4 m deep, 2 = collapsed 3 m, 3 = collapsed 4 m
  D("sidewalk_shed", (k, r, v) => {
    const depth = v % 2 === 0 ? 2.8 : 3.8,
      L = 3,
      H = 3.2;
    const collapsed = v >= 2;
    const pipe = { color: 0x7a7a70, rust: 0.45 };
    const green = { color: 0x2f4a36, rust: 0.2 };
    const tilt = collapsed ? 0.35 : 0;
    for (const x of [-L / 2, L / 2]) {
      k.seg(
        "metal",
        [x, 0, -depth / 2],
        [x, collapsed && x > 0 ? H - 1.1 : H, -depth / 2],
        0.045,
        pipe,
      );
      k.seg("metal", [x, 0, depth / 2], [x, H, depth / 2], 0.045, pipe);
      k.seg("metal", [x, H, -depth / 2], [x, H, depth / 2], 0.05, pipe);
      k.seg(
        "metal",
        [x, 0.02, -depth / 2 - 0.1],
        [x, 0.02, -depth / 2 + 0.1],
        0.08,
        pipe,
      ); // base plates
    }
    // longitudinal beams + plywood deck (painted NYC green)
    k.seg(
      "metal",
      [-L / 2, H, -depth / 2],
      [L / 2, collapsed ? H - 1.1 : H, -depth / 2],
      0.05,
      pipe,
    );
    k.box(
      "wood",
      L + 0.02,
      0.06,
      depth + 0.1,
      0,
      H + 0.08,
      0,
      Object.assign({ rz: tilt * 0.6, color: 0x5a6a50 }, {}),
    );
    // parapet board along the curb side, with posters & ads
    k.box(
      "wood",
      L,
      0.9,
      0.05,
      0,
      H + 0.55,
      -depth / 2 - 0.05,
      Object.assign({ rz: tilt * 0.6 }, green),
    );
    if (!collapsed) {
      k.quad(
        X.POSTERS[(r() * X.POSTERS.length) | 0],
        0.55,
        0.8,
        -0.8 + r() * 0.3,
        H + 0.55,
        -depth / 2 - 0.08,
        { ry: PI },
      );
      if (r() < 0.6)
        k.quad(
          X.POSTERS[(r() * X.POSTERS.length) | 0],
          0.55,
          0.8,
          0.7,
          H + 0.55,
          -depth / 2 - 0.08,
          { ry: PI },
        );
    }
    // diagonal braces
    k.seg(
      "metal",
      [-L / 2, 0.3, depth / 2],
      [L / 2, H - 0.3, depth / 2],
      0.03,
      pipe,
    );
    // hanging caged work light (sometimes lit)
    if (r() < 0.35 && !collapsed) {
      k.sphere("glow", 0.08, 0, H - 0.2, 0, {
        color: C.bulbWarm,
        wseg: 6,
        hseg: 4,
      });
      (k.meta.glows = k.meta.glows || []).push({
        x: 0,
        y: H - 0.25,
        z: 0,
        color: 0xffd090,
        size: 3.5,
        flicker: 0.5,
      });
    }
    if (collapsed) {
      // planks fallen on the ground
      for (let i = 0; i < 4; i++)
        k.box(
          "wood",
          2 + r(),
          0.04,
          0.3,
          (r() - 0.5) * 1.5,
          0.04 + i * 0.04,
          (r() - 0.5) * depth * 0.8,
          { ry: (r() - 0.5) * 0.8, color: 0x7a6a50 },
        );
    }
    k.meta.tier = "medium";
  });

  // ---------------- facade pipe scaffold tower ----------------
  D("scaffold_tower", (k, r, v) => {
    const bays = 2 + (v % 2),
      levels = 4 + (v % 3),
      BW = 2,
      LH = 2,
      Dp = 1.2;
    const pipe = { color: 0x8a8a80, rust: 0.5 };
    for (let b = 0; b <= bays; b++)
      for (const z of [0, Dp])
        k.seg(
          "metal",
          [b * BW, 0, z],
          [b * BW, levels * LH + 1, z],
          0.04,
          pipe,
        );
    for (let l = 1; l <= levels; l++) {
      const y = l * LH;
      k.seg("metal", [0, y, 0], [bays * BW, y, 0], 0.035, pipe);
      k.seg("metal", [0, y, Dp], [bays * BW, y, Dp], 0.035, pipe);
      k.seg("metal", [0, y + 1, 0], [bays * BW, y + 1, 0], 0.025, pipe); // guard rail
      for (let b = 0; b < bays; b++) {
        if (r() < 0.8)
          k.box(
            "wood",
            BW - 0.05,
            0.05,
            Dp - 0.1,
            b * BW + BW / 2,
            y + 0.03,
            Dp / 2,
            { color: 0x8a7458, ry: (r() - 0.5) * 0.05 },
          );
        if ((b + l) % 2 === 0)
          k.seg(
            "metal",
            [b * BW, y - LH, Dp],
            [b * BW + BW, y, Dp],
            0.025,
            pipe,
          );
      }
    }
    // tarp remnants
    if (r() < 0.6)
      k.box("fabric", BW * 0.9, LH * 1.4, 0.02, BW * 0.5, LH * 2.5, -0.05, {
        color: 0x3a5a6a,
        rz: 0.05,
      });
    k.meta.tier = "medium";
  });

  // ---------------- sidewalk clock ----------------
  D("street_clock", (k, r) => {
    const o = { color: 0x2a3a30, rust: 0.3 };
    k.cyl("metal", 0.25, 0.3, 0.4, 0, 0.2, 0, Object.assign({ seg: 10 }, o));
    k.cyl("metal", 0.1, 0.13, 3.3, 0, 2, 0, Object.assign({ seg: 10 }, o));
    k.cyl(
      "metal",
      0.42,
      0.42,
      0.18,
      0,
      4,
      0,
      Object.assign({ rx: PI / 2, seg: 16 }, o),
    );
    for (const s of [-1, 1]) {
      k.cyl("plain", 0.36, 0.36, 0.01, 0, 4, s * 0.095, {
        rx: PI / 2,
        seg: 16,
        color: 0xe8e0c8,
        ao: [1, 1],
      });
      k.box("plain", 0.02, 0.26, 0.01, 0.05, 4.05, s * 0.105, {
        rz: -0.4,
        color: 0x111111,
      });
      k.box("plain", 0.02, 0.18, 0.01, -0.04, 4.03, s * 0.105, {
        rz: 1.2,
        color: 0x111111,
      });
    }
    k.sphere("metal", 0.1, 0, 4.5, 0, Object.assign({ wseg: 8, hseg: 5 }, o));
    k.meta.collider = { w: 0.5, d: 0.5, h: 3 };
    k.meta.tier = "medium";
  });

  // ---------------- dead tree helpers ----------------
  function branch(k, p, dir, len, br, depth, r, col) {
    const e = [p[0] + dir[0] * len, p[1] + dir[1] * len, p[2] + dir[2] * len];
    k.seg("wood", p, e, br, {
      r2: br * 0.65,
      seg: depth > 1 ? 6 : 4,
      color: col,
      grime: 0.3,
    });
    if (depth <= 0) return;
    const n = depth > 1 ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU;
      const nd = [
        dir[0] * 0.55 + Math.cos(a) * 0.6,
        dir[1] * 0.6 + 0.25 + r() * 0.3,
        dir[2] * 0.55 + Math.sin(a) * 0.6,
      ];
      const l = Math.hypot(nd[0], nd[1], nd[2]);
      nd[0] /= l;
      nd[1] /= l;
      nd[2] /= l;
      branch(k, e, nd, len * (0.55 + r() * 0.2), br * 0.62, depth - 1, r, col);
    }
  }
  X.deadTree = function (k, r, x, z, h, depth) {
    const col = 0x6a5a4a;
    k.seg(
      "wood",
      [x, 0, z],
      [x + (r() - 0.5) * 0.3, h * 0.45, z + (r() - 0.5) * 0.3],
      (0.13 * h) / 5,
      { r2: (0.09 * h) / 5, seg: 7, color: col },
    );
    branch(
      k,
      [x, h * 0.42, z],
      [0.1, 1, 0.05],
      h * 0.35,
      (0.09 * h) / 5,
      depth,
      r,
      col,
    );
  };
  // ---------------- planters & sidewalk tree pits ----------------
  D("planter", (k, r, v) => {
    if (v === 0) {
      // concrete planter + dead shrub
      k.cbox("concrete", 1.3, 0.62, 1.3, 0, 0.31, 0, {
        bevel: 0.05,
        color: 0xb8b2a4,
      });
      k.box("concrete", 1.14, 0.04, 1.14, 0, 0.58, 0, { color: 0x4a3a2a });
      X.deadTree(k, r, 0, 0, 1.6, 2);
      for (let i = 0; i < 3; i++)
        k.quad("paper", 0.14, 0.1, (r() - 0.5) * 0.9, 0.61, (r() - 0.5) * 0.9, {
          rx: -PI / 2,
          rz: r() * 3,
        });
      k.meta.collider = { w: 1.3, d: 1.3, h: 0.62 };
      k.meta.tier = "small";
    } else if (v === 1) {
      // tree pit with iron guard + tall dead tree
      k.box("concrete", 1.2, 0.03, 1.2, 0, 0.015, 0, { color: 0x3a2e22 });
      const g = { color: 0x2a2c28, rust: 0.4 };
      for (let i = 0; i < 4; i++) {
        const a = (i * PI) / 2;
        const x0 = Math.cos(a) * 0.6,
          z0 = Math.sin(a) * 0.6;
        const x1 = Math.cos(a + PI / 2) * 0.6,
          z1 = Math.sin(a + PI / 2) * 0.6;
        k.seg("metal", [x0, 0.45, z0], [x1, 0.45, z1], 0.015, g);
        k.seg("metal", [x0, 0, z0], [x0, 0.45, z0], 0.015, g);
      }
      X.deadTree(k, r, 0, 0, 4.5 + r() * 2, 2);
      k.meta.collider = { w: 0.4, d: 0.4, h: 2 };
      k.meta.tier = "medium";
    } else {
      // stump
      k.cyl("wood", 0.22, 0.28, 0.5, 0, 0.25, 0, { seg: 8, color: 0x6a5a4a });
      k.meta.tier = "small";
    }
  });

  // ---------------- sidewalk subway grate ----------------
  D("grate", (k) => {
    k.quad("grate", 1.1, 2.2, 0, 0.025, 0, { rx: -PI / 2, color: 0xaaaaaa });
    k.box("metal", 1.2, 0.04, 0.06, 0, 0.02, 1.12, { color: 0x4a4a40 });
    k.box("metal", 1.2, 0.04, 0.06, 0, 0.02, -1.12, { color: 0x4a4a40 });
    k.meta.tier = "small";
  });

  // ---------------- Fizzo Cola machine ----------------
  // A tall, square-shouldered upright: a black kick plinth on levelling feet, a red body with a white
  // side band, an arched lamp crown across the top, the glass-front door (printed: racked bottles,
  // selection column, delivery flap) in a chrome frame with a long pull handle, and a chrome
  // bottle-opener plate with its cap catcher bolted beside the flap.
  // variant 0/1: upright (Fizzo Cola / Fizzo Blue door), 2: knocked over on its back
  D("fizzo_machine", (k, r, v) => {
    const kk = v === 2 ? new X.Kit(21) : k;
    const red = { color: C.fizzoRed, rust: 0.25 + r() * 0.2, tint: true };
    const chrome = { color: C.chrome, rust: 0.15, grime: 0.2 };
    const blk = { color: 0x1a1a1a, rust: 0.2 };
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        kk.cyl("metal", 0.03, 0.035, 0.05, sx * 0.4, 0.025, sz * 0.3, {
          seg: 6,
          color: 0x2a2a28,
        });
    kk.boxB("metal", 0.9, 0.12, 0.7, 0, 0.04, 0, blk);
    kk.cbox(
      "metal",
      0.94,
      1.6,
      0.74,
      0,
      0.96,
      0,
      Object.assign({ bevel: 0.025 }, red),
    );
    for (const s of [-1, 1])
      kk.box("metal", 0.012, 0.16, 0.66, s * 0.472, 1.25, 0, {
        color: 0xece4d4,
        rust: 0.2,
      }); // white side band
    // arched crown across the top (axis front-to-back) with a lamp strip on its face
    kk.cyl(
      "metal",
      0.47,
      0.47,
      0.74,
      0,
      1.76,
      0,
      Object.assign(
        {
          rx: PI / 2,
          seg: 16,
          thetaStart: PI / 2,
          thetaLength: PI,
          s: [1, 1, 0.42],
        },
        red,
      ),
    );
    kk.box("glow", 0.62, 0.05, 0.02, 0, 1.86, -0.375, { color: 0xfff0d8 });
    kk.box("metal", 0.94, 0.03, 0.76, 0, 1.765, 0, chrome);
    // door: printed glass front inside a chrome frame, long pull handle on the right
    kk.quad(
      v === 1 ? "fizzo_front_b" : "fizzo_front",
      0.8,
      1.56,
      -0.02,
      0.98,
      -0.374,
      { ry: PI, color: 0xffffff },
    );
    kk.box("metal", 0.84, 0.025, 0.02, -0.02, 1.77, -0.375, chrome);
    kk.box("metal", 0.84, 0.025, 0.02, -0.02, 0.2, -0.375, chrome);
    for (const fx of [-0.44, 0.4])
      kk.box("metal", 0.025, 1.57, 0.02, fx, 0.98, -0.375, chrome);
    kk.box("metal", 0.03, 0.5, 0.03, 0.43, 1.12, -0.4, chrome);
    for (const hy of [0.88, 1.36])
      kk.box("metal", 0.03, 0.03, 0.04, 0.43, hy, -0.385, chrome);
    // bottle-opener plate + cap catcher beside the delivery flap
    kk.box("metal", 0.1, 0.07, 0.015, 0.33, 0.47, -0.384, chrome);
    kk.box("metal", 0.04, 0.012, 0.02, 0.33, 0.455, -0.395, blk);
    kk.boxB("metal", 0.12, 0.08, 0.08, 0.33, 0.28, -0.41, {
      color: 0x6a6a64,
      rust: 0.4,
    });
    if (v === 2) {
      k.include(kk, { y: 0.37, z: 0.9, rx: -PI / 2 });
      for (let i = 0; i < 6; i++)
        k.cyl(
          "glass",
          0.03,
          0.032,
          0.26,
          (r() - 0.5) * 1.4,
          0.03,
          -0.5 - r() * 0.8,
          { rz: PI / 2, ry: r() * 6, color: 0x4a1a10, seg: 6 },
        );
      k.meta.collider = { w: 0.95, d: 1.9, h: 0.8, cz: 0.9 };
    } else {
      k.meta.collider = { w: 0.95, d: 0.8, h: 2.0 };
      k.meta.glows = [
        {
          x: 0,
          y: 1.6,
          z: -0.55,
          color: 0xff6a50,
          size: 2.4,
          flicker: r() < 0.4 ? 0.5 : 0,
        },
      ];
    }
    k.meta.container = { name: "Fizzo Cola Machine", loot: "fizzo_machine" };
    k.meta.tier = "medium";
  });

  // ---------------- Office of Civil Defense information kiosk (shelters + 1967 enrolment) ----------------
  // A grey-white enamel pylon on a round concrete foot with an orange band and a leaflet pocket, a slanted
  // lectern head carrying the printed face with its amber teletype screen, and the snowflake roundel
  // of the Office of Civil Defense on a short mast.
  D("ocd_kiosk", (k, r) => {
    const wht = { color: C.ocdGrey, rust: 0.18, grime: 0.35 },
      org = { color: C.ocdOrange, rust: 0.2, grime: 0.3 };
    k.cyl("concrete", 0.5, 0.55, 0.12, 0, 0.06, 0, {
      seg: 16,
      color: 0x8a8880,
    });
    k.cbox(
      "metal",
      0.56,
      1.16,
      0.46,
      0,
      0.7,
      0.04,
      Object.assign({ bevel: 0.05 }, wht),
    );
    k.box("metal", 0.58, 0.08, 0.48, 0, 1.04, 0.04, org);
    k.box("metal", 0.58, 0.04, 0.48, 0, 0.2, 0.04, org);
    k.box(
      "metal",
      0.34,
      0.2,
      0.05,
      0,
      0.62,
      -0.21,
      Object.assign({ rx: 0.15 }, wht),
    );
    for (let i = 0; i < 3; i++)
      k.box(
        "plain",
        0.24,
        0.16,
        0.004,
        -0.02 + i * 0.02,
        0.7,
        -0.236 + i * 0.006,
        { rx: 0.15, color: 0xe8e2cc },
      );
    k.cbox(
      "metal",
      0.95,
      0.95,
      0.4,
      0,
      1.75,
      0.02,
      Object.assign({ bevel: 0.06, rx: 0.18 }, wht),
    );
    k.quad("ocd_kiosk", 0.78, 0.8, 0, 1.75, -0.19, { ry: PI, rx: -0.18 });
    k.box("screen", 0.6, 0.25, 0.01, 0, 1.833, -0.185, {
      rx: 0.18,
      uvFn: screenUV("ocd_kiosk", 0.11, 0.89, 0.44, 0.77),
      ao: [1, 1],
      grime: 0,
    });
    k.box(
      "metal",
      0.97,
      0.06,
      0.42,
      0,
      2.2,
      0.1,
      Object.assign({ rx: 0.18 }, org),
    );
    // roundel mast
    k.cyl("metal", 0.03, 0.03, 0.3, 0, 2.38, 0.1, { seg: 8, color: 0x5a5a56 });
    k.cyl(
      "metal",
      0.29,
      0.29,
      0.05,
      0,
      2.78,
      0.1,
      Object.assign({ rx: PI / 2, seg: 20 }, org),
    );
    k.quad("longwinter_logo", 0.48, 0.48, 0, 2.78, 0.07, { ry: PI });
    k.quad("longwinter_logo", 0.48, 0.48, 0, 2.78, 0.13, {});
    k.meta.glows = [
      { x: 0, y: 1.85, z: -0.35, color: 0xffb347, size: 1.8, flicker: 0.3 },
    ];
    k.meta.collider = { w: 1.0, d: 0.8, h: 2.2 };
    k.meta.tier = "medium";
  });
  /** uvFn mapping a sub-rectangle (fractions) of an atlas region onto a box's -Z face (screens). */
  function screenUV(region, fu0, fu1, fv0, fv1) {
    return (g) => {
      const R = X.atlasRegion(region);
      const u0 = X.lerp(R.u0, R.u1, fu0),
        u1 = X.lerp(R.u0, R.u1, fu1),
        v0 = X.lerp(R.v0, R.v1, fv0),
        v1 = X.lerp(R.v0, R.v1, fv1);
      const uv = g.attributes.uv,
        p = g.attributes.position;
      g.computeBoundingBox();
      const bb = g.boundingBox;
      for (let i = 0; i < uv.count; i++) {
        const fx = (p.getX(i) - bb.min.x) / Math.max(1e-4, bb.max.x - bb.min.x),
          fy = (p.getY(i) - bb.min.y) / Math.max(1e-4, bb.max.y - bb.min.y);
        uv.setXY(i, X.lerp(u1, u0, fx), X.lerp(v0, v1, fy));
      }
    };
  }
  X.screenUV = screenUV;

  // ---------------- freestanding billboard frame ----------------
  // variant 0: street-level twin pole (6x3 face at 4.5 m), 1: big rooftop-style (12x5 on lattice), 2: leaning/damaged
  // The brand face itself is a separate mesh (see scatter/spawn) placed at meta.face.
  D("billboard_frame", (k, r, v) => {
    const steel = { color: 0x5a5a52, rust: 0.55 };
    const big = v === 1;
    const W = big ? 12 : 6,
      H = big ? 5 : 3,
      base = big ? 7 : 4.2;
    const lean = v === 2 ? 0.12 : 0;
    const legs = big ? [-W / 3, 0, W / 3] : [-W / 3.2, W / 3.2];
    for (const lx of legs) {
      k.boxB("concrete", 0.7, 0.4, 0.7, lx, 0, 0.2, { color: 0xa8a498 });
      k.seg(
        "metal",
        [lx, 0.4, 0.2],
        [lx, base + H * 0.5, 0.2 + lean * base],
        big ? 0.16 : 0.11,
        Object.assign({ seg: 8 }, steel),
      );
      if (big) k.seg("metal", [lx, 0.4, 1.4], [lx, base, 0.35], 0.07, steel);
    }
    // back frame + face panel backing
    k.box(
      "metal",
      W + 0.2,
      H + 0.2,
      0.12,
      0,
      base + H / 2,
      0.12 + lean * base,
      Object.assign({ rx: -lean }, steel),
    );
    for (let i = 0; i <= 4; i++)
      k.box(
        "metal",
        0.08,
        H,
        0.2,
        -W / 2 + (i * W) / 4,
        base + H / 2,
        0.25 + lean * base,
        Object.assign({ rx: -lean }, steel),
      );
    // catwalk + lamps along the bottom edge
    k.box(
      "metal",
      W,
      0.05,
      0.8,
      0,
      base - 0.2,
      -0.3 + lean * base,
      Object.assign({ rx: -lean }, steel),
    );
    const nl = big ? 4 : 2;
    for (let i = 0; i < nl; i++) {
      const lx = -W / 2 + ((i + 0.5) * W) / nl;
      k.seg(
        "metal",
        [lx, base - 0.2, -0.3 + lean * base],
        [lx, base - 0.3, -1.1 + lean * base],
        0.03,
        steel,
      );
      k.cyl(
        "metal",
        0.14,
        0.2,
        0.2,
        lx,
        base - 0.3,
        -1.1 + lean * base,
        Object.assign({ rx: -0.9, seg: 8 }, steel),
      );
    }
    k.meta.face = {
      w: W,
      h: H,
      y: base + H / 2,
      z: -0.0 + lean * base,
      rx: -lean,
    };
    k.meta.collider = { w: W * 0.7, d: 0.8, h: 3, cz: 0.2 };
    k.meta.tier = "large";
  });

  // ---------------- wall poster slab (for kiosks / walls) ----------------
  D("poster_board", (k, r, v) => {
    // a free-standing plywood hoarding panel covered in posters (construction fence)
    const W = 2.4,
      H = 2.2;
    k.boxB("wood", W, H, 0.05, 0, 0, 0, { color: 0x6a6048 });
    for (const sx of [-1, 1])
      k.boxB("wood", 0.1, H, 0.3, sx * (W / 2 - 0.1), 0, 0.15, {
        color: 0x5a4a38,
      });
    const n = 3 + ((r() * 3) | 0);
    for (let i = 0; i < n; i++) {
      const pw = 0.5,
        ph = 0.75;
      k.quad(
        X.POSTERS[(r() * X.POSTERS.length) | 0],
        pw,
        ph,
        -W / 2 + 0.4 + r() * (W - 0.8),
        0.6 + r() * (H - 1.2),
        -0.03 - i * 0.002,
        { ry: PI, rz: (r() - 0.5) * 0.15 },
      );
    }
    if (r() < 0.5)
      k.quad(
        "graffiti_" + ((r() * X.GRAFFITI) | 0),
        1.6,
        0.8,
        0,
        0.6,
        -0.04 - n * 0.002,
        { ry: PI },
      );
    k.meta.collider = { w: W, d: 0.3, h: H, cz: 0.1 };
    k.meta.tier = "medium";
  });
})();
