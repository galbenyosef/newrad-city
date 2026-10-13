/* src/props/40_spawnables.js */
/* =====================================================================
 * props / 40_spawnables.js — INTERIOR / QUEST / LOOT prototypes used by
 * G.props.spawn(): teletype terminals, wall safes, ammo boxes, first-aid
 * boxes, rounded 50s fridges, steel office desks, filing cabinets,
 * dressers, lockers, footlockers, toolboxes, beds, workbenches, tabletop radios,
 * tape reels, scrip stashes, campfires, scrap shacks, auto-turrets,
 * lamps, tables, chairs, market stalls, teddy bears, World's Fair
 * medallions, Fizzo Cola / Fizzo Blue bottles, cash registers, shelving,
 * duffle bags.
 * ===================================================================== */
(function () {
  "use strict";
  const G = window.G;
  const THREE = window.THREE;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;

  // ---------------- teletype terminal ----------------
  // variant 0: on its own small desk, 1: bare (place on a desk yourself), 2: wall-mounted
  // A Halcyon Model 9 teleprinter on the Office of Civil Defense teletype net: a squat putty-grey
  // pedestal carrying a stepped keyboard plate of real keycaps, a rear console with a small amber
  // message screen in a thick bezel and a control strip (knobs, toggle, amber power lamp), and on top
  // the paper carriage: platen roller with end knobs, a carriage-return lever, the paper roll behind
  // it and a length of printout curling up and back. v0 on its own steel desk, v1 bare (sits on an
  // existing surface: base at y = 0, footprint 0.6 x 0.6), v2 wall-mounted on a bracket plate.
  D("terminal", (k, r, v) => {
    const shell = { color: 0xa8a290, rust: 0.12, grime: 0.28 };
    const shellD = { color: 0x7a766a, rust: 0.15, grime: 0.3 };
    const blk = { color: 0x1c1c1a, grime: 0.15 };
    let y0 = 0;
    if (v === 0) {
      // steel office desk: top, drawer pedestal (3 drawers), side panel, modesty panel
      const steel = { color: 0x5e645c, rust: 0.2, grime: 0.25 };
      k.cbox(
        "metal",
        1.12,
        0.045,
        0.66,
        0,
        0.765,
        0,
        Object.assign({ bevel: 0.012 }, steel),
      );
      k.boxB("metal", 0.4, 0.72, 0.6, 0.33, 0.02, 0.01, steel);
      k.boxB("metal", 0.035, 0.72, 0.6, -0.52, 0.02, 0.01, steel);
      k.boxB("metal", 0.7, 0.36, 0.02, -0.16, 0.34, 0.29, steel);
      for (let i = 0; i < 3; i++) {
        k.box("metal", 0.36, 0.2, 0.02, 0.33, 0.62 - i * 0.22, -0.3, {
          color: 0x4e544c,
          rust: 0.2,
        });
        k.box("metal", 0.1, 0.02, 0.03, 0.33, 0.66 - i * 0.22, -0.32, {
          color: C.chrome,
        });
      }
      y0 = 0.79;
    }
    if (v === 2) {
      // wall bracket: back plate with bolts + a shelf arm under the unit
      k.boxB("metal", 0.7, 0.95, 0.04, 0, 0.95, 0.3, {
        color: 0x4e524a,
        rust: 0.3,
      });
      for (const bx of [-0.3, 0.3])
        for (const by of [1.0, 1.84])
          k.cyl("metal", 0.02, 0.02, 0.03, bx, by, 0.27, {
            rx: PI / 2,
            seg: 6,
            color: 0x2a2a28,
          });
      k.boxB("metal", 0.6, 0.04, 0.5, 0, 1.21, 0.06, {
        color: 0x4e524a,
        rust: 0.3,
      });
      for (const bx of [-0.25, 0.25])
        k.seg("metal", [bx, 1.21, -0.15], [bx, 1.0, 0.28], 0.018, {
          color: 0x3a3c38,
        });
      y0 = 1.25;
    }
    // pedestal + stepped keyboard plate with real keycaps (4 rows, a few dark function keys, an orange BREAK key)
    k.cbox(
      "metal",
      0.56,
      0.14,
      0.56,
      0,
      y0 + 0.07,
      -0.02,
      Object.assign({ bevel: 0.03 }, shell),
    );
    k.box("metal", 0.5, 0.012, 0.22, 0, y0 + 0.146, -0.19, shellD);
    const rows = [10, 10, 9, 8];
    for (let row = 0; row < 4; row++) {
      const n = rows[row],
        zk = -0.275 + row * 0.045,
        yk = y0 + 0.162 + row * 0.007;
      for (let i = 0; i < n; i++) {
        const xk = (i - (n - 1) / 2) * 0.044 + (row % 2) * 0.01;
        const fn =
          (row === 3 && (i === 0 || i === n - 1)) || (row === 0 && i === n - 1);
        k.box("metal", 0.034, 0.018, 0.032, xk, yk, zk, {
          color:
            row === 3 && i === n - 1 ? C.ocdOrange : fn ? 0x3a3632 : 0xd8d0b8,
          grime: 0.25,
        });
      }
    }
    k.box("metal", 0.24, 0.016, 0.03, 0, y0 + 0.158, -0.32, {
      color: 0xd8d0b8,
      grime: 0.25,
    }); // space bar
    // rear console: amber message screen in a thick bezel, control strip on the right
    const cy = y0 + 0.34; // console / screen centre
    k.cbox(
      "metal",
      0.56,
      0.36,
      0.3,
      0,
      y0 + 0.32,
      0.12,
      Object.assign({ bevel: 0.03 }, shell),
    );
    for (let i = 0; i < 4; i++)
      k.box("metal", 0.3, 0.012, 0.02, 0, y0 + 0.24 + i * 0.045, 0.275, blk); // back vents
    const sx0 = -0.07,
      sw = 0.3,
      sh = 0.17;
    k.box("metal", sw + 0.06, sh + 0.06, 0.03, sx0, cy, -0.035, shellD);
    k.box("metal", sw + 0.01, sh + 0.01, 0.01, sx0, cy, -0.051, blk);
    k.quad("term_screen", sw - 0.02, sh - 0.02, sx0, cy, -0.058, {
      mat: "screen",
      ry: PI,
      ao: [1, 1],
      grime: 0,
      color: 0xffe2b8,
    });
    const kx = 0.19;
    for (const [ky, kr] of [
      [cy + 0.06, 0.026],
      [cy - 0.01, 0.022],
    ]) {
      k.cyl("metal", kr, kr * 1.1, 0.025, kx, ky, -0.04, {
        rx: PI / 2,
        seg: 10,
        color: 0x2a2622,
        grime: 0.1,
      });
      k.box("metal", 0.005, kr * 1.4, 0.006, kx, ky, -0.054, {
        color: 0xd8d0b8,
      });
    }
    k.box("metal", 0.012, 0.03, 0.02, kx, cy - 0.065, -0.04, {
      rx: -0.5,
      color: C.chrome,
    });
    k.sphere("glow", 0.011, kx, cy - 0.105, -0.034, {
      color: 0xffa030,
      wseg: 5,
      hseg: 3,
    });
    k.quad("teletype_badge", 0.18, 0.04, sx0, y0 + 0.2, -0.032, {
      ry: PI,
      grime: 0.2,
    });
    // paper carriage on top: housing, platen roller with end knobs, return lever, paper roll, printout
    const ty = y0 + 0.5;
    k.box("metal", 0.58, 0.05, 0.18, 0, ty + 0.025, 0.1, shellD);
    k.cyl("metal", 0.034, 0.034, 0.5, 0, ty + 0.07, 0.05, {
      rz: PI / 2,
      seg: 10,
      color: 0x1a1a18,
      grime: 0.1,
    });
    for (const s of [-1, 1])
      k.cyl("metal", 0.028, 0.028, 0.03, s * 0.27, ty + 0.07, 0.05, {
        rz: PI / 2,
        seg: 10,
        color: 0x2a2622,
      });
    k.seg("metal", [-0.25, ty + 0.08, 0.02], [-0.3, ty + 0.15, -0.05], 0.008, {
      color: C.chrome,
    });
    k.sphere("metal", 0.014, -0.3, ty + 0.15, -0.05, {
      wseg: 6,
      hseg: 4,
      color: 0x2a2622,
    });
    for (const s of [-1, 1])
      k.box("metal", 0.015, 0.09, 0.05, s * 0.22, ty + 0.07, 0.21, shellD);
    k.cyl("plain", 0.055, 0.055, 0.42, 0, ty + 0.1, 0.21, {
      rz: PI / 2,
      seg: 12,
      color: 0xe8e2d0,
      grime: 0.2,
    });
    for (const s of [-1, 1])
      k.quad("printout", 0.4, 0.26, 0, ty + 0.2, 0.08 + 0.0015 * s, {
        rx: 0.22 * s,
        ry: s > 0 ? 0 : PI,
        flipU: s > 0,
        grime: 0.15,
        mat: "atlas",
      });
    k.box("plain", 0.4, 0.002, 0.09, 0, ty + 0.34, 0.13, {
      rx: 0.9,
      color: 0xe4ddc8,
      grime: 0.2,
    }); // curl over the top
    k.seg("metal", [0.12, y0 + 0.2, 0.27], [0.2, y0 + 0.01, 0.3], 0.012, {
      color: 0x1a1a18,
    }); // power lead
    k.meta.glows = [
      { x: sx0, y: cy, z: -0.25, color: 0xffb347, size: 1.4, flicker: 0.15 },
    ];
    k.meta.collider =
      v === 0
        ? { w: 1.12, d: 0.66, h: 0.8 }
        : v === 2
          ? { w: 0.7, d: 0.4, h: 2.1, cz: 0.1 }
          : { w: 0.6, d: 0.6, h: 0.6 };
    k.meta.interactY = cy;
    k.meta.tier = "small";
  });

  // ---------------- safes ----------------
  // Office safe: a heavy riveted body on squat feet, a recessed door with a raised frame, thick hinge
  // knuckles, the big combination dial in a chrome ring, a three-spoke handle wheel, keyhole escutcheon and a
  // gilt maker's line. v0 floor safe, v1 green, v2 wall safe (door flush in a steel frame).
  D("safe", (k, r, v) => {
    const o = { color: v === 1 ? 0x344434 : 0x363634, rust: 0.22, grime: 0.3 };
    const W = v === 2 ? 0.55 : 0.8,
      H = v === 2 ? 0.55 : 1.0,
      Dp = v === 2 ? 0.45 : 0.75;
    const y0 = v === 2 ? 1.1 : 0.08;
    const cy = y0 + H / 2,
      fz = -Dp / 2;
    const chrome = { color: 0xb8b4a4, rust: 0.15 },
      blk = { color: 0x151514 };
    if (v !== 2) {
      for (const sx of [-1, 1])
        for (const sz of [-1, 1])
          k.cyl(
            "metal",
            0.05,
            0.06,
            0.08,
            sx * (W / 2 - 0.08),
            0.04,
            sz * (Dp / 2 - 0.08),
            { seg: 8, color: 0x1a1a1a },
          );
      k.box("metal", W + 0.02, 0.05, Dp + 0.02, 0, y0 + 0.02, 0, o); // plinth band
      k.box("metal", W + 0.02, 0.05, Dp + 0.02, 0, y0 + H - 0.02, 0, o); // cornice band
    } else {
      k.box("metal", W + 0.12, H + 0.12, 0.04, 0, cy, fz - 0.005, {
        color: 0x4a4a46,
        rust: 0.3,
      }); // wall frame
    }
    k.cbox("metal", W, H, Dp, 0, cy, 0, Object.assign({ bevel: 0.035 }, o));
    // door: raised frame round a recessed panel
    const dw = W - 0.1,
      dh = H - 0.12;
    k.box("metal", dw, dh, 0.03, 0, cy, fz - 0.015, o);
    k.box("metal", dw - 0.1, dh - 0.1, 0.012, 0, cy, fz - 0.034, {
      color: v === 1 ? 0x2c3a2c : 0x2e2e2c,
      rust: 0.2,
    });
    for (const [x, y] of [
      [-dw / 2 + 0.03, cy],
      [dw / 2 - 0.03, cy],
    ])
      k.box("metal", 0.02, dh, 0.015, x, y, fz - 0.035, o);
    // hinge knuckles (right)
    for (const hy of [0.22, 0.78])
      k.cyl(
        "metal",
        0.028,
        0.028,
        0.14,
        dw / 2 + 0.02,
        y0 + H * hy,
        fz - 0.02,
        { seg: 8, color: 0x5a5a54 },
      );
    // combination dial: chrome ring + printed dial + centre knob
    const dy = cy + H * 0.12;
    k.torus(
      "metal",
      0.1,
      0.014,
      -0.02,
      dy,
      fz - 0.045,
      Object.assign({ rseg: 4, tseg: 16 }, chrome),
    );
    k.quad("safe_dial", 0.19, 0.19, -0.02, dy, fz - 0.043, {
      ry: PI,
      ao: [1, 1],
    });
    k.cyl(
      "metal",
      0.03,
      0.035,
      0.04,
      -0.02,
      dy,
      fz - 0.06,
      Object.assign({ rx: PI / 2, seg: 10 }, chrome),
    );
    // three-spoke handle wheel
    const hx = -0.02,
      hy2 = cy - H * 0.18;
    k.cyl(
      "metal",
      0.025,
      0.025,
      0.08,
      hx,
      hy2,
      fz - 0.07,
      Object.assign({ rx: PI / 2, seg: 8 }, chrome),
    );
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3 + 0.4,
        ex = hx + Math.cos(a) * 0.1,
        ey = hy2 + Math.sin(a) * 0.1;
      k.seg("metal", [hx, hy2, fz - 0.1], [ex, ey, fz - 0.1], 0.011, chrome);
      k.sphere(
        "metal",
        0.02,
        ex,
        ey,
        fz - 0.1,
        Object.assign({ wseg: 6, hseg: 4 }, chrome),
      );
    }
    // keyhole escutcheon + gilt maker's line
    k.box("metal", 0.04, 0.06, 0.01, dw / 2 - 0.12, cy - H * 0.05, fz - 0.042, {
      color: 0xa08a4a,
    });
    k.box(
      "metal",
      0.01,
      0.025,
      0.012,
      dw / 2 - 0.12,
      cy - H * 0.05,
      fz - 0.046,
      blk,
    );
    if (v !== 2)
      k.quad("white", 0.34, 0.035, 0, y0 + H - 0.1, fz - 0.036, {
        ry: PI,
        color: 0xc8a040,
      });
    // rivet rows on the sides
    if (v !== 2)
      for (const sx of [-1, 1])
        for (let i = 0; i < 4; i++)
          k.sphere(
            "metal",
            0.012,
            sx * (W / 2 + 0.002),
            y0 + 0.12 + (i * (H - 0.24)) / 3,
            fz + 0.06,
            { wseg: 4, hseg: 3, color: 0x2a2a28 },
          );
    k.meta.collider = { w: W, d: Dp, h: y0 + H };
    k.meta.container = { name: "Safe", loot: "safe" };
    k.meta.interactY = y0 + H * 0.6;
    k.meta.tier = "small";
  });

  // ---------------- ammo box ----------------
  D("ammo_box", (k, r, v) => {
    const o = { color: C.armyGreen, rust: 0.3 };
    const L = v === 1 ? 0.9 : 0.5;
    k.cbox(
      "metal",
      L,
      0.3,
      0.26,
      0,
      0.15,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.cbox(
      "metal",
      L + 0.02,
      0.05,
      0.28,
      0,
      0.31,
      0,
      Object.assign({ bevel: 0.015 }, o),
    );
    k.seg("metal", [-0.08, 0.34, 0], [0.08, 0.34, 0], 0.012, {
      color: 0x3a3a34,
    });
    k.quad("ammo_stencil", L * 0.8, 0.2, 0, 0.16, -0.132, { ry: PI });
    k.meta.collider = { w: L, d: 0.3, h: 0.35 };
    k.meta.container = { name: "Ammo Box", loot: "ammo_box" };
    k.meta.interactY = 0.3;
    k.meta.tier = "small";
  });

  // ---------------- first aid box (wall mounted, y ~1.4) ----------------
  D("first_aid", (k, r, v) => {
    // FO3 first aid box: enamelled white steel, a lid with a raised lip hinged along the top, two spring
    // latches, a carry handle, the red cross and a stencilled label; v1 lies on the floor
    const y = v === 1 ? 0.12 : 1.4;
    const wh = { color: 0xe6e2d4, rust: 0.18, grime: 0.3 };
    k.cbox(
      "metal",
      0.45,
      0.35,
      0.1,
      0,
      y,
      0.02,
      Object.assign({ bevel: 0.025 }, wh),
    ); // body
    k.cbox(
      "metal",
      0.47,
      0.37,
      0.05,
      0,
      y,
      -0.05,
      Object.assign({ bevel: 0.02 }, wh),
    ); // lid
    k.box("metal", 0.43, 0.012, 0.04, 0, y + 0.19, -0.05, { color: 0x8a8a80 }); // piano hinge
    k.quad("firstaid", 0.2, 0.2, 0, y + 0.03, -0.077, { ry: PI });
    k.box("metal", 0.24, 0.03, 0.005, 0, y - 0.11, -0.077, { color: 0xa81a14 }); // FIRST AID band
    for (const sx of [-1, 1]) {
      k.box("metal", 0.05, 0.035, 0.03, sx * 0.17, y - 0.19, -0.05, {
        color: C.chrome,
      }); // latches
      k.box("metal", 0.03, 0.05, 0.012, sx * 0.17, y - 0.165, -0.078, {
        color: C.chrome,
      });
    }
    k.seg("metal", [-0.07, y - 0.19, -0.02], [0.07, y - 0.19, -0.02], 0.009, {
      color: 0x3a3a34,
    }); // handle
    k.meta.container = { name: "First Aid Box", loot: "first_aid" };
    k.meta.interactY = y;
    k.meta.tier = "small";
  });

  // ---------------- rounded 1950s fridge ----------------
  D("fridge", (k, r, v) => {
    const o = {
      color: [0xe8e0d0, 0x9ac8c0, 0xe0c0b8][v % 3],
      rust: 0.35 + r() * 0.2,
    };
    k.cbox(
      "metal",
      0.8,
      1.65,
      0.72,
      0,
      0.9,
      0,
      Object.assign({ bevel: 0.1 }, o),
    );
    k.cyl(
      "metal",
      0.36,
      0.36,
      0.8,
      0,
      1.68,
      0,
      Object.assign(
        { rz: PI / 2, seg: 12, thetaLength: PI, s: [0.3, 1, 1] },
        o,
      ),
    );
    k.box("metal", 0.72, 0.02, 0.02, 0, 1.25, -0.37, { color: 0x6a6a60 }); // door seam
    k.cbox("metal", 0.06, 0.3, 0.06, 0.3, 1.1, -0.39, {
      color: C.chrome,
      bevel: 0.02,
    });
    k.quad("white", 0.3, 0.05, 0, 1.55, -0.365, { ry: PI, color: 0xa8a8a0 }); // brand plate
    k.boxB("metal", 0.76, 0.08, 0.68, 0, 0, 0, { color: 0x2a2a28 });
    k.meta.collider = { w: 0.8, d: 0.74, h: 1.85 };
    k.meta.container = { name: "Refrigerator", loot: "fridge" };
    k.meta.interactY = 1.1;
    k.meta.tier = "small";
  });

  // ---------------- steel office desk ----------------
  D("desk", (k, r, v) => {
    const o = { color: [0x6a6e66, 0x5a6a5a, 0x7a7266][v % 3], rust: 0.25 };
    k.cbox(
      "metal",
      1.5,
      0.05,
      0.78,
      0,
      0.76,
      0,
      Object.assign({ bevel: 0.015 }, o),
    );
    k.boxB("metal", 0.45, 0.72, 0.72, 0.5, 0.02, 0, o); // drawer pedestal
    k.boxB("metal", 0.04, 0.72, 0.72, -0.72, 0.02, 0, o);
    k.boxB("metal", 1.0, 0.45, 0.03, -0.2, 0.28, 0.34, o); // modesty panel
    for (let i = 0; i < 3; i++) {
      k.box("metal", 0.41, 0.2, 0.02, 0.5, 0.64 - i * 0.23, -0.37, {
        color: 0x5a5e56,
        rust: 0.2,
      });
      k.box("metal", 0.12, 0.025, 0.03, 0.5, 0.67 - i * 0.23, -0.39, {
        color: C.chrome,
      });
    }
    // desk clutter: papers, a mug, a pencil cup, maybe a phone
    for (let i = 0; i < 3; i++)
      k.quad(
        "paper",
        0.2,
        0.28,
        (r() - 0.5) * 1.0,
        0.788 + i * 0.002,
        (r() - 0.5) * 0.4,
        { rx: -PI / 2, rz: r() * 0.8, color: 0xe8e0cc },
      );
    k.cyl("plain", 0.04, 0.035, 0.1, -0.55, 0.84, -0.15, {
      seg: 8,
      color: 0xd8d0c0,
    });
    if (r() < 0.5) {
      k.cbox("plain", 0.22, 0.1, 0.18, 0.45, 0.84, 0.15, {
        color: 0x1a1a1a,
        bevel: 0.03,
      });
      k.box("plain", 0.22, 0.05, 0.05, 0.45, 0.91, 0.15, {
        color: 0x1a1a1a,
        rz: 0.1,
      });
    }
    k.meta.collider = { w: 1.5, d: 0.8, h: 0.8 };
    k.meta.container = { name: "Desk", loot: "desk" };
    k.meta.interactY = 0.7;
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ---------------- filing cabinet ----------------
  D("file_cabinet", (k, r, v) => {
    // four-drawer steel filing cabinet: rounded carcass on a recessed plinth, drawer fronts with pull handles
    // and label holders (typed cards), a lock plug at the top; the odd drawer yanked out with folders in it
    const o = {
      color: [0x6a6e66, 0x5a6a5a, 0x8a8270][v % 3],
      rust: 0.3,
      grime: 0.3,
    };
    const n = 4;
    k.boxB("metal", 0.44, 0.06, 0.6, 0, 0, 0.02, { color: 0x2a2a28 }); // plinth
    k.cbox(
      "metal",
      0.48,
      1.29,
      0.65,
      0,
      0.06 + 0.645,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.cyl("metal", 0.014, 0.014, 0.02, 0.17, 1.3, -0.33, {
      rx: PI / 2,
      seg: 8,
      color: 0xb8b4a4,
    }); // lock plug
    for (let i = 0; i < n; i++) {
      const open = r() < 0.2 ? 0.28 : 0;
      const dy = 1.17 - i * 0.31;
      k.cbox("metal", 0.44, 0.285, 0.03, 0, dy, -0.335 - open, {
        bevel: 0.008,
        color: 0x5a5e56,
        rust: 0.22,
      });
      k.box("metal", 0.16, 0.022, 0.035, 0, dy + 0.06, -0.36 - open, {
        color: C.chrome,
      }); // pull
      for (const sx of [-0.07, 0.07])
        k.box("metal", 0.012, 0.03, 0.03, sx, dy + 0.06, -0.35 - open, {
          color: C.chrome,
        });
      k.box("metal", 0.11, 0.05, 0.006, 0, dy + 0.1, -0.352 - open, {
        color: 0x9a9a90,
      }); // label frame
      k.box("plain", 0.095, 0.035, 0.004, 0, dy + 0.1, -0.356 - open, {
        color: 0xe8e0c8,
      });
      if (open) {
        k.boxB("metal", 0.4, 0.24, open, 0, dy - 0.12, -0.33 - open / 2, o);
        for (let f = 0; f < 6; f++)
          k.box(
            "plain",
            0.36,
            0.2 + r() * 0.04,
            0.012,
            0,
            dy - 0.03,
            -0.35 - open + 0.03 + f * 0.04,
            {
              rx: (r() - 0.5) * 0.3,
              color: [0xc8b078, 0xd8c890, 0xb89868][(r() * 3) | 0],
            },
          );
      }
    }
    if (r() < 0.3)
      k.box("plain", 0.22, 0.012, 0.3, 0.05, 1.356, 0.05, {
        ry: 0.3,
        color: 0xe0d8c0,
      }); // papers on top
    k.meta.collider = { w: 0.5, d: 0.66, h: 1.35 };
    k.meta.container = { name: "Filing Cabinet", loot: "file_cabinet" };
    k.meta.interactY = 1.0;
    k.meta.tier = "small";
  });

  // ---------------- dresser (wooden chest of drawers) ----------------
  // v0 plain walnut chest with a mirror on a harp frame, v1 no mirror (lamp + doily on top), v2 painted
  // nursery white with a drawer pulled out. Container-capable (loot table `dresser`).
  D("dresser", (k, r, v) => {
    const wood = {
      color: [0x5a3a22, 0x6a4a2a, 0xc8c0b0][v % 3],
      rust: 0,
      grime: 0.3,
    };
    const dark = { color: v % 3 === 2 ? 0x9a948a : 0x3a2414, grime: 0.3 };
    const W = 1.1,
      H = 0.86,
      Dd = 0.48;
    k.boxB("wood", W - 0.06, 0.08, Dd - 0.04, 0, 0, 0.02, dark); // plinth
    k.cbox(
      "wood",
      W,
      H - 0.1,
      Dd,
      0,
      0.08 + (H - 0.1) / 2,
      0,
      Object.assign({ bevel: 0.012 }, wood),
    ); // carcass
    k.cbox(
      "wood",
      W + 0.04,
      0.03,
      Dd + 0.03,
      0,
      H + 0.005,
      0,
      Object.assign({ bevel: 0.008 }, dark),
    ); // top
    const rows = [
      [0.68, 2],
      [0.47, 1],
      [0.27, 1],
    ];
    let n = 0;
    for (const [dy, cols] of rows) {
      for (let c = 0; c < cols; c++) {
        const w = cols === 2 ? W / 2 - 0.06 : W - 0.08,
          x = cols === 2 ? (c ? 1 : -1) * (W / 4) : 0;
        const open = (v % 3 === 2 && n === 2) || r() < 0.12 ? 0.18 : 0;
        k.cbox(
          "wood",
          w,
          0.17,
          0.025,
          x,
          dy,
          -Dd / 2 - 0.006 - open,
          Object.assign({ bevel: 0.006 }, wood),
        );
        for (const hx of cols === 2 ? [0] : [-0.25, 0.25])
          k.box("metal", 0.09, 0.018, 0.03, x + hx, dy, -Dd / 2 - 0.03 - open, {
            color: 0xb8a060,
          });
        if (open) {
          k.boxB(
            "wood",
            w - 0.04,
            0.14,
            open,
            x,
            dy - 0.07,
            -Dd / 2 - open / 2,
            wood,
          );
          k.box(
            "fabric",
            w - 0.1,
            0.03,
            open - 0.04,
            x,
            dy + 0.02,
            -Dd / 2 - open / 2,
            { color: [0xb0a090, 0x8a7a9a, 0xd0c8b8][(r() * 3) | 0] },
          );
        }
        n++;
      }
    }
    if (v % 3 === 0) {
      // harp-frame mirror standing on the back edge
      for (const sx of [-0.42, 0.42])
        k.box("wood", 0.04, 0.6, 0.04, sx, H + 0.32, Dd / 2 - 0.05, dark);
      k.cbox(
        "wood",
        0.8,
        0.62,
        0.03,
        0,
        H + 0.4,
        Dd / 2 - 0.05,
        Object.assign({ bevel: 0.01 }, dark),
      );
      k.box("glass", 0.72, 0.54, 0.008, 0, H + 0.4, Dd / 2 - 0.068, {
        color: 0x8a9298,
      });
    } else {
      k.box("fabric", 0.4, 0.004, 0.3, 0.1, H + 0.024, 0, {
        ry: r() * 0.5,
        color: 0xe8e0d0,
      }); // doily
      k.cyl("plain", 0.05, 0.07, 0.22, -0.3, H + 0.13, 0.05, {
        seg: 10,
        color: 0xc8b890,
      }); // lamp base
      k.cyl("fabric", 0.08, 0.13, 0.14, -0.3, H + 0.3, 0.05, {
        seg: 12,
        color: 0xe0d0a8,
      }); // shade
    }
    k.meta.collider = { w: W, d: Dd + 0.04, h: H };
    k.meta.container = { name: "Dresser", loot: "dresser" };
    k.meta.interactY = 0.7;
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- lockers (bank of v+1) ----------------
  // Steel lockers (bank): per bay a door with louvre vents top & bottom, a lift latch, number plate and
  // two hinges; a kick base and top cap run the whole bank. Some doors hang open on a hook & a shelf.
  D("locker", (k, r, v) => {
    const n = Math.max(1, (v % 4) + 1),
      W = 0.42;
    const col = [0x4a6a7a, 0x6a6e66, 0x7a5a3a, 0x5a6a4e][(r() * 4) | 0];
    const o = { color: col, rust: 0.35, grime: 0.3 };
    const blk = { color: 0x141413 };
    k.boxB("metal", n * W, 0.08, 0.48, 0, 0, 0.01, {
      color: 0x2a2a28,
      rust: 0.4,
    }); // kick base
    k.boxB("metal", n * W + 0.02, 0.04, 0.52, 0, 1.84, 0, o); // top cap
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * W;
      k.boxB("metal", W - 0.01, 1.76, 0.5, x, 0.08, 0, o);
      const open = r() < 0.25;
      const door = new X.Kit(61);
      door.box("metal", W - 0.05, 1.68, 0.02, 0, 0, 0, o);
      for (const vy of [0.62, -0.62])
        for (let s2 = 0; s2 < 5; s2++)
          door.box(
            "plain",
            W * 0.46,
            0.012,
            0.012,
            0,
            vy + (s2 - 2) * 0.035,
            -0.014,
            blk,
          );
      door.box("metal", 0.035, 0.14, 0.03, W / 2 - 0.08, 0, -0.02, {
        color: C.chrome,
      }); // lift latch
      door.box("plain", 0.08, 0.045, 0.006, 0, 0.42, -0.012, {
        color: 0xc8c0a0,
      }); // number plate
      for (const hy of [0.62, -0.62])
        door.cyl("metal", 0.012, 0.012, 0.08, -W / 2 + 0.03, hy, 0, {
          seg: 6,
          color: 0x3a3a36,
        });
      if (open) {
        // dark interior, a shelf and a hook with something left hanging
        k.box("plain", W - 0.06, 1.66, 0.01, x, 0.98, 0.23, {
          color: 0x1a1a18,
          ao: [1, 1],
        });
        k.box("metal", W - 0.06, 0.02, 0.44, x, 1.55, 0, o);
        if (r() < 0.6)
          k.box("plain", 0.2, 0.6, 0.06, x, 1.05, 0.1, {
            color: [0x5a5a44, 0x3a3a4a, 0x6a4a3a][(r() * 3) | 0],
            rz: 0.05,
          });
        const sw = 1.1 + r() * 0.5; // door swung open about its left hinge
        const wd = W - 0.05,
          hx = x - W / 2 + 0.025;
        k.include(door, {
          x: hx + (wd / 2) * Math.cos(sw),
          y: 0.98,
          z: -0.255 - (wd / 2) * Math.sin(sw),
          ry: sw,
        });
      } else k.include(door, { x, y: 0.98, z: -0.255 });
    }
    k.meta.collider = { w: n * W, d: 0.52, h: 1.88 };
    k.meta.container = { name: "Locker", loot: "locker" };
    k.meta.interactY = 1.1;
    k.meta.tier = "small";
  });

  // ---------------- footlocker ----------------
  D("footlocker", (k, r, v) => {
    // Army footlocker: plywood/steel trunk with a lid band, riveted corner guards, a hasp (an open padlock hangs from it on v2),
    // rope-and-leather end handles and a stencilled U.S. plate
    const o = {
      color: v === 1 ? 0x2a3a5a : C.armyGreen,
      rust: 0.3,
      grime: 0.35,
    };
    const brass = { color: 0x8a7a50, rust: 0.4 };
    k.cbox(
      "metal",
      0.9,
      0.36,
      0.48,
      0,
      0.18,
      0,
      Object.assign({ bevel: 0.02 }, o),
    );
    k.cbox(
      "metal",
      0.92,
      0.09,
      0.5,
      0,
      0.405,
      0,
      Object.assign({ bevel: 0.02 }, o),
    ); // lid
    k.box("metal", 0.93, 0.03, 0.51, 0, 0.36, 0, brass); // lid band
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        for (const yy of [0.03, 0.42])
          k.box("metal", 0.07, 0.07, 0.07, sx * 0.44, yy, sz * 0.23, brass); // corner guards
    for (const sx of [-1, 1]) {
      k.torus("metal", 0.06, 0.012, sx * 0.462, 0.24, 0, {
        ry: PI / 2,
        arc: PI,
        rz: PI,
        rseg: 3,
        tseg: 6,
        color: 0x4a3a2a,
      }); // end handles
      k.box("metal", 0.012, 0.04, 0.14, sx * 0.456, 0.3, 0, brass);
    }
    k.box("metal", 0.08, 0.12, 0.02, 0, 0.35, -0.255, brass); // hasp
    if (v === 2) {
      k.box("metal", 0.07, 0.07, 0.03, 0.03, 0.25, -0.275, {
        rz: 0.5,
        color: 0x6a6a60,
        rust: 0.4,
      });
      k.torus("metal", 0.022, 0.006, 0.0, 0.3, -0.27, {
        rz: 0.9,
        rseg: 3,
        tseg: 6,
        arc: PI,
        color: 0xa8a8a0,
      });
    }
    k.quad("white", 0.3, 0.08, 0, 0.19, -0.243, { ry: PI, color: 0xd8d0b8 });
    k.meta.collider = { w: 0.92, d: 0.5, h: 0.45 };
    k.meta.container = { name: "Footlocker", loot: "footlocker" };
    k.meta.interactY = 0.4;
    k.meta.tier = "small";
  });

  // ---------------- toolbox ----------------
  D("toolbox", (k, r, v) => {
    if (v === 1) {
      // rolling tool chest
      const o = { color: 0xa01a14, rust: 0.3 };
      k.cbox(
        "metal",
        0.75,
        0.9,
        0.48,
        0,
        0.55,
        0,
        Object.assign({ bevel: 0.03 }, o),
      );
      for (let i = 0; i < 5; i++) {
        k.box("metal", 0.7, 0.14, 0.02, 0, 0.9 - i * 0.16, -0.245, {
          color: 0x8a1410,
        });
        k.box("metal", 0.4, 0.02, 0.03, 0, 0.94 - i * 0.16, -0.26, {
          color: C.chrome,
        });
      }
      for (const sx of [-0.3, 0.3])
        for (const sz of [-0.18, 0.18])
          k.cyl("plain", 0.05, 0.05, 0.04, sx, 0.05, sz, {
            rx: PI / 2,
            seg: 8,
            color: 0x1a1a1a,
          });
      k.meta.collider = { w: 0.75, d: 0.5, h: 1.0 };
      k.meta.interactY = 0.9;
    } else {
      const o = { color: 0xa81a14, rust: 0.4 };
      k.cbox(
        "metal",
        0.55,
        0.22,
        0.24,
        0,
        0.11,
        0,
        Object.assign({ bevel: 0.02 }, o),
      );
      k.cbox(
        "metal",
        0.56,
        0.06,
        0.25,
        0,
        0.25,
        0,
        Object.assign({ bevel: 0.015 }, o),
      );
      k.seg("metal", [-0.12, 0.28, 0], [-0.12, 0.34, 0], 0.01, {
        color: 0x3a3a34,
      });
      k.seg("metal", [0.12, 0.28, 0], [0.12, 0.34, 0], 0.01, {
        color: 0x3a3a34,
      });
      k.seg("metal", [-0.12, 0.34, 0], [0.12, 0.34, 0], 0.012, {
        color: 0x3a3a34,
      });
      k.meta.interactY = 0.25;
    }
    k.meta.container = { name: "Toolbox", loot: "toolbox" };
    k.meta.tier = "small";
  });

  // ---------------- beds ----------------
  D("bed", (k, r, v) => {
    const iron = { color: 0x5a5a52, rust: 0.45 };
    const W = v === 1 ? 1.4 : 0.95,
      L = 2.0;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.seg(
          "metal",
          [(sx * W) / 2, 0, (sz * L) / 2],
          [(sx * W) / 2, sz < 0 ? 0.95 : 0.65, (sz * L) / 2],
          0.022,
          iron,
        );
    for (const sz of [-1, 1]) {
      k.seg(
        "metal",
        [-W / 2, 0.35, (sz * L) / 2],
        [W / 2, 0.35, (sz * L) / 2],
        0.02,
        iron,
      );
      k.seg(
        "metal",
        [-W / 2, sz < 0 ? 0.92 : 0.62, (sz * L) / 2],
        [W / 2, sz < 0 ? 0.92 : 0.62, (sz * L) / 2],
        0.02,
        iron,
      );
    }
    for (let i = 0; i < 5; i++) {
      const x = -W / 2 + ((i + 0.5) * W) / 5;
      k.seg("metal", [x, 0.35, -L / 2], [x, 0.9, -L / 2], 0.012, iron);
    }
    for (const sx of [-1, 1])
      k.seg(
        "metal",
        [(sx * W) / 2, 0.35, -L / 2],
        [(sx * W) / 2, 0.35, L / 2],
        0.02,
        iron,
      );
    k.cbox("fabric", W - 0.05, 0.16, L - 0.08, 0, 0.45, 0, {
      bevel: 0.05,
      color: 0xb8ac90,
      grime: 0.45,
      colorFn: (x, y, z) =>
        X.noise3(x * 3 + 1, 0, z * 2) > 0.66 ? 0x8a7050 : 0xb8ac90,
    });
    k.cbox("fabric", W * 0.6, 0.1, 0.35, 0, 0.58, -L / 2 + 0.3, {
      bevel: 0.04,
      color: 0xd8d0c0,
    });
    if (r() < 0.7)
      k.cbox("fabric", W - 0.02, 0.05, L * 0.55, 0, 0.55, L * 0.15, {
        bevel: 0.02,
        color: [0x5a6a8a, 0x8a5a4a, 0x6a7a5a][(r() * 3) | 0],
        rx: 0.02,
      });
    k.meta.collider = { w: W, d: L, h: 0.55 };
    k.meta.interactY = 0.6;
    k.meta.surface = "fabric";
    k.meta.tier = "small";
  });

  // ---------------- workbench ----------------
  D("workbench", (k, r, v) => {
    const wood = { color: 0x9a7a58 };
    k.boxB("wood", 2.0, 0.08, 0.8, 0, 0.86, 0, wood);
    for (const sx of [-0.92, 0.92])
      for (const sz of [-0.34, 0.34])
        k.boxB("wood", 0.09, 0.86, 0.09, sx, 0, sz, { color: 0x7a6040 });
    k.boxB("wood", 1.9, 0.04, 0.7, 0, 0.25, 0, { color: 0x7a6040 });
    // pegboard with tools
    k.boxB("wood", 2.0, 1.1, 0.04, 0, 0.94, 0.38, { color: 0xb09870 });
    for (let i = 0; i < 6; i++) {
      const x = -0.8 + i * 0.32;
      k.box("metal", 0.04, 0.25 + r() * 0.15, 0.02, x, 1.5, 0.35, {
        color: [0x8a8a84, 0xa01a14, 0x5a5a52][i % 3],
        rz: (r() - 0.5) * 0.3,
      });
    }
    // vise, scrap, can of parts
    k.cbox("metal", 0.2, 0.14, 0.18, 0.8, 0.97, -0.2, {
      color: 0x3a4a6a,
      bevel: 0.02,
    });
    k.cyl("metal", 0.08, 0.08, 0.14, -0.6, 0.97, -0.1, {
      seg: 8,
      color: 0x8a8a80,
      rust: 0.6,
    });
    for (let i = 0; i < 4; i++)
      k.box(
        "rust",
        0.15 + r() * 0.2,
        0.02,
        0.1 + r() * 0.1,
        -0.1 + r() * 0.5,
        0.91,
        -0.15 + r() * 0.2,
        { ry: r() * 3, color: 0xffffff },
      );
    k.meta.collider = { w: 2.0, d: 0.85, h: 0.92 };
    k.meta.interactY = 1.0;
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- tabletop radio ----------------
  D("radio", (k, r, v) => {
    const y0 = v === 1 ? 0 : 0;
    k.cbox("wood", 0.5, 0.3, 0.24, 0, y0 + 0.15, 0, {
      bevel: 0.08,
      color: 0x7a4a2a,
    });
    k.quad("radio_dial", 0.3, 0.11, 0, y0 + 0.2, -0.122, {
      ry: PI,
      ao: [1, 1],
    });
    k.box("fabric", 0.36, 0.08, 0.01, 0, y0 + 0.08, -0.121, {
      color: 0xc8b890,
    });
    for (const sx of [-0.19, 0.19])
      k.cyl("plain", 0.03, 0.03, 0.03, sx, y0 + 0.2, -0.13, {
        rx: PI / 2,
        seg: 8,
        color: 0xd8c8a0,
      });
    k.meta.glows = [
      { x: 0, y: y0 + 0.2, z: -0.18, color: 0xffb060, size: 0.6, flicker: 0 },
    ];
    k.meta.interactY = y0 + 0.2;
    k.meta.tier = "small";
  });

  // ---------------- tape reel ----------------
  // a 5-inch audio tape reel lying on its cardboard sleeve: two grey flanges with window cut-outs,
  // brown tape wound on the hub. v % 4 picks the sleeve colour.
  D("tape_reel", (k, r, v) => {
    const col = [0x2a4a8a, 0xa01a14, 0x3a6a3a, 0x8a6a2a][v % 4];
    k.box("plain", 0.14, 0.012, 0.14, 0.015, 0.006, 0.01, {
      ry: 0.2,
      color: col,
    });
    k.box("plain", 0.1, 0.002, 0.05, 0.015, 0.013, -0.02, {
      ry: 0.2,
      color: 0xe8e0c8,
    });
    const y = 0.014;
    k.cyl("plain", 0.06, 0.06, 0.003, 0, y + 0.0015, 0, {
      seg: 18,
      color: 0x9aa0a4,
    });
    k.cyl("plain", 0.045, 0.045, 0.008, 0, y + 0.0055, 0, {
      seg: 16,
      color: 0x4a3020,
    });
    k.cyl("plain", 0.06, 0.06, 0.003, 0, y + 0.011, 0, {
      seg: 18,
      color: 0xb0b6ba,
    });
    k.cyl("plain", 0.012, 0.012, 0.004, 0, y + 0.0135, 0, {
      seg: 8,
      color: 0x1a1a18,
    });
    for (let i = 0; i < 3; i++) {
      const a = (i * X.TAU) / 3;
      k.box(
        "plain",
        0.018,
        0.0015,
        0.03,
        Math.cos(a) * 0.032,
        y + 0.0128,
        Math.sin(a) * 0.032,
        { ry: -a, color: 0x2a2620 },
      );
    }
    k.meta.glows = [
      { x: 0, y: 0.05, z: 0, color: 0xffb347, size: 0.35, flicker: 0 },
    ];
    k.meta.interactY = 0.03;
    k.meta.tier = "small";
  });

  // ---------------- scrip stash ----------------
  // v0: a dented cash tin with its lid sprung open on bundles of folded ration-scrip notes tied with string;
  // v1: a Fizzo Cola picnic cooler with the bundles inside. A few loose notes always end up on the floor.
  function scripBundle(k, x, y, z, ry) {
    k.box("plain", 0.1, 0.022, 0.055, x, y + 0.011, z, {
      ry,
      color: 0xd4ccb0,
      grime: 0.3,
    });
    k.box("plain", 0.012, 0.024, 0.057, x, y + 0.012, z, {
      ry,
      color: 0x5a3a24,
    });
  }
  D("scrip_stash", (k, r, v) => {
    if (v === 1) {
      k.cbox("metal", 0.6, 0.38, 0.4, 0, 0.19, 0, {
        bevel: 0.04,
        color: C.fizzoRed,
        rust: 0.3,
      });
      k.cbox("metal", 0.62, 0.06, 0.42, 0, 0.4, 0, {
        bevel: 0.02,
        color: 0xe8e0d0,
      });
      k.quad("fizzo_truck", 0.5, 0.16, 0, 0.2, -0.203, { ry: PI });
      k.seg("metal", [-0.2, 0.46, 0], [0.2, 0.46, 0], 0.012, {
        color: C.chrome,
      });
      k.meta.interactY = 0.4;
    } else {
      k.cbox("metal", 0.28, 0.07, 0.17, 0, 0.035, 0, {
        bevel: 0.01,
        color: 0x5a6a5a,
        rust: 0.4,
      });
      k.box("metal", 0.28, 0.008, 0.17, 0, 0.14, 0.12, {
        rx: -1.9,
        color: 0x5a6a5a,
        rust: 0.4,
      }); // sprung lid
      for (let i = 0; i < 3; i++)
        scripBundle(
          k,
          -0.08 + i * 0.08,
          0.05,
          (r() - 0.5) * 0.04,
          (r() - 0.5) * 0.3,
        );
      k.meta.interactY = 0.15;
    }
    for (let i = 0; i < 5; i++)
      k.box(
        "plain",
        0.06,
        0.003,
        0.03,
        (r() - 0.5) * 0.5,
        0.003,
        -0.15 - r() * 0.2,
        { ry: r() * 6, rx: (r() - 0.5) * 0.3, color: 0xd8d0b4, grime: 0.35 },
      );
    k.meta.container = { name: "Scrip Stash", loot: "scrip_stash" };
    k.meta.tier = "small";
  });

  // ---------------- duffle bag ----------------
  D("duffle_bag", (k, r, v) => {
    k.cyl("fabric", 0.2, 0.2, 0.75, 0, 0.18, 0, {
      rz: PI / 2,
      seg: 10,
      color: [0x4a5236, 0x3a3a3a, 0x6a5a3a][v % 3],
      flat: false,
      s: [0.9, 1, 1],
    });
    for (const sx of [-1, 1])
      k.sphere("fabric", 0.2, sx * 0.375, 0.18, 0, {
        s: [0.3, 0.9, 1],
        color: [0x4a5236, 0x3a3a3a, 0x6a5a3a][v % 3],
        wseg: 8,
        hseg: 5,
      });
    k.torus("fabric", 0.12, 0.015, 0, 0.36, 0, {
      color: 0x2a2a22,
      arc: PI,
      tseg: 8,
      rseg: 3,
    });
    k.meta.container = { name: "Duffle Bag", loot: "duffle_bag" };
    k.meta.interactY = 0.3;
    k.meta.tier = "small";
  });

  // ---------------- cash register ----------------
  D("cash_register", (k, r, v) => {
    const o = { color: 0x8a7a5a, rust: 0.2 };
    k.cbox(
      "metal",
      0.45,
      0.2,
      0.42,
      0,
      0.1,
      0,
      Object.assign({ bevel: 0.03 }, o),
    );
    k.cbox(
      "metal",
      0.4,
      0.22,
      0.2,
      0,
      0.3,
      0.08,
      Object.assign({ bevel: 0.03, rx: 0.3 }, o),
    );
    for (let i = 0; i < 12; i++)
      k.cyl(
        "plain",
        0.018,
        0.018,
        0.03,
        -0.14 + (i % 4) * 0.09,
        0.28 + ((i / 4) | 0) * 0.05,
        -0.02 + ((i / 4) | 0) * 0.03,
        { seg: 6, color: 0xe8e0d0, rx: 0.3 },
      );
    k.box("metal", 0.3, 0.08, 0.04, 0, 0.46, 0.15, { color: 0x2a2a28 });
    k.meta.container = { name: "Cash Register", loot: "register" };
    k.meta.interactY = 0.3;
    k.meta.tier = "small";
  });

  // ---------------- shelving unit ----------------
  // Store gondola / wall shelving: steel uprights, pegboard back, 4 shelves
  // with price-tag rails. v0 stocked (labelled cereal boxes, cans, Fizzo
  // bottles — mostly picked over), v1 ransacked (a few survivors, items on
  // their sides, a sagging shelf, goods spilled at the foot), v2 bare.
  const W_SH = 1.8,
    D_SH = 0.5,
    H_SH = 2.0;
  function labelUV(region) {
    return (g) => {
      const R = X.atlasRegion(region),
        uv = g.attributes.uv;
      for (let i = 0; i < uv.count; i++)
        uv.setXY(
          i,
          X.lerp(R.u0, R.u1, X.clamp(uv.getX(i), 0, 1)),
          X.lerp(R.v0, R.v1, X.clamp(uv.getY(i), 0, 1)),
        );
    };
  }
  /** A labelled product: cereal-style box (abox) or tin can (label wraps the cylinder). */
  function product(k, r, x, y, z, o) {
    o = o || {};
    const pi = (r() * X.PRODUCTS.length) | 0,
      reg = "prod_" + pi,
      kind = X.PRODUCTS[pi];
    const lying = o.lying || false;
    if (kind === "can") {
      const g = new THREE.CylinderGeometry(0.038, 0.038, 0.11, 8, 1, false);
      k.add("atlas", g, {
        x,
        y: y + (lying ? 0.038 : 0.055),
        z,
        rz: lying ? PI / 2 : 0,
        ry: r() * 6,
        uv: "keep",
        uvFn: labelUV(reg),
        color: 0xe0dcd0,
        grime: 0.25,
        ao: [0.8, 0.1],
      });
    } else {
      const bw = 0.17 + r() * 0.05,
        bh = 0.26 + r() * 0.06,
        bd = 0.07;
      k.abox(reg, bw, bh, bd, x, y + (lying ? bd / 2 : bh / 2), z, {
        ry: (r() - 0.5) * 0.25 + (o.ry || 0),
        rx: lying ? -PI / 2 : o.lean ? 0.25 : 0,
        color: 0xe8e4dc,
        grime: 0.2,
        ao: [0.85, 0.2],
      });
    }
  }
  X.product = product;
  /** Tall ribbed Fizzo bottle for shelves and floors (low poly): ribbed lower body, long neck, label band. */
  function fizzoBottleSmall(k, r, x, y, z, lying) {
    k.lathe(
      "glass",
      [
        [0, 0],
        [0.029, 0],
        [0.031, 0.02],
        [0.028, 0.032],
        [0.031, 0.044],
        [0.028, 0.056],
        [0.031, 0.068],
        [0.03, 0.13],
        [0.013, 0.17],
        [0.01, 0.22],
        [0, 0.22],
      ],
      x,
      y + (lying ? 0.032 : 0),
      z,
      { seg: 7, color: 0x4a1208, rz: lying ? PI / 2 : 0, ry: r() * 6 },
    );
    if (!lying)
      k.cyl("plain", 0.0315, 0.0315, 0.035, x, y + 0.1, z, {
        seg: 7,
        color: 0xd8d0c0,
        open: true,
      });
  }
  X.fizzoBottleSmall = fizzoBottleSmall;
  D("shelf", (k, r, v) => {
    const o = {
      color: [0x7a7a70, 0x6a7a74, 0x8a7a64][(r() * 3) | 0],
      rust: 0.45,
    };
    const W = W_SH,
      Dp = D_SH,
      H = H_SH;
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB("metal", 0.045, H, 0.045, (sx * W) / 2, 0, (sz * Dp) / 2, o);
    // pegboard back + kick plate
    k.boxB("metal", W, H - 0.2, 0.02, 0, 0.12, Dp / 2 - 0.02, {
      color: 0x9a9280,
      rust: 0.2,
      grime: 0.35,
    });
    k.boxB("metal", W, 0.12, 0.02, 0, 0, -Dp / 2 + 0.02, o);
    const sag = v === 1 ? 1 + ((r() * 3) | 0) : -1;
    for (let i = 0; i < 4; i++) {
      const y = 0.12 + i * 0.52;
      const tilt = i === sag ? 0.12 : 0;
      k.boxB(
        "metal",
        W,
        0.03,
        Dp,
        0,
        y - (tilt ? 0.05 : 0),
        0,
        Object.assign({ rz: tilt }, o),
      );
      // price-tag rail
      k.box(
        "plain",
        W,
        0.035,
        0.012,
        0,
        y + 0.015 - (tilt ? 0.05 : 0),
        -Dp / 2 - 0.006,
        { color: 0xc8b890, grime: 0.4, rz: tilt },
      );
      if (v === 2) continue;
      // facings: products stand in rows, many gaps where scavengers took them
      const keep = v === 0 ? 0.78 : 0.3;
      for (let x = -W / 2 + 0.14; x < W / 2 - 0.1; x += 0.2 + r() * 0.06) {
        if (r() > keep) continue;
        const t = r(),
          zz = -Dp / 2 + 0.12 + r() * 0.12,
          lying = v === 1 ? r() < 0.5 : r() < 0.12;
        if (tilt) continue;
        if (t < 0.62) {
          product(k, r, x, y + 0.03, zz, { lying, lean: !lying && r() < 0.12 });
          if (!lying && r() < 0.4)
            product(k, r, x + (r() - 0.5) * 0.04, y + 0.03, zz + 0.12, {}); // second row behind
        } else fizzoBottleSmall(k, r, x, y + 0.03, zz, lying);
      }
    }
    // a couple of things knocked off onto the floor in front
    if (v === 1)
      for (let i = 0; i < 4; i++) {
        const x = (r() - 0.5) * W,
          z = -Dp / 2 - 0.2 - r() * 0.5;
        if (r() < 0.6) product(k, r, x, 0, z, { lying: true, ry: r() * 6 });
        else fizzoBottleSmall(k, r, x, 0, z, true);
      }
    k.meta.collider = { w: W, d: Dp, h: H };
    k.meta.surface = "metal";
    k.meta.tier = "small";
  });

  // ---------------- spilled goods (shop floors) ----------------
  D("floor_goods", (k, r, v) => {
    const n = 7 + ((r() * 6) | 0) + v * 4;
    for (let i = 0; i < n; i++) {
      const a = r() * X.TAU,
        d = Math.sqrt(r()) * (0.6 + v * 0.4),
        x = Math.cos(a) * d,
        z = Math.sin(a) * d;
      const t = r();
      if (t < 0.55) product(k, r, x, 0, z, { lying: r() < 0.8, ry: r() * 6 });
      else if (t < 0.75) fizzoBottleSmall(k, r, x, 0, z, true);
      else if (t < 0.88) X.paperBall(k, r, x, z, 1 + r());
      else
        for (let j = 0; j < 3; j++)
          k.box(
            "glass",
            0.05 + r() * 0.06,
            0.004,
            0.03 + r() * 0.04,
            x + (r() - 0.5) * 0.2,
            0.004,
            z + (r() - 0.5) * 0.2,
            { ry: r() * 6, color: 0x5a1a10 },
          ); // broken bottle
    }
    if (v >= 1)
      k.boxB("wood", 0.45, 0.3, 0.32, (r() - 0.5) * 0.6, 0, (r() - 0.5) * 0.6, {
        rz: (PI / 2) * (r() < 0.5 ? 1 : 0),
        ry: r() * 3,
        color: 0x7a6448,
        grime: 0.45,
      }); // torn carton
    k.meta.tier = "small";
  });

  // ---------------- wall signs & posters (flat, mounted ~1.6-2.4 m) ----------------
  const WALL_SIGNS = [
    ["sign_checkout", 1.2, 0.3, 2.3],
    ["sign_sale", 0.6, 0.45, 1.7],
    ["sign_prices", 0.6, 0.45, 1.6],
    ["poster_fizzo", 0.6, 0.9, 1.6],
    ["poster_longwinter", 0.6, 0.9, 1.6],
    ["poster_crunch", 0.6, 0.9, 1.6],
    ["poster_wanted", 0.5, 0.7, 1.5],
    ["sign_open", 0.5, 0.25, 1.9],
    ["poster_neighbor", 0.6, 0.9, 1.6],
  ];
  X.WALL_SIGNS = WALL_SIGNS.length;
  D("wall_sign", (k, r, v) => {
    const ws = WALL_SIGNS[v % WALL_SIGNS.length];
    if (ws[0].indexOf("sign_") === 0)
      k.box("metal", ws[1] + 0.04, ws[2] + 0.04, 0.02, 0, ws[3], 0.012, {
        color: 0x3a3630,
        rust: 0.4,
      });
    k.quad(ws[0], ws[1], ws[2], 0, ws[3], -0.002, {
      ry: PI,
      rz: (r() - 0.5) * 0.06,
      grime: 0.25,
    });
    k.meta.tier = "small";
  });

  // ---------------- shop pendant lamp (long cord; ceiling hides the excess) ----------------
  D("shop_lamp", (k, r, v) => {
    k.seg("plain", [0, 4.6, 0], [0, 2.75, 0], 0.006, { color: 0x1a1a1a });
    k.cyl("metal", 0.04, 0.28, 0.16, 0, 2.7, 0, {
      seg: 12,
      open: true,
      color: 0x3a5a4a,
      rust: 0.3,
    });
    k.sphere("glow", 0.055, 0, 2.62, 0, {
      color: C.bulbWarm,
      s: [1, 1.2, 1],
      wseg: 7,
      hseg: 5,
    });
    k.meta.glows = [
      {
        x: 0,
        y: 2.6,
        z: 0,
        color: 0xffc878,
        size: v === 1 ? 7 : 5,
        flicker: v === 2 ? 0.5 : 0.08,
        interior: true,
      },
      {
        x: 0,
        y: 2.45,
        z: 0,
        color: 0xa07040,
        size: 14,
        flicker: 0,
        interior: true,
      },
    ];
    k.meta.tier = "small";
  });

  // ---------------- shop counter ----------------
  // Old-world corner-store counter: wood body with raised panels, formica top
  // with chrome edge, rusty kick plate, glass display case at one end (a few
  // dusty goods inside), a magazine/cigarette rack and a service bell.
  // variant = length index (0: 2.0 m, 1: 2.6 m, 2: 3.2 m, 3: 3.8 m). Front
  // (customer side) faces -z like every prototype; the clerk stands at +z.
  D("shop_counter", (k, r, v) => {
    const W = [2.0, 2.6, 3.2, 3.8][v | 0] || 2.6,
      Dp = 0.7,
      H = 1.0;
    const wood = { color: 0x92704c, grime: 0.3 };
    const top = { color: 0xb8c4b0, grime: 0.3 };
    const caseW = Math.min(1.1, W * 0.38),
      bodyW = W - caseW;
    const bx = -W / 2 + bodyW / 2,
      cx = W / 2 - caseW / 2;
    // kick plate + body
    k.boxB("metal", W, 0.12, Dp - 0.08, 0, 0, 0.04, {
      color: 0x3a3632,
      rust: 0.6,
    });
    k.boxB("wood", bodyW, H - 0.17, Dp, bx, 0.12, 0, wood);
    // raised panels on the customer face
    const np = Math.max(2, Math.round(bodyW / 0.7));
    for (let i = 0; i < np; i++) {
      const px = -W / 2 + (i + 0.5) * (bodyW / np);
      k.boxB("wood", bodyW / np - 0.12, 0.52, 0.03, px, 0.26, -Dp / 2 - 0.01, {
        color: 0xa27e58,
        grime: 0.35,
      });
      k.boxB("wood", bodyW / np - 0.2, 0.4, 0.02, px, 0.32, -Dp / 2 - 0.03, {
        color: 0x7e603e,
        grime: 0.4,
      });
    }
    // formica top with chrome edge, overhanging the customer side
    // worn formica: mint boomerang speckle, rubbed through to the brown core along the customer edge and by the till
    k.box("metal", W + 0.06, 0.05, Dp + 0.1, 0, H - 0.025, -0.03, {
      segs: [Math.round(W * 6), 1, 5],
      grime: 0.25,
      ao: [1, 1],
      colorFn: (x, y, z) => {
        const n = X.noise3(x * 9, 0, z * 9),
          wear =
            X.noise3(x * 1.7 + 3, 1, z * 2.3) +
            (z < -0.3 ? 0.35 : 0) -
            Math.abs(x + W * 0.1) * 0.05;
        if (wear > 0.95) return 0x6a5038;
        return n > 0.66 ? 0x5a7a70 : n < 0.3 ? 0xc8d8cc : 0x9ab8aa;
      },
    });
    k.box("metal", W + 0.06, 0.012, Dp + 0.1, 0, H - 0.056, -0.03, {
      color: 0x3a3228,
    }); // dark underside lip
    k.box("metal", W + 0.08, 0.04, 0.02, 0, H - 0.03, -Dp / 2 - 0.09, {
      color: C.chrome,
    });
    // glass display case at the +x end: metal frame + glass sides, goods inside
    const fr = { color: 0x8a8a80, rust: 0.3 };
    k.boxB("metal", caseW, 0.12, Dp, cx, 0.12, 0, fr);
    k.boxB("metal", caseW, 0.04, Dp, cx, 0.52, 0, fr);
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "metal",
          0.035,
          H - 0.17,
          0.035,
          cx + sx * (caseW / 2 - 0.02),
          0.12,
          sz * (Dp / 2 - 0.02),
          fr,
        );
    k.box(
      "glass",
      caseW - 0.04,
      H - 0.3,
      0.01,
      cx,
      0.12 + (H - 0.17) / 2,
      -Dp / 2 + 0.01,
      { color: 0x9ab0a8 },
    );
    k.box(
      "glass",
      0.01,
      H - 0.3,
      Dp - 0.04,
      cx + caseW / 2 - 0.01,
      0.12 + (H - 0.17) / 2,
      0,
      { color: 0x9ab0a8 },
    );
    for (let i = 0; i < 5; i++) {
      const gx = cx + (r() - 0.5) * (caseW - 0.25),
        gz = (r() - 0.5) * (Dp - 0.25),
        sh = i < 3 ? 0.24 : 0.56;
      if (r() < 0.5)
        k.boxB("plain", 0.14, 0.09, 0.1, gx, sh, gz, {
          color: [0xc8a040, 0x2a60a8, 0xa83028, 0xd8d0b8][(r() * 4) | 0],
          ry: r() * 3,
        });
      else
        k.cyl("metal", 0.035, 0.035, 0.11, gx, sh + 0.055, gz, {
          seg: 8,
          color: [0xb02020, 0x8a8a80, 0x3a6a3a][(r() * 3) | 0],
          rust: 0.5,
        });
    }
    // clerk side: shelf under the top, a couple of boxes on it
    k.boxB("wood", bodyW - 0.1, 0.03, Dp - 0.25, bx, 0.55, 0.1, wood);
    for (let i = 0; i < 3; i++)
      if (r() < 0.7)
        k.boxB(
          "plain",
          0.3,
          0.18,
          0.22,
          bx + (r() - 0.5) * (bodyW - 0.5),
          0.58,
          0.12,
          { color: 0x8a7050, ry: (r() - 0.5) * 0.4 },
        );
    // countertop clutter: wire rack of magazines/cigarettes, service bell, cans
    const rx0 = -W / 2 + 0.35;
    k.boxB("metal", 0.36, 0.02, 0.2, rx0, H, 0.18, { color: 0x3a3a38 });
    for (let t = 0; t < 3; t++)
      k.boxB(
        "plain",
        0.34,
        0.12,
        0.03,
        rx0,
        H + 0.02 + t * 0.07,
        0.12 + t * 0.06,
        { color: [0xc83028, 0xe0c040, 0x2a5a9a][t], rx: -0.35, grime: 0.4 },
      );
    k.cyl("metal", 0.045, 0.05, 0.015, -W / 2 + 0.12, H + 0.008, -0.22, {
      seg: 10,
      color: 0x2a2a28,
    });
    k.sphere("metal", 0.045, -W / 2 + 0.12, H + 0.015, -0.22, {
      color: C.chrome,
      wseg: 8,
      hseg: 4,
      phiLength: PI / 2,
    });
    for (let i = 0; i < 3; i++)
      if (r() < 0.6)
        k.cyl(
          "metal",
          0.033,
          0.033,
          0.12,
          cx + (r() - 0.5) * caseW * 0.6,
          H + 0.06,
          (r() - 0.5) * 0.3,
          { seg: 8, color: 0xa02820, rust: 0.5 },
        );
    k.meta.collider = { w: W + 0.06, d: Dp + 0.1, h: H };
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- campfire ----------------
  D("campfire", (k, r, v) => {
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * X.TAU;
      k.cbox(
        "concrete",
        0.22,
        0.14,
        0.18,
        Math.cos(a) * 0.5,
        0.07,
        Math.sin(a) * 0.5,
        { ry: -a, bevel: 0.04, color: 0x8a8478 },
      );
    }
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * X.TAU;
      k.seg(
        "wood",
        [Math.cos(a) * 0.35, 0.03, Math.sin(a) * 0.35],
        [Math.cos(a) * 0.05, 0.25, Math.sin(a) * 0.05],
        0.045,
        { color: 0x3a2a1a, grime: 0.6 },
      );
    }
    k.cyl("glow", 0.3, 0.32, 0.02, 0, 0.02, 0, { seg: 10, color: 0xff5a1a });
    if (v === 1) {
      // cooking spit with meat
      for (const sx of [-0.6, 0.6]) {
        k.seg("wood", [sx, 0, -0.1], [sx, 0.8, 0], 0.02, { color: 0x5a4a38 });
        k.seg("wood", [sx, 0, 0.1], [sx, 0.8, 0], 0.02, { color: 0x5a4a38 });
      }
      k.seg("metal", [-0.7, 0.78, 0], [0.7, 0.78, 0], 0.012, {
        color: 0x3a3a34,
      });
      k.sphere("plain", 0.12, 0, 0.78, 0, {
        s: [1.6, 0.8, 0.8],
        color: 0x6a3a1a,
        wseg: 8,
        hseg: 5,
      });
    } else if (v === 2) {
      // cooking pot on a tripod
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * X.TAU;
        k.seg(
          "metal",
          [Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55],
          [0, 1.0, 0],
          0.015,
          { color: 0x3a3a34 },
        );
      }
      k.cyl("metal", 0.18, 0.14, 0.22, 0, 0.55, 0, {
        seg: 10,
        color: 0x2a2a28,
        rust: 0.4,
      });
    }
    k.meta.fires = [{ x: 0, y: 0.1, z: 0, scale: 0.8 }];
    k.meta.glows = [
      { x: 0, y: 0.45, z: 0, color: 0xff8a3a, size: 6, flicker: 0.25 },
    ];
    k.meta.tier = "small";
  });

  // ---------------- scrap shack ----------------
  // local: door opening at -z. variants change size & materials.
  D("shack", (k, r, v) => {
    const W = 3.2 + (v % 3) * 0.6,
      Dp = 2.8 + (v % 2) * 0.6,
      H = 2.5;
    const wood = { color: 0x6a5a44 };
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "wood",
          0.12,
          H + (sz > 0 ? 0 : 0.25),
          0.12,
          (sx * W) / 2,
          0,
          (sz * Dp) / 2,
          wood,
        );
    const panel = (x0, x1, z, rotY) => {
      let x = x0;
      while (x < x1 - 0.05) {
        const w = Math.min(x1 - x, 0.6 + r() * 0.6),
          h = H * (0.85 + r() * 0.15);
        const t = r();
        const mat = t < 0.6 ? "rust" : "wood";
        const col =
          mat === "rust"
            ? [0xffffff, 0xd0c0b0, 0xb8a898][(r() * 3) | 0]
            : [0x8a7a60, 0x6a5a48][(r() * 2) | 0];
        const cx = x + w / 2;
        if (rotY)
          k.box(mat, 0.04, h, w, z, h / 2, cx, {
            color: col,
            rx: (r() - 0.5) * 0.05,
            segs: [1, 1, 3],
            uvScale: 0.7,
          });
        else
          k.box(mat, w, h, 0.04, cx, h / 2, z, {
            color: col,
            rz: (r() - 0.5) * 0.05,
            segs: [3, 1, 1],
            uvScale: 0.7,
          });
        x += w * 0.9;
      }
    };
    panel(-W / 2, W / 2, Dp / 2, false); // back wall
    panel(-Dp / 2, Dp / 2, -W / 2, true); // left wall
    panel(-Dp / 2, Dp / 2, W / 2, true); // right wall
    panel(-W / 2, -0.55, -Dp / 2, false); // front left of door
    panel(0.55, W / 2, -Dp / 2, false); // front right of door
    k.box("wood", 1.2, 0.3, 0.05, 0, H - 0.1, -Dp / 2, wood); // lintel
    // sloped corrugated roof
    k.box("rust", W + 0.6, 0.04, Dp + 0.6, 0, H + 0.12, 0, {
      rx: -0.1,
      color: 0xc8b8a8,
      segs: [6, 1, 1],
      uvScale: 0.7,
    });
    // curtain in the doorway, a sign, a lantern
    k.box("fabric", 1.0, 1.7, 0.02, 0, 1.05, -Dp / 2 - 0.05, {
      color: [0x6a5a8a, 0x8a4a3a, 0x4a6a5a][v % 3],
    });
    if (r() < 0.6)
      k.quad(
        r() < 0.5 ? "sign_scrip" : "graffiti_" + ((r() * X.GRAFFITI) | 0),
        0.9,
        0.55,
        -W / 4 - 0.2,
        1.8,
        -Dp / 2 - 0.05,
        { ry: PI },
      );
    k.sphere("glow", 0.07, W / 2 - 0.3, H - 0.3, -Dp / 2 - 0.2, {
      color: C.bulbWarm,
      wseg: 6,
      hseg: 4,
    });
    k.meta.glows = [
      {
        x: W / 2 - 0.3,
        y: H - 0.3,
        z: -Dp / 2 - 0.25,
        color: 0xffc070,
        size: 3,
        flicker: 0.3,
      },
    ];
    // colliders: walls only (door gap)
    k.meta.colliders = [
      { w: W, d: 0.2, h: H, cz: Dp / 2 },
      { w: 0.2, d: Dp, h: H, cx: -W / 2 },
      { w: 0.2, d: Dp, h: H, cx: W / 2 },
      { w: W / 2 - 0.55, d: 0.2, h: H, cx: -(W / 4 + 0.275), cz: -Dp / 2 },
      { w: W / 2 - 0.55, d: 0.2, h: H, cx: W / 4 + 0.275, cz: -Dp / 2 },
      { w: W + 0.6, d: Dp + 0.6, h: 0.1, y0: H + 0.1 },
    ];
    k.meta.tier = "medium";
  });

  // ---------------- auto-turret (tripod "Mark II" style) ----------------
  // Split in two protos: base (static) and head (rotates, see spawn logic)
  D("turret_base", (k, r, v) => {
    const o = { color: 0x5a5e56, rust: 0.3 };
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * X.TAU;
      k.seg(
        "metal",
        [Math.cos(a) * 0.6, 0, Math.sin(a) * 0.6],
        [0, 0.9, 0],
        0.04,
        o,
      );
      k.box(
        "metal",
        0.14,
        0.03,
        0.14,
        Math.cos(a) * 0.6,
        0.015,
        Math.sin(a) * 0.6,
        o,
      );
    }
    k.cyl("metal", 0.14, 0.18, 0.3, 0, 0.95, 0, Object.assign({ seg: 10 }, o));
    k.cyl("metal", 0.2, 0.2, 0.06, 0, 1.12, 0, Object.assign({ seg: 12 }, o));
    k.meta.collider = { w: 0.8, d: 0.8, h: 1.2 };
    k.meta.tier = "small";
  });
  D("turret_head", (k, r, v) => {
    const o = { color: v === 1 ? 0x3a3a38 : 0x6a6e5a, rust: 0.25 };
    k.sphere(
      "metal",
      0.32,
      0,
      0.15,
      0,
      Object.assign({ s: [1, 0.72, 1.1], wseg: 12, hseg: 8 }, o),
    );
    k.cbox(
      "metal",
      0.5,
      0.18,
      0.34,
      0,
      0.0,
      0.1,
      Object.assign({ bevel: 0.04 }, o),
    );
    for (const sx of [-0.12, 0.12]) {
      k.cyl("metal", 0.045, 0.045, 0.7, sx, 0.12, -0.52, {
        rx: PI / 2,
        seg: 8,
        color: 0x2a2a28,
      });
      k.cyl("metal", 0.06, 0.06, 0.16, sx, 0.12, -0.84, {
        rx: PI / 2,
        seg: 8,
        color: 0x1a1a1a,
        open: true,
      });
    }
    k.cyl("glow", 0.06, 0.06, 0.02, 0, 0.3, -0.28, {
      rx: PI / 2 - 0.5,
      seg: 10,
      color: 0xff3020,
    }); // sensor eye
    k.box("metal", 0.2, 0.14, 0.2, 0.28, 0.02, 0.12, { color: C.armyGreen }); // ammo drum
    k.meta.tier = "small";
  });

  // ---------------- lamps (interior / settlement) ----------------
  // 0 floor lamp (lit), 1 desk lamp (lit), 2 hanging bulb (lit), 3 string lights post (lit), 4 lantern (lit), 5 street lamp (lit)
  D("lamp", (k, r, v) => {
    const glow = (x, y, z, s, col) => {
      (k.meta.glows = k.meta.glows || []).push({
        x,
        y,
        z,
        color: col || 0xffcf80,
        size: s,
        flicker: 0.1,
      });
    };
    if (v === 0) {
      k.cyl("metal", 0.18, 0.2, 0.04, 0, 0.02, 0, { seg: 10, color: 0x3a3a34 });
      k.cyl("metal", 0.015, 0.015, 1.5, 0, 0.77, 0, {
        seg: 6,
        color: C.chrome,
      });
      k.cyl("fabric", 0.14, 0.25, 0.32, 0, 1.55, 0, {
        seg: 12,
        open: true,
        color: 0xe8d8b0,
      });
      k.sphere("glow", 0.05, 0, 1.45, 0, {
        color: C.bulbWarm,
        wseg: 6,
        hseg: 4,
      });
      glow(0, 1.5, 0, 3.5);
    } else if (v === 1) {
      k.cyl("metal", 0.1, 0.12, 0.03, 0, 0.015, 0, {
        seg: 10,
        color: 0x2a4a3a,
      });
      k.seg("metal", [0, 0.02, 0], [0.05, 0.3, 0], 0.012, { color: 0x2a4a3a });
      k.seg("metal", [0.05, 0.3, 0], [0.0, 0.42, -0.15], 0.012, {
        color: 0x2a4a3a,
      });
      k.cyl("metal", 0.03, 0.1, 0.12, 0, 0.4, -0.18, {
        seg: 10,
        color: 0x2a4a3a,
        open: true,
        rx: 0.5,
      });
      k.sphere("glow", 0.03, 0, 0.37, -0.2, {
        color: C.bulbWarm,
        wseg: 5,
        hseg: 3,
      });
      glow(0, 0.35, -0.2, 1.5);
    } else if (v === 2) {
      k.seg("plain", [0, 3, 0], [0, 2.4, 0], 0.005, { color: 0x1a1a1a });
      k.sphere("glow", 0.05, 0, 2.35, 0, {
        color: C.bulbWarm,
        s: [1, 1.3, 1],
        wseg: 6,
        hseg: 4,
      });
      k.cyl("metal", 0.02, 0.2, 0.1, 0, 2.43, 0, {
        seg: 10,
        color: 0x5a5a52,
        open: true,
      });
      glow(0, 2.33, 0, 4);
    } else if (v === 3) {
      k.seg("wood", [0, 0, 0], [0, 3.2, 0], 0.05, { color: 0x5a4a38 });
      for (let i = 0; i < 6; i++) {
        const t = i / 5;
        const x = -2.5 * t,
          y = 3.1 - Math.sin(t * PI) * 0.4,
          z = 0;
        k.sphere("glow", 0.04, x, y, z, {
          color: [0xffd080, 0xff8060, 0x80ff90, 0x80c0ff][i % 4],
          wseg: 5,
          hseg: 3,
        });
        glow(x, y, z, 1.2, [0xffd080, 0xff8060, 0x80ff90, 0x80c0ff][i % 4]);
      }
    } else if (v === 4) {
      k.cyl("metal", 0.08, 0.09, 0.03, 0, 0.015, 0, {
        seg: 8,
        color: 0x5a3a2a,
        rust: 0.4,
      });
      k.cyl("glass", 0.07, 0.07, 0.18, 0, 0.12, 0, { seg: 8, color: 0xd8c8a0 });
      k.cyl("metal", 0.04, 0.08, 0.05, 0, 0.23, 0, {
        seg: 8,
        color: 0x5a3a2a,
        rust: 0.4,
      });
      k.torus("metal", 0.05, 0.006, 0, 0.29, 0, {
        color: 0x3a3a34,
        tseg: 8,
        rseg: 3,
      });
      k.sphere("glow", 0.035, 0, 0.12, 0, {
        color: 0xffb050,
        wseg: 5,
        hseg: 3,
      });
      glow(0, 0.14, 0, 2.2, 0xffb060);
    }
    k.meta.tier = "small";
  });

  // ---------------- tables & chairs ----------------
  // table: 0 diner (formica, chrome), 1 wooden kitchen, 2 overturned wooden, 3 small round cafe
  D("table", (k, r, v) => {
    if (v === 0) {
      k.cbox("plain", 1.2, 0.05, 0.8, 0, 0.75, 0, {
        bevel: 0.02,
        color: 0xc8d8c8,
      });
      for (const sz of [-0.41, 0.41])
        k.box("metal", 1.22, 0.05, 0.02, 0, 0.75, sz, { color: C.chrome });
      k.cyl("metal", 0.04, 0.04, 0.73, 0, 0.37, 0, { seg: 8, color: C.chrome });
      k.cyl("metal", 0.25, 0.28, 0.03, 0, 0.015, 0, {
        seg: 12,
        color: C.chrome,
      });
      k.meta.collider = { w: 1.2, d: 0.8, h: 0.78 };
    } else if (v === 3) {
      k.cyl("wood", 0.4, 0.4, 0.04, 0, 0.72, 0, { seg: 14, color: 0x9a7a58 });
      k.cyl("metal", 0.03, 0.03, 0.7, 0, 0.36, 0, { seg: 6, color: 0x3a3a34 });
      k.cyl("metal", 0.22, 0.25, 0.03, 0, 0.015, 0, {
        seg: 10,
        color: 0x3a3a34,
      });
      k.meta.collider = { w: 0.8, d: 0.8, h: 0.75 };
    } else {
      const kk = v === 2 ? new X.Kit(101) : k;
      kk.boxB("wood", 1.4, 0.05, 0.85, 0, 0.72, 0, { color: 0x9a7a58 });
      for (const sx of [-0.62, 0.62])
        for (const sz of [-0.36, 0.36])
          kk.boxB("wood", 0.07, 0.72, 0.07, sx, 0, sz, { color: 0x7a5a40 });
      if (v === 2) {
        k.include(kk, { y: 0.45, z: 0.35, rx: PI / 2 + 0.05 });
        k.meta.collider = { w: 1.4, d: 0.8, h: 0.9 };
      } else k.meta.collider = { w: 1.4, d: 0.85, h: 0.77 };
    }
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });
  // chair: 0 diner chrome/vinyl, 1 wooden, 2 office swivel, 3 knocked-over wooden
  D("chair", (k, r, v) => {
    if (v === 0) {
      const vin = { color: [0xa02a2a, 0x2a6a6a, 0xd8c8a0][(r() * 3) | 0] };
      k.cbox(
        "fabric",
        0.45,
        0.08,
        0.45,
        0,
        0.46,
        0,
        Object.assign({ bevel: 0.03 }, vin),
      );
      k.cbox(
        "fabric",
        0.42,
        0.35,
        0.06,
        0,
        0.72,
        0.2,
        Object.assign({ bevel: 0.03, rx: -0.1 }, vin),
      );
      for (const sx of [-0.19, 0.19]) {
        k.seg("metal", [sx, 0, -0.2], [sx, 0.44, -0.18], 0.012, {
          color: C.chrome,
        });
        k.seg("metal", [sx, 0, 0.2], [sx, 0.9, 0.24], 0.012, {
          color: C.chrome,
        });
      }
    } else if (v === 2) {
      k.cbox("fabric", 0.5, 0.1, 0.48, 0, 0.5, 0, {
        bevel: 0.04,
        color: 0x3a3a34,
      });
      k.cbox("fabric", 0.46, 0.5, 0.08, 0, 0.85, 0.22, {
        bevel: 0.04,
        color: 0x3a3a34,
        rx: -0.12,
      });
      k.cyl("metal", 0.03, 0.03, 0.4, 0, 0.25, 0, { seg: 6, color: 0x5a5a52 });
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * X.TAU;
        k.seg(
          "metal",
          [0, 0.05, 0],
          [Math.cos(a) * 0.3, 0.04, Math.sin(a) * 0.3],
          0.015,
          { color: 0x3a3a34 },
        );
      }
    } else {
      const kk = v === 3 ? new X.Kit(111) : k;
      const w = { color: 0x8a6a48 };
      kk.boxB("wood", 0.44, 0.04, 0.42, 0, 0.44, 0, w);
      for (const sx of [-0.19, 0.19])
        for (const sz of [-0.18, 0.18])
          kk.boxB("wood", 0.04, 0.44, 0.04, sx, 0, sz, w);
      for (const sx of [-0.19, 0.19])
        kk.boxB("wood", 0.04, 0.5, 0.04, sx, 0.48, 0.18, w);
      for (let i = 0; i < 3; i++)
        kk.box("wood", 0.38, 0.05, 0.02, 0, 0.6 + i * 0.13, 0.18, w);
      if (v === 3) k.include(kk, { y: 0.21, rz: PI / 2 - 0.1, ry: r() });
    }
    k.meta.surface = "wood";
    k.meta.tier = "small";
  });

  // ---------------- market stall ----------------
  D("market_stall", (k, r, v) => {
    const W = 2.6,
      Dp = 1.4,
      H = 2.4;
    const wood = { color: 0x7a6040 };
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        k.boxB(
          "wood",
          0.1,
          H + (sz > 0 ? 0.2 : 0),
          0.1,
          (sx * W) / 2,
          0,
          (sz * Dp) / 2,
          wood,
        );
    // counter
    k.boxB("wood", W, 0.9, 0.5, 0, 0, -Dp / 2 + 0.25, { color: 0x8a6a48 });
    k.boxB("wood", W + 0.1, 0.05, 0.6, 0, 0.9, -Dp / 2 + 0.25, {
      color: 0x9a7a58,
    });
    // striped awning (alternating colours via colorFn)
    const cols = [
      [0xc84a3a, 0xe8e0d0],
      [0x3a6a8a, 0xe8e0d0],
      [0x5a7a3a, 0xd8c8a0],
      [0xb88a2a, 0x3a3a3a],
    ][v % 4];
    k.box("fabric", W + 0.4, 0.04, Dp + 0.5, 0, H + 0.1, -0.1, {
      rx: 0.18,
      segs: [12, 1, 1],
      colorFn: (x) => (Math.floor((x + 5) * 2.2) % 2 ? cols[0] : cols[1]),
    });
    for (let i = 0; i < 9; i++)
      k.box(
        "fabric",
        (W + 0.4) / 9 - 0.02,
        0.18,
        0.02,
        -W / 2 - 0.2 + ((i + 0.5) * (W + 0.4)) / 9,
        H - 0.09,
        -Dp / 2 - 0.34,
        { color: i % 2 ? cols[0] : cols[1] },
      );
    // shop sign
    k.quad(
      "stall_" + (v % X.STALL_SIGNS),
      1.8,
      0.45,
      0,
      H - 0.45,
      -Dp / 2 - 0.3,
      { ry: PI },
    );
    // goods on the counter
    for (let i = 0; i < 8; i++) {
      const x = -W / 2 + 0.25 + i * 0.3,
        t = r();
      if (t < 0.35)
        k.cyl("metal", 0.04, 0.04, 0.12, x, 1.0, -Dp / 2 + 0.2, {
          seg: 8,
          color: [0xb02020, 0x8a8a80, 0xc8a030][(r() * 3) | 0],
          rust: 0.4,
        });
      else if (t < 0.6)
        k.lathe(
          "glass",
          [
            [0, 0],
            [0.035, 0],
            [0.04, 0.12],
            [0.015, 0.2],
            [0, 0.2],
          ],
          x,
          0.95,
          -Dp / 2 + 0.25,
          { seg: 6, color: v === 1 ? 0x6a9ab0 : 0x5a1a10 },
        );
      else if (t < 0.8)
        k.boxB("plain", 0.2, 0.14, 0.14, x, 0.95, -Dp / 2 + 0.25, {
          color: [0xd8c040, 0x2a70c0, 0xc05030][(r() * 3) | 0],
        });
      else
        k.box("rust", 0.25, 0.05, 0.15, x, 0.97, -Dp / 2 + 0.25, {
          ry: r(),
          color: 0xffffff,
        });
    }
    // back shelf with crates & hanging goods
    X.crate(k, r, (r() * 5) | 0, -0.7, 0, Dp / 2 - 0.3, 0.1, 0.8);
    X.crate(k, r, (r() * 5) | 0, 0.4, 0, Dp / 2 - 0.3, -0.1, 0.8);
    k.seg(
      "wood",
      [-W / 2, H - 0.3, Dp / 2 - 0.05],
      [W / 2, H - 0.3, Dp / 2 - 0.05],
      0.02,
      wood,
    );
    for (let i = 0; i < 4; i++)
      k.sphere("plain", 0.08, -0.9 + i * 0.6, H - 0.55, Dp / 2 - 0.05, {
        s: [0.7, 1.6, 0.7],
        color: 0x6a3a1a,
        wseg: 6,
        hseg: 4,
      });
    k.meta.glows = [
      { x: 0, y: H - 0.2, z: -0.2, color: 0xffc070, size: 3.5, flicker: 0.15 },
    ];
    k.sphere("glow", 0.05, 0, H - 0.2, -0.2, {
      color: C.bulbWarm,
      wseg: 6,
      hseg: 4,
    });
    k.meta.colliders = [
      { w: W, d: 0.55, h: 0.95, cz: -Dp / 2 + 0.25 },
      { w: 0.15, d: 0.15, h: H, cx: -W / 2, cz: Dp / 2 },
      { w: 0.15, d: 0.15, h: H, cx: W / 2, cz: Dp / 2 },
    ];
    k.meta.interactY = 1.0;
    k.meta.tier = "medium";
  });

  // ---------------- teddy bear ----------------
  D("teddy_bear", (k, r, v) => {
    const fur = {
      color: [0x8a6a4a, 0xa88a5a, 0x6a5a4a][v % 3],
      grime: 0.35,
      wseg: 8,
      hseg: 6,
    };
    k.sphere(
      "fabric",
      0.12,
      0,
      0.14,
      0,
      Object.assign({ s: [1, 1.15, 0.85] }, fur),
    );
    k.sphere("fabric", 0.09, 0, 0.33, -0.01, fur);
    for (const s of [-1, 1]) {
      k.sphere("fabric", 0.035, s * 0.07, 0.41, 0, fur);
      k.sphere(
        "fabric",
        0.045,
        s * 0.12,
        0.2,
        -0.04,
        Object.assign({ s: [1, 1.5, 1] }, fur),
      );
      k.sphere(
        "fabric",
        0.05,
        s * 0.07,
        0.05,
        -0.07,
        Object.assign({ s: [1, 0.8, 1.4] }, fur),
      );
      k.sphere("plain", 0.012, s * 0.03, 0.35, -0.085, {
        color: 0x111111,
        wseg: 4,
        hseg: 3,
      });
    }
    k.sphere("fabric", 0.035, 0, 0.31, -0.085, {
      color: 0xc8b090,
      wseg: 6,
      hseg: 4,
    });
    k.meta.interactY = 0.2;
    k.meta.tier = "small";
  });

  // ---------------- World's Fair medallion ----------------
  // One of the twenty bronze medallions struck for the 1964 New York World's Fair, standing in a little
  // walnut easel stand. The relief changes with the variant: 0 the globe with its meridian ring,
  // 1 the observation towers, 2 the monorail, 3 the fountain sunburst (v = medallion index 0-19).
  D("medallion", (k, r, v) => {
    const bronze = { color: 0xb07a3a, rust: 0.15, grime: 0.2 };
    const relief = { color: 0xd8a860, rust: 0.1, grime: 0.1 };
    k.cbox("wood", 0.14, 0.025, 0.09, 0, 0.0125, 0.01, {
      bevel: 0.006,
      color: 0x5a3a24,
    });
    k.box("wood", 0.03, 0.12, 0.012, 0, 0.07, 0.035, {
      rx: 0.25,
      color: 0x4a3020,
    });
    k.box("metal", 0.1, 0.01, 0.012, 0, 0.03, -0.015, { color: 0x8a6a3a });
    const M = new X.Kit(91);
    M.cyl(
      "metal",
      0.055,
      0.055,
      0.008,
      0,
      0,
      0,
      Object.assign({ rx: PI / 2, seg: 20 }, bronze),
    );
    M.torus(
      "metal",
      0.051,
      0.004,
      0,
      0,
      -0.004,
      Object.assign({ rseg: 4, tseg: 20 }, relief),
    );
    const m = v % 4;
    if (m === 0) {
      M.sphere(
        "metal",
        0.025,
        0,
        0.004,
        -0.004,
        Object.assign({ wseg: 10, hseg: 6, s: [1, 1, 0.3] }, relief),
      );
      M.torus(
        "metal",
        0.033,
        0.002,
        0,
        0.004,
        -0.006,
        Object.assign({ s: [0.45, 1, 1], rseg: 3, tseg: 16 }, relief),
      );
      M.box("metal", 0.07, 0.003, 0.003, 0, 0.004, -0.007, relief);
      M.box("metal", 0.006, 0.02, 0.004, 0, -0.03, -0.005, relief);
    } else if (m === 1) {
      for (const s of [-1, 1])
        M.box("metal", 0.006, 0.07, 0.004, s * 0.012, -0.005, -0.006, relief);
      M.cyl(
        "metal",
        0.022,
        0.022,
        0.004,
        0,
        0.022,
        -0.007,
        Object.assign({ rx: PI / 2, seg: 12, s: [1, 0.4, 1] }, relief),
      );
      M.cyl(
        "metal",
        0.014,
        0.014,
        0.004,
        0.02,
        0.004,
        -0.007,
        Object.assign({ rx: PI / 2, seg: 10, s: [1, 0.4, 1] }, relief),
      );
    } else if (m === 2) {
      M.box("metal", 0.08, 0.005, 0.004, 0, 0.012, -0.006, relief);
      M.cbox(
        "metal",
        0.05,
        0.016,
        0.004,
        0.005,
        0.0,
        -0.007,
        Object.assign({ bevel: 0.006 }, relief),
      );
      for (const x of [-0.025, 0.025])
        M.box("metal", 0.004, 0.035, 0.004, x, -0.025, -0.006, relief);
    } else {
      for (let i = 0; i < 12; i++) {
        const a = (i * X.TAU) / 12;
        M.box(
          "metal",
          0.003,
          0.018,
          0.004,
          Math.cos(a) * 0.026,
          Math.sin(a) * 0.026,
          -0.006,
          Object.assign({ rz: a - PI / 2 }, relief),
        );
      }
      M.cyl(
        "metal",
        0.012,
        0.012,
        0.004,
        0,
        0,
        -0.007,
        Object.assign({ rx: PI / 2, seg: 10 }, relief),
      );
    }
    k.include(M, { y: 0.085, z: 0.0, rx: 0.25 });
    k.meta.glows = [
      { x: 0, y: 0.09, z: -0.03, color: 0xffd090, size: 0.5, flicker: 0 },
    ];
    k.meta.interactY = 0.08;
    k.meta.tier = "small";
  });

  // ---------------- Fizzo bottles ----------------
  // Tall, straight-sided ribbed bottle with a long neck, a paper label band and a crown cap.
  function fizzoProfile() {
    const pts = [
      [0, 0],
      [0.03, 0],
      [0.033, 0.006],
    ];
    for (let i = 0; i < 11; i++)
      pts.push([i % 2 ? 0.0315 : 0.034, 0.012 + i * 0.012]);
    pts.push(
      [0.033, 0.16],
      [0.026, 0.18],
      [0.013, 0.205],
      [0.011, 0.255],
      [0.0135, 0.258],
      [0, 0.26],
    );
    return pts;
  }
  // Fizzo Blue: the electric-blue bottle that glows
  D("fizzo_blue", (k, r, v) => {
    k.lathe("glow", fizzoProfile(), 0, 0, 0, { seg: 10, color: 0x40c8ff });
    k.cyl("plain", 0.0345, 0.0345, 0.035, 0, 0.17, 0, {
      seg: 10,
      color: 0xe8f0ff,
      open: true,
    });
    k.cyl("metal", 0.014, 0.014, 0.01, 0, 0.264, 0, {
      seg: 8,
      color: 0xc8c8c0,
    });
    k.meta.glows = [
      { x: 0, y: 0.12, z: 0, color: 0x40d0ff, size: 1.1, flicker: 0 },
    ];
    k.meta.interactY = 0.12;
    k.meta.tier = "small";
  });
  // a plain Fizzo Cola bottle (decor / pickups)
  D("fizzo_bottle", (k, r, v) => {
    k.lathe("glass", fizzoProfile(), 0, 0, 0, { seg: 10, color: 0x4a1208 });
    k.cyl("plain", 0.0345, 0.0345, 0.035, 0, 0.17, 0, {
      seg: 10,
      color: 0xe8e0d0,
      open: true,
    });
    k.cyl("plain", 0.0347, 0.0347, 0.008, 0, 0.158, 0, {
      seg: 10,
      color: 0xc0141a,
      open: true,
    });
    k.cyl("metal", 0.014, 0.014, 0.01, 0, 0.264, 0, {
      seg: 8,
      color: 0xc8b070,
    });
    k.meta.tier = "small";
  });
})();
