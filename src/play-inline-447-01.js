// play-inline-447 01 — color
// Lines 21-147 of readable/play-inline-447.pretty.js (statement-aligned).
  "use strict";
  const G = window.G;
  const X = G.props._;
  const C = X.PAL;
  const D = X.defineProto;
  const PI = Math.PI;

  const RED = 0xb02a1e,
    CREAM = 0xe2d6b8,
    BLACK = 0x1c1b19;
  const W = 22,
    DP = 16; // pad (x × z)
  const CAN = { x: 2, z: -3, w: 13, d: 7.6, y: 4.0, t: 0.55 }; // canopy
  const POSTS = [-3.6, 7.6]; // canopy columns (x, on the island)
  const PUMPS = [-1.2, 2.0, 5.2]; // pump x positions on the island
  const OFF = { x0: -10.6, x1: -4.6, z0: 3, z1: 7.6, h: 3.3 }; // office
  const BAY = { x0: -4.6, x1: 2.6, z0: 3, z1: 7.6, h: 3.9 }; // service bay
  const POLE = { x: 9.8, z: -6.9, h: 8.6 };

  function pump(k, r, x, y, z, broken, globe) {
    const red = { color: RED, rust: 0.45, grime: 0.45 },
      cream = { color: CREAM, rust: 0.4, grime: 0.4 };
    k.cbox(
      "paint",
      0.7,
      1.45,
      0.5,
      x,
      y + 0.725,
      z,
      Object.assign({ bevel: 0.06 }, red),
    ); // square-shouldered body
    k.cbox(
      "metal",
      0.76,
      0.12,
      0.56,
      x,
      y + 1.5,
      z,
      Object.assign({ bevel: 0.03 }, cream),
    ); // crown
    k.box("metal", 0.74, 0.12, 0.54, x, y + 0.06, z, {
      color: BLACK,
      rust: 0.5,
    }); // plinth
    for (const s of [-1, 1])
      k.quad("hioctane_pump", 0.56, 0.93, x, y + 0.86, z + s * 0.252, {
        ry: s > 0 ? 0 : PI,
        grime: 0.3,
      });
    // lamp globe on a collar (cream with the red band; some smashed to a jagged cup)
    k.cyl("metal", 0.09, 0.11, 0.08, x, y + 1.6, z, {
      seg: 10,
      color: CREAM,
      rust: 0.4,
    });
    if (globe === "whole") {
      k.sphere("plain", 0.2, x, y + 1.8, z, {
        wseg: 12,
        hseg: 8,
        color: 0xe8e2d4,
        grime: 0.3,
      });
      k.cyl("plain", 0.205, 0.205, 0.07, x, y + 1.8, z, {
        seg: 12,
        color: RED,
      });
    } else if (globe === "broken") {
      k.sphere("plain", 0.2, x, y + 1.8, z, {
        wseg: 12,
        hseg: 4,
        phiStart: PI * 0.55,
        phiLength: PI * 0.45,
        color: 0xe8e2d4,
        grime: 0.4,
      });
    }
    // hose from the side to the nozzle in its holster
    const hs = r() < 0.5 ? -1 : 1;
    k.box("metal", 0.08, 0.26, 0.12, x + hs * 0.39, y + 1.05, z - 0.1, {
      color: 0x9a9a92,
      rust: 0.6,
    }); // holster
    if (broken) {
      // nozzle torn out, hose lying on the pad
      k.seg(
        "plain",
        [x + hs * 0.36, y + 0.5, z],
        [x + hs * 1.3, 0.04, z - 0.9],
        0.025,
        { color: BLACK, seg: 5 },
      );
      k.seg(
        "plain",
        [x + hs * 1.3, 0.04, z - 0.9],
        [x + hs * 0.6, 0.04, z - 1.8],
        0.025,
        { color: BLACK, seg: 5 },
      );
      k.box("metal", 0.07, 0.07, 0.3, x + hs * 0.6, 0.05, z - 1.9, {
        color: 0x8a8a80,
        rust: 0.6,
        ry: 0.4,
      });
    } else {
      k.seg(
        "plain",
        [x + hs * 0.36, y + 0.55, z],
        [x + hs * 0.5, y + 0.25, z - 0.05],
        0.025,
        { color: BLACK, seg: 5 },
      );
      k.seg(
        "plain",
        [x + hs * 0.5, y + 0.25, z - 0.05],
        [x + hs * 0.43, y + 1.0, z - 0.1],
        0.025,
        { color: BLACK, seg: 5 },
      );
      k.box("metal", 0.06, 0.06, 0.22, x + hs * 0.43, y + 1.12, z - 0.12, {
        color: 0x8a8a80,
        rust: 0.5,
      });
    }
  }

