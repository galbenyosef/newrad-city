// play-inline-447 02 — can
// Lines 148-602 of readable/play-inline-447.pretty.js (statement-aligned).
  D("filling_station", (k, r, v) => {
    v = v % 2;
    const conc = { color: 0x8e8a80, grime: 0.6 },
      cream = { color: CREAM, rust: 0.35, grime: 0.5 },
      red = { color: RED, rust: 0.5, grime: 0.45 };
    const steel = { color: 0xc8c4b6, rust: 0.55, grime: 0.4 },
      dark = { color: BLACK, rust: 0.4, grime: 0.3 };

    // ---- the pad: concrete apron, oil stains, a drain, the island kerb ----
    k.box(
      "concrete",
      W,
      0.08,
      DP,
      0,
      0.04,
      0,
      Object.assign({ segs: [6, 1, 4] }, conc),
    );
    for (let i = 0; i < 9; i++)
      k.box(
        "plain",
        0.8 + r() * 1.4,
        0.004,
        0.6 + r() * 1.0,
        -4 + r() * 14,
        0.083,
        -6 + r() * 6,
        { ry: r() * 3, color: 0x2a2620, grime: 0 },
      );
    k.box("metal", 0.6, 0.01, 0.6, 8.5, 0.085, -1.2, {
      color: 0x2a2a26,
      rust: 0.7,
    });
    k.box("concrete", 11.6, 0.2, 1.3, CAN.x, 0.18, CAN.z, {
      color: 0xb8b2a2,
      grime: 0.6,
    });
    k.box("metal", 11.7, 0.05, 1.36, CAN.x, 0.29, CAN.z, {
      color: 0xc8b048,
      rust: 0.6,
    }); // yellow kerb nosing

    // ---- canopy: two columns, the slab, red fascia with the checker bands ----
    for (const px of POSTS) {
      k.cyl(
        "metal",
        0.14,
        0.16,
        CAN.y,
        px,
        CAN.y / 2 + 0.28,
        CAN.z,
        Object.assign({ seg: 10 }, steel),
      );
      k.box("concrete", 0.6, 0.3, 0.6, px, 0.43, CAN.z, {
        color: 0xa8a294,
        grime: 0.6,
      });
    }
    const top = CAN.y + 0.28;
    k.box(
      "metal",
      CAN.w,
      0.14,
      CAN.d,
      CAN.x,
      top + 0.07,
      CAN.z,
      Object.assign({ segs: [4, 1, 2] }, cream),
    ); // soffit/slab
    k.box("metal", CAN.w - 0.4, 0.3, 0.3, CAN.x, top - 0.1, CAN.z, steel); // spine beam
    // fascia boxes round the edge (one front panel hangs from a corner on v1)
    const fy = top + 0.3,
      fz0 = CAN.z - CAN.d / 2,
      fz1 = CAN.z + CAN.d / 2,
      fx0 = CAN.x - CAN.w / 2,
      fx1 = CAN.x + CAN.w / 2;
    k.box("paint", CAN.w, CAN.t, 0.1, CAN.x, fy, fz1, red);
    k.box("paint", 0.1, CAN.t, CAN.d, fx0, fy, CAN.z, red);
    k.box("paint", 0.1, CAN.t, CAN.d, fx1, fy, CAN.z, red);
    const hangX = v === 1 ? fx1 - 2.2 : null;
    k.box(
      "paint",
      v === 1 ? CAN.w - 4.4 : CAN.w,
      CAN.t,
      0.1,
      v === 1 ? CAN.x - 2.2 : CAN.x,
      fy,
      fz0,
      red,
    );
    // printed faces: the name front and back, checker bands for the rest
    k.quad("hioctane_fascia", 4.6, CAN.t, CAN.x - 1.0, fy, fz0 - 0.06, {
      ry: PI,
      mat: "trim",
      grime: 0.25,
    });
    k.quad("hioctane_fascia", 4.6, CAN.t, CAN.x, fy, fz1 + 0.06, {
      mat: "trim",
      grime: 0.25,
    });
    for (const [x0, x1] of [
      [fx0, CAN.x - 3.3],
      [CAN.x + 1.3, v === 1 ? fx1 - 4.4 : fx1],
    ]) {
      const len = x1 - x0;
      if (len > 0.3)
        k.quad("hioctane_band", len, CAN.t, (x0 + x1) / 2, fy, fz0 - 0.06, {
          ry: PI,
          mat: "trim",
          grime: 0.3,
        });
    }
    for (const [x0, x1] of [
      [fx0, CAN.x - 2.3],
      [CAN.x + 2.3, fx1],
    ])
      k.quad("hioctane_band", x1 - x0, CAN.t, (x0 + x1) / 2, fy, fz1 + 0.06, {
        mat: "trim",
        grime: 0.3,
      });
    for (const s of [-1, 1])
      k.quad(
        "hioctane_band",
        CAN.d,
        CAN.t,
        s < 0 ? fx0 - 0.06 : fx1 + 0.06,
        fy,
        CAN.z,
        { ry: (s * PI) / 2, mat: "trim", grime: 0.3 },
      );
    if (hangX !== null) {
      // the torn-off front panel swinging from its last bracket
      const hp = new X.Kit(61);
      hp.box("paint", 4.4, CAN.t, 0.1, 0, 0, 0, red);
      hp.quad("hioctane_band", 4.4, CAN.t, 0, 0, -0.06, {
        ry: PI,
        mat: "trim",
        grime: 0.4,
      });
      const pv = hangX - 2.2; // still hangs from its left-hand bracket
      k.include(hp, {
        x: pv + 2.2 * Math.cos(1.05),
        y: fy - 2.2 * Math.sin(1.05),
        z: fz0 - 0.05,
        rz: -1.05,
      });
      for (let i = 0; i < 3; i++)
        k.box(
          "metal",
          0.04,
          0.5,
          0.04,
          fx1 - 4.4 + i * 1.5,
          top - 0.1,
          fz0 + 0.2,
          { color: 0x6a4a30, rust: 0.9, rz: 0.3 },
        ); // bare brackets
    }
    // canopy lamps (dead) in the soffit
    for (let i = 0; i < 4; i++)
      for (const dz of [-1.8, 1.8])
        k.box(
          "plain",
          0.9,
          0.06,
          0.3,
          CAN.x - 4.5 + i * 3,
          top - 0.03,
          CAN.z + dz,
          { color: 0x9a988c, grime: 0.6 },
        );

    // ---- pumps ----
    PUMPS.forEach((px, i) => {
      const down = (v === 0 && i === 1) || (v === 1 && i === 2);
      const globe = down ? "none" : (i + v) % 2 ? "broken" : "whole";
      if (!down) pump(k, r, px, 0.28, CAN.z, false, globe);
      else {
        // knocked flat across the pad, its base bolts sheared
        const sub = new X.Kit(63 + i);
        pump(sub, r, 0, 0, 0, true, "none");
        k.include(sub, {
          x: px + 0.2,
          y: 0.33,
          z: CAN.z - 1.25,
          rx: -PI / 2 + 0.06,
          ry: 0.25,
        });
        k.box("metal", 0.5, 0.06, 0.3, px, 0.31, CAN.z, {
          color: 0x4a3a2a,
          rust: 0.9,
        });
      }
    });

    // ---- office + service bay ----
    const ox = (OFF.x0 + OFF.x1) / 2,
      oz = (OFF.z0 + OFF.z1) / 2,
      ow = OFF.x1 - OFF.x0,
      od = OFF.z1 - OFF.z0;
    k.box(
      "paint",
      ow,
      OFF.h,
      od,
      ox,
      OFF.h / 2,
      oz,
      Object.assign({ segs: [3, 2, 2] }, cream),
    );
    k.box("metal", ow + 0.5, 0.16, od + 0.5, ox, OFF.h + 0.08, oz, steel); // flat roof with an overhang
    k.box("paint", ow, 0.8, 0.12, ox, 0.4, OFF.z0 - 0.02, red); // red stall riser
    // plate-glass front (one pane broken out), mullions, the door, lettering band
    const panes = 4,
      pw = (ow - 1.4) / panes;
    for (let i = 0; i < panes; i++) {
      const cx = OFF.x0 + 0.2 + pw * (i + 0.5),
        broken = (i === 1 && v === 0) || (i === 2 && v === 1);
      k.box(
        broken ? "plain" : "glass",
        pw - 0.06,
        1.85,
        0.04,
        cx,
        1.75,
        OFF.z0 - 0.04,
        { color: broken ? 0x0c0b0a : 0x24302e, ao: [1, 1], grime: 0.4 },
      );
      if (broken)
        for (let j = 0; j < 3; j++)
          k.box(
            "glass",
            0.1 + r() * 0.2,
            0.01,
            0.1 + r() * 0.2,
            cx + (r() - 0.5) * 1.2,
            0.09,
            OFF.z0 - 0.4 - r() * 0.8,
            { ry: r() * 3, color: 0x6a7a78 },
          );
      k.box(
        "metal",
        0.06,
        1.9,
        0.08,
        OFF.x0 + 0.2 + pw * i,
        1.75,
        OFF.z0 - 0.05,
        dark,
      );
    }
    k.box("plain", 0.95, 2.15, 0.05, OFF.x1 - 0.7, 1.08, OFF.z0 - 0.03, {
      color: 0x14120f,
      ao: [1, 1],
    }); // open doorway
    k.box(
      "metal",
      0.06,
      2.2,
      0.85,
      OFF.x1 - 0.25,
      1.1,
      OFF.z0 - 0.45,
      Object.assign({ ry: 0.5 }, steel),
    ); // door swung out
    k.quad("hioctane_office", 3.6, 0.55, ox - 0.4, 2.95, OFF.z0 - 0.05, {
      ry: PI,
      mat: "trim",
      grime: 0.35,
    });
    k.box("glass", 0.04, 1.6, od - 1.0, OFF.x0 - 0.03, 1.8, oz, {
      color: 0x24302e,
      ao: [1, 1],
      grime: 0.4,
    }); // side window
    // service bay: roll-up door (v0 half up over a dark bay), the fascia board over it
    const bx = (BAY.x0 + BAY.x1) / 2,
      bz = (BAY.z0 + BAY.z1) / 2,
      bw = BAY.x1 - BAY.x0,
      bd = BAY.z1 - BAY.z0;
    k.box(
      "paint",
      bw,
      BAY.h,
      bd,
      bx,
      BAY.h / 2,
      bz,
      Object.assign({ segs: [3, 2, 2] }, cream),
    );
    k.box("metal", bw + 0.4, 0.16, bd + 0.5, bx, BAY.h + 0.08, bz, steel);
    const dh = 3.0,
      up = v === 0 ? 1.3 : 0.15;
    k.box("plain", bw - 1.6, dh, 0.04, bx, dh / 2, BAY.z0 - 0.02, {
      color: 0x100e0c,
      ao: [1, 1],
    });
    k.quad(
      "shutter",
      bw - 1.6,
      dh - up,
      bx,
      up + (dh - up) / 2,
      BAY.z0 - 0.06,
      { ry: PI, mat: "trim", grime: 0.4 },
    );
    k.quad("hioctane_fascia", 5.4, 0.62, bx, 3.45, BAY.z0 - 0.06, {
      ry: PI,
      mat: "trim",
      grime: 0.3,
    });
    // a grease rack and a tool bench just visible in the bay
    k.box("metal", 0.3, 0.9, 3.2, bx - 1.0, 0.45, bz, {
      color: 0x3a3a34,
      rust: 0.7,
    });
    k.box("metal", 0.3, 0.9, 3.2, bx + 1.0, 0.45, bz, {
      color: 0x3a3a34,
      rust: 0.7,
    });

    // ---- pole sign at the front corner, turned to face the traffic both ways ----
    k.cyl(
      "metal",
      0.17,
      0.2,
      POLE.h,
      POLE.x,
      POLE.h / 2,
      POLE.z,
      Object.assign({ seg: 10 }, steel),
    );
    k.box("concrete", 0.8, 0.4, 0.8, POLE.x, 0.2, POLE.z, {
      color: 0xa8a294,
      grime: 0.6,
    });
    const sy = POLE.h - 0.2,
      SW = 2.6,
      SH = 3.25;
    k.box("paint", 0.28, SH + 0.2, SW + 0.2, POLE.x, sy, POLE.z, red); // cabinet
    for (const s of [-1, 1])
      k.quad("hioctane_pole", SW, SH, POLE.x + s * 0.15, sy, POLE.z, {
        ry: (s * PI) / 2,
        mat: "trim",
        grime: 0.3,
      });
    if (v === 1)
      k.box("plain", 0.3, 0.9, 0.7, POLE.x, sy - 0.9, POLE.z + 0.5, {
        color: 0x14120f,
      }); // a panel shot out
    k.box("metal", 0.18, 0.86, 2.1, POLE.x, sy - SH / 2 - 0.75, POLE.z, dark); // price board
    for (const s of [-1, 1])
      k.quad(
        "hioctane_price",
        2.0,
        0.75,
        POLE.x + s * 0.1,
        sy - SH / 2 - 0.75,
        POLE.z,
        { ry: (s * PI) / 2, mat: "trim", grime: 0.35 },
      );

    // ---- oil-can rack, air post, tyres, a waste drum ----
    const rx = OFF.x0 + 1.2,
      rz = OFF.z0 - 0.7;
    k.box("metal", 1.3, 0.05, 0.4, rx, 0.55, rz, steel);
    k.box("metal", 1.3, 0.05, 0.4, rx, 1.05, rz, steel);
    for (const s of [-1, 1])
      k.box("metal", 0.04, 1.2, 0.4, rx + s * 0.63, 0.6, rz, steel);
    for (let row = 0; row < 2; row++)
      for (let i = 0; i < 6; i++) {
        if (r() < 0.3) continue;
        k.abox(
          "hioctane_oil",
          0.13,
          0.17,
          0.13,
          rx - 0.5 + i * 0.2,
          0.66 + row * 0.5,
          rz,
          { ry: (r() - 0.5) * 0.4, grime: 0.4 },
        );
      }
    for (let i = 0; i < 3; i++)
      k.abox(
        "hioctane_oil",
        0.13,
        0.17,
        0.13,
        rx + 0.9 + r() * 0.8,
        0.09,
        rz - 0.4 - r() * 0.6,
        { rz: PI / 2, ry: r() * 6, grime: 0.6 },
      );
    k.cyl(
      "metal",
      0.09,
      0.11,
      1.2,
      9.2,
      0.6,
      -0.6,
      Object.assign({ seg: 8 }, red),
    ); // air post
    k.box("metal", 0.24, 0.3, 0.16, 9.2, 1.1, -0.6, {
      color: CREAM,
      rust: 0.5,
    });
    for (let i = 0; i < 4; i++)
      k.torus("plain", 0.33, 0.12, 3.3, 0.12 + i * 0.23, 4.2 + (i % 2) * 0.05, {
        rx: PI / 2,
        color: 0x1a1918,
        tseg: 12,
        rseg: 5,
      });
    k.cyl("metal", 0.3, 0.3, 0.9, 3.4, 0.45, 2.6, {
      seg: 10,
      color: 0x3a4a3a,
      rust: 0.8,
    });

    k.meta.colliders = [
      {
        w: BAY.x1 - OFF.x0,
        d: OFF.z1 - OFF.z0,
        h: BAY.h,
        cx: (OFF.x0 + BAY.x1) / 2,
        cz: oz,
      }, // office + bay
      { w: 0.45, d: 0.45, h: CAN.y + 0.3, cx: POSTS[0], cz: CAN.z },
      { w: 0.45, d: 0.45, h: CAN.y + 0.3, cx: POSTS[1], cz: CAN.z },
      { w: 11.6, d: 1.3, h: 0.3, cx: CAN.x, cz: CAN.z }, // island kerb (walkable step)
      {
        w: PUMPS[2] - PUMPS[0] + 0.8,
        d: 0.6,
        h: 1.95,
        cx: (PUMPS[0] + PUMPS[2]) / 2,
        cz: CAN.z,
      }, // pumps
      { w: CAN.w, d: CAN.d, h: 0.5, y0: top, cx: CAN.x, cz: CAN.z }, // canopy slab
      { w: 0.5, d: 0.5, h: POLE.h + 1.5, cx: POLE.x, cz: POLE.z },
      { w: 1.4, d: 0.5, h: 1.2, cx: rx, cz: rz },
    ];
    k.meta.surface = "concrete";
    k.meta.tier = "large";
    k.meta.container = {
      name: "Hi-Octane Harry's Service Bay",
      loot: "toolbox",
    };
    k.meta.interactY = 1.0;
    k.meta.interactZ = BAY.z0 - 0.4; // in front of the roll-up door
    k.meta.footprint = { w: W, d: DP };
  });
