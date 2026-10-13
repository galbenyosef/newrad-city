// play-inline-449 01 — color
// Lines 13-233 of readable/play-inline-449.pretty.js (statement-aligned).
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
